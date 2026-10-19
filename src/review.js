/* ============================================================================
   OBI — THE WRITEUP LAYER  (src/review.js)

   Two kinds of subject, one evidence machine:

     CLASS    /class <name>   · /classes  · /writeup  · /writeups
     STUDENT  /student <name> · /students · /review   · /reviews

   A class is a group (a lesson, a course, a subject — "Year 7 English",
   "Tuesday Maths 9B"); a student is a person. Both are just a name plus the
   evidence filed under it: verbatim transcripts from /transcribe, study
   summaries from /summary, and the reviewer's own dated notes.

   /note, /file and /review|/writeup act on the subject you selected LAST (the
   active context). Select a class and the recording you drop is filed under the
   class, and /writeup writes the class writeup. Select a student and the same
   commands write the student review. A recording can be filed under both — run
   /file twice with each selected.

   Everything above lives inside a CLIENT (src/clients.js) — the station's top-level
   tenant. The active client owns its students, classes, recordings, summaries,
   notes, reviews and writeups; the first client is Timmy; nothing crosses over.

   Rules: a writeup is DERIVED from evidence. It quotes the recording's own words
   verbatim, cites the source and timestamp of every claim, and says plainly when
   the evidence is thin or partial instead of inventing content (L38 raw first,
   L43 no summaries of summaries, L39 recorder not editor).
   ========================================================================== */
(function(){
"use strict";

const KINDS = {
  student: { noun:"student", plural:"students", icon:"🎒", folder:"students", archive:"reviews",  idp:"rv", label:"review",  activeKey:"obi_student" },
  class:   { noun:"class",   plural:"classes",  icon:"🏫", folder:"classes",  archive:"writeups", idp:"cw", label:"writeup", activeKey:"obi_class" }
};
const CTX_KEY = "obi_ctx";
const EVIDENCE_BUDGET = 14000;
const PER_SOURCE_CHARS = 2600;
const MAX_HITS = 25;

function e(s){ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s); }
function kvFolder(name){
  if(!root || !root.kv) throw new Error("kv-plugin not loaded (main.pjs)");
  return root.kv[name];
}
function efolder(kind){ return kvFolder(KINDS[kind].folder); }
function afolder(kind){ return kvFolder(KINDS[kind].archive); }
function slug(s){ return String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }
function newId(p){ return p + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); }
function clip(s, n){ s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) : s; }
function fmtDate(t){ try{ return new Date(t).toLocaleDateString(); }catch(x){ return "?"; } }
function fmtDur(sec){
  sec = Math.max(0, Math.round(Number(sec) || 0));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = n => String(n).padStart(2, "0");
  return h ? h + ":" + p(m) + ":" + p(s) : m + ":" + p(s);
}
function lsGet(k){ try{ return localStorage.getItem(k) || null; }catch(x){ return null; } }
function lsSet(k, v){ try{ v ? localStorage.setItem(k, v) : localStorage.removeItem(k); }catch(x){} }

/* ------------------------------ the client scope ---------------------------- */
/* Every subject and every derived record belongs to exactly one client. The
   helpers below are the only gate: reads are filtered to the active client,
   unstamped records read as the first client's, and ids are keyed
   `<client>:<slug>` so two clients can each hold a student of the same name. */
const CLIENT_FALLBACK = "unassigned";
function clientId(){
  try{ if(window.ObiClients && window.ObiClients.id) return window.ObiClients.id(); }catch(err){}
  return lsGet("obi_client") || CLIENT_FALLBACK;
}
function clientName(){
  try{ if(window.ObiClients && window.ObiClients.name) return window.ObiClients.name(); }catch(err){}
  return clientId();
}
function clientOf(rec){ return (rec && rec.client) ? rec.client : CLIENT_FALLBACK; }
function inClient(rec){ return clientOf(rec) === clientId(); }
function entKey(name){
  const s = slug(name);
  return s ? (clientId() + ":" + s) : "";
}
function qualKey(id){
  id = String(id == null ? "" : id);
  return (id.indexOf(":") !== -1) ? id : (clientId() + ":" + slug(id));
}
function bareOf(id){
  id = String(id == null ? "" : id);
  const i = id.indexOf(":");
  return i === -1 ? id : id.slice(i + 1);
}
function sample(text, budget){
  text = String(text || "");
  if(text.length <= budget) return text;
  const win = Math.floor(budget / 3), mid = Math.floor(text.length / 2);
  return clip(text, win) + "\n…\n" + text.slice(mid - Math.floor(win / 2), mid + Math.floor(win / 2)) + "\n…\n" + text.slice(-win);
}
function download(name, text, mime){
  try{
    const url = URL.createObjectURL(new Blob([text], { type: mime || "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click();
    setTimeout(() => { try{ URL.revokeObjectURL(url); a.remove(); }catch(err){} }, 5000);
    try{ logOp({ kind:"export", action:"document", detail: name, result: String(text == null ? 0 : text.length) + " bytes left the browser" }); }catch(err){}
    return true;
  }catch(err){ return false; }
}

/* ------------------------------ the active context -------------------------- */

function context(){
  try{ const c = JSON.parse(localStorage.getItem(CTX_KEY) || "null"); return (c && c.kind && KINDS[c.kind]) ? c : null; }
  catch(err){ return null; }
}
function setContextRaw(ctx){
  try{ ctx ? localStorage.setItem(CTX_KEY, JSON.stringify(ctx)) : localStorage.removeItem(CTX_KEY); }catch(err){}
}
function activeSlug(){ return lsGet(KINDS.student.activeKey); }
function activeClassSlug(){ return lsGet(KINDS.class.activeKey); }
function activeOf(kind){ return lsGet(KINDS[kind].activeKey); }

async function getEntity(kind, id){
  if(!kind || !id) return null;
  const folder = efolder(kind);
  let ent = null;
  try{ ent = await folder.get(qualKey(id)); }catch(err){}
  if(!ent){ try{ ent = await folder.get(slug(bareOf(id))); }catch(err){} }
  if(!ent) return null;
  if(!inClient(ent)) return null;              /* fail closed: never cross a client */
  return ent;
}
async function listEntities(kind){
  let pairs = [];
  try{ pairs = await efolder(kind).entries(); }catch(err){}
  return pairs.map(([k, v]) => v).filter(v => v && inClient(v)).sort((a, b) => (b.updated || 0) - (a.updated || 0));
}
async function saveEntity(ent){
  if(!ent || !ent.id) return;
  ent.client = clientId();
  try{ await efolder(ent.kind).set(ent.id, ent); }catch(err){}
  try{ logOp({ kind:"roster", action: ent.kind, detail: ent.name + (ent.notes && ent.notes.length ? " · " + ent.notes.length + " note(s)" : "") + (ent.sources && ent.sources.length ? " · " + ent.sources.length + " evidence" : ""), result: "saved under client " + clientName(), ref: ent.id }); }catch(err){}
}

/* the subject every command acts on: the last one selected */
async function current(){
  const c = context();
  if(c){ const ent = await getEntity(c.kind, c.id); if(ent) return ent; }
  const s = activeSlug();
  if(s){ const ent = await getEntity("student", s); if(ent) return ent; }
  return null;
}
async function currentStudent(){
  const s = activeSlug();
  return s ? await getEntity("student", s) : null;
}
async function currentClass(){
  const s = activeClassSlug();
  return s ? await getEntity("class", s) : null;
}

/* Called by src/transcribe.js + src/summary.js when they store something:
   label it with the active student and/or class. */
function stamp(rec){
  try{
    if(rec && typeof rec === "object"){
      rec.client = clientId();
      const st = activeSlug(), cl = activeClassSlug();
      if(st) rec.student = st;
      if(cl) rec.classId = cl;
    }
  }catch(err){}
  return rec;
}

/* file an already-saved record under the active subject (of the active client) */
async function fileTo(kind, src){
  const id = lsGet(KINDS[kind].activeKey);
  if(!id || !src || !src.id) return false;
  try{
    const ent = await getEntity(kind, id);
    if(!ent) return false;                    /* no such subject under this client — never invent one */
    ent.kind = kind;
    ent.updated = Date.now();
    ent.sources = (ent.sources || []).filter(x => x.id !== src.id);
    ent.sources.unshift({
      id: src.id, kind: src.kind || "source", title: String(src.title || src.id).slice(0, 140),
      duration: src.duration || null, t: Date.now()
    });
    if(ent.sources.length > 400) ent.sources.length = 400;
    await saveEntity(ent);
    return true;
  }catch(err){ return false; }
}
async function file(src){
  const c = context();
  if(c) return await fileTo(c.kind, src);
  /* no explicit context — file under whichever subject is active */
  let any = false;
  if(activeSlug()) any = (await fileTo("student", src)) || any;
  if(activeClassSlug()) any = (await fileTo("class", src)) || any;
  return any;
}

async function setActive(kind, name){
  const K = KINDS[kind];
  const s = slug(name);
  if(!s){
    addBubble("ass", "Usage: <b>/" + K.noun + " &lt;name&gt;</b> — e.g. <b>/" + K.noun + " " + (kind === "class" ? "Year 7 English" : "Minh") + "</b>.");
    return;
  }
  const id = clientId() + ":" + s;
  let ent = await getEntity(kind, s);
  if(!ent){ ent = { id, name: String(name).trim().slice(0, 60), kind, created: Date.now(), updated: Date.now(), notes: [], sources: [] }; }
  ent.kind = kind;
  await saveEntity(ent);
  lsSet(K.activeKey, id);
  setContextRaw({ kind, id });
  const otherKind = kind === "class" ? "student" : "class";
  const other = await getEntity(otherKind, activeOf(otherKind));
  const bubble = addBubble("ass", '<div class="rise tr-card"><div class="rhead">' + K.icon + ' ' + (kind === "class" ? "Class" : "Student") + ' — ' + e(ent.name) + '</div>'
    + '<div class="rrow"><b>CLIENT</b><span class="vd">' + e(clientName()) + '</span><div class="rd">this ' + K.noun + ' belongs to the active client — switch clients and it is out of scope</div></div>'
    + '<div class="rrow"><b>ACTIVE</b><span class="vd">YES</span><div class="rd">new transcripts, summaries and notes file under this ' + K.noun + ' · <b>/' + K.plural + '</b> for the list</div></div>'
    + '<div class="rrow"><b>EVIDENCE</b><span class="vd">' + (ent.sources || []).length + '</span><div class="rd">' + (ent.notes || []).length + ' observation note(s)</div></div>'
    + (other ? '<div class="rrow"><b>ALSO</b><span class="vd">' + e(otherKind) + '</span><div class="rd">' + e(other.name) + ' is still active — recordings are labelled with both; /file files under the last one you selected.</div></div>' : '')
    + '<div class="rfoot">Record the lesson (<b>/transcribe</b>), write it up (<b>/' + K.label + '</b>), or search everything (<b>/find &lt;term&gt;</b>).</div></div>');
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [active " + K.noun + " " + ent.name + " · client " + clientName() + "]"); }catch(err){}
  return ent;
}
function setActiveStudent(name){ return setActive("student", name); }
function setClass(name){ return setActive("class", name); }

async function note(text){
  text = String(text || "").trim();
  if(!text){
    addBubble("ass", "Usage: <b>/note &lt;observation&gt;</b> — files a dated note under the active subject (class or student).");
    return;
  }
  const ent = await current();
  if(!ent){
    addBubble("ass", "No active subject on client <b>" + e(clientName()) + "</b>. <b>/class Year 7 English</b> or <b>/student Minh</b> first (then /note …).");
    return;
  }
  ent.notes = ent.notes || [];
  ent.notes.unshift({ t: Date.now(), text: text.slice(0, 4000) });
  ent.updated = Date.now();
  await saveEntity(ent);
  addBubble("ass", "🗒 Noted under <b>" + e(ent.name) + "</b> (" + e(ent.kind) + "): “" + e(clip(text, 160)) + "” · " + ent.notes.length + " note(s).");
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [note for " + ent.name + " — " + clip(text, 200) + "]"); }catch(err){}
}

async function attach(id){
  id = String(id || "").trim();
  if(!id){ addBubble("ass", "Usage: <b>/file &lt;tr-…|sm-…&gt;</b> (ids come from /transcripts and /summaries)."); return; }
  let rec = null, kind = "transcript";
  try{ if(window.ObiTranscribe) rec = await window.ObiTranscribe.get(id); }catch(err){}
  if(!rec){ try{ if(window.ObiSummary) rec = await window.ObiSummary.get(id); kind = "summary"; }catch(err){} }
  if(!rec){ addBubble("ass", "⚠ Nothing stored with id <b>" + e(id) + "</b>. /transcripts or /summaries to find the id."); return; }
  if(!inClient(rec)){
    let cn = clientOf(rec);
    try{ if(window.ObiClients && window.ObiClients.get){ const c = await window.ObiClients.get(cn); if(c && c.name) cn = c.name; } }catch(err){}
    addBubble("ass", "⚠ That " + e(kind) + " belongs to client <b>" + e(cn) + "</b> — this station is on <b>" + e(clientName()) + "</b>. Evidence is never filed across clients; switch with <b>/client " + e(cn) + "</b> first.");
    return;
  }
  const ent = await current();
  if(!ent){ addBubble("ass", "No active subject on client <b>" + e(clientName()) + "</b> — <b>/class Year 7 English</b> or <b>/student Minh</b> first, then /file again."); return; }
  await file({ id: rec.id, kind, title: rec.name || rec.title || rec.id, duration: rec.duration || null });
  addBubble("ass", "📎 Filed " + e(kind) + " <b>" + e(rec.name || rec.title) + "</b> under <b>" + e(ent.name) + "</b> (" + e(ent.kind) + ").");
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [filed " + rec.id + " under " + ent.name + "]"); }catch(err){}
}

/* ------------------------------ evidence ----------------------------------- */

async function evidenceFor(ent){
  const parts = [];
  for(const note of (ent.notes || []).slice(0, 20)){
    parts.push({ kind: "note", label: "reviewer note · " + fmtDate(note.t), text: note.text, t: note.t, id: null });
  }
  for(const src of (ent.sources || []).slice(0, 40)){
    let rec = null;
    try{ if(String(src.id).startsWith("tr-") && window.ObiTranscribe) rec = await window.ObiTranscribe.get(src.id); }catch(err){}
    if(!rec){ try{ if(window.ObiSummary) rec = await window.ObiSummary.get(src.id); }catch(err){} }
    if(!rec) continue;
    if(!inClient(rec)) continue;              /* never borrow another client's evidence */
    const isTranscript = String(src.id).startsWith("tr-");
    const text = isTranscript ? (rec.readable || rec.text) : rec.text;
    const bits = [
      (isTranscript ? "transcript" : "summary") + " · " + (rec.name || rec.title || src.id),
      rec.duration ? fmtDur(rec.duration) : null,
      (rec.parts && rec.parts.length > 1) ? rec.parts.length + " parts" + (rec.partial ? " (PARTIAL — part " + (rec.missing || []).join(",") + " missing)" : "") : null,
      isTranscript && rec.wpm ? rec.wpm + " wpm" + (rec.pauses ? " · " + rec.pauses + " pause(s) >3s" : "") : null,
      fmtDate(rec.created || src.t),
      src.id
    ].filter(Boolean);
    parts.push({ kind: isTranscript ? "transcript" : "summary", label: bits.join(" · "), text: sample(text, PER_SOURCE_CHARS), t: rec.created || src.t, id: src.id });
  }
  parts.sort((a, b) => (a.t || 0) - (b.t || 0));
  const lines = parts.map(p => "• " + p.label + ":\n" + p.text);
  let body = lines.join("\n\n");
  let sampled = false;
  if(body.length > EVIDENCE_BUDGET){ body = sample(body, EVIDENCE_BUDGET); sampled = true; }
  const dates = parts.map(p => p.t).filter(Boolean);
  const period = dates.length ? { from: Math.min.apply(null, dates), to: Math.max.apply(null, dates) } : null;
  return { body, count: parts.length, sampled, parts, period };
}

/* ------------------------------ the prompts -------------------------------- */

function staticPrompt(kind){
  const P = (typeof PERSONA === "string") ? PERSONA : "";
  const common = P + "\n\nWork ONLY from the evidence in this request: verbatim lesson transcripts (with timestamps), "
    + "saved study summaries, and the reviewer's own dated notes. When you quote, quote VERBATIM and attribute it to its "
    + "source, timestamp and date. Never invent a name, number, date, score, attendance, or claim of progress. If the "
    + "evidence is thin, one-sided, partial, or covers a short period, say so plainly. Keep every name exactly as written. "
    + "No filler, no praise that cannot be pointed at the evidence. Never open with a preamble or address the reader — "
    + "begin directly with the first section heading.\n\n";
  if(kind === "class"){
    return common + "You are writing a CLASS WRITEUP — the record of what happened in this class and what was actually "
      + "taught, so it can be filed, handed on, or reported to a parent. The subject is a CLASS (a group/lesson), not one person.";
  }
  return common + "You are writing a STUDENT REVIEW — the record of one student's work and progress from the evidence, so it "
    + "can be filed or handed to a parent. The subject is one STUDENT.";
}

function taskFor(kind, register, focus){
  const regTxt = register === "parent"
    ? "REGISTER: PARENT — plain language, no jargon or acronyms, short sentences, honest but encouraging."
    : register === "short"
      ? "REGISTER: SHORT — one tight paragraph."
      : "REGISTER: TEACHER — professional and specific, criteria-based.";
  let base;
  if(register === "short"){
    base = kind === "class"
      ? "TASK: Write ONE paragraph (5-8 sentences) saying what this class covered and what the evidence shows about how it went, plus the single most important thing for next time. " + regTxt
      : "TASK: Write ONE paragraph (5-8 sentences) covering what the evidence shows about progress, one thing to work on, and the next step. " + regTxt;
  } else if(kind === "class"){
    base = "TASK: Write the class writeup with these sections, in this order:\n"
      + "1. Class and period — the class, the dates the evidence actually covers, and how much evidence was reviewed (the counts you can see).\n"
      + "2. What was covered — the topics and material, in the order the evidence shows them; include the timestamp of each so it can be found in the transcript.\n"
      + "3. How it was taught — activities, examples, demonstrations, resources, readings, and anything set as homework or work to complete.\n"
      + "4. Questions and confusions raised — what was asked, what was left unclear, in the class's own words.\n"
      + "5. Notable quotations — 4-8 short VERBATIM quotes, each with its timestamp and date.\n"
      + "6. Next session — what to pick up, what to revisit, and any follow-ups. Name a student only if the evidence names them.\n" + regTxt;
    if(register === "parent"){
      base = "TASK: Write this as a NOTE TO PARENTS about what the class covered and how it went. Plain language, no jargon. "
        + "Cover: what was worked on, what the class did, anything set for homework, and what is coming next. "
        + "Quote the recording once or twice where it is vivid, with a timestamp. Say plainly if there is little evidence. " + regTxt;
    }
  } else {
    base = "TASK: Write the review with these sections, in this order:\n"
      + "1. Overview — who this covers, the period, and the volume of evidence actually reviewed (counts you can see).\n"
      + "2. What was covered — the topics/curriculum, in the order the evidence shows them.\n"
      + "3. Progress and strengths — each point tied to its evidence.\n"
      + "4. Areas to work on — honest, specific, non-generic.\n"
      + "5. Evidence — 4-8 short VERBATIM quotes, each with its source label and date.\n"
      + "6. Next steps — 3 concrete actions for the next period.\n" + regTxt;
    if(register === "parent"){
      base = "TASK: Write this as a NOTE TO PARENTS about the student's work and progress. Plain language, no jargon. "
        + "Cover: what they worked on, what they did well (with a verbatim quote as evidence), what needs attention, "
        + "and what the next step is. Say plainly if the evidence is thin or covers a short period. " + regTxt;
    }
  }
  return focus ? base + "\nReviewer focus (still evidence-only): " + focus : base;
}

/* ------------------------------ writing ------------------------------------ */

function parseArg(raw){
  const register = /(^|\s)--parent(\s|$)/i.test(raw) ? "parent" : (/(^|\s)--short(\s|$)/i.test(raw) ? "short" : "teacher");
  const cleaned = raw.replace(/\s*--(parent|short|teacher)\s*/gi, " ").trim();
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  return { register, tokens };
}

async function author(kind, arg){
  const raw = String(arg || "").trim();
  const { register, tokens } = parseArg(raw);
  let ent = null, focus = "";
  if(tokens.length){
    for(const k of (kind === "class" ? ["class", "student"] : ["student", "class"])){
      const cand = await getEntity(k, slug(tokens[0]));
      if(cand){ ent = cand; focus = tokens.slice(1).join(" "); break; }
    }
  }
  if(!ent) ent = await current();
  if(!ent && tokens.length){
    addBubble("ass", "No class or student called <b>" + e(tokens[0]) + "</b> yet. Start one with <b>/class " + e(tokens[0]) + "</b> or <b>/student " + e(tokens[0]) + "</b>, or <b>/classes</b> to list them.");
    return;
  }
  if(!ent){ howtoCard(kind); return; }

  const ev = await evidenceFor(ent);
  if(!ev.count){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">📝 ' + e(ent.name) + ' — no evidence yet</div>'
      + '<div class="rrow"><b>NOTHING FILED</b><span class="vd">EMPTY</span><div class="rd">no transcripts, summaries or notes are attached to this ' + e(ent.kind) + '</div></div>'
      + '<div class="rfoot">Add some: <b>/transcribe &lt;lesson recording&gt;</b> (drop the file on the chat), <b>/summary &lt;notes&gt;</b>, or <b>/note &lt;observation&gt;</b> — or attach something already saved with <b>/file &lt;id&gt;</b>.</div></div>');
    return;
  }

  const bubble = addBubble("ass", "");
  bubble.innerHTML = '<div class="tr-status hint" style="text-align:left"></div><div class="tr-out"></div>';
  const status = bubble.querySelector(".tr-status"), out = bubble.querySelector(".tr-out");
  const label = register === "parent" ? "parent" : register === "short" ? "short" : "teacher";
  status.innerHTML = "📝 writing the " + label + " " + e(KINDS[ent.kind].label) + " for <b>" + e(ent.name) + "</b> from " + ev.count
    + " piece(s) of evidence" + (ev.sampled ? " (sampled for length)" : "") + "…";

  const periodTxt = ev.period ? (fmtDate(ev.period.from) + " → " + fmtDate(ev.period.to)) : "unknown";
  const head = staticPrompt(ent.kind) + "\n\n<" + (ent.kind === "class" ? "CLASS" : "STUDENT")
    + ' name="' + ent.name + '" kind="' + ent.kind + '" evidence_items="' + ev.count + '" period="' + periodTxt
    + '" generated="' + new Date().toISOString().slice(0, 10) + '">\n' + ev.body + "\n</" + (ent.kind === "class" ? "CLASS" : "STUDENT") + ">\n\n";

  const strip = s => String(s || "").replace(/^Obi:\s*/, "").trim();
  let acc = "", text = "";
  try{
    const res = await root.generateText({
      instruction: head + taskFor(ent.kind, register, focus),
      startWith: "Obi:\n",
      stopSequences: ["\nUser:"],
      onChunk: d => { acc = d.fullTextSoFar; const shown = strip(acc); if(shown) out.textContent = shown; try{ scrollDown(); }catch(err){} }
    });
    text = strip(acc || res.generatedText || res.text || "");
  }catch(err){
    status.textContent = "⚠ " + err.message;
    return;
  }
  out.textContent = text || "—";
  if(!text){ status.textContent = "⚠ The model returned nothing — try again."; return; }

  const rec = {
    id: newId(KINDS[ent.kind].idp), kind: ent.kind, subject: ent.name, subjectId: ent.id, client: clientId(),
    register, focus: focus || null, period: periodTxt, created: Date.now(), chars: text.length, text,
    sources: ev.parts.map(p => ({ kind: p.kind, label: p.label, id: p.id }))
  };
  try{ await afolder(ent.kind).set(rec.id, rec); }catch(err){}
  try{ logOp({ kind: ent.kind === "class" ? "writeup" : "review", action: KINDS[ent.kind].label, detail: ent.name + " · " + register + " register", result: text.length + " chars · " + ev.count + " source(s)", ref: rec.id }); }catch(err){}
  try{
    rrlAppend(runNoOf(), "DNA", "Obi: [" + ent.kind + " " + KINDS[ent.kind].label + " " + rec.id + " · " + ent.name + " · " + register + " · " + ev.count + " sources]");
    messages.push("Obi: [wrote the " + label + " " + KINDS[ent.kind].label + " for " + ent.name + "]");
    speak("Writeup saved.");
  }catch(err){}

  status.innerHTML = "📝 saved as <b>" + e(rec.id) + "</b> · " + e(ent.name) + " · " + label + " · /" + KINDS[ent.kind].archive;
  const acts = document.createElement("div");
  acts.className = "tr-acts";
  acts.style.marginTop = "8px";
  [["md", "📄 .md"], ["txt", "📄 .txt"], ["html", "🖨 Printable"], ["chat", "◈ Show"]].forEach(([verb, lbl]) => {
    const b = document.createElement("button");
    b.className = "ci-act"; b.textContent = lbl;
    b.onclick = () => act(ent.kind, rec.id, verb);
    acts.appendChild(b);
  });
  bubble.appendChild(acts);
  const foot = document.createElement("div");
  foot.className = "hint";
  foot.style.textAlign = "left";
  foot.textContent = "Derived from " + ev.count + " evidence item(s) (" + periodTxt + ") — every quote above is verbatim from its source.";
  bubble.appendChild(foot);
  return rec;
}

function howtoCard(kind){
  if(kind === "class"){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">🏫 /writeup — no class selected</div>'
      + '<div class="rrow"><b>STEP 1</b><span class="vd">WHICH CLASS</span><div class="rd"><b>/class Year 7 English</b> — creates/selects it; the lesson recordings you then drop file under it</div></div>'
      + '<div class="rrow"><b>STEP 2</b><span class="vd">RECORD</span><div class="rd"><b>/transcribe</b> — drop the lesson video/audio (any length); add observations with <b>/note …</b></div></div>'
      + '<div class="rrow"><b>STEP 3</b><span class="vd">WRITE</span><div class="rd"><b>/writeup</b> · <b>/writeup --parent</b> · <b>/writeup --short</b> · <b>/writeup focus text…</b></div></div>'
      + '<div class="rfoot">/classes lists every class · /writeups is the archive of writeups · a writeup is derived text with citations — the recordings are never altered.</div></div>');
    return;
  }
  addBubble("ass", '<div class="rise tr-card"><div class="rhead">📝 /review — no student selected</div>'
    + '<div class="rrow"><b>STEP 1</b><span class="vd">WHO</span><div class="rd"><b>/student &lt;name&gt;</b> — creates/selects the student; everything you then transcribe, summarize or note files under them</div></div>'
    + '<div class="rrow"><b>STEP 2</b><span class="vd">EVIDENCE</span><div class="rd"><b>/transcribe &lt;recording&gt;</b> · <b>/summary</b> · <b>/note &lt;observation&gt;</b></div></div>'
    + '<div class="rrow"><b>STEP 3</b><span class="vd">WRITE</span><div class="rd"><b>/review</b> · <b>/review --parent</b> · <b>/review --short</b> · <b>/review focus text…</b></div></div>'
    + '<div class="rfoot">/students lists every student · /reviews is the archive · a review is derived text with citations — the transcripts it came from are never replaced.</div></div>');
}

function run(arg){ return author("student", arg); }
function writeup(arg){ return author("class", arg); }

/* ------------------------------ exports ------------------------------------ */

function title(rec){ return (rec.kind === "class" ? "Class writeup — " : "Student review — ") + rec.subject; }
function toMarkdown(rec){
  return "# " + title(rec) + "\n\n"
    + "*" + rec.register + " register · " + (rec.period ? "period " + rec.period + " · " : "") + new Date(rec.created).toLocaleString() + " · Student Summary Generator (Obi)*\n\n"
    + rec.text + "\n\n---\n\n## Evidence reviewed\n\n"
    + (rec.sources || []).map(s => "- " + s.label).join("\n") + "\n";
}
function toPrintHTML(rec){
  const esc1 = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return "<!doctype html>\n<html><head><meta charset=\"utf-8\"><title>" + esc1(title(rec)) + "</title>\n"
    + "<style>body{font:16px/1.6 Georgia,serif;max-width:46rem;margin:3rem auto;padding:0 1.25rem;color:#111}"
    + "h1{font-size:1.6rem;margin:0 0 .25rem}h2{font-size:1.05rem;margin:2rem 0 .5rem;border-bottom:1px solid #ddd;padding-bottom:.25rem}"
    + ".meta{color:#666;font-size:.85rem;margin-bottom:1.5rem}.body{white-space:pre-wrap}"
    + "ul{color:#444;font-size:.85rem}footer{margin-top:2rem;color:#777;font-size:.75rem;border-top:1px solid #eee;padding-top:.75rem}"
    + "@media print{body{margin:0}}</style></head>\n<body>\n"
    + "<h1>" + esc1(title(rec)) + "</h1>\n"
    + "<div class=\"meta\">" + esc1(rec.register) + " register" + (rec.period ? " · period " + esc1(rec.period) : "") + " · " + esc1(new Date(rec.created).toLocaleString()) + " · Student Summary Generator (Obi)</div>\n"
    + "<div class=\"body\">" + esc1(rec.text) + "</div>\n"
    + "<h2>Evidence reviewed</h2>\n<ul>" + (rec.sources || []).map(s => "<li>" + esc1(s.label) + "</li>").join("") + "</ul>\n"
    + "<footer>Derived " + (rec.kind === "class" ? "class writeup" : "student review") + " from the sources listed above. The verbatim transcripts and study summaries are kept separately and were not altered.</footer>\n"
    + "</body></html>\n";
}

async function getRec(kind, id){ try{ return await afolder(kind).get(id); }catch(err){ return null; } }
async function act(kind, id, verb){
  const rec = await getRec(kind, id);
  if(!rec){ addBubble("ass", "⚠ No " + e(KINDS[kind].label) + " with id <b>" + e(id) + "</b>."); return; }
  const base = (slug(rec.subject) || "subject") + "-" + KINDS[kind].label + "-" + new Date(rec.created).toISOString().slice(0, 10);
  if(verb === "md"){ download(base + ".md", toMarkdown(rec), "text/markdown;charset=utf-8"); return; }
  if(verb === "txt"){ download(base + ".txt", rec.text, "text/plain;charset=utf-8"); return; }
  if(verb === "html"){ download(base + ".html", toPrintHTML(rec), "text/html;charset=utf-8"); addBubble("ass", "🖨 Save it, open it, print to PDF (Ctrl/Cmd-P) — the file carries the evidence list with it."); return; }
  if(verb === "chat"){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">' + (kind === "class" ? "🏫" : "📝") + ' ' + e(rec.subject) + ' — ' + e(rec.register) + ' ' + e(KINDS[kind].label) + '</div>'
      + '<div class="rrow"><b>WRITTEN</b><span class="vd">' + e(new Date(rec.created).toLocaleDateString()) + '</span><div class="rd">'
      + (rec.period ? 'period ' + e(rec.period) + ' · ' : '') + (rec.sources || []).length + ' evidence item(s) · id ' + e(rec.id) + '</div></div>'
      + '<div class="rrow tr-preview"><div class="rd tr-text">' + e(rec.text) + '</div></div>'
      + '<div class="rfoot">Derived text with citations. Raw transcripts/summaries untouched.</div></div>');
    return;
  }
  if(verb === "del"){
    if(!window.confirm("Delete this " + KINDS[kind].label + " permanently?")) return;
    try{ await afolder(kind).delete(id); }catch(err){}
    try{ logOp({ kind:"delete", action: KINDS[kind].label, detail: rec.subject + " · " + rec.id, result: "deleted from the archive" }); }catch(err){}
    addBubble("ass", "🗑 " + e(KINDS[kind].label) + " deleted.");
    return;
  }
}

/* ------------------------------ rosters / archives -------------------------- */

async function roster(kind){
  const K = KINDS[kind];
  let list = [];
  try{ list = await listEntities(kind); }
  catch(err){ addBubble("ass", "⚠ " + K.noun + " store unavailable: " + e(err.message)); return; }
  const act_ = activeOf(kind);
  if(!list.length){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">' + K.icon + ' /' + K.plural + ' — ' + K.noun + ' list · client ' + e(clientName()) + '</div>'
      + '<div class="rrow"><b>LIST</b><span class="vd">EMPTY</span><div class="rd">no ' + K.plural + ' for this client yet</div></div>'
      + '<div class="rfoot">Start one: <b>/' + K.noun + ' &lt;name&gt;</b>. After that, every transcript, summary and note files under it, and <b>/' + K.label + '</b> writes from that evidence.</div></div>');
    return;
  }
  const rows = list.map(ent => {
    const srcs = (ent.sources || []);
    const last = srcs.length ? srcs[0] : null;
    return '<div class="rrow"><b>' + e(ent.name) + '</b><span class="vd">' + (ent.id === act_ ? "ACTIVE" : "") + '</span><div class="rd">'
      + srcs.length + ' source(s) · ' + (ent.notes || []).length + ' note(s) · last activity ' + e(fmtDate(ent.updated || ent.created))
      + (last ? ' · newest: ' + e(last.title) : '')
      + '<br><span class="tr-acts">'
      + '<button class="ci-act" data-ent="' + e(ent.id) + '" data-do="select">◈ Select</button>'
      + '<button class="ci-act" data-ent="' + e(ent.id) + '" data-do="write">' + K.icon + ' ' + K.label + '</button>'
      + '<button class="ci-act" data-ent="' + e(ent.id) + '" data-do="del">✗</button>'
      + '</span></div></div>';
  }).join("");
  const actEnt = act_ ? await getEntity(kind, act_) : null;
  const bubble = addBubble("ass", '<div class="rise tr-card"><div class="rhead">' + K.icon + ' /' + K.plural + ' — ' + K.noun + ' list · client ' + e(clientName()) + '</div>'
    + '<div class="rrow"><b>' + K.noun.toUpperCase() + 'S</b><span class="vd">' + list.length + '</span><div class="rd">active: ' + e(actEnt ? actEnt.name : "none") + ' — new work files under the active ' + K.noun + '</div></div>'
    + rows
    + '<div class="rfoot">/' + K.label + ' writes from the active ' + K.noun + '\'s evidence · /note files an observation · /find searches everything.</div></div>');
  bubble.querySelectorAll("[data-ent]").forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.ent, verb = b.dataset.do;
      if(verb === "select"){ await setActive(kind, (await getEntity(kind, id) || { name: id }).name); }
      else if(verb === "write"){ const ent = await getEntity(kind, id); if(ent){ lsSet(K.activeKey, id); setContextRaw({ kind, id }); await author(kind, ""); } }
      else if(verb === "del"){
        if(!window.confirm("Delete this " + K.noun + " record? Its transcripts and summaries stay in the archives.")) return;
        try{ await efolder(kind).delete(id); }catch(err){}
        if(activeOf(kind) === id) lsSet(K.activeKey, null);
        const c = context(); if(c && c.kind === kind && c.id === id) setContextRaw(null);
        try{ logOp({ kind:"delete", action: K.noun, detail: id, result: "record deleted (evidence kept)" }); }catch(err){}
        addBubble("ass", "🗑 " + K.noun + " record deleted (evidence kept).");
      }
    };
  });
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [/" + K.plural + " — " + list.length + " listed]"); }catch(err){}
}

async function archive(kind){
  const K = KINDS[kind];
  let pairs = [];
  try{ pairs = await afolder(kind).entries(); }catch(err){}
  const recs = pairs.map(([k, v]) => v).filter(v => v && inClient(v)).sort((a, b) => (b.created || 0) - (a.created || 0));
  if(!recs.length){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">' + K.icon + ' /' + K.archive + ' · client ' + e(clientName()) + '</div><div class="rrow"><b>ARCHIVE</b><span class="vd">EMPTY</span><div class="rd">no ' + K.label + 's written for this client yet</div></div>'
      + '<div class="rfoot"><b>/' + K.noun + ' &lt;name&gt;</b> → gather evidence (<b>/transcribe</b>, <b>/summary</b>, <b>/note</b>) → <b>/' + K.label + '</b>.</div></div>');
    return;
  }
  const rows = recs.slice(0, 60).map(r =>
    '<div class="rrow"><b>' + e(r.subject) + '</b><span class="vd">' + e(r.register) + '</span><div class="rd">'
    + e(new Date(r.created).toLocaleString()) + (r.period ? ' · period ' + e(r.period) : '') + ' · ' + (r.sources || []).length + ' source(s) · ' + (r.chars || 0).toLocaleString() + ' chars'
    + '<br><span class="tr-acts">'
    + '<button class="ci-act" data-id="' + e(r.id) + '" data-a="chat">◈ Show</button>'
    + '<button class="ci-act" data-id="' + e(r.id) + '" data-a="md">📄 .md</button>'
    + '<button class="ci-act" data-id="' + e(r.id) + '" data-a="txt">📄 .txt</button>'
    + '<button class="ci-act" data-id="' + e(r.id) + '" data-a="html">🖨 Printable</button>'
    + '<button class="ci-act" data-id="' + e(r.id) + '" data-a="del">✗</button>'
    + '</span></div></div>'
  ).join("");
  const bubble = addBubble("ass", '<div class="rise tr-card"><div class="rhead">' + K.icon + ' /' + K.archive + ' — written ' + K.label + 's · client ' + e(clientName()) + '</div>'
    + '<div class="rrow"><b>COUNT</b><span class="vd">' + recs.length + '</span><div class="rd">kept in this browser (kv · ' + K.archive + ')</div></div>'
    + rows + '<div class="rfoot">Each ' + K.label + ' carries its evidence list — the sources themselves stay in /transcripts and /summaries.</div></div>');
  bubble.querySelectorAll("[data-a]").forEach(b => { b.onclick = () => act(kind, b.dataset.id, b.dataset.a); });
}

/* ------------------------------ search ------------------------------------- */

async function find(term){
  term = String(term || "").trim().replace(/^--\S+\s*/, "");
  if(!term){ addBubble("ass", "Usage: <b>/find &lt;term&gt;</b> — searches every transcript, study summary and note (class or student)."); return; }
  const needle = term.toLowerCase();
  const hits = [];
  const push = (lines, label, id, kind) => {
    for(const ln of lines){
      if(hits.length >= MAX_HITS) return;
      const i = ln.toLowerCase().indexOf(needle);
      if(i === -1) continue;
      hits.push({ label, id, kind, snippet: (i > 40 ? "…" : "") + ln.slice(Math.max(0, i - 60), i + 100).trim() + "…" });
    }
  };
  try{
    const tEntries = await root.kv.transcripts.entries();
    for(const [id, rec] of tEntries){ if(!rec || !inClient(rec)) continue; push(String(rec.readable || rec.text || "").split("\n"), "transcript · " + (rec.name || id) + " · " + fmtDate(rec.created), id, "transcript"); }
  }catch(err){}
  try{
    const sEntries = await root.kv.summaries.entries();
    for(const [id, rec] of sEntries){ if(!rec || !inClient(rec)) continue; push(String(rec.text || "").split("\n"), "summary · " + (rec.title || id) + " · " + fmtDate(rec.created), id, "summary"); }
  }catch(err){}
  for(const kind of ["student", "class"]){
    let ents = [];
    try{ ents = await listEntities(kind); }catch(err){}
    for(const ent of ents){
      for(const n of (ent.notes || [])) push([String(n.text || "")], kind + " note · " + ent.name + " · " + fmtDate(n.t), ent.id, kind + " note");
    }
  }
  if(!hits.length){
    addBubble("ass", "🔍 No mention of <b>" + e(term) + "</b> in any transcript, summary or note stored for client <b>" + e(clientName()) + "</b>.");
    return;
  }
  const rows = hits.map(h => '<div class="rrow"><b>' + e(h.kind) + '</b><span class="vd">' + e(h.id) + '</span><div class="rd">'
    + e(h.label.split(" · ").slice(1).join(" · ")) + '<br>' + e(h.snippet) + '</div></div>').join("");
  addBubble("ass", '<div class="rise tr-card"><div class="rhead">🔍 /find — "' + e(term) + '" · client ' + e(clientName()) + '</div>'
    + '<div class="rrow"><b>HITS</b><span class="vd">' + hits.length + (hits.length >= MAX_HITS ? "+" : "") + '</span><div class="rd">across transcripts, summaries and notes — each quote is verbatim from its source</div></div>'
    + rows
    + '<div class="rfoot">Use these as the citations in a <b>/writeup</b> or <b>/review</b>. The full sources live in /transcripts and /summaries.</div></div>');
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [/find " + term + " — " + hits.length + " hits]"); }catch(err){}
}

window.ObiReview = {
  /* generic */
  context, current, currentStudent, currentClass, activeOf, stamp, file, fileTo, evidenceFor,
  author, find, act, get: getRec, toMarkdown, toPrintHTML, entities: listEntities,
  /* the client scope */
  clientId, clientName, clientOf, inClient, entKey,
  /* students */
  active: activeSlug, activeStudent: currentStudent, setActive: setActiveStudent,
  roster: () => listEntities("student"), students: () => roster("student"),
  note, attach, run, library: () => archive("student"),
  /* classes */
  activeClass: activeClassSlug, setClass, classes: () => roster("class"),
  writeup, writeups: () => archive("class")
};
})();
