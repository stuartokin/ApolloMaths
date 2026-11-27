'use strict';
// DATA: Learn missions and "Explain it simply" for the KS2 reasoning topics and the tables check (js/data/questions-ks2.js).
// Same format as learning-more.js — the FIRST option is always the correct one (the app shuffles them).
(function(){
const M=(title,blocks,q,options,why)=>({title,blocks,check:{q,options,why}});
Object.assign(learnMissions,{
 ks2_number:[
  M('Place value',[{p:'Each column is worth 10 times the one to its right: ones, tens, hundreds, thousands, ten thousands, hundred thousands.'},{eg:'In 352,814 the 5 is in the ten thousands column, so it is worth <b>50,000</b>.'}],'What is the 4 worth in 74,215?',['4,000','4','400','40,000'],'7 is ten thousands, 4 is thousands → 4,000.'),
  M('Rounding',[{p:'Find the two “round” numbers either side, then look at the next digit: <b>5 or more rounds up</b>.'},{eg:'3,462 to the nearest 100: between 3,400 and 3,500. The tens digit is 6 → <b>3,500</b>.'}],'Round 6,149 to the nearest 100.',['6,100','6,200','6,000','6,150'],'Between 6,100 and 6,200; the tens digit is 4, so round down to 6,100.'),
  M('Roman numerals',[{ul:['I 1 · V 5 · X 10 · L 50 · C 100 · D 500 · M 1000','A smaller numeral before a bigger one is taken away: IV 4, IX 9, XL 40, XC 90, CD 400, CM 900']},{eg:'MCMXCIV = M (1000) + CM (900) + XC (90) + IV (4) = <b>1994</b>'}],'What is XLVI?',['46','66','44','56'],'XL = 40 and VI = 6, so 46.'),
  M('Negative numbers',[{p:'Use a number line or a thermometer. Count to zero first, then carry on.'},{eg:'From −3°C to 8°C: 3 degrees up to 0, then 8 more → a rise of <b>11°C</b>.'}],'It is −4°C and the temperature rises by 10°C. What is it now?',['6°C','14°C','−14°C','−6°C'],'4 degrees up to 0, then 6 more: 6°C.')],
 ks2_measure:[
  M('Change from money',[{p:'<b>Count on</b> from the price to the money paid: first to a whole pound, then to the note.'},{eg:'£3.65 from £10: £3.65 → £4 is 35p, £4 → £10 is £6 → change <b>£6.35</b>'}],'A toy costs £2.70. You pay with £5. How much change?',['£2.30','£3.30','£2.70','£7.70'],'£2.70 → £3 is 30p, £3 → £5 is £2, so £2.30.'),
  M('Time durations',[{p:'Count on to the next o’clock, then the whole hours, then the minutes.'},{eg:'2:40 pm to 4:15 pm → 20 min to 3:00, 1 hour to 4:00, 15 min → <b>1 hour 35 minutes</b> (95 minutes)'}],'How many minutes from 9:45 am to 11:10 am?',['85','65','125','75'],'15 min to 10:00, 60 min to 11:00, 10 min more: 85 minutes.'),
  M('Converting units',[{ul:['1 km = 1,000 m · 1 m = 100 cm · 1 cm = 10 mm','1 kg = 1,000 g · 1 litre = 1,000 ml']},{p:'Big unit → small unit: <b>multiply</b>. Small unit → big unit: <b>divide</b>.'}],'How many grams in 3.2 kg?',['3,200 g','320 g','32 g','32,000 g'],'1 kg = 1,000 g, so 3.2 × 1,000 = 3,200 g.'),
  M('Perimeter, area and volume',[{ul:['Perimeter: add all the sides (cm)','Area of a rectangle: length × width (cm²)','Area of a triangle: base × height ÷ 2','Volume of a cuboid: length × width × height (cm³)']}],'A rectangle is 7 cm by 4 cm. What is its area?',['28 cm²','22 cm²','11 cm²','28 cm'],'7 × 4 = 28, and area is in square units: 28 cm².')],
 ks2_shape:[
  M('Angle facts',[{ul:['Right angle = 90°','Straight line = 180°','Full turn (around a point) = 360°']},{eg:'Two angles on a line: 115° and ? → 180 − 115 = <b>65°</b>'}],'Angles around a point are 150° and 130° and one more. What is it?',['80°','100°','280°','30°'],'150 + 130 = 280, and 360 − 280 = 80°.'),
  M('Angles in shapes',[{ul:['Triangle: 180°','Quadrilateral: 360°','Isosceles triangle: two equal angles']},{eg:'Isosceles triangle with top angle 40°: 180 − 40 = 140, ÷ 2 = <b>70°</b> each'}],'A triangle has angles of 50° and 60°. What is the third?',['70°','80°','110°','250°'],'50 + 60 = 110, and 180 − 110 = 70°.'),
  M('3D shapes',[{table:{head:['Shape','Faces','Edges','Vertices'],rows:[['Cube / cuboid','6','12','8'],['Triangular prism','5','9','6'],['Square-based pyramid','5','8','5'],['Tetrahedron','4','6','4']]}}],'How many edges does a square-based pyramid have?',['8','5','6','12'],'4 round the square base and 4 going up to the top: 8.'),
  M('Coordinates and translation',[{p:'(x, y): <b>along the corridor, then up the stairs</b>. Moving right adds to x; moving down takes away from y.'},{eg:'(2, 7) moved 3 right and 4 down → (5, 3)'}],'(4, 6) is moved 2 left and 3 up. Where is it now?',['(2, 9)','(6, 3)','(6, 9)','(2, 3)'],'Left 2: 4 − 2 = 2. Up 3: 6 + 3 = 9 → (2, 9).')],
 ks2_stats:[
  M('Reading charts',[{p:'Read the <b>title</b>, the <b>labels</b> and the <b>scale</b> before you read any bar.'},{fig:F('bar',['Mon','Tue','Wed','Thu'],[12,18,6,14],2,'Goals')}],'In the chart, how many more goals on Tue than Mon?',['6','18','12','30'],'Tue 18, Mon 12: 18 − 12 = 6.'),
  M('Tables and timetables',[{p:'Find the right row and column first. For a timetable, the time difference is how long the journey takes.'},{eg:'Leaves 09:41, arrives 10:08 → 19 min to 10:00 + 8 min = <b>27 minutes</b>'}],'A bus leaves at 10:50 and arrives at 11:25. How long is the journey?',['35 minutes','75 minutes','25 minutes','45 minutes'],'10 minutes to 11:00, then 25 more: 35 minutes.'),
  M('Pictograms and pie charts',[{p:'In a pictogram check the <b>key</b>. In a pie chart the whole circle (360°) is everybody.'},{eg:'Pie chart of 40 children: a 90° sector is a quarter → <b>10 children</b>'}],'Each 🙂 stands for 6 people. How many is 🙂🙂🙂 and half a 🙂?',['21','18','24','3.5'],'3 × 6 = 18, half of 6 is 3, so 21.'),
  M('The mean',[{p:'Mean = <b>total ÷ how many</b>. It is a fair share.'},{eg:'4, 7, 10 → total 21 → 21 ÷ 3 = <b>7</b>'}],'What is the mean of 6, 9 and 12?',['9','27','6','12'],'6 + 9 + 12 = 27, and 27 ÷ 3 = 9.')],
 ks2_problems:[
  M('Read, plan, solve',[{ol:['Underline what the question asks.','Write each step as a calculation.','Check the answer fits the story.']}],'Rows of 6 chairs, 7 rows, 5 chairs empty. How many people sit?',['37','42','47','13'],'7 × 6 = 42 chairs; 42 − 5 = 37 people.'),
  M('Remainders in real life',[{p:'Sometimes you must <b>round up</b> (buses, boxes) and sometimes <b>round down</b> (how many whole packs can you fill?).'},{eg:'100 children, 30 per coach: 100 ÷ 30 = 3 r10 → <b>4 coaches</b>'}],'50 eggs go into boxes of 6. How many FULL boxes?',['8','9','6','56'],'50 ÷ 6 = 8 remainder 2, so 8 full boxes.'),
  M('Scaling and ratio',[{p:'Find what <b>one</b> is worth, then multiply (or find one group).'},{eg:'Recipe for 4 uses 200 g → 50 g per person → for 6 people: <b>300 g</b>'}],'2 red for every 3 blue; 20 beads. How many red?',['8','12','10','4'],'Groups of 5: 20 ÷ 5 = 4 groups; 4 × 2 = 8 red.'),
  M('Formulas and equations',[{p:'A letter stands for a number. Undo the steps in reverse order.'},{eg:'3n + 4 = 25 → 3n = 21 → <b>n = 7</b>'}],'2n + 9 = 31. What is n?',['11','20','22','9'],'31 − 9 = 22, and 22 ÷ 2 = 11.')],
 mtc_tables:[
  M('The check',[{p:'In Year 4 the multiplication tables check asks <b>25 questions</b>, each with <b>6 seconds</b> to answer, on a screen. It covers the tables up to 12 × 12.'}],'How long do you get for each question?',['6 seconds','1 minute','10 seconds','3 seconds'],'6 seconds each — so the facts need to be instant.'),
  M('Use facts you know',[{ul:['× 4: double, double again','× 8: double three times','× 9: × 10, then take one lot away','× 12: × 10 plus × 2']},{eg:'7 × 9 = 70 − 7 = <b>63</b>'}],'What is 6 × 9?',['54','56','45','63'],'6 × 10 = 60, take away 6 → 54.'),
  M('Turn it round',[{p:'7 × 8 is the same as 8 × 7. Learning one fact gives you two (and two division facts too).'},{eg:'8 × 7 = 56 → 7 × 8 = 56 → 56 ÷ 8 = 7 → 56 ÷ 7 = 8'}],'If 12 × 7 = 84, what is 84 ÷ 12?',['7','12','6','72'],'The facts belong together: 84 ÷ 12 = 7.'),
  M('The tricky ones',[{p:'Most children find these hardest: <b>6 × 8, 7 × 8, 6 × 7, 8 × 9, 7 × 12, 9 × 12</b>. Practise them most.'},{eg:'7 × 8 = 56 (5, 6, 7, 8!)'}],'What is 7 × 8?',['56','54','63','48'],'5, 6, 7, 8 → 56 = 7 × 8.')]
});
Object.assign(explainers,{
 ks2_number:[{m:/Roman|[MDCLXVI]{3,}/,idea:'Roman numerals are letters for numbers. Add them up — but a smaller letter in front of a bigger one is taken away.',check:'Turn your answer back into Roman numerals. Does it match?'},
  {m:/°C/,idea:'Think of a thermometer. Counting up through zero: count to zero first, then carry on.',check:'Count the steps again on a number line.'},
  {m:/Round/,idea:'Rounding finds the nearest “tidy” number. Find the two tidy numbers either side and see which is closer.',check:'Is your answer one of the two tidy numbers either side?'},
  {idea:'Every digit has a value that depends on its column. Say the number aloud and name the columns.',check:'Write the number in a place-value grid.'}],
 ks2_measure:[{m:/change/i,idea:'Change is the money you get back. Count on from the price to what you paid, like a shopkeeper.',check:'Add the change to the price — you should get what was paid.'},
  {m:/clock|pm|am|minutes long/,idea:'Time counts in 60s, not 100s. Jump to the next o’clock, then count hours, then minutes.',check:'Count on again from the start using your answer.'},
  {idea:'Put everything in the same unit first, then calculate. Big unit to small: multiply. Small to big: divide.',check:'Does the size of your answer make sense?'}],
 ks2_shape:[{m:/clock/,idea:'A whole turn of a clock hand is 360°, and there are 12 gaps, so each gap is 30°.',check:'Count the gaps between the numbers again.'},
  {m:/faces|edges|vertices/,idea:'Faces are flat surfaces, edges are the lines where faces meet, vertices are corners.',check:'Picture the shape and count again, one part at a time.'},
  {idea:'Angle facts: straight line 180°, around a point 360°, triangle 180°, quadrilateral 360°.',check:'Add all the angles including yours — do they make the right total?'}],
 ks2_stats:[{m:/mean/i,idea:'The mean shares everything out fairly: add it all up, then divide by how many there are.',check:'Is the mean between the smallest and largest numbers?'},
  {m:/pie chart/i,idea:'The whole pie (360°) is everyone. A sector’s angle tells you what fraction of everyone it is.',check:'Do all the sectors add up to everyone?'},
  {idea:'Charts and tables hold the facts. Read the title, labels and scale, then find exactly the numbers you need.',check:'Point at the numbers you used — are they in the right row or column?'}],
 ks2_problems:[{idea:'A story problem is a few small sums joined together. Find what the question asks, then work out one step at a time.',check:'Does your answer make sense in the story? (You can’t have half a bus!)'}],
 mtc_tables:[{idea:'Times tables are facts to remember. If you don’t know one, build it from a fact you do know.',check:'Turn it round: does the other way give the same answer?'}]
});
})();
