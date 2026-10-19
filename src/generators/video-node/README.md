# VIDEO NODE — the drop station (role: `video`)

**One job.** Everything a venue has, in one door — **footage, pictures, links, and the owner's own words** — read
in the browser, measured, researched, turned into a blueprint for a first prototype, and **audited, rendered and
perfected by the three hands that actually make the content** before anything is executed.

- **Footage in** → stills, a timecoded contact sheet, **the pulse** (where the life actually is), vertical
  clips cut from the measured peaks, **the vibe in words**, and a reel of the whole drop.
- **Pictures in** → one real video out: a 9:16 reel with motion, crossfades, a sound bed, and **a story sold over
  the top of it**.
- **Links in** → every address fetched live and read **in code**, then cross-checked: what is there, what is
  missing, what their own site never links, and where two pages **disagree**.
- **Words in** → the prompt. **Out** → research, a blueprint, orders for whatever is missing, **the three hands
  run for real**, and **the gate** — a plain answer to *may this be executed?*

Nothing is uploaded, ever: every file is read from disk by the browser, so the editor's ~20 MB chat-attachment cap
simply does not exist in here.

That last part was the ask, verbatim: *"I cannot attach the videos because 20MB is too big? fix that by making
possible in the generator."* A file chosen from disk is read with the File API — a 10 GB file is exactly as
possible as a 10 KB one.

---

## Why it exists in the family

The Site Builder builds the page. This node is the **front door** that supplies it: one vision pass over a
contact sheet returns the whole look of a place in words, and that brief is what the builder takes (`?brief=`, or
the hand-off button). Mailala was built from exactly that move.

But a page is not the only thing a venue needs, and **a picture is not the only thing a build needs**. So the node
grew into the drop station: it reads the whole presence (not just the footage), finds the market's own must-haves
for that industry, writes the blueprint, and then **runs the work rather than describing it** — see
**the three hands** and **the gate** below.

---

## The four doors

| door | what goes in | what comes out |
|---|---|---|
| **1 · video** | one file or a whole folder's worth | the queue (read one at a time, never all in memory) |
| **2 · pictures** | images, dropped or from the stills | the reel's material |
| **3 · links** | every address they have — site, socials, listing, booking page, phone, email — one per line | a live read of each, and **the link audit** |
| **4 · words** | the prompt: what this is, and **what job the page has** | the material everything below is written over |

Door 3's rule, in the UI and in the code: *"A page that will not load is recorded **unread** — never counted as
absent."* An unread page is **unproven**. A page that answers with a login wall or a JavaScript shell comes back
**read-but-thin**, and nothing is claimed from it. A phone number and an email are **ways to be contacted**, not
pages — they are held, not marked unread.

---

## The queue — many videos, one shot

Drop twenty files. Each becomes a queue item with its own object URL and its own `<video>`; **exactly one is
active**, and results are stashed per item. A 4 GB file costs this node exactly what a 4 MB one costs, because
nothing is ever read whole into memory.

**`/sweep` runs the whole queue in one pass.** Per video: read it → stills → **measure the pulse** → stills at the
peaks → the timecoded sheet → (the eye) → clips → its pictures into the reel. Then, once for the whole drop: the
reel, the story over it, and the render.

Two things it deliberately does **not** do:

- it never claims a clip is *"the dancing"*. A clip is cut from a **measured window**, the numbers are printed
  beside it, and the eye's reason is quoted **as the eye's**, separately;
- it never silently skips a file. A file whose metadata never arrives is **skipped and named**, with the reason
  (a background tab defers media loading), and the run carries on with the rest.

---

## The pulse — `src/pulse.js`, the measurement engine

This is the load-bearing new primitive: **what is actually happening in this file, measured.**

| pass | how | what it costs |
|---|---|---|
| **motion** | frame-to-frame luma difference on a ~160 px canvas, a bounded number of samples, seeks that restore the playhead | a few seconds per video |
| **loudness** | an `OfflineAudioContext` pass, 8 kHz mono RMS, one window per motion sample | **gated at 260 MB** file size — and it *says so* when it is skipped |
| **combine** | the two curves normalised against the file's **own** floor and peak | — |
| **pick** | the windows with the most of both | — |

**The stillness floor.** A candidate must clear `max(0.16, best × 0.3)` before it can be called a peak. Fewer
windows than asked for is **reported** (`picks.suppressed`), never padded with dead air: *a file with five seconds
of life in it gets one clip from those five seconds, and says so.*

**The eye names moments in seconds.** The sheet burns each tile's own second into its corner, the vibe
instruction asks for a `MOMENTS:` block, and the picks are parsed and validated — a time that is not on the sheet
is **refused**, and `none` is an accepted answer. Those moments are folded into the clip plan: a named moment near
a measured peak **snaps onto it** and the clip then carries both reasons; one nowhere near a peak is **kept as the
eye's own pick with no number attached**.

And when the eye says *"nothing is happening"* while the pulse **did** find peaks, the node reconciles it out
loud rather than letting the two look like they contradict each other: the eye is looking at **stills**, and a
still cannot show movement.

**Duration recovery.** A `MediaRecorder` WebM reports `Infinity` for its duration. The browser is made to read the
file through and the real length is recovered — without it the pulse and the clips have no timeline at all.

---

## The link audit — in code, with no model in it

Every address is fetched through `superFetch` and read in `src/story.js`. Then `Drop.auditLinks` judges each
channel against five verdicts, and they mean exactly what they say:

```
LINKED                          · GIVEN · NOT LINKED FROM THE SITE
GIVEN · NAMED ON THE SITE, NEVER LINKED   · ON THE SITE, NEVER GIVEN TO US   · ABSENT
```

plus **disagreement detection** — the same phone or address told two ways in two places, which is the one a
customer rings wrongly and never comes back from. The research hand's industry must-haves sharpen it: a channel
*this industry needs* that was found **nowhere** is a different finding from one the owner simply never mentioned,
and the audit can now tell them apart.

Twenty channels are known — site, Instagram, Facebook, TikTok, YouTube, X, LinkedIn, Pinterest, Threads, Google
listing, WhatsApp, Telegram, Zalo, Tripadvisor, Booking site, delivery apps, menu/booking page, email, phone.

---

## The three hands — and the gate

This is the part that answers *"connect with the video, image and copy agents … audit, render and perfect all the
content before the execution."*

**An order** is an asset the prototype needs. Each one is addressed to the hand that can actually make it, and
**each hand is then run, not described**:

| hand | what it is | what it does when it runs |
|---|---|---|
| **image** | `text-to-image-plugin`, called **in this node** | one image per image-order, at a resolution chosen from the slot (banner/hero → 768×512, icon/logo → 512×512, else 768×768) |
| **video** | **this node itself** (`src/reel.js`) | builds the reel from the footage that was cut and **renders a real film**, with the copy burned in |
| **copy** | **the register**, `src/story.js` | writes the page's words in the house voice, over the reel's pictures, and then has its own law checked **in code** |

> There is **no separate "copy agent"** in this family. The register **is** the copy hand. The docs say so rather
> than implying an agent that does not exist.

The hands run **in the pipeline's own order** — image → copy → video — because the copy hand writes over the
pictures and the video hand renders them. Any other order leaves the later hands with nothing to work on.

**Nothing is marked done because a step ran.** Every order is re-audited after the hands have worked, and only a
hand that actually produced something turns its order from a `HOLE` into a `PASS` — quoting what came back
(`HOOK = "Sleep in District 1, from $6.65."`, `made — 768×512 · 133 KB`, `MP4 · 8.9s · read back playable`).

### The gate

The last word, and it is not allowed to be generous:

```
READY TO EXECUTE   ·   NOT YET COMPLETE   ·   BLOCKED
```

- **`FAIL` is narrow on purpose**: it is a fault in **this node's own output** — a claim it cannot stand behind
  (an invented number, a line that had to be withheld), or a file that will not play back. **Only that blocks**,
  because only that can be fixed here.
- **`HOLE`** is work not done — an asset the prototype still needs. The build is not ready, but nothing is wrong,
  and every hole is **named**.
- a **fault in the client's own site** (the email they gave that their own site never links, the Google listing
  nobody can click) is **not this node's fault and does not hold the prototype back** — it warns, and is listed
  under **"FOR THE PROTOTYPE TO FIX"**, which is where it gets done.

The verdict is stated in the log, in the conductor header (`NOT YET COMPLETE`), in the audit panel, in the
downloadable doc (§7), and on the page itself.

---

## The register the copy hand wears — `src/story.js`

`MARKET_STYLE` is a transcription of the station's own marketing register (`src/brand.js` → `MARKET` · `CODEX`,
with GOSPEL 444's voice laws) compressed to the moves that generalise:

- **sell the permission, not the object** — a bed is not a bed;
- give the offer a **two-part identity** it can move between;
- the **three pillars**: only what is actually used · a system that beats willpower · the people around you;
- prove in **three beats**: *mechanism · disruption · outcome*;
- **remove friction** — name the smallness of the ask;
- **diagnose before the offer**: the failure, who built the habit, the reflex, *then* the cure;
- the **three-row comparison**, the **Law of Bilingual Hierarchy**, and the closing form — *one imperative, one
  channel, one reason to move*;
- second person, short, imperative; **CAPS are weight**; no hedging.

**And the register's law is enforced in code**, not trusted to the model — `Story.auditCopy`:

| rule | what it does | verdict |
|---|---|---|
| **RULE 1** | no example from the register's own text may be reused verbatim | the offending beat is **withheld and named** |
| **RULE 2** | **no number the offering does not state** — and with no offering at all, **no digit whatsoever** | withheld |
| **RULE 3** | the `CALL` must carry a **channel** | `HOLE`, not `FAIL`, when nothing was offered to call |

`writeStory` does **one correction pass** quoting the violations back to the model, then **withholds** whatever
still fails. An empty line is honest; a false claim is not. These rules were not theoretical: a live run produced
`CALL: "Message for your FREE assessment."` (the register's language-school example) and
`OFFER: "0 dollars for this look."` (an invented number) before they existed.

**The offering lookup** (`Story.lookup`) fetches a page through `superFetch` and pulls it apart **in that file,
with no model**: title, meta description, headings, list items, money lines, phones (including `wa.me`),
addresses, links — with the address it came from named beside it.

---

## The vision pass — the eye

The contact sheet goes to the vision model and **vibe · art direction · palette · words · one line per tile ·
moments · brief** come back. The model is sent a **downscaled copy** (long edge ≤ 1600, < 3.5 MB) — a 21 MP sheet
was silently refused, measured, not guessed. An echoed template or a *"please provide the image"* reply is
**refused**, never filed as a vibe.

The **`TILES:`** block is the load-bearing part: one line per tile, in reading order, bound to the reel's pictures
in order. That is what lets the story put *its own* line on *its own* picture instead of sprinkling twelve
variations of one idea over the reel.

---

## The two render engines

| engine | when | cost | container |
|---|---|---|---|
| **WebCodecs** (the fast path) | `VideoEncoder` is present | **~5–7× faster than real time** — a 30 s reel writes in ~5 s, whether or not the tab is in front | H.264 + AAC **MP4** (`avc1.42E028` Baseline 4.0, level-checked: `42001f` is level 3.1 and refuses 1080×1920), falling back to VP9 + Opus **WebM** |
| **MediaRecorder** (the fallback) | no WebCodecs | **real time** — the composition plays on the visible canvas into a capture stream | whatever the browser will record |

**Every render is verified**: the finished file is read back through a `<video>` element and the duration and
dimensions a *player* sees are what the node reports — not the encoder's intent.

## `?test` / `/test`

`/test` measures what THIS browser can do — no file needed: MediaRecorder, container, `captureStream`, the vision
pass, the pulse engine, the register, the encoders for this frame size, and a real end-to-end proof: five
synthetic pictures are composed, encoded and read back, with the bytes, the frame count and the wall clock printed
beside them. It also runs the pulse's own stillness-floor self-test (a synthetic spike is found at 26 s of 29 s;
a flat file returns **zero** windows).

---

## Files

| file | what it is |
|---|---|
| `index.html` | the shell. Every id in it is wired in `src/app.js` and nowhere else |
| `main.pjs` | `$meta` + the imports: `ai-text-plugin`, `super-fetch-plugin`, `kv-plugin`, `upload-plugin`, **`text-to-image-plugin`** (the image hand) |
| `src/app.js` | the node: intake, the queue, the sweep, **the drops**, **the conductor**, **the three hands**, **the gate**, the reel composer, the story pipeline, the command face, the ledger |
| `src/pulse.js` | **the measurement engine** — the motion walk, the loudness pass, `combine` / `pick` / `at` / `topFrames` / `thin` / `report` |
| `src/drop.js` | **the drop station** — the channel table, `readUrls`, `auditLinks`, the research, the blueprint, `ordersFor`, the audit, **`gate`**, the doc, the builder brief |
| `src/story.js` | **the copy hand** — the register, the offering lookup/reader, `auditCopy`, `withhold` |
| `src/reel.js` | **the video hand's engine** — timeline, painter, WebCodecs writer, MediaRecorder fallback, muxer, preview, poster, verify |
| `src/styles.css` | the station's theme, unchanged, plus the reel's, the story's, the queue's, the drops' and the gate's blocks |
| `src/cgn-node.js` | the node kit (`role:"video"`), so this node joins the mesh |

## Commands

```
# the queue and the sweep
/sweep             the whole queue in ONE pass (stills → measure → sheet → eye → clips → reel → story → render)
/sweepone <n>      sweep queue item n            /activate <n>   put item n on the stage
/queue             what is queued                /zipall         every still, clip, sheet and reel, zipped
/pulse [n]         measure item n's pulse        /plan [n]       the clip plan, without cutting anything
/test              measure what THIS browser can do (and run the pulse self-test)

# the four doors and the conductor
/links <a b c…>    set the links                 /cross          the link audit, again
/prompt <words>    set the prompt                /research       the research hand
/blueprint         the blueprint                 /orders         ← the three hands: image · copy · video
                                                                (/perfect and /make are the same call)
/audit             the audit                     /gate           may this be executed?
/assemble          the whole conductor in one pass (read → research → blueprint → orders → audit → gate)
/doc               download the blueprint doc    /ship           the brief → the Site Builder

# the footage side, one file at a time
/frames [n]        pull n stills                 /sheet          the contact sheet (tiles timecoded)
/shorts [n] [secs] cut n vertical clips          /vibe           the vision pass (+ one line per tile + moments)
/hand              copy the brief → Site Builder /all            stills → sheet → shorts → vibe
/save              every still, short and the sheet as one zip   /clear   release the file

# the pictures side
/add <url…>        pictures into the reel        /stills-reel    the stills you pulled, into the reel
/reel              render the reel               /preview        play the composition, nothing recorded
/poster            one frame as a JPEG           /clearreel      empty the reel
/lookup <url>      read what the offering is     /story          write the story
/dress             burn the story onto the reel  /sold           lookup → story → dress → render
```

## The limits it states out loud

1. **A background tab gets no media.** Chrome defers `<video>` loading in a hidden document, so a probe stays at
   `readyState 0` with no error. The node reports that in words and offers ↻ Re-probe — it never leaves a spinner.
2. **Recording clips is real time** in the MediaRecorder path and only what the tab can show, so a hidden tab
   writes a still. The WebCodecs path has no such limit. The run's unavoidable cost is **printed before it starts**.
3. **Pictures from another host must allow CORS** or the canvas is tainted and no encoder will read it. The node
   fetches each picture as bytes first (clean), falls back to `<img crossOrigin>`, and only then to a plain
   `<img>` — and if a render fails it says *tainted*, not "failed".
4. **A phone number is not a URL.** Classifying and normalising the **raw** text first is what stops `+84 768 701
   106` becoming four dead websites called `https://0.0.3.0/`. One live run did exactly that; the fix is a comment
   in `src/drop.js` away from the code that caused it.
5. **No number the offering does not state** — and with no offering at all, no digit whatsoever.
6. Everything lives **in the browser**: the reel is encoded locally, the ledger is `localStorage`/kv, and the
   footage is never uploaded. A model's own knowledge is marked `(rule of thumb, not measured)` wherever it
   appears, and the node's thresholds are stated as **the node's own opinion**, not industry law.

## The worked example

One live run of the whole station, against a real venue (`canon.mailala.pages.dev` + its WhatsApp, phone and
email), with two synthetic image orders, one copy order and one video order:

```
links     4 given · 1 page read (1460 words, 29 money lines) · 1 page read (WhatsApp, 190 words)
          the email was GIVEN and their own site never links it → a fault for the prototype to fix
research  "Budget hospitality and food service" · 6 channels this industry needs
          1 of the 6 — the menu/booking page — was found nowhere → the one remaining HOLE
blueprint 6 sections in the running order · 4 image orders
hands     image 2/2 · copy 1/1 · video 1/1
          story: 9 beats incl. CALL "Book now via WhatsApp +84 768 701 106." (a real channel, a read number)
          reel:  MP4 · 8.9 s · 7.9 MB · read back through a <video> as playable
audit     8 pass · 5 warn · 1 hole · 0 fail
gate      NOT YET COMPLETE — nothing is broken, one thing the prototype still needs
          "FOR THE PROTOTYPE TO FIX": Instagram · Facebook · Google listing · Booking site · Email
```

And the earlier footage run: 2 videos → 2 swept, 19 stills, 4 clips, 3 moments named by the eye, one reel
**25.15 MB / 46.7 s / 1080×1920 / 1401 frames**, written in 8.9 s (5.2× real time) and read back as playable.

## Testing this node

The node is mounted into the live station page inside a same-origin `srcdoc` iframe (`#vnFrame`) built by
`scratch/vn-harness.js` — it fetches the node's **real** files over `src/…` (the service worker serves unsaved
`src/` files), strips the shell's own `<link>`/`<script src>` tags, and inlines everything with a bootstrap that
gives the node a `root` carrying the station's plugins. Two things it must do:

- define `window.root` **before** the node's scripts run, and
- **convert cross-realm Blobs** before they reach the vision plugin — `ai-text-plugin` brands its image part with
  `instanceof Blob`, and an iframe `Blob` fails that test in the parent realm, so the model otherwise literally
  receives `[object Blob]`.

The iframe is destroyed by any page reload; the recipe is re-run with `await build()`, which **also picks up
edits to the node's files without reloading the page**. Use `window.VideoNode` to drive it: `setPrompt`,
`setLinks`/`readLinks`, `assemble`, `setOrders`, `perfect`, `gate`, `auditData`, `gateData`, `status`.
