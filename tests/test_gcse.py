"""GCSE groundwork (2.86): a GCSE child gets the senior look class and maths drawn by KaTeX; Foundation/Higher from the
Plan keeps questions to the tier; mock papers include a non-calculator paper with no calculator questions; algebra
answers are marked by value with feedback on the form (expand / factorise); quadratics accept both answers in any
order; simultaneous equations take (x, y); graphs draw; the formula sheet opens; grown-ups can choose the look; Starlane
never gets LaTeX; GCSE topics have lessons and explainers."""
from rig import *

GCSE = ['gcse_number', 'gcse_algebra', 'gcse_graphs', 'gcse_ratio', 'gcse_geometry', 'gcse_measures', 'gcse_stats']
FIND = """(async(tp,gi)=>{chosenTopic=tp;mode='training';for(let i=0;i<400;i++){finished=false;matchDone=0;done=false;newQuestion();if(current.generator===gi)break;}await new Promise(r=>setTimeout(r,200));return current.q;})"""

async def type_answer(pg, txt):
    await close_dialogs(pg); await pg.fill('#answer', txt); await pg.click('#check'); await pg.wait_for_timeout(250)
    return await pg.evaluate("({done,fb:document.getElementById('feedback').textContent})")

async def main(p):
    R = Result('gcse')
    pg = await browser(p, 1366, 900); await open_app(pg)
    await add_player(pg, 'Jo', exam='gcse_aqa', theme='football'); await pg.wait_for_timeout(1500); await close_dialogs(pg)

    # 1. look, stage and maths display
    s = await pg.evaluate("({exam:examId(),stage:examStage(),senior:document.body.classList.contains('look-senior'),year:childYear(),tier:childTier()})")
    R.check(s['exam'] == 'gcse_aqa' and s['stage'] == 'gcse' and s['senior'] and s['tier'] == 'H', 'a GCSE child is on AQA Higher with the senior look switched on', s)
    ok = await until(pg, "!!window.katex", 8000)
    q = await pg.evaluate(FIND + "('gcse_algebra',3)")
    await pg.wait_for_timeout(300)
    html = await pg.evaluate("document.getElementById('question').innerHTML")
    R.check(bool(ok) and 'katex' in html and '\\(' not in html, 'maths is drawn by KaTeX (kept in the repo), not shown as code', q[:60])

    # 2. tiers
    tiers = await pg.evaluate("""(()=>{const run=t=>{stats.examPlan[0].tier=t;syncExam(stats);let off=0;chosenTopic='mixed';for(let i=0;i<300;i++){finished=false;matchDone=0;done=false;newQuestion();const g=bank[current.topic][current.generator];if(g.tier&&g.tier!==t)off++;}return off;};
      const r={F:run('F'),H:run('H')};return r;})()""")
    R.check(tiers == {'F': 0, 'H': 0}, 'Foundation never gets Higher-only questions, and Higher never gets Foundation-only ones', tiers)
    await pg.evaluate("Parent.open('plan')"); await pg.wait_for_timeout(400)
    await pg.evaluate("document.querySelector('#parent [data-ptab=\"plan\"]').click()"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate("!!document.querySelector('#parent select[data-plan=tier]')&&!!document.querySelector('#parent [data-look-pick]')"), 'the Plan tab offers Foundation/Higher and the Look')
    await close_dialogs(pg)

    # 3. papers: Paper 1 is non-calculator
    await pg.evaluate("document.querySelector('[data-mode=mock]').click()"); await pg.wait_for_timeout(400); await close_dialogs(pg)
    chips = await pg.evaluate("[...document.querySelectorAll('#paperPick [data-paper]')].map(b=>b.textContent)")
    R.check(len(chips) == 3 and 'non-calculator' in chips[0], 'AQA has three papers, Paper 1 non-calculator', chips)
    await pg.evaluate("document.querySelector('#paperPick [data-paper=\"0\"]').click()"); await pg.wait_for_timeout(400); await close_dialogs(pg)
    nc = await pg.evaluate("""(()=>{let calc=0,n=0;for(let i=0;i<60;i++){done=true;finished=false;matchDone=0;newQuestion();const g=bank[current.topic][current.generator];n++;if(g.calc)calc++;}return {calc,n,tag:document.getElementById('methodTag').textContent};})()""")
    R.check(nc['calc'] == 0 and 'Non-calculator' in nc['tag'], 'the non-calculator paper never asks a calculator question', nc)
    await pg.evaluate("setMode('training');restartSession()"); await pg.wait_for_timeout(300); await close_dialogs(pg)

    # 4. answers: expressions, quadratics, coordinates
    await pg.evaluate(FIND + "('gcse_algebra',2)")
    ans = await pg.evaluate("current.ans"); fact = await pg.evaluate("current.q.match(/\\\\\\((.*)\\\\\\)/)[1]")
    r1 = await type_answer(pg, fact.replace('\\left','').replace('\\right',''))
    R.check(not r1['done'] and 'EXPAND' in r1['fb'], 'the right value still in brackets gets “now EXPAND it”', r1['fb'][:70])
    r2 = await type_answer(pg, await pg.evaluate("current.show"))
    R.check(r2['done'], 'the expanded answer is marked right', r2['fb'][:50])
    await pg.evaluate(FIND + "('gcse_algebra',3)")
    vals = await pg.evaluate("current.vals")
    r3 = await type_answer(pg, f"x = {vals[1]}, x = {vals[0]}")
    R.check(r3['done'], 'a quadratic’s two answers are accepted in either order', vals)
    await pg.evaluate(FIND + "('gcse_algebra',6)")
    v = await pg.evaluate("current.vals")
    r4 = await type_answer(pg, f"({v[1]}, {v[0]})")
    r5 = await type_answer(pg, f"({v[0]}, {v[1]})")
    R.check((not r4['done'] or v[0] == v[1]) and r5['done'], 'simultaneous equations need (x, y) in the right order', v)

    # 5. graph, formula sheet
    await pg.evaluate("stats.examPlan[0].tier='F';syncExam(stats)"); await pg.evaluate(FIND + "('gcse_algebra',8)")
    R.check(await pg.evaluate("!!document.querySelector('#figure svg path')"), 'a straight-line graph is drawn for the y-intercept question')
    await pg.evaluate("document.getElementById('formulaBtn').click()"); await pg.wait_for_timeout(600)
    fs = await pg.evaluate("(()=>{const d=document.getElementById('formulaSheet');return {open:!!(d&&d.open),katex:d?d.querySelectorAll('.katex').length:0}})()")
    R.check(fs['open'] and fs['katex'] >= 10, 'the 📐 formula sheet opens with the formulas drawn properly', fs)
    await close_dialogs(pg); await pg.evaluate("stats.examPlan[0].tier='H';syncExam(stats)")

    # 6. the look can be chosen; younger children keep the children's look
    lk = await pg.evaluate("""(()=>{const r={};stats.look='junior';Look.apply();r.junior=document.body.classList.contains('look-senior');stats.look='auto';Look.apply();r.auto=document.body.classList.contains('look-senior');return r;})()""")
    R.check(lk == {'junior': False, 'auto': True}, 'grown-ups can switch a GCSE child to the children’s look and back', lk)
    await add_player(pg, 'Kit', exam='y5', theme='space'); await pg.wait_for_timeout(1200); await close_dialogs(pg)
    y5 = await pg.evaluate("({senior:document.body.classList.contains('look-senior'),katexReq:!!document.querySelector('script[src*=katex]')})")
    R.check(not y5['senior'] and not y5['katexReq'], 'a Year 5 child keeps today’s look and never loads the maths library', y5)

    # 6b. 2.88: Foundation content, seven topics, the estimated grade
    cov = await pg.evaluate("(()=>{const ks=Object.keys(bank).filter(k=>/^gcse_/.test(k));return {topics:ks.length,types:ks.reduce((n,k)=>n+bank[k].length,0),f:ks.reduce((n,k)=>n+bank[k].filter(g=>g.tier==='F').length,0)}})()")
    R.check(cov['topics'] >= 7 and cov['types'] >= 120 and cov['f'] >= 25, 'GCSE has seven topics and 120+ question types, with Foundation-only ones', cov)
    await pg.evaluate("setExam('gcse_aqa');stats.examPlan[0].tier='H';syncExam(stats)")
    g0 = await pg.evaluate("(()=>{stats.mocks=stats.mocks.filter(m=>!m.ex);return GcseGrade.grade();})()")
    g1 = await pg.evaluate("(()=>{stats.mocks.push({t:Date.now(),score:20,total:25,secs:60,timedOut:false,mk:55,mkOf:80,ex:'gcse_aqa',tier:'H',paper:'p1'});return GcseGrade.grade();})()")
    g2 = await pg.evaluate("(()=>{stats.mocks.push({t:Date.now(),score:24,total:25,secs:60,timedOut:false,mk:78,mkOf:80,ex:'gcse_aqa',tier:'H',paper:'p2'});return GcseGrade.grade();})()")
    R.check(g0['n'] == 0 and g1['grade'] == 7 and g2['grade'] == 8, 'the estimated grade follows mock marks (68.75% → 7; then 83% → 8)', {'none': g0, 'one': g1, 'two': g2})
    await pg.wait_for_timeout(1700)
    R.check('Estimated grade' in await pg.evaluate("(document.getElementById('gradeChip')||{}).textContent||''"), 'the estimated grade shows at the top of the page')
    cl = await pg.evaluate("(()=>{const c=cleanStats(JSON.parse(JSON.stringify(stats)));const m=c.mocks[c.mocks.length-1];return {ex:m.ex,tier:m.tier,paper:m.paper,mk:m.mk}})()")
    R.check(cl == {'ex': 'gcse_aqa', 'tier': 'H', 'paper': 'p2', 'mk': 78}, 'mock exam, tier and paper survive a progress file', cl)

    # 6c. 2.89: Higher content and every board
    hi = await pg.evaluate("(()=>{const ks=Object.keys(bank).filter(k=>/^gcse_/.test(k));return {types:ks.reduce((n,k)=>n+bank[k].length,0),h:ks.reduce((n,k)=>n+bank[k].filter(g=>g.tier==='H').length,0)}})()")
    R.check(hi['types'] >= 180 and hi['h'] >= 70, 'GCSE has 180+ question types, 70+ of them Higher-only', hi)
    boards = await pg.evaluate("""(()=>{const out={};for(const id of ['gcse_aqa','gcse_edexcel','gcse_ocr','gcse_eduqas','gcse_wjec','gcse_ccea','igcse_edexcel','igcse_cambridge']){const p=EXAMS[id];
      const own=Object.keys(topics).filter(k=>/^gcse_/.test(k)).every(k=>topics[k].exams.includes(id));out[id]={papers:(p.papers||[]).length,nonCalc:(p.papers||[]).filter(x=>x.calc===false).length,own,inOrder:EXAM_ORDER.includes(id)};}return out;})()""")
    R.check(all(b['papers'] >= 2 and b['own'] and b['inOrder'] for b in boards.values()) and boards['igcse_edexcel']['nonCalc'] == 0 and boards['gcse_eduqas']['nonCalc'] == 1, 'all eight GCSE / IGCSE boards have their papers and the GCSE questions', boards)
    cam = await pg.evaluate("""(()=>{stats.examPlan=[{id:'igcse_cambridge',school:'',date:'',result:'',tier:'F'}];syncExam(stats);const m=examMock();const g=GcseGrade.grade();
      stats.mocks.push({t:Date.now(),score:10,total:20,secs:60,timedOut:false,mk:40,mkOf:80,ex:'igcse_cambridge',tier:'F',paper:'p1'});const g2=GcseGrade.grade();
      stats.examPlan=[{id:'gcse_aqa',school:'',date:'',result:'',tier:'H'}];syncExam(stats);return {mins:m.mins,marks:m.marks,letters:g2.letters,pct:g2.pct};})()""")
    R.check(cam == {'mins': 90, 'marks': 80, 'letters': True, 'pct': 50}, 'Cambridge Core papers are 90 minutes / 80 marks, and letter-graded boards show a mock % instead of a 9–1 grade', cam)

    # 7. Starlane, lessons, explainers
    sl = await pg.evaluate("""(()=>{setExam('gcse_aqa');let n=0,bad=0;for(let i=0;i<200;i++){const q=examQuestion('trade');if(q){n++;if(/\\\\\\(|\\\\frac/.test(q.q))bad++;}}return {n,bad};})()""")
    R.check(sl['bad'] == 0, 'Starlane never gets LaTeX or algebra answers it can’t show', sl)
    ln = await pg.evaluate("(()=>{const bad=[];for(const k of %s){if(!learnMissions[k]||learnMissions[k].length<4)bad.push(k);if(!explainers[k])bad.push(k+' explainer');}return bad;})()" % json.dumps(GCSE))
    R.check(not ln, 'every GCSE topic has a lesson and an explainer', ln)
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
