# role: site — "the hand that puts a page on the web"

**Mandate.** The station records; the Lesson Constructor builds lessons; the brand system draws the
artwork; the Print Room makes paper. **Nothing in the family builds a *website*.** This is the
**Web Development** division's first generator (`src/divisions.js` → `webdev`, empty until now):
a brief goes in, a real site comes out — self-contained HTML, wearable in the sovereign's own brand or
in a client's — previewed live and downloadable, and wired to the two paths the empire has *already*
built rather than a new one invented here: **GitHub** (the ONE authority repo) and **Cloudflare**
(where every public piece actually sits).

A built site is a **file**. Publishing it is the sovereign's account, and this generator says so
instead of implying otherwise.

## The work this generator stands on (located, not invented — 2026-09-22)

The website-building machinery already in the tree, in the order a build touches it:

| what | where | state |
|---|---|---|
| **the host build** — one Worker, two Durable Objects, static assets; `build.mjs` copies the whole `src/` tree into `dist/` and **asserts** every `<script src="src/…">` on the page exists, failing loudly if not | `src/cloudflare/` (`worker.js` · `tunnel-do.js` · `store-do.js` · `build.mjs` · `wrangler.toml`) | **ready** (verified by running it; deploying needs the sovereign's account) |
| **the shelf** — the first real PrAis site, live | `face.prais` → `https://e3301ee8.michael-hobbs.pages.dev/prais` (**Cloudflare Pages**) | **live**, read |
| **the door** — a real student/parent portal in a real family's hands | `face.timmy` → `https://timmy-portal.mrmichaelhobbs123.workers.dev/` (**Cloudflare Worker**), copy in `src/timmy-portal/` | **live** — ⚠ the repo copy is a **STALE SNAPSHOT** (42.7 KB deployed vs 41.8 KB local); read the deployed file before building on it |
| **the plugin shim** — the six plugin APIs the app was written against, re-implemented so the same code runs off-perchance | `src/cloudflare/public/ob1-shim.js` | **ready** |
| **the deploy account** | `svc.cf` — 20 Workers · 10 Pages · 2 D1 · 8 KV measured at the last scan | **BLOCKED** — no Cloudflare API token in this browser; `/cf status` can only report `BLOCKED`, never guess |
| **the authority** | `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`), everything under `OPERATIONS/COMMANDSTATION/` | **one authority**; writes are gated by PHOENIXOMEGAPROTOCOL |
| **the build machinery already proven** — write ONE self-contained HTML file **in parts** (`<<<MORE>>>` → continue with the file so far in context), preview it in a sandboxed iframe, download it | `src/freephoenix.js` (`genFile` · `buildApp`) | **live**, but it lives in the *untracked* room (`/free`) |

**So this generator is that machinery, taken out of the untracked room and pointed at the web** —
written by the same rules, wearing the same theme, opening in the sovereign's own tab instead of
inside a room that is deliberately sealed from Git, the Canon and the record.

Two things it deliberately does **not** do:

- **It does not push.** `/forge apply`, `/canon sync`, `/cf deploy` and `/ilog push` are the
  **station's** gated paths; a generator cannot write the authority or the account. This one hands over
  the artifact and the exact command, and names the gate.
- **It does not claim a deployment it cannot measure.** No Cloudflare token → the deploy card reads
  `BLOCKED`, with the reason, exactly as `src/vault.js` and `src/scout.js` already do.

## The worked examples — `examples/`

Three sites that already shipped, brought in from the canon branch (2026-09-22) so the builder has a
**shape library** and a **quality bar** instead of a blank prompt. The CV is byte-for-byte (bar one
dead stylesheet path); the two portfolios are **redacted to templates** under BRAND.028 — see below:

| example | what it proves |
|---|---|
| `michael-hobbs-cv/` (+ `linkedin-blueprint.md`) | the CV grammar — labelled bands on a dark ground, one accent, no portrait needed. Live: `michael-hobbs.pages.dev/cv` |
| `portfolio-template-violet/` · `portfolio-template-green/` | **one template, two subjects, two palettes** — the only real proof that a design is a template and not a one-off. Personal identifiers are `{{TOKEN}}` placeholders (BRAND.028) |

They are flat files — no build step, no framework, no network but Google Fonts — which is exactly the
contract this generator promises. See `examples/README.md` for provenance, the one character-level fix
the CV needed, and the **BRAND.028 redaction** (names · city · employer · email → placeholders; the
unredacted originals stay on the canon, and the pass is reversible).

## Interface

| command | what it does |
|---|---|
| `/plan <brief>` | the site's page plan — sections in order, one line each — before a byte is written |
| `/build <brief>` | plan → write the pages in parts → preview → file the site in the library |
| `/sites` | the local site library: brief, pages, bytes, when, open · download · delete |
| `/open <n>` | re-mount a filed site in the preview |
| `/dl <n>` | download a filed site's files |
| `/brand on\|off` | whether the generated site wears the frozen tokens (system `#a855f7` · reward `#f59e0b` · ground `#0f0f1a`) or the client's own colours |
| `/deploy` | the two real paths, with their honest state: Cloudflare (Worker/Pages — `BLOCKED` without a token) and GitHub (`OPERATIONS/COMMANDSTATION/`, gate-armed only) |
| `?brief=<text>` | deep link — opens with the brief filled and builds (the way Obi routes work here) |

## The contracts every role obeys (this one included)

- **Soul capture (L37–L39).** Every brief is a sovereign word: recorded **verbatim** into the node's own
  ledger (`obi_sdnad`, the same key the station reads) **before** the model is called. Never edited.
- **CGN node.** `src/cgn-node.js` ships in the folder with `CONFIG.role = "site"` — it mirrors the whole
  organism's soul + laws locally and pushes only this node's own captures on sync. Raw stays local (L44).
- **Fail closed.** No plan for a brief that did not arrive; no build that did not preview; a deploy that
  cannot be measured reads `BLOCKED`.
- **Host-agnostic.** Anything fetched goes through `superFetch`; anything durable goes to the ledger/kv —
  so this generator can be moved to the self-hosted Cloudflare build without a rewrite.

## Build steps (the recipe, `src/generators/README.md`)

1. Create the generator (suggest `prais-site-builder`).
2. Paste `main.pjs` (the `$meta` + its four imports).
3. Paste `index.html` (the shell — the ids and the wiring are real, see "state" below).
4. In that generator's own `src/`: paste `app.js`, `styles.css`, `cgn-node.js` from this folder.
5. Open it once (it writes its node file and announces itself), then `/netadd <name> site` on the station.
6. Point the station's `divisions.js` `webdev` entry at the real URL and flip its status to `live`
   **only when it opens and works.**

## State — honest, because "begin" means begun

| file | what it is | has it run? |
|---|---|---|
| `README.md` | this document | — |
| `main.pjs` | meta + imports (`ai-text-plugin` · `super-fetch-plugin` · `upload-plugin` · `kv-plugin`) | **never pasted into a generator** |
| `index.html` | the shell: brief, preview, console, files, library, deploy cards | **never pasted into a generator** |
| `src/app.js` | plan → build-in-parts → preview → file → download · soul capture · command dispatcher · deep link | **boot-tested against a stubbed model** (shell + app in a sandboxed iframe, 2026-09-22): the whole loop ran end to end — brief → soul → plan (3 rows) → file written in **two parts and stitched** (part 1 ending `<<<MORE>>>`, part 2 `<<<END>>>`) → preview mounted → filed in the library · **never run in its own generator, against the real model** |
| `src/styles.css` | the station's own theme (frozen tokens, glass, Orbitron/Rajdhani/Inter/JetBrains Mono) | **rendered** (in the same harness, 1200×900) — one real defect found by looking and fixed: `.tbtn`/`.sb-row` set `display`, so the `[hidden]` **attribute** was ignored and the Stop button and the client-palette row showed when they should not. `[hidden]{display:none !important}` is now in the file, because the perchance engine's guarantee does not hold on a plain page |
| `src/cgn-node.js` | the node kit, `CONFIG.role = "site"` | byte-forked from `src/cgn-node.js` |
| `examples/` | three shipped sites as the shape library — the CV byte-for-byte, plus one portfolio template in two palettes redacted to `{{TOKEN}}` placeholders (BRAND.028) — + its README with provenance and the redaction table | **all six files serve 200 from the live preview**; the CV renders identically to the live `michael-hobbs.pages.dev/cv` and the two templates render as designed with the tokens standing in (looked at, not assumed) |

`src/divisions.js` files it as **`scaffold`** — "source exists in the repo; not a shipped generator yet"
— which is exactly what it is. Nothing here may be called `live` until it has been pasted, opened and
measured.

## Done when

- [ ] it has been pasted into its own generator and opened — and the console is clean
- [ ] a brief produces a plan, then a site that **previews and runs** in the sandboxed iframe
- [ ] downloading the file and opening it standalone works offline
- [ ] every brief is in the ledger verbatim before the model call, and shows in Memory
- [ ] the node appears on the station as `role: site` (`/netsync` → `/network`)
- [ ] `/deploy` reads the true state of both paths (and `BLOCKED` when the token is absent)
- [ ] the site it builds for a *client* wears the client's colours; the one it builds for PrAis wears
      the frozen three (BRAND.002 is a lesson law; a client site is not a lesson)
