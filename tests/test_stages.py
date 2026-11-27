"""Key stages, school years and KS2 SATs (2.83). A new SATs child gets arithmetic focus topics and arithmetic
questions; other exams never see the SATs topics (practice, topic grid, Starlane); the SATs Paper 1 mock is 36
arithmetic questions in 30 minutes and is scored in marks; the school year set in Grown-ups → Plan holds back
questions taught in later years; a Year 6 child's plan offers "Add KS2 SATs"; fraction answers are marked fairly;
the new saved fields survive a progress file; the new topics have lessons and explainers."""
from rig import *
import datetime

ARITH = ['arith_add', 'arith_mult', 'arith_div', 'arith_frac', 'arith_pct']

async def open_plan(pg):
    await pg.evaluate("Parent.open('plan')"); await pg.wait_for_timeout(400)
    await pg.evaluate("document.querySelector('#parent [data-ptab=\"plan\"]').click()"); await pg.wait_for_timeout(300)

async def main(p):
    R = Result('stages')
    pg = await browser(p, 1366, 900); await open_app(pg)
    await add_player(pg, 'Sam', exam='ks2sats', theme='space')

    # 1. a SATs child: exam, focus, questions
    s = await pg.evaluate("({exam:examId(),year:childYear(),focus:stats.focus.slice(),badge:(document.querySelector('.exam-badge')||{}).textContent||''})")
    R.check(s['exam'] == 'ks2sats' and 'SATs' in s['badge'], 'a new player can choose KS2 SATs on the form', s['badge'][:60])
    R.check(s['year'] == 6, 'a SATs child is in Year 6 unless a grown-up says otherwise', s['year'])
    R.check(set(s['focus']) == set(ARITH), 'her focus topics are the five arithmetic topics', s['focus'])
    mix = await pg.evaluate("""(()=>{chosenTopic='mixed';mode='training';const seen={};let bad=0;for(let i=0;i<400;i++){finished=false;matchDone=0;done=false;newQuestion();
      seen[current.topic]=(seen[current.topic]||0)+1;if(examWeight(current.topic)===0||!suitsExam(bank[current.topic][current.generator]))bad++;}return {seen,bad};})()""")
    arith = sum(v for k, v in mix['seen'].items() if k in ARITH)
    R.check(mix['bad'] == 0, 'mixed practice only serves topics and types that suit SATs (400 questions)', mix['bad'])
    sats = arith + sum(v for k, v in mix['seen'].items() if k.startswith('ks2_'))
    R.check(arith >= 70 and sats >= 240 and not any(k in mix['seen'] for k in ('speed', 'probability', 'tiffin')), 'arithmetic and SATs reasoning make up most practice; topics outside the KS2 curriculum never do', f'{arith} arithmetic, {sats} SATs-level of 400')
    grid = await pg.evaluate("ARITH=%s;ARITH.filter(k=>{const b=document.querySelector('#topics [data-topic='+k+']');return b&&!b.classList.contains('hidden')}).length" % json.dumps(ARITH))
    R.check(grid == 5, 'the five arithmetic topics are in her topic grid', grid)

    # 2. the Paper 1 mock: 36 arithmetic questions, 30 minutes, scored in marks
    await pg.evaluate("const m=document.querySelector('[data-mode=mock]');m.click()"); await pg.wait_for_timeout(300)
    await pg.evaluate("document.getElementById('startMode').click()"); await pg.wait_for_timeout(600); await close_dialogs(pg)
    mk = await pg.evaluate("({mode,target,mins:examMock().mins,topic:current&&current.topic,btn:(document.querySelector('[data-mode=mock]')||{}).textContent})")
    R.check(mk['mode'] == 'mock' and mk['target'] == 36 and mk['mins'] == 30, 'the SATs mock is 36 questions in 30 minutes', mk)
    tps = set()
    for i in range(6):
        tps.add(await pg.evaluate('current.topic')); await answer(pg, right=True)
    R.check(tps <= set(ARITH), 'every mock question is arithmetic (Paper 1)', sorted(tps))
    await pg.evaluate("finishSession()"); await pg.wait_for_timeout(500)
    fin = await pg.evaluate("({fb:document.getElementById('feedback').textContent,m:stats.mocks[stats.mocks.length-1]})")
    R.check('marks' in fin['fb'] and fin['m'].get('mkOf', 0) >= 6 and fin['m']['mk'] >= 6, 'the mock is scored in marks too', fin['m'])
    clean = await pg.evaluate("(()=>{const c=cleanStats(JSON.parse(JSON.stringify(Object.assign({},stats,{year:4,mocks:[...stats.mocks,{t:1,score:47,total:50,secs:60}]}))));return {year:c.year,mk:c.mocks[c.mocks.length-2].mkOf,big:c.mocks[c.mocks.length-1].total};})()")
    R.check(clean['year'] == 4 and clean['mk'] and clean['big'] == 50, 'school year, mock marks and 50-question mocks survive a progress file', clean)
    await pg.evaluate("setMode('training');restartSession()"); await pg.wait_for_timeout(300)

    # 3. fraction answers are marked like the real test: equivalent forms and mixed numbers
    fr = await pg.evaluate("""(()=>{const out=[];for(let i=0;i<30;i++){const q=bank.arith_frac[1]();const [n,d]=[Math.round(q.a*1e6),1e6];
      out.push(judge(q,q.show)==='ok');}const q={a:13/10,kind:'frac',show:'1 3/10'};out.push(judge(q,'13/10')==='ok',judge(q,'1 3/10')==='ok',judge(q,'1.3')==='ok',judge(q,'26/20')==='ok',judge(q,'1 1/3')==='wrong');
      const n={a:-8,alts:['−8']};out.push(judge(n,'-8')==='ok',judge(n,'−8')==='ok');return out.every(Boolean);})()""")
    R.check(fr, 'fractions accept equivalent, improper and mixed forms; negatives accept either minus sign')

    # 4. school year: set to Year 4 in Grown-ups → Plan, later-year questions are held back
    await open_plan(pg)
    has_year = await pg.evaluate("!!document.querySelector('#parent [data-year-pick]')")
    R.check(has_year, 'the Plan tab has a School year picker')
    if has_year:
        await pg.locator('#parent [data-year-pick]').select_option('4'); await pg.wait_for_timeout(600); await close_dialogs(pg)
        y = await pg.evaluate("""(()=>{let late=0,n=0;for(const k of %s){chosenTopic=k;for(let i=0;i<20;i++){finished=false;matchDone=0;done=false;newQuestion();const g=bank[current.topic][current.generator];n++;if(g.years&&g.years[0]>4)late++;}}
          chosenTopic='mixed';return {year:stats.year,child:childYear(),late,n};})()""" % json.dumps(ARITH))
        R.check(y['year'] == 4 and y['child'] == 4, 'the picker sets the school year', y)
        R.check(y['late'] == 0, 'a Year 4 child gets no questions taught in Year 5 or 6', f"{y['late']} of {y['n']}")
        hidden = await pg.evaluate("document.querySelector('#topics [data-topic=arith_pct]').classList.contains('hidden')&&examWeight('arith_pct')===0")
        R.check(hidden, 'a topic with nothing for Year 4 yet (percentages) is held back altogether')
        await open_plan(pg); await pg.locator('#parent [data-year-pick]').select_option('0'); await pg.wait_for_timeout(400); await close_dialogs(pg)
        R.check(await pg.evaluate("stats.year===0&&childYear()===6"), '“Not set” goes back to the exam’s year')

    # 5. other exams never see the SATs topics
    other = await pg.evaluate("""(()=>{setExam('tiffin2');chosenTopic='arith_mult';mode='training';let bad=0;for(let i=0;i<300;i++){finished=false;matchDone=0;done=false;newQuestion();if(%s.includes(current.topic))bad++;}
      drawTopics();const shown=%s.filter(k=>{const b=document.querySelector('#topics [data-topic='+k+']');return b&&!b.classList.contains('hidden')}).length;
      let sl=0;for(let i=0;i<200;i++){const q=examQuestion('trade');if(q&&%s.includes(q.topic))sl++;}return {bad,shown,sl,chosen:chosenTopic,focus:examFocusFor('grammar11').filter(k=>%s.includes(k)).length};})()""" % ((json.dumps(ARITH),) * 4))
    R.check(other['bad'] == 0 and other['chosen'] == 'mixed', 'a Tiffin child never gets SATs arithmetic, even if it was the chosen topic', other)
    R.check(other['shown'] == 0, 'the SATs topics are hidden from other exams’ topic grids', other['shown'])
    R.check(other['sl'] == 0 and other['focus'] == 0, 'Starlane questions and focus topics for other exams leave them out too', other)
    await pg.evaluate("setExam('ks2sats')"); await pg.wait_for_timeout(300)
    sl = await pg.evaluate("(()=>{let n=0,a=0;for(let i=0;i<200;i++){const q=examQuestion('trade');if(q){n++;if(%s.includes(q.topic))a++;}}return {n,a};})()" % json.dumps(ARITH))
    R.check(sl['n'] > 0 and sl['a'] > 0, 'Starlane asks a SATs child SATs questions, arithmetic included', sl)

    # 6. "Add KS2 SATs" for a Year 6 child preparing for another exam
    if datetime.date.today().isoformat() <= '2027-05-13':
        await pg.evaluate("stats.examPlan=[{id:'iseb',school:'Eton',date:'2026-11-30',result:''}];syncExam(stats);save(false)")
        await open_plan(pg)
        btn = await pg.evaluate("!!document.querySelector('#parent [data-plan-sats]')")
        R.check(btn, 'a Year 6 child’s plan offers “Add KS2 SATs”')
        if btn:
            await pg.click('#parent [data-plan-sats]'); await pg.wait_for_timeout(500); await close_dialogs(pg)
            pl = await pg.evaluate("({plan:stats.examPlan.map(e=>e.id+'@'+e.date),again:!!document.querySelector('#parent [data-plan-sats]')})")
            R.check('ks2sats@2027-05-13' in pl['plan'] and 'iseb@2026-11-30' in pl['plan'] and not pl['again'], 'it adds SATs (13 May 2027) and keeps the other tests', pl)
        await pg.evaluate("stats.year=8;stats.examPlan=[{id:'ce13',school:'',date:'',result:''}];syncExam(stats)"); await open_plan(pg)
        R.check(not await pg.evaluate("!!document.querySelector('#parent [data-plan-sats]')"), 'it is not offered outside Year 6')
        await pg.evaluate("stats.year=0;stats.examPlan=[{id:'ks2sats',school:'',date:'2027-05-13',result:''}];syncExam(stats);save(false)")
    else: R.skip('Add KS2 SATs', 'the 2027 tests have passed — update SATS_DAY')
    dates = await pg.evaluate("datesBlock(stats)")
    R.check('12 May 2027' in dates and '13 May 2027' in dates, 'Key dates show the SATs maths days', '')

    # 7. lessons and explainers for every new topic, without errors
    ln = await pg.evaluate("""(()=>{const bad=[];for(const k of %s){const L=learnMissions[k];if(!L||L.length<4||L.some(s=>!s.check||s.check.options.length<3))bad.push(k+': lesson');if(!explainers[k])bad.push(k+': explainer');}
      try{Learn.open('arith_frac');}catch(e){bad.push('open: '+e.message);}return bad;})()""" % json.dumps(ARITH))
    await pg.wait_for_timeout(500)
    R.check(not ln and await pg.evaluate("!!document.querySelector('dialog[open]')"), 'every SATs topic has a Learn mission and an explainer, and lessons open', ln)
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
