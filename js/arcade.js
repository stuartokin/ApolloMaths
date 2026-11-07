'use strict';
// PRESENTATION + INTERACTION: the hidden arcade shell — game picker, shared time limits, controls, scores.
// The games themselves are in js/games.js (all original). Admin play is unlimited and not counted.
let arcadeOpen=false;
const Arcade=(()=>{
 let latch={},cv,ctx,raf=0,view='menu',admin=false,cap=0,played=0,last=0,paused=false,keys={},pad={l:false,r:false,u:false,d:false,f:false},game=null,gameId='invaders',avImg=null,ac=null;
 const dlg=()=>get('arcade');
 const hsKey=()=>gameId==='invaders'?stats.arcade.theme:gameId;
 function beep(f,d=.08,type='square',vol=.04,slide=0){if(stats.arcade.mute)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),gn=ac.createGain();o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f*slide),ac.currentTime+d);gn.gain.value=vol;gn.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(gn).connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){}}
 const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
 // A quick tap (pressed and released between two frames) is remembered until the game has seen it.
 const KEYMAP={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',ArrowUp:'u',w:'u',W:'u',ArrowDown:'d',s:'d',S:'d',' ':'f',Enter:'f'};
 const inp=()=>({l:!!(keys.ArrowLeft||keys.a||keys.A||pad.l||latch.l),r:!!(keys.ArrowRight||keys.d||keys.D||pad.r||latch.r),u:!!(keys.ArrowUp||keys.w||keys.W||pad.u||latch.u),d:!!(keys.ArrowDown||keys.s||keys.S||pad.d||latch.d),f:!!(keys[' ']||keys.Enter||pad.f||latch.f)});
 function hud(){get('arcHud').innerHTML=`<span>Score <b>${game.score.toLocaleString('en-GB')}</b></span><span>${game.levelName} <b>${game.level}</b></span><span>${'❤️'.repeat(Math.max(0,Math.min(6,game.lives)))||'💔'}</span><span class="${!admin&&cap-played<60?'arc-low':''}">⏱️ <b>${admin?'∞':fmt(cap-played)}</b></span>`;}
 function loop(t){if(view!=='game'){raf=0;return;}const dt=Math.min(.05,(t-(last||t))/1000);last=t;
  if(!paused&&document.visibilityState==='visible'){played+=dt;game.update(dt,inp());latch={};if(game.over){finish('gameover');return;}if(!admin&&played>=cap){finish('time');return;}}
  ctx.save();ctx.scale(cv.width/game.W,cv.height/game.H);game.render(ctx);
  if(paused){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,game.W,game.H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 34px monospace';ctx.fillText('PAUSED',game.W/2,game.H/2);ctx.font='14px monospace';ctx.fillText('Tap ▶ Play or press P',game.W/2,game.H/2+30);}
  ctx.restore();hud();raf=requestAnimationFrame(loop);}
 function card(html){get('arcBody').innerHTML=html;}
 function locked(st){const r=st.reqs.map(q=>`<li class="${q.done?'ok':''}">${q.done?'✅':'⬜'} ${q.label} <small>(${q.unit==='min'?`${Math.min(q.have,q.need)} of ${q.need} min`:`${Math.min(q.have,q.need)}/${q.need}`})</small></li>`).join('');
  const why=st.blocks.length?st.blocks.map(b=>`<p>🔒 ${b}</p>`).join(''):!st.reqsDone?'<p>🔒 Unlock the arcade by doing some maths first:</p>':st.breakLeft?`<p>⏸️ Time for a break! The arcade opens again in <b>${fmt(st.breakLeft)}</b>.</p>`:st.available<30?(st.earned!==null&&st.earned-st.usedDay<st.dayLeft&&st.earned-st.usedDay<st.weekLeft?`<p>⚡ You’ve used the play time you’ve earned. Every ${stats.arcade.settings.earnPer} minutes of maths earns 1 more minute!</p>`:`<p>🏁 That’s all the arcade time for ${st.weekLeft<=st.dayLeft?'this week':'today'}. Well played!</p>`):'';
  card(`<div class="arc-card"><div class="arc-big">🕹️</div><h3>The Secret Arcade</h3>${why}${!st.reqsDone&&!st.blocks.length?`<ul class="arc-reqs">${r}</ul>`:''}<p class="mini">Shhh… keep the secret code to yourself! 🤫</p><button class="primary" data-arc="close" type="button">Back to maths</button></div>`);}
 function menu(st){gameId=stats.arcade.game||'invaders';const H=stats.arcade.high,t=stats.arcade.theme;
  card(`<div class="arc-card"><h3>${admin?'🕹️ Arcade (admin — no limits)':'🕹️ You unlocked the Secret Arcade!'}</h3>
   ${admin?'':`<p>You can play for <b>${fmt(st.sessionSecs)}</b> now. Left today: <b>${fmt(st.dayLeft)}</b> · this week: <b>${fmt(st.weekLeft)}</b>${st.earned!==null?` · earned so far today: <b>${fmt(Math.max(0,st.earned-st.usedDay))}</b>`:''}.</p>`}
   <div class="arc-games">${GAME_LIST.map(g=>`<button class="arc-gm${g.id===gameId?' on':''}" data-game="${g.id}" type="button"><span>${g.icon}</span><b>${g.name}</b><small>${g.desc}</small><em>🏆 ${(g.id==='invaders'?Math.max(H.player,H.classic):H[g.id]||0).toLocaleString('en-GB')}</em></button>`).join('')}</div>
   ${gameId==='invaders'?`<div class="arc-themes"><button class="arc-theme${t==='player'?' on':''}" data-theme="player" type="button"><span>🧍⚽</span><b>My player</b></button><button class="arc-theme classic${t==='classic'?' on':''}" data-theme="classic" type="button"><span>👾</span><b>Classic</b></button></div>`:''}
   <div class="actions" style="justify-content:center"><button class="primary" data-arc="start" type="button">▶️ Play ${GAME_LIST.find(g=>g.id===gameId).name}</button><button class="ghost" data-arc="mute" type="button">${stats.arcade.mute?'🔇 Sound off':'🔊 Sound on'}</button><button class="ghost" data-arc="full" type="button" id="arcFullBtn">${dlg().classList.contains('arc-full')?'🗗 Exit full screen':'⛶ Full screen'}</button><button class="ghost" data-arc="close" type="button">Back to maths</button></div>
   <p class="mini">Keys: arrows (or WASD) to move, Space to fire, P to pause. Tablets: use the buttons under the game${gameId==='maze'?' or swipe on the maze':gameId==='snake'?' or swipe on the game':''}.</p></div>`);}
 const LABEL={invaders:{l:'◀',r:'▶',f:'⚽ KICK'},maze:{l:'◀',r:'▶',u:'▲',d:'▼'},meteor:{l:'⟲',r:'⟳',u:'▲ Thrust',f:'● Fire'},guardian:{u:'▲',d:'▼',l:'◀',r:'▶',f:'🔥 Fire'},ladder:{l:'◀',r:'▶',u:'▲ Climb',d:'▼',f:'⤴ Jump'},racer:{l:'◀',r:'▶',u:'▲ Go',d:'▼ Brake',f:'🔥 Nitro'},snake:{l:'◀',r:'▶',u:'▲',d:'▼'}};
 function start(){const st=arcadeStatus(stats);if(!admin&&!st.canPlay){locked(st);return;}cap=admin?Infinity:st.sessionSecs;played=0;paused=false;keys={};Object.keys(pad).forEach(k=>pad[k]=false);
  if(['invaders','ladder'].includes(gameId)){avImg=new Image();avImg.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(drawAvatar(stats.avatar,{scene:false}));}
  game=GAMES[gameId]({theme:stats.arcade.theme,avatar:avImg,beep});view='game';
  const lab=Object.assign({},LABEL[gameId]);if(gameId==='invaders'&&stats.arcade.theme==='classic')lab.f='FIRE';
  card(`<div class="arc-game"><div class="arc-hud" id="arcHud"></div><canvas id="arcCanvas" aria-label="Arcade game" style="aspect-ratio:${game.W}/${game.H}"></canvas>
   <div class="arc-pad">${PADS[gameId].map(grp=>`<div class="arc-grp">${grp.map(k=>`<button data-pad="${k}" type="button" class="pad-${k}">${lab[k]}</button>`).join('')}</div>`).join('')}</div>
   <div class="arc-ctl"><button class="ghost" data-arc="pause" type="button">⏸️ Pause</button><button class="ghost" data-arc="full" type="button" id="arcFullBtn">${dlg().classList.contains('arc-full')?'🗗 Exit full screen':'⛶ Full screen'}</button><button class="ghost" data-arc="quit" type="button">🏁 Stop</button></div></div>`);
  cv=get('arcCanvas');ctx=cv.getContext('2d');fit();
  const padEl=get('arcBody').querySelector('.arc-pad');padEl.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-pad]');if(b){pad[b.dataset.pad]=true;latch[b.dataset.pad]=true;b.setPointerCapture(e.pointerId);e.preventDefault();}});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>padEl.addEventListener(ev,e=>{const b=e.target.closest('[data-pad]');if(b)pad[b.dataset.pad]=false;}));
  let sw=null;cv.addEventListener('pointerdown',e=>{sw=[e.clientX,e.clientY];const r=cv.getBoundingClientRect();if(game.pointer){game.pointer((e.clientX-r.left)/r.width);pad.f=true;setTimeout(()=>pad.f=false,120);}});
  cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();if(e.buttons&&game.pointer)game.pointer((e.clientX-r.left)/r.width);if(sw&&game.swipe){const dx=e.clientX-sw[0],dy=e.clientY-sw[1];if(Math.hypot(dx,dy)>24){game.swipe(dx,dy);sw=[e.clientX,e.clientY];}}});
  cv.addEventListener('pointerup',()=>sw=null);
  last=0;if(!raf)raf=requestAnimationFrame(loop);}
 // ---- size the game: normal (CSS limits) or full screen (largest size that fits) ----
 function fit(){if(!cv||!game)return;const dpr=Math.min(2,window.devicePixelRatio||1),d=dlg();
  if(d.classList.contains('arc-full')){const land=window.matchMedia('(orientation:landscape) and (max-height:520px)').matches,padEl=d.querySelector('.arc-pad'),padOn=padEl&&getComputedStyle(padEl).display!=='none';
   const availW=innerWidth-(land&&padOn?250:24),availH=innerHeight-(land?96:(padOn?170:110)),k=Math.max(.2,Math.min(availW/game.W,availH/game.H));
   cv.style.width=Math.floor(game.W*k)+'px';cv.style.height=Math.floor(game.H*k)+'px';cv.style.maxHeight='none';cv.style.maxWidth='none';cv.width=Math.round(game.W*k*dpr);cv.height=Math.round(game.H*k*dpr);}
  else{cv.style.width='';cv.style.height='';cv.style.maxHeight='';cv.style.maxWidth='';cv.width=game.W*dpr;cv.height=game.H*dpr;}}
 function setFull(on){const d=dlg();d.classList.toggle('arc-full',on);const fsEl=document.fullscreenElement||document.webkitFullscreenElement;
  try{if(on&&!fsEl){const r=d.requestFullscreen||d.webkitRequestFullscreen;if(r){const p=r.call(d);if(p&&p.catch)p.catch(()=>{});}}
   else if(!on&&fsEl){const x=document.exitFullscreen||document.webkitExitFullscreen;if(x){const p=x.call(document);if(p&&p.catch)p.catch(()=>{});}}}catch(e){}
  const b=get('arcFullBtn');if(b)b.textContent=on?'🗗 Exit full screen':'⛶ Full screen';setTimeout(fit,60);setTimeout(fit,400);}
 function finish(why){if(view!=='game')return;view='over';cancelAnimationFrame(raf);raf=0;const key=hsKey(),best=game.score>(stats.arcade.high[key]||0);
  if(best)stats.arcade.high[key]=game.score;
  if(!admin){const k=dayKey(),secs=Math.round(played);stats.arcade.used[k]=(stats.arcade.used[k]||0)+secs;stats.arcade.lastEnd=Date.now();stats.arcade.plays.push({t:Date.now(),secs,score:game.score,game:gameId,theme:stats.arcade.theme,wave:game.level,end:why});if(stats.arcade.plays.length>200)stats.arcade.plays.shift();}
  save();const st=arcadeStatus(stats),nm=GAME_LIST.find(g=>g.id===gameId).name;
  card(`<div class="arc-card"><div class="arc-big">${why==='time'?'⏱️':why==='gameover'?'💥':'🏁'}</div><h3>${why==='time'?'Full time!':why==='gameover'?'Game over!':'Game stopped'}</h3><p>${nm}: <b class="arc-score">${game.score.toLocaleString('en-GB')}</b> points · ${game.levelName} ${game.level}${best?'<br>🏆 <b>New high score!</b>':''}</p>
   ${admin?'':`<p class="mini">Arcade time left today: <b>${fmt(st.dayLeft)}</b>${st.earned!==null?` (earned: ${fmt(Math.max(0,st.earned-st.usedDay))})`:''}${st.breakLeft?` · next game after a <b>${Math.ceil(st.breakLeft/60)}-minute</b> break`:''}.</p><p>🧠 Back to the maths — every question earns more arcade time!</p>`}
   <div class="actions" style="justify-content:center">${admin||st.canPlay?'<button class="secondary" data-arc="again" type="button">🔄 Play again</button><button class="ghost" data-arc="menu" type="button">🎮 Other games</button>':''}<button class="primary" data-arc="close" type="button">Back to maths</button></div></div>`);}
 function open(opts={}){admin=!!opts.admin;if(!admin&&!(window.APP_CONFIG&&window.APP_CONFIG.arcade))return false;arcadeOpen=true;view='menu';
  const d=dlg();if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');
  if(admin)menu(null);else{const st=arcadeStatus(stats);st.canPlay?menu(st):locked(st);}return true;}
 function close(){if(dlg().classList.contains('arc-full'))setFull(false);if(view==='game')finish('stopped');view='menu';arcadeOpen=false;const d=dlg();if(d.close)d.close();else d.removeAttribute('open');}
 function onClick(e){const b=e.target.closest('button');if(!b||!dlg().contains(b))return;const a=b.dataset.arc;
  if(b.dataset.game){stats.arcade.game=b.dataset.game;save(false);menu(admin?null:arcadeStatus(stats));return;}
  if(b.dataset.theme){stats.arcade.theme=b.dataset.theme;save(false);menu(admin?null:arcadeStatus(stats));return;}
  if(a==='start'||a==='again')start();else if(a==='menu'){view='menu';menu(admin?null:arcadeStatus(stats));}else if(a==='close'||b.dataset.close!==undefined)close();else if(a==='quit')finish('stopped');
  else if(a==='full'){setFull(!dlg().classList.contains('arc-full'));}
  else if(a==='pause'){paused=!paused;b.textContent=paused?'▶️ Play':'⏸️ Pause';}else if(a==='mute'){stats.arcade.mute=!stats.arcade.mute;save(false);menu(admin?null:arcadeStatus(stats));}}
 function init(){const d=dlg();d.addEventListener('click',onClick);d.addEventListener('close',()=>{if(view==='game')finish('stopped');arcadeOpen=false;});
  d.addEventListener('cancel',e=>{if(view==='game'){e.preventDefault();paused=true;}});
  window.addEventListener('keydown',e=>{if(!arcadeOpen||view!=='game')return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key==='p'||e.key==='P'){paused=!paused;return;}keys[e.key]=true;if(KEYMAP[e.key])latch[KEYMAP[e.key]]=true;});
  window.addEventListener('keyup',e=>{keys[e.key]=false;});window.addEventListener('resize',()=>{if(view==='game')fit();});
  ['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{if(!(document.fullscreenElement||document.webkitFullscreenElement)&&dlg().classList.contains('arc-full')){dlg().classList.remove('arc-full');const b=get('arcFullBtn');if(b)b.textContent='⛶ Full screen';}setTimeout(fit,60);}));
  dlg().addEventListener('close',()=>{dlg().classList.remove('arc-full');});document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'&&view==='game')paused=true;});}
 return{init,open,close,status:()=>({view,played,cap,admin,game:gameId,score:game&&game.score,full:dlg().classList.contains('arc-full')}),_game:()=>game};
})();
