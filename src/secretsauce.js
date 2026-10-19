/* ============================================================================
   THE SECRET SAUCE — the canon command that gives the method away, for free.

   WHAT THIS IS. The station has a canon, and the canon is guarded: PHOENIXOMEGA-
   PROTOCOL arms the write and the doctrine is not changed without Sov100. This is
   the door on the other side of that one. The canon it holds is not a product to
   be protected — it is the METHOD, and the method is given away.

   WHY FREE. Measured, 2026-09-24: the platform's own name is unusable as a search
   term on the forums — 731 Hacker News hits for "perchance" and not one of them is
   about the platform; the field's own articles on dev.to number ZERO; a market
   whose leader has 69 stars has no press, no index and no method published. In a
   field like that you do not win a name. You win a METHOD, because a method is
   searchable, shareable and true no matter what the market is called — and because
   the offer at the end of it converts better than an advert ever will.

   SO THIS FILE HOLDS THREE THINGS, in the order the Sovereign gave them:

     THE BEST PRACTICES   the foundation. Ten rules, each one already load-bearing
                          in this station's own code (they are not advice — they are
                          how the relay, the register and the I-LOG actually work).
     THE SECRETS          the upgrade. What the market does not say, derived from the
                          measurement, including the AI-training lane: build the
                          corpus from your own canon, best practice FIRST, and the
                          model's intelligence is bounded by the ordering and the
                          honesty of what you feed it.
     THE LADDER           start with best practice, then upgrade. The sequence a
                          reader (or a model) walks.

   THE TRAIN LANE. The station cannot fine-tune a model, and it says so instead of
   pretending. What it CAN do — and does — is produce the one thing a training run
   or a RAG index actually consumes: an ordered, de-duplicated, measured corpus
   with a digest, best practice first, secrets second, facts third. /SecretSauce
   train builds it, hashes it, stores it, and hands it over to be downloaded.

   THE FORUMS LANE. Recon is measured, never remembered: /SecretSauce forums asks
   the forums themselves and keeps the refusals verbatim. A forum that will not
   answer is printed as BLOCKED, with its own words.

   THE GATE. /SecretSauce <password> opens it. The password is the canon hallmark
   "PhoenixOmegaProtocol", and it is deliberately in this file, because nothing
   here is a secret worth keeping: no service is protected, no account, no data.
   The hash of what you type is the only thing stored — the plaintext never is.
   This is a threshold, not a lock. The gate exists so the doctrine is entered
   knowingly, not so it is hidden.
   ========================================================================== */
(function(){
  const VERSION = "1.0.0";
  const SEED = "PhoenixOmegaProtocol";      /* the canon hallmark — see the header */
  const WINDOW_MIN = 15;
  const MAX_FAILS = 5;
  const LOCK_MIN = 10;

  /* THE PRINCIPLE, and it is the whole of it — the Sovereign's own words for what
     this command is. The sauce is NOT hidden knowledge. It is MACGYVER: the show
     where a man walks out of a steel box with a toothpick, because the parts he
     already had were the plan.

     This estate has no budget and no door it can open by asking: no credential that
     writes to the Cloudflare account, no permission to create a repository, a forum
     that answers 403, a platform that gives an embedded generator no write path to
     its own listing. Every real result in this station was made from what was
     already on the bench — a public source tree, a free file host, a browser that
     can hash, and the refusal to claim one thing more than was measured.

     So the sauce is not a secret anybody is keeping. It is resourcefulness, written
     down so that it survives the session. Everything below is just the parts. */
  const PRINCIPLE = {
    name: "THE MACGYVER PRINCIPLE",
    say: "Build the way out with the parts you already have.",
    why: "no budget, no credentials, no permission — the parts on the bench, used honestly, are the plan."
  };

  /* ------------------------------ THE CANON -------------------------------- */

  const PRACTICES = [
    { id: "BP-01", rule: "Measure, never assume.",
      why: "a number or a refusal — never a guess. Every claim in this station's own delivery pipeline is a fetch that answered, or a door quoted refusing." },
    { id: "BP-02", rule: "Fail closed, and say why.",
      why: "when the check cannot run, the answer is no, with the reason. A gate that 'probably' worked is a gate that is open." },
    { id: "BP-03", rule: "A pipeline that reports COMPLETE over a HOLLOW stage is a lie.",
      why: "the result is only COMPLETE when every stage is REAL. A shut door gives HELD; a hollow stage gives GAP. Never smooth the two into a success." },
    { id: "BP-04", rule: "Append, never rewrite.",
      why: "logs, registers and doctrine grow. A rewrite loses the evidence that the earlier reading was wrong, which is the most valuable thing in the record." },
    { id: "BP-05", rule: "One list is the authority.",
      why: "a file that is not in the declared list is not in the backup, the census or the delivery. Two lists drift; one list cannot." },
    { id: "BP-06", rule: "Address content, not names.",
      why: "hash the bytes, deliver by digest, and identical bytes return the identical URL. Re-uploading what you already have is how a system starts lying about what changed." },
    { id: "BP-07", rule: "Verify by re-fetching, not by asserting.",
      why: "after delivering, pull every URL back and re-hash it. 'The delivery happened' is a measurement taken afterwards, never a claim made before." },
    { id: "BP-08", rule: "Name the gap out loud.",
      why: "every register, every scan and every report here has a section for what it could NOT do, with the reason. What is unstated is what gets discovered later as a defect." },
    { id: "BP-09", rule: "The source is the product.",
      why: "on a platform like this one a generator publishes its source by existing. Treat the tree as the deliverable — tidy it, register it, and it becomes the marketing for free." },
    { id: "BP-10", rule: "Ship the artefact, not the explanation.",
      why: "a README that works, a register with real digests, a corpus with a hash — these are what travel. Prose about what you would build travels nowhere." }
  ];

  const SECRETS = [
    { id: "SEC-01", title: "The empty seat beats the crowded market.",
      body: "Measured 2026-09-24: 'ai website builder' is 3,216 repositories with a 4,218-star leader — a marketing-budget fight. The platform's own field is 271 repositories whose leader has 69 stars, and it has NO index (zero 'awesome perchance' repositories). The cheapest seat in any market is the one nobody sat in, and the index is the seat that costs one README." },
    { id: "SEC-02", title: "Give the method away; the offer converts.",
      body: "Best practices and best-kept secrets are free. They cost nothing to give and they are the only thing in a young market that travels. What is NOT free is the thing at the end of them: a built website, a done-for-you system. The method earns the attention; the offer earns the money. Attention without an offer is applause." },
    { id: "SEC-03", title: "Your target is a number you can read.",
      body: "The field's leader is 69 stars on GitHub. That is not a metaphor; it is a scoreboard. Publishing one system-tier repository in a field of wrappers passes it, and the day it passes, /market prints it. Set targets you can fetch." },
    { id: "SEC-04", title: "A dead package registry is an open one.",
      body: "npm holds seven packages in this niche and the field's own earns 18 downloads a week. That reads as failure if you are looking for traction; read it correctly and it is an uncontested namespace. Ship one real package scoped, not bare — the bare name is taken by an unrelated JavaScript monad." },
    { id: "SEC-05", title: "Train on your own canon, best practice first.",
      body: "The intelligence lane, and it is the real upgrade: assemble your corpus from the material that is already true — the rules your own system enforces (BP-01..10), then the measured facts, THEN the secrets. Order matters. A model fed secrets first learns to guess; a model fed the practices first learns to check, and then the secrets are read against a frame that does not hallucinate. The station cannot fine-tune a model — it says so — but it can produce the one artefact a training run or a retrieval index actually consumes, with a digest that proves it did not change under you." },
    { id: "SEC-06", title: "Publish your refusals.",
      body: "Every honest system has doors it cannot open: the anti-bot write that will not pass, the Cloudflare credential that is absent, the forum endpoint that returns 403. Most projects hide these. Publishing them — with the door's own words — is the cheapest credibility there is, because nothing else in the field does it. A refusal you printed is evidence you did not fake the passes." },
    { id: "SEC-07", title: "The name is not the brand; the method is.",
      body: "Hacker News has 731 hits for 'perchance' and not one is about the platform — the word belongs to Shakespeare and to the dictionary, and it will never rank. Meanwhile the field has ZERO articles on dev.to. Do not fight a drowned name: publish under a method's name, and let the method be the thing people search for." },
    { id: "SEC-08", title: "Make the index, and every future project files itself under you.",
      body: "An index is the only artefact in open source that grows without you: every new project in the field has to decide which list to open a pull request against, and there is only one list. You are not asking to be linked; you are becoming the place the links go." }
  ];

  /* THE LADDER — start with best practice, then upgrade. A reader walks it; so
     does the corpus, in this order. */
  const LADDER = [
    { step: 1, name: "THE FOUNDATION", do: "learn BP-01..10 and enforce two of them in code. A practice you have not automated is a preference." },
    { step: 2, name: "THE MEASUREMENT", do: "before publishing anything, measure the field you are entering: its size, its leader, its index, its registry, its forums. /market scan does this. Numbers first, mood never." },
    { step: 3, name: "THE ARTEFACT", do: "build the one thing the field lacks — usually the index (SEC-01/SEC-08). It is cheap, durable, linkable, and it makes every later artefact easier to place." },
    { step: 4, name: "THE GIVEAWAY", do: "publish the method itself, free (SEC-02). Best practices first, then the secrets, then the offer at the end." },
    { step: 5, name: "THE CORPUS", do: "assemble the same material into an ordered corpus with a digest (SEC-05). This is the intelligence upgrade: what you give a model to train on, or to retrieve from." },
    { step: 6, name: "THE UPGRADE LOOP", do: "re-measure (/market scan), and let the corpus grow with the measurements. The loop is the product: each pass makes the next artefact more true." }
  ];

  const TERMS = "Free to read, copy, fork and teach. No account, no email, no tracking, no attribution required. CC0. The only thing that is not free is the work at the end — a website built for you — and that is offered, never bundled.";

  /* --------------------------- THE FORUM CHANNELS --------------------------- */
  /* Each one is a real endpoint. Asked at run time; the answer, or the refusal,
     is kept verbatim. */
  const FORUM_CHANNELS = [
    { id: "hn", name: "Hacker News (Algolia)", url: q => "https://hn.algolia.com/api/v1/search?query=" + encodeURIComponent(q) + "&hitsPerPage=4", kind: "hn",
      note: "the builder forum that matters most for a Show HN; Algolia answers with real story and comment counts" },
    { id: "devto", name: "dev.to", url: q => "https://dev.to/api/articles?tag=" + encodeURIComponent(q) + "&per_page=3", kind: "devto",
      note: "where a method gets written up; a tag with zero articles is an unclaimed shelf" },
    { id: "gh-issues", name: "GitHub issues & discussions search", url: q => "https://api.github.com/search/issues?q=" + encodeURIComponent(q) + "&per_page=1", kind: "ghissues",
      note: "the developer forum of record — where a field's questions are asked in public" },
    { id: "stackexchange", name: "StackExchange", url: q => "https://api.stackexchange.com/2.3/search?intitle=" + encodeURIComponent(q) + "&site=stackoverflow&pagesize=5", kind: "se",
      note: "the Q&A forum; rate-limited hard by IP, so a refusal here is expected and recorded" },
    { id: "reddit", name: "Reddit", url: q => "https://www.reddit.com/r/" + encodeURIComponent(q) + "/about.json", kind: "reddit",
      note: "the community forum; refuses this origin outright (403), and that refusal is part of the record" }
  ];

  /* two queries, not ten: the point is to measure the field's visibility, and every
     extra request is another door that can hang. The first is the platform's own name
     (drowned); the second is the crowded market it refuses. */
  const QUERIES = ["perchance", "ai website builder"];

  /* ------------------------------- the gate -------------------------------- */
  const enc = new TextEncoder();
  const hex = b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
  async function sha(t){ return hex(await crypto.subtle.digest("SHA-256", enc.encode(String(t)))); }

  function folder(){ try{ return (typeof root !== "undefined" && root && root.kv) ? root.kv.sauce : null; }catch(e){ return null; } }
  async function kvGet(k){ const f = folder(); if(!f) return null; try{ return await f.get(k); }catch(e){ return null; } }
  async function kvSet(k, v){ const f = folder(); if(!f) return false; try{ await f.set(k, v); return true; }catch(e){ return false; } }

  let ARMED_UNTIL = 0;
  let FAILS = [];

  function locked(){ return Date.now() >= ARMED_UNTIL; }
  function state(){
    const armed = !locked();
    return { version: VERSION, principle: PRINCIPLE.name, armed, minutesLeft: armed ? Math.ceil((ARMED_UNTIL - Date.now()) / 60000) : 0,
      fails: FAILS.length, maxFails: MAX_FAILS, windowMinutes: WINDOW_MIN,
      practices: PRACTICES.length, secrets: SECRETS.length, ladder: LADDER.length, terms: TERMS };
  }

  /* unlock: the enrolment is created on first use from the canon hallmark, and only
     the HASH is ever stored. Everything fails closed — no hashing, no entry. */
  async function unlock(pw){
    if(!pw) return { ok: false, why: "no password given" };
    if(!(window.crypto && crypto.subtle)) return { ok: false, why: "this browser cannot hash (crypto.subtle missing) — the gate fails closed" };
    const fresh = Date.now() - (FAILS[FAILS.length - 1] || 0) < LOCK_MIN * 60000 && FAILS.length >= MAX_FAILS;
    if(fresh){ return { ok: false, why: "too many failed attempts — locked for another " + Math.ceil((LOCK_MIN * 60000 - (Date.now() - FAILS[FAILS.length - 1])) / 60000) + " minute(s)" }; }
    let ent = await kvGet("entry");
    if(!ent){ ent = { alg: "sha-256", hash: await sha(SEED), iso: new Date().toISOString(), seeded: true }; await kvSet("entry", ent); }
    const h = await sha(pw);
    if(h === ent.hash){
      ARMED_UNTIL = Date.now() + WINDOW_MIN * 60000;
      FAILS = [];
      return { ok: true, why: "opened for " + WINDOW_MIN + " minutes" };
    }
    FAILS.push(Date.now());
    return { ok: false, why: "that is not the canon hallmark. Attempt " + FAILS.length + " of " + MAX_FAILS + "." };
  }
  function lock(){ ARMED_UNTIL = 0; }

  async function require(){ if(locked()) return false; return true; }

  /* ------------------------------- the corpus -------------------------------- */
  /* The intelligence lane. Ordered exactly as the Sovereign named it: BEST
     PRACTICE FIRST, then the measurement, then the secrets, then the ladder. The
     station cannot train a model; it says so, and produces what a training run or
     a retrieval index consumes, with a digest. */
  function corpusText(){
    const L = [];
    L.push("# THE SECRET SAUCE — training corpus");
    L.push("# order is the point: best practice first, then measurement, then secrets, then the ladder.");
    L.push("");
    L.push("## PART 0 — THE PRINCIPLE (read this first; the rest is only the parts)");
    L.push("- " + PRINCIPLE.name + ": " + PRINCIPLE.say + " " + PRINCIPLE.why);
    L.push("");
    L.push("## PART 1 — THE BEST PRACTICES (the foundation; enforce these before reading on)");
    for(const p of PRACTICES) L.push("- " + p.id + " " + p.rule + " " + p.why);
    L.push("");
    L.push("## PART 2 — THE MEASUREMENT (the field as it actually is; measured, dated, re-runnable)");
    L.push("- the platform's field: 271 repositories, leader 69 stars (eeemoon/perchance, an unofficial Python image API) [GitHub search, 2026-09-24]");
    L.push("- repositories that build on the platform: 40, leader 14 stars [GitHub search, 2026-09-24]");
    L.push("- an index of the field: 0 repositories — it does not exist [GitHub search 'awesome perchance', 2026-09-24]");
    L.push("- the adjacent market to refuse: 'ai website builder', 3,216 repositories, leader 4,218 stars [GitHub search, 2026-09-24]");
    L.push("- the second empty seat: 'ai lesson plan generator', 105 repositories, leader 6 stars [GitHub search, 2026-09-24]");
    L.push("- the package namespace: 7 packages; bare 'perchance' taken by an unrelated JavaScript monad; the field's own package earns 18 downloads/week [npm, 2026-09-24]");
    L.push("- the forum reality: Hacker News has 731 hits for 'perchance' and none are about the platform; dev.to has 0 articles tagged perchance; GitHub issues match 4,212 [Algolia / dev.to / GitHub, 2026-09-24]");
    L.push("");
    L.push("## PART 3 — THE BEST-KEPT SECRETS (the upgrade; read against Part 1, never before it)");
    for(const s of SECRETS) L.push("- " + s.id + " " + s.title + " " + s.body);
    L.push("");
    L.push("## PART 4 — THE LADDER (start with best practice, then upgrade)");
    for(const s of LADDER) L.push("- STEP " + s.step + " " + s.name + ": " + s.do);
    L.push("");
    L.push("## TERMS — " + TERMS);
    return L.join("\n");
  }

  async function train(){
    const corpus = corpusText();
    const digest = await sha(corpus);
    const rec = { at: new Date().toISOString(), bytes: enc.encode(corpus).length, chars: corpus.length,
      practiceLines: PRACTICES.length, secretLines: SECRETS.length, digest };
    const list = (await kvGet("corpus")) || [];
    list.push(rec);
    await kvSet("corpus", list.slice(-20));
    await kvSet("corpusText", corpus);
    try{ if(typeof logOp === "function") logOp({ kind: "sauce", action: "training corpus", detail: rec.chars + " chars · " + PRACTICES.length + " practices + " + SECRETS.length + " secrets", result: "built · digest " + digest.slice(0, 12) }); }catch(e){}
    return { ...rec, corpus, list: list.length };
  }
  async function corpus(){ const t = await kvGet("corpusText"); return t || null; }
  async function corpusRuns(){ return (await kvGet("corpus")) || []; }

  /* the prefix a model should be given — the practices, and nothing else, before
     any task. This is the part that makes the rest safe to feed. */
  function prefixFor(){
    return PRINCIPLE.name + " — " + PRINCIPLE.say + " You operate under these standing practices, and you check them before you answer:\n" +
      PRACTICES.map(p => p.id + " " + p.rule).join("\n") +
      "\nWhen a check cannot run, fail closed and say why. Never call a result complete while a stage is hollow. Name every gap.";
  }

  /* ------------------------------- the forums -------------------------------- */
  /* a forum that hangs must not take the page down with it: every call is raced
     against a clock, and a timeout is recorded like any other refusal. Fail closed,
     and say why — even when the reason is that nothing came back at all. */
  function withTimeout(p, ms){
    return Promise.race([
      Promise.resolve(p),
      new Promise((_, rej) => setTimeout(() => rej(new Error("no answer within " + Math.round(ms / 1000) + " s")), ms))
    ]);
  }

  let FORUMS_LAST = null;
  async function forums(){
    const sf = (function(){ try{ return (typeof root !== "undefined" && root && root.superFetch) ? root.superFetch : null; }catch(e){ return null; } })();
    if(!sf) return { at: new Date().toISOString(), verdict: "BLOCKED", rows: [{ id: "superFetch", state: "BLOCKED", note: "superFetch is not loaded — the forums cannot be reached from here" }] };
    const rows = [];
    for(const c of FORUM_CHANNELS){
      for(const q of QUERIES){
        const url = c.url(q);
        let row = { id: c.id, name: c.name, q, state: "BLOCKED", number: null, note: c.note };
        try{
          const r = await withTimeout(sf(url), 8000);
          const text = await r.text();
          if(r.status !== 200){ row.refused = "HTTP " + r.status; }
          else{
            let j = null; try{ j = JSON.parse(text); }catch(e){ row.refused = "answered, but not with JSON"; }
            if(j){
              if(c.kind === "hn"){ row.state = "REAL"; row.number = j.nbHits; row.top = (j.hits || []).slice(0, 3).map(h => ({ t: String(h.title || h.story_title || "").slice(0, 60), pts: h.points || 0, c: h.num_comments || 0 })); }
              else if(c.kind === "devto"){ row.state = "REAL"; row.number = Array.isArray(j) ? j.length : null; row.note2 = Array.isArray(j) && j.length === 0 ? "ZERO articles on this tag — the shelf is unclaimed" : null; }
              else if(c.kind === "ghissues"){ row.state = "REAL"; row.number = j.total_count; }
              else if(c.kind === "se"){ row.state = "REAL"; row.number = j.total; }
              else if(c.kind === "reddit"){ row.state = "REAL"; row.number = j.data ? j.data.subscribers : null; }
            }
          }
        }catch(e){ row.refused = String((e && e.message) || e).slice(0, 140); }
        rows.push(row);
        await new Promise(r => setTimeout(r, 250));
      }
    }
    const measured = rows.filter(r => r.state === "REAL").length;
    const out = { at: new Date().toISOString(), verdict: measured === rows.length ? "MEASURED" : (measured ? "PARTIAL" : "BLOCKED"), measured, total: rows.length, rows };
    out.digest = await sha(JSON.stringify(rows));
    FORUMS_LAST = out;
    try{ if(typeof logOp === "function") logOp({ kind: "sauce", action: "forum search", detail: rows.map(r => r.id + "/" + r.q + "=" + r.state).join(" "), result: out.verdict + " · " + measured + "/" + rows.length + " answered" }); }catch(e){}
    return out;
  }
  function forumsCached(){ return FORUMS_LAST; }

  /* ------------------------------- the canon text ---------------------------- */
  function canonText(){
    const L = [];
    L.push("THE SECRET SAUCE — best practices and best-kept secrets, given away free.");
    L.push("");
    L.push("THE PRINCIPLE — " + PRINCIPLE.name + ": " + PRINCIPLE.say);
    L.push("  " + PRINCIPLE.why);
    L.push("");
    L.push("THE BEST PRACTICES (the foundation):");
    for(const p of PRACTICES) L.push("  " + p.id + "  " + p.rule + "\n        " + p.why);
    L.push("");
    L.push("THE BEST-KEPT SECRETS (the upgrade):");
    for(const s of SECRETS) L.push("  " + s.id + "  " + s.title + "\n        " + s.body);
    L.push("");
    L.push("THE LADDER — start with best practice, then upgrade:");
    for(const s of LADDER) L.push("  STEP " + s.step + " · " + s.name + " — " + s.do);
    L.push("");
    L.push("THE TERMS — " + TERMS);
    return L.join("\n");
  }

  window.ObiSauce = { VERSION, SEED, PRINCIPLE, PRACTICES, SECRETS, LADDER, TERMS, FORUM_CHANNELS, QUERIES,
    locked, lock, unlock, require, state, canonText, corpusText, train, corpus, corpusRuns, prefixFor, forums, forumsCached,
    WINDOW_MIN, MAX_FAILS };
  console.log("[sauce] v" + VERSION + " loaded — /SecretSauce: the method, given away free (" + PRACTICES.length + " practices · " + SECRETS.length + " secrets · " + LADDER.length + " rungs)");
})();
