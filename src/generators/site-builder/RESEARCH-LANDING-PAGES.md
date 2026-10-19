# LANDING PAGES — market research (the wing's design law)

Gathered 2026-09-23 for the Site Builder. This is not opinion: every rule below is
sourced, and the last section proves it against sites **we** shipped. The build
engine reads a compressed form of this (see `LANDING_RULES` in `src/app.js`) and
the finished file is **measured** against it (`landingAudit`), because a design
principle that is never checked is a decoration.

---

## 1. What a landing page IS

> "A landing page is a standalone web page with one clear purpose: to get someone
> to take action… a landing page strips away distractions. No menus. No sidebars.
> Just a clean, focused path from interest to action."
> — HubSpot, *How to create a landing page with high ROI* (updated 2025-09-17)

> "A landing page should be focused on just one conversion goal — or else it
> ain't a landing page."
> — Unbounce, *The Anatomy of a Landing Page*

The distinguishing feature is **subtraction**. A homepage offers a map; a landing
page offers a door. Most bad "landing pages" are homepages wearing a hero.

## 2. The five things every converting page has (Unbounce)

1. **A unique selling proposition** — the position, in one line, that makes the
   offer *different and better*, not merely described.
2. **A hero image or video** — showing the *context of use*. Real people beat
   stock; a stock photo that rings false is worse than no photo.
3. **The benefits** — *and* the features, but lead with the benefit. A feature is
   a quality; a benefit is the impact of that quality ("ice cold" → "keeps you
   cool on a hot day").
4. **Social proof** — quotes, case studies, logos, review scores. Two rules: you
   **cannot fake it**, and it must be **specific** (who, what, when — a name and
   a face beats an anonymous rave).
5. **One conversion goal** — a single CTA button (click-through) or a single
   short form (lead-gen). Not two. Never two.

The full anatomy, in order (Unbounce): **headline → supporting headline → hero →
benefits → social proof → sole CTA →** optionally a mid-page *reinforcing
statement* (remind the USP now that they know more) **→** optionally a *closing
statement* that backs the USP and repeats the CTA.

## 3. The nine production practices (HubSpot, 2025 edition)

1. **Lead with a benefit-first headline.** Not a clever phrase. "Plan, Launch and
   Measure Campaigns Faster with These 6 Free Templates" beats "Your Ultimate
   Marketing Toolkit."
2. **Front-load the value.** Offer and CTA visible without scrolling. Treat the
   top of the page as an elevator pitch — short, sharp, outcome-first.
3. **Only ask for what you need.** Every extra field is friction. Name + email for
   top-of-funnel; a phone number killed a fintech page's conversion until it was
   removed.
4. **Remove anything that competes with the goal.** No site nav, no sidebar, no
   secondary CTA. This single change outperformed every copy rewrite.
5. **Make the CTA unmissable.** Contrast, whitespace, action-driven copy
   ("Reserve your spot" ≫ "Learn more"), tested front-and-centre on mobile.
6. **Design for speed.** Compress images, limit animation, no heavy scripts unless
   they earn their place. Fast pages convert, rank, and feel better.
7. **Use proof points to build trust.** Ask: "would I trust this if I had never
   heard of the brand?"
8. **Check the page on real devices.** Phone first — most traffic, most mistakes.
9. **Close the loop with a thank-you page.** A conversion that ends in silence
   wastes the lead.

**CTA copy rule (both sources, in agreement):** specific beats generic.
"Get the guide" / "Reserve your spot" / "Book a free diagnostic" ≫ "Submit",
"Click here", "Learn more".

## 4. Compressed to build rules — `LANDING_RULES`

```
1. ONE goal. The whole page pushes one action; every other link either serves it
   or goes. No nav competing with the CTA (anchors down the page are fine).
2. Above the fold = the claim + the action, no scroll needed. A benefit-first
   <h1>, one supporting line, the CTA.
3. Benefits before features; a feature list alone is not persuasion.
4. Proof must be specific and never faked. If real proof does not exist, write
   copy that is honestly placeholder — never an invented review.
5. One CTA, repeated down the page, always the same action and the same words.
6. Speed: no external assets beyond fonts, few animations, images drawn (SVG/CSS)
   or already local.
7. Mobile first: 390px must be the design target, ≥44px targets, no overflow.
8. The page must end by asking again, and must have a real way to act — a form,
   tel:, mailto:, wa.me, or a booking anchor that works.
9. Never invent a person, a review, a price or a photo attribution.
```

## 5. Proof against our own shipped sites

**The CV (`examples/michael-hobbs-cv/`, live at michael-hobbs.pages.dev/cv)** —
the anti-brochure. No hero image, no CTA, no social proof: it *is* a document, and
that is correct for its goal (be read by a hiring manager). It violates rules 1–4
on purpose and wins by rule 6 (fast, one file, no external asset) and by density.
**A CV is not a landing page**; the wing keeps the CV grammar for CV briefs only.

**The portfolio template (`examples/portfolio-template-violet/` · `-green/`)** —
one template, two palettes, two subjects. Follows the anatomy: hero (the claim) →
capabilities (benefits) → work (proof) → about (trust) → contact (the CTA grid).
The two-palette proof is the point: the *grammar* is what ships, not the paint.

**Mailala (`WEBSITE/mailala/`, live at canon.mailala.pages.dev)** — the case that
taught us the most, because the sovereign corrected it twice:
- SOUL-06, verbatim: *"too dark of a background… the color font looks gay… we
  don't want it to look gay. We want it to look, um, you know, hip and a cool
  place to chill."* → the "dark + neon + tech" house style is **wrong** for a warm
  hospitality venue. Warm cream ground, forest green/gold/crimson, a serif display
  face.
- SOUL-05 (SOV100 dictation): the CTA is not a button, it is **WhatsApp** — the
  way a Bui Vien tourist actually books. The conversion goal is chosen by the
  audience's habits, not by our taste.
- The whole page is one goal (book the room / pre-order the jerk chicken) with
  the phone number and the address repeated as the closing statement.

## 6. What we measure on every build (`landingAudit`)

| check | why |
|---|---|
| `<title>` present (15–70 chars) | the page's one-line promise; SEO + share card |
| `<meta name="description">` present (50–160) | the search snippet |
| `<meta name="viewport">` | mobile-first is not optional |
| exactly one `<h1>` | the claim; two h1s = no claim |
| a CTA element present | a `button`, `.btn`, or an action-verb link |
| an actionable contact path | `tel:` · `mailto:` · `wa.me` · `#book` · a `<form>` |
| social proof signal | quote/testimonial/review/rating/logo words or `<blockquote>` |
| external asset count | 0 beyond Google Fonts (speed + offline) |
| `alt` on every `<img>` | accessibility, and a broken-image meter |
| inline CSS present | it is one file, or it is not offline-capable |

A ✗ is **logged and named**, never silently fixed. Fail closed: an unbuildable
page is reported as unbuildable.

---

## Sources

- Unbounce — *The Anatomy of a Landing Page [Includes Illustrations]* · fetched 2026-09-23 (`scratch/research/unbounce-anatomy.md`)
- HubSpot — *How to create a landing page with high ROI [+ expert and data-backed tips]*, Hannah Harris, updated 2025-09-17 · fetched 2026-09-23 (`scratch/research/hubspot.html`)
- Our own: `examples/michael-hobbs-cv/`, `examples/portfolio-template-violet/`, `examples/portfolio-template-green/`, and the Mailala canon (`CANON/MAILALA-PROMPT-REGISTER.md` · `WEBSITE/mailala/`)
