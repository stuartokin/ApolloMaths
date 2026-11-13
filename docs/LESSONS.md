# Lessons learned

From building Apollo's Maths Missions (Nov 2026). Starlane-specific lessons are in the Starlane repo's
`docs/LESSONS.md`; many apply here too. Read before making changes.

## Working with Stuart

1. **Plan first for big changes**, then build when he says go; for small fixes just do them. He likes options
   with a recommendation, then one decision at a time.
2. **He tests on real devices** (Galaxy Fold, iPad, laptop, a ~3,000 px-wide monitor) and reports with
   screenshots and screen recordings. Look closely at every image; the detail he mentions is usually there.
3. **Deliver only changed files**, zipped with folder structure, built by diffing against a fresh clone of the
   live repo. List files he must delete. `.github/` files he adds by hand. A lone changed `index.html` can go alone.
4. **A follow-up package must include everything still unreleased** — if he hasn't uploaded the previous zip,
   the new one has to contain both, and say so.
5. **Be honest about what was tested and what wasn't**, and own mistakes plainly (e.g. hidden save buttons in
   2.75; versions 2.69–2.80 first dated a day late).
6. **Children and other families will use it.** He asked early for the child's name to be asked rather than
   defaulting to Apollo, for privacy (nothing written to GitHub), and for parental control per family.

## Product

7. **Grown-up items don't belong on the child's screen.** Save/export, family codes and the dashboard moved to
   the Grown-ups area; the child sees a 💾 status button and their own space.
8. **Make "not saved" impossible to miss** (red, pulsing; a ribbon on phones) — a quiet chip was ignored.
9. **Personalise everything the child sees**: name, theme, character, Shop, game names. A girl who loves animals
   should not start as a Liverpool footballer.
10. **Difficulty must stretch.** Random numbers made some questions trivially easy; adaptive levels (like the
    real ISEB test) and stretch questions fixed it. Check generated questions against the real exam's level.
11. **Write original questions in the style of official material and link the sources**; never copy papers.
12. **Protect against accidents**: typing the name to delete a player plus a recycle bin, after Stuart asked.

## Engineering

13. **Plain scripts share one global namespace.** Two `readiness()` functions in different files silently
    replaced each other ("undefined%" for weeks). Grep before naming a function; rename clashes.
14. **Wrap, don't rewrite.** The layout (`hub.js`), themes and student space wrap existing panels and functions
    (tags, CSS grid, function wrappers). This kept every feature and Apollo's progress intact. Hook the app's
    own entry points (`pickTopic`, `restartSession`) *immediately* at load — the first split second matters.
15. **Every field from a progress file is validated** (`cleanStats`, `cleanArcade` …). A new saved field must be
    added to the cleaner or it is dropped on load (this happened to per-game arcade looks).
16. **New scripts go in `index.html` and the `sw.js` cache list**, and `CACHE` is bumped, or devices run stale
    code. The static test checks the first two.
17. **Scale content, not the page**: zooming `html` on huge screens pushed dialogs off-screen.
18. **Popovers must account for zoom and the viewport** (divide positions by the zoom; flip above if no room).
19. **SVG images have no pixel size**: draw them onto a canvas before cropping into a game.
20. **A fixed-size dashboard** (flex column, only the body scrolls) stops windows jumping between tabs.

## Testing

21. **Test like a family**: a fresh device, the real "add player" form, the answer box and SHOOT, the Welcome
    screen ("Maybe later"), Next Question between answers. Several "bugs" in tests were the app correctly
    showing a lesson, a welcome or a locked box.
22. **Count, then look.** A counter proved code ran while screenshots showed nothing drawn — and the reverse:
    count real effects (return values), not calls.
23. **Check the claim before fixing.** "Let's go opened Apollo's topic" was a test misreading: the plan was right.
24. **Keep the rig in the repo.** The previous scratch test scripts were lost when the working sandbox was reset.
25. **Run the rig in a real web origin** (it serves both repos); file:// hides cross-site and loading issues.

## Automation

26. GitHub Actions need **write permission and "Allow GitHub Actions to create and approve pull requests"** to
    open PRs; auto-merge with `gh pr merge` after a load check; request a Pages build afterwards.
27. Scheduled workflows pause after 60 days without repo activity; merges count as activity.
28. Sandbox AI-generated code (`node:vm`, no `require`, time limit) and confirm answers with an independent solve.
29. Some sites (Eton) block automated fetches — list them "to check by hand" instead of reporting errors.
30. Keep the Anthropic API key only as a GitHub secret, in its own Console workspace with a spending limit.
