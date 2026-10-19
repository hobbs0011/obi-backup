# examples/ — the wing's worked examples

Real sites that shipped. They are here for two reasons: **the design is the asset** (the Site Builder
starts from a proven shape, not a blank prompt), and **the record of what already exists** belongs with
the machinery that would otherwise rebuild it.

All three were fetched from the ONE authority
(`Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`, branch **`canon`**, 2026-09-22). The CV is written
here byte-for-byte; the two portfolio examples are **redacted templates**, not the originals — read
BRAND.028 below before you use them.

| example | origin (canon) | live | what it is |
|---|---|---|---|
| `michael-hobbs-cv/` | `APPS/PAGES/michael-hobbs/` | `https://michael-hobbs.pages.dev/cv` | the CV — Profile · Work Experience · Voice Work · Qualifications · AI & Game Development · References, dark, in the NET brand. Plus `linkedin-blueprint.md`, its sibling document |
| `portfolio-template-violet/` | `STUDENT-WEBSITES/quan/index.html` | — (repo + this generator) | **the personal-portfolio grammar in violet** — hero → six capability cards → three work tiles → about → contact. Written for a 3D-artist subject. |
| `portfolio-template-green/` | `STUDENT-WEBSITES/quang/index.html` | — (repo + this generator) | **the same template, green, a different subject** (marketing). Two subjects on one design is the useful part: a template is a template because it survives a second subject. |

## What is byte-exact, and what is not

- **`michael-hobbs-cv/`** is the live `cv.html` with **one character-level fix**: the stylesheet link
  `../style.css` (correct on the multi-page site, dead in a folder that holds one page) is now
  `style.css`. The CSS itself is byte-exact. It is the sovereign's own name and own contact address
  (`MrMichaelHobbs@gmail.com`, already public on the live CV and in the GitHub handle) — **not** client
  or student data, so BRAND.028 does not apply to it and nothing here is redacted.
- **`portfolio-template-violet/`** and **`portfolio-template-green/`** are the shipped portfolios with
  **every personal identifier replaced by a `{{TOKEN}}` placeholder** — see the redaction note below.
  Everything else (every layout rule, every colour, every word of copy that is not an identifier) is
  byte-exact. Their only outbound links are placeholder social URLs.
- **Not vendored, on purpose:** the CV's site siblings (`story.html`, `method.html`, `results.html`,
  `testimonials.html`, `prais.html`, `connect.html`, the site's `index.html`, `assets/portrait.jpg`) and
  the whole `hobbs-english/` twin of the same CV. This folder is the **artwork**, not a mirror of the
  site — the complete source stays where it belongs, on the canon.
- The **CV's own site** (`michael-hobbs.pages.dev`) is deployed from the canon branch; its sibling pages
  still need that deploy to be read live. Nothing here is a substitute for the authority.

## How the Site Builder uses them

`src/generators/site-builder/src/app.js` builds from a brief every time — nothing is hard-wired to these
files (its `Shape()` step picks the *deliverable*, not the artwork). They are the **quality bar and the
shape library**: a CV-shaped brief can be answered in the `michael-hobbs-cv` grammar (labelled bands, a
dark ground, one accent), a personal-portfolio brief in the violet/green portfolio grammar (hero → six
capability cards → three work tiles → about → contact). The plan step reads these shapes; the build
writes fresh HTML for the actual subject.

**They are also the wing's living test:** open any of the three in a browser and the design is the
proof — flat files, no build step, no framework, no network except Google Fonts. That is the same
contract the Site Builder promises. (The templates render with literal `{{NAME}}`-style tokens in place
of the identifiers — that is the point, not a bug.)

## BRAND.028 — applied, not flagged

BRAND.028 says **no client or student data in public source**. This folder is inside `src/`, which
becomes public when the generator is saved. As first brought in on 2026-09-22, the two portfolio
examples carried **two students' names, their city, one employer, and their email addresses** — student
data in public source. That is now **redacted** (remedy 1 below), because the law is the sovereign's own
data in public source. That is now **redacted** — the first of the two remedies considered — because the
law is the sovereign's own and the design is the asset that has to survive, not the names.

**What was replaced, and with what** — the placeholders are a template vocabulary; a builder swaps them
for the real subject:

| token | stood for | where |
|---|---|---|
| `{{NAME}}` | the full name | `<title>`, meta description, footer |
| `{{FIRST}}` · `{{LAST}}` | the two halves | the hero `<h1>` |
| `{{INITIAL}}` · `{{INITIALS}}` | the monogram | the hero avatar, the nav logo |
| `{{EMAIL}}` | the contact address | the contact card (`href` and label) |
| `{{CITY}}` | the city | the meta description, the tagline, About, the Location fact |
| `{{EMPLOYER}}` | the employer | About, one project card, the Experience fact |

The tokens are descriptive on purpose — a builder reading the file knows what each one wants. **One known
cosmetic artifact:** a real monogram is one or two letters, so `{{INITIAL}}` (11 characters) wraps inside
the 140 px hero avatar circle instead of sitting in it. It is the placeholder being longer than the thing
it stands for, not a broken layout — put a single letter in and the circle is exactly as designed. The
design rules are otherwise untouched (no CSS was edited to make the tokens fit; that would have changed
the template to suit the redaction).

The redaction is **one pass to reverse**: the unredacted originals are `STUDENT-WEBSITES/quan/index.html`
and `STUDENT-WEBSITES/quang/index.html` on the canon branch — read them there. Nothing was lost and
nothing was rewritten in place; the canon is untouched. (The alternative remedy — move these out of
`src/` entirely — was not taken, because then the shape library would not ship with the builder at all.)
