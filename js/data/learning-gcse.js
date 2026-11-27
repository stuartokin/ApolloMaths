'use strict';
// DATA: Learn missions and "Explain it simply" for the GCSE topics (questions-gcse.js). Maths between \( \) is drawn by KaTeX.
(function(){
const M=(title,blocks,q,options,why)=>({title,blocks,check:{q,options,why}});
Object.assign(learnMissions,{
 gcse_number:[
  M('Index laws',[{ul:['\\(a^m \\times a^n = a^{m+n}\\)','\\(a^m \\div a^n = a^{m-n}\\)','\\((a^m)^n = a^{mn}\\)','\\(a^0 = 1\\), \\(a^{-n} = \\frac{1}{a^n}\\)']}],'Simplify 3⁴ × 3⁵ ÷ 3² as a power of 3.',['3⁷','3²⁰','3¹¹','3³'],'4 + 5 − 2 = 7.'),
  M('Fractional powers',[{p:'The bottom of the fraction is the root; the top is the power.'},{eg:'\\(27^{\\frac{2}{3}} = (\\sqrt[3]{27})^2 = 3^2 = 9\\)'}],'What is 16^(3/4)?',['8','12','64','2'],'⁴√16 = 2, and 2³ = 8.'),
  M('Surds',[{p:'Split out the biggest square factor.'},{eg:'\\(\\sqrt{72} = \\sqrt{36}\\times\\sqrt{2} = 6\\sqrt{2}\\)'}],'Simplify √50.',['5√2','2√5','25√2','10√5'],'50 = 25 × 2, so √50 = 5√2.'),
  M('Standard form',[{p:'\\(a \\times 10^n\\) with \\(1 \\le a < 10\\).'},{eg:'\\((3\\times10^4)(5\\times10^3) = 15\\times10^7 = 1.5\\times10^8\\)'}],'Write 0.00042 in standard form.',['4.2 × 10⁻⁴','42 × 10⁻⁵','4.2 × 10⁴','0.42 × 10⁻³'],'Move the point 4 places right: 4.2 × 10⁻⁴.')],
 gcse_algebra:[
  M('Expanding and factorising',[{eg:'\\((x+3)(x-5) = x^2 - 5x + 3x - 15 = x^2 - 2x - 15\\)'},{p:'Factorising is the reverse: \\(x^2 - 2x - 15 = (x+3)(x-5)\\) — two numbers that multiply to −15 and add to −2.'}],'Factorise x² + 7x + 12.',['(x + 3)(x + 4)','(x + 2)(x + 6)','(x + 12)(x + 1)','(x − 3)(x − 4)'],'3 × 4 = 12 and 3 + 4 = 7.'),
  M('Solving quadratics',[{ol:['Factorise and set each bracket to 0, or','use the formula \\(x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\\)']}],'Solve x² − x − 6 = 0.',['x = 3 or x = −2','x = −3 or x = 2','x = 6 or x = −1','x = 1 or x = 6'],'(x − 3)(x + 2) = 0, so x = 3 or x = −2.'),
  M('Simultaneous equations',[{p:'Match the coefficients of one letter, then add or subtract to eliminate it.'},{eg:'x + y = 10 and x − y = 4 → add: 2x = 14 → x = 7, y = 3'}],'2x + y = 11 and x − y = 1. What is x?',['4','3','5','6'],'Add: 3x = 12, so x = 4 (then y = 3).'),
  M('Straight-line graphs',[{p:'In \\(y = mx + c\\), m is the gradient and c is where the line crosses the y-axis.'},{fig:F('graph',{x:[-4,4],y:[-5,7],fns:['2*x+1']})}],'What is the gradient of y = 2x + 1?',['2','1','3','−2'],'The number in front of x is the gradient: 2.')],
 gcse_ratio:[
  M('Multipliers',[{ul:['+15% → × 1.15','−8% → × 0.92','Repeated: × 1.03ⁿ for n years']}],'What multiplier is a 6% decrease?',['0.94','1.06','0.6','0.06'],'100% − 6% = 94% = 0.94.'),
  M('Direct and inverse proportion',[{ul:['Direct: y = kx (or kx², k√x …)','Inverse: y = k/x']},{eg:'y ∝ x² and y = 12 when x = 2 → k = 3 → y = 3x²'}],'y = kx and y = 20 when x = 4. What is k?',['5','80','16','24'],'k = 20 ÷ 4 = 5.'),
  M('Ratio problems',[{p:'Find the value of one part from the information you are given — it may be a difference, not a total.'}],'Ratio 3 : 5, and the difference is £12. What is one part?',['£6','£12','£4','£1.50'],'5 − 3 = 2 parts = £12, so one part is £6.'),
  M('Compound measures',[{ul:['Speed = distance ÷ time','Density = mass ÷ volume','Pressure = force ÷ area']}],'A force of 60 N acts on 4 m². What is the pressure?',['15 N/m²','240 N/m²','64 N/m²','0.07 N/m²'],'60 ÷ 4 = 15.')],
 gcse_geometry:[
  M('SOH CAH TOA',[{p:'Label the sides from the angle: hypotenuse (longest), opposite, adjacent.'},{eg:'\\(\\sin\\theta = \\frac{O}{H}\\quad \\cos\\theta = \\frac{A}{H}\\quad \\tan\\theta = \\frac{O}{A}\\)'}],'You know the opposite and the hypotenuse. Which ratio?',['sin','cos','tan','Pythagoras'],'O and H → SOH → sin.'),
  M('Finding an angle',[{p:'Use the inverse function on your calculator: sin⁻¹, cos⁻¹ or tan⁻¹.'},{eg:'tan θ = 5/12 → θ = tan⁻¹(0.4167) ≈ 22.6°'}],'sin θ = 0.5. What is θ?',['30°','60°','45°','0.5°'],'sin 30° = 0.5.'),
  M('Arcs and sectors',[{eg:'Sector area = \\(\\frac{\\theta}{360}\\times\\pi r^2\\) · Arc length = \\(\\frac{\\theta}{360}\\times 2\\pi r\\)'}],'What fraction of a circle is a 90° sector?',['1/4','1/2','1/3','1/90'],'90/360 = 1/4.'),
  M('Pythagoras in 3D',[{p:'The diagonal of a cuboid: \\(d^2 = a^2 + b^2 + c^2\\).'}],'A 2 × 3 × 6 cuboid. Diagonal?',['7','11','√13','49'],'4 + 9 + 36 = 49, √49 = 7.')],
 gcse_graphs:[
  M('y = mx + c',[{p:'m is the gradient (steepness); c is where the line crosses the y-axis.'},{fig:F('graph',{x:[-4,4],y:[-6,6],fns:['2*x-1']})},{eg:'y = 2x − 1: gradient 2, y-intercept −1'}],'What is the y-intercept of y = 3x + 5?',['5','3','8','−5'],'c = 5.'),
  M('Finding a gradient',[{p:'Gradient = change in y ÷ change in x, between any two points.'},{eg:'(1, 2) to (4, 11): 9 ÷ 3 = 3'}],'Gradient from (0, 1) to (2, 9)?',['4','8','2','5'],'(9 − 1) ÷ (2 − 0) = 8 ÷ 2 = 4.'),
  M('Parallel and perpendicular',[{ul:['Parallel lines have the same gradient','Perpendicular gradients multiply to −1 (negative reciprocal)']}],'Perpendicular to gradient 2?',['−1/2','2','−2','1/2'],'Negative reciprocal of 2 is −½.'),
  M('Quadratic graphs',[{p:'The roots are where the curve crosses the x-axis; the turning point is the top or bottom of the curve.'},{fig:F('graph',{x:[-2,5],y:[-5,6],fns:['(x-1)*(x-3)']})}],'Roots of y = (x − 1)(x − 3)?',['x = 1 and x = 3','x = −1 and x = −3','x = 3 only','x = 2'],'Each bracket is zero at x = 1 or x = 3.')],
 gcse_measures:[
  M('Area formulas',[{ul:['Rectangle: l × w','Triangle: ½ × b × h','Trapezium: ½(a + b)h','Circle: πr²']}],'Area of a triangle, base 10, height 6?',['30','60','16','36'],'½ × 10 × 6 = 30.'),
  M('Circles',[{p:'Circumference = πd = 2πr. Area = πr². A semicircle’s perimeter includes the diameter.'}],'Circumference of a circle with d = 10 (to 1 d.p.)?',['31.4','78.5','15.7','62.8'],'π × 10 ≈ 31.4.'),
  M('Volume and surface area',[{ul:['Prism / cylinder: area of cross-section × length','Cuboid surface area: add the 6 faces']},{eg:'Cylinder r = 3, h = 10: π × 9 × 10 ≈ 282.7 cm³'}],'Volume of a 2 × 3 × 4 cuboid?',['24','9','52','14'],'2 × 3 × 4 = 24.'),
  M('Converting area units',[{p:'1 m = 100 cm, so 1 m² = 100 × 100 = 10 000 cm². Square the length factor!'}],'How many cm² in 3 m²?',['30 000','300','3 000','300 000'],'3 × 10 000 = 30 000.')],
 gcse_stats:[
  M('Tree diagrams',[{p:'Multiply ALONG the branches; ADD the outcomes you want.'},{eg:'P(two heads) = 0.5 × 0.5 = 0.25'}],'P(A) = 0.3, P(B) = 0.5, independent. P(A and B)?',['0.15','0.8','0.2','0.35'],'Independent: multiply, 0.3 × 0.5 = 0.15.'),
  M('Without replacement',[{p:'After the first pick there is one fewer item, so the second fraction changes.'},{eg:'5 red, 3 blue: P(red, red) = 5/8 × 4/7 = 20/56 = 5/14'}],'4 red, 2 blue, two picks without replacement. P(both blue)?',['1/15','1/9','4/36','1/3'],'2/6 × 1/5 = 2/30 = 1/15.'),
  M('Grouped data',[{p:'Estimate the mean with midpoints: Σ(midpoint × frequency) ÷ Σfrequency.'}],'Group 10 < t ≤ 20 has what midpoint?',['15','10','20','30'],'(10 + 20) ÷ 2 = 15.'),
  M('Probability rules',[{ul:['Probabilities of all outcomes add to 1','Mutually exclusive: P(A or B) = P(A) + P(B)','Independent: P(A and B) = P(A) × P(B)']}],'P(win) = 0.35. P(not win)?',['0.65','0.35','1.35','0.5'],'1 − 0.35 = 0.65.')]
});
Object.assign(explainers,{
 gcse_number:[{m:/standard form/i,idea:'Standard form is a tidy way to write big or small numbers: a number from 1 to 10, times a power of 10.',check:'Is your first number at least 1 and less than 10?'},{idea:'Powers and roots follow rules: add powers when multiplying, subtract when dividing; a fractional power is a root.',check:'Try a quick estimate — is the size of your answer sensible?'}],
 gcse_algebra:[{m:/Solve/,idea:'Solving means finding the value(s) that make the equation true. Quadratics usually have two answers.',check:'Put each answer back into the equation — does it give 0 (or the right total)?'},{idea:'Expanding multiplies out brackets; factorising puts them back. They are opposites.',check:'Expand your factorised answer (or factorise your expanded one) to check you get back to the start.'}],
 gcse_ratio:[{idea:'Proportion and percentage questions are about multipliers: find the multiplier (or k), then use it.',check:'Does your answer go up or down the way the question says it should?'}],
 gcse_geometry:[{m:/sin|cos|tan|angle|hypotenuse|right-angled/i,idea:'In a right-angled triangle, the trig ratios link an angle to two sides. Label O, A and H from the angle first.',check:'Is the hypotenuse still the longest side? Is your angle less than 90°?'},{idea:'Use the right formula, keep units, and round only at the end.',check:'Estimate with round numbers — is your answer close?'}],
 gcse_graphs:[{idea:'A graph is a picture of an equation: every point on the line makes the equation true.',check:'Pick a point you found and put it into the equation — does it work?'}],
 gcse_measures:[{idea:'Measures: use the right formula, keep the units the same, and remember area is squared and volume is cubed.',check:'Does the size and the unit of your answer make sense?'}],
 gcse_stats:[{idea:'Probabilities are between 0 and 1. For two events, think about AND (multiply) or OR (add).',check:'Is your probability between 0 and 1? Do all the outcomes add up to 1?'}]
});
})();
