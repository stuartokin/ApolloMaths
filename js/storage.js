'use strict';
// STORAGE: player profiles + progress kept (1) in this browser automatically and (2) in a progress file each player chooses.
// Each player (profile) has their own name, progress, player look, file and auto-save.
// After the first file save, Chrome/Edge on a computer (and the installed app) keep writing to the same file automatically (auto-save).
// Other browsers (Safari, iPad/iPhone, Firefox) save by downloading a file; the app then reminds the player when there is unsaved progress.
const Storage=(()=>{
 const OLD_KEY='apollo-maths-missions-v2',OLD_META='apollo-maths-file-meta',INDEX_KEY='apollo-maths-profiles',APP_ID='apollo-maths-missions',VERSION=4;
 const canPick=typeof window!=='undefined'&&typeof window.showSaveFilePicker==='function'&&window.isSecureContext!==false;
 const canOpenPick=typeof window!=='undefined'&&typeof window.showOpenFilePicker==='function'&&window.isSecureContext!==false;
 let handle=null,getData=()=>({}),onStatus=()=>{},timer=null,localOK=true,pid=null;
 let meta={state:'none',fileName:null,lastSaved:null,dirty:false};
 const kStats=id=>'apollo-maths-p:'+id,kMeta=id=>'apollo-maths-file-meta:'+id,kHandle=id=>'handle:'+id;
 const lsGet=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
 const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
 const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};

 // ---- names & profiles ----
 const cleanName=n=>String(n||'').replace(/\s+/g,' ').trim().slice(0,20);
 const validName=n=>/^[\p{L}\p{N}][\p{L}\p{N} '’.-]{0,19}$/u.test(cleanName(n));
 const newId=()=>'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
 function index(){let ix=lsGet(INDEX_KEY);
  if(!ix||!Array.isArray(ix.list)){ix={active:null,list:[]};
   const old=lsGet(OLD_KEY);   // first run after the update: move the existing progress into an "Apollo" profile
   if(old&&old.stats){const id='p1';ix.list.push({id,name:'Apollo',created:new Date().toISOString()});ix.active=id;lsSet(kStats(id),old);const om=lsGet(OLD_META);if(om)lsSet(kMeta(id),om);ix.migrated=true;}
   lsSet(INDEX_KEY,ix);}
  ix.list=ix.list.filter(p=>p&&typeof p.id==='string'&&validName(p.name));
  if(!ix.list.some(p=>p.id===ix.active))ix.active=ix.list[0]?ix.list[0].id:null;return ix;}
 const saveIndex=ix=>lsSet(INDEX_KEY,ix);
 const profiles=()=>index().list;
 const current=()=>{const ix=index();return ix.list.find(p=>p.id===ix.active)||null;};
 function addProfile(name){name=cleanName(name);if(!validName(name))throw new Error('Please use letters or numbers (up to 20).');const ix=index();
  if(ix.list.some(p=>p.name.toLowerCase()===name.toLowerCase()))throw new Error(`There is already a player called ${name}.`);
  const p={id:newId(),name,created:new Date().toISOString()};ix.list.push(p);ix.active=p.id;saveIndex(ix);return p;}
 function renameProfile(id,name){name=cleanName(name);if(!validName(name))throw new Error('Please use letters or numbers (up to 20).');const ix=index();
  if(ix.list.some(p=>p.id!==id&&p.name.toLowerCase()===name.toLowerCase()))throw new Error(`There is already a player called ${name}.`);
  const p=ix.list.find(p=>p.id===id);if(p){p.name=name;saveIndex(ix);}return p;}
 function deleteProfile(id){const ix=index();ix.list=ix.list.filter(p=>p.id!==id);if(ix.active===id)ix.active=ix.list[0]?ix.list[0].id:null;saveIndex(ix);lsDel(kStats(id));lsDel(kMeta(id));idb('readwrite',s=>s.delete(kHandle(id))).catch(()=>{});}
 function setActive(id){const ix=index();if(ix.list.some(p=>p.id===id)){ix.active=id;saveIndex(ix);}}
 const readProfile=id=>(lsGet(kStats(id))||{});
 const writeProfile=(id,data)=>lsSet(kStats(id),data);
 function boot(){const ix=index();pid=ix.active;return{profile:current(),migrated:!!ix.migrated,count:ix.list.length};}

 // ---- browser storage for the current player ----
 function readLocal(){return pid?readProfile(pid):{};}
 function writeLocal(data){if(!pid)return false;localOK=lsSet(kStats(pid),data);return localOK;}

 // ---- file status ----
 const fileBase=()=>{const p=current();return ((p?p.name:'player').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'player')+'-maths-progress.json';};
 const status=()=>({...meta,auto:!!handle&&meta.state!=='reconnect'&&meta.state!=='error',canPick,localOK});
 function emit(){if(pid)lsSet(kMeta(pid),meta);onStatus(status());}
 function set(p){Object.assign(meta,p);emit();}
 function pack(){const p=current();return JSON.stringify({app:APP_ID,version:VERSION,savedAt:new Date().toISOString(),profile:{name:p?p.name:'Player'},...getData()},null,1);}
 function unpack(text){let o;try{o=JSON.parse(text)}catch(e){throw new Error('That file isn’t a progress file (it can’t be read).')}
  if(!o||o.app!==APP_ID||!o.stats||typeof o.stats!=='object')throw new Error('That file isn’t a Maths Missions progress file.');
  if(o.version>VERSION)throw new Error('That file was saved by a newer version of the app.');
  o.name=o.profile&&validName(o.profile.name)?cleanName(o.profile.name):'Apollo';return o;}

 // ---- remember each player's chosen file between visits (IndexedDB can store file handles) ----
 function idb(mode,fn){return new Promise((res,rej)=>{if(!('indexedDB' in window))return rej(new Error('no idb'));const r=indexedDB.open('apollo-maths',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onerror=()=>rej(r.error);r.onsuccess=()=>{try{const tx=r.result.transaction('kv',mode),q=fn(tx.objectStore('kv'));tx.oncomplete=()=>res(q&&q.result);tx.onerror=()=>rej(tx.error);}catch(e){rej(e)}};});}
 const rememberHandle=h=>idb('readwrite',s=>s.put(h,kHandle(pid))).catch(()=>{});
 const recallHandle=()=>idb('readonly',s=>s.get(kHandle(pid))).catch(()=>null);

 async function writeHandle(){const w=await handle.createWritable();await w.write(pack());await w.close();set({state:'saved',lastSaved:new Date().toISOString(),dirty:false,fileName:handle.name});}
 async function safeWrite(){set({state:'saving'});try{await writeHandle();return{ok:true,auto:true}}catch(e){set({state:e&&e.name==='NotAllowedError'?'reconnect':'error'});return{ok:false,error:e}}}
 function download(){const url=URL.createObjectURL(new Blob([pack()],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=meta.fileName||fileBase();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);set({state:'downloaded',fileName:a.download,lastSaved:new Date().toISOString(),dirty:false});return{ok:true,auto:false};}
 // Download a copy of the progress file (.json) without changing where auto-save writes.
 function exportCopy(){const base=(meta.fileName||fileBase()).replace(/\.json$/i,''),d=new Date(),name=`${base}-copy-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
  const url=URL.createObjectURL(new Blob([pack()],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);return{ok:true,name};}
 async function saveAs(){
  if(!canPick)return download();
  let h;try{h=await window.showSaveFilePicker({suggestedName:meta.fileName||fileBase(),types:[{description:'Maths progress file',accept:{'application/json':['.json']}}]});}
  catch(e){if(e&&e.name==='AbortError')return{cancelled:true};return download();}
  handle=h;rememberHandle(h);return safeWrite();}
 async function save(){if(handle&&meta.state==='reconnect')return reconnect();if(handle)return safeWrite();return saveAs();}
 async function reconnect(){if(!handle)return saveAs();try{const p=await handle.requestPermission({mode:'readwrite'});if(p==='granted')return safeWrite();}catch(e){}set({state:'reconnect'});return{ok:false};}
 async function open(){
  if(canOpenPick){let h;try{[h]=await window.showOpenFilePicker({types:[{description:'Maths progress file',accept:{'application/json':['.json']}}],multiple:false});}
   catch(e){if(e&&e.name==='AbortError')return{cancelled:true};throw e;}
   const data=unpack(await (await h.getFile()).text());
   let perm='denied';try{perm=await h.requestPermission({mode:'readwrite'})}catch(e){}
   return{data,name:h.name,adopt:()=>{if(perm==='granted'){handle=h;rememberHandle(h);set({state:'saved',fileName:h.name,lastSaved:data.savedAt||new Date().toISOString(),dirty:false});}else{handle=null;set({state:'downloaded',fileName:h.name,lastSaved:data.savedAt,dirty:false});}}};}
  return new Promise((res,rej)=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.style.display='none';document.body.appendChild(i);
   i.onchange=async()=>{const f=i.files&&i.files[0];i.remove();if(!f)return res({cancelled:true});try{const data=unpack(await f.text());res({data,name:f.name,adopt:()=>{handle=null;set({state:'downloaded',fileName:f.name,lastSaved:data.savedAt,dirty:false});}})}catch(e){rej(e)}};
   i.click();});}
 function changed(){if(handle&&(meta.state==='saved'||meta.state==='saving'||meta.state==='error')){meta.dirty=true;clearTimeout(timer);timer=setTimeout(safeWrite,900);emit();return;}
  if(meta.state==='downloaded'||meta.state==='dirty'||meta.state==='reconnect'){set({dirty:true,state:meta.state==='reconnect'?'reconnect':'dirty'});return;}
  meta.dirty=true;emit();}
 function flush(){if(handle&&meta.dirty&&meta.state!=='reconnect'){clearTimeout(timer);safeWrite();}}
 async function init(opts){getData=opts.getData;onStatus=opts.onStatus;if(!pid){emit();return;}
  Object.assign(meta,lsGet(kMeta(pid))||{});
  if(meta.state==='saving')meta.state='saved';
  if(canPick){let h=await recallHandle();
   if(!h&&pid==='p1'){h=await idb('readonly',s=>s.get('handle')).catch(()=>null);if(h)rememberHandle(h);}   // file chosen before profiles existed
   if(h){handle=h;let p='prompt';try{p=await h.queryPermission({mode:'readwrite'})}catch(e){}meta.state=p==='granted'?'saved':'reconnect';}
   else if(meta.state==='saved'||meta.state==='reconnect')meta.state=meta.lastSaved?'dirty':'none';}
  else if(meta.state==='saved'||meta.state==='reconnect')meta.state=meta.dirty?'dirty':'downloaded';
  emit();if(handle&&meta.state==='saved'&&meta.dirty)safeWrite();}
 return{exportCopy,boot,profiles,current,addProfile,renameProfile,deleteProfile,setActive,readProfile,writeProfile,validName,cleanName,
  readLocal,writeLocal,save,saveAs,open,reconnect,changed,flush,init,status,canPick,fileBase};
})();
