'use strict';
// DATA: Learn missions for every other topic, so any topic can be chosen as a Focus area.
// Same format as js/data/learning.js — the FIRST option is always the correct one (the app shuffles them).
const M=(title,blocks,q,options,why)=>({title,blocks,check:{q,options,why}});
Object.assign(learnMissions,{
 ratio:[
  M('What a ratio means',[{p:'A ratio like <b>3 : 2</b> means “for every 3 of these, there are 2 of those”. Draw a box for each part — every box is the same size.'},{eg:'3 red : 2 blue → in every group of 5 counters, 3 are red and 2 are blue.'}],'A bag has red and blue counters in the ratio 3 : 2. How many parts is that altogether?',['5','6','3','1'],'3 + 2 = 5 equal parts.'),
  M('Sharing in a ratio',[{p:'Add the parts, find what ONE part is worth, then multiply.'},{eg:'Share 40 in the ratio 3 : 2 → 5 parts → 1 part = 8 → 3 × 8 = 24 and 2 × 8 = 16.'}],'Share 30 sweets in the ratio 1 : 2. How many are in the bigger share?',['20','15','10','2'],'3 parts → 30 ÷ 3 = 10 each → the bigger share is 2 × 10 = 20.'),
  M('Using one part',[{p:'If you know how much one side is, work out ONE part from it.'},{eg:'Boys : girls = 2 : 3 and there are 12 boys → 1 part = 6 → girls = 3 × 6 = 18.'}],'Cats : dogs = 4 : 1. There are 20 cats. How many dogs?',['5','80','16','4'],'4 parts = 20, so 1 part = 5 → 5 dogs.'),
  M('The difference between parts',[{p:'“How many more” questions are about the <b>difference</b> in parts.'},{eg:'5 : 3 → the difference is 2 parts. If the difference is 8, then 1 part = 4, so the amounts are 20 and 12.'}],'In the ratio 5 : 2, the first amount is 12 more than the second. What is the first amount?',['20','12','30','8'],'The difference is 3 parts = 12, so 1 part = 4 → first amount = 5 × 4 = 20.')],
 fractions:[
  M('A fraction of an amount',[{p:'<b>Divide by the bottom, times by the top.</b>'},{eg:'3/4 of 20 → 20 ÷ 4 = 5 → 5 × 3 = 15.'}],'What is 2/5 of 35?',['14','7','10','70'],'35 ÷ 5 = 7, then 7 × 2 = 14.'),
  M('What is left?',[{p:'If you use a fraction, the rest is what makes the whole: use 1/4 → 3/4 is left.'}],'Apollo gives away 2/7 of his 21 stickers. How many are left?',['15','6','14','9'],'21 ÷ 7 = 3, so he gives away 6. 21 − 6 = 15 left.'),
  M('A fraction of what remains',[{p:'Two steps! The second fraction is of what is LEFT, not the start.'},{eg:'24 sweets: eat 1/2 → 12 left. Then eat 1/3 of those 12 → 4 eaten → 8 left.'}],'60 sweets: 1/3 are eaten, then 1/4 of the rest are eaten. How many are left?',['30','40','10','35'],'60 → 20 eaten, 40 left. 1/4 of 40 = 10 eaten → 30 left.'),
  M('Finding the whole',[{p:'If you know a part, find ONE fraction first, then the whole.'},{eg:'3/8 of a number is 21 → 1/8 is 7 → the number is 8 × 7 = 56.'}],'2/3 of a number is 18. What is the number?',['27','12','36','9'],'2/3 = 18, so 1/3 = 9, and the whole is 3 × 9 = 27.')],
 percent:[
  M('Per cent means “out of 100”',[{ul:['50% = 1/2','25% = 1/4','10% = 1/10 (divide by 10)','1% = divide by 100']}],'What is 25% of 80?',['20','25','40','8'],'25% is a quarter: 80 ÷ 4 = 20.'),
  M('Build it from 10%',[{eg:'30% of 70 → 10% is 7 → 30% is 3 × 7 = 21.<br>5% is half of 10%.'}],'What is 35% of 60?',['21','35','18','24'],'10% = 6, so 30% = 18 and 5% = 3. 18 + 3 = 21.'),
  M('Sales and price rises',[{p:'Find the percentage, then take it away (sale) or add it on (increase).'},{eg:'20% off £50 → 20% = £10 → sale price £40.'}],'A £60 game has 25% off. What is the sale price?',['£45','£15','£35','£50'],'25% of £60 = £15. £60 − £15 = £45.'),
  M('Writing a score as a percentage',[{p:'Make an equivalent fraction out of 100.'},{eg:'18 out of 50 = 36/100 = 36%.'}],'What is 12 out of 20 as a percentage?',['60%','12%','40%','30%'],'12/20 = 60/100 = 60%.')],
 geometry:[
  M('Perimeter',[{p:'Perimeter is the distance all the way round. For a rectangle: 2 × (length + width).'}],'What is the perimeter of a 9 cm by 4 cm rectangle?',['26 cm','36 cm','13 cm','18 cm'],'2 × (9 + 4) = 2 × 13 = 26 cm.'),
  M('Area of a rectangle',[{p:'Area = length × width. Area is in <b>square</b> units.'}],'What is the area of a 7 m by 6 m rectangle?',['42 m²','26 m²','13 m²','48 m²'],'7 × 6 = 42 m².'),
  M('Triangles',[{p:'A right-angled triangle is half a rectangle: area = base × height ÷ 2.'}],'A right-angled triangle has sides of 10 cm and 6 cm next to the right angle. What is its area?',['30 cm²','60 cm²','16 cm²','32 cm²'],'10 × 6 = 60, and half of 60 is 30 cm².'),
  M('Finding a missing side',[{p:'Work backwards: length = area ÷ width.'}],'A rectangle has area 54 cm² and width 6 cm. How long is it?',['9 cm','48 cm','60 cm','8 cm'],'54 ÷ 6 = 9 cm.')],
 patterns:[
  M('Spot the jump',[{p:'Look at the difference between neighbouring numbers.'},{eg:'4, 7, 10, 13 → the jump is +3 → next is 16.'}],'What comes next: 5, 9, 13, 17, ?',['21','20','22','25'],'The jump is +4 each time: 17 + 4 = 21.'),
  M('Growing jumps',[{eg:'1, 2, 4, 7, 11 → jumps +1, +2, +3, +4 → next jump +5 → 16.'}],'What comes next: 2, 3, 5, 8, 12, ?',['17','16','15','20'],'The jumps are +1, +2, +3, +4, so next is +5: 12 + 5 = 17.'),
  M('Factor pairs',[{p:'Factor pairs multiply to make the number. Work through them in order so you don’t miss any.'},{eg:'24: 1 × 24, 2 × 12, 3 × 8, 4 × 6.'}],'Two numbers multiply to 36 and add to 13. What is the bigger number?',['9','12','6','4'],'4 × 9 = 36 and 4 + 9 = 13, so the bigger number is 9.'),
  M('Rewind the robot',[{p:'If a robot did some steps, undo them in reverse order: + becomes −, × becomes ÷.'},{eg:'× 3 then + 4 gives 25 → 25 − 4 = 21 → 21 ÷ 3 = 7.'}],'A robot doubles a number then takes away 5. The answer is 17. What was the number?',['11','6','22','12'],'17 + 5 = 22, then 22 ÷ 2 = 11.')],
 time:[
  M('60, not 100',[{p:'An hour has 60 minutes. Change hours to minutes by × 60.'},{eg:'1 h 45 min = 60 + 45 = 105 minutes.'}],'How many minutes are there in 2 hours 20 minutes?',['140','220','120','160'],'2 × 60 = 120, plus 20 = 140 minutes.'),
  M('Count on',[{p:'Count on to the next o’clock, then whole hours, then the extra minutes.'},{eg:'08:45 → 09:00 (15 min) → 10:00 (1 h) → 10:15 (15 min) = 1 h 30 min.'}],'How long is it from 09:40 to 11:05?',['1 h 25 min','1 h 65 min','2 h 25 min','1 h 35 min'],'20 min to 10:00, 1 hour to 11:00, then 5 min: 1 h 25 min.'),
  M('The 24-hour clock',[{p:'For pm times, add 12 to the hours.'},{eg:'3:20 pm = 15:20.'}],'What is 7:45 pm on the 24-hour clock?',['19:45','07:45','17:45','21:45'],'7 + 12 = 19, so 19:45.'),
  M('Adding a duration',[{eg:'10:50 + 2 h 25 min → 12:50 → + 25 min → 13:15.'}],'A film starts at 18:35 and lasts 1 h 50 min. When does it end?',['20:25','19:85','20:15','19:25'],'18:35 + 1 h = 19:35. + 50 min: 25 min gets to 20:00, 25 more is 20:25.')],
 units:[
  M('The key facts',[{ul:['10 mm = 1 cm','100 cm = 1 m','1000 m = 1 km','1000 g = 1 kg','1000 ml = 1 litre']}],'How many grams are in 3.5 kg?',['3500','350','35','30005'],'1 kg = 1000 g, so 3.5 × 1000 = 3500 g.'),
  M('Big unit → small unit: multiply',[{eg:'4.2 m = 4.2 × 100 = 420 cm.'}],'How many millilitres are in 2.25 litres?',['2250','225','22.5','2025'],'2.25 × 1000 = 2250 ml.'),
  M('Small unit → big unit: divide',[{eg:'750 g = 750 ÷ 1000 = 0.75 kg.'}],'1250 m is how many kilometres?',['1.25','12.5','125','0.125'],'1250 ÷ 1000 = 1.25 km.'),
  M('Same unit before you add',[{eg:'1.2 kg + 450 g → 1200 g + 450 g = 1650 g.'}],'2 m + 35 cm + 150 mm = ? cm',['250','235.15','187','2185'],'2 m = 200 cm and 150 mm = 15 cm: 200 + 35 + 15 = 250 cm.')],
 logic:[
  M('Bar models',[{p:'Draw two bars. Chop off the “extra”, then split the rest equally.'},{eg:'Two numbers add to 50 and one is 10 more: (50 − 10) ÷ 2 = 20 → 20 and 30.'}],'Two numbers add to 64. One is 14 more than the other. What is the smaller number?',['25','39','32','50'],'(64 − 14) ÷ 2 = 25.'),
  M('“Times as many”',[{eg:'Ben has 3 times as many as Ali; together they have 48 → 4 equal parts → 12 each → Ben has 36.'}],'Mia has twice as many cards as Sam. Together they have 45. How many does Mia have?',['30','15','22.5','90'],'Twice as many → 3 parts. 45 ÷ 3 = 15 → Mia has 2 × 15 = 30.'),
  M('Work backwards',[{eg:'“Add 7, then double = 30” → 30 ÷ 2 = 15 → 15 − 7 = 8.'}],'I halve a number, then add 6, and get 20. What was the number?',['28','7','52','13'],'20 − 6 = 14, then 14 × 2 = 28.'),
  M('Remainders in stories',[{p:'Decide whether to round UP or DOWN. Nobody can be left behind!'},{eg:'40 eggs in boxes of 6 → 6 r 4 → you need 7 boxes.'}],'Minibuses each seat 12. How many minibuses are needed for 50 children?',['5','4','4.2','6'],'50 ÷ 12 = 4 r 2, so 4 buses leave 2 children behind — you need 5.')],
 algebra:[
  M('Undo it',[{p:'Use the inverse: + ↔ −, × ↔ ÷.'},{eg:'n + 17 = 42 → n = 42 − 17 = 25.'}],'n − 18 = 27. What is n?',['45','9','35','27'],'Undo − 18 by adding 18: 27 + 18 = 45.'),
  M('Two steps',[{eg:'3n + 5 = 26 → 3n = 21 → n = 7.'}],'4n − 3 = 25. What is n?',['7','5.5','28','22'],'4n = 25 + 3 = 28, so n = 7.'),
  M('Balance scales',[{p:'Take the same thing off both sides.'},{eg:'5n + 2 = 3n + 12 → 2n + 2 = 12 → 2n = 10 → n = 5.'}],'4n + 1 = 2n + 9. What is n?',['4','5','2','8'],'Take 2n from both sides: 2n + 1 = 9 → 2n = 8 → n = 4.'),
  M('Story → equation',[{eg:'3 pens and a £2 ruler cost £11 → 3n + 2 = 11 → n = £3.'}],'5 tickets and £4 parking cost £39 altogether. How much is one ticket?',['£7','£8','£35','£5'],'5n + 4 = 39 → 5n = 35 → n = £7.')],
 averages:[
  M('The mean',[{p:'Mean = total ÷ how many.'},{eg:'4, 8, 9 → 21 ÷ 3 = 7.'}],'What is the mean of 6, 10, 11 and 13?',['10','40','11','9'],'6 + 10 + 11 + 13 = 40, and 40 ÷ 4 = 10.'),
  M('Median and range',[{p:'Median = the middle value when in order. Range = biggest − smallest.'},{eg:'3, 9, 4, 8, 6 → 3, 4, 6, 8, 9 → median 6, range 6.'}],'What is the median of 12, 5, 9, 15, 7?',['9','12','7','10'],'In order: 5, 7, 9, 12, 15 — the middle one is 9.'),
  M('A missing value',[{p:'Mean × how many = total. Then take away the values you know.'},{eg:'Mean of 3 numbers is 10 → total 30. Two are 8 and 13 → 30 − 21 = 9.'}],'The mean of 4 scores is 7. Three of them are 5, 9 and 6. What is the fourth?',['8','7','28','20'],'Total = 4 × 7 = 28. 5 + 9 + 6 = 20, so 28 − 20 = 8.'),
  M('Reading tables',[{table:{head:['Team','Home','Away'],rows:[['Reds','12','9'],['Blues','8','15']]}},{p:'Go along the row and down the column. Add rows for totals.'}],'Using the table, who scored more goals in total, and by how many?',['Blues by 2','Reds by 2','Blues by 6','Reds by 3'],'Reds: 12 + 9 = 21. Blues: 8 + 15 = 23. Blues by 2.')],
 probability:[
  M('Counting combinations',[{p:'Every choice can go with every other choice — multiply.'},{eg:'2 tops × 3 shorts = 6 outfits.'}],'A café has 3 starters and 4 mains. How many different meals of one starter and one main?',['12','7','34','10'],'3 × 4 = 12.'),
  M('Chance as a fraction',[{p:'Chance = how many you want ÷ how many there are altogether.'},{eg:'3 red and 5 blue → chance of red = 3/8.'}],'A bag has 2 green, 3 yellow and 5 red balls. What is the chance of picking yellow?',['3/10','3/7','1/3','3/5'],'There are 10 balls and 3 are yellow: 3/10.'),
  M('The probability scale',[{ul:['Impossible = 0','Even chance = 1/2','Certain = 1']}],'Rolling a 7 on a normal 1–6 dice is…',['impossible','unlikely','even chance','certain'],'A normal dice only has 1 to 6, so a 7 can’t happen.'),
  M('Handshakes',[{p:'Everyone shakes hands with everyone else once. Count from each person, then halve (each handshake was counted twice).'},{eg:'4 people: 4 × 3 = 12 → 12 ÷ 2 = 6.'}],'5 friends each shake hands once with everyone else. How many handshakes?',['10','20','25','5'],'5 × 4 = 20, and 20 ÷ 2 = 10.')],
 coordinates:[
  M('Across, then up',[{p:'Coordinates are (across, up) — “along the corridor, then up the stairs”.'}],'Start at (2, 4). Move 3 right and 2 down. Where are you?',['(5, 2)','(5, 6)','(−1, 2)','(4, 7)'],'Across: 2 + 3 = 5. Up: 4 − 2 = 2. So (5, 2).'),
  M('Angle facts',[{ul:['Straight line = 180°','Around a point = 360°','Triangle = 180°']}],'Two angles sit on a straight line. One is 125°. What is the other?',['55°','235°','65°','45°'],'180 − 125 = 55°.'),
  M('Reflections',[{p:'A reflected point is the same distance from the mirror line, on the other side.'},{eg:'Reflect (3, 2) in the line x = 5 → 3 is 2 to the left → 2 to the right is 7 → (7, 2).'}],'Reflect (2, 6) in the vertical line x = 4. Where does it go?',['(6, 6)','(2, 2)','(4, 6)','(8, 6)'],'2 is 2 to the left of 4, so it goes 2 to the right: 6. The up number stays 6.'),
  M('Clock angles',[{p:'A full turn is 360°, and there are 12 hours, so each hour gap is 30°.'}],'What is the smaller angle between the hands at 4 o’clock?',['120°','90°','150°','40°'],'4 hour gaps × 30° = 120°.')],
 divisibility:[
  M('Multiples and the LCM',[{eg:'4: 4, 8, 12 … 6: 6, 12 … → first common multiple = 12.'}],'Two lights flash every 6 and every 8 seconds. After how long do they flash together again?',['24 s','48 s','14 s','12 s'],'Multiples of 8: 8, 16, 24 — 24 is also a multiple of 6.'),
  M('Factors and the HCF',[{eg:'Factors of 18: 1, 2, 3, 6, 9, 18. Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Highest common factor = 6.'}],'What is the biggest number that divides exactly into both 20 and 30?',['10','5','60','2'],'10 goes into both (20 = 2 × 10, 30 = 3 × 10).'),
  M('Prime numbers',[{p:'A prime has exactly two factors: 1 and itself. 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 …'}],'Which of these is prime?',['29','27','33','21'],'27 = 3 × 9, 33 = 3 × 11, 21 = 3 × 7, but 29 only divides by 1 and 29.'),
  M('Divisibility tricks',[{ul:['÷ 3: the digits add to a multiple of 3','÷ 4: the last two digits make a multiple of 4','÷ 9: the digits add to a multiple of 9']}],'Which number is divisible by 9?',['567','568','569','574'],'5 + 6 + 7 = 18, which is a multiple of 9.')],
 speed:[
  M('Distance = speed × time',[{eg:'40 km/h for 3 hours → 40 × 3 = 120 km.'}],'A cyclist rides at 15 km/h for 4 hours. How far does she go?',['60 km','19 km','11 km','3.75 km'],'15 × 4 = 60 km.'),
  M('Time = distance ÷ speed',[{eg:'150 km at 50 km/h → 150 ÷ 50 = 3 hours.'}],'How long does it take to drive 200 km at 80 km/h?',['2½ hours','2 hours','3 hours','120 minutes'],'200 ÷ 80 = 2.5 hours = 2½ hours.'),
  M('Parts of an hour',[{p:'30 minutes = ½ hour, 20 minutes = 1/3 hour, 15 minutes = ¼ hour.'}],'A train travels at 90 km/h for 20 minutes. How far does it go?',['30 km','1800 km','4.5 km','70 km'],'20 minutes is 1/3 of an hour: 90 ÷ 3 = 30 km.'),
  M('Unit prices',[{p:'Find the price of ONE first.'},{eg:'6 pens cost £4.20 → one pen costs 70p.'}],'4 drinks cost £3.60. How much do 7 drinks cost?',['£6.30','£5.60','£7.20','£6.00'],'One drink = £3.60 ÷ 4 = 90p. 7 × 90p = £6.30.')],
 area:[
  M('Split it, or take a piece away',[{fig:F('shape',[[0,0],[5,0],[5,4],[9,4],[9,7],[0,7]],['5 cm','4 cm','?','3 cm','9 cm','7 cm'])},{p:'Find the missing sides first, then use the big rectangle minus the missing corner.'}],'What is the area of the shape above?',['47 cm²','63 cm²','32 cm²','16 cm²'],'Big rectangle 9 × 7 = 63. Missing corner is 4 × 4 = 16. 63 − 16 = 47 cm².'),
  M('Holes and borders',[{eg:'A 10 × 8 card with a 6 × 4 window → 80 − 24 = 56.'}],'A 12 m by 9 m lawn has a 4 m by 3 m pond in it. What area is grass?',['96 m²','108 m²','12 m²','90 m²'],'12 × 9 = 108. Pond = 12. 108 − 12 = 96 m².'),
  M('The perimeter shortcut',[{p:'An L-shape (one corner cut out) has the same perimeter as the rectangle around it.'}],'An L-shape fits exactly in a 9 cm by 7 cm rectangle with one corner cut out. What is its perimeter?',['32 cm','63 cm','16 cm','28 cm'],'Same as the rectangle: 2 × (9 + 7) = 32 cm.'),
  M('Squares',[{eg:'Area 64 → side 8 (8 × 8 = 64) → perimeter 4 × 8 = 32.'}],'A square has a perimeter of 36 cm. What is its area?',['81 cm²','36 cm²','144 cm²','72 cm²'],'Side = 36 ÷ 4 = 9 cm. Area = 9 × 9 = 81 cm².')],
 sequences:[
  M('Jumping to a far term',[{p:'The 10th term needs 9 jumps from the first term.'},{eg:'7, 11, 15 … (+4): 10th term = 7 + 9 × 4 = 43.'}],'The sequence is 5, 8, 11, … What is the 10th term?',['32','35','30','29'],'5 + 9 × 3 = 32.'),
  M('Special numbers',[{ul:['Square numbers: 1, 4, 9, 16, 25 …','Triangular numbers: 1, 3, 6, 10, 15 … (add 2, 3, 4, 5 …)']}],'What is the next triangular number after 1, 3, 6, 10, 15?',['21','20','25','16'],'The jumps are 2, 3, 4, 5, so next is + 6: 15 + 6 = 21.'),
  M('Multiplying sequences',[{eg:'3, 6, 12, 24 → × 2 each time.'}],'What comes next: 2, 6, 18, 54, ?',['162','108','72','58'],'× 3 each time: 54 × 3 = 162.'),
  M('Two-step rules',[{eg:'Double then add 1: 1 → 3 → 7 → 15 → 31.'}],'Rule: double then take away 1. Start at 3: 3 → 5 → 9 → ?',['17','18','16','10'],'9 × 2 = 18, then − 1 = 17.')],
 reasoning:[
  M('Use a table',[{p:'Put the names down the side and the choices across the top. Cross out what’s impossible.'}],'Amy, Ben and Cal each have a different pet: a cat, a dog or a fish. Amy’s pet can’t swim or bark. Ben’s pet doesn’t bark. Who has the dog?',['Cal','Ben','Amy'],'Amy can’t have the fish or dog → cat. Ben doesn’t have the dog → fish. So Cal has the dog.'),
  M('Bar models',[{eg:'Two ages add to 30 and one is 4 more → (30 − 4) ÷ 2 = 13 → 13 and 17.'}],'Jo is 4 years older than Kim. Their ages add up to 30. How old is Jo?',['17','13','15','26'],'(30 − 4) ÷ 2 = 13 for Kim, so Jo is 13 + 4 = 17.'),
  M('Take away the bits you can’t use',[{eg:'8 rows of 12 with 1 row closed → 7 × 12 = 84 seats.'}],'A hall has 9 rows of 15 seats. 2 rows are closed. How many seats can be used?',['105','135','120','30'],'7 rows can be used: 7 × 15 = 105.'),
  M('Check every clue',[{p:'Make a list that fits the first clue, then cross off numbers using the other clues.'}],'I’m between 40 and 60, a multiple of 7, an odd number, and my digits add to 13. What am I?',['49','42','56','63'],'Multiples of 7 from 40 to 60: 42, 49, 56. Only 49 is odd — and 4 + 9 = 13.')],
 tiffin:[
  M('Read it twice',[{p:'Read every question twice and underline the key words: MORE, LEFT, TOTAL, EACH, SIMPLEST.'}],'“How many MORE …” means you should…',['find a difference','add everything','multiply','divide'],'“More than” compares two amounts — take the smaller from the bigger.'),
  M('Units first',[{eg:'5 m − 120 cm − 85 cm → 500 − 120 − 85 = 295 cm = 2.95 m.'}],'5 m of rope has 120 cm and 85 cm cut off. How many metres are left?',['2.95 m','3.05 m','2.05 m','3.95 m'],'500 − 205 = 295 cm = 2.95 m.'),
  M('Time zones',[{p:'Work out the landing time on the home clock first, then move the clock for the other country.'}],'A plane leaves London at 10:00 and flies for 3 hours. The destination is 2 hours ahead of London. What is the local time when it lands?',['15:00','13:00','11:00','12:00'],'10:00 + 3 h = 13:00 London time. 2 hours ahead → 15:00.'),
  M('Search systematically',[{p:'For “largest” or “smallest” questions, try the best options first and check every rule.'}],'Using the digits 3, 6 and 0 once each, what is the largest 3-digit EVEN number?',['630','360','603','306'],'The biggest first digit is 6. 630 ends in 0, so it is even — and it beats 603 (odd).')]
});
