'use strict';
// STAGES (2.83–2.84): layers for key stages, school years, SATs and the tables check, wrapped around app.js (never rewriting it).
// - topics the exam doesn't use (examWeight 0: another exam's topics, nothing for the child's year, or not in an only-listed profile)
//   are hidden from the topic grid, and a chosen one falls back to mixed practice;
// - exams with several papers (SATs: Paper 1 arithmetic, Papers 2 and 3 reasoning) get a paper picker in Mock exam, and
//   examMock() returns the chosen paper; a mock keeps to its paper's topics;
// - mocks with marks are scored in marks as well (fn.mk; long multiplication and long division are worth 2);
// - a paper with perQ (the Year 4 tables check) gives perQ seconds per question, then moves on by itself.
(function(){
 const offExam=k=>typeof examWeight==='function'&&examWeight(k)===0;
 // ---- papers ----
 let paperIx=0;try{paperIx=+sessionStorage.getItem('am-paper')||0;}catch(e){}
 const papers=()=>{const p=typeof examProfile==='function'?examProfile():null;return p&&Array.isArray(p.papers)?p.papers:null;};
 const curPaper=()=>{const ps=papers();if(!ps)return null;if(!ps[paperIx])paperIx=0;return ps[paperIx];};
 {const base=examMock;examMock=function(s){const m=base(s),p=(!s||s===stats)?curPaper():null;return p?Object.assign({},m,p):m;};}
 function drawPapers(){const ex=document.getElementById('modeExplainer');if(!ex)return;let box=document.getElementById('paperPick');const ps=papers();
  if(!box){box=document.createElement('div');box.id='paperPick';box.className='choices paper-pick';const micro=ex.closest('.micro')||ex;micro.insertAdjacentElement('beforebegin',box);}
  if(!ps||mode!=='mock'){box.classList.add('hidden');box.innerHTML='';return;}
  const key=ps.map(p=>p.id).join()+paperIx;if(box.dataset.key===key&&!box.classList.contains('hidden'))return;box.dataset.key=key;box.classList.remove('hidden');
  box.innerHTML=`<span class="mini"><b>Choose a paper:</b></span>`+ps.map((p,i)=>`<button type="button" class="chip${i===paperIx?' active':''}" data-paper="${i}">${esc(p.paper)} · ${p.n} q · ${p.mins} min</button>`).join('');}
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-paper]');if(!b)return;paperIx=+b.dataset.paper||0;try{sessionStorage.setItem('am-paper',paperIx);}catch(x){}
  drawPapers();setMode('mock');if(typeof hdrLast!=='undefined'){hdrLast='';examHeader();}restartSession();});
 {const base=setMode;setMode=function(){const r=base.apply(this,arguments);try{drawPapers();}catch(e){}return r;};}
 window.addEventListener('load',()=>{setInterval(()=>{try{drawPapers();}catch(e){}},1500);});
 // ---- topic grid and chosen topics ----
 {const base=drawTopics;drawTopics=function(){base.apply(this,arguments);document.querySelectorAll('#topics [data-topic]').forEach(b=>{const k=b.dataset.topic;if(topics[k]&&offExam(k))b.classList.add('hidden');});};}
 {const base=newQuestion;newQuestion=function(){if(topics[chosenTopic]&&offExam(chosenTopic))chosenTopic='mixed';const r=base.apply(this,arguments);try{perQStart();}catch(e){}readQuestion();return r;};}
 // mocks keep to the paper's topics
 {const base=randomTopic;randomTopic=function(arr){const m=mode==='mock'?examMock():null,mt=m&&Array.isArray(m.topics)?m.topics.filter(k=>bank[k]&&bank[k].length&&!offExam(k)):null;if(mt&&mt.length)return base(mt);return arr===undefined?base():base(arr);};}
 // ---- younger children (2.85): tap-to-answer in practice (profile.tap) and questions read aloud (profile.read) ----
 {const base=examMCQ;examMCQ=function(cur,md){const p=examProfile();if(p&&p.tap&&md!=='mock'){const r=base(cur,'mock');const t=document.querySelector('#mcqBox .mini');if(t)t.textContent='Tap your answer (or type it):';return r;}return base(cur,md);};}
 const spoken=t=>String(t||'').replace(/<[^>]+>/g,' ').replace(/□/g,' what number ').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/=\s*$/,' equals what?').replace(/\s+/g,' ').trim();
 function readQuestion(){try{const p=examProfile();if(!p||!p.read||!current||finished||typeof Speech==='undefined'||!stats.speech||stats.speech.announce===false)return;if(Speech.ok===false||(typeof Speech.ok==='function'&&!Speech.ok()))return;setTimeout(()=>{if(current&&!finished)Speech.say(spoken(current.q),'question');},350);}catch(e){}}
 // a wrong tap in practice leaves the other answers open, so a young child can try again
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mcq]');if(!b)return;const p=examProfile();if(!p||!p.tap||mode==='mock')return;setTimeout(()=>{if(done||finished)return;document.querySelectorAll('.mcq-opt').forEach(x=>{if(!x.classList.contains('picked'))x.disabled=false;else x.classList.add('wrong-pick');});},80);});
 // ---- marks ----
 const marksOf=c=>{try{const g=bank[c.topic][c.generator];return g&&g.mk?g.mk:1;}catch(e){return 1;}};
 {const base=record;record=function(){const r=base.apply(this,arguments);try{const it=sessionLog[sessionLog.length-1];if(it&&current)it.mk=marksOf(current);}catch(e){}return r;};}
 {const base=finishSession;finishSession=function(){const wasMock=mode==='mock'&&!finished,m=examMock(),r=base.apply(this,arguments);perQStop();
  if(wasMock&&m.marks&&sessionLog.length){const of=sessionLog.reduce((n,x)=>n+(x.mk||1),0),got=sessionLog.reduce((n,x)=>n+(x.correct&&!x.skipped?(x.mk||1):0),0),last=stats.mocks[stats.mocks.length-1];
   if(last){last.mk=got;last.mkOf=of;last.ex=examId();if(m.id)last.paper=m.id;if(typeof childTier==='function'&&childTier())last.tier=childTier();save();}const fb=get('feedback');if(fb)fb.insertAdjacentHTML('beforeend',`<br><b>📝 ${esc(m.paper||'Marks')}: ${got} out of ${of} marks.</b>${m.id==='p1'?' In the real paper long multiplication and long division are worth 2 marks each.':''}`);}
  return r;};}
 // ---- seconds per question (the tables check) ----
 let pqTimer=null,pqToken=0;
 function perQStop(){if(pqTimer){clearInterval(pqTimer);pqTimer=null;}const el=document.getElementById('perQ');if(el)el.classList.add('hidden');}
 function perQBox(){let el=document.getElementById('perQ');if(!el){const a=get('answer'),row=a&&(a.closest('.answer-row')||a.parentElement);if(!row)return null;el=document.createElement('div');el.id='perQ';el.className='perq';el.setAttribute('aria-live','off');row.insertAdjacentElement('beforebegin',el);}return el;}
 function perQStart(){perQStop();const m=mode==='mock'?examMock():null;if(!m||!m.perQ||finished||!current)return;const tok=++pqToken,q=current,end=Date.now()+m.perQ*1000,el=perQBox();if(!el)return;const mt=get('methodTag');if(mt)mt.textContent=mt.textContent.replace(/ · ⏱ aim for about a minute each/,'')+` · ⏱ ${m.perQ} seconds each`;
  const draw=()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));el.classList.remove('hidden');el.textContent=`⏱️ ${left} second${left===1?'':'s'}`;el.classList.toggle('urgent',left<=2);return left;};draw();
  pqTimer=setInterval(()=>{if(tok!==pqToken||current!==q||finished){perQStop();return;}if(!draw()){perQStop();if(!done){notice('info',`Time’s up — it was ${fmtAns(q)}. Next one!`);}setTimeout(()=>{if(current===q&&!finished)skip();},1500);}},200);}
 // one answer per question: after SHOOT (or Enter) the check moves on by itself
 const afterAnswer=()=>{const m=mode==='mock'?examMock():null;if(!m||!m.perQ||finished||!current)return;const q=current;setTimeout(()=>{if(current!==q||finished)return;if(!done&&!q.wrongs.length)return;perQStop();setTimeout(()=>{if(current===q&&!finished)skip();},1500);},60);};
 document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#check'))afterAnswer();},true);
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='answer')afterAnswer();},true);
 // the minus key (2.90): number keypads on many phones and tablets (Samsung, iPad) have no minus sign. Shown on touch screens.
 // For a plain number it switches the minus sign on and off at the front (type 5, tap −, get −5); in longer answers such as
 // "x = 2, 3" it types a minus where the cursor is.
 document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#minusKey'))e.preventDefault();},true);
 document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('#minusKey')))return;const an=get('answer');if(!an||an.disabled)return;
  const v=an.value;let at;
  if(/^\s*[-−]?[\d.,\s/]*$/.test(v)){an.value=/^\s*[-−]/.test(v)?v.replace(/^\s*[-−]/,''):'-'+v.replace(/^\s+/,'');at=an.value.length;}
  else{const a=an.selectionStart==null?v.length:an.selectionStart,b=an.selectionEnd==null?a:an.selectionEnd;an.value=v.slice(0,a)+'-'+v.slice(b);at=a+1;}
  try{an.focus({preventScroll:true});an.setSelectionRange(at,at);}catch(x){}an.dispatchEvent(new Event('input',{bubbles:true}));});

})();
