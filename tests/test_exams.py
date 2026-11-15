"""The question bank follows the exam. For every exam, mixed practice only serves question types meant for it
(13+ questions never reach an 11+ child, and the reverse). Changing the exam in Grown-ups → Plan — at phone,
tablet, laptop and huge-screen sizes — refreshes the child's page at once: a new question from the new exam,
the header badge, mock length, focus topics, today's plan and "Next best thing". A mock in progress restarts
at the new length, a grown-up's own focus topics are kept, Fix-it never serves another exam's question types,
a test date passing moves training on to the next test, and Starlane's questions follow too."""
from rig import *

EXAMS = ['tiffin1', 'tiffin2', 'grammar11', 'iseb', 'ce13']
# what the child's page says right now
SNAP = """(()=>{const g=current&&bank[current.topic][current.generator];return {exam:examId(),q:current&&current.q,
 suits:!!g&&suitsExam(g),badge:(document.querySelector('.exam-badge')||{}).textContent||'',
 mock:(document.querySelector('[data-mode=mock]')||{}).textContent||'',focus:stats.focus.slice(),
 focusFlags:Object.keys(topics).filter(k=>topics[k].focus),
 plan:(document.getElementById('planCard')||{}).textContent||'',next:(document.getElementById('nextBestTxt')||{}).textContent||'',
 grid:(document.getElementById('focusGrid')||{}).textContent||''};})()"""

async def plan_select(pg, exam):
    """Open Grown-ups → Plan and choose an exam in the first row of the plan, as a parent would."""
    await pg.evaluate("Parent.open('plan')"); await pg.wait_for_timeout(400)
    await pg.evaluate("document.querySelector('#parent [data-ptab=\"plan\"]').click()"); await pg.wait_for_timeout(300)
    sel = '#parent select[data-plan="id"]'
    await pg.locator(sel).first.scroll_into_view_if_needed()
    box = await pg.locator(sel).first.bounding_box()
    vw = await pg.evaluate('window.innerWidth')
    fits = bool(box) and box['x'] >= 0 and box['x'] + box['width'] <= vw + 1
    await pg.locator(sel).first.select_option(exam); await pg.wait_for_timeout(700)
    await close_dialogs(pg); await pg.wait_for_timeout(300)
    return fits

async def main(p):
    R = Result('exams')
    pg = await browser(p, 1366, 900); await open_app(pg)
    await add_player(pg, 'Ada', exam='tiffin2', theme='space')

    # 1. the bank: every exam gets only its own question types, across every topic
    bank = await pg.evaluate("""(()=>{const out={};for(const ex of %s){setExam(ex);chosenTopic='mixed';mode='training';const seen=new Set(),own=new Set();let off=0;
      for(let i=0;i<500;i++){finished=false;matchDone=0;done=false;newQuestion();const g=bank[current.topic][current.generator];seen.add(current.topic);
        if(g.exams){if(g.exams.includes(ex))own.add(current.topic+':'+current.generator);else off++;}}
      out[ex]={exam:examId(),topics:seen.size,off,own:own.size,ownTotal:Object.values(bank).reduce((n,l)=>n+l.filter(g=>g.exams&&g.exams.includes(ex)).length,0)};}return out;})()""" % json.dumps(EXAMS))
    R.check(all(v['exam'] == k for k, v in bank.items()), 'setting each exam makes it the one being trained for', {k: v['exam'] for k, v in bank.items()})
    R.check(all(v['off'] == 0 for v in bank.values()), 'mixed practice never serves another exam’s question types (500 per exam)', {k: v['off'] for k, v in bank.items()})
    R.check(all(v['own'] > 0 for v in bank.values()), 'each exam’s own question types do come up', {k: f"{v['own']}/{v['ownTotal']}" for k, v in bank.items()})
    R.check(all(v['topics'] >= 20 for v in bank.values()), 'mixed practice covers the exam’s topics', {k: v['topics'] for k, v in bank.items()})
    topic_ok = await pg.evaluate("""(()=>{const bad=[];for(const ex of %s){setExam(ex);for(const k of Object.keys(bank)){chosenTopic=k;mode='training';
      for(let i=0;i<12;i++){finished=false;matchDone=0;done=false;newQuestion();if(!suitsExam(bank[current.topic][current.generator]))bad.push(ex+':'+k);}}}return bad.slice(0,5);})()""" % json.dumps(EXAMS))
    R.check(not topic_ok, 'single-topic missions also keep to the exam', topic_ok)
    await pg.evaluate("setExam('tiffin2');chosenTopic='mixed';restartSession()"); await pg.wait_for_timeout(500)

    # 2. changing the exam through Grown-ups → Plan refreshes the child's page straight away
    before = await pg.evaluate(SNAP)
    fits = await plan_select(pg, 'ce13')
    after = await pg.evaluate(SNAP)
    R.check(fits, 'the Plan tab exam picker is on screen (laptop)')
    R.check(after['exam'] == 'ce13' and '13+' in after['badge'], 'the header badge follows the new exam', after['badge'][:70])
    R.check('30-question' in after['mock'], 'the mock button follows the new exam’s length', after['mock'])
    R.check(after['q'] != before['q'] and after['suits'], 'the question on screen is replaced by one for the new exam', after['q'][:70])
    R.check(after['focus'] != before['focus'] and 'algebra' in after['focus'] and set(after['focusFlags']) == set(after['focus']), 'focus topics follow the new exam', after['focus'])
    lab = await pg.evaluate("topics[weakestFocus(stats)].label")
    R.check(lab in after['plan'] and lab in after['next'], "today's plan and Next best thing point at the new exam's focus", lab)
    labels = await pg.evaluate("stats.focus.map(k=>topics[k].label)")
    R.check(all(l in after['grid'] for l in labels), 'the focus cards show the new focus topics', labels)

    # 3. focus topics follow the exam until a grown-up chooses their own (Grown-ups → Focus areas)
    R.check(await pg.evaluate("stats.focusMine") is False, 'a new child’s focus topics follow the exam')
    await pg.evaluate("Parent.open('focus')"); await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelector('#parent [data-ptab=\"focus\"]').click()"); await pg.wait_for_timeout(300)
    auto_note = await pg.evaluate("document.querySelector('#parent .fz-current').textContent")
    await pg.evaluate("""(()=>{const want=['time','units','data','area','logic'];const box=()=>[...document.querySelectorAll('#parent [data-fz]')];box().filter(c=>c.checked&&!want.includes(c.dataset.fz)).forEach(c=>c.click());box().filter(c=>!c.checked&&want.includes(c.dataset.fz)).forEach(c=>c.click());
      document.querySelector('#parent [data-savefocus]').click();})()"""); await pg.wait_for_timeout(400)
    mine_note = await pg.evaluate("document.querySelector('#parent .fz-current').textContent")
    R.check('automatically' in auto_note and 'grown-up' in mine_note and await pg.evaluate("stats.focusMine"), 'saving focus areas marks them as the grown-up’s choice', mine_note[-60:])
    await close_dialogs(pg)
    await plan_select(pg, 'grammar11')
    R.check(await pg.evaluate("[...stats.focus].sort().join()") == 'area,data,logic,time,units', 'focus topics a grown-up chose stay when the exam changes')
    await pg.evaluate("Parent.open('focus')"); await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelector('#parent [data-ptab=\"focus\"]').click()"); await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelector('#parent [data-defocus]').click()"); await pg.wait_for_timeout(400)
    back = await pg.evaluate("({mine:stats.focusMine,same:stats.focus.join()===examFocusFor('grammar11').join(),flags:Object.keys(topics).filter(k=>topics[k].focus).sort().join()===[...stats.focus].sort().join()})")
    await close_dialogs(pg)
    R.check(back == {'mine': False, 'same': True, 'flags': True}, '“Follow the exam again” goes back to the exam’s focus topics', back)
    await plan_select(pg, 'iseb')
    R.check(await pg.evaluate("stats.focus.join()===examFocusFor('iseb').join()"), 'after that, focus follows the next exam change again')
    # an automatic focus that is out of step with the exam is put right when the app opens
    await pg.evaluate("stats.focus=['time','units','data','area','logic'];stats.focusMine=false;save(false);Storage.flush&&Storage.flush()")
    await pg.reload(); await pg.wait_for_timeout(2500); await close_dialogs(pg)
    R.check(await pg.evaluate("stats.focus.join()===examFocusFor(examId()).join()&&focusKeys.join()===stats.focus.join()"), 'on opening, focus topics are brought into line with the exam')
    await pg.evaluate("setExam('grammar11')"); await pg.wait_for_timeout(300)

    # 4. a mock in progress starts again at the new exam's length
    await pg.evaluate("document.querySelector('[data-mode=mock]').click()"); await pg.wait_for_timeout(300)
    await plan_select(pg, 'iseb')       # mock chosen but not started: the exam change must not start it
    ns = await pg.evaluate("({t:target,txt:document.getElementById('modeExplainer').textContent})")
    R.check(ns['t'] == 10 and ns['txt'].startswith('40 questions, 40 minutes'), 'a mock that has not started is not started by an exam change, and its description updates', ns)
    await plan_select(pg, 'grammar11')
    await pg.evaluate("document.getElementById('startMode').click()"); await pg.wait_for_timeout(500)
    await answer(pg, True)
    m0 = await pg.evaluate("({t:target,d:matchDone,mode})")
    await plan_select(pg, 'ce13')
    m1 = await pg.evaluate("({t:target,d:matchDone,mode,suits:suitsExam(bank[current.topic][current.generator])})")
    R.check(m0['t'] == 50 and m1['t'] == 30 and m1['d'] == 0 and m1['suits'], 'a mock in progress restarts at the new exam’s length', {'before': m0, 'after': m1})
    await pg.evaluate("document.querySelector('[data-mode=training]').click()"); await pg.wait_for_timeout(300)

    # 5. Fix-it never serves another exam's question types
    fx = await pg.evaluate("""(()=>{setExam('grammar11');const tp='algebra',g=bank[tp].findIndex(f=>f.exams&&f.exams.includes('ce13')&&!f.exams.includes('grammar11'));
      stats.fix=[{tp,g,due:0,n:1,q:'x'}];const due=fixDue(stats).length;chosenTopic='fixit';finished=false;matchDone=0;done=false;newQuestion();
      const r={g,due,served:current.topic===tp&&current.generator===g};stats.fix=[];chosenTopic='mixed';return r;})()""")
    R.check(fx['g'] >= 0 and fx['due'] == 0 and not fx['served'], 'Fix-it holds back a 13+ question type for an 11+ child', fx)

    # 6. when a test date passes, training moves on to the next test in the plan, and the page follows
    nx = await pg.evaluate("""(()=>{stats.examPlan=[{id:'tiffin2',school:'',date:'2020-01-10',result:''},{id:'iseb',school:'Eton',date:'2099-11-30',result:''}];
      const q=current.q;hdrLast='';examHeader();return q;})()""")
    await pg.wait_for_timeout(500); s = await pg.evaluate(SNAP)
    R.check(s['exam'] == 'iseb' and 'ISEB' in s['badge'] and s['q'] != nx and s['suits'], 'a passed test moves training on to the next one', s['badge'][:70])

    # 7. Starlane's questions follow the exam too
    sl = await pg.evaluate("(()=>{const out={};for(const ex of ['tiffin2','ce13']){setExam(ex);let q=null;for(let i=0;i<60&&!q;i++)q=examQuestion('trade');out[ex]=q&&q.exam;}return out;})()")
    R.check(sl == {'tiffin2': 'tiffin2', 'ce13': 'ce13'}, 'Starlane questions come from the child’s exam', sl)
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all()

    # 8. the same, on every kind of screen
    for label, w, h, mobile in (('phone', 375, 740, True), ('tablet', 820, 1180, True), ('laptop', 1366, 800, False), ('huge', 3000, 1600, False)):
        pg = await browser(p, w, h, mobile); await open_app(pg)
        await add_player(pg, 'Ben', exam='grammar11', theme='animals')
        b = await pg.evaluate(SNAP)
        fits = await plan_select(pg, 'ce13')
        a = await pg.evaluate(SNAP)
        wide = await pg.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1")
        await pg.evaluate("Parent.open('plan')"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelector('#parent [data-ptab=\"plan\"]').click()"); await pg.wait_for_timeout(300)
        room = await pg.evaluate("(()=>{const d=document.getElementById('parent').getBoundingClientRect(),b=document.querySelector('#parent .pd-body').getBoundingClientRect();return Math.round(100*b.height/d.height);})()")
        await pg.screenshot(path=str(OUT / f'exams-plan-{label}.png')); await close_dialogs(pg)
        R.check(room >= 45, f'[{label}] the dashboard content gets most of the window', f'{room}% of the height')
        ok = fits and a['exam'] == 'ce13' and a['suits'] and a['q'] != b['q'] and '30-question' in a['mock'] and a['focus'] != b['focus']
        R.check(ok and wide and not pg.errors, f'[{label} {w}px] changing the exam refreshes the page and fits the screen',
                {'picker on screen': fits, 'exam': a['exam'], 'new question': a['q'] != b['q'], 'no sideways scroll': wide, 'errors': pg.errors[:2]})
        await pg.close_all()
    return R

if __name__ == '__main__': run(main)
