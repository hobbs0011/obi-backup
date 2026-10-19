/* ============================================================================
   THE I-LOG — the station's own record of what it did.

   Every operation that touches anything (a command spoken, a capture saved, a
   write-up filed, an export downloaded, a secret stored, a push to Git) is
   appended here as one entry:

     { seq, t, iso, run, kind, action, detail, result, ok, ms, ref, prev, hash }

   Three properties, and nothing claimed beyond them:

     APPEND-ONLY   nothing is edited and nothing is deleted. `/ilog reset` does
                   not erase: it writes a SEAL entry that names the old head and
                   starts a new segment, so the record keeps its history.
     HASH-CHAINED  each entry carries sha-256 over the canonical tuple of its own
                   fields plus the previous entry's hash. Rewrite one entry and
                   every later hash stops matching — `/ilog verify` recomputes the
                   whole chain and names the first break (seq, link, hash).
     ANCHORED      a chain in the same storage as its entries proves little: an
                   attacker who owns the storage can rewrite the chain too. So a
                   push to Git writes the whole segment + a STATUS file naming the
                   head, and records the resulting commit as an ANCHOR. A commit is
                   a timestamped copy outside this origin — that is the witness.
                   `/ilog` always shows the UNANCHORED count, because "backed up"
                   is a measurement, not a promise.

   Durability: entries are written to kv (IndexedDB, per-origin, survives reload)
   as the authoritative chain, AND mirrored into localStorage (`obi_ilog`, last
   400) so the log is readable the instant the page loads, before kv has opened.
   If kv is unreachable the entry is still mirrored and marked `stored:"mirror"`,
   and `/ilog verify` reports the gap instead of passing silently.

   HONEST GAPS (measured, never hidden):
     - verification happens in this browser; only the Git anchors are outside it.
     - crypto.subtle gives sha-256; if it is unavailable the log falls back to
       fnv64x2 and records `alg` per entry, because a weak honest hash beats a
       silent lie.
     - a push logs its own `push` entry AFTER the commit lands, so that entry
       rides the NEXT push. That is exactly what the unanchored count reports.

   /ilog · /ilog verify · /ilog push · /ilog export · /ilog anchors · /ilog reset
   ========================================================================== */
(function(){
  "use strict";

  const VERSION = 1;
  const KV_FOLDER = "ilog";
  const LS_KEY = "obi_ilog";
  const TAIL = 400;               /* entries mirrored into localStorage */
  const PAD = 7;
  const REPO = { owner: "Phoenix-Rising-Ai-Solutions", repo: "OB-1--Authoritative-", branch: "master" };
  const ILOG_DIR = "OPERATIONS/COMMANDSTATION/ILOG/";
  /* THE VS CODE STATION'S I-LOG — a different branch from this station's writes.
     It is the `canon` branch: `I-LOG-UNAUDITED/` holds the per-incarnation
     transcripts (`I-LOG-Incarnate-<N>-<topic>.txt` + `-COLORIZED.md` SOUL/DNA/
     REASON + `-STATS.json`), `RRL/` is the I-LOG directory (formerly RRL) with
     its own INDEX.md, and `PastLives/RRL-CURRENT.txt` is the living pointer.
     master does NOT carry them — reading master found nothing. */
  const VS = { owner: "Phoenix-Rising-Ai-Solutions", repo: "OB-1--Authoritative-", branch: "canon", dir: "I-LOG-UNAUDITED", vault: "RRL", current: "PastLives/RRL-CURRENT.txt" };

  const nowIso = () => new Date().toISOString();
  const short = h => String(h || "none").slice(0, 12);
  /* credentials never travel: the transcript is scrubbed before it is written
     anywhere (the chain itself is written redacted at the source, because a hash
     cannot be redacted after the fact without breaking the chain). */
  function scrub(s){
    return String(s == null ? "" : s)
      .replace(/\b(gh[pousr]_[A-Za-z0-9]{12,}|github_pat_[A-Za-z0-9_]{12,})\b/g, "[REDACTED_GITHUB_TOKEN]")
      .replace(/\b(Bearer|Token)\s+[A-Za-z0-9._\-]{16,}/g, "$1 [REDACTED]")
      .replace(/(\/omega\s+)\S+/gi, "$1[REDACTED]")
      .replace(/(\/(?:cf|gh|dg)\s+(?:token|key|secret|pat|password|pw)\s+)\S+/gi, "$1[REDACTED]");
  }
  function E(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  function runNow(){ try{ return (typeof runNoOf === "function") ? runNoOf() : null; }catch(e){ return null; } }
  function genName(){ try{ return window.generatorName || "?"; }catch(e){ return "?"; } }
  function ghToken(){ try{ return JSON.parse(localStorage.getItem("obi_keys") || "{}").gh || null; }catch(e){ return null; } }

  /* ------------------------------- storage --------------------------------- */
  function kvFolder(){
    try{ if(typeof root !== "undefined" && root && root.kv && root.kv[KV_FOLDER]) return root.kv[KV_FOLDER]; }catch(e){}
    return null;
  }
  /* entry keys carry the SEGMENT as well as the seq: a seal opens a new segment
     whose first entry is seq 1, and without the segment in the key that entry
     would overwrite the first entry of every earlier segment (it did, once — see
     migrate(), which repairs the legacy keys and is called at boot). */
  const keyOf = (seg, seq) => "e" + (seg || 1) + "-" + String(seq).padStart(PAD, "0");
  function parseKey(k){
    let m = String(k).match(/^e(\d+)-(\d+)$/);
    if(m) return { seg: Number(m[1]), seq: Number(m[2]), legacy:false };
    m = String(k).match(/^e(\d+)$/);
    if(m) return { seg: 1, seq: Number(m[1]), legacy:true };
    return null;
  }
  function mirrorRead(){
    try{
      const j = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if(j && typeof j === "object" && Array.isArray(j.entries)) return j;
    }catch(e){}
    return { seg:1, count:0, head:null, entries:[] };
  }
  function mirrorWrite(m){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(m)); return true; }catch(e){ return false; }
  }

  /* -------------------------------- hashing -------------------------------- */
  function weakHash(s){
    /* fnv64x2 — clearly labelled fallback, never dressed up as sha-256 */
    let h1 = 0x811c9dc5 >>> 0, h2 = 0xcbf29ce4 >>> 0;
    for(let i = 0; i < s.length; i++){
      const c = s.charCodeAt(i);
      h1 = (h1 ^ c) >>> 0; h1 = Math.imul(h1, 16777619) >>> 0;
      h2 = (h2 + c) >>> 0; h2 = Math.imul(h2, 2246822519) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0;
    }
    const hex = (h1 >>> 0).toString(16).padStart(8,"0") + (h2 >>> 0).toString(16).padStart(8,"0");
    return hex + hex;
  }
  async function hashOf(s){
    try{
      if(typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest){
        const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
        return { alg:"sha-256", hex: Array.from(new Uint8Array(d)).map(x => x.toString(16).padStart(2,"0")).join("") };
      }
    }catch(e){}
    return { alg:"fnv64x2", hex: weakHash(s) };
  }
  /* the canonical tuple — hashed at write time, recomputed verbatim at verify
     time. Every field here must be final before hashing: `stored`, `err` and the
     anchor bookkeeping are added afterwards and are deliberately NOT covered. */
  function payloadOf(e){
    return JSON.stringify([
      e.v || VERSION, e.seg || 1, e.seq, e.t, e.run == null ? null : e.run,
      e.kind || null, e.action == null ? null : e.action, e.detail == null ? null : e.detail,
      e.result == null ? null : e.result, (e.ok === false ? 0 : 1), e.ms == null ? null : e.ms,
      e.ref == null ? null : e.ref, e.prev == null ? null : e.prev
    ]);
  }

  /* --------------------------------- head ---------------------------------- */
  let cached = null;      /* { seg, count, hash, t } — avoids a kv read per append */
  async function head(){
    const f = kvFolder();
    if(f){
      try{
        const h = await f.get("head");
        if(h && typeof h.count === "number"){ cached = h; return h; }
      }catch(e){}
    }
    if(cached) return cached;
    const m = mirrorRead();
    return { seg: m.seg || 1, count: m.count || 0, hash: m.head || null, t:null, sealT:null, sealedCount:0 };
  }
  async function sealOf(seg){
    const f = kvFolder();
    if(f){ try{ const s = await f.get("seal:" + seg); if(s) return s; }catch(e){} }
    return null;
  }

  /* -------------------------------- append --------------------------------- */
  let q = Promise.resolve();
  function append(entry){
    const e = Object.assign({ t: Date.now(), iso: nowIso(), run: runNow() }, entry || {});
    e.kind = e.kind || "op";
    q = q.then(() => write(e)).catch(err => { e.err = String((err && err.message) || err); return e; });
    return q;
  }
  async function write(e){
    const h = await head();
    e.seq = (h.count || 0) + 1;
    e.seg = h.seg || 1;
    e.prev = h.hash || null;
    if(e.ok === undefined) e.ok = true;
    e.v = VERSION;
    const hs = await hashOf(payloadOf(e));
    e.hash = hs.hex; e.alg = hs.alg;

    const f = kvFolder();
    let stored = false;
    if(f){
      try{
        await f.set(keyOf(e.seg, e.seq), e);
        await f.set("head", { seg: e.seg, count: e.seq, hash: e.hash, prevHash: e.prev, headSeq: e.seq, t: e.t, iso: e.iso, alg: e.alg, sealedCount: h.sealedCount || 0, sealT: h.sealT || null });
        cached = { seg: e.seg, count: e.seq, hash: e.hash, t: e.t, sealedCount: h.sealedCount || 0, sealT: h.sealT || null };
        stored = true;
      }catch(err){ e.kvErr = String((err && err.message) || err).slice(0, 120); }
    }
    e.stored = stored ? "kv" : "mirror";
    const m = mirrorRead();
    m.seg = e.seg;
    m.count = e.seq;                    /* the mirror keeps its own cursor, so a
                                          kv outage cannot make two entries share a seq */
    m.head = e.hash;
    m.last = e.iso;
    m.entries = (m.entries || []).concat([e]).slice(-TAIL);
    mirrorWrite(m);
    return e;
  }

  /* ------------------------- hash-verified restoration ----------------------
     If a single entry is lost (a crash, a storage fault, an old bug), the chain
     still remembers its hash: every later entry's `prev` points at it. So a lost
     entry can be RECONSTRUCTED and PROVEN — the payload is hashed and must equal
     the hash the chain already expects, or nothing is written. Deletion is never
     silent; recovery is never an act of faith. */
  async function restoreEntry(e, expectedHash){
    const f = kvFolder();
    if(!f || !e || !expectedHash) return { ok:false, why:"nothing to restore into" };
    const cand = Object.assign({ v: VERSION }, e);
    if(cand.ok === undefined) cand.ok = true;
    const hs = await hashOf(payloadOf(cand));
    if(hs.hex !== expectedHash) return { ok:false, why:"hash mismatch — the reconstruction does not match the chain", alg:hs.alg, got:hs.hex, want:expectedHash };
    cand.hash = hs.hex; cand.alg = hs.alg; cand.restored = { at: Date.now(), iso: nowIso(), note:"reconstructed and hash-verified" };
    const key = keyOf(cand.seg || 1, cand.seq);
    try{
      const existing = await f.get(key);
      if(existing && existing.hash !== cand.hash) return { ok:false, why:"a different entry already occupies that slot", key:key };
      await f.set(key, cand);
    }catch(err){ return { ok:false, why:err.message }; }
    return { ok:true, key:key, hash:cand.hash };
  }

  /* -------------------------------- reading -------------------------------- */
  async function allEntries(){
    const f = kvFolder();
    let list = [];
    if(f){
      try{
        const rows = await f.entries();
        /* a legacy (segment-less) key is only used when no canonical copy of the
           same entry exists — during/after migration the same entry is briefly
           present under both keys, and it must not be counted twice. */
        const byPair = {};
        for(const r of rows){
          const k = parseKey(r[0]);
          const v = r[1];
          if(!k || !v || typeof v.seq !== "number") continue;
          if(!v.seg) v.seg = k.seg;
          const id = (v.seg || 1) + ":" + v.seq;
          const prev = byPair[id];
          if(!prev || (prev.__legacy && !k.legacy)) byPair[id] = Object.assign(v, { __legacy: k.legacy });
        }
        list = Object.keys(byPair).map(id => byPair[id]);
        list.forEach(e => { delete e.__legacy; });
        list.sort((a, b) => (a.seg - b.seg) || (a.seq - b.seq));
      }catch(e){ list = []; }
    }
    if(!list.length){
      const m = mirrorRead();
      list = (m.entries || []).slice();
      list.forEach(e => { if(!e.stored) e.stored = "mirror"; });
    }
    return list;
  }
  /* one-time repair of the legacy (segment-less) keys. It NEVER deletes an entry:
     it re-keys each one under `e<seg>-<seq>` and only then removes the old key. */
  async function migrate(){
    const f = kvFolder();
    if(!f) return { moved: 0 };
    let rows = [];
    try{ rows = await f.entries(); }catch(e){ return { moved: 0 }; }
    let moved = 0, cleaned = 0;
    for(const r of rows){
      const k = parseKey(r[0]);
      if(!k || !k.legacy || !r[1] || typeof r[1].seq !== "number") continue;
      const seg = r[1].seg || 1;
      const nk = keyOf(seg, r[1].seq);
      if(nk === r[0]) continue;
      try{
        let existing = await f.get(nk);
        if(!existing){ await f.set(nk, r[1]); existing = r[1]; moved++; }
        /* the legacy key is only removed once the canonical key provably holds the
           same entry (same hash). Until then it stays — a duplicate is harmless,
           a lost entry is not. */
        if(existing && existing.hash && existing.hash === r[1].hash){ await f.delete(r[0]); cleaned++; }
      }catch(e){ continue; }
    }
    return { moved: moved, cleaned: cleaned };
  }
  async function entries(opts){
    opts = opts || {};
    let list = await allEntries();
    if(opts.seg) list = list.filter(e => (e.seg || 1) === opts.seg);
    if(opts.kind) list = list.filter(e => e.kind === opts.kind);
    return opts.limit ? list.slice(-opts.limit) : list;
  }

  /* -------------------------------- verify --------------------------------- */
  async function verify(){
    const t0 = Date.now();
    const f = kvFolder();
    const list = await allEntries();
    const out = { ok:true, kv: !!f, checked:0, breaks:[], segments:[], alg:null, ms:0 };
    if(!list.length){ out.ms = Date.now() - t0; out.empty = true; return out; }
    const heads = {};                                     /* seg → last hash seen */
    for(const e of list){ heads[e.seg || 1] = e.hash; }
    const segs = {};
    for(const e of list){ (segs[e.seg || 1] = segs[e.seg || 1] || []).push(e); }
    for(const key of Object.keys(segs).map(Number).sort((a, b) => a - b)){
      const arr = segs[key];
      let prev = null, bad = 0;
      for(let i = 0; i < arr.length; i++){
        const e = arr[i];
        const hs = await hashOf(payloadOf(e));
        out.alg = out.alg || hs.alg;
        const hashOk = (hs.hex === e.hash);
        let linkOk;
        if(i === 0){
          /* the first entry of a segment may open the log (null) or continue from
             a hash that actually exists in an earlier segment (after a seal) */
          const p = e.prev || null;
          linkOk = (p === null) || Object.keys(heads).some(k => Number(k) < key && heads[k] === p);
        } else {
          linkOk = (e.prev || null) === (prev || null);
        }
        if(!hashOk || !linkOk){
          bad++;
          if(out.breaks.length < 8) out.breaks.push({ seq:e.seq, seg:e.seg || 1, link: linkOk ? "ok" : "broken", hash: hashOk ? "ok" : "mismatch", alg: hs.alg });
        }
        prev = e.hash;
      }
      out.checked += arr.length;
      out.segments.push({ seg:key, entries:arr.length, firstSeq:arr[0].seq, lastSeq:arr[arr.length - 1].seq, head:arr[arr.length - 1].hash, alg:arr[arr.length - 1].alg, ok: bad === 0 });
      if(bad) out.ok = false;
    }
    out.head = list[list.length - 1].hash;
    out.seg = list[list.length - 1].seg || 1;
    if(!f && !out.empty){ out.ok = false; out.why = "kv unreachable — entries are living in localStorage only; the authoritative chain is incomplete"; }
    out.ms = Date.now() - t0;
    return out;
  }

  /* -------------------------------- anchors -------------------------------- */
  async function anchorList(){
    const f = kvFolder();
    if(!f) return [];
    try{
      const rows = await f.entries();
      return (rows || []).filter(r => /^anchor:/.test(r[0])).map(r => r[1]).filter(Boolean).sort((a, b) => (a.t || 0) - (b.t || 0));
    }catch(e){ return []; }
  }
  async function anchorRecord(a){
    const f = kvFolder();
    if(!f || !a || !a.commit) return null;
    const rec = Object.assign({ t: Date.now(), iso: nowIso() }, a);
    try{ await f.set("anchor:" + a.commit, rec); }catch(e){}
    return rec;
  }
  /* ------------------------- the branch's own anchors ----------------------
     This origin's chain and the authority branch's chain can DIVERGE — the
     station was renamed 2026-09-23, which wiped the name-keyed kv that held the
     anchors, and a fresh chain opened on this origin minutes later with COLLIDING
     seq numbers. So "no local anchor" must never be printed as "never anchored on
     Git": the record may be anchored on the branch even when this origin lost the
     pointer. This reads the branch's own `anchors.json` (the token, if any, is
     used only in the Authorization header — never logged, never rendered) and
     compares each remote anchor's seq against this origin's entry at that seq:
     same seq + same head = one chain; same seq + different head = two chains
     sharing numbers, and THAT is what gets printed. Fail closed: no token, or a
     branch that does not answer, returns ok:false with the reason — nothing is
     claimed beyond what was read. */
  async function remoteAnchors(){
    const out = { ok:false, why:null, branch:REPO.branch, path:ILOG_DIR + "anchors.json", anchors:[], compare:[], sameSeq:[], differSeq:[], verdict:null };
    if(!ghToken()){ out.why = "no GitHub token in this browser — the authority branch cannot be read"; return out; }
    try{
      const r = await ghJson("https://api.github.com/repos/" + REPO.owner + "/" + REPO.repo + "/contents/" + ILOG_DIR + "anchors.json?ref=" + REPO.branch);
      if(r.status !== 200 || !r.j || !r.j.content){ out.why = "the branch does not answer for " + ILOG_DIR + "anchors.json (HTTP " + r.status + ")"; return out; }
      let txt = null; try{ txt = decodeURIComponent(escape(atob(String(r.j.content).replace(/\s+/g, "")))); }catch(e){ txt = null; }
      let arr = null; try{ arr = JSON.parse(txt); }catch(e){}
      if(!Array.isArray(arr)){ out.why = "the branch's anchors.json did not parse as a list"; return out; }
      out.anchors = arr; out.ok = true;
    }catch(e){ out.why = "the branch could not be read: " + String((e && e.message) || e); return out; }
    try{
      const all = await allEntries();
      for(const a of out.anchors){
        const es = a.seg == null ? 1 : a.seg;
        const local = all.find(e => e.seq === a.seq && (e.seg || 1) === es);
        const row = { seq:a.seq, seg:es, commit:short(a.commit), iso:a.iso, remoteHead:String(a.head || "").slice(0, 16), localHead: local ? String(local.hash || "").slice(0, 16) : null, same:null };
        if(!local) row.same = null;
        else if(local.hash === a.head){ row.same = true; out.sameSeq.push(a.seq); }
        else { row.same = false; out.differSeq.push(a.seq); }
        out.compare.push(row);
      }
      out.verdict = !out.anchors.length ? "the branch holds no anchors either"
        : (out.differSeq.length ? "seq " + out.differSeq.join(", ") + " exist on both and the heads differ — two chains sharing the same numbers"
        : (out.sameSeq.length === out.anchors.length ? "every anchor's head matches this origin — one chain" : "some heads match, some do not"));
    }catch(e){ out.verdict = "the local chain could not be compared: " + String((e && e.message) || e); }
    return out;
  }
  function coveredBy(e, anchor){
    if(!anchor) return false;
    const as = anchor.seg == null ? 1 : anchor.seg;
    const es = e.seg || 1;
    return es < as || (es === as && e.seq <= (anchor.seq || 0));
  }
  async function stats(){
    const H = await head();
    const list = await allEntries();
    const anchors = await anchorList();
    const last = anchors.length ? anchors[anchors.length - 1] : null;
    const kinds = {};
    for(const e of list) kinds[e.kind] = (kinds[e.kind] || 0) + 1;
    const runNo = runNow();
    return {
      count: list.length, seg: H.seg || 1, head: H.hash || null, headShort: short(H.hash),
      alg: list.length ? (list[list.length - 1].alg || null) : null,
      sealed: H.sealedCount || 0, sealT: H.sealT || null,
      kv: !!kvFolder(), mirrorKey: LS_KEY, last: list.length ? list[list.length - 1].iso : null,
      runEntries: list.filter(e => e.run === runNo).length, run: runNo,
      kinds: kinds,
      anchors: anchors.length, unanchored: list.filter(e => !coveredBy(e, last)).length,
      lastAnchor: last ? { commit: last.commit, commitShort: short(last.commit), iso: last.iso, seq: last.seq, seg: last.seg, repo: last.repo, branch: last.branch, path: last.path } : null,
      mirrorOnly: list.filter(e => e.stored === "mirror").length
    };
  }

  /* ----------------- the canon's I-LOG (Schema V2 transcript) ---------------
     The canon already has an I-LOG and it is not mine to reinvent: `RRL/` was
     renamed **I-LOG (Incarnation Log)**, and its INDEX.md declares **Schema V2
     JSONL** — one line per utterance, `content[].data.{text,tool,state}`, colour
     coded per LFG §SCS:

        🟣 SOUL   the sovereign's words, verbatim
        ❤️ DNA    the assistant's words
        💛 REASON the reasoning — or the tool that acted

     Those files are written by the VS CODE station (`RRL-*.txt`/`*.jsonl`,
     `PastLives/RRL-CURRENT.txt`, `CANON/I-LOG-UNAUDITED/`). This writer produces
     the SAME line shape from the perchance side: the run's raw record (SOUL/DNA)
     plus one REASON line per operation the station itself performed — so one
     reader can walk both stations' logs. The canon's numbering (RRL-###, the
     incarnation counter) belongs to the VS Code station; the perchance station
     never renumbers or rewrites those files, it appends its own sessions under
     OPERATIONS/COMMANDSTATION/ILOG/. */
  const COLOUR = { SOUL:"🟣", DNA:"❤️", REASON:"💛" };
  function v2Line(role, text, tool, t){
    const r = COLOUR[role] ? role : "REASON";
    const ts = t || Date.now();
    return JSON.stringify({
      v: 2, schema: "canon-i-log-v2", source: "perchance:" + genName(), role: r, colour: COLOUR[r],
      t: ts, iso: new Date(ts).toISOString(),
      content: [{ data: { text: scrub(text), tool: tool || null, state: COLOUR[r] } }]
    });
  }
  async function transcriptV2(){
    const lines = [];
    let rrl = null;
    try{ rrl = JSON.parse(localStorage.getItem("obi_rrl_run" + runNow()) || "null"); }catch(e){}
    if(rrl && Array.isArray(rrl.entries)){
      for(const e of rrl.entries){
        const role = /^sov|soul/i.test(String(e.role || "")) ? "SOUL" : (/^dna|obi/i.test(String(e.role || "")) ? "DNA" : "REASON");
        lines.push({ role: role, text: e.text, tool: null, t: e.t });
      }
    }
    const ops = (await allEntries()).filter(e => e.run === runNow());
    for(const e of ops){
      lines.push({ role:"REASON", tool: (e.kind || "op") + (e.action ? ":" + e.action : ""),
        text: "#" + e.seq + " " + (e.detail || "") + (e.ok === false ? " [FAILED]" : ""), t: e.t });
    }
    lines.sort((a, b) => (a.t || 0) - (b.t || 0));
    return lines;
  }
  async function v2Jsonl(){
    const lines = await transcriptV2();
    return lines.map(l => v2Line(l.role, l.text, l.tool, l.t)).join("\n") + "\n";
  }
  function indexMd(){
    return [
      "# I-LOG — perchance command station",
      "",
      "Written by the perchance Command Station (https://perchance.org/" + genName() + ").",
      "",
      "## The ONE authority",
      "",
      "`" + REPO.owner + "/" + REPO.repo + "` (branch `" + REPO.branch + "`) is the one and only authoritative repo:",
      "everything we build is stored there and read from there. This directory is where the perchance station's",
      "I-LOG lands inside it. No mirror may be presented as the canon.",
      "",
      "## The gate",
      "",
      "Nothing here is written to the authority without **PHOENIXOMEGAPROTOCOL**: Sov100's password entered in the",
      "session (`/phoenixomegaprotocol <password>`, armed for 15 minutes, never past a reload). The password is never stored (only a",
      "sha-256 of it, in the browser's kv), never logged, never captured, never exported. Every attempt — armed,",
      "refused, failed — is itself an I-LOG entry, so an unarmed attempt leaves a mark.",
      "",
      "## The canon I-LOG this sits beside",
      "",
      "The canon already holds an I-LOG: the RRL vault was renamed **I-LOG (Incarnation Log)** and its",
      "`RRL/INDEX.md` declares **Schema V2 JSONL** — one line per utterance, `content[].data.{text,tool,state}`,",
      "colour coded per LFG §SCS (🟣 SOUL sovereign-verbatim · ❤️ DNA assistant · 💛 REASON reasoning/tool).",
      "The VS Code station is the authority for that vault (incarnation numbering, `RRL-CURRENT.txt`,",
      "`CANON/I-LOG-UNAUDITED/`). The perchance station does not renumber or rewrite any of it: it appends its",
      "own sessions here, in the same line shape, so one reader can walk both stations' records.",
      "",
      "## Files in this directory",
      "",
      "| file | what it is |",
      "|---|---|",
      "| `rrl-<ts>-run<N>.jsonl` | this session's transcript, canon I-LOG Schema V2 lines (SOUL/DNA from the run's raw record + one REASON line per station operation) |",
      "| `ilog-<ts>-seg<N>.jsonl` · `latest.jsonl` | the station's operation chain — append-only, sha-256 chained, one JSON object per entry |",
      "| `STATUS.md` | head, chain verification result, kinds, and the anchor history at push time |",
      "| `anchor-<ts>.json` | the exact head + verification result that this push froze |",
      "| `session-<ts>-run<N>.md` (parent dir) | the human session record |",
      "",
      "## Verification",
      "",
      "Operation-chain entry hash = sha-256 over",
      "`JSON.stringify([v, seg, seq, t, run, kind, action, detail, result, ok, ms, ref, prev])` (`ok` 1/0),",
      "chaining `prev` to the previous entry's `hash`. Recompute in order and compare to each `hash`; then",
      "compare the chain head to the newest `anchor-*.json`. A Git commit is the only witness outside the browser.",
      ""
    ].join("\n");
  }
  /* read the canon side back — what the VS Code station has already written.
     Two branches, because there are two records: this station writes its own
     chain to `master` (OPERATIONS/COMMANDSTATION/ILOG/), and the VS Code
     station's I-LOG (the Incarnation Log) lives on `canon` — `I-LOG-UNAUDITED/`
     for the per-incarnation transcripts, `RRL/` for the I-LOG directory, and
     `PastLives/RRL-CURRENT.txt` for the pointer. master's `RRL/` holds only raw
     DNA-LOG dumps and has no INDEX.md, which is why the vault used to read as
     unreadable. */
  async function pull(){
    const base = "https://api.github.com/repos/" + REPO.owner + "/" + REPO.repo;
    const out = { ok:false, dir: ILOG_DIR, files: [], errors: [], auth: !!ghToken(), target: REPO.owner + "/" + REPO.repo + "@" + REPO.branch };
    const listDir = async (dir, ref, tag) => {
      const r = await ghJson(base + "/contents/" + encodeURI(String(dir).replace(/\/$/, "")) + "?ref=" + ref);
      if(!Array.isArray(r.j)){ out.errors.push((tag || dir) + " @" + ref + ": HTTP " + r.status + " " + String((r.j && r.j.message) || "").slice(0, 60)); return null; }
      return r.j.map(f => ({ name:f.name, bytes:f.size, type:f.type })).sort((a, b) => a.name.localeCompare(b.name));
    };
    const readText = async (p, ref) => {
      const r = await ghJson(base + "/contents/" + encodeURI(p) + "?ref=" + ref);
      return (r.j && r.j.content) ? atob(String(r.j.content).replace(/\n/g, "")) : null;
    };
    try{
      out.files = (await listDir(ILOG_DIR, REPO.branch, "this station's I-LOG")) || [];
      if(out.files.length) out.ok = true;
    }catch(e){ out.errors.push("ILOG dir: " + e.message); }
    const vs = { owner:VS.owner, repo:VS.repo, branch:VS.branch, unauditedDir:VS.dir, vaultDir:VS.vault, currentPath:VS.current, read:false, unaudited:[], rrl:[], incarnations:[], index:null, current:null };
    try{
      vs.unaudited = (await listDir(VS.dir, VS.branch, "I-LOG-UNAUDITED")) || [];
      vs.rrl = (await listDir(VS.vault, VS.branch, "RRL")) || [];
      vs.index = ((await readText(VS.vault + "/INDEX.md", VS.branch)) || "").slice(0, 900) || null;
      const cur = await readText(VS.current, VS.branch);
      vs.current = cur ? cur.replace(/\s+/g, " ").slice(0, 420) : null;
      vs.read = !!(vs.unaudited.length || vs.rrl.length);
      vs.incarnations = vs.unaudited.filter(f => /\.txt$/i.test(f.name)).map(f => f.name.replace(/\.txt$/i, ""));
    }catch(e){ out.errors.push("canon branch: " + e.message); }
    if(vs.index){ out.vaultOk = true; out.vaultIndex = vs.index; }
    else if(vs.read){ out.vaultOk = true; }
    out.vs = vs;
    return out;
  }

  /* ----------------------------- git (the anchor) -------------------------- */
  async function ghJson(url, opts){
    const o = opts || {};
    const headers = Object.assign({ "Accept":"application/vnd.github+json" }, o.headers || {});
    const t = ghToken();
    if(t) headers.Authorization = "Bearer " + t;
    const r = await fetch(url, { method: o.method || "GET", headers: headers, body: o.body });
    const txt = await r.text();
    let j = null; try{ j = JSON.parse(txt); }catch(e){}
    return { status: r.status, j: j, txt: txt };
  }
  /* one primitive for every Git write in the station (canon sync, /gh backup,
     /ilog push): blobs → tree → commit → move the ref. Returns the errors rather
     than throwing, so the caller can show a partial push honestly. */
  async function gitCommitFiles(o){
    const base = "https://api.github.com/repos/" + o.owner + "/" + o.repo;
    const errors = [];
    const b64 = c => btoa(unescape(encodeURIComponent(c)));
    let baseSha = null;
    try{
      const h = await ghJson(base + "/git/refs/heads/" + o.branch);
      baseSha = (h.j && h.j.object && h.j.object.sha) || null;
      if(!baseSha && h.status !== 404) errors.push("ref read HTTP " + h.status + " " + String((h.j && h.j.message) || "").slice(0, 90));
    }catch(e){ errors.push("ref read: " + e.message); }
    const blobs = []; let pushed = 0, failed = 0;
    for(const pair of Object.entries(o.files || {})){
      const p = pair[0], c = pair[1];
      try{
        /* a text file is UTF-8 encoded here; a BINARY file arrives as {__b64} (see
           selfSourceAny in src/app.js) and is sent as-is, so the push does not route an
           image through a text decode and corrupt it. */
        const body = (c && typeof c === "object" && typeof c.__b64 === "string")
          ? { content: c.__b64, encoding: "base64" }
          : { content: b64(c), encoding: "base64" };
        const b = await ghJson(base + "/git/blobs", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
        if(b.j && b.j.sha){ blobs.push({ path:p, mode:"100644", type:"blob", sha:b.j.sha }); pushed++; }
        else { failed++; errors.push(p + " → blob HTTP " + b.status + " " + String((b.j && b.j.message) || "").slice(0, 90)); }
      }catch(e){ failed++; errors.push(p + " → " + e.message); }
    }
    /* REMOVALS. `base_tree` carries every path the previous commit held, so a file
       this station has WITHDRAWN would sit on the branch forever — adds and updates
       alone can never take it back. An entry with `sha:null` removes the path from the
       new tree. Callers pass the exact paths (o.deletes), computed from a READ of the
       branch, never guessed; nothing is removed when none are given. */
    const treeEntries = blobs.slice();
    const removed = [];
    for(const p of (o.deletes || [])){
      if(o.files && Object.prototype.hasOwnProperty.call(o.files, p)) continue;
      treeEntries.push({ path:p, mode:"100644", type:"blob", sha:null }); removed.push(p);
    }
    if(!treeEntries.length) return { pushed:pushed, failed:failed, removed:removed, commitSha:null, baseSha:baseSha, errors:errors };
    try{
      const tree = await ghJson(base + "/git/trees", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ base_tree: baseSha || undefined, tree: treeEntries }) });
      const treeSha = tree.j && tree.j.sha;
      if(!treeSha){ errors.push("tree HTTP " + tree.status + " " + String((tree.j && tree.j.message) || "").slice(0, 90)); return { pushed:pushed, failed:failed + 1, removed:removed, commitSha:null, baseSha:baseSha, errors:errors }; }
      const commit = await ghJson(base + "/git/commits", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ message: o.message, tree: treeSha, parents: baseSha ? [baseSha] : [] }) });
      const commitSha = commit.j && commit.j.sha;
      if(!commitSha){ errors.push("commit HTTP " + commit.status + " " + String((commit.j && commit.j.message) || "").slice(0, 90)); return { pushed:pushed, failed:failed + 1, removed:removed, commitSha:null, baseSha:baseSha, treeSha:treeSha, errors:errors }; }
      const ref = await ghJson(base + "/git/refs/heads/" + o.branch, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ sha: commitSha }) });
      if(!(ref.j && ref.j.object && ref.j.object.sha)){
        errors.push("ref move HTTP " + ref.status + " " + String((ref.j && ref.j.message) || "").slice(0, 90));
        return { pushed:pushed, failed:failed + 1, removed:removed, commitSha:commitSha, baseSha:baseSha, treeSha:treeSha, errors:errors };
      }
      return { pushed:pushed, failed:failed, removed:removed, commitSha:commitSha, baseSha:baseSha, treeSha:treeSha, errors:errors };
    }catch(e){
      errors.push(e.message);
      return { pushed:pushed, failed:failed + 1, removed:removed, commitSha:null, baseSha:baseSha, errors:errors };
    }
  }

  /* ------------------------------- rendering ------------------------------- */
  function entryLine(e, max){
    const detail = e.detail ? String(e.detail).replace(/\s+/g, " ").slice(0, max || 96) : "";
    const tail = (e.ok === false ? '<span class="vd" style="color:#ff5a5a">FAILED</span>' : "") + (e.ms != null ? ' <span class="rd">' + e.ms + 'ms</span>' : "");
    return '<div class="rrow"><b>' + E(e.kind) + (e.action ? ' · ' + E(e.action) : "") + '</b>'
      + '<span class="vd">#' + E(e.seq) + (e.seg && e.seg > 1 ? "/s" + E(e.seg) : "") + '</span>'
      + '<div class="rd">' + E(e.iso ? e.iso.slice(11, 19) + "Z" : "") + (detail ? " · " + E(detail) : "") + tail + '</div></div>';
  }
  async function markdown(limit){
    const list = await entries({ limit: limit || 60 });
    const st = await stats();
    const v = await verify();
    const L = [];
    L.push("## I-LOG — the station's operation record");
    L.push("");
    L.push("- **Entries**: " + st.count + " · segment " + st.seg + " · this run " + st.runEntries + " (run " + (st.run == null ? "?" : st.run) + ")");
    L.push("- **Head**: `" + (st.head || "none") + "` (" + (st.alg || "?") + ")");
    L.push("- **Chain verify**: " + (v.ok ? "OK" : "BROKEN") + " · " + v.checked + " entries recomputed in " + v.ms + "ms" + (v.breaks.length ? " · first break seq " + v.breaks[0].seq + " (" + v.breaks[0].hash + ")" : ""));
    L.push("- **Anchors**: " + st.anchors + " · unanchored entries " + st.unanchored + (st.lastAnchor ? " · last commit `" + st.lastAnchor.commit + "` at " + st.lastAnchor.iso : " · never pushed"));
    if(st.sealed) L.push("- **Sealed**: " + st.sealed + " entries before " + (st.sealT ? new Date(st.sealT).toISOString() : "?") + " (a seal keeps history — it never deletes it)");
    L.push("");
    L.push("| # | when | run | kind | action | detail | ok | ms |");
    L.push("|---|------|-----|------|--------|--------|----|----|");
    for(const e of list){
      const cell = s => String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\s+/g, " ").slice(0, 120);
      L.push("| " + e.seq + " | " + cell(e.iso) + " | " + (e.run == null ? "" : e.run) + " | " + cell(e.kind) + " | " + cell(e.action) + " | " + cell(e.detail) + " | " + (e.ok === false ? "NO" : "yes") + " | " + (e.ms == null ? "" : e.ms) + " |");
    }
    L.push("");
    L.push("_Full record (every segment, machine-readable): `ILOG/latest.jsonl` · verification: recompute sha-256 over `JSON.stringify([v, seg, seq, t, run, kind, action, detail, result, ok, ms, ref, prev])` per entry, chaining `prev` to the prior entry's `hash`._");
    return L.join("\n");
  }
  function jsonl(list){
    return list.map(e => JSON.stringify(e)).join("\n") + "\n";
  }
  async function card(gate){
    const st = await stats();
    const v = await verify();
    const list = await entries({ limit: 12 });
    const anchors = (await anchorList()).slice(-4).reverse();
    const kindChips = Object.keys(st.kinds).sort((a, b) => st.kinds[b] - st.kinds[a]).map(k => '<span class="chip">' + E(k) + " " + st.kinds[k] + '</span>').join(" ");
    const row = (k, v2, cls) => '<div class="rrow' + (cls || "") + '"><b>' + E(k) + '</b><span class="vd"></span><div class="rd">' + v2 + '</div></div>';
    let html = '<div class="rise"><div class="rhead">🧾 /ilog — the station\'s operation record</div>';
    html += row("AUTHORITY", "ONE repo: <b>" + E(REPO.owner + "/" + REPO.repo) + "</b>@" + E(REPO.branch) + " · everything under <span class=\"rd\">" + E(ILOG_DIR) + "</span>"
      + (gate ? ' · gate <b>' + (gate.armed ? "ARMED " + E(gate.minsLeft) + "m" : (gate.enrolled ? "LOCKED — /phoenixomegaprotocol &lt;password&gt;" : "NO PASSWORD ENROLLED — /phoenixomegaprotocol set")) + '</b>' : " · writes require PHOENIXOMEGAPROTOCOL (<b>/phoenixomegaprotocol</b>)"));
    html += row("ENTRIES", st.count + " in the chain · <b>" + st.runEntries + "</b> this run · segment " + st.seg + (st.sealed ? " · " + st.sealed + " sealed before " + E(st.sealT ? new Date(st.sealT).toLocaleString() : "?") : ""));
    html += row("CHAIN", "head <b>" + E(st.headShort) + "…</b> · " + E(st.alg || "?") + " · "
      + (v.ok ? '<span class="chip" style="background:#4cd97b">VERIFIED</span> ' + v.checked + " recomputed in " + v.ms + "ms"
              : '<span class="chip" style="background:#ff5a5a">BROKEN</span> ' + (v.breaks.length ? "first break #" + E(v.breaks[0].seq) + " (" + E(v.breaks[0].hash) + ")" : E(v.why || "unverifiable"))));
    html += row("STORAGE", "kv <b>" + (st.kv ? "ilog folder" : "UNREACHABLE") + "</b> · mirror <span class=\"rd\">localStorage " + E(st.mirrorKey) + "</span> (last " + TAIL + ")" + (st.mirrorOnly ? ' · <b style="color:#f5a623">' + st.mirrorOnly + " entries never reached kv</b>" : ""));
    html += row("GIT ANCHOR", st.lastAnchor
      ? '<b>' + E(st.lastAnchor.commitShort) + '…</b> · ' + E(st.lastAnchor.iso) + ' · ' + E(st.lastAnchor.repo) + '@' + E(st.lastAnchor.branch)
        + '<br>unanchored since: <b>' + st.unanchored + '</b> entr' + (st.unanchored === 1 ? "y" : "ies") + (st.unanchored ? ' <span class="rd">— they ride the next push</span>' : ' <span class="chip" style="background:#4cd97b">EVERYTHING ANCHORED</span>')
      : '<span class="chip" style="background:#f5a623">NEVER PUSHED</span> ' + (ghToken() ? "a token is stored — <b>/ilog push</b> writes the chain to " + E(REPO.owner + "/" + REPO.repo) : "no GitHub token in this browser — <b>/gh token &lt;PAT&gt;</b> then <b>/ilog push</b> (the record is only on this origin until then)"));
    if(kindChips) html += row("KINDS", kindChips);
    html += row("CANON I-LOG", 'the VS Code station owns the canon vault — <span class="rd">RRL/ = I-LOG (Incarnation Log)</span>, Schema V2 lines <span class="rd">content[].data.{text,tool,state}</span> · 🟣SOUL ❤️DNA 💛REASON. It is on <b>branch ' + E(VS.branch) + '</b>, not ' + E(REPO.branch) + ': <span class="rd">' + E(VS.dir) + '/I-LOG-Incarnate-&lt;N&gt;-&lt;topic&gt;.txt</span> (+ <span class="rd">-COLORIZED.md</span> + <span class="rd">-STATS.json</span>), <span class="rd">' + E(VS.vault) + '/</span>, pointer <span class="rd">' + E(VS.current) + '</span>. This station writes its own sessions beside them: <span class="rd">' + E(ILOG_DIR) + '</span> (<b>rrl-*.jsonl</b> in the same line shape + the operation chain). It never renumbers or rewrites the vault — <b>/ilog pull</b> reads it back.');
    html += row("LAST " + list.length, list.length ? list.slice().reverse().map(e => entryLine(e)).join("") : '<span class="rd">nothing logged yet</span>');
    if(anchors.length){
      html += row("ANCHORS", anchors.map(a => '<div class="rd">' + E(short(a.commit)) + '… · ' + E(a.iso) + ' · ' + (a.count || "?") + ' entries · <span class="rd">' + E(a.path || "") + '</span></div>').join(""));
    }
    html += '<div class="rfoot"><b>/ilog verify</b> recompute the whole chain · <b>/ilog push</b> anchor it on Git · <b>/ilog pull</b> read the canon back · <b>/ilog export</b> download the JSONL · <b>/ilog anchors</b> every commit · <b>/ilog reset</b> seal + start a new segment (never deletes). The record is written by the station itself — if an operation is not in here, it did not happen through this station.</div></div>';
    return html;
  }

  /* --------------------------------- push ---------------------------------- */
  async function push(opts){
    opts = opts || {};
    const ts = nowIso().replace(/[:.]/g, "-").slice(0, 23);
    const H = await head();
    const st = await stats();
    const list = await allEntries();
    const v = await verify();
    const anchors = await anchorList();
    const seg = H.seg || 1;
    const json = jsonl(list);
    const v2 = await v2Jsonl();
    const statusMd = await markdown(200);
    const status = [
      "# I-LOG — station record status",
      "",
      "- **Pushed at**: " + nowIso(),
      "- **Generator**: " + genName(),
      "- **Head**: `" + (H.hash || "none") + "` (" + (st.alg || "?") + ") · segment " + seg + " · entries " + list.length,
      "- **Chain verify at push time**: " + (v.ok ? "OK" : "BROKEN") + " · " + v.checked + " recomputed · breaks " + v.breaks.length,
      "- **Unanchored before this push**: " + st.unanchored,
      "- **Canon transcript (Schema V2 lines)**: " + (v2 ? v2.trim().split("\n").length : 0),
      "",
      statusMd,
      ""
    ].join("\n");
    const anchorJson = JSON.stringify({
      ts: ts, generator: genName(), head: H, verify: { ok: v.ok, checked: v.checked, breaks: v.breaks },
      entries: list.length, kinds: st.kinds, anchors: anchors.map(a => ({ commit: a.commit, iso: a.iso, seq: a.seq, seg: a.seg, head: a.head }))
    }, null, 2);
    const files = {};
    files[ILOG_DIR + "latest.jsonl"] = json;
    files[ILOG_DIR + "ilog-" + ts + "-seg" + seg + ".jsonl"] = json;
    files[ILOG_DIR + "rrl-" + ts + "-run" + (runNow() == null ? "?" : runNow()) + ".jsonl"] = v2;
    files[ILOG_DIR + "STATUS.md"] = status;
    files[ILOG_DIR + "anchor-" + ts + ".json"] = anchorJson;
    files[ILOG_DIR + "INDEX.md"] = indexMd();
    files[ILOG_DIR + "README.md"] = ILOG_README;
    const sizes = Object.keys(files).map(p => ({ path:p, bytes: files[p].length }));
    const bytes = sizes.reduce((n, s) => n + s.bytes, 0);
    const plan = { ts:ts, seg:seg, head:H.hash || null, entries:list.length, files:sizes, bytes:bytes, target: REPO.owner + "/" + REPO.repo + "@" + REPO.branch, verify: v.ok, unanchored: st.unanchored };
    if(!ghToken()) return Object.assign({ ok:false, dryRun:true, reason:"NO_TOKEN", plan:plan }, plan);
    if(opts.dryRun) return Object.assign({ ok:false, dryRun:true, reason:"DRY_RUN", plan:plan }, plan);

    const r = await gitCommitFiles({
      owner: REPO.owner, repo: REPO.repo, branch: REPO.branch, files: files,
      message: "i-log anchor " + ts + " · head " + short(H.hash) + " · " + list.length + " entries · seg " + seg
    });
    let anchor = null;
    const f = kvFolder();
    if(r.commitSha && f){
      anchor = { t: Date.now(), iso: nowIso(), commit: r.commitSha, branch: REPO.branch, repo: REPO.owner + "/" + REPO.repo, seq: H.headSeq || H.count || list.length, seg: seg, head: H.hash || null, count: list.length, pushed: r.pushed, failed: r.failed, path: ILOG_DIR + "ilog-" + ts + "-seg" + seg + ".jsonl" };
      try{ await f.set("anchor:" + r.commitSha, anchor); }catch(e){}
    }
    return Object.assign({
      ok: !!r.commitSha && r.failed === 0, dryRun:false, ts:ts, seg:seg, head:H.hash || null, entries:list.length,
      pushed: r.pushed, failed: r.failed, commitSha: r.commitSha || null, commitShort: short(r.commitSha), baseSha: r.baseSha || null,
      errors: r.errors, anchor: anchor, bytes: bytes, files: sizes, plan: plan
    });
  }

  /* -------------------------------- the seal ------------------------------- */
  async function reset(note){
    const H = await head();
    const list = await allEntries();
    const seg = (H.seg || 1) + 1;
    const seal = { t: Date.now(), iso: nowIso(), seg: seg, count: 0, hash: H.hash || null, sealedCount: list.length, sealedSeg: H.seg || 1, note: note || null };
    const f = kvFolder();
    if(f){
      try{ await f.set("seal:" + seg, seal); await f.set("head", { seg: seg, count: 0, hash: H.hash || null, prevHash: null, headSeq: 0, t: seal.t, iso: seal.iso, alg: H.alg || null, sealedCount: list.length, sealT: seal.t }); }catch(e){}
    }
    cached = { seg: seg, count: 0, hash: H.hash || null, t: seal.t, sealedCount: list.length, sealT: seal.t };
    const m = mirrorRead(); m.seg = seg; m.count = 0; m.sealedCount = list.length; m.sealT = seal.t; mirrorWrite(m);
    const e = await append({ kind:"seal", action:"reset", detail: (note ? note + " · " : "") + "segment " + seg + " opened · " + list.length + " entries sealed at head " + short(H.hash) + " (history kept, nothing deleted)", result: "seg" + seg });
    return { seg: seg, sealed: list.length, prevHead: H.hash || null, entry: e };
  }

  /* -------------------------------- export --------------------------------- */
  async function exportFile(){
    const list = await allEntries();
    const st = await stats();
    const ts = nowIso().replace(/[:.]/g, "-").slice(0, 19);
    const name = "obi-ilog-" + genName() + "-" + ts + ".jsonl";
    const body = jsonl(list);
    try{
      const url = URL.createObjectURL(new Blob([body], { type:"application/x-ndjson" }));
      const a = document.createElement("a"); a.href = url; a.download = name; a.style.display = "none";
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2500);
    }catch(e){}
    return { name: name, entries: list.length, bytes: body.length, kinds: st.kinds };
  }

  const ILOG_README = [
    "# I-LOG — the Command Station's operation record",
    "",
    "Written by the perchance generator (https://perchance.org/" + genName() + ") on every operation it performs.",
    "It lives under the ONE authoritative repo — " + REPO.owner + "/" + REPO.repo + " (branch " + REPO.branch + ") — and",
    "nothing is written there without PHOENIXOMEGAPROTOCOL (Sov100's password, armed with /phoenixomegaprotocol; refusals are recorded).",
    "Companion of the canon I-LOG (the RRL vault, renamed **I-LOG (Incarnation Log)**, Schema V2 JSONL",
    "`content[].data.{text,tool,state}`, roles/colours per LFG §SCS: 🟣 SOUL · ❤️ DNA · 💛 REASON) which the",
    "VS Code station writes. That vault is on the **`" + VS.branch + "` branch**, not `" + REPO.branch + "`:",
    "`" + VS.dir + "/I-LOG-Incarnate-<N>-<topic>.txt` (+ `-COLORIZED.md` + `-STATS.json`), `" + VS.vault + "/`",
    "with its own INDEX.md, and the living pointer `" + VS.current + "`. `rrl-*.jsonl` in this directory is this",
    "station's transcript in that same line shape; the operation chain below is the tamper-evident record of",
    "the stations' own actions. `/ilog pull` reads both branches back.",
    "",
    "Each line of `ilog-*.jsonl` is one entry:",
    "",
    "```json",
    '{ "v":1, "seg":1, "seq":1, "t":1758400000000, "iso":"2026-09-21T21:05:56.000Z", "run":1, "kind":"cmd",',
    '  "action":"ilog", "detail":"/ilog push", "result":"…", "ok":true, "ms":12, "ref":null,',
    '  "prev":"…", "hash":"…", "alg":"sha-256", "stored":"kv" }',
    "```",
    "",
    "- `hash` = sha-256 over `JSON.stringify([v, seg, seq, t, run, kind, action, detail, result, ok, ms, ref, prev])`",
    "  where `ok` is 1/0 and `prev` is the previous entry's `hash` (chain). `stored`/`err`/anchors are outside the hash.",
    "- `seg` increments only on an explicit seal (`/ilog reset`), which never deletes: the sealed entries stay in the log.",
    "- `anchor-*.json` + `STATUS.md` are written at push time and name the head that was anchored by the commit.",
    "",
    "To verify a downloaded file: recompute the hash chain in order and compare to each `hash` field; then compare the",
    "chain head against the newest `anchor-*.json`. A commit is the only witness outside the browser.",
    "",
    "INDEX.md in this directory carries the same schema notes in whichever direction a reader arrives."
  ].join("\n");

  window.ObiILog = {
    VERSION: VERSION, KV_FOLDER: KV_FOLDER, LS_KEY: LS_KEY, TAIL: TAIL, REPO: REPO, VS: VS, DIR: ILOG_DIR,
    append: append, entries: entries, all: allEntries, head: head, verify: verify, stats: stats,
    anchors: anchorList, remoteAnchors: remoteAnchors, markdown: markdown, jsonl: jsonl, card: card, push: push, reset: reset,
    anchorRecord: anchorRecord, migrate: migrate, keyOf: keyOf, restore: restoreEntry,
    exportFile: exportFile, gitCommitFiles: gitCommitFiles, ghJson: ghJson, hashOf: hashOf, payloadOf: payloadOf,
    transcriptV2: transcriptV2, v2Jsonl: v2Jsonl, indexMd: indexMd, pull: pull, v2Line: v2Line, COLOUR: COLOUR,
    readme: ILOG_README, kvAvailable: () => !!kvFolder()
  };
  /* the one global every other module calls */
  if(typeof window !== "undefined") window.ilog = append;
})();
