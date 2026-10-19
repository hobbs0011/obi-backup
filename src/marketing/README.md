# THE MARKETING INGEST — how a batch becomes canon

This folder is the **provenance of the picture library**. The pictures themselves live in
`src/brand/assets/` and are catalogued in `src/brand.js` (`ASSETS`); the words live in the
marketing register (`MARKET`, `CODEX`) and the copy archive. This folder holds the one thing
neither of those can: **the record of what was sent, what was kept, what was thrown away and
why.**

The station's job is to push content out — websites, marketing material, social posts — so a
clear rule for what is *in* the library matters more than another ten files in it.

| file | what it is |
|---|---|
| `README.md` | this file — the pipeline, the rules, how to run the next batch |
| `INGEST-LOG.md` | the audit: every file of batch 001, with its verdict and the reason |
| `MANIFEST.json` | the same audit, machine-readable (sha-256, dimensions, classification, verdict, asset id) |
| `OPEN-SOURCE-PLAY.md` | **the market play** — the measured recon of the open-source field, the three empty seats, the channels and the sequence. Engine: `src/market.js` (`/market`); the method behind it: `src/canon/SECRET-SAUCE.md` (`/SecretSauce`). |
| `awesome-perchance.md` | **the index nobody built** — the canonical list of the Perchance open-source market, populated with real repositories and real star counts from the live scan. Ready to publish. |

---

## The rule

**A file ships only if it is finished, legible at the size it will be used, free of someone
else's tooling in the frame, and not a duplicate of something already kept.**

Everything else is rejected — but rejected *on the record*, in `INGEST-LOG.md`, with the reason.
Nothing is silently dropped. A future session, or the sovereign, can reverse any call in that
file without re-sending a single image.

The standing law this pipeline enforces:

- **BRAND.005** — the mark is shipped, not hotlinked. Every kept file is a real file in
  `src/brand/assets/`, alpha WebP, never a URL pointing at someone else's server.
- **BRAND.020** — the hand-picked set is source, not decoration. A still is shipped **whole**,
  never restyled, re-cropped, re-coloured or "improved". Watermarks left by the tool that made
  it are part of the source and are *not* removed.
- **BRAND.028** — no client or student data in public source. A client audit or a screenshot
  with a live login in it does not enter `src/` at all, however good it looks.
- **BRAND.014 / BRAND.029** — nothing is redrawn. The one exception the law allows is the
  logotype, which may be **keyed** to transparency and **re-coloured** to the two frozen
  tokens, because the specification names those tokens itself.

---

## The pipeline

Run in order. Each stage is cheap and each one is allowed to reject files, so the expensive
stage (looking at every image) only ever sees candidates.

**1 · Inventory.** List the batch, hash every file (sha-256), read its true dimensions.
Byte-identical files are settled here, before anything is looked at.

**2 · Perceptual dedupe.** A 64-bit perceptual hash (16×16 greyscale, adjacent-pixel
comparison) for every image; anything within 8 bits of anything else is a *candidate*
duplicate. This catches the re-crops and the re-exports that sha-256 cannot see.

**3 · Classify (the expensive stage).** Every surviving image is shown to a vision model with
a fixed questionnaire — kind, subject, headline text, palette, style, best use, quality 1–10,
defects. The answers are the raw material of every judgement below. Wide or tall images are
contact-sheeted into labelled tiles when two of them need comparing side by side; a contact
sheet of six tiles is cheaper and more reliable than six separate looks when the question is
"are these the same?"

**4 · Adjudicate.** For each image: SHIP, REJECT or DO-NOT-SHIP, with a written reason.
The tie-breaks, in order:

1. **Do not ship** wins outright — credentials, client or student data, anything that reads as
   a privacy or security defect. No quality level redeems it.
2. **Duplicate** loses. Byte-identical, or the same graphic at a different crop: the better
   crop is kept.
3. **Superseded** loses. Two files with the *same headline*, the *same format* and the *same
   language* are one asset; the more polished cut is kept, the other is recorded.
4. **Broken or garbled** loses. Garbled interface text, misspellings, a device status bar in
   frame, a phone screenshot with the edge cut off, a photograph of a book page taken at an
   angle with a hand in it.
5. **Off-topic** loses. An invoice is not brand art. An internal spreadsheet is not a
   marketing asset.
6. Everything left ships, and is ordered so the strongest of each group comes first.

**5 · Ship.** The keepers are converted to alpha WebP (long edge capped at 1600 px, quality
0.86 — a social post or a deck page never needs more), written into `src/brand/assets/`, and
registered in `src/brand.js` `ASSETS` with a stable `id`, a `name`, a `use` (where it may be
worn) and a `note` (what it actually shows). Provenance is a `src:` label, and `srcLabel()`
turns that label into words on the vault page.

**6 · Register and index.** `ASSET_V` is bumped — assets are content-addressed by hand, so a
changed file with an unchanged URL will not reach a browser that has already cached it. The
new paths are added to `SRC_SNAPSHOT` in `src/app.js` so a backup carries them.

**7 · Audit.** Re-read the shipped files from the live page (`fetch()` every new URL, expect
200), render the vault, and look at the rendered result. A file that 404s, or a cell that
overflows, is a defect and gets fixed before the batch is called done. The audit is written
into `INGEST-LOG.md`.

---

## The quality bar, in practice

- **1600 px long edge** for a deck page, 1536 for a social infographic, native for a 1080-wide
  post. Anything bigger is bytes nobody sees.
- **Alpha, not a white box.** A still keeps its own background (it is a composition); a *mark*
  is keyed to transparency, because it has to sit on the void.
- **One texture per claim.** The library is not a museum: if two files argue the same point in
  the same format, one of them is the asset and the other is a line in the log.
- **A tool watermark is recorded, never painted over.** The sovereign's own generator stamps a
  small mark in the corner of the social set. That is the source. Removing it would be editing
  someone else's artwork; it is named in the log instead, so the call can be made knowingly.

---

## Running the next batch

```
1.  Put the files in one folder. Hash them and read their dimensions.
2.  Perceptual-hash them and list the pairs within 8 bits.
3.  Classify every survivor with the fixed questionnaire (the raw JSON of batch 001 is a
    good template: file, kind, subject, headline, palette, style, use, quality, defects).
4.  Adjudicate against the rules above — and against the log, because a file sent twice is
    a duplicate, whatever its hash says.
5.  Convert the keepers, register them in `src/brand.js` ASSETS, bump `ASSET_V`, add the
    paths to `SRC_SNAPSHOT`.
6.  Append the batch to `INGEST-LOG.md` and to `MANIFEST.json`. Do not rewrite batch 001:
    the log is append-only, like everything else in this station.
7.  Re-read every new URL from the live page and render the vault. If it 404s or overflows,
    it is not done.
```

Two traps, both measured rather than guessed:

- **A phone screenshot is not an asset.** The device's status bar and navigation icons in
  frame are enough to reject one, and the right edge is usually cropped as well.
- **A dark-on-light deck cannot be keyed into a mark.** Its line art becomes black on
  transparency — invisible on the plum ground. It gets a still and no mark, and that is a
  limit of the source, not a failure of the key.

---

## Where the words go

The pictures are half the archive. The other half is the **copy** — the marketing and
copywriting conversations, the NotebookLM vault dumps, and the case studies. The distillery is
`src/copy.js`; its extraction rules, its sources and its standing debts are recorded in
`COPY-ARCHIVE.md` in this folder. `MANIFEST.json` records the documents of batch 001 under
`documents`.
