"""ApolloMaths test rig — shared helpers.

Serves the ApolloMaths repo (and, if present, the Starlane repo next to it) on a local web server
so both run exactly as on stuartokin.github.io (http://localhost:PORT/ApolloMaths/ and /Starlane/),
then drives them in headless Chromium with Playwright.

Locations: APOLLO_ROOT (default: the folder above tests/) and STARLANE_ROOT (default: a folder called
Starlane next to this repo). No secrets are stored here: family codes are set per device, never in the repo.
"""
import os, sys, threading, http.server, socketserver, tempfile, functools, asyncio, json, pathlib

HERE = pathlib.Path(__file__).resolve().parent
APOLLO = pathlib.Path(os.environ.get('APOLLO_ROOT', HERE.parent)).resolve()
STARLANE = pathlib.Path(os.environ.get('STARLANE_ROOT', APOLLO.parent / 'Starlane')).resolve()
HAS_STARLANE = (STARLANE / 'index.html').exists()
OUT = HERE / 'out'                      # screenshots land here (ignored by git)
PORT = int(os.environ.get('RIG_PORT', '8765'))
BASE = f'http://localhost:{PORT}'

_server = None
def serve():
    """Start (once) a web server whose root holds /Starlane and /ApolloMaths as siblings."""
    global _server
    if _server: return BASE
    root = pathlib.Path(tempfile.mkdtemp(prefix='starlane-rig-'))
    (root / 'ApolloMaths').symlink_to(APOLLO)
    if HAS_STARLANE: (root / 'Starlane').symlink_to(STARLANE)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    _server = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(root)))
    threading.Thread(target=_server.serve_forever, daemon=True).start()
    return BASE

class Result:
    """Collects pass/fail lines for one test file."""
    def __init__(self, name): self.name, self.fails, self.lines = name, [], []
    def check(self, ok, label, detail=''):
        self.lines.append(('PASS' if ok else 'FAIL', label, detail))
        if not ok: self.fails.append(label)
        print(f"  {'✅' if ok else '❌'} {label}{(' — ' + str(detail)) if detail else ''}", flush=True)
        return ok
    def skip(self, label, why): self.lines.append(('SKIP', label, why)); print(f'  ⏭️  {label} — {why}', flush=True)

async def browser(p, w=1280, h=800, mobile=False):
    """A fresh browser page that records page errors in page.errors."""
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
    pg = await ctx.new_page(); pg.errors = []
    pg.on('pageerror', lambda e: pg.errors.append(str(e)[:300]))
    pg.close_all = b.close
    return pg

async def until(pg, js, timeout=15000, step=200):
    """Wait until a JavaScript expression is truthy; returns its value (or None on timeout)."""
    for _ in range(max(1, timeout // step)):
        try:
            v = await pg.evaluate(js)
            if v: return v
        except Exception: pass
        await pg.wait_for_timeout(step)
    return None

async def open_app(pg):
    """A fresh device: empty storage, the app open on the 'Who's playing?' screen."""
    await pg.goto(f'{serve()}/ApolloMaths/index.html')
    await pg.evaluate('localStorage.clear();sessionStorage.clear()'); await pg.reload(); await pg.wait_for_timeout(1800)

async def add_player(pg, name, exam='', theme='', body='', school=''):
    """Add a player through the real form on 'Who's playing?' (opening it from the menu if needed)."""
    if not await pg.query_selector('#newName'):
        await pg.evaluate("(document.getElementById('switchPlayer')||{click(){}}).click()"); await pg.wait_for_timeout(600)
    await pg.fill('#newName', name)
    for sel, v in (('#newExam', exam), ('#newTheme', theme), ('#newBody', body)):
        if v and await pg.query_selector(sel): await pg.select_option(sel, v)
    if school and await pg.query_selector('#newSchool'): await pg.fill('#newSchool', school)
    await pg.evaluate("document.getElementById('addPlayerForm').requestSubmit()")
    await until(pg, f"typeof playerName==='function'&&playerName()==={json.dumps(name)}", 15000)
    await pg.wait_for_timeout(1500); await close_dialogs(pg)

async def close_dialogs(pg):
    """Answer the first-time Welcome with "Maybe later", then close any other open window."""
    await pg.evaluate("(()=>{const w=document.querySelector('#welcome[open] [data-wl=later]');if(w)w.click();document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}})})()")

async def answer(pg, right=True):
    """Answer the question on screen through the answer box and SHOOT (right or deliberately wrong)."""
    await close_dialogs(pg); await pg.wait_for_selector('#answer', state='visible', timeout=8000)
    if await pg.evaluate("document.getElementById('answer').disabled"):      # answered already: go to the next question
        await pg.click('#next'); await pg.wait_for_timeout(300)
    a = await pg.evaluate("fmtAns(current)")
    await pg.fill('#answer', a if right else '987654321'); await pg.click('#check'); await pg.wait_for_timeout(250)
    return a

STUB_SAVE = """window.__picks=[];window.showSaveFilePicker=async(o)=>{window.__picks.push((o&&o.suggestedName)||'');return {name:(o&&o.suggestedName)||'x.json',
 createWritable:async()=>({write:async()=>{},close:async()=>{}}),queryPermission:async()=>'granted',requestPermission:async()=>'granted'};};"""

def run(main):
    from playwright.async_api import async_playwright
    async def go():
        async with async_playwright() as p: return await main(p)
    r = asyncio.run(go())
    sys.exit(1 if r and r.fails else 0)
