# Apollo's Maths Missions — knowledge base

*Stuart Okin — personal project, written in a personal capacity.*
*Last full update: 13 November 2026 (version 2.80); exam switching updated 15 November 2026 (2.82); key stages, SATs, KS1 and KS3, GCSE groundwork and senior look, GCSE complete 27 November 2026 (2.83–2.89).*

Written so that a future person or AI model, starting cold, can understand the whole app and why it is the way
it is. Lessons learned are in `LESSONS.md`, future requirements in `ROADMAP.md`, the test rig in
`tests/README.md`. The README's long changelog (`vX.Y:` lines) records every release in technical detail.

---

## 1. What it is and who it is for

A maths-practice app for UK selective-school entrance exams, growing (from 2.83) to cover every key stage, SATs,
GCSE and A level (all boards) — see ROADMAP “Key stages, GCSE and A level”. Stuart built it for his son **Apollo** (11 in 2026)
for the **Tiffin School 11+ Stage 2** exam (12 November 2026; result due March 2027). Apollo is now aiming for
**Eton at 13+** (ISEB Common Pre-Test first, then Eton's own tests; see the exam plan). Since 2.68 it is
general: any family can add children, choose an exam, a theme and a character.

Principles that shaped everything:

- **Learning first, rewards earned.** Points (⚡) come from right answers and real learning; they buy items in
  the Shop; play time in the secret arcade is earned too, within rules a parent sets.
- **Accurate, explained maths.** Every question has three hints and a full worked method; original questions in
  the style of real papers (never copied); sources linked.
- **Private.** No server, no accounts, no adverts. Everything stays on the family's device (browser storage and
  optional progress files). Nothing is ever written back to GitHub by the app.
- **Fun and personal**: the child's name in every word problem, their own character, a theme they love.

## 2. Where everything lives

| Thing | Where |
|---|---|
| Live app | https://stuartokin.github.io/ApolloMaths/ — repo `stuartokin/ApolloMaths` (public, GitHub Pages, `main`) |
| Starlane Trader (space game in the arcade) | https://stuartokin.github.io/Starlane/ — repo `stuartokin/Starlane`; full docs there |
| Test rig | `tests/` (see `tests/README.md`) |
| Exam-watch agent | `tools/exam-watch/` + `.github/workflows/exam-watch.yml` |
| Site switch | `config.js` (`window.APP_CONFIG = { arcade: true }`) |

Static site, **no build step**, plain scripts loaded in order by `index.html` (globals shared between files).
Changes are committed and pushed straight to `main` (see CLAUDE.md); GitHub Pages deploys in about a minute. `sw.js` makes it installable and
offline-capable (bump `CACHE='maths-missions-vN'` every release).

## 3. Code map

Load order matters: data first, then rendering, storage, features, `app.js`, then the layers added later
(`hub.js`, `themes.js`, `student.js`, `protect.js`) that wrap or reorganise what came before.

| Area | Files | Notes |
|---|---|---|
| Core | `js/core.js` | `R(a,b)` random (leans with `QDIFF` for difficulty), `Q(…)` question builder, `mk(topic, fn)` registers a generator into `bank` |
| Topics & questions | `js/data/topics.js`, `questions-core.js`, `questions-focus.js`, `questions-extra.js`, `questions-exams.js`, `questions-agent.js`, `questions-sats.js`, `questions-ks2.js`, `questions-ks1.js`, `questions-ks3.js` | 44 topics; ~433 generators. KS1 (`ks1_*`, 2.85) and KS3 (`ks3_*`, 2.85). KS2 reasoning and the tables check (`questions-ks2.js`, 2.84): `ks2_number/measure/shape/stats/problems`, `mtc_tables`. SATs arithmetic (`questions-sats.js`, 2.83): five topics with `topics[k].exams=['ks2sats']` and generators tagged `fn.years=[first,last]` (National Curriculum year) and `fn.mk` (marks). A generator returns `{q, a, u, h:[3 hints], s:[worked steps], fig?, table?, kind?}`. `fn.exams=[…]` limits it to exams; `fn.diff` 0/1/2 |
| Difficulty | `js/data/difficulty.js` | `rateQuestionTypes()` rates each generator; adaptive level per child per exam in `stats.adapt` (3 right first time → up, 2 misses → down); `diffFilter`, `setQDiff`, `qOK` (rejects accidentally trivial questions such as 5:5) |
| Exams | `js/data/exams.js`, `exam-dates.js` | `EXAMS` (5 profiles: weights, style, sources), exam **plan** per child, header badge, mocks per exam, readiness, key dates, Sources, Starlane question socket (`examQuestion`), parent tabs Plan/Readiness/Starlane |
| Learning | `js/data/lessons.js`, `learning.js`, `learning-more.js`, `learning-sats.js`, `learning-ks2.js`, `learning-ks1-ks3.js`, `explainers.js`, `marking.js`, `metrics.js`, `js/learn.js` | Learn missions (6 steps per topic, active-reading gates), Example Studio, "Explain it simply", answer marking (`judge`), readiness, Today's plan (`planFor`) |
| Rendering | `js/render/render.js`, `maths.js` (KaTeX + graphs, 2.86), `figures-ks1.js` (clock, coins, number line, array, fraction shapes, tens, counters — 2.85), `avatar.js`, `avatar-extra.js` | Diagrams from specs (`F('cuboid',…)`), fractions the Tiffin way (`fracHTML`), the character SVG (`drawAvatar`) |
| Storage & players | `js/storage.js`, `js/players.js`, `js/protect.js` | Profiles, per-player stats, progress files (File System Access API with auto-save on Chrome/Edge; download elsewhere), "Who's playing?", recycle bin |
| Family & Admin | `js/family.js`, `js/admin.js`, `js/data/arcade-rules.js` | Parent passphrase (PBKDF2), child's secret word/number code, fair-play locks, Admin PIN, play-time rules |
| Shop & character | `js/locker.js`, `js/data/shop.js`, `shop-extra.js`, `shop-themes.js` | 274 items (kits, hats, boots, extras, pets, scenes, celebrations, titles, frames, Maths Legends cards, skills); themed catalogues |
| Arcade | `js/arcade.js`, `js/games.js`, `js/retro.js` | 11 original games + Starlane (opened from its site); My player / Classic per game; avatar drawn via `AVH()` |
| Parent dashboard | `js/parent.js` (+ tabs in `exams.js`, `student.js`) | Grouped tabs, summary cards, find box |
| Layout & theme | `js/hub.js`, `js/student.js`, `js/themes.js`, `css/app.css` | Five areas, side rail, slim header, save button, themes |
| Stages layer | `js/stages.js` (loaded last) | Wraps `drawTopics` (hides weight-0 topics), `newQuestion` (a weight-0 chosen topic falls back to mixed; starts the per-question countdown), `examMock` (the chosen paper, `#paperPick`), `randomTopic` (mocks keep to the paper's topics), `record`/`finishSession` (marks), `setMode` |
| Help & guidance | `js/help.js`, `js/data/help.js`, `js/tour.js`, `js/tips.js`, `js/update.js` | Help, version history (`APP_VERSION`, `versionHistory`), guided tours, hover help, new-version notices (`version.json`) |
| Voice | `js/speech.js`, `js/voices.js` | Device speech: four roles (tour guide, announcer, question reader, teacher), natural voices first |
| Other | `js/scratchpad.js`, `js/print.js`, `js/pwa.js`, `js/windows.js` | Scratchpad, paper mocks, install, movable/resizable windows |
| Question engine page | `engine.html` | Only the question files + `Engine.ask(kind, exam, name)`, for the Starlane site |

## 4. Data model

- **Profiles**: index in localStorage `apollo-maths-profiles` (`{list:[{id,name}], active}`); each player's
  stats in `apollo-maths-p:<id>`, file metadata in `apollo-maths-file-meta:<id>`, file handles in IndexedDB.
  Recycle bin: `am-recycle-bin`. Session hand-offs: `am-skip-picker`, `am-area`, `am-new-exam`, `am-new-look`.
- **`stats`** (one per player; `blankStats()` / `cleanStats()` in `app.js` — every field is validated because
  progress can come from a file): points, solved, attempts, first-time, streaks, `byTopic`, history, `avatar`,
  `owned`/`spent`, mocks, `fix` (Fix-it list), `plan`, `exam` (current profile, name, date), `examPlan`
  (`[{id, school, date, result}]`), `focus` (five topics), `adapt` (difficulty level per exam), `theme`
  (`{id, club, colour}`), `year` (school year 1–13; 0 = follow the exam's `year`; 2.83), `arcade` (settings, plays, high scores, `looks`, `saves.starlane`), `slMaths`
  (answers given in Starlane), `time`, `learn`, `speech`, …
- **Ownership is checked**: owned items must add up to points actually spent, so an edited file can't give
  free items.

## 5. The child's experience

- **Five areas** (`hub.js`): 🎯 Today (one big "next best thing", today's plan, Focus Zone), ✏️ Practise
  (missions by topic, game modes, the question), 🏆 Mock exam, 📚 Learn, 🏠 My room (character, 🛍️ Shop,
  🎨 theme, medals, leaderboard, games once discovered). Laptops (≥1100 px) get a **side rail** (character,
  name, points, areas, 💾 save, 🔊 sound, 👪 Grown-ups); phones and tablets a bottom bar with 💾 and 🔊 at
  the top right. Breakpoints: <760 phone, 760–1099 tablet, ≥1100 laptop, ≥1800 desktop (four columns),
  ≥2400 / ≥3200 the child's screen is scaled 1.2 / 1.4 (never the whole page, so pop-ups still fit).
- **Practice**: levels Warm-up / Match-day (adaptive) / Boss; modes training, sprint, endless, mock. Answer box
  + SHOOT; three hints, "Explain it simply", "Teach me the method", Prove it twins, scratchpad. Wrong types go
  on the **Fix-it list**. Focus mode (⛶) shows only the question.
- **Mocks follow the exam** (`EXAM_EXTRA`): Tiffin S1 40 q / 50 min MCQ; Tiffin S2 40 / 50 written; 11+
  grammar 50 / 50 MCQ; ISEB 40 / 40 MCQ; 13+ CE 30 / 60 written. Paper mocks print with a mark scheme.
- **Themes** (`themes.js`): ⚽ Anfield (Liverpool — Apollo's), ⚽ Football — my team (club name and colour),
  🚀 Space, 🐾 Animals & nature, 🎵 Music & art. A theme sets colours, header, sticker, **word swaps in
  questions** (`themeText` wraps `personalise`), the Shop catalogue, starter outfit and arcade game names.
- **Character**: girl/boy/own design, skin, hair, face, kit; themed items drawn from emoji + colour.
- **Save**: the 💾 button shows ✅ Saved hh:mm or a red ⚠️ Not saved (phones: a red ribbon too) and opens
  Save / Open / Save as / Export. Progress always lives in the browser as well.

## 6. Exams, plans and sources

Profiles (`EXAMS`): `tiffin1` Tiffin Stage 1 (quick, computer-marked), `tiffin2` Tiffin Stage 2 (written),
`grammar11` 11+ grammar (multiple choice), `iseb` ISEB Common Pre-Test (Eton, Harrow and others; adaptive,
Year 5 curriculum), `ce13` 13+ Common Entrance / scholarship (Year 8), `ks2sats` KS2 SATs (Year 6; 2.83), `y3`/`y4`/`y5` Year 3–5 maths and `mtc` the Year 4 multiplication tables check (2.84), `y1`/`y2` (KS1) and `y7`/`y8`/`y9` (KS3) (2.85). `EXAM_ORDER` runs from Year 1 to 13+. Each has topic **weights** (practice and
Starlane follow them), a style, and **official sources** shown under 🎓 Exam & sources.

**How the question bank follows the exam.** Mixed practice picks a topic by the exam's weights (`randomTopic` →
`examWeight`), then only generators that suit the exam (`suitsExam`: no `fn.exams`, or the exam is listed); single-topic
missions, mocks, Fix-it (`fixFits`) and Starlane (`examQuestion`) use the same filter. Whenever the exam being trained
for changes — Plan tab, a test date passing, a new player — the wrapped `syncExam` calls `examSwitched(prev)`: focus
topics move to `examFocusFor(id)` (Tiffin: the original five; others: the five most-weighted) unless a grown-up chose
their own (`stats.focusMine`, set by saving in Grown-ups → Focus areas, cleared by “↺ Follow the exam again”; focus is also
brought into line on load), then `examRefreshPage` replaces the unanswered question, restarts a running mock at the new length and
redraws topics, focus cards, today's plan and "Next best thing" (`Hub.nextText`). `tests/test_exams.py` checks all of
this at phone, tablet, laptop and huge sizes.

**Key stages and school years (2.83).** Each profile has a `year`; a grown-up can set the child's own school year in
Plan (`stats.year`, `childYear(s)`). `suitsExam` also holds back generators whose `fn.years[0]` is above the child's
year, and `examWeight` gives 0 to a topic that belongs to other exams (`topics[k].exams`) or has nothing for the
child's year yet. SATs: practice mixes the five arithmetic topics (weights 1.5–1.6) with the KS2 word-problem topics
(speed, probability and Tiffin puzzles are 0 — not in the KS2 curriculum); the mock is Paper 1 (36 arithmetic
questions, 30 minutes) and is also scored in marks (`stats.mocks[].mk/mkOf`). For a Year 6 child the Plan tab offers
“➕ Add KS2 SATs” (`SATS_DAY` = 13 May 2027, the last maths paper — update it each year). SATs has `papers` (2.84): Paper 1 arithmetic,
Papers 2 and 3 reasoning (24 questions, 40 minutes, the five `ks2_*` topics); Mock exam shows a paper picker and `examMock()`
returns the chosen one. Profiles with `only:true` (Years 3–5, tables check) give 0 to any topic they don't list, so
11+ puzzles never reach a Year 3 child. The tables check mock has `perQ:6`: a countdown under the question, a miss after
6 seconds, and it moves on by itself after an answer. Year 4 children get “➕ Add the times-tables check” (`MTC_DAY`).
`examFocusFor(id, s)` ranks topics by `examWeight` for that child, so focus never includes a topic with nothing for
their year. **KS1 (2.85)** profiles have `tap` (answer buttons in practice too, via `examMCQ`; a wrong tap
leaves the others open) and `read` (each question is read aloud with `Speech.say` when sound is on; ×, ÷, − and □ are
said as words). Year 2 has KS1-style papers. **KS3 (2.85)**: Years 7–9 use the five `ks3_*` topics (held back by year)
plus older word-problem topics at low weight; 13+ CE includes the KS3 topics. **GCSE (2.86).** `gcse_aqa`, `gcse_edexcel`, `gcse_ocr` share one question set
(`questions-gcse.js`, plus KS3 topics as revision) and differ in `papers` (OCR's middle paper is the non-calculator one).
`stage:'gcse'` → `examStage()`; the plan entry's `tier` (F/H) → `childTier()`; `fn.tier` and `fn.calc` filter questions
in `suitsExam`. Maths in question text is LaTeX between `\\(` and `\\)`, drawn by KaTeX (`js/render/maths.js`, loaded
only when needed, plain-text fallback). New answer kinds `expr`, `set`, `coord` are marked by `js/data/algebra.js`.
`js/gcse.js` adds the Look setting (`stats.look`; `body.look-senior` from Year 10 or on a GCSE exam), the 📐 formula
sheet (a revision copy — boards provide the real one, confirmed by Ofqual for the life of the current GCSEs) and
calculator labels.

**GCSE Foundation (2.88).** Seven GCSE topics (number, algebra, graphs, ratio, geometry, measures, statistics), 123
types in `questions-gcse.js` + `questions-gcse-f1.js` + `questions-gcse-f2.js` (new types are always appended, so
Fix-it's question numbers stay valid). `gcseTidyAll()` tidies wording. The **estimated grade** (`GcseGrade.grade()`,
gcse.js) averages the last three GCSE mocks of the child's tier and maps the percentage onto AQA's June 2025 boundaries
(Higher 9/8/7/6/5/4/3 = 219/191/164/130/96/63/46; Foundation 5/4/3/2/1 = 188/160/119/79/39, out of 240) — a guide only.

**GCSE Higher and all boards (2.89).** `questions-gcse-h.js` adds the Higher content. Eight board profiles share the
questions (`GCSE_IDS` in exams.js adds each to the GCSE and KS3 topics): AQA, Edexcel, OCR, Eduqas (England), WJEC
Mathematics and Numeracy (Wales; three units incl. a financial-numeracy calculator unit; Foundation/Intermediate/Higher —
use Higher for Intermediate), CCEA (NI; a calculator unit M1–M4 + a completion test), Edexcel International GCSE (two
calculator papers) and Cambridge IGCSE 0580 (Core/Extended). `letterGrades` boards (WJEC, CCEA, Cambridge) show a mock %
instead of a 9–1 estimate; `minsF`/`marksF` give the lower tier its own paper length; `tierNames` renames tiers.

**The senior look (2.87)** — chosen by Stuart (27 Nov): proof B “Night study” with a light theme, everything
age-appropriate for 14–18. It is a layer: `css/senior.css` only applies under `body.look-senior`; `js/senior.js` swaps
the characters (`drawSenior`), opens 🎨 Customise instead of the Locker Room (2.90: a MutationObserver on `#locker` also catches locker.js's own first-run open; a new player starts on the Hobby tab with a welcome note, and the add-player form offers hobbies once a GCSE/A-level exam is chosen), calms the wording (text-node swaps, `notice`
and `toast` wrappers) and shows Level/XP. Shop data: `js/data/senior-shop.js` — senior items are owned in `stats.sOwned`
and paid from the same `spent` as the children's items (checked by `cleanSenior`). XP = all points ever earned; credits
= wallet. Hobbies replace themes for older students (accent colour, own desk items and backdrop); questions keep the
theme word swaps. The arcade still uses the children's head for “My player” (a possible later change).

**Trying questions.** There is no question tester yet: built-in questions are tried by playing as a separate "Test"
child (pick a topic under ✏️ Practise). Starlane test mode is a game sandbox, not a question tester. ApolloMaths never loads
outside questions (decided 19 Nov 2026); grown-ups can load their own banks into **Starlane played on its own** (📚 Question
banks, Starlane v29+), which ApolloMaths-hosted Starlane ignores.

Each child has an **exam plan** (several tests with school, date and result); the app trains for the next
upcoming one, the header badge counts down, and a passed test asks "what's next?". Apollo: Tiffin Stage 2
(12 Nov 2026, result due March) then Eton via the ISEB Pre-Test (Eton's deadline 30 Nov 2026 for Sept 2029 entry).

**Exam watch** (`tools/exam-watch/watch.mjs`): GitHub Action, monthly + every Monday June–Nov + 15 Feb / 15 Mar
(06:00 UTC). Checks 12 official pages (Eton blocks bots — listed to check by hand), researches news with Claude +
web search, proposes key dates into `exam-dates.js` (✨ in Key dates), drafts question generators when an
official page changed (50 sandbox runs + an independent solve), opens a PR labelled **🤖 AI-maintained** and
**auto-merges** it if the files load, then requests a Pages build. Needs the `ANTHROPIC_API_KEY` secret and
Actions write permission + "Allow GitHub Actions to create and approve pull requests".

## 7. Grown-ups

- **Family codes** (`family.js`): a parent passphrase (PBKDF2-SHA-256, 200,000 rounds) guards advanced
  settings, resets, deleting players, unlocking games, Starlane test mode; the child's secret word and `00…`
  number code open the arcade. Codes are per device and **never in the repo**. Fair play: one tab at a time,
  arcade time only goes up, clock checks. Family-level protection, not security against a determined user.
- **Admin** (`admin.js`, a separate secret word + PIN): arcade rules (`ARCADE_DEFAULTS` — earned time, unlock
  conditions, session/day/week limits, allowed hours, no play on exam day), lock the dashboard and reset.
- **Parent dashboard**: Overview (summary cards), 📋 Plan (exam plan, key dates, sources, 🤖 note), 📈 Progress
  (Readiness with print, Focus areas, Topics, Question types & mistakes, Mocks, Learning), ⏱️ Time & activity,
  🎮 Games & rewards (Starlane maths + "🔍 Check Starlane questions", Shop), ⚙️ Family & data (save, open,
  exports, players, family codes) and Settings; a find box. Fixed size; only the content scrolls.
- **Players**: deleting needs the name typed exactly + passphrase; deleted players sit in a ♻️ recycle bin for
  30 days (`protect.js`) and can be restored with their progress.

## 8. The arcade and Starlane

Opened by the child's secret word/code (or Admin). 11 original games (Invaders, Maze Muncher, Meteor Storm,
Planet Guardian, Ladder Dash, Turbo Racer, Super Snake, Pinball Goal, Brick Blaster, Road Hopper, Block Drop),
each with 🧍 My player (the child's head, theme colour and theme items) or 👾 Classic, remembered per game;
names follow the theme (e.g. Pony Derby). No two-player mode and no CRT switch since 2.77.

**Starlane Trader** opens from its own site in a full-screen frame (`openRemoteStarlane()`), hosted through
`window.StarlaneHost` v1 (profile, saves into `stats.arcade.saves.starlane`, `question()` from the child's exam,
`report()` into `stats.slMaths`, `requestTest()` passphrase, `exit()`). Full details: the Starlane repo's
`docs/KNOWLEDGE.md` §6. It needs http(s) — opened as a local file the arcade shows a message instead.

## 9. Releasing a version (the routine)

1. Change code. 2. In `js/data/help.js` bump `APP_VERSION` and add a `versionHistory` entry (child-friendly
`kids` line, `items`, `tags`). 3. Add a `- **vX.Y:**` line to the README changelog and a plain-English entry to `CHANGELOG.md`. 4. `node tools/make-version.js`
(writes `version.json`). 5. Bump `CACHE` in `sw.js`; add any new script to `index.html` **and** the `sw.js`
list. 6. `python tests/run_all.py` — all green. 7. Commit and push to `main` (backup tag first if major); check the
"pages build and deployment" run succeeded. (Before November 2026 changes were zipped for Stuart to upload — no longer.)

## 10. History in brief

| Versions | What happened (dates are 2026) |
|---|---|
| 1.0–1.3 | Before/7 Nov: topic missions, mocks, hints and methods, Tiffin checks, "Explain it simply", player and Shop |
| 2.0–2.16 | 7–8 Nov: profiles, Learn missions, Tiffin-style fractions, the secret arcade, windows, Focus areas, clock, tours, read-aloud and voices, question quality pass, hover help, update notices |
| 2.17–2.66 | 9–12 Nov: Starlane Trader built inside the app (see the Starlane repo); family codes (2.19) |
| 2.67–2.70 | 13 Nov: Starlane opened from its own site; exam profiles and sources; exam watch; Starlane maths in the dashboard |
| 2.71–2.80 | 13 Nov: exam plans and badge, mocks per exam, adaptive difficulty and stretch questions, the five-area layout, themes, student space and themed Shop/arcade, save button, fixed dashboard, per-game looks, profile protection, built-in Starlane removed, exam watch auto-merge |
| 13 Nov | This knowledge base and the test rig |
| 2.81 | 15 Nov: changing the exam refreshes the child's page (question, focus, plan, mock); Fix-it keeps to the exam; exam plan as cards on phones/tablets; `exams` test suite |
| 2.82 | 15 Nov: focus areas always follow the exam until a grown-up chooses their own (`focusMine`) |
| 2.89 | 27 Nov: GCSE Higher (186 types) and all eight GCSE/IGCSE boards |
| 2.88 | 27 Nov: GCSE Foundation content (123 types, 7 topics), estimated grade, 25-question papers |
| 2.87 | 27 Nov: senior look (Night study + light theme), Customise, hobbies, XP levels, new character, `senior` suite |
| 2.86 | 27 Nov: GCSE groundwork — KaTeX, graphs, algebra answers, tiers, board papers, formula sheet, Look setting, 24 GCSE types, `gcse` suite |
| 2.85 | 27 Nov: KS1 (Years 1–2: pictures, tap, read aloud, 36 types, Year 2 papers) and KS3 (Years 7–9, 46 types; also in 13+ CE), `ks1ks3` suite |
| 2.84 | 27 Nov: SATs Papers 2–3 (reasoning, 5 topics, 47 types), Year 3–5 profiles, Year 4 tables check (6 s per question), paper picker, `ks2` suite |
| 2.83 | 27 Nov: key stages begin — KS2 SATs exam, five arithmetic topics (36 types), Paper 1 mock in marks, school year in Plan, “Add KS2 SATs”, `stages` test suite |


**Minus key (2.90).** On touch screens (`@media (pointer:coarse)`) a − key (`#minusKey`) sits beside the answer box, because number keypads on many phones and tablets have no minus. Behaviour is in `js/stages.js`: on a plain number it toggles a leading minus; in longer answers it types one at the cursor. The optional Learn “Have a go” box doesn't have one yet (Starlane's questions are tap-to-answer, so it doesn't need one).
