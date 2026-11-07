'use strict';
// PRESENTATION: install as an app (home screen / desktop) and work offline via the service worker (sw.js).
const PWA=(()=>{
 let deferred=null;
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const ios=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 function init(){const web=/^https?:/.test(location.protocol),b=get('installBtn');
  if(web&&'serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
  if(standalone()||!web)return;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;b.classList.remove('hidden');});
  if(ios())b.classList.remove('hidden');
  b.addEventListener('click',async()=>{if(deferred){deferred.prompt();const r=await deferred.userChoice;deferred=null;b.classList.add('hidden');if(r.outcome==='accepted')toast('📲 Installed! Open Maths Missions from your home screen or desktop.');}
   else toast('📲 On iPad or iPhone: tap the Share button ⬆️ in Safari, then “Add to Home Screen”.');});
  window.addEventListener('appinstalled',()=>b.classList.add('hidden'));}
 return{init};
})();
