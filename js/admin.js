'use strict';
// PRESENTATION + INTERACTION: the hidden Admin area (opened with the admin secret word, then a PIN).
// The PIN and secret words are stored on this device only as salted SHA-256 hashes — never as readable text.
// Note: this is family-level protection, not bank-level security: the site's code is public and a determined
// person with browser developer tools could still change things.
const Admin=(()=>{
 const KEY='apollo-maths-admin';
 let unlockedUntil=0,tab='rules',who=null,after=null,err='';
 const dlg=()=>get('admin');
 const store=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}};
 const put=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
 const fmtM=s=>Math.round(s/60)+' min';
 const isUnlocked=()=>Date.now()<unlockedUntil;
 // ---- secret words ----
 function secret(text){const raw=String(text||'').trim();const fr=typeof Family!=='undefined'?Family.secret(raw):undefined;if(fr!==undefined)return fr;if(validCode(raw)){const st=store(),h=wordHash(raw);if(h===(st.adminNumHash||DEFAULT_WORDS.adminNum))return'admin';if(h===(st.kidNumHash||DEFAULT_WORDS.kidNum))return'kid';return null;}
  const h=wordHash(text);if(!h||normWord(text).length<4)return null;const st=store();
  if(h===(st.adminHash||DEFAULT_WORDS.admin))return'admin';if(h===(st.kidHash||DEFAULT_WORDS.kid))return'kid';return null;}
 // ---- PIN ----
 function gate(){const st=store(),now=Date.now();if(st.failUntil&&now<st.failUntil)return `<div class="arc-card"><h3>🔒 Too many tries</h3><p>Try again in ${Math.ceil((st.failUntil-now)/1000)} seconds.</p></div>`;
  return st.pinHash?`<div class="arc-card"><h3>🔐 Admin PIN</h3><input id="pinIn" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="PIN" aria-label="Admin PIN"><p class="plerr">${esc(err)}</p><button class="primary" data-adm="pin" type="button">Unlock</button></div>`
   :`<div class="arc-card"><h3>🔐 Create your admin PIN</h3><p class="mini">4 to 8 digits. You’ll need it to change settings. It is stored scrambled on this device.</p><input id="pinNew" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN" aria-label="New PIN"><input id="pinNew2" type="password" inputmode="numeric" maxlength="8" placeholder="Type it again" aria-label="Repeat PIN"><p class="plerr">${esc(err)}</p><button class="primary" data-adm="setpin" type="button">Save PIN</button></div>`;}
 function checkPin(){const st=store(),v=get('pinIn').value;if(pinHash(v,st.salt)===st.pinHash){st.fails=0;st.failUntil=0;put(st);unlockedUntil=Date.now()+15*60000;err='';const f=after;after=null;if(f){close();f();}else render();}
  else{st.fails=(st.fails||0)+1;if(st.fails>=3){st.failUntil=Date.now()+60000;st.fails=0;}put(st);err='That PIN isn’t right.';render();}}
 function setPin(){const a=get('pinNew').value,b=get('pinNew2').value;if(!/^\d{4,8}$/.test(a)){err='Use 4 to 8 digits.';render();return;}if(a!==b){err='The two PINs don’t match.';render();return;}
  const st=store();st.salt=Math.random().toString(36).slice(2)+Date.now().toString(36);st.pinHash=pinHash(a,st.salt);put(st);unlockedUntil=Date.now()+15*60000;err='';toast('🔐 Admin PIN saved on this device.');render();}
 // ---- player settings helpers ----
 const players=()=>Storage.profiles();
 const cur=()=>Storage.current();
 function load(id){const c=cur();return c&&c.id===id?stats:cleanStats(Storage.readProfile(id).stats);}
 function store2(id,s){const c=cur();if(c&&c.id===id){save();}else Storage.writeProfile(id,{stats:s});}
 const pick2=()=>`<label class="adm-who">Player <select id="admWho">${players().map(p=>`<option value="${p.id}"${p.id===who?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label>`;
 function rulesTab(){const s=load(who),a=s.arcade.settings,st=arcadeStatus(s),dn=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],cfg=!!(window.APP_CONFIG&&window.APP_CONFIG.arcade);
  const num=(id,label,v,min,max,unit)=>`<label>${label}<span><input type="number" id="${id}" value="${v}" min="${min}" max="${max}" inputmode="numeric"> ${unit}</span></label>`;
  return `${pick2()}<p class="mini">Site switch in <code>config.js</code>: <b>${cfg?'ON':'OFF'}</b>${cfg?'':' — the arcade is off for everyone until it is switched on there.'}</p>
  <div class="adm-status">${st.canPlay?'🟢 Can play now':'🔴 Can’t play now'} · today ${fmtM(st.usedDay)} used, ${fmtM(st.dayLeft)} left · this week ${fmtM(st.usedWeek)} used · learning today ${fmtM(st.learnSecs)}${st.earned!==null?` · earned ${fmtM(Math.max(0,st.earned-st.usedDay))}`:''}${st.breakLeft?` · on a break for ${Math.ceil(st.breakLeft/60)} min`:''}${st.bank?` · ${fmtM(st.bank)} saved from last time`:''}</div>
  <div class="adm-grid">
   <fieldset><legend>Switch</legend><label class="chk"><input type="checkbox" id="aEnabled"${a.enabled?' checked':''}> Arcade allowed for this player</label><label class="chk"><input type="checkbox" id="aExam"${a.examLock?' checked':''}> No arcade on exam day (${esc(s.exam.date)})</label></fieldset>
   <fieldset><legend>Before playing, today they must…</legend>${num('aUnlockMins','Learn / answer questions for',a.unlockMins,0,240,'min')}${num('aUnlockCorrect','Get questions right',a.unlockCorrect,0,200,'')}${num('aUnlockFocus','Get Focus Zone questions right',a.unlockFocus,0,200,'')}<label class="chk"><input type="checkbox" id="aLesson"${a.needLesson?' checked':''}> Finish a Learn mission</label><label class="chk"><input type="checkbox" id="aPlan"${a.needPlan?' checked':''}> Complete Today’s plan</label></fieldset>
   <fieldset><legend>How play time is given</legend><label class="chk"><input type="radio" name="aMode" value="earned"${a.mode==='earned'?' checked':''}> Earned from learning</label>${num('aEarn','1 minute of play for every',a.earnPer,1,20,'min of learning')}<label class="chk"><input type="radio" name="aMode" value="fixed"${a.mode==='fixed'?' checked':''}> A fixed amount once unlocked (up to the daily limit)</label></fieldset>
   <fieldset><legend>Limits</legend>${num('aSession','Longest session',a.sessionMins,1,120,'min')}${num('aBreak','Break between sessions',a.breakMins,0,600,'min')}${num('aDay','Most per day',a.dayMins,0,600,'min')}${num('aWeek','Most per week (Mon–Sun)',a.weekMins,0,3000,'min')}</fieldset>
   <fieldset><legend>Unplayed time</legend><label class="chk"><input type="checkbox" id="aCarry"${a.carry?' checked':''}> Save unplayed arcade time for the next session (so it isn’t missed)</label>${num('aMaxCarry','Most that can be saved',a.maxCarryMins,0,240,'min')}<p class="mini">If the arcade is left early, the rest of that session is saved. Next session it is added on — and if that’s on a later day, it’s added on top of that day’s limits.</p></fieldset>
   <fieldset><legend>⏱️ Session clock</legend>${num('aResume','Carry on the same session if the app is reopened within',a.resumeMins,0,240,'min')}<p class="mini">After a refresh or reload within this time, the session clock carries on. 0 = always start a new session.</p></fieldset>
   <fieldset><legend>When</legend><div class="adm-days">${dn.map((d,i)=>`<label class="chk"><input type="checkbox" data-day="${i}"${a.days[i]?' checked':''}> ${d}</label>`).join('')}</div><label>Open from <span><input type="time" id="aFrom" value="${a.from}"> to <input type="time" id="aTo" value="${a.to}"></span></label></fieldset>
  </div>
  <div class="actions"><button class="primary" data-adm="saverules" type="button">💾 Save rules</button><button class="ghost" data-adm="defaults" type="button">Restore defaults</button></div>
  <h3>Today only</h3><div class="actions"><button class="secondary" data-bonus="5" type="button">+5 min treat</button><button class="secondary" data-bonus="10" type="button">+10 min</button><button class="secondary" data-bonus="15" type="button">+15 min</button><button class="ghost" data-adm="resetday" type="button">Reset today’s play</button><button class="ghost" data-adm="endbreak" type="button">End the break now</button><button class="ghost" data-adm="clearbank" type="button">Clear saved time</button></div>
  ${a.bonusDay===dayKey()&&a.bonusMins?`<p class="mini">Extra today: ${a.bonusMins} min.</p>`:''}`;}
 function historyTab(){const s=load(who),P=s.arcade.plays,days={};for(const p of P){const k=dayKey(new Date(p.t));(days[k] ||= {n:0,secs:0,best:0});days[k].n++;days[k].secs+=p.secs;days[k].best=Math.max(days[k].best,p.score);}
  const row=(c)=>`<tr>${c.map(x=>`<td>${x}</td>`).join('')}</tr>`;
  return `${pick2()}<p class="mini">High scores — ${[["player","Invaders (my player)"],["classic","Invaders (classic)"],...GAME_LIST.slice(1).map(g=>[g.id,g.name])].map(([k,n])=>`${n}: <b>${(s.arcade.high[k]||0).toLocaleString('en-GB')}</b>`).join(' · ')}</p><h3>By day</h3><div class="tablewrap"><table class="ptable"><thead><tr><th>Day</th><th>Sessions</th><th>Minutes</th><th>Best score</th></tr></thead><tbody>${Object.keys(days).sort().reverse().map(k=>row([new Date(k+'T12:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}),days[k].n,Math.round(days[k].secs/60),days[k].best])).join('')||'<tr><td colspan="4" class="muted">No games yet.</td></tr>'}</tbody></table></div>
  <h3>Recent games</h3><div class="tablewrap"><table class="ptable"><thead><tr><th>When</th><th>Game</th><th>Time</th><th>Score</th><th>Level</th><th>Ended</th></tr></thead><tbody>${P.slice(-30).reverse().map(p=>row([new Date(p.t).toLocaleString('en-GB',{weekday:'short',hour:'2-digit',minute:'2-digit'}),(GAME_LIST.find(g=>g.id===p.game)||GAME_LIST[0]).name+(p.game==='invaders'||!p.game?(p.theme==='classic'?' (classic)':' (my player)'):''),Math.round(p.secs/60*10)/10+' min',p.score.toLocaleString('en-GB'),p.wave,{time:'Time up',gameover:'Game over',stopped:'Stopped'}[p.end]||p.end])).join('')||'<tr><td colspan="6" class="muted">No games yet.</td></tr>'}</tbody></table></div>`;}
 function wordsTab(){if(typeof Family!=='undefined'&&Family.ready())return `<div class="arc-card"><h3>👪 Family codes are in use</h3><p>The child’s secret word, number code and your parent passphrase are now set in the <b>Parent dashboard → Settings → Fair play &amp; safety</b>. The old codes no longer work.</p><button class="primary" data-fam="setup" type="button">Change family codes</button></div>`;return `<p class="mini">Secret words are typed into the answer box and sent with SHOOT (or typed anywhere on a computer). Spaces and capitals don’t matter. They are stored scrambled <b>on this device</b> — on another device, set them again (or the defaults apply).</p>
  <label class="adm-line">Arcade word (for ${esc(cur()?cur().name:'the player')})<span><input id="wKid" autocomplete="off" placeholder="New arcade word"><button class="secondary" data-adm="kid" type="button">Save</button></span></label>
  <label class="adm-line">Admin word (yours)<span><input id="wAdmin" autocomplete="off" placeholder="New admin word"><button class="secondary" data-adm="adminword" type="button">Save</button></span></label>
  <p class="mini"><b>Number codes</b> work on tablets that only show a number keypad. They must start with <b>00</b> and be 6–10 digits long (a real answer never starts with 00).</p>
  <label class="adm-line">Arcade number code<span><input id="cKid" inputmode="numeric" autocomplete="off" placeholder="e.g. 00…"><button class="secondary" data-adm="kidcode" type="button">Save</button></span></label>
  <label class="adm-line">Admin number code<span><input id="cAdmin" inputmode="numeric" autocomplete="off" placeholder="e.g. 00…"><button class="secondary" data-adm="admincode" type="button">Save</button></span></label>
  <label class="adm-line">Admin PIN<span><input id="wPin" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN (4–8 digits)"><button class="secondary" data-adm="newpin" type="button">Save</button></span></label>`;}
 function locksTab(){const st=store();return `<label class="chk"><input type="checkbox" id="lParent"${st.lockParent?' checked':''}> The Parent dashboard needs the PIN</label><label class="chk"><input type="checkbox" id="lReset"${st.lockReset?' checked':''}> “Reset saved progress” needs the PIN</label><div class="actions"><button class="primary" data-adm="locks" type="button">💾 Save</button></div>`;}
 function playTab(){return `<p>Play without limits. Your games aren’t counted against anyone’s allowance.</p><div class="actions"><button class="primary" data-adm="play" type="button">🕹️ Open the arcade (admin)</button></div>`;}
 function render(){const d=dlg();d.querySelector('.adm-tabs').classList.toggle('hidden',!isUnlocked());d.querySelectorAll('[data-atab]').forEach(b=>b.classList.toggle('active',b.dataset.atab===tab));
  if(!who||!players().some(p=>p.id===who))who=cur()?cur().id:(players()[0]||{}).id;
  d.querySelector('.adm-body').innerHTML=!isUnlocked()?gate():{rules:rulesTab,history:historyTab,words:wordsTab,locks:locksTab,play:playTab}[tab]();}
 function readRules(){const v=id=>+get(id).value,a={enabled:get('aEnabled').checked,examLock:get('aExam').checked,unlockMins:v('aUnlockMins'),unlockCorrect:v('aUnlockCorrect'),unlockFocus:v('aUnlockFocus'),needLesson:get('aLesson').checked,needPlan:get('aPlan').checked,
  mode:(dlg().querySelector('input[name=aMode]:checked')||{}).value||'earned',earnPer:v('aEarn'),sessionMins:v('aSession'),breakMins:v('aBreak'),dayMins:v('aDay'),weekMins:v('aWeek'),days:[...dlg().querySelectorAll('[data-day]')].map(c=>c.checked?1:0),from:get('aFrom').value,to:get('aTo').value,carry:get('aCarry').checked,maxCarryMins:v('aMaxCarry'),resumeMins:v('aResume')};return a;}
 function apply(fn){const s=load(who);fn(s);cleanArcade(s);store2(who,s);}
 function onClick(e){const b=e.target.closest('button');if(!b||!dlg().contains(b))return;const a=b.dataset.adm;
  if(b.dataset.close!==undefined){close();return;}
  if(b.dataset.atab){tab=b.dataset.atab;render();return;}
  if(a==='pin'){checkPin();return;}if(a==='setpin'){setPin();return;}
  if(!isUnlocked()){render();return;}unlockedUntil=Date.now()+15*60000;
  if(a==='saverules'){const r=readRules();apply(s=>{const keep={bonusDay:s.arcade.settings.bonusDay,bonusMins:s.arcade.settings.bonusMins};s.arcade.settings={...r,...keep};});toast('🕹️ Arcade rules saved.');render();}
  else if(a==='defaults'){apply(s=>{s.arcade.settings={...ARCADE_DEFAULTS};});toast('Defaults restored.');render();}
  else if(b.dataset.bonus){const m=+b.dataset.bonus;apply(s=>{const st=s.arcade.settings;if(st.bonusDay!==dayKey()){st.bonusDay=dayKey();st.bonusMins=0;}st.bonusMins+=m;});toast(`🎁 +${m} arcade minutes today.`);render();}
  else if(a==='resetday'){apply(s=>{delete s.arcade.used[dayKey()];s.arcade.lastEnd=0;});toast('Today’s arcade time reset.');render();}
  else if(a==='endbreak'){apply(s=>{s.arcade.lastEnd=0;});toast('Break ended.');render();}
  else if(a==='clearbank'){apply(s=>{s.arcade.bank={secs:0,day:''};});toast('Saved arcade time cleared.');render();}
  else if(a==='kid'||a==='adminword'){const v=get(a==='kid'?'wKid':'wAdmin').value;if(normWord(v).length<4){toast('Use at least 4 letters or numbers.');return;}const st=store(),h=wordHash(v);if(h===(a==='kid'?(st.adminHash||DEFAULT_WORDS.admin):(st.kidHash||DEFAULT_WORDS.kid))){toast('The two secret words must be different.');return;}st[a==='kid'?'kidHash':'adminHash']=h;put(st);toast(a==='kid'?'🤫 Arcade word saved.':'🔑 Admin word saved.');render();}
  else if(a==='kidcode'||a==='admincode'){const v=get(a==='kidcode'?'cKid':'cAdmin').value.trim();if(!validCode(v)){toast('Number codes must start with 00 and be 6–10 digits.');return;}const st=store(),h=wordHash(v);if(h===(a==='kidcode'?(st.adminNumHash||DEFAULT_WORDS.adminNum):(st.kidNumHash||DEFAULT_WORDS.kidNum))){toast('The two number codes must be different.');return;}st[a==='kidcode'?'kidNumHash':'adminNumHash']=h;put(st);toast(a==='kidcode'?'🤫 Arcade number code saved.':'🔑 Admin number code saved.');render();}
  else if(a==='newpin'){const v=get('wPin').value;if(!/^\d{4,8}$/.test(v)){toast('Use 4 to 8 digits.');return;}const st=store();st.salt=Math.random().toString(36).slice(2)+Date.now().toString(36);st.pinHash=pinHash(v,st.salt);put(st);toast('🔐 New PIN saved.');render();}
  else if(a==='locks'){const st=store();st.lockParent=get('lParent').checked;st.lockReset=get('lReset').checked;put(st);toast('🔒 Locks saved.');}
  else if(a==='play'){close();Arcade.open({admin:true});}}
 function open(t='rules'){if(typeof Family!=='undefined'&&Family.ready()&&!isUnlocked()){Family.ask('Open advanced settings').then(ok=>{if(ok){unlockedUntil=Date.now()+15*60000;open(t);}});return;}tab=t;err='';render();const d=dlg();if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');setTimeout(()=>{const i=get('pinIn')||get('pinNew');if(i)i.focus();},50);}
 function close(){const d=dlg();if(d.close)d.close();else d.removeAttribute('open');}
 // Ask for the PIN before something locked (Parent dashboard / reset). Runs fn straight away if unlocked or not locked.
 function guard(what,fn){if(typeof Family!=='undefined'&&Family.ready()){const st0=store();if(what==='lockReset'||st0[what])Family.ask(what==='lockReset'?'Clear this player’s progress':'Open the Parent dashboard').then(ok=>{if(ok)fn();});else fn();return;}const st=store();if(!st[what]||!st.pinHash||isUnlocked()){fn();return;}after=fn;tab='rules';err='';open();}
 function init(){const d=dlg();d.addEventListener('click',onClick);d.addEventListener('change',e=>{if(e.target.id==='admWho'){who=e.target.value;render();}});
  d.addEventListener('keydown',e=>{if(e.key==='Enter'){if(get('pinIn')&&e.target.id==='pinIn')checkPin();else if(e.target.id==='pinNew2')setPin();}});}
 const locked=what=>{if(typeof Family!=='undefined'&&Family.ready())return what==='lockParent'?!!store().lockParent&&!Family.unlocked():false;const st=store();return !!(st[what]&&st.pinHash&&!isUnlocked());};
 const hasPin=()=>!!store().pinHash,pinOk=v=>{const st=store();return !!st.pinHash&&pinHash(v,st.salt)===st.pinHash;};
 return{init,open,secret,guard,locked,hasPin,pinOk};
})();
