'use strict';
// PRESENTATION: four ORIGINAL arcade games (inspired by classic genres; no code, art or names copied from commercial games).
// Each game: create(env) → {W,H,score,lives,level,levelName,over, update(dt,inp), render(ctx), swipe?(dx,dy), pointer?(fx)}.
// inp = {l,r,u,d,f} (held buttons). Scores are deliberately big — players like to score thousands!
const GAME_LIST=[
 {id:'invaders',name:'Invaders',icon:'👾',desc:'Defend the pitch — and a bonus game after every wave.'},
 {id:'maze',name:'Maze Muncher',icon:'🟡',desc:'Munch every dot. Grab a power dot to chase the monsters!'},
 {id:'meteor',name:'Meteor Storm',icon:'☄️',desc:'Rotate, thrust and blast the meteors in deep space.'},
 {id:'guardian',name:'Planet Guardian',icon:'🚀',desc:'Fly over the planet and stop the landers taking people.'}];
const PADS={invaders:[['l','r'],['f']],maze:[['l','r'],['u','d']],meteor:[['l','r'],['u','f']],guardian:[['u','d'],['l','r','f']]};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const EMOJI_FONT='system-ui,"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
function drawBanner(ctx,W,H,b){if(!b)return;ctx.save();ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,H/2-70,W,140);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ffe45e';ctx.font=`bold ${Math.round(W/14)}px monospace`;ctx.fillText(b.text,W/2,H/2-18);ctx.fillStyle='#fff';ctx.font=`${Math.round(W/30)}px ${EMOJI_FONT}`;ctx.fillText(b.sub||'',W/2,H/2+26);ctx.restore();}
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
 let ctx,p={x:W/2,inv:0},pb=null,eb=[],inv=[],dir=1,stepT=0,frame=0,ufo=null,ufoT=R(14,24),bk=[],boom=[],phase='wave',bon=null,held=false,banner={t:1.6,text:'WAVE 1',sub:'Get ready!'};
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
   else{for(const v of inv)if(v.alive&&Math.abs(v.x-pb.x)<15&&Math.abs(v.y-pb.y)<13){v.alive=false;add(PTS[v.r]*G.level,v.x,v.y);pb=null;env.beep(160,.12,'sawtooth',.04,.3);break;}
    if(pb&&ufo&&Math.abs(ufo.x-pb.x)<22&&Math.abs(48-pb.y)<12){add(pick([500,1000,1500,3000])*G.level,ufo.x,48);ufo=null;pb=null;env.beep(1200,.25,'triangle',.05,.5);}}}
  const alive=inv.filter(v=>v.alive),n=alive.length;
  if(!n){const b=1000*G.level;G.score+=b;banner={t:2,text:`WAVE ${G.level} CLEAR!`,sub:`+${fmtN(b)} bonus`,then:startBonus};env.beep(660,.3,'triangle',.05,2);return;}
  const interval=Math.max(.05,(0.62-(G.level-1)*.05)*(0.15+0.85*n/45));stepT+=dt;
  if(stepT>=interval){stepT=0;frame^=1;const edge=alive.some(v=>v.x+dir*9>W-18||v.x+dir*9<18);if(edge){dir*=-1;alive.forEach(v=>v.y+=16);}else alive.forEach(v=>v.x+=dir*9);env.beep(frame?110:90,.05,'square',.025);for(const v of alive)hitBunker(v.x,v.y+10,14);}
  if(alive.some(v=>v.y>H-105))G.lives=0;
  if(eb.length<2+Math.min(4,G.level)&&Math.random()<dt*(0.8+G.level*0.2)){const cols={};for(const v of alive)if(!cols[v.x]||cols[v.x].y<v.y)cols[v.x]=v;const s=pick(Object.values(cols));eb.push({x:s.x,y:s.y+12,vy:170+G.level*14});}
  for(const b of eb)b.y+=b.vy*dt;
  eb=eb.filter(b=>{if(b.y>H)return false;if(hitBunker(b.x,b.y,6))return false;if(p.inv<=0&&Math.abs(b.x-p.x)<20&&b.y>H-64&&b.y<H-30){G.lives--;p.inv=1.6;boom.push({x:p.x,y:H-48,t:.5});env.beep(70,.4,'sawtooth',.06,.5);return false;}return true;});
  ufoT-=dt;if(!ufo&&ufoT<=0){const L=Math.random()<.5;ufo={x:L?-30:W+30,v:L?95:-95};}if(ufo){ufo.x+=ufo.v*dt;if(ufo.x<-40||ufo.x>W+40){ufo=null;ufoT=R(16,28);}}
  boom.forEach(b=>b.t-=dt);boom=boom.filter(b=>b.t>0);if(G.lives<=0)G.over=true;}
 G.update=(dt,inp)=>{if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}if(phase==='wave')updWave(dt,inp);else updBonus(dt,inp);};
 G.pointer=fx=>{p.x=clamp(fx*W,22,W-22);};
 G._clear=()=>inv.forEach(v=>v.alive=false);G._phase=()=>phase+(bon?':'+bon.k:'');
 function drawPlayer(){const blink=p.inv>0&&Math.floor(p.inv*10)%2===0;if(blink)return;if(cl)px(SPR.cannon,p.x-16,H-58,2.5,'#3cff6a');else if(env.avatar&&env.avatar.complete)ctx.drawImage(env.avatar,p.x-24,H-82,48,60);else{ctx.font=`32px ${EMOJI_FONT}`;ctx.fillText('🧍',p.x,H-50);}}
 const shotDraw=s=>{if(!s)return;if(cl){ctx.fillStyle='#fff';ctx.fillRect(s.x-1,s.y-8,3,12);}else{ctx.font=`16px ${EMOJI_FONT}`;ctx.fillText('⚽',s.x,s.y);}};
 G.render=c=>{ctx=c;ctx.textAlign='center';ctx.textBaseline='middle';
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
  drawBanner(ctx,W,H,banner);};
 return G;}

// =====================================================================================================
// 2. MAZE MUNCHER (original maze)
// =====================================================================================================
const MAZE=["###################","#o.......#.......o#","#.##.###.#.###.##.#","#.................#","#.##.#.#####.#.##.#","#....#...#...#....#","####.###.#.###.####","####.#.......#.####","####.#.##-##.#.####",".....#.#GGG#.#.....","####.#.#####.#.####","####.#.......#.####","####.#.#####.#.####","#........#........#","#.##.###.#.###.##.#","#o.#.....P.....#.o#","##.#.#.#####.#.#.##","#....#...#...#....#","#.######.#.######.#","#.................#","###################"];
function makeMaze(env){
 const COLS=MAZE[0].length,ROWS=MAZE.length,T=24,W=COLS*T,H=ROWS*T,G={W,H,score:0,lives:3,level:1,levelName:'Level',over:false};
 const DIRS=[[1,0],[-1,0],[0,1],[0,-1]],COL=['#ff3b3b','#ff8ad8','#3fe0ff','#ffb347'];
 let grid,dots,pl,gh,fright=0,chain=0,fruit=null,eaten=0,mouth=0,banner={t:1.6,text:'LEVEL 1',sub:'Munch every dot!'},deathT=0,time=0,want=[-1,0];
 const at=(x,y)=>{if(y<0||y>=ROWS)return'#';return grid[y][(x+COLS)%COLS];};
 const wall=(x,y,door)=>{const c=at(x,y);return c==='#'||(c==='-'&&!door);};
 function placeActors(){pl={tx:9,ty:15,dx:0,dy:0,p:0};gh=COL.map((c,i)=>({tx:i===0?9:7+i,ty:i===0?7:9,dx:i===0?-1:0,dy:0,p:0,c,state:i===0?'chase':'pen',rel:i*3/Math.min(2,1+G.level*.2),fr:false}));fright=0;}
 function newLevel(){grid=MAZE.map(r=>r.split('').map(c=>c==='P'||c==='G'?(c==='P'?' ':' '):c));dots=0;for(const r of grid)for(const c of r)if(c==='.'||c==='o')dots++;eaten=0;fruit=null;placeActors();time=0;}
 newLevel();
 const dist2=(a,b,x,y)=>(a-x)**2+(b-y)**2;
 function levelClear(){const b=10000*G.level;G.score+=b;banner={t:2.4,text:`LEVEL ${G.level} CLEAR!`,sub:`+${fmtN(b)} bonus`,then:()=>{G.level++;newLevel();banner={t:1.4,text:`LEVEL ${G.level}`,sub:'Faster monsters!'};}};}
 function eat(x,y){const c=grid[y][x];if(c==='.'||c==='o'){grid[y][x]=' ';dots--;eaten++;if(c==='.'){G.score+=100;if(eaten%2)env.beep(520,.04,'square',.02);}else{G.score+=500;fright=Math.max(2.5,7-G.level*.6);chain=0;gh.forEach(g=>{if(g.state==='chase'){g.fr=true;g.dx=-g.dx;g.dy=-g.dy;}});env.beep(300,.3,'triangle',.05,2);}
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
  if(deathT>0){deathT-=dt;if(deathT<=0){if(G.lives<=0)G.over=true;else placeActors();}return;}
  time+=dt;mouth+=dt*12;
  if(inp.l)want=[-1,0];else if(inp.r)want=[1,0];else if(inp.u)want=[0,-1];else if(inp.d)want=[0,1];
  if((pl.dx||pl.dy)&&want[0]===-pl.dx&&want[1]===-pl.dy){pl.tx=(pl.tx+pl.dx+COLS)%COLS;pl.ty+=pl.dy;pl.p=1-pl.p;pl.dx=-pl.dx;pl.dy=-pl.dy;}
  step(pl,Math.min(8.5,6.4+G.level*.25),dt,decidePlayer);
  if(fright>0){fright-=dt;if(fright<=0)gh.forEach(g=>g.fr=false);}
  if(fruit){fruit.t-=dt;if(fruit.t<=0)fruit=null;}
  for(const g of gh){if(g.state==='pen'){g.rel-=dt;if(g.rel<=0){g.state='leave';g.tx=9;g.ty=9;g.dx=0;g.dy=-1;g.p=0;}continue;}
   const sp=g.state==='eyes'?12:g.fr?3.6:Math.min(8,5.4+G.level*.3);step(g,sp,dt,decideGhost);
   const[a,b]=pos(pl),[c,d]=pos(g);if(Math.abs(a-c)<.7&&Math.abs(b-d)<.7&&g.state==='chase'){
    if(g.fr){chain++;const n=Math.min(16000,1000*2**chain);G.score+=n;g.state='eyes';g.fr=false;env.beep(1400,.2,'square',.05,.3);}
    else{G.lives--;deathT=1.6;env.beep(200,.8,'sawtooth',.06,.2);return;}}}};
 G.swipe=(dx,dy)=>{want=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];};
 G._clear=()=>{for(const r of grid)for(let i=0;i<r.length;i++)if(r[i]==='.'||r[i]==='o')r[i]=' ';dots=0;levelClear();};G._tp=(x,y)=>{pl.tx=x;pl.ty=y;pl.p=0;pl.dx=0;pl.dy=0;};G._state=()=>({pl:{...pl},fright,gh:gh.map(g=>({tx:g.tx,ty:g.ty,state:g.state,fr:g.fr})),dots});
 G.render=ctx=>{ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.save();ctx.shadowColor='#3b6bff';ctx.shadowBlur=8;ctx.strokeStyle='#3b6bff';ctx.lineWidth=2;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const c=grid[y][x];if(c==='#'){ctx.fillStyle='#0d1a5c';ctx.fillRect(x*T+2,y*T+2,T-4,T-4);ctx.strokeRect(x*T+3,y*T+3,T-6,T-6);}else if(c==='-'){ctx.fillStyle='#ff8ad8';ctx.fillRect(x*T,y*T+T/2-2,T,4);}}ctx.restore();
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const c=grid[y][x];if(c==='.'){ctx.fillStyle='#ffd9a0';ctx.fillRect(x*T+T/2-2,y*T+T/2-2,4,4);}else if(c==='o'&&Math.floor(time*4)%2===0){ctx.fillStyle='#ffd9a0';ctx.beginPath();ctx.arc(x*T+T/2,y*T+T/2,7,0,Math.PI*2);ctx.fill();}}
  if(fruit){ctx.font=`20px ${EMOJI_FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⚽',9*T+T/2,15*T+T/2);}
  const[px2,py2]=pos(pl),cx=px2*T+T/2,cy=py2*T+T/2,ang=Math.atan2(pl.dy||want[1],pl.dx||want[0]),m=deathT>0?Math.min(Math.PI,(1.6-deathT)*2.5):.08+Math.abs(Math.sin(mouth))*.6;
  ctx.fillStyle='#ffe45e';ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,T/2-2,ang+m,ang+Math.PI*2-m);ctx.closePath();ctx.fill();
  if(deathT<=0){ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx+Math.cos(ang-1.2)*5,cy+Math.sin(ang-1.2)*5,2.2,0,Math.PI*2);ctx.fill();}
  for(const g of gh){const[gx,gy]=pos(g),x=gx*T+T/2,y=gy*T+T/2,r=T/2-2;
   if(g.state!=='eyes'){ctx.fillStyle=g.fr?(fright<1.6&&Math.floor(time*6)%2?'#fff':'#2340ff'):g.c;ctx.beginPath();ctx.arc(x,y-1,r,Math.PI,0);ctx.lineTo(x+r,y+r);for(let i=0;i<4;i++)ctx.lineTo(x+r-(i+.5)*r/2,y+r-(i%2?0:4));ctx.lineTo(x-r,y+r);ctx.closePath();ctx.fill();}
   ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-4,y-3,3.6,0,Math.PI*2);ctx.arc(x+4,y-3,3.6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1d2b5c';ctx.beginPath();ctx.arc(x-4+g.dx*1.6,y-3+g.dy*1.6,1.8,0,Math.PI*2);ctx.arc(x+4+g.dx*1.6,y-3+g.dy*1.6,1.8,0,Math.PI*2);ctx.fill();}
  drawBanner(ctx,W,H,banner);};
 return G;}

// =====================================================================================================
// 3. METEOR STORM (neon vector style)
// =====================================================================================================
function makeMeteor(env){
 const W=800,H=500,G={W,H,score:0,lives:3,level:1,levelName:'Level',over:false};
 let ship,bullets=[],rocks=[],parts=[],cool=0,banner={t:1.6,text:'LEVEL 1',sub:'Rotate ◀ ▶ · thrust ▲ · fire ●'},nextLife=50000;
 const stars=Array.from({length:120},()=>[R(0,W),R(0,H),Math.random()]);
 const rock=(x,y,size)=>{const r=[0,15,27,46][size],n=R(9,12),pts=Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return[Math.cos(a)*r*(0.75+Math.random()*.35),Math.sin(a)*r*(0.75+Math.random()*.35)];});const sp=(4-size)*30+R(10,40)+G.level*6,a=Math.random()*Math.PI*2;return{x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,size,pts,rot:0,vr:(Math.random()-.5)*2};};
 const spawnShip=()=>{ship={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0,inv:2.5};};
 function level(){rocks=[];for(let i=0;i<2+G.level;i++){let x,y;do{x=R(0,W);y=R(0,H);}while(Math.hypot(x-W/2,y-H/2)<160);rocks.push(rock(x,y,3));}}
 spawnShip();level();
 const wrap=o=>{o.x=(o.x+W)%W;o.y=(o.y+H)%H;};
 const burst=(x,y,c,n=14)=>{for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=R(40,180);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:.7,c});}};
 G.update=(dt,inp)=>{parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt;});parts=parts.filter(p=>p.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  if(ship){ship.a+=(inp.r-inp.l)*4.2*dt;if(inp.u){ship.vx+=Math.cos(ship.a)*300*dt;ship.vy+=Math.sin(ship.a)*300*dt;if(Math.random()<.4)parts.push({x:ship.x-Math.cos(ship.a)*14,y:ship.y-Math.sin(ship.a)*14,vx:-Math.cos(ship.a)*120+R(-30,30),vy:-Math.sin(ship.a)*120+R(-30,30),t:.3,c:'#ff8a1c'});}
   ship.vx*=Math.pow(.6,dt);ship.vy*=Math.pow(.6,dt);ship.x+=ship.vx*dt;ship.y+=ship.vy*dt;wrap(ship);if(ship.inv>0)ship.inv-=dt;
   cool-=dt;if(inp.f&&cool<=0&&bullets.length<6){cool=.2;bullets.push({x:ship.x+Math.cos(ship.a)*16,y:ship.y+Math.sin(ship.a)*16,vx:Math.cos(ship.a)*560+ship.vx,vy:Math.sin(ship.a)*560+ship.vy,t:1});env.beep(980,.05,'square',.025,.5);}}
  for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.t-=dt;wrap(b);}bullets=bullets.filter(b=>b.t>0);
  for(const r of rocks){r.x+=r.vx*dt;r.y+=r.vy*dt;r.rot+=r.vr*dt;wrap(r);}
  const born=[];rocks=rocks.filter(r=>{const hit=bullets.find(b=>Math.hypot(b.x-r.x,b.y-r.y)<r.r);if(!hit)return true;hit.t=0;G.score+=[0,2000,1000,500][r.size]*G.level;burst(r.x,r.y,'#ff8a1c');env.beep(120+r.size*30,.2,'sawtooth',.05,.4);if(r.size>1){born.push(rock(r.x,r.y,r.size-1),rock(r.x,r.y,r.size-1));}return false;});rocks.push(...born);
  if(ship&&ship.inv<=0&&rocks.some(r=>Math.hypot(r.x-ship.x,r.y-ship.y)<r.r+10)){burst(ship.x,ship.y,'#ffe45e',30);G.lives--;env.beep(70,.6,'sawtooth',.07,.3);ship=null;if(G.lives<=0){banner={t:1.5,text:'GAME OVER',sub:'',then:()=>G.over=true};}else banner={t:1.4,text:'GET READY',sub:`${G.lives} ship${G.lives>1?'s':''} left`,then:spawnShip};}
  if(G.score>=nextLife){G.lives++;nextLife+=50000;env.beep(1500,.3,'triangle',.05,1.2);}
  if(!rocks.length&&!banner){const b=5000*G.level;G.score+=b;banner={t:2.2,text:`LEVEL ${G.level} CLEAR!`,sub:`+${fmtN(b)} bonus`,then:()=>{G.level++;level();if(ship)ship.inv=2;}};}};
 G._clear=()=>{rocks=[];};
 G.render=ctx=>{ctx.fillStyle='#03041a';ctx.fillRect(0,0,W,H);for(const[x,y,b]of stars){ctx.fillStyle=`rgba(170,190,255,${.25+b*.6})`;ctx.fillRect(x,y,b>.85?2:1,b>.85?2:1);}
  ctx.save();ctx.lineJoin='round';ctx.shadowBlur=14;ctx.lineWidth=2.5;
  ctx.shadowColor='#ff5a1c';ctx.strokeStyle='#ff9a3c';for(const r of rocks){ctx.beginPath();r.pts.forEach(([px,py],i)=>{const c=Math.cos(r.rot),s=Math.sin(r.rot),x=r.x+px*c-py*s,y=r.y+px*s+py*c;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.stroke();}
  ctx.shadowColor='#4f7bff';ctx.strokeStyle='#d6e2ff';for(const b of bullets){ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.015,b.y-b.vy*.015);ctx.stroke();}
  if(ship&&!(ship.inv>0&&Math.floor(ship.inv*8)%2)){ctx.shadowColor='#ffb000';ctx.strokeStyle='#ffc94a';const a=ship.a,pt=(d,o)=>[ship.x+Math.cos(a+o)*d,ship.y+Math.sin(a+o)*d];ctx.beginPath();ctx.moveTo(...pt(16,0));ctx.lineTo(...pt(12,2.5));ctx.lineTo(...pt(5,Math.PI));ctx.lineTo(...pt(12,-2.5));ctx.closePath();ctx.stroke();}
  for(const p of parts){ctx.shadowColor=p.c;ctx.fillStyle=p.c;ctx.globalAlpha=p.t/.7;ctx.fillRect(p.x-1.5,p.y-1.5,3,3);}ctx.restore();ctx.globalAlpha=1;
  drawBanner(ctx,W,H,banner);};
 return G;}

// =====================================================================================================
// 4. PLANET GUARDIAN (side-scrolling retro shooter)
// =====================================================================================================
function makeGuardian(env){
 const W=800,H=450,WW=3200,TOP=46,G={W,H,score:0,lives:3,level:1,levelName:'Wave',over:false};
 const ground=[];{let h=60;for(let i=0;i<=WW/20;i++){h=clamp(h+R(-14,14),25,110);ground.push(h);}ground[ground.length-1]=ground[0];}
 const gy=x=>{x=((x%WW)+WW)%WW;const i=Math.floor(x/20),f=x/20-i;return H-(ground[i]*(1-f)+ground[i+1]*f);};
 let ship={x:200,y:200,face:1,vx:0,inv:2},camX=0,lasers=[],en=[],eb=[],people=[],parts=[],cool=0,banner={t:1.8,text:'WAVE 1',sub:'Protect the people from the landers!'};
 const stars=Array.from({length:90},()=>[R(0,WW),R(TOP,H-120),Math.random()]);
 const dx=(a,b)=>{let d=((a-b)%WW+WW)%WW;if(d>WW/2)d-=WW;return d;};
 function spawnPeople(){people=Array.from({length:6},(_,i)=>{const x=(i+.5)*WW/6+R(-150,150);return{x,y:gy(x)-6,state:'ground',vy:0};});}
 function wave(){en=[];const n=4+G.level*2;for(let i=0;i<n;i++)en.push({type:'lander',x:R(0,WW),y:R(TOP+20,180),vx:pick([-1,1])*R(30,60),vy:0,state:'hunt',target:null,shoot:R(2,5)});if(!people.some(p=>p.state!=='lost'))spawnPeople();}
 spawnPeople();wave();
 const burst=(x,y,c,n=16)=>{for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=R(40,200);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:.7,c});}};
 G.update=(dt,inp)=>{parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt;});parts=parts.filter(p=>p.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  if(ship){if(inp.l)ship.face=-1;if(inp.r)ship.face=1;const thrust=inp.l||inp.r;ship.vx+=(thrust?ship.face*520:-Math.sign(ship.vx)*Math.min(Math.abs(ship.vx)*2.5,400))*dt;ship.vx=clamp(ship.vx,-420,420);
   ship.x=((ship.x+ship.vx*dt)%WW+WW)%WW;ship.y=clamp(ship.y+(inp.d-inp.u)*240*dt,TOP+14,gy(ship.x)-14);if(ship.inv>0)ship.inv-=dt;
   cool-=dt;if(inp.f&&cool<=0){cool=.22;lasers.push({x:ship.x+ship.face*18,y:ship.y+2,dir:ship.face,len:0,t:.45});env.beep(1400,.06,'square',.025,.3);}}
  const target=ship?ship.x-W*(ship.face>0?.3:.7):camX;camX=camX+dx(target,camX)*Math.min(1,dt*4);camX=((camX%WW)+WW)%WW;
  for(const l of lasers){l.len=Math.min(520,l.len+1600*dt);l.t-=dt;}lasers=lasers.filter(l=>l.t>0);
  for(const e of en){e.shoot-=dt;
   if(e.type==='mutant'&&ship){e.vx=clamp(e.vx+Math.sign(dx(ship.x,e.x))*300*dt,-260,260);e.vy=clamp(e.vy+Math.sign(ship.y-e.y)*240*dt,-160,160);}
   else if(e.state==='hunt'){if(!e.target||e.target.state!=='ground'){const free=people.filter(p=>p.state==='ground');e.target=free.length?free.sort((a,b)=>Math.abs(dx(a.x,e.x))-Math.abs(dx(b.x,e.x)))[0]:null;}
    if(e.target){const d=dx(e.target.x,e.x);e.vx=clamp(d,-70-G.level*5,70+G.level*5);e.vy=Math.abs(d)<60?50:(e.y>gy(e.x)-90?-30:10);if(Math.abs(d)<6&&e.y>e.target.y-24){e.state='up';e.target.state='carried';e.carry=e.target;e.vx=0;e.vy=-45;}}else e.vy=0;}
   else if(e.state==='up'){e.vy=-45-G.level*3;e.carry.x=e.x;e.carry.y=e.y+16;if(e.y<TOP+12){e.type='mutant';e.state='mutant';e.carry.state='lost';e.carry=null;env.beep(90,.5,'sawtooth',.05,.5);}}
   e.x=((e.x+e.vx*dt)%WW+WW)%WW;e.y=clamp(e.y+e.vy*dt,TOP+8,H-30);
   if(ship&&e.shoot<=0&&Math.abs(dx(ship.x,e.x))<W/2){e.shoot=R(2,4)/Math.min(2,1+G.level*.1);const a=Math.atan2(ship.y-e.y,dx(ship.x,e.x)),s=170+G.level*8;eb.push({x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:3});}}
  for(const b of eb){b.x=((b.x+b.vx*dt)%WW+WW)%WW;b.y+=b.vy*dt;b.t-=dt;}eb=eb.filter(b=>b.t>0&&b.y>TOP&&b.y<H);
  for(const p of people)if(p.state==='falling'){p.vy+=200*dt;p.y+=p.vy*dt;if(p.y>=gy(p.x)-6){p.y=gy(p.x)-6;p.state='ground';p.vy=0;G.score+=1000;env.beep(1000,.15,'triangle',.05,1.4);}}
  // laser hits
  en=en.filter(e=>{const hit=lasers.find(l=>Math.abs(e.y-l.y)<14&&(l.dir>0?dx(e.x,l.x)>=0&&dx(e.x,l.x)<=l.len:dx(e.x,l.x)<=0&&dx(e.x,l.x)>=-l.len));if(!hit)return true;
   G.score+=(e.type==='mutant'?2500:1500)*G.level;burst(e.x,e.y,e.type==='mutant'?'#d06bff':'#9dff2e');env.beep(160,.2,'sawtooth',.05,.4);if(e.carry){e.carry.state='falling';e.carry.vy=0;}return false;});
  if(ship&&ship.inv<=0&&(en.some(e=>Math.abs(dx(e.x,ship.x))<20&&Math.abs(e.y-ship.y)<14)||eb.some(b=>Math.abs(dx(b.x,ship.x))<12&&Math.abs(b.y-ship.y)<9))){
   burst(ship.x,ship.y,'#ffe45e',30);G.lives--;eb=[];env.beep(70,.6,'sawtooth',.07,.3);const sx=ship.x;ship=null;
   banner=G.lives<=0?{t:1.5,text:'GAME OVER',sub:'',then:()=>G.over=true}:{t:1.4,text:'GET READY',sub:`${G.lives} ship${G.lives>1?'s':''} left`,then:()=>{ship={x:sx,y:180,face:1,vx:0,inv:2.5};}};}
  if(!en.length&&!banner){const saved=people.filter(p=>p.state!=='lost').length,b=1000*saved*G.level;G.score+=b;banner={t:2.4,text:`WAVE ${G.level} CLEAR!`,sub:`${saved} people safe · +${fmtN(b)}`,then:()=>{G.level++;wave();}};}};
 G._clear=()=>{en=[];};
 const sx=x=>{let d=dx(x,camX);return d<-60?d+WW:d;};
 G.render=ctx=>{ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  for(const[x,y,b]of stars){const X=sx(x);if(X>=0&&X<=W){ctx.fillStyle=`rgba(255,255,255,${.3+b*.6})`;ctx.fillRect(X,y,b>.85?2:1,b>.85?2:1);}}
  ctx.strokeStyle='#ff8a1c';ctx.lineWidth=2;ctx.beginPath();for(let X=0;X<=W;X+=6){const y=gy(camX+X);X?ctx.lineTo(X,y):ctx.moveTo(X,y);}ctx.stroke();
  for(const p of people)if(p.state!=='lost'){const X=sx(p.x);if(X>-10&&X<W+10){ctx.fillStyle='#64d9f5';ctx.fillRect(X-2,p.y-8,4,8);ctx.fillStyle='#ffd3a0';ctx.fillRect(X-2,p.y-12,4,4);}}
  for(const e of en){const X=sx(e.x);if(X<-20||X>W+20)continue;if(e.type==='mutant'){ctx.fillStyle='#d06bff';ctx.fillRect(X-10,e.y-6,20,12);ctx.fillStyle='#fff';ctx.fillRect(X-6,e.y-3,3,3);ctx.fillRect(X+3,e.y-3,3,3);}
   else{ctx.fillStyle='#9dff2e';ctx.fillRect(X-12,e.y-4,24,6);ctx.fillStyle='#ffe45e';ctx.fillRect(X-6,e.y-10,12,6);ctx.fillStyle='#9dff2e';ctx.fillRect(X-12,e.y+2,3,6);ctx.fillRect(X+9,e.y+2,3,6);}}
  ctx.fillStyle='#fff';for(const b of eb){const X=sx(b.x);ctx.fillRect(X-2,b.y-2,4,4);}
  for(const l of lasers){const X=sx(l.x);ctx.fillStyle=`hsl(${(l.t*800)%360},100%,65%)`;ctx.fillRect(l.dir>0?X:X-l.len,l.y-1,l.len,3);}
  if(ship&&!(ship.inv>0&&Math.floor(ship.inv*8)%2)){const X=sx(ship.x),f=ship.face;ctx.fillStyle='#e6e9f2';ctx.fillRect(X-14,ship.y-4,28,8);ctx.fillStyle='#e51c35';ctx.fillRect(X+(f>0?6:-14),ship.y-7,8,4);ctx.fillStyle='#64d9f5';ctx.fillRect(X+(f>0?-4:-4),ship.y-6,8,3);ctx.fillStyle='#ff8a1c';ctx.fillRect(X+(f>0?-20:14),ship.y-2,6,4);}
  for(const p of parts){const X=sx(p.x);ctx.globalAlpha=p.t/.7;ctx.fillStyle=p.c;ctx.fillRect(X-2,p.y-2,4,4);}ctx.globalAlpha=1;
  // radar
  ctx.fillStyle='#0b0f2a';ctx.fillRect(W/2-200,4,400,TOP-10);ctx.strokeStyle='#3b6bff';ctx.lineWidth=1.5;ctx.strokeRect(W/2-200,4,400,TOP-10);
  const rx=x=>W/2-200+((((x-camX+WW/2-W/2)%WW)+WW)%WW)/WW*400,ry=y=>4+(y-TOP)/(H-TOP)*(TOP-10);
  for(const p of people)if(p.state!=='lost'){ctx.fillStyle='#64d9f5';ctx.fillRect(rx(p.x),ry(p.y),2,2);}for(const e of en){ctx.fillStyle=e.type==='mutant'?'#d06bff':'#9dff2e';ctx.fillRect(rx(e.x),ry(e.y),3,3);}if(ship){ctx.fillStyle='#fff';ctx.fillRect(rx(ship.x)-1,ry(ship.y)-1,4,3);}
  ctx.strokeStyle='rgba(255,255,255,.4)';ctx.strokeRect(rx(camX),5,W/WW*400,TOP-12);
  drawBanner(ctx,W,H,banner);};
 return G;}
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
 let p,bar=[],stars=[],spawn=1.5,deathT=0,held=false,pops=[],banner={t:1.8,text:'LEVEL 1',sub:'Climb to the 🏆 · jump the barrels!'};
 function reset(){p={x:40,g:0,y:gy(0,40),st:'walk',vy:0,lad:null,face:1};bar=[];spawn=1.5;stars=[1,2,3,4].sort(()=>Math.random()-.5).slice(0,3).map(g=>{const r=GIR[g],x=R(r.a+40,r.b-40);return{g,x,got:false};});}
 reset();
 const spd=()=>105+G.level*18;
 G.update=(dt,inp)=>{pops.forEach(q=>q.t-=dt);pops=pops.filter(q=>q.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  if(deathT>0){deathT-=dt;if(deathT<=0){if(G.lives<=0)G.over=true;else reset();}return;}
  const jump=inp.f&&!held;held=inp.f;
  if(p.st==='walk'){const r=GIR[p.g];p.x=clamp(p.x+(inp.r-inp.l)*135*dt,r.a+8,r.b-8);if(inp.r)p.face=1;if(inp.l)p.face=-1;p.y=gy(p.g,p.x);
   const up=LAD.find(l=>l.g===p.g&&Math.abs(l.x-p.x)<11),down=LAD.find(l=>l.g===p.g-1&&Math.abs(l.x-p.x)<11);
   if(inp.u&&up){p.st='climb';p.lad=up;p.x=up.x;}else if(inp.d&&down){p.st='climb';p.lad=down;p.x=down.x;p.g=down.g;}
   else if(jump){p.st='jump';p.vy=-300;p.jx=(inp.r-inp.l)||0;env.beep(600,.1,'square',.03,1.6);}}
  else if(p.st==='climb'){const l=p.lad,bot=gy(l.g,l.x),top=gy(l.g+1,l.x);p.y=clamp(p.y+(inp.d-inp.u)*95*dt,top,bot);p.g=l.g;
   if(p.y<=top+.5&&inp.u){p.g=l.g+1;p.st='walk';p.lad=null;if(p.g===5){const b=5000*G.level;G.score+=b;env.beep(880,.4,'triangle',.06,1.8);banner={t:2.4,text:`LEVEL ${G.level} CLEAR!`,sub:`🏆 +${fmtN(b)}`,then:()=>{G.level++;reset();banner={t:1.4,text:`LEVEL ${G.level}`,sub:'Faster barrels!'};}};return;}}
   else if(p.y>=bot-.5&&inp.d){p.st='walk';p.lad=null;}}
  else if(p.st==='jump'){const r=GIR[p.g];p.x=clamp(p.x+p.jx*135*dt,r.a+8,r.b-8);p.vy+=900*dt;p.y+=p.vy*dt;const gnd=gy(p.g,p.x);if(p.vy>0&&p.y>=gnd){p.y=gnd;p.st='walk';}}
  // barrels
  spawn-=dt;if(spawn<=0){spawn=Math.max(.9,2.6-G.level*.25)*(0.7+Math.random()*.6);bar.push({x:205,g:4,y:gy(4,205),dir:slope(4),st:'roll',vy:0,lad:null,tried:new Set(),jumped:false,rot:0});}
  for(const b of bar){b.rot+=dt*8*b.dir;
   if(b.st==='roll'){b.x+=b.dir*spd()*dt;const r=GIR[b.g];b.y=gy(b.g,b.x);
    const l=LAD.find(l=>l.g===b.g-1&&Math.abs(l.x-b.x)<3&&!b.tried.has(l));if(l){b.tried.add(l);if(Math.random()<.28){b.st='ladder';b.lad=l;b.x=l.x;}}
    if(b.x>r.b||b.x<r.a){if(b.g===0)b.gone=true;else{b.st='fall';b.vy=0;}}}
   else if(b.st==='fall'){b.x+=b.dir*45*dt;b.vy+=700*dt;b.y+=b.vy*dt;const ng=b.g-1;if(b.y>=gy(ng,b.x)&&b.x>=GIR[ng].a-5&&b.x<=GIR[ng].b+5){b.g=ng;b.st='roll';const s=slope(ng);if(s)b.dir=s;b.y=gy(ng,b.x);}else if(b.y>H+30)b.gone=true;}
   else if(b.st==='ladder'){b.y+=spd()*.6*dt;const gnd=gy(b.lad.g,b.lad.x);if(b.y>=gnd){b.g=b.lad.g;b.y=gnd;b.st='roll';const s=slope(b.g);if(s)b.dir=s;}}
   if(b.x<-30||b.x>W+30)b.gone=true;
   // jump over = points
   if(!b.jumped&&p.st==='jump'&&b.st==='roll'&&b.g===p.g&&Math.abs(b.x-p.x)<14&&p.y<b.y-18){b.jumped=true;G.score+=1000*G.level;pops.push({x:p.x,y:p.y-40,t:.9,txt:'+'+fmtN(1000*G.level)});env.beep(1200,.12,'triangle',.05,1.3);}
   if(Math.hypot(b.x-p.x,(b.y-10)-(p.y-15))<19){G.lives--;deathT=1.4;env.beep(90,.6,'sawtooth',.07,.3);return;}}
  bar=bar.filter(b=>!b.gone);
  for(const s of stars)if(!s.got&&s.g===p.g&&Math.abs(s.x-p.x)<14&&p.st!=='climb'){s.got=true;G.score+=2000*G.level;pops.push({x:s.x,y:gy(s.g,s.x)-40,t:.9,txt:'+'+fmtN(2000*G.level)});env.beep(1500,.2,'triangle',.05,1.4);}};
 G._state=()=>({g:p.g,st:p.st,x:Math.round(p.x),y:Math.round(p.y),barrels:bar.length});
 G._clear=()=>{p.g=5;p.x=200;p.y=gy(5,200);G.update(.016,{l:0,r:0,u:0,d:0,f:0});const b=5000*G.level;G.score+=b;banner={t:1.2,text:`LEVEL ${G.level} CLEAR!`,sub:'',then:()=>{G.level++;reset();}};};
 G.render=ctx=>{ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.textBaseline='middle';
  // ladders
  ctx.strokeStyle='#3fe0ff';ctx.lineWidth=2.5;for(const l of LAD){const b=gy(l.g,l.x),t=gy(l.g+1,l.x);ctx.beginPath();ctx.moveTo(l.x-9,b);ctx.lineTo(l.x-9,t);ctx.moveTo(l.x+9,b);ctx.lineTo(l.x+9,t);for(let y=b-8;y>t;y-=10){ctx.moveTo(l.x-9,y);ctx.lineTo(l.x+9,y);}ctx.stroke();}
  // girders
  for(const r of GIR){ctx.fillStyle='#ff2d55';ctx.beginPath();ctx.moveTo(r.a,r.yl);ctx.lineTo(r.b,r.yr);ctx.lineTo(r.b,r.yr+9);ctx.lineTo(r.a,r.yl+9);ctx.closePath();ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=1.5;ctx.beginPath();for(let x=r.a;x<r.b;x+=16){const y=r.yl+(r.yr-r.yl)*(x-r.a)/(r.b-r.a);ctx.moveTo(x,y+1);ctx.lineTo(x+8,y+8);ctx.lineTo(x+16,y+1);}ctx.stroke();}
  ctx.font=`34px ${EMOJI_FONT}`;ctx.fillText('🦖',180,104-22);ctx.font=`26px ${EMOJI_FONT}`;ctx.fillText('🏆',305,104-16);
  ctx.font=`18px ${EMOJI_FONT}`;for(const s of stars)if(!s.got)ctx.fillText('⭐',s.x,gy(s.g,s.x)-16);
  for(const b of bar){ctx.save();ctx.translate(b.x,b.y-10);ctx.rotate(b.rot);ctx.fillStyle='#b5651d';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5b3010';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.stroke();ctx.restore();}
  if(!(deathT>0&&Math.floor(deathT*8)%2)){if(env.avatar&&env.avatar.complete)ctx.drawImage(env.avatar,p.x-14,p.y-36,28,35);else{ctx.font=`26px ${EMOJI_FONT}`;ctx.fillText('🧍',p.x,p.y-14);}}
  ctx.font='bold 15px monospace';ctx.fillStyle='#ffe45e';for(const q of pops){ctx.globalAlpha=Math.min(1,q.t*2);ctx.fillText(q.txt,q.x,q.y-(.9-q.t)*25);}ctx.globalAlpha=1;
  drawBanner(ctx,W,H,banner);};
 return G;}

// =====================================================================================================
// 6. TURBO RACER (top-down retro road race)
// =====================================================================================================
function makeRacer(env){
 const W=400,H=600,RW=250,PY=H-90,G={W,H,score:0,lives:3,level:1,levelName:'Stage',over:false};
 let dist=0,speed=0,px=W/2,inv=0,cars=[],coins=[],spawn=1,cspawn=2,nitro=3,boost=0,held=false,next=4000,parts=[],banner={t:1.8,text:'STAGE 1',sub:'▲ go · ▼ brake · ● nitro (3)'};
 const centre=d=>W/2+Math.sin(d/700)*55+Math.sin(d/1900+1)*35;
 const atY=y=>dist+(PY-y);   // world distance shown at screen y
 const maxV=()=>(430+G.level*40)*(boost>0?1.45:1);
 const COLS=['#2457d6','#f2c218','#1f9d55','#b45bd6','#ff8a1c','#e6e9f2'];
 G.update=(dt,inp)=>{parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.t-=dt;});parts=parts.filter(q=>q.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  const nit=inp.f&&!held;held=inp.f;if(nit&&nitro>0&&boost<=0){nitro--;boost=2.2;env.beep(300,.5,'sawtooth',.05,3);}
  if(boost>0)boost-=dt;if(inv>0)inv-=dt;
  if(inp.u||boost>0)speed+=320*dt;else if(inp.d)speed-=520*dt;else speed+=(Math.min(260,maxV())-speed)*dt*.6;
  speed=clamp(speed,0,maxV());px=clamp(px+(inp.r-inp.l)*(150+speed*.35)*dt,18,W-18);
  const off=Math.abs(px-centre(dist))>RW/2-14;if(off){speed*=Math.pow(.35,dt);if(Math.random()<.3)parts.push({x:px+R(-10,10),y:PY+20,vx:R(-40,40),vy:R(40,90),t:.4,c:'#7a5b2a'});}
  dist+=speed*dt;G.score+=Math.round(speed*dt*.35);
  spawn-=dt;if(spawn<=0){spawn=Math.max(.45,1.3-G.level*.1)*(0.6+Math.random()*.8);const wy=dist+PY+R(80,160);cars.push({lane:R(-1,1),wy,v:R(140,240)+G.level*10,c:pick(COLS),passed:false});}
  cspawn-=dt;if(cspawn<=0){cspawn=R(1,3);coins.push({lane:R(-1,1),wy:dist+PY+R(100,200)});}
  for(const c of cars)c.wy+=c.v*dt;
  const pr={x:px,y:PY};
  cars=cars.filter(c=>{const y=PY-(c.wy-dist),x=centre(c.wy)+c.lane*RW/3;if(y>H+60){return false;}if(!c.passed&&y>PY+40){c.passed=true;G.score+=200*G.level;}
   if(inv<=0&&Math.abs(x-pr.x)<26&&Math.abs(y-pr.y)<46){G.lives--;inv=2;speed*=.2;env.beep(80,.5,'sawtooth',.07,.3);for(let i=0;i<20;i++)parts.push({x:px,y:PY,vx:R(-160,160),vy:R(-160,160),t:.6,c:pick(['#ffe45e','#ff8a1c','#fff'])});if(G.lives<=0)banner={t:1.6,text:'GAME OVER',sub:'',then:()=>G.over=true};return false;}return y>-400;});
  coins=coins.filter(c=>{const y=PY-(c.wy-dist),x=centre(c.wy)+c.lane*RW/3;if(y>H+30)return false;if(Math.abs(x-px)<24&&Math.abs(y-PY)<36){G.score+=500*G.level;env.beep(1300,.12,'triangle',.05,1.4);return false;}return true;});
  if(dist>=next){const b=5000*G.level;G.score+=b;next+=4000+G.level*800;banner={t:2,text:`CHECKPOINT!`,sub:`Stage ${G.level+1} · +${fmtN(b)} · nitro refilled`,then:()=>{G.level++;nitro=3;}};env.beep(880,.4,'triangle',.06,1.8);}};
 G._clear=()=>{dist=next;G.update(.016,{l:0,r:0,u:0,d:0,f:0});};
 function car(ctx,x,y,col,me){ctx.fillStyle=col;ctx.fillRect(x-14,y-24,28,48);ctx.fillStyle='#121625';ctx.fillRect(x-17,y-18,5,12);ctx.fillRect(x+12,y-18,5,12);ctx.fillRect(x-17,y+8,5,12);ctx.fillRect(x+12,y+8,5,12);
  ctx.fillStyle=me?'#bfe9ff':'#3a3f55';ctx.fillRect(x-10,y-14,20,9);ctx.fillStyle='rgba(255,255,255,.7)';if(me){ctx.fillRect(x-3,y-24,6,48);}else ctx.fillRect(x-10,y+12,20,4);}
 G.render=ctx=>{ctx.fillStyle='#2f9a4a';ctx.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=4){const d=atY(y),c=centre(d),stripe=Math.floor(d/40)%2;ctx.fillStyle=stripe?'#2f9a4a':'#34a853';ctx.fillRect(0,y,W,4);ctx.fillStyle='#4a4f63';ctx.fillRect(c-RW/2,y,RW,4);ctx.fillStyle=stripe?'#e51c35':'#fff';ctx.fillRect(c-RW/2-8,y,8,4);ctx.fillRect(c+RW/2,y,8,4);
   if(Math.floor(d/50)%2===0){ctx.fillStyle='#e6e9f2';ctx.fillRect(c-RW/6-2,y,4,4);ctx.fillRect(c+RW/6-2,y,4,4);}}
  for(let i=0;i<8;i++){const d=Math.floor((dist+H)/150)*150-i*150,y=PY-(d-dist),c=centre(d);ctx.font=`22px ${EMOJI_FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(i%2?'🌳':'🌲',c-RW/2-40,y);ctx.fillText(i%2?'🌲':'🌳',c+RW/2+40,y+70);}
  ctx.font=`22px ${EMOJI_FONT}`;for(const c of coins){const y=PY-(c.wy-dist),x=centre(c.wy)+c.lane*RW/3;ctx.fillText('🪙',x,y);}
  for(const c of cars){const y=PY-(c.wy-dist),x=centre(c.wy)+c.lane*RW/3;car(ctx,x,y,c.c,false);}
  if(!(inv>0&&Math.floor(inv*8)%2))car(ctx,px,PY,'#e51c35',true);
  if(boost>0){ctx.fillStyle='#ff8a1c';ctx.fillRect(px-8,PY+24,6,R(10,22));ctx.fillRect(px+2,PY+24,6,R(10,22));}
  for(const q of parts){ctx.globalAlpha=q.t/.6;ctx.fillStyle=q.c;ctx.fillRect(q.x-2,q.y-2,4,4);}ctx.globalAlpha=1;
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(8,8,150,46);ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.textAlign='left';ctx.fillText(`${Math.round(speed/3)} km/h`,16,24);ctx.fillText(`Nitro: ${'🔥'.repeat(nitro)||'—'}`,16,44);
  drawBanner(ctx,W,H,banner);};
 return G;}

// =====================================================================================================
// 7. SUPER SNAKE
// =====================================================================================================
function makeSnake(env){
 const N=24,C=20,W=N*C,H=N*C,G={W,H,score:0,lives:3,level:1,levelName:'Level',over:false};
 let sn,dir,want,food,star=null,t=0,eaten=0,deathT=0,banner={t:1.6,text:'LEVEL 1',sub:'Eat the footballs! Don’t hit the walls or yourself.'};
 const free=()=>{let x,y;do{x=R(1,N-2);y=R(1,N-2);}while(sn.some(s=>s[0]===x&&s[1]===y)||(food&&food[0]===x&&food[1]===y));return[x,y];};
 function reset(){sn=[[8,12],[7,12],[6,12]];dir=[1,0];want=[1,0];food=free();star=null;}
 reset();
 const interval=()=>Math.max(.055,.14-G.level*.012);
 G.update=(dt,inp)=>{if(banner){banner.t-=dt;if(banner.t<=0){const f=banner.then;banner=null;if(f)f();}return;}
  if(deathT>0){deathT-=dt;if(deathT<=0){if(G.lives<=0)G.over=true;else reset();}return;}
  if(inp.l)want=[-1,0];else if(inp.r)want=[1,0];else if(inp.u)want=[0,-1];else if(inp.d)want=[0,1];
  if(star){star.t-=dt;if(star.t<=0)star=null;}
  t+=dt;if(t<interval())return;t=0;if(!(want[0]===-dir[0]&&want[1]===-dir[1]))dir=want;
  const h=[sn[0][0]+dir[0],sn[0][1]+dir[1]];
  if(h[0]<1||h[1]<1||h[0]>N-2||h[1]>N-2||sn.some(s=>s[0]===h[0]&&s[1]===h[1])){G.lives--;deathT=1.2;env.beep(90,.5,'sawtooth',.07,.3);return;}
  sn.unshift(h);
  if(h[0]===food[0]&&h[1]===food[1]){eaten++;G.score+=500*G.level;env.beep(900,.08,'square',.04,1.3);food=free();if(eaten%5===0)star={p:free(),t:6};
   if(eaten%8===0){const b=5000*G.level;G.score+=b;banner={t:1.8,text:`LEVEL ${G.level+1}!`,sub:`+${fmtN(b)} · a bit faster`,then:()=>{G.level++;}};}}
  else if(star&&h[0]===star.p[0]&&h[1]===star.p[1]){G.score+=3000*G.level;star=null;env.beep(1500,.2,'triangle',.06,1.4);}
  else sn.pop();};
 G.swipe=(dx,dy)=>{want=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];};
 G._clear=()=>{eaten=7;food=[sn[0][0]+dir[0],sn[0][1]+dir[1]];};
 G.render=ctx=>{ctx.fillStyle='#0f2a17';ctx.fillRect(0,0,W,H);ctx.fillStyle='#14361e';for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++)if((x+y)%2)ctx.fillRect(x*C,y*C,C,C);
  ctx.fillStyle='#ff8a1c';ctx.fillRect(0,0,W,C);ctx.fillRect(0,H-C,W,C);ctx.fillRect(0,0,C,H);ctx.fillRect(W-C,0,C,H);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`17px ${EMOJI_FONT}`;ctx.fillText('⚽',food[0]*C+C/2,food[1]*C+C/2+1);if(star)ctx.fillText('⭐',star.p[0]*C+C/2,star.p[1]*C+C/2+1);
  sn.forEach((s,i)=>{ctx.fillStyle=deathT>0&&Math.floor(deathT*8)%2?'#fff':i?(i%2?'#3cc46a':'#34b35f'):'#9dff2e';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(s[0]*C+1,s[1]*C+1,C-2,C-2,6);else ctx.rect(s[0]*C+1,s[1]*C+1,C-2,C-2);ctx.fill();});
  const h=sn[0];ctx.fillStyle='#121625';ctx.beginPath();ctx.arc(h[0]*C+C/2+dir[0]*3-dir[1]*4,h[1]*C+C/2+dir[1]*3-dir[0]*4,2.4,0,Math.PI*2);ctx.arc(h[0]*C+C/2+dir[0]*3+dir[1]*4,h[1]*C+C/2+dir[1]*3+dir[0]*4,2.4,0,Math.PI*2);ctx.fill();
  drawBanner(ctx,W,H,banner);};
 return G;}
GAME_LIST.push({id:'ladder',name:'Ladder Dash',icon:'🪜',desc:'Climb the girders, jump the rolling barrels, grab the trophy!'},{id:'racer',name:'Turbo Racer',icon:'🏎️',desc:'Race the winding road — dodge traffic, grab coins, use nitro!'},{id:'snake',name:'Super Snake',icon:'🐍',desc:'Eat footballs to grow. Don’t bite your tail!'});
Object.assign(PADS,{ladder:[['l','r'],['u','d','f']],racer:[['l','r'],['d','u','f']],snake:[['l','r'],['u','d']]});
Object.assign(GAMES,{ladder:makeLadder,racer:makeRacer,snake:makeSnake});
