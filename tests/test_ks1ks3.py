"""KS1 (Years 1–2) and KS3 (Years 7–9), 2.85. Year 1–2 children get only KS1 questions for their year, with pictures
that draw, tap-to-answer buttons in practice (a wrong tap leaves the others open), questions read aloud and clock
answers marked fairly; Year 2 has KS1-style papers. Year 7–9 children get KS3 questions held back by year (and no KS1/KS2
topics); 13+ CE now includes KS3 topics; every new topic has a lesson and explainer; the engine serves the new exams."""
from rig import *

KS1 = ['ks1_number', 'ks1_calc', 'ks1_mult', 'ks1_measure', 'ks1_shape']
KS3 = ['ks3_number', 'ks3_algebra', 'ks3_ratio', 'ks3_geometry', 'ks3_stats']
SAMPLE = """(()=>{chosenTopic='mixed';mode='training';const seen={},late=[];for(let i=0;i<300;i++){finished=false;matchDone=0;done=false;newQuestion();
  const g=bank[current.topic][current.generator];seen[current.topic]=(seen[current.topic]||0)+1;if(g.years&&g.years[0]>childYear())late.push(current.topic+'#'+current.generator);}
  return {exam:examId(),year:childYear(),seen,late:late.slice(0,5),focus:stats.focus.slice()};})()"""

async def main(p):
    R = Result('ks1ks3')
    pg = await browser(p, 1366, 900); await open_app(pg)
    await add_player(pg, 'Ella', exam='y1', theme='animals'); await pg.wait_for_timeout(1200); await close_dialogs(pg)

    # 1. Year 1: KS1 only, nothing from Year 2
    s = await pg.evaluate(SAMPLE)
    R.check(s['exam'] == 'y1' and set(s['seen']) <= set(KS1) and len(s['seen']) == 5, 'Year 1: only KS1 topics come up', sorted(s['seen']))
    R.check(not s['late'], 'Year 1: nothing taught in Year 2 (300 questions)', s['late'])
    R.check(set(s['focus']) <= set(KS1) and len(s['focus']) == 5, 'Year 1: focus topics are the KS1 topics', s['focus'])

    # 2. tap to answer in practice, with a second try after a wrong tap
    await pg.evaluate("chosenTopic='ks1_calc';setMode('training');restartSession()"); await pg.wait_for_timeout(500); await close_dialogs(pg)
    opts = await pg.evaluate("[...document.querySelectorAll('#mcqBox [data-mcq]')].map(b=>b.dataset.mcq)")
    R.check(len(opts) >= 3, 'practice questions show answer buttons to tap', opts)
    if opts:
        right = await pg.evaluate("String(current.a)")
        wrong = next((o for o in opts if o != right), None)
        await pg.click(f'#mcqBox [data-mcq="{wrong}"]'); await pg.wait_for_timeout(300)
        st = await pg.evaluate("({done,open:[...document.querySelectorAll('#mcqBox .mcq-opt')].filter(b=>!b.disabled).length})")
        R.check(not st['done'] and st['open'] >= 2, 'a wrong tap leaves the other answers open to try again', st)
        await pg.click(f'#mcqBox [data-mcq="{right}"]'); await pg.wait_for_timeout(300)
        R.check(await pg.evaluate("done===true"), 'tapping the right answer marks it right')

    # 3. read aloud (device speech replaced by a recorder)
    said = await pg.evaluate("""(async()=>{window.__said=[];Speech.say=(t)=>{window.__said.push(t)};try{Speech.ok=true;}catch(e){}stats.speech.announce=true;
      finished=false;matchDone=0;done=true;newQuestion();await new Promise(r=>setTimeout(r,700));return {said:window.__said,q:current.q};})()""")
    R.check(said['said'] and 'times' not in said['q'] and not any(ch in said['said'][-1] for ch in '×÷□'), 'Year 1 questions are read aloud (symbols said as words)', said['said'][-1:] if said['said'] else said)

    # 4. pictures draw, and clock answers are marked fairly
    figs = await pg.evaluate("""(()=>{const out={};for(const k of %s)bank[k].forEach((g,i)=>{for(let j=0;j<5;j++){const q=g();if(q.fig){const h=renderFigure(q.fig);out[q.fig[0]]=(out[q.fig[0]]||0)+(h&&h.includes('<svg')||h.includes('<table')?1:0);}}});return out;})()""" % json.dumps(KS1))
    R.check(all(figs.get(k, 0) > 0 for k in ('counters', 'tens', 'numline', 'array', 'clock', 'coins', 'fracshape')), 'clocks, coins, number lines, arrays, fraction shapes, tens and counters all draw', figs)
    clk = await pg.evaluate("""(()=>{const g=bank.ks1_measure[0];let q;do{q=g();}while(q.a%100!==30);const h=Math.floor(q.a/100);
      return [judge(q,h+':30'),judge(q,'half past '+h),judge(q,h+'.30'),judge(q,(h%12+1)+':30')];})()""")
    R.check(clk == ['ok', 'ok', 'ok', 'wrong'], 'clock answers accept 3:30, “half past 3” and 3.30', clk)

    # 5. Year 2 papers
    await add_player(pg, 'Finn', exam='y2', theme='space'); await pg.wait_for_timeout(1200); await close_dialogs(pg)
    await pg.evaluate("document.querySelector('[data-mode=mock]').click()"); await pg.wait_for_timeout(400); await close_dialogs(pg)
    chips = await pg.evaluate("[...document.querySelectorAll('#paperPick [data-paper]')].map(b=>b.textContent)")
    R.check(len(chips) == 2 and 'KS1 Paper 1' in chips[0], 'Year 2 has KS1-style Papers 1 and 2', chips)
    await pg.evaluate("document.getElementById('startMode').click()"); await pg.wait_for_timeout(500); await close_dialogs(pg)
    m = await pg.evaluate("({target,topic:current.topic,mcq:document.querySelectorAll('#mcqBox [data-mcq]').length})")
    R.check(m['target'] == 25 and m['topic'] in ('ks1_calc', 'ks1_mult') and m['mcq'] >= 3, 'KS1 Paper 1 is 25 tap-to-answer calculation questions', m)
    await pg.evaluate("setMode('training');restartSession()"); await pg.wait_for_timeout(300)

    # 6. KS3: Year 7 and Year 9
    for exam, year in (('y7', 7), ('y9', 9)):
        await add_player(pg, f'Teen{year}', exam=exam, theme='football'); await pg.wait_for_timeout(1200); await close_dialogs(pg)
        s = await pg.evaluate(SAMPLE)
        k3 = sum(v for k, v in s['seen'].items() if k in KS3)
        R.check(s['exam'] == exam and k3 >= 150 and not any(k.startswith(('ks1', 'ks2', 'arith', 'mtc')) for k in s['seen']), f'Year {year}: mostly KS3 topics, never KS1/KS2 ones', f'{k3}/300 KS3; {sorted(s["seen"])[:6]}')
        R.check(not s['late'], f'Year {year}: nothing from a later year', s['late'])
        R.check(set(s['focus']) <= set(KS3), f'Year {year}: focus topics are KS3 topics', s['focus'])
    y9 = await pg.evaluate("(()=>{let n=0;chosenTopic='ks3_geometry';for(let i=0;i<120;i++){finished=false;matchDone=0;done=false;newQuestion();const g=bank[current.topic][current.generator];if(g.years&&g.years[0]===9)n++;}chosenTopic='mixed';return n;})()")
    R.check(y9 > 0, 'Year 9 gets Year 9 questions (e.g. Pythagoras)', y9)
    ce = await pg.evaluate("(()=>{setExam('ce13');return %s.every(k=>examWeight(k)>0)})()" % json.dumps(KS3))
    R.check(ce, '13+ Common Entrance now includes the KS3 topics')

    # 7. lessons, explainers and the engine
    ln = await pg.evaluate("""(()=>{const bad=[];for(const k of %s){const L=learnMissions[k];if(!L||L.length<4||L.some(s=>!s.check||s.check.options.length<3))bad.push(k+': lesson');if(!explainers[k])bad.push(k+': explainer');}
      try{Learn.open('ks1_measure');}catch(e){bad.push('open: '+e.message);}return bad;})()""" % json.dumps(KS1 + KS3))
    await pg.wait_for_timeout(500)
    R.check(not ln and await pg.evaluate("!!document.querySelector('dialog[open] svg')"), 'every new topic has a lesson and explainer; the KS1 clock lesson draws its picture', ln)
    await close_dialogs(pg)
    await pg.goto(f'{serve()}/ApolloMaths/engine.html'); await pg.wait_for_timeout(600)
    eng = await pg.evaluate("(()=>{let a=0,b=0;for(let i=0;i<30;i++){if(Engine.ask('trade','y1','Sam'))a++;if(Engine.ask('trade','y8','Sam'))b++;}return {a,b}})()")
    R.check(eng['a'] > 3 and eng['b'] > 3, 'the question engine (for Starlane) serves Year 1 and Year 8', eng)
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
