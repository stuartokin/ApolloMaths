'use strict';
// PRESENTATION (2.85): pictures for younger children — clock faces, coins, number lines, arrays, fraction bars,
// tens-and-ones blocks and counters. Added to FIGURES (render.js), so a question uses them with F('clock',3,30) etc.
(function(){
 const circ=(cx,cy,r,fill,o={})=>`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" stroke="${o.c||INK}" stroke-width="${o.w===undefined?2:o.w}"/>`;
 const rect=(x,y,w,h,fill,o={})=>`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${o.rx||0}" fill="${fill}" stroke="${o.c||INK}" stroke-width="${o.w===undefined?2:o.w}"/>`;
 // analogue clock showing h:m (12-hour)
 function clockSVG(h,m){const cx=110,cy=110,r=92;let g=circ(cx,cy,r,'#fff',{w:4});
  for(let i=0;i<60;i++){const a=i*Math.PI/30,big=i%5===0,r1=big?r-12:r-6;g+=line(cx+r1*Math.sin(a),cy-r1*Math.cos(a),cx+(r-2)*Math.sin(a),cy-(r-2)*Math.cos(a),{w:big?3:1});}
  for(let n=1;n<=12;n++){const a=n*Math.PI/6;g+=txt(cx+(r-26)*Math.sin(a),cy-(r-26)*Math.cos(a),n,{size:18});}
  const ha=((h%12)+m/60)*Math.PI/6,ma=m*Math.PI/30;
  g+=line(cx,cy,cx+48*Math.sin(ha),cy-48*Math.cos(ha),{w:7,c:'#e51c35'})+line(cx,cy,cx+62*Math.sin(ma),cy-62*Math.cos(ma),{w:4})+circ(cx,cy,6,INK);
  return svgWrap(220,220,g,'Clock face');}
 // coins and notes: values in pence
 const COIN={1:['#c77d3a',20],2:['#c77d3a',24],5:['#d9dde3',19],10:['#d9dde3',25],20:['#d9dde3',23],50:['#d9dde3',28],100:['#e8c547',25],200:['#e8c547',29]};
 function coinsSVG(vals){let x=10,g='',H=80;for(const v of vals){if(v>=500){g+=rect(x,12,96,56,v===500?'#8fd3c9':'#f3a48b',{rx:6})+txt(x+48,40,'£'+v/100,{size:20});x+=106;continue;}
   const [fill,r]=COIN[v]||['#ddd',22];const poly7=v===20||v===50;const cx=x+r,cy=H/2;
   g+=poly7?poly([...Array(7).keys()].map(i=>[cx+r*Math.sin(i*2*Math.PI/7),cy-r*Math.cos(i*2*Math.PI/7)]),fill):circ(cx,cy,r,fill);
   g+=txt(cx,cy+1,v>=100?'£'+v/100:v+'p',{size:v>=100?14:13});x+=2*r+10;}
  return svgWrap(Math.max(x,60),H,g,'Coins');}
 // number line from a to b in steps of s; marks = {value:label}; ask = value shown as '?'
 function numlineSVG(a,b,s,ask,labelEvery){const n=Math.round((b-a)/s),w=Math.max(320,n*42),x0=24,x1=w-24,y=46,every=labelEvery||1;let g=line(x0-10,y,x1+10,y,{w:3});
  for(let i=0;i<=n;i++){const v=+(a+i*s).toFixed(4),x=x0+(x1-x0)*i/n,lab=i%every===0||v===ask;g+=line(x,y-(lab?10:6),x,y+(lab?10:6),{w:2});
   if(v===ask)g+=rect(x-17,y+14,34,24,'#ffe45e',{rx:5})+txt(x,y+27,'?',{size:16});else if(lab)g+=txt(x,y+26,String(v).replace('-','−'),{size:14});}
  return svgWrap(w,84,g,'Number line');}
 // r rows of c dots (multiplication arrays)
 function arraySVG(r,c,emoji){const d=34,w=c*d+20,h=r*d+20;let g='';for(let i=0;i<r;i++)for(let j=0;j<c;j++)g+=emoji?txt(10+j*d+d/2,10+i*d+d/2,emoji,{size:24}):circ(10+j*d+d/2,10+i*d+d/2,12,'#64d9f5');return svgWrap(w,h,g,`Array of ${r} rows of ${c}`);}
 // a bar split into n equal parts with k shaded
 function fracbarSVG(n,k){const W=320,h=50,x0=10,y0=10;let g='';for(let i=0;i<n;i++)g+=rect(x0+i*W/n,y0,W/n,h,i<k?'#3dcf9b':'#fff',{w:2.5});return svgWrap(W+20,h+20,g,`Bar in ${n} equal parts, ${k} shaded`);}
 // shape cut into n equal parts with k shaded: circle (pizza) or rectangle grid
 function fracshapeSVG(kind,n,k){let g='';if(kind==='circle'){const cx=80,cy=80,r=66;for(let i=0;i<n;i++){const a1=i*2*Math.PI/n,a2=(i+1)*2*Math.PI/n,p=[[cx,cy]];for(let t=0;t<=12;t++){const a=a1+(a2-a1)*t/12;p.push([cx+r*Math.sin(a),cy-r*Math.cos(a)]);}g+=poly(p,i<k?'#3dcf9b':'#fff',2.5);}return svgWrap(160,160,g,`Circle in ${n} equal parts, ${k} shaded`);}
  const cols=n%2===0&&n>4?n/2:n,rows=n/cols,cw=50,ch=50;for(let i=0;i<n;i++)g+=rect(10+(i%cols)*cw,10+Math.floor(i/cols)*ch,cw,ch,i<k?'#3dcf9b':'#fff',{w:2.5});return svgWrap(cols*cw+20,rows*ch+20,g,`Shape in ${n} equal parts, ${k} shaded`);}
 // base-ten blocks: t tens (sticks) and o ones (cubes)
 function tensSVG(t,o){const u=12;let g='',x=10;for(let i=0;i<t;i++){for(let j=0;j<10;j++)g+=rect(x,10+j*u,u,u,'#ffb347',{w:1.2});x+=u+8;}x+=10;for(let i=0;i<o;i++)g+=rect(x+(i%5)*(u+4),10+9*u-Math.floor(i/5)*(u+4),u,u,'#64d9f5',{w:1.2});
  return svgWrap(x+5*(u+4)+10,10*u+20,g,`${t} tens and ${o} ones`);}
 // n counters (emoji), in rows of 5 like a ten frame
 function countersSVG(n,emoji){const per=5,d=40,rows=Math.ceil(n/per);let g='';for(let i=0;i<n;i++)g+=txt(10+(i%per)*d+d/2,10+Math.floor(i/per)*d+d/2,emoji||'🔴',{size:28});return svgWrap(per*d+20,rows*d+20,g,`${n} counters`);}
 Object.assign(FIGURES,{clock:clockSVG,coins:coinsSVG,numline:numlineSVG,array:arraySVG,fracbar:fracbarSVG,fracshape:fracshapeSVG,tens:tensSVG,counters:countersSVG});
})();
