/* ============================================================================
   THE ROLE KIT — src/generators/role-kit/kit.js           (v1 · 2026-09-22)

   WHY THIS FILE EXISTS
   On the evening of the 23rd of September the tutor recorded a lesson and then
   said what he wanted, in his own words:

      "so we'll build it all into one app so that it remembers, right? …
       you obviously have to do the capture, because robots…"

   and

      "You know what a pipeline is? It's like a to-do list, right?
       And then we won't forget about that."

   The station answered with ONE app (`src/intake.js`, the desk). This kit is the
   other half of that answer: a FAMILY of small generators — one per function the
   lesson produced (the CV, the LinkedIn, the headshot, the portfolio intake, the
   44 phonemes, the weekly recorded presentation, the applications, the interview
   drill, the umbrella, the presence, the credit, the idea lists) — so a function
   can be handed to the next student, or to the next tutor, without carrying the
   whole station.

   WHAT IT IS
   The ~450 lines every one of those generators would otherwise write again:
   the house theme, the record store, the import/export that lets a record move
   between any two of them, the fail-closed field reader, and the page furniture
   (the header, the record picker, the import/export bar).

   THE ONE RULE THE WHOLE FAMILY OBEYS
   A record written by ANY of these generators can be read by the station's
   `/intake`, and a record exported by the station's `/intake export` can be read
   by ANY of them. Same shape (`intake/1` records), same verbatim inbox, same
   fail-closed fields. That is what makes the family reusable instead of twelve
   silos.

   HOW IT IS USED (the build recipe)
   The kit is INLINED into each role's `index.html` — the whole file is pasted in
   where the builder puts it, so every role is one paste of two files
   (`main.pjs` + `index.html`), has no
   runtime dependency, and opens offline. `src/generators/README.md` carries the
   builder line. `src/generators/role-kit/test.html` is this kit's own harness.

   STORAGE
   `root.kv.intake` when the perchance kv-plugin is present (durable, private,
   per origin — the real case), falling back to localStorage so the kit can be
   opened, driven and tested as a plain page outside perchance. That is THE SAME
   FOLDER the station's `/intake` keeps its records in, so opened inside the
   station a role is holding the desk's own records, and opened in a generator of
   its own it is holding that origin's — one store per origin, shared by every
   role there.

   NOTHING HERE INVENTED A STUDENT. No name, no degree, no score, no search lives
   in this file or in any role's source. A record is made by a human, lives in
   that browser, and leaves only when a human exports it.
   ========================================================================== */
(function () {
  "use strict";

  var V = "intake/1";
  var LSP = "ok:rec:", LSL = "ok:last";

  /* ---------------------------------------------------------------- theme -- */
  var CSS = [
    "body{text-align:left;margin:0;background:#0f0f1a;color:#e9e6f2;",
      "font:15px/1.55 system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}",
    ":root{--void:#0f0f1a;--panel:#151524;--panel2:#1b1b2e;--line:rgba(168,85,247,.22);",
      "--purple:#a855f7;--gold:#e8c565;--ink:#e9e6f2;--muted:#8b94ad;--ok:#50dc82;",
      "--warn:#e6b43c;--bad:#e0473f;--cyan:#5ed5eb;",
      "--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}",
    ".ok-wrap{max-width:1140px;margin:0 auto;padding:14px 16px 70px}",
    ".ok-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px;",
      "border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:16px}",
    ".ok-mark{width:34px;height:34px;flex:0 0 auto;color:var(--gold)}",
    ".ok-title{font-size:19px;font-weight:700;letter-spacing:.2px}",
    ".ok-title small{font-weight:400;font-size:12px;color:var(--muted);display:block;letter-spacing:.6px}",
    ".ok-spacer{flex:1 1 auto}",
    ".ok-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}",
    ".ok-select,.ok-input,.ok-textarea{background:#0c0c16;color:var(--ink);border:1px solid var(--line);",
      "border-radius:8px;padding:7px 9px;font:inherit;font-size:13.5px;min-width:0}",
    ".ok-textarea{width:100%;min-height:110px;font-family:var(--mono);font-size:12.5px;line-height:1.5}",
    ".ok-input{width:100%}",
    ".ok-select:focus,.ok-input:focus,.ok-textarea:focus{outline:none;border-color:var(--purple);",
      "box-shadow:0 0 0 2px rgba(168,85,247,.16)}",
    "::placeholder{color:#464d68;font-style:italic;opacity:1}",
    ".ok-btn{background:linear-gradient(180deg,rgba(168,85,247,.28),rgba(168,85,247,.14));",
      "color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:7px 12px;",
      "font:inherit;font-size:13px;cursor:pointer}",
    ".ok-btn:hover{border-color:var(--purple)}",
    ".ok-btn.gold{background:linear-gradient(180deg,rgba(232,197,101,.3),rgba(232,197,101,.12));border-color:rgba(232,197,101,.4)}",
    ".ok-btn.ghost{background:transparent}",
    ".ok-btn:disabled{opacity:.45;cursor:not-allowed}",
    ".ok-card{background:linear-gradient(180deg,var(--panel),var(--panel2));border:1px solid var(--line);",
      "border-radius:12px;padding:14px 16px;margin:0 0 14px}",
    ".ok-card h2{margin:0 0 10px;font-size:12.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold)}",
    ".ok-card h3{margin:14px 0 6px;font-size:12.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted)}",
    ".ok-row{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline;padding:6px 0;",
      "border-top:1px solid rgba(168,85,247,.13)}",
    ".ok-row:first-of-type{border-top:0}",
    ".ok-row>b{flex:0 0 168px;font-size:12px;letter-spacing:.7px;text-transform:uppercase;color:var(--muted);font-weight:600}",
    ".ok-row>.ok-v{flex:1 1 260px;min-width:0;word-break:break-word}",
    ".ok-note{font-size:12px;color:var(--muted);margin-top:2px}",
    ".ok-note.bad{color:var(--bad)}",
    ".ok-note.warn{color:var(--warn)}",
    ".ok-tag{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:.6px;",
      "border:1px solid var(--line);border-radius:999px;padding:1px 8px;color:var(--muted)}",
    ".ok-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}",
    ".ok-list{margin:0;padding-left:18px}.ok-list li{margin-bottom:3px}",
    ".ok-mono{font-family:var(--mono);font-size:12.5px}",
    ".ok-blank{display:inline-block;min-width:45%;border-bottom:1px dotted #8b94ad;color:#8b94ad;font-style:italic}",
    ".ok-foot{font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:8px;margin-top:4px}",
    ".ok-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#1b1b2e;",
      "border:1px solid var(--purple);border-radius:9px;padding:9px 14px;font-size:13px;z-index:99;",
      "box-shadow:0 8px 26px rgba(0,0,0,.5)}",
    ".ok-empty{border:1px dashed var(--line);border-radius:10px;padding:14px;color:var(--muted)}",
    ".ok-check{display:flex;gap:8px;align-items:flex-start;padding:4px 0}",
    ".ok-check input{margin-top:3px;flex:0 0 auto}",
    ".ok-sec{border-top:1px solid var(--line);margin-top:12px;padding-top:10px}",
    "table.ok-t{width:100%;border-collapse:collapse;font-size:13px}",
    "table.ok-t th{text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;",
      "color:var(--muted);border-bottom:1px solid var(--line);padding:6px 6px;font-weight:600}",
    "table.ok-t td{border-bottom:1px solid rgba(168,85,247,.13);padding:6px 6px;vertical-align:top}",
    "table.ok-t td.n{font-family:var(--mono)}",
    "@media print{.ok-head,.ok-bar,.ok-btn,.ok-toast{display:none!important}",
      "body{background:#fff;color:#000}.ok-card{border-color:#bbb;background:#fff}}",
    "@media(max-width:640px){.ok-row>b{flex:0 0 100%}.ok-wrap{padding:10px 11px 60px}}"
  ].join("");

  function ensureCSS() {
    try {
      if (document.getElementById("ok-css")) return;
      var s = document.createElement("style");
      s.id = "ok-css"; s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  /* --------------------------------------------------------------- basics -- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function lines(v) {
    return String(v == null ? "" : v).split(/\n|\u00b7|\|/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function slug(s) {
    return String(s || "record").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "record";
  }
  function nowISO() { return new Date().toISOString(); }
  function day(iso) { return String(iso || "").slice(0, 10); }
  function strip(html) {
    var d = document.createElement("div"); d.innerHTML = html; return (d.textContent || "").trim();
  }
  function toast(msg) {
    try {
      var t = document.createElement("div");
      t.className = "ok-toast"; t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(function () { try { t.remove(); } catch (e) {} }, 2600);
    } catch (e) {}
  }
  function download(filename, text, mime) {
    try {
      var blob = new Blob([text], { type: mime || "text/html" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { try { URL.revokeObjectURL(url); a.remove(); } catch (e) {} }, 2500);
      return true;
    } catch (e) { return false; }
  }
  function copy(text, label) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        toast((label || "copied") + " — on the clipboard");
        return true;
      }
    } catch (e) {}
    toast("this browser refused the clipboard — select and copy by hand");
    return false;
  }

  /* ---------------------------------------------------------------- store -- */
  /* THE SAME FOLDER THE STATION USES. `root.kv.intake` is where `/intake` keeps
     its records, so in the station's own origin a role reads and writes THE
     SAME records the desk does — open THE CV from the station and it is holding
     the record the desk just made. In a role's own generator the folder is that
     origin's `intake`, which is still one store shared by every role opened
     there, so a record is imported once and every role sees it. */
  function folder() {
    try {
      if (typeof root !== "undefined" && root && root.kv && root.kv.intake) return root.kv.intake;
      if (typeof root !== "undefined" && root && root.kv && root.kv.records) return root.kv.records;
    } catch (e) {}
    return null;
  }
  function durable() { return !!folder(); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { localStorage.removeItem(k); return true; } catch (e) { return false; } }

  async function ids() {
    var f = folder();
    if (f) {
      try {
        var ks = await f.keys();
        return (ks || []).filter(function (k) { return String(k).indexOf("__") !== 0; }).sort();
      } catch (e) { return []; }
    }
    var out = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(LSP) === 0) out.push(k.slice(LSP.length));
      }
    } catch (e) {}
    return out.sort();
  }
  async function get(id) {
    var f = folder();
    if (f) { try { return await f.get(id); } catch (e) { return null; } }
    try { var t = lsGet(LSP + id); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }
  async function save(rec) {
    if (!rec || !rec.id) return false;
    rec.v = V; rec.updated = nowISO();
    var f = folder();
    if (f) { try { await f.set(rec.id, rec); return true; } catch (e) { return false; } }
    return lsSet(LSP + rec.id, JSON.stringify(rec));
  }
  async function forget(id) {
    var f = folder();
    if (f) { try { await f.delete(id); return true; } catch (e) { return false; } }
    return lsDel(LSP + id);
  }
  async function list() {
    var ks = await ids(), out = [];
    for (var i = 0; i < ks.length; i++) { var r = await get(ks[i]); if (r) out.push(r); }
    return out;
  }
  async function lastId() {
    var f = folder();
    if (f) { try { return await f.get("__last"); } catch (e) { return null; } }
    return lsGet(LSL);
  }
  async function setLast(id) {
    var f = folder();
    if (f) { try { await f.set("__last", id); } catch (e) {} return; }
    lsSet(LSL, id);
  }

  /* --------------------------------------------------------------- record -- */
  function blank(id, name, extra) {
    var rec = {
      v: V, id: id, name: name || id, spelling: "", role: "student",
      tutor: "the tutor", evidenceSet: [], note: "",
      fields: [], owed: {}, inbox: [], log: [], at: nowISO()
    };
    if (extra) for (var k in extra) rec[k] = extra[k];
    return rec;
  }
  /* FAIL CLOSED (L41). A row the machine GUESSED (state:"unresolved") is not a
     supplied row: it never prints, never headlines, never fills a blank. */
  function field(rec, k) {
    if (!rec || !rec.fields) return null;
    for (var i = 0; i < rec.fields.length; i++) {
      var f = rec.fields[i];
      if (f && f.k === k) {
        if (f.value == null || !String(f.value).trim()) return null;
        if (f.state === "unresolved") return null;
        return f;
      }
    }
    return null;
  }
  function raw(rec, k) {
    if (!rec || !rec.fields) return null;
    for (var i = 0; i < rec.fields.length; i++) if (rec.fields[i] && rec.fields[i].k === k) return rec.fields[i];
    return null;
  }
  function val(rec, k) { var f = field(rec, k); return f ? String(f.value) : ""; }
  function setField(rec, k, label, value, ev, state) {
    rec.fields = rec.fields || [];
    var f = raw(rec, k);
    var changed = false;
    if (!f) { f = { k: k, label: label || k, value: "", ev: "", state: "stated" }; rec.fields.push(f); changed = true; }
    var nv = value == null ? "" : String(value);
    if (String(f.value || "") !== nv) changed = true;
    if (ev && f.ev !== ev) changed = true;
    f.label = label || f.label || k;
    f.value = nv;
    f.ev = ev || f.ev || "";
    f.state = state || (nv ? "stated" : (f.state === "unresolved" ? "unresolved" : "stated"));
    if (changed) logLine(rec, "set " + k + (nv ? "" : " (cleared)"));
    return changed;
  }
  function logLine(rec, what) {
    rec.log = rec.log || [];
    rec.log.push({ at: nowISO(), what: String(what) });
    if (rec.log.length > 300) rec.log = rec.log.slice(-300);
  }
  /* L38 RAW_FIRST_DERIVE — the thing that arrived is kept VERBATIM, forever. */
  function inbox(rec, item, label, value, kind) {
    rec.inbox = rec.inbox || [];
    var entry = {
      at: nowISO(), kind: kind || (/(^|\s)(https?:\/\/|www\.)/i.test(String(value)) ? "link" : "text"),
      label: label || String(value).slice(0, 48), value: String(value), item: item || "portfolio"
    };
    rec.inbox.push(entry);
    logLine(rec, "received into " + entry.item + ": " + entry.label);
    return entry;
  }
  function inboxOf(rec, item) {
    return (rec.inbox || []).filter(function (x) { return x.item === item; });
  }
  /* the family contract: whatever a human types is captured VERBATIM first. */
  async function soul(text, from) {
    var t = String(text == null ? "" : text);
    if (!t.trim()) return false;
    var entry = { at: nowISO(), from: from || "a role generator", text: t };
    var f = null;
    try { if (typeof root !== "undefined" && root && root.kv && root.kv.soul) f = root.kv.soul; } catch (e) {}
    if (f) { try { await f.set("soul-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7), entry); return true; } catch (e) {} }
    try {
      var all = JSON.parse(lsGet("ok:soul") || "[]");
      all.push(entry); if (all.length > 500) all = all.slice(-500);
      return lsSet("ok:soul", JSON.stringify(all));
    } catch (e) { return false; }
  }

  /* --------------------------------------------------------------- import -- */
  /* ONE reader for every shape a record can arrive in: the station's
     `/intake export <name>` (one record), `/intake export all` (an array), a
     raw `{"quan":{…}}` map, or `{"records":[…]}`. */
  var KNOWN_KEYS = { v: 1, id: 1, name: 1, spelling: 1, role: 1, tutor: 1, evidenceSet: 1,
    note: 1, fields: 1, owed: 1, inbox: 1, log: 1, at: 1, updated: 1 };
  function normalize(text) {
    var j = text;
    if (typeof text === "string") {
      var t = text.trim();
      if (!t) return { err: "nothing to read — the box was empty" };
      try { j = JSON.parse(t); } catch (e) { return { err: "that is not JSON (" + String(e.message || e).slice(0, 70) + ")" }; }
    }
    var out = [];
    if (Array.isArray(j)) out = j.slice();
    else if (j && typeof j === "object") {
      if (j.v && j.id) out = [j];
      else if (Array.isArray(j.records)) out = j.records.slice();
      else if (Array.isArray(j.students)) out = j.students.slice();
      else {
        Object.keys(j).forEach(function (k) {
          var v = j[k];
          if (v && typeof v === "object" && (v.id || v.name || v.fields)) { if (!v.id) v.id = k; out.push(v); }
        });
      }
    }
    var good = out.filter(function (r) { return r && typeof r === "object" && (r.name || r.id); });
    if (!good.length) return { err: "no record in that JSON — it needs at least a name" };
    return { records: good };
  }
  async function importText(text) {
    var n = normalize(text);
    if (n.err) return n;
    var added = 0, replaced = 0, names = [];
    for (var i = 0; i < n.records.length; i++) {
      var r = n.records[i];
      r.id = slug(r.id || r.name);
      var prev = await get(r.id);
      var existed = !!prev;
      var rec = existed ? prev : blank(r.id, r.name || r.id);
      /* the arriving file wins, but nothing already in this browser is thrown
         away silently: fields and inbox entries merge, the newer copy leads. */
      rec.name = r.name || rec.name;
      if (r.spelling) rec.spelling = r.spelling;
      if (r.note) rec.note = r.note;
      if (r.tutor) rec.tutor = r.tutor;
      if (r.evidenceSet) rec.evidenceSet = r.evidenceSet;
      var byK = {}; (rec.fields || []).forEach(function (f) { byK[f.k] = f; });
      (r.fields || []).forEach(function (f) {
        if (!f || !f.k) return;
        if (byK[f.k] && String(byK[f.k].value || "").trim() && !String(f.value || "").trim()) return;
        byK[f.k] = { k: f.k, label: f.label || f.k, value: f.value == null ? "" : String(f.value), ev: f.ev || "", state: f.state || "stated" };
      });
      rec.fields = Object.keys(byK).map(function (k) { return byK[k]; });
      if (r.owed) rec.owed = Object.assign({}, rec.owed || {}, r.owed);
      var seen = {};
      (rec.inbox || []).forEach(function (x) { seen[String(x.at) + "|" + String(x.label)] = 1; });
      (r.inbox || []).forEach(function (x) {
        if (!x) return;
        var key = String(x.at) + "|" + String(x.label);
        if (seen[key]) return;
        seen[key] = 1; rec.inbox.push(x);
      });
      if (r.log) rec.log = (rec.log || []).concat(r.log).slice(-300);
      /* EVERYTHING ELSE THE ROLES KEEP. Each role may store its own working
         state on the record (the phonics marks, the application board, the
         presentation beats, the LinkedIn build…). A record that lost those the
         moment it was imported into another role would not be portable, so the
         unknown keys ride along: arrays are unioned, objects merged, and a
         scalar the arriving file states wins (it is the newer copy). */
      Object.keys(r).forEach(function (k) {
        if (KNOWN_KEYS[k]) return;
        var a = rec[k], b = r[k];
        if (a == null) { rec[k] = b; return; }
        if (Array.isArray(a) && Array.isArray(b)) {
          var seen2 = {}; var merged = [];
          a.concat(b).forEach(function (x) {
            var key = JSON.stringify(x);
            if (seen2[key]) return;
            seen2[key] = 1; merged.push(x);
          });
          rec[k] = merged;
          return;
        }
        if (a && b && typeof a === "object" && typeof b === "object") { rec[k] = Object.assign({}, a, b); return; }
        rec[k] = b;
      });
      await save(rec);
      if (existed) replaced++; else added++;
      names.push(rec.name);
    }
    return { added: added, replaced: replaced, names: names };
  }
  function exportText(recs) {
    var arr = Array.isArray(recs) ? recs : [recs];
    return JSON.stringify(arr.length === 1 ? arr[0] : arr, null, 1);
  }

  /* ----------------------------------------------------------------- print -- */
  /* one standalone sheet. Same idiom as the station's print room: an .html with
     its own @page rule — no PDF writer, and it says so. */
  function printSheet(title, body, opts) {
    opts = opts || {};
    return "<!doctype html><html><head><meta charset=\"utf-8\"><title>" + esc(title) + "</title><style>"
      + "@page{size:A4;margin:" + (opts.landscape ? "12mm 12mm" : "16mm 15mm") + "}"
      + "*{box-sizing:border-box}body{margin:0;font:11.5pt/1.5 Georgia,'Times New Roman',serif;color:#15171c;background:#fff;text-align:left}"
      + "header{border-bottom:2px solid #15171c;padding-bottom:8px;margin-bottom:14px}"
      + "h1{margin:0;font-size:21pt;letter-spacing:.4px}"
      + ".hl{margin-top:3px;font-size:11.5pt;color:#333}"
      + ".ct{margin-top:2px;font-size:9.5pt;color:#555}"
      + "section{margin:12px 0}"
      + "h2{margin:0 0 4px;font-size:9.5pt;letter-spacing:1.6px;text-transform:uppercase;color:#7a5a12;border-bottom:1px solid #ddd;padding-bottom:2px}"
      + "p{margin:0 0 6px}ul{margin:0;padding-left:16px}li{margin-bottom:3px}"
      + "table{width:100%;border-collapse:collapse;font-size:10.5pt}"
      + "th{text-align:left;font-size:8.5pt;letter-spacing:1.2px;text-transform:uppercase;color:#666;border-bottom:1px solid #ccc;padding:5px 4px}"
      + "td{border-bottom:1px solid #e5e5e5;padding:5px 4px;vertical-align:top}"
      + ".rule{border-bottom:1px dotted #999;color:#999;font-style:italic;display:inline-block;min-width:45%}"
      + "footer{margin-top:18px;padding-top:8px;border-top:1px solid #ddd;font-size:8.5pt;color:#666}"
      + "footer.warn{color:#8a1f14;border-top:1px solid #c9a0a0}"
      + "@media print{a{color:inherit;text-decoration:none}}"
      + "</style></head><body>" + body + "</body></html>";
  }

  /* --------------------------------------------------------------- render -- */
  function row(label, value, note, cls) {
    return '<div class="ok-row"><b>' + esc(label) + '</b><span class="ok-v">' + (value == null ? "" : value)
      + (note ? '<div class="ok-note ' + (cls || "") + '">' + note + "</div>" : "") + "</span></div>";
  }
  function note(text, cls) { return '<div class="ok-note ' + (cls || "") + '">' + text + "</div>"; }
  function chip(text, color) {
    return '<span class="ok-tag" style="color:' + (color || "var(--muted)") + '">' + esc(text) + "</span>";
  }
  function blankRule(text) { return '<span class="ok-blank">' + esc(text) + "</span>"; }
  function card(head, body, foot) {
    return '<div class="ok-card">' + (head ? "<h2>" + head + "</h2>" : "") + body
      + (foot ? '<div class="ok-foot">' + foot + "</div>" : "") + "</div>";
  }
  /* named `ul`, not `list`: the store owns `list()` — an export key can only be
     used once, and a duplicate here once silently replaced the store with an
     html builder. */
  function ul(items) {
    return items && items.length ? '<ul class="ok-list">' + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" : "";
  }
  function mark(size) {
    size = size || 34;
    return '<svg class="ok-mark" viewBox="0 0 32 32" width="' + size + '" height="' + size + '" fill="none"'
      + ' stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<path d="M16 3.5 28 10v12L16 28.5 4 22V10z"/><path d="M16 3.5v25M4 10l12 6 12-6"/>'
      + '<path d="M16 16 4 22M16 16l12 6"/></svg>';
  }

  /* ----------------------------------------------------------------- shell -- */
  /* The furniture every role shares: the mark, the role's name, and the two
     controls that make the family reusable — WHO (the record picker) and the
     import/export that moves a record between any two roles and the station. */
  function shell(opts) {
    ensureCSS();
    opts = opts || {};
    var wrap = document.getElementById("okRoot");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "okRoot";
      document.body.appendChild(wrap);
    }
    wrap.className = "ok-wrap";
    wrap.innerHTML =
      '<div class="ok-head">' + mark()
        + '<div class="ok-title">' + esc(opts.name || "A role") + "<small>" + esc(opts.what || "PrAis · NET · one function, reusable") + "</small></div>"
        + '<div class="ok-spacer"></div>'
        + '<div class="ok-bar">'
        +   '<select class="ok-select" id="okWho" title="whose record this is"></select>'
        +   '<button class="ok-btn ghost" id="okNewBtn" title="open a new record">+ student</button>'
        +   '<button class="ok-btn ghost" id="okImpBtn" title="read a record exported by the station or by any role">import</button>'
        +   '<button class="ok-btn ghost" id="okExpBtn" title="write this record to a file">export</button>'
        + '</div>'
        + '<input type="file" id="okFile" accept=".json,application/json,text/plain" style="display:none">'
      + "</div>"
      + '<div id="okPanel"></div>'
      + '<div id="okIO" hidden></div>';

    var who = document.getElementById("okWho");
    var panel = document.getElementById("okPanel");
    var io = document.getElementById("okIO");
    var state = { rec: null, id: null };

    function showIO(html) { io.hidden = false; io.innerHTML = html; }
    function hideIO() { io.hidden = true; io.innerHTML = ""; }

    async function fillPicker(selectId) {
      var rs = await list();
      var html = rs.map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.name) + (r.spelling ? " \u00b7 " + esc(r.spelling) : "") + "</option>";
      }).join("");
      if (!rs.length) html = '<option value="">\u2014 no record in this browser \u2014</option>';
      html += '<option value="__new">+ a new student\u2026</option>';
      who.innerHTML = html;
      var want = selectId || state.id || (rs[0] ? rs[0].id : "");
      who.value = (want && rs.some(function (r) { return r.id === want; })) ? want : (rs[0] ? rs[0].id : "");
      return rs;
    }

    async function load(id, o2) {
      o2 = o2 || {};
      state.id = id;
      state.rec = id ? await get(id) : null;
      if (state.rec) await setLast(id);
      /* the picker must SHOW the record the panel is about: a control that
         names one student while the page describes another is exactly the kind
         of quiet wrongness this family cannot have. */
      try { who.value = state.rec ? id : ""; } catch (e) {}
      if (opts.onLoad) opts.onLoad(state.rec, state);
      if (!o2.quiet) render();
      return state.rec;
    }

    function render() {
      var r = state.rec;
      if (!r) {
        panel.innerHTML = card("no record yet",
          '<div class="ok-empty">This tool reads and writes <b>one record per student</b>, kept in <b>this browser</b>'
          + (durable() ? " (kv \u2014 durable, private, per origin)" : " (localStorage \u2014 the perchance kv-plugin is not loaded here)")
          + ". Open one, or read a record the station exported.<br><br>"
          + '<button class="ok-btn gold" id="okFirstNew">+ open the first record</button> '
          + '<button class="ok-btn" id="okFirstImp">import a record (JSON)</button>'
          + '<div class="ok-note" style="margin-top:8px">In the station: <span class="ok-mono">/intake export all</span> writes a file any of these roles can read.</div></div>',
          "Nothing about a student ships in this source. A record is made by a human, lives in this browser, and leaves only when a human exports it.");
        wirePanel();
        return;
      }
      var body = opts.panel ? opts.panel(r, helpers) : "";
      var head = opts.head ? opts.head(r) : "";
      panel.innerHTML = (head || "") + body;
      wirePanel();
      if (opts.after) opts.after(r, panel, helpers);
    }

    /* the helpers a role's panel() is handed */
    var helpers = {
      rec: function () { return state.rec; },
      id: function () { return state.id; },
      save: async function () { var ok = await save(state.rec); render(); return ok; },
      set: async function (k, label, value, ev) { setField(state.rec, k, label, value, ev); return await save(state.rec); },
      render: render,
      fill: function () { return fillPicker(state.id); },
      load: load,
      io: showIO, ioHide: hideIO, toast: toast,
      on: function (act, fn) { acts[act] = fn; }
    };
    var acts = {};

    function wirePanel() {
      var nb = document.getElementById("okFirstNew");
      if (nb) nb.onclick = function () { onNew(); };
      var ib = document.getElementById("okFirstImp");
      if (ib) ib.onclick = function () { onImport(); };
      Array.prototype.forEach.call(panel.querySelectorAll("[data-ok-act]"), function (el) {
        el.onclick = function () {
          var fn = acts[el.getAttribute("data-ok-act")] || (opts.actions && opts.actions[el.getAttribute("data-ok-act")]);
          if (fn) fn(el, state.rec, helpers);
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-ok-copy],[data-copy]"), function (el) {
        el.onclick = function () {
          copy(el.getAttribute("data-ok-copy") || el.getAttribute("data-copy"),
               el.getAttribute("data-ok-copy-label") || el.getAttribute("data-copy-label") || "copied");
        };
      });
    }

    function onNew() {
      showIO('<div class="ok-card"><h2>a new record</h2>'
        + '<div class="ok-row"><b>name</b><span class="ok-v"><input class="ok-input" id="okNewName" placeholder="the student\'s name, as they spell it"></span></div>'
        + '<div class="ok-row"><b>spelled out</b><span class="ok-v"><input class="ok-input" id="okNewSpell" placeholder="Q-U-A-N (optional \u2014 how it was spelled out loud)"></span></div>'
        + '<div style="margin-top:8px" class="ok-bar"><button class="ok-btn gold" id="okNewGo">open it</button>'
        + '<button class="ok-btn ghost" id="okNewCancel">cancel</button></div>'
        + '<div class="ok-note">The record starts EMPTY and every row on it is marked not-supplied. This tool will not invent one.</div></div>');
      document.getElementById("okNewCancel").onclick = hideIO;
      document.getElementById("okNewGo").onclick = async function () {
        var name = (document.getElementById("okNewName").value || "").trim();
        if (!name) { toast("a record needs a name"); return; }
        var id = slug(name);
        if (await get(id)) { toast("a record for " + name + " is already on file"); await fillPicker(id); await load(id); hideIO(); return; }
        var rec = blank(id, name, { spelling: (document.getElementById("okNewSpell").value || "").trim() });
        logLine(rec, "record opened");
        await save(rec);
        hideIO();
        await fillPicker(id);
        await load(id);
        toast("opened " + name);
      };
    }

    function onImport() {
      showIO('<div class="ok-card"><h2>read a record</h2>'
        + '<div class="ok-note">Paste the JSON from <span class="ok-mono">/intake export all</span> (or from any role\'s export), or choose the file. '
        + 'A record already on file is <b>merged</b>, never overwritten silently.</div>'
        + '<div style="height:8px"></div>'
        + '<textarea class="ok-textarea" id="okImpText" placeholder="a single record object, or an array of them"></textarea>'
        + '<div style="margin-top:8px" class="ok-bar"><button class="ok-btn gold" id="okImpGo">read it</button>'
        + '<button class="ok-btn" id="okImpFile">choose a file\u2026</button>'
        + '<button class="ok-btn ghost" id="okImpCancel">cancel</button></div>'
        + '<div id="okImpOut"></div></div>');
      document.getElementById("okImpCancel").onclick = hideIO;
      document.getElementById("okImpFile").onclick = function () { document.getElementById("okFile").click(); };
      document.getElementById("okImpGo").onclick = async function () {
        var res = await importText(document.getElementById("okImpText").value || "");
        var out = document.getElementById("okImpOut");
        if (res.err) { out.innerHTML = note("nothing was read: " + esc(res.err), "bad"); return; }
        out.innerHTML = note("read " + res.added + " new \u00b7 " + res.replaced + " merged \u2014 " + esc(res.names.join(", ")), "");
        await fillPicker(state.id || (res.names[0] ? slug(res.names[0]) : null));
        await load(who.value);
        hideIO(); toast("imported " + res.names.length + " record(s)");
      };
    }

    document.getElementById("okFile").onchange = async function (ev) {
      var f = ev.target.files && ev.target.files[0];
      if (!f) return;
      var txt = await f.text();
      var res = await importText(txt);
      if (res.err) { toast("nothing was read: " + res.err); return; }
      await fillPicker(state.id || (res.names[0] ? slug(res.names[0]) : null));
      await load(who.value);
      hideIO(); toast("read " + res.names.length + " record(s) from " + f.name);
      ev.target.value = "";
    };

    document.getElementById("okNewBtn").onclick = onNew;
    document.getElementById("okImpBtn").onclick = onImport;
    document.getElementById("okExpBtn").onclick = async function () {
      if (!state.rec) { toast("no record to export"); return; }
      download(slug(state.rec.name) + "-record.json", exportText(state.rec), "application/json");
      toast("exported " + state.rec.name + "'s record");
    };
    who.onchange = async function () {
      if (who.value === "__new") { onNew(); return; }
      hideIO();
      await load(who.value);
    };

    /* boot: `?student=quan` (the family's deep link) wins, then the last one
       used in this browser, then the only one there is. */
    (async function boot() {
      var q = null;
      /* the deep link: `?student=<name>`, `#<name>`, or a host that has already
         decided (the family desk inside the station sets ObiKitStudent, because
         a srcdoc frame has no search string to read). */
      try { q = window.ObiKitStudent || null; } catch (e) {}
      if (!q) { try { q = new URLSearchParams(location.search).get("student"); } catch (e) {} }
      if (!q) { try { q = (location.hash || "").replace(/^#/, ""); } catch (e) {} }
      var rs = await fillPicker(q ? slug(q) : null);
      var want = q ? slug(q) : null;
      if (want && !rs.some(function (r) { return r.id === want; })) {
        if (!rs.length) toast("no record for \u201c" + want + "\u201d in this browser \u2014 open one or import");
        want = rs.length ? rs[0].id : null;
      }
      if (!want) want = (await lastId()) || (rs[0] ? rs[0].id : null);
      await load(want);
    })();

    return { state: state, helpers: helpers, refresh: fillPicker, panel: panel };
  }

  window.ObiKit = {
    V: V,
    /* theme + basics */
    ensureCSS: ensureCSS, esc: esc, lines: lines, slug: slug, day: day, strip: strip,
    toast: toast, download: download, copy: copy, printSheet: printSheet,
    /* store */
    get: get, save: save, forget: forget, ids: ids, list: list, durable: durable,
    /* record */
    blank: blank, field: field, raw: raw, val: val, setField: setField, inbox: inbox,
    inboxOf: inboxOf, logLine: logLine, soul: soul,
    /* import/export */
    importText: importText, normalize: normalize, exportText: exportText,
    /* html */
    row: row, note: note, chip: chip, blankRule: blankRule, card: card, ul: ul, mark: mark,
    /* page */
    shell: shell
  };
})();
