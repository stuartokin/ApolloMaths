'use strict';
// PRESENTATION + INTERACTION: Apollo's player card, the Locker Room (look editor, Kit Shop, My stuff, Skill unlocks)
// and the goal celebrations. Rules and prices live in js/data/shop.js; drawing lives in js/render/avatar.js.
const Locker=(()=>{
 let tab='shop',cat='foryou',preview=null,confirmId=null,welcome=false,newsI=0;
 const dlg=()=>get('locker');
 const reduceMotion=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const tierBadge=it=>{const[t,l]=tierOf(it);return `<span class="tier ${t}">${l}</span>`;};
 const who=()=>playerName();
 const price=it=>priceFor(stats,it,who());
 const isNew=it=>it.nw&&stats.newSince&&Date.now()-stats.newSince<7*86400000&&!owns(stats,it.id);
 const frameCls=eq=>{const f=eq&&eq.frame&&itemById[eq.frame];return f?' frame-'+f.frame:'';};
 const celebOf=id=>{const it=itemById[id];return CELEB[id]||(it&&it.celeb?[it.celeb.anim,it.celeb.msg,it.celeb.parts]:CELEB.fistpump);};
 function cardHTML(it,own){return `<div class="lcard${own?'':' locked'}"><div class="lc-icon">${it.icon}</div><b>${esc(it.name)}</b><small>${esc(it.era)}</small>${own?`<p>${fracHTML(it.desc)}</p><div class="lc-puzzle">🧩 <b>Try this:</b> ${fracHTML(it.puzzle)} <button class="linkbtn" data-reveal type="button">Show answer</button><span class="lc-ans hidden">${fracHTML(it.ans)}</span></div>`:`<p class="mini">Collect this Maths Legend card to read their true story and a puzzle.</p>`}</div>`;}
 function news(){const m=[],d=dealOfDay(stats,who()),g=nextGoal(stats),w=wallet(stats),can=shopItems.filter(i=>buyable(i)&&!owns(stats,i.id)&&price(i)<=w).length,cards=shopItems.filter(i=>i.cat==='cards'),got=cards.filter(i=>owns(stats,i.id)).length;
  if(d)m.push(`🔥 Deal of the day: ${d.item.icon} ${d.item.name} — ${d.price.toLocaleString('en-GB')} ⚡ (was ${d.item.price.toLocaleString('en-GB')})`);
  if(can)m.push(`🛍️ You can afford ${can} item${can>1?'s':''} right now!`);
  if(g&&g.need>0)m.push(`🎯 Just ${g.need.toLocaleString('en-GB')} ⚡ more for the ${g.item.icon} ${g.item.name}`);
  m.push(`🃏 Maths Legend cards: ${got}/${cards.length} collected`);
  if(stats.newSince&&Date.now()-stats.newSince<7*86400000)m.push(`🆕 ${shopItems.filter(i=>i.nw).length} new items in the Kit Shop this week!`);
  return m;}

 // ---------- player card + mission avatar ----------
 function refresh(){
  get('pcAvatar').innerHTML=drawAvatar(stats.avatar);get('pcAvatar').className='pc-avatar'+frameCls(stats.avatar.eq);const tt=stats.avatar.eq.title&&itemById[stats.avatar.eq.title];get('pcTitle').textContent=tt?'🏷️ '+tt.name:'';get('pcTitle').classList.toggle('hidden',!tt);
  const nm=news();get('shopNews').textContent=nm[newsI%nm.length]||'';
  get('missionAvatar').innerHTML=drawAvatar(stats.avatar,{scene:false});
  get('walletAmt').textContent=wallet(stats).toLocaleString('en-GB');
  const g=nextGoal(stats);
  get('goalBox').innerHTML=!g?'🏆 You own everything in the shop. Absolute legend!':g.need===0?`🛍️ You can afford the <b>${esc(g.item.name)}</b>! Open the Kit Shop.`:
   `<div class="goaltext">🎯 Next: ${g.item.icon} <b>${esc(g.item.name)}</b> — <b>${g.need.toLocaleString('en-GB')} ⚡</b> to go</div><div class="progressOuter slim"><div class="progressInner" style="width:${g.pct}%"></div></div>`;
  const d=stats.daily,today=dayKey(),n=d.day===today?d.correct:0,got=d.day===today&&d.bonus;
  get('dailyLine').textContent=got?'🎁 Daily bonus collected — come back tomorrow for another!':`🎁 Daily bonus: get ${REWARDS.dailyTarget} right today for +${REWARDS.dailyBonus} ⚡ (${Math.min(n,REWARDS.dailyTarget)}/${REWARDS.dailyTarget})`;
  if(dlg().open)render();}

 // ---------- Locker Room dialog ----------
 function open(t,isWelcome=false){tab=t;preview=null;confirmId=null;welcome=isWelcome;render();const d=dlg();if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');}
 function close(){const d=dlg();if(d.close)d.close();else d.removeAttribute('open');}
 function itemButton(it){const own=owns(stats,it.id),worn=stats.avatar.eq[it.slot]===it.id,w=wallet(stats);
  if(it.unlock&&!own){const p=unlockProgress(stats,it);return `<button class="ghost" disabled>🔒 ${p.have}/${p.need}</button>`;}
  if(own&&!it.slot)return `<button class="secondary" data-try="${it.id}" type="button">📖 Read card</button>`;
  if(own)return worn?`<button class="secondary wearing" data-off="${it.slot}">✓ Wearing${['scene','celebration'].includes(it.slot)&&it.free?'':' · take off'}</button>`:`<button class="secondary" data-wear="${it.id}">Wear it</button>`;
  const pr=price(it);if(w>=pr)return confirmId===it.id?`<button class="primary pulse" data-buy="${it.id}">Tap again to buy</button>`:`<button class="primary" data-ask="${it.id}">Buy · ${pr.toLocaleString('en-GB')} ⚡</button>`;
  return `<button class="ghost" disabled>Need ${(pr-w).toLocaleString('en-GB')} more ⚡</button><button class="linkbtn" data-wish="${it.id}">${stats.wish===it.id?'⭐ My goal':'☆ Make it my goal'}</button>`;}
 function card(it){const own=owns(stats,it.id);const p=it.unlock&&!own?unlockProgress(stats,it):null;
  return `<div class="item${preview&&preview.id===it.id?' previewing':''}${own?' owned':''}" data-try="${it.id}"><div class="ihead"><span class="iicon">${it.icon}</span>${tierBadge(it)}</div>${(()=>{const pr=price(it);return (pr<it.price?`<span class="badge deal">🔥 25% OFF today · <s>${it.price.toLocaleString('en-GB')}</s></span>`:'')+(isNew(it)?'<span class="badge new">🆕 NEW</span>':'');})()}<b>${esc(it.name)}</b><span class="mini">${esc(it.desc)}</span>${p?`<div class="progressOuter slim"><div class="progressInner" style="width:${Math.round(100*p.have/p.need)}%"></div></div>`:''}<div class="ibtns">${itemButton(it)}</div></div>`;}
 function lookTab(){const a=stats.avatar,o=avatarOptions;
  const sw=(key,list)=>list.map(([c,l],i)=>`<button class="swatch${a[key]===i?' on':''}" style="background:${c}" data-look="${key}" data-val="${i}" aria-label="${l}" title="${l}"></button>`).join('');
  const ch=(key,list)=>list.map(([v,l])=>`<button class="chip${a[key]===v?' active':''}" data-look="${key}" data-val="${v}">${l}</button>`).join('');
  return `${welcome?`<div class="note">👋 <b>Welcome, ${esc(playerName())}!</b> Design your player. Every right answer earns ⚡ power points to spend on kits, boots, sidekicks and experiences in the Kit Shop.</div>`:''}
  <div class="lookrow"><b>Name</b><div class="namerow"><input id="nameInput" maxlength="20" value="${esc(playerName())}" aria-label="Player name" autocomplete="off"><button class="secondary" data-savename="1" type="button">Save name</button></div></div><div class="lookrow"><b>Skin</b><div>${sw('skin',o.skins)}</div></div><div class="lookrow"><b>Hair style</b><div class="choices">${ch('hair',o.hair)}</div></div>
  <div class="lookrow"><b>Hair colour</b><div>${sw('hairCol',o.hairColours)}</div></div><div class="lookrow"><b>Eyes</b><div class="choices">${ch('eyes',o.eyes)}</div></div>
  <div class="lookrow"><b>Face</b><div class="choices">${ch('mouth',o.mouths)}</div></div><div class="lookrow"><b>Kit colour</b><div>${sw('kit',o.kits)}</div></div>
  <div class="lookrow"><b>Shirt number</b><div class="numpick"><button class="ghost" data-num="-1" aria-label="Lower number">−</button><span>${a.num}</span><button class="ghost" data-num="1" aria-label="Higher number">+</button></div></div>
  <button class="primary" data-done="1">✅ ${welcome?'Let’s play!':'Looking good — done'}</button>`;}
 function shopTab(){const w=wallet(stats),d=dealOfDay(stats,who());let list,head='';
  if(cat==='foryou'){list=forYou(stats);head=`${d?`<div class="dealbox">🔥 <b>Deal of the day</b> — ${d.item.icon} ${esc(d.item.name)}: <b>${d.price.toLocaleString('en-GB')} ⚡</b> instead of ${d.item.price.toLocaleString('en-GB')} (today only)</div>`:''}<p class="mini">Picked for you: things you can buy now or very soon with your <b>${w.toLocaleString('en-GB')} ⚡</b>.</p>`;if(d&&!list.includes(d.item))list.unshift(d.item);}
  else list=shopItems.filter(i=>i.cat===cat);
  return `<div class="choices cats">${shopCats.map(([k,l])=>`<button class="chip${cat===k?' active':''}" data-cat="${k}">${l}</button>`).join('')}</div>${head}${cat!=='foryou'?'<p class="mini">Tap an item to try it on. Fancier items cost more ⚡ — every right answer gets you closer.</p>':''}<div class="items">${list.map(card).join('')}</div>`;}
 function stuffTab(){const mine=shopItems.filter(i=>owns(stats,i.id)).sort((a,b)=>(a.cat==='cards')-(b.cat==='cards'));return `<p class="mini">Everything you own. Tap “Wear it” to put it on.</p><div class="items">${mine.map(card).join('')}</div>`;}
 function skillTab(){return `<p class="mini">These can’t be bought — only earned by mastering your Focus Zone topics. “Right first time” means no hints, no method, first try.</p><div class="items">${shopItems.filter(i=>i.unlock).map(card).join('')}</div>`;}
 function render(){const d=dlg(),pv=preview&&preview.slot?{[preview.slot]:preview.id}:{};
  d.querySelector('.lk-wallet').textContent=wallet(stats).toLocaleString('en-GB')+' ⚡ to spend';
  const pvAv={...stats.avatar,eq:{...stats.avatar.eq,...pv}};
  d.querySelector('.lk-avatar').innerHTML=preview&&preview.cat==='cards'?cardHTML(preview,owns(stats,preview.id)):`<div class="lk-av${frameCls(pvAv.eq)}">${drawAvatar(stats.avatar,{preview:pv})}</div>`+(pvAv.eq.title&&itemById[pvAv.eq.title]?`<p class="ptitle center">🏷️ ${esc(itemById[pvAv.eq.title].name)}</p>`:'')+(preview?`<p class="mini center">Trying on: <b>${esc(preview.name)}</b></p>`:'');
  d.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===tab);b.setAttribute('aria-selected',b.dataset.tab===tab)});
  d.querySelector('.lk-body').innerHTML=tab==='look'?lookTab():tab==='stuff'?stuffTab():tab==='skill'?skillTab():shopTab();}
 function wear(id){const it=itemById[id];if(it&&owns(stats,id)){stats.avatar.eq[it.slot]=id;save();}}
 function takeOff(slot){stats.avatar.eq[slot]=slot==='scene'?'park':slot==='celebration'?'fistpump':null;save();}
 function buy(id){const it=itemById[id],pr=it&&price(it);if(!it||it.unlock||it.free||owns(stats,id)||wallet(stats)<pr)return;
  stats.spent+=pr;stats.owned.push(id);stats.purchases.push({t:Date.now(),id,price:pr});if(it.slot)stats.avatar.eq[it.slot]=id;if(stats.wish===id)stats.wish=null;
  addMedal('🛍️ First buy');save();toast({title:`🏷️ New title: “${it.name}”! It’s shown under your name.`,frame:`🖼️ New ${it.name} on your player card!`,celebration:`🎉 New celebration: ${it.name} — get a question right to see it!`,scene:`🏟️ New experience: ${it.name}!`}[it.slot]||(it.slot?`🎉 You bought ${/^The /.test(it.name)?'':'the '}${it.name}! It’s on your player now.`:`🃏 New Maths Legend card: ${it.name}! Read their story.`));preview=it.slot?null:it;confirmId=null;refresh();updateStats();
  const av=dlg().querySelector('.lk-avatar svg');if(av&&!reduceMotion()){av.classList.add('cel-jump');setTimeout(()=>av.classList.remove('cel-jump'),900);}}
 function onClick(e){const b=e.target.closest('button,[data-try]');if(!b||!dlg().contains(b))return;const ds=b.dataset;
  if(ds.close!==undefined){close();return;}
  if(ds.tab){tab=ds.tab;preview=null;confirmId=null;render();return;}
  if(ds.cat){cat=ds.cat;preview=null;confirmId=null;render();return;}
  if(ds.look){const v=['skin','hairCol','kit'].includes(ds.look)?+ds.val:ds.val;stats.avatar[ds.look]=v;save();refresh();render();return;}
  if(ds.num){stats.avatar.num=((stats.avatar.num-1+ +ds.num+99)%99)+1;save();refresh();render();return;}
  if(ds.savename){try{Storage.renameProfile(Storage.current().id,get('nameInput').value);applyName();Players.drawLeaderboard();toast(`✅ Name saved: ${playerName()}`);render();}catch(x){toast('❌ '+x.message);}return;}
  if(ds.done){stats.avatar.created=true;save();close();return;}
  if(ds.ask){confirmId=ds.ask;preview=itemById[ds.ask];render();return;}
  if(ds.buy){buy(ds.buy);return;}
  if(ds.wear){wear(ds.wear);preview=null;refresh();return;}
  if(ds.off){takeOff(ds.off);refresh();return;}
  if(ds.wish){stats.wish=stats.wish===ds.wish?null:ds.wish;save();refresh();if(stats.wish)toast(`⭐ New goal: ${itemById[ds.wish].name}. Keep answering to earn it!`);return;}
  if(ds.reveal!==undefined){const a=b.parentElement.querySelector('.lc-ans');if(a){a.classList.remove('hidden');b.remove();}return;}
  if(ds.try){const it=itemById[ds.try];preview=it.slot&&owns(stats,it.id)&&stats.avatar.eq[it.slot]===it.id?null:it;if(confirmId!==it.id)confirmId=null;render();}}

 // ---------- unlocks, celebrations, nudges ----------
 function checkUnlocks(){for(const it of shopItems){if(!it.unlock||owns(stats,it.id))continue;const p=unlockProgress(stats,it);
  if(p.have>=p.need){stats.owned.push(it.id);setTimeout(()=>toast(`🏅 SKILL UNLOCK: ${it.name}! Find it in your Locker Room.`),1200);}}}
 const CELEB={fistpump:['cel-jump','Fist pump! ✊',['⭐','✨']],kneeslide:['cel-slide','Knee slide! 🙌',['💨','⭐','✨']],confetti:['cel-jump','Confetti cannon! 🎉',['🎉','🎊','✨','🟨','🟥','🟦']],backflip:['cel-flip','Backflip! 🤸',['⭐','💫','✨']],rocket:['cel-rocket','Rocket launch! 🚀',['🚀','🔥','✨','⭐']]};
 const celebrationText=()=>celebOf(stats.avatar.eq.celebration)[1];
 function celebrate(){const[cls,,parts]=celebOf(stats.avatar.eq.celebration),m=get('missionAvatar');
  if(reduceMotion())return;m.classList.remove('cel-jump','cel-slide','cel-flip','cel-rocket','cel-spin','cel-wiggle');void m.offsetWidth;m.classList.add(cls);setTimeout(()=>m.classList.remove(cls),1300);
  const r=m.getBoundingClientRect(),burst=get('burst'),n=['confetti','cel_fireworks','cel_coins'].includes(stats.avatar.eq.celebration)?26:12;
  for(let i=0;i<n;i++){const s=document.createElement('span');s.textContent=pick(parts);s.style.left=(r.left+r.width/2)+'px';s.style.top=(r.top+r.height/2)+'px';
   s.style.setProperty('--dx',(Math.random()*240-120)+'px');s.style.setProperty('--dy',(-60-Math.random()*170)+'px');s.style.animationDelay=(Math.random()*.15)+'s';burst.appendChild(s);setTimeout(()=>s.remove(),1500);}}
 function nudge(){const el=get('nudge'),g=nextGoal(stats);if(!g){el.classList.add('hidden');return;}
  el.innerHTML=g.need===0?`🛍️ You can afford the ${g.item.icon} <b>${esc(g.item.name)}</b>! <button class="linkbtn" data-openshop="1">Open the Kit Shop</button>`:`🎯 <b>${g.need.toLocaleString('en-GB')} ⚡</b> to go until the ${g.item.icon} ${esc(g.item.name)} — keep going!`;el.classList.remove('hidden');}
 // Tell the player when something new becomes affordable (one message, not a flood).
 function announce(){const w=wallet(stats),fresh=shopItems.filter(i=>buyable(i)&&!owns(stats,i.id)&&price(i)<=w&&!stats.announced.includes(i.id));if(!fresh.length)return;
  const best=fresh.sort((a,b)=>b.price-a.price)[0];stats.announced.push(...fresh.map(i=>i.id));if(stats.announced.length>500)stats.announced.splice(0,stats.announced.length-500);
  toast(`🔔 You can now afford the ${best.icon} ${best.name}${fresh.length>1?` (and ${fresh.length-1} more)`:''}! Open the Kit Shop.`);}
 function onCorrect(){celebrate();nudge();announce();refresh();}
 function init(){dlg().addEventListener('click',onClick);dlg().addEventListener('close',()=>{if(!stats.avatar.created){stats.avatar.created=true;save();}preview=null;});
  dlg().addEventListener('click',e=>{if(e.target===dlg())close();});
  get('openShop').addEventListener('click',()=>open('shop'));get('openLook').addEventListener('click',()=>open('look'));
  get('nudge').addEventListener('click',e=>{if(e.target.closest('[data-openshop]'))open('shop');});
  get('missionAvatar').addEventListener('click',()=>open('look'));
  get('shopNews').addEventListener('click',()=>open('shop'));
  setInterval(()=>{newsI++;const nm=news();get('shopNews').textContent=nm[newsI%nm.length]||'';},6000);
  // first visit after the shop update: announce the new items; once a day: announce the deal (gently, once)
  if(stats.shopVer<SHOP_VERSION&&Storage.current()){stats.shopVer=SHOP_VERSION;stats.newSince=Date.now();stats.announced=shopItems.filter(i=>buyable(i)&&price(i)<=wallet(stats)).map(i=>i.id);save(false);setTimeout(()=>toast(`🆕 ${shopItems.filter(i=>i.nw).length} new items have arrived in the Kit Shop — kits, pets, experiences, titles and Maths Legend cards!`),1500);}
  if(stats.dealSeen!==dayKey()&&Storage.current()){const d=dealOfDay(stats,who());stats.dealSeen=dayKey();save(false);if(d)setTimeout(()=>toast(`🔥 Today’s deal: ${d.item.icon} ${d.item.name} for ${d.price.toLocaleString('en-GB')} ⚡ (25% off)`),3000);}
  refresh();setTimeout(()=>{if(!stats.avatar.created&&Storage.current()&&!get('players').open)open('look',true);},450);}
 return{init,refresh,open,checkUnlocks,celebrationText,onCorrect,announce};
})();
