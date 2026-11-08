'use strict';
// PRESENTATION: "a new version is ready!" When online, the app reads version.json from the website (never from a cache)
// and compares it with the version it is running. If there is a newer one it explains what's new in child-friendly
// words (with headlines for new games and Kit Shop items) and how to save and update.
// After an update, the same window shows "You're on the new version!" with what changed.
const Update=(()=>{
 let remote=null,lastCheck=0,shownThisLoad=false;
 const KEY='apollo-maths-update-shown',newer=(a,b)=>{const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d>0;}return false;};
 const dlg=()=>get('updateDlg');
 const HEAD={games:'🤫 Psst… the secret arcade has something new!',shop:'🛍️ New things in the Kit Shop!',look:'🎨 New ways to style your player!'};
 // What's new between two versions (newest first)
 function changes(releases,from,to){const list=releases.filter(r=>newer(r.v,from)&&!newer(r.v,to));const tags=[...new Set(list.flatMap(r=>r.tags||[]))];
  const lines=list.flatMap(r=>(r.kids&&r.kids.length?r.kids:r.items.slice(0,2))).slice(0,7);return{list,tags,lines};}
 function body(c){return `${c.tags.filter(t=>HEAD[t]).map(t=>`<p class="up-head">${HEAD[t]}</p>`).join('')}<ul class="up-list">${c.lines.map(l=>`<li>${fracify(esc(l))}</li>`).join('')}</ul>`;}
 function open(html){const d=dlg();get('upBody').innerHTML=html;if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');const f=d.querySelector('[autofocus]');if(f)f.focus();}
 function showAvailable(){if(!remote)return;const c=changes(remote.releases||[],APP_VERSION,remote.version),st=Storage.status();
  open(`<div class="up-hero"><div class="up-big">🆕</div><h2>A new version is ready!</h2><p class="mini">Version ${esc(remote.version)} (you have ${esc(APP_VERSION)})</p></div>${body(c)}
   <div class="up-steps"><b>How to get it:</b><ol>
    <li>${st.auto?'Your progress saves itself to your file — nothing to do. ✅':'<b>Save your progress</b> first, to keep it extra safe (it is also kept on this device). <button class="secondary" data-up="save" type="button">💾 Save now</button>'}</li>
    <li>Tap <b>🔄 Update now</b>.</li>
    <li>Still looks the same? Close the app completely and open it again (on iPad or iPhone, swipe it away first).</li></ol></div>
   <div class="actions" style="justify-content:center"><button class="primary" data-up="go" type="button" autofocus>🔄 Update now</button><button class="ghost" data-up="later" type="button">Later</button></div>`);
  try{localStorage.setItem(KEY,remote.version)}catch(e){}Speech.announce(`A new version is ready! ${c.tags.includes('games')?'The secret arcade has something new! ':''}${c.tags.includes('shop')?'There are new things in the Kit Shop! ':''}`);}
 // After an update: "you're on the new version"
 function showWhatsNew(prev){const c=changes(versionHistory.map(r=>({v:r.v,kids:r.kids,tags:r.tags,items:r.items})),prev,APP_VERSION);if(!c.lines.length)return;
  whenFree(()=>{try{localStorage.setItem('apollo-maths-version',APP_VERSION)}catch(e){}open(`<div class="up-hero"><div class="up-big">🎉</div><h2>You’re on the new version!</h2><p class="mini">Version ${esc(APP_VERSION)} — here’s what’s new</p></div>${body(c)}<div class="actions" style="justify-content:center"><button class="primary" data-up="close" type="button" autofocus>Brilliant! 👍</button><button class="ghost" data-up="history" type="button">Full version history</button></div>`);});}
 async function check(force){if(!/^https?:/.test(location.protocol)||!navigator.onLine)return;const now=Date.now();if(!force&&now-lastCheck<60000)return;lastCheck=now;
  try{const r=await fetch('version.json?ts='+now,{cache:'no-store'});if(!r.ok)return;const j=await r.json();if(!j||!j.version)return;
   if(newer(j.version,APP_VERSION)){remote=j;get('updChip').classList.remove('hidden');let shown='';try{shown=localStorage.getItem(KEY)||''}catch(e){}
    if(shown!==j.version&&!shownThisLoad){shownThisLoad=true;whenFree(showAvailable);}}}catch(e){}}
 // Wait until no other window (welcome, tour, player picker…) is open before popping up.
 function whenFree(fn){let n=0;const tick=()=>{const busy=[...document.querySelectorAll('dialog')].some(d=>d.open)||(typeof Tour!=='undefined'&&Tour.isActive());if(busy&&n++<240){setTimeout(tick,1000);return;}fn();};tick();}
 async function go(){save(false);const b=dlg().querySelector('[data-up=go]');if(b){b.disabled=true;b.textContent='Updating…';}
  try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg)await reg.update();}catch(e){}
  setTimeout(()=>location.reload(),600);}
 function init(){get('updChip').addEventListener('click',()=>remote?showAvailable():check(true));
  dlg().addEventListener('click',async e=>{const b=e.target.closest('[data-up]');if(!b)return;const a=b.dataset.up;
   if(a==='save'){await doSave(Storage.save);b.textContent='✅ Saved';b.disabled=true;}else if(a==='go')go();else if(a==='later'||a==='close')dlg().close();else if(a==='history'){dlg().close();Help.open('versions');}});
  setTimeout(()=>check(true),4000);setInterval(()=>check(false),10*60000);window.addEventListener('focus',()=>check(false));
  window.addEventListener('online',()=>check(true));document.addEventListener('click',e=>{if(e.target.closest('[data-upcheck]'))manual();});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check(false);});}
 // a manual “check for updates” (from Help): says plainly whether this is the latest version
 async function manual(){if(!/^https?:/.test(location.protocol)){toast('Updates can only be checked on the website.');return;}if(!navigator.onLine){toast('You’re offline — connect to the internet to check for updates.');return;}
  try{const r=await fetch('version.json?ts='+Date.now(),{cache:'no-store'});const j=await r.json();if(newer(j.version,APP_VERSION)){remote=j;get('updChip').classList.remove('hidden');showAvailable();}else toast(`✅ You have the latest version (${APP_VERSION}).`);}catch(e){toast('Couldn’t check just now — try again in a moment.');}}
 return{init,check,manual,showWhatsNew,_newer:newer};
})();
