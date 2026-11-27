'use strict';
// PRESENTATION (2.86): proper maths for GCSE and A level, and graphs.
// - Text may contain inline maths between \( and \) written in LaTeX, e.g. 'Solve \(3x^2-5x-2=0\)'. It is drawn by KaTeX
//   (kept in js/vendor/katex, loaded only when needed). Until KaTeX has loaded — or on a device where it can't — a
//   readable plain version is shown instead.
// - F('graph',{x:[-5,5],y:[-5,5],fns:['2*x+1'],pts:[[1,3,'A']],step:1}) draws axes, a grid, lines/curves and points.
const Maths=(()=>{
 let state='none',waiting=[];   // none | loading | ready | failed
 const base=(()=>{const s=document.currentScript&&document.currentScript.src;return s?s.replace(/js\/render\/maths\.js.*$/,''):'';})();
 function load(){if(state!=='none')return;state='loading';
  const l=document.createElement('link');l.rel='stylesheet';l.href=base+'js/vendor/katex/katex.min.css';document.head.appendChild(l);
  const s=document.createElement('script');s.src=base+'js/vendor/katex/katex.min.js';s.onload=()=>{state=window.katex?'ready':'failed';const w=waiting;waiting=[];w.forEach(f=>{try{f();}catch(e){}});};
  s.onerror=()=>{state='failed';};document.head.appendChild(s);}
 // a plain-text stand-in: x^2 → x², \frac{a}{b} → a/b, \sqrt{x} → √x, \times → ×
 const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','n':'ⁿ'};
 function plain(tex){return tex.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)').replace(/\\sqrt\{([^{}]*)\}/g,'√($1)').replace(/\\sqrt/g,'√').replace(/\\times/g,'×').replace(/\\div/g,'÷')
  .replace(/\\pi/g,'π').replace(/\\theta/g,'θ').replace(/\\le(q)?/g,'≤').replace(/\\ge(q)?/g,'≥').replace(/\\pm/g,'±').replace(/\\circ/g,'°').replace(/\\cdot/g,'·').replace(/\\left|\\right/g,'')
  .replace(/\^\{([^{}]*)\}/g,(m,x)=>[...x].every(ch=>SUP[ch])?[...x].map(ch=>SUP[ch]).join(''):'^('+x+')').replace(/\^(-?\w)/g,(m,x)=>[...x].every(ch=>SUP[ch])?[...x].map(ch=>SUP[ch]).join(''):'^'+x)
  .replace(/\\,|\\;|\\!/g,' ').replace(/[{}]/g,'').replace(/-/g,'−');}
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function tex(t){if(state==='ready'){try{return window.katex.renderToString(t,{throwOnError:false,output:'html'});}catch(e){}}if(state==='none')load();return `<span class="tex-plain">${esc(plain(t))}</span>`;}
 const has=t=>typeof t==='string'&&t.includes('\\(');
 return {load,tex,plain,has,ready:()=>state==='ready',when:f=>{if(state==='ready')f();else{waiting.push(f);load();}}};
})();
// fracHTML (render.js) draws maths between \( … \); everything else as before
{const base=fracHTML;fracHTML=function(text){if(!Maths.has(text))return base(text);return String(text).split(/\\\(([\s\S]+?)\\\)/).map((part,i)=>i%2?Maths.tex(part):base(part)).join('');};}
// ---------- graphs ----------
function graphSVG(o){o=o||{};const [x0,x1]=o.x||[-5,5],[y0,y1]=o.y||[-5,5],st=o.step||1,sty=o.stepY||st,W=340,H=o.h||Math.min(460,Math.round(340*(y1-y0)/(x1-x0)))||340,pad=26;
 const sx=x=>pad+(x-x0)/(x1-x0)*(W-2*pad),sy=y=>H-pad-(y-y0)/(y1-y0)*(H-2*pad);let g='';
 for(let x=Math.ceil(x0/st)*st;x<=x1;x+=st)g+=line(sx(x),sy(y0),sx(x),sy(y1),{c:'#d5d9e3',w:1});
 for(let y=Math.ceil(y0/sty)*sty;y<=y1;y+=sty)g+=line(sx(x0),sy(y),sx(x1),sy(y),{c:'#d5d9e3',w:1});
 if(y0<=0&&y1>=0)g+=line(sx(x0),sy(0),sx(x1),sy(0),{w:2});if(x0<=0&&x1>=0)g+=line(sx(0),sy(y0),sx(0),sy(y1),{w:2});
 const lab=o.labelEvery||st*(x1-x0>12?2:1),laby=o.labelEveryY||(o.stepY?sty:lab);
 for(let x=Math.ceil(x0/lab)*lab;x<=x1;x+=lab)if(x)g+=txt(sx(x),sy(Math.max(y0,Math.min(0,y1)))+12,String(x).replace('-','−'),{size:10});
 for(let y=Math.ceil(y0/laby)*laby;y<=y1;y+=laby)if(y)g+=txt(sx(Math.max(x0,Math.min(0,x1)))-10,sy(y),String(y).replace('-','−'),{size:10,anchor:'end'});
 g+=txt(sx(x1)-6,sy(Math.max(y0,Math.min(0,y1)))-10,'x',{size:13,extra:' font-style="italic"'})+txt(sx(Math.max(x0,Math.min(0,x1)))+12,sy(y1)+8,'y',{size:13,extra:' font-style="italic"'});
 const COL=['#e51c35','#3b6fe0','#2ba36b'];(o.fns||[]).forEach((f,k)=>{let fn;try{fn=Alg.parse(f);}catch(e){return;}let d='',pen=false;
  for(let i=0;i<=240;i++){const x=x0+(x1-x0)*i/240;let y;try{y=fn({x});}catch(e){y=NaN;}if(!Number.isFinite(y)||y<y0-1||y>y1+1){pen=false;continue;}d+=(pen?'L':'M')+f1(sx(x))+' '+f1(sy(y))+' ';pen=true;}
  g+=`<path d="${d}" fill="none" stroke="${COL[k%3]}" stroke-width="2.6"/>`;});
 (o.pts||[]).forEach(([x,y,l])=>{g+=`<circle cx="${f1(sx(x))}" cy="${f1(sy(y))}" r="4.5" fill="${INK}"/>`;if(l)g+=txt(sx(x)+9,sy(y)-10,l,{size:13,anchor:'start'});});
 return svgWrap(W,H,`<clipPath id="gc"><rect x="${pad}" y="${pad}" width="${W-2*pad}" height="${H-2*pad}"/></clipPath>`+g,'Graph');}
FIGURES.graph=graphSVG;
// lesson blocks (fracify, render.js) draw maths too
{const base=fracify;fracify=function(html){if(!Maths.has(html))return base(html);return String(html).split(/\\\(([\s\S]+?)\\\)/).map((part,i)=>i%2?Maths.tex(part):base(part)).join('');};}
