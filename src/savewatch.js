/* ============================================================================
   OBI — SAVE WATCH  (src/savewatch.js)

   WHY THIS FILE EXISTS
   A generator is saved by the EDITOR page (perchance.org), not by the page you
   are looking at: the editor collects the two code panels and the src file tree,
   POSTs /api/save, and — when it comes back clean — tells this page to reload
   itself. Everything that can go wrong happens on the other side of that
   boundary, and the alert that explains it is shown on a page this one cannot
   read. The sovereign has been unable to save; the failure is invisible from in
   here. So this file makes it visible.

   WHAT IT WATCHES
     The editor speaks to this page with window.postMessage. Three of its
     messages tell the whole story:

       { command: "updateOutput", … }      the editor handing over the current
                                            code + the CURRENT src manifest
                                            (the draft, with the files that have
                                            not been saved yet)
       { command: "srcStateUpdate", … }    the src file tree's state: manifest +
                                            whether anything is still pending
       { type: "__triggerPageReload…" }    sent AFTER a save succeeded — the
                                            editor asking this page to reload

   So: press Save, then run the check below. If the reload message is there with
   a fresh timestamp, the generator WAS saved and anything left is a reload or a
   rendering problem. If nothing arrived, the save never came back clean — and
   the alert on the editor page is the thing to read (the check lists the exact
   alerts the platform can show, so it can be named).

   It is a recorder, not a fix: it never touches the platform's messages, never
   blocks them, and keeps only the last 60 (localStorage, this browser).
   ========================================================================== */
(function(){
"use strict";

const KEY = "obi_savewatch";
const SKEY = "obi_savewatch_state";
const LIMIT = 60;

let log = [];
try{ log = JSON.parse(localStorage.getItem(KEY) || "[]") || []; }catch(e){ log = []; }
if(!Array.isArray(log)) log = [];
let state = { draftManifest:null, draftPending:null, lastUpdate:0, lastSrcState:0, lastReload:0, lastReloadRevision:null, sourceRevision:null, unsaved:null, at:0 };
try{ const s = JSON.parse(localStorage.getItem(SKEY) || "null"); if(s && typeof s === "object") state = Object.assign(state, s); }catch(e){}

function persist(){
  try{ localStorage.setItem(KEY, JSON.stringify(log.slice(-LIMIT))); }catch(e){}
  try{ state.at = Date.now(); localStorage.setItem(SKEY, JSON.stringify(state)); }catch(e){}
}
function note(kind, extra){
  const rec = { t: Date.now(), k: String(kind).slice(0, 48) };
  if(extra) rec.d = extra;
  log.push(rec);
  if(log.length > LIMIT) log = log.slice(-LIMIT);
  persist();
  return rec;
}
/* a src manifest as the editor holds it: path -> {key, size} */
function manifestFacts(man){
  if(!man || typeof man !== "object") return null;
  const paths = Object.keys(man);
  let bytes = 0, keyed = 0, tempish = 0;
  for(const p of paths){
    const e = man[p] || {};
    if(typeof e.size === "number") bytes += e.size;
    if(e.key) keyed++;
    if(typeof e.expiresAt === "number" || e.temp || e.temporary) tempish++;
  }
  return { files: paths.length, bytes: bytes, keyed: keyed, tempish: tempish };
}

window.addEventListener("message", function(e){
  try{
    if(e.origin !== "https://perchance.org") return;
    const d = e.data || {};
    const kind = d.type || d.command || "(unnamed)";
    if(d.command === "updateOutput"){
      state.lastUpdate = Date.now();
      try{
        const g = d.generator || {};
        if(g.srcManifest){ state.draftManifest = g.srcManifest; }
        state.sourceRevision = d.generatorSourceRevision || state.sourceRevision;
        if(typeof d.generatorIsUnsaved !== "undefined") state.unsaved = d.generatorIsUnsaved;
      }catch(err){}
      note("updateOutput", (d.generator && d.generator.srcManifest) ? Object.keys(d.generator.srcManifest).length + " files" : null);
      return;
    }
    if(d.command === "srcStateUpdate"){
      state.lastSrcState = Date.now();
      if(d.srcManifest) state.draftManifest = d.srcManifest;
      state.draftPending = !!d.srcHasPending;
      note("srcStateUpdate", (d.srcManifest ? Object.keys(d.srcManifest).length + " files" : "?") + (d.srcHasPending ? " · pending" : ""));
      return;
    }
    if(String(kind).indexOf("__triggerPageReload") === 0){
      state.lastReload = Date.now();
      state.lastReloadRevision = d.requestId || null;
      note("HARD RELOAD REQUESTED", "a clean save, or a full refresh — the editor asked this page to reload");
      return;
    }
    note(kind);
  }catch(err){ /* a recorder must never break the page */ }
}, false);

function facts(){ return Object.assign({}, state); }
function entries(){ return log.slice(-40); }
function clear(){
  log = [];
  state = { draftManifest:null, draftPending:null, lastUpdate:0, lastSrcState:0, lastReload:0, lastReloadRevision:null, sourceRevision:null, unsaved:null, at:0 };
  persist();
  return true;
}

function when(t){ return t ? new Date(t).toLocaleTimeString() : "never"; }
function esc(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function row(k, v, d, bad){ return '<div class="rrow' + (bad ? " bad" : "") + '"><b>' + esc(k) + '</b><span class="vd">' + esc(v) + '</span><div class="rd">' + (d || "") + "</div></div>"; }
function card(head, body, foot){ return '<div class="rise"><div class="rhead">' + head + "</div>" + body + '<div class="rfoot">' + (foot || "") + "</div></div>"; }
function say(html){ if(typeof window.addBubble === "function") return window.addBubble("ass", html); }

/* the exact alerts the editor shows, straight from the platform's own save
   handler (/lib/appExtras.js) — so a failure can be named from the inside */
const PLATFORM_ALERTS = [
  ["too-big", "There's too much text in this generator to save it to Perchance's database.", "the two code panels are too long for the database — not our case (main.pjs 2 KB, index.html 27 KB)"],
  ["src-too-big", "Your src files total more than the 2GB limit.", "the file tree is over 2 GB — not our case"],
  ["src-too-many-files", "Your src folder has more than 10,000 files.", "we have ~80"],
  ["src-file-too-big", "One of your src files is over the 100MB per-file limit.", "no"],
  ["src-manifest-invalid", "One of your src file paths isn't valid (letters/numbers/dot/dash/underscore only, max 10 folders deep).", "checked: every path in the tree is valid"],
  ["src-file-missing", "The server couldn't verify one of your src files with the file storage.", "THE ONE TO WATCH: a file in the tree whose upload to the storage is gone (a pre-upload can expire). The platform's own remedy: re-create that file so it re-uploads"],
  ["src-verify-unavailable", "The file storage service couldn't be reached to verify your src files.", "transient — try again in a minute"],
  ["anti_bot_verification_failed", "the upload service couldn't verify your browser (its human-verification check didn't complete)", "an ad/privacy blocker stopping challenges.cloudflare.com — allow it for perchance.org and try again"],
  ["over_daily_allowance", "you've hit the daily upload limit", "wait a day, or upload less"],
  ["invalid-edit-key", "The edit password was incorrect.", "the browser no longer holds this generator's edit key — enter it at perchance.org/<name>#edit"],
  ["session-token-error", "(logs you out and opens the login window)", "sign in again, then save"],
  ["too-many-requests", "You're saving too quickly!", "wait a few seconds, or a VPN/privacy extension is spoofing your address"],
  ["stale", "It looks like you're editing an old version of this generator… (a confirm box)", "the generator was saved elsewhere since this tab loaded — answer the confirm to force the save"]
];

/* THE STORAGE PROBE — the one check that can name a "src-file-missing" failure.
   The editor sends this page its CURRENT src manifest (path -> content-addressed
   key on the uploads host). The server verifies every key in that manifest at save
   time; if one of them has no blob behind it, EVERY save fails with
   src-file-missing — forever, because an unchanged file is never re-uploaded. So
   ask the storage directly, file by file, and name the ones that are gone. */
const KEY_RE = /^[0-9a-f]{32}\.[a-z0-9]{1,20}$/;
async function exists(key){
  try{
    const r = await fetch("https://user.uploads.dev/file/" + key, { method: "HEAD", cache: "no-store" });
    if(r.ok) return true;
    if(r.status === 405 || r.status === 501){
      const r2 = await fetch("https://user.uploads.dev/file/" + key, { headers: { Range: "bytes=0-0" }, cache: "no-store" });
      return r2.ok || r2.status === 206;
    }
    return false;
  }catch(e){ return null; }        /* network — unknown, not missing */
}
async function probeStorage(man){
  const paths = Object.keys(man || {});
  if(!paths.length) return null;
  const missing = [], noKey = [], unknown = [];
  let checked = 0;
  const queue = paths.slice();
  const workers = new Array(Math.min(6, queue.length)).fill(0).map(async () => {
    while(queue.length){
      const p = queue.shift();
      const k = (man[p] && man[p].key) || "";
      if(!KEY_RE.test(k)){ noKey.push(p); continue; }
      const ok = await exists(k);
      checked++;
      if(ok === false) missing.push(p);
      else if(ok === null) unknown.push(p);
    }
  });
  await Promise.all(workers);
  return { total: paths.length, checked: checked, missing: missing, noKey: noKey, unknown: unknown };
}

async function check(){
  const f = facts();
  const draft = manifestFacts(f.draftManifest);
  const store = f.draftManifest ? await probeStorage(f.draftManifest) : null;
  let saved = null;
  try{
    const r = await fetch("/api/getGeneratorStats?name=" + encodeURIComponent(window.generatorName));
    if(r.ok){ const j = await r.json(); saved = j && j.data ? j.data : null; }
  }catch(e){}
  const lastReload = f.lastReload;
  const everSaved = !!lastReload;
  const body =
    row("THIS PAGE", "load #" + (window.__obiSaveWatchLoad = (window.__obiSaveWatchLoad || 0) + 1), "every reload of this page clears what the editor says to it — so this card describes THIS page load. Press Save, then run <b>/save</b> again.")
    + row("THE GENERATOR", (window.generatorIsUnsaved ? "has unsaved edits" : "clean"), "name <b>" + esc(window.generatorName) + "</b> · last saved by the editor: " + (saved && saved.lastEditTime ? new Date(saved.lastEditTime).toLocaleString() : "unknown") + " · views " + (saved ? saved.views : "?"))
    + row("THE EDITOR'S DRAFT (src)", draft ? (draft.files + " files · " + (draft.bytes / 1048576).toFixed(2) + " MB") : "not seen yet", draft ? ("seen " + when(f.lastSrcState || f.lastUpdate) + " · " + draft.keyed + " carry a storage key" + (draft.tempish ? " · " + draft.tempish + " look temporary" : "") + " — from the editor's own <b>updateOutput</b> / <b>srcStateUpdate</b> messages. Limits are 10,000 files · 2 GB · 100 MB per file, so a size failure is not what is happening here.") : "the editor sends its src manifest with every update — open the editor again and this fills in.")
    + (store ? row("STORAGE CHECK", store.missing.length ? store.missing.length + " FILE(S) GONE" : (store.noKey.length ? store.noKey.length + " NOT UPLOADED" : "all " + store.checked + " present"),
        store.missing.length
          ? "These entries in the editor's manifest have <b>no file behind them</b> — the storage returns 404. That is exactly what makes a save fail with <b>src-file-missing</b>, every time, because an unchanged file is never re-uploaded. The fix is to change that file (any edit re-stages it) or remove it: <div class=\"sc-line\">" + store.missing.map(esc).join("</div><div class=\"sc-line\">") + "</div>"
          : (store.noKey.length
              ? "Not uploaded yet (no storage key) — they will upload on the next save: <div class=\"sc-line\">" + store.noKey.map(esc).join("</div><div class=\"sc-line\">") + "</div>"
              : "every key in the editor's manifest answered" + (store.unknown.length ? " (except " + store.unknown.length + " the network would not answer for)" : "") + " — so a <b>src-file-missing</b> failure is not what is happening here."), store.missing.length > 0)
      : "")
    + row("HARD RELOAD ASKED OF THIS PAGE", everSaved ? when(lastReload) : "NOT SEEN", everSaved ? "The editor asks this page to hard-reload after a clean save — and after any full refresh, so this alone does not prove a save landed. Pair it with the storage check above and with what you saw." : "No hard-reload request on this page load yet. Press <b>Save</b> on the editor, wait for the alert (or for nothing), then run <b>/save</b> again — if nothing arrives, the save never came back clean, and <b>the alert on the editor page is the thing to read</b>.")
    + row("MESSAGES SEEN", String(entries().length), "the editor's last messages to this page: " + entries().slice(-8).map(x => "<span class=\"cmd\">" + esc(x.k) + "</span> " + esc(new Date(x.t).toLocaleTimeString()) + (x.d ? " (" + esc(x.d) + ")" : "")).join(" · "))
    + '<div class="rrow"><b>WHAT THE PLATFORM CAN SAY</b><span class="vd">' + PLATFORM_ALERTS.length + ' ALERTS</span><div class="rd">'
      + PLATFORM_ALERTS.map(a => '<div class="sc-line"><b>' + esc(a[0]) + '</b> — “' + esc(a[1]) + '” <span style="opacity:.7">(' + esc(a[2]) + ')</span></div>').join("")
      + "</div></div>";
  say(card("💾 /save — is the generator actually saving?", body,
    "Nothing here changes the generator. <b>/save clear</b> empties the recorder. · If the save still refuses, the alert text above names the cause — that is the whole diagnosis."));
  return { draft: draft, lastReload: lastReload, msgs: entries().length };
}

async function cmd(arg){
  const a = String(arg || "").trim().toLowerCase();
  if(a === "clear"){ clear(); say(card("💾 /save — the recorder is empty", row("CLEARED", "0 entries", "press Save, then run <b>/save</b> again."))); return; }
  await check();
}

window.ObiSaveWatch = { cmd: cmd, check: check, facts: facts, entries: entries, clear: clear, PLATFORM_ALERTS: PLATFORM_ALERTS };
})();
