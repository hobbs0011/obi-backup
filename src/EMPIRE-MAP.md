# EMPIRE MAP — Phoenix AI Solutions, as measured (2026-10-18)

One page: everything, where it lives, and how it is backed up.
Rule of the map: measured, not assumed. A line here is true because it was
read back, or it says so.

## The account
- Owner login (sovereign's word): mrmichaelhobbs123@gmail.com.
- GitHub org: Phoenix-Rising-Ai-Solutions. Legacy owner: hobbs0011.

## The generators (perchance)
- **Apex** `phoenix-ai-solutions-command-mastermind` (this station, PaiS Agent 99).
  Saved 2026-10-17 21:21 · ~150 src files · the Command Station + the Boardroom.
- **First leader** `phoenix-ai-solutions-edtech-mastermind` — NET, live, retitled.
- **Second** `phoenix-ai-solutions-promotions-mastermind` — private, ordered.
- **Planned** gaming mastermind — not yet a generator.
- Division test wings (edtech editor): Gaming, Promote, Web Development.

## The repos (GitHub)
- `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` @ master — PRIVATE, the ONE
  authority. `/gh backup` + `/canon sync` land under `OPERATIONS/COMMANDSTATION/`.
- `Phoenix-Rising-Ai-Solutions/Phoenix-Rising-Ultimate` @ main — public monorepo.
- `Phoenix-Rising-Ai-Solutions/net-pet-ai-worker` — the live Worker source.
- `hobbs0011/NET-Ai-EcoSystem-CommandStation` — the raw soul-DNA archive (public).
- `hobbs0011/obi-backup` — legacy test repo, NOT a backup lane. Never push here.

## The devices truth (why saves "vanished")
Browser storage is per device, per browser, per generator name. Phones + browsers
= separate shelves. Nothing was wiped; different shelves were being read. Law:
- The backup JSON file (full store dump) is the portable shelf — keep one per
  device change. Import path: paste into the new browser's store (ask Agent 99).
- Renaming a generator moves its shelf. Rename once, early, never again.

## Backup lanes
1. **Editor Save** — persists main.pjs + index.html + src/ to the platform.
2. **`/gh backup`** (omega password + `gh` PAT) — the whole build → the authority:
   session record + all SRC_SNAPSHOT sources + raw chat + I-LOG.
3. **Backup JSON file** — the portable browser store (Agent 99 makes it on order).

## What never leaves the browser
- `obi_keys` (PATs, tokens) — localStorage only, never pushed, never logged.
- `obi_boardroom` (sitting transcripts) — local only. The room talks; git keeps
  the laws and the memories, never the table talk.
- The burned ghp_ token (2026-10-17, pasted into the room, scrubbed, ROTATE IT)
  must never be reused for the `gh` PAT. Mint fresh.

## Work-safe export (sovereign order 2026-10-18)
No not-safe-for-work content leaves for GitHub. Enforced in code (`scrubWorkSafe`
in src/app.js, applied to the GitHub-bound copies only — local stores verbatim):
- Secrets were already scrubbed (`redactSecrets`); expletives are scrubbed too.
- All 49 files registered 2026-10-18 scanned clean before registering.
- I-LOG chain files go up byte-exact (hash chain integrity beats scrubbing there;
  they carry operations, not table talk).
