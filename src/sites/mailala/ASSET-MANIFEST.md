# THE ASSET REGISTER — Mailala
**Every asset in the blueprint, located, labelled and SHA-256 hashed from its actual bytes.** 2026-09-24.

> **The chain of authority.** **Sov100** is the sovereign — the words that are canon — and **agent100** in the field.
> **The mastermind** is the architect, who bridges sovereign and station and answers for the work. **Obi** is this station.
> The labels are the mastermind's; the hashes are facts — computed from the bytes, never typed.

**How to use it.** `ASSET-MANIFEST.json` is the machine copy (this content plus every shipped `src/` file digest).
In the station: **`/assets`** prints the register · **`/assets verify`** re-hashes the assets in your browser and compares · **`/assets <word>`** filters.
In the blueprint the human index is §4b of `ARCHITECT-BLUEPRINT.md` (which points here).

## The method, so anyone can check it

Every digest is SHA-256 (WebCrypto) over the file's exact bytes, or over its exact text where the asset is in-document. Hosted assets were fetched and hashed separately from their local counterparts, then compared — so 'the hosted copy is the original' is a measurement here, not an assumption. Nothing is hand-typed: re-run the register pass (execute_js: hash the tree, then write this file) and it states the tree as it is.

## A · The nine venue photographs (the sovereign's own)

`material/` is the authority; the page loads the `user.uploads.dev` copy of the *same bytes*. **Both sides were hashed, all nine pair one-to-one, byte for byte:** the hosted copies *are* the shipped originals, and there is no tenth photograph.

| id | label | what the page does with it | `material/` file | hosted | bytes | SHA-256 |
|---|---|---|---|---|---|---|
| **M-01** | `rooftop-night` | the hero · og:image · preload · the rooftop panel (4 slots) | `6134195124376899530_121.jpg` | `1f050d9e3a2afcfd4adf67c7e348a224.jpg` | 209,857 | `d758a7945683b1a5098961bfe4cecd41144c251ed0793f6f1246268161e18f19` |
| **M-02** | `bar-interior` | the our-spirit panel | `6134195124376899528_121.jpg` | `7c599abd02e6fcf92fd706ee440b457d.jpg` | 197,069 | `65b0a5ff7e86bc81c3fe0a967f2e18795d20e7a1a9964e1c7c889621caf96700` |
| **M-03** | `menu-board` | the kitchen signature + the menu poster (2 slots) | `6150204477533786111_121.jpg` | `f10419589c8113b97d4a48ae263db72a.jpg` | 291,269 | `9599414bcd54ce88e1eefd70f2532e21bdc604b4bd58d7110ac5eff02e2f46e0` |
| **M-04** | `marley-wall` | the rooftop gallery | `6134195124376899531_121.jpg` | `2d4d72888f789429517f1679730cc067.jpg` | 165,773 | `dc3ba6f6c5579426b76f4ecaf6fbe71cb0593be378bfb262377a737adc315ba2` |
| **M-05** | `band-mural` | the rooftop gallery | `6150204477533786119_121.jpg` | `e8e7af459b9bc160670d3e910bf5cf09.jpg` | 169,384 | `09cc37e48f356988b19933d2796d1176a115baf26e0dc0561697fbfdb3eb7259` |
| **M-06** | `catering-sign` | the rooftop gallery | `6150204477533786110_121.jpg` | `880d30dc3f5d42f4587ded1c3541dad4.jpg` | 200,876 | `d7bba08a96783f873d9d7e1bd22658d431a1a0cb356f6ff39264ad2290928fe8` |
| **M-07** | `fan-guest` | the rooftop gallery | `6150204477533786109_121.jpg` | `39c59cf17556bee1ef3a6f06fc2fb7f2.jpg` | 238,395 | `5afd0acbc365ab3952cce06a80e3219a45df40b7e046e829488b6667b3662fc0` |
| **M-08** | `drug-sign-night` | the drug-free panel | `6150204477533786107_121.jpg` | `08714813e4b88da142cceb572954ec98.jpg` | 281,715 | `59ca5acb89ba37afe97b475070ea88bbf1a8f3c4033e9ef22d5c66cfac21f8f4` |
| **M-09** | `drug-poster` | the drug-free panel | `6150204477533786120_121.jpg` | `19b9e769e4df8687d1a1107f48ed7665.jpg` | 168,770 | `196a2307b747fcb2e33f4ab8137578001bcc8a347b4791c16f68c36ae6000366` |

The alt text for each — written from the photograph itself, never invented (SOUL §4):

- **M-01** — The rooftop at Mailala at night — fairy lights above the counter, potted plants along the bar
- **M-02** — Inside the bar at Mailala at night — fairy lights strung above the counter and a mural on the wall
- **M-03** — The Mailala menu board, hand-painted: a palm-tree mascot in sunglasses, a plate of jerk chicken with rice and peas and plantains, and the house's own line — Good Vibes. Big Flavors. Full Belly. Till Late!
- **M-04** — Guests at a table beneath the wall painting of Bob Marley & The Wailers, lit by the room's coloured lights
- **M-05** — The hand-painted picture of a band playing — pianist, bassist and drummer — on the yellow wall at Mailala
- **M-06** — The Jamaican Catering sign on the yellow wall — a green pot, a red hand and a palm tree
- **M-07** — A guest in the bar holding a folding fan, in front of the hand-painted reggae mural with fairy lights above
- **M-08** — The glowing wall sign at night reading Drug Use Is Strictly Prohibited In The Restroom, with Roots Rock Reggae Bar Saigon along the bottom
- **M-09** — The Say No To Drugs poster in green, yellow and red — a skull and crossbones, Your Future is Bright, Keep it Right

## B · The video evidence (nothing plays on the page)

| id | label | local source | hosted | bytes | SHA-256 | state |
|---|---|---|---|---|---|---|
| **V-01** | the 60 s walkthrough (the story's source) | `scratch/message-attachments/6170059324904186583.mp4` | `587c56d82502e9beeb4e49a38d84e22e.mp4` | 5,488,923 | `ab6ac28d324ec963cc3ec2c987788af088cab63b83b6781c7e8aad4045962a43` | hosted copy byte-identical to the local source (verified 2026-09-25) |
| **V-02** | the reel (29.9 s, 720p) | `scratch/mailala-reel-720.mp4` | `f4edc203f3be250775b1c5100f431533.mp4` | 14,078,315 | `9b020e9297dbb7871a5620c0d7761f9153ab76368f7c6dd454efdda963c8bb88` | hosted copy byte-identical to the local source (verified 2026-09-25) |
| **V-03** | the correspondence recording (the sovereign's own words) | `scratch/message-attachments/6170059324904186580.mp4` | — never uploaded | 2,879,033 | `aeff9f17c254267024845c70ef83b6e3360ed499f14263968b22b12d21c91d79` | no hosted copy exists |
| **V-04** | the third recording — NOT Mailala material | `scratch/message-attachments/6167854056766185808.mp4` | — never uploaded | 5,274,590 | `b4dc29b5b04873fe5031fe6fb348ea0e87c6decd3a073f61d628da86e4fb6da3` | no hosted copy exists |

**V-01 and V-02 are the two the story was measured from; V-03 is where the sovereign's own offer-funnel words live; V-04 is not Mailala material at all** — recorded only so nobody mistakes it for evidence later.
The local copies live in `scratch/` (**ephemeral by nature**) and the hosted copies were uploaded with a short retention flag. To make them durable: re-upload, or move them into `src/`. Nothing on the page needs them.

## C · Fonts and the map

The page ships **no font bytes** — it links Google Fonts — and the CSS it receives is user-agent-dependent, so those digests pin **one fetched snapshot** (this browser, today) and are **not a contract**: drift here is not a defect.

| id | asset | bytes | SHA-256 |
|---|---|---|---|
| F-01 | the font CSS (DM Serif Display + Inter) | 10,778 | `082e035b5456c1a5bcfbe78dbf3a7b5e9725104f6623fc3cd0bf3e6e73eeaa87` |
| F-02 | WOFF2 face 1 of 9 | 10,804 | `3af47815d6183efcee27a5717970acfe31153365e9b842e62d30c04e86c0613a` |
| F-03 | WOFF2 face 2 of 9 | 24,744 | `fdf61e20fd2c0108e0ea28da4daca0035205b4b7fc031a3974b865b704de160a` |
| F-04 | WOFF2 face 3 of 9 | 25,960 | `ca157063339ac4ad418f214f3abfed119b0798ab4d377386ce5c9e5a7a435ebd` |
| F-05 | WOFF2 face 4 of 9 | 18,748 | `71d5ee93cc1e9f1d520a3a8b66456de18c7879d8df09d57fcd2eaff75fef0075` |
| F-06 | WOFF2 face 5 of 9 | 11,232 | `6e9e020a25f9b56d418f2c085b1d3c09725a4da23fe693a5b463064606732190` |
| F-07 | WOFF2 face 6 of 9 | 18,996 | `1be3448e292fbf05ffe176fe1e43f135013d50b1e7d324ad1a558f623d3bb6f6` |
| F-08 | WOFF2 face 7 of 9 | 10,252 | `5c66f9e07e90c6d4ac4922cc68d60de26c17b1858e677fb5e603fce3952b3ff2` |
| F-09 | WOFF2 face 8 of 9 | 85,068 | `34b9c504cab7a73e37b746343a449132e56cf7b5481af2cb81dc74dcff25c956` |
| F-10 | WOFF2 face 9 of 9 | 48,256 | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |

**The map** — `https://maps.google.com/maps?q=175%2F16%20Pham%20Ngu%20Lao%2C%20District%201%2C%20Ho%20Chi%20Minh%20City&z=16&output=embed` · 4,269 B · `999d872bf3dcba2680ccb1c415e00dec1cd4f3b46193fb9b2260eb08ee6355d6`. a live remote document: the digest pins the snapshot we fetched, not a promise about Google. Fallback if it blocks: the address text and the Directions button still work.

## D · In-document assets (there is no external file to fetch)

- **MK-01** — the mark / favicon (inline SVG data-URL) · 236 B · `394148528c5f380eedb2b590300cb43fe41383f07cb59f07414a24dc2028b681`. in-document: the digest is of the 236 B of SVG itself; the full data-URL text hashes to c433a8d7254b (281 B). Not fetchable as a payload, so /assets verify skips it with that reason.
- **SD-01** — the Hotel JSON-LD block · 1229 B · `658c7e1889d381be71c9b59efc7c9bf3eb5ad842ccf126433b3f96bf7de2ecea`. in-document: the digest is of the 1,227-char JSON-LD block, not of the whole page.

## E · The authority documents, hashed so a later session can prove nothing moved under it

| id | document | what it is | bytes | SHA-256 |
|---|---|---|---|---|
| DOC-01 | `src/sites/mailala/index.html` |  | 50,132 | `d7ff3493ce8855ced654d0ef02a46b8003098454d8d96251e4b7c99a32514474` |
| DOC-02 | `src/sites/mailala/SOUL.md` | the sovereign's words, verbatim | 13,283 | `6809a89cab8217104703bac29c0e16cb2bea91d1245192c0d74d35f13beec617` |
| DOC-03 | `src/sites/mailala/STORY.md` | the story told from the footage | 6,339 | `244a51b25e157691a1643d2e61c29a5cfd22772addffd4fb1a7a270462947411` |
| DOC-04 | `src/sites/mailala/BLUEPRINT.md` | the copy and running order | 11,764 | `95a880dc5d0e41e5ab4c2b419e6cf2a995411874150bc621780c8ebe2b5a37cf` |
| DOC-05 | `src/sites/mailala/ARCHITECT-BLUEPRINT.md` | the architecture | 24,659 | `251ca1e861ea7f0dcd736d5c33f269801cacc9a19c2af9944f3cbae6ebeec1a5` |
| DOC-06 | `src/sites/mailala/HANDOFF.md` | the wing's handover | 7,807 | `c119e68017ae0b2ee3afc3f6764dfba27492a8ff0255ea68f7171ed1c2476e4b` |
| DOC-07 | `src/sites/README.md` | the sites shelf | 6,963 | `6d01cc9f4b53bece8dcac9c49bf15bdd010edd69e75361c7ef12c747e152421a` |
| PH-01 | `main.pjs` | main.pjs | 1,855 | `85c65cd45ef11354dbf377aae8ddb548e98e2c9933de467dea76397068ade0aa` |
| PH-02 | `index.html` | index.html | 43,171 | `af7071eaaf3f7457d3d46372dad089abba4e675b86e6a2e2d605702c8025e810` |
| EV-01 | `scratch/mailala-live.html` |  | 70,835 | `13360cf9a83cd9b192f37163f9ab86aff87941efe9f9e6c2d028867df8d1e8c5` |

## F · Ephemeral working assets (`scratch/` — hashed, not shipped, not free of the session)

| id | file | what it was for | bytes | SHA-256 |
|---|---|---|---|---|
| W-01 | `scratch/mailala-story/walkthrough-sheet.jpg` | the 12-tile contact sheet the story was measured from | 81,893 | `ded4caa4aa8fa2827b1dc29189a519ad1a299493b188a6bb39fcce2b0e3f4fab` |
| W-02 | `scratch/mailala-story/reel-sheet.jpg` | the 16-tile reel contact sheet | 265,859 | `378034c6584b9c4794fe864f67cf961f6ca437f718bfd948da36aaf94ad8851c` |
| W-03 | `scratch/mailala-assets/hero-composite.jpg` | an earlier composite, not in the final build | 438,198 | `be0a7b5ffbd9b2992116463df24eaa0fa773e47fd9dfc822e46344659569b2a4` |
| W-04 | `scratch/mailala-assets/rooftop-collage.jpg` | an earlier collage, not in the final build | 125,373 | `a58fe086ea9cc9dd9910c651dc06cb22e53b44ba13e95ffa0a23d8135cdd74ec` |
| W-05 | `scratch/mailala-assets/room-female-6.jpg` | a room composite, not in the final build | 229,066 | `cc4c215d33911ac74e9f887404ddf05d93de90c36055cc4952e95c33c79aa53b` |
| W-06 | `scratch/mailala-assets/room-mixed-4.jpg` | a room composite, not in the final build | 281,835 | `277fc7d80913e35a6b3685ff577ef361b717cc3888626346a82cf06112ea5d3a` |
| W-07 | `scratch/mailala-assets/room-private.jpg` | a room composite, not in the final build | 191,033 | `a7a929ade2cf84db79056f078f1deaf68bce4b7b8a608e5cd1d96269f515de4e` |
| W-08 | `scratch/mailala-assets/vibe-grid.jpg` | an earlier grid, not in the final build | 137,451 | `29b38587f4777bb87f36f830a8e1d92a32ba71aad0ccb23627731241c419d367` |
| W-09 | `scratch/mailala-story/dark-hero.jpg` | a dark-mode render checked during the build | 111,419 | `491cf2431d022ee15143524d24cf1c45f3fd4d3e3890068914301f0eae9b54bc` |

**These are the one group that cannot be re-hashed in the page:** `scratch/` is the session's own space and is not served on the generator's origin. The register hashes them from the workspace bytes, and `/assets verify` names that reason out loud instead of failing silently.

## G · The estate — every shipped file under `src/`

**343 files · 20,579,828 B (20,097 KB) · tree digest `9acbc758fbe4666419580d69ead5e7b90ea59859e2d3c2b0eaa150525c35bcdd`**

The tree digest is SHA-256 over the sorted `<path> <sha256>` lines of every file listed in the machine copy — **the census leaves out the four delivery documents** (the register pair and the sync packet), because a self-describing document cannot be enumerated inside itself.

| area | files | bytes |
|---|---|---|
| `src/AGENT99-OS.md` | 1 | 18,664 |
| `src/COSTS.md` | 1 | 8,810 |
| `src/HANDOFF.md` | 1 | 155,356 |
| `src/LESSON-STANDARD.md` | 1 | 45,485 |
| `src/MASTERMIND-SYNC-2026-09-23.md` | 1 | 19,249 |
| `src/PHOENIXCOMMAND-BLUEPRINT.md` | 1 | 23,364 |
| `src/PROPOSED-CANON.md` | 1 | 8,795 |
| `src/ProposedG999.md` | 1 | 49,764 |
| `src/README.md` | 1 | 188,477 |
| `src/REPO.md` | 1 | 9,153 |
| `src/SESSIONS/**` | 1 | 33,196 |
| `src/SOUL-VERBATIM-PORTALS-MAGIC-CHAT.md` | 1 | 13,943 |
| `src/SPEC.md` | 1 | 20,421 |
| `src/STUDENT-EVALUATOR-ECOSYSTEM.md` | 1 | 28,561 |
| `src/STUDENT-PORTAL-PIPELINE.md` | 1 | 14,614 |
| `src/VAULT-RECOVERY.md` | 1 | 4,467 |
| `src/app.js` | 1 | 623,985 |
| `src/audio-split.js` | 1 | 25,255 |
| `src/background.js` | 1 | 17,118 |
| `src/brain.js` | 1 | 27,091 |
| `src/brand.js` | 1 | 292,098 |
| `src/brand/**` | 103 | 11,210,129 |
| `src/canon/**` | 4 | 188,134 |
| `src/cgn-node.js` | 1 | 7,115 |
| `src/cgn.js` | 1 | 14,879 |
| `src/clients.js` | 1 | 15,979 |
| `src/cloudflare/**` | 10 | 73,047 |
| `src/constellation.js` | 1 | 33,257 |
| `src/curriculum.js` | 1 | 77,098 |
| `src/curriculum/**` | 12 | 1,515,989 |
| `src/divisions.js` | 1 | 49,517 |
| `src/ecosystem.js` | 1 | 22,898 |
| `src/family.js` | 1 | 12,294 |
| `src/forge.js` | 1 | 55,316 |
| `src/freephoenix.js` | 1 | 50,928 |
| `src/freewire.js` | 1 | 31,205 |
| `src/generators/**` | 88 | 1,650,012 |
| `src/gitcanon.js` | 1 | 33,223 |
| `src/ilog.js` | 1 | 50,748 |
| `src/image-node/**` | 6 | 24,792 |
| `src/intake.js` | 1 | 88,869 |
| `src/lesson-forge.js` | 1 | 26,686 |
| `src/lessons.js` | 1 | 114,314 |
| `src/lessons/**` | 9 | 220,678 |
| `src/market.js` | 1 | 27,493 |
| `src/marketing/**` | 5 | 100,368 |
| `src/master-link.json` | 1 | 3,323 |
| `src/masterlink.js` | 1 | 27,460 |
| `src/offer-desk/**` | 8 | 203,253 |
| `src/offers.js` | 1 | 40,934 |
| `src/pheromone.js` | 1 | 12,000 |
| `src/playbooks.js` | 1 | 18,647 |
| `src/relay.js` | 1 | 40,340 |
| `src/review.js` | 1 | 40,678 |
| `src/rubric.js` | 1 | 70,546 |
| `src/savewatch.js` | 1 | 14,535 |
| `src/scout.js` | 1 | 42,021 |
| `src/scs.js` | 1 | 83,231 |
| `src/secretsauce.js` | 1 | 24,556 |
| `src/sites/**` | 43 | 2,369,440 |
| `src/styles.css` | 1 | 49,435 |
| `src/summary.js` | 1 | 18,415 |
| `src/tools/**` | 1 | 29,582 |
| `src/transcribe.js` | 1 | 84,421 |
| `src/vault.js` | 1 | 84,177 |

## H · NOT hashed, and exactly why (nothing is left silently missing)

- **wa.me/84768701106, instagram.com/reggae_bar_saigon, facebook.com/…/61580002783059, hostelworld.com/hostels/p/324399** — live, login-walled pages that render on the client — referenced links, not payloads of ours; there is nothing of ours to pin.
- **mailala.com** — does not resolve at all (SERVFAIL, no A record, measured twice) — there are no bytes to hash.
- **mailala.mrmichaelhobbs123.workers.dev** — the deploy target does not exist yet — no Cloudflare credential in this browser, so nothing has been published and nothing is hashed as if it were.
- **the map's tiles and the font bytes as the browser receives them** — user-agent-dependent/live — the register pins the snapshots it fetched and says so, rather than pretending they are stable.
- **The four delivery documents are excluded from the estate census** — `ASSET-MANIFEST.md`, `ASSET-MANIFEST.json`, `SYNC-PACKET.md`, `SYNC-PACKET.json`. `ASSET-MANIFEST.json` and `SYNC-PACKET.json` cannot contain their own digests, and a document that enumerated itself would be stale the moment it was written. `ASSET-MANIFEST.md` *is* hashed, in the machine copy, so the pair stays checkable. This is the whole of the gap, declared rather than left to be discovered.

## I · How this file is regenerated (the recipe, so it is not a password)

The register is a *measurement*, not prose. `src/sites/mailala/ASSET-MANIFEST.json` is rebuilt from the bytes by
one pass, run in the station's own browser (a Worker with the workspace mounted: `readFile` + WebCrypto). The
recipe, in order:

1. **The declared tree.** Read `SRC_SNAPSHOT` out of `src/app.js` (the array literal) and drop the six paths the
   census leaves out: `main.pjs`, `index.html`, and the four delivery documents (this pair and `SYNC-PACKET.*`).
   `src/relay.js` applies the identical rule in `declaredTree()`, which is why the two can be compared at all.
2. **Hash every declared file.** `readFile` → SHA-256 over the exact bytes. Sort by path, so the digest can never
   depend on the order the reads happened to finish in, and sum the bytes.
3. **The tree digest.** SHA-256 over the sorted `<path> <sha256>` lines joined by `\n`. That is the register's own
   recorded recipe, recovered from this file and reproducible byte-for-byte; the relay's CENSUS stage rebuilds it
   from the served bytes and compares — which is exactly what `CENSUS=REAL` means.
4. **`byTopLevel`.** A file directly under `src/` is its own row; anything deeper is aggregated as `src/<dir>/**`.
5. **The assets.** Every asset row with a `local` path is re-hashed and its `bytes` / `sha256` / `rehashed` updated.
   Rows flagged `inDocument` (MK-01, SD-01) are SKIPPED by rule — their digest is over a block inside a page, not
   over the page file. Rows with no `local` (the fonts, the map) pin a fetched snapshot and say so in their own
   `note`; they are not re-fetched by this pass.
6. **The date.** The LOCAL date of the machine that ran the pass (Asia/Bangkok). One rule, stated here because two
   passes disagreed once — the difference is recorded in `revision.why`, not smoothed over.
7. **This markdown.** Section G is regenerated from `byTopLevel`; sections E and F have their `bytes` / `SHA-256`
   columns rewritten in place; then `self.md` in the JSON is updated with this file's own digest and length. The
   JSON cannot carry its own digest — that is the one declared gap, in `excluded`.
8. **Deliver.** `/relay` carries the four documents out by digest, uploading only the ones whose bytes changed, and
   its VERIFY stage re-fetches and re-hashes every URL it delivered. A register that has moved and not been
   delivered is reported as `CENSUS=HOLLOW` — never as complete.

**The pass ships.** This recipe used to be prose only: the pass that produced the register lived in a session's
scratch space, so a session that came later could read every rule above and still not run it. It is code now —
**`src/tools/register-pass.mjs`** — kept in the estate, run by a Worker with the workspace mounted, and it returns
the two file texts plus a row-for-row account of what it changed rather than writing anything itself. Its first
run destroyed 38 lines of this file: section G's block was bounded by the next `---` instead of the next `## `
heading and it swallowed section H and this recipe. That is why the pass now finds its boundaries by heading and
table header, throws rather than guessing, and rewrites asset rows by VALUE (the cell that holds the old digest)
instead of by position — the register's tables are not shaped alike, and section B ends in `state`, not `SHA-256`.

**A file that is not in `SRC_SNAPSHOT` is not in the census, the backup, or the delivery.** So a new file is listed
there in the same edit that writes it. That rule has bitten this estate four times; the `AUDIT` comments beside each
block in `src/app.js` are the record of each bite.

---

_Generated, not written. Every count, label and digest above came out of one pass over the actual bytes._
