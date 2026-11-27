# Changelog

Plain-English summary of each release. The technical detail of every version is in the README's changelog
(`- **vX.Y:**` lines), and the in-app version history is `versionHistory` in `js/data/help.js`.

## 2.88 — 27 November 2026
- **GCSE Foundation content**: 99 new question types (123 in all) across number, algebra, graphs, ratio and rates,
  geometry, measures and statistics, with lessons; drawn graphs and tables.
- **Estimated GCSE grade** from the last three mock papers (AQA June 2025 boundaries as a guide).
- GCSE mock papers are 25 questions in 90 minutes, scored in marks.
- Fixes: tidier algebra wording, rounding of numbers ending in 5, graphs with different axis scales.

## 2.87 — 27 November 2026
- **The senior look** for GCSE and A level ("Night study", with a light theme), automatic from Year 10: own character,
  calm wording, XP and levels, and **🎨 Customise** — age-appropriate outfits, trainers, accessories, desk and room,
  backdrops, frames, earned titles and a focus-sounds perk; ten hobbies with their own colours and items.
  Younger children see no change. New `senior` test suite.

## 2.86 — 27 November 2026
- **GCSE groundwork.** GCSE Maths profiles for AQA, Edexcel and OCR, Foundation/Higher in the Plan, each board's
  papers (non-calculator paper included). Proper maths display (KaTeX, kept in the repo), graphs, a formula sheet,
  algebra answers marked by value (with "now expand / factorise" nudges), quadratics and simultaneous equations.
  A first 24 GCSE question types; KS3 topics give revision.
- **Look setting** in Grown-ups → Plan (automatic from Year 10, children's, senior); the senior look itself is 2.87.
- New `gcse` test suite.

## 2.85 — 27 November 2026
- **KS1: Year 1 and Year 2 maths.** Picture questions (clocks, coins, number lines, tens and ones, arrays, fraction
  shapes, counters), tap-to-answer in practice, questions read aloud. 36 question types; Year 2 has KS1-style papers.
- **KS3: Year 7, 8 and 9 maths.** Five topics, 46 question types held back by year (Pythagoras and compound interest
  wait for Year 9). 13+ Common Entrance now uses them too.
- New `ks1ks3` test suite.

## 2.84 — 27 November 2026
- **KS2 SATs mocks for all three papers**: Paper 1 arithmetic and Papers 2 and 3 reasoning (24 questions, 40 minutes),
  scored in marks; choose the paper in Mock exam.
- **Five SATs-level reasoning topics** (47 question types, with lessons and explainers; bar charts and timetables drawn).
- **New exams: Year 3, Year 4 and Year 5 maths** (national curriculum only, nothing from later years) and the **Year 4
  multiplication tables check** (25 questions, 6 seconds each, moving on by itself).
- Grown-ups → Plan offers “Add the times-tables check” for Year 4. Focus topics follow the child's year.
- New `ks2` test suite.

## 2.83 — 27 November 2026
- Key stages begin with **KS2 SATs (Year 6)**: a new exam with five arithmetic topics (36 question types with hints,
  worked methods, Learn missions and explainers) and a **Paper 1 mock** — 36 questions in 30 minutes, scored in marks.
- Grown-ups → Plan: a **School year** picker (later-year questions are held back) and **➕ Add KS2 SATs** for Year 6
  children. Key dates include the 2027 SATs maths days (12–13 May), results (6 July) and the times-tables check (from 7 June).
- SATs topics never appear for other exams (practice, topic grid, focus, Starlane).
- Fix: 50-question 11+ mocks were saved as out of 40 when progress was reopened.
- Exam watch now checks the Standards and Testing Agency pages and SATs dates. New `stages` test suite.
- Fix: the site had not published since 19 November (a stray link in the repo broke the GitHub Pages build); removed,
  and a test now stops it happening again.

## Docs — 19 November 2026 (no app change)
- Decided: ApolloMaths keeps its own fixed questions; grown-ups bring their own questions in Starlane played on
  its own (📚 Question banks, Starlane v29–30). Roadmap updated; Starlane's future content plans are in its repo.

## 2.82 — 15 November 2026
- Focus areas follow the exam automatically (when the app opens and whenever the exam changes) until a grown-up
  chooses their own in Grown-ups → Focus areas. "↺ Follow the exam again" returns to automatic.

## 2.81 — 15 November 2026
- Changing the exam refreshes the child's page at once: a new question from the new exam, mock length, header badge,
  focus topics, today's plan and "Next best thing". A mock in progress restarts at the new length.
- Fix-it no longer brings back question types from a different exam.
- The exam plan shows as cards on phones and tablets; on phones the dashboard tabs sit in one scrolling strip.
- New `exams` test suite (question bank per exam, exam switching at phone, tablet, laptop and huge sizes).

## 2.80 and earlier
See the README changelog and `docs/KNOWLEDGE.md` §10.
