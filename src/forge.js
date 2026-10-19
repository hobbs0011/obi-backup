/* ObiForge — the station's hands on itself (src/forge.js).

   THE POINT. Everything else in this station can operate the world; this module
   operates the STATION. It gives Obi the four abilities the build-assistant has:
   read its own source, write its own source, run code inside itself, and reason
   about itself with its own mind — wired into one bounded agent loop.

   WHAT IT HONESTLY CAN AND CANNOT DO (no over-claim):

     CAN  · read its own live source (fetch from this origin) and its canonical
            copy in the ONE authority repo (GitHub API + the stored token).
          · stage edits to its own files, show a real diff, and commit them to
            the authority under OPERATIONS/COMMANDSTATION/perchance/ — gated by
            PHOENIXOMEGAPROTOCOL, exactly like every other authority write.
          · hot-swap a running module (re-execute new code in this page) so a
            self-edit takes effect immediately, without a platform save.
          · run arbitrary JS inside the station (its own "page_eval").
          · read any other generator's source (the platform's public API) and
            fetch any URL (superFetch) — its own "fetch_generator"/"fetch_url".
          · export itself via the platform's own single-file download.

     CANNOT · overwrite its own perchance listing. The platform gives an
            embedded generator NO authenticated write path — the editor session
            (and its cookies) lives on perchance.org, a different origin, and is
            deliberately out of reach. So a self-edit lands in the three places
            the station DOES control: the authority repo, the running instance
            (hot-swap), and any Cloudflare deployment (/cf deploy). To change the
            LISTING, the sovereign saves it — so the forge hands him the exact
            file, verified.

   FAIL-CLOSED. Every write — commit, hot-swap, eval — requires the Omega gate.
   Nothing is written without Sov100's password armed in this session, and every
   attempt (armed, refused, failed) is an I-LOG entry.
   ========================================================================== */
(function(){
  const esc = s => String(s==null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const kb = n => n < 1024 ? n + "b" : (n/1024).toFixed(n < 102400 ? 1 : 0) + "kb";
  const nowIso = () => new Date().toISOString();
  const shortHash = h => String(h||"").slice(0, 12);

  /* the station's own files — read from app.js's SRC_SNAPSHOT so the two can
     never drift (the whole reason SRC_SNAPSHOT exists). Binaries are dropped in
     the FORGE's view of the list on purpose: the manifest compares source against
     the authority by fetching each file as TEXT and hashing it, which is neither
     meaningful nor quick for 103 .webp/.png files (AUDIT 2026-09-21 — the backup
     list carries them; this list is for reading, diffing and hot-swap). */
  const BIN_RE = /\.(webp|png|jpe?g|gif|ico|bmp|avif|woff2?|ttf|otf|eot|mp3|wav|ogg|mp4|webm|pdf|zip|xlsx?|wasm)$/i;
  function fileList(){
    try{ if(typeof SRC_SNAPSHOT !== "undefined" && Array.isArray(SRC_SNAPSHOT) && SRC_SNAPSHOT.length) return SRC_SNAPSHOT.filter(p => !BIN_RE.test(p)); }catch(e){}
    return ["main.pjs","index.html","src/app.js","src/styles.css","src/ilog.js","src/forge.js"];
  }
  /* modules that expose a `window.ObiX = …` object and can therefore be re-run
     live. app.js / index.html / main.pjs cannot: re-running app.js would re-declare
     its top-level consts (SyntaxError in the global scope) and index.html/main.pjs
     are engine-rendered, not plain scripts. */
  const HOT_SWAP_OK = {
    "src/ilog.js":"ObiILog", "src/forge.js":"ObiForge", "src/scout.js":"ObiScout",
    "src/clients.js":"ObiClients", "src/review.js":"ObiReview", "src/transcribe.js":"ObiTranscribe",
    "src/summary.js":"ObiSummary", "src/audio-split.js":"ObiAudioSplit", "src/cgn.js":"ObiNet",
    "src/pheromone.js":"ObiPheromone", "src/playbooks.js":"ObiPlaybooks",
    "src/ecosystem.js":"ObiEcosystem", "src/constellation.js":"ObiConstellation"
  };

  const MAX_READ_LINES = 260;
  const MAX_REWRITE_BYTES = 60000;
  const MAX_DIFF_CHARS = 4200;

  /* ---------- the live filesystem (this origin + the ONE authority) ---------- */
  const liveCache = {};
  /* main.pjs and index.html are the generator's PANELS — they are not served as
     files on this origin (only src/* are). The platform's own public API serves
     them, so the forge reads them there: that is how the station can read ALL of
     itself, not just the modules. */
  /* main.pjs and index.html are the generator's PANELS. On perchance they are not
     files on this origin, so they are read from the platform's public API. OFF
     perchance — the Cloudflare build, a desktop run — they ARE files served next
     to the app, so the forge reads its whole self wherever it is running. */
  async function panelSource(path){
    const name = window.generatorName;
    const onPlatform = !!name && /(^|\.)perchance\.org$/i.test(location.hostname);
    if(!onPlatform){
      try{ const r = await fetch("/" + path, { cache:"no-store" }); if(r.ok){ const t = await r.text(); if(t && t.trim()) return t; } }catch(e){}
      try{ if(path === "index.html"){ const r = await fetch("/", { cache:"no-store" }); if(r.ok){ const t = await r.text(); if(t && t.trim()) return t; } } }catch(e){}
      return null;
    }
    const url = path === "main.pjs"
      ? "https://perchance.org/api/downloadGenerator?generatorName=" + encodeURIComponent(name) + "&listsOnly=true"
      : "https://perchance.org/api/getGeneratorHtml?generatorName=" + encodeURIComponent(name);
    try{ const r = await root.superFetch(url); if(r.ok){ const t = await r.text(); if(t && t.trim()) return t; } }catch(e){}
    return null;
  }
  async function fetchText(path){
    if(path === "main.pjs" || path === "index.html"){
      const p = await panelSource(path);
      if(p) return p;
    }
    /* one retry: a single transient fetch failure must not look like a missing
       file to the loop (it read "ERROR: Failed to fetch" mid-task once). */
    let lastErr = null;
    for(let i = 0; i < 2; i++){
      try{
        const r = await fetch(path, { cache:"no-store" });
        if(!r.ok) throw new Error(path + " → HTTP " + r.status);
        return await r.text();
      }catch(e){ lastErr = e; await new Promise(r => setTimeout(r, 150)); }
    }
    throw lastErr;
  }
  function repoRef(){
    const L = window.ObiILog;
    return (L && L.REPO) ? L.REPO : { owner:"Phoenix-Rising-Ai-Solutions", repo:"OB-1--Authoritative-", branch:"master" };
  }
  function token(){ try{ return keyGet("gh"); }catch(e){ return null; } }
  async function gitRead(path){
    const t = token();
    if(!t) return { ok:false, why:"NO_TOKEN", path:path };
    const R = repoRef();
    const url = "https://api.github.com/repos/" + R.owner + "/" + R.repo + "/contents/OPERATIONS/COMMANDSTATION/perchance/" + path + "?ref=" + R.branch;
    const r = await ghApiJson(url, { headers:{ "Authorization":"Bearer " + t } });
    if(r.status !== 200 || !r.j || !r.j.content) return { ok:false, why:"HTTP " + r.status, path:path };
    let text = "";
    try{ text = decodeURIComponent(escape(atob(String(r.j.content).replace(/\n/g,"")))); }catch(e){ try{ text = atob(String(r.j.content).replace(/\n/g,"")); }catch(e2){ return { ok:false, why:"decode failed", path:path }; } }
    return { ok:true, path:path, text:text, sha:r.j.sha, bytes:text.length };
  }
  async function read(path, opts){
    opts = opts || {};
    let text;
    if(opts.from === "git"){ const g = await gitRead(path); if(!g.ok) throw new Error("git read failed: " + g.why); text = g.text; }
    else text = await fetchText(path);
    const lines = String(text).split("\n");
    const start = Math.max(1, opts.start || 1), wantEnd = Math.min(lines.length, opts.end || lines.length);
    /* MAX_READ_LINES is ENFORCED here, not just documented — a 210kb file in one
       prompt buries the loop's thread (it burned whole step budgets re-reading
       src/app.js whole). A read is a window; ask for the next one to continue. */
    const end = Math.min(wantEnd, start + MAX_READ_LINES - 1);
    return { path:path, text:text, lines:lines.length, bytes:text.length, start:start, end:end,
      capped: wantEnd > end, nextStart: wantEnd > end ? end + 1 : null,
      slice: lines.slice(start-1, end).map((l,i)=> String(start+i).padStart(5," ") + "| " + l).join("\n") };
  }
  async function hashText(s){
    try{
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(s)));
      return [].map.call(new Uint8Array(buf), b => b.toString(16).padStart(2,"0")).join("");
    }catch(e){ return "no-crypto"; }
  }
  const manifestCache = { at:0, rows:null };
  async function manifest(force){
    if(!force && manifestCache.rows && (Date.now() - manifestCache.at) < 60000) return manifestCache.rows;
    const has = !!token();
    const rows = [];
    for(const p of fileList()){
      const row = { path:p };
      try{ const t = await fetchText(p); row.bytes = t.length; row.live = await hashText(t); row.lines = t.split("\n").length; }
      catch(e){ row.error = e.message; }
      if(has){
        try{
          const g = await gitRead(p);
          row.git = g.ok ? await hashText(g.text) : null;
          row.gitWhy = g.ok ? null : g.why;
          row.drift = (row.live && g.ok) ? (row.live !== await hashText(g.text)) : null;
        }catch(e){ row.gitWhy = e.message; }
      }
      rows.push(row);
    }
    manifestCache.at = Date.now(); manifestCache.rows = rows;
    return rows;
  }

  /* ---------- a line diff (single hunk: common prefix/suffix trimmed) ---------- */
  function diff(before, after, opts){
    opts = opts || {};
    const ctx = opts.context == null ? 3 : opts.context;
    const A = String(before == null ? "" : before).split("\n");
    const B = String(after == null ? "" : after).split("\n");
    let p = 0; const maxP = Math.min(A.length, B.length);
    while(p < maxP && A[p] === B[p]) p++;
    let s = 0;
    while(s < (Math.min(A.length, B.length) - p) && A[A.length-1-s] === B[B.length-1-s]) s++;
    const aStart = p, aEnd = A.length - s, bStart = p, bEnd = B.length - s;
    const removed = aEnd - aStart, added = bEnd - bStart;
    if(removed === 0 && added === 0) return { identical:true, text:"(identical)", removed:0, added:0 };
    const out = [];
    out.push("@@ -" + (aStart+1) + "," + removed + " +" + (bStart+1) + "," + added + " @@");
    for(let i = Math.max(0, aStart-ctx); i < aStart; i++) out.push(" " + A[i]);
    for(let i = aStart; i < aEnd; i++) out.push("-" + A[i]);
    for(let i = bStart; i < bEnd; i++) out.push("+" + B[i]);
    for(let i = aEnd; i < Math.min(A.length, aEnd+ctx); i++) out.push(" " + A[i]);
    let text = out.join("\n");
    if(text.length > MAX_DIFF_CHARS) text = text.slice(0, MAX_DIFF_CHARS) + "\n… (" + (text.length - MAX_DIFF_CHARS) + " more chars in this hunk)";
    return { identical:false, text:text, removed:removed, added:added };
  }

  /* ---------- the staged working tree (nothing touches Git until apply) ------ */
  let stage = {};          /* path -> { content, mode:"write"|"delete", why, at } */
  let stageLog = [];       /* { t, tool, path, note } */
  function stageSet(path, content, mode, why){
    if(!path || path === "undefined") throw new Error("stageSet: a path is required");
    stage[path] = { content: String(content == null ? "" : content), mode: mode || "write", why: why || null, at: nowIso() };
    stageLog.push({ t: nowIso(), tool: mode === "delete" ? "delete" : "write", path: path, note: why || null });
  }
  function stageClear(){ const n = Object.keys(stage).length; stage = {}; stageLog = []; return n; }
  function stageRows(){ return Object.keys(stage).map(p => ({ path:p, mode:stage[p].mode, bytes:stage[p].content.length, why:stage[p].why })); }
  function stageTotal(){ return Object.keys(stage).reduce((n,p) => n + (stage[p].mode === "delete" ? 0 : stage[p].content.length), 0); }

  /* the stage as a bounded diff — the loop is shown what its last edit ACTUALLY
     did, so it can tell when the task is already finished instead of re-issuing
     the same edit (three of eight steps were burned that way; see the I-LOG). */
  async function stageDiffText(max){
    const rows = stageRows();
    if(!rows.length) return "(empty — nothing staged yet)";
    const parts = [];
    for(const r of rows){
      parts.push(r.mode.toUpperCase() + " " + r.path + " (" + kb(r.bytes) + ")" + (r.why ? " · " + r.why : ""));
      if(r.mode !== "delete"){ try{ const d = diff(await fetchText(r.path), stage[r.path].content); parts.push(d.text); }catch(e){} }
    }
    let t = parts.join("\n");
    const lim = max || 1800;
    if(t.length > lim) t = "… (earlier diff trimmed)\n" + t.slice(-lim);
    return t;
  }

  /* ---------- tools — the same set the build-assistant works with ----------- */
  const TOOLS = {
    list_files: { args:"{}", desc:"List the station's own source files with live size, line count, content hash, and drift vs the canonical copy in the authority repo.",
      run: async () => { const rows = await manifest(true); return rows.map(r => (r.path + "  " + kb(r.bytes) + "  " + r.lines + "L  " + shortHash(r.live) + (r.drift === true ? "  DRIFT-FROM-CANON" : r.drift === false ? "  in-canon" : (r.gitWhy ? "  canon:" + r.gitWhy : "")))).join("\n"); } },
    read_file: { args:'{"path":"src/ilog.js","start":1,"end":120}', desc:"Read a WINDOW of one of its own source files (live origin, or from:\"git\" for the canonical copy). 1-based line range, at most " + MAX_READ_LINES + " lines per call — the result says whether the file continues and gives the next start.",
      run: async a => { const r = await read(String(a.path), { start:Number(a.start)||1, end:Number(a.end)||0 || undefined, from:a.from }); return "// " + r.path + " · " + r.lines + " lines · " + kb(r.bytes) + " · showing " + r.start + "-" + r.end + (r.capped ? " (file continues — call read_file with start:" + r.nextStart + " for more)" : "") + "\n" + r.slice; } },
    search: { args:'{"query":"omegaRequire"}', desc:"Regex-search every one of its own source files. Returns path:line: text, capped.",
      run: async a => { const re = new RegExp(String(a.query), "i"); const out = []; for(const p of fileList()){ let t; try{ t = await fetchText(p); }catch(e){ continue; } t.split("\n").forEach((ln,i)=>{ if(out.length < 60 && re.test(ln)) out.push(p + ":" + (i+1) + ": " + ln.trim().slice(0,180)); }); } return out.length ? out.join("\n") : "no matches for /" + a.query + "/"; } },
    write_file: { args:'{"path":"src/x.js","content":"…full new file…"}', desc:"Stage a whole-file rewrite (use for new files or small files).",
      run: async a => { if(!a || !a.path) return "ERROR: write_file needs a path — one of the station's own files"; stageSet(String(a.path), a.content, "write", a.why); return "staged WRITE " + a.path + " (" + kb(String(a.content||"").length) + ")"; } },
    replace: { args:'{"path":"src/x.js","find":"exact text","replace":"new text","all":false}', desc:"Stage an exact-string replacement inside a file (the reliable way to edit a large file). `find` must match — if it matches more than once and all is not true, it refuses.",
      run: async a => {
        const p = String(a.path); const cur = (stage[p] && stage[p].mode !== "delete") ? stage[p].content : await fetchText(p);
        const find = String(a.find == null ? "" : a.find); const rep = String(a.replace == null ? "" : a.replace);
        if(!find) return "ERROR: empty find";
        const count = cur.split(find).length - 1;
        if(count === 0) return "ERROR: find text does not occur in " + p + " (0 matches) — read the file and copy the exact text";
        if(count > 1 && !a.all) return "ERROR: find text occurs " + count + " times in " + p + " — add surrounding context, or pass all:true";
        const next = a.all ? cur.split(find).join(rep) : cur.replace(find, rep);
        if(next === cur) return "NO CHANGE: the replacement text is identical to the find text (" + count + " match(es)) — nothing staged. If the file already contains the change the task asked for, the task is DONE: call done.";
        stageSet(p, next, "write", a.why || ("replace " + count + " occurrence(s)"));
        return "staged REPLACE in " + p + " (" + count + " match(es))";
      } },
    delete_file: { args:'{"path":"src/x.js"}', desc:"Stage a file deletion (rarely correct — history is sealed in Git anyway).",
      run: async a => { if(!a || !a.path) return "ERROR: delete_file needs a path"; stageSet(String(a.path), "", "delete", a.why); return "staged DELETE " + a.path; } },
    stage: { args:"{}", desc:"Show the staged changes and their diffs.", run: async () => {
        const rows = stageRows(); if(!rows.length) return "the stage is empty";
        const parts = [];
        for(const r of rows){ parts.push(r.mode.toUpperCase() + " " + r.path + " (" + kb(r.bytes) + ")" + (r.why ? "  · " + r.why : ""));
          if(r.mode !== "delete"){ try{ const d = diff(await fetchText(r.path), stage[r.path].content); parts.push(d.text); }catch(e){} } }
        return parts.join("\n"); } },
    discard: { args:"{}", desc:"Throw away the whole stage.", run: async () => { const n = stageClear(); return "discarded " + n + " staged change(s)"; } },
    fetch_url: { args:'{"url":"https://…"}', desc:"Fetch any URL through the CORS-free proxy and return its text (bounded).", run: async a => {
        const r = await root.superFetch(String(a.url)); const t = await r.text(); return "HTTP " + r.status + " · " + kb(t.length) + "\n" + t.slice(0, 4000); } },
    introspect: { args:'{"generator":"animal"}', desc:"Read another generator's source (main.pjs + imports) with the platform's public API.", run: async a => {
        const r = await apiJson("https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=" + encodeURIComponent(String(a.generator)));
        if(!r.j || !r.j.generators) return "no generator named " + a.generator + " (HTTP " + r.status + ")";
        const names = Object.keys(r.j.generators);
        return names.map(n => "===== " + n + " =====\n" + String(r.j.generators[n].code || "").slice(0, 1800)).join("\n\n").slice(0, 6000); } },
    gen_image: { args:'{"prompt":"…"}', desc:"Generate an image with the station's own image engine.", run: async a => { const res = await root.generateImage({ prompt:String(a.prompt), resolution:"768x768" }); window.ObiForge.__lastImage = res.dataUrl; return "image generated (" + Math.round((res.dataUrl||"").length/1024) + "kb) — shown in the chat"; } },
    propose: { args:'{"path":"src/x.js","instruction":"…"}', desc:"Ask Obi's own mind to rewrite a whole file for an instruction (small files only, ≤" + Math.round(MAX_REWRITE_BYTES/1000) + "k). Returns the staged result + diff.",
      run: async a => await propose({ path:String(a.path), instruction:String(a.instruction) }) },
    eval: { args:'{"js":"return document.title"}', desc:"Run JS inside the station and return the JSON result. GATED — requires the Omega gate.", run: async a => await evalSelf(String(a.js)) },
    apply: { args:'{"message":"…"}', desc:"Commit the whole stage to the ONE authority repo. GATED — requires the Omega gate.",
      run: async a => await apply({ message: a.message }) },
    hotswap: { args:'{"path":"src/ilog.js"}', desc:"Apply a staged module to the RUNNING station (re-execute it live). GATED.", run: async a => await hotSwap(String(a.path)) },
    export_html: { args:"{}", desc:"Download the station as the platform's own single-file HTML export.", run: async () => await exportSelf() },
    done: { args:'{"summary":"…"}', desc:"Finish: the task is complete (or blocked) — give the sovereign the summary.", run: async a => ({ done:true, summary:String(a.summary||"") }) }
  };
  const TOOL_NAMES = Object.keys(TOOLS);

  /* a staged JS edit is not a success until it parses. `new Function` parses the
     whole module the same way the browser will, so a syntax error surfaces here —
     in the loop — instead of at the sovereign's save. */
  function syntaxCheck(path, code){
    if(!/\.(js|mjs)$/i.test(String(path))) return null;
    try{ new Function(String(code)); return null; }catch(e){ return (e && e.message) || String(e); }
  }
  async function runTool(name, args){
    const t = TOOLS[name];
    if(!t) return "ERROR: no tool named '" + name + "'. Tools: " + TOOL_NAMES.join(", ");
    try{ return await t.run(args || {}); }
    catch(e){ return "ERROR: " + (e && e.message ? e.message : String(e)); }
  }

  /* ---------- propose — Obi writes itself (its own mind, on its own source) --- */
  async function propose(o){
    const p = String(o.path), instruction = String(o.instruction || "");
    let before; try{ before = await fetchText(p); }catch(e){ return "ERROR: cannot read " + p + " — " + e.message; }
    if(before.length > MAX_REWRITE_BYTES) return "ERROR: " + p + " is " + kb(before.length) + " — too large to rewrite whole. Use search + replace instead (exact-string staged edits), which is also safer.";
    if(!instruction) return "ERROR: no instruction";
    const bubble = addBubble("ass", ""); typing(bubble);
    let out = "";
    try{
      const res = await root.generateText({
        instruction: "You are editing ONE source file of a running web application. Return ONLY the complete new file content — no explanation, no markdown fences, no commentary before or after.\n\nFILE: " + p + "\n\nINSTRUCTION: " + instruction + "\n\nCURRENT CONTENT:\n" + before,
        startWith: "",
        onChunk: d => { out = d.fullTextSoFar || out; }
      });
      let next = (out || res.generatedText || res.text || "").trim();
      next = next.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```\s*$/, "");
      if(!next) { bubble.textContent = "⚠ the model returned nothing — nothing staged."; return "ERROR: empty proposal"; }
      const d = diff(before, next);
      if(d.identical){ bubble.textContent = "The model returned the file unchanged — nothing staged."; return "no change"; }
      stageSet(p, next, "write", "proposed: " + instruction.slice(0,120));
      bubble.innerHTML = '<div class="rise"><div class="rhead">✎ /forge propose — ' + esc(p) + '</div>'
        + '<div class="rrow"><b>STAGED</b><span class="vd">' + d.added + "+ / " + d.removed + '-</span><div class="rd">' + esc(instruction) + '</div></div>'
        + '<div class="rrow"><b>DIFF</b><span class="vd">preview</span><div class="rd" style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:11px;max-height:240px;overflow:auto;text-align:left">' + esc(d.text) + '</div></div>'
        + '<div class="rfoot">Staged only — nothing is written until <b>/forge apply</b> (gated). A whole-file rewrite is the machine\'s guess; verify it in <b>/forge diff</b> before committing.</div></div>';
      logOp({ kind:"op", action:"forge propose", detail:p + " · " + instruction.slice(0,140), result:d.added + " added · " + d.removed + " removed" });
      return "staged proposal for " + p + " (+" + d.added + "/-" + d.removed + ")";
    }catch(e){
      bubble.textContent = "⚠ propose failed: " + e.message;
      logOp({ kind:"op", action:"forge propose", ok:false, detail:e.message, result:"failed" });
      return "ERROR: " + e.message;
    }
  }

  /* ---------- apply — the stage → the ONE authority repo (GATED) ------------- */
  async function apply(o){
    o = o || {};
    const rows = stageRows();
    if(!rows.length) return "the stage is empty — nothing to apply";
    if(!await omegaRequire("/forge apply — committing the station's own source to the authority")) return "REFUSED — the Omega gate is locked; nothing was written";
    if(!token()) return "NO_TOKEN — no GitHub token in this browser (/gh token <PAT>); the stage is kept.";
    const L = window.ObiILog;
    if(!L || !L.gitCommitFiles) return "ObiILog.gitCommitFiles unavailable — cannot commit";
    const ts = nowIso().replace(/[:.]/g,"-").slice(0,23);
    const files = {};
    for(const p of Object.keys(stage)){
      if(stage[p].mode === "delete") continue;
      files["OPERATIONS/COMMANDSTATION/perchance/" + p] = stage[p].content;
    }
    files["OPERATIONS/COMMANDSTATION/perchance/FORGE-LOG.md"] =
      "# Self-forge — the station's own edits\n\nWritten by `/forge apply` at " + nowIso() + ".\n\n"
      + rows.map(r => "- `" + r.path + "` — " + r.mode + " (" + kb(r.bytes) + ")" + (r.why ? " · " + r.why : "")).join("\n")
      + "\n\nThe station rewrote its own source. The listing is saved by the sovereign; the running instance can be hot-swapped with `/forge hotswap <module>`.\n";
    const R = repoRef();
    const snap = await L.gitCommitFiles({ owner:R.owner, repo:R.repo, branch:R.branch, files:files, message:"self-forge by the station · " + Object.keys(files).length + " files · " + ts });
    if(snap.commitSha){
      logOp({ kind:"push", action:"forge apply", ok:true, detail:rows.map(r=>r.path).join(", ").slice(0,300), result:Object.keys(files).length + " files · commit " + String(snap.commitSha).slice(0,8), ref:snap.commitSha });
      return "APPLIED — commit " + String(snap.commitSha).slice(0,8) + " on " + R.owner + "/" + R.repo + "@" + R.branch + " · " + snap.pushed + " pushed, " + snap.failed + " failed";
    }
    logOp({ kind:"push", action:"forge apply", ok:false, detail:(snap.errors||[]).join(" · ").slice(0,300) || "no commit", result:"failed" });
    return "FAILED — " + ((snap.errors||[]).slice(0,3).join(" · ") || "no commit returned") + " (the stage is kept)";
  }

  /* ---------- hot-swap — a staged module, applied to the RUNNING station ----- */
  async function hotSwap(path){
    path = String(path);
    const target = HOT_SWAP_OK[path];
    if(!target) return "ERROR: " + path + " cannot be hot-swapped (only the window.ObiX modules can — app.js/index.html/main.pjs cannot be re-executed live; they need a real reload after the sovereign saves the listing).";
    const code = (stage[path] && stage[path].mode !== "delete") ? stage[path].content : (await fetchText(path).catch(()=>null));
    if(!code) return "ERROR: no staged content for " + path + " and could not read it live";
    if(!await omegaRequire("/forge hotswap — swapping " + path + " into the running station")) return "REFUSED — the Omega gate is locked; the running station is unchanged";
    const before = window[target];
    window.__obiHotSwapErr = null;
    const s = document.createElement("script");
    s.textContent = "try{\n" + code + "\n}catch(e){ window.__obiHotSwapErr = (e && e.message) || String(e); }\n//# sourceURL=obi-hotswap-" + path + ".js";
    document.head.appendChild(s);
    await new Promise(r => setTimeout(r, 30));
    if(window.__obiHotSwapErr){
      logOp({ kind:"op", action:"forge hotswap", ok:false, detail:path + " · " + window.__obiHotSwapErr, result:"failed — running code unchanged in part" });
      return "FAILED — " + window.__obiHotSwapErr + " (" + path + "); the page may be inconsistent — reload if unsure";
    }
    const after = window[target];
    const ok = !!after;
    logOp({ kind:"op", action:"forge hotswap", ok:ok, detail:path + " → window." + target, result:ok ? "live module swapped" : "module produced no global" });
    return (ok ? "HOT-SWAPPED " : "RAN, but window." + target + " is missing — ") + path + " is now running the new code in this page";
  }

  /* ---------- eval — run JS inside the station (GATED) ---------------------- */
  async function evalSelf(js){
    if(!await omegaRequire("/forge eval — running code inside the station")) return "REFUSED — the Omega gate is locked";
    try{
      const fn = new Function("return (async () => {\n" + js + "\n})();");
      const v = await fn();
      let out; try{ out = JSON.stringify(v); }catch(e){ out = String(v); }
      if(out == null) out = String(v);
      if(out.length > 3000) out = out.slice(0,3000) + "… (" + out.length + " chars)";
      logOp({ kind:"op", action:"forge eval", detail:js.slice(0,180), result:"ran · " + out.length + " chars returned" });
      return out;
    }catch(e){
      logOp({ kind:"op", action:"forge eval", ok:false, detail:js.slice(0,180), result:e.message });
      return "ERROR: " + e.message;
    }
  }

  /* ---------- export — the platform's own single-file download -------------- */
  async function exportSelf(){
    const name = window.generatorName || "generator";
    try{
      const r = await root.superFetch("https://perchance.org/api/downloadGenerator?generatorName=" + encodeURIComponent(name));
      const html = await r.text();
      const blob = new Blob([html], { type:"text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name + ".html";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 4000);
      logOp({ kind:"export", action:"forge export", detail:name + ".html", result:kb(html.length) });
      return "exported " + name + ".html (" + kb(html.length) + ") — the platform's own single-file build of the LIVE listing (unsaved src edits are not in it)";
    }catch(e){
      logOp({ kind:"export", action:"forge export", ok:false, detail:e.message, result:"failed" });
      return "ERROR: " + e.message;
    }
  }

  /* ---------- THE AGENT LOOP — Obi uses the tools, bounded ------------------ */
  function callExample(n){
    return 'TOOL: {"name":"' + n + '","args":' + TOOLS[n].args + '}';
  }
  function toolMenu(){
    return TOOL_NAMES.map(n => callExample(n) + "\n      " + TOOLS[n].desc).join("\n");
  }
  function parseCall(line){
    let s = String(line || "").trim().replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
    let m = s.match(/TOOL:\s*([\s\S]+)/i);
    if(!m) return null;
    let body = m[1].trim();
    if(!body) return null;
    if(body[0] === "{"){
      try{ const j = JSON.parse(body); if(j && j.name) return { name:String(j.name), args:j.args || j.arguments || {} }; }catch(e){}
      const nm = body.match(/"name"\s*:\s*"([A-Za-z_]+)"/);
      if(nm){ const am = body.match(/"args"\s*:\s*(\{[\s\S]*\})\s*\}?\s*$/); let args = {}; if(am){ try{ args = JSON.parse(am[1]); }catch(e){} } return { name:nm[1], args:args }; }
      return null;
    }
    const nm = body.match(/^([A-Za-z_]+)\s*([\s\S]*)$/);
    if(!nm) return null;
    let args = {};
    const a = (nm[2] || "").trim().replace(/^args\s*[:=]\s*/i, "");
    if(a && a[0] === "{"){ try{ args = JSON.parse(a); }catch(e){} }
    return { name:nm[1], args:args };
  }
  async function ask(task, opts){
    opts = opts || {};
    const maxSteps = Math.min(12, Math.max(1, opts.maxSteps || 8));
    const card = addBubble("ass", "");
    let transcript = "";
    const steps = [];
    const render = (head) => {
      card.innerHTML = '<div class="rise"><div class="rhead">⚒ ' + esc(head) + '</div>'
        + '<div class="rrow"><b>TASK</b><span class="vd">' + steps.length + "/" + maxSteps + ' steps</span><div class="rd">' + esc(task) + '</div></div>'
        + (steps.length ? steps.map(s => '<div class="rrow"' + (s.ok ? "" : ' bad') + '><b>' + esc(s.name) + '</b><span class="vd">' + (s.ok ? "OK" : "FAIL") + '</span><div class="rd">' + esc(s.note || "").slice(0,220) + '</div></div>').join("") : '<div class="rrow"><b>…</b><span class="vd"></span><div class="rd">reading the station, choosing a tool</div></div>')
        + (stageRows().length ? '<div class="rrow"><b>STAGE</b><span class="vd">' + stageRows().length + ' file(s)</span><div class="rd">' + esc(stageRows().map(r=>r.path).join(", ")) + '</div></div>' : "")
        + '<div class="rfoot">Bounded agent loop — every tool call is an I-LOG entry. Writing is gated by PHOENIXOMEGAPROTOCOL: nothing lands until the sovereign arms <b>/phoenixomegaprotocol</b>.</div></div>';
      scrollDown();
    };
    render("forge — Obi is working on itself");
    logOp({ kind:"op", action:"forge ask", detail:task.slice(0,240), result:"agent loop started · max " + maxSteps + " steps" });
    /* the loop is many chained model calls: hold the keep-alive so switching tabs
       mid-edit does not throttle it (and say so if the page goes hidden). */
    try{ window.ObiBg && window.ObiBg.hold("forge loop"); }catch(e){}

    const STATIC = "You are the self-forge of a running web application (a perchance generator called the Command Station). You can inspect and rewrite the station's OWN source files, run code inside it, fetch any URL, read other generators, and generate images.\n\n"
      + "RULES:\n- Prefer exact-string edits: read the file, then use `replace` with text copied verbatim (that is safe on large files). Use `write_file` only for new or small files.\n- Never invent file contents — read first. If a `find` fails, read more and copy the exact text.\n- If the staged diff already shows the change the task asked for, the task is DONE: call `done` (never re-issue an edit that has already landed).\n- Stage changes; do not try to commit them. `apply`, `hotswap` and `eval` are gated by the sovereign's password and will refuse if it is not armed — that is correct behaviour, not an error to work around.\n- You cannot change the station's perchance listing; say so plainly if asked.\n- Keep going until the task is done, then call `done` with a short summary.\n\n"
      + "FORMAT — reply with exactly ONE line, nothing else:\n  TOOL: {\"name\":\"<tool>\",\"args\":{...}}      (to use a tool)\n  ANSWER: <your final words>                  (to stop and hand back)\nCopy a ready-made call below and change its arguments. Never write prose around a TOOL line.\n\nTOOLS:\n" + toolMenu() + "\n"
      + "When the task is finished (or cannot be finished), call: TOOL: {\"name\":\"done\",\"args\":{\"summary\":\"what you did, what you staged, what is blocked\"}}\n";

    let answer = null, lastResult = "", fails = 0;
    for(let step = 0; step < maxSteps; step++){
      const prompt = STATIC + "\nTASK: " + task + "\n\nSTAGE NOW:\n" + await stageDiffText()
        + (fails >= 1 ? "\n\nWARNING: your last edit attempt changed nothing. Do not repeat a call that already failed — the text is probably already changed, or you copied it wrong. Read the file again (read_file) and copy the exact text; or, if the task is already complete, call done." : "")
        + "\n\nWORK SO FAR:\n" + (transcript || "(nothing yet — start with list_files or read_file)") + "\n\nNEXT:";
      let line = "";
      try{
        const res = await root.generateText({ instruction: prompt, stopSequences:["\n\n"] });
        line = String(res.generatedText || res.text || "").trim();
      }catch(e){ transcript += "\n(model error: " + e.message + ")"; break; }
      let name = null, args = null;
      const call = parseCall(line);
      if(call){ name = call.name; args = call.args; }
      else {
        const mAns = line.match(/ANSWER:\s*([\s\S]+)/i);
        if(mAns){ answer = mAns[1].trim(); break; }
        if(!/^(TOOL:|ANSWER:)/i.test(line)){ answer = line.slice(0, 1200); break; }
      }
      if(!name){ answer = line.slice(0, 1200); break; }
      let out = await runTool(name, args);
      if(out && typeof out === "object" && out.done){ answer = out.summary || "done"; steps.push({ name:"done", ok:true, note:answer }); render("forge — done"); break; }
      /* the machine checks its own work: a staged file that does not parse is a
         failure to fix, not a step to build on (added after the loop shipped a
         duplicate block — see the I-LOG) */
      if((name === "replace" || name === "write_file") && /^staged/.test(String(out))){
        const p = String((args && args.path) || "");
        const code = (stage[p] && stage[p].mode !== "delete") ? stage[p].content : null;
        const se = code ? syntaxCheck(p, code) : null;
        if(se) out = "STAGED BUT BROKEN — " + p + " does not parse (" + se + "). Read the file again and fix it.";
        else out += "\n→ staged in the working tree. If the diff above already completes the task, call done now; otherwise read again and continue.";
      }
      const text = String(out);
      lastResult = text;
      const stepOk = !/^(ERROR|STAGED BUT BROKEN|NO CHANGE)/.test(text);
      /* only a staged edit is progress: a read or a search does not reset the
         counter, so alternating read→failed-edit can't hide a stalled loop. */
      if(/^staged/.test(text)) fails = 0; else if(!stepOk) fails++;
      steps.push({ name:name, ok:stepOk, note:text.replace(/\s+/g," ").slice(0,160) });
      transcript += "\nTOOL " + name + " " + JSON.stringify(args).slice(0,200) + "\nRESULT: " + text.slice(0, 1600) + "\n";
      if(transcript.length > 12000) transcript = transcript.slice(-8000);
      render("forge — step " + (step+1) + ": " + name);
      /* no progress is a result, not a reason to keep spending steps. After two
         attempts that changed nothing (the model tends to re-issue an edit that
         has already landed), the loop stops and says so instead of flailing. */
      if(fails >= 2){
        const stagedNow = stageRows();
        if(stagedNow.length){
          answer = "Stopped after " + (step+1) + " steps — the stage holds " + stagedNow.length + " file(s) ("
            + stagedNow.map(r=>r.path).join(", ") + "): the requested edit is in the working tree. Later attempts changed nothing, so the loop stopped here. Review with /forge diff, then /forge apply (gated).";
        } else {
          answer = "Stopped after " + (step+1) + " steps — " + fails + " edit attempt(s) produced no change and the stage is empty."
            + (/^NO CHANGE/.test(text) ? " The change the task asks for already appears to be in the file — check the diff above." : " The tool output above says why.")
            + " Re-issue with more guidance if you want me to go further.";
        }
        steps.push({ name:"stop", ok:stagedNow.length > 0, note:answer });
        render(stagedNow.length ? "forge — stopped (change staged)" : "forge — stopped (no progress)");
        break;
      }
    }
    const summary = answer || ("(step budget reached) last result: " + lastResult.slice(0, 300));
    logOp({ kind:"op", action:"forge ask", detail:task.slice(0,180), result:steps.length + " steps · " + (stageRows().length ? stageRows().length + " staged" : "nothing staged") });
    try{ window.ObiBg && window.ObiBg.release(); }catch(e){}
    return { steps:steps, staged:stageRows(), summary:summary };
  }

  /* ---------- cards ---------- */
  function toolsCard(){
    return '<div class="rise"><div class="rhead">⚒ /forge tools — the same abilities the build-assistant has</div>'
      + Object.keys(TOOLS).map(n => '<div class="rrow"><b>' + esc(n) + '</b><span class="vd">' + (TOOLS[n].desc.indexOf("GATED") !== -1 ? "GATED" : "open") + '</span><div class="rd">' + esc(TOOLS[n].desc) + '<br><span class="rd" style="opacity:.75">' + esc(TOOLS[n].args) + '</span></div></div>').join("")
      + '<div class="rfoot">Read tools are open. Every write — <b>apply</b> (commit the station\'s own source to the ONE authority), <b>hotswap</b> (re-run a module live), <b>eval</b> (run code inside the station) — needs the Omega gate armed. The one thing it cannot do is overwrite its own perchance listing: the platform exposes no write path to an embedded generator, so the sovereign saves that.</div></div>';
  }
  async function statusCard(){
    const g = omegaStatusText();
    const rows = await manifest(false);
    const has = !!token();
    const drift = rows.filter(r => r.drift === true).length;
    return '<div class="rise"><div class="rhead">⚒ /forge — the station\'s hands on itself</div>'
      + '<div class="rrow"><b>BODY</b><span class="vd">' + rows.length + ' files</span><div class="rd">' + kb(rows.reduce((n,r)=>n+(r.bytes||0),0)) + ' of its own source · ' + rows.filter(r=>r.live).length + ' readable live · ' + rows.filter(r=>r.git).length + ' matched in the authority</div></div>'
      + '<div class="rrow"><b>CANON DRIFT</b><span class="vd">' + (has ? (drift ? drift + " differ" : "in sync") : "NO TOKEN") + '</span><div class="rd">' + (has ? (drift ? drift + " file(s) differ from OPERATIONS/COMMANDSTATION/perchance/ — /forge apply reconciles" : "every readable file matches the authority copy") : "a GitHub token is needed to compare against the canonical copy (<b>/gh token &lt;PAT&gt;</b>)") + '</div></div>'
      + '<div class="rrow"><b>STAGE</b><span class="vd">' + stageRows().length + ' file(s)</span><div class="rd">' + (stageRows().length ? esc(stageRows().map(r=>r.path + " (" + r.mode + ")").join(", ")) + " · " + kb(stageTotal()) + " · <b>/forge diff</b> · <b>/forge apply</b>" : "nothing staged — <b>/forge do &lt;instruction&gt;</b> lets Obi edit itself") + '</div></div>'
      + '<div class="rrow"><b>GATE</b><span class="vd">' + (g.armed ? "ARMED " + g.armedMinutesLeft + "m" : "LOCKED") + '</span><div class="rd">every write (apply · hotswap · eval) runs through PHOENIXOMEGAPROTOCOL — no self-edit lands without Sov100' + (g.armed ? "" : " · <b>/phoenixomegaprotocol &lt;password&gt;</b> arms") + '</div></div>'
      + '<div class="rrow"><b>CAN</b><span class="vd"></span><div class="rd">read itself (live + canonical) · edit + commit its own source · hot-swap a running module · run code in itself · read other generators · fetch the net · generate images · export itself</div></div>'
      + '<div class="rrow"><b>CANNOT</b><span class="vd">honest limit</span><div class="rd">overwrite its own perchance listing — the platform gives an embedded generator no write path. A self-edit lives in the authority, the running page and any Cloudflare deploy; the listing is saved by the sovereign.</div></div>'
      + '<div class="rfoot"><b>/forge tools</b> is the whole menu · <b>/forge read &lt;path&gt;</b> · <b>/forge search &lt;regex&gt;</b> · <b>/forge diff</b> · <b>/forge apply</b> · <b>/forge hotswap &lt;module&gt;</b> · <b>/forge eval &lt;js&gt;</b> · <b>/forge export</b> · <b>/forge version</b> · <b>/forge history</b> · <b>/forge selftest</b></div></div>';
  }

  /* ---------- /forge — the sovereign's surface ---------- */
  async function cmd(arg){
    const a = String(arg || "").trim();
    const sp = a.indexOf(" ");
    const op = (sp === -1 ? a : a.slice(0, sp)).toLowerCase();
    const rest = sp === -1 ? "" : a.slice(sp+1).trim();

    if(op === "tools" || op === "help"){ addBubble("ass", toolsCard()); return; }
    if(op === "read"){
      if(!rest){ addBubble("ass", "Usage: <b>/forge read &lt;path&gt; [start] [end]</b> — e.g. <b>/forge read src/ilog.js 1 120</b>. Paths: " + fileList().map(p=>"<b>"+esc(p)+"</b>").join(", ")); return; }
      const parts = rest.split(/\s+/);
      try{
        const r = await read(parts[0], { start:Number(parts[1])||1, end:Number(parts[2])||undefined });
        addBubble("ass", '<div class="rise"><div class="rhead">📖 /forge read — ' + esc(r.path) + '</div>'
          + '<div class="rrow"><b>FILE</b><span class="vd">' + r.lines + ' lines</span><div class="rd">' + kb(r.bytes) + ' · showing ' + r.start + '–' + r.end + '</div></div>'
          + '<div class="rrow"><b>SOURCE</b><span class="vd"></span><div class="rd" style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:11px;text-align:left;max-height:420px;overflow:auto">' + esc(r.slice) + '</div></div></div>');
      }catch(e){ addBubble("ass", "⚠ " + esc(e.message)); }
      return;
    }
    if(op === "search" || op === "grep"){
      if(!rest){ addBubble("ass", "Usage: <b>/forge search &lt;regex&gt;</b>"); return; }
      const out = await runTool("search", { query:rest });
      addBubble("ass", '<div class="rise"><div class="rhead">🔎 /forge search — ' + esc(rest) + '</div><div class="rrow"><b>MATCHES</b><span class="vd"></span><div class="rd" style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:11px;text-align:left;max-height:400px;overflow:auto">' + esc(out) + '</div></div></div>');
      return;
    }
    if(op === "diff" || op === "stage"){
      const out = await runTool("stage", {});
      addBubble("ass", '<div class="rise"><div class="rhead">🧮 /forge diff — the stage</div><div class="rrow"><b>' + stageRows().length + ' file(s)</b><span class="vd"></span><div class="rd" style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:11px;text-align:left;max-height:440px;overflow:auto">' + esc(out) + '</div></div>'
        + '<div class="rfoot"><b>/forge apply</b> commits it to the ONE authority (gated) · <b>/forge discard</b> throws it away.</div></div>');
      return;
    }
    if(op === "discard" || op === "reset"){ const n = stageClear(); addBubble("ass", "🧹 stage cleared — " + n + " change(s) discarded. Nothing was written."); logOp({ kind:"op", action:"forge discard", detail:n + " files", result:"stage cleared" }); return; }
    if(op === "apply"){
      const out = await apply({ message: rest });
      addBubble("ass", (out.indexOf("APPLIED") === 0 ? "✅ " : out.indexOf("REFUSED") === 0 || out.indexOf("FAILED") === 0 ? "⚠ " : "ℹ ") + esc(out)
        + (out.indexOf("APPLIED") === 0 ? '<br><span class="rfoot">The station rewrote itself in the canonical source. To make it live here: <b>/forge hotswap &lt;module&gt;</b> (window.ObiX modules) or reload after saving the listing.</span>' : ""));
      return;
    }
    if(op === "hotswap" || op === "hot"){
      if(!rest){ addBubble("ass", "Usage: <b>/forge hotswap &lt;path&gt;</b> — hot-swappable: " + Object.keys(HOT_SWAP_OK).map(p=>"<b>"+esc(p)+"</b>").join(", ")); return; }
      const out = await hotSwap(rest);
      addBubble("ass", (out.indexOf("HOT-SWAPPED") === 0 ? "✅ " : "⚠ ") + esc(out));
      return;
    }
    if(op === "eval" || op === "run"){ const out = await evalSelf(rest); addBubble("ass", '<div class="rise"><div class="rhead">⚡ /forge eval</div><div class="rrow"><b>JS</b><span class="vd"></span><div class="rd" style="font-family:ui-monospace,monospace;font-size:11px">' + esc(rest) + '</div></div><div class="rrow"><b>RESULT</b><span class="vd"></span><div class="rd" style="font-family:ui-monospace,monospace;font-size:11px;white-space:pre-wrap;text-align:left">' + esc(out) + '</div></div></div>'); return; }
    if(op === "history" || op === "log"){
      const all = await window.ObiILog.all();
      const mine = all.filter(e => /^forge (apply|hotswap|eval|propose)$/.test(String(e.action||""))).reverse().slice(0, 20);
      addBubble("ass", '<div class="rise"><div class="rhead">📜 /forge history — the station\'s own self-edits</div>'
        + (mine.length ? mine.map(e => '<div class="rrow"' + (e.ok === false ? ' bad' : '') + '><b>' + esc(e.action) + '</b><span class="vd">#' + esc(e.seq) + '</span><div class="rd">' + esc(e.iso || new Date(e.t).toISOString()) + ' · ' + esc(String(e.detail||"").slice(0,140)) + '<br><span class="rd">' + esc(String(e.result||"").slice(0,120)) + '</span></div></div>').join("")
          : '<div class="rrow"><b>NONE YET</b><span class="vd"></span><div class="rd">the station has not yet landed a self-edit — <b>/forge do</b> stages one, <b>/forge apply</b> lands it (gated)</div></div>')
        + '<div class="rfoot">Read straight from the I-LOG: a self-edit that is not in the record did not happen.</div></div>');
      return;
    }
    if(op === "version" || op === "build"){
      const rows = await manifest(false);
      const st = await window.ObiILog.stats();
      const bytes = rows.reduce((n,r)=>n+(r.bytes||0),0), lines = rows.reduce((n,r)=>n+(r.lines||0),0);
      addBubble("ass", '<div class="rise"><div class="rhead">⚒ /forge version — what this station is</div>'
        + '<div class="rrow"><b>BODY</b><span class="vd">' + rows.length + ' files</span><div class="rd">' + kb(bytes) + ' · ' + lines.toLocaleString() + ' lines of its own source</div></div>'
        + '<div class="rrow"><b>I-LOG</b><span class="vd">' + st.count + ' entries</span><div class="rd">segment ' + st.seg + ' · head ' + esc(String(st.head||"none").slice(0,16)) + ' · ' + esc(st.alg||"") + '</div></div>'
        + '<div class="rrow"><b>RUN</b><span class="vd">#' + esc(runNoOf()||"?") + '</span><div class="rd">generator ' + esc(window.generatorName||"?") + ' · forge tracks ' + rows.length + ' files</div></div>'
        + '<div class="rrow"><b>GATE</b><span class="vd">' + (omegaStatusText().armed ? "ARMED" : "LOCKED") + '</span><div class="rd">stage ' + stageRows().length + ' file(s)</div></div>'
        + '<div class="rfoot">Reported by the station about itself — every number read live, not estimated.</div></div>');
      logOp({ kind:"op", action:"forge version", detail:"self-report", result:rows.length + " files · " + kb(bytes) + " · ilog " + st.count });
      return;
    }
    if(op === "export"){ addBubble("ass", "📄 " + esc(await exportSelf())); return; }
    if(op === "set" || op === "write" || op === "put"){
      const p = rest.split(/\s+/)[0];
      if(!p || !fileList().includes(p)){ addBubble("ass", "Usage: <b>/forge set &lt;path&gt;</b> then paste the file — or just ask in plain words with <b>/forge do &lt;instruction&gt;</b>. Known paths: " + fileList().map(f=>"<b>"+esc(f)+"</b>").join(", ")); return; }
      const idx = rest.indexOf("\n");
      if(idx === -1){ addBubble("ass", "That path is staged-write only via <b>/forge do</b> or a newline-separated body. Ask Obi: <b>/forge do rewrite …</b>"); return; }
      const body = rest.slice(idx + 1);
      stageSet(p, body, "write", "/forge set");
      const d = diff(await fetchText(p).catch(()=>""), body);
      addBubble("ass", "✎ staged <b>" + esc(p) + "</b> (+" + d.added + "/-" + d.removed + "). <b>/forge diff</b> to review · <b>/forge apply</b> to commit (gated).");
      logOp({ kind:"op", action:"forge set", detail:p, result:"staged " + kb(body.length) });
      return;
    }
    if(op === "do" || op === "ask" || op === "agent"){
      if(!rest){ addBubble("ass", "Usage: <b>/forge do &lt;instruction&gt;</b> — Obi reads its own source, stages the change, and reports. Writing to the authority is gated. Example: <b>/forge do add a /uptime command that reports how long this session has run</b>"); return; }
      const r = await ask(rest, { maxSteps: 8 });
      addBubble("ass", '<div class="rise"><div class="rhead">⚒ /forge do — result</div>'
        + '<div class="rrow"><b>STEPS</b><span class="vd">' + r.steps.length + '</span><div class="rd">' + esc(r.steps.map(s=>s.name + (s.ok?"✓":"✗")).join(" → ")) + '</div></div>'
        + '<div class="rrow"><b>SUMMARY</b><span class="vd"></span><div class="rd">' + esc(r.summary).slice(0,900) + '</div></div>'
        + (r.staged.length ? '<div class="rrow"><b>STAGED</b><span class="vd">' + r.staged.length + ' file(s)</span><div class="rd">' + esc(r.staged.map(s=>s.path).join(", ")) + ' — <b>/forge diff</b> · <b>/forge apply</b> (gated)</div></div>' : "")
        + '<div class="rfoot">Nothing was committed: the agent stages, the sovereign applies. <b>/forge discard</b> clears the stage.</div></div>');
      return;
    }
    if(op === "selftest"){
      addBubble("ass", "🧪 /forge selftest — exercising every primitive…");
      const rows = [];
      const t = async (name, fn) => { try{ const v = await fn(); rows.push({ name:name, ok:v.ok !== false, note:String(v.note == null ? v : v.note).slice(0,180) }); }catch(e){ rows.push({ name:name, ok:false, note:e.message }); } };
      await t("list_files", async () => ({ note: (fileList().length) + " files in the body" }));
      await t("read self", async () => { const r = await read("src/forge.js"); return { note: r.lines + " lines · " + kb(r.bytes) + " · readable live" }; });
      await t("hash", async () => ({ ok: (await hashText("obi")).length === 64, note: "sha-256 → " + shortHash(await hashText("obi")) }));
      await t("diff", async () => { const d = diff("a\nb\nc", "a\nB\nc"); return { ok: !d.identical && d.added === 1 && d.removed === 1, note: "+" + d.added + "/-" + d.removed + " on a 3-line file" }; });
      await t("stage + diff + discard", async () => { const before = stageRows().length; stageSet("src/__probe.js", "// probe\n", "write", "selftest"); const mid = stageRows().length; stageClear(); return { ok: mid === before + 1 && stageRows().length === before, note: "stage round-trips and clears" }; });
      /* AUDIT 2026-09-21: this step used to run a FULL manifest(true) — one live fetch + one
         authority read per file — so /forge selftest could take minutes. The primitive is now
         exercised with ONE bounded authority read (the same code path), and the full sweep stays
         available as the forge's `manifest` tool. */
      await t("canon compare", async () => { const g = await read("src/forge.js", { from:"git" }); return { ok:true, note: token() ? (g.lines + " lines read back from the authority (drift-check primitive OK)") : "no token — canon compare skipped (honest gap, not a failure)" }; });
      await t("gate", async () => { const g = omegaStatusText(); return { ok:true, note: g.armed ? ("ARMED (" + g.armedMinutesLeft + "m)") : "LOCKED — writes will refuse, as designed" }; });
      addBubble("ass", '<div class="rise"><div class="rhead">🧪 /forge selftest — ' + rows.filter(r=>r.ok).length + "/" + rows.length + ' pass</div>'
        + rows.map(r => '<div class="rrow"' + (r.ok ? "" : ' bad') + '><b>' + esc(r.name) + '</b><span class="vd">' + (r.ok ? "PASS" : "GAP") + '</span><div class="rd">' + esc(r.note) + '</div></div>').join("")
        + '<div class="rfoot">If this is green, the station can read itself, edit itself and stage the change. Whether the edit LANDS is decided by the gate and the sovereign.</div></div>');
      logOp({ kind:"op", action:"forge selftest", ok: rows.every(r=>r.ok), detail:rows.length + " primitives", result:rows.filter(r=>r.ok).length + "/" + rows.length + " pass" });
      return;
    }
    if(op){ addBubble("ass", "Unknown /forge sub-command. <b>/forge</b> (status) · tools · read · search · diff · apply · hotswap · eval · export · version · history · set · do · discard · selftest"); return; }
    addBubble("ass", await statusCard());
    logOp({ kind:"op", action:"forge", detail:"status card rendered", result:"shown in the chat" });
  }

  window.ObiForge = {
    FILES: fileList(), HOT_SWAP_OK: HOT_SWAP_OK, TOOLS: TOOLS, TOOL_NAMES: TOOL_NAMES,
    read: read, gitRead: gitRead, fetchText: fetchText, panelSource: panelSource, manifest: manifest, hashText: hashText, diff: diff,
    stageSet: stageSet, stageRows: stageRows, stageTotal: stageTotal, stageClear: stageClear, stage: () => stage,
    propose: propose, apply: apply, hotSwap: hotSwap, evalSelf: evalSelf, exportSelf: exportSelf,
    runTool: runTool, ask: ask, toolsCard: toolsCard, statusCard: statusCard, cmd: cmd,
    run: cmd
  };
})();
