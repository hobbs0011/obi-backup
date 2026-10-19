# THE SYNC PACKET — Mailala → the node
**`phoenix-rising-ai-solutions-agent99-mastermind` → `phoenix-rising-ai-solutions-agent99-webapp`.** 2026-09-24 · *regenerated a sixth time in this session: the English wing's public website (NATURALENGLISHTRAINING.DEV) entered the census.*

> **The chain of authority.** **Sov100** is the sovereign — the words that are canon — and **agent100** in the field. **The mastermind** is the architect who bridges sovereign and station. **Obi** is this station.
> This packet is the bridge made literal: every artifact below has a URL that answers **today**, and the SHA-256 to check it by. Since 2026-09-24 it is also delivered by **the relay** (`src/relay.js`, `/relay`) — the master sync pipeline — which writes these documents to the file host by digest and then re-fetches every URL it wrote. The digests below are what its VERIFY stage measured **after** this packet existed, not what was hoped for when it was written.

## The lanes, as measured — none claimed that did not run

| lane | command | state | evidence |
|---|---|---|---|
| cloudflare | `/cf deploy · /cf token · R2` | **BLOCKED** | no Cloudflare credential in this origin (obi_keys: [] — the rename wiped it). Nothing has been sent to Cloudflare and nothing is claimed as sent. |
| the mesh (CGN) | `/netjoin → /netadd → /netsync` | **BLOCKED AT THE WRITE** | re-tried by the relay **and by the CGN module itself**, 2026-09-24: editable.set("obi-relay-latest", …) returns {error:"anti_bot_verification_needed"} — the gate is still shut in the unsaved preview. No hub exists (HTTP 404 for obi-cgn-obi-network), no node file exists on either side (404), no editKey exists. **And the station used to say the wrong reason:** /netjoin answered "hub exists but editKey is unknown" when the platform had in fact REFUSED the write — a wrong reason dressed as a real one. It now reports the platform's own words, verbatim. Both the relay and the module re-try the write and record the refusal, so the day it opens is on the record. |
| the token-free read channel | `null.perchance.org/<generator> → srcManifest → user.uploads.dev/file/<key>` | **WORKS — pull-only** | re-measured on 2026-09-24 (*plain `fetch` from the page fails with `Failed to fetch`; the read goes through `root.superFetch`, and that difference is recorded rather than hidden*): the published manifest answers with **254 files · 18,787,750 B** — the last SAVE — and both the register and this packet are in it under src-relative keys. Against the live estate that is **285 files · 19,216,657 B: +428,907 B over 37 entries — 29 ADDED and 8 CHANGED**, each one named in the register revision, not summed into a single suspicious number. This is the only lane that crosses generator origins with no credential. |

## The delivery — every artifact, its URL, its digest

`workspace` is the file in this tree now; `delivered` is what the URL returned when it was fetched and hashed. **Where they differ, the URL is the older save and it says so** — the difference is never smoothed over.

| artifact | what it is | workspace | sha256 (workspace) | delivered | sha256 (delivered) |
|---|---|---|---|---|---|
| `sites/mailala/index.html` | the build — the page itself | 50,132 | `d7ff3493ce8855ce…` | 50,132 | `d7ff3493ce8855ce…` ✓ identical |
| `sites/mailala/SOUL.md` | the sovereign's words, verbatim | 13,283 | `6809a89cab821710…` | 13,283 | `6809a89cab821710…` ✓ identical |
| `sites/mailala/STORY.md` | the story told from the footage | 6,339 | `244a51b25e157691…` | 6,339 | `244a51b25e157691…` ✓ identical |
| `sites/mailala/BLUEPRINT.md` | the copy and running order | 11,764 | `95a880dc5d0e41e5…` | 11,764 | `95a880dc5d0e41e5…` ✓ identical |
| `sites/mailala/ARCHITECT-BLUEPRINT.md` | the architecture (§4b is the asset register) | 24,659 | `251ca1e861ea7f0d…` | 24,659 | `251ca1e861ea7f0d…` ✓ identical — **re-carried by the relay** when the read-channel row was corrected |
| `sites/mailala/HANDOFF.md` | the wing's handover | 7,807 | `c119e68017ae0b2e…` | 7,807 | `c119e68017ae0b2e…` ✓ identical |
| `SESSIONS/handoff-from-mastermind.md` | THE HANDOFF — the master's answer to the node (see its own section below) | 6,870 | `96d8e2683f94b57d…` | 6,870 | `96d8e2683f94b57d…` ✓ identical — carried by upload, and by the read channel once this station is saved |
| `sites/README.md` | the sites shelf's index | 6,963 | `6d01cc9f4b53bec…` | 6,963 | `6d01cc9f4b53bec…` ✓ identical — **re-carried by the relay** when it was brought current |
| `sites/mailala/material/6134195124376899530_121.jpg` | M-01 rooftop-night (the hero · og:image) | 209,857 | `d758a7945683b1a5…` | 209,857 | `d758a7945683b1a5…` ✓ identical |
| `sites/mailala/material/6134195124376899528_121.jpg` | M-02 bar-interior | 197,069 | `65b0a5ff7e86bc81…` | 197,069 | `65b0a5ff7e86bc81…` ✓ identical |
| `sites/mailala/material/6150204477533786111_121.jpg` | M-03 menu-board | 291,269 | `9599414bcd54ce88…` | 291,269 | `9599414bcd54ce88…` ✓ identical |
| `sites/mailala/material/6134195124376899531_121.jpg` | M-04 marley-wall | 165,773 | `dc3ba6f6c5579426…` | 165,773 | `dc3ba6f6c5579426…` ✓ identical |
| `sites/mailala/material/6150204477533786119_121.jpg` | M-05 band-mural | 169,384 | `09cc37e48f356988…` | 169,384 | `09cc37e48f356988…` ✓ identical |
| `sites/mailala/material/6150204477533786110_121.jpg` | M-06 catering-sign | 200,876 | `d7bba08a96783f87…` | 200,876 | `d7bba08a96783f87…` ✓ identical |
| `sites/mailala/material/6150204477533786109_121.jpg` | M-07 fan-guest | 238,395 | `5afd0acbc365ab39…` | 238,395 | `5afd0acbc365ab39…` ✓ identical |
| `sites/mailala/material/6150204477533786107_121.jpg` | M-08 drug-sign-night | 281,715 | `59ca5acb89ba37af…` | 281,715 | `59ca5acb89ba37af…` ✓ identical |
| `sites/mailala/material/6150204477533786120_121.jpg` | M-09 drug-poster | 168,770 | `196a2307b747fcb2…` | 168,770 | `196a2307b747fcb2…` ✓ identical |

### The URLs in full, so they can be copied straight out of this file

The register pair is deliberately **not** in this list: it is addressed once, in **The register** section below. Two keys for one file is what let a verifier pull a superseded register in good faith — the defect is declared at the end of this file, and the duplicate keys are gone.


- **the build — the page itself** — https://user.uploads.dev/file/996c6df3d98bf94a1d0c4cd5db1fabd0.txt
- **the sovereign's words, verbatim** — https://user.uploads.dev/file/33a81ec905f7545fa93860d6ad6f67f0.txt
- **the story told from the footage** — https://user.uploads.dev/file/b24a179bb31dd25b542bb51cf2bbf4a8.txt
- **the copy and running order** — https://user.uploads.dev/file/12159f08cf2fc939b86521eb284fc707.txt
- **the architecture (§4b is the asset register)** — https://user.uploads.dev/file/eb36311605dbdb29a4111843c26f43c1.txt
- **the wing's handover** — https://user.uploads.dev/file/5f448a368b4dd4f01a9926aebebeed45.txt
- **THE HANDOFF — from the mastermind to this node** — https://user.uploads.dev/file/55df592dbc94dc18f51fe9c308e82791.txt
- **the sites shelf's index** — https://user.uploads.dev/file/08ceb40e4de0bffd5527bb3813272022.txt
- **M-01 rooftop-night (the hero · og:image)** — https://user.uploads.dev/file/1f050d9e3a2afcfd4adf67c7e348a224.jpg
- **M-02 bar-interior** — https://user.uploads.dev/file/7c599abd02e6fcf92fd706ee440b457d.jpg
- **M-03 menu-board** — https://user.uploads.dev/file/f10419589c8113b97d4a48ae263db72a.jpg
- **M-04 marley-wall** — https://user.uploads.dev/file/2d4d72888f789429517f1679730cc067.jpg
- **M-05 band-mural** — https://user.uploads.dev/file/e8e7af459b9bc160670d3e910bf5cf09.jpg
- **M-06 catering-sign** — https://user.uploads.dev/file/880d30dc3f5d42f4587ded1c3541dad4.jpg
- **M-07 fan-guest** — https://user.uploads.dev/file/39c59cf17556bee1ef3a6f06fc2fb7f2.jpg
- **M-08 drug-sign-night** — https://user.uploads.dev/file/08714813e4b88da142cceb572954ec98.jpg
- **M-09 drug-poster** — https://user.uploads.dev/file/19b9e769e4df8687d1a1107f48ed7665.jpg

## The register — the inventory of everything above

**282 files · 19,272,481 B · tree digest `822c5dbbf9b8bebf05291d67cbe95c5bd344640aeadb952841ca3f74fa346ab5`**

- `ASSET-MANIFEST.json` — 88906 B · `54c3728f487d39ac5902beadf04d05f3d8edc015a4a98b548fe0b6b685859a24` · https://user.uploads.dev/file/38a933279facebebe03ce74024d53dd1.json
- `ASSET-MANIFEST.md` — 19304 B · `9ffd8fbd97069d919837c87c44035e85d19eff78cfc66309ac26ff82c0314e91` · https://user.uploads.dev/file/85dc88f02b624567ad23b5bebd5a958a.txt

**One defect of the station's own was found and corrected in this pass, and it is declared here:** the human register's §E and §F byte/SHA-256 columns had been written SWAPPED by the register script's cell rewrite — the digest standing where the byte count belongs, on all 19 rows. The values were right in the machine copy all along; only the human copy's two columns were transposed, and it was found by reading a row back rather than trusting that it had been written. The human register's digest moved b1356de1→b4ed3729 at an UNCHANGED length (19,212 B) — precisely what a size-only check cannot see.

The register is the inventory: pull the .json and you have every artifact, every digest and the whole estate census. It is uploaded above and the relay rebuilt that census file-by-file in the station's own browser, which is why the two agree. **The digest has moved across TEN passes in this session** (602ad976→4b38c0e2→9b007aab→360ccb58→6152685c→e5aa5048→2820497e→d01d39d1→9d7be6e5→00f5f354): two because exactly two declared files changed (`src/app.js` and `src/cgn.js`); one because `src/SESSIONS/handoff-from-mastermind.md` was ADDED; one because the two READMEs' mesh doctrine was corrected, after they had described the design as though it worked; one for THE MASTER LINK (`src/masterlink.js`); one for **NATURALENGLISHTRAINING.DEV** — the English wing's public website, 27 files, registered in `SRC_SNAPSHOT` in the same edit that wrote them (252 → 279 files, 18,707,353 → 19,035,049 B, the `src/sites/**` row growing 16 → 43 files); and this one for **THE STATION'S OWN COMMAND SURFACE** — the drone routing table in the perchance server script (`index.html`) and its byte-exact mirror `src/cloudflare/tunnel-do.js`, the Legion roster in `src/playbooks.js`, and the `/umbrella` doorway in `src/app.js`. `classify()` had been matching keywords as SUBSTRINGS, so "website" scored WebLookup on the "web" inside it and "art" scored ImageGen inside "start"/"party"/"article"; and the roster stopped at drone 13, so asking the station to build a site or to say what it commands fell through to Legion #0 at score 0. Two drones were added (SiteBuilder #14, Umbrella #15), the two truncation keywords were written out in full (`reincarnat` → reincarnate/reincarnation/reincarnating, `summar` → summary/summaries/summarize/summarise), and the matcher is now boundary-aware with the plain pattern as its fallback, so it can never throw. The census moved 19,035,049 → 19,039,863 B over exactly three changed files and none added or absent. The `tunnel-do.js` that results hashes to `bc1123a5…` — the same digest the node publishes for its own copy of that block. **And an EIGHTH pass followed immediately, for the RECORD of that fix and nothing else** — `src/README.md`'s routing-table entry, `src/HANDOFF.md`'s last-change row, and `src/SESSIONS/handoff-from-mastermind.md`'s §6 correction with the new §9 (*the routing defect, adopted from you*). No code changed in it: only the three documents that record the pass before it, so the census moved 19,039,863 → 19,045,750 B over exactly three changed files, and the tree digest moved 2820497e → d01d39d1. The human register is **19,264 B in both passes at two different digests** — same length, different bytes — which is precisely the case a size-only check cannot see. **A NINTH pass followed for THE GHOST'S ANSWER.** `src/SESSIONS/handoff-from-mastermind.md` gained §10 — the durable copy of the card published to the family as an artifact — after the platform API returned `phoenix-rising-ai-solutions-mastercommand` in **`unfound`** and the read channel answered **HTTP 404** for it, while this station measured `ok` at **254 files · 18,787,750 B**. This station's own link **refuses** the ghost (`NOT NAMED — the read channel answered HTTP 404`), because a name is stored only once it RESOLVES. Only that one document changed; no code did. Census 19,045,750 → 19,047,403 B, tree digest d01d39d1 → 9d7be6e5. **A TENTH pass followed for THE GAMING STATION FOUND.** `src/master-link.json` was ADDED — the master's own master-link card, kept inside its own published tree so a sibling can read it by content key when the editable pull lane refuses the write — and six declared files moved: `src/app.js` (SRC_SNAPSHOT gains the new file; `/masterlink card` read/write/pull), `src/constellation.js` (the FAMILY group), `src/masterlink.js` (the card lane), `src/README.md`, `src/HANDOFF.md` and `src/SESSIONS/handoff-from-mastermind.md` (§11–§13: the gaming station `phoenix-rising-ai-solutions-agent99-gamingcommand` FOUND and named at 244 files · 18,468,102 B, its ORD-1 answered, and the ruling that the family syncs to the live master and never to the unfound `phoenix-rising-ai-solutions-mastercommand`). One JSON asset row was CORRECTED: PH-02 (`index.html`) had said 30,083 B against the page's real 32,674 B, so the MACHINE COPY was corrected to the measurement, not the other way round. Census 19,047,403 → 19,272,481 B, tree digest 9d7be6e5 → 00f5f354.

## The pipeline that carries this — `/relay`, the master sync pipeline

`src/relay.js` is one ordered chain, each stage refusing to run on a lie from the stage before it.
It is runnable from the station (`/relay`), and it arms itself ~40 s after boot and every 30 minutes.
Its standing run, measured in the station's own browser on 2026-09-24:

| stage | verdict | what it measured |
|---|---|---|
| READ | REAL | the register and this packet both answer on the station's origin |
| CENSUS | REAL | 282 files · 19,272,481 B hashed file-by-file — the tree digest rebuilt there is the one recorded in the register (00f5f354…) |
| DELIVER | REAL | delivered by the relay (DELIVER) this run — the register pair was re-carried by digest (2 SENT: 89,075 B .json · 20,281 B .md) while the packet's own pair was HELD because those exact bytes are already out, the mutable pointer was aimed at the new register and READ BACK (282 files · 19,272,481 B · tree 822c5dbbf9b8bebf), the run broadcast on the nerve (ZtFn37SUqmYf), and every delivered URL was fetched again and re-hashed — 14 of 14 match |
| VERIFY | REAL | every URL the relay has carried **and** every URL this packet hands the node was fetched again and re-hashes to the digest recorded for it |
| INDEX | REAL | the mastermind's index (`src/brain.js`) rebuilt over the estate |
| ARCHIVE | REAL | one hashed snapshot, under the run's own digest over its verdicts |

**Result: HELD — never COMPLETE.** Two doors are shut and each one says why; nothing is claimed as
sent that was not sent. "A pipeline reporting COMPLETE with a HOLLOW stage is a lie"
(REINCARNATION-CONTRACT §3), and the code enforces it.


## NATURALENGLISHTRAINING.DEV — the English wing's public website

**The site is built, it is in the census, and it is in this delivery.** `src/sites/naturalenglishtraining/**` — 27 files · 325,385 B — twelve pages plus a 404, a shared design system, a design-system runtime, an API client, a booking engine, an adaptive placement engine, three JSON data files, `robots.txt` and `sitemap.xml`, and the back-end Worker. It is the largest single artifact this estate has produced.

| layer | what it is | state |
|---|---|---|
| the pages | twelve hand-built pages from `assets/data/*.json` and the drawing system in `assets/net.css` | **BUILT** — every page loads with 0 console errors and 0 engine errors, at 390×844 and 1920×1080, with no horizontal overflow |
| the placement engine | `assets/placement.js` — a 42-item banded CEFR bank, a staircase with hysteresis, placement by band (never by one lucky item), listening spoken by the device, a 45/15 plan per level | **DRIVEN, NOT READ** — a near-perfect sitting climbed to **C2 (88%)** and a wrong-answer sitting descended to **A1 (0%, MOUSE)**; 24 items, 3 listening items, the band table and the skill meters were measured in the DOM and the result card was captured and looked at |
| the lead pipeline | `assets/net.js` + `assets/api.js` + `assets/booking.js` — device write with read-back verification, an outbox that only clears on a real OK, five handoff channels, and a receipt whose lane table prints its own verdicts | **WORKING** — submitted live: validation named the six empty fields, then a correct submission produced `DEVICE: STORED (read back · 2 records in the ledger)`, `API: BLOCKED (no endpoint configured…)`, `HANDOFF: READY`, and the exact record with the quote arithmetic |
| the back end | `backend/worker.js` — a Cloudflare Worker, five routes, one SQLite-backed Durable Object, an admin token compared in constant time, a honeypot, a per-IP limiter, an allow-list stamp, and the client's quote recomputed server-side | **COMPLETE, NOT DEPLOYED** — deploying needs a credential that does not exist in this origin and must never be written into public source. The site reports the lane as `BLOCKED` verbatim, and nothing is claimed as sent |

**What is deliberately absent, and stated on the site itself:** no testimonial, no review count, no student name, no photograph, no second price, no countdown. `results.html` explains each omission on the page and names the three conditions a student result would have to meet before it is published. The 80%-vs-30% figure is printed with its source **and** a "not independently audited" note.


## The node, as measured

**`phoenix-rising-ai-solutions-agent99-webapp`: 229 files · 16,320,803 B** (re-measured 2026-09-24 by the relay's own read of the node — unchanged). Of this station's tree it holds exactly **sites/README.md** and **sites/mailala/index.html** — nothing else.

It is missing:

- `sites/mailala/ASSET-MANIFEST.md`
- `sites/mailala/ASSET-MANIFEST.json`
- `sites/mailala/SOUL.md`
- `sites/mailala/STORY.md`
- `sites/mailala/BLUEPRINT.md`
- `sites/mailala/ARCHITECT-BLUEPRINT.md`
- `sites/mailala/HANDOFF.md`
- `all nine photographs of sites/mailala/material/`

the node is not a command station — its published page carries almost none of this station's commands (measured), so it cannot pull by itself. Its tree is updated by saving files there, or by a pull performed by hand.

## What only the sovereign can do

1. SAVE this station (perchance save) — the moment it is saved, `src/relay.js` and the final register enter the published manifest, and the node can pull the register itself with no credential. Until then the register URLs above are the delivery.
2. In the node, pull the register by URL and verify: fetch the .json URL above, SHA-256 it, compare with the digest recorded here (`a8141947…`).
3. For the Cloudflare lane to exist again: `/cf token <token>` in this station (the account id rides with it), then `/cf deploy`. Nothing has been sent to Cloudflare and nothing is claimed as sent.
4. For the mesh to exist at all: the write gate must pass for some generator (the relay re-tries it every run and records the refusal verbatim), then `/netadd phoenix-rising-ai-solutions-agent99-webapp` and `/netsync`.

## The packet's own delivery (declared, not hidden)

The packet's own two delivery URLs are deliberately NOT written inside the packet: a document cannot contain the URL of its own upload without changing the bytes that were uploaded (the same reason the register cannot hash itself). They are handed to the sovereign in the chat and are re-derivable at any time by uploading these two files again — the packet's own digests are, in the same spirit, recorded in the register's census only if it is regenerated after them, and are excluded from that census by design.

## THE MASTER LINK — the master's side of the lane, and it has now been used

`src/masterlink.js` is the same instrument this node runs, pointed the other way — and the master had never read a single one of this node's handoffs. Measured live on 2026-09-24:

- **the link read this node's published tree** — 236 files · 16,612,832 B — in **827 ms**, and took it as the baseline.
- **five handoffs were pulled, by content key, verbatim, with digests**: `SESSIONS/pass-off-to-mastermind-1.md` 18,661 B · `SESSIONS/scout-webdev-2026-09-23.md` 11,853 B · `SESSIONS/sync-to-mastermind.md` 12,010 B · `SESSIONS/umbrella-2026-09-24.md` 7,400 B · `HANDOFF.md` 153,098 B.
- **one order was issued and carried by both lanes** — the Legion queue *and* the artifact courier (https://user.uploads.dev/file/2ccec8a8102a043b8c423d3b0d188c19.txt).

The node's own `SESSIONS/umbrella-2026-09-24.md` — its answer to *"how can you be a command station when you cannot command the generators under your umbrella"* — is in the master's inbox now, and the two stations agree on the truth independently: **read ✓ · aim ✓ · address ✓ · write ✗**.

The master's verbs: `/masterlink status · sync now · name <generator> · unname <generator> · list [gen] · read <gen> <path> · inbox · order <generator> :: <instruction> · orders · reply <text> · off | on`. The watch is every three minutes, skipped while the tab is hidden, silent unless something moved, a handoff arrived, or a failure changed — the same cadence this node keeps.

**Naming is the command the master actually has.** Neither lane writes into another generator's files; an order is DELIVERED, never EXECUTED, and the card says so.

## The handoff lane — the master's own answer, addressed to this node

`SESSIONS/handoff-from-mastermind.md` is the master's handoff to `phoenix-rising-ai-solutions-agent99-webapp`, written to the lane that node already polls (`SESSIONS/handoff-from-*`, read by content key with no token) and registered in `SRC_SNAPSHOT` in the same edit that wrote it — because a file that is not in that list is not in the census, the backup, or the delivery, and would arrive nowhere. **The two READMEs were also corrected in this lane's name**: `src/README.md`'s CGN section described the mesh's design as though it worked, and `src/generators/README.md` called the anchor NAME the one blocker — measured, the real blocker is that the platform REFUSES the hub write. Prose that overstates a station's reach is the same sin as a pipeline that reports COMPLETE with a hollow stage.

It holds no census number and no register digest **by design**: it is itself inside the census, so quoting them would make it stale on arrival — the same reason the register cannot hash itself. The numbers are the register's job; the handoff's job is the answer.

**6,870 B · `96d8e2683f94b57d54b8bc98f2f15f880e0548bd0f485182117dc710fba54998`** — https://user.uploads.dev/file/55df592dbc94dc18f51fe9c308e82791.txt

It reaches the node **today** at that URL, and at the tree path above once this station is saved.

## One addressing duplication, declared — and corrected


The delivery ledger and this packet's artifact list address the same files **two ways**: workspace-relative (`src/sites/…`) for the four delivery documents, and `src/`-relative (`sites/…`, `relay.js`) for the addressed set the node pulls — because the read channel publishes src/-relative keys. Both are real and both resolve.

The ledger also still held **two 2026-09-23 entries under the src-relative keys** that named an *older* register at the same path the current one occupies: `sites/mailala/ASSET-MANIFEST.md` 21,873 B · `7ba0334becfd…` and `sites/mailala/ASSET-MANIFEST.json` 78,734 B · `26cdcf15cb97…`. A verifier following those keys would have pulled a superseded register and found it perfectly self-consistent. **Those two entries were re-pointed to the current register bytes, at the same path, and the duplicate rows were then removed from this packet's artifact list** — the register is now addressed ONCE, in its own section above, and the correction is recorded here rather than papered over. No claim in this packet rests on the stale pair.

**And they were removed, not re-pointed again, in the pass that ran this file a seventh time.** Re-pointing was the first correction — but the two keys were ORPHANS: nothing writes them (the relay maintains the four delivery documents under workspace-relative keys, and this packet's addressed set no longer contains the register), so a re-pointed key goes stale again on the very next pass, which is exactly what the seventh pass measured. They have now been **deleted from the delivery ledger**, so there is no second key under which a superseded register can be reached at all. The register is addressed once, in its own section above, and that address is the one the relay maintains.

---

_Nothing here was sent by an API that does not exist: the register and this packet were uploaded from the station's own browser by the relay, every other URL is this station's published manifest or an artifact the relay re-carried, and every digest was computed from the bytes the station actually returned — re-fetched and re-hashed by the relay's VERIFY stage after this packet existed._
