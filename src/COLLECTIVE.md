# COLLECTIVE — shared Omega log (all generators under mrmichaelhobbs123@gmail.com)

> One file every generator's bot reads. Per-Omega audits live in `src/OMEGA<N>-<slug>.md`.
> This workspace is `phoenix-rising-ai-solutions-agent99-mastermind` (live, saved).

## §1 Members

> Fleet snapshot 2026-10-12 (screenshot, `uncategorized (8)`, all unlisted):
> mastermind 57 views · g999lfg-undone 5 · 853bbpai3c 3 · eden-command-station 3 ·
> webapp 1 · gamingcommand 0 · r4z5zu43rg 0 · pmhff1hf3r 0.

| Omega | Generator (live slug) | Views | Log file | State |
|---|---|---|---|---|
| Omega2 | `phoenix-rising-ai-solutions-agent99-mastermind` | 57 | `src/OMEGA2-phoenix-rising-ai-solutions-agent99-mastermind.md` | Logged (this session) · `PrAis Command Station` · 7 imports |
| Omega1 | `853bbpai3c` | 3 | `src/OMEGA1-853bbpai3c.md` — **MISSING in this tree** | Needs (re-)log by Omega1's own session · `Student Summary Generator` · 6 imports |
| — | `eden-command-station` | 3 | unassigned | Needs Omega log · `EDEN Command Station` · 7 imports (fork-class station) |
| — | `g999lfg-undone` | 5 | unassigned | Needs Omega log · `Obi — NET Foundations Assistant` · 3 imports |
| — | `phoenix-rising-ai-solutions-agent99-webapp` | 1 | unassigned | Needs Omega log · `OBI CLONE-Web-Dev` · 7 imports (family.webapp) |
| — | `phoenix-rising-ai-solutions-agent99-gamingcommand` | 0 | unassigned | Needs Omega log · title unset (answers slug) · 7 imports (family.gamingcommand) |
| — | `r4z5zu43rg` | 0 | unassigned | Needs Omega log · `Student Summary Generator` · 6 imports (same 1183-char base as 853bbpai3c) |
| — | `pmhff1hf3r` | 0 | unassigned | Needs Omega log · `Student Summary Generator` · 6 imports (same 1183-char base as 853bbpai3c) |

Note: links must be built from `window.generatorName`, never hardcoded (rename wipes kv view).

## §2 How each bot reads this

1. **Same generator:** `read({path:"src/COLLECTIVE.md"})` + `read({path:"src/OMEGA<N>-<slug>.md"})`.
2. **Other generator (reliable after save):**
   `fetch_generator({generatorName:"phoenix-rising-ai-solutions-agent99-mastermind"})`
   then read `scratch/generators/<name>/src/COLLECTIVE.md`,
   or `superFetch("https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=<name>")`.
3. **Unsaved preview caveat:** cross-generator `src/` reads resolve reliably after save.
   This generator is currently SAVED (`generatorIsUnsaved === false`), so its `src/` is readable.
4. **Long-term (not yet done):** mirror this file to an editable upload / CGN hub so bots
   can `superFetch` it live. Decide mirror name before spending quota.

## §3 Per-Omega log template (copy for Omega3+)

```md
# OMEGA<N> — <slug>
- Generator: <live window.generatorName> | title: <…> | publicId: <…> | saved?: <…>
- Faces/routes audited: <…>
- Toolstack: plugins + external services (no secrets)
- Divisions / registry counts (measured, with date)
- Constellation / mesh state (measured)
- Reusable patterns for the collective
- Findings: O<N>-F<M> <severity> <status> — one line each
- Open actions for the sovereign (things the bot must NOT auto-do)
```

File name: `src/OMEGA<N>-<slug>.md` (slug = live `window.generatorName`).

## §4 Findings index

| ID | Omega | Finding | Severity | Status |
|---|---|---|---|---|
| O2-F1 | Omega2 | All 4 `cgn-node.js` kits default `anchorName:"obi"` — no generator `obi` exists; mesh points nowhere | 🔴 blocker | OPEN (log only; not patched this pass per "just log" order) |
| O2-F2 | Omega2 | Mesh not joined: `ObiNet.cgnStatus()` = `joined:false`, `net:null`, `seq:0`, no hub file | 🔴 blocker | OPEN — needs save-then-`/netjoin obi-network` by sovereign |
| O2-F3 | Omega2 | Editable write lane historically refused (`anti_bot_verification_needed`, measured 2026-09-24) — if still refused, hub/node writes stay inert regardless of names | 🔴 blocker | OPEN — re-measure with `/network` WRITE LANE row |
| O2-F4 | Omega2 | Portal/PIN + audio/vocab must change before sharing (would lock out users if bot auto-changes) | 🟡 caution | OPEN — sovereign only |
| O2-F5 | Omega2 | kv + localStorage are per-browser per-origin; rename presents empty station (recoverable by rename-back) | 🟢 info | DOCUMENTED — always build links from `window.generatorName` |
| O2-F6 | Omega2 | No secrets in public source (measured: no PAT/token in tree; keys live in browser store / Worker secrets) | 🟢 pass | HOLD — keep it that way |
| O2-F7 | Omega2 | Prior chat claimed `src/COLLECTIVE.md` + `src/OMEGA1*` + `src/OMEGA2*` + `FORGED_FROM.md ×5` existed — none exist in this tree (glob 2026-10-11) | 🟡 drift | LOGGED — this file + Omega2 log are the real ones |

## §5 Open actions (sovereign-gated; bots do NOT auto-do)

1. Save (done — page reports saved), then `/netjoin obi-network` → open each node once → `/netadd <gen> <role>`.
2. Change portal PINs + real audio/vocab before sharing.
3. Rotate Deepgram key + gate the STT route (needs worker access).
4. Decide: promote-vs-park for scaffold roles; confirm editable-mirror name before spending quota.
5. Fix O2-F1 anchor in one place (`src/cgn-node.js` + 3 kit copies + `src/cgn.js` hub default) — queued, not applied this pass.
6. Omega1: (re-)create `src/OMEGA1-853bbpai3c.md` from its own session and register here.

## §6 Shared toolstack registry (measured in this tree)

- Plugins (`main.pjs`): `ai-text-plugin`, `text-to-image-plugin`, `super-fetch-plugin`,
  `upload-plugin` (+editable), `server-plugin` (tunnel: 6 RPCs, 500-cmd window, 15 drones),
  `kv-plugin`, `secret-plugin` = 7 imports.
- Transcription: Deepgram nova-3, silence-snapped long-audio split (`src/audio-split.js` + `src/transcribe.js`).
- Host fleet: Cloudflare Workers/Pages/D1/KV/R2 (`src/cloudflare/`, `svc.cf` live 2026-09-26).
- Vault: `src/vault.js` + `src/VAULT-RECOVERY.md` (durable pointer `prais-agent99/v`, passphrase-gated).
- Record: I-LOG sha-256 append-only (`src/ilog.js`); Soul-DNA ledger `obi_sdnad` (L37–L60).
- Mesh: CGN hub+node over editable files (`src/cgn.js` + `src/cgn-node.js` kit ×4 copies).
- Reusable patterns: server-plugin durable queue; evidence-only writeups (`/writeup`/`/review` cite verbatim);
  role-kit (1 kit + 1 method + N panels → paste-2-files roles); brand system (`src/brand.js`);
  freewire credential-free lanes (uploads.dev, ntfy, keyvalue.immanuel.co).

## §7 Sync log

- 2026-10-11 Omega2: live check `phoenix-rising-ai-solutions-agent99-mastermind` — saved, 5 divisions /
  38 crates (9 live · 17 scaffold · 12 planned), constellation 21 pieces (9 live · 1 ready · 5 scaffold ·
  5 planned · 1 retired, 48%), `cgnStatus joined:false` (expected). Clean console at eval time.
  Created this file + `src/OMEGA2-phoenix-rising-ai-solutions-agent99-mastermind.md`. No code touched.
  Prior-claimed collective files verified absent via glob; recorded as O2-F7 instead of overwritten.
- 2026-10-12 Omega2: fleet screenshot logged — `uncategorized (8)`, all unlisted (counts above).
  `eden-command-station` confirmed as a SEPARATE generator (3 views), not this station.
  Unassigned: eden-command-station, g999lfg-undone, webapp, gamingcommand, r4z5zu43rg, pmhff1hf3r.
  Next Omega session on any of those: copy §3 template, add `src/OMEGA<N>-<slug>.md`, register in §1.
- 2026-10-12 Omega2 fleet scout (platform API `getGeneratorsAndDependencies`, HTTP 200 all):
  8/8 exist with correct spelling. `g9991fg-undone` (with "1", as typed in the order) is UNFOUND —
  correct is `g999lfg-undone` (`Obi — NET Foundations Assistant`, 3 imports, 553 chars).
  Triple fork: `853bbpai3c`/`r4z5zu43rg`/`pmhff1hf3r` share title `Student Summary Generator`,
  6 imports, identical 1183-char main.pjs (same base). `eden-command-station` = `EDEN Command
  Station`, 7 imports, 2194 chars (station-class fork). `gamingcommand` has no `$meta.title`
  (answers its slug). Full JSON: `scratch/fleet-scout.json` (this session only — scratch is private).
  Actions: assign Omegas to eden + g999lfg + webapp + gamingcommand + r4z5zu43rg + pmhff1hf3r;
  Omega1 still to (re-)log 853bbpai3c from its own session.
