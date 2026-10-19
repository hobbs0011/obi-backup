# OB-1 on Cloudflare — self-hosted, no platform, no tracking

This turns the generator into a normal website that runs on **your** Cloudflare account: one Worker,
two Durable Objects, static assets. No perchance page, no perchance header, no third-party script,
no moderation layer, no generator listing.

Nothing about the app changed. The **whole `src/` tree is copied byte for byte** into the build by
`build.mjs` — every module the station loads (`pheromone · playbooks · scout · ecosystem ·
constellation · clients · ilog · divisions · background · app · forge · cgn · audio-split ·
transcribe · summary · review · lessons · lesson-forge · curriculum · brand · vault · freephoenix ·
savewatch`), plus the data it reads at run time (the curriculum JSON, the brand assets, the canon
copies, the lesson specs). The build then **asserts** that every `<script src="src/…">` on the page
exists in `dist/` and fails loudly if one is missing — a hand-written list is what drifted before
(AUDIT 2026-09-21: it named 15 of 24 modules, so a deploy built this way 404'd nine scripts and
every data file, and the station booted degraded). The
only reason the app runs off-perchance is `public/ob1-shim.js`, which re-implements the six plugin APIs
the app was written against. Edit the app in the editor and both builds follow — there is one copy
of the code.

---

## Run it on your desktop first (no Cloudflare account, no perchance)

The same folder runs locally. `wrangler dev` is a real Node server + workerd: the Worker, both
Durable Objects and the app, on `http://localhost:8787` — outside perchance, offline-capable.

```bash
npm install        # wrangler (dev dependency)
npm run dev        # builds dist/ then serves it on http://localhost:8787
```

**Which brain it uses** — one of two, your choice:

| | how | what it costs |
|---|---|---|
| **local model** (nothing leaves the machine) | `cp dev.vars.example .dev.vars`, set `LLM_BASE_URL="http://localhost:11434/v1"` / `LLM_MODEL="llama3.1"` (Ollama, llama.cpp, LM Studio, vLLM — anything OpenAI-compatible) | free, private, as good as the model you run |
| **Workers AI** | `npx wrangler dev --remote` (the `[ai]` binding lives at Cloudflare, so it needs your account) | free tier, needs login |

Everything else is already local: kv (IndexedDB at `localhost:8787`), the forge, the tool layer. Only
`/api/text`, `/api/image`, `/api/fetch`, `/api/deepgram` ever leave the process, and each of those can be
pointed at your own box.

**Keep `node_modules` out of the generator.** `src/` is the generator's own tree — it ships, and it has a
file-count quota — so `npm install` inside `src/cloudflare/` would add thousands of files to it. Work from a
checkout instead:

```bash
# the station pushes its own source into the ONE authority repo
git clone https://github.com/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-.git
cd OB-1--Authoritative-/OPERATIONS/COMMANDSTATION/perchance/src/cloudflare
npm install && npm run dev
```

That checkout is also how you go back and forth: `/forge apply` and `/canon sync` push from the station into
that repo, `git pull` on the desktop brings the desktop up to date — one codebase, three places to run it
(perchance, your desktop, your server). A plain copy of the generator's files works too, as long as the folder
layout above it (`main.pjs`, `index.html`, `src/`) comes with it — `build.mjs` reads them from there.

The **self-forge reads the panels too off-perchance**: `build.mjs` now copies `main.pjs` into `dist/`, and
`src/forge.js` loads `main.pjs` / `index.html` from this origin when it is not running on perchance, so
`/forge read main.pjs`, `/forge tools` and the agent loop work identically on the desktop and on the server.

### What the desktop run does *not* fix

Work still executes **in the page**. Close the laptop and a running job pauses — same as perchance. That is
what the server move is for (below): the Durable Object already holds the queue durably; making it *execute*
is the next piece.

---


You need [Node 18+](https://nodejs.org) and a free Cloudflare account.

```bash
cd src/cloudflare
npm install                    # installs wrangler
npx wrangler login             # opens the browser once, authorises wrangler
npm run deploy                 # builds dist/ and publishes
```

`npm run deploy` prints something like:

```
Uploaded obi-student-summary
Deployed obi-student-summary triggers
  https://obi-student-summary.<your-subdomain>.workers.dev
```

**That URL is your link.** Open it — the app is live, with its own origin, outside perchance.

### Add the transcription key (once)

Audio never worked without a Deepgram key, and it still doesn't — but now the key lives in a Worker
**secret** instead of your browser, so it is not in the page, not in localStorage, and not in any URL:

```bash
npx wrangler secret put DEEPGRAM_API_KEY     # paste the key at the prompt
npm run deploy                               # one more deploy so the secret binds
```

Until you do this, everything works except `/transcribe` (the ear shows its key card and the console
says so). The key is never sent to the browser: `ob1-shim.js` rewrites `api.deepgram.com` to
`/api/deepgram` and strips the Authorization header; the Worker adds the real key at the edge.

This also fixes the open security item from the previous session — the leaky
`net-pet-ai.../api/stt/key` route becomes irrelevant to you.

**Where these keys live in the station (AUDIT 2026-09-21).** `wrangler secret put` installs a secret on the **deployed
Worker**; the durable record of *what* the empire runs on is the **PrAis Vault** (`/vault`, `src/vault.js`) — L1 in this
browser, L2 sealed on the canon under `OPERATIONS/VAULT/`, L2.5 escrowed behind a passphrase, L3 proven with a live
call. `dev.vars`/`.dev.vars` stay local and are never committed. No plaintext key belongs in this tree, in a URL, in
the chat, in the soul ledger or in the I-LOG.

---

## "Completely unrestricted"

Text and images default to **Workers AI** (`@cf/meta/llama-3.3-70b-instruct-fp8-fast` and
`@cf/black-forest-labs/flux-1-schnell`) because that needs **no API key at all** — deploy and it
works. It is a model provider, not a gatekeeper: nothing sits between your prompt and the model.

To point at anything else — a self-hosted model, an uncensored endpoint, your own box — uncomment
the optional block at the bottom of `wrangler.toml`:

```toml
LLM_BASE_URL  = "https://your-endpoint/v1"
LLM_MODEL     = "your-model"
```

```bash
npx wrangler secret put LLM_API_KEY
npm run deploy
```

Any OpenAI-compatible `/chat/completions` works, streaming included. Images take `IMAGE_BASE_URL` /
`IMAGE_MODEL` / `IMAGE_API_KEY` the same way:

```bash
npx wrangler secret put IMAGE_API_KEY
```

The app code does not know or care which it is talking to. (Other optional vars: `OBI_MAX_TOKENS`,
`IMAGE_STEPS`, `DEEPGRAM_PROJECT`.)

---

## "Untracked" — what is actually true

| | |
|---|---|
| Third-party scripts in the page | **none.** No analytics, no fonts, no CDN, no perchance header. |
| Crawlers | `robots.txt` disallows everything and every response carries `X-Robots-Tag: noindex, nofollow`. |
| Referrers | `Referrer-Policy: no-referrer`. |
| Your transcripts, summaries, memory ledger | stay on the device (IndexedDB). They are never uploaded. |
| Your prompts and audio | go where the feature requires: text/images to Workers AI (or your endpoint), audio to Deepgram **on your own account**. |
| Cloudflare | still sees the requests, as any host does. That is unavoidable on any infrastructure; what is gone is the *platform* — perchance's page, cookies, iframe origin and listing. |

**Want it private, not just untracked?** Uncomment `OBI_ACCESS_KEY` in `wrangler.toml`, redeploy,
then visit `https://<your-url>/?k=THEKEY` once. Every request without that cookie gets a plain 404 —
no login page, no hint the site exists. The app has no accounts of its own, so this is the whole
lock on the door.

---

## What maps to what

| perchance | here |
|---|---|
| `generateText` (ai-text-plugin) | `POST /api/text` → Workers AI or any OpenAI-compatible endpoint, streamed as NDJSON |
| `generateImage` (text-to-image-plugin) | `POST /api/image` → FLUX, or `IMAGE_BASE_URL` |
| `superFetch` (super-fetch-plugin) | `POST /api/fetch` — fetch any URL from the edge, no CORS wall |
| `uploadPlugin` (+ `.editable`) | `POST /api/upload`, `POST /api/editable` → **StoreDO** (no R2 bucket to create) |
| `createServerSocket` (server-plugin) | `WS /api/tunnel` → **TunnelDO**, a port of the same server script |
| `kv` (kv-plugin) | handled in the browser by the shim — IndexedDB, per generator name |
| `$meta` | gone; the page carries its own `<title>` and `robots.txt` |
| perchance 50 MiB `state` blob | DO SQLite. Same records, same RPCs, same 500-command window, durable. |

The command tunnel is the same machine, not a lookalike: `tunnel-do.js` contains the drone
classification tables **copied byte-exact** from the `server-plugin` block in `index.html`, so a
command classifies into the same drone and produces the same Agent 99 / Agent 98 / Agent 97 card.
Keep those two blocks in step if you ever edit the drone list.

### Files

```
src/cloudflare/
  README.md          this file
  wrangler.toml      Worker + Durable Objects + assets + (optional) vars
                     ⚠ the Worker is still named `obi-student-summary` — a legacy of the
                       generator's first name. It is kept so an existing deployment and its
                       workers.dev URL are not orphaned; change `name =` only if you accept
                       a brand-new URL.
  package.json       build / dev / deploy / secret scripts
  dev.vars.example   local secrets for `npm run dev` (copy to `.dev.vars`)
  build.mjs          assembles dist/ from the generator's own sources
  worker.js          routing, text, image, proxy, Deepgram, uploads, the access gate
  tunnel-do.js       TunnelDO — the command tunnel (perchance server-plugin, ported)
  store-do.js        StoreDO — uploads + editable files (CGN hubs)
  public/ob1-shim.js the six plugin APIs + the Deepgram rewrite  (loaded before app.js)
  public/ob1-patch.js the key sentinel + config notes             (loaded after app.js)
  dist/              generated — never edit, never commit by hand
```

### Gotchas

- **Requires wrangler v4** (pinned in `package.json`) for `run_worker_first` in `[assets]`.
- The WebSocket tunnel keeps the Durable Object awake while a tab is open. One tab = one DO. On the
  free plan that is fine; it is also the only always-on component.
- `/api/text` needs `[ai]` binding (already in `wrangler.toml`). If you deploy with only
  `LLM_BASE_URL` set, the AI binding simply goes unused.
- Rebuild after editing the app: `npm run deploy` always runs `build.mjs` first, so `dist/` can
  never go stale.
