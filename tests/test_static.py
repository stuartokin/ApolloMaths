"""Static checks: every script parses and is loaded and cached; the version is consistent everywhere;
every question generator makes valid questions at every difficulty; exam profiles point at real topics;
no secrets in the repo."""
import subprocess, re, shutil
from rig import *

async def main(p):
    R = Result('static')
    html = (APOLLO / 'index.html').read_text(encoding='utf-8'); sw = (APOLLO / 'sw.js').read_text(encoding='utf-8')
    scripts = re.findall(r'<script src="([^"]+)"', html)
    missing = [s for s in scripts if not (APOLLO / s).exists()]
    R.check(not missing, 'every script in index.html exists', missing or f'{len(scripts)} scripts')
    uncached = [s for s in scripts if s not in sw]
    R.check(not uncached, 'every script is in the offline cache list (sw.js)', uncached)
    if shutil.which('node'):
        bad = [s for s in scripts + ['sw.js'] if subprocess.run(['node', '-e', f"new Function(require('fs').readFileSync({json.dumps(str(APOLLO / s))},'utf8'))"], capture_output=True).returncode]
        R.check(not bad, 'every loaded script parses', bad)
        r = subprocess.run(['node', '--check', str(APOLLO / 'tools/exam-watch/watch.mjs')], capture_output=True, text=True)
        R.check(r.returncode == 0, 'the exam-watch agent parses', r.stderr[:200])
    else: R.skip('script syntax', 'node not installed')
    v = re.search(r"APP_VERSION='([0-9.]+)'", (APOLLO / 'js/data/help.js').read_text(encoding='utf-8')).group(1)
    vj = json.loads((APOLLO / 'version.json').read_text(encoding='utf-8'))
    readme = (APOLLO / 'README.md').read_text(encoding='utf-8')
    R.check(str(vj.get('version')) == v, 'version.json matches APP_VERSION (run tools/make-version.js)', f"{v} vs {vj.get('version')}")
    R.check(f'**v{v}:**' in readme, 'README has a changelog line for this version', v)
    leaks = [str(f.relative_to(APOLLO)) for f in APOLLO.rglob('*') if f.is_file() and '.git' not in f.parts and f.suffix in ('.js', '.html', '.md', '.json', '.yml', '.py', '.mjs')
             and re.search(r'sk-ant-[A-Za-z0-9_-]{10,}', f.read_text(encoding='utf-8', errors='ignore'))]
    R.check(not leaks, 'no API keys in the repo', leaks)
    pg = await browser(p); await open_app(pg)
    sweep = await pg.evaluate("""(()=>{let types=0,samples=0,bad=[],trivial=0;const lv={0:0,1:0,2:0};
      for(const [tp,list] of Object.entries(bank))list.forEach((g,ix)=>{types++;lv[g.diff]=(lv[g.diff]||0)+1;
       for(const d of [-1,0,1])for(let i=0;i<12;i++){QDIFF=d;let q;try{q=g();}catch(e){bad.push(tp+'#'+ix+' threw: '+e.message);break;}QDIFF=0;samples++;
        if(!q||typeof q.q!=='string'||!q.q.trim()||!Number.isFinite(q.a)){bad.push(tp+'#'+ix+': '+(q&&q.q||'?').slice(0,60));break;}
        if(!Array.isArray(q.s)||!q.s.length){bad.push(tp+'#'+ix+': no worked steps');break;}
        if(typeof qOK==='function'&&!qOK(q))trivial++;}});
      return {types,samples,trivial,levels:lv,bad:bad.slice(0,6)};})()""")
    R.check(not sweep['bad'], f"every question type makes valid questions at all three difficulties", sweep['bad'] or f"{sweep['types']} types, {sweep['samples']} samples")
    R.check(sweep['trivial'] / max(1, sweep['samples']) < 0.02, 'accidentally trivial questions are rare (they are re-drawn in play)', f"{sweep['trivial']} of {sweep['samples']}")
    ex = await pg.evaluate("(()=>{const bad=[];for(const [id,e] of Object.entries(EXAMS)){for(const k of Object.keys(e.weights||{}))if(!topics[k])bad.push(id+': '+k);if(!(e.sources||[]).length)bad.push(id+': no sources');}return {n:Object.keys(EXAMS).length,bad}})()")
    R.check(not ex['bad'], 'exam profiles use real topics and list sources', ex['bad'] or f"{ex['n']} profiles")
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
