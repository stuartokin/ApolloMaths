# Changelog

Plain-English summary of each release. The technical detail of every version is in the README's changelog
(`- **vX.Y:**` lines), and the in-app version history is `versionHistory` in `js/data/help.js`.

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
