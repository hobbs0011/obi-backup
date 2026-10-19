/* ============================================================================
   NET — THE PLACEMENT ENGINE.
   A real, adaptive English placement test that runs entirely in the browser:
   no signup, no server, no account. It measures, it says what it measured, and
   it hands the student a plan.

   HOW IT MEASURES (stated plainly, because a test that hides its method is a
   horoscope):
     · A banded item bank, A1 → C2, six items per band, tagged by skill.
     · A staircase: start at B1. Correct → the next item is one band harder;
       wrong → one band easier. Floors and ceilings are real (A1 / C2).
     · It stops when the band stabilises (six consecutive decisions inside one
       band with at least three items answered there) or at 24 items.
     · The CEFR estimate is the highest band answered at ≥60% with at least
       three items answered — never the single lucky item.
     · Listening is spoken aloud by the device's own speech engine. That is a
       real listening task, and the page says what voice it used.
   The engine will not report a level it could not place: below 3 answered
   items in a band, that band is listed as UNPLACED.
   ========================================================================== */
(function () {
  "use strict";

  var BANDS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  var SKILLS = ["grammar", "vocabulary", "usage", "reading"];
  var MAX_ITEMS = 24;

  /* ------------------------------------------------------------ item bank
     Every item is written for this bank, has one defensible answer, and
     carries the reason — which is what the student reads at the end. */
  var BANK = [
    /* ---- A1 ---- */
    { id: "a1g1", band: 0, skill: "grammar", stem: "She ___ a teacher at the primary school.", opts: ["is", "are", "am", "be"], ans: 0, why: "Third person singular takes <b>is</b>." },
    { id: "a1g2", band: 0, skill: "grammar", stem: "___ you like coffee?", opts: ["Do", "Are", "Does", "Is"], ans: 0, why: "Present simple questions with <i>you</i> take the auxiliary <b>do</b>." },
    { id: "a1v1", band: 0, skill: "vocabulary", stem: "I'm thirsty. I'd like ___ water.", opts: ["some", "any", "many", "an"], ans: 0, why: "<b>some</b> in a positive request; <i>any</i> belongs in negatives and questions." },
    { id: "a1v2", band: 0, skill: "vocabulary", stem: "My brother's son is my ___.", opts: ["nephew", "cousin", "uncle", "niece"], ans: 0, why: "A brother's son is a <b>nephew</b>; a brother's daughter is a niece." },
    { id: "a1u1", band: 0, skill: "usage", stem: "Someone says “Thank you.” The natural reply is:", opts: ["You're welcome.", "I am fine.", "No, thanks.", "Please."], ans: 0, why: "“You're welcome” is the standard response to thanks in every register." },
    { id: "a1r1", band: 0, skill: "reading", stem: "A sign reads: “OPEN 8AM–6PM · CLOSED SUNDAY”.<br>When is it closed?", opts: ["Sunday", "Saturday", "At 6pm", "At 8am"], ans: 0, why: "The sign says CLOSED SUNDAY." },

    /* ---- A2 ---- */
    { id: "a2g1", band: 1, skill: "grammar", stem: "I ___ to Da Nang last year.", opts: ["went", "go", "have gone", "am going"], ans: 0, why: "A finished time (<i>last year</i>) takes the past simple: <b>went</b>." },
    { id: "a2g2", band: 1, skill: "grammar", stem: "This is ___ book I told you about.", opts: ["the", "a", "an", "—"], ans: 0, why: "A specific book already mentioned takes <b>the</b>." },
    { id: "a2v1", band: 1, skill: "vocabulary", stem: "The opposite of “expensive” is ___.", opts: ["cheap", "rich", "costly", "dear"], ans: 0, why: "<b>cheap</b> is the opposite of expensive; <i>dear</i> is a synonym of it in British English." },
    { id: "a2v2", band: 1, skill: "vocabulary", stem: "He was ___ after the long flight.", opts: ["exhausted", "exhausting", "exhaust", "exhausted from"], ans: 0, why: "People feel <b>exhausted</b>; things are exhausting." },
    { id: "a2u1", band: 1, skill: "usage", stem: "You didn't hear what someone said. The most natural thing to say is:", opts: ["Sorry, could you say that again?", "Repeat.", "What?", "I don't understand nothing."], ans: 0, why: "Polite, complete, and it keeps the conversation open. “What?” is a demand; “Repeat.” is an order." },
    { id: "a2r1", band: 1, skill: "reading", stem: "“The meeting has been moved from Monday to Wednesday.”<br>When is the meeting now?", opts: ["Wednesday", "Monday", "It was cancelled", "Both days"], ans: 0, why: "<i>Moved from X to Y</i> means Y is the new date." },

    /* ---- B1 ---- */
    { id: "b1g1", band: 2, skill: "grammar", stem: "I've lived here ___ 2019.", opts: ["since", "for", "from", "during"], ans: 0, why: "<b>since</b> marks a starting point; <i>for</i> takes a length of time." },
    { id: "b1g2", band: 2, skill: "grammar", stem: "If I ___ more time, I'd learn another language.", opts: ["had", "have", "would have", "will have"], ans: 0, why: "The second conditional: <b>If + past simple</b>, would + infinitive." },
    { id: "b1v1", band: 2, skill: "vocabulary", stem: "The report ___ several important points.", opts: ["covers", "says about", "speaks", "tells"], ans: 0, why: "A document <b>covers</b> points. <i>Says about</i> is not English; <i>speaks</i> and <i>tells</i> need a person." },
    { id: "b1v2", band: 2, skill: "vocabulary", stem: "We need to ___ a decision by Friday.", opts: ["make", "do", "take", "give"], ans: 0, why: "<b>make</b> a decision — the standard collocation." },
    { id: "b1u1", band: 2, skill: "usage", stem: "A client asks something you don't know. The strongest professional reply is:", opts: ["That's a fair question — let me check and come back to you by 4pm.", "Sorry, my English is bad.", "I don't know.", "Maybe someone else knows."], ans: 0, why: "It answers, it commits to a time, and it keeps your authority. The other three hand your authority away — the Apology Reflex the doctrine names." },
    { id: "b1r1", band: 2, skill: "reading", stem: "“Applications close 30 June. Late entries will not be considered.”<br>The rule is:", opts: ["final", "a suggestion", "flexible for members", "changed on 30 June"], ans: 0, why: "“Will not be considered” closes the door — it is final." },

    /* ---- B2 ---- */
    { id: "b2g1", band: 3, skill: "grammar", stem: "By the time we arrived, the film ___.", opts: ["had started", "has started", "started", "was starting"], ans: 0, why: "<b>By the time</b> + past sets an earlier event in the past perfect." },
    { id: "b2g2", band: 3, skill: "grammar", stem: "She's used to ___ under pressure.", opts: ["working", "work", "worked", "works"], ans: 0, why: "<i>Be used to</i> takes an -ing form." },
    { id: "b2v1", band: 3, skill: "vocabulary", stem: "The proposal was ___ on the grounds that it was too costly.", opts: ["rejected", "refused", "denied", "declined"], ans: 0, why: "A proposal is <b>rejected</b>. You refuse an offer, deny a claim, decline an invitation." },
    { id: "b2v2", band: 3, skill: "vocabulary", stem: "Sales ___ sharply in the third quarter.", opts: ["dipped", "dropped down", "fell down", "descended"], ans: 0, why: "<b>Dipped</b> is the idiomatic fall for figures. <i>Drop</i> and <i>fall</i> are not followed by <i>down</i> in this use." },
    { id: "b2u1", band: 3, skill: "usage", stem: "In a meeting you disagree with your manager. The strongest move is:", opts: ["I see it differently — here's the data.", "I'm not sure, maybe you're right.", "No, that's wrong.", "I don't know, sorry."], ans: 0, why: "Disagreement with evidence and no apology. It is polite and it is not weak." },
    { id: "b2r1", band: 3, skill: "reading", stem: "“The scheme, which was piloted in 2023, has since been rolled out nationally.”<br>What happened first?", opts: ["It was piloted", "It went national", "It was cancelled", "It was reviewed"], ans: 0, why: "<i>Since</i> points back at the pilot as the earlier event." },

    /* ---- C1 ---- */
    { id: "c1g1", band: 4, skill: "grammar", stem: "Not until the audit was complete ___ the true scale of the loss.", opts: ["did we understand", "we understood", "we did understand", "understood we"], ans: 0, why: "A negative fronted adverbial forces inversion: <b>did we understand</b>." },
    { id: "c1g2", band: 4, skill: "grammar", stem: "___ for her intervention, the deal would have collapsed.", opts: ["Had it not been", "If it wasn't", "Were it not", "Unless it had been"], ans: 0, why: "The third conditional inverted: <b>Had it not been for</b> + would have." },
    { id: "c1v1", band: 4, skill: "vocabulary", stem: "The findings ___ the assumption that the market was saturated.", opts: ["undermine", "underwrite", "undergo", "underpin"], ans: 0, why: "<b>Undermine</b> = weaken. <i>Underpin</i> means the opposite." },
    { id: "c1v2", band: 4, skill: "vocabulary", stem: "The chairman's remarks were widely ___ as a tacit admission of failure.", opts: ["construed", "constructed", "constituted", "consulted"], ans: 0, why: "To <b>construe</b> something as X = to interpret it that way." },
    { id: "c1u1", band: 4, skill: "usage", stem: "Your team delivered late. The best close with an executive is:", opts: ["We missed the date. Here's what broke and what changes now.", "It wasn't really our fault.", "We tried our best.", "Sorry, I can't explain it properly."], ans: 0, why: "Own the miss, name the cause, name the fix. Executives forgive a delay; they do not forgive a story." },
    { id: "c1r1", band: 4, skill: "reading", stem: "“Far from settling the debate, the study gave fresh ammunition to both camps.”<br>The study:", opts: ["intensified the disagreement", "ended the disagreement", "was ignored", "supported one side only"], ans: 0, why: "<i>Far from settling</i> signals the opposite of resolution." },

    /* ---- C2 ---- */
    { id: "c2g1", band: 5, skill: "grammar", stem: "Hardly ___ the room when the shouting began.", opts: ["had he entered", "he had entered", "did he enter", "he entered"], ans: 0, why: "Fronted <i>hardly</i> takes inversion with the past perfect: <b>had he entered</b>." },
    { id: "c2g2", band: 5, skill: "grammar", stem: "The minister's statement, ___ it was meant to clarify matters, only deepened the confusion.", opts: ["much as", "as much", "so much", "very much"], ans: 0, why: "Concessive <b>much as</b> = although. It concedes the intent and contradicts the effect." },
    { id: "c2v1", band: 5, skill: "vocabulary", stem: "His apology was so ___ that nobody believed a word of it.", opts: ["fulsome", "abundant", "plentiful", "lavish"], ans: 0, why: "<b>Fulsome</b> praise or apology is excessive to the point of insincerity — the word carries the sneer." },
    { id: "c2v2", band: 5, skill: "vocabulary", stem: "Little ___ that the scheme would unravel so quickly.", opts: ["did they suspect", "they suspected", "they did suspect", "suspected they"], ans: 0, why: "Fronted negative <i>little</i> forces inversion: <b>did they suspect</b>." },
    { id: "c2u1", band: 5, skill: "usage", stem: "You must tell a client their deadline is impossible. The best opening is:", opts: ["The date as it stands won't work — here are two that will.", "Unfortunately, that is very difficult for us.", "We'll try our best.", "I'm afraid I don't know enough to say."], ans: 0, why: "It refuses the date, not the client, and it arrives with alternatives. Vague difficulty reads as incompetence." },
    { id: "c2r1", band: 5, skill: "reading", stem: "“For all his protestations of humility, he was plainly angling for the top job.”<br>The speaker implies he:", opts: ["was pursuing the job while denying it", "was genuinely modest", "had refused the job", "was leaving the company"], ans: 0, why: "<i>For all his protestations</i> dismisses the denials; <i>angling for</i> is the pursuit." }
  ];

  /* Listening items — one per band. Each is spoken by the device's own voice;
     the script is shown on the result card so the task is auditable. */
  var LISTENING = [
    { id: "l1", band: 0, skill: "listening", script: "The shop opens at nine and closes at six. It's closed on Sunday.", stem: "What time does the shop open?", opts: ["Nine", "Six", "Ten", "Seven"], ans: 0, why: "“opens at nine”." },
    { id: "l2", band: 1, skill: "listening", script: "I'll meet you outside the café at half past seven.", stem: "What time are they meeting?", opts: ["7:30", "7:00", "6:30", "8:30"], ans: 0, why: "“half past seven” = 7:30." },
    { id: "l3", band: 2, skill: "listening", script: "The flight is delayed by two hours, so boarding will now start at four fifteen.", stem: "When does boarding start?", opts: ["4:15", "2:15", "6:15", "4:50"], ans: 0, why: "“boarding will now start at four fifteen”." },
    { id: "l4", band: 3, skill: "listening", script: "I'd have taken the job if they'd offered more flexibility on the hours.", stem: "Why didn't the speaker take the job?", opts: ["The hours weren't flexible enough", "The salary was too low", "The company moved abroad", "They were never offered it"], ans: 0, why: "The third conditional names one missing condition: flexibility on the hours." },
    { id: "l5", band: 4, skill: "listening", script: "The board's decision, whatever its merits, has left the rank and file thoroughly demoralised.", stem: "How do the staff feel?", opts: ["Demoralised", "Delighted", "Indifferent", "Angry with the board and organised"], ans: 0, why: "The speaker states it: thoroughly demoralised." },
    { id: "l6", band: 5, skill: "listening", script: "For all his protestations of humility, he was plainly angling for the top job.", stem: "What does the speaker imply?", opts: ["He wanted the top job and denied it", "He was truly humble", "He had refused the job", "He was retiring"], ans: 0, why: "The concessive clause dismisses the denials." }
  ];

  /* One passage, three questions — the reading block, at C1. */
  var PASSAGE = {
    title: "Why the brain needs 60%",
    band: 4,
    text: "Language learners are usually told to attack the unknown: look up every new word, underline every unfamiliar structure, and leave nothing unparsed. The advice feels rigorous, and it is the fastest way to stop learning. Comprehension research points the other way. A reader or listener acquires most quickly when roughly six words in ten are already familiar — enough to hold the thread, enough that the remaining four can be inferred from context. Push the unknown share much higher and the brain abandons meaning for decoding: the reader translates word by word, holds the sentence in working memory, and by the end of it has understood nothing and remembers less. The practical consequence is counter-intuitive. Fluency is not built by spending your study hour on the material that defeats you. It is built by spending it on material that mostly makes sense, and letting the minority of new language arrive carried by the majority you already own.",
    qs: [
      { id: "p1", skill: "reading", band: 4, stem: "What is the passage's main claim?", opts: ["Mostly-comprehensible material produces faster acquisition than difficulty-first study.", "Looking up every word is the fastest route to accuracy.", "Reading is more effective than listening for vocabulary.", "Working memory cannot hold a full sentence."], ans: 0, why: "The passage argues for comprehensible input and against parsing everything." },
      { id: "p2", skill: "reading", band: 4, stem: "According to the passage, what happens when the unknown share is too high?", opts: ["The brain switches from meaning to decoding.", "The learner remembers more vocabulary.", "Comprehension improves with effort.", "The learner gives up entirely."], ans: 0, why: "“the brain abandons meaning for decoding” — stated directly." },
      { id: "p3", skill: "reading", band: 4, stem: "The word “counter-intuitive” signals that the conclusion:", opts: ["contradicts the obvious approach", "is widely rejected by researchers", "requires expensive equipment", "applies only to children"], ans: 0, why: "It marks a result that runs against the intuitive (effort-maximising) method." }
    ]
  };

  /* ------------------------------------------------------------- the plan
     The 45/15 prescription, keyed to the measured level. This is the doctrine
     (G444.007) applied to a real score. */
  var PLAN = {
    A1: {
      headline: "You are at the start line — and the start line is the best place on the track.",
      input: ["15–20 minutes of slow, subtitled input a day: children's cartoons, graded vlogs, songs you already know in Vietnamese.", "A 200-word core list in full sentences, not isolated words — say each one aloud as you read it."],
      output: ["5 minutes of naming: point at the room around you and name ten things out loud, in sentences.", "Shadowing: play one sentence, pause, copy the rhythm exactly — not the words, the music."],
      target: "By week four: 30 seconds of unbroken spoken English about your own day."
    },
    A2: {
      headline: "You can survive a conversation. Now we make you comfortable in one.",
      input: ["25 minutes of B1 podcasts and YouTube with subtitles switched on for the first pass, off for the second.", "Collocations, not word lists: 'make a decision', 'take a risk', 'get the point'."],
      output: ["8 minutes of self-talk out loud on one fixed topic a day — your job, your street, your weekend.", "One recorded 60-second monologue a week, listened back once, transcript written by hand."],
      target: "By week four: two minutes of spontaneous speech with no translation pause over eight seconds."
    },
    B1: {
      headline: "You understand the room. The Tiger Protocol puts you in it.",
      input: ["35 minutes of native-speed input you genuinely enjoy: a topic you would read in Vietnamese anyway.", "Note the four-word chunks natives use constantly — 'to be fair', 'as it happens', 'the thing is'."],
      output: ["12 minutes of high-pressure output: describe an opinion, defend it, then attack your own argument.", "Answer in full sentences with the connector first: 'That's true, but…', 'The point is…'"],
      target: "By week four: a five-minute unscripted opinion with no apology in it."
    },
    B2: {
      headline: "You are fluent enough to be dangerous. Now we remove the hedge.",
      input: ["40 minutes of register study: how a project manager, a barrister and a radio host each say the same thing.", "Read for the argument, not the words — after each page, write the author's claim in one sentence."],
      output: ["15 minutes of adversarial practice: state a position, then answer three hostile questions without softening it.", "Kill the hedges out loud: 'I'm not sure but maybe…' → 'I disagree, and here's why.'"],
      target: "By week four: command a 15-minute meeting segment and hold the room when interrupted."
    },
    C1: {
      headline: "You handle English. What is left is presence, precision and pace.",
      input: ["45 minutes of expert-domain input in your own field — English, not simplified English.", "Collect the sentences that do work: concessions, understatement, the well-placed refusal."],
      output: ["15 minutes of high-intensity delivery work: say it in half the words, then say it again faster.", "Record and grade yourself on volume, pace and eye contact — the three inputs of the Tiger Voice."],
      target: "By week four: deliver a two-minute unwritten brief to a hostile room and close it."
    },
    C2: {
      headline: "You are at the ceiling of the test. The work now is ownership.",
      input: ["45 minutes of full-speed, unadapted material: debates, panel discussions, comedy — where the meaning is in the delivery.", "Study the rhetorical moves: the pivot, the concession-and-turn, the deliberate silence."],
      output: ["15 minutes of performance: take a position in one minute, hold it through interruption, land it in twenty seconds.", "Public reps — teach something to a real audience weekly, in English, unscripted."],
      target: "By week four: own an unfamiliar room in English, and be the person others quote."
    }
  };

  /* --------------------------------------------------------------- helpers */
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  /* Options are shuffled per sitting so the answer is never "always the first".
     The correct option keeps its identity via its text. */
  function present(item) {
    var correctText = item.opts[item.ans];
    var opts = shuffle(item.opts);
    return {
      id: item.id, band: item.band, skill: item.skill, stem: item.stem, why: item.why,
      script: item.script || null,
      opts: opts, ans: opts.indexOf(correctText)
    };
  }

  /* ------------------------------------------------------------- the session */
  function create(host, opts) {
    opts = opts || {};
    var state = {
      i: 0, band: 2, answered: [], used: {},
      streak: 0, lastBand: null, decisions: [], done: false,
      startedAt: Date.now(), voice: null, items: []
    };

    function pick(band, wantSkill) {
      var all = BANK.concat(LISTENING).filter(function (it) { return !state.used[it.id]; });
      if (!all.length) return null;
      var sameSkill = all.filter(function (it) { return it.band === band && (!wantSkill || it.skill === wantSkill); });
      var sameBand = all.filter(function (it) { return it.band === band; });
      var pool = sameSkill.length ? sameSkill : sameBand;
      if (!pool.length) {
        /* The band is exhausted. Take the NEAREST band that still has an item —
           never an arbitrary one, because a staircase that can jump from B2 to
           A1 mid-sitting stops measuring anything. */
        var best = Infinity;
        all.forEach(function (it) { best = Math.min(best, Math.abs(it.band - band)); });
        pool = all.filter(function (it) { return Math.abs(it.band - band) === best; });
      }
      var it = pool[Math.floor(Math.random() * pool.length)];
      state.used[it.id] = 1;
      return it;
    }

    /* Skill coverage: prefer a skill the sitting has under-sampled. */
    function wantSkill() {
      var counts = {};
      state.answered.forEach(function (a) { counts[a.skill] = (counts[a.skill] || 0) + 1; });
      var best = null, bestN = 99;
      SKILLS.concat(["listening"]).forEach(function (s) {
        var n = counts[s] || 0;
        if (n < bestN) { bestN = n; best = s; }
      });
      return best;
    }

    /* Listening appears at least three times across a sitting, at the current
       band. It is forced when the sitting has had no listening item by item 6,
       12 or 18. */
    function nextItem() {
      var forceListen = state.answered.length > 0 &&
        state.answered.filter(function (a) { return a.skill === "listening"; }).length === 0 &&
        state.answered.length % 6 === 0;
      var want = forceListen ? "listening" : wantSkill();
      if (want === "listening" && state.answered.filter(function (a) { return a.skill === "listening"; }).length >= 3) want = null;
      return pick(state.band, want);
    }

    function bandStat(b) {
      var rows = state.answered.filter(function (a) { return a.band === b; });
      var right = rows.filter(function (a) { return a.correct; }).length;
      return { band: BANDS[b], answered: rows.length, correct: right, pct: rows.length ? Math.round((right / rows.length) * 100) : null };
    }

    function estimate() {
      var placed = null;
      for (var b = 0; b < BANDS.length; b++) {
        var s = bandStat(b);
        if (s.answered >= 3 && s.pct >= 60) placed = b;
      }
      var totalRight = state.answered.filter(function (a) { return a.correct; }).length;
      var pct = state.answered.length ? Math.round((totalRight / state.answered.length) * 100) : 0;
      var level = placed == null ? "A1" : BANDS[placed];
      return { level: level, levelIndex: placed == null ? 0 : placed, pct: pct, right: totalRight, asked: state.answered.length };
    }

    /* The mode proxy. The doctrine's ladder (Mouse 0–40 · Cub 41–79 · Tiger
       80–100) is a coach's reading of behaviour in the room. What this test can
       honestly report is the share of the 'usage' items answered the confident
       way — so that is what it reports, and it says so. */
    function modeRead() {
      var u = state.answered.filter(function (a) { return a.skill === "usage"; });
      var right = u.filter(function (a) { return a.correct; }).length;
      var pct = u.length ? Math.round((right / u.length) * 100) : 0;
      var mode = pct >= 80 ? "Tiger" : pct >= 41 ? "Cub" : "Mouse";
      return { mode: mode, pct: pct, n: u.length };
    }

    function skills() {
      var out = {};
      state.answered.forEach(function (a) {
        out[a.skill] = out[a.skill] || { skill: a.skill, correct: 0, total: 0 };
        out[a.skill].total++;
        if (a.correct) out[a.skill].correct++;
      });
      return ["grammar", "vocabulary", "usage", "reading", "listening"].filter(function (s) { return out[s]; }).map(function (s) {
        var o = out[s]; o.pct = Math.round((o.correct / o.total) * 100); return o;
      });
    }

    function result() {
      var e = estimate(), m = modeRead();
      return {
        ref: "NET-PLA-" + Date.now().toString(36).toUpperCase(),
        at: new Date().toISOString(),
        level: e.level, levelIndex: e.levelIndex, pct: e.pct, right: e.right, asked: e.asked,
        bands: BANDS.map(function (b, i) { return bandStat(i); }),
        skills: skills(),
        mode: m.mode, modePct: m.pct, modeItems: m.n,
        plan: PLAN[e.level],
        voice: state.voice,
        seconds: Math.round((Date.now() - state.startedAt) / 1000),
        review: state.answered.map(function (a) {
          return { id: a.id, band: BANDS[a.band], skill: a.skill, stem: a.stem, script: a.script, chosen: a.chosenText, correctText: a.correctText, correct: a.correct, why: a.why };
        })
      };
    }

    function finish() {
      state.done = true;
      renderResult();
    }

    /* --------------------------------------------------------- the speaking */
    function voices() {
      try { return window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { return []; }
    }
    function pickVoice() {
      var vs = voices().filter(function (v) { return /^en(-|_)?/i.test(v.lang || ""); });
      if (!vs.length) vs = voices();
      /* prefer a natural en-GB/en-US voice when the device offers one */
      var pref = vs.filter(function (v) { return /Google|Samantha|Daniel|Serena|Natural|Microsoft (Aria|Guy|Jenny)/i.test(v.name || ""); });
      var v = (pref[0] || vs[0]) || null;
      state.voice = v ? (v.name + " · " + v.lang) : null;
      return v;
    }
    function speak(text) {
      return new Promise(function (resolve) {
        if (!window.speechSynthesis) return resolve({ ok: false, error: "this browser has no speech engine — read the script instead (shown on the result card)" });
        var u = new SpeechSynthesisUtterance(text);
        var v = state.voice ? null : pickVoice();
        if (v) u.voice = v;
        u.rate = 0.94; u.pitch = 1;
        var settled = false;
        function done(r) { if (settled) return; settled = true; resolve(r); }
        u.onend = function () { done({ ok: true }); };
        u.onerror = function (e) { done({ ok: false, error: "speech error: " + (e && e.error) }); };
        try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { done({ ok: false, error: String(e.message || e) }); }
        /* A hard stop. A device with no voice installed, or a browser that
           swallows `onend`, must never be able to stall the test — the sitting
           carries on and the script is printed on the result card. */
        setTimeout(function () { done({ ok: true, timedOut: true }); }, Math.min(25000, 4000 + String(text).length * 110));
      });
    }

    /* -------------------------------------------------------------- render */
    function render(view) {
      if (view) { host.innerHTML = view.html; if (view.wire) view.wire(host); window.scrollTo({ top: host.offsetTop - 80, behavior: "smooth" }); return; }
      if (state.done) return renderResult();
      var item = state.items[state.i];
      if (!item) return finish();

      var pct = Math.round((state.i / MAX_ITEMS) * 100);
      var html =
        '<div class="hud" style="max-width:860px;margin:0 auto">' +
          '<div class="hudbar"><span>Item ' + (state.i + 1) + " / " + MAX_ITEMS + "</span>" +
          "<span>" + item.skill.toUpperCase() + (item.script ? " · SPOKEN" : "") + "</span>" +
          '<span class="mono">' + NET.esc(NET.BRAND.short) + " PLACEMENT</span></div>" +
          '<div class="progress" aria-hidden="true"><i style="width:' + pct + '%"></i></div>';

      if (item.script) {
        html += '<p class="kick">Listen</p>' +
          '<div class="btnrow" style="margin-bottom:16px">' +
            '<button class="btn btn-primary btn-sm" id="playBtn" type="button">Play the sentence</button>' +
            '<button class="btn btn-ghost btn-sm" id="playSlowBtn" type="button">Play slowly</button>' +
            '<span class="mono small muted" id="playNote">spoken by your device’s own voice</span>' +
          "</div>" +
          '<div class="note">You will hear the sentence once. It is not repeated on request during a real sitting — but this is your first try, so press play twice if you need to.</div>';
      }

      html += '<h2 class="qstem" style="margin-top:16px">' + item.stem + "</h2><div class=\"opts\" id=\"opts\">";
      item.opts.forEach(function (o, k) {
        html += '<button class="opt" type="button" data-k="' + k + '"' + (item.script ? " disabled" : "") + '>' +
          '<span class="key">' + "ABCD".charAt(k) + "</span><span>" + o + "</span></button>";
      });
      html += "</div>" + (item.script ? '<p class="hint">The answers unlock when you press play.</p>' : "") + "</div>";

      host.innerHTML = html;
      var playBtn = host.querySelector("#playBtn");
      var slowBtn = host.querySelector("#playSlowBtn");
      function unlock() { host.querySelectorAll(".opt").forEach(function (b) { b.disabled = false; }); var h = host.querySelector(".hint"); if (h) h.textContent = "Answer when you are ready."; }
      if (item.script && window.speechSynthesis) {
        playBtn.addEventListener("click", function () {
          playBtn.disabled = true; playBtn.innerHTML = '<span class="loader"></span> Speaking…';
          /* the answers unlock the moment playback has begun (or ~1s later if
             the engine says nothing at all) — playback must never gate the test */
          setTimeout(unlock, 900);
          speak(item.script).then(function (r) {
            playBtn.disabled = false; playBtn.textContent = "Play again";
            if (!r.ok) host.querySelector("#playNote").textContent = r.error;
            unlock();
          });
        });
        slowBtn.addEventListener("click", function () {
          var u;
          try { speechSynthesis.cancel(); u = new SpeechSynthesisUtterance(item.script); u.rate = 0.62; u.lang = "en-GB"; speechSynthesis.speak(u); } catch (e) {}
          unlock();
        });
      } else if (item.script) {
        host.querySelector(".hint").textContent = "No speech engine on this device — the sentence is printed on your result card.";
        unlock();
      }
      host.querySelectorAll(".opt").forEach(function (b) {
        b.addEventListener("click", function () { answer(item, Number(b.dataset.k), b); });
      });
    }

    function answer(item, k, btn) {
      if (item._locked) return; item._locked = true;
      var correct = k === item.ans;
      var rec = {
        id: item.id, band: item.band, skill: item.skill, stem: item.stem, script: item.script,
        correct: correct, chosenText: item.opts[k], correctText: item.opts[item.ans], why: item.why
      };
      state.answered.push(rec);
      /* the staircase, with hysteresis: two decisions in the same direction
         move the band, so a single guess cannot swing the level. */
      var dir = correct ? 1 : -1;
      if (state.lastBand === dir) state.band = Math.max(0, Math.min(BANDS.length - 1, state.band + dir));
      state.lastBand = dir;
      state.items[state.i + 1] = nextItem();
      state.i++;
      var stable = false;
      if (state.answered.length >= 12) {
        var last6 = state.answered.slice(-6).map(function (a) { return a.band; });
        stable = last6.every(function (b) { return b === last6[0]; });
      }
      if (state.answered.length >= MAX_ITEMS || stable) return finish();
      render();
    }

    /* --------------------------------------------------------- result card */
    function renderResult() {
      var r = state.result();
      var dial = (function () {
        var R = 62, C = 2 * Math.PI * R, on = C * (r.pct / 100);
        return '<div class="dial"><svg width="150" height="150" viewBox="0 0 150 150">' +
          '<circle cx="75" cy="75" r="' + R + '" fill="none" stroke="#2a1040" stroke-width="12"/>' +
          '<circle cx="75" cy="75" r="' + R + '" fill="none" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + on + " " + (C - on) + '"/>' +
          "</svg><div class=\"dnum\"><b>" + r.pct + "%</b><span>" + r.right + "/" + r.asked + "</span></div></div>";
      })();

      var bandRows = r.bands.filter(function (b) { return b.answered; }).map(function (b) {
        return "<tr><td>" + b.band + "</td><td>" + b.answered + "</td><td>" + (b.pct == null ? "—" : b.pct + "%") +
          "</td><td>" + (b.answered >= 3 ? (b.pct >= 60 ? "PLACED" : "below") : "UNPLACED (fewer than 3)") + "</td></tr>";
      }).join("");

      var meters = r.skills.map(function (s) {
        return '<div class="meter"><span class="ml">' + s.skill + '</span><span class="mt"><i style="width:' + s.pct + '%"></i></span><span class="mv">' + s.pct + "%</span></div>";
      }).join("");

      var review = r.review.map(function (v, i) {
        return '<details><summary>' + (i + 1) + ". " + v.band + " · " + v.skill + " — " + (v.correct ? "correct" : "missed") + "</summary>" +
          '<div class="dbody">' +
          (v.script ? '<p class="mono small">SPOKEN: ' + NET.esc(v.script) + "</p>" : "") +
          "<p>" + v.stem + "</p>" +
          '<p class="small">You answered: <b style="color:' + (v.correct ? "#50dc82" : "#e0473f") + '">' + NET.esc(v.chosen) + "</b><br>" +
          'Answer: <b style="color:#50dc82">' + NET.esc(v.correctText) + "</b></p>" +
          '<p class="small muted">' + v.why + "</p></div></details>";
      }).join("");

      var p = r.plan;
      var modeColor = r.mode === "Tiger" ? "#f59e0b" : r.mode === "Cub" ? "#dc9438" : "#94a3b8";

      var html =
        '<div class="hud" style="max-width:960px;margin:0 auto">' +
          '<div class="hudbar"><span>Placement complete</span><span class="mono">' + r.ref + "</span>" +
          '<span class="pill live"><span class="dot"></span>' + r.asked + " items · " + Math.floor(r.seconds / 60) + "m " + (r.seconds % 60) + "s</span></div>" +
          '<div class="scorebox">' + dial +
            "<div>" +
              '<p class="kick">Your measured level</p>' +
              '<h2 style="margin:0">' + r.level + ' <span class="muted" style="font-size:.6em">CEFR</span></h2>' +
              '<p class="lede" style="margin-top:8px">' + NET.esc(p.headline) + "</p>" +
              '<p class="small muted">Placed by the <b>highest band answered at 60% or better with at least three items</b> — not by a single lucky answer. Bands under three items are listed UNPLACED rather than guessed.</p>' +
            "</div>" +
          "</div>" +
          '<div class="grid g2" style="margin-top:26px">' +
            '<div><p class="kick">By band</p><div class="tablewrap"><table class="matrix"><thead><tr><th>Band</th><th>Items</th><th>Score</th><th>Verdict</th></tr></thead><tbody>' + bandRows + "</tbody></table></div></div>" +
            "<div><p class=\"kick\">By skill</p>" + meters +
              '<p class="hint">Listening is spoken by your device' + (r.voice ? " — the voice used was <b>" + NET.esc(r.voice) + "</b>" : "") + ". A recorded examiner would be a fairer measure; this is the honest version of what a browser can do.</p>" +
            "</div>" +
          "</div>" +
          '<div class="hud gold" style="margin-top:24px">' +
            '<div class="hudbar"><span>Output read</span><span class="mono">' + r.modeItems + " usage items</span></div>" +
            "<p style=\"font-size:1.1rem;margin-bottom:6px\">Your confident-English read: <b style=\"color:" + modeColor + ";font-family:Orbitron,sans-serif\">" + r.mode.toUpperCase() + "</b> <span class=\"muted small\">(" + r.modePct + "% of the register items answered the direct way)</span></p>" +
            '<p class="small muted">This is <b>not</b> the coach’s behaviour reading of you in a room — that ladder (<i>Mouse 0–40 · Cub 41–79 · Tiger 80–100</i>, GOSPEL 444) is read from what a student <i>does</i> under pressure, and no browser can see that. What this number measures is narrower and real: how often you chose the direct, owning, unhedged English over the apologetic one. It is the same item class NET uses to open the first conversation.</p>' +
          "</div>" +
          '<div class="grid g2" style="margin-top:24px">' +
            "<div class=\"card plum\"><div class=\"card-kick\">Your 45/15 · input</div><h3>Absorb — 45 minutes</h3><ul>" + p.input.map(function (x) { return "<li>" + NET.esc(x) + "</li>"; }).join("") + "</ul></div>" +
            "<div class=\"card gold\"><div class=\"card-kick\">Your 45/15 · output</div><h3>Perform — 15 minutes</h3><ul>" + p.output.map(function (x) { return "<li>" + NET.esc(x) + "</li>"; }).join("") + "</ul></div>" +
          "</div>" +
          '<div class="note gold" style="margin-top:20px"><b>Your four-week target.</b> ' + NET.esc(p.target) + " The free 30-minute in-home diagnostic turns this sheet into an actual timetable for your week.</div>" +
          '<div class="btnrow" style="margin-top:22px">' +
            '<a class="btn btn-primary" href="book.html?ref=' + encodeURIComponent(r.ref) + '&level=' + encodeURIComponent(r.level) + '">Book the free diagnostic</a>' +
            '<button class="btn btn-ghost" id="resSave" type="button">Save this result</button>' +
            '<button class="btn btn-ghost" id="resShare" type="button">Copy result link</button>' +
            '<a class="btn btn-ghost" id="resWa" target="_blank" rel="noopener">Send to the coach on WhatsApp</a>' +
            '<button class="btn btn-sys" id="resRetake" type="button">Retake</button>' +
          "</div>" +
          '<p class="hint" id="resNote"></p>' +
          '<p class="kick" style="margin-top:28px">Every item, and why</p>' + review +
        "</div>";

      host.innerHTML = html;

      var lead = {
        id: r.ref, ref: r.ref, created: r.at, kind: "placement", kindLabel: "Placement test",
        name: "", email: "", phone: "",
        level: r.level, goal: "placement result " + r.pct + "% (" + r.mode + ")",
        notes: "adaptive placement · " + r.asked + " items · " + r.skills.map(function (s) { return s.skill + " " + s.pct + "%"; }).join(", "),
        placement: { level: r.level, pct: r.pct, mode: r.mode, skills: r.skills, ref: r.ref }
      };

      var saveBtn = host.querySelector("#resSave");
      var note = host.querySelector("#resNote");
      saveBtn.addEventListener("click", function () {
        var w = NET.ledger.add(lead);
        note.textContent = w.ok ? "Saved to this device (" + NET.ledger.count() + " record" + (NET.ledger.count() === 1 ? "" : "s") + "). Nothing left this device." : "Not saved: " + w.error;
      });
      host.querySelector("#resShare").addEventListener("click", function () {
        var payload = btoa(unescape(encodeURIComponent(JSON.stringify({ l: r.level, p: r.pct, m: r.mode, r: r.ref })))).replace(/=+$/, "");
        var url = location.origin + location.pathname + "#r=" + payload;
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
          .then(function () { note.textContent = "Result link copied — anyone can open it and read the summary."; })
          .catch(function () { note.textContent = url; });
      });
      var waLink = host.querySelector("#resWa");
      waLink.href = NET.handoff.whatsapp(lead);
      host.querySelector("#resRetake").addEventListener("click", function () { location.reload(); });
    }

    /* ---------------------------------------------------- the intro screen */
    function intro() {
      var html =
        '<div class="hud" style="max-width:820px;margin:0 auto">' +
          '<div class="hudbar"><span>Placement test</span><span class="mono">CEFR A1–C2 · adaptive</span><span class="pill">~8 minutes</span></div>' +
          "<h2>What can you actually do in English?</h2>" +
          "<p>Not what you studied — what you can <b>do</b>. " + MAX_ITEMS + " questions in a staircase that moves with you, a short reading passage, and a listening section spoken aloud by your own device. Then a level, a skill breakdown, and a 45/15 plan for the next four weeks.</p>" +
          '<div class="grid g2" style="margin:18px 0">' +
            '<div class="card"><div class="card-kick">What it does</div><ul class="small"><li>Adapts after every answer — correct moves you up a band, wrong moves you down</li><li>Places you by band, never by one lucky question</li><li>Names what it cannot measure instead of guessing</li></ul></div>' +
            '<div class="card"><div class="card-kick">What it does not</div><ul class="small"><li>Replace the coach’s diagnostic — that is a 30-minute conversation, free</li><li>Store anything on a server. Results live on your device unless you send them</li><li>Judge your accent. There is no accent to fail here.</li></ul></div>' +
          "</div>" +
          '<div class="note warn"><b>Before you start.</b> Answer honestly and do not open another tab for the answers — the value of this is the honest number. The listening section needs your device’s sound on.</div>' +
          '<div class="btnrow" style="margin-top:18px">' +
            '<button class="btn btn-primary" id="startBtn" type="button">Start the test</button>' +
            '<a class="btn btn-ghost" href="book.html">Skip it — book the free diagnostic</a>' +
          "</div>" +
          '<p class="hint" id="voiceHint"></p>' +
        "</div>";
      render({ html: html, wire: function (h) {
        try {
          if (window.speechSynthesis) {
            speechSynthesis.onvoiceschanged = function () { pickVoice(); };
            pickVoice();
            h.querySelector("#voiceHint").textContent = state.voice ? "Listening voice found: " + state.voice : "No English speech voice found on this device — the listening items will print their script instead.";
          } else {
            h.querySelector("#voiceHint").textContent = "No speech engine on this device — the listening items will print their script instead.";
          }
        } catch (e) {}
        h.querySelector("#startBtn").addEventListener("click", function () {
          state.items[0] = pick(2, "grammar");
          render();
        });
      } });
    }

    state.result = result;
    intro();
    return { state: state, result: result };
  }

  window.NETPlacement = {
    BANDS: BANDS, MAX_ITEMS: MAX_ITEMS, BANK: BANK, LISTENING: LISTENING, PASSAGE: PASSAGE, PLAN: PLAN,
    create: create,
    VERSION: "1.0.0"
  };
})();
