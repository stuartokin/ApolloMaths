# Apollo's Maths Missions — Tiffin Stage 2 maths helper

Open `index.html` (or the GitHub Pages site). Works offline; no accounts, no adverts.

## How the code is organised
| Layer | Files | What it does |
|---|---|---|
| Data (no screen code) | `js/core.js`, `js/data/topics.js`, `js/data/questions-core.js`, `js/data/questions-focus.js`, `js/data/lessons.js`, `js/data/explainers.js`, `js/data/marking.js`, `js/data/questions-extra.js`, `js/data/shop.js`, `js/data/shop-extra.js`, `js/data/learning.js`, `js/data/metrics.js` | Topics, question generators, lessons, "Explain it simply" content, answer marking, avatar options, Kit Shop catalogue and reward rules. Diagrams are described as specs, e.g. `F('cuboid',5,3,4,…)`. |
| Presentation | `index.html`, `css/app.css`, `js/render/render.js`, `js/render/avatar.js`, `js/render/avatar-extra.js`, `js/learn.js`, `js/locker.js`, `js/players.js`, `js/parent.js`, `js/scratchpad.js`, `js/print.js`, `js/pwa.js` | Page structure, styles for phones → large screens, drawing of diagrams/lessons/explainers, Apollo's player, the Locker Room, “Who’s playing?”, leaderboard, Parent dashboard, scratchpad, printing and app install. |
| Storage | `js/storage.js` | Player profiles; saves each player's progress in the browser automatically, and to their own progress file (e.g. `apollo-maths-progress.json`). |
| App | `js/app.js` | Buttons, game modes, scoring, save/open wiring. |

## Players
- Each child has their own player: name, look, points, kit, stats and progress file. Tap **🔁 Switch player** (top of the page) to change or add players; with more than one player the app asks “Who’s playing?” when it opens.
- Change a name in **🎨 Change my look** or in “Who’s playing?”. The name is remembered and used everywhere, including in the word problems.
- Opening someone’s progress file loads it into their own player (adding them if needed).

## Parent dashboard (👪 in the left-hand column)
Overview, time (total, per day, and split into questions / learning / Kit Shop — the clock pauses after 2 minutes without a tap), every topic, every question type with the wrong answers typed, mocks (online and paper), shop purchases, an activity log and settings (exam name/date). Exports: every question, time per day and topic summary as CSV, plus a printable report.

## Site switches (`config.js`)
`config.js` holds switches that apply to every device. To turn the hidden arcade off or on, edit it on GitHub:
```js
window.APP_CONFIG = { arcade: true };   // false = arcade off everywhere
```
GitHub Pages is a static site, so it can't read environment variables while running. If you'd rather use a **repository variable**, set Pages → Source to **GitHub Actions**, add a variable `ARCADE_ENABLED` (`true`/`false`) under Settings → Secrets and variables → Actions → Variables, and use a workflow like this (`.github/workflows/pages.yml`; check the action versions are current):
```yaml
name: Deploy site
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.d.outputs.page_url }}" }
    steps:
      - uses: actions/checkout@v4
      - run: echo "window.APP_CONFIG={arcade:${{ vars.ARCADE_ENABLED == 'false' && 'false' || 'true' }}};" > config.js
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: . }
      - id: d
        uses: actions/deploy-pages@v4
```

## Hidden arcade and Admin (parents)
- A secret word **or secret number code** (typed into the answer box and sent with SHOOT, or typed anywhere on a computer) opens the arcade. Number codes are for tablets that only show a number keypad; they always start with `00` and are 6–10 digits, so they can never be a real answer.
- Four original games (`js/games.js`): **Invaders** (My player or Classic style, with a bonus game after every wave — penalty shoot-out, maths blast, meteor dodge, UFO hunt), **Maze Muncher**, **Meteor Storm**, **Planet Guardian**, **Ladder Dash**, **Turbo Racer** and **Super Snake**. They are inspired by classic arcade genres; no code, artwork or names are copied. All share the same time limits; each has its own high score. A different secret word opens **Admin** (PIN-protected). The words are not written here on purpose — this repository is public.
- Play time is limited per player by rules set in Admin: what must be done first (minutes of learning, questions right, Focus questions right, a Learn mission, Today's plan), earned or fixed play time, longest session, break between sessions, most per day and per week, allowed days and hours, no play on exam day, and one-off extra minutes.
- Admin can also lock the Parent dashboard and “Reset progress” behind the PIN, see play history and play without limits (not counted).
- The PIN and words are stored on each device as salted SHA-256 hashes. This is family-level protection: the code is public and browser developer tools could still change things.
- Rules live in `js/data/arcade-rules.js`; the game in `js/arcade.js`; Admin in `js/admin.js`.

## Session clock and saved arcade time
- The top of the page shows **this session** and **total** time (active time only — it pauses when the app isn’t being used). The session is saved every few seconds and when the page is hidden/closed; reopening within the parent’s setting (Admin → Arcade rules → Session clock, default 15 minutes, 0 = always new) carries on the same session.
- Arcade sessions can include several games. If the arcade is left early, the unplayed time is banked (Admin: on/off, most that can be saved, default 15 minutes) and added to the next session — and if that is on a later day, on top of that day’s limits.

## Focus areas (chosen by a parent)
- Parent dashboard → **🎯 Focus areas**: tick any five topics for each player and save. They get the Focus Zone cards (📘 Learn, 🎲 Examples, ⚽ Practise), Focus bonuses, streaks, mastery rewards, readiness bars and Today’s plan. The choice is saved with the player’s progress (and in their progress file).
- The app suggests five, ranked by need: right-first-time rate, how often help was used, skipped questions and lesson checks; untried topics are flagged when there isn’t enough evidence yet.
- Default: Volume, Equivalent fractions, Properties of shapes, Measuring space, Representing data. Every one of the 23 topics has its own Learn mission (`js/data/learning.js`, `js/data/learning-more.js`).

## Windows, highlights and full screen
- Every pop-up window can be moved (drag the title bar), resized (drag the bottom-right corner) and expanded (⤢ or double-click the title) — `js/windows.js`. On phones they are full-screen anyway.
- After a correct answer, **Next Question** (and **Next step** in lessons) turns green and takes keyboard focus.
- On opening the app the question panel is spotlighted until the first answer is typed; on phones a floating button jumps to it.
- Games have a **⛶ Full screen** button (browser full screen where allowed; on iPhone the game fills the page).

## Fractions and help
- Fractions are written the Tiffin way — numerator over a line over the denominator — in questions, hints, methods, explainers, lessons, examples, the paper mock and the mark scheme (`fracHTML` / `fracify` in `js/render/render.js`). Apollo still types them as `3/4`, and sees a preview of how they look.
- **❓ Help** (top of the page and footer) explains how to use the app and shows the version history (`js/data/help.js`, `js/help.js`). Change `APP_VERSION` and add an entry to `versionHistory` for each release; players are told once about a new version.

## Learning that earns points (and can't be faked)
- **📘 Learn missions** (Focus Zone): 6 short steps per topic. Each step unlocks its quick check only after enough *active* reading time — the timer pauses after 45 seconds with no tap, scroll, key or pointer movement. +8 ⚡ per check right first time, +4 second time, +25 ⚡ for finishing. Points once per lesson per day.
- **🎲 Example Studio**: fresh worked examples; each step is revealed after a few active seconds. +3 ⚡ per example studied in full (max 5 per topic per day).
- **🔁 Prove it**: after “Teach me the method”, a twin question of the same type. +15 ⚡ if right first time.
- **🧒 Explainer bonus**: +3 ⚡ only when the explainer is followed by a correct answer.
- **Focus rewards**: +10 ⚡ for a Focus answer right first time (+3 after a retry); Focus streaks of 3/5/10 earn +15/+30/+75; mastery milestones at 60/80/95% readiness (10+ recent answers) earn +100/+200/+300.
- **Guess guard**: no points after three wrong tries.
- All learning activity is shown in the Parent dashboard → 🧠 Learning.
- 237 question families in total (each makes endless fresh versions), including 36 added for the Focus topics and Tiffin-style puzzles.

## Learning extras
- **Fix-it list**: question types that went wrong come back with new numbers until they are right first time twice in a row.
- **Today’s plan**: exam countdown, daily tasks (+30 ⚡ when all are done) and a readiness bar for each Focus topic.
- **🖨️ Print a paper mock**: 25 Stage 2-style questions with working space, plus a mark scheme; record the score in the Parent dashboard.
- **✏️ Scratchpad**: draw working out with a finger, stylus or mouse.
- **📲 Install app**: on GitHub Pages the app can be installed (Chrome/Edge: install button; iPad/iPhone: Share → Add to Home Screen) and then works offline. `sw.js` always fetches the newest files when online.

## Kit Shop (222 items)
Kits, boots, hats, glasses, scarves, medals, wings, things to hold, sidekicks, 25 experiences (backgrounds), 15 goal celebrations, 20 titles, 9 card frames and 17 **Maths Legends cards** (true stories of famous mathematicians, each with a puzzle). Prices run from 40 to 8,000 ⚡ in small steps.
- **🔥 For you**: items at or just above what the player can spend right now.
- **Deal of the day**: one nearby item at 25% off (announced once a day).
- **Announcements**: a message when something new becomes affordable; a news ticker on the player card.

## Player, points and the Kit Shop
- Apollo designs his own player (skin, hair, eyes, face, kit colour, shirt number).
- Every right answer earns ⚡ power points (fewer if hints or the method were used). Focus Zone topics earn +5 bonus, and getting 5 right each day earns a +50 daily bonus.
- Points are spent in the Kit Shop on kits, hats, boots, extras, things to hold, sidekicks, experiences (backgrounds) and goal celebrations. Prices rise by tier: Starter, Pro, Elite, Legendary. Spending lowers the wallet, never the lifetime Power points score.
- Skill unlocks can't be bought: they are earned by getting 10 Focus Zone questions right first time in a topic (or finishing a mock).
- The player, items and wallet are saved in the browser and in the progress file. Edited files can't give free items: owned items must add up to points actually spent.

## Saving progress
- Progress is always kept in this browser.
- **💾 Save progress** writes a progress file. In Chrome or Edge on a computer, the app then keeps saving to that file automatically (auto-save). After reopening the page, one tap on **🔌 Turn auto-save on** resumes it.
- On Safari, iPad/iPhone and Firefox the file is downloaded; the app shows when there is newer progress that hasn't been saved yet.
- **📂 Open progress file** loads a saved file (e.g. on another device).

Original Tiffin-style practice — not an official Tiffin School paper, nor an official Liverpool FC or Beano product.
