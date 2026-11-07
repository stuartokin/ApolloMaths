'use strict';
// DATA: "Explain it simply" — plain-English help for every question, without giving the answer away.
// For each topic, the first entry whose pattern (m) matches the question text is used; the last entry is the topic default.
// idea = the big idea in everyday words; check = a quick way to check an answer.
const explainers={
 ratio:[
  {m:/more .* than/i,idea:'A ratio is like a recipe: for every few of one thing there are a few of another. Draw a box for each ratio part — every box holds the SAME amount. The “extra” boxes on the bigger side make up the difference you were told about.',check:'Divide each amount by the size of one box. Do you get the ratio numbers back?'},
  {idea:'A ratio is like a recipe. 3:2 means “for every 3 of these, there are 2 of those”. Draw a box for each part — all boxes are the same size. Work out what ONE box is worth and the rest is easy.',check:'Divide each amount by the size of one box — you should get the ratio numbers back. Do the amounts add up to the total?'}],
 fractions:[
  {m:/REMAINING/,idea:'Two bites out of the same cake! The second fraction is a fraction of what is LEFT after the first bite, not of the whole cake.',check:'Track the amount after each step: start → after the first bite → after the second. Does every step make sense?'},
  {m:/That is/,idea:'This time you know a PART and need the WHOLE. If 3 slices of a pizza cut into 8 is 21, then one slice is 21 ÷ 3. Then the whole pizza is 8 of those slices.',check:'Take the fraction of your answer. Do you get back the number in the question?'},
  {idea:'A fraction is a pizza cut into equal slices. The bottom number says how many slices the whole thing is cut into; the top number says how many slices you take. Share by the bottom, then take the top.',check:'Is your answer smaller than the whole? Does “part used + part left” make the whole?'}],
 percent:[
  {m:/then the NEW price/,idea:'Two changes in a row. The second change works on the NEW price, not the starting price — so 25% off then 20% on does NOT get you back to where you started.',check:'Write the price after EACH step. Is the final price sensible compared with the start?'},
  {m:/DISCOUNT/,idea:'Per cent means “out of 100”. The discount is just the amount knocked off: 10% is the price ÷ 10, 50% is half, 25% is a quarter.',check:'A discount is always less than the price. Is yours?'},
  {m:/reduced|SALE/,idea:'A sale takes a slice off the price. Find the slice (the percentage of the price), then take it away.',check:'The sale price should be LESS than the original price.'},
  {m:/rises|NEW price|members does it have now/,idea:'Going up by a percentage means find the extra bit, then ADD it on.',check:'The new amount should be MORE than the old one.'},
  {m:/FULL section|equals/,idea:'You know a piece and want the whole thing. If 25% is 50 seats, then 100% is four lots of that.',check:'Take the percentage of your answer — do you get the number in the question?'},
  {idea:'Per cent means “out of 100”. 10% = divide by 10. 50% = half. 25% = a quarter. You can build any percentage from these.',check:'Is your answer sensible? 50% should be half; 10% should be small.'}],
 geometry:[
  {m:/perimeter of .* AREA|AREA\?.*perimeter/i,idea:'Perimeter is a walk around the edge; area is the carpet inside. Use the perimeter to find the sides first, then multiply for the carpet.',check:'Check the sides give the right perimeter, then that length × width gives your area.'},
  {m:/triangular|triangle/i,idea:'A triangle is exactly half of a rectangle. Work out the rectangle around it, then halve.',check:'Your triangle should be half of base × height.'},
  {m:/cut from a corner/,idea:'Area is the carpet. Work out the carpet for the whole rectangle, then take away the bit that has been cut out.',check:'The area left must be smaller than the whole rectangle.'},
  {m:/edge|PERIMETER|around/i,idea:'Perimeter is like walking all the way around the edge of a pitch. Add up every side you walk along.',check:'Did you count every side? A rectangle has 4 sides: 2 long and 2 short.'},
  {m:/LENGTH/,idea:'Area = length × width, so if you know the area and one side, divide to find the other side.',check:'Multiply your length by the width — do you get the area?'},
  {idea:'Area is how many 1 cm squares would cover the shape, like tiles on a floor. Perimeter is the distance around the edge.',check:'Area answers are in square units (cm²); perimeter answers are plain lengths (cm).'}],
 patterns:[
  {m:/add to|multiply to/i,idea:'You are hunting for two secret numbers. List pairs that multiply to the product, then find the pair that also adds to the sum.',check:'Test your pair: do they multiply AND add to the right numbers?'},
  {m:/robot|rule|input/i,idea:'The robot did some steps. Rewind the video: start at the end and undo each step in reverse order (+ becomes −, × becomes ÷).',check:'Put your answer into the robot’s rule. Do you get the output?'},
  {idea:'Be a pattern detective: look at the jumps between neighbouring numbers. Are they the same, growing, or doubling?',check:'Make sure your rule works for EVERY number in the pattern, not just the last two.'}],
 time:[
  {m:/24-hour|What TIME|finish\?/i,idea:'Clocks count in 60s, not 100s. Add the hours first, then the minutes — and every time you pass 60 minutes, that becomes one more hour.',check:'Minutes can never be 60 or more. Is your time after the start time?'},
  {m:/km per hour|travels at/i,idea:'Speed tells you how far you go in ONE hour. More hours means more distance.',check:'Distance ÷ time should give back the speed.'},
  {m:/starts at .* ends at/i,idea:'Count on like a number line: from the start to the next o’clock, then whole hours, then the last few minutes.',check:'Add your answer to the start time — do you land on the end time?'},
  {idea:'An hour is 60 minutes. Turn hours into minutes (× 60) and then add the extra minutes.',check:'Is your answer more than 60 if there was at least one hour?'}],
 units:[
  {m:/remain/i,idea:'Before you add or take away lengths, change them ALL into the same unit — like changing all your coins into pennies before you count.',check:'Did you convert every piece? Is what is left less than what you started with?'},
  {m:/GRAMS|kg/,idea:'1 kilogram is 1000 grams, like 1 pound is 100 pence. Change the kilograms into grams, then add the extra grams.',check:'Your gram answer should be about 1000 × the kilograms.'},
  {m:/MILLILITRES|ml/,idea:'Every bottle is the same, so it is just groups of: number of bottles × millilitres in each.',check:'Divide your answer by the number of bottles — do you get one bottle?'},
  {idea:'1 m = 100 cm, 1 cm = 10 mm, 1 kg = 1000 g. Convert to the unit the question asks for BEFORE you finish.',check:'Bigger units become bigger numbers when you change them into smaller units.'}],
 logic:[
  {m:/same answer as/,idea:'Imagine a balance scale. Both sides weigh the same. Take the same thing off both sides until only the secret number is left on one side.',check:'Put your number into BOTH sides. Do they match?'},
  {m:/remainder/,idea:'Take the leftover away first. What is left must divide exactly by all the numbers — that is a common multiple.',check:'Divide your answer by each number. Is the remainder right every time?'},
  {m:/as many stickers as/,idea:'This is a swap: some small packets are worth the same as some medium ones. Count the stickers on the small side first.',check:'Do both sides of the swap have the same number of stickers?'},
  {m:/twice as many/,idea:'Some information is a distraction! Only use the facts you need for the actual question.',check:'Re-read the last sentence. Did you answer exactly that?'},
  {m:/TWO equal piles/,idea:'Share into two equal piles. If it doesn’t split evenly, one is left over and put aside.',check:'Two piles + any leftover should add back to what was shared.'},
  {idea:'Undo the steps in reverse order, like rewinding a video.',check:'Run your answer forwards through the story. Does it work?'}],
 algebra:[
  {m:/times my secret number plus/,idea:'Think of a balance scale with the same weight on both sides. Take away the same amount from both sides until the secret number is on its own.',check:'Put your number into both sides. Do they come out equal?'},
  {m:/add to .* larger is/,idea:'Two numbers, one bigger by a set amount. Take the extra away first, then the rest splits into two equal halves.',check:'Do your two numbers add to the total AND differ by the right amount?'},
  {m:/adult tickets/,idea:'Pretend every ticket was a child ticket. Then the extra money is only from the adults paying more.',check:'Work out the full cost with your price. Does it match?'},
  {idea:'There is a mystery number. Rewind the story: undo the LAST thing first (× becomes ÷, + becomes −).',check:'Run your number forwards through the story — do you get the number in the question?'}],
 averages:[
  {m:/MEDIAN/,idea:'The median is the middle number once everything is lined up from smallest to biggest.',check:'Are there the same number of values below and above it?'},
  {m:/RANGE/,idea:'The range shows how spread out the numbers are: biggest take away smallest.',check:'Range uses only the biggest and smallest values.'},
  {m:/TOTAL|IN TOTAL/,idea:'Total just means add them all up.',check:'Add them in a different order — same answer?'},
  {m:/THIRD|Find the other|and \?/,idea:'The mean is what everyone would get if you evened out all the towers of blocks. So mean × how many = the total. Take away the ones you know to find the missing one.',check:'Add all the values with yours and divide — do you get the mean?'},
  {idea:'The mean is fair sharing: add everything up, then share it equally between how many there are.',check:'The mean should be between the smallest and biggest values.'}],
 probability:[
  {m:/handshakes/,idea:'Each person shakes everyone else’s hand once. If you count from everyone’s side, each handshake is counted twice — so halve it.',check:'Try it with 3 people (3 handshakes) to test your method.'},
  {m:/percentage|%/i,idea:'Out of all the tickets, what fraction are golden? Then turn that fraction into “out of 100”.',check:'A percentage must be between 0 and 100.'},
  {m:/NOT/,idea:'Ignore the ones you don’t want and count the rest.',check:'Your answer plus the ones you ignored should give the total.'},
  {m:/reject/,idea:'Count every possible pairing first (a grid helps), then take away the banned one.',check:'Your answer is one less than all the pairings.'},
  {m:/outfits|pairs|outcomes|pictures/i,idea:'Every choice can go with every other choice — like a grid with capes along the top and masks down the side. Count the boxes: multiply!',check:'Try listing a few combinations to see the pattern.'},
  {idea:'Count everything carefully — every counter in the bag.',check:'Did you include every colour?'}],
 coordinates:[
  {m:/RIGHT|DOWN|coordinate|walks from/i,idea:'Coordinates are (across, up) — “along the corridor, then up the stairs”. Moving right or left changes the first number; up or down changes the second.',check:'Only ONE of the numbers should change for a straight move.'},
  {m:/triangle/i,idea:'The three angles inside any triangle always add to 180°, like a half-turn.',check:'Add all three angles — do you get 180°?'},
  {m:/straight line/i,idea:'Angles on a straight line make a half-turn: 180°.',check:'Do your two angles add to 180°?'},
  {m:/around a point/i,idea:'All the way round a point is a full turn: 360°.',check:'Do all the angles add to 360°?'},
  {m:/clock/i,idea:'The minute hand goes all the way round (360°) in 60 minutes, so it turns 6° every minute.',check:'15 minutes should be a quarter turn (90°).'},
  {idea:'A four-sided shape’s angles add to 360°, a full turn.',check:'Add all four angles — 360°?'}],
 divisibility:[
  {m:/TOGETHER/,idea:'Write out the times each alarm rings. The first time that is on BOTH lists is when they ring together — the lowest common multiple.',check:'Your answer must be in both times tables.'},
  {m:/prime/i,idea:'A prime number can only be divided by 1 and itself.',check:'A prime has exactly two factors.'},
  {m:/seconds/i,idea:'60 seconds make a minute, so divide the seconds by 60.',check:'Fewer than 60 seconds is less than 1 minute.'},
  {m:/multiple of .* inclusive/,idea:'Count the jumps, not the size of the last number: ×1, ×2, ×3 ... up to the last one.',check:'The last multiple ÷ the number = how many you wrote.'},
  {m:/piles containing|total number/i,idea:'Equal groups means multiply: number of groups × how many in each group.',check:'Divide your answer by the number of groups — back to one group?'},
  {idea:'Sharing into equal groups means divide.',check:'Multiply back: groups × each = total?'}],
 speed:[
  {m:/How many hours|journey take/i,idea:'Speed tells you how far you go in one hour. Ask: how many hours of that distance fit into the whole trip?',check:'Speed × your time should give the distance.'},
  {m:/km\/h\?|speed in/i,idea:'Speed is how far you go in ONE hour. Share the distance equally between the hours.',check:'Your speed × the hours should give the distance.'},
  {m:/MINUTES/,idea:'Change the minutes into hours (or parts of an hour) first — 30 minutes is half an hour.',check:'Less than an hour should mean less distance than one hour’s worth.'},
  {m:/ONE programme/,idea:'Find the cost of just one: share the total cost equally.',check:'One price × how many should give the total.'},
  {idea:'It is the same amount every hour (or every block of time), so count the blocks and multiply.',check:'Does a longer time give a bigger answer?'}],
 area:[
  {m:/WIDTH/,idea:'Half the perimeter is one length + one width. Take away the extra length, then share equally.',check:'Put your width and length back into the perimeter.'},
  {m:/ONE SIDE/,idea:'A square has 4 equal sides, so share the perimeter between 4.',check:'4 × your side = the perimeter?'},
  {m:/PERIMETER/,idea:'Perimeter is the distance around the edge — like walking round a pitch.',check:'Did you count all 4 sides?'},
  {m:/removed|folded|cut/i,idea:'Find the whole area, then take away the piece that is removed — or just measure what is left.',check:'The area left must be smaller than the whole.'},
  {m:/uncovered/,idea:'Find the whole floor, then take away what is covered.',check:'Uncovered + covered = whole floor?'},
  {idea:'Area is how many 1-unit squares cover the shape: length × width.',check:'Area is in square units, like m² or cm².'}],
 sequences:[
  {m:/triangular/i,idea:'Each pattern adds a new row that is one longer: 1, then +2, then +3, then +4…',check:'Check your rule with a small pattern you can count.'},
  {m:/Square numbers/i,idea:'Square numbers are a number times itself: 1×1, 2×2, 3×3…',check:'Find the number that was squared each time.'},
  {m:/th term/,idea:'The first number is already there, so the 10th term needs 9 jumps.',check:'Count the jumps on your fingers for a small term first.'},
  {m:/doubles then adds/i,idea:'Two steps every time: double FIRST, then add.',check:'Apply the rule to the given numbers — does it make the next one?'},
  {idea:'Look at the jumps between neighbours. Same jump? Growing jump? Multiplying?',check:'Your rule must work for EVERY number in the sequence.'}],
 reasoning:[
  {m:/more than the other|more pages|SMALLER/,idea:'Use a bar model: two bars, one longer by the difference. Chop off the extra and split the rest equally.',check:'Do your numbers add to the total and differ by the right amount?'},
  {m:/blocked/,idea:'Take away the blocked row first, then count the seats in the rows that are left.',check:'Your answer should be less than all the seats.'},
  {idea:'Follow the story one step at a time, writing down the number after each step.',check:'Read the question again — have you answered exactly what it asks?'}],
 volume:[
  {m:/LITRES/,idea:'Volume tells you how much space is inside. Every 1 cm³ holds 1 ml of water, and 1000 ml fill a litre bottle.',check:'Is your number of litres the volume ÷ 1000?'},
  {m:/MILLILITRES|jug/i,idea:'The water makes its own cuboid shape inside the tank. Every 1 cm³ of water is 1 ml.',check:'1 cm³ = 1 ml, so the number of ml equals the volume of the water.'},
  {m:/rise/i,idea:'The extra water is like a thin slab on top of the water. Its volume = the base of the tank × how much it rises.',check:'Base area × your rise should equal the extra water.'},
  {m:/cubes fit/i,idea:'Think of stacking dice into a box. Count how many fit along each edge — don’t just divide the volumes.',check:'Each small cube is side × side × side; your cubes × that should equal the box.'},
  {m:/HIGH/,idea:'Volume = length × width × height. You know the volume and two sides, so divide by the floor area to find the height.',check:'Multiply all three sides — do you get the volume?'},
  {m:/edges/i,idea:'A cube’s sides are all the same. Find the number that × itself × itself makes the volume. A cube has 12 edges.',check:'Your edge³ should equal the volume.'},
  {m:/podium|two/i,idea:'Find the volume of each block on its own, then add them.',check:'The total must be bigger than each block on its own.'},
  {idea:'Volume is the number of 1 cm cubes it takes to fill a shape. Count one layer (length × width), then multiply by the number of layers (height).',check:'Volume answers use cubed units (cm³). Did you multiply THREE measurements?'}],
 equivfrac:[
  {m:/SIMPLEST|Simplify/,idea:'Simplifying is like cutting a pizza into fewer, bigger slices — the same amount of pizza. Divide the top and bottom by the same number until you can’t any more.',check:'Is there any number (bigger than 1) that still goes into both? If not, you’re done.'},
  {m:/decimal/i,idea:'The bottom numbers don’t go into each other, so find a “bridge” number that goes into both. The answer might have a decimal point — that’s fine!',check:'Multiply: top × new bottom ÷ old bottom should give your answer.'},
  {m:/LARGER/,idea:'Fractions with different slice sizes are hard to compare. Cut both pizzas into the same number of slices (same denominator), then compare the tops.',check:'Turn both into decimals in your head — does the bigger one win?'},
  {m:/bar|parts/i,idea:'The shaded amount stays the same even if you cut the bar into more pieces — only the number of pieces changes.',check:'Is your shaded fraction the same size as before?'},
  {m:/=.*\/\?|\?\/ ?=|\/\? /,idea:'Equivalent fractions are the same amount with different numbers. Find the multiplier using the tops this time, then do the same to the bottom.',check:'Do both fractions simplify to the same thing?'},
  {idea:'Equivalent fractions are the same amount of pizza cut into a different number of slices. Whatever you multiply or divide the bottom by, do the same to the top.',check:'Simplify both fractions — they should be identical.'}],
 shapes:[
  {m:/parallel sides|right angles|acute angles|obtuse angles|equal sides/,idea:'Picture the shape (or sketch it). Parallel lines are like train tracks — they never meet. A right angle is a square corner. Acute is smaller than a square corner; obtuse is bigger.',check:'Trace each side with your finger and count again.'},
  {m:/How many (sides|vertices) does a/,idea:'The beginning of the name tells you the number: quad 4, penta 5, hexa 6, hepta 7, octa 8, nona 9, deca 10, dodeca 12.',check:'A polygon has the same number of sides as corners.'},
  {m:/FACES|EDGES|VERTICES/,idea:'Faces are the flat sides, edges are where two faces meet (the “lines”), vertices are the corners (the “points”).',check:'Euler’s check: faces + vertices − edges = 2.'},
  {m:/symmetry/i,idea:'A line of symmetry is a fold line where both halves match exactly, like a butterfly.',check:'Imagine folding along each line — do the halves sit on top of each other?'},
  {m:/quadrilateral/i,idea:'Any four-sided shape can be cut into two triangles, so its angles add to 2 × 180° = 360°.',check:'Add all four angles — 360°?'},
  {m:/ONE interior/,idea:'Cut the shape into triangles from one corner: (sides − 2) triangles. All the angles are equal in a regular shape, so share the total.',check:'Interior angle + exterior angle = 180°.'},
  {m:/isosceles/i,idea:'An isosceles triangle has two equal sides, and the two angles at the bottom of them are equal too. All three angles add to 180°.',check:'Add your two equal angles and the top one — 180°?'},
  {m:/parallelogram/i,idea:'A parallelogram is a pushed-over rectangle. Opposite angles are equal, and neighbouring angles add to 180°.',check:'Two different angles should add to 180°.'},
  {m:/kite/i,idea:'A kite has one pair of equal angles — the two side ones. All four angles add to 360°.',check:'Add all four — 360°?'},
  {m:/exterior/i,idea:'Walk around the shape: at each corner you turn by the exterior angle. One full walk round is a full turn: 360°.',check:'Sides × exterior angle = 360°.'},
  {m:/add up to/,idea:'Cut the shape into triangles from ONE corner. You get (sides − 2) triangles, each worth 180°.',check:'A triangle is 180°, a square 360° — does your answer grow by 180° per extra side?'},
  {m:/prism|pyramid|solid/i,idea:'Look at the end (or base) shape first, then build the rest: prisms have two matching ends joined by straight edges; pyramids meet at one point.',check:'Euler’s check: faces + vertices − edges = 2.'},
  {m:/sides|vertices/i,idea:'The beginning of the name tells you the number: penta 5, hexa 6, hepta 7, octa 8, nona 9, deca 10.',check:'A polygon has the same number of sides as corners.'},
  {idea:'Use what you know about the shape: equal sides, parallel sides, right angles. Sketch it if it helps.',check:'Trace it with your finger and count again.'}],
 measure:[
  {m:/AREA of this L/,idea:'Think of the L-shape as a big rectangle with a corner bitten out. First find the two missing side lengths, then take the bitten-out piece away.',check:'Opposite sides must add to the same total. Does your area make sense compared with the big rectangle?'},
  {m:/PERIMETER of this L|staircase.*PERIMETER/,idea:'Push the inside corners outwards in your head — the shape has the same perimeter as the rectangle around it.',check:'Add all the sides one by one to double-check.'},
  {m:/staircase/i,idea:'Split the staircase into rows: 1 step wide, 2 steps wide, 3 steps wide. Add the rows.',check:'The area must be less than the full rectangle around it.'},
  {m:/pencil|ruler/i,idea:'Check where the pencil STARTS — it might not be at zero! Read both ends in millimetres and find the gap.',check:'The length is end − start. Each cm has 10 small mm marks.'},
  {m:/tiles/i,idea:'Change metres into centimetres, then count how many tiles fit along each wall. Rows × columns = tiles.',check:'Tile area × number of tiles should equal the floor area.'},
  {m:/path/i,idea:'The path is a frame around the lawn. Big rectangle (lawn + path) minus the lawn = the path.',check:'The path adds its width to BOTH sides of each length.'},
  {m:/frame|border/i,idea:'The border is the outside rectangle with the inside rectangle taken away. The border is on BOTH sides, so take away twice its width.',check:'Inside area + border area = outside area?'},
  {m:/SMALLEST perimeter|LARGEST perimeter/,idea:'List all the rectangles that make that area. Close to a square = small perimeter; long and thin = big perimeter.',check:'Did you try every factor pair?'},
  {m:/represents/i,idea:'On a plan, every centimetre stands for a real distance. Multiply the plan length by that amount.',check:'The real length should be much bigger than the plan length.'},
  {m:/WIDTH/,idea:'Half the perimeter is one length + one width. Take the length away to find the width.',check:'2 × (length + width) should give the perimeter.'},
  {m:/SAME perimeter/,idea:'Find the rectangle’s perimeter, then share it between the 4 equal sides of the square.',check:'4 × side = the rectangle’s perimeter?'},
  {m:/triangle/i,idea:'A right-angled triangle is half a rectangle. Count the base and height, multiply, then halve.',check:'Count the whole squares inside — is it roughly the same?'},
  {idea:'Area is the number of squares inside. Count them or multiply across × down.',check:'Area is in cm², not cm.'}],
 data:[
  {m:/pictogram/i,idea:'Each ball is worth the number in the key, and half a ball is worth half of that.',check:'Count the whole balls × key, then add any half.'},
  {m:/table|timetable/i,idea:'Tables are like a map: go along the row and down the column to find the box. For “AND” questions, a team must pass BOTH rules.',check:'Point at each number you used. Is it in the right row AND column?'},
  {m:/pie chart/i,idea:'The whole circle (360°) is everybody. Work out how many people one slice of 30° stands for, then count the slices.',check:'All the groups should add up to the total number of people.'},
  {m:/line graph/i,idea:'A line graph shows how something changes over time. “Change” is the difference between two readings; the steepest bit is the biggest change.',check:'Read each point straight across to the scale.'},
  {m:/missing|MEAN/,idea:'Mean × how many = the total. If you know the total, take away the bars you can see.',check:'Add all the bars (including yours) and divide — do you get the mean?'},
  {idea:'Read the title, the labels and the SCALE first. What is each gridline worth?',check:'Re-read the bar from the scale. Did you count each gridline correctly?'}],
 tiffin:[
  {m:/1\/\d+ \+/,idea:'You can only add fractions when the slices are the same size. Change both to the same bottom number, add the tops, then simplify.',check:'Is your answer simplified? Is it bigger than each fraction on its own?'},
  {m:/Work out \d+ − /,idea:'Subtraction by place value. If the top digit is too small, exchange 10 from the next column.',check:'Add your answer to the number you took away — do you get the first number?'},
  {m:/rope/i,idea:'Lengths in different units are like different coins. Change them all to millimetres first, take them away, then change back to metres.',check:'1 m = 1000 mm. Is the rope left less than you started with?'},
  {m:/flies/i,idea:'Two clocks! First work out the landing time on the London clock, then move the clock forwards or backwards for the other city.',check:'Ahead means add hours; behind means take hours away.'},
  {m:/year/i,idea:'Most years have 365 days, but leap years (divisible by 4) have 366. Then it is just days × amount per day.',check:'Is the year a leap year? Did you use the right number of days?'},
  {m:/VALUE/,idea:'A digit’s value depends on its column: thousands, hundreds, tens, ones . tenths, hundredths, thousandths.',check:'Write the number with the column headings above it.'},
  {m:/packet/i,idea:'This is a swap chain: mini packets swap for standard ones, which swap for mega ones. Work out one standard packet first.',check:'Both sides of each swap should have the same number of stickers.'},
  {m:/multiple of/i,idea:'Start with the biggest three-digit numbers that use both digits and test each one with a divisibility trick.',check:'Divide your answer by the number — no remainder? Is there a bigger one that works?'},
  {m:/months old/i,idea:'12 months make a year, and whole years don’t change the birthday month. Only the leftover months move you back.',check:'Count forwards from your month by the leftover months — do you reach November?'},
  {m:/shortcut/i,idea:'Use a friendly number: × 25 is × 100 ÷ 4, × 9 is × 10 then take one lot away, × 11 is × 10 then add one lot.',check:'Round both numbers to estimate — is your answer close?'},
  {m:/sequence/i,idea:'The fractions have been simplified to hide the pattern. Write them all with the same bottom number and the pattern pops out.',check:'Do the tops go up by the same amount each time?'},
  {m:/palindrome/i,idea:'A palindrome reads the same backwards. The minutes must be the hour digits reversed — and minutes only go up to 59.',check:'Does your next time really read the same both ways?'},
  {idea:'Unfamiliar question? Read it twice, try a small example, and look for the pattern.',check:'Re-read the last sentence and check you answered exactly that.'}]
};
// Key words: the CAPITAL words in a question are the ones Apollo must not miss.
const keyWords=[
 [/\bLEFT\b/,'LEFT','take away what has gone and find what is still there.'],
 [/\bTOTAL\b|\bALTOGETHER\b|\baltogether\b/,'TOTAL / ALTOGETHER','add everything together.'],
 [/\bMORE\b/,'MORE','find the difference: bigger take away smaller.'],
 [/\bREMAINING\b|\bremain/,'REMAINING','work with what is left, not the starting amount.'],
 [/\bNEW\b/,'NEW','use the changed amount, not the original.'],
 [/\bDISCOUNT\b/,'DISCOUNT','the amount knocked off the price.'],
 [/\bSALE\b/,'SALE','the price after the discount.'],
 [/\bNOT\b(?! TO SCALE)/,'NOT','count only the ones that are not that.'],
 [/\bMEAN\b/,'MEAN','share the total out equally.'],
 [/\bMEDIAN\b/,'MEDIAN','the middle value when lined up in order.'],
 [/\bRANGE\b/,'RANGE','biggest take away smallest.'],
 [/\bAREA\b/,'AREA','the squares INSIDE a shape (cm²).'],
 [/\bPERIMETER\b/,'PERIMETER','the distance all the way AROUND the edge.'],
 [/\bVOLUME\b/,'VOLUME','the cubes that fill a 3D shape (cm³).'],
 [/\bSIMPLEST\b|\bSimplify\b/,'SIMPLEST','divide top and bottom by the same number until you can’t.'],
 [/\bTOGETHER\b/,'TOGETHER','the first time both happen at once.'],
 [/\bSMALLER\b|\bSMALLEST\b/,'SMALLER / SMALLEST','give the little one, not the big one.'],
 [/\bLARGER\b|\bLARGEST\b|\bBIGGEST\b/,'LARGER / LARGEST','give the big one, not the little one.'],
 [/\bEACH\b|\bONE\b(?! interior| exterior)/,'ONE / EACH','find the amount for just one.'],
 [/\bAND\b/,'AND','BOTH rules must be true.'],
 [/\bFEWER\b/,'FEWER','less than — equal does not count.'],
 [/\bEXTERIOR\b/,'EXTERIOR','the angle OUTSIDE the shape — the turn at each corner.'],
 [/\bFACES\b/,'FACES','the flat surfaces.'],[/\bEDGES\b/,'EDGES','the lines where two faces meet.'],[/\bVERTICES\b/,'VERTICES','the corners.'],
 [/\bVALUE\b/,'VALUE','what the digit is worth in its column.'],
 [/\bMONTH\b/,'MONTH','your answer is the name of a month.'],
 [/\bDECIMAL\b|\bdecimal\b/,'DECIMAL','your answer may have a decimal point.'],
 [/\bSOLID\b/,'SOLID','no gaps — hidden cubes still count.'],
 [/\bVISIBLE\b/,'VISIBLE','only the part you can still see.'],
 [/\b(SECOND|THIRD|SIXTH)\b/,'WHICH ONE?','check exactly which one they want.'],
 [/\b(MINUTES|HOURS|GRAMS|CENTIMETRES|MILLIMETRES|MILLILITRES|LITRES|METRES|PAGES|LINES)\b/,'UNITS IN CAPITALS','give your answer in that unit — convert first if you need to.'],
 [/\bTIME\b|24-hour/,'TIME','give a clock time using the 24-hour clock, like 13:05.']
];
// Build the explainer for one question. Pure function: question object in, plain data out.
function buildExplainer(q,topicKey){
 const text=q.q.replace(/\s*\n\s*/g,' ').trim();
 const sentences=text.match(/[^.?!]+[.?!]+["”]?|[^.?!]+$/g)||[text];
 const asks=sentences.map(s=>s.trim()).filter(s=>/\?$/.test(s));
 let asking=asks.length?asks[asks.length-1]:sentences[sentences.length-1].trim();
 if(/^(Find the missing|Work out|Simplify|Write)/.test(text)&&text.length<120)asking=text;
 asking=asking.replace(/\s*\((marked )?in red\)/,'');
 const list=explainers[topicKey]||[{idea:'Read it twice and draw a picture.',check:'Re-read the question.'}];
 const ex=list.find(e=>!e.m||e.m.test(q.q));
 const keys=[];for(const[re,word,means]of keyWords){if(re.test(q.q)&&!keys.some(k=>k.word===word))keys.push({word,means});if(keys.length===3)break;}
 return{asking,keys,idea:ex.idea,plan:q.h.slice(0,3),check:ex.check};
}
