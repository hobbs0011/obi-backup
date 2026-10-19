# THE LISTS — `src/generators/idea-lists/`

**One function of the NET intake, as its own generator.** The one role that calls a model — options to choose from, kept verbatim.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “And also like we can generate some ideas. Yeah, a couple of lists of like a hundred like names.”

## What it does

- seven kinds of list: job titles, who to apply to, presentation subjects, headline options, umbrella names, drill sentences, interview questions
- streams nothing and claims nothing: the model answers, the list is shown BEFORE it is kept, and a human picks
- what is kept is filed in the record's inbox verbatim under the promise it serves — so it travels with the record
- built-in seed lists for every kind, so the role still works in a page where the model is not loaded — and it says which of the two you are seeing

## What it reads and writes

- **Reads** — the ai-text-plugin in main.pjs (the only role in the family that imports it).
- **Writes** — `ideaLists[]`, `inbox entries filed under the matching promise`.
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
await buildRoles({ readTextFile, writeTextFile }, ["idea-lists"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
