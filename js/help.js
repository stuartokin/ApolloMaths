'use strict';
// PRESENTATION: the ❓ Help guide and version history.
const Help=(()=>{
 let tab='guide';
 const dlg=()=>get('help');
 function render(){const d=dlg();d.querySelectorAll('[data-htab]').forEach(b=>b.classList.toggle('active',b.dataset.htab===tab));
  d.querySelector('.hp-body').innerHTML=tab==='guide'?`<div class="hp-tour"><b>🎓 New here? Take a tour</b><div class="actions"><button class="primary" data-tourstart="player" type="button">🚀 Tour for players</button><button class="secondary" data-tourstart="parent" type="button">👪 Tour for grown-ups</button></div></div><p class="section-note">Tap a section to open it. Version ${APP_VERSION}.</p>`+helpSections().map((s,i)=>`<details class="hp-sec"${i===0?' open':''}><summary>${s.icon} ${s.title}</summary>${renderBlocks(personalise(s.blocks))}</details>`).join(''):
   versionHistory.map((v,i)=>`<div class="hp-ver${i===0?' latest':''}"><div class="hp-vh"><b>Version ${v.v}</b>${i===0?'<span class="badge new">LATEST</span>':''}<small>${v.date}</small></div><ul>${v.items.map(x=>`<li>${fracify(x)}</li>`).join('')}</ul></div>`).join('');}
 function open(t='guide'){tab=t;render();const d=dlg();if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');}
 function close(){const d=dlg();if(d.close)d.close();else d.removeAttribute('open');}
 function init(){const d=dlg();d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close!==undefined)close();if(b.dataset.htab){tab=b.dataset.htab;render();}if(b.dataset.tourstart){close();setTimeout(()=>Tour.start(b.dataset.tourstart),150);}});
  document.querySelectorAll('[data-help]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.help||'guide')));
  get('appVersion').textContent='Version '+APP_VERSION;
  // Tell everyone once when there is a new version on this device.
  let seen='';try{seen=localStorage.getItem('apollo-maths-version')||''}catch(e){}
  if(seen!==APP_VERSION){try{localStorage.setItem('apollo-maths-version',APP_VERSION)}catch(e){}if(seen)setTimeout(()=>toast(`🆕 Version ${APP_VERSION}: ${versionHistory[0].items[0].slice(0,90)}… Tap ❓ Help to see what’s new.`),1200);}}
 return{init,open};
})();
