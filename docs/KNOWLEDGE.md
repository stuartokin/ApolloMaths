# Apollo's Maths Missions — knowledge base

*Stuart Okin, Director of Cyber Regulation and Emerging Technologies, Ofgem — personal project.*
*Last full update: 13 November 2026 (version 2.80).*

Written so that a future person or AI model, starting cold, can understand the whole app and why it is the way
it is. Lessons learned are in `LESSONS.md`, future requirements in `ROADMAP.md`, the test rig in
`tests/README.md`. The README's long changelog (`vX.Y:` lines) records every release in technical detail.

---

## 1. What it is and who it is for

A maths-practice app for UK selective-school entrance exams. Stuart built it for his son **Apollo** (11 in 2026)
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
Stuart updates it by uploading changed files through GitHub's web page. `sw.js` makes it installable and
offline-capable (bump `CACHE='maths-missions-vN'` every release).

## 3. Code map

Load order matters: data first, then rendering, storage, features, `app.js`, then the layers added later
(`hub.js`, `themes.js`, `student.js`, `protect.js`) that wrap or reorganise what came before.

| Area | Files | Notes |
|---|---|---|
| Core | `js/core.js` | `R(a,b)` random (leans with `QDIFF` for difficulty), `Q(…)` question builder, `mk(topic, fn)` registers a generator into `bank` |
| Topics & questions | `js/data/topics.js`, `questions-core.js`, `questions-focus.js`, `questions-extra.js`, `questions-exams.js`, `questions-agent.js` | 23 topics; ~268 generators. A generator returns `{q, a, u, h:[3 hints], s:[worked steps], fig?, table?, kind?}`. `fn.exams=[…]` limits it to exams; `fn.diff` 0/1/2 |
| Difficulty | `js/data/difficulty.js` | `rateQuestionTypes()` rates each generator; adaptive level per child per exam in `stats.adapt` (3 right first time → up, 2 misses → down); `diffFilter`, `setQDiff`, `qOK` (rejects accidentally trivial questions such as 5:5) |
| Exams | `js/data/exams.js`, `exam-dates.js` | `EXAMS` (5 profiles: weights, style, sources), exam **plan** per child, header badge, mocks per exam, readiness, key dates, Sources, Starlane question socket (`examQuestion`), parent tabs Plan/Readiness/Starlane |
| Learning | `js/data/lessons.js`, `learning.js`, `learning-more.js`, `explainers.js`, `marking.js`, `metrics.js`, `js/learn.js` | Learn missions (6 steps per topic, active-reading gates), Example Studio, "Explain it simply", answer marking (`judge`), readiness, Today's plan (`planFor`) |
| Rendering | `js/render/render.js`, `avatar.js`, `avatar-extra.js` | Diagrams from specs (`F('cuboid',…)`), fractions the Tiffin way (`fracHTML`), the character SVG (`drawAvatar`) |
| Storage & players | `js/storage.js`, `js/players.js`, `js/protect.js` | Profiles, per-player stats, progress files (File System Access API with auto-save on Chrome/Edge; download elsewhere), "Who's playing?", recycle bin |
| Family & Admin | `js/family.js`, `js/admin.js`, `js/data/arcade-rules.js` | Parent passphrase (PBKDF2), child's secret word/number code, fair-play locks, Admin PIN, play-time rules |
| Shop & character | `js/locker.js`, `js/data/shop.js`, `shop-extra.js`, `shop-themes.js` | 274 items (kits, hats, boots, extras, pets, scenes, celebrations, titles, frames, Maths Legends cards, skills); themed catalogues |
| Arcade | `js/arcade.js`, `js/games.js`, `js/retro.js` | 11 original games + Starlane (opened from its site); My player / Classic per game; avatar drawn via `AVH()` |
| Parent dashboard | `js/parent.js` (+ tabs in `exams.js`, `student.js`) | Grouped tabs, summary cards, find box |
| Layout & theme | `js/hub.js`, `js/student.js`, `js/themes.js`, `css/app.css` | Five areas, side rail, slim header, save button, themes |
| Help & guidance | `js/help.js`, `js/data/help.js`, `js/tour.js`, `js/tips.js`, `js/update.js` | Help, version history (`APP_VERSION`, `versionHistory`), guided tours, hover help, new-version notices (`version.json`) |
| Voice | `js/speech.js`, `js/voices.js` | Device speech: four roles (tour guide, announcer, question reader, teacher), natural voices first |
| Other | `js/scratchpad.js`, `js/print.js`, `js/pwa.js`, `js/windows.js` | Scratchpad, paper mocks, install, movable/resizable windows |
| Question engine page | `engine.html` | Only the question files + `Engine.ask(kind, exam, name)`, for the Starlane site |
| **Dead files** | `js/starlane*.js`, `js/vendor/three-*` | Old built-in Starlane, unused since 2.79 — **delete** (Stuart, by hand) |

## 4. Data model

- **Profiles**: index in localStorage `apollo-maths-profiles` (`{list:[{id,name}], active}`); each player's
  stats in `apollo-maths-p:<id>`, file metadata in `apollo-maths-file-meta:<id>`, file handles in IndexedDB.
  Recycle bin: `am-recycle-bin`. Session hand-offs: `am-skip-picker`, `am-area`, `am-new-exam`, `am-new-look`.
- **`stats`** (one per player; `blankStats()` / `cleanStats()` in `app.js` — every field is validated because
  progress can come from a file): points, solved, attempts, first-time, streaks, `byTopic`, history, `avatar`,
  `owned`/`spent`, mocks, `fix` (Fix-it list), `plan`, `exam` (current profile, name, date), `examPlan`
  (`[{id, school, date, result}]`), `focus` (five topics), `adapt` (difficulty level per exam), `theme`
  (`{id, club, colour}`), `arcade` (settings, plays, high scores, `looks`, `saves.starlane`), `slMaths`
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
Year 5 curriculum), `ce13` 13+ Common Entrance / scholarship (Year 8). Each has topic **weights** (practice and
Starlane follow them), a style, and **official sources** shown under 🎓 Exam & sources.

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
`kids` line, `items`, `tags`). 3. Add a `- **vX.Y:**` line to the README changelog. 4. `node tools/make-version.js`
(writes `version.json`). 5. Bump `CACHE` in `sw.js`; add any new script to `index.html` **and** the `sw.js`
list. 6. `python tests/run_all.py` — all green. 7. Diff against a fresh clone of the live repo and zip only the
changed files (folder structure kept); list files to delete.

## 10. History in brief

| Versions | What happened (dates are 2026) |
|---|---|
| 1.0–1.3 | Before/7 Nov: topic missions, mocks, hints and methods, Tiffin checks, "Explain it simply", player and Shop |
| 2.0–2.16 | 7–8 Nov: profiles, Learn missions, Tiffin-style fractions, the secret arcade, windows, Focus areas, clock, tours, read-aloud and voices, question quality pass, hover help, update notices |
| 2.17–2.66 | 9–12 Nov: Starlane Trader built inside the app (see the Starlane repo); family codes (2.19) |
| 2.67–2.70 | 13 Nov: Starlane opened from its own site; exam profiles and sources; exam watch; Starlane maths in the dashboard |
| 2.71–2.80 | 13 Nov: exam plans and badge, mocks per exam, adaptive difficulty and stretch questions, the five-area layout, themes, student space and themed Shop/arcade, save button, fixed dashboard, per-game looks, profile protection, built-in Starlane removed, exam watch auto-merge |
| 13 Nov | This knowledge base and the test rig |
