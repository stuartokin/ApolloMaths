'use strict';
// PROTECT: a deleted player goes to a recycle bin for 30 days and can be restored by a grown-up.
// Each player's progress is kept in browser storage under keys containing their id; those entries are copied here first.
const Protect=(()=>{
 const BIN='am-recycle-bin',DAYS=30;
 const read=()=>{try{const b=JSON.parse(localStorage.getItem(BIN)||'[]');return Array.isArray(b)?b.filter(x=>x&&Date.now()-x.t<DAYS*864e5):[];}catch(e){return[];}};
 const write=b=>{try{localStorage.setItem(BIN,JSON.stringify(b.slice(-10)));return true;}catch(e){return false;}};
 function binIt(p){const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k!==BIN&&k.includes(p.id))data[k]=localStorage.getItem(k);}const b=read();b.push({id:p.id,name:p.name,t:Date.now(),data});return write(b);}
 function restore(id){const b=read(),e=b.find(x=>x.id===id);if(!e)return false;let name=e.name,n=2;const taken=()=>Storage.profiles().some(p=>p.name.toLowerCase()===name.toLowerCase());while(taken()&&n<20)name=`${e.name} ${n++}`;
  const np=Storage.addProfile(name);for(const [k,v] of Object.entries(e.data)){try{localStorage.setItem(k.split(e.id).join(np.id),v);}catch(x){}}write(b.filter(x=>x.id!==id));return np;}
 function binHTML(){const b=read();if(!b.length)return'';return `<div class="plbin"><b>♻️ Recently deleted</b> <span class="mini">(kept for ${DAYS} days)</span>${b.map(x=>`<div class="plbin-row"><span>${esc(x.name)} <small>— deleted ${new Date(x.t).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</small></span><button type="button" class="linkbtn" data-restore="${esc(x.id)}">↩️ Restore</button></div>`).join('')}</div>`;}
 document.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('[data-restore]');if(!r)return;const go=()=>{try{const np=restore(r.dataset.restore);if(np){if(typeof toast==='function')toast(`${np.name} is back, with all their progress.`);if(typeof Players!=='undefined'&&Players.render)Players.render();else location.reload();}}catch(x){if(typeof toast==='function')toast('Sorry — that could not be restored.');}};
  if(typeof Family!=='undefined'&&Family.guard)Family.guard('Restore a deleted player',go);else go();});
 return{binIt,binHTML,restore,read};})();
