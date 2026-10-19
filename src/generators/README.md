# src/generators/ — the role scaffolds

One organism, many generators. Each folder here is a **ready-to-paste generator** for one role in
the constellation. Nothing in this folder is loaded by the station — these are templates you copy
into a new Perchance generator (or a Cloudflare Worker) when you build that piece.

## THE ROLES — one generator per function of the intake (2026-09-22)

**Where they are filed:** PrAis is the umbrella, and its generators spread out from there. Ten of these
roles sit under the **Career** division in `src/divisions.js` (the client's place in the market); the other
two — **the 44** and **the Weekly Presentation** — sit under **NET**, because the classroom owns what they
measure. The source is one kit either way, and the registry is the only place the split lives.

The sovereign's order: *"I want to make a generator for each of the functions we are doing for the
brothers, so they can be reused."* The functions are the ones the lesson of the 23rd produced — the CV,
the LinkedIn, the headshot, the portfolio intake, the 44 phonemes, the weekly recorded presentation, the
applications, the interview drill, the umbrella, the presence, the credit, the idea lists — and each is now
its own role folder:

`cv-forge/` · `linkedin-forge/` · `headshot-brief/` · `portfolio-intake/` · `phonics-44/` ·
`presentation-coach/` · `application-board/` · `interview-drill/` · `umbrella-brand/` · `presence-plan/` ·
`work-credit/` · `idea-lists/`

**They are built from three shared sources, so the twelve roles stay one kit:**

| source | what it is |
|---|---|
| `role-kit/kit.js` | the roles' kit — theme · record store · the `intake/1` record shape · import/export · fail-closed field reader · the shared page furniture |
| `role-kit/method.js` | the tape's own tables — the promises · the 44 sounds · the collisions · the interview bank · the CV rows. **No student is in it.** Same data as `src/intake.js`; a change to one is a change to both |
| `<role>/src/panel.js` | the role itself — what it shows, what it writes, and its surface on `window.ObiRole` |

| file in a role | what it is |
|---|---|
| `main.pjs` | the `$meta` and the imports (`kv-plugin`; `ai-text-plugin` in `idea-lists` only) |
| `index.html` | **GENERATED** — kit + method + panel inlined, so the role has no runtime dependency and opens offline |
| `src/panel.js` | the source you edit |
| `README.md` | the role in full: the tape line, what it does, what it reads and writes, how to rebuild |

**BUILD (after editing `kit.js`, `method.js` or any panel):**

```js
const { buildRoles } = await import("./src/generators/role-kit/build.js");
await buildRoles({ readTextFile, writeTextFile });                    // every role
await buildRoles({ readTextFile, writeTextFile }, ["cv-forge"]);     // one
```

**VERIFY (both, after every change):**

- `role-kit/test-roles.js` — every role BOOTS: kit loaded, shell mounted, panel rendered against a seeded
  synthetic record, `window.ObiRole` present, nothing thrown.
- `role-kit/test-actions.js` — every role BEHAVES: it drives the real controls and reads the record back.
  Measured 2026-09-22 — **12/12 boot · 12/12 behave · 0 frames threw.**
- `role-kit/test.html` — the kit's own harness (the fail-closed reader, the import readers, the shell).

Run either by opening a page in this workspace with `<script src="src/generators/role-kit/test-roles.js">`,
or by pasting the file's contents into any page's console. A role opened bare like this has no perchance
kv-plugin inlined and no bridge to the station, so it reads `localStorage` — and that is exactly where both
harnesses put their synthetic student, deleting it (and restoring `ok:last`) when they finish. They never
touch the station's `root.kv.intake`, so they are safe to run inside the station.

**WHAT IS NOT PROVEN:** no role has been pasted into a perchance generator of its own yet. The source is
written, parse-checked (esbuild), driven, and screenshotted here — but `src/divisions.js` marks every one of
them `scaffold`, not `live`, and it stays that way until someone pastes one and opens it.

## The identity register: one record, twelve doors

A record is the roles' currency. It is the station's `intake/1` shape — fields that each carry the evidence
they came from, a verbatim inbox (L38), owed states, a log — and it is **never** in this source: it lives in
the browser (`root.kv.intake` — the station's own folder, so inside the station a role is holding the desk's records — with the kv-plugin, `localStorage` without), and it moves only when a human
exports it. A record exported by the station's `/intake export all` opens in any role; a record exported by
any role opens in the station and in every other role. `?student=<name>` is the roles' deep link.

The registry of every piece — what exists, what is scaffold, what is planned, what it needs — is
`src/constellation.js` (`/constellation` in the chat). The tool-level inventory is `src/ecosystem.js`
(`/tools`). This folder is the *body* of the planned generator roles.

## The recipe (every role follows it)

1. Create a new Perchance generator (name it per the role, e.g. `obi-practice`).
2. Paste `main.pjs` (the role's `$meta` + its imports).
3. Paste `index.html` (the shell).
4. In that generator's own `src/` folder, add:
   - `app.js` — the role's logic (fork the station's `src/app.js` when the role needs the same machinery)
   - `styles.css` — reuse the station's theme so the roles look like one family of tools
   - `cgn-node.js` — **the node kit** (`src/cgn-node.js` here). Set `CONFIG.role` to this role.
5. Open the new generator once. It writes its node file and announces itself to the mesh.
6. On the station: `/netadd <generatorName> <role>` — now the station knows the role exists and
   will route work to it.

## The contracts every role obeys

- **Soul capture (L37–L39).** Whatever a human types into a role is captured **verbatim** before
  anything else happens, into that node's own ledger. No role is exempt, and no role edits words.
- **CGN node.** `cgn-node.js` with `CONFIG.role` set; it pulls the hub (whole-organism soul + laws)
  and pushes only its own new captures. Raw stays local (L44 raw ≠ soul).
- **Deep links.** A role must be openable from the station with its work pre-filled:
  - image — `?p=<prompt>` (generate this now)
  - ear — `?rec=<media url>` (listen to this now)
  - portal — `?student=<name>` (this is whose portal it is)
  - practice — `?topic=<x>&student=<name>`
  - watchtower — `?term=<label>`
- **Fail closed.** No role answers with something it did not measure or record. Missing input is
  reported, never invented.
- **Host-agnostic.** Anything a role fetches goes through `superFetch`, anything it stores that must
  outlive the tab goes through the ledger/kv — so a role can be moved to the self-hosted Cloudflare
  build (`src/cloudflare/`) without rewriting it. See `src/constellation.js` → `svc.host`.

## The roles

| role | folder | state | what it is |
|---|---|---|---|
| `image` | `src/image-node/` | **written** (reference implementation — the eye) | makes the pictures; the station routes `/img` here |
| `portal` | `student-portal/` | spec + shell | one per student — the student's own world (generalizes Timmy's Portal) |
| `ear` | `ear/` | spec | a disposable listener left in the room to capture long recordings |
| `practice` | `practice/` | spec | turns this week's evidence into drills the student can actually do |
| `watchtower` | `watchtower/` | spec | the teacher's board: every student, term progress, coverage vs syllabus |
| `site` | `site-builder/` | **built** (README + main.pjs + index.html + its own `src/`) — never yet pasted into a generator | the hand that puts a page on the web: a brief becomes one real, self-contained site, in the frozen brand or a client's colours |
| `video` | `video-node/` | **built** (README + main.pjs + index.html + its own `src/` — app.js · pulse.js · reel.js · story.js · drop.js · cgn-node.js) — exercised end to end in a harness, never yet pasted into a generator | **the drop station**: four doors in (**video · pictures · links · the owner's own words**) → stills, a timecoded sheet, **the pulse** (where the life in the footage actually is), vertical clips cut from the measured peaks, and the look in words; a live read of every link with **the link audit**; then research, a blueprint for the first prototype, orders, and **the three hands (image · copy · video) run for real** and re-audited — finished by **the gate**: READY TO EXECUTE / NOT YET COMPLETE / BLOCKED. Reads files off the disk, so the ~20 MB chat-attachment cap does not exist in it |
| **the roles** (12) | `role-kit/` + `cv-forge/` · `linkedin-forge/` · `headshot-brief/` · `portfolio-intake/` · `phonics-44/` · `presentation-coach/` · `application-board/` · `interview-drill/` · `umbrella-brand/` · `presence-plan/` · `work-credit/` · `idea-lists/` | **built and verified** (both harnesses: 12/12 boot, 12/12 behave, 0 frames threw — 2026-09-22) — never yet pasted into a generator | **one generator per function of the intake**: the CV · the LinkedIn · the headshot · the portfolio intake · the 44 phonemes · the weekly recorded presentation · the applications · the interview drill · the umbrella · the presence · the credit · the idea lists. Built from three shared sources (`role-kit/kit.js` · `role-kit/method.js` · each role's `src/panel.js`), so the twelve share one theme, one record shape and one fail-closed reader — and a record written by any of them opens in the others **and** in the station's `/intake`. Registered in `src/divisions.js`: ten under **Career**, the 44 and the weekly presentation under **NET**. See *THE ROLES* at the top of this file |

The `video` role is the **Web Development** division's second generator (`src/divisions.js` → `webdev`). It is thefront door of a client build and the eye that feeds the `site` role — one vision pass over a contact sheet
returns the brief the builder takes (`?brief=`) — and it is also the other half of that build: the reel that sells
the thing, the words that sell it, and the audit that says whether any of it may go out. Its deep link is
outbound only (`?brief=` into the builder); everything it takes in comes from the disk or from a page it fetched
live, not from the URL. Like every role it captures soul before it reads anything, and it fails closed: a browser
that cannot encode says so, a vision model that never received the picture is refused rather than filed as a
vibe, an unread page is recorded as **unproven** rather than absent, and the gate will not say *ready* while
anything in its own output is broken. **There is no separate `copy` role** — the copy hand is the register,
`video-node/src/story.js` (see `video-node/README.md` → *the three hands*).

The `site` role is the **Web Development** division's first generator (`src/divisions.js` → `webdev`). It
stands on the website machinery already in the tree — `src/cloudflare/` (the asserting host build), the
PrAis storefront on Cloudflare Pages, Timmy's Portal on a Cloudflare Worker, and the build-in-parts
machinery proven in `src/freephoenix.js` — and it is a *node*, so it captures soul and joins the mesh like
every other role. See `site-builder/README.md` for what it reuses and the two paths it deliberately does
not take itself (publishing, and writing the authority).

## The two things blocking the mesh (both measured 2026-09-24)

**1 · The write is REFUSED — this is the real blocker, and it is not about names.** `/netjoin obi-network`
was run on the station for real; the platform answered
`editable.set("obi-cgn-obi-network", …) → {"error":"anti_bot_verification_needed"}`, and the hub file
returns HTTP 404 — nothing was created and no `editKey` was ever issued. **No hub can be created, and
no node file can be written, from a browser the platform has not cleared**, so the mesh is inert
regardless of what anything is named. The relay re-tries this write on every run and records the
refusal verbatim, and `/network` now prints a `WRITE LANE` row that measures it live — the day the gate
opens is on the record. Until it does (or the self-hosted lane in `src/cloudflare/` is deployed),
every role works **standalone** — it just does not know the whole organism yet.

**2 · The anchor name.** `src/cgn-node.js` defaults to `anchorName: "obi"`, and **no generator named
`obi` exists on Perchance** (verified: the platform API returns `unfound` for `obi`, `obi-image`,
`obi-station`, …). The station is
**`phoenix-rising-ai-solutions-agent99-mastermind`** (this list named an older name until 2026-09-24).
Fix this *after* the gate opens:

1. Point the kit at the station's real name in **one** place: `CONFIG.anchorName` in
   `src/cgn-node.js` **and** the default in this generator's `src/cgn.js` (the hub URL is built from it).
2. `/netjoin obi-network` on the station → creates the hub in *its* namespace.
3. Open each node once, then `/netadd <gen> <role>`.

**Do not read a `/netjoin` failure as a name problem.** It used to answer *"hub exists but editKey is
unknown — reveal it from the generator that created it via /netkey"* when the truth was that the
platform had **REFUSED** the write: a wrong reason dressed as a real one, which sent readers hunting
for a key that never existed. Since 2026-09-24 it reports the platform's own words verbatim.
`src/SESSIONS/handoff-from-mastermind.md` carries the full answer, written for the node.
