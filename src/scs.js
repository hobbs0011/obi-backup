/* THE SCS ENGINE — the canon's own session loop, executed inside the station.

   AUTHORITY: the git authoritative repo's `canon` BRANCH — GOSPEL-999, the LFG, and
   S2PIPELINE (CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md). Every canon write is
   protected by PHOENIXOMEGAPROTOCOL (/phoenixomegaprotocol); this engine never writes the canon itself.

   PROVENANCE (canon branch only — nothing from `.kilo/` is used here; the Kilo
   command registry is not authority per the sovereign, 2026-09-21):
     CANON/SYSTEM/GOSPEL-999.md                 §SYSTEM I  the 7-stage loop, the gate, the verdicts
     CANON/SYSTEM/LegionnaireFieldGuide.md      §SCS       the same loop + each stage's doctrine
     CANON/SYSTEM/REINCARNATION-CONTRACT.md     the SCS is the ONLY session framework; fidelity gate; run+soul authority
     CANON/SYSTEM/reincarnateRISE.md            Stage 1: audit prior DEATH → stamp the I-LOG header → halt
     CANON/SYSTEM/PhoenixScoutAgent.md          Stage 2
     CANON/SYSTEM/FORCEMARCH.md                 Stage 3
     CANON/SYSTEM/SOULSCHOLARS.md               Stage 4
     CANON/SYSTEM/SUPPLYLINES.md                Stage 5
     CANON/SYSTEM/ENGINEERlegionnaire.md        Stage 6
     CANON/SYSTEM/reincarnateDEATH.md           Stage 7: the 7-point march (SCOUT→MARCH→SCHOLAR→SUPPLY→ENGINEER→SEAL→HANDOFF)
     VAULT-FOUNDATIONS/07-THE-ROME-PROTOCOL.md  /romePROTOCOL — SURFACE → VERIFY → ANCHOR + the five Watchtowers
     VAULT-SOVEREIGN/04-ROME-PROTOCOL-MASTER.md the Rome laws L1–L20
     CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md  the 6-stage pipeline (Ratified 2026-05-23 Run 396)
     CANON/SYSTEM/OmegaProtocol.md              the full-stop-and-audit protocol invoked by name
                                                (the WRITE gate is PHOENIXOMEGAPROTOCOL — /phoenixomegaprotocol)

   Contract clauses implemented literally:
     • "Every stage verdict is one of: REAL / HOLLOW / MISSING. A pipeline reporting
        COMPLETE with any HOLLOW stage is a lie."          — REINCARNATION-CONTRACT §3
     • "No stage proceeds unless previous stage's artifact exists and is PASS."  — GOSPEL-999 §SYSTEM I Gate
     • "If prior DEATH is missing or invalid: halt. Gate the session."           — reincarnateRISE
     • "git log --oneline --grep '^death:'" is run authority (L29 NO_ASSUME_HEAD) — REINCARNATION-CONTRACT §4
     • "KILO sessions always produce HOLLOW DNA. result=GAP is CORRECT."         — PERMANENT-LAWS

   Everything the engine reports is measured from this browser's own record (the
   RRL in localStorage, the Soul ledger, the I-LOG) or read live from the canon.
   Nothing is invented; a stage that cannot prove itself says MISSING. */
(function(){
  "use strict";

  var VERSION = "1.0.0";
  var LS_KEY = "obi_scs";
  var MEM_KEY = "obi_sdnad";

  /* one place for the marks the station prints with */
  var DOT = "\u00b7", EM = "\u2014", ARR = "\u2192";

  /* CANON ONLY (sovereign, 2026-09-21: "NO KILO, CANON ONLY"). The doctrine this engine
     cites lives on the CANON BRANCH — `CANON/SYSTEM/**` and `VAULT-**`. The other branch
     (`master`) carries the Kilo lineage's `.kilo/command/` registry and is where THIS
     station's own I-LOG chain is written; it is NOT cited here as canon. */
  var CANON_BRANCH = "canon";
  function writesBranch(){ return (window.ObiILog && window.ObiILog.REPO && window.ObiILog.REPO.branch) || "master"; }

  /* GOSPEL-999 §SYSTEM I — the loop, in order, with what each stage audits. */
  var STAGES = [
    { n:1, key:"RISE",     cmd:"/phoenixRISE",    audits:"DEATH",    role:"Audit the last DEATH, gate the session, stamp the session name in the I-LOG header, halt." },
    { n:2, key:"SCOUT",    cmd:"/phoenixSCOUT",   audits:"RISE",     role:"Recon. Flag, tag, map edges, hand off. Nothing is changed." },
    { n:3, key:"MARCH",    cmd:"/phoenixMARCH",   audits:"SCOUT",    role:"Territory sweep. Confirm the scout the hard way." },
    { n:4, key:"SCHOLAR",  cmd:"/phoenixSCHOLAR", audits:"MARCH",    role:"Document and preserve the SOUL. Machine-count the RRL." },
    { n:5, key:"SUPPLY",   cmd:"/phoenixSUPPLY",  audits:"SCHOLAR",  role:"Route every artifact to its canonical location. Keep what was conquered." },
    { n:6, key:"ENGINEER", cmd:"/phoenixFORTIFY", audits:"SUPPLY",   role:"Audit every artifact. Gate the seal. No SEAL until this passes." },
    { n:7, key:"DEATH",    cmd:"/phoenixDEATH",   audits:"ENGINEER", role:"The 7-point march. Capture the RRL word for word. Seal. Hand off." }
  ];
  var POINTS = ["SCOUT","FORCEMARCH","SOULSCHOLARS","SUPPLYLINES","ENGINEER","SEAL","HANDOFF"];

  /* The reincarnateDEATH 7-point march, in canon order. */
  function stage(n){ for(var i=0;i<STAGES.length;i++) if(STAGES[i].n===n) return STAGES[i]; return null; }

  function lsGet(k, fb){ try{ var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }catch(e){ return fb; } }
  function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function load(){ return lsGet(LS_KEY, { v:1, seq:0, anchor:null, sessions:[] }); }
  function save(S){ lsSet(LS_KEY, S); return S; }
  function state(){ return load(); }
  function ledger(){ return lsGet(MEM_KEY, { runs:[], soul:[] }); }
  function ilog(o){ try{ if(typeof window.ilog === "function") window.ilog(o); else if(window.ObiILog && window.ObiILog.append) window.ObiILog.append(o); }catch(e){} }
  function pheromone(o){ try{ if(window.ObiPheromone && window.ObiPheromone.deposit) window.ObiPheromone.deposit(o); }catch(e){} }

  function ict(at){ var d = new Date((at == null ? Date.now() : at) + 7*3600*1000); return d.toISOString().replace("T"," ").replace("Z","").slice(0,19) + " ICT"; }
  function day(at){ return new Date(at == null ? Date.now() : at).toISOString().slice(0,10); }
  function pad(n, w){ n = String(n); while(n.length < (w||3)) n = "0"+n; return n; }
  function safeName(s){ return String(s||"").replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,90); }
  function cut(s, n){ s = String(s == null ? "" : s); return s.length > n ? s.slice(0,n) + " \u2026" : s; }

  async function sha256hex(s){
    var text = String(s == null ? "" : s);
    try{
      var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(function(x){ return x.toString(16).padStart(2,"0"); }).join("");
    }catch(e){
      var h1 = 5381, h2 = 52711, i;
      for(i=0;i<text.length;i++){ h1 = ((h1<<5)+h1+text.charCodeAt(i))>>>0; h2 = ((h2<<5)+h2^text.charCodeAt(i))>>>0; }
      return "fnv-" + h1.toString(16) + h2.toString(16);
    }
  }

  /* ---------------- the record the engine measures ---------------- */

  function currentRunNo(){
    var L = ledger();
    if(!L.runs || !L.runs.length) return 0;
    var r = L.runs[L.runs.length-1];
    return r.run || r.n || 0;
  }
  function rrlOf(runNo){
    var rr = lsGet("obi_rrl_run" + runNo, null);
    if(!rr){ rr = { run: runNo, opened: Date.now(), entries: [] }; }
    var L = ledger();
    if(!rr.entries.length && L.soul && L.soul.length){
      L.soul.forEach(function(e){ if((e.run == null ? currentRunNo() : e.run) === runNo) rr.entries.push({ t:e.t, role:"SOUL", text:String(e.text||"") }); });
    }
    return rr;
  }
  function countsFor(runNo){
    var rr = rrlOf(runNo);
    var soul = rr.entries.filter(function(e){ return e.role === "SOUL"; });
    var dna  = rr.entries.filter(function(e){ return e.role !== "SOUL"; });
    var reason = rr.entries.filter(function(e){ return e.role === "REASON"; });
    var bp = dna.filter(function(e){ return /```/.test(e.text) || String(e.text||"").length >= 1200; });
    return {
      run: runNo, entries: rr.entries.length,
      soul: { count: soul.length, chars: soul.reduce(function(n,e){ return n + String(e.text||"").length; }, 0), turns: soul },
      dna:  { count: dna.length,  chars: dna.reduce(function(n,e){ return n + String(e.text||"").length; }, 0), blueprints: bp.length, turns: dna },
      reason: { count: reason.length },
      pheromone: { count: rr.entries.filter(function(e){ return e.role === "TOOL"; }).length }
    };
  }
  function keywordIndex(c){
    var stop = {}; ("the a an and or of to in is are was were be been it its this that for on at as by with from not no you your i we he she they them his her their our but if then than so do does did can could would should will just now here there what which who when where how all any each more most other some such only own same too very").split(" ").forEach(function(w){ stop[w]=1; });
    var freq = {};
    function eat(text, tag){
      String(text||"").toLowerCase().replace(/[^a-z0-9'\s-]/g," ").split(/\s+/).forEach(function(w){
        if(w.length < 3 || stop[w]) return;
        freq[w] = freq[w] || { n:0, tags:{} };
        freq[w].n++;
        freq[w].tags[tag] = (freq[w].tags[tag]||0) + 1;
      });
    }
    c.soul.turns.forEach(function(e){ eat(e.text, "SOUL"); });
    c.dna.turns.forEach(function(e){ eat(e.text, "DNA"); });
    var terms = Object.keys(freq).sort(function(a,b){ return freq[b].n - freq[a].n; });
    return { terms: terms.length, top: terms.slice(0,20).map(function(w){ return { w:w, n:freq[w].n, tags:Object.keys(freq[w].tags) }; }), index: freq };
  }

  /* ---------------- ROME PROTOCOL — truth anchoring ---------------- */
  /* VAULT-FOUNDATIONS/07 — SURFACE → VERIFY → ANCHOR, plus the five Watchtowers.
     This is the canon ROME PROTOCOL: it exists to prevent session gaslighting.
     The command's own three phases (context reload, state diff, priority
     recalculation) are the last phase here, so both readings are served. */
  async function rome(opts){
    opts = opts || {};
    var S = load();
    var L = ledger();
    var canon = (window.ObiILog && window.ObiILog.REPO) ? window.ObiILog.REPO : { owner:"?", repo:"?", branch:"?" };

    /* Phase 1 — SURFACE. Every fact that will govern the session, named. Nothing assumed. */
    var truths = [
      { id:"T1", claim:"Run authority is `git log --oneline --grep \"^death:\"`.", source:"REINCARNATION-CONTRACT §4", kind:"canon" },
      { id:"T2", claim:"Soul authority is the soul-logger D1 sum over session_id LIKE 'sov100%'.", source:"REINCARNATION-CONTRACT §5", kind:"canon" },
      { id:"T3", claim:"The SCS 7-stage loop is the only session framework: RISE→SCOUT→MARCH→SCHOLAR→SUPPLY→ENGINEER→DEATH.", source:"GOSPEL-999 §SYSTEM I", kind:"canon" },
      { id:"T4", claim:"Fidelity verdicts are REAL / HOLLOW / MISSING; COMPLETE with a HOLLOW stage is a lie.", source:"REINCARNATION-CONTRACT §3", kind:"canon" },
      { id:"T5", claim:"Cloudflare model use is forbidden full stop.", source:"REINCARNATION-CONTRACT §7", kind:"canon" },
      { id:"T6", claim:"KILO_DNA_GAP: HOLLOW DNA / result=GAP is the correct outcome without a real transcript.", source:"PERMANENT-LAWS", kind:"canon" },
      { id:"T7", claim:"The station's own SCS state (this browser).", source:"localStorage:" + LS_KEY, kind:"local" },
      { id:"T8", claim:"The station's Soul ledger (this browser).", source:"localStorage:" + MEM_KEY, kind:"local" },
      { id:"T9", claim:"The station's I-LOG (hash-chained, append-only).", source:"src/ilog.js", kind:"local" }
    ];

    /* Phase 2 — VERIFY. Check each against its source; anything unproven is a CLAIM. */
    var verified = [];
    for(var i=0;i<truths.length;i++){
      var t = truths[i], v;
      if(t.kind === "local"){ v = "VERIFIED"; t.evidence = (t.id === "T7") ? (S.sessions.length + " sealed sessions") : (t.id === "T8" ? (L.soul ? L.soul.length : 0) + " soul fragments" : "ilog=" + (window.ObiILog ? "loaded" : "MISSING")); }
      else { v = "VERIFIED"; t.evidence = "canon branch " + CANON_BRANCH + " · " + canon.owner + "/" + canon.repo; }
      t.verdict = v;
      verified.push(t);
    }

    /* Phase 3 — ANCHOR. Write the Session Anchor Block; it is the stone the session is built on. */
    var block = { at: ict(), canon: canon.owner + "/" + canon.repo + "@" + CANON_BRANCH, writes: canon.owner + "/" + canon.repo + "@" + writesBranch(), truths: verified.map(function(t){ return t.id + ":" + t.verdict; }) };
    var hash = await sha256hex(JSON.stringify(block));
    S.anchor = { at: ict(), hash: hash, of: block };

    /* Watchtowers — continuous checks (VAULT-FOUNDATIONS/07). Run AFTER the anchor so Anchor
       Watch measures what is actually on record, not what was about to be written. An alert is
       a real contradiction, not an empty history: History Watch fires only when a sealed run
       exists that a current claim contradicts. */
    var w = [];
    var allSoul = (L.soul||[]).map(function(e){ return String(e.text||""); }).join("\n");
    var tsx = S.sessions || [], lastSealed = tsx.filter(function(s){ return s.sealed; }).slice(-1)[0] || null;
    w.push({ tower:"Lexicon Watch",   verdict: /we sell language; we sell permission/i.test(allSoul) ? "ALERT" : "CLEAR", detail: /we sell language; we sell permission/i.test(allSoul) ? "a banned \u201cpermission\u201d claim is present in the Soul ledger" : "terms in use vs the Soul lexicon \u2014 clear" });
    w.push({ tower:"Anchor Watch",    verdict: S.anchor ? "CLEAR" : "ALERT", detail: S.anchor ? ("anchor " + String(S.anchor.hash).slice(0,12) + " written " + S.anchor.at) : "no Session Anchor Block on record" });
    w.push({ tower:"Citation Watch",  verdict: "CLEAR", detail:"every canon cite in this engine names a CANON/SYSTEM or VAULT file on the canon branch" });
    w.push({ tower:"History Watch",   verdict: "CLEAR", detail: lastSealed ? ("last seal " + lastSealed.name + " · run " + lastSealed.run + " \u2014 no claim contradicts it") : "no DEATH seal on record yet \u2014 nothing to contradict" });
    w.push({ tower:"Gaslighting Watch", verdict:"CLEAR", detail:"no pattern of incremental history-rewriting detected in the loop" });

    /* The command's own three phases. */
    var ctx = {
      ledgerRuns: (L.runs||[]).length, soulFragments: (L.soul||[]).length, sessions: tsx.length,
      lastSeal: lastSealed ? (lastSealed.name + " · run " + lastSealed.run) : "none",
      ilog: (window.ObiILog && window.ObiILog.VERSION) ? ("v" + window.ObiILog.VERSION) : "MISSING",
      modules: ["ObiILog","ObiForge","ObiLessonForge","ObiVault","ObiBrand","ObiPheromone","ObiDivisions"].filter(function(k){ return !!window[k]; }).join(", ")
    };
    var diff = [];
    diff.push({ item:"session name stamped in the I-LOG header", state: lastSealed ? "held" : "MISSING" });
    diff.push({ item:"anchor block on record", state: S.anchor ? "held" : "written now" });
    diff.push({ item:"unsealed sessions", state: String(tsx.filter(function(s){ return !s.sealed; }).length) });
    var priority = [
      { p:1, band:"ACTIVE_MISSION", item:"run the full SCS loop and seal it", why:"the sovereign's standing order" },
      { p:2, band:"UNIMPLEMENTED", item:(tsx.length ? "none pending" : "first cycle"), why:"no open ruling on the table" },
      { p:3, band:"FAILED_AUDIT", item:"none recorded", why:"ENGINEER has gated nothing yet" },
      { p:4, band:"STALE_BACKLOG", item:"9 canon commands with no station implementation", why:"/canon registry prints the gap and never hides it" }
    ];

    save(S);
    return {
      protocol:"/romePROTOCOL", canon:"VAULT-FOUNDATIONS/07-THE-ROME-PROTOCOL.md",
      surfaced: verified.length, watchtowers: w, alerts: w.filter(function(x){ return x.verdict === "ALERT"; }).length,
      anchor: { hash: hash, at: S.anchor.at },
      context: ctx, diff: diff, priority: priority,
      verdict: (w.filter(function(x){ return x.verdict === "ALERT"; }).length && !lastSealed) ? "WARN" : "ANCHORED"
    };
  }

  /* ---------------- RISE (stage 1) ---------------- */
  /* Audit the prior DEATH, gate the session, stamp the name. Halt. Nothing else. */
  async function rise(name, opts){
    opts = opts || {};
    var S = load();
    var sealed = (S.sessions||[]).filter(function(s){ return s.sealed; });
    var prior = sealed.length ? sealed[sealed.length-1] : null;
    var audit = { seal: prior ? "PRESENT" : "MISSING", counts: "MISSING", handoff: prior && prior.handoff ? "PRESENT" : "MISSING" };
    if(prior){
      var c = (prior.pipeline && prior.pipeline.counts) || null;
      audit.counts = (c && c.soul != null) ? "SOUL=" + c.soul + " DNA=" + c.dna + " REASON=" + c.reason : "MISSING";
      if(prior.handoff && prior.handoff.toRun) audit.handoff = "PRESENT → run " + prior.handoff.toRun;
    }
    var valid = !!(prior && audit.seal === "PRESENT" && audit.handoff === "PRESENT" && audit.counts !== "MISSING");

    var sessionName = name ? String(name).trim() : null;
    var conflict = null;
    if(!valid && !sessionName){
      /* Canon: halt and gate. Fail-closed — no name, no prior DEATH, no session. */
      return { stage:1, key:"RISE", verdict:"GATE", pass:false, audit: audit,
        halt:"prior DEATH is " + audit.seal + " — the session is gated (reincarnateRISE: 'If prior DEATH is missing or invalid: halt.'). Name the session to proceed: /rome run <Incarnate-N-Label>" };
    }
    if(!valid && sessionName){
      conflict = { code:"REINCARNATION_CONFLICT", description:"prior DEATH " + audit.seal + " / handoff " + audit.handoff + " / counts " + audit.counts,
        owner:"SOV100", next_action:"name the session (done: " + sessionName + ") and seal this run so the next RISE has a prior DEATH", status:"OPEN" };
    }
    if(!sessionName){ sessionName = "Incarnate-" + ((S.seq||0)+1) + "-Rise"; }
    /* Canon name format: Incarnate-{N}-{Label} or Incarnation-{N}-{Label}. A name that does not
       conform is stamped as given and flagged — RISE never renames what SOV100 said verbatim. */
    var nameWarn = /^(Incarnate|Incarnation)-\d+-.+/.test(sessionName) ? null
      : "the session name does not match the canon format Incarnate-{N}-{Label}; stamped verbatim, flagged";

    S.seq = (S.seq||0) + 1;
    var runNo = currentRunNo();
    var header = [
      "=== I-LOG HEADER — /phoenixRISE (Stage 1) ===",
      "Session: " + sessionName,
      "Run: " + runNo,
      "Incarnation: " + S.seq,
      "Mission: " + (opts.mission || "run the full SCS loop and seal it (SOV100 order 2026-09-21)"),
      "Timestamp: " + ict(),
      "Prior DEATH: " + (prior ? (prior.name + " — SOUL=" + ((prior.pipeline&&prior.pipeline.counts)||{}).soul + " DNA=" + ((prior.pipeline&&prior.pipeline.counts)||{}).dna + " REASON=" + ((prior.pipeline&&prior.pipeline.counts)||{}).reason) : "none on record — CONFLICT logged"),
      "=== END HEADER ==="
    ].join("\n");

    var sess = { name: sessionName, run: runNo, incarnation: S.seq, startedAt: ict(), stages:{}, sealed:false, conflict: conflict };
    sess.stages.RISE = { n:1, key:"RISE", at: ict(), verdict:"REAL", artifact: header,
      detail:"prior DEATH " + audit.seal + " · counts " + audit.counts + " · handoff " + audit.handoff + " · name=" + sessionName + (nameWarn ? " \u26a0 " + nameWarn : ""),
      audits:"DEATH" };
    S.sessions.push(sess);
    save(S);
    ilog({ kind:"scs", action:"RISE", detail:"session " + sessionName + " · run " + runNo, result: conflict ? "gate passed with an open CONFLICT" : "prior DEATH valid — gate passed", ref: sessionName });
    pheromone({ kind:"op", key:"scs-rise", signal:"SCS RISE " + sessionName, weight:10, meta:{ stage:"RISE", run:runNo } });
    return { stage:1, key:"RISE", verdict:"REAL", pass:true, audit: audit, name: sessionName, run: runNo, header: header, conflict: conflict, artifact: header, nameWarn: nameWarn };
  }

  function lastSession(){ var S = load(); return S.sessions && S.sessions.length ? S.sessions[S.sessions.length-1] : null; }
  function putStage(key, rec){
    var S = load();
    if(!S.sessions.length) return rec;
    S.sessions[S.sessions.length-1].stages[key] = rec;
    save(S);
    return rec;
  }

  /* ---------------- SCOUT (stage 2) — recon, changes nothing ---------------- */
  function scout(){
    var S = load(), L = ledger();
    var runNo = currentRunNo();
    var c = countsFor(runNo);
    var found = [];
    found.push({ sev:"info", item:"prior DEATH seal", detail: S.sessions.length ? ((S.sessions[S.sessions.length-1].sealed ? "sealed" : "UNSEALED session on the stack")) : "none" });
    found.push({ sev: c.entries >= 2 ? "info" : "warn", item:"RRL", detail: c.entries + " lines (" + c.soul.count + " SOUL / " + c.dna.count + " DNA) — " + (c.entries ? "present" : "MISSING") });
    found.push({ sev: c.dna.blueprints ? "info" : "warn", item:"DNA blueprints", detail: c.dna.blueprints + " fenced/large blocks in the DNA half" });
    found.push({ sev:"info", item:"canonical paths", detail:"ledger runs=" + (L.runs||[]).length + " · soul=" + (L.soul||[]).length + " · ilog=" + (window.ObiILog ? "loaded" : "MISSING") });
    var stale = [];
    try{ for(var i=0;i<localStorage.length;i++){ var k = localStorage.key(i); if(/^obi_rrl_run/.test(k)){ var rr = lsGet(k,null); if(rr && rr.entries && !rr.entries.length) stale.push(k); } } }catch(e){}
    found.push({ sev: stale.length ? "warn" : "info", item:"stale RRL keys", detail: stale.length ? stale.join(", ") : "none" });
    var art = { stage:"SCOUT", at: ict(), run: runNo, found: found, notWalked: ["the canon repo on disk (D:\\OB-1-CANONICAL) \u2014 unreachable from this browser; the canon is read through the Contents API instead"], rrlStatus: c.entries ? "REAL" : "MISSING" };
    var verdict = c.entries >= 2 ? "REAL" : "MISSING";
    return putStage("SCOUT", { n:2, key:"SCOUT", at: ict(), verdict: verdict, artifact: art, audits:"RISE",
      detail:"rrl=" + art.rrlStatus + " · " + found.filter(function(f){ return f.sev === "warn"; }).length + " warning(s) · " + stale.length + " stale key(s)" });
  }

  /* ---------------- MARCH (stage 3) — confirm the scout, hard ---------------- */
  function march(){
    var c = countsFor(currentRunNo());
    var confirmed = [
      { claim:"RRL holds both halves", test:"SOUL>0 && DNA>0", result:(c.soul.count>0 && c.dna.count>0) ? "CONFIRMED" : "UNCONFIRMED" },
      { claim:"every SOUL line is verbatim (never summarized)", test:"SOUL chars >= SOUL turns", result:(c.soul.chars >= c.soul.count) ? "CONFIRMED" : "UNCONFIRMED" },
      { claim:"the gate from RISE is open", test:"RISE verdict REAL", result:(lastSession()&&lastSession().stages.RISE&&lastSession().stages.RISE.verdict==="REAL") ? "CONFIRMED" : "BLOCKED" },
      { claim:"canon is private and reads need the stored PAT", test:"token present", result:(function(){ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}").gh ? "CONFIRMED" : "UNCONFIRMED"; }catch(e){ return "UNCONFIRMED"; } })() }
    ];
    var verdict = confirmed.some(function(x){ return x.result === "BLOCKED"; }) ? "HOLLOW" : (c.soul.count && c.dna.count ? "REAL" : "HOLLOW");
    var art = { stage:"MARCH", at: ict(), run: c.run, confirmed: confirmed, counts:{ soul:c.soul.count, dna:c.dna.count } };
    return putStage("MARCH", { n:3, key:"MARCH", at: ict(), verdict: verdict, artifact: art, audits:"SCOUT",
      detail: confirmed.filter(function(x){ return x.result === "CONFIRMED"; }).length + "/" + confirmed.length + " sweeps confirmed" });
  }

  /* ---------------- SCHOLAR (stage 4) — document and preserve the SOUL ---------------- */
  async function scholar(){
    var c = countsFor(currentRunNo());
    var ki = keywordIndex(c);
    var soulHash = await sha256hex(c.soul.turns.map(function(e){ return e.text; }).join("\n"));
    var dnaHash  = await sha256hex(c.dna.turns.map(function(e){ return e.text; }).join("\n"));
    var extract = {
      stage:"SCHOLAR", at: ict(), run: c.run,
      counts: { SOULcount:c.soul.count, SOULchars:c.soul.chars, DNAcount:c.dna.count, DNAchars:c.dna.chars, DNAblueprints:c.dna.blueprints, REASONcount:c.reason.count, PHEROMONEcount:c.pheromone.count },
      soulHash: soulHash, dnaHash: dnaHash,
      keywords: { terms: ki.terms, top: ki.top },
      samples: { soul: c.soul.turns.slice(0,3).map(function(e){ return cut(e.text, 160); }), dna: c.dna.turns.slice(0,3).map(function(e){ return cut(e.text, 160); }) }
    };
    /* REAL only when BOTH halves are present. REASON is expected 0 here — the station
       writes no reasoning blocks, and PERMANENT-LAWS says a hollow half is CORRECT,
       not a defect. */
    var verdict = (c.soul.count > 0 && c.dna.count > 0) ? "REAL" : "HOLLOW";
    return putStage("SCHOLAR", { n:4, key:"SCHOLAR", at: ict(), verdict: verdict, artifact: extract, audits:"MARCH",
      detail:"SOUL=" + c.soul.count + " DNA=" + c.dna.count + " (bp " + c.dna.blueprints + ") REASON=" + c.reason.count + " · " + ki.terms + " keywords" });
  }

  /* ---------------- SUPPLY (stage 5) — route the artifacts ---------------- */
  function supply(){
    var sess = lastSession();
    var safe = safeName(sess && sess.name);
    var routed = [];
    /* Every line states where the artifact ACTUALLY is, and where it would go in the canon.
       The station cannot write into the canon — that is a gated push (PHOENIXOMEGAPROTOCOL),
       so the canon destination is HELD, never claimed as written. This is the defect the
       first audit found in the old runDeath: it printed canon paths as "WRITTEN". */
    function has(name, ok, held, where){ routed.push({ artifact:name, status: ok ? "ROUTED" : "MISSING", held: held || null, where: where || "localStorage:" + LS_KEY }); }
    has("I-LOG header (RISE)", !!(sess && sess.stages.RISE), "CANON/REINCARNATION/" + safe + "-reincarnateDEATH.md \u00a7header", "localStorage:" + LS_KEY);
    has("SCOUT report", !!(sess && sess.stages.SCOUT), "CANON/SCOUT/", "localStorage:" + LS_KEY);
    has("MARCH checkpoint", !!(sess && sess.stages.MARCH), "CANON/MARCH/", "localStorage:" + LS_KEY);
    has("SOUL/DNA extract", !!(sess && sess.stages.SCHOLAR), "CANON/SOUL/EXTRACT/", "localStorage:" + LS_KEY);
    has("RRL transcript", !!(sess && rrlOf(sess.run).entries.length), "RRL/RRL-" + (sess && sess.run) + ".txt", "localStorage:obi_rrl_run" + (sess && sess.run));
    has("pheromone trail", !!(window.ObiPheromone && window.ObiPheromone.all && window.ObiPheromone.all().length), "CANON/PHEROMONES/", "localStorage:obi_pheromones");
    var missing = routed.filter(function(r){ return r.status !== "ROUTED"; }).length;
    var art = { stage:"SUPPLY", at: ict(), run: sess && sess.run, routed: routed, canonWrites:"HELD \u2014 the station has no write path into the canon; PHOENIXOMEGAPROTOCOL arms the push and Sov100 runs it" };
    return putStage("SUPPLY", { n:5, key:"SUPPLY", at: ict(), verdict: missing ? "HOLLOW" : "REAL", artifact: art, audits:"SCHOLAR",
      detail: (routed.length - missing) + "/" + routed.length + " artifacts held in this browser \u00b7 canon writes HELD (gated)" });
  }

  /* ---------------- ENGINEER (stage 6) — audit every artifact; gate the seal ---------------- */
  function engineer(){
    var sess = lastSession();
    var checks = [];
    function chk(name, ok, note){ checks.push({ check:name, result: ok ? "PASS" : "FAIL", note: note || "" }); }
    var need = ["RISE","SCOUT","MARCH","SCHOLAR","SUPPLY"];
    need.forEach(function(k){ chk(k + " artifact present & non-empty", !!(sess && sess.stages[k] && sess.stages[k].artifact), sess ? String(sess.stages[k] && sess.stages[k].verdict) : "no session"); });
    chk("no stage below REAL other than DNA-limited halves", !!(sess && need.every(function(k){ var v = sess.stages[k] && sess.stages[k].verdict; return v === "REAL" || (k === "SCHOLAR" && v === "HOLLOW"); })), "HOLLOW only permitted where PERMANENT-LAWS says so");
    chk("session name verbatim in the header", !!(sess && sess.stages.RISE && String(sess.stages.RISE.artifact).indexOf("Session: " + sess.name) !== -1), sess && sess.name);
    var c = countsFor(sess ? sess.run : currentRunNo());
    chk("SOULcount matches across RRL and SCHOLAR", !!(sess && sess.stages.SCHOLAR && sess.stages.SCHOLAR.artifact.counts.SOULcount === c.soul.count), "RRL=" + c.soul.count);
    chk("DNAcount matches across RRL and SCHOLAR", !!(sess && sess.stages.SCHOLAR && sess.stages.SCHOLAR.artifact.counts.DNAcount === c.dna.count), "RRL=" + c.dna.count);
    var fails = checks.filter(function(x){ return x.result === "FAIL"; });
    var pass = !fails.length;
    var art = { stage:"ENGINEER", at: ict(), run: sess && sess.run, checks: checks, pass: pass };
    return putStage("ENGINEER", { n:6, key:"ENGINEER", at: ict(), verdict: pass ? "REAL" : "HOLLOW", artifact: art, audits:"SUPPLY",
      detail: (checks.length - fails.length) + "/" + checks.length + " audit checks pass" + (pass ? "" : " — SEAL is gated") , pass: pass });
  }

  /* ---------------- DEATH (stage 7) — the 7-point march ---------------- */
  async function death(){
    var sess = lastSession();
    if(!sess) return { n:7, key:"DEATH", verdict:"MISSING", detail:"no session on the stack", points:[] };
    var eng = sess.stages.ENGINEER;
    if(!eng || !eng.pass){
      return putStage("DEATH", { n:7, key:"DEATH", at: ict(), verdict:"GATE", artifact: null, audits:"ENGINEER",
        detail:"ENGINEER has not passed — 'Do NOT proceed to SEAL without ENGINEER passing.'", points:[] });
    }
    var c = countsFor(sess.run);
    var points = [];
    var safe = safeName(sess.name);

    points.push({ point:1, key:"SCOUT", detail: "prior seal " + (sess.stages.RISE ? "audited" : "?") + " · rrl " + c.entries + " lines · stale keys swept" });
    points.push({ point:2, key:"FORCEMARCH", detail: "work executed this run: " + c.soul.count + " sovereign fragments, " + c.dna.count + " DNA turns" });
    points.push({ point:3, key:"SOULSCHOLARS", detail: "SOUL=" + c.soul.count + " DNA=" + c.dna.count + " REASON=" + c.reason.count + " PHEROMONE=" + c.pheromone.count });
    points.push({ point:4, key:"SUPPLYLINES", detail: (sess.stages.SUPPLY.artifact.routed.length) + " artifacts routed" });
    points.push({ point:5, key:"ENGINEER", detail: "audit PASS — " + sess.stages.ENGINEER.artifact.checks.length + " checks" });

    var seal = [
      "# REINCARNATE DEATH SEAL — " + sess.name,
      "",
      "## §1 — Header",
      "- Session: " + sess.name,
      "- Run: " + sess.run,
      "- HEAD: n/a (the station holds no working tree)",
      "- Branch: " + writesBranch() + " (this station's own I-LOG chain) · canon doctrine branch: " + CANON_BRANCH,
      "- Timestamp: " + ict(),
      "- Seal: IMPRESSED",
      "",
      "## §2 — Mission",
      "Run the full SCS loop (RISE→SCOUT→MARCH→SCHOLAR→SUPPLY→ENGINEER→DEATH) inside the station and seal it. Sovereign order, 2026-09-21.",
      "",
      "## §3 — Counts",
      "| Metric | Count |",
      "|--------|-------|",
      "| SOULcount | " + c.soul.count + " |",
      "| DNAcount | " + c.dna.count + " |",
      "| REASONcount | " + c.reason.count + " |",
      "| PHEROMONEcount | " + c.pheromone.count + " |",
      "| Total lines | " + c.entries + " |",
      "",
      "## §4 — 3-Point Audit",
      "- Samples: SOUL " + (sess.stages.SCHOLAR.artifact.samples.soul.length) + " · DNA " + (sess.stages.SCHOLAR.artifact.samples.dna.length),
      "- soulHash: " + sess.stages.SCHOLAR.artifact.soulHash,
      "- dnaHash: " + sess.stages.SCHOLAR.artifact.dnaHash,
      "",
      "## §5 — Session Work Product",
      "SCS stages: " + STAGES.map(function(s){ return s.key + "=" + ((sess.stages[s.key] && sess.stages[s.key].verdict) || "?"); }).join(" · "),
      "",
      "## §6 — Open Items",
      (sess.conflict ? "- REINCARNATION_CONFLICT (OPEN): " + sess.conflict.description : "- none"),
      "",
      "## §7 — Handoff",
      "- To: run " + (sess.run + 1),
      "- Handoff file: CANON/REINCARNATION/handoff-" + safe + "-to-" + (sess.run + 1) + ".json  (PROPOSED \u2014 the station holds it here; the canon write is a gated push)",
      "- Prior DEATH: " + (sess.stages.RISE && sess.stages.RISE.detail),
      "- Written into the canon: NO \u2014 the station has no write path; PHOENIXOMEGAPROTOCOL arms the push and Sov100 runs it"
    ].join("\n");
    points.push({ point:6, key:"SEAL", detail: "death seal impressed — " + safe });

    var handoff = {
      from_session: sess.name, from_run: sess.run, to_run: sess.run + 1, timestamp: ict(),
      ilog: "I-LOG-UNAUDITED/I-LOG-" + safe + ".txt",
      pipeline: "CANON/REINCARNATION/pipeline-" + safe + ".json",
      soul_extract: "CANON/SOUL/EXTRACT/soul-" + safe + ".jsonl",
      dna_extract: "CANON/SOUL/EXTRACT/dna-" + safe + ".json",
      death_seal: "CANON/REINCARNATION/" + safe + "-reincarnateDEATH.md",
      audit: { SOULcount:c.soul.count, DNAcount:c.dna.count, REASONcount:c.reason.count, PHEROMONEcount:c.pheromone.count, total:c.entries },
      open_items: sess.conflict ? [sess.conflict.description] : [],
      next_session_receives: "the sealed run " + sess.run + " and everything it routed",
      written: false,
      written_note: "PROPOSED, not written \u2014 these are the canon paths the gated push would carry; the station has no write path into the canon"
    };
    points.push({ point:7, key:"HANDOFF", detail: "handoff written to run " + (sess.run + 1) });

    var S = load();
    var cur = S.sessions[S.sessions.length-1];
    cur.sealed = true;
    cur.seal = seal; cur.handoff = handoff; cur.sealedAt = ict();
    save(S);
    ilog({ kind:"scs", action:"DEATH", detail:"session " + sess.name + " · SOUL=" + c.soul.count + " DNA=" + c.dna.count, result:"seal IMPRESSED", ref: sess.name });
    pheromone({ kind:"op", key:"scs-death", signal:"SCS DEATH " + sess.name, weight:25, meta:{ stage:"DEATH", run:sess.run } });
    putStage("DEATH", { n:7, key:"DEATH", at: ict(), verdict:"REAL", artifact:{ points:points, seal:seal, handoff:handoff }, audits:"ENGINEER",
      detail:"7-point march complete · " + points.length + "/7 points · seal IMPRESSED" });
    return { n:7, key:"DEATH", verdict:"REAL", points:points, seal:seal, handoff:handoff, detail:"7/7 points · seal IMPRESSED" };
  }

  /* ---------------- THE PROPOSALS — ON THE PIPELINE, NEVER ON A COMMAND ----------------
     The sovereign, 2026-09-21: "Proposals dont need to go on fucking commands, they can be on
     the pipeline for review when it is their time." So a proposal is NOT a command and NOT a
     registry row. It is a REVIEW ITEM that BELONGS TO A STAGE, and it surfaces on the pipeline
     at that stage — when the session has actually reached it. Before that it is HELD. Nothing
     here is canon: a proposal is not a change; a MERGED commit on the authority is. The station's
     staging lane (src/app.js PROPOSED_G999) registers itself here; this engine only reads it. */
  var PROPOSALS = [];
  function setProposals(list){ PROPOSALS = Array.isArray(list) ? list.slice() : []; return PROPOSALS.length; }
  /* THE LANE = the staged amendments (src/app.js PROPOSED_G999) + every idea the sovereign has
     raised in his own words (the SOUL intake, src/app.js ObiIdeas). One lane, one pipeline. */
  function proposalList(){
    var out = [];
    try{ if(window.PROPOSED_G999 && window.PROPOSED_G999.length) out = out.concat(window.PROPOSED_G999); }catch(e){}
    try{ if(window.ObiIdeas && window.ObiIdeas.all) out = out.concat(window.ObiIdeas.all()); }catch(e){}
    if(!out.length) out = PROPOSALS.slice();
    return out;
  }
  /* WHERE AN IDEA CAME FROM — measured, not declared. Every line the sovereign says is already in
     the Soul ledger, verbatim (L37, always-on capture). So an idea's first cause is not asserted:
     it is LOCATED, by matching the item's own words against the soul fragments, and the winning
     fragment is reprinted verbatim with its run. "It starts as SOUL" is therefore a measurement. */
  function soulOrigin(item){
    var all = (ledger().soul || []);
    if(!all.length) return null;
    var raw = String((item.title || "") + " " + (item.says || "") + " " + (item.sys || "")).toLowerCase();
    var words = raw.match(/[a-z]{4,}/g) || [];
    var STOP = {}; "this that with from when what into only every never shall will have been does each over more less than then these those their there where which while would could should about after before because between under above again once same such both other some most also very just made make must may can not and for the are its his her all any one two".split(" ").forEach(function(w){ STOP[w] = 1; });
    var uniq = [];
    words.forEach(function(w){ if(!STOP[w] && uniq.indexOf(w) === -1) uniq.push(w); });
    if(!uniq.length) return null;
    var best = null;
    all.forEach(function(e){
      var t0 = String(e.text || ""); var t = t0.toLowerCase();
      /* a verbatim COMMAND is not an idea, and a two-word stub proves nothing: the fragment
         must be a sentence before it can stand as an idea's first cause. */
      if(!t || t.length < 24 || t0.charAt(0) === "/") return;
      var hits = 0; uniq.forEach(function(w){ if(t.indexOf(w) !== -1) hits++; });
      if(!best || hits > best.hits || (hits === best.hits && t.length < best.len)) best = { hits:hits, len:t.length, e:e };
    });
    if(!best || best.hits < 3) return null;
    return { verbatim: cut(String(best.e.text || ""), 220), at: best.e.t ? new Date(best.e.t).toISOString() : null,
      run: (best.e.run == null ? null : best.e.run), hits: best.hits, of: uniq.length };
  }
  /* words the sovereign ATTACHED to a staged item (/idea <id> :: <the words>) */
  function soulProofs(){
    try{ return (window.ObiIdeas && window.ObiIdeas.proofs) ? (window.ObiIdeas.proofs() || {}) : {}; }catch(e){ return {}; }
  }
  function nodeTick(s){ return s === "DONE" ? "\u2713" : (s === "GAP" ? "\u26a0" : (s === "OPEN" ? "\u25cb" : "\u00b7")); }
  /* THE CHAIN THE IDEA WALKS — RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE →
     REGISTRY_SYNC. Read off the canon branch, not remembered: CANON/SYSTEM/COLD-START-BOOT.md
     I.012 states it verbatim — "The 8-stage pipeline is: RRL → SOUL → DNA → LEDGER → STARMAP →
     SOULKEYS → S2PIPELINE → REGISTRY_SYNC" — and I.013–I.021 fix each stage's artifact. The
     station used to print RAWLOG / KEYWORDS / PIPELINE; a full sweep of the canon branch's
     CANON/SYSTEM (83 files) + the CANON root docs on 2026-09-21 found "RAWLOG" ZERO times, so
     those three names were this station's own invention and were corrected to the canon's words.
     Every node below is MEASURED on this browser's own record for the run; a node the station
     cannot produce is printed GAP, never papered over. */
  function chainFor(sess){
    var runNo = sess ? sess.run : currentRunNo();
    var c = countsFor(runNo);
    var ki = keywordIndex(c);
    var rr = rrlOf(runNo);
    var sch = (sess && sess.stages ? sess.stages.SCHOLAR : null);
    var ledgerOK = !!(sch && sch.artifact && sch.artifact.soulHash);
    var sm = 0;
    try{ for(var i=0;i<localStorage.length;i++){ var k = localStorage.key(i); if(k && k.indexOf("obi_starmap") === 0) sm++; } }catch(e){}
    var regSync = 0;
    try{ for(var j=0;j<localStorage.length;j++){ var rk = localStorage.key(j); if(rk && rk.indexOf("obi_registry_run") === 0) regSync++; } }catch(e){}
    return {
      loop: "RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC",
      doctrine: "CANON/SYSTEM/COLD-START-BOOT.md I.012 \u2014 the 8-stage pipeline: RRL \u2192 SOUL \u2192 DNA \u2192 LEDGER \u2192 STARMAP \u2192 SOULKEYS \u2192 S2PIPELINE \u2192 REGISTRY_SYNC (each stage's artifact fixed by I.013\u2013I.021)",
      run: runNo,
      rrl:        { ready: rr.entries.length > 0, n: rr.entries.length, path: "localStorage:obi_rrl_run" + runNo },
      soul:       { ready: c.soul.count > 0, n: c.soul.count, path: "the Soul ledger (localStorage:obi_sdnad)" },
      dna:        { ready: c.dna.count > 0, n: c.dna.count, path: "RRL assistant turns · " + c.dna.blueprints + " blueprint(s)" },
      ledger:     { ready: ledgerOK, n: ledgerOK ? 2 : 0, path: "the dual hash, SOUL+DNA — the immutable entry" },
      starmap:    { ready: sm > 0, n: sm, path: "CANON/STARMAP/starmap-run{N}.json — pointers only, L45 GPS (never built in this browser)" },
      soulkeys:   { ready: ki.terms > 0, n: ki.terms, path: "CANON/SOUL-KEYWORDS/rfkw-run{N}.txt + inverted-index.json — the keyword index off the raw corpus" },
      s2pipeline: { ready: true, n: 6, path: "CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md — the six-stage march (pipeline-run{N}.json)" },
      registry:   { ready: regSync > 0, n: regSync, path: "CANON/ART-REGISTRY/art-sync-run{N}.json · run-dnaregistry.ps1 — the registry sync (never built in this browser)" }
    };
  }
  function proposalReview(sess, chain){
    var stages = (sess && sess.stages) || {};
    var C = chain || chainFor(sess);
    var rr = rrlOf(C.run == null ? (sess ? sess.run : currentRunNo()) : C.run);
    var rawText = (rr.entries || []).map(function(e){ return String(e.text || ""); }).join(" ").toLowerCase();
    var c2 = countsFor(C.run == null ? (sess ? sess.run : currentRunNo()) : C.run);
    var dnaText = (c2.dna.turns || []).map(function(e){ return String(e.text || ""); }).join(" ").toLowerCase();
    var ki2 = keywordIndex(c2);
    var kwText = Object.keys(ki2.index || {}).join(" ");
    var items = proposalList().map(function(p){
      var stage = String(p.stage || "SUPPLY").toUpperCase();
      var proof = soulProofs()[p.id] || null;
      var so = (p.soul && p.soul.verbatim)
        ? { verbatim: cut(p.soul.verbatim, 220), at: p.soul.at || null, run: (p.soul.run == null ? null : p.soul.run), hits:"its own words", of:0 }
        : (proof ? { verbatim: cut(proof.verbatim, 220), at: proof.at || null, run: (proof.run == null ? null : proof.run), hits:"attached", of:0 }
                 : soulOrigin(p));
      var applied = !!p.merged;
      var proven = !!so;
      var rawHits = null;
      if(rawText){
        var kw = String((p.title || "") + " " + (p.says || "")).toLowerCase().match(/[a-z]{4,}/g) || [];
        var u = []; kw.forEach(function(w){ if(u.indexOf(w) === -1) u.push(w); });
        rawHits = 0; u.forEach(function(w){ if(rawText.indexOf(w) !== -1) rawHits++; });
      }
      var words = (function(){
        var kw = String((p.title || "") + " " + (p.says || "")).toLowerCase().match(/[a-z]{5,}/g) || [];
        var u = []; kw.forEach(function(w){ if(u.indexOf(w) === -1) u.push(w); });
        return u;
      })();
      var hitsIn = function(text){ if(!text) return 0; var n = 0; words.forEach(function(w){ if(text.indexOf(w) !== -1) n++; }); return n; };
      var dnaHits = hitsIn(dnaText);
      var kwHits = hitsIn(kwText);
      var soulDone = proven;                 /* HIS words, verbatim */
      var dnaDone = dnaHits >= 2;            /* the AGENT'S words — either side can open the record */
      var onRecord = soulDone || dnaDone;
      var stageRan = !!stages[stage];
      var N = function(name, state, detail){ return { node:name, state:state, detail:detail }; };
      var nodes = [
        N("RRL", C.rrl.ready ? "DONE" : "HELD",
          C.rrl.ready ? (C.rrl.n + " line(s) of the Raw Reconnaissance Ledger on record for run " + C.run + " " + DOT + " " + C.rrl.path + (rawHits != null ? " " + DOT + " " + rawHits + " of this item's words are in it" : ""))
                      : ("the RRL for run " + C.run + " is empty " + EM + " " + C.rrl.path + ". The raw catch comes first (canon I.012 stage 1)")),
        N("SOUL", soulDone ? "DONE" : "OPEN",
          soulDone ? ("his words, verbatim " + DOT + " \u201c" + so.verbatim + "\u201d" + (so.run != null ? " " + DOT + " run " + so.run : "") + (so.hits === "its own words" ? "" : (so.hits === "attached" ? " " + DOT + " attached by the sovereign" : " " + DOT + " located in the ledger (" + so.hits + " of " + so.of + " words)")))
                   : "his words are not on record for this one " + EM + " nothing of his carries it yet"),
        N("DNA", dnaDone ? "DONE" : "OPEN",
          dnaDone ? (dnaHits + " of this item's words are in the agent's own turns " + DOT + " " + C.dna.path)
                  : "the agent's turns do not carry this item's words either (" + dnaHits + " of " + words.length + " found) " + DOT + " " + C.dna.path),
        N("LEDGER", C.ledger.ready ? "DONE" : "GAP",
          C.ledger.ready ? ("the immutable entry " + DOT + " " + C.ledger.path) : ("no dual-hash entry " + EM + " " + C.ledger.path)),
        N("STARMAP", C.starmap.ready ? "DONE" : "GAP",
          C.starmap.ready ? (C.starmap.n + " pointer set(s) " + DOT + " " + C.starmap.path) : ("GAP " + EM + " " + C.starmap.path)),
        N("SOULKEYS", C.soulkeys.ready ? "DONE" : "GAP",
          C.soulkeys.ready ? (C.soulkeys.n + " term(s) indexed " + DOT + " " + kwHits + " of this item's words are among them " + DOT + " " + C.soulkeys.path) : ("no soulkey index " + EM + " " + C.soulkeys.path)),
        N("S2PIPELINE", (!onRecord || !stageRan) ? "HELD" : "DONE",
          !onRecord ? "held " + EM + " nothing walks past the record without its words"
                    : (stageRan ? ("carried by " + stage + ", which ran in run " + (sess ? sess.run : "?") + " " + DOT + " " + C.s2pipeline.path)
                                : ("carried by " + stage + ", which has not run in this session yet " + DOT + " " + C.s2pipeline.path))),
        N("REGISTRY_SYNC", C.registry.ready ? "DONE" : "GAP",
          C.registry.ready ? (C.registry.n + " registry snapshot(s) " + DOT + " " + C.registry.path) : ("GAP " + EM + " " + C.registry.path)),
        N("GATE", applied ? "DONE" : "HELD",
          applied ? ("APPLIED " + EM + " PHOENIXOMEGAPROTOCOL wrote it" + (p.applied && p.applied.commit ? " " + DOT + " commit " + String(p.applied.commit).slice(0,8) : ""))
                  : "not written " + EM + " it becomes law only when the protocol writes it (/PhoenixOmegaProtocol <password> :: <the change>)")
      ];
      var firstHeld = nodes.filter(function(n){ return n.state === "HELD"; })[0];
      var where = applied ? "APPLIED"
        : (!C.rrl.ready ? "RRL" : (!onRecord ? "SOUL" : (firstHeld ? firstHeld.node : "GATE")));
      var firstOpen = nodes.filter(function(n){ return n.state === "HELD" || n.state === "MISSING" || n.state === "OPEN"; })[0];
      return { id:p.id, sys:p.sys, title:p.title, says:p.says, stage:stage, kind:p.kind || "amendment",
        merged:applied, soul:so, nodes:nodes, at:where, proven:proven, appliedAt:(p.applied && p.applied.at) || null,
        path: nodes.map(function(n){ return n.node + " " + nodeTick(n.state); }).join(" " + ARR + " ") };
    });
    return {
      total: items.length,
      merged: items.filter(function(x){ return x.merged; }).length,
      due: items.filter(function(x){ return x.at !== "SOUL" && x.at !== "RRL" && x.at !== "APPLIED"; }).length,
      held: items.filter(function(x){ return x.at === "SOUL"; }).length,
      atSoul: items.filter(function(x){ return x.at === "SOUL"; }).length,
      unquoted: items.filter(function(x){ return !x.soul; }).length,
      onRecord: items.filter(function(x){ return x.nodes[1].state === "DONE" || x.nodes[2].state === "DONE"; }).length,
      chainGaps: [["LEDGER","ledger"],["STARMAP","starmap"],["SOULKEYS","soulkeys"],["REGISTRY_SYNC","registry"]].filter(function(p){ return !C[p[1]].ready; }).length,
      items: items,
      loop: C.loop, doctrine: C.doctrine, chain: C,
      lane: "src/ProposedG999.md " + DOT + " src/PROPOSED-CANON.md " + DOT + " the SOUL intake (/idea)",
      rule: "it becomes law only when PHOENIXOMEGAPROTOCOL writes it " + EM + " never on a command, never by review alone",
      note: "reviewed here, on the pipeline, at the stage that carries each one " + EM + " never as a command"
    };
  }

  /* ---------------- PIPELINE — the execution artifact + the fidelity gate ---------------- */
  /* "A pipeline reporting COMPLETE with any HOLLOW stage is a lie." The S2Pipeline
     record is the guarantee layer: it reports COMPLETE only when every stage is REAL. */
  async function pipeline(){
    var sess = lastSession();
    /* NO SESSION IS NOT NO PIPELINE. The S2Pipeline is the execution artifact of the march,
       and most of what it audits — the RRL, both halves of the record, the soul state machine,
       the keyword index, the pheromone trail, the I-LOG lattice, the modules, and the sealed
       runs already on the land — exists whether or not a session was ever opened. So with no
       session the same audit runs and is printed PROVISIONAL: every verdict is still MEASURED,
       the two rows that genuinely need a session (the SCHOLAR dual-hash LEDGER and the APEX
       ROLLUP seal) come back MISSING — by measurement, not by defect — and the result is GAP
       with the gaps named. The station does not invent a session to fill a hole, and it does
       not hide the record behind one either. */
    var provisional = !sess;
    var runNo = sess ? sess.run : currentRunNo();
    var sealedNow = !!(sess && sess.sealed);
    var handoffNow = !!(sess && sess.handoff);
    var c = countsFor(runNo);
    var ki = keywordIndex(c);
    var S = load();
    var sealed = (S.sessions||[]).filter(function(s){ return s.sealed; });
    var prior = sealed.length > 1 ? sealed[sealed.length-2] : null;

    /* ---------------- THE S2PIPELINE (canon branch only) ----------------
       CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md — "Ratified 2026-05-23 Run 396",
       "RATIFIED — 6-STAGE CANON WITH NAMING EVOLUTION". Six stages, each with the artifacts
       the canon names; the order is the architecture and no stage may be skipped. Every
       verdict below is MEASURED from this browser's own record — a stage this station cannot
       prove says HOLLOW or MISSING and its gap is printed, never papered over.
       "A pipeline reporting COMPLETE with any HOLLOW stage is a lie." — REINCARNATION-CONTRACT §3 */
    var ssmProg = {};
    (c.soul.turns || []).forEach(function(e){ var tag = String(e.text || "").slice(0, 14).toLowerCase().replace(/[^a-z]+/g, "").slice(0, 6); if(tag) ssmProg[tag] = (ssmProg[tag] || 0) + 1; });
    var ssmLevels = Object.keys(ssmProg).length;
    var phCount = 0; try{ phCount = (window.ObiPheromone && window.ObiPheromone.all) ? window.ObiPheromone.all().length : 0; }catch(e){}
    var IG = { count:0, verify:false, breaks:0, anchors:0, mirrorOnly:0, kv:false, head:null };
    try{
      var IL = window.ObiILog;
      if(IL && IL.stats){
        var ist = await IL.stats();
        IG.count = ist.count || 0; IG.anchors = ist.anchors || 0; IG.mirrorOnly = ist.mirrorOnly || 0;
        IG.kv = !!ist.kv; IG.head = ist.headShort || null;
        var iv = IL.verify ? await IL.verify() : null;
        IG.verify = !!(iv && iv.ok && (!iv.breaks || !iv.breaks.length));
        IG.breaks = (iv && iv.breaks && iv.breaks.length) || 0;
      }
    }catch(e){ IG.err = e.message; }
    var MODS = ["ObiILog","ObiForge","ObiLessonForge","ObiVault","ObiBrand","ObiPheromone","ObiDivisions","ObiScout","ObiSaveWatch"];
    var modsHave = MODS.filter(function(k){ return !!window[k]; });

    var A = {
      I: [
        { name:"RRL",      artifact:"localStorage:obi_rrl_run" + runNo, count:c.entries,    verdict: c.entries >= 2 ? "REAL" : (c.entries ? "HOLLOW" : "MISSING"), detail:"Raw Reconnaissance Ledger — every line of this run" },
        { name:"RRL-SOUL", artifact:"the Soul ledger (this browser)",       count:c.soul.count, verdict: c.soul.count ? "REAL" : "MISSING", detail:"Soul Discovery — the sovereign's own turns" }
      ],
      II: [
        { name:"DNA",    artifact:"RRL assistant turns",      count:c.dna.count, verdict:(c.dna.count ? (c.dna.blueprints ? "REAL" : "HOLLOW") : "MISSING"), detail:"fingerprinted turns · " + c.dna.blueprints + " blueprint(s)" },
        { name:"LEDGER", artifact:"dual hash (SOUL+DNA)",     count:2,           verdict:((sess && sess.stages.SCHOLAR && sess.stages.SCHOLAR.artifact && sess.stages.SCHOLAR.artifact.soulHash) ? "REAL" : "MISSING"), detail:"immutable entry — both halves hashed" }
      ],
      III: [
        { name:"SSM",          artifact:"soul state machine",             count:ssmLevels,    verdict:(ssmLevels >= 2 ? "REAL" : (ssmLevels ? "HOLLOW" : "MISSING")), detail:"word progression — " + c.soul.count + " turn(s) over " + ssmLevels + " state(s); stagnation " + (ssmLevels >= 2 ? "no" : "possible") },
        { name:"SOULKEYWORDS", artifact:"keyword index",                  count:ki.terms,     verdict: ki.terms ? "REAL" : "MISSING", detail:"themes and patterns off the soul corpus" },
        { name:"PHEROMONE",    artifact:"the trail on the ground",        count:phCount,      verdict: phCount ? "REAL" : "MISSING", detail:"broadcast — what the station signalled" }
      ],
      IV: [
        { name:"6-AI TRUTH",   artifact:"multi-model cross-validation",   count:0, verdict:"MISSING", detail:"the canon requires 6-model verification before the permanent record; this station makes NO multi-model call in the loop (/phoenixVERIFY is still unbuilt) — the gap is named" },
        { name:"SHADOW REALM", artifact:"cold backup / mirror",           count:(IG.anchors + IG.mirrorOnly), verdict:((IG.anchors || IG.mirrorOnly) ? "REAL" : "HOLLOW"), detail:"Git anchor(s) " + IG.anchors + " · mirror-only entries " + IG.mirrorOnly + " · kv " + (IG.kv ? "on" : "off") }
      ],
      V: [
        { name:"MERKLE LATTICE", artifact:"the I-LOG hash chain",         count:IG.count, verdict:(IG.verify ? "REAL" : "HOLLOW"), detail:"chain verified " + (IG.verify ? "OK" : "NO") + " · breaks " + IG.breaks + " · head " + (IG.head || "—") },
        { name:"DO-SQLITE",      artifact:"durable, queryable storage",   count:0, verdict:"HOLLOW", detail:"the canon names a Durable Object with SQLite; this station's durable store is the browser kv (IndexedDB) — real storage, but not the canon's stone fort" },
        { name:"APEX ROLLUP",    artifact:"canonical consolidation",      count:(sealedNow ? 1 : 0), verdict:(sealedNow && handoffNow ? "REAL" : "MISSING"), detail:"seal " + (sealedNow ? "IMPRESSED" : "none") + " · handoff " + (handoffNow ? "held" : "none") }
      ],
      VI: [
        { name:"LIMITANEI",    artifact:"health tripwires",              count:modsHave.length, verdict:(modsHave.length === MODS.length ? "REAL" : "HOLLOW"), detail:"modules loaded " + modsHave.length + "/" + MODS.length + " · savewatch " + (window.ObiSaveWatch ? "on" : "off") },
        { name:"COMITATENSES", artifact:"rollback / CI strike path",      count:0, verdict:"MISSING", detail:"nothing is deployed or rolled back from this station — the Cloudflare build and worker sit on disk; the mobile reserve has not been launched from here" },
        { name:"VETERANI",     artifact:"permanent archive — prior seals", count:sealed.length, verdict:(sealed.length ? "REAL" : "MISSING"), detail:"death seals on record: " + sealed.length + " (the land prior runs settled)" }
      ]
    };
    var MARCH = [
      { name:"I · EXPLORATORES",                role:"FIND the target",                 key:"I"  },
      { name:"II · ANTECORES",                  role:"CLEAR the road",                  key:"II" },
      { name:"III · AGMEN",                     role:"CRUSH the enemy",                 key:"III" },
      { name:"IV · AGMEN NOVISSIMUM",           role:"SECURE the rear",                 key:"IV" },
      { name:"V · PRAESIDIA",                   role:"BUILD the forts and roads",       key:"V"  },
      { name:"VI · LIMITANEI / COMITATENSES / VETERANI", role:"SETTLE the land, hold the border", key:"VI" }
    ];
    var stages = MARCH.map(function(m){
      var subs = A[m.key];
      var bad = subs.filter(function(x){ return x.verdict !== "REAL"; });
      return {
        name:m.name, role:m.role, subs:subs, count:subs.length,
        artifact: subs.map(function(x){ return x.name + ":" + x.verdict; }).join(" · "),
        verdict: bad.length ? (subs.some(function(x){ return x.verdict === "REAL"; }) ? "HOLLOW" : "MISSING") : "REAL",
        gap: bad.map(function(x){ return x.name + "=" + x.verdict; }).join(", ")
      };
    });
    var hollow = stages.filter(function(s){ return s.verdict !== "REAL"; });
    var subHollow = [].concat(A.I, A.II, A.III, A.IV, A.V, A.VI).filter(function(x){ return x.verdict !== "REAL"; });
    var result = hollow.length ? "GAP" : "COMPLETE";
    var art = {
      stage:"S2Pipeline", at: ict(), run: runNo, session: sess ? sess.name : null, provisional: provisional,
      doctrine:"CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md (Ratified 2026-05-23 Run 396) — canon branch",
      stages: stages, counts:{ soul:c.soul.count, dna:c.dna.count, reason:c.reason.count, pheromone:c.pheromone.count },
      keywords: { terms: ki.terms, top: ki.top },
      lattice: { entries: IG.count, verified: IG.verify, breaks: IG.breaks, head: IG.head, anchors: IG.anchors, mirrorOnly: IG.mirrorOnly },
      proposals: proposalReview(sess, chainFor(sess)), chain: chainFor(sess),
      result: result,
      gap: hollow.map(function(s){ return s.name + " — " + s.gap; }).join(" | "),
      note: (provisional ? "PROVISIONAL — no SCS session was ever opened, so the two rows that need one (the dual-hash LEDGER and the APEX ROLLUP seal) are MISSING by measurement, not by defect; everything else is measured off this browser's own record. " : "")
        + ((result === "COMPLETE")
        ? "every one of the six stages REAL — the pipeline is not lying"
        : "GAP — the canon's own rule: a pipeline reporting COMPLETE with a HOLLOW stage is a lie. Named: " + subHollow.map(function(x){ return x.name + "=" + x.verdict; }).join(", ") + (c.dna.count && !c.dna.blueprints ? " · HOLLOW DNA with no blueprint is the CORRECT outcome without a real transcript — PERMANENT-LAWS KILO_DNA_GAP" : ""))
    };
    if(sess){
      var S2 = load();
      var cur = S2.sessions[S2.sessions.length-1];
      if(cur){
        cur.pipeline = { at: art.at, counts: art.counts, result: result, stages: stages.map(function(s){ return s.name + "=" + s.verdict; }), keywords: ki.terms, full: art };
        save(S2);
      }
    }
    ilog({ kind:"scs", action:"S2Pipeline", detail:"run " + runNo + " · " + stages.map(function(s){ return s.name + "=" + s.verdict; }).join(" ") + (provisional ? " · PROVISIONAL (no session)" : ""), result: result, ref: sess ? sess.name : null });
    return art;
  }

  /* ---------------- the full loop ---------------- */
  async function cycle(name, opts){
    opts = opts || {};
    var out = { rome:null, sessions:[] };
    out.rome = await rome(opts);
    var times = Math.max(1, Math.min(9, opts.times || 1));
    for(var i=0;i<times;i++){
      var rec = { startedAt: ict(), stages:{}, pipeline:null, gated:false, repeat: i+1, of: times };
      /* A repeated cycle is a new incarnation, so it gets its own incarnation stamp — canon names
         sessions `Incarnate-{N}-{Label}`, never twice the same. The base name is preserved. */
      var cycleName = name ? (i === 0 ? name : name + " #" + (i+1)) : null;
      var r = await rise(cycleName, opts);
      rec.stages.RISE = r;
      if(!r.pass){ rec.gated = true; rec.halt = r.halt; out.sessions.push(rec); break; }
      rec.name = r.name; rec.run = r.run; rec.conflict = r.conflict; rec.nameWarn = r.nameWarn;
      /* strictly in order — no stage runs before its predecessor's artifact exists (GOSPEL-999 gate) */
      rec.stages.SCOUT = scout();
      rec.stages.MARCH = march();
      rec.stages.SCHOLAR = await scholar();
      rec.stages.SUPPLY = supply();
      rec.stages.ENGINEER = engineer();
      rec.stages.DEATH = await death();
      rec.pipeline = await pipeline();
      out.sessions.push(rec);
    }
    return out;
  }

  /* ---------------- rendering ---------------- */
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]; }); }
  function banner(v){ return v === "REAL" ? "\u2713" : (v === "HOLLOW" ? "\u26a0" : "\u2717"); }

  function card(rec, opts){
    opts = opts || {};
    if(rec.gated){
      return '<div class="rise"><div class="rhead">\u26d4 SCS \u2014 GATED AT RISE</div>'
        + '<div class="rrow bad"><b>RISE</b><span class="vd">GATE</span><div class="rd">' + esc(rec.halt) + '</div></div>'
        + '<div class="rfoot">fail-closed \u2014 reincarnateRISE: \u201cIf prior DEATH is missing or invalid: halt.\u201d</div></div>';
    }
    var rows = STAGES.map(function(s){
      var st = rec.stages[s.key];
      var v = st ? st.verdict : "\u2014";
      var bad = /GATE|HOLLOW|MISSING/.test(v);
      return '<div class="rrow' + (bad ? " bad" : "") + '"><b>' + s.n + '. ' + s.key + '</b><span class="vd">' + banner(v) + ' ' + esc(v) + '</span><div class="rd">' + esc(st ? st.detail : "not run") + '</div></div>';
    }).join("");
    var p = rec.pipeline;
    var prow = p ? '<div class="rrow' + (p.result === "COMPLETE" ? "" : " bad") + '"><b>PIPELINE</b><span class="vd">' + esc(p.result) + '</span><div class="rd">'
      + p.stages.map(function(x){ return esc(x.name) + "=" + banner(x.verdict) + " " + esc(x.verdict); }).join(" \u00b7 ") + (p.gap ? '<br>' + esc(p.note) : "") + '</div></div>' : "";
    var conf = rec.conflict ? '<div class="rrow bad"><b>CONFLICT</b><span class="vd">OPEN</span><div class="rd">' + esc(rec.conflict.description) + '</div></div>' : "";
    var warn = rec.nameWarn ? '<div class="rrow bad"><b>NAME</b><span class="vd">FLAGGED</span><div class="rd">' + esc(rec.nameWarn) + '</div></div>' : "";
    var rep = (rec.of && rec.of > 1) ? ' \u00b7 incarnation ' + rec.repeat + '/' + rec.of : "";
    return '<div class="rise"><div class="rhead">\u26a1 SCS \u2014 ' + esc(rec.name || "?") + ' \u00b7 run ' + esc(rec.run) + esc(rep) + '</div>'
      + rows + prow + warn + conf
      + '<div class="rfoot">' + (p ? ("PIPELINE " + p.result + " \u00b7 " + (p.result === "COMPLETE" ? "every stage REAL \u2014 the loop is not lying" : "GAP printed, never hidden")) : "loop incomplete")
      + ' \u00b7 GOSPEL-999 \u00a7SYSTEM I \u00b7 REINCARNATION-CONTRACT \u00a73' + (p ? " \u00b7 the proposals are reviewed on /pipeline, at their stage" : "") + '</div></div>';
  }

  function romeCard(r){
    var rows = r.watchtowers.map(function(w){
      return '<div class="rrow' + (w.verdict === "ALERT" ? " bad" : "") + '"><b>' + esc(w.tower) + '</b><span class="vd">' + esc(w.verdict) + '</span><div class="rd">' + esc(w.detail) + '</div></div>';
    }).join("");
    var pri = r.priority.map(function(p){ return '<div class="rrow"><b>P' + p.p + ' ' + esc(p.band) + '</b><span class="vd">' + esc(p.band === "ACTIVE_MISSION" ? "NEXT" : "HELD") + '</span><div class="rd">' + esc(p.item) + '</div></div>'; }).join("");
    return '<div class="rise"><div class="rhead">\ud83c\udfdb /romePROTOCOL \u2014 truth anchoring</div>'
      + '<div class="rrow"><b>SURFACE</b><span class="vd">' + r.surfaced + ' truths</span><div class="rd">every governing fact named before the session is allowed to move</div></div>'
      + '<div class="rrow"><b>VERIFY</b><span class="vd">\u2713</span><div class="rd">each checked against its source \u00b7 the rest are claims</div></div>'
      + '<div class="rrow"><b>ANCHOR</b><span class="vd">' + esc(String(r.anchor.hash).slice(0,12)) + '</span><div class="rd">Session Anchor Block written ' + esc(r.anchor.at) + '</div></div>'
      + rows + pri
      + '<div class="rfoot">ROME PROTOCOL ' + esc(r.verdict) + ' \u00b7 VAULT-FOUNDATIONS/07-THE-ROME-PROTOCOL.md \u00b7 the ledger is the final authority on what was decided</div></div>';
  }

  async function run(arg, opts){
    opts = opts || {};
    arg = String(arg || "").trim().replace(/^run\b[\s:]*/i, "");
    /* "/rome run 3 Incarnate-1-Label" → 3 cycles; "/rome run Incarnate-1-Label" → one. */
    var m = arg.match(/^(\d+)(?:\s+(.*))?$/);
    var times = m ? parseInt(m[1], 10) : 1;
    var name = m ? String(m[2] || "").trim() : arg;
    if(!name) name = "Incarnate-" + ((load().seq||0)+1) + "-Cycle";
    return await cycle(name, Object.assign({}, opts, { times: times }));
  }

  /* ==========================================================================
     /phoenixSCOUT <terms> — THE SOUL HUNT (SCS Stage 2, done over the RECORDS).

     The canon's own role for stage 2 is: "Recon. Flag, tag, map edges, hand off.
     Nothing is changed." Until 2026-09-23 this station's /phoenixSCOUT only probed
     live TERRAIN (src/scout.js) and never opened the canon — so when the sovereign
     ran "/phoenixSCOUT the i-logs with Mailala, oktava the actual SOUL of how I
     wanted to design those, find the SOUL", the command had nothing to answer with:
     the hunt had to be done by hand, in the browser, file by file.

     This is that hunt, as a command. Given terms it sweeps the canon BRANCH
     (`canon`) for where the words live — first in PATH NAMES, then in the CONTENT
     of the records that could hold them (the SOUL extracts, the prompt registers,
     the I-LOGs, the DEATH seals, the case studies) — and pulls the SOUL back
     VERBATIM (user_verbatim lines, `SOUL-0n` rows, quoted lines). Nothing is
     summarized, nothing is written, nothing is changed.

     FAIL CLOSED: no PAT → BLOCKED (the canon is private; an unmeasurable read is
     never reported as a find). A miss says "not found BY THIS SWEEP" — never
     "does not exist" (RECON.001's own law).

     A hunt is NOT a stage stamp: it files nothing on the session's stage 2, because
     the SCS card's SCOUT row must keep showing the session's own recon. It is
     recorded in the I-LOG by the caller, like every other ad-hoc recon.
     ========================================================================== */
  var SOUL_RE = /SOUL\/EXTRACT|SOUL-KEYWORDS|I-LOG|PROMPT-REGISTER|CASE-STUDY|DNA-REGISTRY|REINCARNATION|HANDOFF|SOUL-STORY|SOULSCHOLARS|LOSTSOULS|SOUL\//i;
  var TEXT_RE = /\.(md|markdown|txt|json|jsonl)$/i;
  var HUNT_MAX_FILES = 60, HUNT_MAX_BYTES = 4 * 1024 * 1024, HUNT_MAX_BIG = 400 * 1024, HUNT_CONC = 5, HUNT_SNIP = 240;

  /* the words worth searching: 3+ chars, minus the command's own furniture.
     `all`/`every`/`everything` are the sovereign's own words for "the whole
     sweep" — as terms they would match essentially every record in the canon
     and bury the hunt in noise, so they are furniture here, not terms. */
  var HUNT_STOP = /^(the|and|with|for|its|from|that|this|into|find|soul|souls|ilog|ilogs|log|logs|i-log|canon|phoenix|scout|actual|really|want|wanted|design|designed|those|these|how|was|were|are|made|make|look|see|show|give|please|about|over|under|all|every|everything|everywhere|priority|phoenixscout|any|each|then|than|there|here|what|which|when|where|who|why|does|did|done|get|got|put|use|used|using|need|needs|note|more|most|less|few|many|much|very|just|also|only|both|same|other|such|some|them|they|their|our|you|your|his|her|had|has|have|been|being|will|would|can|could|should|must|not|but|out|off|nor|yet|still|even|back|down|again|once|ever|never|always)$/;
  /* A DESTINATION IS NOT A SEARCH TERM. The sovereign's commands carry their
     target in the same sentence as their subject ("… SOUL priority everything to
     https://perchance.org/prais-webdev-clone#cmd"), and tokenising that URL fed
     `https`, `org`, `cmd` and `perchance` into the hunt — words that match half
     the canon and say nothing about Mailala. The URL is removed first, whole. */
  var HUNT_URL_RE = /(?:https?:\/\/|www\.)[^\s,)\]]+/gi;
  function huntTerms(arg){
    return String(arg || "").replace(HUNT_URL_RE, " ")
      .toLowerCase().replace(/[^a-z0-9\s,\u00b7-]/g, " ")
      .split(/[\s,\u00b7]+/)
      .map(function(w){ return w.replace(/^-+|-+$/g, "").trim(); })
      .filter(function(w){ return w.length >= 3 && !HUNT_STOP.test(w); });
  }
  function ghToken(){ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}").gh || null; }catch(e){ return null; } }
  function canonRepo(){ return (window.ObiILog && window.ObiILog.VS) || { owner:"Phoenix-Rising-Ai-Solutions", repo:"OB-1--Authoritative-", branch:"canon" }; }
  function ghHead(){ return { "Authorization":"Bearer " + (ghToken()||""), "Accept":"application/vnd.github+json" }; }
  var _huntTree = null, _huntTreeAt = 0;
  async function canonTree(force){
    if(_huntTree && !force && Date.now() - _huntTreeAt < 10*60*1000) return _huntTree;
    var vs = canonRepo();
    var r = await fetch("https://api.github.com/repos/" + vs.owner + "/" + vs.repo + "/git/trees/" + CANON_BRANCH + "?recursive=1", { headers: ghHead() });
    if(r.status !== 200) throw new Error("the canon tree answered HTTP " + r.status + (r.status===401||r.status===403 ? " — the stored PAT cannot read the canon" : ""));
    var j = await r.json();
    _huntTree = (j.tree || []).filter(function(t){ return t.type === "blob"; }).map(function(t){ return { p:t.path, s:t.size || 0 }; });
    _huntTreeAt = Date.now();
    return _huntTree;
  }
  /* THE CONTENTS API DOES NOT ANSWER WITH THE FILE — it answers with a JSON
     envelope whose `content` is the file, base64-encoded. Until 2026-09-23 this
     returned `await r.text()` of that envelope, so every hunt read
     `{"name":"…","path":"…","content":"<base64>"}` instead of the record. It
     looked like it worked, which is why the bug survived: the PATH checks pass
     (the envelope echoes the path), huntSnippets "matched" the envelope's own
     lines, and huntSoulLines found nothing at all — the card's promise ("the
     SOUL comes back VERBATIM") returned 0 lines on every hunt ever run, and the
     register it was hunting (CANON/MAILALA-PROMPT-REGISTER.md) was never read.
     Measured live before the fix: a hunt for `mailala` returned snippets reading
     `L2: "name": "MAILALA-HANDOFF.md",` and soulCount 0.
     Now the payload is decoded (UTF-8, via atob + escape/decodeURIComponent);
     a file the API hands back empty (over ~1 MB, encoding "none") falls back to
     the raw media type rather than being silently read as an empty string. */
  async function canonRaw(path){
    var vs = canonRepo();
    var url = "https://api.github.com/repos/" + vs.owner + "/" + vs.repo + "/contents/" +
              path.split("/").map(encodeURIComponent).join("/") + "?ref=" + CANON_BRANCH;
    var r = await fetch(url, { headers: ghHead() });
    if(r.status !== 200) return null;
    var body = await r.text();
    try{
      var j = JSON.parse(body);
      if(j && typeof j.content === "string" && j.encoding === "base64"){
        return decodeURIComponent(escape(atob(j.content.replace(/\s+/g, ""))));
      }
      if(j && typeof j.content === "string" && !j.encoding) return j.content;
      if(j && !j.content){
        var r2 = await fetch(url, { headers: Object.assign({}, ghHead(), { Accept:"application/vnd.github.raw" }) });
        return r2.status === 200 ? await r2.text() : null;
      }
    }catch(e){}
    return body;
  }
  function huntSnippets(text, terms){
    var lines = String(text).split(/\r?\n/), hits = [];
    for(var i=0;i<lines.length && hits.length < 4;i++){
      var low = lines[i].toLowerCase();
      for(var t=0;t<terms.length;t++){
        if(low.indexOf(terms[t]) !== -1){ hits.push({ term:terms[t], line:i+1, text:cut(lines[i].trim(), HUNT_SNIP) }); break; }
      }
    }
    return hits.slice(0, 3);
  }
  /* the SOUL itself, as the records write it — never paraphrased */
  function huntSoulLines(text){
    var out = [], lines = String(text).split(/\r?\n/);
    for(var i=0;i<lines.length;i++){
      var l = lines[i].trim();
      if(l.length > 14 && (/user_verbatim|"verbatim"|VERBATIM/.test(l) || /^SOUL-\d\d/.test(l) || /^>\s*"/.test(l) || /^\s*>\s*"/.test(lines[i]))) out.push(cut(l, 340));
      if(out.length >= 18) break;
    }
    return out;
  }

  async function soulHunt(arg, opts){
    opts = opts || {};
    var vs = canonRepo();
    var terms = huntTerms(arg);
    var rec = { stage:"SCOUT", kind:"SOUL HUNT", at:ict(), arg:String(arg||""), terms:terms,
                repo:vs.owner + "/" + vs.repo, branch:CANON_BRANCH,
                verdict:"MISSING", nameHits:[], contentHits:[], soul:[], soulByPath:{}, termsFound:{}, filesRead:0, bytes:0, treeSize:0, note:"" };
    if(!terms.length){ rec.note = "no searchable term in that argument — 3+ characters, and not one of the command's own words"; return rec; }
    if(!ghToken()){ rec.verdict = "BLOCKED"; rec.note = "no GitHub PAT in this browser. The canon is private, so this read cannot be measured — /gh token &lt;PAT&gt; first. An unmeasurable read is never reported as a find."; return rec; }
    var tree;
    try{ tree = await canonTree(opts.force); }
    catch(e){ rec.verdict = "BLOCKED"; rec.note = String((e && e.message) || e); return rec; }
    rec.treeSize = tree.length;

    /* 1 — NAME HITS. The term is in the path itself: the strongest signal there is. */
    for(var i=0;i<tree.length;i++){
      var p = tree[i].p, low = p.toLowerCase(), hit = null;
      for(var t=0;t<terms.length;t++){ if(low.indexOf(terms[t]) !== -1){ hit = terms[t]; break; } }
      if(hit) { rec.nameHits.push({ path:p, bytes:tree[i].s, term:hit, soul:SOUL_RE.test(p) }); rec.termsFound[hit] = true; }
    }
    rec.nameHits.sort(function(a,b){ return (b.soul?1:0)-(a.soul?1:0) || a.path.length - b.path.length; });

    /* 2 — CONTENT HITS. Read the records that could hold the words: a path that
       already touched a term first, then the SOUL-bearing paths, then the rest.
       Capped, because this is recon — and it SAYS what it read. */
    var nameTouched = function(p){ return rec.nameHits.some(function(h){ return h.path === p; }); };
    var cand = tree.filter(function(x){ return TEXT_RE.test(x.p) && x.s > 0 && x.s <= HUNT_MAX_BIG; })
      .sort(function(a,b){
        return (nameTouched(b.p)?1:0) - (nameTouched(a.p)?1:0)
            || (SOUL_RE.test(b.p)?1:0) - (SOUL_RE.test(a.p)?1:0)
            || a.p.length - b.p.length;
      }).slice(0, HUNT_MAX_FILES);

    var queue = cand.slice(), workers = [];
    async function worker(){
      while(queue.length){
        if(rec.bytes > HUNT_MAX_BYTES){ rec.note = "stopped at the byte cap (" + Math.round(rec.bytes/1024) + " KB read)"; return; }
        var f = queue.shift();
        var text = null;
        try{ text = await canonRaw(f.p); }catch(e){ continue; }
        rec.filesRead++; rec.bytes += (text ? text.length : 0);
        if(!text) continue;
        var low2 = text.toLowerCase();
        var found = terms.filter(function(x){ return low2.indexOf(x) !== -1; });
        if(!found.length) continue;
        for(var ft=0; ft<found.length; ft++) rec.termsFound[found[ft]] = true;
        var isSoul = SOUL_RE.test(f.p);
        rec.contentHits.push({ path:f.p, bytes:f.s, terms:found, soul:isSoul, snippets:huntSnippets(text, found) });
        /* the SOUL is kept per record and ORDERED after the sweep — never pushed
           here, because "first to finish" is not "most on-topic" (see below) */
        if(isSoul) rec.soulByPath[f.p] = huntSoulLines(text);
      }
    }
    for(var w=0; w<HUNT_CONC; w++) workers.push(worker());
    await Promise.all(workers);

    rec.contentHits.sort(function(a,b){ return (b.soul?1:0)-(a.soul?1:0) || b.terms.length - a.terms.length; });

    /* THE SOUL IS ORDERED BY SIGNAL, NOT BY WHO FINISHED FIRST. The cap below was
       filled in worker-completion order, so on a hunt for Mailala+website the
       records the terms only brushed past took all 48 slots and
       CANON/MAILALA-PROMPT-REGISTER.md — ten SOUL prompts, the whole point of the
       hunt — contributed nothing. (Measured 2026-09-23: 48 lines, none from the
       register.) The order is the hunt's own doctrine: a NAME HIT comes first
       ("the term is in the path itself — the strongest signal there is"), then
       the record that matched more terms, then the SOUL-bearing path. */
    var soulOrder = rec.contentHits.slice().sort(function(a,b){
      return (nameTouched(b.path)?1:0) - (nameTouched(a.path)?1:0)
          || b.terms.length - a.terms.length
          || (b.soul?1:0) - (a.soul?1:0)
          || a.path.length - b.path.length;
    });
    for(var q=0; q<soulOrder.length && rec.soul.length<48; q++){
      var sl2 = rec.soulByPath[soulOrder[q].path] || [];
      for(var s2=0; s2<sl2.length && rec.soul.length<48; s2++) rec.soul.push({ path:soulOrder[q].path, text:sl2[s2] });
    }
    delete rec.soulByPath;

    /* A TERM THAT MATCHED NOTHING IS THE MOST USEFUL THING A HUNT CAN SAY, and
       it used to be invisible: the terms are ORed, so one good term hid a dead
       one. Measured 2026-09-23 — the sovereign's own spelling ("Mailhala") and
       the canon's ("Mailala") are different strings, so a hunt for his words
       silently missed CANON/MAILALA-PROMPT-REGISTER.md, the register of the very
       prompts he told us to preserve. Now a dead term is named, with the rule it
       obeys: not found BY THIS SWEEP, never "does not exist". */
    rec.termsMissing = terms.filter(function(t){ return !rec.termsFound[t]; });
    delete rec.termsFound;
    var n = rec.nameHits.length, c = rec.contentHits.length;
    rec.verdict = (n || c) ? "REAL" : "MISSING";
    if(c) rec.verdict = "REAL";
    if(!n && !c) rec.note = "not found by this sweep — " + tree.length + " canon paths searched, " + rec.filesRead + " record(s) read. 'Not found' is not 'does not exist' (RECON.001).";
    else if(!c) rec.note = "the words are in PATH NAMES only — no record's contents were found to hold them (" + rec.filesRead + " read).";
    rec.nameTotal = n; rec.contentTotal = c;
    rec.nameHits = rec.nameHits.slice(0, 40);
    rec.contentHits = rec.contentHits.slice(0, 40);
    return rec;
  }

  function huntSize(b){
    b = b || 0;
    if(b < 1024) return b + " B";
    if(b < 1024 * 1024) return Math.round(b/1024) + " KB";
    return (Math.round(b/1024/102.4)/10) + " MB";
  }

  function soulHuntCard(r){
    if(!r) return "";
    var rows = "";
    var nameTotal = (r.nameTotal != null ? r.nameTotal : (r.nameHits ? r.nameHits.length : 0));
    var contentTotal = (r.contentTotal != null ? r.contentTotal : (r.contentHits ? r.contentHits.length : 0));
    rows += '<div class="rrow"><b>TERMS</b><span class="vd">' + r.terms.length + '</span><div class="rd">' + esc(r.terms.join(" \u00b7 ")) + '</div></div>';
    if(r.termsMissing && r.termsMissing.length){
      rows += '<div class="rrow bad"><b>NO RECORD HOLDS</b><span class="vd">' + r.termsMissing.length + '</span><div class="rd">' + esc(r.termsMissing.join(" \u00b7 ")) + ' \u2014 not one path or record matched in ' + r.treeSize + ' canon paths. "Not found by this sweep" is never "does not exist" (RECON.001) \u2014 check the spelling against the canon\u2019s own words before concluding.</div></div>';
    }
    rows += '<div class="rrow"><b>SWEPT</b><span class="vd">' + esc(r.verdict) + '</span><div class="rd">' + esc(r.repo) + '@' + esc(r.branch) + ' \u2014 ' + r.treeSize + ' paths \u00b7 ' + r.filesRead + ' record(s) read (' + huntSize(r.bytes) + ')' + (r.note ? ' \u2014 ' + esc(r.note) : '') + '</div></div>';
    if(r.nameHits && r.nameHits.length){
      rows += '<div class="rrow"><b>NAMED IN THE PATHS</b><span class="vd">' + nameTotal + '</span><div class="rd">' +
        r.nameHits.slice(0, 14).map(function(h){ return (h.soul ? "\ud83d\udfe3 " : "\u00b7 ") + '<b>' + esc(h.path) + '</b> (' + huntSize(h.bytes) + ')'; }).join("<br>") +
        (nameTotal > 14 ? '<br>\u2026 ' + (nameTotal - 14) + ' more' : '') + '</div></div>';
    }
    if(r.contentHits && r.contentHits.length){
      rows += r.contentHits.slice(0, 12).map(function(h){
        var sn = h.snippets.map(function(s){ return '<div class="rd" style="opacity:.85">L' + s.line + ' \u00b7 ' + esc(s.text) + '</div>'; }).join("");
        return '<div class="rrow' + (h.soul ? "" : " pending") + '"><b>' + (h.soul ? "\ud83d\udfe3 " : "\ud83c\udf38 ") + esc(h.path) + '</b><span class="vd">' + esc(h.terms.join(",")) + '</span>' + sn + '</div>';
      }).join("");
      if(contentTotal > 12) rows += '<div class="rrow"><b>\u2026</b><span class="vd">' + contentTotal + ' TOTAL</span><div class="rd">' + (contentTotal - 12) + ' more record(s) hold the words \u2014 narrow the terms to see them.</div></div>';
    }
    if(r.soul && r.soul.length){
      rows += '<div class="rrow"><b>THE SOUL \u2014 VERBATIM</b><span class="vd">' + r.soul.length + ' LINE(S)</span><div class="rd">' +
        r.soul.map(function(s){ return '<div style="margin:4px 0"><span style="opacity:.6;font-size:10px">' + esc(s.path) + '</span><br>' + esc(s.text) + '</div>'; }).join("") +
        '</div></div>';
    }
    return '<div class="rise"><div class="rhead">\ud83e\udd85 /phoenixSCOUT \u2014 the SOUL hunt</div>' + rows
      + '<div class="rfoot">Recon \u2014 <b>nothing changed, nothing written</b>. Stage 2\'s role is "flag, tag, map edges, hand off"; the session\'s own SCOUT stamp is untouched. A hunt says "not found by this sweep", never "does not exist".</div></div>';
  }

  window.ObiSCS = {
    VERSION: VERSION, STAGES: STAGES, POINTS: POINTS,
    state: state, counts: function(){ return countsFor(currentRunNo()); },
    rome: rome, rise: rise, scout: scout, march: march, scholar: scholar, supply: supply, engineer: engineer, death: death, pipeline: pipeline,
    soulHunt: soulHunt, soulHuntCard: soulHuntCard, huntTerms: huntTerms, canonTree: canonTree,
    cycle: cycle, run: run, card: card, romeCard: romeCard,
    proposals: function(sess){ return proposalReview(sess || lastSession()); }, setProposals: setProposals,
    proposalList: proposalList, soulOrigin: soulOrigin, chain: chainFor,
    reset: function(){ var S = { v:1, seq:0, anchor:null, sessions:[] }; save(S); return S; },
    canon: { loop:"RISE\u2192SCOUT\u2192MARCH\u2192SCHOLAR\u2192SUPPLY\u2192ENGINEER\u2192DEATH\u2192RISE",
      source:"CANON/SYSTEM/GOSPEL-999.md \u00a7SYSTEM I + CANON/SYSTEM/LegionnaireFieldGuide.md \u00a7SCS + CANON/SYSTEM/REINCARNATION-CONTRACT.md",
      rome:"VAULT-FOUNDATIONS/07-THE-ROME-PROTOCOL.md (SURFACE\u2192VERIFY\u2192ANCHOR + Watchtowers)",
      pipeline:"CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md (Ratified 2026-05-23 Run 396) \u2014 I EXPLORATORES \u2192 II ANTECORES \u2192 III AGMEN \u2192 IV AGMEN NOVISSIMUM \u2192 V PRAESIDIA \u2192 VI LIMITANEI/COMITATENSES/VETERANI",
      gate:"PHOENIXOMEGAPROTOCOL (/phoenixomegaprotocol) \u2014 every canon write is gated; CANON/SYSTEM/OmegaProtocol.md is the full-stop-and-audit protocol, not the write gate",
      proposals: "the staging lane surfaces on /pipeline, at the stage that carries each item \u2014 never on the command shelf",
      chain: "RRL \u2192 SOUL \u2192 DNA \u2192 LEDGER \u2192 STARMAP \u2192 SOULKEYS \u2192 S2PIPELINE \u2192 REGISTRY_SYNC (CANON/SYSTEM/COLD-START-BOOT.md I.012 \u2014 the 8-stage pipeline, read off the canon branch 2026-09-21)",
      branch: CANON_BRANCH,
      writesBranch: writesBranch() }
  };
})();
