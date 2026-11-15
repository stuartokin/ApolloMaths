# ApolloMaths test rig

Automated browser tests for Apollo's Maths Missions, run in headless Chromium through Playwright. They use the
app the way a family does — the real "add player" form, the answer box and SHOOT, the 💾 button, the parent
dashboard — on a fresh device each time.

## Set up (once)

```bash
pip install -r tests/requirements.txt
python -m playwright install chromium
```

In a Claude cloud sandbox Chromium is already installed: skip the second line and instead pin the Python package to
the pre-installed version, e.g. `pip install playwright==1.63.0` (check `node -e "console.log(require('playwright/package.json').version)"`).

Keep the Starlane repo next to this one if you want the arcade's Starlane check (`somewhere/ApolloMaths`,
`somewhere/Starlane`), or set `APOLLO_ROOT` / `STARLANE_ROOT`. The rig serves both at
`http://localhost:8765/ApolloMaths/` and `/Starlane/` (change with `RIG_PORT`), exactly as GitHub Pages does.

## Run

```bash
python tests/run_all.py                 # everything (about 3 minutes)
python tests/run_all.py static,child    # just some suites
python tests/test_arcade.py             # one suite
```

`run_all.py` prints a summary and writes `tests/out/report.md`. No secrets are needed or stored: family codes
are set per device, and the arcade is opened as Admin (`Arcade.open({admin:true})`).

## Suites

| Suite | What it checks |
|---|---|
| `static` | Every script in `index.html` exists, parses and is in the offline cache list; `APP_VERSION`, `version.json` and the README changelog agree; all ~268 question types make valid questions with worked steps at all three difficulties; trivial questions are rare; exam profiles use real topics and list sources; no API keys |
| `child` | A new child added through the form (exam, theme, character) gets exam-based focus topics and a themed Shop; "Let's go!"; right and wrong answers through the answer box; the five areas; focus mode; the ⚙️ menu order; saving with 💾; themes; and the layout at 375, 820, 1366, 1900 and 3000 px (no sideways scroll, rail vs bottom bar, the grown-ups window fits) |
| `grownups` | Every dashboard tab keeps one size and shows no `undefined`/`NaN`; the find box; the Plan tab, key dates and the 🤖 AI-maintained note; the header badge; deleting needs the exact name, goes to the recycle bin and can be restored |
| `exams` | Every exam gets only its own question types (mixed practice, single topics, Fix-it, Starlane); changing the exam in Grown-ups → Plan refreshes the child's page (question, badge, mock length, focus topics, today's plan, Next best thing) at 375, 820, 1366 and 3000 px; a running mock restarts at the new length; focus follows the exam (on opening too) until a grown-up saves their own, which is kept, and “Follow the exam again” undoes that; a passed test moves on to the next; the Plan tab fits each screen |
| `arcade` | 11 games plus Starlane; every game offers My player / Classic, draws the child in My player and not in Classic, and remembers its look; Starlane opens from its own site |

The Starlane bridge in depth (names, exam questions, answer reports, saves) is tested by the **Starlane** repo's
rig (`tests/test_bridge.py`), which serves this repo alongside it.

## Helpers (`rig.py`)

`open_app(pg)` fresh device · `add_player(pg, name, exam, theme, body, school)` · `answer(pg, right=True)` types
`fmtAns(current)` (or a wrong answer) and presses SHOOT, pressing Next first if needed · `close_dialogs(pg)`
answers the first-time Welcome with "Maybe later" · `until(pg, js)` waits for state · `STUB_SAVE` fakes the
browser's file picker so saving can be tested.

## Adding a test

Write `tests/test_<name>.py` with `async def main(p)` returning a `Result`, add it to `SUITES` in `run_all.py`
and to the table above.
