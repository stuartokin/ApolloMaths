'use strict';
// PRESENTATION: turns data (figure specs, lesson blocks) into SVG/HTML. Nothing here decides maths answers.
const INK='#121625';
const f1=v=>+(+v).toFixed(1);
const svgWrap=(w,h,inner,label)=>`<svg class="qfig" viewBox="0 0 ${Math.ceil(w)} ${Math.ceil(h)}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Arial,sans-serif" font-weight="800">${inner}</svg>`;
const txt=(x,y,s,o={})=>`<text x="${f1(x)}" y="${f1(y)}" font-size="${o.size||15}" text-anchor="${o.anchor||'middle'}" dominant-baseline="middle" fill="${o.fill||INK}"${o.extra||''}>${s}</text>`;
const poly=(pts,fill,sw=2)=>`<polygon points="${pts.map(p=>f1(p[0])+','+f1(p[1])).join(' ')}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const line=(x1,y1,x2,y2,o={})=>`<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${o.c||INK}" stroke-width="${o.w||2}"${o.dash?` stroke-dasharray="${o.dash}"`:''}/>`;
const notToScale=(w,h)=>txt(w-6,h-8,'NOT TO SCALE',{size:10,anchor:'end',fill:'#687081'});
const inPoly=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c};

function cuboidSVG(L,W,H,lab){
 const s=Math.min(190/(L+W*0.55),130/(H+W*0.4)),fw=L*s,fh=H*s,dx=W*s*0.55,dy=W*s*0.4,x0=62,y0=18+dy;
 const w=x0+fw+dx+80,h=y0+fh+42;
 const front=[[x0,y0],[x0+fw,y0],[x0+fw,y0+fh],[x0,y0+fh]],top=[[x0,y0],[x0+dx,y0-dy],[x0+fw+dx,y0-dy],[x0+fw,y0]],side=[[x0+fw,y0],[x0+fw+dx,y0-dy],[x0+fw+dx,y0+fh-dy],[x0+fw,y0+fh]];
 let g=poly(front,'#ffd3d9',2.5)+poly(top,'#ffe45e',2.5)+poly(side,'#ff9aa8',2.5);
 g+=line(x0,y0+fh,x0+dx,y0+fh-dy,{w:1.3,dash:'5 4'})+line(x0+dx,y0+fh-dy,x0+fw+dx,y0+fh-dy,{w:1.3,dash:'5 4'})+line(x0+dx,y0+fh-dy,x0+dx,y0-dy,{w:1.3,dash:'5 4'});
 g+=txt(x0+fw/2,y0+fh+20,lab.l)+txt(x0-10,y0+fh/2,lab.h,{anchor:'end'})+txt(x0+fw+dx/2+10,y0+fh-dy/2+8,lab.w,{anchor:'start'});
 return svgWrap(w,h,g,'Cuboid diagram');}

function cubesSVG(L,W,H){
 const u=Math.min(34,230/(L+W*0.55),150/(H+W*0.4)),dx=u*0.55,dy=u*0.4,x0=20,y0=16+W*dy,w=x0+L*u+W*dx+20,h=y0+H*u+20;let g='';
 for(let y=W-1;y>=0;y--)for(let z=0;z<H;z++)for(let x=0;x<L;x++){const bx=x0+x*u+y*dx,by=y0+(H-1-z)*u-y*dy;
  g+=poly([[bx,by],[bx+u,by],[bx+u,by+u],[bx,by+u]],'#64d9f5',1.5)+poly([[bx,by],[bx+dx,by-dy],[bx+u+dx,by-dy],[bx+u,by]],'#c7f3fc',1.5)+poly([[bx+u,by],[bx+u+dx,by-dy],[bx+u+dx,by+u-dy],[bx+u,by+u]],'#2fb3d4',1.5);}
 return svgWrap(w,h,g,'Solid cuboid made of cubes');}

// Rectilinear shape with labelled edges (edge i joins point i to point i+1). Labels sit OUTSIDE the shape.
function shapeSVG(pts,labels,opt={}){
 const mw=Math.max(...pts.map(p=>p[0])),mh=Math.max(...pts.map(p=>p[1])),s=Math.min(250/mw,170/mh),ox=70,oy=32;
 const P=pts.map(([x,y])=>[ox+x*s,oy+y*s]);let g=poly(P,opt.fill||'#ffe9a8',2.5);
 P.forEach((p,i)=>{const q=P[(i+1)%P.length],l=labels[i];if(!l)return;const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;
  if(Math.abs(p[1]-q[1])<0.5){const above=!inPoly(mx,my-4,P);g+=txt(mx,my+(above?-13:15),l,{size:14})}
  else{const left=!inPoly(mx-4,my,P);g+=txt(mx+(left?-8:8),my,l,{size:14,anchor:left?'end':'start'})}});
 const w=ox+mw*s+80,h=oy+mh*s+34;return svgWrap(w,h,g+notToScale(w,h),'Shape diagram');}

function frameSVG(a,b,t){const s=Math.min(250/a,160/b),x0=40,y0=24,W=a*s,H=b*s,T=t*s;
 let g=`<rect x="${x0}" y="${y0}" width="${f1(W)}" height="${f1(H)}" fill="#ff9aa8" stroke="${INK}" stroke-width="2.5"/><rect x="${f1(x0+T)}" y="${f1(y0+T)}" width="${f1(W-2*T)}" height="${f1(H-2*T)}" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
 g+=txt(x0+W/2,y0+H+16,a+' cm',{size:14})+txt(x0+W+8,y0+H/2,b+' cm',{size:14,anchor:'start'})+txt(x0+W/2,y0+T/2+1,t+' cm',{size:11})+txt(x0+W/2,y0+H/2,'photo',{size:13,fill:'#687081'});
 const w=x0+W+70,h=y0+H+34;return svgWrap(w,h,g+notToScale(w,h),'Picture frame diagram');}

function rulerSVG(a,b){const cm=Math.ceil(b/10)+1,s=330/(cm*10),x0=22,w=x0*2+cm*10*s,h=118;
 let g=`<rect x="${x0-8}" y="58" width="${f1(cm*10*s+16)}" height="52" rx="6" fill="#fff7d6" stroke="${INK}" stroke-width="2"/>`;
 for(let m=0;m<=cm*10;m++){const x=x0+m*s,L=m%10===0?20:m%5===0?13:8;g+=line(x,58,x,58+L,{w:m%10?1:1.6});if(m%10===0)g+=txt(x,92,m/10,{size:12});}
 g+=txt(x0+2,104,'cm',{size:9,anchor:'start',fill:'#687081'});
 g+=`<rect x="${f1(x0+a*s)}" y="22" width="${f1((b-a)*s)}" height="22" rx="11" fill="#e51c35" stroke="${INK}" stroke-width="2"/>`+line(x0+a*s,44,x0+a*s,58,{w:1.4,dash:'3 3'})+line(x0+b*s,44,x0+b*s,58,{w:1.4,dash:'3 3'});
 return svgWrap(w,h,g,'Ruler diagram');}

function axes(x0,y0,pw,ph,top,step,yl){let g='';const s=ph/top,every=top/step>10?2:1;
 for(let v=0;v<=top+1e-9;v+=step){const y=y0+ph-v*s;g+=line(x0,y,x0+pw,y,{c:'#d7dbe6',w:1});if(Math.round(v/step)%every===0)g+=txt(x0-6,y,+v.toFixed(2),{size:11,anchor:'end'});}
 g+=line(x0,y0,x0,y0+ph)+line(x0,y0+ph,x0+pw,y0+ph)+txt(13,y0+ph/2,yl,{size:11,extra:` transform="rotate(-90 13 ${f1(y0+ph/2)})"`});return g;}
function barSVG(cats,vals,step,yl,opt={}){const known=vals.filter((v,i)=>i!==opt.missing),top=Math.ceil(Math.max(...known,opt.atLeast||0)/step)*step+step;
 const W=380,H=250,x0=56,y0=16,pw=W-x0-12,ph=H-y0-46,s=ph/top,n=cats.length,bw=pw/n*0.6;let g=axes(x0,y0,pw,ph,top,step,yl);
 cats.forEach((c,i)=>{const cx=x0+pw/n*(i+.5),v=vals[i];
  if(opt.missing===i){g+=txt(cx,y0+ph-16,'?',{size:24,fill:'#e51c35'})}
  else g+=`<rect x="${f1(cx-bw/2)}" y="${f1(y0+ph-v*s)}" width="${f1(bw)}" height="${f1(v*s)}" fill="${i%2?'#ffe45e':'#e51c35'}" stroke="${INK}" stroke-width="2"/>`;
  g+=txt(cx,y0+ph+15,c,{size:11});});
 return svgWrap(W,H,g,'Bar chart');}
function lineSVG(xs,vals,step,yl){const top=Math.ceil(Math.max(...vals)/step)*step+step,W=380,H=250,x0=56,y0=16,pw=W-x0-16,ph=H-y0-46,s=ph/top,n=xs.length;let g=axes(x0,y0,pw,ph,top,step,yl);
 const pts=vals.map((v,i)=>[x0+pw*(i+.5)/n,y0+ph-v*s]);g+=`<polyline points="${pts.map(p=>f1(p[0])+','+f1(p[1])).join(' ')}" fill="none" stroke="#e51c35" stroke-width="3"/>`;
 pts.forEach((p,i)=>{g+=`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="4.5" fill="#fff" stroke="${INK}" stroke-width="2"/>`+txt(p[0],y0+ph+15,xs[i],{size:10})});
 return svgWrap(W,H,g,'Line graph');}
function pictoSVG(cats,vals,k,unit){const rowH=36,x0=104,W=x0+9*30+16,H=cats.length*rowH+56;let g='',defs='';
 cats.forEach((c,i)=>{const y=12+i*rowH;g+=txt(x0-10,y+16,c,{size:13,anchor:'end'});const full=Math.floor(vals[i]/k),half=vals[i]%k!==0;
  for(let j=0;j<full;j++)g+=txt(x0+j*30+14,y+17,'⚽',{size:23});
  if(half){const id='hc'+Math.random().toString(36).slice(2,8);defs+=`<clipPath id="${id}"><rect x="${x0+full*30}" y="${y}" width="14" height="34"/></clipPath>`;g+=`<g clip-path="url(#${id})">${txt(x0+full*30+14,y+17,'⚽',{size:23})}</g>`;}});
 g+=line(10,H-38,W-10,H-38,{c:'#d7dbe6',w:1})+txt(x0-10,H-18,'Key:',{size:12,anchor:'end'})+txt(x0+14,H-17,'⚽',{size:20})+txt(x0+32,H-18,`= ${k} ${unit}`,{size:13,anchor:'start'});
 return svgWrap(W,H,`<defs>${defs}</defs>`+g,'Pictogram');}
function pieSVG(cats,angles){const cx=115,cy=112,r=95,cols=['#e51c35','#ffe45e','#64d9f5','#3dcf9b','#ffb070'];let g='',a0=-90;
 angles.forEach((a,i)=>{const a1=a0+a,rad=d=>d*Math.PI/180,p0=[cx+r*Math.cos(rad(a0)),cy+r*Math.sin(rad(a0))],p1=[cx+r*Math.cos(rad(a1)),cy+r*Math.sin(rad(a1))],m=rad(a0+a/2);
  g+=`<path d="M${cx},${cy} L${f1(p0[0])},${f1(p0[1])} A${r},${r} 0 ${a>180?1:0} 1 ${f1(p1[0])},${f1(p1[1])} Z" fill="${cols[i%cols.length]}" stroke="${INK}" stroke-width="2"/>`+txt(cx+r*0.62*Math.cos(m),cy+r*0.62*Math.sin(m),a+'°',{size:13});
  g+=`<rect x="236" y="${30+i*28}" width="16" height="16" fill="${cols[i%cols.length]}" stroke="${INK}" stroke-width="1.5"/>`+txt(260,38+i*28,cats[i],{size:13,anchor:'start'});a0=a1;});
 return svgWrap(370,228,g,'Pie chart');}
const tableHTML=(head,rows)=>`<div class="tablewrap"><table class="qtable"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${fracify(c)}</td>`:`<th scope="row">${fracify(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const fitPts=(P,W=360,H=220,m=34)=>{const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),mnx=Math.min(...xs),mny=Math.min(...ys),sw=Math.max(...xs)-mnx,sh=Math.max(...ys)-mny,s=Math.min((W-2*m)/sw,(H-2*m-8)/sh);return P.map(([x,y])=>[(W-sw*s)/2+(x-mnx)*s,m+(y-mny)*s])};
const rad=x=>x*Math.PI/180;
function quadPts(A,B,C,D){const dirs=[0,180-B,360-B-C,540-B-C-D].map(rad);for(let t=0;t<600;t++){const strict=t<400,L1=1,L2=strict?0.75+Math.random()*0.5:0.5+Math.random(),rx=-(L1*Math.cos(dirs[0])+L2*Math.cos(dirs[1])),ry=-(L1*Math.sin(dirs[0])+L2*Math.sin(dirs[1])),a=Math.cos(dirs[2]),b=Math.cos(dirs[3]),c=Math.sin(dirs[2]),d=Math.sin(dirs[3]),det=a*d-b*c;if(Math.abs(det)<1e-6)continue;const L3=(rx*d-b*ry)/det,L4=(a*ry-c*rx)/det;if(strict?(L3>0.65&&L4>0.65&&L3<1.6&&L4<1.6):(L3>0.35&&L4>0.35&&L3<2.5&&L4<2.5)){const L=[L1,L2,L3],p=[[0,0]];for(let i=0;i<3;i++){const q=p[i];p.push([q[0]+L[i]*Math.cos(dirs[i]),q[1]+L[i]*Math.sin(dirs[i])])}return fitPts(p.map(([x,y])=>[x,-y]))}}return[[40,180],[320,190],[285,40],[95,58]]}
const isoPts=apex=>fitPts([[0,0],[1,1/Math.tan(rad(apex/2))],[-1,1/Math.tan(rad(apex/2))]]);
const paraPts=a=>{const k=0.9/Math.tan(rad(a));return fitPts([[0,0.9],[2,0.9],[2+k,0],[k,0]])};
const kitePts=(t,b)=>{const x=Math.sin(rad(t/2)),y=Math.cos(rad(t/2));return fitPts([[0,0],[x,y],[0,y+x/Math.tan(rad(b/2))],[-x,y]])};
// Polygon with angle labels drawn inside each corner; ticks = edges with equal-length marks
function angleSVG(P,labels,opt={}){const cx=P.reduce((n,p)=>n+p[0],0)/P.length,cy=P.reduce((n,p)=>n+p[1],0)/P.length;let g=poly(P,opt.fill||'#d6f5ff',2.5);
 P.forEach((p,i)=>{const l=labels[i];if(!l)return;let vx=cx-p[0],vy=cy-p[1],d=Math.hypot(vx,vy)||1;const off=opt.off||30;g+=txt(p[0]+vx/d*off,p[1]+vy/d*off,l,{size:14,fill:l==='?'?'#e51c35':INK});});
 (opt.ticks||[]).forEach(i=>{const p=P[i],q=P[(i+1)%P.length],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy),nx=-dy/d*7,ny=dx/d*7;g+=line(mx-nx,my-ny,mx+nx,my+ny,{w:2.5});});
 const w=opt.w||360,h=opt.h||220;return svgWrap(w,h,g+notToScale(w,h),'Angle diagram');}
const regPoly=(n,cx=180,cy=112,r=92)=>Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]});
function gridSVG(cols,rows,shape){const s=Math.min(320/cols,190/rows),x0=12,y0=10;let g='';
 for(let i=0;i<=cols;i++)g+=line(x0+i*s,y0,x0+i*s,y0+rows*s,{c:'#c9cede',w:1});for(let j=0;j<=rows;j++)g+=line(x0,y0+j*s,x0+cols*s,y0+j*s,{c:'#c9cede',w:1});
 g+=poly(shape.map(([x,y])=>[x0+x*s,y0+y*s]),'rgba(229,28,53,.45)',2.5);const w=x0*2+cols*s,h=y0+rows*s+26;
 return svgWrap(w,h,g+txt(x0,h-10,'Each square is 1 cm by 1 cm',{size:11,anchor:'start',fill:'#687081'}),'Shape on a centimetre grid');}
function barModelSVG(d,n){const W=360,x0=10,bw=(W-20)/d;let g='';for(let i=0;i<d;i++)g+=`<rect x="${f1(x0+i*bw)}" y="14" width="${f1(bw)}" height="44" fill="${i<n?'#e51c35':'#fff'}" stroke="${INK}" stroke-width="2"/>`;return svgWrap(W,72,g,'Fraction bar');}

// ---- Figure registry: spec ['cuboid', ...args] -> SVG/HTML ----
const POINTS={quad:quadPts,iso:isoPts,para:paraPts,kite:kitePts,reg:regPoly};
const resolvePts=P=>Array.isArray(P)&&typeof P[0]==='string'?POINTS[P[0]](...P.slice(1)):P;
const FIGURES={cuboid:cuboidSVG,cubes:cubesSVG,shape:shapeSVG,frame:frameSVG,ruler:rulerSVG,bar:barSVG,line:lineSVG,picto:pictoSVG,pie:pieSVG,table:tableHTML,grid:gridSVG,barModel:barModelSVG,angle:(P,...r)=>angleSVG(resolvePts(P),...r)};
function renderFigure(spec){if(!spec)return '';if(typeof spec==='string')return spec;const[name,...args]=spec;return FIGURES[name]?FIGURES[name](...args):'';}

// ---- Fractions written the Tiffin way: numerator over a line over the denominator ----
// fracHTML(plain text) escapes the text, then turns 23/40, ?/30, 3.6/10 (and ½ ¼ ¾ ⅓ ⅔) into stacked fractions.
const VULGAR={'½':'1/2','¼':'1/4','¾':'3/4','⅓':'1/3','⅔':'2/3','⅕':'1/5','⅛':'1/8'};
const FRAC_RE=/(\d+(?:\.\d+)?|\?)\s?\/\s?(\d+(?:\.\d+)?|\?)/g;
const stack=(a,b)=>`<span class="frac" role="math" aria-label="${a} over ${b}"><span class="num" aria-hidden="true">${a}</span><span class="den" aria-hidden="true">${b}</span></span>`;
function fracHTML(text){return String(text).replace(/(\d?)([½¼¾⅓⅔⅕⅛])/g,(m,d,v)=>(d?d+'\u2009':'')+VULGAR[v]).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])).replace(FRAC_RE,(m,a,b)=>stack(a,b));}
// fracify(html): same, but only touches text between tags (for content that already contains <b>, <br> etc.)
function fracify(html){return String(html).split(/(<[^>]+>)/).map((part,i)=>i%2?part:part.replace(/(\d?)([½¼¾⅓⅔⅕⅛])/g,(m,d,v)=>(d?d+'\u2009':'')+VULGAR[v]).replace(FRAC_RE,(m,a,b)=>stack(a,b))).join('');}

// ---- Content blocks (used by lessons) ----
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function renderBlocks(blocks){return blocks.map(b=>{
 if(b.h)return `<h3>${b.h}</h3>`;
 if(b.p)return `<p>${fracify(b.p)}</p>`;
 if(b.fig)return renderFigure(b.fig);
 if(b.eg)return `<div class="eg">${fracify(b.eg)}</div>`;
 if(b.mini)return `<p class="mini">${fracify(b.mini)}</p>`;
 if(b.ul)return `<ul>${b.ul.map(x=>`<li>${fracify(x)}</li>`).join('')}</ul>`;
 if(b.ol)return `<ol>${b.ol.map(x=>`<li>${fracify(x)}</li>`).join('')}</ol>`;
 if(b.table)return `<div class="tablewrap"><table class="qtable"><thead><tr>${b.table.head.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${fracify(c)}</td>`:`<th scope="row">${fracify(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 return '';}).join('');}

// ---- Explainer (structured object from js/data/explainers.js) ----
function renderExplainer(e){return `<b class="xhead">🧒 EXPLAIN IT SIMPLY</b>
<div class="xrow"><span class="xi">🎯</span><div><b>What is it asking?</b><br>${fracHTML(e.asking)}</div></div>
${e.keys.length?`<div class="xrow"><span class="xi">🔑</span><div><b>Watch the key word${e.keys.length>1?'s':''}</b><ul>${e.keys.map(k=>`<li><b>${esc(k.word)}</b> — ${fracHTML(k.means)}</li>`).join('')}</ul></div></div>`:''}
<div class="xrow"><span class="xi">💡</span><div><b>The big idea</b><br>${fracHTML(e.idea)}</div></div>
<div class="xrow"><span class="xi">🗺️</span><div><b>Your game plan</b><ol>${e.plan.map(p=>`<li>${fracHTML(p)}</li>`).join('')}</ol></div></div>
<div class="xrow"><span class="xi">✅</span><div><b>Check it</b><br>${fracHTML(e.check)}</div></div>
<p class="mini">This doesn't give away the answer — have a go! Still stuck? Try “Teach me the method”.</p>`;}
