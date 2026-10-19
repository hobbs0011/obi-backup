# THE OPEN SOURCE PLAY — take the seat nobody sat in

**Written 2026-09-24. Every number in this file was read from a live endpoint on that date and can be
re-read at any time with `/market scan`.** The recon engine is `src/market.js`; the index artefact is
`src/marketing/awesome-perchance.md`. When a number here moves, `/market scan` is the authority and this
file is what gets rewritten.

---

## The thesis

The station's whole product is **already open source** — on Perchance a generator publishes its source
by existing. So the open-source market is not somewhere the estate has to go; it is a market the estate
is already standing in, and has never indexed, never priced and never claimed.

The measurement says the market is **empty at the top**:

| what was measured | endpoint | 2026-09-24 |
|---|---|---|
| repositories mentioning Perchance | GitHub search `perchance` | **271** |
| the field's most-starred project | GitHub search `perchance` | **69★** — `eeemoon/perchance`, an unofficial Python image API |
| repositories that build *on* the platform | GitHub search `perchance generator` | **40**, leader **14★** |
| an index of this market | GitHub search `awesome perchance` | **0** — it does not exist |
| the adjacent market everyone else fights over | GitHub search `ai website builder` | **3,216**, leader **4,218★** |
| the second empty niche | GitHub search `ai lesson plan generator` | **105**, leader **6★** |
| the package namespace | npm search `perchance` | **7** packages; bare `perchance` is **taken** by an unrelated JS maybe-monad |
| the field's own package | npm downloads API | **18 downloads/week** |
| demo spaces that exist | HuggingFace spaces API | **6**, carrying 0–1 likes |
| the giant list | GitHub search `awesome selfhosted` | **321,321★** — and **closed** to this estate |

There is no framework, no full application and no delivery toolkit in the field at all. The Perchance
open-source market is image wrappers, a desktop client, a character database, an abandoned Python
reimplementation of the engine, and a handful of userscripts. **Its leader has 69 stars.**

The play is therefore not "enter a market". It is:

> **Take the seats nobody sat in — the INDEX, the REFERENCE IMPLEMENTATION and the ON-RAMP of the
> market the estate already lives in — and convert the attention with the one thing no project in the
> field has: an offer.**

---

## The market the estate refuses

**`ai website builder` — 3,216 repositories, 4,218★ leader (`zhayujie/bot-on-anything`), and an
established commercial tier.** A field that deep is won with a marketing budget, not a README. The
estate declines it **with a number instead of a mood**, and takes the seats beside it where nobody is
standing. Declining a market in writing, before spending on it, is the cheapest decision in this file.

---

## The three seats

### 1 · The index — where the market has no front door

**Evidence:** `awesome perchance` matches **zero** repositories. A 271-repository market with no index.

**The play:** publish the canonical index, populated with the real repositories and their real star
counts, and the station at the top as the reference implementation. Whoever indexes a market owns its
entrance. An index is the cheapest, most durable and most linkable artefact in open source: it earns
stars and backlinks on its own, every future project in the field lands in it, and every entry is a
future relationship.

**The artefact is written and ready:** `src/marketing/awesome-perchance.md` — 25 entries across seven
sections, real star counts, a name-collisions section, a five-point entry bar, and CC0 so it can be
copied and mirrored freely.

### 2 · The reference implementation — where the field has no system

**Evidence:** the niche leader is an unofficial image API at 14★; the market leader overall is a Python
image API at 69★. Nothing in the field is an *application*.

**The play:** publish the station itself as a Perchance application — README, LICENSE, topics
(`perchance`, `generator`, `ai`, `command-station`), the live demo pinned at the top, the offer in the
footer. The estate would be the first project in the field that is a **system** rather than a wrapper.

**The package:** extract the one genuinely reusable primitive the estate holds — `src/relay.js`, which
hashes a tree, content-addresses it, delivers it idempotently and then **re-fetches and re-hashes every
URL it wrote** to prove the delivery happened. That is a small, real, useful library, and it ships
scoped (`@phoenixrising/*`) because the bare npm name is taken.

### 3 · The second empty seat — where the estate already ships the product

**Evidence:** `ai lesson plan generator` — 105 repositories, leader **6★**.

**The play:** the estate already has the product for this seat — a parsed curriculum (grades 1–9), a
lesson forge that validates against a written standard (LSN-1…23), a student evaluator with a
transcription desk, and a real teaching practice behind it. Publish the teaching engine as its own
repository, with the standard as the README. Two empty seats, one playbook.

---

## The assets the estate already holds

- **The station itself** — a working, self-editing, mesh-capable Perchance application with public
  source. Nothing at this tier exists in the field.
- **`src/relay.js`** — tree digest + content-addressed idempotent delivery + verification. Package-able
  as it stands.
- **`src/offers.js` (the offer desk)** — the funnel. A free website is the CTA no open-source project in
  the field has; applause is not a business, a claim is.
- **The curriculum, lesson forge and student evaluator** — the product for the second empty seat, already
  built and already validated against a standard.
- **`src/brand.js`** — 93 drawn icons, 30 marks, a complete identity system. It is the visual bar the
  field cannot meet, and it makes every README the estate publishes look finished instead of abandoned.

---

## The channels, and the first move in each

| channel | measured | the first move |
|---|---|---|
| GitHub — the index | 0 repositories | publish `awesome-perchance` **first**. It links to everything else; everything else links back to it. |
| GitHub — the market | 271 · leader 69★ | publish the station repo: topics, live demo pinned, offer in the footer. |
| npm | 7 packages · 18 dl/week | ship the scoped primitive. An 18-downloads-a-week field has **no incumbent** — that is the opportunity, not the excuse. |
| HuggingFace Spaces | 6 spaces · 0–1 likes | one static Space embedding the station: the cheapest permanent demo URL in the market, on a domain the field already browses. |
| awesome-selfhosted | 321,321★ — **CLOSED** | **refused by the evidence**: the station is platform-hosted and is not self-hostable, so it does not qualify. Named as a gap, never faked. A self-hostable build would open it, and that is a roadmap item, not a promise. |
| Reddit | **BLOCKED — HTTP 403** | the endpoint refused this origin, so **no reach claim is made**. The move is still specified — post the *recon*, not the advert, to r/opensource, r/selfhosted, r/SideProject, r/edtech, r/Teachers — and it becomes measurable the day a channel answers. |
| Show HN · Product Hunt · dev.to | **unmeasurable from this origin** | declared unmeasured rather than guessed. The recon itself is the content: *"I measured a 271-repository market; its leader has 69 stars"* is a genuine Show HN title, and it is true because it was measured. |

---

## The sequence

1. **Publish the index** (`awesome-perchance.md`). The front door, first, before anything it points at.
2. **Publish the station** as the reference implementation: README, LICENSE, topics, live demo pinned,
   offer in the footer.
3. **Extract and publish the primitive** (the relay's tree digest + idempotent delivery) as a scoped
   package.
4. **Publish the teaching engine** for the second empty seat, with the lesson standard as its README.
5. **One static Space** embedding the station — a permanent demo URL on a domain the field browses.
6. **One writeup of the recon itself**, published where builders read. The measurement *is* the
   marketing, and it is honest by construction — no invented traction, no fake launch.
7. **The funnel.** Every README, Space and post ends at the offer desk. Attention without an offer is
   just applause.

---

## The KPIs — what the next scan measures

- stars and forks on the estate's **own** repositories (the index and the station);
- npm weekly downloads for the scoped package;
- Space likes, and inbound pull requests to the index;
- **offer-desk claims attributable to an open-source referral** — the only KPI that is actually money;
- **the market's own leader star count.** The day the station passes 69 stars, the seat is visibly
  taken, and `/market` will print it.

---

## The gaps, declared

A play that hides its holes is a brochure, not a plan.

1. **Reddit is BLOCKED (403) from this origin** — community reach is unmeasured, not zero.
2. **Show HN, Product Hunt and dev.to cannot be measured from this origin at all** — declared, never
   guessed, with the move specified anyway.
3. **`awesome-selfhosted` is shut** — the station is platform-hosted. A self-hostable build would open
   321,321 stars of reach; until then the door stays honestly closed.
4. **The bare npm name `perchance` is taken** — the package ships scoped.
5. **The platform gives an embedded generator no write path to its own listing.** The station can write
   every artefact in this file; it **cannot open the doors**. Creating the repositories, publishing the
   package and posting the writeup are the sovereign's moves — that is a real dependency, stated
   plainly rather than buried.
