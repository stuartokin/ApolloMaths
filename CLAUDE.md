# CLAUDE.md — read this first

This repo is **Apollo's Maths Missions** (ApolloMaths): a maths-practice app for UK selective-school exams
(Tiffin Stage 1/2, 11+ grammar, the ISEB Common Pre-Test for Eton and Harrow, 13+ Common Entrance), with exam
plans, adaptive difficulty, lessons, themes, a character and Shop, a parent dashboard and a secret arcade.
Built by Stuart Okin (GitHub `stuartokin`) for his son Apollo; now general for any family.
Live: https://stuartokin.github.io/ApolloMaths/ — static GitHub Pages site, no build step.

Before changing anything, read in this order:

1. **`docs/KNOWLEDGE.md`** — what the app is, the code map, data model, exams, grown-ups, arcade, release routine.
2. **`docs/LESSONS.md`** — what went wrong before and how to avoid it.
3. **`docs/ROADMAP.md`** — open items and Stuart's stated plans.
4. **`tests/README.md`** — the test rig. Run `python tests/run_all.py` before and after every change.

## Starlane Trader (the space game in the arcade)

Starlane is **not** built into this app any more (since 2.79). The arcade opens the separate Starlane site
(`stuartokin/Starlane`) in a frame and hosts it through `window.StarlaneHost` (`js/arcade.js`,
`openRemoteStarlane()`); `engine.html` lends the question engine to the Starlane site.
**For anything about Starlane — the game, the bridge in depth, its rig, lessons and future plans — read
`CLAUDE.md` and `docs/` in the Starlane repo.** Its rig also tests this app's side of the bridge.

## Rules for working here

- **Every release**: bump `APP_VERSION` + add a `versionHistory` entry (`js/data/help.js`), add a `- **vX.Y:**`
  README changelog line, run `node tools/make-version.js`, bump `CACHE` in `sw.js`. New scripts go in
  `index.html` **and** the `sw.js` list. `tests/test_static.py` checks these.
- **Plain scripts share globals** — grep before naming a function (a duplicate `readiness()` once broke the
  dashboard). New saved fields must be added to the `clean*` validators or they vanish on load.
- **Wrap, don't rewrite**: later layers (`hub.js`, `themes.js`, `student.js`) wrap earlier code; keep it that
  way so existing children's progress and features survive.
- **No secrets in the repo** (it's public). Family codes are set per device; the API key for the exam watch is
  the `ANTHROPIC_API_KEY` GitHub secret only.
- **Nothing leaves the device**; the app never writes to GitHub. Children use it: accuracy, explained answers,
  kindness, original questions with sources linked.
- `tools/exam-watch/` + `.github/workflows/exam-watch.yml`: the AI-maintained exam watch (auto-merges checked
  updates labelled 🤖 AI-maintained). Don't hand-edit `js/data/exam-dates.js` or `questions-agent.js`
  without knowing the agent also writes them.

## How Stuart likes work delivered

- Plan first for anything major; a short list of thoughts before code.
- Only changed files, zipped with the repo's folder structure (built by diffing against a fresh clone of the
  live repo). A single changed `index.html` can go alone. He adds `.github/` files by hand and deletes removed
  files himself — always list them.
- Brief summary of what changed, then a short numbered list of things to try. Direct and concise; say what was
  and wasn't tested.
