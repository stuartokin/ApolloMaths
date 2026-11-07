'use strict';
// DATA + LOGIC: arcade limits and unlock rules, and safe hashing for the secret words and admin PIN. Pure functions — no DOM.
const ARCADE_DEFAULTS={
 enabled:true,            // this player may use the arcade
 mode:'earned',           // 'earned' = play time is earned from learning; 'fixed' = a set daily allowance once unlocked
 earnPer:3,               // earned mode: 1 minute of play for every N minutes of active learning/testing
 unlockMins:15,           // must do this many minutes of active learning/testing today first
 unlockCorrect:0,         // ... and get this many questions right today
 unlockFocus:0,           // ... and this many Focus Zone questions right today
 needLesson:false,        // ... and finish a Learn mission today
 needPlan:false,          // ... and complete Today's plan
 sessionMins:10,          // longest single game session
 breakMins:30,            // rest needed between sessions
 dayMins:15,              // most play in a day
 weekMins:60,             // most play in a week (Monday–Sunday)
 days:[1,1,1,1,1,1,1],    // allowed days, Monday → Sunday
 from:'07:00',to:'20:00', // allowed hours
 examLock:true,           // no arcade on the exam day
 bonusDay:'',bonusMins:0, // one-off extra minutes for a given day
 carry:true,              // unplayed arcade time is saved for the next session
 maxCarryMins:15,         // ... up to this many minutes
 resumeMins:15            // session clock: reopening the app within this many minutes carries on the same session (0 = always a new session)
};
const DEFAULT_WORDS={kid:'c19fe337aa0cd1ebc4ba00f0d16d83be47e9b047e0e61690e268088325092a7b',admin:'f9b0a0d3973f9bdda31247106c402194cce6f9313eae3e6e3d070e33383b7b1f',kidNum:'cdc6e04cd9378ade38d889c3c5824d2c8b26f2af384040007af60674adcae5c3',adminNum:'c861320498ae661f62dffcf04d9b48de24872d644ed58277050e860b4ecdb96b'}; // hashes only
// Secret NUMBER codes (for tablets that only show a number keypad): they always start with 00 and are 6–10 digits, so they can never be a real answer.
const validCode=c=>/^00\d{4,8}$/.test(String(c||'').trim());
// SHA-256 (public-domain compact implementation) — used so secret words and the PIN are never stored as readable text.
function sha256(ascii){const rr=(v,a)=>(v>>>a)|(v<<(32-a));const mp=Math.pow,mw=mp(2,32);let i,j,res='';const words=[],bitLen=ascii.length*8;let hash=sha256.h=sha256.h||[];const k=sha256.k=sha256.k||[];let pc=k.length;const comp={};
 for(let c=2;pc<64;c++){if(!comp[c]){for(i=0;i<313;i+=c)comp[i]=c;hash[pc]=(mp(c,.5)*mw)|0;k[pc++]=(mp(c,1/3)*mw)|0;}}
 ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';for(i=0;i<ascii.length;i++){j=ascii.charCodeAt(i);if(j>>8)return'';words[i>>2]|=j<<((3-i)%4)*8;}
 words[words.length]=(bitLen/mw)|0;words[words.length]=bitLen;
 for(j=0;j<words.length;){const w=words.slice(j,j+=16),old=hash;hash=hash.slice(0,8);
  for(i=0;i<64;i++){const w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];const t1=hash[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
   const t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0;}
  for(i=0;i<8;i++)hash[i]=(hash[i]+old[i])|0;}
 for(i=0;i<8;i++)for(j=3;j+1;j--){const b=(hash[i]>>(j*8))&255;res+=(b<16?'0':'')+b.toString(16);}return res;}
const normWord=w=>String(w||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const wordHash=(w,salt='default')=>sha256('apollo-maths|'+salt+'|'+normWord(w));
const pinHash=(pin,salt)=>sha256('apollo-maths-pin|'+salt+'|'+String(pin).replace(/\D/g,''));
// ---- settings & usage (stored per player in stats.arcade) ----
function cleanArcade(s){const a=s.arcade&&typeof s.arcade==='object'?s.arcade:{},st=a.settings&&typeof a.settings==='object'?a.settings:{},d=ARCADE_DEFAULTS,n=(v,min,max,fb)=>{v=+v;return Number.isFinite(v)?Math.min(max,Math.max(min,Math.round(v))):fb;},t=v=>/^\d{2}:\d{2}$/.test(v)?v:null;
 const S={enabled:st.enabled===undefined?d.enabled:!!st.enabled,mode:st.mode==='fixed'?'fixed':'earned',earnPer:n(st.earnPer,1,20,d.earnPer),unlockMins:n(st.unlockMins,0,240,d.unlockMins),unlockCorrect:n(st.unlockCorrect,0,200,d.unlockCorrect),unlockFocus:n(st.unlockFocus,0,200,d.unlockFocus),needLesson:!!st.needLesson,needPlan:!!st.needPlan,
  sessionMins:n(st.sessionMins,1,120,d.sessionMins),breakMins:n(st.breakMins,0,600,d.breakMins),dayMins:n(st.dayMins,0,600,d.dayMins),weekMins:n(st.weekMins,0,3000,d.weekMins),days:Array.isArray(st.days)&&st.days.length===7?st.days.map(x=>x?1:0):d.days.slice(),from:t(st.from)||d.from,to:t(st.to)||d.to,examLock:st.examLock===undefined?d.examLock:!!st.examLock,bonusDay:isDay(st.bonusDay)?st.bonusDay:'',bonusMins:n(st.bonusMins,0,240,0),carry:st.carry===undefined?d.carry:!!st.carry,maxCarryMins:n(st.maxCarryMins,0,240,d.maxCarryMins),resumeMins:n(st.resumeMins,0,240,d.resumeMins)};
 const used={};const u=a.used&&typeof a.used==='object'?a.used:{};for(const k of Object.keys(u).filter(isDay).sort().slice(-60))used[k]=n(u[k],0,86400,0);
 s.arcade={settings:S,used,plays:(Array.isArray(a.plays)?a.plays:[]).slice(-200).filter(p=>p&&typeof p==='object').map(p=>({t:num(p.t),secs:n(p.secs,0,86400,0),score:n(p.score,0,1e7,0),theme:p.theme==='classic'?'classic':'player',game:['invaders','maze','meteor','guardian','ladder','racer','snake'].includes(p.game)?p.game:'invaders',wave:n(p.wave,1,999,1),end:str(p.end,12)})),
  lastEnd:num(a.lastEnd),high:Object.fromEntries(['player','classic','maze','meteor','guardian','ladder','racer','snake'].map(k=>[k,n((a.high||{})[k],0,1e9,0)])),bank:{secs:n((a.bank||{}).secs,0,14400,0),day:isDay((a.bank||{}).day)?a.bank.day:''},theme:a.theme==='classic'?'classic':'player',game:['invaders','maze','meteor','guardian','ladder','racer','snake'].includes(a.game)?a.game:'invaders',mute:!!a.mute};return s;}
const mondayOf=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x;};
// Everything the arcade needs to know right now: is it unlocked, what is left, and why not.
function arcadeStatus(s,now=new Date()){const st=s.arcade.settings,k=dayKey(now),T=s.time.byDay[k]||{},learn=(T.questions||0)+(T.learn||0);
 const L=s.log.filter(e=>dayKey(new Date(e.t))===k&&!e.sk),right=L.filter(e=>e.ok).length,focus=L.filter(e=>e.ok&&topics[e.tp]&&topics[e.tp].focus).length;
 const lesson=Object.keys(s.learn.days||{}).some(x=>x.startsWith(k+'|')&&s.learn.days[x].lessons>0),plan=s.plan&&s.plan.day===k&&s.plan.done;
 const reqs=[];if(st.unlockMins)reqs.push({label:`${st.unlockMins} minutes of learning or questions today`,have:Math.floor(learn/60),need:st.unlockMins,done:learn>=st.unlockMins*60,unit:'min'});
 if(st.unlockCorrect)reqs.push({label:`${st.unlockCorrect} questions right today`,have:right,need:st.unlockCorrect,done:right>=st.unlockCorrect});
 if(st.unlockFocus)reqs.push({label:`${st.unlockFocus} Focus Zone questions right today`,have:focus,need:st.unlockFocus,done:focus>=st.unlockFocus});
 if(st.needLesson)reqs.push({label:'Finish a Learn mission today',have:lesson?1:0,need:1,done:lesson});
 if(st.needPlan)reqs.push({label:'Complete Today’s plan',have:plan?1:0,need:1,done:!!plan});
 const blocks=[],mins=now.getHours()*60+now.getMinutes(),toM=v=>+v.slice(0,2)*60+ +v.slice(3);
 if(!st.enabled)blocks.push('The arcade is switched off for now.');
 if(!st.days[(now.getDay()+6)%7])blocks.push('The arcade is closed today.');
 if(mins<toM(st.from)||mins>=toM(st.to))blocks.push(`The arcade is open from ${st.from} to ${st.to}.`);
 if(st.examLock&&k===s.exam.date)blocks.push('No arcade on exam day — good luck! 🍀');
 const usedDay=s.arcade.used[k]||0,mon=mondayOf(now);let usedWeek=0;for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);usedWeek+=s.arcade.used[dayKey(d)]||0;}
 // Banked (unplayed) time from the last session: always lengthens the next session; if it was banked on an earlier day it is also added on top of today's limits.
 const bank=st.carry?Math.min(s.arcade.bank.secs,st.maxCarryMins*60):0,extra=bank&&s.arcade.bank.day!==k?bank:0;
 const bonus=(st.bonusDay===k?st.bonusMins*60:0)+extra,dayLeft=st.dayMins*60+bonus-usedDay,weekLeft=st.weekMins*60+bonus-usedWeek,earned=st.mode==='earned'?Math.floor(learn/st.earnPer)+bonus:Infinity,earnLeft=earned-usedDay;
 const available=Math.max(0,Math.floor(Math.min(dayLeft,weekLeft,earnLeft))),breakLeft=s.arcade.lastEnd&&st.breakMins?Math.max(0,Math.ceil((s.arcade.lastEnd+st.breakMins*60000-now.getTime())/1000)):0;
 const reqsDone=reqs.every(r=>r.done),canPlay=!blocks.length&&reqsDone&&available>=30&&!breakLeft;
 return{canPlay,blocks,reqs,reqsDone,available,breakLeft,usedDay,usedWeek,dayLeft:Math.max(0,dayLeft),weekLeft:Math.max(0,weekLeft),earned:Number.isFinite(earned)?earned:null,learnSecs:learn,bank,sessionSecs:Math.min(st.sessionMins*60+bank,available)};}
