'use strict';
// STORAGE: keeps progress (1) in this browser automatically and (2) in a progress file Apollo chooses.
// After the first file save, Chrome/Edge on a computer can keep writing to the same file automatically (auto-save).
// Other browsers (Safari, iPad/iPhone, Firefox) save by downloading a file; the app then reminds Apollo when there is unsaved progress.
const Storage=(()=>{
 const LOCAL_KEY='apollo-maths-missions-v2',META_KEY='apollo-maths-file-meta',APP_ID='apollo-maths-missions',VERSION=3,DEFAULT_NAME='apollo-maths-progress.json';
 const canPick=typeof window!=='undefined'&&typeof window.showSaveFilePicker==='function'&&window.isSecureContext!==false;
 const canOpenPick=typeof window!=='undefined'&&typeof window.showOpenFilePicker==='function'&&window.isSecureContext!==false;
 let handle=null,getData=()=>({}),onStatus=()=>{},timer=null,localOK=true;
 let meta={state:'none',fileName:null,lastSaved:null,dirty:false};   // state: none | saving | saved | downloaded | dirty | error | reconnect
 const status=()=>({...meta,auto:!!handle&&meta.state!=='reconnect'&&meta.state!=='error',canPick,localOK});
 function emit(){try{localStorage.setItem(META_KEY,JSON.stringify(meta))}catch(e){}onStatus(status());}
 function set(p){Object.assign(meta,p);emit();}

 // ---- browser storage ----
 function readLocal(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}')||{}}catch(e){return{}}}
 function writeLocal(data){try{localStorage.setItem(LOCAL_KEY,JSON.stringify(data));localOK=true}catch(e){localOK=false}return localOK;}

 // ---- file format ----
 function pack(){return JSON.stringify({app:APP_ID,version:VERSION,savedAt:new Date().toISOString(),...getData()},null,1);}
 function unpack(text){let o;try{o=JSON.parse(text)}catch(e){throw new Error('That file isn’t a progress file (it can’t be read).')}
  if(!o||o.app!==APP_ID||!o.stats||typeof o.stats!=='object')throw new Error('That file isn’t an Apollo’s Maths Missions progress file.');
  if(o.version>VERSION)throw new Error('That file was saved by a newer version of the app.');return o;}

 // ---- remember the chosen file between visits (IndexedDB can store file handles) ----
 function idb(mode,fn){return new Promise((res,rej)=>{if(!('indexedDB' in window))return rej(new Error('no idb'));const r=indexedDB.open('apollo-maths',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onerror=()=>rej(r.error);r.onsuccess=()=>{try{const tx=r.result.transaction('kv',mode),q=fn(tx.objectStore('kv'));tx.oncomplete=()=>res(q&&q.result);tx.onerror=()=>rej(tx.error);}catch(e){rej(e)}};});}
 const rememberHandle=h=>idb('readwrite',s=>s.put(h,'handle')).catch(()=>{});
 const recallHandle=()=>idb('readonly',s=>s.get('handle')).catch(()=>null);

 async function writeHandle(){const w=await handle.createWritable();await w.write(pack());await w.close();set({state:'saved',lastSaved:new Date().toISOString(),dirty:false,fileName:handle.name});}
 async function safeWrite(){set({state:'saving'});try{await writeHandle();return{ok:true,auto:true}}catch(e){set({state:e&&e.name==='NotAllowedError'?'reconnect':'error'});return{ok:false,error:e}}}
 function download(){const url=URL.createObjectURL(new Blob([pack()],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=meta.fileName||DEFAULT_NAME;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);set({state:'downloaded',fileName:a.download,lastSaved:new Date().toISOString(),dirty:false});return{ok:true,auto:false};}

 // Choose a file and save (always asks where). Must be called from a tap/click.
 async function saveAs(){
  if(!canPick)return download();
  let h;try{h=await window.showSaveFilePicker({suggestedName:meta.fileName||DEFAULT_NAME,types:[{description:'Maths progress file',accept:{'application/json':['.json']}}]});}
  catch(e){if(e&&e.name==='AbortError')return{cancelled:true};return download();}
  handle=h;rememberHandle(h);return safeWrite();}
 // The main Save button: write straight to the chosen file if we have one, otherwise ask.
 async function save(){if(handle&&meta.state==='reconnect')return reconnect();if(handle)return safeWrite();return saveAs();}
 // Re-allow auto-save after the page was reopened (browsers need a tap to give permission again).
 async function reconnect(){if(!handle)return saveAs();try{const p=await handle.requestPermission({mode:'readwrite'});if(p==='granted')return safeWrite();}catch(e){}set({state:'reconnect'});return{ok:false};}
 // Open a progress file. Returns {data,name} for the app to check and load.
 async function open(){
  if(canOpenPick){let h;try{[h]=await window.showOpenFilePicker({types:[{description:'Maths progress file',accept:{'application/json':['.json']}}],multiple:false});}
   catch(e){if(e&&e.name==='AbortError')return{cancelled:true};throw e;}
   const data=unpack(await (await h.getFile()).text());
   let perm='denied';try{perm=await h.requestPermission({mode:'readwrite'})}catch(e){}
   return{data,name:h.name,adopt:()=>{if(perm==='granted'){handle=h;rememberHandle(h);set({state:'saved',fileName:h.name,lastSaved:data.savedAt||new Date().toISOString(),dirty:false});}else{handle=null;set({state:'downloaded',fileName:h.name,lastSaved:data.savedAt,dirty:false});}}};}
  return new Promise((res,rej)=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.style.display='none';document.body.appendChild(i);
   i.onchange=async()=>{const f=i.files&&i.files[0];i.remove();if(!f)return res({cancelled:true});try{const data=unpack(await f.text());res({data,name:f.name,adopt:()=>{handle=null;set({state:'downloaded',fileName:f.name,lastSaved:data.savedAt,dirty:false});}})}catch(e){rej(e)}};
   i.click();});}
 // Call whenever progress changes.
 function changed(){if(handle&&(meta.state==='saved'||meta.state==='saving'||meta.state==='error')){meta.dirty=true;clearTimeout(timer);timer=setTimeout(safeWrite,900);emit();return;}
  if(meta.state==='downloaded'||meta.state==='dirty'||meta.state==='reconnect'){set({dirty:true,state:meta.state==='reconnect'?'reconnect':'dirty'});return;}
  meta.dirty=true;emit();}
 function flush(){if(handle&&meta.dirty&&meta.state!=='reconnect'){clearTimeout(timer);safeWrite();}}
 async function init(opts){getData=opts.getData;onStatus=opts.onStatus;
  try{Object.assign(meta,JSON.parse(localStorage.getItem(META_KEY)||'{}')||{})}catch(e){}
  if(meta.state==='saving')meta.state='saved';
  if(canPick){const h=await recallHandle();if(h){handle=h;let p='prompt';try{p=await h.queryPermission({mode:'readwrite'})}catch(e){}
    if(p==='granted'){meta.state=meta.state==='error'?'saved':meta.state;if(meta.state!=='saved')meta.state='saved';}else meta.state='reconnect';}
   else if(meta.state==='saved'||meta.state==='reconnect')meta.state=meta.lastSaved?'dirty':'none';}
  else if(meta.state==='saved'||meta.state==='reconnect')meta.state=meta.dirty?'dirty':'downloaded';
  emit();if(handle&&meta.state==='saved'&&meta.dirty)safeWrite();}
 return{readLocal,writeLocal,save,saveAs,open,reconnect,changed,flush,init,status,canPick,DEFAULT_NAME};
})();
