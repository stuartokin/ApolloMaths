'use strict';
// PRESENTATION: printing — a paper mock exam with a mark scheme, and the parent progress report.
const Printer=(()=>{
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a;};
 function pickQuestions(n){const others=Object.keys(topics).filter(k=>!topics[k].focus&&k!=='tiffin'),plan=[...Array(n)].map((_,i)=>i<Math.round(n*.5)?focusKeys[i%focusKeys.length]:i<Math.round(n*.7)?'tiffin':pick(others)),out=[],seen=new Set();
  for(const tp of plan){const arr=bank[tp];let q,t=0;do{q=arr[R(0,arr.length-1)]();t++}while(seen.has(q.q)&&t<12);seen.add(q.q);out.push(personalise({...q,topic:tp}));}return shuffle(out);}
 function paperMock(n=25){const qs=pickQuestions(n),name=playerName(),date=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  doPrint(`<section class="pp-cover"><h1>${esc(name)}’s Maths Mock</h1><p>Stage 2 style practice paper · ${date}</p><div class="pp-boxes"><div>Time allowed: <b>45 minutes</b></div><div>Score: ________ / ${n}</div></div>
   <ul><li>Write each answer in the answer box, with units if needed.</li><li>Use the space under each question for working out — show how you got your answer.</li><li>Give fractions in their simplest form. Use the 24-hour clock for times.</li><li>Stuck? Move on and come back at the end.</li></ul></section>`+
   qs.map((q,i)=>`<section class="pp-q"><div class="pp-num">${i+1}</div><div class="pp-body"><p class="pp-text">${esc(q.q).replace(/\n/g,'<br>')}</p>${q.fig?`<div class="pp-fig">${renderFigure(q.fig)}</div>`:''}<div class="pp-work">Working:</div><div class="pp-ans">Answer: ${q.u==='£'?'£ ':''}<span class="pp-line"></span> ${q.u&&q.u!=='£'?esc(q.u):''}</div></div></section>`).join('')+
   `<section class="pp-marks"><h2>Mark scheme (for grown-ups)</h2><p>1 mark per correct answer. Accept equivalent forms unless the question asks for the simplest form. Afterwards, add the score in the Parent dashboard → Mocks.</p>
   <table><thead><tr><th>Q</th><th>Answer</th><th>Topic</th><th>How to get it</th></tr></thead><tbody>${qs.map((q,i)=>`<tr><td>${i+1}</td><td><b>${esc(fmtAns(q))}</b></td><td>${esc(topics[q.topic].label)}</td><td>${esc(q.s.slice(0,3).join(' → '))}</td></tr>`).join('')}</tbody></table></section>`);}
 function doPrint(html){const a=get('printArea');a.innerHTML=html;document.body.classList.add('printing');const done=()=>{document.body.classList.remove('printing');a.innerHTML='';window.removeEventListener('afterprint',done);};window.addEventListener('afterprint',done);setTimeout(()=>window.print(),250);}
 return{paperMock,doPrint};
})();
