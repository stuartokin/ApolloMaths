# Roadmap and open items

*Stuart Okin — personal project, written in a personal capacity.*
*As of 27 November 2026 (version 2.89). Items marked **(stated)** are Stuart's own requirements; the rest are
known gaps found during the work, for him to prioritise.*

Starlane's future requirements (adult science questions, the science-research and adventure workflows) are in the
Starlane repo's `docs/ROADMAP.md`.

## Housekeeping (do first)

- **Run the test rig in CI**: a `.github/workflows/tests.yml` that installs Playwright + Chromium, checks out
  this repo and Starlane side by side, and runs `python tests/run_all.py` on every push to `main`. Then the
  exam-watch auto-merge should also require the rig to pass (today it only checks the files load).
- **Tidy the README**: its early sections still describe removed features (two-player games, the CRT switch,
  the "Kit Shop" name, the long single page). The changelog lines are accurate; the prose needs a refresh.

## Key stages, GCSE and A level (stated, 27 Nov 2026)

Stuart's plan: cover **every key stage, SATs, GCSE (all boards) and A level (all boards, including Further Maths)**,
maths only (an English version may follow later). Older students' settings stay with the parents for now. Start with
key stages and SATs (Apollo needs them). Phases, agreed 27 Nov:

1. **2.83 — done:** year groups (`stats.year`, `fn.years`), KS2 SATs profile, SATs arithmetic (5 topics, 36 types),
   Paper 1 mock scored in marks, “Add KS2 SATs”.
2. **2.84 — done:** SATs reasoning Papers 2 and 3 (five SATs-level topics, 47 types), Years 3–5 profiles, the Year 4
   multiplication tables check (6-second countdown), paper picker, “Add the times-tables check”.
   Possible later: more reasoning types (two-part answers, “explain” questions, drawing on a grid), a Year 6 profile
   separate from SATs, scaled scores from the marks (the STA publishes conversion tables each July).
3. **2.85 — done:** **KS1** (Years 1–2: pictures — clocks, coins, number lines, counters, fraction bars; tap-to-answer, read-aloud
   on) and **KS3** (Years 7–9, 46 types; 13+ CE uses them). New figures in `figures-ks1.js`.
   Possible later: more KS3 types (graphs of lines, transformations, constructions), drag-and-drop answers for KS1,
   Reception/EYFS.
4. **Next: GCSE.** Plan agreed 27 Nov 2026 (Stuart):
   - **Two looks.** Today's look stays for Years 1–9, SATs, 11+ and 13+. GCSE and A level get a new “senior” look —
     a layer over the same app (own CSS, character, hobbies, Customise shop); questions, mocks, dashboard, saving and
     arcade are shared; progress carries over. It switches on **automatically from Year 10**; grown-ups can switch any
     child either way.
   - **Calculators:** students use their own; questions and papers say calculator / non-calculator.
   - **Mock order:** AQA, Edexcel, OCR first; then Eduqas, WJEC (Wales), CCEA (NI), Edexcel IGCSE, Cambridge IGCSE.
   - **Look chosen (Stuart, 27 Nov 2026): B “Night study”, with a light-theme switch** (proofs in `docs/proofs/`;
     `make.py` and `make2.py` rebuild them: `proof-B-*` are the chosen look, light mode and the Customise screen).
   - **Everything must be age-appropriate for 14–18 (Stuart):** the Customise shop (outfits, trainers, accessories,
     desk and room, backdrops, titles, study perks — no cartoon kits or pets), the rewards (XP and levels; credits to
     spend), the wording and feedback (calm, no comic sound effects), celebrations and the arcade (“break room”).
     **Waiting on Stuart to approve the Customise proofs** before building.
   - **(1) Groundwork — 2.86. (2) Senior look — 2.87. (3) GCSE Foundation content — 2.88** (99 new types, estimated grade).
     **(4) GCSE Higher and all boards — 2.89.** GCSE is complete. **A level is now a future plan** (Stuart, 27 Nov 2026) —
     see “Future plans” below. Next is testing GCSE with real students and fixing what they find. Earlier note on (4): GCSE Higher (~100 types: surds and indices in depth, algebraic fractions, completing the square,
     functions and iteration, circle theorems, sine/cosine rules and 3D trig, vectors proofs, histograms and cumulative
     frequency, conditional probability), then WJEC, CCEA, Edexcel IGCSE and Cambridge IGCSE profiles; then A level.
     Possible later: mock papers ordered easy → hard like real papers; multi-part questions; an on-screen calculator. Later ideas for the look: arcade “break
     room” with the senior character; more items per hobby; drawn item art instead of emoji icons; a day-streak freeze.
   - Order: (1) groundwork — maths display (KaTeX, self-hosted), algebra-answer checking, graphs, calculator flag,
     formula sheet, tier + board in the Plan, loading per stage, the look switch; (2) the senior look; (3) GCSE
     Foundation (~100 types) + England mocks; (4) Higher (~100) + other boards; then A level, then Further Maths.
   GCSE (earlier note) (shared content written once; board profiles AQA, Edexcel, OCR, Eduqas/WJEC, CCEA, IGCSE with their
   papers, calculator rules and formula sheets; Foundation/Higher). Needs KaTeX (self-hosted), an algebra-answer
   checker, graphs and loading per stage. The **older look** (character, hobbies, backgrounds, “Customise” shop) comes
   with GCSE — send Stuart proof images first.
5. **A level: moved to Future plans** (Stuart, 27 Nov 2026).

Each year: update `SATS_DAY` (exams.js) and the SATs dates in `EXAM_EXTRA.ks2sats` (the exam watch proposes them).

## Apollo's own path (stated)

- **KS2 SATs, 12–13 May 2027 (maths):** Stuart asked (27 Nov) for SATs in Apollo's plan. The plan lives on the family's
  device, so it can't be added from the repo: open Grown-ups → 📋 Plan and press **“➕ Add KS2 SATs”** (it keeps the
  ISEB entry; the app trains for whichever test is next).

- Tiffin result due **March 2027**: record it in his exam plan (Grown-ups → Plan).
- **Eton at 13+**: ISEB Common Pre-Test by **30 November 2026** (Eton's deadline for September 2029 entry),
  Eton Stage 2 (interview and List Test, January–March 2027), then Eton Entrance / Common Entrance / King's
  Scholarship in Year 8. Keep his plan current; confirm registration with Eton.

## The general app (stated)

- **Share publicly** (Stuart plans to post it on LinkedIn) — the app is now general: each family adds
  children, exams, themes. Keep the name "Apollo's Maths Missions" (decided).
- **Maths only for the first version** (decided). The profiles are designed so **verbal and non-verbal
  reasoning and English** sections could be added later for the ISEB Pre-Test and Tiffin.
- **Exam watch** maintains sources, dates and questions automatically, labelled 🤖 AI-maintained (built).
  Possible extensions: more schools and consortia; a profile for **FSCE** tests (Gloucestershire grammar
  schools move to FSCE for September 2028 entry, per the agent's first report); unconfirmed provider changes
  for Kent (Quest) and Trafford (FSCE) to watch.

## Future plans (not scheduled)

- **A level Maths and Further Maths, all boards** (Stuart, 27 Nov 2026: “put the A level into future plan”). When it
  starts: pure, statistics and mechanics; each board's large data set; then Further Maths. It reuses the GCSE
  groundwork (KaTeX, algebra checking, graphs, senior look). Ask Stuart before starting.
- An English version of the app (Stuart, earlier).

## Testing first (27 Nov 2026)

- None of 2.83–2.89 (Years 1–9, SATs, times-tables check, GCSE, senior look) has been tried by real children or
  checked by a maths teacher. Stuart has called for testers on LinkedIn (27 Nov 2026). Fix what testers report
  before new content. Board facts still to check against the boards' own pages: CCEA timings, the WJEC
  Intermediate tier, Cambridge IGCSE durations.

## Decided

- **Questions in ApolloMaths stay fixed (Stuart, 19 Nov 2026).** ApolloMaths only uses its own built-in questions,
  chosen by Stuart; nothing is imported at runtime here, and Starlane opened from ApolloMaths follows the child's
  exam. "Bring your own questions" lives in **Starlane played on its own**: 📚 Question banks for grown-ups (built in
  Starlane v29–30 — guide in the Starlane repo's `docs/QUESTION-BANKS.md`). People may send Stuart questions; he
  decides what becomes built-in. Gemini-written questions for Apollo: try them as a Starlane bank on the standalone
  site, or send them to a session to become ApolloMaths question types.
- Starlane's future content (more systems, missions, adventures, question packs, story arcs with different endings)
  is planned in the Starlane repo's `docs/ROADMAP.md` (R6, R7).
- **Stuart's to-do list for questions and Starlane content** is at the top of the Starlane repo's `docs/ROADMAP.md`
  (19 Nov 2026).

## Done

- **27 Nov 2026 (2.89)**: GCSE Higher and all boards — GCSE complete.
- **27 Nov 2026 (2.88)**: GCSE Foundation content and estimated grade.
- **27 Nov 2026 (2.87)**: the senior look and Customise.
- **27 Nov 2026 (2.86)**: GCSE groundwork (KaTeX, algebra answers, graphs, tiers, papers, formula sheet, Look setting).
- **27 Nov 2026 (2.85)**: KS1 (Years 1–2) and KS3 (Years 7–9).
- **27 Nov 2026 (2.84)**: SATs reasoning papers, Years 3–5, the Year 4 tables check.
- **27 Nov 2026 (2.83)**: KS2 SATs and school years (see “Key stages, GCSE and A level”). Fixed: 50-question 11+ mocks were
  cut to 40 when progress was reopened.

- **By 15 Nov 2026**: the dead Starlane files, `js/vendor/three-*` and the stray QA report were deleted.

- **15 Nov 2026 (2.81)**: checked the question bank against every exam (no question types leak between exams);
  changing the exam now refreshes the child's page straight away; Fix-it keeps to the exam; the exam plan works on
  phones and tablets. New `exams` test suite.
- **15 Nov 2026 (2.82)** — decision (Stuart): focus areas **always follow the exam initially**, until a parent changes
  them in Grown-ups → Focus areas; “↺ Follow the exam again” returns to automatic.

## Known gaps (for Stuart to prioritise)

- **The rest of the dashboard on phones**: the Plan tab was fixed in 2.81; other wide tables (Readiness, Topics,
  Question types) still scroll sideways inside their box on a phone. Readable, but cards would be nicer.

- **Arcade themes go only so far**: in My player the child's head, theme colour, theme items and game names
  change, but the games' sprites and backgrounds are the originals. Fully themed sprites per game would be a
  larger job.
- **Character setup**: "I'll design my own" exists; more themed starter outfits could be added per theme.
- **Readiness and mocks for 13+**: the 13+ question set is smaller than the 11+ sets; add more Year 8
  algebra, geometry, probability and problem-solving generators (by hand or via the exam watch).
- **Lost QA scripts**: the old `qa/` question-quality scripts (hint 1 not giving the answer away, steps reaching
  the answer) were lost; `tests/test_static.py` covers validity but not those language checks — worth rebuilding.
- **Device speech** varies; check voices on new devices.

## How to work on it

Plan to Stuart first for anything major. Build by wrapping existing code where possible. Run
`python tests/run_all.py` before and after. Follow the release routine in `KNOWLEDGE.md` §9.
