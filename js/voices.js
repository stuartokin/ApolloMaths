'use strict';
// PRESENTATION: the 🔊 mute button, the 🎙️ Voices window and every 🔊 read-aloud button.
const Voices=(()=>{
 const dlg=()=>get('voices'),S=()=>stats.speech;
 function apply(){const m=get('muteBtn');m.textContent=S().announce?'🔊 Sound on':'🔇 Sound off';m.setAttribute('aria-pressed',String(!S().announce));
  document.body.classList.toggle('no-say',!S().icons||!Speech.ok);if(!Speech.ok){m.classList.add('hidden');get('voiceBtn').classList.add('hidden');}}
 function render(){const s=S(),opt=(name,val,cur,label)=>`<label class="chk"><input type="radio" name="${name}" value="${val}"${cur===val?' checked':''}> ${label}</label>`;
  get('vcBody').innerHTML=`${Speech.ok?'':'<p class="feedback warn">This browser can’t read aloud. Try Chrome, Edge or Safari.</p>'}
  <fieldset><legend>Switches</legend>
   <label class="chk"><input type="checkbox" data-v="announce"${s.announce?' checked':''}> 📣 <b>Announcements</b> — read out celebrations, tips and answer feedback (same as the 🔊 button at the top)</label>
   <label class="chk"><input type="checkbox" data-v="icons"${s.icons?' checked':''}> 🔊 <b>Read-aloud buttons</b> on questions, explainers, methods, lessons and examples</label>
   <label class="chk"><input type="checkbox" data-v="tour"${s.tour?' checked':''}> 🗺️ <b>Tour narration</b> — the guided tour reads each step and moves on by itself</label></fieldset>
  <fieldset><legend>Voice</legend><div class="vc-row">${opt('vGender','female',s.gender,'👩 Female voices')}${opt('vGender','male',s.gender,'👨 Male voices')}</div>
   <div class="vc-row">${opt('vRate','0.8',String(s.rate),'🐢 Slower')}${opt('vRate','1',String(s.rate),'Normal')}${opt('vRate','1.2',String(s.rate),'🐇 Faster')}</div></fieldset>
  <fieldset><legend>Try each voice</legend><div class="vc-try">${Object.entries(Speech.ROLES).map(([k,r])=>{const v=Speech.voiceFor(k);return `<div class="vc-role"><button class="secondary" data-try="${k}" type="button">▶ ${r.label}</button><small>${v?esc(v.name):'Device default voice'}</small></div>`;}).join('')}</div>
   <p class="mini">Each job gets its own voice when your device has several. Voices come from your device, so they differ between computers, tablets and browsers.${Speech.voices().length?` This device has ${Speech.voices().length} English voice${Speech.voices().length>1?'s':''}.`:''}</p></fieldset>`;}
 function open(){render();const d=dlg();if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');}
 // ---------- 🔊 read-aloud buttons ----------
 // Text of an element without its buttons (so “Read aloud” / “Next” labels aren’t read out).
 const plain=el=>{if(!el)return'';const c=el.cloneNode(true);c.querySelectorAll('button,.say-btn').forEach(b=>b.remove());c.querySelectorAll('b,strong,span,em,i,kbd,small').forEach(n=>n.insertAdjacentText('afterend',' '));c.querySelectorAll('br,p,div,li,h3,h4,dt,dd').forEach(n=>n.insertAdjacentText('afterend','. '));
  return c.textContent.replace(/\s+/g,' ').replace(/([.!?:])\s*(\.\s*)+/g,'$1 ').replace(/\s+([.,!?])/g,'$1').trim();};
 function textFor(kind){
  if(kind==='question')return current?current.q:'';
  if(kind==='explain')return plain(get('explain'));
  if(kind==='solution')return plain(get('solution'));
  if(kind==='lesson'){const d=get('learn'),c=d.querySelector('.ln-content'),q=d.querySelector('.ln-check');return [plain(d.querySelector('.ln-title')),plain(c),q&&!q.classList.contains('hidden')?plain(q).replace(/\n+/g,'. '):''].join('. ');}
  if(kind==='example'){const d=get('learn');return [plain(d.querySelector('.ex-q')),...[...d.querySelectorAll('.ex-steps li')].map(plain),plain(d.querySelector('.ex-ans'))].filter(Boolean).join('. ');}
  return '';}
 const ROLE={question:'question',explain:'teach',solution:'teach',lesson:'teach',example:'teach'};
 let activeBtn=null;
 function reset(){if(activeBtn){activeBtn.classList.remove('speaking');activeBtn.textContent=activeBtn.dataset.label||'🔊';}activeBtn=null;}
 function readAloud(b){const kind=b.dataset.say;if(activeBtn===b&&Speech.speaking()){Speech.stop();reset();return;}Speech.stop();reset();
  const t=textFor(kind);if(!t)return;activeBtn=b;b.dataset.label=b.dataset.label||b.textContent;b.classList.add('speaking');b.textContent=b.textContent.includes('Read')?'⏹ Stop':'⏹';
  Speech.say(t,ROLE[kind]||'teach',()=>{if(activeBtn===b)reset();});}
 function init(){apply();get('muteBtn').addEventListener('click',()=>{S().announce=!S().announce;if(!S().announce)Speech.stop();save();apply();});
  get('voiceBtn').addEventListener('click',open);
  dlg().addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close!==undefined){Speech.stop();dlg().close();}if(b.dataset.try)Speech.say(Speech.ROLES[b.dataset.try].sample,b.dataset.try);});
  dlg().addEventListener('change',e=>{const t=e.target,s=S();if(t.dataset.v){s[t.dataset.v]=t.checked;}else if(t.name==='vGender'){s.gender=t.value;}else if(t.name==='vRate'){s.rate=+t.value;}save();apply();render();
   if(t.name==='vGender')Speech.say(t.value==='male'?'Hello! This is a male voice.':'Hello! This is a female voice.','tour');});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(b){e.preventDefault();readAloud(b);}});
  dlg().addEventListener('close',()=>Speech.stop());}
 return{init,apply,open,reset};
})();
