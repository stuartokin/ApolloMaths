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
4. **`docs/WRITEUP-2026-11.md`** — plain-English write-up of the key stages, SATs and GCSE work (2.83–2.90): decisions, what was built, what is untested.
5. **`tests/README.md`** — the test rig. Run `python tests/run_all.py` before and after every change.

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
- Push straight to `main` yourself (see the working standard below), after the release steps above. No zips.
- Brief summary of what changed, then a short numbered list of things to try. Direct and concise; say what was
  and wasn't tested.

## Kill switch

`automation.json` at the top of this repo switches its automatic workflows off
(`"paused": true`) or on (`false`). The master switch for every repo is
`automation.json` in `stuartokin/stuartokin.github.io`. Each automated workflow
starts with a `switch` job that reads both; keep it when editing workflows, and
add it to any new scheduled or agent workflow. Manual "Run workflow" runs and
pushes always go ahead.

<!-- STANDARD:BEGIN v1 — the same block is in every one of Stuart's repos. Master copy:
     stuartokin/stuartokin.github.io docs/STANDARDS.md. Change it there, then everywhere. -->
## Working standard (all of Stuart's repos)

**Stuart** owns this. British English; short, plain replies. He does not read or edit code:
you make every change, test it, push it, and tell him what to check. Plan first for big
things; when he says "go ahead", build without further proofs.

**Personal capacity.** Never name his employer or job title anywhere: pages, docs, commit
messages, articles. Byline: *Stuart Okin*. Where a disclaimer is needed: *"Written in a
personal capacity and do not represent the position of any organisation I am engaged with."*
Citing an organisation as a source is fine.

**Delivering changes.** Commit and push straight to `main` yourself. Don't send zips or ask
him to upload; older instructions in this repo that say so are superseded. Before anything
major (deleting or restructuring, rewriting a core file, changing workflows or agents,
migrating data) push a backup tag first:
`git tag backup/YYYY-MM-DD-<what> origin/main && git push origin backup/YYYY-MM-DD-<what>`.
To undo, reset `main` to that tag; say in your reply that a backup exists. Never commit
secrets: keys live only in GitHub secrets.

**Tests.** Run the repo's tests before every push; all must pass. Fix a bug, add a check so
it stays fixed. If the repo has no tests yet, add at least a smoke test the next time you
change it.

**Automation.** Any workflow that runs on its own (schedule, issues, comments, other
workflows) must start with the kill-switch `switch` job, reading `automation.json` here and
the master in stuartokin.github.io (see its docs/KNOWLEDGE-BASE.md §15). Don't add an AI
agent without saying what it costs, what it can change and how to switch it off.

**"Wrap up".** When Stuart says "wrap up", and before you finish any session that changed
something:
1. Run the tests; fix or report any failure.
2. Update the docs: how the app works (knowledge base or handover), `LESSONS` (what went
   wrong or surprised you), `ROADMAP` (done, next, open questions for Stuart, decisions with
   dates) and `CHANGELOG` (bump the version if the app changed). Create them if missing.
3. If a lesson would help the other repos, add it to `docs/SHARED-LESSONS.md` in
   stuartokin.github.io.
4. Commit and push to `main` (backup tag first if major). Check the deploy or workflow run.
5. Reply with what changed, the version, what was and wasn't tested, a short numbered list of
   things for Stuart to try, and anything waiting on him.

A new session must be able to carry on from the repo alone. If it couldn't, the wrap-up
isn't done.
<!-- STANDARD:END -->
