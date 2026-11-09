// Service worker: lets the installed app open offline. Network first (so updates on GitHub appear straight away), cached copy when offline.
const CACHE='maths-missions-v48';
const ASSETS=['./','index.html','config.js','css/app.css','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png',
 'js/core.js','js/data/topics.js','js/data/questions-core.js','js/data/questions-focus.js','js/data/questions-extra.js','js/data/shop-extra.js','js/data/learning.js','js/data/learning-more.js','js/data/help.js','js/data/arcade-rules.js','js/data/lessons.js','js/data/explainers.js','js/data/marking.js','js/data/shop.js','js/data/metrics.js',
 'js/render/render.js','js/render/avatar.js','js/render/avatar-extra.js','js/learn.js','js/help.js','js/retro.js','js/games.js','js/starlane.js','js/starlane-audio.js','js/starlane-modern.js','js/vendor/three-bundle.js','js/arcade.js','js/admin.js','js/family.js','js/storage.js','js/locker.js','js/players.js','js/parent.js','js/scratchpad.js','js/print.js','js/pwa.js','js/speech.js','js/voices.js','js/update.js','js/tips.js','js/tour.js','js/windows.js','js/app.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||u.pathname.endsWith('version.json'))return;
 // always check with the website for a newer copy (cheap if unchanged), so updates appear as soon as they are published
 const fresh=r.mode==='navigate'?new Request(r.url,{cache:'no-cache',credentials:'same-origin'}):new Request(r,{cache:'no-cache'});
 e.respondWith(fetch(fresh).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));}return res;})
  .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))));});
