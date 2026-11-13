'use strict';
// THEMES: each child chooses a look. A theme sets the colours, background, header tagline, title icon and sticker,
// and swaps the story words in questions (Liverpool, Anfield, the Beano, football…) so the maths reads naturally.
// Apollo's look is the "Anfield" theme, and nothing changes unless a different theme is chosen.
const THEMES={
 anfield:{name:'⚽ Anfield (Liverpool)',tag:'🔴 ANFIELD MATHS ACADEMY • THE ULTIMATE EDITION',icon:'🚀',sticker:"BAM!<br>YOU'VE<br>GOT THIS!",vars:{'--red':'#e51c35','--yellow':'#ffe45e','--blue':'#64d9f5','--green':'#3dcf9b'},bg:'#fff0d1',dot:'#edcf9b',subs:[]},
 football:{name:'⚽ Football — my team',tag:c=>`⚽ ${c.club.toUpperCase()} MATHS ACADEMY`,icon:'⚽',sticker:'GOAL!<br>YOU’VE<br>GOT THIS!',vars:c=>({'--red':c.colour,'--yellow':'#ffe45e','--blue':'#64d9f5','--green':'#3dcf9b'}),bg:'#f3f6ef',dot:'#d5dfcb',
  subs:c=>[[/\bLiverpool’s\b|\bLiverpool's\b/g,`${c.club}’s`],[/\bLiverpool\b/g,c.club],[/\bthe Anfield\b/g,'the stadium'],[/\bAnfield\b/g,`${c.club}’s stadium`],[/\bthe Reds\b/g,`the ${c.club} team`]]},
 space:{name:'🚀 Space',tag:'🚀 STARLANE SPACE ACADEMY',icon:'🛰️',sticker:'BLAST<br>OFF!<br>🚀',vars:{'--red':'#4b3fc9','--yellow':'#ffd84a','--blue':'#7fe9ff','--green':'#3dcf9b'},bg:'#eef0ff',dot:'#ccd2f7',
  subs:[[/\bLiverpool’s\b|\bLiverpool's\b/g,'the space station’s'],[/\bLiverpool\b/g,'the space station'],[/\bAnfield\b/g,'Mission Control'],[/\bthe Beano\b/g,'the Galaxy Gazette'],[/\bBeano\b/g,'Galaxy Gazette'],[/\bfootball\b/g,'space'],[/\bFootball\b/g,'Space'],[/\bfootballs\b/g,'space balls']]},
 animals:{name:'🐾 Animals & nature',tag:'🐾 WILD MATHS ACADEMY',icon:'🦊',sticker:'ROAR!<br>YOU’VE<br>GOT THIS!',vars:{'--red':'#2f9e5b','--yellow':'#ffe45e','--blue':'#7fd8f0','--green':'#7bd389'},bg:'#eefaf0',dot:'#c9e8cf',
  subs:[[/\bLiverpool’s\b|\bLiverpool's\b/g,'the wildlife park’s'],[/\bLiverpool\b/g,'the wildlife park'],[/\bAnfield\b/g,'the nature reserve'],[/\bthe Beano\b/g,'Wild World magazine'],[/\bBeano\b/g,'Wild World'],[/\bfootball\b/g,'nature'],[/\bFootball\b/g,'Nature']]},
 music:{name:'🎵 Music & art',tag:'🎵 STAGE & STUDIO MATHS ACADEMY',icon:'🎨',sticker:'ENCORE!<br>YOU’VE<br>GOT THIS!',vars:{'--red':'#d6336c','--yellow':'#ffe45e','--blue':'#63e6be','--green':'#3dcf9b'},bg:'#fff0f6',dot:'#f3cfe0',
  subs:[[/\bLiverpool’s\b|\bLiverpool's\b/g,'the music festival’s'],[/\bLiverpool\b/g,'the music festival'],[/\bAnfield\b/g,'the concert hall'],[/\bthe Beano\b/g,'Pop Weekly'],[/\bBeano\b/g,'Pop Weekly'],[/\bfootball\b/g,'music'],[/\bFootball\b/g,'Music']]}};
const TEAM_COLOURS=[['#e51c35','Red'],['#034694','Blue'],['#6cabdd','Sky blue'],['#132257','Navy'],['#7a263a','Claret'],['#241f20','Black & white'],['#fdb913','Gold'],['#00a650','Green']];
function themeConf(s){s=s||(typeof stats!=='undefined'?stats:null);const t=(s&&s.theme&&typeof s.theme==='object')?s.theme:{};return{id:THEMES[t.id]?t.id:'anfield',club:(t.club||'My Team').slice(0,24),colour:t.colour||'#e51c35'};}
const val=(v,c)=>typeof v==='function'?v(c):v;
function themeText(x,s){const c=themeConf(s),subs=val(THEMES[c.id].subs,c)||[];if(!subs.length)return x;const cap=t=>t.replace(/(^|[.!?]\s+)([a-z])/g,(m,p,ch)=>p+ch.toUpperCase());const f=v=>typeof v==='string'?(()=>{const out=subs.reduce((t,[re,to])=>t.replace(re,to),v);return out===v?v:cap(out);})():Array.isArray(v)?v.map(f):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,w])=>[k,f(w)])):v;return f(x);}
function applyTheme(){const c=themeConf(),T=THEMES[c.id],root=document.documentElement;
 Object.entries(val(T.vars,c)).forEach(([k,v])=>root.style.setProperty(k,v));root.style.setProperty('--bg',T.bg);root.style.setProperty('--dot',T.dot);document.body.dataset.theme=c.id;
 const tag=document.querySelector('.hero small');if(tag)tag.textContent=val(T.tag,c);const ic=document.querySelector('.hero .rocket');if(ic)ic.textContent=T.icon;window.THEME_STICKER=T.sticker;
 const st=document.querySelector('.hero .sticker');if(st&&/BAM|GOAL|BLAST|ROAR|ENCORE/.test(st.textContent))st.innerHTML=T.sticker;if(typeof hdrLast!=='undefined')try{hdrLast='';}catch(e){}}
// questions read in the chosen theme (wrapping the existing name personalising)
if(typeof personalise==='function'){const base=personalise;window.personalise=function(x){return themeText(base(x));};}
// the theme picker (from ⚙️ Menu)
function openThemes(){let d=document.getElementById('themeDlg');if(!d){d=document.createElement('dialog');d.id='themeDlg';d.className='theme-dlg';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-th-close]'))d.close();});}
 const c=themeConf();d.innerHTML=`<button type="button" class="ghost" data-th-close style="float:right">✕</button><h2>🎨 Choose a theme</h2><p class="mini">Changes the colours, the header and the stories in the questions — the maths stays the same.</p>
 <div class="th-grid">${Object.entries(THEMES).map(([k,t])=>`<button type="button" class="th-card${k===c.id?' on':''}" data-th="${k}" style="--c:${k==='football'?c.colour:val(t.vars,c)['--red']}"><span class="th-swatch"></span><b>${t.name}</b></button>`).join('')}</div>
 <div class="th-club${c.id==='football'?'':' hidden'}"><label>Team name <input data-th-club maxlength="24" value="${esc(c.club)}"></label><div class="th-cols">${TEAM_COLOURS.map(([h,n])=>`<button type="button" class="th-col${h===c.colour?' on':''}" data-th-col="${h}" title="${n}" style="background:${h}"></button>`).join('')}</div></div>`;
 if(!d.open)d.showModal();}
function setTheme(p){if(typeof stats==='undefined')return;stats.theme=Object.assign({},themeConf(),p);if(typeof save==='function')save(false);applyTheme();openThemes();if(typeof newQuestion==='function'&&typeof current!=='undefined'&&current&&!current.answered)try{}catch(e){}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-th]');if(t){setTheme({id:t.dataset.th});return;}const col=e.target.closest&&e.target.closest('[data-th-col]');if(col)setTheme({colour:col.dataset.thCol});});
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('[data-th-club]');if(i)setTheme({club:i.value.trim()||'My Team'});});
window.addEventListener('load',()=>{try{applyTheme();}catch(e){}setTimeout(()=>{const m=document.getElementById('hubMenu');if(m&&!document.getElementById('themeBtn')){const b=document.createElement('button');b.type='button';b.className='heroBtn';b.id='themeBtn';b.textContent='🎨 Theme';b.addEventListener('click',openThemes);m.insertBefore(b,m.firstChild);}},300);});
setInterval(()=>{try{const c=themeConf();const sig=JSON.stringify(c);if(document.body.dataset.themeSig!==sig){document.body.dataset.themeSig=sig;applyTheme();}}catch(e){}},1500);
