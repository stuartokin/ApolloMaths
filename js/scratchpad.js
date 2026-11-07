'use strict';
// PRESENTATION: a scratchpad for working out — draw with a finger, stylus or mouse. Cleared for each new question.
const Scratch=(()=>{
 let cv,ctx,drawing=false,last=null,colour='#121625',eraser=false;
 const H=()=>window.innerWidth<600?230:290;
 function size(){if(!cv||!cv.offsetParent)return;const dpr=window.devicePixelRatio||1,w=cv.parentElement.clientWidth,h=H(),tmp=document.createElement('canvas');tmp.width=cv.width;tmp.height=cv.height;if(cv.width)tmp.getContext('2d').drawImage(cv,0,0);
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.height=h+'px';ctx=cv.getContext('2d');ctx.setTransform(1,0,0,1,0,0);if(tmp.width)ctx.drawImage(tmp,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';}
 const pos=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
 function down(e){drawing=true;last=pos(e);cv.setPointerCapture(e.pointerId);dot(last,e);e.preventDefault();}
 function dot(p,e){ctx.globalCompositeOperation=eraser?'destination-out':'source-over';ctx.fillStyle=colour;ctx.beginPath();ctx.arc(p[0],p[1],width(e)/2,0,Math.PI*2);ctx.fill();}
 const width=e=>eraser?26:(e.pointerType==='pen'&&e.pressure?1.5+e.pressure*3.5:3.2);
 function move(e){if(!drawing)return;const p=pos(e);ctx.globalCompositeOperation=eraser?'destination-out':'source-over';ctx.strokeStyle=colour;ctx.lineWidth=width(e);ctx.beginPath();ctx.moveTo(last[0],last[1]);ctx.lineTo(p[0],p[1]);ctx.stroke();last=p;e.preventDefault();}
 function up(){drawing=false;}
 function clear(){if(ctx)ctx.clearRect(0,0,cv.width,cv.height);}
 function toggle(){const p=get('scratch'),b=get('scratchBtn'),opening=p.classList.contains('hidden');p.classList.toggle('hidden',!opening);b.setAttribute('aria-expanded',opening);if(opening){size();if(isNarrow())p.scrollIntoView({behavior:'smooth',block:'nearest'});}}
 function setTool(t){get('scratch').querySelectorAll('[data-pen]').forEach(b=>b.classList.toggle('active',b.dataset.pen===t));eraser=t==='eraser';if(!eraser)colour=t;}
 function init(){cv=get('scratchCanvas');ctx=cv.getContext('2d');cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);['pointerup','pointercancel','pointerleave'].forEach(ev=>cv.addEventListener(ev,up));
  get('scratchBtn').addEventListener('click',toggle);get('scratch').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.pen)setTool(b.dataset.pen);if(b.dataset.clear!==undefined)clear();if(b.dataset.closepad!==undefined)toggle();});
  window.addEventListener('resize',()=>{if(!get('scratch').classList.contains('hidden'))size();});}
 return{init,clear};
})();
