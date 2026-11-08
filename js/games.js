'use strict';
// PRESENTATION: four ORIGINAL arcade games (inspired by classic genres; no code, art or names copied from commercial games).
// Each game: create(env) → {W,H,score,lives,level,levelName,over, update(dt,inp), render(ctx), swipe?(dx,dy), pointer?(fx)}.
// inp = {l,r,u,d,f} (held buttons). Scores are deliberately big — players like to score thousands!
const GAME_LIST=[
 {id:'invaders',name:'Invaders',icon:'👾',desc:'Defend the pitch — and a bonus game after every wave.'},
 {id:'maze',name:'Maze Muncher',icon:'🟡',desc:'Munch every dot. Grab a power dot to chase the monsters!'},
 {id:'meteor',name:'Meteor Storm',icon:'☄️',desc:'Rotate, thrust and blast the meteors in deep space.'},
 {id:'guardian',name:'Planet Guardian',icon:'🚀',desc:'Fly over the planet and stop the landers taking people.'}];
const PADS={invaders:[['l','r'],['f']],maze:[['l','r'],['u','d']],meteor:[['l','r'],['d','u','f']],guardian:[['u','d'],['l','r','b','f']]};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const EMOJI_FONT='system-ui,"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
function drawBanner(ctx,W,H,b){if(!b)return;Retro.banner(ctx,W,H,b);}
const fmtN=n=>Math.round(n).toLocaleString('en-GB');

// =====================================================================================================
// 1. INVADERS (+ a bonus game between every wave)
// =====================================================================================================
function makeInvaders(env){
 const W=480,H=600,cl=env.theme==='classic',G={W,H,score:0,lives:3,level:1,levelName:'Wave',over:false};
 const SPR={a:[["....XXX....","..XXXXXXX..",".XX.XXX.XX.","XXXXXXXXXXX","X.XXXXXXX.X","X.X.....X.X","...XX.XX...","..........."],["....XXX....","..XXXXXXX..",".XX.XXX.XX.","XXXXXXXXXXX","..XXXXXXX..",".X.X...X.X.","X.........X","..........."]],
  b:[["...X...X...","....X.X....","..XXXXXXX..",".XX.XXX.XX.","XXXXXXXXXXX","X.X.X.X.X.X","..X.....X..","..........."],["...X...X...","X...X.X...X","X.XXXXXXX.X","XXX.XXX.XXX","XXXXXXXXXXX",".X.X.X.X.X.","X.........X","..........."]],
  c:[["..XXXXXXX..",".XXXXXXXXX.","XX..XXX..XX","XXXXXXXXXXX",".XXX...XXX.","..X.XXX.X..",".X.......X.","..........."],["..XXXXXXX..",".XXXXXXXXX.","XX..XXX..XX","XXXXXXXXXXX",".XXX...XXX.","X..X...X..X","..X.....X..","..........."]],
  ship:["....XXXXX....","..XXXXXXXXX..",".XX.XX.XX.XX.","XXXXXXXXXXXXX","..XX..X..XX..","...X.....X..."],cannon:["......X......",".....XXX.....",".....XXX.....",".XXXXXXXXXXX.","XXXXXXXXXXXXX","XXXXXXXXXXXXX"]};
 const ROWS=['a','b','b','c','c'],PTS=[300,200,200,100,100],EMO=['👾','🤖','🤖','👽','👽'];
 const FX=Retro.fx(),MARCH=[110,98,87,82];let note=0,ufoBeep=0,t=0,ctx,p={x:W/2,inv:0},pb=null,eb=[],inv=[],dir=1,stepT=0,frame=0,ufo=null,ufoT=R(14,24),bk=[],boom=[],phase='wave',bon=null,held=false,banner={t:1.6,text:'WAVE 1',sub:'Get ready!'};
 const stars=Array.from({length:60},()=>[R(0,W),R(0,H),Math.random()]);
 const px=(spr,x,y,s,col)=>{ctx.fillStyle=col;spr.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='X')ctx.fillRect(Math.round(x+i*s),Math.round(y+j*s),Math.ceil(s),Math.ceil(s));});};
 function bunkers(){const out=[];for(let i=0;i<4;i++){const bx=45+i*112,by=470;for(let y=0;y<8;y++)for(let x=0;x<14;x++){if(y<2&&(x<2||x>11))continue;if(y>4&&x>3&&x<10)continue;out.push({x:bx+x*4.5,y:by+y*4.5,a:true});}}return out;}
 function wave(){inv=[];const oy=78+Math.min(6,G.level-1)*10;for(let r=0;r<5;r++)for(let c=0;c<9;c++)inv.push({x:62+c*40,y:oy+r*34,r,alive:true});dir=1;stepT=0;pb=null;eb=[];}
 wave();bk=bunkers();
 const hitBunker=(x,y,r)=>{let h=false;for(const b of bk)if(b.a&&Math.abs(b.x+2-x)<r&&Math.abs(b.y+2-y)<r){b.a=false;h=true;}return h;};
 const press=inp=>{const f=inp.f&&!held;held=inp.f;return f;};
 const add=(n,x,y)=>{G.score+=n;if(bon)bon.earned+=n;boom.push({x,y,t:.8,pts:n});};
 // ---------- bonus rounds ----------
 const KINDS=['penalty','maths','meteors','ufo'];
 function newQ(){const t=R(0,2);let a,b,ans,txt;if(t===0){a=R(3,12);b=R(3,12);ans=a*b;txt=`${a} × ${b}`;}else if(t===1){a=R(15,79);b=R(12,59);ans=a+b;txt=`${a} + ${b}`;}else{a=R(40,99);b=R(11,a-5);ans=a-b;txt=`${a} − ${b}`;}
  const o=new Set([ans]);while(o.size<4){const d=ans+pick([-10,-2,-1,1,2,10,R(-12,12)]);if(d>0)o.add(d);}
  bon.q={txt,ans};bon.bub=[...o].sort(()=>Math.random()-.5).map((v,i)=>({v,x:70+i*112,y:R(200,330),vx:pick([-1,1])*R(40,60+G.level*6)}));}
 function startBonus(){const k=KINDS[(G.level-1)%KINDS.length];phase='bonus';bon={k,earned:0,msg:'',msgT:0,shot:null};
  if(k==='penalty')Object.assign(bon,{shots:5,goals:0,kx:W/2,kv:110+G.level*18});
  if(k==='maths'){Object.assign(bon,{left:25,qs:0});newQ();}
  if(k==='meteors')Object.assign(bon,{left:15,rocks:[],spawn:0,hits:0,flash:0});
  if(k==='ufo')Object.assign(bon,{left:15,ufos:[],spawn:0});
  banner={t:2.4,text:'BONUS ROUND!',sub:{penalty:'⚽ Penalty shoot-out — 5 kicks',maths:'🧮 Maths blast — shoot the right answer',meteors:'☄️ Meteor shower — dodge for 15 seconds',ufo:'🛸 UFO hunt — 15 seconds'}[k]};}
 function endBonus(){if(bon.k==='meteors'){const e=Math.max(0,7500-bon.hits*1500);G.score+=e;bon.earned+=e;}
  const e=bon.earned;banner={t:2.6,text:`BONUS +${fmtN(e)}`,sub:`Wave ${G.level+1} — get ready!`,then:()=>{G.level++;phase='wave';bon=null;wave();bk=bunkers();}};}
 function updBonus(dt,inp){p.x=clamp(p.x+(inp.r-inp.l)*260*dt,22,W-22);if(bon.msgT>0)bon.msgT-=dt;const fire=press(inp);
  if(bon.k==='penalty'){bon.kx+=bon.kv*dt;if(bon.kx>W/2+85||bon.kx<W/2-85)bon.kv*=-1;
   if(fire&&!bon.shot&&bon.shots>0){bon.shot={x:p.x,y:H-90};bon.shots--;env.beep(500,.08,'triangle',.04,1.5);}
   if(bon.shot){bon.shot.y-=520*dt;if(bon.shot.y<=112){const x=bon.shot.x;bon.shot=null;bon.msgT=1.1;
    if(Math.abs(x-bon.kx)<30){bon.msg='SAVED! 🧤';env.beep(120,.3,'sawtooth',.05,.5);}else if(Math.abs(x-W/2)<100){bon.goals++;const n=2000*bon.goals;add(n,x,100);bon.msg=`GOAL! ⚽ +${fmtN(n)}`;env.beep(880,.35,'triangle',.06,1.6);}else{bon.msg='Wide! 😬';}}}
   if(bon.shots===0&&!bon.shot&&bon.msgT<=0)endBonus();}
  else if(bon.k==='maths'){bon.left-=dt;for(const b of bon.bub){b.x+=b.vx*dt;if(b.x<40||b.x>W-40)b.vx*=-1;}
   if(fire&&!bon.shot){bon.shot={x:p.x,y:H-80};env.beep(880,.06,'square',.03,.5);}
   if(bon.shot){bon.shot.y-=520*dt;const hit=bon.bub.find(b=>Math.hypot(b.x-bon.shot.x,b.y-bon.shot.y)<30);
    if(hit){bon.shot=null;if(hit.v===bon.q.ans){bon.qs++;add(3000,hit.x,hit.y);bon.msg='✅ Correct! +3,000';bon.msgT=1;env.beep(1000,.25,'triangle',.06,1.5);if(bon.qs>=3)endBonus();else newQ();}
     else{bon.bub=bon.bub.filter(b=>b!==hit);bon.msg='❌ Not that one!';bon.msgT=1;env.beep(150,.2,'sawtooth',.05,.6);}}
    else if(bon.shot&&bon.shot.y<0)bon.shot=null;}
   if(bon.left<=0&&phase==='bonus'&&!banner)endBonus();}
  else if(bon.k==='meteors'){bon.left-=dt;bon.spawn-=dt;if(bon.flash>0)bon.flash-=dt;
   if(bon.spawn<=0){bon.spawn=Math.max(.16,.38-G.level*.02);bon.rocks.push({x:R(10,W-10),y:-20,vy:R(160,260)+G.level*10,vx:R(-40,40),r:R(10,22)});}
   for(const r of bon.rocks){r.y+=r.vy*dt;r.x+=r.vx*dt;}
   bon.rocks=bon.rocks.filter(r=>{if(r.y>H+30)return false;if(Math.abs(r.x-p.x)<r.r+14&&Math.abs(r.y-(H-50))<r.r+16){bon.hits++;bon.flash=.4;env.beep(80,.3,'sawtooth',.06,.5);return false;}return true;});
   if(bon.left<=0)endBonus();}
  else if(bon.k==='ufo'){bon.left-=dt;bon.spawn-=dt;if(bon.spawn<=0){bon.spawn=.75;const L=Math.random()<.5;bon.ufos.push({x:L?-30:W+30,y:R(70,330),v:(L?1:-1)*R(110,190+G.level*8)});}
   for(const u of bon.ufos)u.x+=u.v*dt;bon.ufos=bon.ufos.filter(u=>u.x>-40&&u.x<W+40);
   if(fire&&!bon.shot){bon.shot={x:p.x,y:H-80};env.beep(880,.06,'square',.03,.5);}
   if(bon.shot){bon.shot.y-=560*dt;const hit=bon.ufos.find(u=>Math.abs(u.x-bon.shot.x)<24&&Math.abs(u.y-bon.shot.y)<14);if(hit){bon.ufos=bon.ufos.filter(u=>u!==hit);add(1000,hit.x,hit.y);bon.shot=null;env.beep(1200,.15,'triangle',.05,.5);}else if(bon.shot.y<0)bon.shot=null;}
   if(bon.left<=0)endBonus();}
  boom.forEach(b=>b.t-=dt);boom=boom.filter(b=>b.t>0);}
 // ---------- normal waves ----------
 function updWave(dt,inp){p.x=clamp(p.x+(inp.r-inp.l)*230*dt,22,W-22);if(p.inv>0)p.inv-=dt;
  if(inp.f&&!pb){pb={x:p.x,y:H-72};env.beep(880,.07,'square',.03,.4);}
  if(pb){pb.y-=470*dt;if(pb.y<30)pb=null;else if(hitBunker(pb.x,pb.y,6))pb=null;
   else{for(const v of inv)if(v.alive&&Math.abs(v.x-pb.x)<15&&Math.abs(v.y-pb.y)<13){v.alive=false;add(PTS[v.r]*G.level,v.x,v.y);pb=null;env.beep(160,.12,'sawtooth',.04,.3);env.noise(.18,.05,1800);FX.burst(v.x,v.y,cl?['#fff',v.r===0?'#ff5ad8':v.r<3?'#64d9f5':'#fff']:['#ffe45e','#ff8a1c','#fff'],16,160,.5,3);break;}
    if(pb&&ufo&&Math.abs(ufo.x-pb.x)<22&&Math.abs(48-pb.y)<12){add(pick([500,1000,1500,3000])*G.level,ufo.x,48);FX.burst(ufo.x,48,['#ff3b3b','#ffe45e','#fff'],34,220,.8,3);FX.shake(6);env.noise(.5,.08,900);ufo=null;pb=null;env.beep(1200,.25,'triangle',.05,.5);}}}
  const alive=inv.filter(v=>v.alive),n=alive.length;
  if(!n){const b=1000*G.level;G.score+=b;banner={t:2,text:`WAVE ${G.level} CLEAR!`,sub:`+${fmtN(b)} bonus`,then:startBonus};env.beep(660,.3,'triangle',.05,2);return;}
  const interval=Math.max(.05,(0.62-(G.level-1)*.05)*(0.15+0.85*n/45));stepT+=dt;
  if(stepT>=interval){stepT=0;frame^=1;const edge=alive.some(v=>v.x+dir*9>W-18||v.x+dir*9<18);if(edge){dir*=-1;alive.forEach(v=>v.y+=16);}else alive.forEach(v=>v.x+=dir*9);env.beep(MARCH[note++%4],.07,'square',.035);for(const v of alive)hitBunker(v.x,v.y+10,14);}
  if(alive.some(v=>v.y>H-105))G.lives=0;
  if(eb.length<2+Math.min(4,G.level)&&Math.random()<dt*(0.8+G.level*0.2)){const cols={};for(const v of alive)if(!cols[v.x]||cols[v.x].y<v.y)cols[v.x]=v;const s=pick(Object.values(cols));eb.push({x:s.x,y:s.y+12,vy:170+G.level*14});}
  for(const b of eb)b.y+=b.vy*dt;
  eb=eb.filter(b=>{if(b.y>H)return false;if(hitBunker(b.x,b.y,6))return false;if(p.inv<=0&&Math.abs(b.x-p.x)<20&&b.y>H-64&&b.y<H-30){G.lives--;p.inv=1.6;boom.push({x:p.x,y:H-48,t:.5});env.beep(70,.4,'sawtooth',.06,.5);env.noise(.8,.1,700);FX.burst(p.x,H-48,cl?['#3cff6a','#fff']:['#e51c35','#fff','#ffe45e'],50,240,1.1,3);FX.shake(12);return false;}return true;});
  ufoT-=dt;if(ufo){ufoBeep-=dt;if(ufoBeep<=0){ufoBeep=.12;env.beep(Math.floor(t*8)%2?620:720,.1,'triangle',.018);}}if(!ufo&&ufoT<=0){const L=Math.random()<.5;ufo={x:L?-30:W+30,v:L?95:-95};}if(ufo){ufo.x+=ufo.v*dt;if(ufo.x<-40||ufo.x>W+40){ufo=null;ufoT=R(16,28);}}
  boom.forEach(b=>b.t-=dt);boom=boom.filter(b=>b.t>0);if(G.lives<=0)G.over=true;}
 G.update=(dt,inp)=>{t+=dt;FX.update(dt);if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}if(phase==='wave')updWave(dt,inp);else updBonus(dt,inp);};
 G.pointer=fx=>{p.x=clamp(fx*W,22,W-22);};
 G._clear=()=>inv.forEach(v=>v.alive=false);G._phase=()=>phase+(bon?':'+bon.k:'');
 function drawPlayer(){const blink=p.inv>0&&Math.floor(p.inv*10)%2===0;if(blink)return;if(cl)px(SPR.cannon,p.x-16,H-58,2.5,'#3cff6a');else if(env.avatar&&env.avatar.complete)ctx.drawImage(env.avatar,p.x-24,H-82,48,60);else{ctx.font=`32px ${EMOJI_FONT}`;ctx.fillText('🧍',p.x,H-50);}}
 const shotDraw=s=>{if(!s)return;if(cl){ctx.fillStyle='#fff';ctx.fillRect(s.x-1,s.y-8,3,12);}else{ctx.font=`16px ${EMOJI_FONT}`;ctx.fillText('⚽',s.x,s.y);}};
 G.render=c=>{ctx=c;const[ox,oy]=FX.offset();ctx.save();ctx.translate(ox,oy);ctx.textAlign='center';ctx.textBaseline='middle';
  const bg=phase==='bonus'&&bon&&bon.k==='penalty'?(cl?'#000':'#1f7a34'):(cl?'#000':'#0b1236');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  if(!cl&&!(phase==='bonus'&&bon&&bon.k==='penalty'))for(const[x,y,b]of stars){ctx.fillStyle=`rgba(255,255,255,${.3+b*.7})`;ctx.fillRect(x,y,b>.8?2:1,b>.8?2:1);}
  if(phase==='wave'){
   for(const v of inv)if(v.alive){if(cl)px(SPR[ROWS[v.r]][frame],v.x-13,v.y-10,2.4,v.r===0?'#ff5ad8':v.r<3?'#64d9f5':'#fff');else{ctx.font=`26px ${EMOJI_FONT}`;ctx.fillText(EMO[v.r],v.x,v.y+(frame?1:-1));}}
   ctx.fillStyle=cl?'#3cff6a':'#64d9f5';for(const b of bk)if(b.a)ctx.fillRect(b.x,b.y,4.6,4.6);
   if(ufo){if(cl)px(SPR.ship,ufo.x-16,40,2.5,'#ff3b3b');else{ctx.font=`28px ${EMOJI_FONT}`;ctx.fillText('🛸',ufo.x,48);}}
   shotDraw(pb);ctx.strokeStyle=cl?'#fff':'#ff5a5a';ctx.lineWidth=2.5;for(const b of eb){ctx.beginPath();ctx.moveTo(b.x,b.y-10);ctx.lineTo(b.x+3,b.y-5);ctx.lineTo(b.x-3,b.y);ctx.lineTo(b.x,b.y+4);ctx.stroke();}}
  else if(bon){const k=bon.k;ctx.font=`bold 16px monospace`;ctx.fillStyle=cl?'#3cff6a':'#fff';
   if(k==='penalty'){ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.strokeRect(W/2-100,40,200,72);ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,.35)';for(let x=W/2-90;x<W/2+100;x+=14){ctx.beginPath();ctx.moveTo(x,40);ctx.lineTo(x,112);ctx.stroke();}
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(W/2-170,40,340,150);ctx.beginPath();ctx.arc(W/2,190,50,0,Math.PI);ctx.stroke();
    if(cl){ctx.fillStyle='#ffe45e';ctx.fillRect(bon.kx-22,92,44,22);}else{ctx.font=`34px ${EMOJI_FONT}`;ctx.fillText('🧤',bon.kx,102);}
    if(bon.shot){if(cl){ctx.fillStyle='#fff';ctx.fillRect(bon.shot.x-5,bon.shot.y-5,10,10);}else{ctx.font=`22px ${EMOJI_FONT}`;ctx.fillText('⚽',bon.shot.x,bon.shot.y);}}
    ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.fillText(`Kicks left: ${bon.shots}   Goals: ${bon.goals}`,W/2,240);}
   if(k==='maths'){ctx.fillStyle='#ffe45e';ctx.font='bold 34px monospace';ctx.fillText(`${bon.q.txt} = ?`,W/2,110);ctx.font='bold 14px monospace';ctx.fillStyle='#fff';ctx.fillText(`Question ${bon.qs+1} of 3 · ${Math.ceil(bon.left)}s`,W/2,148);
    for(const b of bon.bub){ctx.beginPath();ctx.arc(b.x,b.y,28,0,Math.PI*2);ctx.fillStyle=cl?'#000':'#2457d6';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=cl?'#3cff6a':'#64d9f5';ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.fillText(b.v,b.x,b.y+1);}shotDraw(bon.shot);}
   if(k==='meteors'){for(const r of bon.rocks){if(cl){ctx.fillStyle='#aaa';ctx.fillRect(r.x-r.r/1.4,r.y-r.r/1.4,r.r*1.4,r.r*1.4);}else{ctx.font=`${Math.round(r.r*2)}px ${EMOJI_FONT}`;ctx.fillText('☄️',r.x,r.y);}}ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.fillText(`Dodge! ${Math.ceil(bon.left)}s · hits: ${bon.hits}`,W/2,30);if(bon.flash>0){ctx.fillStyle='rgba(255,0,0,.25)';ctx.fillRect(0,0,W,H);}}
   if(k==='ufo'){for(const u of bon.ufos){if(cl)px(SPR.ship,u.x-16,u.y-8,2.5,'#ff3b3b');else{ctx.font=`28px ${EMOJI_FONT}`;ctx.fillText('🛸',u.x,u.y);}}shotDraw(bon.shot);ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.fillText(`UFO hunt! ${Math.ceil(bon.left)}s`,W/2,30);}
   if(bon.msgT>0){ctx.font=`bold 26px ${EMOJI_FONT}`;ctx.fillStyle='#ffe45e';ctx.fillText(bon.msg,W/2,H/2+20);}}
  drawPlayer();
  for(const b of boom){ctx.globalAlpha=Math.min(1,b.t*2);ctx.fillStyle='#ffe45e';ctx.font='bold 15px monospace';ctx.fillText(b.pts?'+'+fmtN(b.pts):'✶',b.x,b.y-(.8-b.t)*30);ctx.globalAlpha=1;}
  if(!cl&&phase!=='bonus'){ctx.fillStyle='#2f9a4a';ctx.fillRect(0,H-22,W,22);}else if(cl){ctx.fillStyle='#3cff6a';ctx.fillRect(0,H-20,W,2);}
  FX.render(ctx);ctx.restore();
  // classic arcade HUD in pixel letters
  Retro.text(ctx,'SCORE',12,6,1,cl?'#fff':'#9aa3c7');Retro.text(ctx,String(G.score).padStart(6,'0'),12,16,2,cl?'#fff':'#ffe45e');
  Retro.text(ctx,'HI-SCORE',W-12,6,1,cl?'#fff':'#9aa3c7','right');Retro.text(ctx,String(Math.max(G.score,env.hi())).padStart(6,'0'),W-12,16,2,cl?'#3cff6a':'#3fe0ff','right');
  if(phase==='wave'){Retro.text(ctx,String(Math.max(0,G.lives)),10,H-14,2,cl?'#3cff6a':'#fff');for(let i=0;i<Math.max(0,G.lives-1);i++){if(cl)px(SPR.cannon,30+i*34,H-16,2,'#3cff6a');else{ctx.font=`14px ${EMOJI_FONT}`;ctx.fillText('⚽',42+i*22,H-10);}}}
  drawBanner(ctx,W,H,banner);};
 const legend=[{k:'ship',name:'MYSTERY',pts:'?',col:'#ff3b3b'},{k:'a',name:'',pts:'300',col:'#ff5ad8',r:0},{k:'b',name:'',pts:'200',col:'#64d9f5',r:1},{k:'c',name:'',pts:'100',col:'#fff',r:3}].map(e=>({name:e.name||'POINTS',pts:e.pts,color:cl?e.col:'#ffe45e',draw:(c2,x,y,tt)=>{ctx=c2;if(cl){const sp=e.k==='ship'?SPR.ship:SPR[e.k][Math.floor(tt*2)%2];px(sp,x-sp[0].length*1.5,y-10,3,e.col);}else{c2.font=`30px ${EMOJI_FONT}`;c2.textAlign='center';c2.textBaseline='middle';c2.fillText(e.k==='ship'?'🛸':EMO[e.r],x,y);}}}));
 return Retro.intro(G,{title:cl?'SPACE RAIDERS':'PITCH INVADERS',color:cl?'#3cff6a':'#ffe45e',sub:cl?'DEFEND THE BASE':'DEFEND THE PITCH',tableTitle:'SCORE ADVANCE TABLE',legend,stars:!cl,hi:env.hi,hint:'ARROWS MOVE - SPACE FIRE - BONUS GAME AFTER EVERY WAVE',onStart:()=>env.beep(330,.3,'square',.05,2)});}

// =====================================================================================================
// 2. MAZE MUNCHER (original maze)
// =====================================================================================================
const MAZE=["###################","#o.......#.......o#","#.##.###.#.###.##.#","#.................#","#.##.#.#####.#.##.#","#....#...#...#....#","####.###.#.###.####","####.#.......#.####","####.#.##-##.#.####",".....#.#GGG#.#.....","####.#.#####.#.####","####.#.......#.####","####.#.#####.#.####","#........#........#","#.##.###.#.###.##.#","#o.#.....P.....#.o#","##.#.#.#####.#.#.##","#....#...#...#....#","#.######.#.######.#","#.................#","###################"];
function makeMaze(env){
 const COLS=MAZE[0].length,ROWS=MAZE.length,T=24,OY=30,W=COLS*T,H=ROWS*T+OY+30,G={W,H,score:0,lives:3,level:1,levelName:'Level',over:false};const NAMES=['ROCKET','BUBBLES','FROSTY','TANGO'];
 const DIRS=[[1,0],[-1,0],[0,1],[0,-1]],COL=['#ff3b3b','#ff8ad8','#3fe0ff','#ffb347'];
 let grid,dots,pl,gh,fright=0,chain=0,fruit=null,eaten=0,mouth=0,banner=null,readyT=2.2,freezeT=0,popup=null,deathT=0,time=0,want=[-1,0];
 const at=(x,y)=>{if(y<0||y>=ROWS)return'#';return grid[y][(x+COLS)%COLS];};
 const wall=(x,y,door)=>{const c=at(x,y);return c==='#'||(c==='-'&&!door);};
 function placeActors(){pl={tx:9,ty:15,dx:0,dy:0,p:0};gh=COL.map((c,i)=>({tx:i===0?9:7+i,ty:i===0?7:9,dx:i===0?-1:0,dy:0,p:0,c,state:i===0?'chase':'pen',rel:i*3/Math.min(2,1+G.level*.2),fr:false}));fright=0;}
 function newLevel(){grid=MAZE.map(r=>r.split('').map(c=>c==='P'||c==='G'?(c==='P'?' ':' '):c));dots=0;for(const r of grid)for(const c of r)if(c==='.'||c==='o')dots++;eaten=0;fruit=null;placeActors();time=0;}
 newLevel();
 const dist2=(a,b,x,y)=>(a-x)**2+(b-y)**2;
 function levelClear(){const b=10000*G.level;G.score+=b;banner={t:2.4,text:`LEVEL ${G.level} CLEAR!`,sub:`+${fmtN(b)} bonus`,then:()=>{G.level++;newLevel();readyT=2;}};}
 function eat(x,y){const c=grid[y][x];if(c==='.'||c==='o'){grid[y][x]=' ';dots--;eaten++;if(c==='.'){G.score+=100;env.beep(eaten%2?520:390,.05,'triangle',.035);}else{G.score+=500;fright=Math.max(2.5,7-G.level*.6);chain=0;gh.forEach(g=>{if(g.state==='chase'){g.fr=true;g.dx=-g.dx;g.dy=-g.dy;}});env.beep(300,.3,'triangle',.05,2);}
  if(eaten===40||eaten===120)fruit={t:9};if(dots===0)levelClear();}
  if(fruit&&x===9&&y===15){G.score+=5000*G.level;fruit=null;env.beep(900,.3,'triangle',.06,1.5);}}
 function decidePlayer(e){if(!wall(e.tx+want[0],e.ty+want[1])){e.dx=want[0];e.dy=want[1];}else if(wall(e.tx+e.dx,e.ty+e.dy)){e.dx=0;e.dy=0;}eat((e.tx+COLS)%COLS,e.ty);}
 function decideGhost(g){const door=g.state==='leave'||g.state==='eyes';
  if(g.state==='leave'&&g.tx===9&&g.ty===7)g.state='chase';if(g.state==='eyes'&&g.tx===9&&g.ty===9){g.state='leave';g.fr=false;}
  let opts=DIRS.filter(d=>!wall(g.tx+d[0],g.ty+d[1],door)&&!(d[0]===-g.dx&&d[1]===-g.dy));if(!opts.length)opts=DIRS.filter(d=>!wall(g.tx+d[0],g.ty+d[1],door));if(!opts.length){g.dx=0;g.dy=0;return;}
  let tx,ty;if(g.state==='eyes'){tx=9;ty=9;}else if(g.state==='leave'){tx=9;ty=7;}else if(g.fr||Math.random()<.18){const d=pick(opts);g.dx=d[0];g.dy=d[1];return;}
  else{const i=COL.indexOf(g.c);if(i===1){tx=pl.tx+pl.dx*4;ty=pl.ty+pl.dy*4;}else if(i===2&&time%20<6){tx=COLS;ty=ROWS;}else if(i===3&&dist2(g.tx,g.ty,pl.tx,pl.ty)<36){tx=0;ty=ROWS;}else{tx=pl.tx;ty=pl.ty;}}
  opts.sort((a,b)=>dist2(g.tx+a[0],g.ty+a[1],tx,ty)-dist2(g.tx+b[0],g.ty+b[1],tx,ty));g.dx=opts[0][0];g.dy=opts[0][1];}
 function step(e,speed,dt,decide){if(!e.dx&&!e.dy){decide(e);if(!e.dx&&!e.dy)return;}e.p+=speed*dt;let k=0;while(e.p>=1&&k++<4){e.p-=1;e.tx=(e.tx+e.dx+COLS)%COLS;e.ty+=e.dy;decide(e);if(!e.dx&&!e.dy){e.p=0;break;}}}
 const pos=e=>[e.tx+e.dx*e.p,e.ty+e.dy*e.p];
 G.update=(dt,inp)=>{if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  if(readyT>0){readyT-=dt;return;}if(freezeT>0){freezeT-=dt;if(freezeT<=0)popup=null;return;}
  if(deathT>0){deathT-=dt;if(deathT<=0){if(G.lives<=0)G.over=true;else{placeActors();readyT=1.6;}}return;}
  time+=dt;mouth+=dt*12;
  if(inp.l)want=[-1,0];else if(inp.r)want=[1,0];else if(inp.u)want=[0,-1];else if(inp.d)want=[0,1];
  if((pl.dx||pl.dy)&&want[0]===-pl.dx&&want[1]===-pl.dy){pl.tx=(pl.tx+pl.dx+COLS)%COLS;pl.ty+=pl.dy;pl.p=1-pl.p;pl.dx=-pl.dx;pl.dy=-pl.dy;}
  step(pl,Math.min(8.5,6.4+G.level*.25),dt,decidePlayer);
  if(fright>0){fright-=dt;if(fright<=0)gh.forEach(g=>g.fr=false);}
  if(fruit){fruit.t-=dt;if(fruit.t<=0)fruit=null;}
  for(const g of gh){if(g.state==='pen'){g.rel-=dt;if(g.rel<=0){g.state='leave';g.tx=9;g.ty=9;g.dx=0;g.dy=-1;g.p=0;}continue;}
   const sp=g.state==='eyes'?12:g.fr?3.6:Math.min(8,5.4+G.level*.3);step(g,sp,dt,decideGhost);
   const[a,b]=pos(pl),[c,d]=pos(g);if(Math.abs(a-c)<.7&&Math.abs(b-d)<.7&&g.state==='chase'){
    if(g.fr){chain++;const n=Math.min(16000,1000*2**chain);G.score+=n;g.state='eyes';g.fr=false;env.beep(1400,.2,'square',.05,.3);freezeT=.6;popup={x:c,y:d,txt:fmtN(n)};}
    else{G.lives--;deathT=1.6;env.beep(600,1.4,'triangle',.05,.15);return;}}}};
 G.swipe=(dx,dy)=>{want=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];};
 G._clear=()=>{for(const r of grid)for(let i=0;i<r.length;i++)if(r[i]==='.'||r[i]==='o')r[i]=' ';dots=0;levelClear();};G._tp=(x,y)=>{pl.tx=x;pl.ty=y;pl.p=0;pl.dx=0;pl.dy=0;};G._state=()=>({pl:{...pl},fright,gh:gh.map(g=>({tx:g.tx,ty:g.ty,state:g.state,fr:g.fr})),dots});
 function muncher(ctx,cx,cy,r,ang,m){ctx.fillStyle='#ffe45e';ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,ang+m,ang+Math.PI*2-m);ctx.closePath();ctx.fill();}
 function monster(ctx,x,y,r,col,ddx,ddy,eyesOnly,wob){if(!eyesOnly){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-1,r,Math.PI,0);ctx.lineTo(x+r,y+r);for(let i=0;i<4;i++)ctx.lineTo(x+r-(i+.5)*r/2,y+r-((i+wob)%2?0:4));ctx.lineTo(x-r,y+r);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-r*.4,y-r*.3,r*.36,0,Math.PI*2);ctx.arc(x+r*.4,y-r*.3,r*.36,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1d2b5c';ctx.beginPath();ctx.arc(x-r*.4+ddx*r*.16,y-r*.3+ddy*r*.16,r*.18,0,Math.PI*2);ctx.arc(x+r*.4+ddx*r*.16,y-r*.3+ddy*r*.16,r*.18,0,Math.PI*2);ctx.fill();}
 const isW=(x,y)=>{if(y<0||y>=ROWS||x<0||x>=COLS)return false;return grid[y][x]==='#';};
 G.render=ctx=>{ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  Retro.text(ctx,'1UP',14,4,1,Math.floor(time*2)%2?'#fff':'#ff2d55');Retro.text(ctx,String(G.score),14,13,2,'#fff');Retro.text(ctx,'HIGH SCORE',W/2,4,1,'#fff','center');Retro.text(ctx,String(Math.max(G.score,env.hi())),W/2,13,2,'#fff','center');
  ctx.save();ctx.translate(0,OY);
  // neon outline walls: draw each wall edge that faces open space
  ctx.save();ctx.shadowColor='#3b6bff';ctx.shadowBlur=6;ctx.strokeStyle='#2f55ff';ctx.lineWidth=2.5;ctx.beginPath();const I=6;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(!isW(x,y))continue;const X=x*T,Y=y*T;
   if(!isW(x,y-1)){ctx.moveTo(X+(isW(x-1,y)&&!isW(x-1,y-1)?0:I),Y+I);ctx.lineTo(X+T-(isW(x+1,y)&&!isW(x+1,y-1)?0:I),Y+I);}
   if(!isW(x,y+1)){ctx.moveTo(X+(isW(x-1,y)&&!isW(x-1,y+1)?0:I),Y+T-I);ctx.lineTo(X+T-(isW(x+1,y)&&!isW(x+1,y+1)?0:I),Y+T-I);}
   if(!isW(x-1,y)){ctx.moveTo(X+I,Y+(isW(x,y-1)&&!isW(x-1,y-1)?0:I));ctx.lineTo(X+I,Y+T-(isW(x,y+1)&&!isW(x-1,y+1)?0:I));}
   if(!isW(x+1,y)){ctx.moveTo(X+T-I,Y+(isW(x,y-1)&&!isW(x+1,y-1)?0:I));ctx.lineTo(X+T-I,Y+T-(isW(x,y+1)&&!isW(x+1,y+1)?0:I));}}
  ctx.stroke();ctx.restore();
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const c=grid[y][x];if(c==='-'){ctx.fillStyle='#ff8ad8';ctx.fillRect(x*T,y*T+T/2-2,T,4);}else if(c==='.'){ctx.fillStyle='#ffd9a0';ctx.fillRect(x*T+T/2-2,y*T+T/2-2,4,4);}else if(c==='o'&&Math.floor(time*4)%2===0){ctx.fillStyle='#ffd9a0';ctx.beginPath();ctx.arc(x*T+T/2,y*T+T/2,7,0,Math.PI*2);ctx.fill();}}
  if(fruit){ctx.font=`20px ${EMOJI_FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⚽',9*T+T/2,15*T+T/2);}
  const[px2,py2]=pos(pl),cx=px2*T+T/2,cy=py2*T+T/2,ang=Math.atan2(pl.dy||want[1],pl.dx||want[0]),m=deathT>0?Math.min(Math.PI,(1.6-deathT)*2.5):.08+Math.abs(Math.sin(mouth))*.6;
  if(!(freezeT>0))muncher(ctx,cx,cy,T/2-2,deathT>0?-Math.PI/2:ang,m);
  if(deathT<=0&&!(freezeT>0)){ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx+Math.cos(ang-1.2)*5,cy+Math.sin(ang-1.2)*5,2.2,0,Math.PI*2);ctx.fill();}
  if(!(deathT>0&&deathT<1.1))for(const g of gh){const[gx,gy]=pos(g);monster(ctx,gx*T+T/2,gy*T+T/2,T/2-2,g.fr?(fright<1.6&&Math.floor(time*6)%2?'#fff':'#2340ff'):g.c,g.dx,g.dy,g.state==='eyes',Math.floor(time*8)%2);}
  if(popup)Retro.text(ctx,popup.txt,popup.x*T+T/2,popup.y*T+T/2-5,1,'#3fe0ff','center');
  if(readyT>0)Retro.text(ctx,G.level>1&&readyT>1.6?`LEVEL ${G.level}`:'READY!',W/2,11*T+5,2,'#ffe45e','center');
  ctx.restore();
  for(let i=0;i<Math.max(0,G.lives-1);i++)muncher(ctx,20+i*26,H-15,9,Math.PI,.5);
  for(let i=0;i<Math.min(7,G.level);i++){ctx.font=`16px ${EMOJI_FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⚽',W-18-i*22,H-15);}
  drawBanner(ctx,W,H,banner);};
 const legend=NAMES.map((n,i)=>({name:n,pts:'1,000+',color:COL[i],draw:(c,x,y,tt)=>monster(c,x,y,13,COL[i],Math.cos(tt*2),0,false,Math.floor(tt*8)%2)}));
 legend.push({name:'DOT',pts:'100',color:'#ffd9a0',draw:(c,x,y)=>{c.fillStyle='#ffd9a0';c.fillRect(x-3,y-3,6,6);}},{name:'POWER DOT',pts:'500',color:'#ffd9a0',draw:(c,x,y,tt)=>{if(Math.floor(tt*4)%2)return;c.fillStyle='#ffd9a0';c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();}});
 return Retro.intro(G,{title:'MAZE MUNCHER',color:'#ffe45e',sub:'CHARACTER - NICKNAME',tableTitle:'MEET THE MONSTERS',legend,hi:env.hi,hint:'ARROWS OR SWIPE TO STEER - POWER DOTS TURN THE MONSTERS BLUE'});}

// =====================================================================================================
// 3. METEOR STORM (neon vector style)
// =====================================================================================================
function makeMeteor(env){
 const W=800,H=500,G={W,H,score:0,lives:3,level:1,levelName:'Level',over:false};
 let ship,bullets=[],rocks=[],parts=[],cool=0,banner={t:1.6,text:'LEVEL 1',sub:'ROTATE - THRUST - FIRE - HYPERSPACE'},nextLife=50000;
 const FX=Retro.fx();let saucers=[],sb=[],ufoT=R(12,20),beatT=1,beatHi=false,heldD=false,t=0;
 const stars=Array.from({length:120},()=>[R(0,W),R(0,H),Math.random()]);
 const rock=(x,y,size)=>{const r=[0,15,27,46][size],n=R(9,12),pts=Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return[Math.cos(a)*r*(0.75+Math.random()*.35),Math.sin(a)*r*(0.75+Math.random()*.35)];});const sp=(4-size)*30+R(10,40)+G.level*6,a=Math.random()*Math.PI*2;return{x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,size,pts,rot:0,vr:(Math.random()-.5)*2};};
 const spawnShip=()=>{ship={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0,inv:2.5};};
 function level(){rocks=[];for(let i=0;i<2+G.level;i++){let x,y;do{x=R(0,W);y=R(0,H);}while(Math.hypot(x-W/2,y-H/2)<160);rocks.push(rock(x,y,3));}}
 spawnShip();level();
 const wrap=o=>{o.x=(o.x+W)%W;o.y=(o.y+H)%H;};
 const burst=(x,y,c,n=14)=>{for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=R(40,180);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:.7,c});}};
 G.update=(dt,inp)=>{t+=dt;FX.update(dt);parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt;});parts=parts.filter(p=>p.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  if(ship){ship.a+=(inp.r-inp.l)*4.2*dt;if(inp.u){ship.vx+=Math.cos(ship.a)*300*dt;ship.vy+=Math.sin(ship.a)*300*dt;if(Math.random()<.4)parts.push({x:ship.x-Math.cos(ship.a)*14,y:ship.y-Math.sin(ship.a)*14,vx:-Math.cos(ship.a)*120+R(-30,30),vy:-Math.sin(ship.a)*120+R(-30,30),t:.3,c:'#ff8a1c'});}
   if(inp.d&&!heldD){ship.x=R(40,W-40);ship.y=R(40,H-40);ship.vx=ship.vy=0;ship.inv=Math.max(ship.inv,.7);FX.burst(ship.x,ship.y,['#3fe0ff','#fff'],24,160,.6,2);env.beep(180,.4,'sine',.05,5);}heldD=inp.d;
   ship.vx*=Math.pow(.6,dt);ship.vy*=Math.pow(.6,dt);ship.x+=ship.vx*dt;ship.y+=ship.vy*dt;wrap(ship);if(ship.inv>0)ship.inv-=dt;
   cool-=dt;if(inp.f&&cool<=0&&bullets.length<6){cool=.2;bullets.push({x:ship.x+Math.cos(ship.a)*16,y:ship.y+Math.sin(ship.a)*16,vx:Math.cos(ship.a)*560+ship.vx,vy:Math.sin(ship.a)*560+ship.vy,t:1});env.beep(980,.05,'square',.025,.5);}}
  for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.t-=dt;wrap(b);}bullets=bullets.filter(b=>b.t>0);
  for(const r of rocks){r.x+=r.vx*dt;r.y+=r.vy*dt;r.rot+=r.vr*dt;wrap(r);}
  const born=[];rocks=rocks.filter(r=>{const hit=bullets.find(b=>Math.hypot(b.x-r.x,b.y-r.y)<r.r);if(!hit)return true;hit.t=0;G.score+=[0,2000,1000,500][r.size]*G.level;burst(r.x,r.y,'#ff8a1c');FX.burst(r.x,r.y,['#ff9a3c','#ffe45e','#fff'],8+r.size*6,140,.7,2);FX.shake(r.size*2);env.noise(.2+r.size*.12,.06+r.size*.02,500+r.size*300);if(r.size>1){born.push(rock(r.x,r.y,r.size-1),rock(r.x,r.y,r.size-1));}return false;});rocks.push(...born);
  if(ship&&ship.inv<=0&&rocks.some(r=>Math.hypot(r.x-ship.x,r.y-ship.y)<r.r+10)){burst(ship.x,ship.y,'#ffe45e',30);FX.lines(ship.x,ship.y,'#ffc94a',10);FX.shake(12);env.noise(1,.12,700);G.lives--;ship=null;if(G.lives<=0){banner={t:1.5,text:'GAME OVER',sub:'',then:()=>G.over=true};}else banner={t:1.4,text:'GET READY',sub:`${G.lives} ship${G.lives>1?'s':''} left`,then:spawnShip};}
  // ---- flying saucers ----
  ufoT-=dt;if(ufoT<=0&&!saucers.length&&!banner){ufoT=R(14,24);const small=G.level>=2&&Math.random()<.45,L=Math.random()<.5;saucers.push({x:L?-20:W+20,y:R(60,H-60),vx:(L?1:-1)*(small?150:95),vy:0,small,shootT:1,turnT:1.2});}
  for(const u of saucers){u.x+=u.vx*dt;u.y=(u.y+u.vy*dt+H)%H;u.turnT-=dt;if(u.turnT<=0){u.turnT=R(.8,1.6);u.vy=pick([-70,0,70]);}u.shootT-=dt;
   if(u.shootT<=0&&ship){u.shootT=u.small?.9:1.4;const a=u.small?Math.atan2(ship.y-u.y,ship.x-u.x)+R(-10,10)/100:Math.random()*Math.PI*2;sb.push({x:u.x,y:u.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,t:1.6});env.beep(500,.08,'square',.025,.6);}
   if(Math.floor(t*10)%2===0&&Math.random()<dt*8)env.beep(u.small?900:520,.08,'triangle',.015);
   const hit=bullets.find(b=>Math.hypot(b.x-u.x,b.y-u.y)<(u.small?10:16));if(hit){hit.t=0;u.dead=true;const pts=(u.small?10000:2000)*G.level;G.score+=pts;FX.burst(u.x,u.y,['#3fe0ff','#fff','#ff4fd8'],30,200,.9,3);FX.shake(6);env.noise(.6,.09,900);burst(u.x,u.y,'#3fe0ff');}
   if(rocks.some(r=>Math.hypot(r.x-u.x,r.y-u.y)<r.r+8)){u.dead=true;FX.burst(u.x,u.y,['#3fe0ff','#fff'],20,160,.7,2);}}
  saucers=saucers.filter(u=>!u.dead&&u.x>-40&&u.x<W+40);
  for(const b of sb){b.x=(b.x+b.vx*dt+W)%W;b.y=(b.y+b.vy*dt+H)%H;b.t-=dt;}sb=sb.filter(b=>b.t>0);
  if(ship&&ship.inv<=0&&(sb.some(b=>Math.hypot(b.x-ship.x,b.y-ship.y)<10)||saucers.some(u=>Math.hypot(u.x-ship.x,u.y-ship.y)<(u.small?14:20)))){sb=[];burst(ship.x,ship.y,'#ffe45e',30);FX.lines(ship.x,ship.y,'#ffc94a',10);FX.shake(12);env.noise(1,.12,700);G.lives--;ship=null;
   if(G.lives<=0){banner={t:1.5,text:'GAME OVER',sub:'',then:()=>G.over=true};}else banner={t:1.4,text:'GET READY',sub:`${G.lives} SHIP${G.lives>1?'S':''} LEFT`,then:spawnShip};}
  // ---- heartbeat: speeds up as the rocks thin out ----
  beatT-=dt;if(beatT<=0&&rocks.length){beatT=.28+.8*Math.min(1,rocks.length/(4+G.level*3));env.beep(beatHi?62:52,.13,'square',.08);beatHi=!beatHi;}
  if(G.score>=nextLife){G.lives++;nextLife+=50000;env.beep(1500,.3,'triangle',.05,1.2);}
  if(!rocks.length&&!banner){const b=5000*G.level;G.score+=b;banner={t:2.2,text:`LEVEL ${G.level} CLEAR!`,sub:`+${fmtN(b)} bonus`,then:()=>{G.level++;level();if(ship)ship.inv=2;}};}};
 G._clear=()=>{rocks=[];};
 G.render=ctx=>{const[ox,oy]=FX.offset();ctx.save();ctx.translate(ox,oy);ctx.fillStyle='#03041a';ctx.fillRect(-20,-20,W+40,H+40);for(const[x,y,b]of stars){ctx.fillStyle=`rgba(170,190,255,${.25+b*.6})`;ctx.fillRect(x,y,b>.85?2:1,b>.85?2:1);}
  ctx.save();ctx.lineJoin='round';ctx.shadowBlur=14;ctx.lineWidth=2.5;
  ctx.shadowColor='#ff5a1c';ctx.strokeStyle='#ff9a3c';for(const r of rocks){ctx.beginPath();r.pts.forEach(([px,py],i)=>{const c=Math.cos(r.rot),s=Math.sin(r.rot),x=r.x+px*c-py*s,y=r.y+px*s+py*c;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.stroke();}
  ctx.shadowColor='#4f7bff';ctx.strokeStyle='#d6e2ff';for(const b of bullets){ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.015,b.y-b.vy*.015);ctx.stroke();}
  if(ship&&!(ship.inv>0&&Math.floor(ship.inv*8)%2)){ctx.shadowColor='#ffb000';ctx.strokeStyle='#ffc94a';const a=ship.a,pt=(d,o)=>[ship.x+Math.cos(a+o)*d,ship.y+Math.sin(a+o)*d];ctx.beginPath();ctx.moveTo(...pt(16,0));ctx.lineTo(...pt(12,2.5));ctx.lineTo(...pt(5,Math.PI));ctx.lineTo(...pt(12,-2.5));ctx.closePath();ctx.stroke();}
  for(const p of parts){ctx.shadowColor=p.c;ctx.fillStyle=p.c;ctx.globalAlpha=p.t/.7;ctx.fillRect(p.x-1.5,p.y-1.5,3,3);}ctx.globalAlpha=1;
  ctx.shadowColor='#3fe0ff';ctx.strokeStyle='#bff4ff';for(const u of saucers){const k=u.small?.55:1;ctx.beginPath();ctx.moveTo(u.x-18*k,u.y);ctx.lineTo(u.x+18*k,u.y);ctx.lineTo(u.x+9*k,u.y+7*k);ctx.lineTo(u.x-9*k,u.y+7*k);ctx.closePath();ctx.moveTo(u.x-18*k,u.y);ctx.lineTo(u.x-9*k,u.y-6*k);ctx.lineTo(u.x+9*k,u.y-6*k);ctx.lineTo(u.x+18*k,u.y);ctx.moveTo(u.x-6*k,u.y-6*k);ctx.lineTo(u.x-3*k,u.y-12*k);ctx.lineTo(u.x+3*k,u.y-12*k);ctx.lineTo(u.x+6*k,u.y-6*k);ctx.stroke();}
  ctx.fillStyle='#ff4fd8';for(const b of sb)ctx.fillRect(b.x-2,b.y-2,4,4);
  ctx.restore();FX.render(ctx);ctx.restore();
  ctx.save();ctx.shadowColor='#4f7bff';ctx.shadowBlur=8;Retro.text(ctx,String(G.score),20,12,3,'#d6e2ff');Retro.text(ctx,String(Math.max(G.score,env.hi())),W/2,12,2,'#9aa3c7','center');ctx.restore();
  ctx.strokeStyle='#ffc94a';ctx.lineWidth=2;for(let i=0;i<Math.min(6,G.lives);i++){const x=26+i*20,y=52;ctx.beginPath();ctx.moveTo(x,y-9);ctx.lineTo(x+6,y+7);ctx.lineTo(x,y+3);ctx.lineTo(x-6,y+7);ctx.closePath();ctx.stroke();}
  drawBanner(ctx,W,H,banner);};
 const rk=(r)=>(c,x,y)=>{c.save();c.strokeStyle='#ff9a3c';c.shadowColor='#ff5a1c';c.shadowBlur=10;c.lineWidth=2;c.beginPath();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,rr=r*(i%3?1:.75);i?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.stroke();c.restore();};
 const sc=(k)=>(c,x,y)=>{c.save();c.strokeStyle='#bff4ff';c.shadowColor='#3fe0ff';c.shadowBlur=10;c.lineWidth=2;c.beginPath();c.moveTo(x-18*k,y);c.lineTo(x+18*k,y);c.lineTo(x+9*k,y+7*k);c.lineTo(x-9*k,y+7*k);c.closePath();c.moveTo(x-18*k,y);c.lineTo(x-9*k,y-6*k);c.lineTo(x+9*k,y-6*k);c.lineTo(x+18*k,y);c.stroke();c.restore();};
 const legend=[{name:'LARGE',pts:'500',draw:rk(16)},{name:'MEDIUM',pts:'1,000',draw:rk(11)},{name:'SMALL',pts:'2,000',draw:rk(6)},{name:'SAUCER',pts:'2,000',draw:sc(.8)},{name:'MINI SAUCER',pts:'10,000',draw:sc(.45)}].map(e=>({...e,color:'#d6e2ff'}));
 return Retro.intro(G,{title:'METEOR STORM',color:'#ff9a3c',sub:'BLAST THE ROCKS - DODGE THE SAUCERS',tableTitle:'POINTS PER LEVEL',legend,stars:true,bg:'#03041a',hi:env.hi,hint:'LEFT RIGHT ROTATE - UP THRUST - SPACE FIRE - DOWN HYPERSPACE'});}

// =====================================================================================================
// 4. PLANET GUARDIAN (side-scrolling retro shooter in the classic style: scanner, landers, smart bombs)
// =====================================================================================================
function makeGuardian(env){
 const W=800,H=450,WW=3600,TOP=58,GROUND=H-6,G={W,H,score:0,lives:3,level:1,levelName:'Wave',over:false};
 const FX=Retro.fx(),PTS={L:1500,M:1500,B:2000,O:2500,P:10000,S:1500};
 const SP={
  L:["...ggg...","..gyyyg..",".gg.y.gg.","ggggggggg","g.g.g.g.g",".g..g..g.","g...g...g"],
  M:["...ppp...","..prrrp..",".pp.r.pp.","pgpgpgpgp","p.g.g.g.p",".p..p..p.","p...p...p"],
  B:["...ggggggg...",".ggggggggggg.","gg.gg.g.gg.gg",".ggggggggggg.","...ggggggg..."],
  O:["ppppppp","p.ppp.p","ppp.ppp","pp...pp","ppp.ppp","p.ppp.p","ppppppp"],
  P:["...r...",".p.r.p.","..prp..","rrrrrrr","..prp..",".p.r.p.","...r..."],
  S:[".rrr.","rryrr",".r.r."],
  H:[".k.","bbb","bbb",".b.","b.b","b.b"],
  ship:["....mmm...........","..wwwwwwwww.......","wwwwwwwwwwwwwwww..","cccwwwwwwwwwwwwwww","wwwwwwwwwwwwwww...","..mm.............."]};
 const PAL={L:{g:'#3cff6a',y:'#ffe45e'},M:{p:'#d06bff',g:'#3cff6a',r:'#ff2d55'},B:{g:'#9dff2e'},O:{p:'#b45bd6'},P:{p:'#ff4fd8',r:'#ff2d55'},S:{r:'#ff2d55',y:'#ffe45e'},H:{k:'#ffd3a0',b:'#64d9f5'},ship:{w:'#e6e9f2',m:'#ff4fd8',c:'#3fe0ff'}};
 const COL={L:['#3cff6a','#ffe45e','#fff'],M:['#d06bff','#3cff6a','#ff2d55'],B:['#9dff2e','#fff'],O:['#b45bd6','#ff4fd8'],P:['#ff4fd8','#ff2d55','#ffe45e'],S:['#ff2d55','#ffe45e']};
 // ---- jagged mountain line ----
 const STEP=4,N=WW/STEP,hts=new Float32Array(N+1);
 {let base=24;for(let i=0;i<=N;i++){base=clamp(base+(Math.random()<.5?-2:2),12,40);hts[i]=base;}
  for(let k=0;k<10;k++){const c=R(0,N),w=R(35,110),h=R(55,150);for(let i=-w;i<=w;i++){const j=((c+i)%N+N)%N;hts[j]=Math.max(hts[j],h*(1-Math.abs(i)/w)+(Math.random()<.5?0:2));}}hts[N]=hts[0];}
 const gy=x=>{x=((x%WW)+WW)%WW;return GROUND-hts[Math.floor(x/STEP)];};
 const dx=(a,b)=>{let d=((a-b)%WW+WW)%WW;if(d>WW/2)d-=WW;return d;},wrap=x=>((x%WW)+WW)%WW;
 const stars=Array.from({length:90},()=>({x:R(0,WW),y:R(TOP+6,H-60),c:pick(['#fff','#3fe0ff','#ffe45e','#ff4fd8','#3cff6a']),tw:Math.random()*6}));
 let ship={x:300,y:200,face:1,vx:0,inv:2},camX=0,lasers=[],en=[],eb=[],mines=[],people=[],pops=[],bombs=3,banner=null,waveT=0,baiterT=0,spawnQ=0,spawnT=0,planetGone=false,tally=null,cool=0,heldB=false,respawnT=0,nextLife=100000,t=0;
 function spawnPeople(){people=Array.from({length:8},(_,i)=>{const x=wrap((i+.5)*WW/8+R(-120,120));return{x,y:gy(x),st:'ground',vy:0,walk:pick([-1,1])*R(6,14),fromY:0};});}
 const away=()=>{let x;do{x=R(0,WW);}while(ship&&Math.abs(dx(x,ship.x))<420);return x;};
 const add=(type,x,y)=>en.push({type,x,y,vx:pick([-1,1])*R(30,60),vy:0,st:'hunt',target:null,carry:null,shootT:R(1.5,4),ph:Math.random()*6});
 function startWave(){en=[];eb=[];mines=[];waveT=0;baiterT=0;bombs=Math.max(bombs,3);spawnQ=Math.min(25,5+G.level*3);spawnT=0;
  for(let i=0;i<Math.min(4,1+Math.floor(G.level/2));i++)add('O',away(),R(TOP+40,H-150));
  for(let i=0;i<Math.min(3,Math.ceil(G.level/2));i++)add('P',away(),R(TOP+30,H-160));
  if(!people.some(p=>p.st!=='lost')){spawnPeople();planetGone=false;}}
 spawnPeople();startWave();
 const pop=(x,y,txt)=>pops.push({x,y,txt,t:1});
 function kill(e,how){G.score+=PTS[e.type]*(how==='bomb'?1:1);FX.burst(e.x,e.y,COL[e.type],30,220,.9,3);FX.shake(4);env.noise(.35,.07,900);pop(e.x,e.y-14,fmtN(PTS[e.type]));
  if(e.carry){e.carry.st='fall';e.carry.vy=0;e.carry.fromY=e.carry.y;e.carry=null;env.beep(1400,.6,'sine',.03,.3);}
  if(e.type==='P')for(let i=0;i<5;i++)en.push({type:'S',x:wrap(e.x+R(-12,12)),y:e.y+R(-12,12),vx:R(-120,120),vy:R(-120,120),shootT:R(2,4),ph:0});}
 function loseShip(){FX.burst(ship.x,ship.y,['#fff','#ff4fd8','#3fe0ff','#ffe45e'],80,320,1.6,4);FX.lines(ship.x,ship.y,'#e6e9f2',14);FX.shake(14);FX.flash(.12);env.noise(1.1,.12,600);
  G.lives--;eb=[];mines=[];const sx=ship.x;ship=null;if(G.lives<=0){banner={t:2.5,text:'GAME OVER',color:'#ff2d55',then:()=>G.over=true};}else{respawnT=2;banner={t:1.6,text:'GET READY',sub:`${G.lives} SHIP${G.lives>1?'S':''} LEFT`,then:()=>{ship={x:sx,y:180,face:1,vx:0,inv:2.5};}};}}
 function smartBomb(){if(!ship||bombs<=0)return;bombs--;FX.flash(.3);FX.shake(10);env.noise(.9,.14,400);const mid=camX+W/2;
  for(const e of en.slice())if(Math.abs(dx(e.x,mid))<W/2+20){kill(e,'bomb');e.dead=true;}en=en.filter(e=>!e.dead);eb=eb.filter(b=>Math.abs(dx(b.x,mid))>W/2);}
 G.update=(dt,inp)=>{t+=dt;FX.update(dt);pops.forEach(p=>{p.t-=dt;p.y-=20*dt;});pops=pops.filter(p=>p.t>0);
  if(tally){tally.t+=dt;const step=.3;while(tally.shown<tally.n&&tally.t>.8+tally.shown*step){tally.shown++;G.score+=tally.each;env.beep(700+tally.shown*80,.12,'square',.04,1.2);}
   if(tally.t>.8+tally.n*step+2.2){tally=null;G.level++;startWave();banner={t:1.6,text:`WAVE ${G.level}`,sub:'GET READY'};}return;}
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}if(!ship)return;}
  waveT+=dt;
  // ---- ship ----
  if(ship){if(inp.r&&ship.face<0)ship.face=1;else if(inp.l&&ship.face>0)ship.face=-1;const thrust=(ship.face>0&&inp.r)||(ship.face<0&&inp.l);
   ship.vx+=thrust?ship.face*900*dt:-Math.sign(ship.vx)*Math.min(Math.abs(ship.vx),500*dt);ship.vx=clamp(ship.vx,-560,560);ship.thrust=thrust;
   ship.x=wrap(ship.x+ship.vx*dt);ship.y=clamp(ship.y+(inp.d-inp.u)*300*dt,TOP+10,GROUND-6);if(ship.inv>0)ship.inv-=dt;
   cool-=dt;if(inp.f&&cool<=0){cool=.13;lasers.push({x:ship.x+ship.face*20,y:ship.y+1,dir:ship.face,head:0,life:.45,seed:Math.random()*99});env.beep(1800,.07,'square',.025,.25);}
   if(inp.b&&!heldB)smartBomb();heldB=inp.b;}
  const target=ship?ship.x-(ship.face>0?W*.28:W*.72):camX;camX=wrap(camX+dx(target,camX)*Math.min(1,dt*3.2));
  for(const l of lasers){l.head=Math.min(760,l.head+2400*dt);l.life-=dt;}lasers=lasers.filter(l=>l.life>0);
  // ---- spawning ----
  spawnT-=dt;if(spawnQ>0&&spawnT<=0){const n=Math.min(spawnQ,5);for(let i=0;i<n;i++)add(planetGone?'M':'L',away(),R(TOP+12,TOP+80));spawnQ-=n;spawnT=9;env.beep(220,.3,'triangle',.04,2);}
  if(waveT>30){baiterT-=dt;if(baiterT<=0&&ship){baiterT=Math.max(6,12-G.level);en.push({type:'B',x:wrap(ship.x+pick([-1,1])*W*.7),y:R(TOP+20,H-120),vx:0,vy:0,shootT:1,ph:0});}}
  // ---- enemies ----
  for(const e of en){e.shootT-=dt;e.ph+=dt;const sxd=ship?dx(ship.x,e.x):0;
   if(e.type==='L'){if(e.st==='hunt'){if(!e.target||e.target.st!=='ground'){const free=people.filter(p=>p.st==='ground'&&!en.some(o=>o!==e&&o.target===p));e.target=free.length?free.sort((a,b)=>Math.abs(dx(a.x,e.x))-Math.abs(dx(b.x,e.x)))[0]:null;}
     if(e.target){const d=dx(e.target.x,e.x);e.vx=clamp(d*1.5,-(60+G.level*6),60+G.level*6);const hover=gy(e.x)-95;e.vy=Math.abs(d)<24?55:clamp((hover-e.y)*1.5,-50,50);
      if(Math.abs(d)<6&&e.y>=e.target.y-20){e.st='up';e.carry=e.target;e.target.st='carried';e.vx=0;env.beep(300,.5,'sine',.04,2.5);}}
     else{e.vy=Math.sin(e.ph)*30;}}
    else{e.vy=-(42+G.level*3);e.vx=Math.sin(e.ph*3)*20;if(e.carry){e.carry.x=e.x;e.carry.y=e.y+18;}if(e.y<TOP+16){e.type='M';e.st='m';if(e.carry){e.carry.st='lost';e.carry=null;}env.beep(90,.6,'sawtooth',.05,.5);FX.burst(e.x,e.y,COL.M,16,120);}}}
   else if(e.type==='M'){const sp=190+G.level*10;e.vx+=(Math.sign(sxd)*sp*2.2-e.vx)*dt*2;e.vy=ship?clamp((ship.y-e.y)*2,-150,150)+Math.sin(e.ph*14)*120:Math.sin(e.ph*8)*100;}
   else if(e.type==='B'){e.vx+=(Math.sign(sxd)*420-e.vx)*dt*1.6;e.vy=ship?clamp((ship.y-e.y)*1.8,-200,200):0;}
   else if(e.type==='O'){e.vx=e.vx>0?40:-40;e.vy=Math.sin(e.ph*1.4)*40;if(Math.random()<dt*.7)mines.push({x:e.x,y:e.y,t:7});}
   else if(e.type==='P'){e.vy=Math.sin(e.ph)*20;e.vx=e.vx>0?28:-28;}
   else if(e.type==='S'&&ship){e.vx=clamp(e.vx+Math.sign(sxd)*520*dt,-320,320);e.vy=clamp(e.vy+Math.sign(ship.y-e.y)*420*dt,-220,220);}
   e.x=wrap(e.x+e.vx*dt);e.y=clamp(e.y+e.vy*dt,TOP+8,H-14);
   const onScreen=Math.abs(dx(e.x,camX+W/2))<W/2;
   if(ship&&onScreen&&e.shootT<=0&&e.type!=='O'&&e.type!=='P'){e.shootT=(e.type==='B'?.8:e.type==='S'?2.5:R(2,4))/Math.min(2,1+G.level*.08);const a=Math.atan2(ship.y-e.y,dx(ship.x,e.x)),s=180+G.level*10;eb.push({x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:3});}}
  for(const b of eb){b.x=wrap(b.x+b.vx*dt);b.y+=b.vy*dt;b.t-=dt;}eb=eb.filter(b=>b.t>0&&b.y>TOP&&b.y<H);
  for(const m of mines)m.t-=dt;mines=mines.filter(m=>m.t>0);
  // ---- humanoids ----
  for(const p of people){if(p.st==='ground'){p.x=wrap(p.x+p.walk*dt);p.y=gy(p.x);if(Math.random()<dt*.2)p.walk*=-1;}
   else if(p.st==='fall'){p.vy=Math.min(220,p.vy+160*dt);p.y+=p.vy*dt;
    if(ship&&Math.abs(dx(p.x,ship.x))<18&&Math.abs(p.y-ship.y)<16){p.st='ship';G.score+=5000;pop(p.x,p.y-12,'5,000');env.beep(1200,.25,'triangle',.05,1.5);}
    else if(p.y>=gy(p.x)){p.y=gy(p.x);p.st='ground';if(p.y-p.fromY>60){G.score+=2500;pop(p.x,p.y-20,'2,500');}}}
   else if(p.st==='ship'){if(!ship){p.st='fall';p.vy=0;p.fromY=p.y;continue;}p.x=ship.x;p.y=ship.y+12;if(ship.y>=gy(ship.x)-26){p.st='ground';p.y=gy(p.x);G.score+=5000;pop(p.x,p.y-20,'5,000');env.beep(1500,.25,'triangle',.05,1.5);}}}
  if(!planetGone&&!people.some(p=>p.st!=='lost')){planetGone=true;FX.flash(.6);FX.shake(20);env.noise(2,.15,300);en.forEach(e=>{if(e.type==='L'){e.type='M';e.carry=null;}});banner={t:2.4,text:'PLANET DESTROYED',color:'#ff2d55',sub:'THE LANDERS HAVE TURNED INTO MUTANTS'};}
  // ---- laser hits ----
  for(const l of lasers)for(const e of en){if(e.dead)continue;const d=dx(e.x,l.x)*l.dir;if(d>=-6&&d<=l.head&&Math.abs(e.y-l.y)<10){e.dead=true;kill(e);l.head=Math.max(0,d);}}
  en=en.filter(e=>!e.dead);
  // ---- ship hit ----
  if(ship&&ship.inv<=0&&(en.some(e=>Math.abs(dx(e.x,ship.x))<16&&Math.abs(e.y-ship.y)<10)||eb.some(b=>Math.abs(dx(b.x,ship.x))<12&&Math.abs(b.y-ship.y)<7)||mines.some(m=>Math.abs(dx(m.x,ship.x))<10&&Math.abs(m.y-ship.y)<8)))loseShip();
  if(G.score>=nextLife){nextLife+=100000;G.lives++;bombs++;env.beep(1500,.5,'triangle',.06,1.4);pop(ship?ship.x:camX+W/2,TOP+40,'BONUS SHIP');}
  // ---- wave complete ----
  if(ship&&!banner&&spawnQ===0&&!en.some(e=>e.type==='L'||e.type==='M')){const n=people.filter(p=>p.st!=='lost').length;tally={t:0,n,shown:0,each:1000*Math.min(G.level,5)};eb=[];mines=[];en=[];env.beep(660,.4,'triangle',.05,2);}};
 G._clear=()=>{en=en.filter(e=>e.type!=='L'&&e.type!=='M');spawnQ=0;};
 // ---------- drawing ----------
 const sx=x=>{let d=dx(x,camX);return d<-80?d+WW:d;};
 function drawLaser(ctx,l){const x0=sx(l.x),len=l.head,tail=Math.max(0,len-560);let k=0;
  for(let d=tail;d<len;d+=4+((Math.sin(l.seed+d*.37)+1)*5)){const seg=6+((Math.cos(l.seed+d*.21)+1)*7);if(Math.sin(l.seed*3+d*.9)>.55){k++;continue;}
   ctx.fillStyle=d>len-30?'#fff':Retro.CYCLE[(k+++Math.floor(l.seed))%Retro.CYCLE.length];ctx.globalAlpha=Math.max(.25,l.life/.45);const a=x0+l.dir*d;ctx.fillRect(l.dir>0?a:a-seg,l.y-1,seg,2);}ctx.globalAlpha=1;}
 G.render=ctx=>{const[ox,oy]=FX.offset();ctx.save();ctx.translate(ox,oy);ctx.fillStyle='#000';ctx.fillRect(-20,-20,W+40,H+40);
  for(const s of stars){const X=((s.x-camX*.5)%WW+WW)%WW;if(X>W)continue;if(Math.floor(t*3+s.tw)%7===0)continue;ctx.fillStyle=s.c;ctx.fillRect(X,s.y,1.5,1.5);}
  if(!planetGone){ctx.strokeStyle='#c8641e';ctx.lineWidth=2;ctx.beginPath();for(let X=0;X<=W;X+=4){const y=Math.round(gy(camX+X));X?ctx.lineTo(X,y):ctx.moveTo(X,y);}ctx.stroke();}
  for(const p of people)if(p.st!=='lost'){const X=sx(p.x);if(X>-10&&X<W+10)Retro.spr(ctx,SP.H,X-3,p.y-12,2,PAL.H);}
  for(const m of mines){const X=sx(m.x);if(X<-6||X>W+6)continue;ctx.fillStyle=Math.floor(t*10)%2?'#b45bd6':'#ff4fd8';ctx.fillRect(X-2,m.y-2,4,4);}
  for(const e of en){const X=sx(e.x);if(X<-30||X>W+30)continue;const sp=SP[e.type],sc=e.type==='S'?2:2.4;let pal=PAL[e.type];if(e.type==='M'&&Math.floor(t*8)%2)pal={p:'#3cff6a',g:'#d06bff',r:'#ffe45e'};
   Retro.spr(ctx,sp,X-Retro.sprW(sp,sc)/2,e.y-Retro.sprH(sp,sc)/2,sc,pal);}
  for(const b of eb){const X=sx(b.x);ctx.fillStyle=Math.floor(t*16)%2?'#fff':'#ffe45e';ctx.fillRect(X-2,b.y-2,4,4);}
  for(const l of lasers)drawLaser(ctx,l);
  if(ship&&!(ship.inv>0&&Math.floor(ship.inv*10)%2)){const X=sx(ship.x),f=ship.face<0,sc=2;Retro.spr(ctx,SP.ship,X-18,ship.y-6,sc,PAL.ship,f);
   if(ship.thrust){const fl=R(6,16);ctx.fillStyle=Math.random()<.5?'#ff8a1c':'#ffe45e';ctx.fillRect(f?X+18:X-18-fl,ship.y,fl,3);}}
  FX.render(ctx,camX,WW);
  for(const p of pops){ctx.globalAlpha=Math.min(1,p.t*2);Retro.text(ctx,p.txt,sx(p.x),p.y,1,'#ffe45e','center');}ctx.globalAlpha=1;
  ctx.restore();
  // ---- HUD + scanner ----
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,TOP-2);ctx.fillStyle='#3b2bff';ctx.fillRect(0,TOP-3,W,2);
  const S0=W/2-190,SW=380,SY=4,SH=TOP-10;ctx.fillStyle='#3b2bff';ctx.fillRect(S0-2,SY,2,SH+3);ctx.fillRect(S0+SW,SY,2,SH+3);
  const mx=x=>S0+((dx(x,ship?ship.x:camX+W/2)+WW/2)/WW)*SW,my=y=>SY+3+(y-TOP)/(H-TOP)*(SH-6);
  if(!planetGone){ctx.strokeStyle='#c8641e';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<=120;k++){const wx=(ship?ship.x:camX+W/2)-WW/2+k*WW/120,X=S0+k*SW/120,Y=my(gy(wx));k?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();}
  for(const p of people)if(p.st!=='lost'){ctx.fillStyle='#ff4fd8';ctx.fillRect(mx(p.x)-1,my(p.y)-1,2,2);}
  for(const e of en){ctx.fillStyle=COL[e.type][0];ctx.fillRect(mx(e.x)-1.5,my(e.y)-1.5,3,3);}
  if(ship){ctx.fillStyle='#fff';ctx.fillRect(mx(ship.x)-2,my(ship.y)-1,5,3);}
  const vx0=mx(camX),vw=W/WW*SW;ctx.fillStyle='#fff';ctx.fillRect(vx0,SY,vw,2);ctx.fillRect(vx0,SY+SH,vw,2);ctx.fillRect(vx0,SY,2,5);ctx.fillRect(vx0+vw-2,SY,2,5);ctx.fillRect(vx0,SY+SH-3,2,5);ctx.fillRect(vx0+vw-2,SY+SH-3,2,5);
  for(let i=0;i<Math.min(5,G.lives);i++)Retro.spr(ctx,SP.ship,10+i*30,6,1.4,PAL.ship);
  for(let i=0;i<Math.min(5,bombs);i++){ctx.fillStyle='#fff';ctx.fillRect(S0-30,8+i*8,8,5);ctx.fillStyle='#ff2d55';ctx.fillRect(S0-28,9+i*8,4,3);}
  Retro.text(ctx,String(G.score),S0-42,30,2,Retro.cyc(t*.5),'right');
  Retro.text(ctx,`WAVE ${G.level}`,W-12,10,2,'#3fe0ff','right');Retro.text(ctx,`HUMANOIDS ${people.filter(p=>p.st!=='lost').length}`,W-12,32,1,'#ff4fd8','right');
  if(tally){ctx.fillStyle='rgba(0,0,0,.9)';ctx.fillRect(0,TOP,W,H-TOP);Retro.text(ctx,'ATTACK WAVE '+G.level,W/2,TOP+70,4,'#3fe0ff','center');Retro.text(ctx,'COMPLETED',W/2,TOP+115,4,'#3fe0ff','center');
   Retro.text(ctx,`BONUS X ${fmtN(tally.each)}`,W/2,TOP+200,3,'#3fe0ff','center');for(let i=0;i<tally.shown;i++)Retro.spr(ctx,SP.H,W/2-tally.n*11+i*22,TOP+250,3,PAL.H);
   if(!tally.n)Retro.text(ctx,'NO HUMANOIDS SAVED',W/2,TOP+255,2,'#ff2d55','center');}
  if(banner)Retro.banner(ctx,W,H,{...banner,t});FX.renderFlash(ctx,W,H);};
 const legend=[['L','LANDER'],['M','MUTANT'],['B','BAITER'],['O','BOMBER'],['P','POD'],['S','SWARMER']].map(([k,n])=>({name:n,pts:fmtN(PTS[k]),color:'#b45bd6',draw:(ctx,x,y,tt)=>{let pal=PAL[k];if(k==='M'&&Math.floor(tt*8)%2)pal={p:'#3cff6a',g:'#d06bff',r:'#ffe45e'};Retro.spr(ctx,SP[k],x-Retro.sprW(SP[k],3)/2,y-Retro.sprH(SP[k],3)/2,3,pal);}}));
 return Retro.intro(G,{title:'PLANET GUARDIAN',color:'#ff2d55',sub:'PROTECT THE HUMANOIDS',tableTitle:'SCANNER',legend,stars:true,hi:env.hi,hint:'ARROWS FLY AND TURN - SPACE FIRE - B SMART BOMB - CATCH FALLING HUMANOIDS',onStart:()=>env.beep(440,.4,'square',.05,2)});}

// =====================================================================================================
const GAMES={invaders:makeInvaders,maze:makeMaze,meteor:makeMeteor,guardian:makeGuardian};

// =====================================================================================================
// 5. LADDER DASH (climb the girders, jump the rolling barrels, reach the trophy)
// =====================================================================================================
function makeLadder(env){
 const W=480,H=580,G={W,H,score:0,lives:3,level:1,levelName:'Level',over:false};
 const GIR=[{a:0,b:480,yl:552,yr:552},{a:50,b:480,yl:470,yr:452},{a:0,b:430,yl:362,yr:380},{a:50,b:480,yl:290,yr:272},{a:0,b:430,yl:182,yr:200},{a:150,b:330,yl:104,yr:104}];
 const LAD=[{x:420,g:0},{x:110,g:1},{x:300,g:1},{x:400,g:2},{x:90,g:3},{x:250,g:3},{x:310,g:4}];
 const gy=(g,x)=>{const r=GIR[g];return r.yl+(r.yr-r.yl)*(clamp(x,r.a,r.b)-r.a)/(r.b-r.a);};
 const slope=g=>Math.sign(GIR[g].yr-GIR[g].yl);
 const FX=Retro.fx();let p,bar=[],stars=[],hammers=[],fires=[],hammerT=0,bonus=5000,bonusTick=2,drumFlame=0,t=0,spawn=1.5,deathT=0,held=false,pops=[],banner={t:1.8,text:'LEVEL 1',sub:'HOW HIGH CAN YOU GET?'};
 function reset(){p={x:40,g:0,y:gy(0,40),st:'walk',vy:0,lad:null,face:1};bar=[];fires=[];hammerT=0;bonus=5000*G.level;bonusTick=2;hammers=[{g:1,x:380,got:false},{g:3,x:150,got:false}];spawn=1.5;stars=[1,2,3,4].sort(()=>Math.random()-.5).slice(0,3).map(g=>{const r=GIR[g],x=R(r.a+40,r.b-40);return{g,x,got:false};});}
 reset();
 const spd=()=>105+G.level*18;
 G.update=(dt,inp)=>{t+=dt;FX.update(dt);if(drumFlame>0)drumFlame-=dt;pops.forEach(q=>q.t-=dt);pops=pops.filter(q=>q.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  if(deathT>0){deathT-=dt;if(deathT<=0){if(G.lives<=0)G.over=true;else reset();}return;}
  const jump=inp.f&&!held&&hammerT<=0;held=inp.f;if(hammerT>0)hammerT-=dt;bonusTick-=dt;if(bonusTick<=0){bonusTick=2;bonus=Math.max(0,bonus-100*G.level);}
  if(p.st==='walk'){const r=GIR[p.g];p.x=clamp(p.x+(inp.r-inp.l)*135*dt,r.a+8,r.b-8);if(inp.r)p.face=1;if(inp.l)p.face=-1;p.y=gy(p.g,p.x);
   const up=LAD.find(l=>l.g===p.g&&Math.abs(l.x-p.x)<11),down=LAD.find(l=>l.g===p.g-1&&Math.abs(l.x-p.x)<11);
   if(inp.u&&up){p.st='climb';p.lad=up;p.x=up.x;}else if(inp.d&&down){p.st='climb';p.lad=down;p.x=down.x;p.g=down.g;}
   else if(jump){p.st='jump';p.vy=-300;p.jx=(inp.r-inp.l)||0;env.beep(600,.1,'square',.03,1.6);}}
  else if(p.st==='climb'){const l=p.lad,bot=gy(l.g,l.x),top=gy(l.g+1,l.x);p.y=clamp(p.y+(inp.d-inp.u)*95*dt,top,bot);p.g=l.g;
   if(p.y<=top+.5&&inp.u){p.g=l.g+1;p.st='walk';p.lad=null;if(p.g===5){const b=5000*G.level+bonus;G.score+=b;env.beep(880,.4,'triangle',.06,1.8);FX.burst(305,90,['#ffe45e','#ff2d55','#3fe0ff','#fff'],60,240,1.4,3);banner={t:2.4,text:`LEVEL ${G.level} CLEAR!`,sub:`TROPHY + TIME BONUS ${fmtN(b)}`,then:()=>{G.level++;reset();banner={t:1.4,text:`LEVEL ${G.level}`,sub:'Faster barrels!'};}};return;}}
   else if(p.y>=bot-.5&&inp.d){p.st='walk';p.lad=null;}}
  else if(p.st==='jump'){const r=GIR[p.g];p.x=clamp(p.x+p.jx*135*dt,r.a+8,r.b-8);p.vy+=900*dt;p.y+=p.vy*dt;const gnd=gy(p.g,p.x);if(p.vy>0&&p.y>=gnd){p.y=gnd;p.st='walk';}}
  // barrels
  spawn-=dt;if(spawn<=0){spawn=Math.max(.9,2.6-G.level*.25)*(0.7+Math.random()*.6);bar.push({x:205,g:4,y:gy(4,205),dir:slope(4),st:'roll',vy:0,lad:null,tried:new Set(),jumped:false,rot:0});}
  for(const b of bar){b.rot+=dt*8*b.dir;
   if(b.st==='roll'){b.x+=b.dir*spd()*dt;const r=GIR[b.g];b.y=gy(b.g,b.x);
    const l=LAD.find(l=>l.g===b.g-1&&Math.abs(l.x-b.x)<3&&!b.tried.has(l));if(l){b.tried.add(l);if(Math.random()<.28){b.st='ladder';b.lad=l;b.x=l.x;}}
    if(b.x>r.b||b.x<r.a||(b.g===0&&b.x<24)){if(b.g===0){b.gone=true;drumFlame=.8;env.noise(.4,.05,600);if(fires.length<Math.min(3,G.level))fires.push({x:30,g:0,dir:1,climb:null,y:gy(0,30)});}else{b.st='fall';b.vy=0;}}}
   else if(b.st==='fall'){b.x+=b.dir*45*dt;b.vy+=700*dt;b.y+=b.vy*dt;const ng=b.g-1;if(b.y>=gy(ng,b.x)&&b.x>=GIR[ng].a-5&&b.x<=GIR[ng].b+5){b.g=ng;b.st='roll';const s=slope(ng);if(s)b.dir=s;b.y=gy(ng,b.x);}else if(b.y>H+30)b.gone=true;}
   else if(b.st==='ladder'){b.y+=spd()*.6*dt;const gnd=gy(b.lad.g,b.lad.x);if(b.y>=gnd){b.g=b.lad.g;b.y=gnd;b.st='roll';const s=slope(b.g);if(s)b.dir=s;}}
   if(b.x<-30||b.x>W+30)b.gone=true;
   // jump over = points
   if(!b.jumped&&p.st==='jump'&&b.st==='roll'&&b.g===p.g&&Math.abs(b.x-p.x)<14&&p.y<b.y-18){b.jumped=true;G.score+=1000*G.level;pops.push({x:p.x,y:p.y-40,t:.9,txt:'+'+fmtN(1000*G.level)});env.beep(1200,.12,'triangle',.05,1.3);}
   if(hammerT>0&&Math.hypot(b.x-(p.x+p.face*14),(b.y-10)-(p.y-24))<24){b.gone=true;G.score+=3000*G.level;pops.push({x:b.x,y:b.y-30,t:.9,txt:'+'+fmtN(3000*G.level)});FX.burst(b.x,b.y-10,['#b5651d','#ffe45e','#fff'],20,160,.6,3);env.noise(.3,.07,1200);continue;}
   if(Math.hypot(b.x-p.x,(b.y-10)-(p.y-15))<19){die();return;}}
  bar=bar.filter(b=>!b.gone);
  // hammers and fireballs
  for(const h of hammers)if(!h.got&&h.g===p.g&&Math.abs(h.x-p.x)<14&&p.st==='walk'){h.got=true;hammerT=9;env.beep(700,.3,'square',.05,1.8);}
  if(hammerT>0&&Math.floor(t*6)%2===0&&Math.random()<dt*12)env.beep(260,.04,'square',.02);
  for(const f of fires){const sp=45+G.level*8;if(f.climb){f.y-=sp*.5*dt;const top=gy(f.climb.g+1,f.climb.x);if(f.y<=top){f.g=f.climb.g+1;f.y=top;f.climb=null;}}
   else{f.x+=f.dir*sp*dt*(0.6+Math.random()*.8);const r=GIR[f.g];if(f.x<r.a+10){f.x=r.a+10;f.dir=1;}if(f.x>r.b-10){f.x=r.b-10;f.dir=-1;}f.y=gy(f.g,f.x);
    if(Math.random()<dt*.4)f.dir=Math.sign(p.x-f.x)||1;const l=f.g<2&&LAD.find(l=>l.g===f.g&&Math.abs(l.x-f.x)<2);if(l&&Math.random()<.3)f.climb=l;}
   if(Math.hypot(f.x-p.x,(f.y-9)-(p.y-15))<17){if(hammerT>0){f.dead=true;G.score+=3000*G.level;pops.push({x:f.x,y:f.y-30,t:.9,txt:'+'+fmtN(3000*G.level)});FX.burst(f.x,f.y-8,['#ff8a1c','#ffe45e'],24,170,.6,3);env.noise(.3,.07,1500);}else{die();return;}}}
  fires=fires.filter(f=>!f.dead);
  for(const s of stars)if(!s.got&&s.g===p.g&&Math.abs(s.x-p.x)<14&&p.st!=='climb'){s.got=true;G.score+=2000*G.level;pops.push({x:s.x,y:gy(s.g,s.x)-40,t:.9,txt:'+'+fmtN(2000*G.level)});env.beep(1500,.2,'triangle',.05,1.4);}};
 function die(){G.lives--;deathT=1.4;hammerT=0;env.beep(90,.6,'sawtooth',.07,.3);env.noise(.7,.09,800);FX.burst(p.x,p.y-15,['#fff','#ffe45e','#e51c35'],40,200,1,3);FX.shake(10);}
 G._state=()=>({g:p.g,st:p.st,x:Math.round(p.x),y:Math.round(p.y),barrels:bar.length});
 G._clear=()=>{p.g=5;p.x=200;p.y=gy(5,200);G.update(.016,{l:0,r:0,u:0,d:0,f:0});const b=5000*G.level;G.score+=b;banner={t:1.2,text:`LEVEL ${G.level} CLEAR!`,sub:'',then:()=>{G.level++;reset();}};};
 G.render=ctx=>{const[ox,oy]=FX.offset();ctx.save();ctx.translate(ox,oy);ctx.fillStyle='#000';ctx.fillRect(-20,-20,W+40,H+40);ctx.textAlign='center';ctx.textBaseline='middle';
  // height markers and the bonus box, like the old cabinets
  [1,2,3,4,5].forEach(g=>Retro.text(ctx,`${g*25}M`,GIR[g].a>20?6:GIR[g].b+6,gy(g,GIR[g].a>20?GIR[g].a:GIR[g].b)-24,1,'#3fe0ff'));
  // ladders
  ctx.strokeStyle='#3fe0ff';ctx.lineWidth=2.5;for(const l of LAD){const b=gy(l.g,l.x),t=gy(l.g+1,l.x);ctx.beginPath();ctx.moveTo(l.x-9,b);ctx.lineTo(l.x-9,t);ctx.moveTo(l.x+9,b);ctx.lineTo(l.x+9,t);for(let y=b-8;y>t;y-=10){ctx.moveTo(l.x-9,y);ctx.lineTo(l.x+9,y);}ctx.stroke();}
  // girders
  for(const r of GIR){ctx.fillStyle='#ff2d55';ctx.beginPath();ctx.moveTo(r.a,r.yl);ctx.lineTo(r.b,r.yr);ctx.lineTo(r.b,r.yr+9);ctx.lineTo(r.a,r.yl+9);ctx.closePath();ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=1.5;ctx.beginPath();for(let x=r.a;x<r.b;x+=16){const y=r.yl+(r.yr-r.yl)*(x-r.a)/(r.b-r.a);ctx.moveTo(x,y+1);ctx.lineTo(x+8,y+8);ctx.lineTo(x+16,y+1);}ctx.stroke();}
  ctx.font=`34px ${EMOJI_FONT}`;ctx.fillText('🦖',180,104-22);ctx.font=`26px ${EMOJI_FONT}`;ctx.fillText('🏆',305,104-16);
  ctx.font=`18px ${EMOJI_FONT}`;for(const s of stars)if(!s.got)ctx.fillText('⭐',s.x,gy(s.g,s.x)-16);
  for(const b of bar){ctx.save();ctx.translate(b.x,b.y-10);ctx.rotate(b.rot);ctx.fillStyle='#b5651d';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5b3010';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.stroke();ctx.restore();}
  if(!(deathT>0&&Math.floor(deathT*8)%2)){if(env.avatar&&env.avatar.complete)ctx.drawImage(env.avatar,p.x-14,p.y-36,28,35);else{ctx.font=`26px ${EMOJI_FONT}`;ctx.fillText('🧍',p.x,p.y-14);}}
  ctx.font='bold 15px monospace';ctx.fillStyle='#ffe45e';for(const q of pops){ctx.globalAlpha=Math.min(1,q.t*2);ctx.fillText(q.txt,q.x,q.y-(.9-q.t)*25);}ctx.globalAlpha=1;
  // oil drum + flame, hammers, fireballs, hammer swing
  const dy=gy(0,18);ctx.fillStyle='#2457d6';ctx.fillRect(4,dy-26,28,26);ctx.fillStyle='#fff';ctx.fillRect(4,dy-20,28,3);ctx.fillRect(4,dy-8,28,3);Retro.text(ctx,'OIL',18,dy-15,1,'#fff','center');
  if(drumFlame>0||Math.floor(t*6)%2){ctx.fillStyle=drumFlame>0?'#ffe45e':'#ff8a1c';ctx.beginPath();ctx.moveTo(8,dy-26);ctx.lineTo(18,dy-26-(drumFlame>0?30:12+Math.random()*6));ctx.lineTo(28,dy-26);ctx.fill();}
  ctx.font=`20px ${EMOJI_FONT}`;for(const h of hammers)if(!h.got)ctx.fillText('🔨',h.x,gy(h.g,h.x)-22+Math.sin(t*4)*2);
  for(const f of fires){ctx.fillStyle=Math.floor(t*10)%2?'#ff8a1c':'#ffe45e';ctx.beginPath();ctx.arc(f.x,f.y-9,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff2d55';ctx.beginPath();ctx.moveTo(f.x-7,f.y-12);ctx.lineTo(f.x,f.y-26-Math.random()*5);ctx.lineTo(f.x+7,f.y-12);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(f.x-4,f.y-11,2,3);ctx.fillRect(f.x+2,f.y-11,2,3);}
  if(hammerT>0&&!(deathT>0)){const sw=Math.sin(t*16)>0;ctx.save();ctx.translate(p.x+p.face*12,p.y-(sw?40:22));ctx.rotate(sw?0:p.face*1.4);ctx.font=`22px ${EMOJI_FONT}`;ctx.fillText('🔨',0,0);ctx.restore();}
  FX.render(ctx);ctx.restore();
  ctx.fillStyle='#000';ctx.fillRect(W-118,6,112,40);ctx.strokeStyle='#3fe0ff';ctx.lineWidth=2;ctx.strokeRect(W-118,6,112,40);Retro.text(ctx,'BONUS',W-62,11,1,'#3fe0ff','center');Retro.text(ctx,String(bonus),W-62,24,2,bonus<1000*G.level?'#ff2d55':'#fff','center');
  Retro.text(ctx,String(G.score).padStart(6,'0'),10,10,2,'#fff');Retro.text(ctx,'TOP '+String(Math.max(G.score,env.hi())),10,30,1,'#ff2d55');
  drawBanner(ctx,W,H,banner);};
 const legend=[{name:'JUMP A BARREL',pts:'1,000',draw:(c,x,y,tt)=>{c.save();c.translate(x,y);c.rotate(tt*4);c.fillStyle='#b5651d';c.beginPath();c.arc(0,0,10,0,Math.PI*2);c.fill();c.strokeStyle='#5b3010';c.lineWidth=2;c.beginPath();c.moveTo(-10,0);c.lineTo(10,0);c.moveTo(0,-10);c.lineTo(0,10);c.stroke();c.restore();}},
  {name:'GRAB A STAR',pts:'2,000',draw:(c,x,y)=>{c.font=`22px ${EMOJI_FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('⭐',x,y);}},
  {name:'HAMMER SMASH',pts:'3,000',draw:(c,x,y)=>{c.font=`22px ${EMOJI_FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('🔨',x,y);}},
  {name:'TROPHY',pts:'5,000+BONUS',draw:(c,x,y)=>{c.font=`22px ${EMOJI_FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('🏆',x,y);}}].map(e=>({...e,color:'#ff2d55'}));
 return Retro.intro(G,{title:'LADDER DASH',color:'#ff2d55',sub:'HOW HIGH CAN YOU GET?',tableTitle:'POINTS',legend,hi:env.hi,hint:'ARROWS MOVE AND CLIMB - SPACE JUMP - GRAB A HAMMER TO SMASH'});}

// =====================================================================================================
// 6. TURBO RACER (top-down retro road race)
// =====================================================================================================
function makeRacer(env){
 const W=400,H=600,RW=250,PY=H-90,G={W,H,score:0,lives:3,level:1,levelName:'Stage',over:false};
 const FX=Retro.fx();let lights=4,lastLight=5,oils=[],ospawn=4,spin=0,t=0;
 let dist=0,speed=0,px=W/2,inv=0,cars=[],coins=[],spawn=1,cspawn=2,nitro=3,boost=0,held=false,next=4000,parts=[],banner=null;
 const centre=d=>W/2+Math.sin(d/700)*55+Math.sin(d/1900+1)*35;
 const atY=y=>dist+(PY-y);   // world distance shown at screen y
 const maxV=()=>(430+G.level*40)*(boost>0?1.45:1);
 const COLS=['#2457d6','#f2c218','#1f9d55','#b45bd6','#ff8a1c','#e6e9f2'];
 G.update=(dt,inp)=>{t+=dt;FX.update(dt);parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.t-=dt;});parts=parts.filter(q=>q.t>0);
  // start lights: 3 red, then GO!
  if(lights>-1){lights-=dt;const n=Math.ceil(lights);if(n!==lastLight){lastLight=n;if(n>=1&&n<=3)env.beep(440,.25,'square',.06);else if(n<=0)env.beep(880,.6,'square',.07);}env.engine.set(55+Math.random()*6,.02);if(lights>0)return;}
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}env.engine.set(50,.01);return;}
  env.engine.set(55+speed*.38,.028);
  const nit=inp.f&&!held;held=inp.f;if(nit&&nitro>0&&boost<=0){nitro--;boost=2.2;env.beep(300,.5,'sawtooth',.05,3);}
  if(boost>0)boost-=dt;if(inv>0)inv-=dt;
  if(inp.u||boost>0)speed+=320*dt;else if(inp.d)speed-=520*dt;else speed+=(Math.min(260,maxV())-speed)*dt*.6;
  speed=clamp(speed,0,maxV());if(spin>0){spin-=dt;px=clamp(px+Math.sin(t*18)*160*dt,18,W-18);speed*=Math.pow(.5,dt);}else px=clamp(px+(inp.r-inp.l)*(150+speed*.35)*dt,18,W-18);
  ospawn-=dt;if(ospawn<=0){ospawn=R(3,6)/Math.min(2,1+G.level*.15);oils.push({lane:R(-1,1),wy:dist+PY+R(120,220)});}
  oils=oils.filter(o=>{const y=PY-(o.wy-dist),x=centre(o.wy)+o.lane*RW/3;if(y>H+30)return false;if(spin<=0&&inv<=0&&Math.abs(x-px)<24&&Math.abs(y-PY)<30){spin=1.1;env.beep(160,.6,'sawtooth',.04,2.5);FX.burst(px,PY,['#121625','#4a4f63','#fff'],18,140,.6,3);}return true;});
  const off=Math.abs(px-centre(dist))>RW/2-14;if(off){speed*=Math.pow(.35,dt);if(Math.random()<.3)parts.push({x:px+R(-10,10),y:PY+20,vx:R(-40,40),vy:R(40,90),t:.4,c:'#7a5b2a'});}
  dist+=speed*dt;G.score+=Math.round(speed*dt*.35);
  spawn-=dt;if(spawn<=0){spawn=Math.max(.45,1.3-G.level*.1)*(0.6+Math.random()*.8);const wy=dist+PY+R(80,160);cars.push({lane:R(-1,1),wy,v:R(140,240)+G.level*10,c:pick(COLS),passed:false});}
  cspawn-=dt;if(cspawn<=0){cspawn=R(1,3);coins.push({lane:R(-1,1),wy:dist+PY+R(100,200)});}
  for(const c of cars)c.wy+=c.v*dt;
  const pr={x:px,y:PY};
  cars=cars.filter(c=>{const y=PY-(c.wy-dist),x=centre(c.wy)+c.lane*RW/3;if(y>H+60){return false;}if(!c.passed&&y>PY+40){c.passed=true;G.score+=200*G.level;}
   if(inv<=0&&Math.abs(x-pr.x)<26&&Math.abs(y-pr.y)<46){G.lives--;inv=2;speed*=.2;env.beep(80,.5,'sawtooth',.07,.3);env.noise(.8,.12,600);FX.burst(px,PY-20,['#ffe45e','#ff8a1c','#fff',c.c],40,240,.9,4);FX.shake(14);for(let i=0;i<20;i++)parts.push({x:px,y:PY,vx:R(-160,160),vy:R(-160,160),t:.6,c:pick(['#ffe45e','#ff8a1c','#fff'])});if(G.lives<=0)banner={t:1.6,text:'GAME OVER',sub:'',then:()=>G.over=true};return false;}return y>-400;});
  coins=coins.filter(c=>{const y=PY-(c.wy-dist),x=centre(c.wy)+c.lane*RW/3;if(y>H+30)return false;if(Math.abs(x-px)<24&&Math.abs(y-PY)<36){G.score+=500*G.level;env.beep(1300,.12,'triangle',.05,1.4);return false;}return true;});
  if(dist>=next){const b=5000*G.level;G.score+=b;next+=4000+G.level*800;FX.burst(px,PY-60,Retro.CYCLE,60,260,1.3,4);banner={t:2,text:'EXTENDED PLAY!',sub:`STAGE ${G.level+1} - +${fmtN(b)} - NITRO REFILLED`,then:()=>{G.level++;nitro=3;}};env.beep(880,.4,'triangle',.06,1.8);}};
 G._clear=()=>{dist=next;G.update(.016,{l:0,r:0,u:0,d:0,f:0});};
 function car(ctx,x,y,col,me){ctx.fillStyle=col;ctx.fillRect(x-14,y-24,28,48);ctx.fillStyle='#121625';ctx.fillRect(x-17,y-18,5,12);ctx.fillRect(x+12,y-18,5,12);ctx.fillRect(x-17,y+8,5,12);ctx.fillRect(x+12,y+8,5,12);
  ctx.fillStyle=me?'#bfe9ff':'#3a3f55';ctx.fillRect(x-10,y-14,20,9);ctx.fillStyle='rgba(255,255,255,.7)';if(me){ctx.fillRect(x-3,y-24,6,48);}else ctx.fillRect(x-10,y+12,20,4);}
 G.render=ctx=>{const[ox,oy]=FX.offset();ctx.save();ctx.translate(ox,oy);ctx.fillStyle='#2f9a4a';ctx.fillRect(-20,-20,W+40,H+40);
  for(let y=0;y<H;y+=4){const d=atY(y),c=centre(d),stripe=Math.floor(d/40)%2;ctx.fillStyle=stripe?'#2f9a4a':'#34a853';ctx.fillRect(0,y,W,4);ctx.fillStyle='#4a4f63';ctx.fillRect(c-RW/2,y,RW,4);ctx.fillStyle=stripe?'#e51c35':'#fff';ctx.fillRect(c-RW/2-8,y,8,4);ctx.fillRect(c+RW/2,y,8,4);
   if(Math.floor(d/50)%2===0){ctx.fillStyle='#e6e9f2';ctx.fillRect(c-RW/6-2,y,4,4);ctx.fillRect(c+RW/6-2,y,4,4);}}
  for(let i=0;i<8;i++){const d=Math.floor((dist+H)/150)*150-i*150,y=PY-(d-dist),c=centre(d);ctx.font=`22px ${EMOJI_FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(i%2?'🌳':'🌲',c-RW/2-40,y);ctx.fillText(i%2?'🌲':'🌳',c+RW/2+40,y+70);}
  for(const o of oils){const y=PY-(o.wy-dist),x=centre(o.wy)+o.lane*RW/3;ctx.fillStyle='#121625';ctx.beginPath();ctx.ellipse(x,y,20,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(120,90,255,.35)';ctx.beginPath();ctx.ellipse(x-5,y-3,8,4,0,0,Math.PI*2);ctx.fill();}
  ctx.font=`22px ${EMOJI_FONT}`;for(const c of coins){const y=PY-(c.wy-dist),x=centre(c.wy)+c.lane*RW/3;ctx.fillText('🪙',x,y);}
  for(const c of cars){const y=PY-(c.wy-dist),x=centre(c.wy)+c.lane*RW/3;car(ctx,x,y,c.c,false);}
  if(!(inv>0&&Math.floor(inv*8)%2))car(ctx,px,PY,'#e51c35',true);
  if(boost>0){ctx.fillStyle='#ff8a1c';ctx.fillRect(px-8,PY+24,6,R(10,22));ctx.fillRect(px+2,PY+24,6,R(10,22));}
  for(const q of parts){ctx.globalAlpha=q.t/.6;ctx.fillStyle=q.c;ctx.fillRect(q.x-2,q.y-2,4,4);}ctx.globalAlpha=1;
  FX.render(ctx);ctx.restore();
  // pixel dashboard
  ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(6,6,W-12,40);Retro.text(ctx,String(G.score).padStart(7,'0'),14,12,2,'#ffe45e');Retro.text(ctx,`HI ${Math.max(G.score,env.hi())}`,14,32,1,'#9aa3c7');
  Retro.text(ctx,`${Math.round(speed/3)}`,W-58,12,2,boost>0?Retro.cyc(t):'#fff','right');Retro.text(ctx,'KM/H',W-14,16,1,'#9aa3c7','right');Retro.text(ctx,'NITRO',W-14,32,1,'#ff8a1c','right');for(let i=0;i<nitro;i++){ctx.fillStyle='#ff8a1c';ctx.fillRect(W-58-i*9,32,6,7);}
  const prog=1-Math.max(0,next-dist)/(4000+(G.level-1)*800);ctx.fillStyle='#4a4f63';ctx.fillRect(W/2-60,14,120,8);ctx.fillStyle='#3cff6a';ctx.fillRect(W/2-60,14,120*clamp(prog,0,1),8);Retro.text(ctx,`STAGE ${G.level}`,W/2,28,1,'#fff','center');
  if(lights>0){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(W/2-80,H/2-50,160,70);for(let k=0;k<3;k++){ctx.fillStyle=Math.ceil(lights)<=3-k?'#ff2d55':'#3a1020';if(Math.ceil(lights)<=0)ctx.fillStyle='#3cff6a';ctx.beginPath();ctx.arc(W/2-45+k*45,H/2-15,16,0,Math.PI*2);ctx.fill();}}
  if(lights<=0&&lights>-1)Retro.text(ctx,'GO!',W/2,H/2-40,5,'#3cff6a','center');
  if(spin>0)Retro.text(ctx,'OIL SLICK!',W/2,PY-80,2,'#ffe45e','center');
  drawBanner(ctx,W,H,banner);};
 const legend=[{name:'COIN',pts:'500',draw:(c,x,y)=>{c.font=`22px ${EMOJI_FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('🪙',x,y);}},{name:'OVERTAKE',pts:'200',draw:(c,x,y)=>car(c,x,y,'#2457d6',false)},{name:'CHECKPOINT',pts:'5,000',draw:(c,x,y)=>{for(let k=0;k<6;k++){c.fillStyle=k%2?'#fff':'#121625';c.fillRect(x-24+k*8,y-6,8,6);c.fillStyle=k%2?'#121625':'#fff';c.fillRect(x-24+k*8,y,8,6);}}},{name:'AVOID OIL',pts:'SPIN!',draw:(c,x,y)=>{c.fillStyle='#4a4f63';c.fillRect(x-28,y-14,56,28);c.fillStyle='#121625';c.beginPath();c.ellipse(x,y,20,10,0,0,Math.PI*2);c.fill();}}].map(e=>({...e,color:'#ffe45e'}));
 return Retro.intro(G,{title:'TURBO RACER',color:'cycle',sub:'RACE TO THE NEXT CHECKPOINT',tableTitle:'POINTS',legend,bg:'#0b1236',stars:true,hi:env.hi,hint:'LEFT RIGHT STEER - UP GO - DOWN BRAKE - SPACE NITRO'});}

// =====================================================================================================
// 7. SUPER SNAKE
// =====================================================================================================
function makeSnake(env){
 const N=24,C=20,W=N*C,H=N*C,G={W,H,score:0,lives:3,level:1,levelName:'Level',over:false};
 const FX=Retro.fx();
 // Obstacle layouts, one per level (repeating): open field, two bars, four blocks, a cross, a box with gaps.
 const LAYOUTS=[[],
  [...Array(10)].flatMap((_,i)=>[[7+i,7],[7+i,16]]),
  [[5,5],[6,5],[5,6],[6,6],[17,5],[18,5],[17,6],[18,6],[5,17],[6,17],[5,18],[6,18],[17,17],[18,17],[17,18],[18,18]],
  [...Array(9)].flatMap((_,i)=>[[11,7+i],[12,7+i]]).concat([...Array(6)].flatMap((_,i)=>[[5+i,11],[13+i,11]])),
  [...Array(14)].flatMap((_,i)=>i>4&&i<9?[]:[[5+i,5],[5+i,18],[5,5+i],[18,5+i]])];
 let sn,prev,dir,want,food,star=null,t=0,eaten=0,deathT=0,combo=1,lastEat=-9,clock=0,pops=[],walls=new Set(),banner={t:1.6,text:'LEVEL 1',sub:'EAT THE FOOTBALLS'};
 const key=(x,y)=>x+','+y,isWall=(x,y)=>x<1||y<1||x>N-2||y>N-2||walls.has(key(x,y));
 const setLayout=()=>{walls=new Set(LAYOUTS[(G.level-1)%LAYOUTS.length].map(([x,y])=>key(x,y)));};
 const free=()=>{let x,y,k=0;do{x=R(1,N-2);y=R(1,N-2);k++;}while(k<500&&(isWall(x,y)||sn.some(s=>s[0]===x&&s[1]===y)||(food&&food[0]===x&&food[1]===y)));return[x,y];};
 function reset(){sn=[[4,3],[3,3],[2,3]];prev=sn.map(s=>s.slice());dir=[1,0];want=[1,0];food=null;food=free();star=null;combo=1;}
 setLayout();reset();
 const interval=()=>Math.max(.055,.14-G.level*.012);
 G.update=(dt,inp)=>{clock+=dt;FX.update(dt);pops.forEach(p=>{p.t-=dt;p.y-=18*dt;});pops=pops.filter(p=>p.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  if(deathT>0){deathT-=dt;if(deathT<=0){if(G.lives<=0)G.over=true;else reset();}return;}
  if(inp.l)want=[-1,0];else if(inp.r)want=[1,0];else if(inp.u)want=[0,-1];else if(inp.d)want=[0,1];
  if(star){star.t-=dt;if(star.t<=0)star=null;}
  t+=dt;if(t<interval())return;t=0;if(!(want[0]===-dir[0]&&want[1]===-dir[1]))dir=want;
  const h=[sn[0][0]+dir[0],sn[0][1]+dir[1]];prev=sn.map(s=>s.slice());
  if(isWall(h[0],h[1])||sn.some(s=>s[0]===h[0]&&s[1]===h[1])){G.lives--;deathT=1.4;env.beep(90,.5,'sawtooth',.07,.3);env.noise(.7,.09,700);FX.shake(10);sn.forEach((s,i)=>{if(i%2===0)FX.burst(s[0]*C+C/2,s[1]*C+C/2,['#9dff2e','#3cc46a','#fff'],6,120,.8,3);});return;}
  sn.unshift(h);
  if(h[0]===food[0]&&h[1]===food[1]){eaten++;combo=clock-lastEat<3?Math.min(5,combo+1):1;lastEat=clock;const pts=500*G.level*combo;G.score+=pts;pops.push({x:h[0]*C+C/2,y:h[1]*C,t:.9,txt:combo>1?`${fmtN(pts)} X${combo}`:fmtN(pts)});
   env.beep(700+combo*120,.08,'square',.04,1.3);FX.burst(h[0]*C+C/2,h[1]*C+C/2,['#fff','#ffe45e'],10,120,.5,2);food=free();if(eaten%5===0)star={p:free(),t:6};
   if(eaten%8===0){const b=5000*G.level;G.score+=b;banner={t:1.8,text:`LEVEL ${G.level+1}!`,sub:`+${fmtN(b)} - NEW MAZE - A BIT FASTER`,then:()=>{G.level++;setLayout();reset();}};}}
  else if(star&&h[0]===star.p[0]&&h[1]===star.p[1]){G.score+=3000*G.level;pops.push({x:h[0]*C+C/2,y:h[1]*C,t:.9,txt:fmtN(3000*G.level)});star=null;env.beep(1500,.2,'triangle',.06,1.4);FX.burst(h[0]*C+C/2,h[1]*C+C/2,Retro.CYCLE,24,160,.7,3);}
  else sn.pop();};
 G.swipe=(dx,dy)=>{want=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];};
 G._clear=()=>{eaten=7;const h=[sn[0][0]+dir[0],sn[0][1]+dir[1]];if(!isWall(h[0],h[1]))food=h;};
 G.render=ctx=>{const[ox,oy]=FX.offset();ctx.save();ctx.translate(ox,oy);ctx.fillStyle='#0f2a17';ctx.fillRect(-20,-20,W+40,H+40);ctx.fillStyle='#14361e';for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++)if((x+y)%2)ctx.fillRect(x*C,y*C,C,C);
  ctx.fillStyle='#ff8a1c';ctx.fillRect(0,0,W,C);ctx.fillRect(0,H-C,W,C);ctx.fillRect(0,0,C,H);ctx.fillRect(W-C,0,C,H);
  for(const k of walls){const[x,y]=k.split(',').map(Number);ctx.fillStyle='#ff8a1c';ctx.fillRect(x*C,y*C,C,C);ctx.fillStyle='#c8641e';ctx.fillRect(x*C+3,y*C+3,C-6,C-6);}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`17px ${EMOJI_FONT}`;ctx.fillText('⚽',food[0]*C+C/2,food[1]*C+C/2+1+Math.sin(clock*6)*1.5);
  if(star){ctx.fillText('⭐',star.p[0]*C+C/2,star.p[1]*C+C/2+1);ctx.fillStyle='#ffe45e';ctx.fillRect(star.p[0]*C,star.p[1]*C+C,C*star.t/6,3);}
  // smooth movement: draw each segment between where it was and where it is going
  const f=deathT>0||banner?1:Math.min(1,t/interval());
  sn.forEach((s,i)=>{const p=prev[i]||prev[prev.length-1]||s,x=(p[0]+(s[0]-p[0])*f)*C,y=(p[1]+(s[1]-p[1])*f)*C;ctx.fillStyle=deathT>0&&Math.floor(deathT*8)%2?'#fff':i?(i%2?'#3cc46a':'#34b35f'):'#9dff2e';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x+1,y+1,C-2,C-2,6);else ctx.rect(x+1,y+1,C-2,C-2);ctx.fill();});
  const h=sn[0],ph=prev[0]||h,hx=(ph[0]+(h[0]-ph[0])*f)*C,hy=(ph[1]+(h[1]-ph[1])*f)*C;ctx.fillStyle='#121625';ctx.beginPath();ctx.arc(hx+C/2+dir[0]*3-dir[1]*4,hy+C/2+dir[1]*3-dir[0]*4,2.4,0,Math.PI*2);ctx.arc(hx+C/2+dir[0]*3+dir[1]*4,hy+C/2+dir[1]*3+dir[0]*4,2.4,0,Math.PI*2);ctx.fill();
  for(const p of pops){ctx.globalAlpha=Math.min(1,p.t*2);Retro.text(ctx,p.txt,p.x,p.y,1,'#ffe45e','center');}ctx.globalAlpha=1;
  FX.render(ctx);ctx.restore();
  Retro.text(ctx,String(G.score),8,6,1,'#121625');Retro.text(ctx,`HI ${Math.max(G.score,env.hi())}`,W-8,6,1,'#121625','right');if(combo>1&&clock-lastEat<3)Retro.text(ctx,`COMBO X${combo}`,W/2,6,1,'#121625','center');
  drawBanner(ctx,W,H,banner);};
 const legend=[{name:'FOOTBALL',pts:'500',draw:(c,x,y)=>{c.font=`20px ${EMOJI_FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('⚽',x,y);}},{name:'GOLD STAR',pts:'3,000',draw:(c,x,y)=>{c.font=`20px ${EMOJI_FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('⭐',x,y);}},
  {name:'QUICK EATS',pts:'COMBO X5',draw:(c,x,y)=>{for(let i=0;i<5;i++){c.fillStyle=i?'#3cc46a':'#9dff2e';c.fillRect(x+20-i*11,y-5,10,10);}}},{name:'8 FOOTBALLS',pts:'LEVEL UP',draw:(c,x,y)=>{c.fillStyle='#ff8a1c';c.fillRect(x-14,y-7,28,14);c.fillStyle='#c8641e';c.fillRect(x-10,y-3,20,6);}}].map(e=>({...e,color:'#9dff2e'}));
 return Retro.intro(G,{title:'SUPER SNAKE',color:'#9dff2e',sub:'NEW MAZE EVERY LEVEL',tableTitle:'POINTS',legend,bg:'#0f2a17',hi:env.hi,hint:'ARROWS OR SWIPE TO STEER - DON\'T HIT THE WALLS OR YOUR TAIL'});}

GAME_LIST.push({id:'ladder',name:'Ladder Dash',icon:'🪜',desc:'Climb the girders, jump the rolling barrels, grab the trophy!'},{id:'racer',name:'Turbo Racer',icon:'🏎️',desc:'Race the winding road — dodge traffic, grab coins, use nitro!'},{id:'snake',name:'Super Snake',icon:'🐍',desc:'Eat footballs to grow. Don’t bite your tail!'});
Object.assign(PADS,{ladder:[['l','r'],['u','d','f']],racer:[['l','r'],['d','u','f']],snake:[['l','r'],['u','d']]});
Object.assign(GAMES,{ladder:makeLadder,racer:makeRacer,snake:makeSnake});
