'use strict';
// DATA: themed Shop catalogues. Each theme sells things that fit it; the football themes keep the original Shop.
// Themed items are drawn from their emoji (em) and colour (col) — see the drawing fallback in js/student.js.
(function(){
const T=(theme,list)=>list.map(([id,slot,cat,name,em,price,desc,extra])=>Object.assign({id:theme.slice(0,2)+'_'+id,slot,cat,name,icon:em,em,price,desc,theme},price===0?{free:true}:{},extra||{}));
const items=[
 ...T('animals',[
  ['tee','top','kits','Nature T-shirt','🌱',0,'Your starter shirt for the great outdoors.',{col:'#5bb36a'}],
  ['magnifier','hand','hands','Magnifying glass','🔍',0,'For spotting bugs, footprints and tricky numbers.'],
  ['meadow','scene','scenes','Wildflower meadow','🌼',0,'Bees, butterflies and a sunny sky.',{bg:'linear',sky:'#bfe9ff',ground:'#8fd694',dec:['🌼','🦋','🌷']}],
  ['ranger','top','kits','Ranger shirt','🌿',60,'Khaki shirt with a leaf badge.',{col:'#7a8a4a'}],
  ['fleece','top','kits','Forest fleece','🌲',180,'Cosy green fleece for woodland walks.',{col:'#2f7d4a'}],
  ['vettop','top','kits','Vet’s scrubs','🩺',420,'For looking after every creature.',{col:'#3fb8c4'}],
  ['explorer','top','kits','Safari explorer jacket','🦒',900,'Pockets for maps, snacks and notebooks.',{col:'#c9a35b'}],
  ['rangerhat','hat','hats','Ranger hat','🤠',90,'Keeps the sun off on long nature walks.'],
  ['flowercrown','hat','hats','Flower crown','🌸',160,'Picked from the meadow (with permission).'],
  ['wellies','boots','boots','Wellies','🥾',80,'For puddles, ponds and muddy fields.',{col:'#2f9e5b'}],
  ['binoculars','hand','hands','Binoculars','🔭',220,'Spot a kingfisher from across the lake.'],
  ['net','hand','hands','Pond-dipping net','🥅',140,'Who knows what lives in there?'],
  ['hedgehog','pet','pets','Pet hedgehog','🦔',300,'Small, spiky and very good at counting.'],
  ['fox','pet','pets','Fox cub','🦊',650,'Clever, quick and always curious.'],
  ['owl','pet','pets','Wise owl','🦉',1200,'Knows every times table by heart.'],
  ['forest','scene','scenes','Ancient forest','🌳',350,'Tall trees and a babbling brook.',{sky:'#cfeccf',ground:'#5a8f4e',dec:['🌳','🍄','🐿️']}],
  ['ocean','scene','scenes','Ocean reef','🐠',800,'Coral, turtles and bright fish.',{sky:'#9fe3ff',ground:'#3aa6c9',dec:['🐠','🐢','🪸']}],
  ['safari','scene','scenes','Safari sunset','🦁',1600,'Lions, giraffes and a golden sky.',{sky:'#ffcf8a',ground:'#d9a24a',dec:['🦒','🦁','🌳']}]]),
 ...T('space',[
  ['tee','top','kits','Mission T-shirt','🚀',0,'Your starter shirt for space training.',{col:'#2c3e8f'}],
  ['wrench','hand','hands','Space wrench','🔧',0,'Fixes satellites and sums.'],
  ['launchpad','scene','scenes','Launch pad','🚀',0,'Countdown complete — ready for lift-off.',{sky:'#1b1f4b',ground:'#4b4f70',dec:['⭐','🚀','✨']}],
  ['flightsuit','top','kits','Flight suit','👨‍🚀',60,'Orange flight suit with mission patches.',{col:'#f28c28'}],
  ['spacesuit','top','kits','Moonwalk suit','🌙',260,'Bright white with a silver visor clip.',{col:'#e8ecf5'}],
  ['captain','top','kits','Starship captain’s uniform','⭐',700,'Gold stripes for a fleet commander.',{col:'#3b3fa8'}],
  ['nebula','top','kits','Nebula hoodie','🌌',1400,'Swirling purple galaxies.',{col:'#6b3fc9'}],
  ['helmet','hat','hats','Astronaut helmet','🪖',180,'Safety first in a vacuum.'],
  ['antenna','hat','hats','Alien antennae','👽',120,'Pick up signals from far-off planets.'],
  ['moonboots','boots','boots','Moon boots','🥾',90,'Extra bounce in low gravity.',{col:'#c9d2e6'}],
  ['jetpack','hand','hands','Jetpack remote','🕹️',300,'Zoom between the stars.'],
  ['telescope','hand','hands','Star telescope','🔭',220,'Find the rings of Saturn.'],
  ['robot','pet','pets','Robot buddy','🤖',300,'Beeps happily at every right answer.'],
  ['alien','pet','pets','Friendly alien','👾',700,'Speaks fluent maths.'],
  ['comet','pet','pets','Pet comet','☄️',1300,'Leaves a sparkly trail.'],
  ['moonbase','scene','scenes','Moon base','🌕',400,'Craters, domes and the Earth rising.',{sky:'#0e1230',ground:'#9aa0b5',dec:['🌍','🛰️','⭐']}],
  ['saturn','scene','scenes','Saturn’s rings','🪐',900,'The best view in the solar system.',{sky:'#271a52',ground:'#5b4a8a',dec:['🪐','✨','🌠']}]]),
 ...T('music',[
  ['tee','top','kits','Rainbow T-shirt','🌈',0,'Your starter shirt for the studio and the stage.',{col:'#f28ab2'}],
  ['brush','hand','hands','Paintbrush','🖌️',0,'Ready for a masterpiece.'],
  ['studio','scene','scenes','Art studio','🎨',0,'Easels, paint pots and sunshine.',{sky:'#fff0f6',ground:'#e9c6d8',dec:['🎨','🖼️','✏️']}],
  ['artsmock','top','kits','Artist’s smock','🎨',60,'Splattered with every colour.',{col:'#f2f2f2'}],
  ['bandtee','top','kits','Band T-shirt','🎸',180,'From your favourite (imaginary) tour.',{col:'#2a2a3a'}],
  ['sparkle','top','kits','Sparkly stage jacket','✨',600,'Catches every spotlight.',{col:'#d6336c'}],
  ['orchestra','top','kits','Orchestra waistcoat','🎻',1200,'Smart enough for the concert hall.',{col:'#1d2b5c'}],
  ['beret','hat','hats','Artist’s beret','🎩',100,'Instantly 20% more creative.'],
  ['headphones','hat','hats','Studio headphones','🎧',200,'Hear every beat clearly.'],
  ['dancers','boots','boots','Dance shoes','🩰',90,'Light on your feet.',{col:'#f28ab2'}],
  ['guitar','hand','hands','Guitar','🎸',300,'Strum along while you think.'],
  ['mic','hand','hands','Microphone','🎤',220,'Take a bow after every right answer.'],
  ['parrot','pet','pets','Singing parrot','🦜',320,'Repeats your answers in tune.'],
  ['cat','pet','pets','Jazz cat','🐈',650,'Cool, calm and very musical.'],
  ['unicorn','pet','pets','Rainbow unicorn','🦄',1300,'Paints rainbows wherever it goes.'],
  ['stage','scene','scenes','Concert stage','🎤',400,'Lights, crowd, encore!',{sky:'#2b1638',ground:'#6b3a6b',dec:['🎶','💡','🎵']}],
  ['gallery','scene','scenes','Art gallery','🖼️',900,'Your work on the wall.',{sky:'#f6efe6',ground:'#c9b79c',dec:['🖼️','🗿','🖌️']}]])];
for(const it of items){shopItems.push(it);itemById[it.id]=it;}
})();
