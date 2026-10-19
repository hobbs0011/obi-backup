# THE PORTFOLIO — `src/generators/portfolio-intake/`

**One function of the NET intake, as its own generator.** A bin with a label on it — everything sent is kept verbatim and filed against the promise it serves.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “you can be sending me over everything you have… just try to send everything” · “it just gains dust and just sits there”

## What it does

- paste or type what arrived; it is kept VERBATIM at the moment it arrives (L38) and never summarised
- files it against the promise it can serve — auto-guessed from the words, or chosen by hand, and the guess is shown
- the item it serves moves to MATERIAL IN because material arrived, never because anyone remembered
- a withdrawal is recorded in the record's withdrawn list, not deleted; exports the inbox as markdown

## What it reads and writes

- **Reads** — nothing — this is the door everything else needs.
- **Writes** — `inbox entries + owed states + withdrawn`.
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
await buildRoles({ readTextFile, writeTextFile }, ["portfolio-intake"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
