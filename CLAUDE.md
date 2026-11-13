# CLAUDE.md — read this first

This repo is **Apollo's Maths Missions** (ApolloMaths): a maths-practice app for UK entrance exams (Tiffin
Stage 1/2, 11+ grammar, ISEB Common Pre-Test for Eton and Harrow, 13+ Common Entrance), with exam plans,
adaptive difficulty, themes, a parent dashboard and a secret arcade. Owner: Stuart Okin (`stuartokin`).
Live: https://stuartokin.github.io/ApolloMaths/ — static GitHub Pages site, no build step.

## Starlane Trader (the space game in the arcade)

Starlane is **not** built into this app any more (since 2.79). The arcade opens the separate Starlane site
(`stuartokin/Starlane`) in a frame and hosts it through `window.StarlaneHost` (see `js/arcade.js`,
`openRemoteStarlane()`), and `engine.html` lends the question engine to the Starlane site.
**For anything about Starlane — the game, the bridge, its test rig, lessons learned and future plans — read
`CLAUDE.md` and `docs/` in the Starlane repo.** Its test rig (`tests/`) also tests this app's side of the bridge.

## Notes for this repo

- `README.md` holds a technical changelog (a `vX.Y:` line per release); `js/data/help.js` holds
  `APP_VERSION` and the in-app version history; run `node tools/make-version.js` after bumping; bump `CACHE`
  in `sw.js` (`maths-missions-vN`) every release.
- Question generators live in `js/data/questions-*.js`; exam profiles, plans and the Starlane question
  socket in `js/data/exams.js`; difficulty in `js/data/difficulty.js`.
- `tools/exam-watch/` + `.github/workflows/exam-watch.yml`: the AI-maintained exam watch (auto-merges checked
  updates, labelled 🤖 AI-maintained).
- Deliver only changed files, zipped with folder structure; Stuart adds `.github/` files by hand and deletes
  removed files himself. Children use this app: accuracy and kindness first; nothing leaves the device.
