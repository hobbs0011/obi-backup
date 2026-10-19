# Recovery — HQ v5 merge record (A56 phone bundle, 2026-10-19)

Source: `recovery-bundle_1_.json` attached from the Samsung A56 phone browser
(bundle from `phoenix-ai-solutions-edtech-mastermind`, built 2026-10-19T20:42Z).
Scrubbed at source: token values + account-IDs redacted, `obi_keys` absent.

## What the bundle holds (counts, not contents)
- HQ core = command-mastermind shelf: I-LOG 423, soul 37, SCS 3 (2 sealed), RRL 3, boardroom 8 sittings
- HQ v5 adds: anakin soul +6 → soul 43, RRL `obi_rrl_anakin_run1` (13 entries),
  gaming 13 mastermind snapshots, promotions brain index + masterlink config, webapp digest-only
- Class folders empty on BOTH sides: transcripts 0, summaries 0, students 0, classes 0
- HQ lineage: v1 (command) → v2 (+gaming) → v3 (+anakin) → v4 (+promotions) → v5 (+webapp)

## Phone-ready import file
`scratch/recovery-hq-pais-data-backup-HQ-merged-for-command.json` (671 KB, 18 keys,
kind `pais-data-backup`) — attached in chat for download. On the A56 phone browser:

1. Open THIS generator (`phoenix-ai-solutions-command-mastermind`) on the phone.
2. Settings → **Download backup** FIRST (keeps the phone's current chain safe).
3. Settings → **Import backup…** → pick the downloaded merged file.
4. Expect: `restored 18/18 keys` — soul 43, SCS 3 (2 sealed), RRL 4 runs, I-LOG 423.
5. Secrets never travel: retype tokens on the phone via `/keys` — rotation still outstanding (burned Oct 18).

## Warnings
- This station's importer is **file-wins per key**: the phone's local `obi_ilog` chain is
  REPLACED by the file's 423-chain. Step 2 (export first) is the safety net.
- Sealed SCS sessions are carried as-is; the file's sealed blocks stay sealed.
- kv class data: nothing to merge (empty both sides). kv caches (brain/market/relay snapshots)
  rebuild themselves; reference copy kept at `scratch/recovery-hq-kv-v5.json` (private, not shipped).
- Soul DNA (verbatim sovereign words) lives ONLY in the backup file + browser storage —
  never in `src/` (public). This folder keeps counts/roster only.

Full roster: see `PhoenixOmegaRecovery.md` in this folder.

## A56 repair record (2026-10-19, same day)
Importing localStorage alone FORKED the I-LOG: the kv `ilog` folder is
authoritative and the localStorage mirror is only its last-400 tail, so the
next append after a mirror-only restore continued the OLD kv cursor (423 →
12). Repaired by replaying the file's seqs 24..423 into kv through
`ObiILog.restore` (374 hash-verified; 26 direct-set — their content was
redacted by the Oct-18 bundle scrub of the burned tokens, links still verify;
seqs 1..23 survive as digest on the desktop only). kv now: seqs 24..424, all
links verify. Soul/SCS/RRL/boardroom are localStorage-only — unaffected.
Rule going forward: I-LOG restores always replay into kv, never just the
mirror. `/pull` (src/pushpull.js) enforces this.

## The ferry (no more files)
- `/push` — one tap: packs the shelf, uploads (48 h URL), prints the merge block.
- `/pull <push-url>` — collects with safe rules (soul unions, sealed stays
  sealed, I-LOG adopted only onto a fresh chain, else recorded).
- `push-shelf.js` (this folder) — drop-in push button for sibling stations:
  save as their `src/push-shelf.js`, add the script tag, save, reload.

## Code archives (2026-10-19, from the A56)
Three source-code zips, kept in scratch/message-attachments/PhoenixRecovery/
(phone holds the originals). CODE ONLY — no shelf/words in any of them:
- EDEN-all-generators-backup-2026-10-19.zip (84 files) — eden-command-station
  full station (63 files) + ear/practice/student-portal/watchtower/image-node/
  timmy-portal scaffolds, with BACKUP-MANIFEST.json + README-RESTORE.txt.
- generator-backup-2026-10-19.zip (54 files) — "Student Summary Generator"
  source (one twin).
- student-summary-generator-backup.zip (55 files) — twin source + RESTORE-README.txt.
- generator-full-backup-2026-10-19.zip (380 files) — promotions-mastermind
  source ("Phoenix AI Solutions Promotions Mastermind"). Code only.
The words themselves live only in HQ (this generator's browser shelf).
