# THE STUDENT PORTAL PIPELINE — the portals picked apart, one generator per part

> **Order, verbatim (2026-09-26):** *"now pick them all apart and assign them to a blue print pipeline of
> generators to make here"* — after the SWEEP of the live portals ("/phoenixscout all student portals and obi
> magic chat on all repos and on cloudflare").
>
> **What this file is.** The decomposition (every live student portal, taken apart into its parts) and the
> assignment (each part → one generator, ordered into a pipeline, with the generator to make HERE named and
> its status said honestly). Nothing here is claimed as built. The shelf (`src/divisions.js`) carries the same
> list under NET, group **STUDENT PORTAL PIPELINE**, so the pipeline is visible in the station.

---

## §1 — WHAT WAS PICKED APART (measured, not remembered)

Everything below was read live on 2026-09-26 with the credentials the sovereign supplied (Cloudflare account
`3c7b1766…`, GitHub `hobbs0011`, 13 repos). Every number is a measurement.

> **AUDIT 2026-09-26 (re-measure).** Every row below was re-probed against the live Worker and the canon, and
> the first pass was corrected where it was wrong: the route slug is BARE (`quan`, not `quan-bluetech`);
> three students have their full sub-page set, not just a profile; the dead-link count is **eight**, not
> twenty; the career page is missing on only **two** of five; `/api/employer/auth` is **live**. Flags 8–10
> are new. A map that shows absence where it means *unmeasured* is the exact defect this file exists to kill,
> so the corrections are made here rather than footnoted.

### The five live student portals (single-file dashboards on the `net-pet-ai` Worker)

The route slug is BARE (`quan`); `quan-bluetech` is the API `studentId`. The two are not interchangeable —
the pages live at `/<slug>-portal`, the data at `?studentId=<slug>-bluetech`.

| student | route slug | dashboard | profile | methodology | transcripts | action-plan | career |
|---|---|---|---|---|---|---|---|
| Quan | `quan` | 83,250 B | 21,155 B | 18,718 B | 19,245 B | 25,622 B | **404** |
| Quang | `quang` | 85,509 B | 22,519 B | 24,807 B | 16,738 B | 32,737 B | **404** |
| Huong | `huong` | 39,248 B | 30,196 B | 31,435 B | 33,652 B | 31,264 B | 34,702 B |
| Mai Tram | `mai-tram` | 60,307 B | 30,193 B | 31,654 B | 30,442 B | 31,241 B | 35,628 B |
| Quy | `quy` | 70,145 B | 30,082 B | 31,890 B | 28,809 B | 31,385 B | 33,608 B |

Served at `https://net-pet-ai.mrmichaelhobbs123.workers.dev/<slug>-portal` (and `-profile`, `-methodology`,
`-transcripts`, `-action-plan`, `-career`). Two more live surfaces belong to the same set:
**`/employer-portal.html`** (10,315 B) and **`/pitch-deck.html`** (37,809 B — "NET by OBI — Lesson 1").
**`/magic-chat?studentId=<slug>`** is the student's voice door.

### The parts, named

**The portal (dashboard)** — login / set-password; four stat cards (Tiger Score · Streak · Sessions · Next
Session); Day-1 steps (45 min Listen · 15 min Talk to OBI); the **word wall** (Mastered Words · Current Streak ·
Level Progress bar); Today's Mission; My Goal; Daily Work Log; Action Plan — Today; Coach Note; Current Level
(A1→A2 ladder); **Phonics Track**; **Last Class** (per-part audio players); Class Review — This Week; Homework
Notes; Quick Access (Chat with OBI · Transcripts · Action Plan).

**The Profile** — Student DNA · Evolution (Before → Now) · Focus Areas · Key Quotes · Vocabulary Snapshot.

**The Methodology** — the method · career setup as the engagement vehicle · the framework built in class ·
mental models.

**The Action Plan** — Current Sprint · Upcoming Milestones · English Focus · Coach Note.

**The Transcripts** — the session archive (with the class audio behind it).

**The Chat (OBI)** — two modes (study · phonics); a voice agent (Deepgram); onboarding state machine
(intro → city → level → goal → chat → wrap); the Vietnamese rescue rope (English ×3, then a hint, then back to
English); struggle tracking; crisis detection *before* any lesson logic; an HMAC student token; memory
(`/api/memory`); session metrics (turns · duration · vocabulary · average turn length · barge-ins); phonics
hints derived from the transcriber's low-confidence words; the tiger-win.

**The Employer portal** — auth + a dashboard; thin (one endpoint: `/api/employer/auth`).

**The Pitch deck** — nine beats: the problem · the method · how OBI works · Lesson 1 arsenal · progress ·
3-month transformation · built for BlueTech · Day 1 starts now · wake up the Tiger.

### The API surface the portals actually call (the worker's real contract)

`/api/student/{checkpw, setpw, checkin, saveface, state, lang, streak/:id, forecast/:id}` ·
`/api/phonics/advance` · `/api/tasks/log` · `/api/practice` · `/api/employer/auth` ·
`/api/{onboarding, chat, memory, tts}` · `/api/netpet/checkin` · `/health` ·
`/student/{resolve, create}`.

**All POST except `/api/student/state` and `/health` (GET).** A GET against a POST route 404s — which is how
the first pass mis-called `/api/employer/auth` dead. Verified live: `checkpw` → 400 `studentId and pw
required`, `tasks/log` → 400 `taskId, studentId, date required`, `netpet/checkin` → 200, `onboarding` → 200
with a `studentToken`, `employer/auth` → 400 `employerCode and pinHash required`.

### Flags carried out of the dissection (all measured)

1. **Two dashboards' sub-page links are broken.** Quan and Quang link UPPERCASE (`QUAN-profile`,
   `QUANG-profile`, …); the Worker serves lowercase. Measured: `QUAN-profile` → 404, `quan-profile` → 200.
   Two students × four sub-page links = **eight dead links** (not twenty). Huong, Mai Tram and Quy already
   link lowercase and every one of their links resolves.
2. **The career page is missing on two of five.** `quan-career` and `quang-career` → 404; Huong, Mai Tram
   and Quy each have a live career page (34,702 · 35,628 · 33,608 B).
3. **`/api/employer/auth` is LIVE, not missing** — a POST route answering `400 employerCode and pinHash
   required` with no arguments. The employer portal's problem is its inputs, not a missing endpoint.
4. **Two realities for two workers:** `net-pet-ai` serves the portals; `net-pet-ai-production` 404s every
   portal and its `/health` answers `ok:false`. (`ai: DEAD` was not re-observable in the static chat HTML —
   that status is rendered at runtime.)
5. **Quan and Quang appear twice in the canon** — NOT re-walked: there is no `deactivated/` under
   `STUDENT-WEBSITES/` or `NET-STUDENTS/` (both 404). Where the second copy is printed is UNCONFIRMED.
6. **The station's own `src/generators/student-portal/` is a shell** — its `index.html` points at
   `src/styles.css`, `src/app.js`, `src/cgn-node.js`; none exists in that folder. HELD.
7. **The canon's `CANON/SYSTEM/STUDENT-PORTAL-MAP.md` is stale** — 525 B, it lists six students and calls
   Lam `LIVE` (the Lam portal 404s; `SITE/lam.html` does exist). It DOES name Quan and Quang (as
   `STUDENT-WEBSITES/quan/`); the real drift is that it maps repo paths, never the live route.

### Flags the 2026-09-26 audit added

8. **Quan's and Quang's sub-pages ship FENCED.** All eight open with a literal markdown fence (```` ```html ````)
   before `<!DOCTYPE html>`, so the page renders a stray fence line. Huong's, Mai Tram's and Quy's are clean.
9. **The Worker's KV read quota is exhausted.** `/api/phonics/advance` → `500 {"error":"KV get() limit
   exceeded for the day."}`; production `/health` → `ok:false`. Anything that reads KV will 500 until the
   daily counter resets.
10. **`/api/chat` → `500 Internal Server Error`** on the live worker.

### Where the source lives (13 repos swept)

| repo | portal paths | magic-chat paths |
|---|---|---|
| `OB-1--Authoritative-` (canon, 20,297 files) | **24** — incl. `CANON/SYSTEM/STUDENT-PORTAL-MAP.md`, all `*-portal.html`, `test/portal-reachability.mjs`, and the station's own `OPERATIONS/COMMANDSTATION/perchance/src/{generators/student-portal,timmy-portal}/` | **22** — incl. `APPS/PHOENIX-EMPIRE-DEV/src/magic_chat_endpoint.js` (the multi-provider router) |
| `OB-1` (7,366 files) | **14** — `build_bluetech_portals.py`, the four `*-parent-portal.html`, `PROJECTS/NET-PET-AI/src/handlers/portal-handler.ts` | **17** — incl. `PROJECTS/NET-PET-AI/src/magic-chat-router.js` |
| `Phoenix-Rising-Ultimate` (4,582) | 0 | **11** — canon docs + `APPS/NET-PET-AI/public/{magic-chat.html, chat.js}` |
| `net-tiger-assessment` | 1 (`classroom.html`) | 0 |
| the other nine repos | 0 | 0 |

---

## §2 — THE ASSIGNMENT: one generator per part

Twelve pieces. Four already exist here; eight are to be made. Each one reads the **same record** (`intake/1`),
so a part can be regenerated for a different student without re-teaching it anything.

| # | GENERATOR | THE PART IT OWNS | IN | OUT | HERE |
|---|---|---|---|---|---|
| 0 | **The Intake** (`the-intake`) | the student's record: who, the promises, the evidence | a lesson recording / the tutor's notes | the `intake/1` record | **BUILT** (`src/intake.js`) |
| 1 | **The Student DNA** (`portal-dna`) | Profile — DNA, evolution before/now, focus areas, key quotes, vocabulary snapshot | the record + the transcripts | `profile` page | **TO MAKE** |
| 2 | **The Method** (`portal-method`) | Methodology — the method, the vehicle, the framework, the mental models | the record + the lesson doctrine | `methodology` page | **TO MAKE** |
| 3 | **The Evidence** (`portal-evidence`) | Transcripts + the class audio library (per-part players) | the recordings the station already transcribes | `transcripts` page + audio parts | **TO MAKE** (the transcription engine exists: `src/transcribe.js`, `src/audio-split.js`) |
| 4 | **The 44** (`phonics-44`) | Phonics Track — the 44 sounds, the drills, `phonics/advance` | a recorded sitting, marked by hand | the phonics track + drill list | **BUILT** (`src/generators/phonics-44/`) |
| 5 | **The Practice** (`portal-practice`) | the word wall, SRS, `tasks/log`, `practice` — what the student actually drills | the record's filed evidence | drills + the SRS window per word | **TO MAKE** (node `node.practice` is already planned) |
| 6 | **The Weekly Presentation** (`presentation-coach`) | the recorded speaking run — the 5 beats, one correction | a weekly recording | the run log + the reading sheet | **BUILT** (`src/generators/presentation-coach/`) |
| 7 | **The Plan** (`portal-plan`) | Action Plan — current sprint, milestones, English focus, coach note | the record + the review | `action-plan` page | **TO MAKE** |
| 8 | **The Chat** (`portal-chat`) | the OBI voice agent — modes, onboarding, rescue rope, memory, check-in, crisis-first | the student + the record | a session (turns, vocab, metrics) filed as evidence | **TO MAKE** (the Cloudflare implementation is real: `chat.js` + `magic_chat_endpoint.js`) |
| 9 | **The Portal** (`student-portal`) | the door — the dashboard that assembles 1–8 and the quick links | the record | one student's site | **SCAFFOLD** (`src/generators/student-portal/`, shell only) |
| 10 | **The Witness** (`portal-witness`) | the employer + parent view | the record, read-only, per role | `employer` / `parent` dashboard | **TO MAKE** (the live employer portal is 10 KB; `/api/employer/auth` is live but POST-only and needs `employerCode` + `pinHash`) |
| 11 | **The Pitch** (`portal-pitch`) | the Lesson-1 deck (nine beats) | the record + the offer | one self-contained `.html` deck | **TO MAKE** (Marketing's deck machinery fits: `src/brand.js`) |

**The pipeline, in one line:**

```
Intake → DNA → Method → Evidence → 44 → Practice → Presentation → Plan → Chat → Portal → Witness → Pitch
 (record) (who)  (how)   (proof)   (sound)(drill)   (speak)      (next)  (voice) (door)  (others) (sell)
```

**The endpoint contract, assigned.** Each generator owns its share of the API the portals already call, so the
new builds speak the same language as the live ones:

- `portal-dna` → the profile read (`/api/student/state` feed)
- `portal-evidence` → the transcript + audio parts
- `phonics-44` → `/api/phonics/advance`
- `portal-practice` → `/api/tasks/log`, `/api/practice`, the word wall
- `portal-plan` → `/api/student/forecast/:id`, `/api/student/streak/:id`
- `portal-chat` → `/api/{onboarding, chat, memory, tts}`, `/api/netpet/checkin`
- `portal-portal` → `/api/student/{checkpw, setpw, checkin, saveface, lang}`
- `portal-witness` → `/api/employer/auth` (and a parent role beside it)

---

## §3 — WHAT GETS FIXED ON THE WAY (the flags, assigned to a stage)

| flag | fixed by |
|---|---|
| eight dead sub-page links (case mismatch — Quan and Quang only) | **The Portal** — the door builds its links from the record's slug, not from a hand-typed capital |
| the career page missing on Quan and Quang | **The Pitch** / a `portal-career` split — or the link is dropped; not both |
| Quan's and Quang's sub-pages ship fenced (` ```html `) | **The Portal** — the page is written without a markdown fence around it |
| the Worker's KV daily read quota (`/api/phonics/advance` → 500) | not a generator — an operational limit on the live Worker; flag stands |
| production `/health` `ok:false`, portals 404, `/api/chat` 500 | a deploy decision, not a generator — flag stands |
| Quan/Quang twice in the canon (location UNCONFIRMED) | **The Intake** — one record, one slug |
| the station's portal shell points at files that do not exist | **The Portal** — build `styles.css` · `app.js` · `cgn-node.js`, or inline them as the role crates do |
| `STUDENT-PORTAL-MAP.md` maps repo paths, never the routes | **The Portal** — the map is generated from the records, never hand-written |

---

## §4 — BUILD ORDER (the first three)

1. **The Portal** (`student-portal`) — because it is the assembler: build it and the eight parts have a home,
   and the door can be pointed at the records that already exist (Quan, Quang).
2. **The Student DNA** (`portal-dna`) — the profile is the highest-value part per byte, and it is pure record →
   page work with no model calls.
3. **The Chat** (`portal-chat`) — the hardest part, but its Cloudflare implementation is proven, so it is a port,
   not an invention.

**The rule every stage keeps:** the generator writes to the record, and the record is the only input to the next
stage. A part that cannot be regenerated from the record is a part that was hand-built, and hand-built parts are
how the dead links happened.
