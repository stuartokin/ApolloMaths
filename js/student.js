'use strict';
// STUDENT SPACE: the child's side of the app, built around their character and interests.
// A side rail on wide screens (character, name, points, the five areas, sound and Grown-ups), a slim header,
// themed shop and game names, themed items drawn on the character, and the "My room" area.
const Student=(()=>{
 const themeGroup=()=>{const id=typeof themeConf==='function'?themeConf().id:'anfield';return id==='anfield'||id==='football'?'football':id;};
 // ---- which Shop items a child sees: their theme's catalogue (football themes keep the original Shop) ----
 function itemForTheme(i){const g=themeGroup();if(i.theme)return i.theme===g;return g==='football';}
 // ---- themed items are drawn from their emoji and colour ----
 if(typeof drawAvatar==='function'){const base=drawAvatar;window.drawAvatar=function(av,opt={}){const eq=(av&&av.eq)||{},th=k=>{const it=eq[k]&&typeof itemById!=='undefined'&&itemById[eq[k]];return it&&it.em?it:null;};
  const sc=th('scene');let svg=base(av,sc?Object.assign({},opt,{scene:false}):opt);if(!svg||typeof svg!=='string')return svg;let under='',over='';
  if(sc&&opt.scene!==false){under=`<rect width="240" height="300" rx="24" fill="${sc.sky||'#dff'}"/><rect y="215" width="240" height="85" fill="${sc.ground||'#9d9'}"/>`+(sc.dec||[]).map((e,i)=>`<text x="${[34,206,196][i]}" y="${[60,74,236][i]}" font-size="${[30,26,28][i]}" text-anchor="middle">${e}</text>`).join('');}
  const top=th('top');if(top)over+=`<path d="M78,168 Q120,150 162,168 L170,236 Q120,246 70,236 Z" fill="${top.col||'#888'}" stroke="#1d2432" stroke-width="3" opacity=".96"/><text x="120" y="212" font-size="26" text-anchor="middle">${top.em}</text>`;
  const boots=th('boots');if(boots)over+=`<rect x="86" y="279" width="30" height="14" rx="5" fill="${boots.col||'#555'}" stroke="#1d2432" stroke-width="2.5"/><rect x="124" y="279" width="30" height="14" rx="5" fill="${boots.col||'#555'}" stroke="#1d2432" stroke-width="2.5"/>`;
  const hat=th('hat');if(hat)over+=`<text x="120" y="66" font-size="54" text-anchor="middle">${hat.em}</text>`;
  const hand=th('hand');if(hand)over+=`<text x="186" y="236" font-size="34" text-anchor="middle">${hand.em}</text>`;
  const pet=th('pet');if(pet)over+=`<text x="40" y="288" font-size="40" text-anchor="middle">${pet.em}</text>`;
  if(under)svg=svg.includes('</defs>')?svg.replace('</defs>','</defs>'+under):svg.replace(/(<svg[^>]*>)/,'$1'+under);if(over)svg=svg.replace(/<\/svg>\s*$/,over+'</svg>');return svg;};}
 // ---- arcade game names follow the theme ----
 const GAME_NAMES={animals:{invaders:'Garden Guardians',maze:'Burrow Run',meteor:'Hailstorm',guardian:'Nest Guardian',ladder:'Treetop Dash',racer:'Pony Derby',snake:'Caterpillar Crawl',pinball:'Pond Pinball',bricks:'Beaver Dam Breaker',hopper:'Frog Crossing',blocks:'Log Stack'},
  space:{invaders:'Star Invaders',maze:'Moon Maze',meteor:'Meteor Storm',guardian:'Planet Guardian',ladder:'Rocket Ladder',racer:'Comet Racer',snake:'Space Worm',pinball:'Galaxy Pinball',bricks:'Asteroid Blaster',hopper:'Orbit Hopper',blocks:'Satellite Stack'},
  music:{invaders:'Note Invaders',maze:'Melody Maze',meteor:'Confetti Storm',guardian:'Stage Guardian',ladder:'Scale Climber',racer:'Rhythm Racer',snake:'Conga Line',pinball:'Jukebox Pinball',bricks:'Drum Breaker',hopper:'Dance Hopper',blocks:'Beat Blocks'}};
 if(typeof GAME_LIST!=='undefined')GAME_LIST.forEach(g=>{if(g.__themed)return;const orig=g.name;Object.defineProperty(g,'name',{get(){const m=GAME_NAMES[themeGroup()];return m&&m[g.id]||orig;},configurable:true});g.__themed=true;});
 // ---- the rail: character, name, points, areas, sound and Grown-ups ----
 const AREAS=[['today','🎯','Today'],['practise','✏️','Practise'],['mock','🏆','Mock exam'],['learn','📚','Learn'],['rewards','🏠','My room']];
 const txt=id=>{const e=document.getElementById(id);return e?e.textContent.trim():'';};
 function parentBtn(){return [...document.querySelectorAll('button')].find(b=>/open parent dashboard/i.test(b.textContent));}
 function openGrownups(){if(typeof Parent!=='undefined'&&Parent.open){if(typeof Family!=='undefined'&&Family.guard)Family.guard('Open the grown-ups area',()=>Parent.open('overview'));else Parent.open('overview');}else{const b=parentBtn();if(b)b.click();}}
 function soundLabel(){const m=document.getElementById('muteBtn');return m&&/off/i.test(m.textContent)?'🔇 Sound off':'🔊 Sound on';}
 function rail(){if(document.getElementById('sRail'))return;const r=document.createElement('aside');r.id='sRail';r.className='s-rail';r.setAttribute('aria-label','My space');
  r.innerHTML=`<button type="button" class="s-me" data-go="rewards" title="My room"><span class="s-av" id="sAv"></span><b id="sName"></b><span class="s-pts"><span id="sPts"></span> · <span id="sStreak"></span></span></button>
  <nav class="s-nav">${AREAS.map(([k,i,l])=>`<button type="button" data-go="${k}"><span aria-hidden="true">${i}</span> ${l}</button>`).join('')}</nav>
  <div class="s-foot"><button type="button" class="s-sound" id="sSound"></button><button type="button" class="s-grown" id="sGrown">👪 Grown-ups</button></div>`;
  document.body.appendChild(r);
  r.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b){const k=b.dataset.go;if(k==='mock'){const m=document.querySelector('[data-mode="mock"]');if(m&&!m.classList.contains('active'))m.click();}Hub.show(k);}});
  document.getElementById('sSound').addEventListener('click',()=>{const m=document.getElementById('muteBtn');if(m)m.click();setTimeout(refresh,50);});
  document.getElementById('sGrown').addEventListener('click',openGrownups);
  // on phones the sound button is pinned at the top right
  if(!document.getElementById('sSoundMini')){const s=document.createElement('button');s.type='button';s.id='sSoundMini';s.className='s-sound-mini';s.addEventListener('click',()=>{const m=document.getElementById('muteBtn');if(m)m.click();setTimeout(refresh,50);});document.body.appendChild(s);}}
 function refresh(){try{const av=document.getElementById('sAv');if(av&&typeof drawAvatar==='function'&&typeof stats!=='undefined'){const sig=JSON.stringify([stats.avatar,themeGroup()]);if(av.dataset.sig!==sig){av.dataset.sig=sig;av.innerHTML=drawAvatar(stats.avatar,{});}}
  const n=document.getElementById('sName');if(n&&typeof playerName==='function')n.textContent=playerName();const p=document.getElementById('sPts');if(p)p.textContent=txt('points');const st=document.getElementById('sStreak');if(st)st.textContent=txt('streak');
  const now=document.body.dataset.areaNow;document.querySelectorAll('#sRail [data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===now&&!b.classList.contains('s-me')));
  saveState();const snd=soundLabel();const a=document.getElementById('sSound');if(a)a.textContent=snd;const b=document.getElementById('sSoundMini');if(b){b.textContent=snd.slice(0,2);b.title=snd;}}catch(e){}}
 // ---- the menu, in the usual order ----
 function menuOrder(){const m=document.getElementById('hubMenu');if(!m)return;if(!document.getElementById('menuGrown')){const g=document.createElement('button');g.type='button';g.className='heroBtn';g.id='menuGrown';g.textContent='👪 Grown-ups';g.addEventListener('click',openGrownups);m.appendChild(g);}
  const tb=document.getElementById('themeBtn');if(tb)tb.textContent='🎨 Theme & character';
  ['#switchPlayer','#themeBtn','#muteBtn','#voiceBtn','[data-help="guide"]','#installBtn','#menuGrown'].forEach(sel=>{const el=m.querySelector(sel);if(el)m.appendChild(el);});}
 // ---- My room: the character's own space ----
 function myRoom(){const pc=document.getElementById('playerCard');if(pc){const h=pc.querySelector('h2');if(h&&typeof playerName==='function'&&!h.dataset.done){h.dataset.done='1';h.textContent=`🏠 ${playerName()}’s room`;}}
  const lay=document.querySelector('.layout');if(!lay)return;
  if(!document.getElementById('roomThemes')){const c=document.createElement('section');c.id='roomThemes';c.className='panel';c.dataset.area='rewards';c.dataset.slot='medals';lay.appendChild(c);}
  const c=document.getElementById('roomThemes'),cur=typeof themeConf==='function'?themeConf():{id:'anfield'};const sig=JSON.stringify(cur);
  if(c.dataset.sig!==sig){c.dataset.sig=sig;c.innerHTML=`<h2>🎨 My theme</h2><p class="mini">Changes your colours, your Shop, your games and the stories in your questions.</p><div class="th-grid">${Object.entries(THEMES).map(([k,t])=>`<button type="button" class="th-card${k===cur.id?' on':''}" data-th="${k}" style="--c:${k==='football'?cur.colour:(typeof t.vars==='function'?t.vars(cur):t.vars)['--red']}"><span class="th-swatch"></span><b>${t.name}</b></button>`).join('')}</div>${cur.id==='football'?'<p class="mini">Choose your team name and colour from ⚙️ Menu → 🎨 Theme & character.</p>':''}`;}
  const played=typeof stats!=='undefined'&&stats.arcade&&Array.isArray(stats.arcade.plays)&&stats.arcade.plays.length;
  if(played&&!document.getElementById('roomGames')){const g=document.createElement('section');g.id='roomGames';g.className='panel';g.dataset.area='rewards';g.dataset.slot='board';g.innerHTML='<h2>🕹️ My games</h2><p class="mini">Your arcade games — themed to match you. Play time is earned with maths.</p><button type="button" class="primary" id="roomGamesGo">🕹️ Open the arcade</button>';lay.appendChild(g);g.querySelector('#roomGamesGo').addEventListener('click',()=>{try{Arcade.open();}catch(e){}});}
  if(typeof Hub!=='undefined'&&document.body.dataset.areaNow)document.querySelectorAll('#roomThemes,#roomGames').forEach(el=>el.classList.toggle('area-on',el.dataset.area.split(' ').includes(document.body.dataset.areaNow)));}
 function smallTouches(){try{const nm=typeof examProfile==='function'?examProfile().name:'your exam';document.querySelectorAll('.examname').forEach(e=>{if(e.textContent!==nm)e.textContent=nm;});
  const fb=document.getElementById('famBanner'),need=!!(fb&&!fb.classList.contains('hidden'));const g=document.getElementById('sGrown');if(g){const t=need?'👪 Grown-ups ⚠️':'👪 Grown-ups';if(g.textContent!==t){g.textContent=t;g.title=need?'A grown-up needs to set up family codes':'';}}
  if(typeof stats!=='undefined'&&!stats.focusExamSet&&typeof examId==='function'&&!/^tiffin/.test(examId())){const orig=['volume','equivfrac','shapes','measure','data'];const f=Array.isArray(stats.focus)?stats.focus:[];stats.focusExamSet=true;if(!f.length||(f.length===orig.length&&f.every(k=>orig.includes(k)))){const w=examProfile().weights||{};stats.focus=Object.keys(topics).filter(k=>k!=='tiffin').sort((a,b)=>(w[b]||1)-(w[a]||1)).slice(0,5);if(typeof applyFocus==='function')applyFocus(stats.focus);if(typeof drawTopics==='function')drawTopics();}if(typeof save==='function')save(false);}}catch(e){}}
 function grownupsOut(){const d=document.getElementById('dashboard');const s=d&&(d.closest('section')||d);if(s){s.dataset.area='grownups';s.classList.remove('area-on');}}
 function init(){try{setTimeout(()=>{saveHome();footer();},50);const h1=document.querySelector('.hero h1');if(h1&&/<br/i.test(h1.innerHTML))h1.innerHTML=h1.innerHTML.replace(/<br\s*\/?>/i,' ');rail();menuOrder();myRoom();grownupsOut();document.body.classList.add('student');refresh();setInterval(()=>{refresh();myRoom();smallTouches();},1000);smallTouches();}catch(e){console.warn('student',e);}}
 // the theme's starter outfit, held item and scene replace items that belong to a different theme
 function starters(){if(typeof stats==='undefined'||!stats.avatar||!stats.avatar.eq)return;const g=themeGroup(),eq=stats.avatar.eq,pre={animals:'an_',space:'sp_',music:'mu_'}[g],dflt=typeof defaultAvatar==='function'?defaultAvatar().eq:{};
  for(const slot of ['top','hand','scene','hat','pet','boots']){const it=eq[slot]&&itemById[eq[slot]],fits=it?(g==='football'?!it.theme:it.theme===g):true;if(fits)continue;
   const st=pre&&shopItems.find(i=>i.free&&i.slot===slot&&i.id.startsWith(pre));eq[slot]=st?st.id:(dflt[slot]!==undefined?dflt[slot]:null);}
  if(pre)for(const slot of ['top','hand','scene']){const it=eq[slot]&&itemById[eq[slot]];if(!it||!it.theme){const st=shopItems.find(i=>i.free&&i.slot===slot&&i.id.startsWith(pre));if(st)eq[slot]=st.id;}}
  if(typeof save==='function')save(false);try{if(typeof Locker!=='undefined'&&Locker.refresh)Locker.refresh();}catch(e){}refresh();}
 // ---- saving: one clear home — a 💾 button in the rail (and at the top on phones) that opens the save options ----
 function saveHome(){const btns=document.querySelector('#saveBar .savebtns');if(!btns||document.getElementById('savePop'))return;
  const pop=document.createElement('div');pop.id='savePop';pop.className='save-pop hidden';pop.innerHTML='<b id="savePopTitle"></b><span class="mini" id="savePopDetail"></span>';pop.appendChild(btns);document.body.appendChild(pop);
  const mk=(id,cls,host)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className=cls;b.addEventListener('click',e=>{e.stopPropagation();const open=pop.classList.contains('hidden');pop.classList.toggle('hidden');if(open){const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1,r=b.getBoundingClientRect(),W=window.innerWidth/z,H=window.innerHeight/z,L=r.left/z,B=r.bottom/z,T=r.top/z;let top=B+6;if(top+pop.offsetHeight>H-8)top=Math.max(8,T-pop.offsetHeight-6);pop.style.left=Math.max(8,Math.min(L,W-pop.offsetWidth-8))+'px';pop.style.top=top+'px';}});host.appendChild(b);return b;};
  const foot=document.querySelector('#sRail .s-foot');if(foot){const b=mk('sSave','s-save',foot);foot.insertBefore(b,foot.firstChild);}mk('sSaveMini','s-save-mini',document.body);const rib=document.createElement('button');rib.type='button';rib.className='save-ribbon';rib.textContent='⚠️ Not saved — tap to save';rib.addEventListener('click',e=>{e.stopPropagation();document.getElementById('sSaveMini').click();});document.body.appendChild(rib);
  document.addEventListener('click',e=>{if(!pop.contains(e.target))pop.classList.add('hidden');});pop.addEventListener('click',e=>{if(e.target.closest('button'))setTimeout(()=>pop.classList.add('hidden'),300);});}
 function saveState(){const t=txt('saveTitle'),ok=/saved/i.test(t)&&!/not saved/i.test(t),chip=txt('fileChip').replace(/^\W+/,''),time=(chip.match(/\d{1,2}:\d{2}/)||[''])[0];
  const lbl=ok?`✅ Saved${time?' '+time:''}`:'⚠️ Not saved — tap to save';const a=document.getElementById('sSave');if(a){a.textContent=lbl;a.classList.toggle('warn',!ok);}
  const m=document.getElementById('sSaveMini');if(m){m.textContent='💾';m.title=lbl;m.classList.toggle('warn',!ok);}document.body.classList.toggle('unsaved',!ok);
  const pt=document.getElementById('savePopTitle');if(pt)pt.textContent=t;const pd=document.getElementById('savePopDetail');if(pd)pd.textContent=chip||txt('saveDetail');}
 // ---- the footer: the essentials, with the rest behind ℹ️ ----
 function footer(){const f=document.querySelector('footer.footer');if(!f||f.dataset.slim)return;f.dataset.slim='1';const more=document.createElement('div');more.id='footMore';more.className='foot-more hidden';
  [...f.childNodes].forEach(n=>{const keep=n.nodeType===1&&(n.matches('.pname,[data-help]')||n.id==='appVersion');if(n.nodeType===1&&n.classList.contains('aidisc'))more.appendChild(n);else if(n.nodeType===3&&/Original|adverts|required/i.test(n.textContent)){more.appendChild(document.createTextNode(n.textContent.replace(/^\s*❤️?\s*·?/,'').trim()+' '));n.textContent=' ❤️ · ';}else if(!keep&&n.nodeType===1&&!n.matches('.pname'))more.appendChild(n);});
  const info=document.createElement('button');info.type='button';info.className='linkbtn';info.textContent='ℹ️ About';info.addEventListener('click',()=>more.classList.toggle('hidden'));f.appendChild(document.createTextNode(' · '));f.appendChild(info);f.appendChild(more);}
 function themeEm(){return {football:'⚽',animals:'🐞',space:'⭐',music:'🎵'}[themeGroup()]||'⚽';}
 return{themeEm,init,itemForTheme,refresh,openGrownups,starters,saveHome,saveState,footer};})();
window.addEventListener('load',()=>setTimeout(()=>Student.init(),400));
// a new player's interests and character (chosen on the add-player form) are applied as their profile opens
window.addEventListener('load',()=>setTimeout(()=>{try{const raw=sessionStorage.getItem('am-new-look');if(!raw||typeof stats==='undefined')return;const n=JSON.parse(raw),cur=Storage.current&&Storage.current();if(!cur||cur.id!==n.pid)return;sessionStorage.removeItem('am-new-look');
 if(n.theme&&THEMES[n.theme])stats.theme={id:n.theme,club:n.club||'My Team',colour:'#e51c35'};if(n.body&&n.body!=='own'&&stats.avatar)stats.avatar.body=n.body;
 const g=n.theme==='space'?'sp':n.theme==='animals'?'an':n.theme==='music'?'mu':null;if(g&&stats.avatar&&stats.avatar.eq){const free=shopItems.filter(i=>i.free&&i.id.startsWith(g+'_'));free.forEach(i=>{stats.avatar.eq[i.slot]=i.id;});}
 // focus topics follow the exam: the five topics it weights most (Tiffin keeps the original five)
 if(typeof examProfile==='function'&&!/^tiffin/.test(examId())){const w=examProfile().weights||{};const top=Object.keys(topics).filter(k=>k!=='tiffin').sort((a,b)=>(w[b]||1)-(w[a]||1)).slice(0,5);stats.focus=top;if(typeof applyFocus==='function')applyFocus(stats.focus);}
 if(typeof save==='function')save(false);if(typeof applyTheme==='function')applyTheme();if(typeof updateStats==='function')updateStats();if(typeof drawTopics==='function')drawTopics();
 if(typeof toast==='function')toast('Welcome! Make your character your own — tap your picture any time.');}catch(e){console.warn('new look',e);}},700));
// ---------------- grown-ups: the Family & data tab (save, open, export, family codes, players) ----------------
function familyTab(s){const list=typeof Storage!=='undefined'&&Storage.profiles?Storage.profiles():[];
 const P=(re,label,note)=>`<button type="button" class="ov-card" data-proxy="${re}"><b>${label}</b><span>${note}</span></button>`;
 return `<h3>👨‍👩‍👧 Family &amp; data</h3><p class="section-note">Saving, backups and exports live here, away from the children’s screen. Progress also saves itself automatically once a progress file is set up.</p>
 <div class="ov-cards">${P('save progress','💾 Save progress','save to the progress file')}${P('open progress file','📂 Open progress file','load a saved file')}${P('save as','📄 Save as…','choose a new file')}${P('export \\(\\.json\\)','⬇️ Export (.json)','a backup copy')}${P('export every question','📊 Export every question','a spreadsheet (CSV)')}</div>
 <h3>👥 Players</h3><p>${list.map(p=>`<b>${esc(p.name)}</b>`).join(' · ')||'—'}</p><div class="ov-cards">${P('^\\W*switch player','🔁 Switch or add a player','add a child, or change who is playing')}${P('^\\W*set up$','🔐 Family codes','set up or change the grown-up passphrase')}</div>`;}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-proxy]');if(!b)return;const re=new RegExp(b.dataset.proxy,'i');
 const t=[...document.querySelectorAll('button')].find(x=>!x.closest('#parent')&&!x.dataset.proxy&&re.test(x.textContent.trim()));
 if(t){const d=document.getElementById('parent');if(/switch|set up/i.test(b.dataset.proxy)&&d&&d.open)d.close();t.click();}else if(typeof toast==='function')toast('That option isn’t available on this device yet.');});
