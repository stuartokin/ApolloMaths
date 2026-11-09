'use strict';
// FAMILY CODES AND FAIR PLAY (no server, nothing written to GitHub).
// • A grown-up sets a passphrase (or 6+ digit PIN) and the child's arcade codes. They are stored scrambled inside the
//   child's profile and progress file, so they travel with the child to any browser. A one-time recovery code resets
//   a forgotten passphrase.
// • Arcade time can only go up (a per-browser record that older files can't reduce), one tab at a time, device-clock
//   checks, hand-edited files are detected, automatic backups, and a log of anything unusual for the Parent dashboard.
// Honest limit: everything runs in the browser, so this stops easy and accidental routes and makes deliberate ones
// visible; it can't stop someone determined with developer tools. Device parental controls (see Help) close the rest.
const Family=(()=>{
 const enc=new TextEncoder(),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const rand=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
 const ROUNDS=200000,ALPH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
 const normPass=p=>String(p||'').trim().replace(/\s+/g,' ').toLowerCase();
 async function kdf(secret,salt,rounds=ROUNDS){const key=await crypto.subtle.importKey('raw',enc.encode(secret),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:rounds},key,256));}
 const recoveryCode=()=>{const v=crypto.getRandomValues(new Uint8Array(12));let s='';v.forEach((x,i)=>{s+=ALPH[x%ALPH.length];if(i===3||i===7)s+='-';});return s;};
 const fam=()=>typeof stats!=='undefined'&&stats&&stats.family&&stats.family.v===1?stats.family:null;
 const ready=()=>!!fam();
 let unlockedUntil=0;const unlocked=()=>Date.now()<unlockedUntil;
 const dlg=()=>get('famDlg');
 function show(html){const d=dlg();d.querySelector('.fam-body').innerHTML=html;if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');setTimeout(()=>{const i=d.querySelector('input');if(i)i.focus();},60);}
 function hide(){const d=dlg();if(d.open&&d.close)d.close();else d.removeAttribute('open');}
 // ---------------- log of anything unusual ----------------
 const DLOG='apollo-maths-device-log';
 function log(text,profile=true){const e={t:Date.now(),text};if(profile&&typeof stats!=='undefined'&&stats){const I=(stats.integrity ||= {lock:null,log:[]});I.log=(I.log||[]).concat(e).slice(-40);}
  try{const L=JSON.parse(localStorage.getItem(DLOG)||'[]');L.push({...e,who:(Storage.current()||{}).name||''});localStorage.setItem(DLOG,JSON.stringify(L.slice(-60)));}catch(x){}}
 function lockArcade(reason){if(typeof stats==='undefined'||!stats)return;const I=(stats.integrity ||= {lock:null,log:[]});if(!I.lock){I.lock=reason;}log('Arcade locked: '+reason);try{save(false)}catch(e){}}
 // ---------------- “ask a grown-up” ----------------
 let pending=null;
 function ask(reason){return new Promise(res=>{if(!ready()){res(true);return;}if(unlocked()){res(true);return;}pending=res;askForm(reason,'');});}
 function askForm(reason,err){show(`<h3>👪 Grown-up check</h3><p>${esc(reason)}</p><input id="famPass" type="password" autocomplete="off" placeholder="Parent passphrase or PIN" aria-label="Parent passphrase or PIN"><p class="plerr">${esc(err||'')}</p>
   <div class="actions"><button class="primary" data-fam="check" type="button">Continue</button><button class="ghost" data-fam="cancel" type="button">Cancel</button></div><p class="mini"><a href="#" data-fam="forgot">Forgotten it? Use your recovery code</a></p>`);dlg().dataset.reason=reason;}
 const fails={n:0,until:0};
 async function checkPass(){const f=fam(),v=get('famPass').value;if(Date.now()<fails.until){askForm(dlg().dataset.reason,`Too many tries — wait ${Math.ceil((fails.until-Date.now())/1000)} s.`);return;}
  const ok=(await kdf(normPass(v),f.salt,f.rounds))===f.pass;if(ok){fails.n=0;unlockedUntil=Date.now()+10*60000;hide();const r=pending;pending=null;if(r)r(true);return;}
  fails.n++;log('Wrong parent passphrase entered');if(fails.n>=5){fails.until=Date.now()+60000;fails.n=0;}askForm(dlg().dataset.reason,'That isn’t right — try again.');}
 function cancel(){hide();const r=pending;pending=null;if(r)r(false);}
 // run fn only after a grown-up check (when family codes exist); otherwise fall back to the older Admin PIN lock
 function guard(reason,fn,adminLock){if(ready()){ask(reason).then(ok=>{if(ok)fn();});return;}if(adminLock&&typeof Admin!=='undefined')Admin.guard(adminLock,fn);else fn();}
 // ---------------- setting up (or changing) the family codes ----------------
 function setupForm(err,keep={}){const f=fam(),oldPin=typeof Admin!=='undefined'&&Admin.hasPin&&Admin.hasPin()&&!f;
  show(`<h3>👪 ${f?'Change':'Set up'} family codes</h3><p class="mini">For grown-ups. These stop the reward games being opened or changed without you. Everything is stored scrambled on this device and in your child’s progress file — nothing is sent anywhere.</p>
   ${oldPin?`<label>Current Admin PIN on this device <input id="famOld" type="password" inputmode="numeric" autocomplete="off" placeholder="Existing PIN"></label>`:''}
   <label>Parent passphrase or PIN <span class="mini">(three words or 10+ characters, or a PIN of 6+ digits)</span><input id="famP1" type="password" autocomplete="new-password" placeholder="e.g. purple tiger toast"></label>
   <label>Type it again <input id="famP2" type="password" autocomplete="new-password"></label>
   <label>Child’s secret word for the games <span class="mini">(4+ letters, typed in the answer box)</span><input id="famKW" autocomplete="off" value="${esc(keep.kw||'')}" placeholder="e.g. GOLDENBOOT"></label>
   <label>Child’s number code <span class="mini">(starts with 00, 6–10 digits — for tablets with a number keypad)</span><input id="famKN" inputmode="numeric" autocomplete="off" value="${esc(keep.kn||'')}" placeholder="e.g. 004217"></label>
   ${Storage.profiles().length>1?`<label class="chk"><input id="famAll" type="checkbox" checked> Use the same codes for every player on this device</label>`:''}
   <p class="plerr">${esc(err||'')}</p><div class="actions"><button class="primary" data-fam="save" type="button">Save family codes</button><button class="ghost" data-fam="cancel" type="button">Cancel</button></div>
   <p class="mini">Tip: device parental controls (one browser, no private browsing, time limits) make this even stronger — see ❓ Help → “Parental controls on your devices”.</p>`);}
 function setup(){if(ready()){ask('Change the family codes').then(ok=>{if(ok)setupForm('');});return;}setupForm('');}
 async function saveSetup(){const g=id=>(get(id)||{value:''}).value,p1=g('famP1'),p2=g('famP2'),kw=normWord(g('famKW')),kn=g('famKN').trim(),keep={kw:g('famKW'),kn};
  const pin=/^\d+$/.test(p1.trim());if(pin?p1.trim().length<6:normPass(p1).length<10)return setupForm(pin?'A PIN needs at least 6 digits.':'Use three words or at least 10 characters.',keep);
  if(p1!==p2)return setupForm('The two passphrases don’t match.',keep);if(kw.length<4)return setupForm('The child’s secret word needs at least 4 letters or numbers.',keep);
  if(!validCode(kn))return setupForm('The number code must start with 00 and be 6–10 digits.',keep);
  if(get('famOld')&&!Admin.pinOk(get('famOld').value))return setupForm('That isn’t the current Admin PIN on this device.',keep);
  const salt=rand(16),rsalt=rand(16),code=recoveryCode();const f={v:1,salt,rounds:ROUNDS,pass:await kdf(normPass(p1),salt),kidW:wordHash(kw,salt),kidN:wordHash(kn,salt),rsalt,rec:await kdf(code.replace(/-/g,''),rsalt),at:new Date().toISOString(),onlineOnly:fam()?!!fam().onlineOnly:false};
  stats.family=f;(stats.integrity ||= {lock:null,log:[]}).lock=null;log('Family codes set up');save();
  if(get('famAll')&&get('famAll').checked){const me=Storage.current();for(const p of Storage.profiles()){if(me&&p.id===me.id)continue;const o=Storage.readProfile(p.id)||{};const st=o.stats||{};st.family={...f};Storage.writeProfile(p.id,{...o,stats:st});}}
  unlockedUntil=Date.now()+10*60000;
  show(`<h3>✅ Family codes saved</h3><p>Your child now opens the games with <b>${esc(kw)}</b> or <b>${esc(kn)}</b>. The old codes no longer work.</p>
   <div class="fam-rec"><p><b>Your recovery code</b> — write it down and keep it somewhere safe. It’s the only way to reset a forgotten passphrase.</p><div class="fam-code">${code}</div></div>
   <label class="chk"><input id="famDone" type="checkbox"> I’ve written it down</label><div class="actions"><button class="primary" data-fam="done" type="button">Finish</button></div>`);
  if(typeof updateFamilyBanner==='function')updateFamilyBanner();}
 function forgotForm(err){show(`<h3>🔑 Use your recovery code</h3><p class="mini">Enter the code you wrote down when you set up the family codes, then choose a new passphrase.</p><input id="famRec" autocomplete="off" placeholder="XXXX-XXXX-XXXX" style="text-transform:uppercase"><p class="plerr">${esc(err||'')}</p>
   <div class="actions"><button class="primary" data-fam="rec" type="button">Continue</button><button class="ghost" data-fam="cancel" type="button">Cancel</button></div>`);}
 async function useRecovery(){const f=fam(),v=String(get('famRec').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if((await kdf(v,f.rsalt,f.rounds))!==f.rec){log('Wrong recovery code entered');forgotForm('That recovery code isn’t right.');return;}
  log('Recovery code used');unlockedUntil=Date.now()+10*60000;const r=pending;pending=null;setupForm('Recovery code accepted — choose a new passphrase (and codes).');if(r)r(true);}
 // ---------------- the child's arcade codes ----------------
 function secret(raw){const f=fam();if(!f)return undefined;const t=String(raw||'').trim();if(validCode(t))return wordHash(t,f.salt)===f.kidN?'kid':null;return wordHash(t,f.salt)===f.kidW?'kid':null;}
 // ---------------- arcade locks ----------------
 const clockKey='apollo-maths-clock';let serverOkAt=0;
 function arcadeBlock(){if(!ready())return null;const I=stats.integrity||{};if(I.lock)return I.lock;if(fam().onlineOnly&&Date.now()-serverOkAt>20*60000)return 'The games need the internet to check the time (a grown-up switched this on).';return null;}
 function blockedCard(reason){show(`<h3>🔒 Ask a grown-up</h3><p>The secret games are locked: <b>${esc(reason)}</b></p><p class="mini">A grown-up can unlock them with the parent passphrase.</p>
   <div class="actions"><button class="primary" data-fam="unlockArcade" type="button">Grown-up: unlock</button><button class="ghost" data-fam="cancel" type="button">Back to maths</button></div>`);}
 function unlockArcade(){ask('Unlock the secret games').then(ok=>{if(!ok)return;const I=(stats.integrity ||= {lock:null,log:[]});if(I.lock){log('Arcade unlocked by a grown-up ('+I.lock+')');I.lock=null;}save(false);toast('🔓 The games are unlocked.');if(typeof updateFamilyBanner==='function')updateFamilyBanner();});}
 // ---------------- arcade time can only go up (per-browser record) ----------------
 const ledgerKey=()=>'apollo-maths-ledger:'+((Storage.current()||{}).id||'x');
 function mergeLedger(s){if(!s||!s.arcade)return;let L={};try{L=JSON.parse(localStorage.getItem(ledgerKey())||'{}')||{};}catch(e){}const used=s.arcade.used||(s.arcade.used={});
  for(const k of new Set([...Object.keys(used),...Object.keys(L)])){const v=Math.max(+used[k]||0,+L[k]||0);used[k]=v;L[k]=v;}const keys=Object.keys(L).sort().slice(-70),L2={};keys.forEach(k=>L2[k]=L[k]);try{localStorage.setItem(ledgerKey(),JSON.stringify(L2));}catch(e){}}
 // ---------------- device clock ----------------
 function clockCheck(){const now=Date.now();let c={};try{c=JSON.parse(localStorage.getItem(clockKey)||'{}')||{};}catch(e){}
  if(c.last&&now<c.last-5*60000){lockArcade('The device clock was moved back');}
  c.last=Math.max(c.last||0,now);try{localStorage.setItem(clockKey,JSON.stringify(c));}catch(e){}}
 async function serverTime(){if(!/^https?:/.test(location.protocol)||!navigator.onLine)return;try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});const d=r.headers.get('Date');if(!d)return;const diff=Date.now()-new Date(d).getTime();
   if(Math.abs(diff)>15*60000){lockArcade(`The device clock is wrong (${Math.round(diff/60000)} minutes out)`);}else serverOkAt=Date.now();}catch(e){}}
 // ---------------- hand-edited files ----------------
 const sig=s=>sha256('apollo-maths-file|'+JSON.stringify(s));
 // ---------------- one tab at a time ----------------
 let bc=null,haveLock=false,releaseLock=null;
 function tabBlock(on){let el=get('tabBlock');if(!el){el=document.createElement('div');el.id='tabBlock';el.className='tabblock';el.innerHTML='<div><div style="font-size:48px">🗂️</div><h2>Already open in another tab</h2><p>Maths Missions is open in another tab or window. Please use that one, so your progress and game time stay correct.</p><button class="primary" type="button" id="tabTake">Use it here instead</button></div>';document.body.appendChild(el);get('tabTake').onclick=takeOver;}el.classList.toggle('on',on);}
 function takeOver(){if(bc)bc.postMessage({type:'takeover'});get('tabTake').textContent='Switching…';const go=()=>location.reload();if(navigator.locks)navigator.locks.request('apollo-maths-tab',()=>{go();return new Promise(()=>{});});else setTimeout(go,800);}
 function tabLock(){try{bc=new BroadcastChannel('apollo-maths');bc.onmessage=e=>{if(e.data&&e.data.type==='takeover'&&haveLock){try{save(false);Storage.flush&&Storage.flush();}catch(x){}haveLock=false;if(releaseLock)releaseLock();tabBlock(true);log('Another tab took over',false);}};}catch(e){}
  if(navigator.locks&&navigator.locks.request){navigator.locks.request('apollo-maths-tab',{ifAvailable:true},lock=>{if(!lock){tabBlock(true);log('Second tab blocked',false);return;}haveLock=true;return new Promise(r=>{releaseLock=r;});});}}
 // ---------------- automatic backups (IndexedDB, last 5 per player) ----------------
 const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('apollo-maths-backups',1);r.onupgradeneeded=()=>{r.result.createObjectStore('b',{keyPath:'id',autoIncrement:true}).createIndex('pid','pid');};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
 async function backups(pid){try{const db=await idb();return await new Promise(res=>{const out=[];const c=db.transaction('b').objectStore('b').index('pid').openCursor(IDBKeyRange.only(pid));c.onsuccess=()=>{const x=c.result;if(x){out.push(x.value);x.continue();}else res(out.sort((a,b)=>b.t-a.t));};c.onerror=()=>res([]);});}catch(e){return[];}}
 let lastBackup=0;
 async function backup(label='Automatic'){try{const p=Storage.current();if(!p||typeof stats==='undefined')return;const db=await idb();const rec={pid:p.id,t:Date.now(),label,solved:stats.solved,points:stats.points,data:JSON.stringify(stats)};
  await new Promise(res=>{const tx=db.transaction('b','readwrite');tx.objectStore('b').add(rec);tx.oncomplete=res;tx.onerror=res;});lastBackup=Date.now();
  const all=await backups(p.id);if(all.length>5){const tx=db.transaction('b','readwrite');for(const old of all.slice(5))tx.objectStore('b').delete(old.id);}}catch(e){}}
 async function restoreList(){const p=Storage.current();const list=p?await backups(p.id):[];
  show(`<h3>⏪ Restore an earlier save</h3><p class="mini">The app keeps the last 5 saves of ${esc(p?p.name:'')} on this device. Restoring replaces the current progress (a backup of it is kept first).</p>
   ${list.length?`<table class="fam-tab"><tr><th>When</th><th>Right</th><th>Points</th><th></th></tr>${list.map(b=>`<tr><td>${new Date(b.t).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}<br><span class="mini">${esc(b.label)}</span></td><td>${b.solved}</td><td>${b.points}</td><td><button class="secondary" data-fam="restore" data-id="${b.id}" type="button">Restore</button></td></tr>`).join('')}</table>`:'<p>No backups yet — they are made automatically while the app is used.</p>'}
   <div class="actions"><button class="ghost" data-fam="cancel" type="button">Close</button></div>`);}
 async function restore(id){const p=Storage.current(),list=await backups(p.id),b=list.find(x=>x.id===+id);if(!b)return;await backup('Before restoring');const s=cleanStats(JSON.parse(b.data));mergeLedger(s);stats=s;log('Earlier save restored ('+new Date(b.t).toLocaleString('en-GB')+')');save();hide();toast('⏪ Earlier save restored.');setTimeout(()=>location.reload(),600);}
 // ---------------- loading a file: warnings, edited files, time can't go back ----------------
 // returns a promise: true = go ahead and use `incoming`
 async function vetIncoming(incoming,raw,current){const notes=[];
  if(raw&&raw.sig&&raw.sig!==sig(raw.stats)){const I=(incoming.integrity ||= {lock:null,log:[]});I.lock='This progress file was changed by hand';notes.push('edited');}
  else if(raw&&!raw.sig)notes.push('unsigned');
  const less=current&&current.attempts>0&&(incoming.solved<current.solved||incoming.points<current.points);
  if(less){if(!confirm(`⚠️ This file has LESS progress than this device.\n\nOn this device: ${current.solved} right, ${current.points} points\nIn the file: ${incoming.solved} right, ${incoming.points} points\n\nReplace the newer progress with the older file?`))return false;
   if(ready()&&!(await ask('Replace newer progress with an older file')))return false;}
  await backup('Before loading a file');
  // arcade time used today/this week can't be reduced by an older file; saved-up time stays with this device
  if(current&&current.arcade&&incoming.arcade){const u=incoming.arcade.used||(incoming.arcade.used={});for(const[k,v]of Object.entries(current.arcade.used||{}))u[k]=Math.max(+u[k]||0,+v||0);incoming.arcade.bank=current.arcade.bank;}
  if(!incoming.family&&current&&current.family)incoming.family=current.family;
  const I=(incoming.integrity ||= {lock:null,log:[]});I.log=(I.log||[]).concat({t:Date.now(),text:notes.includes('edited')?'A hand-edited progress file was loaded — games locked':less?'An older progress file was loaded':'Progress file loaded'}).slice(-40);
  return true;}
 // ---------------- new players start with the games locked ----------------
 function newPlayer(id){const any=Storage.profiles().map(p=>(Storage.readProfile(p.id)||{}).stats).find(s=>s&&s.family&&s.family.v===1);const st={};
  if(any)st.family={...any.family};st.integrity={lock:any?'New player — a grown-up needs to switch the games on':null,log:[{t:Date.now(),text:'Player created on this device'}]};Storage.writeProfile(id,{stats:st});log('New player created',false);}
 // ---------------- storage safety ----------------
 async function storageSafety(){try{if(navigator.storage&&navigator.storage.persist)await navigator.storage.persist();}catch(e){}
  try{if(navigator.storage&&navigator.storage.estimate){const q=(await navigator.storage.estimate()).quota||0;if(q&&q<180*1024*1024&&!sessionStorage.getItem('am-private-warned')){sessionStorage.setItem('am-private-warned','1');setTimeout(()=>toast('⚠️ This looks like a private window — progress may be lost when it closes. Save to a file or use a normal window.'),1500);}}}catch(e){}}
 // ---------------- Parent dashboard: fair play & safety ----------------
 function dashboardHTML(){const f=fam(),I=(typeof stats!=='undefined'&&stats.integrity)||{log:[]};let dev=[];try{dev=JSON.parse(localStorage.getItem(DLOG)||'[]');}catch(e){}
  const evts=[...(I.log||[]).map(e=>({...e,who:''})),...dev.filter(e=>!(I.log||[]).some(x=>x.t===e.t))].sort((a,b)=>b.t-a.t).slice(0,15);
  return `<h3>🛡️ Fair play &amp; safety <span class="mini">(this device · signed in: ${esc((Storage.current()||{}).name||'')})</span></h3>
   <p>${f?`✅ Family codes are set up (since ${new Date(f.at).toLocaleDateString('en-GB')}).`:'⚠️ <b>Family codes are not set up yet.</b> Until they are, the old shared codes still open the games and settings.'}${I.lock?`<br>🔒 Games locked: <b>${esc(I.lock)}</b>`:''}</p>
   <div class="actions" style="justify-content:flex-start;flex-wrap:wrap"><button class="primary" data-fam="setup" type="button">${f?'Change family codes':'👪 Set up family codes'}</button>
    ${f?`<button class="secondary" data-fam="admin" type="button">🔐 Advanced settings</button>`:''}${I.lock?`<button class="secondary" data-fam="unlockArcade" type="button">🔓 Unlock the games</button>`:f?`<button class="ghost" data-fam="lockNow" type="button">🔒 Lock the games now</button>`:''}
    <button class="ghost" data-fam="restoreList" type="button">⏪ Restore an earlier save</button>${f?`<button class="ghost" data-fam="onlineOnly" type="button">${f.onlineOnly?'✅':'⬜'} Games only when online</button>`:''}</div>
   <p class="mini">Protections: one tab at a time · game time used can’t be reduced by older files · device-clock checks · hand-edited files are detected · 5 automatic backups. See ❓ Help → “Keeping it fair” and “Parental controls on your devices”.</p>
   <h4>Recent events</h4>${evts.length?`<ul class="fam-log">${evts.map(e=>`<li><span class="mini">${new Date(e.t).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span> ${esc(e.text)}${e.who?` <span class="mini">(${esc(e.who)})</span>`:''}</li>`).join('')}</ul>`:'<p class="mini">Nothing unusual.</p>'}`;}
 function refreshDashboard(){if(typeof Parent!=='undefined'&&get('parent')&&get('parent').open&&Parent.open)Parent.open('settings');}
 // ---------------- discreet grown-up shortcut straight into the games (Ctrl+Shift+G, or triple-tap the big title) ----------------
 function openGames(){const go=()=>{log('A grown-up opened the games');document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id!=='famDlg'&&d.close)d.close();});if(typeof Arcade!=='undefined')Arcade.open({admin:true});};
  if(ready()){ask('Open the games (grown-up)').then(ok=>{if(ok)go();});return;}
  if(typeof Admin!=='undefined'&&Admin.hasPin&&Admin.hasPin()){pinForm('');pending=ok=>{if(ok)go();};return;}
  setupForm('Set up family codes first — then this shortcut asks for your passphrase.');}
 function pinForm(err){show(`<h3>👪 Grown-up check</h3><p>Enter your Admin PIN to open the games.</p><input id="famPin" type="password" inputmode="numeric" autocomplete="off" placeholder="Admin PIN"><p class="plerr">${esc(err||'')}</p><div class="actions"><button class="primary" data-fam="pin" type="button">Continue</button><button class="ghost" data-fam="cancel" type="button">Cancel</button></div>`);}
 function checkPin(){if(Admin.pinOk(get('famPin').value)){hide();const r=pending;pending=null;if(r)r(true);}else{log('Wrong Admin PIN entered');pinForm('That isn’t right — try again.');}}
 let taps=[];function titleTap(e){if(!e.target.closest('.hero h1'))return;const now=Date.now();taps=taps.filter(t=>now-t<900);taps.push(now);if(taps.length>=3){taps=[];openGames();}}
 // ---------------- clicks ----------------
 function onClick(e){const b=e.target.closest('[data-fam]');if(!b)return;e.preventDefault();const a=b.dataset.fam;
  if(a==='check')checkPass();else if(a==='pin')checkPin();else if(a==='cancel')cancel();else if(a==='forgot')forgotForm('');else if(a==='rec')useRecovery();else if(a==='save')saveSetup();
  else if(a==='done'){if(!get('famDone').checked){toast('Please tick to confirm you’ve written down the recovery code.');return;}hide();toast('👪 Family codes are ready.');refreshDashboard();}
  else if(a==='setup')setup();else if(a==='unlockArcade')unlockArcade();else if(a==='lockNow'){ask('Lock the games').then(ok=>{if(ok){lockArcade('Locked by a grown-up');refreshDashboard();}});}
  else if(a==='admin'){ask('Open advanced settings').then(ok=>{if(ok){if(get('parent')&&get('parent').close)get('parent').close();Admin.open();}});}
  else if(a==='restoreList'){guard('Restore an earlier save',restoreList);}else if(a==='restore')restore(b.dataset.id);
  else if(a==='onlineOnly'){ask('Change “games only when online”').then(ok=>{if(ok){stats.family.onlineOnly=!stats.family.onlineOnly;log('Games only when online: '+(stats.family.onlineOnly?'on':'off'));save();refreshDashboard();}});}}
 function init(){document.addEventListener('click',onClick);document.addEventListener('click',titleTap);document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&(e.key==='G'||e.key==='g')){e.preventDefault();openGames();}});const d=dlg();d.addEventListener('keydown',e=>{if(e.key==='Enter'){if(get('famPass')&&e.target.id==='famPass')checkPass();else if(e.target.id==='famPin')checkPin();else if(e.target.id==='famRec')useRecovery();}});d.addEventListener('cancel',()=>{const r=pending;pending=null;if(r)r(false);});
  if(typeof stats!=='undefined'&&stats){mergeLedger(stats);if(stats.integrity===undefined)stats.integrity={lock:null,log:[]};}
  clockCheck();setInterval(clockCheck,60000);serverTime();setInterval(serverTime,15*60000);tabLock();storageSafety();
  setTimeout(()=>backup('When the app opened'),5000);setInterval(()=>{if(Date.now()-lastBackup>10*60000)backup();},60000);}
 return{openGames,init,ready,ask,guard,setup,secret,arcadeBlock,blockedCard,mergeLedger,sig,vetIncoming,newPlayer,log,lockArcade,dashboardHTML,backup,unlocked:()=>unlocked(),_restoreList:restoreList};
})();
