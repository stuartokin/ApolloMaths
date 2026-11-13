// ApolloMaths exam-watch agent. Runs from GitHub Actions; never publishes anything itself.
// 1) checks the official pages in sources.json for changes, 2) asks Claude (with web search) for new, closed or changed
// selective schools and test formats, 3) drafts ORIGINAL questions in the style of anything new, 4) re-solves each one
// independently and keeps only questions where both answers agree, 5) writes a report. The workflow then opens a pull request.
import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
const DIR='tools/exam-watch',KEY=process.env.ANTHROPIC_API_KEY,MODEL=process.env.EXAM_WATCH_MODEL||'claude-sonnet-5-5';
const cfg=JSON.parse(fs.readFileSync(`${DIR}/sources.json`,'utf8'));
const stateFile=`${DIR}/state.json`,state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{pages:{}};
const today=new Date().toISOString().slice(0,10),report=[`# Exam-watch report — ${today}`,''];
async function claude(prompt,{search=false,max=4000}={}){if(!KEY)return '(AI step skipped — no ANTHROPIC_API_KEY set; this was a dry run)';
 const body={model:MODEL,max_tokens:max,messages:[{role:'user',content:prompt}]};if(search)body.tools=[{type:'web_search_20250305',name:'web_search',max_uses:8}];
 const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify(body)});
 if(!r.ok)throw new Error(`API ${r.status}: ${await r.text()}`);const j=await r.json();return j.content.filter(c=>c.type==='text').map(c=>c.text).join('\n');}
const plain=html=>html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const jsonIn=t=>{const m=t.match(/```json\s*([\s\S]*?)```/)||t.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);try{return JSON.parse(m?m[1]:t);}catch(e){return null;}};
// 1) official pages
const changed=[];report.push('## Official pages','');
for(const p of cfg.pages){if(p.manual){report.push(`- 🔗 check by hand (the site blocks automated checks) — [${p.label}](${p.url})`);continue;}let txt='',status='';try{const r=await fetch(p.url,{redirect:'follow',headers:{'user-agent':'ApolloMaths exam-watch (GitHub Actions)'}});status=String(r.status);txt=r.ok?plain(await r.text()).slice(0,20000):'';}catch(e){status='unreachable';}
 const h=txt?crypto.createHash('sha256').update(txt).digest('hex'):'',old=state.pages[p.url];
 const tag=!txt?`⚠️ could not read (${status})`:!old?'🆕 first check':old.hash!==h?'✏️ CHANGED':'✓ no change';
 if(txt&&old&&old.hash!==h)changed.push({...p,text:txt});report.push(`- ${tag} — [${p.label}](${p.url})`);if(txt)state.pages[p.url]={hash:h,checked:today};}
// 2) the wider picture: new, closed or changed schools and tests
report.push('','## Schools and tests','');
const scan=await claude(`You help maintain a UK maths practice app for children preparing for selective school entrance exams. Today is ${today}.
Exam profiles in the app: Tiffin Stage 1, Tiffin Stage 2, 11+ grammar (multiple choice), ISEB Common Pre-Test (Eton, Harrow and others), 13+ Common Entrance / scholarship.
Using web search and OFFICIAL sources (school, ISEB, local authority) where possible, report in plain English: any change to the maths test format, provider, dates or published illustrative/familiarisation material for these; any selective school that has opened, closed, merged, changed test provider or started/stopped using the ISEB Pre-Test, if relevant to these profiles. Give a source link for every claim. Say clearly when nothing has changed. Keep it under 400 words.`,{search:true,max:3000});
report.push(scan,'');
// 3) key dates: upcoming deadlines and test days from official sources, proposed into js/data/exam-dates.js
report.push('','## Key dates','');
const datesTxt=await claude(`Today is ${today}. Using web search and OFFICIAL sources only (school, ISEB or local authority pages), list upcoming key dates in the next 18 months for these exam profiles: tiffin1 (Tiffin Stage 1), tiffin2 (Tiffin Stage 2), grammar11 (11+ grammar), iseb (ISEB Common Pre-Test, Eton, Harrow), ce13 (13+ Common Entrance / scholarships). Include registration deadlines, test days and results days. Reply with a JSON array only: [{"exam":"<id>","date":"YYYY-MM-DD","label":"<short description naming the school or body>","source":"<official url>"}].`,{search:true,max:3000});
const DF='js/data/exam-dates.js',oldDates=(()=>{try{const m=fs.readFileSync(DF,'utf8').match(/EXAM_DATES_AGENT=(\[[\s\S]*?\]);/);return m?JSON.parse(m[1]):[];}catch(e){return[];}})();
const ids=['tiffin1','tiffin2','grammar11','iseb','ce13'],fresh=(jsonIn(datesTxt)||[]).filter(x=>x&&ids.includes(x.exam)&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&x.date>=today&&typeof x.label==='string'&&/^https:\/\//.test(x.source||''));
const keep=oldDates.filter(x=>x.date>=new Date(Date.now()-60*864e5).toISOString().slice(0,10)),merged=[...keep];let added=0;
for(const x of fresh){if(!merged.some(y=>y.exam===x.exam&&y.date===x.date&&y.label===x.label)){merged.push({exam:x.exam,date:x.date,label:x.label.slice(0,140),source:x.source});added++;report.push(`- ✨ ${x.date} — ${x.label} (${x.exam}) — [source](${x.source})`);}}
if(!added)report.push('No new dates found this time.');
merged.sort((a,b)=>a.date.localeCompare(b.date));fs.writeFileSync(DF,`'use strict';\n// DATA: key dates found by the exam-watch AI agent from official sources. This file is maintained automatically.\n// Each entry: {exam:'iseb', date:'YYYY-MM-DD', label:'…', source:'https://…'}. Shown in Key dates with ✨.\nwindow.EXAM_WATCH_LAST=${JSON.stringify(today)};\nwindow.EXAM_DATES_AGENT=${JSON.stringify(merged,null,1)};\n`);
// 4) question generators in the style of any new official material — run 50 times in a sandbox, then checked again by a second solve
const proposed=[];
if(changed.length){report.push('','## Proposed question generators','');
 const draft=await claude(`Write up to 3 ORIGINAL maths question GENERATORS in the style of the official material below (never copy its wording). Each generator is a JavaScript arrow function with no arguments that uses R(a,b) for a random whole number from a to b and returns Q(questionText, numericAnswer, unit, [hint1,hint2,hint3], [workedStep1, workedStep2, ...]). Use only R, Q and Math. Reply with a JSON array only: [{"exam":"<tiffin1|tiffin2|grammar11|iseb|ce13>","topic":"<one of: ratio fractions percent geometry patterns time units logic algebra averages probability coordinates divisibility speed area sequences reasoning volume equivfrac shapes measure data>","code":"()=>{...}","source":"<url it is modelled on>"}].
${changed.map(c=>`SOURCE ${c.url} (${c.exam}): ${c.text.slice(0,6000)}`).join('\n\n')}`,{max:5000});
 for(const g of jsonIn(draft)||[]){if(!g||typeof g.code!=='string'||g.code.length>4000)continue;let fn,ok=true,samples=[];
  try{const ctx={R:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),Q:(q,a,u,h,s)=>({q,a,u,h,s}),Math};vm.createContext(ctx);fn=vm.runInContext(`(${g.code})`,ctx,{timeout:200});
   for(let i=0;i<50;i++){const q=fn();if(!q||typeof q.q!=='string'||!Number.isFinite(+q.a)||!Array.isArray(q.s)||!q.s.length){ok=false;break;}if(i<3)samples.push(q);}}catch(e){ok=false;}
  if(ok)for(const q of samples){const check=await claude(`Solve this maths question. Reply with ONLY the final numeric answer.\n${q.q}`,{max:200});const b=parseFloat(String(check).replace(/[^0-9.\-]/g,''));if(!(Number.isFinite(b)&&Math.abs(b-(+q.a))<1e-6)){ok=false;break;}}
  if(ok){proposed.push(g);report.push(`- ✓ (${g.exam}/${g.topic}) generator — e.g. “${samples[0].q.slice(0,120)}” → ${samples[0].a} — ran 50 times and was checked by a second solve`);}
  else report.push(`- ✗ dropped a ${g.exam}/${g.topic} generator: it failed the 50-run test or the second solve`);}}
else report.push('','No official page changed, so no new questions were drafted this time.','');
// write the outputs the pull request will contain
if(proposed.length){const f='js/data/questions-agent.js';let src=fs.readFileSync(f,'utf8');const add=proposed.map(g=>` // ${today} · ${g.exam} · modelled on ${g.source||'official material'}\n mk(${JSON.stringify(g.topic)},Object.assign(${g.code},{exams:[${JSON.stringify(g.exam)}]}));`).join('\n');
 src=src.replace('// ===== agent questions end =====',add+'\n // ===== agent questions end =====');fs.writeFileSync(f,src);}
fs.writeFileSync(stateFile,JSON.stringify(state,null,1));fs.mkdirSync(`${DIR}/reports`,{recursive:true});fs.writeFileSync(`${DIR}/reports/${today}.md`,report.join('\n'));fs.writeFileSync(`${DIR}/latest-report.md`,report.join('\n'));
console.log(report.join('\n'));
