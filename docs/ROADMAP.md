# Roadmap and open items

*Stuart Okin, Director of Cyber Regulation and Emerging Technologies, Ofgem — personal project.*
*As of 13 November 2026 (version 2.80). Items marked **(stated)** are Stuart's own requirements; the rest are
known gaps found during the work, for him to prioritise.*

Starlane's future requirements (adult science questions, the science-research and adventure workflows) are in the
Starlane repo's `docs/ROADMAP.md`.

## Housekeeping (do first)

- **Delete the dead Starlane files** from this repo: `js/starlane.js`, `js/starlane-modern.js`,
  `js/starlane-adventures.js`, `js/starlane-audio.js`, `js/vendor/three-bundle.js`,
  `js/vendor/three-LICENSE.txt`, and the stray public `QA-report-questions-hints-lessons.md`. Nothing loads them
  since 2.79.
- **Run the test rig in CI**: a `.github/workflows/tests.yml` that installs Playwright + Chromium, checks out
  this repo and Starlane side by side, and runs `python tests/run_all.py` on every push to `main`. Then the
  exam-watch auto-merge should also require the rig to pass (today it only checks the files load).
- **Tidy the README**: its early sections still describe removed features (two-player games, the CRT switch,
  the "Kit Shop" name, the long single page). The changelog lines are accurate; the prose needs a refresh.

## Apollo's own path (stated)

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

## Known gaps (for Stuart to prioritise)

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
