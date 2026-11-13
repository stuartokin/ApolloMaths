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
function setExam(id){if(!EXAMS[id]||typeof stats==='undefined')return;stats.exam=Object.assign({},stats.exam||{},{profile:id,name:EXAMS[id].name});if(typeof save==='function')save(false);}
// Parent page: which exam, what it is like, and the official sources our questions are modelled on
function examBlock(s){const id=examId(s),p=EXAMS[id],mine=(typeof stats!=='undefined'&&s===stats);
 const pick=mine?`<label class="exam-pick">Preparing for <select data-exam-pick>${EXAM_ORDER.map(k=>`<option value="${k}"${k===id?' selected':''}>${esc(EXAMS[k].name)}</option>`).join('')}</select></label>`:`<p><b>Preparing for:</b> ${esc(p.name)}</p>`;
 return `<section class="exam-box" data-exam-box><h3>🎓 Exam &amp; sources</h3>${pick}<p class="section-note"><b>${esc(p.schools)}</b> · ${esc(p.age)}</p><p class="section-note">${esc(p.format)}</p>
 <details><summary>📚 Where our questions come from</summary><p class="section-note">${esc(p.note)} Every question in the app is original, written in the style of these papers.</p><ul>${p.sources.map(([l,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></li>`).join('')}</ul><p class="section-note">Sources last checked: ${EXAM_CHECKED}.</p></details></section>`;}
document.addEventListener('change',e=>{const sel=e.target.closest&&e.target.closest('[data-exam-pick]');if(!sel)return;setExam(sel.value);const box=sel.closest('[data-exam-box]');if(box&&typeof stats!=='undefined'){box.outerHTML=examBlock(stats);}if(typeof toast==='function')toast(`Now preparing for ${EXAMS[sel.value].name}`);});
// Starlane asks for a question with a hint about what is happening in the game; answer it from this child's exam.
const EXAM_KIND_TOPICS={fuel:['ratio','units','percent','speed'],trade:['percent','ratio','fractions','averages'],market:['percent','ratio','fractions'],hyper:['speed','time','coordinates','sequences'],repair:['area','volume','measure','geometry','shapes'],dock:['geometry','coordinates','time'],bounty:['percent','fractions','ratio']};
function examQuestion(kind,s){if(typeof bank==='undefined')return null;if(Math.random()<.4)return null; // leave room for Starlane's own space-themed questions
 const all=Object.keys(bank).filter(k=>bank[k]&&bank[k].length&&examWeight(k,s)>0),pref=(EXAM_KIND_TOPICS[kind]||[]).filter(k=>all.includes(k));
 const pickW=list=>{const tot=list.reduce((n,k)=>n+examWeight(k,s),0);let v=Math.random()*tot;for(const k of list){v-=examWeight(k,s);if(v<=0)return k;}return list[0];};
 for(let t=0;t<40;t++){const tp=pref.length&&Math.random()<.6?pickW(pref):pickW(all),list=bank[tp];let q;try{q=list[Math.floor(Math.random()*list.length)]();}catch(e){continue;}
  if(!q||typeof q.q!=='string'||q.fig||q.table||!Number.isFinite(+q.a)||q.q.length>230||/which|\bnot\b|odd one/i.test(q.q)||(String(q.a).split('.')[1]||'').length>2)continue;
  const a=+q.a,dp=(String(q.a).split('.')[1]||'').length,fm=v=>dp?(+v).toFixed(dp):String(Math.round(v)),set=new Set([fm(a)]),d=[1,2,5,10,Math.max(1,Math.round(a*.1)),Math.max(1,Math.round(a*.5)),3];let k=0;
  while(set.size<4&&k<40){const v=a+(Math.random()<.5?-1:1)*d[k%d.length]*(dp?Math.pow(10,-dp)*10:1);if(v>=0||a<0)set.add(fm(v));k++;}
  return{how:(Array.isArray(q.s)&&q.s.length?q.s:Array.isArray(q.h)?q.h:[]).map(x=>String(x).replace(/<[^>]+>/g,'')).join(' ').slice(0,300),q:q.q.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' '),opts:[...set].sort(()=>Math.random()-.5),ans:fm(a),u:q.u||'',topic:tp,exam:examId(s)};}
 return null;}
// the built-in Starlane copy uses the same socket
if(typeof window!=='undefined')window.StarlaneQuestions={themedShare:.9,get:k=>examQuestion(k)};
