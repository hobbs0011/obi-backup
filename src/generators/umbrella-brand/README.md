# THE UMBRELLA — `src/generators/umbrella-brand/`

**One function of the NET intake, as its own generator.** One holding name, the work beneath it, and one page that carries them.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “you can brand yourself under the umbrella and have like sub-…” · “if you just stick with one, then you can only apply to one sort of thing”

## What it does

- the holding name and the holding line, set on the record
- the pieces are read from the portfolio inbox and NOWHERE ELSE — the gate enforced in code: you cannot brand what has not been sent
- each piece gets a name, one line, and its link; a piece can be taken off the page without being deleted
- composes one self-contained .html page that carries them, for the links on the CV and the LinkedIn

## What it reads and writes

- **Reads** — the portfolio intake — the gate.
- **Writes** — `umbrella`, `umbrella_line`, `umbrellaData.pieces`.
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
await buildRoles({ readTextFile, writeTextFile }, ["umbrella-brand"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
