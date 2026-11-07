'use strict';
// PRESENTATION + INTERACTION: Learn Studio. Lessons are short steps; each step needs ACTIVE reading time (screen visible and the
// player interacting — no taps/scrolls for 45 s pauses the timer) and then a correct quick check. Points only come from proof of learning.
// Example Studio: fresh worked examples whose steps are revealed one at a time (each needs a few active seconds).
const Learn=(()=>{
 let tp=null,mode='lesson',step=0,active=0,need=0,state='reading',tries=0,order=[],disabled=[],lessonPts=0,paidToday=false,ex=null,exShown=0,exActive=0,exPaid=false,last=Date.now(),tickId=null;
 const dlg=()=>get('learn');
 const day=k=>{const key=dayKey()+'|'+k;return (stats.learn.days[key] ||= {lessons:0,examples:0});};
 const isActive=()=>document.visibilityState==='visible'&&Date.now()-(window.lastInputAt||0)<LEARN.idleAfter*1000;
 const shuffle=n=>{const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a;};
 function logLearnEv(type,pts,extra={}){stats.learn.events.push({t:Date.now(),type,tp,pts,...extra});if(stats.learn.events.length>1500)stats.learn.events.splice(0,stats.learn.events.length-1500);
  if(pts>0){stats.points+=pts;stats.learnPts+=pts;}save();updateStats();}
 // ---------- lessons ----------
 function open(k){tp=k;mode='lesson';step=0;lessonPts=0;paidToday=day(k).lessons>=LEARN.lessonsPerDay;learnMode=true;startStep();show();}
 function startStep(){const s=learnMissions[tp][step];need=readSecs(s);active=0;state='reading';tries=0;order=shuffle(s.check.options.length);disabled=[];render();}
 function render(){const d=dlg(),steps=learnMissions[tp],s=steps[step];
  d.querySelector('.ln-title').textContent=`📘 ${topics[tp].label}`;
  d.querySelector('.ln-body').innerHTML=mode==='done'?doneView():mode==='example'?exView():`<div class="ln-dots">${steps.map((_,i)=>`<span class="${i<step?'ok':i===step?'now':''}"></span>`).join('')}<small>Step ${step+1} of ${steps.length}</small></div>
   <h3>${esc(s.title)}</h3><div class="ln-content">${renderBlocks(personalise(s.blocks))}</div>
   <div class="gate" id="lnGate"></div>
   <div class="ln-check"><b>🤔 Quick check: ${esc(personalise(s.check.q))}</b><div class="ln-opts">${order.map((o,i)=>`<button class="ln-opt${disabled.includes(o)?' wrong':''}${state!=='reading'&&state!=='ready'&&o===0?' right':''}" data-opt="${o}" type="button"${state!=='ready'||disabled.includes(o)?' disabled':''}>${esc(personalise(s.check.options[o]))}</button>`).join('')}</div><div class="ln-fb" id="lnFb" aria-live="polite"></div></div>
   <div class="actions"><button class="primary${state==='right'||state==='shown'?'':' hidden'}" data-next type="button">${step+1<steps.length?'Next step ➡️':'Finish lesson 🏁'}</button></div>
   ${paidToday?'<p class="mini">You’ve already earned today’s points for this lesson — reading it again still makes you stronger! 💪</p>':`<p class="mini">Points: +${LEARN.stepFirst} ⚡ for each check right first time, +${LEARN.stepSecond} second time, +${LEARN.lessonBonus} ⚡ for finishing. Points come from reading carefully AND answering — not from waiting.</p>`}`;
  gate();}
 function gate(){const g=get('lnGate');if(!g)return;if(state!=='reading'){g.className='gate done';g.innerHTML=state==='ready'?'✅ Ready! Answer the quick check.':'';if(state!=='ready')g.classList.add('hidden');return;}
  const left=Math.max(0,Math.ceil(need-active)),pct=Math.min(100,Math.round(100*active/need));
  g.className='gate'+(isActive()?'':' paused');g.innerHTML=`<div class="gbar"><span style="width:${pct}%"></span></div><span>${isActive()?`📖 Read carefully… the check unlocks in <b>${left}s</b>`:'⏸️ Paused — tap or scroll to keep reading'}</span>`;}
 function answer(o){if(state!=='ready')return;const s=learnMissions[tp][step];tries++;const fb=get('lnFb');
  if(o===0){const pts=paidToday?0:tries===1?LEARN.stepFirst:tries===2?LEARN.stepSecond:0;lessonPts+=pts;state='right';logLearnEv('step',pts,{step,tries,secs:Math.round(active),ok:1});render();
   get('lnFb').innerHTML=`<div class="feedback good">✅ ${tries===1?'Spot on!':'Got it!'} ${pts?`+${pts} ⚡`:''}<br>${esc(personalise(s.check.why))}</div>`;return;}
  disabled.push(o);
  if(tries>=3){state='shown';logLearnEv('step',0,{step,tries,secs:Math.round(active),ok:0});render();get('lnFb').innerHTML=`<div class="feedback try">The answer is <b>${esc(personalise(s.check.options[0]))}</b>. ${esc(personalise(s.check.why))}</div>`;return;}
  state='reading';need=active+5;render();get('lnFb').innerHTML=`<div class="feedback try">Not quite — read the step again. The check unlocks in a few seconds.</div>`;}
 function next(){if(step+1<learnMissions[tp].length){step++;startStep();dlg().querySelector('.ln-body').scrollTop=0;return;}
  if(!paidToday){lessonPts+=LEARN.lessonBonus;logLearnEv('lesson',LEARN.lessonBonus,{ok:1});}else logLearnEv('lesson',0,{ok:1});
  day(tp).lessons++;stats.learn.lessons[tp]=(stats.learn.lessons[tp]||0)+1;save();mode='done';render();checkPlan();save();drawPlan();
  toast(paidToday?`📘 Lesson complete — great revision!`:`📘 Lesson complete! +${lessonPts} ⚡ for learning`);}
 function doneView(){return `<div class="ln-done"><div class="bigemoji">🏁</div><h3>Lesson complete!</h3><p>${lessonPts?`You earned <b>${lessonPts} ⚡</b> by reading carefully and answering the checks.`:'Great revision — you already earned today’s points for this lesson.'}</p>
  <div class="actions"><button class="primary" data-examples type="button">🎲 Study worked examples</button><button class="secondary" data-practise="${tp}" type="button">⚽ Practise ${esc(topics[tp].label)}</button><button class="ghost" data-close type="button">Close</button></div></div>`;}
 // ---------- Example Studio ----------
 function openExamples(k){tp=k;learnMode=true;newExample();show();}
 function newExample(){const arr=bank[tp],g=R(0,arr.length-1);ex={...personalise(arr[g]()),g};exShown=0;exActive=0;exPaid=false;mode='example';render();}
 function exView(){const left=Math.max(0,Math.ceil(LEARN.exampleStepSecs-exActive)),all=exShown>=ex.s.length,cap=day(tp).examples>=LEARN.examplesPerTopicDay;
  return `<p class="section-note">🎲 <b>Example Studio</b> — read the question, have a go, then reveal the worked steps one at a time.${cap?' (Today’s example points for this topic are used up — examples still help!)':` +${LEARN.example} ⚡ when you study every step (up to ${LEARN.examplesPerTopicDay} a day per topic).`}</p>
   <div class="ex-q">${esc(ex.q).replace(/\n/g,'<br>')}</div>${ex.fig?`<div class="figure">${renderFigure(ex.fig)}</div>`:''}
   <div class="ex-try"><input id="exTry" placeholder="Have a go first (optional)" autocomplete="off" inputmode="${ex.kind?'text':'decimal'}"><button class="ghost" data-extry type="button">Check</button><span id="exTryFb"></span></div>
   <ol class="ex-steps">${ex.s.slice(0,exShown).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
   ${all?`<div class="feedback good">Answer: <b>${esc(fmtAns(ex))}</b></div>`:`<button class="secondary" data-exstep type="button" id="exStepBtn"${exActive<LEARN.exampleStepSecs?' disabled':''}>${exActive<LEARN.exampleStepSecs?`Read… ${left}s`:`Show step ${exShown+1} of ${ex.s.length} ▶`}</button>`}
   <div class="actions"><button class="ghost" data-newex type="button">🎲 Another example</button><button class="primary" data-twin type="button">⚽ Try one like this</button><button class="ghost" data-close type="button">Close</button></div>`;}
 function exStep(){if(exActive<LEARN.exampleStepSecs)return;exShown++;exActive=0;
  if(exShown>=ex.s.length&&!exPaid){exPaid=true;const capd=day(tp).examples>=LEARN.examplesPerTopicDay;day(tp).examples++;logLearnEv('example',capd?0:LEARN.example,{steps:ex.s.length,ok:1});if(!capd)toast(`🎲 Example studied! +${LEARN.example} ⚡`);}
  render();}
 // ---------- shared ----------
 function show(){const d=dlg();if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');last=Date.now();clearInterval(tickId);tickId=setInterval(tick,250);}
 function close(){const d=dlg();if(d.close)d.close();else d.removeAttribute('open');}
 function tick(){const now=Date.now(),dt=Math.min(1,(now-last)/1000);last=now;if(!dlg().open){clearInterval(tickId);return;}
  if(mode==='lesson'&&state==='reading'){if(isActive())active+=dt;if(active>=need){state='ready';render();}else gate();}
  else if(mode==='example'&&exShown<ex.s.length){if(isActive())exActive+=dt;const b=get('exStepBtn');if(b){const ready=exActive>=LEARN.exampleStepSecs;b.disabled=!ready;b.textContent=ready?`Show step ${exShown+1} of ${ex.s.length} ▶`:`Read… ${Math.max(0,Math.ceil(LEARN.exampleStepSecs-exActive))}s`;}}}
 function onClick(e){const b=e.target.closest('button');if(!b||!dlg().contains(b))return;const ds=b.dataset;
  if(ds.close!==undefined){close();return;}
  if(ds.opt!==undefined){answer(+ds.opt);return;}
  if(ds.next!==undefined){next();return;}
  if(ds.examples!==undefined){newExample();return;}
  if(ds.newex!==undefined){newExample();return;}
  if(ds.exstep!==undefined){exStep();return;}
  if(ds.extry!==undefined){const r=judge(ex,get('exTry').value);get('exTryFb').textContent=r==='ok'?' ✅ Correct — now check the method!':r==='empty'?' Type an answer first.':' ❌ Not yet — reveal the steps to see how.';return;}
  if(ds.twin!==undefined){const g=ex.g;close();practiseLike(tp,g);return;}
  if(ds.practise){close();pickTopic(ds.practise);}}
 function init(){const d=dlg();d.addEventListener('click',onClick);d.addEventListener('close',()=>{clearInterval(tickId);learnMode=false;});}
 return{init,open,openExamples};
})();
