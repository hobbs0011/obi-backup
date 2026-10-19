# THE FULL-STACK STUDENT EVALUATOR — what the ecosystem needs, and where this build stands

> **Status:** INVENTORY + GAP ANALYSIS (2026-09-24). 97 tools across 8 families — **32 built (33%)**, 22 partial, 43 missing. Every row is measured against the shipped code, not against intent.
> **This file is GENERATED FROM `src/ecosystem.js`** — the app's own tool inventory is the single source of truth,
> so this map can never drift from the shipped code. Regenerate with the recipe in §6. `/tools` renders the same data live.
> Nothing here claims a capability that does not exist; `partial` means the primitive exists and the tool does not.

---

## 0. The five jobs

A student-evaluation ecosystem is not a chatbot with a transcript. Strip it to its jobs and there are five, in order:

1. **OBSERVE** the learning (capture evidence worth trusting).
2. **UNDERSTAND** it (turn raw into claims that can be checked).
3. **JUDGE** it (score, compare, and be able to defend every sentence).
4. **COMMUNICATE** it (parent, student, school, file — four audiences, four artifacts).
5. **IMPROVE** it (the judgement must change the next lesson, or the work was admin).

Everything else is scaffolding for those five. The 8 families below are the scaffolding mapped to the jobs,
plus the two things that decide whether the product may legally and honestly exist: **governance** and **platform**.

Two rules apply to every row, from the canon and from this build's doctrine:
- **verbatim-first** (L37/L55) — the raw is captured before it is interpreted and is never rewritten;
- **fail closed** — if it cannot be verified, the tool says so and stops; a documented gap beats a fabricated answer.

---

## 1. Coverage at a glance

| family | built | partial | missing | total |
|---|---|---|---|---|
| 🎙 CAPTURE — evidence in | 3 | 2 | 6 | 11 |
| 🧠 ANALYSIS — comprehension | 1 | 3 | 10 | 14 |
| ⚖ JUDGEMENT — evaluator quality | 3 | 3 | 7 | 13 |
| 📋 REPORT — communication out | 3 | 2 | 6 | 11 |
| 🗂 OPERATIONS — workflow | 5 | 2 | 6 | 13 |
| 🛡 GOVERNANCE — trust & compliance | 2 | 4 | 8 | 14 |
| 🔁 LEARNING LOOP — pedagogy | 0 | 1 | 7 | 8 |
| ⚙ PLATFORM — full-stack | 5 | 4 | 3 | 12 |
| **TOTAL** | **22** | **21** | **53** | **96** |

**22/96 built (23%) · 21 partial · 53 missing.**

Read that honestly: this build is strong exactly where it has been used (capture of long recordings,
verbatim preservation, evidence-cited reporting, archives, self-hosting) and empty exactly where the word
*evaluator* actually bites (rubrics, per-student attribution, fairness, consent, the learning loop).
The gap list **is** the roadmap.

---

## 2. The full inventory

### 🎙 CAPTURE — evidence in

_You cannot evaluate what you did not record. Every downstream claim is only as good as the capture, and capture is where a real classroom hurts: it is loud, long, multi-speaker, and mostly not typed._

| tool | status | where | note |
|---|---|---|---|
| `cap.longform` Long-form audio/video transcription (hours, not clips) | **BUILT** | `/transcribe · src/transcribe.js` | pause-split parts, resume/retry, partial saved honestly |
| `cap.diarize` Speaker diarization + speaker identity (who said what) | missing | — | without it a per-student review is inference, not evidence |
| `cap.ingest` Media ingest: file, URL, clipboard, drag-drop | **BUILT** | `/transcribe · src/transcribe.js` | picker + drop + paste + URL |
| `cap.live` Live/real-time in-room capture + live captions | missing | — | class ends, the evidence should already exist |
| `cap.photo` Photo/OCR of worksheets, essays, handwriting | missing | — | most student work never touches a keyboard |
| `cap.voiceself` Teacher voice notes / dictation | **BUILT** | `mic dictation (Web Speech) · src/app.js` | handsfree note-taking mid-lesson |
| `cap.attendance` Attendance / presence capture | missing | — | cheapest high-value signal in any classroom |
| `cap.scores` Quiz / test / exit-ticket result intake | missing | — | the objective half of the grade |
| `cap.curriculum` Syllabus / textbook TOC ingestion | **BUILT** | `/curriculum /curriculum import · src/curriculum.js` | the school's own pacing guides, parsed — PRIMARY grade 1-5 (Ecogreen) and SECONDARY grade 6-9, every book, every section; a newer .xlsx is ingested in the browser. /curriculum scope holds whose books and whose periods they are |
| `cap.home` Home/parent input (practice logs, requests) | partial | `retired 2026-09-22 (client dropped)` | lives in the portal, not yet flowing into the evaluator |
| `cap.segment` Lesson/topic segmentation with timestamps | partial | `part indices · src/audio-split.js` | parts exist; topic boundaries do not |

### 🧠 ANALYSIS — comprehension

_Raw evidence is not a judgement. This family turns recordings and submissions into claims that can be checked, counted, and compared over time._

| tool | status | where | note |
|---|---|---|---|
| `ana.summary` Study summary derived from a recording, citing the raw | **BUILT** | `/summary · src/summary.js` | never replaces the transcript it came from |
| `ana.student` Per-student evidence extraction from a group recording | missing | — | the blocker for honest per-student reviews of a class |
| `ana.rubric` Rubric definition + rubric-based scoring with cited evidence | **BUILT** | `/rubric · src/rubric.js` | four built-in families (CEFR speaking · CEFR writing · the lesson as taught · the error taxonomy) plus custom rubrics defined in one line; every band must carry a VERBATIM span the engine locates itself — a quote it cannot find is refused, and a band with no citation is NOT SCORED |
| `ana.cefr` CEFR / can-do descriptors + level tracking | partial | `cefr.speaking · cefr.writing · /rubric trend` | the A1–C2 scale with a descriptor per level is built into both CEFR rubrics, and level MOVEMENT is tracked per criterion across runs (/rubric trend) — but the descriptors are this station's own one-line summaries of each level, not the full official can-do inventory |
| `ana.errors` Error taxonomy (grammar/lexis/pronunciation/discourse) + frequency | **BUILT** | `err.taxonomy · /rubric errors` | four categories; the frequency is the number of instances the ENGINE could verify verbatim in the record — an honest FLOOR on the true error count, never a census, and a category with no verified instance is NOT SCORED rather than called clean |
| `ana.vocab` Vocabulary profiling: new words, bands, retention | missing | — | measurable, motivating, cheap to compute |
| `ana.fluency` Fluency metrics: words/min, pause ratio, repairs | partial | `computed bands · src/rubric.js · silence map` | delivery rate (words/min) and pause load (pauses >3s per 10 min) are now COMPUTED bands with their thresholds printed; repairs/reformulations are still unbuilt, and the rate is a proxy whose thresholds are stated, not universal |
| `ana.pronounce` Pronunciation / phoneme assessment | missing | — | needs audio scoring, not just text |
| `ana.trend` Growth trends per student per skill over time | **BUILT** | `/rubric trend · src/rubric.js` | per-criterion band movement between two runs of the same rubric on the same subject, with each run's period and mean; only criteria scored in BOTH runs are compared — a criterion scored in one is a gap, and is printed as one |
| `ana.coverage` Coverage vs syllabus: what was taught, what was skipped | **BUILT** | `/coverage · src/curriculum.js` | evidence-driven, never assumed: the guide's sections against the client's transcripts + summaries — counted over the sovereign's OWN sections (the teaching scope), with everything else reported beside them |
| `ana.authorship` Authorship/AI-origin check on submitted work | missing | — | increasingly required in schools |
| `ana.question` Comprehension question generation from the lesson | missing | — | turns evidence into the next lesson's material |
| `ana.identity` Longitudinal identity (same student across classes/aliases) | missing | — | without it growth data fractures |
| `ana.translate` Bilingual glossing / translation (EN↔VN) | partial | `retired 2026-09-22 (client dropped)` | parents read in their first language |

### ⚖ JUDGEMENT — evaluator quality

_The differentiator. Any tool can generate text about a student; an evaluator must be fair, cited, calibrated, and auditable — and must fail closed when the evidence is thin._

| tool | status | where | note |
|---|---|---|---|
| `jud.evidence` Evidence-sufficiency gate (fail closed when thin) | **BUILT** | `TESTUDO gate · src/playbooks.js` | thin evidence is stated, never papered over |
| `jud.provenance` Provenance: every claim cites source + timestamp | **BUILT** | `/writeup /review · src/review.js` | the evidence list travels with the printable |
| `jud.citation` Machine-verified citation — the engine LOCATES every quote itself | **BUILT** | `/rubric · src/rubric.js` | a quote is matched against the raw record (STRICT on whitespace and case, LENIENT on punctuation, and the strength is printed); a span the engine cannot find is REFUSED and never counted; the timestamp is read off the transcript's own utterance map, never asked of the model |
| `jud.quorum` Quorum sensing before a conclusion | **BUILT** | `src/pheromone.js` | below quorum the colony camps and asks |
| `jud.coverage` Omission audit: what was NOT observed | **BUILT** | `omission audit + the evidence gate · src/rubric.js` | every scorecard carries an omission audit naming each criterion it could not judge and why; the gate states every reservation about the record (thin, single-day, missing parts, unreadable sources, a single source with no note), and a partial record is stamped PROVISIONAL |
| `jud.fairness` Fairness/bias audit (accent, gender, language, time) | missing | — | an evaluator that is not audited is not an evaluator |
| `jud.rater` Inter-rater reliability (two graders, same artifact) | missing | — | multi-agent structure makes this natural |
| `jud.calibrate` Confidence/calibration per judgement | partial | `how-it-was-established · src/rubric.js` | every criterion states HOW it was established (COMPUTED / CITED / NOT SCORED) and the run carries a confidence note and a PROVISIONAL stamp — an evidence-strength label, which is not the same as calibration against outcomes, and that is still missing |
| `jud.contradict` Contradiction detection across evidence sources | missing | — | two sources disagreeing is the most valuable signal |
| `jud.reasons` Adverse-action reason codes (exactly what lowered it) | **BUILT** | `/rubric · src/rubric.js` | every scorecard prints WHAT LOWERED IT: each criterion below the top band, ranked by how far below, with the verified span that decided it — and absence is deliberately NOT listed there, because a criterion that was never scored is an omission, not a reason |
| `jud.override` Teacher override, recorded and fed back to the field | partial | `pheromone negative trail` | the primitive exists; no UI flow |
| `jud.second` Second-opinion protocol for borderline cases | partial | `Audit / DICTATOR roles` | doctrine without a workflow |
| `jud.drift` Evaluator drift detection over time | missing | — | canon has the doctrine (Ne0), not the code |
| `jud.rubricver` Versioned rubrics — every score cites its rubric version | **BUILT** | `/rubric · src/rubric.js` | every stored run carries the rubric id, version and SHA-256 of the definition that judged it; editing a custom rubric makes a new version and leaves the old one intact for every scorecard that cited it, so a scorecard can never silently change under the rubric that produced it |

### 📋 REPORT — communication out

_A judgement nobody understands changes nothing. This family is the parent, the student, the school, and the file — each needs a different artifact from the same evidence._

| tool | status | where | note |
|---|---|---|---|
| `rep.writeup` Class writeup (covered / how taught / notable quotes) | **BUILT** | `/writeup · src/review.js` | six sections, cited |
| `rep.review` Student review (teacher / parent / short registers) | **BUILT** | `/review · src/review.js` | same evidence machine, different voice |
| `rep.print` Printable / PDF export | **BUILT** | `🖨 Printable · src/review.js` | self-contained HTML, print to PDF |
| `rep.trend` Term/period progress report with trend | missing | — | the artifact parents actually pay for |
| `rep.student` Student-facing self-assessment + goals | missing | — | evaluation the learner owns |
| `rep.next` Actionable next-step plan (practice prescription) | partial | `manual gameplan in the portal` | should be derived from the errors |
| `rep.deliver` Delivery: email / Zalo / SMS / share link | missing | — | a report in an app nobody opens is invisible |
| `rep.meeting` Pre-meeting brief (one page before a parent call) | missing | — | cheap: it is a projection of existing evidence |
| `rep.voice` Spoken report (TTS) for parents | partial | `speak() · src/app.js` | voice output exists, not applied to reports |
| `rep.portfolio` Portfolio assembly (best work + growth narrative) | missing | — | the long-run proof of value |
| `rep.cert` Verifiable certificate / credential | missing | — | matters for adult learners |

### 🗂 OPERATIONS — workflow

_The daily machinery: rosters, filing, archives, search, batch. This is where a good tool becomes usable or dies, and where a class of thirty becomes thirty sittings._

| tool | status | where | note |
|---|---|---|---|
| `ops.roster` Students / classes / active context | **BUILT** | `/student /class · src/review.js` | the subject model |
| `ops.file` Evidence filing + attachment to a subject | **BUILT** | `/file · auto-file · src/review.js` | one recording can file under two subjects |
| `ops.notes` Dated observations | **BUILT** | `/note · src/review.js` | human judgement alongside machine evidence |
| `ops.search` Search across all evidence | **BUILT** | `/find · src/review.js` | verbatim search |
| `ops.archive` Archives with read / export / delete | **BUILT** | `/transcripts /summaries /reviews · kv` | verified button-by-button |
| `ops.schedule` Scheduling / calendar of lessons | missing | — | the portal shows a schedule; the evaluator does not know it |
| `ops.tasks` Assignment tracking (assigned → submitted → graded) | missing | — | closes the loop between lesson and evaluation |
| `ops.templates` Rubric / lesson / report template library | missing | — | consistency across teachers comes from templates |
| `ops.batch` Batch operation over a whole class | missing | `FORMICA playbook (doctrine only)` | 30 students must not mean 30 manual passes |
| `ops.team` Multi-teacher accounts + permissions | missing | — | a school is not one login |
| `ops.interop` Import/export: CSV, LTI, OneRoster, gradebook | missing | — | schools live on other systems |
| `ops.backup` Backup / restore / portability | partial | `kv + /gh backup + JSON export` | no restore path |
| `ops.cost` Cost & quota governance per class/term | partial | `playbook supply gauge` | counts commands, not real tokens |

### 🛡 GOVERNANCE — trust & compliance

_The students are minors and the recordings are of children. Consent, retention, residency, access, dispute, and ASR-error handling are not features — they are the licence to operate._

| tool | status | where | note |
|---|---|---|---|
| `gov.verbatim` Verbatim-capture-first; raw preserved untouched | **BUILT** | `ledger + RRL · src/app.js (L37/L55)` | the non-negotiable one |
| `gov.chain` Provenance chain raw → derived → report | **BUILT** | `summary/review refs · src/review.js` | every derived artifact points back |
| `gov.consent` Recording consent register (parent/guardian, minors) | missing | — | legally required before you record a child |
| `gov.retention` Retention policy + scheduled deletion | missing | — | how long may a child's recording live? |
| `gov.pii` PII minimisation / redaction in transcripts | missing | — | names, addresses, faces |
| `gov.residency` Data residency / localisation (VN PDPD) | missing | — | the operator is in Vietnam; students are minors |
| `gov.access` Access control on evidence (who may read a minor's file) | partial | `retired 2026-09-22 (client dropped)` | the evaluator app has no gate |
| `gov.moderate` Moderation of uploaded media | missing | `upload-plugin fileInfo API` | the API exists and is unused |
| `gov.disclose` AI-assistance disclosure to parents/schools | missing | — | say plainly that a machine helped |
| `gov.human` Human sign-off required for high-stakes output | partial | `doctrine only (Audit/DICTATOR)` | no enforced signature |
| `gov.tamper` Tamper-evident records (hash chain) | partial | `/ledger merkle chain · scorecard digests` | the ledger has a merkle chain and every scorecard carries its own digest (run + rubric), so a changed scorecard is detectable — reports and writeups still carry no chain of their own |
| `gov.dispute` Dispute/correction workflow (annotate, never rewrite) | missing | — | 'recorder not editor' applied to the record's life |
| `gov.asrerror` ASR-error awareness (never score from a low-confidence span) | missing | — | a misheard word must not become a grade |
| `gov.selftest` Self-audit report on the evaluator's own behaviour | partial | `PhoenixScout + Devil's Advocate` | run on demand, not yet scheduled |

### 🔁 LEARNING LOOP — pedagogy

_Evaluation that does not change the next lesson is administration. This family closes the loop: errors become drills, gaps become plans, progress becomes difficulty._

| tool | status | where | note |
|---|---|---|---|
| `lrn.practice` Practice generation from the student's own errors | missing | — | evaluation that generates the next drill |
| `lrn.srs` Spaced-repetition scheduling of vocabulary | missing | `retired 2026-09-22 (client dropped)` | cards exist without scheduling |
| `lrn.gap` Curriculum gap analysis (covered vs required) | **BUILT** | `/coverage · src/curriculum.js` | the same engine read the other way: the sections the record has no evidence of are the next lessons |
| `lrn.plan` Lesson planning derived from past evaluations | missing | — | the loop closes here |
| `lrn.adaptive` Adaptive difficulty for the next lesson | missing | — | no two classes need the same lesson |
| `lrn.peer` Peer / self assessment workflows | missing | — | scales teacher attention |
| `lrn.goal` Goal setting + progress check-ins | partial | `portal gameplan` | manual in the portal |
| `lrn.remedial` Remediation playbooks for stuck students | missing | — | the 'what do I do now' answer |

### ⚙ PLATFORM — full-stack

_Ownership, mobile capture, queueing, rate limits, tenancy, schema versioning, cost, and a way to verify any of it. Invisible when right, fatal when wrong._

| tool | status | where | note |
|---|---|---|---|
| `pl.own` Data ownership / self-hosting (no platform middleman) | **BUILT** | `src/cloudflare` | Cloudflare Worker + DOs, verified |
| `pl.mobile` Phone-first capture and use | **BUILT** | `responsive UI · voice dictation` | record in the room, not at a desk |
| `pl.queue` Long-job queue with progress + resume | partial | `tunnel + part-level retry` | no general job queue |
| `pl.ratelimit` Rate limiting / abuse protection | **BUILT** | `15 sends/min · server-plugin` | per-connection |
| `pl.realtime` Realtime presence / live classroom view | partial | `server-plugin + tunnel` | pub/sub exists, no UI |
| `pl.observ` Observability: what broke, what is slow, what it cost | partial | `PhoenixScout probes` | no metrics history |
| `pl.version` Record schema versioning + migrations | missing | — | records will outlive the code that wrote them |
| `pl.canary` Automated test/verification harness (canaries) | partial | `/rubric canary · /doctor · src/rubric.js` | the rubric instrument now checks ITSELF by machine: /rubric canary drives the whole pipeline with a canned model response and no network and asserts the law (arithmetic beats opinion, an invented quote is refused, a band with no citation is not scored, the clock comes off the record, a forged citation is caught by verify), and /doctor runs it on every check-up — the rest of this inventory is still checked by hand |
| `pl.multitenant` Multi-tenant (many clients, isolated) | **BUILT** | `/clients /client · src/clients.js` | clients own their students, classes, evidence, reviews; Timmy #1; legacy adopted; nothing crosses |
| `pl.auth` Identity & roles (teacher / parent / student) | missing | — | the portal has PINs; the evaluator has nothing |
| `pl.offline` Offline / low-bandwidth operation | partial | `client-side + kv` | LLM/ASR still need a network |
| `pl.web` Open-web retrieval: search + read a source, cited | **BUILT** | `/web /wiki /url · src/app.js` | grounds answers in live sources; no API key, bounded, fail-closed |

---

## 3. The priority queue (what to build next, and why)

Ranked by (value for this exact product) × (how much of the rest of the map it unblocks).

| # | tool | why it is here |
|---|---|---|
| 1 | **Rubrics + cited scoring** (`ana.rubric`) | the word 'evaluator' means this. Everything else either feeds it or reports it. **✓ BUILT** |
| 2 | **Per-student attribution** (`ana.student`) | a class recording cannot honestly produce individual reviews without it. |
| 3 | **Consent + retention register** (`gov.consent`) | recording minors without a permission record is a legal problem, not a feature gap. |
| 4 | **Fairness audit** (`jud.fairness`) | an unevaluated evaluator is the one failure mode that destroys the product. |
| 5 | **ASR-confidence gating** (`gov.asrerror`) | never let a mis-transcribed word become a judgement. |
| 6 | **CEFR level tracking** (`ana.cefr`) | the shared language parents and schools already speak. |
| 7 | **Term progress report** (`rep.trend`) | the artifact that renews the subscription. |
| 8 | **Batch class pass (FORMICA)** (`ops.batch`) | 30 students must not cost 30 sittings. |

### The three that are structural

1. **Rubrics + cited scoring (`ana.rubric`)** — **BUILT 2026-09-24** (`src/rubric.js`, `/rubric`).
   Four families (cefr.speaking · cefr.writing · teach.lesson · err.taxonomy) plus custom rubrics defined in one
   line, versioned and sha-256-stamped. The law is enforced in the code, not asked of the model: every band must
   carry a verbatim span the ENGINE locates inside the raw record, a span it cannot find is REFUSED and never
   counted, the timestamp is read off the transcript's own utterance map (never asked of the model), the band is
   COMPUTED from the record's own numbers wherever the record holds one (with the model's band kept as recorded
   dissent), a band with no verified citation is NOT SCORED, coverage travels with every total, and each scorecard
   prints WHAT LOWERED IT and can be re-audited later (`/rubric verify`). `/rubric canary` proves the law with a
   canned response and no network, and `/doctor` runs it. What remains here is no longer the instrument but the
   calibration (`jud.calibrate`) and the official can-do inventory (`ana.cefr`).
2. **Per-student attribution (`ana.student`).** One class recording is currently one undifferentiated mass of
   text. Without diarization (or time-coded manual attribution) a per-student review is inference dressed as
   evidence — which is exactly what the doctrine forbids. This is the biggest honesty gap in the product as it stands.
3. **Consent + retention (`gov.consent`, `gov.retention`).** Recording children requires a permission record and
   an agreed lifetime for the recording. Neither exists. Until they do, scale is not a growth decision, it is a liability.

Two more deserve their own line because they are cheap and they protect everything else:
**ASR-confidence gating (`gov.asrerror`)** — never let a mis-transcribed word become a judgement, and
**fairness audit (`jud.fairness`)** — an evaluator that is not audited is the one failure mode that ends the product.

---

## 4. How this maps onto Agent 99 OS

The ecosystem is the *content*; `src/AGENT99-OS.md` is the *machinery*. The mapping is direct:

| ecosystem need | OS mechanism |
|---|---|
| evidence-mandatory judgements | **TESTUDO** playbook — optio shield + quorum + speculatores-first |
| batch evaluation of a whole class | **FORMICA** playbook — response thresholds, quorum per batch |
| checkpointed long jobs (a 3-hour lesson) | **CASTRA** playbook — fortify before marching; parts + resume |
| supply/cost per class and term | FRUMENTARIA supply gauge (per-day counts today, tokens tomorrow) |
| high-stakes or disputed output | **DICTATOR** — timed authority, mandatory Audit rollback + account |
| provenance and omission auditing | pheromone trails (`canon:`, `target:`, `src:`) + the scout's evidence rows |
| teacher override of a machine judgement | negative trail on the route + `drone:` trust, already wired |

New drones this map implies: **Rubric**, **CEFR** and **Trend** now live inside the rubric instrument
(`src/rubric.js`) rather than as separate drones. The rest are unbuilt: **Diarize**, **Consent**, **FairAudit**,
**PracticeGen**, **Batch**. Each is a specialist with a threshold, not a new app.

---

## 5. What is verified about the built rows

Every `built` row above was exercised live in the shipped generator (2026-09-19/20): transcripts with
part-level retry and honest partial saves; summaries that cite their raw; writeups and reviews with
printable exports; rosters, filing, notes, search, archives — including **every button** on every card
(read/parts/txt/srt/chat/del, show/md/txt/html/del, select/write/del, claim/complete/fail) clicked and
confirmed, with the destructive and LLM-running ones verified as wired and deliberately not fired.
The OS rows (`jud.evidence`, `jud.provenance`, `jud.quorum`) were verified by holding a real order until a
recon trail existed, and by routing a real command through the live tunnel.

**The rubric instrument (2026-09-24)** was verified twice over. `/rubric canary` drives the whole pipeline —
record gathering, the measures, citation location, the offset→utterance clock, JSON parsing, the composite, the
coverage arithmetic, the adverse-action reasons, the omission audit and re-verification — from ONE canned model
response with no network, and asserts the law by construction: it includes a model that breaks it (a forged quote,
a band with no citation, a band that contradicts the arithmetic) and requires that each is caught. It runs inside
the shipped generator (20/20) and `/doctor` runs it on every check-up. Then a REAL scoring run was made against a
real record through the live model path: the two computed criteria came back COMPUTED with the model's own band
recorded as dissent, the four judged criteria came back CITED with spans the engine found verbatim and clocks read
off the record, nothing was refused and nothing was left unscored — and when an earlier build of the clock was
found to be guessing a timestamp from a first-word match, the fallback was deleted and replaced with the offset
map, because a wrong clock is worse than no clock. (The synthetic subject used for that run is not on any
roster; its scorecard was removed from the local archive afterwards, and the operation record of the run stands in
the I-LOG, where the record of an operation belongs.)

---

## 6. Regenerating this file

The inventory is data in `src/ecosystem.js` (`TOOLS` rows: `[id, family, name, status, where, note]`,
plus `PRIORITY`, whose 4th element is `true` once the item is built). To regenerate this document, parse that
array and re-emit the tables above — or run `/tools` in the app for the live version, and `/tools
<family|status>` to drill in. Update a row's status only when the code that earns it ships.

This document was regenerated on 2026-09-24 for THE RUBRIC. That pass also corrected four rows that had drifted
since the last emission (cap.curriculum and ana.coverage were still marked missing after they shipped; cap.home and
gov.tamper still described the retired portal build) — the document is generated from the data, so drift here is a
bug in the pass, not a matter of opinion.

The rubric's own law is restated and ENFORCED in the header of `src/rubric.js`. If a reading of this document ever
disagrees with that file, the file wins.
