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
- **Retro arcade toolkit** (`js/retro.js`): 5×7 pixel font, pixel sprites, particle explosions and screen shake, attract (title) screens with a score table for every game (the session clock doesn't run on them), pixel banners and an optional CRT scanline effect (📺 on the game menu). Sounds include noise explosions and a racing engine note.
- **Planet Guardian** follows the classic side-scroller style: scanner with view brackets, multicoloured streak lasers, landers that abduct humanoids (catch them as they fall), mutants, baiters, bombers with mines, pods that burst into swarmers, smart bombs (💣 / B), the planet exploding if every humanoid is lost, and an attack-wave tally. Other games gained score tables, pixel HUDs, saucers and hyperspace (Meteor Storm), neon walls and READY! (Maze Muncher), hammers, fireballs and a bonus timer (Ladder Dash), start lights, oil slicks and engine sound (Turbo Racer), and new mazes and combos (Super Snake).
- Four original games (`js/games.js`): **Invaders** (My player or Classic style, with a bonus game after every wave — penalty shoot-out, maths blast, meteor dodge, UFO hunt), **Maze Muncher**, **Meteor Storm**, **Planet Guardian**, **Ladder Dash**, **Turbo Racer** and **Super Snake**, **Pinball Goal** (flippers, plunger, bumpers, drop-target multiplier, G-O-A-L lanes, ball saver), **Brick Blaster** (power-ups, new wall each level) and **Road Hopper** (roads, river, five homes, timer) and **Block Drop** (an original falling-blocks puzzle with 3- and 4-block pieces in a 12-wide well — deliberately not a copy of Tetris’s look).
- **Two players** (for twins and friends): Block Drop versus (cleared lines send junk rows), Super Snake versus and Brick Blaster co-op are played side by side (P1: W A S D + Space, P2: arrow keys + Enter; separate touch buttons for each). Every other game takes turns, with a winner screen. Each game keeps a **top-5 high-score table** with names and dates. They are inspired by classic arcade genres; no code, artwork or names are copied. All share the same time limits; each has its own high score. A different secret word opens **Admin** (PIN-protected). The words are not written here on purpose — this repository is public.
- Play time is limited per player by rules set in Admin: what must be done first (minutes of learning, questions right, Focus questions right, a Learn mission, Today's plan), earned or fixed play time, longest session, break between sessions, most per day and per week, allowed days and hours, no play on exam day, and one-off extra minutes.
- Admin can also lock the Parent dashboard and “Reset progress” behind the PIN, see play history and play without limits (not counted).
- The PIN and words are stored on each device as salted SHA-256 hashes. This is family-level protection: the code is public and browser developer tools could still change things.
- Rules live in `js/data/arcade-rules.js`; the game in `js/arcade.js`; Admin in `js/admin.js`.

## Reading aloud (text-to-speech)
- Uses the browser's built-in voices (`js/speech.js`, same approach as the ResearchGap app): English voices only, British preferred, female/male chosen by voice name, spoken sentence by sentence with a safety timer.
- Four roles with their own voice (when the device has several), speed and pitch: 🗺️ tour guide, 📣 announcer, ❓ question reader, 🧑‍🏫 teacher. Maths is made speakable (fractions, units, ×, ÷, =, capitals).
- **Natural voices first:** *Automatic* prefers natural/neural voices (names containing Natural, Neural, Premium or Enhanced): the preferred gender (British first), then the other gender, reusing voices if there are fewer than four; only devices with no natural voices fall back to ordinary ones. Natural voices are marked ✨ and listed first in the pickers.
- **Voice for each job:** in 🎙️ Voices each role can use *Automatic* or any voice on the device (English UK first, then other English, then other languages). Saved per player by voice name; if that voice isn't on the current device, Automatic is used and the window says so.
- 🔊/🔇 at the top mutes announcements (toasts and answer feedback). 🎙️ Voices: female/male, speed, read-aloud buttons on/off, tour narration on/off, try each voice (`js/voices.js`). Saved per player (browser and progress file).
- 🔊 read-aloud buttons on questions, explainers, worked methods, Learn steps and Example Studio; listening to a Learn step counts as active reading.
- Tours narrate each step and move on by themselves, with ⏸ pause (or P) and 🔇 narration off.

## Welcome screen and guided tours
- The first time a player opens the app (after choosing/designing their player), a welcome screen offers a **🚀 player tour** or a **👪 grown-ups' tour**, or *Maybe later*. Ticking **Don't ask me again** stops it; finishing the player tour also stops it. This is saved with the player's progress (browser and progress file).
- Tours spotlight each real part of the page with a speech bubble (Next/Back/Skip, arrow keys, Esc). Player tour: name/clock/Help, My player, Kit Shop, Today's plan, answering questions, help buttons, Focus Zone, game modes and timed tests, printing, topics, Match centre, medals, leaderboard, saving. Grown-ups' tour: opens the Parent dashboard and explains Overview, Focus areas (the five, suggestions, choosing, saving), Learning, Question types & mistakes, Time, Mocks and Settings (skipped if the dashboard is PIN-locked); then timed tests and printouts, progress files, players, voices, hidden games/Admin (contact for passcodes), Help.
- Both tours can be rerun from the top of **❓ Help** (`js/tour.js`).

## Family codes and fair play (js/family.js)
No server and nothing written to GitHub — each family sets their own codes in the app.
- **Grown-up setup** (yellow banner, or Parent dashboard → Settings → Fair play & safety): parent passphrase (three words / 10+ characters, or a 6+ digit PIN; PBKDF2-SHA-256, 200,000 rounds), the child's secret word and number code (starting 00, for number-pad tablets), and a one-time recovery code. Stored scrambled in `stats.family`, so it travels with the child's progress file. If an older device Admin PIN exists, it is required first. Once set up, the old shared codes stop working and Admin opens from **🔐 Advanced settings** behind the passphrase.
- **Needs the passphrase:** Advanced settings, reset, deleting a player, a new Starlane commander, loading older progress, unlocking the games.
- **Fair play:** one tab at a time (Web Locks + BroadcastChannel, with "Use it here instead"); arcade time used can only go up (per-browser record `apollo-maths-ledger:<player>`); device-clock checks (backwards jumps, and the website's `Date` header when online; optional "games only when online"); hand-edited files detected (a check value `sig` in saved files — files from before 2.19 still load); new players start with the games locked; 5 automatic backups per player in IndexedDB with restore; events logged for the Parent dashboard.
- **Honest limit:** everything runs in the browser — it stops easy and accidental routes and makes deliberate ones visible; device parental controls (see Help) close the rest.

## Starlane Trader (js/starlane.js, js/starlane-audio.js, js/starlane-modern.js)
- **Styles (v2.27):** Original (green monochrome wireframe, no cockpit frame), Retro (2D canvas, solid lit shapes) and Modern (`js/starlane-modern.js`, a three.js renderer that draws the space view into its own WebGL canvas under Starlane's cockpit and HUD). three.js r128 plus the bloom post-processing files are bundled as `js/vendor/three-bundle.js` (MIT licence in `js/vendor/three-LICENSE.txt`) and loaded only when Modern is chosen; quality drops (bloom, then resolution) automatically if frames get slow. Starlane's world has the opposite handedness to three.js, so the renderer mirrors the z axis.
- **Sound (v2.27):** `js/starlane-audio.js` synthesises everything with Web Audio: engine hum following speed, per-style laser and explosion palettes with stereo placement, hangar ambience, calm and battle music (crossfades at red alert), docking clamps and landing gear. Respects the arcade mute button.
- **Gameplay (v2.27):** guided first flight (7 steps, 200 Cr and a medal), Easy/Normal/Hard, floating rewards, Navigator ranks for maths with perks.
- **Cockpit, radar and map (v2.28):** in Modern, `StarModern.views()` renders the side windows and mirror with extra cameras (scissored into the same WebGL canvas, then copied through each window's shape; the mirror is the rear view flipped). Radar: Holo 3D (perspective disc, sweep, typed icons) or Classic, range 5/10/25 km (`[`). Chart: GALAXY / LOCAL / 3D MAP; the 3D map has colour filters and `routeTo()` (Dijkstra over jumps of up to 7 LY).
- **v2.29:** live attract screen (`DEMO`, cycles the three styles every 5 s); defaults Modern style and Modern controls (`controlsModern`: mouse aim with dead zone, W/S throttle, A/D strafe, Q/E roll, Shift boost; arrow keys pause mouse aim for 2 s); nebula skybox, lens flare, ocean roughness map and night-side city lights (shader patch via `onBeforeCompile`), 3D exterior cut scenes; radio chatter (`radio()`); `trendFor()` price-history maths and route-estimate maths; reduced motion, colour-safe radar; auto-fallback to Retro if Modern stays slow.
- **v2.30:** device profiles (`C.opt.device` phone/tablet/desktop; phones Retro + classic controls + no cockpit screens; `StarModern.profile()` lowers resolution/effects; 3D drawing capped at 1920 px wide); `StarAudio` HRTF positioning, `flyby()`, `cabin()` muffling, calm/tension/battle music layers; missile lock-on (1.2 s), subsystem targeting (`]`), wingman (`'`, hired for 3 jumps), flanking pirates; `C.rep` factions with effects; reactive market (`C.mkMem`, 3% per tonne, decays daily); surveys and `C.codex`; story `story2`; maths kinds `risk` and `academy`; `stats.starlaneFreq` set in the Parent dashboard. Tested on iPhone portrait/landscape, iPad, MacBook Retina and a 1920×1080 PC profile: fits, no overlaps, no errors.
- **v2.31:** `StarModern.cockpit()` builds a 3D cockpit (beams placed where the 2D frame was, console with screens, light strips that turn red at red alert) carried with the ship; head-look with the right mouse button (pointer events; eases back; CAM is turned so every overlay stays aligned); `StarModern.hangar()` renders the movie interiors in a separate 3D hangar scene. Stuck-fire fix: pointer releases anywhere and window blur/visibility changes release keys, fire and stick.
- **v2.33:** fixed-step game time (real elapsed time run in 1/60 s steps, so slow frames never mean slow motion); quality presets AUTO/LOW/MEDIUM/HIGH/ULTRA and an FPS counter; destination terrain pre-generated in idle time. Maths: worked explanations after wrong answers (themed puzzles and the app's own solution steps), weakest topics from the app log (`weakTopics()`), engineer's repair and loading-bay puzzles, weekly Navigator's Cup. Visuals: holographic docking corridor, off-screen target arrow, hyperspace tunnel, boot-up check, turn vignette, boost lines, station news ticker; Modern ship detail (nozzles, canopy, nav lights), shield bubbles, explosion lights. Sound: engine per ship class, music mood per system, creaks, hull alarm, debris patter. Depth: 8 galaxies (`C.gx`, per-galaxy history in `C.galData`, galactic hyperdrive), economy events (`econTick()`), passenger, mining and race missions.
- **v2.34:** Modern cockpit rebuilt — `buildPit()` enclosed cabin in ship-local units (console top edge on the old VH line), live console screens from `updDash()` (classic scanner reused for the radar; `panelL`/`panelR` modern panels) as a CanvasTexture; general off-centre projection in `StarModern.render` (`A.full` for full-height views, `A.wide` for widescreen); widescreen layer `#slWide` behind the transparent game canvas in full screen (`wideState()`/`wideOff()`, removed in `onEnd`); views render into their own corner of the hidden canvas; `FF()` modern font; slide-up action bar (`drawConsoleHUD`); games can set `noCrt` to skip the arcade scanlines. Mission Log: `misRecap()` / `misTravel()` / `misAction()`, welcome-back recap from `C.lastSeen`.
- **v2.35:** console wings in widescreen (`deckState()`: wings when each side has ≥190 game units; left = CARGO screen + JUMP/DOCK/HYPER/MAP and TIME/VIEW knobs, CAM, TIPS; right = MISSION screen + MSL/ECM/HOLD/MISN and guarded BOMB/POD, MENU). Wing panels are canvases (`drawWing()`) mapped onto the console; 3D switches built by `buildDeck()` and animated by `updDeck()`; clicks and hover on the wings handled on the arcade's game box (`wingHit()`), tips drawn on the widescreen layer (`deckTip()`); `.arc-ctl`/`.arc-hud` moved to the top corners while widescreen is on.
- **Layout checker:** `_dbg.layoutOn()` records every text and button box for one frame (`_dbg.layout`); the test harness flags overlaps on every screen (38 screens clean in v2.27).

## Starlane Trader (js/starlane.js)
An original space-trading game in the style of the 1984 wireframe classics — original names, ships, systems, goods and text; the classic *mechanics* are recreated from published research (Mark Moxon's annotated 6502 source at bbcelite.com).
- **Galaxy:** 160 procedurally generated systems (seed 20261108) with economy, government, tech level, population, species, description and market; distances tuned so every system is reachable within 7 light years.
- **Markets:** price = base + (random AND mask) + economy × factor; illegal goods risk customs scans.
- **Flight:** back-face-culled wireframe ships, stardust, planets, sun, rotating octagonal station; dashboard with 3D elliptical scanner, gauges, compass, safe-zone and mass-lock lights.
- **Docking:** manual (within 26° of head-on, inside a 22° approach cone, slot within ~34° of level, slow) or docking computer (goes round the station if needed, matches rotation; plays The Blue Danube — public domain).
- **Combat & law:** lasers with heat, missiles, ECM, shock pulse, escape capsule; pirates, police, traders, distress calls, asteroids, cargo scooping, bounties, ranks; Clean/Offender/Fugitive.
- **Missions:** courier, supply, bounty, and political missions that change a system's government (saved as `gov` overrides, reported as Galactic News). Future upgrades add galaxies, systems, mission types and political events here.
- **Controls (v2.31):** two schemes, chosen in the pause menu → CONTROLS (defaults: MODERN on computers, CLASSIC on phones/tablets).
  - *MODERN:* mouse steers (dead zone; arrow keys also pitch/turn and pause mouse aim for 2 s), W/S speed, A/D slide, Q/E roll, Shift boost, left click or Space fire, right-drag looks around (Modern style + 3D cockpit).
  - *CLASSIC:* arrow keys or W A S D roll/pitch, Q/E turn, R/F (or + / −) speed, Shift boost, Space fire.
  - *Both (remappable):* M missile (needs a 1.2 s lock), U E.C.M., B shock pulse, J jump drive, C docking computer, H hyperspace, T time, V next view, 1–4 views, O outside camera, G chart (Tab cycles galaxy / local / 3D map), I hold, K missions, Z career, X escape capsule (twice), L roll lock, Y match spin, N next target, ] engines/weapons, ' wingman, [ radar range, F1 hover help, F2 cockpit screens, P or Esc pause. Mouse wheel = speed. Docked: 1–7 tabs, L launch; market ↑↓ choose, → / + buy, ← / − sell, Enter buy max.
  - *Touch:* floating stick, FIRE button, speed slider, deck buttons. *Gamepad:* left stick steer, right stick turn, triggers speed, A fire, B missile, X E.C.M., Y jump, LB dock, RB hyperspace, Start map, L3 boost.
  - All in-game help (How to play, Nova's intro, the guided flight, the Launch screen, console tips) reads the live key settings and the scheme in use.
- **Flight deck (v2.18):** 14 console keys with status lights (MSL, ECM, JUMP, DOCK, HYPER, TIME, VIEW, CAM, BOMB, POD, HOLD, MISN, MAP, MENU); hover (or tap) help on every key and gauge, switchable in settings. Station shown on the scanner rim when out of range.
- **Pause menu (P / Esc / MENU):** resume, save, hover help / cut scenes / invert pitch, full key remapping (saved per player), how-to-play guides (docking, trading, combat, travel, missions). The arcade session clock stops while it is open (`game.paused`, via the `game.onPause` hook).
- **Views:** front, rear, left, right (keys 1–4) and an outside chase camera (O) you can fly from. Time acceleration ×2/×4/×8 (T) switches off when danger appears.
- **Hyperspace:** streaking-stars effect, spooling up in the last second of the countdown, and the reverse on arrival.
- **Cut scenes:** docking (outside approach, then hangar landing among parked ships) and launch (hangar lift-off, then flying out of the spinning station). Tap or any key skips; can be switched off.
- **Varied systems:** from a separate random stream per system (the galaxy itself is unchanged): rocky / cratered / gas-giant planets, rings, 0–3 moons, single / binary / triple stars of different colours, asteroid belts, meteor showers. Shown on the DATA screen.
- **v2.22:** cockpit screens hide/show (✕ / F2); ship's assistant (`say()`, named via the pause menu, uses Speech when voice is on, subtitles always); red alert lamp and border (toggle); Data screens switch between this system and the target; `C.paid` average purchase prices with profit/loss in market, hold and cockpit; radar targets (tap a blip or N) with bracket and info panel; yaw on Q/E (E.C.M. moved to U for existing players via `optVer` 3), roll lock (L) and match station spin (Y), with buttons near stations; cockpit shake; ships to buy (`SHIPCLS`: Kestrel, Swift courier, Falcon fighter, Mule freighter, Warden gunship, 60% trade-in); hidden cargo compartment and in-flight police scans; story campaign “The Vorn Signal” (beacon → decode → mothership → reward); station defences for fugitives; ore from asteroids; solar flares and ion storms; exploration data sold on docking; maths challenges from the question bank (hyperspace fuel bonus, locked pirate canisters).
- **v2.21:** cockpit HOLD and MISSION screens; 3D lighting and 3D cockpit on by default (existing careers switch once, `optVer`); cut scenes pick one of three camera styles, with a fully lit hangar, drone, crates, beacons and another ship arriving or leaving; TIPS key (F1); scanner marks stars, moons, the planet and black holes; arrival/mission report after docking; trade hints and weekly local news events (war, drought, festival, plague, mining boom, tech fair, strike, harvest) that change prices and stock; persistent hull damage (slower engines and shields) with repair costs in the shipyard and a damage report; credits on every station screen; hazards from each system's seed: dense asteroid fields, pirate minefields, black holes with gravity; escape-pod rescues; 11 medals.
- **v2.20:** pause menu with RESTART (back to last save / new commander, warns about unsaved progress); optional **3D cockpit** (canopy frame, side windows and rear-view mirror, each drawn from its own camera); in 3D lighting mode, textured rotating planets (oceans, continents, ice caps, clouds, gas bands, storms, craters) with atmosphere glows and panel-lined ships; **four station designs** from each system's seed (octagon, ring, spire, twin-hub — same docking front) with windows and blinking docking lights; **unique ship fittings** (cannons, pods, fins, antennas); damage shown as scorching, broken edges, sparks and smoke; your own hull damage shows as canopy cracks and smoke at the edges (repaired when you dock).
- **3D lighting (v2.19, off by default):** solid, sun-lit ships, stations, planets, moons and suns (pause menu → GAME). New 🪐 icon.
- **Saving:** the commander lives in `stats.arcade.saves.starlane`. SAVE in the pause menu works docked or in flight (resumes at the same spot); stopping or running out of time also saves in flight; being destroyed rolls back to the last save.

## New-version announcements
- `version.json` (generated from the version history in `js/data/help.js` by `node tools/make-version.js`) holds the latest version and child-friendly highlights, tagged `games`, `shop` or `look`. When online, the app checks it on opening, every 10 minutes and when it comes back online; if newer, it shows what’s new and how to save and update. **Upload `version.json` with every release.**
- The service worker always asks the website for fresh files and never caches `version.json`, so “Update now” picks up the new version straight away.

## Hover help
- `js/tips.js` holds plain-English explanations for every Admin, Parent dashboard and Voices setting and the main buttons. Hover (or keyboard focus) shows them on a computer; on touch screens a small ⓘ appears beside each setting.

## Question quality checks
- `qa/` scripts (kept outside the site) generate hundreds of every question type and check: no broken text, three hints, steps that reach the answer, hint 1 doesn't give the answer away, and **no result stated without its working** (e.g. “One part = 6” must show “24 ÷ 4 = 6”). The same rule is applied to every Learn mission example and check explanation.

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
