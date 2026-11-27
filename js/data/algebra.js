'use strict';
// LOGIC (2.86): marking answers that are not a single number — for GCSE and A level.
//  kind:'expr'  — an algebraic expression. q.ans is the model answer (e.g. '6x+10'), q.vars the letters (default ['x']).
//                 The child's answer is right if it has the same value at several random points; q.form can also ask for
//                 'expanded' (no brackets), 'factorised' (brackets) or 'surd' (keeps a √).
//  kind:'set'   — several numbers in any order (both solutions of a quadratic): q.vals, e.g. "x = 2, x = −1/3".
//  kind:'coord' — numbers in order, like a point or simultaneous equations: q.vals = [x, y], e.g. "(3, −2)" or "x=3, y=-2".
// For these, q.a is the first value (so older code that expects a number still works) and q.show is how to display it.
const Alg=(()=>{
 const clean=s=>String(s).toLowerCase().replace(/(\d)\s*[x×*]\s*10\s*\^/g,'$1*10^').replace(/[−–—]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g,m=>'^'+[...m].map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)<0?'-':'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''))
  .replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/\s+/g,'');
 function tokens(s){const t=[];let i=0;while(i<s.length){const c=s[i];
   if(/[0-9.]/.test(c)){let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;t.push({k:'n',v:parseFloat(s.slice(i,j))});i=j;continue;}
   if(s.startsWith('sqrt',i)){t.push({k:'f',v:'sqrt'});i+=4;continue;}if(s.startsWith('pi',i)){t.push({k:'n',v:Math.PI});i+=2;continue;}
   if(/[a-z]/.test(c)){t.push({k:'v',v:c});i++;continue;}if('+-*/^()'.includes(c)){t.push({k:c});i++;continue;}throw new Error('bad '+c);}
  // implicit multiplication: 2x, 3(x+1), (x+1)(x-2), x(…), 2sqrt3
  const out=[];for(let j=0;j<t.length;j++){const a=out[out.length-1],b=t[j];if(a&&(a.k==='n'||a.k==='v'||a.k===')')&&(b.k==='n'||b.k==='v'||b.k==='('||b.k==='f'))out.push({k:'*'});out.push(b);}return out;}
 function parse(str){const t=tokens(clean(str));let p=0;const peek=()=>t[p],eat=k=>{if(!t[p]||t[p].k!==k)throw new Error('expected '+k);return t[p++];};
  function expr(){let n=term();while(peek()&&(peek().k==='+'||peek().k==='-')){const o=t[p++].k;const r=term();const l=n;n=o==='+'?(e=>l(e)+r(e)):(e=>l(e)-r(e));}return n;}
  function term(){let n=unary();while(peek()&&(peek().k==='*'||peek().k==='/')){const o=t[p++].k;const r=unary();const l=n;n=o==='*'?(e=>l(e)*r(e)):(e=>l(e)/r(e));}return n;}
  function unary(){if(peek()&&peek().k==='-'){p++;const u=unary();return e=>-u(e);}if(peek()&&peek().k==='+'){p++;return unary();}return power();}
  function power(){const b=atom();if(peek()&&peek().k==='^'){p++;const x=unary();return e=>Math.pow(b(e),x(e));}return b;}
  function atom(){const k=peek();if(!k)throw new Error('end');
   if(k.k==='n'){p++;return()=>k.v;}if(k.k==='v'){p++;return e=>{if(!(k.v in e))throw new Error('letter '+k.v);return e[k.v];};}
   if(k.k==='f'){p++;const a=peek()&&peek().k==='('?(p++,(()=>{const x=expr();eat(')');return x;})()):atom();return e=>Math.sqrt(a(e));}
   if(k.k==='('){p++;const x=expr();eat(')');return x;}throw new Error('unexpected '+k.k);}
  const f=expr();if(p!==t.length)throw new Error('extra');return f;}
 const PTS=[1.37,-2.21,0.53,3.1,-0.77];
 function same(a,b,vars){let fa,fb;try{fa=parse(a);fb=parse(b);}catch(e){return null;}vars=vars&&vars.length?vars:['x'];
  for(let i=0;i<PTS.length;i++){const env={};vars.forEach((v,j)=>env[v]=PTS[(i+j)%PTS.length]+j*0.31);let x,y;try{x=fa(env);y=fb(env);}catch(e){return false;}
   if(!Number.isFinite(x)||!Number.isFinite(y))return false;if(Math.abs(x-y)>1e-6*Math.max(1,Math.abs(y)))return false;}return true;}
 // numbers in an answer like "x = 2, x = -1/3", "(3, -2)", "2 and 0.5"
 function numbers(raw){const s=String(raw).replace(/[−–—]/g,'-').replace(/\band\b|or|;/gi,',').replace(/[a-z]\s*=/gi,'').replace(/[()]/g,'');
  return s.split(',').map(x=>x.trim()).filter(Boolean).map(x=>{if(/^-?\d*\.?\d+\s*\/\s*-?\d*\.?\d+$/.test(x)){const[a,b]=x.split('/');return +a/ +b;}
   if(/sqrt|√/.test(x)){try{return parse(x)({});}catch(e){return NaN;}}return +x;});}
 const close=(a,b,tol)=>Math.abs(a-b)<=tol;
 function judgeSet(c,raw,ordered){const got=numbers(raw);if(!got.length||got.some(v=>!Number.isFinite(v)))return 'empty';const want=c.vals.slice();if(got.length!==want.length)return 'wrong';
  const tol=c.tol!==undefined?c.tol:0.006;if(ordered)return want.every((w,i)=>close(got[i],w,tol))?'ok':'wrong';
  const left=got.slice();for(const w of want){const i=left.findIndex(g=>close(g,w,tol));if(i<0)return 'wrong';left.splice(i,1);}return 'ok';}
 function judgeExpr(c,raw){let t=String(raw).trim();if(!t)return 'empty';t=t.replace(/^[a-z]\s*=\s*/i,'');const ok=same(t,c.ans,c.vars);if(ok===null)return 'wrong';if(!ok)return 'wrong';
  const s=clean(t);if(c.form==='expanded'&&s.includes('('))return 'expandit';if(c.form==='factorised'&&!s.includes('('))return 'factoriseit';if(c.form==='surd'&&!s.includes('sqrt'))return 'surdit';if(c.form==='stdform'&&!/^-?[1-9](\.\d+)?\*10\^\(?-?\d+\)?$/.test(s))return 'stdformit';return 'ok';}
 return {parse,same,numbers,judgeSet,judgeExpr,clean};
})();
// the app's judge() learns the new kinds; everything else is marked as before
{const base=judge;judge=function(c,raw){if(c&&c.kind==='expr')return Alg.judgeExpr(c,raw);if(c&&(c.kind==='set'||c.kind==='coord')){if(!String(raw).trim())return 'empty';return Alg.judgeSet(c,raw,c.kind==='coord');}return base(c,raw);};}
