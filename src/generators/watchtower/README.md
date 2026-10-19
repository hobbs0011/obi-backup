# role: watchtower — "the teacher's board"

**Mandate.** The station writes one student's review. The watchtower answers the class-level
questions — *who is behind, who is ready, what was never taught* — from the same evidence, with no
new data collection and no guessing. This is where the biggest missing tool in the evaluator stack
(`src/ecosystem.js` → `ana.coverage`: what was taught vs what was skipped) finally gets a face.

## Interface

| command | what it does |
|---|---|
| `/roster` | every student, one line each: minutes, streak, evidence count, last capture |
| `/term <label>` | the term view: progress per student, per week |
| `/coverage` | **what the syllabus asked for vs what the evidence shows was taught** — the parent question ("what did we pay for?") answered with citations |
| `/who <signal>` | who has not been heard from, who is stuck on the same thing, who is ready for more |
| `?term=<label>` | deep link into a term view (shareable with a co-teacher) |

## What it is allowed to claim

- Only what is in the evidence: counts, dates, quoted lines. Every row links to the moment it came
  from.
- **Omissions are the point.** A syllabus item with no lesson behind it is the most valuable row on
  the board. `/coverage` must be able to say "not observed" — and must never round that up to "done".
- No personality claims and no predictions. "He was quiet in weeks 3–5" is evidence; "he lacks
  confidence" is a judgement for the human writing the review.

## Build steps

1. Create the generator (suggest `obi-watchtower`).
2. Paste `main.pjs`; add `index.html`, `styles.css`, `app.js`.
3. `cgn-node.js` with `CONFIG.role = "watchtower"` — the roster comes from the mesh: each portal
   node's records plus the station's rosters.
4. The syllabus side needs an input: a pasted table of contents (book + unit list). That is
   `ana.curriculum` in the evaluator stack and it is currently **missing** — the watchtower is where
   it belongs.
5. Open it once, then `/netadd <name> watchtower` on the station.

## Done when

- [ ] the roster is real (from the portals + the station, not typed in twice)
- [ ] `/coverage` can show an omission, with the syllabus item quoted and the absence dated
- [ ] every number on the board links to the evidence behind it
- [ ] a term view can be handed to a parent as a printable, the same way `/review --parent` can
