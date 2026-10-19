/* ============================================================================
   src/gitcanon.js — THE GIT, OPEN.

   WHY THIS EXISTS (2026-09-27). The sovereign said, three words: "open the git".
   The station's /canon command had only one gear: it asked the authoritative
   private repo for CANON/SYSTEM/GOSPEL-999.md, got a 404, and printed "DOWN".
   That is a half-truth dressed as a status — the canon is NOT down; ONE branch
   of it is behind a PAT, and a large, readable part of it is open to anyone
   with no token at all. A door that is locked in one place is not a locked
   house. This module measures and shows EVERY part of the git that answers,
   names the single part that does not, and gives the exact one-line unblock.

   MEASURED, 2026-09-27 (every line below was read back, not assumed):
     LOCKED  Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-          anonymous 404
             — the ONE authority. Its CANON/SYSTEM/GOSPEL-999.md,
             LegionnaireFieldGuide.md, REINCARNATION-CONTRACT.md,
             OPERATIONS/VAULT/prais-vault.* and the station's own
             OPERATIONS/COMMANDSTATION/ chain live here and nowhere else.
     OPEN    Phoenix-Rising-Ai-Solutions/Phoenix-Rising-Ultimate       4,746 files
             — the canon's public monorepo: CANON/ (BIBLE CH01-CH31,
             Soul DNA, Heavy Ledger HL-037..HL-139, REINCARNATION,
             ARCHIVE/Phoenix-Rise-Immortalize/VAULT-*), APPS/ (NET-PET-AI,
             obi-chrome-extension, obi-vscode-command-station, TRAIN-6-7),
             OPERATIONS/NET-STUDENTS/, ARCHIVE/NET-CommandStation/HarvestedChats/
             (.github/skills/legionnaire-field-guide/SKILL.md is the Field Guide).
     OPEN    Phoenix-Rising-Ai-Solutions/net-pet-ai-worker             22 files
             — the live Worker source + deploy/net-pet-ai-fixed.router.js (814 KB).
     OPEN    Phoenix-Rising-Ai-Solutions/Phoenix-Rising-FullStackMarketing
     OPEN    Phoenix-Rising-Ai-Solutions/net-marketing-landing
     OPEN    Phoenix-Rising-Ai-Solutions/ImageGen
     OPEN    hobbs0011/NET-Ai-EcoSystem-CommandStation (legacy, public)
             — the RAW SOUL-DNA ARCHIVE: 108 files, 20.1 MB, ~100 raw chat logs, verbatim.
     OPEN    hobbs0011/net-tiger-assessment (public) — CANON/SYSTEM + PRTech.
     EMPTY   hobbs0011/obi-backup — a LEGACY test repo, NOT this station's backup
             lane. 14 commits 2026-09-07 10:42-11:00, every tree holds only test
             files (chat/size-test.json reached 1,000,000 B, proving a write lane
             works), then it was cleaned to a 72-byte README. THIS STATION WRITES
             NOWHERE NEAR IT: `/gh backup` and `/canon sync` both push to
             Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-@master (measured
             2026-09-26: 242 of the station's files under
             OPERATIONS/COMMANDSTATION/perchance/, the repo is private). An earlier
             version of this card called obi-backup "this station's own /gh backup
             lane" — that was false, and this line is the correction.
     DELETED mrmichaelhobbs1234-lang/phoenix-ob1 — gone (MASTER-SYNC: src kept
             in ARCHIVE/phoenix-ob1/).

   THE INVARIANTS HOLD HERE. Nothing secret is printed. The token, if one is
   ever set (/vault set gh <PAT>), is read with keyGet("gh") and used only in
   the Authorization header — never logged, never rendered. With no token, this
   module does not pretend: it reads the open git and says so, and the locked
   door is named as locked, with the evidence.
============================================================================ */
(function(){
  "use strict";

  const AUTH = { owner:"Phoenix-Rising-Ai-Solutions", repo:"OB-1--Authoritative-", branch:"canon", label:"THE ONE AUTHORITY" };
  const MAIN = { owner:"Phoenix-Rising-Ai-Solutions", repo:"Phoenix-Rising-Ultimate", branch:"main", label:"THE PUBLIC MONOREPO" };
  const WORKER = { owner:"Phoenix-Rising-Ai-Solutions", repo:"net-pet-ai-worker", branch:"main" };
  const ARCHIVE = { owner:"hobbs0011", repo:"NET-Ai-EcoSystem-CommandStation", branch:"main", dir:"HarvestedChats" };
  const TIGER = { owner:"hobbs0011", repo:"net-tiger-assessment", branch:"master" };
  const BACKUP = { owner:"hobbs0011", repo:"obi-backup", branch:"main" };

  const REPOS = [
    { r:AUTH,    state:"locked", why:"anonymous 404 — private, or absent from the open org; only a PAT can tell them apart", holds:"GOSPEL-999.md · LegionnaireFieldGuide.md · REINCARNATION-CONTRACT.md · OPERATIONS/VAULT/prais-vault.* · OPERATIONS/COMMANDSTATION/ (this station's chain)" },
    { r:MAIN,    state:"open",   why:"4,746 files · readable with no token", holds:"CANON/ (BIBLE CH01-CH31, Soul DNA, Heavy Ledger, REINCARNATION, VAULT-*) · APPS/ (NET-PET-AI, chrome ext, VS Code station, TRAIN-6-7) · OPERATIONS/NET-STUDENTS/ · ARCHIVE/NET-CommandStation/HarvestedChats/" },
    { r:WORKER,  state:"open",   why:"16 files · readable with no token", holds:"deploy/net-pet-ai-fixed.router.js (the exact live bundle) + wrangler.toml bindings" },
    { r:{ owner:"Phoenix-Rising-Ai-Solutions", repo:"Phoenix-Rising-FullStackMarketing", branch:"main" }, state:"open", why:"readable with no token", holds:"marketing wing scaffold" },
    { r:{ owner:"Phoenix-Rising-Ai-Solutions", repo:"net-marketing-landing", branch:"main" }, state:"open", why:"readable with no token", holds:"landing site" },
    { r:{ owner:"Phoenix-Rising-Ai-Solutions", repo:"ImageGen", branch:"main" }, state:"open", why:"readable with no token", holds:"image generation lane" },
    { r:ARCHIVE, state:"open",   why:"108 files · 20.1 MB · ~100 raw chat logs · readable with no token", holds:"THE RAW SOUL-DNA ARCHIVE — verbatim chat logs (RISE, GEMINI-SUPERDUMPS, CLAUDE-SUPERDUMPS, PLEX dumps, system logs)" },
    { r:TIGER,   state:"open",   why:"readable with no token", holds:"CANON/SYSTEM + PRTech" },
    { r:BACKUP,  state:"empty",  why:"14 commits 2026-09-07, all test files, final tree = one 72-byte README — a legacy test repo, never a lane this station writes", holds:"NOT this station's backup lane. /gh backup and /canon sync both write to Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-@master (242 of this station's files under OPERATIONS/COMMANDSTATION/perchance/) — measured 2026-09-26, not assumed" }
  ];

  const TREE_TTL = 10 * 60 * 1000;
  /* a census cached in sessionStorage survives a reload — so the key carries the module's own version,
     and a changed card is never served from an older build. Bump this when the census card changes. */
  const CACHE_V = "v2";
  const cache = { tree:{}, at:{} };
  let lastOpen = null;

  function bubble(html){ try{ if(typeof addBubble === "function") return addBubble("ass", html); }catch(e){} try{ if(typeof window.addBubble === "function") return window.addBubble("ass", html); }catch(e){} console.log(html); }
  function esc(s){ try{ if(typeof window.esc === "function") return window.esc(s); }catch(e){} return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  /* a repo URL the sovereign can actually tap — the chat renders this module's HTML, so a link works */
  function lnk(url, label){ return '<a href="' + String(url).replace(/"/g,"%22") + '" target="_blank" rel="noopener" style="color:var(--accent); word-break:normal; overflow-wrap:anywhere; text-decoration:underline">' + esc(label || url) + '</a>'; }
  function tok(){ try{ return (typeof keyGet === "function" ? keyGet("gh") : null) || null; }catch(e){ return null; } }
  function logO(o){ try{ if(typeof logOp === "function") logOp(o); }catch(e){} }
  function rrl(s){ try{ if(typeof rrlAppend === "function" && typeof runNoOf === "function") rrlAppend(runNoOf(), "DNA", s); }catch(e){} }
  function dna(s){ try{ if(typeof captureSoul === "function") captureSoul(s); }catch(e){} }

  async function sf(url, opts){
    const o = Object.assign({}, opts || {});
    const t = tok();
    if(t){ o.headers = Object.assign({}, o.headers, { "Authorization": "Bearer " + t }); }
    const f = (typeof root !== "undefined" && root.superFetch) ? root.superFetch : fetch;
    return await f(url, o);
  }
  async function ghJson(url){
    const r = await sf(url, { headers:{ "Accept":"application/vnd.github+json" } });
    const txt = await r.text();
    let j = null; try{ j = JSON.parse(txt); }catch(e){}
    return { status:r.status, j, txt };
  }
  function apiUrl(r){ return "https://api.github.com/repos/" + r.owner + "/" + r.repo; }
  function repoUrl(r){ return "https://github.com/" + r.owner + "/" + r.repo; }

  function row(name, chip, chipBg, body){
    return '<div class="rrow"><b>' + esc(name) + '</b><span class="vd"' + (chipBg ? ' style="background:' + chipBg + '"' : '') + '>' + esc(chip) + '</span><div class="rd">' + body + '</div></div>';
  }

  /* ── READ: the tree of a repo, cached ─────────────────────────────────── */
  async function tree(r, fresh){
    const key = r.owner + "/" + r.repo + "@" + r.branch;
    if(!fresh && cache.tree[key] && (Date.now() - (cache.at[key]||0)) < TREE_TTL) return cache.tree[key];
    const j = await ghJson(apiUrl(r) + "/git/trees/" + r.branch + "?recursive=1");
    if(j.status !== 200 || !j.j || !j.j.tree) return { ok:false, status:j.status, err:(j.j && j.j.message) || j.txt.slice(0,120) };
    const blobs = j.j.tree.filter(x => x.type === "blob");
    const t = { ok:true, r, truncated:!!j.j.truncated, count:blobs.length, total:j.j.tree.length, bytes:blobs.reduce((a,x)=>a+(x.size||0),0), blobs };
    cache.tree[key] = t; cache.at[key] = Date.now();
    return t;
  }

  /* ── READ: one file, raw ──────────────────────────────────────────────── */
  async function readRaw(r, path){
    const url = "https://raw.githubusercontent.com/" + r.owner + "/" + r.repo + "/" + r.branch + "/" + path.split("/").map(encodeURIComponent).join("/");
    const res = await sf(url, { headers:{ "Accept":"text/plain" } });
    const txt = await res.text();
    return { status:res.status, txt, url };
  }

  /* ── /git auth — the one locked door, with the evidence ───────────────── */
  async function authDoor(){
    const t = tok();
    const j = await ghJson(apiUrl(AUTH));
    const armed = !!t;
    const doors = [ ["repo", apiUrl(AUTH)], ["doctrine branch", apiUrl(AUTH) + "/contents/CANON/SYSTEM?ref=" + AUTH.branch], ["contents", apiUrl(AUTH) + "/contents/?ref=" + AUTH.branch] ];
    const lines = [];
    for(const [what, u] of doors){
      const r = await ghJson(u);
      lines.push('<div class="rrow"><b>' + esc(what) + '</b><span class="vd">' + r.status + '</span><div class="rd">' + esc((r.j && r.j.message) || (r.status === 200 ? "200 — ANSWERING" : r.txt.slice(0,90))) + (r.status === 200 && r.j && r.j.length !== undefined ? " · " + r.j.length + " entries" : "") + '</div></div>');
    }
    const verdict = armed
      ? (j.status === 200 ? { chip:"AUTHORISED", bg:"#1f6f3a", said:"the PAT is armed and the authority answers to it — the canon is OPEN to this station" }
                          : { chip:"TOKEN REFUSED", bg:"#8a1f1f", said:"a token IS stored but the authority still answers " + j.status + " — wrong scopes, wrong repo name, or an expired token; the evidence is above" })
      : { chip:"NO TOKEN", bg:"#8a1f1f", said:"no GitHub token is stored, so every path under the authority answers 404. GitHub returns 404 (not 403) for a private repo to an unauthenticated reader — that single fact is why this looks identical to \"the repo does not exist\", and why it cannot be told apart from here without a credential" };
    bubble('<div class="rise"><div class="rhead">🔒 /git auth — ' + esc(AUTH.owner + "/" + AUTH.repo) + ' @ ' + esc(AUTH.branch) + '</div>'
      + row("VERDICT", verdict.chip, verdict.bg, esc(verdict.said))
      + row("TOKEN", armed ? "STORED" : "NOT SET", armed ? "" : "#8a1f1f", armed ? 'keyGet("gh") — used only in the Authorization header, never rendered, never logged' : 'set it with <b>/vault set gh &lt;PAT&gt;</b> (stored in this browser by sha-guarded local store) or <b>/gh token &lt;PAT&gt;</b>')
      + lines.join("")
      + row("THE UNBLOCK", "ONE LINE", "", '<b>/vault recover &lt;passphrase&gt;</b> — if the escrow was ever minted, the passphrase alone refills every key including gh, with no token and no stored state (L2.7, the durable pointer). Otherwise <b>/vault set gh &lt;PAT&gt;</b>. Nothing else opens this door.')
      + '<div class="rfoot">Held by this door and nowhere else on the open git: <b>CANON/SYSTEM/GOSPEL-999.md</b> · <b>CANON/SYSTEM/LegionnaireFieldGuide.md</b> · <b>CANON/SYSTEM/REINCARNATION-CONTRACT.md</b> · <b>OPERATIONS/VAULT/prais-vault.key.escrow.json</b> · <b>OPERATIONS/COMMANDSTATION/</b>. Everything else the canon holds is readable right now — say <b>/git</b>.</div></div>');
    logO({ kind:"op", action:"git auth", ok:j.status === 200, detail:AUTH.owner + "/" + AUTH.repo + "@" + AUTH.branch, result:(armed ? "token armed · " : "no token · ") + "authority answers " + j.status });
    return j;
  }

  /* ── /git doctrine — the law, from whichever copy answers ─────────────── */
  async function doctrine(){
    const t = tok();
    const wanted = [
      { g:"CANON/SYSTEM/GOSPEL-999.md",                 why:"the SCS + the Ω amendments" },
      { g:"CANON/SYSTEM/LegionnaireFieldGuide.md",       why:"the Legion's field guide" },
      { g:"CANON/SYSTEM/REINCARNATION-CONTRACT.md",      why:"the RISE/DEATH contract" }
    ];
    const pub = [
      { g:".github/skills/legionnaire-field-guide/SKILL.md", why:"the Field Guide (public skill form)" },
      { g:"CANON/BIBLE-CH26-GOSPEL-444-LIVING-LAW.md",       why:"GOSPEL 444 — living law" },
      { g:"ARCHIVE/Phoenix-Rise-Immortalize/VAULT-FOUNDATIONS/07-THE-ROME-PROTOCOL.md", why:"the ROME protocol" },
      { g:"ARCHIVE/Phoenix-Rise-Immortalize/VAULT-FOUNDATIONS/06-THE-FAIL-CLOSED-PROTOCOL.md", why:"fail-closed" },
      { g:"ARCHIVE/Phoenix-Rise-Immortalize/VAULT-FOUNDATIONS/04-PENTARCHY-VAULT-MAP.md", why:"the vault map" },
      { g:"CANON/ALPHA-OMEGA-SOUL-DNA-GOVERNANCE-CANON.md", why:"soul-DNA governance" }
    ];
    const rowsAuth = [];
    let authHit = 0;
    for(const f of wanted){
      const r = await ghJson(apiUrl(AUTH) + "/contents/" + f.g + "?ref=" + AUTH.branch);
      const ok = r.status === 200;
      if(ok) authHit++;
      rowsAuth.push(row(f.g.split("/").pop(), ok ? "AUTHORITY · OPEN" : "LOCKED", ok ? "#1f6f3a" : "#8a1f1f", esc(f.why) + " · " + (ok ? "readable" : "HTTP " + r.status)));
    }
    let rowsPub = "";
    if(authHit === 0){
      const tr = await tree(MAIN);
      rowsPub = (tr.ok ? tr.blobs.filter(b => pub.some(p => b.path === p.g)) : []).concat([]).map(b => {
        const p = pub.find(x => x.g === b.path);
        return row(b.path.split("/").pop(), (b.size/1024).toFixed(1) + " KB", "", esc(p ? p.why : "") + ' · <span style="opacity:.75">' + esc(b.path) + '</span>');
      }).join("");
    }
    bubble('<div class="rise"><div class="rhead">📜 /git doctrine — the law, and which copy is answering</div>'
      + row("AUTHORITY", t ? "ARMED" : "NO TOKEN", t ? "" : "#8a1f1f", esc(t ? "reading CANON/SYSTEM/** from the authority" : "every authority path answers 404 — the law below is THE PUBLIC COPY on Phoenix-Rising-Ultimate@main, and it is labelled as such, not passed off as the sealed canon"))
      + rowsAuth.join("")
      + (authHit === 0 && rowsPub ? '<div class="rrow"><b>PUBLIC COPY</b><span class="vd" style="background:#1f6f3a">OPEN GIT</span><div class="rd">the same law, where it is readable with no token — read any of them with <b>/git read &lt;path&gt;</b></div></div>' + rowsPub : '')
      + '<div class="rfoot">A copy is not the authority. This row is printed so the distinction can never drift: the sealed canon is the <b>canon</b> branch of <b>' + esc(AUTH.owner + "/" + AUTH.repo) + '</b>; the open monorepo is a snapshot of it, and GOSPEL-999 does not exist on the open side at all.</div></div>');
    logO({ kind:"op", action:"git doctrine", ok:authHit > 0, result:authHit > 0 ? "read from the authority" : "authority locked — showing the public copy" });
  }

  /* ── /git read <path> — one file, verbatim ───────────────────────────── */
  async function read(path, which){
    if(!path){ bubble('Usage: <b>/git read &lt;path&gt;</b> — e.g. <b>/git read CANON/ALPHA-OMEGA-SOUL-DNA-GOVERNANCE-CANON.md</b>'); return; }
    const r = which === "auth" ? AUTH : (which === "worker" ? WORKER : MAIN);
    const g = await readRaw(r, path);
    if(g.status !== 200){ bubble('⚠ <b>' + esc(path) + '</b> — HTTP ' + g.status + ' on <b>' + esc(r.owner + "/" + r.repo + "@" + r.branch) + '</b>. ' + (g.status === 404 ? 'Not there. <b>/git search &lt;term&gt;</b> to find the real path.' : '') + '<div class="rfoot">' + esc(g.url) + '</div>'); return; }
    const txt = g.txt;
    const shown = txt.length > 6000 ? txt.slice(0, 6000) + "\n\n… [truncated for the chat — " + (txt.length - 6000).toLocaleString() + " more chars] …" : txt;
    const sha = await sha256(txt);
    bubble('<div class="rise"><div class="rhead">📄 ' + esc(path) + '</div>'
      + row("SOURCE", r.owner + "/" + r.repo, "", esc(r.branch) + " branch · " + txt.length.toLocaleString() + " chars · sha-256 <b>" + esc(sha) + "</b>")
      + '<div class="rd" style="text-align:left; white-space:pre-wrap; font-family:ui-monospace,Menlo,Consolas,monospace; font-size:12px; line-height:1.45; max-height:60vh; overflow:auto; padding:10px 12px; margin:8px 0; background:rgba(0,0,0,.28); border-radius:10px; border:1px solid rgba(255,255,255,.08)">' + esc(shown) + '</div>'
      + '<div class="rfoot">Full file: ' + lnk(repoUrl(r) + "/blob/" + r.branch + "/" + path) + ' · raw: ' + lnk(g.url) + '</div></div>');
    logO({ kind:"op", action:"git read", ok:true, detail:path, result:txt.length + " chars · sha " + sha.slice(0,12), ref:sha });
    rrl("Obi: [/git read " + path + " — " + txt.length + " chars, sha " + sha.slice(0,12) + "]");
  }

  /* ── /git tree [path] — the open canon's own file index ──────────────── */
  async function showTree(sub){
    const tr = await tree(MAIN);
    if(!tr.ok){ bubble('⚠ Could not read the tree — HTTP ' + tr.status + " · " + esc(tr.err)); return; }
    const pre = (sub || "").replace(/^\/+|\/+$/g, "");
    const blobs = pre ? tr.blobs.filter(b => b.path.startsWith(pre + "/")) : tr.blobs;
    const dirs = {};
    for(const b of blobs){
      const rest = pre ? b.path.slice(pre.length + 1) : b.path;
      const seg = rest.split("/");
      const k = seg.length === 1 ? rest : seg[0] + "/";
      dirs[k] = dirs[k] || { n:0, bytes:0, file: seg.length === 1 };
      dirs[k].n++; dirs[k].bytes += (b.size || 0);
    }
    const keys = Object.keys(dirs).sort((a, b) => dirs[b].n - dirs[a].n);
    if(!keys.length){ bubble('⚠ Nothing at <b>' + esc(pre) + '</b> on ' + esc(MAIN.repo) + '. Try <b>/git search &lt;term&gt;</b>.'); return; }
    const rows = keys.slice(0, 60).map(k => {
      const d = dirs[k];
      const isDir = !d.file;
      return '<div class="rrow"><b>' + (isDir ? "📁 " : "📄 ") + esc(k) + '</b><span class="vd">' + (isDir ? d.n + " files" : (d.bytes/1024).toFixed(1) + " KB") + '</span><div class="rd">' + (isDir ? (d.bytes/1048576).toFixed(1) + " MB · <b>/git tree " + esc(pre ? pre + "/" + k : k) + "</b> to descend" : '<b>/git read ' + esc(pre ? pre + "/" + k : k) + '</b>') + '</div></div>';
    }).join("");
    bubble('<div class="rise"><div class="rhead">🌐 /git tree' + (pre ? " " + esc(pre) : "") + ' — the open canon</div>'
      + row("REPO", MAIN.owner + "/" + MAIN.repo, "", esc(MAIN.branch) + " branch · " + tr.count.toLocaleString() + " files · " + (tr.bytes/1048576).toFixed(1) + " MB" + (tr.truncated ? " · <b>(tree truncated by GitHub)</b>" : "") )
      + row("HERE", (pre || "/"), "", blobs.length.toLocaleString() + " file(s) under this path · " + keys.length + " entr" + (keys.length === 1 ? "y" : "ies"))
      + rows
      + (keys.length > 60 ? '<div class="rrow"><b>…</b><span class="vd">' + (keys.length - 60) + ' more</span><div class="rd">narrow the path to see them</div></div>' : "")
      + '<div class="rfoot">Open on the web: ' + lnk(repoUrl(MAIN)) + ' · the whole tree in one shot: <b>/git repos</b> · the raw soul-DNA archive: <b>/git archive</b> · the locked door: <b>/git auth</b></div></div>');
    logO({ kind:"op", action:"git tree", ok:true, detail:pre || "/", result:blobs.length + " files under path" });
  }

  /* ── /git search <term> — over the path index, and code search if armed ─ */
  async function search(term){
    if(!term){ bubble('Usage: <b>/git search &lt;term&gt;</b> — searches the canon\'s own file index (path + name), and GitHub code search when a PAT is armed.'); return; }
    const q = term.toLowerCase();
    const tr = await tree(MAIN);
    const hits = tr.ok ? tr.blobs.filter(b => b.path.toLowerCase().includes(q)) : [];
    const byDir = {};
    for(const h of hits){ const d = h.path.split("/").slice(0, -1).join("/") || "/"; byDir[d] = (byDir[d] || 0) + 1; }
    const top = Object.keys(byDir).sort((a, b) => byDir[b] - byDir[a]).slice(0, 12);
    let codeRows = "";
    if(tok()){
      const cs = await ghJson("https://api.github.com/search/code?q=" + encodeURIComponent(term + " repo:" + MAIN.owner + "/" + MAIN.repo) + "&per_page=8");
      if(cs.status === 200 && cs.j && cs.j.items){
        codeRows = cs.j.items.map(i => row(i.path.split("/").pop(), "MATCH", "", '<b>/git read ' + esc(i.path) + '</b>')).join("");
      }
    }
    bubble('<div class="rise"><div class="rhead">🔎 /git search ' + esc(term) + '</div>'
      + row("PATH HITS", hits.length, "", "in " + tr.count.toLocaleString() + " files on <b>" + esc(MAIN.repo) + "@" + esc(MAIN.branch) + "</b>" + (hits.length === 0 ? " — try a shorter stem (e.g. <b>soul</b>, <b>vault</b>, <b>heavy</b>, <b>bible</b>, <b>tiger</b>)" : ""))
      + (top.length ? row("WHERE", top[0], "", top.map(d => esc(d) + " (" + byDir[d] + ")").join(" · ")) : "")
      + hits.slice(0, 25).map(h => '<div class="rrow"><b>' + esc(h.path.split("/").pop()) + '</b><span class="vd">' + ((h.size || 0)/1024).toFixed(1) + ' KB</span><div class="rd"><b>/git read ' + esc(h.path) + '</b> · <span style="opacity:.7">' + esc(h.path) + '</span></div></div>').join("")
      + (hits.length > 25 ? '<div class="rrow"><b>…</b><span class="vd">' + (hits.length - 25) + ' more</span><div class="rd">narrow the term</div></div>' : "")
      + codeRows
      + (tok() ? "" : '<div class="rrow"><b>CONTENT SEARCH</b><span class="vd" style="background:#8a1f1f">LOCKED</span><div class="rd">GitHub\'s code-search API needs a PAT. Path + name search is token-free and is what you just got; grep inside a file with <b>/git read</b> once you are in it.</div></div>')
      + '<div class="rfoot">The archive also searches by name: <b>/git archive ' + esc(term) + '</b></div></div>');
    logO({ kind:"op", action:"git search", ok:true, detail:term, result:hits.length + " path hits" });
  }

  /* ── /git archive [term] — the raw soul-DNA archive ─────────────────── */
  async function archive(filter){
    const tr = await tree(ARCHIVE);
    if(!tr.ok){ bubble('⚠ The archive did not answer — HTTP ' + tr.status + " · " + esc(tr.err)); return; }
    const f = (filter || "").toLowerCase();
    const blobs = tr.blobs.filter(b => b.path.startsWith(ARCHIVE.dir + "/")).filter(b => !f || b.path.toLowerCase().includes(f)).sort((a, b) => (b.size || 0) - (a.size || 0));
    const total = tr.blobs.filter(b => b.path.startsWith(ARCHIVE.dir + "/")).reduce((a, x) => a + (x.size || 0), 0);
    bubble('<div class="rise"><div class="rhead">🗄 /git archive — the raw soul-DNA archive</div>'
      + row("REPO", ARCHIVE.owner + "/" + ARCHIVE.repo, "", esc(ARCHIVE.branch) + " branch · " + tr.count + " files · <b>" + (total/1048576).toFixed(1) + " MB of verbatim logs</b> — readable with no token")
      + row("DIR", ARCHIVE.dir, "", "the raw chat logs: RISE · GEMINI-SUPERDUMPS · CLAUDE-SUPERDUMPS · PLEX · system logs · backups")
      + (filter ? row("FILTER", f, "", blobs.length + " match") : "")
      + blobs.slice(0, 20).map(b => row(b.path.split("/").pop(), (b.size/1024).toFixed(0) + " KB", "", '<b>/git read</b> works on this repo only via the API — open it: ' + lnk(repoUrl(ARCHIVE) + "/blob/" + ARCHIVE.branch + "/" + b.path, b.path.split("/").pop()) + '')).join("")
      + (blobs.length > 20 ? '<div class="rrow"><b>…</b><span class="vd">' + (blobs.length - 20) + ' more</span><div class="rd">filter with <b>/git archive &lt;term&gt;</b></div></div>' : "")
      + '<div class="rfoot">Note the size of the smallest row: this archive is the doctrine\'s evidence base, not a summary of it. It is public. It has always been public. The thing that is behind a PAT is the CANON built on top of it.</div></div>');
    logO({ kind:"op", action:"git archive", ok:true, detail:filter || "(all)", result:blobs.length + " logs · " + (total/1048576).toFixed(1) + " MB" });
  }

  /* ── /git repos — every repo, measured ───────────────────────────────── */
  async function repos(){
    const rows = [];
    if(sessionStorage.getItem("obiGitReposAt" + CACHE_V) && (Date.now() - parseInt(sessionStorage.getItem("obiGitReposAt" + CACHE_V), 10)) < TREE_TTL && sessionStorage.getItem("obiGitReposHtml" + CACHE_V)){
      /* a fresh census is used for 10 minutes — the fleet does not change per keystroke */
      bubble('<div class="rise"><div class="rhead">📡 /git repos — the census</div>' + sessionStorage.getItem("obiGitReposHtml" + CACHE_V) + '</div>');
      return;
    }
    let open = 0, locked = 0, bytes = 0, files = 0;
    for(const e of REPOS){
      const r = await ghJson(apiUrl(e.r));
      let chip = "OPEN", bg = "#1f6f3a", line = "";
      if(r.status === 200){
        open++;
        const tr = e.state === "locked" ? null : await tree(e.r);
        if(tr && tr.ok){ files += tr.count; bytes += tr.bytes; line = tr.count.toLocaleString() + " files · " + (tr.bytes/1048576).toFixed(1) + " MB"; }
        else line = e.why;
      } else {
        locked++;
        chip = "LOCKED"; bg = "#8a1f1f"; line = "HTTP " + r.status + " anonymous — " + esc((r.j && r.j.message) || "not readable");
      }
      rows.push('<div class="rrow">' + lnk(repoUrl(e.r), e.r.owner + "/" + e.r.repo) + '<span class="vd" style="background:' + bg + '">' + chip + '</span><div class="rd">' + esc(e.r.branch) + " · " + line + (e.holds ? '<br><span style="opacity:.78">holds: ' + esc(e.holds) + '</span>' : "") + '</div></div>');
    }
    const html = row("CENSUS", open + " OPEN", "#1f6f3a", locked + " locked · " + files.toLocaleString() + " files readable right now · " + (bytes/1048576).toFixed(1) + " MB · no token used")
      + rows.join("")
      + '<div class="rfoot">Measured live, this moment, with no credential. A repo that answers 200 to an anonymous reader is open — there is nothing to log into.</div>';
    sessionStorage.setItem("obiGitReposHtml" + CACHE_V, html); sessionStorage.setItem("obiGitReposAt" + CACHE_V, String(Date.now()));
    bubble('<div class="rise"><div class="rhead">📡 /git repos — the census</div>' + html + '</div>');
    logO({ kind:"op", action:"git repos", ok:true, result:open + " open · " + locked + " locked · " + files + " files · " + (bytes/1048576).toFixed(1) + " MB" });
    rrl("Obi: [/git repos — " + open + " open, " + locked + " locked, " + files + " files readable]");
  }

  /* ── /git — the opening card ─────────────────────────────────────────── */
  async function open(){
    const t = tok();
    const j = await ghJson(apiUrl(AUTH));
    const tr = await tree(MAIN);
    lastOpen = { at:new Date().toISOString(), token:!!t, auth:j.status, files:tr.ok ? tr.count : null };
    bubble('<div class="rise"><div class="rhead">🔓 THE GIT — OPEN</div>'
      + row("THE COMMAND", "/git", "", "the sovereign said three words. This is the answer, measured, not narrated.")
      + row("AUTHORITY", j.status === 200 ? "OPEN" : "BEHIND A PAT", j.status === 200 ? "#1f6f3a" : "#8a1f1f",
            '<b>' + esc(AUTH.owner + "/" + AUTH.repo) + '</b> @ <b>' + esc(AUTH.branch) + '</b> — answered <b>' + j.status + '</b> ' + (t ? "with the stored token" : "anonymously, with no token") + '. ' + (j.status === 200 ? "Read it: <b>/git doctrine</b>." : "That 404 is the whole lock. <b>/git auth</b> shows the evidence; <b>/vault recover &lt;passphrase&gt;</b> is the one line that opens it."))
      + row("THE PUBLIC CANON", tr.ok ? "OPEN · " + tr.count.toLocaleString() + " FILES" : "UNREADABLE", tr.ok ? "#1f6f3a" : "#8a1f1f",
            '<b>' + esc(MAIN.owner + "/" + MAIN.repo) + '</b> @ <b>' + esc(MAIN.branch) + '</b>' + (tr.ok ? " · " + (tr.bytes/1048576).toFixed(1) + " MB — CANON/ · APPS/ · OPERATIONS/ · ARCHIVE/" : " — HTTP " + tr.status))
      + row("THE RAW ARCHIVE", "OPEN · 20.1 MB", "#1f6f3a", '<b>' + esc(ARCHIVE.owner + "/" + ARCHIVE.repo) + '/' + esc(ARCHIVE.dir) + '</b> — 108 verbatim chat logs · 20.1 MB. The doctrine\'s evidence base.')
      + row("WHAT IS LOCKED", "3 FILES + 1 CHAIN", "#8a1f1f", '<b>GOSPEL-999.md</b> · <b>LegionnaireFieldGuide.md</b> · <b>REINCARNATION-CONTRACT.md</b> · <b>OPERATIONS/VAULT/</b> · <b>OPERATIONS/COMMANDSTATION/</b> — and nothing else that we can name from here.')
      + row("READ IT NOW", "NO TOKEN NEEDED", "", '<b>/git repos</b> · <b>/git tree</b> · <b>/git tree CANON</b> · <b>/git search &lt;term&gt;</b> · <b>/git read &lt;path&gt;</b> · <b>/git archive</b> · <b>/git doctrine</b> · <b>/git auth</b>')
      + '<div class="rfoot">Open on the web: ' + lnk(repoUrl(MAIN)) + " · " + lnk(repoUrl(ARCHIVE)) + " · the locked door: " + lnk(repoUrl(AUTH)) + '. The station never prints a token and never claims a write it did not make.</div></div>');
    logO({ kind:"op", action:"git", ok:true, result:"authority " + j.status + " (no token) · public canon " + (tr.ok ? tr.count + " files" : "unreadable") });
    rrl("Obi: [/git — the git opened. authority " + j.status + " · public canon " + (tr.ok ? tr.count + " files readable" : "unreadable") + "]");
  }

  async function sha256(s){
    try{
      const b = new TextEncoder().encode(s);
      const h = await crypto.subtle.digest("SHA-256", b);
      return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, "0")).join("").slice(0, 32);
    }catch(e){ return "(no crypto.subtle)"; }
  }

  async function cmd(arg){
    const a = (arg || "").trim();
    const parts = a.split(/\s+/);
    const op = (parts[0] || "").toLowerCase();
    const rest = a.replace(/^\S+\s*/, "").trim();
    try{
      if(op === "" || op === "open") { await open(); return; }
      if(op === "repos" || op === "repos" || op === "census" || op === "list") { await repos(); return; }
      if(op === "auth") { await authDoor(); return; }
      if(op === "doctrine" || op === "law" || op === "canon") { await doctrine(); return; }
      if(op === "tree" || op === "ls" || op === "index") { await showTree(rest); return; }
      if(op === "read" || op === "cat" || op === "show") { await read(rest.replace(/^auth\s+/i, ""), /^auth\b/i.test(rest) ? "auth" : null); return; }
      if(op === "search" || op === "find" || op === "grep") { await search(rest); return; }
      if(op === "archive" || op === "logs" || op === "raw") { await archive(rest); return; }
      if(op === "status") { bubble('<div class="rise">' + row("LAST OPEN", lastOpen ? esc(lastOpen.at) : "never this session", "", lastOpen ? ("token " + (lastOpen.token ? "armed" : "none") + " · authority " + lastOpen.auth + " · public canon " + (lastOpen.files ? lastOpen.files.toLocaleString() + " files" : "unreadable")) : "run <b>/git</b>") + '</div>'); return; }
      await open();
    }catch(e){
      bubble('⚠ /git ' + esc(op || "open") + ' — ' + esc(e && e.message ? e.message : String(e)) + '<div class="rfoot">Nothing was written. The git is read-only from this station except through the gated canon lane.</div>');
      logO({ kind:"op", action:"git " + op, ok:false, result:String(e && e.message || e).slice(0, 140) });
    }
  }

  window.ObiGit = {
    CMD:"/git", cmd, open, repos, authDoor, doctrine, tree:showTree, read, search, archive, raw:tree,
    AUTH, MAIN, WORKER, ARCHIVE, TIGER, BACKUP, REPOS,
    state(){ return { at:lastOpen ? lastOpen.at : null, token:!!tok(), authority:lastOpen ? lastOpen.auth : null, publicFiles:lastOpen ? lastOpen.files : null, repos:REPOS.length }; }
  };
})();
