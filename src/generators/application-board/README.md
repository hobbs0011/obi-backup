# THE APPLICATIONS — `src/generators/application-board/`

**One function of the NET intake, as its own generator.** The board, the count, the minutes, and what each company actually asked.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “How many jobs do you apply for this week?” → “Twelve?” → “Nice. Good job. 12.” · “just around 30” minutes each

## What it does

- log an application the moment it goes out: company, role, minutes, and what it asked
- the arithmetic: logged, the rolling 7-day count against the target of 12, the average minutes, and the tape's own ~six hours
- the question library: the distinct questions across every application, each showing who asked it, so the second company that asks gets an answer already written
- exports the board as CSV

## What it reads and writes

- **Reads** — the roles they are actually applying for.
- **Writes** — `apps[]`, `withdrawn[]`.
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
await buildRoles({ readTextFile, writeTextFile }, ["application-board"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
