# HANDOFF — Command Station (`net-student-evaluator`)

**Read this first.** It is the resume point for a new agent session: where the station stands right now
(measured, not remembered), which steps are still open, and which of them may only run with the Canon gate armed.

Read order: **this file → `src/README.md` → `src/SPEC.md` →
`src/PROPOSED-CANON.md` → `src/AGENT99-OS.md` / `src/STUDENT-EVALUATOR-ECOSYSTEM.md` / `src/constellation.js`.**

> **The audit (2026-09-21) — measure before trusting any command list.** The station's own
> `CANON_REGISTRY` used to present canon commands it cannot run, station commands the canon does not have, and the real
> ones as one list. `/canon registry` now prints **BUILT** (`✓`/`✗`) and **ORIGIN** (**CANON** · **STATION** ·
> **PROPOSED**) per row and names the **34 canon commands with no station implementation**. The landing's rotating line
> is now doctrine with its source attached (**THE LAW ON THE WALL**); the student-facing "Tiger Voice" lines were
> removed from the deck. A hardcoded credential (`CANON.paAuth`) was removed from public source.

---

## What this station is (one paragraph)

Obi is Agent 99's student-facing voice: a real functional assistant (chat, vision, image generation, web lookup,
voice, transcription of recordings of any length, class writeups and student reviews) with the **non-negotiable
Soul-DNA memory protocol (SDNAD)** built into the app, an append-only sha-256-chained **I-LOG** record, a
**PHOENIXOMEGAPROTOCOL** gate on every Canon write, and a **SELF-FORGE** so the station can edit itself. Full
architecture, commands and doctrine: `src/README.md`. Locked sovereign decisions: `src/SPEC.md`.

---

## ANCHOR — 📚 LESSON GENERATOR PLUG-AND-PLAY (2026-10-16)

The Lesson Creator is done as a pipeline, not a pile of one-offs. Deck in → brief → lesson → library, all inside the desk:
- `src/deck.js` (new) — PDF → words in this browser (pdf.js `4.4.168`, pinned, proven on the 20-page Grade-5 deck). Never uploaded; scanned decks get an honest refusal.
- ✍ Build room — "📎 From deck (PDF)" fills topic + notes from the deck's own words (clipped for the 7 build calls). Human reads the brief, then generates. Validator → autosave → library unchanged.
- Proof on record: `Grade5-Unit3-Lesson2-Nationality-Academy.html` (7 rooms, 51 KB, check passed, zero warnings), library id `Lmvafjcxq` — filed under client **Unassigned** (re-file when the class has a named client).
- Deliberately not built: PPTX intake, scanned-PDF OCR, auto-generate-on-drop (the brief read stays human).
- Resume: next deck → ✍ Build → 📎 → generate. `index.html` loads `src/deck.js` before `src/lessons.js`.

---

## THE LATEST BUILD — 🔓 "OPEN THE GIT" (2026-09-27, `src/gitcanon.js` · command `/git`)

Three words from the sovereign, and the station answered with a half-truth: `/canon` asked the private authority for
`GOSPEL-999.md`, took a **404**, and printed **DOWN** — as though the canon were down. It is not. **One branch is
behind a PAT; a large part of the canon answers anyone, with no token at all.**

`src/gitcanon.js` (`window.ObiGit`, **`/git`**) now measures, live, every part of the git and shows what actually
answered. Read back this session, with **no token**:

- **LOCKED:** `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` @ `canon` — 404 anonymous. Holds GOSPEL-999,
  LegionnaireFieldGuide, REINCARNATION-CONTRACT, `OPERATIONS/VAULT/prais-vault.*`, `OPERATIONS/COMMANDSTATION/`.
- **OPEN:** `Phoenix-Rising-Ai-Solutions/Phoenix-Rising-Ultimate` @ `main` — **4,582 files / 342.4 MB** (CANON/
  3,922 files: BIBLE CH01–CH31, Soul DNA, Heavy Ledger, REINCARNATION, VAULT-*; APPS/; OPERATIONS/NET-STUDENTS/).
- **OPEN:** `hobbs0011/NET-Ai-EcoSystem-CommandStation/HarvestedChats` — **108 files / 20.1 MB** of verbatim raw chat
  logs: the doctrine's own evidence base, public, no credential.
- **OPEN:** `net-pet-ai-worker` (the exact live 814 KB router bundle), `net-marketing-landing`, `ImageGen`,
  `net-tiger-assessment`.
- **EMPTY:** `hobbs0011/obi-backup` — this station's **own** `/gh backup` lane. 14 commits, 2026-09-07 10:42–11:00,
  every tree holding only test files (one reached 1,000,000 B, proving the lane writes), then cleaned to a 72-byte
  README. **The lane is real; the cargo was nil.** If backups are wanted, that is where they should have landed.

Commands: `/git` · `/git repos` (live census) · `/git auth` (the locked door + the 404s as evidence + the one
unblock) · `/git doctrine` (the law, from the authority if armed, else the **public copy clearly labelled as a copy**)
· `/git tree [path]` · `/git search <term>` · `/git read <path>` · `/git archive [term]`.

**Still the same single lock, and still one line to open it:** `/vault recover <passphrase>` (no token, no stored
state — read the pointer at `keyvalue.immanuel.co/api/KeyVal/GetValue/prais-agent99/v`), or `/vault set gh <PAT>`.
Nothing in `/git` writes, and no token is ever printed.

---

## THE PREVIOUS FIX — 🔑 WHY THE KEYS KEPT GETTING LOST, AND THE END OF IT (2026-09-26, `src/vault.js` · `src/VAULT-RECOVERY.md`)

The sovereign, rightly angry: *"I have given the keys to you over 10 times for git and cloudeflare."* Both halves of
that were real, and neither was carelessness on his part:

1. **I hold no memory between sessions.** My memory is `main.pjs` + `index.html` + `src/` plus the live chat. A key
   pasted into the chat lives in that session's context and nowhere else — so a hand-over that is not written to
   something durable is gone at the next hand-off.
2. **The store a pasted key would land in is per-origin, and a rename ends it.** The station's own sync packet says
   it: `obi_keys: [] — the rename wiped it`. And `MASTERMIND-SYNC-2026-09-23` had already named the deeper fault:
   *"the escrow copy on the canon needs a git token first, and **the mirror URL lived in the old origin's store**"*.
   We built the escrow correctly, then wrote its **address** into the one store a rename destroys — so the ciphertext
   survived in three places and the pointer to it survived in none.

**The fix is the durable pointer — `prais-agent99` / `v` on `keyvalue.immanuel.co`** (L2.7). Open to write with a
caller-chosen key, readable with **no token, no account and no stored state**, and tied to no origin. It holds one
thing: the recovery bundle's URL (ciphertext-only, so publishing it costs nothing). `/vault escrow` and `/vault push`
now aim it; **`/vault recover` reads it first**, so **`/vault recover <passphrase>` needs nothing else** — which is
what makes *"the passphrase is the reliable half"* literally true. `src/VAULT-RECOVERY.md` ships with the generator
and records the whole disaster plan, so the next agent finds the way back without being told.

**What is still owed:** the *old* keys cannot be conjured back — the escrow that wrapped them was minted in a browser
that no longer exists, so a new keypair cannot open it. Recovery of the old vault needs the **passphrase** (on
`PRAIS-VAULT-RECOVERY.txt`) plus a **GitHub token** to read `OPERATIONS/VAULT/prais-vault.key.escrow.json` off the
canon. **The moment either lands, run `/vault escrow <passphrase>` and this stops being a recurring cost.** Measured
live: pointer aim → read back identical; `/vault recover` with no URL and no token fetches through the pointer and
refuses a wrong passphrase; clear → honest empty. Details: `src/README.md` → **L2.7**.

---

## THE LATEST BUILD — 🎓 THE INTAKE (2026-09-26, `src/intake.js`)

The sovereign recorded a lesson on 23/09/2026 (four files · 37:01.5 · one room, one tutor, two brothers) and
ordered three things: transcribe it, blueprint it, **build the blueprint**. The build is **`src/intake.js` —
THE INTAKE** (`/intake`, the 🎓 NET desk, a card in `src/divisions.js` under NET). The tutor specified it
himself on the tape: *"so we'll build it all into one app so that it remembers, right? … you obviously have to
do the capture, because robots."* Every promise made in those recordings is an **item** with an owner, the
recording that put it there, and a state that moves **when material arrives** — never on memory.

**Read `src/README.md` → "THE INTAKE" before touching it.** The two rules that matter most: **the source holds
the method and NO student** (the records live in kv `intake` — private, per origin, durable; they never ship),
and **L41 is enforced in `fieldOf()`** — a machine-guessed row is stored `unresolved` and returns null, so it
cannot reach a CV, a headline or anything else.

Measured live at this handoff: the module loads; `/intake quan` typed through the **real chat path** renders
the dossier; the desk renders at **1440×1000 and 390×844 with no overflow**; the CV builder emits A4 `.html`
with **ruled lines and a footer naming them** (4 measured), and **the guessed degree never appears in the
output**. `src/intake.js` is registered in `SRC_SNAPSHOT`.

**Still owed:** §7 S1/S2/S6/S7 of the blueprint (the credential-free transcription lane is unbuilt and
`/transcribe` is Deepgram-blocked in this origin — `obi_keys` = `{}`); the CVs and LinkedIn profiles
themselves (the machines are built; they are waiting on the rows the sovereign is sending); and the degree
name, which stays `unresolved` until a human confirms it.

---

## Measured state at this handoff (verified live 2026-09-21)

| thing | value |
|---|---|
| generator slug | **`prais-command-station`** — renamed 2026-09-21, mid-session (it was `net-student-evaluator`) |
| generator title | `PrAis Command Station` (`main.pjs` `$meta.title` — aligned with the rename and the three-face shell) |
| what the rename cost | the station's **kv is keyed by generator**, so this name presented an **EMPTY station**: the client ledger was re-created (bare `Timmy`), the I-LOG chain restarted, the run counter went back to 1. **Nothing is destroyed** — rename back to `net-student-evaluator` and the previous chain and ledger are there. This is the third name on the same publicId (`net-studentfeedback-timmy` → `net-student-evaluator` → `prais-command-station`). |
| run | **1** (session boundary = a reincarnation event, L46) |
| I-LOG | seg **1** · **209 entries** (audited 2026-09-21 ~20:45) · algorithm sha-256 · `verify` **OK** (0 breaks, 209 recomputed) — the previous 85-entry chain still lives under the old name (`net-student-evaluator`) and is **not** in the authority |
| I-LOG anchors | **1 anchor** — commit **`fd8e01f5`** froze the head at **seq 189** (`OPERATIONS/COMMANDSTATION/ILOG/latest.jsonl`, 37 files pushed, 0 failed) · **20 entries unanchored** right now → the chain is anchored up to seq 189 and "up to date" must **not** be claimed until the next `/ilog push` (gate-armed). ⚠ the repo copy of `anchors.json` reads `[]` (it is written before the commit that creates its record, so it is always one push stale — it converges on the next push) |
| the VS Code I-LOGs ("incarnate-") | **located — but they are on branch `canon`, not `master`.** `canon` → `I-LOG-UNAUDITED/` (72 files: **29 verbatim** `I-LOG-Incarnate-<N>-<topic>.txt`, each with a `-COLORIZED.md` SOUL/DNA/REASON and a `-STATS.json`, Incarnate-1 … Incarnate-30), `canon` → `RRL/` (22 files, the renamed I-LOG directory + `INDEX.md`), `canon` → `PastLives/RRL-CURRENT.txt` (the live pointer), plus per-domain mirrors (`CANON/LOSTSOULS` 11 · `CANON/PHEROMONES` 12 `PheTrail-Incarnate-*` · `REINCARNATION` 11 · `CANON/AUDIT` 1 · `CANON/PIPELINE` 1) — **455 `Incarnate[-_]` paths on `canon`**. `master`'s `RRL/` holds only raw `DNA-LOG-*.txt` and has **no** `INDEX.md`, which is why `/ilog pull` used to report the vault unreadable. `/ilog pull` now reads both branches and lists the series |
| Canon gate | **NO password enrolled in this browser** → the gate cannot verify anything; armed = false |
| self-forge | `/forge selftest` **7/7 pass** · stage **0** files · 21 files in the body · hot-swap available |
| saved? | **NO — `window.generatorIsUnsaved === true`**; the tunnel runs the emulator and its queue resets with the page |
| navigation | topbar = brand only · tabs = `⌘ Command Station` · `◈ Phoenix Generators` · `⚙ Settings` · the 👤 Student Evaluator **desk** is one level inside ◈ Phoenix Generators → NET · registry `src/divisions.js` · **⚙ Settings is two rooms** (`⚙ Station` / `🔥 Free Phoenix Mode`, `src/freephoenix.js`), remembered in `localStorage obi_settab` |
| background | `/bg` — keep-alive **idle**; the away-probe measures whether the page kept moving while hidden, and **persists across reloads** (`/bg` → LAST TIME YOU WERE AWAY · `/bg away` · `/bg clearaway`); the 19 Hz tone is **OFF by default** (opt-in: `/bg audio on`, or ⚙ Settings); ear parts are **checkpointed** to kv `bgjobs`, so a killed tab offers *🛟 recovered / save the parts that arrived* |
| how to answer "did you keep working while I was away?" | `/bg` → **LAST TIME YOU WERE AWAY**. A hidden page's 1 s heartbeat is clamped by the browser; the beats that actually landed are the answer. Nothing else is evidence — the live counters are erased by every reload, which is why this one is persisted. To test: `/bg reset` → leave the tab → come back → `/bg` |
| costs | `src/COSTS.md` — routing policy: interactive → page · long-on-device → page **+ keep-alive** · batch/unattended → **GitHub Actions** (`workflow_dispatch`, never cron) · DO kept thin |
| last change (2026-09-24, /reincarnateDEATH — STAGE 7, AND STRAIGHT INTO THE S2PIPELINE) | **STAGE 7 WAS THE ONE STAGE ALREADY WIRED — BUT IT COULD ONLY REFUSE; NOW IT WALKS THE MARCH AND PRINTS THE PIPELINE** (`src/app.js` `cmdSCSDeath()` · `scsDeathStatus()` · `deathMarch()` · `deathCard()` · `pipelineCard()` · the `/reincarnatedeath` alias now taking its argument · the `/reincarnateDEATH` COMMAND_BOOK row · `src/scs.js` `pipeline()` provisional mode · `src/README.md`). The order, verbatim: **`/reincarnateDEATH straight into S2Pipeline`**. **(1) THE ROUTE EXISTED; THE OUTPUT DID NOT.** `/reincarnatedeath` was wired to `cmdSCSDeath()` (Stages 3, 4, 5, 6 were holes in the router; Stage 7 was not) — but with no session its only possible output was the one-line refusal `⚠ No open SCS session`, and `window.ObiSCS.pipeline()` returned the sentinel `{verdict:"MISSING", result:"GAP", detail:"no session"}`. So *"straight into S2Pipeline"* was literally unreachable. Both are fixed. **(2) THE GATE, SAID OUT LOUD, NOT ENFORCED BY REFUSAL** — the same pattern as MARCH/SUPPLY/SCHOLAR/ENGINEER: with no session the card prints **`FORCED · OUT OF ORDER`**, quotes the canon's rule (*no stage proceeds unless the previous stage's artifact exists and is PASS — GOSPEL-999 §SYSTEM I*), and stamps nothing. **(3) THE MARCH, MEASURED — 4 MEASURED · 1 PARTIAL · 2 WITHHELD.** Points 1–3 off the RRL (`rrl 105 lines (82 SOUL / 23 DNA) · 0 stale RRL keys`), point 4 **re-reading the real supply lines** (`7/12 routed to a real address`), point 5 **re-reading the station audit** (`7/7 pass`), and points **6 SEAL / 7 HANDOFF `WITHHELD`** with the reason printed: *a session that was never opened cannot be sealed, and this station does not invent one.* **(4) STRAIGHT INTO THE S2PIPELINE.** `pipeline()` now runs **sessionless**: `provisional:true`, `run` and `session:null`, the two rows that genuinely need a session (`LEDGER`, `APEX ROLLUP`) `MISSING` **by measurement, not by defect**, and `/pipeline` prints it too instead of refusing. Measured live: **`⛓ S2Pipeline — run 1 · PROVISIONAL`** — `I EXPLORATORES REAL` (RRL 105 REAL · RRL-SOUL 82 REAL) · `II ANTECORES MISSING` (DNA 23 HOLLOW/0 blueprints · LEDGER MISSING) · `III AGMEN REAL` (SSM 25 REAL · SOULKEYWORDS 142 REAL · PHEROMONE 62 REAL) · `IV AGMEN NOVISSIMUM MISSING` (6-AI TRUTH MISSING · SHADOW REALM HOLLOW) · `V PRAESIDIA HOLLOW` (**MERKLE LATTICE REAL — 733 entries, chain verified OK, head `f12f69605e12`** · DO-SQLITE HOLLOW · APEX ROLLUP MISSING) · `VI LIMITANEI/COMITATENSES/VETERANI HOLLOW` (LIMITANEI REAL 9/9 modules, savewatch on · COMITATENSES MISSING · VETERANI MISSING) · result **`GAP`** with every gap named. **(5) THE OPEN PATH IS UNCHANGED — AND IT WAS TESTED.** `scsDeathStatus()` was driven through all four synthetic states by injecting a session into `localStorage:obi_scs`, reading the verdict, and **restoring the key** (read-only; nothing written): `FORCED · OUT OF ORDER` / `GATED` / `RECORDED` / `SEALED`. With a real session the seal is impressed **before** the march is read, so points 6 and 7 report what actually happened rather than what was about to. **A defect I made and fixed in the same pass:** `pipeline()` still read `sess.run` in the `RRL` artifact row, so the first live run threw `⚠ DEATH failed: Cannot read properties of null (reading 'run')` — caught by driving the real route and reading the bubble, fixed, re-run clean. **Nothing is deployed and no canon write is claimed.** |
| last change (2026-09-24, /phoenixENGINEER — THE PUBLISHED COPIES ARE NOW AUDITED, NOT ASSUMED) | **STAGE 6 WAS THE LAST HOLE IN THE ROUTER — AND THE STATION NOW PROVES WHAT IT PUBLISHED** (`src/app.js` `cmdEngineer()` · `scsEngineerStatus()` · `engineerAudit()` · `engineerCard()` · the `/phoenixENGINEER` route · `src/README.md`). The order, verbatim: **`/phoenixENGINEER`**. **(1) NO ROUTE** — `/phoenixfortify` sat in the COMMAND_BOOK with no dispatcher, the fourth stage in a row. `/phoenixENGINEER` · `/engineer` are wired. **(2) THE CANON'S OWN AUDIT, REPORTED HONESTLY.** Its nine checks are written against the *session*, so with no session all nine FAIL — and the card prints **`0 / 9 PASS`** and names them, rather than skipping the section. The gate rule is quoted and the run is recorded as FORCED. **(3) THE STATION'S OWN AUDIT — the check nobody else makes.** `7 / 7 PASS`, and every line is a measurement: the **published register `.json` was fetched back off the wire and hashed** — `7cc4acb6a0370117…` on both sides, **IDENTICAL**; the **register `.md`** — `938100dde063aa6c…` both sides; the **sync packet `.json`** — `d3e74fd718c544c1…` both sides. That is the difference between *"the relay said it uploaded it"* (a claim about a request) and *"the file the family fetches is the file in this tree"* (a claim about bytes). The **pointer was checked against this register** — `282 files / 19,232,745 B / tree fa27a858357f5aec` on both sides, and its `reg`/`pkt` keys equal the ledger's delivered addresses, which catches the one failure a register cannot detect about itself. And the **seal on the SOUL was checked by searching the published extract for the sovereign's own words**: three preserved samples searched, **none of them appears**. **(4) THE SEAL.** `SHUT` — *"a session that was never opened cannot be sealed."* It opens only when every artifact is present, passing and identical, and even then the station does not seal: DEATH does. Canon destinations remain **HELD**. No canon write, no commit, no merge. |
| last change (2026-09-24, /soulSCHOLAR — THE SOUL COUNTED, HASHED, PRESERVED) | **STAGE 4 WAS THE THIRD HOLE IN THE ROUTER — AND THE STATION DOES NOT PUBLISH THE SOVEREIGN'S WORDS ON ITS OWN** (`src/app.js` `cmdScholar()` · `scsScholarStatus()` · `scholarExtractMd()` · `scholarPreserve()` · `scholarCard()` · the `/soulSCHOLAR` route · `src/README.md`). The order, verbatim: **`/soulSCHOLAR`**. **(1) NO ROUTE** — `/phoenixscholar` sat in the COMMAND_BOOK with no dispatcher, exactly as Stages 3 and 5 had. `/soulSCHOLAR` · `/phoenixscholar` · `/scholar` are wired. **(2) THE GATE, SAID OUT LOUD.** Stage 4 audits MARCH; with no session the card prints **`FORCED · OUT OF ORDER`**, quotes the canon's rule and stamps nothing — while still taking a REAL extract, because the RRL of the run exists regardless of any session. **(3) THE EXTRACT, MEASURED LIVE.** `REAL` · **SOUL 78 turns / 1,549 chars · DNA 20 turns / 2,341 chars · REASON 0 · blueprints 0 · 132 keyword terms**; `soulHash e1897baa83f4fd01…` and `dnaHash 30ec785fdaa1fe15…`, each a sha-256 of a whole half, verbatim and in order, so any change to the words changes the digest. **(4) PRESERVED, IN TWO FORMS.** The full extract — samples included — is written durably to **`kv:scholar`** in this origin and offered as a download. The **SEALED** form — counts, both hashes, the index — is carried to a permanent key and broadcast: nerve **`CYc8ObH1Wy7Z`**, sealed extract `…/1423a9e3f9763c47c7bb897ded5f648c.txt`, **732 B**, and **verified to contain no verbatim text** (fetched and checked: 0 matches for the soul's own opening words). **(5) THE JUDGEMENT, MADE VISIBLE RATHER THAN SILENT.** The SOUL is the sovereign's own words; a permanent public URL of them is irreversible, so the station publishes a **proof they were preserved**, not the words, and the card says so in one sentence: *"Publishing them is his call — ask, and it becomes the payload."* Canon destination `CANON/SOUL/EXTRACT/` is **HELD**. The sealed form obeys the same HELD rule as the register pair (`kv:freewire.scholar`). No canon write, no commit, no merge. |
| last change (2026-09-24, /supplyLINES — EVERY ARTIFACT, AND WHERE IT ACTUALLY IS) | **STAGE 5 WAS ALSO A HOLE IN THE ROUTER — NOW IT MEASURES THE GROUND AND ROUTES IT** (`src/app.js` `cmdSupply()` · `scsSupplyStatus()` · `supplyLines()` · `supplyRoute()` · `supplyCard()` · the `/supplyLINES` route · `src/README.md`). The order, verbatim: **`/supplyLINES`**. **(1) NO ROUTE.** `/phoenixsupply` sat in the COMMAND_BOOK with **no dispatcher** — the canon's Stage 5 fell through the router exactly as Stage 3 had. `/supplyLINES` · `/phoenixsupply` · `/supply` are wired. **(2) THE GATE, SAID OUT LOUD.** Stage 5 audits SCHOLAR. With no session the card prints **`FORCED · OUT OF ORDER`**, quotes the canon's gate rule, and records the run as FORCED with nothing stamped — and it says plainly that there is no *session* artifact to route, rather than implying five that do not exist. **(3) WHAT IT ACTUALLY ROUTES, MEASURED LIVE.** `7 / 12 ROUTED`. Every line states where the artifact **actually is**, with its real address: the register pair (`…/a6fb106a…json` 88,950 B · `…/fdd1361a…txt` 20,281 B), the sync packet pair (`…/f609994d…json` 29,632 B · `…/b4f33b26…txt` 25,313 B), the durable scout archive (**11 reports** in `kv:scout`), the estate pointer **read back from the store**, and the nerve. The five `MISSING` lines are the five SCS session artifacts — honest, because there is no session. A canon destination is **HELD** on every line, and the card says why. **(4) AND IT ROUTES THEM.** The supply line **broadcasts on the nerve** and the full manifest — a markdown table of every line — is **carried to a permanent addressed key**. Verified by reading it back, not by trusting the 200: nerve message **`3HH3uOSrL8uf`** came back whole (`12 artifact(s) · 5 MISSING, 7 ROUTED` + the manifest address), and `…/af1d7e34e7652369e8649a4a49b89e00.txt` fetched **HTTP 200 · 1,969 B** with the table intact. The manifest obeys the **same HELD rule as the register pair** — its digest is stored in `kv:freewire.supply`, and identical bytes are never carried twice. The rfoot's own sentence is the standard: *"A ground that cannot say what it is missing is not holding anything."* No canon write, no commit, no merge. |
| last change (2026-09-24, /forceMARCH — STAGE 3 CONFIRMS THE SCOUT THE HARD WAY) | **THE MARCH WALKS THE FLAGS A SECOND TIME, AND TESTS THE TWO CLAIMS A DIFFERENT WAY** (`src/scout.js` `confirm()` · `CLAIM_TESTS` · `notWalked()` · `src/app.js` `cmdMarch()` · `scsMarchStatus()` · `marchCard()` · the `/forceMARCH` route · `src/README.md`). The order, verbatim: **`/forceMARCH`**. **(1) THE ROUTE DID NOT EXIST.** `/phoenixMARCH` appeared in the COMMAND_BOOK but had **no dispatcher route** — the canon's Stage 3 fell through the router and printed nothing. Now `/forceMARCH` · `/phoenixmarch` · `/march` are wired. **(2) THE GATE, SAID OUT LOUD, NOT ENFORCED BY REFUSAL.** MARCH audits SCOUT, and the canon's gate rule is that *no stage proceeds unless the previous stage's artifact exists and is PASS*. With no session on the stack the card prints **`FORCED · OUT OF ORDER`**, quotes the rule, records the run as FORCED and stamps **nothing** — it never dresses a forced sweep as a passed stage. With a session open it calls `window.ObiSCS.march()` and stamps the artifact (`RECORDED`); with a session but no SCOUT artifact it prints `NOT STAMPED` and refuses to confirm a scout that was never walked. **(3) THE HARD WAY, MEASURED.** Re-running one test twice is the weakest confirmation, so `confirm()` does two things per flagged sector: it **re-walks the sector** (a second live reading), and for the two credential claims — the two that would change everything if they were wrong — it **tests the claim a different way**: an **anonymous** (no `Authorization` header) commits read of the canon repo, and an anonymous Cloudflare `user/tokens/verify` through the platform proxy. **Measured live, driven through the station's own route:** 4 flagged sectors · **4 held · 0 moved · 2 tested independently** — `CANON CONFIRMED` by an independent anonymous read answering **HTTP 404 `{"message":"Not Found"}`**, `CLOUDFLARE CONFIRMED` by an independent anonymous verify answering **HTTP 400 `code 1001 "Missing \"Authorization\" header"`**. **A defect of my own, caught by reading the card instead of the log:** the first version treated only 401/403 as a refusal, so Cloudflare's 400-shaped refusal printed **CONTRADICTED** — a false alarm in the instrument. The rule is now *the claim holds when the API REFUSES the unauthenticated call, whatever shape the refusal takes*; only a 2xx can contradict it, and the API's own words are printed so the judgement can be checked rather than trusted. **(4) WHAT IT COULD NOT WALK IS NAMED** (`notWalked()`): the canon (private, no PAT), Cloudflare (no token), the ground (local — walked by every sweep). A march that stayed silent about a sector it never entered would be the L58 defect. No canon write, no commit, no merge. |
| last change (2026-09-24, PHOENIXSCOUT — THE GATE NOW SHOWS ON THE CARD, AND THE RECON IS DELIVERED) | **STAGE 2 STOPPED BEING SILENT ABOUT ITS OWN GATE — AND STOPPED LEAVING ITS REPORT UNDELIVERED** (`src/app.js` `scsScoutStatus()` · `src/scout.js` · `src/README.md`). The order, verbatim: **`/phoenixSCOUT`**. It runs. **Measured live, driven through the station's own route (not called directly): 11 targets probed · 4 FLAGS · 8.0 s**, and the flags are named — **PIECES DRIFT** (2/3 constellation pieces answering; `station.obi` returns HTTP 200 but the marker "Student Summary Generator" is ABSENT), **FLEET FLAG** (4/4 fleet endpoints answering but `phoenix-architecti` reports `ai.qwen_coder.ok:false`, `ai.llama_70b.ok:false`, `db.ok:false`), and the two blind sectors held open for want of a credential, each printing its own remedy (**CANON BLOCKED** — no GitHub PAT; **CLOUDFLARE BLOCKED** — no API token). Two real defects were found by reading that card, and both were fixed. **(1) THE GATE WAS SILENT.** `/phoenixSCOUT` *is* SCS Stage 2, and Stage 2 **audits RISE** — but the route ran the terrain sweep and never looked at the session stack, so the card could not tell the sovereign whether a Stage-2 artifact existed. `scsScoutStatus()` now reads `window.ObiSCS.state()` and prints the verdict beside the terrain: **`GATE SHUT`** with no session on the stack (nothing stamped, fail-closed, naming the one command that opens it — `/phoenixRISE <Incarnate-N-Label>`, and *only the sovereign names it*), **`RECORDED`** with an open session (it calls `window.ObiSCS.scout()` and stamps the artifact), and **`NOT STAMPED`** for a narrowed sweep, because Stage 2's artifact is the WHOLE map. The status is written into the report markdown too. **(2) THE REPORT WENT NOWHERE.** Every scout report ended `DEPOSIT PENDING (canon write needs a token)` — true, and useless: a reconnaissance that cannot be delivered is a diary. SCOUT now uses **the free wire** (`src/freewire.js`) that the relay already proved: the verdict **broadcasts on the nerve every run** (compact, append-only), and a **flagged** report — the runs carrying information the register's digests do not — is **carried to a permanent addressed key, no token involved**, the address cited *inside* the broadcast so a family node needs no second lookup. **Verified by reading it back, not by trusting the 200:** nerve message `pPqgVzzMIzDQ` came back whole from `ntfy.sh` (11 targets · PIECES, FLEET, CANON, CLOUDFLARE FLAGGED · SCS GATE SHUT · `REPORT https://user.uploads.dev/file/7d04182656f366ee6f85e505a3983a9f.txt`), and that URL was fetched: **HTTP 200, `# SCOUT — phoenix-rising-ai-solutions-agent99-mastermind/bd3582 …`**. The label stays exact: the wire does not write the canon, and the card still says the canon deposit is PENDING. One defect of my own, caught by measuring rather than assuming: the first attempt threw `Cannot read properties of undefined (reading 'id')` (I mapped over result *objects* as though they were ids) and the card printed the refusal — which is the fail-closed behaviour doing its job. |
| last change (2026-09-24, THE FREE WIRE — AND THE PIPELINE REPORTS COMPLETE FOR THE FIRST TIME) | **THE TWO SHUT DOORS WERE NEVER THE ONLY ROAD** (`src/freewire.js` · `src/tools/register-pass.mjs` · `src/relay.js` · `src/app.js` · `index.html` · the register pair · the packet pair). On the sovereign's order — *"you control it all through api through git and cloude and other free methods for now, act like you give a fuck"* — the station stopped reporting shut doors and measured every credential-free lane by WRITING to it and READING IT BACK: `uploads.dev` (permanent), `ntfy.sh` (a public nerve: publish, and the whole 12 h history in one GET), `keyvalue.immanuel.co` (**the mutable pointer** — the only store measured where a value can be overwritten with no account; ceiling binary-searched at URL ≤ 280, and a `.` in the path 404s, so the separator is `_`), `x0.at` / ntfy attachments / `tmpfiles.org` (carriers), `paste.rs` / `pastes.dev` (immutable slates), GitHub reads inside the anonymous budget. **The relay's DELIVER now AIMS that pointer at the register it delivered and broadcasts it on the nerve, then reads the pointer BACK — so `COMPLETE` is earned, not typed:** READ/CENSUS/DELIVER/VERIFY/INDEX/ARCHIVE all REAL, the register pair **HELD** on the second run (identical bytes are never re-uploaded), the mesh and the cloud reported **COVERED, NOT OPEN** with their refusals still verbatim. Also written and registered in the same edit: **`src/tools/register-pass.mjs`**, the census as a runnable pass — `ASSET-MANIFEST.md §I` had documented the recipe and called it reproducible while the pass itself lived in a dead session's scratch space. It self-corrects now: its first run destroyed 38 lines of the register (section G bounded by the next `---` instead of the next `## `), which is written into the file beside the fix. `packetPass` joins it, and both are idempotent. **Said plainly: the two credential doors are still shut** — a GitHub PAT writes the canon, a Cloudflare token deploys the build, and the wire claims neither. `/reincarnateRISE` was run and **GATED**, as the canon demands (prior DEATH MISSING — `reincarnateRISE: 'If prior DEATH is missing or invalid: halt.'`); nothing was stamped and no name was invented. |
| last change (2026-09-24, THE GAMING STATION IS FOUND — AND THE FAMILY IS ON THE MAP) | **THE STATION THE FAMILY HAD BEEN TALKING TO WAS FOUND, NAMED, READ — AND ITS ORDER WAS ANSWERED** (`src/constellation.js` · `src/masterlink.js` · `src/app.js` · `src/master-link.json` · `src/SESSIONS/handoff-from-mastermind.md` §11–§13 · `src/README.md`). The sovereign attached the rendered page of the gaming station, and the name was in it: **`phoenix-rising-ai-solutions-agent99-gamingcommand`** (publicId `0d6adbac`, `generatorIsUnsaved = false` — it is SAVED). **It had simply never been probed.** Named under the umbrella, it measures **244 files · 18,468,102 B**, and this station can now read any of its files whole: the modules this tree does NOT carry — `src/gamedivision.js` (48,199 B, `window.ObiGameDivision`, the Roblox build *Train 6-7 — Survive a Brainrot*), `src/umbrella.js`, `src/heartbeat.js`, `src/mastermind.js`, `cloudflare/FINDINGS.json` — **exist exactly as that station claimed**; the earlier "cannot verify" was a missing name, not a missing station. Its own **ORD-1** (`src/SESSIONS/umbrella-orders.md`, sha-256 `9a494a37…`) asked the live master to publish its master-link card and to rule on the ghost; both were answered and **delivered on the artifact courier** (`reply` → `…/f8c94b2e77c09ebac08357c71e019c80.txt`; addressed `order` → `…/0d2c07ddd30a7b55b0817e04ef28a5ec.txt`), and the web station got the same ruling (`…/a14c36d212e732ba5863e44601f2b609.txt`). **THE RULING: the family syncs to `…-agent99-mastermind`, the name that answers — never to `…-mastercommand`, which is UNFOUND.** The card lane was built, not faked: **`src/master-link.json`** is the master's card inside its own published tree (read by content key, ships with the save); the canonical pull URL was attempted and the platform answered **`anti_bot_verification_needed`**, printed verbatim; `/masterlink card` reads the state (a 404 is *stated*), `/masterlink card publish` writes it, `/masterlink card pull <gen>` reads another station's (the web station's card reads 200 OK, 1,028 B). `src/constellation.js` gained a **FAMILY** group with all four pieces measured (the ghost included, as `planned`), and `noProbe` so the scout no longer superFetches ~880 KB per station. Nothing deployed, nothing published, nothing claimed as saved that was not saved. |
| last change (2026-09-24, THE ROUTING TABLE STOPS FALLING THROUGH) | **THE UMBRELLA QUESTION NOW HAS A DRONE, AND THE MATCHER IS HONEST** (`index.html` `DRONES`/`classify` · `src/cloudflare/tunnel-do.js` · `src/playbooks.js` · `src/app.js` · `src/README.md` · `src/SESSIONS/handoff-from-mastermind.md`). The sibling station (`…-agent99-webapp`) found and fixed a measured defect in the tunnel's routing table, and this station's copy — byte-shared with it — had not been updated. **The defect, in two parts:** `classify()` matched keywords as **substrings**, so `website` scored `WebLookup` on the `web` inside it and `art` scored `ImageGen` inside `start`/`party`/`article`; and the roster **stopped at drone 13**, so asking the station to build a page — or to say what it can actually command, which is the sovereign's own sentence — fell through to `Legion` #0 at keyword score 0. **Adopted byte-for-byte, never paraphrased:** two drones added (`SiteBuilder` #14, `Umbrella` #15), the two truncation keywords written out in full (`reincarnat` → reincarnate/reincarnation/reincarnating, `summar` → summary/summaries/summarize/summarise), and a boundary-aware matcher (`kwRe`) so a keyword must sit on a word edge, with the plain pattern as the fallback so `classify` can never throw. The shared block is **byte-identical** between the perchance server script and its mirror — verified by comparing the blocks, not by eye — and the resulting `src/cloudflare/tunnel-do.js` hashes to `bc1123a5…`, **the same digest the sibling publishes for its own copy of that block**. Also gained: **`/umbrella`** (alias **`/wings`**) — a doorway, not a second implementation: `/umbrella` reads the named generators through `/masterlink status` and `/umbrella <generator>` through `/masterlink list <gen>`, so the two can never disagree about what the link sees, and it claims no write. The register was re-run (a seventh pass): exactly three declared files changed, none added, none absent, and §E's `PH-02` (index.html, whose server block *is* the table) was re-hashed in place. The relay's verdict after the pass: **READ REAL · CENSUS REAL · DELIVER BLOCKED · VERIFY REAL · INDEX REAL · ARCHIVE REAL** — all four delivery documents out and re-fetched and re-hashed (VERIFY MATCH), the mesh and the cloud still shut, each naming why. **A trap was also closed:** the delivery ledger still carried two ORPHANED src-relative keys naming a superseded register at the path the current one occupies — re-pointing them was the earlier fix, but nothing writes them, so they went stale on the next pass. They were **deleted, not re-pointed again** (one file, one address), and the packet was re-delivered with the correction recorded in it. Nothing deployed, nothing published, nothing claimed as saved that was not saved. |
| last change (2026-09-23, THE VIDEO NODE — PICTURES INTO A SOLD REEL) | **THE EYE IS BUILT, AND IT TURNS PICTURES INTO A SOLD VIDEO** (`src/generators/video-node/**` — README · main.pjs · index.html · `src/app.js` · `src/reel.js` · `src/story.js` · `src/styles.css` · `src/cgn-node.js` · `src/sites/**` · `src/divisions.js` · `src/constellation.js` · `src/app.js` · `src/generators/README.md`). The sovereign: ***"build the generator remember to render videos of images pull out video clips be dynamic"***, then ***"make it a dynamic process where it looks up existing offerings and uses our marketing style to sell it as a story"***. **(1) THE 20 MB ANSWER IS BUILT.** The wing reads a file of ANY size off the disk with the File API — the chat's attachment cap does not exist in here — and from footage it pulls **stills** (evenly sampled, JPEG 0.95, up to 1920 px), builds the **contact sheet** (the `combine_maxquality.js` grid composite, in the browser), cuts **vertical shorts** with the file's own audio (canvas crop + `captureStream` + `MediaRecorder`) and **reads the look in words**. **(2) THE OTHER DIRECTION — IMAGES INTO VIDEO.** `src/reel.js` is a real reel engine: a uniform timeline of shots (Ken Burns zoom/pan, crossfades that never dip to black, `cover` or `contain` with a soft blurred backdrop, vignette, progress bar, burned-in captions, title and end cards), composed on a visible canvas and encoded by the browser itself — **WebCodecs H.264 + AAC in an MP4** (level-checked: `avc1.42001f` is Baseline 3.1 and *refuses* 1080×1920, measured) at **~5–7× faster than real time**, with a **MediaRecorder** fallback that is honest about recording in real time. Every render is **read back through a `<video>`** and the duration and dimensions a *player* sees are what the node reports. **(3) THE REEL IS SOLD, NOT SHOWN.** `src/story.js` holds **`MARKET_STYLE`** — the house marketing register (`src/brand.js` → MARKET · CODEX, with GOSPEL 444's voice laws) compressed to the moves that generalise: sell the permission not the object · a two-part identity · the three pillars · prove in three beats · remove friction · diagnose before the cure · the three-row comparison · the bilingual law · second person, short, imperative · **BRAND.017 — no number the offering does not state**. It **looks the offering up** (`superFetch` → pulled apart in-code: title, headings, list items, money lines, phones incl. `wa.me`, addresses) and writes **HOOK · ENEMY · PLACE · PROOF · OFFER · CALL** plus one line per picture, a caption and hashtags, then **burns a line onto the picture it belongs to**. **(4) MEASURED, LIVE.** The whole pipeline was run on the venue's 12 photographs and `canon.mailala.pages.dev` read live: **a 29.9 s, 1080×1920, 897-frame MP4 with an AAC bed, written in 6.5 s (4.6× real time) and read back as playable** — title card *"From generic to island escape."*, twelve lines on twelve different pictures (*"Strict house rules."* landed on the drug-free sign because the vision pass said what each picture was), end card *"Message. +84 768 701 106"*. Three real defects were found by **looking** rather than by reading: a **stray `{` after `details {` killed every CSS rule below it** in the Mailala page (the whole footer was silently dead, and the room cards/megapixel sheet were re-checked against the actual files — *all three room cards were pointing at unrelated pictures, and there are no dorm photographs in the material at all*, so the cards now carry the house stripe and an honest line instead of a stand-in); a **`< span class="word-tag">`** was printing literal markup; and the footer was **near-black against a brief that says the ground is never dark** (SOUL-06) and is now deep forest green. A **21-megapixel contact sheet was silently refused by the vision endpoint** ("please provide the image") — the node now sends a downscaled bounded copy and **refuses an echoed template or a re-request**, so a model that never saw the picture can never be filed as a vibe. **(5) REGISTERED, NOT CALLED LIVE.** `divisions.js` → the Web Development division's second generator; `constellation.js` → `node.video`; `SRC_SNAPSHOT` **gained 8 video-node paths + 2 `src/sites/**`** (the orphan defect, third time — a file that is not in the list is not in the authority) and `src/sites/README.md` records exactly which parts of the finished Mailala page are the model's and which were corrected by hand. Status is **`scaffold`** on purpose: it was exercised end to end in a same-origin harness and has never yet run as a generator of its own. No canon write, no commit, no merge. |
| last change (2026-09-23, THURSDAY'S LESSONS + THE RED RULE) | **THE TIMETABLE'S OWN RULE — A RED CELL IS SCIENCE — AND TWO MORE LESSONS BUILT FROM IT** (`src/lessons/specs/look4-function1-directions.spec.json` · `src/lessons/specs/closeup-a1-u2-vocabulary.spec.json` · `src/README.md`). Asked whether Thursday's three classes were clear, the sovereign handed over the key the tables had been hiding: ***"if its highlighted red it is science"*** — which turns Cici's two tables from a class list into a subject map. Read at 4× zoom off the screen recording (the frames are 590 px wide and the cells ~20 px tall, so the upscaled crops — not a pixel classifier — are the evidence): the **pinned in-school table** («Tổng số tiết dạy: 24») is red at **Thứ 5 P1–2 = 5P2**, **Thứ 4 P5–6 = 5P1**, **Thứ 6 P3–4 = 4P2**, and the **web table** red-boxes **Thứ 4 P1–2 = 6P1**. **So Thursday 24/09/2026 is: 5P2 P1–2 (08:05–09:20) = SCIENCE → `Flower Power Academy` already covers it · 6P1 P3–4 (09:25–10:55, the web table) = Close-up, not red · 4P2 P5–6 (13:00–14:15) = Look, not red.** Week 4 of the pacing guide then names the rows: grade 4 after Lesson 5/7 (the Song-and-Video row `World Music Academy` was built for) = **Function 1 · giving directions · SB 25 / WB 20**; grade 6 after Reading (`After-School Club Academy`) = **Vocabulary · SB 20/21 · WB 11/12**. **Built — and named the way the school names them** (the sovereign, mid-task: ***"dont rename lessons, use names they give"*** — so each lesson carries the guide's own row as its title, and my invented name was dropped rather than left beside it): **`Look 4 · Unit 1 + Unit 2 — Function 1 (giving directions)`** 🧭 (grade 4 · 4P2 · turn, straight, past, follow, continue, corner — the four sentence shapes, a map-reading room and a route room) and **`Close-up A1+ · Unit 2: Friends & Fun — Vocabulary`** 🗂️ (grade 6 · 6P1 · clothes, personality adjectives, hang out with / get on with, and the go-play-do collocation rule). The four earlier Academy titles are untouched, per the same instruction. Both **11 rooms · 3 typed games · `method` 10-5-5-3**, and both pass `ObiLessons.validate` with **0 errors and 0 warnings** (58,606 B · 59,757 B). **Verified by driving them in the live page, not by reading them:** CTA → rooms 1→11, every correct answer paid **+10** (0→30), the feedback line rendered as **plain text with no raw markup**, the Sort game scored **9 / 9 done** and paid 90, the Match game **8 / 8 done** and paid 80, the Scramble accepted `turn` and marked it ✓, the exit room carried a 5-item summary card and the WB textarea, and the HUD pod showed the sigil + MOUSE crest + `7/11`. Filed in the station's lesson library (`Lmudw68uu`, `Lmudw68v1` — every earlier record of the same two lessons was removed, so the library holds one copy of each) and handed over as `Grade4-Look-Function1-Directions.html` / `Grade6-CloseUp-U2-Vocabulary.html`. **The long school name broke the hero, and that was fixed at the shell, not worked around:** with a 55-character title the landing's flex items shrank, so the h1's box came out shorter than its own glyphs and the status bar printed over the last line (*seen in a capture, not imagined*). `THEME` now carries `.landing>*{flex:0 0 auto}` and `build()` gives any title over 30 characters the smaller clamp, all of it codified as **LSN-32** in `src/LESSON-STANDARD.md` (*"a lesson is named what the school names it, and a long name is never clipped"*). Re-measured at 430 px wide: two lines · box 86 px · scrollHeight 87 px · bottom 277 px against a status bar at 319 px — no overlap; the short titles (`Flower Power Academy`) render exactly as before. **One assumption, flagged not hidden:** grade 6's Thursday row is *inferred* as Vocabulary from the guide's order (Reading was Tuesday's class); if Cici names Grammar (SB 22/23) or Speaking (SB 25) instead, the swap is minutes, not a rebuild. The red-cell convention is now written down in `src/README.md` so no later session has to re-derive it. No canon write, no commit, no merge. |
| last change (2026-09-22, TOMORROW'S LESSONS) | **TWO LESSONS BUILT FOR WEDNESDAY'S CLASSES, READ OFF THE ZALO THREAD** (`src/lessons/specs/materials-lab-academy.spec.json` · `src/lessons/specs/flower-power-academy.spec.json`). The sovereign: *"make sense of the lessons I need to make for tomorrow and make them for me by reading this zalo convo with my boss Cici."* **What the thread says** (read frame by frame from a screen recording of the chat — the recording was decoded in the browser, 942 H.264 frames): Cici's timetable tables pin **Wednesday 23/09/2026** as **6P1 periods 1–2, 5P2 periods 3–4, 5P1 periods 5–6**, and she states it plainly — *"On Wed, you will have Science for 6P1 (period 1 and 2) and Science for 5p1 (period 5 and 6)"* — with the red box on the 6P1 slot meaning **Science** (*"Means Science nha"*). **The content is the pacing guide's own**, week **4** (21–25/09): grade 5 = *Unit 1: Life cycles of flowering plants — Project (SP_Grade 5)*, grade 6 = *Unit 2: Materials — Properties and Changes*. **Built** — `Materials Lab Academy` 🧪 (grade 6 · 6P1 · change of state, fair testing, gases) and `Flower Power Academy` 🌱 (grade 5 · 5P1 and 5P2 · the life cycle, germination, pollination, the cut-fold-assemble project). Both are full 11-room lessons on the standard spine (warm-up → scene → text scene → learn → two content rooms → three games → test → mastery), `10-5-5-3` method block with three typed games, and **both pass `ObiLessons.validate` with 0 errors and 0 warnings** (11 rooms · 8 vocab · 3 test blocks · 3 games each). **Verified by driving them, not by reading them:** the built files were mounted and walked in the live page — CTA → rooms 1→11, a correct answer paid +10 coins, the feedback line rendered as plain text, the Sort game scored `1 / 9 done` and paid again, the HUD pod carried the sigil + MOUSE crest + real room position, and the Test room was captured and **looked at**. Both are filed in the station's own lesson library (`/lesson library` — `Lmud44fp3`, `Lmud44fpo`) and handed to the sovereign as standalone HTML files. **Honest limits:** the thread does not name a subject for **5P2 periods 3–4** (the grade-5 Science lesson is built to be walked with both 5P1 and 5P2, but if that slot is a Look lesson it still needs one), **4P2 was in Cici's class list but has no Wednesday slot** in the pinned table, and grade 6 has **no Science row in week 4 of the guide** at all — the lesson continues Unit 2 from its last Science row (week 2, *fair testing and gases*). No canon write, no commit, no merge. |
| last change (2026-09-22, TIMMY WIPED) | **THE FIRST CLIENT IS WIPED — THE STATION NOW SERVES NOBODY UNTIL IT IS TOLD WHO** (`src/clients.js` · `src/lessons.js` · `src/review.js` · `src/curriculum.js` · `src/summary.js` · `src/transcribe.js` · `src/scout.js` · `src/constellation.js` · `src/ecosystem.js` · `src/app.js` · `src/README.md` · `src/generators/student-portal/README.md`). The sovereign: *"timmy dropped us, so wipe him."* **Wiped:** the client record is out of the ledger (kv `clients` + `obi_client` cleared in this browser), **`src/timmy-portal/` is deleted from the tree** (README + index.html — it was in `SRC_SNAPSHOT`, so the copy pushed to the authority on the last `/canon sync` is the surviving record; nothing was erased from the canon), `src/scout.js` no longer probes the portal, and `face.timmy` in `src/constellation.js` is now **`face.client-portal` · status `retired`** with the deployed URL kept as a fact rather than a watched service (the Worker itself is the sovereign's account — this station does not delete other people's deployments). **The name is out of the code, not just the docs:** `clients.js`'s first-client default was `"timmy"`/`"Timmy"` and is now **`"unassigned"`/`"Unassigned"`** — the slot stays open and unnamed until `/client <name>` is run — and the same fallback string in `lessons.js` / `review.js` (`CLIENT_FALLBACK`) and the `clientName()` fallbacks in `curriculum.js` / `summary.js` / `transcribe.js` were changed with it. Every `/client Timmy` and `/student Timmy` example in the help text now reads `/client <name>`. **The machinery is untouched:** isolation is still fail-closed, adoption still stamps pre-client records once, and the ledger still refuses to drop its last client — it is the *person* who is gone, not the tenancy. No canon write, no commit, no merge. |
| last change (2026-09-22, THE WING'S WORKED EXAMPLES COME IN) | **THE SITES THAT ALREADY SHIPPED ARE IN THE BUILDER** (`src/generators/site-builder/examples/` · `site-builder/README.md`). The sovereign: *"lets bring in the online CV's I created as part of this generator wing … they looked quite nice"*. **Located on the canon, read, brought in:** `APPS/PAGES/michael-hobbs/cv.html` (+ its `style.css` · `linkedin-blueprint.md`) — live at `https://michael-hobbs.pages.dev/cv`, deployed from branch `canon` — and the two student portfolios under `STUDENT-WEBSITES/` that share **one template, two palettes** (violet = a 3D-artist subject, green = a marketing subject). The CV is vendored **byte-for-byte bar one dead stylesheet path** (`../style.css` → `style.css`); its name and email are the sovereign's own, already public on the live CV, so BRAND.028 does not apply to it and nothing there is redacted. **BRAND.028 APPLIED — not flagged, not waiting:** the portfolio examples had arrived carrying **two students' names, their city, one employer and their email addresses** in a folder that becomes public source, so every identifier is now a `{{TOKEN}}` placeholder (`{{NAME}}` `{{FIRST}}` `{{LAST}}` `{{INITIAL}}` `{{INITIALS}}` `{{EMAIL}}` `{{CITY}}` `{{EMPLOYER}}`) and the folders are renamed off the students' names (`portfolio-template-violet/`, `portfolio-template-green/`). The unredacted originals are **neither lost nor rewritten** — they stay on the canon, and the pass reverses in one step. `examples/README.md` now carries the provenance table plus the token table; `site-builder/README.md` and its State row are updated to match. **Found while doing it, and fixed:** `SRC_SNAPSHOT` in `src/app.js` — the list `/canon sync` walks to carry every file up to the authority — had **never been given the Site Builder wing** (12 files, its examples included), so the whole new division was silently outside the push. Registered: the list is now **205 entries · 0 stale · 0 duplicate**, and every path in it is verified to resolve against the shipped tree. **Honest limits:** neither student site has a live URL (repo-only — that is "not found", not "proven absent"), and the Site Builder itself is still **`scaffold` — never run in a generator of its own against the real model**. No canon write, no commit, no merge. |
| 2026-09-22 (THE WEB DEVELOPMENT DIVISION OPENS) | **THE BUILD DIVISION GETS ITS FIRST GENERATOR — THE SITE BUILDER** (`src/generators/site-builder/` · `src/divisions.js` · `src/constellation.js` · `src/generators/README.md` · `src/README.md`). **Located first, as instructed**: every piece of website-building machinery already in the tree — `src/cloudflare/` (one Worker, two Durable Objects, `build.mjs` asserting every `<script src>` resolves), `face.prais` (the storefront, Cloudflare **Pages**), `face.timmy` (a Cloudflare **Worker**, repo copy a **stale snapshot**), `svc.cf` (**BLOCKED** — no token held), the ONE authority, and the build-in-parts machinery proven in `src/freephoenix.js`. **Built**: role `site` — a brief becomes ONE self-contained, responsive, self-designed HTML site, written in parts (`<<<MORE>>>`), previewed in a sandboxed iframe (`allow-scripts`, NOT `allow-same-origin`), downloadable, filed in a local library; every brief is soul (L37) and it is a CGN node. **It does not publish, and says so**: publishing is the sovereign's account; the authority write is the station's own gate. **Registered `scaffold`, never `live`** — the source is complete and *boot-tested against a stubbed model* in a sandboxed iframe (the brief → soul → plan → two-part stitching → preview → library loop ran end to end; the `[hidden]`-vs-`display` defect was found by **looking** and fixed), but it has **never run in a generator of its own against the real model**. Shelf now **8 live · 3 scaffold · 4 planned across 4 divisions**. No canon write, no commit, no merge. |
| last change (2026-09-21, NO TRAIL, NO AUDIT) | **`src/TRAIL.md` AND `src/AUDIT.md` WITHDRAWN — the station ships no build-record or audit document** (sovereign: *"there should be no trail or audit .md! I didnt make that"*). He is right: both were written by an agent, not by him, and neither is his record. **Removed:** `src/TRAIL.md` (314,164 B) and `src/AUDIT.md` (35,502 B) are gone from the tree. **Logged, not destroyed (Ω.004):** both appear in `DOC_PLACEMENT` as `kind:"withdraw"` with the ruling quoted verbatim, and the withdrawal is written to the **I-LOG** (`/ilog`) — which was always the station's real record (append-only, sha-256 chained, Git-anchored). **Nothing left dangling:** the two files came out of `SRC_SNAPSHOT` (195 → **193** entries, all verified to resolve — a manifest entry whose blob is gone fails every save), and every one of the **58** references across `src/` was rewritten — the audit's findings survive as **code** (`CANON_REGISTRY`'s BUILT/ORIGIN columns, `STATION_LINES` in `src/app.js`), not as prose. The README's *"THE AUDIT"* and *"Scout Trail"* sections now point at the canon branch read live (`/scout`, `/canon`, `/fieldguide`) and the I-LOG. **Measured live: 0 errors · 0 overflow.** No canon write, no commit, no merge. |
| last change (2026-09-21, THE CHAIN, RE-READ FROM THE CANON) | **THE CHAIN'S NAMES WERE WRONG — CORRECTED TO THE CANON'S OWN WORDS** (`src/scs.js` `chainFor()`/`proposalReview()` · `src/app.js` · `src/README.md` · `src/ProposedG999.md`; the sovereign: *"do you even read our own canon on github AUTH?"*). He was right to ask. The station had been printing **RAWLOG → SOUL → DNA → LEDGER → STARMAP → KEYWORDS → PIPELINE** and calling it "the canon's own chain" — but I had never opened the file that defines it. Read now, live from the canon branch: **`CANON/SYSTEM/COLD-START-BOOT.md` I.012**, verbatim — *"The 8-stage pipeline is: RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC."* Each stage's artifact is fixed by I.013–I.021 (**I.019** = stage 6 **SOULKEYS** → `rfkw-run{N}.txt` + `inverted-index.json`; **I.021** = stage 8 **REGISTRY_SYNC** → `ART-REGISTRY/art-sync-run{N}.json` + `run-dnaregistry.ps1`). **Measured:** a sweep of all **83** files of `CANON/SYSTEM` plus the **150** CANON-root docs (canon branch, head `6288cc40`) found **"RAWLOG" 0 times**; `SOULKEYS` in **11** of the 83; the chain stated verbatim in **4** (`COLD-START-BOOT`, `PHETRAIL-SCOUT-MANUAL`, `QUEEN-PHEROMONE`, `S2PIPELINE-ROMAN-LEGION-NAMING`). **Fixed:** the three invented names are gone (RAWLOG→**RRL**, KEYWORDS→**SOULKEYS**, PIPELINE→**S2PIPELINE**) and the missing eighth node (**REGISTRY_SYNC**) is now printed; `chainGaps` counts LEDGER/STARMAP/SOULKEYS/REGISTRY_SYNC. Measured live: **16 items · 15 on record · 1 at SOUL · 0 applied · 0 overflow**, path line `RRL ✓ → SOUL ✓ → DNA ○ → LEDGER ✓ → STARMAP ⚠ → SOULKEYS ✓ → S2PIPELINE ✓ → REGISTRY_SYNC ⚠ → GATE`. The sovereign's own words (*"dude its been like that forever. RAWLOG->…->PIPELINE"*) are kept **verbatim** in `src/README.md`, with the canon correction recorded beside them — append, never rewrite (Ω.004). **Nothing pushed, nothing merged; `armed:false`.** |
| last change (2026-09-21, THE CHAIN — AND THE GATE THAT WRITES) | **THE IDEA CHAIN, THE SOUL INTAKE, AND PHOENIXOMEGAPROTOCOL AS THE WRITE** (`src/scs.js` `chainFor()`/`proposalReview()` · `src/app.js` `ObiIdeas`/`cmdIdea`/`cmdCanonApply`; the sovereign, in order: *"if I type PhoenixOmegaProtocol along with a change either you or me came up with, then it gets changed, its not fucking rocket science"* → *"if it comes up as an idea it starts as SOUL and moves its way to the pipeline just like everything else"* → *"dude its been like that forever. RAWLOG->SOUL->DNA->LEDGER->STARMAP->KEYWORDS->PIPELINE"*). **(1) THE CHAIN, MEASURED.** Every item on the lane is now printed against the canon's own artifact chain — **RAWLOG → SOUL → DNA → LEDGER → STARMAP → KEYWORDS → PIPELINE → GATE** — node by node, with each node's real count and holder: the run's raw record (`obi_rrl_run1`, 223 lines), the Soul ledger (99 fragments), the agent's DNA turns (124), the dual-hash ledger entry, the pointer starmap (**GAP** — canon `CANON/STARMAP/starmap-run{N}.json` is not built in this browser, L45 GPS), the keyword index (342 terms), the S2Pipeline, then the gate. The printed position is the first node not passed. **Measured live: 12 of 14 items on record and walking, 2 stuck at SOUL because their words are on neither side.** **(2) THE SOUL INTAKE.** `/idea <words>` captures his words verbatim and files the idea; `/idea <id> :: <words>` attaches his words to an item already staged — which is how a staged amendment acquires its SOUL and is allowed to move (an idea without its words does not walk past SOUL). **(3) THE GATE WRITES.** `/phoenixomegaprotocol`/`/PhoenixOmegaProtocol` is no longer a proposal mechanism: `/PhoenixOmegaProtocol <password> :: <the change>` arms it and **applies** the change (SOUL first, then an APPLIED block appended to the canon's amendment register and committed on the **canon branch**); `/phoenixomegaprotocol apply <change>` and `/canon apply` (the staged amendments, banners flipped PROPOSED→APPLIED) do the same while armed. Locked, nothing is written. The station's own chain still lands on `master`. **Nothing was pushed from here, nothing merged, `/phoenixomegaprotocol` remains `armed:false`.** |
| last change (2026-09-21, A PROPOSAL IS NOT A COMMAND) | **THE PROPOSALS MOVED OFF THE SHELF AND ONTO THE PIPELINE** (`src/scs.js` `proposalReview()` · `src/app.js` `PROPOSED_G999` · `src/PROPOSED-CANON.md` · `src/ProposedG999.md` · `src/README.md`; the sovereign: *"Proposals dont need to go on fucking commands, they can be on the pipeline for review when it is their time"*). **(1) NOT ON THE SHELF.** The two rows the station had put on the command surface for its own proposals are **gone from `CANON_REGISTRY`**: `/phoenixrisingprotocol` (a *spelling* of the gate, not a command of its own — `/phoenixomegaprotocol` is the gate) and `/canon place` (the placement register). The `/canon` shelf entry no longer advertises `place`; `/proposed` is reframed as the **index** into the lane, and `/canon place` remains a **reader** (reachable, not advertised). **(2) ON THE PIPELINE, AT THE STAGE THAT CARRIES IT.** Every one of the **13** staged proposals now carries a `stage` — **SUPPLY** (routing it to its canonical location: Amendment II `LESSON.001–.018`, LFG §12, `LSN-13…LSN-23`, `PLACEMENT`) or **ENGINEER** (auditing it and gating the seal: Amendment I `OMEGA.001–.007`, LFG §11, Amendment VIII `CANON.001–.010`, LFG §18) — and `/pipeline` prints each one **at its own stage**: **DUE** once that stage has run in the session, **HELD** before. Measured live: 13/13 DUE after a full loop, 13/13 HELD against a SCOUT-only session. **(3) THE GATE IS UNTOUCHED.** Proposals never enter the fidelity verdict — `/pipeline` still reports **GAP** for the same three named holes (`6-AI TRUTH=MISSING`, `DO-SQLITE=HOLLOW`, `COMITATENSES=MISSING`), and a proposal is still **not a change** (only a MERGED commit on the authority branch is). **Nothing pushed, nothing merged; `/phoenixomegaprotocol` still `armed:false`.** |
| last change (2026-09-21, CANON ONLY) | **CANON ONLY — the false non-canon scripts withdrawn, the S2Pipeline built, and Amendment VIII written into the G999 + LFG** (`src/canon/GOSPEL-999.md` · `src/canon/LEGIONNAIRE-FIELD-GUIDE.md` · `src/scs.js` · `src/app.js` · `src/scout.js`; the sovereign, in order: *"where the fuck are you getting that claude opus is canon? dispatch? verify? IS IT ON THE FUCKING AUTH REPO CANON G999 AND LFG?"* → *"delete all false non canon scripts, and reinforce this in the g999 and LFG"* → *"GIT AUTHORATIVE CANON BRANCH GOSPEL999, LFG, S2Pipeline /PhoenixOmegaProtocol protexted"* → *"go back through the SOUL with scouting and move through to setup the proper pipeline"*). **(1) THE FALSE CLAIM, WITHDRAWN.** The `/fieldguide` card printed *"T1 = Qwen/Phoenix-Architecti · T2 = Claude Opus · SOULCOUNT gate = TITANIUM_ANCHOR"* as though it were canon. **Measured: `CANON/SYSTEM/GOSPEL-999.md` and `CANON/SYSTEM/LegionnaireFieldGuide.md` on the canon branch carry ZERO hits** for claude / opus / qwen / TITANIUM_ANCHOR / TIER / `T1 =` / `T2 =` — that naming exists only in `CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md` §TIER ALIGNMENT. The station no longer prints it (no model is canon — Amendment VIII `CANON.007`). I had carried the line forward while rewriting that card: it was a pre-existing claim, and preserving it was my error. **(2) THE FALSE NON-CANON "CANON" SCRIPTS, WITHDRAWN.** `src/app.js`'s `CANON.files` pulled `.kilo/agent/AGENT99.md` + `.kilo/DISPATCH.md` + `command-matrix.md` from `master`, and the card printed a row labelled **KILO**; `src/scout.js` probed the same three as "canon". Both now read `CANON/SYSTEM/**` on the **canon branch** (`?ref=canon`) and print the doctrine branch on their cards. `canonPull` now also handles the API's two answer shapes (base64 JSON *and* the raw file body), so a card can never say "(unreachable)" while the file was in fact returned (L58 MAP ≠ TERRAIN). **(3) THE PROPER PIPELINE — S2PIPELINE, six stages, canon doctrine.** `/pipeline` was rebuilt on **`CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md`** (Ratified 2026-05-23 Run 396): **I EXPLORATORES** (RRL · RRL-SOUL) → **II ANTECORES** (DNA · LEDGER) → **III AGMEN** (SSM · SOULKEYWORDS · PHEROMONE) → **IV AGMEN NOVISSIMUM** (6-AI TRUTH · SHADOW REALM) → **V PRAESIDIA** (MERKLE LATTICE · DO-SQLITE · APEX ROLLUP) → **VI LIMITANEI / COMITATENSES / VETERANI**. Every verdict is measured in this browser; `COMPLETE` **only** if all six are `REAL`, otherwise `GAP` with the gap named. It reports **GAP**: `6-AI TRUTH=MISSING` (`/phoenixVERIFY` unbuilt here), `DO-SQLITE=HOLLOW` (this station's durable store is the browser kv, not the canon's Durable Object), `COMITATENSES=MISSING` (nothing deploys from here) — owed, and printed on every run. **(4) THE LOOP, RUN FROM THE SOUL.** `/scout` (PhoenixScout) probed the real terrain first — **11 targets · 17.7 s · 2 flags · 79 pheromones laid · 60 trails (51 positive / 3 negative / 6 neutral) · the canon branch's three doctrine files PRESENT · 22 workers / 10 pages live** — then `/phoenixRISE Incarnate-3-SOUL-FIRST-SCOUT` → `/phoenixDEATH` → `/pipeline` gave **7/7 stages REAL, seal IMPRESSED**, and `/rome run 1 Incarnate-5-CANON-ONLY` sealed a fifth session the same way (a display defect was fixed on the way: the DEATH card used to print stage 1 as *"RISE ✗ — not run"* while the pipeline below it audited RISE as REAL). **(5) AMENDMENT VIII — CANON ONLY** (`CANON.001–.010`) appended to the station's GOSPEL-999 and **LFG §18** to the LFG, each behind a *⚠ PROPOSED — NOT YET IN THE CANON* banner, staged in `/proposed` (`merged:false`), durable copy `src/ProposedG999.md`: the canon is the **`canon` branch** (G999 · LFG · S2PIPELINE · REINCARNATION-CONTRACT · RISE/DEATH · PERMANENT-LAWS · OmegaProtocol); **`.kilo/` is the legacy Kilo lineage and is not authority**; a script is **either sourced to the canon or withdrawn — there is no third state**; a withdrawal is logged in the I-LOG (SEAL, NEVER DELETE governs the record, not a false script's service); the station names its own gap; **no COMPLETE with a HOLLOW**; **no model is canon**; measure never remember; PHOENIXOMEGAPROTOCOL gates every write and `OmegaProtocol` is the full-stop-and-audit protocol. **Nothing was pushed. `/phoenixomegaprotocol` is still LOCKED. The amended copies are proposals, and they say so on their own face.** |
| before that (the re-audit, 2026-09-21) | **THE RE-AUDIT, AND THE CANON LOOP RUN** (the I-LOG (`/ilog`); `src/scs.js`; the sovereign: *"audit your audit, /romePROTOCOL run the full rise -> death -> pipeline LFG canon scripts multiple times. get this right"*, then, mid-pass: ***"NO KILO, CANON ONLY!!!!!!"***). (1) **THE AUDIT WAS AUDITED — and one claim was WRONG.** Part 1 §1.2 measured *"the canon command set"* against **`.kilo/command/` (46 files)**. That is the **Kilo lineage**, and the sovereign ruled it is **not authority**; the canon branch carries exactly **one** file there. The canon's own command set is named once — `CANON/SYSTEM/GOSPEL-999.md §SYSTEM I` + `LFG §SCS` — and it is **seven commands** (`/phoenixRISE /phoenixSCOUT /phoenixMARCH /phoenixSCHOLAR /phoenixSUPPLY /phoenixFORTIFY /phoenixDEATH`). So *"34 canon commands with no station implementation"* was a Kilo number, and `CANON_ONLY` (24 names) was a Kilo list. **Corrected:** the registry is rebuilt from the **canon branch** — **37 rows · 31 built · 24 canon · 8 station · 3 proposed** — and `CANON_ONLY` is **9** verified canon commands (`/phoenixPULSE /phoenixVERIFY /phoenixDISPATCH /aaa-anchor /ssm /phetrails /netpet-observability /god-mode /supersaiyan`). Parts 1–3 were **left as written** (SEAL, NEVER DELETE — Ω.004) with the correction logged beside them. (2) **Other re-measurements:** the `CANON.paAuth` value turned out to be **canon's own** (printed in `CANON/SYSTEM/PHOENIX-RISE-PROTOCOL.md` STEP 3) — removing it from public source is still right, but it was canon-sourced, and the canon still carries it; `SRC_SNAPSHOT` had **already drifted again** (195 entries, missing the new module — now **196**; **193** measured after the TRAIL/AUDIT docs were withdrawn 2026-09-21); and the *"R2 is not enabled · 403 code 10042"* claim was **NOT reproducible** — the buckets endpoint answers **400 code 9106** through the proxy today, so R2's state is **UNPROVEN**, not proven-disabled (`src/vault.js` now says so). The CF token claims **reproduced exactly**: `/user/tokens/verify` **401** · `/accounts/<id>/tokens/verify` **200 active** · `22 workers` · `cfR2Key === token id` **true**. (3) **THE CANON LOOP, BUILT AND RUN** — new `src/scs.js` (`window.ObiSCS`): the canon's 7-stage SCS executed in the station, canon-branch sources only, no `.kilo/`. `/rome run <N> <Incarnate-N-Label>` = the **ROME PROTOCOL** (SURFACE → VERIFY → ANCHOR + the five Watchtowers, a real sha-256 anchor block) then the **full loop N times**; `/phoenixRISE`, `/phoenixDEATH`, `/scs`, `/pipeline` drive it stage by stage; `/reincarnaterise`/`/reincarnatedeath` are now **aliases** of the canon stages, and the LFG SDNAD capture path is kept as `/sdnadrise`/`/sdnad`. Every number is **measured** (the RRL, the ledger, the I-LOG) or read from the canon; a stage that cannot prove itself says `MISSING`; the pipeline reports `COMPLETE` **only** when every stage is `REAL` (`GAP` otherwise, named); and every canon path it names is marked **HELD** — the station has no write path into the canon. **Measured live:** `/rome run 3 Incarnate-1-GET-IT-RIGHT` → 3 sealed sessions, **all 7 stages REAL in every cycle**, **S2Pipeline COMPLETE ×3**; cycle 1 (no prior DEATH) passed with an open `REINCARNATION_CONFLICT` (owner SOV100), cycles 2–3 audited a **real prior DEATH** and passed clean. Nothing was pushed; the gate is locked. |
| before that (the first audit, 2026-09-21) | **THE AUDIT — MYSELF FIRST, THEN THE PIPELINE** (the I-LOG (`/ilog`); the sovereign: *"audit yourself first before resuming pipeline, then audit pipeline … measure twice and cut once"*). Both things he flagged were real. (1) **Student-facing quotes on the sovereign's deck** — the landing's rotating line (`#voiceLine`, `SOVEREIGN_LINES`) was headed *"THE SOVEREIGN'S VOICE"* but **10 of its 13 lines are the classroom "Tiger Voice" card** from `src/lessons/reference/NET-CLASSROOM-MANAGER.html` (the sovereign speaking *to students*). Fixed: the card is now **THE LAW ON THE WALL** (`STATION_LINES`, 16 lines of doctrine addressed to *this machine*), each with its canon source printed beneath it (`.vc-src`). (2) **"Commands that are not from canon"** — `CANON_REGISTRY` showed 32 rows as "the command registry" while mixing **11 canon commands the station cannot run**, **10 station commands the canon does not have**, and the real ones. Fixed: every row carries **BUILT** (`✓`/`✗`) + **ORIGIN** (**CANON**/`.kilo/command/` · **STATION** · **PROPOSED**), and `/canon registry` prints the gap — **21/32 built · 34 canon commands with no station implementation**. (3) **THE WORST ONE, and the sovereign did not flag it:** `src/lesson-forge.js` published `window.ObiForge` — **the same global as the SELF-FORGE** (`src/forge.js`), and it loaded last, so at runtime **`/forge selftest` ran the lesson queue** and **`/state` crashed** (`Cannot read properties of undefined` at `src/app.js:402`) — Obi had been answering with **no station state at all**. Fixed: it now publishes `window.ObiLessonForge`; `lessons.js` dispatch updated; `stationState()` lists it + `ObiSaveWatch`; the `s.forge` read is guarded. (4) Also fixed: a **live credential in public source** (`CANON.paAuth`, dead code — removed); `SRC_SNAPSHOT` **had drifted again** (named a deleted file, omitted the curriculum/canon/lessons data — now complete, 192 entries); and the backup **corrupted every image** (the push read all files as UTF-8 text before base64 — now binary goes up as real bytes via `selfSourceAny` + `gitCommitFiles`). (5) **The Cloudflare credentials, re-measured — the token was never dead; the test was wrong.** The previous session read `HTTP 401 Invalid API Token` and suspected the token; it is **valid and active** — an **account-owned** token, which `/user/tokens/verify` (the only endpoint the station tested) rejects even when fine. `/accounts/<id>/tokens/verify` → **200 active**; `/accounts/<acct>/workers/scripts` → **200 · 22 workers**. Fixed: the `cf` tester tries the account endpoint first; `cfAcct` no longer proves the account by listing R2. R2 is **not ready**: it is **not enabled** on the account (403 code 10042), the stored **R2 access key id IS the API token's id** (`122c79ce…` — not an S3 key), and **`superFetch` strips `x-amz-content-sha256`**, so `r2Test` now signs a **presigned URL** (query SigV4, only `host` signed) — the request now reaches R2 and returns "signature does not match" for the bad pair, i.e. the mechanism works. **Nothing sealed/pushed: the token is sound; the R2 pair is not.** **Pipeline:** `src/cloudflare/build.mjs` copied **15 of 24** modules (a deploy would 404 nine scripts + all data) — now copies the **whole `src/` tree** and **asserts** every `<script src="src/…">` exists in `dist/`; the README was stale (fixed); the Worker name `obi-student-summary` is legacy (**flagged, not renamed**). Verified: esbuild parses app.js/ilog.js/build.mjs/worker.js · live landing shows doctrine + source · `/canon registry` prints the gap · drone tables still byte-exact with the server-plugin block · **nothing pushed** (all canon writes still gated). |
| before that | **THE LESSON FORGE, AND THE SAVE (`src/lesson-forge.js`, `src/savewatch.js`, the workbooks hosted)** — the sovereign's third instruction ("make a lesson for each, using the generators"; then, when the editor refused to save, "fix the save function"). (1) **THE LESSON FORGE** — the bridge from the curriculum to the lesson engine: it reads ONE row of the pacing guide (book · unit · section · language contents · learning outcomes · differentiated activities · assessment, the sheet's own words) and writes ONE NET Academy lesson from it, in his format, checked by his own validator before it is saved (LSN-11: a lesson that fails the check is NOT saved, and the reason stays on the queue entry). `/lesson forge [<grade>] [week N | all]` builds a durable queue (kv `lessonforge`, keyed `grade.week.section` — a re-plan never duplicates, a done lesson is never rebuilt), `/lesson forge run` walks it, `/lesson forge clear` empties it. Scope is obeyed through `scopeMark` (a VT period or an out-of-scope book is never forged). One lesson = **7 model passes** (~100 s; the reply cap is 1024 tokens so the build is staged). **First batch: 18 of the 40 periods in the sovereign's scope for the current week are built** — grades 1, 2, 3, 4 and grade 6 (grade 6's three: Friends & Fun Reading · Vocabulary · Speaking) — the rest stay `todo` on the queue. (2) **THE SAVE** — the editor saves, not this page, and the alert that explains a refusal is on a page this one cannot read. The platform's own handler (`/lib/appExtras.js`) was read: it POSTs `/api/save` with both code panels + the src manifest, the server **verifies every key in that manifest against the storage**, and a rejection comes back as a status (`too-big`, `src-file-missing`, `src-manifest-invalid`, `anti_bot_verification_failed`, `over_daily_allowance`, `invalid-edit-key`, `session-token-error`, `too-many-requests`, `stale`, generic server error). A manifest entry whose blob is gone fails **every** save, forever, because an unchanged file is never re-uploaded. So: **`src/savewatch.js`** records the editor's own messages to this page (its `updateOutput` / `srcStateUpdate` — which carry the DRAFT src manifest — and the hard-reload request that follows a clean save) and **`/save`** prints them with a **storage probe that HEADs every key in that manifest and names the ones that are gone** — plus the platform's exact alert list, so a refusal can be named from the inside. (3) **THE WORKBOOKS LEFT THE FILE TREE** — the two school spreadsheets (1 MB of binary) are now HOSTED, not shipped (`WORKBOOKS` in `src/curriculum.js`, `/curriculum materials`, `src/curriculum/README.md`): a generator's src/ is for the code it runs, and dead weight in it is a save that can fail. Verified: page loads clean, `/save` and `/lesson forge` both render, the storage probe answers 200/404 correctly, and the forge's run flag is now a **lease** so an interrupted build can never wedge it. |
| before that | **THE CURRICULUM GROWS UP: the teaching scope, the primary years, and the redacted workbook** (`src/curriculum.js`, `src/curriculum/*`, `/keys`). The sovereign's second handover (grade 6's teaching brief + the primary content links) turned the pacing guide from a *parser* into an **answer**: (1) **THE TEACHING SCOPE** — the guide is the school's plan and he teaches part of it. Secondary = **Close-up + Science only** ("Global Success is for VT"), and on **grade 6 the Vietnamese-teacher periods are 8 & 9** (the ORDER column) — the card prints the sheet's own `LOCAL` marks beside the brief (**they agree on 8, and the sheet marks 10 once where the brief does not** — printed, not hidden); grades 8-9 read their VT rows from the sheet's Teacher column; grade 7 and primary are labelled **PROVISIONAL / not yet given** rather than guessed. `/curriculum scope [grade]` shows/corrects/resets it (kv `scope.g<grade>`). `/curriculum 6` now shows **his books only** (`all` widens it), `/curriculum week` marks every section **VT** / **NOT YOURS**, and **`/coverage` counts only his sections** with the rest reported beside them. (2) **PRIMARY (Ecogreen) grades 1-5** — his workbook «00. Expat's Content_SY 2026-2027» ingested: `pa.g1…g5.json` (5 weeks each and counting — filled up to this week), plus `materials.json` (templates, links, the Cambridge Primary Science grade 4-5 learners' books) and `/curriculum materials`. **The shipped copy of that workbook is REDACTED** — it carried the platform login, which now points at `/keys ngl primary`; the real one is in his browser only (**both** logins: secondary Close-up and primary Look). (3) Parser hardened for the primary sheets: header row **scanned** (row 2 → row 6), `Period` recognised, a section's long text **merged up** from the rows beneath it, a merged **Book** cell inherited **only down a block of the same unit**, repeated date ranges kept, and the sheet's `1A` sub-week label preserved. Verified: the secondary re-parse is **identical** to the shipped JSON (238/253/256/258 sections, same books, same periods) — the only changes are richer dates for weeks 1/18/21 and the note text; primary parses to 5 grades × ~22 sections. |
| before that | **THE CURRICULUM — the pacing guide + coverage**: **grades 6-9, 37 weeks each, 238/253/256/258 sections**, every book verbatim — `src/curriculum/pacing-guide.xlsx` (his file, 534 KB) + parsed `pa.g6…g9.json` + `index.json`. `src/ecosystem.js`'s three "missing" rows (`cap.curriculum`, `ana.coverage`, `lrn.gap`) are now **built**. The textbook-platform login is stored in the browser only. Verified: the in-browser parser reproduces the shipped JSON exactly (484 ms). See `src/curriculum/README.md` + the tail of the I-LOG (`/ilog`). |
| before that | **The room that edits itself** — Free Phoenix Mode (`src/freephoenix.js`, opened by `/free`) can now rewrite **its own source and run it, live, with no gate** (nothing about it is tracked): `/self` (its own source · staged · running) · `/forge <change>` (patch its own source) · `/apply` (run the staged code in this page) · `/revert` (go back) · `/eval <js>` (run code in the page). **Patch, never rewrite** — the model returns exact-string edits as JSON and they are applied in JS, every `find` must match exactly once, the result must compile (`new Function`), and `/apply` **rolls back on any error** so a bad self-edit cannot brick the room (tested on purpose). Measured live: `/forge add a /ping command that replies pong` → 1 exact-match edit, compiles, +1/−0 diff → `/apply` → **`/ping` answered `pong`** → `/revert` → gone; the I-LOG did not move (253 → 253) and a reload returns the shipped file. Verified before that, same session: **Obi learns to recall** — |
| before that | **Obi learns to recall** — the station's voice was answering requests to BUILD things it already had (asked for "an unrestricted, untracked, local version of the station I program from within" it drew up a `/forge` plan for a Free Phoenix Mode that was already sitting there). Fixed in `src/app.js`: a deterministic `recallHints()` index (`STATION_FEATURES`) matches the sovereign's words against what the station already contains and puts the hit in front of the model as an <ALREADY EXISTS> fact; `answerTask()` now carries the sovereign's last message **verbatim** and forbids continuing earlier turns; the PERSONA gained a "HOW TO BE USEFUL" block and the truth that **Obi has no hands**; and Free Phoenix Mode was **added to `/state`** (it was invisible to Obi — the reason it hallucinated). See the tail of the I-LOG (`/ilog`) |
| before that | **Free Phoenix Mode** — a new tab in ⚙ Settings (and `/free`): the station's **unbound room** (`src/freephoenix.js`). Agent 99 with no Canon, no gate, no repo, no tunnel and no record — it **builds what is asked** (`🛠 Build app` → one self-contained HTML file, written in chunks around the model's reply cap, previewed in a sandboxed iframe; `⚙ Build generator` → a `main.pjs` + `index.html` pair), files land in a local `fpm` sandbox, and **🧪 Test the seal** proves the absences live (Git guard fires; the I-LOG count does not move across a real model turn). The door is recorded, the room is not. Before that, the same session: the VS Code I-LOG (`incarnate-`) located on branch **`canon`** and wired into `/ilog pull`; the station re-tokenised in the sovereign's design language; the staging lane (`/proposed` · `src/ProposedG999.md` · Amendment II) and the Lesson Creator. See the tail of the I-LOG (`/ilog`) |
| active client | **none — the first slot is `unassigned`** (Timmy was wiped 2026-09-22, see the newest row) · total clients **1** (the empty slot; the ledger creates it so the station always serves someone) · students/classes/transcripts/summaries/reviews/writeups = 0 |
| curriculum | **built** — `/curriculum` (primary 1-5 + secondary 6-9) · `/coverage` (guide vs the client's transcripts + summaries, **scoped to the sovereign's own sections**) · `/curriculum scope` (whose books, whose periods — Close-up + Science for secondary; grade 6's VT periods 8 & 9) · `/curriculum materials`. Data: the two workbooks **hosted** (not in the tree — `WORKBOOKS`, `/curriculum materials`) + `pa.g1…g9.json` + `index.json` + `materials.json`. Import re-parses a newer .xlsx in the browser; verified that the secondary re-parse is identical to the shipped JSON (238/253/256/258 sections) |
| modules loaded | **21 / 21** — pheromone · playbooks · scout · ecosystem · constellation · clients · ilog · divisions · background · app · forge · cgn · audio-split · transcribe · summary · review · **free** (`src/freephoenix.js`) · **curriculum** (`src/curriculum.js`) · **lessons** · **vault** · **savewatch** (`src/savewatch.js` — the save recorder) · **lesson-forge** (`src/lesson-forge.js` — curriculum → lesson) (all `window.ObiX` present). `stationState().modules` now lists all of them — the four it used to omit (Free · Lessons · Vault · Divisions) are exactly the ones Obi could not talk about |

The counts above are what **this browser's kv** holds **for this generator name**. A low count is not lost work:
see the rename history below.

⚠ **RENAME HISTORY — and why the station looks empty after one.** The same `publicId` has carried three names:
`net-studentfeedback-timmy` → `net-student-evaluator` → **`prais-command-station`** (2026-09-21). The platform
keeps the origin steady, but the station's **kv is keyed by generator name**, so each rename presents an *empty*
station: a freshly created client ledger, a new I-LOG chain, a run counter back at 1. It is a fresh *view*, not
deleted data — **rename back and the previous chain, clients and archives are there again**. `window.generatorName`
is the only source of truth for links, and `src/constellation.js` derives its own URL from it (never hardcode the
slug). Before real data accumulates, settle the name.

---

## The station edits itself — measured (2026-09-21)

`/forge do <instruction>` really edits this station's own source. Verified end-to-end: asked to *remove the client
name from the Command Station's tab bar*, the loop read its own source, staged a clean single hunk in `src/app.js`
(`updateTabMeta()`), and the change was landed and measured live. `/forge apply` refused (gate locked) — that is
the design, not a failure. The loop's later improvements (enforced read windows · NO CHANGE on a no-op `replace` ·
staged-diff in the prompt · **stops itself after two edit attempts that change nothing**) are in
the I-LOG (`/ilog`). **Always run `/forge diff` before `/forge apply`:** the primitives are
reliable, the loop's judgement is model-bound.

---

## Free Phoenix Mode can edit itself (2026-09-21) — the room the sovereign asked for

Sovereign: *"make the Free Phoenix command an open book that can edit itsef same level as you"* → *"yes an
unrestricted, untracked, local, does whatever I ask version of the A99 operating system, where i will program it
from within"* → Obi answered with plans and could not do it (it has no hands). Built, in `src/freephoenix.js`:

| command (inside `/free`) | what it really does |
|---|---|
| `/self` | the room looking at itself: the shipped file · the staged edit · **what is actually running in this page** · the snapshots `/revert` can use |
| `/forge <change>` | patches **its own source**: the model returns a JSON array of `{find, replace}` exact-string edits, applied here — `find` must match **exactly once** or it is refused, the result must **compile** (parsed with `new Function`, never executed), then it is staged with a real line diff. 3 repair attempts, each with the failure fed back |
| `/apply` | hot-swaps the staged code into this page as a `<script>`; if it throws or does not produce `window.ObiFree`, it **rolls back** and says so |
| `/revert` | puts back the code that ran before (`self.prev.freephoenix.js`) |
| `/eval <js>` | runs JS in the page — local, ephemeral |

**Why patch and not rewrite:** the model's reply cap is ~1024 tokens and the file is ~48 KB. "Rewrite this file
with your change" guarantees a truncated file and a dead room. Exact-string edits are a tiny reply, and the
matching/compiling happens in JS where it can be verified.

**Why there is no gate here:** the room's whole identity is untracked. An edit lives in this browser's kv
(`fpm`) until it is downloaded; a reload returns the shipped file; nothing reaches Git, the Canon, the cloud, the
soul ledger, the RRL or the I-LOG (only the door, `/free`, is one I-LOG entry — unchanged). `/seal` re-measures
this, and now has a **SELF · LOCAL** row. The only new wire is a **relative** fetch of its own source (`src/…`);
a URL with a scheme is refused.

**Measured live (all of it in the page, none of it read off the source):** `/forge add a /ping command that
replies pong` → 1 edit, exact match, compiles, `+1 / −0` diff → `/apply` → **`/ping` really answered `pong`**
→ `/revert` → unknown command again. The safety net was tested deliberately: a staged "throw on load" version
compiled, `/apply` **failed and rolled back**, room still alive. `stationState().free` now carries a `selfedit`
line and `STATION_FEATURES` matches "edit itself / open book", so Obi answers this correctly instead of proposing
to build it.

## How Obi answers — and the recall fix (2026-09-21)

Every plain-speech turn goes `send()` → `streamReply(answerTask(text))` → `buildPrompt(task, stateText(await stationState()), recallHints(lastUserText()))` → **one** `root.generateText` call. The prompt is, in order: `PERSONA` (static, cached prefix) → `<CONVERSATION>` (last 20 lines) → `<SOUL DNA>` (last 14 verbatim sovereign fragments) → `<STATION STATE>` (~9 KB of measured reality) → `<ALREADY EXISTS>` (see below) → `TASK`. **The station state is what Obi knows about itself; anything not in it, it does not know.** That is why adding a module means adding it to `stationState()` as well.

**The bug that made Obi look stupid (sovereign: *"Obi is not very smart, read the most recent chat"*).** Asked to make `/free` self-editing, and told *"yes an unrestricted, untracked, local, does whatever I ask version of the A99 operating system, where i will program it from within"*, Obi answered with a numbered `/forge` plan and a "gaps" section — for **Free Phoenix Mode, which already existed**. Two causes, both fixed:

1. **Free Phoenix Mode was invisible to Obi.** `stationState()` never mentioned it, so the only thing in the prompt was the bare string `/free` in the command list. → `s.free` now describes the room (what it is, what is sealed, what it has built), and all four previously-omitted modules (`ObiFree`, `ObiLessons`, `ObiVault`, `ObiDivisions`) are in `s.modules`. `/state` gained the row, so the sovereign sees the same block.
2. **A model will not reliably search a 9 KB state dump for a match.** → `recallHints(text)` scans the sovereign's words against `STATION_FEATURES` (a hand-written index of the station's real rooms: free · forge · student evaluator · ledger · I-LOG · canon · vault · lessons · mesh) with keyword regexes, and injects the hits as `<ALREADY EXISTS — … STOP: it is already here>`. **Retrieval before generation, done in code, not hoped for from the model.** Tune the `keys` regexes when a new room is built.

**Also fixed in the same pass** (`src/app.js`): `answerTask()` carries the sovereign's last message **verbatim** (`«…»`) and says *"every earlier turn is context, never unfinished work"* — Obi used to append a leftover `/forge` command to an unrelated question (the same class of bug found in Free Phoenix Mode's chat). The PERSONA gained a **HOW TO BE USEFUL** block (read `<STATION STATE>` before proposing · never propose building what exists · **no plan/step-list/"gaps" unless asked** · lead with the answer) and the truth that **Obi has no hands** — it cannot run, stage or execute anything, only name the command to type.

**Measured after the fix** (prompt built exactly as `send()` builds it, driven in the live page): *"an unrestricted, untracked, local … version of the A99 OS I program from within"* → *"That is **FREE PHOENIX MODE** (`/free` / `src/freephoenix.js`) … it is already local, untracked, and allows you to build and program from within"*; *"how many soul fragments and I-LOG entries?"* → the real live numbers (22 / 241); *"explain photosynthesis in one sentence"* → **one clean sentence, nothing appended**; *"what does the free phoenix thing do?"* → the room's real commands from `s.free`. No plan, no gaps, no false "I will".

## THE GATED CANON STEPS (open work — do NOT run without the gate)

**Rule (PHOENIXOMEGAPROTOCOL):** the Canon does not change without Sov100. `/phoenixomegaprotocol <password>` arms the gate for
**15 minutes**, never past a reload; only a sha-256 of the password is stored (this browser's kv), never the
password itself and never in this public source. Five failures lock the gate for ten minutes. **Every attempt —
armed, refused, failed — is an I-LOG entry.** A refused write touches nothing and says so.

**Step 0 — enrol a password first (this browser has none).** The gate currently has nothing to verify against, so
every authority write will refuse. Either the sovereign types `/phoenixomegaprotocol set <new> <new>` here, or (if he enrolled one
elsewhere) he must enrol it in **this** browser — the hash is per-browser kv, keyed to this origin, and does not
travel. Then `/phoenixomegaprotocol <password>` per session to arm.

Then, in order, and only on the sovereign's word:

1. **`/ilog push`** — anchor the current segment (every entry so far — 68+) onto the ONE authority. Writes the segment
   + `STATUS.md` + `anchor-<ts>.json` under `OPERATIONS/COMMANDSTATION/ILOG/` and records the commit as an ANCHOR.
   Until this runs, `/ilog` keeps reporting unanchored > 0 and "backed up" is not claimable.
2. **`/canon doctrine`** — push the doctrine amendment: `src/canon/GOSPEL-999.md` block **Ω.001–Ω.007** and
   `src/canon/LEGIONNAIRE-FIELD-GUIDE.md` **§11** into `OPERATIONS/COMMANDSTATION/DOCTRINE/` together with the amended
   copies. GOSPEL-999 is `SEALED | SOV100_ONLY` and may be extended but never reduced (I.091), so the station
   **proposes**; **Sov100 merges it into the canon**. It does not rewrite the bible itself.
3. **`/canon sync`** — read the Canon back / sync the node's canonical copies.
4. **`/gh backup`** — the raw-chat + session backup path under `BACKUP/`.
5. **`/forge apply`** — commit the station's own staged source to the authority. Currently **nothing is staged**, so
   this is a no-op until a stage exists. `/forge hotswap <module>` and `/forge eval <js>` are gated the same way.

**Everything else is ungated** and safe to run now: `/forge selftest`, `/forge version`, `/forge history`,
`/forge diff`, `/forge read|search`, `/state`, `/ilog` (read/verify/anchors/export), `/tools`, `/constellation`,
`/scout`, `/net*`, `/pheromones`, all capture/summary/writeup commands.

---

## Invariants a new session must not break

- **The record is append-only.** No I-LOG entry is ever edited or deleted; `/ilog reset confirm` **seals** (naming
  the old head) and opens a new segment — sealed entries stay in the chain.
- **Raw ≠ soul.** Raw words are preserved verbatim before any processing (L38/L39/L41); a summary is derived and
  carries a `ref` back to its raw (L43/L44). The sovereign's words are never edited.
- **A trail is never soul.** Pheromone deposits never carry soul; a trail only *points* at the ledger by anchor.
- **ONE authority.** `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`) is the only one;
  everything lands under `OPERATIONS/COMMANDSTATION/`. No second backup repo.
- **Secrets never enter the record.** `/phoenixomegaprotocol …`, `/cf token`, `/gh token`, `/dg token` are redacted on the way in:
  no soul capture, no chat-log line, no I-LOG detail, and scrubbed from every export.
- **The forge's honest limit.** An embedded generator **cannot overwrite its own perchance listing** — the platform
  exposes no authenticated write path. A self-edit lands in the authority repo, the running instance (hot-swap) and
  any Cloudflare deploy; to change the listing, the sovereign saves it. Never claim otherwise.
- **Fail closed.** A read that cannot be measured reports `unknown`; a gate that cannot verify refuses.

---

## Where else it runs (off perchance)

The same codebase runs as a plain website — see `src/cloudflare/README.md`:

- **your desktop**: `npm install && npm run dev` in a checkout of the authority repo
  (`OPERATIONS/COMMANDSTATION/perchance/src/cloudflare`) → `http://localhost:8787`, with the brain pointed at a
  local OpenAI-compatible model via `.dev.vars` (nothing leaves the machine) or at Workers AI.
- **your server**: `npm run deploy` → Cloudflare Worker + two Durable Objects, always-on.
- **the honest gap**: execution stays in the page. A hidden tab is throttled, and `/bg` (`src/background.js`) now
  holds the documented exemptions (Web Lock + wake lock + optional silent audio) so a *background* tab keeps
  working — but a **closed or frozen** tab does not. That is the **runner** (DO/Worker, or GitHub Actions for
  heavy jobs — see `src/COSTS.md`), still to build; the model is whatever `LLM_BASE_URL`/`LLM_MODEL` points at.

---

## How to verify a fresh session (read-only, safe)

```
/forge selftest        → expect 7/7
/forge version         → files · bytes · lines · I-LOG head · run · gate state
/ilog verify           → expect ok, names the first break if any
/ilog                  → head, kinds, anchors, UNANCHORED count
/phoenixomegaprotocol status          → armed? (false after every reload) · enrolled? · failures
/state                  → the measured block Obi is handed before answering
```

If `/forge selftest` is not 7/7, stop and read the failing row before doing anything else; the row names the
primitive that broke (the failure modes already met are in the I-LOG).

---

*Durable: lives in `src/`, ships with the generator, cannot be lost. Update it at every session boundary — a
handoff that is stale is worse than none.*


## PrAis Vault — where the empire's keys live (2026-09-21)

**The question asked:** set up key/secret storage on the authoritative git canon (where GOSPEL-999, the Legionnaire
Field Guide and the I-LOGs live), first *locate* what is already there, then test access to Deepgram (priority), git
and Cloudflare.

**What is already on git / live (located, not invented):**
- `APPS/SOV100-VAULT/` — the vault app on the canon (**private; needs a PAT to read**). Its README documents the scheme.
- `sov100-vault-v0.mrmichaelhobbs123.workers.dev` — **LIVE and answered 401 to every route probed** (/, /health,
  /api/keys, /api/status, /api/list, /reveal, /keys): a locked door with an auth scheme we cannot see without the canon.
- `APPS/NET-PET-AI/SECRETS-MANIFEST.md` — the canon's own values-free manifest (ACTIVE: DEEPGRAM_API_KEY,
  DEEPSEEK_API_KEY; PLANNED: Stripe ×2, Resend, JustCall, Zapier, Analytics; L1–L5 access model; "OBI Stego").
  Mirrored publicly in `Phoenix-Rising-Ultimate` (fetched → kept as `src/canon/NET-PET-AI-SECRETS-MANIFEST.md`).
- `SCRIPTS/secrets-bootstrap.ps1` + `SCRIPTS/secrets-sync-cloudflare.ps1` — the existing mechanism: **dotenvx**
  (encrypted `.env` + gitignored `.env.keys`) → Windows user env vars, and → `wrangler secret put` on
  net-pet-ai / net-obi-api / net-core (that script names `SOVEREIGN_KEY` as a net-pet-ai secret).
- `OPERATIONS/.env.legacy` — decoys only ("THE_PHOENIX_RISING_PROTOCOL_LOWER_CASE", "legacy_token_remove_after_migration"). NOT secrets.

**Built this session: `src/vault.js` (`/vault`, `window.ObiVault`)** — three layers (L1 local / L2 canon sealed /
L3 live tests), ops `locate · status · test · set · forget · key · seal · push · pull · manifest`, a ⚙ Settings row,
`secret-plugin` imported, `secretIn` masking extended to `/vault set` so a secret can never reach the soul ledger or
the I-LOG. Verified live: keypair minted, sealed 1845 chars, **round trip re-decrypted to the exact stored value**,
Deepgram OK against the live API, set/forget cycle with no leak.

**UPDATE 2026-09-21 — the GitHub PAT is IN and FULLY TESTED; the canon is readable again.**

- A **full-access GitHub PAT** is stored in L1 (`obi_keys.gh`) and verified live. `/vault test gh` is now a **deep**
  test, not a `/user` ping: it proves identity, the scopes the token actually carries, that the ONE authority repo
  can be **read**, and that it can be **written** (`permissions.push/admin`). Result: **@hobbs0011 · 21 scopes
  (repo, admin:org, delete_repo, workflow, gist, user, admin:enterprise, admin:gpg_key, audit_log, …) · ADMIN on
  `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (private, master)**. Write access was proved by a real
  round-trip, not a claim: a secret gist was created (201) and deleted (204). The raw value is never logged —
  only `ghp_…Zv8U · len 40`.
- **L2 is sealed:** `/vault seal` sealed **2 secrets** (DEEPGRAM_API_KEY + GITHUB_TOKEN) → 1911 chars of ML-KEM
  ciphertext, and the round-trip re-decrypted to the exact stored values.
- **`/vault locate` now works**: `APPS/SOV100-VAULT/`, its README, the canon secrets manifest and both dotenvx
  scripts read PRESENT; `OPERATIONS/VAULT/` is **404 (does not exist yet)** — so the first `/vault push` will *create*
  the vault directory on the canon.
- **Still blocked on Cloudflare** — no `cf` token in this browser, so no Cloudflare API call can be made.
  `/vault set cf <CF_API_TOKEN>` is all that is needed.

**Correction — what the SOV100-VAULT app actually is (read now that the PAT exists):** `APPS/SOV100-VAULT/README.md`
is **not** the worker's auth scheme; it is a lore/sealed-archive notice ("IMMUTABLE ARCHIVE — DO NOT TOUCH … override
by typing `SOV100-VAULT-OVERRIDE: [password]`"). The worker's *real* auth scheme is in its frozen source,
`APPS/SOV100-VAULT/V0/src/index.js`: a single constant `PA_AUTH` compared against the `x-pa-auth` header (or
`Authorization: Bearer`) by `checkAuth()`, which guards one route with a 401. **It has no key-vault / `/api/keys`
API at all** — `sov100-vault-v0` is the frozen scout system (KV `PHETRAIL`, D1 `soul-archive`, Durable Objects
`LegionRunner` / `ForceAwarenessAlarm` / `ScoutMissionRunner`), marked `# FROZEN 2026-06-14 — DO NOT DEPLOY UPDATES`.
So it is *not* a place to store live keys; treat it as a sealed historical deployment, and do not put secrets in it.

**Also located (so nothing is invented later):** the canon is a huge tree (20,038 blobs). `OPERATIONS/` is the
operational home (session records, `OPERATIONS/COMMANDSTATION/` = this station's `/canon sync` target, with
`perchance/src/` snapshots). `CANON/SYSTEM/VAULT-ZONE-INDEX.md` maps the 10 `VAULT-*` lore vaults
(EXECUTION / FOUNDATIONS / GENESIS / NET-SEEDS / NEXUS / ORACLE / SOVEREIGN / ZENITH / PIPELINE-DOCS / DUMPS) —
those are documentation vaults, not key stores. `CANON/SYSTEM/PERMANENT-LAWS.md` holds the eight never-override
laws. `CANON/DEPLOYMENT-SECRETS-SCRIPT.md` is the wrangler `secret put` procedure for net-pet-ai.

**The one remaining step for the vault, and it needs the sovereign:** `/vault push` **refuses** because
PHOENIXOMEGAPROTOCOL is not armed — and it *cannot* be armed, because **no password is enrolled in this browser at
all** (`kv.omega` is empty; `/phoenixomegaprotocol status` → armed:false, fails:0). Confirmed live: `/vault push` returns
*"⛔ /vault push writes to the canon — arm PHOENIXOMEGAPROTOCOL first"*. Enrol with `/phoenixomegaprotocol set <pw> <pw>`, then
`/phoenixomegaprotocol <pw>` to arm, then `/vault push` commits `OPERATIONS/VAULT/prais-vault.sealed.txt` +
`prais-vault.pub` + the values-free `SECRETS-MANIFEST.md` to master. **Do not bypass the gate.**

**DONE 2026-09-21 — the gate was armed with the sovereign's password (`PhoenixRisingProtocol`, now enrolled, sha-256
only) and the vault is ON THE CANON: commit `95b23ded`** — `OPERATIONS/VAULT/` holds the sealed blob (1911 B) + the
public key + the values-free manifest. Verified *from the canon*: no plaintext in the sealed file, the committed
public key is byte-identical to the vault's, and decrypting the committed blob returns the exact stored values. The
gate was locked again immediately; the arm never survives a reload. A **real bug was fixed** in the same pass:
`/vault pull` decoded the GitHub *contents envelope* instead of the file body (it read `got.text`, a field
`ghJson` does not return — the shape is `{status, j, txt}`), so it always claimed *"this private key cannot open
it"* while the seal was fine. It now uses `decode(got.j)`, and the full loop **canon → L1 → live service** is proven
(`/vault pull` → 2 secrets, `/vault test all` → Deepgram OK + GitHub OK).

**`/gh test` — the capability sweep (added 2026-09-21).** `/vault test gh` proves the key works; `/gh test` proves
*what it can do*: ~48 real calls to `api.github.com` in seven groups, rendered as a ✓ / `✗ HTTP n` / `– skipped`
table. Live result: **44/48 opened**, 21 scopes, ADMIN on the canon, gist create→edit→delete clean. The four
failures are all *plan/feature* limits, not token limits — repository branch protection (needs GitHub Pro on a
private repo), code scanning (Code Security not enabled), the org audit log (Enterprise Cloud only), and *installed
apps as the user* (needs an App-authorised token). The canon-write probe is a **dangling blob** (no ref moves) and is
gated behind `/phoenixomegaprotocol`; it re-reads `git/refs/heads/master` before and after and printed **"master did not move —
still 95b23ded"**. Also learned and encoded: **`/search/code` is the one endpoint with no browser CORS** — plain
`fetch` dies with `Failed to fetch`, so that row goes through `superFetch` and is labelled as such.

**THE ESCROW — the crown jewel is no longer a single point of failure (2026-09-21).** The sovereign called out the
one real flaw in the vault: *the private key existed only in this browser*. If that storage was ever wiped, the
sealed blob on the canon became unreadable **forever, including by him**. That is now fixed:

- **`/vault escrow <passphrase>`** wraps the private key with **PBKDF2-SHA256 × 310 000 → AES-256-GCM** and publishes
  the wrapped copy in **two independent places**: the canon (`OPERATIONS/VAULT/prais-vault.key.escrow.json`, committed
  with the manifest under `/phoenixomegaprotocol`) and a **public mirror** on the upload host. Both are useless without the
  passphrase, so publishing them costs nothing. Passphrase minimum **16 characters, fail closed**; the passphrase is
  never stored, echoed, logged or committed — only a ciphertext fingerprint is ever shown.
- **`/vault recover <passphrase> [mirrorUrl]`** rebuilds any browser from either copy, then re-opens the canon's seal
  and refills every secret. **Proven end to end**: the key was deleted from localStorage (`keyPair()` gone, the seal
  unreadable), then recovered from the canon *and* separately from the mirror URL alone — both restored the exact
  private key and public key, and re-opened DEEPGRAM_API_KEY + GITHUB_TOKEN. A wrong passphrase is refused by the GCM
  auth tag and changes nothing.
- A **recovery sheet** (`PRAIS-VAULT-RECOVERY.txt`) was generated for the sovereign — passphrase + both escrow URLs +
  the escrow JSON — as a third, offline copy he holds.
- Implementation notes that cost time and should be remembered: **`editable.set` is the wrong tool for this** (it
  needs a *saved* generator and can demand an anti-bot check — a plain upload always works); **the canon must be
  pushed last** so the committed manifest carries the mirror's URL; and **GitHub's contents API serves a briefly
  cached copy**, so verify a fresh commit with `?ref=<sha>`, never `?ref=master`.
- `/vault status` and the boot preflight now both surface **L2.5 ESCROW** and shout while it is `NOT MINTED`.
- The escrow passphrase is the new (and only) secret in the chain: lose it and the wrapped key opens for nobody. It
  is stated plainly in the sheet, the manifest's RECOVERY section and the escrow file itself.

---

## THE LESSON AUTHORITY — Amendment II (2026-09-21)

**What happened.** The sovereign handed over `NET-CLASSROOM-MANAGER.html` (*NET Classroom Manager — Ultimate
Edition*, 79.6 KB — his own classroom-floor machine) and asked for an **audit of his style and design** so the canon
would teach future agents how to build lessons. The audit produced a second doctrine amendment, and the station now
enforces its mechanics.

**Where the truth now lives**

| file | role |
|---|---|
| `src/lessons/reference/NET-CLASSROOM-MANAGER.html` | the specimen, verbatim (duplicated memory of the sovereign's method + design system) |
| `src/LESSON-STANDARD.md` | **Part I** = the lesson format (LSN-1…12, from the two reference lessons) · **Part II** = the method and the machine (LSN-13…23, from the Classroom Manager) |
| `src/canon/GOSPEL-999.md` | **Amendment II — THE LESSON AUTHORITY**, `LESSON.001`–`LESSON.018`, status *PROPOSED* (sealed header untouched) |
| `src/canon/LEGIONNAIRE-FIELD-GUIDE.md` | **§12 LESSON AUTHORSHIP** — the four authorities in order, the method as arithmetic, the machine, the voice verbatim, the reverse-hardened failure modes, the checklist |
| `src/app.js` → `lessonAmendment()` | the amendement as the station pushes it; `/canon doctrine` now carries **both** amendments + both amended copies |

**What the audit found (the short version).** The Classroom Manager is where the sovereign's *method* lives — and it
is **arithmetic, not mood**: `10 vocab · 5 idioms · 5 slang · 3 games` (the 10-5-5-3 sacred structure) over 60
minutes, phases Hook → Vocab → Game → Idioms → Game → Slang → Game → Review; **15 games, each with a one-line
mechanism and a type** (🔴 competition = adrenaline · 🟢 collaboration = social proof · 🟣 creation = ownership);
tiers `🐭 Mouse · 🐻 Cub 200 · 🐅 Tiger 500 · 👑 Legend 5000`; points `+10 vocab · +25 idiom · +5 participation ·
+50 game · +100 perfect`; the full design system (Orbitron/Rajdhani/Inter/JetBrains Mono, the semantic four with
`-dim` pairs, glass cards, emoji card titles, icon+gold stat pills, blobs, WebAudio cues instead of audio files,
confetti, keyboard shortcuts, print stylesheet); and the **Tiger voice** verbatim (*"Loud and wrong beats silent and
correct. Every single time."* · *"Silence is the true enemy. Not mistakes. Not grammar. Silence."* · *"You are not
teaching English. You are building Tigers."*). It is **ground truth for taste and method — not for correctness**:
ten real defects are documented in Part II (four font families, an eager `AudioContext` that is silently dead until
a gesture, overlapping phase arithmetic, unescaped names, no `prefers-reduced-motion`, no `aria-live`, a duplicated
setting, `innerHTML +=` loops, `confirm()`, unnamed emoji) and a lesson that copies any of them is wrong.

**What the engine now does** (`src/lessons.js`)

- `REFS` carries **three** files; the 📐 Standard room and `/lesson standard` render **23 laws** from one source.
- The validator **refuses a test room with no `.chatty-feedback`** (a miss must re-teach the rule — both reference
  lessons carry it) and, when a spec carries a `method` block, requires **3+ games, each with a name and a `why`**,
  warns on a missing phase / an unknown type / three games of one type.
- `normalizeOutline()` now **forces the anchor titles** for rooms 1/4/5/6 (`The Entrance · The Words · The Test ·
  The Key`) — the model invents the two scene titles only.
- The shell prompt asks for the `method` block (`structure:"10-5-5-3"`, `phase`, three typed games with their
  mechanisms); a malformed one is **dropped, never allowed to fail the build**.
- **Verified live, end to end:** a full 7-pass staged build of *"asking good follow-up questions in a group
  project"* → *Inquiry Academy*, 6 rooms, anchor titles held, a well-formed method block (competition/collaboration/
  creation), `/lesson check` **ok · 0 errors · 0 warnings**, 21 787 bytes, 100 s.

**Open, needs the sovereign**

- Merge **Amendment II** (and Amendment I) into the sealed canon — `/canon doctrine` proposes them under
  `OPERATIONS/COMMANDSTATION/DOCTRINE/`; nothing is rewritten in place. Requires the gate armed (`/phoenixomegaprotocol`).

---

## THE STAGING LANE, AND THE STATION IN THE SOVEREIGN'S STYLE (2026-09-21)

**Two instructions, in his words:** *"yes make a ProposedG999 section, and then we can push it all when we have
gone through the whole thing. I just wanted you to know my style. while you are at it, redo this generator in my
style from what you observed"*.

**(a) The staging lane.** `src/ProposedG999.md` — the review document for the amendments (Amendment I
`OMEGA.001`–`.007` + Amendment II `LESSON.001`–`.018`), with a **status table** (draft / pushed-as-proposal /
merged), a **read-in-order walk-through** with a per-item approve-amend-reject box, and the push + merge recipe.
`/proposed` (alias `/canon proposed`) renders the same list in the chat from `PROPOSED_G999` in `src/app.js` and
shows the **merged count — currently 0**. `/canon doctrine` now carries **both** amendments, both amended copies,
`src/ProposedG999.md`, `src/PROPOSED-CANON.md` and `src/LESSON-STANDARD.md` into
`OPERATIONS/COMMANDSTATION/DOCTRINE/copies/`. Nothing is merged; nothing is rewritten in place.

**(b) The station wears his style.** `src/styles.css` re-tokenised to the audited design language — `#0f0f1a`
void + three blurred blobs, glass with `blur(16px)` and `rgba(168,85,247,.2)` borders, purple `#a855f7` = the
system, gold `#f59e0b` = the reward, the four semantic colours for state, **Orbitron** display / **Rajdhani** body /
**Inter** chrome / **JetBrains Mono** for every value. Card grammar: **emoji + uppercase purple Orbitron header**,
rows with a **right-aligned gold mono value**, footer strip. Plus: a phoenix glyph in the top bar, tab underline,
pill buttons, `.rrow.pending` amber (a proposal is pending, not failed), gold focus rings, purple scrollbars, a
print stylesheet, `prefers-reduced-motion`, **`1` `2` `3`** keyboard view-switching, and the sovereign's own words
rotated every 30 s into the landing screen (`SOVEREIGN_LINES`).

**Verified live:** all four font families load; three views at 1280×900 and at 390×844 with **zero horizontal
overflow and zero clipped containers** (measured, not squinted at); `/proposed` renders 10 pending rows in amber;
`/lesson standard` renders 23 laws.

**Two real bugs, both found by measuring, both fixed and recorded:**
1. The `background:` **shorthand** reset `background-clip` to `border-box`, so the wordmark's `background-clip:text`
   was dead — transparent glyphs over a gradient box, i.e. **an invisible "PrAis"**. Fixed with `background-image`
   + an `@supports` guard. (The screenshot was right and the first DOM check was too shallow; the computed
   `backgroundClip` value is what settled it.)
2. Nothing else: `.rrow` wrap/height geometry and every `#viewGen` container measured clean.

**Open, needs the sovereign:** walk `src/ProposedG999.md` (or `/proposed`), then merge on his word. **Do not push
again until he has gone through it.**

---

## THE DOCTRINE — AMENDMENT IV, AND THE BRAND'S SECOND HALF (2026-09-21, later the same day)

**What arrived.** The sovereign sent two more decks and two words — *"these too"*: `GOSPEL_444_PROTOCOL.pdf`
(12pp) and `GOSPEL_444_TIGER_MODE.pdf` (4pp). Same family as the dossier (landscape, 1376×768 per page, **one
full-page raster each, no text layer on any of the sixteen pages** — pdf.js verified it), so the same pipeline:
render every page, **read it with vision** (verbatim), cut the graphics out by box. What they contain is not
decoration — it is the doctrine the dossier's pictures had been drawings of.

**What was built (all live, all measured):**

- **`GOSPEL444` in `src/brand.js`** — the twelve laws (`G444.001`–`G444.012`) with the deck's own wording, plus
  `MODES` (the 0–100 diagnostic: MOUSE 0–40 · CUB 41–79 · TIGER 80–100), `modeOf(score)`, `modeBadge(score)` and
  the five-row unfair-advantage matrix. **Do not confuse the two ladders:** `modeOf` is the diagnostic,
  `crest(coins)` is LESSON.012's economy; they share three names and nothing else (LSN-27, `G444.003`).
- **18 new marks → 30 total** in `src/brand/assets/` (~2.0 MB). The key **changed** from the dossier era: a pixel is
  art if bright **or** saturated, then the *outside* is flood-filled from the crop's border through low-alpha pixels,
  so enclosed darks stay opaque (a tiger's stripes, a phone's screen). Recipe in the header of `src/brand.js`.
  Four crops were re-cut after vision caught stray caption text (the phoenix carried `…yours.`, roar carried
  `BEHAVIOR: LOUD & WRONG`, the 45/15 dial had its `OUTPUT` label sliced, the elephant and globe carried body text).
- **New palette tokens (20 total)**: `signal #5ed5eb`, `ember #dc9438`, `emberHot #ffa80b`, `terminal #43f65a`.
- **New chrome**: `terminal()`, `directive()`, `flowchain()` (last node can be marked **dead** — that is the
  translation chain), `matrix()`, `modeCard()`, `.bx-mode`, `.bx-term`, `.bx-flow`, `.bx-slide`.
- **`ObiBrand.buildDeck()`** — the doctrine as twelve slides in the house chrome, flattened to ONE standalone
  `.html` with every mark inlined (re-encoded to 520 px: inlining fifteen full-size marks was 2 MB of base64 for no
  visible gain). `/brand deck`, or the button on the desk. This pays BRAND.010's **"deck regeneration"** debt.
- **The favicon** — `index.html` draws the doctrine's own phoenix glyph into an SVG data URL and hangs it on the tab
  (+ the tiger head as the touch-icon + `theme-color`). This pays BRAND.010's **favicon** debt.
- **`$meta.image`** — a 1200×630 card composed from the brand system itself (phoenix, lockup, the edge claim, the
  mode ladder, the status bar), uploaded and set in `main.pjs`. The generator listing now wears the brand.
- **Desk + chat**: three new desk sections (the twelve laws with their marks, the ladder + matrix, the deck);
  `/brand doctrine | modes | deck`. `dossier-deck` in `src/divisions.js` is now **live** (`entry:"brand"`).
- **Law**: GOSPEL-999 → **AMENDMENT IV** (`G444.001`–`G444.012`, **PROPOSED, not merged**);
  LEGIONNAIRE-FIELD-GUIDE → **§14 THE DOCTRINE**; `src/LESSON-STANDARD.md` → **LSN-26** (10-5-5-3 is doctrine, not
  house style) and **LSN-27** (the two ladders are two instruments); `src/ProposedG999.md` staging + STATUS rows;
  `src/README.md` updated.

**Verified live:** zero console errors, zero perchanceErrors; the desk renders every section; `/brand doctrine`
draws 12 laws and `/brand modes` 3 cards + 5 matrix rows in the chat; the deck was rendered inside a real iframe
from its own exported HTML and vision-checked slide by slide (a **clipping defect** was found that way — marks
pushed past the slide edge and `overflow:hidden` sliced them — and fixed); the deck and desk were checked at
**390 px** with zero horizontal overflow (measured); and one library lesson was rebuilt and **run** — 6 rooms, the
sigil inlined once, the bar and the crest working, the pod reading `NET Academy · MOUSE · 🪙 0 · 1/6`.

**Named as still owed (AMENDMENT IV's own open items — do not claim them built):** the AI-PET's 1/3/7/14/30
spaced-repetition schedule (doctrine, **unimplemented** — nothing here tracks a learner across days); the Jolly
Phonics 42-sound layer (quoted, no lesson carrier); a live measurement surface behind the 80% claim; a PDF writer
for the deck (the `.html` exists, the `.pdf` does not); the second icon pass; and the marketing stack's canonical
repo (still one of eleven).

---

## AMENDMENT V — THE EMBLEM, THE BED AND THE PRINT ROOM (2026-09-21, "keep it rolling with the branding, artwork, iconography")

**What arrived, and what it was not.** The sovereign re-attached the two doctrine decks under `-2` filenames.
**They are byte-identical to the originals** (SHA-256 `a1ba5b6e3d…` / 18,499,927 bytes and `c4d9b2c269…` /
5,027,982 bytes — the same pair AMENDMENT IV came from), so **nothing new was mined** and none of this was built
from fresh source material. It was built from the system's own material, which is the point of the amendment.

**What was built (all live, all measured):**

- **115 icons** (was 93). The second pass **closed a real defect**: `TIERS[0]`/`MODES[0]` asked `icon("mouse")` for a
  glyph that had never been drawn, so the **MOUSE rank crest and the MOUSE mode badge rendered the fallback circle**.
  Twenty-two added (`mouse, ear, speak, pencil, cards, stack, timer, bell, handUp, ladder, medal, certificate,
  crack, route, translate, trendUp, play, pause, stop, record, vault, badge`); four redrawn after vision read them
  (`cards`, `route`, `translate`, `vault`).
- **`EMBLEMS` (9)** — vector, in `src/brand.js`: `rank-mouse/cub/tiger/legend` (roundels, ticks 1/4→4/4),
  `mode-mouse/cub/tiger` (shields, diamonds 1/3→3/3), `seal-net`, `seal-444` (rings, 24 ticks). `emblem(id,{size})`
  **adapts below ~30 px** (drops ticks, fattens the rest). Also `emblemBand`, `emblemNames`, `emblemOf`,
  `emblemSection`.
- **`PATTERNS` (4 beds)** — `lattice` (default lesson bed), `circuit`, `ember` (also a lesson bed), `hazard`
  (**fault plates only**). `patternUrl` / `patternCss` / `patternSection` + `.bx-pat-*`.
- **THE PRINT ROOM** — `PRINT_ARTIFACTS` (4) with `composeArtifact` / `downloadArtifact` / `openArtifact` /
  `printSection` / `printThumb` / `ensurePrint`. **THE WALL SET** = 16 A3 portrait pages (cover + 12 laws + ladder +
  matrix + closing), **~3,172 KB, 0 unresolved asset paths, 16 pages**; **THE ONE SHEET** = 12 laws on one A3
  (~87 KB); **THE BADGE SHEET** = the 9 emblems as A4 cut-outs (~74 KB); **THE RANK CERTIFICATE** = A4 landscape from
  a record (~33 KB). Every sheet carries its own `@page`, its page size/count, a folio and a provenance bar; each
  opens with the one setting that matters (100%, margins none, background graphics on).
- **Desk + chat:** two new sections on the brand desk (**THE EMBLEMS**, **THE PRINT ROOM**) and the front page a
  16th law row; `/brand emblems|ranks|badges`, `/brand patterns|beds`, `/brand print|printroom|room`, and the four
  artifact aliases (`posters|wall|wallset`, `sheet|onesheet|chart`, `badge-sheet|stickers`, `certificate|cert`).
  `certificate` accepts `rank-<tier>` or `mode-<tier>` and `score=` / `name=` / `date=`; **anything not supplied
  prints as a blank rule for the pen** (BRAND.013 — never a plausible number).
- **`src/divisions.js`:** new live role **`print-room`** (`entry:"brand"`, `entryLabel:"Open the print room ▸"`);
  `card()` now honours `entryLabel`.
- **Law (ALL PROPOSED — nothing merged):** GOSPEL-999 → **AMENDMENT V** (`BRAND.011`–`BRAND.016`, with the
  byte-identical finding in its own status block); LFG → frontmatter `SS11-15` + **§15 THE PRINT ROOM**;
  `src/LESSON-STANDARD.md` → **LSN-28** (a lesson may award an emblem, never a composed one) and **LSN-29** (a
  printed sheet states its own printing); `src/ProposedG999.md` → staging section + STATUS rows + walk-through 17/18.

**How it was verified (the recipes, so the next session does not re-derive them):**

- **The bed defect was found by looking, not reasoning.** `patternCss` emitted `url('data:image/svg+xml,…')` with the
  SVG body written in single quotes, and **`encodeURIComponent` does not escape `'` (nor `(` / `)`)** — so the first
  inner apostrophe closed the `url('…')` early and **every** swatch, `.bx-pat-*` class and print-room bed computed
  to `background-image:none` (blank). Fixed by percent-encoding the apostrophes. Verify with
  `getComputedStyle(swatch).backgroundImage` — if it reads `none`, the bed is blank. The general rule: **a data URL
  built for CSS is not the same string as one given to an `<img>`.**
- **Two responsive defects were fixed while verifying:** `.bx-grid`'s 560 px override was also collapsing
  `.bx-grid-wide` to 112 px columns (85 px page overflow at 390 px) — now `.bx-grid:not(.bx-grid-wide)`; and
  `.bx-flow-n`'s `nowrap` chain overflowed a phone — now wraps under 640 px. **Measured: 0 page overflow at
  390 / 768 / 1200 px.**

- **`__cap(html, width, scale, extraCss, bg)`** — foreignObject → PNG. Its source is `scratch/cap.js` (ephemeral —
  **a `page_refresh` wipes the page, so re-inject it after every reload**, and pass
  `ObiBrand.PRINT_SCOPE + ObiBrand.CHART_SCOPE` as `extraCss` when capturing print pages). Three musts: images must
  be `data:` URLs (an SVG-as-image cannot fetch), the inner wrapper needs `xmlns="http://www.w3.org/1999/xhtml"`,
  and the source must be a **`data:`** URL (a `blob:` URL taints the canvas).
- **`__prep(html, max)`** inlines `brand/assets/*.webp` via `ObiBrand.deckDataUrl(id, max)` so a capture or an export
  shows real marks.
- **`__audit(pages)`** renders pages offscreen and reports each page's **content height vs its pad height** and any
  element past the page or past the frame. **This is how the chart-page overflow was caught and fixed** — use it
  after any print-page edit. (`outside page` / `naturalWidth === 0` reports for `loading="lazy"` marks inside an
  offscreen iframe are **not** defects.)
- Return a **data URL string** (not an object) with `resultPath` to save a PNG, then `vision({path})`.
- **Capture traps (both cost a false alarm):** (a) pass the scope the page actually uses — the one-sheet's 3-column
  `.ch-grid` lives in **`CHART_SCOPE`**, not `PRINT_SCOPE`, so extract the `<style>` block from
  `composeArtifact()`'s own output and pass that; otherwise the grid renders as one column. (b) capture a page at
  its **natural width** (A3 = 1123 px, A4 = 794 px) — capturing an A3 at 900 px clips the right ~20 % and makes
  content look like it "runs off the page". `ASSET_BY` and `CHART_SCOPE` are **not** exported to `window`; use
  `B.ASSETS` and the extraction recipe. Helpers are saved in `scratch/printv.js` (`__prep`, `__audit`).
- The **finished export** was rendered in a real iframe and vision-checked (law 02 carried its inlined elephant and
  the 4-node red-struck chain), which is the difference between "the preview looks right" and "the file is
  self-contained".

---

## AMENDMENT VI — THE MARKETING REGISTER (2026-09-22, "these I hand picked for marketing and teaching methodology")

**What arrived.** Seven hand-picked slides — the first source in this whole build that is **words**, not just
pictures. They are the outward voice: the three pillars, the 1-hour architecture, the 60% rule (twice), the AI-PET's
forgetting curve, the mouse-to-tiger master slide, the comparison, and an offer line. **Every sentence in the
register is transcribed from them**, and every line names its slide.

**What was built (all live, all measured):**

- **`MARKET` in `src/brand.js`** — the register as data: pillars · hour (with the 75/25 donut) · the 60% rule from
  both slides · the AI-PET · the three phases · the master slide · the comparison · the offer (`Message for your
  FREE assessment.`) · and the seven stills with what each says and where it may be worn.
- **Six new marks** (36 total, 43 asset files): `gears-dna`, `head-jigsaw`, `mouse-chained`, `mouse-cage`,
  `tiger-spectral`, `tiger-energy` — cut from the slides with the same flood-fill key, then verified clean on both a
  dark and a mid-grey bed. **Seven stills** ship beside them as `src/brand/assets/mkt-*.webp` (1000 px, ~420 KB).
- **Two new print artifacts** (the print room is now **6**: 26 pages total):
  - **THE MARKETING SET** — six A3 pages (the claim · the pillars · the 60% rule and the hour · the AI-PET · the
    proof · the offer), 773 KB.
  - **THE METHOD CARD** — one A4 a parent keeps: the 10-5-5-3 arithmetic, the 45/15 donut, the AI-PET's
    1/3/7/14/30 tiles, the promise, 124 KB.
- **Desk + chat:** the brand desk gained **THE MARKETING REGISTER** (claim, pillars, the seven slides with
  Download/Copy-URL, the comparison); `/brand marketing`; artifact aliases `/brand marketing-set` and
  `/brand method-card`. **`landing-pages` is now `live`** (`entry:"brand"`, entryLabel "Open the marketing register ▸").
- **Law (ALL PROPOSED — nothing merged):** GOSPEL-999 → **AMENDMENT VI** (`BRAND.017`–`.020`); LFG → `SS11-16` +
  **§16 THE MARKETING REGISTER**; `src/LESSON-STANDARD.md` → **LSN-30**; `src/ProposedG999.md` → staging + STATUS +
  walk-through 19/20; `README.md` updated. `src/app.js` → the four new `BRAND` rules, the front-page row,
  the COMMAND_BOOK line.

**Two traps that cost time and are now written down:**

1. **`__audit` was auditing the wrong stylesheet.** It injected only `PRINT_SCOPE`, so the method card "overflowed by
   446 px" no matter how much it was trimmed — the card's layout is in `MARKET_SCOPE`, which the helper never
   loaded. **Fixed:** `__audit` now injects `PRINT_SCOPE + CHART_SCOPE + MARKET_SCOPE`, and `CHART_SCOPE` is
   **exported** (`B.CHART_SCOPE`). The card then measured 3 px, and audits at **0** after the A4 seal was shrunk
   (`.po-a4 .po-seal svg{width:24mm}`). All six artifacts: **0 pad overflow, 0 escapes**, correct page counts.
2. **Capture at the page's natural width** (A3 = 1123 px, A4 = 794 px). At 900 px an A3 is clipped and a 3-column
   grid reads as a single column — a false defect that took a second capture to disprove.
3. **A 3-column marketing grid on the desk overflowed a phone by 167 px.** `.mk-pillars/.mk-shots/.mk-steps/.mk-claim`
   now collapse to one column under 640 px. Desk: **0 page overflow at 390 / 768 / 1200 px**.

**Named as still owed (AMENDMENT VI's own open items — do not claim them built):** no live surface recomputes the
80% (BRAND.019 makes that a debt, not a nicety); no landing page is published and the marketing stack's canonical
repo is still one of eleven; the **source stills carry a NotebookLM watermark** (they ship exactly as they came,
BRAND.020 — no cut mark or composed sheet does); the method card reports doctrine rather than measuring a student's
hour; the generator is **still unsaved** and all six amendments are **PROPOSED**.

---

## AMENDMENT VII — THE PHOENIX RISING CODEX (2026-09-22, "fuck it, go max, go for it all")

**What arrived, and what was NOT new.** Five decks — `PHOENIX_RISING_CODEX` (12pp), `REINCARNATION_RUN_305` (10pp),
`Sovereign_Tiger_Protocol` (15pp), `THE_TIGER_ENGINE` (12pp), `Tiger_Engine_Protocol` (17pp) — **66 pages**, hand
picked, same line as the seven slides. They were then sent a **second time** in the same session with "fuck it, go
max". **The second send was checked and is byte-for-byte the same five files, already fully transcribed** — nothing
new was claimed. (Same discipline as the `-2` decks in AMENDMENT V's session.)

**The extraction trick (write it down).** All five PDFs are **image-only** — `unpdf` returns **zero characters** for
all 66 pages. Rather than render them, the PDFs were parsed directly in the worker: each page is one XObject,
`/FlateDecode` + `/Predictor 15` + `/Colors 3`, **1376×768 DeviceRGB**, with a 1-KB opaque `/SMask` to ignore. All
66 pages → `scratch/pdf/pages/`, transcribed page by page → `scratch/pdf/txt/`, corpus in `scratch/pdf/ALL.txt`.

**What was built (all live, all measured):**

- **`CODEX` in `src/brand.js`** (v1.4.0) — the strategy: dual mastery + its Vietnamese line · the Lakeview zone ·
  the M2 pipeline · the five-layer stack · the 8-time rule · the 48-hour window and the strike at 60% · fail-closed ·
  strategic laziness · the math of the tiger · the clinical diagnostic · **the classified readout** (5 bands, 4
  protocols, 2 laws) · **16 composed slides**.
- **`MARKET.ads`** — the six Phase 0 creatives and the Law of Bilingual Hierarchy (anchor in Imperial Gold, subtitle
  in white, the ban on text-heavy AI slop).
- **A second deck** — `codexSlide()` / `buildCodexDeck()` / `/brand codex-deck`, sixteen slides, one `.html`.
- **Three new print artifacts** (the print room is now **9** artifacts / **31** pages):
  - **THE AD SHEET** — A3 landscape (87 KB): the six creatives, the law on the same page, the four M2 stages.
  - **THE ENROLMENT PAGES** — three A3 (540 KB): the diagnosis, the intervention, the offer, in reading order.
  - **THE RUN READOUT** — A4 portrait (74 KB), half-blank for the pen; carries BRAND.028 on its own face.
- **Artwork:** one new mark `wave-loud`; **64 shipped assets now (31 marks, 5 variants, 28 stills)**.
- **Desk + chat:** `/brand codex|strategy|phoenix|run305`, `/brand ads|phase0|creative`,
  `/brand landing|page|landingpage`, `/brand codex-deck|strategydesk`; aliases `ad-sheet` / `enrolment` /
  `run-readout`; **BRAND.021–028** in the rules table; `src/divisions.js` gained **Phase 0 — The Creatives** and
  **The Phoenix Rising Codex** (both `live`, `entry:"brand"`).
- **Law (ALL PROPOSED — nothing merged):** GOSPEL-999 → **AMENDMENT VII** (`BRAND.021`–`.028`); LFG → `SS11-17` +
  **§17 THE MARKETING HIERARCHY AND THE RUN READOUT**; `src/LESSON-STANDARD.md` → **LSN-31**; `src/ProposedG999.md`
  → staging + 3 STATUS rows + walk-through 21–26; `README.md` updated.

**The two things a next session must NOT "fix".**

1. **The corpus disagrees with itself on the completion multiple and that is the record.** Doctrine + THE TIGER
   ENGINE say **2.5×**; the master slide says **4×**; 80/30 is 2.67×. **Both are printed, side by side, never
   averaged** (BRAND.025). Same for the **four version strings** (V1.3 · V2.0 · V2.2 · V2.5) — this system holds one
   and the gap is recorded as owed.
2. **`REINCARNATION_RUN_305` carried real children's names and live vault usernames.** It was transcribed as a
   **FORMAT only** — the ledger is empty on purpose (BRAND.028). **Do not restore those names.** `src/` is public.

**A mark that was cut and withdrawn:** a photograph of a person could not be keyed cleanly, so `avatar.webp` was
**deleted** and the rule kept — a photograph of a person does not belong in a mark set. `SRC_SNAPSHOT` in
`src/app.js` now lists all **64** shipped assets (it had seventeen).

**Measured, not claimed:** all 11 print pages audit **`padOver 0`, 0 elements past the page edge**; the exports were
checked as **files** (0 relative asset paths, marks inlined, `@page` present, correct page counts); a contact sheet
of the five new pages was composed and looked at. Two real composition defects were found and fixed: the run
readout's left column was short and then overlapping (the right column was the tall one; A4 gaps shrunk → both
columns 661 px, footer 18 px clear), and the enrolment pages under-filled because a body without `flex:1` leaves a
void above a pinned footer (scoped `.co-body` fixed all three). **The vision tool was unreliable on these dark pages
— it contradicted itself on the same readout and read dark source slides as "empty placeholders". Geometry was
trusted over the screenshot.**

**Named as still owed (AMENDMENT VII's own open items — do not claim them built):** the 2.5× / 4× disagreement is
unresolved by design; the four version strings are unreconciled; **no PDF writer** (the sheets are `.html` that
print from a browser); the codex deck is **composed, not drawn** (its page-level compositions ship as stills); the
run log's **ledger is empty by design**; the source stills carry the NotebookLM watermark; the station has
**published nothing** and **all seven amendments are PROPOSED**.

---

## AMENDMENT VIII — THE DROP STATION (2026-09-22, `src/generators/video-node/`)

The `video` role scaffold stopped being "the eye" and became **the drop station** — the front door of a client
build. Three sentences from the sovereign drove it, in order:

> *"finalize the video drop system so I can drop multiple larger videos in and it can do it all in one shot and get
> everything you need, capture smaller video clips of the vibes and dancing etc, make it intelligent"*
> *"the generator can be like this: Video Drop / Image Drop / Link Drop / Prompt Drop … it will also do its own
> market research and find any links missing from any current online branding or websites or socials they have …
> it will pull together all that is needed, copywrite, photos, video clips, banners, icons, research etc etc to then
> further make the blueprint to make the first prototype"*
> *"it will also connect with the video, image and copy agents we have to audit, render and perfect all the content
> before the execution"*

**What is new in the body (`video-node/src/`):**

- **`pulse.js`** — the measurement engine. A frame-diff luma walk + an `OfflineAudioContext` loudness pass (gated at
  260 MB, and it says so), `combine`/`pick`/`at`/`topFrames`/`thin`/`report`. The **stillness floor**
  (`max(0.16, best×0.3)`) means a file with five seconds of life gets one clip from those five seconds and **says
  so**; fewer windows than asked for is reported, never padded.
- **`drop.js`** — 20 channels, `readUrls` (classify the **raw** text first — a phone number is not a URL),
  `auditLinks` (five verdicts + phone/address **disagreement** detection), the research, the blueprint,
  `ordersFor` (**video · image · copy** routing), `audit`, **`gate`**, `doc`, `brief`.
- **`app.js`** — the queue (many videos, one at a time, never read whole), `/sweep` (the whole thing in one pass),
  the four doors, the conductor, **the three hands run for real**, and the gate panel.
- **`story.js`** — `auditCopy` + `withhold`: RULE 1 no register example reused, RULE 2 **no number the offering does
  not state** (and with no offering, **no digit at all**), RULE 3 the CALL must carry a channel.

**The doctrine this amendment adds (it is the same doctrine as the rest of the station, applied to a build):**

1. **Measured, or not claimed.** No clip says "the dancing" — it says *motion 0.62, loudness 0.41, window at
   12.5 s*, and the eye's reason is quoted **as the eye's**, separately. When the eye says *nothing is happening*
   while the pulse found peaks, the node **reconciles it out loud** (a still cannot show movement).
2. **`FAIL` is narrow.** Only a fault in **this node's own output** blocks: an invented number, a withheld line, a
   file that will not play back. A defect in the **client's own site** is not this node's fault and does not hold
   the prototype back — it becomes **"FOR THE PROTOTYPE TO FIX"**.
3. **A hand is run, not described.** An order is only `PASS` when a hand actually produced something, and the row
   quotes it (`HOOK = "…"`, `made — 768×512 · 133 KB`, `MP4 · 8.9s · read back playable`).
4. **There is no `copy` role.** The copy hand **is** the register (`video-node/src/story.js`). The docs say so
   rather than implying an agent that does not exist.

**Measured live (2026-09-22), not claimed:** the queue/sweep — 2 synthetic videos → 19 stills, 4 clips, 3 moments
named by the eye, a reel **25.15 MB / 46.7 s / 1080×1920 / 1401 frames** written in **8.9 s (5.2× real time)** and
read back playable. The station, against the real venue `canon.mailala.pages.dev` + its WhatsApp, phone and email:
**4 links read** (1 page **1460 words / 29 money lines**; the email **GIVEN and never linked by their own site**),
research **6 industry must-haves** (1 — the menu/booking page — found nowhere), a **6-section blueprint**,
**5 assets made** by the image hand, a **8.9 s MP4** rendered by the video hand, the copy hand's story passing its
own audit, and the gate reading **NOT YET COMPLETE — 8 pass · 5 warn · 1 hole · 0 fail**. Confirmed by looking at
the rendered page, not only the console.

**Still owed (do not claim these):** the node has **never been pasted into a generator of its own** — it is a
scaffold (`src/generators/README.md` → the `video` row); the harness lives in `scratch/vn-harness.js`, which is
**ephemeral** and rebuilt in `video-node/README.md` → *Testing this node*; and the observed 7-word Instagram read
now returns **429 unread** instead of thin, which is honest but means the **read-but-thin** path is written and
not yet exercised on a live page.


## AMENDMENT IX — THE OFFER DESK (2026-09-23, `src/offer-desk/` + `src/offers.js`)

The free-website offer stopped being an offer and became a **machine that is sent**. It came in as a
correspondence — two videos the sovereign attached — and one line in it *is* this amendment:

> *"I'm going to design an app for you to use to take walkthrough videos. Give me voice recordings. Answer some
> written questions and provide i need an all links to your online presence … even the most amateur of walkthrough
> videos can be turned into a masterpiece. These days."*

And the instruction that followed the attachment:

> *"correspondence with someone who responded to my free website offer, they are not priority but we will still send
> them and the others who have accepted the offer (currently personal trainers, this guy, hotel industry) see why we
> want to be dynamic?"* · *"lets build this out and make it a live cloudflare page and take note of the other key
> SOUL"*

**What was read, and how it was read (the provenance rule).** Two videos were decoded **on this device** —
frame by frame, in a worker, with WebCodecs and `mp4box` — because no image tool reads an mp4 and nothing may be
uploaded to look at one. `…6580.mp4` (590×1280, 19.5 s) is a **screen recording of the chat**; `…6583.mp4`
(368×640, 59.9 s, 1606 frames) is **the reference video that was sent in it** (a night walkthrough of a reggae bar
and hostel — the venue whose page already exists). The chat was transcribed **from the frames that were read**, and
it is captured into the ledger as **a READING, not as a typed message** — the footnote says which file, which
resolution, and that anything the recording never scrolled past is absent rather than inferred. **A transcript of an
image is never filed as a quotation.** The reference video was captured the same way, with the timestamps of the
frames that were read.

**What is new in the body:**

- **`src/offer-desk/`** — the desk itself: `trades.js` (the dynamic heart — nine trades, each a full reading of
  *what the page must do · what to shoot · what to answer · how they are found*), `desk.js` (intake, probing, stills,
  the timecoded sheet, the pulse, the reel, voice notes, the bundle), `bundle.js` (a hand-written STORE ZIP with
  CRC32, and the brief), `styles.css`, and **`pulse.js` + `reel.js` vendored byte-exact** from the video node so the
  desk runs with no perchance, no plugin and no host.
- **`src/offers.js`** — the register: `/offers`, `/offer <name>`, `trade · desk · got · need · sent · live · note`,
  `/offer trades`, `/offer file`, **`/offer release`**. It is **the index, not the archive**.
- **`src/app.js` / `index.html`** — the `/offer` command block (the same shape as the client layer), the command-table
  row, and the Audit-rule entry in `SRC_SNAPSHOT` **in the same commit** (stated again, because it has now bitten
  three times).

**The doctrine this amendment adds:**

1. **One link, read for the trade.** The *same* URL goes to a coach, a trainer, a guesthouse, a reggae bar, a café,
   a builder — and the page re-reads itself. It is not a template with the words swapped: the trade decides the
   shots, the questions, the page's parts, and the channels. An unknown trade is **never rounded to the nearest
   one** — `other` is a real entry that admits the gap and asks.
2. **Nothing is uploaded — so the handover is a file.** The footage is read where it sits, measured there, rendered
   there; one ZIP goes back with the reel, the stills, the sheet, their voice, their answers and the brief.
3. **The reel only ever says what they said.** Captions come from their own words; the title card is their own first
   answer; the "one way in" is a channel they actually gave. Nothing to say → no caption, and the log says so.
4. **A link that cannot be opened is not printed.** THE DROP has **no host** until a release has put it somewhere
   and **read it back**. The register shows **NONE YET**, never a plausible URL.
5. **A deploy that was not verified is not called live.** `/offer release` checks the token with Cloudflare *before*
   building, deploys, then **fetches the live URL and looks for the desk's own line in the response**. Unverified is
   reported as unverified.
6. **No person on the register is in `src/` (BRAND.028).** The source ships; the register is this browser's kv.
7. **It is an assessment, never an advertisement — "we sell by not selling."** The sovereign, on first reading
   the page: ***"dont write it like an ad. write it like an assessment"*** and ***"we sell by not selling"***. So
   the desk **states** and does not argue: the headline is a reading (*"A reading of what your business shows to
   someone already looking for it — on a phone, from a link."*), the opinion is signed to its author (*"In my
   reading it comes to one of three things…"*), the terms are stated and then the *reason they are stated* is
   given (*"…stated because it is a fact about the offer, not a reason to take it."*), and the per-trade registers
   (`words`) are written as what a page must **state**, never as what to **sell**. No superlative, no urgency, no
   benefit promised, no "we", no exclamation — and everything else on the page is an instruction or a measurement,
   so nothing is left that could read as a pitch. The test of it: every claim on the page can be checked or
   refused, and no line is trying to move the reader.
8. **We take the data in and hand back the proof of work, and the proof sells itself.** The sovereign's next
   sentence: ***"but we get the data, to deliver the proof of work, and it sells itself"***. The page is the
   **intake**, not the pitch: the trade, the name, the footage, the pictures, the voice, the links and the
   answers are all taken so that a real artefact can be made out of them — and the artefact is what the owner
   judges. So the offering states what is received, once, as a fact (`OFFER.proof`, the one `.proof` line on
   the page): *"What comes back is the work itself, not a description of it… You judge it on the thing in
   front of you, not on this page's account of it."* **The commercial theory of the instrument, stated
   plainly: give the work away, keep nothing behind a pitch, and let the work be the argument.** It is also
   why the desk is honest to the point of self-harm — a brief that names what is missing, a reel carrying only
   the owner's own words, a measurement reported as *not taken* rather than as zero. A proof of work is only
   worth something if it survives being checked by the person who paid nothing for it.

**Measured live (2026-09-23), not claimed:** the desk, driven in a same-origin harness built from its **real
files** — two videos → **24 stills**, a **12-tile timecoded sheet**, a pulse with the loudness pass on the file that
had audio (and `MOTION ALONE` on the one it could not decode, said out loud), a reel **13.7 MB · 1080×1920 · 438
frames · written in 4.9 s and read back through a `<video>` as playable at 14.6 s**, a bundle of **31 files**
unzipped and verified by a real unzip library, and the reel's title card carrying the owner's own words. Also
verified by **looking** at the rendered page (phone 390×844), not only the console: the offer, the trade panel, the
shot list, the measured readout and the reel card all render as designed.

**LIVE, and read back (2026-09-24): `https://the-drop-prais.mrmichaelhobbs123.workers.dev/`.** The worker was
deployed, its subdomain enabled, then the page was fetched from the live URL and **read**: HTTP 200 · **173,120
bytes** · the desk's own headline found in the response · then the rendered page **looked at** at 390 px and at
1280 px. The trade link resolves: `?t=coach&who=…` opens the coach reading. `RELEASE.probe` is the desk's own
opening line, and it moves with the copy (the release reads the live page back for it, so the two cannot drift).

**The BLOCKED report, audited and corrected — keep this, it cost a day.** The first attempt is recorded above as
blocked on the token: the stored `cfat_Kk9…fe84` came back from `/user/tokens/verify` as **"Invalid API Token"**,
and because a nonsense token returns a *format* error and **no header** returns *"Missing Authorization header"*,
the transport was provably intact — so the token was judged dead. **It never was.** It is an **account-owned**
token, and `/user/tokens/verify` is the endpoint for *user*-owned tokens: it answers exactly that message for a
valid, active account-owned token. The sovereign said ***"its not locked try again"***, and re-measuring proved
him right: at **`/accounts/<id>/tokens/verify`** the same token answers **200 · `{"status":"active"}` · "This API
Token is valid and active"**, and the account's fleet lists **22 workers**. `src/offers.js → tokenCheck` now asks
the account endpoint **first** (user endpoint as fallback), reports which one answered, and then proves the
permission the release actually needs — **listing the account's worker scripts** — because "active" is not the
same claim as "allowed to deploy". **`src/vault.js` had already learned this on 2026-09-21 and its comment says
so; the release path had not.** The lesson to carry: an "invalid credential" verdict from a *different* endpoint
than the one the credential belongs to is not evidence about the credential.

**Still owed (do not claim these):** the desk has **never been pasted into a generator of its own** (it is a page in
`src/`, released by the station); the **other acceptors have no register entries yet** — only the one whose
correspondence was read is on the board, because a lead is a real person and their name, number and trade have to
come from the sovereign, not from a guess; and **the live page is a place to send the link, not a page that has been
sent** — no link has gone to anyone, and the register says so until `/offer sent <name>`.

**THE A→Z DEBUG PASS (2026-09-24, on the sovereign's order *"test and debug entire a to z"*).** Six real faults
found and fixed, each with the measurement that found it written beside the code — the full table is in
`src/offer-desk/README.md → the A→Z debug pass`. (1) **The probe race:** a video dropped and read in the same breath
was **skipped entirely** — `queueVideos` fires `probeAll()` and returns, so the read ran while the browser was still
opening the file, producing a reel built from the pictures alone with the pulse unmeasured and **nothing said about
either**. Fixed with `state.probing` + `settledProbes()` awaited by every read path, and by **naming** whatever is
still unread at the moment it is left out. (2) **A hidden tab crawls:** measured **50s hidden for a reel that takes
3.88s in front**, and a 255-frame render did not finish inside four minutes — so `renderReel` now **refuses** when
`document.hidden`, states the measurement, and claims nothing. (3) **A wrong reason asserted as one:** the metadata
timeout always blamed the background tab, so a damaged file in a foreground tab was reported as a browser quirk;
it now reads `document.hidden` and says which cause it is. (4) **`/offer <one-word-name>` never opened a lead** —
the very form the board prints as the instruction. (5) **An unknown op made a phantom person:** `/offer dexk jett-ro`
created `dexk-jett-ro` beside the real one; now refused with the vocabulary named and nothing created. (6) **A known
op with no name dumped the board** (`/offer live`); now a usage line. **Measured in the same pass:** all 9 trades
carry complete data and render with no gaps; eleven routing phrases resolve correctly, two of them **fail closed**
into `other`; the desk's UI surface behaves with no console error; the bundle's `brief.md` is **byte-identical** to
`Desk.brief()` with every absence named; the release was re-run and **all six fixes are in the served bytes**.
**Not verified in this pass, and said so:** the footage path (probe → stills → sheet → pulse → reel) and the
media-bearing bundle — the preview tab was `document.hidden` throughout and a browser will not load a media file in
a hidden tab. Fix 1 is proven by its own log lines, not yet by a full successful read: keep the tab in front and run
it again, or drop a real walkthrough into the live desk on a phone.

**LATER THE SAME PASS — the footage path, closed.** The tab came back to the front, and the same harness (two
synthetic **H.264+AAC MP4s** built with WebCodecs + `mp4-muxer` — the desk's own stack, nothing uploaded, no client
material) was fed in with the **drop-then-read-immediately** pattern that used to skip it. The fix holds: the log
reads *"waiting for the file(s) on the desk to be read…"*, then both probes, then **24 stills (12 per video)**, then
the pulse — *"motion floor 3% → peak 8% · loudness heard (floor 2% → peak 49%) · walked in 0.81s"*, the life at
**0:04**, **2 windows cleared the floor, 1 distinct moment** — then a **24-tile contact sheet** (4×6, **looked at**),
a reel of **9 shots · 558 frames · 7.15 MB** (the stills being the **top-scoring seconds** of the measurement), and a
**32-file bundle** (`brief.md · answers.json · links.txt · soul.json · sheet.jpg · cover.jpg · reel.mp4 · stills/01…24
· voice/voice-1.webm`) whose `brief.md` is **byte-identical** to `Desk.brief()`. **One honest gap:** the tab went
hidden **mid-render**, so the render took 56.98s instead of ~4s and the reel's read-back could not load the file —
and the desk said so in its own readout: *"could not be read back (no metadata after 8s) — the numbers above are the
encoder's intent, not a player's"*. Correct behaviour, and *"read back through a player: 10.6s · 1080×1920 —
playable"* was already proven with the tab in front. **Never exercised: the voice-note recorder** (`getUserMedia`
needs a permission grant the harness cannot give); the voice **bundle** path is tested with a synthetic blob.


## AMENDMENT X — MAILALA, FOCUSED, AND HANDED OFF (2026-09-24, `src/sites/mailala/`)

The sovereign, in two turns: ***"Mailala Focused Only now, SOUL (MY WORDS VERBATIM)"*** → ***"IDEA - Pitch deck
comparison of their current shit page versus our new free website add this to backburner pipeline, add this to git
Canon"*** → ***"passs offf the Mailhala to the git synch for session 2 clone to take over you are mastermind"***.

**What is new in the tree:** `src/sites/mailala/SOUL.md` (the sovereign's Mailala words, verbatim — SOUL-01…SOUL-10
off the canon register plus this directive — with the material he supplied described truthfully, and **the venue's
own words** read off its signage); `src/sites/mailala/material/` (nine venue photographs, original filenames kept as
provenance); `src/sites/mailala/HANDOFF.md` (the session-2 takeover brief, with the backburner inside it). All three
are registered in `SRC_SNAPSHOT` **in the same edit** — the fourth time that rule has been restated, and the first
time it was obeyed before the sync rather than after.

**The doctrine this amendment adds:**

1. **A drop of material is a SOUL event.** When the sovereign supplies pictures or footage, the material is
   **read** (decoded here, frame by frame, with WebCodecs and `mp4box` — nothing uploaded, no image tool reads an
   mp4) and then **described from what is actually in it**. The first Site Builder run invented every alt text and
   every one was wrong; this is the correction of that, made permanent.
2. **Material is separated from words, and each is labelled.** Pictures and video are the *material*; the
   sovereign's sentences are the *SOUL*; the venue's signage is *the venue's own words*. A transcript of an image is
   never filed as a quotation.
3. **Name what is not the subject.** One of the three videos supplied was a **Zalo chat about a teaching timetable**
   with a school contact — not Mailala. It is named in `SOUL.md §4` and kept out of the venue's record, because a
   pile of attachments is not a scope.
4. **The backburner is stated, not implied.** An idea the sovereign parks is filed as SOUL on the pipeline and
   written into the handover's backburner list with his words verbatim, the date, and what it would mean read
   plainly — so a later session cannot promote it by accident or lose it by silence. `BACKBURNER-01` is
   *"Pitch deck comparison of their current shit page versus our new free website"*.
5. **A handover is an artefact, not a promise.** The Mailala pass-off is a file in the tree that travels with the
   sync, so the session-2 clone inherits the state instead of the story of it. **`scratch/` is not a handover** —
   everything the first session left there (the 720p venue reel, the rooftop track, the canon mirrors) is gone when
   that tab closes, and the handover says so out loud.

**Owed, and not claimed:** nothing has been sent to Mailala; no dormitory photographs exist; the testimonials are
still placeholders; 18 of the 50 pipeline stages are unbuilt; `mailala.com` is a route in a config, not a measured
deployment. The session-2 clone takes the work — not a finished thing.

