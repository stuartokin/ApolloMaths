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
// KS2 SATs (2.83): the national curriculum tests in Year 6. Practice and Paper 1 mocks are arithmetic; reasoning comes in 2.84.
EXAMS.ks2sats={name:'KS2 SATs (Year 6 national tests)',short:'KS2 SATs',schools:'All state-funded primary schools in England (set by the Standards and Testing Agency)',age:'Year 6 — in May (2027: maths on 12 and 13 May)',year:6,
 format:'Three maths papers: Paper 1 arithmetic (36 questions, 40 marks, 30 minutes) and Papers 2 and 3 reasoning (35 marks, 40 minutes each). No calculator. Long multiplication and long division are worth 2 marks, with a mark for correct working.',style:'written',
 weights:{arith_add:1.5,arith_mult:1.6,arith_div:1.6,arith_frac:1.6,arith_pct:1.5,ks2_number:1.3,ks2_measure:1.3,ks2_shape:1.2,ks2_stats:1.2,ks2_problems:1.4,mtc_tables:.4,fractions:.5,percent:.5,ratio:.4,geometry:.5,shapes:.5,measure:.5,area:.4,volume:.4,units:.5,time:.5,data:.5,averages:.4,coordinates:.4,algebra:.4,sequences:.4,patterns:.4,divisibility:.5,equivfrac:.5,logic:.2,reasoning:.2,speed:0,probability:0,tiffin:0},
 sources:[['GOV.UK — KS2 maths past papers and test materials (2016 onwards)','https://www.gov.uk/government/collections/national-curriculum-assessments-practice-materials'],['GOV.UK — key stage 1 and key stage 2 test dates','https://www.gov.uk/guidance/key-stage-1-and-key-stage-2-test-dates'],['GOV.UK — 2027 key stage 2 tests: information for parents','https://www.gov.uk/government/publications/key-stage-2-national-curriculum-tests-and-results-information-for-parents/2027-key-stage-2-national-curriculum-tests-information-for-parents'],['GOV.UK — KS2 mathematics test framework','https://www.gov.uk/government/publications/key-stage-2-mathematics-test-framework'],['GOV.UK — national curriculum: mathematics programmes of study','https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study']],
 note:'The Standards and Testing Agency publishes past papers with mark schemes free on GOV.UK. Our questions are original, written in the style of those papers.'};
for(const k of ['tiffin1','tiffin2','grammar11','iseb'])EXAMS[k].year=6;EXAMS.ce13.year=8;
// SATs papers (2.84): the Mock exam area offers each paper; examMock() returns the one chosen (js/stages.js)
const KS2_REASON=['ks2_number','ks2_measure','ks2_shape','ks2_stats','ks2_problems'];
EXAMS.ks2sats.papers=[{id:'p1',paper:'Paper 1: arithmetic',n:36,mins:30,mcq:false,marks:40,topics:['arith_add','arith_mult','arith_div','arith_frac','arith_pct']},
 {id:'p2',paper:'Paper 2: reasoning',n:24,mins:40,mcq:false,marks:35,topics:KS2_REASON},{id:'p3',paper:'Paper 3: reasoning',n:24,mins:40,mcq:false,marks:35,topics:KS2_REASON}];
// Year 3–5 practice and the Year 4 multiplication tables check (2.84). only:true — topics not listed count 0 (no 11+ puzzles).
const NC_SRC=[['GOV.UK — national curriculum: mathematics programmes of study (Years 1–6)','https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study'],['GOV.UK — KS2 maths past papers and test materials','https://www.gov.uk/government/collections/national-curriculum-assessments-practice-materials']];
const yearProfile=(y,extra)=>Object.assign({name:`Year ${y} maths (national curriculum)`,short:`Year ${y}`,schools:'Any school in England — practice that follows the national curriculum',age:`Year ${y} (age ${y+4}–${y+5})`,year:y,only:true,style:'written',
 format:`Practice across the Year ${y} maths curriculum (and earlier years): calculation, place value, measures, shape, statistics and word problems. Questions from later years are held back.`,
 weights:{arith_add:1.2,arith_mult:1.2,arith_div:1.2,arith_frac:1,arith_pct:1,ks2_number:1.2,ks2_measure:1.2,ks2_shape:1,ks2_stats:1,ks2_problems:1.2,mtc_tables:y===4?1.5:1},
 sources:NC_SRC,note:'There are no national tests in Years 3 and 5; Year 4 has the multiplication tables check. Our questions are original and follow the national curriculum for each year.',
 badge:`Year ${y} maths`,mock:{n:20,mins:30,mcq:false},dates:[]},extra||{});
EXAMS.y3=yearProfile(3);EXAMS.y4=yearProfile(4);EXAMS.y5=yearProfile(5);
Object.assign(EXAMS.y3.weights,{ks1_number:.4,ks1_calc:.4,ks1_mult:.4,ks1_measure:.4,ks1_shape:.4});   // KS1 revision
// KS1 (2.85): Years 1 and 2 — pictures, tap-to-answer (tap) and questions read aloud (read). Year 2 has KS1-test-style papers.
const KS1W={ks1_number:1.2,ks1_calc:1.3,ks1_mult:1,ks1_measure:1.1,ks1_shape:1};
const ks1Profile=(y,extra)=>Object.assign({name:`Year ${y} maths (national curriculum)`,short:`Year ${y}`,schools:'Any school in England — practice that follows the national curriculum',age:`Year ${y} (age ${y+4}–${y+5})`,year:y,only:true,tap:true,read:true,style:'written',
 format:`Short picture questions across the Year ${y} curriculum: counting, adding and taking away, groups, money, time, shapes and fractions. Tap an answer (or type it); questions are read aloud.`,
 weights:Object.assign({},KS1W),sources:NC_SRC,note:'Our questions are original and follow the national curriculum for each year.',badge:`Year ${y} maths`,mock:{n:15,mins:20,mcq:true},dates:[]},extra||{});
EXAMS.y1=ks1Profile(1);
EXAMS.y2=ks1Profile(2,{note:'The KS1 tests (end of Year 2) became optional for schools in 2023–24; many still use them. Our papers copy their style, not their content.',sources:[['GOV.UK — KS1 maths past papers and test materials','https://www.gov.uk/government/collections/national-curriculum-assessments-practice-materials'],...NC_SRC.slice(0,1)],
 papers:[{id:'p1',paper:'KS1 Paper 1: arithmetic',n:25,mins:20,mcq:true,marks:25,topics:['ks1_calc','ks1_mult']},{id:'p2',paper:'KS1 Paper 2: reasoning',n:25,mins:35,mcq:true,marks:35,topics:['ks1_number','ks1_calc','ks1_mult','ks1_measure','ks1_shape']}]});
// KS3 (2.85): Years 7–9 — national curriculum, plus the best of the older word-problem topics. 13+ CE uses the KS3 topics too.
const KS3_SRC=[['GOV.UK — national curriculum: mathematics programmes of study (key stage 3)','https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study']];
const ks3Profile=y=>({name:`Year ${y} maths (KS3)`,short:`Year ${y}`,schools:'Any secondary school in England — practice that follows the KS3 national curriculum',age:`Year ${y} (age ${y+4}–${y+5})`,year:y,only:true,style:'written',
 format:`Practice across KS3 up to Year ${y}: number, algebra, ratio and percentages, geometry, probability and statistics. Questions from later years are held back.`,
 weights:{ks3_number:1.3,ks3_algebra:1.4,ks3_ratio:1.3,ks3_geometry:1.3,ks3_stats:1.2,algebra:.5,probability:.5,ratio:.4,percent:.4,averages:.4,sequences:.4,coordinates:.4,area:.4,volume:.4,speed:.4,divisibility:.4,reasoning:.3,logic:.3},
 sources:KS3_SRC,note:'There are no national tests in KS3. Our questions are original and follow the KS3 programme of study; Year 9 also prepares for GCSE.',badge:`Year ${y} maths`,mock:{n:25,mins:45,mcq:false},dates:[]});
EXAMS.y7=ks3Profile(7);EXAMS.y8=ks3Profile(8);EXAMS.y9=ks3Profile(9);
Object.assign(EXAMS.ce13.weights,{ks3_number:1.2,ks3_algebra:1.4,ks3_ratio:1.2,ks3_geometry:1.3,ks3_stats:1.2});
// GCSE (2.86): one set of questions (the DfE subject content is the same for every board); each board is a profile with
// its own papers. stage:'gcse' switches on maths display, the formula sheet and (from Year 10) the senior look.
// tiers: the Plan asks Foundation or Higher (entry.tier); fn.tier 'F' or 'H' keeps a question to one tier.
// Papers: calc:false is a non-calculator paper (questions with fn.calc===true are left out of it).
const GCSE_TOPICS={gcse_number:1.2,gcse_algebra:1.5,gcse_ratio:1.2,gcse_geometry:1.3,gcse_stats:1.1,ks3_number:.3,ks3_algebra:.3,ks3_ratio:.3,ks3_geometry:.3,ks3_stats:.3};
const GCSE_COMMON={stage:'gcse',year:10,only:true,style:'written',tiers:true,formula:true,mock:{n:20,mins:90,mcq:false},dates:[],
 format:'Three papers of 1 hour 30 minutes. Foundation tier (grades 1–5) or Higher tier (grades 4–9). Paper 1 is non-calculator; a formulae sheet is provided in the exam.',
 note:'Every board follows the same DfE subject content; boards publish past papers and mark schemes on their websites. Our questions are original, in the style of those papers.'};
const DFE_GCSE=['DfE — GCSE mathematics subject content','https://www.gov.uk/government/publications/gcse-mathematics-subject-content-and-assessment-objectives'];
const OFQUAL_SHEET=['Ofqual — formulae sheets in GCSE maths (decisions)','https://www.gov.uk/government/consultations/proposed-changes-to-the-assessment-of-mathematics-physics-and-combined-science-gcses/outcome/decisions-proposed-changes-to-the-assessment-of-mathematics-physics-and-combined-science-gcses'];
const gpapers=(marks,names)=>names.map(([id,paper,calc])=>({id,paper,calc,n:20,mins:90,mcq:false,marks}));
EXAMS.gcse_aqa=Object.assign({},GCSE_COMMON,{name:'GCSE Maths — AQA (8300)',short:'AQA GCSE',schools:'AQA — the most widely used GCSE maths board in England',age:'Years 10–11 — exams in May and June',weights:Object.assign({},GCSE_TOPICS),badge:'GCSE Maths · AQA',
 sources:[['AQA — GCSE Mathematics (8300): specification, past papers and formulae sheet','https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300'],DFE_GCSE,OFQUAL_SHEET],
 papers:gpapers(80,[['p1','Paper 1 (non-calculator)',false],['p2','Paper 2 (calculator)',true],['p3','Paper 3 (calculator)',true]])});
EXAMS.gcse_edexcel=Object.assign({},GCSE_COMMON,{name:'GCSE Maths — Pearson Edexcel (1MA1)',short:'Edexcel GCSE',schools:'Pearson Edexcel',age:'Years 10–11 — exams in May and June',weights:Object.assign({},GCSE_TOPICS),badge:'GCSE Maths · Edexcel',
 sources:[['Pearson Edexcel — GCSE Mathematics (1MA1): specification and past papers','https://qualifications.pearson.com/en/qualifications/edexcel-gcses/mathematics-2015.html'],DFE_GCSE,OFQUAL_SHEET],
 papers:gpapers(80,[['p1','Paper 1 (non-calculator)',false],['p2','Paper 2 (calculator)',true],['p3','Paper 3 (calculator)',true]])});
EXAMS.gcse_ocr=Object.assign({},GCSE_COMMON,{name:'GCSE Maths — OCR (J560)',short:'OCR GCSE',schools:'OCR',age:'Years 10–11 — exams in May and June',weights:Object.assign({},GCSE_TOPICS),badge:'GCSE Maths · OCR',
 format:'Three papers of 1 hour 30 minutes (100 marks each). Foundation: Papers 1–3; Higher: Papers 4–6. The middle paper (2 or 5) is non-calculator; a formulae sheet is provided.',
 sources:[['OCR — GCSE Mathematics (J560): specification and past papers','https://www.ocr.org.uk/qualifications/gcse/mathematics-j560-from-2015/'],DFE_GCSE,OFQUAL_SHEET],
 papers:gpapers(100,[['p1','Paper 1 / 4 (calculator)',true],['p2','Paper 2 / 5 (non-calculator)',false],['p3','Paper 3 / 6 (calculator)',true]])});
const GCSE_IDS=['gcse_aqa','gcse_edexcel','gcse_ocr'];
function examStage(s){return examProfile(s).stage||'';}
// Foundation or Higher, from the plan entry being trained for (Higher if not set)
function childTier(s){s=s||(typeof stats!=='undefined'?stats:null);if(!s||!examProfile(s).tiers)return '';const c=currentEntry(s);return c&&c.tier==='F'?'F':'H';}
EXAMS.mtc={name:'Year 4 multiplication tables check',short:'Tables check',schools:'All state-funded primary schools in England (Standards and Testing Agency)',age:'Year 4 — in June (2027: a two-week window from 7 June)',year:4,only:true,style:'quick',
 format:'An on-screen check: 25 multiplication questions up to 12 × 12, with 6 seconds to answer each and a 3-second pause between them. No hints, no going back.',
 weights:{mtc_tables:3,arith_mult:.6,arith_div:.6,arith_add:.3,ks2_number:.3},
 sources:[['GOV.UK — multiplication tables check (collection)','https://www.gov.uk/government/collections/multiplication-tables-check'],['GOV.UK — multiplication tables check administration guidance','https://www.gov.uk/government/publications/multiplication-tables-check-administration-guidance'],NC_SRC[0]],
 note:'The Standards and Testing Agency publishes a free “try it out” area for the check through schools. Our questions copy its format, not its content.',
 badge:'Year 4 multiplication tables check',mock:{n:25,mins:4,mcq:false,perQ:6,marks:25,paper:'Multiplication tables check',topics:['mtc_tables']},dates:[['Multiplication tables check — 2-week window opens','2027-06-07']]};
const EXAM_ORDER=['y1','y2','y3','y4','mtc','y5','ks2sats','tiffin1','tiffin2','grammar11','iseb','y7','y8','y9','ce13','gcse_aqa','gcse_edexcel','gcse_ocr'];
// which exam a child is preparing for (existing children are recognised from their exam name — Apollo stays on Tiffin Stage 2)
function examId(s){s=s||(typeof stats!=='undefined'?stats:null);const e=s&&s.exam||{};if(e.profile&&EXAMS[e.profile])return e.profile;const n=String(e.name||'');return /gcse.*aqa/i.test(n)?'gcse_aqa':/gcse.*edexcel/i.test(n)?'gcse_edexcel':/gcse.*ocr/i.test(n)?'gcse_ocr':/\bsats\b|key stage 2/i.test(n)?'ks2sats':/tables check/i.test(n)?'mtc':/^year ([1-9]) maths/i.test(n)?'y'+n.match(/^year ([1-9])/i)[1]:/stage\s*1/i.test(n)?'tiffin1':/common entrance|13\+/i.test(n)?'ce13':/iseb|pre-?test/i.test(n)?'iseb':/grammar/i.test(n)?'grammar11':'tiffin2';}
function examProfile(s){return EXAMS[examId(s)];}
// topics that belong to particular exams (topics[k].exams, e.g. SATs arithmetic) count 0 everywhere else
function examWeight(k,s){const t=topics[k];if(t&&Array.isArray(t.exams)&&(!t.exams.includes(examId(s))||(bank[k]&&!bank[k].some(g=>suitsExam(g,s)))))return 0;   // …or when nothing in it suits the child's school year yet
 const p=examProfile(s),w=p.weights;return w&&w[k]!==undefined?w[k]:p.only?0:1;}
// the child's school year: set by a grown-up in the Plan tab (stats.year), or taken from the exam (Year 6 for 11+ and SATs)
function childYear(s){s=s||(typeof stats!=='undefined'?stats:null);const y=s&&+s.year;return y>=1&&y<=13?y:(examProfile(s).year||6);}
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
  if(!q||typeof q.q!=='string'||q.fig||q.table||/\\\(/.test(q.q)||['expr','set','coord'].includes(q.kind)||!Number.isFinite(+q.a)||q.q.length>230||/which|\bnot\b|odd one/i.test(q.q)||(String(q.a).split('.')[1]||'').length>2)continue;
  const a=+q.a,dp=(String(q.a).split('.')[1]||'').length,fm=v=>dp?(+v).toFixed(dp):String(Math.round(v)),set=new Set([fm(a)]),d=[1,2,5,10,Math.max(1,Math.round(a*.1)),Math.max(1,Math.round(a*.5)),3];let k=0;
  while(set.size<4&&k<40){const v=a+(Math.random()<.5?-1:1)*d[k%d.length]*(dp?Math.pow(10,-dp)*10:1);if(v>=0||a<0)set.add(fm(v));k++;}
  if(typeof personalise==='function')q=personalise(q);else if(typeof themeText==='function')q=themeText(q,s);return{how:(Array.isArray(q.s)&&q.s.length?q.s:Array.isArray(q.h)?q.h:[]).map(x=>String(x).replace(/<[^>]+>/g,'')).join(' ').slice(0,300),q:q.q.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' '),opts:[...set].sort(()=>Math.random()-.5),ans:fm(a),u:q.u||'',topic:tp,exam:examId(s)};}
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
 ks2sats:{badge:'KS2 SATs — maths',mock:{n:36,mins:30,mcq:false,marks:40,paper:'Paper 1: arithmetic',topics:['arith_add','arith_mult','arith_div','arith_frac','arith_pct']},dates:[['KS2 SATs — maths Papers 1 (arithmetic) and 2 (reasoning)','2027-05-12'],['KS2 SATs — maths Paper 3 (reasoning)','2027-05-13'],['KS2 results to schools (expected)','2027-07-06'],['Year 4 multiplication tables check (2 weeks from)','2027-06-07']]},
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
// …and question types tagged with school years (fn.years=[first, last]) wait until the child has reached that year
function suitsExam(fn,s){if(!fn)return true;if(fn.exams&&!fn.exams.includes(examId(s)))return false;if(Array.isArray(fn.years)&&fn.years[0]>childYear(s))return false;
 if(fn.tier&&examProfile(s).tiers&&fn.tier!==childTier(s))return false;                       // Foundation-only or Higher-only (2.86)
 if(fn.calc===true){let md='';try{md=mode;}catch(e){}if(md==='mock'&&examMock(s).calc===false)return false;}   // calculator questions stay out of non-calculator papers
 return true;}
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
 const st=hero.querySelector('.sticker');if(st)st.innerHTML=!done&&d!==null&&d===0?'TEST<br>DAY!<br>GO!':!done&&d!==null&&d>0&&d<=60?`${d}<br>DAY${d===1?'':'S'}<br>TO GO!`:(window.THEME_STICKER||'BAM!<br>YOU\'VE<br>GOT THIS!');
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
 const row=(e,i)=>mine?`<tr data-plan-row="${i}"><td><select data-plan="id">${EXAM_ORDER.map(k=>`<option value="${k}"${k===e.id?' selected':''}>${esc(EXAMS[k].name)}</option>`).join('')}</select></td><td><input data-plan="school" value="${esc(e.school||'')}" placeholder="School (optional)" maxlength="40">${EXAMS[e.id]&&EXAMS[e.id].tiers?`<select data-plan="tier" aria-label="Tier"><option value="H"${e.tier!=='F'?' selected':''}>Higher (4–9)</option><option value="F"${e.tier==='F'?' selected':''}>Foundation (1–5)</option></select>`:''}</td><td><input type="date" data-plan="date" value="${esc(e.date||'')}"></td><td><input data-plan="result" value="${esc(e.result||'')}" placeholder="e.g. due March 2027" maxlength="40"></td><td>${e===c?'🎯 focus':entryDone(e)?'✓ done':'later'}</td><td><button type="button" data-plan-del="${i}" title="Remove">✕</button></td></tr>`
  :`<tr><td>${esc(EXAMS[e.id].name)}</td><td>${esc(e.school||'')}</td><td>${esc(fmtDay(e.date))}</td><td>${esc(e.result||'')}</td><td>${e===c?'🎯 focus':entryDone(e)?'✓ done':'later'}</td></tr>`;
 return `<section class="exam-box" data-exam-box><h3>🎓 Exam plan &amp; sources</h3><p class="section-note">The app trains for the <b>next upcoming test</b> (🎯). When a test has passed it moves on to the next one in the plan.</p>
 <div class="plan-wrap"><table class="plan${mine?' plan-edit':''}"><tr><th>Test</th><th>School</th><th>Date</th><th>Result</th><th></th>${mine?'<th></th>':''}</tr>${pl.map(row).join('')}</table></div>${mine?`<p><button type="button" data-plan-add>➕ Add a test</button>${planOffers(s).map(o=>` <button type="button" class="primary" data-plan-offer="${o.id}"${o.id==='ks2sats'?' data-plan-sats':''}>➕ Add ${esc(o.label)} — ${esc(fmtDay(o.date))}</button>`).join('')}</p>${yearPick(s)}`:`<p class="section-note">School year: ${s.year?'Year '+s.year:'not set (Year '+childYear(s)+' from the exam)'}</p>`}
 <p class="section-note"><b>Now training for: ${esc(p.name)}</b> — ${esc(p.schools)} · ${esc(p.age)}. ${esc(p.format)}</p>
 <details><summary>📚 Where our questions come from</summary><p class="section-note">${esc(p.note)} Every question in the app is original, written in the style of these papers.</p><ul>${p.sources.map(([l,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></li>`).join('')}</ul><p class="section-note">Sources last checked: ${EXAM_CHECKED}.</p></details></section>`;};
// school year and the SATs shortcut (2.83). SATS_DAY is the last maths paper, so SATs stay in focus until the tests end.
const SATS_DAY='2027-05-13';
const MTC_DAY='2027-06-18';   // last day of the 2027 check window
const PLAN_OFFERS=[{id:'ks2sats',year:6,date:SATS_DAY,label:'KS2 SATs'},{id:'mtc',year:4,date:MTC_DAY,label:'the times-tables check'}];
function planOffers(s){return PLAN_OFFERS.filter(o=>childYear(s)===o.year&&isoToday()<=o.date&&!examPlan(s).some(e=>e.id===o.id));}
function satsOffer(s){return planOffers(s).some(o=>o.id==='ks2sats');}
function yearPick(s){return `<p class="exam-year"><label>School year <select data-year-pick><option value="0"${s.year?'':' selected'}>Not set — use the exam (Year ${examProfile(s).year||6})</option>${[1,2,3,4,5,6,7,8,9,10,11,12,13].map(y=>`<option value="${y}"${+s.year===y?' selected':''}>Year ${y}</option>`).join('')}</select></label> <span class="section-note">Questions taught after this year are held back.</span></p>`;}
document.addEventListener('change',e=>{const f=e.target.closest&&e.target.closest('[data-year-pick]');if(!f||typeof stats==='undefined')return;stats.year=+f.value||0;planChanged(f.closest('[data-exam-box]'));try{examRefreshPage(null);}catch(x){}if(typeof toast==='function')toast(stats.year?`School year set to Year ${stats.year}`:'School year now follows the exam');});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-plan-offer]');if(!b||typeof stats==='undefined')return;const o=PLAN_OFFERS.find(x=>x.id===b.dataset.planOffer);if(!o)return;if(!examPlan(stats).some(x=>x.id===o.id))examPlan(stats).push({id:o.id,school:'',date:o.date,result:''});planChanged(b.closest('[data-exam-box]'));if(typeof toast==='function')toast(`${o.label[0].toUpperCase()+o.label.slice(1)} added to the plan`);});
function planChanged(box){syncExam(stats);if(typeof save==='function')save(false);hdrLast='';examHeader();if(box)box.outerHTML=examBlock(stats);}
document.addEventListener('change',e=>{const f=e.target.closest&&e.target.closest('[data-plan]');if(!f)return;const tr=f.closest('[data-plan-row]'),i=+tr.dataset.planRow,pl=examPlan(stats);if(!pl[i])return;pl[i][f.dataset.plan]=f.value;planChanged(f.closest('[data-exam-box]'));});
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-plan-add]');if(a){examPlan(stats).push({id:'iseb',school:'',date:'',result:''});planChanged(a.closest('[data-exam-box]'));return;}
 const d=e.target.closest&&e.target.closest('[data-plan-del]');if(d){const pl=examPlan(stats);if(pl.length>1){pl.splice(+d.dataset.planDel,1);planChanged(d.closest('[data-exam-box]'));}else if(typeof toast==='function')toast('Keep at least one test in the plan');}});
function setExamOld(id){setExam(id);}
setExam=function(id){if(!EXAMS[id]||typeof stats==='undefined')return;const c=currentEntry(stats);c.id=id;planChanged(null);};
// When the exam being trained for changes (the plan is edited, a test date passes, a new player is set up), the child's
// page follows at once: a fresh question from the new exam (a mock starts again at the new length), focus topics that
// suit it (unless a grown-up chose their own), and today's plan, "Next best thing", the topic grid and focus cards redrawn.
// the five most important topics for an exam (for this child's school year, if a child is given) — 2.84 uses examWeight
function examFocusFor(id,s){if(!EXAMS[id]||/^tiffin/.test(id))return DEFAULT_FOCUS.slice();const kid=Object.assign({},s&&typeof s==='object'?s:{},{exam:{profile:id}}),wt=k=>examWeight(k,kid);
 return Object.keys(topics).filter(k=>k!=='tiffin'&&wt(k)>0).sort((a,b)=>wt(b)-wt(a)).slice(0,5);}
{const base=syncExam;syncExam=function(s){const mine=typeof stats!=='undefined'&&(!s||s===stats),was=mine?examId(stats):null;base(s);if(mine&&was!==examId(stats))examSwitched(was);};}
// focus topics follow the exam until a grown-up chooses their own (stats.focusMine); returns true if they changed
function focusFollowExam(s){s=s||stats;if(!s||s.focusMine)return false;const want=examFocusFor(examId(s),s),f=Array.isArray(s.focus)?s.focus:[];
 if(f.length===want.length&&want.every(k=>f.includes(k)))return false;s.focus=want;if(s===stats&&typeof applyFocus==='function')applyFocus(s.focus);return true;}
function examSwitched(prev){try{focusFollowExam(stats);stats.focusExamSet=true;setTimeout(()=>examRefreshPage(prev),0);}catch(e){console.warn('exam switch',e);}}
window.addEventListener('load',()=>{try{if(typeof stats!=='undefined'&&focusFollowExam(stats)){stats.focusExamSet=true;if(typeof save==='function')save(false);examRefreshPage(null);}}catch(e){console.warn('focus follow',e);}});
function examRefreshPage(prev){if(typeof stats==='undefined'||typeof newQuestion!=='function'||!document.getElementById('question'))return;
 try{if(current&&!finished){const running=mode==='mock'&&EXAMS[prev]&&target===(EXAMS[prev].mock||{}).n;if(mode==='mock'&&typeof setMode==='function')setMode('mock');if(running){const area=document.body.dataset.areaNow;restartSession();if(area&&typeof Hub!=='undefined'&&Hub.show&&document.body.dataset.areaNow!==area)Hub.show(area);}else if(!done)newQuestion();}}catch(e){console.warn('exam question',e);}
 try{drawTopics();drawFocus();updateStats();if(typeof Hub!=='undefined'&&Hub.nextText)Hub.nextText();hdrLast='';examHeader();if(typeof save==='function')save(false);}catch(e){console.warn('exam redraw',e);}}
function examReadiness(s){const p=examProfile(s),sl={};(Array.isArray(s.slMaths)?s.slMaths:[]).forEach(x=>{if(x.topic){const o=sl[x.topic]||(sl[x.topic]={seen:0,first:0});o.seen++;if(x.ok)o.first++;}});
 return Object.keys(topics).filter(k=>bank[k]&&bank[k].length&&examWeight(k,s)>0).map(k=>{const b=(s.byTopic&&s.byTopic[k])||{seen:0,first:0},o=sl[k]||{seen:0,first:0},seen=(b.seen||0)+o.seen,first=(b.first||0)+o.first,pc=seen?Math.round(100*first/seen):null;
  const st=seen<3?['⚪','Not tried yet']:pc<60?['🔴','Needs work']:pc<80?['🟠','Getting there']:['🟢','Strong'];return{k,label:topics[k].label,w:examWeight(k,s),seen,pc,st,sl:o.seen};}).sort((a,b)=>b.w-a.w||a.label.localeCompare(b.label));}
function readinessBlock(s){const p=examProfile(s),R=examReadiness(s),n=t=>R.filter(r=>r.st[1]===t).length;
 return `<section class="exam-box"><h3>📈 Readiness for ${esc(p.name)}</h3><p class="section-note">🟢 ${n('Strong')} strong · 🟠 ${n('Getting there')} getting there · 🔴 ${n('Needs work')} need work · ⚪ ${n('Not tried yet')} not tried yet — out of ${R.length} topics in this exam, most important first. Includes maths answered in Starlane.</p>
 <div class="plan-wrap"><table class="plan"><tr><th>Topic</th><th>How much it counts</th><th>Answered</th><th>Right first time</th><th></th></tr>${R.map(r=>`<tr><td>${esc(r.label)}</td><td>${r.w>=1.3?'★★★':r.w>=1.05?'★★':'★'}</td><td>${r.seen}${r.sl?` <span class="section-note">(${r.sl} in Starlane)</span>`:''}</td><td>${r.pc===null?'—':r.pc+'%'}</td><td>${r.st[0]} ${r.st[1]}</td></tr>`).join('')}</table></div>
 <p><button type="button" data-exam-print>🖨️ Print readiness report</button></p></section>`;}
function aiNote(){const d=window.EXAM_WATCH_LAST,t=d?new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):null;return `<p class="section-note ai-note">🤖 Kept up to date by an AI agent (exam watch), which checks the official pages and admissions news and updates this automatically${t?` — last checked ${esc(t)}`:''}. Always confirm important dates on the school’s own website.</p>`;}
function datesBlock(s){const pl=examPlan(s),seen=new Set(),rows=[];pl.forEach(e=>{if(e.date)rows.push([e.date,`${EXAMS[e.id].name}${e.school?' — '+e.school:''} (your plan)`,true]);(EXAMS[e.id].dates||[]).forEach(([l,dt])=>{if(!seen.has(l)){seen.add(l);rows.push([dt,l,false]);}});(window.EXAM_DATES_AGENT||[]).filter(x=>x&&x.exam===e.id&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)).forEach(x=>{const l=`${x.label} ✨`;if(!seen.has(l)){seen.add(l);rows.push([x.date,l,false]);}});});
 rows.sort((a,b)=>a[0].localeCompare(b[0]));const t=isoToday();
 return `<section class="exam-box"><h3>📅 Key dates</h3><ul class="keydates">${rows.map(([d,l,mine])=>`<li class="${d<t?'past':''}">${d<t?'✓':'📌'} <b>${esc(fmtDay(d))}</b> — ${esc(l)}${mine?' 🎯':''}${d>=t?` <span class="section-note">(${daysTo(d)} days)</span>`:''}</li>`).join('')||'<li>No dates yet — add a test with a date to the plan.</li>'}</ul><p class="section-note">${esc(DATES_NOTE)}</p>${aiNote()}</section>`;}
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
function overviewCards(s){const c=currentEntry(s),p=EXAMS[c.id],d=daysTo(c.date),R=examReadiness(s),weak=R.filter(r=>r.st[1]==='Needs work').length,untried=R.filter(r=>r.st[1]==='Not tried yet').length;
 const wk=[...Array(7)].map((_,i)=>{const x=new Date();x.setDate(x.getDate()-i);return (s.time&&s.time.byDay&&s.time.byDay[`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`]||{}).app||0;}).reduce((a,b)=>a+b,0);
 const sl=(Array.isArray(s.slMaths)?s.slMaths:[]).filter(x=>Date.now()-x.t<7*864e5).length,best=(s.mocks||[]).reduce((m,x)=>Math.max(m,Math.round(100*x.score/x.total)),-1);
 const card=(tab,icon,big,small)=>`<button type="button" class="ov-card" data-goto="${tab}"><span class="ov-icon">${icon}</span><b>${big}</b><span>${small}</span></button>`;
 return `<div class="ov-cards">${card('plan','📋',esc(p.short)+(c.school?' · '+esc(c.school):''),c.date?(d>0?`${d} days to go`:d===0?'test day!':'done — set the next test'):'set the test date')}${card('ready','📈',`${weak} need work`,`${untried} not tried yet`)}${card('time','⏱️',`${Math.round(wk/60)} min`,'in the last 7 days')}${card('mocks','🏆',best>=0?best+'% best':'no mocks yet','mock exams')}${card('games','🚀',`${sl} Starlane`,'maths questions this week')}</div>`;}
document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('[data-goto]');if(!g)return;const b=document.querySelector(`#parent [data-ptab="${g.dataset.goto}"]`);if(b)b.click();});
const FIND=[['plan',/exam|date|plan|eton|harrow|tiffin|iseb|school|source|countdown|deadline|result|13\+|11\+/],['ready',/ready|readiness|weak|strong|print|report/],['focus',/focus/],['topics',/topic/],['types',/mistake|type|fix/],['mocks',/mock/],['learning',/learn|lesson|explain/],['time',/time|minute|hour/],['activity',/activity|history|log/],['games',/starlane|game|arcade|check|space/],['shop',/shop|kit|point|buy|reward/],['family',/export|backup|save|csv|family|player|child|code|pass|data|open file/],['settings',/setting|theme|delete|pin|voice/]];
document.addEventListener('input',e=>{const f=e.target.closest&&e.target.closest('.pd-find');if(!f)return;const q=f.value.trim().toLowerCase();if(q.length<3)return;const hit=FIND.find(([,re])=>re.test(q));if(hit){const b=document.querySelector(`#parent [data-ptab="${hit[0]}"]`);if(b&&!b.classList.contains('active'))b.click();}});
