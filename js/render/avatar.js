'use strict';
// PRESENTATION: draws Apollo's player as an original comic-style SVG from the avatar data (js/data/shop.js).
// drawAvatar(avatar, {scene:true|false, preview:{slot:id}}) -> SVG string. viewBox 240 × 300.
const AV_INK='#121625';
let avatarSeq=0;
function drawAvatar(av,opt={}){
 const id='av'+(++avatarSeq),eq={...av.eq,...(opt.preview||{})};
 const itm=slot=>(typeof itemById!=='undefined'&&itemById[eq[slot]])||null,art=slot=>{const i=itm(slot);return i?(i.art||i.id):null;},sty=slot=>{const i=itm(slot);return i&&i.style||{};};let extraDefs='';
 const skin=avatarOptions.skins[av.skin][0],hairC=avatarOptions.hairColours[av.hairCol][0],kit=avatarOptions.kits[av.kit][0];
 const st=`stroke="${AV_INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
 const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f))));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');};
 const light=hex=>{const n=parseInt(hex.slice(1),16);return((n>>16)*0.3+((n>>8)&255)*0.59+(n&255)*0.11)>150;};
 let g='';
 // ---------- scene ----------
 if(opt.scene!==false)g+=`<g clip-path="url(#${id}c)">${SCENES[eq.scene]||(typeof SCENES_X!=='undefined'&&SCENES_X[art('scene')]?SCENES_X[art('scene')]():SCENES.park)}</g>`;
 // ---------- behind the body ----------
 if(eq.back==='cape')g+=`<path d="M84,166 Q58,230 52,286 L188,286 Q182,230 156,166 Z" fill="#c8102e" ${st}/><path d="M92,178 Q76,236 72,280" stroke="#8d0b20" stroke-width="3" fill="none"/>`;
 if(eq.back==='jetpack')g+=`<rect x="58" y="150" width="24" height="64" rx="11" fill="#9aa3b5" ${st}/><rect x="158" y="150" width="24" height="64" rx="11" fill="#9aa3b5" ${st}/><path d="M62,214 L70,246 L78,214Z M162,214 L170,246 L178,214Z" fill="#ff8a1c" ${st}/><path d="M66,214 L70,232 L74,214Z M166,214 L170,232 L174,214Z" fill="#ffe45e"/>`;
 {const bx=typeof BACK_X!=='undefined'&&BACK_X[art('back')];if(bx&&!['cape','jetpack'].includes(eq.back))g+=bx(st,sty('back'));}
 if(av.hair==='afro')g+=`<circle cx="120" cy="92" r="64" fill="${hairC}" ${st}/>`;
 // ---------- legs, socks, boots ----------
 g+=`<rect x="92" y="250" width="17" height="28" fill="${skin}" ${st}/><rect x="131" y="250" width="17" height="28" fill="${skin}" ${st}/>`;
 g+=`<rect x="91" y="266" width="19" height="16" rx="3" fill="${eq.top==='goldkit'?'#f5c542':'#fff'}" ${st}/><rect x="130" y="266" width="19" height="16" rx="3" fill="${eq.top==='goldkit'?'#f5c542':'#fff'}" ${st}/>`;
 const bst=sty('boots'),bootCol=bst.c||{classicboots:'#ffffff',neonboots:'#9dff2e',boltboots:'#2f7bff',goldboots:'#f5c542'}[eq.boots]||'#1e2333';
 g+=`<path d="M88,292 Q86,280 98,280 L110,280 Q116,286 114,292 Z" fill="${bootCol}" ${st}/><path d="M152,292 Q154,280 142,280 L130,280 Q124,286 126,292 Z" fill="${bootCol}" ${st}/>`;
 if(bst.s)g+=`<path d="M95,284 L100,290 M101,283 L106,290 M145,284 L140,290 M139,283 L134,290" stroke="${bst.s}" stroke-width="2.4"/>`;
 if(eq.boots==='classicboots')g+=`<path d="M96,284 L100,290 M102,283 L106,290 M144,284 L140,290 M138,283 L134,290" stroke="${AV_INK}" stroke-width="2"/>`;
 if(eq.boots==='boltboots')g+=`<path d="M100,281 L96,287 L102,286 L99,291 M140,281 L144,287 L138,286 L141,291" stroke="#ffe45e" stroke-width="2.4" fill="none"/>`;
 if(eq.boots==='goldboots')g+=`<path d="M93,284 L104,284 M136,284 L147,284" stroke="#fff6b0" stroke-width="2.5"/>`;
 // ---------- shorts ----------
 const shortsCol=sty('top').shorts||(sty('top').pat?'#1e2333':(eq.top==='hero'?'#c8102e':eq.top==='goldkit'?'#ffffff':eq.top==='galaxy'?'#140b33':'#1e2333'));
 g+=`<path d="M84,222 L156,222 L158,256 L124,256 L120,244 L116,256 L82,256 Z" fill="${shortsCol}" ${st}/>`;
 // ---------- neck, torso, arms ----------
 g+=`<rect x="109" y="136" width="22" height="26" fill="${skin}" ${st}/>`;
 const torso='M80,162 Q120,150 160,162 L180,198 L162,206 L158,228 L82,228 L78,206 L60,198 Z';
 let topFill=kit,deco='',numCol=light(kit)?AV_INK:'#fff',showNum=true;
 if(eq.top==='bib'){deco=`<path d="M92,160 L148,160 L156,228 L84,228 Z" fill="#d7ff3a" opacity=".95"/>`+Array.from({length:18},(_,i)=>`<circle cx="${92+(i%6)*11}" cy="${176+Math.floor(i/6)*16}" r="1.6" fill="#9fc21f"/>`).join('');numCol=AV_INK;}
 if(eq.top==='stripes'){deco=[86,104,122,140].map(x=>`<rect x="${x}" y="150" width="9" height="80" fill="#fff"/>`).join('');numCol=AV_INK;}
 if(eq.top==='hoodie'){topFill='#8a93a6';showNum=false;deco=`<path d="M100,160 Q120,176 140,160" fill="none" stroke="${AV_INK}" stroke-width="2.5"/><path d="M112,170 L110,190 M128,170 L130,190" stroke="#fff" stroke-width="2.5"/><path d="M96,204 L144,204 L140,224 L100,224 Z" fill="#7a8396" stroke="${AV_INK}" stroke-width="2"/>`;}
 if(eq.top==='hero'){topFill='#2457d6';showNum=false;deco=`<path d="M120,172 L138,188 L120,206 L102,188 Z" fill="#ffe45e" stroke="${AV_INK}" stroke-width="2.5"/><text x="120" y="194" text-anchor="middle" font-size="17" font-weight="900" fill="#c8102e" font-family="system-ui,Arial">A</text><rect x="82" y="214" width="76" height="9" fill="#c8102e"/>`;}
 if(eq.top==='goldkit'){topFill=`url(#${id}gold)`;numCol=AV_INK;deco=`<path d="M86,170 L100,160 L94,226 L84,226 Z" fill="#fff" opacity=".35"/>`;}
 if(eq.top==='galaxy'){topFill=`url(#${id}gal)`;numCol='#ffe45e';deco=Array.from({length:14},(_,i)=>`<circle cx="${84+((i*37)%72)}" cy="${164+((i*23)%60)}" r="${i%3?1.4:2.4}" fill="#fff"/>`).join('');}
 {const ts=sty('top');if(ts.pat&&typeof TOP_PAT!=='undefined'){topFill=ts.pat==='gradient'?`url(#${id}tg)`:ts.c1;deco=TOP_PAT[ts.pat](ts.c1,ts.c2);numCol=ts.pat==='gradient'?'#fff':light(ts.c1)?AV_INK:'#fff';showNum=true;if(ts.pat==='gradient')extraDefs+=`<linearGradient id="${id}tg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${ts.c1}"/><stop offset="1" stop-color="${ts.c2}"/></linearGradient>`;}}
 g+=`<path d="${torso}" fill="${topFill}" ${st}/><g clip-path="url(#${id}t)">${deco}</g><path d="${torso}" fill="none" ${st}/>`;
 if(showNum)g+=`<text x="120" y="204" text-anchor="middle" font-size="26" font-weight="900" fill="${numCol}" font-family="system-ui,Arial" paint-order="stroke" stroke="${numCol===AV_INK?'#fff':AV_INK}" stroke-width="3">${av.num}</text>`;
 if(eq.top!=='hoodie'&&eq.top!=='hero')g+=`<path d="M108,158 L120,170 L132,158" fill="none" stroke="${eq.top==='bib'?AV_INK:'#fff'}" stroke-width="3"/>`;
 g+=`<rect x="63" y="198" width="15" height="34" rx="7" fill="${skin}" ${st}/><rect x="162" y="198" width="15" height="34" rx="7" fill="${skin}" ${st}/><circle cx="70" cy="236" r="9" fill="${skin}" ${st}/><circle cx="170" cy="236" r="9" fill="${skin}" ${st}/>`;
 // ---------- chest / neck / arm extras ----------
 if(eq.arm==='armband')g+=`<rect x="61" y="204" width="19" height="11" rx="2" fill="#ffe45e" ${st}/><text x="70.5" y="213.5" text-anchor="middle" font-size="10" font-weight="900" fill="${AV_INK}" font-family="system-ui,Arial">C</text>`;
 if(eq.chest==='medal'||eq.chest==='acemedal')g+=`<path d="M106,158 L120,186 L134,158" fill="none" stroke="${eq.chest==='medal'?'#2457d6':'#c8102e'}" stroke-width="6"/><circle cx="120" cy="192" r="12" fill="#f5c542" ${st}/><text x="120" y="197" text-anchor="middle" font-size="${eq.chest==='medal'?13:10}" font-weight="900" fill="${AV_INK}" font-family="system-ui,Arial">${eq.chest==='medal'?'★':'A+'}</text>`;
 if(eq.neck==='scarf')g+=`<path d="M100,154 Q120,168 140,154 L142,164 Q120,178 98,164 Z" fill="#e51c35" ${st}/><path d="M134,164 L146,206 L134,208 L126,168 Z" fill="#e51c35" ${st}/><path d="M131,178 L141,177 M134,190 L144,189 M106,160 L108,168 M118,163 L118,172" stroke="#fff" stroke-width="3"/>`;
 if(typeof NECK_X!=='undefined'){const nx=NECK_X[art('neck')];if(nx&&eq.neck!=='scarf')g+=nx(st,sty('neck'));const cx=CHEST_X[art('chest')];if(cx&&!['medal','acemedal'].includes(eq.chest))g+=cx(st,sty('chest'));}
 // ---------- head ----------
 g+=`<circle cx="76" cy="104" r="9" fill="${skin}" ${st}/><circle cx="164" cy="104" r="9" fill="${skin}" ${st}/><circle cx="120" cy="100" r="44" fill="${skin}" ${st}/>`;
 g+=HAIR[av.hair](hairC,st);
 const brow=av.mouth==='determined'?`<path d="M96,86 L112,90 M144,86 L128,90" stroke="${AV_INK}" stroke-width="3.5"/>`:`<path d="M96,88 Q104,83 112,88 M128,88 Q136,83 144,88" stroke="${AV_INK}" stroke-width="3" fill="none"/>`;
 if(!(eq.hat==='helmet'))g+='';
 g+=brow+EYES[av.eyes]()+MOUTHS[av.mouth]()+`<circle cx="94" cy="116" r="6" fill="#ff7a8a" opacity=".35"/><circle cx="146" cy="116" r="6" fill="#ff7a8a" opacity=".35"/>`;
 // ---------- glasses & hats ----------
 if(eq.glasses==='shades')g+=`<path d="M92,96 L114,96 L112,108 Q104,113 95,108 Z M126,96 L148,96 L145,108 Q136,113 128,108 Z" fill="#1e2333" ${st}/><path d="M114,99 L126,99" stroke="${AV_INK}" stroke-width="3"/><path d="M97,99 L104,99" stroke="#9db7ff" stroke-width="2"/>`;
 if(eq.glasses==='shapeshades')g+=`<path d="M92,108 L103,90 L114,108 Z" fill="#64d9f5" opacity=".85" ${st}/><path d="M128,92 L140,92 L146,101 L140,110 L128,110 L122,101 Z" fill="#ffb070" opacity=".9" ${st}/><path d="M114,101 L122,101" stroke="${AV_INK}" stroke-width="3"/>`;
 if(typeof GLASS_X!=='undefined'){const gx=GLASS_X[art('glasses')];if(gx&&!['shades','shapeshades'].includes(eq.glasses))g+=gx(st,sty('glasses'));}
 g+=(HATS[eq.hat]||(typeof HATS_X!=='undefined'&&HATS_X[art('hat')])||(()=>''))(st,hairC,sty('hat'));
 // ---------- held item & sidekick ----------
 g+=(HANDS[eq.hand]||(typeof HANDS_X!=='undefined'&&HANDS_X[art('hand')])||(()=>''))(st,sty('hand'));
 g+=(PETS[eq.pet]||(typeof PETS_X!=='undefined'&&PETS_X[art('pet')])||(()=>''))(st);
 const defs=`<defs><clipPath id="${id}c"><rect width="240" height="300" rx="24"/></clipPath><clipPath id="${id}t"><path d="${torso}"/></clipPath><linearGradient id="${id}gold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".45" stop-color="#f5c542"/><stop offset="1" stop-color="#c8901a"/></linearGradient><linearGradient id="${id}gal" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#3a1d8f"/><stop offset="1" stop-color="#0d0630"/></linearGradient>${extraDefs}</defs>`;
 return `<svg class="avatar-svg" viewBox="0 0 240 300" role="img" aria-label="Apollo’s player" xmlns="http://www.w3.org/2000/svg">${defs}${g}</svg>`;
}
const HAIR={
 short:(c,st)=>`<path d="M76,98 C72,60 102,50 120,50 C140,50 168,60 164,98 C158,80 148,72 120,72 C96,72 82,82 76,98Z" fill="${c}" ${st}/>`,
 spiky:(c,st)=>`<path d="M76,96 L72,70 L86,78 L86,52 L102,66 L110,42 L120,62 L132,42 L138,64 L154,50 L154,76 L168,70 L164,96 C156,80 140,74 120,74 C100,74 84,80 76,96Z" fill="${c}" ${st}/>`,
 curly:(c,st)=>{let s=`<path d="M78,96 C76,62 100,52 120,52 C142,52 166,62 162,96 C150,78 90,78 78,96Z" fill="${c}"/>`;for(let a=195;a<=345;a+=19){const r=a*Math.PI/180;s+=`<circle cx="${(120+42*Math.cos(r)).toFixed(1)}" cy="${(98+42*Math.sin(r)).toFixed(1)}" r="12" fill="${c}" ${st}/>`;}return s;},
 afro:(c,st)=>`<path d="M80,90 Q120,58 160,90 Q150,70 120,66 Q90,70 80,90Z" fill="${c}" ${st}/>`,
 quiff:(c,st)=>`<path d="M76,98 C72,64 96,52 116,52 C124,38 152,32 162,46 C150,46 146,54 150,60 C162,68 168,82 164,98 C156,80 146,74 120,74 C98,74 84,82 76,98Z" fill="${c}" ${st}/>`,
 buzz:(c,st)=>`<path d="M78,94 C78,64 100,56 120,56 C140,56 162,64 162,94 C154,78 140,70 120,70 C100,70 86,78 78,94Z" fill="${c}" opacity=".75" ${st}/>`
};
const EYES={
 round:()=>`<ellipse cx="104" cy="101" rx="8" ry="9" fill="#fff" stroke="${AV_INK}" stroke-width="2.5"/><ellipse cx="136" cy="101" rx="8" ry="9" fill="#fff" stroke="${AV_INK}" stroke-width="2.5"/><circle cx="105" cy="102" r="4.2" fill="${AV_INK}"/><circle cx="137" cy="102" r="4.2" fill="${AV_INK}"/><circle cx="106.5" cy="100" r="1.4" fill="#fff"/><circle cx="138.5" cy="100" r="1.4" fill="#fff"/>`,
 happy:()=>`<path d="M96,104 Q104,94 112,104 M128,104 Q136,94 144,104" stroke="${AV_INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
 big:()=>`<circle cx="104" cy="101" r="10" fill="#fff" stroke="${AV_INK}" stroke-width="2.5"/><circle cx="136" cy="101" r="10" fill="#fff" stroke="${AV_INK}" stroke-width="2.5"/><circle cx="105" cy="102" r="6" fill="#3a6fd8"/><circle cx="137" cy="102" r="6" fill="#3a6fd8"/><circle cx="105" cy="102" r="3" fill="${AV_INK}"/><circle cx="137" cy="102" r="3" fill="${AV_INK}"/><circle cx="107" cy="99" r="2" fill="#fff"/><circle cx="139" cy="99" r="2" fill="#fff"/>`,
 cool:()=>`<ellipse cx="104" cy="102" rx="8" ry="7" fill="#fff" stroke="${AV_INK}" stroke-width="2.5"/><ellipse cx="136" cy="102" rx="8" ry="7" fill="#fff" stroke="${AV_INK}" stroke-width="2.5"/><circle cx="106" cy="104" r="3.6" fill="${AV_INK}"/><circle cx="138" cy="104" r="3.6" fill="${AV_INK}"/><path d="M95,99 L113,99 M127,99 L145,99" stroke="${AV_INK}" stroke-width="4"/>`
};
const MOUTHS={
 grin:()=>`<path d="M104,118 Q120,138 136,118 Z" fill="#7a1f2b" stroke="${AV_INK}" stroke-width="3" stroke-linejoin="round"/><path d="M107,119 L133,119 L131,124 L109,124 Z" fill="#fff"/>`,
 smile:()=>`<path d="M106,120 Q120,131 134,120" stroke="${AV_INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
 cheeky:()=>`<path d="M106,119 Q120,131 134,119" stroke="${AV_INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M122,126 Q127,136 133,127 Z" fill="#ff7a8a" stroke="${AV_INK}" stroke-width="2"/>`,
 determined:()=>`<path d="M108,123 Q120,119 132,123" stroke="${AV_INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
};
const HATS={
 headband:st=>`<rect x="76" y="74" width="88" height="11" rx="5" fill="#e51c35" ${st}/><path d="M86,79 L154,79" stroke="#fff" stroke-width="2"/>`,
 beanie:st=>`<path d="M74,88 C74,44 166,44 166,88 Z" fill="#17a398" ${st}/><rect x="71" y="80" width="98" height="16" rx="7" fill="#0f7d74" ${st}/><circle cx="120" cy="42" r="11" fill="#fff" ${st}/>`,
 cap:st=>`<path d="M76,86 C76,48 164,48 164,86 Z" fill="#1d2b5c" ${st}/><path d="M74,86 Q120,98 166,86 Q172,94 120,100 Q68,94 74,86Z" fill="#1d2b5c" ${st}/><circle cx="120" cy="52" r="4" fill="#e51c35"/><text x="120" y="78" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="system-ui,Arial">A</text>`,
 wizard:st=>`<path d="M80,84 L132,6 L160,84 Z" fill="#5b3cc4" ${st}/><ellipse cx="120" cy="84" rx="54" ry="9" fill="#4a2fa8" ${st}/><text x="118" y="54" text-anchor="middle" font-size="16" fill="#ffe45e" font-family="system-ui,Arial">½</text><text x="132" y="30" font-size="11" fill="#ffe45e">✦</text><text x="100" y="74" font-size="10" fill="#ffe45e">✦</text>`,
 crown:st=>`<path d="M82,74 L82,40 L98,56 L110,30 L120,52 L130,30 L142,56 L158,40 L158,74 Z" fill="#f5c542" ${st}/><circle cx="101" cy="64" r="4" fill="#e51c35"/><circle cx="120" cy="64" r="4.5" fill="#2457d6"/><circle cx="139" cy="64" r="4" fill="#1f9d55"/>`,
 helmet:st=>`<circle cx="120" cy="100" r="62" fill="rgba(200,230,255,.28)" stroke="#d7deec" stroke-width="7"/><circle cx="120" cy="100" r="62" fill="none" ${st}/><path d="M80,72 Q92,52 116,46" stroke="#fff" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/><rect x="92" y="152" width="56" height="12" rx="6" fill="#d7deec" ${st}/>`,
 viking:st=>`<path d="M78,92 C78,50 162,50 162,92 Z" fill="#9aa3b2" ${st}/><rect x="76" y="84" width="88" height="12" rx="4" fill="#7c8597" ${st}/><path d="M80,80 Q58,72 60,44 Q72,62 86,66 Z M160,80 Q182,72 180,44 Q168,62 154,66 Z" fill="#fff6dc" ${st}/><path d="M120,54 L120,84" stroke="${AV_INK}" stroke-width="2.5"/>`
};
const HANDS={
 ball:st=>`<g transform="translate(184,248)"><circle r="14" fill="#fff" ${st}/><path d="M0,-6 L5.7,-1.9 L3.5,4.9 L-3.5,4.9 L-5.7,-1.9 Z" fill="${AV_INK}"/><path d="M0,-6 L0,-13 M5.7,-1.9 L12,-4 M3.5,4.9 L7,11 M-3.5,4.9 L-7,11 M-5.7,-1.9 L-12,-4" stroke="${AV_INK}" stroke-width="1.6"/></g>`,
 goldball:st=>`<g transform="translate(184,248)"><circle r="14" fill="#f5c542" ${st}/><path d="M0,-6 L5.7,-1.9 L3.5,4.9 L-3.5,4.9 L-5.7,-1.9 Z" fill="#c8901a"/><path d="M-8,-8 Q-4,-12 2,-12" stroke="#fff6b0" stroke-width="2.5" fill="none"/></g>`,
 comic:st=>`<g transform="translate(176,226) rotate(12)"><rect x="-4" y="-2" width="26" height="32" rx="2" fill="#ffe45e" ${st}/><text x="9" y="15" text-anchor="middle" font-size="9" font-weight="900" fill="#e51c35" font-family="system-ui,Arial">POW</text></g>`,
 trophy:st=>`<g transform="translate(180,206)"><path d="M-12,0 L12,0 L9,18 Q0,26 -9,18 Z" fill="#f5c542" ${st}/><path d="M-12,3 Q-22,4 -18,13 Q-15,17 -9,15 M12,3 Q22,4 18,13 Q15,17 9,15" fill="none" ${st}/><rect x="-3" y="22" width="6" height="8" fill="#f5c542"/><rect x="-10" y="29" width="20" height="6" rx="2" fill="#7a4b12" ${st}/></g>`,
 magnifier:st=>`<g transform="translate(184,226)"><circle r="12" fill="rgba(160,215,255,.55)" stroke="${AV_INK}" stroke-width="4"/><path d="M-6,8 L-14,20" stroke="#7a4b12" stroke-width="6" stroke-linecap="round"/></g>`,
 ruler:st=>`<g transform="translate(170,236) rotate(-55)"><rect x="-4" y="-6" width="64" height="12" rx="2" fill="#ffe45e" ${st}/>${[8,16,24,32,40,48].map(x=>`<path d="M${x},-6 L${x},${x%16?-1:2}" stroke="${AV_INK}" stroke-width="1.5"/>`).join('')}</g>`
};
const PETS={
 hamster:st=>`<g transform="translate(40,262)"><ellipse rx="22" ry="17" fill="#e7b37a" ${st}/><circle cx="-12" cy="-14" r="6" fill="#e7b37a" ${st}/><circle cx="12" cy="-14" r="6" fill="#e7b37a" ${st}/><ellipse cy="5" rx="12" ry="9" fill="#fff4e0"/><circle cx="-7" cy="-4" r="2.6" fill="${AV_INK}"/><circle cx="7" cy="-4" r="2.6" fill="${AV_INK}"/><circle cy="1" r="2" fill="#ff7a8a"/></g>`,
 dog:st=>`<g transform="translate(40,258)"><ellipse cy="10" rx="22" ry="16" fill="#fff" ${st}/><circle cy="-8" r="16" fill="#fff" ${st}/><path d="M-14,-18 Q-26,-6 -16,4 Z M14,-18 Q26,-6 16,4 Z" fill="#3a2a1c" ${st}/><circle cx="8" cy="12" r="5" fill="#3a2a1c"/><circle cx="-10" cy="16" r="3.5" fill="#3a2a1c"/><circle cx="-6" cy="-10" r="2.6" fill="${AV_INK}"/><circle cx="6" cy="-10" r="2.6" fill="${AV_INK}"/><ellipse cy="-3" rx="4" ry="3" fill="${AV_INK}"/><path d="M-4,2 Q0,6 4,2" stroke="${AV_INK}" stroke-width="2" fill="none"/></g>`,
 owl:st=>`<g transform="translate(40,256)"><ellipse rx="20" ry="25" fill="#9b6b3c" ${st}/><ellipse cy="8" rx="12" ry="14" fill="#e8c99c"/><circle cx="-8" cy="-8" r="8" fill="#fff" ${st}/><circle cx="8" cy="-8" r="8" fill="#fff" ${st}/><circle cx="-8" cy="-8" r="3.5" fill="${AV_INK}"/><circle cx="8" cy="-8" r="3.5" fill="${AV_INK}"/><path d="M-3,0 L0,5 L3,0 Z" fill="#f5a524"/><path d="M-20,-28 L20,-28 L12,-22 L-12,-22 Z" fill="#1e2333" ${st}/><path d="M-12,-24 L-12,-30 L12,-30 L12,-24" fill="#1e2333"/><path d="M14,-28 L18,-16" stroke="#f5c542" stroke-width="2.5"/></g>`,
 robot:st=>`<g transform="translate(40,258)"><rect x="-18" y="-4" width="36" height="28" rx="6" fill="#b8c2d6" ${st}/><rect x="-16" y="-30" width="32" height="24" rx="6" fill="#d6deeb" ${st}/><path d="M0,-30 L0,-38" stroke="${AV_INK}" stroke-width="3"/><circle cy="-40" r="4" fill="#e51c35" ${st}/><circle cx="-7" cy="-19" r="4.5" fill="#64d9f5" ${st}/><circle cx="7" cy="-19" r="4.5" fill="#64d9f5" ${st}/><rect x="-8" y="6" width="16" height="10" rx="2" fill="#1e2333"/><text y="14" text-anchor="middle" font-size="8" fill="#9dff2e" font-family="monospace">=7</text></g>`,
 dragon:st=>`<g transform="translate(40,256)"><path d="M-6,-6 Q-30,-26 -26,4 Z M6,-6 Q30,-26 26,4 Z" fill="#9dff2e" ${st}/><ellipse cy="12" rx="18" ry="16" fill="#3cc46a" ${st}/><circle cy="-12" r="14" fill="#3cc46a" ${st}/><path d="M-9,-24 L-6,-34 L-2,-25 M9,-24 L6,-34 L2,-25" fill="#ffe45e" ${st}/><circle cx="-5" cy="-14" r="2.6" fill="${AV_INK}"/><circle cx="5" cy="-14" r="2.6" fill="${AV_INK}"/><ellipse cy="16" rx="9" ry="9" fill="#c8f5a8"/><path d="M8,-6 Q20,-10 26,-4" stroke="#ff8a1c" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,
 fox:st=>`<g transform="translate(40,258)"><ellipse cy="12" rx="18" ry="16" fill="#f2832f" ${st}/><path d="M-16,-12 L-12,-32 L-2,-20 Z M16,-12 L12,-32 L2,-20 Z" fill="#f2832f" ${st}/><path d="M-18,-12 Q0,-30 18,-12 Q14,6 0,8 Q-14,6 -18,-12 Z" fill="#f2832f" ${st}/><path d="M-10,-2 Q0,10 10,-2 Q0,4 -10,-2 Z" fill="#fff"/><circle cx="-6" cy="-10" r="2.6" fill="${AV_INK}"/><circle cx="6" cy="-10" r="2.6" fill="${AV_INK}"/><circle cy="-2" r="2.6" fill="${AV_INK}"/><text y="24" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" font-family="system-ui,Arial">½</text></g>`
};
const sky=(a,b)=>`<rect width="240" height="300" fill="${a}"/>${b||''}`;
const SCENES={
 park:sky('#bfe9ff',`<circle cx="196" cy="44" r="22" fill="#ffe45e"/><ellipse cx="40" cy="60" rx="30" ry="10" fill="#fff"/><path d="M0,208 Q120,190 240,208 L240,300 L0,300Z" fill="#7ccf6b"/><circle cx="208" cy="160" r="26" fill="#3a9d4b"/><rect x="204" y="176" width="8" height="34" fill="#7a4b12"/><path d="M14,200 L14,170 M34,200 L34,170" stroke="#fff" stroke-width="3"/>`),
 training:sky('#cdeefe',`<rect y="190" width="240" height="110" fill="#45b25a"/>${[0,1,2,3,4,5].map(i=>`<rect x="${i*40}" y="190" width="20" height="110" fill="#3fa653"/>`).join('')}<path d="M0,250 L240,250" stroke="#fff" stroke-width="3"/><rect x="150" y="150" width="76" height="44" fill="none" stroke="#fff" stroke-width="4"/><path d="M150,150 L170,164 L206,164 L226,150 M170,164 L170,194 M206,164 L206,194" fill="none" stroke="#e6edf5" stroke-width="1.5"/><path d="M24,228 L32,212 L40,228 Z M210,236 L218,220 L226,236Z" fill="#ff8a1c"/>`),
 comiccity:sky('#ffe45e',`${Array.from({length:60},(_,i)=>`<circle cx="${(i%10)*24+12}" cy="${Math.floor(i/10)*24+10}" r="3" fill="#f2c218"/>`).join('')}<path d="M0,190 L0,120 L36,120 L36,96 L70,96 L70,140 L100,140 L100,80 L140,80 L140,130 L172,130 L172,100 L210,100 L210,140 L240,140 L240,190 Z" fill="#6b3fc9" stroke="#121625" stroke-width="3"/>${[[46,108],[110,92],[124,108],[182,112],[110,120]].map(([x,y])=>`<rect x="${x}" y="${y}" width="9" height="9" fill="#ffe45e"/>`).join('')}<rect y="190" width="240" height="110" fill="#8a93a6"/><path d="M182,16 L192,34 L212,28 L200,44 L218,56 L196,56 L198,76 L184,62 L170,76 L170,56 L150,54 L166,44 L156,26 L174,32 Z" fill="#e51c35" stroke="#121625" stroke-width="3"/><text x="184" y="52" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="system-ui,Arial">POW!</text>`),
 tunnel:sky('#2a2f45',`<path d="M30,300 L30,110 Q120,20 210,110 L210,300 Z" fill="#11131d"/><ellipse cx="120" cy="150" rx="52" ry="64" fill="#fff8d6"/><ellipse cx="120" cy="150" rx="70" ry="84" fill="#fff8d6" opacity=".25"/><path d="M0,300 L80,190 L160,190 L240,300 Z" fill="#3fa653" opacity=".85"/><rect x="0" y="40" width="24" height="260" fill="#e51c35"/><rect x="216" y="40" width="24" height="260" fill="#e51c35"/><rect x="0" y="40" width="240" height="18" fill="#e51c35"/><text x="120" y="54" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" font-family="system-ui,Arial" letter-spacing="1">THIS IS MATCH DAY</text>`),
 floodlit:sky('#0d1b3d',`${Array.from({length:24},(_,i)=>`<circle cx="${(i*53)%240}" cy="${(i*31)%90}" r="1.3" fill="#fff"/>`).join('')}<path d="M20,40 L0,200 L110,200 Z M220,40 L240,200 L130,200 Z" fill="#fff8b0" opacity=".2"/><rect x="14" y="20" width="14" height="22" fill="#fff8b0" stroke="#121625" stroke-width="2"/><rect x="212" y="20" width="14" height="22" fill="#fff8b0" stroke="#121625" stroke-width="2"/><rect y="120" width="240" height="80" fill="#2b2f45"/>${Array.from({length:40},(_,i)=>`<circle cx="${(i%20)*12+6}" cy="${132+Math.floor(i/20)*22}" r="4" fill="${i%3?'#e51c35':'#fff'}"/>`).join('')}<rect y="200" width="240" height="100" fill="#2f9a4a"/><path d="M0,250 L240,250" stroke="#fff" stroke-width="2" opacity=".6"/>`),
 cupfinal:sky('#2b1460',`${[[50,60,'#ffe45e'],[190,50,'#64d9f5'],[124,30,'#ff7a8a']].map(([x,y,c])=>Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return`<path d="M${x},${y} L${(x+26*Math.cos(a)).toFixed(1)},${(y+26*Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`}).join('')).join('')}${Array.from({length:40},(_,i)=>`<rect x="${(i*47)%240}" y="${(i*29)%200}" width="5" height="9" fill="${['#ffe45e','#e51c35','#64d9f5','#fff'][i%4]}" transform="rotate(${i*23} ${(i*47)%240} ${(i*29)%200})"/>`).join('')}<rect y="210" width="240" height="90" fill="#2f9a4a"/>`),
 space:sky('#05040f',`${Array.from({length:50},(_,i)=>`<circle cx="${(i*67)%240}" cy="${(i*41)%300}" r="${i%5?1:2}" fill="#fff"/>`).join('')}<circle cx="190" cy="60" r="26" fill="#ffb070"/><ellipse cx="190" cy="60" rx="44" ry="10" fill="none" stroke="#ffe45e" stroke-width="4" transform="rotate(-18 190 60)"/><path d="M0,300 Q120,212 240,300 Z" fill="#2f6fe0"/><path d="M40,300 Q80,262 120,270 Q150,276 170,300 Z" fill="#3cc46a"/>`)
};
