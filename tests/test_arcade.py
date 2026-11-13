"""The secret arcade (opened here as Admin, so no codes are needed): every game except Starlane offers
My player / Classic; in My player the child's character is drawn in the game, in Classic it is not; each game
remembers its look; Starlane opens from its own site (needs the Starlane repo next to this one)."""
from rig import *

async def main(p):
    R = Result('arcade')
    pg = await browser(p, 1300, 900); await open_app(pg); await add_player(pg, 'Mia', exam='iseb', theme='animals')
    await pg.evaluate("(()=>{const o=window.AVH;window.__av={};window.AVH=function(){const r=o.apply(this,arguments);if(r)window.__av[window.__cur]=(window.__av[window.__cur]||0)+1;return r;};})()")
    ids = await pg.evaluate("GAME_LIST.map(g=>g.id)")
    R.check('starlane' in ids and len(ids) == 12, 'the arcade lists 11 games plus Starlane', ids)
    async def play(gid, look):
        await pg.evaluate("(()=>{try{Arcade.close()}catch(e){}})()"); await pg.wait_for_timeout(150)
        await pg.evaluate("Arcade.open({admin:true})"); await pg.wait_for_timeout(300)
        await pg.evaluate(f"document.querySelector('[data-game=\"{gid}\"]').click()"); await pg.wait_for_timeout(150)
        await pg.evaluate(f"(document.querySelector('.arc-themes [data-theme=\"{look}\"]')||{{click(){{}}}}).click()"); await pg.wait_for_timeout(150)
        await pg.evaluate(f"window.__cur='{gid}:{look}'"); await pg.evaluate("document.querySelector('[data-arc=\"start\"]').click()")
        await pg.wait_for_timeout(300)
        for _ in range(6): await pg.keyboard.press(' '); await pg.wait_for_timeout(120)
        await pg.wait_for_timeout(900)
    games = [g for g in ids if g != 'starlane']; noChoice = []
    for gid in games:
        await pg.evaluate("Arcade.open({admin:true})"); await pg.wait_for_timeout(200)
        await pg.evaluate(f"document.querySelector('[data-game=\"{gid}\"]').click()"); await pg.wait_for_timeout(120)
        if await pg.evaluate("document.querySelectorAll('.arc-themes [data-theme]').length") != 2: noChoice.append(gid)
        await play(gid, 'player'); await play(gid, 'classic')
    R.check(not noChoice, 'every game offers 🧍 My player / 👾 Classic', noChoice)
    av = await pg.evaluate("window.__av")
    own = ['invaders', 'ladder']   # these two draw the character with their own code (the original My player games)
    mine = [g for g in games if g not in own and not av.get(f'{g}:player')]
    R.check(not mine, "My player draws the child's character in every game", mine or f'{len(games)-len(own)} games via the shared drawer, plus Invaders and Ladder Dash')
    classic = [g for g in games if g != 'invaders' and av.get(f'{g}:classic')]
    R.check(not classic, 'Classic leaves the character out', classic)
    looks = await pg.evaluate("stats.arcade.looks||{}")
    R.check(all(v == 'classic' for k, v in looks.items()), 'each game remembers its own look', looks)
    await pg.evaluate("(()=>{try{Arcade.close()}catch(e){}})()")
    if HAS_STARLANE:
        await pg.evaluate("Arcade.open({admin:true})"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelector('[data-game=\"starlane\"]').click()"); await pg.wait_for_timeout(150)
        R.check(await pg.evaluate("document.querySelectorAll('.arc-themes [data-theme]').length") == 0, 'Starlane has no look choice')
        await pg.evaluate("document.querySelector('[data-arc=\"start\"]').click()")
        ok = await until(pg, "(()=>{const f=document.querySelector('#slRemote iframe');try{return f&&f.contentWindow.StarlaneSite&&f.contentWindow.StarlaneSite.ready}catch(e){return false}})()", 20000)
        R.check(bool(ok), 'Starlane opens from its own site inside the arcade')
        R.skip('the rest of the Starlane bridge', 'tested in the Starlane repo (tests/test_bridge.py)')
    else: R.skip('Starlane opens from its own site', 'Starlane repo not found next to ApolloMaths')
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
