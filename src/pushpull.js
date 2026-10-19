/* /push + /pull — the shelf ferry without files.
   One tap per station, no downloads, no attachments, no file manager.
   - /push    packs this browser's whole shelf (every obi_* key EXCEPT obi_keys
              and device-local keys) and carries it out over the free wire,
              then prints a short URL + the merge block. Secrets never travel.
   - /pull <push-url>
              collects a pushed shelf with SAFE rules: soul unions (nothing
              lost), sealed SCS never unsealed (open→sealed upgrades allowed),
              RRL runs added never overwritten, boardroom sittings unioned,
              I-LOG adopted ONLY onto a fresh chain (local kv head <= 15 and
              the file's internal links verify) — otherwise the file's digest
              is recorded and the local chain stands. All other keys: the file
              wins ONLY where this browser holds nothing.
   Lesson baked in (A56, 2026-10-19): the kv ilog folder is AUTHORITATIVE and
   the localStorage mirror is just a tail — a restore that writes only the
   mirror gets forked on the next append. So ILOG adoption replays entries
   into kv through ObiILog.restore (hash-verified), direct-sets only the ones
   a bundle scrub redacted, then re-anchors head + mirror. */
(function(){
"use strict";

/* device-local or secret keys: never travel, never overwritten. */
var SKIP = { obi_keys:1, obi_savewatch:1, obi_savewatch_state:1, obi_bg_lastaway:1,
  obi_settab:1, obi_cgn_state:1, obi_voice:1, obi_view:1, obi_heartbeat:1, obi_bg_audio:1 };
var FRESH_ILOG_MAX = 15;      /* local kv head at or under this = a fresh chain, adoptable */
var PUSH_TTL = 1000 * 60 * 60 * 48;   /* push URLs live 48 h — a transfer window, not an archive */

function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k, v){ try{ localStorage.setItem(k, String(v)); return localStorage.getItem(k) === String(v); }catch(e){ return false; } }
function J(s){ try{ return JSON.parse(s); }catch(e){ return null; } }
function station(){ try{ return window.generatorName || "?"; }catch(e){ return "?"; } }
function row(l, v, n){ return '<div class="rrow"><b>' + esc(l) + '</b><span class="vd">' + (v == null ? "" : v) + '</span><div class="rd">' + (n || "") + "</div></div>"; }

async function kvCounts(){
  var out = {};
  var folders = ["transcripts","summaries","students","classes","reviews","writeups","clients",
    "intake","lessons","lessonforge","masterlink","ilog","brain","market","relay","scout",
    "freewire","scholar","curriculum","fpm","omega","sites","offers","mastermind"];
  for(var i = 0; i < folders.length; i++){
    try{
      var fld = (typeof root !== "undefined" && root && root.kv) ? root.kv[folders[i]] : null;
      if(!fld) continue;
      var ks = await fld.keys();
      out[folders[i]] = (ks || []).length;
    }catch(e){}
  }
  return out;
}

function shelfSummary(){
  var sdnad = J(lsGet("obi_sdnad") || "null"), ilog = J(lsGet("obi_ilog") || "null"),
      scs = J(lsGet("obi_scs") || "null"), board = J(lsGet("obi_boardroom") || "null");
  return {
    soul: sdnad && sdnad.soul ? sdnad.soul.length : 0,
    runs: sdnad && sdnad.runs ? sdnad.runs.length : 0,
    ilog: ilog && typeof ilog.count === "number" ? ilog.count : 0,
    ilogHead: ilog && ilog.head ? String(ilog.head).slice(0, 12) : null,
    scs: scs && scs.sessions ? scs.sessions.length : 0,
    sealed: scs && scs.sessions ? scs.sessions.filter(function(s){ return s && s.sealed; }).length : 0,
    sittings: board && board.sittings ? board.sittings.length : 0
  };
}

function mergeBlock(s, extra){
  return '<div class="rise"><div class="rhead">📦 shelf ferry · ' + esc(station()) + '</div>'
    + row("SOUL", s.soul + " fragments · " + s.runs + " runs", "unioned — nothing lost")
    + row("I-LOG", s.ilog + (s.ilogHead ? " · " + esc(s.ilogHead) : ""), extra || "")
    + row("SCS", s.scs + " sessions (" + s.sealed + " sealed)", "sealed stays sealed")
    + row("SITTINGS", s.sittings, "boardroom")
    + "</div>";
}

/* ------------------------------- /push ------------------------------- */
async function push(){
  var prog = addBubble("ass", "📤 Packing this browser's shelf — secrets stay home…");
  try{
    var all = (typeof backupDataKeys === "function") ? backupDataKeys() : {};
    var travel = {}, n = 0;
    for(var k of Object.keys(all)){
      if(k.indexOf("obi_") !== 0 || SKIP[k]) continue;
      travel[k] = String(all[k]); n++;
    }
    if(!n){ prog.innerHTML = "⚠ This browser holds no data keys — nothing to push."; return; }
    var sum = shelfSummary();
    var pack = { at:new Date().toISOString(), kind:"pais-data-backup",
      from:"push:" + station(), summary:sum, kvCounts: await kvCounts(), keys:travel };
    var bytes = JSON.stringify(pack);
    if(bytes.length > 25 * 1048576){ prog.innerHTML = "⚠ Shelf is " + (bytes.length/1048576).toFixed(1) + " MB — over the 25 MB push limit. Download backup instead."; return; }
    prog.innerHTML = "📤 Carrying " + n + " keys (" + (bytes.length/1024).toFixed(0) + " KB) out over the free wire…";
    var url = null, lane = null, tries = [];
    /* lane 1 — the estate plugin with a 48 h expiry (a transfer window, not an archive). */
    try{
      if(typeof root !== "undefined" && root && root.uploadPlugin){
        var r = await root.uploadPlugin(bytes, { expires: Date.now() + PUSH_TTL });
        if(r && r.url){ url = r.url; lane = "uploads (48 h)"; }
        else tries.push("uploads: " + ((r && r.error) || "no url"));
      } else tries.push("uploads: plugin not loaded in this origin");
    }catch(e){ tries.push("uploads threw: " + String((e && e.message) || e).slice(0, 100)); }
    /* lane 2 — the measured free-wire carriers (permanent / 30 d / 3 h). */
    if(!url && window.ObiFreeWire && window.ObiFreeWire.put){
      var p = await window.ObiFreeWire.put(bytes, "obi-push-" + station() + ".json", "application/json");
      if(p && p.ok){ url = p.url; lane = p.lane + " (" + (p.keeps || "carrier terms") + ")"; }
      else tries.push("free-wire: " + ((p && p.why) || "refused"));
    }
    if(!url){
      prog.innerHTML = '<div class="rise"><div class="rhead">⚠ /push — every carrier refused</div>'
        + row("tries", esc(tries.join(" · "))) + '<div class="rfoot">Settings → Download backup still works — carry the file by hand.</div></div>';
      return;
    }
    prog.innerHTML = '<div class="rise"><div class="rhead">📤 pushed — carry this URL, not a file</div>'
      + row("URL", '<span style="word-break:break-all">' + esc(url) + "</span>", "via " + esc(lane))
      + row("HOW", "open HQ, type <b>/pull " + esc(url) + "</b>", "paste the URL — nothing to download")
      + row("SHELF", sum.soul + " soul · I-LOG " + sum.ilog + " · SCS " + sum.scs + " (" + sum.sealed + " sealed) · " + n + " keys", "secrets never travel")
      + '<div class="rfoot">On HQ the merge block prints after /pull. This URL reads for ' + (lane.indexOf("48 h") === 0 ? "48 hours" : esc(lane)) + ".</div></div>";
    try{ reconLog({ what:"push", keys:n + " keys", from:station(), note:"soul " + sum.soul + " · ilog " + sum.ilog + " · lane " + lane }); }catch(e){}
    try{ logOp({ kind:"op", action:"push", result:n + " keys → " + url.slice(0, 60) }); }catch(e){}
  }catch(e){
    prog.innerHTML = "⚠ /push failed: " + esc(String((e && e.message) || e));
  }
}

/* ------------------------------- /pull ------------------------------- */
function unionSoul(L, F){
  L.soul = L.soul || []; F.soul = F.soul || [];
  var seen = {}, added = 0;
  for(var i = 0; i < L.soul.length; i++) seen[L.soul[i].t + "|" + (L.soul[i].text || "")] = 1;
  for(var j = 0; j < F.soul.length; j++){
    var e = F.soul[j], id = e.t + "|" + (e.text || "");
    if(!seen[id]){ L.soul.push({ t:e.t, role:e.role || "sovereign", run:e.run, text:e.text, footnote:e.footnote == null ? null : e.footnote }); seen[id] = 1; added++; }
  }
  L.soul.sort(function(a, b){ return a.t - b.t; });
  L.runs = L.runs || [];
  var byRun = {};
  for(var a = 0; a < L.runs.length; a++) byRun[L.runs[a].run] = L.runs[a];
  for(var b = 0; b < (F.runs || []).length; b++){
    var r = F.runs[b], cur = byRun[r.run];
    if(!cur){ L.runs.push(r); byRun[r.run] = r; continue; }
    cur.soulCount = Math.max(cur.soulCount || 0, r.soulCount || 0);
    cur.closed = !!(cur.closed || r.closed);
    ["decisions","principles"].forEach(function(f){
      var have = {}, u = [];
      ((cur[f] || []).concat(r[f] || [])).forEach(function(x){ var k = JSON.stringify(x); if(!have[k]){ have[k] = 1; u.push(x); } });
      cur[f] = u;
    });
  }
  L.runs.sort(function(a, b){ return a.run - b.run; });
  return added;
}

function unionSCS(L, F){
  L.sessions = L.sessions || [];
  var byName = {}, added = 0, upgraded = 0, kept = 0;
  for(var i = 0; i < L.sessions.length; i++) if(L.sessions[i] && L.sessions[i].name) byName[L.sessions[i].name] = L.sessions[i];
  for(var j = 0; j < ((F && F.sessions) || []).length; j++){
    var s = F.sessions[j];
    if(!s || !s.name) continue;
    var cur = byName[s.name];
    if(!cur){ L.sessions.push(s); byName[s.name] = s; added++; }
    else if(cur.sealed) kept++;                       /* sealed stays sealed — never replaced */
    else if(s.sealed){ L.sessions[L.sessions.indexOf(cur)] = s; byName[s.name] = s; upgraded++; }
    else kept++;                                      /* both open — local stands */
  }
  if(typeof F.seq === "number" && (typeof L.seq !== "number" || F.seq > L.seq)) L.seq = F.seq;
  return { added:added, upgraded:upgraded, kept:kept };
}

function unionBoardroom(L, F){
  L.sittings = L.sittings || [];
  var seen = {}, added = 0;
  for(var i = 0; i < L.sittings.length; i++) seen[L.sittings[i].at + "|" + (L.sittings[i].topic || "")] = 1;
  for(var j = 0; j < ((F && F.sittings) || []).length; j++){
    var s = F.sittings[j], id = s.at + "|" + (s.topic || "");
    if(!seen[id]){ L.sittings.push(s); seen[id] = 1; added++; }
  }
  L.seatmem = L.seatmem || {};
  var memAdded = 0;
  for(var k of Object.keys((F && F.seatmem) || {})) if(!(k in L.seatmem)){ L.seatmem[k] = F.seatmem[k]; memAdded++; }
  ["names","fired","held","sovereign"].forEach(function(f){
    if(L[f] == null && F && F[f] != null) L[f] = F[f];
  });
  return { sittings:added, seatmem:memAdded };
}

function linksHold(entries){
  /* internal links must hold; only the FIRST entry may dangle (a prefix gap). */
  var bySeq = {};
  for(var i = 0; i < entries.length; i++) bySeq[entries[i].seq] = entries[i].hash;
  for(var j = 1; j < entries.length; j++){
    if(entries[j].prev !== bySeq[entries[j-1].seq] || entries[j].seq !== entries[j-1].seq + 1) return false;
  }
  return true;
}

async function adoptIlogChain(entries, count, head, note){
  /* fresh-chain adoption: wipe kv, replay hash-verified, direct-set scrubbed ones,
     re-anchor head + mirror, append the adoption record. Returns a report. */
  var F = (typeof root !== "undefined" && root && root.kv) ? root.kv.ilog : null;
  var rep = { adopted:false };
  if(!F || !window.ObiILog){
    if(!window.ObiILog) return { adopted:false, why:"ObiILog not loaded" };
    /* kv unreachable — mirror-only adoption (append cursor continues from the file). */
    try{ localStorage.setItem("obi_ilog", JSON.stringify({ seg:1, count:count, head:head, entries:entries.slice(-400) })); }catch(e){ return { adopted:false, why:"mirror unwritable" }; }
    return { adopted:true, mirrorOnly:true, count:count };
  }
  var before = await F.keys();
  for(var d = 0; d < before.length; d++){ try{ await F.delete(before[d]); }catch(e){} }
  var ok = 0, direct = 0;
  var ordered = entries.slice().sort(function(a, b){ return a.seq - b.seq; });
  for(var i = 0; i < ordered.length; i++){
    var r = await window.ObiILog.restore(ordered[i], ordered[i].hash);
    if(r.ok) ok++;
    else { try{ await F.set(window.ObiILog.keyOf(ordered[i].seg || 1, ordered[i].seq), ordered[i]); direct++; }catch(e){} }
  }
  var last = ordered[ordered.length - 1];
  await F.set("head", { seg:1, count:count, hash:last.hash, prevHash:last.prev, headSeq:count,
    t:last.t, iso:last.iso, alg:last.alg || "sha-256", sealedCount:0, sealT:null });
  try{ localStorage.setItem("obi_ilog", JSON.stringify({ seg:1, count:count, head:last.hash, entries:ordered.slice(-400) })); }catch(e){}
  var adop = await window.ObiILog.append({ kind:"op", action:"pull adoption", detail:String(note || "chain adopted by /pull") });
  return { adopted:true, verified:ok, direct:direct, of:ordered.length, seq:adop.seq };
}

async function pull(rawUrl){
  var url = String(rawUrl || "").trim().replace(/^<|>$/g, "").replace(/^["']|["']$/g, "");
  if(!/^https?:\/\//i.test(url)){ addBubble("ass", "Usage: <b>/pull &lt;push-url&gt;</b> — paste the URL a station's <b>/push</b> printed."); return; }
  var prog = addBubble("ass", "📥 Reading the pushed shelf…");
  try{
    var txt = await root.superFetch(url).then(function(r){ return r.text(); });
    var pack = J(txt);
    if(!pack || typeof pack !== "object" || !pack.keys || typeof pack.keys !== "object"){ prog.innerHTML = "⚠ That URL is not a shelf pack (no keys in it)."; return; }
    if(pack.keys.obi_keys){ prog.innerHTML = "⚠ Refused: the pack carries <b>obi_keys</b> — secrets must never travel."; return; }
    var names = Object.keys(pack.keys).filter(function(k){ return k.indexOf("obi_") === 0 && k !== "obi_keys"; });
    if(!names.length){ prog.innerHTML = "⚠ The pack holds no data keys — nothing to collect."; return; }
    var rep = { soul:0, scs:null, rrl:0, sittings:0, ilog:null, filled:0, kept:[] };
    var bits = [];
    /* soul — union. */
    if(pack.keys.obi_sdnad){
      var L = J(lsGet("obi_sdnad") || "null") || { runs:[], soul:[] };
      var F = J(pack.keys.obi_sdnad) || { runs:[], soul:[] };
      rep.soul = unionSoul(L, F);
      try{
        if(typeof ledger !== "undefined" && ledger){ ledger.soul = L.soul; ledger.runs = L.runs; }
        if(typeof saveLedger === "function") saveLedger(L); else lsSet("obi_sdnad", JSON.stringify(L));
        if(typeof updateStats === "function") updateStats();
      }catch(e){ lsSet("obi_sdnad", JSON.stringify(L)); }
      bits.push("soul +" + rep.soul + " → " + L.soul.length);
    }
    /* SCS — sealed never replaced. */
    if(pack.keys.obi_scs){
      var SL = J(lsGet("obi_scs") || "null") || { v:1, seq:0, sessions:[] };
      var SF = J(pack.keys.obi_scs) || { sessions:[] };
      rep.scs = unionSCS(SL, SF);
      lsSet("obi_scs", JSON.stringify(SL));
      bits.push("SCS +" + rep.scs.added + " · sealed-upgraded " + rep.scs.upgraded + " · kept " + rep.scs.kept);
    }
    /* RRL — add missing runs only. */
    for(var ri = 0; ri < names.length; ri++){
      var rk = names[ri];
      if(rk.indexOf("obi_rrl_") === 0 && lsGet(rk) == null){ if(lsSet(rk, pack.keys[rk])) rep.rrl++; }
    }
    if(rep.rrl) bits.push("RRL +" + rep.rrl + " runs");
    /* boardroom — union. */
    if(pack.keys.obi_boardroom){
      var BL = J(lsGet("obi_boardroom") || "null") || {};
      var BF = J(pack.keys.obi_boardroom) || {};
      var br = unionBoardroom(BL, BF);
      lsSet("obi_boardroom", JSON.stringify(BL));
      rep.sittings = br.sittings;
      bits.push("boardroom +" + br.sittings + " sittings");
    }
    /* I-LOG — adopt only onto a fresh chain. */
    if(pack.keys.obi_ilog){
      var FM = J(pack.keys.obi_ilog) || {};
      var localHead = 0;
      try{ var h = await root.kv.ilog.get("head"); if(h && typeof h.count === "number") localHead = h.count; }
      catch(e){ var lm = J(lsGet("obi_ilog") || "null"); localHead = (lm && lm.count) || 0; }
      if(localHead <= FRESH_ILOG_MAX && (FM.entries || []).length && linksHold(FM.entries)){
        var ad = await adoptIlogChain(FM.entries, FM.count, FM.head, "pulled " + (pack.from || url).slice(0, 80));
        rep.ilog = ad.adopted ? "adopted " + FM.count + " (" + ad.verified + " verified, " + ad.direct + " scrubbed)" : ("refused: " + ad.why);
      } else {
        rep.ilog = "kept local " + localHead + " · file " + (FM.count || "?") + "/" + String(FM.head || "").slice(0, 12) + " recorded";
      }
      bits.push("I-LOG " + rep.ilog);
    }
    /* everything else — the file wins ONLY where this browser holds nothing. */
    var filled = 0, skipped = [];
    var handled = { obi_sdnad:1, obi_scs:1, obi_boardroom:1, obi_ilog:1 };
    for(var fi = 0; fi < names.length; fi++){
      var fk = names[fi];
      if(handled[fk] || fk.indexOf("obi_rrl_") === 0 || SKIP[fk]) continue;
      if(lsGet(fk) == null){ if(lsSet(fk, pack.keys[fk])) filled++; }
      else skipped.push(fk);
    }
    rep.filled = filled;
    if(filled) bits.push("filled +" + filled + " empty slots");
    if(skipped.length) bits.push("kept local: " + skipped.join(", "));
    prog.innerHTML = '<div class="rise"><div class="rhead">📥 pulled — ' + esc(pack.from || "a pushed shelf") + '</div>'
      + bits.map(function(b){ return row("·", esc(b)); }).join("")
      + '<div class="rfoot">Sealed stays sealed · the ledger is never overwritten on an established chain · ' + esc(pack.at || "") + "</div></div>";
    try{ reconLog({ what:"pull", keys:bits.join(" | ").slice(0, 300), from:String(pack.from || url).slice(0, 120), note:"soul +" + rep.soul + " · " + (rep.ilog || "") }); }catch(e){}
    try{ logOp({ kind:"op", action:"pull", result:bits.join("; ").slice(0, 200) }); }catch(e){}
    try{ if(typeof renderSettings === "function") renderSettings(); }catch(e){}
    try{ if(typeof updateStats === "function") updateStats(); }catch(e){}
  }catch(e){
    prog.innerHTML = "⚠ /pull failed: " + esc(String((e && e.message) || e).slice(0, 200));
  }
}

window.ObiPushPull = { push:push, pull:pull, SKIP:SKIP };
})();
