'use strict';
// DATA: Learn missions and "Explain it simply" for the KS2 SATs arithmetic topics (js/data/questions-sats.js).
// Same format as learning-more.js — the FIRST option is always the correct one (the app shuffles them).
(function(){
const M=(title,blocks,q,options,why)=>({title,blocks,check:{q,options,why}});
Object.assign(learnMissions,{
 arith_add:[
  M('Columns line up',[{p:'In column addition and subtraction, digits with the same <b>place value</b> go in the same column: ones under ones, tens under tens.'},{eg:'  4,736<br>+ 2,185<br>Ones 6 + 5 = 11 → write 1, carry 1 into the tens.'}],'What is 4,736 + 2,185?',['6,921','6,911','6,821','7,921'],'Ones 6 + 5 = 11 (carry 1); tens 3 + 8 + 1 = 12 (carry 1); hundreds 7 + 1 + 1 = 9; thousands 4 + 2 = 6 → 6,921.'),
  M('Exchanging when you subtract',[{p:'If the top digit is smaller, <b>exchange</b> 1 from the next column: 1 ten becomes 10 ones.'},{eg:'5,302 − 1,647: you can’t do 2 − 7, and there are no tens to exchange, so go to the hundreds: 3 hundreds → 2 hundreds and 10 tens → 9 tens and 10 ones.'}],'What is 5,302 − 1,647?',['3,655','4,345','3,665','4,655'],'After exchanging: ones 12 − 7 = 5, tens 9 − 4 = 5, hundreds 2 − 6 needs another exchange → 12 − 6 = 6, thousands 4 − 1 = 3 → 3,655.'),
  M('Decimals: line up the points',[{p:'Line up the <b>decimal points</b>. Fill empty places with zeros so both numbers have the same number of decimal places.'},{eg:'12 − 4.65 → 12.00 − 4.65 = 7.35'}],'What is 9 − 2.48?',['6.52','7.48','6.62','7.52'],'9.00 − 2.48 = 6.52. Check: 6.52 + 2.48 = 9.'),
  M('Negative numbers',[{p:'Use a number line. Adding moves right; subtracting moves left — you can go below zero.'},{eg:'4 − 9: from 4, 4 steps to 0, then 5 more → −5.<br>−6 + 10: 6 steps to 0, then 4 more → 4.'}],'What is 3 − 11?',['−8','8','−14','14'],'From 3, 3 steps reach 0, then 8 more steps below zero: −8.')],
 arith_mult:[
  M('Short multiplication',[{p:'For × a 1-digit number, multiply each digit from the right and <b>carry</b> into the next column.'},{eg:'376 × 4: 6 × 4 = 24 (write 4, carry 2); 7 × 4 = 28 + 2 = 30 (write 0, carry 3); 3 × 4 = 12 + 3 = 15 → 1,504.'}],'What is 258 × 3?',['774','664','754','684'],'8 × 3 = 24 (carry 2); 5 × 3 = 15 + 2 = 17 (carry 1); 2 × 3 = 6 + 1 = 7 → 774.'),
  M('Long multiplication',[{p:'For × a 2-digit number, make <b>two rows</b>: one for the ones digit and one for the tens digit, then add.'},{eg:'243 × 26<br>Row 1: 243 × 6 = 1,458<br>Row 2: 243 × 20 = 4,860<br>Total: 1,458 + 4,860 = <b>6,318</b>'},{mini:'In the real test this is worth 2 marks — and you can get 1 mark for correct working even with a slip.'}],'What is 152 × 23?',['3,496','3,040','456','3,486'],'152 × 3 = 456 and 152 × 20 = 3,040. 456 + 3,040 = 3,496.'),
  M('× 10, × 100, × 1,000',[{p:'Digits move <b>left</b>: one place for × 10, two for × 100, three for × 1,000. The decimal point stays still.'},{eg:'3.62 × 100 = 362 · 0.4 × 1,000 = 400'}],'What is 5.07 × 100?',['507','50.7','5,070','5.0700'],'Each digit moves two places left: 5.07 → 507.'),
  M('Squares and cubes',[{ul:['5² = 5 × 5 = 25 (squared)','3³ = 3 × 3 × 3 = 27 (cubed)','Know the squares up to 12² = 144 and the cubes of 2, 3, 4, 5 and 10.']}],'What is 4³?',['64','12','16','43'],'4 × 4 = 16, and 16 × 4 = 64.')],
 arith_div:[
  M('Short division (the bus stop)',[{p:'Divide from the <b>left</b>. Any remainder is carried to the next digit.'},{eg:'924 ÷ 4: 9 ÷ 4 = 2 r1 → 12 ÷ 4 = 3 → 4 ÷ 4 = 1 → <b>231</b>'}],'What is 735 ÷ 5?',['147','146','157','137'],'7 ÷ 5 = 1 r2 → 23 ÷ 5 = 4 r3 → 35 ÷ 5 = 7 → 147.'),
  M('Long division',[{p:'For ÷ a 2-digit number, <b>write out multiples first</b>, then work digit by digit.'},{eg:'4,368 ÷ 24 (24, 48, 72, 96, 120, 144, 168, 192…)<br>43 ÷ 24 = 1 r19 → 196 ÷ 24 = 8 r4 → 48 ÷ 24 = 2 → <b>182</b>'},{mini:'Also worth 2 marks in the real test. Show your working!'}],'What is 1,512 ÷ 14?',['108','18','180','118'],'15 ÷ 14 = 1 r1 → 11 ÷ 14 = 0 r11 → 112 ÷ 14 = 8 → 108.'),
  M('÷ 10, ÷ 100, ÷ 1,000',[{p:'Digits move <b>right</b>: one place for ÷ 10, two for ÷ 100, three for ÷ 1,000.'},{eg:'4,520 ÷ 100 = 45.2 · 37 ÷ 1,000 = 0.037'}],'What is 86 ÷ 100?',['0.86','8.6','0.086','860'],'Each digit moves two places right: 86 → 0.86.'),
  M('Dividing a decimal',[{p:'Do the division as normal and put the decimal point in the answer <b>directly above</b> the one in the question.'},{eg:'14.4 ÷ 6: 14 ÷ 6 = 2 r2 → 24 ÷ 6 = 4 → <b>2.4</b>'}],'What is 25.2 ÷ 7?',['3.6','36','3.06','0.36'],'25 ÷ 7 = 3 r4 → 42 ÷ 7 = 6 → 3.6. Check: 3.6 × 7 = 25.2.')],
 arith_frac:[
  M('Same denominators first',[{p:'You can only add or subtract fractions when the <b>denominators match</b>. Change one (or both) into an equivalent fraction.'},{eg:'2/3 + 1/4 → twelfths: 8/12 + 3/12 = <b>11/12</b>'}],'What is 1/2 + 1/3?',['5/6','2/5','2/6','1/6'],'1/2 = 3/6 and 1/3 = 2/6, so 3/6 + 2/6 = 5/6.'),
  M('Mixed numbers',[{p:'Add the whole numbers, then the fractions. If the fractions make more than 1, add it to the wholes.'},{eg:'2 3/4 + 1 1/2 → 3 and 3/4 + 2/4 = 5/4 = 1 1/4 → <b>4 1/4</b>'}],'What is 1 2/3 + 2 2/3?',['4 1/3','3 4/3','3 1/3','4 2/3'],'Wholes 1 + 2 = 3; fractions 2/3 + 2/3 = 4/3 = 1 1/3; total 4 1/3.'),
  M('Multiplying fractions',[{p:'Multiply the <b>tops</b>, multiply the <b>bottoms</b>. With a whole number, only the top is multiplied.'},{eg:'2/3 × 4/5 = 8/15 · 3/4 × 6 = 18/4 = 4 1/2'}],'What is 3/4 × 2/5?',['6/20 (= 3/10)','5/9','6/9','3/5'],'3 × 2 = 6 and 4 × 5 = 20 → 6/20, which simplifies to 3/10.'),
  M('Dividing by a whole number',[{p:'Sharing a fraction into equal parts makes each part smaller: <b>multiply the denominator</b>.'},{eg:'2/3 ÷ 4 = 2/12 = <b>1/6</b>'}],'What is 3/5 ÷ 3?',['1/5','9/5','3/15 (= 1/3)','1/15'],'3/5 ÷ 3 = 3/15, which simplifies to 1/5 (one third of three fifths is one fifth).')],
 arith_pct:[
  M('Percentages from 10% and 1%',[{ul:['10% → divide by 10','1% → divide by 100','5% → half of 10%','50% → half, 25% → a quarter']},{eg:'35% of 260 = 30% (78) + 5% (13) = 91'}],'What is 15% of 80?',['12','15','8','20'],'10% = 8 and 5% = 4, so 15% = 12.'),
  M('Order of operations',[{p:'<b>Brackets</b> first, then <b>powers</b>, then <b>× and ÷</b>, then <b>+ and −</b>.'},{eg:'20 − 3 × 4 = 20 − 12 = <b>8</b> (not 68!)'}],'What is 18 + 6 ÷ 3?',['20','8','12','24'],'Divide first: 6 ÷ 3 = 2, then 18 + 2 = 20.'),
  M('Brackets change the order',[{eg:'(5 + 3) × 2 = 8 × 2 = 16<br>5 + 3 × 2 = 5 + 6 = 11'}],'What is (9 − 4) × 6?',['30','-15','33','54'],'Brackets first: 9 − 4 = 5, then 5 × 6 = 30.'),
  M('Powers in a calculation',[{p:'Work out squares and cubes <b>before</b> × ÷ + −.'},{eg:'3² + 2 × 5 = 9 + 10 = 19'}],'What is 4² + 3?',['19','11','14','49'],'4² = 16, then 16 + 3 = 19.')]
});
Object.assign(explainers,{
 arith_add:[{m:/−\s*□|□/,idea:'The box is a missing piece. Ask: what do I take away (or add) to get from one number to the other? Use the inverse — the opposite operation.',check:'Put your number in the box and do the calculation. Do you get the number on the other side?'},
  {m:/\./,idea:'Decimals are just ones, tenths and hundredths. Line up the decimal points like a zip, add zeros to fill gaps, then add or subtract as normal.',check:'Estimate with whole numbers first — is your answer close?'},
  {m:/−\d|\d\s*−\s*\d/,idea:'Picture a number line. Taking away moves left — and you can go past zero into negative numbers.',check:'Add your answer to the number you took away. Do you get back to the start?'},
  {idea:'Line the numbers up in columns by place value. Work from the ones column, carrying or exchanging when a column needs it.',check:'Check addition with subtraction (or subtraction with addition).'}],
 arith_mult:[{m:/[²³]/,idea:'A little 2 means “times itself”; a little 3 means “times itself, then times itself again”.',check:'Is your answer bigger than the starting number? It should be (for numbers above 1).'},
  {m:/×\s*(10|100|1,000)\b/,idea:'Multiplying by 10, 100 or 1,000 slides every digit to the left; the decimal point stays where it is.',check:'Did the number get bigger by the right amount?'},
  {m:/×\s*\d\d\b/,idea:'Long multiplication is two short multiplications added together: one for the ones digit, one for the tens.',check:'Round both numbers and multiply. Is your answer close to the estimate?'},
  {idea:'Multiply each digit, starting with the ones, and carry into the next column.',check:'Estimate first by rounding — your answer should be close.'}],
 arith_div:[{m:/÷\s*(10|100|1,000)\b/,idea:'Dividing by 10, 100 or 1,000 slides every digit to the right, making the number smaller.',check:'Multiply your answer back by the same number — do you get the start?'},
  {m:/÷\s*\d\d\b/,idea:'Long division is like the bus stop, but with a bigger divisor. Write its first few multiples down so you can see how many fit.',check:'Multiply your answer by the divisor. You should get the number you started with.'},
  {idea:'Share from the left: how many times does it fit, and what is left over to carry to the next digit?',check:'Multiply your answer by the divisor to check.'}],
 arith_frac:[{m:/×/,idea:'Multiplying fractions: tops together, bottoms together. A whole number only multiplies the top.',check:'If you multiplied by a fraction less than 1, the answer should be smaller.'},
  {m:/÷/,idea:'Sharing a fraction into equal groups makes each piece smaller — multiply the denominator.',check:'Multiply your answer by the whole number. Do you get back to the start?'},
  {m:/of/,idea:'“Of” means find that fraction of the amount: divide by the bottom, multiply by the top.',check:'Is your answer smaller than the amount you started with?'},
  {idea:'To add or subtract fractions, the denominators must match. Change them into equivalent fractions first, then add or subtract the tops.',check:'Simplify your answer and check it is sensible — is it bigger or smaller than you expected?'}],
 arith_pct:[{m:/%/,idea:'Per cent means “out of 100”. 10% is a tenth and 1% is a hundredth — build any percentage from those.',check:'50% is half: is your answer the right size compared with half?'},
  {idea:'Calculations have an order: brackets, powers, × and ÷, then + and −. Don’t just go left to right!',check:'Underline the part you must do first, then work it out again.'}]
});
})();
