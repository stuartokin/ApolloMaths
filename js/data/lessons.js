'use strict';
// DATA: Focus Zone mini-lessons. Each lesson is a list of content blocks; js/render/render.js draws them.
// Block types: h (heading), p (paragraph), fig (figure spec), eg (worked example box), ul / ol (lists), table {head, rows}, mini (small print).
const lessons={
 volume:[
  {h:'📦 Volume in 60 seconds'},
  {p:'<b>Volume</b> = how much SPACE is inside a 3D shape, counted in cubes. Units: <b>cm³</b> or <b>m³</b>.'},
  {fig:F('cuboid',5,3,4,{l:'5 cm',w:'3 cm',h:'4 cm'})},
  {eg:'<b>Cuboid:</b> length × width × height<br>One layer = 5 × 3 = 15 cubes · 4 layers → 15 × 4 = <b>60 cm³</b>'},
  {ul:['<b>Missing side?</b> Volume ÷ (the other two). 60 ÷ (5 × 3) = 4.','<b>Capacity:</b> 1 cm³ holds 1 ml · 1000 cm³ = 1 litre.','<b>Cubes in a box:</b> how many fit along EACH edge, then multiply. (A 2 cm cube is 8 cm³, not 2!)','<b>Trap:</b> area is cm² (2 measurements), volume is cm³ (3 measurements).']}
 ],
 equivfrac:[
  {h:'🔁 Equivalent fractions — even the awkward ones'},
  {p:'Golden rule: <b>whatever you do to the bottom, do to the top.</b>'},
  {fig:F('barModel',6,4)},{fig:F('barModel',9,6)},
  {mini:'4/6 and 6/9 are both 2/3 of the bar.'},
  {eg:'<b>Example: 12/20 = ?/35</b><br>35 isn’t a multiple of 20 → <b>simplify first</b>: 12/20 = 3/5 (÷ 4)<br>5 × 7 = 35, so 3 × 7 = <b>21</b> → 21/35'},
  {eg:'<b>The tricky one: 18/50 = ?/30</b><br>50 and 30 share 10 → divide by 5: 18/50 = 3.6/10<br>Multiply by 3: 3.6 × 3 = <b>10.8</b> → 10.8/30<br><span class="mini">Check: 18 × 30 ÷ 50 = 540 ÷ 50 = 10.8 ✓. Not every answer is a whole number! (A paper that wants a whole number would use something like 18/45 = 12/30.)</span>'},
  {ul:['<b>Simplest form:</b> divide top and bottom by the highest common factor.','<b>Comparing:</b> give both fractions the same denominator.','<b>Shortcut:</b> ? = top × new bottom ÷ old bottom.']}
 ],
 shapes:[
  {h:'🔷 Properties of shapes — the cheat sheet'},
  {table:{head:['Shape','Parallel pairs','Equal sides','Lines of symmetry'],rows:[['Square','2','all 4','4'],['Rectangle','2','opposite','2'],['Rhombus','2','all 4','2'],['Parallelogram','2','opposite','0'],['Trapezium','1','—','0 (1 if isosceles)'],['Kite','0','2 pairs next to each other','1']]}},
  {eg:'<b>Angle facts:</b> triangle 180° · quadrilateral 360° · straight line 180° · round a point 360°<br><b>Any polygon:</b> (sides − 2) × 180° · regular exterior angle = 360° ÷ sides'},
  {fig:F('angle',F('reg',6),['120°','120°','120°','120°','120°','120°'],{off:24})},
  {table:{head:['3D shape','Faces','Edges','Vertices'],rows:[['Cube / cuboid','6','12','8'],['Triangular prism','5','9','6'],['Square-based pyramid','5','8','5'],['Tetrahedron','4','6','4']]}},
  {mini:'Prism with n-sided ends: n + 2 faces, 3n edges, 2n vertices. Check: faces + vertices − edges = 2.'}
 ],
 measure:[
  {h:'📐 Measuring space'},
  {ul:['<b>Perimeter</b> = distance all the way round (cm). <b>Area</b> = squares inside (cm²).','<b>Convert first!</b> 10 mm = 1 cm · 100 cm = 1 m · 1000 m = 1 km']},
  {fig:F('shape',[[0,0],[6,0],[6,3],[10,3],[10,8],[0,8]],['6 cm','3 cm','?','5 cm','10 cm','8 cm'])},
  {eg:'<b>L-shapes:</b> find missing sides first — opposite sides add to the same total. Missing top-right = 10 − 6 = 4 cm.<br>Area = big rectangle − corner = 10 × 8 − 4 × 3 = 80 − 12 = <b>68 cm²</b><br>Perimeter = same as the surrounding rectangle = 2 × (10 + 8) = <b>36 cm</b>'},
  {fig:F('ruler',13,52)},
  {eg:'<b>Rulers:</b> the pencil starts at 13 mm, not 0! Length = 52 − 13 = <b>39 mm</b>.'},
  {ul:['<b>Fixed area, smallest perimeter?</b> Make it as close to a square as possible.','<b>Tiles/paths:</b> sketch it, and count how many fit along each side.']}
 ],
 data:[
  {h:'📊 Reading data like a detective'},
  {ol:['Read the <b>title</b> and <b>labels</b>.','Find the <b>scale</b> — what is each gridline worth?','Read carefully, write the numbers down, THEN calculate.']},
  {fig:F('bar',['Mon','Tue','Wed','Thu'],[12,18,6,14],2,'Goals')},
  {eg:'Each line = 2. Most = 18 (Tue), least = 6 (Wed) → difference 12. Mean = (12 + 18 + 6 + 14) ÷ 4 = 50 ÷ 4 = 12.5'},
  {fig:F('picto',['Apollo','Ben'],[14,9],2,'goals')},
  {eg:'<b>Pictograms:</b> use the key. ⚽ = 2, so half = 1. Apollo = 7 × 2 = 14; Ben = 4 × 2 + 1 = 9.'},
  {ul:['<b>Line graphs:</b> “change” = difference between two readings. Steepest line = biggest change.','<b>Pie charts:</b> the whole circle (360°) is everybody. 90° = ¼, 180° = ½.','<b>Tables/timetables:</b> go along the row and down the column. For “AND” questions, tick rows for rule 1, then test rule 2.']}
 ]
};
