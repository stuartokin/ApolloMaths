'use strict';
// DIFFICULTY: every question type is rated easy (0), medium (1) or hard (2) within its topic, by sampling it —
// how many working steps it needs, how big its numbers are and how long the problem is. Types can also set fn.diff.
// Practice adapts like the real ISEB Pre-Test: three right first time in a row steps up, two misses step down.
function rateQuestionTypes(){for(const [tp,list] of Object.entries(bank)){const scored=list.map(g=>{if(g.diff!==undefined)return{g,sc:null};let sc=0,n=0;const save=QDIFF;QDIFF=0;
  for(let i=0;i<6;i++){let q;try{q=g();}catch(e){continue;}if(!q)continue;const steps=Array.isArray(q.s)?q.s.length:1,dig=String(Math.abs(Math.round(+q.a||0))).length;sc+=steps+dig*.6+String(q.q||'').length/90;n++;}QDIFF=save;return{g,sc:n?sc/n:1};});
  const vals=scored.filter(x=>x.sc!==null).map(x=>x.sc).sort((a,b)=>a-b),q1=vals[Math.floor(vals.length/3)],q2=vals[Math.floor(2*vals.length/3)];
  scored.forEach(x=>{if(x.sc!==null)x.g.diff=vals.length<3?1:x.sc<q1?0:x.sc<q2?1:2;});}}
// the child's level for their current exam: 0 warm-up, 1 standard, 2 stretch
function adaptState(){if(typeof stats==='undefined')return{lvl:1,run:0,miss:0};const A=(stats.adapt=stats.adapt&&typeof stats.adapt==='object'?stats.adapt:{}),k=typeof examId==='function'?examId():'all';return A[k]||(A[k]={lvl:1,run:0,miss:0});}
function curLevel(mode){return mode==='warmup'?0:mode==='boss'?2:adaptState().lvl;}
const LEVEL_NAMES=['Warm-up','Standard','Stretch'];
function diffFilter(arr,permitted,mode){const L=curLevel(mode),pref=L===0?[0]:L===2?[2]:[1],ok=[...pref,...(L===0?[1]:L===2?[1]:[0,2])];
 const first=permitted.filter(i=>pref.includes(arr[i].diff));if(first.length&&Math.random()<.75)return first;const second=permitted.filter(i=>ok.includes(arr[i].diff));return second.length?second:permitted;}
function setQDiff(mode){QDIFF=curLevel(mode)-1;}
function adaptRecord(first,skipped){const s=adaptState();if(first){s.run++;s.miss=0;if(s.run>=3&&s.lvl<2){s.lvl++;s.run=0;if(typeof toast==='function')toast(`⬆️ Stepping up — ${LEVEL_NAMES[s.lvl]} questions now!`);}}
 else{s.miss++;s.run=0;if(s.miss>=2&&s.lvl>0){s.lvl--;s.miss=0;if(typeof toast==='function')toast(`Back to ${LEVEL_NAMES[s.lvl]} for a moment — you’ve got this.`);}}if(typeof save==='function')save(false);}
// questions that are too easy by accident are thrown away and made again: equal ratio parts, n/n fractions, × 1 or + 0
function qOK(q){const t=String(q&&q.q||'');if(/\b(\d+)\s*:\s*\1\b/.test(t))return false;if(/\b(\d+)\/\1\b/.test(t))return false;if(/[×x]\s*1\b(?![.,\d])|\+\s*0\b(?![.,\d])/.test(t))return false;return true;}
window.addEventListener('load',()=>{try{rateQuestionTypes();}catch(e){console.warn('difficulty rating',e);}});
