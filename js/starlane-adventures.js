// Starlane Trader — Adventures. Each adventure is a short script of scenes:
//   story  — Nova tells the story (with a picture)
//   choose — pick one answer (or several, with many:true); questions can differ by age level
//   order  — put the steps in the right order
//   code   — type a number
//   flight — a task out in space, with a goal, a timer and on-screen guidance
// The game supplies the runtime (A) with the world, rewards and drawing helpers.
'use strict';
const StarAdv=(()=>{
 const q=(young,mid,older)=>({young,mid:mid||young,older:older||mid||young});
 // ---------------- pictures ----------------
 const art={
  canister(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2+6;c.fillStyle='#3a4256';c.fillRect(cx-70,cy-40,140,80);c.fillStyle='#ffb020';c.fillRect(cx-70,cy-40,140,10);c.fillRect(cx-70,cy+30,140,10);
   c.fillStyle='#10141f';c.fillRect(cx-36,cy-18,72,30);c.fillStyle=Math.floor(t*2)%2?'#ff2d55':'#7a1020';c.font='bold 22px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('00:'+String(59-Math.floor(t)%60).padStart(2,'0'),cx,cy-2);
   for(const[col,dx]of[['#ff2d55',-40],['#3fe0ff',0],['#ffe45e',40]]){c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.moveTo(cx+dx,cy+40);c.quadraticCurveTo(cx+dx+12,cy+62,cx+dx-6,cy+70);c.stroke();}},
  lab(c,x,y,w,h){const items=[['🍋','Lemon juice'],['🧂','Salt'],['🥄','Baking soda'],['🍬','Sugar'],['💧','Water'],['🫙','Vinegar']];items.forEach(([e,l],i)=>{const ix=x+20+i*(w-40)/6;c.font='30px serif';c.textAlign='left';c.textBaseline='top';c.fillText(e,ix+10,y+30);c.fillStyle='#c8d0ff';c.font='11px sans-serif';c.fillText(l,ix,y+76);});},
  radio(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2;c.fillStyle='#262c3c';c.fillRect(cx-120,cy-50,240,100);c.fillStyle='#0b1220';c.fillRect(cx-100,cy-34,120,50);c.strokeStyle='#3fe0ff';c.lineWidth=2;c.beginPath();for(let i=0;i<120;i++){const yy=cy-9+Math.sin(i*.9+t*20)*Math.random()*14;i?c.lineTo(cx-100+i,yy):c.moveTo(cx-100+i,yy);}c.stroke();
   for(const dx of[50,90]){c.fillStyle='#9aa1ad';c.beginPath();c.arc(cx+dx-20,cy-6,14,0,7);c.fill();}c.fillStyle='#ff2d55';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText('NO SIGNAL',cx-40,cy+34);},
  circuit(c,x,y,w,h){const cx=x+w/2,cy=y+h/2;c.strokeStyle='#c8d0ff';c.lineWidth=3;c.strokeRect(cx-120,cy-45,240,90);c.fillStyle='#0a0f1e';c.fillRect(cx-135,cy-12,30,24);c.fillStyle='#ffe45e';c.font='bold 12px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('+ −',cx-120,cy);
   c.fillStyle='#0a0f1e';c.beginPath();c.arc(cx+120,cy,14,0,7);c.fill();c.strokeStyle='#ffe45e';c.stroke();c.fillStyle='#ffe45e';c.fillText('💡',cx+120,cy);c.fillStyle='#0a0f1e';c.fillRect(cx-10,cy-52,20,14);c.fillStyle='#ff2d55';c.fillText('GAP',cx,cy-58);},
  alien(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2+10+Math.sin(t*3)*4;c.fillStyle='#7cff9a';c.beginPath();c.ellipse(cx,cy,48,36,0,0,7);c.fill();c.fillStyle='#fff';for(const dx of[-16,16]){c.beginPath();c.arc(cx+dx,cy-8,11,0,7);c.fill();}c.fillStyle='#111';for(const dx of[-14,18]){c.beginPath();c.arc(cx+dx,cy-7,5,0,7);c.fill();}
   c.strokeStyle='#3a9a44';c.lineWidth=3;for(const dx of[-20,20]){c.beginPath();c.moveTo(cx+dx,cy-30);c.lineTo(cx+dx*1.6,cy-56);c.stroke();c.fillStyle='#ffe45e';c.beginPath();c.arc(cx+dx*1.6,cy-56,5,0,7);c.fill();}c.fillStyle='#fff';c.fillRect(cx-12,cy+12,6,8);c.fillRect(cx+6,cy+12,6,8);},
  blackhole(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2;for(let i=0;i<40;i++){const a=i/40*Math.PI*2+t*.8,r=20+(i%8)*10;c.strokeStyle=`hsla(${30+i*4},100%,60%,.55)`;c.lineWidth=2;c.beginPath();c.arc(cx,cy,r,a,a+.8);c.stroke();}c.fillStyle='#000';c.beginPath();c.arc(cx,cy,24,0,7);c.fill();c.strokeStyle='#ffb020';c.lineWidth=2;c.beginPath();c.ellipse(cx,cy,96,16,-.25,0,7);c.stroke();},
  earth(c,x,y,w,h,t){const cx=x+w/2-40,cy=y+h/2+10;const g=c.createRadialGradient(cx-20,cy-20,8,cx,cy,64);g.addColorStop(0,'#7ec8ff');g.addColorStop(.6,'#1e6fd9');g.addColorStop(1,'#08204a');c.fillStyle=g;c.beginPath();c.arc(cx,cy,60,0,7);c.fill();
   c.fillStyle='#3a9a44';for(const[dx,dy,r]of[[-18,-10,16],[14,12,20],[24,-26,10]]){c.beginPath();c.arc(cx+dx,cy+dy,r,0,7);c.fill();}const sx=cx+110,sy=cy-36+Math.sin(t)*3;c.fillStyle='#c0c4cc';c.fillRect(sx-8,sy-8,16,16);c.fillStyle='#3fa9ff';c.fillRect(sx-34,sy-5,22,10);c.fillRect(sx+12,sy-5,22,10);c.fillStyle='#ff2d55';c.beginPath();c.arc(sx,sy+12,3,0,7);c.fill();},
  sun(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2;const g=c.createRadialGradient(cx,cy,10,cx,cy,70);g.addColorStop(0,'#fff6c0');g.addColorStop(.5,'#ffb020');g.addColorStop(1,'rgba(255,90,0,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,70,0,7);c.fill();
   c.strokeStyle='#3fe0ff';c.setLineDash([5,5]);c.lineWidth=2;c.beginPath();c.moveTo(x+20,y+h-20);c.quadraticCurveTo(cx+10,cy-110,x+w-20,y+h-30);c.stroke();c.setLineDash([]);c.fillStyle='#ffe45e';c.beginPath();const k=(t*.3)%1,px=(1-k)*(1-k)*(x+20)+2*(1-k)*k*(cx+10)+k*k*(x+w-20),py=(1-k)*(1-k)*(y+h-20)+2*(1-k)*k*(cy-110)+k*k*(y+h-30);c.arc(px,py,5,0,7);c.fill();},
  pulses(c,x,y,w,h,t){const n=[2,3,5,7,11];let px=x+30;c.fillStyle='#b45bd6';n.forEach((k,i)=>{for(let j=0;j<k;j++){const on=(t*4|0)%20>i*3;c.globalAlpha=on?1:.25;c.beginPath();c.arc(px+j*7,y+h/2,3,0,7);c.fill();}px+=k*7+18;});c.globalAlpha=1;c.fillStyle='#c8d0ff';c.font='bold 16px monospace';c.textAlign='left';c.fillText('?',px+4,y+h/2+6);},
  binary(c,x,y,w,h){c.font='bold 40px monospace';c.textAlign='center';c.textBaseline='middle';const s='1 0 1';c.fillStyle='#3cff6a';c.fillText(s,x+w/2,y+h/2-10);c.fillStyle='#9aa3c7';c.font='12px sans-serif';c.fillText('fours · twos · ones',x+w/2,y+h/2+28);},
  asteroid(c,x,y,w,h,t){const px=x+w-80,py=y+h/2+10;const g=c.createRadialGradient(px-12,py-12,5,px,py,46);g.addColorStop(0,'#7ec8ff');g.addColorStop(1,'#123a7a');c.fillStyle=g;c.beginPath();c.arc(px,py,46,0,7);c.fill();
   const ax=x+60+((t*12)%60),ay=y+40;c.fillStyle='#8d949e';c.beginPath();for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=20+(i%3)*5;i?c.lineTo(ax+Math.cos(a)*r,ay+Math.sin(a)*r):c.moveTo(ax+Math.cos(a)*r,ay+Math.sin(a)*r);}c.closePath();c.fill();c.strokeStyle='rgba(255,45,85,.7)';c.setLineDash([4,5]);c.beginPath();c.moveTo(ax,ay);c.lineTo(px,py);c.stroke();c.setLineDash([]);},
  gravity(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2;[['✏️',-80,-20],['🥪',0,10],['📘',70,-30],['🔧',40,30]].forEach(([e,dx,dy],i)=>{c.save();c.translate(cx+dx,cy+dy+Math.sin(t*1.5+i)*8);c.rotate(Math.sin(t+i)*.6);c.font='30px serif';c.textAlign='center';c.textBaseline='middle';c.fillText(e,0,0);c.restore();});},
  plant(c,x,y,w,h,t){const cx=x+w/2,by=y+h-20;c.fillStyle='#b5582c';c.fillRect(cx-30,by-26,60,26);c.strokeStyle='#3a9a44';c.lineWidth=4;c.beginPath();c.moveTo(cx,by-26);c.lineTo(cx,by-90);c.stroke();for(const[s,yy]of[[-1,-50],[1,-66],[-1,-82]]){c.fillStyle='#3cb44a';c.beginPath();c.ellipse(cx+s*20,by+yy,22,9,s*.5,0,7);c.fill();}c.fillStyle='rgba(255,228,94,.5)';c.beginPath();c.arc(x+w-50,y+30,18,0,7);c.fill();},
  bulbs(c,x,y,w,h,t){const n=4;c.strokeStyle='#c8d0ff';c.lineWidth=3;c.beginPath();c.moveTo(x+30,y+h/2);c.lineTo(x+w-30,y+h/2);c.stroke();for(let i=0;i<n;i++){const bx=x+60+i*(w-120)/(n-1),on=i!==1&&Math.floor(t*2)%2;c.fillStyle=i===1?'#333':on?'#ffe45e':'#665a20';c.beginPath();c.arc(bx,y+h/2-16,14,0,7);c.fill();if(i===1){c.strokeStyle='#ff2d55';c.beginPath();c.moveTo(bx-8,y+h/2-24);c.lineTo(bx+8,y+h/2-8);c.stroke();c.strokeStyle='#c8d0ff';}}},
  keypad(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2;c.fillStyle='#262c3c';c.fillRect(cx-70,cy-55,140,110);c.fillStyle='#0b1220';c.fillRect(cx-56,cy-46,112,26);c.fillStyle='#3cff6a';c.font='bold 18px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('1 1 0 1',cx,cy-33);for(let i=0;i<9;i++){c.fillStyle='#9aa1ad';c.fillRect(cx-52+(i%3)*36,cy-12+Math.floor(i/3)*20,30,15);}},
  snow(c,x,y,w,h,t){c.strokeStyle='#bfe9ff';c.lineWidth=3;for(let k=0;k<6;k++){const sx=x+40+k*((w-80)/5),sy=y+30+((t*20+k*30)%(h-50));for(let a=0;a<6;a++){const an=a*Math.PI/3;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(an)*10,sy+Math.sin(an)*10);c.stroke();}}c.fillStyle='#5d6888';c.fillRect(x+20,y+h-28,w-40,14);c.fillStyle='#bfe9ff';c.fillRect(x+60,y+h-32,60,6);},
  comet(c,x,y,w,h,t){const hx=x+w*.65,hy=y+h*.45,g=c.createLinearGradient(hx,hy,x+20,y+h-20);g.addColorStop(0,'rgba(191,233,255,.9)');g.addColorStop(1,'rgba(191,233,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(hx,hy-8);c.lineTo(x+20,y+h-40);c.lineTo(x+60,y+h-10);c.lineTo(hx,hy+8);c.closePath();c.fill();c.fillStyle='#ffffff';c.beginPath();c.arc(hx,hy,9,0,7);c.fill();c.fillStyle='#ffb020';c.beginPath();c.arc(x+w-30,y+24,14,0,7);c.fill();},
  nebula(c,x,y,w,h,t){for(const[px,py,r,col]of[[.3,.4,70,'180,91,214'],[.65,.55,80,'63,224,255'],[.5,.3,60,'255,90,140']]){const g=c.createRadialGradient(x+w*px,y+h*py,5,x+w*px,y+h*py,r);g.addColorStop(0,`rgba(${col},.55)`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.fillRect(x,y,w,h);}for(let k=0;k<3;k++){c.fillStyle=Math.floor(t*3+k)%3===0?'#ffffff':'#7fe9ff';c.beginPath();c.arc(x+60+k*(w-120)/2,y+h-30-k*20,4,0,7);c.fill();}},
  derelict(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2;c.fillStyle='#5a5f6b';c.fillRect(cx-120,cy-14,240,28);c.fillStyle='#454a55';for(let i=0;i<5;i++)c.fillRect(cx-100+i*44,cy-30,26,60);c.fillStyle='#3a3f4a';c.beginPath();c.arc(cx+130,cy,20,0,7);c.fill();for(let i=0;i<5;i++){c.fillStyle=Math.floor(t*2+i)%4===0?'#3fe0ff':'#123a4a';c.fillRect(cx-94+i*44,cy-6,14,12);}},
  flare(c,x,y,w,h,t){const sx=x+50,sy=y+h/2,g=c.createRadialGradient(sx,sy,10,sx,sy,90);g.addColorStop(0,'#fff6c0');g.addColorStop(.5,'#ff8a1c');g.addColorStop(1,'rgba(255,60,0,0)');c.fillStyle=g;c.beginPath();c.arc(sx,sy,90,0,7);c.fill();
   c.strokeStyle='rgba(255,140,40,.7)';c.lineWidth=4;for(let k=0;k<5;k++){c.beginPath();c.moveTo(sx+40,sy-30+k*15);c.lineTo(sx+60+((t*120+k*40)%200),sy-30+k*15+Math.sin(t*4+k)*8);c.stroke();}const px=x+w-80,py=y+h/2;c.fillStyle='#1e6fd9';c.beginPath();c.arc(px,py,36,0,7);c.fill();c.fillStyle='rgba(0,0,0,.6)';c.beginPath();c.arc(px,py,36,-Math.PI/2,Math.PI/2);c.fill();c.fillStyle='rgba(60,255,106,.25)';c.fillRect(px+36,py-30,60,60);},
  ship(c,x,y,w,h,t){const cx=x+w/2,cy=y+h/2;c.fillStyle='#ffd84a';c.beginPath();c.moveTo(cx+60,cy);c.lineTo(cx-40,cy-26);c.lineTo(cx-28,cy);c.lineTo(cx-40,cy+26);c.closePath();c.fill();c.fillStyle='#3fe0ff';c.beginPath();c.arc(cx-44,cy,6+Math.sin(t*10)*2,0,7);c.fill();}
 };
 // ---------------- the adventures ----------------
 const LIST=[
  {id:'canister',kind:'ship',icon:'🧪',title:'The Ticking Canister',subject:'Chemistry · Physics',trigger:'kill',reward:{cr:180},
   fail:A=>{A.hurtHull(.1);const lost=A.loseCargo(1);return`The canister popped with a bang and a lot of smoke. ${lost?'You lost a tonne of cargo and ':''}the hull took a scratch. No harm done — but it was close!`;},
   scenes:[
    {type:'story',art:'canister',say:'You scooped up a cargo canister after the fight… and it is ticking! The pirates have hidden a bomb inside. Don’t panic, Commander — we can make it safe.'},
    {type:'story',art:'lab',say:'Nova scans it: the trigger is a tiny tank of strong acid. If we neutralise the acid, the trigger cannot work. Here is what we have in the galley.'},
    {type:'choose',art:'lab',q:q('An alkali is the opposite of an acid. Which of these is an ALKALI?','The trigger is full of acid. Which item will NEUTRALISE it?','The trigger contains a strong acid (pH 2). Which substance is a BASE that will neutralise it?'),
     options:['Lemon juice','Baking soda','Vinegar','Salt'],answer:1,explain:'Baking soda is an alkali (a base). Acids and alkalis cancel each other out — that is called neutralisation. Lemon juice and vinegar are acids, so they would make it worse!'},
    {type:'choose',art:'lab',q:q('What do you get when an acid and an alkali cancel each other out?','When an acid is neutralised by an alkali, what is made?','Complete the word equation: acid + base → ?'),
     options:['Salt and water','Fire and smoke','More acid','Sugar and air'],answer:0,explain:'Acid + alkali → a salt + water. That is why neutralising is safe: you end up with salty water.'},
    {type:'story',art:'circuit',say:'The acid is neutralised — the trigger is dead. One last thing: the timer is still powered by a little circuit. We must break the circuit to switch it off.'},
    {type:'choose',art:'circuit',q:q('A bulb only lights if the circuit is a complete loop. What will switch the timer off?','To stop the timer, what do we need to do to its circuit?','The timer is wired in a simple series circuit. What will stop the current?'),
     options:['Add another battery','Make a gap in the loop','Add another bulb','Paint the wires red'],answer:1,explain:'Electricity only flows around a complete loop. Make a gap anywhere in a series circuit and the current stops — so the timer stops too.'},
    {type:'story',art:'canister',say:'Click… silence. The bomb is safe! Inside, under the trigger, is a little stash of credits the pirates were hiding. Brilliant work, Commander.'}]},
  {id:'radio',kind:'ship',icon:'📻',title:'Radio Silence',subject:'Physics',trigger:'calm',reward:{cr:140},
   fail:A=>{A.fine(30);return'The radio stayed silent, and station control fined you 30 credits for not answering their calls. Next time you will crack it!';},
   scenes:[
    {type:'story',art:'radio',say:'Crackle… hiss… nothing. The radio has died, and station control cannot reach us. A wire inside has snapped. Let’s fix it ourselves.'},
    {type:'choose',art:'radio',q:q('We need something to join the broken wire. Which one lets electricity through?','Which of these is a good electrical CONDUCTOR?','Which material would best repair a break in a circuit?'),
     options:['Plastic ruler','Copper wire','Wooden pencil','Rubber band'],answer:1,explain:'Metals like copper are conductors — electricity flows through them easily. Plastic, wood and rubber are insulators, which is why wires are covered in plastic.'},
    {type:'order',art:'radio',q:q('Put the repair steps in a SAFE order.','Put these steps in the safest order.','Order the repair steps safely.'),
     items:['Switch the power off','Open the radio panel','Join the wire with copper','Close the panel','Switch the power on'],explain:'Always switch the power off before touching wires, and only switch it back on when everything is closed up.'},
    {type:'choose',art:'circuit',q:q('The wire is fixed. Will the bulb light now that the loop has no gaps?','Now the circuit is a complete loop with a battery. What happens?','The circuit is now complete. What happens to the current?'),
     options:['Nothing happens','The bulb lights up — current flows','The battery explodes','The wires freeze'],answer:1,explain:'A complete loop with a power source lets current flow, so the bulb lights — and the radio comes back to life.'},
    {type:'story',art:'radio',say:'“…Commander, do you read? Good to hear you!” The radio is back. Station control sends a thank-you for keeping the space lanes in touch.'}]},
  {id:'stowaway',kind:'ship',icon:'👾',title:'The Stowaway',subject:'Biology',trigger:'calm',reward:{cr:120,item:'p_bobble'},
   fail:A=>{const lost=A.loseCargo(1,0);return`The hungry little stowaway munched ${lost?'a tonne of your food':'some snacks'} and wriggled out through an air vent. It seemed happy enough!`;},
   scenes:[
    {type:'story',art:'alien',say:'Something is moving in the cargo hold… It’s a small alien creature! It must have crept aboard at the last station. It looks hungry. Let’s look after it.'},
    {type:'choose',art:'alien',q:q('Look at its teeth: they are flat, like a cow’s. What does it probably eat?','Its teeth are flat and wide, good for grinding. What kind of eater is it?','Flat, grinding teeth suggest which kind of diet?'),
     options:['Meat — it is a carnivore','Plants — it is a herbivore','Rocks','Metal'],answer:1,explain:'Flat, grinding teeth are for chewing plants — herbivores have them. Carnivores have sharp, pointed teeth for tearing meat.'},
    {type:'order',art:'alien',q:q('Make a food chain, starting with where the energy comes from.','Put this food chain in order, from the energy source.','Arrange the food chain from the source of energy.'),
     items:['The Sun','Space grass','Our little alien','A big space owl'],explain:'Food chains start with the Sun. Plants use sunlight to make food, plant-eaters eat the plants, and predators eat the plant-eaters.'},
    {type:'choose',many:true,art:'alien',q:q('Which THREE things does every living thing need?','Pick the THREE things all animals need to stay alive.','Select the THREE essentials for an animal to survive.'),
     options:['Water','Food','Air (oxygen)','A television','Gold'],answer:[0,1,2],explain:'All animals need water, food and air. (Televisions and gold are optional!)'},
    {type:'story',art:'alien',say:'Fed, watered and happy, the little alien curls up on your dashboard and refuses to leave. You have a new friend — and the station pays a reward for looking after a lost creature.'}]},
  {id:'timewarp',kind:'space',icon:'🕳️',title:'The Black-Hole Time-Warp',subject:'Space science · Physics',trigger:'hyper',reward:{cr:450,equip:'tractor'},
   fail:A=>{A.loseDays(1);A.useFuel(1);return'The slingshot was not quite right, so the trip home took a little longer and used a light year of fuel. History is safe though — just!';},
   scenes:[
    {type:'story',art:'blackhole',say:'Warning! A black hole has appeared in our hyperspace tunnel! Hold on… we are being thrown… back… in time!'},
    {type:'story',art:'earth',setup:'earth',say:'We have landed near a blue planet, a long time ago. And look: a brand new space weapon, just launched. Our history says it never existed — so it must not be allowed to stay.'},
    {type:'choose',art:'earth',q:q('Clues: a blue and green planet, third from its star, with one big moon. Where are we?','A blue planet, third from its sun, with one large moon. Which planet is it?','Third planet from its star, liquid water oceans and one large natural satellite. Which planet?'),
     options:['Mars','Earth','Jupiter','Venus'],answer:1,explain:'Earth is the third planet from the Sun, has oceans of liquid water and one big moon. Mars is red, Jupiter is a gas giant, and Venus is covered in clouds.'},
    {type:'story',art:'earth',say:'We need it to look like an accident. Good news: Nova has been testing a prototype tractor beam! We can tow a small meteor into the weapon, and everyone will think nature did it.'},
    {type:'flight',setup:'meteor',goal:'Fly to the meteor, hold FIRE near it to grab it with the tractor beam, then tow it into the weapon satellite.',time:150},
    {type:'story',art:'earth',say:'Direct hit! The weapon is destroyed by a “meteor”. The government that launched it quietly pretends it was never there. History is safe! Now, how do we get home?'},
    {type:'choose',art:'sun',q:q('To go back to our own time, we need a big burst of speed. What can give us a free speed boost?','How can we gain a lot of speed for free?','Which manoeuvre lets a spacecraft gain speed from a massive body?'),
     options:['Switch the engines off','Swing close past the Sun — its gravity speeds us up','Fly away from everything','Open the windows'],answer:1,explain:'A gravity slingshot: falling towards a massive object like the Sun speeds you up. Real space probes use planets this way to save fuel.'},
    {type:'flight',setup:'slingshot',goal:'Dive towards the Sun and fly through the glowing slingshot point FAST (over 250). Hold Shift to boost!',time:150},
    {type:'story',art:'blackhole',setup:'home',say:'Whoosh! The slingshot flings us back through the time-warp… and home to our own time. The prototype tractor beam is yours to keep!'}]},
  {id:'contact',kind:'space',icon:'👽',title:'First Contact',subject:'Maths · Computing',trigger:'calm',reward:{cr:300},
   fail:A=>'The aliens waited, flashed their lights politely, and zoomed away. Maybe they will come back another day!',
   scenes:[
    {type:'story',art:'pulses',setup:'aliens',say:'An unknown ship has appeared — and it is not attacking. It is flashing lights at us in groups: two, three, five, seven, eleven… It is a message!'},
    {type:'code',art:'pulses',q:q('The groups go 2, 3, 5, 7, 11… These numbers can only be divided by 1 and themselves. What number comes next?','2, 3, 5, 7, 11… these are prime numbers. Which prime comes next?','The sequence is the prime numbers. Enter the next term after 11.'),answer:'13',explain:'Prime numbers can only be divided by 1 and themselves: 2, 3, 5, 7, 11, 13, 17… The aliens chose primes because any clever species would recognise them!'},
    {type:'code',art:'binary',q:q('Now they send this in binary: 1 0 1. The places mean fours, twos and ones. What number is it?','They send 1 0 1 in binary (fours, twos, ones). What number is that?','Convert the binary number 101 to decimal.'),answer:'5',explain:'Binary uses only 1s and 0s. 101 means one four, no twos and one one: 4 + 0 + 1 = 5. Computers store every number this way.'},
    {type:'choose',art:'binary',q:q('Which reply is the friendliest way to say hello back?','How should we reply to show we understood?','Which reply best demonstrates mutual understanding?'),
     options:['Flash the next prime, 17','Fire a missile','Turn all our lights off','Flash random numbers'],answer:0,explain:'Sending the next prime shows we understood their message — maths is a language that all clever beings can share.'},
    {type:'story',art:'pulses',say:'The alien ship flashes a happy pattern and beams over a gift of credits, then glides off into the stars. You have made First Contact, Commander!'}]},
  {id:'planetkiller',kind:'space',icon:'☄️',title:'Planet-Killer',subject:'Physics · Space science',trigger:'calm',reward:{cr:380},
   fail:A=>{A.hurtHull(.1);return'The asteroid scraped past the planet with a fiery streak — everyone is safe, but our hull got singed on the way. Good try!';},
   scenes:[
    {type:'story',art:'asteroid',setup:'rock',say:'Alert! An asteroid is heading towards the planet. There is no time to blow it up — and that would just make lots of smaller rocks. We need to nudge it off course.'},
    {type:'choose',art:'asteroid',q:q('Is it better to nudge it early (far away) or late (close to the planet)?','When should we push the asteroid — early or late?','To change where an asteroid ends up, when is a small push most effective?'),
     options:['Early — a tiny push grows into a big miss','Late — just before it hits','It makes no difference','Never — leave it alone'],answer:0,explain:'A small push early on adds up over a long journey, so the asteroid misses by a lot. Late pushes need to be enormous.'},
    {type:'choose',art:'asteroid',q:q('Our ship has gravity, just like the asteroid. If we fly next to it and stay there, what happens?','What does a “gravity tractor” do?','How does a gravity tractor change an asteroid’s path?'),
     options:['Nothing at all','Our gravity gently pulls it towards us, off course','It turns the rock into gold','It makes the rock spin faster'],answer:1,explain:'Everything with mass pulls on everything else. Staying close to the asteroid lets our ship’s tiny gravity tug it, slowly but surely, off course.'},
    {type:'flight',setup:'tractor',goal:'Fly to the asteroid, then stay close (inside the ring) and slow (under 60) for 15 seconds.',time:150},
    {type:'story',art:'asteroid',say:'It worked! The asteroid’s path has bent just enough to miss the planet. The planet’s people send a grateful reward.'}]},
  // ---------------- batch 2 ----------------
  {id:'gravity',kind:'ship',icon:'🪐',title:'Gravity Gone',subject:'Physics · Maths',trigger:'calm',reward:{cr:150},
   fail:A=>{A.hurtHull(.05);return'Everything floated about and bumped into the walls before the generator came back on by itself. A few dents, nothing more!';},
   scenes:[
    {type:'story',art:'gravity',say:'Uh-oh… your pencil is floating. So is your sandwich. The artificial gravity generator has switched off! Let’s work out what is going on before we fix it.'},
    {type:'choose',art:'gravity',q:q('You still have the same amount of stuff in you when you float. What is that called?','Floating, your WEIGHT is zero — but what stays the same?','In zero gravity, which quantity is unchanged: mass or weight?'),
     options:['Your mass','Your weight','Your height in metres per second','Your temperature'],answer:0,explain:'Mass is how much stuff is in you — it never changes. Weight is the pull of gravity on that mass, so with no gravity your weight is zero but your mass is the same.'},
    {type:'choose',art:'gravity',q:q('On the Moon (no air), an astronaut drops a hammer and a feather together. Which lands first?','With no air to slow them, which falls faster: a hammer or a feather?','In a vacuum, how do a hammer and a feather fall?'),
     options:['The hammer','The feather','They land together','Neither — they float'],answer:2,explain:'Without air resistance, gravity makes everything fall at the same rate. An Apollo astronaut really did this on the Moon — they landed together!'},
    {type:'code',art:'gravity',q:q('The Moon’s gravity is 1/6 of Earth’s. A box weighs 60 on Earth scales. What will it weigh on the Moon?','Moon gravity is one sixth of Earth’s. Something weighing 60 on Earth weighs how much on the Moon?','If g(Moon) = g(Earth) ÷ 6, what does a 60 N weight become on the Moon?'),answer:'10',explain:'60 ÷ 6 = 10. Gravity on the Moon is much weaker, so everything weighs a sixth of its Earth weight.'},
    {type:'story',art:'gravity',say:'You set the generator to “Earth normal” and — thud — everything drops back down. Your sandwich is a bit squashed, but the ship is back to normal.'}]},
  {id:'greenhouse',kind:'ship',icon:'🌱',title:'Greenhouse Crisis',subject:'Biology',trigger:'calm',reward:{cr:140},
   fail:A=>{A.loseCargo(1,0);return'Some of the plants wilted, so you used a tonne of food rations instead. They will grow back!';},
   scenes:[
    {type:'story',art:'plant',say:'The little greenhouse that grows fresh food on board is in trouble. The leaves are going yellow and droopy. Let’s nurse the plants back to health.'},
    {type:'choose',many:true,art:'plant',q:q('Which THREE things do plants need to make their food?','Pick the THREE things a plant needs for photosynthesis.','Select the THREE inputs of photosynthesis.'),
     options:['Light','Water','Carbon dioxide (from the air)','Chocolate','Darkness'],answer:[0,1,2],explain:'Plants make their own food using light, water and carbon dioxide. That is called photosynthesis.'},
    {type:'choose',art:'plant',q:q('Which part of the plant catches the light and makes the food?','Where does most photosynthesis happen?','Which organ contains most of the chloroplasts?'),
     options:['The roots','The leaves','The flowers','The pot'],answer:1,explain:'Leaves are green because they contain chlorophyll, which traps light energy to make food. Roots take in water from the soil.'},
    {type:'choose',art:'plant',q:q('Plants give out a gas that we need to breathe. Which one?','What useful gas do plants give out?','Which gas is released as a product of photosynthesis?'),
     options:['Oxygen','Smoke','Helium','Carbon dioxide'],answer:0,explain:'Plants give out oxygen, which we breathe in. We breathe out carbon dioxide, which plants use. A perfect team!'},
    {type:'story',art:'plant',say:'With the grow-lights back on and fresh water, the plants perk up. Soon you have a crop of space tomatoes to sell!'}]},
  {id:'lights',kind:'ship',icon:'💡',title:'Lights Out',subject:'Physics',trigger:'calm',reward:{cr:150},
   fail:A=>{A.fine(25);return'You had to call out an electrician from the station, who charged 25 credits. The lights are fine now!';},
   scenes:[
    {type:'story',art:'bulbs',say:'Pop! One cabin light has blown — and every light in the ship has gone out with it. Strange… Let’s work out why.'},
    {type:'choose',art:'bulbs',q:q('The lights are on ONE loop of wire, one after another. If one bulb breaks, what happens?','The bulbs are wired in SERIES. Why did they all go out?','Why does one failed bulb stop current in a series circuit?'),
     options:['The others get brighter','The loop is broken, so they all go out','Nothing happens','Only half go out'],answer:1,explain:'In a series circuit there is only one path. A broken bulb makes a gap, so no current flows and every bulb goes out.'},
    {type:'choose',art:'bulbs',q:q('How should we wire the new lights so one broken bulb does not turn off the rest?','Which kind of circuit keeps the other bulbs lit if one breaks?','Which arrangement gives each bulb its own path?'),
     options:['In series again','In parallel — each bulb has its own loop','With no battery','With longer wires'],answer:1,explain:'In a parallel circuit each bulb has its own path back to the battery, so if one breaks the others stay on. That is how homes are wired.'},
    {type:'code',art:'bulbs',q:q('We have 4 corridors with 3 bulbs each. How many new bulbs do we need?','4 corridors × 3 bulbs each = how many bulbs?','Each of 4 corridors needs 3 bulbs. Total bulbs?'),answer:'12',explain:'4 × 3 = 12 bulbs.'},
    {type:'story',art:'bulbs',say:'With the lights rewired in parallel, they all glow brightly — and if one ever blows again, the rest will stay on.'}]},
  {id:'armoury',kind:'ship',icon:'🔐',title:'The Locked Armoury',subject:'Computing · Maths',trigger:'kill',reward:{cr:200},
   fail:A=>{A.fine(40);return'You had to pay a locksmith 40 credits to open the armoury. Your missiles are safe!';},
   scenes:[
    {type:'story',art:'keypad',say:'The pirates’ attack scrambled the armoury lock — your missiles are stuck inside! The keypad shows a code written in binary, the language of computers.'},
    {type:'code',art:'keypad',q:q('The code is 1 1 0 1. The places mean eights, fours, twos and ones. What number is it?','Convert the binary code 1101 into a normal number.','Convert 1101 (base 2) to decimal.'),answer:'13',explain:'1101 = one 8 + one 4 + no 2 + one 1 = 8 + 4 + 1 = 13.'},
    {type:'order',art:'keypad',q:q('The lock robot needs instructions. Put them in the right order.','Put the robot’s steps into the correct algorithm order.','Sequence the algorithm correctly.'),
     items:['Wake up the lock','Read the code','Check the code is right','Open the door'],explain:'An algorithm is a list of steps in the right order. You must read and check the code before opening the door!'},
    {type:'choose',art:'keypad',q:q('The robot says: “REPEAT 3 times: turn right”. How far has it turned?','“REPEAT 4 times: turn right a quarter turn.” Where does it end up facing?','A loop runs “turn 90° right” four times. What is the final heading?'),
     options:['Backwards','The same way it started','Left','Upside down'],answer:1,explain:'Four quarter turns make a full turn (360°), so it faces the same way it started. Loops repeat instructions — a key idea in coding.'},
    {type:'story',art:'keypad',say:'Click — the armoury door slides open. Your missiles are all there, and the pirates had stashed some credits inside too!'}]},
  {id:'frozen',kind:'ship',icon:'🧊',title:'Frozen Pipes',subject:'Chemistry · Physics',trigger:'calm',reward:{cr:130},
   fail:A=>{A.loseDays(1);return'It took a whole day for the pipes to thaw on their own. Everyone wrapped up warm!';},
   scenes:[
    {type:'story',art:'snow',say:'Brrr! The heater failed and the water pipes have frozen solid. No water for drinks or the greenhouse. Time to think like a scientist.'},
    {type:'order',art:'snow',q:q('Put the states of water in order, from coldest to hottest.','Order the states of water as it heats up.','Order the states of matter by increasing particle energy.'),
     items:['Ice (solid)','Water (liquid)','Steam (gas)'],explain:'Heating ice makes it melt into liquid water; heating water more makes it boil into steam (a gas).'},
    {type:'code',art:'snow',q:q('At what temperature (°C) does water freeze?','What is the freezing point of water in °C?','Give the melting point of pure ice in °C.'),answer:'0',explain:'Pure water freezes (and ice melts) at 0 °C. It boils at 100 °C.'},
    {type:'choose',art:'snow',q:q('What is the best way to unfreeze the pipes safely?','How should we thaw the pipes?','Which method safely transfers energy to melt the ice?'),
     options:['Warm them gently with the heater','Hit them with a hammer','Put more ice on them','Shout at them'],answer:0,explain:'Melting needs heat energy. Warming the pipes gently melts the ice without cracking them.'},
    {type:'story',art:'snow',say:'Drip… drip… gush! The water flows again, and the heater is fixed. Hot chocolate all round!'}]},
  {id:'comet',kind:'space',icon:'☄️',title:'The Comet Chase',subject:'Space science',trigger:'calm',reward:{cr:320},
   fail:A=>'The comet zoomed away before we could catch its tail. It will be back in a few years!',
   scenes:[
    {type:'story',art:'comet',setup:'comet',say:'Look — a comet, glowing as it rushes past! Scientists would pay well for a sample from its tail. Let’s chase it!'},
    {type:'choose',art:'comet',q:q('What are comets mostly made of?','What is a comet made from?','What is a comet’s nucleus mainly composed of?'),
     options:['Ice and dust','Fire','Cheese','Solid gold'],answer:0,explain:'Comets are “dirty snowballs” of ice and dust. When they come near the Sun, the ice turns to gas and forms a glowing tail.'},
    {type:'choose',art:'comet',q:q('Which way does a comet’s tail point?','A comet’s tail always points…?','What determines the direction of a comet’s tail?'),
     options:['Away from the Sun','Towards the Sun','Always down','Behind it, the way it came'],answer:0,explain:'The Sun’s light and the solar wind push the gas and dust away, so the tail always points away from the Sun.'},
    {type:'flight',task:'chase',goal:'Chase the comet and fly through its glowing tail (the marker) to collect a sample.',time:150},
    {type:'story',art:'comet',say:'Sample collected! The ice in it is billions of years old — scientists at the next station will be thrilled.'}]},
  {id:'nebula',kind:'space',icon:'🌫️',title:'Lost in the Nebula',subject:'Physics · Space science',trigger:'hyper',reward:{cr:360},
   fail:A=>{A.useFuel(1);return'We wandered in the fog for a while and burned a light year of fuel finding our way out. We made it!';},
   scenes:[
    {type:'story',art:'nebula',setup:'nebula',say:'Our hyperspace jump has dropped us inside a nebula — a huge glowing cloud of gas and dust. The scanners are confused. We will need to find our way out.'},
    {type:'choose',art:'nebula',q:q('A light year sounds like time — but what does it really measure?','What is a light year?','Define a light year.'),
     options:['A distance — how far light travels in a year','A length of time','A kind of star','A type of fuel'],answer:0,explain:'A light year is a distance: how far light travels in a year — about 9.5 million million kilometres!'},
    {type:'choose',art:'nebula',q:q('Why does the nebula glow?','What makes a nebula glow?','Why are emission nebulae bright?'),
     options:['Nearby stars light up its gas','It is on fire','It is full of light bulbs','It reflects the Moon'],answer:0,explain:'Hot young stars nearby shine on the gas and make it glow, like a lamp lighting up fog.'},
    {type:'flight',task:'waypoints',goal:'Fly through the three pulsar beacons in order to find the way out.',time:180},
    {type:'story',art:'nebula',say:'The fog thins and the stars come back. We are out — and our maps of the nebula are worth credits to the explorers’ guild.'}]},
  {id:'sleeper',kind:'space',icon:'🛰️',title:'The Sleeping Ship',subject:'Computing · Biology',trigger:'calm',reward:{cr:340},
   fail:A=>'We could not wake the old ship’s computer. A rescue team is on its way to help the sleepers instead.',
   scenes:[
    {type:'story',art:'derelict',setup:'derelict',say:'A huge, ancient ship drifts silently ahead. It left Earth hundreds of years ago, and its crew are still asleep in their sleep pods. Its computer is sending a coded message.'},
    {type:'choose',art:'derelict',q:q('The message is IFMQ. Each letter has moved ONE place on in the alphabet. What does it say?','The coded word IFMQ uses a shift of one letter. What is the real word?','Decode IFMQ with a Caesar shift of −1.'),
     options:['HELP','HELLO','GOLD','STOP'],answer:0,explain:'Move each letter back one place: I→H, F→E, M→L, Q→P. It spells HELP! This is a Caesar cipher, one of the oldest codes.'},
    {type:'flight',task:'reach',hold:6,maxSpeed:60,r:900,goal:'Fly alongside the old ship and hold steady (slow, inside the ring) so we can connect.',time:150},
    {type:'choose',many:true,art:'derelict',q:q('Before we wake the crew, which THREE things will they need first?','Which THREE things do people need to survive?','Select the THREE immediate survival needs.'),
     options:['Air to breathe','Water','Food','A games console','A new hat'],answer:[0,1,2],explain:'People need air, water and food to survive. Their sleep pods kept them alive — now they need the real thing.'},
    {type:'story',art:'derelict',say:'One by one, the sleepers wake up, amazed to see you. Their families back home are long gone, but a station nearby offers them a new home — and you a reward.'}]},
  {id:'storm',kind:'space',icon:'🌞',title:'Solar Storm',subject:'Space science',trigger:'calm',reward:{cr:330},
   fail:A=>{A.hurtHull(.12);return'The storm caught us before we reached the shadow. The shields took most of it, but the hull is a little scorched.';},
   scenes:[
    {type:'story',art:'flare',setup:'shadow',say:'Warning! A giant solar storm is about to burst from the Sun. We need shelter — fast.'},
    {type:'choose',art:'flare',q:q('The Sun is not a planet. What is it?','What kind of object is the Sun?','Classify the Sun.'),
     options:['A star','A planet','A moon','A comet'],answer:0,explain:'The Sun is a star — a huge ball of hot gas. It is the closest star to us, which is why it looks so big and bright.'},
    {type:'choose',art:'flare',q:q('Where is the safest place to hide from the Sun’s blast?','Where can we shelter from the solar storm?','Which position shields us from the flare?'),
     options:['In the planet’s shadow, on the side away from the Sun','Right next to the Sun','Anywhere — space is safe','Inside a comet'],answer:0,explain:'A planet blocks the Sun’s particles, just as it blocks sunlight. On the night side, in its shadow, we are protected.'},
    {type:'flight',task:'reach',r:1800,goal:'Race into the planet’s shadow (the marker) before the storm hits! Use the jump drive if you need to.',time:150},
    {type:'story',art:'flare',say:'The storm roars past, lighting up the planet’s sky with beautiful auroras — and we are safe in the shadow. A weather station pays for your storm readings.'}]}
];
 return{LIST,art,find:id=>LIST.find(a=>a.id===id)};
})();
