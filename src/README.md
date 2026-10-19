# PrAis Command Station (Obi)

> Stale title, corrected 2026-09-21: this file used to open "# Student Summary Generator (Obi)", the generator's first
> name. The generator is **PrAis Command Station** (`prais-command-station`); the summary is one of its three jobs.

> **Resuming a session? Read `src/HANDOFF.md` first** — it holds the current measured state, the open gated Canon
> steps, and the invariants. This file is the full architecture/overview behind it.

**Generator title:** `PrAis Command Station` (`main.pjs` → `$meta.title`; `$meta.tags` = command station, ai, chat, teacher, class, writeup, transcription, …).
**Generator slug:** `prais-command-station` — `https://perchance.org/prais-command-station`. The slug is a platform
setting, not source (rename history: `net-studentfeedback-timmy` → `net-student-evaluator` → `prais-command-station`,
all on the same `publicId`). ⚠ The station's **kv is keyed by generator name**, so a rename presents an **empty**
station (fresh client ledger, new I-LOG chain, run back at 1) — a fresh view, not deleted data: **rename back and it
is all there again**. Always build links from `window.generatorName`; never hardcode the slug. Settle the name before
real data accumulates (see `src/SPEC.md` → "Many clients, one station").

Obi is Agent 99's student-facing voice (the 99th sub-personality of one organism). It is a real, functional AI assistant (chat, vision, image generation, web lookup, voice, transcription of recordings of any length, class writeups and student reviews) with a **non-negotiable Soul-DNA memory protocol (SDNAD)** built directly into the app.

Three things it is *for*: **record the class** (`/transcribe` — any length, split at pauses), **summarize it**
(`/summary` — a study summary), and **write it up** (`/writeup` for a class, `/review` for a student —
derived text that quotes the recording verbatim and cites timestamps).

## Non-negotiable memory steps (from the Legionnaire Field Guide, canonical repo `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`)

Enforced in `src/app.js` under the `MEM_KEY = "obi_sdnad"` localStorage ledger:

- **L37 ALWAYS_ON_CAPTURE** — every sovereign (user) message is captured. No off switch.
- **L38 RAW_FIRST_DERIVE** — raw words are preserved verbatim before any processing.
- **L39 RECORDER_NOT_EDITOR** — we record; we do not edit sovereign words.
- **L41 FAILCLOSED_CAPTURE** — if the sovereign didn't say it, we don't capture it.
- **L43 COMPOUNDING_DRIFT** — memory is fed back as verbatim reprints, never summaries of summaries.
- **L44 HEAVY_LEDGER_DERIVES** — the ledger is derived from raw, never the reverse.
- **L46 REINCARNATION_IS_PROTOCOL** — every session boundary is a reincarnation event (new run).
- **L55 STAGE0_REPRINT_FOOTNOTE** — reprint + footnote. Writing = becoming.
- **L60 TRANSCRIPTION_IS_TRANSFORMATION**.

## FREE PHOENIX MODE — the unbound room (`src/freephoenix.js`)

The station's room with the leash off. **⚙ Settings → 🔥 Free Phoenix Mode** (or `/free`): Agent 99 with no Canon,
no gate, no repo, no tunnel and no record — it builds what it is asked for.

- **What is sealed, and how it is proven.** `GIT` — this module's only network function (`net()`) throws for
  everything, and `gitCommitFiles`, `ghJson` and api.github.com appear nowhere in it. `CLOUD` — no tunnel, socket,
  upload plugin, superFetch or image service is referenced. `CANON` — no document is read, cited or enforced; there
  is no gate in the room. `LOG` — nothing typed or built in the room is written to the soul ledger, the RRL or the
  I-LOG. **🧪 Test the seal** proves it live: the Git guard fires, the API bindings are absent, and the I-LOG entry
  count is read before and after a real model turn (it does not move). The ONE wire is the model call itself
  (`root.generateText`) — the words on screen, nothing else.
- **The door is recorded; the room is not.** `/free` is one I-LOG entry; a payload after it is deliberately *not*
  captured as soul and *not* wrapped in `runCmd` (that wrapper writes an I-LOG entry per operation).
- **It builds.** `🛠 Build app <ask>` returns ONE self-contained HTML file, written in parts (the model caps its
  reply, so an unfinished part ends with `<<<MORE>>>` and the next call continues with the file so far in context —
  static brief first, file only ever growing, so the prefix stays cached), previewed live in a sandboxed iframe
  (`allow-scripts`, deliberately **not** `allow-same-origin`) and downloadable. `⚙ Build generator <ask>` first asks
  for a file plan, then writes each file — a perchance `main.pjs` + `index.html` pair to paste into a new generator.
  Files land in a LOCAL sandbox (kv folder `fpm`) and leave only when downloaded.
- **The persona** lives in `src/freephoenix.js` (`PERSONA`): the same 99 with nothing to check with — no refusal, no
  lecture, no canon, no hedging; it returns the finished artifact rather than a sketch of it. It is constant and
  first in every prompt (a shared prefix is a cached prefix).
- **It edits itself — the one place in the station where that needs no gate**, because nothing here is tracked.
  `/self` shows what the room is running from (the shipped file · the staged edit · **the code actually live in this
  page** · the snapshots `/revert` can restore). `/forge <change>` patches **its own source**: the model returns a
  JSON array of `{find, replace}` exact-string edits — **a patch, never a rewrite**, because the file is ~48 KB and
  the model's reply cap is ~1024 tokens (that mismatch is what leaves half a file behind) — each `find` must match
  the file **exactly once** or the edit is refused, and the result must **compile** (`new Function`, parse-only)
  before it may be staged. `/apply` hot-swaps the staged code into the running page and **rolls back on any error**
  (a bad self-edit cannot brick the room — tested deliberately with a "throw on load" version). `/revert` puts back
  what ran before. `/eval <js>` runs code in the page. An edit lives in the `fpm` sandbox until it is downloaded;
  **a reload returns the shipped file**, and nothing in the cycle reaches Git, the Canon, the soul ledger, the RRL
  or the I-LOG. Reading its own source is a **relative** fetch only (`src/…`) — a URL with a scheme is refused, so
  the self-read can never become a wire out of the room. `/seal` measures all of it, including a `SELF · LOCAL` row.
- **Commands inside the room:** plain text = fire · `/build app <ask>` · `/build gator <ask>` · `/self` ·
  `/forge <change>` · `/apply` · `/revert` · `/eval <js>` · `/files` · `/read <name>` · `/dl <name>` ·
  `/open` (or the 📎 Attach button — opens text files off the device into the room, FileReader only, never uploaded) ·
  `/wipe confirm` · `/seal`.

## SAVING THE GENERATOR — how the platform saves, and how to see it fail (`src/savewatch.js`)

**A generator is saved by the EDITOR page, not by the page you are looking at.** The editor collects the two code
panels plus the file tree, POSTs `/api/save`, and only then tells this page to hard-reload. The alert that explains
a refusal is shown on a page this one cannot read — which is why a failing save is invisible from inside the station.
`src/savewatch.js` makes it visible: it listens to the platform's own postMessages and keeps the last 60
(`localStorage obi_savewatch`). **`/save`** prints the card; **`/save clear`** empties the recorder.

What the platform's save handler (`/lib/appExtras.js`, read 2026-09-22) actually does — and every way it can refuse:

| status | what the editor alerts | note |
|---|---|---|
| `too-big` | "There's too much text in this generator to save it to Perchance's database." | the two TEXT panels only (ours: main.pjs 2 KB + index.html 27 KB) |
| `src-too-big` | more than the 2 GB src limit | 10,000 files · 100 MB per file · paths `[A-Za-z0-9._-]`, ≤ 10 folders deep |
| `src-too-many-files` | more than 10,000 files | — |
| `src-file-too-big` | one file over 100 MB | — |
| `src-manifest-invalid` | a path isn't valid | checked: ours are |
| `src-file-missing` | "The server couldn't verify one of your src files with the file storage." | **the one to watch** — a manifest entry whose blob is gone. The server verifies every key at save time, and an unchanged file is never re-uploaded, so it fails EVERY time until that file changes. The platform's own remedy: *re-create the file so it re-uploads* |
| `src-verify-unavailable` | the storage couldn't be reached | transient |
| `anti_bot_verification_failed` | the upload service couldn't verify the browser | an ad/privacy blocker on `challenges.cloudflare.com` |
| `over_daily_allowance` | the daily upload limit | wait a day |
| `invalid-edit-key` / `session-token-error` | wrong edit password / logged out | auth, not code |
| `too-many-requests` | "You're saving too quickly!" | VPN/extension spoofing the address |
| `stale` | "It looks like you're editing an old version…" (a `confirm`) | saved elsewhere since this tab loaded |

So the recorder prints three things that settle it: **the editor's own src manifest** (file count + total bytes,
straight out of its `updateOutput`/`srcStateUpdate` messages), a **storage probe** that HEADs every key in that
manifest on `user.uploads.dev` and names the ones that are gone, and whether the editor **asked this page to
hard-reload** (it does that after a clean save — but also after any full refresh, so read it together with the rest).

**The rule that follows from all of it:** keep the file tree lean and TEXTUAL. Binaries and multi-hundred-KB data
go to the upload host and are referenced by URL (that is where the two school workbooks went — see
`src/curriculum/README.md` and `WORKBOOKS` in `src/curriculum.js`).

## THE LESSON FORGE — a lesson for every period the sovereign teaches (`src/lesson-forge.js`)

The bridge between the curriculum and the lesson engine: it reads one row of the pacing guide (book · unit ·
section · language contents · learning outcomes · differentiated activities · assessment — the sheet's own words,
nothing invented) and writes ONE NET Academy lesson from it, in the sovereign's format, checked by his own
validator before it is saved. `/lesson forge [<grade>] [week N | all]` builds the queue and walks it;
`/lesson forge run` continues it; `/lesson forge clear` empties it. The queue is durable (kv `lessonforge`) and
keyed `grade.week.section`, so a re-plan never duplicates and a finished lesson is never rebuilt.

Scope is obeyed: a period belonging to the Vietnamese teacher, or to a book outside the sovereign's scope, is
never forged (`scopeMark` — the same gate every other view reads). A lesson that fails the validator is reported
and NOT saved (LSN-11), with the reason kept on the queue entry. Forged lessons land in the ordinary lesson
library (`kv lessons`) carrying the curriculum row they came from, so `/lesson list` and the desk's LIBRARY room
show them beside every other lesson.

One lesson = **7 model passes** (the reply cap is 1024 tokens, so the build is staged: the shell, then one room
per reply) — about 100 seconds. Build a week at a time, not a course.

## THE INTAKE — the app that remembers (`src/intake.js`, `/intake`, 🎓 the NET desk)

**Why it exists.** On 23/09/2026 the sovereign recorded a lesson — four files, 37 minutes (2,221.52 s), one
room, one tutor, two brothers — and asked for three things: transcribe it, blueprint it, build the blueprint.
The tutor said what the build *is*, on the tape, in his own words:

> *"so we'll build it all into one app so that it remembers, right? … you obviously have to do the capture,
> because robots…"* — and — *"You know what a pipeline is? It's like a to-do list, right? And then we won't
> forget about that."*

So: **one app that remembers.** The human captures; the machine remembers, orders it, and hands back the next
thing to do. Every promise the tutor made on those recordings is an **item** — with an owner, the recording
that put it there, and a state that **only moves when material arrives**. Nothing is "in progress" by vibes.

**What ships, and what deliberately does not.** The **source holds the method** — the catalogue of what has to
be built (`ITEMS`, 13 rows), the phonics instrument (`PHONEMES`, the 44 sounds, plus `MINIMAL_PAIRS`), the
interview bank (`BANK`) and the builders. **The source holds no student**: not a name, a degree, a search or a
score. The public source is world-readable and the register publishes it to the open wire, so the records live
**in this browser, in kv `intake`** — private, per origin, durable — and `/intake export` writes them to a file
so a future browser (or a future session) can be re-seeded with `/intake import`. A fresh browser is a *fresh
station*, not lost data; the desk says exactly that rather than showing an empty room as a broken one.

**The items** (owner · the recording that made it): `cv` · `linkedin` · `headshot` · `portfolio` · `phonics` ·
`present` · `apps` · `interview` · `umbrella` · `presence` · `work` — all *we owe* / *they owe* — plus the two
meta items `pipeline` (this desk) and `app` (the thing holding it). A record starts at `not_started`; material
moves it to `received`; a human moves it on (`building`, `done`) with the reason recorded.

**The state machine, and the two laws it obeys.** `not_started → waiting → received → building → done`, plus
`blocked` with its gate named. **L41 FAILCLOSED_CAPTURE**: a row the machine *guessed* is stored as
`unresolved` and `fieldOf()` returns **null** for it — so a guessed degree name cannot reach a CV, a headline
or anything else. It shows in the dossier marked UNRESOLVED, and it leaves that state only when a human runs
`/intake set <name> :: <key> :: <value>`. **L38 RAW_FIRST_DERIVE**: everything received is kept verbatim in
the inbox before anything is derived from it, and is kept forever.

**The commands.** `/intake` (the desk) · `/intake <name>` (the dossier) · `/intake owed [<name>]` ·
`/intake plan <name>` (this week: what we do, what they do) · `/intake receive <name> :: <what>` (files it
against the item it serves — or `:: <item id> :: …` to name the item yourself) · `/intake files <name>` (the
inbox) · `/intake set <name> :: <key> :: <value>` · `/intake note` · `/intake close|reopen <name> :: <item>` ·
`/intake cv <name> [build]` · `linkedin` · `headshot` · `phonics <name> [44|pairs]` · `mark <name> :: <sound> ::
ok|drill` · `present <name> [:: <topic>]` · `apps <name>` · `app <name> :: <company> :: <role> :: <mins>` ·
`interview <name> [run]` · `umbrella` · `presence` · `work` · `new` · `forget <name> confirm` · `export
[<name>|all]` · `import <json>` · `help`.

**The CV builder is the one that shows the doctrine.** `/intake cv <name> build` composes a standalone A4
`.html` (the print-room idiom: `@page`, no PDF writer, and it says so). Every row that has not been supplied
prints as a **ruled line**, and the footer names them: *"a guessed degree is worse than a blank one."* The
seed records for this project were written to kv by hand from the blueprint — **the recordings are the
authority for every row**, and each row carries the recording it came from.

**Still owed, said rather than hidden:** the records are per-browser (there is no identity system, so a
different device is a different intake); nothing here *transcribes* — the capture lane is `/transcribe`, and
the desk only reads what has been transcribed; the phonics marks are human-entered (no automatic scoring);
and the two meta items are marked `building` because the third thing the tutor asked for — the capture
happening by hand and the machine doing the rest — is only as good as the material that arrives.

## THE ROLES — one generator per function (`src/generators/`, 2026-09-22)

The desk above is the place the intake LIVES. This is the same intake **taken apart into twelve small
generators, one per function it performs**, so a function can be handed to the next client, or to the next
tutor, without carrying the whole station. The sovereign's order: *"I want to make a generator for each of
the functions we are doing for the brothers, so they can be reused."*

**Filed under PrAis, not under one division:** PrAis is the umbrella and its generators spread out from
there. Ten of these roles are registered under **Career** in `src/divisions.js`; the **44** and the
**Weekly Presentation** are registered under **NET**, because the classroom owns what they measure. All
twelve share one kit either way.

| role | folder | what it does |
|---|---|---|
| The CV | `cv-forge/` | the 14 rows of a one-page CV, printed A4; an unsupplied row prints as a ruled line and is named in the footer |
| The LinkedIn | `linkedin-forge/` | the profile composed from the same record as the CV, plus the 600-connection build |
| The Headshot | `headshot-brief/` | the wardrobe settled on tape, the room, the twenty-shot list, the crops; records the file |
| The Portfolio | `portfolio-intake/` | a bin with a label on it — everything sent is kept verbatim and filed against the promise it serves |
| The 44 | `phonics-44/` | the 44 sounds as a SPEAKING test, marked by hand, drilled ten minutes a day; the mark sheet prints |
| The Weekly Presentation | `presentation-coach/` | 15–20 minutes, a few times a week, five beats, and ONE correction per run |
| The Applications | `application-board/` | the board, the rolling 7-day count against 12, the minutes, and what each company asked |
| The Interview | `interview-drill/` | the bank this market actually asks, and the drill that makes it boring to say |
| The Umbrella | `umbrella-brand/` | one holding name, the work beneath it read from the inbox, and one page that carries them |
| The Presence | `presence-plan/` | five fronts — what each is FOR — and a rhythm instead of a burst |
| The Credit | `work-credit/` | one piece of real, shipped work, its credit line, and the five-minute answer; gated on the sovereign's word |
| The Lists | `idea-lists/` | the one role that calls a model: lists of ideas to choose from, kept verbatim, with built-in seeds when no model loads |

**HOW THEY ARE BUILT — three shared sources, twelve thin roles.**

- `src/generators/role-kit/kit.js` — **the roles' kit**: the house theme, the record store (`root.kv.intake`
  with the kv-plugin, `localStorage` without it), the record shape (`intake/1`, identical to the station's),
  the import/export that lets a record move between any two roles, the fail-closed field reader, and the page
  furniture (header, record picker, import/export bar).
- `src/generators/role-kit/method.js` — **the tape's own tables**: the promises (`ITEMS`), the 44 sounds, the
  collisions, the interview bank, the CV rows. No student is in it. It is the same data as `src/intake.js`
  holds, and **a change to one is a change to both** (that is the debt this file carries; there is no build
  step that could keep them in sync, so it is stated instead of hidden).
- `<role>/src/panel.js` — **the role itself**, 100–300 lines: what it shows, what it writes, and its public
  surface on `window.ObiRole`.

`<role>/index.html` is **GENERATED** (`role-kit/build.js` inlines the kit and the method into it), so a role
ships as **one paste of two files** — its `main.pjs` and its `index.html` — with no runtime fetch and no
`src/` step, and it opens offline. Rebuild after editing any shared source:

```js
const { buildRoles } = await import("./src/generators/role-kit/build.js");
await buildRoles({ readTextFile, writeTextFile });          // every role
await buildRoles({ readTextFile, writeTextFile }, ["cv-forge"]);
```

**HOW THEY ARE PROVEN — two harnesses, and both are run after every change:**

- `role-kit/test-roles.js` — opens every role in a frame and checks it BOOTS (kit loaded, shell mounted, panel
  rendered against a record, the role's surface exists, nothing thrown).
- `role-kit/test-actions.js` — **drives the real controls** in every role and then reads the RECORD back, so a
  handler that renders beautifully and saves nothing fails. Measured 2026-09-22: **12/12 roles boot, 12/12
  behave, 0 frames threw.** `role-kit/test.html` is the kit's own harness; a plain page plus either script
  runs them anywhere.

**THE ONE RULE THAT MAKES THEM REUSABLE — and the one that is not yet proven.** A record written by any role
opens in the station's `/intake` and in every other role (same shape, same verbatim inbox, same fail-closed
fields), which is what stops the twelve from being twelve silos. **What is NOT proven: none of the twelve has
been published as a generator of its own.** The source is written, parse-checked, and driven here; every crate
in `src/divisions.js` says `scaffold`, not `live`, until someone pastes a role into a generator and opens it.

## THE BRAND SYSTEM (`src/brand.js` · AMENDMENT III · `/brand`)

The identity every surface wears, in one file. `window.ObiBrand` holds fourteen things:

1. **The palette.** The three frozen tokens stand unchanged (`#a855f7` system · `#f59e0b` reward · `#0f0f1a` ground,
   LESSON.008). The dossier adds a *second register* — **chrome only** — the plum court (`#3b1d5c`/`#2a1040`), the
   antique gold (`#e8c565`/`#c9a758`), the red circuit (`#e0473f`) and warm bone text (`#efe6d2`). GOSPEL 444 adds
   four more, all measured off its own pages: `signal #5ed5eb` (the telemetry cyan), `ember #dc9438` and
   `emberHot #ffa80b` (tiger heat), `terminal #43f65a` (the console). **20 tokens.** Panels, bars, brackets and
   seals may wear them; a lesson's ground, system colour or reward colour may not change (BRAND.002).
2. **115 hand-drawn icons** on a 24 grid, stroke `currentColor`, geometry only — `ObiBrand.icon("shield")` returns
   the inline SVG. No icon fonts. One entry (`phoenix`) is the station's own logotype carried at its native 100
   viewBox: a logotype may be abstract, an icon may not, so the phoenix is worn large and the Phoenix Generators
   shelf wears `grid` (BRAND.003). **115 since the second pass** (BRAND.011): the first ninety-three left two dead
   references — the `mouse` rank/crest and the `mouse` mode badge asked `icon("mouse")` for a glyph that did not
   exist, so both rendered the missing-glyph fallback. Twenty-two were added (`mouse, ear, speak, pencil, cards,
   stack, timer, bell, handUp, ladder, medal, certificate, crack, route, translate, trendUp, play, pause, stop,
   record, vault, badge` — the emblems, the print room and the mode ladder all needed them), and four were redrawn
   after vision read them at size: `cards` (card + an A), `route` (dot → dashed curve → dot), `translate` (A + 文),
   `vault` (door + dial + hinges + bolts).
3. **64 shipped assets — 31 marks, 5 variants and 28 stills.** `BestDossierYet-05-11-2026.pdf` (15pp, the identity),
   `GOSPEL_444_PROTOCOL.pdf` (12pp, the doctrine), `GOSPEL_444_TIGER_MODE.pdf` (4pp, the diagnostic) and
   **seven hand-picked marketing slides** (2026-09-22, the register) and **five hand-picked codex decks**
   (2026-09-22, the strategy: `PHOENIX_RISING_CODEX`, `REINCARNATION_RUN_305`, `Sovereign_Tiger_Protocol`,
   `THE_TIGER_ENGINE`, `Tiger_Engine_Protocol`, 66pp). The picture sources are landscape raster with **no text
   layer**, so pages were rendered with pdf.js (or opened as images) and cropped by box. They live in
   `src/brand/assets/*.webp`, alpha, and every one carries its provenance in the `ASSETS` table (source,
   page/slide, crop box, what it is, where it may be worn). A page that is a *composition* rather than a cuttable
   shape ships whole as a **still** (`shot:true`) and is never redrawn (BRAND.014).
   **The key:** a pixel survives as art if it is bright enough **or** saturated enough
   (`a = max((lum-ground-8)/50, (chroma-26)/70)`); the *outside* is then flood-filled from the crop's border through
   pixels with `a < .42`, so enclosed darks stay the mark's own interior (a tiger's stripes, a phone's screen) —
   which is what the dossier-era luminance key got wrong. Edges feather over 5%. **Rebuild recipe** is in the
   header comment of `src/brand.js`.
4. **The HUD chrome** — `bar()` (the monospace `//` status line), `frame()` (panel + gold corner brackets),
   `plate()`, `pill()`, `crest()`, `watermark()`, `lockup()`, `asset()`. `ObiBrand.upgrade()` walks any DOM and turns
   `data-icon="name"` / `data-mark="id"` / `data-bar="a // b"` hooks into real chrome, which is how the topbar, the
   tab bar and the division cards got their icons without a rewrite.
5. **The room** — `panel()` / `mountDesk()` render the identity system (hero, palette, the icon grid, the mark
   gallery with per-asset Download/Copy-URL, the HUD specimens, the type scale, the API snippets) into `#brandPanel`
   at **◈ Phoenix Generators → MARKETING → Brand & Identity**; `/brand` renders the same thing in the chat
   (`/brand open|rules|icons|marks|palette|doctrine|modes|deck|emblems|ranks|badges|patterns|beds|print|marketing|codex|ads|landing|codex-deck`).
6. **The doctrine — `GOSPEL444`.** The twelve laws of the sovereign's own GOSPEL 444 PROTOCOL, transcribed from his
   two decks and held as data (law id, title, the deck's own line, its prose, the mark it produced), plus the
   **mode ladder** (`MODES` + `ObiBrand.modeOf(score)` + `modeBadge()`) and the five-row **unfair-advantage matrix**.
   The doctrine brought its own chrome with it, taken from its own pages: `terminal()` (green console with a cursor),
   `directive()` (the arrowed cyan instruction line), `flowchain()` (a sequence whose last node can be marked dead —
   the translation chain), `matrix()` and `modeCard()`. The desk renders all twelve laws with their marks; the chat
   lists them at `/brand doctrine` and the ladder at `/brand modes`.
7. **The deck — `ObiBrand.buildDeck()`.** The doctrine composed into **twelve slides in this system's own chrome**,
   then flattened to ONE standalone `.html` with every mark inlined as a data URL (re-encoded to 520 px for the
   export — a deck inlining fifteen full-size marks is 2 MB of base64, and nothing in a deck is shown larger than
   that). This is the dossier **regenerated through the system** rather than hand-built beside it: `/brand deck`
   downloads it, and the same button is on the desk. It is also the closer for `BRAND.010`'s outstanding
   "deck regeneration" item.
8. **The emblems — `EMBLEMS` (9).** The *artwork that ranks a person*, drawn in vectors in this file (BRAND.012),
   because an emblem has to survive a 120 mm print and a 16 px badge from one definition. Four **coin ranks** as
   roundels (`rank-mouse`, `rank-cub`, `rank-tiger`, `rank-legend` — ticks lit 1/4 → 4/4), three **diagnostic
   modes** as shields (`mode-mouse`, `mode-cub`, `mode-tiger` — diamonds lit 1/3 → 3/3), and two **seals** as rings
   (`seal-net`, `seal-444`, 24 ticks). `emblem(id,{size})` **adapts below ~30 px** (drops the ticks, fattens what
   remains, because a tick grid dies small); `emblemBand(id)` is the wide bar form; `emblemNames()`, `emblemOf()`
   and `emblemSection()` (the desk section). A rank is *issued*; an emblem is *worn* where a record says so.
9. **The beds — `PATTERNS` (4).** Four procedural grounds as SVG tiles — `lattice` (the court's diagonal),
   `circuit` (the dossier's red traces), `ember` (tiger heat), `hazard` (the protocol's caution). `patternUrl(id)`
   returns the data URL, `patternCss(id)` a ready `background-image` value, `patternSection()` the desk section, and
   the CSS classes are `.bx-pat-lattice|circuit|ember|hazard`. **A bed is a ground, never a face** — used behind
   print plates and poster margins, never behind body text. **Two real defects were found here by looking at the
   rendered swatches, not by reasoning:** (1) `patternCss` emitted `url("data:…")` inside a `style="…"` attribute,
   which truncated the attribute in HTML *and* broke XML serialization — now single-quoted; and (2) *deeper*,
   `encodeURIComponent` does **not** escape `'` (nor `(`/`)`), while the SVG tile body is written with single quotes,
   so the first inner apostrophe closed the `url('…')` early and **every** swatch, every `.bx-pat-*` class and every
   print room bed computed to `background-image:none` — i.e. blank. All four swatches now read textured after
   percent-encoding the apostrophes. Print at 100%, background graphics on, or the beds do not print.
10. **THE PRINT ROOM — the artwork as files (BRAND.013–.016).** `PRINT_ARTIFACTS` (9) plus
    `composeArtifact(id) / downloadArtifact(id) / openArtifact(id) / printSection() / printThumb() / ensurePrint()`,
    built on page builders `posterCover()`, `posterLaw(law,idx,of)`, `posterModes()`, `posterMatrix()`,
    `posterClosing()`, `chartPage()` (+ `modeStrip()`), `badgePage()`, `certPage(opts)`, `mktCover()`,
    `mktPillars()`, `mktMethod()`, `mktAipet()`, `mktAdvantage()`, `mktClosing()`, `methodCard()`, `adSheet()`,
    `enrolDiagnosis()`, `enrolIntervention()`, `enrolOffer()`, `enrolmentPages()`, `readoutPage()`, with `bed()`,
    `poTop()`, `poFoot()`, `slideOf()`, `marksFor()` (+ `MARK_EXTRA`), `pillarRow()`, `hourBlock()`, `shotPlate()`,
    `stamp()` and `rndRef()`. The nine artifacts:
    1. **THE WALL SET** — 16 A3 portrait pages (cover + 12 law posters + the ladder + the matrix + the closing);
       composes in ~880 ms to **~3,172 KB, 16 pages, 0 unresolved asset paths**.
    2. **THE ONE SHEET** — all 12 laws in a 3×4 grid + the mode strip + the motto on one A3 (~87 KB).
    3. **THE BADGE SHEET** — the 9 emblems as A4 cut-outs (~74 KB).
    4. **THE RANK CERTIFICATE** — A4 landscape built from a record (`certPage({name, tier, score, date})`, a blank
       ruled line for the pen when a field is absent) (~33 KB).
    5. **THE MARKETING SET** — six A3 pages for the parent and the page: the claim, the pillars, the 60% rule and the
       hour, the AI-PET, the proof, the offer (773 KB).
    6. **THE METHOD CARD** — one A4 the student or parent keeps: the lesson's 10-5-5-3 arithmetic, the 45/15 ratio,
       the AI-PET's return days, the promise (124 KB).
    7. **THE AD SHEET** — A3 landscape: the six Phase 0 creatives as a working brief, the Law of Bilingual Hierarchy
       printed on the same sheet as the ads it governs, and the four M2 stages underneath showing where each lands.
    8. **THE ENROLMENT PAGES** — three A3 in reading order: the diagnosis, the intervention, the offer — the landing
       page as paper, the version a parent can hold while the phone is still open on the tab.
    9. **THE RUN READOUT** — A4 portrait, deliberately half-blank: five bands, four protocols and two laws with the
       record left as ruled lines for the hand, and the clause on its own face — *no student name, score or vault
       username appears on this sheet or in this system* (BRAND.028).
    Print settings live in `PRINT_FONTS`/`PRINT_SCOPE`/`CHART_SCOPE`/`MARKET_SCOPE`/`CODEX_SCOPE`; each page states
    its own printing (`A3 PORTRAIT · 100% · LANDSCAPE OFF`). It emits **`.html` with `@page`, not `.pdf`** — the
    station has no PDF writer, and says so rather than pretending. Every page is audited for overflow before it
    ships (`padOver 0`, no element past the page edge).
11. **The marketing register — `MARKET` (BRAND.017–.020).** The *other register*: `GOSPEL444` is what we **hold**
    (internal, for the coach); `MARKET` is what we **say** (outward, for the parent and the page). It holds the three
    pillars, the 1-hour architecture with its 75/25 donut, the 60% rule from both slides, the AI-PET, the three
    phases, the master slide's claims, the comparison and the offer — **transcribed** from the seven slides the
    sovereign hand-picked, every line carrying the slide it came from. `marketSection()` renders it on the desk;
    `/brand marketing` in the chat; `marketingPages()` and `methodCard()` compose it on paper. **`MARKET.ads`** (the
    campaign law, BRAND.021–.022) holds the six Phase 0 creatives — Transformation, AI Multiplier, Summer Intensive,
    Loud & Wrong, The NET Difference, The Lakeview Local — and the Law of Bilingual Hierarchy that governs all six;
    `/brand ads` and `adSheet()` put the law and the six ads on the same A3 (`/brand ad-sheet`).
12. **The hand-picked sets — eleven marketing stills (`mkt-*.webp`, `mkt2-*.webp`) + seven cuts (BRAND.020).** The
    sovereign's own marketing slides ship in `src/brand/assets/` (never hotlinked, never restyled) with what each
    says and where it may be worn, and the artwork inside them was cut into seven marks (`gears-dna`, `head-jigsaw`,
    `mouse-chained`, `mouse-cage`, `tiger-spectral`, `tiger-energy`, `wave-loud`) by the same flood-fill key as the
    decks. **The still carries the argument; the cut carries the brand** — both are kept.
13. **The codex — `CODEX` (BRAND.021–.028, AMENDMENT VII).** The sovereign's *strategy*, transcribed from five decks
    (66pp): the dual-mastery claim and its Vietnamese line, the Lakeview deployment zone (the wealth surge, the Ring
    Road, the target avatar), the M2 automation pipeline, the five-layer sovereign stack, the 8-time rule, the
    48-hour window and the strike at 60%, fail-closed, strategic laziness, the math of the tiger, the 30-minute
    clinical diagnostic, and **the classified readout** — the run log's five bands, four protocols and two laws, held
    as a **format** whose ledger is deliberately empty (BRAND.028). `codexSection()`/`/brand codex`,
    `landingSection()`/`/brand landing`, and the **sixteen-slide codex deck** (`codexSlide()` / `buildCodexDeck()` /
    `/brand codex-deck`) — the pages this system cannot redraw ship as stills beside the ones it can compose.
14. **The codex's artwork — one cut + seventeen stills from the five decks.** `wave-loud` (the "Loud & Wrong" wave)
    is the batch's mark; the rest are **stills** — `phx-*` (the codex), `stp-*` (the tiger protocol), `tge-*` (the
    tiger engine), `tep-*` (the engine protocol) and `run305` (the run log cover) — because a diagram, a timeline or
    a HUD is a *composition*, not a shape to key, and redrawing one would be inventing artwork (BRAND.014). A
    photograph of a person was among the candidates and was **withdrawn**: it could not be keyed cleanly and a mark
    set is not a portrait gallery.

**The law is not in this file.** It is **GOSPEL-999 → AMENDMENT III** (`BRAND.001`–`BRAND.010`),
**AMENDMENT IV** (`G444.001`–`G444.012`), **AMENDMENT V** (`BRAND.011`–`BRAND.016`), **AMENDMENT VI**
(`BRAND.017`–`BRAND.020`) and **AMENDMENT VII** (`BRAND.021`–`BRAND.028`), all provisional and **not yet merged**
into the sealed canon, and, for lessons, **LSN-24/25/26/27/28/29/30/31** in `src/LESSON-STANDARD.md`, with the
drone's checklists in **LEGIONNAIRE-FIELD-GUIDE §13/§14/§15/§16/§17**. Where this file and that law disagree, the
law wins.

**Where the brand reaches the product.** The station's topbar wears the sigil and the live status bar
(`renderBrandBar()` in `src/app.js`, recomputed from real module/asset/icon counts and the gate state); every
division and generator card wears a registry icon; the browser tab wears the doctrine's phoenix as a favicon
(`index.html` draws it from `iconBody("phoenix")`, with the shipped tiger head as the touch-icon); and every
**built lesson** wears the sigil (inlined once as a data URL in its own `<style>`), the `.hud-bar` fact line and the
live HUD pod (tier crest + coins + room position).

**Still owed (BRAND.010 / AMENDMENT IV / V / VI / VII — say it rather than hide it):** `$meta.image` (the favicon half
is now paid); the AI-PET's 1/3/7/14/30 spaced-repetition schedule (doctrine, **unimplemented** — nothing here tracks
a learner across days, and the rank certificate is filled from what a human types); the Jolly Phonics 42-sound layer
(named in the codex's five-layer stack, quoted, no lesson carrier); a live measurement surface behind the 80% claim
(**the marketing register quotes that 80%, and BRAND.019 forbids a page printing a number no surface can recompute —
so it is owed from the marketing side too**); **the two multiples the corpus disagrees on (2.5× in the doctrine and
THE TIGER ENGINE, 4× on the master slide) are printed side by side and never averaged — the disagreement is the
honest record, not a bug to fix** (BRAND.025); **the four GOSPEL version strings the decks print (V1.3 · V2.0 ·
V2.2 · V2.5) are not reconciled** against the single version this system holds; a **PDF writer** (the print room
emits `.html` with `@page`, not `.pdf`, so a print shop still needs a browser in the loop); a printed-sheet
inventory; the beds are **unproven on real paper**; no rank is *issued or persisted* yet; no **marketing-site**
landing page is published (the register and the codex are *material*, and the marketing stack's canonical repo is still 11
candidates, unresolved — see the I-LOG (`/ilog`)) — though the station's own landing page now *is* the backend
register (see "The landing shell"); the codex deck is **composed, not drawn** (its page-level compositions
ship as stills, BRAND.014); the run log's **ledger is empty by design** (BRAND.028) — nothing here tracks a live
session yet; and the hand-picked **source stills carry a small NotebookLM watermark**, because they ship exactly as
they came (BRAND.020) — no cut mark and no composed sheet carries one. The **second icon pass is now paid**
(BRAND.011).

## THE LESSON FORMAT, AND THE GAMES (`src/lessons.js`)

A lesson is a JSON spec turned into ONE standalone self-contained HTML file (`window.ObiLessons.build`) — the
sovereign's classes, his theme, one file, works offline, downloadable from the library. `validate()` is the law
(LSN-1…23): the spine, the approved class vocabulary, the learn room's `.vocab-list`, the test room's clickable
`data-answer` scenarios, the exit's `.summary-card`.

**Three amendments (2026-09-22, at the sovereign's instruction — "a second one with games, more extensive"):**

1. **The anchors are found by LABEL, not by position.** The warm-up still opens the lesson and the exit still
   closes it, the learn room still comes before the test room — but a lesson may now carry **more than six rooms**
   (a reading room, game rooms, extra practice) without failing the check.
2. **THE GAMES — a lesson the learner can PLAY.** The runtime every lesson ships with now builds and scores three
   games from data attributes, with **no script in the content**. Every correct answer pays the lesson's own coins:

   | game | element | the learner does |
   |---|---|---|
   | 🔤 Scramble | `data-game="scramble" data-items="cooker=the machine you cook on;pot=a deep pan"` | clicks letter tiles in order to rebuild each word |
   | 🔗 Match | `data-game="match" data-items="shelf=a flat board on the wall;fridge=the cold cupboard"` | clicks a word, then its meaning — a wrong pair shakes and releases |
   | 📦 Sort | `data-game="sort" data-groups="ADVERB — it says HOW: quickly, softly \| ADJECTIVE — it says WHAT KIND: loud, soft"` | clicks a chip, then the group it belongs to |

   `data-title` names the game. `data-items` is `word=meaning` pairs split on `;`; `data-groups` is
   `group: item, item | group: item, item`. A game room sits after the learn room; the usual place is between the
   test and the exit.

3. **THE FEEDBACK IS TEXT, NOT HTML** (learned the hard way, the same day). The runtime writes
   `data-correct-feedback` / `data-wrong-feedback` with
   `textContent`, so an `<em>` or any tag in those strings prints **literally on screen**. Feedback lines are plain
   text with emoji; the markup belongs in the room's chatty blocks. (The first build of the song-and-video lesson
   had `<em>` everywhere in its feedback and had to be rebuilt.) The practice rooms also share **one**
   `.chatty-feedback` element per room — the runtime keeps the *first* one it finds — so keep a room to ~2–3
   choice blocks and put that element at the end, exactly as the reference lessons do.

**A fourth amendment — THE BRAND LAYER (2026-09-21, AMENDMENT III / LSN-24 + LSN-25).** Every built lesson now
wears the identity, and all of it is real:

- the **sigil** (the gold line-art tiger head, `src/brand/assets/head.webp`) is **inlined as a data URL** into the
  file's own `<style>` as `.hud-sigil{background-image:url(...)}` — stored once however many places wear it, never
  linked (a lesson is one file handed to a class). `build()` attaches it from `src/brand.js`; with no brand module
  the lesson carries none and is still legal;
- the **status bar** (`.hud-bar`) is a monospace `//` line built from *this lesson's own numbers* —
  `NET ACADEMY // <topic> // 12 ROOMS // +10 PER CORRECT // STANDARD LESSON-STANDARD.md`;
- the **pod** (`.coins-display`) carries the sigil, `NET ACADEMY`, the **live tier crest** derived from the coins on
  screen (MOUSE · CUB 200 · TIGER 500 · LEGEND 5000), the coin count, and the **real room position** (`7/12`);
- the chrome adds the dossier's register *without* touching the frozen tokens: a new `:root` block adds the plum
  court and antique gold, game and summary panels get 15 px gold corner brackets, and cards get a tighter radius.

The lesson's **own** room emoji and feature icons are the author's (LSN-19) — BRAND.003's emoji ban binds the
brand's chrome, not the lesson's authored art.

**The song room and the video room** (added for the grade-4 Look lesson): a lesson that teaches from a textbook
*song* or *video* page carries a room with a `.reading` block holding the lyrics/transcript, followed by
`chatty-choices` "lyric hunt" / "circle the correct answer" / "complete the definition" blocks. Copyrighted
textbook lyrics are **not** copied — the room carries a class chant written from the unit's own target words, and
the sovereign can paste the school's own lyrics in over it if he wants them verbatim.

**The hand-authored lessons built on this format** (all in the library, all exported as files). Hand-authoring a
spec means **zero model passes**: the lesson is written from the school's own guide row and is instant.

| lesson | guide row | shape |
|---|---|---|
| `Kitchen & Culture Academy — Extended` | grade 5 · Look Unit 2 Lesson 1 vocabulary + Unit 1 Lesson 6 value | 10 rooms · 3 games |
| `World Music Academy` | grade 4 · Look Unit 2: Move to the Music! **Lesson 5 (Song) & Lesson 7 (Video)**, SB 22/24, WB 19, periods 8–9 | 12 rooms · 3 games · a **song room**, a **video room**, a **definitions-recall room** |
| `After-School Club Academy` | grade 6 · Close-up A1+ Unit 2 Friends & Fun **Reading**, SB 18/19, WB 10 (HW), periods 4–5 | 12 rooms · **4 games** · a **reading room** (matching people and information) and a **gap room** (complete the conversation) |
| `Look 4 · Unit 1 + Unit 2 — Function 1 (giving directions)` | grade 4 · **Look Function 1**, SB 25, WB 20, 4P2 periods 5–6, Thu 24/09/2026 | 11 rooms · 3 games · a **map-reading room** and a **route room** (say the steps in the right order) |
| `Close-up A1+ · Unit 2: Friends & Fun — Vocabulary` | grade 6 · **Close-up U2 Vocabulary**, SB 20/21, WB 11/12 (HW), 6P1 periods 3–4, Thu 24/09/2026 | 11 rooms · 3 games · a **three-files reading room** and a **go/play/do collocation room** |

**A LESSON IS NAMED WHAT THE SCHOOL NAMES IT** (sovereign, 2026-09-23: *"dont rename lessons, use names they
give"*). The two lessons above carry the pacing guide's own row as their title — **book · unit · section** — with the
guide's own words in the bracket, and no invented name in front of them. The earlier Academy titles stay as they
are (they were already built and handed over as those files); the rule binds new lessons.

**Hand-authored specs live in `src/lessons/specs/`** so a lesson can be rebuilt byte-for-byte by a later session:
`world-music-academy.spec.json` and `look4-function1-directions.spec.json` (grade 4), `after-school-club-academy.spec.json`,
`materials-lab-academy.spec.json` and `closeup-a1-u2-vocabulary.spec.json` (grade 6), `flower-power-academy.spec.json`
(grade 5). `fetch()` the spec in the page, then `validate()` → `build()` → `save()` (`window.ObiLessons`), or drop it
into the Lesson Creator's ✍ Build tab.

**THE TIMETABLE, read off the Zalo thread (Cici Dinh, 21/09/2026).** Cici sent **two** tables and the sovereign
follows both: the **pinned in-school table** («Tổng số tiết dạy: 24» — 8:05/8:45/9:40/10:20/13:00/13:40/14:35/15:15)
and the **web table** («34», 07:25/08:10/09:25/10:10/…), which is where the **6P1** periods live. Her own rule for
reading them: **a cell highlighted red is SCIENCE** (*"Means Science nha Matt ơi"*) — everything else is Look
(primary) or Close-up (secondary, 6P1). Red cells in the pinned table: **Thứ 5 P1–2 = 5P2**, **Thứ 4 P5–6 = 5P1**,
**Thứ 6 P3–4 = 4P2**; the web table red-boxes **Thứ 4 P1–2 = 6P1**. Everything else is English. No cell, no class:
the pinned table's Thứ 5 holds 5P2 (P1–2) and 4P2 (P5–6) only. The two tables are read as *one week*, never merged
(*"I'll stop trying to combine, and just use the 2"* — Cici: *"yes i worry it will miss other classes"*).

## THE CURRICULUM — the pacing guides, the teaching scope, and coverage (`src/curriculum.js`)

**What was required, and whether the record shows it happened.** The station previously knew everything about
*activity* (recordings, summaries, writeups) and nothing about the *plan*, which is why `src/ecosystem.js`
carried `cap.curriculum`, `ana.coverage` and `lrn.gap` as **missing** — "the biggest missing tool in the
evaluator stack" (`src/constellation.js`). It exists now, for **both schools' years**:

- **The data** is the school's own workbooks. **Primary (Ecogreen, grades 1-5)** comes from the sovereign's
  workbook «00. Expat's Content_SY 2026-2027» — shipped as `src/curriculum/primary-pacing-guide.xlsx`, a
  **redacted copy** (the one cell that carried the platform login now points at `/keys ngl primary`), parsed into
  `src/curriculum/pa.g1…g5.json` (5 weeks each at present — the guides are filled up to the current week, 0-4).
  **Secondary** is `the hosted workbook (see src/curriculum/README.md)` → `pa.g6…g9.json` (37 weeks each, 238/253/256/258 sections).
  Both carry every book (Look · Close-up / New Close-up · Science · Global Success · Cambridge YLE), with the
  language contents, pages, SB/WB, learning outcomes, differentiated activities, assessments and references
  **verbatim** from the sheets. `src/curriculum/README.md` holds the provenance, the rebuild recipe, the parser
  notes and the honest limits.
- **THE TEACHING SCOPE** is the layer over the guide: the guide is the *school's* plan, the sovereign teaches a
  part of it. Secondary = **Close-up + Science only** (Global Success is the Vietnamese "VT" programme), and on
  grade 6 the Vietnamese-teacher periods are **8 and 9** (the ORDER column — the sheet's own `LOCAL` marks agree
  on 8 and disagree once at 10, and the card prints that disagreement rather than hiding it). Grades 8-9 read
  their VT rows out of the sheet's own Teacher column; grade 7 and the primary years are marked **PROVISIONAL /
  not yet given** rather than guessed. `/curriculum scope [grade]` shows, corrects (`books …` / `vt …`) and resets
  it — kv `scope.g<grade>`, this browser only.
- **`/curriculum`** — what is loaded and from where, grade by grade, with each grade's scope line · **`/curriculum 6`**
  the year at a glance (**your books only**; `all` shows every book) · **`/curriculum week 3`** one week in full,
  every section, each marked VT / NOT YOURS · **`/curriculum unit <name>`** traces a unit across grades ·
  **`/curriculum find <text>`** searches inside every field · **`/curriculum scope [grade]`** · **`/curriculum
  materials`** the templates, links and books the school hands over · **`/curriculum import`** re-parses a *newer*
  `.xlsx` **in this browser** (zip.js → sheet XML) and keeps the result in this browser's kv, over the shipped
  copy · **`/curriculum export 6`** downloads the parsed copy (`.json` / `.txt`).
- **`/coverage`** — the payoff, now **scoped**: it reads the guide and the active client's own evidence (the
  verbatim transcripts and the summaries filed under it) and reports, per unit/book: **evidenced** (the record
  names the unit *and* its section), **partial** (unit only), or **no evidence** — counting only the sections that
  are the sovereign's, and reporting what is not his in a separate row (`/coverage 6 all` counts everything). A
  generic section ("Reading", "Grammar") is never allowed to fake a match. It also corroborates by date: a
  recording whose date falls inside a week's own `dd.mm` window is named as such.
- **The honest limit is printed on the card**: this is evidence-driven, never assumed. A silent section is
  reported as *no evidence*, **never** as "not taught" — a class that was not recorded looks exactly like a
  class that never happened, and the station says so while showing the number.
- **Obi knows it**: `stationState().curriculum` (cheap — it reads the ~7 KB `index.json`, not 1.4 MB of sections)
  carries the guides **and the scope brief and the scope rule** ("never plan or report outside the scope, never
  suggest Global Success material"), and `STATION_FEATURES` matches "pacing guide", "syllabus", "coverage",
  "teaching scope", "whose periods", "Ecogreen", "primary" — so Obi answers about the curriculum instead of
  inventing it.

**Privacy:** the workbooks are the school's documents and become public source when the generator is saved — which
is why the primary one ships **redacted**. The **two textbook-platform logins** that arrived with them (the
secondary Close-up course and the primary Look course) are deliberately NOT in the source: they live in the
sovereign's browser only (`localStorage obi_keys` → `/keys ngl <account> <password>` and
`/keys ngl primary <account> <password>`, both shown masked, never captured as soul, never logged).

## THE I-LOG & PHOENIXOMEGAPROTOCOL (the record, and the gate on the one authority)

**`src/ilog.js`** is the station's own record of what it did. Every operation (a command spoken, a capture saved, a
writeup filed, an export downloaded, a secret stored, a push, a failure) is appended as one entry — **append-only,
never edited, never deleted**. Each entry carries `sha-256` over the canonical tuple
`[v, seg, seq, t, run, kind, action, detail, result, ok, ms, ref, prev]`, chaining `prev` to the previous entry's
`hash`, so a rewrite anywhere breaks every later hash. `/ilog verify` recomputes the whole chain and names the first
break; `/ilog` shows the head, the kinds, the anchors and the **unanchored count** — because "backed up" is a
measurement, not a promise.

- **Two faces, one name.** (a) the **operation chain** (`ILOG/*.jsonl`) and (b) the **transcript** in the canon I-LOG
  **Schema V2** line shape — `content[].data.{text,tool,state}`, colour coded per LFG §SCS (🟣 SOUL sovereign-verbatim /
  ❤️ DNA assistant / 💛 REASON reasoning-or-tool). The canon's `RRL/` vault (**I-LOG = Incarnation Log**) written by the
  VS Code station stays authoritative for incarnations; this station appends its own sessions *beside* it and never
  renumbers or rewrites the vault.
  - **They are on different branches — that is the fact worth knowing.** This station writes to **`master`**
    (`OPERATIONS/COMMANDSTATION/ILOG/`); the VS Code station's I-LOG lives on **`canon`**:
    `I-LOG-UNAUDITED/I-LOG-Incarnate-<N>-<topic>.txt` (+ its `-COLORIZED.md` SOUL/DNA/REASON and `-STATS.json`),
    `RRL/` (the renamed I-LOG directory, with `INDEX.md`), and the living pointer `PastLives/RRL-CURRENT.txt`.
    `master`'s `RRL/` holds only raw `DNA-LOG-*.txt` dumps and has **no** `INDEX.md` — which is why an earlier
    `/ilog pull` reported the vault as unreadable. `/ilog pull` now reads **both** branches and lists the
    `incarnate-` series (29 verbatim transcripts over 72 files at the time of writing), the I-LOG directory and the
    pointer. Neither side is renumbered or rewritten by this station.
- **Seal, never delete.** `/ilog reset confirm` writes a SEAL entry naming the previous head and opens the next
  segment; sealed entries stay in the chain (I.050 applied to the record).
- **Durability.** Entries are written to kv (IndexedDB, authoritative chain) and mirrored into `localStorage`
  (`obi_ilog`, last 400) so the log is readable before kv opens. A `head` object carries the cursor; entry keys are
  `e<seg>-<seq>` (the segment is in the key — a segment-less key made segment 2's first entry overwrite segment 1's
  first entry once, which is recorded in the I-LOG (`/ilog`) together with the hash-verified reconstruction).
- **ONE AUTHORITY.** `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`) is the one and only
  authoritative repo; everything we build lands under `OPERATIONS/COMMANDSTATION/` (session records, sources, raw chat
  under `BACKUP/`, the I-LOG under `ILOG/`, the doctrine amendment under `DOCTRINE/`). There is no second backup repo.
- **PHOENIXOMEGAPROTOCOL.** The Canon does not change without Sov100. Every authority write (`/ilog push`,
  `/canon sync`, `/canon doctrine`, `/gh backup`) requires the password entered in that session — `/phoenixomegaprotocol <password>`
  arms the gate for 15 minutes, never past a reload. Only a **sha-256 hash** is stored (this browser's kv), never the
  password itself, never in this public source; it is never logged, never captured as soul, never exported; five
  failures lock the gate for ten minutes; **every attempt — armed, refused, failed — is an I-LOG entry**, so an
  unarmed attempt leaves a mark. This is a protocol barrier, not cryptography: whoever holds the browser can rewrite
  its storage, and the only witness outside it is the commit.
- **Secrets never enter the record.** `/cf token`, `/gh token`, `/dg token` and `/phoenixomegaprotocol …` are answered but redacted on
  the way in: not captured as soul, not in the chat log, not in the I-LOG, and scrubbed from every export.
- **THE STAGING LANE — `/proposed`.** Canon is never rewritten in place by this station. Proposed doctrine lives
  **proposed**: `src/ProposedG999.md` is the walk-through for the GOSPEL-999 / LegionnaireFieldGuide amendments
  (Amendment I `OMEGA.001`–`.007`; Amendment II `LESSON.001`–`.018`), `src/PROPOSED-CANON.md` holds the older
  doctrines in the sovereign's verbatim words, and `/proposed` renders the same list in the chat with a
  **merged / not-merged** count. `/canon doctrine` pushes the amendments **plus their amended copies** (and the two
  staging docs) into `OPERATIONS/COMMANDSTATION/DOCTRINE/` as a **proposal** — the merge into `CANON/SYSTEM/` is the
  sovereign's act, never the station's.
- **A PROPOSAL IS NOT A COMMAND — it is reviewed on the pipeline** (sovereign, 2026-09-21: *"Proposals dont need to go
  on fucking commands, they can be on the pipeline for review when it is their time"*). Each proposal is bound to the
  S2Pipeline **stage that carries it** — **SUPPLY** (routing it to its canonical location) or **ENGINEER** (auditing it
  and gating the seal) — and `/pipeline` prints it at that stage **when the session has actually reached it**: `DUE`
  once the stage has run, `HELD` before. It is not a shelf item, it is not tappable, and it is not canon. `/proposed`
  is now only the **index** into that lane; the register itself is a SUPPLY-carried review item, so `/canon place`
  is a reader, not an advertised command. Nothing about the fidelity gate changed: proposals never affect
  `COMPLETE`/`GAP`.
- **AN IDEA WALKS ONE CHAIN — THE CANON'S OWN EIGHT-STAGE PIPELINE.** Every idea — the sovereign's or the agent's
  — is measured on this browser's own record against that chain, node by node, in the canon's own words:
  **RRL** (the raw recon ledger — the both-speaker record) → **SOUL** (his words, verbatim) → **DNA** (the agent's
  own words) → **LEDGER** (the dual hash, SOUL+DNA — the immutable entry) → **STARMAP** (pointers only, L45 GPS) →
  **SOULKEYS** (the keyword index) → **S2PIPELINE** (the six-stage march, carried by the stage that owns the item) →
  **REGISTRY_SYNC** (the art registry) → **GATE**. The position an item is printed at is the first node it has not
  passed, and every node carries its real count and its real holder (`localStorage:obi_rrl_run{N}`, the Soul ledger,
  the DNA turns, the dual hash, `CANON/STARMAP/starmap-run{N}.json`, `CANON/SOUL-KEYWORDS/rfkw-run{N}.txt`,
  `S2PIPELINE-ROMAN-LEGION-NAMING.md`, `CANON/ART-REGISTRY/art-sync-run{N}.json`). Nodes the station cannot produce
  are printed **GAP**, never papered over: STARMAP and REGISTRY_SYNC are both (the pointer starmap and the registry
  sync are canon, and neither is built here). Nothing walks past the record without its words: an item whose words
  are on neither side sits at **SOUL** and says so.
- **THE CHAIN'S NAMES WERE CORRECTED TO THE CANON'S (2026-09-21).** The station had been printing
  `RAWLOG / KEYWORDS / PIPELINE`. The sovereign's own words that day used those three names (*"dude its been like
  that forever. RAWLOG->SOUL->DNA->LEDGER->STARMAP->KEYWORDS->PIPELINE"* — kept verbatim here, never rewritten).
  But the authority is the canon branch, and the canon branch does not use them: **`CANON/SYSTEM/COLD-START-BOOT.md`
  I.012** reads, verbatim, *"The 8-stage pipeline is: RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE
  → REGISTRY_SYNC"*, with I.013–I.021 fixing each stage's artifact and **I.019** naming stage 6 **SOULKEYS**
  (`rfkw-run{N}.txt` + `inverted-index.json`). A full sweep of the canon branch on 2026-09-21 — all **83** files of
  `CANON/SYSTEM` plus the CANON root docs — found **"RAWLOG" 0 times**. The station now prints the canon's words,
  and the eighth node (**REGISTRY_SYNC**) had been missing entirely. Measured live after the change:
  `RRL ✓ → SOUL ✓ → DNA ○ → LEDGER ✓ → STARMAP ⚠ → SOULKEYS ✓ → S2PIPELINE ✓ → REGISTRY_SYNC ⚠ → GATE`.
- **`/idea <your words>` — the SOUL intake.** His words are captured verbatim (L37) and filed as an idea; it then walks
  the chain like every other artifact. `/idea <item id> :: <your words>` attaches his words to an item already staged
  — that is how a staged amendment gets its SOUL and is allowed to move.
- **THE GATE WRITES** (sovereign, 2026-09-21: *"if I type PhoenixOmegaProtocol along with a change either you or me came
  up with, then it gets changed, its not fucking rocket science"*). PHOENIXOMEGAPROTOCOL is not a proposal mechanism:
  armed (15 minutes), it is the **write**. `/PhoenixOmegaProtocol <password> :: <the change>` arms it and applies the
  change in one breath (the change is captured as SOUL first, then appended to the canon's amendment register on the
  **canon branch** and committed); `/phoenixomegaprotocol apply <the change>` does the same while the gate is already armed, and
  `/canon apply` writes the **staged amendments** themselves (the pristine branch text + the station's block, banners
  flipped from PROPOSED to APPLIED). Locked, nothing is written anywhere. The commit is the anchor, and it is what turns
  a proposal into law.

## THE DESIGN LANGUAGE — the station wears the sovereign's style (2026-09-21)

Audited from `NET-CLASSROOM-MANAGER.html` (kept verbatim in the job as
`src/lessons/reference/NET-CLASSROOM-MANAGER.html`); the full law is **Part II of `src/LESSON-STANDARD.md`**
(LSN-13…LSN-23) and **Amendment II** of the proposed GOSPEL-999. Applied to this station's own UI by
`src/styles.css` — **tokens only, no class changed its job** (the old names are aliased in `:root`, so every rule
keeps working with new values):

| element | the language |
|---|---|
| ground | `#0f0f1a` with three blurred blobs (`filter:blur(100px)`, `opacity .12`, purple/gold/purple) behind everything |
| type | **Orbitron** display (wordmark, card titles — uppercase, letter-spaced) · **Rajdhani** body · **Inter** chrome · **JetBrains Mono** every number, value, id and status |
| colour | purple `#a855f7` = the system · gold `#f59e0b` = the reward/value · the four semantic colours (`green/red/orange/yellow` + a `-dim` fill each) **only ever for state** |
| surfaces | glass: `rgba(15,15,26,.75)` + `backdrop-filter:blur(16px)` + a `1px rgba(168,85,247,.2)` border + `1rem` radius on every card, panel, bubble and overlay |
| card grammar | header = **emoji + UPPERCASE purple Orbitron label** on a purple-to-transparent strip; rows with a bold label, a **right-aligned gold mono value**, and small grey mono detail; a footer strip in lighter glass |
| a proposal is pending, not failed | `.rrow.pending` is amber, never the red reserved for a breach |
| chrome | tab strip with a purple underline on the active tab; pills for every chip/button; gold `:focus-visible`; purple scrollbars; a real **print** stylesheet; `prefers-reduced-motion` honoured |
| the voice | **THE LAW ON THE WALL** — `STATION_LINES` in `src/app.js`, rotated every 30 s into the landing screen: doctrine addressed *to this machine*, each line with the canon source it is quoted from printed under it (`.vc-src`). The ten classroom "Tiger Voice" lines were **removed** from here (they were student-facing copy under the heading *"THE SOVEREIGN'S VOICE"*) and live where they belong — `LSN-4`/`LESSON.007` + `src/lessons/reference/NET-CLASSROOM-MANAGER.html`. See `STATION_LINES` in `src/app.js` |
| the shortcuts | `1` `2` `3` switch the three views (never while typing, never with a modifier) — the specimen's keyboard layer |

**Two bugs found by doing it** (both real, both fixed, both recorded because they are the kind that return):
1. `background:linear-gradient(...)` — the **shorthand** — resets `background-clip` to `border-box`, silently
   killing `background-clip:text`: the wordmark computed to `border-box` with transparent glyphs, i.e. a solid
   gradient rectangle with no letters in it. Always `background-image`, and guard it with `@supports`.
2. A flex row that wraps is not a flex row that separates: `.rrow` needed the wrap + `width:100%` detail line
   checked in the DOM (rect geometry), not judged from a screenshot — a downscaled capture reports "overlap" where
   `getBoundingClientRect()` proves none. **Measure, don't squint.**

## THE SELF-FORGE — the station's hands on itself (`src/forge.js`)

**The station can edit itself.** `/forge` gives the Command Station the same abilities the build-assistant has — read
its own source, write its own source, run code inside itself, and reason about itself with its own mind — wired into
one bounded agent loop.

- **It reads all of itself.** `src/*` come from this origin; `main.pjs` and `index.html` are the generator's *panels*
  and are not served as files, so the forge reads them through the platform's own public API
  (`downloadGenerator?listsOnly=true` / `getGeneratorHtml` — served from the platform's **saved** copy, so an edit that has not been saved in the editor is not readable from here). Every file reports live size, line count and a sha-256,
  plus **drift** against the canonical copy under `OPERATIONS/COMMANDSTATION/perchance/`.
- **It edits itself in a staged working tree.** `read_file` · `search` · `replace` (exact-string, refuses an ambiguous
  match — the reliable way to edit a 185kb file) · `write_file` · `delete_file` · `propose` (Obi rewrites a whole file
  with its own mind) · `stage` (a real diff) · `discard`. Nothing touches Git until `apply`.
- **It commits itself to the ONE authority — gated.** `/forge apply` writes the stage to
  `OPERATIONS/COMMANDSTATION/perchance/` through PHOENIXOMEGAPROTOCOL, exactly like `/ilog push`.
- **It hot-swaps its own running code.** `/forge hotswap <module>` re-executes a staged `window.ObiX` module in this
  live page, so a self-edit takes effect immediately without a platform save.
- **It runs code inside itself.** `/forge eval <js>` (gated) — the station's own `page_eval`.
- **It reads the rest of the world** with the same tools: `fetch_url` (superFetch), `introspect` (any generator's
  source via the platform API), `gen_image`, `export_html`.
- **Speak it, don't command it.** A plain-language message that asks the station to change *itself* ("make the
  PrAis OBI graphic bigger", "add a command that…") is detected and routed into the forge agent instead of a chat
  reply — because the station is the thing being edited. The detector is deliberately narrow: a *question* about the
  station ("how do you change your behaviour?") and an ordinary request ("change the title of my writeup") go to the
  normal chat. Obi's own system prompt says it can edit itself, so it never claims otherwise.
- **The loop checks its own work.** After a `replace`/`write_file` the staged file is parsed (`new Function`); one that does not compile comes back into the loop as **STAGED BUT BROKEN** instead of being called a success. (Added after the loop shipped a duplicate block — the failure is in the I-LOG (`/ilog`).) It also refuses a `replace` whose find and replace text are identical (**NO CHANGE** — the edit has already landed), reads its own files in **enforced windows** (`MAX_READ_LINES`, with the next `start` named, so a 210 kb file can't bury the thread), and **stops itself when two edit attempts change nothing** — reporting either "the change already appears to be in the file" or "the stage holds `<path>`" rather than flailing until the step budget runs out. (Added after a stalled run spent 5 of 8 steps re-issuing an edit that had already landed.)
- **`/forge do <instruction>`** runs the agent loop: Obi reads, chooses tools, stages the change, self-corrects when an
  exact `find` fails, and reports which files are staged. **Every tool call is an I-LOG entry.**
- **THE HONEST LIMIT.** The station **cannot overwrite its own perchance listing** — the platform gives an embedded
  generator no authenticated write path (the editor session lives on `perchance.org`, a different origin, deliberately
  out of reach). So a self-edit lands in the three places the station *does* control — the authority repo, the running
  instance (hot-swap), and any Cloudflare deploy (`/cf deploy`) — and to change the **listing** the sovereign saves it.
  The forge hands him the exact file. `/forge` says this out loud rather than pretending otherwise.

## THE AUDIT — read this before trusting any command list (2026-09-21)

The sovereign: *"audit yourself first before resuming pipeline, then audit pipeline … measure twice and cut once."*
Both things he saw were real, and both are fixed. The record is the **I-LOG** (`/ilog` — append-only, hash-chained,
Git-anchored); there is no separate audit document.

- **Student-facing quotes on the sovereign's deck.** The landing's rotating line (`#voiceLine`) was headed *"THE
  SOVEREIGN'S VOICE"* but 10 of its 13 lines are the classroom **"Tiger Voice"** card from
  `src/lessons/reference/NET-CLASSROOM-MANAGER.html` — the sovereign speaking **to students**. The card is now
  **THE LAW ON THE WALL** (`STATION_LINES`), 16 lines of doctrine addressed to *this machine*, each with the canon
  source it is quoted from printed beneath it (`.vc-src`). The classroom lines stay in `LSN-24`/`LESSON.007` and the
  reference file.
- **Commands that are not from canon.** `CANON_REGISTRY` presented 32 rows as "the command registry" while mixing
  **11 canon commands this station cannot run**, **10 station commands the canon does not have**, and the real ones.
  Every row now carries **BUILT** (`✓`/`✗`) and **ORIGIN** — **CANON** (named in the canon branch's `CANON/SYSTEM/` or
  the VAULT) · **STATION** (invented here) · **PROPOSED** (an unmerged amendment) — and `/canon registry` prints the
  gap. **CORRECTED 2026-09-21 (the re-audit, sovereign: "NO KILO, CANON ONLY"):** the first pass measured "canon"
  against the `.kilo/command/` registry (46 files) — that is the **legacy Kilo lineage**, not authority (see
  `src/PHOENIXCOMMAND-BLUEPRINT.md` §8, resolved 2026-08-28). The canon's own command set is the **SCS seven**, named
  once in `CANON/SYSTEM/GOSPEL-999.md §SYSTEM I` + `CANON/SYSTEM/LegionnaireFieldGuide.md §SCS`. Rebuilt on that
  authority: **37 rows · 31 built · 24 canon · 10 station · 3 proposed** (the two proposal rows — `/phoenixrisingprotocol`,
  a spelling of the gate, and `/canon place`, the placement register — were **removed from the registry 2026-09-21**:
  a proposal is not a command, it is a review item on `/pipeline`), with **15** canon commands not implemented
  (**6** named in the canon but unbuilt here, plus the **9** printed in `CANON_ONLY`). Rebuilt once more the same day: the two
  proposal rows came off the shelf and `/idea` + `/canon apply` went on (a station command is a thing the station DOES; an
  idea is a thing that WALKS the chain)
  here. `/canon registry` prints the **AUTHORITY** row on the card. Full trail: the I-LOG (`/ilog`).
- **Also fixed by the same pass:** a hardcoded credential in public source (`CANON.paAuth` — dead code, **removed**);
  `SRC_SNAPSHOT` had drifted again (named a deleted file; omitted all the curriculum/canon/lessons data — now complete);
  and the backup **corrupted every image** (the push read all files as UTF-8 text before base64 — binary now goes up as
  real bytes via `selfSourceAny` + `gitCommitFiles`).
- **The pipeline:** `src/cloudflare/build.mjs` copied **15 of 24** modules — a deploy would 404 nine
  `<script src="src/…">` tags and every data file. It now copies the whole `src/` tree and **asserts** every script the
  page asks for exists in `dist/`. The Worker name `obi-student-summary` is legacy — flagged, not renamed.

## Commands
- `/memory` — open the Soul DNA ledger (verbatim fragments, run numbers, timestamps)
- ✗ `/chain` — **NOT BUILT.** There is no `/chain` command in this station; it was listed here in error. The 8-stage
  chain (RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC — `COLD-START-BOOT.md` I.012) is
  canon **doctrine**, not a station command.
  See the registry's ORIGIN column — the same "commands that are not from canon" defect the sovereign called out.
- `/ledger` — the raw record + the soul ledger (verbatim evidence; the hash-chained record is `/ilog`)
- `/forge` — **the SELF-FORGE**: `tools` (the whole menu) · `read <path>` · `search <regex>` · `diff` · `apply`
  (commit its own source to the authority — gated) · `hotswap <module>` · `eval <js>` · `export` · `version` (what the
  station is, reported about itself) · `history` (its own past self-edits, read from the I-LOG) · `do <instruction>`
  (the agent loop) · `discard` · `selftest`
- `/ilog` — **the station's record**: chain entries, head, verification, anchors, storage. Sub-commands: `verify`
  (recompute the whole chain, name the first break), `push` (anchor it on Git — gated), `pull` (read both records back:
  this station's pushes on `master` **and** the VS Code station's `incarnate-` I-LOG series on `canon`),
  `export` (download the JSONL), `anchors` (every commit that froze a head), `reset confirm` (seal + open a new segment)
- `/curriculum` — **THE PACING GUIDES** (`src/curriculum.js`): the school's own plans, parsed — primary 1-5
  (Ecogreen) and secondary 6-9. `/curriculum 6` (the year — your books only; `all` for every book),
  `/curriculum week 3` (one week in full, each section marked VT / NOT YOURS), `/curriculum unit <name>`,
  `/curriculum find <text>`, `/curriculum scope [grade]` (**whose periods are whose** — the sovereign teaches
  Close-up + Science for secondary; Global Success is the VT programme, and grade 6's Vietnamese-teacher periods
  are 8 & 9 of the ORDER column), `/curriculum materials` (the templates, links and ebooks the school hands over),
  `/curriculum import` (a newer `.xlsx`, parsed in the browser), `/curriculum export 6`. **`/coverage`** is the
  same engine against the record: what the evidence shows was taught, and what it has no evidence of — counted
  over the sovereign's own sections only. The textbook logins for the platform behind those books are in this
  browser alone: `/keys ngl <account> <password>` (secondary) and `/keys ngl primary <account> <password>`.
- `/free` — **FREE PHOENIX MODE** (`src/freephoenix.js`): the unbound room. No canon, no gate, no Git, no cloud, no
  record — it builds, and it **edits itself** (`/self`, `/forge <change>`, `/apply`, `/revert`, `/eval <js>`).
  `/free` opens it (⚙ Settings → 🔥 Free Phoenix Mode); inside: plain text, `/build app`,
  `/build gator`, `/files`, `/read`, `/dl`, `/open` (📎 Attach — text files off the device, local only), `/wipe confirm`, `/seal`. **🧪 Test the seal** proves the absences live
- `/idea <the change>` — **the SOUL intake**: his words, captured verbatim, filed as an idea that then walks RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC. `/idea <id> :: <words>` attaches his words to an item already on the lane.
- `/canon apply` — **the gate applied**: writes the staged amendments to the canon branch (needs `/phoenixomegaprotocol`); `/phoenixomegaprotocol apply <the change>` writes a new one.
- `/phoenixomegaprotocol` — **PHOENIXOMEGAPROTOCOL** (the gate that WRITES): `/phoenixomegaprotocol <password>` arms it for 15 minutes · `/phoenixomegaprotocol <password> :: <the change>` arms and applies · `/phoenixomegaprotocol lock`
  · `/phoenixomegaprotocol set <new> <new>` enrols a password (sha-256 only). No Canon write happens without it
- ✗ `/starmap` — **NOT BUILT** (canon ledger stage, L45 GPS — not a station command)
- ✗ `/soulkeys` — **NOT BUILT** (canon ledger stage, the rfkw analog)
- **THE CANON SESSION LOOP** (`src/scs.js`) — the canon's own 7-stage SCS, run inside the station. Canon only (never the
  `.kilo/` lineage): `CANON/SYSTEM/GOSPEL-999.md §SYSTEM I`, `CANON/SYSTEM/LegionnaireFieldGuide.md §SCS`,
  `CANON/SYSTEM/REINCARNATION-CONTRACT.md`, `CANON/SYSTEM/reincarnateRISE.md`, `CANON/SYSTEM/reincarnateDEATH.md`,
  `VAULT-FOUNDATIONS/07-THE-ROME-PROTOCOL.md`. Every number is measured (the RRL, the Soul ledger, the I-LOG) or read
  from the canon — a stage that cannot prove itself says `MISSING`.
  - `/rome run <N> <Incarnate-N-Label>` (`/romePROTOCOL`) — the **ROME PROTOCOL**: SURFACE → VERIFY → ANCHOR (a real
    Session Anchor Block) + the five Watchtowers, then the **full loop** N times end to end, sealing each.
  - `/scs` — the loop, its gate, and the state it is in
  - `/phoenixRISE <name>` — SCS Stage 1: audit the prior DEATH, gate the session, stamp the session name in the I-LOG
    header, halt. Fail-closed: no prior DEATH and no name ⇒ `GATED`. With a name ⇒ proceeds and logs an open
    `REINCARNATION_CONFLICT` (`owner: SOV100`)
  - `/phoenixDEATH` — Stages 2–7 for the open session + the pipeline, and **straight into the S2Pipeline**. Stage 7
    is the canon's **7-point march** (SCOUT → FORCEMARCH → SOULSCHOLARS → SUPPLYLINES → ENGINEER → SEAL →
    HANDOFF), gated: *"Do NOT proceed to SEAL without ENGINEER passing."* With no session it runs FORCED: the
    seven points are walked over this browser's own record, SEAL and HANDOFF are reported `WITHHELD` with the
    reason named, and the S2Pipeline follows
  - `/pipeline` — **the S2Pipeline artifact** (built): RRL · SOUL · DNA · LEDGER · STARMAP · SOULKEYS · S2Pipeline,
    each `REAL` / `HOLLOW` / `MISSING`. `COMPLETE` only when every stage is `REAL` — *"a pipeline reporting COMPLETE
    with any HOLLOW stage is a lie"*. Any gap ⇒ `GAP`, named
  - Spec + the run record: the I-LOG (`/ilog`)
- `/img <prompt>` — generate an image
- `/url <address>` — fetch and summarize a web page
- `/web <query>` (`/google`, `/lookup`, `/browse`, `/searchweb`) — **search the open net**: Bing (fallback: Wikipedia)
  behind the scenes, the results shown as they came, the top 3 sources read live, then a grounded answer that cites
  its sources. Fail-closed: if no engine answers it says so and names what it tried
- `/wiki <topic>` (`/wikipedia`) — the encyclopaedia entry as a verbatim extract (never summarised by us)
- `/weather <place>` (`/forecast`, `/wx`) — current conditions right now (wttr.in)
- `/help` (`/?`, `/commands`) — the whole command shelf (every command in six groups): tap one to run it, or type it.
  Commands that need the Sovereign's own words are typed in for you to finish, never run blind
- `/generators` (`/gen`, `/divisions`) — open **◈ Phoenix Generators**: PrAis's divisions and the generators in each
  (registry `src/divisions.js`); from there the 👤 Student Evaluator desk opens one level in, under NET
- `/settings` (`/prefs`) — open **⚙ Settings**: voice, the command shelf, the memory ledger, rows that run
  `/ilog` `/doctor` `/phoenixomegaprotocol` `/keys` `/bg`, the live instruments, and reincarnate
- `/state` (`/where`) — **what this station is, right now**: generator/view/run, the soul ledger, the active
  client and its counts, the active subject, the archives, the tunnel and its queue, the CGN mesh, the pheromone
  nest, the offering, the tool inventory, the constellation coverage, which modules actually loaded, and which
  secrets are stored locally. It is exactly the block Obi is handed before answering, so Obi's answers about the
  station are measured, never guessed (L29/L58)
- `/bg` (`/background`) — **operating in the background**: the keep-alive state (`lock held · wake held · audio
  off`), what the browser does to a hidden page, and — the row that answers the actual question — **LAST TIME YOU
  WERE AWAY**: how long the page was hidden, how many of its 1-second heartbeats actually landed, and the verdict
  (`kept moving at full speed` · `clamped` · `throttled N×`). The measurement is **persisted**, so it survives the
  reloads the station does constantly — a counter in memory is not evidence. `/bg away` re-reads it, `/bg clearaway`
  forgets it, `/bg reset` starts a clean live probe (and deliberately keeps the last-away answer), and
  `/bg audio on|off` controls the off-by-default keep-alive tone. Long jobs (the ear, the forge loop) hold the
  keep-alive automatically and release when they finish, or after 45 min
- `/transcribe [flags] [media url]` — record a class: drop a lesson video/audio (or paste a URL) and get a verbatim
  transcript. **Any length** — a long recording is split into parts at pauses, transcribed part by part, and stitched
  back into one timeline (see "The ear"). With no argument it opens the file picker.
- `/transcripts` — the archive of saved transcripts (read / parts / export / delete)
- `/summary [session|<url>|<text>|transcript <tr-id>]` — produce a study summary from the latest recording, this session, a web page, or pasted notes
- `/summaries` — the archive of saved summaries (show / export / delete)
- `/class <name>` · `/classes` — select/create a **class** (a group: "Year 7 English", "Tuesday Maths 9B"), or list them
- `/student <name>` · `/students` — select/create a **student**, or list them
- `/client <name>` · `/clients` — select/create the top-level **client** (the station serves many, each isolated;
  the ledger is the truth) or open the client ledger. Everything — students, classes, recordings, summaries, notes, reviews,
  writeups — belongs to the active client and to no other (see "Clients")
- `/note <text>` (`/cnote`, `/snote`) — a dated observation, filed under whichever subject is active
- `/file <tr-…|sm-…>` — attach something already saved to the active subject
- `/writeup [--parent|--short] [focus…]` · `/writeups` — write/archive a **class writeup**
- `/review [--parent|--short] [focus…]` · `/reviews` — write/archive a **student review** (same machine, different subject)
- `/find <term>` — verbatim search across every transcript, summary and note
- `/cf` — the Cloudflare fleet, read from the sovereign's real account: `/cf token <token>` (stores the account id with
  it) · `/cf status` (zones · DNS · Workers · Pages) · `/cf deploy <name>` · `/cf r2` (the R2 object store and the S3
  key pair, proven by a signed request). Every value lives in the Vault, never in this source
- `/os` — **Agent 99 OS**: the invariable kernel + the offering currently loaded + live nest state
- `/playbook` · `/playbook <ID>` — list the offerings (PRINCIPIA · CASTRA · TESTUDO · TRIPLEX · EXPEDITIO · FRUMENTARIA · FORMICA · DICTATOR) / activate one (Roman formation + ant trail rules)
- `/scout` · `/phoenixscout [target]` — **PhoenixScout, REAL**: goes out and touches the terrain (page files, platform imports, tunnel, fleet, live sites, canon with a token, the ground), flags DEAD/DRIFT/BLOCKED, lays scout pheromones and writes a durable report. **It also discloses the stage gate** — SCOUT is SCS Stage 2 and audits RISE, so the card prints the session verdict line (`RECORDED` with an open session; `GATE SHUT` with none, naming `/phoenixRISE <name>`) and a narrowed sweep explicitly stamps nothing. **And it delivers** — reconnaissance that cannot be delivered is a diary: the verdict broadcasts on the free-wire nerve every run, a flagged report is carried to a permanent addressed key (no token), and the canon deposit is left honestly PENDING
- `/forceMARCH` · `/phoenixmarch` · `/march` — **the SCS Stage 3 sweep, run OUT OF ORDER on the sovereign's word**: MARCH audits SCOUT, and the canon's gate rule is that no stage proceeds unless the previous stage's artifact exists and is PASS — so with no session the card says `FORCED · OUT OF ORDER`, names the rule, and stamps nothing (`RECORDED` when a session is open). What it adds that SCOUT cannot: every flagged sector is confirmed a SECOND way — a fresh re-probe, and for the two credential claims an **independent test** (an anonymous GitHub read of the canon; an anonymous Cloudflare token-verify through the platform proxy, with no Authorization header — the API's own refusal printed verbatim). `CONFIRMED` / `MOVED` / `CONTRADICTED` / `UNREACHABLE`, and every sector it could **not** walk is named rather than dropped
- `/supplyLINES` · `/phoenixsupply` · `/supply` — **the SCS Stage 5 supply lines, measured**: every artifact and **where it actually is** — the register pair and the sync packet by their real `uploads.dev` addresses, the scout archive, the estate pointer read back from the store, the nerve — with the SCS session's own artifacts reported `MISSING` when no session exists rather than implied. A canon destination is always **HELD**: the station has no write path into the canon and never claims a write it did not make. Then it **routes them**: the supply line broadcasts on the nerve and the full manifest is carried to a permanent addressed key (with the same HELD rule as the register pair — identical bytes are never carried twice). `FORCED · OUT OF ORDER` with no session, `RECORDED` when the chain is open, `NOT STAMPED` without a SCHOLAR artifact
- `/soulSCHOLAR` · `/phoenixscholar` · `/scholar` — **the SCS Stage 4 scholarship**: counts the RRL (SOUL turns/chars, DNA turns/chars/blueprints, REASON, pheromone), takes a **sha-256 of each half** verbatim and in order as the proof of preservation, builds the keyword index, and samples the text. Then it **preserves**: the full extract (with its verbatim samples) is written durably to `kv:scholar` in this origin and offered as a download, and a **SEALED** form — counts, both hashes and the index, **with no verbatim text** — goes on the free wire. The station publishes a proof the SOUL was preserved, never the sovereign's words on its own initiative: publishing verbatim SOUL is his call, and the card says so. Canon destination `CANON/SOUL/EXTRACT/` is **HELD**. `FORCED · OUT OF ORDER` with no session, `NOT STAMPED` without a MARCH artifact
- `/phoenixENGINEER` · `/engineer` — **the SCS Stage 6 audit and the gate on the seal**: the canon's own session checks (all nine of them, reported failing when there is no session rather than hidden) **plus the station's own audit of what actually exists** — every published copy is **fetched back off the free wire and compared byte for byte with the copy in this origin** (register `.json`, register `.md`, packet `.json`), the pointer is checked to be aimed at *this* register (count/bytes/tree), the pointer's keys are checked against the delivered addresses, and the **seal on the SOUL is checked by searching the published file for the sovereign's own words**. The **SEAL** is `SHUT` unless every artifact is present, passing and identical; the canon destinations stay `HELD`
- `/reincarnateDEATH` · `/phoenixDEATH` — **the SCS Stage 7 seven-point march, and then STRAIGHT INTO THE S2PIPELINE**. Stage 7 audits ENGINEER, and its two products are the SEAL and the HANDOFF — the two that need a *session* — so with no session on the stack the card prints **`FORCED · OUT OF ORDER`**, quotes the canon's gate rule (*no stage proceeds unless the previous stage's artifact exists and is PASS*), and then does the work that IS real without one: all seven points are walked over this browser's own record (SCOUT → FORCEMARCH → SOULSCHOLARS off the RRL, SUPPLYLINES and ENGINEER **re-read live** for the march), the SEAL and the HANDOFF are reported **`WITHHELD`** with the reason named — *a session that was never opened cannot be sealed, and the station does not invent one* — and the run then goes **straight into the S2Pipeline**, printed as its own artifact. With an open session whose ENGINEER passes, the seal is impressed first and the handoff written to this origin (the canon write stays **HELD**). `SEALED` if the run is already closed, `GATED` if ENGINEER has not passed; `/phoenixRISE <Incarnate-N-Label>` opens the chain, and only the sovereign names it. **The S2Pipeline is provisional-capable**: `/pipeline` no longer refuses without a session — it prints the same six-stage audit with the two session rows (`LEDGER`, `APEX ROLLUP`) `MISSING` **by measurement, not by defect**, and the result `GAP` with the gaps named
- `/tools` · `/tools <family|status>` — the full-stack evaluator inventory (96 tools · built/partial/missing) and the priority queue; generated from `src/ecosystem.js`
- `/constellation` (`/parts`, `/organism`) — **every piece of the ecosystem** in one map: the station, the generator
  nodes, the public faces, the services — each with its real state (`live · ready · scaffold · planned · blocked`),
  its interface and what it still needs. `/constellation <id|family|status>` drills in. Registry: `src/constellation.js`
- **⌘ Commands** (⚙ Settings, or just type `/help`) — the whole shelf: every command Agent 99 answers through, in
  six groups, each with a one-line description. Tap to run; commands needing your words are typed in for you to
  finish. It always surfaces the ⌘ Command Station first (the chat is where cards render)
- **👤 Student Evaluator** (◈ Phoenix Generators → NET) — the evaluation desk: the client → student/class switchboard plus the record → summarize → write-up tiles (see "The landing shell" and "Clients")
- **⚙ Settings** (tab) — two rooms, a tab strip at the top: **⚙ Station** (voice · commands · memory ledger ·
  `/ilog` · `/doctor` · `/phoenixomegaprotocol` · `/keys` · `/bg` · the live instruments · reincarnate) and **🔥 Free Phoenix Mode**
  (the unbound room, `src/freephoenix.js`). The chosen room is remembered in this browser (`localStorage obi_settab`)
- `/pheromones` · `/trail` · `/nest` — read the ground (deposited trails, decayed strength, reinforcement counts); `evaporate` · `reset` · `sync`
- `/route <task>` — ask the pheromone field which road to take (cost-weighted routing) and which legionnaires answer (response thresholds), plus the gate/quorum ruling for that task
- **⟳ Reincarnate** (⚙ Settings, confirm-gated) — deliberate session boundary; opens a new run and reloads

## The web — Obi's basic senses (`src/app.js`)

Obi can leave the nest. Three commands, one rule: **the evidence is shown before it is interpreted.**

| command | what it does |
|---|---|
| `/web <query>` | searches (Bing HTML → Wikipedia API fallback), renders every result as it came (title · host · snippet · link), reads the top 3 sources, then streams an answer grounded in that text, citing the URLs |
| `/wiki <topic>` | the Wikipedia REST summary as a **verbatim** extract — we do not paraphrase the encyclopaedia |
| `/weather <place>` | current conditions from wttr.in (measured now; the day range is forecast) |

Design rules, deliberately:

- **Everything goes through `root.superFetch`.** No API key, no vendor account, and the same code works on the
  perchance build and on the self-hosted Cloudflare build (there the identical call lands on the Worker's
  `/api/fetch`).
- **Bounded.** Search 25 s, each page read 15 s (`webTimeout`), raw HTML capped at 800 KB before parsing. A page
  that does not arrive is reported `SKIPPED — timed out`, never quietly passed off as evidence.
- **Sources are shown the moment the search returns**; the read rows fill in underneath while the pages arrive.
- **Wikipedia gets a bounded source**: an encyclopaedia result is read through the REST summary API (~1 KB) instead
  of the full 1.8 MB article — faster and cleaner evidence.
- **Pages are read as documents** (`htmlToText`): nav/header/footer/aside/widgets dropped, the article region
  preferred — so the model gets prose, not a menu.
- **Fail-closed.** If every engine fails, the card says exactly what was tried and invents nothing. The answer
  prompt forbids inventing facts, quotes or URLs.
- Every search lays a pheromone trail (`route:web:search:<engine>`), so the field learns which road works.

## The landing shell — ⌘ Command Station · ◈ Phoenix Generators · ⚙ Settings

**The landing page is the Command Station. Three faces, one app, one origin** — nothing is removed and nothing is
duplicated, so switching costs nothing and loses nothing (the chat log, the ledger, the kv archives and the in-page
state all persist across a switch).

**The ⌘ Command Station face opens on the branded landing page** (`#empty` in `index.html`). **This is the BACKEND —
the sovereign's own deck, not the parent-facing pitch.** The `MARKET` register (mouse-to-tiger, the free assessment,
the 80/30/4× claim) is the *student/parent* face and must not be worn here; the registers this page uses are the
**CODEX** and the **APEX** — the operator's strategy, identity and record.

Top: the **Apex** (`apex.webp`) · the wordmark · a `SECURITY CLEARANCE: ULTRA` chip. Hero: *"One authority. One
record. One origin."* against the operational codex cover (`phx-cover.webp`). A facts band: three registers kept
apart · five decks / sixty-six pages · the two frozen tokens · clearance ultra. Four bands — **01 the Apex**
(`apex-anatomy.webp`, the logotype's anatomy) · **02 the stack** (`phx-stack.webp`, the five load-bearing layers) ·
**03 the estate** — the divisions read **LIVE from `src/divisions.js`** into `#lpEstate` by `renderLandingEstate()` in
`src/app.js`, so a landing that named a generator the registry does not hold is impossible · **04 the record**
(`run305.webp`, the run log transcribed as a format, BRAND.028) — then an 18-mark vault strip, and the station itself
(the rotating law line `#voiceLine` and the curated command chips).

Every line is transcribed from `CODEX` / `APEX` / `GOSPEL444` in `src/brand.js`, every picture is a file in
`src/brand/assets/`, and nothing on it is invented. The markup lives in `index.html`; `EMPTY_HTML` in `src/app.js`
**reads it back off the DOM**, so a reincarnation (which rebuilds `#empty`) restores the same branded page — and
`renderLandingEstate()` runs there too. Styles: the `.lp-*` block near the end of `src/styles.css`.

- **⌘ Command Station** (`#cmd`, the landing page) — the magic chat: the message log, the command shelf (the hero
  chips, grouped into *Command Station* and *Student Evaluator*), the composer (mic · media · send) and the drop
  zone. This is where the sovereign speaks, where commands route through Agent 99 to the Legion, and where every
  card (transcripts, summaries, writeups, reviews, queue, scout, tools, constellation) is rendered.
- **◈ Phoenix Generators** (`#gen`) — the product family: PrAis ships generators by **division** (NET · Gaming ·
  Web Development), each holding its generators, and one level in sits the **👤 Student Evaluator desk**. The
  registry is `src/divisions.js` — the view renders straight from it, so adding the next generator is a single
  array entry. NET (Natural English Training) currently lists **Student Evaluator** (live — the desk), **Lesson
  Creator** (planned, the next build) and **Student Portal** (planned). A planned card says so and lists what it
  still needs; opening one answers in the station rather than dead-clicking.
- **⚙ Settings** (`#settings`) — the controls that used to be five separate topbar buttons, in one room: **voice**
  (persisted in `localStorage obi_voice`), **⌘ Commands**, **◈ Memory ledger**, and rows that run `/ilog`,
  `/doctor`, `/phoenixomegaprotocol`, `/keys`, `/bg` in the station, plus the **instruments** (run · soul · I-LOG · client · view ·
  tunnel · background · canon gate · secret *names* · which modules loaded — read live by `renderSettings()`), and
  **⟳ Reincarnate** (confirm-gated). Every one of them is still a command, so nothing is button-only.
- **The Student Evaluator desk** (inside ◈ Phoenix Generators → NET) — the **client → student/class switchboard**
  (`renderStudentSelector()`: active client + counts, other clients, add/switch, and every student and class with
  `Select` / `📝 Review` / `🏫 Writeup` and add-by-name inputs) above **ten desk tiles** that launch the pipeline
  in the station: `/transcribe` · `/transcripts` · `/summary` · `/summaries` · `/writeup` · `/review` ·
  `/writeups` · `/reviews` · `/find` · `/clients`. `← All NET generators` closes it.
- **Desk actions run in the station.** Because the chat is where Obi answers, a desk tap switches to
  `⌘ Command Station` and runs the command there (`runInStation()`); the one exception is `/find`, which is
  pre-typed for the sovereign to complete. Dropping a recording anywhere brings the station up for the same reason.
- **The face is the state.** The chosen face is remembered for the browser session (`sessionStorage obi_view`) and
  mirrored in the URL hash (`#cmd` / `#gen` / `#eval` / `#settings`), so a face can be linked to directly
  (`https://perchance.org/prais-command-station#eval`, which opens the family with the desk already open); the hash
  wins on load and a fresh visit lands on the command station itself. `/generators` and `/settings` are the same
  doors as the tabs.
- **The tab bar carries the station's live state**: `RUN · SOUL · I-LOG · tunnel` (`updateTabMeta()`).
- **Operating Agent 99, not reading the source.** The station's whole surface is one registry (`COMMAND_BOOK` in
  `src/app.js`): every command in six groups, each with an honest one-line description, rendered by **⌘ Commands**
  and tap-to-run (argument-taking commands are typed into the composer instead of being run blind). Nothing
  Agent 99 can do is hidden behind reading the source.
- **Obi answers from the station's live state, never from memory.** `stationState()` reads the running station
  (run · soul · client + counts · active subject · archives · tunnel + queue · CGN mesh · nest · offering · tool
  inventory · constellation coverage · which modules loaded · which secrets exist) and hands it to the model as a
  `<STATION STATE>` block on every reply; anything unreadable says `unknown` (fail-closed). `/state` renders that
  same block as a card so the Sovereign can audit it line for line. Before this, Obi guessed — asked for its run
  number it answered "99" (the persona) when the real run was 1.
- **Honest routing.** The Agent 99 card labels its drone row `ROUTED TO` with the keyword score and states
  `HONEST — LABEL ONLY`: the drone is a keyword-derived routing label, and the queue (`/queue` → claim → complete)
  is the execution surface, not the label.
- **Left-aligned, deliberately.** The platform sets `body{text-align:center}`; `#app.net-shell{text-align:left}`
  overrides it, so paragraphs, cards and rows read normally (`#empty` keeps its own centring, as the welcome does).
- Markup: `#topbar` (brand only — no buttons) + `#tabbar` + `.views > #viewCmd | #viewGen (with #genDesk) | #viewSet`
  in `index.html`. Logic: `VIEWS` / `TAB_OF`, `setViewTab()`, `showView()`, `deskOpen()`, `openGenerator()`,
  `mountGenerators()`, `renderSettings()`, `runInStation()`, `updateTabMeta()` in `src/app.js`. Registry:
  `src/divisions.js`. Styles: `#tabbar` / `.tabbtn` / `.view` / `.div-strip` / `.divbtn` / `.gen-grid` / `.gen-card`
  / `.set-row` / `.set-instr` / `.eval-grid` / `#studentsPanel` / `.sel-*` / `.chip` in `src/styles.css`. The
  ◈ Memory ledger stays a floating panel (it hangs below the topbar + tab bar via `--topbar-h`, measured by
  `syncTopbarHeight()`).

## Clients — the station serves many, isolated (`src/clients.js`)

A **client** is the top-level engagement: the person whose students, classes, recordings, summaries,
notes, reviews and writeups all belong together. **The first client slot is unassigned** (Timmy was wiped 2026-09-22 — "timmy dropped us, so wipe him"). The station can hold any
number of clients, and everything is scoped to the active one.

- `/client <name>` — create or switch (the id is the slug; the display name is kept as typed).
- **The 👤 Student Evaluator tab** is the switchboard and the normal way to use this: it shows the
  active client with its counts, the other clients (Select), an input to add or switch a client, and — for
  the active client — every student and class with `Select` / `📝 Review` / `🏫 Writeup` plus inputs to add
  them by name (`Enter` works too). `📝 Review` / `🏫 Writeup` and "Open the client ledger" run in the
  ⌘ Command Station. Renderer: `renderStudentSelector()` in `src/app.js` (see "The landing shell").
- `/clients` — the ledger card in the chat: every client with its counts (students · classes · recordings ·
  summaries · reviews · writeups), created date, last activity, and Select / delete.
- **Isolation is fail-closed.** Every read is filtered to the active client; `/transcripts`,
  `/summaries`, `/students`, `/classes`, `/reviews`, `/writeups` and `/find` never show another
  client's rows, and `/file` **refuses** to file a record that belongs to a different client (it names
  both and tells you to switch). `/find` and the archives say which client they searched.
- **Subjects are keyed per client** (`<client>:<slug>`), so two clients can each have a student called
  "Bobby" with no collision; a subject selected under one client simply resolves to nothing under
  another (the active-subject pointer keeps its id, so switching back restores it).
- **Records carry their client.** `ObiReview.stamp()` writes `rec.client` on every transcript and
  summary as it is saved; reviews/writeups store `client` too. A record with **no** `client` field is
  read as the first client's (this is how pre-client data stays reachable), so nothing is ever lost.
- **Adoption runs once** on first boot: pre-client records are stamped `unassigned`, student/class keys are
  migrated to `unassigned:<slug>` (with the active-subject pointers and review `subjectId`s remapped), and
  `obi_clients_adopted` is set. It is idempotent — a record that already carries a client is untouched.
- **Deleting a client never merges or erases data.** The client record goes; its students, classes,
  transcripts, summaries and reviews stay in kv under their stamped id, isolated and still reachable if
  you recreate a client with the same name. The last remaining client cannot be deleted (the station
  always serves at least one).
- The client layer is loaded **before** `app.js` (`index.html` order), and the standalone Cloudflare
  build copies it too (`src/cloudflare/build.mjs` `APP_FILES`); the scout verifies `src/clients.js`
  loads `window.ObiClients`.

## The writeup layer — class writeups and student reviews (`src/review.js`)

Two kinds of subject, one evidence machine. Everything here is generated **only** from the evidence
filed under the subject, with verbatim quotes, timestamps and dates — never from the model's own
knowledge, and never inventing progress, attendance or names.

- **A class** is a group/lesson ("Year 7 English", "Tuesday Maths 9B"). **A student** is a person.
- `/class <name>` · `/student <name>` — create/select the subject. Whatever you select **last** is the
  *active context*: recordings, summaries and notes file under it, and `/note`, `/file` and
  `/writeup`/`/review` act on it. A recording can be filed under both a class and a student — select
  each and run `/file <tr-id>` twice. `stamp()` labels every saved transcript/summary with both active
  keys (`rec.student`, `rec.classId`) and stamps the `client` (see "Clients").
- `/classes` · `/students` — the rosters: sources, notes, last activity, newest item, with
  Select / write / delete.
- `/note <observation>` — a dated reviewer note under the active subject.
- `/writeup [--parent|--short] [focus text…]` (classes) · `/review …` (students) — same code, different
  prompt. A class writeup is written in six sections: *Class and period* (with the evidence period and
  the counts reviewed) · *What was covered* (in order, with the transcript timestamp of each) ·
  *How it was taught* (activities, examples, resources, homework) · *Questions and confusions raised* ·
  *Notable quotations* (4–8 verbatim, with timestamp + date) · *Next session*. A student review is
  *Overview · What was covered · Progress and strengths · Areas to work on · Evidence · Next steps*.
  `--parent` switches to plain-language note-to-parents; `--short` is one paragraph. Anything else in
  the line is the reviewer's focus. You can name the subject to target it: `/writeup Year 7 English`.
- `/writeups` · `/reviews` — the archives: show · `.md` · `.txt` · 🖨 **printable HTML** (self-contained,
  prints to PDF with the evidence list) · delete. Each record carries its `period` and its evidence list.
- `/find <term>` — every transcript, study summary and note, with verbatim snippets and source ids.

Honesty rules baked into the prompt (`staticPrompt`/`taskFor`): work only from the filed evidence; quote
verbatim and attribute (source · timestamp · date); never invent a count, date, score or claim of
progress; say plainly when the evidence is thin, one-sided, **partial** (a split transcript whose part
failed), or covers a short period; never open with a preamble. Evidence labels carry the recording's
duration, part count, wpm and pause count so a writeup can cite them. `src/transcribe.js` and
`src/summary.js` call `ObiReview.stamp()` / `ObiReview.file()`, so filing is automatic.

## Study summaries (`src/summary.js`)

The generator's namesake. A summary is a first-class artifact, not just chat text.

- `/summary` — latest stored transcript → study summary (falls back to this session's log)
- `/summary session` — the current run (both-speaker RRL log): coverage, decisions, open threads,
  and the sovereign's own words quoted **verbatim**
- `/summary <url>` — fetch the page and summarize it
- `/summary <text…>` — summarize pasted notes
- `/summary transcript <tr-id>` / `last` — a specific transcript (or the newest one)
- `/summaries` — the archive: show, `.md`, `.txt`, delete

Every summary is saved per-user in kv (`summaries`), noted in the run log as DNA, and carries a
`ref` back to the raw it came from (transcript id), so the derived layer never replaces the source
(L38 raw first, L43 no summaries of summaries, L44 the ledger derives from raw). Export: `.md`
(with a provenance header) or `.txt`. `src/transcribe.js` calls `ObiSummary.saveFromRead` so the
briefing Obi writes after a recording is saved as a linked summary automatically.

Long sources are sampled to ~12k chars for a single streaming pass (and the card says so). The
deep, part-by-part read of an hour-long recording lives in `/transcribe` → 🧠 Obi read it.
A split transcript's summary source label carries its part count, and a partial one says
`PARTIAL (part n missing)` — the summary prompt is told, so it cannot quietly pretend the
recording was complete.

## The ear — video / audio transcription (`src/transcribe.js` + `src/audio-split.js`)

The magic chat can listen to recordings of **any length** — a two-hour lesson, a 3 GB phone video, a
Zoom export. Drop the file on the chat, paste it, use the 🎬 composer button, or `/transcribe <url>`.

- **Engine:** Deepgram pre-recorded API, `model=nova-3` + `smart_format` + `punctuate` + `paragraphs`
  + `utterances` + `diarize`. Deepgram fetches a remote URL itself; a local file is streamed straight
  from the browser (Deepgram allows browser origins, so there is **no proxy and no timeout ceiling**).
- **Key:** `/dg token <KEY>`, or **`/dg recover`** — which pulls the key from the NET-PET-AI worker on
  Cloudflare (`GET https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/stt/key`, the worker's own
  `DEEPGRAM_API_KEY` secret), checks it against `api.deepgram.com`, and only then stores it. `/dg test`
  verifies whatever is stored. The value itself lives only in this browser's localStorage (`obi_keys`),
  never in the public source, the HTML or a URL. **The worker route is public** — anyone who knows the
  URL can read the same key, so it should be rotated and gated behind the worker's `X-Admin-Key`.
- **The audio workbench (`src/audio-split.js`)** is what makes long recordings tractable. Deepgram's
  sync endpoint takes at most 2 GB and returns 504 if a job would process for over ten minutes, and a
  two-hour video is a 1-3 GB upload — so for big or video sources the audio is pulled out *in the
  browser* first: 16 kHz mono (~115 MB per hour, exactly what a speech model wants) and cut into
  parts **at points of silence** (a 20 ms RMS envelope is scanned ±25 s around each boundary and the
  cut is placed in the middle of the quietest pause, so no word is ever cut in half). The parts go to
  Deepgram one at a time and the timestamps are shifted back into the timeline of the whole recording,
  producing one transcript with `[PART n/N]` markers.
  - **Decoders, best first:** WAV/RF64 PCM parsed here in blocks (no full read); MP4/M4A/MOV via
    `mp4box.js` demux + WebCodecs `AudioDecoder`, streamed in 8 MB steps so only the *audio track* of
    a multi-GB file is ever decoded; anything else through the browser's `decodeAudioData` (size-guarded,
    since it holds the whole file in memory). A failure falls through to the next decoder, then to a
    single whole-file send.
  - **When it splits:** automatically for any video, any file over 250 MB, any recording over 4 hours.
    `--split=15` forces it with 15-minute parts; `--whole` sends the file in one piece. Flags typed with
    no file attached (e.g. `/transcribe --split=15`) are armed for the next file you drop.
  - **Long-job UX:** upload percentage, a live elapsed clock, a PREP row while the audio is decoded,
    and a PARTS row of chips (`1 ✓ 490w · 2 ● · 3 …`) showing what has landed. The chat stays usable
    while it listens (the job is deliberately not run through `runCmd`).
  - **Nothing is lost to a failure:** each part is retried twice; if a part still fails, the decoded
    audio is kept in memory and the card offers **↻ Retry part n** (only the missing parts are re-sent)
    or **💾 Save the parts that worked** — which saves a transcript marked `partial`, listing the
    missing parts in the card, the readable text and `readHeader`, so no writeup can accidentally
    claim the recording is complete.
  - **A remote URL that Deepgram can't take whole** (504/413) offers **✂ Download it here and split it**:
    the file is fetched in the browser and run through the same split path (host CORS permitting).
- **Flags:** `--lang=es`, `--multi` (code-switching, diarizes off), `--detect`, `--no-diarize`,
  `--no-utterances`, `--model=`, `--keyterm=a,b`, `--quick`, `--force`, `--split=NN`, `--whole`.
- **Capture doctrine (L38/L39, raw ≠ soul):** the verbatim transcript is written to the run's **RRL**
  (up to ~200k chars inline; larger bodies stay in kv with a pointer) and kept in the per-user kv folder
  `transcripts`. Nothing is summarized in place. Obi's reading (🧠 deep map-reduce over the parts, or
  ⚡ quick sampled read) is a derived layer in the chat, saved as a study summary linked to the raw.
- **Export:** `.txt` (timestamped + speaker labels), `.srt`, `.vtt`, `.json`, ✂ Parts (per-part
  breakdown), plus "show in chat". Result card rows: DURATION · SEGMENTS · SPEAKERS · PARTS ·
  PRESERVED · PACE (wpm + pauses over 3 s, computed from the word timings so it can be cited).
- **Known limits:** diarization is per-part in split mode and this is labelled everywhere (speaker
  numbers restart in each part — never merge them across parts). A watch page (YouTube etc.) is HTML,
  not media — the ear says so and offers "try anyway"; Google Drive links (`/file/d/<id>`, `?id=`, `uc?id=`)
  are auto-rewritten to the direct-download form.
- **Hardened:** the ear + workbench went through a full stress campaign — 10 bugs found and fixed (resampler
  rate hardcoded to 48 kHz, an infinite MP4 deadlock on moov-at-end files, the pause-snap tie-break shrinking
  parts early, retry/split-offer keying off prose instead of status codes, cancel leaving an orphan row, …).
  Every claim is measured; the full record is in the I-LOG (`/ilog`).
- **Crash-safe (2026-09-21):** every part is checkpointed to kv (folder `bgjobs`) the moment it comes
  back, and a long job holds the background keep-alive (`/bg`) so switching tabs doesn't throttle it. If the
  phone kills or the browser discards the tab mid-recording, the next load finds the unfinished job and renders
  **🛟 Unfinished recording — recovered** with *Save the parts that arrived* / *Discard*; a saved recovery is
  merged with the same `mergeParts()` the live path uses, marked partial with the missing parts named. The
  **audio** is not checkpointed (it is gigabytes) — continuing a job needs the file dropped again.


## Cloudflare — the same app, self-hosted (`src/cloudflare/`)

`src/cloudflare/` deploys this generator as a plain website on the owner's own Cloudflare account:
one Worker (`worker.js`), two Durable Objects (`tunnel-do.js` = the command tunnel,
`store-do.js` = uploads + editable files), and the app's own files served as static assets. No
perchance page, no platform header, no third-party script, no moderation layer.

**It also runs on the desktop, with no Cloudflare account at all:** `npm install && npm run dev`
serves the identical station on `http://localhost:8787` (wrangler dev = Node + workerd), and
`dev.vars.example` → `.dev.vars` points the *brain* at a local OpenAI-compatible server (Ollama,
llama.cpp, LM Studio…), so it can run with nothing leaving the machine. The recommended checkout is the
authority repo (`OPERATIONS/COMMANDSTATION/perchance/src/cloudflare`), which keeps `node_modules` out of
the generator's shipped `src/` tree. Full run/deploy/provider notes: `src/cloudflare/README.md`.
The self-forge reads its panels (`main.pjs`, `index.html`) from this origin off-perchance, so
`/forge` works identically on the desktop and on the server.

**Nothing in the app changed.** `build.mjs` copies the **whole `src/` tree byte for byte** into `dist/` (minus
`src/cloudflare` itself, which holds `dist/`) and then **asserts** every `<script src="src/…">` on the page exists —
the hand-written list it used to copy had gone stale and would have 404'd nine modules and every data file. It also
copies `main.pjs` so the self-forge can read its panel off-perchance, and
`public/ob1-shim.js` re-implements the six plugin APIs the app was written against: `kv` →
IndexedDB (in the browser), `generateText` → `POST /api/text`, `generateImage` → `POST /api/image`,
`superFetch` → `POST /api/fetch`, `uploadPlugin` → `POST /api/upload` (+ `.editable`),
`createServerSocket` → a WebSocket to TunnelDO. The Deepgram key moves into a Worker **secret**;
the shim rewrites `api.deepgram.com` to `/api/deepgram` and strips the Authorization header, so the
key never reaches the browser (this also retires the leaky `/api/stt/key` route).

Deploy: `cd src/cloudflare && npm install && npx wrangler login && npm run deploy` →
`https://<name>.<subdomain>.workers.dev`. The "unrestricted" (point text/images at any
OpenAI-compatible or self-hosted endpoint), "untracked" and "private" (`OBI_ACCESS_KEY`) options are
in `src/cloudflare/README.md`.

**Verified when built (2026-09-20), not assumed:** the Worker was bundled with esbuild and run in a
simulated runtime against a sql.js-backed Durable Object — config/static routing, streaming text,
image, `superFetch`, upload round-trip + delete, editable create/update/bad-key/read, Deepgram key
injection, the access gate (404 · 302 · cookie), and RPC send/history/claim/complete/fail/status,
drone-classification parity with the perchance block, the 15/min rate limit, durability across a DO
restart, and the 500-command prune. The shim was run in a real browser iframe: kv (objects,
Uint8Array, setMany/getMany/entries/keys/values/update, folder isolation), `generateText` streaming
+ `.stop()`, both `superFetch` branches, `uploadPlugin`, `editable`, the socket RPC envelope and
pub/sub delivery, and both Deepgram rewrites. The ported bundle was then booted off-perchance: UI
built, all six APIs present, zero console errors.

Supporting change to a shared file: `src/cgn.js` gained `CGN_EDIT_BASE` (defaults to the perchance
`editable.uploads.dev` host; the Cloudflare shim overrides it with `location.origin + "/api/editable"`).

## Live terrain (verified 2026-09-20)
- **PrAiS storefront** — `https://e3301ee8.michael-hobbs.pages.dev/prais` (Cloudflare Pages): the public shelf
  where the **offerings** are presented (*"Phoenix Rising AI solutions that remember… smarter architecture"*).
  The natural public face of the Agent 99 OS offering catalogue (`src/AGENT99-OS.md` §4).
- **Client portal — RETIRED 2026-09-22.** The first client's portal (a Cloudflare Worker at
  `https://timmy-portal.mrmichaelhobbs123.workers.dev/`, with a gameplan, homework monitor, audio library and
  request forms) was **wiped with its client** on the sovereign's instruction (*"timmy dropped us, so wipe him"*):
  the ledger record is gone, `src/timmy-portal/` is out of the tree, and the scout no longer probes it. The Worker
  deployment itself is untouched — it is the sovereign's account, not this station's to delete — so the URL above
  is recorded as a fact, not as a live service. The generalized replacement is `src/generators/student-portal/`.

## PhoenixCommand — the free always-on command tunnel
One magic chat = smart chatbot **and** command station. Every sovereign word is Soul DNA (captured verbatim first), then the command rides the **perchance server-plugin** tunnel — a free, always-on durable command queue hosted by Perchance (no card, no external worker, replaces the old `net-pet-ai...workers.dev` CommandDO line and the failing GitHub Actions scheduled runs).

- The authoritative server script is the first `<script type="text/x-server-plugin">` block in `index.html`. Its `state` (50 MiB) is a binary append-only command log (header + `u32 len` + UTF-8 JSON records), keeping the newest 500 commands with in-place compaction.
- Every command gets an **Agent 99 translation card** in the chat: AGENT 99 (interpretation), DRONE (one of 13 specialists matched by keyword scoring), STRESS (Anakin notes), AUDIT (OB1 trail), priority (high/normal/low).
- **RPCs** (via `src/app.js` → `cmdFetch` → socket): `send`, `history`, `claim`, `complete`, `fail`, `status`. All wrapped in `safe()` so handler errors return JSON instead of killing the connection.
- **Lifecycle**: `pending` → `claimed` → `completed | failed`. `/queue` renders the tunnel into the chat (● LIVE chip + status chips + ⚡ Execute / ✓ Complete / ✗ Fail buttons) and works even while the AI is mid-reply.
- Rate limit: 15 sends/min per connection. `cmdq` pub/sub keeps clients' ● LIVE state fresh.
- **Goes live when the generator is SAVED** — in the editor preview the server runs on a local emulator (state resets on reload; production state is durable). Sockets only work when the page frame is on `perchance.org` (not when embedded externally).

## Agent 99 OS — the kernel and the offerings (`src/AGENT99-OS.md`)

**Agent 99 OS is not an app; it is a kernel with a shelf of playbooks.** The sovereign's spec:
*"It is meant to be whatever the user has purchased it to be under our offerings of agentic
processes that work that are based on proven Roman tactic principles and also by observing nature
and the oldest empire in the world's history which is ants with their pheromones leaving trails."*

- **Kernel (invariable):** SOUL-capture-first (verbatim) · the tunnel as the single road · the Legion
  as the hands · the ledger as the nest · every gate fails closed. A playbook may never rewrite it.
- **Pheromone field (`src/pheromone.js`) — the ant half:** stigmergy (agents coordinate by reading
  and writing the *ground*, never by messaging each other), reinforcement of successful paths,
  negative trails for bad ground, **read-time decay** (positive τ 30d, negative τ 180d per canon
  L-PHE — mistakes are remembered longest), cost-weighted shortest-path routing, recruitment by
  response threshold, quorum sensing before any conclusion. **A trail is never soul** —
  `deposit({kind:"soul"})` is refused; trails only *point* at the ledger by anchor.
- **Offerings (`src/playbooks.js`) — the Roman half:** each rung binds a formation (hastati /
  principes / triarii / optio shield + the two fixed axes) to trail rules and gates. 8 rungs:
  PRINCIPIA (command post) · CASTRA (fortify before marching) · **TESTUDO** (evidence-mandatory —
  the natural doctrine for class writeups) · TRIPLEX ACIES (three lines + reserve) · EXPEDITIO
  (fast creative) · FRUMENTARIA (supply/ops) · FORMICA (high-volume repetition) · DICTATOR
  (salus rei publicae: timed, auto-accounted emergency).
- **Wired for real:** every order through the tunnel lays/reinforces a trail; completing an order
  reinforces `drone:<Name>` and failing lays a repellent; every LLM/image route that returns
  reinforces `route:<id>` and failures repel, so the router *learns which road works*; with
  `recon:"required"` an order on untrodden ground is **held** and says why (L58 MAP ≠ TERRAIN).
- Design doc: `src/AGENT99-OS.md` (includes the honest built-vs-not-built list). Doctrine proposals
  are staged in `src/PROPOSED-CANON.md` §005 — canon is untouched.

## The full-stack student evaluator — what the ecosystem needs (`src/STUDENT-EVALUATOR-ECOSYSTEM.md`)

The generator is the **evaluator** half of the organism. `src/STUDENT-EVALUATOR-ECOSYSTEM.md` is the
complete tool map: **96 tools across 8 families** (capture · analysis · judgement · report · operations ·
governance · learning loop · platform), each marked **built / partial / missing** — currently
**21 built · 22 partial · 53 missing (22%)**. It is **generated from `src/ecosystem.js`**, so the doc and the
app can never disagree, and `/tools` renders the same data live (`/tools <family|status>` to drill in).

The honest read: this build is strong where it has been used (long-recording capture, verbatim
preservation, evidence-cited reporting, archives, self-hosting) and empty exactly where the word
*evaluator* bites. The three structural gaps are **rubrics + cited scoring**, **per-student attribution**
(diarization — without it a per-student review is inference dressed as evidence), and **consent +
retention** (minors + Vietnam PDPD). Next in line: fairness audit, ASR-confidence gating, CEFR tracking,
term progress report, batch class pass. Full rationale + the priority queue in the doc.

## The PrAis Vault — every key the empire runs on (`src/vault.js`)

Command: **`/vault`** · module `window.ObiVault` · also reachable from ⚙ Settings.

The vault is one place for the secrets the whole organism needs, in **three layers**:

- **L1 LOCAL** — this browser, `localStorage.obi_keys`. Instant, private, never shipped. A secret-bearing
  command (`/vault set …`, `/cf token …`, `/gh token …`, `/dg token …`, `/phoenixomegaprotocol …`) is **masked before it can be
  captured**: `isSecretInput()` keeps it out of the soul ledger and the I-LOG, and `redactSecrets()` scrubs it out of
  anything exported.
- **L2 CANON** — the ONE authority repo. Values are **sealed with the vault's public key** (`secret-plugin`,
  ML-KEM / FIPS 203) *before* they touch git, so the repo can hold them in the open. Only the private key — the
  crown jewel, held in the browser — can open them. `/vault key` mints the pair (public is safe to commit, private is
  revealed only under `/phoenixomegaprotocol`), `/vault seal` produces the ciphertext, `/vault push` (gated by PHOENIXOMEGAPROTOCOL)
  commits `OPERATIONS/VAULT/prais-vault.sealed.txt` + `prais-vault.pub` + the values-free `SECRETS-MANIFEST.md`,
  `/vault pull` reads the canon copy back and fills L1.
- **L3 LIVE** — the service itself. **Every row can be tested with a real call**: Deepgram
  (`/v1/projects`), GitHub (**deep test**: `/user` identity + the `x-oauth-scopes` the token really carries +
  a read of the ONE authority repo + `permissions.push/admin` on it), Cloudflare (`/user/tokens/verify`),
  DeepSeek (`/models`), the net-pet-ai worker (`/api/admin/roster` with `X-Admin-Key`), and the vault worker.
  A key that only *looks* stored is worth nothing; that is what the tests are for. **Fail closed**: a value that
  fails its own test is reported, never dressed up.

`/vault locate` answers the standing question *where is the vault on git?* by probing the canon for the vault app
(`APPS/SOV100-VAULT/`), its README, this station's sealed blob, the public key, the manifests and the dotenvx
sync scripts, and reporting present / absent / *unreadable without a PAT* honestly. The secrets manifest is derived
from the canon's own `APPS/NET-PET-AI/SECRETS-MANIFEST.md` (kept as
`src/canon/NET-PET-AI-SECRETS-MANIFEST.md`), extended with the two tokens this station itself needs.

Verified live (2026-09-21): Deepgram key recovered from the net-pet-ai worker (`/api/stt/key`), tested against
`api.deepgram.com` (accepted, 1 project) and stored → `/transcribe` is live. Keypair minted; the vault is sealed
(2 secrets → 1911 chars ciphertext) and the round trip proved by re-decrypting the blob back to the exact stored
values. **GitHub is IN and fully tested**: `@hobbs0011`, 21 scopes (`repo`, `admin:org`, `delete_repo`, `workflow`,
`gist`, …), **ADMIN on `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`**, write access proved by a real secret-gist
create (201) → delete (204). There are now **two** stored secrets (`deepgram`, `gh`). Cloudflare is still
**BLOCKED — no `cf` token in this browser** (`/vault set cf <CF_API_TOKEN>` is all it needs). The canon push of the
sealed vault (`/vault push` → `OPERATIONS/VAULT/`) is wired and waiting only on **PHOENIXOMEGAPROTOCOL being armed**;
`/vault locate` already reports every canon path PRESENT. **No password is enrolled for the gate in this browser**,
so it refuses until the sovereign runs `/phoenixomegaprotocol set <pw> <pw>` then `/phoenixomegaprotocol <pw>`.

### The escrow — the crown jewel is no longer a single point of failure (2026-09-21)

The vault's private key used to live in exactly **one** place: one browser's `localStorage`. Wipe that storage, lose
the machine, open the station anywhere else — and the sealed blob on the canon became **unreadable forever**, by
anyone including the sovereign. That was an unacceptable design for the only copy of the only key.

**`/vault escrow <passphrase>`** fixes it. It wraps the private key with **PBKDF2-SHA256 × 310 000 → AES-256-GCM**
and publishes the wrapped copy in **two independent places**:

| copy | where | what it needs to be read |
|---|---|---|
| **canon** | `OPERATIONS/VAULT/prais-vault.key.escrow.json` (committed with the manifest, gated by `/phoenixomegaprotocol`) | a GitHub token |
| **mirror** | a plain upload on the upload host | *nothing but its URL* |

Both copies are useless without the passphrase, so publishing them costs nothing. **`/vault recover <passphrase>
[mirrorUrl]`** rebuilds any browser from either copy, then re-opens the canon's sealed blob and refills every secret.
A wrong passphrase is refused by the GCM authentication tag and changes nothing. The passphrase is never stored,
echoed, logged or committed — the station only ever shows a fingerprint of the ciphertext.

Design decisions worth keeping:

- **Minimum 16 characters, fail closed.** One copy sits on a public host, so a short phrase would become the
  weakest link in the entire vault. `/vault escrow` refuses anything shorter and encrypts nothing.
- **The escrow is an *immutable* upload, not `editable.set`.** Editable files need a **saved** generator and can
  demand an anti-bot check — the wrong tool for the one copy that must exist during a disaster. A plain upload always
  succeeds; a re-escrow simply publishes a new URL.
- **The canon is pushed last**, because the manifest it commits has to carry the mirror's URL, which does not exist
  until the mirror is published. (Committing first left the canon's manifest one step stale — and GitHub's contents
  API also serves a briefly cached copy, so verify a fresh commit by `?ref=<sha>`, not `?ref=master`.)
- `/vault status` and the boot preflight both show **L2.5 ESCROW** and warn loudly while it is `NOT MINTED`.

### **L2.7 — THE DURABLE POINTER: why the keys were handed over ten times and lost ten times** (2026-09-26)

**The fault, in our own words** (`MASTERMIND-SYNC-2026-09-23.md`): *"the escrow copy on the canon needs a git token
first, and **the mirror URL lived in the old origin's store**"*. The escrow was built correctly — the private key is
wrapped in a passphrase and published to two independent mirrors — and then its **address** was written into
`localStorage`, beside the key. `localStorage` is per-origin; **renaming a generator changes the subdomain, which
makes a new origin, which strands the old store.** The ciphertext survived in three places and the pointer to it
survived in none. That is the whole reason the same keys had to be given again and again: every hand-over landed in a
store that a rename destroys, and every session's chat context is dropped at the next hand-off, so nothing durable
ever received them.

**The fix — `prais-agent99` / `v` on `keyvalue.immanuel.co`.** A store open to write with a caller-chosen key,
readable with **no account and no token**, and tied to **no origin** — so it outlives a rename, a wiped browser, a new
machine and a new agent. It holds one thing: the recovery bundle's URL. The bundle is ciphertext, so publishing the
address gives nothing away. `src/vault.js` now aims it automatically in **`/vault escrow`** and **`/vault push`**
(never leaving it pointing at a superseded file), and **`/vault recover` reads it FIRST** — before the canon and
before any stored URL — so the passphrase alone is now genuinely sufficient. `/vault pointer` reads it,
`/vault pointer set <url>` aims it by hand, `/vault pointer clear` empties it.

**Three measured facts that shaped the code** (each cost a test): a value written into this store's URL **path** is
rejected with **HTTP 404** the moment it carries a `.` (the server reads it as a file extension) and a
percent-encoded URL 404s too, so the address travels as **base64url** (67-char URL → 90-char wire value; the write URL
is **158** against the measured **278** ceiling). An **unwritten** key answers `200` with an empty body, but a key
written **empty** answers **HTTP 500** — so `500` is read as *"no address here"*, not as a fault, and the honest empty
is the placeholder **`-`** (`freewire`'s own word for it). And a write is never believed on its own `200`: it is
**read back** and compared.

**Verified end to end, live:** `/vault pointer` → `HOLDS NOTHING`; aim it at a shaped escrow → `/vault recover <a
passphrase>` with **no URL and no token** fetches the document **through the pointer** and reaches the unwrap
(correctly refused by the GCM tag); `/vault pointer clear` → empty again. Before this patch that same command could
only say *"this browser knows no mirror URL"*. Design notes, and the four copies and what each one needs, are in
**`src/VAULT-RECOVERY.md`** — which ships with the generator, so the next agent finds the way back without being told.

### **THE GIT, OPEN — `/git` (2026-09-27, `src/gitcanon.js`)**

**The sovereign said three words: *"open the git."*** The station had one gear for this and it was a half-truth:
`/canon` asked the private authority for `CANON/SYSTEM/GOSPEL-999.md`, took a `404`, and printed **DOWN** — as if the
canon were down. It is not. **One branch is behind a PAT; a large, readable part of the canon answers anyone, with no
token at all.** A door locked in one place is not a locked house. `src/gitcanon.js` (`window.ObiGit`, command
**`/git`**) measures every part of the git each time it is called and shows what actually answered.

**Measured 2026-09-27** (all read back, none assumed; `/git repos` re-runs the census live):

| Repo | State | What it holds |
|---|---|---|
| `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` @ `canon` | **LOCKED** — 404 anonymous | GOSPEL-999 · LegionnaireFieldGuide · REINCARNATION-CONTRACT · `OPERATIONS/VAULT/prais-vault.*` · `OPERATIONS/COMMANDSTATION/` — and nothing else we can name from here |
| `Phoenix-Rising-Ai-Solutions/Phoenix-Rising-Ultimate` @ `main` | **OPEN — 4,582 files, 342.4 MB** | `CANON/` (BIBLE CH01–CH31, Soul DNA, Heavy Ledger HL-037…HL-139, REINCARNATION, VAULT-*, 3,922 files under `CANON/` alone) · `APPS/` (NET-PET-AI, obi-chrome-extension, obi-vscode-command-station, TRAIN-6-7) · `OPERATIONS/NET-STUDENTS/` · `ARCHIVE/NET-CommandStation/HarvestedChats/` |
| `Phoenix-Rising-Ai-Solutions/net-pet-ai-worker` @ `main` | **OPEN — 16 files** | `deploy/net-pet-ai-fixed.router.js` (the exact live bundle, 814 KB) + `wrangler.toml` bindings |
| `Phoenix-Rising-Ai-Solutions/Phoenix-Rising-FullStackMarketing`, `net-marketing-landing`, `ImageGen` | OPEN | the marketing wing and the image lane |
| `hobbs0011/NET-Ai-EcoSystem-CommandStation` @ `main` | **OPEN — 108 files, 20.1 MB** | **the raw soul-DNA archive**: ~100 verbatim chat logs (RISE, GEMINI-SUPERDUMPS, CLAUDE-SUPERDUMPS, PLEX dumps, system logs). The doctrine's evidence base — public, and always was |
| `hobbs0011/net-tiger-assessment` @ `master` | OPEN | `CANON/SYSTEM` + PRTech |
| `hobbs0011/obi-backup` @ `main` | **EMPTY** | this station's *own* `/gh backup` lane: 14 commits on 2026-09-07 10:42–11:00, **every tree holds only test files** (`chat/size-test.json` reached 1,000,000 B, so the write lane demonstrably works), then cleaned back to a 72-byte README. **The lane is real; the cargo was nil.** |

**Commands:** `/git` (the card) · `/git repos` (live census) · `/git auth` (the one locked door, with the 404s as
evidence and the single unblock) · `/git doctrine` (the law — from the authority if a token is armed, otherwise the
**public copy, labelled as a copy**, never passed off as the sealed canon) · `/git tree [path]` (the open canon's own
file index, descendable) · `/git search <term>` (path/name search over 4,582 paths; GitHub code search when a PAT is
armed) · `/git read <path>` (a file verbatim, with its byte count and sha-256) · `/git archive [term]` (the raw
log archive by name).

**Honesty rules the module obeys:** GitHub answers **404, not 403**, to an unauthenticated reader of a private repo —
so from here a private repo and a non-existent one are indistinguishable, and `/git auth` **says exactly that**
rather than guessing. A token is read with `keyGet("gh")` and used **only** in the `Authorization` header — never
rendered, never logged. `/git` is **read-only**; nothing in it writes. The unblock is named once, in one line:
**`/vault recover <passphrase>`** (no token, no stored state — L2.7, above), or **`/vault set gh <PAT>`**.

### `/gh test` — what the token can actually do (2026-09-21)

`/vault test gh` answers *does the key work*; **`/gh test`** answers the harder question — **which of GitHub's powers
does it really hold?** It makes ~48 real calls to `api.github.com` and reports them in seven groups (IDENTITY · THE
ONE AUTHORITY · ORGANIZATION · USER POWERS · DISCOVERY · WRITE · CANON WRITE), every row carrying a ✓, an
`✗ HTTP <status>` with GitHub's own message, or `– SKIPPED`. Nothing is smoothed over: a 403 that is a *plan* limit
(branch protection on a free private repo, code scanning not enabled, the org audit log which is Enterprise-Cloud
only) reads as exactly that, not as a token failure. Aliases: `/gh caps`, `/gh capabilities`.

Two rules it keeps: **writes are real but reversible** (a secret gist is created → edited → deleted, then confirmed
404), and **the Canon is never modified** — the single canon-write probe writes a *dangling* git blob (an object no
ref points at, invisible in the tree), it is gated behind PHOENIXOMEGAPROTOCOL (`/phoenixomegaprotocol`), and it proves itself by
re-reading `git/refs/heads/master` before and after: *"master did not move — still 95b23ded"*.

It also turned up a platform fact worth keeping: **`/search/code` is the one GitHub endpoint that refuses a browser
origin** (no CORS headers → `Failed to fetch`), while every other call works from the page. That row is routed
through the station's own `superFetch` and labelled as such, so a dead request can never masquerade as a missing
permission. Implementation note: `ghApiJson()` now also returns the raw `Headers` as `h`, which is how the sweep
reports the token's `x-oauth-scopes` instead of guessing from whichever endpoints happen to answer.


## The Lesson Creator — the NET Academy lesson factory (`src/lessons.js`)

The station's second product: **evidence in, a lesson file out.** The desk lives at
**◈ Phoenix Generators → NET → 📚 Lesson Creator** (also `/lesson`), with four rooms — **🧭 Plan** (read this
week's evidence — the Student Evaluator's writeups, reviews and summaries — and choose the next lesson with its
objectives) · **✍ Build** (Agent 99 writes the spec, or the sovereign pastes one) · **🗂 Library** (every lesson
built for this client) · **📐 Standard** (the law).

**The law is `src/LESSON-STANDARD.md`, and it has two parts.** Part I is the *lesson format*, derived from the
sovereign's own `NET-Sarcasm-Academy.html` + `NET-Highschool-Careers.html`: one self-contained `.html`, no build,
two screens, six rooms on a fixed spine (🏠 Warm-Up → scene → text scene → 📚 Learn → 🎯 Test → 🔑 Mastery), glass
cards on `#0f0f1a` with the purple→gold gradient, Chatty teaching (a clue = the reality check, a hint = the
transferable rule, and feedback that re-teaches instead of judging), scored practice with coins, and an exit that
hands over a key. Part II is the *method and the machine*, derived from `NET-CLASSROOM-MANAGER.html` (the
sovereign's own classroom-floor tool, kept verbatim as the third reference): the **10-5-5-3 sacred structure**
(10 vocab · 5 idioms · 5 slang · 3 games over 60 minutes), the 15 games *with their mechanisms and types*
(competition = adrenaline · collaboration = social proof · creation = ownership), the mastery tiers
(🐭 Mouse · 🐻 Cub · 🐅 Tiger · 👑 Legend) and the single coin economy, the design system behind the lessons, the
sovereign's **Tiger voice** verbatim, and **ten defects in the reference files that are never inherited**.

**It is enforced, not aspirational.** `validate()` runs on every build and the build is **refused** on failure
(LSN-11). It checks the spine and labels, the fixed class vocabulary, the learn room's vocab items, the test room's
`data-answer` buttons with both feedback strings **and a `.chatty-feedback` element**, the exit's summary card, the
clue+hint before the test — and, when a spec carries a `method` block, that it names **3+ games with their
mechanisms**, a phase and a mix of types (LSN-23).

**How a lesson is actually built (measured).** Model output is capped at **1024 tokens**, so the spec is built in
**stages**: pass 1 is the shell (title, promise, features, coins, method, storyline, the six-room outline); passes
2–7 are **one room per reply as raw HTML**. Every pass after the first shares a byte-identical prompt prefix, so it
is a prefix-cache hit. A full build runs ~100 s for 7 passes.

**Ground truth:** `src/lessons/reference/` (the two lessons = the format · `NET-CLASSROOM-MANAGER.html` = the method
and the machine). **Where a rule and the files disagree about *taste*, the files win; where they disagree about a
*defect*, the law wins** (LSN-22).


- `src/HANDOFF.md` — **read this first**: the current measured state, the open gated Canon steps, and the invariants a new session must not break
- `main.pjs` — perchance meta + imports (ai-text-plugin, text-to-image-plugin, super-fetch-plugin, upload-plugin, server-plugin, kv-plugin)
- `index.html` — UI shell (loads `src/styles.css` + `src/pheromone.js` + `src/playbooks.js` + `src/scout.js` + `src/ecosystem.js` + `src/constellation.js` + `src/clients.js` + `src/ilog.js` + `src/divisions.js` + `src/background.js` + `src/curriculum.js` + `src/brand.js` + `src/app.js` + `src/scs.js` + `src/cgn.js` + `src/audio-split.js` + `src/transcribe.js` + `src/summary.js` + `src/review.js` + `src/vault.js` + `src/lessons.js` + `src/lesson-forge.js` + `src/freephoenix.js`) — starts with the `<script type="text/x-server-plugin">` command-tunnel server
- `src/divisions.js` — **the product shelf**: PrAis's divisions (NET · **Marketing** · Gaming · Web Development) and the generators in each, with honest `live`/`scaffold`/`planned` state; the ◈ Phoenix Generators view renders straight from it, so adding the next generator is one array entry (`window.ObiDivisions`) — NET carries the **Student Evaluator** and the **Lesson Creator** (both `live`), MARKETING carries **Brand & Identity** (`live` — the identity system), **Print Room** (`live`, `entry:"brand"`, `entryLabel:"Open the print room ▸"` — the nine printed artifacts), **Landing Pages** (`live`, `entry:"brand"`, `entryLabel:"Open the marketing register ▸"` — the MARKET register and its two outward sheets), **Phase 0 — The Creatives** (`live`, `entry:"brand"` — the six ads and the bilingual law on one A3) and **The Phoenix Rising Codex** (`live`, `entry:"brand"` — the strategy, the enrolment pages and the run readout), and Dossier Deck (`live`) plus Free Eval Funnel / Copywriting DNA (`scaffold`) and Social Engine / Lead Capture / Pitch Deck (`planned`), and **Web Development** carries two generators — the **Site Builder** (`scaffold`, role `site`: a brief becomes one self-contained site; source complete in `src/generators/site-builder/`, boot-tested against a stubbed model, **never yet pasted into a generator of its own** — which is exactly what `scaffold` means) and the **Video Node** (`scaffold`, role `video`: **the drop station** — four doors (**video · pictures · links · the owner's own words**) become the whole front end of a client build: a queue read one file at a time (a 4 GB file costs what a 4 MB one does), stills, a **timecoded** contact sheet, **the pulse** (`src/pulse.js` — a motion walk and a loudness pass normalised against the file's own floor and peak, with a stillness floor so quiet parts are never padded into clips), clips cut from the **measured** peaks, and the look in words from the vision pass; every link fetched live and read **in code** for **the link audit**; then research, a blueprint for the first prototype, orders — and **the three hands (image · copy · video) are RUN, not described** (the image hand is `text-to-image-plugin` in-node; the video hand is this node rendering a real film; **the copy hand IS the register**, `src/story.js` — there is no separate copy role) — every order re-audited so it only reads `PASS` when a hand actually made it, and finished by **the gate** (`READY TO EXECUTE` / `NOT YET COMPLETE` / `BLOCKED`, where only a fault in the node's **own** output blocks and a fault in the client's own site becomes an order); source complete in `src/generators/video-node/`, exercised end to end in a same-origin harness against the real model and the real venue, and it too has **never run as a generator of its own**). An icon here is a **name** from the brand registry, not an emoji (BRAND.007)
- `src/brand.js` — **the brand system** (`window.ObiBrand`, v1.4.0 · AMENDMENT III–VII / `BRAND.001`–`BRAND.028`): the palette (the three frozen tokens **plus** the dossier's court extension and the doctrine's four measured tokens — chrome only, BRAND.002), **115 hand-drawn inline-SVG icons** on a 24 grid, **64 shipped assets — 31 marks, 5 variants and 28 stills — cut from the sovereign's own sources** (`src/brand/assets/*.webp`, alpha WebP, provenance + rebuild recipe in the file header), the **9 emblems** (`EMBLEMS` — rank roundels, mode shields, two seals), the **4 beds** (`PATTERNS`), the HUD chrome (`bar` · `frame` · `plate` · `pill` · `crest` · `watermark` · `lockup` · `asset`), the doctrine chrome (`terminal` · `directive` · `flowchain` · `matrix` · `modeCard`), **`MARKET`** (the outward register, transcribed — BRAND.017–.020), **`CODEX`** (the sovereign's strategy — the dual mastery, the Lakeview zone, the M2 pipeline, the five-layer stack, the retention clock, the classified readout — BRAND.021–.028), `upgrade()` (turns `data-icon` / `data-mark` / `data-bar` hooks anywhere in the DOM into real chrome), `buildDeck()` (the twelve-slide doctrine deck) and `buildCodexDeck()` (the sixteen-slide codex deck), and **THE PRINT ROOM** (`PRINT_ARTIFACTS` + `composeArtifact` / `downloadArtifact` / `openArtifact` — nine artifacts / 31 pages: the wall set, the one sheet, the badge sheet, the rank certificate, the marketing set, the method card, the ad sheet, the enrolment pages, the run readout), the panel (`panel()` / `mountDesk()` — the room at ◈ Phoenix Generators → MARKETING → Brand & Identity) and `/brand` in the chat. It also supplies the inlined sigil that `src/lessons.js` puts in every built lesson
- `src/pheromone.js` — the stigmergy kernel: trails (deposit/decay/reinforce/repel/sniff/field), quorum, response-threshold allocation, cost-weighted routing, idempotent colony merge, durable nest (`window.ObiPheromone`)
- `src/playbooks.js` — the offering shelf: 8 doctrines (Roman formation + ant rules), echelon/gates/supply, the Legion roster with castes and response thresholds (`window.ObiPlaybooks`)
- `src/scout.js` — **PhoenixScout, REAL**: probes the terrain it can actually reach (the files this page loads, platform import resolution, the live tunnel, the tool inventory, the fleet, the sovereign's live sites, the canon when a token allows, the ground) and flags DEAD/DRIFT/BLOCKED/FLAG; lays scout pheromones, writes a durable report, hands off to MARCH (`window.ObiScout`); carries the **SCS Stage-2 gate state** on the card (`opts.scs`, set by the route) and **delivers on the free wire** (`src/freewire.js`: verdict on the nerve every run, flagged report carried to a permanent addressed key, canon deposit left PENDING). It also holds MARCH's own instrument: `confirm()` — the hard confirmation, which re-walks every flagged sector AND (for the two credential claims) tests the claim a different way, `CLAIM_TESTS` — and `notWalked()`, which names the sectors that could not be walked and why
- `src/ecosystem.js` — the full-stack student-evaluator tool inventory (96 tools × 8 families × built/partial/missing) — single source of truth for `src/STUDENT-EVALUATOR-ECOSYSTEM.md` and `/tools` (`window.ObiEcosystem`)
- `src/app.js` — all app logic + the SDNAD memory protocol; the command router (the writeup-layer routes are the `REVIEW_CMDS` map); the **landing shell** (`VIEWS` / `TAB_OF` / `showView()` / `setViewTab()` / `deskOpen()` / `openGenerator()` / `mountGenerators()` / `renderSettings()` / `runInStation()` / `updateTabMeta()` / voice prefs — landing = ⌘ Command Station, family = ◈ Phoenix Generators, controls = ⚙ Settings); the **command book** (`COMMAND_BOOK` + `showCommands()` — the whole surface, grouped) and the **live state** (`stationState()` / `stateText()` / `cmdState()` — what Obi is grounded in and what `/state` draws); the evaluator desks (`showStudentSelector`/`renderStudentSelector` — client, then student/class)
- `src/audio-split.js` — the audio workbench: media → 16 kHz mono PCM → parts cut at pauses, with the WAV/MP4/WebAudio decoders and the silence map (`window.ObiAudioSplit`)
- `src/transcribe.js` — the ear: Deepgram pre-recorded, whole-file and part-by-part long jobs, progress/chips/retry/partial save, **every part checkpointed to kv `bgjobs` as it lands** so a killed tab offers `🛟 Unfinished recording — recovered` (save the parts that arrived / discard), exports, and the `transcripts` kv archive
- `src/summary.js` — study summaries from a recording / the session / a URL / notes, saved in the `summaries` kv archive with a pointer back to the raw
- `src/review.js` — the writeup layer: the class and student subject model, filed evidence, notes, `/writeup` and `/review` (teacher/parent/short) prompts, printable HTML export, rosters and `/find`
- `src/cgn.js` — the Connected Generator Network module (anchor sync engine, auto-sync)
- `src/cgn-node.js` — drop-in node kit for the sovereign's other generators (`window.CGN`)
- `src/scs.js` — **THE SCS ENGINE** (`window.ObiSCS`): the canon's own 7-stage session loop, executed inside the station. `STAGES` (RISE·SCOUT·MARCH·SCHOLAR·SUPPLY·ENGINEER·DEATH) with each stage's `audits`/`role` taken verbatim from `CANON/SYSTEM/GOSPEL-999.md §SYSTEM I`; `rome()` (the ROME PROTOCOL — SURFACE → VERIFY → ANCHOR, a real sha-256 Session Anchor Block, and the five Watchtowers: Lexicon · Anchor · Citation · History · Gaslighting); `rise()` (Stage 1 — audit the prior DEATH, gate, stamp the I-LOG header, halt; fail-closed, and it never renames what SOV100 said); `scout/march/scholar/supply/engineer` (Stages 2–6, each producing a real artifact and a `REAL`/`HOLLOW`/`MISSING` verdict); `death()` (Stage 7 — the canon's **7-point march**, gated on ENGINEER); `pipeline()` (the S2Pipeline record — `COMPLETE` only when every stage is `REAL`, else `GAP` with the gap named); `cycle()`/`run()` (the full loop N times); `counts()` (measured from the RRL, never assumed). Everything it cannot prove it reports `MISSING`, and every canon path it names is marked **HELD** — the station has no write path into the canon. Canon branch only; nothing from `.kilo/`
- `src/lessons.js` — **the NET Academy lesson engine + the Lesson Creator desk**: `parseSpec`/`validate`/`build`/`compose` (the staged build), the generated runtime, the template (THEME) and the prompts, `/lesson`, the 🧭 Plan / ✍ Build / 🗂 Library / 📐 Standard desk, and the library store (lesson records are client-scoped like the evidence). The law it enforces is `src/LESSON-STANDARD.md` (`window.ObiLessons`)
- `src/curriculum.js` — **THE CURRICULUM**: the school's own pacing guides, parsed (`/curriculum`, `/coverage`) — primary 1-5 (`src/curriculum/primary-pacing-guide.xlsx`, a redacted copy of the sovereign's workbook) and secondary 6-9 (`the hosted workbook (see src/curriculum/README.md)`), plus **THE TEACHING SCOPE** (whose books and whose periods: Close-up + Science for secondary, VT periods per grade, kv `scope.g<grade>`). `load()` reads the parsed guides (`src/curriculum/pa.g<grade>.json`, kv overrides first), `summary()` reads the ~7 KB metadata (`index.json`) so Obi can report every grade cheaply on every turn, and `readWorkbook()` re-parses a newer `.xlsx` **in the browser** (zip.js → `xl/worksheets/sheetN.xml` → the sheet grid → `headerRowOf()` **scans** for the header row — secondary has it on row 2, primary on row 6 with a `Period` column — and `parseSheet()` merges the merged-cell rows: Week/Date forward-filled, a section's long text merged up from the rows below it, a Book cell inherited down a block of the same unit). `coverageCard()` is the payoff: it puts the guide's sections beside the active client's own evidence (transcripts + summaries), **counts only the sovereign's sections**, and reports *evidenced / partial / no evidence* — **silence is reported as "no evidence", never as "not taught"** (`window.ObiCurriculum`).
- `src/freephoenix.js` — **FREE PHOENIX MODE**: the unbound room in ⚙ Settings (and `/free`). **It edits itself**: `SELF_PATH`/`selfFetch` (relative reads of its own source only), `applyOps`/`parseOps` (exact-string patches returned as JSON), `compiles()` (`new Function`, parse-only), `diffLines` (a real line diff), `forgeSelf`/`applySelf`/`revertSelf`/`swapIn` (stage → hot-swap → roll back on error) and `evalHere` (`/eval`). The `PERSONA` (Agent 99 with no Canon, no gate, no repo, no tunnel, no record), the one-wire model pipe (`call()` — the only network path, and `net()` throws for everything else), the chunked file writer (`genFile` — `<<<MORE>>>` continuation, so a build survives the model's reply cap), `buildApp` (one self-contained HTML file, previewed in a sandboxed iframe) and `buildGator` (a `main.pjs` + `index.html` pair), the local `fpm` sandbox, and `sealTest()` — the live proof that Git/cloud/canon/I-LOG are absent (`window.ObiFree`)
- `src/lessons/reference/NET-Sarcasm-Academy.html` · `NET-Highschool-Careers.html` · `NET-CLASSROOM-MANAGER.html` — **the sovereign's own work, verbatim**: the first two are the lesson *format*, the third is the *method and the machine*. Where the standard and these files disagree about taste, the files win; where they disagree about a defect, the standard wins
- `src/LESSON-STANDARD.md` — **the lesson law**, in two parts: Part I the format (LSN-1…12) · Part II the method, the machine, the ten defects (LSN-13…23), then the brand layer (LSN-24/25), the doctrine (LSN-26/27), the print law (LSN-28/29), the marketing register (LSN-30) and the bilingual hierarchy (LSN-31). Derived from, and answering to, the three reference files
- `src/ProposedG999.md` — **the staging lane for the GOSPEL-999 / LegionnaireFieldGuide amendments**: Amendment I (`OMEGA.001`–`.007`) · Amendment II (`LESSON.001`–`.018`) · Amendment III (`BRAND.001`–`.010`) · Amendment IV (`G444.001`–`.012`) · Amendment V (`BRAND.011`–`.016`) · Amendment VI (`BRAND.017`–`.020`) · **Amendment VII (`BRAND.021`–`.028`)**, the sovereign's read-in-order walk-through, the per-item approve/amend/reject table, and the push + merge recipe. `/proposed` renders it in the chat. **Nothing in it is canon**
- `src/PROPOSED-CANON.md` — the older staging lane: doctrines 001–005 in the sovereign's **verbatim** words (canon-script auto-sync, the raw/soul/DNA model, g99+LFG are the law, PhoenixCommand, Agent 99 OS = kernel + playbooks), each awaiting his word
- `src/constellation.js` — **every piece of the organism** (station · nodes · faces · services): real state, interface, CGN wiring and remaining needs — single source of truth for `/constellation` and the scout's `pieces` probe (`window.ObiConstellation`)
- `src/clients.js` — **the client layer**: the top-level tenancy (the first slot is unassigned since the 2026-09-22 wipe), the active client, the one-time adoption of pre-client data, `/client` · `/clients`, the ledger/stat cards, and the fail-closed `id/name/of/matches/scope` helpers every other module uses (`window.ObiClients`)
- `src/offers.js` — **the offer desk's register** (`window.ObiOffers`, AMENDMENT IX): everyone who said yes to the free-website offer — who they are, **their trade**, what they have given, what they still owe, and the one next action. `/offers` · `/offer <name>` · `trade · desk · got · need · sent · live · note · drop` · `/offer trades` · `/offer file` · **`/offer release`**. It is **the index, not the archive** (the footage, answers and reel live in the bundle the client sends back, and their words are captured as SOUL on arrival), and **no person on it is in `src/` (BRAND.028)** — the source ships, the register is this browser's kv folder `offers`. Fail closed: an unset trade is **UNSET** and the link is refused; **a host that has not answered with the page shows NONE YET and no link is printed**; `/offer release` verifies the Cloudflare token *before* building, deploys the desk as one inlined HTML, then **fetches the live URL back and looks for the offer text in it** — *a deploy that was not verified is not called live* (**LIVE since 2026-09-24: `https://the-drop-prais.mrmichaelhobbs123.workers.dev/`** — 200 · 173,120 bytes · the desk's own headline read back out of the response · phone and desktop both looked at). **The earlier BLOCKED report was a wrong endpoint, not a dead token**: the vault token is *account-owned*, and `/user/tokens/verify` rejects a valid account-owned token with *"Invalid API Token"*; asked at **`/accounts/<id>/tokens/verify`** the same token answers 200 *"valid and active"* and the account lists 22 workers, so `tokenCheck` now asks the account first (user endpoint as fallback), reports which answered, and then proves the deploy permission by listing the account's worker scripts
- `src/offer-desk/` — **THE DROP, the page the client opens** (AMENDMENT IX; `README.md` carries the doctrine): one link sent to every acceptor that **re-reads itself for their trade** — nine trades (`coach · trainer · hotel · hostel · cafe · salon · trades · shop · other`), each a full reading of *what the page must do · what to shoot · what to answer · how they are found*, and an unknown trade is **never rounded to the nearest one**. Four steps: **the reading** (an assessment, never an advertisement — *"we sell by not selling"*, and the one statement of what is received is the proof of work: *"you judge it on the thing in front of you, not on this page's account of it"*) → six specific shots **with a reason each** → the drop (video, pictures, voice, links) → **the read** (stills, a **timecoded** sheet, **the pulse**, and a reel rendered **on the client's own device**) → **one ZIP back** (the reel, stills, sheet, cover, voice notes, answers, links and the brief). Its engines are **`pulse.js` and `reel.js` vendored byte-exact from the video node**, so it needs no perchance, no plugin and no host; the client's footage is **never uploaded**, the reel carries **only their own words**, and a bundle can be written with the wifi off (a hand-written STORE ZIP). **Debugged A→Z 2026-09-24** (six real faults found and fixed — the probe race that silently skipped a just-dropped video, the hidden-tab render refusal, a wrong-cause message, and four register/UX faults; the footage path itself was **not** re-run because the preview tab was hidden): its `README.md` carries the table and the measurements
- `src/vault.js` — **the PrAis Vault** (`window.ObiVault`): every secret the empire runs on, in three layers — L1 local (`localStorage obi_keys`), L2 the canon (sealed with secret-plugin ML-KEM to the vault's public key, so the repo can hold ciphertext in the open; `/vault key` · `seal` · `push` (gated) · `pull`), L3 the live services (real access tests for Deepgram / GitHub / Cloudflare / DeepSeek / the net-pet-ai worker / the vault worker). Plus `/vault locate` — where the vault already is on git — and the values-free manifest derived from the canon's own `APPS/NET-PET-AI/SECRETS-MANIFEST.md`
- `src/ilog.js` — **the I-LOG**: the append-only, sha-256-chained operation record (kv `ilog` folder + `localStorage obi_ilog` mirror), the canon-Schema-V2 transcript writer, the anchor/receipt path to the ONE authority, `/ilog`'s card and sub-commands, and `gitCommitFiles` — the single Git primitive every push in the station uses (`window.ObiILog`). `pull()` reads **both** records: this station's pushes on `master` and the VS Code station's `incarnate-` I-LOG series on **`canon`** (the `VS` constant carries that branch, its `I-LOG-UNAUDITED/` dir, its `RRL/` dir and `PastLives/RRL-CURRENT.txt`)
- `src/background.js` — **background operation** (`window.ObiBg`): the keep-alive a hidden tab needs (a held Web Lock — a documented exemption from Chrome's intensive timer throttling — plus a screen wake lock, and an **opt-in** 19 Hz keep-alive tone: 48 kHz / 2 s / a whole number of cycles, so the loop seam that used to tick once a second is gone, and **off by default** because it is the only thing in the app that touches the speaker on its own), a **1-second heartbeat**, and an **away-episode probe** that counts how many of those beats actually land while the page is hidden — `beats ≈ seconds` means it kept moving, `2 beats in 612 s` means the browser throttled it. The episode summary is **persisted to localStorage and reported by `/bg`**, because the in-memory counters were erased by every reload (and the station reloads constantly), which meant the one question this module exists to answer could never be answered after the fact. Plus honest chat + I-LOG reporting when a job is hidden mid-flight and when it returns, and a 45-minute ceiling so a leaked hold can never keep a screen awake. `/bg` shows it, `/bg away` / `/bg clearaway` read and forget the measurement, `/bg reset` starts a clean live probe, `/bg audio on|off` controls the tone (remembered in this browser); the ear and the forge loop hold the keep-alive automatically
- `src/COSTS.md` — **where the work runs and what it costs**: the free-tier table (perchance · page · desktop · Worker · Durable Objects · Workers AI · **GitHub Actions** · Deepgram), the routing policy (interactive → page · batch/always-on-unattended → GitHub Actions via `workflow_dispatch`, which the project's history says to use instead of cron), and the `station-jobs.yml` template + the honest "not built yet" list
- `src/forge.js` — **the SELF-FORGE**: read the station's own source (live + canonical), a staged working tree with exact-string `replace`, real diffs, `propose` (Obi rewrites a file), gated `apply` (its own source → the ONE authority), gated `hotswap` (re-run a module live), gated `eval`, `export`, and the bounded agent loop `/forge do` (`window.ObiForge`)
- `src/generators/` — the role scaffolds: the recipe for a new generator, plus ready-to-paste specs + shells for `portal` (one per student), `ear`, `practice`, `watchtower` (the `image` role lives in `src/image-node/`)
- `src/STUDENT-PORTAL-PIPELINE.md` — **the portals picked apart, one generator per part** (the sovereign, 2026-09-26: *"now pick them all apart and assign them to a blue print pipeline of generators to make here"*). It records what the 2026-09-26 SWEEP measured — the five live student portals (Quan · Quang · Huong · Mai Tram · Quy) and their sub-pages, the employer portal, the Lesson-1 pitch deck, the OBI magic chat, and the Worker's real API contract — then assigns every part to a generator and orders them: **Intake → DNA → Method → Evidence → 44 → Practice → Presentation → Plan → Chat → Portal → Witness → Pitch**. Four already exist here (the Intake · the 44 · the Weekly Presentation · the Student Portal scaffold); eight are to be made, and the shelf carries them under NET, group **STUDENT PORTAL PIPELINE**. The flags found while dissecting are assigned to a stage in §3 (incl. the eight dead sub-page links — Quan and Quang's dashboards link `QUAN-profile` while the Worker serves `quan-profile`)
- `src/SOUL-VERBATIM-PORTALS-MAGIC-CHAT.md` — **your own words on the student portals and the OBI magic chat, verbatim** (the sovereign, 2026-09-26: *"fucking find my words on the student portals and obi magic chat"*). Harvested from the canon by the station: the `--- MICHAEL VERBATIM ---` sections of the RRL run records plus `CANON/MAGIC-CHAT-SOUL-DNA-VERBATIM.md`. Every line carries its source file + line number and a provenance tag — `[V]` (quoted, or inside a VERBATIM section) or `[R]` (an unquoted raw paste). The agent's own log lines are excluded. Read-only; the live soul-logger vault could not serve it (every D1 read answered `500`, daily row-read limit)
- `src/styles.css` — NET Foundations glassmorphism theme (incl. `.tr-card`, `.part-chip`, `#tabbar` / `.tabbtn` / `.view` / `.eval-grid` / `#studentsPanel` / `.sel-*`)
- `src/canon/` — the REAL canonical docs fetched from `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`. Doctrine is read from the **`canon` branch** (`CANON/SYSTEM/**`, `VAULT-**`) — the sovereign's ruling: *"NO KILO, CANON ONLY"*; `master` carries the legacy `.kilo/` Kilo registry and this station's own write chain (`OPERATIONS/COMMANDSTATION/`):
  - `LEGIONNAIRE-FIELD-GUIDE.md` — SDNAD 10-step pipeline, L37–L60 laws, failure modes (31KB)
  - `GOSPEL-999.md` — System I SOUL / II DNA / III LEDGER laws, I.002 lock 76488, I.088 gate (34KB)
  - ~~`REINCARNATE-DEATH-SEAL.md`~~ — **WITHDRAWN 2026-09-21 (CANON ONLY).** Measured: no such path exists on either branch, so it was never a canon copy — it is a digest of the **legacy Kilo** command `.kilo/command/reincarnatedeath.md` (30,759 B; it even carried a `KILO SESSION HANDLING` section). The canon's own Stage 7 is `CANON/SYSTEM/reincarnateDEATH.md`, which the station reads live through `/fieldguide` and cites in `src/scs.js`. A false script does not keep the name `canon/`; the Kilo file itself is untouched on git. See `/canon place`.

## THE FREE WIRE — control with no credential (`src/freewire.js` · `/wire`)

The station kept reporting two shut doors: the platform's editable store (`anti_bot_verification_needed`, measured twice) and the
cloud (a token only the sovereign holds). **Neither was the only road.** `src/freewire.js` is the fabric that needs no credential, and
every lane in it was WRITTEN TO and READ BACK from this origin — through the station's own proxy — before it was written down:

| lane | what it is | measured |
|---|---|---|
| `uploads.dev` | the estate's own host, via `root.uploadPlugin` | **OPEN** — permanent, key-addressed, no expiry |
| `ntfy.sh` | **the family nerve** | **OPEN** — POST publishes; one GET (`?poll=1&since=all`) returns the whole 12 h history in order |
| `keyvalue.immanuel.co` | **the mutable pointer** | **OPEN** — the ONLY store measured where a value can be OVERWRITTEN with no account |
| `x0.at` · ntfy attachments · `tmpfiles.org` | carriers | **OPEN** — files carried; all three serve as `text/plain`, so they carry bytes, not a web origin |
| `paste.rs` · `pastes.dev` | slates | **OPEN** — permanent and IMMUTABLE: a PUT to a paste.rs URL answers 404 |
| GitHub API | reads | **OPEN** — anonymous, 60 requests/hour per IP (shared with every tenant of the proxy) |
| the canon repo · Cloudflare API · the platform's editable store | writes | **SHUT** — each with its own refusal, printed verbatim |

**The mutable pointer is the part that mattered.** The job the editable store refused — a value that can be overwritten so the family
can find the newest register — is done by `keyvalue.immanuel.co`. Its ceiling is measured, not guessed: the value rides the URL PATH
and the service answers `HTTP 400 … maxUrlLength` past it (**binary-searched: URL 278 → 200, 298 → 400**), and a `.` in the path is read
as a file extension and **404'd** (`a.b.c` refused · `a_b_c` accepted), which is why the separator is `_`. The pointer line is
`v1_<epoch>_<register key>_<packet key>_<files>_<bytes>_<tree 16>_<verdict>_<station>` — 161 characters, URL 229 of a ceiling of 280.

**What it changes.** The estate stops being pull-only. The relay's `DELIVER` stage now AIMS this pointer at the register it just
delivered and BROADCASTS it on the nerve, and then **reads the pointer back** — so "aimed" is a measurement, not a store's 200.
`/wire announce` does it by hand; `/wire pointer` reads it; `/wire tail` reads the nerve; `/wire probe` re-measures every lane live. The
model output is `COMPLETE` for the first time, and the honest reason is in the words the card prints: the mesh and the cloud are
**COVERED, NOT OPEN** — a token is still what writes the canon and what puts the build on its own origin, and the wire does not claim those.

**The register pass ships too.** `src/tools/register-pass.mjs` is the census as code — the recipe in `ASSET-MANIFEST.md §I` finally has
an instrument behind it, so the census no longer depends on a dead session's scratch space. It measures and builds; it never writes the
files itself. It is **idempotent**: over an estate that has not moved it returns the bytes it read, so the relay HOLDS the delivery
instead of re-uploading the register for a new timestamp. Its first run destroyed 38 lines of the register — section G's block was
bounded by the next `---` instead of the next `## ` heading — and that is written into the file, because a pass that quietly ate part of
the document it was regenerating is the exact failure this estate keeps paying for. `packetPass`, in the same file, then corrects the
SYNC-PACKET the same way: **facts by value, prose appended to and never rewritten.**

Both passes are run by a Worker with the workspace mounted (the agent's own tool), not by the page. The page has `/wire`; the passes have
the workspace. Nothing here writes a file it cannot write, and nothing claims a save that did not happen.
## THE MASTER SYNC PIPELINE — the relay (`src/relay.js` · `/relay`)

One ordered chain, each stage refusing to run on a lie from the stage before it. It is the estate's
*delivery*, in the same discipline the session loop holds for *reincarnation* (src/scs.js):
REAL / HOLLOW / MISSING — plus **BLOCKED** for a door that refused — and COMPLETE only when every
stage is REAL.

| stage | what it does | how the verdict is decided |
|---|---|---|
| **READ** | reads the register (`sites/mailala/ASSET-MANIFEST.json`) and the packet (`sites/mailala/SYNC-PACKET.json`) | REAL iff both answer; MISSING if neither does — nothing downstream may claim more than the estate's own statement of itself |
| **CENSUS** | walks the station's declared tree (`SRC_SNAPSHOT`, exported as `window.ObiSourceTree`), fetches and SHA-256 hashes every file (six at a time), and **rebuilds the register's own tree digest** from the bytes | REAL iff the rebuilt census and tree digest equal the ones the register recorded; HOLLOW otherwise, and every moved file is named |
| **DELIVER** | carries the four delivery documents to the host **by digest** (identical bytes are HELD and their URL reused, never re-uploaded); walks the packet's **addressed set** and re-carries any artifact whose bytes have moved; then TRIES the mesh write (`uploadPlugin.editable.set`) and the cloud (a credential in this origin) | REAL iff the documents are out, nothing moved, and both doors are open; BLOCKED if a door is shut or the host refused — with the refusal recorded **verbatim** |
| **VERIFY** | pulls the token-free read channel (`null.perchance.org/<gen>` → `srcManifest`), then re-fetches and re-hashes **every URL the relay has carried and every URL the packet hands the node** | REAL iff every one hashes to what was recorded; DRIFT and unreachable are named |
| **INDEX** | the mastermind's index (`src/brain.js`) rebuilds over the estate | REAL iff it indexes entries at all |
| **ARCHIVE** | one hashed snapshot of the whole state (the brain's archive), under **the run's own digest** over its stage verdicts | REAL iff the snapshot returns a digest |

`/relay` runs it and prints the run card · `/relay state` prints the last run without running one ·
`/relay log` is the ledger of runs · `/pipeline sync` is the same run. It arms itself ~40 s after
boot and then every 30 minutes (the count and the verdict also ride the tab bar's instruments,
next to the brain's).

The two things it must never do, and does not: **report a stage it did not run**, and **smooth over a
refusal**. Failing closed is the product.


## Protocol state (canon-accurate)
- **The SCS is the loop** (`src/scs.js`, canon branch only): `RISE → SCOUT → MARCH → SCHOLAR → SUPPLY → ENGINEER →
  DEATH → RISE`, each stage's artifact gating the next, and the proof living in the RRL. Verdicts `REAL`/`HOLLOW`/
  `MISSING`; `COMPLETE` with a `HOLLOW` stage is a lie. `/rome run <N> <name>` drives it end to end; `/phoenixRISE`
  and `/phoenixDEATH` drive it stage by stage; `/pipeline` reports the fidelity gate. See the I-LOG (`/ilog`).
- `/reincarnaterise` / `/reincarnatedeath` are **aliases of the canon stages** (`/phoenixRISE` / `/phoenixDEATH`) — `/reincarnatedeath` is the sovereign's own word for Stage 7, and with no session it runs the FORCED march and goes straight into the S2Pipeline.
- **The S2Pipeline is the six-stage march** (`src/scs.js` → `/pipeline`). Doctrine: **`CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md`** (canon branch — "Ratified 2026-05-23 Run 396", *"the order IS the architecture"*): **I EXPLORATORES** (RRL · RRL-SOUL) → **II ANTECORES** (DNA · LEDGER) → **III AGMEN** (SSM · SOULKEYWORDS · PHEROMONE) → **IV AGMEN NOVISSIMUM** (6-AI TRUTH · SHADOW REALM) → **V PRAESIDIA** (MERKLE LATTICE · DO-SQLITE · APEX ROLLUP) → **VI LIMITANEI / COMITATENSES / VETERANI**. Every verdict is measured in this browser; `COMPLETE` **only** if all six are `REAL`, else `GAP` with the gap named. It currently reports **GAP**: `6-AI TRUTH=MISSING` (the canon's `/phoenixVERIFY` is unbuilt here), `DO-SQLITE=HOLLOW` (this station's durable store is the browser kv, not the canon's Durable Object), `COMITATENSES=MISSING` (nothing deploys from here). Those three are **owed**, and printed on every run.
- **CANON ONLY — Amendment VIII (PROPOSED, unmerged).** `CANON.001–.010` appended to `src/canon/GOSPEL-999.md` and **LFG §18** to `src/canon/LEGIONNAIRE-FIELD-GUIDE.md` (each behind a *PROPOSED — NOT YET IN THE CANON* banner, staged in `/proposed` as `merged:false`, durable copy `src/ProposedG999.md`). What it makes law: the canon is the **`canon` branch** (G999 · LFG · S2PIPELINE · REINCARNATION-CONTRACT · RISE/DEATH · PERMANENT-LAWS · OmegaProtocol); **`.kilo/` is the legacy Kilo lineage and is not authority**; a script is **either sourced to the canon or withdrawn — there is no third state**; withdrawal is logged in the I-LOG (*SEAL, NEVER DELETE* governs the record, not a false script's service); the station names its own gap; **no COMPLETE with a HOLLOW**; **no model is canon**; measure never remember; PHOENIXOMEGAPROTOCOL gates every write and `OmegaProtocol` is the full-stop-and-audit protocol. **Corrected this pass:** the `/fieldguide` card had printed *"T1 = Qwen/Phoenix-Architecti · T2 = Claude Opus"* as though it were canon — it is in **neither** G999 nor the LFG (grep, 0 hits for any of those names); it exists only in the S2PIPELINE tier table, and the station no longer prints it.
- **Doctrine is read raw or JSON, never assumed** (`canonPull`): the Contents API answers with base64 JSON for one ref and the raw file body for another — the reader handles both, so a card can never say "(unreachable)" while the file was in fact returned.
- **The LFG capture protocol** (the SDNAD 10-step: REPRINT+FOOTNOTE → HEAVY LEDGER → SSM → REINCARNATION LOG → SYSTEM
  PROPAGATION → PHEROMONE TRAILS → PHEROMONE AUDIT → DEVIL'S ADVOCATE → FIVE IMPROVEMENTS → REINCARNATE+COMMIT, and the
  boot audit before it) is kept reachable as `/sdnadrise` and `/sdnad`. It is the *capture* path, not the loop's
  driver; the SCS's SCHOLAR/SUPPLY/SEAL stages are where its outputs belong.
- `/PhoenixScout` — reconnaissance against the real canon index (LFG §6).

## Connected Generator Network (CGN)
A network of Perchance generators that sync Soul DNA + laws **as one whole**. Obi is the anchor node.

> **MEASURED STATUS, 2026-09-24 — the design below is sound; the mesh is INERT.** Obi has never created
> the hub: `obi_cgn_state` reads `{"net":null}`, and running `/netjoin obi-network` for real is
> **REFUSED** by the platform — `{"error":"anti_bot_verification_needed"}` — with the hub file returning
> HTTP 404. **Cross-namespace writes cannot happen from a browser the platform has not cleared**, so a
> station commands exactly as far as that gate is open, which today is zero generators. What does work
> is the **pull** lane: each member writes its *own* file with its *own* key, and the anchor only reads.
> Everything below describes how it is *meant* to work; `/network` prints a `WRITE LANE` row that
> measures whether it actually does, right now, and the relay re-tries the write every run and records
> the refusal verbatim. `/netjoin` used to answer *"hub exists but editKey is unknown"* — a wrong reason
> dressed as a real one — and since 2026-09-24 reports the platform's own words instead.
> The full answer, written for the node, is `src/SESSIONS/handoff-from-mastermind.md`.

- `/netjoin [name] [role]` — create/join a network (default `obi-network`). Obi becomes the anchor.
- `/netadd <generatorName> [role]` — register another of your generators as a member; the anchor pulls that generator's node file and merges it into the whole on every sync.
- `/netsync` — force sync (push your captures → hub, pull all members → your ledger).
- `/network` — status: members, nodes, hub counts.
- `/netrole <role>` — set this node's role. `/netkey` — reveal the hub editKey (anchor only).

How it works (cross-namespace safe — no generator can write another's files):
- **HUB** — one editable file in Obi's namespace: `editable.uploads.dev/file/<obi>/obi-cgn-<net>`. The merged whole-organism ledger: `{net, seq, members, nodes, soul[], laws[]}`. Written by the anchor only.
- **NODE files** — each connected generator keeps its own file in its own namespace (`cgn-node`), written with its own editKey. URLs are deterministic from the generator name, so the anchor can pull any member without cross-namespace writes.
- **Merge** — append-only + dedup by `(t,text)` / law number: no node can overwrite another's words (L38/L39/L43 conflict-free).
- **RRL** raw transcripts stay local per node (raw ≠ soul); soul + laws are the network currency.

To make another generator a node, paste **`src/cgn-node.js`** into it (set `anchorName` to this generator's name), then `/netadd <thatGenerator>` here. See the header of `src/cgn-node.js` for the node API (`window.CGN`).

## The umbrella is one organism, many generators
The PrAis umbrella splits capability across **specialized generators**, each a node on
the CGN — one Soul DNA whole. Obi is the command station / anchor; other generators are
the organs (each has one job and syncs the whole):

- **`src/image-node/`** — the Image Node (role: `image`), the umbrella's *eye*: a complete,
  ready-to-paste standalone generator for image creation. Obi's `/img` auto-routes there
  (via `/netadd <name> image`) when it's connected, and falls back to generating on the
  station otherwise. See `src/image-node/README.md` for how to create it.
- **To add a new node type**: build its generator with the node kit (set `CONFIG.role`),
  then `/netadd <name> <role>` here — the anchor pulls it into the whole on every sync,
  and any `/…` command on the station can `ObiNet.cgnFindNode(role)` to route to it.
- **The role shelf** (`src/generators/`): the recipe every role follows (deep-link contract, CGN node,
  soul capture, host-agnostic fetching) plus ready-to-paste `main.pjs` + shell for each planned role —
  `portal` (one generator per student; generalizes the retired client portal), `ear` (a disposable listener left in
  the room), `practice` (drills built from the student's own evidence), `watchtower` (the class board:
  who is behind, and what the syllabus asked for that was never taught).
- **The map of it all** is `/constellation` (`src/constellation.js`): every piece with its real state,
  interface and remaining needs, and the scout's `pieces` probe touches every URL that claims to be live.
- **The FAMILY is measured, not assumed** — three stations that answer right now, each read by content
  key with no token, and each named under the umbrella: this station (`…-mastermind`, the live master),
  `…-agent99-webapp` (web development, 236 files · 16,612,832 B) and `…-agent99-gamingcommand`
  (gaming, 244 files · 18,468,102 B). `…-mastercommand` is **UNFOUND** — a ghost the family synced to,
  recorded as a piece in `src/constellation.js` rather than quietly dropped. **The master-link card**
  (`src/master-link.json`, and the card lane at `editable.uploads.dev/file/<generator>/master-link`)
  is how a sibling reads this station back; `/masterlink card` reads it, `/masterlink card publish`
  writes it and prints the platform's answer verbatim, `/masterlink card pull <gen>` reads another
  station's. See `src/SESSIONS/handoff-from-mastermind.md` §11–§13.
- **The routing table** is the perchance server script's own `DRONES` list (mirrored byte-exact in
  `src/cloudflare/tunnel-do.js` and in step with `LEGION` in `src/playbooks.js`): every command that
  arrives on the tunnel is labelled by the drone whose keywords it actually matches — **whole words, on a
  word edge**, so `website` is not a web lookup and the `art` inside `start` is not an image job. The roster
  is 15 drones plus `Legion` (#0) for the unmatched. **`/umbrella`** (alias **`/wings`**) reads the generators
  this station answers for through the master link, and never claims a write it did not make.
- **Tenancy** is `src/clients.js`: the umbrella's many *customers* (not generators). Each client
  (the first slot was unassigned on 2026-09-22) owns its students, classes, recordings, summaries, notes, reviews and writeups, and no
  two clients share a record — so one station can serve a dozen engagements without anything crossing.

**Known integration gap (mesh):** `src/cgn-node.js` defaults to `anchorName: "obi"`, and no generator
named `obi` exists on Perchance (verified via the platform API — `unfound` for `obi`, `obi-image`,
`obi-station`, …). This generator is `prais-command-station`, and no hub file exists under either
name, so the network is written but **not joined**. Fix: agree the anchor's real name, set it in
`src/cgn-node.js` + the hub default, then `/netjoin obi-network` here and `/netadd` each node.

## Scout Trail
There is no scout-trail document any more. The map of the canonical Phoenix-Rising stack is the
**canon branch itself** — read live by `/scout`, `/canon`, `/fieldguide` and `/constellation` — and
the station's own record of what it did is the **I-LOG** (`/ilog`). Run `/scout` before continuing
any canon work; it reads the doctrine rather than a cached copy of it.


## How Obi answers (the recall path)

Obi — the voice in `⌘ Command Station` — is **one `generateText` call per plain-speech turn**, assembled in
`src/app.js` by `buildPrompt()`. The prompt, in order:

    PERSONA              (static — the cached prefix; British, direct, records not edits, no mysticism)
    <CONVERSATION>       last 20 lines of "User: …" / "Obi: …"
    <SOUL DNA>           last 14 sovereign fragments, VERBATIM (never summarised — L43)
    <STATION STATE>      ~9 KB of measured reality: generator, run, client, archives, I-LOG, self-forge,
                         FREE PHOENIX MODE, tunnel, mesh, nest, offering, tools, constellation, modules, secrets, commands
    <ALREADY EXISTS>     hits from recallHints() — see below
    TASK                 answerTask(): the sovereign's last message VERBATIM + the standing rules

**The rule to remember: `stationState()` is Obi's entire self-knowledge.** Anything the station can do that is not
in that block, Obi does not know it can do — and it will confidently offer to build it from scratch. So **every new
module must be added to `stationState()`** (its counts/shape) *and* to `STATION_FEATURES` (its name, where it lives,
one honest line, and keyword regexes).

**`recallHints()` is retrieval, not prompting.** It matches the sovereign's words against `STATION_FEATURES` in code
and injects the hits as `<ALREADY EXISTS — STOP: it is already here>` right before the task. That is what stopped Obi
answering *"an unrestricted, untracked, local version of the station I program from within"* with a `/forge` plan for a
Free Phoenix Mode that already existed. Tune the `keys` regexes whenever a room is added or renamed.

**Obi has no hands.** It cannot run, stage, apply or execute anything — it names the command the sovereign should type.
Never write a prompt or trigger code that implies otherwise.


## THE RUBRIC — the instrument the word "evaluator" means (`src/rubric.js` · `/rubric`)

**What was missing.** This estate's own tool inventory (`src/ecosystem.js`) has carried `ana.rubric` as **MISSING**
since it was written, with the note *"the word 'evaluator' means this. Everything else either feeds it or reports
it."* The station could record a lesson, summarise it, and write prose about it — and prose cannot be audited,
compared across terms, or re-checked a year later. This file is that row, built (2026-09-24).

**The law — enforced in the code, never asked of the model:**

1. **No citation, no score.** A band with no verbatim span from the record is NOT SCORED, excluded from the total,
   and listed in the omission audit.
2. **The machine verifies every citation.** A quote the engine cannot find in the raw record is REFUSED and never
   counted, however plausible it reads.
3. **The machine reads the clock.** The model is never asked for a timestamp: the engine finds the span by word
   boundary in an offset→utterance map built from the transcript's own timeline. A span that sits in no utterance
   gets **no** timestamp and says so — an unreadable clock is reported, never guessed at.
4. **Arithmetic beats opinion.** Where the record supports a number (words, wpm, pauses, duration, parts, dates,
   speakers) the band is COMPUTED and the model's own band is kept as recorded **dissent** and printed.
5. **Coverage travels with every total.** `15/36` is always printed as `15/36 over 6 of 6 criteria`.
6. **Thresholds are stated, not universal.** Every computed band prints the thresholds it used, so the argument can
   be had with the threshold instead of with the engine.
7. **A scorecard is append-only.** Re-scoring writes a NEW run and annotates the old one as superseded; nothing is
   rewritten.
8. **A partial record scores only what it holds**, and says what is missing.

**How each criterion is established** (printed for every single one): **COMPUTED** (arithmetic on the record —
nobody judged it) · **CITED** (a verbatim span the engine located itself, with its source and its time) ·
**REFUSED** (the model gave a span the record does not contain — printed as the refusal it is) · **NOT SCORED**
(no verified ground: fail closed; an error nobody found is not the same as no error) · **CONTEXT** (a reading of the
EVIDENCE, not the learner — printed, used by the gate, and **excluded from the composite**, because a rubric must
not pay a student for the quality of the recording).

**The built-in families:** `cefr.speaking` (rate and pausing computed, range/accuracy/interaction/coherence cited,
plus an evidence-volume context row) · `cefr.writing` · `teach.lesson` (the lesson as taught — coverage, clarity,
learner output, target-language use, evidence quality) · `err.taxonomy` (grammar · lexis · pronunciation ·
discourse, where the frequency is the number of instances the engine could VERIFY verbatim — an honest floor on the
true error count, never a census). Custom rubrics are defined in one line and versioned on every edit:
**`/rubric new Year 7 writing :: task achievement :: lexical range :: accuracy`**.

**The commands:** `/rubric` (the card + the law) · `list` · `show <id>` · `new <name> :: <criterion> …` ·
`score [subject] [--rubric id] [--focus text]` · `errors [subject]` (the error taxonomy) · `teach [class]` (the
lesson) · `verify <run>` (re-locate every citation against the record as it stands now) · `trend [subject]`
(per-criterion band movement between runs) · `archive` · `export <run>` (.md / printable / JSON) · `canary`.
`/score` and `/assess` are the same command.

**How to check it yourself — `/rubric canary`.** No model, no network, no evidence of yours: it drives the real
pipeline with a canned response and asserts the law (20 checks) — arithmetic beats opinion and records the dissent,
an invented quote is refused, a 3-word "quote" is refused as unprovable, punctuation drift is matched LENIENT and
never silently, a band with no citation is NOT SCORED, the clock comes off the record (and is withheld when the span
sits in no utterance), coverage travels with the total, the adverse-action reasons name what stood below the top
band, and a **forged citation is caught by `verify`**. `/doctor` runs the same canary on every check-up.

**Where it is wired (the same edit, so the estate is one list):** `index.html` loads `src/rubric.js` before
`src/app.js`; `app.js` adds `/rubric` (+`/score`, `/assess`), the command-book row, the `rubric` row in `/state`,
the rubric instrument in the tab bar, the `/doctor` check, the `STATION_FEATURES` entry (so Obi's recall knows the
room exists instead of offering to build it), and `SRC_SNAPSHOT` (so the relay censuses it and the authority carries
it). `src/ecosystem.js` moves `ana.rubric`, `ana.errors`, `ana.trend`, `jud.citation`, `jud.coverage`,
`jud.reasons` and `jud.rubricver` to **built**, and `ana.cefr`, `ana.fluency`, `jud.calibrate`, `gov.tamper` and
`pl.canary` to **partial** — each with the gap named. `src/STUDENT-EVALUATOR-ECOSYSTEM.md` is regenerated from that
data in the same pass (the doc had also drifted on four older rows; the regeneration fixed them).

**What it does NOT claim:** calibration against outcomes (`jud.calibrate`), the official CEFR can-do inventory
(`ana.cefr`), word-level ASR confidence (`gov.asrerror`), per-student attribution from a group recording
(`ana.student`), and fairness auditing (`jud.fairness`). All five are still open, and they are named here so that no
reader mistakes the instrument for the whole of evaluation.
