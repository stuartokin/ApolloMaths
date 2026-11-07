# Apollo's Maths Missions — Tiffin Stage 2 maths helper

Open `index.html` (or the GitHub Pages site). Works offline; no accounts, no adverts.

## How the code is organised
| Layer | Files | What it does |
|---|---|---|
| Data (no screen code) | `js/core.js`, `js/data/topics.js`, `js/data/questions-core.js`, `js/data/questions-focus.js`, `js/data/lessons.js`, `js/data/explainers.js`, `js/data/marking.js`, `js/data/shop.js` | Topics, question generators, lessons, "Explain it simply" content, answer marking, avatar options, Kit Shop catalogue and reward rules. Diagrams are described as specs, e.g. `F('cuboid',5,3,4,…)`. |
| Presentation | `index.html`, `css/app.css`, `js/render/render.js`, `js/render/avatar.js`, `js/locker.js` | Page structure, styles for phones → large screens, drawing of diagrams/lessons/explainers, Apollo's player, and the Locker Room (look editor, Kit Shop, celebrations). |
| Storage | `js/storage.js` | Saves progress in the browser automatically, and to a progress file (`apollo-maths-progress.json`). |
| App | `js/app.js` | Buttons, game modes, scoring, save/open wiring. |

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
