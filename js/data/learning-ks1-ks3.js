'use strict';
// DATA: Learn missions and "Explain it simply" for KS1 (questions-ks1.js) and KS3 (questions-ks3.js) topics.
// Same format as learning-more.js — the FIRST option is always the correct one (the app shuffles them).
(function(){
const M=(title,blocks,q,options,why)=>({title,blocks,check:{q,options,why}});
Object.assign(learnMissions,{
 ks1_number:[
  M('Counting carefully',[{p:'Touch each one as you count, and say one number for each.'},{fig:F('counters',8,'🍎')}],'How many apples are there?',['8','7','9','10'],'Five in the top row and three more: 8.'),
  M('Tens and ones',[{p:'A tall stick is <b>10</b>. A small cube is <b>1</b>.'},{fig:F('tens',3,4)},{eg:'3 tens and 4 ones = 30 + 4 = <b>34</b>'}],'What is 5 tens and 2 ones?',['52','25','7','502'],'5 tens = 50, and 2 more is 52.'),
  M('Number lines',[{p:'Find what the line counts up in, then count on.'},{fig:F('numline',0,20,5,15)}],'What number is in the box?',['15','10','5','20'],'The line counts in 5s: 0, 5, 10, 15.'),
  M('Counting in 2s, 5s and 10s',[{ul:['2s: 2, 4, 6, 8, 10 …','5s: 5, 10, 15, 20 …','10s: 10, 20, 30, 40 …']}],'What comes next? 15, 20, 25, ?',['30','26','35','40'],'It goes up in 5s: 25 + 5 = 30.')],
 ks1_calc:[
  M('Counting on',[{p:'Start with the BIGGER number and count on.'},{eg:'3 + 9 → start at 9, count on 3: 10, 11, <b>12</b>'}],'What is 4 + 8?',['12','11','13','48'],'Start at 8 and count on 4: 9, 10, 11, 12.'),
  M('Number bonds',[{ul:['To 10: 1+9, 2+8, 3+7, 4+6, 5+5','To 20: 11+9, 12+8, 13+7 …']},{eg:'If 6 + 4 = 10, then 16 + 4 = <b>20</b>'}],'What goes with 7 to make 10?',['3','4','17','2'],'7 + 3 = 10.'),
  M('Taking away',[{p:'Count back from the bigger number, or count up from the smaller one.'},{eg:'14 − 6 → count up from 6 to 14: that is <b>8</b>'}],'What is 15 − 7?',['8','9','22','7'],'Count up from 7 to 15: 8 steps.'),
  M('Two-digit numbers',[{p:'Add the tens, then add the ones.'},{eg:'34 + 25 → 30 + 20 = 50, 4 + 5 = 9 → <b>59</b>'}],'What is 42 + 36?',['78','68','79','88'],'40 + 30 = 70 and 2 + 6 = 8, so 78.')],
 ks1_mult:[
  M('Equal groups',[{p:'An array shows equal rows. Count in the row size.'},{fig:F('array',3,5)},{eg:'3 rows of 5 → 5, 10, <b>15</b>'}],'How many dots? (3 rows of 5)',['15','8','35','12'],'Count in 5s three times: 5, 10, 15.'),
  M('Doubling and halving',[{p:'Double means two lots. Half means split into 2 equal groups.'},{eg:'Double 6 = 12 · Half of 12 = 6'}],'What is half of 16?',['8','32','6','4'],'8 + 8 = 16, so half of 16 is 8.'),
  M('2, 5 and 10 times tables',[{ul:['× 2: double it','× 10: put a 0 on the end','× 5: half of × 10']}],'What is 7 × 5?',['35','12','70','30'],'7 × 10 = 70, and half of 70 is 35.'),
  M('Sharing',[{p:'Sharing equally: everyone gets the same. It is the same as dividing.'},{eg:'12 sweets shared between 3 → 4 each. 12 ÷ 3 = 4'}],'20 sweets shared between 2. How many each?',['10','22','18','40'],'Half of 20 is 10.')],
 ks1_measure:[
  M('O’clock and half past',[{p:'The short hand shows the hour. The long hand on 12 = o’clock; on 6 = half past.'},{fig:F('clock',3,30)}],'What time is shown?',['Half past 3','3 o’clock','Half past 6','6 o’clock'],'The long hand is on 6 (half past) and the short hand is just past 3.'),
  M('Quarter past and quarter to',[{p:'Long hand on 3 = quarter past. Long hand on 9 = quarter to.'},{fig:F('clock',7,15)}],'What time is shown?',['Quarter past 7','Quarter to 7','Quarter past 3','7 o’clock'],'The long hand is on 3: quarter past 7.'),
  M('Counting money',[{p:'Start with the biggest coin and count on.'},{fig:F('coins',[20,10,5,2])},{eg:'20p + 10p = 30p, + 5p = 35p, + 2p = <b>37p</b>'}],'How much is 50p + 20p + 1p?',['71p','70p','61p','73p'],'50 + 20 = 70, and 1 more is 71p.'),
  M('Change',[{p:'Count on from the price to the money you pay.'},{eg:'Costs 13p, pay 20p → 13 to 20 is <b>7p</b>'}],'A sweet costs 6p. You pay 10p. Change?',['4p','16p','6p','3p'],'Count on from 6 to 10: 4p.')],
 ks1_shape:[
  M('2D shapes',[{table:{head:['Shape','Sides','Corners'],rows:[['Triangle','3','3'],['Square','4','4'],['Rectangle','4','4'],['Pentagon','5','5'],['Hexagon','6','6']]}}],'How many sides does a pentagon have?',['5','6','4','8'],'A pentagon has 5 sides.'),
  M('Halves and quarters',[{p:'A half is 1 of 2 <b>equal</b> parts. A quarter is 1 of 4 equal parts.'},{fig:F('fracshape','circle',4,1)}],'What fraction is shaded? (1 of 4 equal parts)',['1/4','1/2','4','1/3'],'One of four equal parts is one quarter.'),
  M('Half of a number',[{p:'Share into 2 equal groups.'},{eg:'Half of 10 = 5 · Half of 18 = 9'}],'What is half of 14?',['7','28','6','12'],'7 + 7 = 14.'),
  M('Thirds and three quarters',[{p:'Find one part first, then take as many parts as you need.'},{eg:'1/3 of 12 = 4 · 3/4 of 8 → 1/4 is 2, so 3/4 is <b>6</b>'}],'What is 3/4 of 12?',['9','3','4','8'],'1/4 of 12 = 3, so 3/4 = 9.')],
 ks3_number:[
  M('Negative numbers',[{ul:['+ × + = +, − × − = +','+ × − = −, − × + = −','Subtracting a negative = adding']},{eg:'−3 − (−8) = −3 + 8 = <b>5</b> · (−4) × (−6) = <b>24</b>'}],'What is (−7) × 3?',['−21','21','−10','4'],'Different signs give a negative: −21.'),
  M('Powers and roots',[{p:'Powers come before × and ÷ (BIDMAS).'},{eg:'2⁴ = 16 · √81 = 9 · 3² + 4 × 2 = 9 + 8 = <b>17</b>'}],'What is 2³ + √49?',['15','13','56','17'],'2³ = 8 and √49 = 7, so 15.'),
  M('HCF and LCM',[{p:'<b>HCF</b>: the biggest number that divides both. <b>LCM</b>: the smallest number both divide into.'},{eg:'12 and 18 → HCF 6, LCM 36'}],'What is the HCF of 20 and 30?',['10','5','60','2'],'10 divides both, and nothing bigger does.'),
  M('Significant figures',[{p:'Count from the first non-zero digit. Look at the next digit to round.'},{eg:'0.004 72 to 2 s.f. = <b>0.0047</b> · 38 649 to 1 s.f. = <b>40 000</b>'}],'Round 6 381 to 1 significant figure.',['6 000','6 400','6','7 000'],'The first significant figure is 6 (thousands); next digit 3 → round down: 6 000.')],
 ks3_algebra:[
  M('Solving equations',[{p:'Do the same thing to both sides to get x on its own.'},{eg:'5x − 3 = 22 → 5x = 25 → <b>x = 5</b>'}],'Solve 3x + 4 = 19.',['5','7.67','15','6'],'3x = 15, so x = 5.'),
  M('Unknowns on both sides',[{p:'Move the smaller x term first.'},{eg:'7x + 2 = 3x + 18 → 4x + 2 = 18 → 4x = 16 → <b>x = 4</b>'}],'Solve 5x + 1 = 2x + 13.',['4','2','14','3'],'3x + 1 = 13, 3x = 12, x = 4.'),
  M('The nth term',[{p:'The common difference goes in front of n. Then adjust with a number.'},{eg:'5, 8, 11, 14 → difference 3 → 3n + 2'}],'What is the nth term of 4, 9, 14, 19?',['5n − 1','5n + 4','4n + 5','n + 5'],'Difference 5: 5n gives 5, 10, 15 — subtract 1.'),
  M('Substitution',[{p:'Put the numbers in place of the letters. Use brackets for negatives.'},{eg:'a = −2: 3a² = 3 × (−2)² = 3 × 4 = <b>12</b>'}],'If x = 4, what is 2x² − 5?',['27','59','11','3'],'x² = 16, 2 × 16 = 32, 32 − 5 = 27.')],
 ks3_ratio:[
  M('Percentage multipliers',[{ul:['Increase by 15% → × 1.15','Decrease by 20% → × 0.8','Find 35% → × 0.35']}],'What multiplier decreases by 12%?',['0.88','1.12','0.12','0.8'],'100% − 12% = 88% = 0.88.'),
  M('Reverse percentages',[{p:'Find what percentage the new amount is, then go back to 100%.'},{eg:'After 25% off it costs £60 → £60 = 75% → 1% = £0.80 → 100% = <b>£80</b>'}],'After a 10% rise a ticket costs £33. What was the old price?',['£30','£29.70','£36.30','£23'],'£33 is 110%, so 1% = £0.30 and 100% = £30.'),
  M('Sharing in a ratio',[{eg:'£90 in the ratio 2 : 3 : 4 → 9 parts → £10 each → £20, £30, £40'}],'Share £60 in the ratio 1 : 2 : 3. What is the largest share?',['£30','£20','£10','£180'],'6 parts → £10 each → 3 × £10 = £30.'),
  M('Compound measures',[{ul:['Speed = distance ÷ time','Density = mass ÷ volume','Change minutes into hours: 45 min = 0.75 h']}],'A cyclist rides 30 km in 1 h 30 min. Average speed?',['20 km/h','45 km/h','23 km/h','30 km/h'],'1 h 30 min = 1.5 h; 30 ÷ 1.5 = 20 km/h.')],
 ks3_geometry:[
  M('Polygon angles',[{p:'Exterior angles add to 360°. Interior + exterior = 180°.'},{eg:'Regular hexagon: exterior 360 ÷ 6 = 60°, interior 120°'}],'Interior angle of a regular octagon?',['135°','45°','108°','120°'],'Exterior = 360 ÷ 8 = 45°, interior = 180 − 45 = 135°.'),
  M('Parallel lines',[{ul:['Alternate angles (Z) are equal','Corresponding angles (F) are equal','Co-interior angles (C) add to 180°']}],'Co-interior angle to 70°?',['110°','70°','20°','290°'],'Co-interior angles add to 180°: 110°.'),
  M('Circles',[{ul:['Circumference = π × d','Area = π × r²','r is half of d']},{eg:'r = 5: area = 3.14 × 25 = 78.5 cm²'}],'Area of a circle with radius 3 cm (π = 3.14)?',['28.26 cm²','18.84 cm²','9.42 cm²','113.04 cm²'],'3.14 × 9 = 28.26 cm².'),
  M('Pythagoras',[{p:'In a right-angled triangle, a² + b² = c², where c is the hypotenuse (the longest side).'},{eg:'6 and 8 → 36 + 64 = 100 → c = <b>10</b>'}],'Shorter sides 9 and 12. Hypotenuse?',['15','21','225','13'],'81 + 144 = 225, √225 = 15.')],
 ks3_stats:[
  M('Probability adds to 1',[{p:'The probabilities of all the outcomes add up to 1.'},{eg:'P(rain) = 0.3 → P(no rain) = 0.7'}],'P(red) = 0.45. What is P(not red)?',['0.55','0.45','1.45','0.65'],'1 − 0.45 = 0.55.'),
  M('Expected frequency',[{eg:'P(six) = 1/6, roll 120 times → expect 120 ÷ 6 = <b>20</b> sixes'}],'P(heads) = 0.5. Expected heads in 70 throws?',['35','70','0.5','140'],'0.5 × 70 = 35.'),
  M('Averages',[{ul:['Mean: total ÷ how many','Median: middle value (in order)','Mode: most common','Range: highest − lowest']}],'Median of 3, 9, 4, 7, 12?',['7','4','8','9'],'In order: 3, 4, 7, 9, 12 — the middle is 7.'),
  M('Two dice',[{p:'There are 6 × 6 = 36 equally likely outcomes. Count the ones you want.'},{eg:'Total 4: (1,3), (2,2), (3,1) → 3/36 = <b>1/12</b>'}],'Probability of a total of 2 with two dice?',['1/36','1/6','2/36','1/12'],'Only (1,1) makes 2: 1 out of 36.')]
});
Object.assign(explainers,{
 ks1_number:[{idea:'Numbers are made of tens and ones. Counting carefully, one at a time, is the secret!',check:'Count again a different way — do you get the same?'}],
 ks1_calc:[{m:/−/,idea:'Taking away means some go. Count back, or count up from the smaller number.',check:'Add your answer to the number taken away — do you get back to the start?'},{idea:'Adding puts groups together. Start with the bigger number and count on.',check:'Count on again from the other number. Same answer?'}],
 ks1_mult:[{idea:'Multiplying is adding equal groups. Count in 2s, 5s or 10s.',check:'Count the groups again: does each one have the same number?'}],
 ks1_measure:[{m:/clock/,idea:'The short hand is the hour hand. The long hand shows the minutes: 12 means o’clock, 6 means half past.',check:'Look at the short hand again: which number has it just passed?'},{idea:'Money: count the biggest coins first. Change: count on from the price to what you paid.',check:'Add the coins again starting from the smallest.'}],
 ks1_shape:[{m:/shaded/,idea:'The bottom number is how many EQUAL parts. The top number is how many are shaded.',check:'Are all the parts the same size?'},{idea:'Shapes: count the sides or faces one by one. Fractions: share into equal groups.',check:'Count again, touching each one.'}],
 ks3_number:[{idea:'Work out the size first, then the sign. Powers and roots come before × and ÷.',check:'Estimate first — is your answer about the right size and the right sign?'}],
 ks3_algebra:[{idea:'An equation is a balance: whatever you do to one side, do to the other.',check:'Put your answer back into the equation — do both sides match?'}],
 ks3_ratio:[{m:/%/,idea:'A percentage change is a multiplier: +10% is × 1.1, −10% is × 0.9.',check:'Is your answer bigger for an increase and smaller for a decrease?'},{idea:'Ratio and proportion: find one part (or one item) first, then scale up.',check:'Do the parts add back up to the total?'}],
 ks3_geometry:[{idea:'Use the facts: angles on a line 180°, around a point 360°, polygon exterior angles 360°, Pythagoras for right-angled triangles.',check:'Sketch it — does the size of your answer look right?'}],
 ks3_stats:[{idea:'Probabilities go from 0 (impossible) to 1 (certain), and all the outcomes add up to 1.',check:'Is your probability between 0 and 1?'}]
});
})();
