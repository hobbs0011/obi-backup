# role: practice — "the drill"

**Mandate.** Turn what the student actually did this week into exercises they can do tonight. This
is the *learning loop* family of the evaluator stack (`src/ecosystem.js` → `lrn.*`) finally getting a
body. Everything the drill contains must come from the student's own filed evidence in the station
(their transcript, their mistakes, their words) — never from a generic worksheet.

## Interface

| command | what it does |
|---|---|
| `/drill <topic>` | build a short practice set on one topic from this student's evidence |
| `/quiz` | N questions from the last class, mixed, with answers hidden until asked |
| `/vocab` | the words this student has met and not yet used — flashcard + gap-fill |
| `/again` | re-run the items that were missed last time (spaced repetition, not a fresh random set) |
| `?topic=<x>&student=<name>` | deep link from the station or the portal |

## The rules

- **Grounded.** Every item cites the evidence it came from (transcript id + the minute). If there is
  no evidence for a topic, the node says so — it does not invent a curriculum.
- **On the student's level.** Difficulty is set by what this student has demonstrated, not by a
  grade label.
- **Results are evidence.** What was attempted, what was right, what was missed, how long it took —
  recorded verbatim and pushed back to the station, where it becomes the next drill's input and a
  line in the review.
- **Never a wall of text.** Short items, immediate feedback, no scores for the student's eyes that
  the teacher would not show them.

## Build steps

1. Create the generator (suggest `obi-practice`).
2. Paste `main.pjs`; add `index.html`, `styles.css`, `app.js` (fork the station's card style; the
   gem is `src/summary.js`'s prompt discipline — evidence in, no fabrication).
3. `cgn-node.js` with `CONFIG.role = "practice"`.
4. Open it once, then `/netadd <name> practice` on the station.

## Done when

- [ ] a drill can be built from a real transcript, with a citation on every item
- [ ] misses come back next time (the `/again` path is the point, not the first quiz)
- [ ] results land in the station as evidence and change the next drill
- [ ] no item exists that cannot be traced to something the student said or met
