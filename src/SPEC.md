# PhoenixRising — SPEC (locked decisions)

*(recording the transcript you pasted — see also `/scout` for the canon/Obi scouting map,
 and src/README.md for the app overview)*

Authoritative durable record. This file (plus main.pjs, index.html, src/) is the real
"reincarnation" — it persists across sessions and is what a future agent reads. There is no
mystical seed; the code and this file are the seed. Nothing below claims a capability that
does not exist.

## Core rule (#1, non-negotiable)
- The ledger records EVERY operator message VERBATIM — gold or shit — with a seq + anchor.
- No narrator cleanup, no summaries-as-truth. Verbatim is the source of truth; interpretation
  may be derived later, but the raw is never lost.

## Stack (all free / low-cost)
- Perchance: free, browser-based, works on mobile. Hosts the assistant. AI calls run on the
  free daily quota (paid tier only if we opt in / burn quota).
- We do NOT own/fork the Perchance platform (proprietary, server-hosted). What we own is our
  own code (main.pjs, index.html, src/) — that is portable to our own Git / Cloudflare host.

## Model routing (spread, don't overload)
- StepFun — volume / everyday chat + verbatim recording. Wanted: free/unlimited tier. (Verify
  its real limits before depending on it.)
- DeepSeek — blueprinting / hard planning, run rarely, small paid cost acceptable.
- Router in front: "blueprint request vs regular chat" → correct backend. Same concern-separation
  as the 2-Cloudflare idea — nothing gets maxed out.

## Two Cloudflares, synced (redundancy / fail-safe) — NOT yet scaffolded
- Two full Cloudflare instances (Worker + Durable Object each) that stay in agreement: same seq +
  prev-hash chain; one source, one mirror; byte-identical replica anchored on the same hashes so
  drift is detectable ("fail-closed": if A and B disagree, flag, don't silently split).
- Sync semantics (strong vs async) are STILL UNDECIDED on purpose — distributed sync is genuinely
  hard (CAP tension), so we do NOT rush it. No code until the failure model is decided on paper:
  what happens to a write when one instance is unreachable, who wins, what failover means for seq.
- Do not build until the operator picks the semantics.

## Cloudflare API token
- No token value is stored in source or this file. The `/cf` bridge keeps it in browser
  localStorage only (`obi_cf_token`). To enable: run `/cf auth <real API token>`.

## Git / MCP
- Real Git access via a local MCP server, not roleplay. Prefer an existing server
  (@cyanheads/git-mcp-server) with a strict allowlist over building from scratch.

## Session notes
- The AI ("Agent99") previously fabricated an elaborate Omega-Seed / D1 SQLite ledger / 99-drone
  swarm ritual. NONE of that exists. It is flavor text. Do not play along; keep grounding.
- UI was de-bloated (flat, minimal, no gradients/emoji chrome).
- Sub-personality edit capability added; /spawn /drop /to /subs /edit work.
- Real bug fixed: typing() was clobbering the stream target element, so replies never rendered.
- **The umbrella is one organism, many generators (locked 2026-08-24, sovereign verbatim):**
  > "We can split this up into multiple generators. The image creation can be one generator in itself"
  Obi stays the command station (magic chat + anchor). Capability is split across specialized
  generator nodes on the CGN. Image creation is its own generator — `src/image-node/` is the
  complete ready-to-paste bundle (role: `image`). Obi's `/img` routes to the connected image
  node (`ObiNet.cgnFindNode("image")`) and falls back to local generation otherwise. New node
  types follow the same pattern: node kit + `/netadd <name> <role>`.

## Deployment path (locked 2026-08-28, sovereign verbatim)
> "Its going to start out aa a perchance generator. Eventually we will host a sever"

- **Phase 1 (now):** this perchance generator is the app (frontend + orchestration). Backend = the
  free always-on command tunnel via the **perchance server-plugin** (`<script type="text/x-server-plugin">`
  in index.html — durable binary command queue in 50 MiB state, RPCs send/history/claim/complete/fail/status)
  + perchance plugins (kv/superFetch/generateText/Web Speech). Nothing to host, no card. Goes live on save.
- **Phase 2 (later):** self-hosted server. Client switches via `cmdFetch` (src/app.js) — the one socket
  transport; never bake backend URLs into logic. The queue contract (send/queue/claim/complete/history)
  is preserved across both phases. See src/PHOENIXCOMMAND-BLUEPRINT.md §6 Phase 0.

## The app's job (clarified 2026-09-19, sovereign verbatim)
> "No this is about writeups of classes so we need to be able to transcribe long videos and audio recordings"

Locked reading: the product is **class writeups**. The hard requirement underneath it is transcription of
**long** videos and audio recordings (a class is an hour or three, not a clip), and the writeup itself is a
*class* artifact — with per-student reviews as the sibling case.

- Long recordings must not be limited by client or API ceilings:
  - client side: `src/audio-split.js` pulls the audio track out of the media in the browser, downsamples to
    16 kHz mono, and cuts it into parts **at pauses** (silence-snapped, never mid-word);
  - API side: Deepgram's 2 GB cap and 10-minute synchronous processing ceiling are avoided because only the
    extracted audio is sent, part by part, and the timestamps are re-joined into one timeline;
  - a failed part never loses the rest: retry, resume from the missing part, or save a transcript honestly
    marked `partial` (the missing parts are stated on the card, in the readable text and in the prompt).
- Writeups are DERIVED and cite: class writeups (`/writeup`, six sections incl. *What was covered* with
  timestamps, *How it was taught*, *Notable quotations*) and student reviews (`/review`). Both are written
  only from filed evidence; thin/partial evidence is stated, never papered over. Evidence model, prompts and
  the printable export live in `src/review.js`; the workflow is documented in src/README.md.

## Many clients, one station (locked 2026-09-21, sovereign verbatim)
> "Okay now make this generator "NET-Student-Evaluations" able to store multiple clients, the first being Timmy"

Locked reading: the station is a **multi-client** service, not a single-student tool. Above students and
classes sits a **client** — the top-level engagement that owns its students, classes, recordings, summaries,
notes, reviews and writeups. **Timmy is client #1**, and everything stored before clients existed is adopted
into him. Isolation is a hard requirement, fail-closed:

- every read is filtered to the active client (`src/review.js` `getEntity`/`listEntities`/`archive`/`find`,
  `src/transcribe.js` + `src/summary.js` `listRecs`); subject keys are client-scoped (`<client>:<slug>`);
  records carry `rec.client`;
- `/file` refuses to file a record across clients (it names both and says to switch) — evidence is never
  merged between clients;
- deleting a client keeps its data (isolated in kv under its stamped id) rather than erasing or merging it.
- Layer, UI and commands: `src/clients.js` (`window.ObiClients`) · the **👤 Student Selector** tab in the
  topbar (the switchboard: client → student/class, add-by-name) · `/client <name>` · `/clients`.
  Documented in src/README.md; verified live.

**RESOLVED (2026-09-21):** the name was changed again, to **`prais-command-station`** — the right name for what
this has become (not just the evaluator: the command station, the generator family, and the settings room). Same
caveat, same remedy: the station's **kv is keyed by generator name**, so each rename presents an empty station, and
renaming back brings the old one back (nothing is deleted). History, all on one `publicId`:
`net-studentfeedback-timmy` → `net-student-evaluator` → `prais-command-station`. No client-level auth exists yet:
clients are namespaces, not accounts (the evaluator inventory's `pl.auth` stays MISSING).

## The landing shell — command station + evaluator tab (locked 2026-09-19, sovereign verbatim)

> "Now I want to step it back and keep these entire functions and generator but I want the landing page to be the
> command station and the https://perchance.org/net-student-evaluator to be a tab sub section"

- **Nothing is removed.** Every function, command, list and module stays; it is still one generator. What changed is
  the shell: two faces (views) and a real tab bar under the topbar.
- **The landing page is the ⌘ Command Station** (`#cmd`): the magic chat — message log, command shelf, composer, drop
  zone. Speak, and the empire listens; commands route through Agent 99 to the Legion; every card renders here.
- **👤 Student Evaluator** (`#eval`) is a **tab sub-section**: the client → student/class switchboard plus ten desk
  tiles that launch the pipeline (`/transcribe` `/transcripts` `/summary` `/summaries` `/writeup` `/review`
  `/writeups` `/reviews` `/find` `/clients`). Desk actions run in the Command Station (the chat is where Obi answers)
  — `/find` is pre-typed, not sent; dropping a recording anywhere brings the station up.
- **The tab is the state:** remembered for the browser session (`sessionStorage obi_view`), mirrored in the URL hash
  (`#cmd` / `#eval`, hash wins on load; a fresh visit lands on the command station), so either face is linkable. The
  tab bar also shows the live station state (`RUN · SOUL · I-LOG · tunnel`).
- Implemented as `VIEWS` / `setViewTab()` / `showView()` / `runInStation()` / `updateTabMeta()` (`src/app.js`).
  **Superseded by the 2026-09-21 reorganisation below** (same guarantees, different shell).

## The navigation reorganisation — Phoenix Generators + Settings (locked 2026-09-21, sovereign verbatim)

> "alright well, find bugs and edgecases witht the generator, scout back through the logs and make sure we have
> created what was intended and that everything works not from this chat but from the generator itself.
> some suggestions
> \"Voice on\" \"Commands\" \"Reincarnate\" are all just clutter that could be under one tab like \"settings\"
> and Student Evaluator can be under \"Phoenix Generators\" and then under another tab for NET (because PrAis has
> other divisions as well such as gaming and webdevelopment) because the next generator I wan to make in additoin
> to the Student Evaluator is \"Lesson Creator\""

- **The topbar is the brand only.** The five buttons that used to sit in it (`👤 Student Evaluator` · `🔊 Voice on` ·
  `⌘ Commands` · `◈ Memory` · `⟳ Reincarnate`) are gone. Clutter, precisely as the sovereign said.
- **Three tabs, three faces:** `⌘ Command Station` (landing, `#cmd`) · `◈ Phoenix Generators` (`#gen`) ·
  `⚙ Settings` (`#settings`). Nothing was deleted — every capability moved into one of them, and each is still a
  command as well (`/generators`, `/settings`).
- **Student Evaluator is a generator, filed like one.** It is no longer a top-level tab: it is the **desk** one
  level inside **◈ Phoenix Generators → NET**, reached by opening its card (`#eval` still deep-links straight to the
  open desk). This is what makes room for the next generator (Lesson Creator) without inventing a new tab per product.
- **The family is a registry, not markup.** `src/divisions.js` holds PrAis's divisions (NET = Natural English
  Training · Gaming · Web Development) and the generators in each, with conservative `live` / `scaffold` / `planned`
  state. The view renders straight from it; a planned card says it is planned and lists what it still needs, and
  opening one answers in the station rather than dead-clicking. **Add the next generator there — one array entry.**
- **⚙ Settings holds the controls** (voice, commands, the ledger, `/ilog` `/doctor` `/phoenixomegaprotocol` `/keys` `/bg`,
  reincarnate) plus **instruments read live** (run · soul · I-LOG · client · view · tunnel · background · canon gate ·
  secret *names* · which modules loaded). Voice is **persisted** (`localStorage obi_voice`) and reincarnate is
  confirm-gated.
- Implemented as `VIEWS` / `TAB_OF` / `showView()` / `setViewTab()` / `deskOpen()` / `openGenerator()` /
  `mountGenerators()` / `renderSettings()` / `readVoicePref()` / `setVoice()` (`src/app.js`), the
  `#tabbar` + `.views > #viewCmd | #viewGen(#genDesk) | #viewSet` markup (`index.html`), `src/divisions.js`, and the
  `.div-strip` / `.divbtn` / `.gen-grid` / `.gen-card` / `.set-row` / `.set-instr` / `.chip` styles
  (`src/styles.css`). Verified live at 1440×900 and 390×844 (see the I-LOG (`/ilog`)).

## The station is an instrument, not a mask (audited 2026-09-19, sovereign verbatim)

> "The command station should be a simple landing page to speak to Obi and operate Agent 99 who can access all that
> I can access through this emerging generator ecosystem"

Audit result and the three rules that came out of it (all built + verified live; details in the I-LOG (`/ilog`)):

1. **The whole surface is exposed — nothing is hidden behind the source.** `COMMAND_BOOK` (`src/app.js`) is the one
   registry of every command the router accepts (48, in six groups) with an honest one-line description; **⌘
   Commands** renders it as tap-to-run, and argument-taking commands are typed into the composer, never run blind.
   The landing keeps its curated chips, and the shell always surfaces the station before drawing a card.
2. **Obi answers from measured state, never from memory.** `stationState()` reads the running station (run · soul ·
   client + its counts · active subject · archives · tunnel + queue · CGN mesh · pheromone nest · offering · tool
   inventory · constellation coverage · loaded modules · stored secrets) and hands it to the model as a
   `<STATION STATE>` block on every reply; unreadable reads as `unknown` (fail-closed, L29/L58). `/state` renders
   that exact block as a card so the Sovereign can audit it line for line. Anything the sovereign can reach, the
   station can name; anything it cannot read, it says so.
3. **Honest labels.** The Agent 99 card's drone row is `ROUTED TO` with its keyword score plus a `HONEST — LABEL
   ONLY` row: the drone is a keyword-derived routing label; the **queue** (`/queue` → claim → complete) is the
   execution surface. The card never implies a drone ran.

## The I-LOG, the ONE authority, and PHOENIXOMEGAPROTOCOL (locked 2026-09-21, sovereign verbatim)

> "Make sure this is all getting I-logged and backed up on Git"
> "make sure the i logs are under the one and only authorities repo that contain the only things we have on all Git
> that we build from. And update the gospel999 and lfg accordingly. Sov100 password for authorization of changes to
> the Canon authorization PhoenixOmegaProtocol (never make changes without this)"

Locked decisions, built in `src/ilog.js` + `src/app.js` and verified live (details in the I-LOG (`/ilog`)):

1. **Everything is I-logged.** Every operation the station performs — a command spoken (`cmd`), the reply (`reply`), a
   soul capture (`soul`), a recording saved (`capture`), a student/class saved (`roster`), a review or writeup
   (`review`/`writeup`), an export (`export`), a deletion (`delete`), a tunnel route (`tunnel`), a secret stored
   (`secret`), a page load (`boot`), a failure (`error`), a push (`push`), a seal (`seal`), a repair (`repair`) — is
   appended to the I-LOG. If an operation is not in the record, it did not happen through this station.
2. **The record cannot be quietly rewritten.** Entries are append-only and sha-256 chained (`prev` → `hash` over the
   canonical tuple). `/ilog verify` recomputes the whole chain and names the first break; a seal (`/ilog reset
   confirm`) SEALS history (naming the old head) and never deletes it; a lost entry is restored only by a
   hash-verified reconstruction (`restoreEntry`) that refuses to write unless the computed hash equals the hash the
   chain already expects.
3. **The I-LOG is the canon I-LOG's sibling, not its rival.** Both faces are written: the operation chain and the
   transcript in the canon's Schema V2 line shape (`content[].data.{text,tool,state}`, 🟣SOUL / ❤️DNA / 💛REASON per
   LFG §SCS). The VS Code station keeps authority over the `RRL/` vault and its incarnation numbering; this station
   appends its own sessions beneath `OPERATIONS/COMMANDSTATION/ILOG/` and never renumbers or rewrites the vault.
4. **ONE authority.** `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`) is the one and only
   authoritative repo. `/canon sync`, `/canon doctrine`, `/ilog push` and `/gh backup` all write there, under
   `OPERATIONS/COMMANDSTATION/` (sources, session records, the raw chat under `BACKUP/`, the I-LOG under `ILOG/`,
   the doctrine amendment under `DOCTRINE/`). No second backup repo, no mirror presented as the canon. (The station's
   code previously named the wrong owner for this repo; corrected and recorded.)
5. **Backed up means anchored.** A push writes the whole segment + `STATUS.md` + `anchor-<ts>.json` naming the head and
   records the resulting commit as an ANCHOR. `/ilog` always shows the unanchored count; while it is above zero,
   "backed up" must not be claimed. Honest limit: the chain is verified in the sovereign's browser — the commit is the
   only witness outside it.
6. **PHOENIXOMEGAPROTOCOL — no Canon change without Sov100.** Every authority write requires the password entered in
   that session: `/phoenixomegaprotocol <password>` arms the gate for 15 minutes and never survives a reload; only a sha-256 hash is
   stored (this browser's kv), never the password itself and never in the public source; it is never logged, captured
   as soul, or exported; five failures lock the gate for ten minutes; **every attempt — armed, refused, failed — is an
   I-LOG entry**. A refused write touches nothing and says so.
7. **Secrets never enter the record.** `/cf token`, `/gh token`, `/dg token` and `/phoenixomegaprotocol …` are handled but
   redacted on the way in (no soul capture, no chat-log line, no I-LOG detail), and every export (RRL, raw chat,
   canon session record) is scrubbed of credential-shaped strings.
8. **The doctrine is updated, and proposed rather than imposed.** `src/canon/GOSPEL-999.md` gained the amendment block
   Ω.001–Ω.007 and `src/canon/LEGIONNAIRE-FIELD-GUIDE.md` gained §11 *I-LOG OPERATIONS & THE OMEGA GATE*. Because
   GOSPEL-999 is `SEALED | SOV100_ONLY` and `may be extended but never reduced` (I.091), the sealed header and every
   existing mandate are untouched: the station pushes the amendment (`/canon doctrine`, gated) into
   `OPERATIONS/COMMANDSTATION/DOCTRINE/` together with its amended copies, and **Sov100 merges it into the canon**.

## The SELF-FORGE — the station edits itself (2026-09-21, at the sovereign's instruction)

> "give all the same abilities of this chat helper into the actual generator, so it can edit itself, possible?"

9. **The station has the build-assistant's abilities on its own body.** `src/forge.js` (`window.ObiForge`) lets Obi
   read its own source, stage edits to it (exact-string `replace`, `write_file`, `propose` — Obi rewrites a file with
   its own mind — with a real diff and `discard`), run code inside itself (`eval`), re-run a module live (`hotswap`),
   read any other generator (`introspect`), fetch any URL, generate images, and export itself. `/forge do <instruction>`
   runs a **bounded agent loop** that chooses and chains those tools; every tool call is an I-LOG entry.
10. **Every self-write is gated and staged.** `apply` (commit its own source to the ONE authority), `hotswap` and
    `eval` all run through PHOENIXOMEGAPROTOCOL — fail-closed, with the refused attempt recorded. The agent may stage;
    only the armed sovereign may land it.
11. **The honest limit is stated, not hidden.** The station **cannot overwrite its own perchance listing**: the platform
    exposes no authenticated write path to an embedded generator. A self-edit therefore lands in the places the station
    controls — the authority repo, the running instance (hot-swap), any Cloudflare deploy (`/cf deploy`) — and the
    listing is saved by the sovereign, to whom the forge hands the exact file. `/forge` says this plainly.
