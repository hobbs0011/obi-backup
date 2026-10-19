# Research intake — Gemini free stack + free server sweep (2026-10-16)

> **Provenance (read before trusting):** pasted chat from a sibling generator's AI helper
> (the one holding `src/MasterSynch.md`), not machine-measured by this station. The sibling claims
> Gemini docs last updated 2026-10-15 and Perchance/GitHub pages checked same-day. Treat every number
> below as **UNVERIFIED lead, not fact** — re-measure before spending money or committing architecture.
> Filed here so the intel isn't lost to that generator's chat log.

## 1 · Gemini free tier (sibling's findings)

- **Gemini Developer API free tier still available** (same structure as ~May 2026): free in+out tokens on
  select models, no billing required, lower RPM limits, Google AI Studio access included.
  Tradeoff: content is used to improve Google products. Source claimed: ai.google.dev/pricing.
- **AI Studio free includes:** API key, Playground/try-models, Build mode (full-stack/Android apps, deploy),
  Agents, LearnLM trial, rate-limit dashboard, auto-upgrade to Tier 1 once billing added.
- **Chrome angle:** standardizing on Chrome gives the free in-browser option — built-in Gemini Nano
  (Prompt API, no key, on-device) for lightweight tasks, plus AI Studio/API free tier in the same
  browser. Sibling's recommendation: Chrome as baseline (replacing its earlier Brave Shields note).

## 2 · Model comparison (sibling's table, paid standard per 1M)

| Model | Best for | Free? | Paid Std in/out (claimed, with announced changes) |
|---|---|---|---|
| 4 Argon (flagship, 1M ctx + 1M decode) | complex SWE / math / multi-step agents | No — paid only | $2/$10 → **$4/$20 from Dec 1** |
| 3.8 Flash (workhorse) | long-horizon SWE / agents, default pick | Yes | $0.75/$3.75 → **$1.50/$7.50 Jan 1**; Batch half; Flex same; Priority $1.35/$6.75 |
| 3.6 Flash (prior gen) | cheap fallback | Yes | same as 3.8 Flash |
| 2.5 Flash (hybrid reasoning, 1M ctx) | cheapest reasoning | Yes | $0.30 text/image/video ($1 audio) / $2.50 out; Batch half |
| Live 3.8 / TTS / Image (Nano Banana 3.1, 3 Pro Image) / Embedding | voice, image, search | Mixed | priced separately; search grounding 5k free/mo then $14/1k |

Paid-only extras (claimed): context caching, Batch API (−50%), Priority/Flex inference, highest limits,
most advanced models, content not used for training. Enterprise = Agent Platform, provisioned
throughput, dedicated support.

## 3 · Free server sweep (sibling's findings)

- **Perchance (already owned, $0):** server-plugin — 50 MiB durable Uint8Array state per generator, no
  expiry, 10,000 concurrent connections, pub/sub + RPC. Emulator while unsaved (local, wiped on reload);
  production after save. Perchance-only (external embeds closed 4403). Pair with upload-plugin for files;
  keep big blobs out of state.
- **GitHub Free ($0):** unlimited public/private repos, 2,000 Actions min/mo (free for public),
  Dependabot, Issues, code review. Team (~$4/user/mo) and Enterprise only needed later.
- **Cloudflare Workers free:** 100k req/day, KV/D1/R2 free tiers, zero idle cost — best free API/cron
  companion (claimed).
- **Supabase Free ($0):** unlimited API req, 50k MAU, 500MB DB, 5GB egress, 1GB storage, pauses after 1
  week inactive, 2 active projects max. Pro $25/mo: 100k MAU, 8GB disk, 250GB egress, daily backups 7d.
- **Virtually-free stack:** Perchance server (realtime/state) + Supabase Free (auth/DB) + Cloudflare Free
  (jobs/proxy) + GitHub Free (code/CI) = **$0/mo**.

## 4 · Sibling's recommended path

- **$0 start:** Chrome + AI Studio Free (3.8 Flash / 2.5 Flash) + Perchance server + GitHub + Supabase/Cloudflare free.
- **First $10–20 that 10x's:** AI Pro $19.99/mo if living in Gemini app/NotebookLM/Flow (unlocks Argon +
  4x limits); or $10–25 API credit + Supabase Pro if living in code (Batch + caching + DB/backups).
- **Routing rule:** 90% to Flash/Batch, 10% to Argon for hard tasks; don't prepay Argon Standard until
  free Flash proves insufficient.
- **Cheap monthly unlocks:** Google AI Plus $9.99/mo (2TB, 2x limits + Flash); AI Pro $19.99/mo (5TB,
  4x + Argon in-app + Deep Research + YouTube Premium Lite).

## 5 · Open questions handed back to the sovereign

The sibling ended by asking (unanswered in the paste): (a) lock 3.8 Flash as default + 2.5 Flash
fallback + Argon optional in code? (b) add a minimal Perchance server room demo? These are decisions
for the sovereign, not defaults this station will assume.

## 6 · Noise stripped (kept out deliberately)

Generator lists, file/undo UI chrome, the AS-0001 save error from the sibling session, and an
Agent-99 command-#10 card about auto-posting (that card belongs to the sibling's run/session, not this
station's state — filed nowhere here).
