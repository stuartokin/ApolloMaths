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
    {type:'story',art:'asteroid',say:'It worked! The asteroid’s path has bent just enough to miss the planet. The planet’s people send a grateful reward.'}]}];
 return{LIST,art,find:id=>LIST.find(a=>a.id===id)};
})();
