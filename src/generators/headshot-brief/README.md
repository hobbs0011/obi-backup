# THE HEADSHOT — `src/generators/headshot-brief/`

**One function of the NET intake, as its own generator.** One clean photo — the wardrobe settled on tape, the room, twenty shots, one pick, the crops.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “we're back with suit… and then a little color tie… or… black suit…? So that covers the selfie portion.”

## What it does

- the wardrobe in the tutor's own words, the room and the camera, and the twenty-shot list as a tick-list
- the crops every surface actually needs (LinkedIn 400×400, passport-ish, Facebook 1080, WhatsApp, the original)
- records the chosen file, so the CV, the LinkedIn and the presence all wear the same face
- prints a shoot card the student takes to the wall

## What it reads and writes

- **Reads** — a phone, a wall and an ironed shirt.
- **Writes** — `photo`.
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
await buildRoles({ readTextFile, writeTextFile }, ["headshot-brief"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
