'use strict';
// DATA: the big Kit Shop expansion (Nov 2026). Items with "art" + "style" are drawn by generic painters in js/render/avatar.js.
// Prices form a dense ladder (40 → 8,000 ⚡) so there is always something just within reach.
const SHOP_VERSION=2;
const S=(id,slot,cat,name,icon,price,desc,extra={})=>({id,slot,cat,name,icon,price,desc,nw:true,...extra});
const kit=(id,name,icon,price,pat,c1,c2,desc,shorts)=>S(id,'top','kits',name,icon,price,desc,{style:{pat,c1,c2,shorts}});
const boot=(id,name,price,c,s,desc)=>S(id,'boots','boots',name,'👟',price,desc,{style:{c,s}});
shopItems.push(
 // ---- 22 kits ----
 kit('k_hoops','Red & white hoops','🔴',90,'hoops','#e51c35','#ffffff','Classic hoops, like an old-school cup kit.'),
 kit('k_halves','Blue & yellow halves','🔵',130,'halves','#2457d6','#f2c218','Half and half — twice the style.'),
 kit('k_sash','White sash kit','⚪',170,'sash','#ffffff','#e51c35','A bold red sash across a white shirt.'),
 kit('k_pin','Navy pinstripe','🎩',210,'pinstripe','#1d2b5c','#8fa6ff','Smart enough for a cup final.'),
 kit('k_checks','Red & white checks','🏁',260,'checks','#ffffff','#e51c35','A checkerboard shirt nobody will miss.'),
 kit('k_quarters','Green quarters','🟩',300,'quarters','#1f9d55','#ffffff','Quarters — a great way to remember ¼!'),
 kit('k_chevron','Purple & gold chevron','🟪',360,'chevron','#6b3fc9','#f5c542','A golden V for victory.'),
 kit('k_sleeves','Yellow with black sleeves','🐝',420,'sleeves','#f2c218','#1e2333','Buzzing like a bee.'),
 kit('k_sunset','Sunset fade','🌅',520,'gradient','#ff8a1c','#e51c35','Orange melting into red, like a summer evening.'),
 kit('k_camo','Green camo','🪖',600,'camo','#4b6b3a','#2e4426','Hide from defenders. (It doesn’t really work.)'),
 kit('k_bolt','Black lightning kit','⚡',700,'lightning','#1e2333','#ffe45e','A yellow bolt across a black shirt.'),
 kit('k_stars','Starry night kit','⭐',820,'stars','#1d2b5c','#ffe45e','Covered in gold stars.'),
 kit('k_pixel','Retro pixel kit','👾',950,'pixel','#2f6fe0','#9dff2e','Straight out of an 8-bit video game.'),
 kit('k_flames','Flame kit','🔥',1150,'flames','#1e2333','#ff8a1c','Too hot to handle.'),
 kit('k_tiedye','Tie-dye kit','🌀',1400,'tiedye','#ff5ea8','#64d9f5','Swirls of colour.'),
 kit('k_ocean','Ocean fade','🌊',1700,'gradient','#64d9f5','#1d2b5c','From shallow blue to deep sea.'),
 kit('k_neon','Neon storm kit','🌩️',2100,'lightning','#5b3cc4','#9dff2e','Glowing green lightning on purple.'),
 kit('k_rainbow','Rainbow hoops','🌈',2600,'rainbow','#e51c35','#ffffff','Every colour of the rainbow.'),
 kit('k_diamond','Diamond kit','💎',3400,'stars','#bfe9ff','#ffffff','Sparkles like a diamond.'),
 kit('k_lava','Lava kit','🌋',4500,'flames','#7a1020','#ffe45e','Molten-hot. Legendary.'),
 kit('k_aurora','Aurora kit','🌌',6000,'gradient','#3cc46a','#6b3fc9','Like the northern lights.'),
 kit('k_platinum','Platinum kit','🏆',8000,'stars','#d9dee8','#8a93a6','The rarest kit in the shop.'),
 // ---- 12 boots ----
 boot('b_red','Red boots',40,'#e51c35','#ffffff','Bright red, ready to go.'),boot('b_bluewhite','Blue & white boots',70,'#2457d6','#ffffff','Smart and speedy.'),
 boot('b_orange','Orange boots',110,'#ff8a1c','#1e2333','You’ll be easy to spot.'),boot('b_pink','Pink & black boots',160,'#ff5ea8','#1e2333','Fast and fancy.'),
 boot('b_silver','Silver boots',240,'#c9d1df','#5b6578','Shiny silver.'),boot('b_candy','Candy boots',380,'#ff5ea8','#64d9f5','Pink with blue stripes.'),
 boot('b_blackgold','Black & gold boots',560,'#1e2333','#f5c542','Pro-player style.'),boot('b_glow','Glow-in-the-dark boots',780,'#b6ff6a','#1e2333','They glow at floodlit matches.'),
 boot('b_diamond','Diamond boots',1250,'#e0f7ff','#64d9f5','Sparkling ice-white.'),boot('b_lava','Lava boots',1900,'#e51c35','#ffb000','Red-hot boots.'),
 boot('b_galaxy','Galaxy boots',3800,'#3a1d8f','#ffe45e','Boots made of stars.'),boot('b_platinum','Platinum boots',6500,'#d9dee8','#ffffff','The rarest boots in the shop.'),
 // ---- 16 hats ----
 S('h_capred','hat','hats','Red cap','🧢',70,'A cap in classic red.',{art:'cap',style:{c:'#e51c35',t:'#fff'}}),
 S('h_beanred','hat','hats','Red bobble hat','🧶',90,'Cosy for winter matches.',{art:'beanie',style:{c:'#e51c35',b:'#a80f22'}}),
 S('h_capgreen','hat','hats','Green cap','🧢',120,'Fresh and sporty.',{art:'cap',style:{c:'#1f9d55',t:'#fff'}}),
 S('h_beanpurple','hat','hats','Purple bobble hat','🧶',150,'Extra-bobbly.',{art:'beanie',style:{c:'#6b3fc9',b:'#4a2a8f'}}),
 S('h_propeller','hat','hats','Propeller cap','🚁',180,'Spins when you think hard.',{art:'propeller'}),
 S('h_party','hat','hats','Party hat','🥳',230,'Every right answer is a party.',{art:'party'}),
 S('h_bucket','hat','hats','Bucket hat','👒',280,'Festival-ready.',{art:'bucket'}),
 S('h_bunny','hat','hats','Bunny ears','🐰',380,'Hop to it!',{art:'bunny'}),
 S('h_pirate','hat','hats','Pirate hat','🏴‍☠️',450,'Arrr — treasure is points!',{art:'pirate'}),
 S('h_chef','hat','hats','Chef’s hat','👨‍🍳',520,'Cooking up correct answers.',{art:'chef'}),
 S('h_cowboy','hat','hats','Cowboy hat','🤠',650,'Yee-haw, maths partner.',{art:'cowboy'}),
 S('h_grad','hat','hats','Graduation cap','🎓',800,'For a true maths scholar.',{art:'grad'}),
 S('h_phones','hat','hats','Gaming headphones','🎧',900,'Focus mode: ON.',{art:'phones'}),
 S('h_tophat','hat','hats','Top hat','🎩',1050,'Very posh.',{art:'tophat'}),
 S('h_halo','hat','hats','Golden halo','😇',1700,'Angelic accuracy.',{art:'halo'}),
 S('h_knight','hat','hats','Knight’s helmet','🛡️',2300,'Defender of the realm of numbers.',{art:'knight'}),
 // ---- 8 glasses ----
 S('g_red','glasses','extras','Red shades','🕶️',90,'Shades in red.',{art:'shades',style:{c:'#e51c35'}}),
 S('g_round','glasses','extras','Round specs','👓',140,'Clever-looking specs.',{art:'round'}),
 S('g_heart','glasses','extras','Heart glasses','💖',180,'Love maths? These prove it.',{art:'heart'}),
 S('g_star','glasses','extras','Star glasses','⭐',240,'Superstar specs.',{art:'star'}),
 S('g_3d','glasses','extras','3D glasses','🎬',330,'See shapes in 3D.',{art:'threed'}),
 S('g_monocle','glasses','extras','Golden monocle','🧐',700,'Rather distinguished.',{art:'monocle'}),
 S('g_ski','glasses','extras','Ski goggles','🎿',1000,'Ready for the slopes.',{art:'ski'}),
 S('g_vr','glasses','extras','VR headset','🥽',2000,'Enter the maths-verse.',{art:'vr'}),
 // ---- 9 neck & chest ----
 S('n_bowtie','neck','extras','Red bow tie','🎀',75,'Dapper.',{art:'bowtie',style:{c:'#e51c35'}}),
 S('c_star','chest','extras','Star badge','⭐',120,'A gold star for effort.',{art:'starbadge'}),
 S('n_scarfblue','neck','extras','Blue & white scarf','🧣',170,'Another scarf for your collection.',{art:'scarf',style:{c1:'#2457d6',c2:'#fff'}}),
 S('n_whistle','neck','extras','Coach’s whistle','📣',200,'You’re the coach now.',{art:'whistle'}),
 S('c_rosette','chest','extras','Prize rosette','🎗️',260,'First prize!',{art:'rosette'}),
 S('n_bowgold','neck','extras','Gold bow tie','🎀',340,'Extra-fancy.',{art:'bowtie',style:{c:'#f5c542'}}),
 S('c_bronze','chest','extras','Bronze medal','🥉',420,'Third place is still on the podium.',{art:'medal',style:{c:'#c97b3a',r:'#1f9d55'}}),
 S('c_silver','chest','extras','Silver medal','🥈',620,'So close to gold.',{art:'medal',style:{c:'#c9d1df',r:'#6b3fc9'}}),
 S('n_chain','neck','extras','Gold chain','📿',1600,'Bling!',{art:'chain'}),
 // ---- 8 back ----
 S('bk_bag','back','extras','School backpack','🎒',220,'Ready for Year 7.',{art:'backpack'}),
 S('bk_guitar','back','extras','Guitar','🎸',480,'Rock star mathematician.',{art:'guitar'}),
 S('bk_capeblue','back','extras','Blue cape','🦸',520,'A cape in hero blue.',{art:'cape',style:{c:'#2457d6',d:'#173c9c'}}),
 S('bk_surf','back','extras','Surfboard','🏄',900,'Catch the wave.',{art:'surf'}),
 S('bk_butterfly','back','extras','Butterfly wings','🦋',1300,'Float like a butterfly.',{art:'butterfly'}),
 S('bk_angel','back','extras','Angel wings','🪽',2000,'Heavenly.',{art:'angel'}),
 S('bk_capegold','back','extras','Golden cape','✨',2400,'Only for champions.',{art:'cape',style:{c:'#f5c542',d:'#c8901a'}}),
 S('bk_dragon','back','extras','Dragon wings','🐲',3600,'Fly over the stadium.',{art:'dragonwings'}),
 // ---- 12 in my hand ----
 S('hd_lolly','hand','hands','Lollipop','🍭',45,'A sweet treat.',{art:'lolly'}),
 S('hd_ice','hand','hands','Ice cream','🍦',65,'Half-time treat.',{art:'icecream'}),
 S('hd_duck','hand','hands','Rubber duck','🦆',85,'Quack.',{art:'duck'}),
 S('hd_balloon','hand','hands','Red balloon','🎈',100,'Floats when you score.',{art:'balloon',style:{c:'#e51c35'}}),
 S('hd_pizza','hand','hands','Pizza slice','🍕',130,'Perfect for practising fractions.',{art:'pizza'}),
 S('hd_flag','hand','hands','Chequered flag','🏁',190,'Finish line!',{art:'flag'}),
 S('hd_calc','hand','hands','Calculator','🧮',230,'(Not allowed in the exam!)',{art:'calc'}),
 S('hd_bball','hand','hands','Basketball','🏀',280,'Shoot some hoops.',{art:'basketball'}),
 S('hd_mega','hand','hands','Megaphone','📢',340,'Lead the chants.',{art:'megaphone'}),
 S('hd_tennis','hand','hands','Tennis racket','🎾',400,'Ace!',{art:'tennis'}),
 S('hd_wand','hand','hands','Magic wand','🪄',750,'Abraca-maths!',{art:'wand'}),
 S('hd_bootaward','hand','hands','Golden boot award','🥇',4200,'Top scorer of the season.',{art:'bootaward'}),
 // ---- 12 sidekicks ----
 S('p_fish','pet','pets','Bubbles the goldfish','🐠',150,'Swims in circles. Lots of circles.',{art:'goldfish'}),
 S('p_bunny','pet','pets','Bounce the bunny','🐇',260,'Hops in multiples of 2.',{art:'bunny'}),
 S('p_frog','pet','pets','Leapfrog','🐸',340,'Jumps along number lines.',{art:'frog'}),
 S('p_tortoise','pet','pets','Shelly the tortoise','🐢',420,'Slow and steady wins the race.',{art:'tortoise'}),
 S('p_cat','pet','pets','Whiskers the cat','🐱',600,'Sits on your homework.',{art:'cat'}),
 S('p_parrot','pet','pets','Polly the parrot','🦜',780,'Repeats your times tables.',{art:'parrot'}),
 S('p_penguin','pet','pets','Pip the penguin','🐧',950,'Cool under pressure.',{art:'penguin'}),
 S('p_panda','pet','pets','Bamboo the panda','🐼',1400,'Black, white and brilliant.',{art:'panda'}),
 S('p_octopus','pet','pets','Octo the octopus','🐙',1800,'Eight arms — great at counting in 8s.',{art:'octopus'}),
 S('p_lion','pet','pets','Leo the lion cub','🦁',2200,'Roars when you get it right.',{art:'lion'}),
 S('p_unicorn','pet','pets','Sparkle the unicorn','🦄',3300,'Magical and very rare.',{art:'unicorn'}),
 S('p_trex','pet','pets','Rex the T-rex','🦖',4800,'Tiny arms, giant brain.',{art:'trex'}),
 // ---- 18 experiences ----
 ...[['skate','Skatepark session','🛹',250,'Ollies and kickflips at the skatepark.'],['beach','Beach football','🏖️',350,'Sand, sea and a golden sunset match.'],['mountain','Mountain lake','🏔️',450,'Fresh air by a sparkling lake.'],['jungle','Jungle expedition','🌴',550,'Swing through the rainforest.'],['snowy','Snowball fight','☃️',700,'A snowy pitch and a snowman goalie.'],['desert','Desert pyramids','🐪',800,'Explore the ancient pyramids.'],['castle','Castle tour','🏰',900,'Knights, towers and a drawbridge.'],['underwater','Underwater reef','🐠',1100,'Play with the fish on a coral reef.'],['candy','Candy land','🍬',1250,'Everything is made of sweets!'],['haunted','Spooky mansion','👻',1350,'Friendly ghosts only.'],['citynight','City lights','🌃',1500,'A rooftop at night above the city.'],['rainbowland','Rainbow valley','🌈',1800,'Rainbows everywhere you look.'],['glasshouse','Botanic glasshouse','🌿',2000,'Giant plants inside a glass palace.'],['volcano','Volcano island','🌋',2300,'Bubbling lava — stay back!'],['aurora','Northern lights','🌌',2900,'Dancing green lights in the Arctic sky.'],['dino','Dinosaur valley','🦕',3600,'Go back 66 million years.'],['mars','Mars mission','🔴',4400,'The red planet’s first football match.'],['moon','Moon base','🌕',5500,'Low gravity = huge kicks.']].map(([id,name,icon,price,desc])=>S('s_'+id,'scene','scenes',name,icon,price,desc,{art:id})),
 // ---- 10 celebrations ----
 ...[['dab','The dab','💪',150,'cel-wiggle',['💪','⭐','✨']],['rainbowcel','Rainbow burst','🌈',220,'cel-jump',['🌈','✨','⭐']],['robotdance','Robot dance','🤖',320,'cel-wiggle',['🤖','⚙️','✨']],['worm','The worm','🐛',420,'cel-slide',['🐛','✨','💨']],['coins','Coin shower','🪙',550,'cel-jump',['🪙','💰','✨']],['zap','Lightning strike','⚡',700,'cel-jump',['⚡','⚡','✨']],['fireworks','Fireworks','🎆',900,'cel-jump',['🎆','🎇','✨','🎉']],['disco','Dance party','🕺',1300,'cel-wiggle',['🕺','💃','🎵','🎶']],['roar','Dino roar','🦖',1700,'cel-wiggle',['🦖','💥','🌋']],['cartwheel','Cartwheel','🤸',2000,'cel-spin',['💫','⭐','✨']]].map(([id,name,icon,price,anim,parts])=>S('cel_'+id,'celebration','celebrations',name,icon,price,`Plays every time you get a question right.`,{celeb:{anim,parts,msg:name+'! '+icon}})),
 // ---- 20 titles ----
 ...[['Rookie Calculator',40],['Number Ninja',60],['Times Table Titan',80],['Fraction Fixer',100],['Angle Ace',130],['Shape Shifter',160],['Data Detective',200],['Volume Viking',250],['Percentage Pro',300],['Captain Calc',380],['Multiply Machine',450],['Division Destroyer',550],['Puzzle Master',650],['The Professor',800],['Maths Magician',1000],['Algebra Avenger',1300],['Golden Brain',1600],['Prime Minister of Maths',2000],['Legend of Kingston',3000],['Infinity Champion',5000]].map(([name,price],i)=>S('t_'+i,'title','titles',name,'🏷️',price,'A title shown under your name.')),
 // ---- 9 frames ----
 ...[['silver','Silver frame','🥈',200],['comic','Comic-book frame','💥',350],['neon','Neon frame','💡',600],['ice','Ice frame','🧊',850],['flames','Flame frame','🔥',1200],['gold','Gold frame','🥇',1600],['rainbow','Rainbow frame','🌈',2500],['galaxy','Galaxy frame','🌌',3500],['diamond','Diamond frame','💎',6000]].map(([id,name,icon,price])=>S('f_'+id,'frame','frames',name,icon,price,'A frame around your player card.',{frame:id}))
);
// ---- Maths Legends collectible cards (true stories + a mini puzzle) ----
const legendCards=[
 ['pythagoras','Pythagoras','📐',60,'c. 570–495 BC · Ancient Greece','Famous for the rule about right-angled triangles: a² + b² = c². (Babylonian mathematicians knew it even earlier!)','3² + 4² = ?²','5'],
 ['euclid','Euclid','📏',80,'c. 300 BC · Alexandria','Wrote “Elements”, a geometry book that was used in schools for over 2,000 years.','How many degrees are inside a triangle?','180°'],
 ['archimedes','Archimedes','🛁',100,'c. 287–212 BC · Syracuse','Legend says he shouted “Eureka!” in the bath when he realised that rising water could measure the volume of a crown.','A stone makes water rise 2 cm in a tank with a 10 cm × 10 cm base. What is the stone’s volume?','200 cm³'],
 ['hypatia','Hypatia','🔭',120,'c. 360–415 · Alexandria, Egypt','A famous teacher of maths and astronomy in ancient Alexandria.','What is 1/4 of 360?','90'],
 ['brahmagupta','Brahmagupta','0️⃣',150,'598–668 · India','Wrote some of the first rules for calculating with zero, like 5 − 5 = 0.','What is 7 × 0?','0'],
 ['khwarizmi','Al-Khwarizmi','🧮',180,'c. 780–850 · Baghdad','The words “algebra” and “algorithm” both come from him and his famous book.','If 3 × n + 2 = 14, what is n?','4'],
 ['fibonacci','Fibonacci','🐚',220,'c. 1170–1250 · Italy','Helped spread the digits 0–9 across Europe. His sequence: 1, 1, 2, 3, 5, 8 …','What comes after 1, 1, 2, 3, 5, 8?','13'],
 ['newton','Isaac Newton','🍎',260,'1643–1727 · England','Explained gravity and helped invent calculus, the maths of change.','An apple falls 5 m in 1 second. How many cm is that?','500 cm'],
 ['gauss','Carl Friedrich Gauss','➕',300,'1777–1855 · Germany','As a schoolboy he added 1 to 100 in moments by pairing numbers: 50 pairs of 101 = 5050.','What is 1 + 2 + 3 + … + 10?','55'],
 ['somerville','Mary Somerville','🌍',350,'1780–1872 · Scotland','A largely self-taught scientist and writer. Somerville College, Oxford is named after her.','How many minutes in 3½ hours?','210'],
 ['lovelace','Ada Lovelace','💻',400,'1815–1852 · England','Wrote what is often called the first computer program, for Charles Babbage’s Analytical Engine.','What is 2⁵ (2 × 2 × 2 × 2 × 2)?','32'],
 ['nightingale','Florence Nightingale','📊',450,'1820–1910 · England','The famous nurse used clever charts of data to persuade leaders to make hospitals cleaner and safer.','A pie chart slice is 90°. What fraction of the circle is that?','1/4'],
 ['noether','Emmy Noether','🔣',520,'1882–1935 · Germany','Changed algebra forever. Albert Einstein praised her brilliance.','Simplify 12/18.','2/3'],
 ['ramanujan','Srinivasa Ramanujan','🔢',600,'1887–1920 · India','A mostly self-taught genius. He spotted that 1729 is the smallest number that is the sum of two cubes in two ways: 1³ + 12³ and 9³ + 10³.','What is 10³?','1000'],
 ['turing','Alan Turing','🔐',700,'1912–1954 · England','Helped break secret codes in the Second World War and imagined modern computers. He appears on the £50 note.','How many £50 notes make £1,000?','20'],
 ['johnson','Katherine Johnson','🚀',800,'1918–2020 · USA','A NASA mathematician whose calculations helped send astronauts into orbit and to the Moon.','A rocket travels 25 km every second. How far in 1 minute?','1500 km'],
 ['mirzakhani','Maryam Mirzakhani','🏅',900,'1977–2017 · Iran','In 2014 she became the first woman to win the Fields Medal, one of the top prizes in maths.','How many years from 2014 to 2026?','12']
].map(([id,name,icon,price,era,fact,puzzle,ans])=>S('card_'+id,null,'cards',name,icon,price,fact,{era,puzzle,ans}));
shopItems.push(...legendCards);
for(const it of shopItems)itemById[it.id]=it;
SLOTS.push('title','frame');
shopCats.splice(0,shopCats.length,['foryou','🔥 For you'],['kits','👕 Kits'],['boots','👟 Boots'],['hats','🧢 Hats'],['extras','🧣 Extras'],['hands','⚽ In my hand'],['pets','🐾 Sidekicks'],['scenes','🏟️ Experiences'],['celebrations','🎉 Celebrations'],['titles','🏷️ Titles'],['frames','🖼️ Frames'],['cards','🃏 Legend cards']);
// ---- pure helpers: deals, "for you", announcements ----
const buyable=it=>!it.free&&!it.unlock;
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
// One gentle "deal of the day" (25% off), picked from items near what the player has to spend.
function dealOfDay(s,who,day=dayKey()){const w=wallet(s),pool=shopItems.filter(i=>buyable(i)&&!owns(s,i.id));if(!pool.length)return null;
 let near=pool.filter(i=>i.price>=w*0.8&&i.price<=w*2+250);if(near.length<3)near=pool.slice().sort((a,b)=>Math.abs(a.price-w)-Math.abs(b.price-w)).slice(0,8);
 const it=near.sort((a,b)=>a.price-b.price||a.id.localeCompare(b.id))[hash(day+'|'+who)%near.length];return{item:it,price:Math.max(5,Math.round(it.price*0.75/5)*5)};}
const priceFor=(s,it,who)=>{const d=dealOfDay(s,who);return d&&d.item.id===it.id?d.price:it.price;};
// Items close to the current spend: affordable now or within a short reach.
function forYou(s,n=12){const w=wallet(s);return shopItems.filter(i=>buyable(i)&&!owns(s,i.id)).sort((a,b)=>Math.abs(a.price-w*0.95)-Math.abs(b.price-w*0.95)).slice(0,n).sort((a,b)=>a.price-b.price);}
