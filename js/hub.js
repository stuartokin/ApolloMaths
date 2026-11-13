'use strict';
// HUB: the child's home is organised into five areas — Today, Practise, Mock exam, Learn and Rewards — with one shown at a time.
// The existing panels are kept exactly as they are; this file tags each with its area, adds the navigation bar,
// a "next best thing" button, focus mode for questions, a ⚙️ menu for the header buttons and a compact save chip.
const Hub=(()=>{
 let ready=false,pending=null;
 const AREAS=[['today','🎯','Today'],['practise','✏️','Practise'],['mock','🏆','Mock exam'],['learn','📚','Learn'],['rewards','🎁','Rewards']];
 const sec=el=>el&&(el.closest('section')||el);
 function tag(){const T=(el,areas)=>{const s=sec(el);if(s)s.dataset.area=areas;};
  T(document.getElementById('planCard'),'today');T(document.getElementById('focusZone'),'today practise');T(document.getElementById('dashboard'),'today');
  T(document.getElementById('topics'),'practise mock');T(document.getElementById('mission'),'practise mock');T(document.getElementById('coach'),'practise');
  T(document.getElementById('modes'),'practise mock');T(document.getElementById('report'),'practise mock');
  T(document.getElementById('examNote'),'learn');T(document.getElementById('playerCard'),'rewards');T(document.getElementById('medals'),'rewards');T(document.getElementById('leaderboard'),'rewards');}
 function nav(){if(document.getElementById('hubNav'))return;const n=document.createElement('nav');n.id='hubNav';n.className='hub-nav';n.setAttribute('aria-label','Areas');
  n.innerHTML=AREAS.map(([k,i,l])=>`<button type="button" data-area-go="${k}"><span aria-hidden="true">${i}</span> ${l}</button>`).join('');
  const st=document.querySelector('section.stats');(st||document.querySelector('header.hero')).insertAdjacentElement('afterend',n);
  // Today: one big "next best thing"
  const lay=document.querySelector('.layout');if(lay&&!document.getElementById('nextBest')){const c=document.createElement('section');c.id='nextBest';c.className='panel next-best';c.dataset.area='today';c.innerHTML=`<h2>🎯 Next best thing</h2><p id="nextBestTxt" class="mini"></p><button type="button" class="primary big" id="nextBestGo">▶ Let’s go!</button>`;lay.insertAdjacentElement('afterbegin',c);
   c.querySelector('#nextBestGo').addEventListener('click',()=>{const go=[...document.querySelectorAll('#planCard button')].find(b=>/^\s*go\s*$/i.test(b.textContent)&&!b.disabled);if(go){go.click();}else{const m=document.querySelector('[data-level="match"]');if(m)m.click();}show('practise');});}
  // Learn: a way into the lessons
  if(lay&&!document.getElementById('learnCard')){const c=document.createElement('section');c.id='learnCard';c.className='panel';c.dataset.area='learn';c.innerHTML=`<h2>📚 Learn</h2><p class="mini">Step-by-step lessons and explainers for every topic.</p><button type="button" class="primary" id="learnGo">📘 Open the lessons</button>`;lay.insertAdjacentElement('afterbegin',c);
   c.querySelector('#learnGo').addEventListener('click',()=>{try{if(typeof Learn!=='undefined'&&Learn.open)Learn.open();}catch(e){}});}
  n.addEventListener('click',e=>{const b=e.target.closest('[data-area-go]');if(!b)return;const k=b.dataset.areaGo;if(k==='mock'){const m=document.querySelector('[data-mode="mock"]');if(m&&!m.classList.contains('active'))m.click();}show(k);});}
 function nextText(){const t=document.getElementById('nextBestTxt');if(!t)return;const row=[...document.querySelectorAll('#planCard button')].find(b=>/^\s*go\s*$/i.test(b.textContent)&&!b.disabled);
  let label='';if(row){const box=(row.closest('li,tr,div')||row.parentElement).cloneNode(true);box.querySelectorAll('button,input').forEach(x=>x.remove());label=box.textContent.replace(/[☐☑✅]/g,'').replace(/\s+/g,' ').trim();}t.textContent=label?`Next on today’s plan: ${label.slice(0,90)}`:'Today’s plan is done — keep your streak going with a Match-day challenge!';}
 function show(k){document.body.classList.add('hub');document.body.dataset.areaNow=k;document.querySelectorAll('[data-area]').forEach(el=>el.classList.toggle('area-on',el.dataset.area.split(' ').includes(k)));
  document.querySelectorAll('[data-area-go]').forEach(b=>b.classList.toggle('active',b.dataset.areaGo===k));try{sessionStorage.setItem('am-area',k);}catch(e){}if(k==='today')nextText();
  if(k!=='practise'&&k!=='mock')document.body.classList.remove('focusq');window.scrollTo({top:0,behavior:'smooth'});}
 // starting practice from anywhere jumps to the Practise area
 function autoSwitch(){document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;
  if(b.closest('#planCard,#focusZone,#topics,#levels,#modes')){setTimeout(()=>{const now=document.body.dataset.areaNow;if(now!=='practise'&&now!=='mock')show(b.closest('#modes')&&b.dataset.mode==='mock'?'mock':'practise');if(window.innerWidth<760)document.body.classList.add('focusq');},0);}},true);}
 // focus mode: the question takes the whole width
 function focusBtn(){const m=document.getElementById('mission');if(!m||document.getElementById('focusBtn'))return;const b=document.createElement('button');b.type='button';b.id='focusBtn';b.className='ghost focus-btn';
  const lbl=()=>{b.textContent=document.body.classList.contains('focusq')?'◀ Show missions':'⛶ Focus on the question';};lbl();b.addEventListener('click',()=>{document.body.classList.toggle('focusq');lbl();});m.insertAdjacentElement('afterbegin',b);
  new MutationObserver(lbl).observe(document.body,{attributes:true,attributeFilter:['class']});}
 // the header: a ⚙️ menu for the buttons
 function menu(){const w=document.querySelector('.whoplays');if(!w||document.getElementById('hubMenuBtn'))return;const btn=document.createElement('button');btn.type='button';btn.className='heroBtn';btn.id='hubMenuBtn';btn.textContent='⚙️ Menu';btn.setAttribute('aria-expanded','false');
  const pop=document.createElement('div');pop.id='hubMenu';pop.className='hub-menu hidden';['#switchPlayer','[data-help="guide"]','#muteBtn','#voiceBtn','#installBtn'].forEach(sel=>{const el=w.querySelector(sel);if(el)pop.appendChild(el);});
  w.appendChild(btn);w.appendChild(pop);btn.addEventListener('click',e=>{e.stopPropagation();pop.classList.toggle('hidden');btn.setAttribute('aria-expanded',String(!pop.classList.contains('hidden')));});
  document.addEventListener('click',e=>{if(!pop.contains(e.target)&&e.target!==btn)pop.classList.add('hidden');});pop.addEventListener('click',e=>{if(e.target.closest('button'))setTimeout(()=>pop.classList.add('hidden'),0);});}
 // the save banner shrinks to a chip once progress is saved
 function saveChip(){const bar=document.getElementById('saveBar'),t=document.getElementById('saveTitle');if(!bar||!t)return;const upd=()=>{const ok=/saved/i.test(t.textContent)&&!/not saved/i.test(t.textContent);bar.classList.toggle('compact',ok&&!bar.dataset.open);};
  upd();new MutationObserver(upd).observe(t,{childList:true,characterData:true,subtree:true});bar.addEventListener('click',e=>{if(bar.classList.contains('compact')){bar.dataset.open='1';bar.classList.remove('compact');setTimeout(()=>{delete bar.dataset.open;upd();},15000);}});}
 // a new question appearing after start-up — from a lesson, the Fix-it list, a parent link or anywhere — brings Practise into view
 function followQuestions(){const m=document.getElementById('mission');if(!m)return;const t0=Date.now();let last='';const qtext=()=>{const q=m.querySelector('.qwrap');return q?q.textContent.slice(0,200):'';};last=qtext();
  new MutationObserver(()=>{const now=qtext();if(now===last)return;const first=!last;last=now;if(first)return;const a=document.body.dataset.areaNow;if(a!=='practise'&&a!=='mock')show(typeof mode!=='undefined'&&mode==='mock'?'mock':'practise');}).observe(m,{childList:true,subtree:true,characterData:true});}
 // the app's own "start practising" actions always bring Practise into view
 function hookStarts(){['pickTopic','practiseLike','restartSession'].forEach(n=>{const f=window[n];if(typeof f!=='function'||f.__hub)return;const w=function(...a){const r=f.apply(this,a);const want=typeof mode!=='undefined'&&mode==='mock'?'mock':'practise';if(!ready){pending=want;return r;}const now=document.body.dataset.areaNow;if(now!=='practise'&&now!=='mock')show(want);return r;};w.__hub=true;window[n]=w;});}
 function init(){try{tag();nav();focusBtn();menu();saveChip();autoSwitch();followQuestions();hookStarts();let k='today';try{k=sessionStorage.getItem('am-area')||'today';}catch(e){}ready=true;show(pending||k);}catch(e){console.warn('hub',e);}}
 hookStarts();   // straight away, so practice started before the page finishes loading still lands in Practise
 return{init,show};})();
window.addEventListener('load',()=>setTimeout(()=>Hub.init(),50));
