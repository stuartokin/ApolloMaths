'use strict';
// STARLANE MODERN — a real-time 3D renderer for the Modern style, built on three.js (bundled in js/vendor, loaded only
// when Modern is chosen, so the rest of the app stays light). It draws the space view into its own WebGL canvas, which
// Starlane then paints under its cockpit and HUD. Lit metal ships and stations, textured planets with clouds and
// atmospheres, a bloom glow, particle explosions, smoke and engine trails, and a deep starfield.
// Starlane's world uses the opposite handedness to three.js, so positions are mirrored on one axis (M below).
const StarModern=(()=>{
 let state='idle',T=null,R=null,scene=null,cam=null,cam2=null,comp=null,bloom=null,gl=null,quality={pr:1,bloom:true,views:true,auto:true},slow=0,fast=0,lastSys=null,root=null;
 const objs=new Map(),geoCache=new WeakMap(),texCache={};let boomLights=[],sunLights=[],bodies=[],nebula=null,cityMats=[],starField=null,fire=null,smoke=null,dustPts=null,bhGroup=null,stationGrp=null;
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
 const terrainCache={};
 function terrain(seed){if(terrainCache[seed])return terrainCache[seed];const GW=64,GH=32,r=rnd(seed),grid=[];for(let i=0;i<GW*GH;i++)grid.push(r());
  const vn=(x,y)=>{const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),g=(i,j)=>grid[((j%GH+GH)%GH)*GW+((i%GW+GW)%GW)];const a=g(x0,y0),b=g(x0+1,y0),c=g(x0,y0+1),d=g(x0+1,y0+1);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;};
  const W=512,H=256,h=new Float32Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=0,amp=.5,f=4/W;for(let o=0;o<5;o++){v+=vn(x*f*GW/4,y*f*GW/4)*amp;amp*=.5;f*=2;}h[y*W+x]=v;}
  return terrainCache[seed]={W,H,h};}
 function terrainCanvas(seed,kind){const T0=terrain(seed),{W,H,h}=T0,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),img=g.createImageData(W,H),sea=.5;
  for(let y=0;y<H;y++){const lat=Math.abs(y/H-.5)*2;for(let x=0;x<W;x++){const v=h[y*W+x],i=(y*W+x)*4;let col;
   if(kind==='rough')col=v<sea?[90,90,90]:[255,255,255];else if(kind==='city')col=(v>sea+.02&&v<.66&&lat<.75&&((x*7919+y*104729)%97)<3)?[255,214,140]:[0,0,0];
   else if(lat>.86||(lat>.72&&v>sea))col=[235,242,255];else if(v<sea-.08)col=[18,52,120];else if(v<sea)col=[30,92,168];else if(v<sea+.02)col=[214,198,140];else if(v<.6)col=lat<.3?[178,160,96]:[60,128,62];else if(v<.68)col=[106,96,62];else col=[150,146,140];
   img.data[i]=col[0];img.data[i+1]=col[1];img.data[i+2]=col[2];img.data[i+3]=255;}}g.putImageData(img,0,0);return c;}
 function bodyMap(tex,seed,clouds){if(!clouds&&tex.terrain){const big=cv(1024,512,(c)=>{c.imageSmoothingEnabled=true;c.drawImage(terrainCanvas(seed,'col'),0,0,1024,512);});return big;}const W=1024,H=512,r=rnd(seed);return cv(W,H,(c)=>{if(clouds){c.clearRect(0,0,W,H);}else{c.fillStyle=tex.base;c.fillRect(0,0,W,H);
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
  for(let i=0;i<3;i++){const L=new T.PointLight(0xffa040,0,5000,1.6);L.userData.t=9;scene.add(L);boomLights.push(L);}
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
   const rocky=pl.kind==='rocky';const tseed=sys.seed^0x5151;const mapT=rocky?bodyMap({terrain:true},tseed,false):bodyMap(tex,sys.seed,false);const big=(kind)=>{const t=cv(1024,512,c=>{c.drawImage(terrainCanvas(tseed,kind),0,0,1024,512);});if(kind==='rough')t.encoding=T.LinearEncoding;return t;};
   const pm=new T.MeshStandardMaterial({map:mapT,roughness:rocky?1:.9,roughnessMap:rocky?big('rough'):null,metalness:0,emissive:rocky?new T.Color(1,1,1):new T.Color(0),emissiveMap:rocky?big('city'):null,emissiveIntensity:1.6});
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
   if(!['cargo','missile','beacon','derelict'].includes(role))detail(g,sh.m,col);
   if(sh.ant){const a=sh.ant;const lg=new T.BufferGeometry().setFromPoints([new T.Vector3(...a[0]),new T.Vector3(...a[1])]);g.add(new T.Line(lg,new T.LineBasicMaterial({color:col})));}
   if(!['cargo'].includes(role)){const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:sh.type==='missile'?0xff8a1c:0x3fe0ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,(sh.rearZ||-30)-6);e.scale.set(60,60,1);e.userData.engine=true;g.add(e);}}
  root.add(g);return g;}
 // engine nozzles with glowing cores, a glass canopy and navigation lights, sized from the model itself
 let navLights=[];
 function detail(g,m,col){const P0=m.pts,xs=P0.map(p=>p[0]),ys=P0.map(p=>p[1]),zs=P0.map(p=>p[2]),xmax=Math.max(...xs),ymax=Math.max(...ys),zmin=Math.min(...zs),zmax=Math.max(...zs),rad=m.rad;
  const noz=new T.MeshStandardMaterial({color:0x2a2e38,metalness:.9,roughness:.35}),core=new T.MeshBasicMaterial({color:0x6fd8ff});
  for(const sx of xmax>rad*.45?[-1,1]:[0]){const n=new T.Mesh(new T.CylinderGeometry(rad*.11,rad*.14,rad*.22,14,1,true),noz);n.rotation.x=Math.PI/2;n.position.set(sx*xmax*.28,0,zmin+rad*.04);g.add(n);
   const cdisk=new T.Mesh(new T.CircleGeometry(rad*.1,14),core);cdisk.position.set(sx*xmax*.28,0,zmin-rad*.05);cdisk.rotation.y=Math.PI;g.add(cdisk);}
  const can=new T.Mesh(new T.SphereGeometry(rad*.11,18,10,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:0x0c2236,metalness:.35,roughness:.3,transparent:true,opacity:.85,emissive:new T.Color(0x06182a)}));can.scale.set(1,.5,1.35);can.position.set(0,ymax*.5,zmax*.2);g.add(can);
  for(const[sx,c]of[[-1,0xff2d55],[1,0x3cff6a]]){const L=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:c,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));L.scale.set(rad*.16,rad*.16,1);L.position.set(sx*xmax*.98,0,0);g.add(L);}
  const st=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xffffff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));st.scale.set(rad*.22,rad*.22,1);st.position.set(0,ymax*1.02,zmin*.6);st.userData.strobe=Math.random()*2;g.add(st);
  const bub=new T.Mesh(new T.SphereGeometry(rad*1.25,24,16),new T.MeshBasicMaterial({color:0x5fd6ff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));bub.visible=false;bub.userData.bubble=true;g.add(bub);}
 function playerObj(A){const g=new T.Group();const m=A.playerModel();g.add(new T.Mesh(geoOf(m),metal('#ffd84a',{metal:.6})));const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0x3fe0ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,-98);e.scale.set(90,90,1);e.userData.engine=true;g.add(e);g.userData.model=m;root.add(g);return g;}
 // ---------------- particles ----------------
 const seenBoom=new WeakSet();
 function burst(pos,n,spd,life,col,sys=fire){n=Math.max(2,Math.round(n*pmul));for(let i=0;i<n;i++){if(sys.list.length>=sys.n)sys.list.shift();const u=Math.random()*2-1,a=Math.random()*7,s=Math.sqrt(1-u*u),v=spd*(.3+Math.random()*.7);sys.list.push({p:[...pos],v:[s*Math.cos(a)*v,u*v,s*Math.sin(a)*v],t:0,life:life*(.6+Math.random()*.6),c:col});}}
 function stepParticles(sys,dt,fade){const P=sys.p.geometry.attributes.position,C=sys.p.geometry.attributes.color;let k=0;sys.list=sys.list.filter(q=>(q.t+=dt)<q.life);
  for(const q of sys.list){q.p[0]+=q.v[0]*dt;q.p[1]+=q.v[1]*dt;q.p[2]+=q.v[2]*dt;q.v=q.v.map(x=>x*Math.pow(.35,dt));const m=M(q.p),f=fade?Math.max(0,1-q.t/q.life):1;P.setXYZ(k,m[0],m[1],m[2]);C.setXYZ(k,q.c[0]*f,q.c[1]*f,q.c[2]*f);k++;}
  P.needsUpdate=true;C.needsUpdate=true;sys.p.geometry.setDrawRange(0,k);}
 // ---------------- per-frame ----------------
 let lastT=performance.now(),trailT=0;
 function render(ctx,A){if(!ready())return false;if(A.full===undefined&&pit)pit.visible=false;const t0=performance.now(),dt=Math.min(.1,(t0-lastT)/1000);lastT=t0;
  const W=A.W,VH=A.VH,CXa=A.CX??W/2,CYa=A.CY??VH/2,Hv=A.full&&A.H?A.H:VH,k=Math.max(1,Math.min(ctx.canvas.width/W,1920/W)),pr=quality.pr*k,wd=A.wide||null;let w,h,ppx,ppy,foc;
  if(wd){const dpr=Math.min(window.devicePixelRatio||1,2)*quality.pr,sc=Math.min(dpr,2400/wd.w);w=Math.round(wd.w*sc);h=Math.round(wd.h*sc);ppx=(wd.ox+CXa*wd.s)*sc;ppy=(wd.oy+CYa*wd.s)*sc;foc=A.FOC*wd.s*sc;}
  else{w=Math.round(W*pr);h=Math.round(Hv*pr);ppx=CXa*pr;ppy=CYa*pr;foc=A.FOC*pr;}
  if(gl.width!==w||gl.height!==h){R.setPixelRatio(1);R.setSize(w,h,false);comp.setSize(w,h);bloom.resolution.set(w,h);}R.setScissorTest(false);R.setViewport(0,0,w,h);
  toGame=wd?((x,y)=>[(((x+1)/2*wd.w)-wd.ox)/wd.s,(((1-y)/2*wd.h)-wd.oy)/wd.s]):((x,y)=>[(x+1)/2*W,(1-y)/2*Hv]);
  const sys=A.here();if(lastSys!==A.planet){lastSys=A.planet;for(const[o,g]of objs){root.remove(g);}objs.clear();buildBodies(A);}
  // camera (mirrored into three's handedness)
  const C=A.CAM,r=M(C.r),u=M(C.u),f=M(C.f).map(x=>-x),p=M(C.pos);cam.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);cam.matrixWorld.copy(cam.matrix);cam.matrixWorldInverse.copy(cam.matrix).invert();
  {const n=cam.near;cam.projectionMatrix.makePerspective(-ppx/foc*n,(w-ppx)/foc*n,ppy/foc*n,-(h-ppy)/foc*n,n,cam.far);cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();}
  starField.position.set(...p);if(nebula)nebula.position.set(...p);
  if(cityMats.length&&A.suns[0]){const sd=new T.Vector3(...M(A.suns[0].pos)).sub(new T.Vector3(...M(A.planet?A.planet.pos:[0,0,0]))).normalize().transformDirection(cam.matrixWorldInverse);for(const m of cityMats)if(m.userData.sh)m.userData.sh.uniforms.sunDirV.value.copy(sd);}
  // bodies follow their game positions and spin
  for(const b of bodies){const s=b.userData.src;if(!s)continue;if(s.o)setBasis(b,s.pos,s.o);else{b.position.set(...M(s.pos));b.matrixAutoUpdate=true;}if(b.userData.bh)b.children.forEach(x=>{if(x.userData.disk)x.rotation.z+=dt*.5;});
   b.children.forEach(x=>{if(x.userData.clouds)x.rotation.y+=dt*.01;});}
  sunLights.forEach(L=>{const s=L.userData.src;L.position.set(...M(s.pos));L.target.position.set(...p);});
  // ships and station
  const live=new Set(),list=[...A.ships.filter(s=>!s.dead),...(A.station?[A.station]:[])];
  for(const sh of list){live.add(sh);let g=objs.get(sh);if(!g){g=shipObj(sh,A);objs.set(sh,g);}setBasis(g,sh.pos,sh.o);
   g.children.forEach(x=>{if(x.userData.strobe!==undefined)x.visible=((A.clock+x.userData.strobe)%1.4)<.08;if(x.userData.bubble){const k=sh.hitFx!==undefined?1-(A.clock-sh.hitFx)/.35:0;x.visible=k>0;if(k>0)x.material.opacity=.35*k;}if(x.userData.blink!==undefined)x.visible=Math.floor(A.clock*2+(x.userData.blink>0?1:0))%2===0;if(x.userData.engine){const s2=40+Math.min(1,(sh.speed||0)/300)*60;x.scale.set(s2,s2,1);x.visible=!(sh.dmg>.7&&Math.random()<.35);}});
   if(sh.dmg>.35&&Math.random()<dt*6)burst(sh.pos,3,120,.4,[1,.8,.3]);}
  // the player's own ship (outside camera)
  if(A.camMode==='ext'){let g=objs.get('me');if(!g||g.userData.model!==A.playerModel()){if(g)root.remove(g);g=playerObj(A);objs.set('me',g);}live.add('me');setBasis(g,A.P.pos,A.P.o);g.children.forEach(x=>{if(x.userData.engine){const s2=50+A.P.throttle*90;x.scale.set(s2,s2,1);}});}
  for(const[o,g]of objs)if(!live.has(o)){root.remove(g);objs.delete(o);}
  // explosions, sparks and engine trails
  for(const b of A.booms){if(seenBoom.has(b))continue;seenBoom.add(b);if(b.spark)burst(b.pos,8,260,.35,[1,.9,.5]);else{const L=boomLights.slice().sort((a,b)=>a.intensity-b.intensity)[0];if(L){L.position.set(...M(b.pos));L.intensity=9;L.userData.t=0;}burst(b.pos,160,560,1.3,[1.6,.9,.3]);burst(b.pos,70,260,1.6,[1.8,1.6,1.1]);burst(b.pos,30,90,2.6,[.45,.45,.5],smoke);}}
  trailT+=dt;if(trailT>.04){trailT=0;for(const sh of A.ships)if(!sh.dead&&sh.T&&!['rock','cargo','mine','beacon'].includes(sh.T.role)&&(sh.speed||0)>40){const e=A.toWorld(sh.o,[0,0,(sh.rearZ||-30)-10]);fire.list.push({p:[sh.pos[0]+e[0],sh.pos[1]+e[1],sh.pos[2]+e[2]],v:[0,0,0],t:0,life:.5,c:sh.type==='missile'?[1,.5,.1]:[.25,.7,1]});}
   if(A.camMode==='ext'&&A.P.throttle>.05){const e=A.toWorld(A.P.o,[0,0,-104]);fire.list.push({p:[A.P.pos[0]+e[0],A.P.pos[1]+e[1],A.P.pos[2]+e[2]],v:[0,0,0],t:0,life:.6,c:[.3,.75,1]});}}
  for(const L of boomLights){if(L.intensity>0){L.userData.t+=dt;L.intensity=Math.max(0,9*(1-L.userData.t/.9));}}
  stepParticles(fire,dt,true);
  // damage smoke comes from Starlane's own smoke list
  {const P2=smoke.p.geometry.attributes.position,C2=smoke.p.geometry.attributes.color;stepParticles(smoke,dt,true);let k2=smoke.p.geometry.drawRange.count;for(const sm of A.smokes){if(k2>=smoke.n)break;const m=M(sm.pos),f2=.55*(1-sm.t/1.6);P2.setXYZ(k2,m[0],m[1],m[2]);C2.setXYZ(k2,f2,f2,f2*1.05);k2++;}smoke.p.geometry.setDrawRange(0,k2);P2.needsUpdate=true;C2.needsUpdate=true;}
  // space dust
  {const D=dustPts.geometry.attributes.position;let n=0;for(const d of A.dust){if(n>=400)break;const m=M(d);D.setXYZ(n++,m[0],m[1],m[2]);}dustPts.geometry.setDrawRange(0,n);D.needsUpdate=true;}
  bloom.enabled=quality.bloom;comp.render();if(wd){if(wd.cv.width!==w||wd.cv.height!==h){wd.cv.width=w;wd.cv.height=h;}wd.ctx.drawImage(gl,0,0);ctx.clearRect(0,0,W,Hv);}else ctx.drawImage(gl,0,0,W,Hv);flare(ctx,A,CXa,CYa);
  // keep it smooth: drop the glow, then the resolution, if frames get slow (and raise them again when there is room)
  const ms=performance.now()-t0;if(quality.auto===false){slow=fast=0;}else if(ms>22){slow++;fast=0;}else if(ms<9){fast++;slow=0;}
  if(slow>40){slow=0;if(quality.views)quality.views=false;else if(quality.bloom)quality.bloom=false;else quality.pr=Math.max(.6,quality.pr-.15);}if(fast>240){fast=0;if(quality.pr<1)quality.pr=Math.min(1,quality.pr+.15);else if(!quality.bloom)quality.bloom=true;else if(!quality.views)quality.views=true;}
  return true;}
 // lens flare from the brightest sun (hidden when a planet is in the way)
 let toGame=(x,y)=>[0,0];
 function flare(ctx,A,CXg,CYg){const sn=A.suns[0];if(!sn)return;const v=new T.Vector3(...M(sn.pos)).project(cam);if(v.z>1||Math.abs(v.x)>1.2||Math.abs(v.y)>1.2)return;
  if(A.planet){const C0=A.CAM.pos,d=[sn.pos[0]-C0[0],sn.pos[1]-C0[1],sn.pos[2]-C0[2]],L=Math.hypot(...d),u=d.map(x=>x/L),pc=[A.planet.pos[0]-C0[0],A.planet.pos[1]-C0[1],A.planet.pos[2]-C0[2]],t=pc[0]*u[0]+pc[1]*u[1]+pc[2]*u[2];if(t>0&&t<L){const q=[pc[0]-u[0]*t,pc[1]-u[1]*t,pc[2]-u[2]*t];if(Math.hypot(...q)<A.planet.R)return;}}
  const[sx,sy]=toGame(v.x,v.y),cx=CXg,cy=CYg,dx=cx-sx,dy=cy-sy,str=Math.max(0,1-Math.hypot(v.x,v.y)*.7);if(str<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const[k,r0,col]of[[.4,24,'255,200,120'],[.7,12,'120,200,255'],[1.1,36,'180,120,255'],[1.5,9,'255,255,200'],[1.9,60,'90,160,255']]){const x=sx+dx*k,y=sy+dy*k,g=ctx.createRadialGradient(x,y,0,x,y,r0);g.addColorStop(0,`rgba(${col},${.22*str})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r0,0,7);ctx.fill();}
  const g=ctx.createLinearGradient(sx-140,sy,sx+140,sy);g.addColorStop(0,'rgba(255,240,210,0)');g.addColorStop(.5,`rgba(255,240,210,${.25*str})`);g.addColorStop(1,'rgba(255,240,210,0)');ctx.fillStyle=g;ctx.fillRect(sx-140,sy-1.5,280,3);ctx.restore();}
 // ---------------- 3D cockpit (Modern): an enclosed cabin carried with the ship ----------------
 // Built in ship-local units (x right, y up, z forward). The console's top edge sits where the old 2D dashboard began,
 // so the forward view keeps its familiar framing; everything else is real geometry that looks right from any angle.
 let scrMeshes=[],lastHitSeen=-1,pit=null,pitLights=[],pitKey='',dashTex=null,sway=[0,0,0],lastSpeed=0,pitLamp=null,pitGlow=[];
 function beam(a,b,w){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d)||1,u=d.map(x=>x/L);let p=Math.abs(u[1])<.9?[0,1,0]:[1,0,0];const c1=[u[1]*p[2]-u[2]*p[1],u[2]*p[0]-u[0]*p[2],u[0]*p[1]-u[1]*p[0]],l1=Math.hypot(...c1),n1=c1.map(x=>x/l1*w),n2=[u[1]*n1[2]-u[2]*n1[1],u[2]*n1[0]-u[0]*n1[2],u[0]*n1[1]-u[1]*n1[0]];
  const pts=[];for(const e of[a,b])for(const s1 of[-1,1])for(const s2 of[-1,1])pts.push([e[0]+n1[0]*s1+n2[0]*s2,e[1]+n1[1]*s1+n2[1]*s2,e[2]+n1[2]*s1+n2[2]*s2]);return geoOf(SL.hull(pts));}
 function quadGeo(p,uv){const g=new T.BufferGeometry(),P=[p[0],p[1],p[2],p[0],p[2],p[3]],U=[uv[0],uv[1],uv[2],uv[0],uv[2],uv[3]];g.setAttribute('position',new T.Float32BufferAttribute(P.flat(),3));g.setAttribute('uv',new T.Float32BufferAttribute(U.flat(),2));g.computeVertexNormals();return g;}
 function wallTex(){return texCache.wall||(texCache.wall=(()=>{const t=cv(256,256,(c,w,h)=>{c.fillStyle='#1c2233';c.fillRect(0,0,w,h);const r=rnd(77);for(let i=0;i<60;i++){c.fillStyle=`rgba(255,255,255,${r()*.035})`;c.fillRect(r()*w,r()*h,r()*80,r()*80);}c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=2;for(const[x,y,ww,hh]of[[8,8,112,70],[128,8,120,70],[8,86,240,74],[8,168,76,80],[92,168,156,80]]){c.strokeRect(x,y,ww,hh);}
   c.fillStyle='rgba(120,140,190,.25)';for(let i=0;i<14;i++)c.fillRect(14+((i*53)%228),20+((i*37)%220),3,3);});t.wrapS=t.wrapT=T.RepeatWrapping;return t;})());}
 // ---------------- console wings (widescreen): a screen and a bank of real switches on each side ----------------
 let deckObjs=null,wingTex=[];
 function buildDeck(A,g,deck,onC){deckObjs={};wingTex=[];const base=new T.MeshStandardMaterial({color:0x1a2030,metalness:.7,roughness:.4,side:T.DoubleSide}),chrome=new T.MeshStandardMaterial({color:0xc8d0e0,metalness:.95,roughness:.18,side:T.DoubleSide});
  deck.wings.forEach((wg,i)=>{const[x0,x1]=wg.x,tex=new T.CanvasTexture(wg.cv);tex.encoding=T.sRGBEncoding;tex.anisotropy=4;wingTex.push(tex);const P=[onC(x0,596),onC(x1,596),onC(x1,412),onC(x0,412)];
   {const wm=new T.Mesh(quadGeo(P,[[0,0],[1,0],[1,1],[0,1]]),new T.MeshBasicMaterial({map:tex,toneMapped:false,side:T.DoubleSide}));g.add(wm);scrMeshes.push(wm);}
   const P2=[onC(x0-5,600,52.6),onC(x1+5,600,52.6),onC(x1+5,407,52.6),onC(x0-5,407,52.6)];g.add(new T.Mesh(quadGeo(P2,[[0,0],[1,0],[1,1],[0,1]]),new T.MeshStandardMaterial({color:0x0a0e18,metalness:.6,roughness:.3,side:T.DoubleSide})));});
  for(const s of (deck.drawn?[]:deck.sws)){const cx=s.x+15,cy=s.y+24,P=onC(cx,cy),Px=onC(cx+8,cy),Py=onC(cx,cy-8);let tx=Px.map((v,k)=>v-P[k]),ty=Py.map((v,k)=>v-P[k]);const nl=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};tx=nl(tx);ty=nl(ty);
   let n=nl([tx[1]*ty[2]-tx[2]*ty[1],tx[2]*ty[0]-tx[0]*ty[2],tx[0]*ty[1]-tx[1]*ty[0]]);if(n[0]*-P[0]+n[1]*-P[1]+n[2]*-P[2]<0){n=n.map(x=>-x);tx=tx.map(x=>-x);}
   const piv=new T.Group();piv.matrixAutoUpdate=false;piv.matrix.makeBasis(new T.Vector3(...tx),new T.Vector3(...ty),new T.Vector3(...n));piv.matrix.setPosition(...P.map(c=>c*.993));g.add(piv);
   const sc=Math.hypot(...P)/80*.62;const plate=new T.Mesh(new T.BoxGeometry(5.4*sc,4.2*sc,.8*sc),base);plate.position.z=.4*sc;piv.add(plate);let o={kind:s.kind,sc};
   if(s.kind==='knob'){const kn=new T.Group();kn.position.z=.8*sc;piv.add(kn);const cyl=new T.Mesh(new T.CylinderGeometry(1.9*sc,2.1*sc,1.6*sc,20),base);cyl.rotation.x=Math.PI/2;cyl.position.z=.8*sc;kn.add(cyl);
    const ptr=new T.Mesh(new T.BoxGeometry(.45*sc,1.7*sc,.3*sc),new T.MeshBasicMaterial({color:0xffffff}));ptr.position.set(0,.85*sc,1.7*sc);kn.add(ptr);o.knob=kn;o.cap=ptr;}
   else{const pv=new T.Group();pv.position.z=.8*sc;piv.add(pv);const lev=new T.Mesh(new T.CylinderGeometry(.3*sc,.42*sc,3.4*sc,10),chrome);lev.rotation.x=Math.PI/2;lev.position.z=1.7*sc;pv.add(lev);
    const cap=new T.Mesh(new T.SphereGeometry(.85*sc,12,10),new T.MeshBasicMaterial({color:s.kind==='guard'?0xff2d55:0x2a3044}));cap.position.z=3.5*sc;pv.add(cap);o.lever=pv;o.cap=cap;
    if(s.kind==='guard'){const cover=new T.Mesh(new T.BoxGeometry(3.2*sc,3.2*sc,.4*sc),new T.MeshStandardMaterial({color:0xff2d55,transparent:true,opacity:.35,side:T.DoubleSide}));cover.position.set(0,-1.2*sc,3.4*sc);cover.rotation.x=-.9;pv.parent.add(cover);o.cover=cover;}}
   deckObjs[s.id]=o;}}
 function updDeck(deck,clock){if(!deckObjs)return;wingTex.forEach(t=>t.needsUpdate=true);for(const s of deck.sws){const o=deckObjs[s.id];if(!o)continue;const lit=s.col?new T.Color(s.col):null;
   if(o.knob){o.knob.rotation.z=-(s.pos||0)*Math.PI/2+Math.PI*.75;o.cap.material.color.set(s.hover?0xffe45e:lit||0xffffff);continue;}
   const up=s.kind==='toggle'?!!s.on:(clock-(s.flash||-9))<.28;const want=up?-.55:.5;o.lever.rotation.x+=(want-o.lever.rotation.x)*.45;
   if(s.kind!=='guard')o.cap.material.color.set(s.hover?0xffe45e:lit||0x2a3044);else o.cap.material.color.set(s.hover?0xffe45e:0xff2d55);if(o.cover)o.cover.rotation.x=s.hover?-2.2:-.9;}}
 function buildPit(A,deck){const CX=A.CX,CY=A.CY,F=A.FOC,g=new T.Group(),dark=new T.MeshStandardMaterial({color:0x232a3d,metalness:.55,roughness:.5,side:T.DoubleSide,flatShading:true}),
   frame=new T.MeshStandardMaterial({color:0x3b4562,metalness:.8,roughness:.32,side:T.DoubleSide,flatShading:true}),trim=new T.MeshStandardMaterial({color:0x66749c,metalness:.9,roughness:.22,side:T.DoubleSide,flatShading:true}),
   wall=new T.MeshStandardMaterial({color:0xffffff,map:wallTex(),metalness:.45,roughness:.6,side:T.DoubleSide}),add=(geo,m)=>{const me=new T.Mesh(geo,m);g.add(me);return me;},
   box=(w,h,d,x,y,z,m)=>{const me=new T.Mesh(new T.BoxGeometry(w,h,d),m);me.position.set(x,y,z);g.add(me);return me;},glow=(c)=>new T.MeshBasicMaterial({color:c});
  // the console: its sloping top passes exactly through the line where the old dashboard began (screen y = VH)
  const k=.24,y0=-50,z0=95,onC=(sx,sy)=>{const dx=(sx-CX)/F,dy=-(sy-CY)/F,z=(y0-k*z0)/(dy-k);return[dx*z,dy*z,z];},Zs=52,onS=(sx,sy,z=Zs)=>{const dx=(sx-CX)/F,dy=-(sy-CY)/F;return[dx*z,dy*z,z];};scrMeshes=[];
  add(geoOf(SL.hull([[-270,-50,95],[270,-50,95],[-270,-63.2,40],[270,-63.2,40],[-270,-150,95],[270,-150,95],[-270,-150,40],[270,-150,40]])),dark);
  add(beam([-262,-46.5,97],[262,-46.5,97],3.2),trim);const brow=add(beam([-252,-50.6,93.5],[252,-50.6,93.5],.55),glow(0x3fe0ff));pitLights.push(brow);
  // three live screens set into the console: ship systems, radar, flight
  dashTex=new T.CanvasTexture(document.createElement('canvas'));dashTex.encoding=T.sRGBEncoding;
  const screen=(x0,y0s,x1,y1s,u0,v0,u1,v1)=>{const P=[onS(x0,y1s),onS(x1,y1s),onS(x1,y0s),onS(x0,y0s)];const m=new T.Mesh(quadGeo(P,[[u0,v0],[u1,v0],[u1,v1],[u0,v1]]),new T.MeshBasicMaterial({map:dashTex,toneMapped:false,side:T.DoubleSide}));g.add(m);scrMeshes.push(m);
   const P2=[onS(x0-6,y1s+5,Zs+.6),onS(x1+6,y1s+5,Zs+.6),onS(x1+6,y0s-5,Zs+.6),onS(x0-6,y0s-5,Zs+.6)];g.add(new T.Mesh(quadGeo(P2,[[0,0],[1,0],[1,1],[0,1]]),new T.MeshStandardMaterial({color:0x10151f,metalness:.7,roughness:.3,side:T.DoubleSide})));};
  screen(22,414,252,592,0,0,250/800,1);screen(262,410,538,596,250/800,0,550/800,.82);screen(548,414,778,592,550/800,0,1,1);
  // canopy: pillars, a bow across the top of the view, sills, rails and a spine; glass with the sun's glare
  for(const sx of[-1,1]){const base=[sx*178,-50,95],mid=[sx*128,92,58],top=[sx*70,124,-6];add(beam(base,mid,4.2),frame);add(beam(mid,top,3.6),frame);add(beam([sx*178,-50,95],[sx*178,-50,-92],3.4),frame);
   const sill=add(beam([sx*174,-47,92],[sx*174,-47,-88],.55),glow(0x3fe0ff));pitLights.push(sill);add(beam(top,[sx*62,128,-92],3.2),frame);add(beam(mid,[sx*170,40,-60],2.6),frame);
   // side walls with panel detail, a side console and indicator lights
   const wl=new T.Mesh(new T.PlaneGeometry(190,104),wall);wl.position.set(sx*180,-100,2);wl.rotation.y=Math.PI/2;g.add(wl);
   add(geoOf(SL.hull([[sx*176,-52,80],[sx*120,-56,80],[sx*176,-52,-30],[sx*120,-56,-30],[sx*176,-110,80],[sx*120,-110,80],[sx*176,-110,-30],[sx*120,-110,-30]])),dark);
   for(let i=0;i<5;i++){const b=box(5,1.4,5,sx*(132+i*8),-56.5,40-i*13,glow([0x3cff6a,0xffb020,0x3fe0ff,0xff2d55,0x3fe0ff][i]));pitGlow.push(b);}
   box(14,48,12,sx*34,-6,-40,dark);box(16,4,14,sx*34,20,-40,trim);}
  {const pts=[];for(let i=0;i<=16;i++){const t=i/16,x=-150+300*t,y=58+Math.pow(Math.abs(t-.5)*2,2)*30;pts.push([x,y,118-Math.abs(t-.5)*40]);}for(let i=0;i<16;i++)add(beam(pts[i],pts[i+1],2.4),frame);}
  add(beam([0,124,40],[0,129,-92],3),frame);
  const glass=new T.Mesh(new T.SphereGeometry(300,48,24,0,Math.PI*2,0,Math.PI*.56),new T.MeshStandardMaterial({color:0x9cc4ff,transparent:true,opacity:.045,roughness:.06,metalness:.1,depthWrite:false,side:T.DoubleSide}));glass.position.set(0,-48,0);g.add(glass);
  // rear bulkhead, a flight stick and a throttle
  {const bw=new T.Mesh(new T.PlaneGeometry(356,262),wall);bw.position.set(0,-20,-94);g.add(bw);}
  box(60,12,40,0,-118,52,dark);add(beam([0,-112,52],[0,-80,60],2.2),trim);{const k2=new T.Mesh(new T.SphereGeometry(5,12,10),dark);k2.position.set(0,-78,61);g.add(k2);}
  add(beam([-146,-56,20],[-146,-40,30],1.8),trim);{const k3=new T.Mesh(new T.SphereGeometry(4.5,12,10),glow(0xff8a1c));k3.position.set(-146,-39,31);g.add(k3);pitGlow.push(k3);}
  pitLamp=new T.PointLight(0x3fe0ff,.85,520,1.4);pitLamp.position.set(0,70,10);g.add(pitLamp);
  deckObjs=null;wingTex=[];if(deck&&deck.wings.length)buildDeck(A,g,deck,onS);
  root.add(g);return g;}
 function cockpit(A,on,red,clock,dash,deck){if(!ready())return;if(pit&&pit.parent&&pit.parent!==root)root.add(pit);if(!on){if(pit)pit.visible=false;return;}const key=A.W+'x'+A.VH+'x'+A.CY+'|'+(deck?deck.key:'');if(!pit||pitKey!==key){if(pit)root.remove(pit);pitLights=[];pitGlow=[];pit=buildPit(A,deck);pitKey=key;}pit.visible=true;if(deck)updDeck(deck,clock);
  if(dash&&dashTex){if(dashTex.image!==dash)dashTex.image=dash;dashTex.needsUpdate=true;}
  // head sway: the cabin shifts a little against acceleration and turns, then settles
  const P=A.P,acc=(P.speed-lastSpeed);lastSpeed=P.speed;const want=[-(P.yaw||0)*2.6+(P.roll||0)*.8,(P.pitch||0)*2.2-Math.max(-2,Math.min(2,acc*.05)),-Math.max(-3,Math.min(3,acc*.12))];for(let i=0;i<3;i++)sway[i]+=(want[i]-sway[i])*.08;
  const o=P.o,pos=[P.pos[0]+o.r[0]*sway[0]+o.u[0]*sway[1]+o.f[0]*sway[2],P.pos[1]+o.r[1]*sway[0]+o.u[1]*sway[1]+o.f[1]*sway[2],P.pos[2]+o.r[2]*sway[0]+o.u[2]*sway[1]+o.f[2]*sway[2]];setBasis(pit,pos,o);
  const pulse=Math.sin(clock*9)>0,col=red?(pulse?0xff2d55:0x5a0a1a):0x3fe0ff;for(const s2 of pitLights)s2.material.color.setHex(col);if(pitLamp){pitLamp.color.setHex(red?0xff2d55:0x3fe0ff);pitLamp.intensity=red?(pulse?1.6:.5):.85;}
  pitGlow.forEach((b,i)=>{b.visible=((clock*(.6+i*.13)+i*.37)%1)>.18;});
  const dmg=P.hull||0,flick=dmg>.3&&Math.random()<dmg*.12,glitch=(clock-(A.lastHitT||-9))<.35;for(const m of scrMeshes)m.material.color.setScalar(glitch?(Math.random()<.5?.25:1.4):flick?.35+Math.random()*.3:1);
  if(pitLamp&&(flick||glitch))pitLamp.intensity*=.3+Math.random()*.5;
  if(A.lastHitT!==undefined&&A.lastHitT!==lastHitSeen&&(clock-A.lastHitT)<.2){lastHitSeen=A.lastHitT;const n=2+Math.round(dmg*4);for(let i=0;i<n;i++){const L=[(Math.random()-.5)*300,-44+Math.random()*6,60+Math.random()*30],w=[P.pos[0]+o.r[0]*L[0]+o.u[0]*L[1]+o.f[0]*L[2],P.pos[1]+o.r[1]*L[0]+o.u[1]*L[1]+o.f[1]*L[2],P.pos[2]+o.r[2]*L[0]+o.u[2]*L[1]+o.f[2]*L[2]];burst(w,10,40,.45,[1.6,1.1,.4]);}}
  if(dmg>.5&&Math.random()<(dmg-.5)*.08){const L=[(Math.random()-.5)*280,-46,70+Math.random()*20],w=[P.pos[0]+o.r[0]*L[0]+o.u[0]*L[1]+o.f[0]*L[2],P.pos[1]+o.r[1]*L[0]+o.u[1]*L[1]+o.f[1]*L[2],P.pos[2]+o.r[2]*L[0]+o.u[2]*L[1]+o.f[2]*L[2]];burst(w,4,25,.35,[1.4,.9,.3]);}}
 // ---------------- 3D hangar for the docking and launch movies ----------------
 let hs=null,hcam=null,hobjs=new Map();
 function hangarTex(){return texCache.floor||(texCache.floor=(()=>{const t=cv(512,512,(c,w,h)=>{c.fillStyle='#3a3f4c';c.fillRect(0,0,w,h);const r=rnd(5);for(let i=0;i<300;i++){c.fillStyle=`rgba(0,0,0,${r()*.12})`;c.fillRect(r()*w,r()*h,r()*60,r()*60);}c.strokeStyle='rgba(10,12,20,.8)';c.lineWidth=3;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(i*128,0);c.lineTo(i*128,h);c.stroke();c.beginPath();c.moveTo(0,i*128);c.lineTo(w,i*128);c.stroke();}});t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(4,10);return t;})());}
 function buildHangar(HG,PADS){hs=new T.Scene();hs.background=new T.Color(0x05070d);hcam=new T.PerspectiveCamera(50,2,5,2e5);hcam.matrixAutoUpdate=false;const X=HG.x,F=HG.yF,Cc=HG.yC,Z=HG.z1,M3=(x,y,z)=>new T.Vector3(...M([x,y,z]));
  const box=(w,h,d,col,o={})=>new T.Mesh(new T.BoxGeometry(w,h,d),o.basic?new T.MeshBasicMaterial({color:col}):new T.MeshStandardMaterial({color:col,metalness:o.metal??.5,roughness:o.rough??.6,map:o.map||null}));
  const put=(m,x,y,z)=>{m.position.copy(M3(x,y,z));hs.add(m);return m;};
  put(box(2*X,4,Z+600,0xffffff,{map:hangarTex(),metal:.6,rough:.55}),0,F-2,Z/2);put(box(2*X,4,Z+600,0x1a1f30),0,Cc+2,Z/2);
  put(box(4,Cc-F,Z+600,0x232a40,{metal:.4}),-X,(F+Cc)/2,Z/2);put(box(4,Cc-F,Z+600,0x232a40,{metal:.4}),X,(F+Cc)/2,Z/2);put(box(2*X,Cc-F,4,0x1d2338),0,(F+Cc)/2,Z+300);
  for(const[y0,h0]of[[F,(Cc-F)/2-80],[(F+Cc)/2+80,(Cc-F)/2-80]])put(box(2*X,h0,4,0x1d2338),0,y0+h0/2,-2);for(const sx of[-1,1])put(box(X-260,160,4,0x1d2338),sx*(260+(X-260)/2),(F+Cc)/2,-2);
  const stars=new T.Mesh(new T.PlaneGeometry(520,160),new T.MeshBasicMaterial({map:cv(256,80,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);for(let i=0;i<120;i++){c.fillStyle=`rgba(255,255,255,${Math.random()})`;c.fillRect(Math.random()*w,Math.random()*h,1,1);}})}));stars.position.copy(M3(0,(F+Cc)/2,-40));hs.add(stars);
  for(let z=200;z<Z;z+=400)for(const sx of[-1,1])put(box(30,Cc-F,30,0x2e3656,{metal:.7}),sx*(X-16),(F+Cc)/2,z);
  for(let z=300;z<Z;z+=680){const l=put(box(240,4,120,0xfff3c4,{basic:true}),0,Cc-4,z+60);const pl=new T.PointLight(0xffe6b0,1.1,2200,1.4);pl.position.copy(M3(0,Cc-60,z+60));hs.add(pl);}
  hs.add(new T.AmbientLight(0x6070a0,.35));hs.add(new T.HemisphereLight(0xbfc8ff,0x202020,.35));
  for(const[x,z]of PADS){put(box(300,3,300,0x2a3150,{metal:.6}),x,F+1.5,z);const ring=new T.Mesh(new T.RingGeometry(120,136,48),new T.MeshBasicMaterial({color:0xff8a1c,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.copy(M3(x,F+4,z));hs.add(ring);
   for(const[dx,dz]of[[-140,-140],[140,-140],[140,140],[-140,140]]){const L=put(new T.Mesh(new T.SphereGeometry(7,10,8),new T.MeshBasicMaterial({color:0xffb020})),x+dx,F+8,z+dz);L.userData.blink=x+z+dx;}}
  for(let i=0;i<14;i++){const st=put(box(50,2,8,0xffd23a,{basic:true}),-X+60+i*((2*X-120)/13),F+1,60);st.rotation.y=.6;}}
 function hangar(ctx,A,H){if(!ready())return false;if(!hs)buildHangar(A.HG,A.PADS);const W=A.W;const live=new Set();
  for(const o of A.objs){live.add(o.key);let g=hobjs.get(o.key);if(!g){g=new T.Group();g.add(new T.Mesh(geoOf(o.m),metal(o.col,{metal:.6})));if(o.engine){const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0x3fe0ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,-98);e.scale.set(80,80,1);e.userData.engine=true;g.add(e);}if(o.blink){const l=new T.Mesh(new T.SphereGeometry(6,8,6),new T.MeshBasicMaterial({color:0xff2d55}));l.position.set(0,14,0);l.userData.b=true;g.add(l);}hs.add(g);hobjs.set(o.key,g);}
   setBasis(g,o.pos,o.o);g.children.forEach(x=>{if(x.userData.engine)x.visible=o.engine>0;if(x.userData.b)x.material.color.setHex(Math.floor(A.t*3)%2?0xff2d55:0x3cff6a);});}
  for(const[k,g]of hobjs)if(!live.has(k)){hs.remove(g);hobjs.delete(k);}
  hs.traverse(x=>{if(x.userData&&x.userData.blink!==undefined)x.visible=Math.sin(A.t*4+x.userData.blink)>0;});
  const C2=A.CAM,r=M(C2.r),u=M(C2.u),f=M(C2.f).map(q=>-q),p=M(C2.pos);hcam.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);hcam.matrixWorld.copy(hcam.matrix);hcam.matrixWorldInverse.copy(hcam.matrix).invert();
  const k=Math.max(1,Math.min(ctx.canvas.width/W,1920/W)),w=Math.round(W*quality.pr*k),h=Math.round(H*quality.pr*k);if(gl.width!==w||gl.height!==h){R.setSize(w,h,false);comp.setSize(w,h);bloom.resolution.set(w,h);}R.setScissorTest(false);R.setViewport(0,0,w,h);
  {const sc=w/W,ppx=(A.CX??W/2)*sc,ppy=(A.CY??H/2)*sc,foc=A.FOC*sc,n=hcam.near;hcam.projectionMatrix.makePerspective(-ppx/foc*n,(w-ppx)/foc*n,ppy/foc*n,-(h-ppy)/foc*n,n,hcam.far);hcam.projectionMatrixInverse.copy(hcam.projectionMatrix).invert();}
  if(A.pit){const key=A.W+'x'+A.VH+'x'+A.CY+'|';if(!pit||pitKey!==key){if(pit&&pit.parent)pit.parent.remove(pit);pitLights=[];pitGlow=[];pit=buildPit(A,null);pitKey=key;}if(pit.parent!==hs)hs.add(pit);pit.visible=true;setBasis(pit,A.pitPos,A.pitO);
   if(A.dash&&dashTex){if(dashTex.image!==A.dash)dashTex.image=A.dash;dashTex.needsUpdate=true;}for(const m of scrMeshes)m.material.color.setScalar(1);if(pitLamp){pitLamp.color.setHex(0x3fe0ff);pitLamp.intensity=.7;}for(const s2 of pitLights)s2.material.color.setHex(0x3fe0ff);}
  else if(pit&&pit.parent===hs){root.add(pit);pit.visible=false;}
  R.render(hs,hcam);ctx.drawImage(gl,0,0,W,H);return true;}
 // extra cameras for the cockpit's side windows and mirror: rendered straight after the main view into small regions of
 // the same WebGL canvas, then copied through each window's shape. {o:{r,u,f}, pos, fov, rect:[x,y,w,h], clip(ctx), mirror}
 function views(ctx,A,list,scale){if(!ready()||!quality.views)return false;const W=A.W,VH=A.VH,pw=(scale||Math.max(1,Math.min(3,ctx.canvas.width/W)))*quality.pr,ph=pw,pv=pit&&pit.visible;if(pit)pit.visible=false;R.setScissorTest(true);
  for(const v of list){const[x,y,w,h]=v.rect,gx=0,gy=0,gw=Math.min(gl.width,Math.round(w*pw)),gh=Math.min(gl.height,Math.round(h*ph));if(gw<2||gh<2)continue;
   const r=M(v.o.r),u=M(v.o.u),f=M(v.o.f).map(q=>-q),p=M(v.pos);cam2.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);cam2.matrixWorld.copy(cam2.matrix);cam2.matrixWorldInverse.copy(cam2.matrix).invert();
   cam2.fov=v.fov;cam2.aspect=w/h;cam2.updateProjectionMatrix();starField.position.set(...p);R.setViewport(gx,gy,gw,gh);R.setScissor(gx,gy,gw,gh);R.render(scene,cam2);
   ctx.save();v.clip(ctx);ctx.clip();if(v.mirror){ctx.translate(x+w,0);ctx.scale(-1,1);ctx.drawImage(gl,gx,gl.height-gy-gh,gw,gh,0,y,w,h);}else ctx.drawImage(gl,gx,gl.height-gy-gh,gw,gh,x,y,w,h);ctx.restore();}
  R.setScissorTest(false);R.setViewport(0,0,gl.width,gl.height);if(pit)pit.visible=pv;return true;}
 let pmul=1;
 const PRESET={low:{pr:.6,bloom:false,views:false},medium:{pr:.8,bloom:true,views:false},high:{pr:1,bloom:true,views:true},ultra:{pr:1.35,bloom:true,views:true}};
 function setQuality(q){if(q==='auto'){quality.auto=true;return;}quality.auto=false;Object.assign(quality,PRESET[q]||PRESET.high);}
 function pregen(seed){try{terrain((seed^0x5151)>>>0);terrain(seed^0x5151);}catch(e){}}
 function profile(dev){if(dev==='phone'){Object.assign(quality,{pr:.6,bloom:false,views:false});pmul=.4;}else if(dev==='tablet'){Object.assign(quality,{pr:.8,views:false});pmul=.7;}else pmul=1;}
 return{setQuality,pregen,cockpit,hangar,profile,load,ready,render,views,get state(){return state;},get quality(){return quality;}};
})();
