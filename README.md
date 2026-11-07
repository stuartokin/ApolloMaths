# Apollo's Maths Missions — Tiffin Stage 2 maths helper

Open `index.html` (or the GitHub Pages site). Works offline; no accounts, no adverts.

## How the code is organised
| Layer | Files | What it does |
|---|---|---|
| Data (no screen code) | `js/core.js`, `js/data/topics.js`, `js/data/questions-core.js`, `js/data/questions-focus.js`, `js/data/lessons.js`, `js/data/explainers.js`, `js/data/marking.js` | Topics, question generators, lessons, "Explain it simply" content, answer marking. Diagrams are described as specs, e.g. `F('cuboid',5,3,4,…)`. |
| Presentation | `index.html`, `css/app.css`, `js/render/render.js` | Page structure, styles for phones → large screens, and drawing of diagrams/lessons/explainers. |
| Storage | `js/storage.js` | Saves progress in the browser automatically, and to a progress file (`apollo-maths-progress.json`). |
| App | `js/app.js` | Buttons, game modes, scoring, save/open wiring. |

## Saving progress
- Progress is always kept in this browser.
- **💾 Save progress** writes a progress file. In Chrome or Edge on a computer, the app then keeps saving to that file automatically (auto-save). After reopening the page, one tap on **🔌 Turn auto-save on** resumes it.
- On Safari, iPad/iPhone and Firefox the file is downloaded; the app shows when there is newer progress that hasn't been saved yet.
- **📂 Open progress file** loads a saved file (e.g. on another device).

Original Tiffin-style practice — not an official Tiffin School paper, nor an official Liverpool FC or Beano product.
