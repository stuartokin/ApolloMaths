'use strict';
// PRESENTATION + INTERACTION: the hidden arcade — an original invaders-style game (not a copy of any commercial game).
// Two looks: "My player" (Apollo's avatar kicking footballs at emoji invaders) and "Classic" (retro green-on-black pixel art).
// Play time is limited by the rules in js/data/arcade-rules.js. Admin play is unlimited and not counted.
let arcadeOpen=false;
const Arcade=(()=>{
 const W=480,H=600;
 let cv,ctx,raf=0,view='menu',admin=false,cap=0,played=0,last=0,paused=false,keys={},pad={l:false,r:false,f:false},g=null,avImg=null,ac=null,endWhy='';
 const dlg=()=>get('arcade');
 // ---- original pixel art (11×8), two frames each ----
 const SPR={
  a:[["....XXX....","..XXXXXXX..",".XX.XXX.XX.","XXXXXXXXXXX","X.XXXXXXX.X","X.X.....X.X","...XX.XX...","..........."],["....XXX....","..XXXXXXX..",".XX.XXX.XX.","XXXXXXXXXXX","..XXXXXXX..",".X.X...X.X.","X.........X","..........."]],
  b:[["...X...X...","....X.X....","..XXXXXXX..",".XX.XXX.XX.","XXXXXXXXXXX","X.X.X.X.X.X","..X.....X..","..........."],["...X...X...","X...X.X...X","X.XXXXXXX.X","XXX.XXX.XXX","XXXXXXXXXXX",".X.X.X.X.X.","X.........X","..........."]],
  c:[["..XXXXXXX..",".XXXXXXXXX.","XX..XXX..XX","XXXXXXXXXXX",".XXX...XXX.","..X.XXX.X..",".X.......X.","..........."],["..XXXXXXX..",".XXXXXXXXX.","XX..XXX..XX","XXXXXXXXXXX",".XXX...XXX.","X..X...X..X","..X.....X..","..........."]],
  ship:["....XXXXX....","..XXXXXXXXX..",".XX.XX.XX.XX.","XXXXXXXXXXXXX","..XX..X..XX..","...X.....X..."],
  cannon:["......X......",".....XXX.....",".....XXX.....",".XXXXXXXXXXX.","XXXXXXXXXXXXX","XXXXXXXXXXXXX"]
 };
 const ROWS=['a','b','b','c','c'],PTS=[30,20,20,10,10],EMO=['👾','🤖','🤖','👽','👽'];
 const px=(spr,x,y,s,col)=>{ctx.fillStyle=col;spr.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='X')ctx.fillRect(Math.round(x+i*s),Math.round(y+j*s),Math.ceil(s),Math.ceil(s));});};
 // ---- sound (tiny Web Audio beeps, can be muted) ----
 function beep(f,d=.08,type='square',vol=.04,slide=0){if(stats.arcade.mute)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),gn=ac.createGain();o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f*slide),ac.currentTime+d);gn.gain.value=vol;gn.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(gn).connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){}}
 // ---- game state ----
 function bunkers(){const out=[];for(let i=0;i<4;i++){const bx=45+i*112,by=470;for(let y=0;y<8;y++)for(let x=0;x<14;x++){if(y<2&&(x<2||x>11))continue;if(y>4&&x>3&&x<10)continue;out.push({x:bx+x*4.5,y:by+y*4.5,a:true});}}return out;}
 function newGame(){g={score:0,lives:3,wave:1,p:{x:W/2,inv:0},pb:null,eb:[],inv:[],dir:1,stepT:0,frame:0,ufo:null,ufoT:R(14,24),bk:bunkers(),boom:[],stars:Array.from({length:60},()=>[R(0,W),R(0,H),Math.random()]),over:false};wave();}
 function wave(){g.inv=[];const oy=78+Math.min(6,g.wave-1)*10;for(let r=0;r<5;r++)for(let c=0;c<9;c++)g.inv.push({x:62+c*40,y:oy+r*34,r,alive:true});g.dir=1;g.stepT=0;g.pb=null;g.eb=[];}
 function hitBunker(x,y,r){let hit=false;for(const b of g.bk)if(b.a&&Math.abs(b.x+2-x)<r&&Math.abs(b.y+2-y)<r){b.a=false;hit=true;}return hit;}
 function update(dt){const p=g.p;const left=keys.ArrowLeft||keys.a||keys.A||pad.l,right=keys.ArrowRight||keys.d||keys.D||pad.r,fire=keys[' ']||keys.ArrowUp||pad.f;
  p.x=Math.max(22,Math.min(W-22,p.x+(right-left)*230*dt));if(p.inv>0)p.inv-=dt;
  if(fire&&!g.pb){g.pb={x:p.x,y:H-72};beep(880,.07,'square',.03,.4);}
  if(g.pb){g.pb.y-=470*dt;const b=g.pb;if(b.y<30)g.pb=null;else if(hitBunker(b.x,b.y,6))g.pb=null;
   else{for(const v of g.inv)if(v.alive&&Math.abs(v.x-b.x)<15&&Math.abs(v.y-b.y)<13){v.alive=false;g.score+=PTS[v.r];g.boom.push({x:v.x,y:v.y,t:.3});g.pb=null;beep(160,.12,'sawtooth',.04,.3);break;}
    if(g.pb&&g.ufo&&Math.abs(g.ufo.x-b.x)<22&&Math.abs(48-b.y)<12){const pts=pick([50,100,150,300]);g.score+=pts;g.boom.push({x:g.ufo.x,y:48,t:.6,pts});g.ufo=null;g.pb=null;beep(1200,.25,'triangle',.05,.5);}}}
  const alive=g.inv.filter(v=>v.alive),n=alive.length;
  if(!n){g.wave++;g.score+=100;beep(660,.3,'triangle',.05,2);wave();return;}
  const interval=Math.max(.05,(0.62-(g.wave-1)*.05)*(0.15+0.85*n/45));g.stepT+=dt;
  if(g.stepT>=interval){g.stepT=0;g.frame^=1;const edge=alive.some(v=>v.x+g.dir*9>W-18||v.x+g.dir*9<18);
   if(edge){g.dir*=-1;alive.forEach(v=>v.y+=16);}else alive.forEach(v=>v.x+=g.dir*9);beep(g.frame?110:90,.05,'square',.025);
   for(const v of alive)hitBunker(v.x,v.y+10,14);}
  if(alive.some(v=>v.y>H-105)){g.lives=0;}
  const maxEB=2+Math.min(4,g.wave);if(g.eb.length<maxEB&&Math.random()<dt*(0.8+g.wave*0.2)){const cols={};for(const v of alive)if(!cols[v.x]||cols[v.x].y<v.y)cols[v.x]=v;const s=pick(Object.values(cols));g.eb.push({x:s.x,y:s.y+12,vy:170+g.wave*14});}
  for(const b of g.eb)b.y+=b.vy*dt;
  g.eb=g.eb.filter(b=>{if(b.y>H)return false;if(hitBunker(b.x,b.y,6))return false;
   if(p.inv<=0&&Math.abs(b.x-p.x)<20&&b.y>H-64&&b.y<H-30){g.lives--;p.inv=1.6;g.boom.push({x:p.x,y:H-48,t:.5});beep(70,.4,'sawtooth',.06,.5);return false;}return true;});
  if(g.pb&&g.eb.length)g.eb=g.eb.filter(b=>{if(g.pb&&Math.abs(b.x-g.pb.x)<6&&Math.abs(b.y-g.pb.y)<10){g.pb=null;return false;}return true;});
  g.ufoT-=dt;if(!g.ufo&&g.ufoT<=0){const fromL=Math.random()<.5;g.ufo={x:fromL?-30:W+30,v:fromL?95:-95};}
  if(g.ufo){g.ufo.x+=g.ufo.v*dt;if(g.ufo.x<-40||g.ufo.x>W+40){g.ufo=null;g.ufoT=R(16,28);}}
  g.boom.forEach(b=>b.t-=dt);g.boom=g.boom.filter(b=>b.t>0);
  if(g.lives<=0)finish('gameover');}
 function render(){const cl=stats.arcade.theme==='classic';ctx.save();ctx.scale(cv.width/W,cv.height/H);
  ctx.fillStyle=cl?'#000':'#0b1236';ctx.fillRect(0,0,W,H);
  if(!cl){for(const[x,y,b]of g.stars){ctx.fillStyle=`rgba(255,255,255,${.3+b*.7})`;ctx.fillRect(x,y,b>.8?2:1,b>.8?2:1);}ctx.fillStyle='#2f9a4a';ctx.fillRect(0,H-22,W,22);}
  else{ctx.fillStyle='#3cff6a';ctx.fillRect(0,H-20,W,2);}
  // invaders
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const v of g.inv)if(v.alive){if(cl)px(SPR[ROWS[v.r]][g.frame],v.x-13,v.y-10,2.4,v.r===0?'#ff5ad8':v.r<3?'#64d9f5':'#fff');else{ctx.font='26px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillText(EMO[v.r],v.x,v.y+(g.frame?1:-1));}}
  // bunkers
  ctx.fillStyle=cl?'#3cff6a':'#64d9f5';for(const b of g.bk)if(b.a)ctx.fillRect(b.x,b.y,4.6,4.6);
  // ufo
  if(g.ufo){if(cl)px(SPR.ship,g.ufo.x-16,40,2.5,'#ff3b3b');else{ctx.font='28px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillText('🛸',g.ufo.x,48);}}
  // player
  const p=g.p,blink=p.inv>0&&Math.floor(p.inv*10)%2===0;
  if(!blink){if(cl)px(SPR.cannon,p.x-16,H-58,2.5,'#3cff6a');else if(avImg&&avImg.complete)ctx.drawImage(avImg,p.x-24,H-82,48,60);else{ctx.font='32px sans-serif';ctx.fillText('🧍',p.x,H-50);}}
  // bullets
  if(g.pb){if(cl){ctx.fillStyle='#fff';ctx.fillRect(g.pb.x-1,g.pb.y-8,3,12);}else{ctx.font='16px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillText('⚽',g.pb.x,g.pb.y);}}
  ctx.strokeStyle=cl?'#fff':'#ff5a5a';ctx.lineWidth=2.5;for(const b of g.eb){ctx.beginPath();ctx.moveTo(b.x,b.y-10);ctx.lineTo(b.x+3,b.y-5);ctx.lineTo(b.x-3,b.y);ctx.lineTo(b.x,b.y+4);ctx.stroke();}
  for(const b of g.boom){ctx.globalAlpha=Math.min(1,b.t*3);if(b.pts){ctx.fillStyle='#ffe45e';ctx.font='bold 16px monospace';ctx.fillText(b.pts,b.x,b.y);}else{ctx.font='22px system-ui,"Apple Color Emoji",sans-serif';ctx.fillStyle='#ffe45e';ctx.fillText(cl?'✶':'💥',b.x,b.y);}ctx.globalAlpha=1;}
  if(paused){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 34px monospace';ctx.fillText('PAUSED',W/2,H/2);ctx.font='14px monospace';ctx.fillText('Tap ▶ or press P to carry on',W/2,H/2+30);}
  ctx.restore();hud();}
 let viewTheme='player';
 const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
 function hud(){get('arcHud').innerHTML=`<span>Score <b>${g.score}</b></span><span>Wave <b>${g.wave}</b></span><span>${'❤️'.repeat(Math.max(0,g.lives))||'💔'}</span><span class="${!admin&&cap-played<60?'arc-low':''}">⏱️ <b>${admin?'∞':fmt(cap-played)}</b></span>`;}
 function loop(t){if(view!=='game'){raf=0;return;}const dt=Math.min(.05,(t-(last||t))/1000);last=t;
  if(!paused&&document.visibilityState==='visible'){played+=dt;update(dt);if(!admin&&played>=cap&&view==='game')finish('time');}
  if(view==='game')render();raf=requestAnimationFrame(loop);}
 // ---- screens ----
 function card(html){get('arcBody').innerHTML=html;}
 function locked(st){const r=st.reqs.map(q=>`<li class="${q.done?'ok':''}">${q.done?'✅':'⬜'} ${q.label} <small>(${q.unit==='min'?`${Math.min(q.have,q.need)} of ${q.need} min`:`${Math.min(q.have,q.need)}/${q.need}`})</small></li>`).join('');
  const why=st.blocks.length?st.blocks.map(b=>`<p>🔒 ${b}</p>`).join(''):!st.reqsDone?'<p>🔒 Unlock the arcade by doing some maths first:</p>':st.breakLeft?`<p>⏸️ Time for a break! The arcade opens again in <b>${fmt(st.breakLeft)}</b>.</p>`:st.available<30?(st.earned!==null&&st.earned-st.usedDay<st.dayLeft&&st.earned-st.usedDay<st.weekLeft?`<p>⚡ You’ve used the play time you’ve earned. Every ${stats.arcade.settings.earnPer} minutes of maths earns 1 more minute!</p>`:`<p>🏁 That’s all the arcade time for ${st.weekLeft<=st.dayLeft?'this week':'today'}. Well played!</p>`):'';
  card(`<div class="arc-card"><div class="arc-big">🕹️</div><h3>The Secret Arcade</h3>${why}${!st.reqsDone&&!st.blocks.length?`<ul class="arc-reqs">${r}</ul>`:''}<p class="mini">Shhh… keep the secret word to yourself! 🤫</p><button class="primary" data-arc="close" type="button">Back to maths</button></div>`);}
 function menu(st){viewTheme=stats.arcade.theme;const t=viewTheme;
  card(`<div class="arc-card"><div class="arc-big">🕹️</div><h3>${admin?'Arcade (admin — no limits)':'You unlocked the Secret Arcade!'}</h3>
   ${admin?'':`<p>You can play for <b>${fmt(st.sessionSecs)}</b> now. Left today: <b>${fmt(st.dayLeft)}</b> · this week: <b>${fmt(st.weekLeft)}</b>${st.earned!==null?` · earned so far today: <b>${fmt(Math.max(0,st.earned-st.usedDay))}</b>`:''}.</p>`}
   <div class="arc-themes"><button class="arc-theme${t==='player'?' on':''}" data-theme="player" type="button"><span>🧍⚽</span><b>My player</b><small>Kick footballs at the invaders</small></button><button class="arc-theme classic${t==='classic'?' on':''}" data-theme="classic" type="button"><span>👾</span><b>Classic</b><small>Retro arcade style</small></button></div>
   <p class="mini">High scores — My player: <b>${stats.arcade.high.player}</b> · Classic: <b>${stats.arcade.high.classic}</b></p>
   <div class="actions" style="justify-content:center"><button class="primary" data-arc="start" type="button">▶️ Start</button><button class="ghost" data-arc="mute" type="button">${stats.arcade.mute?'🔇 Sound off':'🔊 Sound on'}</button><button class="ghost" data-arc="close" type="button">Back to maths</button></div>
   <p class="mini">Keys: ← → to move, Space to kick, P to pause. On a tablet use the buttons under the game.</p></div>`);}
 function start(){const st=arcadeStatus(stats);if(!admin&&!st.canPlay){locked(st);return;}cap=admin?Infinity:st.sessionSecs;played=0;paused=false;newGame();view='game';
  if(stats.arcade.theme==='player'){avImg=new Image();avImg.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(drawAvatar(stats.avatar,{scene:false}));}
  card(`<div class="arc-game"><div class="arc-hud" id="arcHud"></div><canvas id="arcCanvas" width="480" height="600" aria-label="Arcade game"></canvas>
   <div class="arc-pad"><button data-pad="l" type="button" aria-label="Move left">◀</button><button data-pad="f" type="button" aria-label="Kick">${stats.arcade.theme==='classic'?'FIRE':'⚽ KICK'}</button><button data-pad="r" type="button" aria-label="Move right">▶</button></div>
   <div class="arc-ctl"><button class="ghost" data-arc="pause" type="button">⏸️ Pause</button><button class="ghost" data-arc="quit" type="button">🏁 Stop</button></div></div>`);
  cv=get('arcCanvas');const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;ctx=cv.getContext('2d');
  const padEl=get('arcBody').querySelector('.arc-pad');padEl.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-pad]');if(b){pad[b.dataset.pad]=true;b.setPointerCapture(e.pointerId);e.preventDefault();}});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>padEl.addEventListener(ev,e=>{const b=e.target.closest('[data-pad]');if(b)pad[b.dataset.pad]=false;}));
  cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();g.p.x=Math.max(22,Math.min(W-22,(e.clientX-r.left)/r.width*W));pad.f=true;setTimeout(()=>pad.f=false,120);});
  cv.addEventListener('pointermove',e=>{if(e.buttons){const r=cv.getBoundingClientRect();g.p.x=Math.max(22,Math.min(W-22,(e.clientX-r.left)/r.width*W));}});
  last=0;if(!raf)raf=requestAnimationFrame(loop);}
 function finish(why){if(view!=='game')return;view='over';endWhy=why;cancelAnimationFrame(raf);raf=0;const th=stats.arcade.theme,best=g.score>stats.arcade.high[th];
  if(best)stats.arcade.high[th]=g.score;
  if(!admin){const k=dayKey(),secs=Math.round(played);stats.arcade.used[k]=(stats.arcade.used[k]||0)+secs;stats.arcade.lastEnd=Date.now();stats.arcade.plays.push({t:Date.now(),secs,score:g.score,theme:th,wave:g.wave,end:why});if(stats.arcade.plays.length>200)stats.arcade.plays.shift();}
  save();const st=arcadeStatus(stats);
  card(`<div class="arc-card"><div class="arc-big">${why==='time'?'⏱️':why==='gameover'?'👾':'🏁'}</div><h3>${why==='time'?'Full time!':why==='gameover'?'Game over!':'Game stopped'}</h3><p>Score: <b>${g.score}</b> · Wave ${g.wave}${best?' · 🏆 <b>New high score!</b>':''}</p>
   ${admin?'':`<p class="mini">Arcade time left today: <b>${fmt(st.dayLeft)}</b>${st.earned!==null?` (earned: ${fmt(Math.max(0,st.earned-st.usedDay))})`:''}${st.breakLeft?` · next game after a <b>${Math.ceil(st.breakLeft/60)}-minute</b> break`:''}.</p><p>🧠 Back to the maths — every question earns more arcade time!</p>`}
   <div class="actions" style="justify-content:center">${admin||st.canPlay?'<button class="secondary" data-arc="again" type="button">🔄 Play again</button>':''}<button class="primary" data-arc="close" type="button">Back to maths</button></div></div>`);}
 function open(opts={}){admin=!!opts.admin;if(!admin&&!(window.APP_CONFIG&&window.APP_CONFIG.arcade))return false;arcadeOpen=true;view='menu';
  const d=dlg();if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');
  if(admin)menu(null);else{const st=arcadeStatus(stats);st.canPlay?menu(st):locked(st);}return true;}
 function close(){if(view==='game')finish('stopped');view='menu';arcadeOpen=false;const d=dlg();if(d.close)d.close();else d.removeAttribute('open');}
 function onClick(e){const b=e.target.closest('button');if(!b||!dlg().contains(b))return;const a=b.dataset.arc;
  if(b.dataset.theme){stats.arcade.theme=b.dataset.theme;save(false);menu(admin?null:arcadeStatus(stats));return;}
  if(a==='start'||a==='again')start();else if(a==='close'||b.dataset.close!==undefined)close();else if(a==='quit')finish('stopped');
  else if(a==='pause'){paused=!paused;b.textContent=paused?'▶️ Play':'⏸️ Pause';}else if(a==='mute'){stats.arcade.mute=!stats.arcade.mute;save(false);menu(admin?null:arcadeStatus(stats));}}
 function init(){const d=dlg();d.addEventListener('click',onClick);d.addEventListener('close',()=>{if(view==='game')finish('stopped');arcadeOpen=false;});
  d.addEventListener('cancel',e=>{if(view==='game'){e.preventDefault();paused=true;}});
  window.addEventListener('keydown',e=>{if(!arcadeOpen||view!=='game')return;if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key))e.preventDefault();if(e.key==='p'||e.key==='P'){paused=!paused;return;}keys[e.key]=true;});
  window.addEventListener('keyup',e=>{keys[e.key]=false;});document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'&&view==='game')paused=true;});}
 return{init,open,close,status:()=>({view,played,cap,admin,score:g&&g.score})};
})();
