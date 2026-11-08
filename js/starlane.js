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
 // what each system looks like (separate random stream, so names, economies and missions are unchanged)
 const STARCOL=[['#ffe45e','yellow'],['#ff8a1c','orange'],['#ff2d55','red dwarf'],['#9fd8ff','blue-white'],['#ffffff','white']];
 function features(s){const r=rng((s.seed^0x5bd1e995)>>>0);const kind=r()<.24?'gas':r()<.5?'crater':'rocky';const rings=kind==='gas'?r()<.7:r()<.14;const moons=kind==='gas'?ri(r,1,3):ri(r,0,2);
  const stars=r()<.7?1:r()<.8?2:3;const cols=Array.from({length:stars},()=>ri(r,0,4));const belt=r()<.3,meteors=r()<.2;
  const parts=[kind==='gas'?'Gas giant':kind==='crater'?'Cratered world':'Rocky world',rings?'with rings':'',moons?`${moons} moon${moons>1?'s':''}`:'no moons',stars===1?`${STARCOL[cols[0]][1]} star`:stars===2?'binary star':'triple star',belt?'asteroid belt':'',meteors?'meteor showers':''].filter(Boolean);
  return{kind,rings,moons,stars,cols,belt,meteors,text:parts.join(' · ')};}
 const dist=(a,b)=>Math.round(Math.hypot((a.x-b.x),(a.y-b.y)*1.6)*.22*10)/10;
 return{STARCOL,features,V,add,sub,mul,dot,cross,len,norm,rot,ortho,toLocal,toWorld,steer,rng,ri,rp,hull,MODELS,asteroidModel,SHIPS,GOODS,ECON,GOV,GOVDESC,marketPrices,EQUIP,LASERS,RANKS,rankOf,legalName,makeGalaxy,dist};
})();

function makeStarlane(env){
 const {V,add,sub,mul,dot,cross,len,norm,rot,ortho,toLocal,toWorld,steer,rng,ri,rp,MODELS,SHIPS,GOODS,ECON,GOV,EQUIP,LASERS,rankOf,legalName}=SL;
 const W=800,H=600,VH=400,CX=400,CY=200,FOC=380,GSEED=20261108,COUNT=160,GAL=SL.makeGalaxy(GSEED,COUNT);
 const G={W,H,score:0,lives:1,level:1,levelName:'Rank',over:false,preferFull:true};
 const FX=Retro.fx();
 const ACTIONS=[['rollL','Roll left',['ArrowLeft','a'],1],['rollR','Roll right',['ArrowRight','d'],1],['up','Nose up',['ArrowUp','w'],1],['down','Nose down',['ArrowDown','s'],1],['fast','Speed up',['r','+','='],1],['slow','Slow down',['f','-'],1],['fire','Fire laser',[' '],1],
  ['missile','Fire missile',['m']],['ecm','E.C.M.',['e']],['bomb','Shock pulse',['b']],['jump','Jump drive',['j']],['dock','Docking computer',['c']],['hyper','Hyperspace',['h']],['time','Speed up time',['t']],['view','Next view',['v']],['cam','Outside camera',['o']],['chart','Galaxy chart',['g']],['cargo','Cargo hold',['i']],['missions','Missions',['k']],['pod','Escape capsule',['x']]];
 const optDefaults=()=>({tips:true,cuts:true,keys:Object.fromEntries(ACTIONS.map(a=>[a[0],a[2].slice()]))});
 function fixOpt(){C.opt=Object.assign(optDefaults(),C.opt||{});C.opt.keys=Object.assign(optDefaults().keys,C.opt.keys||{});}
 // ---------------- commander (saved with the player's progress) ----------------
 function newCommander(){const start=GAL.find(s=>s.gov>=5&&s.tech>=6&&s.eco>=4)||GAL.find(s=>s.gov>=4)||GAL[0];
  return{v:1,opt:optDefaults(),flight:null,sys:start.i,credits:100,fuel:7,cargo:{},cap:20,equip:{},front:'pulse',rear:null,missiles:3,legal:0,killPts:0,kills:0,day:1,missions:[],gov:{},news:[],visited:{[start.i]:1},target:null,invert:false,done:0,market:null,board:null};}
 let C=(()=>{const s=env.store&&env.store.get();return s&&s.v===1&&GAL[s.sys]?JSON.parse(JSON.stringify(s)):newCommander();})();
 fixOpt();
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
 let suns=[],moons=[],feat=null,CAM={pos:V(),r:V(1,0,0),u:V(0,1,0),f:V(0,0,1)},camMode='cockpit',timeScale=1,exitT=0,hyp=[],scene=null,hover=null,tip=null,remap=null,menuTab='main',helpTab=0,saveNote='',apFinal=false,P,planet,station,sun,ships=[],dust=[],booms=[],spawnT=0,laserT=0,firing=false,laserShow=0,dockComp=false,jump=false,massLock=false,ecmT=0,dockMusic=null,lastHit=0;
 const SAFE=16000;
 function buildSystem(deep){const s=here(),r=rng(s.seed+C.day*31);ships=[];booms=[];moons=[];suns=[];feat=SL.features(s);
  if(deep){planet=null;station=null;sun=null;return;}
  const R=(4200+s.radius*.35)*(feat.kind==='gas'?2.1:1);const tilt=(r()-.5)*.9,po={r:V(1,0,0),u:norm(V(Math.sin(tilt),Math.cos(tilt),0)),f:V(0,0,1)};ortho(po);
  planet={pos:V(0,0,0),R,o:po,spin:.02,kind:feat.kind,rings:feat.rings?{a:R*1.45,b:R*2.25}:null};
  const sd=norm(V(r()*2-1,(r()-.5)*.6,r()*2-1));const spos=mul(sd,R*(feat.rings?2.7:1.75));const sf=norm(sub(planet.pos,spos));
  const so={f:sf,u:norm(cross(sf,V(1,0,0.3))),r:V(1,0,0)};ortho(so);station={type:'station',m:MODELS.station,pos:spos,o:so,spin:.32,energy:9999};
  for(let k=0;k<feat.stars;k++){const d=norm(V(r()*2-1,(r()-.5)*.5,r()*2-1));suns.push({pos:mul(d,R*(42+k*25)),R:R*(k?2.4:4.5)*(feat.kind==='gas'?.6:1),col:SL.STARCOL[feat.cols[k]][0]});}sun=suns[0];
  for(let k=0;k<feat.moons;k++){let d;do{d=norm(V(r()*2-1,(r()-.5)*.5,r()*2-1));}while(dot(d,sd)>.6);moons.push({pos:mul(d,R*(3.4+k*1.9)),R:R*(.14+r()*.14),o:{r:V(1,0,0),u:V(0,1,0),f:V(0,0,1)},crater:r()<.5});}
  if(feat.belt){for(let k=0;k<9;k++){const a=k/9*Math.PI*2+r(),d=add(mul(so.r,Math.cos(a)*(5000+r()*3000)),mul(so.u,Math.sin(a)*(5000+r()*3000)));spawn('asteroid',add(add(spos,d),mul(sf,-(1500+r()*4000))),{speed:8});}}}
 function placeAtArrival(){const s=station;const d=norm(sub(s.pos,planet.pos));const side=norm(cross(d,V(0,1,0)));
  const pos=add(add(planet.pos,mul(d,planet.R*13)),mul(side,planet.R*2));const f=norm(sub(s.pos,pos));const o={f,u:V(0,1,0),r:V(1,0,0)};ortho(o);P.pos=pos;P.o=o;}
 function newPlayer(){const lasers=C.front||'pulse';P={pos:V(),o:{r:V(1,0,0),u:V(0,1,0),f:V(0,0,1)},speed:0,throttle:.3,max:330,shF:100,shA:100,energy:100,cabin:20,heat:0,roll:0,pitch:0,cool:0};}
 function initDust(){dust=Array.from({length:110},()=>add(P.pos,V((Math.random()-.5)*3000,(Math.random()-.5)*3000,(Math.random()-.5)*3000)));}
 function moveDust(){for(let i=0;i<dust.length;i++){const rel=sub(dust[i],P.pos);if(len(rel)>1700){const fwd=P.speed>40?mul(P.o.f,700+Math.random()*900):V();dust[i]=add(add(P.pos,fwd),V((Math.random()-.5)*2600,(Math.random()-.5)*2600,(Math.random()-.5)*2600));}}}
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
  if(feat&&feat.meteors&&r<.75&&!inSafe){const a=spawn('asteroid',aroundPlayer(6000,1.2),{speed:0});a.drift=mul(norm(add(P.o.r,mul(P.o.u,Math.random()-.5))),-900);msg('METEOR SHOWER!',2,'#ff8a1c');return;}
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
  if(C.opt.cuts){scene=makeScene('launch');mode='launchScene';env.beep(160,2.6,'sawtooth',.035,3);}else{mode='launch';anim=0;env.beep(200,1.2,'sawtooth',.04,3);}timeScale=1;camMode='cockpit';view='front';missionSpawns();}
 function docked(auto){stopMusic();timeScale=1;dockComp=false;if(C.opt.cuts){scene=makeScene('dock');mode='dockScene';}else{mode='dockAnim';anim=0;}env.beep(600,.9,'triangle',.05,.4);
  // arriving: complete deliveries, refresh the board, save
  C.visited[C.sys]=1;finishDock();}
 function finishDock(){P&&(P.speed=0);C.flight=null;const s=here();const done=[];
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
  hyperT=5;hyperTo=C.target;hypInit();msg(`HYPERSPACE TO ${GAL[C.target].name.toUpperCase()}`,2,'#3fe0ff');}
 function doHyper(){const d=SL.dist(GAL[C.sys],GAL[hyperTo]);const alien=Math.random()<.03+(here().gov<=1?.02:0);mode='hyper';anim=0;timeScale=1;C.flight=null;if(!hyp.length)hypInit();env.beep(90,3.4,'sawtooth',.05,8);
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
  const nearShip=ships.some(s=>!s.dead&&!['cargo','rock'].includes(s.T.role)&&len(sub(s.pos,P.pos))<7000)||moons.some(m=>len(sub(m.pos,P.pos))<m.R*1.6),nearStation=station&&len(sub(station.pos,P.pos))<SAFE*.75,nearPlanet=planet&&len(sub(planet.pos,P.pos))<planet.R*1.4;
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
  if(suns.length){let heat=20,near=null;for(const sn of suns){const ds=len(sub(P.pos,sn.pos));if(ds<sn.R*1.05){msg('FLEW INTO A STAR!',3,'#ff2d55');P.energy=0;die();return;}const h=20+Math.max(0,(sn.R*3-ds)/(sn.R*2))*235;if(h>heat){heat=h;near=sn;}}P.cabin=Math.min(255,heat);
   if(P.cabin>200){P.energy-=dt*12;if(Math.random()<dt*2)msg('CABIN TEMPERATURE CRITICAL',1,'#ff2d55');}
   if(has('scoop')&&P.cabin>120&&P.speed>100&&C.fuel<7){C.fuel=Math.min(7,C.fuel+dt*.25);if(Math.random()<dt)msg('FUEL SCOOPS ON',1,'#ffe45e');}}
  for(const mn of moons){if(len(sub(P.pos,mn.pos))<mn.R){msg('YOU CRASHED INTO A MOON!',3,'#ff2d55');P.energy=0;die();return;}}
  // time acceleration switches itself off when there's danger
  if(timeScale>1&&ships.some(x=>!x.dead&&(x.angry||x.type==='missile')&&len(sub(x.pos,P.pos))<12000)){timeScale=1;msg('TIME ACCELERATION OFF — DANGER!',2.5,'#ff2d55');}
  if(P.energy<=0){die();return;}
  // station
  if(station){station.o.r=rot(station.o.r,station.o.f,station.spin*dt);station.o.u=rot(station.o.u,station.o.f,station.spin*dt);ortho(station.o);checkDock();}
  if(planet){planet.o.r=rot(planet.o.r,planet.o.u,planet.spin*dt);planet.o.f=rot(planet.o.f,planet.o.u,planet.spin*dt);}
  // other ships
  for(const sh of ships)if(!sh.dead)ai(sh,dt);ships=ships.filter(s=>!s.dead&&len(sub(s.pos,P.pos))<60000);
  spawnTick(dt);
  // hyperspace countdown
  if(hyperT>0){const before=Math.ceil(hyperT);hyperT-=dt;if(Math.ceil(hyperT)!==before&&hyperT>0)env.beep(500,.08,'square',.03);if(hyperT<=0){hyperT=0;doHyper();}}
  moveDust();
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
  if(T.role==='rock'||T.role==='cargo'){sh.o.f=rot(sh.o.f,sh.o.u,sh.spinA*dt);sh.o.r=rot(sh.o.r,sh.o.u,sh.spinA*dt);sh.o.u=rot(sh.o.u,sh.o.f,sh.spinB*dt);ortho(sh.o);sh.pos=add(sh.pos,mul(sh.o.f,sh.speed*dt*.2));if(sh.drift)sh.pos=add(sh.pos,mul(sh.drift,dt));
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
 // ---------------- cameras: four cockpit views and an outside chase camera ----------------
 function setCam(){if(camMode==='ext'&&P){CAM.pos=add(add(P.pos,mul(P.o.f,-440)),mul(P.o.u,150));CAM.f=norm(sub(add(P.pos,mul(P.o.f,260)),CAM.pos));CAM.u=P.o.u.slice();ortho(CAM);return;}
  const o=P.o;CAM.pos=P.pos;if(view==='rear'){CAM.f=mul(o.f,-1);CAM.u=o.u;CAM.r=mul(o.r,-1);}else if(view==='left'){CAM.f=mul(o.r,-1);CAM.u=o.u;CAM.r=o.f;}else if(view==='right'){CAM.f=o.r;CAM.u=o.u;CAM.r=mul(o.f,-1);}else{CAM.f=o.f;CAM.u=o.u;CAM.r=o.r;}}
 function cam(p){const d=sub(p,CAM.pos);return[dot(d,CAM.r),dot(d,CAM.u),dot(d,CAM.f)];}
 const proj=c=>[CX+FOC*c[0]/c[2],CY-FOC*c[1]/c[2]];
 function seg(ctx,a,b){const N=4;if(a[2]<N&&b[2]<N)return;if(a[2]<N){const t=(N-a[2])/(b[2]-a[2]);a=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,N];}else if(b[2]<N){const t=(N-b[2])/(a[2]-b[2]);b=[b[0]+(a[0]-b[0])*t,b[1]+(a[1]-b[1])*t,N];}
  const p=proj(a),q=proj(b);if(Math.max(Math.abs(p[0]),Math.abs(p[1]),Math.abs(q[0]),Math.abs(q[1]))>2e4)return;ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);}
 function drawModel(ctx,m,pos,o,col,extra){const cm=toLocal(o,sub(CAM.pos,pos)),c0=cam(pos);if(c0[2]<-m.rad)return;const pr=c0[2]>0?FOC*m.rad/c0[2]:99;
  if(pr<1.6){if(c0[2]>0){const p=proj(c0);ctx.fillStyle=col;ctx.fillRect(p[0]-1,p[1]-1,2,2);}return;}
  const vis=m.faces.map(f=>dot(f.n,cm)-f.d>0),pts=m.pts.map(p=>cam(add(pos,toWorld(o,p))));ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.beginPath();
  for(const e of m.edges)if(e.f.some(i=>vis[i]))seg(ctx,pts[e.a],pts[e.b]);ctx.stroke();if(extra)extra(vis,pts);}
 function drawStation(ctx,s){s=s||station;drawModel(ctx,s.m,s.pos,s.o,'#e6e9f2',vis=>{const front=s.m.faces.findIndex(f=>f.n[2]>.99);if(front<0||!vis[front])return;
   const c=[[-110,-36],[110,-36],[110,36],[-110,36]].map(([x,y])=>cam(add(s.pos,toWorld(s.o,[x,y,331]))));ctx.strokeStyle='#3fe0ff';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<4;i++)seg(ctx,c[i],c[(i+1)%4]);ctx.stroke();});}
 // a circle on a sphere's surface, hiding the far side (and anything behind another body)
 function circ(ctx,body,a,b,cen,rr,occ){const eye=norm(sub(CAM.pos,body.pos));let prev=null;for(let i=0;i<=48;i++){const t=i/48*Math.PI*2,pt=add(cen,add(mul(a,Math.cos(t)*rr),mul(b,Math.sin(t)*rr)));
   let ok=occ?!hidden(pt,body):dot(norm(sub(pt,body.pos)),eye)>0.02;const cc=cam(pt);if(ok&&prev)seg(ctx,prev,cc);prev=ok?cc:null;}}
 function hidden(pt,body){const v=sub(pt,CAM.pos),L=len(v),dir=mul(v,1/L),t=dot(sub(body.pos,CAM.pos),dir);if(t<=0||t>=L)return false;return len(sub(add(CAM.pos,mul(dir,t)),body.pos))<body.R;}
 function drawBody(ctx,b,col,detail){const c=cam(b.pos);if(c[2]<=10)return null;const d=len(sub(b.pos,CAM.pos));const p=proj(c),r=FOC*b.R/Math.sqrt(Math.max(1,d*d-b.R*b.R));if(r<1){ctx.fillStyle=col;ctx.fillRect(p[0],p[1],2,2);return null;}
  ctx.strokeStyle=col;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.stroke();if(r>6&&detail){ctx.beginPath();detail();ctx.stroke();}return r;}
 function drawPlanet(ctx){const pl=planet,o=pl.o;ctx.lineWidth=1.1;
  const r=drawBody(ctx,pl,'#3fe0ff',()=>{ctx.strokeStyle='rgba(63,224,255,.75)';
   if(pl.kind==='gas'){for(const lat of[-.62,-.35,-.12,.12,.35,.62])circ(ctx,pl,o.r,o.f,add(pl.pos,mul(o.u,Math.sin(lat)*pl.R)),Math.cos(lat)*pl.R);}
   else if(pl.kind==='crater'){circ(ctx,pl,o.r,o.f,add(pl.pos,mul(o.u,pl.R*.8)),pl.R*.6);circ(ctx,pl,o.u,o.f,add(pl.pos,mul(o.r,pl.R*.86)),pl.R*.5);}
   else{circ(ctx,pl,o.r,o.f,pl.pos,pl.R);circ(ctx,pl,o.u,o.f,pl.pos,pl.R);}});
  if(pl.rings&&cam(pl.pos)[2]>0){ctx.strokeStyle='rgba(255,228,94,.75)';ctx.lineWidth=1.2;ctx.beginPath();for(const rr of[pl.rings.a,(pl.rings.a+pl.rings.b)/2,pl.rings.b])circ(ctx,pl,o.r,o.f,pl.pos,rr,true);ctx.stroke();}}
 function drawMoon(ctx,mn){drawBody(ctx,mn,'#c8d0ff',()=>{ctx.strokeStyle='rgba(200,208,255,.6)';if(mn.crater)circ(ctx,mn,mn.o.r,mn.o.f,add(mn.pos,mul(mn.o.u,mn.R*.75)),mn.R*.55);else circ(ctx,mn,mn.o.u,mn.o.f,mn.pos,mn.R);});}
 function drawSun(ctx,sn){const c=cam(sn.pos);if(c[2]<=10)return;const p=proj(c),r=FOC*sn.R/c[2];if(r<1.2){ctx.fillStyle=sn.col;ctx.fillRect(p[0]-1,p[1]-1,3,3);return;}
  for(let y=-r;y<=r;y+=3){const w=Math.sqrt(r*r-y*y)*(.85+Math.random()*.15);ctx.fillStyle=Math.abs(y)<r*.5?sn.col:'#ff8a1c';ctx.globalAlpha=Math.abs(y)<r*.5?1:.75;ctx.fillRect(p[0]-w,p[1]+y,w*2,1.6);}ctx.globalAlpha=1;}
 // ---------------- hyperspace streaks (and the reverse on arrival) ----------------
 function hypInit(){hyp=Array.from({length:520},()=>[(Math.random()-.5)*2.4,(Math.random()-.5)*2.4,Math.random()]);}
 function hypMove(v,dt){for(const p of hyp){p[2]-=v*dt;if(p[2]<=.015){p[0]=(Math.random()-.5)*2.4;p[1]=(Math.random()-.5)*2.4;p[2]=1;}}}
 function drawStreaks(ctx,v,alpha){ctx.save();ctx.beginPath();ctx.rect(0,0,W,VH);ctx.clip();ctx.lineCap='round';
  for(const p of hyp){const z=p[2],tail=Math.min(1,z+.02+v*.11),a=[CX+p[0]/z*150,CY+p[1]/z*150],b=[CX+p[0]/tail*150,CY+p[1]/tail*150];if(Math.abs(a[0]-CX)>W||Math.abs(a[1]-CY)>W)continue;
   const br=Math.min(1,(1-z)*1.6);ctx.strokeStyle=`rgba(${200+55*br|0},${220+35*br|0},255,${alpha*br})`;ctx.lineWidth=.6+br*1.6;ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.lineTo(a[0],a[1]);ctx.stroke();}ctx.restore();}
 // ---------------- flight screen ----------------
 let btns=[],tips=[],touchSeen=!!env.touch,fireTouch=false;
 const B=(x,y,w,h,label,fn,o={})=>{btns.push({x,y,w,h,fn});return{x,y,w,h,label,...o};};
 function button(ctx,b,on){ctx.fillStyle=on?'rgba(255,228,94,.9)':b.bg||'rgba(30,38,80,.82)';ctx.strokeStyle=b.border||'#3fe0ff';ctx.lineWidth=2;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(b.x,b.y,b.w,b.h,8);else ctx.rect(b.x,b.y,b.w,b.h);ctx.fill();ctx.stroke();
  ctx.fillStyle=on?'#10142b':b.fg||'#fff';ctx.font=`bold ${b.fs||13}px "Courier New",monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.label,b.x+b.w/2,b.y+b.h/2+1);}
 function text(ctx,t,x,y,col='#fff',size=15,align='left',bold=true){ctx.fillStyle=col;ctx.font=`${bold?'bold ':''}${size}px "Courier New",monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(t,x,y);}
 const tipAt=(x,y,w,h,title,body)=>tips.push({x,y,w,h,title,body});
 const KN={ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',' ':'Space',Enter:'Enter',Escape:'Esc'};
 const keyName=id=>(C.opt.keys[id]||[]).map(k=>KN[k]||(k.length===1?k.toUpperCase():k)).join(' / ')||'—';
 function renderFlight(ctx){setCam();ctx.save();ctx.beginPath();ctx.rect(0,0,W,VH);ctx.clip();ctx.fillStyle='#000';ctx.fillRect(0,0,W,VH);const[sx,sy]=FX.offset();ctx.translate(sx,sy);
  const streak=Math.min(380,(jump?7000:P.speed)*.09);ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1;
  for(const d of dust){const c=cam(d);if(c[2]<=8)continue;const p=proj(c);if(p[0]<-20||p[0]>W+20||p[1]<-20||p[1]>VH+20)continue;const s=c[2]<400?2.2:c[2]<1000?1.5:1;ctx.fillStyle='#fff';ctx.fillRect(p[0],p[1],s,s);
   if(streak>25){const t=cam(add(d,mul(P.o.f,streak)));if(t[2]>8){const q=proj(t);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}}}
  for(const sn of suns)drawSun(ctx,sn);for(const mn of moons)drawMoon(ctx,mn);if(planet)drawPlanet(ctx);
  const objs=[...ships.filter(s=>!s.dead).map(s=>({s,z:cam(s.pos)[2]})),...(station?[{s:station,z:cam(station.pos)[2]}]:[]),...(camMode==='ext'?[{s:'me',z:cam(P.pos)[2]}]:[])].sort((a,b)=>b.z-a.z);
  for(const{s}of objs){if(s===station)drawStation(ctx);else if(s==='me'){drawModel(ctx,MODELS.kestrel,P.pos,P.o,'#ffe45e');const e=cam(add(P.pos,mul(P.o.f,-96)));if(e[2]>5){const p=proj(e);ctx.fillStyle=`rgba(63,224,255,${.4+P.throttle*.6})`;ctx.beginPath();ctx.arc(p[0],p[1],3+P.throttle*5,0,Math.PI*2);ctx.fill();}}
   else{drawModel(ctx,s.m,s.pos,s.o,s.T.color);if(s.shot>0){const c=cam(s.pos);if(c[2]>0){const p=proj(c),t=cam(P.pos);const q=t[2]>5?proj(t):[CX+(Math.random()-.5)*300,VH];ctx.strokeStyle='#ff2d55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}}}}
  for(const b of booms){if(b.spark){const c=cam(b.pos);if(c[2]>0){const p=proj(c);ctx.strokeStyle='#ffe45e';ctx.beginPath();for(let i=0;i<6;i++){const a=Math.random()*6.3,l=4+Math.random()*10;ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+Math.cos(a)*l,p[1]+Math.sin(a)*l);}ctx.stroke();}continue;}
   ctx.strokeStyle=b.col||'#fff';ctx.globalAlpha=Math.max(0,1-b.t/2.2);ctx.beginPath();for(const l of b.lines||[]){const c=add(l.c,mul(l.v,b.t));seg(ctx,cam(add(c,l.a)),cam(add(c,l.b)));}ctx.stroke();
   const c=cam(b.pos);if(c[2]>0&&b.t<1){const p=proj(c),r=FOC*60*(.4+b.t)/c[2];ctx.fillStyle='#fff';for(let i=0;i<14;i++){const a=Math.random()*6.3,d=Math.random()*r;ctx.fillRect(p[0]+Math.cos(a)*d,p[1]+Math.sin(a)*d,2,2);}}ctx.globalAlpha=1;}
  if(laserShow>0){const L=LASERS[view==='rear'?'pulse':C.front]||LASERS.pulse;ctx.strokeStyle=L.col;ctx.lineWidth=3;ctx.beginPath();
   if(camMode==='ext'){const a=cam(add(P.pos,mul(P.o.f,100))),b=cam(add(P.pos,mul(P.o.f,3500)));seg(ctx,a,b);}else if(view==='front'||view==='rear'){ctx.moveTo(150,VH);ctx.lineTo(CX,CY+4);ctx.moveTo(650,VH);ctx.lineTo(CX,CY+4);}ctx.stroke();}
  ctx.restore();
  if(hyperT>0&&hyperT<1.6){drawStreaks(ctx,(1.6-hyperT)*.18,.5);}
  if(exitT>0){const k=exitT/1.6;drawStreaks(ctx,1.6*k*k,k);if(exitT>1.35){ctx.fillStyle=`rgba(255,255,255,${(exitT-1.35)*3})`;ctx.fillRect(0,0,W,VH);}}
  // sights and view name
  if(camMode==='ext'){const t=cam(add(P.pos,mul(P.o.f,2600)));if(t[2]>5){const p=proj(t);ctx.strokeStyle='#ffe45e';ctx.lineWidth=1.5;ctx.strokeRect(p[0]-9,p[1]-9,18,18);}}
  else if(view==='front'||view==='rear'){ctx.strokeStyle='#ffe45e';ctx.lineWidth=2;ctx.beginPath();for(const[a,b,c,d]of[[CX-26,CY,CX-8,CY],[CX+8,CY,CX+26,CY],[CX,CY-22,CX,CY-7],[CX,CY+7,CX,CY+22]]){ctx.moveTo(a,b);ctx.lineTo(c,d);}ctx.stroke();}
  text(ctx,camMode==='ext'?'Outside View':{front:'Front View',rear:'Rear View',left:'Left View',right:'Right View'}[view],CX,8,'#c8d0ff',16,'center');
  if(timeScale>1)text(ctx,`TIME ×${timeScale}`,W-12,8,'#3cff6a',16,'right');
  if(hyperT>0)text(ctx,String(Math.ceil(hyperT)),18,8,'#3fe0ff',30);
  if(dockComp)text(ctx,'DOCKING COMPUTERS ON',CX,VH-56,'#3fe0ff',20,'center');
  msgs.forEach((m,i)=>text(ctx,m.t,CX,VH-110+i*22-(dockComp?28:0),m.c,16,'center'));
  if(lastHit>0){ctx.fillStyle=`rgba(255,45,85,${lastHit})`;ctx.fillRect(0,0,W,VH);}
  dashboard(ctx);touchControls(ctx);}
 // ---------------- the flight deck ----------------
 function bar(ctx,x,y,label,v,col,warn,tipTitle,tipBody){text(ctx,label,x,y-1,'#9aa3c7',12);ctx.fillStyle='#0d1126';ctx.fillRect(x+26,y,150,10);ctx.strokeStyle='#2a3266';ctx.strokeRect(x+26,y,150,10);ctx.fillStyle=warn&&v<.25?'#ff2d55':col;ctx.fillRect(x+26,y,150*Math.max(0,Math.min(1,v)),10);if(tipTitle)tipAt(x,y-3,178,16,tipTitle,tipBody);}
 function consoleKeys(ctx){const Y=VH+5,list=deckKeys(),w=(W-16)/list.length;
  list.forEach((k,i)=>{const x=8+i*w,kw=w-4,h=30;btns.push({x,y:Y,w:kw,h,fn:()=>{k.fn();k.flash=clock;if(touchSeen&&C.opt.tips)tip={title:k.title,body:k.body(),until:clock+2.5};}});
   const g=ctx.createLinearGradient(0,Y,0,Y+h);g.addColorStop(0,'#3a4466');g.addColorStop(.5,'#1d2440');g.addColorStop(1,'#11162b');ctx.fillStyle=g;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,Y,kw,h,4);else ctx.rect(x,Y,kw,h);ctx.fill();
   ctx.strokeStyle='#5d6aa3';ctx.lineWidth=1;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(x+3,Y+1.5);ctx.lineTo(x+kw-3,Y+1.5);ctx.stroke();
   const led=k.led();ctx.fillStyle=led||'#262b40';ctx.fillRect(x+kw/2-9,Y+4,18,4);if(led){ctx.fillStyle=led;ctx.globalAlpha=.35;ctx.fillRect(x+kw/2-12,Y+2,24,8);ctx.globalAlpha=1;}
   text(ctx,k.label(),x+kw/2,Y+12,'#dfe4ff',10,'center');tipAt(x,Y,kw,h,k.title,()=>k.body()+`  Key: ${keyName(k.key)}`);});}
 function deckKeys(){const tgtD=C.target!==null&&C.target!==undefined?SL.dist(GAL[C.sys],GAL[C.target]):null,G1='#3cff6a',AM='#ffb020',RD='#ff2d55';
  return[
   {key:'missile',label:()=>`MSL ${C.missiles}`,fn:fireMissile,led:()=>C.missiles?G1:null,title:'Missile',body:()=>`Fires a homing missile at the ship in your sights. ${C.missiles} left (buy more in the shipyard).`},
   {key:'ecm',label:()=>'ECM',fn:ecm,led:()=>!has('ecm')?null:ecmT>0?'#3fe0ff':G1,title:'E.C.M. jammer',body:()=>has('ecm')?'Destroys every missile flying nearby — use it when you hear INCOMING MISSILE.':'Not fitted. Buy one in a shipyard (tech level 2+).'},
   {key:'jump',label:()=>'JUMP',fn:toggleJump,led:()=>jump?G1:massLock?AM:null,title:'Jump drive',body:()=>jump?'ON — racing across the system. Press again to slow down.':massLock?'Mass-locked: too close to a ship, station or planet to jump.':'Super-fast travel inside a system, e.g. to reach the planet. Stops near anything.'},
   {key:'dock',label:()=>'DOCK',fn:toggleDock,led:()=>!has('dock')?null:dockComp?G1:'#2f6a3f',title:'Docking computer',body:()=>!has('dock')?'Not fitted. Buy one (tech level 9+) or dock by hand: line up with the slot, match its spin, go in slowly.':dockComp?'Flying you in automatically (with music!). Press again to take over.':'Press near a station and the computer docks for you.'},
   {key:'hyper',label:()=>hyperT>0?`HYP ${Math.ceil(hyperT)}`:'HYPER',fn:startHyper,led:()=>hyperT>0?AM:tgtD===null?null:tgtD<=C.fuel?G1:RD,title:'Hyperspace',body:()=>tgtD===null?'Jump to another star system. First choose a destination on the galaxy chart (MAP).':`Target: ${GAL[C.target].name}, ${tgtD} LY (fuel ${C.fuel.toFixed(1)} LY). ${tgtD<=C.fuel?'Press to start the 5-second countdown.':'Not enough fuel!'}`},
   {key:'time',label:()=>`TIME×${timeScale}`,fn:cycleTime,led:()=>timeScale>1?G1:null,title:'Time acceleration',body:()=>`Makes long journeys quicker (×2, ×4, ×8). Now ×${timeScale}. It switches off by itself if danger appears.`},
   {key:'view',label:()=>({front:'FRONT',rear:'REAR',left:'LEFT',right:'RIGHT'})[view],fn:nextView,led:()=>view!=='front'?AM:null,title:'View',body:()=>`Look out of the ${view} window. Keys 1–4 pick a view directly. You fire from the front (and the rear, if you have a rear laser).`},
   {key:'cam',label:()=>'CAM',fn:()=>{camMode=camMode==='ext'?'cockpit':'ext';},led:()=>camMode==='ext'?G1:null,title:'Outside camera',body:()=>`See your ship from behind and fly it from outside. Now: ${camMode==='ext'?'outside':'cockpit'}.`},
   {key:'bomb',label:()=>'BOMB',fn:bomb,led:()=>has('bomb')?RD:null,title:'Shock pulse',body:()=>has('bomb')?'Destroys every ship near you, once. Save it for emergencies!':'Not fitted (tech level 7+).'},
   {key:'pod',label:()=>'POD',fn:ejectPod,led:()=>!has('pod')?null:podArm>0?RD:AM,title:'Escape capsule',body:()=>has('pod')?'Press twice to eject. You keep your credits but lose your cargo.':'Not fitted (tech level 6+).'},
   {key:'cargo',label:()=>`HOLD ${cargoT()}`,fn:()=>{overlay='cargo';},led:()=>cargoT()?G1:null,title:'Cargo hold',body:()=>`What you are carrying: ${cargoT()}/${C.cap}t, plus fuel, missiles and equipment.`},
   {key:'missions',label:()=>`MISN ${C.missions.length}`,fn:()=>{overlay='missions';},led:()=>C.missions.length?G1:null,title:'Missions',body:()=>C.missions.length?`${C.missions.length} active mission${C.missions.length>1?'s':''} — tap to see where to go.`:'No missions. Pick some up on a station bulletin board.'},
   {key:'chart',label:()=>'MAP',fn:()=>{overlay='chart';chartMode='galaxy';},led:()=>null,title:'Galaxy chart',body:()=>'Choose a hyperspace destination. Green ring = how far your fuel reaches.'},
   {key:'menu',label:()=>'MENU',fn:()=>openMenu(),led:()=>null,title:'Pause menu',body:()=>'Pause, save the game, change controls and settings, and read how to dock and trade. (Key: P)'}];}
 function dashboard(ctx){const Y=VH;const g=ctx.createLinearGradient(0,Y,0,H);g.addColorStop(0,'#0b0f22');g.addColorStop(1,'#04060f');ctx.fillStyle=g;ctx.fillRect(0,Y,W,H-Y);ctx.strokeStyle='#3b4a8f';ctx.lineWidth=2;ctx.strokeRect(2,Y+2,W-4,H-Y-4);
  consoleKeys(ctx);const G0=Y+48;
  const L=[['FS',P.shF/100,'#3cff6a',1,'Front shield',()=>`Protects you from hits ahead. ${Math.round(P.shF)}%. Recharges from your energy.`],['AS',P.shA/100,'#3cff6a',1,'Aft (rear) shield',()=>`Protects you from behind. ${Math.round(P.shA)}%.`],
   ['FU',C.fuel/7,'#ffe45e',1,'Fuel',()=>`${C.fuel.toFixed(1)} light years of hyperspace fuel (7 max). Refuel at a station or scoop it from a star.`],['CT',(P.cabin-20)/235,'#ff8a1c',0,'Cabin temperature',()=>`Rises near stars. Too hot and you lose energy! ${Math.round(P.cabin)}°.`],
   ['LT',P.heat,'#ff8a1c',0,'Laser temperature',()=>`Firing heats the laser; full = overheated, wait for it to cool. ${Math.round(P.heat*100)}%.`],['AL',planet?Math.min(1,(P.alt||0)/(planet.R*3)):0,'#3fe0ff',0,'Altitude',()=>planet?`Height above the planet: ${Math.round(P.alt||0)} units. Zero means crash!`:'No planet here.']];
  L.forEach(([l,v,c,w,tt,tb],i)=>bar(ctx,10,G0+i*23,l,v,c,w,tt,tb));
  const R2=[['SP',P.speed/(jump?7000:P.max),'#3fe0ff','Speed',()=>`${Math.round(P.speed)} units/s. Change it with ${keyName('fast')} and ${keyName('slow')}, the mouse wheel or the slider.`],['RL',.5+P.roll/3.2,'#c8d0ff','Roll',()=>`Middle = level. Roll with ${keyName('rollL')} / ${keyName('rollR')}.`],['DC',.5+P.pitch/2.2,'#c8d0ff','Dive / climb',()=>`Middle = straight. Nose up/down with ${keyName('up')} / ${keyName('down')}.`]];
  R2.forEach(([l,v,c,tt,tb],i)=>bar(ctx,W-190,G0+i*23,l,v,c,0,tt,tb));
  for(let i=0;i<4;i++){const v=Math.max(0,Math.min(1,(P.energy-i*25)/25));text(ctx,'E'+(i+1),W-190,G0+72+i*19-1,'#9aa3c7',12);ctx.fillStyle='#0d1126';ctx.fillRect(W-164,G0+72+i*19,150,9);ctx.fillStyle=P.energy<25?'#ff2d55':'#3cff6a';ctx.fillRect(W-164,G0+72+i*19,150*v,9);}
  tipAt(W-190,G0+70,180,76,'Energy banks',()=>`${Math.round(P.energy)}% energy. Shields and lasers use it. If it runs out, your ship is destroyed!`);
  // the 3D elliptical scanner
  const sx=400,sy=Y+122,rx=150,ry=56,range=10000;ctx.strokeStyle='#ff2d55';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(sx,sy,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.4;ctx.beginPath();ctx.ellipse(sx,sy,rx*.5,ry*.5,0,0,Math.PI*2);ctx.moveTo(sx-rx,sy);ctx.lineTo(sx+rx,sy);ctx.moveTo(sx,sy-ry);ctx.lineTo(sx,sy+ry);ctx.moveTo(sx,sy);ctx.lineTo(sx-rx*.7,sy-ry*.7);ctx.moveTo(sx,sy);ctx.lineTo(sx+rx*.7,sy-ry*.7);ctx.stroke();ctx.globalAlpha=1;
  const blip=(pos,col,big)=>{const l=toLocal(P.o,sub(pos,P.pos));if(len(l)>range)return false;const x=sx+l[0]/range*rx,y=sy-l[2]/range*ry,h=l[1]/range*ry*1.4;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke();ctx.fillRect(x-(big?5:3),y-h-(big?3:2),big?10:6,big?5:3);return true;};
  if(station&&!blip(station.pos,'#ffffff',true)){const l=toLocal(P.o,sub(station.pos,P.pos)),a=Math.atan2(l[2],l[0]),x=sx+Math.cos(a)*rx,y=sy-Math.sin(a)*ry;if(Math.floor(clock*2)%2){ctx.fillStyle='#ffffff';ctx.fillRect(x-6,y-6,12,12);}text(ctx,'S',x,y-6,'#10142b',11,'center');}
  for(const s of ships)if(!s.dead)blip(s.pos,s.type==='missile'?'#ff8a1c':s.angry?'#ff2d55':s.T.color);
  tipAt(sx-rx,sy-ry,rx*2,ry*2,'3D scanner',()=>`Everything within ${range/1000}k units. Top of the oval = ahead. Sticks show above/below you. White = station (a flashing square on the rim when it's further away), red = enemies, orange = missiles.`);
  // compass, condition light, indicators
  const cx=W-232,cy=Y+68;ctx.strokeStyle='#5d6aa3';ctx.beginPath();ctx.arc(cx,cy,17,0,Math.PI*2);ctx.stroke();const tgt=station&&len(sub(station.pos,P.pos))<SAFE*1.6?station.pos:planet?planet.pos:null;
  if(tgt){const l=norm(toLocal(P.o,sub(tgt,P.pos)));ctx.fillStyle=l[2]>0?'#3cff6a':'#ff2d55';ctx.beginPath();ctx.arc(cx+l[0]*14,cy-l[1]*14,4,0,Math.PI*2);ctx.fill();}
  tipAt(cx-20,cy-20,40,40,'Compass',()=>`Points to the ${station&&len(sub(station.pos,P.pos))<SAFE*1.6?'station':'planet'}. Green dot = in front, red = behind you. Steer until the dot is in the middle.`);
  const red=ships.some(s=>!s.dead&&s.angry&&len(sub(s.pos,P.pos))<range),cond=red?'#ff2d55':ships.some(s=>!s.dead&&['pirate','alien'].includes(s.T.role))?'#ffe45e':'#3cff6a';
  ctx.fillStyle=cond;ctx.beginPath();ctx.arc(cx,Y+104,7,0,Math.PI*2);ctx.fill();tipAt(cx-10,Y+96,20,18,'Condition',()=>cond==='#ff2d55'?'RED: you are under attack!':cond==='#ffe45e'?'YELLOW: pirates or aliens nearby.':'GREEN: all clear.');
  const inSafe=station&&len(sub(station.pos,P.pos))<SAFE;text(ctx,inSafe?'S':'',cx-14,Y+116,'#3fe0ff',16);text(ctx,jump?'J':massLock?'M':'',cx+4,Y+116,jump?'#3cff6a':'#ff8a1c',16);
  tipAt(cx-18,Y+114,40,20,'Safe zone / mass lock',()=>`${inSafe?'S = inside the station safe zone (police nearby). ':''}${jump?'J = jump drive running.':massLock?'M = mass-locked: the jump drive cannot start here.':'Free to use the jump drive.'}`);
  for(let i=0;i<4;i++){ctx.fillStyle=i<C.missiles?'#3cff6a':'#1a1f3a';ctx.fillRect(40+i*16,H-14,12,7);}text(ctx,'MSL',10,H-16,'#9aa3c7',11);tipAt(8,H-18,110,14,'Missiles',()=>`${C.missiles} of 4 missiles loaded.`);
  text(ctx,`${here().name.toUpperCase()} · ${legalName(C.legal).toUpperCase()}`,400,H-17,C.legal?'#ff8a1c':'#9aa3c7',12,'center');tipAt(300,H-18,200,14,'System and legal status',()=>`You are in ${here().name}. Legal status: ${legalName(C.legal)}${C.legal?' — police may attack you.':'.'}`);
  if(ecmT>0)text(ctx,'E',cx+18,Y+60,'#3fe0ff',16);}
 function touchControls(ctx){if(!touchSeen)return;ctx.globalAlpha=.85;ctx.fillStyle=fireTouch?'rgba(255,45,85,.85)':'rgba(255,45,85,.35)';ctx.beginPath();ctx.arc(W-95,VH-90,52,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff2d55';ctx.lineWidth=3;ctx.stroke();text(ctx,'FIRE',W-95,VH-99,'#fff',18,'center');
  ctx.fillStyle='rgba(30,38,80,.7)';ctx.fillRect(W-30,50,22,200);ctx.strokeStyle='#3fe0ff';ctx.strokeRect(W-30,50,22,200);ctx.fillStyle='#3fe0ff';ctx.fillRect(W-34,250-P.throttle*200-8,30,16);text(ctx,'SPEED',W-19,254,'#9aa3c7',10,'center');
  if(stick){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(stick.x0,stick.y0,60,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(63,224,255,.6)';ctx.beginPath();ctx.arc(stick.x0+pad.x*60,stick.y0+pad.y*60,26,0,Math.PI*2);ctx.fill();}
  else{ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(130,VH-100,58,0,Math.PI*2);ctx.stroke();text(ctx,'DRAG TO STEER',130,VH-106,'rgba(255,255,255,.4)',12,'center');}ctx.globalAlpha=1;}
 function drawTip(ctx){let t=null,x=0,y=0;if(C.opt.tips&&hover&&!touchSeen){t=tips.find(r=>hover.x>=r.x&&hover.x<=r.x+r.w&&hover.y>=r.y&&hover.y<=r.y+r.h);x=hover.x;y=hover.y;}
  if(!t&&tip&&tip.until>clock){t={title:tip.title,body:()=>tip.body};x=CX;y=VH-10;}if(!t)return;
  const body=typeof t.body==='function'?t.body():t.body,w=300;ctx.font='13px "Courier New",monospace';const words=body.split(' '),lines=[];let line='';for(const wd of words){const s=line?line+' '+wd:wd;if(ctx.measureText(s).width>w-20&&line){lines.push(line);line=wd;}else line=s;}lines.push(line);
  const h=30+lines.length*16;let bx=Math.min(W-w-6,Math.max(6,x-w/2)),by=y-h-14;if(by<4)by=y+18;ctx.fillStyle='rgba(8,11,28,.96)';ctx.strokeStyle='#ffe45e';ctx.lineWidth=1.5;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(bx,by,w,h,8);else ctx.rect(bx,by,w,h);ctx.fill();ctx.stroke();
  text(ctx,t.title,bx+10,by+7,'#ffe45e',14);lines.forEach((l,i)=>text(ctx,l,bx+10,by+26+i*16,'#e6e9f2',13,'left',false));}
 function cycleTime(){if(timeScale===1&&ships.some(x=>!x.dead&&(x.angry||x.type==='missile')&&len(sub(x.pos,P.pos))<12000)){msg('NOT SAFE TO SPEED UP TIME',2,'#ff2d55');return;}timeScale=timeScale>=8?1:timeScale*2;msg(timeScale>1?`TIME ×${timeScale}`:'NORMAL TIME',1.5,'#3cff6a');}
 function nextView(){const v=['front','rear','left','right'];view=v[(v.indexOf(view)+1)%4];if(camMode==='ext')camMode='cockpit';}
 function toggleJump(){if(!planet&&!interdicted){return;}if(jump){jump=false;return;}if(massLock){msg('MASS LOCKED — TOO CLOSE TO SOMETHING',2,'#ff8a1c');return;}jump=true;dockComp=false;msg('JUMP DRIVE ENGAGED',1.5,'#3cff6a');}
 function toggleDock(){if(!has('dock')){msg('NO DOCKING COMPUTER — BUY ONE IN THE SHIPYARD',2.5);return;}if(!station){msg('NO STATION HERE',2);return;}if(dockComp){dockComp=false;stopMusic();msg('DOCKING COMPUTER OFF',1.5);return;}
  if(len(sub(station.pos,P.pos))>SAFE*1.6){msg('GET CLOSER TO THE STATION FIRST',2.5);return;}dockComp=true;apFinal=false;jump=false;playMusic();}
 // ---------------- the station hangar (for the cut scenes) ----------------
 const HG={x:700,yF:-260,yC:340,z1:3400},PADS_=[[-380,1400],[380,1400],[0,2200],[-380,2700],[380,2700]];
 function drawHangar(ctx){ctx.lineWidth=1;ctx.strokeStyle='#2c3a78';ctx.beginPath();for(let x=-HG.x;x<=HG.x;x+=175)seg(ctx,cam(V(x,HG.yF,0)),cam(V(x,HG.yF,HG.z1)));for(let z=0;z<=HG.z1;z+=340)seg(ctx,cam(V(-HG.x,HG.yF,z)),cam(V(HG.x,HG.yF,z)));ctx.stroke();
  ctx.strokeStyle='#5d6aa3';ctx.lineWidth=1.4;ctx.beginPath();for(const x of[-HG.x,HG.x]){seg(ctx,cam(V(x,HG.yF,0)),cam(V(x,HG.yF,HG.z1)));seg(ctx,cam(V(x,HG.yC,0)),cam(V(x,HG.yC,HG.z1)));for(let z=0;z<=HG.z1;z+=680)seg(ctx,cam(V(x,HG.yF,z)),cam(V(x,HG.yC,z)));}
  for(let z=0;z<=HG.z1;z+=680)seg(ctx,cam(V(-HG.x,HG.yC,z)),cam(V(HG.x,HG.yC,z)));ctx.stroke();
  ctx.strokeStyle='#ffe45e';ctx.beginPath();for(let z=300;z<HG.z1;z+=680){const a=[V(-120,HG.yC-2,z),V(120,HG.yC-2,z),V(120,HG.yC-2,z+120),V(-120,HG.yC-2,z+120)].map(cam);for(let i=0;i<4;i++)seg(ctx,a[i],a[(i+1)%4]);}ctx.stroke();
  ctx.strokeStyle='#3fe0ff';ctx.lineWidth=2;ctx.beginPath();const sl=[V(-240,-90,0),V(240,-90,0),V(240,90,0),V(-240,90,0)].map(cam);for(let i=0;i<4;i++)seg(ctx,sl[i],sl[(i+1)%4]);ctx.stroke();
  ctx.strokeStyle='#ff8a1c';ctx.lineWidth=1.2;ctx.beginPath();for(const[x,z]of PADS_){const a=[V(x-150,HG.yF+1,z-150),V(x+150,HG.yF+1,z-150),V(x+150,HG.yF+1,z+150),V(x-150,HG.yF+1,z+150)].map(cam);for(let i=0;i<4;i++)seg(ctx,a[i],a[(i+1)%4]);let prev=null;for(let k=0;k<=20;k++){const t=k/20*Math.PI*2,c=cam(V(x+Math.cos(t)*90,HG.yF+1,z+Math.sin(t)*90));if(prev)seg(ctx,prev,c);prev=c;}}ctx.stroke();}
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
 function frame(ctx,title){btns.push({x:W-118,y:8,w:106,h:26,fn:()=>openMenu()});ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#3b4a8f';ctx.lineWidth=2;ctx.strokeRect(4,4,W-8,H-8);text(ctx,title,CX,14,'#3fe0ff',20,'center');ctx.strokeStyle='#3b4a8f';ctx.beginPath();ctx.moveTo(10,42);ctx.lineTo(W-10,42);ctx.stroke();button(ctx,{x:W-118,y:8,w:106,h:26,label:'⏸ MENU',fs:12});}
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
   L.forEach(([a,b],i)=>{text(ctx,a,30,60+i*28,'#3cff6a',17);text(ctx,b,230,60+i*28,'#fff',17);});text(ctx,`(${t.species})`,30,262,'#ffe45e',16);text(ctx,'🪐 '+SL.features(t).text,30,450,'#3fe0ff',14);wrap(ctx,t.desc,30,292,740,22,'#e6e9f2',16);
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
 // ---------------- quick tunnels (used when cut scenes are switched off) ----------------
 function tunnel(ctx,t,rings,col){ctx.fillStyle='#000';ctx.fillRect(0,0,W,VH);ctx.strokeStyle=col;ctx.lineWidth=2;for(let i=0;i<rings;i++){const k=((i/rings+t)%1),s=Math.pow(k,2.2);ctx.strokeRect(CX-s*560,CY-s*300,s*1120,s*600);}}
 // ---------------- cut scenes: docking and launching ----------------
 const DOCK_OUT=2.4,DOCK_IN=3.6,LAUNCH_IN=3.0,LAUNCH_OUT=3.4,PARK=['hauler','kestrel','warden','hauler','kestrel'],bgStars=Array.from({length:140},()=>[Math.random()*W,Math.random()*H,Math.random()]);
 const easeOut=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3),easeIn=t=>Math.pow(Math.max(0,Math.min(1,t)),2);
 function makeScene(kind){const parked=[];PADS_.forEach(([x,z],i)=>{if(i===2||Math.random()<.25)return;const k=PARK[(i+Math.floor(Math.random()*5))%5];parked.push({m:MODELS[k],pos:V(x,HG.yF+34,z),o:{r:V(-1,0,0),u:V(0,1,0),f:V(0,0,-1)},col:SHIPS[k].color});});
  return{kind,t:0,parked,traffic:[{m:MODELS.hauler,off:Math.random()*6,col:SHIPS.hauler.color},{m:MODELS.warden,off:Math.random()*6,col:SHIPS.warden.color}],clank:false};}
 function lookAt(pos,target,up){CAM.pos=pos;CAM.f=norm(sub(target,pos));CAM.u=up||V(0,1,0);ortho(CAM);}
 function glow(ctx,pos,back,k){const e=cam(add(pos,back));if(e[2]>5){const p=proj(e),r=Math.max(2,FOC*14/e[2])*(.6+k);ctx.fillStyle='rgba(63,224,255,.7)';ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fill();}}
 function renderScene(ctx){const sc=scene,t=sc.t,s=station,me=MODELS.kestrel;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  const outside=(sc.kind==='dock'&&t<DOCK_OUT)||(sc.kind==='launch'&&t>=LAUNCH_IN);
  if(outside){const k=sc.kind==='dock'?t/DOCK_OUT:(t-LAUNCH_IN)/LAUNCH_OUT;for(const[x,y,b]of bgStars){ctx.fillStyle=`rgba(255,255,255,${.3+b*.7})`;ctx.fillRect(x,y,b>.8?2:1,b>.8?2:1);}
   let shipPos,shipO;if(sc.kind==='dock'){shipPos=add(s.pos,mul(s.o.f,330+1250*(1-easeOut(k))));shipO={f:mul(s.o.f,-1),u:s.o.u.slice(),r:mul(s.o.r,-1)};}else{shipPos=add(s.pos,mul(s.o.f,300+1800*easeIn(k)));shipO={f:s.o.f.slice(),u:s.o.u.slice(),r:s.o.r.slice()};}
   lookAt(add(add(add(s.pos,mul(s.o.f,1550)),mul(s.o.r,700)),mul(s.o.u,280)),add(s.pos,mul(s.o.f,sc.kind==='dock'?420:350+700*easeIn(k))),s.o.u);
   for(const sn of suns)drawSun(ctx,sn);for(const mn of moons)drawMoon(ctx,mn);if(planet)drawPlanet(ctx);
   sc.traffic.forEach((tr,i)=>{const a=tr.off+t*.22*(i?-1:1),pos=add(add(s.pos,mul(s.o.f,900+i*500)),add(mul(s.o.r,Math.cos(a)*1100),mul(s.o.u,Math.sin(a)*600)));const o={f:norm(add(mul(s.o.r,-Math.sin(a)),mul(s.o.u,Math.cos(a)))),u:s.o.f.slice(),r:V(1,0,0)};ortho(o);drawModel(ctx,tr.m,pos,o,tr.col);});
   const items=[{z:cam(s.pos)[2],d:()=>drawStation(ctx)},{z:cam(shipPos)[2],d:()=>{drawModel(ctx,me,shipPos,shipO,'#ffe45e');glow(ctx,shipPos,mul(shipO.f,-96),sc.kind==='launch'?1:.3);}}].sort((a,b)=>b.z-a.z);items.forEach(i=>i.d());}
  else{let shipPos,o;if(sc.kind==='dock'){const k=t-DOCK_OUT,kz=easeOut(k/2.4),ky=easeOut((k-2.4)/.9);shipPos=V(0,-80+(HG.yF+34+80)*ky,-300+2500*kz);o={r:V(1,0,0),u:V(0,1,0),f:V(0,0,1)};lookAt(V(560,150,3150),V(0,-110,1300));
    if(k>3.25&&!sc.clank){sc.clank=true;env.beep(140,.25,'square',.06,.6);env.noise(.2,.05,900);}}
   else{const ky=easeOut(t/.9),kz=easeIn((t-.9)/2.1);shipPos=V(0,HG.yF+34+(-80-HG.yF-34)*ky,2200-2900*kz);o={r:V(-1,0,0),u:V(0,1,0),f:V(0,0,-1)};lookAt(add(shipPos,V(260,160,780)),add(shipPos,V(0,-30,-520)));}
   drawHangar(ctx);for(const p of sc.parked)drawModel(ctx,p.m,p.pos,p.o,p.col);drawModel(ctx,me,shipPos,o,'#ffe45e');glow(ctx,shipPos,mul(o.f,-96),sc.kind==='launch'&&t>.9?1:.2);}
  text(ctx,sc.kind==='dock'?`DOCKING AT ${here().name.toUpperCase()} STATION`:`LAUNCHING FROM ${here().name.toUpperCase()} STATION`,CX,18,'#3fe0ff',20,'center');
  text(ctx,'Tap or press any key to skip',CX,H-28,'rgba(255,255,255,.55)',13,'center');}
 function endLaunchScene(){const s=station;scene=null;P.pos=add(s.pos,mul(s.o.f,2100));P.o={f:s.o.f.slice(),u:s.o.u.slice(),r:s.o.r.slice()};P.speed=170;P.throttle=.45;initDust();mode='flight';msg(`LEAVING ${here().name.toUpperCase()} STATION`,3,'#3fe0ff');}
 function endDockScene(){scene=null;mode='docked';tab='status';env.engine&&env.engine.stop&&env.engine.stop();}
 function skipScene(){if(mode==='dockScene')endDockScene();else if(mode==='launchScene')endLaunchScene();}
 // ---------------- saving (docked or in flight) ----------------
 function saveGame(){if(mode==='flight'&&planet&&!interdicted){C.flight={sys:C.sys,pos:P.pos.slice(),o:{r:P.o.r.slice(),u:P.o.u.slice(),f:P.o.f.slice()},speed:P.speed,throttle:P.throttle,shF:P.shF,shA:P.shA,energy:P.energy};persist();saveNote=`✅ Saved in flight near ${here().name} — day ${C.day}, ${Math.floor(C.credits)} Cr.`;msg('GAME SAVED',2,'#3cff6a');return true;}
  if(mode==='docked'){C.flight=null;persist();saveNote=`✅ Saved, docked at ${here().name} — day ${C.day}, ${Math.floor(C.credits)} Cr.`;msg('GAME SAVED',2,'#3cff6a');return true;}
  saveNote='Can’t save just now (hyperspace or an alien ambush) — try again in a moment.';return false;}
 function restoreFlight(){const f=C.flight;newPlayer();buildSystem(false);Object.assign(P,{pos:f.pos,o:f.o,speed:f.speed,throttle:f.throttle,shF:f.shF,shA:f.shA,energy:Math.max(20,f.energy)});initDust();mode='flight';missionSpawns();msg('RESUMING YOUR SAVED FLIGHT',3,'#3cff6a');}
 // ---------------- pause menu: resume, save, settings, controls, help ----------------
 function openMenu(){overlay='menu';menuTab='main';remap=null;saveNote='';}
 const HELP=[['DOCKING','Every station spins. Its docking slot is the glowing rectangle on the side facing the planet.\n1. Fly to the front of the station (the compass points at it when you are close; the scanner shows it as a white square).\n2. Slow right down and point straight at the slot.\n3. Roll so the slot looks flat (level) — keep rolling gently to match its spin.\n4. Fly in slowly. Wrong angle, wrong spin or too fast = a crash!\nEasy way: buy a DOCKING COMPUTER (tech level 9+) and press DOCK near the station.'],
  ['TRADING','Buy goods where they are cheap and sell where they are dear.\n• Farming worlds (Agricultural) sell food, spices and plants cheaply and pay well for machines and computers.\n• Factory worlds (Industrial) are the opposite.\n• Look at the DATA screen to see a system’s economy before you go.\n• Illegal goods (⚠) pay well but customs may catch you — then the police come after you.\n• A bigger cargo bay means bigger profits.'],
  ['COMBAT','Put the enemy in your sights and fire. Lasers get hot — let them cool.\n• Shields (FS front, AS rear) protect you and recharge from your energy banks.\n• Missiles home in on the ship in your sights. E.C.M. destroys missiles fired at you.\n• Destroying pirates earns a bounty. Attacking traders or police makes you an Offender — police will attack you!\n• Lawless systems (Anarchy, Warlord) have the most pirates.'],
  ['TRAVEL','• JUMP drive: zooms across a system. It won’t work near ships, stations or planets (mass lock).\n• TIME button: speeds up long trips (it stops if danger appears).\n• HYPERSPACE: choose a destination on the MAP, then press HYPER. It uses fuel (light years).\n• Refuel at stations, or buy fuel scoops and fly near a star (watch the cabin temperature!).\n• Watch out for moons, rings and multiple stars — some systems are very different!'],
  ['MISSIONS','Stations have a bulletin board (MISSIONS tab):\n• Courier — deliver a package by a deadline.\n• Supply run — bring goods back to that station.\n• Wanted — hunt a named pirate, then collect the reward.\n• Freedom / Expansion — help change how a planet is ruled. Deliver the goods, defeat the patrols, and the planet’s government changes for good (see Galactic News)!\nPress MISN in the cockpit to see your missions at any time.']];
 function panel(ctx,title){btns=[];tips=[];ctx.fillStyle='#03050f';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#3fe0ff';ctx.lineWidth=2;ctx.strokeRect(8,8,W-16,H-16);text(ctx,title,CX,18,'#3fe0ff',20,'center');}
 function renderMenu(ctx){panel(ctx,'PAUSED');const tabsM=[['main','GAME'],['controls','CONTROLS'],['help','HOW TO PLAY']];tabsM.forEach(([k,l],i)=>button(ctx,B(30+i*170,50,160,32,l,()=>{menuTab=k;remap=null;},{fs:13}),menuTab===k));button(ctx,B(W-190,50,160,32,'▶ RESUME',()=>{overlay=null;},{fs:13,bg:'rgba(30,80,50,.9)'}));
  if(menuTab==='main'){button(ctx,B(CX-150,104,300,46,'▶ RESUME',()=>{overlay=null;},{fs:18,bg:'rgba(30,80,50,.9)'}));button(ctx,B(CX-150,160,300,46,'💾 SAVE GAME',()=>saveGame(),{fs:18}));if(saveNote)text(ctx,saveNote,CX,214,'#3cff6a',14,'center');
   const tg=[['Hover help',C.opt.tips,()=>{C.opt.tips=!C.opt.tips;persist();},'Shows what controls and gauges do when you hover (or tap)'],['Cut scenes',C.opt.cuts,()=>{C.opt.cuts=!C.opt.cuts;persist();},'Watch your ship dock and launch'],['Invert pitch',C.invert,()=>{C.invert=!C.invert;persist();},'Up/down reversed, like a flight simulator']];
   tg.forEach(([l,on,fn,d],i)=>{const y=246+i*52;text(ctx,l,150,y+6,'#e6e9f2',17);text(ctx,d,150,y+28,'#9aa3c7',12,'left',false);button(ctx,B(600,y,120,34,on?'ON':'OFF',fn,{bg:on?'rgba(30,80,50,.9)':'rgba(60,30,40,.9)'}));});
   text(ctx,`${here().name} · Day ${C.day} · ${Math.floor(C.credits)} Cr · ${rankOf(C.killPts)} · ${legalName(C.legal)}`,CX,412,'#9aa3c7',14,'center');
   text(ctx,'Press P (or Esc) to pause and resume at any time.',CX,436,'#9aa3c7',13,'center');}
  else if(menuTab==='controls'){text(ctx,'Click a key to change it, then press the new key.',CX,94,'#9aa3c7',13,'center');
   ACTIONS.forEach(([id,l],i)=>{const col=i<10?0:1,row=i%10,x=40+col*370,y=116+row*34;text(ctx,l,x,y+7,'#e6e9f2',14);button(ctx,B(x+180,y,170,28,remap===id?'press a key…':keyName(id),()=>{remap=id;},{fs:12,bg:remap===id?'rgba(255,228,94,.9)':undefined,fg:remap===id?'#10142b':undefined}));});
   button(ctx,B(40,462,200,32,'RESET ALL KEYS',()=>{C.opt.keys=optDefaults().keys;persist();},{fs:12,border:'#ff2d55'}));
   wrap(ctx,'Also: keys 1–4 pick front/rear/left/right views, P pauses. Mouse wheel = speed. Touch: drag on the left to steer, FIRE button, speed slider. Gamepad: left stick steers, triggers change speed, A fire, B missile, X E.C.M., Y jump, LB dock, RB hyperspace, Start = map.',260,462,510,16,'#9aa3c7',12);}
  else{HELP.forEach(([l],i)=>button(ctx,B(30+i*150,96,140,30,l,()=>{helpTab=i;},{fs:12}),helpTab===i));const[hd,body]=HELP[helpTab];text(ctx,hd,40,142,'#ffe45e',18);let y=172;for(const para of body.split('\n'))y=wrap(ctx,para,40,y,720,20,'#e6e9f2',15)+4;}}
 function renderCargo(ctx){panel(ctx,'CARGO HOLD');const mk=C.market&&C.market.sys===C.sys?C.market.p:null;let y=60;text(ctx,'GOODS',40,y,'#b45bd6',15);text(ctx,'AMOUNT',380,y,'#b45bd6',15);text(ctx,mk?'PRICE HERE':'',540,y,'#b45bd6',15);y+=26;
  const items=Object.entries(C.cargo).filter(([k,n])=>n>0);if(!items.length){text(ctx,'Empty — buy goods at a station market.',40,y,'#9aa3c7',15);y+=26;}
  items.forEach(([k,n])=>{const g=GOODS[k];text(ctx,g[0]+(g[6]?' ⚠':''),40,y,g[6]?'#ff8a1c':'#e6e9f2',15);text(ctx,`${n}${g[1]}`,380,y,'#e6e9f2',15);if(mk)text(ctx,mk[k].price.toFixed(1),540,y,'#e6e9f2',15);y+=24;});
  y+=10;text(ctx,`Hold: ${cargoT()}/${C.cap}t   Fuel: ${C.fuel.toFixed(1)} LY   Missiles: ${C.missiles}/4   Credits: ${C.credits.toFixed(1)} Cr`,40,y,'#ffe45e',15);y+=34;
  text(ctx,'EQUIPMENT',40,y,'#b45bd6',15);y+=24;const eq=[`Front ${C.front} laser`,...(C.rear?['Rear pulse laser']:[]),...EQUIP.filter(e=>C.equip[e.id]).map(e=>e.name.split(' (')[0])];wrap(ctx,eq.join(' · '),40,y,720,20,'#c8d0ff',15);
  button(ctx,B(CX-100,H-70,200,40,'✕ CLOSE',()=>{overlay=null;}));}
 function renderMissionsOv(ctx){panel(ctx,'YOUR MISSIONS');let y=64;if(!C.missions.length)text(ctx,'No missions yet — stations have a bulletin board (MISSIONS tab).',40,y,'#9aa3c7',15);
  C.missions.forEach(m=>{text(ctx,m.title,40,y,'#e6e9f2',16);y=wrap(ctx,missionStatus(m),40,y+22,720,18,'#9aa3c7',14)+12;});
  if(C.news.length){text(ctx,'GALACTIC NEWS',40,Math.max(y+10,330),'#3fe0ff',15);C.news.slice(0,4).forEach((n,i)=>text(ctx,`Day ${n.day}: ${n.t}`.slice(0,92),40,Math.max(y+10,330)+24+i*18,'#9aa3c7',12,'left',false));}
  button(ctx,B(CX-100,H-70,200,40,'✕ CLOSE',()=>{overlay=null;}));}
 // ---------------- main update / render ----------------
 const held=id=>(C.opt.keys[id]||[]).some(k=>K[k]||(k.length===1&&K[k.toUpperCase()]));
 function controls(){const inv=C.invert?-1:1;let roll=(held('rollR')?1:0)-(held('rollL')?1:0),pitch=((held('up')?1:0)-(held('down')?1:0))*inv,thr=(held('fast')||K.PageUp?1:0)-(held('slow')||K.PageDown?1:0),fire=held('fire')||fireTouch;
  if(stick){roll+=pad.x*1.2;pitch+=-pad.y*1.2*inv;}
  if(gp){const a=gp.axes||[],b=i=>gp.buttons[i]&&gp.buttons[i].pressed;if(Math.abs(a[0]||0)>.15)roll+=a[0];if(Math.abs(a[1]||0)>.15)pitch+=-(a[1])*inv;if(b(7))thr+=1;if(b(6))thr-=1;if(b(0))fire=true;}
  return{roll:Math.max(-1,Math.min(1,roll)),pitch:Math.max(-1,Math.min(1,pitch)),thr,fire};}
 let gpPrev=[];
 function pollPad(){gp=null;try{const pads=navigator.getGamepads?navigator.getGamepads():[];gp=[...pads].find(p=>p&&p.connected)||null;}catch(e){}if(!gp)return;const press=i=>gp.buttons[i]&&gp.buttons[i].pressed&&!gpPrev[i];
  if(mode==='flight'&&!overlay){if(press(1))fireMissile();if(press(2))ecm();if(press(3))toggleJump();if(press(4))toggleDock();if(press(5))startHyper();if(press(8))nextView();}if(press(9)){if(overlay)overlay=null;else if(mode==='flight'){overlay='chart';chartMode='galaxy';}}gpPrev=gp.buttons.map(b=>b.pressed);}
 const hypV=t=>t<1?.05+t*.9:.95+(t-1)*1.2;
 G.update=(dt)=>{clock+=dt;FX.update(dt);msgs.forEach(m=>m.d-=dt);msgs=msgs.filter(m=>m.d>0);if(lastHit>0)lastHit-=dt*2;if(laserShow>0)laserShow-=dt;pollPad();
  for(const b of booms)b.t+=dt;booms=booms.filter(b=>b.t<(b.spark?.8:2.4));
  if(overlay==='menu')return;
  if(mode==='dockScene'||mode==='launchScene'){scene.t+=dt;if(station){station.o.r=rot(station.o.r,station.o.f,station.spin*dt);station.o.u=rot(station.o.u,station.o.f,station.spin*dt);ortho(station.o);}
   if(mode==='dockScene'&&scene.t>DOCK_OUT+DOCK_IN)endDockScene();else if(mode==='launchScene'&&scene.t>LAUNCH_IN+LAUNCH_OUT)endLaunchScene();return;}
  if(mode==='launch'){anim+=dt;if(anim>1.6){mode='flight';msg(`LEAVING ${here().name.toUpperCase()} STATION`,3,'#3fe0ff');}return;}
  if(mode==='dockAnim'){anim+=dt;if(anim>1.6){mode='docked';tab='status';env.engine&&env.engine.stop&&env.engine.stop();}return;}
  if(mode==='hyper'){anim+=dt;hypMove(hypV(anim),dt);if(anim>3.6){arrive();exitT=1.6;}return;}
  if(mode==='dead'){deathT+=dt;if(deathT>2.8)G.over=true;return;}
  if(exitT>0){exitT=Math.max(0,exitT-dt);const k=exitT/1.6;hypMove(1.6*k*k,dt);}
  if(hyperT>0&&hyperT<1.6)hypMove((1.6-hyperT)*.18,dt);
  if(mode==='flight'&&!overlay){for(let i=0;i<timeScale&&mode==='flight';i++)flight(dt);}};
 G.render=ctx=>{btns=[];tips=[];
  if(mode==='docked'){renderDocked(ctx);if(overlay==='menu')renderMenu(ctx);drawTip(ctx);return;}
  if(mode==='dockScene'||mode==='launchScene'){renderScene(ctx);if(overlay==='menu')renderMenu(ctx);return;}
  if(mode==='launch'||mode==='dockAnim'){tunnel(ctx,anim*(mode==='launch'?1:-1)+5,6,'#3fe0ff');dashboard(ctx);btns=[];text(ctx,mode==='launch'?'LAUNCHING…':'DOCKING…',CX,VH-40,'#3fe0ff',18,'center');return;}
  if(mode==='hyper'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,VH);const g=ctx.createRadialGradient(CX,CY,4,CX,CY,220);g.addColorStop(0,`rgba(160,200,255,${Math.min(.5,anim*.15)})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,VH);drawStreaks(ctx,hypV(anim),1);
   if(anim>3.3){ctx.fillStyle=`rgba(255,255,255,${(anim-3.3)*3.3})`;ctx.fillRect(0,0,W,VH);}dashboard(ctx);btns=[];text(ctx,'HYPERSPACE',CX,VH-34,'#c8d0ff',16,'center');if(overlay==='menu')renderMenu(ctx);return;}
  if(overlay==='chart'||overlay==='data')renderOverlay(ctx);else renderFlight(ctx);
  if(overlay==='cargo')renderCargo(ctx);else if(overlay==='missions')renderMissionsOv(ctx);else if(overlay==='menu')renderMenu(ctx);
  if(mode==='dead'){ctx.fillStyle=`rgba(0,0,0,${Math.min(.75,deathT/3)})`;ctx.fillRect(0,0,W,H);text(ctx,'GAME OVER',CX,VH/2-30,'#ff2d55',36,'center');text(ctx,'Your ship was destroyed. Next time you carry on from your last save.',CX,VH/2+20,'#e6e9f2',15,'center');}
  drawTip(ctx);};
 Object.defineProperty(G,'paused',{get:()=>overlay==='menu'});
 // ---------------- input from the arcade ----------------
 G.onPause=arg=>{if(remap){remap=null;return;}if(arg==='open'){openMenu();return;}if(overlay==='menu'||(arg==='esc'&&overlay)){overlay=null;return;}openMenu();};
 G.onKey=(type,key)=>{if(type==='up'){K[key]=false;if(key.length===1)K[key.toLowerCase()]=false;return;}K[key]=true;const k=key.length===1?key.toLowerCase():key;
  if(remap){if(k==='Escape'){remap=null;return;}for(const id in C.opt.keys)C.opt.keys[id]=C.opt.keys[id].filter(x=>x!==k);C.opt.keys[remap]=[k];remap=null;persist();return;}
  if(mode==='dockScene'||mode==='launchScene'){if(overlay!=='menu')skipScene();return;}
  if(overlay==='menu')return;
  if(overlay==='reset'){if(k==='Escape')overlay=null;return;}
  if(mode==='docked'){const n='1234567'.indexOf(k);if(n>=0){tab=TABS[n][0];sel=0;return;}
   if(tab==='market'){if(k==='ArrowUp')sel=(sel+GOODS.length-1)%GOODS.length;else if(k==='ArrowDown')sel=(sel+1)%GOODS.length;else if(k==='ArrowRight'||k==='+'||k==='=')buy(sel,1);else if(k==='ArrowLeft'||k==='-')sellG(sel,1);else if(k==='Enter')buy(sel,999);return;}
   if(tab==='shipyard'){if(k==='ArrowUp')selEq=(selEq+EQUIP.length-1)%EQUIP.length;else if(k==='ArrowDown')selEq=(selEq+1)%EQUIP.length;else if(k==='Enter'||k===' ')buyEq(EQUIP[selEq]);return;}
   if(tab==='missions'){const o=board();if(k==='ArrowUp')selMis=Math.max(0,selMis-1);else if(k==='ArrowDown')selMis=Math.min(o.length-1,selMis+1);else if(k==='Enter'&&o[selMis])accept(o[selMis]);return;}
   if(tab==='chart'&&k==='Tab'){chartMode=chartMode==='galaxy'?'local':'galaxy';return;}
   if(tab==='launch'&&(k==='Enter'||k===' '))launch();if(k==='l')launch();return;}
  if(mode!=='flight')return;
  const act=ACTIONS.find(a=>!a[3]&&(C.opt.keys[a[0]]||[]).includes(k));
  if(overlay){if(k==='Tab')chartMode=chartMode==='galaxy'?'local':'galaxy';else if(act&&['chart','cargo','missions'].includes(act[0]))overlay=null;return;}
  if('1234'.includes(k)&&k.length===1){view=['front','rear','left','right'][+k-1];camMode='cockpit';return;}
  if(!act)return;({missile:fireMissile,ecm,bomb,jump:toggleJump,dock:toggleDock,hyper:startHyper,time:cycleTime,view:nextView,cam:()=>{camMode=camMode==='ext'?'cockpit':'ext';},chart:()=>{overlay='chart';chartMode='galaxy';},cargo:()=>{overlay='cargo';},missions:()=>{overlay='missions';},pod:ejectPod})[act[0]]();};
 const ptrs={};
 G.onPointer=(type,x,y,id,kind)=>{if(kind==='touch'||kind==='pen')touchSeen=true;if(kind==='mouse'){hover={x,y};if(type==='move'&&!ptrs[id])return;}
  if(type==='down'&&G.intro&&G.tap){G.tap();return;}
  if(type==='down'&&(mode==='dockScene'||mode==='launchScene')&&overlay!=='menu'){skipScene();return;}
  if(type==='down'){for(let i=btns.length-1;i>=0;i--){const b=btns[i];if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){b.fn(x,y);ptrs[id]='btn';return;}}
   if(mode==='flight'&&!overlay){if(touchSeen&&Math.hypot(x-(W-95),y-(VH-90))<60){fireTouch=true;ptrs[id]='fire';return;}if(touchSeen&&x>W-50&&y>40&&y<260){ptrs[id]='thr';P.throttle=Math.max(0,Math.min(1,(250-y)/200));return;}
    if(y<VH){stick={x0:x,y0:y,id};pad={x:0,y:0};ptrs[id]='stick';return;}}return;}
  if(type==='move'){if(ptrs[id]==='stick'&&stick){pad={x:Math.max(-1,Math.min(1,(x-stick.x0)/60)),y:Math.max(-1,Math.min(1,(y-stick.y0)/60))};}else if(ptrs[id]==='thr'&&P){P.throttle=Math.max(0,Math.min(1,(250-y)/200));}return;}
  if(type==='up'){if(ptrs[id]==='stick'){stick=null;pad={x:0,y:0};}if(ptrs[id]==='fire')fireTouch=false;delete ptrs[id];}};
 G.onWheel=d=>{if(mode==='flight'&&P)P.throttle=Math.max(0,Math.min(1,P.throttle-d*.0015));};
 // time up or stopped: save where you are (in flight if possible), so nothing is lost
 G.onEnd=why=>{stopMusic();if(mode==='dead')return;if(mode==='hyper')arrive();if(mode==='launchScene')endLaunchScene();if(mode==='launch')mode='flight';
  if(mode==='dockScene'||mode==='dockAnim'){mode='docked';persist();return;}
  if(mode==='flight'){if(planet&&!interdicted)saveGame();else{finishDock();mode='docked';}return;}if(mode==='docked')persist();};
 G._dbg={get C(){return C;},get P(){return P;},get mode(){return mode;},get station(){return station;},get ships(){return ships;},get scene(){return scene;},get planet(){return planet;},get moons(){return moons;},get suns(){return suns;},get timeScale(){return timeScale;},get overlay(){return overlay;},get tips(){return tips;},
  set:(k,v)=>{({mode:()=>mode=v,tab:()=>tab=v,overlay:()=>overlay=v,view:()=>view=v,camMode:()=>camMode=v})[k]();},launch,startHyper,toggleDock,spawn,buy,buyEq,accept,board,arrive:()=>arrive(),flight,kill:sh=>kill(sh,true),dock:()=>docked(),saveGame,get tab(){return tab;}};
 if(C.flight&&C.flight.sys===C.sys&&GAL[C.sys])restoreFlight();
 if(env.store)persist();
 const legend=['sparrow','raven','hauler','warden'].map(k=>({name:SHIPS[k].name.toUpperCase(),pts:SHIPS[k].role.toUpperCase(),color:SHIPS[k].color,draw:(c,x,y,tt)=>{const m=MODELS[k],a=tt*1.2,o={r:[Math.cos(a),0,-Math.sin(a)],u:[0,1,0],f:[Math.sin(a),0,Math.cos(a)]};c.strokeStyle=SHIPS[k].color;c.lineWidth=1.2;c.beginPath();
   const pts=m.pts.map(p=>{const w=toWorld(o,p);const z=w[2]+320,s=70/z;return[x+w[0]*s*1.2,y-(w[1]*Math.cos(.4)-w[2]*Math.sin(.4))*s*1.2];});for(const e of m.edges){c.moveTo(...pts[e.a]);c.lineTo(...pts[e.b]);}c.stroke();}}));
 return Retro.intro(G,{title:'STARLANE TRADER',color:'#3fe0ff',sub:'TRADE - FIGHT - EXPLORE THE GALAXY',tableTitle:'SHIPS YOU WILL MEET',legend,stars:true,bg:'#000',hi:env.hi,hint:C.flight?'RESUMING YOUR SAVED FLIGHT - PRESS FIRE':C.day>1||C.credits!==100?`WELCOME BACK, COMMANDER - DAY ${C.day} - ${Math.floor(C.credits)} CR`:'A NEW COMMANDER WITH 100 CREDITS - PRESS FIRE'});}
GAME_LIST.push({id:'starlane',name:'Starlane Trader',icon:'🚀',desc:'Trade, fight and explore a whole galaxy. Your career is saved!',two:'none'});
Object.assign(PADS,{starlane:[]});
Object.assign(GAMES,{starlane:makeStarlane});
