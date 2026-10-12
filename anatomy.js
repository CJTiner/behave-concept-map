/* Original procedural 3D meshes and a small, dependency-free software renderer.
   All vertices have x/y/z coordinates. Faces are rotated, lit and depth-sorted.
   This is a conceptual anatomical model, not a clinical reconstruction. */
(() => {
  'use strict';
  const canvas=document.getElementById('anatomy-3d'),ctx=canvas.getContext('2d');
  const faces=[], models={brain:{cx:218,cy:178},body:{cx:510,cy:430}};
  let angle=-0.16;
  function surface(group,point,color,nu=36,nv=24,opacity=1){
    const grid=[];
    for(let j=0;j<=nv;j++){grid[j]=[];for(let i=0;i<=nu;i++)grid[j][i]=point(i/nu*Math.PI*2,j/nv*Math.PI);}
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
      faces.push({group,vertices:[grid[j][i],grid[j+1][i],grid[j][i+1]],color,opacity});
      faces.push({group,vertices:[grid[j][i+1],grid[j+1][i],grid[j+1][i+1]],color,opacity});
    }
  }
  function ellipsoid(group,x,y,z,rx,ry,rz,color,opacity=1,folds=false){
    surface(group,(u,v)=>{
      let r=1;
      if(folds){const groove=Math.sin(8*u+1.4*Math.sin(4*v))*Math.sin(8*v+1.1*Math.cos(4*u));r+=.014*Math.sin(3*u+4*v)+.045*groove;}
      return [x+rx*Math.cos(u)*Math.sin(v)*r,y+ry*Math.cos(v)*r,z+rz*Math.sin(u)*Math.sin(v)*r];
    },color,folds?100:32,folds?72:22,opacity);
  }
  // Two fully rounded, folded hemispheres with a medial fissure.
  ellipsoid('brain',174,170,0,76,88,70,[104,176,215],1,true);
  ellipsoid('brain',263,170,0,76,88,70,[104,176,215],1,true);
  ellipsoid('brain',244,260,-13,52,28,36,[89,150,194],1,true);
  ellipsoid('brain',226,280,-5,14,35,17,[123,184,211]);
  // Torso is one continuous mesh of elliptical cross sections.
  const rings=[[282,18,21],[300,39,28],[320,72,34],[350,64,35],[390,57,32],[430,46,28],[470,48,29],[505,56,33],[535,46,28],[550,29,24]];
  const torso=[];
  for(let j=0;j<rings.length;j++){torso[j]=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;torso[j].push([510+Math.cos(a)*rings[j][1],rings[j][0],Math.sin(a)*rings[j][2]]);}}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<48;i++)for(const t of [[torso[j][i],torso[j+1][i],torso[j][i+1]],[torso[j][i+1],torso[j+1][i],torso[j+1][i+1]]])faces.push({group:'body',vertices:t,color:[97,160,202],opacity:.12});
  ellipsoid('body',510,194,0,48,66,43,[127,191,220],.12);
  ellipsoid('body',510,267,0,20,29,22,[110,176,207],.12);
  function limb(ax,ay,bx,by,r,rz){const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy);surface('body',(u,v)=>{const along=Math.cos(v)*len/2,rad=Math.sin(v)*r;return [(ax+bx)/2+dx/len*along+dy/len*Math.cos(u)*rad,(ay+by)/2+dy/len*along-dx/len*Math.cos(u)*rad,Math.sin(u)*Math.sin(v)*rz];},[110,178,214],28,24,.12);}
  limb(444,319,417,407,20,21);limb(417,404,395,492,15,16);limb(575,319,602,407,20,21);limb(602,404,625,492,15,16);
  limb(481,522,478,618,25,27);limb(478,610,476,710,17,20);limb(539,522,542,618,25,27);limb(542,610,544,710,17,20);
  for (const [x,y,rx,ry,rz] of [[447,329,19,20,20],[574,329,19,20,20],[417,405,14,17,15],[602,405,14,17,15],[394,484,11,17,11],[626,484,11,17,11],[481,541,23,25,25],[539,541,23,25,25],[478,615,16,20,19],[542,615,16,20,19],[476,702,12,19,16],[544,702,12,19,16]]) ellipsoid('body',x,y,0,rx,ry,rz,[106,177,213],.12);
  ellipsoid('body',473,718,10,20,12,33,[103,176,218],.16);ellipsoid('body',547,718,10,20,12,33,[103,176,218],.16);
  ellipsoid('body',391,498,1,13,23,12,[125,190,222],.14);ellipsoid('body',629,498,1,13,23,12,[125,190,222],.14);
  // Internal shapes visible through the translucent shell.
  ellipsoid('body',480,391,7,20,43,16,[74,132,183],.7);ellipsoid('body',540,391,7,20,43,16,[74,132,183],.7);
  ellipsoid('body',507,405,30,17,24,16,[171,218,240]);
  ellipsoid('body',467,469,14,12,20,13,[118,193,225]);ellipsoid('body',552,469,14,12,20,13,[118,193,225]);
  ellipsoid('body',467,445,19,12,7,9,[203,232,255]);ellipsoid('body',552,445,19,12,7,9,[203,232,255]);
  ellipsoid('body',497,183,39,7,5,5,[216,242,255]);ellipsoid('body',534,183,39,7,5,5,[216,242,255]);
  ellipsoid('body',558,207,0,7,14,11,[172,218,239]);

  // Skeleton: skull, vertebral column, ribs, pelvis and articulated limbs.
  const bone=[211,228,233],nerve=[68,216,245];
  function tube(group,points,r,color,opacity=1){
    for(let k=0;k<points.length-1;k++){
      const a=points[k],b=points[k+1],d=b.map((x,i)=>x-a[i]),len=Math.hypot(...d)||1,axis=d.map(x=>x/len);
      let e=[axis[1],-axis[0],0],el=Math.hypot(...e);if(el<.01){e=[1,0,0];el=1;}e=e.map(x=>x/el);
      const f=[axis[1]*e[2]-axis[2]*e[1],axis[2]*e[0]-axis[0]*e[2],axis[0]*e[1]-axis[1]*e[0]];
      const ring=(p,i)=>{const t=i/10*Math.PI*2;return p.map((x,j)=>x+r*(e[j]*Math.cos(t)+f[j]*Math.sin(t)));};
      for(let i=0;i<10;i++){const aa=ring(a,i),ab=ring(a,i+1),ba=ring(b,i),bb=ring(b,i+1);for(const vertices of [[aa,ba,ab],[ab,ba,bb]])faces.push({group,vertices,color,opacity});}
    }
  }
  // Rounded cortical ridges follow the surface of each hemisphere in 3D.
  for(const cx of [174,263])for(let band=0;band<8;band++){
    const pts=[];
    for(let i=0;i<=65;i++){
      const v=.2+i/65*2.72,u=.2+band*.39+.075*Math.sin(v*8+band)+.04*Math.sin(v*15+band*.7);
      pts.push([cx+77*Math.cos(u)*Math.sin(v),170+89*Math.cos(v),72*Math.sin(u)*Math.sin(v)]);
    }
    tube('brain',pts,2.3,[137,198,226]);
  }
  ellipsoid('body',510,182,-1,35,43,32,bone,.82);
  ellipsoid('body',497,190,29,10,10,5,[8,25,44]);ellipsoid('body',525,190,29,10,10,5,[8,25,44]);
  ellipsoid('body',511,206,29,5,8,3,[12,30,44]);
  tube('body',[[482,205,15],[487,230,19],[510,239,22],[533,230,19],[538,205,15]],4,bone);
  for(let x=496;x<528;x+=5)ellipsoid('body',x,226,26,2,4,3,bone);
  for(let y=257;y<515;y+=12)ellipsoid('body',510,y,-12,7,4.5,8,bone);
  tube('body',[[510,245,-10],[510,306,-11],[510,390,-12],[510,483,-10],[510,525,-7]],3,nerve);
  for(const side of [-1,1]){
    tube('body',[[510,320,20],[510+side*27,313,20],[510+side*57,326,5]],4,bone);
    for(let j=0;j<9;j++){
      const pts=[],y=339+j*12,rx=49-j*1.7;
      for(let i=0;i<=16;i++){const a=i/16*Math.PI;pts.push([510+side*Math.sin(a)*rx,y+Math.sin(a)*7, -13+Math.sin(a/2)*43]);}
      tube('body',pts,2.4,bone,.9);
    }
    const hip=[];for(let i=0;i<=30;i++){const a=i/30*Math.PI*2;hip.push([510+side*28+Math.cos(a)*20,513+Math.sin(a)*27,Math.sin(a)*9]);}tube('body',hip,6,bone);
    const shoulder=[510+side*59,333,0],elbow=[510+side*91,405,0],wrist=[510+side*112,481,0],hipPoint=[510+side*28,537,0],knee=[510+side*31,615,0],ankle=[510+side*33,703,0];
    tube('body',[shoulder,elbow],5,bone);tube('body',[[elbow[0]-3,405,1],[wrist[0]-3,481,1]],3,bone);tube('body',[[elbow[0]+4,405,-2],[wrist[0]+4,481,-2]],2,bone);
    tube('body',[hipPoint,knee],7,bone);tube('body',[knee,ankle],5,bone);tube('body',[[knee[0]+side*7,615,-2],[ankle[0]+side*6,703,-2]],2,bone);
    for(const joint of [shoulder,elbow,wrist,hipPoint,knee,ankle])ellipsoid('body',...joint,7,7,7,bone);
    for(let f=0;f<5;f++){const x=wrist[0]+(f-2)*4;tube('body',[[wrist[0],481,0],[x,497,3],[x+side*(f-2),511-Math.abs(f-2)*2,5]],1.5,bone);tube('body',[[ankle[0],703,0],[ankle[0]+(f-2)*4,718,20],[ankle[0]+(f-2)*4,719,32]],2,bone);}
    // Paired peripheral nerves branch from the spinal cord into torso and limbs.
    tube('body',[[510,305,12],[shoulder[0],335,15],[elbow[0],405,13],[wrist[0],481,11]],1.8,nerve);
    tube('body',[[510,491,12],[hipPoint[0],542,15],[knee[0],615,13],[ankle[0],707,12]],2,nerve);
    for(let j=0;j<9;j++){const y=333+j*18;tube('body',[[510,y,15],[510+side*20,y+7,32],[510+side*(44-j),y+15,29]],1,nerve);}
    for(let f=0;f<5;f++)tube('body',[[wrist[0],480,13],[wrist[0]+(f-2)*4,497,13],[wrist[0]+(f-2)*5,507,10]],.7,nerve);
    tube('body',[[510,260,12],[510+side*15,224,26],[510+side*17,183,34]],1.2,nerve);
  }
  tube('body',[[510,331,32],[510,422,33]],4,bone);
  // Small brain inside the skull, visible through the transparent head.
  ellipsoid('body',501,165,17,13,16,14,[111,173,212],.85,true);
  ellipsoid('body',520,165,17,13,16,14,[111,173,212],.85,true);
  function rotate(p,group){const m=models[group],x=p[0]-m.cx,z=p[2];return [m.cx+x*Math.cos(angle)+z*Math.sin(angle),p[1],-x*Math.sin(angle)+z*Math.cos(angle)];}
  function render(){
    const width=canvas.clientWidth,dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=width*760/800*dpr;ctx.setTransform(canvas.width/800,0,0,canvas.height/760,0,0);ctx.clearRect(0,0,800,760);
    const halo=ctx.createRadialGradient(380,330,10,380,330,380);halo.addColorStop(0,'#14345355');halo.addColorStop(1,'#05112200');ctx.fillStyle=halo;ctx.fillRect(0,0,800,760);
    ctx.strokeStyle='#81caff30';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(510,732,116,14,0,0,Math.PI*2);ctx.stroke();
    const projected=faces.map(f=>({...f,p:f.vertices.map(p=>rotate(p,f.group))}));projected.sort((a,b)=>a.p.reduce((s,p)=>s+p[2],0)-b.p.reduce((s,p)=>s+p[2],0));
    for(const f of projected){
      if(f.group==='body'){const key=f.color.join(',');const kind=key===bone.join(',')?'skeleton':key===nerve.join(',')?'nerves':f.opacity<.3?'skin':'organs';if(!document.getElementById('layer-'+kind).checked)continue;}
const [a,b,c]=f.p,u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n)||1;n=n.map(x=>x/len);if(n[2]<0)n=n.map(x=>-x);
      const light=Math.max(0,n[0]*-.45+n[1]*-.5+n[2]*.72),rim=Math.pow(1-Math.abs(n[2]),3),spec=Math.pow(Math.max(0,n[0]*-.2+n[1]*-.25+n[2]*.95),22);const rgb=f.color.map(x=>Math.min(255,Math.round(x*(.18+.72*light)+rim*45+spec*55)));
      ctx.fillStyle=`rgba(${rgb.join(',')},${f.opacity})`;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill();
    }
    ctx.fillStyle='#94b4cf';ctx.font='10px system-ui';ctx.fillText('BRAIN / 3D MESH',105,337);ctx.fillText('BODY / 3D MESH',440,756);
    window.anatomyPositions={};
    const anchors={frontal:[139,144,55,'brain'],amygdala:[185,218,60,'brain'],hypothalamus:[239,248,42,'brain'],hippocampus:[283,214,52,'brain'],reward:[224,169,67,'brain'],eyes:[498,184,46,'body'],ears:[564,210,10,'body'],heart:[507,401,46,'body'],adrenals:[555,445,31,'body'],behavior:[673,581,0,'body']};
    for(const [id,p] of Object.entries(anchors)){const q=rotate(p,p[3]);window.anatomyPositions[id]={x:q[0],y:q[1]};}
    // Keep touch targets distinct when a side view projects several points together.
    const entries=Object.entries(window.anatomyPositions),original=Object.fromEntries(entries.map(([id,p])=>[id,{...p}]));
    const minDistance=Math.max(43,800/width*38);
    for(let step=0;step<22;step++)for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
      const a=entries[i][1],b=entries[j][1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01;
      if(d<minDistance){const push=(minDistance-d)/2+.1,ux=d===.01?1:dx/d,uy=dy/d;a.x-=ux*push;a.y-=uy*push;b.x+=ux*push;b.y+=uy*push;}
    }
    ctx.strokeStyle='#c5ecff80';ctx.lineWidth=1;
    for(const [id,p] of entries){const o=original[id];if(Math.hypot(p.x-o.x,p.y-o.y)>5){ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(p.x,p.y);ctx.stroke();}}
    window.dispatchEvent(new Event('anatomy-rendered'));
  }
  document.getElementById('rotate-left').onclick=()=>{angle-=Math.PI/8;render();};
  document.getElementById('rotate-right').onclick=()=>{angle+=Math.PI/8;render();};
  document.getElementById('rotate-reset').onclick=()=>{angle=-.16;render();};
  document.querySelectorAll('[data-layer]').forEach(input=>input.addEventListener('change',render));
  new ResizeObserver(render).observe(canvas);render();
})();
