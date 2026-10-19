/* ============================================================================
   OBI — THE LESSON FORGE  (src/lesson-forge.js)
   The bridge between the curriculum (src/curriculum.js) and the lesson engine
   (src/lessons.js).

   The pacing guide is the school's own spreadsheet: every period, its book, its
   unit, its section, the language contents, the learning outcomes, the
   differentiated activities and the assessment — copied verbatim. This file
   reads one of those rows and writes ONE NET Academy lesson from it, in the
   sovereign's own format, checked by his own validator (LSN-1…LSN-23).

   Nothing is invented about the material. The lesson's pages, its vocabulary,
   its grammar and its outcomes are the row's own words; the model's job is only
   to put them into the six-room lesson the standard demands — a warm-up, two
   scenes, the words, a scored test, and a key — with the school's assessment
   respected at the exit.

   WHAT IT DOES
     /lesson forge                the queue, and whose periods are not yet built
     /lesson forge <grade>        a lesson for each of THIS week's periods you own
     /lesson forge <grade> week N the same, for a chosen week
     /lesson forge <grade> all    every period of the grade, queued
     /lesson forge all            the whole course you teach (1-9), queued
     /lesson forge run            walk the queue (stoppable — nothing half-built is saved)
     /lesson forge clear          empty the queue (built lessons are never deleted)

   THE RULES IT OBEYS
     - SCOPE ONLY. A period belonging to the Vietnamese teacher is never forged;
       a book outside the sovereign's scope is never forged. The queue is built
       from scopeMark(), the same gate every other view reads.
     - FAIL CLOSED. A lesson that fails the validator is reported, not saved —
       the same rule as /lesson itself (LSN-11). The failure is kept in the queue
       entry so a later run retries it and the reason is visible.
     - THE RECORD IS THE FILE. Each finished lesson is the standalone .html the
       standard promises: one file, no build, openable offline — saved to the
       lesson library (kv, this browser) with the curriculum row it came from, so
       /lesson list and the desk's LIBRARY room show it beside every other lesson.
   ========================================================================== */
(function(){
"use strict";

const KVF = "lessons";        /* the library folder src/lessons.js writes to */
const QVF = "lessonforge";    /* the queue (this browser only) */

const C = () => window.ObiCurriculum;
const L = () => window.ObiLessons;

/* ------------------------------- helpers -------------------------------- */
function esc(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function one(s){ return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }
function clip(s, n){ s = one(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
function row(k, v, d, bad){ return '<div class="rrow' + (bad ? " bad" : "") + '"><b>' + esc(k) + '</b><span class="vd">' + v + '</span><div class="rd">' + (d || "") + "</div></div>"; }
function card(head, body, foot){ return '<div class="rise tr-card"><div class="rhead">' + head + "</div>" + body + '<div class="rfoot">' + (foot || "") + "</div></div>"; }
function say(html){ if(typeof window.addBubble === "function") return window.addBubble("ass", html); }
function scroll(){ try{ if(typeof window.scrollDown === "function") window.scrollDown(); }catch(e){} }
function log(o){ try{ if(typeof window.logOp === "function") window.logOp(o); }catch(e){} }
function folder(name){
  try{ return (root && root.kv) ? (root.kv[name] || null) : null; }catch(e){ return null; }
}
function clientId(){
  try{ if(window.ObiClients && window.ObiClients.id) return window.ObiClients.id(); }catch(e){}
  return "client";
}

/* the sheet's rows are written with bullets, numbering and sub-bullets; strip the
   furniture so a focus line reads as a phrase */
function lines(s){
  return String(s == null ? "" : s).split(/\r?\n/)
    .map(l => l.replace(/^\s*(?:\d+\.\s*)?[-•+⁻*–—]\s*/, "").replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean);
}
/* the first line of a row's contents that actually says what the period teaches —
   the header line ("Language Focus:") is skipped, and the first real bullet is it */
function firstFocus(it){
  const ls = lines(it && it.contents);
  for(const l of ls){
    if(/^(language|skill)s?\s*focus\s*:?$/i.test(l)) continue;
    if(/^[-–—:]+$/.test(l)) continue;
    if(l.length < 4) continue;
    return clip(l, 96);
  }
  return "";
}

/* the topic handed to the lesson engine — the unit, the section, and the one line
   that names the material. The engine names the lesson from this (the model only
   ever invents the two scene titles — LSN's spine rule). */
function topicOf(it){
  const unitRaw = one(it.unit);
  const unit = unitRaw.replace(/^Unit\s*\d+\s*[:.\-–—]?\s*/i, "").trim();
  const sec = one(it.section).replace(/\s+\([^)]*\)\s*$/, "").trim();
  const det = firstFocus(it);
  const parts = [];
  if(unit) parts.push(clip(unit, 64));
  if(sec && !/^unit\b/i.test(sec) && !/^lesson\s*\d/i.test(sec)) parts.push(clip(sec, 40));
  let t = parts.join(" · ") || clip(unitRaw || sec, 90);
  if(det) t += " — " + det;
  return clip(t, 220);
}

/* THE BRIEF — the sovereign's notes, obeyed. Every field is the row's own text:
   the lesson is built on the school's material, never around it. */
function notesOf(it, grade, week){
  const b = [];
  b.push("This lesson is one REAL period from the school's pacing guide (Ecogreen). Build it on EXACTLY this material and nothing else — do not add another book, another unit, or material from outside the row below.");
  b.push("class: grade " + grade + " (" + (C() && C().levelOf ? C().levelOf(grade) : "") + ") · book: " + one(C().bookLabel ? C().bookLabel(it.book) : it.book) + " · unit: " + one(it.unit) + " · section: " + one(it.section) + (one(it.pages) ? " · pages: " + one(it.pages) : "") + (week ? " · week: " + week : ""));
  if(one(it.contents)) b.push("THE CONTENTS TO TEACH (the school's own words — the vocabulary, the grammar and the skills of this period): " + clip(it.contents, 1100));
  if(one(it.outcomes)) b.push("THE LEARNING OUTCOMES (what the learner must be able to do by the end): " + clip(it.outcomes, 1100));
  if(one(it.activities)) b.push("THE SCHOOL'S DIFFERENTIATED ACTIVITIES (support / core / challenge — honour them where they fit the lesson): " + clip(it.activities, 800));
  if(one(it.assess)) b.push("WHAT THE SCHOOL ASSESSES: " + clip(it.assess, 400));
  b.push("Every vocabulary item, every grammar form and every skill in the lesson comes from the contents above. Keep to the level. British English. The scenes are ordinary Vietnamese school life — name the students with ordinary Vietnamese names, and keep the subject of the scenes tied to this period's material, not to something generic.");
  b.push("Title rule: the title names THIS period's focus, never the unit alone — a Vocabulary period becomes e.g. \"Clothes & Personality Academy\", a Reading period e.g. \"Hobby Detectives Academy\", a Science period e.g. \"Skeleton Squad Academy\". Two periods of the same unit must never come back with the same title.");
  return b.join("\n");
}

/* --------------------------- the week the guide is on -------------------- */
/* the guide's dates are "17.08 - 21.08" (secondary) or "17/08 - 21/08" (primary);
   the school year runs Aug→Jun, so a month ≥ 8 is this year and a month ≤ 6 is the
   next. The current week is the one whose range holds today; a guide that has not
   been filled that far (the primary ones stop at the week they are on) falls back
   to its last week — which is, by construction, the week it is on. */
function dayMonth(s){
  const out = [];
  const re = /(\d{1,2})[./](\d{1,2})/g; let m;
  while((m = re.exec(String(s || "")))) out.push([+m[1], +m[2]]);
  return out;
}
function dateAt(dm){
  const y = dm[1] >= 7 ? 2026 : 2027;
  return new Date(y, dm[1] - 1, dm[0]);
}
function currentIndex(g){
  const today = new Date();
  let hit = -1, lastStart = null, lastIdx = -1;
  (g.weeks || []).forEach((w, i) => {
    const dm = dayMonth(w.dates);
    if(dm.length >= 2){
      const a = dateAt(dm[0]), b = dateAt(dm[dm.length - 1]);
      if(today >= a && today <= b) hit = i;
      if(!lastStart || a > lastStart){ lastStart = a; lastIdx = i; }
    }
  });
  if(hit >= 0) return hit;
  return (g.weeks && g.weeks.length) ? g.weeks.length - 1 : -1;
}
function weekMatch(w, i, sel){
  const s = String(sel || "").trim();
  if(/^\d+$/.test(s)) return (i + 1) === +s;                 /* "week 5" is the 5th week */
  return one(w.label).toLowerCase() === s.toLowerCase() || one(w.dates).includes(s);
}

/* ------------------------- the scope, and the queue ---------------------- */
/* one entry = one period the sovereign owns. The key is stable, so a re-plan
   never duplicates and a finished lesson is never rebuilt by accident. */
async function planFor(grade, sel){
  const g = await C().load(grade);
  const sc = await C().scopeOf(grade);
  const weeks = [];
  if(!sel) weeks.push(currentIndex(g));
  else if(/^all$/i.test(sel)) weeks.push(...g.weeks.map((w, i) => i));
  else g.weeks.forEach((w, i) => { if(weekMatch(w, i, sel)) weeks.push(i); });
  const out = [];
  for(const wi of weeks){
    if(wi < 0 || !g.weeks[wi]) continue;
    const w = g.weeks[wi];
    w.items.forEach((it, ii) => {
      const mk = C().scopeMark(it, sc);
      if(mk.kind !== "core") return;                        /* VT and not-yours are never forged */
      out.push({ key: "g" + grade + ".w" + (wi + 1) + ".s" + ii, grade: String(grade), week: wi + 1,
                 weekLabel: one(w.label) || String(wi + 1), dates: one(w.dates), i: ii,
                 book: one(it.book), unit: one(it.unit), section: one(it.section),
                 title: one(it.section) || one(it.unit) || "period", topic: topicOf(it) });
    });
  }
  return out;
}

async function queueLoad(){
  const f = folder(QVF);
  if(!f) return [];
  try{ const q = await f.get("queue"); return Array.isArray(q) ? q : []; }catch(e){ return []; }
}
async function queueSave(q){
  const f = folder(QVF);
  if(f){ try{ await f.set("queue", q); }catch(e){} }
  return q;
}
async function enqueue(entries){
  const q = await queueLoad();
  const have = {}; q.forEach(e => { have[e.key] = e; });
  let added = 0;
  for(const e of entries){
    if(have[e.key]){ if(have[e.key].status === "done") continue; Object.assign(have[e.key], e); continue; }
    have[e.key] = Object.assign({ status:"todo", tries:0, id:null, title:null, why:null, at:null }, e);
    q.push(have[e.key]); added++;
  }
  await queueSave(q);
  return { added: added, total: q.length };
}
function queueCounts(q){
  const c = { todo:0, done:0, failed:0 };
  q.forEach(e => { c[e.status === "done" ? "done" : e.status === "failed" ? "failed" : "todo"]++; });
  c.total = q.length;
  return c;
}

/* ------------------------------- the forge ------------------------------- */
/* one period in, one checked lesson out (or the reason it was refused) */
async function forgeOne(entry, ctx){
  ctx = ctx || {};
  const g = await C().load(entry.grade);
  const it = (g.weeks[entry.week - 1] || {}).items[entry.i];
  if(!it) return { err: "the period is no longer in the guide (the guide changed)" };
  const topic = topicOf(it);
  const notes = notesOf(it, entry.grade, entry.dates || entry.week);
  const level = "grade " + entry.grade + " · " + (C().levelOf ? C().levelOf(entry.grade) : "");
  const res = await L().compose(topic, { level: level, notes: notes }, ctx);
  if(!res || res.stopped) return { stopped: true };
  if(res.err) return { err: res.err };
  const check = L().validate(res.spec);
  const built = L().build(res.spec);
  return { spec: res.spec, check: check, built: built, topic: topic, entry: entry };
}

/* the lesson is saved into the one library (kv "lessons"), carrying the row it
   came from — so /lesson list and the desk show it like any other lesson, and
   the row can always be traced back */
async function saveForged(r){
  const f = folder(KVF);
  const rec = { id: "LF" + Date.now().toString(36) + Math.floor(Math.random() * 46656).toString(36),
    title: r.spec.title, topic: r.spec.topic, client: clientId(), created: Date.now(),
    rooms: r.built.rooms, bytes: r.built.bytes, spec: r.spec, html: r.built.html,
    src: window.generatorName || null,
    cur: { grade: r.entry.grade, week: r.entry.week, weekLabel: r.entry.weekLabel, book: r.entry.book,
           unit: r.entry.unit, section: r.entry.section, checked: r.check.ok } };
  if(f){ try{ await f.set(rec.id, rec); return rec; }catch(e){} }
  try{ L().download(r.built.html, L().fileName(r.spec)); }catch(e){}
  return rec;
}

/* ------------------------------- the run --------------------------------- */
/* ONE period is forged by ONE call to step() — so a queue can be walked by the
   chat command (/lesson forge run, which loops until it is stopped) or one
   period at a time from outside (runNext), which is how a very long queue is
   built without ever holding the page. */
/* a run is a LEASE, not a flag: an aborted or crashed build (the tab closed, the
   tool that drove it interrupted) must never leave the forge permanently "running"
   and unable to start again. Every step refreshes the lease. */
let runLease = 0, stopFlag = false;
const LEASE_MS = 20 * 60 * 1000;
function renew(){ runLease = Date.now() + LEASE_MS; }
function running(){ return Date.now() < runLease; }
function stopped(){ return stopFlag; }

async function step(entry){
  const b = window.addBubble ? window.addBubble("ass", "") : null;
  if(!b) return { status: "failed", title: entry.title, why: "no bubble host" };
  b.innerHTML = '<div class="rhead">📚 forging — grade ' + esc(entry.grade) + " · week " + esc(entry.weekLabel) + " · " + esc(entry.title) + '</div>'
    + '<div class="lf-note rd">pass 1/7 — the shape of the lesson</div><div class="lf-out rd"></div>';
  const note = b.querySelector(".lf-note"), out = b.querySelector(".lf-out");
  const call = async (instruction, label) => {
    let acc = "";
    try{
      const gen = root.generateText({ instruction: instruction,
        onChunk: d => { acc = d.fullTextSoFar || acc; if(out) out.textContent = "…" + acc.slice(-260).replace(/\s+/g, " "); scroll(); } });
      const res = await gen;
      return acc || (res && (res.generatedText || res.text)) || "";
    }catch(e){ return "__ERR__ " + String((e && e.message) || e); }
  };
  let r = null;
  try{
    r = await forgeOne(entry, {
      call: call,
      progress: msg => { if(note) note.textContent = msg + (out && out.textContent ? " · streaming…" : ""); scroll(); },
      stop: stopped
    });
  }catch(e){ r = { err: String((e && e.message) || e) }; }

  if(r && r.stopped){
    entry.status = "todo";
    b.innerHTML = '<div class="rise"><div class="rhead">⏹ stopped — ' + esc(entry.title) + '</div><div class="rd">You stopped the forge. This period is still on the queue (nothing half-built was saved) — <b>/lesson forge run</b> picks it up again.</div></div>';
    return { stopped: true, status: "todo", title: entry.title };
  }
  if(!r || r.err || !(r.check && r.check.ok)){
    const why = (r && r.err) ? r.err : ((r && r.check) ? r.check.errors.join(" · ") : "the build did not finish");
    entry.status = "failed"; entry.tries = (entry.tries || 0) + 1; entry.why = clip(why, 220); entry.at = Date.now();
    b.innerHTML = '<div class="rise"><div class="rhead">📚 refused — ' + esc(entry.title) + '</div>'
      + row("GRADE " + esc(entry.grade) + " · WEEK " + esc(entry.weekLabel), esc(entry.book), esc(entry.section))
      + row("WHY", "✖", esc(why), true)
      + '<div class="rfoot">Fail closed (LSN-11): a lesson that does not pass the validator is not saved. <b>/lesson forge run</b> retries it.</div></div>';
    return { status: "failed", title: entry.title, why: why };
  }
  const rec = await saveForged(r);
  entry.status = "done"; entry.tries = (entry.tries || 0) + 1; entry.id = rec ? rec.id : null;
  entry.title = r.spec.title; entry.at = Date.now(); entry.why = null;
  const warns = (r.check.warnings || []).length;
  const bb = window.addBubble ? window.addBubble("ass", "") : null;
  if(bb){
    bb.innerHTML = card("📚 " + esc(r.spec.title),
      row("PERIOD", "grade " + esc(entry.grade) + " · week " + esc(entry.weekLabel), esc(entry.book) + " · " + esc(entry.unit) + " · <b>" + esc(entry.section) + "</b> · " + esc(entry.dates))
      + row("BUILT", r.built.rooms + " rooms · " + r.built.bytes + " bytes", esc(r.spec.subtitle || ""))
      + row("CHECK", r.check.ok ? "✔ PASSED" : "✖ FAILED", "LSN-1…LSN-12 and LSN-23 (the method block)" + (warns ? " · " + warns + " warning(s): " + esc(r.check.warnings.join(" · ")) : " · no warnings"))
      + row("METHOD", r.spec.method ? esc(r.spec.method.phase || "named") : "not declared", r.spec.method ? esc((r.spec.method.games || []).map(x => x.name + " (" + x.type + ")").join(" · ")) : "the shell returned no method block — legal, but a full session carries one"),
      "Saved to the lesson library as <b>" + esc(rec ? rec.id : "—") + "</b> (this browser) · <b>/lesson list</b> · the file downloads from there.");
    const acts = document.createElement("div"); acts.className = "lf-acts";
    const dBtn = document.createElement("button"); dBtn.className = "ci-act"; dBtn.textContent = "⬇ Download " + r.spec.title;
    dBtn.onclick = () => { try{ L().download(r.built.html, L().fileName(r.spec)); }catch(e){} };
    acts.appendChild(dBtn);
    bb.appendChild(acts);
  }
  scroll();
  return { status: "done", title: r.spec.title, id: rec ? rec.id : null };
}

async function runQueue(){
  const q = await queueLoad();
  if(!q.filter(e => e.status !== "done").length){ statusCard("the queue is empty — every period in it has a lesson"); return; }
  renew(); stopFlag = false;
  let ok = 0, bad = 0, skipped = 0;
  for(const entry of q){
    if(entry.status === "done") continue;
    if(stopFlag) break;
    renew();
    const res = await step(entry);
    if(res.stopped){ skipped++; break; }
    if(res.status === "done") ok++; else bad++;
  }
  runLease = 0;
  await queueSave(q);
  const c = queueCounts(q);
  log({ kind:"op", action:"lesson forge", ok: bad === 0, detail: ok + " built, " + bad + " refused, " + skipped + " left", result: c.done + "/" + c.total + " of the queue done" });
  say('<div class="rise"><div class="rhead">⚒ the forge stopped — ' + (stopFlag ? "stopped by you" : "the queue is finished") + '</div>'
    + row("BUILT THIS RUN", String(ok), "each one passed the validator and is in the library")
    + row("REFUSED", String(bad), "failed the check, or the build did not finish — they stay on the queue")
    + row("LEFT", String(skipped), "still todo")
    + row("THE QUEUE", c.done + " done · " + c.todo + " todo · " + c.failed + " failed", "of " + c.total + " periods in your scope")
    + '<div class="rfoot"><b>/lesson list</b> opens the library · <b>/lesson forge</b> shows the queue · <b>/lesson forge run</b> continues.</div></div>');
  return { ok: ok, bad: bad, skipped: skipped };
}

/* forge exactly one period off the queue — the handle a long batch is walked by */
async function runNext(){
  const q = await queueLoad();
  const e = q.find(x => x.status !== "done");
  if(!e) return { done: true, left: 0 };
  renew(); stopFlag = false;
  const res = await step(e);
  runLease = 0;
  await queueSave(q);
  return Object.assign({ left: q.filter(x => x.status !== "done").length }, res);
}

/* ------------------------------- the cards ------------------------------- */
async function statusCard(msg){
  const q = await queueLoad();
  const c = queueCounts(q);
  let scopeRows = "";
  let mineTotal = 0;
  for(const g of C().GRADES){
    let n = 0, gi = -1;
    try{ const gd = await C().load(g); gi = currentIndex(gd); n = (await planFor(g, null)).length; }catch(e){}
    mineTotal += n;
    if(!q.filter(e => e.grade === g).length && !n) continue;
    scopeRows += row("GRADE " + g, n + " this week", n ? ("week " + (gi + 1) + " · " + esc((q.filter(e => e.grade === g && e.status === "done").length)) + " built so far") : "no in-scope period this week");
  }
  const done = q.filter(e => e.status === "done").slice(-6).reverse()
    .map(e => row("✔ " + esc(e.title || e.section), esc(e.id || ""), "grade " + esc(e.grade) + " · week " + esc(e.weekLabel) + " · " + esc(e.book))).join("");
  const failed = q.filter(e => e.status === "failed").slice(0, 6)
    .map(e => row("✖ " + esc(e.title || e.section), esc(e.book), esc(e.why || ""), true)).join("");
  say(card("⚒ /lesson forge — a lesson for every period you teach",
    row("WHAT IT IS", "curriculum → lesson", "reads the pacing guide's own rows (book · unit · section · contents · outcomes · activities · assessment) and writes one NET Academy lesson for each of <b>your</b> periods — the Vietnamese teacher's periods and the books outside your scope are never forged.")
    + row("THE QUEUE", c.total ? (c.done + " done · " + c.todo + " todo · " + c.failed + " failed") : "empty", "a stable key per period (grade.week.section), so re-planning never duplicates and a done lesson is never rebuilt. Kept in this browser (kv <b>" + QVF + "</b>).")
    + scopeRows
    + (done ? '<div class="rrow"><b>RECENTLY BUILT</b><span class="vd">' + q.filter(e => e.status === "done").length + '</span><div class="rd">' + done + "</div></div>" : "")
    + (failed ? '<div class="rrow bad"><b>REFUSED</b><span class="vd">' + c.failed + '</span><div class="rd">' + failed + "</div></div>" : "")
    + row("COMMANDS", "6", '<span class="cmd">/lesson forge</span> this card · <span class="cmd">/lesson forge 6</span> this week, grade 6 · <span class="cmd">/lesson forge 4 week 3</span> a chosen week · <span class="cmd">/lesson forge 6 all</span> every period of the grade · <span class="cmd">/lesson forge all</span> the whole course · <span class="cmd">/lesson forge run</span> walk the queue · <span class="cmd">/lesson forge clear</span> empty it')
    + row("COST", "it is AI", "each lesson is <b>7 model passes</b> (the reply cap is 1024 tokens, so a six-room lesson is staged: the shell, then one room per reply). Build a week at a time, or leave it running — <b>stop</b> is always honoured and nothing half-built is saved."),
    msg || ("Periods in your scope this week across all nine grades: <b>" + mineTotal + "</b>.")));
  return c;
}

/* ------------------------------- the command ----------------------------- */
/* /lesson forge [<grade>] [week N | all]  |  run  |  clear  */
async function cmd(arg){
  const a = one(arg);
  if(!a || /^(status|queue)$/i.test(a)){ await statusCard(); return; }
  if(/^clear$/i.test(a)){
    await queueSave([]);
    say(card("⚒ the forge queue is empty", row("CLEARED", "0 todo", "the queue was emptied. The <b>lessons themselves are untouched</b> — they live in the library (kv <b>" + KVF + "</b>) and <b>/lesson list</b> still shows them."), "/lesson forge &lt;grade&gt; builds a new queue."));
    return;
  }
  if(/^run$/i.test(a)){
    if(running()){ say(card("⚒ the forge is already running", row("RUNNING", "wait", "one build at a time — it picks up the queue itself; if a build died, this clears by itself within 20 minutes."))); return; }
    await runQueue();
    return;
  }
  /* a scope: [grade] [week N | all] */
  const gm = a.match(/^(\d)\b\s*([\s\S]*)$/);
  const rest = gm ? gm[2].trim() : a;
  const wkSel = /^all$/i.test(rest) ? "all" : (rest.replace(/^week\s*/i, "").trim() || null);
  const grades = gm ? [gm[1]] : C().GRADES.slice();
  if(gm && !C().GRADES.includes(gm[1])){ say(card("⚒ /lesson forge — no such grade", row("GRADE " + esc(gm[1]), "NOT A GRADE", "the guides run grades 1-9 (Ecogreen primary 1-5, secondary 6-9)."))); return; }
  if(!root.generateText){ say(card("⚠ the forge needs the AI", row("ai-text-plugin", "NOT AVAILABLE", "reload the page and try again."))); return; }

  let all = [];
  try{ for(const g of grades) all = all.concat(await planFor(g, wkSel)); }catch(e){ say(card("⚒ the guide did not load", row("ERROR", "✖", esc(String((e && e.message) || e)), true))); return; }
  if(!all.length){ say(card("⚒ nothing to forge", row("SCOPE", "0 periods", "no in-scope period matched — every period in that selection belongs to the Vietnamese teacher or to a book outside your scope. <b>/curriculum scope</b> says whose is whose."), "/lesson forge &lt;grade&gt; [week N | all]")); return; }
  const en = await enqueue(all);
  const c = await queueCounts(await queueLoad());
  if(running()){ say(card("⚒ added to the queue", row("ADDED", "+" + en.added, en.added + " new period(s) queued — the forge is already running, so they will be picked up in a later pass."), "/lesson forge")); return; }
  await runQueue();
}

/* forge ONE NAMED period (a queue key, or the entry itself) — so a single lesson is
   built on its own ("the lesson for 5-2") without walking the whole queue. Everything
   else is runNext's: fail closed, the lease, the queue written back after the build. */
async function forgeEntry(ref){
  const q = await queueLoad();
  const e = (ref && typeof ref === "object") ? (q.find(x => x.key === ref.key) || ref)
                                            : q.find(x => x.key === String(ref));
  if(!e) return { err: "no such period on the queue — plan it first (/lesson forge <grade>)" };
  renew(); stopFlag = false;
  const res = await step(e);
  runLease = 0;
  await queueSave(q);
  return Object.assign({ key: e.key, grade: e.grade, week: e.week, weekLabel: e.weekLabel,
                         left: q.filter(x => x.status !== "done").length }, res);
}

/* forge every queued period a predicate picks out, in queue order */
async function forgeWhere(pred){
  const q = await queueLoad();
  const out = [];
  for(const e of q.filter(pred)){
    if(stopFlag) break;
    out.push(await forgeEntry(e));
  }
  return out;
}

window.ObiLessonForge = {
  cmd: cmd, run: runQueue, status: statusCard, planFor: planFor, enqueue: enqueue, queue: queueLoad,
  queueCounts: queueCounts, forgeOne: forgeOne, runNext: runNext, forgeEntry: forgeEntry, forgeWhere: forgeWhere,
  topicOf: topicOf, notesOf: notesOf, currentIndex: currentIndex,
  KVF: KVF, QVF: QVF, isRunning: running
};
})();
