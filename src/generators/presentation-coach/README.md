# THE WEEKLY PRESENTATION — `src/generators/presentation-coach/`

**One function of the NET intake, as its own generator.** 15–20 minutes recorded, a few times a week, with ONE correction per run.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “record it for video 15-20 minutes… we'll do that like a few times a week… it'll build up like a snowball”

## What it does

- the dose and the arithmetic (about an hour a week, spread out) stated plainly
- the five-beat shape with a plan per beat, kept on the record
- the run log: minutes, where it is, the six reading rows 1–5, and THE one correction — the tutor's own rule
- the topic seeds, for a student who cannot think of one; prints the reading sheet

## What it reads and writes

- **Reads** — the recording itself, sent after each run.
- **Writes** — `present_topic`, `present.beats`, `present.runs (scores + correction)`, `inbox entries under `present``.
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
await buildRoles({ readTextFile, writeTextFile }, ["presentation-coach"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
