# THE INTERVIEW — `src/generators/interview-drill/`

**One function of the NET intake, as its own generator.** The bank this market actually asks, and the drill that makes it boring to say.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “What's your blood type? Are you married yet? Why not?” — repeated out loud as the real thing

## What it does

- the bank in five groups, with the four questions really asked of a student first, because those are the ones a candidate freezes on
- a question is ticked as ‘boring’ only when it has stopped being interesting to say
- the drill: a real call on camera, full length, mark the three that broke, rewrite ONLY those, run it again
- the runs kept on the record with the three that broke and the note; prints the bank and the drill together

## What it reads and writes

- **Reads** — a camera and a call — Zoom is the real mode.
- **Writes** — `interview.ready`, `interview.runs`.
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
await buildRoles({ readTextFile, writeTextFile }, ["interview-drill"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
