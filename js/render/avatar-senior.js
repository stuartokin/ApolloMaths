'use strict';
// PRESENTATION (2.87): the senior character (natural proportions, full figure) and the "Your space" desk scene.
// Uses the child's own skin tone, hair style and colour and head covering from stats.avatar, and what they wear from
// stats.senior (js/data/senior-shop.js). drawSenior(av, sn, {bust:true}) gives head and shoulders for small places.
function drawSenior(av,sn,opt={}){const o=avatarOptions,skin=(o.skins[av.skin]||o.skins[1])[0],hairC=(o.hairColours[av.hairCol]||o.hairColours[1])[0],
 top=SN_BY[sn.top]||SN_BY.sn_hoodie_grey,shoe=SN_BY[sn.shoes]||SN_BY.sn_shoe_basic,bd=SN_BY[sn.backdrop]||SN_BY.sn_bd_city,head=sn.head&&SN_BY[sn.head],eyes=sn.eyes&&SN_BY[sn.eyes],wrist=sn.wrist&&SN_BY[sn.wrist],
 cover=av.cover&&av.cover!=='none'?av.cover:null,covC=(o.coverCols[av.coverCol]||o.coverCols[0])[0],hair=av.hair||'short',girlish=av.body==='girl';
 const id='sn'+Math.random().toString(36).slice(2,7),[c1,c2]=top.col,W=220,H=opt.bust?220:320;let g='';
 // backdrop panel
 g+=`<defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bd.sky[0]}"/><stop offset="1" stop-color="${bd.sky[1]}"/></linearGradient><clipPath id="${id}c"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>`;
 g+=`<g clip-path="url(#${id}c)"><rect width="${W}" height="${H}" fill="url(#${id}b)"/><circle cx="${W*0.78}" cy="${H*0.2}" r="70" fill="${bd.glow}" opacity=".18"/>`;
 for(let i=0;i<9;i++){const bw=18+(i*7)%16,bh=40+((i*37)%70);g+=`<rect x="${i*26-6}" y="${H-bh-(opt.bust?0:40)}" width="${bw}" height="${bh+60}" fill="#ffffff" opacity=".05"/>`;}
 const by=opt.bust?36:20; // body offset
 // legs and trainers (full figure)
 if(!opt.bust){g+=`<path d="M86 ${by+190} L82 ${by+272} L104 ${by+272} L109 ${by+200} L113 ${by+272} L136 ${by+272} L132 ${by+190} Z" fill="#2c3550"/>`;
  g+=`<path d="M76 ${by+270} h32 q6 0 6 8 v6 h-42 q-2-14 4-14z" fill="${shoe.col[0]}" stroke="#0003"/><path d="M110 ${by+270} h32 q6 0 6 8 v6 h-42 q-2-14 4-14z" fill="${shoe.col[0]}" stroke="#0003"/>`;
  g+=`<rect x="72" y="${by+280}" width="42" height="5" rx="2" fill="${shoe.col[1]}"/><rect x="106" y="${by+280}" width="42" height="5" rx="2" fill="${shoe.col[1]}"/>`;}
 // arms
 const armY=by+118;g+=`<path d="M64 ${armY} q-14 40 -8 ${opt.bust?60:84}" stroke="${c1}" stroke-width="20" stroke-linecap="round" fill="none"/><path d="M156 ${armY} q14 40 8 ${opt.bust?60:84}" stroke="${c1}" stroke-width="20" stroke-linecap="round" fill="none"/>`;
 if(!opt.bust){g+=`<circle cx="56" cy="${armY+88}" r="9" fill="${skin}"/><circle cx="164" cy="${armY+88}" r="9" fill="${skin}"/>`;if(wrist)g+=`<rect x="155" y="${armY+72}" width="18" height="9" rx="3" fill="${wrist.col[0]}"/><rect x="160" y="${armY+73}" width="8" height="7" rx="2" fill="${wrist.col[1]}"/>`;}
 // torso by style
 const st=top.style,tb=opt.bust?H+10:by+200;
 g+=`<path d="M62 ${by+122} C64 ${by+100} 84 ${by+94} 110 ${by+94} C136 ${by+94} 156 ${by+100} 158 ${by+122} L154 ${tb} L66 ${tb} Z" fill="${c1}"/>`;
 if(st==='hoodie')g+=`<path d="M86 ${by+98} C92 ${by+122} 128 ${by+122} 134 ${by+98}" fill="none" stroke="#0003" stroke-width="6"/><line x1="102" y1="${by+112}" x2="100" y2="${by+140}" stroke="${c2}" stroke-width="3" stroke-linecap="round"/><line x1="118" y1="${by+112}" x2="120" y2="${by+140}" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>${c2!==c1?`<path d="M66 ${by+160} L154 ${by+160} L154 ${Math.min(tb,by+178)} L66 ${Math.min(tb,by+178)} Z" fill="${c2}" opacity=".9"/>`:''}`;
 if(st==='tee')g+=`<path d="M92 ${by+97} Q110 ${by+110} 128 ${by+97}" fill="none" stroke="${c2}" stroke-width="4"/>`;
 if(st==='jacket'||st==='track')g+=`<line x1="110" y1="${by+104}" x2="110" y2="${tb}" stroke="${c2}" stroke-width="${st==='track'?4:3}"/><path d="M92 ${by+96} L110 ${by+124} L128 ${by+96}" fill="${st==='track'?c1:'#f3f3f0'}" stroke="${c2}" stroke-width="2"/>${st==='track'?`<line x1="66" y1="${by+130}" x2="62" y2="${by+190}" stroke="${c2}" stroke-width="4"/><line x1="154" y1="${by+130}" x2="158" y2="${by+190}" stroke="${c2}" stroke-width="4"/>`:''}`;
 if(st==='puffer')for(let k=0;k<4;k++)g+=`<line x1="64" y1="${by+120+k*22}" x2="156" y2="${by+120+k*22}" stroke="${c2}" stroke-width="3"/>`;
 if(st==='shirt')g+=`<path d="M96 ${by+96} L110 ${by+112} L124 ${by+96}" fill="#fff" stroke="${c2}" stroke-width="2"/><line x1="110" y1="${by+112}" x2="110" y2="${tb}" stroke="${c2}" stroke-width="2"/>${[0,1,2].map(k=>`<circle cx="110" cy="${by+128+k*20}" r="2" fill="${c2}"/>`).join('')}`;
 // neck and head
 g+=`<rect x="99" y="${by+74}" width="22" height="26" rx="8" fill="${skin}"/>`;
 const hx=110,hy=by+46,hr=32;
 // long hair behind the head
 if(!cover&&['long','ponytail','braids','locs','bob'].includes(hair))g+=`<path d="M${hx-34} ${hy-6} C${hx-40} ${hy+40} ${hx-34} ${hy+64} ${hx-20} ${hy+70} L${hx+20} ${hy+70} C${hx+34} ${hy+64} ${hx+40} ${hy+40} ${hx+34} ${hy-6} Z" fill="${hairC}"/>`;
 if(cover==='hijab'||cover==='headwrap')g+=`<path d="M${hx-40} ${hy+2} C${hx-42} ${hy-46} ${hx+42} ${hy-46} ${hx+40} ${hy+2} C${hx+44} ${hy+50} ${hx+30} ${hy+78} ${hx} ${hy+80} C${hx-30} ${hy+78} ${hx-44} ${hy+50} ${hx-40} ${hy+2} Z" fill="${covC}"/>`;
 g+=`<ellipse cx="${hx}" cy="${hy+4}" rx="${hr-4}" ry="${hr+2}" fill="${skin}"/>`;
 // face
 g+=`<ellipse cx="${hx-11}" cy="${hy+6}" rx="3.4" ry="4.2" fill="#1d2432"/><ellipse cx="${hx+11}" cy="${hy+6}" rx="3.4" ry="4.2" fill="#1d2432"/>`;
 g+=`<path d="M${hx-17} ${hy-4} q6 -3 11 0" stroke="${hairC}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${hx+6} ${hy-4} q6 -3 11 0" stroke="${hairC}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
 g+=`<path d="M${hx-1} ${hy+9} q-2 8 3 9" stroke="#0002" stroke-width="2" fill="none"/><path d="M${hx-8} ${hy+23} q8 6 16 0" stroke="#8a3f33" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
 // hair on top
 if(!cover){const top=`M${hx-30} ${hy-2} C${hx-32} ${hy-40} ${hx+32} ${hy-40} ${hx+30} ${hy-2}`;
  if(['short','spiky','quiff','buzz'].includes(hair))g+=`<path d="${top} C${hx+26} ${hy-16} ${hx+10} ${hy-20} ${hx-4} ${hy-18} C${hx-16} ${hy-18} ${hx-26} ${hy-14} ${hx-30} ${hy-2} Z" fill="${hairC}"/>${hair==='quiff'?`<path d="M${hx-12} ${hy-30} q14 -18 30 -4" fill="${hairC}"/>`:''}`;
  else if(['curly','afro','puffs'].includes(hair)){const R=hair==='afro'?44:36;for(let a=0;a<12;a++){const t=Math.PI+a*Math.PI/11;g+=`<circle cx="${hx+(R-10)*Math.cos(t)}" cy="${hy-6+(R-12)*Math.sin(t)}" r="${hair==='afro'?14:11}" fill="${hairC}"/>`;}}
  else g+=`<path d="${top} C${hx+20} ${hy-22} ${hx-20} ${hy-22} ${hx-30} ${hy-2} Z" fill="${hairC}"/>${hair==='bun'?`<circle cx="${hx}" cy="${hy-38}" r="12" fill="${hairC}"/>`:''}`;}
 else if(cover==='patka'||cover==='dastar'){const up=hy-(cover==='dastar'?52:40);g+=`<path d="M${hx-32} ${hy-4} C${hx-34} ${up} ${hx+34} ${up} ${hx+32} ${hy-4} Z" fill="${covC}"/>`;}
 else if(cover==='kippah')g+=`<path d="M${hx-14} ${hy-28} q14 -10 28 0 z" fill="${covC}"/><path d="M${hx-30} ${hy-2} C${hx-32} ${hy-36} ${hx+32} ${hy-36} ${hx+30} ${hy-2} C${hx+20} ${hy-18} ${hx-20} ${hy-18} ${hx-30} ${hy-2}Z" fill="${hairC}"/>`;
 // glasses
 if(eyes){const c=eyes.col[0];g+=eyes.style==='round'?`<circle cx="${hx-11}" cy="${hy+6}" r="9" fill="none" stroke="${c}" stroke-width="2.6"/><circle cx="${hx+11}" cy="${hy+6}" r="9" fill="none" stroke="${c}" stroke-width="2.6"/>`:`<rect x="${hx-22}" y="${hy-1}" width="19" height="14" rx="3" fill="none" stroke="${c}" stroke-width="2.6"/><rect x="${hx+3}" y="${hy-1}" width="19" height="14" rx="3" fill="none" stroke="${c}" stroke-width="2.6"/>`;g+=`<line x1="${hx-2}" y1="${hy+5}" x2="${hx+2}" y2="${hy+5}" stroke="${c}" stroke-width="2.6"/>`;}
 // headwear (not over a religious covering)
 if(head&&!(cover&&head.id!=='sn_phones')){const[a,b]=head.col;
  if(head.id==='sn_phones')g+=`<path d="M${hx-34} ${hy+4} C${hx-36} ${hy-46} ${hx+36} ${hy-46} ${hx+34} ${hy+4}" fill="none" stroke="${a}" stroke-width="7"/><rect x="${hx-44}" y="${hy-6}" width="14" height="26" rx="6" fill="${b}"/><rect x="${hx+30}" y="${hy-6}" width="14" height="26" rx="6" fill="${b}"/>`;
  if(head.id==='sn_cap')g+=`<path d="M${hx-32} ${hy-8} C${hx-32} ${hy-44} ${hx+32} ${hy-44} ${hx+32} ${hy-8} Z" fill="${a}"/><path d="M${hx-2} ${hy-10} h44 q6 0 0 6 h-44 z" fill="${a}"/><circle cx="${hx}" cy="${hy-36}" r="3" fill="${b}"/>`;
  if(head.id==='sn_beanie')g+=`<path d="M${hx-33} ${hy-6} C${hx-33} ${hy-50} ${hx+33} ${hy-50} ${hx+33} ${hy-6} Z" fill="${a}"/><rect x="${hx-35}" y="${hy-14}" width="70" height="12" rx="5" fill="${b}" opacity=".9"/>`;}
 g+='</g>';
 const fr=SN_BY[sn.frame],frame=fr&&fr.frame==='gold'?`<rect x="2" y="2" width="${W-4}" height="${H-4}" rx="21" fill="none" stroke="#e9c46a" stroke-width="5"/>`:fr&&fr.frame==='neon'?`<rect x="3" y="3" width="${W-6}" height="${H-6}" rx="20" fill="none" stroke="var(--sn-acc,#ffb547)" stroke-width="4"/>`:'';
 return `<svg class="sn-av" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="My character">${g}${frame}</svg>`;}
// "Your space": a desk with what the child has chosen for each spot, in front of their backdrop
function drawDesk(sn,opt={}){const bd=SN_BY[sn.backdrop]||SN_BY.sn_bd_city,d=sn.desk||{},W=420,H=240,on=k=>d[k]&&SN_BY[d[k]];let g='';
 g+=`<defs><linearGradient id="dkb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bd.sky[0]}"/><stop offset="1" stop-color="${bd.sky[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" rx="18" fill="url(#dkb)"/>`;
 g+=`<rect x="250" y="22" width="140" height="92" rx="6" fill="#00000033" stroke="#ffffff22"/><circle cx="345" cy="48" r="14" fill="${bd.glow}" opacity=".5"/>`;
 for(let i=0;i<6;i++)g+=`<rect x="${256+i*22}" y="${70+(i*13)%30}" width="16" height="${44-(i*13)%30}" fill="#ffffff14"/>`;
 g+=`<rect x="0" y="176" width="${W}" height="64" fill="#00000030"/>`;
 const w=on('wall');if(w)g+=`<rect x="40" y="26" width="120" height="78" rx="6" fill="#ffffff12" stroke="#ffffff30"/><text x="100" y="72" font-size="34" text-anchor="middle">${w.icon}</text>`;
 g+=`<rect x="30" y="150" width="360" height="12" rx="4" fill="#8a5a3c"/><rect x="48" y="162" width="9" height="62" fill="#6e4730"/><rect x="363" y="162" width="9" height="62" fill="#6e4730"/>`;
 const m=on('d_mid');if(m&&m.id==='sn_monitors')g+=`<rect x="140" y="82" width="70" height="52" rx="4" fill="#1b1f3b" stroke="#8f7bff" stroke-width="2.5"/><rect x="214" y="82" width="70" height="52" rx="4" fill="#1b1f3b" stroke="#8f7bff" stroke-width="2.5"/><rect x="204" y="134" width="16" height="16" fill="#444"/><text x="175" y="114" font-size="11" fill="#ffb547" text-anchor="middle" font-family="serif">y = mx + c</text><text x="249" y="114" font-size="11" fill="#7cc4ff" text-anchor="middle" font-family="serif">a² + b² = c²</text>`;
 else if(m)g+=`<path d="M170 148 L178 108 L246 108 L254 148 Z" fill="#2a2d3d"/><rect x="180" y="110" width="64" height="34" fill="#1b1f3b"/><text x="212" y="132" font-size="11" fill="#ffb547" text-anchor="middle" font-family="serif">3x² − 5x</text><rect x="160" y="146" width="104" height="5" rx="2" fill="#3a3d4f"/>`;
 const l=on('d_left');if(l&&l.id==='sn_lamp')g+=`<path d="M70 150 L80 98 L104 92" stroke="#2a2a3a" stroke-width="5" fill="none"/><path d="M96 84 l26 10 -8 12 -26 -10z" fill="#ffb547"/><circle cx="112" cy="104" r="34" fill="#ffb547" opacity=".12"/>`;else if(l)g+=`<text x="90" y="146" font-size="40" text-anchor="middle">${l.icon}</text>`;
 const r=on('d_right');if(r)g+=`<text x="320" y="147" font-size="40" text-anchor="middle">${r.icon}</text>`;
 const f=on('floor');if(f)g+=`<text x="390" y="232" font-size="44" text-anchor="end">${f.icon}</text>`;
 return `<svg class="sn-desk" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="My space">${g}</svg>`;}
