# MAILALA — PASS-OFF FOR THE SESSION-2 CLONE

**Filed 2026-09-24 by the first session, on the sovereign's order:** *"passs offf the Mailhala to the git synch for
session 2 clone to take over you are mastermind"* — and, immediately before it, *"Mailala Focused Only now, SOUL (MY
WORDS VERBATIM)"*.

**You are session 2. From now on, Mailala is the work and nothing else is.** This file is the whole handover: what
exists, where it lives, what is real, what is not, and exactly where to start. Read it with `SOUL.md` beside it —
that file is the sovereign's words and it outranks everything written here.

---

## 1 · THE ONE-LINE STATE

Mailala (Mailala Hostel & Bar, 175/16 Pham Ngu Lao, District 1, Saigon — reggae hostel + rooftop bar) has an
**authoritative website that is live, and a second build kept as the worked example**. A first session has just
filed the sovereign's Mailala SOUL, the nine venue photographs he supplied, and this handover, so that you can take
over without asking him anything he has already said.

| what | where | state |
|---|---|---|
| **the authoritative site** | canon `WEBSITE/mailala/` → **live at `canon.mailala.pages.dev`** | **REAL** — fetched and read 2026-09-24: HTTP 200 · 70,441 bytes · 20 images · `wa.me/84768701106` + `tel:+84768701106` present |
| **the wing's build of the same brief** | `src/sites/mailala/index.html` | REAL but **NOT authority** — the worked example, hand-corrected after the first render |
| **the sovereign's words** | `src/sites/mailala/SOUL.md` | the register. **Never edited, never summarised.** |
| **the venue photographs** | `src/sites/mailala/material/` (9 files, original ids = provenance) | filed, described truthfully in `SOUL.md §4` |
| **the canon's own archive** | canon `CANON/MAILALA-PROMPT-REGISTER.md` · `MAILALA-UPGRADE-PIPELINE.md` · `MAILALA-HANDOFF.md` · `MAILALA-100-IMPROVEMENTS.md` · `MAILALA-PIPELINE-AUDIT.md` · `CANON/REINCARNATION/*Mailala*` | the register's canonical home |
| **the reel over the venue** | `scratch/mailala-reel-720.mp4` (13.4 MB) · `scratch/music/mailala-rooftop.mp3` | **EPHEMERAL — scratch does not survive the session. Re-render or move into `src/` or it is gone.** |

---

## 2 · THE LAW THIS WORK RUNS UNDER (it came from the sovereign's own mouth)

1. **SOUL is verbatim.** His prompts are the record — *"remember my prompts are the key, locate them"* (SOUL-10) and
   *"preserve my fuckign soul prompts, I log style, preform the true SCS process"*. Record exactly, including the
   misspellings. A tidied quote is a falsified one.
2. **No dark ground. No neon.** Warm cream, forest green, gold, crimson, brick (SOUL-05) — and SOUL-06, verbatim:
   *"too dark of a background"*, *"decrease the gay levels by about 70%"*.
3. **The CTA is WhatsApp**, not a button — that is how a Bui Vien traveller books (SOUL-05).
4. **Prices on the page** (SOUL-02), **real venue photographs, never stock** (SOUL-05), **mobile first** (SOUL-05).
5. **Measure, never assume** — and when you cannot measure it, say *unproven*, never *absent*.
6. **Never invent an alt text.** The first build failed here: the model could not see the pictures, wrote confident
   guesses, and every one was wrong (a menu poster was captioned "a four-bed mixed dorm"). Session 1 could see the
   photographs and wrote `SOUL.md §4` from what is actually in them. **Use it.**
7. **Nothing ships to Mailala without the sovereign.** No page has been sent anywhere; nothing has been promised.

---

## 3 · WHAT IS DONE, AND WHAT IS OWED (measured, not claimed)

**Done and verified:** the site is built and live; SEO is in (title, description, canonical, OG, Twitter, hreflang,
JSON-LD `LodgingBusiness`, sitemap, robots, `_headers`, `_redirects`, PWA manifest + service worker); the WhatsApp
booking path works; the Venue design grammar exists in the Site Builder
(`src/generators/site-builder/src/app.js` → venue grammar, with Mailala as the worked example).

**Owed — do not report these as finished:**
- **No dormitory photographs exist.** The room cards carry the house stripe and a WhatsApp line, and say so.
- **Testimonials are still placeholders** — SOUL-02 says real ones are coming. They have not arrived.
- **18 of the 50 pipeline stages are unbuilt:** gold shimmer, wave dividers, quote-mark cards, Ken Burns hero,
  loading shimmer, room quick-select pills, sticky mobile bar, `fetchpriority`, inline critical CSS,
  prefetch/preload, minification, Lighthouse CI, "Perfect For" badges, urgency strip, live-booked widget,
  sunset/weather widget, preview deploys, `CLOUDFLARE-MANIFEST.md` update.
- **`mailala.com` is a plan, not a measurement** — `wrangler.toml` routes it; nobody has confirmed the DNS or the
  Pages project from outside.
- **The canon site's own gaps** (found by the Video Node's live run against it): the venue's **email is given but
  never linked by their own site**, and the **menu/booking page the industry needs was found nowhere**.

---

## 4 · THE BACKBURNER (ideas parked on purpose — do not start these until told)

Filed as SOUL on the pipeline, deliberately not built. Each is the sovereign's words, verbatim, with the date it
was raised. When one is taken up, it walks the same chain as everything else:
**RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC → GATE.**

> **BACKBURNER-01 — THE COMPARISON DECK** (2026-09-24)
> *"Pitch deck comparison of their current shit page versus our new free website"*

What that means read plainly: a **side-by-side before/after artefact** — the prospect's existing page photographed
as it actually renders, beside the page we built them, in one deck, so the work argues for itself. It is the
proof-of-work theory in deck form: we do not describe the improvement, we put the two pages next to each other and
let the owner judge. It belongs with the free-website offer (`src/offer-desk/` · `src/offers.js`) — the desk already
produces the artefact (`brief.md`, the stills, the contact sheet, the reel); the deck is the missing wrapper that
puts the *before* beside the *after*.

**Not started. Not scoped. No deadline.** Parked because the sovereign parked it.

---

## 5 · HOW TO RESUME (exact steps, in order)

1. Read `src/sites/mailala/SOUL.md` end to end. It is short and it is the law.
2. Look at `src/sites/mailala/material/` with your own eyes (`read`/vision) — nine photographs of the venue, and
   `SOUL.md §4` tells you which is which.
3. Read `src/sites/README.md` for why the wing's build is **not** authority.
4. Fetch the live site and read it — `canon.mailala.pages.dev` — and **compare the truth of it to the canon's
   `MAILALA-UPGRADE-PIPELINE.md`**, whose checkboxes claim 32/50 done. Some of those claims were written by a
   session that could not render the page. Verify before you trust.
5. Take the next stage from the owed list in §3, do it, render the page, **look at it**, and fix what the looking
   finds. That sequence — build, render, look, correct — is the only method that has ever found this site's
   real defects.
6. Update `SOUL.md` only by **appending** the sovereign's new words; never rewrite an old line. Seal, never delete.

---

## 6 · THE HONEST NOTE ABOUT THIS HANDOVER

This file, `SOUL.md` and the nine photographs were written into `src/` by session 1 **because `scratch/` does not
survive a session**. Everything else the first session made for Mailala that still sits in `scratch/` — the reel, the
music, the fetched canon mirrors — will be gone when that tab closes. If you need any of it, it has to be re-made
from a recipe or moved into `src/` first. *A file that is not in `src/` is not in the generator, and a file that is
not in `SRC_SNAPSHOT` is not in the authority.*
