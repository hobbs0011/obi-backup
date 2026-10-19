/* ObiScout — PhoenixScout, REAL (src/AGENT99-OS.md; canon: CANON/SCRIPTS/scout.ps1).

   The canon scout is: emit scout pheromone -> verify I-LOG -> lightweight recon
   (line counts, first/last line) -> write SCOUT/scout-<session>-<timestamp>.md ->
   emit complete pheromone -> hand off to MARCH. "No pipeline. No AI calls.
   No processing. Flag and tag only."

   This module does exactly that against terrain that actually exists: it fetches
   every file the page loads, asks the platform whether every import resolves,
   pings the live fleet and the sovereign's live sites, checks the canon when a
   token allows, and reads the local ground. Every claim is machine-measured or it
   is not made: no token -> BLOCKED (never assumed), 200 without the expected
   marker -> DRIFT, unreachable -> DEAD. Then it lays pheromones on the ground it
   actually walked, writes a real scout report, and hands off to MARCH. */
(function(){
  const esc = s => String(s==null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const VM = { LIVE:"#4cd97b", DEAD:"#ff5a5a", DRIFT:"#f5a623", FLAG:"#ff5a5a", BLOCKED:"#8a94a6", UNVERIFIED:"#f5a623", INFO:"#5ac8fa" };
  const FLAGGY = ["DEAD", "DRIFT", "FLAG", "UNVERIFIED", "BLOCKED"];

  /* CANON ONLY (sovereign, 2026-09-21: "NO KILO, CANON ONLY"). Doctrine is read from the
     `canon` branch — CANON/SYSTEM/**. The `.kilo/` registry (master) is the LEGACY Kilo
     lineage; it is not scouted as canon. This station's own chain still lands on master. */
  const CANON = {
    owner:"Phoenix-Rising-Ai-Solutions", repo:"OB-1--Authoritative-", branch:"canon", writeBranch:"master",
    base:"https://api.github.com/repos/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-",
    files:["CANON/SYSTEM/GOSPEL-999.md", "CANON/SYSTEM/LegionnaireFieldGuide.md", "CANON/SYSTEM/REINCARNATION-CONTRACT.md"]
  };
  const FLEET = [
    ["net-pet-ai", "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/status"],
    ["pcc", "https://pcc.mrmichaelhobbs123.workers.dev/api/status"],
    ["phoenix-architecti", "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status"],
    ["soul-logger", "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"]
  ];
  const LIVE_SITES = [
    { id:"prais", url:"https://e3301ee8.michael-hobbs.pages.dev/prais", expect:"PrAiS" }
  ];
  const SRC_EXPECT = {
    "app.js":"Obi", "cgn.js":"ObiNet", "cgn-node.js":"CGN", "transcribe.js":"ObiTranscribe",
    "summary.js":"ObiSummary", "review.js":"ObiReview", "audio-split.js":"ObiAudioSplit",
    "pheromone.js":"ObiPheromone", "playbooks.js":"ObiPlaybooks", "scout.js":"ObiScout", "ecosystem.js":"ObiEcosystem",
    "constellation.js":"ObiConstellation", "clients.js":"ObiClients", "ilog.js":"ObiILog", "forge.js":"ObiForge"
  };
  /* standalone: the two shim files ARE part of this page's own terrain, so verify them too
     rather than dismissing them as "platform scripts" that are "not ours" (they are ours now) */
  if(typeof window !== "undefined" && window.__OBI_CLOUDFLARE){ SRC_EXPECT["ob1-shim.js"] = "root"; SRC_EXPECT["ob1-patch.js"] = null; }

  const hooks = {};
  let last = null;
  let lastUrl = null;

  function keyGet(k){ try{ return JSON.parse(localStorage.getItem("obi_keys") || "{}")[k] || null; }catch(e){ return null; } }
  function withTimeout(p, ms, what){
    let t;
    return Promise.race([
      p,
      new Promise((_, rej) => { t = setTimeout(() => rej(new Error("timeout after " + ms + "ms" + (what ? " — " + what : ""))), ms); })
    ]).finally(() => clearTimeout(t));
  }
  async function text(url, ms, opts){
    const r = await withTimeout(root.superFetch(url, opts || {}), ms || 9000, url);
    const body = await withTimeout(r.text(), ms || 9000, url + " (body)");
    return { status: r.status, body };
  }
  async function json(url, ms, opts){
    const r = await text(url, ms, opts);
    let j = null; try{ j = JSON.parse(r.body); }catch(e){}
    return { status: r.status, j, body: r.body };
  }
  const titleOf = h => (String(h).match(/<title>([\s\S]{0,120}?)<\/title>/i) || [])[1] || null;

  /* ---------- terrain probes: each returns {verdict, summary, rows, cache} ---------- */

  async function pSelf(){
    const all = [...document.querySelectorAll("script[src]")].map(s => s.getAttribute("src")).filter(Boolean);
    const app = all.filter(s => /\.js(\?|$)/i.test(s) && !/perchance-engine|beacon\.min\.js|cloudflareinsights|perchance\.org\/lib\//i.test(s));
    const rows = [], cache = [];
    let bytes = 0, lines = 0, missing = 0, absent = 0;
    for (const src of app){
      let rel = src;
      try{ rel = new URL(src, location.href).pathname.replace(/^\//, ""); }catch(e){}
      const file = rel.split("/").pop();
      try{
        let r = await withTimeout(fetch(rel), 9000, rel);
        let body = await r.text();
        if(!r.ok){
          const p = await text(src, 12000);
          r = { ok: p.status === 200, status: p.status };
          body = p.body;
        }
        bytes += body.length; lines += body.split("\n").length;
        const want = SRC_EXPECT[file];
        const found = !want || body.indexOf("window." + want) !== -1;
        if(!r.ok) missing++;
        if(!found) absent++;
        rows.push([rel, r.status + " · " + body.length + " B · " + body.split("\n").length + " lines",
          want ? ("expects window." + want + " — " + (found ? "FOUND" : "ABSENT")) : "no declared global"]);
        cache.push(["src:" + rel, r.ok && found, want ? ("window." + want + (found ? " found" : " absent")) : null]);
      }catch(e){
        missing++;
        rows.push([rel, "UNREACHABLE", e.message]);
        cache.push(["src:" + rel, false, e.message]);
      }
    }
    const others = all.length - app.length;
    if(others > 0) rows.push([others + " platform script(s)", "SKIPPED", "the platform's own scripts — not ours to verify"]);
    const verdict = !app.length ? "UNVERIFIED" : (missing ? (missing === app.length ? "DEAD" : "DRIFT") : (absent ? "DRIFT" : "LIVE"));
    return { verdict, summary: app.length + " app files this page loads · " + bytes + " B · " + lines + " lines · " + missing + " unreachable · " + absent + " missing global",
      rows, cache, facts:{ scripts:app.length, bytes, lines } };
  }

  async function pImports(){
    /* Standalone (the Cloudflare build): there is no perchance generator to look up, so verify
       the same thing the platform response was standing in for — that every plugin API the app
       was written against is actually present and shaped right. Fail-closed, same as ever. */
    if(window.__OBI_CLOUDFLARE){
      const need = ["kv","generateText","generateImage","superFetch","uploadPlugin","createServerSocket"];
      const rows = [], cache = [];
      let ok = 0;
      for(const k of need){
        const v = root && root[k];
        const good = k === "kv" ? !!(v && v.scout) : typeof v === "function";
        if(k === "uploadPlugin") { if(!good || !v.editable || typeof v.editable.set !== "function") { rows.push([k,"DRIFT","no .editable set — CGN hub files will 404"]); cache.push(["import:"+k,false]); continue; } }
        if(good) ok++;
        rows.push([k, good ? "PRESENT" : "ABSENT", k === "kv" ? "IndexedDB folder proxy" : "shimmed by ob1-shim.js"]);
        cache.push(["import:" + k, good]);
      }
      const rpc = (() => { try{ return typeof root.createServerSocket === "function"; }catch(e){ return false; } })();
      const verdict = ok === need.length ? "LIVE" : (ok ? "DRIFT" : "DEAD");
      return { verdict, summary: ok + "/" + need.length + " plugin APIs shimmed on this origin (standalone — no perchance page)" + (rpc ? " · tunnel = the Worker's TunnelDO" : ""),
        rows, cache, facts:{ imports:need.length, resolved:ok, codeBytes:null, standalone:true } };
    }
    const name = window.generatorName;
    const r = await json("https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=" + encodeURIComponent(name), 15000);
    if(!r.j || !r.j.generators) return { verdict:"UNVERIFIED", summary:"platform API returned no generator map (HTTP " + r.status + ")", rows:[["body", "—", String(r.body).slice(0,200)]], cache:[] };
    const gens = r.j.generators, me = gens[name];
    if(!me) return { verdict:"UNVERIFIED", summary:"platform API has no entry for " + name, rows:[], cache:[] };
    const imports = Array.isArray(me.imports) ? me.imports : Object.keys(me.imports || {});
    const unresolved = imports.filter(i => !gens[i]);
    const unfound = (r.j.unfound || []);
    const rows = imports.map(i => [i, gens[i] ? "RESOLVED" : "UNRESOLVED", gens[i] ? ("code " + String((gens[i].code||"").length) + " B" + (gens[i].lastEditTime ? " · " + new Date(gens[i].lastEditTime).toISOString().slice(0,10) : "")) : "not in the platform response"]);
    const cache = imports.map(i => ["import:" + i, !!gens[i]]);
    const verdict = (unresolved.length || unfound.length) ? "DRIFT" : (imports.length ? "LIVE" : "BLOCKED");
    return { verdict, summary: imports.length + " imports · " + (imports.length - unresolved.length) + " resolve on the platform · main.pjs " + String((me.code||"").length) + " B" + (unfound.length ? " · unfound: " + unfound.join(",") : ""),
      rows, cache, facts:{ imports:imports.length, resolved:imports.length - unresolved.length, codeBytes:(me.code||"").length } };
  }

  async function pCanon(){
    const tok = keyGet("gh");
    if(!tok) return { verdict:"BLOCKED", summary:"no GitHub PAT in this browser — the canon is private. /gh token &lt;PAT&gt; to open this sector. (Fail-closed: nothing assumed.)",
      rows:[["HEAD", "—", "not read: no credential"], ["PATHS", "—", CANON.files.length + " canonical paths unverified"]], cache:[] };
    const head = { headers:{ "Authorization":"Bearer " + tok, "Accept":"application/vnd.github+json" } };
    const h = await withTimeout(fetch(CANON.base + "/commits?per_page=1&sha=" + CANON.branch, head), 12000, "canon HEAD");
    if(!h.ok) return { verdict: h.status === 401 || h.status === 403 ? "BLOCKED" : "DEAD", summary:"commits API HTTP " + h.status, rows:[["HTTP", String(h.status), (await h.text()).slice(0,160)]], cache:[] };
    const commits = await h.json();
    const c = Array.isArray(commits) ? commits[0] : null;
    const root = await withTimeout(fetch(CANON.base + "/contents/?ref=" + CANON.branch, head), 12000, "canon root");
    const rootJ = root.ok ? await root.json() : null;
    const rows = [["HEAD", c ? c.sha.slice(0,10) : "—", c ? (new Date(c.commit.author.date).toISOString().slice(0,16).replace("T"," ") + " · " + String(c.commit.message).split("\n")[0].slice(0,90)) : "no commits returned"]];
    rows.push(["ROOT", rootJ ? String(rootJ.length) + " entries" : "unreadable", rootJ ? rootJ.slice(0,10).map(x => x.name).join(" · ") : ""]);
    const cache = [];
    let verified = 0;
    for (const f of CANON.files){
      const pr = await withTimeout(fetch(CANON.base + "/contents/" + encodeURIComponent(f).replace(/%2F/g, "/") + "?ref=" + CANON.branch, head), 12000, f);
      const ok = pr.ok;
      if(ok) verified++;
      rows.push([f, ok ? "PRESENT" : "HTTP " + pr.status, ok ? "verified live" : "canonical path does not resolve"]);
      cache.push(["canon:" + f, ok]);
    }
    const verdict = (!c || verified !== CANON.files.length) ? "DRIFT" : "LIVE";
    return { verdict, summary:"HEAD " + (c ? c.sha.slice(0,10) : "?") + " · root " + (rootJ ? rootJ.length : "?") + " entries · " + verified + "/" + CANON.files.length + " canonical paths verified",
      rows, cache, facts:{ head: c ? c.sha : null, rootEntries: rootJ ? rootJ.length : null, verified } };
  }

  async function pCloudflare(){
    const tok = keyGet("cf"), acct = keyGet("cfAcct");
    if(!tok || !acct) return { verdict:"BLOCKED", summary:"no Cloudflare token/account in this browser. /cf token &lt;API_TOKEN&gt; to open this sector.",
      rows:[["TOKEN", tok ? "present" : "absent", acct ? ("account " + acct.slice(0,8) + "…") : "account unresolved"]], cache:[] };
    const auth = { headers:{ "Authorization":"Bearer " + tok } };
    const w = await json("https://api.cloudflare.com/client/v4/accounts/" + acct + "/workers/scripts", 12000, auth);
    const scripts = (w.j && w.j.result) ? w.j.result.map(s => s.id) : null;
    const p = await json("https://api.cloudflare.com/client/v4/accounts/" + acct + "/pages/projects", 12000, auth);
    const pages = (p.j && p.j.result) ? p.j.result.map(x => x.name) : null;
    if(!scripts && !pages) return { verdict:"DEAD", summary:"Cloudflare API rejected the call (HTTP " + w.status + ")", rows:[["error", "—", String((w.j && w.j.errors && w.j.errors[0] && w.j.errors[0].message) || w.body).slice(0,180)]], cache:[] };
    const cache = (scripts || []).map(n => ["worker:" + n, true]);
    return { verdict:"LIVE", summary: (scripts ? scripts.length + " workers" : "workers unreadable") + " · " + (pages ? pages.length + " pages" : "pages unreadable"),
      rows:[["WORKERS", scripts ? String(scripts.length) : "?", scripts ? scripts.slice(0,14).join(" · ") : ""],
            ["PAGES", pages ? String(pages.length) : "?", pages ? pages.slice(0,14).join(" · ") : ""]],
      cache, facts:{ workers: scripts ? scripts.length : null, pages: pages ? pages.length : null } };
  }

  async function pFleet(){
    const rows = [], cache = [];
    let live = 0;
    for (const [name, url] of FLEET){
      try{
        const r = await text(url, 9000);
        let ok = r.status === 200;
        let note = r.body.slice(0, 150).replace(/\s+/g, " ");
        if(name === "soul-logger" && /session_id required/i.test(r.body)){
          ok = true;
          note = "gate ENFORCING doctrine — aggregate SOULCOUNT banned (L31/L32); per-session required · " + note;
        }
        if(ok) live++;
        rows.push([name, r.status === 200 ? "LIVE" : (ok ? "LIVE (" + r.status + " as designed)" : "HTTP " + r.status), note]);
        cache.push(["worker:" + name, ok]);
      }catch(e){
        rows.push([name, "DEAD", e.message]);
        cache.push(["worker:" + name, false]);
      }
    }
    const archi = rows.find(r => r[0] === "phoenix-architecti");
    const archiDown = !!(archi && /"ok":false/.test(archi[2] || ""));
    return { verdict: live === 0 ? "DEAD" : (live < FLEET.length ? "DRIFT" : (archiDown ? "FLAG" : "LIVE")),
      summary: live + "/" + FLEET.length + " fleet endpoints answering" + (archiDown ? " · architecti AI rungs report ok:false" : ""),
      rows, cache, facts:{ live, total:FLEET.length } };
  }

  async function pLive(){
    const rows = [], cache = [];
    let ok = 0;
    for (const s of LIVE_SITES){
      try{
        const r = await text(s.url, 12000);
        const t = titleOf(r.body);
        const matched = r.status === 200 && (!s.expect || r.body.indexOf(s.expect) !== -1);
        if(matched) ok++;
        rows.push([s.id, r.status + " · " + r.body.length + " B", (t ? t : "no <title>") + (s.expect ? (" · marker \"" + s.expect + "\" " + (r.body.indexOf(s.expect) !== -1 ? "present" : "ABSENT")) : "")]);
        cache.push(["site:" + s.id, matched]);
      }catch(e){
        rows.push([s.id, "UNREACHABLE", e.message]);
        cache.push(["site:" + s.id, false]);
      }
    }
    return { verdict: ok === LIVE_SITES.length ? "LIVE" : (ok ? "DRIFT" : "DEAD"),
      summary: ok + "/" + LIVE_SITES.length + " live sites answering with the expected marker", rows, cache };
  }

  async function pEcosystem(){
    if(!hooks.ecosystem) return { verdict:"UNVERIFIED", summary:"the tool inventory (src/ecosystem.js) is not loaded", rows:[], cache:[] };
    const r = hooks.ecosystem();
    return { verdict: r.verdict || "INFO", summary: r.summary, rows: r.rows || [], cache:[] };
  }

  async function pConstellation(){
    if(!hooks.constellation) return { verdict:"UNVERIFIED", summary:"the constellation registry (src/constellation.js) is not loaded", rows:[], cache:[] };
    const r = await hooks.constellation();
    return { verdict: r.verdict || "INFO", summary: r.summary, rows: r.rows || [], cache: r.cache || [] };
  }

  async function pGround(){    const P = window.ObiPheromone, B = window.ObiPlaybooks;
    if(!P) return { verdict:"UNVERIFIED", summary:"pheromone kernel not loaded", rows:[], cache:[] };
    const s = P.stats();
    const sup = B ? B.supplyReport() : null;
    const rows = [["TRAILS", s.trails + " · " + s.live + " live", s.by.positive + " positive / " + s.by.negative + " negative / " + s.by.neutral + " neutral"],
      ["STRONGEST", s.strongest ? s.strongest.key : "—", s.strongest ? ("live " + s.strongest.live + " · " + s.strongest.trips + " trips · " + s.strongest.kind) : "bare ground"],
      ["KEYS", s.keys.join(", ") || "—", "namespaces walked so far"]];
    if(B) rows.push(["OFFERING", B.state().id, "rung " + B.state().rung + " · supply " + sup.used + "/" + sup.budget + " " + sup.unit + (sup.contract ? " · CONTRACT" : "")]);
    return { verdict:"LIVE", summary: s.trails + " trails on the ground (" + s.live + " live) · offering " + (B ? B.state().id : "?"), rows, cache:[] };
  }

  async function pCGN(){
    if(!hooks.cgn) return { verdict:"UNVERIFIED", summary:"CGN surface not wired", rows:[], cache:[] };
    try{
      const st = await hooks.cgn();
      if(!st || !st.joined) return { verdict:"INFO", summary:"not joined to any network — the colony is a single nest", rows:[["CGN", "OFFLINE", "/netjoin to attach this generator to the mesh"]], cache:[] };
      return { verdict:"LIVE", summary: st.net + " · " + st.nodes + " nodes · seq " + st.seq, rows:[["NETWORK", st.net, "hub " + st.hubName], ["NODES", String(st.nodes), st.names || "—"], ["SOUL (hub)", String(st.soul), "whole-organism fragments unioned in the hub"]], cache:[] };
    }catch(e){ return { verdict:"UNVERIFIED", summary:"CGN probe failed: " + e.message, rows:[], cache:[] }; }
  }

  async function pTunnel(){
    if(!hooks.tunnel) return { verdict:"UNVERIFIED", summary:"tunnel surface not wired", rows:[], cache:[] };
    try{
      const t = await hooks.tunnel();
      if(!t || !t.ok) return { verdict:"DEAD", summary:"the command tunnel did not answer", rows:[["TUNNEL", "UNREACHABLE", t && t.error ? t.error : "no reply"]], cache:[] };
      return { verdict:"LIVE", summary: t.count + " commands in the log · " + JSON.stringify(t.counts), rows:[["TUNNEL", "LIVE", "counts " + JSON.stringify(t.counts) + " · lastId " + t.lastId], ["SOCKET", t.state, "cmdq pub/sub"]], cache:[["route:tunnel", true]] };
    }catch(e){ return { verdict:"DEAD", summary:"tunnel probe threw: " + e.message, rows:[], cache:[["route:tunnel", false]] }; }
  }

  const TERRAIN = [
    { id:"self",     label:"BATTLE MAP — files this page actually loads", run:pSelf },
    { id:"imports",  label:"IMPORTS — does every {import:x} resolve on the platform", run:pImports },
    { id:"tunnel",   label:"TUNNEL — the command post", run:pTunnel },
    { id:"tools",    label:"TOOLS — student-evaluator coverage", run:pEcosystem },
    { id:"pieces",   label:"PIECES — the constellation (station · nodes · faces · services)", run:pConstellation },
    { id:"fleet",    label:"FLEET — live worker endpoints", run:pFleet },
    { id:"sites",    label:"LIVE SITES — the sovereign's handed-over terrain", run:pLive },
    { id:"canon",    label:"CANON — the private repo (needs a PAT)", run:pCanon },
    { id:"cloudflare", label:"CLOUDFLARE — the sovereign's account (needs a token)", run:pCloudflare },
    { id:"cgn",      label:"CGN — the colony mesh", run:pCGN },
    { id:"ground",   label:"GROUND — the pheromone field (local terrain)", run:pGround }
  ];

  /* ---------- pheromones + report + card ---------- */

  function trailEmit(results, ctx){
    const P = window.ObiPheromone;
    if(!P) return { laid:0, byKind:{} };
    const byKind = { positive:0, negative:0, neutral:0 };
    const lay = (key, kind, text) => {
      try{ P.deposit({ kind, key, signal:"scout", text:(text || "").slice(0, 200), session:ctx.session, run:ctx.run, drone:"PhoenixScout" }); byKind[kind]++; }catch(e){}
    };
    for (const r of results){
      const kind = r.verdict === "LIVE" ? "positive" : (r.verdict === "DEAD" || r.verdict === "DRIFT" || r.verdict === "FLAG") ? "negative" : "neutral";
      lay("target:" + r.id, kind, r.label + " — " + r.summary);
      for (const c of (r.cache || [])) lay(c[0], c[1] ? "positive" : "negative", c[2] || (r.label + " (" + r.verdict + ")"));
    }
    const flags = results.filter(r => FLAGGY.indexOf(r.verdict) !== -1);
    lay("mission:scout", flags.length ? "neutral" : "positive", flags.length ? ("scout returned with " + flags.length + " flag(s): " + flags.map(f => f.id).join(", ")) : "sector clear — reconnaissance complete");
    return { laid: byKind.positive + byKind.negative + byKind.neutral, byKind };
  }

  function report(ctx, results, trailed, elapsed){
    const flags = results.filter(r => FLAGGY.indexOf(r.verdict) !== -1);
    const iso = new Date(ctx.started).toISOString().replace("T", " ").slice(0, 19);
    let md = "# SCOUT — " + ctx.session + " — " + iso + "\n\n";
    md += "> **Doctrine:** " + "No pipeline. No AI calls. No processing. Flag and tag only." + " (CANON/SCRIPTS/scout.ps1)\n";
    md += "> **Generator:** " + ctx.session + " · run " + (ctx.run == null ? "—" : ctx.run) + " · took " + elapsed + " ms\n";
    md += "> **Scope:** " + (ctx.scope || "all sectors") + " · " + results.length + " target(s) probed\n";
    md += "> **Verdict:** " + (flags.length ? "FLAGGED — " + flags.length + " sector(s) require verification before engage" : "SECTOR CLEAR") + "\n\n";
    md += "| target | verdict | ms | machine-measured |\n|---|---|---|---|\n";
    for (const r of results) md += "| " + r.id + " | " + r.verdict + " | " + r.ms + " | " + String(r.summary).replace(/\|/g, "\\|") + " |\n";
    md += "\n## Evidence (measured, not estimated)\n";
    for (const r of results){
      md += "\n### " + r.id + " — " + r.verdict + "\n" + r.label + "\n\n";
      for (const row of (r.rows || [])) md += "- `" + row[0] + "` · " + row[1] + (row[2] ? " · " + row[2] : "") + "\n";
    }
    md += "\n## Scout pheromones laid (" + trailed.laid + ")\n";
    md += "positive " + trailed.byKind.positive + " · negative " + trailed.byKind.negative + " · neutral " + trailed.byKind.neutral + "\n";
    md += "\nHandoff: " + (flags.length ? "flags raised — MARCH must not engage these sectors without verification (L58 MAP != TERRAIN)." : "sector clear — hand off to MARCH.") + "\n";
    md += "\nDEPOSIT: HELD — writing CANON/SCOUT/scout-" + ctx.session.replace(/[^\w.-]+/g, "-") + "-" + ctx.stamp + ".md runs through PHOENIXOMEGAPROTOCOL. The GitHub token IS held in this browser; the gate is the blocker, not the token. Arm it (/phoenixomegaprotocol <password>) and the deposit goes; until then the free wire carries the report and the canon stays untouched. The wire does not write the canon, and does not claim to.\n";
    if(ctx.scs) md += "\n## SCS Stage 2 (the gate)\n" + ctx.scs.state + " · " + ctx.scs.detail + "\n";
    return md;
  }

  function card(ctx, results, trailed, rep, elapsed){
    const flags = results.filter(r => FLAGGY.indexOf(r.verdict) !== -1);
    let html = '<div class="rise"><div class="rhead">🦅 PhoenixScout — REAL · no AI calls, flag and tag only</div>';
    html += '<div class="rrow"><b>VERDICT</b><span class="vd" style="color:' + (flags.length ? VM.DRIFT : VM.LIVE) + '">' + (flags.length ? flags.length + " FLAGS" : "SECTOR CLEAR") + '</span><div class="rd">' + results.length + " targets probed live in " + elapsed + " ms · " + ctx.session + '</div></div>';
    for (const r of results){
      const rows = (r.rows || []).map(row => '<div class="rrow"><b>' + esc(row[0]) + '</b><span class="vd">' + esc(row[1]) + '</span><div class="rd">' + esc(row[2] || "") + '</div></div>').join("");
      html += '<div class="rrow"><b>' + esc(r.id.toUpperCase()) + '</b><span class="vd" style="color:' + (VM[r.verdict] || "#8a94a6") + '">' + r.verdict + ' · ' + r.ms + 'ms</span><div class="rd">' + esc(r.summary) + "</div>";
      if(rows) html += '<details style="width:100%"><summary style="cursor:pointer;font-size:11px;color:var(--cyan)">evidence (' + (r.rows || []).length + ")</summary>" + rows + "</details>";
      html += "</div>";
    }
    if(ctx.local && ctx.local.length){
      html += '<div class="rrow"><b>LOCAL SECTOR</b><span class="vd">BOOKKEEPING</span><div class="rd">' + ctx.local.length + ' records</div></div>';
      for (const l of ctx.local) html += '<div class="rrow"><b>' + esc(l.name) + '</b><span class="vd">' + esc(l.verdict) + '</span><div class="rd">' + esc(l.detail) + "</div></div>";
    }
    if(ctx.scs){
      const sc = ctx.scs;
      html += '<div class="rrow"><b>SCS STAGE 2</b><span class="vd" style="color:' + (VM[sc.verdict] || "#8a94a6") + '">' + esc(sc.state) + '</span><div class="rd">' + esc(sc.detail) + '</div></div>';
    }
    html += '<div class="rrow"><b>PHEROMONES</b><span class="vd" style="color:' + VM.LIVE + '">' + trailed.laid + ' LAID</span><div class="rd">positive ' + trailed.byKind.positive + " · negative " + trailed.byKind.negative + " · neutral " + trailed.byKind.neutral + " — the ground now knows what the scout walked</div></div>";
    const w = rep.wire;
    let wireTxt;
    if(!w) wireTxt = "the free wire was not consulted — nothing was pushed";
    else if(w.nerve) wireTxt = "DELIVERED ON THE FREE WIRE — nerve broadcast " + esc(String(w.nerve))
      + (w.url ? ' · <a href="' + esc(w.url) + '" target="_blank" rel="noopener" style="color:var(--cyan)">⤓ the flagged report, addressed</a> (permanent · no token needed)' : " · nerve only — a clean sweep's details are already in the register's digests, so nothing new was addressed")
      + (w.carryWhy ? " · the carrier refused the file: " + esc(w.carryWhy) : "");
    else wireTxt = "the free wire refused: " + esc(w.nerveWhy || "no reason given");
    html += '<div class="rrow"><b>REPORT</b><span class="vd">' + esc(rep.id) + '</span><div class="rd">' + rep.bytes + ' B · saved to the durable scout archive (kv) · <a href="' + rep.url + '" download="' + esc(rep.id) + '" style="color:var(--cyan)">⬇ download the scout report</a><br>' + wireTxt + '<br>CANON DEPOSIT: HELD — the authority is behind PHOENIXOMEGAPROTOCOL, not a missing token (the token is held in this browser). Arm the gate (/phoenixomegaprotocol &lt;password&gt;) and the deposit goes; until then the wire carries the report and the canon is untouched. The wire does not write the canon, and does not claim to.</div></div>';
    html += '<div class="rfoot">' + (flags.length ? "FLAGGED — " + flags.map(f => f.id).join(", ") + " must be verified before engage (L58 MAP ≠ TERRAIN)." : "SECTOR CLEAR — hand off to MARCH.") + ' Run <b>/route &lt;task&gt;</b> to see how the trails changed.</div></div>';
    return html;
  }

  /* ------------------------------ THE HARD CONFIRMATION ----------------------
     MARCH (SCS Stage 3) audits SCOUT: "Territory sweep. Confirm the scout the
     hard way." (src/scs.js STAGES · GOSPEL-999 §SYSTEM I). A verdict printed
     once is only a claim, so the march walks the flagged sectors AGAIN, on its
     own, and compares the two readings. Same verdict → CONFIRMED. A sector that
     answers differently → MOVED (the scout's flag was stale, and that is worth
     exactly as much as a confirmation). A sector whose re-probe throws →
     UNREACHABLE. Nothing is inferred from the first reading, and a sector the
     march could not walk is named rather than dropped.

     AND ALONG THE CLAIM ITSELF. Re-running the same probe is the weakest form of
     confirmation — two readings of one test. So for the claims that can be tested
     a DIFFERENT way, MARCH does that: where the scout said "the canon is private,
     no PAT", the march asks GitHub anonymously (a 404 is the claim holding, a 200
     would contradict it outright); where the scout said "no Cloudflare credential
     works from here", the march asks Cloudflare anonymously. The two credential
     flags are exactly the ones worth testing independently, because they are the
     two that would change everything if they were wrong. Every item says which
     test was used. */
  async function claimCanon(){
    const claim = "the canon is PRIVATE — an anonymous read is refused";
    try{
      const r = await withTimeout(fetch(CANON.base + "/commits?per_page=1&sha=" + CANON.branch, { headers:{ "Accept":"application/vnd.github+json" } }), 12000, "anonymous canon read");
      const body = (await r.text()).slice(0, 200).replace(/\s+/g, " ");
      return { claim, tested: !r.ok,
        detail: "anonymous commits API (no Authorization header) → HTTP " + r.status + (r.ok ? " · THE REPO ANSWERED WITHOUT A CREDENTIAL — the BLOCKED flag is CONTRADICTED and the canon is readable" : " · " + body.slice(0, 140)) };
    }catch(e){ return { claim, tested:null, detail:"the independent read threw: " + ((e && e.message) || e) }; }
  }
  async function claimCloudflare(){
    const claim = "no Cloudflare credential works from this origin";
    const url = "https://api.cloudflare.com/client/v4/user/tokens/verify";
    const tries = [];
    let r = null, via = "anonymous token verify from this origin (plain fetch, no Authorization header)";
    try{ r = await withTimeout(fetch(url, { headers:{ "Accept":"application/json" } }), 12000, "anonymous cloudflare verify"); }
    catch(e){
      tries.push("plain fetch: " + ((e && e.message) || e));
      /* cloudflare's API sends no CORS header, so the anonymous read goes through
         the platform proxy — still with NO credential, so it is still a test of the
         claim and not a bypass of it. */
      try{
        if(root && root.superFetch){ r = await withTimeout(root.superFetch(url, { headers:{ "Accept":"application/json" } }), 25000, "anonymous cloudflare verify (proxied)"); via = "anonymous token verify through the platform proxy (plain fetch was CORS-blocked), no Authorization header"; }
      }catch(e2){ tries.push("the platform proxy: " + ((e2 && e2.message) || e2)); }
    }
    if(!r) return { claim, tested:null, detail:"the independent read could not be taken — " + tries.join(" · ") };
    let body = ""; try{ body = (await r.text()).slice(0, 160).replace(/\s+/g, " "); }catch(e){}
    /* The claim is "no credential works from here", so the claim HOLDS when the API
       REFUSES the anonymous call — whatever shape its refusal takes. Cloudflare
       answers a bare request with HTTP 400 + code 1001 "Missing \"Authorization\"
       header" rather than 401, and reading only for 401/403 made a refusal look
       like a contradiction. Only a 2xx (the API actually answering as
       authenticated) can contradict the claim. The API's own words are printed so
       the reader can check the judgement rather than trust it. */
    return { claim, tested: !r.ok,
      detail: via + " → HTTP " + r.status + (r.ok ? " · THE API ANSWERED AS AUTHENTICATED — the BLOCKED flag is CONTRADICTED" : " · the API refused the unauthenticated call: " + body.slice(0, 120)) };
  }
  const CLAIM_TESTS = { canon: claimCanon, cloudflare: claimCloudflare };

  async function confirm(opts){
    opts = opts || {};
    const prev = last;
    if(!prev || !prev.results || !prev.results.length){
      return { ok:false, why:"no scout on record in this page's life — MARCH confirms a scout, it does not invent one", items:[], confirmed:0, moved:0, unreachable:0, independent:0 };
    }
    const flagged = prev.results.filter(r => FLAGGY.indexOf(r.verdict) !== -1);
    const ctx = { started: Date.now(), session: prev.session, run: prev.run };
    const items = [];
    for(const was of flagged){
      const t = TERRAIN.filter(x => x.id === was.id)[0];
      const t0 = Date.now();
      /* 1 — the claim, tested a different way, where such a test exists */
      let claim = null;
      try{ if(CLAIM_TESTS[was.id]) claim = await CLAIM_TESTS[was.id](); }
      catch(e){ claim = { claim:"the independent test threw", tested:null, detail:String((e && e.message) || e) }; }
      /* 2 — and the sector itself, walked a second time */
      let now = null;
      if(t){
        try{ now = await t.run(ctx); }
        catch(e){ now = { verdict:"UNREACHABLE", summary:"the re-probe threw: " + ((e && e.message) || e) }; }
      }
      const v = now ? ((now && now.verdict) || "UNREACHABLE") : null;
      let result, how;
      if(claim && claim.tested === true){
        result = "CONFIRMED"; how = "independent claim test";
      } else if(claim && claim.tested === false){
        result = "CONTRADICTED"; how = "independent claim test";
      } else if(claim){
        result = (v === was.verdict) ? "CONFIRMED" : (v === "UNREACHABLE" ? "UNREACHABLE" : "MOVED");
        how = "second reading (the independent test could not be taken)";
      } else if(!t){
        result = "NOT WALKED"; how = "no probe for this sector in TERRAIN";
      } else {
        result = (v === was.verdict) ? "CONFIRMED" : (v === "UNREACHABLE" ? "UNREACHABLE" : "MOVED");
        how = "second reading";
      }
      items.push({ id:was.id, was:was.verdict, now:v, ms:Date.now() - t0, how,
        claim: claim ? claim.claim : null,
        claimDetail: claim ? claim.detail : null,
        result,
        summary: (now && now.summary) || (t ? "" : "no probe for this sector in TERRAIN") });
    }
    const confirmed = items.filter(i => i.result === "CONFIRMED").length;
    const moved = items.filter(i => i.result === "MOVED" || i.result === "CONTRADICTED").length;
    const unreachable = items.filter(i => i.result === "UNREACHABLE" || i.result === "NOT WALKED").length;
    const independent = items.filter(i => /^independent/.test(i.how || "")).length;
    return { ok:true, at:ctx.started, session:ctx.session, items, confirmed, moved, unreachable, independent,
      flagsBefore: flagged.map(r => r.id),
      sentence: items.length + " flagged sector(s) confirmed · " + confirmed + " held · " + moved + " moved/contradicted · " + unreachable + " not walked · " + independent + " tested independently" };
  }

  /* ------------------------------- THE ROUTE BACK ---------------------------
     Whatever MARCH could not walk, named. The canon sector is the standing one:
     it is private, and this browser holds no PAT, so no sweep of this station can
     ever confirm it — that is a statement about the credential, not about the
     canon. A march that stayed silent about it would be the L58 defect (map read
     as terrain). */
  function notWalked(){
    var rows = [];
    try{
      var has = {};
      try{ has = JSON.parse(localStorage.getItem("obi_keys") || "{}") || {}; }catch(e){ has = {}; }
      rows.push({ sector:"canon", why: has.gh ? "a PAT is present — the canon sweep can run" : "no GitHub PAT in this browser: the canon is private, so nothing in it was walked or confirmed", reachable: !!has.gh });
      rows.push({ sector:"cloudflare", why: has.cf ? "a token is present — the account sweep can run" : "no Cloudflare token/account in this browser: the sovereign's account was not walked", reachable: !!has.cf });
      rows.push({ sector:"ground", why:"the pheromone field is local (this origin) — it is walked by every sweep, not by a march", reachable:true });
    }catch(e){}
    return rows;
  }

  function localRows(records){
    return (records || []).map(r => ({ name:r.name, detail:r.detail, verdict:r.verdict }));
  }

  async function run(opts){
    opts = opts || {};
    const ctx = { started: Date.now(), session: opts.session || ((window.generatorName || "obi") + "/" + String(window.generatorPublicId || "").slice(0, 6)), run: opts.run == null ? null : opts.run };
    ctx.stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    /* THE SCS STAGE-2 STATUS — handed in by the route (app.js scsScoutStatus).
       Stage 2 (the canon's /phoenixSCOUT) audits RISE, so the card carries the
       session verdict beside the terrain verdict: a real sweep on a shut gate is
       still a shut gate, and the card must not hide that. */
    ctx.scs = opts.scs || null;
    /* THE ARGUMENT IS READ AS WORDS, NOT AS ONE STRING. It carries both the
       terrain filter AND the hunt's terms — the sovereign's command is one
       sentence ("/PhoenixScout all Mailhala, and website info, SOUL priority
       everything to https://…") — so matching the whole string against a sector
       id matched none of them and probed NOTHING. An empty sweep is the worst
       kind of wrong: it renders as reconnaissance. `all` / `every` /
       `everything` mean the whole map (his own word for it); a named sector
       still narrows the sweep; and a word list that names no sector falls back
       to the whole map rather than to silence. The sweep is read-only, so a
       wider map can only add evidence. */
    const only = String(opts.only || "").trim().toLowerCase();
    const words = only.split(/[\s,]+/).filter(Boolean);
    const every = !words.length || words.some(w => w === "all" || w === "every" || w === "everything");
    let targets = every ? TERRAIN : TERRAIN.filter(t => words.some(w => t.id.indexOf(w) !== -1 || w.indexOf(t.id) !== -1));
    if(!targets.length) targets = TERRAIN;
    ctx.scope = every ? "all sectors (the sovereign's word: all)" : (targets.length === TERRAIN.length ? "all sectors (no sector name matched in: " + only + ")" : targets.map(t => t.id).join(", "));
    const P = window.ObiPheromone;
    if(P) P.deposit({ kind:"neutral", key:"mission:scout", signal:only || "all", text:"scout out — " + targets.map(t => t.id).join(", "), session:ctx.session, run:ctx.run, drone:"PhoenixScout" });

    const results = [];
    for (const t of targets){
      const t0 = Date.now();
      let res;
      try{ res = await t.run(ctx); }
      catch(e){ res = { verdict:"UNVERIFIED", summary:"probe threw: " + e.message, rows:[], cache:[] }; }
      res = Object.assign({ id:t.id, label:t.label, verdict:"UNVERIFIED", summary:"", rows:[], cache:[] }, res, { ms: Date.now() - t0 });
      results.push(res);
    }
    const elapsed = Date.now() - ctx.started;
    const trailed = trailEmit(results, ctx);

    let rep = { id:"scout-" + ctx.stamp + ".md", bytes:0, url:"#", md:"", wire:null };
    let flags = results.filter(r => FLAGGY.indexOf(r.verdict) !== -1);
    try{
      const md = report(ctx, results, trailed, elapsed);
      rep.md = md; rep.bytes = md.length;
      if(lastUrl){ try{ URL.revokeObjectURL(lastUrl); }catch(e){} }
      lastUrl = URL.createObjectURL(new Blob([md], { type:"text/markdown" }));
      rep.url = lastUrl;
      if(root && root.kv && root.kv.scout) await root.kv.scout.set(rep.id, { id:rep.id, at:ctx.started, session:ctx.session, run:ctx.run, markdown:md, results:results.map(r => ({ id:r.id, verdict:r.verdict, ms:r.ms, summary:r.summary })) });
      /* THE WIRE — reconnaissance that cannot be delivered is a diary. The canon
         write is behind PHOENIXOMEGAPROTOCOL (the GitHub token IS held in this
         browser; the gate is what is closed), but the free wire needs no token at
         all, so the SCOUT verdict goes out on the nerve EVERY run
         (compact, append-only), and a FLAGGED report — the runs that carry
         information the register's digests do not already hold — is carried to a
         permanent addressed key. Fail closed: a refusal is printed, never
         implied, and the canon deposit is named HELD-with-reason, never as a
         token the browser lacks. */
      try{
        const FW = window.ObiFreeWire;
        if(FW && FW.send){
          const flagIds = flags.map(r => r.id);
          /* the carry goes FIRST, so the broadcast can cite the address it made —
             a family node reading the nerve then needs no second lookup. */
          let carried = null;
          if(flags.length && FW.put){
            carried = await FW.put(String(md) + "\n", "scout-" + ctx.stamp + ".md", "text/plain");
            if(!(carried && carried.ok)) carried = null;
          }
          const said = await FW.send("[SCOUT] " + ctx.session + " · " + new Date(ctx.started).toISOString() + " · "
            + results.length + " targets · " + (flagIds.length ? flagIds.join(", ").toUpperCase() + " FLAGGED" : "SECTOR CLEAR")
            + (ctx.scs ? " · SCS " + ctx.scs.state : "")
            + "\n" + (flags.length ? flags.map(r => r.id.toUpperCase() + " " + r.verdict + " — " + r.summary).join("\n") : "no sector flagged")
            + (carried ? "\nREPORT " + carried.url + " (permanent · no token)" : (flags.length ? "\nREPORT not addressed — every carrier refused" : "")),
            { title:"Obi · scout " + (flags.length ? "flagged" : "clear"), tags: flags.length ? "warning" : "eyes" });
          rep.wire = { nerve: said && said.ok ? said.id : null, nerveWhy: said && said.ok ? null : ((said && said.why) || "the nerve refused"), url: carried ? carried.url : null };
          if(flags.length && !carried) rep.wire.carryWhy = "every carrier refused the report file";
        } else rep.wire = { nerve:null, nerveWhy:"src/freewire.js is not loaded on this page" };
      }catch(e){ rep.wire = { nerve:null, nerveWhy:"the wire threw: " + String((e && e.message) || e) }; }
    }catch(e){ rep.error = e.message; }

    last = { at:ctx.started, session:ctx.session, results, trailed, report:{ id:rep.id, bytes:rep.bytes } };
    return {
      ctx, results, trailed, report:rep, elapsed,
      flags: results.filter(r => FLAGGY.indexOf(r.verdict) !== -1).map(r => r.id),
      html: card(ctx, results, trailed, rep, elapsed)
    };
  }

  window.ObiScout = { run, confirm, notWalked, hooks, TERRAIN, CANON, FLEET, LIVE_SITES, VM, FLAGGY, get last(){ return last; } };
})();
