'use strict';
// DATA: topic list (label, emoji, three coaching moves). focus:true puts a topic in the Focus Zone.
Object.assign(topics,{
 ratio:{label:'Ratios & shares',emoji:'🔴',coach:['Draw equal-sized parts for each ratio number.','If you know a difference, subtract the ratio parts first.','Find the value of ONE part, then multiply.']},
 fractions:{label:'Fractions & remainders',emoji:'🍕',coach:['Work out what the fraction is OF.','For a fraction of an amount: divide by the bottom, multiply by the top.','If a second fraction is of the remainder, change the starting amount.']},
 percent:{label:'Percentages & money',emoji:'💰',coach:['10% is divide by 10; 5% is half of 10%; 25% is a quarter.','For discounts, subtract the discount from the original price.','After a price change, your next percentage uses the NEW price.']},
 geometry:{label:'Shapes & measures',emoji:'📐',coach:['Sketch the shape and label the measurements.','Perimeter means distance around; area means space inside.','For a missing side, first find the total side lengths you know.']},
 patterns:{label:'Patterns & factors',emoji:'🕵️',coach:['Find differences between neighbouring numbers.','Check doubling, multiplying or adding.','For whole-number puzzles, list factor pairs systematically.']},
 time:{label:'Time & journeys',emoji:'⏱️',coach:['Break times into hours, then minutes.','Cross the hour boundary carefully.','For speed, distance and time, keep units consistent.']},
 units:{label:'Units & conversion',emoji:'📏',coach:['Convert every number into the SAME unit before calculating.','1 m = 100 cm; 1 cm = 10 mm; 1 kg = 1000 g.','Read the required answer unit before you finish.']},
 logic:{label:'Logic & story puzzles',emoji:'💥',coach:['Use a bar model, mini table or equation to organise facts.','Work backwards if the question ends with a known total.','Check your result against ALL conditions, not just one.']}
});
Object.assign(topics,{
 algebra:{label:'Missing numbers & equations',emoji:'🧩',coach:['Name the unknown number n.','Undo operations in reverse order.','Substitute your answer to check both sides agree.']},
 averages:{label:'Averages & tables',emoji:'📊',coach:['Mean = total ÷ number of items.','Missing value = required total − known values.','For range, subtract the lowest from the highest.']},
 probability:{label:'Chance & combinations',emoji:'🎲',coach:['Count favourable outcomes AND total outcomes.','For combinations, make a systematic list or multiplication grid.','For probability as a percentage, scale the fraction to 100.']},
 coordinates:{label:'Coordinates & angles',emoji:'🧭',coach:['Coordinates are (across, up): x first, then y.','A straight line is 180°, around a point is 360°.','For a triangle, angles add to 180°.']},
 divisibility:{label:'Primes, multiples & factors',emoji:'🔢',coach:['List multiples/factors systematically.','For simultaneous repeats find the lowest common multiple.','A prime has exactly two positive factors.']},
 speed:{label:'Speed, distance & rates',emoji:'🏎️',coach:['Distance = speed × time.','Keep the units consistent.','Find a unit rate first if you are unsure.']},
 area:{label:'Tricky areas & perimeter',emoji:'🏟️',coach:['Divide a complicated shape into rectangles or subtract a missing piece.','Area is measured in square units.','When a square is cut from a corner, trace the new perimeter carefully.']},
 sequences:{label:'Sequences & number magic',emoji:'✨',coach:['Check the differences, then the differences of differences.','Look at squares, triangular numbers and doubling patterns.','Make sure your rule works for every number given.']},
 reasoning:{label:'Logic detective missions',emoji:'🕵️‍♂️',coach:['Organise information in a table or diagram.','Translate the words into simple number relationships.','Work backwards and check every clue.']}
});
Object.assign(topics,{
 volume:{label:'Volume & capacity',emoji:'📦',focus:true,coach:['Volume = length × width × height (count one layer, then multiply by the layers).','Volume is in CUBIC units: cm³ or m³. 1 cm³ holds 1 ml, and 1000 cm³ = 1 litre.','Missing side? Divide the volume by the two sides you know.']},
 equivfrac:{label:'Equivalent fractions',emoji:'🔁',focus:true,coach:['Whatever you do to the bottom, do to the top.','If the new denominator is not a multiple, SIMPLIFY first, then scale up.','Bridge trick: ? = top × new bottom ÷ old bottom (e.g. 18/50 = ?/30 → 18 × 30 ÷ 50).']},
 shapes:{label:'Properties of shapes',emoji:'🔷',focus:true,coach:['Triangle angles total 180°; quadrilaterals total 360°.','Any polygon: (number of sides − 2) × 180°. Exterior angles of a regular polygon = 360° ÷ sides.','Prism with an n-sided end: n + 2 faces, 3n edges, 2n vertices.']},
 measure:{label:'Measuring space',emoji:'📐',focus:true,coach:['Perimeter = distance around (cm). Area = squares inside (cm²).','For an L-shape, find the missing sides first: opposite sides add up to the same total.','Convert to the SAME units before you calculate.']},
 data:{label:'Representing data',emoji:'📊',focus:true,coach:['Read the title, the axis labels and the SCALE before anything else.','Pictograms: check the key — half a symbol is half the key value.','Tables: tick every row that passes the first rule, THEN check the second rule.']},
 tiffin:{label:'Tiffin-style puzzles',emoji:'🏫',coach:['These copy the TYPES of question in Tiffin’s own illustrative paper.','Write units, time zones and conversions down as you go.','Unfamiliar format? Read twice, try a small example, then look for the pattern.']}
});
const focusKeys=Object.keys(topics).filter(k=>topics[k].focus);
