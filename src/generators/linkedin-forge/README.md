# THE LINKEDIN — `src/generators/linkedin-forge/`

**One function of the NET intake, as its own generator.** The profile composed from the SAME record as the CV, plus the connection build.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “getting his CV and LinkedIn set up” · “I already have LinkedIn with 600 connections… I only have like maybe 40”

## What it does

- the ten sections a recruiter reads, each read from the record and each copyable on its own
- a blank section is shown as a blank to fill — this role writes no sentence the record cannot support
- the build checklist (10 steps) kept ON the record, so the next lesson opens where this one stopped
- the connection build: the target (600), a count, a daily log, and the recruiters to follow

## What it reads and writes

- **Reads** — the CV's confirmed rows; the headshot.
- **Writes** — `reads the CV's rows; writes `li.steps`, `li.conns`, `li.targets` on the record`.
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
await buildRoles({ readTextFile, writeTextFile }, ["linkedin-forge"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
