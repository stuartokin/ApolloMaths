'use strict';
// DATA: Apollo's player (avatar) options, the Shop catalogue and the reward rules.
// Points are only earned by answering maths questions. Spending never removes "Power points" earned (lifetime score);
// it reduces the wallet: wallet = points earned − points spent. No random boxes, no timers, nothing costs real money.
const avatarOptions={
 // New tones are added at the end so saved players keep theirs; skinOrder shows them light → dark.
 skins:[['#FFDCB8','Light'],['#F3C48E','Fair'],['#DDA56C','Medium'],['#C17F48','Tan'],['#8E5630','Brown'],['#5C3920','Deep brown'],['#FFEBDD','Very light'],['#E9C4A0','Light olive'],['#B8875A','Olive'],['#3E2416','Very deep brown']],
 skinOrder:[6,0,1,7,2,8,3,4,5,9],
 body:[['boy','👦 Boy'],['girl','👧 Girl']],
 hair:[['short','Short'],['spiky','Spiky'],['curly','Curly'],['afro','Afro'],['quiff','Quiff'],['buzz','Buzz cut'],['long','Long'],['ponytail','Ponytail'],['puffs','Two puffs'],['bob','Bob'],['bun','Bun'],['braids','Braids'],['locs','Locs']],
 covers:[['none','None'],['hijab','Hijab'],['patka','Patka'],['dastar','Dastar (turban)'],['kippah','Kippah'],['headwrap','Headwrap']],
 coverCols:[['#1e2333','Black'],['#1d2b5c','Navy'],['#e51c35','Red'],['#17a398','Teal'],['#6b3fc9','Purple'],['#f2f2f2','White'],['#f28ab2','Pink'],['#f2c218','Yellow']],
 hairColours:[['#1d1a1a','Black'],['#4a2c14','Dark brown'],['#8b5a2b','Brown'],['#e0b04a','Blond'],['#b9542c','Ginger'],['#2f6fe0','Electric blue'],['#7a3b22','Auburn'],['#a87b4f','Light brown'],['#f1e2a8','Platinum'],['#b9b9b9','Grey'],['#e85d9e','Pink']],
 eyes:[['round','Bright'],['happy','Happy'],['big','Wide awake'],['cool','Cool'],['almond','Almond'],['gentle','Gentle']],
 mouths:[['grin','Big grin'],['smile','Smile'],['cheeky','Cheeky'],['determined','Focused']],
 kits:[['#e51c35','Red'],['#2457d6','Blue'],['#1f9d55','Green'],['#f2c218','Yellow'],['#6b3fc9','Purple'],['#1e2333','Black']]
};
const defaultAvatar=()=>({created:false,body:'boy',skin:1,hair:'short',hairCol:1,cover:'none',coverCol:0,eyes:'round',mouth:'grin',kit:0,num:7,
 eq:{top:null,hat:null,boots:null,glasses:null,neck:null,chest:null,arm:null,back:null,hand:'ball',pet:null,scene:'park',celebration:'fistpump',title:null,frame:null}});
// Slots an item can be worn in. "free" items are owned from the start.
const SLOTS=['top','hat','boots','glasses','neck','chest','arm','back','hand','pet','scene','celebration'];
const shopCats=[['kits','👕 Kits'],['hats','🧢 Hats'],['boots','👟 Boots'],['extras','🧣 Extras'],['hands','⚽ In my hand'],['pets','🐾 Sidekicks'],['scenes','🏟️ Experiences'],['celebrations','🎉 Celebrations']];
// tier is decided by price: Starter < 200, Pro < 900, Elite < 2500, Legendary 2500+
const shopItems=[
 // ---- free starters ----
 {id:'ball',slot:'hand',cat:'hands',name:'Match ball',icon:'⚽',price:0,free:true,desc:'Every player needs one.'},
 {id:'park',slot:'scene',cat:'scenes',name:'Park kickabout',icon:'🌳',price:0,free:true,desc:'Jumpers for goalposts on a sunny afternoon.'},
 {id:'fistpump',slot:'celebration',cat:'celebrations',name:'Fist pump',icon:'✊',price:0,free:true,desc:'A classic. Jump and punch the air!'},
 // ---- kits ----
 {id:'bib',slot:'top',cat:'kits',name:'Training bib',icon:'🦺',price:60,desc:'Bright yellow — the coach will always spot you.'},
 {id:'stripes',slot:'top',cat:'kits',name:'Retro striped kit',icon:'👕',price:180,desc:'Old-school stripes in your kit colour.'},
 {id:'hoodie',slot:'top',cat:'kits',name:'Cosy hoodie',icon:'🧥',price:320,desc:'For cold training nights and maths revision.'},
 {id:'hero',slot:'top',cat:'kits',name:'Superhero suit',icon:'🦸',price:750,desc:'Your own hero suit with an “A” on the chest.'},
 {id:'goldkit',slot:'top',cat:'kits',name:'Golden kit',icon:'🥇',price:1800,desc:'Shines like a trophy. Only for top scorers.'},
 {id:'galaxy',slot:'top',cat:'kits',name:'Galaxy kit',icon:'🌌',price:3500,desc:'Woven from actual stars (probably).'},
 // ---- hats ----
 {id:'headband',slot:'hat',cat:'hats',name:'Sweatband',icon:'🎽',price:50,desc:'Keeps the sweat out of your eyes during hard sums.'},
 {id:'beanie',slot:'hat',cat:'hats',name:'Bobble beanie',icon:'🧶',price:140,desc:'Warm, woolly, and very bobbly.'},
 {id:'cap',slot:'hat',cat:'hats',name:'Manager’s cap',icon:'🧢',price:220,desc:'Look like you run the whole club.'},
 {id:'wizard',slot:'hat',cat:'hats',name:'Maths wizard hat',icon:'🧙',price:600,desc:'Casts fractions into their simplest form.'},
 {id:'crown',slot:'hat',cat:'hats',name:'Golden crown',icon:'👑',price:2600,desc:'King of the maths missions.'},
 {id:'helmet',slot:'hat',cat:'hats',name:'Astronaut helmet',icon:'🧑‍🚀',price:4200,desc:'For players who are out of this world.'},
 // ---- boots ----
 {id:'classicboots',slot:'boots',cat:'boots',name:'Classic boots',icon:'👞',price:80,desc:'White stripes. Timeless.'},
 {id:'neonboots',slot:'boots',cat:'boots',name:'Neon boots',icon:'🟢',price:300,desc:'So bright the defenders need sunglasses.'},
 {id:'boltboots',slot:'boots',cat:'boots',name:'Lightning boots',icon:'⚡',price:950,desc:'Lightning bolts for lightning-fast maths.'},
 {id:'goldboots',slot:'boots',cat:'boots',name:'Golden boots',icon:'🥾',price:2200,desc:'The top scorer’s award — on your feet.'},
 // ---- extras ----
 {id:'shades',slot:'glasses',cat:'extras',name:'Sports shades',icon:'🕶️',price:110,desc:'Too cool for long division.'},
 {id:'scarf',slot:'neck',cat:'extras',name:'Red & white scarf',icon:'🧣',price:160,desc:'Wave it from the stands.'},
 {id:'armband',slot:'arm',cat:'extras',name:'Captain’s armband',icon:'©️',price:380,desc:'You lead the team. Captain Apollo!'},
 {id:'cape',slot:'back',cat:'extras',name:'Hero cape',icon:'🦸',price:700,desc:'Flaps dramatically when you score.'},
 {id:'medal',slot:'chest',cat:'extras',name:'Champion’s medal',icon:'🏅',price:1300,desc:'Proof you’ve been training hard.'},
 {id:'jetpack',slot:'back',cat:'extras',name:'Jetpack',icon:'🚀',price:3200,desc:'Fly to training. Fly to school. Fly everywhere.'},
 // ---- in my hand ----
 {id:'comic',slot:'hand',cat:'hands',name:'Comic book',icon:'📖',price:120,desc:'For half-time reading.'},
 {id:'goldball',slot:'hand',cat:'hands',name:'Golden ball',icon:'🟡',price:1500,desc:'Best player of the tournament.'},
 {id:'trophy',slot:'hand',cat:'hands',name:'Cup trophy',icon:'🏆',price:2800,desc:'Lift it high!'},
 // ---- sidekicks ----
 {id:'hamster',slot:'pet',cat:'pets',name:'Hammy the hamster',icon:'🐹',price:200,desc:'Small, fluffy, excellent at counting seeds.'},
 {id:'dog',slot:'pet',cat:'pets',name:'Spot the dog',icon:'🐶',price:500,desc:'Chases footballs. Doesn’t give them back.'},
 {id:'owl',slot:'pet',cat:'pets',name:'Professor Owl',icon:'🦉',price:850,desc:'Knows every times table backwards.'},
 {id:'robot',slot:'pet',cat:'pets',name:'Calc-Bot 3000',icon:'🤖',price:1200,desc:'Beeps when you get it right.'},
 {id:'dragon',slot:'pet',cat:'pets',name:'Baby dragon',icon:'🐉',price:2700,desc:'Breathes tiny, friendly fireballs.'},
 // ---- experiences (backgrounds) ----
 {id:'training',slot:'scene',cat:'scenes',name:'Training ground',icon:'🥅',price:150,desc:'Cones out, boots laced — drills with the squad.'},
 {id:'comiccity',slot:'scene',cat:'scenes',name:'Comic-book city',icon:'💥',price:650,desc:'POW! Step inside your favourite comic.'},
 {id:'tunnel',slot:'scene',cat:'scenes',name:'Stadium tunnel walk-out',icon:'🚪',price:1000,desc:'Hear the crowd roar as you walk out of the tunnel.'},
 {id:'floodlit',slot:'scene',cat:'scenes',name:'Floodlit night match',icon:'💡',price:1600,desc:'Under the lights, 50,000 fans singing your name.'},
 {id:'cupfinal',slot:'scene',cat:'scenes',name:'Cup final fireworks',icon:'🎆',price:3000,desc:'Fireworks, confetti and the trophy is yours.'},
 {id:'space',slot:'scene',cat:'scenes',name:'Space station',icon:'🪐',price:5000,desc:'The first maths match in orbit. Legendary.'},
 // ---- celebrations (play on every correct answer) ----
 {id:'kneeslide',slot:'celebration',cat:'celebrations',name:'Knee slide',icon:'🙌',price:250,desc:'Slide across the grass after every right answer.'},
 {id:'confetti',slot:'celebration',cat:'celebrations',name:'Confetti cannon',icon:'🎉',price:600,desc:'Confetti explodes every time you’re right.'},
 {id:'backflip',slot:'celebration',cat:'celebrations',name:'Backflip',icon:'🤸',price:1100,desc:'A full backflip. Don’t try this at home.'},
 {id:'rocket',slot:'celebration',cat:'celebrations',name:'Rocket launch',icon:'🚀',price:2400,desc:'Blast off into the sky for every goal.'},
 // ---- skill unlocks: cannot be bought, only earned by mastering the Focus Zone topics ----
 {id:'viking',slot:'hat',cat:'skill',name:'Volume Viking helmet',icon:'⛑️',price:0,unlock:{topic:'volume',first:10},desc:'Get 10 Volume questions right first time.'},
 {id:'fox',slot:'pet',cat:'skill',name:'Fraction Fox',icon:'🦊',price:0,unlock:{topic:'equivfrac',first:10},desc:'Get 10 Equivalent fractions questions right first time.'},
 {id:'shapeshades',slot:'glasses',cat:'skill',name:'Shape-shifter shades',icon:'🔷',price:0,unlock:{topic:'shapes',first:10},desc:'Get 10 Properties of shapes questions right first time.'},
 {id:'ruler',slot:'hand',cat:'skill',name:'Mega ruler',icon:'📏',price:0,unlock:{topic:'measure',first:10},desc:'Get 10 Measuring space questions right first time.'},
 {id:'magnifier',slot:'hand',cat:'skill',name:'Data detective magnifier',icon:'🔍',price:0,unlock:{topic:'data',first:10},desc:'Get 10 Representing data questions right first time.'},
 {id:'acemedal',slot:'chest',cat:'skill',name:'Exam ace medal',icon:'🎖️',price:0,unlock:{mock:true},desc:'Finish a full 40-question mock exam.'}
];
const itemById=Object.fromEntries(shopItems.map(i=>[i.id,i]));
const tierOf=it=>it.unlock?['skill','Skill unlock']:it.price===0?['free','Free']:it.price<200?['starter','Starter']:it.price<900?['pro','Pro']:it.price<2500?['elite','Elite']:['legend','Legendary'];
const REWARDS={focusBonus:5,dailyTarget:5,dailyBonus:50};

// ---- pure rules ----
const wallet=s=>Math.max(0,(s.points||0)-(s.spent||0));
const owns=(s,id)=>!!itemById[id]&&(itemById[id].free||(s.owned||[]).includes(id));
function unlockProgress(s,it){if(!it.unlock)return null;if(it.unlock.mock)return{have:s.mocksDone||0,need:1};const t=(s.byTopic||{})[it.unlock.topic]||{};return{have:Math.min(t.first||0,it.unlock.first),need:it.unlock.first};}
// Next thing to aim for: his chosen goal, otherwise the cheapest item he can't afford yet.
function nextGoal(s){const w=wallet(s);let it=s.wish&&itemById[s.wish]&&!owns(s,s.wish)?itemById[s.wish]:null;
 if(!it)it=shopItems.filter(i=>!i.unlock&&!i.free&&!owns(s,i.id)&&i.price>w).sort((a,b)=>a.price-b.price)[0];
 if(!it)return null;return{item:it,need:Math.max(0,it.price-w),pct:Math.min(100,Math.round(100*w/it.price))};}
// Checks a player record loaded from storage or a file.
function cleanPlayer(s){const d=defaultAvatar(),a=s.avatar&&typeof s.avatar==='object'?s.avatar:{};
 const inList=(v,list,fb)=>list.some(x=>x[0]===v)?v:fb,inRange=(v,n,fb)=>Number.isInteger(v)&&v>=0&&v<n?v:fb;
 const av={created:!!a.created,skin:inRange(a.skin,avatarOptions.skins.length,d.skin),hair:inList(a.hair,avatarOptions.hair,d.hair),hairCol:inRange(a.hairCol,avatarOptions.hairColours.length,d.hairCol),
  eyes:inList(a.eyes,avatarOptions.eyes,d.eyes),mouth:inList(a.mouth,avatarOptions.mouths,d.mouth),kit:inRange(a.kit,avatarOptions.kits.length,d.kit),body:inList(a.body,avatarOptions.body,d.body),cover:inList(a.cover,avatarOptions.covers,d.cover),coverCol:inRange(a.coverCol,avatarOptions.coverCols.length,d.coverCol),num:Number.isInteger(a.num)&&a.num>=1&&a.num<=99?a.num:d.num,eq:{...d.eq}};
 s.mocksDone=Number.isInteger(s.mocksDone)&&s.mocksDone>=0?s.mocksDone:0;
 s.owned=Array.isArray(s.owned)?[...new Set(s.owned.filter(id=>itemById[id]&&!itemById[id].free))]:[];
 s.spent=Number.isFinite(+s.spent)&&+s.spent>=0?Math.min(Math.floor(+s.spent),s.points||0):0;
 // Owned items must be paid for (total price ≤ points spent) and skill unlocks must really be earned.
 {let budget=s.spent;s.owned=s.owned.filter(id=>{const it=itemById[id];if(it.unlock){const p=unlockProgress(s,it);return p.have>=p.need;}if(it.price<=budget){budget-=it.price;return true;}return false;});}
 s.wish=typeof s.wish==='string'&&itemById[s.wish]?s.wish:null;
 s.daily=s.daily&&typeof s.daily==='object'&&typeof s.daily.day==='string'?{day:s.daily.day.slice(0,10),correct:Math.max(0,Math.floor(+s.daily.correct||0)),bonus:!!s.daily.bonus}:{day:'',correct:0,bonus:false};
 const eq=a.eq&&typeof a.eq==='object'?a.eq:{};
 for(const slot of SLOTS){const id=eq[slot];if(id===null)av.eq[slot]=['scene','celebration'].includes(slot)?d.eq[slot]:null;else if(typeof id==='string'&&itemById[id]&&itemById[id].slot===slot&&owns(s,id))av.eq[slot]=id;}
 s.avatar=av;return s;}
const dayKey=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
