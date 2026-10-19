/* ==========================================================================================
   OB-1 on Cloudflare — TunnelDO: the authoritative command tunnel.

   The block immediately below (short/FALLBACK/DRONES/classify/priorityOf/translate) is copied
   byte-exact from the perchance `server-plugin` script in index.html, so both builds classify a
   command into the same drone and write the same translation card. Keep the two in step.
   ========================================================================================== */

function short(t, n){ const s = String(t||"").replace(/\s+/g," ").trim(); return s.length > n ? s.slice(0,n)+"…" : s; }

const FALLBACK = { name:"Legion", id:0, skills:["agent99","route"],
  interp:t=>`Command routed to the Legion — no specialist match: ${short(t,80)}.`,
  stress:()=>"No drone keyword matched — confirm intent before executing." };
const DRONES = [
  { name:"PhoenixScout", id:1, skills:["recon","canon","sweep"], kw:["scout","recon","sweep","survey","inspect","phetrail","probe"],
    interp:t=>`Reconnaissance sweep — read-only scan of the canon stack and live services for: ${short(t,80)}. Reports, never changes state.`,
    stress:()=>"Verify every path/count live before engagement (L58 MAP≠TERRAIN). Canon is private; reads need the stored PAT." },
  { name:"SoulSearch", id:2, skills:["soul","memory","ledger"], kw:["soul","memory","ledger","search","find","remember","recall","sdnad"],
    interp:t=>`Soul/memory lookup across the SDNAD ledger for: ${short(t,80)}. Raw fragments only — SOUL is verbatim.`,
    stress:()=>"Soul counts are per-session only (L31/L32, aggregate retired) — never cite a global number." },
  { name:"DNA Registry", id:3, skills:["dna","sdnad","capture"], kw:["dna","registry","sdnad","capture","soul-dna","souldna"],
    interp:t=>`DNA registration — the fragment is captured verbatim into the ledger: ${short(t,80)}.`,
    stress:()=>"SOUL-CAPTURE-FIRST: the words were captured before translation. Never summarize." },
  { name:"ForceMarch", id:4, skills:["deploy","pipeline","launch"], kw:["forcemarch","force march","deploy","pipeline","launch","push","stage","ship"],
    interp:t=>`Execution push — queue the deploy/pipeline run: ${short(t,80)}.`,
    stress:()=>"GitHub-hosted runners never start on this repo (startup_failure) — prefer the self-hosted runner or the worker." },
  { name:"NetPet", id:5, skills:["worker","cloudflare","tunnel"], kw:["net-pet","netpet","worker","cloudflare","cf ","tunnel","wrangler"],
    interp:t=>`Network-pet / Cloudflare worker operation: ${short(t,80)}.`,
    stress:()=>"Deploy targets: net-pet-ai (prod) vs net-pet-ai-dev. Verify the active line first." },
  { name:"ImageGen", id:6, skills:["image","art","vision"], kw:["image","img","picture","draw","art","poster","logo","icon","vision"],
    interp:t=>`Image creation routed to the image node: ${short(t,80)}.`,
    stress:()=>"Needs the image generator node registered in CGN — else falls back to local generateImage." },
  { name:"WebLookup", id:7, skills:["web","search","url"], kw:["web","search","urls","url","lookup","fetch","browse","wikipedia"],
    interp:t=>`Web lookup via superFetch for: ${short(t,80)}.`,
    stress:()=>"Cross-origin pages need the super-fetch proxy; verify the response is real, not a captcha wall." },
  { name:"Terminal", id:8, skills:["shell","script","run"], kw:["terminal","shell","script","run command",".ps1",".sh","execute"],
    interp:t=>`Terminal op — run/verify on the command machine: ${short(t,80)}.`,
    stress:()=>"Execution happens on the sovereign's machine (D:\\OB-1-CANONICAL) — this chat only queues it." },
  { name:"Audit", id:9, skills:["audit","verify","compliance"], kw:["audit","verify","compliance","check","validate","gate"],
    interp:t=>`Audit/verification pass over: ${short(t,80)}.`,
    stress:()=>"Fail-closed: any gap flags the sector RED until verified." },
  { name:"Reincarnate", id:10, skills:["reincarnation","lifecycle"], kw:["reincarnate","reincarnation","reincarnating","rise","death","rebirth","purge","soul-cycle"],
    interp:t=>`Reincarnation lifecycle event: ${short(t,80)}.`,
    stress:()=>"Death seals the run and purges the session — irreversible. Confirm before execute." },
  { name:"Queue", id:11, skills:["queue","status","command"], kw:["queue","status","commands","pending","list"],
    interp:t=>`Queue/status view of the command tunnel: ${short(t,80)}.`,
    stress:()=>"Queue shows the last 500 commands; oldest completed entries are compacted away." },
  { name:"Network", id:12, skills:["cgn","network","mesh"], kw:["network","mesh","cgn","connected generator","node","hub"],
    interp:t=>`Connected Generator Network operation: ${short(t,80)}.`,
    stress:()=>"CGN hub lives in the obi namespace; nodes must be registered before routing." },
  { name:"Report", id:13, skills:["report","document","summarize"], kw:["report","document","summary","summaries","summarize","summarise","write up","writeup","brief"],
    interp:t=>`Report/documentation task: ${short(t,80)}.`,
    stress:()=>"Keep canon pristine — write to PROPOSED-CANON or the archive, never edit canon directly." },
  { name:"SiteBuilder", id:14, skills:["build","site","webdev","page"], kw:["build","building","rebuild","website","web site","webpage","web page","landing page","homepage","site","html","front-end","app","one-pager"],
    interp:t=>`Build routed to the Web Development division — the Site Builder and the Video Node: ${short(t,80)}. The build itself runs in 🔥 Free Phoenix Mode (🛠 Build app) or in the Site Builder wing; it is handed over as ONE self-contained file.`,
    stress:()=>"The Site Builder wing is a SCAFFOLD (src/generators/site-builder/) — paste it into its own generator before calling it live. Building is not publishing: /deploy reads BLOCKED until a Cloudflare token is held." },
  { name:"Umbrella", id:15, skills:["umbrella","station","authority","fleet"], kw:["umbrella","command station","the station","generators","my generators","our generators","other generators","masterlink","master link","aim the link"],
    interp:t=>`Umbrella / station authority — the generators this station answers for: ${short(t,80)}. It reads any of them by name (the master link's pull lane, /masterlink name <generator>) and routes to the nodes that have joined the mesh, but no generator can write into another's namespace — the change lands when that generator's own /forge is committed by the Sovereign's save or the /phoenixomegaprotocol gate.`,
    stress:()=>"Nothing under the umbrella is commanded from the outside: cross-namespace writes do not exist — /masterlink NAME aims the read, and the mesh carries words, not files." }
];
/* KEYWORDS MATCH WHOLE WORDS, NOT SUBSTRINGS. Plain prefix matching labelled
   "build a website" as a web lookup — the "web" inside "website" — and matched
   "art" inside "start", "party", "article". That is a routing label nobody can act
   on, so a keyword now has to sit on a word edge, and the two truncation keywords
   that relied on substring matching were written out in full (reincarnat →
   reincarnate/reincarnation/reincarnating, summar → summary/summaries/summarize).
   If lookbehind is ever unavailable, the plain pattern is the fallback: classify
   never throws and the tunnel never stops routing. */
const KW_RE = new Map();
function kwRe(k){
  let r = KW_RE.get(k);
  if (r) return r;
  const body = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try { r = new RegExp((/^[a-z0-9]/.test(k) ? "(?<![a-z0-9])" : "") + body + (/[a-z0-9]$/.test(k) ? "(?![a-z0-9])" : ""), "g"); }
  catch(e){ r = new RegExp(body, "g"); }
  KW_RE.set(k, r);
  return r;
}
function classify(text){
  const t = String(text||"").toLowerCase();
  let best = FALLBACK, bs = 0;
  for (const d of DRONES){
    let s = 0;
    for (const k of d.kw){ const re = kwRe(k); re.lastIndex = 0; while (re.test(t)) s++; }
    if (s > bs){ bs = s; best = d; }
  }
  return { drone: bs > 0 ? best : FALLBACK, score: bs };
}
function priorityOf(text){
  const t = String(text||"").toLowerCase();
  if (/\b(urgent|asap|immediately|now|critical|severe|911)\b/.test(t)) return "high";
  if (/\b(later|someday|whenever|when you can|low|minor)\b/.test(t)) return "low";
  return "normal";
}
function translate(text, meta){
  const c = classify(text);
  return {
    agent99: { interpretation: c.drone.interp(text) },
    primaryDrone: { name: c.drone.name, id: c.drone.id, score: c.score, skills: c.drone.skills },
    agent98: { notes: c.drone.stress() },
    agent97: { trail: "SOUL captured verbatim (L37) · run "+(meta.run||"?")+" · session "+(meta.session||"?")+" · SDNAD" },
    priority: priorityOf(text)
  };
}

/* ==========================================================================================
   TunnelDO — the command tunnel, ported from the perchance `server-plugin` block in index.html.

   Same RPC surface (send · history · claim · complete · fail · status), the same drone
   classification tables (copied byte-exact from index.html, see the block at the top of this
   file), the same "cmdq" pub/sub, the same 15-sends/min rate limit per connection.

   The one real difference: the perchance version keeps a 50 MiB append-only byte blob in
   `state`. Durable Object storage caps a single value at 128 KiB, so here the very same records
   live in the DO's SQLite database instead — durable, queryable, no chunking layer.
   ========================================================================================== */

const MAX_KEEP = 500, MAX_TEXT = 4000, RATE_PER_MIN = 15;

function rowToRec(r){
  let translation = null;
  try{ translation = r.translation ? JSON.parse(r.translation) : null; }catch(e){}
  return { id:r.id, text:r.text, source:r.source, session:r.session, run:r.run, status:r.status,
    claimed_by:r.claimed_by, result:r.result, created_at:r.created_at, updated_at:r.updated_at, translation };
}

export class TunnelDO {
  constructor(state, env){
    this.state = state;
    this.env = env;
    this.sessions = new Set();
    state.blockConcurrencyWhile(async () => {
      const sql = state.storage.sql;
      sql.exec(`CREATE TABLE IF NOT EXISTS commands(
        id INTEGER PRIMARY KEY, text TEXT, source TEXT, session TEXT, run INTEGER,
        status TEXT, claimed_by TEXT, result TEXT, created_at INTEGER, updated_at INTEGER,
        translation TEXT)`);
      sql.exec(`CREATE TABLE IF NOT EXISTS seq(k TEXT PRIMARY KEY, v INTEGER)`);
      if(!sql.exec(`SELECT v FROM seq WHERE k='next'`).toArray().length)
        sql.exec(`INSERT INTO seq(k,v) VALUES('next',1)`);
    });
  }

  /* ------------------------------- storage helpers ------------------------------- */
  _nextId(){
    const sql = this.state.storage.sql;
    const cur = sql.exec(`SELECT v FROM seq WHERE k='next'`).one().v;
    sql.exec(`UPDATE seq SET v=? WHERE k='next'`, cur + 1);
    return cur;
  }
  _count(){ return this.state.storage.sql.exec(`SELECT COUNT(*) AS n FROM commands`).one().n; }
  _lastId(){ const r = this.state.storage.sql.exec(`SELECT MAX(id) AS m FROM commands`).one(); return r.m || 0; }
  _recs(limit, desc){
    const sql = this.state.storage.sql;
    const rows = limit
      ? sql.exec(`SELECT * FROM commands ORDER BY id ` + (desc ? "DESC" : "ASC") + ` LIMIT ?`, limit).toArray()
      : sql.exec(`SELECT * FROM commands ORDER BY id ASC`).toArray();
    return rows.map(rowToRec);
  }

  /* ---------------------------------- transport ---------------------------------- */
  _emit(sess, obj){
    try{ sess.ws.send(JSON.stringify(obj)); }
    catch(e){ this.sessions.delete(sess); }
  }
  _publish(topic, msg){
    for(const s of [...this.sessions]) this._emit(s, { t:"pub", topic, msg });
  }
  _rateOk(sess){
    const now = Date.now();
    sess.sends = (sess.sends || []).filter(t => now - t < 60000);
    if(sess.sends.length >= RATE_PER_MIN) return false;
    sess.sends.push(now);
    return true;
  }

  /* ----------------------------------- the RPCs ----------------------------------- */
  _act(dataStr, status, result){
    let p = {}; try{ p = JSON.parse(dataStr || "{}"); }catch(e){ return JSON.stringify({ok:false,error:"bad json"}); }
    const id = Number(p.commandId);
    if(!isFinite(id)) return JSON.stringify({ok:false,error:"bad commandId"});
    const rows = this.state.storage.sql.exec(`SELECT * FROM commands WHERE id=?`, id).toArray();
    if(!rows.length) return JSON.stringify({ok:false,error:"not found"});
    const rec = rowToRec(rows[0]);
    if(rec.status === "completed" || rec.status === "failed") return JSON.stringify({ok:true});
    const claimedBy = rec.claimed_by || String(p.by || "legion").slice(0, 40);
    const res = result ? String(result).slice(0, 1000) : (rec.result || null);
    this.state.storage.sql.exec(`UPDATE commands SET status=?, result=?, claimed_by=?, updated_at=? WHERE id=?`,
      status, res, claimedBy, Date.now(), id);
    this._publish("cmdq", JSON.stringify({ id, status, count: this._count() }));
    return JSON.stringify({ok:true});
  }

  _handle(sess, m, dataStr){
    const sql = this.state.storage.sql;
    switch(m){
      case "send": {
        let p = {}; try{ p = JSON.parse(dataStr || "{}"); }catch(e){ return JSON.stringify({ok:false,error:"bad json"}); }
        if(typeof p.command !== "string") return JSON.stringify({ok:false,error:"command must be a string"});
        const text = p.command.trim().slice(0, MAX_TEXT);
        if(!text) return JSON.stringify({ok:false,error:"empty command"});
        if(!this._rateOk(sess)) return JSON.stringify({ok:false,error:"rate limited — slow down, sovereign"});
        const meta = { run: p.run || 0, session: String(p.session || "") };
        const id = this._nextId();
        const rec = { id, text, source: String(p.source || "magic chat"), session: meta.session, run: meta.run,
          status: "pending", claimed_by: null, result: null, created_at: Date.now(),
          translation: translate(text, meta) };
        sql.exec(`INSERT INTO commands(id,text,source,session,run,status,claimed_by,result,created_at,updated_at,translation)
          VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
          rec.id, rec.text, rec.source, rec.session, rec.run, rec.status, null, null, rec.created_at, null,
          JSON.stringify(rec.translation));
        sql.exec(`DELETE FROM commands WHERE id NOT IN (SELECT id FROM commands ORDER BY id DESC LIMIT ?)`, MAX_KEEP);
        this._publish("cmdq", JSON.stringify({ id, status:"pending", count: this._count() }));
        return JSON.stringify({ ok:true, commandId:id, assignedDrone: rec.translation.primaryDrone.name, translation: rec.translation });
      }
      case "history": {
        let limit = 8;
        try{ const p = JSON.parse(dataStr || "{}"); limit = Math.max(1, Math.min(200, parseInt(p.limit || "8", 10))); }catch(e){}
        return JSON.stringify({ ok:true, commands: this._recs(limit, true) });
      }
      case "claim":    return this._act(dataStr, "claimed", "");
      case "complete": { let p={}; try{ p=JSON.parse(dataStr||"{}"); }catch(e){} return this._act(dataStr, "completed", p.result || "executed by Obi magic chat"); }
      case "fail":     { let p={}; try{ p=JSON.parse(dataStr||"{}"); }catch(e){} return this._act(dataStr, "failed", p.result || "failed by Obi magic chat"); }
      case "status": {
        const rows = sql.exec(`SELECT status, COUNT(*) AS n FROM commands GROUP BY status`).toArray();
        const counts = { pending:0, claimed:0, completed:0, failed:0 };
        for(const r of rows) counts[r.status] = (counts[r.status] || 0) + r.n;
        return JSON.stringify({ ok:true, count: this._count(), counts, lastId: this._lastId() });
      }
      default: return JSON.stringify({ok:false,error:"unknown method " + m});
    }
  }

  async _onMessage(sess, raw){
    let d = null; try{ d = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw)); }catch(e){}
    if(!d || d.t !== "rpc") return;
    let value = null, error = null;
    try{ value = this._handle(sess, String(d.m || ""), d.d); }
    catch(e){ error = "server: " + String((e && e.message) || e); }
    this._emit(sess, { t:"rpc", rid:d.rid, ok: !error, value, error });
  }

  async fetch(req){
    const url = new URL(req.url);
    if(req.headers.get("Upgrade") === "websocket"){
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      const sess = { ws: server, id: Math.random().toString(36).slice(2), sends: [] };
      this.sessions.add(sess);
      server.addEventListener("message", ev => this._onMessage(sess, ev.data));
      server.addEventListener("close", () => this.sessions.delete(sess));
      server.addEventListener("error", () => this.sessions.delete(sess));
      return new Response(null, { status: 101, webSocket: client });
    }
    /* plain-HTTP rpc — lets you drive the tunnel from a script or curl, no socket needed */
    if(url.pathname.endsWith("/rpc")){
      const m = url.searchParams.get("m") || "status";
      const body = req.method === "POST" ? await req.text() : "{}";
      let value = null, error = null;
      try{ value = this._handle({ sends: [] }, m, body); }
      catch(e){ error = String((e && e.message) || e); }
      return Response.json({ ok: !error, value: value ? JSON.parse(value) : null, error });
    }
    return Response.json({ ok:true, service:"obi-tunnel", count: this._count() });
  }
}
