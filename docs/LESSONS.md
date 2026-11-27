# Lessons learned

From building Apollo's Maths Missions (Nov 2026). Starlane-specific lessons are in the Starlane repo's
`docs/LESSONS.md`; many apply here too. Read before making changes.

## Working with Stuart

1. **Plan first for big changes**, then build when he says go; for small fixes just do them. He likes options
   with a recommendation, then one decision at a time.
2. **He tests on real devices** (Galaxy Fold, iPad, laptop, a ~3,000 px-wide monitor) and reports with
   screenshots and screen recordings. Look closely at every image; the detail he mentions is usually there.
3. **Push straight to `main` yourself** (since November 2026; zips for him to upload are superseded). Run the rig
   first, back-up tag before anything major, then check the Pages deploy run.
4. **Say what is live and what isn't.** If a deploy is still running when you reply, say so.
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
    In a cloud sandbox, Python Playwright must match the pre-installed browser: `pip install playwright==<the
    version of the node one>` (1.63.0 in Nov 2026), never `playwright install`. Clone Starlane next to this repo
    (or set `STARLANE_ROOT`) so the arcade's Starlane check runs too.
26. **Changing a setting must redraw everything that depends on it.** The exam picker updated the header but left the
    old exam's question on screen and today's plan pointing at the old focus topics. Detect the change in one place
    (`syncExam`, which every route goes through) and refresh from there, rather than in each control.
27. **Wide tables break on phones and tablets.** The exam plan table was 1,136 px wide inside a 296 px phone window;
    edit forms become cards below ~1000 px. Screenshot every grown-up tab at 375 and 820 px, not just the child's page.
28. **Know what each "test" place is for.** Starlane test mode is a game sandbox, not a question tester; the parent's
    "Check Starlane questions" only samples 10. To try built-in questions use a separate "Test" child. Outside questions (e.g. written by Gemini) never load into ApolloMaths;
    on the standalone Starlane site a grown-up can load them as a 📚 Question bank. Fetch every repo fresh before
    planning: on 19 Nov a plan for Starlane banks was made from a stale clone — they already existed (v29–30).

## Automation

29. GitHub Actions need **write permission and "Allow GitHub Actions to create and approve pull requests"** to
    open PRs; auto-merge with `gh pr merge` after a load check; request a Pages build afterwards.
30. Scheduled workflows pause after 60 days without repo activity; merges count as activity.
31. Sandbox AI-generated code (`node:vm`, no `require`, time limit) and confirm answers with an independent solve.
32. Some sites (Eton) block automated fetches — list them "to check by hand" instead of reporting errors.
33. Keep the Anthropic API key only as a GitHub secret, in its own Console workspace with a spending limit.

## Key stages (2.83)

34. **A topic missing from an exam's `weights` counts 1, not 0.** Adding new topics would have leaked SATs arithmetic
    into every 11+ exam. Topics that belong to particular exams carry `topics[k].exams`, and `examWeight` gives them 0
    elsewhere; `examFocusFor` and the topic grid follow it. Test both directions (`stages` suite).
35. **Cleaners can silently cap data.** The mocks cleaner limited `total` to 40, so 50-question 11+ mocks reloaded as
    out of 40. When adding a size (a 36-question paper), check the cleaner's limits.
36. **Plan data lives on the family's device.** "Add SATs to Apollo's plan" can't be done from the repo — give the
    grown-up a one-tap button (“➕ Add KS2 SATs”) and tell Stuart to press it.
37. **In the cloud sandbox, pushing a git tag can be refused** (the remote hangs up). The backup was made as a branch
    `backup/YYYY-MM-DD-<what>` through the GitHub tools instead; reset `main` to it the same way to undo.
38. **Check the deploy after every push — a broken link stopped the site for 8 days.** On 19 Nov a link named
    `ApolloMaths` (left by a test run) was committed; GitHub Pages' build fails on a link that points nowhere, so nothing
    published from 19 to 27 Nov (including the exam watch's 23 Nov update). Removed in 2.83, ignored in `.gitignore`,
    and `test_static` now fails if any link is committed.
39. **Old copies of a rule hide in later layers.** Focus topics were chosen by the same "top five weights" code in three
    places (exams.js and twice in student.js); fixing one left a Year 3 child with a focus topic that had no questions
    for her year. Grep for the logic, not just the function name, and route every copy through one function.
40. **A late-opening Welcome window can block a click.** In tests, close dialogs again just before clicking (it opened
    after the player was added and covered the SATs paper buttons).
41. **New topics change old tests' expectations.** Adding KS1 revision to Year 3 and reasoning to SATs made two earlier
    checks fail (they listed exact topics or a fixed share of arithmetic). Write checks about the rule (“only
    curriculum topics for this year”), not a snapshot of today's mix.
42. **Young children need the answer buttons back after a wrong tap.** The multiple-choice code disables every option
    after one tap (right for mocks); KS1 practice re-enables the others so a child can try again.
43. **Code that runs while progress is being cleaned can't use app.js's variables.** `suitsExam` read `mode` (a `let`
    in app.js) and the whole app failed to load: the cleaner calls it before app.js has run. Read such variables inside
    `try`, or pass them in.
44. **Normalising input can create false clues.** Turning “x²” into “x^(2)” made a correct expanded answer look as if it
    still had brackets. Keep normalised forms minimal (x^2), and test the exact strings children type.
45. **The same button can live in two places.** “My room” is `[data-go]` in the laptop rail but `[data-area-go]` in the
    phone bar; redirecting only one left phones going to the children's room. Test both bars.
46. **A layer that rewrites text must not fight another layer.** student.js rewrites the rail points every second;
    rewriting the same element flickered. Hide the original and show your own element instead.
47. **Randomly generated algebra needs a tidy-up pass.** Coefficients of 1 and 0 (“1x”, “+ 0”, “x² + 0x”) appear in
    otherwise-correct questions. One wrapper (`gcseTidyAll`) fixes the wording everywhere, and the generator check now
    searches for these patterns; also stop generators producing a zero middle term where that changes the question.
48. **Floating-point rounding is not school rounding.** `78.335.toFixed(2)` gives 78.33; work in whole numbers
    (thousandths) and round half up yourself.
49. **A `while` with an empty body hangs the whole check.** `while(b===a){}` never ends; the generator check sat for two
    minutes. Change a variable inside every loop, and bound search loops (`for(let t=0;t<200&&!ok;t++)`).
50. **Exam ids grow.** A filter written as `/^gcse_/` silently skipped `igcse_…` mocks. Use the list of ids
    (`GCSE_IDS`) or a pattern that covers every family.
