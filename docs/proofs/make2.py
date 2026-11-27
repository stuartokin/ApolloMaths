"""Second proofs: B Night study in light mode, and the Customise (shop) screen for older students."""
import asyncio, pathlib
from playwright.async_api import async_playwright
OUT = pathlib.Path(__file__).parent
src = (OUT / 'make.py').read_text(encoding='utf-8').rsplit('asyncio.run(main())', 1)[0]
ns = {'__file__': str(OUT / 'make.py')}; exec(src, ns)
V, PAGE, avatar = ns['V'], ns['PAGE'], ns['avatar']
B = V['B-night']
LIGHT = dict(B, av=('#8d5a3b','#151515','#8f7bff','#c7700f','#efe6ff'), title='B · Night study — light', css="""--bg:#f7f2ea;--card:#fffdf9e6;--ink:#1c1f36;--mute:#686a84;--acc:#c7700f;--acc2:#6c5ce7;--line:#e7dfd1;--chip:#f2ece1;--rail:#fffaf3d9;--glow:0 10px 30px #6c5ce714;
   body{background:linear-gradient(180deg,#fbf6ee 0,#efe8f6 100%)}
   .scene{background:radial-gradient(520px 360px at 80% 18%,#ffd9a066 0,transparent 70%)}
   .scene:after{content:'';position:absolute;left:0;right:0;bottom:0;height:190px;background:repeating-linear-gradient(90deg,#d9d2ec 0 38px,#e3dcf1 38px 70px,#d4cce8 70px 96px,#e6e0f3 96px 150px);opacity:.8;clip-path:polygon(0 60%,4% 60%,4% 30%,9% 30%,9% 52%,14% 52%,14% 18%,19% 18%,19% 46%,25% 46%,25% 34%,31% 34%,31% 58%,38% 58%,38% 24%,43% 24%,43% 44%,50% 44%,50% 12%,55% 12%,55% 50%,62% 50%,62% 30%,68% 30%,68% 56%,74% 56%,74% 22%,80% 22%,80% 40%,86% 40%,86% 16%,92% 16%,92% 48%,100% 48%,100% 100%,0 100%)}
   .flag{position:absolute;right:70px;bottom:120px;width:200px;height:60px;opacity:.45;background:repeating-linear-gradient(90deg,#c7700f 0 4px,transparent 4px 10px);clip-path:polygon(0 70%,6% 40%,12% 60%,18% 20%,24% 55%,30% 35%,36% 75%,42% 15%,48% 50%,54% 30%,60% 65%,66% 25%,72% 55%,78% 40%,84% 70%,90% 35%,100% 60%,100% 100%,0 100%)}
   .card,.rail{backdrop-filter:blur(10px)}.btn{border-radius:14px;color:#fff}.q{font-family:'DejaVu Serif',serif}""")
DESK = """<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="240" rx="18" fill="var(--chip)"/>
 <rect x="0" y="170" width="420" height="70" fill="#00000014"/><rect x="40" y="150" width="340" height="14" rx="4" fill="#8a5a3c"/>
 <rect x="58" y="164" width="10" height="60" fill="#6e4730"/><rect x="352" y="164" width="10" height="60" fill="#6e4730"/>
 <rect x="150" y="70" width="130" height="76" rx="6" fill="#1b1f3b" stroke="#8f7bff" stroke-width="3"/><rect x="208" y="146" width="14" height="6" fill="#444"/>
 <text x="215" y="112" text-anchor="middle" font-size="16" fill="#ffb547" font-family="DejaVu Serif">3x² − 5x − 2</text>
 <path d="M90 150 L100 96 L120 92" stroke="#2a2a3a" stroke-width="5" fill="none"/><path d="M108 84 l26 10 -8 12 -26 -10z" fill="#ffb547"/><circle cx="126" cy="104" r="40" fill="#ffb54722"/>
 <rect x="300" y="122" width="56" height="28" rx="4" fill="#2a2a3a"/><circle cx="328" cy="134" r="11" fill="#111"/><circle cx="328" cy="134" r="3" fill="#ffb547"/>
 <rect x="62" y="128" width="18" height="22" rx="3" fill="#c96"/><path d="M71 128 C60 108 66 96 71 92 C76 96 84 108 71 128" fill="#3dcf9b"/>
 <text x="330" y="60" font-size="26">🎧</text></svg>"""
ITEMS = [('🧥','Bomber jacket','Outfit','350','buy'),('🎽','Colour-block hoodie','Outfit','','on'),('🧥','Varsity jacket','Outfit','Level 20','lock'),
 ('👟','Classic white trainers','Trainers','300','buy'),('👟','High-tops','Trainers','400','buy'),('🎧','Over-ear headphones','Accessory','','owned'),
 ('👓','Round glasses','Accessory','150','buy'),('⌚','Smartwatch','Accessory','450','buy'),('🎹','Synth keyboard','Desk · Music','700','buy'),
 ('💿','Vinyl turntable','Desk · Music','','owned'),('🖥️','Dual monitors','Desk','800','buy'),('🪴','Desk plant','Desk','100','buy'),
 ('🌆','Rooftop studio at night','Backdrop','900','buy'),('🏷️','“Quadratic Boss” title','Title','50 quadratics right first time','earn'),
 ('🧊','Streak freeze','Study perk','200','buy'),('🎵','Lo-fi focus sounds','Study perk','250','buy')]
def shop_page(v, cls):
    cards = ''.join(f"""<div class="item {st}"><div class="ico">{i}</div><div class="nm">{n}</div><div class="cat">{c}</div>
      <div class="pr">{'✔ Wearing' if st=='on' else 'Owned' if st=='owned' else '🔒 '+p if st=='lock' else '🎯 '+p if st=='earn' else '💳 '+p}</div></div>""" for i,n,c,p,st in ITEMS)
    page = PAGE.format(css_vars=v['css'].split('\n',1)[0], css_rest=v['css'].split('\n',1)[1], font=v['font'], cls=cls, avatar=avatar(*v['av']), hobby=v['hobby'], title=v['title']+' — Customise', award='')
    main = f"""<main class="main"><div class="top"><h1>Customise</h1><span class="chip">💳 <b>1,280</b> credits</span><span class="chip">Level <b>14</b> · 160 XP to Level 15</span><span class="chip">☀️ / 🌙 <b>Theme</b></span></div>
     <div class="tabs2"><span class="on">All</span><span>Outfits</span><span>Trainers</span><span>Accessories</span><span>Desk &amp; room</span><span>Backdrops</span><span>Titles</span><span>Study perks</span></div>
     <div class="items">{cards}</div></main>
     <aside class="side"><section class="card"><div class="label">Your space</div><div class="desk">{DESK}</div><div class="hob">Wearing: colour-block hoodie · over-ear headphones<br>Desk: vinyl turntable, lamp</div></section>
     <section class="card plan"><div class="label">How you earn</div><div>✅ Right first time<span class="pill">+10</span></div><div>📘 Lesson finished<span class="pill">+25</span></div><div>📝 Mock paper<span class="pill">+100</span></div><div>🔥 7-day streak<span class="pill">+50</span></div><div>🔧 Fix-it cleared<span class="pill">+15</span></div></section></aside>"""
    import re
    page = re.sub(r'<main class="main">.*?</aside>\n</div>', main + '\n</div>', page, flags=re.S)
    page = page.replace('</style>', """.tabs2{display:flex;gap:8px;flex-wrap:wrap}.tabs2 span{white-space:nowrap;padding:8px 14px;border-radius:999px;border:1px solid var(--line);font-size:13px;font-weight:700;background:var(--chip)}.tabs2 .on{background:var(--acc);color:#111;border-color:var(--acc)}
.items{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;overflow:hidden}.item{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px;box-shadow:var(--glow)}
.item .ico{font-size:34px;height:52px;display:flex;align-items:center}.item .nm{font-weight:800;font-size:14px;margin-top:4px}.item .cat{font-size:11px;color:var(--mute);font-weight:600}
.item .pr{margin-top:10px;font-size:12px;font-weight:800;padding:6px 10px;border-radius:10px;background:var(--chip);display:inline-block}.item.on{outline:2px solid var(--acc)}.item.on .pr{background:var(--acc);color:#111}
.item.lock{opacity:.65}.item.earn .pr{color:var(--acc2)}.desk svg{width:100%;display:block;margin-top:8px;border-radius:14px}
.phone .items{grid-template-columns:repeat(2,1fr)}.phone .tabs2{flex-wrap:nowrap;overflow:hidden}
</style>""")
    return page
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        jobs = []
        for cls, vp in (('laptop', {'width': 1440, 'height': 900}), ('phone', {'width': 390, 'height': 844})):
            jobs.append((f'proof-B-light-{cls}', PAGE.format(css_vars=LIGHT['css'].split('\n',1)[0], css_rest=LIGHT['css'].split('\n',1)[1], font=LIGHT['font'], cls=cls, avatar=avatar(*LIGHT['av']), hobby=LIGHT['hobby'], title=LIGHT['title'], award=LIGHT['award']), vp, cls))
            jobs.append((f'proof-B-customise-dark-{cls}', shop_page(B, cls), vp, cls))
            jobs.append((f'proof-B-customise-light-{cls}', shop_page(LIGHT, cls), vp, cls))
        for name, html, vp, cls in jobs:
            f = OUT / f'{name}.html'; f.write_text(html, encoding='utf-8')
            pg = await b.new_page(viewport=vp, device_scale_factor=2 if cls == 'laptop' else 3)
            await pg.goto(f.as_uri()); await pg.wait_for_timeout(300); await pg.screenshot(path=str(OUT / f'{name}.png')); await pg.close()
        await b.close()
asyncio.run(main())
