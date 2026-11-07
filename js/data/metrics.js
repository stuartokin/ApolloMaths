'use strict';
// LOGIC: learning metrics, Fix-it list, readiness, exam countdown and the daily plan. Pure functions — no DOM.
const EXAM_DEFAULT={name:'Tiffin Stage 2',date:'2026-11-12'};
const LOG_MAX=2000;
const num=(v,min=0,max=1e9)=>{v=+v;return Number.isFinite(v)?Math.min(max,Math.max(min,v)):0;};
const str=(v,n)=>typeof v==='string'?v.slice(0,n):'';
const isDay=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d);

// Make sure every metric loaded from storage or a file has the right shape.
function cleanMetrics(s){
 const t=s.time&&typeof s.time==='object'?s.time:{},bd=t.byDay&&typeof t.byDay==='object'?t.byDay:{};s.time={byDay:{}};
 for(const d of Object.keys(bd).filter(isDay).sort().slice(-400)){const x=bd[d]||{};s.time.byDay[d]={app:num(x.app),questions:num(x.questions),learn:num(x.learn),shop:num(x.shop),visits:num(x.visits)};}
 s.log=(Array.isArray(s.log)?s.log:[]).filter(e=>e&&typeof e==='object'&&topics[e.tp]).slice(-LOG_MAX).map(e=>({t:num(e.t),tp:e.tp,g:Math.floor(num(e.g,0,99)),ok:e.ok?1:0,f:e.f?1:0,sk:e.sk?1:0,h:Math.floor(num(e.h,0,3)),x:e.x?1:0,m:e.m?1:0,tr:Math.floor(num(e.tr,0,99)),s:Math.floor(num(e.s,0,3600)),w:(Array.isArray(e.w)?e.w:[]).slice(0,4).map(v=>str(v,24)),md:str(e.md,10),lv:str(e.lv,8),fx:e.fx?1:0,q:str(e.q,220),a:str(e.a,30)}));
 s.mocks=(Array.isArray(s.mocks)?s.mocks:[]).slice(-50).filter(m=>m&&typeof m==='object').map(m=>({t:num(m.t),score:Math.floor(num(m.score,0,40)),total:Math.floor(num(m.total,1,40)),secs:Math.floor(num(m.secs,0,7200)),timedOut:!!m.timedOut}));
 s.paperMocks=(Array.isArray(s.paperMocks)?s.paperMocks:[]).slice(-50).filter(m=>m&&typeof m==='object').map(m=>({t:num(m.t),score:Math.floor(num(m.score,0,100)),total:Math.floor(num(m.total,1,100))}));
 s.purchases=(Array.isArray(s.purchases)?s.purchases:[]).slice(-300).filter(p=>p&&typeof p.id==='string').map(p=>({t:num(p.t),id:str(p.id,30),price:Math.floor(num(p.price))}));
 s.fix=(Array.isArray(s.fix)?s.fix:[]).filter(f=>f&&topics[f.tp]&&bank[f.tp]&&bank[f.tp][f.g]).slice(-40).map(f=>({tp:f.tp,g:Math.floor(num(f.g)),due:Math.floor(num(f.due)),streak:Math.floor(num(f.streak,0,2)),added:num(f.added),q:str(f.q,220)}));
 s.fixed=Math.floor(num(s.fixed));s.qn=Math.floor(num(s.qn));
 s.plan=s.plan&&isDay(s.plan.day)?{day:s.plan.day,done:!!s.plan.done}:{day:'',done:false};
 const ln=s.learn&&typeof s.learn==='object'?s.learn:{};
 s.learn={events:(Array.isArray(ln.events)?ln.events:[]).filter(e=>e&&typeof e.type==='string'&&topics[e.tp]).slice(-1500).map(e=>({t:num(e.t),type:str(e.type,12),tp:e.tp,pts:Math.floor(num(e.pts,0,1000)),step:Math.floor(num(e.step,0,20)),tries:Math.floor(num(e.tries,0,9)),secs:Math.floor(num(e.secs,0,3600)),ok:e.ok?1:0,n:Math.floor(num(e.n,0,999)),thr:Math.floor(num(e.thr,0,100))})),
  days:{},lessons:{}};
 const lds=ln.days&&typeof ln.days==='object'?ln.days:{};for(const k of Object.keys(lds).filter(k=>/^\d{4}-\d{2}-\d{2}\|\w+$/.test(k)).sort().slice(-300)){const v=lds[k]||{};s.learn.days[k]={lessons:Math.floor(num(v.lessons,0,99)),examples:Math.floor(num(v.examples,0,999))};}
 const lls=ln.lessons&&typeof ln.lessons==='object'?ln.lessons:{};for(const k of Object.keys(lls))if(topics[k])s.learn.lessons[k]=Math.floor(num(lls[k],0,9999));
 s.learnPts=Math.floor(num(s.learnPts));s.focusStreak=Math.floor(num(s.focusStreak,0,9999));s.bestFocusStreak=Math.floor(num(s.bestFocusStreak,0,9999));
 const ms=s.mastery&&typeof s.mastery==='object'?s.mastery:{};s.mastery={};for(const k of Object.keys(ms))if(topics[k]&&Array.isArray(ms[k]))s.mastery[k]=ms[k].filter(v=>[60,80,95].includes(v));
 s.announced=(Array.isArray(s.announced)?s.announced:[]).filter(id=>typeof id==='string').slice(-500);s.shopVer=Math.floor(num(s.shopVer,0,99));s.newSince=num(s.newSince);s.dealSeen=isDay(s.dealSeen)?s.dealSeen:'';
 const ex=s.exam&&typeof s.exam==='object'?s.exam:{};s.exam={name:str(ex.name,40).trim()||EXAM_DEFAULT.name,date:isDay(ex.date)?ex.date:EXAM_DEFAULT.date};
 return s;}

// ---------- Fix-it list (spaced practice of question types that went wrong) ----------
// A question type comes back after a few questions; it is "fixed" after 2 right-first-time answers in a row.
const FIX={afterWrong:3,afterRight:12,needed:2,bonus:10};
function fixUpdate(s,tp,g,firstTry,qText){const i=s.fix.findIndex(f=>f.tp===tp&&f.g===g);
 if(firstTry){if(i<0)return null;const f=s.fix[i];f.streak++;if(f.streak>=FIX.needed){s.fix.splice(i,1);s.fixed++;return'fixed';}f.due=s.qn+FIX.afterRight;return'progress';}
 if(i<0){s.fix.push({tp,g,due:s.qn+FIX.afterWrong,streak:0,added:Date.now(),q:qText.slice(0,220)});if(s.fix.length>40)s.fix.shift();return'added';}
 const f=s.fix[i];f.streak=0;f.due=s.qn+FIX.afterWrong;return'reset';}
const fixDue=s=>s.fix.filter(f=>f.due<=s.qn);

// ---------- Readiness: recent right-first-time rate, scaled by how much evidence there is ----------
function readiness(s,tp){const recent=s.log.filter(e=>e.tp===tp).slice(-12);let n=recent.length,rate;
 if(n){rate=recent.filter(e=>e.f).length/n;}else{const b=(s.byTopic||{})[tp];if(!b||!b.seen)return{pct:0,n:0,label:'Not started'};n=Math.min(b.seen,12);rate=b.first/b.seen;}
 const pct=Math.round(100*rate*Math.min(1,n/8));return{pct,n,label:pct>=80?'Ready':pct>=60?'Nearly there':pct>=30?'Getting there':'Needs work'};}

// ---------- Exam countdown and daily plan ----------
function daysLeft(s,now=new Date()){const[y,m,d]=s.exam.date.split('-').map(Number),exam=new Date(y,m-1,d),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());return Math.round((exam-today)/86400000);}
const todayLog=(s,now=new Date())=>{const k=dayKey(now);return s.log.filter(e=>dayKey(new Date(e.t))===k);};
function weakestFocus(s){return focusKeys.map(k=>({k,r:readiness(s,k)})).sort((a,b)=>a.r.pct-b.r.pct||a.r.n-b.r.n)[0].k;}
function planFor(s,now=new Date()){const dl=daysLeft(s,now),L=todayLog(s,now),focusN=L.filter(e=>topics[e.tp].focus&&!e.sk).length,weak=weakestFocus(s),weakN=L.filter(e=>e.tp===weak&&!e.sk).length,
 mockDone=s.mocks.some(m=>dayKey(new Date(m.t))===dayKey(now)),sprintDone=L.filter(e=>e.md==='sprint').length>=5,due=fixDue(s).length,fixDone=!s.fix.length||(due===0&&L.some(e=>e.fx));
 const t=[];let msg;
 if(dl===0){msg='Exam day! Eat a good breakfast, take a pencil and rubber, and read every question twice. You’ve got this! 💪';t.push({id:'warm',label:'Gentle warm-up: 5 Focus mix questions',go:'focus',done:focusN>=5});}
 else if(dl===1){msg='Tomorrow is the big day. A light session today — then an early night!';t.push({id:'focus',label:'10 Focus mix questions',go:'focus',done:focusN>=10},{id:'fix',label:s.fix.length?`Fix-it list (${s.fix.length} to fix)`:'Fix-it list — all clear!',go:'fixit',done:fixDone});}
 else{msg=dl>1?`${dl} days to go. Little and often wins!`:'Keep your maths muscles strong!';
  const lessonDone=((s.learn.days||{})[dayKey(now)+'|'+weak]||{}).lessons>0;
  t.push({id:'learn',label:`Finish the ${topics[weak].label} lesson`,go:'learn:'+weak,done:lessonDone},{id:'focus',label:'10 Focus mix questions',go:'focus',done:focusN>=10},{id:'fix',label:s.fix.length?`Fix-it list (${s.fix.length} to fix)`:'Fix-it list — all clear!',go:'fixit',done:fixDone},{id:'weak',label:`8 questions on ${topics[weak].label}`,go:weak,done:weakN>=8});
  t.push(dl>1&&dl%2===0?{id:'mock',label:'A full 40-question mock',go:'mock',done:mockDone}:{id:'sprint',label:'A 5-minute sprint',go:'sprint',done:sprintDone||mockDone});}
 return{daysLeft:dl,message:msg,tasks:t,allDone:t.every(x=>x.done)};}

// ---------- Aggregates for the parent dashboard ----------
function timeTotals(s){const tot={app:0,questions:0,learn:0,shop:0,visits:0,days:0};for(const d of Object.values(s.time.byDay)){for(const k of['app','questions','learn','shop','visits'])tot[k]+=d[k];if(d.app>=60)tot.days++;}return tot;}
function topicTable(s){return Object.keys(topics).map(k=>{const b=(s.byTopic||{})[k]||{seen:0,correct:0,first:0,hints:0,skipped:0},L=s.log.filter(e=>e.tp===k),timed=L.filter(e=>e.s>0);
 return{k,label:topics[k].label,emoji:topics[k].emoji,focus:!!topics[k].focus,seen:b.seen,correct:b.correct,first:b.first,hints:b.hints,skipped:b.skipped,
  explains:L.filter(e=>e.x).length,methods:L.filter(e=>e.m).length,avgSecs:timed.length?Math.round(timed.reduce((a,e)=>a+e.s,0)/timed.length):0,last:L.length?L[L.length-1].t:0,ready:readiness(s,k)};});}
function familyTable(s){const m={};for(const e of s.log){const k=e.tp+'#'+e.g,r=(m[k] ||= {tp:e.tp,g:e.g,n:0,first:0,wrong:0,skipped:0,secs:0,wrongAnswers:[],example:'',answer:''});r.n++;r.first+=e.f;r.skipped+=e.sk;if(!e.ok)r.wrong++;r.secs+=e.s;
  if(!e.f||!r.example){r.example=e.q;r.answer=e.a;}for(const w of e.w)if(w&&r.wrongAnswers.length<6&&!r.wrongAnswers.includes(w))r.wrongAnswers.push(w);}
 return Object.values(m).map(r=>({...r,firstPct:Math.round(100*r.first/r.n),avgSecs:Math.round(r.secs/r.n)})).sort((a,b)=>a.firstPct-b.firstPct||b.n-a.n);}
function dailySeries(s,days=14,now=new Date()){const out=[];for(let i=days-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i),k=dayKey(d),T=s.time.byDay[k]||{app:0,questions:0,learn:0,shop:0,visits:0},L=s.log.filter(e=>dayKey(new Date(e.t))===k&&!e.sk);
 out.push({day:k,label:d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric'}),...T,answered:L.length,firstPct:L.length?Math.round(100*L.filter(e=>e.f).length/L.length):null});}return out;}
const fmtDur=sec=>{sec=Math.round(sec);if(sec<60)return sec+'s';const h=Math.floor(sec/3600),m=Math.round((sec%3600)/60);return h?`${h}h ${m}m`:`${m}m`;};
