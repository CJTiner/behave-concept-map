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
    // Supplemental peripheral branches provide complete visual coverage.
    // These smooth illustrative routes are not source-derived clinical nerve meshes.
    const peripheral=new T.Group();body.add(peripheral);layers.nerves.push(peripheral);
    const nerveMaterial=new T.MeshBasicMaterial({color:0x20cfff,transparent:true,opacity:1,depthTest:false,depthWrite:false});
    function nerve(points,r=2){
      const curve=new T.CatmullRomCurve3(points.map(([x,h,d])=>new T.Vector3(x-bodyCenter.x,h-bodyCenter.y,d-bodyCenter.z)));
      const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*10),r*1.4,6,false),nerveMaterial);mesh.renderOrder=4;peripheral.add(mesh);
    }
    nerve([[0,1490,50],[0,1390,53],[0,1280,55],[0,1130,57],[0,1000,57],[0,890,62]],3);
    for(const side of [-1,1]){
      const sym=points=>points.map(([x,y,z])=>[x*side,y,z]);
      // Brachial plexus to arm, forearm and hand.
      nerve(sym([[0,1360,60],[60,1350,65],[125,1315,65],[178,1180,75],[226,1055,90],[267,920,110],[287,830,125]]),2.5);
      nerve(sym([[123,1308,67],[156,1200,94],[209,1075,120],[252,936,135],[274,835,150]]),1.5);
      nerve(sym([[162,1220,70],[202,1120,75],[228,1025,93],[284,829,118]]),1.5);
      for(let j=0;j<5;j++)nerve(sym([[283,835,128],[291+(j-2)*9,800,140],[293+(j-2)*13,756+Math.abs(j-2)*8,150]]),1.2);
      // Thoracic and abdominal segmental branches.
      for(let j=0;j<12;j++){const h=1300-j*25;nerve(sym([[0,h,58],[35,h-5,68],[82,h-12,100],[98-j*2,h-22,144]]),1.2);}
      // Lumbar/sacral plexus, legs, feet and toes.
      nerve(sym([[0,1000,58],[32,949,54],[63,880,54],[80,740,50],[86,570,52],[82,470,65],[85,270,83],[86,70,100],[95,-20,150]]),2.8);
      nerve(sym([[25,970,80],[68,870,125],[92,700,123],[92,510,125],[104,350,116],[105,100,120],[102,-24,170]]),1.6);
      nerve(sym([[82,490,60],[65,413,92],[66,258,109],[75,70,115],[90,-26,155]]),1.6);
      for(let j=0;j<5;j++)nerve(sym([[88,16,138],[89+(j-2)*8,-27,178],[90+(j-2)*10,-42,201]]),1.2);
      for(const h of [780,700,620,530,410,320,210])nerve(sym([[85,h,83],[110,h-35,100],[115,h-60,115]]),1);
      // Cervical and facial branching.
      nerve(sym([[0,1430,64],[25,1480,90],[54,1510,120],[47,1560,135]]),1.5);
      for(let j=0;j<4;j++)nerve(sym([[28,1490,90],[52,1487+j*13,130],[25+j*6,1462+j*21,168]]),1.2);
    }
    // Source-derived highlight meshes for named regions.
    const regionBytes=Uint8Array.from(atob(window.BRAIN_REGIONS_GZIP),c=>c.charCodeAt(0));
    const regions=JSON.parse(await new Response(new Blob([regionBytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
    const highlights={},highlightMaterial=new T.MeshStandardMaterial({color:0x40d9ff,emissive:0x009bdb,emissiveIntensity:.75,roughness:.4,depthTest:false,depthWrite:false,transparent:true,opacity:.95,side:T.DoubleSide});
    for(const [id,m] of Object.entries(regions)){
      const v=new Float32Array(m.v.length);for(let i=0;i<m.v.length;i+=3){v[i]=m.v[i]-brainCenter.x;v[i+1]=m.v[i+2]-brainCenter.y;v[i+2]=-m.v[i+1]-brainCenter.z;}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(v,3));geo.setIndex(m.f);geo.computeVertexNormals();geo.computeBoundingBox();
      const mesh=new T.Mesh(geo,highlightMaterial);mesh.visible=false;mesh.renderOrder=10;brain.add(mesh);highlights[id]=mesh;
    }
    // Reward circuitry is distributed: show several illustrative network nodes, not a single organ.
    const reward=new T.Group();const rewardPoints=[[-9,-23,25],[9,-23,25],[0,-43,-10],[-32,8,55],[32,8,55]];
    for(const p of rewardPoints){const m=new T.Mesh(new T.SphereGeometry(4,20,14),highlightMaterial);m.position.set(...p);m.renderOrder=10;reward.add(m);}
    const netMat=new T.LineBasicMaterial({color:0x5ae4ff,depthTest:false,transparent:true,opacity:.9});
    for(const [i,j] of [[0,2],[1,2],[0,3],[1,4]]){const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(...rewardPoints[i]),new T.Vector3(...rewardPoints[j])]),netMat);line.renderOrder=10;reward.add(line);}
    reward.visible=false;brain.add(reward);highlights.reward=reward;
    function selectHighlight(id){
      for(const [key,mesh] of Object.entries(highlights))mesh.visible=key===id;
      const active=!!highlights[id],inner=active&&id!=='frontal';
      materials.brain.transparent=inner;materials.brain.opacity=inner?.18:1;materials.brain.depthWrite=!inner;materials.brain.needsUpdate=true;
      const title=window.selectedConcept?.title||id;
      document.getElementById('highlight-status').textContent=active?(id==='reward'?'Reward circuitry · illustrative distributed network':title+(inner?' · X-ray highlight':' · highlighted')):'Select a brain topic to highlight its anatomy';
      canvas.dataset.highlight=active?id:'none';
    }
    window.addEventListener('concept-selected',e=>{selectHighlight(e.detail.id);render();});
    body.position.set(155,-40,0);body.scale.setScalar(.35);
    brain.position.set(-185,180,50);brain.scale.setScalar(1.65);
    let rotation=0;brain.rotation.y=-.6;
    const bodyAnchors={heart:new T.Vector3(),adrenals:new T.Vector3(),eyes:new T.Vector3(),ears:new T.Vector3(-82,645,10),behavior:new T.Vector3(370,-480,0)};
    for(const id of ['heart','adrenals','eyes'])geometry[id].boundingBox.getCenter(bodyAnchors[id]);
    // Reading-topic pins are conceptual locations; internal regions are not visible cortical surfaces.
    const brainAnchors={frontal:new T.Vector3(-45,20,62),amygdala:new T.Vector3(-21,-26,50),hypothalamus:new T.Vector3(12,-42,25),hippocampus:new T.Vector3(45,-22,32),reward:new T.Vector3(3,5,55)};
    for(const [id,mesh] of Object.entries(highlights)){if(mesh.geometry?.boundingBox)mesh.geometry.boundingBox.getCenter(brainAnchors[id]);}
    function updatePins(){
      body.updateMatrixWorld(true);brain.updateMatrixWorld(true);window.anatomyPositions={};
      for(const [id,p] of Object.entries({...bodyAnchors,...brainAnchors})){
        const group=id in brainAnchors?brain:body,point=group.localToWorld(p.clone()).project(camera);
        window.anatomyPositions[id]={x:(point.x+1)*400,y:(1-point.y)*380};
      }
      window.anatomyTargets=Object.fromEntries(Object.entries(window.anatomyPositions).map(([id,p])=>[id,{...p}]));
      Object.assign(window.anatomyPositions,{frontal:{x:62,y:83},amygdala:{x:50,y:265},hypothalamus:{x:212,y:374},hippocampus:{x:361,y:301},reward:{x:355,y:85}});
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
    selectHighlight(window.selectedConcept?.id||'frontal');new ResizeObserver(render).observe(canvas);render();
    message.textContent='Anatomical models: BodyParts3D / DBCLS · rotate with the arrows';
  } catch(error) {
    message.textContent='The 3D viewer could not load. Try a current browser with WebGL enabled. All reading entries remain available below.';
    console.error('Anatomy viewer:',error);
  }
})();
