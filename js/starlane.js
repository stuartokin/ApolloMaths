'use strict';
// =====================================================================================================
// STARLANE TRADER — an original space-trading game in the style of the 1984 wireframe classics.
// Original names, ships, systems, goods and text; the classic mechanics (procedural galaxy, market economy,
// rotating-station docking, hyperspace, legal status, 3D scanner) are recreated from published research.
// =====================================================================================================
const SL=(()=>{
 // ---------- vector maths ----------
 const V=(x=0,y=0,z=0)=>[x,y,z],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
  dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=a=>Math.hypot(a[0],a[1],a[2]),
  norm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l];};
 // rotate vector v around unit axis k by angle t (Rodrigues)
 const rot=(v,k,t)=>{const c=Math.cos(t),s=Math.sin(t),kv=cross(k,v),kd=dot(k,v);return[v[0]*c+kv[0]*s+k[0]*kd*(1-c),v[1]*c+kv[1]*s+k[1]*kd*(1-c),v[2]*c+kv[2]*s+k[2]*kd*(1-c)];};
 // an orientation is {r,u,f}: right, up, forward (orthonormal)
 const ortho=o=>{o.f=norm(o.f);o.r=norm(cross(o.u,o.f));o.u=cross(o.f,o.r);};
 const toLocal=(o,v)=>[dot(v,o.r),dot(v,o.u),dot(v,o.f)];
 const toWorld=(o,v)=>add(add(mul(o.r,v[0]),mul(o.u,v[1])),mul(o.f,v[2]));
 // turn orientation o so its forward heads toward dir (unit), at most maxAng radians
 function steer(o,dir,maxAng){const c=Math.max(-1,Math.min(1,dot(o.f,dir)));const ang=Math.acos(c);if(ang<1e-4)return 0;let ax=cross(o.f,dir);if(len(ax)<1e-6)ax=o.u;ax=norm(ax);const t=Math.min(maxAng,ang);o.f=rot(o.f,ax,t);o.u=rot(o.u,ax,t);ortho(o);return ang;}

 // ---------- seeded random (mulberry32) ----------
 const rng=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};};
 const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),rp=(r,arr)=>arr[Math.floor(r()*arr.length)];

 // ---------- wireframe models: convex hull of a point cloud, coplanar faces merged ----------
 function hull(pts){const n=pts.length,planes=[],E=1e-6;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++){let nm=cross(sub(pts[j],pts[i]),sub(pts[k],pts[i]));const l=len(nm);if(l<1e-6)continue;nm=mul(nm,1/l);let d=dot(nm,pts[i]),pos=0,neg=0;
   for(let m=0;m<n;m++){const s=dot(nm,pts[m])-d;if(s>1e-4*Math.max(1,Math.abs(d)))pos++;else if(s<-1e-4*Math.max(1,Math.abs(d)))neg++;}
   if(pos&&neg)continue;if(pos){nm=mul(nm,-1);d=-d;}
   if(!planes.some(p=>dot(p.n,nm)>1-E&&Math.abs(p.d-d)<1e-3*Math.max(1,Math.abs(d))))planes.push({n:nm,d});}
  const faces=planes.map(p=>{const on=pts.map((q,i)=>i).filter(i=>Math.abs(dot(p.n,pts[i])-p.d)<1e-3*Math.max(1,Math.abs(p.d))+1e-6);
   const c=on.reduce((a,i)=>add(a,pts[i]),V()).map(x=>x/on.length);let ax=norm(sub(pts[on[0]],c));const ay=cross(p.n,ax);
   on.sort((a,b)=>{const va=sub(pts[a],c),vb=sub(pts[b],c);return Math.atan2(dot(va,ay),dot(va,ax))-Math.atan2(dot(vb,ay),dot(vb,ax));});return{n:p.n,d:p.d,v:on};});
  const em=new Map();faces.forEach((f,fi)=>f.v.forEach((a,i)=>{const b=f.v[(i+1)%f.v.length],key=a<b?a+'-'+b:b+'-'+a;if(!em.has(key))em.set(key,{a:Math.min(a,b),b:Math.max(a,b),f:[]});em.get(key).f.push(fi);}));
  const rad=Math.max(...pts.map(len));return{pts,faces,edges:[...em.values()],rad};}
 const ring=(n,r,y,z,off=0,sx=1)=>Array.from({length:n},(_,i)=>{const a=off+i*2*Math.PI/n;return[Math.cos(a)*r*sx,Math.sin(a)*r+y,z];});
 const sym=(list)=>{const out=[];for(const p of list){out.push(p);if(p[0])out.push([-p[0],p[1],p[2]]);}return out;};
 const MODELS={
  sparrow:hull(sym([[0,0,42],[34,-2,-22],[10,9,-18],[10,-6,-22],[0,11,-10],[0,-7,-12],[14,0,-28]])),
  raven:hull(sym([[0,0,58],[28,0,8],[46,-4,-30],[0,14,-24],[0,-11,-26],[18,8,-40],[18,-7,-40],[8,4,30]])),
  hauler:hull(sym([[22,14,-46],[22,-14,-46],[24,16,20],[24,-14,20],[10,8,42],[10,-8,42],[0,18,0]])),
  warden:hull(sym([[0,0,64],[26,-3,-30],[0,12,-24],[0,-9,-26],[12,5,-36],[12,-6,-36],[34,-5,-20]])),
  kestrel:hull(sym([[0,2,46],[44,-2,-20],[18,10,-24],[18,-8,-24],[26,0,8],[0,12,4],[0,-8,0]])),
  canister:hull([...ring(6,9,0,-12),...ring(6,9,0,12)]),
  missile:hull(sym([[0,0,26],[3,3,-22],[3,-3,-22],[7,0,-26]])),
  capsule:hull(sym([[0,0,12],[6,4,-6],[6,-4,-6]])),
  station:hull([...ring(8,280,0,-260,Math.PI/8),...ring(8,280,0,260,Math.PI/8),...ring(8,180,0,-330,Math.PI/8),...ring(8,180,0,330,Math.PI/8)]),
 };
 // ships are drawn at twice their design size so they read well at combat range (the station keeps its size)
 const scaleModel=(m,k)=>{m.pts=m.pts.map(p=>mul(p,k));m.faces.forEach(f=>f.d*=k);m.rad*=k;return m;};
 for(const k of['sparrow','raven','hauler','warden','kestrel','canister','missile','capsule'])scaleModel(MODELS[k],2);
 // the alien disc: flat octagon with domes above and below
 MODELS.vorn=scaleModel(hull([...ring(8,64,0,0).map(p=>[p[0],0,p[1]]),...ring(8,28,0,0).map(p=>[p[0],13,p[1]]),...ring(8,28,0,0).map(p=>[p[0],-13,p[1]])]),2);
 function asteroidModel(seed){const r=rng(seed),t=(1+Math.sqrt(5))/2,b=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
  const s=80+r()*100;return hull(b.map(p=>mul(norm(p),s*(.78+r()*.4))));}

 // ---------- ships (original designs and stats) ----------
 const SHIPS={
  sparrow:{name:'Sparrow',role:'pirate',model:'sparrow',speed:420,turn:2.1,energy:70,laser:5,bounty:50,cargo:1,color:'#ff4fd8',kill:1},
  raven:{name:'Raven',role:'pirate',model:'raven',speed:330,turn:1.5,energy:150,laser:8,bounty:120,cargo:3,missiles:1,color:'#ff2d55',kill:2},
  hauler:{name:'Hauler',role:'trader',model:'hauler',speed:220,turn:.9,energy:160,laser:4,bounty:0,cargo:5,color:'#3fe0ff',kill:1},
  kestrel:{name:'Kestrel',role:'trader',model:'kestrel',speed:300,turn:1.3,energy:140,laser:6,bounty:0,cargo:3,missiles:1,color:'#3cff6a',kill:2},
  warden:{name:'Warden',role:'police',model:'warden',speed:450,turn:2,energy:160,laser:9,bounty:0,cargo:0,missiles:2,color:'#ffffff',kill:2},
  vorn:{name:'Vorn Raider',role:'alien',model:'vorn',speed:380,turn:2.2,energy:220,laser:10,bounty:600,cargo:2,color:'#9dff2e',kill:6,relic:true},
  asteroid:{name:'Asteroid',role:'rock',model:null,speed:20,turn:.3,energy:60,laser:0,bounty:0,cargo:0,color:'#c8a070',kill:0},
  canister:{name:'Cargo canister',role:'cargo',model:'canister',speed:0,turn:.6,energy:12,laser:0,bounty:0,cargo:0,color:'#ffe45e',kill:0},
  missile:{name:'Missile',role:'missile',model:'missile',speed:700,turn:2.6,energy:5,laser:0,bounty:0,cargo:0,color:'#ff8a1c',kill:0},
  capsule:{name:'Escape capsule',role:'cargo',model:'capsule',speed:120,turn:.5,energy:8,laser:0,bounty:0,cargo:0,color:'#fff',kill:0},
 };

 // ---------- goods (original list; prices follow base + fluctuation + economy x factor) ----------
 // [name, unit, base price, economy factor, base quantity, fluctuation mask, illegal]
 const GOODS=[['Food Rations','t',18,-2,8,3],['Textiles','t',22,-1,12,3],['Spices','t',30,-3,7,7],['Medicines','t',44,3,6,7],['Minerals','t',12,-1,40,3],
  ['Alloys','t',36,2,14,7],['Machinery','t',60,5,10,7],['Robot Helpers','t',80,6,4,15],['Electronics','t',96,7,8,7],['Computers','t',130,10,5,15],
  ['Luxuries','t',100,8,6,15],['Exotic Plants','t',70,-5,4,15],['Precious Metals','kg',40,-2,20,7],['Gem Crystals','g',20,-1,30,7],
  ['Contraband Tech','t',150,9,3,63,true],['Blasters','t',90,1,6,31,true],['Alien Relics','t',220,0,0,31]];
 const ECON=['Rich Industrial','Average Industrial','Poor Industrial','Mainly Industrial','Mainly Agricultural','Rich Agricultural','Average Agricultural','Poor Agricultural'];
 const GOV=['Anarchy','Warlord State','Clan Council','Dictatorship','Collective','Confederacy','Democracy','Corporate Guild'];
 const GOVDESC=['No rulers and no police. Pirates everywhere — fly carefully!','Rival warlords fight over the system. Very dangerous.','Ruled by family clans. Few police.','One ruler with total power. Some police.','Everyone shares everything. Fairly safe.','A union of planets with a strong police force.','The people vote for their leaders. Safe, well policed.','Run by big companies. The safest — and the strictest.'];
 function marketPrices(sys,seed){const r=rng(seed),rnd=Math.floor(r()*256);const eco=sys.eco;
  return GOODS.map((g,i)=>{const [nm,unit,base,fac,bq,mask,ill]=g;let price=(base+(rnd&mask)+eco*fac)*4/10;if(sys.gov<=1&&ill)price*=.8;price=Math.max(.4,Math.round(price*10)/10);
   let qty=(bq+(rnd&mask)-eco*fac);qty=((qty%64)+64)%64;if(i===16)qty=0;if(ill&&sys.gov>=6)qty=0;if(i===13)qty=qty*3;return{price,qty};});}

 // ---------- equipment (price, minimum tech level) ----------
 const EQUIP=[
  {id:'fuel',name:'Hyperspace fuel (per light year)',price:2,tech:1},
  {id:'missile',name:'Missile',price:30,tech:1,max:4},
  {id:'cargo',name:'Large cargo bay (20t → 35t)',price:400,tech:1},
  {id:'ecm',name:'E.C.M. jammer (destroys incoming missiles)',price:600,tech:2},
  {id:'pulse',name:'Pulse laser (front)',price:400,tech:3,laser:'pulse'},
  {id:'beam',name:'Beam laser (front)',price:1000,tech:4,laser:'beam'},
  {id:'scoop',name:'Fuel scoops (fuel from suns, scoop cargo)',price:525,tech:5},
  {id:'pod',name:'Escape capsule (keeps your credits)',price:1000,tech:6},
  {id:'bomb',name:'Shock pulse (destroys nearby ships once)',price:900,tech:7},
  {id:'energy',name:'Extra energy unit (faster recharge)',price:1500,tech:8},
  {id:'dock',name:'Docking computer (automatic docking)',price:1500,tech:9},
  {id:'rearlaser',name:'Rear pulse laser',price:400,tech:3},
  {id:'mining',name:'Mining laser (splits asteroids)',price:800,tech:10,laser:'mining'},
  {id:'military',name:'Military laser (front)',price:6000,tech:11,laser:'military'},
 ];
 const LASERS={pulse:{dmg:9,rate:.28,heat:.07,col:'#ff2d55'},beam:{dmg:7,rate:.1,heat:.045,col:'#ff8a1c'},mining:{dmg:6,rate:.3,heat:.06,col:'#ffe45e'},military:{dmg:12,rate:.08,heat:.035,col:'#3fe0ff'}};
 const RANKS=[[0,'Rookie'],[8,'Cadet'],[24,'Pilot'],[64,'Skilled'],[160,'Veteran'],[400,'Expert'],[900,'Deadly'],[2000,'Ace'],[5000,'Legend']];
 const rankOf=p=>{let r=RANKS[0];for(const x of RANKS)if(p>=x[0])r=x;return r[1];};
 const legalName=l=>l>=50?'Fugitive':l>=1?'Offender':'Clean';

 // ---------- galaxy generator (original naming and description tables) ----------
 const SYL=['ka','ro','ve','lin','tor','mi','sa','zen','qua','el','ar','ob','ix','um','ha','de','no','ri','ce','la','te','vo','an','is','ul','ny','be','ga','or','fi','sol','tre','mu','pa','yr','cas','dor','ke'];
 const SPEC_A=['Tiny','Giant','Gentle','Fierce','Shy','Noisy','Clever','Spotted','Striped','Feathered','Furry','Scaly'];
 const SPEC_C=['Blue','Green','Golden','Silver','Red','Purple','Amber','Pale'];
 const SPEC_T=['Avians','Reptiloids','Amphibians','Felinoids','Crustaceans','Ursines','Insectoids','Molluscoids'];
 const D_FAME=['famous','well known','celebrated','admired','talked about across the sector','notorious','loved'];
 const D_THING=['floating mountain gardens','crystal desert festivals','zero-gravity football league','singing tidal caves','ancient orbital libraries','giant moon lanterns','storm-surfing championships','glass forest plantations','robot chess tournaments','purple sunset oceans','underground lava canals','sky-whale migrations','comet-ice sculptures','spicy orbital noodles','championship hover-racing'];
 const D_BAD=['frequent dust storms','grumpy customs officers','very long queues at the spaceport','unpredictable volcanoes','cheeky space gulls','a fondness for terrible poetry','meteor showers','power cuts every Tuesday'];
 function makeGalaxy(gseed,count){const r=rng(gseed),names=new Set(),sys=[];
  for(let i=0;i<count;i++){let nm;do{const n=ri(r,2,3);nm='';for(let k=0;k<n;k++)nm+=rp(r,SYL);nm=nm[0].toUpperCase()+nm.slice(1);}while(names.has(nm)||nm.length<4||nm.length>9);names.add(nm);
   let gov=ri(r,0,7),eco=ri(r,0,7);if(gov<=1&&(eco===0||eco===5))eco+=1;
   const tech=Math.max(1,Math.min(14,1+ri(r,0,3)+((7-eco)>>1)+(gov>>1)+(eco<=3?2:0)));
   const pop=Math.round((tech*4+(7-eco)+gov+1)*10)/100*ri(r,6,14)/10;
   const human=r()<.4,species=human?'Human Colonists':`${rp(r,SPEC_A)} ${rp(r,SPEC_C)} ${rp(r,SPEC_T)}`;
   const desc=`${nm} is ${rp(r,D_FAME)} for its ${rp(r,D_THING)}${r()<.6?` and its ${rp(r,D_THING)}`:''}, but ${rp(r,['is troubled by','suffers from','is known for'])} ${rp(r,D_BAD)}.`;
   let x,y,tries=0;do{x=ri(r,4,251);y=ri(r,4,123);tries++;}while(tries<40&&sys.some(s=>Math.abs(s.x-x)<5&&Math.abs(s.y-y)<4));
   sys.push({i,name:nm,x,y,gov,eco,tech,pop:Math.max(.1,Math.round(pop*10)/10),species,desc,radius:2000+ri(r,0,5000),prod:Math.round(((eco^7)+3)*(gov+4)*Math.max(.1,pop)*80),seed:Math.floor(r()*2**31)});}
  return sys;}
 const dist=(a,b)=>Math.round(Math.hypot((a.x-b.x),(a.y-b.y)*1.6)*.22*10)/10;
 return{V,add,sub,mul,dot,cross,len,norm,rot,ortho,toLocal,toWorld,steer,rng,ri,rp,hull,MODELS,asteroidModel,SHIPS,GOODS,ECON,GOV,GOVDESC,marketPrices,EQUIP,LASERS,RANKS,rankOf,legalName,makeGalaxy,dist};
})();

function makeStarlane(env){
 const {V,add,sub,mul,dot,cross,len,norm,rot,ortho,toLocal,toWorld,steer,rng,ri,rp,MODELS,SHIPS,GOODS,ECON,GOV,EQUIP,LASERS,rankOf,legalName}=SL;
 const W=800,H=600,VH=420,CX=400,CY=210,FOC=380,GSEED=20261108,COUNT=160,GAL=SL.makeGalaxy(GSEED,COUNT);
 const G={W,H,score:0,lives:1,level:1,levelName:'Rank',over:false,preferFull:true};
 const FX=Retro.fx();
 // ---------------- commander (saved with the player's progress) ----------------
 function newCommander(){const start=GAL.find(s=>s.gov>=5&&s.tech>=6&&s.eco>=4)||GAL.find(s=>s.gov>=4)||GAL[0];
  return{v:1,sys:start.i,credits:100,fuel:7,cargo:{},cap:20,equip:{},front:'pulse',rear:null,missiles:3,legal:0,killPts:0,kills:0,day:1,missions:[],gov:{},news:[],visited:{[start.i]:1},target:null,invert:false,done:0,market:null,board:null};}
 let C=(()=>{const s=env.store&&env.store.get();return s&&s.v===1&&GAL[s.sys]?JSON.parse(JSON.stringify(s)):newCommander();})();
 const persist=()=>{if(env.store)env.store.set(JSON.parse(JSON.stringify(C)));};
 const sysOf=i=>{const s=GAL[i];return C.gov[i]!==undefined?{...s,gov:C.gov[i]}:s;};
 const here=()=>sysOf(C.sys);
 const cargoT=()=>Object.entries(C.cargo).reduce((a,[k,n])=>a+(GOODS[k][1]==='t'?n:0),0);
 const has=k=>!!C.equip[k];
 const syncScore=()=>{G.score=Math.max(0,Math.floor(C.credits));const rk=SL.RANKS.findIndex(r=>r[1]===rankOf(C.killPts));G.level=rk+1;};
 syncScore();
 function market(){if(!C.market||C.market.sys!==C.sys||C.market.day!==C.day){C.market={sys:C.sys,day:C.day,p:SL.marketPrices(here(),here().seed+C.day*7919)};}return C.market.p;}
 // ---------------- messages ----------------
 let msgs=[];const msg=(t,d=3,c='#ffe45e')=>{msgs=msgs.filter(m=>m.t!==t);msgs.push({t,d,c});if(msgs.length>3)msgs.shift();};
 // ---------------- state ----------------
 let mode='docked',tab='status',sel=0,selEq=0,selMis=0,chartMode='galaxy',anim=0,view='front',paused=false,overlay=null,clock=0,deathT=0,hyperT=0,hyperTo=null,interdicted=false,podArm=0;
 // flight world
 let apFinal=false,P,planet,station,sun,ships=[],dust=[],booms=[],spawnT=0,laserT=0,firing=false,laserShow=0,dockComp=false,jump=false,massLock=false,ecmT=0,dockMusic=null,lastHit=0;
 const SAFE=16000;
 function buildSystem(deep){const s=here(),r=rng(s.seed+C.day*31);ships=[];booms=[];
  if(deep){planet=null;station=null;sun=null;return;}
  const R=4200+s.radius*.35;planet={pos:V(0,0,0),R,o:{r:V(1,0,0),u:V(0,1,0),f:V(0,0,1)},spin:.02};
  const sd=norm(V(r()*2-1,(r()-.5)*.6,r()*2-1));const spos=mul(sd,R*1.75);const sf=norm(sub(planet.pos,spos));
  const so={f:sf,u:norm(cross(sf,V(1,0,0.3))),r:V(1,0,0)};ortho(so);station={type:'station',m:MODELS.station,pos:spos,o:so,spin:.32,energy:9999};
  const sunDir=norm(V(r()*2-1,(r()-.5)*.4,r()*2-1));sun={pos:mul(sunDir,R*42),R:R*4.5};}
 function placeAtArrival(){const s=station;const d=norm(sub(s.pos,planet.pos));const side=norm(cross(d,V(0,1,0)));
  const pos=add(add(planet.pos,mul(d,planet.R*13)),mul(side,planet.R*2));const f=norm(sub(s.pos,pos));const o={f,u:V(0,1,0),r:V(1,0,0)};ortho(o);P.pos=pos;P.o=o;}
 function newPlayer(){const lasers=C.front||'pulse';P={pos:V(),o:{r:V(1,0,0),u:V(0,1,0),f:V(0,0,1)},speed:0,throttle:.3,max:330,shF:100,shA:100,energy:100,cabin:20,heat:0,roll:0,pitch:0,cool:0};}
 function initDust(){dust=Array.from({length:70},()=>[ (Math.random()-.5)*1600,(Math.random()-.5)*1100,100+Math.random()*1500]);}
 // ---------------- ships in the local bubble ----------------
 function spawn(type,pos,opts={}){const T=SHIPS[type],m=type==='asteroid'?SL.asteroidModel(Math.floor(Math.random()*1e9)):MODELS[T.model];
  const f=opts.f||norm(V(Math.random()-.5,Math.random()-.5,Math.random()-.5)),o={f,u:V(0,1,0),r:V(1,0,0)};if(Math.abs(dot(f,o.u))>.95)o.u=V(1,0,0);ortho(o);
  const sh={type,T,m,pos,o,speed:opts.speed!==undefined?opts.speed:T.speed*.5,energy:(opts.energy||T.energy),max:opts.energy||T.energy,angry:!!opts.angry,target:opts.target||null,cool:Math.random(),missiles:T.missiles||0,mission:opts.mission||null,name:opts.name||T.name,bounty:opts.bounty!==undefined?opts.bounty:T.bounty,spinA:(Math.random()-.5)*.8,spinB:(Math.random()-.5)*.6,life:opts.life||0,breakT:0,legalClean:opts.clean!==undefined?opts.clean:T.role!=='pirate',cargo:opts.cargo};
  ships.push(sh);return sh;}
 function aroundPlayer(d,spread=1){const dir=norm(add(mul(P.o.f,.3+Math.random()*.6),V((Math.random()-.5)*2*spread,(Math.random()-.5)*spread,(Math.random()-.5)*2*spread)));return add(P.pos,mul(dir,d));}
 function spawnTick(dt){spawnT-=dt;if(spawnT>0||!planet)return;spawnT=8+Math.random()*8;const s=here(),n=ships.filter(x=>['pirate','trader','police','alien'].includes(x.T.role)).length;if(n>=6)return;
  const inSafe=station&&len(sub(P.pos,station.pos))<SAFE,r=Math.random();
  if(!inSafe&&r<(8-s.gov)/18){const k=s.gov<=1&&Math.random()<.5?ri(Math.random,2,3):1;for(let i=0;i<k;i++)spawn(Math.random()<.6?'sparrow':'raven',aroundPlayer(6500+i*300),{angry:true,target:'player'});msg(k>1?'PIRATES!':'PIRATE ON SCANNER',3,'#ff2d55');return;}
  if(r<.45){const t=spawn(Math.random()<.6?'hauler':'kestrel',aroundPlayer(7000,1.5),{});t.goal=station?station.pos:null;return;}
  if((inSafe&&r<.6)||(C.legal>=50&&r<.7)){spawn('warden',station&&inSafe?add(station.pos,mul(station.o.f,520)):aroundPlayer(6000),{angry:C.legal>=50,target:C.legal>=50?'player':null,f:station&&inSafe?station.o.f:undefined,speed:300});if(C.legal>=50)msg('POLICE ARE AFTER YOU!',3,'#ff2d55');return;}
  if(r<.68&&!inSafe){spawn('asteroid',aroundPlayer(5000,2),{speed:10});return;}
  if(r<.72&&!inSafe){const tr=spawn('hauler',aroundPlayer(5200),{});for(let i=0;i<2;i++){const p=spawn('sparrow',add(tr.pos,V(300*(i?1:-1),80,-200)),{angry:true,target:tr});p.distress=tr;}tr.distress=true;msg('MAYDAY! A TRADER IS UNDER ATTACK!',4,'#ff8a1c');}}
 // mission ships waiting in a system
 function missionSpawns(){for(const m of C.missions){if(m.sys!==C.sys)continue;
   if(m.type==='bounty'&&!m.killed){const L=spawn('raven',aroundPlayer(9000),{angry:true,target:'player',energy:320,name:m.target,bounty:0,mission:m.id});L.leader=true;for(let i=0;i<2;i++)spawn('sparrow',add(L.pos,V(i?400:-400,100,0)),{angry:true,target:'player',mission:null});msg(`WANTED PIRATE ${m.target.toUpperCase()} IS HERE!`,4,'#ff2d55');}
   if(m.type==='political'&&m.kills<m.need){for(let i=0;i<m.need-m.kills;i++)spawn('raven',aroundPlayer(8000+i*500),{angry:true,target:'player',name:m.patrol,mission:m.id,bounty:60});msg(`${m.patrol.toUpperCase()} SHIPS DETECTED`,4,'#ff8a1c');}}}
 // ---------------- launching, docking, hyperspace ----------------
 function launch(){newPlayer();buildSystem(false);P.pos=add(station.pos,mul(station.o.f,420));P.o={f:station.o.f.slice(),u:station.o.u.slice(),r:station.o.r.slice()};P.speed=120;P.throttle=.4;initDust();spawnT=6;dockComp=false;jump=false;
  // illegal cargo may be spotted by customs as you leave
  const ill=Object.keys(C.cargo).filter(k=>GOODS[k][6]&&C.cargo[k]>0);if(ill.length&&here().gov>=3&&Math.random()<.5){C.legal+=6*ill.length;msg('CUSTOMS SCANNED YOUR CARGO — LEGAL STATUS: '+legalName(C.legal).toUpperCase(),4,'#ff2d55');}
  mode='launch';anim=0;env.beep(200,1.2,'sawtooth',.04,3);missionSpawns();}
 function docked(auto){stopMusic();mode='dockAnim';anim=0;env.beep(600,.9,'triangle',.05,.4);
  // arriving: complete deliveries, refresh the board, save
  C.visited[C.sys]=1;finishDock();}
 function finishDock(){P&&(P.speed=0);const s=here();const done=[];
  for(const m of C.missions){if(m.type==='courier'&&m.dest===C.sys){C.credits+=m.reward;done.push(m);msg(`PACKAGE DELIVERED: +${m.reward} CR`,4,'#3cff6a');}
   if(m.type==='bounty'&&m.killed&&m.from===C.sys){C.credits+=m.reward;done.push(m);msg(`BOUNTY PAID: +${m.reward} CR`,4,'#3cff6a');}
   if(m.type==='political'&&m.sys===C.sys&&!m.delivered&&(C.cargo[m.good]||0)>=m.qty){C.cargo[m.good]-=m.qty;m.delivered=true;msg(`${m.qty}t ${GOODS[m.good][0].toUpperCase()} DELIVERED TO THE RESISTANCE`,4,'#3cff6a');}
   if(m.type==='political'&&m.delivered&&m.kills>=m.need&&!m.won){m.won=true;const old=GOV[sysOf(m.sys).gov];C.gov[m.sys]=m.newGov;C.credits+=m.reward;done.push(m);
    C.news.unshift({day:C.day,t:`${GAL[m.sys].name}: ${old} replaced by a ${GOV[m.newGov]} after help from Commander ${(env.names&&env.names[0])||'Pilot'}.`});C.news=C.news.slice(0,20);msg(`${GAL[m.sys].name.toUpperCase()} IS NOW A ${GOV[m.newGov].toUpperCase()}! +${m.reward} CR`,6,'#3cff6a');}}
  C.missions=C.missions.filter(m=>!done.includes(m)&&!(m.deadline&&C.day>m.deadline&&(m.failed=true)));C.done+=done.length;
  C.board=null;syncScore();persist();}
 function crash(dmg,why){hurt(dmg,P.o.f,true);msg(why,2,'#ff2d55');FX.shake(10);env.noise(.4,.08,600);}
 function checkDock(){const s=station;const d=sub(P.pos,s.pos),loc=toLocal(s.o,d),dist=len(d);const front=330;
  if(dist>s.m.rad+30)return;
  const inCone=loc[2]>front-40&&loc[2]/dist>Math.cos(22*Math.PI/180),facing=dot(P.o.f,s.o.f)<-Math.cos(26*Math.PI/180),
   level=Math.abs(dot(s.o.r,P.o.u))<Math.sin(34*Math.PI/180),slow=P.speed<P.max*.45,slotHit=Math.abs(loc[0])<120&&Math.abs(loc[1])<45;
  if(inCone&&facing&&level&&slow&&slotHit){docked();return;}
  if(loc[2]>front-10&&Math.hypot(loc[0],loc[1])<300){ // hit the front face
   crash(30+P.speed*.2,!facing?'WRONG ANGLE!':!level?'MATCH THE SLOT’S ROTATION!':!slow?'TOO FAST TO DOCK!':'MISSED THE SLOT!');
   P.pos=add(s.pos,mul(s.o.f,front+s.m.rad*.2+80));P.speed=0;P.throttle=0;return;}
  crash(40+P.speed*.2,'COLLISION WITH THE STATION!');P.pos=add(s.pos,mul(norm(d),s.m.rad+90));P.speed=0;P.throttle=0;}
 function startHyper(){if(!C.target&&C.target!==0){msg('CHOOSE A DESTINATION ON THE CHART FIRST',3);return;}if(C.target===C.sys){msg('YOU ARE ALREADY THERE',2);return;}
  const d=SL.dist(GAL[C.sys],GAL[C.target]);if(d>C.fuel+1e-6){msg(`NOT ENOUGH FUEL (NEED ${d} LY)`,3,'#ff2d55');return;}if(hyperT>0){hyperT=0;msg('HYPERSPACE CANCELLED',2);return;}
  hyperT=5;hyperTo=C.target;msg(`HYPERSPACE TO ${GAL[C.target].name.toUpperCase()}`,2,'#3fe0ff');}
 function doHyper(){const d=SL.dist(GAL[C.sys],GAL[hyperTo]);const alien=Math.random()<.03+(here().gov<=1?.02:0);mode='hyper';anim=0;env.beep(120,2.4,'sawtooth',.05,6);
  if(alien){C.fuel=Math.max(0,C.fuel-d/2);interdicted=true;}else{C.fuel=Math.max(0,C.fuel-d);C.sys=hyperTo;interdicted=false;}
  C.day+=1+Math.round(d/2.5);C.legal=Math.floor(C.legal*.6);C.target=interdicted?hyperTo:null;stopMusic();}
 function arrive(){initDust();if(interdicted){buildSystem(true);P.pos=V(0,0,0);P.o={r:V(1,0,0),u:V(0,1,0),f:V(0,0,1)};for(let i=0;i<3;i++){const v=spawn('vorn',add(P.pos,V((i-1)*900,200,4000)),{angry:true,target:'player'});}msg('INTERDICTED! ALIEN VORN RAIDERS!',5,'#9dff2e');msg('DESTROY THEM, THEN HYPERSPACE ON',5,'#9dff2e');}
  else{buildSystem(false);placeAtArrival();C.visited[C.sys]=1;missionSpawns();msg(`WELCOME TO ${here().name.toUpperCase()}`,4,'#3fe0ff');}
  P.speed=150;P.throttle=.5;mode='flight';}
 // ---------------- combat ----------------
 function hurt(d,fromDir,collision){const front=dot(fromDir,P.o.f)>0;if(front){P.shF-=d;if(P.shF<0){P.energy+=P.shF;P.shF=0;}}else{P.shA-=d;if(P.shA<0){P.energy+=P.shA;P.shA=0;}}
  lastHit=.25;FX.shake(Math.min(8,2+d*.2));env.noise(.15,.05,1800);if(P.energy<=0)die();}
 function die(){if(mode!=='flight')return;mode='dead';deathT=0;stopMusic();env.noise(1.2,.1,400);FX.shake(14);for(let i=0;i<4;i++)booms.push({pos:add(P.pos,mul(P.o.f,40)),t:0,lines:[]});}
 function boom(sh){FX.shake(5);env.noise(.6,.08,700);const lines=sh.m.edges.slice(0,30).map(e=>{const a=add(sh.pos,toWorld(sh.o,sh.m.pts[e.a])),b=add(sh.pos,toWorld(sh.o,sh.m.pts[e.b]));const c=mul(add(a,b),.5),v=mul(norm(sub(c,sh.pos)),60+Math.random()*120);return{a:sub(a,c),b:sub(b,c),c,v};});booms.push({pos:sh.pos,t:0,lines,col:sh.T.color});}
 function kill(sh,byPlayer){sh.dead=true;boom(sh);
  if(byPlayer){const T=sh.T;C.kills+=T.kill?1:0;C.killPts+=T.kill;
   if(sh.bounty&&!sh.legalClean){C.credits+=sh.bounty;msg(`BOUNTY +${sh.bounty} CR`,3,'#3cff6a');}
   if(sh.legalClean&&['trader','police'].includes(T.role)){C.legal+=T.role==='police'?40:12;msg('LEGAL STATUS: '+legalName(C.legal).toUpperCase(),3,'#ff2d55');}
   if(sh.mission){const m=C.missions.find(x=>x.id===sh.mission);if(m){if(m.type==='bounty'&&sh.leader){m.killed=true;msg(`${m.target.toUpperCase()} DESTROYED! RETURN TO ${GAL[m.from].name.toUpperCase()} FOR THE REWARD`,5,'#3cff6a');}if(m.type==='political'){m.kills++;msg(`${m.patrol.toUpperCase()} SHIP DOWN (${Math.min(m.kills,m.need)}/${m.need})`,3,'#3cff6a');}}}
   if(T.role==='alien'&&ships.filter(x=>x.T.role==='alien'&&!x.dead).length===0)msg('ALL VORN DESTROYED — YOU CAN HYPERSPACE ON',5,'#3cff6a');
   if(T.role==='rock'&&C.front==='mining'){for(let i=0;i<2;i++)spawn('canister',add(sh.pos,V(Math.random()*80,Math.random()*80,Math.random()*80)),{speed:0,cargo:4});}
   syncScore();}
  const n=sh.T.cargo?ri(Math.random,0,sh.T.cargo):0;for(let i=0;i<n;i++)spawn('canister',add(sh.pos,V((Math.random()-.5)*120,(Math.random()-.5)*120,(Math.random()-.5)*120)),{speed:0,cargo:sh.T.relic?16:undefined});
  // distress rescue
  const tr=ships.find(x=>x.distress===true&&!x.dead);if(tr&&!ships.some(x=>!x.dead&&x.distress===tr)){tr.distress=false;const rew=150+ri(Math.random,0,150);C.credits+=rew;C.legal=Math.max(0,C.legal-10);syncScore();msg(`TRADER: "THANK YOU, COMMANDER!" +${rew} CR`,4,'#3cff6a');}}
 function playerFire(){const L=LASERS[view==='rear'?'pulse':C.front];if(!L||(view==='rear'&&!C.rear))return;if(P.heat>=1){msg('LASER OVERHEATED',1.2,'#ff2d55');return;}
  P.cool=L.rate;P.heat=Math.min(1,P.heat+L.heat);P.energy-=.4;laserShow=.08;env.beep(view==='rear'?900:1100,.06,'sawtooth',.03,.4);
  const dirSign=view==='rear'?-1:1;let best=null,bd=1e9;
  for(const sh of ships){if(sh.dead||sh.type==='missile'&&false)continue;const l=toLocal(P.o,sub(sh.pos,P.pos));const z=l[2]*dirSign;if(z<=0||z>5200)continue;if(Math.hypot(l[0],l[1])<sh.m.rad*.95&&z<bd){bd=z;best=sh;}}
  if(station){const l=toLocal(P.o,sub(station.pos,P.pos));const z=l[2]*dirSign;if(z>0&&z<5000&&Math.hypot(l[0],l[1])<station.m.rad*.8&&(!best||z<bd)){C.legal=Math.max(C.legal,60);msg('YOU FIRED AT THE STATION! POLICE LAUNCHED',4,'#ff2d55');for(let i=0;i<2;i++)spawn('warden',add(station.pos,mul(station.o.f,500+i*120)),{angry:true,target:'player',f:station.o.f,speed:300});return;}}
  if(best){best.energy-=L.dmg*(C.front==='mining'&&best.T.role==='rock'?3:1);if(best.T.role!=='rock'&&best.T.role!=='cargo'){best.angry=true;best.target='player';if(best.legalClean&&best.T.role==='trader'&&!best.hitOnce){best.hitOnce=true;C.legal+=3;}}
   booms.push({pos:best.pos.slice(),t:.6,spark:true});if(best.energy<=0)kill(best,true);}}
 function fireMissile(){if(C.missiles<=0){msg('NO MISSILES',1.5);return;}let best=null,ba=.3;for(const sh of ships){if(sh.dead||['cargo','rock','missile'].includes(sh.T.role))continue;const l=toLocal(P.o,sub(sh.pos,P.pos));if(l[2]<=0)continue;const a=Math.hypot(l[0],l[1])/l[2];if(a<ba){ba=a;best=sh;}}
  if(!best){msg('NO TARGET IN SIGHT — AIM AT A SHIP',2);return;}C.missiles--;const m=spawn('missile',add(P.pos,mul(P.o.f,60)),{f:P.o.f.slice(),speed:P.speed+200,target:best,life:18});m.own='player';best.angry=true;best.target='player';msg('MISSILE AWAY',1.5,'#ff8a1c');env.beep(300,.5,'square',.05,3);}
 function ecm(){if(!has('ecm')){msg('NO E.C.M. FITTED',1.5);return;}if(ecmT>0)return;ecmT=1.2;P.energy-=8;let n=0;for(const sh of ships)if(sh.type==='missile'&&!sh.dead){sh.dead=true;boom(sh);n++;}env.beep(1500,.6,'square',.04,.3);msg(n?'E.C.M.: MISSILES DESTROYED':'E.C.M. ACTIVATED',2,'#3fe0ff');}
 function bomb(){if(!has('bomb')){msg('NO SHOCK PULSE FITTED',1.5);return;}delete C.equip.bomb;let n=0;for(const sh of ships)if(!sh.dead&&sh.type!=='canister'&&len(sub(sh.pos,P.pos))<9000){kill(sh,true);n++;}FX.flash&&FX.flash(.4);env.noise(1.5,.12,300);msg(`SHOCK PULSE! ${n} DESTROYED`,3,'#3fe0ff');}
 function ejectPod(){if(!has('pod')){msg('NO ESCAPE CAPSULE FITTED',1.5);return;}if(podArm<=0){podArm=2;msg('PRESS AGAIN TO EJECT!',2,'#ff2d55');return;}
  delete C.equip.pod;C.cargo={};C.legal=0;C.fuel=Math.max(C.fuel,1);mode='dockAnim';anim=0;stopMusic();msg('EJECTED — RESCUED AND TAKEN TO THE STATION',4,'#3fe0ff');C.missions=C.missions.filter(m=>m.type!=='political'||!m.delivered);persist();}
 // ---------------- docking music: The Blue Danube (J. Strauss II, 1866 — public domain) ----------------
 const DANUBE=[[294,2],[294,1],[370,1],[440,1],[440,3],[880,1],[880,3],[740,1],[740,3],[294,2],[294,1],[370,1],[440,1],[440,3],[880,1],[880,3],[784,1],[784,3],
  [277,2],[277,1],[330,1],[494,1],[494,3],[988,1],[988,3],[784,1],[784,3],[277,2],[277,1],[330,1],[494,1],[494,3],[988,1],[988,3],[740,1],[740,3]];
 function playMusic(){stopMusic();let i=0;const beat=.22;const step=()=>{if(!dockMusic)return;const[f,b]=DANUBE[i%DANUBE.length];env.beep(f,b*beat*.9,'triangle',.035);i++;dockMusic=setTimeout(step,b*beat*1000);};dockMusic=setTimeout(step,10);}
 function stopMusic(){if(dockMusic){clearTimeout(dockMusic);dockMusic=null;}}
 // ---------------- input state ----------------
 const K={};let stick=null,thrPtr=null,pad={x:0,y:0},gp=null;
 // ---------------- flight update ----------------
 function flight(dt){const I=controls();
  // rotation: roll and pitch build up smoothly, like the classic
  const wantR=dockComp?0:I.roll,wantP=dockComp?0:I.pitch;P.roll+=(wantR*1.6-P.roll)*Math.min(1,dt*6);P.pitch+=(wantP*1.1-P.pitch)*Math.min(1,dt*6);
  if(!dockComp){if(P.roll){P.o.r=rot(P.o.r,P.o.f,-P.roll*dt);P.o.u=rot(P.o.u,P.o.f,-P.roll*dt);}if(P.pitch){P.o.f=rot(P.o.f,P.o.r,-P.pitch*dt);P.o.u=rot(P.o.u,P.o.r,-P.pitch*dt);}ortho(P.o);}
  if(I.thr)P.throttle=Math.max(0,Math.min(1,P.throttle+I.thr*dt*.8));
  // mass lock
  const nearShip=ships.some(s=>!s.dead&&!['cargo','rock'].includes(s.T.role)&&len(sub(s.pos,P.pos))<7000),nearStation=station&&len(sub(station.pos,P.pos))<SAFE*.75,nearPlanet=planet&&len(sub(planet.pos,P.pos))<planet.R*1.4;
  massLock=nearShip||nearStation||nearPlanet;if(jump&&massLock){jump=false;msg('MASS LOCKED',1.5,'#ff8a1c');}
  // docking computer
  if(dockComp)autopilot(dt);
  const target=jump?7000:P.throttle*P.max;P.speed+=(target-P.speed)*Math.min(1,dt*(jump?1.5:1.8));
  P.pos=add(P.pos,mul(P.o.f,P.speed*dt));
  // energy, shields, laser heat
  const rech=has('energy')?6:3;P.energy=Math.min(100,P.energy+rech*dt);for(const k of['shF','shA'])if(P[k]<100&&P.energy>10){const g=Math.min(100-P[k],7*dt);P[k]+=g;P.energy-=g*.35;}
  P.heat=Math.max(0,P.heat-dt*.18);P.cool-=dt;if(I.fire&&P.cool<=0&&!dockComp)playerFire();if(ecmT>0)ecmT-=dt;if(podArm>0)podArm-=dt;
  // planet, sun
  if(planet){const alt=len(sub(P.pos,planet.pos))-planet.R;P.alt=alt;if(alt<0){msg('YOU FLEW INTO THE PLANET!',3,'#ff2d55');P.energy=0;die();return;}}
  if(sun){const ds=len(sub(P.pos,sun.pos));P.cabin=Math.max(20,Math.min(255,20+Math.max(0,(sun.R*3-ds)/(sun.R*2))*235));
   if(ds<sun.R*1.05){msg('FLEW INTO THE SUN!',3,'#ff2d55');P.energy=0;die();return;}
   if(P.cabin>200){P.energy-=dt*12;if(Math.random()<dt*2)msg('CABIN TEMPERATURE CRITICAL',1,'#ff2d55');}
   if(has('scoop')&&P.cabin>120&&P.speed>100&&C.fuel<7){C.fuel=Math.min(7,C.fuel+dt*.25);if(Math.random()<dt)msg('FUEL SCOOPS ON',1,'#ffe45e');}}
  if(P.energy<=0){die();return;}
  // station
  if(station){station.o.r=rot(station.o.r,station.o.f,station.spin*dt);station.o.u=rot(station.o.u,station.o.f,station.spin*dt);ortho(station.o);checkDock();}
  if(planet){planet.o.r=rot(planet.o.r,planet.o.u,planet.spin*dt);planet.o.f=rot(planet.o.f,planet.o.u,planet.spin*dt);}
  // other ships
  for(const sh of ships)if(!sh.dead)ai(sh,dt);ships=ships.filter(s=>!s.dead&&len(sub(s.pos,P.pos))<60000);
  spawnTick(dt);
  // hyperspace countdown
  if(hyperT>0){const before=Math.ceil(hyperT);hyperT-=dt;if(Math.ceil(hyperT)!==before&&hyperT>0)env.beep(500,.08,'square',.03);if(hyperT<=0){hyperT=0;doHyper();}}
  // stardust moves with speed and rotation
  for(const d of dust){if(P.roll){const a=P.roll*dt,x=d[0],y=d[1];d[0]=x*Math.cos(a)-y*Math.sin(a);d[1]=x*Math.sin(a)+y*Math.cos(a);}if(P.pitch){const a=P.pitch*dt,y=d[1],z=d[2];d[1]=y*Math.cos(a)-z*Math.sin(a);d[2]=y*Math.sin(a)+z*Math.cos(a);}
   d[2]-=P.speed*dt*(jump?.12:1.4)*(view==='rear'?-1:1);if(d[2]<20||d[2]>1700||Math.abs(d[0])>2400||Math.abs(d[1])>1800){d[0]=(Math.random()-.5)*1600;d[1]=(Math.random()-.5)*1100;d[2]=view==='rear'?60+Math.random()*200:1200+Math.random()*500;}}
  env.engine&&env.engine.set(60+P.speed*.12,.012+P.throttle*.012);}
 function autopilot(dt){const s=station;if(!s){dockComp=false;return;}const dp=add(s.pos,mul(s.o.f,1700));const toDP=sub(dp,P.pos),dDP=len(toDP);const loc=toLocal(s.o,sub(P.pos,s.pos));
  // once lined up in front of the slot, commit to the final approach (unless knocked badly off course)
  if(!apFinal&&loc[2]>500&&Math.hypot(loc[0],loc[1])<loc[2]*.25)apFinal=true;if(apFinal&&(loc[2]<200||Math.hypot(loc[0],loc[1])>420||loc[2]>3000))apFinal=loc[2]<200&&Math.hypot(loc[0],loc[1])<150;
  let aim;
  if(!apFinal&&dDP>250){aim=norm(toDP);
   // don't fly through the station: if it is in the way, go round the side first
   const rel=sub(P.pos,s.pos);if(loc[2]<600){const side=sub(rel,mul(s.o.f,dot(rel,s.o.f)));const sideN=len(side)>1?norm(side):s.o.r;const wp=add(add(s.pos,mul(sideN,s.m.rad+1000)),mul(s.o.f,Math.max(0,loc[2])));if(len(sub(wp,P.pos))>200)aim=norm(sub(wp,P.pos));}P.throttle=Math.min(1,dDP/2500+.15);}
  else{aim=norm(sub(add(s.pos,mul(s.o.f,330)),P.pos));P.throttle=.32;
   // match the slot's rotation: line our 'up' up with the station's up (or down), then turn with the station
   const want=dot(P.o.u,s.o.u)>=0?s.o.u:mul(s.o.u,-1),err=Math.atan2(dot(cross(P.o.u,want),P.o.f),dot(P.o.u,want)),turn=Math.max(-1.6*dt,Math.min(1.6*dt,err))-s.spin*dt;
   P.o.u=rot(P.o.u,P.o.f,turn);P.o.r=rot(P.o.r,P.o.f,turn);ortho(P.o);}
  steer(P.o,aim,1.2*dt);}
 function ai(sh,dt){const T=sh.T,toP=sub(P.pos,sh.pos),dP=len(toP);
  if(T.role==='rock'||T.role==='cargo'){sh.o.f=rot(sh.o.f,sh.o.u,sh.spinA*dt);sh.o.r=rot(sh.o.r,sh.o.u,sh.spinA*dt);sh.o.u=rot(sh.o.u,sh.o.f,sh.spinB*dt);ortho(sh.o);sh.pos=add(sh.pos,mul(sh.o.f,sh.speed*dt*.2));
   if(T.role==='cargo'&&dP<sh.m.rad+40){if(has('scoop')&&cargoT()<C.cap){sh.dead=true;const k=sh.cargo!==undefined?sh.cargo:ri(Math.random,0,11);C.cargo[k]=(C.cargo[k]||0)+1;msg(`SCOOPED 1${GOODS[k][1]} ${GOODS[k][0].toUpperCase()}`,2,'#3cff6a');env.beep(1200,.15,'triangle',.04,1.5);}
    else if(dP<sh.m.rad+25){sh.dead=true;boom(sh);hurt(6,norm(toP).map(x=>-x));msg(has('scoop')?'CARGO HOLD FULL':'NO FUEL SCOOPS — CANISTER DESTROYED',2);}}
   if(T.role==='rock'&&dP<sh.m.rad+25){hurt(25+P.speed*.1,mul(norm(toP),-1));sh.energy-=30;if(sh.energy<=0)kill(sh,false);P.speed*=.3;}
   return;}
  if(T.role==='missile'){sh.life-=dt;const tg=sh.target==='player'?{pos:P.pos}:sh.target;if(!tg||tg.dead||sh.life<=0){sh.dead=true;boom(sh);return;}const to=sub(tg.pos,sh.pos),d=len(to);steer(sh.o,norm(to),T.turn*dt);sh.speed=Math.min(T.speed,sh.speed+300*dt);sh.pos=add(sh.pos,mul(sh.o.f,sh.speed*dt));
   if(d<70){sh.dead=true;boom(sh);if(sh.target==='player'){hurt(45,mul(norm(to),-1));msg('MISSILE HIT!',2,'#ff2d55');}else{tg.energy-=120;if(tg.energy<=0)kill(tg,sh.own==='player');}}return;}
  // pick a target
  let tg=null;if(sh.angry&&sh.target==='player')tg={pos:P.pos,player:true};else if(sh.target&&sh.target.pos&&!sh.target.dead)tg=sh.target;
  if(T.role==='police'&&!tg){if(C.legal>=50||(C.legal>=1&&here().gov>=5&&Math.random()<dt*.02)){sh.angry=true;sh.target='player';}else{const pir=ships.find(x=>!x.dead&&x.T.role==='pirate'&&len(sub(x.pos,sh.pos))<9000);if(pir)sh.target=pir;}}
  if(T.role==='pirate'&&!tg&&cargoT()>0&&dP<9000&&Math.random()<dt*.2){sh.angry=true;sh.target='player';}
  let aim;
  if(sh.energy<sh.max*.25&&T.role!=='police'&&T.role!=='alien'){aim=norm(sub(sh.pos,P.pos));if(sh.missiles>0&&tg&&tg.player&&Math.random()<dt*.5){sh.missiles--;const m=spawn('missile',add(sh.pos,mul(sh.o.f,60)),{f:sh.o.f.slice(),speed:sh.speed+100,target:'player',life:16});msg('INCOMING MISSILE!',3,'#ff2d55');env.beep(220,.6,'square',.05,2);}}
  else if(tg){const to=sub(tg.pos,sh.pos),d=len(to);if(sh.breakT>0){sh.breakT-=dt;aim=norm(add(mul(sh.o.f,1),sh.o.u));}else{aim=norm(to);if(d<500)sh.breakT=1.2+Math.random();}
   const ang=Math.acos(Math.max(-1,Math.min(1,dot(sh.o.f,norm(to)))));sh.cool-=dt;
   if(T.laser&&ang<.12&&d<3200&&sh.cool<=0){sh.cool=.6+Math.random()*.8;sh.shot=.12;if(tg.player){if(Math.random()<.65)hurt(T.laser*(here().gov<=1?1.1:1),mul(norm(to),-1));}else{tg.energy-=T.laser;tg.angry=true;if(tg.energy<=0)kill(tg,false);}env.beep(700,.05,'sawtooth',.02,.6);}
   if(tg.player&&sh.missiles>0&&d<5000&&Math.random()<dt*.04){sh.missiles--;spawn('missile',add(sh.pos,mul(sh.o.f,60)),{f:sh.o.f.slice(),speed:sh.speed+100,target:'player',life:16});msg('INCOMING MISSILE!',3,'#ff2d55');env.beep(220,.6,'square',.05,2);}}
  else{aim=sh.goal?norm(sub(sh.goal,sh.pos)):sh.o.f;if(sh.goal&&len(sub(sh.goal,sh.pos))<600){sh.dead=true;}}
  steer(sh.o,aim,T.turn*dt);const want=tg?T.speed:T.speed*.6;sh.speed+=(want-sh.speed)*Math.min(1,dt);sh.pos=add(sh.pos,mul(sh.o.f,sh.speed*dt));if(sh.shot>0)sh.shot-=dt;
  if(dP<sh.m.rad+30){hurt(20+P.speed*.08,mul(norm(toP),-1));sh.energy-=40;msg('COLLISION!',1.5,'#ff2d55');if(sh.energy<=0)kill(sh,true);}}
 // ---------------- 3D drawing ----------------
 function cam(p){const d=sub(p,P.pos);let x=dot(d,P.o.r),y=dot(d,P.o.u),z=dot(d,P.o.f);if(view==='rear'){x=-x;z=-z;}return[x,y,z];}
 const proj=c=>[CX+FOC*c[0]/c[2],CY-FOC*c[1]/c[2]];
 function seg(ctx,a,b){const N=4;if(a[2]<N&&b[2]<N)return;if(a[2]<N){const t=(N-a[2])/(b[2]-a[2]);a=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,N];}else if(b[2]<N){const t=(N-b[2])/(a[2]-b[2]);b=[b[0]+(a[0]-b[0])*t,b[1]+(a[1]-b[1])*t,N];}
  const p=proj(a),q=proj(b);if(Math.max(Math.abs(p[0]),Math.abs(p[1]),Math.abs(q[0]),Math.abs(q[1]))>2e4)return;ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);}
 function drawModel(ctx,m,pos,o,col,extra){const camP=view==='rear'?P.pos:P.pos,cm=toLocal(o,sub(camP,pos)),c0=cam(pos);if(c0[2]<-m.rad)return;const pr=c0[2]>0?FOC*m.rad/c0[2]:99;
  if(pr<1.6){if(c0[2]>0){const p=proj(c0);ctx.fillStyle=col;ctx.fillRect(p[0]-1,p[1]-1,2,2);}return;}
  const vis=m.faces.map(f=>dot(f.n,cm)-f.d>0),pts=m.pts.map(p=>cam(add(pos,toWorld(o,p))));ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.beginPath();
  for(const e of m.edges)if(e.f.some(i=>vis[i]))seg(ctx,pts[e.a],pts[e.b]);ctx.stroke();if(extra)extra(vis,pts);}
 function drawStation(ctx){const s=station;drawModel(ctx,s.m,s.pos,s.o,'#e6e9f2',vis=>{const front=s.m.faces.findIndex(f=>f.n[2]>.99);if(front<0||!vis[front])return;
   const c=[[-110,-36],[110,-36],[110,36],[-110,36]].map(([x,y])=>cam(add(s.pos,toWorld(s.o,[x,y,331]))));ctx.strokeStyle='#3fe0ff';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<4;i++)seg(ctx,c[i],c[(i+1)%4]);ctx.stroke();});}
 function drawPlanet(ctx){const c=cam(planet.pos);if(c[2]<=-planet.R)return;const d=len(sub(planet.pos,P.pos));if(c[2]<=10)return;const p=proj(c),r=FOC*planet.R/Math.sqrt(Math.max(1,d*d-planet.R*planet.R));if(r<1){ctx.fillStyle='#3fe0ff';ctx.fillRect(p[0],p[1],2,2);return;}
  ctx.strokeStyle='#3fe0ff';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.stroke();if(r<6)return;
  const eye=norm(sub(P.pos,planet.pos)),o=planet.o,crater=here().seed%2===0;ctx.strokeStyle='rgba(63,224,255,.8)';ctx.lineWidth=1.1;ctx.beginPath();
  const circ=(a,b,cen,rr)=>{let prev=null;for(let i=0;i<=40;i++){const t=i/40*Math.PI*2,pt=add(cen,add(mul(a,Math.cos(t)*rr),mul(b,Math.sin(t)*rr)));const ok=dot(norm(sub(pt,planet.pos)),eye)>0.02;const cc=cam(pt);if(ok&&prev)seg(ctx,prev,cc);prev=ok?cc:null;}};
  if(crater){const n=o.u,cen=mul(n,planet.R*.8);circ(o.r,o.f,add(planet.pos,cen),planet.R*.6);}else{circ(o.r,o.f,planet.pos,planet.R);circ(o.u,o.f,planet.pos,planet.R);}ctx.stroke();}
 function drawSun(ctx){const c=cam(sun.pos);if(c[2]<=10)return;const p=proj(c),r=FOC*sun.R/c[2];if(r<1.2){ctx.fillStyle='#ffe45e';ctx.fillRect(p[0]-1,p[1]-1,3,3);return;}
  for(let y=-r;y<=r;y+=3){const w=Math.sqrt(r*r-y*y)*(.85+Math.random()*.15);ctx.fillStyle=Math.abs(y)<r*.5?'#ffe45e':'#ff8a1c';ctx.fillRect(p[0]-w,p[1]+y,w*2,1.6);}}
 // ---------------- flight screen ----------------
 let btns=[],touchSeen=!!env.touch,fireTouch=false;
 const B=(x,y,w,h,label,fn,o={})=>{btns.push({x,y,w,h,fn});return{x,y,w,h,label,...o};};
 function button(ctx,b,on){ctx.fillStyle=on?'rgba(255,228,94,.9)':b.bg||'rgba(30,38,80,.82)';ctx.strokeStyle=b.border||'#3fe0ff';ctx.lineWidth=2;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(b.x,b.y,b.w,b.h,8);else ctx.rect(b.x,b.y,b.w,b.h);ctx.fill();ctx.stroke();
  ctx.fillStyle=on?'#10142b':b.fg||'#fff';ctx.font=`bold ${b.fs||13}px "Courier New",monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.label,b.x+b.w/2,b.y+b.h/2+1);}
 function text(ctx,t,x,y,col='#fff',size=15,align='left',bold=true){ctx.fillStyle=col;ctx.font=`${bold?'bold ':''}${size}px "Courier New",monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(t,x,y);}
 function renderFlight(ctx){ctx.save();ctx.beginPath();ctx.rect(0,0,W,VH);ctx.clip();ctx.fillStyle='#000';ctx.fillRect(0,0,W,VH);const[sx,sy]=FX.offset();ctx.translate(sx,sy);
  ctx.fillStyle='#fff';for(const d of dust){if(d[2]<=0)continue;const p=[CX+FOC*d[0]/d[2],CY-FOC*d[1]/d[2]];const s=d[2]<300?2.4:d[2]<800?1.6:1;ctx.fillRect(p[0],p[1],s,s);if(jump&&view==='front'){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(CX+(p[0]-CX)*.85,CY+(p[1]-CY)*.85);ctx.stroke();}}
  if(sun)drawSun(ctx);if(planet)drawPlanet(ctx);
  const objs=[...ships.filter(s=>!s.dead).map(s=>({s,z:cam(s.pos)[2]})),...(station?[{s:station,z:cam(station.pos)[2]}]:[])].sort((a,b)=>b.z-a.z);
  for(const{s}of objs){if(s===station)drawStation(ctx);else{drawModel(ctx,s.m,s.pos,s.o,s.T.color);if(s.shot>0){const c=cam(s.pos);if(c[2]>0){const p=proj(c);ctx.strokeStyle='#ff2d55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(CX+(Math.random()-.5)*300,VH);ctx.stroke();}}}}
  for(const b of booms){if(b.spark){const c=cam(b.pos);if(c[2]>0){const p=proj(c);ctx.strokeStyle='#ffe45e';ctx.beginPath();for(let i=0;i<6;i++){const a=Math.random()*6.3,l=4+Math.random()*10;ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+Math.cos(a)*l,p[1]+Math.sin(a)*l);}ctx.stroke();}continue;}
   ctx.strokeStyle=b.col||'#fff';ctx.globalAlpha=Math.max(0,1-b.t/2.2);ctx.beginPath();for(const l of b.lines||[]){const c=add(l.c,mul(l.v,b.t));seg(ctx,cam(add(c,l.a)),cam(add(c,l.b)));}ctx.stroke();
   const c=cam(b.pos);if(c[2]>0&&b.t<1){const p=proj(c),r=FOC*60*(.4+b.t)/c[2];ctx.fillStyle='#fff';for(let i=0;i<14;i++){const a=Math.random()*6.3,d=Math.random()*r;ctx.fillRect(p[0]+Math.cos(a)*d,p[1]+Math.sin(a)*d,2,2);}}ctx.globalAlpha=1;}
  if(laserShow>0){const L=LASERS[view==='rear'?'pulse':C.front]||LASERS.pulse;ctx.strokeStyle=L.col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,VH);ctx.lineTo(CX,CY+4);ctx.moveTo(650,VH);ctx.lineTo(CX,CY+4);ctx.stroke();}
  ctx.restore();
  // crosshair, view title, hyperspace counter
  ctx.strokeStyle='#ffe45e';ctx.lineWidth=2;ctx.beginPath();for(const[a,b,c,d]of[[CX-26,CY,CX-8,CY],[CX+8,CY,CX+26,CY],[CX,CY-22,CX,CY-7],[CX,CY+7,CX,CY+22]]){ctx.moveTo(a,b);ctx.lineTo(c,d);}ctx.stroke();
  text(ctx,view==='rear'?'Rear View':'Front View',CX,44,'#c8d0ff',16,'center');
  if(hyperT>0)text(ctx,String(Math.ceil(hyperT)),18,46,'#3fe0ff',30);
  if(dockComp)text(ctx,'DOCKING COMPUTERS ON',CX,VH-56,'#3fe0ff',20,'center');
  msgs.forEach((m,i)=>text(ctx,m.t,CX,VH-110+i*22-(dockComp?28:0),m.c,16,'center'));
  if(lastHit>0){ctx.fillStyle=`rgba(255,45,85,${lastHit})`;ctx.fillRect(0,0,W,VH);}
  dashboard(ctx);flightButtons(ctx);}
 function bar(ctx,x,y,label,v,col,warn){text(ctx,label,x,y-1,'#9aa3c7',12);ctx.fillStyle='#1a1f3a';ctx.fillRect(x+26,y,150,10);ctx.fillStyle=warn&&v<.25?'#ff2d55':col;ctx.fillRect(x+26,y,150*Math.max(0,Math.min(1,v)),10);}
 function dashboard(ctx){const Y=VH;ctx.fillStyle='#050816';ctx.fillRect(0,Y,W,H-Y);ctx.strokeStyle='#3b4a8f';ctx.lineWidth=2;ctx.strokeRect(2,Y+2,W-4,H-Y-4);
  const L=[['FS',P.shF/100,'#3cff6a',1],['AS',P.shA/100,'#3cff6a',1],['FU',C.fuel/7,'#ffe45e',1],['CT',(P.cabin-20)/235,'#ff8a1c',0],['LT',P.heat,'#ff8a1c',0],['AL',planet?Math.min(1,(P.alt||0)/(planet.R*3)):0,'#3fe0ff',0]];
  L.forEach(([l,v,c,w],i)=>bar(ctx,10,Y+14+i*26,l,v,c,w));
  const R2=[['SP',P.speed/(jump?7000:P.max),'#3fe0ff'],['RL',.5+P.roll/3.2,'#c8d0ff'],['DC',.5+P.pitch/2.2,'#c8d0ff']];R2.forEach(([l,v,c],i)=>bar(ctx,W-190,Y+14+i*26,l,v,c,0));
  for(let i=0;i<4;i++){const v=Math.max(0,Math.min(1,(P.energy-i*25)/25));text(ctx,'E'+(i+1),W-190,Y+92+i*20-1,'#9aa3c7',12);ctx.fillStyle='#1a1f3a';ctx.fillRect(W-164,Y+92+i*20,150,9);ctx.fillStyle=P.energy<25?'#ff2d55':'#3cff6a';ctx.fillRect(W-164,Y+92+i*20,150*v,9);}
  // the 3D elliptical scanner
  const sx=400,sy=Y+92,rx=150,ry=58,range=10000;ctx.strokeStyle='#ff2d55';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(sx,sy,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.4;ctx.beginPath();ctx.ellipse(sx,sy,rx*.5,ry*.5,0,0,Math.PI*2);ctx.moveTo(sx-rx,sy);ctx.lineTo(sx+rx,sy);ctx.moveTo(sx,sy-ry);ctx.lineTo(sx,sy+ry);ctx.moveTo(sx,sy);ctx.lineTo(sx-rx*.7,sy-ry*.7);ctx.moveTo(sx,sy);ctx.lineTo(sx+rx*.7,sy-ry*.7);ctx.stroke();ctx.globalAlpha=1;
  const blip=(pos,col)=>{const l=toLocal(P.o,sub(pos,P.pos));if(len(l)>range)return;const x=sx+l[0]/range*rx,y=sy-l[2]/range*ry,h=l[1]/range*ry*1.4;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke();ctx.fillRect(x-3,y-h-2,6,3);};
  if(station)blip(station.pos,'#e6e9f2');for(const s of ships)if(!s.dead)blip(s.pos,s.type==='missile'?'#ff8a1c':s.angry?'#ff2d55':s.T.color);
  // compass: station when close, otherwise planet
  const cx=W-232,cy=Y+30;ctx.strokeStyle='#3b4a8f';ctx.beginPath();ctx.arc(cx,cy,18,0,Math.PI*2);ctx.stroke();
  const tgt=station&&len(sub(station.pos,P.pos))<SAFE*1.6?station.pos:planet?planet.pos:null;if(tgt){const l=norm(toLocal(P.o,sub(tgt,P.pos)));ctx.fillStyle=l[2]>0?'#3cff6a':'#ff2d55';ctx.beginPath();ctx.arc(cx+l[0]*15,cy-l[1]*15,4,0,Math.PI*2);ctx.fill();}
  // status lights
  const red=ships.some(s=>!s.dead&&s.angry&&len(sub(s.pos,P.pos))<range),cond=red?'#ff2d55':ships.some(s=>!s.dead&&['pirate','alien'].includes(s.T.role))?'#ffe45e':'#3cff6a';
  ctx.fillStyle=cond;ctx.beginPath();ctx.arc(W-232,Y+66,7,0,Math.PI*2);ctx.fill();
  const inSafe=station&&len(sub(station.pos,P.pos))<SAFE;text(ctx,inSafe?'S':'',W-238,Y+80,'#3fe0ff',16);text(ctx,jump?'J':massLock?'M':'',W-222,Y+80,jump?'#3cff6a':'#ff8a1c',16);
  for(let i=0;i<4;i++){ctx.fillStyle=i<C.missiles?'#3cff6a':'#1a1f3a';ctx.fillRect(220+i*16,Y+160,12,8);}text(ctx,'MSL',190,Y+158,'#9aa3c7',11);
  text(ctx,`${here().name.toUpperCase()}`,400,Y+158,'#9aa3c7',12,'center');if(ecmT>0)text(ctx,'E',W-210,Y+80,'#3fe0ff',16);}
 function flightButtons(ctx){const list=[['MSL',fireMissile],['ECM',ecm],['JUMP',toggleJump],['DOCK',toggleDock],['HYPER',startHyper],['MAP',()=>{overlay='chart';chartMode='galaxy';}],['VIEW',()=>{view=view==='front'?'rear':'front';}],['BOMB',bomb],['POD',ejectPod]];
  const bw=82,gap=6,x0=(W-(list.length*(bw+gap)-gap))/2;list.forEach(([l,fn],i)=>{const on=(l==='JUMP'&&jump)||(l==='DOCK'&&dockComp)||(l==='HYPER'&&hyperT>0)||(l==='VIEW'&&view==='rear');button(ctx,B(x0+i*(bw+gap),6,bw,30,l,fn,{fs:12}),on);});
  if(!touchSeen)return;
  // fire button and throttle slider (right hand), floating stick (left hand)
  ctx.globalAlpha=.85;const f=B(W-150,VH-150,110,110,'FIRE',()=>{});btns.pop();ctx.fillStyle=fireTouch?'rgba(255,45,85,.85)':'rgba(255,45,85,.35)';ctx.beginPath();ctx.arc(W-95,VH-95,55,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff2d55';ctx.lineWidth=3;ctx.stroke();text(ctx,'FIRE',W-95,VH-104,'#fff',18,'center');
  ctx.fillStyle='rgba(30,38,80,.7)';ctx.fillRect(W-30,60,22,200);ctx.strokeStyle='#3fe0ff';ctx.strokeRect(W-30,60,22,200);ctx.fillStyle='#3fe0ff';ctx.fillRect(W-34,260-P.throttle*200-8,30,16);text(ctx,'SPEED',W-19,264,'#9aa3c7',10,'center');
  if(stick){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(stick.x0,stick.y0,60,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(63,224,255,.6)';ctx.beginPath();ctx.arc(stick.x0+pad.x*60,stick.y0+pad.y*60,26,0,Math.PI*2);ctx.fill();}
  else{ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(130,VH-110,60,0,Math.PI*2);ctx.stroke();text(ctx,'DRAG TO STEER',130,VH-116,'rgba(255,255,255,.4)',12,'center');}
  ctx.globalAlpha=1;}
 function toggleJump(){if(!planet&&!interdicted){return;}if(jump){jump=false;return;}if(massLock){msg('MASS LOCKED — TOO CLOSE TO SOMETHING',2,'#ff8a1c');return;}jump=true;dockComp=false;msg('JUMP DRIVE ENGAGED',1.5,'#3cff6a');}
 function toggleDock(){if(!has('dock')){msg('NO DOCKING COMPUTER — BUY ONE IN THE SHIPYARD',2.5);return;}if(!station){msg('NO STATION HERE',2);return;}if(dockComp){dockComp=false;stopMusic();msg('DOCKING COMPUTER OFF',1.5);return;}
  if(len(sub(station.pos,P.pos))>SAFE*1.6){msg('GET CLOSER TO THE STATION FIRST',2.5);return;}dockComp=true;apFinal=false;jump=false;playMusic();}
 // ---------------- missions board ----------------
 const PIRATE_A=['Red','Iron','Mad','Black','Silent','One-Eyed','Grim','Lucky'],PIRATE_B=['Jax','Morg','Skeel','Vex','Rook','Dagger','Hask','Corvin'];
 function genBoard(){const s=here(),r=rng(s.seed^(C.day*7919)),out=[],near=GAL.map(o=>({o:sysOf(o.i),d:SL.dist(GAL[C.sys],o)})).filter(x=>x.o.i!==C.sys);let k=0;const id=()=>`${C.sys}-${C.day}-${k++}`;
  const cour=near.filter(x=>x.d>=2&&x.d<=14);if(cour.length){const t=rp(r,cour);out.push({id:id(),type:'courier',dest:t.o.i,reward:Math.round(40+t.d*24),deadline:C.day+Math.ceil(t.d/2.5)+5,title:`Courier: package to ${t.o.name}`,text:`Deliver a sealed package to ${t.o.name} (${t.d} LY away) by day ${C.day+Math.ceil(t.d/2.5)+5}. It takes no cargo space.`});}
  const mk=market();const dear=GOODS.map((g,i)=>({i,ratio:mk[i].price/(g[2]*.4)})).filter(x=>x.i<12).sort((a,b)=>b.ratio-a.ratio)[ri(r,0,2)];if(dear){const q=ri(r,3,8),rew=Math.round(mk[dear.i].price*q*1.7+60);out.push({id:id(),type:'supply',sys:C.sys,good:dear.i,qty:q,reward:rew,deadline:C.day+12,title:`Supply run: ${q}t ${GOODS[dear.i][0]}`,text:`This station urgently needs ${q}t of ${GOODS[dear.i][0]}. Bring them back here by day ${C.day+12} for ${rew} Cr.`});}
  const bad=near.filter(x=>x.d<=12&&x.o.gov<=3);if(bad.length&&r()<.8){const t=rp(r,bad),nm=`${rp(r,PIRATE_A)} ${rp(r,PIRATE_B)}`,rew=ri(r,25,70)*10;out.push({id:id(),type:'bounty',sys:t.o.i,from:C.sys,target:nm,reward:rew,deadline:C.day+16,killed:false,title:`Wanted: ${nm}`,text:`The pirate ${nm} is raiding ships near ${t.o.name} (${t.d} LY). Destroy their Raven, then come back here for ${rew} Cr.`});}
  if(s.gov>=4&&r()<.7){const pol=near.filter(x=>x.d<=14&&x.o.gov<=2);if(pol.length){const t=rp(r,pol),newGov=r()<.5?6:5;out.push({id:id(),type:'political',sys:t.o.i,good:3,qty:4,need:3,kills:0,newGov,reward:900+ri(r,0,6)*50,deadline:C.day+24,patrol:`${GOV[t.o.gov].split(' ')[0]} patrol`,delivered:false,title:`Freedom for ${t.o.name}`,text:`The people of ${t.o.name} want to end their ${GOV[t.o.gov]}. Take 4t of Medicines to their station and destroy 3 of the ${GOV[t.o.gov]}’s patrol ships there. Succeed and ${t.o.name} becomes a ${GOV[newGov]}!`});}}
  if(s.gov===7&&r()<.6){const co=near.filter(x=>x.d<=12&&[2,3,4].includes(x.o.gov));if(co.length){const t=rp(r,co);out.push({id:id(),type:'political',sys:t.o.i,good:9,qty:4,need:2,kills:0,newGov:7,reward:800+ri(r,0,6)*50,deadline:C.day+24,patrol:'Rebel',delivered:false,title:`Expansion: ${t.o.name}`,text:`A corporation wants to take over ${t.o.name}. Deliver 4t of Computers there and drive off 2 rebel ships. ${t.o.name} will become a Corporate Guild.`});}}
  return out;}
 const board=()=>{if(!C.board||C.board.day!==C.day||C.board.sys!==C.sys)C.board={day:C.day,sys:C.sys,offers:genBoard().filter(o=>!C.missions.some(m=>m.id===o.id))};return C.board.offers;};
 // ---------------- buying and selling ----------------
 function buy(i,n){const mk=market(),g=GOODS[i];let k=0;while(k<n&&mk[i].qty>0&&C.credits>=mk[i].price&&(g[1]!=='t'||cargoT()<C.cap)){C.credits=Math.round((C.credits-mk[i].price)*10)/10;mk[i].qty--;C.cargo[i]=(C.cargo[i]||0)+1;k++;}
  if(!k)msg(mk[i].qty<=0?'NONE IN STOCK':C.credits<mk[i].price?'NOT ENOUGH CREDITS':'CARGO HOLD FULL',2,'#ff2d55');else env.beep(900,.05,'square',.03);syncScore();}
 function sellG(i,n){const mk=market();let k=0;while(k<n&&(C.cargo[i]||0)>0){C.credits=Math.round((C.credits+mk[i].price)*10)/10;C.cargo[i]--;mk[i].qty++;k++;}if(k)env.beep(700,.05,'square',.03);syncScore();}
 function buyEq(e){const t=here().tech;if(e.tech>t){msg('NOT SOLD AT THIS TECH LEVEL',2);return;}
  if(e.id==='fuel'){const need=Math.round((7-C.fuel)*10)/10,cost=Math.round(need*e.price*10)/10;if(need<=0){msg('FUEL TANK IS FULL',1.5);return;}const can=Math.min(need,C.credits/e.price);if(can<=0){msg('NOT ENOUGH CREDITS',2,'#ff2d55');return;}C.fuel=Math.round((C.fuel+can)*10)/10;C.credits=Math.round((C.credits-can*e.price)*10)/10;msg(`REFUELLED: ${C.fuel.toFixed(1)} LY`,2,'#3cff6a');syncScore();return;}
  if(C.credits<e.price){msg('NOT ENOUGH CREDITS',2,'#ff2d55');return;}
  if(e.id==='missile'){if(C.missiles>=4){msg('MISSILE RACK IS FULL',1.5);return;}C.missiles++;}
  else if(e.laser){if(C.front===e.laser){msg('ALREADY FITTED',1.5);return;}C.front=e.laser;}
  else if(e.id==='rearlaser'){if(C.rear){msg('ALREADY FITTED',1.5);return;}C.rear='pulse';}
  else if(e.id==='cargo'){if(C.cap>=35){msg('ALREADY FITTED',1.5);return;}C.cap=35;}
  else{if(C.equip[e.id]){msg('ALREADY FITTED',1.5);return;}C.equip[e.id]=1;}
  C.credits=Math.round((C.credits-e.price)*10)/10;msg(`${e.name.split(' (')[0].toUpperCase()} FITTED`,2,'#3cff6a');env.beep(1200,.2,'triangle',.05,1.5);syncScore();persist();}
 // ---------------- station screens ----------------
 const TABS=[['status','STATUS'],['market','MARKET'],['shipyard','SHIPYARD'],['missions','MISSIONS'],['data','DATA'],['chart','CHART'],['launch','LAUNCH']];
 function frame(ctx,title){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#3b4a8f';ctx.lineWidth=2;ctx.strokeRect(4,4,W-8,H-8);text(ctx,title,CX,14,'#3fe0ff',20,'center');ctx.strokeStyle='#3b4a8f';ctx.beginPath();ctx.moveTo(10,42);ctx.lineTo(W-10,42);ctx.stroke();}
 function tabsBar(ctx){const w=(W-20)/TABS.length;TABS.forEach(([k,l],i)=>button(ctx,B(10+i*w+2,H-52,w-4,42,l,()=>{tab=k;sel=0;},{fs:13,bg:k==='launch'?'rgba(255,45,85,.7)':undefined}),tab===k));}
 function renderDocked(ctx){btns=[];const s=here();
  if(tab==='status'){frame(ctx,`COMMANDER ${((env.names&&env.names[0])||'PILOT').toUpperCase()}`);const L=[['Current System:',s.name],['Hyperspace System:',C.target!==null&&C.target!==undefined?GAL[C.target].name:'—'],['Condition:','Docked'],['Rating:',rankOf(C.killPts)],['Fuel:',`${C.fuel.toFixed(1)} Light Years`],['Cash:',`${C.credits.toFixed(1)} Cr`],['Legal Status:',legalName(C.legal)],['Stardate:',`Day ${C.day}`],['Kills:',String(C.kills)]];
   L.forEach(([a,b],i)=>{text(ctx,a,30,60+i*26,'#3cff6a',17);text(ctx,b,310,60+i*26,a==='Legal Status:'&&C.legal?'#ff2d55':'#fff',17);});
   text(ctx,'Equipment:',30,300,'#3cff6a',17);const eq=[`Front ${C.front[0].toUpperCase()+C.front.slice(1)} Laser`,...(C.rear?['Rear Pulse Laser']:[]),`${C.missiles} Missile${C.missiles===1?'':'s'}`,`Cargo Bay ${C.cap}t`,...EQUIP.filter(e=>C.equip[e.id]).map(e=>e.name.split(' (')[0])];
   eq.forEach((e,i)=>text(ctx,e,50+(i%2)*360,326+Math.floor(i/2)*22,'#c8d0ff',15));
   if(C.news.length){text(ctx,'Galactic News:',30,440,'#3fe0ff',15);C.news.slice(0,2).forEach((n,i)=>text(ctx,`Day ${n.day}: ${n.t}`.slice(0,88),30,460+i*18,'#9aa3c7',12,'left',false));}
   button(ctx,B(560,58,220,30,`Pitch: ${C.invert?'INVERTED':'NORMAL'}`,()=>{C.invert=!C.invert;persist();},{fs:12}));
   button(ctx,B(560,94,220,30,'New commander…',()=>{overlay='reset';},{fs:12,border:'#ff2d55'}));}
  else if(tab==='market'){frame(ctx,`${s.name.toUpperCase()} MARKET PRICES`);const mk=market();text(ctx,'PRODUCT',24,50,'#b45bd6',15);text(ctx,'UNIT',300,50,'#b45bd6',15);text(ctx,'PRICE',380,50,'#b45bd6',15);text(ctx,'FOR SALE',480,50,'#b45bd6',15);text(ctx,'IN HOLD',620,50,'#b45bd6',15);
   GOODS.forEach((g,i)=>{const y=72+i*23,on=sel===i;btns.push({x:14,y:y-2,w:W-28,h:22,fn:()=>{sel=i;}});if(on){ctx.fillStyle='rgba(60,255,106,.18)';ctx.fillRect(14,y-2,W-28,22);}
    const col=g[6]?'#ff8a1c':on?'#3cff6a':'#e6e9f2';text(ctx,g[0]+(g[6]?' ⚠':''),24,y,col,15);text(ctx,g[1],310,y,col,15);text(ctx,mk[i].price.toFixed(1),380,y,col,15);text(ctx,mk[i].qty?`${mk[i].qty}${g[1]}`:'—',490,y,col,15);text(ctx,C.cargo[i]?`${C.cargo[i]}${g[1]}`:'',630,y,col,15);});
   text(ctx,`Cash: ${C.credits.toFixed(1)} Cr     Hold: ${cargoT()}/${C.cap}t`,24,466,'#ffe45e',15);if(GOODS[sel][6])text(ctx,'⚠ Illegal goods: customs may catch you',440,466,'#ff8a1c',13);
   const bw=146;[['BUY 1',()=>buy(sel,1)],['BUY 10',()=>buy(sel,10)],['BUY MAX',()=>buy(sel,999)],['SELL 1',()=>sellG(sel,1)],['SELL ALL',()=>sellG(sel,999)]].forEach(([l,fn],i)=>button(ctx,B(20+i*(bw+6),484,bw,38,l,fn,{bg:i<3?'rgba(30,80,50,.9)':'rgba(80,40,30,.9)'})));}
  else if(tab==='shipyard'){frame(ctx,`${s.name.toUpperCase()} SHIPYARD — TECH LEVEL ${s.tech}`);const list=EQUIP;text(ctx,'EQUIPMENT',24,50,'#b45bd6',15);text(ctx,'PRICE',640,50,'#b45bd6',15);
   list.forEach((e,i)=>{const y=74+i*27,ok=e.tech<=s.tech,on=selEq===i,own=(e.laser&&C.front===e.laser)||(e.id==='rearlaser'&&C.rear)||(e.id==='cargo'&&C.cap>=35)||C.equip[e.id];btns.push({x:14,y:y-3,w:W-28,h:25,fn:()=>{selEq=i;}});
    if(on){ctx.fillStyle='rgba(60,255,106,.18)';ctx.fillRect(14,y-3,W-28,25);}const col=!ok?'#4a4f63':own?'#3fe0ff':on?'#3cff6a':'#e6e9f2';
    text(ctx,e.name+(own?' ✓':'')+(!ok?`  (needs tech ${e.tech})`:''),24,y,col,15);text(ctx,e.id==='fuel'?`${(Math.max(0,7-C.fuel)*e.price).toFixed(1)}`:e.price.toFixed(1),640,y,col,15);});
   text(ctx,`Cash: ${C.credits.toFixed(1)} Cr   Missiles: ${C.missiles}/4   Fuel: ${C.fuel.toFixed(1)} LY`,24,462,'#ffe45e',15);
   button(ctx,B(20,484,250,38,EQUIP[selEq].id==='fuel'?'⛽ FILL THE TANK':'🛒 BUY SELECTED',()=>buyEq(EQUIP[selEq]),{bg:'rgba(30,80,50,.9)'}));button(ctx,B(290,484,250,38,'⛽ REFUEL',()=>buyEq(EQUIP[0])));}
  else if(tab==='missions'){frame(ctx,`${s.name.toUpperCase()} BULLETIN BOARD`);const offers=board();text(ctx,'OFFERS',24,50,'#b45bd6',15);
   if(!offers.length)text(ctx,'No new requests today. Try another station.',24,74,'#9aa3c7',15);
   offers.forEach((o,i)=>{const y=74+i*30,on=selMis===i;btns.push({x:14,y:y-4,w:W-28,h:28,fn:()=>{selMis=i;}});if(on){ctx.fillStyle='rgba(60,255,106,.18)';ctx.fillRect(14,y-4,W-28,28);}text(ctx,o.title,24,y,on?'#3cff6a':'#e6e9f2',15);text(ctx,`${o.reward} Cr`,690,y,'#ffe45e',15);});
   const o=offers[selMis];if(o){wrap(ctx,o.text,24,74+offers.length*30+6,750,18,'#c8d0ff',14);button(ctx,B(560,74+offers.length*30+50,210,34,'✅ ACCEPT',()=>accept(o),{bg:'rgba(30,80,50,.9)'}));}
   const y0=300;text(ctx,`YOUR MISSIONS (${C.missions.length}/4)`,24,y0,'#b45bd6',15);if(!C.missions.length)text(ctx,'None yet — accept one above.',24,y0+24,'#9aa3c7',14);
   C.missions.slice(0,4).forEach((m,i)=>{const y=y0+24+i*38;text(ctx,m.title,24,y,'#e6e9f2',14);text(ctx,missionStatus(m),24,y+17,'#9aa3c7',12,'left',false);
    if(m.type==='supply'&&m.sys===C.sys&&(C.cargo[m.good]||0)>=m.qty)button(ctx,B(560,y,100,30,'DELIVER',()=>{C.cargo[m.good]-=m.qty;C.credits+=m.reward;C.missions=C.missions.filter(x=>x!==m);C.done++;msg(`DELIVERED: +${m.reward} CR`,3,'#3cff6a');syncScore();persist();},{fs:12,bg:'rgba(30,80,50,.9)'}));
    button(ctx,B(670,y,100,30,'ABANDON',()=>{C.missions=C.missions.filter(x=>x!==m);persist();},{fs:12,border:'#ff2d55'}));});}
  else if(tab==='data'){const t=C.target!==null&&C.target!==undefined?sysOf(C.target):s;frame(ctx,`DATA ON ${t.name.toUpperCase()}`);
   const L=[['Distance:',t.i===C.sys?'You are here':`${SL.dist(GAL[C.sys],GAL[t.i])} Light Years`],['Economy:',ECON[t.eco]],['Government:',GOV[t.gov]],['Tech Level:',String(t.tech)],['Turnover:',`${t.prod} MCr`],['Radius:',`${t.radius} km`],['Population:',`${t.pop} Billion`]];
   L.forEach(([a,b],i)=>{text(ctx,a,30,60+i*28,'#3cff6a',17);text(ctx,b,230,60+i*28,'#fff',17);});text(ctx,`(${t.species})`,30,262,'#ffe45e',16);wrap(ctx,t.desc,30,292,740,22,'#e6e9f2',16);
   wrap(ctx,SL.GOVDESC[t.gov],30,370,740,20,'#9aa3c7',14);if(C.gov[t.i]!==undefined)text(ctx,'★ Its government was changed by your missions',30,410,'#3cff6a',14);
   const ms=C.missions.filter(m=>m.sys===t.i||m.dest===t.i);if(ms.length)text(ctx,'Missions here: '+ms.map(m=>m.title).join(', ').slice(0,80),30,432,'#ff8a1c',13);}
  else if(tab==='chart'){frame(ctx,chartMode==='galaxy'?'GALACTIC CHART':'SHORT-RANGE CHART');chart(ctx,10,50,780,430);}
  else if(tab==='launch'){frame(ctx,'READY TO LAUNCH');const lines=[`Fuel: ${C.fuel.toFixed(1)} LY`,`Cargo: ${cargoT()}/${C.cap}t`,`Missiles: ${C.missiles}`,`Hyperspace target: ${C.target!==null&&C.target!==undefined?GAL[C.target].name+' ('+SL.dist(GAL[C.sys],GAL[C.target])+' LY)':'none — choose one on the CHART'}`];
   lines.forEach((l,i)=>text(ctx,l,CX,90+i*30,'#e6e9f2',17,'center'));button(ctx,B(CX-150,250,300,80,'🚀 LAUNCH',launch,{fs:26,bg:'rgba(255,45,85,.85)'}));
   wrap(ctx,'Flying: steer with the arrow keys or W A S D (or drag on a tablet). R / F or the slider change speed. Space fires. J = jump drive, C = docking computer, H = hyperspace, M = missile, E = E.C.M., G = chart, 1 / 2 = front / rear view.',60,360,680,20,'#9aa3c7',14);}
  const lm=msgs[msgs.length-1];if(lm){ctx.fillStyle='rgba(5,8,22,.95)';ctx.fillRect(10,H-74,W-20,20);text(ctx,lm.t,CX,H-72,lm.c,14,'center');}tabsBar(ctx);if(overlay==='reset')resetBox(ctx);}
 function wrap(ctx,t,x,y,w,lh,col,size){ctx.font=`${size}px "Courier New",monospace`;const words=t.split(' ');let line='',yy=y;for(const wd of words){const test=line?line+' '+wd:wd;if(ctx.measureText(test).width>w&&line){text(ctx,line,x,yy,col,size,'left',false);line=wd;yy+=lh;}else line=test;}if(line)text(ctx,line,x,yy,col,size,'left',false);return yy+lh;}
 function missionStatus(m){const left=m.deadline?`day ${m.deadline}${C.day>m.deadline?' — LATE!':''}`:'';if(m.type==='courier')return`Take the package to ${GAL[m.dest].name} by ${left}`;
  if(m.type==='supply')return`Bring ${m.qty}t ${GOODS[m.good][0]} to ${GAL[m.sys].name} (you have ${C.cargo[m.good]||0}t) by ${left}`;
  if(m.type==='bounty')return m.killed?`Done! Return to ${GAL[m.from].name} for ${m.reward} Cr`:`Hunt ${m.target} at ${GAL[m.sys].name} by ${left}`;
  return`${GAL[m.sys].name}: ${m.delivered?'✓':'deliver'} ${m.qty}t ${GOODS[m.good][0]} · patrols ${Math.min(m.kills,m.need)}/${m.need} · by ${left}`;}
 function accept(o){if(C.missions.length>=4){msg('YOU CAN ONLY TAKE 4 MISSIONS AT ONCE',2.5,'#ff2d55');return;}C.missions.push({...o});C.board.offers=C.board.offers.filter(x=>x!==o);selMis=0;msg('MISSION ACCEPTED',2,'#3cff6a');env.beep(1000,.2,'triangle',.05,1.5);persist();}
 function resetBox(ctx){ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(0,0,W,H);text(ctx,'Start a brand-new commander?',CX,200,'#ffe45e',22,'center');text(ctx,'Your credits, cargo, equipment and missions will be lost.',CX,236,'#e6e9f2',15,'center');
  button(ctx,B(CX-220,290,200,50,'YES, START AGAIN',()=>{C=newCommander();overlay=null;tab='status';persist();syncScore();},{bg:'rgba(255,45,85,.85)'}));button(ctx,B(CX+20,290,200,50,'NO, KEEP PLAYING',()=>{overlay=null;}));}
 // ---------------- charts ----------------
 function chart(ctx,x,y,w,h){const local=chartMode==='local',cur=GAL[C.sys];
  const sx=local?w/64:w/256,sy=local?h/40:h/128,ox=local?cur.x-32:0,oy=local?cur.y-20:0;const pt=s=>[x+(s.x-ox)*sx,y+(s.y-oy)*sy];
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.strokeStyle='#3b4a8f';ctx.strokeRect(x,y,w,h);
  // fuel range ellipse
  const c=pt(cur);ctx.strokeStyle='#3cff6a';ctx.beginPath();ctx.ellipse(c[0],c[1],C.fuel/.22*sx,C.fuel/(.22*1.6)*sy,0,0,Math.PI*2);ctx.stroke();
  for(const s0 of GAL){const s=sysOf(s0.i),p=pt(s);if(p[0]<x-10||p[0]>x+w+10||p[1]<y-10||p[1]>y+h+10)continue;const vis=C.visited[s.i],mis=C.missions.some(m=>m.sys===s.i||m.dest===s.i);
   ctx.fillStyle=mis?'#ff8a1c':vis?'#3fe0ff':'#e6e9f2';const r=local?3+s.tech/4:1.6+s.tech/8;ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fill();
   if(local){text(ctx,s.name,p[0]+7,p[1]-7,mis?'#ff8a1c':'#c8d0ff',13);}}
  ctx.strokeStyle='#ffe45e';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(c[0]-12,c[1]);ctx.lineTo(c[0]+12,c[1]);ctx.moveTo(c[0],c[1]-12);ctx.lineTo(c[0],c[1]+12);ctx.stroke();
  if(C.target!==null&&C.target!==undefined){const t=pt(GAL[C.target]);ctx.strokeStyle='#ff4fd8';ctx.beginPath();ctx.arc(t[0],t[1],9,0,Math.PI*2);ctx.stroke();}
  ctx.restore();btns.push({x,y,w,h,fn:(px,py)=>{let best=null,bd=local?30:16;for(const s of GAL){const p=pt(s),d=Math.hypot(p[0]-px,p[1]-py);if(d<bd){bd=d;best=s;}}if(best){C.target=best.i===C.sys?null:best.i;env.beep(800,.05,'square',.03);}}});
  const t=C.target!==null&&C.target!==undefined?sysOf(C.target):null;
  if(t){const d=SL.dist(cur,GAL[t.i]);text(ctx,`${t.name}: ${d} LY · ${GOV[t.gov]} · ${ECON[t.eco]} · Tech ${t.tech}`,x+6,y+h+6,d<=C.fuel?'#3cff6a':'#ff8a1c',14);text(ctx,d<=C.fuel?'In range — press HYPER in flight':'Too far for your fuel',x+w-4,y+h+6,d<=C.fuel?'#3cff6a':'#ff8a1c',13,'right');}
  else text(ctx,'Tap a star to choose your hyperspace destination. Green ring = fuel range. Orange = mission.',x+6,y+h+6,'#9aa3c7',13);
  button(ctx,B(x+w-190,y+6,180,28,local?'GALAXY VIEW':'SHORT-RANGE VIEW',()=>{chartMode=local?'galaxy':'local';},{fs:12}));}
 function renderOverlay(ctx){btns=[];renderFlight(ctx);btns=[];ctx.fillStyle='rgba(0,0,0,.92)';ctx.fillRect(0,0,W,VH);text(ctx,chartMode==='galaxy'?'GALACTIC CHART':'SHORT-RANGE CHART',CX,6,'#3fe0ff',18,'center');chart(ctx,10,30,780,350);
  button(ctx,B(10,30+356-36,120,30,'DATA',()=>{overlay='data';},{fs:12}));button(ctx,B(W-130,4,120,26,'✕ CLOSE',()=>{overlay=null;},{fs:12}));
  if(overlay==='data'){const t=C.target!==null&&C.target!==undefined?sysOf(C.target):here();ctx.fillStyle='rgba(0,0,0,.95)';ctx.fillRect(0,0,W,VH);text(ctx,`DATA ON ${t.name.toUpperCase()}`,CX,10,'#3fe0ff',18,'center');
   [['Economy',ECON[t.eco]],['Government',GOV[t.gov]],['Tech Level',t.tech],['Population',t.pop+' Billion'],['Species',t.species]].forEach(([a,b],i)=>{text(ctx,a+':',30,46+i*26,'#3cff6a',16);text(ctx,String(b),220,46+i*26,'#fff',16);});wrap(ctx,t.desc,30,184,740,20,'#e6e9f2',15);
   button(ctx,B(W-130,4,120,26,'◀ CHART',()=>{overlay='chart';},{fs:12}));}}
 // ---------------- animations ----------------
 function tunnel(ctx,t,rings,col,label){ctx.fillStyle='#000';ctx.fillRect(0,0,W,VH);ctx.strokeStyle=col;ctx.lineWidth=2;for(let i=0;i<rings;i++){const k=((i/rings+t)%1),s=Math.pow(k,2.2);if(label==='hyper'){ctx.strokeStyle=Retro.cyc(t*2,i);ctx.beginPath();ctx.ellipse(CX,CY,s*600,s*380,0,0,Math.PI*2);ctx.stroke();}else ctx.strokeRect(CX-s*560,CY-s*300,s*1120,s*600);}}
 // ---------------- main update / render ----------------
 function controls(){const inv=C.invert?-1:1;let roll=(K.ArrowRight||K.d||K.D?1:0)-(K.ArrowLeft||K.a||K.A?1:0),pitch=((K.ArrowUp||K.w||K.W?1:0)-(K.ArrowDown||K.s||K.S?1:0))*inv,thr=(K.r||K.R||K['+']||K['=']||K.PageUp?1:0)-(K.f||K.F||K['-']||K.PageDown?1:0),fire=!!K[' ']||fireTouch;
  if(stick){roll+=pad.x*1.2;pitch+=-pad.y*1.2*inv;}
  if(gp){const a=gp.axes||[],b=i=>gp.buttons[i]&&gp.buttons[i].pressed;if(Math.abs(a[0]||0)>.15)roll+=a[0];if(Math.abs(a[1]||0)>.15)pitch+=-(a[1])*inv;if(b(7))thr+=1;if(b(6))thr-=1;if(b(0))fire=true;}
  return{roll:Math.max(-1,Math.min(1,roll)),pitch:Math.max(-1,Math.min(1,pitch)),thr,fire};}
 let gpPrev=[];
 function pollPad(){gp=null;try{const pads=navigator.getGamepads?navigator.getGamepads():[];gp=[...pads].find(p=>p&&p.connected)||null;}catch(e){}if(!gp)return;const press=i=>gp.buttons[i]&&gp.buttons[i].pressed&&!gpPrev[i];
  if(mode==='flight'&&!overlay){if(press(1))fireMissile();if(press(2))ecm();if(press(3))toggleJump();if(press(4))toggleDock();if(press(5))startHyper();if(press(8))view=view==='front'?'rear':'front';}if(press(9))overlay=overlay?null:(mode==='flight'?'chart':overlay);gpPrev=gp.buttons.map(b=>b.pressed);}
 G.update=(dt)=>{clock+=dt;FX.update(dt);msgs.forEach(m=>m.d-=dt);msgs=msgs.filter(m=>m.d>0);if(lastHit>0)lastHit-=dt*2;if(laserShow>0)laserShow-=dt;pollPad();
  for(const b of booms)b.t+=dt;booms=booms.filter(b=>b.t<(b.spark?.6+.2:2.4));if(booms.length&&booms[0].spark)booms=booms.filter(b=>!b.spark||b.t<.8);
  if(mode==='launch'){anim+=dt;if(anim>1.6){mode='flight';msg(`LEAVING ${here().name.toUpperCase()} STATION`,3,'#3fe0ff');}return;}
  if(mode==='dockAnim'){anim+=dt;if(anim>1.6){mode='docked';tab='status';env.engine&&env.engine.stop&&env.engine.stop();}return;}
  if(mode==='hyper'){anim+=dt;if(anim>2.6)arrive();return;}
  if(mode==='dead'){deathT+=dt;if(deathT>2.8)G.over=true;return;}
  if(mode==='flight'&&!overlay)flight(dt);};
 G.render=ctx=>{btns=[];
  if(mode==='docked'){renderDocked(ctx);return;}
  if(mode==='launch'||mode==='dockAnim'){tunnel(ctx,anim*(mode==='launch'?1:-1)+5,6,'#3fe0ff');dashboard(ctx);text(ctx,mode==='launch'?'LAUNCHING…':'DOCKING…',CX,VH-40,'#3fe0ff',18,'center');return;}
  if(mode==='hyper'){tunnel(ctx,anim*.8,12,'#ff4fd8','hyper');dashboard(ctx);text(ctx,'HYPERSPACE',CX,VH-40,'#ff4fd8',18,'center');return;}
  if(overlay==='chart'||overlay==='data'){renderOverlay(ctx);return;}
  renderFlight(ctx);
  if(mode==='dead'){ctx.fillStyle=`rgba(0,0,0,${Math.min(.75,deathT/3)})`;ctx.fillRect(0,0,W,H);text(ctx,'GAME OVER',CX,VH/2-30,'#ff2d55',36,'center');text(ctx,'Your ship was destroyed. Next time you continue from your last docking.',CX,VH/2+20,'#e6e9f2',15,'center');}};
 // ---------------- input from the arcade ----------------
 G.onKey=(type,key)=>{if(type==='up'){K[key]=false;return;}K[key]=true;const k=key.length===1?key.toLowerCase():key;
  if(overlay==='reset'){if(k==='Escape')overlay=null;return;}
  if(mode==='docked'){const n='1234567'.indexOf(k);if(n>=0){tab=TABS[n][0];sel=0;return;}
   if(tab==='market'){if(k==='ArrowUp')sel=(sel+GOODS.length-1)%GOODS.length;else if(k==='ArrowDown')sel=(sel+1)%GOODS.length;else if(k==='ArrowRight'||k==='+'||k==='=')buy(sel,1);else if(k==='ArrowLeft'||k==='-')sellG(sel,1);else if(k==='Enter')buy(sel,999);return;}
   if(tab==='shipyard'){if(k==='ArrowUp')selEq=(selEq+EQUIP.length-1)%EQUIP.length;else if(k==='ArrowDown')selEq=(selEq+1)%EQUIP.length;else if(k==='Enter'||k===' ')buyEq(EQUIP[selEq]);return;}
   if(tab==='missions'){const o=board();if(k==='ArrowUp')selMis=Math.max(0,selMis-1);else if(k==='ArrowDown')selMis=Math.min(o.length-1,selMis+1);else if(k==='Enter'&&o[selMis])accept(o[selMis]);return;}
   if(tab==='chart'&&k==='Tab'){chartMode=chartMode==='galaxy'?'local':'galaxy';return;}
   if(tab==='launch'&&(k==='Enter'||k===' '))launch();if(k==='l')launch();return;}
  if(mode!=='flight')return;
  if(overlay){if(k==='Escape'||k==='g')overlay=null;else if(k==='Tab')chartMode=chartMode==='galaxy'?'local':'galaxy';return;}
  if(k==='m')fireMissile();else if(k==='e')ecm();else if(k==='b')bomb();else if(k==='j')toggleJump();else if(k==='c')toggleDock();else if(k==='h')startHyper();else if(k==='g'){overlay='chart';chartMode='galaxy';}else if(k==='1')view='front';else if(k==='2')view='rear';else if(k==='x')ejectPod();};
 const ptrs={};
 G.onPointer=(type,x,y,id,kind)=>{if(kind==='touch'||kind==='pen')touchSeen=true;
  if(type==='down'&&G.intro&&G.tap){G.tap();return;}
  if(type==='down'){for(let i=btns.length-1;i>=0;i--){const b=btns[i];if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){b.fn(x,y);ptrs[id]='btn';return;}}
   if(mode==='flight'&&!overlay){if(touchSeen&&Math.hypot(x-(W-95),y-(VH-95))<62){fireTouch=true;ptrs[id]='fire';return;}if(touchSeen&&x>W-50&&y>50&&y<270){ptrs[id]='thr';P.throttle=Math.max(0,Math.min(1,(260-y)/200));return;}
    if(y<VH){stick={x0:x,y0:y,id};pad={x:0,y:0};ptrs[id]='stick';return;}}return;}
  if(type==='move'){if(ptrs[id]==='stick'&&stick){pad={x:Math.max(-1,Math.min(1,(x-stick.x0)/60)),y:Math.max(-1,Math.min(1,(y-stick.y0)/60))};}else if(ptrs[id]==='thr'&&P){P.throttle=Math.max(0,Math.min(1,(260-y)/200));}return;}
  if(type==='up'){if(ptrs[id]==='stick'){stick=null;pad={x:0,y:0};}if(ptrs[id]==='fire')fireTouch=false;delete ptrs[id];}};
 G.onWheel=d=>{if(mode==='flight'&&P)P.throttle=Math.max(0,Math.min(1,P.throttle-d*.0015));};
 // time up or stopped: an emergency autopilot docks the ship so nothing is lost
 G.onEnd=why=>{stopMusic();if(mode==='flight'||mode==='launch'||mode==='hyper'){if(mode==='hyper'&&interdicted){/* stay in the departure system */}finishDock();mode='docked';}else if(mode==='docked'||mode==='dockAnim')persist();};
 G._dbg={get C(){return C;},get P(){return P;},get mode(){return mode;},get station(){return station;},get ships(){return ships;},set:(k,v)=>{({mode:()=>mode=v,tab:()=>tab=v,overlay:()=>overlay=v})[k]();},launch,startHyper,toggleDock,spawn,buy,buyEq,accept,board,arrive:()=>arrive(),flight,kill:sh=>kill(sh,true),dock:()=>docked(),get tab(){return tab;}};
 if(env.store)persist();
 const legend=['sparrow','raven','hauler','warden'].map(k=>({name:SHIPS[k].name.toUpperCase(),pts:SHIPS[k].role.toUpperCase(),color:SHIPS[k].color,draw:(c,x,y,tt)=>{const m=MODELS[k],a=tt*1.2,o={r:[Math.cos(a),0,-Math.sin(a)],u:[0,1,0],f:[Math.sin(a),0,Math.cos(a)]};c.strokeStyle=SHIPS[k].color;c.lineWidth=1.2;c.beginPath();
   const pts=m.pts.map(p=>{const w=toWorld(o,p);const z=w[2]+160,s=70/z;return[x+w[0]*s*1.2,y-(w[1]*Math.cos(.4)-w[2]*Math.sin(.4))*s*1.2];});for(const e of m.edges){c.moveTo(...pts[e.a]);c.lineTo(...pts[e.b]);}c.stroke();}}));
 return Retro.intro(G,{title:'STARLANE TRADER',color:'#3fe0ff',sub:'TRADE - FIGHT - EXPLORE THE GALAXY',tableTitle:'SHIPS YOU WILL MEET',legend,stars:true,bg:'#000',hi:env.hi,hint:C.day>1||C.credits!==100?`WELCOME BACK, COMMANDER - DAY ${C.day} - ${Math.floor(C.credits)} CR`:'A NEW COMMANDER WITH 100 CREDITS - PRESS FIRE'});}
GAME_LIST.push({id:'starlane',name:'Starlane Trader',icon:'🚀',desc:'Trade, fight and explore a whole galaxy. Your career is saved!',two:'none'});
Object.assign(PADS,{starlane:[]});
Object.assign(GAMES,{starlane:makeStarlane});
