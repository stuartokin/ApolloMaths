'use strict';
// DATA: exam profiles. Each child picks the exam they are preparing for; practice, mocks and Starlane follow it.
// Questions are ORIGINAL, written in the style of each exam — never copied from published papers, which we link to instead.
// weights: how often each topic comes up in mixed practice for this exam (1 = normal, 0 = not used, >1 = more often).
const EXAM_CHECKED='November 2026';
const EXAMS={
 tiffin1:{name:'Tiffin Stage 1',short:'Tiffin S1',schools:'Tiffin School (boys) and The Tiffin Girls’ School, Kingston',age:'Year 6 — Stage One in early October',
  format:'Computer-marked maths: some multiple-choice questions, others where you work out the answer and mark it on a grid. Speed and accuracy matter.',style:'quick',
  weights:{fractions:1.4,percent:1.3,ratio:1.2,units:1.3,time:1.2,patterns:1.2,divisibility:1.2,sequences:1.2,geometry:1.1,area:1.1,coordinates:1,data:1.1,averages:1,shapes:1.1,measure:1.1,equivfrac:1.2,volume:1,algebra:.8,probability:.8,speed:.8,logic:.6,reasoning:.6,tiffin:.5},
  sources:[['Tiffin School — illustrative maths questions (PDF)','https://www.tiffinschool.co.uk/wp-content/uploads/2024/05/Illustrative-questions-Maths.pdf'],['Tiffin School — Year 7 admissions','https://www.tiffinschool.co.uk/admissions/year-7-admissions'],['Tiffin School — admissions FAQs, entry September 2027 (PDF)','https://www.tiffinschool.co.uk/wp-content/uploads/2026/04/FREQUENTLY-ASKED-QUESTIONS-FAQs-Entry-Sept-2027.pdf'],['Tiffin School admissions policy 2027–28 (test procedure, section 7)','https://www.tiffinschool.co.uk/wp-content/uploads/2026/09/Admissions-Policy-2027-28-Adopted-February-2026.pdf'],['Quest Assessments — Tiffin familiarisation guidance','https://questassessments.com/parent-guidance-consortium/tiffin-11-plus'],['The Tiffin Girls’ School — Year 7 admissions','https://www.tiffingirls.org/admissions/year-7/']],
  note:'Tiffin does not publish past papers. Our questions follow the style of the school’s published illustrative questions.'},
 tiffin2:{name:'Tiffin Stage 2',short:'Tiffin S2',schools:'Tiffin School (boys) and The Tiffin Girls’ School, Kingston',age:'Year 6 — Stage Two in mid November, for invited candidates',
  format:'Written maths set by the school: multi-step problems where working out matters.',style:'written',
  weights:{tiffin:1.6,ratio:1.2,fractions:1.2,percent:1.1,geometry:1.1,logic:1.2,reasoning:1.2,algebra:1.1,volume:1.1,equivfrac:1.1,shapes:1.1,measure:1.1,data:1.1},
  sources:[['Tiffin School — illustrative maths questions (PDF)','https://www.tiffinschool.co.uk/wp-content/uploads/2024/05/Illustrative-questions-Maths.pdf'],['Tiffin School — Year 7 admissions','https://www.tiffinschool.co.uk/admissions/year-7-admissions'],['Tiffin School admissions policy 2027–28','https://www.tiffinschool.co.uk/wp-content/uploads/2026/09/Admissions-Policy-2027-28-Adopted-February-2026.pdf'],['The Tiffin Girls’ School — Year 7 admissions','https://www.tiffingirls.org/admissions/year-7/']],
  note:'Tiffin does not publish past papers. Our questions follow the style of the school’s published illustrative Stage Two questions.'},
 grammar11:{name:'11+ grammar school (multiple choice)',short:'11+ grammar',schools:'Most grammar schools (tests by GL Assessment, CEM-style or a local consortium)',age:'Year 6 — usually September',
  format:'Multiple-choice or standard-format maths across the Key Stage 2 curriculum, timed.',style:'quick',
  weights:{fractions:1.2,percent:1.2,ratio:1.1,units:1.2,time:1.1,patterns:1.1,divisibility:1.1,sequences:1.1,area:1.1,data:1.1,equivfrac:1.1,algebra:.9,logic:.7,reasoning:.8,tiffin:.4},
  sources:[['GL Assessment — free 11+ familiarisation materials','https://11plus.gl-assessment.co.uk/free-materials/'],['Your local authority or consortium admissions pages (test dates and familiarisation papers)','https://www.gov.uk/schools-admissions']],
  note:'Check your chosen school’s own admissions page for its test provider and familiarisation papers.'},
 iseb:{name:'ISEB Common Pre-Test (Eton, Harrow and others)',short:'ISEB Pre-Test',schools:'Eton College, Harrow School and many other independent senior schools',age:'Year 6 — usually the autumn term',
  format:'Online, adaptive multiple-choice maths (part of a test that also covers English and reasoning). Questions get harder or easier as you go, and there is no going back.',style:'quick',
  weights:{fractions:1.2,percent:1.2,ratio:1.2,algebra:1.1,sequences:1.2,patterns:1.1,divisibility:1.1,area:1.1,geometry:1.1,coordinates:1.1,probability:1,averages:1.1,data:1.1,units:1.1,time:1,speed:.9,logic:.9,reasoning:1,tiffin:.5},
  sources:[['ISEB — Common Pre-Test for families (dates and familiarisation)','https://www.iseb.co.uk/assessments/common-pre-tests/for-families/'],['Eton College — Year 9 (13+) admissions','https://www.etoncollege.com/admissions/year-9-13/'],['Harrow School — Year 9 entry','https://www.harrowschool.org.uk/admissions/year-9-entry']],
  note:'The ISEB Pre-Test is adaptive and has no published past papers; ISEB provides a familiarisation test. Eton’s List Test and the Harrow Test have no past papers either.'},
 ce13:{name:'13+ Common Entrance / scholarship (Eton, Harrow and others)',short:'13+ CE',schools:'Eton College, Harrow School and other independent senior schools',age:'Year 8 — Common Entrance, Eton Entrance, King’s Scholarship or Harrow Academic Scholarship',
  format:'Written maths papers at a higher level: algebra, probability, geometry and multi-step problem solving. Scholarship papers ask for deeper reasoning.',style:'written',
  weights:{algebra:1.6,probability:1.4,averages:1.2,speed:1.3,sequences:1.3,coordinates:1.2,area:1.2,volume:1.3,ratio:1.2,percent:1.2,geometry:1.2,logic:1.3,reasoning:1.3,divisibility:1.1,units:.8,time:.7,equivfrac:.8,tiffin:1},
  sources:[['Eton College — Year 9 (13+) admissions (King’s Scholarship papers are published on Eton’s website)','https://www.etoncollege.com/admissions/year-9-13/'],['Harrow School — admissions process (Academic Scholarship past papers on its scholarships page)','https://www.harrowschool.org.uk/admissions/admissions-process'],['Harrow School — Year 9 entry','https://www.harrowschool.org.uk/admissions/year-9-entry'],['ISEB — Common Entrance 13+ timetable','https://www.iseb.co.uk/ce-case-exam-dates/ce-13-exam-timetable/']],
  note:'Common Entrance papers are sold by ISEB’s publisher; Eton and Harrow publish some scholarship papers. We link to them and write our own questions in their style.'}
};
const EXAM_ORDER=['tiffin1','tiffin2','grammar11','iseb','ce13'];
// which exam a child is preparing for (existing children are recognised from their exam name — Apollo stays on Tiffin Stage 2)
function examId(s){s=s||(typeof stats!=='undefined'?stats:null);const e=s&&s.exam||{};if(e.profile&&EXAMS[e.profile])return e.profile;const n=String(e.name||'');return /stage\s*1/i.test(n)?'tiffin1':/common entrance|13\+/i.test(n)?'ce13':/iseb|pre-?test/i.test(n)?'iseb':/grammar/i.test(n)?'grammar11':'tiffin2';}
function examProfile(s){return EXAMS[examId(s)];}
function examWeight(k,s){const w=examProfile(s).weights;return w&&w[k]!==undefined?w[k]:1;}
let setExam;setExam=function(id){if(!EXAMS[id]||typeof stats==='undefined')return;stats.exam=Object.assign({},stats.exam||{},{profile:id,name:EXAMS[id].name});if(typeof save==='function')save(false);}
// Parent page: which exam, what it is like, and the official sources our questions are modelled on
let examBlock;examBlock=function(s){const id=examId(s),p=EXAMS[id],mine=(typeof stats!=='undefined'&&s===stats);
 const pick=mine?`<label class="exam-pick">Preparing for <select data-exam-pick>${EXAM_ORDER.map(k=>`<option value="${k}"${k===id?' selected':''}>${esc(EXAMS[k].name)}</option>`).join('')}</select></label>`:`<p><b>Preparing for:</b> ${esc(p.name)}</p>`;
 return `<section class="exam-box" data-exam-box><h3>🎓 Exam &amp; sources</h3>${pick}<p class="section-note"><b>${esc(p.schools)}</b> · ${esc(p.age)}</p><p class="section-note">${esc(p.format)}</p>
 <details><summary>📚 Where our questions come from</summary><p class="section-note">${esc(p.note)} Every question in the app is original, written in the style of these papers.</p><ul>${p.sources.map(([l,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></li>`).join('')}</ul><p class="section-note">Sources last checked: ${EXAM_CHECKED}.</p></details></section>`;}
document.addEventListener('change',e=>{const sel=e.target.closest&&e.target.closest('[data-exam-pick]');if(!sel)return;setExam(sel.value);const box=sel.closest('[data-exam-box]');if(box&&typeof stats!=='undefined'){box.outerHTML=examBlock(stats);}if(typeof toast==='function')toast(`Now preparing for ${EXAMS[sel.value].name}`);});
// Starlane asks for a question with a hint about what is happening in the game; answer it from this child's exam.
const EXAM_KIND_TOPICS={fuel:['ratio','units','percent','speed'],trade:['percent','ratio','fractions','averages'],market:['percent','ratio','fractions'],hyper:['speed','time','coordinates','sequences'],repair:['area','volume','measure','geometry','shapes'],dock:['geometry','coordinates','time'],bounty:['percent','fractions','ratio']};
function examQuestion(kind,s){if(typeof bank==='undefined')return null;if(Math.random()<.4)return null; // leave room for Starlane's own space-themed questions
 const all=Object.keys(bank).filter(k=>bank[k]&&bank[k].length&&examWeight(k,s)>0),pref=(EXAM_KIND_TOPICS[kind]||[]).filter(k=>all.includes(k));
 const pickW=list=>{const tot=list.reduce((n,k)=>n+examWeight(k,s),0);let v=Math.random()*tot;for(const k of list){v-=examWeight(k,s);if(v<=0)return k;}return list[0];};
 for(let t=0;t<40;t++){const tp=pref.length&&Math.random()<.6?pickW(pref):pickW(all),list0=bank[tp],list1=list0.filter(g=>suitsExam(g,s)).length?list0.filter(g=>suitsExam(g,s)):list0,list=typeof diffFilter==='function'?diffFilter(list1,list1.map((_,i)=>i),'match').map(i=>list1[i]):list1;let q;try{if(typeof setQDiff==='function')setQDiff('match');q=list[Math.floor(Math.random()*list.length)]();QDIFF=0;if(typeof qOK==='function'&&!qOK(q))continue;}catch(e){continue;}
  if(!q||typeof q.q!=='string'||q.fig||q.table||!Number.isFinite(+q.a)||q.q.length>230||/which|\bnot\b|odd one/i.test(q.q)||(String(q.a).split('.')[1]||'').length>2)continue;
  const a=+q.a,dp=(String(q.a).split('.')[1]||'').length,fm=v=>dp?(+v).toFixed(dp):String(Math.round(v)),set=new Set([fm(a)]),d=[1,2,5,10,Math.max(1,Math.round(a*.1)),Math.max(1,Math.round(a*.5)),3];let k=0;
  while(set.size<4&&k<40){const v=a+(Math.random()<.5?-1:1)*d[k%d.length]*(dp?Math.pow(10,-dp)*10:1);if(v>=0||a<0)set.add(fm(v));k++;}
  return{how:(Array.isArray(q.s)&&q.s.length?q.s:Array.isArray(q.h)?q.h:[]).map(x=>String(x).replace(/<[^>]+>/g,'')).join(' ').slice(0,300),q:q.q.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' '),opts:[...set].sort(()=>Math.random()-.5),ans:fm(a),u:q.u||'',topic:tp,exam:examId(s)};}
 return null;}
// the built-in Starlane copy uses the same socket
if(typeof window!=='undefined')window.StarlaneQuestions={themedShare:.9,get:k=>examQuestion(k)};
// ---------------- Starlane maths: a record of what the game asked, and a one-tap check ----------------
function slRecord(rec){if(typeof stats==='undefined'||!rec)return;const L=(stats.slMaths=Array.isArray(stats.slMaths)?stats.slMaths:[]);
 L.push({t:Date.now(),ok:!!rec.ok,exam:rec.exam||null,topic:rec.topic||null,q:String(rec.q||'').slice(0,140)});if(L.length>200)L.splice(0,L.length-200);if(typeof save==='function')save(false);}
if(typeof window!=='undefined'&&window.StarlaneQuestions)window.StarlaneQuestions.report=slRecord;  // the built-in copy reports here too
function starlaneBlock(s){const L=Array.isArray(s.slMaths)?s.slMaths:[],wk=L.filter(x=>Date.now()-x.t<7*864e5),right=wk.filter(x=>x.ok).length,ex=wk.filter(x=>x.exam),mine=examId(s);
 const byExam={};ex.forEach(x=>{byExam[x.exam]=(byExam[x.exam]||0)+1;});const examTxt=Object.keys(byExam).length?Object.entries(byExam).map(([k,n])=>`${n} × ${esc((EXAMS[k]||{}).name||k)}`).join(', '):'none yet';
 const recent=L.slice(-8).reverse().map(x=>`<li>${x.ok?'✅':'❌'} ${esc(x.q)} <span class="section-note">— ${x.exam?esc((EXAMS[x.exam]||{}).short||x.exam)+' · '+esc(x.topic||''):'Starlane’s own space question'}</span></li>`).join('');
 const mineOK=ex.length&&ex.every(x=>x.exam===mine);
 return `<section class="exam-box" data-sl-box><h3>🚀 Starlane maths</h3>
 <p class="section-note">${wk.length?`This week: <b>${wk.length}</b> question${wk.length>1?'s':''} in Starlane, <b>${right}</b> right first time. From the exam: ${examTxt}${ex.length?(mineOK?' ✅ all match the chosen exam':' ⚠️ some came from a different exam (it was changed during the week)'):''}.`:'No Starlane maths questions yet this week.'}</p>
 ${recent?`<details><summary>Recent questions</summary><ul>${recent}</ul></details>`:''}
 ${s===(typeof stats!=='undefined'?stats:null)?`<p><button type="button" data-sl-check>🔍 Check Starlane questions</button> <span class="section-note">Opens Starlane in the background and asks it for 10 questions — no playing needed.</span></p><div data-sl-result></div>`:''}</section>`;}
// The check: open Starlane quietly, exactly as the arcade does, and ask it for questions through the same connection
function slCheck(btn){const box=btn.closest('[data-sl-box]'),out=box&&box.querySelector('[data-sl-result]');if(!out)return;const show=h=>{out.innerHTML=h;};
 if(!/^https?:/.test(location.protocol)){show('<p>⚠️ This check works on the live site (it needs the Starlane site alongside ApolloMaths).</p>');return;}
 if(window.StarlaneHost&&!window.StarlaneHost.probe){show('<p>Starlane is open in the arcade right now — close it first, then try again.</p>');return;}
 const mine=examId();btn.disabled=true;show('<p>Checking Starlane…</p>');
 window.StarlaneHost={version:1,probe:true,profile:()=>({name:typeof playerName==='function'?playerName():'Commander',band:'11-12'}),loadSave:()=>null,saveSave:()=>{},high:()=>0,bank:()=>typeof bank!=='undefined'?bank:null,
  question:(kind)=>examQuestion(kind),requestTest:()=>{},exit:()=>{},report:()=>{}};
 const f=document.createElement('iframe');f.src=new URL('../Starlane/?host=apollo&probe=1',location.href).href;f.title='Starlane check';f.style.cssText='position:absolute;width:1px;height:1px;left:-9999px;border:0';document.body.appendChild(f);
 const t0=Date.now(),done=h=>{clearInterval(tm);f.remove();window.StarlaneHost=null;btn.disabled=false;show(h);};
 const tm=setInterval(()=>{let w=null;try{w=f.contentWindow;}catch(e){}if(w&&w.StarlaneSite&&w.StarlaneSite.ready&&typeof w.StarlaneSite.probe==='function'){let r;try{r=w.StarlaneSite.probe(10);}catch(e){done(`<p>⚠️ Starlane answered, but the check failed: ${esc(e.message)}</p>`);return;}
   const qs=r.questions||[],match=qs.filter(q=>q.exam===mine).length,own=qs.filter(q=>!q.exam).length;
   const verdict=!r.hosted?'⚠️ Starlane did not recognise ApolloMaths, so it would use its own built-in questions.':!r.socket?'⚠️ Starlane is not asking ApolloMaths for questions.':match===qs.length&&qs.length?`✅ All ${qs.length} questions came from ApolloMaths and match <b>${esc(EXAMS[mine].name)}</b>.`:`⚠️ ${match} of ${qs.length} matched ${esc(EXAMS[mine].name)}${own?` (${own} came from Starlane’s own pack)`:''}.`;
   done(`<p>${verdict}</p><ol>${qs.map(q=>`<li>${esc(q.q)} <b>→ ${esc(q.ans)}${q.u?' '+esc(q.u):''}</b> <span class="section-note">— ${q.exam?esc((EXAMS[q.exam]||{}).name||q.exam)+' · '+esc(q.topic||'')+' · from ApolloMaths':'Starlane’s own pack'}</span></li>`).join('')}</ol>`);return;}
  if(Date.now()-t0>12000)done('<p>⚠️ Starlane can’t be reached right now. Check the internet connection and that the Starlane site is published.</p>');},300);}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sl-check]');if(b)slCheck(b);});
// ================= Phases 2–4: the exam plan, header, exam-shaped mocks, readiness and key dates =================
const EXAM_EXTRA={
 tiffin1:{badge:'Tiffin · Stage 1 (quick-fire maths)',mock:{n:40,mins:50,mcq:true},dates:[['Tiffin Stage One test — 2027 entry (boys)','2026-10-02'],['Tiffin Stage One test — 2028 entry (draft policy, “on or around”)','2027-10-01']]},
 tiffin2:{badge:'Tiffin · Stage 2 (written maths)',mock:{n:40,mins:50,mcq:false},dates:[['Tiffin Girls’ Stage Two test — 2027 entry','2026-11-07'],['Tiffin School Stage Two test — 2027 entry','2026-11-12'],['Offers for 2027 entry (expected)','2027-03-01']]},
 grammar11:{badge:'11+ grammar test (multiple choice)',mock:{n:50,mins:50,mcq:true},dates:[]},
 iseb:{badge:'ISEB Common Pre-Test',mock:{n:40,mins:40,mcq:true},dates:[['ISEB Pre-Test testing opens (2026–27)','2026-09-01'],['Eton — last day to sit the ISEB Pre-Test (September 2029 entry)','2026-11-30'],['Eton — ISEB results emailed (mid-December)','2026-12-15'],['ISEB Pre-Test testing closes (late May)','2027-05-28']]},
 ce13:{badge:'13+ Common Entrance / scholarship',mock:{n:30,mins:60,mcq:false},dates:[['Common Entrance sitting (2–6 Nov)','2026-11-02'],['Common Entrance sitting (25–29 Jan)','2027-01-25'],['Common Entrance sitting (7–11 Jun)','2027-06-07']]}};
for(const k in EXAM_EXTRA)Object.assign(EXAMS[k],EXAM_EXTRA[k]);
const DATES_NOTE='Dates as published by the schools and ISEB (checked November 2026). Always confirm on the official pages — the exam-watch agent proposes updates.';
const isoToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const fmtDay=iso=>{if(!iso)return 'date to be set';const d=new Date(iso+'T12:00:00');return isNaN(d)?iso:d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});};
const daysTo=iso=>iso?Math.round((new Date(iso+'T12:00:00')-new Date(isoToday()+'T12:00:00'))/864e5):null;
// each child has a plan: a list of tests. The app focuses on the next upcoming one.
function examPlan(s){s=s||stats;if(!Array.isArray(s.examPlan)){const e=s.exam||{};s.examPlan=[{id:examId(s),school:'',date:e.date||'',result:''}];}return s.examPlan;}
function entryDone(p){return !!p.date&&p.date<isoToday();}
function currentEntry(s){const pl=examPlan(s),up=pl.filter(p=>!entryDone(p)).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));return up[0]||pl[pl.length-1]||{id:'tiffin2',school:'',date:'',result:''};}
function syncExam(s){s=s||stats;const c=currentEntry(s);if(!EXAMS[c.id])c.id='tiffin2';s.exam=Object.assign({},s.exam||{},{profile:c.id,name:EXAMS[c.id].name,date:c.date||''});}
function examMock(s){return (examProfile(s).mock)||{n:40,mins:50,mcq:false};}
// mixed practice: generators can be marked for particular exams (fn.exams); others suit every exam
function suitsExam(fn,s){return !fn||!fn.exams||fn.exams.includes(examId(s));}
// ---------- the header, and every place that used to say "Tiffin" ----------
let hdrLast='';
function examHeader(){if(typeof stats==='undefined'||!document.querySelector('.hero'))return;syncExam(stats);const c=currentEntry(stats),p=EXAMS[c.id],d=daysTo(c.date),done=entryDone(c);
 const status=!c.date?'set the test date in the Parent page':done?(c.result?`result ${c.result}`:'done — what’s next?'):d===0?'it’s test day!':`${d} day${d===1?'':'s'} to go`;
 const badge=`🎯 Training for: <b>${esc(c.school?c.school+' — ':'')}${esc(p.badge)}</b> · 📅 ${esc(fmtDay(c.date))} · ${esc(status)}`;
 const key=badge+p.name+examMock().n;if(key===hdrLast)return;hdrLast=key;
 const hero=document.querySelector('.hero');let b=hero.querySelector('.exam-badge');if(!b){b=document.createElement('button');b.type='button';b.className='exam-badge';b.title='Grown-ups: change the exam plan';hero.querySelector('h1').insertAdjacentElement('afterend',b);
  b.addEventListener('click',()=>{const go=()=>{try{Parent.open('overview');}catch(e){}};if(typeof Family!=='undefined'&&Family.guard)Family.guard('Change the exam plan',go);else go();});}
 b.innerHTML=badge;
 const sub=document.getElementById('heroSub');if(sub)sub.textContent=`Train your brain for ${p.name} with hundreds of changing puzzles, comic chaos, proper coaching and epic mock exams!`;
 const st=hero.querySelector('.sticker');if(st)st.innerHTML=!done&&d!==null&&d===0?'TEST<br>DAY!<br>GO!':!done&&d!==null&&d>0&&d<=60?`${d}<br>DAY${d===1?'':'S'}<br>TO GO!`:'BAM!<br>YOU\'VE<br>GOT THIS!';
 const m=examMock(),mi=document.getElementById('mockInfo');if(mi)mi.textContent=`Mocks: ${m.n} mixed questions in ${m.mins} minutes${m.mcq?', multiple choice like the real test':''}, no hints until review. ${p.format} These are original practice questions, not official past papers.`;
 const mc=document.querySelector('[data-mode="mock"]');if(mc)mc.textContent=`🏆 ${m.n}-question mock`;
 const lk=document.getElementById('examLink');if(lk){lk.href=p.sources[0][1];lk.textContent=`📄 ${p.short}: official material`;}
 const nt=document.getElementById('examNote');if(nt)nt.innerHTML=`<b>📋 ${esc(p.name)}${c.school?' — '+esc(c.school):''} — ${esc(fmtDay(c.date))}.</b> ${esc(p.format)} <span class="mini">(${esc(p.note)})</span>`;
 const md=document.getElementById('examMade');if(md)md.textContent=`Made as original ${p.short}-style practice, not an official paper or an official Liverpool FC/Beano product. Your progress is saved in this browser automatically, and you can save it to your own progress file with 💾 Save progress. The app works offline.`;
 const fl=document.getElementById('examLinks');if(fl)fl.innerHTML=p.sources.slice(0,2).map(([l,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a>`).join(' · ');}
if(typeof window!=='undefined'){window.addEventListener('load',()=>{examHeader();setInterval(examHeader,1500);});}
// ---------- multiple-choice answers for exams that use them (in mocks) ----------
function examMCQ(cur,mode){const host=document.getElementById('answer');if(!host)return;let box=document.getElementById('mcqBox');if(!box){box=document.createElement('div');box.id='mcqBox';box.className='mcq-box';host.parentElement.insertAdjacentElement('afterend',box);}
 const mt=document.getElementById('methodTag');if(mt)mt.textContent+=` · ${examProfile().short} style${typeof curLevel==='function'?' · '+LEVEL_NAMES[curLevel(mode==='mock'?'match':(typeof level!=='undefined'?level:'match'))]:''}${examProfile().style==='quick'?' · ⏱ aim for about a minute each':''}`;
 const use=mode==='mock'&&examMock().mcq&&cur&&!cur.kind&&Number.isFinite(+cur.a);if(!use){box.innerHTML='';box.classList.add('hidden');return;}
 const a=+cur.a,dp=(String(cur.a).split('.')[1]||'').length,fm=v=>dp?(+v).toFixed(dp):String(Math.round(v)),set=new Set([fm(a)]),d=[1,2,5,10,Math.max(1,Math.round(a*.1)),Math.max(1,Math.round(a*.25)),3,4];let k=0;
 while(set.size<5&&k<60){const v=a+(Math.random()<.5?-1:1)*d[k%d.length]*(dp?Math.pow(10,-dp)*10:1);if(v>=0||a<0)set.add(fm(v));k++;}
 const opts=[...set].sort((x,y)=>+x-+y);box.classList.remove('hidden');box.innerHTML=`<p class="mini">Multiple choice, like the real test — pick one:</p>`+opts.map((o,i)=>`<button type="button" class="mcq-opt" data-mcq="${esc(o)}">${'ABCDE'[i]}. ${esc(o)}${cur.u?' '+esc(cur.u):''}</button>`).join('');}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mcq]');if(!b)return;const an=document.getElementById('answer'),ck=document.getElementById('check');if(!an||an.disabled)return;an.value=b.dataset.mcq;document.querySelectorAll('.mcq-opt').forEach(x=>x.disabled=true);b.classList.add('picked');if(ck)ck.click();});
// ---------- parent page: the plan (with sources), readiness, key dates and a printable report ----------
examBlock=function(s){const mine=(typeof stats!=='undefined'&&s===stats),pl=examPlan(s),c=currentEntry(s),p=EXAMS[c.id];
 const row=(e,i)=>mine?`<tr data-plan-row="${i}"><td><select data-plan="id">${EXAM_ORDER.map(k=>`<option value="${k}"${k===e.id?' selected':''}>${esc(EXAMS[k].name)}</option>`).join('')}</select></td><td><input data-plan="school" value="${esc(e.school||'')}" placeholder="School (optional)" maxlength="40"></td><td><input type="date" data-plan="date" value="${esc(e.date||'')}"></td><td><input data-plan="result" value="${esc(e.result||'')}" placeholder="e.g. due March 2027" maxlength="40"></td><td>${e===c?'🎯 focus':entryDone(e)?'✓ done':'later'}</td><td><button type="button" data-plan-del="${i}" title="Remove">✕</button></td></tr>`
  :`<tr><td>${esc(EXAMS[e.id].name)}</td><td>${esc(e.school||'')}</td><td>${esc(fmtDay(e.date))}</td><td>${esc(e.result||'')}</td><td>${e===c?'🎯 focus':entryDone(e)?'✓ done':'later'}</td></tr>`;
 return `<section class="exam-box" data-exam-box><h3>🎓 Exam plan &amp; sources</h3><p class="section-note">The app trains for the <b>next upcoming test</b> (🎯). When a test has passed it moves on to the next one in the plan.</p>
 <div class="plan-wrap"><table class="plan"><tr><th>Test</th><th>School</th><th>Date</th><th>Result</th><th></th>${mine?'<th></th>':''}</tr>${pl.map(row).join('')}</table></div>${mine?'<p><button type="button" data-plan-add>➕ Add a test</button></p>':''}
 <p class="section-note"><b>Now training for: ${esc(p.name)}</b> — ${esc(p.schools)} · ${esc(p.age)}. ${esc(p.format)}</p>
 <details><summary>📚 Where our questions come from</summary><p class="section-note">${esc(p.note)} Every question in the app is original, written in the style of these papers.</p><ul>${p.sources.map(([l,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></li>`).join('')}</ul><p class="section-note">Sources last checked: ${EXAM_CHECKED}.</p></details></section>`;};
function planChanged(box){syncExam(stats);if(typeof save==='function')save(false);hdrLast='';examHeader();if(box)box.outerHTML=examBlock(stats);}
document.addEventListener('change',e=>{const f=e.target.closest&&e.target.closest('[data-plan]');if(!f)return;const tr=f.closest('[data-plan-row]'),i=+tr.dataset.planRow,pl=examPlan(stats);if(!pl[i])return;pl[i][f.dataset.plan]=f.value;planChanged(f.closest('[data-exam-box]'));});
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-plan-add]');if(a){examPlan(stats).push({id:'iseb',school:'',date:'',result:''});planChanged(a.closest('[data-exam-box]'));return;}
 const d=e.target.closest&&e.target.closest('[data-plan-del]');if(d){const pl=examPlan(stats);if(pl.length>1){pl.splice(+d.dataset.planDel,1);planChanged(d.closest('[data-exam-box]'));}else if(typeof toast==='function')toast('Keep at least one test in the plan');}});
function setExamOld(id){setExam(id);}
setExam=function(id){if(!EXAMS[id]||typeof stats==='undefined')return;const c=currentEntry(stats);c.id=id;planChanged(null);};
function readiness(s){const p=examProfile(s),sl={};(Array.isArray(s.slMaths)?s.slMaths:[]).forEach(x=>{if(x.topic){const o=sl[x.topic]||(sl[x.topic]={seen:0,first:0});o.seen++;if(x.ok)o.first++;}});
 return Object.keys(topics).filter(k=>bank[k]&&bank[k].length&&examWeight(k,s)>0).map(k=>{const b=(s.byTopic&&s.byTopic[k])||{seen:0,first:0},o=sl[k]||{seen:0,first:0},seen=(b.seen||0)+o.seen,first=(b.first||0)+o.first,pc=seen?Math.round(100*first/seen):null;
  const st=seen<3?['⚪','Not tried yet']:pc<60?['🔴','Needs work']:pc<80?['🟠','Getting there']:['🟢','Strong'];return{k,label:topics[k].label,w:examWeight(k,s),seen,pc,st,sl:o.seen};}).sort((a,b)=>b.w-a.w||a.label.localeCompare(b.label));}
function readinessBlock(s){const p=examProfile(s),R=readiness(s),n=t=>R.filter(r=>r.st[1]===t).length;
 return `<section class="exam-box"><h3>📈 Readiness for ${esc(p.name)}</h3><p class="section-note">🟢 ${n('Strong')} strong · 🟠 ${n('Getting there')} getting there · 🔴 ${n('Needs work')} need work · ⚪ ${n('Not tried yet')} not tried yet — out of ${R.length} topics in this exam, most important first. Includes maths answered in Starlane.</p>
 <div class="plan-wrap"><table class="plan"><tr><th>Topic</th><th>How much it counts</th><th>Answered</th><th>Right first time</th><th></th></tr>${R.map(r=>`<tr><td>${esc(r.label)}</td><td>${r.w>=1.3?'★★★':r.w>=1.05?'★★':'★'}</td><td>${r.seen}${r.sl?` <span class="section-note">(${r.sl} in Starlane)</span>`:''}</td><td>${r.pc===null?'—':r.pc+'%'}</td><td>${r.st[0]} ${r.st[1]}</td></tr>`).join('')}</table></div>
 <p><button type="button" data-exam-print>🖨️ Print readiness report</button></p></section>`;}
function datesBlock(s){const pl=examPlan(s),seen=new Set(),rows=[];pl.forEach(e=>{if(e.date)rows.push([e.date,`${EXAMS[e.id].name}${e.school?' — '+e.school:''} (your plan)`,true]);(EXAMS[e.id].dates||[]).forEach(([l,dt])=>{if(!seen.has(l)){seen.add(l);rows.push([dt,l,false]);}});});
 rows.sort((a,b)=>a[0].localeCompare(b[0]));const t=isoToday();
 return `<section class="exam-box"><h3>📅 Key dates</h3><ul class="keydates">${rows.map(([d,l,mine])=>`<li class="${d<t?'past':''}">${d<t?'✓':'📌'} <b>${esc(fmtDay(d))}</b> — ${esc(l)}${mine?' 🎯':''}${d>=t?` <span class="section-note">(${daysTo(d)} days)</span>`:''}</li>`).join('')||'<li>No dates yet — add a test with a date to the plan.</li>'}</ul><p class="section-note">${esc(DATES_NOTE)}</p></section>`;}
document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('[data-exam-print]')))return;const s=stats,w=window.open('','_blank');if(!w){if(typeof toast==='function')toast('Allow pop-ups to print the report');return;}
 w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Readiness report</title><style>body{font-family:system-ui,sans-serif;margin:24px;color:#111}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 6px;text-align:left;font-size:13px}h1{font-size:20px}h3{margin-top:18px}.section-note{color:#555;font-size:12px}button{display:none}select,input{border:0;font:inherit}</style></head><body><h1>${esc(typeof playerName==='function'?playerName():'')} — readiness report, ${esc(fmtDay(isoToday()))}</h1>${examBlock(s)}${readinessBlock(s)}${datesBlock(s)}<p class="section-note">Original practice questions — not official papers. Made with AI (Claude, by Anthropic).</p></body></html>`);w.document.close();setTimeout(()=>{try{w.print();}catch(e){}},400);});
// a new player's first exam (chosen on the add-player form) becomes the first entry in their plan
window.addEventListener('load',()=>{try{const raw=sessionStorage.getItem('am-new-exam');if(!raw||typeof stats==='undefined')return;const n=JSON.parse(raw),cur=typeof Storage!=='undefined'&&Storage.current&&Storage.current();
 if(!cur||cur.id!==n.pid)return;sessionStorage.removeItem('am-new-exam');if(!EXAMS[n.id])n.id='grammar11';stats.examPlan=[{id:n.id,school:n.school||'',date:'',result:''}];syncExam(stats);if(typeof save==='function')save(false);hdrLast='';examHeader();
 if(typeof toast==='function')toast(n.unsure?'Training for a general 11+ for now — a grown-up can set the exact exam on the Parent page':`Training for ${EXAMS[n.id].name}${n.school?' — '+n.school:''}`);}catch(e){}});
// ---------------- parent dashboard: the new Plan, Readiness and Starlane tabs, the summary cards and the find box ----------------
function planTab(s){return examBlock(s)+datesBlock(s);}
function readyTab(s){return readinessBlock(s);}
function gamesTab(s){return starlaneBlock(s);}
function overviewCards(s){const c=currentEntry(s),p=EXAMS[c.id],d=daysTo(c.date),R=readiness(s),weak=R.filter(r=>r.st[1]==='Needs work').length,untried=R.filter(r=>r.st[1]==='Not tried yet').length;
 const wk=[...Array(7)].map((_,i)=>{const x=new Date();x.setDate(x.getDate()-i);return (s.time&&s.time.byDay&&s.time.byDay[`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`]||{}).app||0;}).reduce((a,b)=>a+b,0);
 const sl=(Array.isArray(s.slMaths)?s.slMaths:[]).filter(x=>Date.now()-x.t<7*864e5).length,best=(s.mocks||[]).reduce((m,x)=>Math.max(m,Math.round(100*x.score/x.total)),-1);
 const card=(tab,icon,big,small)=>`<button type="button" class="ov-card" data-goto="${tab}"><span class="ov-icon">${icon}</span><b>${big}</b><span>${small}</span></button>`;
 return `<div class="ov-cards">${card('plan','📋',esc(p.short)+(c.school?' · '+esc(c.school):''),c.date?(d>0?`${d} days to go`:d===0?'test day!':'done — set the next test'):'set the test date')}${card('ready','📈',`${weak} need work`,`${untried} not tried yet`)}${card('time','⏱️',`${Math.round(wk/60)} min`,'in the last 7 days')}${card('mocks','🏆',best>=0?best+'% best':'no mocks yet','mock exams')}${card('games','🚀',`${sl} Starlane`,'maths questions this week')}</div>`;}
document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('[data-goto]');if(!g)return;const b=document.querySelector(`#parent [data-ptab="${g.dataset.goto}"]`);if(b)b.click();});
const FIND=[['plan',/exam|date|plan|eton|harrow|tiffin|iseb|school|source|countdown|deadline|result|13\+|11\+/],['ready',/ready|readiness|weak|strong|print|report/],['focus',/focus/],['topics',/topic/],['types',/mistake|type|fix/],['mocks',/mock/],['learning',/learn|lesson|explain/],['time',/time|minute|hour/],['activity',/activity|history|log/],['games',/starlane|game|arcade|check|space/],['shop',/shop|kit|point|buy|reward/],['settings',/setting|export|backup|save|csv|theme|delete|pass|family|pin|password|data/]];
document.addEventListener('input',e=>{const f=e.target.closest&&e.target.closest('.pd-find');if(!f)return;const q=f.value.trim().toLowerCase();if(q.length<3)return;const hit=FIND.find(([,re])=>re.test(q));if(hit){const b=document.querySelector(`#parent [data-ptab="${hit[0]}"]`);if(b&&!b.classList.contains('active'))b.click();}});
