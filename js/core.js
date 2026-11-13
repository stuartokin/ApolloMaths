'use strict';
// CORE: shared maths helpers and the question registry. No DOM, no HTML.
// QDIFF leans the numbers a question uses: −1 smaller (warm-up), 0 even, +1 bigger (stretch). Only set while a question is being made.
var QDIFF=0;
const R=(a,b)=>{let t=Math.random();if(QDIFF>0)t=1-(1-t)*(1-t);else if(QDIFF<0)t=t*t;return Math.floor(t*(b-a+1))+a;};
const pick=a=>a[R(0,a.length-1)];
const money=n=>'£'+n.toFixed(2).replace(/\.00$/,'');
const hcf=(a,b)=>b?hcf(b,a%b):Math.abs(a);
const lcm=(a,b)=>a/hcf(a,b)*b;
// A question: q = text, a = numeric answer, u = unit, h = 3 hints, s = worked steps.
// Optional extras (added with X): fig = figure spec, kind = 'frac' | 'time' | 'text', exact = required written form, alts = accepted words, show = how to display the answer.
function Q(q,a,u,h,s){return {q,a,u,h,s};}
const calc=(q,a,u,idea,plan,first,steps)=>Q(q,a,u,[idea,plan,first],steps);
const X=(q,extra)=>Object.assign(q,extra);
// Figure spec builder: data says WHAT to draw (e.g. F('cuboid',5,3,4,labels)); the render layer decides HOW.
const F=(...a)=>a;
const topics={};
const bank={};
const mk=(id,gen)=>{(bank[id] ||= []).push(gen)};
const scenarios=['Liverpool’s training ground','Apollo’s comic collection','a brilliant superhero academy','the Anfield souvenir shop','the school science club','a football tournament','a comic-book villain’s lair','the stadium snack stand'];
const scene=()=>pick(scenarios);
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const hhmm=x=>String(Math.floor(((x%1440)+1440)%1440/60)).padStart(2,'0')+':'+String(((x%60)+60)%60).padStart(2,'0');
