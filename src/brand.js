/* PrAis BRAND SYSTEM — src/brand.js (`window.ObiBrand`).

   WHAT THIS IS. One place that holds the empire's visual identity, so the
   station, the lessons and every generator role draw the same marks:

     · PALETTE   — the frozen brand tokens (LESSON.008) plus the extension the
                   dossier added: the deep plum court and the antique gold.
     · ICONS     — one inline-SVG icon set, hand-drawn on a 24 grid, stroke
                   currentColor. No icon fonts, no emoji standing in for a
                   concept, no per-surface one-offs.
     · ASSETS    — the marks cut out of the sovereign's own dossier
                   (`src/brand/assets/*.webp`, alpha, see ASSETS below) and the
                   provenance of every one of them.
     · EMBLEMS   — the ranks and modes as VECTOR badges (roundel = the coin
                   ladder, shield = the diagnostic, ring = the seals), so the
                   same drawing survives a 9 mm stamp and a 120 mm print.
     · PATTERNS  — the four tileable beds the pages and panels sit on.
     · HUD       — the chrome: framed panels with corner brackets, the status
                   bar, plates, pills, crests, watermarks, scanlines.
     · DOCTRINE  — GOSPEL 444 itself (the tiger protocol) as data: the modes,
                   the twelve laws, the deck. `GOSPEL444` below.
     · PRINT     — the artwork as files: the wall set, the one sheet, the badge
                   sheet and the rank certificate. `PRINT_ARTIFACTS` below.
     · DESK      — the identity system as a browsable room (◈ Phoenix
                   Generators → MARKETING → Brand & Identity), which is also
                   `/brand` in the chat.

   WHERE THE RULES COME FROM. `src/canon/GOSPEL-999.md` AMENDMENT III
   (BRAND.001–BRAND.010) and AMENDMENT IV (G444.001–G444.012) are the law;
   `src/LESSON-STANDARD.md` LSN-24/25/26/27 is the lesson-side enforcement;
   `src/canon/LEGIONNAIRE-FIELD-GUIDE.md` §13/§14 is the drone's checklist. If
   this file and that law disagree, the law wins.

   THE DOCTRINE'S OWN DECKS ARE SOURCE, NOT DECORATION. The marks below were cut
   from three decks the sovereign supplied — `BestDossierYet-05-11-2026.pdf`
   (15pp, the visual identity), `GOSPEL_444_PROTOCOL.pdf` (12pp, the doctrine)
   and `GOSPEL_444_TIGER_MODE.pdf` (4pp, the diagnostic). The doctrine's words
   live in GOSPEL444; its pictures live in ASSETS. Neither is invented here.

   THE RULE THAT MATTERS MOST. LESSON.008 stands: `#a855f7` system, `#f59e0b`
   reward, `#0f0f1a` ground — immutable, never restyled for a topic's mood.
   The dossier's palette does NOT replace it; it extends it (BRAND.002), and
   the extension is used for chrome and marks, never to restyle a lesson.

   ASSETS ARE SHIPPED, NOT HOTLINKED. Every mark is a file in this generator's
   own `src/brand/assets/`. They were cut from the sovereign's three decks
   (1376x768 raster per page) with pdf.js, background-keyed and feathered, then
   re-encoded as alpha WebP. To rebuild: render the page at scale 1, crop the box
   recorded in ASSETS[].box, then for each pixel take
   `a = max((lum-ground-8)/50, (chroma-26)/70)`; flood-fill the outside from the
   crop's border through pixels with `a < .42` and set alpha for those (enclosed
   darks stay the mark's own interior), feather 5% of each dimension, and encode
   WebP q0.86 at max 720 px. Nothing here is hotlinked and nothing here depends
   on a scratch/ file surviving.
   ========================================================================== */
(function(){
  "use strict";

  /* ---- where this file lives, so the assets resolve from anywhere ---------- */
  const SELF = (document.currentScript && document.currentScript.src) || "";
  let BASE = SELF ? SELF.replace(/[^\/]*$/, "") : "src/";
  try{ const o = localStorage.getItem("obi_brand_base"); if(o) BASE = o; }catch(e){}

  const VERSION = "1.5.0";
  /* assets are content-addressed by hand: bump ASSET_V whenever a file in
     src/brand/assets/ changes, or a browser will keep serving the old one */
  const ASSET_V = "7";

  /* ==========================================================================
     PALETTE — frozen tokens + the extension
     ========================================================================== */
  const PALETTE = {
    system:      { hex:"#a855f7", role:"SYSTEM",  note:"the machine talking: chrome, borders, links, the station's voice" },
    systemDeep:  { hex:"#7c3aed", role:"SYSTEM",  note:"pressed states, gradients' dark end" },
    reward:      { hex:"#f59e0b", role:"REWARD",  note:"everything earned: coins, coins, tiers, wins" },
    rewardLight: { hex:"#f5d98b", role:"REWARD",  note:"headline gradient's light end, hovered gold" },
    ground:      { hex:"#0f0f1a", role:"GROUND",  note:"the void everything sits on — never white" },
    ground2:     { hex:"#140c22", role:"GROUND",  note:"panel fill, one step up from the void" },
    court:       { hex:"#3b1d5c", role:"EXTENSION", note:"dossier: the plum court — panel shells, section bands" },
    courtDeep:   { hex:"#2a1040", role:"EXTENSION", note:"dossier: the deepest plum — inset wells, framed lows" },
    courtLine:   { hex:"rgba(120,80,200,.35)", role:"EXTENSION", note:"the hairline between plum planes" },
    ancient:     { hex:"#e8c565", role:"EXTENSION", note:"dossier: antique gold — engraved marks, seals, brackets" },
    ancientDeep: { hex:"#c9a758", role:"EXTENSION", note:"dossier: gold in shadow" },
    crimson:     { hex:"#e0473f", role:"EXTENSION", note:"dossier: the red circuit — faults, red lights, danger" },
    signal:      { hex:"#5ed5eb", role:"EXTENSION", note:"doctrine: the deck's telemetry cyan — status read-outs, the heads-up line" },
    ember:       { hex:"#dc9438", role:"EXTENSION", note:"doctrine: tiger heat — the top rung of the mode ladder, warnings that are not errors" },
    emberHot:    { hex:"#ffa80b", role:"EXTENSION", note:"doctrine: the flame's hot core — a lit tiger, an earned rung" },
    terminal:    { hex:"#43f65a", role:"EXTENSION", note:"doctrine: the console — terminal panes, the boot line, machine text" },
    jade:        { hex:"#50dc82", role:"STATUS",  note:"LIVE / ok" },
    bone:        { hex:"#efe6d2", role:"TEXT",    note:"dossier: warm bone — display text on plum" },
    ink:         { hex:"#e2e8f0", role:"TEXT",    note:"body text (matches --text-solid)" },
    dim:         { hex:"#94a3b8", role:"TEXT",    note:"secondary text (matches --text-dim)" }
  };

  /* the tiers are LESSON.012's economy; the mark is the same everywhere */
  const TIERS = [
    { id:"mouse",  name:"Mouse",  at:0,    icon:"mouse",  ink:"signal",  note:"you are not broken — the method was" },
    { id:"cub",    name:"Cub",    at:200,  icon:"paw",    ink:"system",  note:"the habit exists" },
    { id:"tiger",  name:"Tiger",  at:500,  icon:"tiger",  ink:"ember",   note:"it comes out of you without the translation" },
    { id:"legend", name:"Legend", at:5000, icon:"crown",  ink:"ancient", note:"you teach it to someone else" }
  ];

  /* THE MODE LADDER — the diagnostic scale, 0-100 (GOSPEL 444, protocol p3 and
     the tiger-mode deck p4). The coin ladder above is LESSON.012's economy.
     The two deliberately share three names and they are NOT the same number: a
     student can be a Tiger on the diagnostic and hold 40 coins in the lesson.
     Never "fix" one to match the other — G444.003 and LESSON.012 are separate
     instruments that agree on vocabulary and on nothing else. */
  const MODES = [
    { id:"mouse", name:"MOUSE MODE", at:0,  to:40,  icon:"mouse", ink:"signal", behaviour:"Correct & Quiet",
      reads:["Hesitation. Whispering.","Apologising — \u201csorry, my English is bad\u201d.","A wait-for-permission culture."],
      cost:"Waiting for perfect grammar keeps you silent. The real world carries no red pen." },
    { id:"cub",   name:"CUB MODE",   at:41, to:79,  icon:"paw",   ink:"system", behaviour:"Momentum, held",
      reads:["Developing momentum.","The translation delay is dropping.","Mistakes happen and are recovered from quickly."],
      cost:"The habit exists and the fear is thinning. This is where most of the work is done." },
    { id:"tiger", name:"TIGER MODE", at:80, to:100, icon:"tiger", ink:"ember",  behaviour:"Loud & Wrong",
      reads:["Immediate response. High volume.","Ownership of the room.","Thinking IN English, not ABOUT English."],
      cost:"Velocity over perfection. Confident volume beats quiet accuracy every single time." }
  ];
  function modeOf(score){
    const n = Number(score) || 0;
    if(n >= 80) return MODES[2];
    if(n >= 41) return MODES[1];
    return MODES[0];
  }

  /* ==========================================================================
     GOSPEL 444 — the doctrine, as data.
     Transcribed from `GOSPEL_444_PROTOCOL.pdf` (12pp) and
     `GOSPEL_444_TIGER_MODE.pdf` (4pp). The words are the sovereign's own; this
     object only holds them. AMENDMENT IV of GOSPEL-999 (G444.001–G444.012) is
     the law that cites them; PROPOSED, not merged.
     ========================================================================== */
  const GOSPEL444 = {
    version: "2.2",
    motto: "We do not teach English. We unlock permission.",
    closing: "Wake up the tiger. The cage is open. The choice is yours.",
    closingVn: "GI\u1ea2I M\u00c3 TI\u1ec0M N\u0102NG: Ph\u00e1 v\u1ee1 Gi\u1edbi h\u1ea1n",
    sources: ["GOSPEL_444_PROTOCOL.pdf", "GOSPEL_444_TIGER_MODE.pdf"],
    laws: [
      { n:"G444.001", id:"edge", title:"THE ULTIMATE EDGE", mark:"edge",
        line:"// METRIC: 80% SUCCESS RATE. // DELTA: 2.5x INDUSTRY STANDARD",
        body:["A completion and success rate that rewrites the rules. Traditional centres operate at a 30% baseline; the NET Protocol guarantees 80% mastery.","We do not teach English. We unlock permission.","Dominating the information age is the stated ambition, not a slogan: the mark is a phoenix climbing out of a broken stack."] },
      { n:"G444.002", id:"prison", title:"THE GRAMMAR PRISON", mark:"elephant",
        line:"GRAMMAR FIRST = FEAR FIRST",
        body:["Traditional systems beat the confidence out of students and replace it with learned helplessness. Strong body, chained mind.","The chain is the method itself: [Listen] \u2192 [Translate to Vietnamese] \u2192 [Translate to English] \u2192 [Speak (Blocked)].","The result is the Snowman Freeze. Reading \u2192 Writing \u2192 Speaking teaches a translation delay into the head; that delay is why a student freezes.","You are not broken. Your method was."] },
      { n:"G444.003", id:"shift", title:"THE PSYCHOLOGICAL SHIFT", mark:"cub",
        line:"MOUSE 0-40 \u00b7 CUB 41-79 \u00b7 TIGER 80-100",
        body:["One diagnostic, three modes. It measures behaviour, not grammar: hesitation and apology at the bottom, immediate volume and ownership of the room at the top.","A student's mode is read from what they DO in the room. It is the only score the doctrine asks a coach to hold in mind."], modes:true },
      { n:"G444.004", id:"law", title:"THE IMMUTABLE LAW", mark:"roar",
        line:"LOUD & WRONG BEATS QUIET & RIGHT. EVERY SINGLE TIME.",
        body:["Quiet & Right is the trap: waiting for perfect grammar guarantees silence, and the real world does not carry a red pen.","The Tiger Engine is the goal: velocity over perfection. In the boardroom, confidence and high-volume delivery command respect.","We train the student to weaponise the words they already own so that they never hesitate again."] },
      { n:"G444.005", id:"advantage", title:"THE 2026 UNFAIR ADVANTAGE", mark:"chip",
        line:"ENGLISH + AI INTEGRATION",
        body:["English lets a student reach the international market and lead cross-border teams. AI multiplies one person's output to ten.","English alone is the old game. AI alone leaves you unable to communicate value. Both together make a person structurally unemployable-proof."] },
      { n:"G444.006", id:"acquisition", title:"THE NATURAL ACQUISITION ENGINE", mark:"infinity",
        line:"THE 60% RULE \u00b7 COMPREHENSIBLE INPUT",
        body:["The brain acquires language fastest when it naturally understands roughly 60% of what it hears — the Magic Zone.","Stop translating. Start understanding with the ears. Comprehension is the input; the output is reflex.","The engine is a loop, not a ladder: input feeds output and output feeds the next input."] },
      { n:"G444.007", id:"lifestyle", title:"THE 1-HOUR LIFESTYLE", mark:"dial45",
        line:"THE 45/15 PROTOCOL \u00b7 INPUT 45 \u00b7 OUTPUT 15",
        body:["We do not add time to a student's life; we optimise the time already in it. Homework is dead.","45 minutes of input: passive absorption of high-interest content \u2014 YouTube, podcasts \u2014 during the commute or the gym.","15 minutes of output: active, high-pressure mimicry, shadowing and speaking, to activate the Tiger Voice.","The ratio is the instrument. It is tracked daily, and it is the only number the AI-PET demands."] },
      { n:"G444.008", id:"retention", title:"THE RETENTION CODE", mark:"pyramid",
        line:"THE 10-5-5-3 LESSON ANATOMY",
        body:["10 core vocabulary words, taught strictly in real-world context and full sentences \u2014 never isolated lists.","5 idioms: the conversational glue textbooks refuse to teach.","5 slang expressions: what professionals and native speakers actually use in meetings and on the street.","3 interactive games, deployed at warm-up, mid-lesson and finale, to drive deep retention.","Base code supported by UK Jolly Phonics (42 core sounds) to fix Vietnamese phonetic interference."] },
      { n:"G444.009", id:"aipet", title:"YOUR POCKET SOVEREIGN: AI-PET", mark:"phone",
        line:"SPACED REPETITION AT 1 \u00b7 3 \u00b7 7 \u00b7 14 \u00b7 30 DAYS",
        body:["Solving the Goldfish Problem. Human memory decays; the AI-PET tracks the exact Key Struggle Points and reintroduces them at mathematically optimal intervals.","Tough Love Mode is a 24/7 accountability engine, not a passive chatbot: it tracks the 45/15 daily ratio, demands progress, and refuses to let a student slide back into Mouse Mode."] },
      { n:"G444.010", id:"ecosystem", title:"THE ECOSYSTEM", mark:"atom",
        line:"ENVIRONMENT BEATS WILLPOWER",
        body:["You do not fight alone. Willpower fails; an ecosystem sustains.","Community events: monthly high-stakes networking, stepping out of the practice room to pressure-test the new Tiger Voice in the real world.","The buddy system: weekly peer practice with partners at the exact same level.","The safe space: a zero-judgment coaching zone where mistakes are treated as data discoveries, not failures."] },
      { n:"G444.011", id:"guarantee", title:"THE 100% CONFIDENCE GUARANTEE", mark:"confidence",
        line:"WE ARE DOCTORS, NOT SALESPEOPLE",
        body:["We do not promise perfect grammar in 30 days.","We promise that a student who follows the 45/15 protocol will completely lose the fear of opening their mouth to speak English.","Take the first month. If there is no massive, measurable surge in speaking velocity and confidence, the tuition is refunded in full. The student risks nothing."] },
      { n:"G444.012", id:"wake", title:"WAKE UP THE TIGER", mark:"phoenix",
        line:"THE CAGE IS OPEN \u00b7 THE CHOICE IS YOURS",
        body:["The doctrine ends where every lesson begins: the student steps out of the grammar prison and claims the unfair advantage.","GI\u1ea2I M\u00c3 TI\u1ec0M N\u0102NG: Ph\u00e1 v\u1ee1 Gi\u1edbi h\u1ea1n \u2014 decode the potential; break the limit.","BEGIN PROTOCOL."] }
    ],
    /* the matrix: the traditional centre against the sovereign system (p10) */
    matrix: [
      ["SUCCESS RATE", "30%", "80%"],
      ["PRIMARY FOCUS", "Grammar drills & passing tests", "High-stakes communication & AI proficiency"],
      ["PEDAGOGY", "Outdated textbooks, 30-student lectures", "The 10-5-5-3 context anatomy & 1-on-1 coaching"],
      ["ACCOUNTABILITY", "Zero daily tracking; reliance on willpower", "AI-PET tracking & spaced repetition"],
      ["THE RESULT", "The Snowman Freeze & Mouse Mode", "The Tiger Engine & an 80% success rate"]
    ],
    /* the twelve slides, in order. `marks` are the doctrine's own pictures;
       `chain` is the translation the prison forces; `modes` pulls the ladder. */
    slides: [
      { n:1,  law:"G444.001", kicker:"PROTOCOL V" + "2.2", title:"THE ULTIMATE EDGE", marks:["phoenix","edge"], chain:[] },
      { n:2,  law:"G444.002", kicker:"DIAGNOSIS", title:"THE GRAMMAR PRISON", marks:["elephant"], chain:["[Listen]","[Translate to Vietnamese]","[Translate to English]","[Speak (Blocked)]"] },
      { n:3,  law:"G444.003", kicker:"THE SHIFT", title:"THE PSYCHOLOGICAL SHIFT", marks:["mouse2","cub","tiger2"], modes:true },
      { n:4,  law:"G444.004", kicker:"IMMUTABLE LAW", title:"LOUD & WRONG", marks:["roar","mouse2"] },
      { n:5,  law:"G444.005", kicker:"2026", title:"THE UNFAIR ADVANTAGE", marks:["globe","chip","brain2"] },
      { n:6,  law:"G444.006", kicker:"ACQUISITION", title:"THE 60% RULE", marks:["brain2","infinity"] },
      { n:7,  law:"G444.007", kicker:"LIFESTYLE", title:"THE 45/15 PROTOCOL", marks:["dial45"] },
      { n:8,  law:"G444.008", kicker:"RETENTION", title:"THE 10-5-5-3 ANATOMY", cards:[["10","Core vocabulary words","In real-world context and full sentences. Never isolated lists."],["5","Idioms","The conversational glue textbooks refuse to teach."],["5","Slang expressions","What professionals actually use, in meetings and on the street."],["3","Interactive games","At warm-up, mid-lesson and finale."]], marks:["bookshelf"] },
      { n:9,  law:"G444.009", kicker:"ACCOUNTABILITY", title:"THE AI-PET", marks:["phone"], chain:["1 DAY","3 DAYS","7 DAYS","14 DAYS","30 DAYS"] },
      { n:10, law:"G444.010", kicker:"ECOSYSTEM", title:"ENVIRONMENT BEATS WILLPOWER", marks:["atom"] },
      { n:11, law:"G444.011", kicker:"GUARANTEE", title:"THE 100% CONFIDENCE GUARANTEE", marks:["confidence"] },
      { n:12, law:"G444.012", kicker:"BEGIN PROTOCOL", title:"WAKE UP THE TIGER", marks:["phoenix","roar"], closing:true }
    ]
  };
  const LAW_ICON = { "G444.001":"chart", "G444.002":"chain", "G444.003":"gauge", "G444.004":"volume", "G444.005":"globe", "G444.006":"brain", "G444.007":"clock", "G444.008":"gamepad", "G444.009":"repeat", "G444.010":"network", "G444.011":"shield", "G444.012":"flame" };

  /* ==========================================================================
     MARKET — THE OTHER REGISTER.
     GOSPEL 444 is what WE hold (the doctrine: internal, blunt, for the coach).
     This is what we SAY (the marketing register: outward, for the parent and
     the student). The two are the same system told to two different readers,
     which is why they live in one file and cite each other.

     Source: SEVEN HAND-PICKED SLIDES sent by the sovereign on 2026-09-22 —
     "these I hand picked for marketing and teaching methodology". Every line
     below is TRANSCRIBED from them, not invented. Each entry names the slide
     it came from (`from`) and the still that ships in src/brand/assets/.
     ========================================================================== */
  const MARKET = {
    version: "2.0",
    source: "7 hand-picked slides (2026-09-22)",
    source2: "4 more hand-picked slides + 5 PHOENIX decks (2026-09-22, second send)",
    headline: "We do not sell language; we sell permission to be powerful.",
    headlineVn: "Ch\u00fang t\u00f4i kh\u00f4ng b\u00e1n ng\u00f4n ng\u1eef \u2014 ch\u00fang t\u00f4i b\u00e1n quy\u1ec1n \u0111\u01b0\u1ee3c m\u1ea1nh m\u1ebd.",
    kicker: "FROM MOUSE TO TIGER",
    sub: "The Sovereign Architect's Guide to English Mastery",
    subVn: "T\u1eeb Chu\u1ed9t \u0111\u1ebfn H\u1ed5: H\u01b0\u1edbng d\u1eabn l\u00e0m ch\u1ee7 ti\u1ebfng Anh cho Ki\u1ebfn tr\u00fac s\u01b0 T\u1ef1 ch\u1ee7",
    motto: "We do not teach English. We unlock permission.",
    closing: "Wake up the tiger. The cage is open. The choice is yours.",
    closingVn: "GI\u1ea2I M\u00c3 TI\u1ec0M N\u0102NG: Ph\u00e1 v\u1ee1 Gi\u1edbi h\u1ea1n",
    offer: "Message for your FREE assessment.",
    /* the three pillars (slide: pillars) */
    pillars: [
      { icon:"book",    title:"USEFUL WORDS",       body:"Only the exact language used in the boardroom and on the streets." },
      { icon:"repeat",  title:"SPACED REPETITION",  body:"Interrupting memory decay and forcing long-term mastery." },
      { icon:"network", title:"COMMUNITY IMMERSION",body:"Surround yourself with native speakers for natural acquisition." }
    ],
    pillarKick: "How we break the mold with useful words, spaced repetition, and community immersion",
    /* the 1-hour architecture (slide: hour) */
    hour: {
      title: "THE 1 HOUR ARCHITECTURE",
      sub: "1 hour, fit it in your current schedule.",
      line: "The highest system is designed to be practiced anywhere, and not to cost them any extra time.",
      sub2: ["natural english training \u00b7 study english, naturally"],
      donut: [[75, "PASSIVE INPUT (immersion)", "45m"], [25, "HIGH-INTENSITY OUTPUT (speaking)", "15m"]],
      ratio: "45m passive input \u00b7 15m high-intensity output \u2014 a daily 1-hour lifestyle integration"
    },
    /* the 60% rule (slides: 60-input, 60-delay) */
    sixty: {
      title: "THE 60% RULE",
      titleVn: "Quy t\u1eafc 60%: \u0110\u1ea7u v\u00e0o d\u1ec5 hi\u1ec3u",
      telem: "COGNITIVE INPUT",
      big: "60%",
      inputs: ["YouTube", "Podcasts", "Context"],
      boxes: [
        ["THE MECHANISM",  "The brain learns language fastest when it naturally understands ~60% of what it hears."],
        ["THE DISRUPTION", "Babies do not use dictionaries. If you pause every five seconds to hunt for a word, you jam your cognitive gears."],
        ["THE OUTCOME",    "By flooding the brain with context, students stop perfectly translating individual words and build real-time pattern recognition."]
      ],
      three: [
        ["Comprehensible Input", "The brain learns fastest when it naturally understands ~60% of auditory context."],
        ["Stop Translating", "We flood the brain with context, bypassing the need for a mental dictionary."],
        ["Pattern Recognition", "The brain artificially recreates natural native acquisition, unlocking the remaining 40% automatically."]
      ],
      quote: "Babies don't use dictionaries to learn Vietnamese. Stop treating your brain like a filing cabinet.",
      law: "Logic comes AFTER confidence."
    },
    /* the AI-PET (slide: aipet) */
    aipet: {
      title: "THE AI-PET",
      lead: "The AI-PET plugs the leaks in the forgetting curve",
      chart: "The Forgetting Curve",
      retention: "100% Retention",
      days: ["1", "3", "7", "14", "30"],
      status: "Tough Love Mode: 24/7 Accountability Active",
      points: [
        ["The Goldfish Problem", "Human brains are biologically designed to forget what isn't reinforced. Willpower is a lie."],
        ["Spaced Repetition", "The AI logs Key Struggle Points and mathematically strikes at 1, 3, 7, 14 and 30 days to embed data permanently."],
        ["Tough Love Mode", "A 24/7 accountability engine in your pocket. Miss a day, the streak decays."]
      ]
    },
    /* the positioning (slide: permission) */
    phases: {
      title: "WE DO NOT SELL LANGUAGE; WE SELL PERMISSION TO BE POWERFUL",
      items: [
        ["PHASE 1 \u00b7 THE ELEPHANT CHAIN", "Trapped by childhood conditioning and the fear of the red pen."],
        ["PHASE 2 \u00b7 THE ZERO-JUDGMENT ZONE", "Mistakes become fuel. Logic comes AFTER confidence."],
        ["PHASE 3 \u00b7 SOVEREIGN COMMAND", "Immediate response, high volume, absolute ownership of the room."]
      ]
    },
    /* the master slide (mouse2tiger) */
    master: {
      title: "FROM MOUSE TO TIGER",
      mouseTitle: "The 'Mouse Mode' Identity",
      mouseBody: "A state of hesitation characterized by whispering, apologizing, and the 'Imposter Voice' during conversations.",
      quote: ["You are not broken.", "Your method was."],
      quoteSub: "Traditional schooling built a cage of fear. NET is the biological intervention to break it.",
      delay: "The Translate-in-Head Delay",
      delayBody: "Traditional 'Grammar First' training forces the brain to buffer, creating the 'speaking gap' under pressure.",
      delayTag: "CRASH",
      cure: "THE CURE \u2014 THE TIGER PROTOCOL",
      findings: [
        ["80% Success Rate", "NET's infrastructure beats human motivation with a 4x completion rate of traditional centres."],
        ["The 2026 Unfair Advantage", "Dual mastery of English communication and AI proficiency makes a professional irreplaceable in the global market."]
      ]
    },
    /* the comparison (mouse2tiger) */
    compare: [
      ["FOCUS",        "Grammar & worksheets",           "Confidence & high-velocity output"],
      ["DAILY HABIT",  "2-hour rigid classes",           "45/15 lifestyle integration"],
      ["MEMORY",       "'Study & hope'",                 "AI-PET spaced repetition"]
    ],
    /* the two ladders, for a marketing reader (never merged with each other) */
    claims: { success: "80%", baseline: "30%", multiple: "4\u00d7", edge: "English + AI" },

    /* ------------------------------------------------------------------
       THE SECOND BATCH. Same rule as the first: every line below is
       transcribed from a slide the sovereign sent, and the slide it came
       from is named. Nothing here is copywriting.
       ------------------------------------------------------------------ */

    /* the methodology summary (slide: mkt2-architecture) */
    architecture: {
      title: "FROM MOUSE TO TIGER: THE ARCHITECTURE OF FLUENCY",
      badges: ["THE IDENTITY TRANSFORMATION", "THE METHODOLOGY & INFRASTRUCTURE"],
      transform: [
        ["Exit \"Mouse Mode\"", "Overcome the hesitation, whispering, and \"Translate-In-Head\" delays caused by traditional grammar-first schooling."],
        ["Activate the \"Tiger Voice\"", "Develop immediate response velocity and ownership of the room through unapologetic confidence."]
      ],
      wave: {
        quiet: "\"Quiet and Right\" (Grammar Fear)",
        loud: "\"Loud and Wrong\" > \"Quiet and Right\"",
        body: "Prioritizing volume and velocity over perfect grammar to break the psychological fear of mistakes."
      },
      method: [
        ["THE 45/15 DAILY PROTOCOL", "Integrate 45 minutes of passive immersion and 15 minutes of high-intensity active output."],
        ["THE 24/7 AI-PET COACH", "An AI-augmented trainer that solves \"The Goldfish Problem\" via mathematically optimized spaced repetition."],
        ["80% PROGRAM COMPLETION RATE", "NET's infrastructure-based approach outperforms the 30% success rate found at traditional centers."]
      ],
      compare: [
        ["FOCUS",        "Grammar & Exams",           "Communication & AI Mastery"],
        ["SUCCESS RATE", "~30%",                      "80%"],
        ["DAILY HABIT",  "High-Friction (2hr classes)","Low-Friction (45/15 Protocol)"]
      ]
    },
    /* the diagnosis, and the three failures it names (slide: mkt2-failure) */
    diagnose: {
      title: "THE CORE MECHANICAL FAILURE: MOUSE MODE",
      titleVn: "L\u1ed7i C\u01a1 h\u1ecdc C\u1ed1t l\u00f5i: Ch\u1ebf \u0111\u1ed9 Chu\u1ed9t nh\u1eaft",
      items: [
        ["The Translate-in-Head Delay", "The exact moment the brain buffers, causing the Snowman Freeze in high-pressure environments."],
        ["Fear First = Grammar First", "Traditional schools built a cage of hesitation using the red pen. Students operate at 30% success rates because they are terrified to speak."],
        ["The Apology Reflex", "The tragic conditioning of the adult professional: \u201cSorry, my English is bad.\u201d"]
      ],
      lens: ["VIETNAMESE THOUGHT", "ENGLISH OUTPUT"],
      lensNote: "The head in the slide is cut by one chain between those two labels. The failure does not live in the vocabulary \u2014 it lives on the wire between them.",
      read: "The three failures are one mechanism with three faces: the buffer, the fear that built it, and the apology that keeps it standing."
    },
    /* retention, sold as biology (slide: mkt2-biology) */
    biology: {
      title: "THE BIOLOGICAL INTERVENTION",
      chart: "The Goldfish Problem",
      axis: "Activation Timeline",
      days: ["Day 1", "Day 3", "Day 7", "Day 14", "Day 30"],
      peak: "100%",
      toughLove: "Tough Love Mode: Time to practice.",
      points: [
        ["The Leaky Bucket", "The brain deletes 80% of unreinforced data within 48 hours. You don't have a bad memory, you lack a system."],
        ["Spaced Repetition", "The AI-PET tracks 'Key Struggle Points' and executes mathematically optimal re-introductions."],
        ["Tough Love Mode", "24/7 accountability. A pocket coach that prevents regression into Mouse Mode."]
      ],
      status: "// SYSTEM STATUS: BIOLOGICAL INTERVENTION ENGAGED // GOSPEL 444 PROTOCOL V.2.5 // DATALOG: 2026-ARCHITECT //"
    },
    /* the ad pipeline, and the law printed under it (slide: mkt2-adpipeline) */
    ads: {
      title: "PHASE 0 VISUAL AD PIPELINE",
      cards: [
        [1, "The Transformation: Mouse to Tiger.",                          "Mouse \u2192 Tiger \u00b7 BECOME THE TIGER"],
        [2, "The AI Multiplier: English + AI.",                             "Input: English \u00b7 Vietnamese \u2192 the machine"],
        [3, "Summer Intensive: Break the chains this summer.",              "BREAK"],
        [4, "Loud & Wrong: Speak first, perfect later.",                    "SPEAK FIRST \u00b7 PERFECT LATER"],
        [5, "The NET Difference: The Math of the Tiger (80% Success Rate).","80%"],
        [6, "The Lakeview Local: Professional training at your doorstep.",  "LAKEVIEW"]
      ],
      law: "The Law of Bilingual Hierarchy: English acts as the commanding visual anchor (Imperial Gold); Vietnamese acts as the sleek, clean subtitle (White). No text-heavy AI slop.",
      lawShort: "THE LAW OF BILINGUAL HIERARCHY",
      lawParts: [["ENGLISH", "the commanding visual anchor \u00b7 Imperial Gold"], ["TI\u1ebeNG VI\u1ec6T", "the sleek, clean subtitle \u00b7 White"]],
      lawBan: "No text-heavy AI slop.",
      why: "A slide that grades well in Vietnamese and badly in English teaches the reader that English is the lesser half. Print the anchor in English and the translation underneath it, or do not print the translation at all."
    },
    /* the version ladder \u2014 the decks quote four strings, we hold one */
    protocol: {
      deckVersions: ["V1.3", "V2.0", "V2.2", "V2.5"],
      holds: "V2.2",
      note: "Four version strings are printed across the corpus: V1.3 on the 404 page of THE TIGER ENGINE, V2.0 on the Memory HUD, V2.2 in the two sealed GOSPEL decks we transcribed, and V2.5 on the biological-intervention slide. The market has run ahead of the transcription. That is recorded here as a fact and nothing else \u2014 a sealed source is not edited to match a newer one (G444.012). The delta is on the wall in src/ProposedG999.md."
    },
    /* the second set of hand-picked slides, in the order they tell the story */
    shots2: [
      { id:"mkt2-failure",      tag:"THE DIAGNOSIS", what:"the core mechanical failure, named in two languages \u2014 the buffer, the red pen, the apology", where:"the top of the enquiry funnel, before any promise" },
      { id:"mkt2-architecture",  tag:"THE METHOD",    what:"the half of the offer that is not psychology: 45/15, the AI-PET, 80% completion", where:"the 'what do I actually get' objection" },
      { id:"mkt2-biology",      tag:"THE CASE",      what:"memory decay as biology, with Tough Love Mode answering it", where:"accountability, sold honestly" },
      { id:"mkt2-adpipeline",   tag:"THE CREATIVE",  what:"six ads and the bilingual law that governs every one of them", where:"the campaign brief \u2014 and the print room's ad sheet" }
    ],
    /* the hand-picked slides, in the order they tell the story */
    shots: [
      { id:"mkt-mouse2tiger", tag:"THE MASTER", what:"the whole offer on one page \u2014 the mouse, the cure, the findings, the comparison", where:"the enrolment page, the first thing a parent sees" },
      { id:"mkt-pillars",     tag:"THE PILLARS", what:"useful words \u00b7 spaced repetition \u00b7 community immersion", where:"the 'how it works' band" },
      { id:"mkt-hour",        tag:"THE HOUR",    what:"one hour, fitted into the life the student already has", where:"the schedule objection, answered" },
      { id:"mkt-60-input",    tag:"THE 60%",     what:"inputs into a cognitive head: mechanism, disruption, outcome", where:"the method room and the parent page" },
      { id:"mkt-60-delay",    tag:"THE DELAY",   what:"why translating in your head costs a student the sentence", where:"the diagnosis, before the offer" },
      { id:"mkt-aipet",       tag:"THE CURVE",   what:"the forgetting curve, struck at 1/3/7/14/30 days", where:"accountability, sold honestly" },
      { id:"mkt-permission",  tag:"THE PROMISE", what:"the elephant chain, the zero-judgment zone, sovereign command", where:"the positioning slide" }
    ]
  };

  /* ==========================================================================
     THE PHOENIX RISING CODEX — the third register.
     GOSPEL 444 is what the coach holds. MARKET is what we say to the parent.
     This is what the sovereign holds: the strategy, the zone, the pipeline,
     the stack, the proof, and the run log. Transcribed on 2026-09-22 from five
     decks he sent \u2014 PHOENIX_RISING_CODEX (12pp), Sovereign_Tiger_Protocol
     (15pp), THE_TIGER_ENGINE (12pp), Tiger_Engine_Protocol (17pp) and the run
     log REINCARNATION_RUN_305 (10pp).

     ONE DELIBERATE OMISSION, STATED PLAINLY. The run log carries real student
     names and live vault usernames. This file is public source the moment the
     generator is saved, so the log is transcribed as a FORMAT \u2014 five bands,
     four protocols, two laws \u2014 with the ledger left empty (BRAND.028). Every
     other line here is the sovereign's own words.
     ========================================================================== */
  const CODEX = {
    version: "1.0",
    deck: "PHOENIX RISING OPERATIONAL CODEX",
    sub: "Natural English Training (NET) \u2014 Strategy & Architecture",
    clearance: "// SYSTEM STATUS: OPERATIONAL // SECURITY CLEARANCE: ULTRA // GOSPEL 444 PROTOCOL //",
    sources: ["PHOENIX_RISING_CODEX.pdf (12pp)", "Sovereign_Tiger_Protocol.pdf (15pp)", "THE_TIGER_ENGINE.pdf (12pp)", "Tiger_Engine_Protocol.pdf (17pp)", "REINCARNATION_RUN_305.pdf (10pp)"],
    pages: 66,

    advantage: {
      title: "THE UNFAIR ADVANTAGE: DUAL MASTERY",
      halves: [
        ["ENGLISH COMMUNICATION MASTERY", ["Fluency & Pattern Recognition", "Commanding Voice Projection", "Unrestricted Global Access"]],
        ["AI COMMAND PROFICIENCY", ["Workflow Automation", "10x Productivity Output", "Digital Leverage"]]
      ],
      centre: "THE 2026 SOVEREIGN OPERATOR",
      viet: "K\u1EBB B\u1EA5T KH\u1EA3 CHI\u1EBEN B\u1EA1I \u2014 the irreplaceable one",
      flip: "In 2026, knowing only English is like holding a flip-phone.",
      sell: "We do not just sell language; we sell the ability to command a supercomputer to do the work of 10 people and report on it fluently in English.",
      law: "Neither half is the product. The overlap is the product \u2014 English is what lets the machine's output be sold."
    },

    lakeview: {
      title: "LAKEVIEW DEPLOYMENT ZONE",
      facts: [
        ["THE WEALTH SURGE", "98% surge in millionaire population over the past decade. Boom in tech and crypto wealth."],
        ["THE INFRASTRUCTURE", "USD $10 billion spending: Ring Road 3, Metro Line 2 development fueling rapid urbanization."],
        ["THE REAL ESTATE", "30.1 ha luxury development; prime villas transacting between USD $600K\u2013$1.2M."]
      ],
      avatar: "TARGET AVATAR: THE AMBITIOUS MANAGER. WORKING 50+ HOURS/WEEK.",
      avatarWhy: "PRIME TARGET FOR HYPER-EFFICIENT, IN-HOME PROFESSIONAL COACHING.",
      law: "A zone is chosen because the buyer is already inside it: time-poor, cash-rich, and structurally unable to attend an evening class. That is the entire reason the 45/15 exists \u2014 the deliverable is designed around this buyer, not the other way round."
    },

    pipeline: {
      title: "THE M2 AUTOMATION PIPELINE",
      sub: "A fail-closed system to convert Mouse Mode into pipeline revenue.",
      stages: [
        ["THE HOOK & QUALIFICATION", "Instant validation of pain points (Grammar Prison, Translate-in-Head)."],
        ["THE DIAGNOSIS & TRUTH", "Shift blame from the user to the traditional method. Introduce NET solution."],
        ["THE PUPPY DOG CLOSE", "Offer FREE 30-Minute In-Home Diagnostic and ONE immediate win."],
        ["THE SCHEDULING BRANCH", "User clicks Book \u2192 Calendly integration. User clicks Question \u2192 Seamless manual takeover."]
      ],
      law: "Two exits, one of them human. The branch is the whole design: a machine qualifies, a person closes, and nobody is left standing in a form."
    },

    stack: {
      title: "THE NET SOVEREIGN ARCHITECTURE",
      layers: [
        ["THE BASE CODE", "UK Jolly Phonics (42 core sounds) fixing phonetic interference."],
        ["THE ENGINE", "The 10-5-5-3 Anatomy & 45/15 Habit. Mechanical daily execution."],
        ["THE INFRASTRUCTURE", "The AI-PET. Spaced repetition and 24/7 accountability."],
        ["THE TIGER ENGINE", "Loud & wrong, velocity over perfection, total ownership."],
        ["THE TIGER", "The student, who by the end is teaching it to someone else."]
      ],
      line: "We do not sell English lessons. We sell Permission to be Powerful.",
      read: "Read it bottom-up: the code is fixed first, then the daily engine, then the machine that enforces it, then the voice, and only then the person. Every layer is load-bearing \u2014 remove the base code and accent blocks the rest; remove the infrastructure and the base code leaks away."
    },

    audit: {
      title: "STOP GUESSING. START AUDITING.",
      q: "What Is Your Tiger Score?",
      minutes: "THE 30-MINUTE CLINICAL DIAGNOSTIC",
      truth: "Most centers give you a level test to sell a textbook. We give you a clinical diagnosis of your communication engine.",
      steps: [
        ["DIAGNOSE", "Map your exact Mouse-to-Tiger score."],
        ["IDENTIFY", "Find the specific Elephant Chain causing your translation delay."],
        ["EXECUTE", "Give you ONE immediate win to elevate your speaking volume and velocity."]
      ],
      close: "Hope is not a strategy. Data does not lie. We are doctors, not salespeople.",
      cta: "Message AUDIT to secure your seat at the table."
    },

    proof: {
      title: "THE MATH OF THE TIGER",
      numbers: [
        ["95%", "Report a massive increase in speaking confidence within their first 30 days."],
        ["80%", "Full program completion rate."],
        ["40%", "Measurable increase in speaking volume and velocity in month one."]
      ],
      baseline: "80% completion at NET against a 30% industry average.",
      line: "Data doesn't lie. We track confidence, not just vocabulary.",
      /* THE CORPUS CONTRADICTS ITSELF HERE, AND THE CONTRADICTION IS THE RECORD */
      delta: "TWO MULTIPLES ARE PRINTED IN THE SOVEREIGN'S OWN DECKS: 2.5\u00d7 (G444.001 and THE TIGER ENGINE: \u201c2.5x higher than the industry average of 30%\u201d) and 4\u00d7 (the master marketing slide: \u201ca 4x completion rate of traditional centres\u201d). 80 against 30 is 2.67\u00d7. Neither number is corrected here; both are carried, and no surface may quietly pick one. This is the debt BRAND.019 names, now with a measurement against it \u2014 see src/ProposedG999.md."
    },

    retention: {
      title: "RETENTION, AS ARCHITECTURE",
      bucket: "Human Biology is a Leaky Bucket.",
      leak: "Without a system, the brain leaks 80% of new information within 48 hours.",
      goldfish: "You do not have a bad memory. You have a human brain designed to forget unreinforced data.",
      statusQuo: "Traditional Saturday classes are a biological lie. By Tuesday, the data is gone.",
      facts: [
        ["THE 48-HOUR WINDOW", "AI identifies your precise 48-hour decay window."],
        ["THE STRIKE AT 60%", "We wait until you are exactly 60% likely to forget, then we strike."],
        ["THE 8-TIME RULE", "We don't ask you to manually memorize. The system ensures you encounter the exact word in context 8 times until it becomes subconscious."]
      ],
      hud: "The Memory HUD: 100 \u00b7 80 \u00b7 60 \u00b7 40 \u00b7 20 down the days 1 \u00b7 3 \u00b7 7 \u00b7 14 \u00b7 30, and every interruption resets the curve to 100%.",
      harvest: "Struggle Data Harvesting: OBI logs every hesitation, stutter and mispronunciation during a session as a specific Key Struggle Point.",
      clause: ["FAIL-CLOSED", "Miss a day, the AI-PET streak decays. You are either growing or dying. There are no participation trophies."]
    },

    laziness: {
      title: "WEAPONIZING THE MACHINE: STRATEGIC LAZINESS",
      dumb: ["DUMB LAZINESS (THE OSTRICH)", ["Burying your head in the sand.", "Doing repetitive, low-value homework.", "Relying on fragile human willpower."]],
      smart: ["STRATEGIC LAZINESS (THE ARCHITECT)", ["Using AI to automate the grunt work.", "Doing the work of 10 people.", "Focusing 100% of your human energy on activating your Tiger Voice."]],
      maths: "1 PROFESSIONAL + AI = 100\u00d7 OUTPUT",
      report: "Flawless English Reporting",
      worker: ["THE OBSOLETE MODEL (THE WORKER)", ["Relying solely on 8 years of experience.", "Performing manual grunt work.", "Whispering in meetings to stay safe."]],
      architect: ["THE 2026 MANDATE (THE ARCHITECT)", ["Commanding a supercomputer to do the work of 10 people.", "Automating the grunt work.", "Reporting on the results fluently in English."]],
      ship: "Ignoring AI is drinking on the deck of a sinking ship. You must build a life raft before the rain starts."
    },

    /* the run log, as a FORMAT. No identities, by BRAND.028. */
    readout: {
      title: "THE CLASSIFIED READOUT",
      source: "REINCARNATION_RUN_305.pdf \u2014 the station's own session, written up as a deck",
      note: "The run log is transcribed as a format, never as a ledger. What is kept is the shape: a run is written up as five bands, and the labels are filled in by hand at the time.",
      bands: ["THE INCOMING SYSTEM STATE", "CLASSIFIED READOUT", "THE DIAGNOSTIC PATHWAY", "SYSTEM UPDATE", "THE LAW THE RUN PRODUCED"],
      protocols: [
        ["444.ESD.AUTH.SINGLE_SOURCE", "One authoritative profile source. Historical archives are noise, not truth."],
        ["G-444.SEC.UPDT.A", "Broad searches are banned where they cost quota. Narrow to the active paths."],
        ["G-444.SEC.UPDT.B", "Label every entity PROSPECT or ENROLLED. Ambiguity in a vault becomes a false identity lock."],
        ["G-444.SEC.UPDT.C", "Separate the internal tracking format from the outbound message's intent."]
      ],
      laws: [
        ["THE ANTI-FALSE-CONFLICT LAW", "\u201cIntake first, login second.\u201d A new person is a PROSPECT until a profile exists; an identity conflict is never resolved by picking the older record."],
        ["THE UNFORKABLE MOAT", "Execution speed is preserved by clarifying reality, not by forcing code."]
      ],
      thesis: "A run is written up as evidence, not as a story: what the system was doing when it broke, what was read out, the narrowest path that fixed it, what changed permanently, and the one law the run produced. The bands are the template; the names are not.",
      metrics: [["SIGNAL DENSITY", "6 / 10", "a run is scored on how much of it produced a permanent change"]]
    },

    /* the laws this batch produced (numbering continues from BRAND.020) */
    laws: [
      ["BRAND.021", "THE BILINGUAL HIERARCHY", "English is the anchor, in Imperial Gold. Vietnamese is the subtitle, in white. A slide with no anchor language is not a bilingual slide; it is a text-heavy one."],
      ["BRAND.022", "PHASE 0 IS VISUAL", "The campaign is built as pictures before it is built as copy, and each creative carries the law it is obeying on its own face."],
      ["BRAND.023", "THE ZONE IS CHOSEN, NOT HOPED FOR", "Lakeview is chosen because the buyer is already there, time-poor and cash-rich. The 45/15 answers that buyer; it is not the product."],
      ["BRAND.024", "TWO EXITS, ONE OF THEM HUMAN", "Every automated funnel branches to a person. Fail-closed means no visitor is left standing in a form."],
      ["BRAND.025", "QUOTE THE NUMBER THE SOURCE GIVES", "80 against 30. Where two pages disagree, the disagreement is printed and carried, never averaged and never quietly replaced."],
      ["BRAND.026", "A COUNTER-ARGUMENT IS A QUOTE", "The ostrich, the flip-phone, the sinking ship: use the doctrine's own figure of speech, or write no figure at all."],
      ["BRAND.027", "THE STRIKE AT SIXTY", "Retention is a clock, not a virtue: 48 hours of decay, an interruption at a 60% likelihood of forgetting, and eight encounters to subconscious."],
      ["BRAND.028", "NO CHILD'S NAME IN PUBLIC SOURCE", "A run log is transcribed as a format. Student identities, scores and vault usernames stay out of anything a browser can read."]
    ],

    /* THE CODEX AS SLIDES — the same builder as GOSPEL 444's deck, its own deck */
    slides: [
      { n:1,  kicker:"SECURITY CLEARANCE: ULTRA", title:"THE PHOENIX RISING OPERATIONAL CODEX", lines:["Natural English Training (NET) \u2014 Strategy & Architecture.", "// SYSTEM STATUS: OPERATIONAL // GOSPEL 444 PROTOCOL //"], marks:["phoenix"], cover:true },
      { n:2,  kicker:"2026", title:"THE UNFAIR ADVANTAGE: DUAL MASTERY", lines:["In 2026, knowing only English is like holding a flip-phone.", "We do not just sell language; we sell the ability to command a supercomputer to do the work of 10 people and report on it fluently in English."], halves:true, marks:["venn","chip"] },
      { n:3,  kicker:"THE MANDATE", title:"THE WORKER AND THE ARCHITECT", lines:["Ignoring AI is drinking on the deck of a sinking ship. You must build a life raft before the rain starts."], pair:true, marks:["globe"] },
      { n:4,  kicker:"DIAGNOSIS", title:"THE 404 BRAIN ERROR", lines:["You do not have a grammar problem. You have a Permission Problem. Your hesitation is a mechanical failure, not a lack of intelligence.", "You spend 5 seconds listening, 10 seconds translating, and 5 seconds formulating an answer. By the time you are ready to speak, the meeting has moved on."], chain:["[Listen]","[Translate to Vietnamese]","[Translate to English]","[Speak (Blocked)]"], marks:["head-jigsaw"] },
      { n:5,  kicker:"THE OVERRIDE", title:"THE MECHANICAL FAILURE / THE NATIVE FLOW", lines:["Dictionaries build translators. Context builds Tigers."], flow:true, marks:["flow"] },
      { n:6,  kicker:"ACQUISITION", title:"THE 60% RULE", lines:["Stop hunting for words. Start catching the vibe.", "When you understand the situation, your subconscious naturally unlocks the other 40%."], marks:["brain2"] },
      { n:7,  kicker:"LIFESTYLE", title:"THE 45/15 ARCHITECTURE", lines:["We don't add time to your life. We optimize the time you already have.", "45 minutes of passive immersion, 15 minutes of high-intensity output. One hour. No homework."], marks:["dial45"] },
      { n:8,  kicker:"CURRICULUM", title:"THE 10-5-5-3 LESSON ENGINE", lines:["No fluff. No isolated vocabulary lists. Only the exact language used in the boardroom and on the streets."], cards:[["10","Core words","Taught in immediate context."],["5","Idioms","The conversational glue of the language."],["5","Slang expressions","The flavour that native speakers actually use."],["3","Games","The psychological engine for maximum brain retention."]], marks:["bookshelf"] },
      { n:9,  kicker:"RETENTION", title:"HUMAN BIOLOGY IS A LEAKY BUCKET", lines:["You do not have a bad memory. You have a human brain designed to forget unreinforced data.", "Traditional Saturday classes are a biological lie. By Tuesday, the data is gone."], marks:["infinity"] },
      { n:10, kicker:"INTERVENTION", title:"THE STRIKE AT SIXTY", lines:["We wait until you are exactly 60% likely to forget, then we strike.", "We do not ask you to manually memorize. The system ensures you encounter the exact word in context 8 times until it becomes subconscious."], days:true, marks:["phone"] },
      { n:11, kicker:"ACCOUNTABILITY", title:"THE SYSTEM DOES NOT ACCEPT EXCUSES", lines:["Miss a day, the AI-PET streak decays. You are either growing or dying.", "No participation trophies. The governor actively prevents relapses into the hesitant, quiet Mouse Mode."], marks:["confidence"] },
      { n:12, kicker:"THE PROOF", title:"THE MATH OF THE TIGER", lines:["Data doesn't lie. We track confidence, not just vocabulary."], numbers:true, marks:["edge"] },
      { n:13, kicker:"THE ZONE", title:"LAKEVIEW DEPLOYMENT ZONE", lines:["Prime target for hyper-efficient, in-home professional coaching."], zone:true, marks:["gauge"] },
      { n:14, kicker:"THE FUNNEL", title:"THE M2 AUTOMATION PIPELINE", lines:["A fail-closed system to convert Mouse Mode into pipeline revenue."], funnel:true, marks:["gears"] },
      { n:15, kicker:"THE ARCHITECTURE", title:"THE NET SOVEREIGN ARCHITECTURE", lines:["We do not sell English lessons. We sell Permission to be Powerful."], stack:true, marks:["pyramid"] },
      { n:16, kicker:"THE OFFER", title:"STOP GUESSING. START AUDITING.", lines:["Hope is not a strategy. Data does not lie. We are doctors, not salespeople.", "Message AUDIT to secure your seat at the table."], audit:true, marks:["roar"], closing:true }
    ]
  };

  /* ==========================================================================
     ICONS — hand-drawn on a 24 grid. Geometry only; the renderer supplies the
     stroke. Anything needing a solid dot says so itself.
     ========================================================================== */
  const ICONS = {
    /* the station's own surfaces */
    cmd:       '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><rect x="9" y="9" width="6" height="6" rx="0.5"/>',
    grid:      '<rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/>',
    gear:      '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3M5.4 5.4l2.1 2.1M16.5 16.5l2.1 2.1M18.6 5.4l-2.1 2.1M7.5 16.5l-2.1 2.1"/>',
    sliders:   '<path d="M4 8h9M18.5 8H20M4 16h3.5M13 16h7"/><circle cx="15.8" cy="8" r="2.2"/><circle cx="10.3" cy="16" r="2.2"/>',
    chat:      '<path d="M4 5.5h16v10H9l-5 4z"/><circle cx="9" cy="10.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="10.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="10.5" r="0.9" fill="currentColor" stroke="none"/>',
    mic:       '<rect x="9.4" y="2.8" width="5.2" height="10.4" rx="2.6"/><path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0M12 17.6V21M8.8 21h6.4"/>',
    wave:      '<path d="M2.6 11.6h2M7 6.6v10M12 3.6v16.8M17 7.6v8M20.4 11.6h1"/>',
    image:     '<rect x="3.5" y="4.5" width="17" height="15" rx="2.2"/><circle cx="8.6" cy="9.6" r="1.7"/><path d="M4 17.2l4.6-4.6 3.4 3.4 3-3L20 17.2"/>',
    eye:       '<path d="M2.6 12S6.2 5.8 12 5.8 21.4 12 21.4 12 17.8 18.2 12 18.2 2.6 12 2.6 12Z"/><circle cx="12" cy="12" r="2.7"/>',
    video:     '<rect x="3" y="6.5" width="11.5" height="11" rx="2.2"/><path d="M14.5 10.8l6-3.3v9l-6-3.3z"/>',
    headphones:'<path d="M4.5 14.8v-2.8a7.5 7.5 0 0 1 15 0v2.8"/><rect x="2.8" y="13.6" width="4" height="6.4" rx="2"/><rect x="17.2" y="13.6" width="4" height="6.4" rx="2"/>',
    doc:       '<path d="M6.2 3.5h7.3l4.3 4.3v12.7H6.2z"/><path d="M13.5 3.5v4.3h4.3"/><path d="M8.8 12.2h6.4M8.8 15.3h6.4M8.8 18.4h3.8"/>',
    clipboard: '<rect x="5" y="4.6" width="14" height="15.9" rx="2.2"/><path d="M9 4.6V3h6v1.6"/><path d="M8.8 13.4l2.1 2.1 4.3-4.6"/>',
    log:       '<rect x="4.5" y="3.5" width="15" height="17" rx="2.2"/><path d="M8.4 8h7.2M8.4 12h7.2M8.4 16h4.4"/>',
    book:      '<path d="M12 6.4C10.4 4.9 8.4 4.4 4.4 4.4V18c4 0 6 .6 7.6 2.1 1.6-1.5 3.6-2.1 7.6-2.1V4.4c-4 0-6 .5-7.6 2Z"/><path d="M12 6.4v13.7"/>',
    key:       '<circle cx="7.6" cy="7.6" r="3.9"/><path d="M10.4 10.4L20 20M16.4 16.4l2.3-2.3M19.3 19.3l1.9-1.9"/>',
    lock:      '<rect x="4.6" y="10.4" width="14.8" height="10" rx="2.2"/><path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4"/><circle cx="12" cy="15.4" r="1.3" fill="currentColor" stroke="none"/>',
    unlock:    '<rect x="4.6" y="10.4" width="14.8" height="10" rx="2.2"/><path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0"/><circle cx="12" cy="15.4" r="1.3" fill="currentColor" stroke="none"/>',
    shield:    '<path d="M12 3l7 3v6.1c0 4.2-2.9 7.5-7 9-4.1-1.5-7-4.8-7-9V6z"/><path d="M8.9 12l2.3 2.3L15.6 10"/>',
    radar:     '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.1"/><path d="M12 12l6.1-6.1"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
    hammer:    '<path d="M14.2 2.9l6.9 4-2 3.4-6.9-4z"/><path d="M12.9 9.5L5.3 19.1"/>',
    network:   '<circle cx="12" cy="4.4" r="2.1"/><circle cx="4.5" cy="19" r="2.1"/><circle cx="19.5" cy="19" r="2.1"/><path d="M10.6 6.2L5.9 17.1M13.4 6.2l4.7 10.9M6.6 19h10.8"/>',
    power:     '<path d="M12 3.4v8.4"/><path d="M7.1 6.5a7.1 7.1 0 1 0 9.8 0"/>',
    omega:     '<path d="M5.6 19.2c0-4.4 2.8-7.4 6.4-7.4s6.4 3 6.4 7.4"/><path d="M3.6 19.2h3.4M17 19.2h3.4"/>',
    flame:     '<path d="M12 3.4c3.6 3.3 5.6 6.1 5.6 9.4a5.6 5.6 0 0 1-11.2 0c0-1.6.6-3.1 1.7-4.4.3 1.2 1 2 2 2.5-.6-2.7.2-5.4 1.9-7.5Z"/>',
    bolt:      '<path d="M13.6 2.5L5 13.6h5.6L10 21.5l8.6-11.1H13z"/>',
    spark:     '<path d="M11.4 3l1.7 5L18 9.7l-4.9 1.7-1.7 5-1.7-5L4.8 9.7l4.9-1.7z"/><path d="M18.4 16l.8 2.3 2.3.8-2.3.8-.8 2.3-.8-2.3-2.3-.8 2.3-.8z"/>',
    seal:      '<path d="M12 2.6l3 1.9 3.5-.6 1.2 3.4 3.1 1.7-1.4 3.4 1.4 3.4-3.1 1.7-1.2 3.4-3.5-.6-3 1.9-3-1.9-3.5.6-1.2-3.4L2.6 15l1.4-3.4L2.6 8.2l3.1-1.7 1.2-3.4 3.5.6z"/><circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
    compass:   '<circle cx="12" cy="12" r="8.6"/><path d="M15.2 8.8l-2.1 5.3-5.3 2.1 2.1-5.3z"/>',
    gauge:     '<path d="M3.4 17.2a8.6 8.6 0 1 1 17.2 0"/><path d="M12 17.2l4.6-6.2"/><circle cx="12" cy="17.2" r="1.4" fill="currentColor" stroke="none"/>',
    target:    '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    pyramid:   '<path d="M12 3.4L21 20H3z"/><path d="M7 12h10M6 15.6h12"/>',
    venn:      '<circle cx="8.7" cy="12" r="5.1"/><circle cx="15.3" cy="12" r="5.1"/>',
    brain:     '<path d="M12 5.4a3.1 3.1 0 0 0-5.8 1.4A3.1 3.1 0 0 0 4.4 12a3.1 3.1 0 0 0 1.5 4.7A3.1 3.1 0 0 0 12 19.4z"/><path d="M12 5.4a3.1 3.1 0 0 1 5.8 1.4A3.1 3.1 0 0 1 19.6 12a3.1 3.1 0 0 1-1.5 4.7A3.1 3.1 0 0 1 12 19.4z"/><path d="M12 5.4v14"/>',
    /* the ladder */
    cap:       '<path d="M12 4.2L22 8.4l-10 4.2L2 8.4z"/><path d="M6 10.4v4.4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.4"/><path d="M21.2 9v5.4"/>',
    gamepad:   '<rect x="2.6" y="7.4" width="18.8" height="9.2" rx="4.6"/><path d="M7.4 10.6v3.2M5.8 12.2h3.2"/><circle cx="15.8" cy="11.2" r="1" fill="currentColor" stroke="none"/><circle cx="18.4" cy="13.4" r="1" fill="currentColor" stroke="none"/>',
    megaphone: '<path d="M3 9.8v4.4h3l10 4.4V5.4L6 9.8z"/><path d="M6.2 14.2l1.2 6h3.2l-1.2-5"/><path d="M18.6 9a3.4 3.4 0 0 1 0 6"/>',
    paw:       '<ellipse cx="12" cy="15.6" rx="4.6" ry="3.9"/><circle cx="5.9" cy="9.6" r="1.9"/><circle cx="10.1" cy="6.4" r="1.9"/><circle cx="15" cy="6.4" r="1.9"/><circle cx="18.6" cy="10.2" r="1.9"/>',
    tiger:     '<ellipse cx="12" cy="15.2" rx="4.7" ry="4"/><circle cx="5.8" cy="9.4" r="1.9"/><circle cx="10" cy="6.2" r="1.9"/><circle cx="15.1" cy="6.2" r="1.9"/><circle cx="18.7" cy="10" r="1.9"/><path d="M9.6 14.6l2.4 1.6 2.4-1.6"/>',
    crown:     '<path d="M4.4 16.2l-1-9.2 5.1 3.6L12 5l3.5 5.6 5.1-3.6-1 9.2z"/><path d="M4 19.4h16"/>',
    coin:      '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="5.5"/><path d="M12 8.6v6.8M10.2 15.1c.5.6 1.2.9 1.9.9 1.3 0 2.1-.7 2.1-1.7 0-2.3-3.8-1.2-3.8-3.4 0-1 .8-1.6 1.9-1.6.7 0 1.3.3 1.8.8"/>',
    trophy:    '<path d="M7 4.4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.4v1.6A3.6 3.6 0 0 0 7 10.9M17 6h2.6v1.6a3.6 3.6 0 0 1-2.6 3.3"/><path d="M12 14.4v3.4M8.6 20.4h6.8"/>',
    star:      '<path d="M12 3.4l2.7 5.4 5.9.9-4.3 4.1 1 5.9-5.3-2.9-5.3 2.9 1-5.9L3.4 9.7l5.9-.9z"/>',
    /* the doctrine's own furniture (GOSPEL 444) */
    snowman:   '<circle cx="12" cy="17" r="4.4"/><circle cx="12" cy="9.6" r="3.2"/><path d="M9.2 5.8h5.6M8.8 3.4h6.4"/><path d="M8.4 9.8L5 8.2M15.6 9.8L19 8.2"/><circle cx="10.9" cy="8.8" r=".55" fill="currentColor" stroke="none"/><circle cx="13.1" cy="8.8" r=".55" fill="currentColor" stroke="none"/>',
    batteryFull:'<rect x="2.6" y="8" width="16.4" height="8" rx="1.8"/><path d="M21 10.6v2.8"/><rect x="4.6" y="10" width="9" height="4" rx=".6" fill="currentColor" stroke="none"/>',
    batteryLow:'<rect x="2.6" y="8" width="16.4" height="8" rx="1.8"/><path d="M21 10.6v2.8"/><rect x="4.6" y="10" width="3.4" height="4" rx=".6" fill="currentColor" stroke="none"/>',
    quote:     '<path d="M10.6 7.2C7.7 8.1 6 10.1 6 12.8V17h5.2v-5.2H8.4c0-1.6.6-2.6 2.2-3.1zM19.4 7.2c-2.9.9-4.6 2.9-4.6 5.6V17h5.2v-5.2h-2.8c0-1.6.6-2.6 2.2-3.1z"/>',
    chain:     '<path d="M9.4 8.2L7.6 10a3.6 3.6 0 0 0 5.1 5.1l1.8-1.8"/><path d="M14.6 15.8l1.8-1.8a3.6 3.6 0 0 0-5.1-5.1l-1.8 1.8"/><path d="M11.4 3.6l.9 2.2M12.6 20.4l-.9-2.2"/>',
    volume:    '<path d="M4 9.4h3.4L12 5.6v12.8L7.4 14.6H4z"/><path d="M15.4 9.4a3.6 3.6 0 0 1 0 5.2M18 7a7 7 0 0 1 0 10"/>',
    repeat:    '<path d="M5 12a7 7 0 0 1 7-7h4"/><path d="M15.4 2.6L18.2 5l-2.8 2.4"/><path d="M19 12a7 7 0 0 1-7 7H8"/><path d="M8.6 21.4L5.8 19l2.8-2.4"/>',
    /* the working surfaces */
    users:     '<circle cx="9.4" cy="8" r="3.5"/><path d="M3 20.6a6.4 6.4 0 0 1 12.8 0"/><path d="M16.2 5.1a3.5 3.5 0 0 1 0 6.8M17.6 14.6a6.4 6.4 0 0 1 3.4 6"/>',
    user:      '<circle cx="12" cy="8" r="3.9"/><path d="M4.4 20.6a7.6 7.6 0 0 1 15.2 0"/>',
    door:      '<path d="M5.6 3.6h11v16.8h-11z"/><path d="M14.4 12h4.2M16.6 9.6L19 12l-2.4 2.4"/>',
    tower:     '<path d="M8.4 21V6l3.6-2.4L15.6 6v15"/><path d="M4.6 21h14.8"/><path d="M8.4 9.4h7.2M8.4 13h7.2"/><path d="M10.6 21v-4.2h2.8V21"/>',
    hands:     '<path d="M8.4 12.6V6.8a1.8 1.8 0 0 1 3.6 0v5.2M12 11.4V5.6a1.8 1.8 0 0 1 3.6 0v6.6"/><path d="M8.4 10.6a1.8 1.8 0 0 0-3.6 0v4.2c0 3.4 2.6 6.2 6 6.2s6-2.8 6-6.2v-3a1.8 1.8 0 0 0-3.6 0"/>',
    map:       '<path d="M3.4 6.6l6-2.1 5.2 2.1 6-2.1v13l-6 2.1-5.2-2.1-6 2.1z"/><path d="M9.4 4.5v13M14.6 6.6v13"/>',
    calendar:  '<rect x="3.5" y="5.5" width="17" height="15" rx="2.2"/><path d="M3.5 10.4h17M8 3.4v4M16 3.4v4"/>',
    clock:     '<circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.4l3.6 2.2"/>',
    chart:     '<path d="M4.2 20V4M4.2 20h16"/><rect x="7" y="13.6" width="3" height="6.4" rx="0.8"/><rect x="11.4" y="9.6" width="3" height="10.4" rx="0.8"/><rect x="15.8" y="6.4" width="3" height="13.6" rx="0.8"/>',
    flask:     '<path d="M9 3.4h6M10 3.4v5.1L5.6 17a2.1 2.1 0 0 0 1.9 3.1h9a2.1 2.1 0 0 0 1.9-3.1L14 8.5V3.4"/><path d="M7.6 14h8.8"/>',
    terminal:  '<rect x="3" y="4.6" width="18" height="14.8" rx="2.2"/><path d="M7 9.6l2.6 2.6L7 14.8M12.6 15.2h4.4"/>',
    git:       '<circle cx="7" cy="6" r="2.3"/><circle cx="7" cy="18" r="2.3"/><circle cx="17" cy="12" r="2.3"/><path d="M7 8.3v7.4M9.3 6h3.4a2.3 2.3 0 0 1 2.3 2.3v1.4"/>',
    cloud:     '<path d="M7.4 18.6h9.9a4.1 4.1 0 0 0 .4-8.2 5.6 5.6 0 0 0-10.7 1.3 3.6 3.6 0 0 0 .4 6.9Z"/>',
    globe:     '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4c2.4 2.5 3.6 5.4 3.6 8.6s-1.2 6.1-3.6 8.6c-2.4-2.5-3.6-5.4-3.6-8.6S9.6 5.9 12 3.4Z"/>',
    search:    '<circle cx="10.4" cy="10.4" r="6.1"/><path d="M14.9 14.9l4.7 4.7"/>',
    link:      '<path d="M10 14l4-4"/><path d="M8.6 16.4l-2 2a3.3 3.3 0 0 1-4.6-4.6l3-3"/><path d="M15.4 7.6l2-2a3.3 3.3 0 0 1 4.6 4.6l-3 3"/>',
    copy:      '<rect x="8.6" y="8.6" width="11.8" height="11.8" rx="2.2"/><path d="M15.4 5.6H6.2a2.2 2.2 0 0 0-2.2 2.2v9.2"/>',
    trash:     '<path d="M4.4 6.6h15.2"/><path d="M9 6.6V4.4h6v2.2"/><path d="M6.6 6.6l1 14h8.8l1-14"/><path d="M10.4 10.4v6.4M13.6 10.4v6.4"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    minus:     '<path d="M5 12h14"/>',
    check:     '<path d="M5 12.6l4.6 4.6L19 7.2"/>',
    x:         '<path d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8"/>',
    alert:     '<path d="M12 3.6l8.8 15.9H3.2z"/><path d="M12 9.4v4.8"/><circle cx="12" cy="16.9" r="1" fill="currentColor" stroke="none"/>',
    info:      '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.4"/><circle cx="12" cy="7.9" r="1" fill="currentColor" stroke="none"/>',
    chevR:     '<path d="M9.4 5.4L16 12l-6.6 6.6"/>',
    chevL:     '<path d="M14.6 5.4L8 12l6.6 6.6"/>',
    chevD:     '<path d="M5.4 9.4L12 16l6.6-6.6"/>',
    chevU:     '<path d="M5.4 14.6L12 8l6.6 6.6"/>',
    arrowR:    '<path d="M4 12h15M13.4 6.4L19 12l-5.6 5.6"/>',
    arrowL:    '<path d="M20 12H5M10.6 6.4L5 12l5.6 5.6"/>',
    arrowU:    '<path d="M12 20V5M6.4 10.6L12 5l5.6 5.6"/>',
    arrowD:    '<path d="M12 4v15M6.4 13.4L12 19l5.6-5.6"/>',
    download:  '<path d="M12 3.6v11.2M7.6 10.6L12 15l4.4-4.4"/><path d="M4.4 18.8h15.2"/>',
    upload:    '<path d="M12 15.2V4M7.6 8.4L12 4l4.4 4.4"/><path d="M4.4 18.8h15.2"/>',
    print:     '<path d="M7 9.2V3.6h10v5.6"/><rect x="4" y="9.2" width="16" height="6.8" rx="2.2"/><path d="M7 14.4h10v6H7z"/>',
    flag:      '<path d="M6 21V3.4"/><path d="M6 4.4h11.4l-2.1 3.6 2.1 3.6H6"/>',
    wifi:      '<path d="M3.4 9.4a12.2 12.2 0 0 1 17.2 0M6.6 12.9a7.8 7.8 0 0 1 10.8 0M9.6 16.3a4 4 0 0 1 4.8 0"/><circle cx="12" cy="19.6" r="1" fill="currentColor" stroke="none"/>',
    scale:     '<path d="M12 3.8v16.4M7 20.2h10M4 7.6h16"/><path d="M6.4 7.6l-2.1 5.2a3.1 3.1 0 0 0 6.2 0zM17.6 7.6l-2.1 5.2a3.1 3.1 0 0 0 6.2 0z"/>',
    seed:      '<path d="M12 20.6c0-6 2-10.1 8.1-12.2-1 8.1-3.6 11.2-8.1 12.2Z"/><path d="M12 20.6c-3-5.6-4.1-10.2-7.1-12.2 1.5 6.1 3 9.1 7.1 12.2Z"/>',
    /* THE LOGOTYPE. The phoenix is deliberately abstract (three feather strokes,
       the station's own long-standing mark, carried here at its native 100 grid).
       A logo may be abstract; a UI icon may not — so where a glyph must CARRY
       MEANING at 16px (a tab, a card, a room) use the drawing on the 24 grid.
       The Phoenix Generators shelf wears `grid`; the phoenix is worn large. */
    /* HUD furniture */
phoenix:   { vb:"0 0 100 100", body:'<path d="M50 8C52 20 60 28 68 32 60 30 54 34 50 42 46 34 40 30 32 32 40 28 48 20 50 8Z" fill="currentColor" stroke="none" opacity=".95"/><path d="M50 35C54 48 66 58 78 62 66 56 58 60 50 72 42 60 34 56 22 62 34 58 46 48 50 35Z" fill="currentColor" stroke="none" opacity=".72"/><path d="M50 60C53 70 62 78 72 82 62 77 56 80 50 92 44 80 38 77 28 82 38 78 47 70 50 60Z" fill="currentColor" stroke="none" opacity=".5"/>' },
    /* THE APEX GLYPH — the reduced form of the sovereign's logotype: the
       tesseract core alone, on the 24 grid, so the mark survives a 16 px tab
       (BRAND.029). The full mark is ASSETS.apex and is worn from 64 px up. */
apex:      { vb:"0 0 24 24", body:'<path d="M12 3.6 19.4 7.9 19.4 16.5 12 20.8 4.6 16.5 4.6 7.9Z"/><path d="M12 12.2 19.4 7.9M12 12.2 12 20.8M12 12.2 4.6 7.9"/><circle cx="12" cy="3.6" r="1" fill="currentColor" stroke="none"/><circle cx="19.4" cy="7.9" r="1" fill="currentColor" stroke="none"/><circle cx="19.4" cy="16.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="20.8" r="1" fill="currentColor" stroke="none"/><circle cx="4.6" cy="16.5" r="1" fill="currentColor" stroke="none"/><circle cx="4.6" cy="7.9" r="1" fill="currentColor" stroke="none"/>' },
    corner:    '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    scanline:  '<path d="M3 3.5h18v17H3z"/><path d="M3 8.6h18M3 13.6h18M3 18.6h18"/>',
    bracket:   '<path d="M8 3.5H3.5v17H8M16 3.5h4.5v17H16"/>',
    /* THE SECOND PASS — the gaps the first pass left. Three groups, because
       that is what was actually missing: (1) the low rung's own animal, which
       TIERS[0] and MODES[0] had been pointing at since the first pass without
       it existing — a named icon that is not drawn is a broken crest, so this
       is a DEFECT fix, not an addition; (2) the classroom's four instruments —
       listen, speak, write, drill — which the doctrine names in words and the
       system had no glyph for; (3) the transport controls and the record
       objects every audio surface in the station needed and was faking. */
    mouse:     '<ellipse cx="12.4" cy="15.2" rx="6.4" ry="4.2"/><circle cx="7.9" cy="10.2" r="2.4"/><circle cx="12.6" cy="8.7" r="2.4"/><circle cx="9.2" cy="14.4" r=".85" fill="currentColor" stroke="none"/><path d="M6.3 14.7L3.4 14.2M6.4 16.1l-2.7.8"/><path d="M18.6 15.9c2.1-.3 3-2.5 1.7-4.1"/>',
    ear:       '<path d="M8.2 11.4a4.4 4.4 0 0 1 8.8.4c0 2.4-1.4 3.4-2.6 4.5-.9.8-1.3 1.7-1.3 2.9a2.5 2.5 0 0 1-5 0v-.9"/><path d="M11 11.8a2.3 2.3 0 0 1 4.2 1"/><path d="M3.4 8.4a6.4 6.4 0 0 0 0 7"/>',
    speak:     '<path d="M3.4 13.4c2-1.8 4-1.8 5.4-.6-1.4 1.2-3.4 1.4-5.4.6z"/><path d="M11 9.6a4.6 4.6 0 0 1 0 6.4M14.4 7a8.2 8.2 0 0 1 0 11.6M17.8 4.4a11.6 11.6 0 0 1 0 16.8"/>',
    pencil:    '<path d="M15.2 4.4l4.4 4.4L8.2 20.2 3.4 21.4l1.2-4.8z"/><path d="M12.9 6.7l4.4 4.4"/>',
    cards:     '<rect x="4.4" y="6.4" width="11.6" height="13.8" rx="2"/><path d="M8.6 4.2h9a2 2 0 0 1 2 2v11.2"/><path d="M8 16.6l2.2-5.8 2.2 5.8M8.9 14.8h2.8"/>',
    stack:     '<path d="M12 3.4l8.4 4.3-8.4 4.2-8.4-4.2z"/><path d="M3.6 12.4L12 16.7l8.4-4.3"/><path d="M3.6 16.6L12 20.9l8.4-4.3"/>',
    timer:     '<circle cx="12.4" cy="13.6" r="7.4"/><path d="M12.4 9.6v4.4l3 1.8"/><path d="M9.2 3.4h6.4M12.4 3.4v2.8"/><path d="M17.6 8.4l1.9-1.9"/>',
    bell:      '<path d="M7.4 17.4v-5.8a4.6 4.6 0 0 1 9.2 0v5.8"/><path d="M5.4 17.4h13.2"/><path d="M10.6 20.2a1.7 1.7 0 0 0 2.8 0"/><path d="M12 3.6v2.2"/>',
    handUp:    '<path d="M8.6 12.2V5.6a1.8 1.8 0 0 1 3.6 0v5.4M12.2 11V7.8a1.8 1.8 0 0 1 3.6 0v7.2"/><path d="M8.6 10.2a1.8 1.8 0 0 0-3.6 0v4.6c0 3.5 2.7 6.4 6.2 6.4s6.2-2.9 6.2-6.4v-3.4a1.8 1.8 0 0 0-3.6 0"/>',
    ladder:    '<path d="M7.4 3.4v17.2M16.6 3.4v17.2"/><path d="M7.4 8h9.2M7.4 12.4h9.2M7.4 16.8h9.2"/><path d="M4.6 20.6h14.8"/>',
    medal:     '<circle cx="12" cy="14.8" r="5.6"/><path d="M12 12.4l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="currentColor" stroke="none" opacity=".85"/><path d="M9 9.6L6.6 3.4M15 9.6l2.4-6.2M7 3.4h10"/>',
    certificate:'<rect x="3.4" y="4.6" width="14.6" height="11.6" rx="1.8"/><path d="M6.4 8.2h6.4M6.4 11h4.2"/><circle cx="16.6" cy="14.4" r="2.6"/><path d="M15.2 16.6l-.7 4.2 2.1-1.3 2.1 1.3-.7-4.2"/>',
    crack:     '<path d="M6.4 3.6h11.2v16.8H6.4z"/><path d="M13.4 3.6l-2.8 6.2 3.4 1.6-2.6 9"/>',
    route:     '<circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="5" r="2.6"/><path d="M7 17.8c3.2-.6 4.6-3.4 5-5.8.4-2.4 1.8-4.4 4.4-5.4" stroke-dasharray="2.6 2"/>',
    translate: '<path d="M3.2 17.6L7 8.4l3.8 9.2M4.6 14.6h4.8"/><path d="M14.2 8.4v9M11.4 11.6l8.4-3.4M11.4 14.6l8.4 3.4"/>',
    trendUp:   '<path d="M3.4 20.2h17.2"/><path d="M4 15.6l5.4-5.4 3.4 2.6 5.6-6.4"/><path d="M18.6 10.9V6.2h-4.7"/>',
    play:      '<path d="M7.6 4.6l11 7.4-11 7.4z"/>',
    pause:     '<path d="M8.8 5v14M15.2 5v14"/>',
    stop:      '<rect x="6" y="6" width="12" height="12" rx="1.6"/>',
    record:    '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.4" fill="currentColor" stroke="none"/>',
    vault:     '<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="1.8"/><path d="M6 4.6v14.8"/><circle cx="13.4" cy="12" r="4.2"/><circle cx="13.4" cy="12" r="1.1" fill="currentColor" stroke="none"/><path d="M13.4 7.8V6.6M13.4 17.4v-1.2M9.2 12H8M18 12h-1.2"/><circle cx="4.8" cy="9" r="1"/><circle cx="4.8" cy="15" r="1"/>',
    badge:     '<rect x="5.4" y="7.2" width="13.2" height="13.4" rx="2"/><path d="M9.8 7.2L12 4l2.2 3.2"/><circle cx="12" cy="12.4" r="2.2"/><path d="M8.8 17.8a3.4 3.4 0 0 1 6.4 0"/>'
  };

  function icon(name, opts){
    opts = opts || {};
    const g = ICONS[name];
    const cls = "bx-ic" + (opts.cls ? " " + opts.cls : "");
    const style = (opts.size ? "width:" + opts.size + ";height:" + opts.size + ";" : "") + (opts.style || "");
    const st = style ? ' style="' + style.replace(/"/g, "&quot;") + '"' : "";
    const a = ' aria-hidden="true"';
    /* an icon is geometry on the 24 grid; a MARK that already existed on another
       grid keeps its own viewBox rather than being redrawn to fit ours */
    const body = g && g.body ? g.body : g;
    const vb = (g && g.vb) || "0 0 24 24";
    if(!body) return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"' + st + a + '><circle cx="12" cy="12" r="8.4"/><path d="M12 8.4v5"/></svg>';
    return '<svg class="' + cls + '" viewBox="' + vb + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"' + st + a + '>' + body + '</svg>';
  }
  function iconBody(name){ const g = ICONS[name]; return g && g.body ? g.body : (g || ""); }
  function iconViewBox(name){ const g = ICONS[name]; return (g && g.vb) || "0 0 24 24"; }
  function has(name){ return !!ICONS[name]; }
  function iconNames(){ return Object.keys(ICONS).sort(); }

  /* ==========================================================================
     ASSETS — the marks cut from the sovereign's dossier
     ========================================================================== */
  const ASSETS = [
    { id:"head-ui", file:"head-ui.webp", w:132, h:106, box:[22,46,16,23], page:11, variant:true, name:"The Tiger Head (UI size)", use:"INLINED into every built lesson, and any 24-64px surface", note:"the same sigil at display resolution — 2x of a 66px slot, so a lesson stays light" },
    { id:"tiger",   file:"tiger.webp",   w:509, h:491, box:[37,16,37,64], page:1,  name:"The Tiger",            use:"hero band, the forge, /phoenixomegaprotocol, any 'the work is done' moment", note:"wireframe tiger breaking golden chains, sparks and circuit lines" },
    { id:"mouse",   file:"mouse.webp",   w:348, h:434, box:[8,30,25,56],  page:1,  name:"The Mouse",            use:"the diagnostic's low end — a student before the method", note:"wireframe mouse wrapped in chains on the grid" },
    { id:"head",    file:"head.webp",    w:220, h:177, box:[22,46,16,23], page:11, name:"The Tiger Head",       use:"the dossier sigil — crest, seals, the lesson badge (NOT the station topbar: that wears THE PRAIS APEX since 2026-09-22)", note:"gold line-art head, drawn separately from its shield; the shipped cut is tight — the jaw sits on the crop line and the source page's ground shows in two corners, so it is kept for the dossier surfaces it was cut for and is no longer the station's mark" },
    { id:"shield",  file:"shield.webp",  w:719, h:396, box:[6,31,52,51],  page:11, name:"The Ecosystem Shield", use:"protection, the vault, the ecosystem map", note:"purple ellipse shield with the gold head at its core" },
    { id:"pyramid", file:"pyramid.webp", w:471, h:487, box:[14,17,34,63], page:6,  name:"The Four Layers",      use:"hierarchy, curriculum ladders, tier diagrams", note:"circuit-lit pyramid, gold capstone to deep plum base" },
    { id:"venn",    file:"venn.webp",    w:596, h:388, box:[28,13,43,50], page:9,  name:"The Sovereign Operator", use:"positioning, the two-circle claim", note:"glowing purple and gold circles, the overlap" },
    { id:"gears",   file:"gears.webp",   w:581, h:373, box:[31,28,42,48], page:13, name:"The Protocol",         use:"the loop — any process diagram's head", note:"three glowing gears joined by purple arrows" },
    { id:"gauge",   file:"gauge.webp",   w:551, h:369, box:[11,18,40,48], page:2,  name:"The Diagnostic",       use:"scores, coverage, the 0-40 / 100 gauge", note:"semicircular gauge over crossed ruler and red pen" },
    { id:"brain",   file:"brain.webp",   w:275, h:231, box:[39,15,20,30], page:4,  name:"The 60% Rule",         use:"method rooms — comprehension over parsing", note:"pink brain, red grammar circuit in, purple input out" },
    { id:"laptop",  file:"laptop.webp",  w:554, h:319, box:[30,26,40,41], page:14, name:"The Room",             use:"the live session, the station itself, marketing hero", note:"laptop with four windows, palm fronds behind" },
    { id:"tigerbg", file:"tigerbg.webp", w:760, h:391, box:[14,25,74,68], page:15, name:"The Prowler",          use:"watermark band — footers, empty states", note:"faint prowling tiger, the closing slide's bed" },
    /* ---- cut from GOSPEL_444_PROTOCOL.pdf (12pp) and GOSPEL_444_TIGER_MODE.pdf
       (4pp) — the doctrine's own pictures. Same page size, same key, same rules. */
    { id:"phoenix", file:"phoenix.webp", w:564, h:522, box:[51,4,41,68], page:12, src:"protocol", name:"The Phoenix", use:"the station's hero image, the deck cover, top of a writeup", note:"gold-and-violet bird climbing out of the wreck of the old stack" },
    { id:"roar",    file:"roar.webp",    w:564, h:392, box:[56,14,41,51], page:4, src:"tiger-mode", name:"The Tiger, Awake", use:"TIGER MODE, the forge, the closing slide, /phoenixomegaprotocol", note:"roaring tiger in ember and violet — the doctrine's loudest mark" },
    { id:"cub",     file:"cub.webp",     w:248, h:276, box:[42,28,18,36], page:3, src:"protocol", name:"The Cub", use:"CUB MODE, the middle rung, 'the habit exists'", note:"violet cub's head wired into the grid" },
    { id:"elephant",file:"elephant.webp",w:564, h:399, box:[6,19,41,52], page:2, src:"protocol", name:"The Grammar Prison", use:"why the old method failed — diagnosis slides, parent-facing writeups", note:"violet elephant caged in grammar books, lightning on the bars" },
    { id:"bookshelf",file:"bookshelf.webp",w:454,h:492,box:[32,20,33,64], page:1, src:"tiger-mode", name:"The Breach", use:"'we don't teach English, we unlock permission' — the moment of change", note:"a bookshelf blown open by a violet burst" },
    { id:"atom",    file:"atom.webp",    w:720, h:475, box:[22,17,55,65], page:9, src:"protocol", name:"The Ecosystem", use:"the buddy system, community, the safe space", note:"orbital core with three rings — environment beats willpower" },
    { id:"infinity",file:"infinity.webp",w:660, h:307, box:[42,6,48,40], page:6, src:"protocol", name:"The Loop", use:"the acquisition engine, the 60% rule, any 'inputs feed outputs' idea", note:"gold-to-violet infinity, circuits in the stroke" },
    { id:"globe",   file:"globe.webp",   w:248, h:261, box:[7,17,18,34], page:5, src:"protocol", name:"The Market", use:"English as access — the international market, cross-border teams", note:"networked globe in gold and blue" },
    { id:"chip",    file:"chip.webp",    w:248, h:269, box:[41,35,18,35], page:5, src:"protocol", name:"The Machine", use:"the AI half of the unfair advantage", note:"processor with a violet-and-gold aura" },
    { id:"phone",   file:"phone.webp",   w:716, h:599, box:[43,21,52,78], page:8, src:"protocol", name:"The AI-PET", use:"spaced repetition, memory decay, Tough Love Mode", note:"pocket sovereign: the forgetting curve on screen" },
    { id:"dial45",  file:"dial45.webp",  w:633, h:361, box:[7,50,46,47], page:6, src:"protocol", name:"The 45/15", use:"the daily ratio — lesson pacing, the practice dial", note:"input 45 and output 15 as one instrument" },
    { id:"flow",    file:"flow.webp",    w:674, h:100, box:[40,65,49,13], page:2, src:"tiger-mode", name:"The Native Flow", use:"a strip, not a poster — listen-and-comprehend feeding immediate speech", note:"two nodes joined by the waveform: ear in, reflex out, no translation node between" },
    { id:"edge",    file:"edge.webp",    w:592, h:507, box:[54,17,43,66], page:1, src:"protocol", name:"The Edge", use:"the 80-vs-30 claim, coverage charts, progress", note:"rising gold curve over a dark grid" },
    { id:"confidence",file:"confidence.webp",w:440,h:384,box:[34,12,32,50], page:11, src:"protocol", name:"The Guarantee", use:"the refund promise, any 'you risk nothing' surface", note:"gold shield reading 100% CONFIDENCE inside a halo" },
    { id:"tiger2",  file:"tiger2.webp",  w:358, h:338, box:[70,27,26,44], page:3, src:"protocol", variant:true, name:"The Tiger (doctrine cut)", use:"alt TIGER MODE mark — the mode page's own head", note:"flame-headed tiger, taken from the diagnostic page" },
    { id:"mouse2",  file:"mouse2.webp",  w:344, h:276, box:[18,30,25,36], page:4, src:"tiger-mode", variant:true, name:"The Mouse (doctrine cut)", use:"alt MOUSE MODE mark — cleaner grid, no chains", note:"polygonal mouse, the low rung measured" },
    { id:"brain2",  file:"brain2.webp",  w:261, h:292, box:[74,19,19,38], page:5, src:"protocol", variant:true, name:"The 60% Rule (doctrine cut)", use:"alt comprehension mark — the AI-lit brain", note:"neural brain with lit nodes" },
    { id:"phone2",  file:"phone2.webp",  w:344, h:499, box:[40,24,25,65], page:3, src:"tiger-mode", variant:true, name:"The Magic Zone", use:"60% comprehension, drawn — lightning above water", note:"phone cut in half: ember charge over violet liquid" },

    /* ---- cut from the SEVEN HAND-PICKED MARKETING SLIDES (2026-09-22) — the
       sovereign's own selection, sent with "these I hand picked for marketing
       and teaching methodology". Same key, same rules; the slide each came from
       is named in `src`, and the slides themselves ship as SHOTS below. */
    { id:"gears-dna", file:"gears-dna.webp", box:[390,52,529,355], w:484, h:358, src:"marketing", from:"pillars", name:"The Three Engines", use:"the method band — how the system works, any process head", note:"three gears and a DNA helix: useful words, spaced repetition, community immersion as one machine" },
    { id:"head-jigsaw", file:"head-jigsaw.webp", box:[178,74,292,360], w:292, h:360, src:"marketing", from:"60-delay", name:"The Jigsaw Brain", use:"the 60% rule, the Magic Zone, comprehension over parsing", note:"wireframe head, jigsaw brain, sound entering the ear" },
    { id:"mouse-chained", file:"mouse-chained.webp", box:[146,209,256,191], w:256, h:191, src:"marketing", from:"permission", name:"The Mouse, Bound", use:"the diagnostic's low end — a student before the method", note:"chained mouse, the fear state, the grammar prison's tenant" },
    { id:"tiger-spectral", file:"tiger-spectral.webp", box:[563,158,362,216], w:362, h:216, src:"marketing", from:"permission", name:"The Tiger, Rising", use:"the shift, the closing, any transformation page", note:"leaping tiger of violet and gold energy — the halfway-state" },
    { id:"mouse-cage", file:"mouse-cage.webp", box:[54,94,286,267], w:286, h:267, src:"marketing", from:"mouse2tiger", name:"The Cage", use:"the grammar prison, the fear state, 'before'", note:"mouse in chains inside a glowing wireframe cube" },
    { id:"tiger-energy", file:"tiger-energy.webp", box:[405,95,381,235], w:381, h:235, src:"marketing", from:"mouse2tiger", name:"The Energy Tiger", use:"TIGER MODE, the pitch hero, the enrolment page", note:"the tiger as pure energy — gold and violet, mid-leap" },

    /* ---- THE HAND-PICKED SLIDES, AS STILLS. These are the sovereign's own
       marketing slides (NotebookLM-built), shipped so the station can show
       them and the print room can put them on a page. `shot:true` keeps them
       out of the mark gallery and the mark counts. */
    { id:"mkt-pillars",    file:"mkt-pillars.webp",    w:1000, h:462, shot:true, src:"marketing", name:"The Three Pillars",       use:"marketing — how we break the mold", note:"useful words, spaced repetition, community immersion, on one slide" },
    { id:"mkt-hour",       file:"mkt-hour.webp",       w:1000, h:462, shot:true, src:"marketing", name:"The 1-Hour Architecture", use:"marketing — the schedule objection, answered", note:"one hour, fitted into the life the student already has" },
    { id:"mkt-60-input",   file:"mkt-60-input.webp",   w:1000, h:531, shot:true, src:"marketing", name:"The 60% Rule",            use:"marketing + teaching — the comprehension diagram", note:"inputs into a cognitive head, mechanism / disruption / outcome" },
    { id:"mkt-60-delay",   file:"mkt-60-delay.webp",   w:1000, h:506, shot:true, src:"marketing", name:"Destroy the Delay",       use:"marketing + teaching — why translation fails", note:"comprehensible input, stop translating, pattern recognition" },
    { id:"mkt-aipet",      file:"mkt-aipet.webp",      w:1000, h:507, shot:true, src:"marketing", name:"The Forgetting Curve",    use:"marketing + teaching — accountability, sold honestly", note:"the decay curve struck at 1 / 3 / 7 / 14 / 30 days" },
    { id:"mkt-permission", file:"mkt-permission.webp", w:1000, h:582, shot:true, src:"marketing", name:"Permission to be Powerful", use:"marketing — the positioning slide", note:"the elephant chain, the zero-judgment zone, sovereign command" },
    { id:"mkt-mouse2tiger",file:"mkt-mouse2tiger.webp",w:1000, h:544, shot:true, src:"marketing", name:"Mouse to Tiger",          use:"marketing — the master slide, the whole offer on one page", note:"the mouse in its cage, the cure, the findings, the comparison" },

    /* ---- THE SECOND BATCH (2026-09-22, second send: "fuck it, go max").
       Four more hand-picked slides, and nineteen pages pulled out of the five
       PHOENIX decks (the codex, the tiger protocol, the engine, the run log).

       READ THIS BEFORE CUTTING ANYTHING ELSE OUT OF A DECK PAGE: a slide is a
       COMPOSITION. On the dossier pages the illustration stood alone on a dark
       field and could be keyed into a transparent mark. On these, every
       picture is fused to its own headline, panel frame and labels — the only
       clean cut in the whole batch is the quiet/loud waveform, and it is cut
       below. So the decks ship as STILLS (`shot:true`, this block), which is
       the honest use of them: a page is an argument, not a sprite.

       ONE MORE TRAP, measured, not guessed: the THE_TIGER_ENGINE deck is drawn
       DARK-ON-LIGHT. A mark keyed out of it would be black line-art on
       transparency — invisible on our plum ground and on any printed bed. It
       gets a still and no mark, and that is a limit of the source, not a
       failure of the key. */
    { id:"wave-loud", file:"wave-loud.webp", box:[336,388,388,96], w:385, h:88, src:"marketing", from:"architecture", name:"Quiet and Right, Loud and Wrong", use:"the immutable law, drawn — any slide or page that argues G444.004", note:"the small purple waveform against the gold one: quiet-and-right measured against loud-and-wrong" },

    { id:"mkt2-architecture",file:"mkt2-architecture.webp",w:1000, h:570, shot:true, src:"marketing", name:"The Architecture of Fluency", use:"marketing + teaching — the methodology and the infrastructure on one slide", note:"exit Mouse Mode, activate the Tiger Voice, the 45/15, the AI-PET coach, 80% completion" },
    { id:"mkt2-failure",     file:"mkt2-failure.webp",     w:1000, h:529, shot:true, src:"marketing", name:"The Core Mechanical Failure", use:"the diagnosis, bilingual — the parent-facing failure slide", note:"the bilingual title, the chained head, and the three named failures it causes" },
    { id:"mkt2-biology",     file:"mkt2-biology.webp",     w:1000, h:539, shot:true, src:"marketing", name:"The Biological Intervention", use:"the memory case — decay, intervention, tough love", note:"the Goldfish Problem curve with the 2026 status bar under it" },
    { id:"mkt2-adpipeline",  file:"mkt2-adpipeline.webp",  w:1000, h:576, shot:true, src:"marketing", name:"The Phase 0 Ad Pipeline", use:"the creative brief — six ads and the law that governs them", note:"six creatives, and the bilingual hierarchy printed under them as law" },

    { id:"phx-cover",    file:"phx-cover.webp",    w:1200, h:670, shot:true, src:"codex", name:"The Phoenix Rising Codex",      use:"the codex cover — the strategy document's own front page", note:"the codename, the clearance line, the tiger heads facing each other" },
    { id:"phx-lakeview", file:"phx-lakeview.webp", w:1200, h:670, shot:true, src:"codex", name:"Lakeview Deployment Zone",       use:"the market brief — where this is sold, and to whom", note:"the wealth surge, the infrastructure, the real estate, and the target avatar" },
    { id:"phx-pipeline", file:"phx-pipeline.webp", w:1200, h:670, shot:true, src:"codex", name:"The M2 Automation Pipeline",     use:"the sales architecture — hook to booked seat", note:"qualify, diagnose, the puppy-dog close, then the branch: book or be taken over by hand" },
    { id:"phx-stack",    file:"phx-stack.webp",    w:1200, h:670, shot:true, src:"codex", name:"The NET Sovereign Architecture", use:"the whole system as one diagram — base code to tiger", note:"base code, engine, infrastructure, tiger engine, tiger: permission to be powerful" },

    { id:"stp-404",      file:"stp-404.webp",      w:1200, h:670, shot:true, src:"tiger-protocol", name:"Input Perfect, Output 404",   use:"the diagnosis — the professional who writes perfectly and cannot speak", note:"perfect input on the left, the 404 on the right, and the elephant chain between them" },
    { id:"stp-override", file:"stp-override.webp", w:1200, h:670, shot:true, src:"tiger-protocol", name:"System Override",             use:"traditional against NET, on four measures — the honest comparison", note:"metric, psychology, delivery and outcome, side by side" },
    { id:"stp-scale",    file:"stp-scale.webp",    w:1200, h:670, shot:true, src:"tiger-protocol", name:"The Identity Evolution Scale", use:"the ladder as a picture — mouse, cub, tiger with their scores", note:"the three stages with the disease, the transition and the cure named under them" },
    { id:"stp-engine",   file:"stp-engine.webp",   w:1200, h:670, shot:true, src:"tiger-protocol", name:"The Engine of the Advantage",  use:"the four forces of the system, feeding one professional", note:"cognition, curriculum, technology and psychology meeting at the English + AI professional" },
    { id:"stp-close",    file:"stp-close.webp",    w:1200, h:670, shot:true, src:"tiger-protocol", name:"You Didn't Learn to Roar",     use:"the closing slide — the only one that asks for anything", note:"the cage door open, and the free diagnostic as the single call to action" },

    { id:"tge-bucket",   file:"tge-bucket.webp",   w:1200, h:670, shot:true, src:"tiger-engine",   name:"The Leaky Bucket",             use:"retention — why Saturday classes cannot work biologically", note:"the leak, drawn: 80% of unreinforced data gone inside 48 hours" },
    { id:"tge-rule8",    file:"tge-rule8.webp",    w:1200, h:670, shot:true, src:"tiger-engine",   name:"The 8-Time Rule",              use:"retention — how a word is made subconscious", note:"hesitation, stutter and mispronunciation logged as struggle data, then met eight times in context" },
    { id:"tge-hud",      file:"tge-hud.webp",      w:1200, h:670, shot:true, src:"tiger-engine",   name:"The Memory HUD",               use:"retention — the decay window and the strike at 60%", note:"the curve, the five strike points, and the reset to 100%" },

    { id:"tep-lazy",     file:"tep-lazy.webp",     w:1200, h:670, shot:true, src:"tiger-engine",   name:"Strategic Laziness",           use:"the AI half of the advantage — the ostrich against the architect", note:"dumb laziness and strategic laziness, and the 100x output line between them" },
    { id:"tep-math",     file:"tep-math.webp",     w:1200, h:670, shot:true, src:"tiger-engine",   name:"The Math of the Tiger",        use:"the proof page — 95, 80 and 40, each with its sentence", note:"the three numbers the marketing is allowed to quote" },
    { id:"tep-audit",    file:"tep-audit.webp",    w:1200, h:670, shot:true, src:"tiger-engine",   name:"What Is Your Tiger Score?",    use:"the offer — the 30-minute clinical diagnostic", note:"diagnose, identify, execute: the audit that replaces the sales pitch" },
    { id:"run305",       file:"run305.webp",       w:1200, h:670, shot:true, src:"run-log",        name:"Reincarnation — Run 305",      use:"the operational readout — the station's own session, as a page", note:"the run log cover: agent, datetime, session tag, merge" },
    /* ---- THE PHOENIX RISING CODEX, page by page, at full resolution
       (2026-09-22). The twelve law slides of the codex the sovereign sent as
       IMAGES — the same deck this system transcribes and redraws, kept as the
       pictures it actually is. A slide is a composition: it is a still, never
       a sprite (BRAND.014). 1600 px wide, so it survives a post or a page. */
    { id:"cdx-ultimate", file:"cdx-ultimate.webp", w:1600, h:893, src:"codex", shot:true, feat:1, name:"The Ultimate Edge", use:"the 80-vs-30 claim as a slide — coverage charts, any 'the numbers' post", note:"the 2026 unfair-advantage slide: the phoenix out of the wreck and a gold curve climbing" },
    { id:"cdx-diagnosis", file:"cdx-diagnosis.webp", w:1600, h:893, src:"codex", shot:true, name:"The Grammar Prison", use:"the diagnosis — why the old method fails, parent-facing", note:"grammar first = fear first: the translate-in-head loop drawn as a prison" },
    { id:"cdx-shift", file:"cdx-shift.webp", w:1600, h:893, src:"codex", shot:true, feat:1, name:"The Psychological Shift", use:"the mode ladder as a picture — mouse, cub, tiger with their scores", note:"three stages, 0-40 / 41-79 / 80-100, with the diagnostic specification under each" },
    { id:"cdx-immutable", file:"cdx-immutable.webp", w:1600, h:893, src:"codex", shot:true, name:"The Immutable Law", use:"any page that argues G444.004 — social, print, deck", note:"loud & wrong beats quiet & right, the two waveforms weighed against each other" },
    { id:"cdx-advantage", file:"cdx-advantage.webp", w:1600, h:893, src:"codex", shot:true, name:"The 2026 Unfair Advantage", use:"English + AI, the market claim — website hero, pitch", note:"the professional who speaks English and commands the machine" },
    { id:"cdx-acquisition", file:"cdx-acquisition.webp", w:1600, h:893, src:"codex", shot:true, feat:1, name:"The Natural Acquisition Engine", use:"the method band — the 60% rule and the 45/15 in one diagram", note:"comprehensible input and the 1-hour lifestyle as the engine's two halves" },
    { id:"cdx-retention", file:"cdx-retention.webp", w:1600, h:893, src:"codex", shot:true, feat:1, name:"The Retention Code", use:"the lesson anatomy — teachers, parents, the method card", note:"10 core words, 5 idioms, 5 slang, 3 games: the 10-5-5-3 lesson" },
    { id:"cdx-aipet", file:"cdx-aipet.webp", w:1600, h:893, src:"codex", shot:true, name:"Your Pocket Sovereign", use:"the AI-PET half of the offer — accountability, sold honestly", note:"the pocket coach against the forgetting curve" },
    { id:"cdx-ecosystem", file:"cdx-ecosystem.webp", w:1600, h:893, src:"codex", shot:true, name:"The Ecosystem", use:"community and environment — why willpower is not the plan", note:"environment beats willpower: the hive of students who carry each other" },
    { id:"cdx-matrix", file:"cdx-matrix.webp", w:1600, h:893, src:"codex", shot:true, feat:1, name:"The Unfair Advantage Matrix", use:"the comparison page — the honest side-by-side", note:"traditional centre trap against the sovereign system, six rows" },
    { id:"cdx-guarantee", file:"cdx-guarantee.webp", w:1600, h:893, src:"codex", shot:true, feat:1, name:"The 100% Confidence Guarantee", use:"the offer and the risk reversal — the closing page", note:"we are doctors, not salespeople: the promise is confidence, not grammar" },
    { id:"cdx-wake", file:"cdx-wake.webp", w:1600, h:893, src:"codex", shot:true, feat:1, name:"Wake Up the Tiger", use:"the closing slide — the campaign's final frame", note:"the cage open over a neon city, bilingual" },

    /* ---- THE SOCIAL SET (2026-09-22). Finished posts, 1536 px wide, built
       by the sovereign in NotebookLM: the campaign as it actually ships. His
       tool leaves a small mark in the bottom-right corner of each — it is on
       the source and is NOT removed here (BRAND.020: a still is never
       restyled). */
    { id:"soc-rising", file:"soc-rising.webp", w:1536, h:857, src:"social", shot:true, feat:1, name:"The Phoenix Rising Protocol", use:"the master social post — transmuting mice into tigers", note:"from hesitant learner to high-stakes executive command, on one page" },
    { id:"soc-transform", file:"soc-transform.webp", w:1536, h:857, src:"social", shot:true, name:"The Transformation", use:"the identity shift + the AI-PET engine, one post", note:"mouse to tiger with the technology under it" },
    { id:"soc-blueprint", file:"soc-blueprint.webp", w:1536, h:857, src:"social", shot:true, feat:1, name:"The Blueprint", use:"the full method as one post — the wall poster of the campaign", note:"psychological metamorphosis and the high-compute learning engine" },
    { id:"soc-trap", file:"soc-trap.webp", w:1536, h:857, src:"social", shot:true, name:"The Traditional Trap", use:"the comparison post — what the other centres do", note:"mouse mode against tiger mode, the trap named on the left" },
    { id:"soc-reality", file:"soc-reality.webp", w:1536, h:857, src:"social", shot:true, name:"Phoenix Reality-C", use:"the product announcement — the immutable OS", note:"the phoenix over techno panels: system identity and core philosophy" },
    { id:"soc-chains", file:"soc-chains.webp", w:1536, h:857, src:"social", shot:true, feat:1, name:"Break the Chains", use:"the bilingual hook post — the disease and the cure", note:"bilingual: mouse mode as the disease, tiger mode as the cure" },
    { id:"soc-summer", file:"soc-summer.webp", w:1536, h:857, src:"social", shot:true, feat:1, name:"Break the Chains (Summer)", use:"the cinematic cut of the same headline — an Instagram or hero post", note:"the phone, the tiger climbing, and the mouse left behind; the bilingual infographic of the same headline is soc-chains" },
    { id:"soc-60input", file:"soc-60input.webp", w:1080, h:573, src:"social", shot:true, name:"The 60% Rule", use:"the comprehension post — why the brain needs 60%", note:"comprehensible input, the cognitive head, mechanism and outcome" },
    { id:"soc-60delay", file:"soc-60delay.webp", w:1080, h:546, src:"social", shot:true, feat:1, name:"Destroy the Delay", use:"the translation-delay post — the single best argument", note:"comprehensible input kills the translate-in-head delay" },
    { id:"soc-leaks", file:"soc-leaks.webp", w:1080, h:548, src:"social", shot:true, name:"The Leaky Memory", use:"the AI-PET post — spaced repetition", note:"the forgetting curve, struck at 1 / 3 / 7 / 14 / 30 days" },
    { id:"soc-permission", file:"soc-permission.webp", w:1080, h:629, src:"social", shot:true, name:"Permission to be Powerful", use:"the positioning post — we sell permission, not language", note:"the elephant chain and the zero-judgment zone" },
    { id:"soc-fluency", file:"soc-fluency.webp", w:1080, h:616, src:"social", shot:true, feat:1, name:"The Architecture of Fluency", use:"the methodology post — identity, method and infrastructure", note:"exit mouse mode, activate the tiger voice, the 45/15, the AI-PET, 80%" },
    { id:"soc-failure", file:"soc-failure.webp", w:1080, h:571, src:"social", shot:true, name:"The Core Mechanical Failure", use:"the bilingual diagnosis post", note:"the chained head and the three failures it causes, English over Vietnamese" },
    { id:"soc-biological", file:"soc-biological.webp", w:1080, h:582, src:"social", shot:true, name:"The Biological Intervention", use:"the memory post — decay and intervention", note:"the goldfish problem with the activation timeline under it" },
    { id:"soc-adpipeline", file:"soc-adpipeline.webp", w:1080, h:622, src:"social", shot:true, name:"The Phase 0 Ad Pipeline", use:"the creative brief — six ads and the law", note:"the six creatives the campaign runs, in order" },
    { id:"soc-differentiators", file:"soc-differentiators.webp", w:1080, h:595, src:"social", shot:true, name:"Our Differentiators", use:"the method post — useful words, repetition, community", note:"the three engines, headed as our differentiators" },

    /* ---- THE ART SET (2026-09-22). AI-rendered hero art the sovereign
       supplied for banners and pages. Where a tile was garbled, duplicated or
       watermarked past use it was NOT shipped — the audit is
       src/marketing/INGEST-LOG.md. */
    { id:"art-duo", file:"art-duo.webp", w:1600, h:1600, src:"art", shot:true, feat:1, name:"The Boardroom", use:"website hero, banner, LinkedIn — the corporate proof of the claim", note:"two executives in a gold-and-violet data room, AI-generated" },
    { id:"art-command", file:"art-command.webp", w:1600, h:1195, src:"art", shot:true, name:"The Command Desk", use:"the widest hero — website top band, email header", note:"professionals at a data centre desk, the widest field of the set" },
    { id:"art-emblem", file:"art-emblem.webp", w:1566, h:1600, src:"art", shot:true, name:"The Apex, Rendered", use:"a splash screen or a section divider — the mark in colour", note:"the cybernetic phoenix over its gold and violet ribbons, on a star field" },
    { id:"art-tigerkid", file:"art-tigerkid.webp", w:1195, h:1600, src:"art", shot:true, name:"NET Tigers (3-7)", use:"the children's line — a product label or a poster", note:"neon tiger head over 'AGES 3-7', the young learners' own mark" },
    { id:"art-choose", file:"art-choose.webp", w:1600, h:873, src:"art", shot:true, name:"Choose Your Path", use:"the two-doors post — children or professionals", note:"left gate NET Tigers, right gate the professionals, bilingual" },
    { id:"art-university", file:"art-university.webp", w:1600, h:1600, src:"art", shot:true, name:"University Age", use:"the tertiary offer — an academic crest", note:"gold crest under a crown, 'UNIVERSITY AGE'" },

    /* ---- THE PRAIS APEX — the sovereign's own logotype, keyed out of the
       black-and-white plate at full resolution (2026-09-22). The anatomy page
       below is the specification; BRAND.029 is the law. Use the mark from
       64 px up; below that the `apex` GLYPH (the tesseract core) carries it. */
    { id:"apex", file:"apex.webp", w:900, h:842, src:"apex", name:"The PrAis Apex", use:"THE STATION'S LOGOTYPE — the lockup from 64px up, a deck cover, a letterhead", note:"the cybernetic phoenix over the tesseract core, in Imperial Gold on transparency" },
    { id:"apex-ink", file:"apex-ink.webp", w:900, h:842, src:"apex", variant:true, name:"The PrAis Apex (ink)", use:"print and light grounds — the same plate in one dark ink", note:"near-black on transparency, for paper and for any ground that is not the void" },
    { id:"apex-app", file:"apex-app.png", w:512, h:512, src:"apex", variant:true, name:"The PrAis Apex (app icon)", use:"the touch icon and any square tile — opaque, so iOS cannot composite it wrong", note:"the gold mark on the ground inside a court ring, 512 px, opaque PNG" },
    { id:"apex-anatomy", file:"apex-anatomy.webp", w:1600, h:893, src:"apex", shot:true, feat:1, name:"Anatomy of the PrAis Apex", use:"THE LOGO SPEC — the mark's parts and its palette, on one page", note:"the cybernetic phoenix, the tesseract core, the neural grid, the dual-tone palette" },
    { id:"apex-net", file:"apex-net.webp", w:1600, h:892, src:"apex", shot:true, name:"The Apex over NET", use:"the lockup — the mark with the NET wordmark above it", note:"the same phoenix, with NET set heavy across the top" }
  ];
  const ASSET_BY = {}; ASSETS.forEach(a => ASSET_BY[a.id] = a);
  const SRC_LABEL = { protocol:"protocol", "tiger-mode":"tiger mode", marketing:"hand-picked", codex:"the codex", "tiger-protocol":"the tiger protocol", "tiger-engine":"the tiger engine", "run-log":"the run log", social:"the social set", art:"the art set", apex:"the apex" };
  function srcLabel(a){ return SRC_LABEL[a.src] || "dossier"; }
  function assetPath(id){ const a = ASSET_BY[id]; return a ? BASE + "brand/assets/" + a.file + "?v=" + ASSET_V : null; }
  function asset(id, opts){
    opts = opts || {};
    const a = ASSET_BY[id];
    if(!a) return "";
    const style = opts.style ? ' style="' + opts.style.replace(/"/g, "&quot;") + '"' : "";
    const cls = "bx-mark" + (opts.cls ? " " + opts.cls : "");
    return '<img class="' + cls + '" src="' + assetPath(id) + '" alt="' + esc(a.name) + '" width="' + a.w + '" height="' + a.h + '" loading="lazy" decoding="async"' + style + '>';
  }
  const cache = {};
  async function assetDataUrl(id){
    if(cache[id]) return cache[id];
    const p = assetPath(id);
    if(!p) return null;
    const r = await fetch(p);
    if(!r.ok) throw new Error("brand asset " + id + " → HTTP " + r.status);
    const b = await r.blob();
    return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { cache[id] = fr.result; res(fr.result); }; fr.onerror = rej; fr.readAsDataURL(b); });
  }
  /* synchronous, but only for marks already inlined once (exports need this) */
  function assetDataUrlSync(id){ return cache[id] || null; }
  /* the same mark, re-encoded small, for an EXPORT. A deck that inlines fifteen
     marks at full size is 2 MB of base64; nothing in a deck is ever shown larger
     than ~520 px, so this is the difference between a file someone can email and
     a file they cannot, with no visible loss. */
  const deckCache = {};
  async function deckDataUrl(id, maxSide){
    const key = id + "@" + (maxSide || 520);
    if(deckCache[key]) return deckCache[key];
    const p = assetPath(id);
    if(!p) return null;
    try{
      const blob = await (await fetch(p)).blob();
      const bmp = await createImageBitmap(blob);
      const s = Math.min(1, (maxSide || 520) / Math.max(bmp.width, bmp.height));
      const w = Math.max(1, Math.round(bmp.width * s)), h = Math.max(1, Math.round(bmp.height * s));
      const cv = new OffscreenCanvas(w, h);
      const cx = cv.getContext("2d");
      cx.imageSmoothingQuality = "high";
      cx.drawImage(bmp, 0, 0, w, h);
      const out = await cv.convertToBlob({ type:"image/webp", quality:0.82 });
      const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(out); });
      deckCache[key] = url;
      return url;
    }catch(e){ return null; }
  }

  /* ==========================================================================
     EMBLEMS — the artwork that ranks a person.
     A mark (ASSETS above) is a picture cut from the sovereign's own decks; an
     emblem is drawn HERE, in vectors, because it has to survive both a 120 mm
     print and a 9 mm stamp, and because it must be composable: one ring, one
     set of ticks, the rung changed.

     Three families with deliberately different silhouettes, so that they can
     never be read as each other:
       · rank-*  the coin ladder (LESSON.012)      — a ROUNDEL, pips lit by rank
       · mode-*  the diagnostic ladder (G444.003)  — a SHIELD, band = the rung
       · seal-*  the station and the doctrine      — a RING of twenty-four ticks
     Two shapes for two ladders is the point: a student can be a Tiger on the
     diagnostic while holding 40 coins, and identical emblems would invite the
     exact confusion G444.003 forbids.
     ========================================================================== */
  /* ==========================================================================
     THE PRAIS APEX — the sovereign's own logotype (2026-09-22).

     WHAT CHANGED, AND WHY THIS IS A BIG ONE. Until now the station's most
     official-looking mark was the abstract `phoenix` GLYPH on the 100 grid —
     a drawing this file invented, carried as if it were the logotype. The
     sovereign then sent the real thing: a black-and-white plate of a
     cybernetic phoenix over a tesseract core, plus the page that specifies it
     ("ANATOMY OF THE PRAIS APEX"). The mark is now a SHIPPED ASSET (`apex`,
     keyed to transparency and re-coloured to Imperial Gold and to ink, never
     redrawn), the glyph is demoted to the reduced form it always was, and the
     specification below is transcribed verbatim — it is the sovereign's
     document, not this file's opinion. BRAND.029 is the law.

     THE TWO FORMS, BECAUSE THIS IS THE ONE MARK THAT NEEDS TWO:
       · `apex`      ASSET — the full mark, 900 px, gold on transparency. Wear
                     it from 64 px up: a lockup, a deck cover, a letterhead.
       · `apex`      GLYPH — the tesseract core alone, on the 24 grid. This is
                     the favicon and anything smaller than a thumbnail, because
                     the full mark's fiber-optic hatching turns to mud under
                     ~48 px and a mark that dies in a tab is not a mark
                     (BRAND.012's rule, applied to the logotype).
     ========================================================================== */
  const APEX = {
    version: "1.0",
    name: "THE PRAIS APEX",
    page: "ANATOMY OF THE PRAIS APEX: THE GOSPEL 444 VISUAL IDENTITY",
    source: "the sovereign's own identity page, sent 2026-09-22 — shipped as the still `apex-anatomy`",
    parts: [
      [ "THE CYBERNETIC PHOENIX", "A majestic, aerodynamic bird representing digital rebirth and high-tech precision." ],
      [ "THE TESSERACT CORE", "A central medallion containing a glowing, geometric isometric cube network." ],
      [ "NEURAL GRID ENVIRONMENT", "The logo sits atop a \"Void Black\" backdrop with subtle neural-network lines." ]
    ],
    tech: [
      [ "THE SACRED DUAL-TONE PALETTE", "A gradient split between 'Soul Purple' (#a855f7) and 'Imperial Gold' (#f59e0b)." ],
      [ "FIBER-OPTIC CIRCUITRY", "Digital feathers embedded with intricate high-tech nodes and glowing fiber-optic lines." ],
      [ "GLASSMORPHISM & DEPTH", "Use of volumetric lighting and razor-sharp edges to create a 3D glass-like effect." ]
    ],
    /* the two names in the specification are the two frozen tokens, spelled
       the same way — which is why the mark can be keyed to them without
       touching LESSON.008 (BRAND.002). */
    tokens: [ ["Soul Purple", "#a855f7", "system"], ["Imperial Gold", "#f59e0b", "reward"] ],
    sizes: [ [16, "the glyph — the tesseract core alone, legible in a tab"], [64, "the full mark, the first size that may carry it"], [240, "the mark at home — a deck cover, a hero, a letterhead"], [900, "the shipped file"] ],
    files: [ ["apex", "the mark in Imperial Gold on transparency — anywhere dark"], ["apex-ink", "the mark in one dark ink — paper and light grounds"], ["apex-app", "the mark opaque on the ground, 512 px — the touch icon"], ["apex-anatomy", "the specification page itself, as a still"], ["apex-net", "the mark with the NET wordmark above it — the lockup variant"] ],
    rule: "The Apex is the station's logotype. It is worn from 64 px up; below that the tesseract-core GLYPH carries it. The mark is keyed and re-coloured, never redrawn — its geometry is the sovereign's."
  };

  const EMBLEMS = [];
  TIERS.forEach((t, i) => EMBLEMS.push({ id:"rank-" + t.id, tier:t.id, family:"rank", shape:"roundel", pips:i + 1, of:TIERS.length, ink:t.ink, icon:t.icon, name:t.name.toUpperCase(), role:"COIN RANK \u00b7 " + t.at, note:t.note }));
  MODES.forEach((m, i) => EMBLEMS.push({ id:"mode-" + m.id, tier:m.id, family:"mode", shape:"shield", pips:i + 1, of:MODES.length, ink:m.ink, icon:m.icon, name:m.name, role:"DIAGNOSTIC \u00b7 " + m.at + "\u2013" + m.to, note:m.behaviour }));
  EMBLEMS.push({ id:"seal-net", tier:"", family:"seal", shape:"ring", pips:1, of:1, ink:"ancient", icon:"phoenix", name:"NET ACADEMY", role:"THE STATION'S SEAL", note:"one ring, twenty-four ticks, the phoenix" });
  EMBLEMS.push({ id:"seal-444", tier:"", family:"seal", shape:"ring", pips:1, of:1, ink:"ember", icon:"flame", name:"GOSPEL 444", role:"THE DOCTRINE'S SEAL", note:"the protocol's own stamp" });
  const EMBLEM_BY = {}; EMBLEMS.forEach(e => EMBLEM_BY[e.id] = e);
  function emblemNames(){ return EMBLEMS.map(e => e.id); }
  function emblemOf(id){ return EMBLEM_BY[id] || null; }

  function emblem(id, opts){
    opts = opts || {};
    const e = EMBLEM_BY[id];
    if(!e) return "";
    const ink = "var(--bx-" + e.ink + ")";
    const size = opts.size || 96;
    /* below ~30 px the ticks stop being ticks and become noise, so the drawing
       drops them and fattens what is left. An emblem that only works at one
       size is a picture, not an emblem. */
    const tiny = size < 30;
    let art = "";
    if(e.shape === "roundel"){
      const ticks = [];
      for(let i = 0; !tiny && i < e.of; i++){
        const a = (90 + (360 - 250)/2 + (250 / (e.of - 1)) * i) * Math.PI / 180;
        const lit = i < e.pips;
        ticks.push('<path d="M' + (50 + Math.cos(a)*40.5).toFixed(2) + ' ' + (50 + Math.sin(a)*40.5).toFixed(2) + 'L' + (50 + Math.cos(a)*(lit ? 47.6 : 44.6)).toFixed(2) + ' ' + (50 + Math.sin(a)*(lit ? 47.6 : 44.6)).toFixed(2) + '" stroke="' + (lit ? ink : "var(--bx-court-line)") + '" stroke-width="' + (lit ? 2.6 : 1.3) + '" stroke-linecap="round"/>');
      }
      art = tiny
        ? '<circle cx="50" cy="50" r="45.5" fill="none" stroke="' + ink + '" stroke-width="4"/>'
        : '<circle cx="50" cy="50" r="48.4" fill="none" stroke="var(--bx-court-line)" stroke-width=".7"/>' + ticks.join("")
          + '<circle cx="50" cy="50" r="38.6" fill="none" stroke="var(--bx-court-line)" stroke-width="1"/>'
          + '<circle cx="50" cy="50" r="33.8" fill="none" stroke="' + ink + '" stroke-width=".7" opacity=".45" stroke-dasharray="2 3.2"/>';
    } else if(e.shape === "shield"){
      const pips = [];
      for(let i = 0; !tiny && i < e.of; i++){
        const lit = i < e.pips, x = 50 + (i - (e.of - 1)/2) * 17.5;
        pips.push('<path d="M' + x.toFixed(2) + ' 71l5.4 5.4-5.4 5.4-5.4-5.4z" fill="' + (lit ? ink : "none") + '" stroke="' + (lit ? ink : "var(--bx-court-line)") + '" stroke-width="1.3" opacity="' + (lit ? ".95" : ".75") + '"/>');
      }
      art = tiny
        ? '<path d="M50 7l31.5 11.8v24.8c0 21.8-12.8 35.6-31.5 43.6C31.2 79.2 18.4 65.4 18.4 43.6V18.8z" fill="none" stroke="' + ink + '" stroke-width="5"/>'
        : '<path d="M50 7l31.5 11.8v24.8c0 21.8-12.8 35.6-31.5 43.6C31.2 79.2 18.4 65.4 18.4 43.6V18.8z" fill="none" stroke="' + ink + '" stroke-width="1.8"/>'
          + '<path d="M50 13.8l25.4 9.5v20.1c0 17.8-10.3 29-25.4 35.6-15.1-6.6-25.4-17.8-25.4-35.6V23.3z" fill="none" stroke="var(--bx-court-line)" stroke-width=".8"/>'
          + pips.join("");
    } else {
      const ticks = [];
      for(let i = 0; !tiny && i < 24; i++){
        const a = (i / 24) * 360 * Math.PI / 180;
        ticks.push('<path d="M' + (50 + Math.cos(a)*42).toFixed(2) + ' ' + (50 + Math.sin(a)*42).toFixed(2) + 'L' + (50 + Math.cos(a)*47.4).toFixed(2) + ' ' + (50 + Math.sin(a)*47.4).toFixed(2) + '" stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>');
      }
      art = tiny
        ? '<circle cx="50" cy="50" r="45" fill="none" stroke="' + ink + '" stroke-width="4"/>'
        : '<circle cx="50" cy="50" r="49" fill="none" stroke="' + ink + '" stroke-width="1.8"/>' + ticks.join("")
          + '<circle cx="50" cy="50" r="38" fill="none" stroke="var(--bx-court-line)" stroke-width="1"/>';
    }
    const gs = tiny ? (e.shape === "shield" ? 48 : 52) : (e.shape === "shield" ? 38 : 40);
    const gx = 50 - gs/2, gy = (e.shape === "shield" ? (tiny ? 22 : 26) : (tiny ? 24 : 30));
    const glyph = '<svg x="' + gx + '" y="' + gy + '" width="' + gs + '" height="' + gs + '" viewBox="' + iconViewBox(e.icon) + '" fill="none" stroke="' + ink + '" stroke-width="' + (tiny ? 2 : 1.6) + '" stroke-linecap="round" stroke-linejoin="round">' + iconBody(e.icon) + '</svg>';
    return '<svg class="bx-emb bx-emb-' + e.family + (opts.cls ? " " + opts.cls : "") + '" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" style="color:' + ink + '" role="img" aria-label="' + esc(e.name + " emblem \u2014 " + e.role) + '">' + art + glyph + '</svg>';
  }
  /* an emblem with its name band — the HTML unit the desk, the poster and the
     certificate all use, so a rank is never shown without saying which rank. */
  function emblemBand(id, opts){
    opts = opts || {};
    const e = EMBLEM_BY[id]; if(!e) return "";
    return '<div class="bx-emb-band" style="--emb-ink:var(--bx-' + e.ink + ')">'
      + emblem(id, { size: opts.size || 96 })
      + '<div class="bx-emb-t"><b>' + esc(e.name) + '</b><span>' + esc(e.role) + '</span>'
      + '<i>' + esc(opts.note || e.note) + '</i></div></div>';
  }

  /* ==========================================================================
     PATTERNS — the beds. Four tiles, drawn here, used as grounds for print and
     for the station's own empty states. They are backgrounds, never a message:
     `hazard` is for a warning plate and never for a lesson bed (BRAND.002 —
     the extension may texture chrome, it may not restyle a lesson).
     ========================================================================== */
  const PATTERNS = {
    lattice: { name:"THE LATTICE", use:"page beds and panel grounds \u2014 the grid the prison was built on", tile:48,
      art:(ink) => "<g fill='none' stroke='" + ink + "' stroke-width='.55' opacity='.5'><path d='M0 24h48M24 0v48'/><path d='M0 12h48M12 0v48' opacity='.5'/></g><path d='M0 0h48v48H0z' fill='none' stroke='" + ink + "' stroke-width='1' opacity='.7'/>" },
    circuit: { name:"THE CIRCUIT", use:"the station's own bed \u2014 system grounds", tile:56,
      art:(ink) => "<g fill='none' stroke='" + ink + "' stroke-width='.7' opacity='.6'><path d='M0 14h20v14h16V0M56 42H36V28H20v28'/><circle cx='20' cy='14' r='1.6'/><circle cx='36' cy='28' r='1.6'/></g>" },
    ember: { name:"EMBER", use:"tiger-mode grounds \u2014 heat coming off the page", tile:64,
      art:(ink) => "<g fill='" + ink + "' opacity='.65'><circle cx='9' cy='52' r='1.5'/><circle cx='30' cy='20' r='1'/><circle cx='48' cy='38' r='1.9'/><circle cx='22' cy='44' r='.9'/><circle cx='56' cy='9' r='1.2'/><circle cx='40' cy='58' r='1.1'/></g>" },
    hazard: { name:"THE BREAK", use:"warning plates only \u2014 never a lesson bed", tile:48,
      art:(ink) => "<g stroke='" + ink + "' stroke-width='7' opacity='.4'><path d='M-10 10L10-10M2 46L46 2M34 58L58 34'/></g>" }
  };
  function patternUrl(kind, ink, opacity){
    const p = PATTERNS[kind]; if(!p) return "";
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + p.tile + "' height='" + p.tile + "' viewBox='0 0 " + p.tile + " " + p.tile + "'><g opacity='" + (opacity == null ? 1 : opacity) + "'>" + p.art(ink || "#a855f7") + "</g></svg>";
    /* single-quoted on purpose: this string goes straight into a style="..."
       attribute, and a double quote in there ends the attribute early.
       encodeURIComponent does NOT escape ' ( ) — it leaves all three — and the
       SVG body is written with single quotes, so they MUST be percent-encoded
       here or the first one closes the url('...') early and every swatch
       computes to `background-image:none` (found by looking at the desk, not
       by reasoning). */
    const enc = encodeURIComponent(svg).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
    return "url('data:image/svg+xml," + enc + "')";
  }
  function patternCss(kind, opts){
    opts = opts || {};
    const p = PATTERNS[kind]; if(!p) return "";
    const s = Math.round(p.tile * (opts.scale || 1));
    return "background-image:" + patternUrl(kind, opts.ink, opts.opacity) + ";background-size:" + s + "px " + s + "px;background-repeat:repeat";
  }
  function patternSection(){
    return '<div class="bx-grid bx-grid-wide">' + Object.keys(PATTERNS).map(k => {
      const p = PATTERNS[k];
      return '<div class="bx-cell" style="text-align:left"><div style="height:96px;border:1px solid var(--bx-court-line);border-radius:3px;' + patternCss(k, { ink: k === "ember" ? "#dc9438" : k === "hazard" ? "#e0473f" : "#a855f7", opacity:.75 }) + '"></div>'
        + '<div class="bx-cell-name" style="color:var(--bx-ancient);font-size:11px;margin-top:7px">' + esc(p.name) + '</div>'
        + '<div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px">' + esc(p.use) + '</div>'
        + '<div class="bx-bar" style="margin-top:6px">' + esc(k) + ' <span class="bx-sep">//</span> ' + p.tile + 'px TILE <span class="bx-sep">//</span> patternCss("' + esc(k) + '")</div></div>';
    }).join("") + '</div>'
    + '<div class="bx-bar" style="margin-top:8px">PATTERNS ARE BEDS, NOT MESSAGES <span class="bx-sep">//</span> A LESSON BED IS ALWAYS lattice OR ember <span class="bx-sep">//</span> hazard IS FOR FAULT PLATES ONLY</div>';
  }
  function emblemSection(){
    return '<div class="bx-bar" style="margin-bottom:9px">' + EMBLEMS.length + ' EMBLEMS <span class="bx-sep">//</span> ROUNDEL = COINS (LESSON.012) <span class="bx-sep">//</span> SHIELD = DIAGNOSTIC (G444.003) <span class="bx-sep">//</span> RING = THE SEALS <span class="bx-sep">//</span> VECTOR, SO A 9 mm STAMP AND A 120 mm PRINT ARE THE SAME DRAWING</div>'
      + '<div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">'
      + EMBLEMS.map(e => '<div class="bx-cell" style="text-align:left;background:#0b0714">' + emblemBand(e.id, { size:112 }) + '</div>').join("")
      + '</div>'
      + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-top">' + icon("scale") + '<b>ONE SIZE, THREE STRESSES</b></div><div class="bx-plate-body">The same drawing at 112, 40 and 18 px — an emblem that only works at one size is a picture, not an emblem.</div>'
      + '<div style="margin-top:9px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">'
      + emblem("rank-tiger", { size:112 }) + emblem("rank-tiger", { size:40 }) + emblem("rank-tiger", { size:18 })
      + emblem("mode-tiger", { size:112 }) + emblem("mode-tiger", { size:40 })
      + emblem("seal-net", { size:112 }) + emblem("seal-444", { size:40 })
      + '</div></div>';
  }

  /* ==========================================================================
     HUD — the chrome
     ========================================================================== */
  function bar(items, opts){
    opts = opts || {};
    const arr = Array.isArray(items) ? items : String(items || "").split("//").map(s => s.trim()).filter(Boolean);
    const inner = arr.map(x => esc(String(x))).join(' <span class="bx-sep">//</span> ');
    return '<div class="bx-bar' + (opts.cls ? " " + opts.cls : "") + '">' + inner + '</div>';
  }
  function frame(inner, opts){
    opts = opts || {};
    const t = opts.title ? '<div class="bx-frame-head">' + (opts.icon ? icon(opts.icon) : "") + '<span>' + esc(opts.title) + '</span>' + (opts.meta ? '<span class="bx-frame-meta">' + esc(opts.meta) + '</span>' : "") + '</div>' : "";
    return '<div class="bx-frame' + (opts.cls ? " " + opts.cls : "") + '">' + t + '<div class="bx-frame-body">' + inner + '</div></div>';
  }
  function plate(iconName, title, body, opts){
    opts = opts || {};
    return '<div class="bx-plate"><div class="bx-plate-top">' + (iconName ? icon(iconName) : "") + '<b>' + esc(title) + '</b></div>'
      + '<div class="bx-plate-body">' + (opts.raw ? body : esc(body)) + '</div></div>';
  }
  function pill(iconName, label, value){
    return '<span class="bx-pill">' + (iconName ? icon(iconName) : "") + (label ? '<span class="bx-pill-l">' + esc(label) + '</span>' : "") + '<b>' + esc(value) + '</b></span>';
  }
  function crest(coins){
    const n = Number(coins) || 0;
    let t = TIERS[0];
    for(const x of TIERS) if(n >= x.at) t = x;
    return '<span class="bx-crest" style="--crest-ink:var(--bx-' + t.ink + ')" title="' + esc(n + " coins · " + t.name) + '">' + icon(t.icon) + '<span>' + t.name.toUpperCase() + '</span><b>' + n + '</b></span>';
  }
  /* the doctrine's own badge — a diagnostic score, not a coin count */
  function modeBadge(score){
    const m = modeOf(score);
    const n = Number(score) || 0;
    return '<span class="bx-crest" style="--crest-ink:var(--bx-' + m.ink + ')" title="' + esc("diagnostic " + n + "/100 · " + m.behaviour) + '">' + icon(m.icon) + '<span>' + m.name.replace(" MODE", "") + '</span><b>' + n + '</b></span>';
  }
  function watermark(id, opts){
    opts = opts || {};
    return '<div class="bx-watermark' + (opts.cls ? " " + opts.cls : "") + '">' + asset(id, { cls:"bx-mark-wm" }) + '</div>';
  }
  function lockup(opts){
    opts = opts || {};
    const s = opts.size || "40px";
    return '<span class="bx-lockup">'
      + '<span class="bx-sigil">' + asset("head", { style:"width:" + s + ";height:" + s + ";object-fit:contain" }) + '</span>'
      + '<span class="bx-lockup-t"><span class="bx-wm-1">PaiS-HQ</span><span class="bx-wm-s">/</span><span class="bx-wm-2">COMMAND</span>'
      + '<span class="bx-wm-sub">' + esc(opts.sub || "Phoenix AI Solutions · Central Delegation Hub") + '</span></span></span>';
  }

  /* ==========================================================================
     THE DOCTRINE'S CHROME — the devices GOSPEL 444's own decks are made of.
     These are chrome from the material, not new invention: the terminal pane
     (protocol p12), the directive line (tiger-mode p3), the four-node chain
     (protocol p2), the two-column matrix (protocol p10).
     ========================================================================== */
  function terminal(lines, opts){
    opts = opts || {};
    const arr = Array.isArray(lines) ? lines : String(lines == null ? "" : lines).split("\n");
    return '<div class="bx-term' + (opts.cls ? " " + opts.cls : "") + '">'
      + '<div class="bx-term-bar"><i></i><i></i><i></i>' + (opts.title ? '<b>' + esc(opts.title) + '</b>' : "") + '</div>'
      + '<div class="bx-term-body">' + arr.map(l => '<div>' + esc(String(l)) + '</div>').join("")
      + '<div class="bx-term-cur">\u2588</div></div></div>';
  }
  function directive(text, opts){
    opts = opts || {};
    return '<div class="bx-dir' + (opts.cls ? " " + opts.cls : "") + '"><span class="bx-dir-c">\u2192</span><b>'
      + esc(opts.label || "EXECUTE DIRECTIVE") + ':</b> <span>' + esc(text) + '</span></div>';
  }
  function flowchain(nodes, opts){
    opts = opts || {};
    const arr = Array.isArray(nodes) ? nodes : [];
    return '<div class="bx-flow">' + arr.map((n, i) =>
      (i ? '<div class="bx-flow-a">\u2193</div>' : "")
      + '<div class="bx-flow-n' + (opts.dead && i === arr.length - 1 ? " bx-flow-dead" : "") + '">' + esc(String(n)) + '</div>').join("") + '</div>';
  }
  function chips(list, opts){
    opts = opts || {};
    return '<div class="bx-chips">' + (Array.isArray(list) ? list : []).map(c =>
      '<span class="bx-chip' + (c[2] ? " bx-chip-" + c[2] : "") + '">' + (c[0] ? icon(c[0]) : "") + '<span>' + esc(c[1]) + '</span></span>').join("") + '</div>';
  }
  function modeCard(m, opts){
    opts = opts || {};
    return '<div class="bx-mode" style="--mode-ink:var(--bx-' + m.ink + ')">'
      + '<div class="bx-mode-top">' + icon(m.icon) + '<b>' + esc(m.name) + '</b><span class="bx-mode-band">' + m.at + "\u2013" + m.to + '</span></div>'
      + '<div class="bx-mode-beh">BEHAVIOUR: ' + esc(m.behaviour) + '</div>'
      + '<ul>' + m.reads.map(r => '<li>' + esc(r) + '</li>').join("") + '</ul>'
      + '<div class="bx-mode-cost">' + esc(m.cost) + '</div></div>';
  }
  function matrix(rows, opts){
    opts = opts || {};
    return '<div class="bx-matrix">'
      + '<div class="bx-matrix-h"><span>' + esc(opts.left || "TRADITIONAL CENTRE TRAP") + '</span><i></i><span>' + esc(opts.right || "NET SOVEREIGN SYSTEM") + '</span></div>'
      + (Array.isArray(rows) ? rows : []).map(r => '<div class="bx-matrix-r"><span class="bx-matrix-v bx-matrix-l">' + esc(r[1])
        + '</span><span class="bx-matrix-k">' + esc(r[0]) + '</span><span class="bx-matrix-v bx-matrix-rv">' + esc(r[2]) + '</span></div>').join("")
      + '</div>';
  }
  function modes(){ return '<div class="bx-modes">' + MODES.map(m => modeCard(m)).join("") + '</div>'; }

  /* ==========================================================================
     CSS
     ========================================================================== */
  function css(){
    const P = PALETTE;
    return [
      ":root{--bx-system:" + P.system.hex + ";--bx-reward:" + P.reward.hex + ";--bx-ground:" + P.ground.hex + ";",
      "--bx-court:" + P.court.hex + ";--bx-court-deep:" + P.courtDeep.hex + ";--bx-court-line:" + P.courtLine.hex + ";",
      "--bx-ancient:" + P.ancient.hex + ";--bx-ancient-deep:" + P.ancientDeep.hex + ";--bx-crimson:" + P.crimson.hex + ";--bx-bone:" + P.bone.hex + ";",
      "--bx-signal:" + P.signal.hex + ";--bx-ember:" + P.ember.hex + ";--bx-ember-hot:" + P.emberHot.hex + ";--bx-terminal:" + P.terminal.hex + "}",
      /* icons */
      ".bx-ic{width:1em;height:1em;flex:0 0 auto;vertical-align:-0.12em;stroke-width:1.6}",
      ".bx-ic-lg{width:22px;height:22px}",
      /* marks */
      ".bx-mark{display:block;max-width:100%;height:auto}",
      ".bx-mark-wm{width:100%;height:auto;opacity:.22}",
      ".bx-area-mark .bx-mark{mix-blend-mode:screen}",
      /* lockup */
      ".bx-lockup{display:inline-flex;align-items:center;gap:9px;text-align:left}",
      ".bx-lockup .bx-sigil{display:inline-flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 6px rgba(232,197,101,.35))}",
      ".bx-lockup-t{display:inline-flex;flex-direction:column;line-height:1.05}",
      ".bx-lockup-t .bx-wm-1{font-family:var(--font-head,Orbitron,sans-serif);font-weight:900;font-size:15px;letter-spacing:.06em;background:linear-gradient(90deg,#c678ff,#e8c565);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#e8c565}",
      ".bx-lockup-t .bx-wm-s{font-family:var(--font-head,Orbitron,sans-serif);font-weight:700;font-size:13px;color:var(--bx-court-line);margin:0 3px}",
      ".bx-lockup-t .bx-wm-2{font-family:var(--font-head,Orbitron,sans-serif);font-weight:900;font-size:15px;letter-spacing:.14em;color:var(--bx-ancient)}",
      ".bx-lockup-t .bx-wm-sub{font-family:var(--font-mono,JetBrains Mono,monospace);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--bx-ancient-deep);opacity:.85}",
      /* the status bar */
      ".bx-bar{font-family:var(--font-mono,JetBrains Mono,monospace);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--bx-ancient-deep);opacity:.85;display:flex;gap:6px;flex-wrap:wrap;align-items:center;line-height:1.5}",
      ".bx-bar .bx-sep{color:var(--bx-system);opacity:.6}",
      /* framed panel with corner brackets */
      ".bx-frame{position:relative;border:1px solid var(--bx-court-line);border-radius:3px;background:linear-gradient(180deg,rgba(48,22,84,.5),rgba(15,15,26,.55))}",
      ".bx-frame:before,.bx-frame:after{content:'';position:absolute;width:13px;height:13px;border:2px solid var(--bx-ancient);pointer-events:none;opacity:.9}",
      ".bx-frame:before{top:-2px;left:-2px;border-right:0;border-bottom:0}",
      ".bx-frame:after{bottom:-2px;right:-2px;border-left:0;border-top:0}",
      ".bx-frame-head{display:flex;align-items:center;gap:7px;padding:7px 11px;border-bottom:1px solid var(--bx-court-line);font-family:var(--font-head,Orbitron,sans-serif);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--bx-ancient)}",
      ".bx-frame-head .bx-ic{width:15px;height:15px;color:var(--bx-ancient)}",
      ".bx-frame-head .bx-frame-meta{margin-left:auto;font-family:var(--font-mono,monospace);font-size:9px;color:var(--bx-ancient-deep);letter-spacing:.1em}",
      ".bx-frame-body{padding:11px}",
      /* plate */
      ".bx-plate{border:1px solid var(--bx-court-line);border-radius:3px;background:rgba(15,15,26,.5);padding:9px 10px}",
      ".bx-plate-top{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--bx-bone);font-family:var(--font-head,Orbitron,sans-serif);letter-spacing:.04em}",
      ".bx-plate-top .bx-ic{width:16px;height:16px;color:var(--bx-ancient)}",
      ".bx-plate-body{font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.55;margin-top:4px}",
      /* pill */
      ".bx-pill{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(232,197,101,.35);background:rgba(232,197,101,.08);border-radius:999px;padding:3px 9px;font-family:var(--font-mono,monospace);font-size:10px;letter-spacing:.06em;color:var(--bx-ancient);text-transform:uppercase}",
      ".bx-pill .bx-ic{width:13px;height:13px}",
      ".bx-pill-l{opacity:.7}",
      ".bx-pill b{color:var(--bx-bone)}",
      /* crest */
      ".bx-crest{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--crest-ink,rgba(168,85,247,.4));background:linear-gradient(180deg,rgba(168,85,247,.16),rgba(15,15,26,.4));border-radius:3px;padding:3px 8px;font-family:var(--font-head,Orbitron,sans-serif);font-size:9.5px;letter-spacing:.12em;color:var(--crest-ink,#e6c976)}",
      ".bx-crest .bx-ic{width:14px;height:14px;color:var(--crest-ink,var(--bx-ancient))}",
      ".bx-crest b{font-family:var(--font-mono,monospace);font-size:10px;color:var(--bx-bone);letter-spacing:0}",
      /* watermark band */
      ".bx-watermark{position:absolute;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;display:flex;justify-content:center;opacity:.5;z-index:0}",
      ".bx-watermark .bx-mark{width:min(760px,90%);margin-bottom:-6%}",
      /* grid + hero band */
      ".bx-hero{position:relative;overflow:hidden;border:1px solid var(--bx-court-line);border-radius:3px;background:#0b0714}",
      ".bx-hero .bx-mark{width:100%;height:250px;object-fit:cover;display:block;opacity:.95}",
      ".bx-hero-cap{position:absolute;left:0;right:0;bottom:0;padding:10px 12px;background:linear-gradient(180deg,transparent,rgba(8,5,15,.92));font-family:var(--font-mono,monospace);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--bx-ancient)}",
      ".bx-grid{display:grid;gap:9px;grid-template-columns:repeat(auto-fill,minmax(148px,1fr))}",
      ".bx-grid-wide{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}",
      ".bx-cell{border:1px solid var(--bx-court-line);border-radius:3px;background:rgba(15,15,26,.55);padding:9px;text-align:center}",
      ".bx-cell-name{font-family:var(--font-mono,monospace);font-size:9.5px;letter-spacing:.06em;color:var(--text-dim,#94a3b8);margin-top:6px;word-break:break-word}",
      ".bx-ico{width:100%;display:flex;align-items:center;justify-content:center;color:var(--bx-bone)}",
      ".bx-ico .bx-ic{width:26px;height:26px}",
      ".bx-swatch{border:1px solid var(--bx-court-line);border-radius:3px;overflow:hidden;background:rgba(15,15,26,.5);text-align:left}",
      ".bx-swatch-c{height:34px}",
      ".bx-swatch-b{padding:6px 8px;font-family:var(--font-mono,monospace);font-size:9.5px;color:var(--text-dim,#94a3b8);line-height:1.5}",
      ".bx-swatch-b b{display:block;color:var(--bx-bone);font-size:10.5px;letter-spacing:.06em}",
      ".bx-tag{display:inline-block;font-family:var(--font-mono,monospace);font-size:9px;letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--bx-court-line);border-radius:2px;padding:1px 5px;color:var(--bx-ancient-deep)}",
      ".bx-snip{font-family:var(--font-mono,monospace);font-size:11px;background:rgba(10,6,18,.8);border:1px solid var(--bx-court-line);border-radius:3px;padding:8px 9px;color:#d7c9ff;overflow-x:auto;white-space:pre;text-align:left}",
      /* scanlines + circuit bed */
      ".bx-scan:after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(255,255,255,.028) 0 1px,transparent 1px 3px);border-radius:3px}",
      ".bx-circuit{background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%238a2be2' stroke-width='.7' opacity='.16'%3E%3Cpath d='M0 14h20v14h16V0M56 42H36V28H20v28'/%3E%3Ccircle cx='20' cy='14' r='1.6'/%3E%3Ccircle cx='36' cy='28' r='1.6'/%3E%3C/g%3E%3C/svg%3E\")}",
      /* ---- the doctrine's chrome (GOSPEL 444) ---- */
      ".bx-term{border:1px solid var(--bx-court-line);border-radius:3px;background:#07040d;overflow:hidden;text-align:left}",
      ".bx-term-bar{display:flex;align-items:center;gap:5px;padding:5px 9px;background:linear-gradient(180deg,rgba(59,29,92,.7),rgba(10,6,18,.8));border-bottom:1px solid var(--bx-court-line)}",
      ".bx-term-bar i{width:8px;height:8px;border-radius:999px;background:rgba(232,197,101,.35);display:block}",
      ".bx-term-bar b{margin-left:6px;font-family:var(--font-mono,monospace);font-size:9.5px;letter-spacing:.12em;color:var(--bx-ancient);text-transform:uppercase;font-weight:600}",
      ".bx-term-body{padding:9px 11px;font-family:var(--font-mono,JetBrains Mono,monospace);font-size:12px;line-height:1.65;color:var(--bx-terminal);text-shadow:0 0 6px rgba(67,246,90,.35)}",
      ".bx-term-cur{color:var(--bx-terminal);animation:bx-blink 1.05s steps(1) infinite}",
      "@keyframes bx-blink{0%,49%{opacity:1}50%,100%{opacity:0}}",
      ".bx-dir{display:flex;gap:7px;align-items:baseline;font-family:var(--font-mono,JetBrains Mono,monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--bx-signal);border-left:2px solid var(--bx-signal);padding:3px 0 3px 8px;background:linear-gradient(90deg,rgba(94,213,235,.09),transparent);text-align:left;line-height:1.5}",
      ".bx-dir b{color:var(--bx-bone);font-weight:700}",
      ".bx-dir-c{color:var(--bx-signal);font-weight:700}",
      ".bx-flow{display:flex;flex-direction:column;align-items:center;gap:0;margin:9px 0}",
      ".bx-flow-n{border:1px solid rgba(220,148,56,.6);background:rgba(220,148,56,.07);color:var(--bx-bone);font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.06em;padding:5px 11px;border-radius:3px;white-space:nowrap}",
      ".bx-flow-a{color:var(--bx-crimson);font-size:13px;line-height:1.25}",
      ".bx-flow-dead{border-color:rgba(224,71,63,.75);background:rgba(224,71,63,.1);color:var(--bx-crimson);text-decoration:line-through}",
      ".bx-chips{display:flex;flex-wrap:wrap;gap:7px}",
      ".bx-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--bx-court-line);background:rgba(15,15,26,.55);border-radius:3px;padding:5px 9px;font-family:var(--font-mono,monospace);font-size:11px;color:var(--text-dim,#94a3b8)}",
      ".bx-chip .bx-ic{width:15px;height:15px;color:var(--bx-ancient)}",
      ".bx-chip-tiger{border-color:rgba(220,148,56,.55);color:var(--bx-bone)}",
      ".bx-chip-tiger .bx-ic{color:var(--bx-ember)}",
      ".bx-chip-mouse{border-color:rgba(94,213,235,.4)}",
      ".bx-chip-mouse .bx-ic{color:var(--bx-signal)}",
      ".bx-modes{display:grid;gap:9px;grid-template-columns:repeat(auto-fit,minmax(215px,1fr))}",
      ".bx-mode{border:1px solid var(--mode-ink,var(--bx-court-line));border-radius:3px;background:linear-gradient(180deg,rgba(15,15,26,.7),rgba(10,6,18,.8));padding:10px;text-align:left;box-shadow:inset 0 0 34px -18px var(--mode-ink)}",
      ".bx-mode-top{display:flex;align-items:center;gap:7px}",
      ".bx-mode-top .bx-ic{width:19px;height:19px;color:var(--mode-ink)}",
      ".bx-mode-top b{font-family:var(--font-head,Orbitron,sans-serif);font-size:12px;letter-spacing:.1em;color:var(--mode-ink)}",
      ".bx-mode-band{margin-left:auto;font-family:var(--font-mono,monospace);font-size:10px;color:var(--bx-bone);border:1px solid var(--mode-ink);border-radius:999px;padding:1px 7px;opacity:.9}",
      ".bx-mode-beh{font-family:var(--font-mono,monospace);font-size:10px;letter-spacing:.12em;color:var(--bx-bone);margin-top:7px;text-transform:uppercase}",
      ".bx-mode ul{margin:6px 0 0;padding-left:15px}",
      ".bx-mode li{font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-bottom:3px}",
      ".bx-mode-cost{margin-top:8px;padding-top:7px;border-top:1px solid var(--bx-court-line);font-size:12px;color:var(--bx-bone);line-height:1.5;font-style:italic}",
      ".bx-matrix{display:grid;gap:0;border:1px solid var(--bx-court-line);border-radius:3px;overflow:hidden}",
      ".bx-matrix-h,.bx-matrix-r{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;text-align:left}",
      ".bx-matrix-h{background:linear-gradient(90deg,rgba(224,71,63,.14),rgba(15,15,26,.4),rgba(168,85,247,.16));font-family:var(--font-head,Orbitron,sans-serif);font-size:10.5px;letter-spacing:.1em;padding:8px 10px}",
      ".bx-matrix-h span:first-child{color:var(--bx-crimson)}",
      ".bx-matrix-h span:last-child{color:var(--bx-ancient);text-align:right}",
      ".bx-matrix-r{border-top:1px solid var(--bx-court-line);padding:8px 10px;gap:10px}",
      ".bx-matrix-v{font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.45}",
      ".bx-matrix-rv{color:var(--bx-bone);text-align:right}",
      ".bx-matrix-k{font-family:var(--font-mono,monospace);font-size:9.5px;letter-spacing:.1em;color:var(--bx-ancient-deep);text-transform:uppercase;white-space:nowrap}",
      ".bx-card{border:1px solid var(--bx-court-line);border-radius:3px;background:linear-gradient(180deg,rgba(59,29,92,.45),rgba(15,15,26,.6));padding:11px;text-align:center}",
      ".bx-card-n{display:block;font-family:var(--font-head,Orbitron,sans-serif);font-size:30px;line-height:1;color:var(--bx-ancient);margin-bottom:5px}",
      ".bx-card b.bx-card-t{display:block;font-size:12.5px;color:var(--bx-bone);letter-spacing:.04em}",
      ".bx-card span{display:block;font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.45;margin-top:4px}",
      /* ---- emblems ---- */
      ".bx-emb{display:block;overflow:visible;flex:0 0 auto}",
      ".bx-emb-band{display:flex;align-items:center;gap:12px;text-align:left}",
      ".bx-emb-t{min-width:0}",
      ".bx-emb-t b{display:block;font-family:var(--font-head,Orbitron,sans-serif);font-size:12.5px;letter-spacing:.1em;color:var(--emb-ink,var(--bx-ancient))}",
      ".bx-emb-t span{display:block;font-family:var(--font-mono,monospace);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--bx-ancient-deep);margin-top:2px}",
      ".bx-emb-t i{display:block;font-size:11.5px;color:var(--text-dim,#94a3b8);font-style:normal;line-height:1.5;margin-top:4px}",
      /* ---- patterns: the beds ---- */
      ".bx-pat{position:absolute;inset:0;pointer-events:none}",
      ".bx-pat-lattice{" + patternCss("lattice", { ink:"#a855f7", opacity:.5 }) + "}",
      ".bx-pat-circuit{background-image:url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%238a2be2' stroke-width='.7' opacity='.16'%3E%3Cpath d='M0 14h20v14h16V0M56 42H36V28H20v28'/%3E%3Ccircle cx='20' cy='14' r='1.6'/%3E%3Ccircle cx='36' cy='28' r='1.6'/%3E%3C/g%3E%3C/svg%3E')}",
      ".bx-pat-ember{" + patternCss("ember", { ink:"#dc9438", opacity:.6 }) + "}",
      ".bx-pat-hazard{" + patternCss("hazard", { ink:"#e0473f", opacity:.5 }) + "}",
      /* ---- the deck (the doctrine as slides) ---- */
      ".bx-deck{display:flex;flex-direction:column;gap:11px}",
      ".bx-slide{position:relative;border:1px solid var(--bx-court-line);border-radius:3px;background:linear-gradient(160deg,#0b0714,#160a26 55%,#0b0714);padding:14px 15px 11px;text-align:left;overflow:hidden}",
      ".bx-slide:before,.bx-slide:after{content:'';position:absolute;width:15px;height:15px;border:2px solid var(--bx-ancient);opacity:.85}",
      ".bx-slide:before{top:-2px;left:-2px;border-right:0;border-bottom:0}",
      ".bx-slide:after{bottom:-2px;right:-2px;border-left:0;border-top:0}",
      ".bx-slide-k{display:flex;align-items:center;gap:8px;font-family:var(--font-mono,monospace);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--bx-signal)}",
      ".bx-slide-n{margin-left:auto;color:var(--bx-ancient-deep)}",
      ".bx-slide-t{font-family:var(--font-head,Orbitron,sans-serif);font-size:clamp(17px,3.4vw,25px);font-weight:900;letter-spacing:.02em;margin:5px 0 7px;background:linear-gradient(90deg,#f2e6c8,#e8c565 45%,#c678ff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#e8c565}",
      ".bx-slide-main{display:flex;gap:14px;align-items:flex-start;min-width:0}",
      ".bx-slide-body{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:9px}",
      ".bx-slide-body>p{font-size:13px;color:var(--bx-bone);line-height:1.6;margin:0;opacity:.92}",
      ".bx-slide-body>.bx-modes{width:100%}",
      ".bx-slide-body .bx-grid{min-width:0}",
      ".bx-slide-marks{flex:0 0 auto;width:min(42%,400px);min-width:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:9px;align-items:end;justify-items:center}",
      ".bx-slide-marks .bx-mark{max-width:100%;max-height:168px;width:auto;height:auto;min-width:0;filter:drop-shadow(0 0 22px rgba(168,85,247,.28))}",
      ".bx-slide-close{margin-top:10px;padding:11px 12px;border:1px solid rgba(232,197,101,.5);border-radius:3px;background:linear-gradient(90deg,rgba(232,197,101,.1),transparent);text-align:center}",
      ".bx-slide-close b{display:block;font-family:var(--font-head,Orbitron,sans-serif);font-size:16px;letter-spacing:.04em;color:var(--bx-ancient)}",
      ".bx-slide-close span{display:block;margin-top:4px;font-size:12.5px;color:var(--bx-bone);opacity:.85}",
      ".bx-slide-foot{margin-top:9px;padding-top:8px;border-top:1px solid var(--bx-court-line)}",
      "@media(max-width:640px){.bx-slide-main{flex-direction:column}.bx-slide-marks{width:100%}.bx-slide-marks .bx-mark{max-height:124px}.bx-matrix-h,.bx-matrix-r{grid-template-columns:1fr auto 1fr;gap:6px}.bx-flow{max-width:100%}.bx-flow-n{white-space:normal;max-width:100%;text-align:center;overflow-wrap:anywhere}.mk-pillars.mk-pillars,.mk-shots.mk-shots,.mk-steps.mk-steps,.mk-claim.mk-claim{grid-template-columns:1fr}.mk-days{grid-template-columns:repeat(5,1fr)}.po .mk-pillars,.po .mk-steps,.po .mk-claim{grid-template-columns:repeat(3,1fr)}.po .mk-shots{grid-template-columns:1fr 1fr}}",
      "@media(max-width:560px){.bx-grid:not(.bx-grid-wide){grid-template-columns:repeat(auto-fill,minmax(112px,1fr))}.bx-ico .bx-ic{width:22px;height:22px}}"
    ].join("\n");
  }
  function ensure(){
    if(document.getElementById("obi-brand-css")) return;
    const s = document.createElement("style");
    s.id = "obi-brand-css";
    s.textContent = css();
    document.head.appendChild(s);
  }

  /* ==========================================================================
     UPGRADE — turn declared hooks in the DOM into brand chrome.
     Any element may say data-icon="vault" (gets the SVG), data-mark="tiger"
     (gets the shipped mark), data-bar="a // b" (gets the status bar).
     ========================================================================== */
  function upgrade(root){
    root = root || document;
    let n = 0;
    root.querySelectorAll("[data-icon]:not([data-icon-done])").forEach(el => {
      const name = el.getAttribute("data-icon");
      const size = el.getAttribute("data-icon-size");
      const before = el.getAttribute("data-icon-pos") === "before";
      el.insertAdjacentHTML(before ? "afterbegin" : "beforeend", icon(name, { size: size || undefined }));
      el.setAttribute("data-icon-done", "1");
      n++;
    });
    root.querySelectorAll("[data-mark]:not([data-mark-done])").forEach(el => {
      const id = el.getAttribute("data-mark");
      const style = el.getAttribute("data-mark-style") || "";
      el.insertAdjacentHTML("afterbegin", asset(id, { style: style }));
      el.setAttribute("data-mark-done", "1");
      n++;
    });
    root.querySelectorAll("[data-bar]:not([data-bar-done])").forEach(el => {
      el.innerHTML = bar(el.getAttribute("data-bar"));
      el.setAttribute("data-bar-done", "1");
      n++;
    });
    return n;
  }

  /* ==========================================================================
     THE IDENTITY SYSTEM — the panel (the desk room and /brand both render this)
     ========================================================================== */
  function esc(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

  function paletteSection(){
    return '<div class="bx-grid bx-grid-wide">' + Object.keys(PALETTE).map(k => {
      const p = PALETTE[k];
      return '<div class="bx-swatch"><div class="bx-swatch-c" style="background:' + p.hex + '"></div><div class="bx-swatch-b">'
        + '<b>' + esc(k) + '</b>' + esc(p.hex) + '<br><span class="bx-tag">' + esc(p.role) + '</span> ' + esc(p.note) + '</div></div>';
    }).join("") + '</div>';
  }

  function iconSection(){
    const names = iconNames();
    return '<div class="bx-bar" style="margin-bottom:8px">' + names.length + ' icons <span class="bx-sep">//</span> 24 grid <span class="bx-sep">//</span> 1.6 stroke <span class="bx-sep">//</span> currentColor <span class="bx-sep">//</span> no icon font, no emoji-as-concept</div>'
      + '<div class="bx-grid">' + names.map(n => '<div class="bx-cell" data-icon-name="' + n + '"><div class="bx-ico">' + icon(n) + '</div><div class="bx-cell-name">' + esc(n) + '</div></div>').join("") + '</div>';
  }

  function assetSection(){
    const srcOf = (a) => srcLabel(a);
    return '<div class="bx-grid bx-grid-wide">' + ASSETS.filter(a => !a.variant && !a.shot).map(a =>
      '<div class="bx-cell" style="text-align:left">'
      + '<div class="bx-area-mark" style="display:flex;align-items:center;justify-content:center;background:#0b0714;border:1px solid var(--bx-court-line);border-radius:3px;min-height:120px;padding:6px">'
      + asset(a.id, { style:"max-height:150px;width:auto" }) + '</div>'
      + '<div class="bx-cell-name" style="color:var(--bx-ancient);font-size:11px;margin-top:8px">' + esc(a.name) + '</div>'
      + '<div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px">' + esc(a.note) + '</div>'
      + '<div style="font-size:11px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px"><b style="color:var(--bx-bone)">use:</b> ' + esc(a.use) + '</div>'
      + '<div class="bx-bar" style="margin-top:6px">' + esc(a.id) + ' <span class="bx-sep">//</span> ' + a.w + 'x' + a.h + ' <span class="bx-sep">//</span> ' + srcOf(a) + (a.page == null ? "" : ' p.' + a.page) + ' <span class="bx-sep">//</span> box ' + a.box.join(",") + (a.from ? ' <span class="bx-sep">//</span> ' + esc(a.from) : '') + '</div>'
      + '<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">'
      + '<a class="ci-act" href="' + assetPath(a.id) + '" download="prais-brand-' + a.id + '.webp" style="text-decoration:none">Download \u25b8</a>'
      + '<button class="ci-act bx-copy" data-copy="' + assetPath(a.id) + '">Copy URL</button>'
      + '</div></div>').join("") + '</div>';
  }

  /* the MARKETING register's room: the offer, the pillars, and the seven slides
     the sovereign hand-picked, each named with what it says and where it goes. */
  function marketSection(){
    return '<div class="bx-bar" style="margin-bottom:9px">THE MARKETING REGISTER <span class="bx-sep">//</span> ' + MARKET.shots.length + ' HAND-PICKED SLIDES <span class="bx-sep">//</span> TRANSCRIBED, NOT INVENTED <span class="bx-sep">//</span> SOURCE: ' + esc(MARKET.source.toUpperCase()) + '</div>'
      + frame('<div style="font-family:var(--font-head,Orbitron,sans-serif);font-size:17px;line-height:1.25;color:var(--bx-ancient)">' + esc(MARKET.headline) + '</div>'
        + '<div style="font-size:12px;color:var(--text-dim,#94a3b8);line-height:1.6;margin-top:6px">' + esc(MARKET.headlineVn) + '</div>'
        + '<div style="margin-top:9px">' + bar([MARKET.kicker, MARKET.sub, "V" + MARKET.version]) + '</div>'
        + '<div class="mk-offer" style="margin-top:9px">' + esc(MARKET.offer) + '</div>',
        { title:"THE CLAIM", icon:"target", meta:"THE OTHER REGISTER" })
      + '<div style="height:12px"></div>'
      + frame(pillarRow(), { title:"THE THREE PILLARS", icon:"grid", meta:"FROM THE HAND-PICKED SET" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-shots">' + MARKET.shots.map(s => {
          const a = ASSET_BY[s.id];
          return '<div class="bx-cell" style="text-align:left;background:#0b0714">'
            + '<div style="display:flex;align-items:center;justify-content:center">' + asset(s.id) + '</div>'
            + '<div class="bx-cell-name" style="color:var(--bx-ancient);font-size:11px;margin-top:8px">' + esc(a ? a.name : s.id) + ' <span style="color:var(--text-dim,#94a3b8)">// ' + esc(s.tag) + '</span></div>'
            + '<div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px">' + esc(s.what) + '</div>'
            + '<div style="font-size:11px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px"><b style="color:var(--bx-bone)">where:</b> ' + esc(s.where) + '</div>'
            + '<div class="bx-bar" style="margin-top:6px">' + esc(s.id) + ' <span class="bx-sep">//</span> ' + (a ? a.w + "x" + a.h : "") + ' <span class="bx-sep">//</span> in the marketing set</div>'
            + '<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">'
            + '<a class="ci-act" href="' + assetPath(s.id) + '" download="prais-' + s.id + '.webp" style="text-decoration:none">Download \u25b8</a>'
            + '<button class="ci-act bx-copy" data-copy="' + assetPath(s.id) + '">Copy URL</button></div></div>';
        }).join("") + '</div>', { title:"THE HAND-PICKED SET \u2014 SEVEN SLIDES", icon:"scanline", meta:MARKET.shots.length + " SLIDES" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-compare-wrap" style="text-align:left">' + matrix(MARKET.compare, { left:"TRADITIONAL CENTRE", right:"NET (TIGER PROTOCOL)" }) + '</div>'
        + '<div class="bx-bar" style="margin-top:8px">THE MARKETING SET AND THE METHOD CARD ARE IN THE PRINT ROOM \u2014 /brand print</div>',
        { title:"TRADITIONAL vs SOVEREIGN", icon:"scale", meta:"THE COMPARISON" });
  }

  /* a still, framed with its own provenance and its three buttons. The stills
     are the sovereign's own slides; they are shipped, never hotlinked, and the
     desk lets you take one away. */
  function shotCell(id, tag, what, where){
    const a = ASSET_BY[id];
    return '<div class="bx-cell" style="text-align:left;background:#0b0714">'
      + '<div style="display:flex;align-items:center;justify-content:center;background:#08050f;border:1px solid var(--bx-court-line);border-radius:3px;padding:5px">' + asset(id, { style:"max-height:210px;width:auto" }) + '</div>'
      + '<div class="bx-cell-name" style="color:var(--bx-ancient);font-size:11px;margin-top:8px">' + esc(a ? a.name : id) + (tag ? ' <span style="color:var(--text-dim,#94a3b8)">// ' + esc(tag) + '</span>' : "") + '</div>'
      + (what ? '<div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px">' + esc(what) + '</div>' : "")
      + (where ? '<div style="font-size:11px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px"><b style="color:var(--bx-bone)">where:</b> ' + esc(where) + '</div>' : "")
      + '<div class="bx-bar" style="margin-top:6px">' + esc(id) + ' <span class="bx-sep">//</span> ' + (a ? a.w + "x" + a.h : "") + ' <span class="bx-sep">//</span> ' + (a && a.src ? esc(a.src) : "still") + '</div>'
      + '<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">'
      + '<a class="ci-act" href="' + assetPath(id) + '" download="prais-' + id + '.webp" style="text-decoration:none">Download \u25b8</a>'
      + '<button class="ci-act bx-copy" data-copy="' + assetPath(id) + '">Copy URL</button></div></div>';
  }
  function shotGrid(ids){
    return '<div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">'
      + ids.map(id => shotCell(id, null, (ASSET_BY[id] || {}).use, (ASSET_BY[id] || {}).note)).join("") + '</div>';
  }

  /* THE MARKETING REGISTER, SECOND BATCH \u2014 the diagnosis, the method slide,
     the memory case, and the ad pipeline with its law printed on its face. */
  function marketSection2(){
    const A = MARKET.architecture, D = MARKET.diagnose, L = MARKET.biology, ADS = MARKET.ads;
    return '<div class="bx-bar" style="margin-bottom:9px">THE MARKETING REGISTER, SECOND BATCH <span class="bx-sep">//</span> ' + MARKET.shots2.length + ' SLIDES <span class="bx-sep">//</span> SOURCE: ' + esc(MARKET.source2.toUpperCase()) + '</div>'
      + frame('<div style="font-family:var(--font-head,Orbitron,sans-serif);font-size:15px;line-height:1.3;color:var(--bx-ancient)">' + esc(D.title) + '</div>'
          + '<div style="font-size:12.5px;color:var(--bx-bone);margin-top:4px">' + esc(D.titleVn) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr));margin-top:10px">'
          + D.items.map(it => '<div class="bx-card"><b class="bx-card-t">' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></div>').join("") + '</div>'
          + '<div style="margin-top:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px" class="mk-sub">' + esc(D.lensNote) + '</div>'
          + '<div class="bx-plate" style="flex:0 0 auto;padding:7px 10px"><span class="bx-tag">' + esc(D.lens[0]) + '</span> <b style="color:var(--bx-signal)">\u2192</b> <span class="bx-tag">' + esc(D.lens[1]) + '</span></div></div>'
          + '<div class="bx-bar" style="margin-top:8px">' + esc(D.read) + '</div>',
          { title:"THE CORE MECHANICAL FAILURE", icon:"chain", meta:"mkt2-failure \u00b7 bilingual" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:9px">' + esc(A.title) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">'
          + A.transform.map(t => '<div class="bx-card"><b class="bx-card-t">' + esc(t[0]) + '</b><span>' + esc(t[1]) + '</span></div>').join("") + '</div>'
          + '<div style="margin-top:11px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'
          + '<div style="flex:0 0 300px;max-width:100%">' + asset("wave-loud", { style:"width:100%;height:auto" }) + '</div>'
          + '<div style="flex:1;min-width:200px"><div class="bx-dir">' + esc(A.wave.loud) + '</div><div class="mk-sub" style="margin-top:6px">' + esc(A.wave.body) + '</div>'
          + '<div class="bx-bar" style="margin-top:7px">' + esc(A.wave.quiet) + '</div></div></div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr));margin-top:11px">'
          + A.method.map(m => '<div class="bx-card"><b class="bx-card-t">' + esc(m[0]) + '</b><span>' + esc(m[1]) + '</span></div>').join("") + '</div>',
          { title:"THE IDENTITY TRANSFORMATION", icon:"gauge", meta:"mkt2-architecture" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-compare-wrap" style="text-align:left">' + matrix(A.compare, { left:"TRADITIONAL CENTRES", right:"NET (TIGER PROTOCOL)" }) + '</div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-top">' + icon("scanline") + '<b>THE SECOND SLIDE, IN FULL</b></div><div class="bx-plate-body" style="text-align:center">'
          + asset("mkt2-architecture", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>',
          { title:"THE SECOND COMPARISON", icon:"scale", meta:"focus \u00b7 rate \u00b7 habit" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:4px">' + esc(L.title) + '</div>'
          + '<div class="bx-dir">' + esc(L.toughLove) + '</div>'
          + '<div class="mk-days" style="margin-top:10px">' + L.days.map(d => '<div class="mk-day"><b>' + esc(d.replace("Day ", "")) + '</b><span>DAY</span></div>').join("") + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:11px">'
          + L.points.map(p => '<div class="bx-card"><b class="bx-card-t">' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("") + '</div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body" style="text-align:center;font-family:var(--font-mono,JetBrains Mono,monospace);font-size:10.5px;color:var(--bx-bone)">' + esc(L.status) + '</div></div>',
          { title:"THE BIOLOGICAL INTERVENTION", icon:"repeat", meta:"mkt2-biology" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:9px">' + esc(ADS.title) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">'
          + ADS.cards.map(c => '<div class="bx-card"><b class="bx-card-n">' + c[0] + '</b><b class="bx-card-t">' + esc(c[1]) + '</b><span>' + esc(c[2]) + '</span></div>').join("") + '</div>'
          + '<div class="bx-plate" style="margin-top:11px"><div class="bx-plate-top">' + icon("scale") + '<b>' + esc(ADS.lawShort) + '</b></div><div class="bx-plate-body">'
          + '<div style="display:flex;gap:10px;flex-wrap:wrap">' + ADS.lawParts.map(p => '<div class="bx-card" style="flex:1;min-width:150px"><b class="bx-card-t">' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("") + '</div>'
          + '<div class="bx-dir" style="margin-top:9px">' + esc(ADS.lawBan) + '</div>'
          + '<div class="mk-sub" style="margin-top:7px">' + esc(ADS.why) + '</div></div></div>'
          + '<div class="bx-bar" style="margin-top:9px">THE LAW IS BRAND.021 \u00b7 THE SHEET IS IN THE PRINT ROOM \u2014 /brand ad-sheet</div>',
          { title:"THE PHASE 0 AD PIPELINE", icon:"target", meta:"mkt2-adpipeline" })
      + '<div style="height:12px"></div>'
      + frame('<div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">'
          + MARKET.shots2.map(s => shotCell(s.id, s.tag, s.what, s.where)).join("") + '</div>',
          { title:"THE SECOND HAND-PICKED SET \u2014 FOUR SLIDES", icon:"scanline", meta:MARKET.shots2.length + " SLIDES" });
  }

  /* ==========================================================================
     THE CODEX ROOM \u2014 the strategy, on screen.
     ========================================================================== */
  function codexSection(){
    const C = CODEX, A = C.advantage, Z = C.lakeview, P = C.pipeline, S = C.stack, R = C.retention, W = C.laziness, PR = C.proof, AU = C.audit, RO = C.readout;
    const layerCell = (l, i, n) => '<div class="bx-card" style="border-left:3px solid ' + (i === n - 1 ? "var(--bx-ember)" : "var(--bx-system)") + '">'
      + '<b class="bx-card-n">' + String(i + 1).padStart(2, "0") + '</b><b class="bx-card-t">' + esc(l[0]) + '</b><span>' + esc(l[1]) + '</span></div>';
    return '<div class="bx-bar" style="margin-bottom:9px">THE PHOENIX RISING CODEX <span class="bx-sep">//</span> ' + C.pages + ' PAGES ACROSS ' + C.sources.length + ' DECKS <span class="bx-sep">//</span> THE THIRD REGISTER: WHAT THE SOVEREIGN HOLDS</div>'
      + frame('<div class="bx-plate" style="margin-bottom:10px"><div class="bx-plate-body" style="text-align:center">' + asset("phx-cover", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>'
          + '<div style="font-family:var(--font-head,Orbitron,sans-serif);font-size:17px;color:var(--bx-ancient)">' + esc(C.deck) + '</div>'
          + '<div style="font-size:12.5px;color:var(--bx-bone);margin-top:4px">' + esc(C.sub) + '</div>'
          + '<div class="bx-bar" style="margin-top:8px">' + esc(C.clearance) + '</div>'
          + '<div style="margin-top:9px">' + C.sources.map(s => '<span class="bx-tag" style="margin:2px 4px 2px 0;display:inline-block">' + esc(s) + '</span>').join("") + '</div>',
          { title:"THE CODEX", icon:"seal", meta:"CODEX V" + C.version })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:9px">' + esc(A.title) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">'
          + A.halves.map(h => '<div class="bx-card"><b class="bx-card-t">' + esc(h[0]) + '</b>' + h[1].map(x => '<span>' + esc(x) + '</span>').join("") + '</div>').join("") + '</div>'
          + '<div style="margin-top:11px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'
          + '<div class="bx-plate" style="flex:0 0 auto;padding:8px 12px"><div class="bx-dir">' + esc(A.centre) + '</div><div class="bx-bar" style="margin-top:4px">' + esc(A.viet) + '</div></div>'
          + '<div style="flex:1;min-width:220px"><div class="mk-sub">' + esc(A.flip) + '</div><div class="mk-sub" style="margin-top:6px">' + esc(A.sell) + '</div></div></div>'
          + '<div class="bx-bar" style="margin-top:9px">' + esc(A.law) + '</div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body" style="text-align:center">' + asset("phx-stack", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>',
          { title:"THE UNFAIR ADVANTAGE — DUAL MASTERY", icon:"venn", meta:"codex p02" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:9px">' + esc(Z.title) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">'
          + Z.facts.map(f => '<div class="bx-card"><b class="bx-card-t">' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>').join("") + '</div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body"><div class="bx-dir">' + esc(Z.avatar) + '</div><div class="bx-bar" style="margin-top:5px">' + esc(Z.avatarWhy) + '</div>'
          + '<div class="mk-sub" style="margin-top:7px">' + esc(Z.law) + '</div></div></div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body" style="text-align:center">' + asset("phx-lakeview", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>',
          { title:"THE ZONE", icon:"globe", meta:"codex p03" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:3px">' + esc(P.title) + '</div><div class="bx-bar" style="margin-bottom:9px">' + esc(P.sub) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">'
          + P.stages.map((s, i) => '<div class="bx-card"><b class="bx-card-n">' + (i + 1) + '</b><b class="bx-card-t">' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>').join("") + '</div>'
          + '<div class="bx-bar" style="margin-top:9px">' + esc(P.law) + '</div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body" style="text-align:center">' + asset("phx-pipeline", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>',
          { title:"THE M2 AUTOMATION PIPELINE", icon:"route", meta:"codex p10" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:9px">' + esc(S.title) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">' + S.layers.map((l, i) => layerCell(l, i, S.layers.length)).join("") + '</div>'
          + '<div class="bx-bar" style="margin-top:9px">' + esc(S.read) + '</div>'
          + '<div class="bx-dir" style="margin-top:8px">' + esc(S.line) + '</div>',
          { title:"THE NET SOVEREIGN ARCHITECTURE", icon:"pyramid", meta:"codex p12" })
      + '<div style="height:12px"></div>'
      + frame('<div class="bx-dir">' + esc(R.bucket) + '</div>'
          + '<div class="mk-sub" style="margin-top:6px">' + esc(R.goldfish) + '</div>'
          + '<div class="bx-bar" style="margin-top:7px">' + esc(R.statusQuo) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:11px">'
          + R.facts.map(f => '<div class="bx-card"><b class="bx-card-t">' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>').join("")
          + '<div class="bx-card"><b class="bx-card-t">' + esc(R.clause[0]) + '</b><span>' + esc(R.clause[1]) + '</span></div></div>'
          + '<div class="bx-plate" style="margin-top:11px"><div class="bx-plate-body"><div class="mk-sub">' + esc(R.hud) + '</div><div class="bx-bar" style="margin-top:6px">' + esc(R.harvest) + '</div></div></div>'
          + '<div style="margin-top:10px">' + shotGrid(["tge-bucket", "tge-rule8", "tge-hud"]) + '</div>',
          { title:"RETENTION, AS ARCHITECTURE", icon:"repeat", meta:"the engine" })
      + '<div style="height:12px"></div>'
      + frame('<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">'
          + [W.dumb, W.smart].map((b, i) => '<div class="bx-card" style="border-left:3px solid ' + (i ? "var(--bx-ember)" : "var(--bx-dim)") + '"><b class="bx-card-t">' + esc(b[0]) + '</b>' + b[1].map(x => '<span>' + esc(x) + '</span>').join("") + '</div>').join("") + '</div>'
          + '<div class="bx-dir" style="margin-top:10px">' + esc(W.maths) + ' \u00b7 ' + esc(W.report) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:11px">'
          + [W.worker, W.architect].map((b, i) => '<div class="bx-card"><b class="bx-card-t">' + esc(b[0]) + '</b>' + b[1].map(x => '<span>' + esc(x) + '</span>').join("") + '</div>').join("") + '</div>'
          + '<div class="bx-bar" style="margin-top:9px">' + esc(W.ship) + '</div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body" style="text-align:center">' + asset("tep-lazy", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>',
          { title:"WEAPONIZING THE MACHINE \u2014 STRATEGIC LAZINESS", icon:"hammer", meta:"the mandate" })
      + '<div style="height:12px"></div>'
      + frame('<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">'
          + PR.numbers.map(n => '<div class="bx-card" style="text-align:center"><b class="bx-card-n" style="font-size:34px">' + esc(n[0]) + '</b><span>' + esc(n[1]) + '</span></div>').join("") + '</div>'
          + '<div class="bx-bar" style="margin-top:9px">' + esc(PR.baseline) + ' \u00b7 ' + esc(PR.line) + '</div>'
          + '<div class="bx-plate" style="margin-top:11px;border-color:var(--bx-hazard,#e0473f)"><div class="bx-plate-top">' + icon("alert") + '<b>THE DELTA \u2014 TWO MULTIPLES, ONE SOURCE</b></div><div class="bx-plate-body">' + esc(PR.delta) + '</div></div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body" style="text-align:center">' + asset("tep-math", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>',
          { title:"THE MATH OF THE TIGER", icon:"chart", meta:"95 \u00b7 80 \u00b7 40" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:3px">' + esc(AU.title) + ' ' + esc(AU.q) + '</div><div class="bx-bar" style="margin-bottom:9px">' + esc(AU.minutes) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">'
          + AU.steps.map((s, i) => '<div class="bx-card"><b class="bx-card-n">' + (i + 1) + '</b><b class="bx-card-t">' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>').join("") + '</div>'
          + '<div class="mk-sub" style="margin-top:10px">' + esc(AU.truth) + '</div>'
          + '<div class="bx-dir" style="margin-top:8px">' + esc(AU.close) + '</div>'
          + '<div class="mk-offer" style="margin-top:10px">' + esc(AU.cta) + '</div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body" style="text-align:center">' + asset("tep-audit", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>',
          { title:"THE OFFER \u2014 THE 30-MINUTE CLINICAL DIAGNOSTIC", icon:"gauge", meta:"message AUDIT" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub" style="margin-bottom:3px">' + esc(RO.title) + '</div>'
          + '<div class="bx-bar" style="margin-bottom:9px">' + esc(RO.source) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">'
          + RO.bands.map((b, i) => '<div class="bx-card"><b class="bx-card-n">' + String(i + 1).padStart(2, "0") + '</b><b class="bx-card-t">' + esc(b) + '</b></div>').join("") + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:11px">'
          + RO.protocols.map(p => '<div class="bx-card"><b class="bx-card-t">' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("") + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:11px">'
          + RO.laws.map(p => '<div class="bx-card" style="border-left:3px solid var(--bx-ancient)"><b class="bx-card-t">' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("") + '</div>'
          + '<div class="mk-sub" style="margin-top:10px">' + esc(RO.thesis) + '</div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-top">' + icon("lock") + '<b>WHY THE LEDGER IS EMPTY</b></div><div class="bx-plate-body">' + esc(RO.note) + ' <b>BRAND.028</b>: no student name, score or vault username goes into source a browser can read.</div></div>'
          + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-body" style="text-align:center">' + asset("run305", { style:"width:100%;height:auto;max-width:none" }) + '</div></div>',
          { title:"THE CLASSIFIED READOUT \u2014 THE RUN LOG, AS A FORMAT", icon:"terminal", meta:"run 305" })
      + '<div style="height:12px"></div>'
      + frame('<div class="mk-sub">' + esc(MARKET.protocol.note) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-top:10px">'
          + MARKET.protocol.deckVersions.map(v => '<div class="bx-card" style="text-align:center"><b class="bx-card-n" style="font-size:24px' + (v === "V" + GOSPEL444.version ? ";color:var(--bx-jade)" : "") + '">' + esc(v) + '</b><span>' + (v === "V" + GOSPEL444.version ? "what this system holds" : "printed in the corpus") + '</span></div>').join("") + '</div>',
          { title:"THE VERSION LADDER", icon:"ladder", meta:"four strings, one held" })
      + '<div style="height:12px"></div>'
      + frame('<div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">'
          + C.laws.map(l => '<div class="bx-cell" style="text-align:left;background:#0b0714"><div class="bx-bar">' + esc(l[0]) + '</div>'
            + '<div class="bx-cell-name" style="color:var(--bx-ancient);font-size:11.5px;margin-top:6px">' + esc(l[1]) + '</div>'
            + '<div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:4px">' + esc(l[2]) + '</div></div>').join("") + '</div>',
          { title:"THE LAWS THIS BATCH PRODUCED", icon:"scale", meta:"BRAND.021\u2013BRAND.028 \u00b7 PROPOSED" })
      + '<div style="height:12px"></div>'
      + frame(deck2Section(), { title:"THE CODEX AS SLIDES", icon:"scanline", meta:C.slides.length + " SLIDES \u00b7 EXPORTABLE" })
      + '<div style="height:12px"></div>'
      + frame(shotGrid(ASSETS.filter(a => a.shot && ["codex", "tiger-protocol", "tiger-engine", "run-log"].indexOf(a.src) >= 0).map(a => a.id)),
          { title:"THE DECK PAGES, AS STILLS", icon:"image", meta:"EIGHTEEN PAGES \u00b7 SHIPPED, NOT HOTLINKED" });
  }

  /* PHASE 0 \u2014 the creative, as a room. Six ads and the law on their face. */
  /* ==========================================================================
     THE LOGOTYPE, THE VAULT — the two rooms the archive asked for.

     `logoSection` is the mark itself: three grounds, the specification, the
     size ladder, the files. `vaultSection` is EVERY picture this system ships
     in one place — the logotype, the twelve codex slides, the social set, the
     art set and the cut marks — with a download and a copy-URL on each, so a
     post, a page or a deck can be assembled without opening a file manager.
     ========================================================================== */
  function logoSection(){
    const markImg = (id, px) => '<img src="' + assetPath(id) + '" alt="' + esc((ASSET_BY[id] || {}).name || id) + '" loading="lazy" decoding="async" style="max-width:' + px + 'px;width:100%;height:auto;display:block">';
    const ground = (id, bg, cap) => '<div style="flex:1;min-width:190px">'
      + '<div style="background:' + bg + ';border:1px solid var(--bx-court-line);border-radius:4px;padding:16px;display:flex;align-items:center;justify-content:center;min-height:210px">' + markImg(id, 250) + '</div>'
      + '<div class="bx-bar" style="margin-top:6px">' + esc(cap) + '</div></div>';
    const glyphStep = (px) => '<div style="text-align:center">'
      + '<div style="height:40px;display:flex;align-items:center;justify-content:center">' + icon("apex", { size:px + "px", style:"color:" + PALETTE.ancient.hex }) + '</div>'
      + '<div class="bx-bar" style="margin-top:5px">' + px + 'px</div></div>';
    return '<div class="bx-bar" style="margin-bottom:9px">THE PRAIS APEX <span class="bx-sep">//</span> THE STATION\u2019S LOGOTYPE <span class="bx-sep">//</span> KEYED OUT OF THE SOVEREIGN\u2019S PLATE, NOT REDRAWN <span class="bx-sep">//</span> WORN FROM 64 PX UP</div>'
      + frame('<div style="display:flex;gap:12px;flex-wrap:wrap">'
          + ground("apex", "#0f0f1a", "on the ground \u2014 Imperial Gold")
          + ground("apex-ink", "#f4efe4", "on paper \u2014 one ink")
          + '<div style="flex:1;min-width:190px">'
          + '<div style="background:linear-gradient(135deg,#a855f7,#f59e0b);border-radius:4px;padding:16px;display:flex;align-items:center;justify-content:center;min-height:210px"><div style="background:#0f0f1a;border-radius:3px;padding:12px;display:flex;align-items:center;justify-content:center;width:100%">' + markImg("apex", 210) + '</div></div>'
          + '<div class="bx-bar" style="margin-top:6px">the dual tone \u2014 Soul Purple to Imperial Gold</div></div>'
          + '</div>'
          + '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;align-items:center">'
          + '<div style="display:flex;gap:18px;align-items:flex-end">' + [16,24,40].map(glyphStep).join("") + '<div style="text-align:center"><div style="height:40px;display:flex;align-items:flex-end;justify-content:center">' + markImg("apex", 40) + '</div><div class="bx-bar" style="margin-top:5px">40px \u2014 the mark, at the floor of legibility</div></div></div>'
          + '<div style="flex:1;min-width:220px"><div class="bx-dir">' + esc(APEX.rule) + '</div></div>'
          + '</div>', { title:"THE MARK ON THREE GROUNDS, AND THE SIZE LAW", icon:"seal", meta:"BRAND.029" })
      + '<div style="height:12px"></div>'
      + frame('<div class="bx-bar" style="margin-bottom:8px">' + esc(APEX.page) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">'
          + APEX.parts.map(p => '<div class="bx-card"><b class="bx-card-t">' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("")
          + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:9px">'
          + APEX.tech.map(p => '<div class="bx-card"><b class="bx-card-t">' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("")
          + '</div>'
          + '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:10px">'
          + APEX.tokens.map(t => '<span class="bx-tag" style="background:' + t[1] + ';color:#0b0714;padding:3px 9px;border-radius:3px;font-family:var(--font-mono,monospace);font-size:11.5px">' + esc(t[0]) + ' \u00b7 ' + esc(t[1]) + ' \u00b7 ' + esc(t[2]) + '</span>').join("")
          + '</div>'
          + '<div class="bx-bar" style="margin-top:9px">TRANSCRIBED VERBATIM FROM THE SOVEREIGN\u2019S OWN PAGE \u2014 NOTHING INVENTED HERE. THE TWO NAMED COLOURS ARE THE TWO FROZEN TOKENS, SPELLED AS THE FREEZE SPELLS THEM</div>',
          { title:"THE ANATOMY \u2014 THE SPECIFICATION, AS IT WAS SENT", icon:"compass", meta:"apex v" + APEX.version })
      + '<div style="height:12px"></div>'
      + frame('<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">'
          + APEX.files.map(f => '<div class="bx-card"><b class="bx-card-t">' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>').join("")
          + '</div>'
          + '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px">'
          + shotCell("apex-anatomy", "THE SPECIFICATION PAGE", (ASSET_BY["apex-anatomy"] || {}).note, "the source, shipped as a still")
          + shotCell("apex-net", "THE LOCKUP VARIANT", (ASSET_BY["apex-net"] || {}).note, "the mark with NET above it")
          + '</div>'
          + '<div class="bx-bar" style="margin-top:9px">' + (ASSET_BY["apex"] ? (ASSET_BY["apex"].w + "\u00d7" + ASSET_BY["apex"].h + " WEBP, ALPHA, " + srcLabel(ASSET_BY["apex"])) : "") + ' \u00b7 DOWNLOAD \u25b8 AND COPY URL BELOW \u00b7 <b>/brand vault apex</b></div>',
          { title:"THE FILES", icon:"image", meta:"4 SHIPPED" })
      + '<div style="height:12px"></div>' + frame(vaultSection("apex"), { title:"THE LOGOTYPE IN THE VAULT", icon:"vault", meta:ASSETS.filter(a => a.src === "apex").length + " FILES" });
  }

  const VAULT_GROUPS = [
    ["apex",   "THE LOGOTYPE",              "the mark, its ink cut, the specification page and the NET lockup"],
    ["codex",  "THE CODEX, AS PICTURES",    "twelve law slides at full resolution \u2014 the argument, already laid out"],
    ["social", "THE SOCIAL SET",            "finished posts \u2014 the campaign exactly as it ships"],
    ["art",    "THE ART SET",               "hero art for a page, a banner or an email header"],
    ["marks",  "THE MARKS",                 "the cut-out illustrations, on transparency, for composition"]
  ];
  function vaultCell(a){
    return '<div class="bx-cell" style="text-align:left;background:#0b0714">'
      + '<div style="background:#07040e;border:1px solid var(--bx-court-line);border-radius:3px;overflow:hidden;display:flex;align-items:center;justify-content:center">'
      + '<img src="' + assetPath(a.id) + '" alt="' + esc(a.name) + '" loading="lazy" decoding="async" style="width:100%;height:auto;display:block">'
      + '</div>'
      + '<div class="bx-cell-name" style="color:' + PALETTE.ancient.hex + ';font-size:11px;margin-top:9px">' + esc(a.name) + '</div>'
      + '<div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px">' + esc(a.use) + '</div>'
      + '<div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px;opacity:.85"><i>provenance:</i> ' + esc(srcLabel(a)) + ' \u2014 ' + esc(a.note) + '</div>'
      + '<div class="bx-bar" style="margin-top:6px">' + esc(a.id) + ' <span class="bx-sep">//</span> ' + a.w + '\u00d7' + a.h + '</div>'
      + '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">'
      + '<a class="ci-act" href="' + assetPath(a.id) + '" download="prais-' + a.id + '.webp" style="text-decoration:none">Download \u25b8</a>'
      + '<button class="ci-act bx-copy" data-copy="' + assetPath(a.id) + '">Copy URL</button>'
      + '</div></div>';
  }
  function vaultGroup(g){
    const list = (g === "marks")
      ? ASSETS.filter(a => !a.shot && !a.variant)
      : ASSETS.filter(a => a.src === g);
    if(!list.length) return "";
    const ordered = (g === "social" || g === "art" || g === "codex") ? list.slice().sort((a, b) => (b.feat ? 1 : 0) - (a.feat ? 1 : 0)) : list;
    const meta = VAULT_GROUPS.filter(x => x[0] === g)[0] || ["", g, ""];
    return frame('<div class="bx-bar" style="margin-bottom:9px">' + esc(meta[2]) + '</div>'
      + '<div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">'
      + ordered.map(vaultCell).join("") + '</div>' + (g === "marks" ? '<div class="bx-bar" style="margin-top:9px">VECTORS (icons, emblems) ARE NOT FILES \u2014 THEY ARE DRAWN: <b>/brand icons</b>, <b>/brand emblems</b></div>' : ""),
      { title:meta[1], icon:g === "apex" ? "seal" : (g === "marks" ? "image" : "grid"), meta:list.length + " FILES" });
  }
  function vaultSection(which){
    const keys = which ? VAULT_GROUPS.map(g => g[0]).filter(k => k === which) : VAULT_GROUPS.map(g => g[0]);
    if(!keys.length) return "";
    const shots = ASSETS.filter(a => a.shot).length;
    return '<div class="bx-bar" style="margin-bottom:9px">THE MARKETING VAULT <span class="bx-sep">//</span> ' + ASSETS.length + ' FILES <span class="bx-sep">//</span> ' + shots + ' STILLS + ' + (ASSETS.filter(a => !a.shot).length) + ' MARKS <span class="bx-sep">//</span> SHIPPED IN src/brand/assets/ \u00b7 NEVER HOTLINKED <span class="bx-sep">//</span> DOWNLOAD OR COPY THE URL</div>'
      + keys.map(k => vaultGroup(k) + '<div style="height:12px"></div>').join("");
  }

  function adsSection(){
    const ADS = MARKET.ads;
    return '<div class="bx-bar" style="margin-bottom:9px">PHASE 0 <span class="bx-sep">//</span> SIX CREATIVES BEFORE ANY COPY <span class="bx-sep">//</span> THE LAW OF BILINGUAL HIERARCHY GOVERNS ALL SIX</div>'
      + frame('<div class="mk-sub" style="margin-bottom:10px">' + esc(ADS.title) + '</div>'
          + '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">'
          + ADS.cards.map(c => '<div class="bx-card"><b class="bx-card-n">' + c[0] + '</b><b class="bx-card-t">' + esc(c[1]) + '</b><span>' + esc(c[2]) + '</span></div>').join("") + '</div>',
          { title:"THE SIX CREATIVES", icon:"target", meta:"phase 0" })
      + '<div style="height:12px"></div>'
      + frame('<div class="bx-dir">' + esc(ADS.lawShort) + '</div>'
          + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:9px">'
          + ADS.lawParts.map(p => '<div class="bx-card" style="flex:1;min-width:170px"><b class="bx-card-t">' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("") + '</div>'
          + '<div class="mk-quote" style="margin-top:10px">' + esc(ADS.law) + '</div>'
          + '<div class="mk-sub" style="margin-top:9px">' + esc(ADS.why) + '</div>'
          + '<div class="bx-bar" style="margin-top:9px">THE SHEET: /brand ad-sheet \u00b7 A3 LANDSCAPE \u00b7 PRINT AT 100%</div>',
          { title:"THE LAW", icon:"scale", meta:"BRAND.021" })
      + '<div style="height:12px"></div>'
      + frame(shotCell("mkt2-adpipeline", "THE SLIDE", (ASSET_BY["mkt2-adpipeline"] || {}).note, "the source of all six cards"),
          { title:"THE SLIDE THE CARDS CAME FROM", icon:"scanline", meta:"mkt2-adpipeline" });
  }

  /* THE LANDING PAGE \u2014 the register, in the order a stranger reads it. */
  function landingSection(){
    const M = MARKET, C = CODEX;
    const band = (kick, title, body, extra) => '<div style="border-top:1px solid var(--bx-court-line);padding-top:11px;margin-top:11px">'
      + '<div class="bx-bar">' + esc(kick) + '</div>'
      + '<div style="font-family:var(--font-head,Orbitron,sans-serif);font-size:16px;line-height:1.28;color:var(--bx-ancient);margin-top:6px">' + esc(title) + '</div>'
      + (body ? '<div class="mk-sub" style="margin-top:6px">' + esc(body) + '</div>' : "") + (extra || "") + '</div>';
    return '<div class="bx-bar" style="margin-bottom:9px">THE LANDING PAGE <span class="bx-sep">//</span> THE REGISTER IN READING ORDER <span class="bx-sep">//</span> EVERY LINE SOURCED</div>'
      + frame('<div style="text-align:center;padding:6px 0 12px">'
          + '<div class="bx-bar">' + esc(M.kicker) + ' \u00b7 ' + esc(M.sub) + '</div>'
          + '<div style="font-family:var(--font-head,Orbitron,sans-serif);font-size:22px;line-height:1.22;color:var(--bx-ancient);margin-top:10px">' + esc(M.headline) + '</div>'
          + '<div style="font-size:12.5px;color:var(--bx-bone);margin-top:7px">' + esc(M.headlineVn) + '</div>'
          + '<div class="mk-offer" style="margin-top:12px">' + esc(M.offer) + '</div></div>'
          + band("01 \u00b7 THE DIAGNOSIS", M.diagnose.title, M.diagnose.read,
              '<div style="margin-top:9px">' + M.diagnose.items.map(it => '<div class="bx-card" style="margin-top:7px"><b class="bx-card-t">' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></div>').join("") + '</div>'
              + '<div class="bx-bar" style="margin-top:8px">' + esc(M.diagnose.titleVn) + ' \u00b7 ' + esc(M.diagnose.lensNote) + '</div>')
          + band("02 \u00b7 THE TRANSFORMATION", M.architecture.title, M.architecture.wave.body,
              '<div style="margin-top:9px">' + asset("wave-loud", { style:"width:100%;max-width:420px;height:auto" }) + '</div>'
              + '<div style="margin-top:9px">' + M.architecture.transform.map(t => '<div class="bx-card" style="margin-top:7px"><b class="bx-card-t">' + esc(t[0]) + '</b><span>' + esc(t[1]) + '</span></div>').join("") + '</div>')
          + band("03 \u00b7 THE METHOD", M.hour.title, M.hour.line,
              '<div style="margin-top:9px">' + pillarRow() + '</div>'
              + '<div style="margin-top:9px">' + M.architecture.method.map(m => '<div class="bx-card" style="margin-top:7px"><b class="bx-card-t">' + esc(m[0]) + '</b><span>' + esc(m[1]) + '</span></div>').join("") + '</div>')
          + band("04 \u00b7 THE BIOLOGY", C.retention.title, C.retention.leak,
              '<div class="mk-days" style="margin-top:9px">' + M.biology.days.map(d => '<div class="mk-day"><b>' + esc(d.replace("Day ", "")) + '</b><span>DAY</span></div>').join("") + '</div>'
              + '<div class="bx-bar" style="margin-top:8px">' + esc(M.biology.status) + '</div>')
          + band("05 \u00b7 THE PROOF", C.proof.title, C.proof.line,
              '<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-top:9px">'
              + C.proof.numbers.map(n => '<div class="bx-card" style="text-align:center"><b class="bx-card-n" style="font-size:30px">' + esc(n[0]) + '</b><span>' + esc(n[1]) + '</span></div>').join("") + '</div>'
              + '<div class="bx-plate" style="margin-top:10px;border-color:var(--bx-hazard,#e0473f)"><div class="bx-plate-top">' + icon("alert") + '<b>BOTH MULTIPLES, PRINTED</b></div><div class="bx-plate-body">' + esc(C.proof.delta) + '</div></div>')
          + band("06 \u00b7 TRADITIONAL vs SOVEREIGN", "THE COMPARISON", M.compare.map(r => r[0]).join(" \u00b7 "),
              '<div class="mk-compare-wrap" style="margin-top:9px;text-align:left">' + matrix(M.compare, { left:"TRADITIONAL CENTRE", right:"NET (TIGER PROTOCOL)" }) + '</div>'
              + '<div class="mk-compare-wrap" style="margin-top:9px;text-align:left">' + matrix(M.architecture.compare, { left:"TRADITIONAL CENTRES", right:"NET (TIGER PROTOCOL)" }) + '</div>')
          + band("07 \u00b7 THE ADVANTAGE", C.advantage.title, C.advantage.sell,
              '<div style="margin-top:9px">' + C.advantage.halves.map(h => '<div class="bx-card" style="margin-top:7px"><b class="bx-card-t">' + esc(h[0]) + '</b>' + h[1].map(x => '<span>' + esc(x) + '</span>').join("") + '</div>').join("") + '</div>'
              + '<div class="bx-bar" style="margin-top:8px">' + esc(C.advantage.viet) + '</div>')
          + band("08 \u00b7 THE OFFER", C.audit.title + " " + C.audit.q, C.audit.truth,
              '<div style="margin-top:9px">' + C.audit.steps.map((s, i) => '<div class="bx-card" style="margin-top:7px"><b class="bx-card-n">' + (i + 1) + '</b><b class="bx-card-t">' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>').join("") + '</div>'
              + '<div class="mk-offer" style="margin-top:11px">' + esc(M.offer) + ' \u00b7 ' + esc(C.audit.cta) + '</div>'
              + '<div class="bx-bar" style="margin-top:8px">' + esc(C.audit.close) + '</div>'),
          { title:"THE LANDING PAGE, LIVE", icon:"target", meta:"eight bands \u00b7 one reader" })
      + '<div style="height:12px"></div>'
      + frame(shotGrid(["mkt2-failure", "mkt2-architecture", "mkt2-biology", "mkt-mouse2tiger"]),
          { title:"THE SLIDES THIS PAGE IS TRANSCRIBED FROM", icon:"scanline", meta:"4 STILLS" });
  }

  function hudSection(){
    return '<div class="bx-grid bx-grid-wide">'      + '<div class="bx-plate"><div class="bx-plate-top">' + icon("corner") + '<b>FRAME</b></div><div class="bx-plate-body">A framed panel is the default container: plum shell, hairline border, antique-gold corner brackets. Never a bare rounded box when the content is a record.</div>'
      + '<div style="margin-top:9px">' + frame(plate("book", "LESSON 04", "The vocabulary vault holds five terms from the scene — the student meets them in context before the drill."), { title:"SPECIMEN", icon:"scanline", meta:"LSN-24" }) + '</div></div>'
      + '<div class="bx-plate"><div class="bx-plate-top">' + icon("bracket") + '<b>THE STATUS BAR</b></div><div class="bx-plate-body">One monospace line of what is TRUE right now, separated by <b>//</b>. It is a fact line, not decoration — if it drifts from reality it is a defect.</div>'
      + '<div style="margin-top:9px">' + bar(["SYSTEM STATUS: OPTIMIZED", "SECURITY CLEARANCE: ULTRA", "BRAND::" + VERSION, "DATALOG: BRAND_SYSTEM"]) + '</div>'
      + '<div style="margin-top:9px">' + bar(["RUN 273", "SOUL 28", "I-LOG 351", "tunnel idle"]) + '</div></div>'
      + '<div class="bx-plate"><div class="bx-plate-top">' + icon("coin") + '<b>PILL &amp; CREST</b></div><div class="bx-plate-body">Numbers wear pills; a rank wears a crest. The coin economy is LESSON.012 — mouse, cub, tiger, legend. A diagnostic score wears the doctrine\'s own badge (G444.003) and never mixes with coins.</div>'
      + '<div style="margin-top:9px;display:flex;gap:7px;flex-wrap:wrap;align-items:center">' + pill("coin", "coins", "360") + pill("book", "vocab", "10") + " " + crest(360) + " " + crest(40) + " " + crest(520) + " " + modeBadge(22) + " " + modeBadge(64) + " " + modeBadge(93) + '</div></div>'
      + '<div class="bx-plate"><div class="bx-plate-top">' + icon("tiger") + '<b>THE LOCKUP</b></div><div class="bx-plate-body">Sigil + wordmark + the permanent sub-line. The sigil is the dossier\'s own gold tiger head, not a redraw.</div>'
      + '<div style="margin-top:9px">' + lockup({ size:"38px" }) + '</div></div>'
      + '<div class="bx-plate"><div class="bx-plate-top">' + icon("terminal") + '<b>THE TERMINAL</b></div><div class="bx-plate-body">Machine text on the ground, green, with a live cursor. For boot lines, datalogs, and anything the system says to itself. Taken from the closing slide.</div>'
      + '<div style="margin-top:9px">' + terminal(["STATUS: GRAMMAR_PRISON_BREACH", "PSYCHOLOGICAL_OVERRIDE_INITIATED", "GOSPEL 444 // V" + GOSPEL444.version + " // 12 LAWS LOADED"], { title:"net-academy" }) + '</div></div>'
      + '<div class="bx-plate"><div class="bx-plate-top">' + icon("chevR") + '<b>THE DIRECTIVE &amp; THE CHAIN</b></div><div class="bx-plate-body">A directive is one instruction, arrowed, in the telemetry cyan. A chain is a sequence a student is being taken through \u2014 and the last node can be marked dead, which is how the prison is drawn.</div>'
      + '<div style="margin-top:9px">' + directive("Stop translating in your head. Start understanding with your ears.") + '</div>'
      + '<div style="margin-top:9px">' + flowchain(["[Listen]", "[Translate to Vietnamese]", "[Translate to English]", "[Speak (Blocked)]"], { dead:true }) + '</div></div>'
      + '</div>';
  }

  function typeSection(){
    const T = [["Orbitron","--font-head","display face — titles, kickers, band heads"],["Rajdhani","--font-body","the body voice — headings inside prose"],["Inter","--font-ui","UI text, buttons, labels"],["JetBrains Mono","--font-mono","the bar, ids, values, coin counts"]];
    return '<div class="bx-grid bx-grid-wide">' + T.map(t => '<div class="bx-plate"><div class="bx-plate-top">' + icon("print") + '<b style="font-family:' + t[0] + ',sans-serif">' + t[0] + '</b></div>'
      + '<div class="bx-plate-body">' + esc(t[2]) + '<br><span class="bx-tag">' + t[1] + '</span></div></div>').join("") + '</div>'
      + '<div class="bx-bar" style="margin-top:8px">at most two families per lesson <span class="bx-sep">//</span> LESSON.009 <span class="bx-sep">//</span> LSN-2</div>';
  }

  function snipSection(){
    const S = [
      ["an icon", 'ObiBrand.icon("shield")            → inline <svg class="bx-ic">'],
      ["a mark",  'ObiBrand.asset("head")             → <img class="bx-mark" src="src/brand/assets/head.webp">'],
      ["a framed panel", 'ObiBrand.frame(html, {title:"VAULT", icon:"lock", meta:"L2"})'],
      ["a status bar", 'ObiBrand.bar(["RUN 273","SOUL 28","tunnel idle"])'],
      ["a pill / a crest", 'ObiBrand.pill("coin","coins","360")  ·  ObiBrand.crest(520)'],
      ["upgrade the DOM", 'ObiBrand.upgrade()   // data-icon / data-mark / data-bar'],
      ["the doctrine's chrome", 'ObiBrand.terminal(["STATUS: OPERATIONAL"])  ·  ObiBrand.directive("Stop translating.")  ·  ObiBrand.flowchain(["[Listen]","[Speak]"], {dead:true})'],
      ["the mode ladder", 'ObiBrand.modes()  ·  ObiBrand.modeBadge(93)  ·  ObiBrand.modeOf(64).name'],
      ["the whole doctrine", 'ObiBrand.GOSPEL444.laws[3].line  →  "LOUD & WRONG BEATS QUIET & RIGHT\u2026"'],
      ["the whole deck", 'await ObiBrand.buildDeck()  →  one standalone .html, every mark inlined'],
      ["an emblem", 'ObiBrand.emblem("rank-tiger")     → an SVG roundel, 3 of 4 ticks lit  ·  ObiBrand.emblemBand("mode-cub")'],
      ["a bed (a ground)", 'ObiBrand.patternCss("circuit")  → a CSS background-image value  ·  ObiBrand.patternUrl("lattice")'],
      ["a printed artifact", 'await ObiBrand.composeArtifact("wall-set")  \u2192  one standalone .html  \u00b7  .open() \u00b7 .download()'],
      ["the marketing register", 'ObiBrand.MARKET.pillars[0].body  \u00b7  ObiBrand.mktCover()  \u00b7  ObiBrand.marketingPages()'],
      ["into a lesson file", 'ObiBrand.assetDataUrl("head")  \u2192 data URL, safe inside an exported .html']
    ];
    return S.map(s => '<div style="margin-bottom:7px"><div class="bx-bar">' + esc(s[0]) + '</div><div class="bx-snip">' + esc(s[1]) + '</div></div>').join("");
  }

  /* ---- GOSPEL 444: the doctrine room ------------------------------------- */
  function lawCard(l){
    return '<div class="bx-cell" style="text-align:left">'
      + '<div class="bx-bar" style="margin-bottom:6px">GOSPEL 444 <span class="bx-sep">//</span> ' + esc(l.n) + (l.mark ? ' <span class="bx-sep">//</span> MARK ' + esc(l.mark.toUpperCase()) : "") + '</div>'
      + '<div class="bx-plate-top">' + icon(LAW_ICON[l.n] || "info") + '<b>' + esc(l.title) + '</b></div>'
      + '<div class="bx-dir" style="margin:7px 0">' + esc(l.line) + '</div>'
      + '<div class="bx-plate-body">' + l.body.map(p => '<p style="margin:0 0 7px">' + esc(p) + '</p>').join("") + '</div>'
      + (l.modes ? modes() : "")
      + (l.mark ? '<div class="bx-area-mark" style="margin-top:9px;background:#0b0714;border:1px solid var(--bx-court-line);border-radius:3px;padding:7px;display:flex;justify-content:center">' + asset(l.mark, { style:"max-height:132px;width:auto" }) + '</div>' : "")
      + '</div>';
  }
  function doctrineSection(){
    return '<div class="bx-bar" style="margin-bottom:9px">GOSPEL 444 PROTOCOL V' + GOSPEL444.version + ' <span class="bx-sep">//</span> ' + GOSPEL444.laws.length + ' LAWS <span class="bx-sep">//</span> SOURCE: ' + esc(GOSPEL444.sources.join(" + ")) + ' <span class="bx-sep">//</span> AMENDMENT IV (PROPOSED, NOT MERGED)</div>'
      + '<div class="bx-plate" style="margin-bottom:10px"><div class="bx-plate-top">' + icon("flame") + '<b>THE MOTTO</b></div><div class="bx-plate-body" style="font-size:14px;color:var(--bx-bone)">' + esc(GOSPEL444.motto) + '</div></div>'
      + '<div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">'
      + GOSPEL444.laws.map(lawCard).join("") + '</div>';
  }
  function modeSection(){
    return '<div class="bx-bar" style="margin-bottom:9px">ONE DIAGNOSTIC, 0\u2013100 <span class="bx-sep">//</span> READ FROM BEHAVIOUR, NOT GRAMMAR <span class="bx-sep">//</span> G444.003 <span class="bx-sep">//</span> NOT THE COIN LADDER (LESSON.012)</div>'
      + modes()
      + '<div style="height:11px"></div>'
      + frame(matrix(GOSPEL444.matrix), { title:"THE UNFAIR ADVANTAGE MATRIX", icon:"scale", meta:"G444.010" });
  }
  function lawOf(s){ return GOSPEL444.laws.filter(l => l.n === s.law)[0] || {}; }
  function slide(s){
    const law = lawOf(s);
    const body = [];
    if (law.body) law.body.forEach(p => body.push('<p>' + esc(p) + '</p>'));
    if (s.cards) body.push('<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(146px,1fr))">' + s.cards.map(c =>
      '<div class="bx-card"><b class="bx-card-n">' + esc(c[0]) + '</b><b class="bx-card-t">' + esc(c[1]) + '</b><span>' + esc(c[2]) + '</span></div>').join("") + '</div>');
    if (s.modes) body.push(modes());
    if (s.chain && s.chain.length) body.push(flowchain(s.chain, { dead: true }));
    return '<section class="bx-slide">'
      + '<div class="bx-slide-k">' + esc(s.kicker || "") + '<span class="bx-slide-n">' + String(s.n).padStart(2, "0") + ' / ' + GOSPEL444.slides.length + '</span></div>'
      + '<h3 class="bx-slide-t">' + esc(s.title) + '</h3>'
      + (law.line ? '<div class="bx-dir">' + esc(law.line) + '</div>' : "")
      + '<div class="bx-slide-main"><div class="bx-slide-body">' + body.join("") + '</div>'
      + '<div class="bx-slide-marks">' + (s.marks || []).map(m => asset(m, { style:"max-height:184px;width:auto" })).join("") + '</div></div>'
      + (s.closing ? '<div class="bx-slide-close"><b>' + esc(GOSPEL444.closing) + '</b><span>' + esc(GOSPEL444.closingVn) + '</span></div>' : "")
      + '<div class="bx-slide-foot">' + bar(["GOSPEL 444 PROTOCOL V" + GOSPEL444.version, law.n, "NET ACADEMY", "BRAND::" + VERSION]) + '</div>'
      + '</section>';
  }
  function deckSlides(){ return '<div class="bx-deck">' + GOSPEL444.slides.map(slide).join("") + '</div>'; }
  function deckSection(){
    return '<div class="bx-bar" style="margin-bottom:9px">THE DOCTRINE AS ' + GOSPEL444.slides.length + ' SLIDES <span class="bx-sep">//</span> COMPOSED BY THIS SYSTEM, NOT HOTLINKED <span class="bx-sep">//</span> THE MARK ON EACH SLIDE IS THE DOCTRINE\'S OWN</div>'
      + '<div style="margin-bottom:10px"><button class="ci-act" id="bxDeckExport">Export deck \u25b8</button> <span class="bx-bar" id="bxDeckNote" style="display:inline-block"></span></div>'
      + deckSlides();
  }

  /* THE CODEX DECK \u2014 the same builder, the other register. A codex slide has
     no law to look up: it carries its own blocks. */
  function codexSlide(s){
    const body = [];
    (s.lines || []).forEach(p => body.push('<p>' + esc(p) + '</p>'));
    if(s.halves) body.push(CODEX.advantage.halves.map(h => '<div class="bx-card"><b class="bx-card-t">' + esc(h[0]) + '</b>' + h[1].map(x => '<span>' + esc(x) + '</span>').join("") + '</div>').join(""));
    if(s.pair) body.push([CODEX.laziness.worker, CODEX.laziness.architect].map(b => '<div class="bx-card"><b class="bx-card-t">' + esc(b[0]) + '</b>' + b[1].map(x => '<span>' + esc(x) + '</span>').join("") + '</div>').join(""));
    if(s.cards) body.push('<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(146px,1fr))">' + s.cards.map(c => '<div class="bx-card"><b class="bx-card-n">' + esc(c[0]) + '</b><b class="bx-card-t">' + esc(c[1]) + '</b><span>' + esc(c[2]) + '</span></div>').join("") + '</div>');
    if(s.days) body.push('<div class="bx-grid" style="grid-template-columns:repeat(5,1fr)">' + MARKET.biology.days.map(d => '<div class="bx-card"><b class="bx-card-t">' + esc(d) + '</b></div>').join("") + '</div>');
    if(s.numbers) body.push('<div class="bx-grid" style="grid-template-columns:repeat(3,1fr)">' + CODEX.proof.numbers.map(x => '<div class="bx-card"><b class="bx-card-n">' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>').join("") + '</div>');
    if(s.zone) body.push('<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">' + CODEX.lakeview.facts.map(f => '<div class="bx-card"><b class="bx-card-t">' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>').join("") + '</div>');
    if(s.funnel) body.push(flowchain(CODEX.pipeline.stages.map(x => x[0].replace("THE ", "")), {}));
    if(s.stack) body.push('<div class="bx-grid" style="grid-template-columns:repeat(auto-fit,minmax(146px,1fr))">' + CODEX.stack.layers.map((l, i) => '<div class="bx-card"><b class="bx-card-n">' + (i + 1) + '</b><b class="bx-card-t">' + esc(l[0]) + '</b><span>' + esc(l[1]) + '</span></div>').join("") + '</div>');
    if(s.audit) body.push('<div class="bx-grid" style="grid-template-columns:repeat(3,1fr)">' + CODEX.audit.steps.map((x, i) => '<div class="bx-card"><b class="bx-card-n">' + (i + 1) + '</b><b class="bx-card-t">' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>').join("") + '</div>');
    if(s.flow) body.push(flowchain(["Listen", "Mimic", "Context"], {}));
    if(s.chain && s.chain.length) body.push(flowchain(s.chain, { dead:true }));
    return '<section class="bx-slide">'
      + '<div class="bx-slide-k">' + esc(s.kicker || "") + '<span class="bx-slide-n">' + String(s.n).padStart(2, "0") + ' / ' + CODEX.slides.length + '</span></div>'
      + '<h3 class="bx-slide-t">' + esc(s.title) + '</h3>'
      + '<div class="bx-slide-main"><div class="bx-slide-body">' + body.join("") + '</div>'
      + '<div class="bx-slide-marks">' + (s.marks || []).map(m => asset(m, { style:"max-height:184px;width:auto" })).join("") + '</div></div>'
      + (s.closing ? '<div class="bx-slide-close"><b>' + esc(CODEX.audit.close) + '</b><span>' + esc(CODEX.audit.cta) + '</span></div>' : "")
      + '<div class="bx-slide-foot">' + bar(["CODEX V" + CODEX.version, s.kicker || "", "NET ACADEMY", "BRAND::" + VERSION]) + '</div>'
      + '</section>';
  }
  function codexDeckSlides(){ return '<div class="bx-deck">' + CODEX.slides.map(codexSlide).join("") + '</div>'; }
  function deck2Section(){
    return '<div class="bx-bar" style="margin-bottom:9px">THE CODEX AS ' + CODEX.slides.length + ' SLIDES <span class="bx-sep">//</span> COMPOSED BY THIS SYSTEM, NOT HOTLINKED <span class="bx-sep">//</span> AND THE ' + (ASSETS.filter(a => a.shot && ["codex", "tiger-protocol", "tiger-engine", "run-log"].indexOf(a.src) >= 0).length) + ' PAGES IT CANNOT DRAW SHIP AS STILLS</div>'
      + '<div style="margin-bottom:10px"><button class="ci-act" id="bxDeck2Export">Export codex deck \u25b8</button> <span class="bx-bar" id="bxDeck2Note" style="display:inline-block"></span></div>'
      + codexDeckSlides();
  }
  async function buildCodexDeck(){
    const used = { phoenix:1, head:1 };
    CODEX.slides.forEach(s => (s.marks || []).forEach(m => used[m] = 1));
    const data = {};
    for (const id of Object.keys(used)) data[id] = await deckDataUrl(id, 520);
    let deck = codexDeckSlides().split(assetPath("head")).join(data.head || assetPath("head"));
    for (const id of Object.keys(data)) if(data[id]) deck = deck.split(assetPath(id)).join(data[id]);
    const cover = (data.phoenix || assetPath("phoenix"));
    const coverLockup = lockup({ size:"40px", sub:"the operational codex" }).split(assetPath("head")).join(data.head || assetPath("head"));
    const doc = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n'
      + '<title>' + esc(CODEX.deck) + ' \u2014 NET Academy</title>\n'
      + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
      + '<meta name="description" content="' + esc(CODEX.sub) + '">\n'
      + '<link rel="icon" href="' + cover + '">\n'
      + '<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;600&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">\n'
      + '<style>\n' + DECK_BASE + '\n' + css() + '\n</style>\n</head>\n<body>\n<div class="bx-doc">\n'
      + '<header class="bx-doc-cover"><img class="bx-mark" src="' + cover + '" alt="The phoenix">'
      + '<div class="bx-doc-cover-b">' + coverLockup
      + '<h1>WE DO NOT SELL ENGLISH LESSONS.<br>WE SELL PERMISSION TO BE POWERFUL.</h1>'
      + '<p>' + bar([CODEX.deck, CODEX.slides.length + " SLIDES", ASSETS.filter(a => a.shot && ["codex", "tiger-protocol", "tiger-engine", "run-log"].indexOf(a.src) >= 0).length + " DECK PAGES AS STILLS", "AMENDMENT VII (PROPOSED)"]) + '</p></div></header>\n'
      + '<main class="bx-deck">' + deck + '</main>\n'
      + '<footer class="bx-doc-foot">' + bar([CODEX.stack.line, CODEX.audit.cta, "NET ACADEMY", "BRAND::" + VERSION]) + '</footer>\n'
      + '</div>\n</body>\n</html>';
    return doc;
  }

  /* the standalone deck — one .html, marks inlined as data URLs, no fetches.
     Mirrors how a lesson file is built (src/lessons.js build()). */
  const DECK_BASE = [
    "*{box-sizing:border-box}",
    "body{margin:0;background:#0f0f1a;color:#e2e8f0;font-family:Inter,system-ui,-apple-system,sans-serif;text-align:left;line-height:1.5}",
    ".bx-doc{max-width:1000px;margin:0 auto;padding:16px 14px 40px}",
    ".bx-doc-cover{position:relative;overflow:hidden;border:1px solid var(--bx-court-line);border-radius:3px;margin-bottom:12px;background:radial-gradient(120% 92% at 50% 38%,#30165a 0%,#1a0b2c 48%,#0b0714 74%)}",
    ".bx-doc-cover .bx-mark{width:auto;height:min(56vw,370px);max-width:100%;margin:0 auto;object-fit:contain;display:block}",
    ".bx-doc-cover-b{position:absolute;inset:auto 0 0 0;padding:16px 15px 13px;background:linear-gradient(180deg,rgba(8,5,15,0) 0%,rgba(8,5,15,.55) 34%,rgba(8,5,15,.95) 62%,#08050f 100%)}",
    ".bx-doc-cover h1{font-family:Orbitron,sans-serif;font-size:clamp(19px,4.6vw,34px);font-weight:900;letter-spacing:.02em;margin:0 0 5px;color:#f4e7c4;text-shadow:0 2px 14px rgba(0,0,0,.95),0 0 30px rgba(0,0,0,.8)}",
    ".bx-doc-cover p{margin:0;font-size:12.5px;color:#e8c565}",
    ".bx-doc-cover .bx-lockup{gap:10px;margin-bottom:8px}",
    ".bx-doc-cover .bx-lockup-t .bx-wm-1,.bx-doc-cover .bx-lockup-t .bx-wm-2{text-shadow:0 1px 8px rgba(0,0,0,.95)}",
    ".bx-doc-cover .bx-lockup-t .bx-wm-sub{color:#f0d694;opacity:1;text-shadow:0 1px 8px rgba(0,0,0,.95)}",
    ".bx-doc-cover .bx-bar{color:#e0c98a;opacity:1;text-shadow:0 1px 8px rgba(0,0,0,.95)}",
    ".bx-doc-foot{margin-top:14px}",
    ".bx-doc a{color:#c678ff}"
  ].join("\n");

  async function buildDeck(){
    const used = { phoenix:1, head:1 };
    GOSPEL444.slides.forEach(s => (s.marks || []).forEach(m => used[m] = 1));
    const data = {};
    for (const id of Object.keys(used)) data[id] = await deckDataUrl(id, 520);
    let deck = deckSlides().split(assetPath("head")).join(data.head || assetPath("head"));
    for (const id of Object.keys(data)) if (data[id]) deck = deck.split(assetPath(id)).join(data[id]);
    const cover = (data.phoenix || assetPath("phoenix"));
    const coverLockup = lockup({ size:"40px", sub:"GOSPEL 444 \u00b7 the tiger protocol" }).split(assetPath("head")).join(data.head || assetPath("head"));
    const doc = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n'
      + '<title>GOSPEL 444 PROTOCOL V' + GOSPEL444.version + ' \u2014 NET Academy</title>\n'
      + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
      + '<meta name="description" content="' + esc(GOSPEL444.motto) + '">\n'
      + '<link rel="icon" href="' + cover + '">\n'
      + '<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;600&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">\n'
      + '<style>\n' + DECK_BASE + '\n' + css() + '\n</style>\n</head>\n<body>\n<div class="bx-doc">\n'
      + '<header class="bx-doc-cover"><img class="bx-mark" src="' + cover + '" alt="The phoenix">'
      + '<div class="bx-doc-cover-b">' + coverLockup
      + '<h1>WE DO NOT TEACH ENGLISH.<br>WE UNLOCK PERMISSION.</h1>'
      + '<p>' + bar(["GOSPEL 444 PROTOCOL V" + GOSPEL444.version, GOSPEL444.laws.length + " LAWS", GOSPEL444.slides.length + " SLIDES", "AMENDMENT IV (PROPOSED)"]) + '</p></div></header>\n'
      + '<main class="bx-deck">' + deck + '</main>\n'
      + '<footer class="bx-doc-foot">' + bar([GOSPEL444.closing, GOSPEL444.closingVn, "NET ACADEMY", "BRAND::" + VERSION]) + '</footer>\n'
      + '</div>\n</body>\n</html>';
    return doc;
  }

  /* ==========================================================================
     THE PRINT ROOM — the artwork, as FILES.
     Everything above this line is drawn for a screen; this is the layer that
     hands a teacher a sheet of paper. Four artifacts, each one standalone
     .html that opens with no server, no fetch and no dependency:

       1. THE WALL SET  — cover, twelve law posters, the ladder, the matrix,
                          the closing. A3 portrait, one page each.
       2. THE ONE SHEET — all twelve laws, the ladder, the matrix and the motto
                          on a single A3: the page that gets pinned up.
       3. THE BADGE SHEET — every emblem as a cut-out, A4: a rank you can hand
                          a student on paper.
       4. THE RANK CERTIFICATE — A4 landscape, printed from a REAL record.

     The rule that governs the whole room: the artwork is composed from the
     system (marks cut from the sovereign's decks, emblems drawn here, the
     doctrine's own words) — never redrawn, never restyled, never invented. And
     a certificate carries a claim, so it is only ever composed from data a
     human supplied: an empty field stays an empty rule to be filled by hand.
     ========================================================================== */
  const MM = 3.7795275591;   /* CSS px per mm at 96 dpi */
  const PRINT_FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=JetBrains+Mono:wght@400;600&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">';

  /* SCOPED: safe to inject into the station itself — the desk's thumbnails.
     No html/body/@page rules here, nothing global. */
  const PRINT_SCOPE = [
    ".po{position:relative;overflow:hidden;background:#0b0714;color:#efe6d2;font-family:Inter,system-ui,sans-serif;text-align:left}",
    ".po-a3{width:297mm;height:420mm}",
    ".po-a4{width:210mm;height:297mm}",
    ".po-a4l{width:297mm;height:210mm}",
    ".po-bed{position:absolute;inset:0;pointer-events:none}",
    ".po-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 76% at 50% -6%,rgba(59,29,92,.6),transparent 60%),radial-gradient(96% 54% at 50% 104%,rgba(8,5,15,.92),transparent 62%)}",
    ".po-frame{position:absolute;inset:7mm;border:.3mm solid rgba(120,80,200,.45);pointer-events:none}",
    ".po-frame:before,.po-frame:after{content:'';position:absolute;width:14mm;height:14mm;border:1mm solid #e8c565}",
    ".po-frame:before{top:-1mm;left:-1mm;border-right:0;border-bottom:0}",
    ".po-frame:after{bottom:-1mm;right:-1mm;border-left:0;border-top:0}",
    ".po-pad{position:absolute;inset:0;padding:17mm 16mm 13mm;display:flex;flex-direction:column;gap:6mm;z-index:2}",
    ".po-top{display:flex;align-items:center;gap:5mm;border-bottom:.25mm solid rgba(120,80,200,.4);padding-bottom:4mm}",
    ".po-top-bar{margin-left:auto;font-family:JetBrains Mono,monospace;font-size:3.2mm;letter-spacing:.16em;text-transform:uppercase;color:#efd9a0;text-align:right;line-height:1.8}",
    ".po .bx-lockup-t .bx-wm-1,.po .bx-lockup-t .bx-wm-2{font-size:4.6mm}",
    ".po .bx-lockup-t .bx-wm-s{font-size:4mm;margin:0 2mm}",
    ".po .bx-lockup-t .bx-wm-sub{font-size:2.3mm}",
    ".po-ghost{position:absolute;right:18mm;top:56mm;font-family:Orbitron,sans-serif;font-weight:900;font-size:132mm;line-height:.8;color:rgba(168,85,247,.17);z-index:1;pointer-events:none;letter-spacing:-.04em}",
    ".po-kick{font-family:JetBrains Mono,monospace;font-size:3mm;letter-spacing:.3em;text-transform:uppercase;color:#5ed5eb}",
    ".po-h{font-family:Orbitron,sans-serif;font-weight:900;font-size:16mm;line-height:1.02;letter-spacing:.004em;margin:2mm 0 0;color:#e8c565;text-shadow:0 .6mm 2mm rgba(0,0,0,.5)}",
    ".po-line{margin-top:5mm;font-family:JetBrains Mono,monospace;font-size:4.1mm;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;color:#f7edd2;background:linear-gradient(90deg,rgba(232,197,101,.18),rgba(232,197,101,.015));border-left:1.2mm solid #e8c565;padding:3.4mm 5mm;font-weight:600}",
    ".po-hero{display:flex;align-items:center;gap:9mm;flex:0 0 auto;min-height:0}",
    ".po-hero-t{flex:1 1 0;min-width:0}",
    /* A law poster is a two-column poster, not a stacked page: full-width header
       and footer, then a text column and a marks column that both run the whole
       height between them. The marks are the doctrine's own pictures, so they get
       a column rather than a corner — and because both columns are the same
       height, neither side can leave a hole. */
    ".po-2col{display:grid;grid-template-columns:1.02fr .98fr;grid-template-rows:auto 1fr auto;gap:6mm 11mm;align-items:stretch}",
    ".po-2col>.po-top,.po-2col>.po-foot{grid-column:1/-1}",
    ".po-col{display:flex;flex-direction:column;justify-content:space-between;gap:5mm;min-width:0}",
    ".po-2col .bx-term-body{font-size:3.8mm;line-height:1.8}",
    ".po-2col .bx-term-bar b{font-size:3mm}",
    ".po-2col .bx-term-bar{padding:2.4mm 3mm}",
    ".po-2col .bx-term-body{padding:3mm 3.6mm}",
    ".po-marks{display:grid;grid-auto-rows:1fr;align-items:center;justify-items:center;gap:6mm;height:100%;min-width:0}",
    ".po-marks .bx-mark{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 0 12mm rgba(168,85,247,.3))}",
    ".po-mark-solo{flex:0 0 46%;max-width:48%;display:flex;align-items:center;justify-content:center}",
    ".po-mark-solo .bx-mark{max-width:100%;max-height:206mm;width:auto;height:auto;filter:drop-shadow(0 0 14mm rgba(168,85,247,.32))}",
    ".po-body{font-family:Rajdhani,sans-serif;font-size:5.7mm;line-height:1.52;color:#efe6d2;opacity:.96}",
    ".po-body p{margin:0 0 3.4mm;padding-left:6mm;border-left:.3mm solid rgba(120,80,200,.5)}",
    ".po-extra .bx-mode li,.po-extra .bx-matrix-v{font-size:3.3mm}",
    ".po-extra .bx-mode-top b{font-size:3.6mm}",
    ".po-extra .bx-mode-beh,.po-extra .bx-mode-band,.po-extra .bx-matrix-k,.po-extra .bx-matrix-h{font-size:2.8mm}",
    ".po-extra .bx-mode-cost{font-size:3.4mm}",
    ".po-extra .bx-matrix-h{padding:2mm 3mm}",
    ".po-extra .bx-matrix-r{padding:2mm 3mm}",
    ".po-extra .bx-modes{grid-template-columns:repeat(3,1fr)}",
    ".po-extra .bx-flow{flex-direction:row;align-items:center;justify-content:center;gap:2mm;flex-wrap:wrap}",
    ".po-extra .bx-flow-a{transform:rotate(-90deg)}",
    ".po-extra .bx-flow-n{font-size:3.2mm;padding:1.6mm 3mm}",
    ".po-extra .bx-card-n{font-size:8mm}",
    ".po-extra .bx-card b.bx-card-t{font-size:3.4mm}",
    ".po-extra .bx-card span{font-size:3.4mm}",
    ".po-extra .bx-card b.bx-card-t{font-size:3.6mm}",
    ".po-extra .bx-card{padding:3mm}",
    ".po-foot{margin-top:auto;display:flex;align-items:flex-end;gap:6mm;border-top:.3mm solid rgba(120,80,200,.5);padding-top:4mm}",
    ".po-foot-l{flex:1 1 0}",
    ".po-motto{font-family:Orbitron,sans-serif;font-weight:700;font-size:5mm;line-height:1.2;color:#f4e7c4}",
    ".po-motto-vn{font-family:JetBrains Mono,monospace;font-size:3mm;letter-spacing:.12em;color:#dcc178;margin-top:3mm;border-left:.6mm solid rgba(232,197,101,.65);padding-left:3mm}",
    ".po-motto-sub{font-family:Rajdhani,sans-serif;font-size:3.4mm;color:#efe6d2;opacity:.8;margin-top:2.5mm}",
    ".po-pg{position:absolute;left:16mm;bottom:2.8mm;font-family:JetBrains Mono,monospace;font-size:2.8mm;letter-spacing:.2em;color:#b9a6dd;z-index:3}",
    ".po-cover{align-items:stretch}",
    ".po-cover .po-mark-solo .bx-mark{max-height:214mm;max-width:160mm}",
    ".po-cover-vn{font-family:JetBrains Mono,monospace;font-size:3.2mm;letter-spacing:.16em;color:#e8c565;margin-top:3mm}",
    /* the certificate's own furniture */
    ".ce-frame{position:absolute;inset:6mm;border:.5mm solid rgba(232,197,101,.75)}",
    ".ce-frame:after{content:'';position:absolute;inset:2.6mm;border:.25mm solid rgba(120,80,200,.7)}",
    ".ce-grid{position:absolute;inset:6mm;padding:13mm 14mm;display:flex;gap:10mm;z-index:2}",
    ".ce-l{flex:1 1 0;min-width:0;display:flex;flex-direction:column;justify-content:space-between}",
    ".ce-kick{font-family:JetBrains Mono,monospace;font-size:3.6mm;letter-spacing:.3em;text-transform:uppercase;color:#7fe2f2}",
    ".ce-h{font-family:Orbitron,sans-serif;font-weight:900;font-size:11mm;line-height:1.04;color:#e8c565;margin:2.5mm 0 0}",
    ".ce-name{font-family:Orbitron,sans-serif;font-weight:700;font-size:13mm;color:#f7edd2;border-bottom:.5mm solid rgba(232,197,101,.8);padding-bottom:2mm;margin-top:6mm;min-height:18mm;white-space:nowrap;overflow:hidden}",
    ".ce-lab{font-family:JetBrains Mono,monospace;font-size:2.6mm;letter-spacing:.3em;text-transform:uppercase;color:#c9a758;margin-top:2mm}",
    ".ce-claim{font-family:Rajdhani,sans-serif;font-size:4.3mm;line-height:1.5;color:#efe6d2;margin-top:6mm;opacity:.96;border-left:.3mm solid rgba(120,80,200,.5);padding-left:5mm}",
    ".ce-claim b{color:#f7edd2}",
    ".ce-r{flex:0 0 76mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5mm}",
    ".ce-emb{filter:drop-shadow(0 0 10mm rgba(168,85,247,.35))}",
    ".ce-rbar{font-family:JetBrains Mono,monospace;font-size:2.3mm;letter-spacing:.14em;text-transform:uppercase;color:#c9a758;text-align:center;line-height:1.5}",
    ".ce-mid{display:flex;flex-direction:column;gap:4mm;margin-top:6mm}",
    ".ce-quote{font-family:JetBrains Mono,monospace;font-size:3.2mm;line-height:1.5;letter-spacing:.03em;text-transform:uppercase;color:#f7edd2;background:linear-gradient(90deg,rgba(232,197,101,.16),rgba(232,197,101,.015));border-left:1mm solid #e8c565;padding:2.6mm 4mm}",
    ".ce-plates{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}",
    ".ce-plate{border:.25mm solid rgba(120,80,200,.5);background:rgba(15,15,26,.6);padding:2.4mm 2.8mm}",
    ".ce-plate b{display:block;font-family:JetBrains Mono,monospace;font-size:2.1mm;letter-spacing:.18em;text-transform:uppercase;color:#c9a758}",
    ".ce-plate span{display:block;font-family:Rajdhani,sans-serif;font-size:3.1mm;line-height:1.4;color:#efe6d2;margin-top:1.6mm}",
    ".ce-sign{margin-top:auto;display:flex;gap:8mm}",
    ".ce-sign>div{flex:1 1 0}",
    ".ce-rule{border-bottom:.3mm solid rgba(232,197,101,.65);height:9mm}",
    ".ce-sign-lab{font-family:JetBrains Mono,monospace;font-size:2.5mm;letter-spacing:.22em;text-transform:uppercase;color:#c9a758;margin-top:1.6mm}",
    ".ce-ver{position:absolute;left:6mm;right:6mm;bottom:6mm;padding:3mm 14mm;font-family:JetBrains Mono,monospace;font-size:2.7mm;letter-spacing:.16em;text-transform:uppercase;color:#d8b968;display:flex;gap:4mm;flex-wrap:wrap;z-index:3;border-top:.25mm solid rgba(120,80,200,.45)}",
    /* the badge sheet */
    ".bd-wrap{position:absolute;inset:6mm;padding:10mm 12mm 9mm;display:flex;flex-direction:column;gap:4.5mm;z-index:2}",
    ".bd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;flex:1 1 auto;align-content:space-evenly}",
    ".bd-cut{border:.3mm dashed rgba(200,169,88,.55);padding:5mm 3mm;display:flex;flex-direction:column;align-items:center;gap:2mm;text-align:center}",
    ".bd-cut b{font-family:Orbitron,sans-serif;font-size:3.4mm;letter-spacing:.08em;color:#e8c565}",
    ".bd-cut span{font-family:JetBrains Mono,monospace;font-size:2.3mm;letter-spacing:.16em;text-transform:uppercase;color:#c9a758}",
    ".bd-cut i{font-family:Rajdhani,sans-serif;font-size:3mm;color:#cfc4e6;font-style:normal;line-height:1.35}",
    /* the desk's previews */
    ".pr-thumb{overflow:hidden;border:1px solid var(--bx-court-line);border-radius:3px;background:#0b0714;flex:0 0 auto}",
    ".pr-thumb-in{transform-origin:top left}",
    ".pr-thumb .po{box-shadow:none}",
    /* the exported document's own shell */
    ".po-toolbar{position:sticky;top:0;z-index:9;display:flex;align-items:center;gap:12px;padding:11px 14px;background:rgba(8,5,15,.94);border-bottom:1px solid rgba(120,80,200,.45);font-family:JetBrains Mono,monospace;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#c9a758}",
    ".po-toolbar b{font-family:Orbitron,sans-serif;font-size:12px;color:#e8c565;letter-spacing:.1em}",
    ".po-toolbar span{margin-left:auto;color:#8a7bb0;letter-spacing:.08em}",
    ".po-toolbar button{font-family:Orbitron,sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0b0714;background:#e8c565;border:0;border-radius:2px;padding:7px 13px;cursor:pointer}",
    ".po-set{display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px}",
    ".po-help{max-width:297mm;padding:10px 14px;font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#8a7bb0}",
    "@media(max-width:700px){.po-set{padding:8px}.po-toolbar{flex-wrap:wrap}.po-toolbar span{width:100%;margin-left:0}}"
  ].join("\n");

  function printGlobal(page){
    return [
      "*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}",
      "html,body{margin:0;padding:0;background:#0f0f1a}",
      "@page{size:" + page + ";margin:0}",
      "@media print{.po-set{padding:0;gap:0}.po{box-shadow:none}.po-noprint,.po-toolbar,.po-help{display:none!important}.po{break-after:page;page-break-after:always}.po:last-child{break-after:auto;page-break-after:auto}}"
    ].join("\n");
  }
  function ensurePrint(){
    if(document.getElementById("obi-brand-print-css")) return;
    const s = document.createElement("style");
    s.id = "obi-brand-print-css";
    s.textContent = PRINT_SCOPE + "\n" + CHART_SCOPE + "\n" + MARKET_SCOPE + "\n" + CODEX_SCOPE;
    document.head.appendChild(s);
  }

  function bed(kind, ink, opacity){ return '<div class="po-bed" style="' + patternCss(kind, { ink: ink, opacity: opacity }) + '"></div>'; }
  function poTop(right, sub){
    return '<div class="po-top">' + lockup({ size:"15mm", sub: sub || "GOSPEL 444 \u00b7 the tiger protocol" })
      + '<div class="po-top-bar">' + right.map(r => esc(r)).join("<br>") + '</div></div>';
  }
  function poFoot(page, n, of, extra, m){
    const motto = (m && m.motto) || GOSPEL444.motto;
    const vn = (m && m.vn) || GOSPEL444.closingVn;
    const ver = (m && m.ver) || ("GOSPEL 444 PROTOCOL V" + GOSPEL444.version);
    return '<div class="po-foot"><div class="po-foot-l"><div class="po-motto">' + esc(motto) + '</div>'
      + '<div class="po-motto-vn">' + esc(vn) + '</div>'
      + (extra ? '<div class="po-motto-sub">' + esc(extra) + '</div>' : "")
      + '</div><div class="po-seal">' + emblem(page === "G444.012" ? "seal-444" : "seal-net", { size:150 }) + '</div></div>'
      + '<div class="po-pg">' + esc("PAGE " + n + " / " + of + " \u00b7 " + ver) + '</div>';
  }
  function slideOf(lawN){ return GOSPEL444.slides.filter(s => s.law === lawN)[0] || {}; }
  /* Every poster carries at least two of the doctrine's own marks — one alone
     leaves a poster's whole right half empty, and these are the marks the pages
     they came from actually argue with. Topical, never decorative. */
  const MARK_EXTRA = { "G444.007":["flow"], "G444.008":["pyramid"], "G444.009":["infinity"], "G444.010":["shield"], "G444.011":["gears"] };
  function marksFor(lawN){
    const s = slideOf(lawN), out = [];
    (s.marks || []).forEach(m => { if(out.indexOf(m) < 0) out.push(m); });
    const law = GOSPEL444.laws.filter(l => l.n === lawN)[0];
    if(!out.length && law && law.mark) out.push(law.mark);
    (MARK_EXTRA[lawN] || []).forEach(m => { if(out.indexOf(m) < 0) out.push(m); });
    return out;
  }

  function posterCover(){
    const n = GOSPEL444.laws.length + 4;
    return '<section class="po po-a3 po-cover">' + bed("circuit", "#a855f7", .6) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE WALL SET", "A3 \u00b7 ONE PAGE PER LAW", "PRINT AT 100%"], "GOSPEL 444 \u00b7 the tiger protocol")
      + '<div class="po-hero" style="flex:1 1 auto"><div class="po-hero-t">'
      + '<div class="po-kick">GOSPEL 444 PROTOCOL \u00b7 V' + GOSPEL444.version + '</div>'
      + '<h1 class="po-h" style="font-size:20mm">WE DO NOT TEACH ENGLISH.<br>WE UNLOCK PERMISSION.</h1>'
      + '<div class="po-line">' + esc(GOSPEL444.laws.length + " LAWS \u00b7 THE DIAGNOSTIC \u00b7 THE MATRIX \u00b7 THE CLOSING") + '</div>'
      + '<div class="po-cover-vn">' + esc(GOSPEL444.closingVn) + '</div>'
      + '</div><div class="po-mark-solo">' + asset("phoenix") + '</div></div>'
      + poFoot("", 1, n, "THE COVER OF THE WALL SET \u2014 TWELVE LAW POSTERS, THE LADDER, THE MATRIX, THE CLOSING") + '</div></section>';
  }
  function posterLaw(law, idx, of){
    const s = slideOf(law.n), marks = marksFor(law.n), hero = marks[0], alts = marks.slice(1, 3);
    const extra = [];
    if(s.modes) extra.push(modes());
    if(s.chain && s.chain.length) extra.push(flowchain(s.chain, { dead:true }));
    if(s.cards) extra.push('<div class="bx-grid" style="grid-template-columns:repeat(2,1fr)">' + s.cards.map(c =>
      '<div class="bx-card"><b class="bx-card-n">' + esc(c[0]) + '</b><b class="bx-card-t">' + esc(c[1]) + '</b><span>' + esc(c[2]) + '</span></div>').join("") + '</div>');
    const pat = law.id === "prison" ? "lattice" : law.id === "law" || law.id === "wake" ? "ember" : "circuit";
    const shown = [hero].concat(alts).slice(0, 3);
    const readout = terminal([
      "GOSPEL 444 // " + law.n,
      law.title,
      (s.kicker ? s.kicker + " // " : "") + "STATUS: IN FORCE",
      "PROTOCOL V" + GOSPEL444.version + " // LAW " + String(idx).padStart(2, "0") + " OF " + String(of).padStart(2, "0"),
      "BEGIN PROTOCOL"
    ], { title:"net-academy" });
    return '<section class="po po-a3">' + bed(pat, law.id === "law" || law.id === "wake" ? "#dc9438" : "#a855f7", .62) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-ghost">' + String(idx).padStart(2, "0") + '</div>'
      + '<div class="po-pad po-2col">'
      + poTop(["GOSPEL 444 PROTOCOL V" + GOSPEL444.version, "LAW " + String(idx).padStart(2, "0") + " OF " + String(of).padStart(2, "0"), law.n])
      + '<div class="po-col">'
      + '<div class="po-kick">' + esc(s.kicker || "THE DOCTRINE") + ' \u00b7 LAW ' + String(idx).padStart(2, "0") + '</div>'
      + '<h1 class="po-h">' + esc(law.title) + '</h1>'
      + '<div class="po-line">' + esc(law.line) + '</div>'
      + '<div class="po-body">' + law.body.map(p => '<p>' + esc(p) + '</p>').join("") + '</div>'
      + (extra.length ? '<div class="po-extra">' + extra.join('<div style="height:4mm"></div>') + '</div>' : readout)
      + '</div>'
      + '<div class="po-marks po-marks-' + (shown.length === 1 ? "one" : shown.length === 2 ? "two" : "three") + '">' + shown.map(a => asset(a)).join("") + '</div>'
      + poFoot(law.n, idx + 1, of, s.closing ? GOSPEL444.closing : "") + '</div></section>';
  }
  function posterModes(){
    const of = GOSPEL444.laws.length + 4;
    return '<section class="po po-a3">' + bed("circuit", "#5ed5eb", .58) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE DIAGNOSTIC LADDER", "G444.003", "READ FROM BEHAVIOUR"], "one diagnostic \u00b7 0\u2013100")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">THE PSYCHOLOGICAL SHIFT \u00b7 G444.003</div>'
      + '<h1 class="po-h">THREE MODES,<br>ONE MEASURE</h1>'
      + '<div class="po-line">MOUSE 0\u201340 \u00b7 CUB 41\u201379 \u00b7 TIGER 80\u2013100</div></div>'
      + '<div class="po-marks po-marks-three">' + ["mouse2", "cub", "tiger2"].map(a => asset(a)).join("") + '</div></div>'
      + '<div class="po-extra">' + modes() + '</div>'
      + '<div class="po-body"><p>' + esc("A student's mode is read from what they DO in the room, never from their grammar. It is the only score the doctrine asks a coach to hold in mind.") + '</p></div>'
      + poFoot("", GOSPEL444.laws.length + 2, of, "NOT THE COIN LADDER \u2014 LESSON.012 IS THE ECONOMY (0 / 200 / 500 / 5000 COINS) AND THE TWO LADDERS ARE SEPARATE INSTRUMENTS") + '</div></section>';
  }
  function posterMatrix(){
    const of = GOSPEL444.laws.length + 4;
    return '<section class="po po-a3">' + bed("lattice", "#a855f7", .58) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE UNFAIR ADVANTAGE MATRIX", "G444.010", "TRADITIONAL vs SOVEREIGN"], "the comparison")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">ENVIRONMENT BEATS WILLPOWER</div>'
      + '<h1 class="po-h">THE MATRIX</h1>'
      + '<div class="po-line">' + esc("30% BASELINE \u00b7 80% GUARANTEED \u00b7 2.5\u00d7 INDUSTRY STANDARD") + '</div></div>'
      + '<div class="po-marks po-marks-two">' + asset("venn") + asset("gears") + '</div></div>'
      + '<div class="po-extra">' + matrix(GOSPEL444.matrix) + '</div>'
      + '<div style="flex:1 1 auto;display:flex;gap:12mm;align-items:center;justify-content:center;min-height:46mm">'
      + '<span style="width:64mm">' + asset("edge") + '</span><span style="width:64mm">' + asset("confidence") + '</span><span style="width:64mm">' + asset("pyramid") + '</span></div>'
      + poFoot("", GOSPEL444.laws.length + 3, of, "G444.001 THE ULTIMATE EDGE \u00b7 G444.011 THE 100% CONFIDENCE GUARANTEE \u2014 THE COSTS ARE ON THE POSTERS THAT CARRY THEM") + '</div></section>';
  }
  function posterClosing(){
    const of = GOSPEL444.laws.length + 4;
    return '<section class="po po-a3">' + bed("ember", "#dc9438", .62) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["G444.012", "WAKE UP THE TIGER", "BEGIN PROTOCOL"], "GOSPEL 444 \u00b7 the tiger protocol")
      + '<div class="po-hero"><div class="po-hero-t">'
      + '<div class="po-kick">THE CAGE IS OPEN \u00b7 THE CHOICE IS YOURS</div>'
      + '<h1 class="po-h" style="font-size:19mm">WAKE UP<br>THE TIGER</h1>'
      + '<div class="po-line">' + esc(GOSPEL444.closing) + '</div>'
      + '<div class="po-cover-vn">' + esc(GOSPEL444.closingVn) + '</div>'
      + '</div><div class="po-mark-solo">' + asset("roar") + '</div></div>'
      + '<div class="po-extra">' + terminal(["STATUS: GRAMMAR_PRISON_BREACH", "PSYCHOLOGICAL_OVERRIDE_INITIATED", "GOSPEL 444 // V" + GOSPEL444.version + " // " + GOSPEL444.laws.length + " LAWS LOADED", "BEGIN PROTOCOL"], { title:"net-academy" }) + '</div>'
      + poFoot("G444.012", of, of, "THE WALL SET ENDS WHERE EVERY LESSON BEGINS") + '</div></section>';
  }

  /* ==========================================================================
     THE MARKETING SET — the same system, told to the parent.
     The wall set is the doctrine (for the coach). This is the register we hand
     a parent, a student or a landing page: the pillars, the hour, the 60% rule,
     the AI-PET, the comparison, the offer. Composed from the sovereign's own
     hand-picked slides, the marks they produced, and the doctrine's own
     numbers — nothing invented, nothing redrawn (BRAND.014).
     ========================================================================== */
  const MARKET_SCOPE = [
    ".mk-hero{display:flex;align-items:center;gap:9mm;flex:0 0 auto;min-height:0}",
    ".mk-pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}",
    ".mk-pillar{border:.3mm solid rgba(120,80,200,.55);background:rgba(15,15,26,.68);padding:5mm;display:flex;flex-direction:column;gap:3mm}",
    ".mk-pillar .bx-ic{width:9mm;height:9mm;color:#e8c565}",
    ".mk-pillar b{font-family:Orbitron,sans-serif;font-size:5mm;color:#e8c565;letter-spacing:.06em;line-height:1.1}",
    ".mk-pillar span{font-family:Rajdhani,sans-serif;font-size:4.5mm;line-height:1.45;color:#efe6d2}",
    ".mk-shot{width:100%;height:auto;display:block;border:.3mm solid rgba(120,80,200,.5);border-radius:1mm}",
    ".mk-shotrow{display:grid;grid-template-columns:1fr 1fr;gap:5mm;align-items:start}",
    ".mk-cap{font-family:JetBrains Mono,monospace;font-size:2.7mm;letter-spacing:.14em;text-transform:uppercase;color:#c9a758;margin-top:2mm;line-height:1.55}",
    ".mk-donut-wrap{display:flex;align-items:center;gap:8mm;padding-right:5mm}",
    ".mk-donut{position:relative;width:64mm;height:64mm;border-radius:50%;flex:0 0 auto}",
    ".mk-donut-hole{position:absolute;inset:15mm;border-radius:50%;background:#0b0714;border:.3mm solid rgba(120,80,200,.55);display:flex;flex-direction:column;align-items:center;justify-content:center}",
    ".mk-donut-hole b{font-family:Orbitron,sans-serif;font-size:6.2mm;color:#f7edd2;line-height:1}",
    ".mk-donut-hole span{font-family:JetBrains Mono,monospace;font-size:2.5mm;letter-spacing:.2em;color:#c9a758;margin-top:1.4mm}",
    ".mk-key{display:flex;align-items:baseline;gap:3mm;font-family:Rajdhani,sans-serif;font-size:4.2mm;color:#efe6d2;margin-bottom:3.4mm}",
    ".mk-key i{width:4mm;height:4mm;border-radius:1mm;display:inline-block;flex:0 0 auto}",
    ".mk-key b{font-family:JetBrains Mono,monospace;font-size:4.4mm;color:#f7edd2}",
    ".mk-key em{font-style:normal;font-family:JetBrains Mono,monospace;font-size:3.3mm;color:#c9a758;margin-left:auto}",
    ".mk-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}",
    ".mk-step{border-left:1mm solid #e8c565;background:rgba(232,197,101,.08);padding:3mm 4mm}",
    ".mk-step b{display:block;font-family:Orbitron,sans-serif;font-size:3.5mm;color:#e8c565;line-height:1.15}",
    ".mk-step span{display:block;font-family:Rajdhani,sans-serif;font-size:4.3mm;line-height:1.45;color:#efe6d2;margin-top:2mm}",
    ".mk-claim{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;text-align:center}",
    ".mk-claim div{border:.3mm solid rgba(232,197,101,.5);background:rgba(15,15,26,.62);padding:4mm 2mm}",
    ".mk-claim b{display:block;font-family:Orbitron,sans-serif;font-size:11mm;color:#e8c565;line-height:1}",
    ".mk-claim span{display:block;font-family:JetBrains Mono,monospace;font-size:2.6mm;letter-spacing:.16em;text-transform:uppercase;color:#c9a758;margin-top:2.4mm;line-height:1.5}",
    ".mk-offer{font-family:Orbitron,sans-serif;font-size:5.6mm;color:#f4e7c4;border:.5mm solid rgba(232,197,101,.7);padding:4mm 5mm;text-align:center;letter-spacing:.05em;background:rgba(232,197,101,.06)}",
    ".mk-days{display:grid;grid-template-columns:repeat(5,1fr);gap:3mm;text-align:center}",
    ".mk-day{border:.3mm solid rgba(220,148,56,.6);background:rgba(220,148,56,.08);padding:3mm 1mm}",
    ".mk-day b{display:block;font-family:Orbitron,sans-serif;font-size:6.4mm;color:#ffa80b;line-height:1}",
    ".mk-day span{display:block;font-family:JetBrains Mono,monospace;font-size:2.4mm;letter-spacing:.14em;color:#c9a758;margin-top:1.6mm}",
    ".mk-quote{font-family:JetBrains Mono,monospace;font-size:3.6mm;line-height:1.5;letter-spacing:.02em;text-transform:uppercase;color:#f7edd2;background:linear-gradient(90deg,rgba(232,197,101,.16),rgba(232,197,101,.015));border-left:1.2mm solid #e8c565;padding:3mm 4.5mm}",
    ".mk-sub{font-family:Rajdhani,sans-serif;font-size:4.6mm;line-height:1.5;color:#efe6d2;opacity:.95}",
    ".mk-shots{display:grid;grid-template-columns:1fr 1fr;gap:5mm}",
    ".mk-shots .mk-shot{max-height:78mm;object-fit:cover;object-position:50% 50%}",
    /* A4 is half the area of A3 — the card's furniture shrinks with it */
    ".po-a4 .po-pad{padding:13mm 12mm 10mm;gap:3mm}",
    ".po-a4 .po-seal svg{width:24mm;height:24mm}",
    ".po-a4 .po-motto{font-size:4mm}",
    ".po-a4 .po-motto-vn{font-size:2.5mm;margin-top:2mm}",
    ".po-a4 .mk-donut{width:38mm;height:38mm}",
    ".po-a4 .mk-donut-hole{inset:9mm}",
    ".po-a4 .mk-donut-hole b{font-size:4.6mm}",
    ".po-a4 .mk-key{font-size:3.8mm;margin-bottom:2.4mm}",
    ".po-a4 .mk-key b{font-size:4mm}",
    ".po-a4 .mk-step span{font-size:3.6mm;margin-top:1.4mm}",
    ".po-a4 .mk-step b{font-size:3.2mm}",
    ".po-a4 .mk-days .mk-day b{font-size:5mm}",
    ".po-a4 .mk-quote{font-size:3.2mm;padding:2.6mm 4mm}",
    ".po-a4 .mk-offer{font-size:4.6mm;padding:3mm 4mm}",
    ".po-a4 .po-h{font-size:10mm}",
    ".po-a4 .mk-days .mk-day{padding:2.4mm 1mm}",
    ".po-a4 .bx-frame-body{padding:3mm 3.6mm}"
  ].join("\n");

  function mktFoot(page, n, of, extra){
    return poFoot(page, n, of, extra, { motto: MARKET.motto, vn: MARKET.closingVn, ver: "MARKETING SET V" + MARKET.version });
  }
  function pillarRow(){
    return '<div class="mk-pillars">' + MARKET.pillars.map(p => '<div class="mk-pillar">' + icon(p.icon)
      + '<b>' + esc(p.title) + '</b><span>' + esc(p.body) + '</span></div>').join("") + '</div>';
  }
  function hourBlock(){
    const rows = MARKET.hour.donut;
    let acc = 0;
    const stops = rows.map(r => { const from = acc; acc += r[0]; return (r[0] === 75 ? "#a855f7" : "#e8c565") + " " + from + "% " + acc + "%"; }).join(",");
    return '<div class="mk-donut-wrap"><div class="mk-donut" style="background:conic-gradient(' + stops + ')">'
      + '<div class="mk-donut-hole"><b>45/15</b><span>ONE HOUR</span></div></div>'
      + '<div style="flex:1 1 0;min-width:0">' + rows.map(r => '<div class="mk-key"><i style="background:' + (r[0] === 75 ? "#a855f7" : "#e8c565") + '"></i><b>' + r[0] + '%</b><span>' + esc(r[1]) + '</span><em>' + esc(r[2]) + '</em></div>').join("")
      + '<div style="height:2mm"></div><div class="mk-sub" style="font-size:4mm">' + esc(MARKET.hour.ratio) + '</div></div></div>';
  }
  function shotPlate(id, cap){
    const a = ASSET_BY[id]; if(!a) return "";
    return '<figure style="margin:0">' + asset(id) + '<figcaption class="mk-cap">' + esc(cap || a.name) + '</figcaption></figure>';
  }
  function mktCover(){
    return '<section class="po po-a3">' + bed("circuit", "#a855f7", .58) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE MARKETING SET", "A3 \u00b7 6 PAGES", "PRINT AT 100%"], "NET Academy \u00b7 the pitch")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(MARKET.kicker) + ' \u00b7 ' + esc(MARKET.sub) + '</div>'
      + '<h1 class="po-h" style="font-size:17mm">WE DO NOT SELL LANGUAGE;<br>WE SELL PERMISSION<br>TO BE POWERFUL</h1>'
      + '<div class="po-line">' + esc(MARKET.subVn) + '</div></div>'
      + '<div class="po-mark-solo">' + asset("tiger-energy") + '</div></div>'
      + '<div class="po-extra">' + terminal([
          "MARKETING SET V" + MARKET.version + " // " + MARKET.shots.length + " HAND-PICKED SLIDES",
          "CLAIM: " + MARKET.claims.success + " MASTERY vs A " + MARKET.claims.baseline + " BASELINE",
          "EDGE: " + MARKET.claims.edge.toUpperCase(),
          MARKET.offer.toUpperCase()
        ], { title:"net-academy" }) + '</div>'
      + '<div class="mk-quote">' + esc(MARKET.headline) + '</div>'
      + mktFoot("cover", 1, 6, "SIX PAGES: THE PILLARS \u00b7 THE HOUR \u00b7 THE 60% RULE \u00b7 THE AI-PET \u00b7 THE PROOF \u00b7 THE OFFER") + '</div></section>';
  }
  function mktPillars(){
    return '<section class="po po-a3">' + bed("lattice", "#a855f7", .58) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["HOW WE BREAK THE MOLD", "3 PILLARS", "THE METHOD"], "the three engines")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">USEFUL WORDS \u00b7 SPACED REPETITION \u00b7 COMMUNITY IMMERSION</div>'
      + '<h1 class="po-h">THREE PILLARS,<br>ONE MACHINE</h1>'
      + '<div class="po-line">' + esc(MARKET.pillarKick) + '</div></div>'
      + '<div style="flex:0 0 76mm">' + asset("gears-dna") + '</div></div>'
      + pillarRow()
      + '<div class="po-extra">' + frame('<div class="mk-sub">' + esc(MARKET.hour.line) + '</div><div style="height:3mm"></div>'
          + shotPlate("mkt-hour", "The 1-hour architecture, from the sovereign's own slide deck"), { title:"THE HOUR", icon:"clock", meta:"1 PAGE" }) + '</div>'
      + mktFoot("pillars", 2, 6, "THE THREE PILLARS ARE THE METHOD'S OWN WORDS, TRANSCRIBED \u2014 NOT COPYWRITING") + '</div></section>';
  }
  function mktMethod(){
    return '<section class="po po-a3">' + bed("circuit", "#5ed5eb", .55) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE " + MARKET.sixty.title, MARKET.sixty.titleVn, "COGNITIVE INPUT"], "the magic zone")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(MARKET.sixty.telem) + ' \u00b7 YOUTUBE \u00b7 PODCASTS \u00b7 CONTEXT</div>'
      + '<h1 class="po-h" style="font-size:18mm">' + esc(MARKET.sixty.big) + ' IS THE<br>MAGIC ZONE</h1>'
      + '<div class="po-line">' + esc(MARKET.sixty.law) + '</div></div>'
      + '<div style="flex:0 0 62mm">' + asset("head-jigsaw") + '</div></div>'
      + '<div class="mk-steps">' + MARKET.sixty.three.map((s, i) => '<div class="mk-step"><b>' + (i + 1) + '. ' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>').join("") + '</div>'
      + '<div class="mk-quote">' + esc(MARKET.sixty.quote) + '</div>'
      + '<div class="po-extra">' + hourBlock() + '</div>'
      + mktFoot("method", 3, 6, "COMPREHENSION IN, REFLEX OUT \u2014 THE INPUT HALF OF THE 45/15 RATIO") + '</div></section>';
  }
  function mktAipet(){
    return '<section class="po po-a3">' + bed("ember", "#dc9438", .6) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE AI-PET", "1 \u00b7 3 \u00b7 7 \u00b7 14 \u00b7 30 DAYS", "TOUGH LOVE MODE"], "accountability, sold honestly")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(MARKET.aipet.chart.toUpperCase()) + ' \u00b7 ' + esc(MARKET.aipet.retention.toUpperCase()) + '</div>'
      + '<h1 class="po-h">THE LEAKS IN THE<br>FORGETTING CURVE</h1>'
      + '<div class="po-line">' + esc(MARKET.aipet.status) + '</div></div>'
      + '<div style="flex:0 0 66mm">' + asset("phone") + '</div></div>'
      + '<div class="mk-days">' + MARKET.aipet.days.map(d => '<div class="mk-day"><b>' + esc(d) + '</b><span>DAY</span></div>').join("") + '</div>'
      + '<div class="mk-steps">' + MARKET.aipet.points.map(p => '<div class="mk-step"><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("") + '</div>'
      + '<div class="po-extra">' + shotPlate("mkt-aipet", "The AI-PET slide, as the sovereign picked it") + '</div>'
      + mktFoot("aipet", 4, 6, "SPACED REPETITION IS G444.009 \u2014 THE MARKETING SET ONLY SAYS IT TO A PARENT") + '</div></section>';
  }
  function mktAdvantage(){
    return '<section class="po po-a3">' + bed("lattice", "#a855f7", .56) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE PROOF", "30% vs 80%", MARKET.claims.edge.toUpperCase()], "traditional vs sovereign")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(MARKET.master.findings[0][0].toUpperCase()) + ' \u00b7 ' + MARKET.claims.multiple + ' COMPLETION</div>'
      + '<h1 class="po-h">THE 2026<br>UNFAIR ADVANTAGE</h1>'
      + '<div class="po-line">' + esc(MARKET.master.findings[1][1]) + '</div></div>'
      + '<div class="po-marks po-marks-two">' + asset("edge") + asset("chip") + '</div></div>'
      + '<div class="mk-claim"><div><b>' + MARKET.claims.success + '</b><span>' + esc(MARKET.master.findings[0][0]) + ' \u2014 NET PROTOCOL</span></div>'
      + '<div><b>' + MARKET.claims.baseline + '</b><span>TRADITIONAL CENTRE BASELINE</span></div>'
      + '<div><b>' + MARKET.claims.multiple + '</b><span>COMPLETION RATE vs TRADITIONAL CENTRES</span></div></div>'
      + '<div class="po-extra">' + matrix(MARKET.compare, { left:"TRADITIONAL CENTRE", right:"NET (TIGER PROTOCOL)" }) + '</div>'
      + '<div class="mk-sub">' + esc(MARKET.master.findings[0][1]) + '</div>'
      + mktFoot("advantage", 5, 6, "WE ARE DOCTORS, NOT SALESPEOPLE \u2014 QUOTE THE NUMBER, NEVER INFLATE IT (G444.011)") + '</div></section>';
  }
  function mktClosing(){
    return '<section class="po po-a3">' + bed("ember", "#dc9438", .62) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE OFFER", MARKET.offer.toUpperCase(), "FROM MOUSE TO TIGER"], "the closing page")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">PHASE 1 \u00b7 PHASE 2 \u00b7 PHASE 3</div>'
      + '<h1 class="po-h" style="font-size:13mm">THE MOUSE IS NOT<br>THE PROBLEM</h1>'
      + '<div class="po-line">' + esc(MARKET.master.quote[0] + " " + MARKET.master.quote[1]) + '</div></div>'
      + '<div style="flex:0 0 60mm">' + asset("tiger-spectral") + '</div></div>'
      + '<div class="mk-steps">' + MARKET.phases.items.map(p => '<div class="mk-step"><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>').join("") + '</div>'
      + '<div class="po-extra" style="flex:0 0 auto">' + shotPlate("mkt-mouse2tiger", "Mouse to tiger \u2014 the master slide, as the sovereign picked it") + '</div>'
      + '<div class="mk-offer">' + esc(MARKET.offer) + '</div>'
      + mktFoot("closing", 6, 6, MARKET.closing.toUpperCase()) + '</div></section>';
  }
  function marketingPages(){ return [mktCover(), mktPillars(), mktMethod(), mktAipet(), mktAdvantage(), mktClosing()]; }

  /* THE METHOD CARD — one A4 the parent or student takes home. The teaching
     methodology on one side: the lesson's arithmetic, the daily ratio, the
     intervals, the ladder, the promise. */
  function methodCard(){
    return '<section class="po po-a4">' + bed("lattice", "#a855f7", .55) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE METHOD CARD", "A4 \u00b7 TAKE IT HOME", "KEEP IT ON THE FRIDGE"], "the method, on one page")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(MARKET.kicker) + ' \u00b7 ' + esc(MARKET.sub) + '</div>'
      + '<h1 class="po-h" style="font-size:10mm">ONE LESSON.<br>ONE HOUR.<br>ONE PAGE.</h1></div>'
      + '<div style="flex:0 0 30mm">' + asset("tiger-energy") + '</div></div>'
      + frame('<div class="mk-steps" style="grid-template-columns:1fr 1fr">'
          + '<div class="mk-step"><b>10 WORDS</b><span>Only in real sentences. Never an isolated list.</span></div>'
          + '<div class="mk-step"><b>5 IDIOMS</b><span>The conversational glue textbooks skip.</span></div>'
          + '<div class="mk-step"><b>5 SLANG</b><span>What is actually said in the room and on the street.</span></div>'
          + '<div class="mk-step"><b>3 GAMES</b><span>Warm-up, middle and finale. Play, then check.</span></div></div>', { title:"THE LESSON'S ARITHMETIC", icon:"gamepad", meta:"G444.008 \u00b7 10-5-5-3" })
      + '<div style="height:3mm"></div>'
      + frame(hourBlock(), { title:"THE DAILY RATIO", icon:"clock", meta:"45 IN \u00b7 15 OUT" })
      + '<div style="height:3mm"></div>'
      + frame('<div class="mk-days">' + MARKET.aipet.days.map(d => '<div class="mk-day"><b>' + esc(d) + '</b><span>DAY</span></div>').join("") + '</div>'
          + '<div style="height:2mm"></div><div class="mk-sub" style="font-size:3.4mm">' + esc(MARKET.aipet.points[1][1]) + '</div>', { title:"WHEN WE COME BACK TO IT", icon:"repeat", meta:"G444.009 \u00b7 AI-PET" })
      + '<div style="height:2mm"></div>'
      + '<div class="mk-offer">' + esc(MARKET.offer) + '</div>'
      + mktFoot("method-card", 1, 1, "THE SAME SYSTEM AS THE WALL SET, SAID TO A PARENT") + '</div></section>';
  }

  /* THE ONE SHEET — everything on a single A3, for the wall above the desk. */
  function modeStrip(){
    return '<div class="ch-modes">' + MODES.map(m => '<div class="ch-mode" style="--mode-ink:var(--bx-' + m.ink + ')">'
      + '<b>' + esc(m.name) + '</b><span>' + m.at + '\u2013' + m.to + ' \u00b7 ' + esc(m.behaviour) + '</span>'
      + '<i>' + esc(m.cost) + '</i></div>').join("") + '</div>';
  }
  function chartPage(){
    const cell = (l, i) => '<div class="ch-cell"><div class="ch-n">' + String(i + 1).padStart(2, "0") + '</div>'
      + '<div class="ch-t">' + icon(LAW_ICON[l.n] || "info") + '<b>' + esc(l.title) + '</b></div>'
      + '<div class="ch-l">' + esc(l.line) + '</div></div>';
    return '<section class="po po-a3">' + bed("circuit", "#a855f7", .58) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE ONE SHEET", GOSPEL444.laws.length + " LAWS \u00b7 THE LADDER \u00b7 THE MATRIX", "GOSPEL 444 PROTOCOL V" + GOSPEL444.version], "the whole protocol")
      + '<div style="display:flex;align-items:flex-end;gap:10mm">'
      + '<div style="flex:1 1 0;min-width:0"><div class="po-kick">PIN THIS ABOVE THE DESK</div>'
      + '<h1 class="po-h" style="font-size:13mm">THE WHOLE PROTOCOL</h1></div>'
      + '<div style="flex:0 0 34mm">' + asset("head") + '</div></div>'
      + '<div class="ch-grid">' + GOSPEL444.laws.map(cell).join("") + '</div>'
      + '<div class="po-extra"><div class="bx-bar" style="margin-bottom:2mm">THE DIAGNOSTIC LADDER \u00b7 G444.003 \u00b7 READ FROM BEHAVIOUR</div>' + modeStrip() + '</div>'
      + poFoot("", 1, 1, "AMENDMENT IV (PROPOSED) \u00b7 G444.001\u2013G444.012 \u00b7 BRAND::" + VERSION) + '</div></section>';
  }
  const CHART_SCOPE = [
    ".ch-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2.6mm}",
    ".ch-cell{border:.25mm solid rgba(120,80,200,.5);background:rgba(15,15,26,.66);padding:2.6mm 3mm;display:flex;flex-direction:column;gap:1.3mm}",
    ".ch-n{font-family:Orbitron,sans-serif;font-weight:900;font-size:4mm;line-height:1;color:#c678ff;opacity:.9}",
    ".ch-t{display:flex;align-items:center;gap:1.8mm}",
    ".ch-t .bx-ic{width:4mm;height:4mm;color:#e8c565}",
    ".ch-t b{font-family:Orbitron,sans-serif;font-size:3.2mm;line-height:1.15;letter-spacing:.02em;color:#f7edd2}",
    ".ch-l{font-family:JetBrains Mono,monospace;font-size:2.5mm;line-height:1.45;letter-spacing:.02em;text-transform:uppercase;color:#7fe2f2;margin-top:auto}",
    ".ch-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:2.6mm}",
    ".ch-mode{border:.25mm solid var(--mode-ink);background:rgba(15,15,26,.72);padding:2.2mm 2.6mm}",
    ".ch-mode b{display:block;font-family:Orbitron,sans-serif;font-size:3mm;color:var(--mode-ink);letter-spacing:.08em}",
    ".ch-mode span{display:block;font-family:JetBrains Mono,monospace;font-size:2.3mm;color:#f7edd2;margin-top:1.2mm;text-transform:uppercase;letter-spacing:.08em}",
    ".ch-mode i{display:block;font-family:Rajdhani,sans-serif;font-style:normal;font-size:2.7mm;color:#cfc4e6;margin-top:1.6mm;line-height:1.35}"
  ].join("\n");

  /* THE BADGE SHEET — every emblem, as a cut-out. */
  function badgePage(){
    return '<section class="po po-a4">' + bed("lattice", "#a855f7", .55) + '<div class="po-frame"></div>'
      + '<div class="bd-wrap">' + poTop(["THE BADGE SHEET", "A4 \u00b7 CUT ON THE DASHED LINE", "SEVEN EMBLEMS + TWO SEALS"], "ranks on paper")
      + '<div style="font-family:Rajdhani,sans-serif;font-size:3.4mm;color:#efe6d2;opacity:.85">Give a student the emblem they earned. The roundel is the coin ladder (LESSON.012) and the shield is the diagnostic (G444.003) \u2014 the shape tells the holder which ladder they are standing on.</div>'
      + '<div class="bd-grid">' + EMBLEMS.map(e => '<div class="bd-cut">' + emblem(e.id, { size:104 })
        + '<b>' + esc(e.name) + '</b><span>' + esc(e.role) + '</span><i>' + esc(e.note) + '</i></div>').join("") + '</div>'
      + poFoot("", 1, 1, "PRINT AT 100% \u00b7 BACKGROUND GRAPHICS ON \u00b7 CUT THE DASHED LINE") + '</div></section>';
  }

  /* THE RANK CERTIFICATE — composed from a record, never invented. */
  /* the law that governs each rung — used by the certificate so the sheet is
     never just a badge with a name on it */
  const CERT_LAW = { mouse:"G444.002", cub:"G444.003", tiger:"G444.004", legend:"G444.010" };
  function stamp(){ const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
  function rndRef(n){ const A = "ACDEFGHJKLMNPQRTUVWXY3479"; let s = ""; for(let i = 0; i < n; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
  function certPage(o){
    o = o || {};
    let id = "rank-tiger", kind = "rank";
    if(o.tier && EMBLEM_BY["rank-" + o.tier]) id = "rank-" + o.tier;
    else if(o.mode && EMBLEM_BY["mode-" + o.mode]){ id = "mode-" + o.mode; kind = "mode"; }
    const e = EMBLEM_BY[id];
    const name = String(o.name || "").trim();
    const score = (o.score === 0 || o.score) ? Number(o.score) : null;
    const ref = String(o.ref || "").trim() || ("NET/" + e.tier.toUpperCase() + "/" + stamp() + "-" + rndRef(4));
    const date = String(o.date || "").trim();
    const lawN = CERT_LAW[e.tier] || "G444.004";
    const law = GOSPEL444.laws.filter(l => l.n === lawN)[0] || GOSPEL444.laws[3];
    const m = MODES.filter(x => x.id === e.tier)[0] || MODES[2];
    const claim = kind === "rank"
      ? "has held <b>" + esc(e.name) + "</b> for a full assessment cycle \u2014 <b>" + esc(e.role.replace("COIN RANK \u00b7 ", "")) + "</b> coins banked, and the habit is no longer the thing being asked for."
      : "has been assessed at <b>" + esc(e.name) + "</b> on the GOSPEL 444 diagnostic \u2014 <b>" + esc(e.behaviour) + "</b> \u2014 read from behaviour in the room, not from grammar.";
    const plate = (t, b) => '<div class="ce-plate"><b>' + esc(t) + '</b><span>' + esc(b) + '</span></div>';
    return '<section class="po po-a4l">' + bed("circuit", "#a855f7", .55) + '<div class="po-vig"></div><div class="ce-frame"></div>'
      + '<div class="ce-grid"><div class="ce-l">'
      + '<div class="ce-kick">NET ACADEMY \u00b7 CERTIFICATE OF ' + (kind === "rank" ? "RANK" : "MODE") + '</div>'
      + '<div class="ce-h">' + (kind === "rank" ? "THE RANK IS<br>ALREADY EARNED." : "THE MODE IS<br>READ, NOT GIVEN.") + '</div>'
      + '<div class="ce-name">' + esc(name || "") + '</div>'
      + '<div class="ce-lab">HOLDER</div>'
      + '<div class="ce-claim">' + claim + '</div>'
      + '<div class="ce-mid">'
      + '<div class="ce-quote">' + esc(law.line) + '</div>'
      + '<div class="ce-plates">'
      + plate("THE LAW BEHIND IT", law.title + " \u2014 " + law.n)
      + plate(kind === "rank" ? "WHAT IT MEANS" : "WHAT IT READS AS", kind === "rank" ? e.note : m.reads.join(" "))
      + plate("WHAT IT IS NOT", "A verdict on grammar. The diagnostic reads behaviour, never accuracy \u2014 G444.003.")
      + '</div></div>'
      + '<div class="ce-sign">'
      + '<div><div class="ce-rule"></div><div class="ce-sign-lab">COACH</div></div>'
      + '<div><div class="ce-rule"></div><div class="ce-sign-lab">DATE</div></div>'
      + '<div><div class="ce-rule"></div><div class="ce-sign-lab">DIAGNOSTIC ' + (score == null ? "____" : esc(score)) + ' / 100</div></div>'
      + '</div></div>'
      + '<div class="ce-r"><div class="ce-emb">' + emblem(id, { size:212 }) + '</div>'
      + '<div class="bd-cut" style="border-color:rgba(232,197,101,.5);width:100%"><b>' + esc(e.name) + '</b><span>' + esc(e.role) + '</span><i>' + esc(e.note) + '</i></div>'
      + '<div class="ce-rbar">' + esc(GOSPEL444.motto) + '</div></div></div>'
      + '<div class="ce-ver"><span>REF ' + esc(ref) + '</span><span>' + (date ? "ISSUED " + esc(date) : "ISSUED " + stamp()) + '</span><span>' + (score == null ? "SCORE: FILL BY HAND" : "DIAGNOSTIC " + esc(score) + "/100") + '</span><span>' + esc(lawN + " \u00b7 " + law.title) + '</span><span>BRAND::' + VERSION + '</span></div>'
      + '</section>';
  }

  /* ==========================================================================
     THE CODEX SHEETS \u2014 the second wave in the print room: the campaign's own
     creative brief, the landing page as three pages of paper, and the run log
     as a half-blank form. Same rules as the first wave (BRAND.014/016): the
     artwork is the system's, every sheet carries its size and its folio, and
     nothing is fetched at print time but the four typefaces.
     ========================================================================== */
  const CODEX_SCOPE = [
    ".po-a3l{width:420mm;height:297mm}",
    ".ad-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm}",
    ".ad-card{border:.35mm solid rgba(232,197,101,.5);background:rgba(15,15,26,.72);padding:5mm 5mm 4mm;display:flex;flex-direction:column;gap:3mm;min-height:70mm}",
    ".ad-n{font-family:Orbitron,sans-serif;font-weight:900;font-size:9mm;line-height:1;color:#c678ff}",
    ".ad-t{font-family:Rajdhani,sans-serif;font-weight:700;font-size:5.6mm;line-height:1.2;color:#efe6d2}",
    ".ad-in{font-family:JetBrains Mono,monospace;font-size:3mm;letter-spacing:.14em;text-transform:uppercase;color:#c9a758;margin-top:auto;line-height:1.6}",
    ".ad-law{border:.8mm solid rgba(232,197,101,.8);background:linear-gradient(90deg,rgba(232,197,101,.13),rgba(232,197,101,.02));padding:5mm 6mm}",
    ".ad-law b{font-family:Orbitron,sans-serif;font-size:5.6mm;color:#f4e7c4;letter-spacing:.03em}",
    ".ad-law>span{display:block;font-family:Rajdhani,sans-serif;font-size:4.6mm;line-height:1.45;color:#efe6d2;margin-top:2.6mm}",
    ".ad-half{display:flex;gap:5mm;margin-top:4mm}",
    ".ad-half>div{flex:1;border:.3mm solid rgba(120,80,200,.5);background:rgba(15,15,26,.6);padding:3.4mm 4mm}",
    ".ad-half b{display:block;font-family:Orbitron,sans-serif;font-size:4mm;letter-spacing:.06em;color:#e8c565}",
    ".ad-half i{display:block;font-style:normal;font-family:Rajdhani,sans-serif;font-size:4.2mm;color:#efe6d2;margin-top:1.6mm}",
    ".co-stack{display:flex;flex-direction:column;gap:2.4mm}",
    ".co-band{border:.3mm solid rgba(120,80,200,.5);background:rgba(15,15,26,.66);padding:3.4mm 4.4mm}",
    ".co-band b{display:block;font-family:Orbitron,sans-serif;font-size:4.2mm;color:#c678ff;letter-spacing:.05em}",
    ".co-band i{display:block;font-style:normal;font-family:Rajdhani,sans-serif;font-size:4.2mm;color:#efe6d2;margin-top:1.6mm;line-height:1.4}",
    ".co-rule{border-bottom:.3mm solid rgba(232,197,101,.6);height:9mm}",
    ".co-plate{display:flex;justify-content:center;margin-top:4mm}",
    ".co-plate .bx-mark{max-width:100%;max-height:96mm;width:auto;height:auto;display:block;border:.3mm solid rgba(120,80,200,.45);border-radius:1mm}",
    ".co-2col{display:grid;grid-template-columns:1.12fr .88fr;gap:5mm;align-items:stretch}",
    ".co-grid2{display:grid;grid-template-columns:1fr 1fr;gap:2.4mm}",
    ".po-a4 .co-band{padding:1.9mm 3mm}",
    ".po-a4 .co-band b{font-size:3.4mm}",
    ".po-a4 .co-band i{font-size:3.4mm;margin-top:1mm;line-height:1.32}",
    ".po-a4 .co-rule{height:4.4mm}",
    ".po-a4 .co-stack{gap:1.8mm}",
    ".po-a4 .co-plate .bx-mark{max-height:34mm}",
    ".po-a3l .po-pad{padding:12mm 14mm 10mm;gap:4mm}",
    ".co-fill{font-family:JetBrains Mono,monospace;font-size:3.6mm;letter-spacing:.1em;color:#5f5470}",
    ".co-layer{display:flex;align-items:baseline;gap:4mm;border-left:1.4mm solid #a855f7;background:rgba(15,15,26,.66);padding:3mm 4.4mm}",
    ".co-layer>b{font-family:Orbitron,sans-serif;font-size:4.2mm;color:#e8c565;min-width:56mm;letter-spacing:.04em}",
    ".co-layer>span{font-family:Rajdhani,sans-serif;font-size:4.4mm;color:#efe6d2;line-height:1.35}",
    ".co-layer:last-child{border-left-color:#dc9438}",
    ".co-layer:last-child>b{color:#ffa80b}",
    ".po-a4 .ad-grid{grid-template-columns:1fr 1fr}",
    ".po-a4 .ad-card{min-height:24mm}",
    ".po-a4 .ad-n{font-size:6mm}",
    ".po-a4 .ad-t{font-size:4mm}",
    ".po-a4 .co-layer>b{min-width:40mm;font-size:3.6mm}",
    ".po-a4 .co-layer>span{font-size:3.7mm}",
    ".po-a4 .ad-law b{font-size:4.4mm}",
    ".po-a4 .ad-law>span{font-size:3.6mm}",
    ".po-a3l .ad-card{min-height:46mm}",
    ".po-a3l .ad-t{font-size:5.2mm}",
    ".co-2col{align-items:stretch}",
    ".co-rcol{display:flex;flex-direction:column;justify-content:space-between;gap:2.2mm}",
    ".co-body{flex:1;display:flex;flex-direction:column;justify-content:space-between}",
    ".po-a4 .co-rule{height:3mm}",
    ".co-2col>.bx-frame{display:flex;flex-direction:column}",
    ".co-2col>.bx-frame>.bx-frame-body{flex:1;display:flex;flex-direction:column}",
    ".co-2col>.bx-frame>.bx-frame-body>.co-stack{flex:1;min-height:0}",
    ".co-stack>.co-rule{flex:1 1 6mm;height:auto;min-height:2.6mm}",
    ".po-a4 .co-band{padding:1.4mm 2.6mm}",
    ".po-a4 .co-grid2{gap:1.8mm}"
  ].join("\n");

  /* PHASE 0 \u2014 the six creatives, and the law printed on the same sheet they
     answer to. A creative brief that leaves its own rule behind is a mood board. */
  function adSheet(){
    const ADS = MARKET.ads;
    return '<section class="po po-a3l">' + bed("circuit", "#a855f7", .55) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["PHASE 0", "SIX CREATIVES \u00b7 A3 LANDSCAPE", "PRINT AT 100%, MARGINS NONE"], "the campaign brief")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(ADS.lawShort) + ' \u00b7 ENGLISH ANCHOR \u00b7 VIETNAMESE SUBTITLE</div>'
      + '<h1 class="po-h" style="font-size:13mm">' + esc(ADS.title) + '</h1>'
      + '<div class="po-line">NO TEXT-HEAVY AI SLOP. SIX PICTURES, SIX IDEAS, ONE LAW.</div></div>'
      + '<div style="flex:0 0 96mm">' + asset("wave-loud") + '</div></div>'
      + '<div class="ad-grid">' + ADS.cards.map(c => '<div class="ad-card"><div class="ad-n">' + String(c[0]).padStart(2, "0") + '</div><div class="ad-t">' + esc(c[1]) + '</div><div class="ad-in">' + esc(c[2]) + '</div></div>').join("") + '</div>'
      + '<div class="ad-law"><b>' + esc(ADS.lawShort) + '</b>'
      + '<div class="ad-half">' + ADS.lawParts.map(p => '<div><b>' + esc(p[0]) + '</b><i>' + esc(p[1]) + '</i></div>').join("") + '</div>'
      + '<span>' + esc(ADS.why) + ' ' + esc(ADS.lawBan) + '</span></div>'
      + '<div class="bx-bar" style="margin-top:auto">WHERE THEY LAND: ' + esc(CODEX.pipeline.stages.map(s => s[0].replace("THE ", "")).join(" \u00b7 ")) + '</div>'
      + poFoot("ad-sheet", 1, 1, "THE LAW OF BILINGUAL HIERARCHY IS BRAND.021 \u2014 IT GOVERNS EVERY CREATIVE ON THIS SHEET",
          { motto: MARKET.motto, vn: MARKET.closingVn, ver: "PHASE 0 V" + CODEX.version }) + '</div></section>';
  }

  /* THE ENROLMENT PAGES \u2014 the landing page as paper. Diagnosis, intervention,
     offer: the order a stranger reads it in, one A3 each. */
  function enrolDiagnosis(){
    const D = MARKET.diagnose;
    return '<section class="po po-a3">' + bed("lattice", "#a855f7", .6) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE DIAGNOSIS", "BILINGUAL \u00b7 TWO LANGUAGES, ONE FAILURE", "PAGE 1 OF 3"], "before any promise")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(D.title) + '</div>'
      + '<h1 class="po-h">YOU ARE NOT<br>BROKEN.</h1>'
      + '<div class="po-line">YOUR METHOD WAS. \u00b7 ' + esc(D.titleVn) + '</div></div>'
      + '<div class="po-mark-solo">' + asset("mouse-chained") + '</div></div>'
      + '<div class="po-extra co-body">'
      + '<div class="mk-pillars">' + D.items.map(it => '<div class="mk-pillar">' + icon("alert") + '<b>' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></div>').join("") + '</div>'
      + '<div style="height:5mm"></div>'
      + '<div class="mk-quote">' + esc(D.lensNote) + '</div>'
      + '<div style="height:5mm"></div>'
      + '<div class="co-plate">' + shotPlate("mkt2-failure", "Transcribed from this slide \u2014 the failure named in both languages, and the chain drawn between them") + '</div>'
      + '</div>'
      + poFoot("enrol-1", 1, 3, D.read.toUpperCase(),
          { motto: MARKET.motto, vn: MARKET.closingVn, ver: "THE ENROLMENT PAGES V" + CODEX.version }) + '</div></section>';
  }
  function enrolIntervention(){
    const A = MARKET.architecture, L = MARKET.biology, R = CODEX.retention;
    return '<section class="po po-a3">' + bed("ember", "#dc9438", .56) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE INTERVENTION", "THE METHOD AND THE INFRASTRUCTURE", "PAGE 2 OF 3"], "what actually changes")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">THE 45/15 \u00b7 THE AI-PET \u00b7 THE 10-5-5-3</div>'
      + '<h1 class="po-h">ONE HOUR,<br>EVERY DAY.</h1>'
      + '<div class="po-line">' + esc(MARKET.hour.ratio) + '</div></div>'
      + '<div class="po-mark-solo">' + asset("dial45") + '</div></div>'
      + '<div class="po-extra co-body">'
      + hourBlock()
      + '<div style="height:5mm"></div>'
      + '<div class="mk-steps">' + A.method.map(m => '<div class="mk-step"><b>' + esc(m[0]) + '</b><span>' + esc(m[1]) + '</span></div>').join("") + '</div>'
      + '<div style="height:5mm"></div>'
      + frame('<div class="mk-days">' + L.days.map(d => '<div class="mk-day"><b>' + esc(d.replace("Day ", "")) + '</b><span>DAY</span></div>').join("") + '</div>'
          + '<div style="height:3mm"></div><div class="mk-sub" style="font-size:4mm">' + esc(L.points[1][1]) + '</div>'
          + '<div style="height:3mm"></div><div class="bx-dir">' + esc(R.leak) + '</div>'
          + '<div style="height:3mm"></div><div class="mk-sub" style="font-size:4mm">' + esc(R.facts[2][1]) + '</div>',
          { title:"WHEN WE COME BACK TO IT", icon:"repeat", meta:"G444.009 \u00b7 " + R.facts[1][0] })
      + '<div style="height:5mm"></div>'
      + '<div class="co-plate">' + shotPlate("mkt2-biology", "The memory case, from the sovereign's own slide") + '</div>'
      + '</div>'
      + poFoot("enrol-2", 2, 3, "COMPREHENSION IN, REFLEX OUT \u2014 AND THE SYSTEM COMES BACK FOR WHAT YOU FORGET",
          { motto: MARKET.motto, vn: MARKET.closingVn, ver: "THE ENROLMENT PAGES V" + CODEX.version }) + '</div></section>';
  }
  function enrolOffer(){
    const A = MARKET.architecture, PR = CODEX.proof, AU = CODEX.audit, M = MARKET;
    return '<section class="po po-a3">' + bed("lattice", "#a855f7", .58) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE OFFER", "THE PROOF \u00b7 THE COMPARISON \u00b7 THE AUDIT", "PAGE 3 OF 3"], "the ask")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(PR.title.toUpperCase()) + ' \u00b7 ' + esc(PR.line.toUpperCase()) + '</div>'
      + '<h1 class="po-h" style="font-size:13mm">STOP GUESSING.<br>START AUDITING.</h1>'
      + '<div class="po-line">' + esc(AU.q) + ' \u00b7 ' + esc(AU.minutes) + '</div></div>'
      + '<div style="flex:0 0 62mm">' + asset("edge") + '</div></div>'
      + '<div class="po-extra co-body">'
      + '<div class="mk-claim">' + PR.numbers.map(n => '<div><b>' + esc(n[0]) + '</b><span>' + esc(n[1]) + '</span></div>').join("") + '</div>'
      + '<div style="height:4mm"></div><div class="bx-bar">' + esc(PR.baseline) + '</div>'
      + '<div style="height:4mm"></div>'
      + '<div class="mk-compare-wrap" style="text-align:left">' + matrix(A.compare, { left:"TRADITIONAL CENTRES", right:"NET (TIGER PROTOCOL)" }) + '</div>'
      + '<div style="height:4mm"></div>'
      + '<div class="mk-steps">' + AU.steps.map((s, i) => '<div class="mk-step"><b>' + (i + 1) + '. ' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>').join("") + '</div>'
      + '<div style="height:4mm"></div>'
      + '<div class="mk-quote">' + esc(AU.truth) + ' ' + esc(AU.close) + '</div>'
      + '<div style="height:4mm"></div>'
      + '<div class="mk-offer">' + esc(M.offer) + ' \u00b7 ' + esc(AU.cta) + '</div>'
      + '<div style="height:5mm"></div>'
      + '<div class="co-plate">' + shotPlate("mkt2-architecture", "The method half of the offer, on one slide") + '</div>'
      + '</div>'
      + poFoot("enrol-3", 3, 3, "TWO MULTIPLES ARE PRINTED IN THE SOURCE (" + MARKET.protocol.holds + " HOLDS ONE) \u2014 THE DISAGREEMENT IS ON THE SHEET, NOT AVERAGED AWAY",
          { motto: MARKET.motto, vn: MARKET.closingVn, ver: "THE ENROLMENT PAGES V" + CODEX.version }) + '</div></section>';
  }
  function enrolmentPages(){ return [enrolDiagnosis(), enrolIntervention(), enrolOffer()]; }

  /* THE RUN READOUT \u2014 A4, and deliberately half blank. Five bands, four
     protocols, two laws, and ruled lines where the record goes. A run log that
     invents its own facts is a forgery, whatever it looks like (BRAND.013). */
  function readoutPage(){
    const RO = CODEX.readout, R = CODEX.retention;
    const rule = (label) => '<div class="co-rule"><span class="co-fill">' + esc(label) + '</span></div>';
    return '<section class="po po-a4">' + bed("hazard", "#e0473f", .38) + '<div class="po-vig"></div><div class="po-frame"></div>'
      + '<div class="po-pad">' + poTop(["THE CLASSIFIED READOUT", "A4 \u00b7 RUN LOG \u00b7 BLANK FOR THE PEN", "PRINT AT 100%"], "the run, as evidence")
      + '<div class="po-hero" style="flex:0 0 auto"><div class="po-hero-t">'
      + '<div class="po-kick">' + esc(RO.source) + '</div>'
      + '<h1 class="po-h" style="font-size:9mm">RUN 305</h1>'
      + '<div class="po-line" style="font-size:3.4mm">AGENT ____________ \u00b7 DATETIME ____________ \u00b7 SESSION TAG __________________</div></div>'
      + '<div style="flex:0 0 24mm">' + emblem("seal-444", { size:82 }) + '</div></div>'
      + '<div style="height:3mm"></div>'
      + '<div class="co-2col">'
      + frame('<div class="co-stack">' + RO.bands.map((b, i) => '<div class="co-band"><b>' + String(i + 1).padStart(2, "0") + ' \u00b7 ' + esc(b) + '</b><i>' + esc(i === 0 ? "what the system was doing when it broke" : i === 1 ? "what was read out, verbatim" : i === 2 ? "the narrowest path that fixed it" : i === 3 ? "what changed permanently" : "the one law the run produced") + '</i></div><div class="co-rule"></div>').join("") + '</div>',
          { title:"THE FIVE BANDS", icon:"terminal", meta:"the record, by hand" })
      + '<div class="co-rcol">'
      + frame('<div class="co-grid2">' + RO.protocols.map(p => '<div class="co-band"><b>' + esc(p[0]) + '</b><i>' + esc(p[1]) + '</i></div>').join("") + '</div>',
          { title:"THE PROTOCOLS", icon:"lock", meta:"from the run" })
      + '<div style="height:3mm"></div>'
      + frame('<div class="co-grid2">' + RO.laws.map(p => '<div class="co-band"><b>' + esc(p[0]) + '</b><i>' + esc(p[1]) + '</i></div>').join("") + '</div>',
          { title:"THE LAWS THE RUN PRODUCED", icon:"scale", meta:"two, and they outlive the run" })
      + '<div style="height:3mm"></div>'
      + frame('<div class="mk-sub" style="font-size:3.4mm">' + esc(R.clause[1]) + '</div>'
          + '<div style="height:2.4mm"></div><div class="bx-bar">NO STUDENT NAME, SCORE OR VAULT USERNAME APPEARS ON THIS SHEET OR IN THIS SYSTEM \u2014 BRAND.028</div>',
          { title:"THE CLOSING CLAUSE", icon:"alert", meta:"fail-closed" })
      + '</div></div>'
      + poFoot("run-readout", 1, 1, esc(RO.thesis).toUpperCase(),
          { motto: CODEX.stack.line, vn: MARKET.closingVn, ver: "READOUT V" + CODEX.version }) + '</div></section>';
  }

  const PRINT_ARTIFACTS = [
    { id:"wall-set", name:"THE WALL SET", page:"A3 portrait", size:[297, 420], file:"GOSPEL-444-WALL-SET-A3.html", preview:1,
      note:"Cover, one poster per law, the ladder, the matrix and the closing. Thirteen pages, one A3 each \u2014 the classroom wall, printed at 100%.",
      pages:() => [posterCover()].concat(GOSPEL444.laws.map((l, i) => posterLaw(l, i + 1, GOSPEL444.laws.length))).concat([posterModes(), posterMatrix(), posterClosing()]) },
    { id:"one-sheet", name:"THE ONE SHEET", page:"A3 portrait", size:[297, 420], file:"GOSPEL-444-ONE-SHEET-A3.html", preview:0,
      note:"All twelve laws in two columns, then the ladder and the matrix, on one page. This is the one that gets pinned above the desk.",
      pages:() => [chartPage()] },
    { id:"badge-sheet", name:"THE BADGE SHEET", page:"A4 portrait", size:[210, 297], file:"PRAIS-BADGE-SHEET-A4.html", preview:0,
      note:"Every emblem as a cut-out with its name, its ladder and what it means. Hand a rank to a student on paper, or stamp it on a certificate.",
      pages:() => [badgePage()] },
    { id:"certificate", name:"THE RANK CERTIFICATE", page:"A4 landscape", size:[297, 210], file:"PRAIS-RANK-CERTIFICATE-A4.html", preview:0,
      note:"A4 landscape. Composed only from a record you supply \u2014 a tier, or a diagnostic score \u2014 with the fields it does not have left blank for the pen.",
      pages:(o) => [certPage(o || {})] },
    { id:"marketing-set", name:"THE MARKETING SET", page:"A3 portrait", size:[297, 420], file:"PRAIS-MARKETING-SET-A3.html", preview:1,
      note:"Six A3 pages for the parent and the landing page: the claim, the three pillars, the 60% rule and the hour, the AI-PET, the proof, the offer. Built from the sovereign's hand-picked slides and the marks they produced.",
      pages:() => marketingPages() },
    { id:"method-card", name:"THE METHOD CARD", page:"A4 portrait", size:[210, 297], file:"PRAIS-METHOD-CARD-A4.html", preview:0,
      note:"One A4 a parent or a student takes home: the lesson's arithmetic (10-5-5-3), the daily 45/15 ratio, the days the AI-PET comes back, and the promise. The teaching methodology, on one page.",
      pages:() => [methodCard()] }
    ,
    { id:"ad-sheet", name:"THE AD SHEET", page:"A3 landscape", size:[420, 297], file:"PRAIS-AD-SHEET-A3.html", preview:0,
      note:"The six Phase 0 creatives as a working brief, with the Law of Bilingual Hierarchy printed on the same sheet as the ads it governs, and the four M2 stages underneath showing where each one lands. Built from the sovereign's ad-pipeline slide.",
      pages:() => [adSheet()] },
    { id:"enrolment", name:"THE ENROLMENT PAGES", page:"A3 portrait", size:[297, 420], file:"PRAIS-ENROLMENT-A3.html", preview:0,
      note:"Three A3 pages in reading order \u2014 the diagnosis, the intervention, the offer. This is the landing page as paper: the version a parent can hold while the phone is still open on the tab.",
      pages:() => enrolmentPages() },
    { id:"run-readout", name:"THE RUN READOUT", page:"A4 portrait", size:[210, 297], file:"PRAIS-RUN-READOUT-A4.html", preview:0,
      note:"A4 portrait, and deliberately half-blank: five bands, four protocols and two laws, with the record left as ruled lines for the hand. A run log that invents its own facts is a forgery, whatever it looks like \u2014 BRAND.013 and BRAND.028.",
      pages:() => [readoutPage()] }
  ];
  function artifactById(id){ return PRINT_ARTIFACTS.filter(a => a.id === id)[0] || null; }

  async function composeArtifact(id, opts){
    const a = artifactById(id);
    if(!a) throw new Error("no such artifact: " + id);
    const pages = a.pages(opts || {});
    let html = pages.join("\n");
    const re = /brand\/assets\/([a-z0-9-]+)\.webp\?v=\d+/g;
    let m; const ids = [];
    while((m = re.exec(html))) if(ids.indexOf(m[1]) < 0) ids.push(m[1]);
    for(const aid of ids){
      const d = await deckDataUrl(aid, a.size[0] > 290 ? 900 : 720);
      if(d) html = html.split(assetPath(aid)).join(d);
    }
    const left = /brand\/assets\/[a-z0-9-]+\.webp/.test(html) ? " <b>WARNING: a mark was not inlined</b>" : "";
    const doc = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n'
      + '<title>' + esc(a.name) + ' \u2014 GOSPEL 444 \u00b7 NET Academy</title>\n'
      + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
      + '<meta name="description" content="' + esc(a.note) + '">\n'
      + PRINT_FONTS + '\n<style>\n' + printGlobal(a.page) + '\n' + PRINT_SCOPE + '\n' + CHART_SCOPE + '\n' + MARKET_SCOPE + '\n' + CODEX_SCOPE + '\n' + css() + '\n</style>\n</head>\n<body>\n'
      + '<div class="po-toolbar po-noprint"><b>' + esc(a.name) + '</b>'
      + '<span>' + esc(a.page) + ' \u00b7 ' + pages.length + (pages.length === 1 ? " PAGE" : " PAGES") + ' \u00b7 PRINT AT 100%, MARGINS NONE, BACKGROUND GRAPHICS ON</span>'
      + '<button onclick="window.print()">Print \u25b8</button></div>\n'
      + '<div class="po-set">\n' + html + '\n</div>\n'
      + '<div class="po-help po-noprint">' + esc(a.note) + ' The marks are inlined and nothing is fetched but the four typefaces; this file opens from a phone.' + left + '</div>\n'
      + '</body>\n</html>';
    return { html: doc, file: a.file, kb: Math.round(doc.length / 1024), artifact: a };
  }

  async function downloadArtifact(id, opts){
    const r = await composeArtifact(id, opts);
    const url = URL.createObjectURL(new Blob([r.html], { type:"text/html" }));
    const a = document.createElement("a");
    a.href = url; a.download = r.file;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return r;
  }
  async function openArtifact(id, opts){
    const r = await composeArtifact(id, opts);
    const url = URL.createObjectURL(new Blob([r.html], { type:"text/html" }));
    const w = window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return { opened: !!w, kb: r.kb, file: r.file };
  }

  function printThumb(page, wmm, hmm, target){
    const s = (target || 196) / (wmm * MM);
    return '<div class="pr-thumb" style="width:' + Math.round(wmm * MM * s) + 'px;height:' + Math.round(hmm * MM * s) + 'px">'
      + '<div class="pr-thumb-in" style="transform:scale(' + s.toFixed(4) + ')">' + page + '</div></div>';
  }
  function printSection(){
    ensurePrint();
    return '<div class="bx-bar" style="margin-bottom:9px">' + PRINT_ARTIFACTS.length + ' ARTIFACTS <span class="bx-sep">//</span> ONE OPENABLE .html EACH <span class="bx-sep">//</span> MARKS INLINED, NOTHING FETCHED BUT THE TYPEFACES <span class="bx-sep">//</span> THE ARTWORK IS THE SYSTEM\u2019S OWN</div>'
      + '<div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">'
      + PRINT_ARTIFACTS.map(a => {
        let thumb = "";
        try{ thumb = printThumb(a.pages({})[a.preview || 0], a.size[0], a.size[1], 208); }catch(err){ thumb = ""; }
        return '<div class="bx-cell" style="text-align:left;background:#0b0714">'
          + '<div style="display:flex;justify-content:center">' + thumb + '</div>'
          + '<div class="bx-cell-name" style="color:var(--bx-ancient);font-size:11px;margin-top:9px">' + esc(a.name) + '</div>'
          + '<div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px">' + esc(a.note) + '</div>'
          + '<div class="bx-bar" style="margin-top:6px">' + esc(a.id) + ' <span class="bx-sep">//</span> ' + esc(a.page) + ' <span class="bx-sep">//</span> ' + esc(a.file) + '</div>'
          + '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button class="ci-act" data-po="' + a.id + '">Export \u25b8</button><button class="ci-act" data-po-open="' + a.id + '">Open \u25b8</button></div>'
          + '</div>';
      }).join("") + '</div>'
      + '<div class="bx-plate" style="margin-top:10px"><div class="bx-plate-top">' + icon("print") + '<b>HOW IT PRINTS</b></div><div class="bx-plate-body">'
      + 'Open the exported file and press <b>Print</b>: it carries its own <span class="bx-tag">@page</span> rule, so page size and margins are already set \u2014 choose <b>Background graphics: on</b> and do not let the browser \u201cfit to page\u201d. The certificate is composed only from a record you give it (<b>tier</b>, or <b>mode</b> + <b>score</b>); anything you leave out is printed as a blank rule for the pen, because a certificate that invents its own claim is a forgery \u2014 <b>BRAND.013</b>.</div></div>';
  }

  function panel(opts){
    opts = opts || {};
    ensure();
    return '<div class="bx-panel">'
      + (opts.compact ? "" : '<div class="bx-hero bx-scan" style="margin-bottom:12px">' + asset("roar", { style:"width:100%;height:250px;object-fit:cover;object-position:50% 30%;display:block" }) + '<div class="bx-hero-cap">PrAis \u00b7 THE TIGER PROTOCOL \u00b7 brand system v' + VERSION + ' \u00b7 GOSPEL 444 V' + GOSPEL444.version + '</div></div>')
      + frame('<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' + lockup({ size:"46px" }) + '<div style="flex:1;min-width:200px">' + bar(["SYSTEM STATUS: OPERATIONAL", "BRAND::" + VERSION, "ASSETS::" + ASSETS.length, "MARKS::" + ASSETS.filter(v => !v.variant && !v.shot).length, "STILLS::" + ASSETS.filter(v => v.shot).length, "ICONS::" + iconNames().length, "EMBLEMS::" + EMBLEMS.length, "ARTIFACTS::" + PRINT_ARTIFACTS.length, "GOSPEL::V" + GOSPEL444.version, "CODEX::" + CODEX.pages + " PAGES", "SOURCE::9 DECKS + 11 SLIDES"]) + '</div></div>', { title:"THE IDENTITY", icon:"seal", meta:"BRAND." + VERSION })
      + '<div style="height:12px"></div>' + frame(logoSection(), { title:"THE LOGOTYPE \u2014 THE PRAIS APEX", icon:"seal", meta:"BRAND.029" })
      + '<div style="height:12px"></div>' + frame(paletteSection(), { title:"PALETTE — SYSTEM \u00b7 REWARD \u00b7 GROUND, AND THE COURT'S EXTENSION", icon:"compass", meta:"BRAND.002" })
      + '<div style="height:12px"></div>' + frame(iconSection(), { title:"ICONOGRAPHY", icon:"grid", meta:iconNames().length + " MARKS" })
      + '<div style="height:12px"></div>' + frame(assetSection(), { title:"THE MARKS — CUT FROM THE SOVEREIGN'S OWN DECKS", icon:"image", meta:ASSETS.filter(x => !x.variant && !x.shot).length + " MARKS \u00b7 " + ASSETS.filter(x => !x.variant && !x.shot).length + " FILES" })
      + '<div style="height:12px"></div>' + frame(doctrineSection(), { title:"GOSPEL 444 — THE DOCTRINE", icon:"flame", meta:"AMENDMENT IV \u00b7 PROPOSED" })
      + '<div style="height:12px"></div>' + frame(modeSection(), { title:"THE MODE LADDER &amp; THE MATRIX", icon:"gauge", meta:"G444.003 \u00b7 G444.010" })
      + '<div style="height:12px"></div>' + frame(deckSection(), { title:"THE DECK — THE DOCTRINE AS SLIDES", icon:"scanline", meta:GOSPEL444.slides.length + " SLIDES \u00b7 EXPORTABLE" })
      + '<div style="height:12px"></div>' + frame(emblemSection(), { title:"THE EMBLEMS \u2014 RANKS, MODES AND THE SEALS", icon:"medal", meta:EMBLEMS.length + " EMBLEMS \u00b7 VECTOR" })
      + '<div style="height:12px"></div>' + frame(patternSection(), { title:"THE PATTERNS \u2014 THE BEDS", icon:"grid", meta:Object.keys(PATTERNS).length + " TILES" })
      + '<div style="height:12px"></div>' + frame(printSection(), { title:"THE PRINT ROOM \u2014 THE ARTWORK, AS FILES", icon:"print", meta:PRINT_ARTIFACTS.length + " ARTIFACTS \u00b7 A3 / A4" })
      + '<div style="height:12px"></div>' + frame(marketSection(), { title:"THE MARKETING REGISTER \u2014 WHAT WE SAY", icon:"target", meta:"AMENDMENT VI \u00b7 PROPOSED" })
      + '<div style="height:12px"></div>' + frame(marketSection2(), { title:"THE MARKETING REGISTER, SECOND BATCH", icon:"target", meta:"AMENDMENT VII \u00b7 PROPOSED" })
      + '<div style="height:12px"></div>' + frame(codexSection(), { title:"THE PHOENIX RISING CODEX \u2014 WHAT THE SOVEREIGN HOLDS", icon:"seal", meta:"AMENDMENT VII \u00b7 PROPOSED" })
      + '<div style="height:12px"></div>' + frame(adsSection(), { title:"PHASE 0 \u2014 THE CREATIVE", icon:"target", meta:"SIX ADS \u00b7 ONE LAW" })
      + '<div style="height:12px"></div>' + frame(landingSection(), { title:"THE LANDING PAGE \u2014 THE REGISTER IN READING ORDER", icon:"globe", meta:"EIGHT BANDS" })
      + '<div style="height:12px"></div>' + frame(vaultSection(), { title:"THE MARKETING VAULT \u2014 EVERY PICTURE THIS SYSTEM SHIPS", icon:"vault", meta:ASSETS.length + " FILES" })
      + '<div style="height:12px"></div>' + frame(hudSection(), { title:"HUD CHROME", icon:"corner", meta:"BRAND.004" })
      + '<div style="height:12px"></div>' + frame(typeSection(), { title:"TYPE", icon:"print", meta:"LESSON.009" })
      + '<div style="height:12px"></div>' + frame(snipSection(), { title:"HOW TO USE IT", icon:"terminal", meta:"API" })
      + '</div>';
  }

  /* the desk room inside ◈ Phoenix Generators → MARKETING. The panel renders
     into #brandPanel, NOT into #brandDesk — the desk's own bar (and its way
     back to the division grid) must survive the mount. */
  function mountDesk(){
    ensure();
    const host = document.getElementById("brandPanel") || document.getElementById("brandDesk");
    if(!host) return false;
    host.innerHTML = panel({});
    host.querySelectorAll(".bx-copy").forEach(b => {
      b.onclick = () => {
        const t = b.getAttribute("data-copy");
        try{ navigator.clipboard.writeText(t); b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy URL", 1400); }
        catch(e){ b.textContent = t; }
      };
    });
    const ex = document.getElementById("bxDeckExport");
    if(ex) ex.onclick = async () => {
      const note = document.getElementById("bxDeckNote");
      if(note) note.textContent = "composing the deck\u2026";
      try{
        const html = await buildDeck();
        const url = URL.createObjectURL(new Blob([html], { type:"text/html" }));
        const a = document.createElement("a");
        a.href = url; a.download = "GOSPEL-444-PROTOCOL-V" + GOSPEL444.version + ".html";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        if(note) note.textContent = Math.round(html.length/1024) + " KB \u00b7 marks inlined \u00b7 downloaded";
      }catch(e){ if(note) note.textContent = "export failed: " + e.message; }
    };
    const ex2 = document.getElementById("bxDeck2Export");
    if(ex2) ex2.onclick = async () => {
      const note = document.getElementById("bxDeck2Note");
      if(note) note.textContent = "composing the codex deck\u2026";
      try{
        const html = await buildCodexDeck();
        const url = URL.createObjectURL(new Blob([html], { type:"text/html" }));
        const a = document.createElement("a");
        a.href = url; a.download = "PHOENIX-RISING-CODEX-V" + CODEX.version + ".html";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        if(note) note.textContent = Math.round(html.length/1024) + " KB \u00b7 marks inlined \u00b7 downloaded";
      }catch(e){ if(note) note.textContent = "export failed: " + e.message; }
    };
    const busy = async (btn, work, label) => {
      const old = btn.textContent;
      btn.disabled = true; btn.textContent = "composing\u2026";
      try{ const r = await work(); btn.textContent = label + " \u00b7 " + (r && r.kb ? r.kb + " KB" : "done"); }
      catch(e){ btn.textContent = "failed: " + e.message; }
      setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 3200);
    };
    host.querySelectorAll("[data-po]").forEach(b => {
      b.onclick = () => busy(b, () => downloadArtifact(b.getAttribute("data-po")), "exported");
    });
    host.querySelectorAll("[data-po-open]").forEach(b => {
      b.onclick = () => busy(b, () => openArtifact(b.getAttribute("data-po")), "opened");
    });
    return true;
  }

  /* ==========================================================================
     EXPORTS
     ========================================================================== */
  window.ObiBrand = {
    VERSION, BASE, PALETTE, TIERS, MODES, GOSPEL444, MARKET, CODEX, APEX, ASSETS, ICONS,
    icon, iconBody, iconViewBox, has, iconNames, asset, assetPath, assetDataUrl, assetDataUrlSync, deckDataUrl, srcLabel,
    bar, frame, plate, pill, crest, watermark, lockup,
    terminal, directive, flowchain, chips, modeCard, modes, matrix, modeOf, modeBadge,
    EMBLEMS, emblemNames, emblemOf, emblem, emblemBand, emblemSection,
    PATTERNS, patternUrl, patternCss, patternSection,
    deck: deckSlides, deckSlides, deckSection, buildDeck, slide,
    codexDeckSlides, codexSlide, deck2Section, buildCodexDeck,
    PRINT_SCOPE, CHART_SCOPE, MARKET_SCOPE, CODEX_SCOPE, PRINT_ARTIFACTS, artifactById, composeArtifact, downloadArtifact, openArtifact,    printSection, printThumb, ensurePrint, posterCover, posterLaw, posterModes, posterMatrix, posterClosing, chartPage, badgePage, certPage,
    APEX, logoSection, VAULT_GROUPS, vaultSection, vaultGroup, vaultCell,
    marketSection, marketSection2, codexSection, adsSection, landingSection, shotCell, shotGrid, marketingPages, methodCard, mktCover, mktPillars, mktMethod, mktAipet, mktAdvantage, mktClosing, pillarRow, hourBlock, shotPlate,
    adSheet, enrolmentPages, enrolDiagnosis, enrolIntervention, enrolOffer, readoutPage,
    paletteSection, iconSection, assetSection, hudSection, typeSection, snipSection, doctrineSection, modeSection, lawCard,
    css, ensure, upgrade, panel, mountDesk, esc, sprite
  };

  /* an inline <symbol> sheet, so plain HTML anywhere in the station can say
     <svg class="bx-ic"><use href="#obi-i-shield"/></svg> without calling JS.
     (Exported lesson files cannot use it — they inline via icon().) */
  function sprite(){
    if(document.getElementById("obi-brand-sprite")) return;
    const s = document.createElement("div");
    s.id = "obi-brand-sprite";
    s.setAttribute("aria-hidden", "true");
    s.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    s.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">'
      + iconNames().map(n => '<symbol id="obi-i-' + n + '" viewBox="' + iconViewBox(n) + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + iconBody(n) + '</symbol>').join("")
      + '</svg>';
    document.body.appendChild(s);
  }

  try{ ensure(); sprite(); }catch(e){}
})();
