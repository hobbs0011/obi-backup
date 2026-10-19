# THE CREDIT — `src/generators/work-credit/`

**One function of the NET intake, as its own generator.** One piece of real, shipped work — scoped small enough to finish — and the line it earns.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “you could say you helped consult and design for [it]… if you help me” · “we're just sitting there using like my $20 just to learn together”

## What it does

- scopes one piece: what it is, what ‘done’ means, the work, what they will learn, how it is shown
- THE GATE IS A SWITCH: no credit line is emitted at all until the sovereign has said what may be credited
- writes the line in the tutor's own form — ‘helping consult and design for…’ — and can add it to the CV's experience row
- drafts the five-minute answer they must be able to give in an interview without notes, leaving the mistakes and lessons for the student to fill

## What it reads and writes

- **Reads** — the sovereign's word for what may be credited.
- **Writes** — `creditWork.scope`, `creditWork.allowed`, `experience (the credit line)`.
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
await buildRoles({ readTextFile, writeTextFile }, ["work-credit"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
