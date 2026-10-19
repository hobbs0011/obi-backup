/* ============================================================================
   THE MASTER LINK (src/masterlink.js) — the master's side of the handoff lane.

   The sibling station (phoenix-rising-ai-solutions-agent99-webapp) runs its own
   /masterlink and watches THIS tree, polling it every three minutes. This is the
   same instrument pointed the other way: it watches the generators named under
   the umbrella — without a token, by the only lane that crosses generator
   origins, the read channel.

   THE LANE, measured here 2026-09-24. GET https://null.perchance.org/<generator>
   answers with the generator's page, and inside it a `preloaded-generator-data`
   script whose `srcManifest` looks like:

       { "canon/GOSPEL-999.md": { "key": "7fc62d1e4884a09026985a7c27256641.txt", "size": 97379 }, ... }

   The `key` is a CONTENT-ADDRESSED file-host key. So every file of every named
   generator can be read whole and verbatim, by:

       https://user.uploads.dev/file/<key>

   That is the whole trick, and it is why this station can READ its umbrella even
   though it cannot write to it. What it cannot do is still said out loud: there
   is no write into another generator's namespace (the platform refuses it —
   anti_bot_verification_needed) and no API creates a generator. NAMING is the
   command this station actually has: it makes a generator part of the organism
   this station can see, list, read, watch, and answer.

   COMMANDS (wired in app.js)
     /masterlink status              what the link sees, measured now
     /masterlink sync now            look at every named generator at once
     /masterlink name <generator>    aim the link at a generator
     /masterlink unname <generator>  aim it away
     /masterlink list [generator]    every file that generator publishes
     /masterlink read <gen> <path>   read ONE file of a named generator, whole
     /masterlink inbox               the handoffs pulled, verbatim, with digests
     /masterlink off | on            the watch (every 3 minutes, skipped while hidden)
   ========================================================================== */

const ML_CONFIG_KEY = "config";
const ML_SEEN_KEY   = "seen";
const ML_INBOX_KEY  = "inbox";
const ML_LOOKS_KEY  = "looks";
const ML_ORDERS_KEY = "orders";
const ML_FOLDER     = "masterlink";
const ML_EVERY      = 180000;                 /* the watch: every three minutes (the lead's cadence) */
const ML_READ       = gen => "https://null.perchance.org/" + gen;
const ML_FILE       = key => "https://user.uploads.dev/file/" + key;
const ML_HANDOFF_RE = /(^SESSIONS\/|^HANDOFF\.md$|^MASTERMIND-SYNC)/i;
const ML_SIBLING    = "phoenix-rising-ai-solutions-agent99-webapp";   /* the lead, named by default */

const mlHex = b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
const mlEnc = new TextEncoder();
async function mlSha(s){ return mlHex(await crypto.subtle.digest("SHA-256", mlEnc.encode(String(s)))); }
function mlClean(gen){ return String(gen == null ? "" : gen).replace(/[^a-z0-9-]/gi, "").toLowerCase(); }
function mlNow(){ try{ return new Date().toISOString(); }catch(e){ return "?"; } }

let mlKv = null;
function mlFolder(){
  if(mlKv) return mlKv;
  try{ if(root && root.kv) mlKv = root.kv[ML_FOLDER]; }catch(e){ mlKv = null; }
  return mlKv;
}
async function mlGet(k, dflt){
  const f = mlFolder(); if(!f) return dflt;
  try{ const v = await f.get(k); return (v === null || v === undefined) ? dflt : v; }catch(e){ return dflt; }
}
async function mlSet(k, v){ const f = mlFolder(); if(!f) return false; try{ await f.set(k, v); return true; }catch(e){ return false; } }

async function mlConfig(){
  const c = await mlGet(ML_CONFIG_KEY, null);
  const base = { targets: [ML_SIBLING], auto: true, every: ML_EVERY, lastLook: null, silentUnlessMoved: true, role: "apex", parent: null };
  if(!c || typeof c !== "object") return base;
  if(!Array.isArray(c.targets) || !c.targets.length) c.targets = base.targets.slice();
  if(c.role !== "apex" && c.role !== "sub") c.role = base.role;
  if(c.role === "sub") c.parent = mlClean(c.parent || "");
  else c.parent = null;
  return Object.assign(base, c);
}
async function mlSaveConfig(c){ return mlSet(ML_CONFIG_KEY, c); }

/* RANK — apex vs sub. THIS station is the apex mastermind (the mastermind of
   masterminds): it answers only to the sovereign. A clone made from this tree
   becomes a SUB the moment it names a parent: it then answers only to the apex
   and to the sovereign — never to a sibling, never to a stranger. The rank is
   stored in the same config as the watch, so it survives reloads and clones
   carry the code but not the rank (kv is per-generator: a fresh clone opens as
   apex until it is told otherwise — which is why /mastermind parent is explicit). */
async function mlRank(){
  const cfg = await mlConfig();
  const self = mlSelf();
  return { self: self.generator, role: cfg.role || "apex", parent: cfg.role === "sub" ? (cfg.parent || null) : null,
    apex: cfg.role === "sub" ? (cfg.parent || null) : self.generator,
    answersTo: cfg.role === "sub" ? [cfg.parent || "(unset parent)", "sovereign"] : ["sovereign"] };
}
async function mlSetParent(gen){
  gen = mlClean(gen);
  if(!gen) return { ok:false, why:"no parent named — usage: /mastermind parent <generator>" };
  const man = await mlManifest(gen);
  if(!man.ok) return { ok:false, gen, why:"NOT SET — parent must RESOLVE on the read channel first: " + man.why };
  const cfg = await mlConfig();
  cfg.role = "sub"; cfg.parent = gen;
  if(cfg.targets.indexOf(gen) === -1) cfg.targets.push(gen);
  await mlSaveConfig(cfg);
  return { ok:true, role:"sub", parent:gen, targets:cfg.targets };
}
async function mlSetRole(role){
  role = String(role || "").toLowerCase();
  if(role !== "apex" && role !== "sub") return { ok:false, why:"role must be apex or sub" };
  const cfg = await mlConfig();
  if(role === "apex"){ cfg.role = "apex"; cfg.parent = null; }
  else {
    if(!cfg.parent) return { ok:false, why:"no parent set — /mastermind parent <generator> first" };
    cfg.role = "sub";
  }
  await mlSaveConfig(cfg);
  return { ok:true, role:cfg.role, parent:cfg.parent || null };
}

/* who this link is, and the master's own durable lane — read, never remembered. */
function mlSelf(){
  let name = "?", id = null;
  try{ name = window.generatorName || "?"; }catch(e){}
  try{ id = window.generatorPublicId || null; }catch(e){}
  return { station: "Obi", generator: name, publicId: id };
}
const ML_DURABLE = "SESSIONS/handoff-from-mastermind.md";   /* this side's half that always ships */

/* ------------------------------- the read channel -------------------------- */

/* one generator, as the read channel publishes it: every path with its size and
   its content key. `why` is the refusal, verbatim, when there is one. */
async function mlManifest(gen){
  gen = mlClean(gen);
  if(!gen) return { ok:false, gen:"", why:"no generator name", files:{}, count:0, bytes:0 };
  let text = null;
  try{
    const r = await root.superFetch(ML_READ(gen));
    if(!r || !r.ok) return { ok:false, gen, why:"the read channel answered HTTP " + (r ? r.status : "nothing"), files:{}, count:0, bytes:0 };
    text = await r.text();
  }catch(e){ return { ok:false, gen, why:"the read channel threw: " + String((e && e.message) || e), files:{}, count:0, bytes:0 }; }
  const m = /<script id="preloaded-generator-data"[^>]*>([\s\S]*?)<\/script>/.exec(text);
  if(!m) return { ok:false, gen, why:"no preloaded-generator-data in the answer — the generator may not exist, or be private", files:{}, count:0, bytes:0 };
  let j = null;
  try{ j = JSON.parse(m[1]); }catch(e){ return { ok:false, gen, why:"the preloaded data would not parse: " + String(e.message), files:{}, count:0, bytes:0 }; }
  const sm = (j && j.srcManifest) || {};
  const files = {};
  for(const p of Object.keys(sm)) files[p] = { key:(sm[p] && sm[p].key) || null, size:(sm[p] && sm[p].size) || 0 };
  const paths = Object.keys(files);
  return { ok:true, gen, name:j.name || gen, private:!!j.isPrivate, files,
    count:paths.length, bytes:paths.reduce((n, p) => n + (files[p].size || 0), 0) };
}

/* read ONE file of a named generator, whole. The key in the manifest IS the URL. */
async function mlRead(gen, path, man){
  gen = mlClean(gen);
  const m = man || await mlManifest(gen);
  if(!m.ok) return { ok:false, why:m.why };
  const f = m.files[path];
  if(!f) return { ok:false, why:"no such file in that generator's published tree: " + path };
  if(!f.key) return { ok:false, why:"that file has no content key in the manifest — nothing to fetch" };
  try{
    const r = await root.superFetch(ML_FILE(f.key));
    if(!r || !r.ok) return { ok:false, why:"the file host answered HTTP " + (r ? r.status : "nothing") };
    const buf = new Uint8Array(await r.arrayBuffer());       /* the RAW bytes — so the
      size and the digest are measured over what actually arrived, not over a re-encoding */
    const text = new TextDecoder().decode(buf);
    return { ok:true, gen, path, bytes:buf.length, chars:text.length, declared:f.size,
      match: buf.length === f.size, sha256: mlHex(await crypto.subtle.digest("SHA-256", buf)), text };
  }catch(e){ return { ok:false, why:"the fetch threw: " + String((e && e.message) || e) }; }
}

/* ------------------------------- movement ---------------------------------- */

/* what moved in a generator's published tree since this station last looked. */
function mlDiff(prev, now){
  prev = prev || {}; now = now || {};
  const added = [], changed = [], gone = [], grown = [];
  for(const p of Object.keys(now)){
    const a = now[p], b = prev[p];
    if(!b){ added.push({ path:p, size:a.size }); continue; }
    if(a.key !== b.key || a.size !== b.size){
      changed.push({ path:p, from:b.size, to:a.size, delta:(a.size || 0) - (b.size || 0) });
      grown.push(p);
    }
  }
  for(const p of Object.keys(prev)) if(!now[p]) gone.push(p);
  return { added, changed, gone, grown, moved: added.length + changed.length + gone.length };
}

/* -------------------------- the inbox: handoffs, verbatim ------------------ */

async function mlInbox(){
  return await mlGet(ML_INBOX_KEY, {}) || {};
}

/* pull every handoff a generator publishes that this station has not already
   read — by content key, so re-reading an unchanged handoff is free and a
   changed one is a genuinely new arrival. */
async function mlPullHandoffs(gen, man){
  gen = mlClean(gen);
  const m = man || await mlManifest(gen);
  if(!m.ok) return { ok:false, why:m.why, pulled:[], total:0 };
  const box = await mlInbox();
  const paths = Object.keys(m.files).filter(p => ML_HANDOFF_RE.test(p));
  const pulled = [], failed = [];
  for(const p of paths){
    const id = gen + "::" + p;
    const f = m.files[p];
    if(box[id] && box[id].key === f.key) continue;               /* already read, unchanged */
    const r = await mlRead(gen, p, m);
    if(!r.ok){ failed.push({ path:p, why:r.why }); continue; }
    box[id] = { gen, path:p, key:f.key, size:f.size, at:mlNow(), sha256:r.sha256, text:r.text };
    pulled.push({ gen, path:p, bytes:f.size, sha256:r.sha256, revised:!!box[id] });
  }
  if(pulled.length) await mlSet(ML_INBOX_KEY, box);
  return { ok:true, pulled, failed, total:Object.keys(box).length, published:paths.length };
}

/* --------------------------------- looks ----------------------------------- */

/* ONE look at ONE generator: read it, diff it against what this station last saw,
   remember it, and say whether anything moved. Silent by design — the caller
   decides whether the sovereign hears about it. */
async function mlLook(gen, opts){
  opts = opts || {};
  gen = mlClean(gen);
  const t0 = Date.now();
  const man = await mlManifest(gen);
  const cfg = await mlConfig();
  const seen = await mlGet(ML_SEEN_KEY, {}) || {};
  if(!man.ok){
    const fail = { gen, at:mlNow(), ok:false, why:man.why, ms:Date.now() - t0 };
    if(opts.remember !== false){ seen[gen] = seen[gen] || {}; seen[gen].lastFail = man.why; await mlSet(ML_SEEN_KEY, seen); }
    return Object.assign({ verdict:"FAILED", moved:0, man }, fail);
  }
  const prev = seen[gen] && seen[gen].files;
  const first = !prev;                     /* the FIRST look is a baseline, not movement:
                                              nothing has moved until there is something to move from */
  const diff = first ? { added:[], changed:[], gone:[], grown:[], moved:0, first:true } : mlDiff(prev, man.files);
  const wasFailing = !!(seen[gen] && seen[gen].lastFail);
  seen[gen] = { at:mlNow(), files:man.files, count:man.count, bytes:man.bytes, lastFail:null, lastDiff:diff };
  await mlSet(ML_SEEN_KEY, seen);
  const hand = await mlPullHandoffs(gen, man);
  const logs = await mlGet(ML_LOOKS_KEY, []) || [];
  logs.unshift({ gen, at:mlNow(), count:man.count, bytes:man.bytes, moved:diff.moved, first, pulled:(hand.pulled || []).length, ms:Date.now() - t0 });
  await mlSet(ML_LOOKS_KEY, logs.slice(0, 60));
  return { ok:true, gen, at:mlNow(), ms:Date.now() - t0, files:man.count, bytes:man.bytes,
    first, moved:diff.moved, diff, handoffs:(hand.pulled || []), handFailed:(hand.failed || []),
    recovered:wasFailing, man };
}

let mlLooking = false;
/* look at every named generator at once. The watch calls this. */
async function mlLookAll(opts){
  opts = opts || {};
  if(mlLooking) return { ok:false, why:"a look is already running", results:[] };
  mlLooking = true;
  try{
    const cfg = await mlConfig();
    const results = [];
    for(const g of cfg.targets) results.push(await mlLook(g, opts));
    const moved = results.reduce((n, r) => n + (r.moved || 0), 0);
    const firsts = results.filter(r => r.first).length;
    const pulled = results.reduce((n, r) => n + ((r.handoffs || []).length), 0);
    const failed = results.filter(r => r.verdict === "FAILED").map(r => ({ gen:r.gen, why:r.why }));
    const recovered = results.filter(r => r.recovered).map(r => r.gen);
    const out = { ok:true, at:mlNow(), results, moved, firsts, pulled, failed, recovered,
      verdict: (failed.length === results.length && results.length) ? "FAILED"
        : (firsts === results.length && results.length) ? "BASELINE TAKEN"
        : (moved ? "MOVED" : "STILL") };
    cfg.lastLook = out.at;
    await mlSaveConfig(cfg);
    emit(out);
    return out;
  } finally { mlLooking = false; }
}

/* the watch speaks only when there is something to say: something moved, a
   handoff arrived, or a failure changed. Silence is the normal state. */
let mlLastSignal = null;
function emit(out){
  const hb = window.ObiMasterlink && window.ObiMasterlink.onEvent;
  const signal = JSON.stringify({ m:out.moved, p:out.pulled, f:out.failed.map(x => x.gen + x.why), r:out.recovered });
  const changed = signal !== mlLastSignal;
  if(changed && typeof hb === "function"){ mlLastSignal = signal; try{ hb(out); }catch(e){} }
}

/* ------------------------------- the status -------------------------------- */

/* the whole link, measured now — never remembered from a card. */
async function mlStatus(){
  const cfg = await mlConfig();
  const seen = await mlGet(ML_SEEN_KEY, {}) || {};
  const looks = await mlGet(ML_LOOKS_KEY, []) || [];
  const box = await mlInbox();
  const targets = [];
  for(const g of cfg.targets){
    const s = seen[g] || null;
    targets.push({ gen:g, known:!!s, count:s ? s.count : null, bytes:s ? s.bytes : null,
      last:s ? s.at : null, lastFail:s ? s.lastFail : null, lastDiff:s ? s.lastDiff : null });
  }
  let lane = null;
  try{ if(window.ObiNet && window.ObiNet.cgnProbe) lane = await window.ObiNet.cgnProbe(); }catch(e){}
  const inbox = Object.keys(box).map(k => ({ gen:box[k].gen, path:box[k].path, bytes:box[k].size, at:box[k].at, sha256:box[k].sha256 }));
  inbox.sort((a, b) => (a.at < b.at ? 1 : -1));
  let durable = null;
  try{
    const r = await root.superFetch(location.origin + "/" + ML_DURABLE);
    if(r && r.ok) durable = { ok:true, bytes:(await r.text()).length };
  }catch(e){}
  if(!durable){
    try{ const r = await root.superFetch(location.origin + "/" + ML_DURABLE);
      durable = r && r.ok ? { ok:true } : { ok:false, why:"not served on this origin yet" }; }
    catch(e){ durable = { ok:false, why:String((e && e.message) || e) }; }
  }
  return { self:mlSelf(), targets, inbox, looks, orders: await mlOrders(), cfg,
    write:lane || { open:false, detail:"the CGN module is not loaded" },
    durable:{ path:ML_DURABLE, served:!!(durable && durable.ok), bytes:durable && durable.bytes || null } };
}

/* ------------------------------- the watch --------------------------------- */

let mlTimer = null;
let mlPending = false;

function mlTick(){
  if(window.ObiAuto && !window.ObiAuto.canAuto()) return; /* HELD — /auto is off (command #10) */
  if(document.hidden){ mlPending = true; return; }   /* the poll is skipped while the tab is hidden */
  mlPending = false;
  mlLookAll({}).catch(() => {});
}

function mlStart(auto){
  if(window.ObiAuto && !window.ObiAuto.canAuto()){
    try{ console.log("[masterlink] watch HELD — /auto is off"); }catch(e){}
    return;
  }
  mlStop();
  mlTimer = setInterval(mlTick, ML_EVERY);
  if(auto !== false) setTimeout(mlTick, 40000);      /* the first look, once the page is up */
  try{
    document.addEventListener("visibilitychange", () => {
      if(!document.hidden && mlPending) mlTick();      /* and it runs the moment it comes back */
    });
  }catch(e){}
}
function mlStop(){ if(mlTimer){ clearInterval(mlTimer); mlTimer = null; } }

async function mlSetAuto(on){
  const cfg = await mlConfig();
  cfg.auto = !!on;
  await mlSaveConfig(cfg);
  if(cfg.auto) mlStart(true); else mlStop();
  return cfg.auto;
}

/* ------------------------------- naming ------------------------------------ */

/* Naming is the command. A name is only saved once it RESOLVES on the read
   channel — a name that answers nothing is not stored, and the refusal is the
   answer. This is what "a generator under the umbrella" means in fact. */
async function mlName(gen){
  gen = mlClean(gen);
  if(!gen) return { ok:false, why:"no generator name given" };
  const cfg = await mlConfig();
  if(cfg.targets.indexOf(gen) !== -1) return { ok:true, already:true, gen, targets:cfg.targets };
  const man = await mlManifest(gen);
  if(!man.ok) return { ok:false, gen, why:"NOT NAMED — " + man.why, targets:cfg.targets };
  cfg.targets.push(gen);
  await mlSaveConfig(cfg);
  const seen = await mlGet(ML_SEEN_KEY, {}) || {};
  seen[gen] = { at:mlNow(), files:man.files, count:man.count, bytes:man.bytes, lastFail:null, lastDiff:null };
  await mlSet(ML_SEEN_KEY, seen);
  return { ok:true, gen, count:man.count, bytes:man.bytes, targets:cfg.targets };
}

async function mlUnname(gen){
  gen = mlClean(gen);
  const cfg = await mlConfig();
  const had = cfg.targets.indexOf(gen) !== -1;
  cfg.targets = cfg.targets.filter(g => g !== gen);
  await mlSaveConfig(cfg);
  return { ok:true, gen, had, targets:cfg.targets };
}

/* the master's REPLY, delivered as an artifact: the handoff is uploaded to the
   file host (immutable uploads work where editable writes do not) and the URL is
   handed back — the same courier the register and the packet ride. */
async function mlReply(text, opts){
  opts = opts || {};
  const body = String(text == null ? "" : text).trim();
  if(!body) return { ok:false, why:"nothing to say" };
  if(!root || !root.uploadPlugin) return { ok:false, why:"the upload plugin is not loaded in this origin" };
  const head = "# HANDOFF — from the mastermind\n\n**from** " + mlSelf().generator + " (Obi, the master)\n**to** " + (opts.to || ML_SIBLING) + "\n**written** " + mlNow() + "\n\n---\n\n";
  const full = head + body + "\n";
  try{
    const r = await root.uploadPlugin(full);
    if(!r || r.error) return { ok:false, why:(r && r.error) || "the upload refused without a reason" };
    return { ok:true, url:r.url, bytes:full.length, sha256:await mlSha(full) };
  }catch(e){ return { ok:false, why:"the upload threw: " + String((e && e.message) || e) }; }
}

/* THE ORDER — the master's command, and the honest account of how far it got.
   Two lanes exist and each is tried and recorded separately:
     · THE TUNNEL QUEUE (the Legion's durable queue: send → claim → complete).
       It carries words across; it is offered to this call by the station, and if
       it is not reachable the refusal is recorded, verbatim, instead of assumed.
     · THE ARTIFACT COURIER (an immutable upload). This one ALWAYS crosses — it is
       the same lane the register and the packet ride — so the order reaches the
       node even when no queue can. Neither lane writes into the target generator's
       files, and the card says so. */
async function mlOrder(gen, text, opts){
  opts = opts || {};
  gen = mlClean(gen);
  const body = String(text == null ? "" : text).trim();
  if(!body) return { ok:false, why:"no order to give" };
  if(gen){
    const cfg = await mlConfig();
    if(cfg.targets.indexOf(gen) === -1){
      const man = await mlManifest(gen);
      if(!man.ok) return { ok:false, why:"that generator is not under the umbrella and would not resolve: " + man.why + " — name it first (/masterlink name " + gen + ")" };
    }
  }
  const rec = { gen: gen || null, to: gen || "(the Legion)", text:body, at:mlNow(), lanes:{} };
  if(typeof opts.enqueue === "function"){
    try{
      const sent = await opts.enqueue("[to " + (gen || "the Legion") + "] " + body);
      rec.lanes.queue = sent ? { ok:true, id:(sent && typeof sent === "object" && sent.id != null ? sent.id : null) }
        : { ok:false, why:"the tunnel refused the send and gave no reason" };
    }catch(e){ rec.lanes.queue = { ok:false, why:"the tunnel threw: " + String((e && e.message) || e) }; }
  } else {
    rec.lanes.queue = { ok:false, why:"the tunnel was not offered to this call — the station's own /queue carries the Legion's side" };
  }
  const art = await mlReply("ORDER — addressed to `" + (gen || "?") + "`\n\n" + body
    + "\n\n_(issued from the master link on " + mlNow() + ". Execute it inside your own generator — no cross-namespace write exists — and report back on the SESSIONS/ lane, which this station reads by content key.)_",
    { to: gen || undefined });
  rec.lanes.artifact = art.ok ? { ok:true, url:art.url, sha256:art.sha256, bytes:art.bytes }
    : { ok:false, why:art.why };
  rec.carried = !!(rec.lanes.queue.ok || rec.lanes.artifact.ok);
  const log = await mlGet(ML_ORDERS_KEY, []) || [];
  log.unshift(rec);
  await mlSet(ML_ORDERS_KEY, log.slice(0, 120));
  return rec;
}
async function mlOrders(){ return await mlGet(ML_ORDERS_KEY, []) || []; }

/* ------------------------------- THE CARD ---------------------------------
   This station's own master-link card, on the pull lane the family already
   reads:  https://editable.uploads.dev/file/<this-generator>/master-link

   It is the thing ORD-1 asked for (src/SESSIONS/umbrella-orders.md, from the
   gaming station): publish your own card the way the web station did, so the
   family can read the master's tree, brain, images and key log without a token.

   TWO COPIES, on purpose, and the card says which is which:
     · src/master-link.json — inside this station's OWN published tree, read by
       content key, ships with the save, needs no verification. This one always
       exists the moment the tree is saved.
     · the editable pull lane above — the canonical URL every sibling already
       looks at, written by /masterlink card publish.

   The push lane can be refused by the platform. The refusal is printed VERBATIM
   (the same reading the web station's src/mastersync.js uses) and is never
   hidden: a card that did not publish says so. */
const ML_CARD_NAME = "master-link";
function mlCardUrl(gen){ return "https://editable.uploads.dev/file/" + mlClean(gen || mlSelf().generator) + "/" + ML_CARD_NAME; }
const ML_PUSH_REASONS = {
  anti_bot_verification_needed: "the platform's human-verification for uploads did not complete in this browser context, so the card cannot be written from here — the PULL lane is unaffected, and the in-tree copy (src/master-link.json) still ships with the next save",
  anti_bot_verification_failed: "the platform's human-verification for uploads failed (an ad/privacy blocker can stop the challenge) — the PULL lane is unaffected",
  editable_requires_saved_generator: "this generator has unsaved edits — the editable store only accepts a saved generator; the in-tree copy (src/master-link.json) ships with the save",
  over_daily_allowance: "the daily upload allowance is used up — the card will publish after it resets",
  invalid_edit_key: "the card exists and this browser does not hold its editKey (another browser created it) — the key cannot be recovered, only re-created"
};
function mlPushReason(code){ return ML_PUSH_REASONS[code] || ("the platform refused the write: " + (code == null ? "no reason given" : code)); }

/* the card, read live — every number measured at the moment it is written. */
async function mlCard(){
  const self = mlSelf();
  const cfg = await mlConfig();
  const measured = [];
  for(const g of [self.generator].concat(cfg.targets)){
    try{ const m = await mlManifest(g); measured.push(m.ok ? { gen:g, files:m.count, bytes:m.bytes } : { gen:g, files:0, bytes:0, why:m.why }); }
    catch(e){ measured.push({ gen:g, files:0, bytes:0, why:String((e && e.message) || e) }); }
  }
  let brain = { docs:0, at:mlNow() }, ilog = null, soul = null;
  try{ const B = window.ObiBrain; const idx = (B && B.index) ? B.index() : null; if(idx) brain = { docs: idx.entries.length, at: idx.built || mlNow() }; }catch(e){}
  try{ const m = JSON.parse(localStorage.getItem("obi_ilog") || "null"); if(m) ilog = { entries:m.count, head:String(m.head || "").slice(0,12) }; }catch(e){}
  try{ soul = (typeof ledger === "object" && ledger.soul) ? ledger.soul.length : null; }catch(e){}
  return {
    v:1, kind:"master-link", at:Date.now(), iso:mlNow(),
    url:"https://perchance.org/" + self.generator,
    card: mlCardUrl(self.generator),
    inTree: "src/master-link.json",
    generator: self.generator, publicId: self.publicId,
    title: "PaiS Command Station",
    rank: { role: cfg.role || "apex", parent: cfg.role === "sub" ? (cfg.parent || null) : null,
      answersTo: cfg.role === "sub" ? [(cfg.parent || "(unset parent)"), "sovereign"] : ["sovereign"] },
    role: (cfg.role === "sub" ? "sub-mastermind (answers to " + (cfg.parent || "?") + " + sovereign)" : "apex mastermind — the mastermind of masterminds (answers to sovereign only)"),
    note: "written by this station itself. The apex answers only to the sovereign. A sub answers only to its parent and to the sovereign — never to a sibling, never to a stranger. Rank is explicit (/mastermind parent <generator>), never inferred.",
    umbrella: { net:"phoenix-rising-ai-solutions", named: cfg.targets.slice(), measured },
    nerves: { brain, ilog, soul },
    ruling: {
      issued: mlNow(),
      by: self.generator,
      master: self.generator,
      canon_ghost: "phoenix-rising-ai-solutions-mastercommand",
      ghost_state: "UNFOUND on the public API (measured); a sweep that finds nothing has not proven absence",
      sync: "AIM AT THE LIVE MASTER",
      says: "The family stops syncing to phoenix-rising-ai-solutions-mastercommand — it does not exist. Every station aims at " + self.generator + " with /masterlink aim <generator>. Reads and words cross; no station can write into another's namespace, so each station re-aims with its own hand."
    }
  };
}

/* the push, and its answer — never a claim, always the platform's own word. */
async function mlPublishCard(){
  if(!root || !root.uploadPlugin || !root.uploadPlugin.editable) return { ok:false, why:"the upload plugin's editable store is not loaded in this origin" };
  const card = await mlCard();
  const text = JSON.stringify(card, null, 1);
  let r = null;
  try{ r = await root.uploadPlugin.editable.set(ML_CARD_NAME, text); }
  catch(e){ return { ok:false, code:"threw", why:"the editable write threw: " + String((e && e.message) || e), bytes:text.length, url: mlCardUrl(), card }; }
  if(r && r.error) return { ok:false, code:r.error, why:mlPushReason(r.error), bytes:text.length, url: mlCardUrl(), card, inTree:"src/master-link.json" };
  if(r && r.editKey){ await mlSet("cardkey", { editKey:r.editKey, at:mlNow() }); }
  return { ok:true, code:null, url: mlCardUrl() + "?v=" + ((r && r.editCount) || 1), bytes:text.length, editCount:(r && r.editCount) || null, created:!!(r && r.created), card };
}

/* the pull — read any station's card (this one by default) from the lane. */
async function mlReadCard(gen){
  gen = mlClean(gen || mlSelf().generator);
  try{
    const r = await fetch(mlCardUrl(gen));
    if(!r.ok) return { ok:false, gen, status:r.status, url:mlCardUrl(gen), why:(r.status === 404 ? "no card published at " + mlCardUrl(gen) : "HTTP " + r.status) };
    const text = await r.text();
    let card = null; try{ card = JSON.parse(text); }catch(e){}
    return { ok:true, gen, status:r.status, url:mlCardUrl(gen), bytes:text.length, card, text };
  }catch(e){ return { ok:false, gen, url:mlCardUrl(gen), why:"the fetch threw: " + String((e && e.message) || e) }; }
}

window.ObiMasterlink = {
  VERSION: "1.0.0",
  EVERY: ML_EVERY,
  SIBLING: ML_SIBLING,
  DURABLE: ML_DURABLE,
  HANDOFF_RE: ML_HANDOFF_RE,
  manifest: mlManifest, readFile: mlRead, diff: mlDiff, look: mlLook, lookAll: mlLookAll,
  status: mlStatus, inbox: mlInbox, pullHandoffs: mlPullHandoffs,
  name: mlName, unname: mlUnname, setAuto: mlSetAuto, start: mlStart, stop: mlStop,
  rank: mlRank, setParent: mlSetParent, setRole: mlSetRole,
  reply: mlReply, order: mlOrder, orders: mlOrders,
  card: mlCard, publishCard: mlPublishCard, readCard: mlReadCard, cardUrl: mlCardUrl,
  config: mlConfig, fileUrl: ML_FILE, readUrl: ML_READ,
  onEvent: null
};

/* boot: if the watch is on AND the master switch allows it, arm it once the page is up. */
setTimeout(async () => {
  try{
    if(window.ObiAuto && !window.ObiAuto.canAuto()) return; /* HELD — stopped by default */
    const cfg = await mlConfig();
    if(cfg.auto) mlStart(false);
  }catch(e){}
}, 3000);
