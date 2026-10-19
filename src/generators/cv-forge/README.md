# THE CV — `src/generators/cv-forge/`

**One function of the NET intake, as its own generator.** A print-ready A4 CV, filled from the record and blank where the record is blank.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “You don't have a CV yet?” → “No, I don't have.”  ·  rec 4 — the degree line

## What it does

- the 14 rows a one-page CV runs in, each editable in place and each carrying the evidence it came from
- a row nobody supplied prints as a RULED LINE and is named in the footer — never filled in
- a row the machine GUESSED (state `unresolved`) is held on the record for the tutor to correct and is EXCLUDED from the paper entirely
- print (A4), open in a tab, download the .html, or copy the CV as plain text for a job form

## What it reads and writes

- **Reads** — a confirmed degree name before anything prints — the gate the whole family carries.
- **Writes** — `headline`, `phone`, `email`, `city`, `links`, `summary`, `school`, `degree`, `dates`, `gpa`, `experience`, `skills`, `languages`, `photo`.
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
await buildRoles({ readTextFile, writeTextFile }, ["cv-forge"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
