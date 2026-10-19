# THE PRESENCE — `src/generators/presence-plan/`

**One function of the NET intake, as its own generator.** Five fronts — what each one is FOR — and a rhythm instead of a burst.

> **From the tape** (the lesson of the 23rd, four recordings, one tutor, two brothers):
> “a lot of business is done in Vietnam on Facebook… believe it or not a lot is done on TikTok” · “WhatsApp is the biggest for global”

## What it does

- LinkedIn, Facebook, TikTok, WhatsApp and Zalo, each with what it is for, the tape line behind it, and its own tick-list
- the rhythm: ten connections a day, one real post twice a week, one application batch weekly — and never 200 in an evening
- the line not to cross printed on the page: do not invent an audience; the account is a shop window, not a personality
- shows what the fronts need from the record — the photo, the one line, the link, the number

## What it reads and writes

- **Reads** — the headshot, the headline and the umbrella page.
- **Writes** — `presence.done`.
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
await buildRoles({ readTextFile, writeTextFile }, ["presence-plan"]);   // or omit the list for every role
```

**To ship it as a perchance generator:** paste `main.pjs` and `index.html` into a new generator. Nothing else.

## Verification

- `role-kit/test-roles.js` — boots every role in a frame and checks it rendered.
- `role-kit/test-actions.js` — **drives this role's real controls** and asserts on the record it wrote. If a handler stops saving, that test fails.
- Deep link: `?student=<name>`.
