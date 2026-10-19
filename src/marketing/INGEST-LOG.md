# THE INGEST LOG — batch 001

**Batch:** 2026-09-21/22 — the banners, the art and the logotype  
**Pipeline:** the procedure is in `src/marketing/README.md`; the machine-readable record is `src/marketing/MANIFEST.json`.  
**Counts:** 59 images — **37 shipped**, 22 rejected; 25 documents.

This file is the AUDIT. Every file the sovereign sent is in it, with what it is and what
was decided about it. Nothing is silently dropped: a file that is not in `src/brand/assets/`
is either here with a REJECT and a reason, or it was a document.

The rule applied, in one line: **a file ships only if it is finished, legible at the size it
will be used, free of someone else's tooling in the frame, and not a duplicate of something
already kept.** Where two files made the same claim, the more polished was kept and the other
is named in the row below — so the decision can be reversed without re-sending anything.

---

## THE IMAGES

| file | size | kind | what it is | verdict | why |
|---|---|---|---|---|---|
| `1790046618572_512932926050735706_512932926050735706_b45a5eb24016e7be372c0167180042b9.jpg` | 1361x374 | other | Weekly lesson plan grid for English language teaching | **REJECT** | REJECT — the same lesson-plan spreadsheet, second crop |
| `1790046721683_512932926050735706_512932926050735706_99b9020875dade703f07ad7b4219e915-2.jpg` | 1038x520 |  |  | **REJECT** | DUPLICATE — the grade-6 curriculum table, third crop |
| `1790046721683_512932926050735706_512932926050735706_99b9020875dade703f07ad7b4219e915.jpg` | 1038x520 | other | Grade 6 English curriculum weekly lesson plan schedule table | **REJECT** | DUPLICATE — the same grade-6 curriculum table as pasted-image-20260922045952, second crop |
| `Gemini_Generated_Image_c64ig2c64ig2c64i.png` | 2608x1600 | social-post | Confidence vs grammar mindset comparison with mouse and tiger | **REJECT** | REJECT — carries a Chinese caption artifact and a tool watermark; wrong language for this market |
| `Gemini_Generated_Image_p6pgiwp6pgiwp6pg-2.png` | 2754x1536 |  |  | **REJECT** | DUPLICATE — byte-identical to the logotype plate p6pgiwp6pgiwp6pg, which is this batch's source for THE PRAIS APEX |
| `Gemini_Generated_Image_sdc66vsdc66vsdc6.png` | 2400x1790 | illustration | Corporate professionals in futuristic AI data command center | **REJECT** | REJECT — the weakest of the four command-centre tiles: garbled interface text and misspellings |
| `Gemini_Generated_Image_xq69apxq69apxq69.png` | 2048x2048 | illustration | Two business professionals in futuristic AI data center | **REJECT** | REJECT — the worst of the four as a hero: square, heavily framed, a 'Career Age' overlay baked into the composition |
| `NET-BLUET-INVOICE-MAY18-25.png` | 2752x1536 |  |  | **REJECT** | REJECT — a supplier invoice. A financial record, not brand art |
| `NET-Invoice-Bluetech-May10-May17.png` | 2752x1536 |  |  | **REJECT** | REJECT — a supplier invoice. A financial record, not brand art |
| `NET-INVOICE-BLUETECH-MAY3-10th.png` | 2754x1536 |  |  | **REJECT** | REJECT — a supplier invoice. A financial record, not brand art |
| `pasted-image-20260921213937.png` | 1027x92 | other | Account credentials for National Geographic Learning platform access | **REJECT** | DO NOT SHIP — it contains LIVE LOGIN CREDENTIALS (a school platform account and its password). Kept out of src/ entirely |
| `pasted-image-20260922023456.png` | 960x1280 | photo | English vocabulary workbook page about kitchen items | **REJECT** | REJECT — a photograph of a textbook page, shot at an angle, blurred, finger in frame. Not marketing art |
| `pasted-image-20260922023508.png` | 960x1280 | other | English language learning textbook page about cultural identity | **REJECT** | REJECT — a photograph of a textbook page (curved, shadowed, handwriting in the margin) |
| `pasted-image-20260922045902.png` | 1361x374 | other | Lesson plan table for Unit 2 Move to the Music | **REJECT** | REJECT — a screenshot of an internal lesson-plan spreadsheet. Operations, not marketing |
| `pasted-image-20260922045952.png` | 1038x520 | other | Grade 6 English curriculum planning table for teachers | **REJECT** | REJECT — a screenshot of the grade-6 curriculum table. Operations, not marketing |
| `pasted-image-20260922113712.png` | 1280x591 | slide | Language learning methodology diagram with gears and DNA | **REJECT** | DUPLICATE — the same graphic as pasted-image-20260922114930, without its header; the headed version was kept |
| `pasted-image-20260922113722.png` | 1280x591 | slide | 1 Hour Architecture language training system visual slide | **REJECT** | REJECT — a blurry duplicate of the 1-hour architecture; the register already carries the clean slide as `mkt-hour` |
| `pasted-image-20260922113847.png` | 1080x587 | slide | English learning method infographic with mouse and tiger | **REJECT** | SUPERSEDED — same headline and subtitle as pasted-image-20260922114623 (the same guide cover); the more polished cut was kept as `soc-fluency` |
| `pasted-image-20260922115025.png` | 1080x616 | slide | Fluency program methodology contrasting mouse and tiger learning archetypes | **REJECT** | DUPLICATE — byte-identical to pasted-image-20260922114623 (same artwork, different crop); the wider crop was kept |
| `pasted-image-20260922115055.png` | 591x1280 | slide | English mastery program comparison from mouse to tiger identity | **REJECT** | REJECT — a phone screenshot: the device status bar and navigation icons are in frame and the right edge is cropped |
| `unnamed_12_.png` | 2752x1536 | slide | Bluetech training session audit and investment summary | **REJECT** | DUPLICATE — byte-identical to the BLUETECH supplier invoice |
| `unnamed_9_.png` | 2752x1536 | slide | BlueTech session audit and performance summary | **REJECT** | DO NOT SHIP — a client session audit (period, dates, per-session detail). Internal, and BRAND.028 keeps client and student data out of public source |
| `Gemini_Generated_Image_brfdfebrfdfebrfd.png` | 2754x1536 | logo | Stylized phoenix with geometric hexagon core and NET text | **SHIP** → `apex-net` | shipped as brand asset `apex-net` |
| `Gemini_Generated_Image_dq691mdq691mdq69.png` | 2048x2048 |  |  | **SHIP** → `art-university` | shipped as brand asset `art-university` |
| `Gemini_Generated_Image_ikpus7ikpus7ikpu.png` | 2400x1792 | illustration | Business professionals in futuristic AI data command center | **SHIP** → `art-command` | shipped as brand asset `art-command` |
| `Gemini_Generated_Image_p6pgiwp6pgiwp6pg.png` | 2754x1536 | logo | THE PRAIS APEX — cybernetic phoenix over a tesseract core, the station's logotype | **SHIP** → `apex` | KEYED into three shipped files — `apex` (gold), `apex-ink`, `apex-app` — and written into law as BRAND.029 |
| `Gemini_Generated_Image_qt81u5qt81u5qt81_1_.png` | 1792x2400 | logo | Neon purple tiger head with age range label | **SHIP** → `art-tigerkid` | shipped as brand asset `art-tigerkid` |
| `Gemini_Generated_Image_u1oa6cu1oa6cu1oa.png` | 2048x2092 | illustration | Abstract futuristic emblem with bird-like figure and arrows | **SHIP** → `art-emblem` | shipped as brand asset `art-emblem` |
| `Gemini_Generated_Image_v62wnuv62wnuv62w.png` | 2048x2048 | illustration | Two executives in a futuristic AI data command center | **SHIP** → `art-duo` | shipped as brand asset `art-duo` |
| `Gemini_Generated_Image_zhe7bazhe7bazhe7.png` | 2816x1536 | slide | Bilingual course selection for children and professionals | **SHIP** → `art-choose` | shipped as brand asset `art-choose` |
| `page-01.png` | 2867x1600 |  |  | **SHIP** → `cdx-ultimate` | shipped as brand asset `cdx-ultimate` |
| `page-02.png` | 2867x1600 | slide | The Diagnosis: The Grammar Prison - comparing traditional grammar fear to translation delays | **SHIP** → `cdx-diagnosis` | shipped as brand asset `cdx-diagnosis` |
| `page-03.png` | 2867x1600 | slide | Three-stage psychological progression model for English speaking confidence | **SHIP** → `cdx-shift` | shipped as brand asset `cdx-shift` |
| `page-04.png` | 2867x1600 | slide | English speaking confidence comparison between quiet mouse and loud tiger | **SHIP** → `cdx-immutable` | shipped as brand asset `cdx-immutable` |
| `page-05.png` | 2867x1600 | slide | English and AI integration business pitch slide | **SHIP** → `cdx-advantage` | shipped as brand asset `cdx-advantage` |
| `page-06.png` | 2867x1600 | slide | Language acquisition method infographic explaining input and output protocols | **SHIP** → `cdx-acquisition` | shipped as brand asset `cdx-acquisition` |
| `page-07.png` | 2867x1600 | slide | ESL lesson structure framework for vocabulary retention and gamification | **SHIP** → `cdx-retention` | shipped as brand asset `cdx-retention` |
| `page-08.png` | 2867x1600 | slide | AI-PET memory retention app feature explainer slide | **SHIP** → `cdx-aipet` | shipped as brand asset `cdx-aipet` |
| `page-09.png` | 2867x1600 | slide | Ecosystem support system for habit building and personal development | **SHIP** → `cdx-ecosystem` | shipped as brand asset `cdx-ecosystem` |
| `page-10.png` | 2867x1600 | slide | Comparative matrix for English learning system vs traditional methods | **SHIP** → `cdx-matrix` | shipped as brand asset `cdx-matrix` |
| `page-11.png` | 2867x1600 | slide | 100% confidence guarantee English speaking course promotion | **SHIP** → `cdx-guarantee` | shipped as brand asset `cdx-guarantee` |
| `page-12.png` | 2867x1600 | social-post | Futuristic cybernetic phoenix over glowing city skyline with motivational text | **SHIP** → `cdx-wake` | shipped as brand asset `cdx-wake` |
| `pasted-image-20260922113740.png` | 1080x573 | slide | Language learning comprehensible input rule infographic | **SHIP** → `soc-60input` | shipped as brand asset `soc-60input` |
| `pasted-image-20260922113758.png` | 1080x546 | social-post | Language learning method infographic about the 60% rule | **SHIP** → `soc-60delay` | shipped as brand asset `soc-60delay` |
| `pasted-image-20260922113810.png` | 1080x548 | slide | AI-PET app explanation of forgetting curve and spaced repetition features | **SHIP** → `soc-leaks` | shipped as brand asset `soc-leaks` |
| `pasted-image-20260922113827.png` | 1080x629 | slide | Personal development framework slide with mouse and tiger illustration | **SHIP** → `soc-permission` | shipped as brand asset `soc-permission` |
| `pasted-image-20260922114623.png` | 1080x616 |  |  | **SHIP** → `soc-fluency` | shipped as brand asset `soc-fluency` |
| `pasted-image-20260922114643.png` | 1080x571 | slide | English learning failure mechanisms in the brain for Vietnamese speakers | **SHIP** → `soc-failure` | shipped as brand asset `soc-failure` |
| `pasted-image-20260922114707.png` | 1080x582 | slide | AI learning retention graph and spaced repetition protocol | **SHIP** → `soc-biological` | shipped as brand asset `soc-biological` |
| `pasted-image-20260922114839.png` | 1080x622 | slide | Six-panel visual ad pipeline for bilingual marketing campaign | **SHIP** → `soc-adpipeline` | shipped as brand asset `soc-adpipeline` |
| `pasted-image-20260922114930.png` | 1080x595 | slide | Language learning differentiators diagram with gears and DNA | **SHIP** → `soc-differentiators` | shipped as brand asset `soc-differentiators` |
| `unnamed_1_.png` | 2752x1536 | infographic | The Phoenix Rising Protocol: Transmuting Mice into Tigers | **SHIP** → `soc-rising` | shipped as brand asset `soc-rising` |
| `unnamed_10_.png` | 2752x1536 | infographic | English learning method comparison with mouse to tiger metaphor | **SHIP** → `soc-chains` | shipped as brand asset `soc-chains` |
| `unnamed_2_.png` | 2752x1536 | slide | English speaking transformation program marketing infographic | **SHIP** → `soc-transform` | shipped as brand asset `soc-transform` |
| `unnamed_5_.png` | 2752x1536 | infographic | Bilingual English and AI learning methodology blueprint | **SHIP** → `soc-blueprint` | shipped as brand asset `soc-blueprint` |
| `unnamed_6_.png` | 2752x1536 | social-post | English training method comparison: traditional mouse vs NET tiger | **SHIP** → `soc-trap` | shipped as brand asset `soc-trap` |
| `unnamed_7_.png` | 2752x1536 | slide | Cybernetic phoenix logo brand identity breakdown | **SHIP** → `apex-anatomy` | shipped as brand asset `apex-anatomy` |
| `unnamed_8_.png` | 2752x1536 | illustration | Futuristic phoenix emblem with techno UI panels over neon city | **SHIP** → `soc-reality` | shipped as brand asset `soc-reality` |
| `unnamed.png` | 2752x1536 | social-post | Break the Chains: the summer transformation, mouse to tiger | **SHIP** → `soc-summer` | shipped as brand asset `soc-summer` — the cinematic cut; `soc-chains` is its bilingual infographic |

### Notes on the verdicts

- **DUPLICATE** was measured, not guessed: every file was hashed (sha-256) and given a
  64-bit perceptual hash. Four pairs are byte-identical and one pair differs by seven bits
  out of sixty-four.
- **SUPERSEDED** is the taste call, and it is the only place this pipeline overrules the
  sovereign: two files carrying the *same headline* in the *same format* and the *same
  language* are one asset. `pasted-image-20260922113712` and `pasted-image-20260922113847`
  are the two that lost that call.
- **DO NOT SHIP** is not a taste call. `pasted-image-20260921213937` is a screenshot of a
  **live login** (a school platform account and its password) — it is not in `src/`, not in
  the vault, and must not be sent to the station again. `unnamed_9_` is a client session
  audit, which BRAND.028 keeps out of public source.
- **Where the pictures came from.** The twelve `page-XX` files are the codex's own law
  slides as images, which is why they wear the codex's source label; the `unnamed_*` and
  `pasted-image-*` files are the social set; the `Gemini_Generated_*` files are the art set.
- **The mark.** `Gemini_Generated_Image_p6pgiwp6pgiwp6pg` is not a still — it is the
  **logotype**. It was keyed to transparency and shipped three ways (`apex`, `apex-ink`,
  `apex-app`), the anatomy page that came with it (`unnamed_7_`) was shipped as
  `apex-anatomy`, and the whole thing was written into law as **BRAND.029**.

---

## THE DOCUMENTS

| file | size | verdict | note |
|---|---|---|---|
| `BestDossierYet-05-11-2026.pdf` | 15780 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `GOSPEL_444_PROTOCOL-2.pdf` | 18066 KB | **DUPLICATE** | a byte-identical copy of the same deck |
| `GOSPEL_444_PROTOCOL.pdf` | 18066 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `GOSPEL_444_TIGER_MODE-2.pdf` | 4910 KB | **DUPLICATE** | a byte-identical copy of the same deck |
| `GOSPEL_444_TIGER_MODE.pdf` | 4910 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `MARKETING-VAULT-NOTEBOOKLM.md` | 32 KB | **INGESTED EARLIER** | the NotebookLM visual-art instruction set; its rules already ride in the register and the ads |
| `NET_Marketing___Copywrite_1.txt` | 165 KB | **ARCHIVE** | the marketing/copywriting conversations — the copy archive's raw material |
| `NET_Marketing___Copywrite_2.txt` | 1256 KB | **ARCHIVE** | the marketing/copywriting conversations — the copy archive's raw material |
| `NET_Marketing___Copywrite_3.txt` | 634 KB | **ARCHIVE** | the marketing/copywriting conversations — the copy archive's raw material |
| `NET_Marketing___Copywrite_4.txt` | 399 KB | **ARCHIVE** | the marketing/copywriting conversations — the copy archive's raw material |
| `NET-CLASSROOM-MANAGER.html` | 78 KB | **HELD** | a built HTML artifact sent with the batch — not read this pass, held for the next |
| `NET-Highschool-Careers.html` | 14 KB | **HELD** | a built HTML artifact sent with the batch — not read this pass, held for the next |
| `NET-Sarcasm-Academy.html` | 23 KB | **HELD** | a built HTML artifact sent with the batch — not read this pass, held for the next |
| `PHOENIX_RISING_CODEX.pdf` | 16407 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT2.md` | 9 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT3.md` | 10 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT4.md` | 20 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT5.md` | 21 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT6.md` | 10 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT7.md` | 12 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS.md` | 11 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `REINCARNATION_RUN_305.pdf` | 11545 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `Sovereign_Tiger_Protocol.pdf` | 17603 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `THE_TIGER_ENGINE.pdf` | 13669 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `Tiger_Engine_Protocol.pdf` | 18622 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |

---

## WHAT IS NOT HERE, AND WHY

- **The supplier invoices** (`NET-*-INVOICE-*.png`) — a financial record, not brand art.
- **The curriculum and lesson-plan screenshots** — operations. They live in the station's
  own curriculum files, not in the picture library.
- **The textbook photographs** — reference, at an angle, with a hand in frame.
- **The three built HTML artifacts** (`NET-Classroom-Manager`, `NET-Highschool-Careers`,
  `NET-Sarcasm-Academy`) — sent with the batch, not read this pass. Held for the next.
