# THE 44 — `src/generators/phonics-44/`

**One function of the NET intake, as its own generator.** The 44 sounds as a SPEAKING test, marked by hand, drilled ten minutes a day.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “we get to use that conversation we've just had to test your 44 phonics. I won't make you read…”

## What it does

- all 44 sounds with their spellings and words to say, each markable ok / drill, with a note of what was actually heard
- the ten collisions this market makes, on the same sheet
- the run order: sit → record → transcribe → mark → drill → re-sit the same set in a week
- the drill list builds itself from the marks; prints the full mark sheet or just the drill list

## What it reads and writes

- **Reads** — a recording of the sitting — the station's /transcribe or any transcript.
- **Writes** — `phonics.marks`, `phonics.runs`.
- The record itself is the family's shape (`intake/1`: fields with evidence, a verbatim inbox, owed states). A record exported by the **station's `/intake export`** opens here, and a record exported here opens in the station — and in any other role. Nothing about a student is in this source; it lives in the browser.

## The two files, and the build

| file | what it is |
|---|---|
| `main.pjs` | the `$meta` and the imports (`kv-plugin`) |
| `index.html` | **GENERATED** — the role kit, the method tables and this role's panel, inlined so the page has no runtime dependency and opens offline |
| `src/panel.js` | **the source you edit** — this role's own logic |

Rebuild after editing `src/panel.js`, `role-kit/kit.js` or `role-kit/method.js`:

```js
const { buildRoles } = await import("./src/generators/role-kit/build.js");
await buildRoles({ readTextFile, writeTextFile }, ["phonics-44"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
