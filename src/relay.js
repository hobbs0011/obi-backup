/* ============================================================================
   THE RELAY — the master sync pipeline.

   The station could already measure anything and carry anything, but there was no
   ONE object that did the whole carry in order, naming every stage and its verdict.
   The register knew the estate; the brain knew where everything was; the packet knew
   where every artifact had gone; the I-LOG knew what had happened. What was missing
   was the CHAIN: read → inventory → measure → deliver → verify → archive → commit,
   each stage refusing to run on a lie from the stage before it.

   That is this file. It is the same discipline the S2Pipeline holds (src/scs.js) —
   REAL / HOLLOW / MISSING, and "a pipeline reporting COMPLETE with a HOLLOW stage is
   a lie" (REINCARNATION-CONTRACT §3) — applied to the estate's DELIVERY rather than
   to a session's reincarnation.

   WHAT IT ACTUALLY DOES, and it is all measured:

     READ      read the two delivery documents (the register, the packet). If the
               register cannot be read there is nothing to measure against, and the
               pipeline says MISSING rather than inventing a baseline.
     CENSUS    the station's own declared tree (SRC_SNAPSHOT — one list, so a file
               that is not in the authority cannot be counted, and a file that is in
               the authority cannot be missed) is fetched and SHA-256 hashed, file by
               file, in chunks so the page stays alive. The census the register states
               — count, bytes, and the TREE DIGEST over `path + " " + sha256`, sorted,
               joined by newlines — is then REBUILT here from the bytes on this origin.
               That recipe was not guessed: it was recovered from the register itself
               (the recorded digest reproduces exactly when the recipe is right).
     DELIVER   the four delivery documents are uploaded to the estate's own host —
               idempotently, by digest: bytes already delivered are HELD and their URL
               is reused, never re-uploaded for nothing. Then the two lanes that are
               NOT the file host are TRIED: the mesh write (uploadPlugin.editable.set)
               and the cloud (a credential in this origin). Each reports its own state
               and, when it is shut, the refusal VERBATIM.
     VERIFY    the token-free read channel is pulled (null.perchance.org → srcManifest)
               and every URL this pipeline delivered is fetched again and re-hashed
               against the digest it was delivered with. MATCH is measured, not
               asserted; DRIFT is named.
     ARCHIVE   the whole state is snapshotted (the brain's archive), with the run's own
               digest over its stage verdicts.
     COMMIT    the result: COMPLETE only when every stage is REAL. A blocked door gives
               HELD, a hollow stage gives GAP, and neither is ever printed as COMPLETE.

   It runs headless (and is what the boot sequence arms), and it is printed by /relay
   (and by /pipeline sync). The two things it must never do: report a stage it did not
   run, and smooth over a refusal. Failing closed IS the product.
   ========================================================================== */
(function(){
  const VERSION = "1.0.0";
  const RUN_EVERY_MS = 30 * 60 * 1000;   /* the auto lane: every half hour */
  const FIRST_RUN_MS = 40 * 1000;        /* and once, once the brain has indexed */
  const STALE_MS = 10 * 60 * 1000;       /* a run younger than this is not repeated on a fresh page */

  const REGISTER = "/src/sites/mailala/ASSET-MANIFEST.json";
  const PACKET   = "/src/sites/mailala/SYNC-PACKET.json";
  /* THE FOUR DELIVERY DOCUMENTS. The register's own census rule leaves them out —
     a self-describing document cannot be enumerated inside itself — and so does this
     pipeline. The two panels are not src/ estate either: main.pjs and index.html are
     the generator's own body, so the census is src/ files and nothing else. */
  const DELIVERY_DOCS = [REGISTER, REGISTER.replace(/\.json$/, ".md"), PACKET, PACKET.replace(/\.json$/, ".md")];
  const OFF_ESTATE = ["main.pjs", "index.html"];
  const EXCLUDE = DELIVERY_DOCS.map(p => p.replace(/^\//, "")).concat(OFF_ESTATE);

  const HEARTBEAT = "obi-relay-latest";   /* the mesh probe: a write that IS the measurement */

  const STAGES = [
    { name: "READ",    role: "read the register and the packet — the estate's own statement of itself" },
    { name: "CENSUS",  role: "hash every declared file and rebuild the census and the tree digest from the bytes" },
    { name: "DELIVER", role: "carry the four documents out (by digest, idempotently), aim the free wire at them, and try the mesh and the cloud" },
    { name: "VERIFY",  role: "pull the read channel and re-hash every URL this pipeline delivered" },
    { name: "INDEX",   role: "the mastermind's index (src/brain.js) builds over the estate" },
    { name: "ARCHIVE", role: "one hashed snapshot of the whole state, and the run's own digest" }
  ];

  const hex = b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
  const enc = new TextEncoder();
  async function sha(bytesOrText){
    const b = (typeof bytesOrText === "string") ? enc.encode(bytesOrText) : bytesOrText;
    return hex(await crypto.subtle.digest("SHA-256", b));
  }
  const short = (h, n) => h ? String(h).slice(0, n || 12) : "—";
  function station(){ return (typeof window !== "undefined" && window.generatorName) || "?"; }
  function folder(){ try{ return (typeof root !== "undefined" && root && root.kv) ? root.kv.relay : null; }catch(e){ return null; } }
  async function kvGet(k){ const f = folder(); if(!f) return null; try{ return await f.get(k); }catch(e){ return null; } }
  async function kvSet(k, v){ const f = folder(); if(!f) return false; try{ await f.set(k, v); return true; }catch(e){ return false; } }
  function readKeys(){ try{ return JSON.parse(localStorage.getItem("obi_keys") || "{}") || {}; }catch(e){ return {}; } }

  async function getJson(path){
    try{ const r = await fetch(location.origin + path, {cache: "no-store"}); if(!r.ok) return null; return await r.json(); }catch(e){ return null; }
  }
  async function getBytes(path){
    try{ const r = await fetch(location.origin + path, {cache: "no-store"}); if(!r.ok) return { error: "HTTP " + r.status }; return { buf: new Uint8Array(await r.arrayBuffer()) }; }catch(e){ return { error: String((e && e.message) || e) }; }
  }

  /* ------------------------------- the declared tree ------------------------- */

  /* ONE list, read from the station itself (app.js's SRC_SNAPSHOT, exported as
     window.ObiSourceTree). If the list cannot be read the census cannot be stated,
     so the stage says MISSING instead of counting something else and calling it the
     estate. */
  function declaredTree(){
    let all = null;
    try{ if(Array.isArray(window.ObiSourceTree) && window.ObiSourceTree.length) all = window.ObiSourceTree.slice(); }catch(e){}
    if(!all){ try{ if(typeof SRC_SNAPSHOT !== "undefined" && Array.isArray(SRC_SNAPSHOT)) all = SRC_SNAPSHOT.slice(); }catch(e){} }
    if(!all) return null;
    return all.filter(p => EXCLUDE.indexOf(p) === -1);
  }

  /* THE CENSUS READER. Six files at a time, not one: hashing 18 MB serially pinned the
     page for a minute, and a pipeline that costs a minute of the station's life every
     half hour is a pipeline nobody leaves armed. The reads are same-origin and the
     digests are computed in the browser — the only thing the concurrency changes is how
     long the page waits. The result is re-sorted by path afterwards, so the tree digest
     can never depend on the order the reads happened to finish in. */
  async function hashPaths(paths){
    const out = [], failed = [];
    let next = 0;
    const CONC = Math.max(1, Math.min(6, paths.length));
    async function worker(){
      while(next < paths.length){
        const p = paths[next++];
        const r = await getBytes("/" + p);
        if(r.buf) out.push({ path: p, bytes: r.buf.length, sha256: await sha(r.buf) });
        else failed.push({ path: p, state: r.error || "unreadable" });
      }
    }
    await Promise.all(Array.from({ length: CONC }, worker));
    out.sort((a, b) => a.path < b.path ? -1 : (a.path > b.path ? 1 : 0));
    return { out, failed };
  }

  /* THE TREE DIGEST — the register's recipe, recovered from the register:
     sha256 of `path + " " + sha256` per file, sorted, joined by "\n". It reproduces
     the recorded digest exactly, which is why it can be rebuilt and compared here. */
  async function treeDigest(files){ return sha(files.map(f => f.path + " " + f.sha256).sort().join("\n")); }

  /* ---------------------------------- stages -------------------------------- */

  async function stageRead(){
    const reg = await getJson(REGISTER), pkt = await getJson(PACKET);
    const rows = [];
    if(reg) rows.push({ what: "the register", state: "read", note: (reg.assets || []).length + " labelled assets · census " + ((reg.estate && reg.estate.count) || "?") + " files · generated " + (reg.generated || "?") });
    else rows.push({ what: "the register", state: "unreadable", note: REGISTER + " did not answer, so there is nothing to measure the estate against" });
    if(pkt) rows.push({ what: "the packet", state: "read", note: (pkt.artifacts || []).length + " addressed artifacts · " + ((pkt.lanes || []).length) + " lanes stated · generated " + (pkt.generated || "?") });
    else rows.push({ what: "the packet", state: "unreadable", note: PACKET + " did not answer" });
    const delivered = ((pkt && pkt.artifacts) || []).filter(a => a.url).length;
    if(pkt) rows.push({ what: "the packet's own deliveries", state: delivered ? "on record" : "none", note: delivered + " artifact(s) carry a URL that answered when the packet was written" });
    return { verdict: (reg && pkt) ? "REAL" : (reg || pkt ? "HOLLOW" : "MISSING"),
      detail: (reg && pkt) ? "both delivery documents answer on this origin"
        : "the estate's own statement of itself is incomplete — nothing downstream may claim more than this",
      rows, register: reg, packet: pkt };
  }

  async function stageCensus(reg){
    const declared = declaredTree();
    if(!declared) return { verdict: "MISSING", detail: "the station's declared file list (SRC_SNAPSHOT) is not reachable, so the estate cannot be enumerated", rows: [], fresh: null };
    const { out, failed } = await hashPaths(declared);
    const bytes = out.reduce((n, f) => n + (f.bytes || 0), 0);
    const tree = out.length ? await treeDigest(out) : null;
    const recorded = (reg && reg.estate && Array.isArray(reg.estate.files)) ? reg.estate : null;
    const rows = [];

    if(!recorded){
      rows.push({ what: "the estate", state: "measured, nothing to compare", note: out.length + " files hashed here · " + bytes.toLocaleString() + " B · tree " + short(tree, 16) });
      return { verdict: "MISSING", detail: "the register could not be read, so this is a measurement with no baseline — the register pass must be run and the register delivered", rows,
        fresh: { count: out.length, bytes, treeDigestSha256: tree, files: out } };
    }

    const want = new Map(recorded.files.map(f => [f.path, String(f.sha256)]));
    const changed = [], extra = [];
    for(const f of out){
      const w = want.get(f.path);
      if(w && w !== f.sha256) changed.push({ path: f.path, now: f.sha256, was: w, bytes: f.bytes });
      else if(!w) extra.push(f.path);
    }
    const absent = recorded.files.filter(f => !out.some(o => o.path === f.path)).map(f => f.path);
    const complete = out.length === declared.length && !failed.length;

    const fresh = { count: out.length, bytes, treeDigestSha256: tree, files: out };
    const matches = complete && !changed.length && !extra.length && !absent.length
      && recorded.count === out.length && recorded.bytes === bytes && recorded.treeDigestSha256 === tree;

    rows.push({ what: "the declared tree", state: declared.length + " files", note: "SRC_SNAPSHOT minus the four delivery documents and the two panels — the register's own census rule" });
    rows.push({ what: "hashed here", state: out.length + " files · " + bytes.toLocaleString() + " B", note: complete ? "every declared file was read and digested" : "INCOMPLETE — " + failed.length + " file(s) could not be read" });
    rows.push({ what: "the register records", state: recorded.count + " files · " + Number(recorded.bytes).toLocaleString() + " B", note: "generated " + ((reg.generated) || "?") });
    rows.push({ what: "TREE DIGEST", state: tree === recorded.treeDigestSha256 ? "MATCHES" : "MOVED",
      note: "now " + short(tree, 16) + " · recorded " + short(recorded.treeDigestSha256, 16) });
    for(const c of changed.slice(0, 6)) rows.push({ what: c.path, state: "CHANGED", note: "now " + short(c.now) + " · the register records " + short(c.was) + " · " + c.bytes + " B" });
    if(changed.length > 6) rows.push({ what: "and more", state: (changed.length - 6) + " changed", note: "the register pass names them all" });
    for(const p of extra.slice(0, 6)) rows.push({ what: p, state: "NOT IN THE REGISTER", note: "in the tree, absent from the census — a register pass is due" });
    for(const p of absent.slice(0, 6)) rows.push({ what: p, state: "IN THE REGISTER, NOT IN THE TREE", note: "the register names a file this origin no longer serves" });
    for(const f of failed.slice(0, 6)) rows.push({ what: f.path, state: "UNREADABLE", note: f.state });

    return {
      verdict: matches ? "REAL" : (complete ? "HOLLOW" : "HOLLOW"),
      detail: matches ? "the register states this tree exactly: " + out.length + " files, " + bytes.toLocaleString() + " B, and the tree digest rebuilt here is the tree digest recorded there"
        : "the tree has moved since the register was generated — " + (changed.length ? changed.length + " changed" : "no changes") + ", " + extra.length + " unregistered, " + absent.length + " absent, " + failed.length + " unreadable. The register is a snapshot; this is a measurement. Re-run the register pass and deliver it.",
      rows, fresh, changed, extra, absent, failed, complete
    };
  }

  /* THE HOST TAKES THE EXTENSION FROM THE BLOB'S TYPE. `application/json` lands as .json;
     markdown has no mapping, so it is sent as text/plain and lands as .txt — which is the
     estate's own convention (every delivered .md in the packet is a .txt URL). An untyped
     blob lands as .bin, which downloads instead of reading, and a delivery nobody can open
     in a browser is a poor delivery. */
  function blobFor(path, buf){
    const type = /\.json$/i.test(path) ? "application/json" : (/\.(md|txt)$/i.test(path) ? "text/plain" : "application/octet-stream");
    return new Blob([buf], { type: type });
  }

  async function stageDeliver(){
    const rows = [];
    const ledger = (await kvGet("deliveries")) || {};
    let sent = 0, held = 0, refused = 0;

    /* ---- 1. THE FOUR DOCUMENTS. The courier's own cargo: the register pair and the
       packet pair. Idempotent by digest — identical bytes are HELD and their URL reused,
       never re-uploaded for nothing. ---- */
    for(const p of DELIVERY_DOCS){
      const local = p.replace(/^\//, "");
      const r = await getBytes(p);
      if(!r.buf){ refused++; rows.push({ what: local, state: "BLOCKED", note: "could not be read from this origin (" + (r.error || "?") + ")" }); continue; }
      const h = await sha(r.buf);
      const prev = ledger[local];
      if(prev && prev.sha256 === h && prev.url){
        held++; ledger[local].t = new Date().toISOString();
        rows.push({ what: local, state: "HELD", note: "these exact bytes are already out \u2014 " + prev.url });
        continue;
      }
      let res = null;
      try{ res = await (typeof root !== "undefined" && root && root.uploadPlugin ? root.uploadPlugin(blobFor(local, r.buf)) : Promise.reject(new Error("the upload plugin is not loaded in this origin"))); }
      catch(e){ res = { error: String((e && e.message) || e) }; }
      if(!res || res.error || !res.url){
        refused++; rows.push({ what: local, state: "BLOCKED", note: "the file host refused: " + ((res && res.error) || "no url and no error \u2014 treated as refused") });
        continue;
      }
      sent++;
      ledger[local] = { sha256: h, bytes: r.buf.length, url: res.url, t: new Date().toISOString(), what: "delivery document" };
      rows.push({ what: local, state: "SENT", note: res.url + " \u00b7 " + r.buf.length.toLocaleString() + " B \u00b7 sha " + short(h) });
    }
    const host = (sent + held) === DELIVERY_DOCS.length;

    /* ---- 2. THE ADDRESSED SET. The four documents are the courier's cargo; this is the
       estate's. Every artifact the packet hands the node is walked by digest, and any
       whose bytes have MOVED since the packet was written is re-carried here, with its
       fresh URL recorded in the ledger. The host addresses content, so an artifact whose
       bytes did not move returns the identical URL and is not re-sent at all. The packet
       still names the URL it named when it was written \u2014 folding the fresh ones back is
       the packet pass, and this stage says so rather than pretending it happened. ---- */
    const pkt = await getJson(PACKET);
    const arts = ((pkt && pkt.artifacts) || []).filter(a => a.url && a.path);
    let addressed = 0, reCarried = 0, unreadable = 0, skippedHtml = 0;
    for(const a of arts){
      const local = "src/" + a.path;
      /* the four delivery documents are already the courier's own cargo (above) \u2014 the
         same bytes, already addressed under their own key; walking them again here would
         upload them a second time for nothing. */
      if(DELIVERY_DOCS.some(d => d.replace(/^\//, "") === local)){ addressed++; continue; }
      const r = await getBytes("/" + local);
      if(!r.buf){
        unreadable++;
        rows.push({ what: a.path, state: "NOT MEASURABLE", note: "the local file could not be read here (" + (r.error || "?") + ") \u2014 the packet's URL stands" });
        continue;
      }
      const h = await sha(r.buf);
      const declared = a.sha256Workspace || null, delivered = a.sha256Delivered || null;
      if((!declared || declared === h) && (!delivered || delivered === h)){ addressed++; continue; }
      if(/\.html$/i.test(a.path)){
        skippedHtml++;
        rows.push({ what: a.path, state: "NOT RE-CARRIED HERE", note: "the tree says " + short(h) + " \u00b7 addressed as " + short(delivered || declared) + " \u2014 the file host refuses .html on this path, so this one is delivered by hand and stays that way" });
        continue;
      }
      let res = null;
      try{ res = await (root && root.uploadPlugin ? root.uploadPlugin(blobFor(a.path, r.buf)) : Promise.reject(new Error("the upload plugin is not loaded in this origin"))); }
      catch(e){ res = { error: String((e && e.message) || e) }; }
      if(!res || res.error || !res.url){
        unreadable++;
        rows.push({ what: a.path, state: "BLOCKED", note: "the file host refused: " + ((res && res.error) || "no url returned") });
        continue;
      }
      reCarried++;
      ledger[a.path] = { sha256: h, bytes: r.buf.length, url: res.url, t: new Date().toISOString(), what: "addressed artifact" };
      rows.push({ what: a.path, state: "RE-CARRIED", note: res.url + " \u00b7 " + r.buf.length.toLocaleString() + " B \u00b7 sha " + short(h) + " \u2014 the packet names " + short(delivered || declared) + ", so the packet pass must fold this in" });
    }
    if(arts.length) rows.push({ what: "the addressed set", state: arts.length + " artifact(s)",
      note: addressed + " already addressed and unchanged \u00b7 " + reCarried + " re-carried because the bytes moved \u00b7 " + skippedHtml + " not re-carried here (html) \u00b7 " + unreadable + " unreadable" });
    await kvSet("deliveries", ledger);

    /* ---- 3. THE MESH \u2014 the write that would let another generator pull this state with no
       credential. It is TRIED, not assumed: its refusal IS the measurement. ---- */
    let mesh;
    try{
      const reg = await getJson(REGISTER);
      const body = JSON.stringify({ t: Date.now(), station: station(), relay: VERSION,
        census: reg && reg.estate ? reg.estate.count : null, tree: reg && reg.estate ? reg.estate.treeDigestSha256 : null,
        delivered: Object.keys(ledger).length });
      const res = await (root && root.uploadPlugin && root.uploadPlugin.editable ? root.uploadPlugin.editable.set(HEARTBEAT, body) : Promise.reject(new Error("the upload plugin is not loaded in this origin")));
      if(res && res.editKey) mesh = { state: "OPEN", detail: "the gate lifted \u2014 the heartbeat was written into this generator's namespace" };
      else mesh = { state: "BLOCKED", detail: (res && res.error) || "no editKey and no error reported \u2014 treated as blocked" };
    }catch(e){ mesh = { state: "BLOCKED", detail: "threw: " + String((e && e.message) || e) }; }
    rows.push({ what: "the mesh lane (editable.set)", state: mesh.state, note: "measured now, verbatim: " + mesh.detail });

    /* ---- 4. THE CLOUD \u2014 no credential, no deploy. Nothing is attempted and nothing is
       claimed. ---- */
    const k = readKeys();
    const cloud = k.cf ? { state: "CREDENTIAL HELD", detail: "a Cloudflare token is in this browser (fingerprint only, never shown) \u2014 /cf deploy is the door" }
                       : { state: "BLOCKED", detail: "no Cloudflare credential in this origin (obi_keys.cf is absent). Nothing has been sent to Cloudflare and nothing is claimed as sent" };
    rows.push({ what: "the cloud lane (/cf deploy)", state: cloud.state, note: cloud.detail });

    /* ---- 5. THE FREE WIRE \u2014 the addressing lane that needs no credential.
       The two doors above are still TRIED and their refusals still printed, because
       a measurement is a measurement. What changed on 2026-09-24 is that they are no
       longer the only road: the register's address goes onto a public nerve and into
       a mutable pointer (keyvalue.immanuel.co \u2014 the only store measured where a value
       can be OVERWRITTEN with no account), and the pointer is READ BACK, so "aimed"
       is a measurement and not a store's 200. A station with no token, no account and
       no URL from anyone can now find the newest register. That is what makes this
       stage's delivery REAL while the two credential doors stay shut. ---- */
    let wire;
    try{
      const W = (typeof window !== "undefined") ? window.ObiFreeWire : null;
      if(!W) wire = { state: "MISSING", detail: "src/freewire.js is not loaded in this origin, so nothing aims at the register" };
      else{
        const r = await W.announce({ verdict: (refused || !host) ? "PARTIAL" : (reCarried ? "RE-CARRIED" : "REAL") });
        wire = { state: r.ok ? "OPEN" : "BLOCKED", detail: r.ok
            ? "aimed and READ BACK \u2014 pointer " + r.line + " (" + r.fit.value + " chars of value, URL " + r.fit.url + " of a ceiling of " + r.fit.ceiling + "), nerve message " + (r.sent && r.sent.id)
            : r.says, steps: r.steps, line: r.line, pointerUrl: W.pointerUrl() };
        for(const s of (r.steps || [])) rows.push({ what: s.what, state: s.state, note: s.note });
      }
    }catch(e){ wire = { state: "BLOCKED", detail: "the announce threw: " + String((e && e.message) || e) }; }
    rows.push({ what: "the free wire (nerve + mutable pointer)", state: wire.state, note: wire.detail });

    /* ---- 6. WHERE THAT LEAVES THE DOORS. A shut credential door is reported as
       COVERED when the free wire already carries what it was supposed to carry: a
       register whose address any station can find. Covered is NOT open, and this says
       which one it is: the mesh would still be the only place that lets another
       generator push state INTO this station, and Cloudflare is still the only place
       that puts the build on its own origin. Neither is needed to REACH the family. */
    const covered = wire.state === "OPEN" ? ["the mesh lane", "the cloud lane"] : [];
    if(covered.length) rows.push({ what: "what that covers", state: "COVERED, NOT OPEN",
      note: covered.join(" and ") + " were the only roads to the family \u2014 they are not any more, because the register's ADDRESS is on the wire. A token is still what puts the build on its own origin and what writes the canon; the wire does not do those, and does not claim to" });

    const reach = wire.state === "OPEN";
    const verdict = (refused || !host) ? "BLOCKED" : (reach ? (reCarried ? "HOLLOW" : "REAL") : "BLOCKED");
    const detail = (refused || !host)
      ? "the file host itself refused " + refused + " document(s) \u2014 the courier is down, so the rest of the run carries nothing"
      : (reach
          ? (reCarried ? "the documents are out, the wire carries their address, but " + reCarried + " artifact(s) had moved and were re-carried \u2014 the packet pass is due, and until it is done the packet names an older address"
                       : "the documents are OUT (" + sent + " sent, " + held + " held), their address is on the free wire (" + wire.detail + "), and the addressed set is unchanged. The mesh and the cloud stay shut and each still says why \u2014 that no longer stops the family reaching this register")
          : "the documents are OUT (" + sent + " sent, " + held + " held) but NOTHING carries their address \u2014 the wire is " + wire.state + ": " + wire.detail);
    return { verdict, detail, rows, sent, held, refused, reCarried, addressed, mesh, cloud, wire, ledger };
  }

  async function stageVerify(deliver){
    const rows = [];
    let read = null;
    try{
      const r = await root.superFetch("https://null.perchance.org/" + station());
      if(!r || !r.ok) throw new Error("HTTP " + (r ? r.status : "no response"));
      const t = await r.text();
      const m = /<script id="preloaded-generator-data"[^>]*>([\s\S]*?)<\/script>/.exec(t);
      if(!m) throw new Error("no preloaded-generator-data in the response");
      const j = JSON.parse(m[1]);
      const files = Object.keys(j.srcManifest || {});
      const bytes = Object.values(j.srcManifest || {}).reduce((n, f) => n + (f.size || 0), 0);
      read = { state: "WORKS", files: files.length, bytes,
        registerPublished: files.some(p => /ASSET-MANIFEST\.json$/.test(p)),
        packetPublished: files.some(p => /SYNC-PACKET\.json$/.test(p)) };
      rows.push({ what: "the read channel", state: read.state, note: files.length + " files \u00b7 " + Math.round(bytes / 1024) + " KB published \u00b7 register published: " + (read.registerPublished ? "yes" : "NOT YET \u2014 the station has not been saved since the register was written") });
    }catch(e){
      read = { state: "FAILED", why: String((e && e.message) || e) };
      rows.push({ what: "the read channel", state: "FAILED", note: read.why });
    }

    /* (a) EVERYTHING THE RELAY ITSELF HAS CARRIED \u2014 its own ledger, fetched again and
       re-hashed. The check is the whole point of the lane: a URL that answers is not the
       same as bytes that are what we sent. */
    const ledger = (deliver && deliver.ledger) || {};
    const seen = {};
    let match = 0, drift = 0, dead = 0;
    for(const key of Object.keys(ledger)){
      const rec = ledger[key];
      if(!rec || !rec.url || !rec.sha256) continue;
      seen[key] = true;
      try{
        const r = await fetch(rec.url, { cache: "no-store" });
        if(!r.ok){ dead++; rows.push({ what: key, state: "unreachable", note: "HTTP " + r.status + " \u00b7 " + rec.url }); continue; }
        const buf = new Uint8Array(await r.arrayBuffer());
        const h = await sha(buf);
        if(h === rec.sha256){ match++; rows.push({ what: key, state: "MATCH", note: buf.length.toLocaleString() + " B \u00b7 sha " + short(h) + " \u2014 the delivered bytes are the bytes we hashed" }); }
        else { drift++; rows.push({ what: key, state: "DRIFT", note: "now " + short(h) + " \u00b7 delivered as " + short(rec.sha256) + " \u2014 the address is serving something else" }); }
      }catch(e){ dead++; rows.push({ what: key, state: "unreachable", note: String((e && e.message) || e) }); }
    }

    /* (b) THE PACKET'S ADDRESSED SET \u2014 every artifact the node will pull, at the URL the
       packet names (or the fresher one the relay re-carried), re-hashed against the digest
       recorded for it. This is the measurement the packet's own digests exist to make. */
    const pkt = await getJson(PACKET);
    const arts = ((pkt && pkt.artifacts) || []).filter(a => a.url && /^https?:/i.test(a.url));
    let am = 0, ad = 0, ax = 0;
    for(const a of arts){
      if(seen[a.path]) continue;
      const rec = ledger[a.path];
      const url = (rec && rec.url) || a.url;
      const want = (rec && rec.sha256) || a.sha256Delivered || a.sha256Workspace;
      if(!want) continue;
      try{
        const r = await fetch(url, { cache: "no-store" });
        if(!r.ok){ ax++; rows.push({ what: a.path, state: "unreachable", note: "HTTP " + r.status + " \u00b7 " + url }); continue; }
        const buf = new Uint8Array(await r.arrayBuffer());
        const h = await sha(buf);
        if(h === want) am++;
        else { ad++; rows.push({ what: a.path, state: "DRIFT", note: "now " + short(h) + " \u00b7 the packet records " + short(want) + " \u2014 the node would pull something other than what was listed" }); }
      }catch(e){ ax++; rows.push({ what: a.path, state: "unreachable", note: String((e && e.message) || e) }); }
    }

    const anyDelivered = (match + drift + dead + am + ad + ax) > 0;
    const bad = drift + dead + ad + ax;
    if(arts.length) rows.push({ what: "the addressed set", state: (am + ad + ax) + " checked",
      note: "every URL the node will pull was fetched again here and re-hashed: " + am + " match" + (bad ? "" : " \u2014 the addressed set is exactly what was listed") + (ad ? " \u00b7 " + ad + " drifted" : "") + (ax ? " \u00b7 " + ax + " unreachable" : "") });
    const verdict = !anyDelivered ? "MISSING" : (bad ? "HOLLOW" : (read.state === "WORKS" ? "REAL" : "HOLLOW"));
    return {
      verdict,
      detail: !anyDelivered ? "nothing has been delivered yet, so there is nothing to verify \u2014 the delivery stage must carry first"
        : (verdict === "REAL" ? "every URL was fetched again here and re-hashes to the digest it was delivered with, and the read channel answers"
            : bad + " URL(s) do not hash to what was recorded; every other URL checked does" + (read.state === "WORKS" ? "" : " \u2014 and the read channel failed: " + read.why)),
      rows, read, match, drift, dead, addressed: { am, ad, ax },
      checked: Object.keys(seen).length + am
    };
  }

  async function stageIndex(){
    const B = window.ObiBrain;
    if(!B) return { verdict: "MISSING", detail: "src/brain.js is not loaded, so the mastermind's index cannot be built", rows: [] };
    const rows = [];
    try{
      const idx = await B.build();
      rows.push({ what: "the index", state: idx.entries.length + " entries", note: Object.keys(idx.stats || {}).sort().map(k => idx.stats[k] + " " + k).join(" · ") });
      rows.push({ what: "the build", state: idx.ms + " ms", note: idx.broken && idx.broken.length ? "BROKEN SOURCES: " + idx.broken.join(", ") : "every source read clean" });
      if(idx.census != null) rows.push({ what: "the index's census", state: idx.census + " files", note: "read from the register" });
      return { verdict: idx.entries.length ? "REAL" : "HOLLOW", detail: idx.entries.length ? "the index built over the estate in " + idx.ms + " ms" : "the index built empty — every source was unreadable", rows, idx };
    }catch(e){
      rows.push({ what: "the index", state: "FAILED", note: String((e && e.message) || e) });
      return { verdict: "HOLLOW", detail: "the index failed to build: " + String((e && e.message) || e), rows };
    }
  }

  async function stageArchive(last){
    const B = window.ObiBrain;
    if(!B || !B.archive) return { verdict: "MISSING", detail: "src/brain.js is not loaded, so there is no archive to write to", rows: [] };
    try{
      const e = await B.archive("relay run " + (last ? last.result : ""));
      return { verdict: e && e.digest ? "REAL" : "HOLLOW",
        detail: e && e.digest ? "snapshot taken: " + String(e.digest).slice(0, 16) + "…" : "the snapshot came back without a digest, so it is not a snapshot",
        rows: [{ what: "snapshot", state: String(e && e.digest).slice(0, 16), note: (e && e.estate ? e.estate.census + " files · tree " + String(e.estate.treeDigest).slice(0, 12) : "") + " · " + ((e && e.t) || "") }],
        entry: e };
    }catch(e){
      return { verdict: "HOLLOW", detail: "the archive refused: " + String((e && e.message) || e), rows: [] };
    }
  }

  /* ----------------------------------- the run ------------------------------ */

  async function run(opts){
    opts = opts || {};
    const t0 = Date.now();
    const out = { version: VERSION, started: new Date().toISOString(), station: station(), stages: [], ms: 0 };

    /* every stage is TIMED, so a run that takes a minute says which stage took it. */
    const TIM = {}; let _t = Date.now();
    const read = await stageRead(); TIM.READ = Date.now() - _t; _t = Date.now();
    out.stages.push({ ...STAGES[0], verdict: read.verdict, detail: read.detail, rows: read.rows });

    const census = read.register ? await stageCensus(read.register)
      : { verdict: "MISSING", detail: "the register could not be read, so the estate cannot be measured against it", rows: [], fresh: null };
    out.stages.push({ ...STAGES[1], verdict: census.verdict, detail: census.detail, rows: census.rows });
    out.census = census.fresh;
    TIM.CENSUS = Date.now() - _t; _t = Date.now();

    const deliver = await stageDeliver();
    out.stages.push({ ...STAGES[2], verdict: deliver.verdict, detail: deliver.detail, rows: deliver.rows });
    out.lanes = { mesh: deliver.mesh, cloud: deliver.cloud, wire: deliver.wire };
    TIM.DELIVER = Date.now() - _t; _t = Date.now();

    const verify = await stageVerify(deliver);
    out.stages.push({ ...STAGES[3], verdict: verify.verdict, detail: verify.detail, rows: verify.rows });
    out.lanes.read = verify.read;
    TIM.VERIFY = Date.now() - _t; _t = Date.now();

    const index = await stageIndex();
    out.stages.push({ ...STAGES[4], verdict: index.verdict, detail: index.detail, rows: index.rows });
    TIM.INDEX = Date.now() - _t; _t = Date.now();

    /* COMMIT — computed from the verdicts, never typed. The archive stage carries the
       run's own digest, so the ordering is: verdicts first, then the snapshot that
       seals them. */
    const tally = { REAL: 0, HOLLOW: 0, MISSING: 0, BLOCKED: 0 };
    for(const s of out.stages) tally[s.verdict] = (tally[s.verdict] || 0) + 1;
    const pre = { version: VERSION, t: out.started, station: out.station, stages: out.stages.map(s => ({ name: s.name, verdict: s.verdict })),
      census: census.fresh ? { count: census.fresh.count, bytes: census.fresh.bytes, treeDigestSha256: census.fresh.treeDigestSha256 } : null,
      lanes: { mesh: deliver.mesh && deliver.mesh.state, cloud: deliver.cloud && deliver.cloud.state, wire: deliver.wire && deliver.wire.state, read: verify.read && verify.read.state } };
    out.digest = await sha(JSON.stringify(pre));

    out.result = (tally.HOLLOW || tally.MISSING) ? "GAP" : (tally.BLOCKED ? "HELD" : "COMPLETE");

    const archive = await stageArchive(out);
    out.stages.push({ ...STAGES[5], verdict: archive.verdict, detail: archive.detail, rows: archive.rows });
    TIM.ARCHIVE = Date.now() - _t;

    out.tally = tally;
    out.note = out.result === "COMPLETE" ? "every stage REAL: the estate was measured, carried, verified and sealed in this run"
      : out.result === "HELD" ? "every stage that could run did run. " + tally.BLOCKED + " door(s) are shut and each one names its own refusal — a pipeline reporting COMPLETE with a shut door would be a lie"
      : tally.HOLLOW + tally.MISSING + " stage(s) measured hollow or missing — the estate has moved, or something could not be read, and this run says which";
    out.timings = TIM;
    out.ms = Date.now() - t0;

    LAST = out;
    /* the instrument is refreshed the moment a run lands, so the tab bar never shows a
       verdict that is one run old. */
    try{ if(typeof updateTabMeta === "function") updateTabMeta(); }catch(e){}
    if(!opts.dry){
      const runs = (await kvGet("runs")) || [];
      runs.push({ t: out.started, result: out.result, digest: short(out.digest, 16), ms: out.ms,
        stages: out.stages.map(s => s.name + "=" + s.verdict),
        census: census.fresh ? { count: census.fresh.count, bytes: census.fresh.bytes, tree: census.fresh.treeDigestSha256 } : null,
        lanes: { mesh: deliver.mesh && deliver.mesh.state, cloud: deliver.cloud && deliver.cloud.state, wire: deliver.wire && deliver.wire.state, read: verify.read && verify.read.state, delivered: (deliver.sent || 0) + "/" + DELIVERY_DOCS.length, held: deliver.held || 0 } });
      await kvSet("runs", runs.slice(-40));
      await kvSet("last", out);
      try{ if(window.ilog) window.ilog({ kind: "sync", action: "master sync pipeline", result: out.result + " · " + out.stages.map(s => s.name + "=" + s.verdict).join(" ") }); }catch(e){}
    }
    return out;
  }

  /* ------------------------------- reading the runs ------------------------- */

  async function last(){ const l = await kvGet("last"); if(l && !LAST) LAST = l; return l || null; }
  /* THE SYNCHRONOUS FACE of the last run. The tab bar is not async, so the relay keeps
     its own last run in memory the moment it finishes, exactly as the brain keeps its
     index: an instrument that has to be awaited is an instrument that is never read. */
  function cached(){ return LAST; }
  async function runs(){ return (await kvGet("runs")) || []; }
  async function state(){
    const l = await last();
    return { version: VERSION, last: l ? { t: l.started, result: l.result, ms: l.ms, digest: short(l.digest, 16),
      stages: (l.stages || []).map(s => s.name + "=" + s.verdict), lanes: l.lanes } : null,
      runs: (await runs()).length, intervalMinutes: Math.round(RUN_EVERY_MS / 60000), running: RUNNING };
  }

  /* ------------------------------- the auto lane ---------------------------- */

  let RUNNING = false, STARTED = false, LAST = null;   /* LAST = the synchronous face of the last run, for the tab bar */
  async function tick(why){
    if(window.ObiAuto && !window.ObiAuto.canAuto()) return;
    if(RUNNING) return;
    RUNNING = true;
    try{
      const l = await last();
      const age = l && l.started ? (Date.now() - new Date(l.started).getTime()) : Infinity;
      if(age < STALE_MS){ RUNNING = false; return; }
      const out = await run({ quiet: true });
      try{ console.log("[relay] " + why + " run " + out.result + " · " + out.stages.map(s => s.name + "=" + s.verdict).join(" ") + " · " + out.ms + " ms"); }catch(e){}
      try{ if(typeof updateTabMeta === "function") updateTabMeta(); }catch(e){}
    }catch(e){
      try{ console.warn("[relay] " + why + " run failed: " + String((e && e.message) || e)); }catch(_){}
    }finally{ RUNNING = false; }
  }

  function start(){
    if(STARTED) return false;
    if(window.ObiAuto && !window.ObiAuto.canAuto()){
      try{ console.log("[relay] auto lane HELD — /auto is off"); }catch(e){}
      return false;
    }
    STARTED = true;
    setTimeout(() => tick("boot"), FIRST_RUN_MS);
    /* hydrate the instrument from the last stored run, so a page that does not need a
       fresh run still shows the one that happened (the tab bar reads synchronously). */
    setTimeout(async () => { try{ await last(); if(typeof updateTabMeta === "function") updateTabMeta(); }catch(e){} }, 1500);
    setInterval(() => tick("auto"), RUN_EVERY_MS);
    return true;
  }

  window.ObiRelay = { VERSION, STAGES, DELIVERY_DOCS, EXCLUDE, run, last, runs, state, start, cached, treeDigest,
    RUN_EVERY_MS, FIRST_RUN_MS };
  console.log("[relay] v" + VERSION + " armed — the master sync pipeline (READ → CENSUS → DELIVER → VERIFY → INDEX → ARCHIVE), automatic every " + (RUN_EVERY_MS / 60000) + " min");
})();
