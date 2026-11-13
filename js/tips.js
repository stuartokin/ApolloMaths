'use strict';
// PRESENTATION: hover help. On a computer, hovering (or keyboard focus) over a setting shows a plain-English
// explanation. On touch screens a small ⓘ button sits beside each setting in Admin, the Parent dashboard and Voices.
// Tips are listed once here and attached automatically, including inside windows that are drawn on the fly.
const Tips=(()=>{
 // [CSS selector, tip text, where to attach: 'label' (the setting's label) or 'self']
 const T=[
  // ---------- Admin: arcade rules ----------
  ['#aEnabled','Switch the hidden arcade on or off for this player. Off means the secret code does nothing for them.','label'],
  ['#aExam','On the day of the exam (set in the Parent dashboard → Settings) the arcade stays closed.','label'],
  ['#aUnlockMins','How many minutes of active learning or questions are needed each day before the arcade opens. Idle time does not count.','label'],
  ['#aUnlockCorrect','How many questions must be answered correctly today before the arcade opens. 0 = not required.','label'],
  ['#aUnlockFocus','How many Focus Zone questions must be answered correctly today before the arcade opens. 0 = not required.','label'],
  ['#aLesson','If ticked, a Learn mission must be finished today before the arcade opens.','label'],
  ['#aPlan','If ticked, every task in Today’s plan must be done before the arcade opens.','label'],
  ['input[name=aMode][value=earned]','Play time is earned from learning: every few minutes of maths earns one minute of play (set the rate below).','label'],
  ['#aEarn','The earning rate. For example 3 means every 3 minutes of maths earns 1 minute of play.','label'],
  ['input[name=aMode][value=fixed]','Once unlocked, the player can use the whole daily allowance without having to earn it minute by minute.','label'],
  ['#aSession','The longest single go in the arcade. Several games can be played inside one session.','label'],
  ['#aBreak','How long the player must wait after a session ends before starting another.','label'],
  ['#aDay','The most arcade time allowed in one day (plus any one-off treat you give).','label'],
  ['#aWeek','The most arcade time allowed from Monday to Sunday.','label'],
  ['[data-day]','Untick a day to keep the arcade closed on that day of the week.','label'],
  ['#aFrom','The arcade is only open between these times (for example, not late in the evening).','label'],
  ['#aCarry','If the player leaves the arcade early, the unused time is saved and added to their next session, so they don’t miss out.','label'],
  ['#aMaxCarry','The most unused time that can be saved for later.','label'],
  ['#aResume','If the app is refreshed or reopened within this many minutes, the session clock carries on instead of starting again. 0 = always start a new session.','label'],
  ['[data-adm=saverules]','Save the rules above for the player chosen at the top.','self'],
  ['[data-adm=defaults]','Put every arcade rule back to its starting setting (you still need to press Save).','self'],
  ['[data-bonus]','Give extra arcade minutes for today only — a one-off treat.','self'],
  ['[data-adm=resetday]','Clear today’s arcade use, as if the player hasn’t played today.','self'],
  ['[data-adm=endbreak]','End the current break so the player can start a new session straight away.','self'],
  ['[data-adm=clearbank]','Remove any unused arcade time that has been saved for the next session.','self'],
  ['#admWho','Choose which player these rules or this history belong to. Each player has their own.','label'],
  ['[data-atab=rules]','When and how much the hidden arcade can be played.','self'],
  ['[data-atab=history]','Every arcade session: when, which game, how long and the score.','self'],
  ['[data-atab=words]','Change the secret words, the number codes and your Admin PIN.','self'],
  ['[data-atab=locks]','Lock the Parent dashboard and “Reset progress” behind your PIN.','self'],
  ['[data-atab=play]','Play the arcade yourself without limits. Your games don’t count against anyone’s allowance.','self'],
  ['#wKid','The word the child types into the answer box to open the arcade. Spaces and capitals don’t matter.','label'],
  ['#wAdmin','Your word for opening Admin. Keep it different from the child’s word.','label'],
  ['#cKid','A number version of the arcade code, for tablets that only show a number keypad. Must start with 00 and be 6–10 digits.','label'],
  ['#cAdmin','A number version of your Admin code. Must start with 00 and be 6–10 digits.','label'],
  ['#wPin','Your Admin PIN (4–8 digits). It is stored scrambled on this device.','label'],
  ['#lParent','If ticked, the Parent dashboard asks for your PIN before opening.','label'],
  ['#lReset','If ticked, “Reset saved progress” asks for your PIN first.','label'],
  // ---------- Parent dashboard ----------
  ['[data-ptab=overview]','A summary: time on the app, accuracy, help used, Fix-it progress, points and Focus readiness.','self'],
  ['[data-ptab=focus]','Choose the five Focus topics. The app suggests five based on scores and learning.','self'],
  ['[data-ptab=learning]','Proof of learning: lessons finished, quick-check accuracy, reading time and examples studied.','self'],
  ['[data-ptab=time]','Active time per day for the last 14 days, split into questions, learning, shop and arcade.','self'],
  ['[data-ptab=topics]','How ready the child is in every topic, with time spent and help used.','self'],
  ['[data-ptab=types]','Every question type, how it is going, and the exact wrong answers typed — shows the misunderstanding.','self'],
  ['[data-ptab=mocks]','Every online mock and any paper mock scores you have added.','self'],
  ['[data-ptab=shop]','What has been bought in the Shop and time spent there.','self'],
  ['[data-ptab=activity]','The last 150 questions answered, newest first.','self'],
  ['[data-ptab=settings]','Exam name and date, downloads (CSV files) and a printable report.','self'],
  ['#pdWho','Choose which player’s progress to look at.','label'],
  ['[data-usesug]','Tick the five suggested topics (you still need to press Save).','self'],
  ['[data-fz]','Tick exactly five topics to be the Focus areas.','self'],
  ['[data-savefocus]','Make the ticked topics the Focus areas straight away. Saved with this player’s progress.','self'],
  ['[data-defocus]','Go back to the starting five Focus areas (you still need to press Save).','self'],
  ['#exName','The name of the exam shown in the countdown and on reports.','label'],
  ['#exDate','The exam date. The countdown and Today’s plan follow it (lighter work the day before).','label'],
  ['[data-saveexam]','Save the exam name and date.','self'],
  ['[data-csv]','Download a spreadsheet file (CSV) you can open in Excel or Google Sheets.','self'],
  ['[data-report]','Open a printable progress report.','self'],
  ['[data-printmock]','Print a 25-question paper mock with working space and a mark scheme.','self'],
  ['#pmScore','The mark from a printed paper mock, to track progress over time.','label'],
  ['[data-addpaper]','Add this paper mock score to the Mocks tab.','self'],
  // ---------- Voices ----------
  ['[data-v=announce]','Read out celebrations, tips and answer feedback in the announcer’s voice. Same as the 🔊 button at the top.','label'],
  ['[data-v=icons]','Show the 🔊 buttons for reading questions, explainers, methods, lessons and examples aloud.','label'],
  ['[data-v=tour]','The guided tour reads each step aloud and moves on by itself.','label'],
  ['input[name=vGender]','Automatic voices prefer this gender, using the most natural-sounding voices on this device.','label'],
  ['input[name=vRate]','How fast all the voices speak.','label'],
  ['select[data-role]','Pick any voice on this device for this job, or leave on Automatic. Saved for this player.','self'],
  // ---------- Main screen ----------
  ['#muteBtn','Turn spoken announcements on or off.','self'],
  ['#voiceBtn','Choose voices, speed and the read-aloud settings.','self'],
  ['#switchPlayer','Change to another player on this device. Each player has their own progress.','self'],
  ['#dashboardToggle','Progress, Focus areas, time, mistakes, mocks and settings for parents.','self'],
  ['#openBtn','Load a saved progress file — on another device, or a friend’s file into their own player.','self'],
  ['#reset','Clear this player’s progress on this device. Their saved file is not affected.','self'],
  ['#hint','Three hints, each a bit more help. Using hints gives fewer points.','self'],
  ['#explainBtn','Puts the question into everyday words without giving the answer away.','self'],
  ['#showSolution','Shows the full worked method. Then “Prove it!” gives a twin question for bonus points.','self'],
  ['#scratchBtn','A drawing pad for working things out with a finger, pen or mouse.','self'],
  ['#focusMix','Questions from the five Focus areas only — they earn bonus points and streaks.','self'],
  ['#printMockBtn','Print a 25-question paper with working space and a mark scheme, like the handwritten Stage 2 test.','self'],
 ];
 const touch=()=>window.matchMedia('(hover:none)').matches;
 let bub=null,hideT=0;
 function show(el,txt){clearTimeout(hideT);if(!bub){bub=document.createElement('div');bub.className='tipbub';bub.setAttribute('role','tooltip');document.body.appendChild(bub);}
  const host=el.closest('dialog[open]');if(host&&bub.parentNode!==host)host.appendChild(bub);else if(!host&&bub.parentNode!==document.body)document.body.appendChild(bub);
  bub.textContent=txt;bub.classList.add('on');const r=el.getBoundingClientRect(),bw=Math.min(300,innerWidth-16);bub.style.maxWidth=bw+'px';
  const bh=bub.offsetHeight,below=r.bottom+8+bh<innerHeight;bub.style.left=Math.max(8,Math.min(innerWidth-bub.offsetWidth-8,r.left))+'px';bub.style.top=(below?r.bottom+8:Math.max(8,r.top-bh-8))+'px';}
 function hide(){hideT=setTimeout(()=>bub&&bub.classList.remove('on'),80);}
 function apply(root=document){for(const[sel,txt,where]of T){root.querySelectorAll(sel).forEach(el=>{const tgt=where==='label'?(el.closest('label')||el):el;if(tgt.dataset.tip)return;tgt.dataset.tip=txt;if(tgt.title){tgt.removeAttribute('title');}
   if(where==='label'&&tgt.closest('dialog')&&!tgt.querySelector('.tipi')){const b=document.createElement('button');b.type='button';b.className='tipi';b.textContent='ⓘ';b.setAttribute('aria-label','What does this do?');tgt.appendChild(b);}});}}
 let pend=0;const later=()=>{if(pend)return;pend=requestAnimationFrame(()=>{pend=0;apply();});};
 function init(){apply();new MutationObserver(later).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('mouseover',e=>{if(touch())return;const el=e.target.closest('[data-tip]');if(el)show(el,el.dataset.tip);});
  document.addEventListener('mouseout',e=>{if(touch())return;const el=e.target.closest('[data-tip]');if(el&&!el.contains(e.relatedTarget))hide();});
  document.addEventListener('focusin',e=>{if(touch())return;const el=e.target.closest('[data-tip]');if(el)show(el,el.dataset.tip);});
  document.addEventListener('focusout',()=>{if(!touch())hide();});
  document.addEventListener('click',e=>{const b=e.target.closest('.tipi');if(b){e.preventDefault();e.stopPropagation();const el=b.closest('[data-tip]');if(bub&&bub.classList.contains('on')&&bub.textContent===el.dataset.tip)hide();else show(el,el.dataset.tip);return;}if(touch())hide();},true);
  window.addEventListener('scroll',()=>bub&&bub.classList.remove('on'),true);}
 return{init,apply,list:()=>T};
})();
