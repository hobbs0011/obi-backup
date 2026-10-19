# role: portal — "the door" (one generator per student)

> **This crate is one stage of a pipeline.** On 2026-09-26 the five live student portals were picked apart and
> every part assigned its own generator — this portal is the **assembler** of that pipeline. The decomposition,
> the assignment, the Worker's real API contract and the flags found while dissecting are written down in
> **`src/STUDENT-PORTAL-PIPELINE.md`**; the shelf carries the whole list under NET, group *STUDENT PORTAL
> PIPELINE*. Read that file before building here.

**Mandate.** Each student gets their own generator: their world, their homework, their books, their
voice. The station stays the teacher's surface; the portal is the student's. The first real instance was a
hand-built single file (`src/timmy-portal/`), **retired with its client on 2026-09-22** — *"timmy dropped us,
so wipe him"*. That file is gone from the tree, and this folder is the *generalized* version so the next
instance costs an afternoon, not a week.

**Why a generator per student (the sovereign's direction).** A separate generator per student gives
each one a private, unguessable address, their own storage namespace, their own theme and their own
progress — and it makes the student the *owner* of their space rather than a row in someone's
database. It also means a portal can be handed to a family without handing them anything else.

## Interface

| view | path | what it does |
|---|---|---|
| login | `#login` | PIN per role (student / parent). Client-side is a curtain, not security — move the check to the worker (see below) |
| student | `#student` | today's plan, homework checklist, points/streak, books, the audio library, the games |
| parent | `#parent` | progress bars, daily log, homestudy minutes vs target, study requests, teacher's note |
| plan | `#gameplan` | the multi-week plan (W1..Wn) with the current week highlighted |
| request | `#request` | "please cover this again" — a study request that lands in the station |
| (hidden) | `?student=<name>` | identifies whose portal this is; the portal announces itself to the mesh |

## What it must report to the station

A portal is **evidence in**, not a brochure. On every meaningful event (homework ticked, minutes
logged, request filed, game finished) it appends a dated, verbatim record. On sync it hands the
station: minutes logged, items completed, requests filed, and the exact words the student or parent
typed. Those become filed evidence under that student's subject in `src/review.js` — so the writeup
the teacher sends home is built from what actually happened, not from memory.

## Build steps

1. Create the generator (suggest `obi-portal-<student>`, or one generator serving `?student=`).
2. Paste `main.pjs` and `index.html`.
3. In its own `src/`: `styles.css` (reuse the station's theme), `app.js` (fork
   that old single-file portal and split it into parts before it was retired), `cgn-node.js`
   with `CONFIG.role = "portal"`.
4. Set `STUDENT` and the PINs in `app.js`; **never** ship the default PINs (`5820` / `3820`).
5. Open it once (it writes its node file), then `/netadd <name> portal` on the station.

## Done when

- [ ] the student can log in, see today, tick homework, log minutes, file a request, play a game
- [ ] the parent can see progress without asking (minutes, streak, requests, teacher's note)
- [ ] every event is recorded verbatim with a timestamp, locally, before anything else
- [ ] the station can pull this portal's evidence and write a review that cites it
- [ ] PINs are not the defaults, and the check runs somewhere other than the client
- [ ] the deployed copy and the repo copy are the same file (the retired portal had drifted — 42.7 KB deployed
      vs 41.8 KB in the old `src/timmy-portal/` — which is exactly the failure this rule exists to catch)
