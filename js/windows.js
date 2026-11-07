'use strict';
// PRESENTATION: makes every pop-up window movable (drag the title bar), resizable (drag the bottom-right corner)
// and expandable (⤢ button or double-click the title bar). On phones windows are already full-screen, so this switches off.
const Win=(()=>{
 const small=()=>window.matchMedia('(max-width:700px)').matches;
 const MINW=320,MINH=240;
 function place(d){const r=d.getBoundingClientRect();Object.assign(d.style,{margin:'0',left:r.left+'px',top:r.top+'px',right:'auto',bottom:'auto'});return r;}
 function toggleMax(d,b){const on=!d.classList.contains('win-max');if(on){d.dataset.prev=d.getAttribute('style')||'';d.removeAttribute('style');}else{d.setAttribute('style',d.dataset.prev||'');}
  d.classList.toggle('win-max',on);b.textContent=on?'⤡':'⤢';b.title=on?'Restore size':'Expand';b.setAttribute('aria-label',b.title);window.dispatchEvent(new Event('resize'));}
 function drag(e,d,mode){if(small()||d.classList.contains('win-max'))return;e.preventDefault();const r=place(d),sx=e.clientX,sy=e.clientY,el=e.currentTarget;el.setPointerCapture(e.pointerId);
  const move=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;
   if(mode==='move'){d.style.left=Math.min(innerWidth-80,Math.max(80-r.width,r.left+dx))+'px';d.style.top=Math.min(innerHeight-48,Math.max(0,r.top+dy))+'px';}
   else{d.style.width=Math.max(MINW,Math.min(innerWidth-r.left-4,r.width+dx))+'px';d.style.height=Math.max(MINH,Math.min(innerHeight-r.top-4,r.height+dy))+'px';d.style.maxWidth='none';d.style.maxHeight='none';}};
  const up=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);if(mode==='size')window.dispatchEvent(new Event('resize'));};
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);}
 function enhance(d){const head=d.querySelector('.lk-head');if(!head||d.dataset.win)return;d.dataset.win='1';
  const close=head.querySelector('.lk-close'),max=document.createElement('button');max.className='ghost win-btn';max.type='button';max.textContent='⤢';max.title='Expand';max.setAttribute('aria-label','Expand window');
  head.insertBefore(max,close);max.addEventListener('click',()=>toggleMax(d,max));
  head.title='Drag to move · double-click to expand';
  head.addEventListener('dblclick',e=>{if(!e.target.closest('button,select,input,a'))toggleMax(d,max);});
  head.addEventListener('pointerdown',e=>{if(e.button||e.target.closest('button,select,input,a,label'))return;drag(e,d,'move');});
  const h=document.createElement('div');h.className='win-resize';h.title='Drag to resize';h.setAttribute('aria-hidden','true');d.appendChild(h);
  h.addEventListener('pointerdown',e=>drag(e,d,'size'));
  d.addEventListener('close',()=>{d.removeAttribute('style');d.classList.remove('win-max');max.textContent='⤢';max.title='Expand';});}
 function init(){document.querySelectorAll('dialog').forEach(enhance);}
 return{init};
})();
