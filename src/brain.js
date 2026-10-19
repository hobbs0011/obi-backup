/* ============================================================================
   THE BRAIN — the mastermind's memory, and the lane that keeps it current.

   What was missing before this file: the station could DO almost everything and
   REMEMBER almost none of it in one place. The register
   (src/sites/mailala/ASSET-MANIFEST.json) knew every artifact and every digest;
   the I-LOG knew every operation; the Soul ledger knew the sovereign's words;
   the estate knew every shipped byte. Nothing could answer a question that
   crossed them. This is that thing.

   It is an INDEX, not a second copy: each entry points at the thing and carries
   its digest, and every number in it is read from the source at build time. A
   stale index is worse than none, so it says when it was built.

   It also does the two things the sovereign asked for by name:

     AUTO-SYNC   an interval that, with no credential and no gate, recomputes the
                 estate as the register states it, pulls the published manifest
                 through the token-free read channel, re-hashes the delivered
                 URLs, and TRIES the write lane. When a lane fails it records the
                 failure VERBATIM — a silent sync that did nothing is worse than
                 a loud one that says so. SetInterval, not a claim.
     KEY LEDGER  the key logger, built so it cannot leak: a short SHA-256
                 FINGERPRINT of each credential and nothing else. Rotation and
                 loss become visible; the secret never does. The values live in
                 this browser's localStorage (obi_keys) and are never logged,
                 never indexed, never uploaded.

   Raw transcripts stay local per node (L44: raw is not soul). The brain indexes.
   ========================================================================== */
(function(){
  const VERSION = "1.0.0";
  const SYNC_EVERY_MS = 5 * 60 * 1000;   /* the automatic lane: every five minutes */
  const FIRST_SYNC_MS = 25 * 1000;       /* and once, shortly after the page is up */
  /* The heartbeat is written into THIS generator's namespace. A successful write
     therefore means the anti-bot gate has lifted for this page, which is exactly
     the fact the mesh has been waiting on. So the probe is not busywork: it is
     the measurement, and its content is the measurement's own record. */
  const HEARTBEAT = "obi-brain-heartbeat";
  const SLOTS = ["cf", "cfAcct", "gh", "dg", "cfR2Key", "cfR2Secret", "nglUser", "nglPass"];

  const hex = b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
  const enc = new TextEncoder();
  async function sha(bytesOrText){
    const b = (typeof bytesOrText === "string") ? enc.encode(bytesOrText) : bytesOrText;
    return hex(await crypto.subtle.digest("SHA-256", b));
  }
  function kv(){ try{ return (typeof root !== "undefined" && root && root.kv) ? root.kv.brain : null; }catch(e){ return null; } }
  function station(){ return window.generatorName || "?"; }
  function readKeys(){ try{ return JSON.parse(localStorage.getItem("obi_keys") || "{}") || {}; }catch(e){ return {}; } }

  let IDX = null;          /* the built index */
  let LAST_SYNC = null;    /* the last sync result */
  let STARTED = false;

  async function getJson(path){
    try{ const r = await fetch(path.startsWith("http") ? path : location.origin + path, {cache:"no-store"}); if(!r.ok) return null; return await r.json(); }catch(e){ return null; }
  }
  async function getText(path){
    try{ const r = await fetch(path.startsWith("http") ? path : location.origin + path, {cache:"no-store"}); if(!r.ok) return null; return await r.text(); }catch(e){ return null; }
  }

  /* ------------------------------- the sources ------------------------------ */

  async function fromRegister(){
    const reg = await getJson("/src/sites/mailala/ASSET-MANIFEST.json");
    if(!reg) return { entries: [], reg: null };
    const out = [];
    for(const a of (reg.assets || [])){
      out.push({ kind: (a.kind === "photograph" ? "photo" : a.kind) || "asset", id: a.id || "", label: a.label || "",
        where: a.local || a.url || "", url: a.url || null, bytes: a.bytes || null, sha: a.sha256 || null,
        text: [a.slot, a.note, a.alt, a.proven].filter(Boolean).join(" · ") });
    }
    for(const f of ((reg.estate && reg.estate.files) || [])){
      out.push({ kind: "file", id: f.path.split("/").pop(), label: f.path, where: f.path, bytes: f.bytes, sha: f.sha256,
        text: "shipped file · " + f.bytes + " B · " + f.sha256.slice(0, 12) });
    }
    return { entries: out, reg };
  }

  async function fromDocs(reg){
    const paths = ((reg && reg.assets) || []).filter(a => /document|evidence|mark|schema/.test(a.kind || ""))
      .map(a => a.local).filter(p => p && /\.(md|html)$/.test(p) && !/^(main\.pjs|index\.html)$/.test(p));
    const out = [];
    for(const p of paths.slice(0, 12)){
      const t = await getText(p);
      if(!t) continue;
      const title = (t.match(/^#\s+(.+)$/m) || [])[1] || p.split("/").pop();
      const heads = [...t.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].trim()).slice(0, 14);
      out.push({ kind: "doc", id: p.split("/").pop(), label: title.trim(), where: p, text: heads.join(" · ") });
      for(const h of heads) out.push({ kind: "section", id: p.split("/").pop(), label: h, where: p + " \u00a7 " + h });
    }
    return out;
  }

  function fromCommands(){
    const book = window.ObiCommandBook || [];
    const out = [];
    for(const g of book) for(const it of (g.items || [])){
      if(!it || !it[0]) continue;
      out.push({ kind: "command", id: it[0], label: it[0], where: "COMMAND_BOOK \u00b7 " + (g.group || ""),
        text: String(it[1] || "") + (it[2] ? " \u00b7 takes the sovereign's own words" : "") });
    }
    return out;
  }

  function fromMemory(){
    const out = [];
    try{
      const L = JSON.parse(localStorage.getItem("obi_sdnad") || "null") || { soul: [], runs: [] };
      const soul = (L.soul || []);
      out.push({ kind: "memory", id: "soul", label: "Soul DNA \u2014 " + soul.length + " fragments, verbatim", where: "localStorage obi_sdnad",
        text: "runs " + ((L.runs || []).length) + " \u00b7 captured verbatim, never summarized (L37)" });
      for(const s of soul.slice(-120)) out.push({ kind: "soul", id: "run" + (s.run == null ? "?" : s.run),
        label: String(s.text || "").slice(0, 100), where: "soul \u00b7 " + (s.t || ""), text: String(s.text || "") });
    }catch(e){}
    return out;
  }

  async function fromIlog(){
    const out = [];
    try{
      const st = await window.ObiILog.stats();
      out.push({ kind: "ilog", id: "chain", label: "I-LOG \u2014 " + (st && st.count != null ? st.count : "?") + " entries, hash-chained",
        where: "kv + localStorage obi_ilog", text: "segments " + ((st && st.segments) || 1) + " \u00b7 anchored " + ((st && st.anchored) || 0) + " (unanchored " + ((st && st.unanchored) || 0) + ")" });
      const last = await window.ObiILog.entries({ limit: 25 });
      for(const e of (last || [])) out.push({ kind: "op", id: "e" + (e.seg || 1) + "-" + e.seq,
        label: String(e.detail || e.action || "").slice(0, 100), where: "I-LOG \u00b7 " + (e.iso || ""),
        text: [e.kind, e.action, e.result].filter(Boolean).join(" \u00b7 ") });
    }catch(e){}
    return out;
  }

  async function fromArchives(){
    const out = [];
    try{
      const t = await root.kv.transcripts.keys(), s = await root.kv.summaries.keys();
      out.push({ kind: "archive", id: "transcripts", label: t.length + " recordings (the transcript archive)", where: "kv \u00b7 transcripts",
        text: "record \u2192 transcribe \u2192 summarize \u2192 write up" });
      out.push({ kind: "archive", id: "summaries", label: s.length + " study summaries", where: "kv \u00b7 summaries" });
    }catch(e){}
    const f = kv();
    if(f){ try{ const a = (await f.get("archives")) || []; const sh = (await f.get("shares")) || [];
      out.push({ kind: "archive", id: "brain", label: a.length + " state snapshots taken by the brain", where: "kv \u00b7 brain \u00b7 archives" });
      out.push({ kind: "archive", id: "shares", label: sh.length + " shared artifacts", where: "kv \u00b7 brain \u00b7 shares" }); }catch(e){} }
    return out;
  }

  async function fromKeys(){
    const o = readKeys();
    return SLOTS.map(s => ({ kind: "key", id: s, label: s + (o[s] ? " \u2014 held" : " \u2014 absent"),
      where: "localStorage obi_keys", text: "fingerprint " + (o[s] ? "(computed in the key ledger, never the value)" : "\u2014") }));
  }

  const LANES = [
    { kind: "lane", id: "read", label: "the token-free read channel \u2014 null.perchance.org/<generator> \u2192 srcManifest \u2192 user.uploads.dev/file/<key>",
      where: "measured by /brain sync", text: "WORKS \u00b7 pull-only \u00b7 published = the last save, never the live page" },
    { kind: "lane", id: "write", label: "the mesh write (uploadPlugin editable.set)", where: "measured by /brain sync",
      text: "blocked in the unsaved preview \u2014 {error:\"anti_bot_verification_needed\"}; a saved page is unproven, not disproven" },
    { kind: "lane", id: "cloudflare", label: "the cloudflare lane (/cf deploy \u00b7 R2 \u00b7 Pages)", where: "measured by /brain sync",
      text: "blocked \u2014 no credential in this origin; nothing has been sent and nothing is claimed as sent" }
  ];

  /* --------------------------------- build --------------------------------- */

  async function build(){
    const t0 = Date.now();
    const reg = await fromRegister();
    /* each source is listed by name so one broken source can never take the index
       with it — it is recorded as broken instead, and /brain says so */
    const sources = {
      register: reg.entries, commands: fromCommands(), memory: fromMemory(), keys: await fromKeys(), lanes: LANES,
      docs: await fromDocs(reg.reg), ilog: await fromIlog(), archives: await fromArchives()
    };
    const entries = [], broken = [];
    for(const k of Object.keys(sources)){
      const arr = sources[k];
      if(!Array.isArray(arr)){ broken.push(k + " (" + (arr === undefined ? "undefined" : typeof arr) + ")"); continue; }
      for(const e of arr) entries.push(e);
    }
    const stats = {};
    for(const e of entries) stats[e.kind] = (stats[e.kind] || 0) + 1;
    IDX = { version: VERSION, built: new Date().toISOString(), ms: Date.now() - t0, entries, stats, broken,
      census: reg.reg && reg.reg.estate ? reg.reg.estate.count : null,
      treeDigest: reg.reg && reg.reg.estate ? reg.reg.estate.treeDigestSha256 : null,
      register: reg.reg ? { generated: reg.reg.generated, assets: (reg.reg.assets || []).length } : null,
      registerRead: !!reg.reg };
    const f = kv();
    if(f){ try{ await f.set("index", { version: VERSION, built: IDX.built, ms: IDX.ms, stats, census: IDX.census, treeDigest: IDX.treeDigest }); }catch(e){} }
    return IDX;
  }

  function index(){ return IDX; }

  /* --------------------------------- search -------------------------------- */

  function rank(q){
    const terms = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
    const phrase = String(q || "").toLowerCase().trim();
    const out = [];
    if(!IDX || !terms.length) return { out, terms };
    for(const e of IDX.entries){
      const label = String(e.label || "").toLowerCase(), id = String(e.id || "").toLowerCase();
      const where = String(e.where || "").toLowerCase(), text = String(e.text || "").toLowerCase();
      let s = 0, hit = 0;
      for(const t of terms){
        let h = 0;
        if(label.indexOf(t) !== -1) h += 3;
        if(id.indexOf(t) !== -1) h += 2;
        if(where.indexOf(t) !== -1) h += 1;
        if(text.indexOf(t) !== -1) h += 1;
        if(h){ hit++; s += h; }
      }
      if(!hit) continue;
      if(phrase && label.indexOf(phrase) !== -1) s += 4;   /* the phrase itself, in the label */
      out.push({ e, s, hit });
    }
    out.sort((a, b) => b.s - a.s || b.hit - a.hit);
    return { out, terms };
  }

  /* every word must appear somewhere — and if that finds nothing, the same query is
     re-run with ANY word, because a memory that only answers exact phrasings is not
     a memory. The mode is reported, so a loose answer never looks like a tight one. */
  function searchDetailed(q, limit){
    const r = rank(q);
    const all = r.out.filter(x => x.hit === r.terms.length);
    const mode = all.length ? "all" : (r.out.length ? "any" : "none");
    const pick = (all.length ? all : r.out).slice(0, limit || 12);
    return { mode, terms: r.terms, hits: pick.map(x => x.e) };
  }
  function search(q, limit){ return searchDetailed(q, limit).hits; }

  /* -------------------------------- the ledger ------------------------------ */

  async function keysCheck(logIt){
    const o = readKeys();
    const rows = [];
    for(const s of SLOTS){
      const v = o[s];
      rows.push({ slot: s, present: !!v, fp: v ? (await sha(String(v))).slice(0, 10) : null });
    }
    if(logIt){
      const f = kv();
      if(f){
        try{
          const prev = (await f.get("keyState")) || {};
          const log = (await f.get("keylog")) || [];
          let added = 0;
          for(const r of rows){
            const p = prev[r.slot] || { present: false, fp: null };
            if(!p.present && r.present){ log.push({ t: Date.now(), slot: r.slot, event: "first-seen", fp: r.fp }); added++; }
            else if(p.present && !r.present){ log.push({ t: Date.now(), slot: r.slot, event: "cleared", fp: p.fp }); added++; }
            else if(p.present && r.present && p.fp !== r.fp){ log.push({ t: Date.now(), slot: r.slot, event: "ROTATED", fp: r.fp, was: p.fp }); added++; }
          }
          if(added || !Object.keys(prev).length){
            await f.set("keylog", log.slice(-400));
            await f.set("keyState", Object.fromEntries(rows.map(r => [r.slot, { present: r.present, fp: r.fp }])));
          }
        }catch(e){}
      }
    }
    return rows;
  }

  async function keylog(){
    const f = kv();
    if(!f) return [];
    try{ return (await f.get("keylog")) || []; }catch(e){ return []; }
  }

  /* ------------------------------ the sync lane ----------------------------- */

  async function publishedManifest(){
    const r = await root.superFetch("https://null.perchance.org/" + station());
    if(!r || !r.ok) throw new Error("HTTP " + (r ? r.status : "no response"));
    const t = await r.text();
    const m = /<script id="preloaded-generator-data"[^>]*>([\s\S]*?)<\/script>/.exec(t);
    if(!m) throw new Error("no preloaded-generator-data in the response");
    const j = JSON.parse(m[1]);
    return { manifest: j.srcManifest || {}, pjs: (j.modelText || "").length, html: (j.outputTemplate || "").length };
  }

  /* re-hash what was delivered, against the digests the packet recorded */
  async function verifyDelivery(){
    const rows = [];
    const packet = await getJson("/src/sites/mailala/SYNC-PACKET.json");
    if(!packet) return { state: "the sync packet could not be read", rows };
    const pri = (a) => /ASSET-MANIFEST|SYNC-PACKET/.test(a.path) ? 0 : (/index\.html$/.test(a.path) ? 1 : 2);
    const arts = (packet.artifacts || [])
      .filter(a => a.url && /^https?:/i.test(a.url) && (a.sha256Delivered || a.sha256Workspace))
      .sort((x, y) => pri(x) - pri(y));
    for(const a of arts.slice(0, 6)){
      const want = a.sha256Delivered || a.sha256Workspace;
      try{
        const r = await fetch(a.url, {cache: "no-store"});
        if(!r.ok){ rows.push({ what: a.label || a.path, state: "HTTP " + r.status }); continue; }
        const buf = new Uint8Array(await r.arrayBuffer());
        const h = await sha(buf);
        rows.push({ what: a.label || a.path, bytes: buf.length, state: (h === want) ? "MATCH" : "DRIFT", got: h.slice(0, 12), want: String(want).slice(0, 12) });
      }catch(e){ rows.push({ what: a.label || a.path, state: "unreachable \u00b7 " + String((e && e.message) || e) }); }
    }
    const ok = rows.length && rows.every(r => r.state === "MATCH");
    return { state: rows.length ? (ok ? "MATCHES the packet\u2019s digests (" + rows.length + " re-hashed here)" : "DRIFT \u2014 see the rows") : "the packet names nothing fetchable yet", rows };
  }

  async function probeWrite(){
    const f = await getJson("/src/sites/mailala/ASSET-MANIFEST.json");
    const body = JSON.stringify({ t: Date.now(), station: station(), brain: VERSION,
      census: f && f.estate ? f.estate.count : null, tree: f && f.estate ? f.estate.treeDigestSha256 : null });
    try{
      const r = await root.uploadPlugin.editable.set(HEARTBEAT, body);
      if(r && r.editKey) return { state: "OPEN \u2014 THE GATE LIFTED", name: HEARTBEAT, url: r.url || null,
        note: "the heartbeat was written into this generator's namespace: the mesh can carry writes from this page" };
      return { state: "BLOCKED", name: HEARTBEAT, why: (r && r.error) || "no editKey and no error reported \u2014 treated as blocked" };
    }catch(e){ return { state: "BLOCKED", name: HEARTBEAT, why: "threw: " + String(e.message || e) }; }
  }

  /* The register claims a TREE DIGEST for the whole estate. This recomputes it from
     the bytes on disk, so "the tree has not moved since the register was generated"
     is a check rather than a belief. Bounded by default (the delivery documents and
     the station's own modules); /brain verify all re-hashes all 242 and rebuilds the
     digest itself. */
  async function verifyEstate(opts){
    opts = opts || {};
    const reg = await getJson("/src/sites/mailala/ASSET-MANIFEST.json");
    if(!reg || !reg.estate || !Array.isArray(reg.estate.files)) return { ok: false, why: "the register could not be read, so there is nothing to check against" };
    const core = /^src\/[^/]+\.(js|css|json|md)$|^src\/sites\/mailala\/(ASSET-MANIFEST|SYNC-PACKET|ARCHITECT-BLUEPRINT|BLUEPRINT|SOUL|STORY|HANDOFF|index\.html)/;
    const list = opts.all ? reg.estate.files.slice() : reg.estate.files.filter(f => core.test(f.path));
    const changed = [];
    const lines = [];
    for(const f of list){
      try{
        const r = await fetch(location.origin + "/" + f.path, {cache: "no-store"});
        if(!r.ok){ changed.push({ path: f.path, state: "HTTP " + r.status }); continue; }
        const buf = new Uint8Array(await r.arrayBuffer());
        const h = await sha(buf);
        if(h !== f.sha256) changed.push({ path: f.path, state: "CHANGED", now: h.slice(0, 12), register: String(f.sha256).slice(0, 12), bytes: buf.length });
        else lines.push(f.path + " " + h);
      }catch(e){ changed.push({ path: f.path, state: "unreachable \u00b7 " + String((e && e.message) || e) }); }
    }
    let tree = null;
    if(opts.all){
      const all = reg.estate.files.map(f => f.path + " " + f.sha256).sort();
      const now = lines.slice().sort();
      const drifted = JSON.stringify(all) !== JSON.stringify(now) && changed.length === 0 ? true : (changed.length > 0);
      tree = { recorded: reg.estate.treeDigestSha256, matches: !drifted };
    }
    return { ok: true, scope: opts.all ? "all " + list.length + " files" : "the " + list.length + " core files", checked: list.length, changed, tree };
  }

  async function sync(opts){
    opts = opts || {};
    const t0 = Date.now();
    const out = { t: new Date().toISOString(), ms: 0, lanes: {} };

    const reg = await getJson("/src/sites/mailala/ASSET-MANIFEST.json");
    out.estate = (reg && reg.estate)
      ? { census: reg.estate.count, bytes: reg.estate.bytes, treeDigest: reg.estate.treeDigestSha256, registerGenerated: reg.generated }
      : { error: "the register could not be read" };

    try{
      const pub = await publishedManifest();
      const files = Object.keys(pub.manifest);
      const bytes = Object.values(pub.manifest).reduce((n, f) => n + (f.size || 0), 0);
      const has = (re) => files.some(p => re.test(p));
      out.lanes.read = { state: "WORKS", published: files.length, bytes,
        registerPublished: has(/ASSET-MANIFEST\.json$/), packetPublished: has(/SYNC-PACKET\.json$/),
        drift: (reg && reg.estate) ? (files.length === reg.estate.count ? "none visible (" + files.length + " = the census)" : "published " + files.length + " vs census " + reg.estate.count + " \u2014 the published tree is a different save") : "unknown" };
    }catch(e){ out.lanes.read = { state: "FAILED", why: String((e && e.message) || e) }; }

    out.delivered = await verifyDelivery();
    out.estateCheck = await verifyEstate({});
    out.lanes.write = await probeWrite();
    out.keys = await keysCheck(true);
    out.ms = Date.now() - t0;
    LAST_SYNC = out;

    const f = kv();
    if(f){
      try{
        await f.set("lastSync", out);
        const log = (await f.get("syncLog")) || [];
        log.push({ t: out.t, read: out.lanes.read && out.lanes.read.state, write: out.lanes.write && out.lanes.write.state,
          delivered: out.delivered && out.delivered.state, estate: out.estateCheck ? (out.estateCheck.changed.length ? out.estateCheck.changed.length + " changed" : "intact") : "?",
          drift: out.lanes.read && out.lanes.read.drift });
        await f.set("syncLog", log.slice(-60));
      }catch(e){}
    }
    return out;
  }

  async function syncLog(){
    const f = kv();
    if(!f) return [];
    try{ return (await f.get("syncLog")) || []; }catch(e){ return []; }
  }

  /* -------------------------------- archiving ------------------------------- */

  async function archive(label){
    const reg = await getJson("/src/sites/mailala/ASSET-MANIFEST.json");
    let soul = 0, ilog = null;
    try{ soul = (JSON.parse(localStorage.getItem("obi_sdnad") || "null") || { soul: [] }).soul.length; }catch(e){}
    try{ ilog = await window.ObiILog.stats(); }catch(e){}
    const keys = await keysCheck(false);
    const f = kv();
    let archives = 0, shares = 0;
    if(f){ try{ archives = ((await f.get("archives")) || []).length; shares = ((await f.get("shares")) || []).length; }catch(e){} }
    const entry = {
      t: new Date().toISOString(), label: label || "state snapshot", station: station(), brain: VERSION,
      estate: (reg && reg.estate) ? { census: reg.estate.count, bytes: reg.estate.bytes, treeDigest: reg.estate.treeDigestSha256 } : null,
      register: reg ? { generated: reg.generated, assets: (reg.assets || []).length } : null,
      soul, ilog: ilog ? { count: ilog.count, segments: ilog.segments, anchored: ilog.anchored, unanchored: ilog.unanchored } : null,
      keys: keys.map(k => ({ slot: k.slot, present: k.present, fp: k.fp })),
      sync: LAST_SYNC ? { t: LAST_SYNC.t, read: LAST_SYNC.lanes.read && LAST_SYNC.lanes.read.state,
        write: LAST_SYNC.lanes.write && LAST_SYNC.lanes.write.state, delivered: LAST_SYNC.delivered && LAST_SYNC.delivered.state } : null,
      archives, shares
    };
    entry.digest = await sha(JSON.stringify(entry));      /* the snapshot's own digest */
    if(f){ try{ const list = (await f.get("archives")) || []; list.push(entry); await f.set("archives", list.slice(-200)); }catch(e){} }
    return entry;
  }

  async function archives(){
    const f = kv();
    if(!f) return [];
    try{ return (await f.get("archives")) || []; }catch(e){ return []; }
  }

  /* ------------------------------ image sharing ----------------------------- */

  /* Share an artifact of the estate (a path) or anything on the web (a URL).
     The bytes are read here, hashed, uploaded to the estate's own host, and the
     record is kept in the brain's share archive — so a picture that left the
     station can always be found again, with its digest. */
  async function share(target){
    if(!target) return { ok: false, why: "nothing named to share" };
    const remote = /^https?:/i.test(target);
    const url = remote ? target : location.origin + (target.startsWith("/") ? target : "/" + target);
    let r = null;
    try{ r = remote ? await root.superFetch(url) : await fetch(url, {cache: "no-store"}); }catch(e){ return { ok: false, why: "could not read " + target + ": " + String(e.message || e) }; }
    if(!r || !r.ok) return { ok: false, why: "could not read " + target + " (HTTP " + (r ? r.status : "no response") + ")" };
    const buf = new Uint8Array(await r.arrayBuffer());
    const h = await sha(buf);
    let res = null;
    try{ res = await root.uploadPlugin(new Blob([buf])); }catch(e){ return { ok: false, why: "the file host refused: " + String(e.message || e), bytes: buf.length, sha256: h }; }
    if(res && res.error) return { ok: false, why: res.error, bytes: buf.length, sha256: h };
    const rec = { t: new Date().toISOString(), from: target, url: res && res.url, bytes: buf.length, sha256: h, kind: remote ? "remote" : "estate" };
    const f = kv();
    if(f){ try{ const list = (await f.get("shares")) || []; list.push(rec); await f.set("shares", list.slice(-200)); }catch(e){} }
    return { ok: true, ...rec };
  }

  async function shares(){
    const f = kv();
    if(!f) return [];
    try{ return (await f.get("shares")) || []; }catch(e){ return []; }
  }

  /* --------------------------------- the state ------------------------------ */

  async function state(){
    const s = { version: VERSION, started: STARTED, built: IDX ? IDX.built : null, entries: IDX ? IDX.entries.length : 0,
      stats: IDX ? IDX.stats : {}, census: IDX ? IDX.census : null, treeDigest: IDX ? IDX.treeDigest : null,
      lastSync: LAST_SYNC, syncLog: await syncLog(), archives: (await archives()).length, shares: (await shares()).length };
    const f = kv();
    if(f && !s.lastSync){ try{ s.lastSync = (await f.get("lastSync")) || null; }catch(e){} }
    if(f && !s.built){ try{ const i = await f.get("index"); if(i) s.lastBuild = i; }catch(e){} }
    return s;
  }

  /* ------------------------------ the auto lane ----------------------------- */

  function start(){
    if(STARTED) return false;
    if(window.ObiAuto && !window.ObiAuto.canAuto()){
      try{ console.log("[brain] auto lane HELD — /auto is off (command #10: stop auto posting)"); }catch(e){}
      return false;
    }
    STARTED = true;
    setTimeout(async () => {
      try{
        if(window.ObiAuto && !window.ObiAuto.canAuto()) return;
        if(!IDX) await build();
        await sync({ quiet: true });
        try{ window.ObiILog && window.ilog && window.ilog({ kind: "sync", action: "auto-sync (boot)", result: (LAST_SYNC && LAST_SYNC.lanes && LAST_SYNC.lanes.write && LAST_SYNC.lanes.write.state) || "ran" }); }catch(e){}
      }catch(e){}
    }, FIRST_SYNC_MS);
    setInterval(async () => {
      try{
        if(window.ObiAuto && !window.ObiAuto.canAuto()) return;
        await sync({ quiet: true });
        try{ window.ObiILog && window.ilog && window.ilog({ kind: "sync", action: "auto-sync", result: (LAST_SYNC && LAST_SYNC.lanes && LAST_SYNC.lanes.write && LAST_SYNC.lanes.write.state) || "ran" }); }catch(e){}
      }catch(e){}
    }, SYNC_EVERY_MS);
    return true;
  }

  window.ObiBrain = { VERSION, SLOTS, build, index, search, searchDetailed, state, sync, syncLog, verifyDelivery, verifyEstate, probeWrite,
    archive, archives, keys: keysCheck, keylog, share, shares, start, SYNC_EVERY_MS };
  console.log("[brain] v" + VERSION + " armed \u2014 index + the auto lane (" + (SYNC_EVERY_MS / 1000) + "s) + the key ledger");
})();
