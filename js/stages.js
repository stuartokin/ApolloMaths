'use strict';
// STAGES (2.83): layers for key stages, school years and SATs, wrapped around app.js (never rewriting it).
// - topics that belong to other exams (topics[k].exams, e.g. SATs arithmetic) are hidden from the topic grid;
// - a mock for an exam whose mock lists topics (SATs Paper 1: arithmetic) only uses those topics;
// - mocks with marks (SATs: long multiplication and long division are worth 2) are scored in marks as well.
(function(){
 const gated=k=>topics[k]&&Array.isArray(topics[k].exams);
 const offExam=k=>gated(k)&&typeof examWeight==='function'&&examWeight(k)===0;
 const mockTopics=()=>{const m=typeof examMock==='function'?examMock():null;return m&&Array.isArray(m.topics)?m.topics.filter(k=>bank[k]&&bank[k].length):null;};
 // topic grid: hide topics from another exam
 {const base=drawTopics;drawTopics=function(){base.apply(this,arguments);document.querySelectorAll('#topics [data-topic]').forEach(b=>{if(offExam(b.dataset.topic))b.classList.add('hidden');});};}
 // a chosen topic from another exam (e.g. after the exam changed) falls back to mixed practice
 {const base=newQuestion;newQuestion=function(){if(offExam(chosenTopic))chosenTopic='mixed';return base.apply(this,arguments);};}
 // mocks keep to the exam's own paper
 {const base=randomTopic;randomTopic=function(arr){const mt=mode==='mock'?mockTopics():null;if(mt&&mt.length)return base(mt);return arr===undefined?base():base(arr);};}
 // marks per question (fn.mk, default 1)
 const marksOf=c=>{try{const g=bank[c.topic][c.generator];return g&&g.mk?g.mk:1;}catch(e){return 1;}};
 {const base=record;record=function(){const r=base.apply(this,arguments);try{const it=sessionLog[sessionLog.length-1];if(it&&current)it.mk=marksOf(current);}catch(e){}return r;};}
 {const base=finishSession;finishSession=function(){const wasMock=mode==='mock'&&!finished,m=typeof examMock==='function'?examMock():{},r=base.apply(this,arguments);
  if(wasMock&&m.marks&&sessionLog.length){const of=sessionLog.reduce((n,x)=>n+(x.mk||1),0),got=sessionLog.reduce((n,x)=>n+(x.correct&&!x.skipped?(x.mk||1):0),0),last=stats.mocks[stats.mocks.length-1];
   if(last){last.mk=got;last.mkOf=of;save();}const fb=get('feedback');if(fb)fb.insertAdjacentHTML('beforeend',`<br><b>📝 ${esc(m.paper||'Marks')}: ${got} out of ${of} marks.</b> In the real paper long multiplication and long division are worth 2 marks each.`);}
  return r;};}
})();
