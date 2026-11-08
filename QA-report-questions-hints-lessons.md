# Apollo's Maths Missions — Phase 1 Quality Check

**Date:** 8 November 2026 · **App version:** 2.14
**Scope:** every question type (237), every hint chain, every worked method ("Teach me the method"), every "Explain it simply" explainer, all 23 Learn missions (102 steps, examples and check answers) and the Example Studio.

## How it was checked

1. **Automated checks: 94,800 generated questions** (400 of every type), looking for:
   - broken text ("undefined", "NaN");
   - fewer than three hints;
   - missing worked steps;
   - answers that aren't sensible numbers;
   - a first hint that gives the answer away;
   - steps that never arrive at the answer;
   - explainers that fail to build.
2. **A "skipped step" check (new).** It flags any hint or step that states a calculated result without showing the calculation, for example "One part = 6" with no "24 ÷ 4". This is the exact problem that confused Apollo in a ratio question.
3. **The same skipped-step check on every Learn mission:** examples, explanations and check answers.
4. **A manual read-through** of a sample of every question type and all Learn missions, for correctness, missing steps and plain language for an 11-year-old.
5. **Regression tests:** answers are still marked correctly (fractions, times, units), and lessons, scoring and saving are unchanged.

## What was found and fixed

### The ratio hint that confused Apollo
*"Liverpool scarves and comic caps are packed in ratio a:b. There are N gifts. How many scarves?"*
- **Before:** "Add ratio parts first." → "Find one part then multiply by the scarves part." → "One part = 3." The division of the total by the number of parts was never shown.
- **After:** "Add the ratio parts: 3 + 5 = 8." → "Divide the 24 gifts by the 8 parts to find ONE part." → "One part = 24 ÷ 8 = 3. Scarves have 3 parts, so multiply by 3."

The same gap was fixed in the other ratio questions:
- the "energy bars" question, whose third hint jumped to "Second team has 4 parts";
- the "training bibs" question, whose method said "One part = 6" with no division;
- totals of ratio parts now always show the addition (e.g. "5 + 4 = 9").

Two smaller ratio fixes:
- ratios with two equal numbers (e.g. 6:6) no longer appear;
- grammar is corrected ("1 white box", "1 equal part").

### Other question types with a hidden calculation (about 45 types, all now show the working)
- **Fractions:** "One part = 9 pages" → "72 ÷ 8 = 9". This also applies to "remaining" and "of the rest" questions.
- **Percentages:** "Discount = £40" → "50% of £80 = £80 ÷ 2 = £40"; "25% off" now shows the quarter.
- **Unit conversions:** "6 m = 600 cm" → "6 × 100 = 600 cm"; also kg→g, litres→ml and mm→cm.
- **Time:** "3 hours = 180 minutes" → "3 × 60 = 180"; time spans show hours and minutes.
- **Algebra:** "n = 22" → "n = 66 ÷ 3 = 22"; adult-ticket extras show "a × £7".
- **Averages:** totals from a mean show "3 × 18 = 54"; sums of known values are shown.
- **Angles:** "Known total = 77°" → "35 + 42 = 77°".
- **LCM:** the lists of multiples are shown so the child can see where they first match.
- **Area and perimeter:**
  - the original area, the remaining length and the "visible width" now show their calculations;
  - path and border questions show "a + 2 × p";
  - T-shapes show the final addition.
- **Sequences:** growing jumps ("the next jump is 9 + 3 = 12"); triangular numbers show the multiplication and halving.
- **Volume:** layers ("3 × 3 = 9 cubes"); whole-block volume shows the multiplication.
- **Data:** row totals, increases ("45 − 25 = 20") and frequency-table totals show the addition.
- **Tiffin-style:** prices are added explicitly before the change is worked out; clock spans show hours × 60.

### Hints that gave the answer away
- **"How many sides/vertices does a dodecagon have?":** hint 1 listed every prefix including "dodeca = 12". It now builds up gradually.
- **"How many degrees in a full turn?":** hint 1 *was* the answer. It now starts with "Picture yourself turning on the spot".

### Learn missions (lessons) — examples and explanations
- **Equivalent fractions, "Answers can be decimals":** the muddled example ("50 and 30 share 10, so divide by 5") is rewritten to go through tenths step by step: 18 ÷ 5 = 3.6, then 3.6 × 3 = 10.8.
- **Mean:** the example now shows the addition before dividing.
- **Pie charts:** "a quarter of 60" now shows "60 ÷ 4 = 15".
- **Ruler:** conversions show "× 10".
- **Ratio:** every example and explanation shows "total ÷ parts".
- **Fractions, percentages, algebra (two-step and balance), area, reasoning, sequences (nth term) and the Tiffin rope question:** each hidden division, subtraction or conversion is now written out.

"Explain it simply" and Example Studio draw on the same hints and steps, so they inherited all of these fixes automatically.

## Checked and judged correct (not changed)
- **Basic facts stated as facts:** 1 m = 100 cm, a triangle's angles = 180°, 1 cm³ = 1 ml.
- **Values read directly from a chart or table:** these are the skill being tested.
- **Square and cube numbers.**
- **Answers that correctly need three decimal places:** millimetre conversions and decimal place value.

## Result
- **Question types:** all 237 pass the automated and skipped-step checks.
- **Remaining flags:** only the three known false alarms above.
- **Answers:** the marking of answers is unchanged.
- **Apollo's progress:** unaffected; only question and lesson text changed.

*Made with AI (Claude, by Anthropic). Automated and manual checks reduce mistakes but cannot guarantee there are none — please flag anything that looks wrong.*
