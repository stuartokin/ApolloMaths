// ApolloMaths exam-watch agent. Runs from GitHub Actions; never publishes anything itself.
// 1) checks the official pages in sources.json for changes, 2) asks Claude (with web search) for new, closed or changed
// selective schools and test formats, 3) drafts ORIGINAL questions in the style of anything new, 4) re-solves each one
// independently and keeps only questions where both answers agree, 5) writes a report. The workflow then opens a pull request.
import fs from 'node:fs';import crypto from 'node:crypto';
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
// 3) and 4) original questions in the style of anything new, checked twice
const proposed=[];
if(changed.length){report.push('## Proposed new questions','');
 const draft=await claude(`Write 6 ORIGINAL maths questions in the style of the material described below (never copy wording from it). For each give JSON {"exam":"<profile id: tiffin1|tiffin2|grammar11|iseb|ce13>","topic":"<one of: ratio fractions percent geometry patterns time units logic algebra averages probability coordinates divisibility speed area sequences reasoning volume equivfrac shapes measure data>","q":"question text","a":<numeric answer>,"u":"unit or empty","steps":["short worked step",...],"source":"<url it is modelled on>"}. Reply with a JSON array only.
${changed.map(c=>`SOURCE ${c.url} (${c.exam}): ${c.text.slice(0,6000)}`).join('\n\n')}`,{max:4000});
 for(const q of jsonIn(draft)||[]){if(!q||typeof q.q!=='string'||!Number.isFinite(+q.a))continue;
  const check=await claude(`Solve this maths question. Reply with ONLY the final numeric answer.\n${q.q}`,{max:200});const b=parseFloat(String(check).replace(/[^0-9.\-]/g,''));
  if(Number.isFinite(b)&&Math.abs(b-(+q.a))<1e-6){proposed.push(q);report.push(`- ✓ (${q.exam}/${q.topic}) ${q.q} → ${q.a}${q.u?' '+q.u:''} — checked twice`);}else report.push(`- ✗ dropped: answers disagreed (${q.a} vs ${check.trim().slice(0,20)}) — ${q.q}`);}}
else report.push('No official page changed, so no new questions were drafted this time.','');
// write the outputs the pull request will contain
if(proposed.length){const f='js/data/questions-agent.js';let src=fs.readFileSync(f,'utf8');const add=proposed.map(q=>` // ${today} · ${q.exam} · modelled on ${q.source||'official material'}\n mk(${JSON.stringify(q.topic)},()=>Q(${JSON.stringify(q.q)},${+q.a},${JSON.stringify(q.u||'')},[],${JSON.stringify(q.steps||[])}));`).join('\n');
 src=src.replace('// ===== agent questions end =====',add+'\n // ===== agent questions end =====');fs.writeFileSync(f,src);}
fs.writeFileSync(stateFile,JSON.stringify(state,null,1));fs.mkdirSync(`${DIR}/reports`,{recursive:true});fs.writeFileSync(`${DIR}/reports/${today}.md`,report.join('\n'));fs.writeFileSync(`${DIR}/latest-report.md`,report.join('\n'));
console.log(report.join('\n'));
