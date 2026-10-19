/* ============================================================================
   THE METHOD — src/generators/role-kit/method.js            (v1 · 2026-09-22)

   THE TAPE'S OWN TABLES, shared by every role in the family: the catalogue of
   what the lesson promised, the 44-sound inventory, the collisions this market
   actually collides on, the interview bank, and the rows a CV is made of.

   NONE OF IT IS A STUDENT. Not a name, not a degree, not a score, not a search.
   These are the instruments the tutor asked for, transcribed from the recordings
   of the 23rd; a record is what a human fills them with, and it lives in that
   browser (see kit.js).

   THE AUTHORITY. The station's `src/intake.js` holds the same tables — ITEMS,
   PHONEMES, MINIMAL_PAIRS, BANK, CV_FIELDS. This file is the family's copy of
   them so a role does not have to fetch the station. THEY ARE THE SAME TABLES:
   a change to one is a change to both, and `src/README.md` records that debt.
   The quotes the `ev` fields carry are the recordings' own words, kept verbatim.
   ========================================================================== */
(function () {
  "use strict";

  /* 1 · THE CATALOGUE — every promise the tutor made on the 23rd, in his own
     words. The roles use these for the evidence behind a row, and for the
     steps a function runs in. */
  var ITEMS = [
    { id: "cv", title: "The CV", who: "station", ev: "rec 3 — 'You don't have a CV yet?'; rec 4 — the degree line",
      what: "A one-page CV built from what the student actually has: schooling, work, tools, languages, links, one headshot.",
      made: "the student's own rows + the headshot + what they send",
      steps: ["collect the schooling row", "collect the work / project rows", "collect the links", "choose the headshot",
              "write it in their own words", "print it (A4) and re-read it aloud"],
      gate: "a degree name that has been CONFIRMED — never the machine's guess" },

    { id: "linkedin", title: "The LinkedIn", who: "station", ev: "rec 1 — 'getting his CV and LinkedIn set up'; rec 3 — the 600-connection target",
      what: "The profile: headline, about, experience, education, skills, and the connection build the tutor quoted (600).",
      made: "the same intake as the CV + a professional photo",
      steps: ["headline (from the CV headline)", "photo", "about (their own words)", "education", "skills",
              "turn on 'open to work' with the roles they actually want", "connection build"],
      gate: "the CV's confirmed rows" },

    { id: "headshot", title: "The headshot", who: "student", ev: "rec 3 — the wardrobe, decided on mic",
      what: "One clean photo for the CV and the LinkedIn. Plain background, chest up, neutral or lightly smiling, natural light.",
      made: "a phone, a wall, a shirt that has been ironed",
      steps: ["decide the outfit on camera", "shoot 20", "pick 1", "crop to passport-ish framing"],
      gate: "" },

    { id: "portfolio", title: "The portfolio intake", who: "student", ev: "rec 1 — 'send me over everything you have'; rec 2 — 'just try to send everything'",
      what: "Everything they have ever made, sent once, into one place — the tutor's own line: if it is not sent it 'just gains dust and just sits there'.",
      made: "what already exists on their phone and in the class group",
      steps: ["send the magazine", "send the links", "send the socials", "send the CV if one exists",
              "the station files each one against the item it can serve"],
      gate: "" },

    { id: "phonics", title: "The 44-phoneme work", who: "station", ev: "rec 3 — 'we get to use that conversation we've just had to test your 44 phonics'; rec 4 — phonics into the homework",
      what: "The oral instrument: the 44 sounds of English, read aloud, recorded, transcribed, and marked. It is a SPEAKING test — the tutor refused to have them read.",
      made: "their own voice, a recording, and the inventory in this file",
      steps: ["sit the diagnostic (the 44 sounds)", "record the set", "transcribe it", "mark the sounds that slipped",
              "drill only those, ten minutes a day", "re-sit the same set in a week"],
      gate: "" },

    { id: "present", title: "The weekly recorded presentation", who: "student", ev: "rec 3 — 'record it for video 15-20 minutes … a few times a week'",
      what: "A 15–20 minute spoken presentation on a subject of their choice, recorded on video, a few times a week, about an hour a week in total — 'spread out' so it 'builds up like a snowball'.",
      made: "a phone, a topic, and the reading sheet this desk prints",
      steps: ["pick the subject", "plan 5 beats", "record 15–20 min", "send it", "it gets transcribed and read",
              "one correction per run — never five"],
      gate: "" },

    { id: "apps", title: "The applications", who: "student", ev: "rec 1 — '12'; rec 4 — 'one of the 12 … just around 30'",
      what: "The live search, with its real arithmetic. The volume is the point; the desk keeps the count, the role, the date and what each one asked.",
      made: "their own search (the roles they actually want) and ~30 minutes per application",
      steps: ["name the target role and the boards", "log each application as it goes out (date · company · role · what it asked)",
              "hold the weekly count", "re-use what repeats instead of retyping it"],
      gate: "" },

    { id: "interview", title: "The interview drill", who: "station", ev: "rec 1 — 'that's something that we can practice as interviews'; rec 4 — the questions actually asked",
      what: "The bank of questions this market really asks, in the order a real interview runs, with the student's own answers rehearsed out loud until they are boring to say.",
      made: "the bank + the student's own material + a camera or a call",
      steps: ["run the bank cold, recorded", "mark the three that broke", "write the answers with the tutor",
              "run it again on a call (Zoom is the real mode)", "hold it to the point where it is boring"],
      gate: "" },

    { id: "umbrella", title: "The umbrella brand", who: "station", ev: "rec 4 — 'you can brand yourself under the umbrella and have like sub-…'",
      what: "One name that everything hangs under, with the work as sub-brands beneath it — the tutor's own structure, shown from his own website: 'if you just stick with one, then you can only apply to one sort of thing'.",
      made: "the student's name, their pieces, and one holding line",
      steps: ["name the umbrella", "list the sub-pieces", "one line each", "one page that carries them",
              "the links go on the CV and the LinkedIn"],
      gate: "the portfolio intake (you cannot brand what has not been sent)" },

    { id: "presence", title: "The presence build", who: "student", ev: "rec 4 — Facebook, TikTok, WhatsApp, and 'we can automate that stuff'",
      what: "The public face a recruiter can find: a professionalised Facebook (business in this market runs there), TikTok as traffic, WhatsApp as the global number, and the profile photo used for business.",
      made: "the accounts they already have",
      steps: ["clean the profile photo and the name", "one line of work in the bio", "pin the best three pieces",
              "list the target recruiters", "post on a rhythm, not in bursts"],
      gate: "" },

    { id: "work", title: "A nameable credit on a real product", who: "station", ev: "rec 4 — the tutor's own game, and 'you could say you helped consult and design for…'",
      what: "Real work on a shipped product, credited in the CV in the words the tutor used ('helped consult and design for …'). Work that exists is worth more than a certificate that does not.",
      made: "the sovereign's own product, and the student's hands on it",
      steps: ["scope one piece they can genuinely own", "do it", "credit it in the CV and the LinkedIn",
              "be able to talk about it for five minutes in an interview"],
      gate: "the sovereign's word on what may be credited" },

    { id: "pipeline", title: "The pipeline (the owed list)", who: "station", ev: "rec 2 — 'a pipeline … like a to-do list … then we won't forget about that'",
      what: "Every promise, its owner, its evidence and its state — held in one place so nothing is forgotten between lessons.",
      made: "the recordings, and this desk",
      steps: ["every promise becomes an item", "every item gets an owner", "material moves the item", "nothing is closed by memory alone"],
      gate: "" },

    { id: "app", title: "ONE APP THAT REMEMBERS", who: "station", ev: "rec 4 — the specification, in the tutor's own words",
      what: "The thing the tutor asked for by name: the captures happen by hand, and the machine keeps everything — every student, every track, the CVs, the phonics, the count, the questions, the week.",
      made: "everything above, in the station",
      steps: ["the record", "the pipeline", "the capture lane", "the week's plan", "the material the sovereign sends"],
      gate: "" }
  ];
  var BY_ID = {};
  ITEMS.forEach(function (it) { BY_ID[it.id] = it; });

  /* 2 · THE 44 SOUNDS (24 consonants · 20 vowels). The tutor said "your 44
     phonics" and refused the reading test: this is a SPEAKING test. Each row is
     a sound, a spelling, and words to say aloud. */
  var PHONEMES = [
    ["/b/", "b", "bat · big · job"],
    ["/d/", "d", "dog · red · ladder"],
    ["/f/", "f, ph", "fan · phone · laugh"],
    ["/g/", "g", "go · bag · bigger"],
    ["/h/", "h", "hat · behind"],
    ["/j/", "j, ge", "jam · bridge · age"],
    ["/k/", "c, k, ck", "cat · keep · back"],
    ["/l/", "l, ll", "lip · bell · full"],
    ["/m/", "m, mb", "man · summer · comb"],
    ["/n/", "n, kn", "net · dinner · knee"],
    ["/p/", "p", "pen · happy · stop"],
    ["/r/", "r, wr", "red · carry · write"],
    ["/s/", "s, ss, c", "sun · miss · city"],
    ["/t/", "t, tt", "top · better · that"],
    ["/v/", "v", "van · river · have"],
    ["/w/", "w, wh", "wet · away · when"],
    ["/y/", "y", "yes · beyond"],
    ["/z/", "z, s", "zoo · buzz · is"],
    ["/ch/", "ch, tch", "chip · church · watch"],
    ["/sh/", "sh, ti", "ship · nation · wash"],
    ["/th/ (voiceless)", "th", "thin · bath · method"],
    ["/th/ (voiced)", "th", "this · mother · breathe"],
    ["/ng/", "ng, n", "sing · singer · bank"],
    ["/zh/", "s, si", "measure · vision"],
    ["short a /æ/", "a", "cat · map · hand"],
    ["short e /e/", "e, ea", "bed · head · bread"],
    ["short i /ɪ/", "i, y", "sit · gym · village"],
    ["short o /ɒ/", "o, a", "hot · want · wash"],
    ["short u /ʌ/", "u, o", "cup · son · money"],
    ["long ee /iː/", "ee, ea, e", "see · eat · me · field"],
    ["long a /eɪ/", "a_e, ai, ay", "cake · rain · day"],
    ["long i /aɪ/", "i_e, igh, y", "bike · high · my"],
    ["long o /əʊ/", "o_e, oa, ow", "home · road · know"],
    ["long oo /uː/", "oo, u_e", "food · blue · June"],
    ["yoo /juː/", "u, ew", "use · few · music"],
    ["ow /aʊ/", "ou, ow", "out · now · house"],
    ["oi /ɔɪ/", "oi, oy", "coin · boy · point"],
    ["ar /ɑː/", "ar, a", "car · father · start"],
    ["or /ɔː/", "or, au, aw", "for · saw · talk"],
    ["er /ɜː/", "er, ir, ur, or", "her · bird · turn · word"],
    ["air /eə/", "air, are, ear", "hair · care · bear"],
    ["ear /ɪə/", "ear, eer, ere", "ear · cheer · here"],
    ["ure /ʊə/", "ure, our", "sure · tour"],
    ["schwa /ə/", "a, e, o, er (weak)", "about · problem · doctor — the weak vowel in every unstressed syllable"]
  ];

  /* the pairs this market's learners actually collide on — say both, in one
     breath, ten times; the mouth learns the difference faster than the ear. */
  var MINIMAL_PAIRS = [
    ["th /θ/ vs s /s/", "think / sink · three / see · mouth / mouse"],
    ["th /ð/ vs z /z/", "they / zay · breathe / breeze"],
    ["v /v/ vs w /w/", "vest / west · vine / wine"],
    ["l /l/ vs r /r/", "light / right · play / pray"],
    ["final -s /s/ vs /z/", "cats / dogs · picks / pigs"],
    ["-ed /t/ vs /d/ vs /ɪd/", "walked / played / wanted"],
    ["short i /ɪ/ vs long ee /iː/", "sit / seat · live / leave · ship / sheep"],
    ["short a /æ/ vs long a /eɪ/", "man / mane · hat / hate · bat / bait"],
    ["n /n/ vs ng /ŋ/", "sin / sing · ran / rang · thin / thing"],
    ["j /dʒ/ vs y /j/", "jail / Yale · jeep / yeep"]
  ];

  /* 3 · THE INTERVIEW BANK — what this market actually asks. The first group is
     not invented: those were asked of a student, and the tutor repeated them out
     loud as the real thing. */
  var BANK = [
    ["THE ONES ACTUALLY ASKED OF HIM", [
      "What is your blood type?",
      "Are you married yet? Why not?",
      "What was your college score — and can you show it?",
      "Is this an international company or a Vietnamese company you are applying to?"
    ]],
    ["OPENERS", [
      "Tell me about yourself.",
      "Why did you apply to this company?",
      "What do you know about what we do?",
      "Why should we choose you over another candidate?"
    ]],
    ["THE WORK", [
      "Walk me through something you built, start to finish.",
      "What did you do when something went wrong?",
      "Which part of that work was yours alone?",
      "What are you still learning, and how are you learning it?"
    ]],
    ["THE MONEY & THE TERMS", [
      "What salary do you expect?",
      "When could you start?",
      "Are you able to work remotely, and in which hours?",
      "Do you have any questions for us?"
    ]],
    ["THE ONES THAT TELL YOU IT WENT WELL", [
      "Can you send us your portfolio?",
      "Would you be free for a second interview this week?",
      "What would you need from us to start well?"
    ]]
  ];

  /* 4 · THE CV'S ROWS — the order a one-page CV runs in, with the hint the
     student is asked for. `degree` carries the family's hardest rule: the name
     ON the certificate, never the machine's guess. */
  var CV_FIELDS = [
    ["headline", "Headline", "one line: what they are, and what they want"],
    ["phone", "Phone", "the number they will answer"],
    ["email", "Email", ""],
    ["city", "City", "where they are, and whether they can work remotely"],
    ["links", "Links", "portfolio · LinkedIn · anything they made (one per line)"],
    ["summary", "Summary", "2–3 lines, in their own words"],
    ["school", "School", ""],
    ["degree", "Degree", "the name ON the certificate — never the machine's guess"],
    ["dates", "Dates", "from → to"],
    ["gpa", "Result / GPA", "only if they want it shown"],
    ["experience", "Experience", "role · place · what they actually did (one per line)"],
    ["skills", "Skills", "the tools they really use (one per line)"],
    ["languages", "Languages", "Vietnamese · English — with the level"],
    ["photo", "Headshot", "the file or the URL"]
  ];

  /* 5 · FILING — which promise does a piece of arriving material serve? */
  var MATCH = [
    ["cv", ["cv", "c.v", "resume", "curriculum"]],
    ["linkedin", ["linkedin", "linked in", "li profile"]],
    ["headshot", ["headshot", "selfie", "photo", "picture", "portrait", "passport photo"]],
    ["phonics", ["phonics", "phoneme", "sound", "pronunciation", "accent", "minimal pair"]],
    ["present", ["presentation", "recorded video", "the recording", "speech"]],
    ["apps", ["application", "applied", "apply", "job", "vacanc", "company", "hired"]],
    ["interview", ["interview", "zoom call", "question", "blood type", "married"]],
    ["umbrella", ["umbrella", "brand", "logo", "business card", "my site", "website"]],
    ["presence", ["facebook", "tiktok", "whatsapp", "instagram", "social", "profile photo"]],
    ["work", ["roblox", "game", "3d", "model", "consult", "train 67", "unreal", "blender"]],
    ["portfolio", ["portfolio", "magazine", "project", "camera", "drawing", "design", "poster", "video edit"]]
  ];
  function matchItem(text) {
    var t = " " + String(text || "").toLowerCase() + " ";
    var best = "portfolio", bestN = 0;
    MATCH.forEach(function (row) {
      var n = 0;
      row[1].forEach(function (k) { if (t.indexOf(k) >= 0) n++; });
      if (n > bestN) { bestN = n; best = row[0]; }
    });
    return best;
  }

  /* 6 · THE STATES an item can be in. An item moves when MATERIAL ARRIVES —
     never because anyone remembered that it probably had. */
  var STATES = {
    not_started: { label: "NOT STARTED", c: "#8b94ad" },
    waiting: { label: "WAITING ON THEM", c: "#e6b43c" },
    received: { label: "MATERIAL IN", c: "#5ed5eb" },
    building: { label: "BEING BUILT", c: "#a855f7" },
    done: { label: "DONE", c: "#50dc82" },
    blocked: { label: "BLOCKED", c: "#e0473f" }
  };

  window.ObiMethod = {
    ITEMS: ITEMS, BY_ID: BY_ID, PHONEMES: PHONEMES, MINIMAL_PAIRS: MINIMAL_PAIRS,
    BANK: BANK, CV_FIELDS: CV_FIELDS, MATCH: MATCH, matchItem: matchItem, STATES: STATES
  };
})();
