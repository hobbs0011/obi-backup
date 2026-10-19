/* PHOENIX GENERATORS — the product family registry (src/divisions.js).

   UMBRELLA: [Phoenix(ai)Solutions] = PaiS. THIS generator is ONE mastermind of
   many: PaiS · ESL.ED.TECH · (N)[E](T) Natural English Training — every generator
   that teaches English or business classes lives under this anchor. Two sibling
   masterminds scaffold next, as their own generators, not as tabs here:
     · PaiS Gaming  — interactive worlds and simulations (division "gaming" below).
     · PaiS Promote — everything marketing + brand + copywriting, one umbrella
       (division "marketing" below is its preview: it ships here until Promote
       opens, then moves under it).
   Umbrellas within umbrellas: PaiS > mastermind (ESL.ED.TECH / Gaming / Promote)
   > division > generator. This file is the shelf for THIS mastermind only.

   WHAT THIS IS. PaiS ships many generators, organised into DIVISIONS (NET —
   Natural English Training —, Gaming, Web Development, …), and each division
   holds the generators that belong to it. This file is the ONE place that registry
   lives, so the navigation can never disagree with itself: the ◈ Phoenix Generators
   view renders straight from here, and adding the next generator (Lesson Creator is
   next) is an edit to this array — nothing else.

   HOW IT DIFFERS FROM THE OTHER MAPS (all three are honest, none is a duplicate):
     · src/divisions.js      — the SHELF: who offers what, grouped by division.
     · src/constellation.js  — the ORGANISM: every live/scaffold/planned piece and
                               its URL, including services and public faces.
     · src/ecosystem.js      — the TOOL INVENTORY: the 96 evaluation tools and how
                               many are built.
   A generator can appear here (the shelf) and in the constellation (the organism)
   at once; the shelf cares about the customer's view, the constellation about the
   machine's.

   STATUS is deliberately conservative: `live` means it opens right now; `scaffold`
   means source exists but it is not a shipped generator; `planned` means it is a
   name and an intention and nothing else. Never mark anything live that is not.
   ========================================================================== */
(function(){
  const STATUS = {
    live:     { label:"LIVE",     c:"#50dc82", blurb:"It opens and works right now." },
    scaffold: { label:"SCAFFOLD", c:"#e6b43c", blurb:"Source exists in the repo; not a shipped generator yet." },
    planned:  { label:"PLANNED",  c:"#8b94ad", blurb:"A name and an intention. Nothing is built." }
  };

  const UMBRELLA = {
    short: "PaiS",
    full: "Phoenix AI Solutions",
    rank: "apex mastermind — the mastermind of masterminds (answers to sovereign only)",
    firstLeader: "phoenix-ai-solutions-edtech-mastermind (named 2026-10-16 · 371 files · ORD-2 issued)",
    secondLeader: "phoenix-ai-solutions-promotions-mastermind (named 2026-10-16 · 375 files · ORD-3 issued)",
    thisMastermind: "ESL.ED.TECH",
    thisAnchor: "(N)[E](T) Natural English Training",
    siblings: ["PaiS Gaming (scaffold next, own generator)", "PaiS Promote — marketing+brand+copywriting (scaffold next, own generator)"],
    cloneRecipe: "clone this generator → in the clone run /mastermind parent <this-generator> → back here run /masterlink name <clone>"
  };

  const DIVISIONS = [
    {
      id:"net", name:"NET", icon:"cap", status:"live",
      full:"PaiS · ESL.ED.TECH · Natural English Training",
      blurb:"The education division of the ESL.ED.TECH mastermind: the classroom, the students, and the evidence they leave behind. Every English/business-teaching generator anchors here.",
      generators:[
        {
          id:"student-evaluator", name:"Student Evaluator", icon:"user", status:"live",
          entry:"eval",
          blurb:"Record a lesson → summarize → write up the class and review the student. Every claim cites the verbatim evidence it came from.",
          does:["transcribe any-length lesson video/audio","study summaries, always pointing back at the raw","class writeups and per-student reviews, evidence-cited","many clients, isolated — one station, many engagements"]
        },
        {
          id:"lesson-creator", name:"Lesson Creator", icon:"book", status:"live",
          entry:"lesson",
          blurb:"The other half of the loop: turn this week's evidence into the next lesson — in the sovereign's own format, the NET Academy Lesson Standard.",
          does:["🧭 Plan — reads the Student Evaluator's writeups, reviews and summaries and names the next lesson, with objectives",
                "✍ Build — Agent 99 writes the spec, or you edit it by hand; a failing spec is refused, never shipped",
                "🗂 Library — every lesson built for this client, re-openable and re-downloadable",
                "📐 Standard — the 11 laws (src/LESSON-STANDARD.md), one source of truth",
                "📡 /lesson push — commits a finished lesson to the canon beside the class it came from (gated)"],
          needs:["the per-student copy (the Student Portal hands each learner their own build)",
                 "the canon INDEX — each pushed lesson listed, so NET/LESSONS reads as a course, not a drawer",
                 "assignment tracking: which class actually sat the lesson"]
        },
        {
          id:"the-intake", name:"The Intake", icon:"record", status:"live",
          entry:"intake",
          blurb:"The app the tutor asked for by name — “we’ll build it all into one app so that it remembers”. Every promise made in a lesson recording becomes an item with an owner, the evidence that put it there, and a state that only moves when material arrives.",
          does:["record → the promises → the owed list, per student, with the recording cited on every row",
                "the inbox — what a student sends is kept verbatim and filed against the item it serves",
                "the builders — a CV that leaves a row BLANK rather than guess it, the LinkedIn plan, the headshot, this week’s plan",
                "the instruments — the 44-sound phonics test, the weekly recorded presentation, the interview bank, the application board",
                "one app that remembers: the human captures, the machine keeps it — and the records live in this browser’s kv, never in the public source"],
          needs:["the material the students are about to send — the intake is built to receive it",
                 "confirmation of the one row the machine guessed (a degree name) before any CV is printed"]
        },
        { id:"phonics-44", name:"The 44", icon:"speak", status:"scaffold", entry:"family",
          blurb:"The 44 sounds of English as a SPEAKING test, marked by hand from a recording — never automatically — and drilled ten minutes a day, only where the record says something slipped.",
          does:["all 44 sounds with spellings and words to say, markable ok / drill with a note of what was actually heard",
                "the ten collisions this market makes, and a mark sheet that prints the full set or just the drill list"],
          needs:["a recording of the sitting (the station's /transcribe, or any transcript)"] },
        { id:"presentation-coach", name:"The Weekly Presentation", icon:"record", status:"scaffold", entry:"family",
          blurb:"15–20 minutes, recorded, a few times a week — about an hour a week spread out, so it builds like a snowball — with the five-beat shape and ONE correction per run.",
          does:["the dose and the arithmetic stated plainly, the five beats with a plan per beat, and the topic seeds",
                "the run log and the reading sheet: six rows 1–5 and the one correction the tutor's own rule allows"],
          needs:["the recording itself, sent after each run"] },
        {
          id:"student-portal", name:"Student Portal", icon:"door", status:"planned",
          group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"One generator per student: their world, their homework, their voice — the door they walk through. It is the ASSEMBLER of the pipeline below: the five live student portals were picked apart on 2026-09-26 and each part was assigned its own generator, so a part can be rebuilt for the next student without re-teaching it anything.",
          does:["a student sees only their own work","homework and practice land where the student already is"],
          needs:["the parts below — the pipeline is written down in src/STUDENT-PORTAL-PIPELINE.md","the live portals' eight dead sub-page links (Quan and Quang, case mismatch) were the failure this replaces: a link is built from the record's slug, never hand-typed"]
        },
        {
          id:"portal-dna", name:"The Student DNA", icon:"user", status:"planned", group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"The live portals' Profile page, as a generator: Student DNA · Evolution (before → now) · Focus Areas · Key Quotes · Vocabulary Snapshot — read from the record, never retyped.",
          does:["the profile page of a student's portal, built from the record and the transcripts","the before/now evolution, the key quotes kept verbatim, the vocabulary snapshot from their own words"],
          needs:["the record to be complete enough to have a before and a now"]
        },
        {
          id:"portal-method", name:"The Method", icon:"book", status:"planned", group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"The Methodology page: the method, the career setup as the engagement vehicle, the framework built in class, the mental models — the student's own method, stated plainly, so the next lesson opens where this one stopped.",
          does:["the methodology page, composed from the record and the lesson doctrine","the framework and the mental models named the way they were taught, not paraphrased"],
          needs:["the lesson doctrine (the 11 laws, src/LESSON-STANDARD.md) in a readable form"]
        },
        {
          id:"portal-evidence", name:"The Evidence", icon:"record", status:"planned", group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"The Transcripts page and the class audio library behind it — per-part players with speed and progress, so a student replays the exact five minutes they missed. The other half of the Evaluator: it reads the same recordings.",
          does:["the transcript archive, per session, kept verbatim","the class audio split into parts with a player each (the live portals do exactly this)"],
          needs:["the recordings (the station already transcribes any length — src/transcribe.js · src/audio-split.js)"]
        },
        {
          id:"portal-practice", name:"The Practice", icon:"target", status:"planned", group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"What the student actually DRILLS: the word wall, the review window per word, the tasks log. Retrieval practice and spaced repetition from the student's own transcript — not a generic worksheet.",
          does:["the word wall — mastered words, current streak, level progress","the drill the record says is due, and the tasks log the portal calls (/api/tasks/log · /api/practice)"],
          needs:["the record's filed evidence as the drill source","a result reported back to the station as evidence"]
        },
        {
          id:"portal-plan", name:"The Action Plan", icon:"clipboard", status:"planned", group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"The Action Plan page: the current sprint, the upcoming milestones, the English focus and the coach note — derived from the review, so the plan cannot drift from what the evidence says.",
          does:["the sprint and its milestones, from the review","the coach note — one voice, the tutor's"],
          needs:["the Student Evaluator's review (the plan is derived from it, never invented beside it)"]
        },
        {
          id:"portal-chat", name:"The Chat (OBI)", icon:"mic", status:"planned", group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"The student's voice door: OBI, two modes (study · phonics), the onboarding state machine, the Vietnamese rescue rope, memory, the per-session metrics — and crisis detection that runs BEFORE any lesson logic. A port, not an invention: the Cloudflare implementation is real and proven.",
          does:["a voice session that files turns, vocabulary, duration and barge-ins onto the record","phonics hints taken from the transcriber's own low-confidence words","safety first: a crisis signal stops the lesson and answers with the support line"],
          needs:["porting chat.js + the router (the source is in the canon: PROJECTS/NET-PET-AI/src/magic-chat-router.js · APPS/PHOENIX-EMPIRE-DEV/src/magic_chat_endpoint.js)","a voice key per origin, and the mode split wired to the record"]
        },
        {
          id:"portal-witness", name:"The Witness", icon:"users", status:"planned", group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"The employer and parent view: the same record, read-only, per role — the answer to 'what did we pay for?' without asking the tutor. The live employer portal is 10 KB and its auth endpoint 404s; this replaces it.",
          does:["minutes, streak, sessions and progress read from the record — nothing typed twice","a role-scoped read: an employer sees the work, a parent sees the practice"],
          needs:["per-role identity (/api/employer/auth answers 404 live — the endpoint must exist before the door)"]
        },
        {
          id:"portal-pitch", name:"The Pitch", icon:"spark", status:"planned", group:"STUDENT PORTAL PIPELINE — one generator per part (src/STUDENT-PORTAL-PIPELINE.md)",
          blurb:"The Lesson-1 deck the live portals ship (nine beats: the problem · the method · how OBI works · Lesson 1 arsenal · progress · the 3-month transformation · built for BlueTech · Day 1 · wake up the Tiger) — composed as ONE self-contained .html.",
          does:["one self-contained deck per student, the same nine beats, the student's own numbers","the house deck machinery (src/brand.js) pointed at a student instead of a parent"],
          needs:["the record's numbers, so a claim on a slide is the same number the record shows"]
        }
      ]
    },
    {
      id:"career", name:"Career", icon:"certificate", status:"scaffold",
      full:"PrAis Career",
      blurb:"The client's place in the market: the CV, the profile, the face, the portfolio, the applications, the interview. Every generator that hands a client over to whoever might hire them — one function per generator, so a function can be handed to the next client without carrying the whole station.",
      generators:[
        {
          id:"the-roles", name:"The Roles — one generator per function", icon:"stack", status:"scaffold",
          blurb:"The intake's own functions, one generator each: paste two files and the role is its own generator, so a function can be handed to the NEXT client without carrying the whole station. Ten roles live here; the other two — the 44 and the Weekly Presentation — are measured in the classroom and sit under Education. All twelve share one kit, so a record written by any of them opens in the others and in the station's /intake — and every one of them fails closed the same way.",
          does:["the roles, each verified by its own two harnesses — they BOOT, and they BEHAVE: the behavioural test drives the real controls and reads the record back",
                "one kit (role-kit/kit.js): the theme, the record store, the import/export that moves a record between any two roles, and the fail-closed field reader",
                "one method (role-kit/method.js): the tape's own tables — the promises, the 44 sounds, the interview bank, the CV rows — with no student in them",
                "each role is ONE paste of main.pjs + index.html; nothing is fetched at runtime and the pages open offline"],
          needs:["to be pasted into their own perchance generators — the source is written and verified here, but no role has yet been published as a generator of its own (which is why the crate says scaffold, not live)"]
        },
        { id:"cv-forge", name:"The CV", icon:"doc", status:"scaffold", entry:"family",
          blurb:"A print-ready A4 CV built from what the student actually has — and a row nobody supplied prints as a ruled line, named in the footer, never filled in.",
          does:["the 14 rows a one-page CV runs in, each editable in place, each carrying the evidence it came from",
                "a machine's GUESS is held on the record for the tutor to correct and is excluded from the paper entirely"],
          needs:["a confirmed degree name before anything prints — the gate every role carries"],
        },
        { id:"linkedin-forge", name:"The LinkedIn", icon:"user", status:"scaffold", entry:"family",
          blurb:"The profile composed from the SAME record as the CV, so the two can never disagree — plus the connection build the tutor quoted on tape.",
          does:["the ten sections a recruiter reads, each read from the record and copyable on its own",
                "the build checklist and the connection count kept ON the record, so the next lesson opens where this one stopped"],
          needs:["the CV's confirmed rows; the headshot"],
        },
        { id:"headshot-brief", name:"The Headshot", icon:"image", status:"scaffold", entry:"family",
          blurb:"One clean photo — the wardrobe the tutor settled on tape, the room, the twenty-shot list, the pick, and the crops every surface needs. Records the file, so all of them wear the same face.",
          does:["the shot list as a tick-list, and the crops for LinkedIn, the CV, Facebook, WhatsApp and the original"],
          needs:["a phone, a wall, and a shirt that has been ironed"],
        },
        { id:"portfolio-intake", name:"The Portfolio", icon:"clipboard", status:"scaffold", entry:"family",
          blurb:"A bin with a label on it: everything a student sends is kept verbatim the moment it arrives and filed against the promise it can serve — so nothing already made goes unused.",
          does:["kept VERBATIM (L38), filed by auto-guess or by hand, and the guess is shown rather than hidden",
                "the promise it serves moves to MATERIAL IN because material arrived — never because anyone remembered"],
          needs:["nothing — this is the door every other role needs"],
        },
        { id:"application-board", name:"The Applications", icon:"target", status:"scaffold", entry:"family",
          blurb:"The board, the count, the minutes and the weekly target of twelve — with the library that stops the retyping: what each company actually asked, kept once.",
          does:["log an application the moment it goes out; the rolling 7-day count against 12; the average minutes",
                "the distinct questions across every application, each showing who asked it, exported as CSV"],
          needs:["the roles they are actually applying for"],
        },
        { id:"interview-drill", name:"The Interview", icon:"mic", status:"scaffold", entry:"family",
          blurb:"The bank this market actually asks — the awkward personal ones first, because they were really asked — and the drill: run it cold on camera, mark the three that broke, rewrite only those, until it is boring to say.",
          does:["five groups, with the four questions really asked of a student first",
                "a question is ticked 'boring' only when it has stopped being interesting to say; the runs are kept with the three that broke"],
          needs:["a camera and a call — Zoom is the real mode"],
        },
        { id:"umbrella-brand", name:"The Umbrella", icon:"seal", status:"scaffold", entry:"family",
          blurb:"One holding name with the student's actual work beneath it, one line each, and a single self-contained page that carries them — so the links can go on the CV and the LinkedIn.",
          does:["the pieces are read from the portfolio inbox and NOWHERE ELSE — the gate, enforced in code",
                "composes one .html page that opens offline; a piece can come off the page without being deleted"],
          needs:["the portfolio intake — the gate: you cannot brand what has not been sent"],
        },
        { id:"presence-plan", name:"The Presence", icon:"users", status:"scaffold", entry:"family",
          blurb:"Five fronts — LinkedIn, Facebook, TikTok, WhatsApp, Zalo — what each one is FOR, what to set on it, and a rhythm instead of a burst. Plus the line that keeps it honest: do not invent an audience.",
          does:["each front with its own tick-list and the tape line behind it, and the weekly rhythm written out",
                "shows what the fronts need from the record: the photo, the one line, the link, the number"],
          needs:["the headshot, the headline, and the umbrella page"],
        },
        { id:"work-credit", name:"The Credit", icon:"hammer", status:"scaffold", entry:"family",
          blurb:"One piece of real, shipped work — scoped small enough to finish — credited in plain words in the tutor's own form, plus the five-minute answer the student must be able to give without notes.",
          does:["the scope, and the line: '… helped consult and design for …', addable to the CV's experience row",
                "THE GATE IS A SWITCH: no credit line exists at all until the sovereign has said what may be credited"],
          needs:["the sovereign's word for what may be credited"],
        },
        { id:"idea-lists", name:"The Lists", icon:"spark", status:"scaffold", entry:"family",
          blurb:"The one role that calls a model — 'a couple of lists of like a hundred like names': job titles, who to apply to, subjects, headlines, studio names, drill sentences, interview questions. Options to choose from, kept verbatim.",
          does:["the list is shown BEFORE it is kept, and what is kept is filed in the record's inbox under the promise it serves",
                "built-in seed lists for every kind, so the role still works where no model is loaded — and it says which of the two you are seeing"],
          needs:["a human to pick from the list — nothing generated reaches a CV, a profile or a page unread"],
        },
      ]
    },
    {
      id:"marketing", name:"Marketing", icon:"megaphone", status:"live",
      full:"PaiS Promote (preview — ships here until the Promote mastermind opens)",
      blurb:"The face the empire shows — preview of the PaiS Promote mastermind (marketing + brand + copywriting, one umbrella). The identity every piece wears, and the machines that carry it to a school, a parent or an employer. Marketing is where the brand is enforced, not where it is invented. When PaiS Promote opens as its own generator, this division moves under it.",
      generators:[
        {
          id:"brand-identity", name:"Brand & Identity", icon:"seal", status:"live",
          entry:"brand",
          blurb:"The identity system itself: the frozen palette and its court extension, one icon set, the marks cut from the sovereign's own decks (and the stills of the slides this system cannot redraw), the nine emblems that rank a student, the four beds every sheet sits on, the HUD chrome every surface wears — and GOSPEL 444, the doctrine the marks were drawing.",
          does:["the palette — 20 tokens: system · reward · ground, the court's plum and antique gold, and the doctrine's signal cyan, ember, and console green (BRAND.002)",
                "iconography — 115 inline-SVG icons on a 24 grid, stroke currentColor; no icon font, no emoji standing in for a concept (the second pass closed the first pass's debts, including a `mouse` that nine surfaces had been pointing at without it existing)",
                "the marks — cut from the sovereign's own decks, shipped in src/brand/assets/ with provenance; and the slides this system cannot redraw ship as stills beside them (BRAND.005 · BRAND.014 · BRAND.020)",
                "the emblems — nine vector ranks, modes and seals (roundel = the coin ladder, shield = the diagnostic, ring = the seals), so a rung changes without redrawing the ring",
                "the patterns — four tileable beds (lattice · circuit · ember · hazard) for grounds and empty states",
                "HUD chrome — framed panels with corner brackets, the status bar, plates, pills, crests, and the doctrine's own terminal / directive / chain",
                "GOSPEL 444 — the twelve laws, the mode ladder (Mouse 0-40 · Cub 41-79 · Tiger 80-100) and the unfair-advantage matrix",
                "the deck — twelve slides composed in this system's chrome, exported as ONE .html with every mark inlined; the codex deck is sixteen the same way (BRAND.014)",
                "the print room — nine artifacts, each one openable .html with its own @page rule: the wall set, the one sheet, the badge sheet, the rank certificate, the marketing set, the method card, the ad sheet, the enrolment pages and the run readout",
                "copyable snippets, and the assets downloadable one by one"],
          needs:["a printed-sheet PDF writer, so a poster can go to a print shop without a browser in the loop",
                 "the AI-PET schedule and the Jolly Phonics layer, which the doctrine states and nothing yet implements"]
        },
        {
          id:"dossier-deck", name:"Dossier Deck", icon:"doc", status:"live",
          entry:"brand",
          blurb:"The machine that produced BestDossierYet: brand-consistent slides from the canon — the diagnostic, the 60% rule, the math of the tiger — instead of a hand-built deck each time. It exists now: ObiBrand.buildDeck() composes GOSPEL 444 into twelve slides in the house HUD chrome and exports them as one self-contained .html.",
          does:["one slide per law, in the house HUD chrome (twelve slides, G444.001-G444.012)",
                "the codex deck — the same builder pointed at the Phoenix Rising Codex, sixteen slides, one self-contained .html",
                "the marks placed from src/brand/assets/, never re-drawn, inlined into the export as data URLs",
                "one self-contained .html — no fetches, opens offline, downloadable from the brand desk or /brand deck"],
          needs:["a PDF writer, for the print-safe 16:9 pages (the .html is done; the .pdf is not)",
                 "the slide grammar written down as law — today it lives in GOSPEL444.slides in src/brand.js"]
        },
        {
          id:"print-room", name:"The Print Room", icon:"print", status:"live",
          entry:"brand", entryLabel:"Open the print room ▸",
          blurb:"The artwork as sheets of paper. The brand system draws for a screen; this is the arm that hands a teacher something they can pin to a wall, cut out and give to a student, or print, sign and hand to a parent.",
          does:["the wall set — twelve law posters plus a cover, the ladder, the matrix and the closing, one A3 page each, every mark inlined",
                "the one sheet — all twelve laws, the diagnostic ladder and the motto on a single A3 for the space above the desk",
                "the badge sheet — the nine emblems as an A4 cut-out sheet, so a rank can be handed over on paper",
                "the rank certificate — A4 landscape, composed only from a record a human supplies; anything missing prints as a blank rule for the pen (BRAND.013)",
                "four tileable beds (lattice, circuit, ember, hazard) as the grounds for both the sheets and the station's own empty states",
                "nine vector emblems — four ranks (roundels), three modes (shields) and two seals (rings)"],
          needs:["a PDF writer, so a sheet can go to a print shop without a browser in the loop",
                 "the Jolly Phonics 42-sound chart, which the doctrine names and nothing has drawn yet",
                 "a printed-sheet inventory: which wall set, printed when, is in which classroom"]
        },
        {
          id:"landing-pages", name:"Landing Pages", icon:"globe", status:"live",
          entry:"brand", entryLabel:"Open the marketing register ▸",
          blurb:"The public face, and the words on it. The station now holds the MARKETING REGISTER — the same system as the doctrine, told to the parent — transcribed from the seven slides the sovereign hand-picked, plus the two sheets that carry it: THE MARKETING SET (six A3 pages) and THE METHOD CARD (one A4 a parent takes home).",
          does:["the register's own words: the three pillars, the 60% rule, the 1-hour architecture, the AI-PET, the comparison and the offer, each line carrying the slide it was transcribed from (BRAND.018)",
                "THE MARKETING SET — six A3 pages for the parent and the page: the claim, the pillars, the 60% rule and the hour, the AI-PET, the proof, the offer",
                "THE METHOD CARD — one A4 the student or parent keeps: the lesson's 10-5-5-3 arithmetic, the 45/15 daily ratio, the AI-PET's return days and the promise",
                "the seven hand-picked slides themselves, shipped as stills and shown on the brand desk with what each says and where it may be worn (BRAND.020)"],
          needs:["the exact URL and repo path confirmed as canonical (the marketing stack has 11 repos — which is which is still unanswered)",
                 "the intake protocol so a page cannot be published half-branded",
                 "the register's numbers tied to a live measurement surface, so an 80% claim on a page is the same 80% the record shows (the AI-PET debt, seen from the marketing side)"]
        },
        {
          id:"phase-0", name:"Phase 0 — The Creatives", icon:"spark", status:"live",
          entry:"brand", entryLabel:"Open the campaign ▸",
          blurb:"The campaign as pictures before it is copy. Six Phase 0 creatives, and the Law of Bilingual Hierarchy printed on the same sheet as the six ads it governs — because a creative brief that leaves its own rule behind is a mood board.",
          does:["the six creatives — Transformation, AI Multiplier, Summer Intensive, Loud & Wrong, The NET Difference and The Lakeview Local, each transcribed from the sovereign's own pipeline slide",
                "THE AD SHEET — A3 landscape: the six cards, the law printed on the same page, and the four M2 stages underneath showing where each creative lands",
                "the law itself lives on the sheet, not in a separate document (BRAND.021 · BRAND.022)"],
          needs:["the creatives actually drawn — the sheet is the brief; only the law's own mark (`wave-loud`) is a shipped graphic so far",
                 "a placed-media plan, so a creative is not just an idea pinned to a wall"]
        },
        {
          id:"codex", name:"The Phoenix Rising Codex", icon:"doc", status:"live",
          entry:"brand", entryLabel:"Open the codex ▸",
          blurb:"The sovereign's own operational codex, transcribed from five decks — the thing Obi holds: the dual-mastery claim, the Lakeview zone, the M2 automation pipeline, the five-layer sovereign stack, the retention clock, strategic laziness, the proof, and the run log as a format.",
          does:["the codex as sixteen composed slides in the house chrome, exported as one self-contained .html with every mark inlined (BRAND.014)",
                "the strategy half on paper: THE ENROLMENT PAGES (three A3 — the diagnosis, the intervention, the offer) and THE RUN READOUT (A4, half-blank for the pen)",
                "the run log transcribed as a FORMAT — five bands, four protocols, two laws, ruled lines for the record, and no name (BRAND.028)"],
          needs:["the two multiples reconciled — 2.5× in the doctrine and 4× on the master slide; both are printed side by side and never averaged (BRAND.025)",
                 "the four version strings in the corpus (V1.3 · V2.0 · V2.2 · V2.5) resolved against the single version this system holds"]
        },
        {
          id:"free-eval-funnel", name:"Free Eval Funnel", icon:"gauge", status:"scaffold",
          blurb:"The diagnostic the whole deck is built around: score the visitor Mouse-to-Tiger, show the number, then show the way out. The copy exists in the canon's marketing stack.",
          does:["the free-eval script, the report, the close",
                "DM responses and lead tracking from the funnel files"],
          needs:["the funnel wired to a real capture (WAITLIST / net-submissions already exist on the account)",
                 "scored the same way the lessons score, so the numbers in the funnel cannot drift from the numbers in the room"]
        },
        {
          id:"copywriting-dna", name:"Copywriting DNA", icon:"print", status:"scaffold",
          blurb:"The voice law: NET-COPYWRITING-DNA-V3 and the marketing voice bible. Every word the empire publishes is measured against it — and the station can be asked to write inside it.",
          does:["the canonical voice, readable in one room",
                "the station writing copy that cites the rule it is obeying"],
          needs:["the file pulled from canon into a readable form (it is marketing-internal and token-scoped)",
                 "the same treatment the lessons got: the law, then the validator"]
        },
        {
          id:"social-engine", name:"Social Engine", icon:"spark", status:"planned",
          blurb:"The six-week EN+VN schedule, turned into a generator: today's post, in the brand, with the asset already chosen.",
          does:["one post per day from the schedule, brand-consistent",
                "the tiger/mouse/gears marks placed per topic"],
          needs:["the schedule parsed into data (it is a document today)",
                 "a posting path that does not depend on a laptop"]
        },
        {
          id:"lead-capture", name:"Lead Capture", icon:"users", status:"planned",
          blurb:"Where a lead lands and who owns it. The account already has WAITLIST, net-submissions and a rate-limiter; nothing in the station reads them yet.",
          does:["one ledger of leads beside the client ledger",
                "the same vocabulary — a lead becomes a client, nothing is re-typed"],
          needs:["the KV/D1 read path (needs the elevated token)",
                 "the privacy line written before any field is collected"]
        },
        {
          id:"pitch-deck", name:"Pitch Deck", icon:"target", status:"planned",
          blurb:"The same dossier pointed at a school or an employer instead of a parent: 'you are not broken, your method was' applied to an institution's timetable.",
          does:["a deck per audience, built from the same law and the same marks",
                "coverage and results pulled from the Curriculum and Evaluator modules"],
          needs:["the dossier-deck's grammar promoted from GOSPEL444.slides into law (the composer itself now exists)",
                 "the numbers a school will ask for, gathered from real classes"]
        }
      ]
    },
    {
      id:"gaming", name:"Gaming", icon:"gamepad", status:"planned",
      blurb:"The games division — interactive worlds and simulations. Scaffolds next as its own mastermind generator: PaiS Gaming. This crate stays planned here until that generator opens.",
      generators:[]
    },
    {
      id:"webdev", name:"Web Development", icon:"terminal", status:"scaffold",
      full:"PrAis Web Development",
      blurb:"The build division — sites, dashboards and internal tools for clients. Its first generator is the Site Builder: a brief goes in, a real site comes out, in the house theme or the client's own colours.",
      generators:[
        {
          id:"site-builder", name:"Site Builder", icon:"globe", status:"scaffold",
          blurb:"The hand that puts a page on the web. A brief becomes ONE real, self-contained, responsive HTML site — written in parts, previewed live in a sandboxed frame, downloadable, and wearable in the frozen PrAis tokens or in a client's own colours.",
          does:["one self-contained .html per site — styles in <head>, one <script>, no build step, opens offline (the same rule every lesson, deck and built app already follows)",
                "the brief is captured verbatim as Soul DNA before the model is called (L37–L39) and synced over CGN — this is a node, role: site",
                "a plan before a byte is written: the sections, in order, one line each — then the file, written in parts (the reply cap means an unfinished part ends <<<MORE>>>)",
                "a shipped shape library beside it (`src/generators/site-builder/examples/`): the live CV plus one portfolio template in two palettes — identifiers redacted to {{TOKEN}} placeholders (BRAND.028) — so a build starts from a proven design, not a blank prompt",
                "live preview in a sandboxed iframe (allow-scripts, deliberately NOT allow-same-origin) · download · a local library in kv `sites`",
                "PrAis site = the frozen three tokens; a client site = the client's colours — a website is not a lesson, so BRAND.002 does not bind a client's page",
                "a multi-page site is built as in-file views with a tiny hash router, so the deliverable stays one artifact",
                "the two real paths named honestly on /deploy: Cloudflare (the build is in src/cloudflare/ — BLOCKED here with no token) and the ONE authority (a gated station write, never this generator's)"],
          needs:["to be pasted into its own generator and opened — the source is written and parse-checked, but it has NEVER RUN in a generator of its own (the crate marked `scaffold`, not `live`: nothing is called live that is not)",
                 "a real submit path: build → the sovereign's Cloudflare account (`/cf deploy` is the station's path, and it is BLOCKED until a token is held)",
                 "the client-site intake written down, so a client page cannot leave the builder half-branded (the same debt Landing Pages carries)",
                 "the built file into the authority repo — the station's gated write (`/forge apply` / `/canon sync`), never this generator's"]
        },
        {
          id:"video-node", name:"Video Node", icon:"video", status:"scaffold",
          blurb:"The drop station — the front door of a client build. Four doors: video · pictures · links · the owner's own words. Footage becomes stills, a timecoded contact sheet, THE PULSE (where the life in the file actually is, measured), clips cut from those measured peaks, and the whole look in words. Every link is fetched live and cross-checked. Then research, a blueprint for the first prototype, and orders for what is missing — which the THREE HANDS (image · copy · video) then actually make, re-audited so an order only reads PASS when a hand really produced something. The gate has the last word: READY TO EXECUTE, NOT YET COMPLETE, or BLOCKED. Nothing is ever uploaded — the file is read from disk, so the 20 MB attachment cap does not exist in here.",
          does:["a file of ANY size is read locally with the File API — the reason it exists: the sovereign's venue footage could not be handed over through the chat, so the cap is removed by never needing it",
                "THE QUEUE, swept in one shot: drop twenty files and each is read ONE AT A TIME — a 4 GB file costs exactly what a 4 MB one costs, because nothing is ever read whole into memory",
                "THE PULSE (src/pulse.js): a frame-diff luma walk plus an 8 kHz loudness pass (gated at 260 MB, and it says so), normalised against the file's own floor and peak, with a STILLNESS FLOOR — a file with five seconds of life in it gets one clip from those five seconds and says so, rather than padding clips out of the quiet parts",
                "the clips are cut from the MEASURED peaks, and the vision pass names moments in seconds off the timecodes burned into the sheet — a named moment near a peak snaps onto it and carries both reasons; one nowhere near a peak is kept as the eye's own pick with no number attached",
                "STILLS · a contact sheet, the grid composite done in the browser · vertical shorts with the file's own audio (canvas crop + captureStream + MediaRecorder) · the look read in words as vibe · art direction · palette · keywords · one line per tile · a builder brief — the eye that feeds the Site Builder (`?brief=`)",
                "LINK DROP: every address fetched live through superFetch and read IN CODE, then the LINK AUDIT — linked · given-but-not-linked · on the site but never given · named but never linked · absent — plus phone/address DISAGREEMENT detection. An unread page is recorded unproven, never absent; a page behind a login is read-but-thin and nothing is claimed from it",
                "PROMPT DROP + the conductor: research (the model's industry knowledge labelled `rule of thumb, not measured`), a blueprint for the first prototype, orders for whatever is missing, and an audit in which every row names the threshold it was measured against",
                "THE THREE HANDS ARE RUN, NOT DESCRIBED: the image hand (text-to-image-plugin, in-node, one image per order), the video hand (this node — it renders the film), and the copy hand (the register, src/story.js — there IS no separate copy role in this family). Every order is re-audited afterwards and quotes what came back, so PASS means a hand actually made it",
                "THE GATE — one plain answer to 'may this be executed?'. FAIL is narrow on purpose: only a fault in the node's OWN output (an invented number, a withheld line, a file that will not play back) blocks; a fault in the client's own site becomes an order under 'FOR THE PROTOTYPE TO FIX'",
                "PICTURES INTO VIDEO: a reel composed on a canvas and encoded by the browser itself — WebCodecs (H.264+AAC MP4, ~5–7× faster than real time) with a MediaRecorder fallback that is honest about recording in real time",
                "the reel is SOLD, not just shown: it looks up what the venue actually offers (read live through superFetch and pulled apart in-code), reads it through the house marketing register (MARKET · GOSPEL 444), and writes a story — hook · enemy · place · proof · offer · call — with one line burned onto each picture; the register's own law is checked IN CODE (no number the offering does not state, and with no offering at all, no digit whatsoever; no register example reused) and a line that breaks it is WITHHELD and named rather than shipped",
                "every render is measured: the finished file is read back through a <video> and the duration and dimensions a PLAYER sees are what is reported; a silent clip is labelled silent, a tainted canvas is named as tainted, and a model that never got the picture is refused rather than filed as a vibe",
                "`/test` proves the whole path on synthetic pictures with no file at all — bytes, frames and wall clock printed beside it"],
          needs:["to be pasted into its own generator and opened — the source is written, parse-checked and exercised end to end in a harness against the real model and a real venue, but it has NEVER RUN as a generator of its own (the crate says `scaffold`, and nothing is called live that is not)",
                 "the venue's own music as a bed file (the node takes an audio file off the disk — nothing is uploaded)",
                 "an Instagram-style page that answers with a login wall, to exercise the read-but-thin path on a live page (it is written and not yet seen)",
                 "the stills/shorts to leave the machine: today they are downloaded or zipped, because nothing in this family uploads a user's footage"]
        }
      ]
    }
  ];

  function rows(){ return DIVISIONS.reduce((a, d) => a.concat(d.generators.map(g => Object.assign({ division:d.id, divisionName:d.name }, g))), []); }
  function div(id){ return DIVISIONS.filter(d => d.id === id)[0] || null; }
  function get(id){ return rows().filter(g => g.id === id)[0] || null; }
  function coverage(){
    const c = { live:0, scaffold:0, planned:0, total:0 };
    for(const g of rows()){ c.total++; if(c[g.status] != null) c[g.status]++; }
    return c;
  }

  function chip(s){ const m = STATUS[s] || STATUS.planned; return '<span class="chip" style="background:' + m.c + '">' + m.label + '</span>'; }
  function e(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

  /* ICONOGRAPHY (BRAND.003). A division or a generator carries an icon NAME
     from src/brand.js (window.ObiBrand) and it renders as inline SVG — the same
     set the station, the desks and the lessons use. A legacy emoji still
     renders (so this registry cannot break a surface), but nothing new should
     add one: an emoji standing in for a concept is the thing BRAND.003 bans. */
  function ic(name, cls){
    const B = window.ObiBrand;
    if(B && B.has && B.has(name)) return B.icon(name, cls ? { cls:cls } : undefined);
    return '<span class="' + (cls || "gen-emoji") + '" aria-hidden="true">' + e(name) + '</span>';
  }

  /* one generator, as a card. `live` ones carry a way in; planned ones carry the
     honest "what it still needs" instead of a dead button. */
  function card(g){
    const m = STATUS[g.status] || STATUS.planned;
    let h = '<div class="gen-card" data-gen="' + e(g.id) + '" data-status="' + e(g.status) + '">';
    h += '<div class="gen-top"><span class="gen-ic">' + ic(g.icon) + '</span><span class="gen-nm">' + e(g.name) + '</span>' + chip(g.status) + '</div>';
    h += '<div class="gen-bl">' + e(g.blurb) + '</div>';
    if(g.entry === "eval" && g.status === "live") h += '<button class="ci-act gen-open" data-open="' + e(g.id) + '">Open the desk \u25b8</button>';
    /* a ROLE is not a station desk and not a published generator: it is a role of
       its own that this station can open right now, on its own records
       (src/family.js). The crate still says scaffold until it is pasted. The
       `entry:"family"` token and `src/family.js` keep their old names — they are
       internal, and every role's door is built on them. */
    else if(g.entry === "family" && window.ObiFamily && window.ObiFamily.has(g.id)) h += '<button class="ci-act gen-open" data-family-open="' + e(g.id) + '">Open it here \u25b8</button>';
    else if(g.entry === "lesson") h += '<button class="ci-act gen-open" data-open="' + e(g.id) + '">Build a lesson \u25b8</button>';
    else if(g.entry === "brand" && g.status === "live") h += '<button class="ci-act gen-open" data-open="' + e(g.id) + '">' + e(g.entryLabel || "Open the deck \u25b8") + '</button>';
    else if(g.status === "live" && g.url) h += '<a class="ci-act gen-open" href="' + e(g.url) + '" target="_blank" rel="noopener noreferrer">Open \u25b8</a>';
    if(g.does && g.does.length) h += '<div class="gen-does"><span class="gen-lbl">IT DOES</span>' + g.does.map(x => '• ' + e(x)).join('<br>') + '</div>';
    if(g.needs && g.needs.length) h += '<div class="gen-does">' + '<span class="gen-lbl">STILL NEEDS</span>' + g.needs.map(x => '• ' + e(x)).join('<br>') + '</div>';
    h += '</div>';
    return h;
  }

  /* mount the Phoenix Generators view. Renders the division strip and the body of
     the active division; the DESK (the Student Evaluator's own panel) is NOT
     touched here — it lives beside this in the HTML and app.js shows/hides it. */
  function mount(opts){
    opts = opts || {};
    const strip = document.getElementById("divStrip"), body = document.getElementById("genBody");
    if(!strip || !body){
      if(body) body.innerHTML = '<div class="hint">⚠ src/divisions.js loaded but the view scaffolding is missing — reload the page.</div>';
      return { division:null };
    }
    let active = opts.division || null;
    try{ active = active && div(active) ? active : (sessionStorage.getItem("obi_division") || "net"); }catch(err){}
    if(!div(active)) active = "net";

    strip.innerHTML = DIVISIONS.map(d =>
      '<button class="divbtn' + (d.id === active ? " on" : "") + '" data-div="' + e(d.id) + '">' + ic(d.icon) + ' ' + e(d.name)
      + '<span class="divchip" style="color:' + STATUS[d.status].c + '">' + STATUS[d.status].label + '</span></button>').join("");

    const d = div(active);
    let html = '<div class="gen-head">' + ic(d.icon) + ' <b>' + e(d.name) + '</b>'
      + (d.full ? ' <span class="gen-full">' + e(d.full) + '</span>' : '') + '</div>'
      + '<div class="hint" style="margin-top:2px">' + e(d.blurb) + '</div>';
    /* GENERATORS, GROUPED WHEN THEY DECLARE ONE. A division can hold a group
       (a division that wants sub-shelves), and a group reads as one only if the
       shelf says so: a generator with a `group` opens a labelled grid, and the
       next group closes it. Ungrouped generators come first, together. */
    if(d.generators.length){
      let out = "", open = false, shown = "\u0000";
      d.generators.forEach(g => {
        const grp = g.group || null;
        if(grp !== shown){
          if(open){ out += "</div>"; open = false; }
          if(grp) out += '<div class="gen-group">' + e(grp) + "</div>";
          shown = grp;
        }
        if(!open){ out += '<div class="gen-grid">'; open = true; }
        out += card(g);
      });
      if(open) out += "</div>";
      html += out;
    }
    else html += '<div class="sel-row"><span class="sn">Nothing here yet.</span><div class="ss">This division has no generators registered. Add them in <b>src/divisions.js</b> — the navigation reads this registry, nothing else.</div></div>';
    const c = coverage();
    html += '<div class="gen-foot">' + c.live + ' live · ' + (c.scaffold ? c.scaffold + ' scaffold · ' : '') + c.planned + ' planned across ' + DIVISIONS.length + ' divisions — the registry is <b>src/divisions.js</b>. The machinery behind every piece: <b>/constellation</b>.</div>';
    body.innerHTML = html;

    strip.querySelectorAll(".divbtn").forEach(b => { b.onclick = () => { try{ sessionStorage.setItem("obi_division", b.dataset.div); }catch(err){} mount({ division:b.dataset.div }); if(opts.onDivision) opts.onDivision(b.dataset.div); }; });
    body.querySelectorAll(".gen-open[data-open]").forEach(b => { b.onclick = () => { if(opts.onOpen) opts.onOpen(b.dataset.open); }; });
    if(window.ObiFamily && window.ObiFamily.upgrade){ try{ window.ObiFamily.upgrade(body); }catch(err){} }
    return { division:active, html:html };
  }

  window.ObiDivisions = { UMBRELLA, DIVISIONS, STATUS, rows, div, get, coverage, card, chip, mount };
})();
