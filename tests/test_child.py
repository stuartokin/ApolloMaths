"""The child's side: a new family adds a player (exam, theme, character), practises through the real answer box,
moves between the five areas, uses focus mode and the menu, saves progress, switches theme, and the layout fits
phone, tablet, laptop, desktop and very large screens."""
from rig import *

SIZES = [('phone', 375, 812, True), ('tablet', 820, 1180, True), ('laptop', 1366, 900, False), ('desktop', 1900, 950, False), ('huge', 3000, 1600, False)]

async def main(p):
    R = Result('child')
    pg = await browser(p, 1366, 900); await pg.add_init_script(STUB_SAVE); await open_app(pg)
    await add_player(pg, 'Mia', exam='grammar11', theme='animals', body='girl')
    R.check(await pg.evaluate("playerName()") == 'Mia', 'a new player is added through the form')
    st = await pg.evaluate("({exam:examId(),theme:themeConf().id,body:stats.avatar.body,focus:stats.focus,tag:document.querySelector('.hero small').textContent})")
    R.check(st['exam'] == 'grammar11' and st['theme'] == 'animals' and st['body'] == 'girl', 'her exam, theme and character are set', st)
    R.check(len(st['focus'] or []) == 5 and 'volume' not in st['focus'], 'her focus topics come from her exam', st['focus'])
    shop = await pg.evaluate("shopItems.filter(i=>!owns(stats,i.id)&&Student.itemForTheme(i)).map(i=>i.theme||'football')")
    R.check(shop and all(t == 'animals' for t in shop), 'her Shop sells only animal items', f'{len(shop)} items')
    # practice: next best thing → a question; answer right and wrong through the real controls
    await pg.evaluate("Hub.show('today')"); await pg.click('#nextBestGo'); await pg.wait_for_timeout(600)
    opened = await pg.evaluate("document.getElementById('learn').open?'lesson':document.body.dataset.areaNow")
    R.check(opened in ('lesson', 'practise'), '"Let\'s go!" starts the first task on today\'s plan', opened)
    await close_dialogs(pg); await pg.evaluate("pickTopic(focusKeys[0])"); await pg.wait_for_timeout(500)
    pts0 = await pg.evaluate("stats.points"); await answer(pg, True)
    R.check(await pg.evaluate("stats.points") > pts0, 'a right answer earns points')
    await answer(pg, False)
    w = await pg.evaluate("({wrongs:(current.wrongs||[]).length,tries:tries,feedback:document.getElementById('feedback').textContent.slice(0,60)})")
    R.check(w['wrongs'] >= 1 and w['tries'] >= 1, 'a wrong answer is recorded and gets feedback', w)
    for k in range(4):
        await pg.evaluate("(document.getElementById('next')||{click(){}}).click()"); await pg.wait_for_timeout(200); await answer(pg, True)
    R.check(await pg.evaluate("stats.solved") >= 4, 'several questions answered in a row', await pg.evaluate("stats.solved"))
    # areas, focus mode, menu
    seen = {}
    for a in ['today', 'practise', 'mock', 'learn', 'rewards']:
        await pg.evaluate(f"Hub.show('{a}')"); await pg.wait_for_timeout(200)
        seen[a] = await pg.evaluate("document.querySelectorAll('[data-area].area-on').length")
    R.check(all(v > 0 for v in seen.values()), 'each of the five areas shows its panels', seen)
    await pg.evaluate("Hub.show('practise')"); await pg.evaluate("document.getElementById('focusBtn').click()"); await pg.wait_for_timeout(200)
    vis = await pg.evaluate("[...document.querySelectorAll('[data-area]')].filter(s=>getComputedStyle(s).display!=='none').map(s=>s.id)")
    R.check(vis == ['mission'], 'focus mode shows only the question', vis); await pg.evaluate("document.getElementById('focusBtn').click()")
    await pg.evaluate("document.getElementById('hubMenuBtn').click()"); await pg.wait_for_timeout(200)
    items = await pg.evaluate("[...document.querySelectorAll('#hubMenu button')].map(b=>b.textContent.trim())")
    R.check(len(items) >= 6 and 'Grown-ups' in items[-1], 'the ⚙️ menu has its items in the usual order, Grown-ups last', items)
    await pg.evaluate("document.body.click()")
    # saving through the 💾 button in the rail
    before = await pg.evaluate("document.getElementById('sSave').textContent")
    await pg.click('#sSave'); await pg.wait_for_timeout(300); await pg.click('#savePop #saveBtn'); await pg.wait_for_timeout(1500)
    after = await pg.evaluate("document.getElementById('sSave').textContent")
    R.check('Not saved' in before and 'Saved' in after and await pg.evaluate("window.__picks.length") == 1, 'the 💾 button saves to a progress file', f'{before} → {after}')
    # themes change colours, header and the wording of questions
    words = {}
    for th in ['space', 'music', 'anfield']:
        await pg.evaluate(f"setTheme({{id:'{th}'}})"); await close_dialogs(pg); await pg.wait_for_timeout(200)
        words[th] = await pg.evaluate("document.querySelector('.hero small').textContent.slice(0,30)")
    R.check(len(set(words.values())) == 3, 'themes change the header', words)
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all()
    # every screen size: nothing wider than the screen, the right navigation
    for tag, w, h, mob in SIZES:
        pg = await browser(p, w, h, mob); await open_app(pg); await add_player(pg, 'Mia', exam='iseb')
        over = {}
        for a in ['today', 'practise', 'rewards', 'learn']:
            await pg.evaluate(f"Hub.show('{a}')"); await pg.wait_for_timeout(250)
            sw_ = await pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
            if sw_ > 1: over[a] = sw_
        nav = await pg.evaluate("(()=>{const r=document.getElementById('sRail');return r&&getComputedStyle(r).display!=='none'?'rail':'bar'})()")
        R.check(not over and nav == ('rail' if w >= 1100 else 'bar'), f'[{tag} {w}px] fits the screen, navigation = {nav}', over or '')
        await pg.evaluate("Parent.open('overview')"); await pg.wait_for_timeout(400)
        r = await pg.evaluate("(()=>{const b=document.getElementById('parent').getBoundingClientRect();return b.left>=0&&b.top>=0&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1})()")
        R.check(r, f'[{tag}] the grown-ups window fits on screen')
        if pg.errors: R.check(False, f'[{tag}] no page errors', pg.errors[:2])
        await pg.close_all()
    return R

if __name__ == '__main__': run(main)
