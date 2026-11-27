'use strict';
// DATA (2.87): the senior look's Customise shop, hobbies and levels — for GCSE and A level (14–18).
// Age-appropriate: clothes, trainers, accessories, desk and room set-ups, backdrops, frames, earned titles and a study
// perk. No cartoon kits, pets or capes. Credits to spend are the same points as the children's Shop (wallet = earned −
// spent); XP is everything ever earned and sets the level. Senior items are owned in stats.sOwned and checked against
// what was really spent (after the children's items), so a progress file can't give free items.
const HOBBIES={
 football:{name:'Football analytics',icon:'⚽',acc:'#3ddc84',accL:'#1e8f52',item:['sn_tactics','sn_signedball'],backdrop:'sn_bd_stadium'},
 f1:{name:'F1 & motorsport',icon:'🏎️',acc:'#ff5a5a',accL:'#c81e1e',item:['sn_simrig','sn_helmet'],backdrop:'sn_bd_pitlane'},
 music:{name:'Music production',icon:'🎧',acc:'#ffb547',accL:'#b8650c',item:['sn_synth','sn_turntable'],backdrop:'sn_bd_studio'},
 gaming:{name:'Gaming & esports',icon:'🎮',acc:'#2ef2c5',accL:'#0f8f74',item:['sn_gchair','sn_console'],backdrop:'sn_bd_arena'},
 fashion:{name:'Fashion & design',icon:'🧵',acc:'#ff7eb6',accL:'#c2337a',item:['sn_moodboard','sn_sketch'],backdrop:'sn_bd_atelier'},
 coding:{name:'Coding & tech',icon:'💻',acc:'#7cc4ff',accL:'#1f6fb5',item:['sn_keyboard','sn_codescreen'],backdrop:'sn_bd_lab'},
 space:{name:'Space & physics',icon:'🔭',acc:'#9d8cff',accL:'#5a45d6',item:['sn_telescope','sn_rocket'],backdrop:'sn_bd_observatory'},
 film:{name:'Film & photography',icon:'🎬',acc:'#ffd166',accL:'#a9790c',item:['sn_camera','sn_poster'],backdrop:'sn_bd_cinema'},
 travel:{name:'Cities & travel',icon:'🌍',acc:'#4fd1c5',accL:'#16857b',item:['sn_globe','sn_map'],backdrop:'sn_bd_skyline'},
 fitness:{name:'Fitness & sport',icon:'🏃',acc:'#ff9f43',accL:'#b45a0c',item:['sn_dumbbells','sn_bike'],backdrop:'sn_bd_track'}};
const SN_CATS=[['outfits','Outfits'],['trainers','Trainers'],['accessories','Accessories'],['desk','Desk & room'],['backdrops','Backdrops'],['frames','Frames'],['titles','Titles'],['perks','Study perks']];
// slot: where it goes (top, shoes, head, eyes, wrist, frame, backdrop, title, perk) or desk spots (d_left, d_mid, d_right, floor, wall)
// col: drawing colour(s); lvl: unlocks at a level; earn: {topic|any, n} right first time; free: owned from the start
const SN_ITEMS=[
 // outfits
 {id:'sn_hoodie_grey',slot:'top',cat:'outfits',name:'Grey hoodie',icon:'🧥',price:0,free:true,style:'hoodie',col:['#8a8fa3','#6f7488']},
 {id:'sn_tee_white',slot:'top',cat:'outfits',name:'White T-shirt',icon:'👕',price:0,free:true,style:'tee',col:['#f3f3f0','#d8d8d2']},
 {id:'sn_hoodie_block',slot:'top',cat:'outfits',name:'Colour-block hoodie',icon:'🧥',price:150,style:'hoodie',col:['#8f7bff','#ffb547']},
 {id:'sn_hoodie_black',slot:'top',cat:'outfits',name:'Black hoodie',icon:'🧥',price:120,style:'hoodie',col:['#23252f','#15161d']},
 {id:'sn_track',slot:'top',cat:'outfits',name:'Track top',icon:'🧥',price:200,style:'track',col:['#1f3a8a','#ffffff']},
 {id:'sn_denim',slot:'top',cat:'outfits',name:'Denim jacket',icon:'🧥',price:300,style:'jacket',col:['#3d6fb0','#f3f3f0']},
 {id:'sn_bomber',slot:'top',cat:'outfits',name:'Bomber jacket',icon:'🧥',price:350,style:'jacket',col:['#3f4a2c','#e07b2a']},
 {id:'sn_puffer',slot:'top',cat:'outfits',name:'Puffer jacket',icon:'🧥',price:450,style:'puffer',col:['#e8e8ec','#c9c9d2']},
 {id:'sn_shirt',slot:'top',cat:'outfits',name:'Smart shirt (exam day)',icon:'👔',price:250,style:'shirt',col:['#dfe8f7','#9fb3d9']},
 {id:'sn_varsity',slot:'top',cat:'outfits',name:'Varsity jacket',icon:'🧥',price:600,lvl:20,style:'jacket',col:['#7a1f2b','#f3efe2']},
 // trainers
 {id:'sn_shoe_basic',slot:'shoes',cat:'trainers',name:'Everyday trainers',icon:'👟',price:0,free:true,col:['#3a3d4a','#f3f3f0']},
 {id:'sn_shoe_white',slot:'shoes',cat:'trainers',name:'Classic white trainers',icon:'👟',price:300,col:['#fafafa','#d9d9d9']},
 {id:'sn_shoe_hi',slot:'shoes',cat:'trainers',name:'High-tops',icon:'👟',price:400,col:['#c8102e','#fafafa']},
 {id:'sn_shoe_run',slot:'shoes',cat:'trainers',name:'Running shoes',icon:'👟',price:350,col:['#2ef2c5','#1d2033']},
 {id:'sn_boots',slot:'shoes',cat:'trainers',name:'Leather boots',icon:'🥾',price:450,col:['#6b4226','#3e2614']},
 // accessories
 {id:'sn_phones',slot:'head',cat:'accessories',name:'Over-ear headphones',icon:'🎧',price:250,col:['#2b2d3a','#8f7bff']},
 {id:'sn_cap',slot:'head',cat:'accessories',name:'Cap',icon:'🧢',price:120,col:['#1f2a44','#ffffff']},
 {id:'sn_beanie',slot:'head',cat:'accessories',name:'Beanie',icon:'🧶',price:120,col:['#c0392b','#e8e8ec']},
 {id:'sn_glasses_round',slot:'eyes',cat:'accessories',name:'Round glasses',icon:'👓',price:150,style:'round',col:['#2b2d3a']},
 {id:'sn_glasses_rect',slot:'eyes',cat:'accessories',name:'Rectangle glasses',icon:'👓',price:150,style:'rect',col:['#2b2d3a']},
 {id:'sn_watch',slot:'wrist',cat:'accessories',name:'Smartwatch',icon:'⌚',price:450,col:['#1d2033','#2ef2c5']},
 {id:'sn_band',slot:'wrist',cat:'accessories',name:'Fitness band',icon:'⌚',price:200,col:['#ff9f43','#1d2033']},
 // desk & room (one item per spot)
 {id:'sn_lamp',slot:'d_left',cat:'desk',name:'Desk lamp',icon:'💡',price:0,free:true},
 {id:'sn_laptop',slot:'d_mid',cat:'desk',name:'Laptop',icon:'💻',price:0,free:true},
 {id:'sn_monitors',slot:'d_mid',cat:'desk',name:'Dual monitors',icon:'🖥️',price:800},
 {id:'sn_plant',slot:'d_right',cat:'desk',name:'Desk plant',icon:'🪴',price:100},
 {id:'sn_books',slot:'d_right',cat:'desk',name:'Stack of revision guides',icon:'📚',price:80},
 {id:'sn_shelf',slot:'wall',cat:'desk',name:'Bookshelf',icon:'📚',price:300},
 {id:'sn_whiteboard',slot:'wall',cat:'desk',name:'Whiteboard of formulas',icon:'🧮',price:350},
 {id:'sn_beanbag',slot:'floor',cat:'desk',name:'Beanbag',icon:'🛋️',price:400},
 // hobby items (shown for that hobby)
 {id:'sn_tactics',slot:'wall',cat:'desk',name:'Tactics board',icon:'📋',price:450,hobby:'football'},{id:'sn_signedball',slot:'d_right',cat:'desk',name:'Signed match ball',icon:'⚽',price:500,hobby:'football'},
 {id:'sn_simrig',slot:'floor',cat:'desk',name:'Sim-racing seat',icon:'🏎️',price:900,hobby:'f1'},{id:'sn_helmet',slot:'d_right',cat:'desk',name:'Helmet display',icon:'⛑️',price:500,hobby:'f1'},
 {id:'sn_synth',slot:'d_right',cat:'desk',name:'Synth keyboard',icon:'🎹',price:700,hobby:'music'},{id:'sn_turntable',slot:'d_left',cat:'desk',name:'Vinyl turntable',icon:'💿',price:600,hobby:'music'},
 {id:'sn_gchair',slot:'floor',cat:'desk',name:'Gaming chair',icon:'🪑',price:800,hobby:'gaming'},{id:'sn_console',slot:'d_right',cat:'desk',name:'Games console',icon:'🎮',price:600,hobby:'gaming'},
 {id:'sn_moodboard',slot:'wall',cat:'desk',name:'Mood board',icon:'🧷',price:350,hobby:'fashion'},{id:'sn_sketch',slot:'d_right',cat:'desk',name:'Sketchbook & pens',icon:'✏️',price:250,hobby:'fashion'},
 {id:'sn_keyboard',slot:'d_right',cat:'desk',name:'Mechanical keyboard',icon:'⌨️',price:400,hobby:'coding'},{id:'sn_codescreen',slot:'wall',cat:'desk',name:'Code poster',icon:'🖼️',price:300,hobby:'coding'},
 {id:'sn_telescope',slot:'floor',cat:'desk',name:'Telescope',icon:'🔭',price:800,hobby:'space'},{id:'sn_rocket',slot:'d_right',cat:'desk',name:'Rocket model',icon:'🚀',price:450,hobby:'space'},
 {id:'sn_camera',slot:'floor',cat:'desk',name:'Camera on tripod',icon:'🎥',price:700,hobby:'film'},{id:'sn_poster',slot:'wall',cat:'desk',name:'Film poster',icon:'🎞️',price:300,hobby:'film'},
 {id:'sn_globe',slot:'d_right',cat:'desk',name:'Globe',icon:'🌍',price:400,hobby:'travel'},{id:'sn_map',slot:'wall',cat:'desk',name:'World map with pins',icon:'🗺️',price:350,hobby:'travel'},
 {id:'sn_dumbbells',slot:'floor',cat:'desk',name:'Dumbbells',icon:'🏋️',price:300,hobby:'fitness'},{id:'sn_bike',slot:'floor',cat:'desk',name:'Exercise bike',icon:'🚲',price:800,hobby:'fitness'},
 // backdrops (behind the character and in the page)
 {id:'sn_bd_city',slot:'backdrop',cat:'backdrops',name:'City at night',icon:'🌃',price:0,free:true,sky:['#151a3a','#0c0f22'],glow:'#ffb547'},
 {id:'sn_bd_sunrise',slot:'backdrop',cat:'backdrops',name:'Sunrise over the city',icon:'🌅',price:500,sky:['#3a2453','#ff9a6b'],glow:'#ffd27a'},
 {id:'sn_bd_stadium',slot:'backdrop',cat:'backdrops',name:'Stadium under lights',icon:'🏟️',price:900,hobby:'football',sky:['#0e2a1c','#071710'],glow:'#c9ffdf'},
 {id:'sn_bd_pitlane',slot:'backdrop',cat:'backdrops',name:'Pit lane at night',icon:'🏁',price:900,hobby:'f1',sky:['#2a0f12','#100607'],glow:'#ff8080'},
 {id:'sn_bd_studio',slot:'backdrop',cat:'backdrops',name:'Rooftop studio at night',icon:'🌆',price:900,hobby:'music',sky:['#1a1540','#0b0a1f'],glow:'#ffb547'},
 {id:'sn_bd_arena',slot:'backdrop',cat:'backdrops',name:'Esports arena',icon:'🕹️',price:900,hobby:'gaming',sky:['#071a1f','#03090c'],glow:'#2ef2c5'},
 {id:'sn_bd_atelier',slot:'backdrop',cat:'backdrops',name:'Design studio',icon:'🪡',price:900,hobby:'fashion',sky:['#2a1424','#12080f'],glow:'#ff7eb6'},
 {id:'sn_bd_lab',slot:'backdrop',cat:'backdrops',name:'Tech lab',icon:'🧪',price:900,hobby:'coding',sky:['#0c1a2e','#050b14'],glow:'#7cc4ff'},
 {id:'sn_bd_observatory',slot:'backdrop',cat:'backdrops',name:'Observatory',icon:'🌌',price:900,hobby:'space',sky:['#0d0b2a','#040312'],glow:'#9d8cff'},
 {id:'sn_bd_cinema',slot:'backdrop',cat:'backdrops',name:'Cinema premiere',icon:'🎦',price:900,hobby:'film',sky:['#2a1f0a','#110c03'],glow:'#ffd166'},
 {id:'sn_bd_skyline',slot:'backdrop',cat:'backdrops',name:'World skyline',icon:'🏙️',price:900,hobby:'travel',sky:['#0b2427','#041012'],glow:'#4fd1c5'},
 {id:'sn_bd_track',slot:'backdrop',cat:'backdrops',name:'Running track at dusk',icon:'🏟️',price:900,hobby:'fitness',sky:['#2c1606','#120803'],glow:'#ff9f43'},
 // frames
 {id:'sn_fr_clean',slot:'frame',cat:'frames',name:'Clean frame',icon:'⬜',price:0,free:true,frame:'clean'},
 {id:'sn_fr_neon',slot:'frame',cat:'frames',name:'Neon edge',icon:'🟪',price:300,frame:'neon'},
 {id:'sn_fr_gold',slot:'frame',cat:'frames',name:'Gold frame',icon:'🟨',price:900,lvl:15,frame:'gold'},
 // titles — earned, never bought
 {id:'sn_t_starter',slot:'title',cat:'titles',name:'Grade Chaser',icon:'🏷️',price:0,free:true},
 {id:'sn_t_quad',slot:'title',cat:'titles',name:'Quadratic Boss',icon:'🏷️',price:0,earn:{topic:'gcse_algebra',n:50}},
 {id:'sn_t_trig',slot:'title',cat:'titles',name:'Trig Master',icon:'🏷️',price:0,earn:{topic:'gcse_geometry',n:40}},
 {id:'sn_t_number',slot:'title',cat:'titles',name:'Index Ace',icon:'🏷️',price:0,earn:{topic:'gcse_number',n:40}},
 {id:'sn_t_prob',slot:'title',cat:'titles',name:'Probability Pro',icon:'🏷️',price:0,earn:{topic:'gcse_stats',n:40}},
 {id:'sn_t_streak',slot:'title',cat:'titles',name:'Consistent',icon:'🏷️',price:0,earn:{any:'best',n:25}},
 // study perk
 {id:'sn_sounds',slot:'perk',cat:'perks',name:'Focus sounds (soft rain)',icon:'🌧️',price:250,perk:'sounds'}];
const SN_BY=Object.fromEntries(SN_ITEMS.map(i=>[i.id,i]));
const SN_DEFAULT={top:'sn_hoodie_grey',shoes:'sn_shoe_basic',head:null,eyes:null,wrist:null,frame:'sn_fr_clean',backdrop:'sn_bd_city',title:'sn_t_starter',
 desk:{d_left:'sn_lamp',d_mid:'sn_laptop',d_right:null,wall:null,floor:null}};
// level from XP (everything ever earned): level L needs 40 × (L − 1)² XP
const snLevel=xp=>Math.floor(Math.sqrt(Math.max(0,xp)/40))+1,snXpFor=L=>40*(L-1)*(L-1);
const snXP=s=>Math.max(0,(s&&s.points)||0);
function snEarned(s,it){if(!it.earn)return true;const e=it.earn;if(e.any==='best')return (s.best||0)>=e.n;const b=(s.byTopic||{})[e.topic];return !!b&&(b.first||0)>=e.n;}
function snUnlocked(s,it){return (!it.lvl||snLevel(snXP(s))>=it.lvl)&&snEarned(s,it);}
function snOwns(s,id){const it=SN_BY[id];if(!it)return false;if(it.free)return true;if(it.earn)return snEarned(s,it);return Array.isArray(s.sOwned)&&s.sOwned.includes(id);}
function snHobbyFromTheme(s){const t=s&&s.theme&&s.theme.id;return t==='space'?'space':t==='music'?'music':t==='animals'?'travel':'football';}
// checks the senior record loaded from storage or a file (runs after the children's items are checked)
function cleanSenior(s){const d=SN_DEFAULT,raw=s.senior&&typeof s.senior==='object'?s.senior:{};
 const usedByJunior=(s.owned||[]).reduce((n,id)=>{const it=typeof itemById!=='undefined'&&itemById[id];return n+(it&&!it.unlock&&!it.free?it.price:0);},0);
 let budget=Math.max(0,(s.spent||0)-usedByJunior);
 s.sOwned=(Array.isArray(s.sOwned)?[...new Set(s.sOwned)]:[]).filter(id=>{const it=SN_BY[id];if(!it||it.free||it.earn)return false;if(it.price<=budget){budget-=it.price;return true;}return false;});
 const pick=(slot,v)=>typeof v==='string'&&SN_BY[v]&&SN_BY[v].slot===slot&&snOwns(s,v)?v:null;
 const sn={theme:raw.theme==='light'?'light':'dark',hobby:HOBBIES[raw.hobby]?raw.hobby:snHobbyFromTheme(s),sounds:!!raw.sounds,desk:{}};
 for(const k of ['top','shoes','head','eyes','wrist','frame','backdrop','title']){const v=pick(k,raw[k]);sn[k]=v!==null?v:(raw[k]===null&&['head','eyes','wrist'].includes(k)?null:d[k]);}
 const rd=raw.desk&&typeof raw.desk==='object'?raw.desk:{};for(const k of Object.keys(d.desk)){const v=pick(k,rd[k]);sn.desk[k]=v!==null?v:(rd[k]===null?null:d.desk[k]);}
 s.senior=sn;return s;}
{const base=cleanMetrics;cleanMetrics=function(s){return cleanSenior(base(s));};}
