'use strict';
// PRESENTATION: the welcome screen and the guided tours (one for players, one for grown-ups).
// Each step spotlights a real part of the page with a speech bubble. Choices are saved in stats.tutorial
// (so they live in the browser AND in the player's progress file). Tours can be rerun from ❓ Help.
const Tour=(()=>{
 let steps=[],i=0,kind='player',ov=null,hole=null,bub=null,active=false,offered=false;
 const find=sel=>typeof sel==='function'?sel():document.querySelector(sel);
 const panel=sel=>()=>{const e=document.querySelector(sel);return e&&(e.closest('.panel')||e);};
 const byTitle=t=>()=>{const h=[...document.querySelectorAll('main h2')].find(x=>x.textContent.includes(t));return h&&h.closest('.panel');};
 const visible=e=>e&&e.offsetParent!==null&&!e.classList.contains('hidden');
 function playerSteps(){const n=esc(playerName());return[
  {title:`Hi ${n}! 👋 Let’s look around`,text:`This is <b>your</b> maths training ground for the Tiffin Stage 2 exam. Every question you get right earns <b>⚡ power points</b>, wins medals and unlocks cool stuff. Use <b>Next</b> (or the → key) to follow the tour.`},
  {el:'.whoplays',title:'Your name, clock and Help',text:'Here’s who is playing (tap <b>🔁 Switch player</b> to swap), the <b>⏱️ clock</b> for this session and in total, and <b>❓ Help</b> if you ever get stuck — you can rerun this tour from there too.'},
  {el:'#playerCard',title:'🧍 My player',text:`This is your footballer! It shows your <b>⚡ to spend</b>, your next goal, and the <b>🎁 daily bonus</b> (get ${REWARDS.dailyTarget} right today for +${REWARDS.dailyBonus} ⚡). Tap <b>🎨 Change my look</b> to change your style or your name.`},
  {el:'#openShop',title:'🛍️ The Kit Shop',text:'Spend your ⚡ on kits, boots, hats, sidekicks, celebrations, titles, frames, amazing <b>experiences</b> and <b>Maths Legend cards</b>. <b>🔥 For you</b> shows things you can buy now or very soon, and there’s a <b>deal of the day</b>. Points only come from doing maths — no real money, ever.'},
  {el:'#planCard',title:'📅 Today’s plan',text:'The countdown to the exam and a few small jobs for today. Finish them all for a <b>+30 ⚡ bonus</b>. The bars show how ready you are in each Focus topic, and the <b>🔧 Fix-it list</b> brings back questions you found tricky until you’ve nailed them.'},
  {el:'#mission',title:'⚽ Answering questions',text:'Read the question, type your answer in the box and press <b>SHOOT!</b> (or Enter). For fractions type <b>3/4</b> — you’ll see it written properly, like on the real paper. For times use the 24-hour clock, like 13:05. Right first time earns the most ⚡!'},
  {el:()=>{const b=get('explainBtn');return b&&b.closest('.actions');},title:'🆘 Stuck? Get help',text:'<b>💡 Hint</b> gives a nudge. <b>🧒 Explain it simply</b> puts the question into everyday words. <b>📖 Teach me the method</b> shows every step — then try <b>🔁 Prove it!</b> for bonus ⚡. <b>✏️ Scratchpad</b> lets you draw your working. When you’re right, <b>Next Question</b> lights up green.'},
  {el:'#focusZone',title:'⭐ The Focus Zone',text:'Your five most important topics. <b>📘 Learn</b> teaches the trick step by step (read carefully — the check unlocks after you’ve read it), <b>🎲 Examples</b> shows worked examples, and <b>⚽ Practise</b> gives you questions. Focus questions earn <b>bonus ⚡</b>, streaks and mastery rewards.'},
  {el:panel('#modes'),title:'🎮 Game modes and timed tests',text:'<b>⚽ 10-question match</b> with coaching, <b>⚡ 5-minute sprint</b>, the <b>🏆 40-question mock</b> — a timed test (50 minutes, no hints) just like exam practice — and <b>🚀 Endless practice</b>. <b>Warm-up / Match day / Boss</b> change how hard it is. <b>🖨️ Print a paper mock</b> to practise writing answers on paper, like the real Stage 2 test.'},
  {el:panel('#topics'),title:'🏟️ Pick your mission',text:'Choose <b>any topic</b> to practise, <b>All maths — mixed</b>, the <b>⭐ Focus mix</b> or your <b>🔧 Fix-it list</b>. Below, the <b>🧠 Coach’s playbook</b> gives tips for whatever you’re working on.'},
  {el:byTitle('Match centre'),title:'🎯 Match centre',text:'Your score for the current match or mock — questions done, right first time, points and time.'},
  {el:panel('#medals'),title:'🏆 Medals',text:'Win medals for streaks, first buys, finishing mocks and more. How many can you collect?'},
  {el:'#leaderboard',skip:e=>!visible(e),title:'🏆 Leaderboard',text:'If friends play on this device, see who has the most ⚡, right answers or the best mock score!'},
  {el:'#saveBar',title:'💾 Save your progress',text:'Your progress is kept in this browser. Tap <b>💾 Save progress</b> to keep a copy in a file too — on Chrome or Edge it then saves itself after every answer.'},
  {title:`You’re ready, ${n}! 🚀`,text:'Time to smash some maths. Every right answer counts — good luck! You can take this tour again any time from <b>❓ Help</b>.',finale:true}];}
 function parentSteps(){const n=esc(playerName());return[
  {title:'Welcome, grown-ups 👪',text:`A quick tour of the parts of the app that are for you: following ${n}’s progress, choosing what to focus on, printouts, saving, and the optional hidden reward games.`},
  {el:panel('#dashboardToggle'),title:'👪 Parent dashboard',text:'Tabs for: <b>overview</b> (time and accuracy), <b>🎯 Focus areas</b> (choose the five Focus topics — the app suggests five from the scores), <b>🧠 learning</b> (lessons read and checks passed), <b>time</b> (questions / learning / shop / arcade), <b>topics</b>, <b>question types & mistakes</b> (including wrong answers typed), <b>mocks</b>, <b>shop</b>, the <b>activity log</b> and <b>settings</b> (exam date, CSV exports and a printable report).'},
  {el:panel('#modes'),title:'🏆 Timed tests and printouts',text:'The <b>40-question mock</b> is a timed online test (50 minutes, no hints). <b>🖨️ Print a paper mock</b> makes a 25-question Stage 2-style paper with working space and a <b>mark scheme</b> — record the score in Parent dashboard → Mocks. The dashboard’s Settings tab also prints a <b>progress report</b>.'},
  {el:'#focusZone',title:'⭐ Focus areas',text:'These five topics get Learn missions, worked examples, practice, bonus points and readiness tracking. Change them in Parent dashboard → <b>🎯 Focus areas</b>. Learning points are only given for proof of learning — leaving the app open earns nothing.'},
  {el:'#saveBar',title:'💾 Progress files',text:'Each child has their own progress file. On Chrome or Edge on a computer it saves automatically after every answer; on iPad/Safari it downloads, and this bar shows when there’s newer progress to save. <b>📂 Open progress file</b> loads it on another device.'},
  {el:'#switchPlayer',title:'🔁 Players',text:'Friends or siblings can have their own player with their own name, points, kit, Focus areas and file. With two or more players there’s a friendly leaderboard.'},
  {title:'🕹️ Hidden games and Admin',text:'There is an optional <b>secret arcade</b> of retro games as a reward. It only unlocks after learning or questions, play time is earned, and you control the limits (session length, breaks, daily and weekly time, days and hours) in a PIN-protected <b>Admin</b> area — which can also lock the Parent dashboard. The whole arcade can be switched off. 🔑 For the passcodes, contact Stuart at <a href="mailto:stuart@horizonqltd.com">stuart@horizonqltd.com</a>.'},
  {el:()=>document.querySelector('.whoplays [data-help]'),title:'❓ Help',text:'The full guide, the version history and both tours live here.',finale:true}];}
 function build(k){return(k==='parent'?parentSteps():playerSteps()).filter(s=>{if(!s.el)return true;const e=find(s.el);return e&&!(s.skip&&s.skip(e))&&e.getClientRects().length;});}
 // ---------- drawing ----------
 function mount(){ov=document.createElement('div');ov.className='tour-ov';hole=document.createElement('div');hole.className='tour-hole';bub=document.createElement('div');bub.className='tour-bub';bub.setAttribute('role','dialog');bub.setAttribute('aria-live','polite');
  document.body.append(ov,hole,bub);bub.addEventListener('click',onClick);}
 function unmount(){[ov,hole,bub].forEach(e=>e&&e.remove());ov=hole=bub=null;}
 function show(){const s=steps[i],el=s.el?find(s.el):null;
  bub.innerHTML=`<div class="tb-top"><span class="tb-step">${kind==='parent'?'👪 Grown-ups’ tour':'🎓 Tour'} · ${i+1} of ${steps.length}</span><button class="tb-x" data-t="end" type="button" aria-label="End the tour">✕</button></div>
   <div class="tb-dots">${steps.map((_,j)=>`<span class="${j<i?'ok':j===i?'now':''}"></span>`).join('')}</div><h3>${s.title}</h3><p>${s.text}</p>
   <div class="tb-btns">${i>0?'<button class="ghost" data-t="back" type="button">◀ Back</button>':''}<button class="primary next-ready" data-t="next" type="button">${i+1<steps.length?'Next ▶':(kind==='parent'?'Finish ✓':'Let’s go! 🚀')}</button></div>
   ${i+1<steps.length?'<button class="linkbtn tb-skip" data-t="end" type="button">Skip the tour</button>':''}`;
  if(el){el.scrollIntoView({block:'start'});window.scrollBy(0,innerWidth<=700?-70:-24);}
  bub.style.maxHeight=(innerHeight-16)+'px';
  requestAnimationFrame(()=>place(el));setTimeout(()=>{const b=bub&&bub.querySelector('[data-t="next"]');if(b)b.focus({preventScroll:true});},60);}
 function place(el){if(!bub)return;const vw=innerWidth,vh=innerHeight,small=vw<=700;bub.style.maxHeight=(vh-16)+'px';
  if(!el){hole.classList.add('hidden');ov.classList.add('dim');bub.style.cssText='';bub.style.maxHeight=(vh-16)+'px';bub.classList.add('centre');return;}
  ov.classList.remove('dim');hole.classList.remove('hidden');bub.classList.remove('centre');
  const r=el.getBoundingClientRect(),p=8,top=Math.max(4,r.top-p),left=Math.max(4,r.left-p);let right=Math.min(vw-4,r.right+p);
  // Short, wide screens (a phone held sideways): dock the bubble on the right and spotlight the part of the item to its left.
  if(vh<520&&vw>=600){const w=Math.min(380,Math.round(vw*.46));bub.style.width=w+'px';const bx=vw-w-8;right=Math.min(right,bx-10);const bottom=Math.min(vh-4,r.bottom+p);
   Object.assign(hole.style,{top:top+'px',left:left+'px',width:Math.max(40,right-left)+'px',height:Math.max(30,bottom-top)+'px'});bub.style.left=bx+'px';bub.style.top='8px';return;}
  bub.style.width='';
  const bh=bub.offsetHeight,bw=bub.offsetWidth;
  // Tall panels: spotlight the top part only, so the bubble can sit underneath without covering it.
  const maxH=Math.max(120,vh-bh-40);let bottom=Math.min(vh-4,r.bottom+p,top+maxH);
  Object.assign(hole.style,{top:top+'px',left:left+'px',width:Math.max(0,right-left)+'px',height:Math.max(0,bottom-top)+'px'});
  let by,bx;
  if(vh-bottom>=bh+14){by=bottom+12;bx=clamp(left+(right-left)/2-bw/2,12,vw-bw-12);}
  else if(top>=bh+14){by=top-bh-12;bx=clamp(left+(right-left)/2-bw/2,12,vw-bw-12);}
  else if(!small&&vw-right>=bw+14){bx=right+12;by=clamp(top,12,vh-bh-12);}
  else if(!small&&left>=bw+14){bx=left-bw-12;by=clamp(top,12,vh-bh-12);}
  else{bottom=Math.max(top+80,vh-bh-28);hole.style.height=Math.max(0,bottom-top)+'px';by=bottom+12;bx=(vw-bw)/2;}
  bub.style.top=Math.max(8,Math.min(by,vh-bh-8))+'px';bub.style.left=Math.max(8,bx)+'px';}
 // ---------- control ----------
 function start(k='player'){document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});kind=k;steps=build(k);i=0;if(!steps.length)return;
  if(active)unmount();active=true;mount();document.body.classList.add('touring');show();}
 function next(){if(i+1<steps.length){i++;show();}else end(true);}
 function back(){if(i>0){i--;show();}}
 function end(done){if(!active)return;active=false;unmount();document.body.classList.remove('touring');
  if(done){stats.tutorial.done[kind]=true;save();toast(kind==='parent'?'👪 Tour complete — the full guide is in ❓ Help.':'🎉 Tour complete! You can take it again any time from ❓ Help.');}
  window.scrollTo({top:0,behavior:'smooth'});}
 function onClick(e){const b=e.target.closest('[data-t]');if(!b)return;const t=b.dataset.t;if(t==='next')next();else if(t==='back')back();else if(t==='end')end(false);}
 // ---------- welcome screen (first load) ----------
 function offer(){const d=get('welcome');d.querySelectorAll('.pname').forEach(e=>e.textContent=playerName());get('wlNoAsk').checked=false;if(d.showModal)d.showModal();else d.setAttribute('open','');}
 function onWelcome(e){const b=e.target.closest('[data-wl]');if(!b)return;const d=get('welcome');
  if(get('wlNoAsk').checked&&!stats.tutorial.dontAsk){stats.tutorial.dontAsk=true;save();}
  d.close();if(b.dataset.wl==='player'||b.dataset.wl==='parent')setTimeout(()=>start(b.dataset.wl),150);
  else if(stats.tutorial.dontAsk)toast('👍 No problem — the tour is always in ❓ Help.');}
 // Offer once per page load, after any "Who's playing?" / design-your-player screens are finished.
 function maybeOffer(){if(offered||stats.tutorial.dontAsk||stats.tutorial.done.player||!Storage.current())return;let tries=0;
  const tick=()=>{if(offered||stats.tutorial.dontAsk||stats.tutorial.done.player||tries++>240)return;const busy=[...document.querySelectorAll('dialog')].some(d=>d.open)||!stats.avatar.created||active;if(busy){setTimeout(tick,500);return;}offered=true;offer();};setTimeout(tick,900);}
 function init(){get('welcome').addEventListener('click',onWelcome);get('welcome').addEventListener('cancel',()=>{});
  window.addEventListener('keydown',e=>{if(!active)return;const k=e.key;if(!['ArrowRight','ArrowLeft','Enter','Escape',' ','Tab'].includes(k))return;if(k==='Tab')return;e.preventDefault();e.stopPropagation();if(k==='ArrowRight'||k==='Enter'||k===' ')next();else if(k==='ArrowLeft')back();else end(false);},true);
  const re=()=>{if(active){const s=steps[i];place(s.el?find(s.el):null);}};window.addEventListener('resize',re);window.addEventListener('scroll',re,{passive:true});
  maybeOffer();}
 return{init,start,offer,maybeOffer,isActive:()=>active};
})();
