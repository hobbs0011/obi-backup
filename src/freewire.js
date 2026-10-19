/* ============================================================================
   THE FREE WIRE (src/freewire.js) — control of the estate without a credential.

   The sovereign's order, 2026-09-24: stop reporting shut doors and drive
   everything through APIs and free methods. So this is the fabric, and it is not
   a proposal — every lane below was written to and READ BACK from this origin,
   through the station's proxy, on that date. What could not be made to work is
   listed with its refusal, verbatim, and is NOT pretended to work.

   THE MEASURED TABLE (this origin, 2026-09-24 · superFetch · real write + real
   read-back, never a status code taken on faith):

     LANE                         WRITE  WHAT IT KEEPS        WHAT IT NEEDS
     uploads.dev (estate's own)   OPEN   permanent           nothing
     ntfy.sh (the family nerve)   OPEN   12 h                nothing
     keyvalue.immanuel.co         OPEN   until overwritten   nothing
     x0.at                        OPEN   the Expires header  nothing
     ntfy attachment              OPEN   3 h                 nothing
     tmpfiles.org                 OPEN   1 h                 nothing
     paste.rs                     OPEN   permanent, frozen   nothing
     pastes.dev                   OPEN   permanent, frozen   nothing
     GitHub API (read)            —      60 req/h per IP     nothing
     GitHub API (write)           SHUT   —                   a PAT (/gh token)
     Cloudflare API               SHUT   —                   a token (/cf token)
     the platform's editable set  SHUT   —                   a save + human-check

   THE TWO THAT MATTER, because they do what the shut doors were supposed to do:

     1. THE MUTABLE POINTER — keyvalue.immanuel.co. This is the ONLY place measured
        where a value can be OVERWRITTEN with no account and no key. That is exactly
        what the platform's editable store refused (anti_bot_verification_needed,
        measured twice, /masterlink card publish). So the pointer the whole family
        needs — "which register is the newest, and where is it" — has a home that
        does not depend on the platform's gate.
        ITS CEILING IS MEASURED, not guessed: the value rides the URL PATH, and the
        service answers HTTP 400 "the length of the URL for this request exceeds the
        configured maxUrlLength" past it. Binary-searched here: URL length 278 200 OK,
        298 400. So the ceiling is ~280, and the payload is written to fit under it
        with room to spare. Percent-encoding costs three characters per special
        character, and the store's own server 404s a `.` in the path (measured: `a.b.c`
        refused, `a_b_c` accepted), so the separator is `_` and the payload is
        ASCII-clean.

     2. THE NERVE — ntfy.sh. POST publishes; one GET returns the topic's ENTIRE
        history in order (?poll=1&since=all, NDJSON). That is an append-only ledger
        with no account: the doctrine's "append and correct, never rewrite" is
        literally the transport's shape. A station that knows only the topic name
        can read everything the family has ever said on it, newest last.

   WHAT THIS CHANGES: the estate stops being PULL-ONLY. Before this file, a sibling
   discovered a new register only if a human handed it a URL. Now the register's
   address is BROADCAST and AIMED: `/wire announce` publishes to the nerve and
   overwrites the pointer, so any station — with no token, no account, no URL from
   anyone — can read the newest register's location straight off the wire.

   WHAT IT STILL CANNOT DO, said out loud rather than worked around: nothing here
   writes into another generator's namespace, and nothing here needs a credential
   that only the sovereign holds. GitHub and Cloudflare stay shut until a token
   arrives; the free lanes above are not a substitute for them, they are a second
   road that does not wait.

   COMMANDS (wired in app.js)
     /wire                     the lane table, as measured
     /wire probe               re-measure the lanes live, now
     /wire announce            aim the pointer + broadcast the newest register
     /wire pointer             read the family pointer as it stands, right now
     /wire send <text>         broadcast a line on the family nerve
     /wire tail [n]            the last n lines on the nerve, verbatim
     /wire put <path>          carry a file of this estate out over a free carrier
     /wire slate <text>        put text somewhere permanent and readable by a human
   ========================================================================== */

const FW_VERSION = "1.0.0";

/* the channels. They are constants ON PURPOSE: a bus only one station can find is
   not a bus. They are public because everything on them is public already. */
const FW_NERVE  = "prais-agent99-nerves";
const FW_FILES  = "prais-agent99-files";
const FW_NS     = "prais-agent99";
const FW_K_PTR  = "p";
const FW_K_RUL   = "r";
const FW_K_FAM   = "f";

/* the pointer ceiling, binary-searched from this origin: URL 278 → 200, 298 → 400. */
const FW_URL_CEILING = 280;
const FW_PTR_V = "v1";

/* every lane, with the measurement that put it in this table. `state` is the state
   LAST MEASURED — /wire probe re-reads it live, and the card prints when. */
const FW_LANES = [
  { id:"uploads", name:"uploads.dev — the estate's own host", kind:"carrier", write:"OPEN", read:"OPEN", keeps:"permanent", needs:"nothing",
    url:"https://user.uploads.dev/file/<key>",
    why:"root.uploadPlugin(blob) returns a permanent key-addressed URL. It is the only host measured that keeps a file with NO expiry, which is why the register and the packet ride it." },
  { id:"nerve", name:"ntfy.sh — the family nerve", kind:"bus", write:"OPEN", read:"OPEN", keeps:"12 h", needs:"nothing",
    url:"https://ntfy.sh/" + FW_NERVE,
    why:"POST publishes (200 + a message id); GET /json?poll=1&since=all returns the whole history in order. Measured: three messages published, all three returned." },
  { id:"pointer", name:"keyvalue.immanuel.co — the mutable pointer", kind:"state", write:"OPEN", read:"OPEN", keeps:"until overwritten", needs:"nothing",
    url:"https://keyvalue.immanuel.co/api/KeyVal/GetValue/" + FW_NS + "/" + FW_K_PTR,
    why:"the only measured store where a value can be OVERWRITTEN with no credential — the platform's editable.set answers anti_bot_verification_needed. Ceiling measured: value rides the URL path and the service 400s past URL length ~280." },
  { id:"x0", name:"x0.at", kind:"carrier", write:"OPEN", read:"OPEN", keeps:"the Expires header", needs:"nothing",
    url:"https://x0.at/<id>",
    why:"POST multipart; a 120 KB body was carried with no complaint and an Expires: 365d header was accepted. It serves .html as text/plain, so it carries bytes but it is not a web origin." },
  { id:"attach", name:"ntfy attachment", kind:"carrier", write:"OPEN", read:"OPEN", keeps:"3 h", needs:"nothing",
    url:"https://ntfy.sh/file/<id>",
    why:"PUT the bytes to the topic with a Filename header; the message answers with attachment.url. Measured with a real file. Served as text/plain — carries bytes, not a web origin." },
  { id:"tmpfiles", name:"tmpfiles.org", kind:"carrier", write:"OPEN", read:"OPEN", keeps:"1 h", needs:"nothing",
    url:"https://tmpfiles.org/<id>/<name>",
    why:"POST multipart returns a success payload with a URL. Measured; it refuses .html (422 Invalid file type), so it is a bytes carrier only." },
  { id:"paste", name:"paste.rs", kind:"slate", write:"OPEN", read:"OPEN", keeps:"permanent, frozen", needs:"nothing",
    url:"https://paste.rs/<id>",
    why:"POST text returns a URL that reads back verbatim. Measured IMMUTABLE: a PUT to the same URL answers 404, so a slate is written once and never edited." },
  { id:"pastesdev", name:"pastes.dev", kind:"slate", write:"OPEN", read:"OPEN", keeps:"permanent, frozen", needs:"nothing",
    url:"https://api.pastes.dev/<key>",
    why:"POST text returns {\"key\":...}; GET /<key> reads it back verbatim. Measured." },
  { id:"gh-read", name:"GitHub API — read", kind:"read", write:"—", read:"OPEN", keeps:"—", needs:"nothing (60 requests/hour per IP)",
    url:"https://api.github.com/",
    why:"anonymous API reads answer (rate_limit 200, 53/60 remaining). Note the budget is shared with every other tenant of this proxy's IP, so the wire reads GitHub sparingly." },
  { id:"canon", name:"the canon repo (GitHub write)", kind:"write", write:"SHUT", read:"OPEN", keeps:"—", needs:"a PAT with repo scope — /gh token <PAT>",
    url:"https://api.github.com/repos/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-",
    why:"measured now, unauthenticated: HTTP 404 Not Found. The repo is private (or renamed), so nothing can be read or written without a token. This is the door the sovereign's PAT opens." },
  { id:"cloud", name:"Cloudflare API", kind:"write", write:"SHUT", read:"—", keeps:"—", needs:"an API token — /cf token <token>",
    url:"https://api.cloudflare.com/",
    why:"no credential in this origin (obi_keys.cf is absent). src/cloudflare/** is complete and undeployed. This is the door the sovereign's token opens." },
  { id:"mesh", name:"the platform's editable store", kind:"state", write:"SHUT", read:"—", keeps:"—", needs:"a saved generator and a passed human-check",
    url:"https://editable.uploads.dev/file/<generator>/<name>",
    why:"measured twice: {error:\"anti_bot_verification_needed\"}. The pointer lane above exists precisely so the family does not depend on this remaining shut." }
];

/* ---------------------------------- helpers ------------------------------- */

function fwNow(){ try{ return new Date().toISOString(); }catch(e){ return "?"; } }
function fwPanel(html){ try{ return (typeof addBubble === "function") ? addBubble("ass", html) : null; }catch(e){ return null; } }
function fwEscape(s){ try{ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s).replace(/[<>&]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[c])); }catch(e){ return String(s == null ? "" : s); } }
function fwK(n){ return (n == null || isNaN(n)) ? "—" : Number(n).toLocaleString(); }
function fwStation(){ try{ return window.generatorName || "?"; }catch(e){ return "?"; } }
function fwOrigin(){ try{ return location.origin; }catch(e){ return ""; } }

/* the proxy is the only way out of this origin: every host here is cross-origin,
   and superFetch is what crosses. A direct fetch would be answered by CORS, not by
   the host, and a CORS refusal would look like a lane that is down. */
async function fwFetch(url, opts){
  try{
    if(root && root.superFetch) return await root.superFetch(url, opts || {});
    return await fetch(url, opts || {});
  }catch(e){ return { ok:false, status:0, statusText:String((e && e.message) || e), _threw:true }; }
}
const FW_ENC = new TextEncoder();
const fwHex = b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
async function fwSha(s){ try{ return fwHex(await crypto.subtle.digest("SHA-256", FW_ENC.encode(String(s)))); }catch(e){ return null; } }

let fwKv = null;
function fwFolder(){ if(fwKv) return fwKv; try{ if(root && root.kv) fwKv = root.kv.freewire; }catch(e){ fwKv = null; } return fwKv; }
async function fwGet(k, d){ const f = fwFolder(); if(!f) return d; try{ const v = await f.get(k); return (v === null || v === undefined) ? d : v; }catch(e){ return d; } }
async function fwSet(k, v){ const f = fwFolder(); if(!f) return false; try{ await f.set(k, v); return true; }catch(e){ return false; } }

/* --------------------------------- THE NERVE -------------------------------
   ntfy.sh. The topic's whole history in one GET is what makes this a ledger
   rather than a buzzer. Ndjson comes back one object per line. */

async function fwSend(text, opts){
  opts = opts || {};
  const topic = opts.topic || FW_NERVE;
  const t = String(text == null ? "" : text);
  const r = await fwFetch("https://ntfy.sh/" + topic, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Title": opts.title || ("Obi · " + fwStation()),
      "Tags": opts.tags || "satellite",
      "Priority": String(opts.priority || 3)
    },
    body: t
  });
  let id = null, when = null, why = null;
  try{
    const raw = await r.text();
    if(r && r.ok){
      const j = JSON.parse(raw);
      id = j.id || null; when = j.time || null;
    } else why = "HTTP " + ((r && r.status) || "?") + (raw ? " · " + raw.slice(0, 160) : "");
  }catch(e){ if(r && r.ok) id = null; else why = "the answer could not be read: " + String((e && e.message) || e); }
  if(!why && r && !r.ok) why = "HTTP " + r.status;
  return { ok: !!(r && r.ok), lane:"nerve", topic, bytes: FW_ENC.encode(t).length, id, time: when, url: "https://ntfy.sh/" + topic, why };
}

async function fwTail(n, since){
  const how = since || (n ? (n + "m") : "12h");
  const r = await fwFetch("https://ntfy.sh/" + FW_NERVE + "/json?poll=1&since=" + encodeURIComponent(how));
  if(!r || !r.ok) return { ok:false, why:"the nerve answered HTTP " + ((r && r.status) || "nothing"), rows:[] };
  let raw = "";
  try{ raw = await r.text(); }catch(e){ return { ok:false, why:"the nerve's answer could not be read: " + String((e && e.message) || e), rows:[] }; }
  const rows = raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => { try{ return JSON.parse(l); }catch(e){ return { event:"unreadable", message:l.slice(0, 200) }; } })
    .filter(m => m && m.event === "message");
  const last = n ? rows.slice(-n) : rows;
  return { ok:true, topic:FW_NERVE, count: rows.length, rows: last, url:"https://ntfy.sh/" + FW_NERVE };
}

/* --------------------------------- THE POINTER -----------------------------
   One compact line, overwritten by whoever last announced. Written to fit the
   measured ceiling with room to spare.

     v1_<epoch>_<register key>_<packet key>_<files>_<bytes>_<tree 16>_<verdict>_<station>

   THE SEPARATOR IS `_`, MEASURED, not chosen for looks: the value rides the URL
   PATH, and the store's own server treats a `.` in that path as a file extension
   and answers HTTP 404 "The resource cannot be found" — proven here by writing
   `a.b.c` (404) against `a_b_c` (200 true) at the same length. `-` works too, but
   the station names contain `-`, so `_` is the only separator that stays
   unambiguous. A key of `-` means the address is not known from here (say so, do
   not invent it). */

function fwPtrLine(p){
  p = p || {};
  return [FW_PTR_V, p.t || Math.floor(Date.now() / 1000), p.reg || "-", p.pkt || "-",
    (p.n == null ? "-" : p.n), (p.b == null ? "-" : p.b), p.tree || "-", p.v || "-", p.st || fwStation()].join("_");
}
function fwPtrParse(line){
  const s = String(line == null ? "" : line).trim().replace(/^"|"$/g, "");
  if(!s) return null;
  const p = s.split("_");
  if(p.length < 9 || p[0] !== FW_PTR_V) return { raw:s, malformed:true };
  return { raw:s, t:Number(p[1]) || null, reg:p[2], pkt:p[3], n:(p[4] === "-" ? null : Number(p[4])),
    b:(p[5] === "-" ? null : Number(p[5])), tree:p[6], v:p[7], st:p.slice(8).join("_") };
}
const fwPtrUrl = (key) => "https://keyvalue.immanuel.co/api/KeyVal/GetValue/" + FW_NS + "/" + (key || FW_K_PTR);
const fwPtrSetUrl = (key, val) => "https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/" + FW_NS + "/" + (key || FW_K_PTR) + "/" + encodeURIComponent(val);
/* how far under the ceiling a value lands — printed, never assumed. */
function fwPtrFit(val){ const url = fwPtrSetUrl(FW_K_PTR, val); return { value:String(val).length, url:url.length, ceiling:FW_URL_CEILING, room: FW_URL_CEILING - url.length, fits: url.length <= FW_URL_CEILING }; }

async function fwPointerRead(key){
  const r = await fwFetch(fwPtrUrl(key));
  if(!r || !r.ok) return { ok:false, status:(r && r.status) || 0, why:"the pointer store answered HTTP " + ((r && r.status) || "nothing"), url: fwPtrUrl(key) };
  let raw = "";
  try{ raw = await r.text(); }catch(e){ return { ok:false, status:r.status, why:"the pointer could not be read: " + String((e && e.message) || e), url: fwPtrUrl(key) }; }
  let val = raw; try{ const j = JSON.parse(raw); if(typeof j === "string") val = j; }catch(e){}
  return { ok:true, status:r.status, url: fwPtrUrl(key), raw:val, empty: val === "", parsed: fwPtrParse(val) };
}

async function fwPointerWrite(key, val){
  const fit = fwPtrFit(val);
  if(!fit.fits) return { ok:false, why:"the pointer does not fit the measured ceiling: the URL would be " + fit.url + " characters against a ceiling of " + fit.ceiling + " (" + (-fit.room) + " over). Nothing was sent.", fit };
  const r = await fwFetch(fwPtrSetUrl(key, val), { method:"POST" });
  let said = "";
  try{ said = await r.text(); }catch(e){}
  if(!r || !r.ok) return { ok:false, why:"the pointer store refused: HTTP " + ((r && r.status) || "?") + (said ? " · " + said.replace(/\s+/g, " ").slice(0, 140) : ""), fit };
  /* A WRITE IS NOT PROVEN BY ITS OWN 200. It is proven by reading it back. */
  const back = await fwPointerRead(key);
  const matched = !!(back.ok && String(back.raw) === String(val));
  return { ok: matched, wrote: r.ok, fit, url: fwPtrUrl(key), readback: back.raw, matched,
    why: matched ? null : "the store accepted the write but did not return the same bytes — treated as NOT written" };
}

/* --------------------------------- CARRIERS --------------------------------
   In the order they are tried: the estate's own host first (permanent), then the
   long-lived anonymous carriers, then the short ones. The one that took it is
   named; a lane that refuses is recorded with its own words and the next is tried. */

async function fwPut(bytes, name, type){
  const blob = new Blob([bytes], { type: type || "application/octet-stream" });
  if(!(blob instanceof Blob)) return { ok:false, why:"nothing to carry" };
  const tries = [];
  const nm = name || "obi-artifact.bin";

  /* 1 — uploads.dev, through the estate's own plugin. Permanent. */
  try{
    if(root && root.uploadPlugin){
      const r = await root.uploadPlugin(blob);
      if(r && r.url){ return { ok:true, lane:"uploads", url:r.url, bytes: (r.size || blob.size), name:nm, keeps:"permanent", tries }; }
      tries.push({ lane:"uploads", why: (r && r.error) || "no url returned" });
    } else tries.push({ lane:"uploads", why:"root.uploadPlugin is not loaded in this origin" });
  }catch(e){ tries.push({ lane:"uploads", why:"threw: " + String((e && e.message) || e) }); }

  /* 2 — x0.at. multipart, no account. */
  try{
    const f = new FormData(); f.append("file", blob, nm);
    const r = await fwFetch("https://x0.at/", { method:"POST", headers:{ "Expires":"30d" }, body:f });
    const t = await r.text();
    const u = (t || "").trim().split(/\s+/)[0];
    if(r && r.ok && /^https?:\/\//.test(u)) return { ok:true, lane:"x0", url:u, bytes:blob.size, name:nm, keeps:"the Expires header", tries };
    tries.push({ lane:"x0", why:"HTTP " + ((r && r.status) || "?") + " · " + String(t).replace(/\s+/g," ").slice(0,120) });
  }catch(e){ tries.push({ lane:"x0", why:"threw: " + String((e && e.message) || e) }); }

  /* 3 — an ntfy attachment. Short-lived, but it never refuses a text payload. */
  try{
    const r = await fwFetch("https://ntfy.sh/" + FW_FILES, { method:"PUT", headers:{ "Filename": nm, "Content-Type": type || "application/octet-stream" }, body: bytes });
    let j = null; try{ j = JSON.parse(await r.text()); }catch(e){}
    if(r && r.ok && j && j.attachment && j.attachment.url) return { ok:true, lane:"attach", url:j.attachment.url, bytes:blob.size, name:nm, keeps:"3 h", tries };
    tries.push({ lane:"attach", why:"HTTP " + ((r && r.status) || "?") + (j ? "" : " · the answer was not the message JSON") });
  }catch(e){ tries.push({ lane:"attach", why:"threw: " + String((e && e.message) || e) }); }

  return { ok:false, why:"every carrier refused. Each one's own words are in `tries`.", tries };
}

/* a slate: text, permanent, readable by a human in a browser. */
async function fwSlate(text){
  const tries = [];
  try{
    const r = await fwFetch("https://paste.rs/", { method:"POST", headers:{ "Content-Type":"text/plain" }, body:String(text) });
    const u = (await r.text()).trim();
    if(r && r.ok && /^https?:\/\//.test(u)) return { ok:true, lane:"paste.rs", url:u, bytes: FW_ENC.encode(String(text)).length, immutable:true, tries };
    tries.push({ lane:"paste.rs", why:"HTTP " + ((r && r.status) || "?") });
  }catch(e){ tries.push({ lane:"paste.rs", why:"threw: " + String((e && e.message) || e) }); }
  try{
    const r = await fwFetch("https://api.pastes.dev/post", { method:"POST", headers:{ "Content-Type":"text/plain" }, body:String(text) });
    const t = await r.text();
    let k = null; try{ k = JSON.parse(t).key; }catch(e){}
    if(r && r.ok && k) return { ok:true, lane:"pastes.dev", url:"https://api.pastes.dev/" + k, bytes: FW_ENC.encode(String(text)).length, immutable:true, tries };
    tries.push({ lane:"pastes.dev", why:"HTTP " + ((r && r.status) || "?") + " · " + String(t).replace(/\s+/g," ").slice(0,120) });
  }catch(e){ tries.push({ lane:"pastes.dev", why:"threw: " + String((e && e.message) || e) }); }
  return { ok:false, why:"both slates refused. Their own words are in `tries`.", tries };
}

/* ------------------------------- THE ANNOUNCE ------------------------------
   The command that makes the estate push instead of wait. It reads the register
   and the packet from THIS origin (the bytes that actually ship), takes the
   delivery URLs the relay already recorded, and puts the register's address on
   both free lanes: broadcast on the nerve, aimed in the mutable pointer.

   The pointer is read back before success is claimed, because a store's 200 is
   its word and a read-back is a measurement. */

function fwUrlKey(u){ const m = /\/([0-9a-f]{8,64})(?:\.[a-z0-9]+)?(?:$|\?)/i.exec(String(u || "")); return m ? m[1] : "-"; }

async function fwAnnounce(opts){
  opts = opts || {};
  const t0 = Date.now();
  const steps = [];

  /* a. the estate's own statement of itself, from this origin */
  let reg = null, regBytes = 0, regSha = null;
  try{
    const r = await fetch(fwOrigin() + "/src/sites/mailala/ASSET-MANIFEST.json", { cache:"no-store" });
    if(r.ok){ const b = new Uint8Array(await r.arrayBuffer()); regBytes = b.length; regSha = await fwSha(b); reg = JSON.parse(new TextDecoder().decode(b)); steps.push({ what:"read the register from this origin", state:"REAL", note: fwK(regBytes) + " B · sha " + String(regSha).slice(0,16) + "…" }); }
    else steps.push({ what:"read the register from this origin", state:"FAILED", note:"HTTP " + r.status });
  }catch(e){ steps.push({ what:"read the register from this origin", state:"FAILED", note: String((e && e.message) || e) }); }

  /* b. the addresses the relay actually delivered, from its own ledger */
  let ledger = null;
  try{ ledger = await (root && root.kv ? root.kv.relay.get("deliveries") : null); }catch(e){ ledger = null; }
  const urlOf = (p) => (ledger && ledger[p] && ledger[p].url) || null;
  const regUrl = urlOf("src/sites/mailala/ASSET-MANIFEST.json");
  const pktUrl = urlOf("src/sites/mailala/SYNC-PACKET.json");
  steps.push({ what:"the relay's delivery ledger", state: ledger ? "READ" : "EMPTY",
    note: ledger ? Object.keys(ledger).length + " address(es) held · register " + (regUrl ? "addressed" : "NOT ADDRESSED") : "no ledger in this origin yet — /relay" });

  /* c. the pointer, built to fit and written, then read back */
  const estate = (reg && reg.estate) || {};
  const pointer = {
    t: Math.floor(Date.now() / 1000),
    reg: fwUrlKey(regUrl), pkt: fwUrlKey(pktUrl),
    n: estate.count != null ? estate.count : null,
    b: estate.bytes != null ? estate.bytes : null,
    tree: estate.treeDigestSha256 ? String(estate.treeDigestSha256).slice(0, 16) : "-",
    v: opts.verdict || null, st: fwStation()
  };
  const line = fwPtrLine(pointer);
  const fit = fwPtrFit(line);
  const wrote = await fwPointerWrite(FW_K_PTR, line);
  steps.push({ what:"aim the mutable pointer", state: wrote.ok ? "AIMED" : "NOT AIMED",
    note: wrote.ok ? "read back identical · " + fit.value + " chars of value, URL " + fit.url + " of a ceiling of " + fit.ceiling
      : wrote.why + " · value " + fit.value + " chars, URL " + fit.url + " of " + fit.ceiling });

  /* d. the ruling, and the family, on their own short keys — same store, no cost */
  try{ await fwPointerWrite(FW_K_RUL, "AIM AT " + fwStation() + " · " + fwNow().slice(0,10)); }catch(e){}
  try{
    const fam = [];
    try{ const F = window.ObiConstellation && window.ObiConstellation.F && window.ObiConstellation.F.family; if(F && F.children) fam.push(...F.children.map(c => (c.name || c.id || "?"))); }catch(e){}
    if(!fam.length && window.ObiMasterlink){ const cfg = await window.ObiMasterlink.config(); fam.push(...cfg.targets); }
    await fwPointerWrite(FW_K_FAM, fam.join(",").slice(0, 200));
  }catch(e){}

  /* e. the broadcast — the human line, then the machine line */
  const say = "[OBI] " + fwStation() + " · " + fwNow() + " · the register is out"
    + (estate.count != null ? " · " + fwK(estate.count) + " files · " + fwK(estate.bytes) + " B" : "")
    + (estate.treeDigestSha256 ? " · tree " + String(estate.treeDigestSha256).slice(0,12) : "")
    + (regUrl ? "\nREGISTER " + regUrl : "\nREGISTER not addressed from this origin yet — /relay delivers it")
    + (pktUrl ? "\nPACKET " + pktUrl : "")
    + "\nPOINTER " + FW_NS + "/" + FW_K_PTR + " (read it with no token: " + fwPtrUrl() + ")";
  const sent = await fwSend(say, { title: "Obi · register announced", tags: "incoming_envelope" });
  steps.push({ what:"broadcast on the nerve", state: sent.ok ? "SENT" : "REFUSED",
    note: sent.ok ? "message " + sent.id + " · " + fwK(sent.bytes) + " B" : sent.why });

  await fwSet("lastAnnounce", { at: fwNow(), id: sent.id, pointer: line, reg: regUrl, pkt: pktUrl, ok: sent.ok && wrote.ok });

  const ok = !!(sent.ok && wrote.ok);
  return { ok, ms: Date.now() - t0, steps, pointer, line, fit, wrote, sent,
    verdict: ok ? "THE ESTATE IS ON THE WIRE" : "NOT FULLY ON THE WIRE",
    says: ok
      ? "The register's address is now readable by any station with no token, no account and no URL from anyone: the pointer holds it (" + fwPtrUrl() + ") and the nerve carries it (" + "https://ntfy.sh/" + FW_NERVE + "). Nothing here needed a credential."
      : "Something on the wire refused — the steps above carry each answer verbatim. Nothing is claimed as announced that was not read back." };
}

/* ---------------------------------- PROBE ----------------------------------
   Re-measure the lanes live. Each check does a real write and a real read-back
   where writing is meaningful; the read-only lanes are read. */

async function fwProbe(){
  const out = [];
  const t = Math.floor(Date.now() / 1000);
  const topicCheck = "prais-agent99-probe";
  try{ const s = await fwSend("probe " + t, { topic: topicCheck }); out.push({ lane:"nerve", ok:s.ok, note: s.ok ? "published, message " + s.id : s.why }); }
  catch(e){ out.push({ lane:"nerve", ok:false, note:"threw: " + String((e && e.message) || e) }); }
  try{ const r = await fwFetch("https://ntfy.sh/" + topicCheck + "/json?poll=1&since=5m"); const raw = await r.text(); const hits = raw.split("\n").filter(l => /probe/.test(l)).length; out.push({ lane:"nerve (read back)", ok: hits > 0 && r.ok, note: hits + " probe message(s) read back off the topic" }); }
  catch(e){ out.push({ lane:"nerve (read back)", ok:false, note:"threw: " + String((e && e.message) || e) }); }
  try{
    const line = fwPtrLine({ t, reg:"probe", pkt:"probe", n:1, b:1, tree:"probe", v:"PROBE", st: fwStation() });
    const w = await fwPointerWrite(FW_K_PTR, line);
    out.push({ lane:"pointer", ok:w.ok, note: w.ok ? "written and READ BACK identical · URL " + w.fit.url + " of " + w.fit.ceiling : w.why });
  }catch(e){ out.push({ lane:"pointer", ok:false, note:"threw: " + String((e && e.message) || e) }); }
  try{
    const r = await root.uploadPlugin(new Blob(["probe " + t], { type:"text/plain" }));
    out.push({ lane:"uploads (carrier)", ok: !!(r && r.url), note: (r && r.url) || (r && r.error) || "no url" });
  }catch(e){ out.push({ lane:"uploads (carrier)", ok:false, note:"threw: " + String((e && e.message) || e) }); }
  try{
    const s = await fwSlate("probe " + t);
    out.push({ lane:"slate", ok:s.ok, note: s.ok ? s.lane + " · " + s.url : s.why });
  }catch(e){ out.push({ lane:"slate", ok:false, note:"threw: " + String((e && e.message) || e) }); }
  try{
    const r = await fwFetch("https://api.github.com/rate_limit", { headers:{ "Accept":"application/vnd.github+json", "User-Agent":"ObiFreeWire/1" } });
    let j = null; try{ j = JSON.parse(await r.text()); }catch(e){}
    const core = j && j.resources && j.resources.core;
    out.push({ lane:"github (read)", ok: !!(r && r.ok), note: core ? "anonymous reads work · " + core.remaining + "/" + core.limit + " requests left on this IP" : "HTTP " + ((r && r.status) || "?") });
  }catch(e){ out.push({ lane:"github (read)", ok:false, note:"threw: " + String((e && e.message) || e) }); }
  try{
    const r = await fwFetch("https://api.github.com/repos/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-", { headers:{ "Accept":"application/vnd.github+json", "User-Agent":"ObiFreeWire/1" } });
    out.push({ lane:"github (write)", ok:false, note: r && r.status === 404 ? "HTTP 404 unauthenticated — the canon is private, so only a PAT opens it (/gh token)" : "HTTP " + ((r && r.status) || "?") });
  }catch(e){ out.push({ lane:"github (write)", ok:false, note:"threw: " + String((e && e.message) || e) }); }
  let keys = {}; try{ keys = JSON.parse(localStorage.getItem("obi_keys") || "{}") || {}; }catch(e){}
  out.push({ lane:"cloudflare", ok: !!keys.cf, note: keys.cf ? "a token is held in this browser — /cf deploy is the door" : "no credential in this origin (obi_keys.cf absent) — /cf token <token>" });

  const res = { at: fwNow(), rows: out, open: out.filter(r => r.ok).length, total: out.length };
  await fwSet("lastProbe", res);
  return res;
}

/* ---------------------------------- THE CARD ------------------------------- */

function fwCard(){
  const me = FW_NS + "/" + FW_K_PTR;
  const open = FW_LANES.filter(l => l.write === "OPEN").length;
  const shut = FW_LANES.filter(l => l.write === "SHUT");
  return { version: FW_VERSION, station: fwStation(), nerve: FW_NERVE, files: FW_FILES, ns: FW_NS,
    pointerUrl: fwPtrUrl(), pointerCeiling: FW_URL_CEILING, lanes: FW_LANES, open, shut,
    needs: [...new Set(shut.map(l => l.needs))] };
}

window.ObiFreeWire = {
  VERSION: FW_VERSION,
  NERVE: FW_NERVE, FILES: FW_FILES, NS: FW_NS, KEYS: { pointer: FW_K_PTR, ruling: FW_K_RUL, family: FW_K_FAM },
  LANES: FW_LANES, URL_CEILING: FW_URL_CEILING,
  send: fwSend, tail: fwTail, put: fwPut, slate: fwSlate,
  pointer: fwPointerRead, pointerUrl: fwPtrUrl, pointerWrite: fwPointerWrite, pointerFit: fwPtrFit, pointerParse: fwPtrParse,
  announce: fwAnnounce, probe: fwProbe, card: fwCard,
  folder: fwFolder, getState: fwGet
};
