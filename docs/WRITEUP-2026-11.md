# Write-up: Key Stages, SATs and GCSE (versions 2.83–2.90, 27 November 2026)

A plain-English record of one long piece of work, for Stuart and for whoever picks this up next. The detail lives in
`KNOWLEDGE.md` (how it works), `ROADMAP.md` (what's next), `LESSONS.md` (34–54 came from this work) and the changelogs.

## What Stuart asked for

Extend ApolloMaths from an 11+ app to every key stage, SATs, GCSE and A level, with a more grown-up character,
hobbies, backgrounds and shop for GCSE and A level students.

## Decisions (Stuart, 27 November 2026)

| Question | Decision |
|---|---|
| Which boards? | All of them |
| Further Maths? | Yes, with A level |
| Where to start? | Key stages and SATs first (Apollo needs SATs) |
| Subjects | Maths only; an English version may follow later |
| Who chooses the exam? | Parents keep control |
| Apollo's plan | SATs added (Stuart did it himself in the app) |
| When does the grown-up look start? | Automatically from Year 10, or on any GCSE/A-level exam; parents can override |
| Calculators | Students use their own; calculator questions are labelled and kept out of non-calculator papers |
| First mock boards | AQA, Edexcel, OCR; then every board |
| The grown-up look | Proofs first; Stuart chose **B "Night study" with a light theme switch**, and everything in it age-appropriate |
| A level | **Moved to future plans** — not scheduled; ask Stuart before starting |

## What was built

| Version | What |
|---|---|
| 2.83 | KS2 SATs (Year 6): arithmetic topics (36 question types), Paper 1 mock in marks, School year picker. Fixed the site not publishing since 19 Nov (a stray link in the repo). |
| 2.84 | SATs Papers 2 and 3 (reasoning, 47 types); Year 3, 4, 5 exams; the Year 4 times-tables check (6 seconds a question). |
| 2.85 | Year 1–2 (36 picture-question types, tap to answer, read aloud, KS1 papers); Years 7–9 (46 types). |
| 2.86 | GCSE groundwork: proper maths display (KaTeX, kept in the repo), algebra answers marked by value, graphs, formula sheet, tiers, board papers, the Look setting. |
| 2.87 | The senior look: "Night study" + light theme, own character, calm wording, XP and levels, 🎨 Customise (outfits, trainers, accessories, desk and room, backdrops, titles, perks), ten hobbies. |
| 2.88 | GCSE Foundation content (123 types in all), lessons, estimated grade from mocks. |
| 2.89 | GCSE Higher (186 GCSE types in all) and every board: AQA, Edexcel, OCR, Eduqas, WJEC, CCEA, Edexcel IGCSE, Cambridge IGCSE. |
| 2.90 | Stuart's first try on the Fold: a − key on touch screens (keypads had no minus); new GCSE players now start in Customise with grown-up hobbies, not the children's Locker Room. |

About **350 new question types** in all, each with hints, a worked method and an explained answer.

## Around it

- **Hub (horizonqltd.com):** the Apollo card has a new 57-second "What's new" demo (silent, captioned, ending
  "not yet tested — testers welcome"), a new picture and preview, and a description saying the new parts are untested.
  Stuart's LinkedIn trailer is kept as the second video.
- **LinkedIn post:** written as a follow-up to "I'm a terrible maths teacher, so I vibe-coded my son an 11+ app",
  calling for testers and saying plainly that none of this has been tried with children or checked by a teacher
  (text at the end of this page). Not yet posted.
- **Exam watch** (the automated agent) now also checks the SATs, times-tables check and every GCSE board's pages.
- **Shared lessons** 94–95 (in stuartokin.github.io) for the other repos.

## How it fits together (for the next session)

- Everything is layered on the old app without rewriting it: `stages.js` (papers, marks, timers, tap-to-answer,
  read-aloud, − key), `gcse.js` (look switch, maths display, formula sheet, grade), `senior.js` + `css/senior.css`
  (the grown-up look and Customise). Children's progress from before 2.83 is untouched.
- Exams are profiles in `js/data/exams.js`; topics say which exams they belong to; question types can be held back
  by year, tier or calculator. New question types are always **added at the end** of a topic (saved Fix-it lists
  point at positions).
- Tests: `python tests/run_all.py` — about 200 checks across ten suites, all passing at 2.90.

## Not yet tested or checked

1. **No real child has used any of 2.83–2.90**, and no maths teacher has checked the questions. Stuart has tried
   it once on his Fold (two bugs found, both fixed in 2.90).
2. Board facts to check against the boards' own pages: CCEA paper timings, the WJEC Intermediate tier, Cambridge
   IGCSE durations.
3. The estimated grade uses AQA's June 2025 boundaries for every board — a guide only.
4. The optional "Have a go" box in Learn lessons has no − key yet.
5. Not tried on a real iPad or iPhone.

## Next

1. Stuart posts the LinkedIn call for testers.
2. Fix what testers report before adding anything new.
3. Check the board facts above.
4. Later (future plans): A level Maths and Further Maths; an English version.

## Appendix: the LinkedIn post

> A few weeks ago I wrote "I'm a terrible maths teacher, so I vibe-coded my son an 11+ app". Thank you to everyone
> who tried it and sent feedback.
>
> Since then it has grown a lot. Apollo's Maths Missions now goes from Year 1 all the way to GCSE:
>
> 🧒 Years 1–2: picture questions (clocks, coins, number lines, fraction shapes) that young children can tap, and have read aloud
> 📝 KS2 SATs: arithmetic and reasoning papers, scored in marks like the real thing, plus the Year 4 multiplication tables check (6 seconds a question)
> 📚 Years 3 to 9: practice set to the school year
> 🎓 GCSE, Foundation and Higher, for every board: AQA, Edexcel, OCR, Eduqas, WJEC, CCEA, Edexcel IGCSE and Cambridge IGCSE. Calculator and non-calculator papers, proper maths notation, a revision formula sheet, algebra answers marked properly, and an estimated grade from mock papers
> 🌙 A more grown-up look for teenagers: a calm "Night study" style (or a light theme), with age-appropriate outfits, desk set-ups and hobbies to earn. No cartoon pets for 15-year-olds.
>
> A level is on the list for later.
>
> ⚠️ Now the important bit: none of these new parts has been tried by real children yet, and no maths teacher has
> checked them. I've written automated tests for thousands of generated questions, but that isn't the same as a
> Year 2 child or a Year 11 student actually using it. There will be mistakes: wrong answers, confusing wording,
> things marked wrong that are right.
>
> So I'm looking for testers:
> • Parents with children anywhere from Year 1 to Year 11
> • Teachers and tutors, especially anyone who knows a particular GCSE board well
> • Students revising for GCSE who don't mind telling me what's annoying
>
> It's free, there's no sign-up, and nothing leaves your device. If you find something wrong, or something that
> just feels off, please tell me in the comments or send me a message.
>
> Try it here: horizonqltd.com/ApolloMaths
> There's a one-minute "What's new" demo on the Apollo's Maths Missions card at horizonqltd.com
>
> #Maths #EdTech #SATs #GCSE #VibeCoding #Parenting
>
> Written in a personal capacity and do not represent the position of any organisation I am engaged with.
