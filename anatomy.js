/* BodyParts3D anatomical meshes, rendered with Three.js. See ATTRIBUTION.md. */
(async () => {
  'use strict';
  const canvas=document.getElementById('anatomy-3d'),message=document.getElementById('model-status');
  try {
    message.textContent='Loading detailed anatomical models…';
    const bytes=Uint8Array.from(atob(window.ANATOMY_DATA_GZIP),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const buffer=await new Response(stream).arrayBuffer(),headerSize=new DataView(buffer).getUint32(0,true);
    const models=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,4,headerSize)));let offset=4+headerSize;
    for(const m of models){const quantized=new Int16Array(buffer,offset,m.vc);m.v=Float32Array.from(quantized,x=>x/10);offset+=m.vc*2;offset=Math.ceil(offset/4)*4;m.f=new Uint32Array(buffer,offset,m.fc);offset+=m.fc*4;}

    const T=window.THREE,renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
    const scene=new T.Scene(),camera=new T.OrthographicCamera(-400,400,380,-380,.1,3000);camera.position.set(0,0,1500);camera.lookAt(0,0,0);
    scene.add(new T.HemisphereLight(0xdaf3ff,0x182d45,.8));
    const key=new T.DirectionalLight(0xe7f4ff,1.9);key.position.set(-400,650,650);scene.add(key);
    const rim=new T.DirectionalLight(0x4aa8ff,1.8);rim.position.set(500,80,-250);scene.add(rim);
    const fill=new T.DirectionalLight(0xa4cfff,.8);fill.position.set(350,-180,500);scene.add(fill);
    const body=new T.Group(),brain=new T.Group();scene.add(body,brain);
    const bodyCenter=new T.Vector3(0,850,70),brainCenter=new T.Vector3();
    const layers={skin:[],skeleton:[],nerves:[],organs:[]},geometry={};
    const materials={
      skin:new T.MeshPhysicalMaterial({color:0x80c5ed,roughness:.38,metalness:.05,transparent:true,opacity:.09,depthWrite:false,side:T.FrontSide}),
      skeleton:new T.MeshStandardMaterial({color:0xe0ded0,roughness:.64,metalness:.03}),
      brain:new T.MeshStandardMaterial({color:0xc4b5b1,roughness:.68,metalness:0}),
      cord:new T.MeshStandardMaterial({color:0x94daeb,roughness:.45}),
      nerves:new T.MeshStandardMaterial({color:0x62d8f4,emissive:0x145f80,emissiveIntensity:.3,roughness:.5}),
      heart:new T.MeshStandardMaterial({color:0xb26377,roughness:.46}),
      adrenals:new T.MeshStandardMaterial({color:0xe6bb7a,roughness:.5}),
      eyes:new T.MeshStandardMaterial({color:0xdce7eb,roughness:.28})
    };
    for(const model of models){
      const geo=new T.BufferGeometry(),verts=new Float32Array(model.v.length);
      for(let i=0;i<model.v.length;i+=3){verts[i]=model.v[i];verts[i+1]=model.v[i+2];verts[i+2]=-model.v[i+1];}
      geo.setAttribute('position',new T.BufferAttribute(verts,3));geo.setIndex(new T.BufferAttribute(model.f,1));geo.computeVertexNormals();geo.computeBoundingBox();geometry[model.id]=geo;
    }
    geometry.brain.boundingBox.getCenter(brainCenter);
    for(const model of models){
      const geo=geometry[model.id],center=bodyCenter;geo.translate(-center.x,-center.y,-center.z);
      const mesh=new T.Mesh(geo,materials[model.id]);body.add(mesh);
      const layer=model.id==='skin'?'skin':model.id==='skeleton'?'skeleton':['nerves','cord'].includes(model.id)?'nerves':'organs';layers[layer].push(mesh);
      if(model.id==='brain'){
        const enlarged=geo.clone();enlarged.translate(bodyCenter.x-brainCenter.x,bodyCenter.y-brainCenter.y,bodyCenter.z-brainCenter.z);brain.add(new T.Mesh(enlarged,materials.brain));
      }
    }
    body.position.set(155,-40,0);body.scale.setScalar(.35);
    brain.position.set(-185,180,50);brain.scale.setScalar(1.65);
    let rotation=0;brain.rotation.y=-.6;
    const bodyAnchors={heart:new T.Vector3(),adrenals:new T.Vector3(),eyes:new T.Vector3(),ears:new T.Vector3(-82,645,10),behavior:new T.Vector3(370,-480,0)};
    for(const id of ['heart','adrenals','eyes'])geometry[id].boundingBox.getCenter(bodyAnchors[id]);
    // Reading-topic pins are conceptual locations; internal regions are not visible cortical surfaces.
    const brainAnchors={frontal:new T.Vector3(-45,20,62),amygdala:new T.Vector3(-21,-26,50),hypothalamus:new T.Vector3(12,-42,25),hippocampus:new T.Vector3(45,-22,32),reward:new T.Vector3(3,5,55)};
    function updatePins(){
      body.updateMatrixWorld(true);brain.updateMatrixWorld(true);window.anatomyPositions={};
      for(const [id,p] of Object.entries({...bodyAnchors,...brainAnchors})){
        const group=id in brainAnchors?brain:body,point=group.localToWorld(p.clone()).project(camera);
        window.anatomyPositions[id]={x:(point.x+1)*400,y:(1-point.y)*380};
      }
      // Screen-space spacing keeps controls selectable in narrow and side views.
      const entries=Object.values(window.anatomyPositions),distance=Math.max(42,800/canvas.clientWidth*38);
      for(let step=0;step<24;step++)for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
        const a=entries[i],b=entries[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01;if(d<distance){const push=(distance-d)/2+.1,ux=d===.01?1:dx/d,uy=dy/d;a.x-=ux*push;a.y-=uy*push;b.x+=ux*push;b.y+=uy*push;}
      }
      window.dispatchEvent(new Event('anatomy-rendered'));
    }
    function render(){
      const w=canvas.clientWidth;renderer.setSize(w,w*760/800,false);
      for(const [layer,meshes] of Object.entries(layers))for(const m of meshes)m.visible=document.getElementById('layer-'+layer).checked;
      body.rotation.y=rotation;brain.rotation.y=rotation-.6;updatePins();renderer.render(scene,camera);
    }
    document.getElementById('rotate-left').onclick=()=>{rotation-=Math.PI/8;render();};
    document.getElementById('rotate-right').onclick=()=>{rotation+=Math.PI/8;render();};
    document.getElementById('rotate-reset').onclick=()=>{rotation=0;render();};
    document.querySelectorAll('[data-layer]').forEach(input=>input.addEventListener('change',render));
    new ResizeObserver(render).observe(canvas);render();
    message.textContent='Anatomical models: BodyParts3D / DBCLS · rotate with the arrows';
  } catch(error) {
    message.textContent='The 3D viewer could not load. Try a current browser with WebGL enabled. All reading entries remain available below.';
    console.error('Anatomy viewer:',error);
  }
})();
