/* ============================================================================
   OBI — THE CLIENT LAYER  (src/clients.js)

   The station serves CLIENTS. A client is the top-level engagement — the person
   whose students, classes, recordings, summaries, notes, reviews and writeups
   all belong together, and to nobody else. The whole station is scoped to the
   active client: what you record, file, review or search is this client's, and
   another client's evidence can never leak in.

   The first client slot is UNASSIGNED. Timmy was wiped 2026-09-22 ("timmy dropped
   us, so wipe him") — the slot stays open and unnamed until /client <name> is run.
   Everything the station stored before clients existed is adopted into the first real
   client once on first boot — stamped, never rewritten.

   Isolation is fail-closed: every read filters to the active client, a record
   with no client stamp is read as the first client's, /file refuses to file a
   record that belongs to another client, and deleting a client keeps its data
   (isolated in kv) rather than merging it with anyone.

   Commands: /clients (the ledger) · /client <name> (create or switch)
   Data: kv folder "clients" · localStorage obi_client · obi_clients_adopted
   ========================================================================== */
(function(){
"use strict";

const FOLDER = "clients";
const ACTIVE_KEY = "obi_client";
const ADOPT_KEY = "obi_clients_adopted";
const DEFAULT_ID = "unassigned";
const DEFAULT_NAME = "Unassigned";

let _active = null;
let _name = null;
let _boot = null;

function kv(){ if(!root || !root.kv) throw new Error("kv-plugin not loaded (main.pjs)"); return root.kv[FOLDER]; }
function lsGet(k){ try{ return localStorage.getItem(k) || null; }catch(e){ return null; } }
function lsSet(k, v){ try{ v ? localStorage.setItem(k, v) : localStorage.removeItem(k); }catch(e){} }
function slug(s){ return String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }
function e(s){ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s); }
function fmtDate(t){ try{ return new Date(t).toLocaleDateString(); }catch(x){ return "?"; } }

/* ------------------------------ the active client -------------------------- */

function id(){ return _active || lsGet(ACTIVE_KEY) || DEFAULT_ID; }
function name(){ return _name || id(); }
/* the client a record belongs to — an unstamped record is the first client's */
function of(rec){ return (rec && rec.client) ? rec.client : DEFAULT_ID; }
function matches(rec){ return of(rec) === id(); }
function scope(list){ return (list || []).filter(matches); }

async function get(cid){ try{ return (await kv().get(cid)) || null; }catch(e){ return null; } }
async function all(){
  let pairs = [];
  try{ pairs = await kv().entries(); }catch(e){}
  return pairs.map(([k, v]) => v).filter(Boolean).sort((a, b) => (a.created || 0) - (b.created || 0));
}

function paintLabel(){
  try{ const el = document.getElementById("clientLbl"); if(el) el.textContent = name(); }catch(e){}
}
function setActive(ent){
  _active = ent.id; _name = ent.name || ent.id;
  lsSet(ACTIVE_KEY, ent.id);
  paintLabel();
  return ent;
}

/* ------------------------------ adoption ----------------------------------- */

/* One-time, on the first boot of the client layer: everything that predates
   clients is the first client's. Records are stamped; subject keys move from
   `<slug>` to `<client>:<slug>`; the active-subject pointers follow. Bounded and
   idempotent — a record that already carries a client is left exactly as it is. */
async function adopt(){
  const report = { transcripts:0, summaries:0, students:0, classes:0, reviews:0, writeups:0 };

  for(const f of ["transcripts", "summaries"]){
    try{
      const pairs = await root.kv[f].entries();
      for(const [k, v] of pairs){
        if(!v || typeof v !== "object" || v.client) continue;
        v.client = DEFAULT_ID;
        try{ await root.kv[f].set(k, v); report[f]++; }catch(err){}
      }
    }catch(err){}
  }

  for(const [kind, f] of [["student", "students"], ["class", "classes"]]){
    try{
      const pairs = await root.kv[f].entries();
      for(const [k, v] of pairs){
        if(!v || typeof v !== "object") continue;
        if(String(k).indexOf(":") !== -1){ if(!v.client) v.client = String(k).split(":")[0]; continue; }
        const nid = DEFAULT_ID + ":" + k;
        const ent = Object.assign({}, v, { id:nid, kind:(v.kind || kind), client:(v.client || DEFAULT_ID), updated:(v.updated || Date.now()) });
        try{
          await root.kv[f].set(nid, ent);
          await root.kv[f].delete(k);
          report[f]++;
        }catch(err){}
      }
    }catch(err){}
  }

  for(const f of ["reviews", "writeups"]){
    try{
      const pairs = await root.kv[f].entries();
      for(const [k, v] of pairs){
        if(!v || typeof v !== "object") continue;
        let changed = false;
        if(!v.client){ v.client = DEFAULT_ID; changed = true; }
        if(v.subjectId && String(v.subjectId).indexOf(":") === -1){ v.subjectId = DEFAULT_ID + ":" + v.subjectId; changed = true; }
        if(changed){ try{ await root.kv[f].set(k, v); report[f]++; }catch(err){} }
      }
    }catch(err){}
  }

  for(const k of ["obi_student", "obi_class"]){
    const v = lsGet(k);
    if(v && String(v).indexOf(":") === -1) lsSet(k, DEFAULT_ID + ":" + v);
  }
  try{
    const c = JSON.parse(localStorage.getItem("obi_ctx") || "null");
    if(c && c.id && String(c.id).indexOf(":") === -1){ c.id = DEFAULT_ID + ":" + c.id; lsSet("obi_ctx", JSON.stringify(c)); }
  }catch(err){}

  lsSet(ADOPT_KEY, "1");
  return report;
}

/* ------------------------------ boot --------------------------------------- */

async function boot(){
  try{
    let pairs = await kv().entries();
    if(!pairs.length){
      await kv().set(DEFAULT_ID, { id:DEFAULT_ID, name:DEFAULT_NAME, kind:"client", created:Date.now(), updated:Date.now(), notes:[] });
    }
    if(!lsGet(ADOPT_KEY)) await adopt();
    let act = lsGet(ACTIVE_KEY);
    let ent = act ? await get(act) : null;
    if(!ent){
      const list = await all();
      ent = list[0] || { id:DEFAULT_ID, name:DEFAULT_NAME, kind:"client", created:Date.now(), updated:Date.now(), notes:[] };
      if(!list.length) await kv().set(ent.id, ent);
    }
    setActive(ent);
  }catch(err){
    _active = lsGet(ACTIVE_KEY) || DEFAULT_ID;
    _name = _active;
    paintLabel();
  }
  return { id:id(), name:name() };
}
function whenReady(){ return _boot || (_boot = boot()); }

/* ------------------------------ counts ------------------------------------- */

async function countIn(f, cid){
  try{
    const pairs = await root.kv[f].entries();
    let n = 0;
    for(const [k, v] of pairs){ if(v && typeof v === "object" && of(v) === cid) n++; }
    return n;
  }catch(err){ return null; }
}
async function stats(cid){
  const out = { students:null, classes:null, transcripts:null, summaries:null, reviews:null, writeups:null, last:0 };
  const jobs = [
    ["students", "students"], ["classes", "classes"], ["transcripts", "transcripts"],
    ["summaries", "summaries"], ["reviews", "reviews"], ["writeups", "writeups"]
  ];
  for(const [key, f] of jobs){
    out[key] = await countIn(f, cid);
    if(out[key] === null) delete out[key];
  }
  try{
    for(const [, f] of jobs){
      const pairs = await root.kv[f].entries();
      for(const [k, v] of pairs){
        if(!v || typeof v !== "object" || of(v) !== cid) continue;
        const t = v.updated || v.created || 0;
        if(t > out.last) out.last = t;
      }
    }
  }catch(err){}
  return out;
}

/* ------------------------------ cards -------------------------------------- */

function statLine(s){
  const bits = [];
  if(s.students != null) bits.push(s.students + " student(s)");
  if(s.classes != null) bits.push(s.classes + " class(es)");
  if(s.transcripts != null) bits.push(s.transcripts + " recording(s)");
  if(s.summaries != null) bits.push(s.summaries + " summary(ies)");
  if(s.reviews != null) bits.push(s.reviews + " review(s)");
  if(s.writeups != null) bits.push(s.writeups + " writeup(s)");
  return bits.join(" · ");
}

async function card(ent, opts){
  opts = opts || {};
  const s = await stats(ent.id);
  const isActive = ent.id === id();
  const others = (await all()).filter(c => c.id !== ent.id);
  addBubble("ass", '<div class="rise tr-card"><div class="rhead">👤 Client — ' + e(ent.name) + '</div>'
    + '<div class="rrow"><b>ACTIVE</b><span class="vd">' + (isActive ? "YES" : "NO") + '</span><div class="rd">'
    + (isActive ? "every recording, summary, note, review and writeup now files under this client and no other"
                : "switch to it with <b>/client " + e(ent.name) + "</b>") + '</div></div>'
    + '<div class="rrow"><b>STORED</b><span class="vd">' + (opts.created ? "NEW" : "EXISTING") + '</span><div class="rd">'
    + e(statLine(s)) + (s.last ? ' · last activity ' + e(fmtDate(s.last)) : '') + '</div></div>'
    + '<div class="rrow"><b>ID</b><span class="vd">' + e(ent.id) + '</span><div class="rd">created ' + e(fmtDate(ent.created)) + ' · keyed in kv "' + FOLDER + '"</div></div>'
    + (others.length ? '<div class="rrow"><b>OTHER CLIENTS</b><span class="vd">' + others.length + '</span><div class="rd">'
        + others.map(c => '<button class="ci-act" data-client="' + e(c.id) + '" data-do="select">◈ ' + e(c.name) + '</button>').join(" ") + '</div></div>' : '')
    + '<div class="rfoot">Add or switch: <b>/client &lt;name&gt;</b> · the ledger: <b>/clients</b>. Evidence never crosses clients — a record belongs to exactly one.</div></div>');
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [client " + ent.name + " — " + (opts.created ? "created" : "selected") + " · " + (isActive ? "active" : "not active") + "]"); }catch(err){}
  wire();
  return ent;
}

function wire(){
  document.querySelectorAll("[data-client][data-do]").forEach(b => {
    b.onclick = async () => {
      const cid = b.dataset.client, verb = b.dataset.do;
      if(verb === "select"){
        const ent = await get(cid);
        if(!ent){ addBubble("ass", "⚠ No client <b>" + e(cid) + "</b> in the ledger."); return; }
        setActive(ent);
        await card(ent, {});
      } else if(verb === "del"){
        if(!window.confirm("Delete the client record for '" + cid + "'? Its students, classes, transcripts, summaries and reviews stay in kv, isolated under that id — nothing is merged or erased.")) return;
        const r = await remove(cid);
        if(!r.ok){
          addBubble("ass", r.reason === "only"
            ? "⚠ That is the only client — the station always serves at least one. Add another with <b>/client &lt;name&gt;</b> first."
            : "⚠ Could not delete <b>" + e(cid) + "</b>: " + e(r.reason));
          return;
        }
        addBubble("ass", "🗑 Client record <b>" + e(cid) + "</b> deleted. Its evidence is untouched in kv — recreate a client with the same name to reach it again.");
      }
    };
  });
}

async function roster(){
  let list = [];
  try{ list = await all(); }
  catch(err){ addBubble("ass", "⚠ Client store unavailable: " + e(err.message)); return; }
  if(!list.length){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">👤 /clients</div><div class="rrow"><b>LEDGER</b><span class="vd">EMPTY</span><div class="rd">no clients yet</div></div>'
      + '<div class="rfoot">Start one: <b>/client &lt;name&gt;</b>. Every recording, summary, note, review and writeup then files under that client.</div></div>');
    return;
  }
  const act = id();
  const rows = [];
  for(const c of list){
    const s = await stats(c.id);
    rows.push('<div class="rrow"><b>' + e(c.name) + '</b><span class="vd">' + (c.id === act ? "ACTIVE" : "") + '</span><div class="rd">'
      + e(statLine(s)) + ' · created ' + e(fmtDate(c.created)) + (s.last ? ' · last activity ' + e(fmtDate(s.last)) : '')
      + '<br><span class="tr-acts">'
      + '<button class="ci-act" data-client="' + e(c.id) + '" data-do="select">◈ Select</button>'
      + (c.id === act ? '' : '<button class="ci-act" data-client="' + e(c.id) + '" data-do="del">✗</button>')
      + '</span></div></div>');
  }
  /* THE INTAKE VAULT IS NOT THE LEDGER. A prospect who came in through intake sits in
     its own kv folder and has never been made a client — it owns no students, no
     classes, no evidence, nothing. The ledger must SAY so rather than let those
     records look like clients it already carries. Fail closed: if intake cannot be
     read, the row is omitted rather than guessed. */
  let intake = [];
  try{
    const ks = await root.kv.intake.keys();
    intake = (ks || []).filter(k => String(k).indexOf("__") !== 0 && !list.some(c => c.id === String(k)));
  }catch(err){ intake = []; }
  const intakeRow = intake.length
    ? '<div class="rrow"><b>INTAKE VAULT</b><span class="vd">' + intake.length + '</span><div class="rd">prospect' + (intake.length === 1 ? "" : "s") + ' with an intake record but <b>no client</b> yet: <b>' + intake.map(e).join(", ") + '</b> — a prospect owns nothing until it is made a client. Bring one in with <b>/client &lt;name&gt;</b>.</div></div>'
    : "";
  addBubble("ass", '<div class="rise tr-card"><div class="rhead">👤 /clients — the station\'s ledger</div>'
    + '<div class="rrow"><b>CLIENTS</b><span class="vd">' + list.length + '</span><div class="rd">active: <b>' + e(name()) + '</b> — everything you record, file, review or search belongs to the active client alone</div></div>'
    + intakeRow
    + rows.join("")
    + '<div class="rfoot">Switch or add: <b>/client &lt;name&gt;</b>. A client\'s evidence is isolated — the station will not file a record across clients, and deleting a client never merges its data.</div></div>');
  wire();
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [/clients — " + list.length + " client(s), active " + name() + "]"); }catch(err){}
}

/* delete a client RECORD — never its data. Its students/classes/evidence stay in kv,
   isolated under the stamped id. Refuses to remove the last client. */
async function remove(cid){
  cid = String(cid || "").trim();
  const target = await get(cid);
  if(!target) return { ok:false, reason:"no client '" + cid + "' in the ledger" };
  const list = await all();
  if(list.length <= 1) return { ok:false, reason:"only" };
  try{ await kv().delete(cid); }catch(err){ return { ok:false, reason:String(err.message || err) }; }
  if(cid === id()){
    const rest = await all();
    if(rest.length) setActive(rest[0]);
  }
  paintLabel();
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [client " + cid + " record deleted — its data kept in kv]"); }catch(err){}
  return { ok:true };
}

/* create-or-switch: the one command the operator needs */
async function select(arg){
  const raw = String(arg || "").trim();
  if(!raw) return roster();
  const key = slug(raw) || DEFAULT_ID;
  await whenReady();
  let ent = await get(key), created = false;
  if(!ent){
    ent = { id:key, name:raw.slice(0, 60), kind:"client", created:Date.now(), updated:Date.now(), notes:[] };
    try{ await kv().set(key, ent); created = true; }
    catch(err){ addBubble("ass", "⚠ Could not create the client: " + e(err.message)); return; }
  }
  setActive(ent);
  return card(ent, { created:created });
}

async function command(arg){
  const raw = String(arg || "").trim();
  if(!raw) return roster();
  return select(raw);
}

/* ------------------------------ exports ------------------------------------ */

const API = {
  DEFAULT_ID, DEFAULT_NAME, FOLDER,
  whenReady, id, name, of, matches, scope, get, all, stats,
  roster, select, command, adopt, remove, clientCard: card
};
_boot = boot();
API.ready = _boot;
window.ObiClients = API;

/* keep the topbar label honest from the first paint */
try{ document.addEventListener("DOMContentLoaded", paintLabel); }catch(err){}
paintLabel();
})();
