"""The senior look (2.87): GCSE students get "Night study" (with a light theme), their own character, calm wording,
XP levels and the 🎨 Customise shop with age-appropriate items; younger children are untouched. Purchases use the same
credits and are checked when progress is reopened, so a progress file can't give free items."""
from rig import *

async def main(p):
    R = Result('senior')
    pg = await browser(p, 1366, 900); await open_app(pg)

    # 1. younger children keep today's look
    await add_player(pg, 'Kit', exam='y5', theme='space'); await pg.wait_for_timeout(1500); await close_dialogs(pg)
    y = await pg.evaluate("({senior:document.body.classList.contains('look-senior'),snAv:!!document.querySelector('#sAv .sn-av'),shoot:(document.getElementById('check')||{}).textContent})")
    R.check(not y['senior'] and not y['snAv'] and 'SHOOT' in y['shoot'], 'a Year 5 child keeps today’s look, character and wording', y)

    # 2. a GCSE student gets the senior look
    await add_player(pg, 'Jo', exam='gcse_aqa', theme='music'); await pg.wait_for_timeout(2000); await close_dialogs(pg)
    s = await pg.evaluate("""(()=>{const shell=document.querySelector('.shell').innerText;return {senior:document.body.classList.contains('look-senior'),scene:!!document.getElementById('snScene'),
      av:!!document.querySelector('#sAv .sn-av'),hello:(document.getElementById('snHello')||{}).textContent||'',check:document.getElementById('check').textContent,
      kid:['SHOOT','GOAL!','⚽','power points','MATCH DAY','KERPOW'].filter(w=>shell.includes(w))};})()""")
    R.check(s['senior'] and s['scene'] and s['av'], 'a GCSE student gets the senior look, scene and character', s)
    R.check(s['hello'].endswith('Jo') and s['check'] == 'Submit' and not s['kid'], 'the wording is calm: a greeting, Submit, no football or comic words', s['kid'] or s['hello'])
    await pg.evaluate("chosenTopic='gcse_ratio';setMode('training');restartSession()"); await pg.wait_for_timeout(500); await close_dialogs(pg)
    await answer(pg, right=True)
    fb = await pg.evaluate("document.getElementById('feedback').textContent")
    R.check(fb.startswith('✓ Correct') and not any(w in fb for w in ('GOAL', 'BOOM', 'KERPOW', 'ANFIELD', '⚡')), 'a right answer says “✓ Correct” with XP', fb[:60])
    t = await pg.evaluate("(()=>{const n=document.getElementById('toast');const before=n.textContent;toast('🔥 Today’s deal: 🔴 Red & white hoops for 70 ⚡ (25% off)');return {before,after:n.textContent,q:toastQ.length};})()")
    R.check('hoops' not in t['after'], 'children’s Shop news is not shown to older students', t)

    # 3. Customise opens instead of the children's Locker Room
    await pg.evaluate("document.querySelector('[data-go=\"rewards\"],[data-area-go=\"rewards\"]').click()"); await pg.wait_for_timeout(500)
    c = await pg.evaluate("({shop:!!(document.getElementById('snShop')||{}).open,locker:document.getElementById('locker').open,items:document.querySelectorAll('#snShop .sn-item').length})")
    R.check(c['shop'] and not c['locker'] and c['items'] >= 8, '“Customise” opens the senior shop, not the Locker Room', c)
    cats = await pg.evaluate("[...document.querySelectorAll('#snShop .sn-tabs button')].map(b=>b.textContent)")
    R.check(all(k in cats for k in ('Outfits', 'Trainers', 'Accessories', 'Desk & room', 'Backdrops', 'Titles', 'Study perks', 'Hobby')), 'Customise has outfits, trainers, accessories, desk, backdrops, titles, perks and hobbies', cats)
    names = await pg.evaluate("SN_ITEMS.map(i=>i.name).join(' ')")
    R.check(not any(w in names for w in ('pet', 'Pet', 'cape', 'Cape', 'sticker', 'puppy')), 'no cartoon items (pets, capes, stickers) in the senior catalogue')

    # 4. buying, wearing and level locks
    await pg.evaluate("stats.points=1000;save(false);Senior.render()")
    await pg.evaluate("document.querySelector('#snShop [data-ask=sn_bomber]').click()"); await pg.wait_for_timeout(100)
    await pg.evaluate("document.querySelector('#snShop [data-buy=sn_bomber]').click()"); await pg.wait_for_timeout(300)
    b = await pg.evaluate("({spent:stats.spent,own:stats.sOwned,top:stats.senior.top,wallet:wallet(stats),lock:!!document.querySelector('#snShop .sn-item.lock')})")
    R.check(b['spent'] == 350 and 'sn_bomber' in b['own'] and b['top'] == 'sn_bomber' and b['wallet'] == 650, 'buying the bomber jacket spends 350 credits and puts it on', b)
    R.check(b['lock'], 'the varsity jacket stays locked until Level 20')
    keep = await pg.evaluate("(()=>{const c=cleanStats(JSON.parse(JSON.stringify(stats)));return {own:c.sOwned,top:c.senior.top}})()")
    cheat = await pg.evaluate("(()=>{const x=JSON.parse(JSON.stringify(stats));x.spent=0;x.sOwned=['sn_bomber','sn_monitors','sn_puffer'];x.senior.top='sn_puffer';const c=cleanStats(x);return {own:c.sOwned,top:c.senior.top}})()")
    R.check(keep == {'own': ['sn_bomber'], 'top': 'sn_bomber'} and cheat['own'] == [] and cheat['top'] == 'sn_hoodie_grey', 'purchases survive a progress file, but unpaid items are removed', {'keep': keep, 'cheat': cheat})

    # 5. hobbies, theme, hair and skin
    h = await pg.evaluate("""(()=>{Senior.open('hobby');document.querySelector('#snShop [data-hobby=f1]').click();const acc=document.body.style.getPropertyValue('--sn-acc');
      document.querySelector('#snShop [data-tab=desk]').click();const desk=[...document.querySelectorAll('#snShop .sn-item b')].map(b=>b.textContent);return {acc,hobby:stats.senior.hobby,sim:desk.includes('Sim-racing seat'),synth:desk.includes('Synth keyboard')};})()""")
    R.check(h['hobby'] == 'f1' and h['acc'].strip() == '#ff5a5a' and h['sim'] and not h['synth'], 'choosing F1 changes the accent and shows F1 desk items (not music ones)', h)
    th = await pg.evaluate("(()=>{document.querySelector('#snShop [data-theme]').click();const r={light:document.body.classList.contains('sn-light'),saved:stats.senior.theme};document.querySelector('#snShop [data-theme]').click();r.back=document.body.classList.contains('sn-light');return r;})()")
    R.check(th == {'light': True, 'saved': 'light', 'back': False}, 'the ☀️/🌙 switch changes and remembers the theme', th)
    sk = await pg.evaluate("(()=>{Senior.open('look');const b=document.querySelector('#snShop [data-look=skin][data-val=\"4\"]');b.click();return stats.avatar.skin;})()")
    R.check(sk == 4, 'hair and skin can be changed in Customise', sk)
    await pg.evaluate("document.getElementById('snShop').close()")

    # 6. phone: no sideways scrolling, bottom bar says Customise
    await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(1200)
    ph = await pg.evaluate("({wide:document.documentElement.scrollWidth-innerWidth,nav:(document.getElementById('hubNav')||{}).textContent||''})")
    R.check(ph['wide'] <= 1 and 'Customise' in ph['nav'], 'on a phone the page fits and the bar says Customise', ph)
    await pg.evaluate("Senior.open('outfits')"); await pg.wait_for_timeout(400)
    R.check(await pg.evaluate("(()=>{const d=document.getElementById('snShop');return d.scrollWidth<=d.clientWidth+1&&d.getBoundingClientRect().right<=innerWidth+1})()"), 'Customise fits a phone screen')
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
