'use strict';
// STARLANE MODERN — a real-time 3D renderer for the Modern style, built on three.js (bundled in js/vendor, loaded only
// when Modern is chosen, so the rest of the app stays light). It draws the space view into its own WebGL canvas, which
// Starlane then paints under its cockpit and HUD. Lit metal ships and stations, textured planets with clouds and
// atmospheres, a bloom glow, particle explosions, smoke and engine trails, and a deep starfield.
// Starlane's world uses the opposite handedness to three.js, so positions are mirrored on one axis (M below).
const StarModern=(()=>{
 let state='idle',T=null,R=null,scene=null,cam=null,cam2=null,comp=null,bloom=null,gl=null,quality={pr:1,bloom:true,views:true},slow=0,fast=0,lastSys=null,root=null;
 const objs=new Map(),geoCache=new WeakMap(),texCache={};let sunLights=[],bodies=[],nebula=null,cityMats=[],starField=null,fire=null,smoke=null,dustPts=null,bhGroup=null,stationGrp=null;
 const M=v=>[v[0],v[1],-v[2]];
 function load(){if(state!=='idle')return;state='loading';const s=document.createElement('script');s.src='js/vendor/three-bundle.js';s.onload=()=>{try{init();state='ready';}catch(e){console.error(e);state='failed';}};s.onerror=()=>{state='failed';};document.head.appendChild(s);}
 const ready=()=>state==='ready';
 // ---------------- textures drawn on canvases ----------------
 function cv(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.anisotropy=4;t.encoding=T.sRGBEncoding;return t;}
 const rnd=s=>{let x=s>>>0||1;return()=>{x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x/4294967296;};};
 function panelTex(){return texCache.panel||(texCache.panel=(()=>{const t=cv(256,256,(c,w,h)=>{c.fillStyle='#b8bcc8';c.fillRect(0,0,w,h);const r=rnd(7);for(let i=0;i<400;i++){c.fillStyle=`rgba(0,0,0,${r()*.06})`;c.fillRect(r()*w,r()*h,r()*40,r()*40);}
   c.strokeStyle='rgba(40,44,60,.55)';c.lineWidth=2;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(0,i*64);c.lineTo(w,i*64);c.stroke();c.beginPath();c.moveTo(i*64+(i%2)*32,0);c.lineTo(i*64+(i%2)*32,h);c.stroke();}
   c.fillStyle='rgba(30,30,40,.6)';for(let y=8;y<h;y+=64)for(let x=8;x<w;x+=32){c.beginPath();c.arc(x,y,1.6,0,7);c.fill();}});t.wrapS=t.wrapT=T.RepeatWrapping;return t;})());}
 function windowTex(){return texCache.win||(texCache.win=(()=>{const t=cv(256,256,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);const r=rnd(11);for(let y=12;y<h;y+=22)for(let x=10;x<w;x+=18)if(r()<.45){c.fillStyle=r()<.8?'#ffe7a0':'#9fe8ff';c.fillRect(x,y,8,5);}});t.wrapS=t.wrapT=T.RepeatWrapping;return t;})());}
 function glowTex(){return texCache.glow||(texCache.glow=cv(128,128,(c,w)=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,w);}));}
 function bodyMap(tex,seed,clouds){const W=1024,H=512,r=rnd(seed);return cv(W,H,(c)=>{if(clouds){c.clearRect(0,0,W,H);}else{c.fillStyle=tex.base;c.fillRect(0,0,W,H);
   for(let i=0;i<2500;i++){c.fillStyle=`rgba(${r()<.5?0:255},${r()<.5?0:255},${r()<.5?0:255},${r()*.05})`;c.fillRect(r()*W,r()*H,2+r()*14,1+r()*6);}
   if(tex.bands)for(const b of tex.bands){const y=(.5-b.lat/Math.PI)*H,hh=b.w*H*1.3;c.fillStyle=b.col;c.globalAlpha=.75;c.fillRect(0,y-hh/2,W,hh);for(let k=0;k<30;k++){c.globalAlpha=.25;c.fillRect(r()*W,y-hh/2+r()*hh,40+r()*120,2+r()*4);}c.globalAlpha=1;}}
  const list=clouds?tex.cl:tex.f;for(const f of list||[]){for(const dx of[-W,0,W]){const x=(((f.lon%(2*Math.PI))+2*Math.PI)%(2*Math.PI))/(2*Math.PI)*W+dx,y=(.5-f.lat/Math.PI)*H,ry=f.size/Math.PI*H,rx=Math.min(W/2,ry/Math.max(.25,Math.cos(f.lat)));
    c.globalAlpha=f.alpha;c.fillStyle=f.col;for(let k=0;k<7;k++){c.beginPath();c.ellipse(x+(r()-.5)*rx,y+(r()-.5)*ry,rx*(.4+r()*.5),ry*(.4+r()*.5),0,0,7);c.fill();}
    if(f.rim){c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=2;c.beginPath();c.ellipse(x,y,rx*.8,ry*.8,0,0,7);c.stroke();}}}c.globalAlpha=1;});}
 // ---------------- geometry from Starlane's convex models ----------------
 function geoOf(m){let g=geoCache.get(m);if(g)return g;const pos=[],uv=[],S=60;
  for(const f of m.faces){const P=f.v.map(i=>m.pts[i]);const p0=P[0];let t1=[P[1][0]-p0[0],P[1][1]-p0[1],P[1][2]-p0[2]];const l=Math.hypot(...t1)||1;t1=t1.map(x=>x/l);const n=f.n,t2=[n[1]*t1[2]-n[2]*t1[1],n[2]*t1[0]-n[0]*t1[2],n[0]*t1[1]-n[1]*t1[0]];
   const U=p=>{const d=[p[0]-p0[0],p[1]-p0[1],p[2]-p0[2]];return[(d[0]*t1[0]+d[1]*t1[1]+d[2]*t1[2])/S,(d[0]*t2[0]+d[1]*t2[1]+d[2]*t2[2])/S];};
   for(let k=1;k+1<P.length;k++){let a=P[0],b=P[k],cc=P[k+1];const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[cc[0]-a[0],cc[1]-a[1],cc[2]-a[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
    if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0){const t=b;b=cc;cc=t;}for(const p of[a,b,cc]){pos.push(...p);uv.push(...U(p));}}}
  g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();geoCache.set(m,g);return g;}
 function setBasis(o3,pos,o){const r=M(o.r),u=M(o.u),f=M(o.f),p=M(pos);o3.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);o3.matrixAutoUpdate=false;o3.matrixWorldNeedsUpdate=true;}
 function metal(col,o={}){return new T.MeshStandardMaterial({color:new T.Color(col),map:panelTex(),metalness:o.metal??.55,roughness:o.rough??.42,flatShading:true,emissive:o.emissive?new T.Color(o.emissive):new T.Color(0),emissiveMap:o.emissiveMap||null,emissiveIntensity:o.ei??1});}
 // ---------------- setup ----------------
 function init(){T=window.THREE;gl=document.createElement('canvas');R=new T.WebGLRenderer({canvas:gl,antialias:true,alpha:false,powerPreference:'high-performance'});R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=.82;
  scene=new T.Scene();scene.background=new T.Color(0x000004);cam=new T.PerspectiveCamera(50,800/400,5,6e6);cam.matrixAutoUpdate=false;cam2=new T.PerspectiveCamera(70,1,5,6e6);cam2.matrixAutoUpdate=false;root=new T.Group();scene.add(root);
  scene.add(new T.AmbientLight(0x404a66,.1));scene.add(new T.HemisphereLight(0x8899cc,0x110808,.05));
  // starfield
  const sp=[],sc=[],r=rnd(99);for(let i=0;i<5000;i++){const u=r()*2-1,a=r()*Math.PI*2,s=Math.sqrt(1-u*u);sp.push(s*Math.cos(a)*4e5,u*4e5,s*Math.sin(a)*4e5);const w=.6+r()*.4,tint=r();sc.push(w*(tint<.2?.8:1),w*(tint>.85?.85:1),w*(tint<.2?1:tint>.85?.7:.95));}
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sg.setAttribute('color',new T.Float32BufferAttribute(sc,3));
  starField=new T.Points(sg,new T.PointsMaterial({size:1.6,sizeAttenuation:false,vertexColors:true,depthWrite:false}));scene.add(starField);
  // particles: fire (additive) and smoke
  const mk=(n,add,size,tex)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(n*3),3));g.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(n*3),3));g.setDrawRange(0,0);
   const p=new T.Points(g,new T.PointsMaterial({size,map:tex,vertexColors:true,transparent:true,depthWrite:false,blending:add?T.AdditiveBlending:T.NormalBlending,sizeAttenuation:true}));p.frustumCulled=false;scene.add(p);return{p,n,list:[]};};
  fire=mk(2500,true,110,glowTex());smoke=mk(800,false,160,glowTex());
  const dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(400*3),3));dustPts=new T.Points(dg,new T.PointsMaterial({size:2,sizeAttenuation:false,color:0xcfd8ff}));dustPts.frustumCulled=false;scene.add(dustPts);
  comp=new T.EffectComposer(R);comp.addPass(new T.RenderPass(scene,cam));bloom=new T.UnrealBloomPass(new T.Vector2(800,400),.85,.45,.72);comp.addPass(bloom);}
 // ---------------- system bodies: suns, planet, moons, black hole ----------------
 function clearBodies(){for(const b of bodies){root.remove(b);b.traverse&&b.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){if(x.material.map)x.material.map.dispose();x.material.dispose();}});}bodies=[];for(const l of sunLights)scene.remove(l);sunLights=[];bhGroup=null;}
 function atmoMat(col){const m=/rgba?\(([^)]+)\)/.exec(col||'');const v=m?m[1].split(',').map(Number):[140,200,255];return new T.ShaderMaterial({uniforms:{c:{value:new T.Color(v[0]/255,v[1]/255,v[2]/255)}},
   vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
   fragmentShader:'uniform vec3 c;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-abs(dot(vN,vV)),4.0);gl_FragColor=vec4(c*1.2,f*0.85);}',transparent:true,blending:T.AdditiveBlending,side:T.FrontSide,depthWrite:false});}
 function nebulaTex(seed){const r=rnd(seed),W=1024,H=512;return cv(W,H,(c)=>{c.fillStyle='#000';c.fillRect(0,0,W,H);const hues=[r()*360,r()*360];
   for(let i=0;i<26;i++){const x=r()*W,y=H*(.25+r()*.5),rad=60+r()*240,h=hues[i%2]+(r()-.5)*40,g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,`hsla(${h},70%,45%,${.10+r()*.12})`);g.addColorStop(1,'hsla(0,0%,0%,0)');c.fillStyle=g;for(const dx of[-W,0,W]){c.beginPath();c.arc(x+dx,y,rad,0,7);c.fill();}}
   for(let i=0;i<1400;i++){c.fillStyle=`rgba(255,255,255,${r()*.5})`;c.fillRect(r()*W,r()*H,1,1);}});}
 function cityTex(tex,seed){const W=1024,H=512,r=rnd(seed);return cv(W,H,c=>{c.fillStyle='#000';c.fillRect(0,0,W,H);for(const f of tex.f||[]){if(f.col==='#eef4ff')continue;const x0=(((f.lon%(2*Math.PI))+2*Math.PI)%(2*Math.PI))/(2*Math.PI)*W,y0=(.5-f.lat/Math.PI)*H,ry=f.size/Math.PI*H*.8,rx=ry/Math.max(.3,Math.cos(f.lat));
   for(let k=0;k<70;k++){const a=r()*7,d=Math.sqrt(r());c.fillStyle=r()<.8?'rgba(255,214,140,.9)':'rgba(255,250,220,1)';c.fillRect(x0+Math.cos(a)*rx*d,y0+Math.sin(a)*ry*d,1+r()*2,1+r()*1.5);}}});}
 function roughTex(tex){const W=512,H=256;const t=cv(W,H,c=>{c.fillStyle='#4a4a4a';c.fillRect(0,0,W,H);c.fillStyle='#ffffff';for(const f of tex.f||[]){const x=(((f.lon%(2*Math.PI))+2*Math.PI)%(2*Math.PI))/(2*Math.PI)*W,y=(.5-f.lat/Math.PI)*H,ry=f.size/Math.PI*H,rx=Math.min(W/2,ry/Math.max(.25,Math.cos(f.lat)));c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();}});t.encoding=T.LinearEncoding;return t;}
 function buildBodies(A){clearBodies();const sys=A.here();if(nebula){scene.remove(nebula);nebula.material.map.dispose();nebula.material.dispose();}nebula=new T.Mesh(new T.SphereGeometry(3.6e5,48,32),new T.MeshBasicMaterial({map:nebulaTex(sys.seed^0x77),side:T.BackSide,depthWrite:false}));nebula.renderOrder=-2;scene.add(nebula);cityMats=[];
  for(const sn of A.suns){const g=new T.Group();const m=new T.Mesh(new T.SphereGeometry(sn.R,48,32),new T.MeshBasicMaterial({color:new T.Color(sn.col).multiplyScalar(2.2)}));g.add(m);
   const gs=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:new T.Color(sn.col),blending:T.AdditiveBlending,depthWrite:false,transparent:true}));gs.scale.set(sn.R*9,sn.R*9,1);g.add(gs);g.userData={src:sn};root.add(g);bodies.push(g);
   const L=new T.DirectionalLight(new T.Color(sn.col).lerp(new T.Color(1,1,1),.6),sunLights.length?0.6:1.35);scene.add(L);scene.add(L.target);L.userData={src:sn};sunLights.push(L);}
  const pl=A.planet;if(pl){const g=new T.Group();g.userData={src:pl,spinBody:true};const tex=pl.tex||{base:'#3f86c9',f:[],cl:[]};
   const rocky=pl.kind==='rocky',pm=new T.MeshStandardMaterial({map:bodyMap(tex,sys.seed,false),roughness:rocky?1:.9,roughnessMap:rocky?roughTex(tex):null,metalness:0,emissive:rocky?new T.Color(1,1,1):new T.Color(0),emissiveMap:rocky?cityTex(tex,sys.seed+9):null,emissiveIntensity:1.4});
   if(rocky){pm.onBeforeCompile=sh=>{sh.uniforms.sunDirV={value:new T.Vector3(0,0,1)};pm.userData.sh=sh;sh.fragmentShader='uniform vec3 sunDirV;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance*=smoothstep(0.12,-0.25,dot(normalize(vNormal),normalize(sunDirV)));');};cityMats.push(pm);}
   g.add(new T.Mesh(new T.SphereGeometry(pl.R,128,96),pm));
   if(tex.cl&&tex.cl.length){const cm=new T.Mesh(new T.SphereGeometry(pl.R*1.012,96,64),new T.MeshStandardMaterial({map:bodyMap(tex,sys.seed+1,true),transparent:true,depthWrite:false,roughness:1}));cm.userData.clouds=true;g.add(cm);}
   if(tex.atmo)g.add(new T.Mesh(new T.SphereGeometry(pl.R*1.06,96,64),atmoMat(tex.atmo)));
   if(pl.rings){const rg=new T.RingGeometry(pl.rings.a,pl.rings.b,160,1);const uv=rg.attributes.uv,pp=rg.attributes.position;for(let i=0;i<uv.count;i++){const rr=Math.hypot(pp.getX(i),pp.getY(i));uv.setXY(i,(rr-pl.rings.a)/(pl.rings.b-pl.rings.a),.5);}rg.rotateX(-Math.PI/2);
    const rt=cv(512,4,(c,w)=>{const r=rnd(sys.seed+5);for(let x=0;x<w;x++){const a=.25+r()*.55;c.fillStyle=`rgba(${200+r()*40|0},${170+r()*40|0},${120+r()*40|0},${a*(x<20||x>w-20?.3:1)})`;c.fillRect(x,0,1,4);}});
    g.add(new T.Mesh(rg,new T.MeshStandardMaterial({map:rt,transparent:true,side:T.DoubleSide,depthWrite:false,roughness:1})));}
   root.add(g);bodies.push(g);}
  for(const mn of A.moons){const g=new T.Group();g.userData={src:mn};g.add(new T.Mesh(new T.SphereGeometry(mn.R,64,48),new T.MeshStandardMaterial({map:bodyMap(mn.tex||{base:'#9a9ea8',f:[]},sys.seed+mn.R|0,false),roughness:1})));root.add(g);bodies.push(g);}
  if(A.bh){const b=A.bh,g=new T.Group();g.userData={src:b,bh:true};g.add(new T.Mesh(new T.SphereGeometry(b.R,64,48),new T.MeshBasicMaterial({color:0x000000})));
   const dt=cv(512,512,(c,w)=>{const g2=c.createRadialGradient(256,256,90,256,256,256);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(.36,'rgba(255,240,210,.95)');g2.addColorStop(.5,'rgba(255,160,60,.8)');g2.addColorStop(.8,'rgba(180,60,30,.35)');g2.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g2;c.fillRect(0,0,w,w);
    const r=rnd(3);c.globalCompositeOperation='destination-out';for(let i=0;i<220;i++){const a=r()*7,rr=120+r()*130;c.strokeStyle=`rgba(0,0,0,${r()*.5})`;c.lineWidth=1+r()*3;c.beginPath();c.arc(256,256,rr,a,a+.3+r()*.8);c.stroke();}});
   const disk=new T.Mesh(new T.PlaneGeometry(b.R*7,b.R*7),new T.MeshBasicMaterial({map:dt,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));disk.rotation.x=-Math.PI/2+.35;disk.userData.disk=true;g.add(disk);
   const ring=new T.Mesh(new T.TorusGeometry(b.R*1.08,b.R*.025,8,96),new T.MeshBasicMaterial({color:0xfff0d8}));g.add(ring);
   const gs=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xb45bd6,blending:T.AdditiveBlending,transparent:true,depthWrite:false,opacity:.5}));gs.scale.set(b.R*10,b.R*10,1);g.add(gs);root.add(g);bodies.push(g);bhGroup=g;}}
 // ---------------- ships, station and other objects ----------------
 function shipObj(sh,A){const g=new T.Group(),col=sh===A.station?'#d8dce8':(sh.T&&sh.T.color)||'#cccccc',role=sh.T&&sh.T.role;
  if(sh===A.station){g.add(new T.Mesh(geoOf(sh.m),metal('#c9cdd8',{emissive:'#ffffff',emissiveMap:windowTex(),ei:1.6})));
   const slot=new T.Mesh(new T.PlaneGeometry(220,72),new T.MeshBasicMaterial({color:0x02040a}));slot.position.set(0,0,332);g.add(slot);
   const frame=new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(224,76)),new T.LineBasicMaterial({color:0x3fe0ff}));frame.position.set(0,0,333);g.add(frame);
   const glow=new T.Mesh(new T.PlaneGeometry(220,72),new T.MeshBasicMaterial({color:0x3fe0ff,transparent:true,opacity:.18,blending:T.AdditiveBlending,depthWrite:false}));glow.position.set(0,0,333.5);g.add(glow);
   for(const[x,c]of[[-135,0xff2d55],[135,0x3cff6a]]){const l=new T.Mesh(new T.SphereGeometry(9,12,8),new T.MeshBasicMaterial({color:c}));l.position.set(x,0,335);l.userData.blink=x;g.add(l);}
   for(const p of sh.parts||[])g.add(new T.Mesh(geoOf(p.m),metal(p.col==='#3f6fd6'?'#2a4fb0':p.col,{emissive:'#ffffff',emissiveMap:windowTex(),ei:1.2,metal:p.col==='#3f6fd6'?.9:.55})));}
  else if(role==='rock'){g.add(new T.Mesh(geoOf(sh.m),new T.MeshStandardMaterial({color:new T.Color('#8a7a68'),roughness:1,metalness:.05,flatShading:true,map:panelTex()})));}
  else if(role==='mine'){g.add(new T.Mesh(geoOf(sh.m),metal('#ff2d55',{metal:.8,rough:.3})));const l=new T.Mesh(new T.SphereGeometry(6,8,6),new T.MeshBasicMaterial({color:0xff2d55}));l.userData.blink=1;g.add(l);}
  else{g.add(new T.Mesh(geoOf(sh.m),metal(col)));for(const p of sh.parts||[])g.add(new T.Mesh(geoOf(p.m),metal(p.col,{metal:.7})));
   if(sh.ant){const a=sh.ant;const lg=new T.BufferGeometry().setFromPoints([new T.Vector3(...a[0]),new T.Vector3(...a[1])]);g.add(new T.Line(lg,new T.LineBasicMaterial({color:col})));}
   if(!['cargo'].includes(role)){const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:sh.type==='missile'?0xff8a1c:0x3fe0ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,(sh.rearZ||-30)-6);e.scale.set(60,60,1);e.userData.engine=true;g.add(e);}}
  root.add(g);return g;}
 function playerObj(A){const g=new T.Group();const m=A.playerModel();g.add(new T.Mesh(geoOf(m),metal('#ffd84a',{metal:.6})));const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0x3fe0ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,-98);e.scale.set(90,90,1);e.userData.engine=true;g.add(e);g.userData.model=m;root.add(g);return g;}
 // ---------------- particles ----------------
 const seenBoom=new WeakSet();
 function burst(pos,n,spd,life,col,sys=fire){for(let i=0;i<n;i++){if(sys.list.length>=sys.n)sys.list.shift();const u=Math.random()*2-1,a=Math.random()*7,s=Math.sqrt(1-u*u),v=spd*(.3+Math.random()*.7);sys.list.push({p:[...pos],v:[s*Math.cos(a)*v,u*v,s*Math.sin(a)*v],t:0,life:life*(.6+Math.random()*.6),c:col});}}
 function stepParticles(sys,dt,fade){const P=sys.p.geometry.attributes.position,C=sys.p.geometry.attributes.color;let k=0;sys.list=sys.list.filter(q=>(q.t+=dt)<q.life);
  for(const q of sys.list){q.p[0]+=q.v[0]*dt;q.p[1]+=q.v[1]*dt;q.p[2]+=q.v[2]*dt;q.v=q.v.map(x=>x*Math.pow(.35,dt));const m=M(q.p),f=fade?Math.max(0,1-q.t/q.life):1;P.setXYZ(k,m[0],m[1],m[2]);C.setXYZ(k,q.c[0]*f,q.c[1]*f,q.c[2]*f);k++;}
  P.needsUpdate=true;C.needsUpdate=true;sys.p.geometry.setDrawRange(0,k);}
 // ---------------- per-frame ----------------
 let lastT=performance.now(),trailT=0;
 function render(ctx,A){if(!ready())return false;const t0=performance.now(),dt=Math.min(.1,(t0-lastT)/1000);lastT=t0;
  const W=A.W,VH=A.VH,k=Math.max(1,ctx.canvas.width/W),pr=quality.pr*k,w=Math.round(W*pr),h=Math.round(VH*pr);
  if(gl.width!==w||gl.height!==h){R.setPixelRatio(1);R.setSize(w,h,false);comp.setSize(w,h);bloom.resolution.set(w,h);}
  const sys=A.here();if(lastSys!==A.planet){lastSys=A.planet;for(const[o,g]of objs){root.remove(g);}objs.clear();buildBodies(A);}
  // camera (mirrored into three's handedness)
  const C=A.CAM,r=M(C.r),u=M(C.u),f=M(C.f).map(x=>-x),p=M(C.pos);cam.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);cam.matrixWorld.copy(cam.matrix);cam.matrixWorldInverse.copy(cam.matrix).invert();
  const fov=2*Math.atan((VH/2)/A.FOC)*180/Math.PI;if(Math.abs(cam.fov-fov)>.01||Math.abs(cam.aspect-W/VH)>.001){cam.fov=fov;cam.aspect=W/VH;cam.updateProjectionMatrix();}
  starField.position.set(...p);if(nebula)nebula.position.set(...p);
  if(cityMats.length&&A.suns[0]){const sd=new T.Vector3(...M(A.suns[0].pos)).sub(new T.Vector3(...M(A.planet?A.planet.pos:[0,0,0]))).normalize().transformDirection(cam.matrixWorldInverse);for(const m of cityMats)if(m.userData.sh)m.userData.sh.uniforms.sunDirV.value.copy(sd);}
  // bodies follow their game positions and spin
  for(const b of bodies){const s=b.userData.src;if(!s)continue;if(s.o)setBasis(b,s.pos,s.o);else{b.position.set(...M(s.pos));b.matrixAutoUpdate=true;}if(b.userData.bh)b.children.forEach(x=>{if(x.userData.disk)x.rotation.z+=dt*.5;});
   b.children.forEach(x=>{if(x.userData.clouds)x.rotation.y+=dt*.01;});}
  sunLights.forEach(L=>{const s=L.userData.src;L.position.set(...M(s.pos));L.target.position.set(...p);});
  // ships and station
  const live=new Set(),list=[...A.ships.filter(s=>!s.dead),...(A.station?[A.station]:[])];
  for(const sh of list){live.add(sh);let g=objs.get(sh);if(!g){g=shipObj(sh,A);objs.set(sh,g);}setBasis(g,sh.pos,sh.o);
   g.children.forEach(x=>{if(x.userData.blink!==undefined)x.visible=Math.floor(A.clock*2+(x.userData.blink>0?1:0))%2===0;if(x.userData.engine){const s2=40+Math.min(1,(sh.speed||0)/300)*60;x.scale.set(s2,s2,1);x.visible=!(sh.dmg>.7&&Math.random()<.35);}});
   if(sh.dmg>.35&&Math.random()<dt*6)burst(sh.pos,3,120,.4,[1,.8,.3]);}
  // the player's own ship (outside camera)
  if(A.camMode==='ext'){let g=objs.get('me');if(!g||g.userData.model!==A.playerModel()){if(g)root.remove(g);g=playerObj(A);objs.set('me',g);}live.add('me');setBasis(g,A.P.pos,A.P.o);g.children.forEach(x=>{if(x.userData.engine){const s2=50+A.P.throttle*90;x.scale.set(s2,s2,1);}});}
  for(const[o,g]of objs)if(!live.has(o)){root.remove(g);objs.delete(o);}
  // explosions, sparks and engine trails
  for(const b of A.booms){if(seenBoom.has(b))continue;seenBoom.add(b);if(b.spark)burst(b.pos,8,260,.35,[1,.9,.5]);else{burst(b.pos,160,560,1.3,[1.6,.9,.3]);burst(b.pos,70,260,1.6,[1.8,1.6,1.1]);burst(b.pos,30,90,2.6,[.45,.45,.5],smoke);}}
  trailT+=dt;if(trailT>.04){trailT=0;for(const sh of A.ships)if(!sh.dead&&sh.T&&!['rock','cargo','mine','beacon'].includes(sh.T.role)&&(sh.speed||0)>40){const e=A.toWorld(sh.o,[0,0,(sh.rearZ||-30)-10]);fire.list.push({p:[sh.pos[0]+e[0],sh.pos[1]+e[1],sh.pos[2]+e[2]],v:[0,0,0],t:0,life:.5,c:sh.type==='missile'?[1,.5,.1]:[.25,.7,1]});}
   if(A.camMode==='ext'&&A.P.throttle>.05){const e=A.toWorld(A.P.o,[0,0,-104]);fire.list.push({p:[A.P.pos[0]+e[0],A.P.pos[1]+e[1],A.P.pos[2]+e[2]],v:[0,0,0],t:0,life:.6,c:[.3,.75,1]});}}
  stepParticles(fire,dt,true);
  // damage smoke comes from Starlane's own smoke list
  {const P2=smoke.p.geometry.attributes.position,C2=smoke.p.geometry.attributes.color;stepParticles(smoke,dt,true);let k2=smoke.p.geometry.drawRange.count;for(const sm of A.smokes){if(k2>=smoke.n)break;const m=M(sm.pos),f2=.55*(1-sm.t/1.6);P2.setXYZ(k2,m[0],m[1],m[2]);C2.setXYZ(k2,f2,f2,f2*1.05);k2++;}smoke.p.geometry.setDrawRange(0,k2);P2.needsUpdate=true;C2.needsUpdate=true;}
  // space dust
  {const D=dustPts.geometry.attributes.position;let n=0;for(const d of A.dust){if(n>=400)break;const m=M(d);D.setXYZ(n++,m[0],m[1],m[2]);}dustPts.geometry.setDrawRange(0,n);D.needsUpdate=true;}
  bloom.enabled=quality.bloom;comp.render();ctx.drawImage(gl,0,0,W,VH);flare(ctx,A,W,VH);
  // keep it smooth: drop the glow, then the resolution, if frames get slow (and raise them again when there is room)
  const ms=performance.now()-t0;if(ms>22){slow++;fast=0;}else if(ms<9){fast++;slow=0;}
  if(slow>40){slow=0;if(quality.views)quality.views=false;else if(quality.bloom)quality.bloom=false;else quality.pr=Math.max(.6,quality.pr-.15);}if(fast>240){fast=0;if(quality.pr<1)quality.pr=Math.min(1,quality.pr+.15);else if(!quality.bloom)quality.bloom=true;else if(!quality.views)quality.views=true;}
  return true;}
 // lens flare from the brightest sun (hidden when a planet is in the way)
 function flare(ctx,A,W,VH){const sn=A.suns[0];if(!sn)return;const v=new T.Vector3(...M(sn.pos)).project(cam);if(v.z>1||Math.abs(v.x)>1.2||Math.abs(v.y)>1.2)return;
  if(A.planet){const C0=A.CAM.pos,d=[sn.pos[0]-C0[0],sn.pos[1]-C0[1],sn.pos[2]-C0[2]],L=Math.hypot(...d),u=d.map(x=>x/L),pc=[A.planet.pos[0]-C0[0],A.planet.pos[1]-C0[1],A.planet.pos[2]-C0[2]],t=pc[0]*u[0]+pc[1]*u[1]+pc[2]*u[2];if(t>0&&t<L){const q=[pc[0]-u[0]*t,pc[1]-u[1]*t,pc[2]-u[2]*t];if(Math.hypot(...q)<A.planet.R)return;}}
  const sx=(v.x+1)/2*W,sy=(1-v.y)/2*VH,cx=W/2,cy=VH/2,dx=cx-sx,dy=cy-sy,str=Math.max(0,1-Math.hypot(v.x,v.y)*.7);if(str<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const[k,r0,col]of[[.4,24,'255,200,120'],[.7,12,'120,200,255'],[1.1,36,'180,120,255'],[1.5,9,'255,255,200'],[1.9,60,'90,160,255']]){const x=sx+dx*k,y=sy+dy*k,g=ctx.createRadialGradient(x,y,0,x,y,r0);g.addColorStop(0,`rgba(${col},${.22*str})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r0,0,7);ctx.fill();}
  const g=ctx.createLinearGradient(sx-140,sy,sx+140,sy);g.addColorStop(0,'rgba(255,240,210,0)');g.addColorStop(.5,`rgba(255,240,210,${.25*str})`);g.addColorStop(1,'rgba(255,240,210,0)');ctx.fillStyle=g;ctx.fillRect(sx-140,sy-1.5,280,3);ctx.restore();}
 // extra cameras for the cockpit's side windows and mirror: rendered straight after the main view into small regions of
 // the same WebGL canvas, then copied through each window's shape. {o:{r,u,f}, pos, fov, rect:[x,y,w,h], clip(ctx), mirror}
 function views(ctx,A,list){if(!ready()||!quality.views)return false;const W=A.W,VH=A.VH,pw=gl.width/W,ph=gl.height/VH;R.setScissorTest(true);
  for(const v of list){const[x,y,w,h]=v.rect,gx=Math.round(x*pw),gy=Math.round(gl.height-(y+h)*ph),gw=Math.round(w*pw),gh=Math.round(h*ph);if(gw<2||gh<2)continue;
   const r=M(v.o.r),u=M(v.o.u),f=M(v.o.f).map(q=>-q),p=M(v.pos);cam2.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);cam2.matrixWorld.copy(cam2.matrix);cam2.matrixWorldInverse.copy(cam2.matrix).invert();
   cam2.fov=v.fov;cam2.aspect=w/h;cam2.updateProjectionMatrix();starField.position.set(...p);R.setViewport(gx,gy,gw,gh);R.setScissor(gx,gy,gw,gh);R.render(scene,cam2);
   ctx.save();v.clip(ctx);ctx.clip();if(v.mirror){ctx.translate(x+w,0);ctx.scale(-1,1);ctx.drawImage(gl,gx,gl.height-gy-gh,gw,gh,0,y,w,h);}else ctx.drawImage(gl,gx,gl.height-gy-gh,gw,gh,x,y,w,h);ctx.restore();}
  R.setScissorTest(false);R.setViewport(0,0,gl.width,gl.height);return true;}
 return{load,ready,render,views,get state(){return state;},get quality(){return quality;}};
})();
