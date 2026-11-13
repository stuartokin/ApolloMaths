"""The grown-ups' side: every parent-dashboard tab (fixed size, no 'undefined'/'NaN'), the find box, the exam
plan and key dates (with the AI-maintained note), the Starlane questions check, and deleting a player safely
(name must be typed exactly; deleted players go to the recycle bin and can be restored)."""
import re
from rig import *

async def main(p):
    R = Result('grownups')
    pg = await browser(p, 1600, 950); await open_app(pg)
    await add_player(pg, 'Mia', exam='iseb', theme='space'); await add_player(pg, 'Leo', exam='ce13', theme='football')
    await pg.evaluate("Parent.open('overview')"); await pg.wait_for_timeout(500)
    tabs = await pg.evaluate("[...document.querySelectorAll('#parent [data-ptab]')].map(b=>b.dataset.ptab)")
    rects, bad = set(), []
    for t in tabs:
        await pg.evaluate(f"document.querySelector('#parent [data-ptab=\"{t}\"]').click()"); await pg.wait_for_timeout(200)
        rects.add(await pg.evaluate("(()=>{const r=document.getElementById('parent').getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(Math.round).join(',')})()"))
        body = await pg.evaluate("document.querySelector('#parent .pd-body').innerText")
        if re.search(r'\bundefined\b|\bNaN\b', body): bad.append(t)
    R.check(len(tabs) >= 12, 'the dashboard has its grouped tabs', tabs)
    R.check(len(rects) == 1, 'the window keeps one size and place on every tab', rects)
    R.check(not bad, "no tab shows 'undefined' or 'NaN'", bad)
    route = {}
    for q, want in [('export', 'family'), ('starlane', 'games'), ('dates', 'plan'), ('mock', 'mocks')]:
        await pg.fill('.pd-find', q); await pg.wait_for_timeout(200)
        route[q] = await pg.evaluate("(document.querySelector('#parent [data-ptab].active')||{}).dataset.ptab")
    R.check(route == {'export': 'family', 'starlane': 'games', 'dates': 'plan', 'mock': 'mocks'}, 'the find box goes to the right tab', route)
    # exam plan: Leo's plan follows his exam, and Key dates carries the AI-maintained note
    await pg.evaluate("document.querySelector('#parent [data-ptab=\"plan\"]').click()"); await pg.wait_for_timeout(300)
    plan = await pg.evaluate("document.querySelector('#parent .pd-body').innerText")
    R.check('13+' in plan and 'Key dates' in plan, "the Plan tab shows the child's exam and key dates")
    R.check(bool(await pg.query_selector('#parent .ai-note')), 'Key dates says it is kept up to date by an AI agent')
    hdr = await pg.evaluate("document.querySelector('.hero .exam-badge, #examBadge')?.innerText||''")
    R.check('13+' in hdr or 'Common Entrance' in hdr, "the header badge names the child's exam", hdr[:80])
    await close_dialogs(pg)
    # deleting a player: wrong name refused, right name → recycle bin → restore with progress
    await pg.evaluate("document.getElementById('switchPlayer').click()"); await pg.wait_for_timeout(500)
    pid = await pg.evaluate("Storage.profiles().find(p=>p.name==='Mia').id")
    pg.once('dialog', lambda d: asyncio.ensure_future(d.accept('mia')))
    await pg.evaluate(f"document.querySelector('[data-del=\"{pid}\"]').click()"); await pg.wait_for_timeout(800)
    R.check(await pg.evaluate("Storage.profiles().some(p=>p.name==='Mia')"), 'deleting needs the name typed exactly (a near miss deletes nothing)')
    pg.once('dialog', lambda d: asyncio.ensure_future(d.accept('Mia')))
    await pg.evaluate(f"document.querySelector('[data-del=\"{pid}\"]').click()"); await pg.wait_for_timeout(2500)
    R.check(not await pg.evaluate("Storage.profiles().some(p=>p.name==='Mia')") and 'Mia' in await pg.evaluate("Protect.read().map(x=>x.name)"), 'the right name deletes, into the recycle bin')
    await close_dialogs(pg); await pg.evaluate("document.getElementById('switchPlayer').click()"); await pg.wait_for_timeout(600)
    await pg.evaluate("document.querySelector('[data-restore]').click()"); await pg.wait_for_timeout(3000)
    back = await pg.evaluate("(()=>{const p=Storage.profiles().find(p=>p.name==='Mia');if(!p)return null;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.includes(p.id)&&/space/.test(localStorage.getItem(k)))return 'with her theme';}return 'without progress';})()")
    R.check(back == 'with her theme', 'a deleted player can be restored with their progress', back)
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
