# THE ARCHITECT'S BLUEPRINT — Mailala
**The build in flight, specified so a builder who has never seen this session can execute it.**

> **Who owns what (read this first).**
> `SOUL.md` = intent, the sovereign's words verbatim — never edited. `STORY.md` = the story told from the footage,
> with timecodes. `BLUEPRINT.md` = the page's copy and running order, final. **This file = the architecture**:
> the layers, the contracts, the budgets, the deploy paths, the acceptance tests, the open loops.
> `index.html` = the build. Where this file and the build disagree, **the build wins and this file is the bug.**
> `ASSET-MANIFEST.md` / `ASSET-MANIFEST.json` = **the asset register** (§4b) — every asset located, labelled, hashed.
>
> **The chain of authority.** **Sov100** is the sovereign — the one whose words are canon, and **agent100** in the
> field (the same hand: the sovereign and the agent who walks the terrain). **The mastermind** is the architect, who
> bridges sovereign and station: the one who measures, specifies and answers for the work. **Obi** is this station —
> the generator that executes and speaks. Nothing below may contradict anything above it.

---

## 1 · THE SYSTEM, IN ONE LINE

The venue's own published facts → a **claims register** (what may be said, and its source) → **one self-contained
page** → **one contact path (WhatsApp)** → **one deploy target**. Nothing enters the page that is not in the register.

```
      canon.mailala.pages.dev ─┐                                   ┌─→ WhatsApp  wa.me/84768701106
      the venue's own page  ───┼─→ CLAIMS REGISTER ─→ PAGE ────────┼─→ Instagram / Facebook / Hostelworld
      SOUL.md / SOUL §4  ──────┤        (no claim without a source)│
      60 s walkthrough  ───────┤                                   └─→ Cloudflare (the deploy, §9)
      the reel (29.9 s)  ──────┘
```

---

## 2 · LAYER 1 — THE CLAIMS REGISTER (the content contract)

**Every number on the page names its source. Measured 2026-09-23 from `canon.mailala.pages.dev` (HTTP 200 · 70,441 B).**

| Claim on the page | Value | Source | Attributed on the page? |
|---|---|---|---|
| Check-in | 11:30 | the house's own FAQ | yes |
| Check-out | 13:00 | the house's own FAQ | yes |
| Dorms from | $6.65 / night | the house's own price block | yes |
| Private room with balcony | $18 / night | SOUL §3 fixed facts | yes |
| Free cancellation | up to 24 h before check-in | the house's own policy block | yes |
| Quiet hours | 23:00–07:00 | the house's own policy block | yes |
| Mon special | Jerk Chicken Monday $7 (was $8) | the house's own specials board | yes ("as published by the house") |
| Wed special | Reggae Rum Punch 2-for-1 $8 (was $10) | the house's own specials board | yes |
| Fri special | Island Burger + Fries $9 (was $11) | the house's own specials board | yes |
| Roof nights | Mon Reggae · Wed Afrobeats · Fri Calypso 11–3 · Sat Jazz 5–9 | the house's own listings | yes |
| Hostelworld ★ 10.0 | 10.0 | **the house's own listing page** | yes, in the hero badge |

**The seven refusals (enforced in the copy, not aspirational):** no guest review we cannot attribute · no countdown
or scarcity · no photograph of a room we do not have · no price without a source · no rating we did not read ·
no "luxury"/"boutique"/"award-winning" the house does not say · no invented hours.

**The three honest gaps, declared on the page itself:** there are **no dormitory photographs** in the material
(so the room cards carry the stripe and send the reader to WhatsApp) · the **guest words are placeholders**
(marked `data-placeholder="true"` in the markup) · the **"lively crowd" the sovereign remembers is not in the
frames sampled** (12 tiles across the 59.9 s walkthrough, 16 across the 29.9 s reel) so the page does not claim it.

---

## 3 · LAYER 2 — THE PAGE ARCHITECTURE

**Section tree (ids are stable; the rail links to them).**

| # | Section | id | One job | Components |
|---|---|---|---|---|
| 00 | The rail | — | place + one tap to WhatsApp | sticky bar, brand sigil (inline SVG), 6 nav links, WhatsApp pill |
| 01 | Hero | `#top` | the three true things in one breath | Ken Burns photo, graded shade, badge, H1, pitch, 2 CTAs, scroll cue |
| 02 | Quick answers | — | kill the four questions before the scroll | 5-cell strip (check-in · out · dorms · cancellation · WhatsApp) |
| 03 | Venue marquee | — | the house's own words, running | CSS-only marquee, duplicated track |
| 04 | The story | `#story` | the walk, told from the footage | 8 beat cards (roman numeral badge), the closing line from the reel |
| 05 | Our spirit | — | the ethic | photo panel + 4 tag chips |
| 06 | The kitchen | `#kitchen` | make the jerk chicken the reason | signature split (menu-board photo), 6 dish cards, pre-order CTA |
| 07 | The published week | `#week` | give a reason to come tonight | 3 special cards, 4 roof-night chips, fine print |
| 08 | Stay with us | `#rooms` | price the beds honestly | 4 quick-select pills, 3 room cards (perfect-for badge · price · list · CTA), the gap note |
| 09 | The rooftop | `#rooftop` | the night, in the house's own light | 2 band shots + 6 gallery shots, shimmer skeletons, captions |
| 10 | Guest words | — | *placeholder* testimony | 3 quote cards + the placeholder note |
| 11 | House rules | — | the rules before they are asked | 6 rule cards + the drug-free panel (the house's own three-times-repeated wall rule) |
| 12 | FAQ | — | the last objections | 6 native `<details>` |
| 13 | Find us | `#find` | get them to the door | Google Maps embed + contact card + 3 social rows |
| 14 | Footer | — | policies once more, quiet | 3 columns + the provenance line |
| 15 | Phone bar | — | the booking tap, always reachable | fixed bar, shown after `scrollY > 420`, phones only |

**CSS tokens (one palette, dark — the sovereign's reversal of SOUL-06; see `BLUEPRINT.md §7`).**
`--cream #0e110f` ground · `--sand #171b18` · `--paper #131714` · panels `#151a16` · `--ink #f3ede1` ·
`--muted #a89f8f` · `--forest #3fa06a` (accent) / `--forest-deep #0a1710` (panel) · `--gold #e2b45a` ·
`--crimson #d24a33` · `--brick #d08a5f` · `--stripe` = the green/gold/crimson three-band.
A faint 34 px gold grid sits under the whole page — the blueprint read, at 3.5% opacity.

**The JavaScript, and only this:** (1) shimmer-off when a `.shot` image loads or errors; (2) the room pills
scroll-to + on-state; (3) the phone bar reveal. **Deleted on purpose:** the entrance-animation gate — it was
bound to an IntersectionObserver and left **51 blocks at opacity 0** in a throttled preview, and a crawler would
never have seen them either. **Contract: every word of this page is visible with JavaScript switched off.**

---

## 4 · LAYER 3 — THE ASSET ARCHITECTURE

| Asset | Where it lives (durable) | What the page uses | Rule |
|---|---|---|---|
| 9 venue photographs (the sovereign's own, ids kept as provenance) | `src/sites/mailala/material/` (ships in `SRC_SNAPSHOT`) | the same 9, served from `user.uploads.dev` so the page is self-contained and deployable anywhere | **never hotlink the venue's own site**; the ids in the filenames are the provenance |
| The 60 s walkthrough | `scratch/message-attachments/6170059324904186583.mp4` — **ephemeral** | not embedded; measured for `STORY.md` | if it is wanted, it must move into `src/` or be re-fetched |
| The reel | `scratch/mailala-reel-720.mp4` — **ephemeral** | not embedded | same |
| Map | Google Maps embed (no key): `maps.google.com/maps?q=175/16 Pham Ngu Lao…&output=embed` | `#find` | if it ever blocks, the address text and the Directions button still work |
| Fonts | Google Fonts: DM Serif Display + Inter | display/body pairing | two families only |
| Mark, favicon | inline SVG data-URL (green/gold/crimson bars) | `<link rel="icon">` | no external file needed |

---

## 4b · LAYER 3b — THE ASSET REGISTER (located · labelled · hashed)

**Measured 2026-09-25.** Every asset the blueprint names, located, labelled with the slot it fills, and **SHA-256
hashed from its actual bytes** — the local bytes *and* the hosted bytes, hashed separately and compared. Ids here are
the whole estate (every one of the 244 shipped `src/` files),
the method, and what could not be hashed and why are in `ASSET-MANIFEST.md` + `ASSET-MANIFEST.json`.** The register is
*generated*, never hand-typed: re-run the pass and it states the tree as it is.

**A · The nine venue photographs** — the sovereign's own. `material/` is the authority; the page loads the
`user.uploads.dev` copy. **Both sides were hashed and all nine pair byte-for-byte, one-to-one: the hosted copies *are*
the shipped originals, and there is no tenth photograph.**

| id | label | what it shows | the slot it fills | `material/` file | hosted | bytes | SHA-256 (first 12) |
|---|---|---|---|---|---|---|---|
| M-01 | rooftop-night | fairy lights over the counter, potted plants | **hero** · `og:image` · `preload` · rooftop panel — 4 slots | `6134195124376899530_121.jpg` | `1f050d9e3a2afcfd4adf67c7e348a224` | 209,857 | `d758a7945683` |
| M-02 | bar-interior | inside the bar at night, mural on the wall | our spirit panel | `6134195124376899528_121.jpg` | `7c599abd02e6fcf92fd706ee440b457d` | 197,069 | `65b0a5ff7e86` |
| M-03 | menu-board | palm-tree mascot, jerk chicken, rice and peas | **the kitchen signature** + the menu poster — 2 slots | `6150204477533786111_121.jpg` | `f10419589c8113b97d4a48ae263db72a` | 291,269 | `9599414bcd54` |
| M-04 | marley-wall | guests at a table beneath the Wailers painting | the rooftop gallery | `6134195124376899531_121.jpg` | `2d4d72888f789429517f1679730cc067` | 165,773 | `dc3ba6f6c557` |
| M-05 | band-mural | the hand-painted band on the yellow wall | the rooftop gallery | `6150204477533786119_121.jpg` | `e8e7af459b9bc160670d3e910bf5cf09` | 169,384 | `09cc37e48f35` |
| M-06 | catering-sign | Jamaican Catering — green pot, red hand, palm | the rooftop gallery | `6150204477533786110_121.jpg` | `880d30dc3f5d42f4587ded1c3541dad4` | 200,876 | `d7bba08a9678` |
| M-07 | fan-guest | a guest with a folding fan, in front of the mural | the rooftop gallery | `6150204477533786109_121.jpg` | `39c59cf17556bee1ef3a6f06fc2fb7f2` | 238,395 | `5afd0acbc365` |
| M-08 | drug-sign-night | the glowing restroom rule, at night | the drug-free panel | `6150204477533786107_121.jpg` | `08714813e4b88da142cceb572954ec98` | 281,715 | `59ca5acb89ba` |
| M-09 | drug-poster | Say No To Drugs, green/gold/crimson | the drug-free panel | `6150204477533786120_121.jpg` | `19b9e769e4df8687d1a1107f48ed7665` | 168,770 | `196a2307b747` |

**B · The video evidence** (measured for `STORY.md`; **not embedded** — nothing plays on the page).

| id | label | local source | uploaded | bytes | SHA-256 (first 12) | state |
|---|---|---|---|---|---|---|
| V-01 | the 60 s walkthrough | `scratch/message-attachments/6170059324904186583.mp4` | `…/587c56d82502e9beeb4e49a38d84e22e.mp4` | 5,488,923 | `ab6ac28d324e` | hosted copy **matches** the local bytes; local copy is **ephemeral** (scratch) |
| V-02 | the reel (29.9 s) | `scratch/mailala-reel-720.mp4` | `…/f4edc203f3be250775b1c5100f431533.mp4` | 14,078,315 | `9b020e9297db` | same — matches; local copy ephemeral |

**C · Fonts** — DM Serif Display + Inter, linked from Google. The page ships **no font bytes**; the CSS it links is
**user-agent-dependent**, so these hashes pin **one fetched snapshot** (this browser, today) and are *not* a contract —
drift here is not a defect. 1 CSS + 9 WOFF2, listed in the manifest.

**D · The map** — the keyless Google Maps embed in `#find`. It is a live remote document, so its hash pins the
snapshot we fetched (`4269 B` · `999d872bf3dc`), **not** a promise about Google. If it ever blocks, the address text
and the Directions button still work (the blueprint's own fallback).

**E · In-document assets** (no external file): the **mark/favicon** as an inline SVG data-URL — 236 B of SVG
(`394148528c5f`) inside a 262-char data-URL (`c433a8d7254b`) · the **`Hotel` JSON-LD** block — 1,227 chars, 1,229 B
(`658c7e1889d3`).

**F · The blueprint corpus itself** — `SOUL.md`, `STORY.md`, `BLUEPRINT.md`, `HANDOFF.md`, this file and the build
`index.html` are hashed in the register too, so a later session can prove none of the authority documents moved
under it. **`ARCHITECT-BLUEPRINT.md` is the one file whose hash the register can never carry consistently** — every
edit to it changes the digest; the register records it as of its generation and says so rather than pretending.

**G · Referenced, and deliberately NOT hashed:** the Instagram, Facebook and Hostelworld URLs and `wa.me` (live,
login-walled, not payloads of ours) · the venue's own `canon.mailala.pages.dev` (hashed **as a captured copy** in the
register, because the claims register was measured from it) · and `mailala.com`, which does not resolve at all.

**H · The delivery — how any of this leaves this origin.** `SYNC-PACKET.json` / `.md` address the whole of the above
to the node (**`phoenix-rising-ai-solutions-agent99-webapp`**), each artifact with a URL that answers today and the
digest to check it by. The three lanes were measured, not assumed, on 2026-09-25:

| lane | state | evidence |
|---|---|---|
| **cloudflare** (`/cf deploy`, R2, Pages) | **BLOCKED** | no Cloudflare credential in this origin — `obi_keys` is empty since the rename; nothing has been sent to Cloudflare and nothing is claimed as sent |
| **the mesh (CGN)** (`/netjoin` → `/netadd` → `/netsync`) | **BLOCKED AT THE WRITE** | `editable.set("obi-cgn-obi-network", …)` → `{error:"anti_bot_verification_needed", editKey:null, created:false}` (verbatim). No hub (404), no node file on either side (404), tunnel idle |
| **the token-free read channel** (`null.perchance.org/<gen>` → `srcManifest` → `user.uploads.dev/file/<key>`) | **WORKS — pull-only** | re-measured by the relay: our published manifest answers **200 · 254 files · 18,721,065 B** (the last SAVE), with the register and the packet already in it; every URL in the packet was fetched again and re-hashed. (The 247 files · 18,498,799 B first written into this row was the reading before the register pass that followed THE RUBRIC — recorded here rather than smoothed over.) |

The node is **not** a command station (its published page carries almost none of this station's commands, measured), so
it cannot pull by itself: **its tree is updated by saving files there, or by a pull done by hand.** And the mesh cannot
exist at all until a generator that *can* write creates the hub.

---

## 5 · LAYER 4 — SEO AND STRUCTURED DATA (as built)

`title` · `description` · `keywords` · `canonical` · `og:type/title/description/image/locale` ·
`twitter:card` · inline SVG favicon · **`Hotel` JSON-LD** carrying `address`, `telephone +84768701106`,
`priceRange "From $6.65"`, `checkinTime 11:30`, `checkoutTime 13:00`, 4 `amenityFeature`s and `makesOffer`
for the three room types ($6.65 / $6.65 / $18).

**The one unresolved SEO fact, named rather than hidden:** the `canonical` points at
`https://canon.mailala.pages.dev/`, because the house's own canonical — **`mailala.com` — does not resolve**
(SERVFAIL, no A record, measured twice). When the domain is revived, the canonical moves to it in one line.

---

## 6 · LAYER 5 — PERFORMANCE AND THE NO-JS CONTRACT

| Rule | How | Measured |
|---|---|---|
| the hero is the first pixel | `<link rel="preload" as="image">` + `fetchpriority="high"` on the hero `<img>` | — |
| everything below the fold waits | `loading="lazy"` + explicit `width`/`height` on all 11 images (no layout shift) | 11/11 decode, 0 broken |
| images never blank-flash | `.shot.skeleton` shimmer removed on `load` **and on `error`** | 0 stuck skeletons |
| motion is optional | Ken Burns, marquee, shimmer all disabled under `prefers-reduced-motion` | — |
| content survives a JS failure | nothing is hidden by default | 0 blocks at opacity 0 |
| one file, no build step | HTML + CSS + JS in one document, ~50 KB, no bundler, no framework | 49,943 chars |

---

## 7 · LAYER 6 — ACCESSIBILITY (the contract, and the measured pairings)

Text on ground `#f3ede1` on `#0e110f` (≈ 15:1) · panels `#f3ede1` on `#151a16` (≈ 14:1) · gold `#e2b45a` on
panels (≈ 8:1) · every interactive target ≥ 44 px (`min-height` on `.btn`, `.pill`) · focus ring
`3px solid #d24a33` on `:focus-visible` · the map iframe carries a `title`, every image an alt written from the
photograph itself (SOUL §4, never invented) · headings descend h1 → h2 → h3/h4 · `<details>` for the FAQ so it
works without JS.

---

## 8 · LAYER 7 — THE CONNECTION ARCHITECTURE (the estate, measured)

| Path | Plugin | State measured 2026-09-23 |
|---|---|---|
| Read a sibling generator's live source | **super-fetch-plugin** → `perchance.org/api/getGeneratorsAndDependencies` | **WORKS** — HTTP 200; `…mastermind` 1,833 B · 7 imports · lastEditTime 1790197216523; `…webapp` same; `canon.mailala.pages.dev` 200 · 70,441 B |
| Write the CGN hub (the shared whole-organism ledger) | **upload-plugin** `editable.set` | **BLOCKED** — `{error:"anti_bot_verification_needed"}`; `editable.get("obi-cgn-phoenix")` returns nothing; the public URL answers a clean JSON 404. **No hub exists and none can be written from the unsaved preview.** |
| The agent's own file host | `upload_file` (agent tool, not in-page) | **WORKS** (used today for the walkthrough + reel URLs) |

**Therefore: the link is PULL-ONLY today.** The station can read the mastermind; it cannot post back from the
preview. **What unlocks the write:** the anti-bot challenge must be passed (unknown on the saved public page —
unproven, not disproven), the hub's `editKey` must be revealed by whichever generator created it (`/netkey`),
or a write channel outside the preview is used. **Do not claim a sync that did not happen.**

---

## 9 · LAYER 8 — THE DEPLOY ARCHITECTURE (every path measured, none assumed)

| Path | State | What it needs |
|---|---|---|
| `/cf deploy mailala src/sites/mailala/index.html` → `mailala.mrmichaelhobbs123.workers.dev` | **BLOCKED** — no Cloudflare credential in this browser | `/cf token <token>` once; then it is a one-command deploy, seconds |
| Cloudflare Pages, drag-and-drop | **OPEN** | the dashboard, an `index.html`, 2 minutes — no token needed |
| Cloudflare Pages deploy hook | **UNKNOWN** | a hook URL; none is stored anywhere (grepped) |
| `uploads.dev` (the estate's own host) | **REJECTED** — `.html`/`.htm` refused (`invalid_filetype`); `.xhtml` is stored as `text/plain` `.bin` | — |
| perchance's own hosting | **NOT POSSIBLE** for `.html` | — |
| 0x0.st · Netlify anonymous API | **CLOSED** — uploads disabled / `401` | — |
| The canon's own site | **LIVE but not this build** — `canon.mailala.pages.dev` (70.8 KB) | separate repo, separate authority |

**Recommended, in order:** (1) drag-and-drop the attached `mailala.html` into Cloudflare Pages — zero secrets,
two minutes; (2) the moment a token exists, `/cf token …` then `/cf deploy …`.

---

## 10 · THE OPEN LOOPS (nothing here is claimed as done)

**The page's own missing pipeline stages** — 18 of the 50 named in the wing's pipeline remain: gold shimmer on
the stripe · wave dividers on every section · quote-mark cards on all three quotes · the hero's Ken Burns variant
on a second image · loading shimmer on the hero · room quick-select pills keyed to price · the sticky mobile bar's
haptic · `fetchpriority` on the second image · inlined critical CSS (moot: everything is inline) · prefetch of
`#find`'s map origin · minification (deliberately skipped — the file stays readable) · Lighthouse CI ·
"Perfect For" badges on the *menu* too · an urgency strip (refused: no scarcity) · a live-booked widget (refused:
no data source) · a sunset/weather widget (needs an API) · preview deploys (§9).

**Closed 2026-09-25 — the manifest update.** The estate's assets are no longer an open loop: **§4b + `ASSET-MANIFEST.md`
+ `ASSET-MANIFEST.json`** are the register, generated from the actual bytes, reachable from the station with
**`/assets`** and re-checkable live with **`/assets verify`**. Every asset the blueprint names is located, labelled and
SHA-256 hashed, the nine photographs' hosted copies are **proven byte-identical** to the shipped originals, and the one
thing that could not be hashed (a live page, a dead domain, a deploy target that does not exist) is **declared with its
reason** instead of being quietly left out. **The delivery is closed too:** §4b-H and `SYNC-PACKET.md`/`.json` address
every artifact to the node with a URL and a digest — while the two lanes that would carry it *themselves* remain
**measured-blocked** (the Cloudflare lane: no credential; the mesh: the anti-bot write gate), and that is written down
rather than worked around.

**Closed 2026-09-25 — the master sync pipeline.** The delivery is no longer a set of commands a person has to
remember to run: **`src/relay.js`** (the relay, **`/relay`**) is one ordered chain — READ → CENSUS → DELIVER →
VERIFY → INDEX → ARCHIVE — and each stage refuses to run on a lie from the stage before it. It **re-hashes the whole
declared estate** (§4b's census, file by file, in the station's own browser) and rebuilds the register's tree digest
from the bytes; it **carries the four delivery documents to the host by digest**, so identical bytes are never
re-uploaded and any artifact whose bytes have moved is **re-carried**; it **tries the mesh write and the cloud** and
records each refusal **verbatim**; it **re-fetches and re-hashes every URL it has delivered and every URL the packet
hands the node**; and it seals the run under its own digest. It runs itself ~40 s after boot and every 30 minutes, and
it prints **REAL / HOLLOW / MISSING / BLOCKED** — **never COMPLETE with a shut door** ("a pipeline reporting COMPLETE
with a HOLLOW stage is a lie", REINCARNATION-CONTRACT §3). Its standing run: **HELD** — four stages REAL, DELIVER
BLOCKED on the two doors it names, VERIFY REAL over every URL in this packet.

**The estate's loops:** the CGN hub write (blocked, §8) · the master-link push (same blocker) · the Mailala deploy
(§9) · `mailala.com`'s DNS (dead, not ours) · the venue's own page defects (a rickroll video, a dead canonical,
unlinked socials, no street number) · the dormitory photographs the house has not supplied.

---

## 11 · ACCEPTANCE TESTS (with today's measured results)

| Test | Pass condition | Measured |
|---|---|---|
| every photograph decodes | 11/11, 0 broken | **PASS** 11/11, 0 broken |
| the ground is dark (this build) | body background < 20% luminance | **PASS** `rgb(14,17,15)` |
| text is legible | ink on ground ≥ 7:1 | **PASS** ≈ 15:1 |
| nothing is hidden by JS | 0 elements at opacity 0 | **PASS** 0 (was 51 — fixed) |
| structured data parses | `Hotel` JSON-LD parses | **PASS** `@type: Hotel` |
| the contact path is everywhere | ≥ 8 `wa.me` links | **PASS** 10 |
| the story is on the page | 8 beat cards present | **PASS** 8 |
| no horizontal overflow | `scrollWidth ≤ innerWidth` | **PASS** at 900 px (855 ≤ 870) |
| the file is deployable | one self-contained `.html` | **PASS** 49,943 chars, no local paths |
| nothing invented | every number in §2 has a source | **PASS** by construction |
| the delivery is re-measurable, not merely claimed | `/relay` reports REAL / HOLLOW / MISSING / BLOCKED, and COMPLETE only when every stage is REAL | **PASS** `HELD` — READ · CENSUS (244 files) · VERIFY · INDEX · ARCHIVE REAL; DELIVER BLOCKED with both refusals recorded verbatim |

---

## 12 · RISKS AND UNKNOWNS (what could embarrass us)

1. **`uploads.dev` could stop serving the nine photographs** — they are the page's only substance. Mitigation: the
   originals ship in `src/sites/mailala/material/`.
2. **The house's published prices and nights change** and the page will be stale. Mitigation: the page attributes
   them to the house and says so ("message us before you come").
3. **The "lively crowd" may exist in footage nobody has sampled.** It can be measured the same way and added —
   then it may be claimed.
4. **The anti-bot write block** may or may not lift on the saved page. Unproven; treated as blocked.
5. **The venue has never seen this page.** No page work has left this workspace for Mailala.
