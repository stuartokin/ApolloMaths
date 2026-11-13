'use strict';
// PRESENTATION: the welcome screen and the guided tours (one for players, one for grown-ups).
// Each step spotlights a real part of the page with a speech bubble. Choices are saved in stats.tutorial
// (so they live in the browser AND in the player's progress file). Tours can be rerun from ❓ Help.
const Tour=(()=>{
 let steps=[],i=0,kind='player',ov=null,hole=null,bub=null,active=false,offered=false,dir=1,paused=false,autoT=0;
 const narrating=()=>Speech.ok&&stats.speech.tour;
 const find=sel=>typeof sel==='function'?sel():document.querySelector(sel);
 const panel=sel=>()=>{const e=document.querySelector(sel);return e&&(e.closest('.panel')||e);};
 const byTitle=t=>()=>{const h=[...document.querySelectorAll('main h2')].find(x=>x.textContent.includes(t));return h&&h.closest('.panel');};
 const visible=e=>e&&e.offsetParent!==null&&!e.classList.contains('hidden');
 function playerSteps(){const n=esc(playerName());return[
  {title:`Hi ${n}! 👋 Let’s look around`,text:`This is <b>your</b> maths training ground for the ${typeof examProfile==='function'?examProfile().name:'Tiffin Stage 2'} exam. Every question you get right earns <b>⚡ power points</b>, wins medals and unlocks cool stuff. Use <b>Next</b> (or the → key) to follow the tour.`},
  {el:'.whoplays',title:'Your name, clock and Help',text:'Here’s who is playing (tap <b>🔁 Switch player</b> to swap), the <b>⏱️ clock</b> for this session and in total, and <b>❓ Help</b> if you ever get stuck — you can rerun this tour from there too.'},
  {el:'#playerCard',title:'🧍 My player',text:`This is your footballer! It shows your <b>⚡ to spend</b>, your next goal, and the <b>🎁 daily bonus</b> (get ${REWARDS.dailyTarget} right today for +${REWARDS.dailyBonus} ⚡). Tap <b>🎨 Change my look</b> to change your style or your name.`},
  {el:'#openShop',title:'🛍️ The Shop',text:'Spend your ⚡ on kits, boots, hats, sidekicks, celebrations, titles, frames, amazing <b>experiences</b> and <b>Maths Legend cards</b>. <b>🔥 For you</b> shows things you can buy now or very soon, and there’s a <b>deal of the day</b>. Points only come from doing maths — no real money, ever.'},
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
 function parentSteps(){const n=esc(playerName()),P=t=>()=>Parent.tourShow(t),H=()=>Parent.tourHide(),body='#parent .pd-body';return[
  {title:'Welcome, grown-ups 👪',text:`A tour of the parts of the app that are for you: following ${n}’s progress in the Parent dashboard, choosing the Focus areas, timed tests and printouts, saving, voices, and the optional hidden reward games.`},
  {el:panel('#dashboardToggle'),before:H,title:'👪 The Parent dashboard',text:'Open it from this button. You can lock it behind a PIN in Admin. Let’s look inside — each tab shows a different part of the picture.'},
  {dash:true,el:body,before:P('overview'),title:'📋 Overview',text:`Time on the app split into questions, learning, the shop and the arcade (only active time counts — it pauses when nobody is using the app), sessions, accuracy and right-first-time, how often hints, explainers and worked methods were used, Fix-it progress, points earned and spent, and how ready ${n} is in each Focus topic.`},
  {dash:true,el:'#parent .fz-current',before:P('focus'),title:'🎯 Focus areas — the five topics',text:`The Focus areas are the five topics ${n} trains hardest. They get the Focus Zone cards with a 📘 Learn mission, 🎲 worked examples and ⚽ practice, extra points, streak and mastery rewards, readiness bars and a place in Today’s plan. To start with they are Volume, Equivalent fractions, Properties of shapes, Measuring space and Representing data — but you can choose any five of the 23 topics.`},
  {dash:true,el:'#parent .dealbox',title:'💡 Suggested Focus areas',text:`The app suggests five topics from how ${n} is actually doing: how often questions are right first time, how often help was needed (hints, explainers, methods), questions skipped and lesson checks missed. The topics that need most help come first. Topics with too little evidence are flagged so they get a check-up. Tap <b>Use these suggestions</b> to tick them.`},
  {dash:true,el:'#parent .pd-body .ptable',title:'✅ Choosing your five',text:'Every topic is listed with its need rank, right-first-time score, how many questions were tried and the reason. Tick exactly five (it won’t let you pick a sixth), or use the suggestions.'},
  {dash:true,el:()=>{const b=document.querySelector('#parent [data-savefocus]');return b&&b.closest('.actions');},title:'💾 Saving the Focus areas',text:`<b>Save focus areas</b> applies the change straight away everywhere — Focus Zone cards, Focus mix, bonuses, readiness and Today’s plan — and saves it with ${n}’s progress and progress file. <b>Reset to the original five</b> brings back the starting set. Each child can have different Focus areas.`},
  {dash:true,el:body,before:P('learning'),title:'🧠 Learning',text:'Proof of learning: Learn missions finished, quick-check accuracy, average active reading time, worked examples studied, “Prove it” twin questions and mastery milestones. Points for learning are only given for active reading and correct checks — leaving the app open earns nothing.'},
  {dash:true,el:body,before:P('types'),title:'🧩 Question types and mistakes',text:'Every type of question, with how it’s going and the exact wrong answers typed — so you can see the misunderstanding, not just the score. The Fix-it list shows what is being brought back for another go.'},
  {dash:true,el:body,before:P('time'),title:'⏱️ Time',text:'The last 14 days as a chart and a day-by-day table: questions, learning, shop and arcade time, visits, questions answered and right first time.'},
  {dash:true,el:body,before:P('mocks'),title:'🏆 Mocks',text:'Every online mock with its score, plus <b>paper mock</b> scores you add yourself after marking a printed paper.'},
  {dash:true,el:body,before:P('settings'),title:'⚙️ Settings and exports',text:'Change the exam name and date (the countdown and Today’s plan follow it), download CSV files of every question, time per day and topics, and print a progress report. The Shop and Activity tabs show purchases and the last 150 questions.'},
  {el:panel('#modes'),before:H,title:'🏆 Timed tests and printouts',text:'The <b>40-question mock</b> is a timed online test (50 minutes, no hints). <b>🖨️ Print a paper mock</b> makes a 25-question Stage 2-style paper with working space and a <b>mark scheme</b> — the real Stage 2 paper is handwritten.'},
  {el:'#saveBar',title:'💾 Progress files',text:'Each child has their own progress file. On Chrome or Edge on a computer it saves automatically after every answer; on iPad or Safari it downloads, and this bar shows when there’s newer progress to save. <b>📂 Open progress file</b> loads it on another device.'},
  {el:'#switchPlayer',title:'🔁 Players',text:'Friends or siblings can have their own player with their own name, points, kit, Focus areas, settings and file. With two or more players there’s a friendly leaderboard.'},
  {el:'#voiceBtn',title:'🎙️ Voices and reading aloud',text:'The 🔊 button turns spoken announcements on or off. <b>🎙️ Voices</b> chooses female or male voices and the speed, and switches the 🔊 read-aloud buttons and tour narration on or off. There are different voices for the tour, announcements, questions and teaching.'},
  {title:'🕹️ Hidden games and Admin',text:'There is an optional <b>secret arcade</b> of retro games as a reward. It only unlocks after learning or questions, play time is earned, and you control the limits — session length, breaks, daily and weekly time, days and hours, saving unplayed time, and how long a session carries on after a refresh — in a PIN-protected <b>Admin</b> area, which can also lock the Parent dashboard. 🔑 For the passcodes, contact Stuart at <a href="mailto:stuart@horizonqltd.com">stuart@horizonqltd.com</a>.'},
  {el:()=>document.querySelector('.whoplays [data-help]'),title:'❓ Help',text:'The full guide, the version history and both tours live here.',finale:true}];}
 function build(k){const lockedDash=typeof Admin!=='undefined'&&Admin.locked('lockParent');return(k==='parent'?parentSteps():playerSteps()).filter(s=>{if(s.dash)return !lockedDash;if(!s.el||s.before)return true;const e=find(s.el);return e&&!(s.skip&&s.skip(e))&&e.getClientRects().length;});}
 // ---------- drawing ----------
 function mount(){ov=document.createElement('div');ov.className='tour-ov';hole=document.createElement('div');hole.className='tour-hole';bub=document.createElement('div');bub.className='tour-bub';bub.setAttribute('role','dialog');bub.setAttribute('aria-live','polite');
  document.body.append(ov,hole,bub);bub.addEventListener('click',onClick);}
 function unmount(){[ov,hole,bub].forEach(e=>e&&e.remove());ov=hole=bub=null;}
 function show(){const s=steps[i];clearTimeout(autoT);Speech.stop();if(s.before)s.before();const el=s.el?find(s.el):null;
  if(s.el&&!(el&&el.getClientRects().length)){if(dir>0&&i+1<steps.length){i++;show();}else if(dir<0&&i>0){i--;show();}else end(true);return;}
  const narr=narrating();
  bub.innerHTML=`<div class="tb-top"><span class="tb-step">${kind==='parent'?'👪 Grown-ups’ tour':'🎓 Tour'} · ${i+1} of ${steps.length}</span><span class="tb-tools">${Speech.ok?`${narr?`<button class="tb-tool" data-t="pause" type="button" aria-label="${paused?'Play':'Pause'} the narration">${paused?'▶':'⏸'}</button>`:''}<button class="tb-tool" data-t="narr" type="button" aria-label="Narration ${narr?'off':'on'}" title="Narration ${narr?'on':'off'}">${narr?'🔊':'🔇'}</button>`:''}<button class="tb-x" data-t="end" type="button" aria-label="End the tour">✕</button></span></div>
   <div class="tb-dots">${steps.map((_,j)=>`<span class="${j<i?'ok':j===i?'now':''}"></span>`).join('')}</div><h3>${s.title}</h3><p>${s.text}</p>
   ${narr&&i+1<steps.length?`<p class="tb-auto">${paused?'⏸ Paused — tap ▶ to carry on.':'🔊 Reading… the tour moves on by itself.'}</p>`:''}
   <div class="tb-btns">${i>0?'<button class="ghost" data-t="back" type="button">◀ Back</button>':''}<button class="primary next-ready" data-t="next" type="button">${i+1<steps.length?'Next ▶':(kind==='parent'?'Finish ✓':'Let’s go! 🚀')}</button></div>
   ${i+1<steps.length?'<button class="linkbtn tb-skip" data-t="end" type="button">Skip the tour</button>':''}`;
  if(el){el.scrollIntoView({block:'start'});if(!el.closest('dialog'))window.scrollBy(0,innerWidth<=700?-70:-24);}
  bub.style.maxHeight=(innerHeight-16)+'px';
  requestAnimationFrame(()=>place(el));setTimeout(()=>{const b=bub&&bub.querySelector('[data-t="next"]');if(b)b.focus({preventScroll:true});},60);
  if(narr&&!paused){const step=i;Speech.say(s.title+'. '+s.text,'tour',()=>{if(active&&!paused&&i===step&&i+1<steps.length)autoT=setTimeout(()=>{if(active&&!paused&&i===step)next();},1200);});}}
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
  let bottom=Math.min(vh-4,r.bottom+p);if(vh-bottom<bh+14&&top<bh+14)bottom=Math.max(top+100,vh-bh-28);
  Object.assign(hole.style,{top:top+'px',left:left+'px',width:Math.max(0,right-left)+'px',height:Math.max(0,bottom-top)+'px'});
  let by,bx;
  if(vh-bottom>=bh+14){by=bottom+12;bx=clamp(left+(right-left)/2-bw/2,12,vw-bw-12);}
  else if(top>=bh+14){by=top-bh-12;bx=clamp(left+(right-left)/2-bw/2,12,vw-bw-12);}
  else if(!small&&vw-right>=bw+14){bx=right+12;by=clamp(top,12,vh-bh-12);}
  else if(!small&&left>=bw+14){bx=left-bw-12;by=clamp(top,12,vh-bh-12);}
  else if(vh-(top+40)>=bh+20){bottom=vh-bh-20;hole.style.height=Math.max(0,bottom-top)+'px';by=bottom+8;bx=clamp(left+(right-left)/2-bw/2,12,vw-bw-12);}
  else if(top>=bh+8){by=top-bh-6;bx=clamp(left+(right-left)/2-bw/2,12,vw-bw-12);}
  else{bottom=Math.max(top+80,vh-bh-28);hole.style.height=Math.max(0,bottom-top)+'px';by=bottom+12;bx=(vw-bw)/2;}
  bub.style.top=Math.max(8,Math.min(by,vh-bh-8))+'px';bub.style.left=Math.max(8,bx)+'px';}
 // ---------- control ----------
 function start(k='player'){document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});kind=k;steps=build(k);i=0;dir=1;paused=false;if(!steps.length)return;
  if(active)unmount();active=true;mount();document.body.classList.add('touring');show();}
 function next(){dir=1;if(i+1<steps.length){i++;show();}else end(true);}
 function back(){dir=-1;if(i>0){i--;show();}}
 function togglePause(){if(!narrating())return;paused=!paused;clearTimeout(autoT);if(paused)Speech.stop();show();}
 function toggleNarr(){stats.speech.tour=!stats.speech.tour;save();paused=false;if(!stats.speech.tour)Speech.stop();show();}
 function end(done){if(!active)return;active=false;clearTimeout(autoT);Speech.stop();if(typeof Parent!=='undefined')Parent.tourHide();unmount();document.body.classList.remove('touring');
  if(done){stats.tutorial.done[kind]=true;save();toast(kind==='parent'?'👪 Tour complete — the full guide is in ❓ Help.':'🎉 Tour complete! You can take it again any time from ❓ Help.');}
  window.scrollTo({top:0,behavior:'smooth'});}
 function onClick(e){const b=e.target.closest('[data-t]');if(!b)return;const t=b.dataset.t;if(t==='next')next();else if(t==='back')back();else if(t==='pause')togglePause();else if(t==='narr')toggleNarr();else if(t==='end')end(false);}
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
  window.addEventListener('keydown',e=>{if(!active)return;const k=e.key;if(k==='p'||k==='P'){e.preventDefault();togglePause();return;}if(!['ArrowRight','ArrowLeft','Enter','Escape',' ','Tab'].includes(k))return;if(k==='Tab')return;e.preventDefault();e.stopPropagation();if(k==='ArrowRight'||k==='Enter'||k===' ')next();else if(k==='ArrowLeft')back();else end(false);},true);
  const re=()=>{if(active){const s=steps[i];place(s.el?find(s.el):null);}};window.addEventListener('resize',re);window.addEventListener('scroll',re,{passive:true});
  maybeOffer();}
 return{init,start,offer,maybeOffer,isActive:()=>active};
})();
