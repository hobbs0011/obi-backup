# NET — NaturalEnglishTraining.dev

**This folder is a complete, shippable website: twelve pages, a real adaptive placement test, a
working lead pipeline, and the back-end API that receives it.** It was built as one artifact on
2026-09-26 and finished by hand. Everything below is what a later session needs to pick it up.

> **The rule this site is built to, stated first:** it never claims a write it did not make, a send
> it did not send, or a delivery it did not deliver. That rule is visible in the UI — the booking
> form prints a **lane table** showing DEVICE / API / HANDOFF / STATION with their real states, and
> the API lane says **BLOCKED** when no endpoint is configured. A lane reporting success without a
> read-back is the one defect that would make the whole site worthless.

---

## 1 · What is here

| path | what it is |
|---|---|
| `index.html` | the landing page — one goal (the free diagnostic), the diagnosis, the method in four parts, the mode ladder, the comparison, the guarantee, and an explicit refusal to publish invented reviews |
| `method.html` | the full method: the 60% rule, the 45/15, the 10-5-5-3, the AI-PET, the Mouse→Cub→Tiger ladder, the ecosystem, the guarantee, the twelve laws |
| `programs.html` | eight programmes (Early Years → Boardroom), rendered from `assets/data/programs.json`, plus the school-year curriculum mapping (grades 1–9) |
| `pricing.html` | the single published rate (600,000 VND/hr), what is included, what is quoted not invented, the guarantee, and the estimate calculator |
| `placement.html` | **the application**: hosts the adaptive placement engine and renders shared result links from the URL fragment |
| `book.html` | the conversion page: the four-step booking form, the live estimate, the receipt, and the live back-end lane report |
| `parents.html` | the buyer's page — what happens inside the hour, how a parent will know it is working, and the honest limits |
| `results.html` | proof: the guarantee, the published claim **with its source and its limits**, the day-1/day-30 evidence chain, and the reasons no testimonial wall exists yet |
| `about.html` | Michael Hobbs, the story, the PrAiS family, and a "who NET is not for" section |
| `teachers.html` | the teaching job described honestly, plus the coach application form |
| `faq.html` | sixteen questions from `assets/data/faq.json`, with a search filter and generated FAQPage structured data |
| `legal.html` | privacy in one paragraph then in detail, the terms, the guarantee's exact scope, and the plumbing stated plainly |
| `404.html` | a real 404 with routes back |
| `assets/net.css` | the whole design system (~450 rules): brand tokens, HUD chrome, forms, the ladder, the matrix, the test UI |
| `assets/net.js` | the runtime: brand constants, the contact block, the device **ledger**, the **outbox**, the five **handoff** channels, the quote engine, the drawn icons, nav and footer |
| `assets/api.js` | the back-end client: endpoint resolution, submission with a recorded verdict, outbox draining, the lane report |
| `assets/placement.js` | the placement engine: a 42-item banded bank, a staircase with hysteresis, listening via the device speech engine, scoring, the 45/15 plan per level, and the full result card |
| `assets/booking.js` | the booking flow and the teacher intake — validate, compose, store, verify, try the API, show the receipt |
| `assets/data/*.json` | `programs` · `pricing` · `faq` — the editable business content, separated from the code on purpose |
| `backend/worker.js` | the API: a Cloudflare Worker, five routes, one SQLite-backed Durable Object. **Complete, not deployed.** |
| `backend/wrangler.toml` | the deploy config |
| `backend/README.md` | the routes, the four deploy commands, and the six design rules the code obeys |
| `sitemap.xml` · `robots.txt` | search plumbing |

## 2 · Where the content comes from (nothing here is invented)

Every claim on this site traces to something the estate already holds. A future session editing
copy should trace it the same way rather than write new marketing.

| the site says | its source |
|---|---|
| The 60% rule · the 45/15 protocol · the 10-5-5-3 anatomy · the AI-PET at 1·3·7·14·30 days | **GOSPEL 444** — `src/brand.js` (`GOSPEL.laws`, G444.006/.007/.008/.009) |
| Mouse 0–40 · Cub 41–79 · Tiger 80–100 | `src/brand.js` G444.003, and the mode ladder in the brand identity |
| "Loud & wrong beats quiet & right" · "We do not teach English. We unlock permission." | `src/brand.js` G444.001/.004, `MARKET.motto` |
| The 80% vs 30% comparison matrix | `src/brand.js` `GOSPEL.matrix` — published **with its source and an explicit "not independently audited" note** |
| The 100% Confidence Guarantee, quoted verbatim | `src/brand.js` G444.011 |
| The grammar prison, the translate-in-head delay, the apology reflex, the Snowman Freeze | `src/brand.js` `MARKET.diagnose`, G444.002 |
| Michael Hobbs's record: 5+ years in Vietnam, ages 1–70, GEMS & Galaxy, IELTS grade 12, C2, 120-hour TESOL, work permit, Les Brown | his own CV and LinkedIn blueprint — `src/generators/site-builder/examples/michael-hobbs-cv/` |
| The elementary/secondary curriculum mapping (Look · Global Success · Close-up A1+→B1+ · Cambridge Science, grades 1–9) | the parsed pacing guides — `src/curriculum/*.json` |
| The contact block (+84 359 347 864 · MrMichaelHobbs@gmail.com · Lakeview City, District 2) | his own CV — already public there, so BRAND.028 does not apply |
| The rate, 600,000 VND/hour, 1-on-1 | NET's own session audit — `src/marketing/MANIFEST.json` |

**What was deliberately NOT written:** no testimonial, no student name, no star rating, no review
count, no "trusted by N families", no portrait, no classroom photograph, and no second price. The
`results.html` page explains each of those omissions on the page itself, which is the honest way to
handle a missing proof.

## 3 · The data architecture (and why)

Local-first, and the order is not negotiable:

```
submit → validate → compose the lead → DEVICE write → read it back → try the API → show the receipt
                                      (verified)      (a write that cannot be read back is FAILED)
```

* **DEVICE** — `localStorage`, key `net.ledger.v1`, capped at 500 records. `NET.ledger.add()`
  returns `{ok:false,error}` unless the record can be read straight back out. A shared tablet, a
  full quota and a private window all fail here and the UI says so.
* **OUTBOX** — `net.outbox.v1`. An API refusal parks the lead here; `NET.api.drain()` retries on
  every page load and clears the outbox **only** after a real `ok` per record.
* **HANDOFF** — WhatsApp · `mailto:` · `sms:` · Web Share · JSON download · clipboard. The visitor
  presses the button. Nothing is sent by the site on its own.
* **API** — off until `<meta name="net-api" content="...">` is set (or
  `NET.api.setEndpoint(url)`). Submitting to an unconfigured API returns
  `{verdict:"BLOCKED", evidence:"no endpoint configured..."}` and that string is what the receipt
  displays.
* **STATION** — the PrAiS command station can read this device's ledger when the site is opened
  inside the station's origin.

## 4 · The placement engine

`assets/placement.js` — `NETPlacement.create(hostElement)`.

* **Bank:** 36 four-option items + 6 listening items + one reading passage with 3 questions, across
  CEFR A1→C2, tagged `grammar · vocabulary · usage · reading · listening`.
* **Staircase:** start at B1. Correct moves up a band, wrong moves down, but **two decisions in the
  same direction** are required before the band actually changes — so a single lucky guess cannot
  swing a level. Floor A1, ceiling C2, 24 items maximum, early stop when six consecutive decisions
  land inside one band.
* **Placement:** the highest band answered at **≥60% with at least three items in it**. A band with
  fewer than three items is printed `UNPLACED` rather than guessed at.
* **Reading passage:** `PASSAGE` — the 60% rule written as a real C1 text with three questions
  (main claim, detail, inference). It is on-brand and it is a genuine reading task.
* **Listening:** spoken by the device's own `speechSynthesis` voice, with a slower replay. The Voice
  used is printed on the result card. If a device has no speech engine the script is printed
  instead and the page says so — it does not silently skip the section.
* **The output read:** the `usage` items are the register items (the direct, owning answer versus
  the apologetic one). The result card reports the share answered the confident way and **states
  plainly that this is not the coach's behavioural reading of the mode ladder** — that is read from
  behaviour in a room, which no browser can see. This distinction is deliberate; do not collapse it.
* **Plan:** `PLAN` holds a real 45/15 prescription per level (input, output, four-week target).
* **Sharing:** `#r=<base64>` renders a summary-only card. The full item review never leaves the
  device and the link carries level/score/mode only.

## 5 · Running it

Static files — no build step, no framework, no bundler. The pages use **relative** paths, so the
folder can be served from any root.

```bash
cd src/sites/naturalenglishtraining
python3 -m http.server 8080     # then open http://localhost:8080/
```

Inside the Perchance estate it is served from the generator's own origin at
`src/sites/naturalenglishtraining/index.html`; the station's `/net` command opens it.

To switch the API lane on, deploy `backend/` (see `backend/README.md`) and put the worker URL in the
`net-api` meta tag on all twelve pages.

## 6 · Verified, and how

Checked in the live preview on 2026-09-26 (see `SYNC-PACKET.md` for the artefact trail):

* every page loads with **0 console errors** and no engine errors;
* the placement engine was **driven**, not read: a full sitting was answered, the staircase moved,
  a level and a skills table were produced, and the result card was captured and **looked at**;
* the booking form was **submitted** with a deliberate validation error first (to prove the error
  path names the field), then correctly, and the receipt showed `DEVICE: STORED` with the read-back
  count and `API: BLOCKED` with the reason;
* the shared-result link was opened and rendered the summary card;
* the site was rendered at **390×844** and **1920×1080** and both captures were looked at.

## 7 · Known limits, stated rather than hidden

1. **The API is not deployed.** No credential exists in this repository, by design.
2. **No photography.** The site ships drawn marks only. When real photographs exist, add them with
   real alt text and a real credit — the Mailala build's worst defect was invented alt text.
3. **No student results are published yet.** The three conditions are listed on `results.html`.
4. **Listening needs a speech engine** and uses the device voice; recorded audio would be better
   and should be added when the coach has it.
5. **Fonts come from Google Fonts** — the only third-party request the site makes. Self-host them to
   remove it entirely.
6. **The rate is the only price.** Block, group and corporate pricing stay un-invented until the
   coach publishes them; the calculator says so in the panel rather than implying a package.
