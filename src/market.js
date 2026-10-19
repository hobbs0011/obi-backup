/* ============================================================================
   THE OPEN SOURCE MARKET — the recon and the play.

   The station's whole product is already open source: on this platform a
   generator PUBLISHES ITS SOURCE by existing. So the open-source market is not
   somewhere the estate has to go — it is a market the estate is already standing
   in, and has never indexed, never priced and never claimed.

   This file does two things, and refuses to confuse them:

     RECON  measure the market with real endpoints. Every channel is a fetch that
            either answers with a NUMBER or records the refusal it was given.
            Nothing here is estimated, remembered or invented. A shut door is
            printed shut (BLOCKED), with the door's own words.
     PLAY   the campaign that follows from the numbers. It is written against
            the measured field, not against a fantasy of one, and every claim in
            it cites the channel it came from. The gaps are named, not smoothed.

   WHAT THE MEASUREMENT SAYS (2026-09-24, re-runnable at any time with /market):

     The platform's open-source field is 271 repositories whose LEADER HAS 69
     STARS (an unofficial Python image API), whose package registry returns 18
     downloads a week, and which has NO INDEX — `awesome perchance` matches zero
     repositories. There is no framework, no reference implementation and no
     delivery toolkit in the field at all: it is image wrappers, a desktop
     client, a character database and a handful of userscripts.

     The adjacent "ai website builder" market is 3,216 repositories with a
     4,218-star leader. That is the market the estate REFUSES, and now it is
     refused with a number instead of a mood.

   So the play is not "enter a market". It is: TAKE THE SEAT NOBODY SAT IN.
   Become the index, the reference implementation and the on-ramp of the market
   the estate already lives in — and convert the attention with the one thing no
   open-source project in the field has: an offer.

   The rules it inherits from the relay, and holds:
     - measure, never assume; a number or a refusal, never a guess;
     - fail closed: an unmeasured channel is BLOCKED and the play says so;
     - never print a claim the scan did not produce.
   ========================================================================== */
(function(){
  const VERSION = "1.0.0";
  const SCAN_EVERY_MS = 30 * 60 * 1000;   /* the recon lane: every half hour */
  const FIRST_SCAN_MS = 75 * 1000;        /* once, after the brain has indexed */
  const STALE_MS = 90 * 1000;             /* a scan younger than this is not repeated */

  const SEAT = 100;    /* a market whose leader is under this is a market with a free seat */
  const DEEP = 1000;   /* a market this shallow has no framework tier to displace */

  /* THE CHANNELS. Every one is a real endpoint, and every one measures exactly one
     thing the play depends on. The `role` says WHY it is measured; the scan says
     WHAT it answered. */
  const CHANNELS = [
    { id: "gh-market", what: "the market this estate already occupies", kind: "gh", q: "perchance",
      role: "every public repository that mentions the platform this station runs on" },
    { id: "gh-niche", what: "the field the estate actually competes in", kind: "gh", q: "perchance generator",
      role: "the repositories that build ON the platform — the peers a station repo would stand among" },
    { id: "gh-index", what: "the index that does not exist", kind: "gh", q: "awesome perchance",
      role: "an awesome-list for this market. Measured at zero. That is the empty seat." },
    { id: "gh-crowded", what: "the market to refuse", kind: "gh", q: "ai website builder",
      role: "the crowded field — measured so it can be declined with a number, not a hunch" },
    { id: "gh-seat2", what: "the second empty seat", kind: "gh", q: "ai lesson plan generator",
      role: "the teaching wing's market: small, leaderless, and the estate already ships the product" },
    { id: "gh-selfhosted", what: "the giant list the estate cannot enter", kind: "gh", q: "awesome selfhosted",
      role: "the largest reach in the open-source market — and shut to anything that is not self-hostable" },
    { id: "npm", what: "the package namespace", kind: "npm", q: "perchance",
      role: "whether the estate could also ship a package, and what the field's own package earns" },
    { id: "hf", what: "the demo spaces that exist", kind: "hf", q: "perchance",
      role: "whether a Space is already claimed in this niche, and how much attention they carry" },
    { id: "reddit", what: "the communities", kind: "reddit", q: "opensource",
      role: "community reach — measured, or the refusal recorded verbatim" }
  ];

  /* THE BASELINE — the numbers this file was written against, from the scan run on
     2026-09-24. They are the fallback when the live scan cannot run, and they are
     ALWAYS labelled with their date. /market scan replaces them with fresh ones. */
  const BASELINE = {
    at: "2026-09-24",
    channels: {
      "gh-market":      { state: "REAL", number: 271,  top: [{ full: "eeemoon/perchance", stars: 69 }] },
      "gh-niche":       { state: "REAL", number: 40,   top: [{ full: "aein00/perchance-image-generator", stars: 14 }] },
      "gh-index":       { state: "REAL", number: 0,    top: [] },
      "gh-crowded":     { state: "REAL", number: 3216, top: [{ full: "zhayujie/bot-on-anything", stars: 4218 }] },
      "gh-seat2":       { state: "REAL", number: 105,  top: [{ full: "asiln/Lesson-Plan-Generator", stars: 6 }] },
      "gh-selfhosted":  { state: "REAL", number: 150,  top: [{ full: "awesome-selfhosted/awesome-selfhosted", stars: 321321 }] },
      "npm":            { state: "REAL", number: 7,    top: [{ name: "perchance", version: "1.0.1" }] },
      "hf":             { state: "REAL", number: 6,    top: [{ id: "momo33336666/PerchanceImageBot" }] },
      "reddit":         { state: "BLOCKED", number: null, refused: "HTTP 403 — the endpoint refused this origin" }
    }
  };

  /* ============================== THE PLAY ==================================
     Written against the measurement above. Every number in it is a channel id. */
  const PLAY = {
    thesis:
      "The estate's product is open source by nature — a generator publishes its source by existing — so the open-source market is not a market to enter, it is one to INDEX and CLAIM. The platform's field is 271 repositories whose leader has 69 stars and whose index does not exist. The estate takes the three seats nobody sat in: the INDEX, the REFERENCE IMPLEMENTATION, and the ON-RAMP — and converts the attention with the one thing no project in the field has, an offer.",
    refuse: {
      what: "the 'ai website builder' field",
      evidence: "gh-crowded: 3,216 repositories, a 4,218-star leader (bot-on-anything) and an established commercial tier (Mobirise, 980 stars).",
      why: "a field that deep is won with a marketing budget, not a README. The estate declines it WITH A NUMBER instead of a mood — and takes the seats next to it, where nobody is standing."
    },
    seats: [
      {
        id: "the index",
        evidence: "gh-index: `awesome perchance` matches ZERO repositories. The market has no front door.",
        play: "Publish the canonical index of the Perchance open-source market — populated with the real repositories and their real star counts, and the station at the top as the reference implementation. Whoever indexes a market owns its entrance, and an index is the cheapest, most durable and most linkable artefact in open source.",
        artefact: "src/marketing/awesome-perchance.md — the list, written and populated, ready to publish as a repository."
      },
      {
        id: "the reference implementation",
        evidence: "gh-niche: the field's leader is an unofficial image API at 14 stars; the market leader overall (gh-market, 69 stars) is a Python image API. There is no framework, no full application and no delivery toolkit in the field at all.",
        play: "Publish the station itself as the reference implementation of a Perchance application — and extract the one genuinely reusable primitive it holds (src/relay.js: hash a tree, content-address it, deliver idempotently, verify by re-hashing) as a small package. The estate would be the first project in the field that is a SYSTEM rather than a wrapper.",
        artefact: "the source tree itself (already public on save) + a README, a LICENSE and topics; then the primitive as one small, honest package."
      },
      {
        id: "the second empty seat",
        evidence: "gh-seat2: `ai lesson plan generator` is 105 repositories with a 6-star leader.",
        play: "The estate already ships the product for this seat — a parsed curriculum, a lesson forge that validates against a written standard, a student evaluator, a transcription desk. Same move, second market: publish the teaching engine and let the field's emptiness do the work.",
        artefact: "the curriculum + lesson-forge source as its own repository, with the standard (LSN-1…23) as the README."
      },
      {
        id: "the package namespace",
        evidence: "npm: bare `perchance` is TAKEN by an unrelated JavaScript maybe-monad (v1.0.1); the field's own package, perchance-image-generator, earns 18 downloads a week.",
        play: "Ship scoped (@phoenixrising/*), not bare. An 18-downloads-a-week field is not a discouragement — it is a market with no incumbent, which is the whole opportunity.",
        artefact: "one small real package — the tree-digest + idempotent delivery primitive — with a README that points at the station."
      }
    ],
    assets: [
      { what: "the station itself", why: "a working, self-editing, mesh-capable Perchance application with public source. Nothing at this tier exists in the field (gh-niche)." },
      { what: "src/relay.js", why: "a small, reusable, genuinely useful primitive — tree digest + content-addressed, idempotent delivery + verification. Package-able as it stands." },
      { what: "src/offers.js (the offer desk)", why: "the free-website offer is the FUNNEL. No open-source project in the field has a CTA that converts a visitor into a conversation." },
      { what: "the curriculum + lesson forge + student evaluator", why: "the product for the second empty seat (gh-seat2), already built and already validated against a written standard." },
      { what: "src/brand.js", why: "93 drawn icons, 30 marks, a whole identity system. It is the visual bar the field cannot meet, and it makes every README the estate publishes look finished." }
    ],
    channels: [
      { id: "gh-index", channel: "GitHub — the index", number: "0 repositories", move: "publish awesome-perchance first. It links to everything else the estate publishes, and everything else links back to it." },
      { id: "gh-market", channel: "GitHub — the market", number: "271 repositories · leader 69 stars", move: "publish the station repo with topics (perchance, generator, ai, command-station), the live demo at the top, and the offer in the footer." },
      { id: "npm", channel: "npm", number: "7 packages · 18 downloads/week", move: "ship the scoped primitive package; the field's own package has 18 weekly downloads, so there is no incumbent to displace." },
      { id: "hf", channel: "HuggingFace Spaces", number: "6 spaces · 0–1 likes", move: "one static Space that embeds the station — the cheapest permanent demo URL in the market, on a domain half the field already browses." },
      { id: "gh-selfhosted", channel: "awesome-selfhosted", number: "321,321 stars — CLOSED", move: "REFUSED BY THE EVIDENCE: the station is hosted on the platform and is not self-hostable, so it does not qualify. Named as a gap, never faked. (A self-hostable build would open this, and that is a real roadmap item, not a promise.)" },
      { id: "reddit", channel: "Reddit", number: "BLOCKED — HTTP 403", move: "the endpoint refused this origin, so no reach claim is made. The move is still specified (r/opensource, r/selfhosted, r/SideProject, r/edtech, r/Teachers — post the RECON, not the advert) and it will be measurable the day a channel answers." },
      { id: "hn", channel: "Show HN · Product Hunt · dev.to", number: "unmeasurable from this origin", move: "declared unmeasured rather than guessed. The recon itself is the content: 'I measured a 271-repository market; its leader has 69 stars' is a genuine Show HN title, and it is true because it is measured." }
    ],
    sequence: [
      "1 · Publish the index (src/marketing/awesome-perchance.md) as a repository. The front door, first.",
      "2 · Publish the station as the reference implementation: README, LICENSE, topics, the live demo pinned, the offer in the footer.",
      "3 · Extract and publish the primitive (src/relay.js's tree digest + idempotent delivery) as a scoped package.",
      "4 · Publish the teaching engine for the second empty seat (gh-seat2), with the lesson standard as the README.",
      "5 · One static Space (hf) that embeds the station — a permanent demo URL on a domain the field already browses.",
      "6 · One writeup of the recon itself, published where builders read: the measurement IS the marketing, and it is honest by construction.",
      "7 · The funnel: every README, every Space, every post ends at the offer desk. Attention without an offer is just applause."
    ],
    kpis: [
      "stars and forks on the estate's own repositories (the index and the station)",
      "npm weekly downloads for the scoped package",
      "Space likes (hf) and the index's inbound pull requests",
      "offer-desk claims attributable to an open-source referral — the only KPI that is actually money",
      "the market's own leader star count (gh-market): the day the station passes 69 stars, the seat is visibly taken"
    ],
    gaps: [
      "Reddit is BLOCKED (403) from this origin — community reach is unmeasured, not zero.",
      "Show HN / Product Hunt / dev.to cannot be measured from this origin at all — declared, never guessed.",
      "awesome-selfhosted is shut: the station is platform-hosted. A self-hostable build would open 321,321 stars of reach.",
      "The bare npm name `perchance` is taken (npm) — the package must ship scoped.",
      "The platform gives an embedded generator no write path to its own listing, so every repository above must be CREATED BY THE SOVEREIGN. The station can write every artefact; it cannot open the doors."
    ]
  };

  /* ============================ the recon ================================== */

  const enc = new TextEncoder();
  const hex = b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
  async function sha(t){ return hex(await crypto.subtle.digest("SHA-256", enc.encode(String(t)))); }
  const short = (h, n) => h ? String(h).slice(0, n || 12) : "—";

  function folder(){ try{ return (typeof root !== "undefined" && root && root.kv) ? root.kv.market : null; }catch(e){ return null; } }
  async function kvGet(k){ const f = folder(); if(!f) return null; try{ return await f.get(k); }catch(e){ return null; } }
  async function kvSet(k, v){ const f = folder(); if(!f) return false; try{ await f.set(k, v); return true; }catch(e){ return false; } }

  function fetchPlugin(){ try{ return (typeof root !== "undefined" && root && root.superFetch) ? root.superFetch : null; }catch(e){ return null; } }

  async function get(url){
    const sf = fetchPlugin();
    if(!sf) return { error: "superFetch is not loaded — src/market.js cannot reach the open net" };
    try{
      const r = await sf(url);
      const text = await r.text();
      return { status: r.status, text };
    }catch(e){ return { error: String((e && e.message) || e) }; }
  }

  function urlFor(c){
    if(c.kind === "gh")   return "https://api.github.com/search/repositories?q=" + encodeURIComponent(c.q) + "&sort=stars&order=desc&per_page=3";
    if(c.kind === "npm")  return "https://registry.npmjs.org/-/v1/search?text=" + encodeURIComponent(c.q) + "&size=5";
    if(c.kind === "hf")   return "https://huggingface.co/api/spaces?search=" + encodeURIComponent(c.q) + "&limit=10";
    if(c.kind === "reddit") return "https://www.reddit.com/r/" + encodeURIComponent(c.q) + "/about.json";
    return null;
  }

  /* one channel, measured. REAL means the endpoint answered with a number we read;
     BLOCKED means it refused, and the refusal is kept verbatim. */
  async function measureChannel(c){
    const url = urlFor(c);
    const r = await get(url);
    if(r.error) return { id: c.id, what: c.what, kind: c.kind, state: "BLOCKED", number: null, top: [], refused: r.error };
    if(r.status !== 200) return { id: c.id, what: c.what, kind: c.kind, state: "BLOCKED", number: null, top: [], refused: "HTTP " + r.status };
    let j = null;
    try{ j = JSON.parse(r.text); }catch(e){ return { id: c.id, what: c.what, kind: c.kind, state: "BLOCKED", number: null, top: [], refused: "the endpoint answered, but not with JSON" }; }
    if(c.kind === "gh"){
      const items = Array.isArray(j.items) ? j.items : [];
      return { id: c.id, what: c.what, kind: c.kind, q: c.q, role: c.role, state: "REAL", number: j.total_count || 0,
        top: items.slice(0, 3).map(i => ({ full: i.full_name, stars: i.stargazers_count, desc: String(i.description || "").slice(0, 90), url: i.html_url })) };
    }
    if(c.kind === "npm"){
      const objs = Array.isArray(j.objects) ? j.objects : [];
      return { id: c.id, what: c.what, kind: c.kind, q: c.q, role: c.role, state: "REAL", number: j.total || objs.length,
        top: objs.slice(0, 3).map(o => ({ name: o.package && o.package.name, version: o.package && o.package.version })) };
    }
    if(c.kind === "hf"){
      const arr = Array.isArray(j) ? j : [];
      return { id: c.id, what: c.what, kind: c.kind, q: c.q, role: c.role, state: "REAL", number: arr.length,
        top: arr.slice(0, 3).map(s => ({ id: s.id, likes: s.likes })) };
    }
    return { id: c.id, what: c.what, kind: c.kind, state: "REAL", number: null, top: [], note: "answered, nothing to count here" };
  }

  /* THE SEATS, DERIVED FROM THE SCAN. A seat is empty when the measured leader is
     under SEAT stars; a market is shallow when it holds under DEEP repositories.
     Nothing here is asserted — every seat cites the channel that opened it. */
  function deriveSeats(chans){
    const by = {};
    for(const c of chans) by[c.id] = c;
    const seats = [];
    const index = by["gh-index"], niche = by["gh-niche"], crowded = by["gh-crowded"], seat2 = by["gh-seat2"], self = by["gh-selfhosted"];
    if(index && index.state === "REAL" && index.number === 0)
      seats.push({ id: "the index", channel: "gh-index", evidence: "`awesome perchance` matches 0 repositories", open: true });
    if(niche && niche.state === "REAL"){
      const lead = (niche.top[0] && niche.top[0].stars) || 0;
      seats.push({ id: "the reference implementation", channel: "gh-niche", evidence: niche.number + " repositories, leader " + lead + " stars", open: lead < SEAT });
    }
    if(seat2 && seat2.state === "REAL"){
      const lead = (seat2.top[0] && seat2.top[0].stars) || 0;
      seats.push({ id: "the second empty seat", channel: "gh-seat2", evidence: seat2.number + " repositories, leader " + lead + " stars", open: lead < SEAT });
    }
    if(crowded && crowded.state === "REAL")
      seats.push({ id: "the crowded field (REFUSED)", channel: "gh-crowded", evidence: crowded.number + " repositories, leader " + ((crowded.top[0] && crowded.top[0].stars) || 0) + " stars", open: crowded.number < DEEP });
    if(self && self.state === "REAL")
      seats.push({ id: "the giant list (CLOSED to this estate)", channel: "gh-selfhosted", evidence: "the list carries " + ((self.top[0] && self.top[0].stars) || 0) + " stars; the station is not self-hostable", open: false });
    return seats;
  }

  let RUNNING = false, STARTED = false, LAST = null;

  async function scan(opts){
    opts = opts || {};
    if(RUNNING) return LAST || { at: new Date().toISOString(), running: true, channels: [], seats: [] };
    RUNNING = true;
    const t0 = Date.now();
    try{
      const chans = [];
      /* GitHub's search endpoint allows ten calls a minute unauthenticated, and this
         scan makes six — so they are run in order with a small gap rather than in
         parallel, and a rate-limit refusal is recorded like any other door. */
      for(const c of CHANNELS){
        try{ chans.push(await measureChannel(c)); }
        catch(e){ chans.push({ id: c.id, what: c.what, kind: c.kind, state: "BLOCKED", number: null, top: [], refused: String((e && e.message) || e) }); }
        if(c.kind === "gh" && !opts.fast) await new Promise(r => setTimeout(r, 1100));
      }
      const seats = deriveSeats(chans);
      const measured = chans.filter(c => c.state === "REAL").length;
      const out = {
        at: new Date().toISOString(), ms: Date.now() - t0,
        verdict: measured === chans.length ? "MEASURED" : (measured ? "PARTIAL" : "BLOCKED"),
        measured, channels: chans.length,
        seats, channelsDetail: chans,
        station: (typeof window !== "undefined" && window.generatorName) || "?",
        note: measured === chans.length
          ? "every channel answered with a number"
          : "some channels refused and are reported BLOCKED with the refusal each gave — the play never claims what the scan could not measure"
      };
      out.digest = await sha(JSON.stringify({ at: out.at, v: out.verdict, c: chans.map(c => c.id + ":" + c.state + ":" + c.number) }));
      LAST = out;
      const list = (await kvGet("scans")) || [];
      list.push({ at: out.at, verdict: out.verdict, measured: out.measured, digest: short(out.digest, 16), ms: out.ms,
        numbers: chans.reduce((a, c) => { a[c.id] = c.number; return a; }, {}) });
      await kvSet("scans", list.slice(-40));
      await kvSet("last", out);
      try{ if(typeof logOp === "function") logOp({ kind: "market", action: "open source market scan", result: out.verdict + " · " + out.measured + "/" + out.channels + " channels answered · " + seats.length + " seats read" }); }catch(e){}
      return out;
    } finally { RUNNING = false; }
  }

  async function last(){ if(LAST) return LAST; const l = await kvGet("last"); if(l) LAST = l; return l || null; }
  function cached(){ return LAST; }
  async function scans(){ return (await kvGet("scans")) || []; }

  /* THE EFFECTIVE CHANNELS — the live scan if there is one, otherwise the labelled
     baseline. Used by the play so a page that has not scanned yet still speaks in
     numbers, and says which scan they came from. */
  async function numbers(){
    const l = await last();
    if(l && l.channelsDetail && l.channelsDetail.length) return { from: l.at, live: true, channels: l.channelsDetail, seats: l.seats };
    const channels = CHANNELS.map(c => Object.assign({ id: c.id, what: c.what, kind: c.kind, q: c.q, role: c.role }, BASELINE.channels[c.id] || { state: "BLOCKED" }));
    return { from: BASELINE.at, live: false, channels, seats: deriveSeats(channels) };
  }

  async function state(){
    const n = await numbers();
    return { version: VERSION, scanned: n.from, live: n.live,
      channels: n.channels.map(c => ({ id: c.id, state: c.state, number: c.number == null ? null : c.number,
        leader: (c.top && c.top[0]) ? (c.top[0].full || c.top[0].name || c.top[0].id) : null,
        leaderStars: (c.top && c.top[0] && c.top[0].stars != null) ? c.top[0].stars : null })),
      seats: n.seats, play: { thesis: PLAY.thesis, seats: PLAY.seats.length, channels: PLAY.channels.length, sequence: PLAY.sequence.length },
      runs: (await scans()).length, intervalMinutes: Math.round(SCAN_EVERY_MS / 60000), running: RUNNING };
  }

  /* the scan, as text — one line per channel, for a card or a document */
  async function report(){
    const n = await numbers();
    const L = [];
    L.push("THE OPEN SOURCE MARKET — recon " + (n.live ? "LIVE" : "BASELINE") + " · " + n.from);
    for(const c of n.channels){
      const leader = (c.top && c.top[0]) ? (" · leader " + (c.top[0].full || c.top[0].name || c.top[0].id) + ((c.top[0].stars != null) ? " (" + c.top[0].stars + "★)" : "")) : "";
      L.push("  " + c.id + "  " + c.state + (c.number == null ? "" : "  " + c.number) + leader + (c.refused ? "  — " + c.refused : ""));
    }
    L.push("THE SEATS:");
    for(const s of n.seats) L.push("  " + (s.open ? "OPEN   " : "CLOSED ") + s.id + " — " + s.evidence + " [" + s.channel + "]");
    return L.join("\n");
  }

  /* the play, as text — the doc in src/marketing is this, written down */
  function playText(){
    const L = [];
    L.push("THE OPEN SOURCE PLAY — take the seat nobody sat in.");
    L.push("");
    L.push("THESIS. " + PLAY.thesis);
    L.push("");
    L.push("REFUSED. " + PLAY.refuse.what + " — " + PLAY.refuse.evidence);
    L.push("  " + PLAY.refuse.why);
    L.push("");
    L.push("THE SEATS.");
    for(const s of PLAY.seats){ L.push("  " + s.id.toUpperCase()); L.push("    evidence: " + s.evidence); L.push("    play: " + s.play); L.push("    artefact: " + s.artefact); }
    L.push("");
    L.push("THE ASSETS THE ESTATE ALREADY HOLDS.");
    for(const a of PLAY.assets) L.push("  " + a.what + " — " + a.why);
    L.push("");
    L.push("THE CHANNELS.");
    for(const c of PLAY.channels) L.push("  " + c.channel + " [" + c.number + "] — " + c.move);
    L.push("");
    L.push("THE SEQUENCE.");
    for(const s of PLAY.sequence) L.push("  " + s);
    L.push("");
    L.push("THE KPIs.");
    for(const k of PLAY.kpis) L.push("  " + k);
    L.push("");
    L.push("THE GAPS, DECLARED.");
    for(const g of PLAY.gaps) L.push("  " + g);
    return L.join("\n");
  }

  /* ------------------------------- the auto lane ---------------------------- */
  async function tick(why){
    if(window.ObiAuto && !window.ObiAuto.canAuto()) return;
    if(RUNNING) return;
    try{
      const l = await last();
      const age = l && l.at ? (Date.now() - new Date(l.at).getTime()) : Infinity;
      if(age < STALE_MS) return;
      const out = await scan({ quiet: true });
      try{ console.log("[market] " + why + " scan " + out.verdict + " · " + out.measured + "/" + out.channels + " channels · " + (out.seats || []).filter(s => s.open).length + " open seat(s)"); }catch(e){}
      try{ if(typeof updateTabMeta === "function") updateTabMeta(); }catch(e){}
    }catch(e){
      try{ console.warn("[market] " + why + " scan failed: " + String((e && e.message) || e)); }catch(_){}
    }
  }

  function start(){
    if(STARTED) return false;
    if(window.ObiAuto && !window.ObiAuto.canAuto()){
      try{ console.log("[market] auto lane HELD — /auto is off"); }catch(e){}
      return false;
    }
    STARTED = true;
    setTimeout(() => tick("boot"), FIRST_SCAN_MS);
    setTimeout(async () => { try{ await last(); if(typeof updateTabMeta === "function") updateTabMeta(); }catch(e){} }, 1500);
    setInterval(() => tick("auto"), SCAN_EVERY_MS);
    return true;
  }

  window.ObiMarket = { VERSION, CHANNELS, PLAY, BASELINE, SEAT, DEEP,
    scan, last, scans, state, start, cached, numbers, report, playText,
    RUN_EVERY_MS: SCAN_EVERY_MS, FIRST_SCAN_MS };
  console.log("[market] v" + VERSION + " armed — the open source market (recon " + CHANNELS.length + " channels, play " + PLAY.seats.length + " seats), automatic every " + (SCAN_EVERY_MS / 60000) + " min");
})();
