"""KS2 by year, SATs reasoning papers and the Year 4 multiplication tables check (2.84). Year 3–5 children get only
national-curriculum questions for their year (no 11+ puzzles, nothing from later years); the SATs mock offers
Paper 1 (arithmetic) and Papers 2 and 3 (reasoning); the tables check gives 6 seconds a question and moves on by
itself; a Year 4 child's plan offers the check; charts and tables draw; the question engine serves the new exams."""
from rig import *

KS2 = ['arith_add', 'arith_mult', 'arith_div', 'arith_frac', 'arith_pct', 'ks2_number', 'ks2_measure', 'ks2_shape', 'ks2_stats', 'ks2_problems', 'mtc_tables', 'ks1_number', 'ks1_calc', 'ks1_mult', 'ks1_measure', 'ks1_shape']
REASON = ['ks2_number', 'ks2_measure', 'ks2_shape', 'ks2_stats', 'ks2_problems']
SAMPLE = """(()=>{chosenTopic='mixed';mode='training';const seen={},late=[];let n=0;for(let i=0;i<300;i++){finished=false;matchDone=0;done=false;newQuestion();
  const g=bank[current.topic][current.generator];seen[current.topic]=(seen[current.topic]||0)+1;if(g.years&&g.years[0]>childYear())late.push(current.topic);n++;}
  const shown=[...document.querySelectorAll('#topics [data-topic]')].filter(b=>!b.classList.contains('hidden')&&topics[b.dataset.topic]).map(b=>b.dataset.topic);
  return {exam:examId(),year:childYear(),seen,late:late.slice(0,5),shown,focus:stats.focus.slice()};})()"""

async def main(p):
    R = Result('ks2')
    pg = await browser(p, 1366, 900); await open_app(pg)

    # 1. Year 3 and Year 5 practice
    for exam, year in (('y3', 3), ('y5', 5)):
        await add_player(pg, f'Kid{year}', exam=exam, theme='animals')
        s = await pg.evaluate(SAMPLE)
        R.check(s['exam'] == exam and s['year'] == year, f'a Year {year} child can be added with “Year {year} maths”', s['exam'])
        R.check(set(s['seen']) <= set(KS2) and len(s['seen']) >= 6, f'Year {year}: only national-curriculum topics come up (no 11+ puzzles)', sorted(s['seen']))
        R.check(not s['late'], f'Year {year}: nothing taught after Year {year} (300 questions)', s['late'])
        R.check(set(s['shown']) <= set(KS2) and set(s['focus']) <= set(s['shown']) and len(s['focus']) == 5, f'Year {year}: the topic grid and focus topics match', {'shown': len(s['shown']), 'focus': s['focus']})
    y3 = await pg.evaluate("(()=>{stats.year=0;setExam('y3');return {pct:examWeight('arith_pct'),frac:examWeight('arith_frac'),ratio:examWeight('ratio')}})()")
    R.check(y3 == {'pct': 0, 'frac': 0, 'ratio': 0}, 'Year 3: percentages, fraction sums and 11+ ratio puzzles are held back', y3)

    # 2. SATs: three papers in Mock exam
    await add_player(pg, 'Sam', exam='ks2sats', theme='space')
    await pg.wait_for_timeout(1500); await close_dialogs(pg)
    await pg.evaluate("document.querySelector('[data-mode=mock]').click()"); await pg.wait_for_timeout(500); await close_dialogs(pg)
    chips = await pg.evaluate("[...document.querySelectorAll('#paperPick [data-paper]')].map(b=>b.textContent)")
    R.check(len(chips) == 3 and 'Paper 2: reasoning' in chips[1], 'Mock exam offers SATs Papers 1, 2 and 3', chips)
    await pg.click('#paperPick [data-paper="1"]'); await pg.wait_for_timeout(600); await close_dialogs(pg)
    m = await pg.evaluate("({mode,target,mins:examMock().mins,paper:examMock().paper,btn:(document.querySelector('[data-mode=mock]')||{}).textContent})")
    R.check(m['mode'] == 'mock' and m['target'] == 24 and m['mins'] == 40, 'Paper 2 is 24 questions in 40 minutes', m)
    tps = set()
    for i in range(8):
        tps.add(await pg.evaluate('current.topic')); await answer(pg, right=True)
    R.check(tps <= set(REASON) and len(tps) >= 2, 'Paper 2 asks SATs-level reasoning questions', sorted(tps))
    await pg.evaluate("finishSession()"); await pg.wait_for_timeout(400)
    fb = await pg.evaluate("document.getElementById('feedback').textContent")
    R.check('Paper 2: reasoning' in fb and 'marks' in fb, 'Paper 2 is scored in marks', fb[-90:])
    await close_dialogs(pg); await pg.click('#paperPick [data-paper="0"]'); await pg.wait_for_timeout(500); await close_dialogs(pg)
    R.check(await pg.evaluate("target===36&&ARITH0.includes(current.topic)".replace('ARITH0', json.dumps(KS2[:5]))), 'Paper 1 is still 36 arithmetic questions')
    await pg.evaluate("setMode('training');restartSession()"); await pg.wait_for_timeout(300)

    # 3. the Year 4 tables check: 25 questions, 6 seconds each, moves on by itself
    await add_player(pg, 'Tia', exam='mtc', theme='music')
    await pg.evaluate("document.querySelector('[data-mode=mock]').click()"); await pg.wait_for_timeout(300)
    await pg.evaluate("document.getElementById('startMode').click()"); await pg.wait_for_timeout(500); await close_dialogs(pg)
    t = await pg.evaluate("({target,topic:current.topic,box:(document.getElementById('perQ')||{}).textContent||'',chips:document.querySelectorAll('#paperPick [data-paper]').length})")
    R.check(t['target'] == 25 and t['topic'] == 'mtc_tables' and '6 second' in t['box'] and t['chips'] == 0, 'the tables check is 25 times-table questions with a 6-second countdown', t)
    q0 = await pg.evaluate('current.q'); await pg.wait_for_timeout(8200)
    t2 = await pg.evaluate("({q:current.q,done:matchDone,last:sessionLog.length?sessionLog[sessionLog.length-1].correct:null})")
    R.check(t2['done'] == 1 and t2['last'] is False, 'after 6 seconds without an answer it counts as missed and moves on', t2)
    await pg.fill('#answer', await pg.evaluate('fmtAns(current)')); await pg.click('#check')
    ok = await until(pg, "matchDone===2&&!done", 4000)
    R.check(bool(ok), 'after an answer it moves straight on to the next question (no Next button)')
    await pg.evaluate("finishSession()"); await pg.wait_for_timeout(300)
    R.check('out of' in await pg.evaluate("document.getElementById('feedback').textContent"), 'the check reports a score in marks')
    await pg.evaluate("setMode('training');restartSession()"); await pg.wait_for_timeout(300)

    # 4. a Year 4 child's plan offers the check
    await pg.evaluate("stats.examPlan=[{id:'y4',school:'',date:'',result:''}];syncExam(stats);save(false)")
    await pg.evaluate("Parent.open('plan')"); await pg.wait_for_timeout(400)
    await pg.evaluate("document.querySelector('#parent [data-ptab=\"plan\"]').click()"); await pg.wait_for_timeout(300)
    has = await pg.evaluate("!!document.querySelector('#parent [data-plan-offer=mtc]')&&!document.querySelector('#parent [data-plan-offer=ks2sats]')")
    R.check(has, 'a Year 4 plan offers “Add the times-tables check” (and not SATs)')
    if has:
        await pg.click('#parent [data-plan-offer=mtc]'); await pg.wait_for_timeout(400)
        R.check('mtc@2027-06-18' in await pg.evaluate("stats.examPlan.map(e=>e.id+'@'+e.date)"), 'it adds the check (window ends 18 June 2027)')
    await close_dialogs(pg)

    # 5. charts, tables, lessons and explainers for every new topic
    figs = await pg.evaluate("""(()=>{const bad=[];for(const k of %s){const L=learnMissions[k];if(!L||L.length<4)bad.push(k+': lesson');if(!explainers[k])bad.push(k+': explainer');
      bank[k].forEach((g,i)=>{const q=g();if(q.fig){const h=renderFigure(q.fig);if(!h||h.length<50)bad.push(k+'#'+i+': figure');}});}return bad;})()""" % json.dumps(KS2[5:11]))
    R.check(not figs, 'every new topic has a lesson and an explainer, and its charts and tables draw', figs)
    try:
        await pg.goto(f'{serve()}/ApolloMaths/engine.html'); await pg.wait_for_timeout(600)
        eng = await pg.evaluate("(()=>{const ids=Engine.exams().map(e=>e.id);let n=0;for(let i=0;i<30;i++)if(Engine.ask('trade','y4','Sam'))n++;return {ids,n}})()")
        R.check(all(x in eng['ids'] for x in ('y3', 'y4', 'y5', 'mtc', 'ks2sats')) and eng['n'] > 5, 'the question engine (for Starlane) serves the new exams', eng)
    except Exception as e: R.check(False, 'the question engine (for Starlane) serves the new exams', str(e)[:120])
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
