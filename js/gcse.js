'use strict';
// GCSE LAYER (2.86): wraps app.js like stages.js does. For GCSE and A level:
// - the look: stats.look 'auto' (senior from Year 10 or on a GCSE/A-level exam), 'junior' or 'senior' → body.look-senior
//   (the senior look's styles arrive in 2.87; grown-ups choose in Grown-ups → Plan);
// - maths display is loaded ahead of time and the question redrawn when it is ready;
// - the answer box explains what to type (expressions, several answers, coordinates);
// - calculator / non-calculator labels; a 📐 Formula sheet (revision copy; the exam board provides the real one);
// - helpful feedback when an algebra answer is the right value in the wrong form.
(function(){
 const LOOKS={auto:'Automatic (senior look from Year 10)',junior:'Children’s look',senior:'Senior look (GCSE / A level)'};
 function seniorOn(s){s=s||stats;const l=s&&s.look;if(l==='senior')return true;if(l==='junior')return false;return childYear(s)>=10||['gcse','alevel'].includes(examStage(s));}
 function applyLook(){try{const on=seniorOn(stats);document.body.classList.toggle('look-senior',on);document.body.dataset.stage=examStage(stats)||'';if(on||examStage(stats))Maths.load();}catch(e){}}
 window.Look={seniorOn,apply:applyLook,LOOKS};
 // the Plan tab: a Look choice beside the School year
 {const base=yearPick;yearPick=function(s){const l=s.look&&LOOKS[s.look]?s.look:'auto';return base(s)+`<p class="exam-year"><label>Look <select data-look-pick>${Object.entries(LOOKS).map(([k,v])=>`<option value="${k}"${k===l?' selected':''}>${v}</option>`).join('')}</select></label> <span class="section-note">Now showing: ${seniorOn(s)?'senior':'children’s'} look.</span></p>`;};}
 document.addEventListener('change',e=>{const f=e.target.closest&&e.target.closest('[data-look-pick]');if(!f||typeof stats==='undefined')return;stats.look=f.value;save(false);applyLook();planChanged(f.closest('[data-exam-box]'));if(typeof toast==='function')toast('Look: '+LOOKS[f.value]);});
 {const base=syncExam;syncExam=function(){const r=base.apply(this,arguments);applyLook();return r;};}
 window.addEventListener('load',applyLook);
 // when KaTeX arrives, redraw the question that is on screen
 Maths.when&&window.addEventListener('load',()=>{if(examStage(stats))Maths.when(()=>{try{if(current&&!finished)get('question').innerHTML=fracHTML(current.q);}catch(e){}});});
 // ---- after each new question: answer hints, calculator label, formula sheet button ----
 const PH={expr:'e.g. 6x + 10',set:'e.g. x = 2, x = −3',coord:'e.g. (3, −2)'};
 {const base=newQuestion;newQuestion=function(){const r=base.apply(this,arguments);try{decorate();}catch(e){}return r;};}
 function decorate(){if(!current)return;const an=get('answer'),k=current.kind;if(PH[k]){an.inputMode='text';an.placeholder=PH[k];}
  const mt=get('methodTag'),st=examStage(stats);if(mt&&st){const g=bank[current.topic]&&bank[current.topic][current.generator],m=mode==='mock'?examMock():null;
   const calc=m&&m.calc===false?'✏️ Non-calculator paper':g&&g.calc?'🧮 Calculator needed':'✏️ No calculator needed';
   mt.textContent+=` · ${calc}${g&&g.mk?` · ${g.mk} mark${g.mk>1?'s':''}`:''}${k==='expr'?' · type an expression':k==='set'?' · give every answer, separated by commas':k==='coord'?' · give (x, y)':''}`;}
  let fb=document.getElementById('formulaBtn');const want=examProfile().formula;
  if(want&&!fb){const host=get('hint')&&get('hint').parentElement;if(host){fb=document.createElement('button');fb.id='formulaBtn';fb.type='button';fb.className='ghost';fb.textContent='📐 Formula sheet';fb.addEventListener('click',openSheet);host.appendChild(fb);}}
  if(fb)fb.classList.toggle('hidden',!want);}
 // ---- the formula sheet (a revision copy) ----
 const SHEET=[['Area of a trapezium','A = \\frac{1}{2}(a+b)h'],['Volume of a prism','V = \\text{area of cross-section} \\times \\text{length}'],['Circle','C = \\pi d = 2\\pi r \\qquad A = \\pi r^2'],
  ['Pythagoras','a^2 + b^2 = c^2'],['Trigonometry','\\sin\\theta = \\frac{O}{H} \\quad \\cos\\theta = \\frac{A}{H} \\quad \\tan\\theta = \\frac{O}{A}'],['Quadratic formula','x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'],
  ['Sine rule','\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}'],['Cosine rule','a^2 = b^2 + c^2 - 2bc\\cos A'],['Area of a triangle','A = \\frac{1}{2}ab\\sin C'],
  ['Sphere','V = \\frac{4}{3}\\pi r^3 \\qquad A = 4\\pi r^2'],['Cone','V = \\frac{1}{3}\\pi r^2 h \\qquad \\text{curved } A = \\pi r l'],['Compound interest','A = P\\left(1+\\frac{r}{100}\\right)^n'],
  ['Speed, density, pressure','s = \\frac{d}{t} \\quad \\rho = \\frac{m}{V} \\quad p = \\frac{F}{A}'],['Probability','P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)']];
 function openSheet(){let d=document.getElementById('formulaSheet');if(!d){d=document.createElement('dialog');d.id='formulaSheet';d.className='formula-sheet';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))d.close();});}
  const p=examProfile(),src=(p.sources||[])[0];const draw=()=>{d.innerHTML=`<div class="fs-in"><h3>📐 Formula sheet (revision copy)</h3><p class="section-note">In the exam your board gives you its own formulae sheet. This copy is for practice — check the official one${src?`: <a href="${esc(src[1])}" target="_blank" rel="noopener">${esc(p.short)} materials</a>`:''}.</p>
   <table class="fs-t">${SHEET.map(([n,t])=>`<tr><th>${esc(n)}</th><td>${Maths.tex(t)}</td></tr>`).join('')}</table><p><button type="button" class="primary" data-close>Close</button></p></div>`;};
  draw();if(!Maths.ready())Maths.when(()=>{if(d.open)draw();});if(!d.open)d.showModal();}
 // ---- right value, wrong form ----
 let lastCode='';{const base=judge;judge=function(c,raw){const r=base(c,raw);lastCode=r;return r;};}
 const NOTE={expandit:'Right value — now EXPAND it (multiply out the brackets).',factoriseit:'Right value — now FACTORISE it (put it in brackets).',surdit:'Right value — now leave it as a SURD (use √), not a decimal.',stdformit:'Right value — now write it in STANDARD FORM (a × 10ⁿ with 1 ≤ a < 10).'};
 {const base=notice;notice=function(type,msg){if(type==='try'&&NOTE[lastCode]){msg=NOTE[lastCode];lastCode='';}return base(type,msg);};}
})();
