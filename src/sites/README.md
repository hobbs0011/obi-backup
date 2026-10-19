# src/sites/ — the finished builds the wings produced

These are **shipped artifacts**, not scaffolds: a real page, finished by hand, that came out of the Site Builder
wing and the Video Node's eye. They live here so a later session can see what the machinery actually produced and
diff a future run against it.

| folder | what it is | authority |
|---|---|---|
| `mailala/index.html` | the wing's Mailala venue page — composed by the Site Builder from the 100-step pipeline's brief (SOUL-01…SOUL-10), then finished by hand | **NOT authority.** The canonical Mailala site is the canon's `WEBSITE/mailala/`, live at `canon.mailala.pages.dev`. This is the wing's own build of the same brief, kept as the worked example. |
| `mailala/SOUL.md` | the sovereign's Mailala words, **verbatim** (SOUL-01…SOUL-10 from the canon register + the 2026-09-24 directive), the material he supplied with what each file actually shows, and **the venue's own words** read off its signage | **the record of intent.** Copy the canon's `CANON/MAILALA-PROMPT-REGISTER.md`; this is the travelling copy. Never edited, never summarised. |
| `mailala/material/` | the venue photographs supplied by the sovereign (9 files, original ids kept as provenance) — bar at night, rooftop, murals, the menu poster, the "Say No to Drugs" posters, "Jamaican Catering", the rasta restroom sign | all nine are now USED by `mailala/index.html`, and `ASSET-MANIFEST.json` names each one's slot (M-01 the hero + `og:image`, M-02 the spirit panel, M-03 the menu board, M-04 the rooftop gallery …). Described truthfully in `SOUL.md §4`, because invented alt text was the first build's worst defect. |
| `mailala/ASSET-MANIFEST.md` / `.json` | **THE ASSET REGISTER** — every asset in the blueprint located, labelled and SHA-256 hashed from its actual bytes, plus the census of the whole estate (count · bytes · one TREE DIGEST over every `path sha256` line). The `.md` is for reading, the `.json` carries every digest. | **the register is the inventory.** Generated, never hand-typed: the register pass re-runs it, and `/relay` rebuilds the same census in the browser and names anything that has moved. The four delivery documents are excluded from the census, and the file says so. |
| `mailala/SYNC-PACKET.md` / `.json` | **THE SYNC PACKET** — the same work addressed to the node (`phoenix-rising-ai-solutions-agent99-webapp`): every artifact with a URL that answers and the digest to check it by, plus the three lanes as MEASURED (the token-free read channel WORKS pull-only; the mesh write is BLOCKED at the anti-bot gate; the cloud is BLOCKED with no credential). | **the packet is the courier** — regenerated and delivered again whenever the state moves. The register is the stable artifact.

## The delivery — the four truth-documents, and the pipeline that carries them

The wing's work leaves this shelf through **four documents and one pipeline**. They are the four
files above that are *excluded from the register's own census* — because a document that enumerated
itself would be stale the moment it was written — and they are carried by **the relay**
(`src/relay.js`, `/relay`): the master sync pipeline that reads them, measures the estate against
the register, uploads what has moved (by digest, so identical bytes are never re-uploaded), tries
the mesh and the cloud and records each refusal verbatim, re-hashes every URL it delivered, indexes
the result, and seals the run under its own digest. It reports **REAL / HOLLOW / MISSING / BLOCKED**
and it is never allowed to say COMPLETE with a shut door.

A run of it looks like this (2026-09-25, measured in the station's own browser):

| stage | verdict | what it measured |
|---|---|---|
| READ | REAL | both delivery documents answer on this origin |
| CENSUS | REAL | 244 files · 18,415,585 B — the tree digest rebuilt here is the tree digest the register recorded |
| DELIVER | BLOCKED | the four documents are out (by digest); the mesh write returned `anti_bot_verification_needed`; no Cloudflare credential exists in this origin |
| VERIFY | REAL | every delivered URL was fetched again and re-hashes to the digest it was delivered with |
| INDEX | REAL | the brain's index built over the estate |
| ARCHIVE | REAL | one hashed snapshot, under the run's own digest |

**Result: HELD, not COMPLETE** — which is the point. Two doors are shut, each one says why, and
nothing is claimed as sent that was not sent.


## What is the model's and what is not, in `mailala/index.html`

The page below the fold is a **real build**: the Site Builder composed it in parts from the venue's own photographs
and the frozen brief, in the venue design grammar (warm cream ground, never dark; serif display over sans body; the
green · gold · crimson three-band stripe as the only ornament; one goal repeated everywhere).

**Corrected by hand after the build.** Every one of these was found by *rendering the page and looking at it* —
which is the only way this class of defect is ever found:

1. **Every alt text was wrong in the same way.** The model cannot see a photograph, so it wrote plausible ones and
   its guesses were confident and false — *"a four-bed mixed dorm"* was the menu poster. All nine images were
   re-checked against the actual files and re-captioned from what each picture really shows.
2. **There are no photographs of the dormitories in the material at all.** The three room cards had been pointed at
   three unrelated pictures (the menu board, a guest with a fan, the Jamaican Catering sign). The cards now carry the
   house stripe instead of a stand-in, with a line saying so and sending the reader to WhatsApp — an honest gap where
   a lie used to be.
3. **A stray `{` after `details {` killed every CSS rule below it in the stylesheet** — the whole footer, the FAQ
   cards and the responsive block were silently dead, and the footer rendered as unstyled stacked text. Removed; the
   rule count went from 53 to the full sheet.
4. **The word-tags row printed literal markup** — `< span class="word-tag">Big Up` — because a tag had been broken
   across two lines in the source. Repaired; the four tags now read *Love Up · Bless Up · Irie Up · Big Up*.
5. **The footer was near-black** (`--near-black`, inherited from the canon's dark theme) against a brief that says
   the ground is never dark (SOUL-06: *"too dark of a background … increase the cool and chill hangout place"*). It
   is now the deep forest green with cream text, and the map's ground with it.
6. **The meta description** was missing (the landing audit caught it) and was written in.

**Verified after every one of those changes:** all 9 images 200 and decoding, 0 broken, 0 leaked markup, the four
word-tags rendering, 5 `wa.me`/`tel:` links, the real address and the real prices present.

Nothing else was rewritten. The sections, the copy, the prices and the WhatsApp calls are the wing's own output.
