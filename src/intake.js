/* ============================================================================
   OBI — THE INTAKE  (src/intake.js)

   WHY THIS FILE EXISTS
   On the evening of 23/09/2026 the sovereign recorded a lesson — four files,
   37 minutes, one room, one tutor, two brothers — and then asked for three
   things: transcribe it, blueprint it, and BUILD the blueprint.

   The blueprints are the evidence. This file is the build. The tutor said what
   it is, on the tape, in his own words:

       "so we'll build it all into one app so that it remembers, right? …
        you obviously have to do the capture, because robots…"

        "You know what a pipeline is? It's like a to-do list, right? And then
         we won't forget about that."

   So: one app that remembers. The human captures; the machine remembers, orders
   it, and hands back the next thing to do. Every promise the tutor made on that
   tape is an ITEM here, owned by somebody, with the evidence that put it there.
   Nothing is "in progress" by vibes — an item moves when material arrives.

   WHAT THIS FILE HOLDS, AND WHAT IT DELIBERATELY DOES NOT
     IT HOLDS THE METHOD — the catalogue of what has to be built (ITEMS), the
     instrument for the phonics work (PHONEMES), the interview bank (BANK), and
     the builders that turn a record into a CV, a LinkedIn plan, a week's plan.

     IT HOLDS NO STUDENT. Not a name, not a degree, not a search, not a score.
     The public source is world-readable and the register publishes it to the
     open wire; a young man's job search and his GPA do not belong on it. The
     records live in THIS BROWSER, in kv, under `intake` — private, per origin,
     durable. `/intake export` writes them to a file so a future browser (or a
     future session) can be re-seeded; `/intake import` puts them back.

   THE HONEST RULES THIS FILE OBEYS
     L41 FAILCLOSED_CAPTURE — a field the student has not supplied is printed as
       a RULED LINE, never filled in. A CV with a guessed degree name is worse
       than a CV with a blank one.
     L38 RAW_FIRST_DERIVE — every received thing is kept verbatim in the inbox
       before anything is derived from it, and it is kept forever.
     L55 STAGE0_REPRINT_FOOTNOTE — every card says what it read.
     The tutor's own requirement (rec 1): speaker/attribution is preserved, so
       every field carries the recording it came from.

   COMMANDS. `/intake` and everything under it (see HELP below).
   ========================================================================== */
(function(){
"use strict";

const V = "intake/1";
const OWNER_LABEL = { student: "THEY OWE IT", station: "WE OWE IT" };
const STATES = {
  not_started: { label: "NOT STARTED", c: "#8b94ad" },
  waiting:     { label: "WAITING ON THEM", c: "#e6b43c" },
  received:    { label: "MATERIAL IN", c: "#5ed5eb" },
  building:    { label: "BEING BUILT", c: "#a855f7" },
  done:        { label: "DONE", c: "#50dc82" },
  blocked:     { label: "BLOCKED", c: "#e0473f" }
};

/* ==========================================================================
   1 · THE METHOD — the catalogue of what has to be built
   Every row here is a promise the tutor made on the 23rd, in his own words
   (the recordings are the authority; the ids point at the blueprint's table).
   ========================================================================== */
const ITEMS = [
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
    steps: ["sit the diagnostic (PHONEMES → /intake phonics <name> 44)", "record the set", "transcribe it (/transcribe)",
            "mark the sounds that slipped", "drill only those, ten minutes a day", "re-sit the same set in a week"],
    gate: "" },

  { id: "present", title: "The weekly recorded presentation", who: "student", ev: "rec 3 — 'record it for video 15-20 minutes … a few times a week'",
    what: "A 15–20 minute spoken presentation on a subject of their choice, recorded on video, a few times a week, about an hour a week in total — 'spread out' so it 'builds up like a snowball'.",
    made: "a phone, a topic, and the reading sheet this desk prints",
    steps: ["pick the subject", "plan 5 beats", "record 15–20 min", "send it", "it gets transcribed and read",
            "one correction per run — never five"],
    gate: "" },

  { id: "apps", title: "The applications", who: "student", ev: "rec 1 — '12'; rec 4 — 'one of the 12 … just around 30'",
    what: "The live search, with its real arithmetic. The volume is the point; the station keeps the count, the role, the date and what each one asked.",
    made: "their own search (the roles they actually want) and ~30 minutes per application",
    steps: ["name the target role and the boards", "log each application as it goes out (date · company · role · what it asked)",
            "hold the weekly count", "re-use what repeats instead of retyping it"],
    gate: "" },

  { id: "interview", title: "The interview drill", who: "station", ev: "rec 1 — 'that's something that we can practice as interviews'; rec 4 — the questions actually asked",
    what: "The bank of questions this market really asks, in the order a real interview runs, with the student's own answers rehearsed out loud until they are boring to say.",
    made: "BANK in this file + the student's own material + a camera or a call",
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
    what: "This desk. Every promise, its owner, its evidence and its state — held in one place so nothing is forgotten between lessons.",
    made: "the recordings, and this file",
    steps: ["every promise becomes an item", "every item gets an owner", "material moves the item", "nothing is closed by memory alone"],
    gate: "" },

  { id: "app", title: "ONE APP THAT REMEMBERS", who: "station", ev: "rec 4 — the specification, in the tutor's own words",
    what: "The thing the tutor asked for by name: the captures happen by hand, and the machine keeps everything — both students, both tracks, the CVs, the phonics, the count, the questions, the week.",
    made: "everything above, in this station",
    steps: ["the record (built — this file)", "the pipeline (built — this desk)", "the capture lane (/transcribe)",
            "the week's plan (/intake plan)", "the material the sovereign is about to send"],
    gate: "" }
];

/* ==========================================================================
   2 · THE PHONICS INSTRUMENT — 44 sounds (24 consonants · 20 vowels)
   The tutor said "your 44 phonics" and refused the reading test: this is a
   SPEAKING test. Each row is a sound, a spelling, and words to say aloud.
   ========================================================================== */
const PHONEMES = [
  ["/b/",     "b",        "bat · big · job"],
  ["/d/",     "d",        "dog · red · ladder"],
  ["/f/",     "f, ph",    "fan · phone · laugh"],
  ["/g/",     "g",        "go · bag · bigger"],
  ["/h/",     "h",        "hat · behind"],
  ["/j/",     "j, ge",    "jam · bridge · age"],
  ["/k/",     "c, k, ck", "cat · keep · back"],
  ["/l/",     "l, ll",    "lip · bell · full"],
  ["/m/",     "m, mb",    "man · summer · comb"],
  ["/n/",     "n, kn",    "net · dinner · knee"],
  ["/p/",     "p",        "pen · happy · stop"],
  ["/r/",     "r, wr",    "red · carry · write"],
  ["/s/",     "s, ss, c", "sun · miss · city"],
  ["/t/",     "t, tt",    "top · better · that"],
  ["/v/",     "v",        "van · river · have"],
  ["/w/",     "w, wh",    "wet · away · when"],
  ["/y/",     "y",        "yes · beyond"],
  ["/z/",     "z, s",     "zoo · buzz · is"],
  ["/ch/",    "ch, tch",  "chip · church · watch"],
  ["/sh/",    "sh, ti",   "ship · nation · wash"],
  ["/th/ (voiceless)", "th", "thin · bath · method"],
  ["/th/ (voiced)",    "th", "this · mother · breathe"],
  ["/ng/",    "ng, n",    "sing · singer · bank"],
  ["/zh/",    "s, si",    "measure · vision"],
  ["short a /æ/", "a",       "cat · map · hand"],
  ["short e /e/", "e, ea",   "bed · head · bread"],
  ["short i /ɪ/", "i, y",    "sit · gym · village"],
  ["short o /ɒ/", "o, a",    "hot · want · wash"],
  ["short u /ʌ/", "u, o",    "cup · son · money"],
  ["long ee /iː/", "ee, ea, e", "see · eat · me · field"],
  ["long a /eɪ/", "a_e, ai, ay", "cake · rain · day"],
  ["long i /aɪ/", "i_e, igh, y", "bike · high · my"],
  ["long o /əʊ/", "o_e, oa, ow", "home · road · know"],
  ["long oo /uː/", "oo, u_e", "food · blue · June"],
  ["yoo /juː/",   "u, ew",   "use · few · music"],
  ["ow /aʊ/",     "ou, ow",  "out · now · house"],
  ["oi /ɔɪ/",     "oi, oy",  "coin · boy · point"],
  ["ar /ɑː/",     "ar, a",   "car · father · start"],
  ["or /ɔː/",     "or, au, aw", "for · saw · talk"],
  ["er /ɜː/",     "er, ir, ur, or", "her · bird · turn · word"],
  ["air /eə/",    "air, are, ear", "hair · care · bear"],
  ["ear /ɪə/",    "ear, eer, ere", "ear · cheer · here"],
  ["ure /ʊə/",    "ure, our", "sure · tour"],
  ["schwa /ə/",   "a, e, o, er (weak)", "about · problem · doctor — the weak vowel in every unstressed syllable"]
];

/* The pairs this market's learners actually collide on — say both, in one
   breath, ten times, and the mouth learns the difference faster than the ear. */
const MINIMAL_PAIRS = [
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

/* ============================================================================
   3 · THE INTERVIEW BANK — what this market actually asks.
   The first three are not invented: they were asked of a student on the 23rd
   and the tutor repeated them out loud as the real thing.
   ========================================================================== */
const BANK = [
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

/* ==========================================================================
   4 · STORAGE — kv, this origin, private. Nothing here ever leaves the browser
   except through /intake export, which the sovereign runs deliberately.
   ========================================================================== */
let _f = null, _ready = null;
function folder(){
  if(_f) return _f;
  try{ if(typeof root !== "undefined" && root && root.kv) _f = root.kv.intake; }catch(e){ _f = null; }
  return _f;
}
function kvReady(){
  if(!folder()) return Promise.resolve(false);
  if(!_ready) _ready = Promise.resolve(true);
  return _ready;
}
async function allIds(){
  const f = folder(); if(!f) return [];
  try{ const ks = await f.keys(); return (ks || []).filter(k => !String(k).startsWith("__")).sort(); }catch(e){ return []; }
}
async function all(){
  const ids = await allIds(), out = [];
  for(const id of ids){ const r = await get(id); if(r) out.push(r); }
  return out;
}
async function get(id){
  const f = folder(); if(!f) return null;
  try{ return await f.get(id); }catch(e){ return null; }
}
async function save(rec){
  const f = folder(); if(!f) return false;
  rec.v = V; rec.updated = new Date().toISOString();
  try{ await f.set(rec.id, rec); return true; }catch(e){ return false; }
}
async function lastId(){ const f = folder(); if(!f) return null; try{ return await f.get("__last"); }catch(e){ return null; } }
async function setLast(id){ const f = folder(); if(!f) return; try{ await f.set("__last", id); }catch(e){} }
async function forget(id){ const f = folder(); if(!f) return false; try{ await f.delete(id); return true; }catch(e){ return false; } }

function newRecord(o){
  const rec = { v: V, id: o.id, name: o.name, spelling: o.spelling || "", role: "student",
    tutor: o.tutor || "the tutor", evidenceSet: o.evidenceSet || [], note: o.note || "",
    fields: o.fields || [], owed: o.owed || {}, inbox: o.inbox || [], log: [],
    at: new Date().toISOString() };
  return rec;
}

/* ---- resolution: an argument names a student, by id, by name, or by number -- */
async function resolve(arg){
  const a = String(arg || "").trim();
  const list = await all();
  if(!list.length) return { err: "no students on file IN THIS BROWSER — the records are private and never ship in the public source. Restore with `/intake import <json>` (the file `/intake export all` writes), or open one with `/intake new <name>`." };
  if(!a){
    const last = await lastId();
    const hit = list.find(r => r.id === last);
    return { rec: hit || list[0] };
  }
  const k = a.toLowerCase().replace(/\s+/g, "");
  if(/^\d+$/.test(k)){ const i = parseInt(k, 10) - 1; if(list[i]) return { rec: list[i] }; }
  let hit = list.find(r => r.id.toLowerCase() === k) ||
            list.find(r => String(r.name).toLowerCase().replace(/\s+/g, "") === k) ||
            list.find(r => String(r.name).toLowerCase().replace(/\s+/g, "").indexOf(k) === 0);
  if(!hit && k.length >= 3) hit = list.find(r => a.toLowerCase().split(" ").every(w => w && (r.id + " " + r.name).toLowerCase().includes(w)));
  if(!hit) return { err: "no student matches \u201c" + esc2(a) + "\u201d — on file: " + list.map(r => r.name).join(", ") + "." };
  await setLast(hit.id);
  return { rec: hit };
}

/* ==========================================================================
   5 · RENDERING — the station's own chrome, so a card looks like a card
   ========================================================================== */
function esc2(s){
  try{ if(typeof esc === "function") return esc(String(s)); }catch(e){}
  return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
}
function bubble(html){ try{ if(typeof addBubble === "function") return addBubble("ass", html); }catch(e){} return null; }
function card(head, body, foot){ return '<div class="rise tr-card"><div class="rhead">' + head + "</div>" + body + '<div class="rfoot">' + (foot || "") + "</div></div>"; }
function rr(label, value, cls){ return '<div class="rrow"><b>' + label + "</b><span class=\"vd\">" + (value == null ? "" : value) + "</span><div class=\"rd\">" + (cls || "") + "</div></div>"; }
function ev(e){ return e ? '<div class="rd" style="opacity:.62;font-size:.78em">evidence · ' + esc2(e) + "</div>" : ""; }
function stChip(s){ const S = STATES[s] || STATES.not_started; return '<span style="color:' + S.c + ';font-family:var(--mono,monospace)">' + S.label + "</span>"; }
/* a row of buttons inside a card: .eval-tile is display:flex, so a bare one
   inside a .rd stacks full-width — the group wrapper makes them a row. */
function btns(list){ return '<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem">' + list.join("") + "</div>"; }
function log(what){ try{ if(typeof logOp === "function") logOp({ kind: "intake", action: "THE INTAKE", result: String(what).slice(0, 160) }); }catch(e){} }
function note(rec, what){ rec.log = rec.log || []; rec.log.push({ at: new Date().toISOString(), what: String(what) }); if(rec.log.length > 200) rec.log = rec.log.slice(-200); }

const BY_ID = {};
ITEMS.forEach(it => { BY_ID[it.id] = it; });

function stateOf(rec, id){
  const o = (rec.owed || {})[id];
  return (o && o.state) || "not_started";
}
function itemNote(rec, id){ const o = (rec.owed || {})[id]; return (o && o.note) || ""; }
function inboxOf(rec, id){ return (rec.inbox || []).filter(x => x.item === id); }
function counts(rec){
  const c = { open: 0, waiting: 0, received: 0, building: 0, done: 0, blocked: 0 };
  ITEMS.forEach(it => {
    const s = stateOf(rec, it.id);
    if(s === "done") c.done++;
    else { c.open++; if(c[s] != null) c[s]++; }
  });
  return c;
}
/* the next thing to do: a station item with material in, first; then anything
   the student owes that is still outstanding; then our own un-started work.
   The two META items (the pipeline itself, and the app that holds it) are never
   offered as "next" while anything real is open — they are the floor, not a task. */
const META_ITEMS = { app: 1, pipeline: 1 };
function firstOpen(rec){
  const order = ["received", "building", "not_started", "waiting", "blocked"];
  const pick = allowMeta => {
    for(const s of order){
      const hit = ITEMS.find(it => stateOf(rec, it.id) === s && it.who === "station" && (allowMeta || !META_ITEMS[it.id]));
      if(hit) return hit;
    }
    for(const s of order){
      const hit = ITEMS.find(it => stateOf(rec, it.id) === s && (allowMeta || !META_ITEMS[it.id]));
      if(hit) return hit;
    }
    return null;
  };
  return pick(false) || pick(true);
}
function fieldOf(rec, k){
  const f = (rec.fields || []).find(x => x && x.k === k);
  if(!f || f.value == null || !String(f.value).trim()) return null;
  /* FAIL CLOSED (L41). A row the machine GUESSED is not a supplied row: it is
     not printed on a CV, not used as a headline, not carried anywhere. It shows
     up only in the dossier, marked UNRESOLVED, and it leaves that state only
     when a human supplies the value (`/intake set <name> :: <key> :: <value>`). */
  if(f.state === "unresolved") return null;
  return f;
}
function fieldLine(rec, k, label){
  const f = fieldOf(rec, k);
  if(f) return rr(label, esc2(f.value), f.ev ? "from " + esc2(f.ev) : "");
  return rr(label, '<span style="color:#e0473f">NOT SUPPLIED</span>', '<span style="opacity:.6">the station will not invent it</span>');
}

/* ==========================================================================
   6 · THE CARDS
   ========================================================================== */
function cardDesk(list, activeId){
  const now = new Date().toISOString().slice(0, 10);
  let body = "";
  body += rr("today", esc2(now), "");
  body += rr("on file", list.length + " student(s)", list.map(r => esc2(r.name) + (r.spelling ? " (" + esc2(r.spelling) + ")" : "")).join(" · "));
  let totalOpen = 0, totalDone = 0, inbox = 0;
  list.forEach(r => { const c = counts(r); totalOpen += c.open; totalDone += c.done; inbox += (r.inbox || []).length; });
  body += rr("open promises", totalOpen + " \u00b7 " + totalDone + " closed", "every promise the tutor made on the tapes, owned");
  body += rr("received", inbox + " thing(s) filed", "verbatim, kept forever");
  body += rr("the contract", "they capture \u00b7 the machine remembers", "rec 4 \u2014 \u201cyou obviously have to do the capture, because robots\u201d");

  let foot = "";
  list.forEach((r, i) => {
    const c = counts(r);
    const nxt = firstOpen(r);
    body += '<div class="rrow" style="align-items:flex-start"><b>' + (i + 1) + " \u00b7 " + esc2(r.name) + "</b>"
      + '<span class="vd">' + c.open + " open</span>"
      + '<div class="rd">' + (nxt ? "next: <b>" + esc2(nxt.title) + "</b> " + stChip(stateOf(r, nxt.id)) : "<b>everything closed</b>")
      + btns(['<button class="eval-tile" data-cmd="/intake open ' + esc2(r.id) + '">open the dossier</button>',
              '<button class="eval-tile" data-cmd="/intake owed ' + esc2(r.id) + '">the owed list</button>'])
      + "</div></div>";
  });
  if(!list.length){
    body += rr("nothing yet", "the intake is empty in this browser", "kv is keyed to this origin: a different browser is a different, empty station \u2014 not lost data. `/intake import <json>` restores a record.");
  }
  foot = "THE INTAKE \u00b7 the records live in this browser's kv \u2014 <b>no student's name, search or score is in the public source</b> \u00b7 "
       + "`/intake help` \u00b7 `/intake plan <name>` \u00b7 `/intake receive <name> :: <what arrived>`";
  return card("\ud83c\udf93 THE INTAKE \u2014 the app that remembers", body, foot);
}

function cardStudent(rec){
  const c = counts(rec);
  let body = "";
  body += rr("name", esc2(rec.name) + (rec.spelling ? " \u2014 " + esc2(rec.spelling) : ""), "the tutor spells it out loud on the tape");
  body += rr("on file since", esc2(String(rec.at || "").slice(0, 10)), esc2(rec.evidenceSet.join(" \u00b7 ")));
  body += rr("promises", c.open + " open \u00b7 " + c.done + " closed", "");
  body += rr("material received", (rec.inbox || []).length + " thing(s)", "");

  body += '<div class="rrow" style="display:block"><b>THE RECORD</b><div class="rd">'
        + (rec.fields || []).map(f => rr(esc2(f.label || f.k), esc2(f.value) + (f.state === "unresolved" ? ' <span style="color:#e0473f">\u2014 UNRESOLVED</span>' : ""), (f.ev ? "evidence \u00b7 " + esc2(f.ev) : "") + (f.state === "unresolved" ? " \u00b7 the machine guessed this; it must be confirmed before it is printed anywhere" : ""))).join("")
        + (rec.fields && rec.fields.length ? "" : '<div class="rd" style="opacity:.7">nothing recorded yet</div>')
        + "</div></div>";

  const nxt = firstOpen(rec);
  body += '<div class="rrow" style="display:block"><b>NEXT</b><div class="rd">'
        + (nxt ? "<b>" + esc2(nxt.title) + "</b> \u2014 " + OWNER_LABEL[nxt.who] + " " + stChip(stateOf(rec, nxt.id))
                + "<br>" + esc2(nxt.what)
                + btns(['<button class="eval-tile" data-cmd="/intake owed ' + esc2(rec.id) + '">the whole owed list</button>',
                        '<button class="eval-tile" data-cmd="/intake plan ' + esc2(rec.id) + '">this week</button>'])
          : "<b>everything is closed.</b> Nothing is owed.")
        + "</div></div>";
  return card("\ud83c\udf93 " + esc2(rec.name) + " \u2014 the dossier", body,
    "`/intake receive " + esc2(rec.name) + " :: <what arrived>` files what the sovereign is about to send \u00b7 `/intake export " + esc2(rec.name) + "`");
}

function cardOwed(list){
  const one = list.length === 1;
  let body = "";
  list.forEach(rec => {
    body += '<div class="rrow" style="display:block"><b>' + esc2(rec.name) + "</b><div class=\"rd\">";
    const oursFirst = ITEMS.slice().sort((a, b) => (a.who === b.who ? 0 : a.who === "station" ? -1 : 1));
    oursFirst.forEach(it => {
      const s = stateOf(rec, it.id);
      const got = inboxOf(rec, it.id).length;
      body += '<div style="padding:.25rem 0;border-top:1px solid rgba(168,85,247,.14)">'
            + '<span style="opacity:.55;font-family:var(--mono,monospace)">' + (it.who === "station" ? "WE " : "THEY") + "</span> "
            + "<b>" + esc2(it.title) + "</b> \u00b7 " + stChip(s)
            + (got ? ' \u00b7 <span style="color:#5ed5eb">' + got + " received</span>" : "")
            + '<br><span style="opacity:.78">' + esc2(it.what) + "</span>"
            + (got ? "<br><span style=\"opacity:.62;font-size:.8em\">in: " + inboxOf(rec, it.id).slice(-3).map(x => esc2(x.label || x.value).slice(0, 90)).join(" \u00b7 ") + "</span>" : "")
            + '<br><span style="opacity:.5;font-size:.78em">evidence \u00b7 ' + esc2(it.ev) + "</span>"
            + "</div>";
    });
    body += "</div></div>";
  });
  return card("\ud83d\udcdc THE OWED LIST \u2014 every promise, and whose it is" + (one ? " \u2014 " + esc2(list[0].name) : ""), body,
    "an item moves when material arrives, not when anyone remembers \u00b7 `/intake close <name> :: <item id>` closes one by hand, with the reason");
}

function cardPlan(rec){
  const open = ITEMS.filter(it => stateOf(rec, it.id) !== "done");
  const ours = open.filter(it => it.who === "station");
  const theirs = open.filter(it => it.who === "student");
  let body = "";
  body += rr("this week", ours.length + " for us \u00b7 " + theirs.length + " for " + esc2(rec.name),
    "the tutor's own arithmetic: about an hour a week for the presentation, spread out, and ~30 minutes per application");
  body += '<div class="rrow" style="display:block"><b>WE DO</b><div class="rd">'
        + (ours.length ? ours.map((it, i) => (i + 1) + ". <b>" + esc2(it.title) + "</b> " + stChip(stateOf(rec, it.id))
            + "<br><span style=\"opacity:.75\">" + it.steps.map(s => esc2(s)).join(" \u2192 ") + "</span>"
            + (it.gate ? '<br><span style="color:#e6b43c;font-size:.85em">gate \u00b7 ' + esc2(it.gate) + "</span>" : "")).join('<div style="height:.45rem"></div>')
          : "<i>nothing \u2014 we owe nothing.</i>") + "</div></div>";
  body += '<div class="rrow" style="display:block"><b>THEY DO</b><div class="rd">'
        + (theirs.length ? theirs.map((it, i) => (i + 1) + ". <b>" + esc2(it.title) + "</b> " + stChip(stateOf(rec, it.id))
            + "<br><span style=\"opacity:.75\">" + it.steps.map(s => esc2(s)).join(" \u2192 ") + "</span>").join('<div style="height:.45rem"></div>')
          : "<i>nothing \u2014 they owe nothing.</i>") + "</div></div>";
  const missing = (rec.fields || []).filter(f => f.state === "unresolved");
  if(missing.length) body += rr("before anything is printed",
    missing.length + " unresolved — " + missing.map(f => esc2(f.label || f.k)).join(", "),
    "the station will not put a guessed name, degree or date on a CV");
  return card("\ud83e\udded " + esc2(rec.name) + " \u2014 this week", body,
    "`/intake receive " + esc2(rec.name) + " :: <what arrived>` \u00b7 `/intake owed " + esc2(rec.id) + "`");
}

/* ==========================================================================
   7 · MATERIAL — what the sovereign sends, and how an item moves
   L38: the raw thing is kept verbatim in the inbox BEFORE anything is derived
   from it, and it is kept forever. An item moves when material arrives — never
   because someone remembered that it probably had.
   ========================================================================== */
const MATCH = [
  ["cv",         ["cv", "c.v", "resume", "curriculum", "r\u00e9sum\u00e9"]],
  ["linkedin",   ["linkedin", "linked in", "li profile"]],
  ["headshot",   ["headshot", "selfie", "photo", "picture", "portrait", "passport photo"]],
  ["phonics",    ["phonics", "phoneme", "sound", "pronunciation", "accent", "minimal pair"]],
  ["present",    ["presentation", "present ", "recorded video", "the recording", "speech"]],
  ["apps",       ["application", "applied", "apply", "job", "vacanc", "company", "hired"]],
  ["interview",  ["interview", "zoom call", "question", "blood type", "married"]],
  ["umbrella",   ["umbrella", "brand", "logo", "business card", "my site", "website"]],
  ["presence",   ["facebook", "tiktok", "whatsapp", "instagram", "social", "profile photo"]],
  ["work",       ["roblox", "game", "3d", "model", "consult", "train 67", "unreal", "blender"]],
  ["portfolio",  ["portfolio", "magazine", "project", "camera", "drawing", "design", "poster", "video edit"]]
];
function matchItem(text){
  const t = " " + String(text || "").toLowerCase() + " ";
  let best = null, bestN = 0;
  MATCH.forEach(([id, keys]) => {
    let n = 0;
    keys.forEach(k => { if(t.indexOf(k) >= 0) n++; });
    if(n > bestN){ bestN = n; best = id; }
  });
  if(best) return best;
  if(/https?:\/\//i.test(t)) return "portfolio";
  return "portfolio";
}
function looksLink(s){ return /^(https?:\/\/|www\.)\S+/i.test(String(s || "").trim()); }

/* `/intake receive <name> :: <what>`  (or `:: <item id> :: <what>`) */
async function doReceive(arg, kindHint){
  await kvReady();
  const parts = String(arg || "").split(/\s*::\s*/).map(s => s.trim()).filter(s => s !== "");
  if(parts.length < 2) return bubble(card("\u26a0 THE INTAKE \u2014 nothing to file",
    rr("the shape", "<b>/intake receive &lt;name&gt; :: &lt;what arrived&gt;</b>", "or <b>/intake receive &lt;name&gt; :: &lt;item id&gt; :: &lt;what&gt;</b> \u00b7 items: " + ITEMS.map(i => i.id).join(" \u00b7 ")),
    "`/intake help`"));
  const who = parts[0];
  const r = await resolve(who);
  if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake` lists who is on file"));
  const rec = r.rec;
  let itemId = null, what = parts[1], label = "";
  if(parts.length >= 3 && BY_ID[parts[1].toLowerCase()]){ itemId = parts[1].toLowerCase(); what = parts.slice(2).join(" :: "); }
  else { itemId = matchItem(parts[1]); what = parts.slice(1).join(" :: "); }
  /* split "label :: value" further if the sovereign gave one */
  const m = what.match(/^([^:]{2,40}):\s*([\s\S]+)$/);
  if(m && !looksLink(what)){ label = m[1].trim(); what = m[2].trim(); }
  if(!label) label = (looksLink(what) ? "link" : String(what).slice(0, 48)) + (String(what).length > 48 ? "\u2026" : "");
  const entry = { at: new Date().toISOString(), kind: kindHint || (looksLink(what) ? "link" : "text"), label: label, value: String(what), item: itemId };
  rec.inbox = rec.inbox || [];
  rec.inbox.push(entry);
  const prev = stateOf(rec, itemId);
  rec.owed = rec.owed || {};
  if(prev === "not_started" || prev === "waiting" || !rec.owed[itemId]) rec.owed[itemId] = { state: "received", at: entry.at };
  note(rec, "received into " + itemId + ": " + label);
  const ok = await save(rec);
  log("intake receive " + rec.id + " -> " + itemId);
  const it = BY_ID[itemId];
  const after = stateOf(rec, itemId);
  let body = "";
  body += rr("filed under", "<b>" + esc2(it ? it.title : itemId) + "</b>", "matched on what you typed \u2014 say <b>" + esc2(itemId) + "</b> in the middle to file it somewhere else");
  body += rr("the entry", esc2(label), esc2(entry.kind) + " \u00b7 kept verbatim, " + esc2(entry.at.slice(0, 16).replace("T", " ")));
  body += rr("state", (prev !== after ? esc2(prev) + " \u2192 " : "") + stChip(after), "an item moves when material arrives");
  const nxt = firstOpen(rec);
  body += rr("next", nxt ? "<b>" + esc2(nxt.title) + "</b> \u00b7 " + OWNER_LABEL[nxt.who] : "everything closed", nxt ? esc2(nxt.steps[0]) : "");
  return bubble(card("\ud83d\udce5 RECEIVED \u2014 " + esc2(rec.name), body,
    (ok ? "" : '<span style="color:#e0473f">\u26a0 the write did NOT go through \u2014 kv refused it. Nothing is filed.</span><br>')
    + "`/intake " + esc2(rec.id) + "` \u00b7 `/intake owed " + esc2(rec.id) + "`"));
}

/* ==========================================================================
   8 · THE BUILDERS — a record becomes an artifact.
   FAIL-CLOSED: a field the student has not supplied prints as a RULED LINE and
   is counted in the footer. Nothing is guessed onto a CV.
   ========================================================================== */
const CV_FIELDS = [
  ["headline",  "Headline",            "one line: what they are, and what they want"],
  ["phone",     "Phone",               "the number they will answer"],
  ["email",     "Email",               ""],
  ["city",      "City",                "where they are, and whether they can work remotely"],
  ["links",     "Links",               "portfolio \u00b7 LinkedIn \u00b7 anything they made (one per line)"],
  ["summary",   "Summary",             "2\u20133 lines, in their own words"],
  ["school",    "School",              ""],
  ["degree",    "Degree",              "the name ON the certificate \u2014 never the machine's guess"],
  ["dates",     "Dates",               "from \u2192 to"],
  ["gpa",       "Result / GPA",        "only if they want it shown"],
  ["experience","Experience",          "role \u00b7 place \u00b7 what they actually did (one per line)"],
  ["skills",    "Skills",              "the tools they really use (one per line)"],
  ["languages", "Languages",           "Vietnamese \u00b7 English \u2014 with the level"],
  ["photo",     "Headshot",            "the file or the URL"]
];
function cvRows(rec){
  const have = [], miss = [];
  CV_FIELDS.forEach(([k, label, hint]) => { (fieldOf(rec, k) ? have : miss).push([k, label, hint]); });
  return { have, miss };
}
function cardCV(rec){
  const { have, miss } = cvRows(rec);
  let body = "";
  body += rr("ready", have.length + " of " + CV_FIELDS.length + " rows", miss.length ? miss.length + " still missing \u2014 the station will NOT invent them" : "the paper can be printed");
  have.forEach(([k, label]) => { const f = fieldOf(rec, k); body += rr(esc2(label), esc2(String(f.value).slice(0, 220)), f.ev ? "from " + esc2(f.ev) : ""); });
  if(miss.length){
    body += '<div class="rrow" style="display:block"><b>MISSING</b><div class="rd">'
          + miss.map(([k, label, hint]) => "&bull; <b>" + esc2(label) + "</b>" + (hint ? " \u2014 <span style=\"opacity:.7\">" + esc2(hint) + "</span>" : "")
              + '<br><span style="opacity:.62;font-size:.82em;font-family:var(--mono,monospace)">/intake set ' + esc2(rec.name) + " :: " + esc2(k) + " :: &lt;the value&gt;</span>").join('<div style="height:.4rem"></div>')
          + "</div></div>";
  }
  const foot = miss.length
    ? "`/intake set " + esc2(rec.name) + " :: degree :: <the name on the certificate>` \u00b7 when every row is in: `/intake cv " + esc2(rec.name) + " build`"
    : "`/intake cv " + esc2(rec.name) + " build` prints it \u00b7 `/intake export " + esc2(rec.name) + "` keeps it";
  return card("\ud83d\udcc4 THE CV \u2014 " + esc2(rec.name), body, foot);
}
function lines(v){ return String(v == null ? "" : v).split(/\n|\u00b7|\|/).map(s => s.trim()).filter(Boolean); }
function buildCV(rec){
  const g = k => (fieldOf(rec, k) ? String(fieldOf(rec, k).value) : "");
  const miss = [];
  const need = (k, label, val) => { if(!val) miss.push(label); return val; };
  const name = need("name", "Name", rec.name || "");
  const headline = need("headline", "Headline", g("headline"));
  const summary = need("summary", "Summary", g("summary"));
  const school = need("school", "School", g("school"));
  const degree = need("degree", "Degree", g("degree"));
  const dates = g("dates"), gpa = g("gpa");
  const contact = [g("phone"), g("email"), g("city")].filter(Boolean);
  const links = lines(g("links"));
  const exp = lines(g("experience"));
  const skills = lines(g("skills"));
  const langs = lines(g("languages"));
  const rule = t => '<div class="rule" title="nothing supplied \u2014 the station will not invent this">' + esc2(t) + "</div>";
  const part = (title, html) => html ? '<section><h2>' + esc2(title) + "</h2>" + html + "</section>" : '<section><h2>' + esc2(title) + "</h2>" + rule(title.toLowerCase() + " \u2014 not supplied") + "</section>";
  const ul = a => a.length ? "<ul>" + a.map(x => "<li>" + esc2(x) + "</li>").join("") + "</ul>" : "";
  const body =
      '<header><h1>' + esc2(name) + "</h1>"
    + (headline ? '<div class="hl">' + esc2(headline) + "</div>" : '<div class="hl rule">headline \u2014 not supplied</div>')
    + '<div class="ct">' + (contact.length ? contact.map(esc2).join(" \u00b7 ") : '<span class="rule">phone \u00b7 email \u00b7 city \u2014 not supplied</span>') + "</div>"
    + (links.length ? '<div class="ct">' + links.map(esc2).join(" \u00b7 ") + "</div>" : "")
    + "</header>"
    + part("Profile", summary ? "<p>" + esc2(summary) + "</p>" : "")
    + part("Education", (school || degree || dates || gpa)
        ? "<p>" + (degree ? "<b>" + esc2(degree) + "</b>" : '<span class="rule">degree \u2014 not supplied</span>')
          + (school ? " \u00b7 " + esc2(school) : "") + (dates ? " \u00b7 " + esc2(dates) : "") + (gpa ? " \u00b7 " + esc2(gpa) : "") + "</p>" : "")
    + part("Experience & Projects", ul(exp))
    + part("Skills", ul(skills))
    + part("Languages", ul(langs));
  const foot = miss.length
    ? '<footer class="warn">' + miss.length + " row(s) were blank when this was printed: " + esc2(miss.join(", "))
      + ". The station left them blank on purpose \u2014 <b>a guessed degree is worse than a blank one.</b> Re-run /intake cv " + esc2(rec.id) + " build after they are supplied.</footer>"
    : '<footer>Every row on this page came from the record. Nothing was invented.</footer>';
  return printHTML(name + " \u2014 CV", body + foot);
}
function cardLinkedIn(rec){
  const g = k => (fieldOf(rec, k) ? String(fieldOf(rec, k).value) : "");
  const head = g("headline") || g("degree") || "";
  const steps = BY_ID.linkedin.steps;
  let body = "";
  body += rr("the asset", "a profile a recruiter can find and trust", "the tutor's own target, quoted on the tape: <b>600 connections</b>");
  body += rr("headline", head ? esc2(head) : '<span style="color:#e0473f">nothing on file \u2014 the CV headline feeds this</span>', "one line, the role they want, spelled the way the market spells it");
  body += rr("photo", fieldOf(rec, "photo") ? esc2(String(fieldOf(rec, "photo").value)) : "the headshot \u2014 shoot it first", "");
  body += '<div class="rrow" style="display:block"><b>THE BUILD</b><div class="rd">' + steps.map((s, i) => (i + 1) + ". " + esc2(s)).join("<br>") + "</div></div>";
  body += rr("readiness", (cvRows(rec).have.length) + "/" + CV_FIELDS.length + " CV rows", "the LinkedIn is built from the same intake \u2014 do the CV first and this is an hour");
  return card("\ud83d\udd17 THE LINKEDIN \u2014 " + esc2(rec.name), body,
    "`/intake cv " + esc2(rec.name) + "` \u00b7 the same intake feeds both");
}
function cardHeadshot(rec){
  const f = fieldOf(rec, "photo");
  let body = "";
  body += rr("status", f ? "supplied \u2014 " + esc2(String(f.value).slice(0, 90)) : stChip("waiting"), f ? "" : "the shoot has not happened");
  body += '<div class="rrow" style="display:block"><b>THE SHOOT</b><div class="rd">'
        + "1. plain wall, near a window, no flash<br>2. chest up, eyes to the lens, neutral or a light smile<br>"
        + "3. shoot 20, pick 1<br>4. crop passport-ish (head and shoulders, space above the head)<br>"
        + "5. the SAME photo goes on the CV and the LinkedIn<br>"
        + '<span style="opacity:.75">the tape settles the wardrobe: a suit and a white shirt, or black suit and white shirt \u2014 a coloured tie is optional, semi-casual is allowed</span>'
        + "</div></div>";
  return card("\ud83d\udcf8 THE HEADSHOT \u2014 " + esc2(rec.name), body,
    "`/intake receive " + esc2(rec.name) + " :: headshot :: <the url or what you shot>`");
}

/* ---- print: one standalone sheet, A4, no station chrome (a CV should not wear
        a sci-fi console). Same idiom as the print room: .html with @page. ---- */
function printHTML(title, body){
  return "<!doctype html><html><head><meta charset=\"utf-8\"><title>" + esc2(title) + "</title><style>"
    + "@page{size:A4;margin:16mm 15mm}"
    + "*{box-sizing:border-box}body{margin:0;font:11.5pt/1.5 Georgia,'Times New Roman',serif;color:#15171c;background:#fff}"
    + "header{border-bottom:2px solid #15171c;padding-bottom:8px;margin-bottom:14px}"
    + "h1{margin:0;font-size:21pt;letter-spacing:.4px}"
    + ".hl{margin-top:3px;font-size:11.5pt;color:#333}"
    + ".ct{margin-top:2px;font-size:9.5pt;color:#555}"
    + "section{margin:12px 0}"
    + "h2{margin:0 0 4px;font-size:9.5pt;letter-spacing:1.6px;text-transform:uppercase;color:#7a5a12;border-bottom:1px solid #ddd;padding-bottom:2px}"
    + "p{margin:0 0 6px}ul{margin:0;padding-left:16px}li{margin-bottom:3px}"
    + ".rule{border-bottom:1px dotted #999;color:#999;font-style:italic;display:inline-block;min-width:45%}"
    + "footer{margin-top:18px;padding-top:8px;border-top:1px solid #ddd;font-size:8.5pt;color:#666}"
    + "footer.warn{color:#8a1f14;border-top:1px solid #c9a0a0}"
    + "@media print{a{color:inherit;text-decoration:none}}"
    + "</style></head><body>" + body + "</body></html>";
}
function download(filename, text, mime){
  try{
    const blob = new Blob([text], { type: mime || "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { try{ URL.revokeObjectURL(url); a.remove(); }catch(e){} }, 2500);
    return true;
  }catch(e){ return false; }
}
function slug(s){ return String(s || "record").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "record"; }

/* ==========================================================================
   9 · THE INSTRUMENTS
   ========================================================================== */
function cardPhonics(arg){
  const which = String(arg || "").trim().toLowerCase();
  if(which === "pairs"){
    let body = '<div class="rrow" style="display:block"><b>THE COLLISIONS</b><div class="rd">'
      + MINIMAL_PAIRS.map(([name, pairs]) => "<b>" + esc2(name) + "</b><br><span style=\"opacity:.85\">" + esc2(pairs) + "</span>").join('<div style="height:.45rem"></div>')
      + "</div></div>";
    return card("\ud83d\udde3 MINIMAL PAIRS \u2014 say both, ten times", body, "the mouth learns the difference faster than the ear \u00b7 `/intake phonics <name> 44` for the full set");
  }
  let body = "";
  body += rr("what this is", "a SPEAKING test, not a reading test",
    "the tutor's own line: \u201cwe get to use that conversation we've just had to test your 44 phonics\u201d \u2014 and he refused to have them read");
  body += rr("how it runs", "sit it \u2192 record it \u2192 transcribe it \u2192 mark it",
    "`/transcribe` takes the recording; this desk reads the transcript back and marks the sounds that slipped");
  body += '<div class="rrow" style="display:block"><b>THE 44 SOUNDS</b><div class="rd" style="column-count:2;column-gap:1rem;font-size:.86em;line-height:1.5">'
    + PHONEMES.map(([p, sp, ex]) => "<b>" + esc2(p) + "</b> <span style=\"opacity:.65\">" + esc2(sp) + "</span> \u2014 <span style=\"opacity:.85\">" + esc2(ex) + "</span>").join("<br>")
    + "</div></div>";
  body += rr("then drill", "only the sounds that slipped \u2014 ten minutes a day", "the rest of the hour is the weekly recording (\u201cwe'll do that like a few times a week\u201d)");
  body += rr("the pairs", MINIMAL_PAIRS.length + " collision sets", "`/intake phonics <name> pairs`");
  return card("\ud83d\udde3 THE 44-PHONEME INSTRUMENT", body,
    "mark a sound after transcribing: `/intake mark <name> :: <sound> :: ok|drill` \u00b7 `<sound>` is anything you can type, e.g. <b>th/s</b>, <b>v/w</b>, <b>short i</b>");
}
function cardPresent(rec, topic){
  const f = fieldOf(rec, "present_topic");
  const t = topic || (f ? String(f.value) : "");
  let body = "";
  body += rr("the dose", "15\u201320 minutes \u00b7 a few times a week", "the tutor's own arithmetic: about an hour a week, spread out \u2014 \u201cit'll build up like a snowball\u201d");
  body += rr("topic", t ? esc2(t) : '<span style="color:#e6b43c">none chosen yet</span>', t ? "" : "set one: `/intake present " + esc2(rec.name) + " :: <the subject>` \u2014 it is THEIR subject, that is the point");
  body += '<div class="rrow" style="display:block"><b>THE SHAPE</b><div class="rd">'
        + "1. say what it is, in one sentence (0:00\u20130:30)<br>"
        + "2. three points, in order (to ~12:00)<br>"
        + "3. the example that makes it real (to ~17:00)<br>"
        + "4. what you think about it (to 20:00)<br>"
        + '<span style="opacity:.75">no script, no reading \u2014 notes with five words on them, at most</span></div></div>';
  body += '<div class="rrow" style="display:block"><b>THE READING SHEET</b><div class="rd">'
        + "when it comes back, mark it 1\u20135 on six rows, and give exactly ONE correction:<br>"
        + "content &bull; structure &bull; delivery &bull; language &bull; fluency &bull; pronunciation"
        + '<br><span style="opacity:.7">one correction per run \u2014 \u201cI\u2019m not trying to overwhelm you guys\u201d and \u201cI\u2019m gonna be a little bit harder on you\u201d are the same sentence said twice</span></div></div>';
  const runs = (rec.inbox || []).filter(x => x.item === "present");
  body += rr("runs received", runs.length ? runs.length + " \u2014 last " + esc2(String(runs[runs.length - 1].at).slice(0, 10)) : "none yet", "");
  return card("\ud83c\udfac THE WEEKLY RECORDED PRESENTATION \u2014 " + esc2(rec.name), body,
    "`/transcribe` the recording when it lands \u00b7 `/intake receive " + esc2(rec.name) + " :: present :: <the link>`");
}
function cardApps(rec){
  const apps = rec.apps || [];
  const wk = apps.filter(a => { const d = new Date(a.at), n = new Date(); return (n - d) < 7 * 864e5; }).length;
  const mins = apps.reduce((s, a) => s + (Number(a.mins) || 0), 0);
  let body = "";
  body += rr("on the board", apps.length + " logged \u00b7 " + wk + " in the last 7 days", "the tutor's own target, said out loud on the tape: <b>12 a week</b>");
  body += rr("the arithmetic", (mins ? (mins + " minutes logged \u00b7 ~" + Math.round(mins / Math.max(apps.length, 1)) + " min each") : "nothing logged yet"),
    "his own answer when asked how long one takes: <b>\u201cjust around 30\u201d</b> \u2014 so 12 is about six hours of work, and that is the number to plan around");
  if(apps.length){
    body += '<div class="rrow" style="display:block"><b>THE BOARD</b><div class="rd" style="font-size:.88em">'
      + apps.slice(-12).reverse().map(a => "&bull; " + esc2(String(a.at).slice(0, 10)) + " \u2014 <b>" + esc2(a.company || "\u2014") + "</b>"
          + (a.role ? " \u00b7 " + esc2(a.role) : "") + (a.mins ? " \u00b7 " + esc2(a.mins) + " min" : "")).join("<br>") + "</div></div>";
  }
  body += rr("what each one asks", "per-company question sets", "the tape: different questions per company, a college score, and later a paper check of it");
  return card("\ud83d\udcbc THE APPLICATIONS \u2014 " + esc2(rec.name), body,
    "log one: `/intake app " + esc2(rec.name) + " :: <company> :: <role> :: <minutes>` \u00b7 `/intake apps " + esc2(rec.name) + "`");
}
function cardInterview(rec, mode){
  if(String(mode || "").trim().toLowerCase() === "run"){
    let body = '<div class="rrow" style="display:block"><b>THE RUN</b><div class="rd">'
      + "1. a call, on camera, full length \u2014 the real mode is a screen, not a room<br>"
      + "2. the tutor asks from the bank below, cold, in a believable order<br>"
      + "3. record the answer to every question, do not coach mid-answer<br>"
      + "4. mark the three that broke<br>"
      + "5. rewrite only those answers, then run it again<br>"
      + "6. repeat until it is boring to say \u2014 boring is the target</div></div>";
    body += rr("held", (rec.interview && rec.interview.runs ? rec.interview.runs.length : 0) + " run(s)", "`/intake interview " + esc2(rec.name) + " :: held` records one");
    return card("\ud83c\udfa4 THE DRILL \u2014 " + esc2(rec.name), body, "`/intake interview " + esc2(rec.name) + "` for the bank");
  }
  let body = "";
  BANK.forEach(([group, qs]) => {
    body += '<div class="rrow" style="display:block"><b>' + esc2(group) + '</b><div class="rd">'
          + qs.map(q => "&bull; " + esc2(q)).join("<br>") + "</div></div>";
  });
  body += rr("why the first group is first", "they were actually asked, on the tape", "\u201cWhat's your blood type? Are you married yet? Why not?\u201d \u2014 the tutor repeated them out loud as the real thing. Do not flinch at them; answer them.");
  return card("\ud83c\udfa4 THE INTERVIEW BANK \u2014 " + esc2(rec.name), body,
    "`/intake interview " + esc2(rec.name) + " run` for the drill \u00b7 `/intake interview " + esc2(rec.name) + " :: held` records a run");
}
function cardUmbrella(rec){
  const name = fieldOf(rec, "umbrella");
  let body = "";
  body += rr("the umbrella", name ? esc2(String(name.value)) : '<span style="color:#e6b43c">not named yet</span>',
    "`/intake set " + esc2(rec.name) + " :: umbrella :: <the name>`");
  body += rr("why", "one name, many doors", "the tutor's own words: \u201cif you just stick with one, then you can only apply to one sort of thing \u2014 but if you expand \u2026 that expands your \u2026\u201d");
  body += '<div class="rrow" style="display:block"><b>THE PIECES \u2014 the sub-brands</b><div class="rd">'
        + "everything the portfolio intake has actually delivered becomes a piece under the umbrella. Nothing that has not been sent can be a piece."
        + '<br><span style="opacity:.7">the sovereign\u2019s own site is the worked example: one holding name, every service beneath it</span></div></div>';
  const got = inboxOf(rec, "portfolio");
  body += rr("pieces on file", got.length ? got.length + " \u2014 " + got.slice(-4).map(x => esc2(String(x.label).slice(0, 40))).join(" \u00b7 ") : "none yet", got.length ? "" : "the gate is the portfolio intake");
  return card("\ud83c\udff7 THE UMBRELLA \u2014 " + esc2(rec.name), body,
    "`/intake receive " + esc2(rec.name) + " :: portfolio :: <what they sent>`");
}
function cardPresence(rec){
  const steps = BY_ID.presence.steps;
  let body = "";
  body += rr("where the business is", "Facebook, and TikTok more than anyone admits",
    "the tape: \u201ca lot of business is done in Vietnam on Facebook \u2026 believe it or not a lot is done on TikTok\u201d");
  body += rr("the global channel", "WhatsApp", "\u201cWhatsApp is the biggest for global\u201d \u2014 one number, on the CV, answered");
  body += '<div class="rrow" style="display:block"><b>THE BUILD</b><div class="rd">' + steps.map((s, i) => (i + 1) + ". " + esc2(s)).join("<br>") + "</div></div>";
  body += rr("the line not to cross", "do not invent an audience", "\u201cwe just want to drive traffic, get eyes on you, and target recruiters\u201d \u2014 the account is a shop window, not a personality");
  return card("\ud83d\udcf1 THE PRESENCE \u2014 " + esc2(rec.name), body,
    "`/intake set " + esc2(rec.name) + " :: social :: <the handles>`");
}
function cardWork(rec){
  let body = "";
  body += rr("what it is", "a credit on a real, shipped product", "the tape: the tutor\u2019s own game \u2014 \u201cyou could say you helped consult and design for \u2026\u201d");
  body += rr("why it is worth more than a certificate", "work that exists beats a course that does not", "\u201cit actually gives you hundreds of models to make and I only need to take about 100 \u2014 and you can put that in your CV as well, if you help me\u201d");
  body += '<div class="rrow" style="display:block"><b>HOW IT EARNS ITS LINE</b><div class="rd">'
        + "1. scope ONE piece they can genuinely own<br>2. it ships<br>3. the credit goes on the CV and the LinkedIn in plain words<br>"
        + "4. they can talk about it for five minutes in an interview without notes"
        + '<br><span style="opacity:.7">the cost line on the tape was the sovereign\u2019s: \u201cwe\u2019re just sitting there using like my $20 just to learn together\u201d</span></div></div>';
  return card("\ud83d\udee0 A NAMEABLE CREDIT \u2014 " + esc2(rec.name), body,
    "gated on the sovereign\u2019s word for what may be credited \u00b7 `/intake set " + esc2(rec.name) + " :: credit :: <the line to print>`");
}
function cardFiles(rec){
  const inbox = (rec.inbox || []).slice().reverse();
  let body = "";
  if(!inbox.length) body = rr("the inbox", "empty", "nothing has arrived yet \u2014 `/intake receive " + esc2(rec.name) + " :: <what arrived>`");
  else body = '<div class="rrow" style="display:block"><b>' + inbox.length + ' THING(S) RECEIVED</b><div class="rd" style="font-size:.86em">'
    + inbox.slice(0, 40).map(x => '<div style="padding:.22rem 0;border-top:1px solid rgba(168,85,247,.14)">'
        + '<span style="opacity:.55;font-family:var(--mono,monospace)">' + esc2(String(x.at).slice(0, 16).replace("T", " ")) + "</span> "
        + '<b>' + esc2(x.label) + "</b> \u00b7 " + esc2(x.kind) + " \u00b7 under <b>" + esc2(x.item) + "</b>"
        + '<div style="opacity:.8;word-break:break-word">' + esc2(String(x.value).slice(0, 400)) + "</div></div>").join("")
    + "</div></div>";
  return card("\ud83d\udce6 THE INBOX \u2014 " + esc2(rec.name), body,
    "verbatim, kept forever (L38) \u00b7 `/intake export " + esc2(rec.name) + "` keeps it outside the browser too");
}
function cardHelp(){
  const rows = [
    ["/intake", "the desk \u2014 who is on file, and what is open"],
    ["/intake <name>", "one dossier (by name, by number, or `open <name>`)"],
    ["/intake owed [<name>]", "every promise, its owner and its state"],
    ["/intake plan <name>", "this week: what we do, what they do"],
    ["/intake receive <name> :: <what arrived>", "FILE something \u2014 the item moves to MATERIAL IN"],
    ["/intake receive <name> :: <item id> :: <what>", "file it under a named item instead of the guess"],
    ["/intake files <name>", "the inbox \u2014 everything received, verbatim"],
    ["/intake set <name> :: <key> :: <value>", "put a row on the record (degree, headline, phone, umbrella, \u2026)"],
    ["/intake note <name> :: <text>", "keep a line of evidence or a decision"],
    ["/intake close|reopen <name> :: <item>", "move an item by hand, with the reason recorded"],
    ["/intake cv <name> [build]", "the CV \u2014 what is ready, what is MISSING, and the printed sheet"],
    ["/intake linkedin <name>", "the profile build from the same intake"],
    ["/intake headshot <name>", "the shoot"],
    ["/intake phonics <name> [44|pairs]", "the 44-sound instrument \u2014 a SPEAKING test"],
    ["/intake mark <name> :: <sound> :: ok|drill", "mark a sound after the transcription comes back"],
    ["/intake present <name> [:: <topic>]", "the weekly 15\u201320 minute recorded presentation"],
    ["/intake apps <name>", "the application board and the 12 \u00d7 ~30 min arithmetic"],
    ["/intake app <name> :: <company> :: <role> :: <mins>", "log one application"],
    ["/intake interview <name> [run]", "the bank of questions actually asked, and the drill"],
    ["/intake umbrella <name>", "the umbrella and its sub-brands"],
    ["/intake presence <name>", "Facebook \u00b7 TikTok \u00b7 WhatsApp"],
    ["/intake work <name>", "the nameable credit on a real product"],
    ["/intake new <name> [:: <spelling>]", "open a new record (every item NOT STARTED)"],
    ["/intake forget <name> confirm", "delete a record from this browser"],
    ["/intake export [<name>|all]", "download the record(s) as JSON"],
    ["/intake import <json>", "restore a record (or use the file picker)"]
  ];
  const body = '<div class="rrow" style="display:block"><b>THE COMMANDS</b><div class="rd" style="font-family:var(--mono,monospace);font-size:.86em">'
    + rows.map(([c, d]) => "<b>" + esc2(c) + "</b><br><span style=\"opacity:.75;font-family:var(--sans,sans-serif)\">" + esc2(d) + "</span>").join('<div style="height:.4rem"></div>')
    + "</div></div>";
  const items = '<div class="rrow" style="display:block"><b>THE ITEMS</b><div class="rd">'
    + ITEMS.map(it => "<b>" + esc2(it.id) + "</b> \u2014 " + esc2(it.title) + " <span style=\"opacity:.6\">(" + (it.who === "station" ? "we owe it" : "they owe it") + ")</span>").join("<br>")
    + "</div></div>";
  return card("\ud83c\udf93 THE INTAKE \u2014 how it works", body + items,
    "the records live in this browser\u2019s kv; <b>the public source holds the method, never a student</b>");
}

/* ==========================================================================
   10 · MOVING AN ITEM BY HAND
   ========================================================================== */
async function doSet(arg){
  const parts = String(arg || "").split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
  if(parts.length < 3) return bubble(card("\u26a0 THE INTAKE \u2014 the shape is wrong",
    rr("it is", "/intake set &lt;name&gt; :: &lt;key&gt; :: &lt;value&gt;", "e.g. <b>/intake set Quan :: degree :: Bachelor of \u2026</b>"), "`/intake help`"));
  const r = await resolve(parts[0]); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
  const rec = r.rec, key = parts[1].toLowerCase().replace(/\s+/g, "_"), value = parts.slice(2).join(" :: ");
  rec.fields = rec.fields || [];
  const label = (CV_FIELDS.find(f => f[0] === key) || [])[1] || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "));
  const i = rec.fields.findIndex(f => f.k === key);
  const f = { k: key, label: label, value: value, ev: "supplied to the station, " + new Date().toISOString().slice(0, 10), state: "stated" };
  if(i >= 0) rec.fields[i] = Object.assign(rec.fields[i], f); else rec.fields.push(f);
  note(rec, "set " + key);
  const ok = await save(rec);
  log("intake set " + rec.id + "." + key);
  const solved = f.state === "unresolved" ? "" : "";
  let body = rr("set", "<b>" + esc2(label) + "</b>", "");
  body += rr("value", esc2(value.length > 300 ? value.slice(0, 300) + "\u2026" : value), "");
  const { have, miss } = cvRows(rec);
  body += rr("the CV now", have.length + "/" + CV_FIELDS.length + " rows", miss.length ? "still missing: " + miss.map(m => esc2(m[1])).join(", ") : "every row is in \u2014 `/intake cv " + esc2(rec.name) + " build`");
  return bubble(card("\u270d THE RECORD \u2014 " + esc2(rec.name), body,
    (ok ? "" : '<span style="color:#e0473f">\u26a0 the write did NOT go through</span><br>') + "`/intake " + esc2(rec.id) + "`"));
}
async function doClose(arg, reopen){
  const parts = String(arg || "").split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
  if(parts.length < 2) return bubble(card("\u26a0 THE INTAKE", rr("the shape", "/intake close &lt;name&gt; :: &lt;item&gt; [:: &lt;why&gt;]", "items: " + ITEMS.map(i => i.id).join(" \u00b7 ")), "`/intake help`"));
  const r = await resolve(parts[0]); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
  const rec = r.rec, item = parts[1].toLowerCase();
  if(!BY_ID[item]) return bubble(card("\u26a0 THE INTAKE", rr("no such item", esc2(item), "items: " + ITEMS.map(i => i.id).join(" \u00b7 ")), "`/intake help`"));
  rec.owed = rec.owed || {};
  rec.owed[item] = Object.assign({}, rec.owed[item] || {}, { state: reopen ? "not_started" : "done", at: new Date().toISOString(), note: parts.slice(2).join(" :: ") || (reopen ? "reopened by hand" : "closed by hand") });
  note(rec, (reopen ? "reopened " : "closed ") + item + (parts[2] ? ": " + parts.slice(2).join(" :: ") : ""));
  const ok = await save(rec);
  log("intake " + (reopen ? "reopen " : "close ") + rec.id + "." + item);
  const c = counts(rec);
  return bubble(card((reopen ? "\u21ba REOPENED \u2014 " : "\u2714 CLOSED \u2014 ") + esc2(rec.name),
    rr("item", "<b>" + esc2(BY_ID[item].title) + "</b>", esc2(BY_ID[item].ev))
    + rr("state", stChip(stateOf(rec, item)), reopen ? "it is owed again" : "closed by hand \u2014 the reason is on the record")
    + rr("the board", c.open + " open \u00b7 " + c.done + " closed", ""),
    (ok ? "" : '<span style="color:#e0473f">\u26a0 the write did NOT go through</span><br>') + "`/intake owed " + esc2(rec.id) + "`"));
}
async function doApp(arg){
  const parts = String(arg || "").split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
  if(parts.length < 3) return bubble(card("\u26a0 THE INTAKE", rr("the shape", "/intake app &lt;name&gt; :: &lt;company&gt; :: &lt;role&gt; :: &lt;minutes&gt;", ""), "`/intake apps <name>`"));
  const r = await resolve(parts[0]); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
  const rec = r.rec;
  rec.apps = rec.apps || [];
  const entry = { at: new Date().toISOString(), company: parts[1], role: parts[2] || "", mins: Number(parts[3]) || null };
  rec.apps.push(entry);
  note(rec, "application logged: " + entry.company);
  await save(rec);
  log("intake app " + rec.id);
  return bubble(card("\ud83d\udcbc LOGGED \u2014 " + esc2(rec.name),
    rr("this one", "<b>" + esc2(entry.company) + "</b>" + (entry.role ? " \u00b7 " + esc2(entry.role) : "") + (entry.mins ? " \u00b7 " + esc2(entry.mins) + " min" : ""), ""),
    "`/intake apps " + esc2(rec.id) + "`"));
}
async function doMark(arg){
  const parts = String(arg || "").split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
  if(parts.length < 3) return bubble(card("\u26a0 THE INTAKE", rr("the shape", "/intake mark &lt;name&gt; :: &lt;sound&gt; :: ok|drill", "e.g. <b>/intake mark Quang :: th/s :: drill</b>"), "`/intake phonics <name>`"));
  const r = await resolve(parts[0]); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
  const rec = r.rec;
  rec.phonics = rec.phonics || { marks: {}, at: null };
  rec.phonics.marks[parts[1]] = { v: parts[2].toLowerCase(), at: new Date().toISOString() };
  rec.phonics.at = new Date().toISOString();
  note(rec, "phonics mark: " + parts[1] + " = " + parts[2]);
  await save(rec);
  const drill = Object.keys(rec.phonics.marks).filter(k => rec.phonics.marks[k].v === "drill");
  return bubble(card("\ud83d\udde3 MARKED \u2014 " + esc2(rec.name),
    rr("sound", "<b>" + esc2(parts[1]) + "</b>", "") + rr("verdict", esc2(parts[2]), "")
    + rr("to drill", drill.length ? drill.map(d => esc2(d)).join(" \u00b7 ") : "nothing \u2014 clean sheet so far", "the drill list is what the ten minutes a day are for"),
    "`/intake phonics " + esc2(rec.id) + "` \u00b7 `/intake mark " + esc2(rec.id) + " :: <sound> :: ok|drill`"));
}
async function doNote(arg){
  const parts = String(arg || "").split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
  if(parts.length < 2) return bubble(card("\u26a0 THE INTAKE", rr("the shape", "/intake note &lt;name&gt; :: &lt;text&gt;", ""), "`/intake help`"));
  const r = await resolve(parts[0]); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
  const rec = r.rec;
  const entry = { at: new Date().toISOString(), kind: "note", label: "note", value: parts.slice(1).join(" :: "), item: matchItem(parts.slice(1).join(" ")) };
  rec.inbox = rec.inbox || [];
  rec.inbox.push(entry);
  note(rec, "note: " + entry.value.slice(0, 80));
  await save(rec);
  return bubble(card("\ud83d\udd8a NOTED \u2014 " + esc2(rec.name), rr("kept", esc2(entry.value), "filed under <b>" + esc2(entry.item) + "</b>"), "`/intake files " + esc2(rec.id) + "`"));
}

/* ==========================================================================
   11 · THE DESK — the room the sovereign opens in ◈ Phoenix Generators
   ========================================================================== */
async function panel(){
  const list = await all();
  const total = list.reduce((a, r) => { const c = counts(r); return { open: a.open + c.open, done: a.done + c.done, in: a.in + (r.inbox || []).length }; }, { open: 0, done: 0, in: 0 });
  let h = '<div class="ev-head"><div class="ev-title">\ud83c\udf93 The Intake</div>'
    + '<div class="hint">The app that remembers. Every promise the tutor made on the 23rd is an <b>item</b> here, with an owner and the recording it came from. '
    + '<b>' + total.open + ' open</b> \u00b7 <b>' + total.done + ' closed</b> \u00b7 <b>' + total.in + ' thing(s) received</b>. '
    + 'The human captures; the machine remembers. The records live in this browser\u2019s kv \u2014 <b>no student\u2019s name, search or score is in the public source</b>.</div></div>';
  h += '<div class="eval-grid">'
    + '<button class="eval-tile" data-cmd="/intake"><b>\ud83c\udf93 The desk</b><span>Who is on file, and what is open</span></button>'
    + '<button class="eval-tile" data-cmd="/intake owed"><b>\ud83d\udcdc The owed list</b><span>Every promise, its owner and its state</span></button>'
    + '<button class="eval-tile" data-cmd="/intake receive " data-arg="1"><b>\ud83d\udce5 Receive something</b><span>File what they sent against the item it serves</span></button>'
    + '<button class="eval-tile" data-cmd="/intake export all"><b>\u2b07 Export the records</b><span>One JSON \u2014 the only copy that leaves the browser, and you ask for it</span></button>'
    + '<button class="eval-tile" data-cmd="/intake help"><b>\u2753 How it works</b><span>Every command</span></button>'
    + '</div>';
  if(!list.length){
    h += '<div class="hint" style="margin-top:1rem">\u26a0 <b>Nothing on file in this browser.</b> The records are private by design (they never ship in the source), so a different browser starts empty \u2014 that is a fresh station, not lost data. '
      + 'Restore with <b>/intake import &lt;json&gt;</b>, or open a new record with <b>/intake new &lt;name&gt;</b>.</div>';
  }
  list.forEach((r, i) => {
    const c = counts(r);
    const nxt = firstOpen(r);
    h += '<div class="rrow" style="display:block;margin-top:1rem"><b>' + (i + 1) + " \u00b7 " + esc2(r.name)
      + (r.spelling ? ' <span style="opacity:.6;font-weight:400">(' + esc2(r.spelling) + ")</span>" : "")
      + " \u00b7 " + c.open + " open \u00b7 " + c.done + " closed</b>"
      + '<div class="rd">' + (nxt ? "next: <b>" + esc2(nxt.title) + "</b> \u00b7 " + OWNER_LABEL[nxt.who] + " " + stChip(stateOf(r, nxt.id)) : "<b>everything closed</b>")
      + '<br><span style="opacity:.7">' + (r.fields || []).slice(0, 7).map(f => esc2(f.label || f.k)).join(" \u00b7 ") + ((r.fields || []).length > 7 ? " \u00b7 \u2026" : "") + "</span>"
      + btns(['<button class="eval-tile" data-cmd="/intake open ' + esc2(r.id) + '">the dossier</button>',
              '<button class="eval-tile" data-cmd="/intake owed ' + esc2(r.id) + '">the owed list</button>',
              '<button class="eval-tile" data-cmd="/intake plan ' + esc2(r.id) + '">this week</button>',
              '<button class="eval-tile" data-cmd="/intake cv ' + esc2(r.id) + '">the CV</button>',
              '<button class="eval-tile" data-cmd="/intake files ' + esc2(r.id) + '">the inbox (' + (r.inbox || []).length + ")</button>"])
      + "</div></div>";
  });
  return h;
}
function wire(rootEl){
  if(!rootEl) return;
  rootEl.querySelectorAll("[data-cmd]").forEach(b => {
    b.onclick = () => {
      const c = b.dataset.cmd || "";
      if(b.dataset.arg === "1"){ try{ if(typeof runInStation === "function") return runInStation(c, true); }catch(e){} }
      try{ if(typeof runInStation === "function") return runInStation(c); }catch(e){}
      return cmd(c.replace(/^\/intake\s*/i, ""));
    };
  });
}
async function mount(){
  const el = document.getElementById("intakePanel");
  if(!el) return false;
  try{
    const h = await panel();
    el.innerHTML = h;
    wire(el);
    try{ if(window.ObiBrand && window.ObiBrand.upgrade) window.ObiBrand.upgrade(); }catch(e){}
    return true;
  }catch(e){
    el.innerHTML = '<div class="hint">\u26a0 THE INTAKE could not read its records: ' + esc2(String(e && e.message || e)) + "</div>";
    return false;
  }
}

/* ==========================================================================
   12 · EXPORT / IMPORT — the only way a record leaves this browser, and it is
   always the sovereign who asks. (No upload, no wire, no plugin.)
   ========================================================================== */
function jsonOf(rec){ return JSON.stringify(rec, null, 2); }
async function exportRecords(which){
  const a = String(which || "").trim();
  if(!a || a.toLowerCase() === "all"){
    const list = await all();
    if(!list.length) return bubble(card("\u26a0 NOTHING TO EXPORT", rr("kv:intake", "empty in this browser", "the records are private \u2014 they never ship, so a fresh browser starts empty"), "`/intake new <name>`"));
    const bundle = { v: V, kind: "THE INTAKE \u2014 the records", at: new Date().toISOString(), students: list };
    const name = "intake-" + new Date().toISOString().slice(0, 10) + ".json";
    const ok = download(name, JSON.stringify(bundle, null, 2), "application/json");
    log("intake export all (" + list.length + ")");
    return bubble(card("\u2b07 EXPORTED", rr("file", esc2(name), list.length + " record(s) \u00b7 " + JSON.stringify(bundle).length + " bytes")
      + rr("what it is", "the only copy of these records that has ever left the browser", "keep it; `/intake import <json>` puts it back"),
      ok ? "" : '<span style="color:#e0473f">\u26a0 the download did not start</span>'));
  }
  const r = await resolve(a);
  if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
  const rec = r.rec;
  const name = "intake-" + slug(rec.name) + ".json";
  const ok = download(name, jsonOf(rec), "application/json");
  log("intake export " + rec.id);
  return bubble(card("\u2b07 EXPORTED \u2014 " + esc2(rec.name), rr("file", esc2(name), Math.max(jsonOf(rec).length, 1) + " bytes"), ok ? "" : '<span style="color:#e0473f">\u26a0 the download did not start</span>'));
}
async function importRecords(text){
  let data = null;
  try{ data = JSON.parse(String(text || "")); }catch(e){ data = null; }
  if(!data) return bubble(card("\u26a0 THE INTAKE \u2014 not JSON", rr("import", "the text did not parse", "paste the whole file contents after `::`, or use the picker from the desk"),
    "`/intake export all` makes the file"));
  const recs = Array.isArray(data) ? data : (Array.isArray(data.students) ? data.students : [data]);
  const done = [];
  for(const r of recs){
    if(!r || !r.id) continue;
    r.v = V;
    const ok = await save(r);
    if(ok) done.push(r.name || r.id);
  }
  log("intake import (" + done.length + ")");
  if(!done.length) return bubble(card("\u26a0 THE INTAKE \u2014 nothing imported", rr("records", "no record in that text had an id", ""), "`/intake export all` makes a file this can read"));
  return bubble(card("\u2b06 IMPORTED", rr("restored", done.map(esc2).join(" \u00b7 "), "into this browser's kv \u2014 nothing was sent anywhere")
    + rr("the desk", done.length + " record(s) on file", "`/intake`"), "`/intake`"));
}
function pickFile(){
  try{
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = async () => {
      const f = inp.files && inp.files[0];
      if(!f) return;
      const txt = await f.text();
      await importRecords(txt);
    };
    inp.click();
  }catch(e){}
}

/* ==========================================================================
   13 · THE COMMAND
   ========================================================================== */
async function cmd(arg){
  await kvReady();
  if(!folder()) return bubble(card("\u26a0 THE INTAKE \u2014 kv is not available",
    rr("what is missing", "the kv plugin (root.kv)", "the records cannot be read or written on this page, so nothing is invented and nothing is shown as if it existed"),
    "reload the page \u00b7 if it persists, <b>main.pjs</b> is missing the kv import"));
  const t = String(arg || "").trim();
  const m = t.match(/^(\S+)(\s+([\s\S]*))?$/);
  const head = m ? m[1].toLowerCase() : "";
  const rest = m && m[3] ? m[3].trim() : "";

  switch(head){
    case "": case "desk": case "roster": {
      const list = await all();
      return bubble(cardDesk(list, await lastId()));
    }
    case "who": case "open": case "show": case "dossier": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardStudent(r.rec));
    }
    case "owed": case "pipeline": {
      const a = rest.trim();
      if(!a){ const list = await all(); if(!list.length) return bubble(cardDesk(list, null)); return bubble(cardOwed(list)); }
      const r = await resolve(a); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardOwed([r.rec]));
    }
    case "plan": case "week": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardPlan(r.rec));
    }
    case "receive": case "got": case "sent": {
      const a = rest.trim();
      if(!a) return bubble(card("\u26a0 THE INTAKE \u2014 who, and what?",
        rr("the shape", "/intake receive &lt;name&gt; :: &lt;what arrived&gt;", "the station files it under the item it serves, and moves that item to MATERIAL IN"),
        "`/intake help`"));
      return doReceive(a, null);
    }
    case "link": case "url": {
      const parts = rest.split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
      if(parts.length < 2) return bubble(card("\u26a0 THE INTAKE", rr("the shape", "/intake link &lt;name&gt; :: &lt;url&gt; [:: &lt;what it is&gt;]", ""), "`/intake help`"));
      const r = await resolve(parts[0]); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      const rec = r.rec;
      const url = parts[1], what = parts[2] || "";
      const item = matchItem(what + " " + url);
      const entry = { at: new Date().toISOString(), kind: "link", label: what || url.replace(/^https?:\/\//, "").slice(0, 60), value: url, item: item };
      rec.inbox = rec.inbox || []; rec.inbox.push(entry);
      rec.owed = rec.owed || {};
      const prev = stateOf(rec, item);
      if(prev === "not_started" || prev === "waiting" || !rec.owed[item]) rec.owed[item] = { state: "received", at: entry.at };
      note(rec, "link into " + item + ": " + entry.label);
      const ok = await save(rec);
      log("intake link " + rec.id + " -> " + item);
      return bubble(card("\ud83d\udd17 LINK FILED \u2014 " + esc2(rec.name),
        rr("filed under", "<b>" + esc2(BY_ID[item] ? BY_ID[item].title : item) + "</b>", prev + " \u2192 " + stateOf(rec, item))
        + rr("the link", esc2(url), esc2(entry.label)),
        (ok ? "" : '<span style="color:#e0473f">\u26a0 the write did NOT go through</span><br>') + "`/intake files " + esc2(rec.id) + "`"));
    }
    case "note": return doNote(rest);
    case "set": case "field": return doSet(rest);
    case "close": case "done": return doClose(rest, false);
    case "reopen": case "open-item": return doClose(rest, true);
    case "app": case "applied": return doApp(rest);
    case "apps": case "applications": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardApps(r.rec));
    }
    case "mark": return doMark(rest);
    case "cv": case "resume": {
      const parts = rest.split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
      const build = /(^|\s)build(\s|$)/i.test(rest);
      const who = parts.length ? parts[0].replace(/\s+build$/i, "").trim() : "";
      const r = await resolve(who); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      const rec = r.rec;
      if(!build) return bubble(cardCV(rec));
      const { miss } = cvRows(rec);
      const html = buildCV(rec);
      const name = slug(rec.name) + "-cv.html";
      const ok = download(name, html, "text/html");
      log("intake cv build " + rec.id);
      return bubble(card("\ud83d\udcc4 CV PRINTED \u2014 " + esc2(rec.name),
        rr("file", esc2(name), ok ? "downloaded \u2014 open it and print to A4 (margins normal, background graphics off)" : '<span style="color:#e0473f">the download did not start</span>')
        + rr("blank rows", miss.length ? miss.length + " \u2014 " + miss.map(esc2).join(", ") : "none \u2014 every row came from the record",
            miss.length ? "<b>left blank on purpose.</b> A guessed degree is worse than a blank one." : "")
        + rr("next", miss.length ? "supply the blanks, then re-run" : "read it aloud, then the LinkedIn is an hour", ""),
        "`/intake cv " + esc2(rec.id) + "` \u00b7 `/intake linkedin " + esc2(rec.id) + "`"));
    }
    case "linkedin": case "li": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardLinkedIn(r.rec));
    }
    case "headshot": case "photo": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardHeadshot(r.rec));
    }
    case "phonics": case "sounds": {
      const a = rest.trim();
      const lastWord = a.split(/\s+/).pop().toLowerCase();
      const which = (lastWord === "pairs" || lastWord === "44") ? lastWord : "";
      const who = which ? a.replace(/\s*\b(pairs|44)\b\s*$/i, "").trim() : a;
      if(who){ const r = await resolve(who); if(!r.err && r.rec){ const rec = r.rec; const marks = (rec.phonics && rec.phonics.marks) || {}; const drill = Object.keys(marks).filter(k => marks[k].v === "drill"); if(drill.length){ bubble(rr("to drill \u2014 " + esc2(rec.name), drill.map(esc2).join(" \u00b7 "), "from the marks on the record")); } } }
      return bubble(cardPhonics(which));
    }
    case "present": case "presentation": {
      const parts = rest.split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
      if(parts.length < 1) return bubble(card("\u26a0 THE INTAKE", rr("who?", "/intake present &lt;name&gt; :: &lt;the subject&gt;", ""), "`/intake help`"));
      const r = await resolve(parts[0]); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      const rec = r.rec;
      const topic = parts.slice(1).join(" :: ");
      if(topic){
        rec.fields = rec.fields || [];
        const i = rec.fields.findIndex(f => f.k === "present_topic");
        const f = { k: "present_topic", label: "Presentation subject", value: topic, ev: "chosen by the student", state: "stated" };
        if(i >= 0) rec.fields[i] = Object.assign(rec.fields[i], f); else rec.fields.push(f);
        note(rec, "presentation subject: " + topic);
        await save(rec);
      }
      return bubble(cardPresent(rec, topic));
    }
    case "interview": case "questions": {
      const parts = rest.split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
      const mode = (/^run$/i.test(parts[1] || "") || /^run$/i.test(rest)) ? "run" : "";
      const held = /held/i.test(rest);
      const who = parts[0] ? parts[0].replace(/\s*\b(run|held)\b\s*/i, "").trim() : "";
      const r = await resolve(who); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      const rec = r.rec;
      if(held){
        rec.interview = rec.interview || { runs: [] };
        rec.interview.runs.push({ at: new Date().toISOString() });
        note(rec, "interview run held");
        await save(rec);
        return bubble(card("\ud83c\udfa4 RUN RECORDED \u2014 " + esc2(rec.name), rr("runs held", rec.interview.runs.length + " \u2014 last " + esc2(new Date().toISOString().slice(0, 10)), "mark the three that broke, rewrite only those, run it again"), "`/intake interview " + esc2(rec.id) + "`"));
      }
      return bubble(cardInterview(rec, mode));
    }
    case "umbrella": case "brand": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardUmbrella(r.rec));
    }
    case "presence": case "social": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardPresence(r.rec));
    }
    case "work": case "credit": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardWork(r.rec));
    }
    case "files": case "inbox": {
      const r = await resolve(rest); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      return bubble(cardFiles(r.rec));
    }
    case "new": case "add": {
      const parts = rest.split(/\s*::\s*/).map(s => s.trim()).filter(Boolean);
      if(!parts.length) return bubble(card("\u26a0 THE INTAKE", rr("the shape", "/intake new &lt;name&gt; [:: &lt;the spelling&gt;]", "the spelling matters here: the tutor spells both names out loud on the tape"), "`/intake help`"));
      const name = parts[0];
      const id = slug(name);
      const exists = await get(id);
      if(exists) return bubble(card("\u26a0 THE INTAKE \u2014 already on file", rr(esc2(name), "a record with the id <b>" + esc2(id) + "</b> already exists", "`/intake open " + esc2(id) + "`"), "`/intake`"));
      const rec = newRecord({ id: id, name: name, spelling: parts[1] || "", evidenceSet: [] });
      rec.owed = {};
      ITEMS.forEach(it => { rec.owed[it.id] = { state: "not_started", at: null }; });
      note(rec, "record opened");
      const ok = await save(rec);
      await setLast(rec.id);
      log("intake new " + rec.id);
      return bubble(card("\ud83c\udf93 RECORD OPENED \u2014 " + esc2(name),
        rr("id", esc2(id), "") + rr("items", ITEMS.length + " promises, all NOT STARTED", "nothing is closed by memory alone"),
        (ok ? "" : '<span style="color:#e0473f">\u26a0 the write did NOT go through</span><br>') + "`/intake open " + esc2(id) + "`"));
    }
    case "forget": case "delete": {
      if(!/\bconfirm\b/i.test(rest)) return bubble(card("\u26a0 THE INTAKE \u2014 say confirm",
        rr("it would delete", esc2(rest.replace(/\bconfirm\b/i, "").trim() || "(nobody named)"), "this cannot be undone \u2014 export first: `/intake export all`"),
        "`/intake forget <name> confirm`"));
      const who = rest.replace(/\bconfirm\b/i, "").trim();
      const r = await resolve(who); if(r.err) return bubble(card("\u26a0 THE INTAKE", rr("no such student", esc2(r.err), ""), "`/intake`"));
      const rec = r.rec;
      const ok = await forget(rec.id);
      log("intake forget " + rec.id);
      return bubble(card(ok ? "\ud83d\uddd1 DELETED \u2014 " + esc2(rec.name) : "\u26a0 THE INTAKE \u2014 the delete did not go through",
        rr("kv:intake", esc2(rec.id), ok ? "gone from this browser" : "still there"), "`/intake`"));
    }
    case "export": return exportRecords(rest);
    case "import": {
      const a = rest.trim();
      if(!a){ pickFile(); return bubble(card("\u2b06 IMPORT", rr("picker", "a file dialog was opened", "choose the JSON this desk exported"), "`/intake import <json>` also accepts pasted text")); }
      return importRecords(a);
    }
    case "help": case "?": return bubble(cardHelp());
    default: {
      /* a bare name is a dossier \u2014 the friendliest possible default */
      const r = await resolve(t);
      if(!r.err) return bubble(cardStudent(r.rec));
      return bubble(card("\ud83c\udf93 THE INTAKE \u2014 did you mean\u2026",
        rr("not a command", esc2(t), "the first word is read as a command, then as a student")
        + rr("start here", "`/intake` \u00b7 `/intake help`", ""),
        "`/intake help`"));
    }
  }
}

window.ObiIntake = {
  V: V, ITEMS: ITEMS, PHONEMES: PHONEMES, MINIMAL_PAIRS: MINIMAL_PAIRS, BANK: BANK, CV_FIELDS: CV_FIELDS,
  cmd: cmd, mount: mount, panel: panel, wire: wire,
  all: all, get: get, save: save, forget: forget, resolve: resolve, counts: counts, firstOpen: firstOpen,
  exportRecords: exportRecords, importRecords: importRecords, pickFile: pickFile,
  buildCV: buildCV, printHTML: printHTML, download: download, matchItem: matchItem
};
})();
