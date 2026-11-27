'use strict';
// SENIOR LOOK (2.87): the GCSE / A-level look ("Night study", with a light theme). A layer like stages.js and gcse.js:
// nothing underneath changes, and younger children never see it. When Look.seniorOn() (js/gcse.js):
// - body.look-senior (+ .sn-light) and css/senior.css restyle the page; a quiet night-city scene sits behind it;
// - the character is drawn with drawSenior(); "My room" becomes 🎨 Customise (age-appropriate shop, js/data/senior-shop.js);
// - wording is calm (no "GOAL! KERPOW!"): Submit, Correct, XP and levels; points to spend are shown as credits;
// - a ☀️/🌙 switch; an optional focus sound (soft rain) once bought.
const Senior=(()=>{
 const on=()=>typeof Look!=='undefined'&&typeof stats!=='undefined'&&Look.seniorOn(stats);
 const sn=()=>stats.senior;
 const lvl=()=>snLevel(snXP(stats)),credits=()=>wallet(stats);
 function hobby(){return HOBBIES[sn().hobby]||HOBBIES.football;}
 // ---------- look on / off ----------
 let wasOn=null;
 function apply(){const o=on();document.body.classList.toggle('look-senior',o);document.body.classList.toggle('sn-light',o&&sn().theme==='light');
  if(o){const h=hobby();document.body.style.setProperty('--sn-acc',sn().theme==='light'?h.accL:h.acc);scene();}else document.body.style.removeProperty('--sn-acc');
  if(o!==wasOn){wasOn=o;sig='';tick();}}
 function scene(){let s=document.getElementById('snScene');if(!s){s=document.createElement('div');s.id='snScene';s.setAttribute('aria-hidden','true');s.innerHTML='<div class="sn-glow"></div><div class="sn-city"></div>';document.body.prepend(s);}
  const bd=SN_BY[sn().backdrop]||SN_BY.sn_bd_city;s.style.setProperty('--sky1',bd.sky[0]);s.style.setProperty('--sky2',bd.sky[1]);s.style.setProperty('--glowc',bd.glow);}
 // ---------- characters, labels and wording (kept up to date by a light tick) ----------
 let sig='';
 function tick(){if(!on())return;try{const k=JSON.stringify([stats.avatar,sn(),stats.points,stats.streak]),stale=['sAv','missionAvatar','pcAvatar'].some(i=>{const el=document.getElementById(i);return el&&!el.querySelector('.sn-av');});if(k!==sig||stale){sig=k;
   const bust=drawSenior(stats.avatar,sn(),{bust:true});['sAv','missionAvatar'].forEach(i=>{const el=document.getElementById(i);if(el)el.innerHTML=bust;});
   const pc=document.getElementById('pcAvatar');if(pc)pc.innerHTML=drawSenior(stats.avatar,sn());}
  const L=lvl(),pts=document.getElementById('sPts');if(pts){let m=document.getElementById('snPts');if(!m){m=document.createElement('span');m.id='snPts';m.className='sn-only-inline';pts.insertAdjacentElement('afterend',m);}const t=`Level ${L} · ${snXP(stats).toLocaleString('en-GB')} XP`;if(m.textContent!==t)m.textContent=t;}
  const hello=document.getElementById('snHello');if(hello){const h=new Date().getHours();hello.textContent=`${h<12?'Good morning':h<18?'Good afternoon':'Good evening'}, ${playerName()}`;}
  else{const hero=document.querySelector('.hero');if(hero){const d=document.createElement('div');d.id='snHello';d.className='sn-hello';hero.querySelector('h1').insertAdjacentElement('beforebegin',d);}}
  const tag=document.querySelector('.hero small');if(tag)tag.textContent=`${hobby().icon} ${hobby().name.toUpperCase()} · LEVEL ${L}`;
  const tb=document.getElementById('snTheme'),foot=document.querySelector('.s-rail .s-foot'),hero=document.querySelector('.hero .whoplays'),railOn=foot&&foot.offsetParent!==null,home=railOn?foot:hero;if(tb&&home&&tb.parentElement!==home)home.prepend(tb);
  words(document.querySelector('.shell'));words(document.getElementById('hubNav'));words(document.getElementById('sRail'));const ld=document.getElementById('learn');if(ld&&ld.open)words(ld);}catch(e){console.warn('senior',e);}}
 const SWAPS=[[/SHOOT! ?⚽/g,'Submit'],[/SHOOT!/g,'Submit'],[/Pick your mission/g,'Choose a topic'],[/All levels use real maths thinking\. Choose what you'd like to train!/g,'Practise one topic, a mix, or your Fix-it list.'],[/Keep training!/g,'Today’s plan'],[/Keep your maths muscles strong!/g,'Small steps, every day.'],[/Match centre/g,'This session'],[/Coach's playbook/g,'Method tips'],[/Choose your game mode/g,'Choose a mode'],[/Mixed-topic challenge/g,'Mixed practice'],[/10-question match/g,'10-question set'],[/GOAL! ✅/g,'Correct ✓'],[/MATCH DAY ⚽/g,'PRACTICE'],[/WARM-UP 🟢/g,'WARM-UP'],[/BOSS BATTLE 💥/g,'CHALLENGE'],[/Match-day challenge/g,'Practice'],[/Boss challenge/g,'Challenge'],
  [/\bpower points\b/gi,'XP'],[/Goal streak/gi,'Streak'],[/Missions solved/gi,'Solved'],[/⚽ Practise/g,'Practise'],[/⚽ /g,''],[/ ⚽/g,''],[/My room/g,'Customise'],[/🏠/g,'🎨'],[/superstar/g,''],[/^⚡ /g,''],[/ ⚡/g,' XP'],[/⚡/g,'XP']];
 function words(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest('svg,.katex,input,textarea,#parent,.ln-opt')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;
  while((n=w.nextNode())){const t=n.nodeValue;if(!/[⚽⚡🏠]|SHOOT|GOAL!|MATCH DAY|WARM-UP|BOSS|Match-day|Boss challenge|power points|Goal streak|Missions solved|My room|superstar|Pick your mission|All levels use|Keep training|muscles|Match centre|Coach's playbook|game mode|Mixed-topic|10-question match/i.test(t))continue;let v=t;for(const[a,b]of SWAPS)v=v.replace(a,b);if(v!==t)n.nodeValue=v;}}
 // the children's Shop news is not for older students
 {const base=toast;toast=function(m){if(on()&&typeof m==='string'){if(/\b(Shop|kits?|pets?|sidekicks?|Maths Legend|Locker Room|deal|hoops|celebration)\b/i.test(m))return;m=m.replace(/ ?⚡/g,' XP');}return base.call(this,m);};}
 // calmer feedback
 {const base=notice;notice=function(type,msg){if(on()&&typeof msg==='string'){if(type==='good')msg=msg.replace(/^[\s\S]*?Correct:/,'✓ Correct:').replace(/ ?⚡/g,' XP');msg=msg.replace(/,? superstar!?/g,'.').replace(/ ⚡/g,' XP');}return base(type,msg);};}
 // no cartoon celebrations, nudges or shop announcements
 {const base=Locker.onCorrect;Locker.onCorrect=function(){if(on()){Locker.refresh();return;}return base.apply(this,arguments);};}
 {const base=Locker.open;Locker.open=function(){if(on())return open();return base.apply(this,arguments);};}
 document.addEventListener('click',e=>{if(!on())return;const b=e.target.closest&&e.target.closest('[data-go="rewards"],[data-area-go="rewards"],#pcAvatar,#missionAvatar,.playercard [data-open]');if(!b)return;e.preventDefault();e.stopPropagation();open();},true);
 // ---------- ☀️ / 🌙 ----------
 function themeBtn(){if(document.getElementById('snTheme'))return;const foot=document.querySelector('.s-foot')||document.querySelector('.hero .whoplays');if(!foot)return;const b=document.createElement('button');b.type='button';b.id='snTheme';b.className='s-sound sn-only';b.addEventListener('click',toggleTheme);foot.prepend(b);}
 function toggleTheme(){sn().theme=sn().theme==='light'?'dark':'light';save(false);apply();labelTheme();if(dlg().open)render();}
 function labelTheme(){const b=document.getElementById('snTheme');if(b)b.textContent=sn().theme==='light'?'🌙 Dark theme':'☀️ Light theme';}
 // ---------- 🎨 Customise ----------
 let tab='outfits',confirmId=null,preview=null;
 const dlg=()=>{let d=document.getElementById('snShop');if(!d){d=document.createElement('dialog');d.id='snShop';d.className='sn-shop';d.setAttribute('aria-label','Customise');document.body.appendChild(d);d.addEventListener('click',onClick);}return d;};
 function open(t){if(t)tab=t;confirmId=null;preview=null;render();const d=dlg();if(!d.open)d.showModal();}
 const visible=it=>!it.hobby||it.hobby===sn().hobby;
 const equipped=it=>it.slot.startsWith('d_')||['wall','floor'].includes(it.slot)?sn().desk[it.slot]===it.id:sn()[it.slot]===it.id;
 function state(it){if(snOwns(stats,it.id))return equipped(it)?'on':'own';if(it.earn)return 'earn';if(it.lvl&&lvl()<it.lvl)return 'lock';return credits()>=it.price?'buy':'short';}
 function card(it){const s=state(it),eb=it.earn?(()=>{const e=it.earn,have=e.any==='best'?(stats.best||0):(((stats.byTopic||{})[e.topic]||{}).first||0);return `🎯 ${Math.min(have,e.n)}/${e.n} ${e.any==='best'?'in a row':'right first time in '+(topics[e.topic]?topics[e.topic].label.split(':')[0]:'')}`;})():'';
  const btn=s==='on'?`<button class="sn-btn on" data-off="${it.id}" type="button">✓ ${it.slot==='title'||it.slot==='backdrop'||it.slot==='frame'?'Using':'Wearing'}</button>`:s==='own'?`<button class="sn-btn" data-use="${it.id}" type="button">Use</button>`:
   s==='lock'?`<span class="sn-pr">🔒 Level ${it.lvl}</span>`:s==='earn'?`<span class="sn-pr earn">${eb}</span>`:s==='buy'?(confirmId===it.id?`<button class="sn-btn buy pulse" data-buy="${it.id}" type="button">Tap again to buy</button>`:`<button class="sn-btn buy" data-ask="${it.id}" type="button">💳 ${it.price.toLocaleString('en-GB')}</button>`):`<span class="sn-pr">💳 ${it.price.toLocaleString('en-GB')} · ${(it.price-credits()).toLocaleString('en-GB')} to go</span>`;
  return `<div class="sn-item ${s}" data-preview="${it.id}"><div class="ico">${it.icon}</div><b>${esc(it.name)}</b><small>${esc((SN_CATS.find(c=>c[0]===it.cat)||[])[1]||'')}${it.hobby?' · '+esc(HOBBIES[it.hobby].name):''}</small>${btn}</div>`;}
 function lookTab(){const a=stats.avatar,o=avatarOptions,sw=(key,list)=>list.map(([c,l],i)=>`<button class="swatch${a[key]===i?' on':''}" style="background:${c}" data-look="${key}" data-val="${i}" aria-label="${l}" title="${l}" type="button"></button>`).join(''),
   ch=(key,list)=>list.map(([v,l])=>`<button class="chip${a[key]===v?' active':''}" data-look="${key}" data-val="${v}" type="button">${l}</button>`).join('');
  return `<div class="sn-look"><p><b>Skin tone</b><br>${o.skinOrder.map(i=>`<button class="swatch${a.skin===i?' on':''}" style="background:${o.skins[i][0]}" data-look="skin" data-val="${i}" aria-label="${o.skins[i][1]}" type="button"></button>`).join('')}</p>
   <p><b>Hair</b><br>${ch('hair',o.hair)}</p><p><b>Hair colour</b><br>${sw('hairCol',o.hairColours)}</p><p><b>Head covering</b><br>${ch('cover',o.covers)}</p>${a.cover&&a.cover!=='none'?`<p><b>Covering colour</b><br>${sw('coverCol',o.coverCols)}</p>`:''}</div>`;}
 function hobbyTab(){return `<p class="sn-mute">Your hobby sets your accent colour and unlocks its own desk items and backdrop. You can change it any time.</p><div class="sn-hobbies">${Object.entries(HOBBIES).map(([k,h])=>`<button type="button" class="sn-hob${sn().hobby===k?' on':''}" data-hobby="${k}" style="--h:${h.acc}"><span>${h.icon}</span>${esc(h.name)}</button>`).join('')}</div>`;}
 function render(){const d=dlg(),L=lvl(),next=snXpFor(L+1),xp=snXP(stats),pv=preview&&SN_BY[preview]?preview:null,pvSn=pv?previewSn(pv):sn();
  const tabs=[...SN_CATS,['hobby','Hobby'],['look','Hair & skin']];
  const body=tab==='hobby'?hobbyTab():tab==='look'?lookTab():`<div class="sn-items">${SN_ITEMS.filter(i=>i.cat===tab&&visible(i)).map(card).join('')}</div>`+(tab==='perks'?`<p class="sn-mute">${snOwns(stats,'sn_sounds')?`<button type="button" class="sn-btn" data-sound="1">${sn().sounds?'⏸ Turn focus sounds off':'▶ Turn focus sounds on'}</button>`:'Focus sounds play soft rain while you work — buy them once, then switch on or off here.'}</p>`:'');
  d.innerHTML=`<div class="sn-wrap"><header class="sn-head"><h2>🎨 Customise</h2><span class="sn-chip">💳 <b>${credits().toLocaleString('en-GB')}</b> credits</span><span class="sn-chip">Level <b>${L}</b> · ${(next-xp).toLocaleString('en-GB')} XP to Level ${L+1}</span><button type="button" class="sn-chip" data-theme="1">${sn().theme==='light'?'🌙 Dark':'☀️ Light'}</button><button type="button" class="sn-x" data-close="1" aria-label="Close">✕</button></header>
   <div class="sn-cols"><aside class="sn-me"><div class="sn-avbox">${drawSenior(stats.avatar,pvSn)}</div>${pv?`<p class="sn-mute center">Trying: <b>${esc(SN_BY[pv].name)}</b></p>`:`<p class="center"><b>${esc(playerName())}</b>${sn().title&&SN_BY[sn().title]?` · <span class="sn-acc">${esc(SN_BY[sn().title].name)}</span>`:''}</p>`}<div class="sn-deskbox">${drawDesk(pvSn)}</div>
    <div class="sn-earn"><b>How you earn</b><div>✅ Right first time <span>+20</span></div><div>📘 Lesson finished <span>+25</span></div><div>🔧 Fix-it cleared <span>+10</span></div><div>📝 Every question in a mock <span>XP</span></div><p class="sn-mute">XP sets your level and never goes down. Credits are what you spend.</p></div></aside>
   <section class="sn-main"><nav class="sn-tabs">${tabs.map(([k,l])=>`<button type="button" class="${tab===k?'on':''}" data-tab="${k}">${l}</button>`).join('')}</nav>${body}</section></div></div>`;}
 function previewSn(id){const it=SN_BY[id],p=JSON.parse(JSON.stringify(sn()));if(!it)return p;if(it.slot.startsWith('d_')||['wall','floor'].includes(it.slot))p.desk[it.slot]=id;else if(it.slot!=='perk')p[it.slot]=id;return p;}
 function use(id){const it=SN_BY[id];if(!it||!snOwns(stats,id))return;if(it.slot.startsWith('d_')||['wall','floor'].includes(it.slot))sn().desk[it.slot]=id;else if(it.slot!=='perk')sn()[it.slot]=id;save(false);}
 function takeOff(id){const it=SN_BY[id];if(!it)return;if(it.slot.startsWith('d_')||['wall','floor'].includes(it.slot))sn().desk[it.slot]=null;else if(['head','eyes','wrist'].includes(it.slot))sn()[it.slot]=null;save(false);}
 function buy(id){const it=SN_BY[id];if(!it||it.free||it.earn||snOwns(stats,id)||(it.lvl&&lvl()<it.lvl)||credits()<it.price)return;
  stats.spent+=it.price;stats.sOwned=(stats.sOwned||[]).concat(id);stats.purchases.push({t:Date.now(),id,price:it.price});use(id);save();toast(`✓ ${it.name} — yours.`);updateStats();}
 function onClick(e){const b=e.target.closest('button,[data-preview]');if(!b)return;const ds=b.dataset;
  if(ds.close){dlg().close();return;}if(ds.theme){toggleTheme();return;}if(ds.tab){tab=ds.tab;confirmId=null;preview=null;render();return;}
  if(ds.hobby){sn().hobby=ds.hobby;save(false);apply();render();return;}
  if(ds.look){const v=['skin','hairCol','coverCol'].includes(ds.look)?+ds.val:ds.val;stats.avatar[ds.look]=v;save(false);sig='';tick();render();return;}
  if(ds.ask){confirmId=ds.ask;preview=ds.ask;render();return;}if(ds.buy){buy(ds.buy);confirmId=null;preview=null;sig='';apply();tick();render();return;}
  if(ds.use){use(ds.use);preview=null;sig='';apply();tick();render();return;}if(ds.off){takeOff(ds.off);sig='';apply();tick();render();return;}
  if(ds.sound){sn().sounds=!sn().sounds;save(false);Sounds.set(sn().sounds);render();return;}
  if(ds.preview&&b.tagName!=='BUTTON'){preview=preview===ds.preview?null:ds.preview;render();}}
 // ---------- focus sounds: soft rain made on the device (no files, no network) ----------
 const Sounds=(()=>{let ctx=null,node=null;function set(v){try{if(!v){if(node){node.disconnect();node=null;}return;}ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(node)return;
   const len=2*ctx.sampleRate,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=last*3.5;}
   const src=ctx.createBufferSource();src.buffer=buf;src.loop=true;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const gn=ctx.createGain();gn.gain.value=0.25;src.connect(f).connect(gn).connect(ctx.destination);src.start();node=gn;}catch(e){}}return{set};})();
 // ---------- start ----------
 function init(){themeBtn();labelTheme();apply();tick();setInterval(()=>{apply();tick();labelTheme();},800);
  document.addEventListener('pointerdown',()=>{if(on()&&sn().sounds&&snOwns(stats,'sn_sounds'))Sounds.set(true);},{once:true});}
 window.addEventListener('load',()=>setTimeout(init,50));
 return {open,apply,on,render};
})();
