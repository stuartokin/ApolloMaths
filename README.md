# Apollo's Maths Missions — Tiffin Stage 2 maths helper

Open `index.html` (or the GitHub Pages site). Works offline; no accounts, no adverts.

## How the code is organised
| Layer | Files | What it does |
|---|---|---|
| Data (no screen code) | `js/core.js`, `js/data/topics.js`, `js/data/questions-core.js`, `js/data/questions-focus.js`, `js/data/lessons.js`, `js/data/explainers.js`, `js/data/marking.js`, `js/data/shop.js`, `js/data/metrics.js` | Topics, question generators, lessons, "Explain it simply" content, answer marking, avatar options, Kit Shop catalogue and reward rules. Diagrams are described as specs, e.g. `F('cuboid',5,3,4,…)`. |
| Presentation | `index.html`, `css/app.css`, `js/render/render.js`, `js/render/avatar.js`, `js/locker.js`, `js/players.js`, `js/parent.js`, `js/scratchpad.js`, `js/print.js`, `js/pwa.js` | Page structure, styles for phones → large screens, drawing of diagrams/lessons/explainers, Apollo's player, the Locker Room, “Who’s playing?”, leaderboard, Parent dashboard, scratchpad, printing and app install. |
| Storage | `js/storage.js` | Player profiles; saves each player's progress in the browser automatically, and to their own progress file (e.g. `apollo-maths-progress.json`). |
| App | `js/app.js` | Buttons, game modes, scoring, save/open wiring. |

## Players
- Each child has their own player: name, look, points, kit, stats and progress file. Tap **🔁 Switch player** (top of the page) to change or add players; with more than one player the app asks “Who’s playing?” when it opens.
- Change a name in **🎨 Change my look** or in “Who’s playing?”. The name is remembered and used everywhere, including in the word problems.
- Opening someone’s progress file loads it into their own player (adding them if needed).

## Parent dashboard (👪 in the left-hand column)
Overview, time (total, per day, and split into questions / learning / Kit Shop — the clock pauses after 2 minutes without a tap), every topic, every question type with the wrong answers typed, mocks (online and paper), shop purchases, an activity log and settings (exam name/date). Exports: every question, time per day and topic summary as CSV, plus a printable report.

## Learning extras
- **Fix-it list**: question types that went wrong come back with new numbers until they are right first time twice in a row.
- **Today’s plan**: exam countdown, daily tasks (+30 ⚡ when all are done) and a readiness bar for each Focus topic.
- **🖨️ Print a paper mock**: 25 Stage 2-style questions with working space, plus a mark scheme; record the score in the Parent dashboard.
- **✏️ Scratchpad**: draw working out with a finger, stylus or mouse.
- **📲 Install app**: on GitHub Pages the app can be installed (Chrome/Edge: install button; iPad/iPhone: Share → Add to Home Screen) and then works offline. `sw.js` always fetches the newest files when online.

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
