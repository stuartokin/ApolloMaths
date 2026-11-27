"""Proof images for the senior (GCSE / A level) look: three directions, laptop and phone."""
import asyncio, pathlib
from playwright.async_api import async_playwright
OUT = pathlib.Path(__file__).parent

def avatar(skin, hair, hood, phones, bg):
    return f"""<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
 <rect width="200" height="220" rx="22" fill="{bg}"/>
 <path d="M38 220 C40 165 70 148 100 148 C130 148 160 165 162 220 Z" fill="{hood}"/>
 <path d="M78 150 C86 172 114 172 122 150" fill="none" stroke="#0003" stroke-width="5"/>
 <line x1="92" y1="168" x2="90" y2="196" stroke="#fff8" stroke-width="3" stroke-linecap="round"/><line x1="108" y1="168" x2="110" y2="196" stroke="#fff8" stroke-width="3" stroke-linecap="round"/>
 <rect x="88" y="128" width="24" height="26" rx="8" fill="{skin}"/>
 <ellipse cx="100" cy="98" rx="36" ry="42" fill="{skin}"/>
 <path d="M62 92 C60 52 92 44 106 50 C126 46 144 62 138 94 C134 76 122 68 106 70 C92 72 76 70 66 96 Z" fill="{hair}"/>
 <ellipse cx="86" cy="102" rx="4" ry="5" fill="#1d2432"/><ellipse cx="114" cy="102" rx="4" ry="5" fill="#1d2432"/>
 <path d="M80 91 Q86 88 92 91" stroke="{hair}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M108 91 Q114 88 120 91" stroke="{hair}" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M90 121 Q100 128 110 121" stroke="#9a4b3c" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M98 104 Q96 113 101 114" stroke="#0002" stroke-width="2" fill="none"/>
 <path d="M58 104 C56 60 144 60 142 104" fill="none" stroke="{phones}" stroke-width="7"/>
 <rect x="50" y="96" width="16" height="30" rx="7" fill="{phones}"/><rect x="134" y="96" width="16" height="30" rx="7" fill="{phones}"/>
</svg>"""

V = {
 'A-studio': dict(award='🏁 “Pit-stop Pro” title',title='A · Studio', hobby='F1 & motorsport', font="'Inter',sans-serif",
   css="""--bg:#eef1f6;--card:#ffffffcc;--ink:#14182a;--mute:#5e6478;--acc:#e10600;--acc2:#1f2a44;--line:#dfe3ec;--chip:#f1f3f8;--rail:#ffffffb3;--glow:0 10px 30px #1f2a4414;
   body{background:radial-gradient(1200px 600px at 85% -10%,#ffd9d6 0,transparent 60%),radial-gradient(900px 500px at 0% 110%,#d8e2ff 0,transparent 60%),#eef1f6}
   .scene{background-image:repeating-linear-gradient(115deg,transparent 0 46px,#1f2a440a 46px 48px);}
   .scene:after{content:'';position:absolute;right:-40px;top:120px;width:520px;height:520px;border:26px solid #1f2a440d;border-radius:50%;border-right-color:transparent;transform:rotate(-20deg)}
   .flag{position:absolute;right:56px;bottom:40px;width:150px;height:90px;opacity:.10;background:conic-gradient(#000 25%,#fff 0 50%,#000 0 75%,#fff 0) 0 0/30px 30px;transform:skewX(-12deg)}
   .card,.rail{backdrop-filter:blur(14px)}.btn{border-radius:12px}.q{font-family:'Inter',sans-serif}""",
   av=('#f1c6a8','#2b1d14','#1f2a44','#e10600','#ffe4e1')),
 'B-night': dict(award='🎧 “Studio Session” title',title='B · Night study', hobby='Music production', font="'Inter',sans-serif",
   css="""--bg:#0f1226;--card:#191d38e6;--ink:#f1efe9;--mute:#a7a9c4;--acc:#ffb547;--acc2:#8f7bff;--line:#2c3157;--chip:#232849;--rail:#12152cd9;--glow:0 0 40px #ffb54722;
   body{background:linear-gradient(180deg,#151a3a 0,#0c0f22 70%)}
   .scene{background:radial-gradient(420px 320px at 78% 30%,#ffb54733 0,transparent 70%),radial-gradient(2px 2px at 20% 18%,#fff8 50%,transparent 51%),radial-gradient(2px 2px at 62% 9%,#fff6 50%,transparent 51%),radial-gradient(1.5px 1.5px at 40% 22%,#fff7 50%,transparent 51%),radial-gradient(1.5px 1.5px at 88% 14%,#fff7 50%,transparent 51%)}
   .scene:after{content:'';position:absolute;left:0;right:0;bottom:0;height:190px;background:linear-gradient(#0000,#090b1a),repeating-linear-gradient(90deg,#1d2246 0 38px,#171b3a 38px 70px,#20264f 70px 96px,#151935 96px 150px);clip-path:polygon(0 60%,4% 60%,4% 30%,9% 30%,9% 52%,14% 52%,14% 18%,19% 18%,19% 46%,25% 46%,25% 34%,31% 34%,31% 58%,38% 58%,38% 24%,43% 24%,43% 44%,50% 44%,50% 12%,55% 12%,55% 50%,62% 50%,62% 30%,68% 30%,68% 56%,74% 56%,74% 22%,80% 22%,80% 40%,86% 40%,86% 16%,92% 16%,92% 48%,100% 48%,100% 100%,0 100%)}
   .flag{position:absolute;right:70px;bottom:120px;width:200px;height:60px;opacity:.5;background:repeating-linear-gradient(90deg,#ffb547 0 4px,transparent 4px 10px);mask:linear-gradient(90deg,#0000,#000 20%,#000 80%,#0000);clip-path:polygon(0 70%,6% 40%,12% 60%,18% 20%,24% 55%,30% 35%,36% 75%,42% 15%,48% 50%,54% 30%,60% 65%,66% 25%,72% 55%,78% 40%,84% 70%,90% 35%,100% 60%,100% 100%,0 100%)}
   .card,.rail{backdrop-filter:blur(10px)}.btn{border-radius:14px}.q{font-family:'DejaVu Serif',serif}""",
   av=('#8d5a3b','#151515','#8f7bff','#ffb547','#232849')),
 'C-hud': dict(award='🎮 “Speedrunner” title',title='C · HUD', hobby='Gaming & esports', font="'Inter Display','Inter',sans-serif",
   css="""--bg:#07090f;--card:#0d1322e6;--ink:#e8f6ff;--mute:#7f93ad;--acc:#2ef2c5;--acc2:#ff3df0;--line:#1b2a44;--chip:#101b30;--rail:#0a0f1ce6;--glow:0 0 0 1px #2ef2c555,0 0 30px #2ef2c522;
   body{background:#07090f}
   .scene{background-image:linear-gradient(#2ef2c50d 1px,transparent 1px),linear-gradient(90deg,#2ef2c50d 1px,transparent 1px);background-size:40px 40px}
   .scene:after{content:'';position:absolute;left:-10%;right:-10%;bottom:-40px;height:360px;background-image:linear-gradient(#ff3df033 2px,transparent 2px),linear-gradient(90deg,#ff3df033 2px,transparent 2px);background-size:60px 40px;transform:perspective(380px) rotateX(62deg);transform-origin:bottom}
   .flag{display:none}
   .card{clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px))}.btn{border-radius:4px;text-transform:uppercase;letter-spacing:1.5px}.q{font-family:'DejaVu Sans Mono',monospace}
   h1,h2,.label{text-transform:uppercase;letter-spacing:2px}""",
   av=('#e9b894','#e7e7f0','#101b30','#ff3df0','#0d1322')),
}

PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
:root{{{css_vars}}}
*{{box-sizing:border-box}}body{{margin:0;color:var(--ink);font-family:{font};-webkit-font-smoothing:antialiased}}
{css_rest}
.scene{{position:fixed;inset:0;overflow:hidden;z-index:0}}
.wrap{{position:relative;z-index:1;display:grid;grid-template-columns:250px 1fr 330px;gap:22px;padding:22px;height:100vh}}
.rail{{background:var(--rail);border:1px solid var(--line);border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:var(--glow)}}
.av svg{{width:100%;display:block;border-radius:18px}}
.name{{font-weight:800;font-size:20px;margin-top:4px}}.lvl{{font-size:12px;color:var(--mute);font-weight:600}}
.xp{{height:8px;border-radius:8px;background:var(--chip);overflow:hidden}}.xp i{{display:block;height:100%;width:64%;background:linear-gradient(90deg,var(--acc),var(--acc2))}}
.nav a{{display:flex;gap:10px;align-items:center;padding:11px 12px;border-radius:12px;color:var(--ink);text-decoration:none;font-weight:650;font-size:15px}}.nav a.on{{background:var(--chip);box-shadow:inset 3px 0 0 var(--acc)}}
.save{{margin-top:auto;font-size:12px;color:var(--mute)}}
.main{{display:flex;flex-direction:column;gap:18px;min-width:0}}
.top{{display:flex;align-items:center;gap:12px;flex-wrap:wrap}}h1{{font-size:26px;margin:0 auto 0 0;font-weight:800}}
.chip{{background:var(--chip);border:1px solid var(--line);border-radius:999px;padding:8px 13px;font-size:13px;font-weight:700}}.chip b{{color:var(--acc)}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:24px;box-shadow:var(--glow)}}
.label{{font-size:12px;font-weight:800;color:var(--mute)}}
.tags{{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}}.tag{{font-size:12px;font-weight:700;padding:6px 10px;border-radius:8px;background:var(--chip);border:1px solid var(--line)}}.tag.acc{{color:var(--acc);border-color:var(--acc)}}
.q{{font-size:30px;line-height:1.5;margin:10px 0 6px}}.q .m{{font-style:italic}}
.sub{{color:var(--mute);font-size:15px;margin-bottom:20px}}
.ans{{display:flex;gap:12px;align-items:center;flex-wrap:wrap}}.in{{flex:1;min-width:220px;border:1.5px solid var(--line);background:var(--chip);border-radius:14px;padding:16px 18px;font-size:20px;color:var(--mute)}}
.btn{{border:0;padding:16px 26px;font-weight:800;font-size:16px;background:var(--acc);color:#111}}
.tools{{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}}.tool{{border:1px solid var(--line);background:transparent;color:var(--ink);padding:10px 14px;border-radius:12px;font-weight:650;font-size:14px}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
.big{{font-size:34px;font-weight:800}}.bar{{display:flex;gap:4px;margin-top:10px}}.bar i{{flex:1;height:30px;border-radius:5px;background:var(--chip)}}.bar i.f{{background:var(--acc)}}
.side{{display:flex;flex-direction:column;gap:18px}}
.plan div{{display:flex;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line);font-size:14px;font-weight:600}}.plan div:last-child{{border:0}}
.dot{{width:20px;height:20px;border-radius:50%;border:2px solid var(--line);flex:none}}.dot.ok{{background:var(--acc);border-color:var(--acc)}}
.pill{{margin-left:auto;font-size:11px;color:var(--mute)}}
.hob{{font-size:12px;color:var(--mute);margin-top:6px}}
.ttl{{position:fixed;left:22px;bottom:8px;z-index:2;font-size:11px;color:var(--mute)}}
/* phone */
.phone .wrap{{display:flex;flex-direction:column;padding:14px;gap:14px;height:auto;min-height:100vh}}
.phone .rail{{flex-direction:row;align-items:center;padding:10px;border-radius:18px}}.phone .av svg{{width:58px}}.phone .nav,.phone .save,.phone .side,.phone .grid2{{display:none}}
.phone h1{{font-size:20px}}.phone .q{{font-size:24px}}.phone .card{{padding:18px}}.phone .btn{{width:100%}}
.phone .tabs{{display:flex}}.phone .ttl{{display:none}}.tabs{{display:none;position:fixed;left:10px;right:10px;bottom:10px;z-index:3;background:var(--rail);border:1px solid var(--line);border-radius:18px;padding:8px;justify-content:space-around;font-size:11px;font-weight:700;backdrop-filter:blur(10px)}}.tabs span{{display:flex;flex-direction:column;align-items:center;gap:2px}}.tabs span.on{{color:var(--acc)}}
</style></head><body class="{cls}"><div class="scene"><div class="flag"></div></div>
<div class="wrap">
 <aside class="rail"><div class="av">{avatar}</div><div><div class="name">Sam</div><div class="lvl">Level 14 · 2,340 XP</div><div class="xp"><i></i></div><div class="hob">Hobby: {hobby}</div></div>
  <nav class="nav"><a class="on">🎯 Today</a><a>✏️ Practise</a><a>📝 Mock papers</a><a>📚 Learn</a><a>🎨 Customise</a><a>📊 My progress</a></nav>
  <div class="save">✅ Saved 19:42 · 👪 Grown-ups</div></aside>
 <main class="main">
  <div class="top"><h1>Good evening, Sam</h1><span class="chip">AQA · <b>Higher</b></span><span class="chip">📅 Paper 1 in <b>168 days</b></span><span class="chip">🎯 On track for <b>7</b></span></div>
  <section class="card">
   <div class="tags"><span class="tag acc">Quadratics</span><span class="tag">Paper 2 style · 🧮 Calculator allowed</span><span class="tag">3 marks</span></div>
   <div class="label">Question 4 of 10 · Higher</div>
   <div class="q">Solve &nbsp;<span class="m">3x</span><sup>2</sup> − <span class="m">5x</span> − 2 = 0</div>
   <div class="sub">Give both solutions. Show your method — factorise or use the quadratic formula.</div>
   <div class="ans"><div class="in"><i>x</i> = … , <i>x</i> = …</div><button class="btn">Submit</button></div>
   <div class="tools"><button class="tool">💡 Hint 1/3</button><button class="tool">📐 Formula sheet</button><button class="tool">🧠 Explain simply</button><button class="tool">✍️ Scratchpad</button></div>
  </section>
  <div class="grid2">
   <section class="card"><div class="label">This week</div><div class="big">86%</div><div class="hob">right first time · 142 questions</div><div class="bar"><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i></i><i></i></div></section>
   <section class="card"><div class="label">Weakest topic</div><div class="big" style="font-size:24px;margin-top:6px">Circle theorems</div><div class="hob">5 in your Fix-it list · 12 min lesson ready</div></section>
  </div>
 </main>
 <aside class="side">
  <section class="card plan"><div class="label">Today’s plan</div><div><span class="dot ok"></span>Quadratics — 10 questions<span class="pill">done</span></div><div><span class="dot"></span>Lesson: circle theorems<span class="pill">12 min</span></div><div><span class="dot"></span>Fix-it: 5 questions<span class="pill">8 min</span></div><div><span class="dot"></span>Mock: Paper 1 (non-calculator)<span class="pill">Sat</span></div></section>
  <section class="card"><div class="label">Streak</div><div class="big">🔥 12 days</div><div class="hob">Best: 19 days · +40 XP tomorrow</div></section>
  <section class="card"><div class="label">Unlocked</div><div style="font-weight:800;margin-top:6px">{award}</div><div class="hob">For 50 Higher questions right first time</div></section>
 </aside>
</div>
<div class="tabs"><span class="on">🎯<i>Today</i></span><span>✏️<i>Practise</i></span><span>📝<i>Mocks</i></span><span>📚<i>Learn</i></span><span>🎨<i>Me</i></span></div>
<div class="ttl">Proof {title} — hobby: {hobby}</div>
</body></html>"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for key, v in V.items():
            css = v['css']; i = css.index('\n'); vars_, rest = css[:i], css[i:]
            for cls, vp in (('laptop', {'width': 1440, 'height': 900}), ('phone', {'width': 390, 'height': 844})):
                html = PAGE.format(css_vars=vars_, css_rest=rest, font=v['font'], cls=cls, avatar=avatar(*v['av']), hobby=v['hobby'], title=v['title'],award=v['award'])
                f = OUT / f'{key}-{cls}.html'; f.write_text(html, encoding='utf-8')
                pg = await b.new_page(viewport=vp, device_scale_factor=2 if cls == 'laptop' else 3)
                await pg.goto(f.as_uri()); await pg.wait_for_timeout(300)
                await pg.screenshot(path=str(OUT / f'proof-{key}-{cls}.png')); await pg.close()
        await b.close()
asyncio.run(main())
