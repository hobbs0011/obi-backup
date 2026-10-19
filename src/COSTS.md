# COSTS — where the work runs, and what it costs (`src/COSTS.md`)

*Written 2026-09-21. Every number below is a free-tier or list price at that date — **verify against the
provider before you depend on it**; the point of this file is the ROUTING POLICY, which does not change when
prices do.*

## The principle

**The station is thin; the heavy work goes where it is free or cheap; the repo is the bus.** Nothing that
can run on your own machine or on a GitHub runner should ever be billed by an edge provider, and nothing that
is cheap and always-on should be moved to an expensive place just to be "serverless".

| where | what it is good for | what it costs | what burns you |
|---|---|---|---|
| **perchance** (this generator) | the station itself + the durable command queue (server-plugin `state`, 50 MiB) | free to host | nothing measured; the platform's own moderation/backing |
| **the page** (perchance or the desktop build) | interactive chat, one-file forge edits, short jobs | free | it is throttled/frozen when hidden — a *capability* limit, not a bill |
| **your desktop** (`npm run dev` + a local model) | the whole station; private/batch work; uncensored models | electricity + your GPU | speed only |
| **Cloudflare Worker** (free plan) | `/api/fetch` (any URL, no CORS), upload/editable, the always-on tunnel | 100k requests/day, 10 ms CPU per invocation | every tool call that proxies through it counts as a request |
| **Durable Objects** (free plan, SQLite-backed) | the tunnel, presence, the queue, small job state | ~100k requests/day and ~13k GB-s/day of *duration* | **duration**: a WebSocket kept open keeps the DO awake. One open station tab = one awake DO. Don't leave tabs open. |
| **Workers AI** | a fallback brain that needs no key | ~10,000 Neurons/day free (a daily reset), then ~$0.011 / 1k Neurons | **batch LLM work.** A long agent loop or a term of writeups can eat the day's Neurons before lunch |
| **GitHub Actions** ← *the heavy lifting* | long jobs, batch jobs, anything the page can't survive | **private repo: 2,000 runner-minutes/month free** (public: unlimited), then ≈$0.008/min Linux; jobs up to 6 h | repo *storage* (artifacts, big media committed by hand) — not minutes, on a normal workload |
| **Deepgram** | the ear (`/transcribe`) | per audio minute (roughly a few tenths of a cent to ~1c/min by model) — an hour of class ≈ $0.15–$0.60 | long recordings; split + retries re-send only missing parts (already handled) |
| **a VPS/box of your own** | a permanent runner when Actions isn't enough | a few $/month | you run it |

### The mobile truth (the part that costs nothing to know)

On a **phone** the browser is the most aggressive: Android Chrome freezes background tabs and may discard them
under memory pressure; iOS Safari suspends a background tab within seconds. What this station does about it,
in order of strength:

1. **`/bg`'s keep-alive** — the Web Lock (a documented exemption from throttling *and* freezing in Chromium)
   and the wake lock, which need nothing from the speaker, plus an **opt-in** 19 Hz tone that makes the page
   count as *playing audio* (the one lever iOS respects). **The tone is off by default**: it is the only thing
   in the app that touches the speaker on its own, and a hidden tab that makes a noise for an hour is a worse
   bug than a throttled one. Arm it (`/bg audio on`, or ⚙ Settings) for a job that must survive being
   backgrounded on a phone, and remember the choice is remembered in that browser.
2. **Checkpointed jobs** — the ear writes each transcribed part to kv as it lands, so a freeze or a kill costs
   you *time*, never work: the next load offers to save what arrived. Continuing needs the file re-picked
   (the audio itself is never kept).
3. **The runner** (not built) — the only thing that makes the tab irrelevant. For heavy jobs that is GitHub
   Actions; for small always-on state it is the Durable Object.

So: on a laptop, switching tabs is already safe. On a phone, switching apps is *usually* safe for a short
trip and *never guaranteed* — which is exactly why (2) exists and why (3) is the next build.

## ROUTING POLICY — decide by shape, not by habit

1. **Interactive (a chat turn, a command, one file edit)** → the page. Hold the keep-alive (`/bg`) so
   switching tabs doesn't throttle it. Cost: free.
2. **One long job on the device (a class recording, a deep read)** → the page **with the keep-alive held**;
   it now survives a tab switch, and resuming on return is already built (parts are kept and re-sent).
   Escalate to Actions if it must finish with the tab *closed*.
3. **Batch, or anything that must finish unattended (a term of writeups, 20 summaries, a long agent loop,
   a batch of transcriptions)** → **GitHub Actions** via `workflow_dispatch`. It has real CPU, hours of
   wall-clock, no throttling, no tab, and it can commit its results straight into the ONE authority repo —
   which the station already reads back with `/canon sync` and `/gh backup`. This is the heavy-lifting tier.
4. **Always-on, tiny, stateful (queue, presence, tunnel, counters)** → Cloudflare DO. Keep it *thin*: it
   holds state, not LLM calls. Never leave a station tab open just to keep something alive.
5. **LLM volume** → in order: your local model (free, private) → the endpoint you actually want
   (`LLM_BASE_URL`) → Workers AI (metered, keep it as the fallback) → and for batch, put the calls on the
   Actions runner, where the key is a repo secret and no edge meter moves.
6. **Images** → local model / Actions if you have GPU, else Workers AI, and only on demand — never loop
   generations to "see what comes out".

## What is deliberately NOT recommended

- **Scheduled GitHub Actions as the always-on engine.** It looks free, but scheduled workflows are disabled
  after ~60 days of repo inactivity, and this project already has the scar: the README records that the
  *"failing GitHub Actions scheduled runs"* are why the command tunnel moved to the perchance server-plugin.
  Use Actions as a **worker pool you dispatch to**, never as a clock.
- **A DO per open tab left running for days.** Duration is the meter that quietly grows.
- **Routing batch work through Workers AI** when a local model or a runner would do it for nothing.

## The shape of the heavy-lifting tier (template)

Commit this once to the authority repo as `.github/workflows/station-jobs.yml`; the station dispatches to it
and reads the result back out of the repo. Secrets live in the repo (`Settings → Secrets`), never in the
generator's public source.

```yaml
name: station-jobs
on:
  workflow_dispatch:
    inputs:
      job:        { description: "transcribe | summarize | writeup | batch", required: true }
      payload:    { description: "JSON passed to the job", required: false, default: "{}" }
permissions:
  contents: write
concurrency: { group: station-jobs, cancel-in-progress: false }
jobs:
  run:
    runs-on: ubuntu-latest
    timeout-minutes: 120
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - name: run the job
        env:
          JOB: ${{ inputs.job }}
          PAYLOAD: ${{ inputs.payload }}
          LLM_BASE_URL: ${{ secrets.LLM_BASE_URL }}
          LLM_API_KEY:  ${{ secrets.LLM_API_KEY }}
          DEEPGRAM_API_KEY: ${{ secrets.DEEPGRAM_API_KEY }}
        run: node OPERATIONS/COMMANDSTATION/jobs/run.mjs
      - name: commit the result to the authority
        run: |
          git config user.name  "station-runner"
          git config user.email "station-runner@users.noreply.github.com"
          git add -A OPERATIONS/COMMANDSTATION/out
          git diff --quiet --cached || git commit -m "station job: ${{ inputs.job }}"
          git push
```

**Not built yet (honest):** the `run.mjs` job runner and the station-side `/gh dispatch <job>` call
(workflow_dispatch through the stored token) are the next piece — until then this template is a plan, not a
working path. `/gh backup` and `/canon sync` (which already push/pull through the same token) are the
primitives it will be built on.

## Guardrails to keep the bill at zero

- **Meter it, don't trust it.** The station should count what it spends (model calls, DO requests, audio
  minutes) per day and show it in `/state`, warning before a free tier is exhausted. Not built yet — the
  Worker knows the request counts, so this belongs in the DO alongside the tunnel.
- **`/bg` exists so you can see the keep-alive** rather than guess (`/bg audio on` for the strongest lever
  on iOS).
- **One tab.** Each open station tab is an awake DO and a live socket.
- **Prefer the local model for anything you run repeatedly.** It is the only tier with no meter at all.
