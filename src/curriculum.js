/* ============================================================================
   OBI — THE CURRICULUM  (src/curriculum.js)
   The pacing guide, and the coverage question the parents actually ask:
   "what did we pay for, and did it happen?"

   WHAT THIS HOLDS
     The school's own pacing guide, parsed — grade 6 to 9, 37 weeks each, every
     section of every book (Global Success · Close-up / New Close-up · Science ·
     Cambridge), with the language contents, the pages, the learning outcomes,
     the differentiated activities and the assessments, exactly as the
     spreadsheet has them. Nothing here is invented: every field is copied
     verbatim out of its cell.

     The parsed copies are what ships — src/curriculum/pa.g1.json … pa.g9.json —
     because the school's workbooks are multi-hundred-KB binary spreadsheets and
     a generator's file tree is for the code that runs, not for its source data
     (the platform's own advice, and the reason a save can fail with
     "src-file-missing" is a file tree that carries dead weight). Both workbooks
     ARE kept, hosted, at WORKBOOKS below — a rebuild, or a new school year, can
     fetch them and re-parse. A newer workbook can be ingested at any time with
     /curriculum import — it is parsed in this browser and kept in this browser's
     kv, so the station never depends on the sheet staying online.

   THE COMMANDS
     /curriculum              what is loaded, from where, and what it covers
     /curriculum 6            the year at a glance — weeks × books × units
     /curriculum week 3       one week in full, every book, every section
     /curriculum unit <text>  every week (in every grade) a unit appears in
     /curriculum find <text>  free-text search across the guide
     /curriculum scope        whose periods are whose — the sovereign's teaching
                              scope (books + the periods the Vietnamese teacher
                              takes); /curriculum scope 6 corrects it
     /curriculum materials    the templates, links and books the school hands over
     /curriculum import       parse a pacing-guide workbook (.xlsx) here
     /curriculum export 6     download the parsed guide (json / txt)
     /coverage                the guide vs the evidence — per book, per unit

   THE TEACHING SCOPE — because the guide is the school's, not one teacher's
     Secondary: the sovereign teaches CLOSE-UP + SCIENCE only (Global Success is
     the Vietnamese programme), and on grade 6 the Vietnamese-teacher periods are
     8 and 9 of the ORDER column. So every view here can tell a section that is
     HIS from one that is not: /curriculum 6 shows his books by default, /coverage
     counts only what is his, and the rest is reported beside it rather than
     hidden. Scope patterns are matched against the sheet, and /curriculum scope
     corrects them (kv, this browser only) — see the block below.

   THE HONEST LIMIT — read this before trusting a coverage number
     Coverage is EVIDENCE-DRIVEN, never assumed. It reads what this station
     actually holds for the active client (the verbatim transcripts and the
     summaries filed under it) and asks of each section: does the record show it?
     A silent section is reported as NO EVIDENCE — never as "not taught". The
     record is not the classroom; a class that was taught and not recorded looks
     exactly like a class that never happened, and this card says so on its face.
   ========================================================================== */
(function(){
"use strict";

const DIR = "src/curriculum/";
const KVF = "curriculum";
/* THE SOURCE WORKBOOKS — hosted (user.uploads.dev), deliberately NOT in the file
   tree. They are the school's own spreadsheets: the primary one (Ecogreen,
   grades 1-5) is the REDACTED copy of the sovereign's workbook, and the
   secondary one (6-9) is his. Everything the station reads at runtime is the
   parsed JSON beside this file; these two are the ground truth behind it, kept
   so the guides can be re-parsed (or corrected) without the school re-sending. */
const WORKBOOKS = {
  primary: "https://user.uploads.dev/file/0df037034ab1e6836d5420880c8e3821.xlsx",
  secondary: "https://user.uploads.dev/file/1039f2155746afa226383537d16fc710.xlsx"
};
/* The station carries BOTH schools' guides now: Ecogreen's primary years (1-5,
   the sovereign's own schedule) and the secondary guide (6-9, where grade 6 is
   Close-up + Science). Same parser, same cards, same coverage question — the grid
   simply has nine rows instead of four. */
const PRIMARY = ["1", "2", "3", "4", "5"];
const SECONDARY = ["6", "7", "8", "9"];
const GRADES = PRIMARY.concat(SECONDARY);
const cache = {};

function ex(s){ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s); }
function clip(s, n){ s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) + "…" : s; }
function folder(){ try{ return (root && root.kv) ? root.kv[KVF] : null; }catch(e){ return null; } }
function clientName(){ try{ if(window.ObiClients && window.ObiClients.name) return window.ObiClients.name(); }catch(e){} return "Unassigned"; }
function inClient(rec){ try{ if(window.ObiClients && window.ObiClients.matches) return window.ObiClients.matches(rec); }catch(e){} return true; }
function say(html){ if(typeof addBubble === "function") return addBubble("ass", html); }
function log(o){ try{ if(typeof logOp === "function") logOp(o); }catch(e){} }
function dna(s){ try{ if(typeof rrlAppend === "function") rrlAppend(runNoOf(), "DNA", "Obi: " + s); }catch(e){} }
function row(k, v, d){ return '<div class="rrow"><b>' + ex(k) + '</b><span class="vd">' + v + '</span><div class="rd">' + (d || "") + "</div></div>"; }
function weekLabel(w){ const n = String((w && w.n) == null ? "" : w.n); return (w && w.label) ? (n + " · " + w.label) : n; }
function rowBad(k, v, d, bad){ return '<div class="rrow' + (bad ? " bad" : "") + '"><b>' + ex(k) + '</b><span class="vd">' + v + '</span><div class="rd">' + (d || "") + "</div></div>"; }
function card(head, body, foot){ return '<div class="rise tr-card"><div class="rhead">' + head + "</div>" + body + '<div class="rfoot">' + (foot || "") + "</div></div>"; }
function norm(s){
  return String(s == null ? "" : s).toLowerCase()
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
    .replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}
function gradeOf(sheetName){ const m = /(?:Grade|G)[\s._-]*(\d+)/i.exec(String(sheetName || "")); return m ? m[1] : null; }
function levelOf(grade){ return PRIMARY.indexOf(String(grade)) >= 0 ? "primary" : (SECONDARY.indexOf(String(grade)) >= 0 ? "secondary" : "?"); }

/* ------------------------------------------------------------------ loading */
async function load(grade){
  grade = String(grade || "6");
  if(cache[grade]) return cache[grade];
  const f = folder();
  if(f){ try{ const rec = await f.get("pa.g" + grade); if(rec && rec.data && rec.data.weeks){ cache[grade] = rec.data; return cache[grade]; } }catch(e){} }
  const path = DIR + "pa.g" + grade + ".json";
  const r = await fetch(path, { cache: "no-store" });
  if(!r.ok) throw new Error("no pacing guide for grade " + grade + " (looked for " + path + ")");
  cache[grade] = await r.json();
  return cache[grade];
}
async function all(){
  const out = {};
  for(const g of GRADES){ try{ out[g] = await load(g); }catch(e){ out[g] = null; } }
  return out;
}
/* the sheet's own title cell — used only when it says something the header does
   not already say ("GRADE 6" is redundant; grade 7's cell literally reads "Un",
   which is the spreadsheet's own truncation and is not worth printing) */
function titleOf(g){
  let t = String((g && g.title) || "").trim();
  if(!t || t.length < 4) return "";
  /* the primary sheets title themselves "PACING GUIDE - GRADE 4 ACADEMIC YEAR
     2026-2027"; the label already says the grade, so keep what is left. */
  if(/pacing guide/i.test(t)) t = t.replace(/^.*?pacing guide\s*[-–—:]?\s*/i, "").replace(/^grade\s*\d+\s*[-–—:]?\s*/i, "").trim();
  if(/^grade\s*\d+$/i.test(t)) return "";
  return t;
}
function gradeLabel(g, title){ return levelOf(g).toUpperCase() + " · GRADE " + g + (title ? " · " + title : ""); }

/* A CHEAP status — the metadata only (src/curriculum/index.json, ~1 KB), so the
   station can report the guide on every turn without pulling 1.3 MB of sections.
   The full guide is read only when a curriculum command actually needs it. */
let indexCache = null;
async function summary(){
  const out = { source: "the school's pacing guides, parsed — primary 1-5 (Ecogreen, grades 1-5) and secondary 6-9 (the workbooks themselves are hosted: see /curriculum materials)", grades: {}, imported: [] };
  try{
    if(!indexCache){ const r = await fetch(DIR + "index.json", { cache: "no-store" }); indexCache = r.ok ? await r.json() : { grades: {} }; }
    out.grades = (indexCache && indexCache.grades) || {};
    if(indexCache && indexCache.source) out.source = indexCache.source;
  }catch(e){ out.error = (e && e.message) || String(e); }
  const f = folder();
  if(f){
    for(const g of GRADES){
      try{ const rec = await f.get("pa.g" + g); if(rec && rec.data){ out.imported.push({ grade: g, name: rec.name, at: rec.at }); const c = countsOf(rec.data); out.grades[g] = { title: rec.data.title, weeks: rec.data.weekCount, sections: rec.data.itemCount, books: rec.data.books, imported: true, source: rec.name, bookCounts: c.bookCounts, periodCounts: c.periodCounts }; } }catch(e){}
    }
  }
  return out;
}
async function loaded(){
  const out = [];
  const f = folder();
  for(const g of GRADES){
    let imported = null;
    if(f){ try{ imported = await f.get("pa.g" + g); }catch(e){} }
    out.push({ grade: g, imported: !!(imported && imported.data), name: imported ? imported.name : null, at: imported ? imported.at : null });
  }
  return out;
}
/* the school's templates and links (src/curriculum/materials.json, ~2 KB) */
let materialsCache = null;
async function materials(){
  if(materialsCache) return materialsCache;
  try{ const r = await fetch(DIR + "materials.json", { cache: "no-store" }); materialsCache = r.ok ? await r.json() : null; }catch(e){ materialsCache = null; }
  return materialsCache;
}
/* the textbook logins: the SECONDARY course (Close-up) and the PRIMARY one (Look,
   grades 1-5) — held in this browser only, never in this source. */
function creds(){
  try{
    const k = JSON.parse(localStorage.getItem("obi_keys") || "{}") || {};
    return { secondary: k.ngl || null, primary: k.nglP || null };
  }catch(e){ return { secondary:null, primary:null }; }
}
/* counts per book and per ORDER value — cheap metadata (index.json carries it
   too, so a status card can show real numbers without pulling a whole guide) */
function countsOf(guide){
  const bookCounts = {}, periodCounts = {};
  for(const w of ((guide && guide.weeks) || [])){
    for(const it of (w.items || [])){
      const b = it.book || "(no book)";
      bookCounts[b] = (bookCounts[b] || 0) + 1;
      const o = Number(it.o);
      if(isFinite(o)) periodCounts[o] = (periodCounts[o] || 0) + 1;
    }
  }
  return { bookCounts: bookCounts, periodCounts: periodCounts };
}

/* ========================================================== THE TEACHING SCOPE
   WHOSE periods are these?

   The guide is the SCHOOL's whole plan, not one teacher's: every book, every
   grade, every period. A teacher teaches part of it and part of it belongs to
   somebody else. The sovereign's brief for SECONDARY (handed over 2026-09-21):

     · teach CLOSE-UP + SCIENCE only — "Global Success is for VT" (the Vietnamese
       programme is not his), so Global Success is out for grades 6 to 9;
     · grade 6: the periods taught by Vietnamese teachers are 8 and 9 — read out of
       the guide's ORDER column (column E: the period within the week).

   Where the guide already answers the question, the station reads it instead of
   assuming. Grades 8 and 9 carry the sheet's own Teacher column on their content
   rows (Local / Expat), and there the LOCAL rows are the state-textbook block —
   periods 1-3 for grade 8 — so the VT assignment is read straight out of the
   sheet. Grade 7 has neither the brief's periods nor a filled Teacher column, so
   its VT periods are reported as NOT YET GIVEN. The card says so; it never guesses.

   The scope is corrected, never edited into the data: these shipped defaults live
   here and /curriculum scope … writes an override into THIS browser's kv (folder
   curriculum, key scope.g<grade>) — exactly like an imported guide, and it is
   equally never uploaded.
   ========================================================================== */
const PLATFORM = "https://learn.eltngl.com/";
const SCOPE_KEYPFX = "scope.g";
const PROVISIONAL = " <b>PROVISIONAL</b> — the brief for this grade has not been given yet; the station read what it could from the school's own sheets and says so rather than presenting a guess as fact. Correct it with <span class=\"cmd\">/curriculum scope ";
const SCOPE_DEFAULTS = {
  "1": { books:["look", "science"], vtPeriods:[], vtTracks:[], provisional:true,
         textbook:"Look 1 — National Geographic Learning (Student Book + Workbook)", platform:PLATFORM,
         source:"PROVISIONAL, read from the school's accounts sheet — the e-learning account it lists is for the LOOK course book (grade 1-5) — and from the Secondary rule that Global Success is the Vietnamese (VT) programme. Not yet confirmed for primary." },
  "2": { books:["look", "science"], vtPeriods:[], vtTracks:[], provisional:true,
         textbook:"Look 2 — National Geographic Learning (Student Book + Workbook)", platform:PLATFORM,
         source:"PROVISIONAL — the LOOK course book (grade 1-5) per the school's accounts sheet; Global Success is the VT programme. Not yet confirmed." },
  "3": { books:["look", "science"], vtPeriods:[], vtTracks:[], provisional:true,
         textbook:"Look 3 — National Geographic Learning (Student Book + Workbook)", platform:PLATFORM,
         source:"PROVISIONAL — the LOOK course book (grade 1-5) per the school's accounts sheet; Global Success is the VT programme. Not yet confirmed." },
  "4": { books:["look", "science"], vtPeriods:[], vtTracks:[], provisional:true,
         textbook:"Look 4 — National Geographic Learning (Student Book + Workbook)", platform:PLATFORM,
         source:"PROVISIONAL — the LOOK course book (grade 1-5) per the school's accounts sheet; Global Success is the VT programme. Not yet confirmed." },
  "5": { books:["look", "science"], vtPeriods:[], vtTracks:[], provisional:true,
         textbook:"Look 5 — National Geographic Learning (Student Book + Workbook)", platform:PLATFORM,
         source:"PROVISIONAL — the LOOK course book (grade 1-5) per the school's accounts sheet; Global Success is the VT programme. Not yet confirmed." },
  "6": { books:["close-up", "science"], vtPeriods:[8, 9], vtTracks:[],
         textbook:"New Close Up A1+ — Student Book + Workbook", platform:PLATFORM,
         source:"the sovereign's brief, Secondary grade 6 — Close-up + Science only; Global Success is the Vietnamese (VT) programme; VT periods 8 & 9 in the ORDER column" },
  "7": { books:["close-up", "science"], vtPeriods:[], vtTracks:[],
         textbook:"New Close-up A2 — Student Book + Workbook", platform:PLATFORM,
         source:"the Secondary rule (Close-up + Science only) — the VT periods for grade 7 have NOT been given yet" },
  "8": { books:["close-up", "science"], vtPeriods:[], vtTracks:["local"],
         textbook:"New Close Up B1 — Student Book + Workbook", platform:PLATFORM,
         source:"the Secondary rule (Close-up + Science only); VT periods read from the guide's own Teacher column, where the LOCAL rows are the state-textbook block" },
  "9": { books:["close-up", "science"], vtPeriods:[], vtTracks:["local"],
         textbook:"New Close Up B1+ — Student Book + Workbook", platform:PLATFORM,
         source:"the Secondary rule (Close-up + Science only); VT periods read from the guide's own Teacher column (LOCAL)" }
};
function clone(o){ try{ return JSON.parse(JSON.stringify(o)); }catch(e){ return o; } }
async function scopeOf(grade){
  grade = String(grade || "");
  const base = SCOPE_DEFAULTS[grade] ? clone(SCOPE_DEFAULTS[grade])
    : { books:[], vtPeriods:[], vtTracks:[], textbook:"", platform:PLATFORM, source:"no scope on file for this grade" };
  if(!base.books) base.books = [];
  if(!base.vtPeriods) base.vtPeriods = [];
  if(!base.vtTracks) base.vtTracks = [];
  const f = folder();
  if(f){
    try{
      const rec = await f.get(SCOPE_KEYPFX + grade);
      if(rec && (rec.books || rec.vtPeriods || rec.vtTracks)){
        base.books = rec.books || [];
        base.vtPeriods = rec.vtPeriods || [];
        base.vtTracks = rec.vtTracks || [];
        base.overridden = true;
        base.at = rec.at;
        base.source = rec.source || base.source;
      }
    }catch(e){}
  }
  return base;
}
async function scopeAll(){ const out = {}; for(const g of GRADES) out[g] = await scopeOf(g); return out; }
async function scopeSet(grade, patch){
  const f = folder(); if(!f) return false;
  const cur = await scopeOf(grade);
  const next = { books: patch.books !== undefined ? patch.books : cur.books,
                 vtPeriods: patch.vtPeriods !== undefined ? patch.vtPeriods : cur.vtPeriods,
                 vtTracks: patch.vtTracks !== undefined ? patch.vtTracks : cur.vtTracks,
                 at: Date.now(), source: patch.source || "corrected by the sovereign" };
  try{ await f.set(SCOPE_KEYPFX + grade, next); return true; }catch(e){ return false; }
}
async function scopeReset(grade){
  const f = folder(); if(!f) return false;
  try{ await f.delete(SCOPE_KEYPFX + grade); return true; }catch(e){ return false; }
}
/* a scope book is a PATTERN, not a filename: "close-up" catches Close-up A1+,
   New Close-up A2, New Close Up B1 and B1+ in one entry, which is why the same
   secondary-wide rule covers all four grades. */
function bookInScope(book, scope){
  if(!scope || !scope.books || !scope.books.length) return true;
  const b = norm(book);
  if(!b) return true;               /* no book named — a test, a trip, a project: nobody else's */
  return scope.books.some(x => b.includes(norm(x)));
}
function vtWhy(it, scope){
  if(!it || !scope) return "";
  if(scope.vtPeriods && scope.vtPeriods.length){
    const o = Number(it.o);
    if(isFinite(o) && scope.vtPeriods.indexOf(o) >= 0) return "period " + o + " of the week (the ORDER column) is a Vietnamese-teacher period";
  }
  const t = norm(it.track || it.who || "");
  if(t && scope.vtTracks && scope.vtTracks.some(x => t === norm(x))) return "the guide's own Teacher column assigns this row to " + (it.track || it.who);
  return "";
}
function scopeMark(it, scope){
  const why = vtWhy(it, scope);
  if(why) return { kind:"vt", label:"VT", why:why };
  if(!bookInScope(it.book, scope)){
    const gs = /global success/i.test(it.book || "");
    return { kind:"out", label:"NOT YOURS", why: gs
      ? "Global Success is the Vietnamese (VT) programme — the sovereign teaches Close-up + Science only"
      : "“" + (it.book || "") + "” is not one of the sovereign's books (" + scopeText(scope) + ")" };
  }
  return { kind:"core", label:"", why:"" };
}
function chip(m){ return (m && m.kind !== "core") ? '<span class="sc-chip ' + m.kind + '" title="' + ex(m.why) + '">' + ex(m.label) + "</span>" : ""; }
function bookLabel(p){
  const n = norm(p);
  if(!n) return String(p == null ? "" : p);
  if(n.indexOf("close") >= 0) return "Close-up / New Close-up";
  if(n.indexOf("scien") >= 0) return "Science";
  if(n.indexOf("look") >= 0) return "Look";
  if(n.indexOf("global") >= 0 || n === "gs") return "Global Success";
  if(n.indexOf("camb") >= 0) return "Cambridge";
  return String(p);
}
function scopeText(scope){ return ((scope && scope.books) || []).map(bookLabel).join(" + ") || "every book"; }
/* book names arrive from the sheets in every spelling the teachers used ("Look 4",
   "LOOK", "GS", "SCIENCE 2") — grouped through bookLabel so a status card reads
   like a book list instead of like the raw column. */
function bookGroups(meta){
  const out = {};
  const bc = (meta && meta.bookCounts) || null;
  if(bc){
    for(const k of Object.keys(bc)){
      const lab = bookLabel(k) || "(no book)";
      out[lab] = (out[lab] || 0) + bc[k];
    }
  } else if(meta && meta.books){
    for(const k of meta.books){ const lab = bookLabel(k); out[lab] = (out[lab] || 0) + 1; }
  }
  return out;
}
/* the one-line scope statement a status card can afford: counts come from the
   metadata (index.json / the imported guide), never from pulling a whole guide */
function scopeLine(grade, meta, scope){
  const pc = (meta && meta.periodCounts) || null;
  const bg = bookGroups(meta);
  const out = [];
  if(Object.keys(bg).length){
    let mine = 0, theirs = 0, unlabelled = 0;
    const mineBits = [], theirBits = [];
    for(const k of Object.keys(bg)){
      if(k === "(no book)"){ unlabelled += bg[k]; mine += bg[k]; continue; }
      if(bookInScope(k, scope)){ mine += bg[k]; mineBits.push(ex(k) + " " + bg[k]); }
      else { theirs += bg[k]; theirBits.push(ex(k) + " " + bg[k] + (/global success/i.test(k) ? " (the VT programme)" : "")); }
    }
    out.push("your books carry <b>" + mine + "</b> of " + (meta.sections || (mine + theirs)) + " sections — " + mineBits.join(" · ")
      + (unlabelled ? " · plus <b>" + unlabelled + "</b> the sheet attributes to no book (a test, a trip, a project — nobody else's)" : "")
      + (theirBits.length ? " · <b>not yours:</b> " + theirBits.join(" · ") : ""));
  }
  let vtCount = 0;
  if(pc && scope.vtPeriods && scope.vtPeriods.length) vtCount = scope.vtPeriods.reduce((acc, o) => acc + (pc[o] || 0), 0);
  out.push("the Vietnamese teacher's: <b>" + ex(scopeVtText(scope)) + "</b>"
    + (vtCount ? " — " + vtCount + " section(s) in the guide" : "")
    + ((scope.vtPeriods && scope.vtPeriods.length) || (scope.vtTracks && scope.vtTracks.length) ? "" : " — the brief for grade " + ex(grade) + " has not arrived, so the station says so instead of guessing"));
  out.push("<span class=\"cmd\">/curriculum scope " + ex(grade) + "</span> to see it in full or correct it");
  return out.join("<br>");
}
function scopeVtText(scope){
  if(scope.vtPeriods && scope.vtPeriods.length) return "periods " + scope.vtPeriods.join(" & ") + " (ORDER)";
  if(scope.vtTracks && scope.vtTracks.length) return "the guide's own " + scope.vtTracks.join(" / ") + " track";
  return "not yet given";
}
async function scopeBrief(){
  const s = await scopeAll();
  return GRADES.map(g => "grade " + g + " → " + scopeText(s[g]) + " · VT: " + scopeVtText(s[g]) + (s[g].overridden ? " (corrected in this browser)" : "")).join(" · ");
}
/* what the scope costs and buys, in numbers — read off the guide itself, and read
   against the guide's OWN Teacher column where the sheet filled it in. */
async function scopeAudit(grade, sc){
  let g = null;
  try{ g = await load(grade); }catch(e){ return null; }
  let total = 0, mine = 0, vt = 0, out = 0, vtInBooks = 0;
  const local = [];
  for(const w of g.weeks){
    for(const it of w.items){
      total++;
      const mk = scopeMark(it, sc);
      if(mk.kind === "core") mine++;
      else if(mk.kind === "vt"){ vt++; if(bookInScope(it.book, sc)) vtInBooks++; }
      else out++;
      const t = norm((it.track || it.who || ""));
      if(t === "local") local.push({ wk: w.n, o: it.o, book: it.book, sec: it.section, unit: it.unit });
    }
  }
  const byPeriod = {};
  for(const x of local){ const k = String(x.o || "?"); (byPeriod[k] = byPeriod[k] || []).push(x.wk); }
  return { guide: g, total: total, mine: mine, vt: vt, out: out, vtInBooks: vtInBooks, local: local, byPeriod: byPeriod };
}
async function scopeAllCard(){
  const sc = await scopeAll();
  const rows = GRADES.map(g => row(gradeLabel(g, ""), ex(scopeText(sc[g])),
    "the Vietnamese teacher's: <b>" + ex(scopeVtText(sc[g])) + "</b>" + (sc[g].overridden ? " · <b>corrected in this browser</b>" : "") + "<br>" + ex(sc[g].source))).join("");
  say(card("🎓 /curriculum scope — whose periods are whose", rows
    + row("HOW TO CORRECT IT", "one command", "<span class=\"cmd\">/curriculum scope 6</span> the detail, with the sheet's own evidence · "
      + "<span class=\"cmd\">/curriculum scope 6 books Close-up, Science</span> · <span class=\"cmd\">/curriculum scope 6 vt 8, 9</span> · "
      + "<span class=\"cmd\">/curriculum scope 6 vt none</span> · <span class=\"cmd\">/curriculum scope 6 reset</span> (back to what shipped)"),
    "The scope is what every other view reads: <b>/curriculum 6</b> shows these books, <b>/coverage</b> counts these sections, and anything else is printed beside them rather than hidden. A correction is kept in this browser's kv — a reload keeps it, nothing is uploaded."));
  dna("[/curriculum scope — " + GRADES.map(g => "g" + g + ":" + (sc[g].books || []).join("+")).join(" ") + "]");
}
async function scopeGradeCard(grade){
  const sc = await scopeOf(grade);
  const a = await scopeAudit(grade, sc);
  const bits = [];
  const booksNote = (sc.books && sc.books.length)
    ? "matched as patterns against the guide's own Book column — one entry (“close-up”) covers Close-up A1+ / New Close-up A2 / New Close Up B1 / B1+ across the grades, which is why the same secondary rule holds for all four. <span class=\"cmd\">/curriculum scope " + ex(grade) + " books all</span> clears the restriction."
    : "every book the guide lists — no restriction is in force for this grade";
  let vtNote;
  if(sc.vtPeriods && sc.vtPeriods.length){
    vtNote = "the ORDER column is the period <i>within the week</i> (column E of the sheet). Periods " + ex(sc.vtPeriods.join(" & ")) + " are not the sovereign's to teach, so they are marked <b>VT</b> everywhere and left out of /coverage. <span class=\"cmd\">/curriculum scope " + ex(grade) + " vt none</span> clears it.";
  } else if(sc.vtTracks && sc.vtTracks.length){
    vtNote = "read out of the guide's own <b>Teacher</b> column, where the sheet assigns every content row to a track.";
  } else {
    vtNote = "the brief for grade " + ex(grade) + " has <b>not been given</b> — the station says so rather than guessing. Set it: <span class=\"cmd\">/curriculum scope " + ex(grade) + " vt 8, 9</span>";
  }
  bits.push(row("SET BY", (levelOf(grade).charAt(0).toUpperCase() + levelOf(grade).slice(1)) + " grade " + ex(grade),
    ex(sc.source) + (sc.overridden ? " · <b>corrected in this browser</b> on " + ex(new Date(sc.at).toLocaleDateString()) : "")));
  bits.push(row("YOUR BOOKS", ex(scopeText(sc)), booksNote));
  if(sc.provisional) bits.push(rowBad("PROVISIONAL", "the brief has not arrived", "the station read this scope off the school's own sheets (the e-learning account is for the LOOK course book, grade 1-5; Global Success is the VT programme at every level) — it is a reading, not an instruction. Confirm or correct it: <span class=\"cmd\">/curriculum scope " + ex(grade) + " books …</span> and <span class=\"cmd\">/curriculum scope " + ex(grade) + " vt …</span>", true));
  bits.push(row("THE VIETNAMESE TEACHER HAS", ex(scopeVtText(sc)), vtNote));
  bits.push(row("TEXTBOOK", ex(sc.textbook || "—"),
    "presentation tools and Online Practice: <b>" + ex(sc.platform || PLATFORM) + "</b> — the login lives in this browser only (<span class=\"cmd\">/keys ngl</span>), never in the source of a public generator."));
  if(a){
    bits.push(row("WHAT THAT LEAVES YOU", a.mine + " of " + a.total + " section(s)",
      "of grade " + ex(grade) + "'s " + a.total + " sections: <b>" + a.mine + "</b> are yours · <b>" + a.vt + "</b> belong to the Vietnamese teacher (of which " + a.vtInBooks + " sit in your own books) · <b>" + a.out + "</b> are outside your books (Global Success 96 — the VT programme — plus Cambridge)."));
    const marked = Object.keys(a.byPeriod).map(Number).sort((x, y) => x - y);
    if(marked.length){
      const agree = marked.filter(o => (sc.vtPeriods || []).indexOf(o) >= 0);
      const sheetOnly = marked.filter(o => (sc.vtPeriods || []).indexOf(o) < 0);
      const briefOnly = (sc.vtPeriods || []).filter(o => marked.indexOf(o) < 0);
      const detail = marked.map(o => "period " + o + " (wk " + a.byPeriod[String(o)].join(", ") + ")").join(" · ");
      let vs = "";
      if(sc.vtPeriods && sc.vtPeriods.length){
        vs = " The brief says periods " + ex(sc.vtPeriods.join(" & ")) + ": agreement on <b>" + ex(agree.join(", ") || "nothing") + "</b>"
          + (sheetOnly.length ? ", the sheet marks <b>" + ex(sheetOnly.join(", ")) + "</b> which the brief does not" : "")
          + (briefOnly.length ? ", the brief marks <b>" + ex(briefOnly.join(", ")) + "</b> which the sheet does not" : "")
          + ". <b>The brief is what the station follows</b> — and this is printed rather than hidden, because a discrepancy the owner cannot see is a discrepancy that quietly becomes a wrong coverage report.";
      }
      bits.push(row("WHAT THE SHEET ITSELF SAYS", detail,
        "the guide's own <b>Teachers</b> column writes <b>LOCAL</b> on " + a.local.length + " content row(s) of grade " + ex(grade) + " — it names the school's own Vietnamese-teacher periods, where the sheet bothered to fill it in." + vs));
    }
    const sample = a.local.slice(0, 8).map(x => '<div class="sc-line">wk ' + ex(x.wk) + " · p" + ex(x.o || "?") + " · " + ex(clip(x.sec || x.unit || "", 40)) + "</div>").join("");
    if(sample) bits.push(row("THE ROWS THE SHEET MARKS", a.local.length + " row(s)", sample + (a.local.length > 8 ? '<div class="sc-line">… and ' + (a.local.length - 8) + " more</div>" : "")));
  }
  bits.push(row("IT IS USED EVERYWHERE", "scope-aware", "/curriculum " + ex(grade) + " shows only your books (<b>all</b> shows every book) · /curriculum week &lt;n&gt; marks each section <b>VT</b> or <b>NOT YOURS</b> · /coverage counts only your sections and reports the rest beside them · plain speech: the scope is in Obi's station state, so he answers inside it."));
  say(card("🎓 /curriculum scope — grade " + ex(grade), bits.join(""),
    "The guide is the school's plan; the scope is the sovereign's part of it. Corrections are kept in this browser's kv (folder <b>" + KVF + "</b>, key <b>" + SCOPE_KEYPFX + ex(grade) + "</b>) and never uploaded."));
  dna("[/curriculum scope " + grade + " — " + scopeText(sc) + " · VT " + scopeVtText(sc) + "]");
  log({ kind:"op", action:"curriculum scope", detail:"grade " + grade, result: scopeText(sc) + " · VT " + scopeVtText(sc) });
}
async function scopeCard(arg){
  const a = String(arg || "").trim();
  const m = /^([1-9])\b\s*([\s\S]*)$/.exec(a);
  if(!m) return scopeAllCard();
  const grade = m[1], rest = m[2].trim();
  if(!rest) return scopeGradeCard(grade);
  const setM = /^(books?|vt|periods?|tracks?|reset)\b\s*([\s\S]*)$/i.exec(rest);
  if(!setM) return scopeGradeCard(grade);
  const what = setM[1].toLowerCase(), val = setM[2].trim();
  if(/^reset/.test(what)){
    const ok = await scopeReset(grade);
    say(card("🎓 /curriculum scope " + ex(grade) + " — reset", row(ok ? "SCOPE" : "NOT RESET", ok ? "back to the brief as shipped" : "this browser's kv could not be written",
      ok ? "the override was removed; the shipped default for grade " + ex(grade) + " is in force again." : "", !ok)));
    log({ kind:"op", action:"curriculum scope", detail:"grade " + grade + " reset", result: ok ? "override removed" : "failed" });
    return ok ? scopeGradeCard(grade) : undefined;
  }
  const patch = {};
  if(/^books?$/.test(what)){
    patch.books = /^(all|everything|none)$/i.test(val) ? [] : val.split(/[,;\/]|\band\b/i).map(s => s.replace(/^["'“”]+|["'“”]+$/g, "").trim()).filter(Boolean);
  } else if(/^tracks?$/.test(what)){
    patch.vtTracks = /^(none|no|nothing|clear)$/i.test(val) ? [] : val.split(/[,;\/]|\band\b/i).map(s => s.trim()).filter(Boolean);
  } else {
    const nums = (val.match(/\d{1,2}/g) || []).map(Number).filter(n => n > 0 && n < 60);
    if(/^(none|no|nothing|clear)$/i.test(val) || !val) patch.vtPeriods = [];
    else if(nums.length) patch.vtPeriods = nums.sort((x, y) => x - y);
    else patch.vtTracks = val.split(/[,;\/]|\band\b/i).map(s => s.trim()).filter(Boolean);
  }
  const ok = await scopeSet(grade, patch);
  if(!ok){
    say(card("🎓 /curriculum scope " + ex(grade) + " — NOT SAVED", rowBad("SCOPE", "could not write", "this browser's kv refused the write (private mode, or storage disabled) — the shipped default is still in force.", true)));
    log({ kind:"op", action:"curriculum scope", ok:false, detail:"grade " + grade, result:"kv write failed" });
    return;
  }
  const sc = await scopeOf(grade);
  say(card("🎓 /curriculum scope " + ex(grade) + " — corrected",
    row("NOW IN FORCE", ex(scopeText(sc)), "the Vietnamese teacher's: <b>" + ex(scopeVtText(sc)) + "</b> — kept in this browser's kv, in force for /curriculum, /coverage and Obi's station state until <span class=\"cmd\">/curriculum scope " + ex(grade) + " reset</span>."),
    "Nothing was uploaded and nothing in the guide was edited: the scope is a lens over the school's own data."));
  log({ kind:"op", action:"curriculum scope", detail:"grade " + grade, result: scopeText(sc) + " · VT " + scopeVtText(sc) });
  dna("[/curriculum scope " + grade + " → " + scopeText(sc) + " · VT " + scopeVtText(sc) + "]");
  return scopeGradeCard(grade);
}

/* --------------------------------------------------------- parsing a workbook
   No library is trusted to guess: the sheet XML is read directly. The header row
   is SCANNED (not hard-coded) because the sheets genuinely differ — grade 8/9
   carry an extra Teacher column, which shifts every column after it. */
const LBL = [
  ["week", /^week/i], ["date", /^date/i], ["book", /^book/i],
  ["who", /^teachers?$/i], ["track", /^teacher$/i], ["order", /^(order|period|tiết)/i],
  ["unit", /^unit\b/i], ["section", /^section/i], ["contents", /language contents/i],
  ["outcomes", /learning outcomes|^objectives/i], ["activities", /differentiat.*activit|suggested.*activit/i],
  ["assess", /^assessments?/i], ["guided", /guided self-learning/i],
  ["sugg", /^suggested activities/i], ["refs", /^references?/i]
];
/* xlsx stores text XML-escaped; a section called "Looking back & Project" would
   otherwise read "Looking back &amp; Project" forever. Decode on the way in. */
function xmlText(s){
  return String(s == null ? "" : s)
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
/* `t="s"` lives on the CELL (the attributes), not inside it — a shared string is
   stored as an index into sharedStrings and only the cell says so. Miss that and
   every cell in the sheet reads as a bare number (the header scan then finds no
   header at all, and the whole workbook silently parses to nothing). */
function cellText(attrs, body, strs){
  const t = /<t[^>]*>([\s\S]*?)<\/t>/.exec(body);
  if(t) return xmlText(t[1]);
  const v = /<v>([\s\S]*?)<\/v>/.exec(body);
  if(!v) return "";
  return /t="s"/.test(attrs) ? xmlText(strs[+v[1]] || "") : v[1];
}
function gridOf(xml, strs){
  const rows = [];
  for(const r of String(xml).matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)){
    const row = [];
    for(const c of r[2].matchAll(/<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){
      let i = 0; for(const ch of c[1]) i = i * 26 + (ch.charCodeAt(0) - 64);
      row[i - 1] = cellText(c[3] || "", c[4] || "", strs);
    }
    rows[+r[1] - 1] = row;
  }
  for(let i = 0; i < rows.length; i++) if(!rows[i]) rows[i] = [];
  return rows;
}
function headerRowOf(rows){
  for(let i = 0; i < Math.min(rows.length, 40); i++){
    const r = rows[i] || [];
    let week = false, date = false;
    for(const c of r){
      const t = String(c == null ? "" : c).replace(/\s+/g, " ").trim();
      if(/^week$/i.test(t)) week = true;
      if(/^date$/i.test(t)) date = true;
    }
    if(week && date) return i;
  }
  return 1;
}
function headerMap(rows, hr){
  if(hr === undefined) hr = 1;
  const clean = s => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  const map = {};
  for(const ri of [hr, hr + 1]){
    (rows[ri] || []).forEach((cell, i) => {
      const h = clean(cell);
      if(!h) return;
      for(const [k, rx] of LBL){ if(rx.test(h) && map[k] === undefined) map[k] = i; }
    });
  }
  let sb = null, wb = null, pages = null;
  (rows[hr] || []).forEach((c, i) => { if(/^pages?$/i.test(clean(c)) && pages === null) pages = i; });
  (rows[hr + 1] || []).forEach((c, i) => { if(/^SB$/i.test(clean(c)) && sb === null) sb = i; if(/^WB$/i.test(clean(c)) && wb === null) wb = i; });
  map.sb = sb === null ? pages : sb;
  map.wb = wb === null ? map.sb : wb;
  if(map.outcomes === undefined){ (rows[hr + 1] || []).forEach((c, i) => { if(/^objectives/i.test(clean(c)) && map.outcomes === undefined) map.outcomes = i; }); }
  return map;
}
function titleOfSheet(rows, hr){
  for(let i = 0; i <= hr; i++){
    for(const c of (rows[i] || [])){
      const t = String(c == null ? "" : c).replace(/\s+/g, " ").trim();
      if(/pacing guide/i.test(t)) return t;
    }
  }
  return String(((rows[0] || [])[0]) || "");
}
function parseSheet(rows, sheetName, sourceLabel){
  const tidy = s => { const t = String(s == null ? "" : s).replace(/\r/g, "").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim(); return /^-?\d+\.0+$/.test(t) ? t.replace(/\.0+$/, "") : t; };
  const num = v => { const n = parseFloat(v); return isFinite(n) ? Math.round(n) : null; };
  const hr = headerRowOf(rows);
  const m = headerMap(rows, hr);
  const get = (r, k) => (m[k] === undefined ? "" : tidy(r[m[k]]));
  const FIELDS = ["sb", "wb", "outcomes", "activities", "assess", "guided", "sugg", "refs"];
  let week = null, dates = "";
  const weeks = []; let cur = null, items = 0;
  const books = {}, tracks = {};
  for(let i = hr + 2; i < rows.length; i++){
    const r = rows[i] || [];
    const rawWeek = tidy(r[m.week]);
    const w = num(r[m.week]); if(w !== null) week = w;
    const d = tidy(r[m.date]); if(d) dates = d;    const unit = get(r, "unit"), section = get(r, "section"), contents = get(r, "contents");
    /* A CONTINUATION ROW: the section's long text sits on the rows below the row
       that names it (the Book/Unit/Week cells are merged across them, so xlsx
       leaves those cells empty). It carries no week, no period and no
       book/unit/section of its own — it is more of the section above, so it is
       merged into it instead of becoming a second, nameless section. */
    const o = num(r[m.order]);
    if(!rawWeek && o === null && !get(r, "book") && !unit && !section){
      const extra = {};
      let any = false;
      for(const k of ["contents"].concat(FIELDS)){ const v = get(r, k); if(v){ extra[k] = v; any = true; } }
      if(any && cur && cur.items.length){
        const tgt = cur.items[cur.items.length - 1];
        for(const k of Object.keys(extra)) tgt[k] = tgt[k] ? (tgt[k] + "\n\n" + extra[k]) : extra[k];
      }
      continue;
    }
    if(!unit && !section && !contents) continue;
    if(!cur || cur.n !== week){ cur = { n: week, dates: dates, items: [] }; weeks.push(cur); }
    else if(d && String(cur.dates || "").indexOf(d) < 0){ cur.dates = cur.dates ? (cur.dates + " · " + d) : d; }
    /* a week the sheet labels outside the sequence ("1A" sits between 1 and 2):
       its rows join week 1, and the label rides along so the card can print it. */
    if(rawWeek && !/^\d+$/.test(rawWeek) && String(cur.n) !== rawWeek) cur.label = rawWeek;
    const it = { o: o };
    const book = get(r, "book"); if(book){ it.book = book; books[book] = (books[book] || 0) + 1; }
    const who = get(r, "who"); if(who) it.who = who;
    const track = get(r, "track"); if(track){ it.track = track; tracks[track] = (tracks[track] || 0) + 1; }
    if(unit) it.unit = unit;
    if(section) it.section = section;
    if(contents) it.contents = contents;
    for(const k of FIELDS){ const v = get(r, k); if(v) it[k] = v; }
    /* a MERGED Book cell: the book is written on the first row of its block and
       the rows beneath it are empty. Inherit it — but only down a block that is
       plainly the same one (the same unit), so a mid-term test or a holiday never
       borrows a book it is not part of. */
    if(!it.book && unit){
      const prev = cur.items[cur.items.length - 1];
      if(prev && prev.unit && norm(prev.unit) === norm(unit)){
        if(prev.book){ it.book = prev.book; books[prev.book] = (books[prev.book] || 0) + 1; }
        if(!it.who && prev.who) it.who = prev.who;
        if(!it.track && prev.track){ it.track = prev.track; tracks[prev.track] = (tracks[prev.track] || 0) + 1; }
      }
    }
    cur.items.push(it); items++;
  }
  weeks.sort((a, b) => (a.n || 0) - (b.n || 0));
  return { grade: gradeOf(sheetName) || "?", sheet: sheetName, title: titleOfSheet(rows, hr).replace(/\s+/g, " "),
    source: sourceLabel || "a workbook ingested with /curriculum import",
    note: "parsed verbatim from the pacing-guide workbook (merged cells forward-filled: Week/Date, and a section's text merged up from the rows below it)",
    books: Object.keys(books), tracks: Object.keys(tracks), weekCount: weeks.length, itemCount: items, weeks: weeks };
}
async function readWorkbook(file){
  const zipjs = await import("https://esm.sh/@zip.js/zip.js");
  const reader = new zipjs.ZipReader(new zipjs.BlobReader(file), { useWebWorkers: false });
  const entries = await reader.getEntries();
  const byName = {};
  for(const e of entries) byName[e.filename] = e;
  const txt = async p => { try{ return await byName[p].getData(new zipjs.TextWriter()); }catch(e){ return ""; } };
  const ssXml = await txt("xl/sharedStrings.xml");
  const strs = [...ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(mm => [...mm[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(x => x[1]).join(""));
  const wbXml = await txt("xl/workbook.xml");
  const relXml = await txt("xl/_rels/workbook.xml.rels");
  const rel = {};
  for(const mm of relXml.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) rel[mm[1]] = mm[2];
  const sheets = [];
  for(const mm of wbXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)){
    let t = rel[mm[2]] || "";
    t = t.replace(/^\/?xl\//, "").replace(/^\/+/, "");
    if(t && !t.startsWith("xl/")) t = "xl/" + t;
    sheets.push({ name: mm[1], path: t });
  }
  const parsed = [];
  for(const s of sheets){
    const e = byName[s.path];
    if(!e) continue;
    const xml = await e.getData(new zipjs.TextWriter());
    parsed.push(parseSheet(gridOf(xml, strs), s.name, file.name));
  }
  await reader.close();
  return parsed;
}

/* ------------------------------------------------------------------ searching */
function unitKey(it){ return norm(String(it.unit || "").replace(/^unit\s*\d+\s*[:\-\u2013\u2014]\s*/i, "")); }
function search(guide, q){
  const n = norm(q);
  if(!n) return [];
  const hits = [];
  for(const w of guide.weeks){
    for(const it of w.items){
      const hay = norm([it.unit, it.section, it.contents, it.outcomes, it.activities, it.assess, it.guided, it.book, it.sb, it.wb].join(" "));
      if(hay.includes(n)) hits.push({ week: w, it: it });
    }
  }
  return hits;
}
function itemLine(it){
  return [it.book, it.who || it.track, it.unit, it.section, it.sb ? ("SB " + it.sb) : ""].filter(Boolean).join(" · ");
}

/* ------------------------------------------------------------------- coverage */
const GENERIC = ["reading", "grammar", "vocabulary", "speaking", "listening", "writing", "language", "revision", "review", "test", "assessment", "project", "getting started", "consolidation", "practice", "progress test", "unit review", "culture"];
function distinctive(section){
  const n = norm(section);
  if(!n || n.length < 6) return false;
  if(GENERIC.includes(n)) return false;
  if(/^a closer look/i.test(n)) return false;
  if(/^\d+(\.\d+)*/.test(n)) return true;
  return n.split(" ").length >= 2 || n.length >= 8;
}
function parseWindow(dates){
  const m = /(\d{1,2})\.(\d{1,2})\s*[-–—]\s*(\d{1,2})\.(\d{1,2})/.exec(String(dates || ""));
  if(!m) return null;
  return [ +m[2] * 100 + +m[1], +m[4] * 100 + +m[3] ];
}
function inWindow(ts, win){
  if(!win || !ts) return false;
  const d = new Date(ts);
  const k = (d.getMonth() + 1) * 100 + d.getDate();
  return win[0] <= win[1] ? (k >= win[0] && k <= win[1]) : (k >= win[0] || k <= win[1]);
}
async function evidence(){
  const ev = { recs: [], chars: 0, transcripts: 0, summaries: 0, failures: [] };
  for(const [f, kind] of [["transcripts", "transcript"], ["summaries", "summary"]]){
    try{
      const entries = await root.kv[f].entries();
      for(const kvp of entries){
        const rec = kvp[1] || {};
        if(!inClient(rec)) continue;
        const body = String(rec.readable || rec.text || "");
        const title = String(rec.title || rec.name || "");
        if(!body && !title) continue;
        ev.recs.push({ id: rec.id || kvp[0], kind: kind, name: title || kvp[0], created: rec.created || rec.at || 0, body: title + "\n" + body });
        ev.chars += body.length;
        if(kind === "transcript") ev.transcripts++; else ev.summaries++;
      }
    }catch(e){ ev.failures.push(kind + ": " + ((e && e.message) || e)); }
  }
  ev.text = norm(ev.recs.map(r => r.body).join("\n"));
  return ev;
}
function gradeOfArg(a, ev){
  const m = /\b([1-9])\b/.exec(String(a || ""));
  return m ? m[1] : null;
}

/* --------------------------------------------------------------------- cards
   NOTE: `card(head, body, foot)` above is the HTML helper — this function must NOT
   share its name. (It did, for one commit: the later declaration won, the helper
   became the async status card, and `say(card(…))` recursed forever. A name is a
   contract; two functions with one name is a loop with extra steps.) */
async function statusCard(){
  let s = { grades: {}, imported: [] };
  try{ s = await summary(); }catch(e){}
  let rows = "", any = false;
  const sc = await scopeAll();
  const imp = {};
  for(const i of (s.imported || [])) imp[i.grade] = i;
  for(const g of GRADES){
    const m = (s.grades || {})[g];
    if(!m || !m.weeks){ rows += rowBad("GRADE " + g, "NOT LOADED", "no pacing guide found for this grade (looked in " + ex(DIR) + ")", true); continue; }
    any = true;
    const from = imp[g]
      ? ("imported from <b>" + ex(imp[g].name) + "</b> on " + ex(new Date(imp[g].at).toLocaleDateString()) + ", kept in this browser (kv " + KVF + ")")
      : ("the guide shipped with the station" + (m.source ? " (" + ex(m.source) + ")" : ""));
    rows += row(gradeLabel(g, titleOf({ title: m.title, grade: g })),
      m.weeks + " weeks · " + m.sections + " sections",
      ex((m.books || []).map(bookLabel).filter((v, i, a) => a.indexOf(v) === i).join(" · ")) + " — " + from + (m.tracks && m.tracks.length ? " · teacher tracks " + ex(m.tracks.join(" / ")) : ""));
    rows += row("└ YOURS · GRADE " + g, "your scope: " + ex(scopeText(sc[g])), scopeLine(g, m, sc[g]));
  }
  const k = creds();
  const credRow = () => "the SECONDARY course (Close-up / New Close Up): " + (k.secondary ? ("stored · <b>" + ex(k.secondary.user || "?") + "</b>") : "not stored (<b>/keys ngl &lt;account&gt; &lt;password&gt;</b>)")
    + " · the PRIMARY course (Look, grades 1-5): " + (k.primary ? ("stored · <b>" + ex(k.primary.user || "?") + "</b>") : "not stored (<b>/keys ngl primary &lt;account&gt; &lt;password&gt;</b>)")
    + ". Both are held in this browser's key store only — a credential NEVER goes in the source of a public generator.";
  const cbody = rows
    + row("BOOKS", "the guide is per book", "Primary (grades 1-5): <b>Look</b> (National Geographic) · Global Success · Science · Cambridge YLE. Secondary (6-9): Global Success · <b>Close-up / New Close-up</b> (National Geographic) · Science · Cambridge. Global Success is the Vietnamese state textbook — the VT programme, never the sovereign's. The secondary sheets also carry the teacher track (EXPAT / LOCAL) where the school splits a class by it.")
    + row("TEACHING SCOPE", "whose periods are whose", "the sovereign teaches <b>part</b> of this plan: <b>/curriculum scope</b> states which books are his and which periods the Vietnamese teacher takes, and every view here reads it — <b>/curriculum scope &lt;grade&gt;</b> corrects it.")
    + row("WHAT IT IS FOR", "/coverage", "the guide says what was required; <b>/coverage</b> puts the station's own evidence beside it — the honest answer to \"what was actually taught?\"")
    + row("TEXTBOOK PLATFORM", "learn.eltngl.com", credRow())
    + row("MATERIALS & eBOOKS", "/curriculum materials", "the school's templates and links, and the books behind them (Cambridge Primary Science Learner's Books grade 4-5, the Look and Close-up courses on the e-learning platform) — <b>/curriculum materials</b> lists them.")
    + '<div class="rrow"><b>COMMANDS</b><span class="vd">9</span><div class="rd">'
      + '<span class="cmd">/curriculum 6</span> the year at a glance · <span class="cmd">/curriculum week 3</span> one week, every book · '
      + '<span class="cmd">/curriculum unit &lt;name&gt;</span> · <span class="cmd">/curriculum find &lt;text&gt;</span> · <span class="cmd">/curriculum scope [grade]</span> · '
      + '<span class="cmd">/curriculum materials</span> · <span class="cmd">/curriculum import</span> (a newer .xlsx) · <span class="cmd">/curriculum export 6</span> · <span class="cmd">/coverage</span>'
      + '<br>Also available: <span class="cmd">/curriculum 6 week 3</span> · <span class="cmd">/curriculum 6 book Close-up</span> · <span class="cmd">/curriculum 6 all</span> (every book, not only yours)</div></div>';
  say(card("🎓 /curriculum — the pacing guide" + (any ? "" : " (nothing loaded)"), cbody,
    "The guide is data, not doctrine: it is the school's own spreadsheet, parsed. /coverage is where it meets the record."));
  dna("[/curriculum — " + Object.keys(s.grades || {}).filter(k => s.grades[k] && s.grades[k].weeks).map(k => "g" + k).join(" ") + "]");
  log({ kind:"op", action:"curriculum", detail:"status", result: any ? "loaded" : "nothing loaded" });
}

async function yearCard(grade, bookFilter, mode){
  let g;
  try{ g = await load(grade); }catch(e){ say(card("🎓 /curriculum — no guide", row("GRADE " + grade, "NOT LOADED", ex(e.message)))); return; }
  const sc = await scopeOf(grade);
  const everything = String(mode || "").toLowerCase() === "all";
  const bookMatch = it => everything ? (!bookFilter || norm(it.book || "").includes(norm(bookFilter))) : (bookFilter ? norm(it.book || "").includes(norm(bookFilter)) : bookInScope(it.book, sc));
  let shown = 0, vts = 0, mine = 0;
  const rows = g.weeks.map(w => {
    const its = w.items.filter(bookMatch);
    if(!its.length) return "";
    const labels = [];
    let wMine = 0, wVt = 0;
    for(const it of its){
      shown++;
      const mk = scopeMark(it, sc);
      if(mk.kind === "vt"){ wVt++; vts++; } else if(mk.kind === "core"){ wMine++; mine++; }
      const u = String(it.unit || "").replace(/^Unit\s*\d+\s*[:\-\u2013\u2014]\s*/i, "").trim()
        || String(it.contents || "").split("\n")[0].trim();
      const label = u + (it.book ? "" : "");
      if(label && labels[labels.length - 1] !== label) labels.push(label);
    }
    return '<div class="rrow"><b>WK ' + ex(weekLabel(w)) + '</b><span class="vd">' + its.length + (wVt ? " · " + wVt + " VT" : "") + "</span><div class=\"rd\">"
      + (w.dates ? '<span class="tr-tag">' + ex(w.dates) + "</span> " : "")
      + ex(labels.join(" · ").slice(0, 300))
      + "</div></div>";
  }).join("");
  const anyVt = (sc.vtPeriods && sc.vtPeriods.length) || (sc.vtTracks && sc.vtTracks.length);
  const scopeRow = row("SCOPE — GRADE " + ex(grade), ex(scopeText(sc)) + (everything ? " · every book" : ""),
    "the Vietnamese teacher's part: <b>" + ex(scopeVtText(sc)) + "</b>" + (anyVt ? " (marked VT below)" : " — so every section shown here is yours to teach")
    + (everything ? " · <b>/curriculum " + ex(grade) + "</b> shows only your own books" : " · <b>/curriculum " + ex(grade) + " all</b> shows Global Success and Cambridge too")
    + " · <span class=\"cmd\">/curriculum scope " + ex(grade) + "</span>");
  say(card("🎓 /curriculum — " + gradeLabel(grade, titleOf(g)) + (bookFilter ? " · " + ex(bookFilter) : (everything ? " · every book" : " · your scope")),
    row("THE GUIDE", g.weekCount + " weeks · " + g.itemCount + " sections", ex([...new Set(g.books.map(bookLabel))].join(" · ")) + " · source " + ex(g.source))
    + scopeRow
    + rows
    + row("NEXT", "one week in full", "<b>/curriculum week 3</b> (grade " + ex(grade) + ") prints every section of that week with its pages, contents, outcomes and assessments. <b>/coverage</b> asks the other question: was it taught?"),
    "Weeks are the spreadsheet's own weeks — its dates are forward-filled from the merged cells. <b>/curriculum find &lt;text&gt;</b> searches inside every field. "
    + (everything ? "" : "This view is YOUR scope: " + ex(scopeText(sc)) + " — " + mine + " of the " + shown + " sections shown are yours, " + vts + " belong to the Vietnamese teacher.")));
  dna("[/curriculum — grade " + grade + " · " + g.weekCount + " weeks" + (everything ? " · every book" : " · scope") + "]");
  log({ kind:"op", action:"curriculum", detail:"grade " + grade + (everything ? " (every book)" : " (scope)"), result: g.weekCount + " weeks · " + g.itemCount + " items" });
}

async function weekCard(grade, n){
  let g;
  try{ g = await load(grade); }catch(e){ say(card("🎓 /curriculum — no guide", row("GRADE " + grade, "NOT LOADED", ex(e.message)))); return; }
  const w = g.weeks.find(x => String(x.n) === String(n) || String(x.label || "") === String(n));
  if(!w){
    say(card("🎓 /curriculum week " + ex(n) + " — grade " + ex(grade),
      rowBad("WEEK", "NOT IN THE GUIDE", "the guide for grade " + ex(grade) + " runs weeks " + ex((g.weeks[0] || {}).n) + "–" + ex((g.weeks[g.weeks.length - 1] || {}).n) + ". <b>/curriculum " + ex(grade) + "</b> lists them.", true)));
    return;
  }
  const sc = await scopeOf(grade);
  let mine = 0, vts = 0, outs = 0;
  const rows = w.items.map(it => {
    const mk = scopeMark(it, sc);
    if(mk.kind === "core") mine++; else if(mk.kind === "vt") vts++; else outs++;
    return '<div class="rrow sc-' + mk.kind + '"><b>' + ex(it.section || it.unit || "—") + '</b>' + chip(mk) + '<span class="vd">' + ex(it.book || "") + (it.who || it.track ? " · " + ex(it.who || it.track) : "") + "</span><div class=\"rd\">"
    + (it.unit ? "<b>" + ex(it.unit) + "</b> · " : "")
    + (it.sb ? "SB " + ex(it.sb) + (it.wb ? " · WB " + ex(it.wb) : "") + " · " : "")
    + (mk.kind !== "core" ? '<span class="sc-why">' + ex(mk.why) + "</span> · " : "")
    + (it.contents ? '<div class="tr-text cur-text">' + ex(clip(it.contents, 900)) + "</div>" : "")
    + (it.outcomes ? '<div class="tr-text cur-text">' + ex(clip(it.outcomes, 600)) + "</div>" : "")
    + (it.activities ? '<div class="tr-text cur-text">▸ activities: ' + ex(clip(it.activities, 500)) + "</div>" : "")
    + (it.sugg ? '<div class="tr-text cur-text">▸ suggested activities: ' + ex(clip(it.sugg, 400)) + "</div>" : "")
    + (it.assess ? '<div class="tr-text cur-text">▸ assessment: ' + ex(clip(it.assess, 400)) + "</div>" : "")
    + (it.refs ? '<div class="tr-text cur-text">▸ references: ' + ex(clip(it.refs, 300)) + "</div>" : "")
    + "</div></div>";
  }).join("");
  say(card("🎓 /curriculum week " + ex(weekLabel(w)) + " — grade " + ex(grade) + (w.dates ? " · " + ex(w.dates) : ""),
    row("THE WEEK", mine + " of " + w.items.length + " section(s) are yours",
      ex(scopeText(sc)) + (vts ? " · <b>" + vts + "</b> section(s) belong to the Vietnamese teacher (VT)" : "") + (outs ? " · " + outs + " outside your books (NOT YOURS)" : "") + " · the VT set: " + ex(scopeVtText(sc)))
    + rows
    + row("ASK ABOUT IT", "the teacher's question", "Obi can turn this into a lesson (<b>/lesson</b>) — for the sections that are YOURS — or a coverage check. <b>/coverage</b> shows whether the record holds any of it."),
    "Verbatim from the guide. Sections marked VT or NOT YOURS stay visible: they are in the week, they are simply not the sovereign's to teach."));
  dna("[/curriculum week " + n + " grade " + grade + " — " + w.items.length + " items · " + mine + " yours]");
}

async function unitCard(q){
  const hits = [];
  for(const g of GRADES){
    let guide;
    try{ guide = await load(g); }catch(e){ continue; }
    for(const w of guide.weeks){
      for(const it of w.items){
        if(it.unit && norm(it.unit).includes(norm(q))) hits.push({ g: g, w: w, it: it });
      }
    }
  }
  if(!hits.length){ say(card("🎓 /curriculum unit — nothing matches", rowBad("SEARCH", "NO MATCH", "no unit in grades " + ex(GRADES.join(", ")) + " contains “" + ex(q) + "”", true))); return; }
  const rows = hits.slice(0, 80).map(h =>
    '<div class="rrow"><b>G' + ex(h.g) + ' · wk ' + ex(h.w.n) + '</b><span class="vd">' + ex(h.it.book || "") + "</span><div class=\"rd\">"
    + ex(h.it.unit) + (h.it.section ? " · " + ex(h.it.section) : "") + (h.it.sb ? " · SB " + ex(h.it.sb) : "") + "</div></div>").join("");
  say(card("🎓 /curriculum unit “" + ex(q) + "”",
    row("FOUND", hits.length + " section(s)", (hits.length > 80 ? "showing the first 80 — " : "") + "across grades " + ex([...new Set(hits.map(h => h.g))].join(", ")))
    + rows, "Every appearance of that unit, in every grade, with the book and the pages."));
  dna("[/curriculum unit " + q + " — " + hits.length + "]");
}

async function findCard(q){
  const out = [];
  for(const g of GRADES){
    let guide;
    try{ guide = await load(g); }catch(e){ continue; }
    for(const h of search(guide, q)) out.push({ g: g, w: h.week, it: h.it });
  }
  if(!out.length){ say(card("🎓 /curriculum find — nothing matches", rowBad("SEARCH", "NO MATCH", "“" + ex(q) + "” does not appear anywhere in the guide (grades " + ex(GRADES.join(", ")) + ")", true))); return; }
  const rows = out.slice(0, 60).map(h =>
    '<div class="rrow"><b>G' + ex(h.g) + " · wk " + ex(h.w.n) + '</b><span class="vd">' + ex(h.it.book || "") + "</span><div class=\"rd\">"
    + ex([h.it.unit, h.it.section, h.it.sb ? "SB " + h.it.sb : ""].filter(Boolean).join(" · ")) + "</div></div>").join("");
  say(card("🎓 /curriculum find “" + ex(q) + "”",
    row("MATCHES", out.length, (out.length > 60 ? "showing the first 60 — " : "") + "searched unit · section · contents · outcomes · activities · assessments · pages")
    + rows, "Free text across every field the guide has."));
  dna("[/curriculum find " + q + " — " + out.length + "]");
}

async function exportCard(grade, kind){
  let g;
  try{ g = await load(grade); }catch(e){ say(card("🎓 /curriculum export", rowBad("GRADE " + grade, "NOT LOADED", ex(e.message), true))); return; }
  const isJson = String(kind || "").toLowerCase() !== "txt";
  const body = isJson ? JSON.stringify(g, null, 1) : ("GRADE " + g.grade + " PACING GUIDE (from " + g.source + ")\n\n" + g.weeks.map(w =>
      "WEEK " + w.n + "  " + w.dates + "\n" + w.items.map(it =>
        "  - " + [it.book, it.who || it.track, it.unit, it.section, it.sb ? "SB " + it.sb : "", it.wb ? "WB " + it.wb : ""].filter(Boolean).join(" · ")
        + (it.contents ? "\n      " + it.contents.replace(/\n/g, "\n      ") : "")
      ).join("\n")
    ).join("\n\n"));
  const name = "pacing-guide-g" + grade + (isJson ? ".json" : ".txt");
  const blob = new Blob([body], { type: isJson ? "application/json" : "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.style.display = "none";
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2500);
  say(card("🎓 /curriculum export", row("EXPORTED", ex(name), Math.round(body.length / 1024) + " KB · the parsed guide, not the spreadsheet — every field as the sheet has it."),
    "Exported from this browser."));
  log({ kind:"export", action:"curriculum", detail:name, result: Math.round(body.length / 1024) + " KB left the browser" });
}

async function importCard(file){
  if(!file){ say(card("🎓 /curriculum import", row("USAGE", "pick a workbook", "Choose the pacing-guide <b>.xlsx</b> — the parser reads it in this browser and keeps the result in this browser's kv. Nothing is uploaded anywhere."), "The sheet must be the school's pacing guide (a tab per grade named like <b>PA.G6</b>).")); return; }
  say(card("🎓 /curriculum import", row("READING", ex(file.name), Math.round(file.size / 1024) + " KB — parsing the workbook in this browser…")));
  try{
    const sheets = await readWorkbook(file);
    const got = [];
    const f = folder();
    for(const s of sheets){
      const g = gradeOf(s.sheet);
      if(!g || !s.weekCount) continue;
      if(f){ try{ await f.set("pa.g" + g, { data: s, name: file.name, at: Date.now() }); }catch(e){} }
      cache[g] = s;
      got.push(s);
    }
    if(!got.length){
      say(card("🎓 /curriculum import", rowBad("RESULT", "NOTHING USABLE", "the workbook was read (" + sheets.length + " sheet(s): " + ex(sheets.map(s => s.sheet).join(", ")) + ") but no sheet parsed into weeks. Is it a pacing guide? (A sheet is one when its name carries the grade — <b>PA.G6</b> for secondary, <b>PA_Grade 4</b> for primary.)", true)));
      return;
    }
    const rows = got.map(s => row("GRADE " + s.grade + " · " + ex(s.sheet), s.weekCount + " weeks · " + s.itemCount + " sections", ex(s.books.join(" · ")))).join("");
    say(card("🎓 /curriculum import — ingested",
      row("FILE", ex(file.name), Math.round(file.size / 1024) + " KB · parsed locally, stored in kv <b>" + KVF + "</b> (this browser only)")
      + rows
      + row("NOW LIVE", "/curriculum " + got.map(s => s.grade).join(" "), "the imported guide replaces the shipped one for those grades, everywhere — <b>/coverage</b> included."),
      "Nothing was uploaded, committed or pushed. A reload keeps it; clearing this browser's kv drops it."));
    dna("[/curriculum import — " + file.name + " · grades " + got.map(s => s.grade).join(", ") + "]");
    log({ kind:"op", action:"curriculum import", detail: file.name, result: got.length + " grade(s) ingested" });
  }catch(e){
    say(card("🎓 /curriculum import", rowBad("FAILED", "COULD NOT PARSE", ex((e && e.message) || e), true),
      "The parser needs the .xlsx itself (not a PDF, not a Google-Sheets link). Fetch it with <b>/url</b> or download it and pick the file."));
    log({ kind:"op", action:"curriculum import", ok:false, detail: file.name, result: (e && e.message) || String(e) });
  }
}

async function coverageCard(arg){
  const all = /\ball\b/i.test(String(arg || ""));
  const grade = gradeOfArg(arg) || "6";
  let g;
  try{ g = await load(grade); }catch(e){ say(card("🎓 /coverage", rowBad("GRADE " + grade, "NOT LOADED", ex(e.message), true))); return; }
  const sc = await scopeOf(grade);
  const ev = await evidence();
  const head = "🎓 /coverage — the guide vs the record · grade " + ex(grade) + " · client " + ex(clientName()) + (all ? " · every book" : " · " + ex(scopeText(sc)));
  const units = new Map();       /* unitKey|book → { unit, book, weeks:Set, items:[], hit:Set } */
  for(const w of g.weeks){
    for(const it of w.items){
      if(!it.unit && !it.section) continue;
      const k = unitKey(it) + "|" + norm(it.book || "");
      let u = units.get(k);
      if(!u){ u = { label: (it.unit || it.section), book: it.book || "", weeks: new Set(), items: [], hit: new Set() }; units.set(k, u); }
      u.weeks.add(w.n);
      u.items.push({ w: w, it: it });
    }
  }
  const noEv = ev.text.length === 0;
  const dateWin = g.weeks.filter(w => parseWindow(w.dates)).map(w => ({ n: w.n, win: parseWindow(w.dates) }));
  const dated = dateWin.filter(w => ev.recs.some(r => inWindow(r.created, w.win))).map(w => w.n);
  let totalItems = 0, evidenced = 0, partial = 0;   /* the sovereign's own sections */
  let oItems = 0, oEv = 0, oPart = 0;               /* what the brief leaves to somebody else */
  const rowsFor = [];
  for(const u of units.values()){
    let ev1 = 0, part = 0, other = 0;
    const gaps = [];
    for(const row of u.items){
      const core = all || scopeMark(row.it, sc).kind === "core";
      const uk = unitKey(row.it), sk = norm(row.it.section);
      const uHit = !!uk && ev.text.includes(uk);
      const sHit = !!sk && ev.text.includes(sk);
      const good = uHit && (sHit || !distinctive(row.it.section));
      if(!core){ oItems++; other++; if(good) oEv++; else if(uHit) oPart++; continue; }
      totalItems++;
      if(good){ ev1++; evidenced++; u.hit.add(row.w.n); }
      else if(uHit){ part++; partial++; u.hit.add(row.w.n); }
      else gaps.push(row.it.section || row.it.unit || "—");
    }
    if(!ev1 && !part) continue;
    rowsFor.push({ u: u, ev1: ev1, part: part, gaps: gaps, other: other });
  }
  rowsFor.sort((a, b) => b.ev1 - a.ev1);
  const bodyRows = rowsFor.slice(0, 40).map(r =>
    '<div class="rrow"><b>' + ex(clip(r.u.label.replace(/^Unit\s*\d+\s*[:\-–—]\s*/i, ""), 40)) + '</b><span class="vd">'
    + (r.ev1 ? r.ev1 + " evidenced" : "") + (r.part ? (r.ev1 ? " · " : "") + r.part + " partial" : "")
    + (r.other ? (r.ev1 || r.part ? " · " : "") + r.other + " not yours" : "")
    + '</span><div class="rd">' + (r.u.book ? ex(r.u.book) + " · " : "") + "weeks " + ex([...r.u.weeks].slice(0, 12).join(", ")) + (r.u.weeks.size > 12 ? "…" : "")
    + (r.gaps.length ? '<br><span class="tr-tag">no evidence:</span> ' + ex([...new Set(r.gaps)].slice(0, 8).join(" · ")) : "")
    + "</div></div>").join("");
  const coveredWeeks = [...new Set([].concat(...rowsFor.map(r => [...r.u.hit])))].sort((a, b) => a - b);
  const gapUnits = [...units.values()].filter(u => !rowsFor.some(r => r.u === u));
  const body =
      rowBad("EVIDENCE", noEv ? "NONE" : (ev.transcripts + " transcript(s) · " + ev.summaries + " summar(y|ies)"),
        noEv
          ? "this client has <b>no transcripts and no summaries</b> in the station yet — so there is nothing to compare the guide against. Record a lesson (<b>/transcribe</b>) and this card starts answering. <b>A silent record is not an empty classroom: it is a missing record.</b>"
          : ex(ev.chars.toLocaleString()) + " chars of evidence scanned" + (ev.failures.length ? " · reads that failed: " + ex(ev.failures.join("; ")) : ""), noEv)
    + row("THE GUIDE", units.size + " unit/book groupings", "grade " + ex(grade) + " · " + g.weekCount + " weeks · " + g.itemCount + " sections · your scope: <b>" + ex(scopeText(sc)) + "</b>"
        + (((sc.vtPeriods && sc.vtPeriods.length) || (sc.vtTracks && sc.vtTracks.length)) ? " · the Vietnamese teacher has: " + ex(scopeVtText(sc)) : " · the Vietnamese teacher's part of this grade has not been given yet, so no section is set aside"))
    + row("COVERAGE — YOUR SECTIONS", totalItems ? (evidenced + " evidenced · " + partial + " partial · " + (totalItems - evidenced - partial) + " with no evidence") : "—",
        totalItems ? ("counted over the " + totalItems + " section(s) that are YOURS — " + ex(scopeText(sc)) + ", minus the Vietnamese teacher's periods. A section counts as <b>evidenced</b> when the record names its unit <i>and</i> its section (or the section is too generic to tell — \"Reading\", \"Grammar\" — in which case the unit alone carries it), and <b>partial</b> when only the unit appears. A generic section is never allowed to fake a match.") : "the guide has no sectioned items for this grade")
    + (oItems ? row("NOT YOURS — NOT COUNTED", oItems + " section(s)",
        "Global Success (the Vietnamese programme) · Cambridge"
        + (((sc.vtPeriods && sc.vtPeriods.length) || (sc.vtTracks && sc.vtTracks.length)) ? " · and the Vietnamese teacher's periods (<b>" + ex(scopeVtText(sc)) + "</b>)" : "")
        + (oEv || oPart ? " — of which <b>" + oEv + "</b> do appear in the record" + (oPart ? " (" + oPart + " partial)" : "") + ", which is a fact about the record and not a gap to close." : " — the record mentions none of them, which is expected: they are not taught here.")
        + " <b>/coverage " + ex(grade) + " all</b> counts them with the rest.", false) : "")
    + row("COVERAGE — YOUR WEEKS", coveredWeeks.length ? (coveredWeeks.length + " of " + g.weekCount + " weeks have any evidence") : "no weeks with evidence",
        coveredWeeks.length ? ("weeks " + ex(coveredWeeks.join(", "))) : "nothing in the record lands on any week of the guide")
    + row("RECORDINGS IN THE GUIDE'S OWN WINDOWS", dated.length ? (dated.length + " week(s)") : "none matched",
        dated.length
          ? ("a recording's date falls inside the guide's dates for weeks " + ex(dated.join(", ")) + " — the dates in the sheet are day.month, so this is corroboration, not proof")
          : "no recording's date falls inside any week's dates (the sheet uses day.month; the reading is month/day, any year)")
    + (bodyRows ? row("WHAT THE RECORD SHOWS", rowsFor.length + " unit(s)", "") + bodyRows : "")
    + (gapUnits.length ? rowBad("NO EVIDENCE OF AT ALL — YOUR SCOPE", gapUnits.length + " unit/book grouping(s)",
        ex(gapUnits.slice(0, 12).map(u => clip(u.label, 44)).join(" · ")) + (gapUnits.length > 12 ? " …" : "") + "<br>Every section in these appears nowhere in this client's record. That is a statement about the record, not about the teaching — a class that was not recorded is invisible here.", true) : "");
  const bubble = say(card(head, body,
    "Evidence-driven, never assumed, and scoped: this counts the sections that are YOURS (" + ex(scopeText(sc)) + ", the Vietnamese teacher's " + ex(scopeVtText(sc)) + " set aside) against the transcripts and summaries filed under this client (<b>" + ex(clientName()) + "</b>) — the raw of a class that was never recorded does not exist here. <b>/transcripts</b> to see what the record actually holds · <b>/curriculum scope " + ex(grade) + "</b> to correct the scope."));
  return bubble;
}

/* --------------------------------------------------------------- the materials
   What the school hands out with the guide: the templates, the links, the books
   behind them. Copied from the sheet — minus the login, which is in the browser's
   key store and nowhere else. */
async function materialsCard(){
  const m = await materials();
  if(!m){ say(card("🎓 /curriculum materials", rowBad("MATERIALS", "not loaded", "src/curriculum/materials.json did not load — reload the page.", true))); return; }
  const k = creds();
  const rows = (m.rows || []).map(r => row((r.n ? r.n + ". " : "") + String(r.what || ""), ex(r.scope || ""),
    ex(r.note || "") + (r.link ? "<br><b>" + ex(r.link) + "</b>" : ""))).join("");
  const eb = m.ebooks || {};
  const eRows = Object.keys(eb).map(key => row("eBOOK · " + ex(key.toUpperCase()), "",
    Object.keys(eb[key]).map(gr => '<div class="sc-line">grade ' + ex(gr) + " · <b>" + ex(eb[key][gr]) + "</b></div>").join(""))).join("");
  const loginRow = row("THE LOGINS", (k.secondary ? "secondary stored" : "secondary not stored") + " · " + (k.primary ? "primary stored" : "primary not stored"),
    "the e-learning platform (learn.eltngl.com) needs an account. The station holds two, in <b>this browser only</b> — the Secondary course (Close-up / New Close Up) and the Primary one (Look, grades 1-5). Set them with <span class=\"cmd\">/keys ngl &lt;account&gt; &lt;password&gt;</span> and <span class=\"cmd\">/keys ngl primary &lt;account&gt; &lt;password&gt;</span>. A credential is never written into this public source.");
  const d = m.drive;
  const wb = row("THE SOURCE WORKBOOKS", "hosted", "the school's own spreadsheets, kept outside the file tree (a generator's src/ is for the code, not for multi-hundred-KB binaries — that is also the platform's own advice):"
    + '<div class="sc-line"><b>Grade 1-5 · Ecogreen</b> — ' + ex(WORKBOOKS.primary) + " <span style=\"opacity:.7\">(the REDACTED copy of the sovereign's workbook: the login cell points at /keys, not at a password)</span></div>"
    + '<div class="sc-line"><b>Grade 6-9 · secondary</b> — ' + ex(WORKBOOKS.secondary) + "</div>"
    + '<div class="sc-line">Anything the station reads at run time is the parsed copy beside it (src/curriculum/pa.g1.json … pa.g9.json); these two are what those were parsed FROM.</div>');
  say(card("🎓 /curriculum materials — what the school hands over", rows + loginRow + eRows + wb
    + (d ? row("IN DRIVE", "the links themselves", "secondary materials folder · the primary accounts/materials workbook · the secondary pacing guide."
      + '<div class="sc-line"><b>' + ex(d.secondaryMaterialsFolder || "") + "</b></div>"
      + '<div class="sc-line"><b>' + ex(d.primaryWorkbook || "") + "</b></div>"
      + '<div class="sc-line"><b>' + ex(d.secondaryPacingGuide || "") + "</b></div>"
      + '<div class="sc-line">' + ex(d.note || "") + "</div>") : ""),
    "Data, not doctrine — but it is the school's own list. The source sheet is " + ex(m.source || "the sovereign's workbook") + "."));
  dna("[/curriculum materials — " + (m.rows || []).length + " row(s)]");
}

/* -------------------------------------------------------------------- router */
async function cmd(arg){
  const a = String(arg || "").trim();
  if(!a) return statusCard();
  const m = a.match(/^(\d)\b\s*([\s\S]*)$/);
  let grade = m ? m[1] : null, rest = m ? m[2].trim() : a;
  const parts = rest.split(/\s+/);
  const v = (parts[0] || "").toLowerCase();
  if(uploadPicker && /^(import|upload)$/i.test(v)){ return uploadPicker(); }
  if(/^scope$/i.test(v)){ return scopeCard(rest.replace(/^scope\s*/i, "").trim() || (grade || "")); }
  if(/^(materials?|files|ebooks?)$/i.test(v)){ return materialsCard(); }
  if(/^(all|everything)$/i.test(v)){ return yearCard(grade || "6", null, "all"); }
  if(/^(mine|yours|myscope)$/i.test(v)){ return yearCard(grade || "6", null, "scope"); }
  if(/^week$/i.test(v)){ return weekCard(grade || "6", parts[1]); }
  if(/^unit$/i.test(v)){ return unitCard(rest.replace(/^unit\s*/i, "")); }
  if(/^(find|search)$/i.test(v)){ return findCard(rest.replace(/^\S+\s*/i, "")); }
  if(/^export$/i.test(v)){ return exportCard(grade || "6", parts[1]); }
  if(/^book$/i.test(v)){ return yearCard(grade || "6", rest.replace(/^book\s*/i, "")); }
  if(!grade && v !== ""){ /* maybe a bare grade is missing: treat as find */ }
  return yearCard(grade || "6", null);
}

/* the file picker — one hidden input, reused */
let fileInput = null;
function uploadPicker(){
  if(!fileInput){
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.addEventListener("change", () => {
      const f = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if(f) importCard(f);
    });
  }
  fileInput.click();
  say(card("🎓 /curriculum import", row("WAITING", "the file picker is open",
    "Pick the pacing-guide <b>.xlsx</b>. It is read here, in this browser; the parsed result is kept in this browser's kv (folder <b>" + KVF + "</b>) and replaces the shipped guide for its grades. Nothing is uploaded."),
    "If the picker did not open, the browser blocked it — click anywhere on the page and run <b>/curriculum import</b> again."));
}

window.ObiCurriculum = {
  cmd: cmd, statusCard: statusCard, yearCard: yearCard, weekCard: weekCard, unitCard: unitCard, findCard: findCard,
  exportCard: exportCard, importCard: importCard, coverageCard: coverageCard, materialsCard: materialsCard,
  scopeCard: scopeCard, scopeAllCard: scopeAllCard, scopeGradeCard: scopeGradeCard,
  scopeOf: scopeOf, scopeAll: scopeAll, scopeSet: scopeSet, scopeReset: scopeReset, scopeBrief: scopeBrief,
  scopeText: scopeText, scopeMark: scopeMark, bookInScope: bookInScope, countsOf: countsOf, materials: materials,
  SCOPE_DEFAULTS: SCOPE_DEFAULTS,
  load: load, all: all, loaded: loaded, summary: summary, search: search, evidence: evidence, titleOf: titleOf,
  parseSheet: parseSheet, readWorkbook: readWorkbook, GRADES: GRADES, PRIMARY: PRIMARY, SECONDARY: SECONDARY,
  levelOf: levelOf, DIR: DIR, WORKBOOKS: WORKBOOKS
};
})();
