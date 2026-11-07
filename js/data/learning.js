'use strict';
// DATA: Learn missions for the Focus Zone — short steps, each followed by a quick check — and the rules for learning points.
// Learning points are ONLY given for proof of learning: reading for long enough while active AND answering the check correctly.
// Each check: q, options (the FIRST option is the correct one — the app shuffles them), why (shown after answering).
const LEARN={
 minRead:6,maxRead:25,wordsPerSec:3,      // reading gate: seconds of ACTIVE time per step = words ÷ 3, between 6 and 25
 idleAfter:45,                             // no tap/scroll/key for 45 s pauses the reading timer
 stepFirst:8,stepSecond:4,                 // check right first time / second time (third try earns nothing)
 lessonBonus:25,lessonsPerDay:1,           // full points for each lesson once per day (repeats are welcome but earn nothing)
 example:3,examplesPerTopicDay:5,exampleStepSecs:3, // Example Studio: study every step of a worked example
 twin:15,                                  // "Prove it" twin question right first time after viewing the method
 explainRight:3,                           // used "Explain it simply" and then got the question right
 focusFirst:10,focusLater:3,               // Focus topic answer: right first time / right after a retry
 streak:{3:15,5:30,10:75},                 // Focus streaks (right first time in a row, Focus topics only)
 mastery:[[60,100],[80,200],[95,300]]      // readiness milestones per Focus topic (needs 10+ recent answers): [readiness %, bonus]
};
const learnMissions={
 volume:[
  {title:'What is volume?',blocks:[{p:'<b>Volume</b> is how much space is inside a 3D shape. We measure it by counting <b>cubes</b>.'},{fig:F('cubes',3,2,2)},{p:'This solid shape is 3 cubes long, 2 cubes deep and 2 cubes high. Count one layer, then count the layers.'}],
   check:{q:'How many 1 cm cubes make the shape above?',options:['12','7','10','6'],why:'One layer is 3 × 2 = 6 cubes. There are 2 layers, so 6 × 2 = 12.'}},
  {title:'Length × width × height',blocks:[{fig:F('cuboid',5,3,4,{l:'5 cm',w:'3 cm',h:'4 cm'})},{eg:'One layer = 5 × 3 = 15 cubes.<br>4 layers → 15 × 4 = <b>60 cm³</b>.'},{p:'So for any cuboid: <b>Volume = length × width × height</b>.'}],
   check:{q:'A cuboid is 6 cm × 2 cm × 5 cm. What is its volume?',options:['60 cm³','13 cm³','30 cm³','120 cm³'],why:'6 × 2 = 12 in one layer, × 5 layers = 60 cm³. (13 is what you get if you ADD — volume multiplies!)'}},
  {title:'Cubic units',blocks:[{p:'<b>cm³</b> means “cubes with 1 cm edges”. Area uses square units (cm²) because it has 2 measurements. Volume uses cubic units (cm³) because it has 3 measurements.'},{ul:['Length → cm','Area → cm²','Volume → cm³']}],
   check:{q:'Which unit would you use for the space inside a fish tank?',options:['cm³','cm²','cm','kg'],why:'Space inside a 3D shape is volume, so it is measured in cubic units like cm³.'}},
  {title:'Capacity: millilitres and litres',blocks:[{p:'A 1 cm cube holds exactly <b>1 ml</b> of water. <b>1000 ml = 1 litre</b>.'},{eg:'A tank 20 cm × 10 cm × 10 cm = 2000 cm³ = 2000 ml = <b>2 litres</b>.'}],
   check:{q:'A box holds 3000 cm³ of water. How many litres is that?',options:['3 litres','30 litres','300 litres','0.3 litres'],why:'3000 cm³ = 3000 ml, and 3000 ÷ 1000 = 3 litres.'}},
  {title:'Finding a missing side',blocks:[{p:'If you know the volume and two sides, work backwards: <b>divide</b> the volume by the area of the base.'},{fig:F('cuboid',4,6,4,{l:'4 cm',w:'6 cm',h:'?'})},{eg:'Volume 96 cm³. Base = 4 × 6 = 24 cm². Height = 96 ÷ 24 = <b>4 cm</b>.'}],
   check:{q:'A cuboid has volume 120 cm³, length 5 cm and width 4 cm. What is its height?',options:['6 cm','111 cm','24 cm','20 cm'],why:'Base = 5 × 4 = 20 cm². Height = 120 ÷ 20 = 6 cm.'}},
  {title:'The cubes-in-a-box trap',blocks:[{p:'How many <b>2 cm</b> cubes fit in a box 6 cm × 4 cm × 2 cm? Don’t divide the volume by 2! Count how many fit along each edge.'},{eg:'Along: 6 ÷ 2 = 3. Across: 4 ÷ 2 = 2. Up: 2 ÷ 2 = 1. Cubes = 3 × 2 × 1 = <b>6</b>.'}],
   check:{q:'How many 2 cm cubes fit inside a box that is 4 cm × 4 cm × 4 cm?',options:['8','32','16','64'],why:'2 cubes fit along each edge: 2 × 2 × 2 = 8. Each 2 cm cube is 8 cm³, and 64 ÷ 8 = 8 too.'}}],
 equivfrac:[
  {title:'Same amount, different slices',blocks:[{p:'<b>Equivalent fractions</b> are the same amount cut into a different number of pieces.'},{fig:F('barModel',4,2)},{fig:F('barModel',8,4)},{p:'2/4 and 4/8 shade exactly the same amount — both are one half.'}],
   check:{q:'Which fraction is equal to 1/2?',options:['4/8','2/6','3/4','1/4'],why:'4/8: 4 is half of 8. The others are not half.'}},
  {title:'Multiply top AND bottom',blocks:[{p:'<b>Whatever you do to the bottom, do to the top.</b>'},{eg:'2/3 = ?/12 → 3 × 4 = 12, so 2 × 4 = <b>8</b>. 2/3 = 8/12.'}],
   check:{q:'3/5 = ?/20',options:['12','15','8','4'],why:'5 × 4 = 20, so multiply the top by 4 too: 3 × 4 = 12.'}},
  {title:'Simplifying',blocks:[{p:'To simplify, divide top and bottom by the <b>biggest</b> number that goes into both (the highest common factor).'},{eg:'18/24: both divide by 6 → <b>3/4</b>.'}],
   check:{q:'What is 12/16 in its simplest form?',options:['3/4','6/8','4/5','2/3'],why:'12 and 16 both divide by 4: 12 ÷ 4 = 3 and 16 ÷ 4 = 4. (6/8 is equal, but can still be simplified.)'}},
  {title:'When it isn’t a multiple — simplify first',blocks:[{p:'12/20 = ?/35. 35 isn’t a multiple of 20, so simplify first, then scale up.'},{eg:'12/20 = 3/5 (÷ 4). 5 × 7 = 35, so 3 × 7 = <b>21</b>.'}],
   check:{q:'8/12 = ?/15',options:['10','11','12','9'],why:'8/12 = 2/3 (÷ 4). 3 × 5 = 15, so 2 × 5 = 10.'}},
  {title:'Answers can be decimals',blocks:[{p:'Sometimes the missing number isn’t a whole number — that’s fine.'},{eg:'18/50 = ?/30. 50 and 30 share 10, so divide by 5: 18/50 = 3.6/10. Multiply by 3: <b>10.8</b>/30.<br><span class="mini">Check: 18 × 30 ÷ 50 = 540 ÷ 50 = 10.8 ✓</span>'}],
   check:{q:'9/10 = ?/5',options:['4.5','4','45','9'],why:'10 ÷ 2 = 5, so divide the top by 2 as well: 9 ÷ 2 = 4.5.'}},
  {title:'Comparing fractions',blocks:[{p:'To compare, give both fractions the <b>same denominator</b>, then compare the tops.'},{eg:'3/4 or 5/8? 3/4 = 6/8, and 6/8 is bigger than 5/8.'}],
   check:{q:'Which is bigger: 2/3 or 3/5?',options:['2/3','3/5','They are the same'],why:'Use fifteenths: 2/3 = 10/15 and 3/5 = 9/15. 10/15 is bigger.'}}],
 shapes:[
  {title:'Angle facts',blocks:[{ul:['Angles in a <b>triangle</b> add to <b>180°</b>.','Angles in a <b>quadrilateral</b> add to <b>360°</b>.','Angles on a <b>straight line</b> add to <b>180°</b>.','Angles <b>around a point</b> add to <b>360°</b>.']}],
   check:{q:'Two angles of a triangle are 50° and 60°. What is the third?',options:['70°','110°','250°','90°'],why:'50 + 60 = 110, and 180 − 110 = 70°.'}},
  {title:'Quadrilaterals',blocks:[{table:{head:['Shape','Parallel pairs','Right angles'],rows:[['Square','2','4'],['Rectangle','2','4'],['Parallelogram','2','0'],['Rhombus','2','0'],['Trapezium','1','0 (sometimes 2)'],['Kite','0','0 (sometimes 1)']]}}],
   check:{q:'Which shape has exactly ONE pair of parallel sides?',options:['Trapezium','Parallelogram','Rhombus','Rectangle'],why:'A trapezium has exactly one pair of parallel sides. The others have two pairs.'}},
  {title:'Lines of symmetry',blocks:[{p:'A line of symmetry is a fold line where both halves match exactly.'},{ul:['Square: 4','Rectangle: 2','Equilateral triangle: 3','Regular hexagon: 6 (regular shapes: same as the number of sides)','Parallelogram: 0']}],
   check:{q:'How many lines of symmetry does a rectangle (that is not a square) have?',options:['2','4','1','0'],why:'Only the lines through the middle of opposite sides work. The diagonals don’t fold a rectangle onto itself.'}},
  {title:'Angles inside any polygon',blocks:[{p:'Split the shape into triangles from ONE corner. You always get <b>(sides − 2)</b> triangles, each 180°.'},{fig:F('angle',F('reg',6),['120°','120°','120°','120°','120°','120°'],{off:24})},{eg:'Hexagon: (6 − 2) × 180 = 720°. Regular, so each angle = 720 ÷ 6 = 120°.'}],
   check:{q:'What do the interior angles of a pentagon add up to?',options:['540°','360°','720°','900°'],why:'(5 − 2) × 180 = 3 × 180 = 540°.'}},
  {title:'Exterior angles',blocks:[{p:'Walk around a shape: at each corner you turn by the <b>exterior angle</b>. One full walk = 360°.'},{eg:'Regular polygon: exterior = 360 ÷ sides. Interior + exterior = 180°.'}],
   check:{q:'What is the exterior angle of a regular octagon (8 sides)?',options:['45°','135°','40°','60°'],why:'360 ÷ 8 = 45°. (135° is the interior angle: 180 − 45.)'}},
  {title:'3D shapes',blocks:[{table:{head:['Shape','Faces','Edges','Vertices'],rows:[['Cube / cuboid','6','12','8'],['Triangular prism','5','9','6'],['Square-based pyramid','5','8','5'],['Tetrahedron','4','6','4']]}},{p:'Check with Euler: faces + vertices − edges = 2.'}],
   check:{q:'How many edges does a triangular prism have?',options:['9','6','5','12'],why:'3 edges on each triangle end (6) plus 3 joining them = 9.'}}],
 measure:[
  {title:'Perimeter or area?',blocks:[{p:'<b>Perimeter</b> = distance all the way round the edge (cm). <b>Area</b> = how many squares fit inside (cm²).'},{eg:'A 6 cm × 4 cm rectangle: perimeter = 6 + 4 + 6 + 4 = 20 cm. Area = 6 × 4 = 24 cm².'}],
   check:{q:'A rectangle is 7 cm by 3 cm. What is its PERIMETER?',options:['20 cm','21 cm','10 cm','21 cm²'],why:'7 + 3 + 7 + 3 = 20 cm. (21 cm² is the area.)'}},
  {title:'Triangles are half a rectangle',blocks:[{fig:F('grid',10,6,[[2,5],[8,5],[2,1]])},{p:'This right-angled triangle is half of a 6 × 4 rectangle: (6 × 4) ÷ 2 = 12 cm².'}],
   check:{q:'A triangle has a base of 8 cm and a perpendicular height of 5 cm. What is its area?',options:['20 cm²','40 cm²','13 cm²','26 cm²'],why:'8 × 5 = 40, and half of 40 is 20 cm².'}},
  {title:'L-shapes',blocks:[{fig:F('shape',[[0,0],[6,0],[6,3],[10,3],[10,8],[0,8]],['6 cm','3 cm','?','5 cm','10 cm','8 cm'])},{p:'Find missing sides first: opposite sides add up to the same total.'},{eg:'Area = big rectangle − missing corner = 10 × 8 − 4 × 3 = 68 cm².'}],
   check:{q:'In the L-shape above, how wide is the side marked “?”',options:['4 cm','6 cm','10 cm','5 cm'],why:'The whole width is 10 cm and the top edge is 6 cm, so 10 − 6 = 4 cm.'}},
  {title:'Convert first!',blocks:[{ul:['10 mm = 1 cm','100 cm = 1 m','1000 m = 1 km']},{p:'Before adding, taking away or multiplying, change everything into the <b>same unit</b>.'}],
   check:{q:'How many centimetres is 2.4 m?',options:['240 cm','24 cm','2400 cm','204 cm'],why:'1 m = 100 cm, so 2.4 × 100 = 240 cm.'}},
  {title:'Reading a ruler',blocks:[{fig:F('ruler',13,52)},{p:'Check where it <b>starts</b> — it might not be at 0! Length = end − start.'},{eg:'52 mm − 13 mm = <b>39 mm</b>.'}],
   check:{q:'A pencil starts at 2.5 cm and ends at 9.1 cm. How long is it in mm?',options:['66 mm','91 mm','116 mm','6.6 mm'],why:'9.1 cm = 91 mm and 2.5 cm = 25 mm. 91 − 25 = 66 mm.'}},
  {title:'Same area, different perimeters',blocks:[{p:'Rectangles with the same area can have different perimeters. The closer to a <b>square</b>, the smaller the perimeter.'},{eg:'Area 24: 1 × 24 (perimeter 50), 2 × 12 (28), 3 × 8 (22), 4 × 6 (20 — smallest).'}],
   check:{q:'A rectangle has area 36 cm² and whole-number sides. What is the SMALLEST perimeter?',options:['24 cm','26 cm','40 cm','74 cm'],why:'6 × 6 is closest to a square: perimeter = 6 + 6 + 6 + 6 = 24 cm.'}}],
 data:[
  {title:'Read the scale first',blocks:[{fig:F('bar',['Mon','Tue','Wed','Thu'],[12,18,6,14],2,'Goals')},{p:'Every gridline here is worth <b>2</b>. Always check the scale before reading a bar.'}],
   check:{q:'In the chart above, how many goals were scored on Tuesday?',options:['18','9','16','20'],why:'The Tuesday bar reaches 18 on the scale.'}},
  {title:'Differences and totals',blocks:[{p:'“How many more” means <b>bigger − smaller</b>. “Altogether” means <b>add</b>.'},{fig:F('bar',['Mon','Tue','Wed','Thu'],[12,18,6,14],2,'Goals')}],
   check:{q:'What is the difference between the most and the fewest goals in this chart?',options:['12','18','6','24'],why:'Most = 18 (Tue), fewest = 6 (Wed). 18 − 6 = 12.'}},
  {title:'The mean',blocks:[{p:'The <b>mean</b> is fair sharing: add everything up, then divide by how many there are.'},{eg:'Mean of 12, 18, 6 and 14 = 50 ÷ 4 = 12.5'}],
   check:{q:'What is the mean of 4, 7 and 10?',options:['7','21','6','10'],why:'4 + 7 + 10 = 21, and 21 ÷ 3 = 7.'}},
  {title:'Pictograms',blocks:[{fig:F('picto',['Apollo','Ben'],[14,9],2,'goals')},{p:'Always read the <b>key</b>. Half a symbol is worth half the key.'}],
   check:{q:'In a pictogram, ⚽ = 4 goals. How many goals do 3½ balls show?',options:['14','12','3.5','16'],why:'3 × 4 = 12, plus half of 4 = 2. Total 14.'}},
  {title:'Pie charts',blocks:[{fig:F('pie',['Football','Swimming','Netball','Tennis'],[180,90,60,30])},{p:'The whole circle (360°) is <b>everybody</b>. 180° is a half, 90° is a quarter.'}],
   check:{q:'60 children are shown in a pie chart. How many does a 90° slice show?',options:['15','90','30','6'],why:'90° is a quarter of 360°, and a quarter of 60 is 15.'}},
  {title:'Tables and timetables',blocks:[{fig:F('table',['Stop','Bus 1','Bus 2'],[['Kingston','09:20','09:47'],['Richmond','09:41','10:08'],['Kew','09:52','10:15']])},{p:'Go along the row and down the column. To find a journey time, count on from one time to the other.'}],
   check:{q:'Bus 2 leaves Kingston at 09:47 and reaches Kew at 10:15. How long is the journey?',options:['28 minutes','32 minutes','68 minutes','38 minutes'],why:'09:47 → 10:00 is 13 minutes, then 10:00 → 10:15 is 15 more. 13 + 15 = 28 minutes.'}}]
};
const stepText=step=>step.blocks.map(b=>[b.p,b.eg,b.mini,...(b.ul||[]),...(b.ol||[]),...(b.table?[...b.table.head,...b.table.rows.flat()]:[])].filter(Boolean).join(' ')).join(' ')+' '+step.check.q;
const readSecs=step=>{const words=stepText(step).replace(/<[^>]*>/g,' ').split(/\s+/).filter(w=>/[a-z0-9]/i.test(w)).length+(step.blocks.some(b=>b.fig)?8:0);return Math.max(LEARN.minRead,Math.min(LEARN.maxRead,Math.round(words/LEARN.wordsPerSec)));};
