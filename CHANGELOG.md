# Changelog

Plain-English summary of each release. The technical detail of every version is in the README's changelog
(`- **vX.Y:**` lines), and the in-app version history is `versionHistory` in `js/data/help.js`.

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
