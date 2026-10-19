/* ObiPheromone — the stigmergy kernel of Agent 99 OS (src/AGENT99-OS.md §3).

   A trail is DERIVED DATA. It is never SOUL. It POINTS at soul (by anchor/seq)
   and it is evictable; the verbatim word stays in the SDNAD ledger untouched.
   deposit() refuses kind "soul" for exactly that reason.

   Ground = (key, kind, signal). Keys are coordinates, colon-namespaced:
     route:<routeId>      which road to a destination (llm model, node, provider)
     drone:<Name>         a legionnaire's proven record
     mission:<slug>       a mission type (writeup, transcribe, review, deploy)
     canon:<path>         a canon coordinate that verified
     flag:<id>            a standing flag (aggregate-count, stagnation...)

   Strength decays at READ TIME (no cron, no daemon): half-life `tau` since last
   reinforcement. Positive trails persist long; negative trails persist longer
   (canon L-PHE: 180-day negative decay — mistakes are remembered longest).
   Merge across nests is an idempotent join (max/max/earliest/latest/union), so
   two colonies can sync the same soil repeatedly without inflating it. */
(function(){
  const DAY = 86400000;
  const LSTORE = "obi_pheromones";
  const KV_FOLDER = "pheromones";
  const EPS = 0.02;
  const MAX_EVIDENCE = 6;
  const MAX_TEXT = 400;
  const MAX_TRAILS = 4000;

  const KIND = {
    positive: { tau: 30 * DAY,  sign:  1 },
    negative: { tau: 180 * DAY, sign: -1 },
    neutral:  { tau: 7 * DAY,   sign:  0 }
  };

  let nest = { v: 1, seq: 0, trails: [] };
  let loaded = false;

  const now = () => Date.now();
  const clean = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n);
  const normKey = (k, kind, signal) => `${kind}|${k}|${signal || ""}`;

  function load(){
    if (loaded) return nest;
    try{
      const raw = localStorage.getItem(LSTORE);
      if (raw){
        const p = JSON.parse(raw);
        if (p && Array.isArray(p.trails)) nest = { v: 1, seq: p.seq || 0, trails: p.trails };
      }
    }catch(e){}
    loaded = true;
    return nest;
  }

  function save(){
    try{ localStorage.setItem(LSTORE, JSON.stringify(nest)); }catch(e){}
  }

  async function mirror(){
    try{
      if (typeof root === "undefined" || !root.kv || !root.kv[KV_FOLDER]) return;
      await root.kv[KV_FOLDER].set("nest", JSON.parse(JSON.stringify(nest)));
    }catch(e){}
  }

  async function adoptFromKv(){
    try{
      if (!root || !root.kv || !root.kv[KV_FOLDER]) return false;
      const remote = await root.kv[KV_FOLDER].get("nest");
      if (remote && Array.isArray(remote.trails) && remote.trails.length){
        if (!nest.trails.length){ nest = { v: 1, seq: remote.seq || 0, trails: remote.trails }; loaded = true; save(); return true; }
        merge(remote, "kv");
      }
    }catch(e){}
    return false;
  }

  function decayed(t, at){
    at = at || now();
    const dt = Math.max(0, at - (t.reinforced_at || t.deposited_at || at));
    const tau = t.tau || (KIND[t.kind] || KIND.neutral).tau;
    return (t.strength || 0) * Math.pow(0.5, dt / tau);
  }

  function deposit(o){
    load();
    o = o || {};
    const kind = String(o.kind || "neutral").toLowerCase();
    if (kind === "soul") throw new Error("soul is not a pheromone — capture it in the ledger, then point a trail at it");
    if (!KIND[kind]) throw new Error("kind must be positive | negative | neutral");
    const key = clean(o.key, 120);
    if (!key) throw new Error("a trail needs a key (a coordinate)");
    const signal = clean(o.signal, 80);
    const weight = Number.isFinite(o.weight) ? o.weight : 1;
    const at = now();
    const id = normKey(key, kind, signal);
    let t = nest.trails.find(x => x.id === id);
    if (t){
      t.strength = (t.strength || 0) + weight;
      t.reinforcements = (t.reinforcements || 0) + 1;
      t.reinforced_at = at;
      if (o.text){
        t.evidence = (t.evidence || []);
        const q = clean(o.text, MAX_TEXT);
        if (q && !t.evidence.some(e => e.text === q)) t.evidence.unshift({ text: q, at, anchor: o.anchor || null });
        t.evidence = t.evidence.slice(0, MAX_EVIDENCE);
      }
    } else {
      t = {
        id, key, kind, signal,
        strength: weight,
        reinforcements: 1,
        deposited_at: at, reinforced_at: at,
        tau: o.tau || KIND[kind].tau,
        drone: clean(o.drone, 40), run: o.run ?? null, session: clean(o.session, 60),
        soul_anchor: o.anchor || null,
        evidence: o.text ? [{ text: clean(o.text, MAX_TEXT), at, anchor: o.anchor || null }] : [],
        meta: o.meta || null
      };
      nest.trails.push(t);
      nest.seq++;
      if (nest.trails.length > MAX_TRAILS) evaporate(true);
    }
    save(); mirror();
    return t;
  }

  function find(sel){
    load();
    if (typeof sel === "string") return nest.trails.find(t => t.id === sel) || null;
    sel = sel || {};
    return nest.trails.find(t => t.key === clean(sel.key, 120) && (!sel.kind || t.kind === sel.kind) && (!sel.signal || t.signal === clean(sel.signal, 80))) || null;
  }

  function reinforce(sel, w){ const t = find(sel); if (!t) return null; return deposit({ kind: t.kind, key: t.key, signal: t.signal, weight: w == null ? 1 : w, drone: t.drone, meta: t.meta }); }
  function repel(sel, w){ const t = find(sel); if (!t) return null; return deposit({ kind: "negative", key: t.key, signal: t.signal, weight: w == null ? 1 : w, drone: t.drone }); }

  function all(f){
    load();
    f = f || {};
    let out = nest.trails;
    if (f.kind) out = out.filter(t => t.kind === f.kind);
    if (f.key) out = out.filter(t => t.key === f.key);
    if (f.prefix) out = out.filter(t => t.key.startsWith(f.prefix));
    return out;
  }

  function sniff(f){
    f = f || {};
    const limit = f.limit || 8;
    const at = f.at || now();
    let list = all(f);
    list = list.map(t => Object.assign({}, t, { live: decayed(t, at) }))
      .filter(t => Math.abs(t.live) >= (f.min == null ? EPS : f.min));
    list.sort((a, b) => Math.abs(b.live) - Math.abs(a.live));
    return list.slice(0, limit);
  }

  function field(key, at){
    load();
    const at2 = at || now();
    let s = 0;
    for (const t of nest.trails){
      if (t.key !== key) continue;
      s += (KIND[t.kind] || KIND.neutral).sign * decayed(t, at2);
    }
    return s;
  }

  function evaporate(hard){
    load();
    const at = now();
    const before = nest.trails.length;
    nest.trails = nest.trails.filter(t => {
      const tau = t.tau || KIND[t.kind].tau;
      const stale = at - (t.reinforced_at || 0) > tau * 2;
      return !(stale && Math.abs(decayed(t, at)) < EPS);
    });
    nest.trails.sort((a, b) => Math.abs(decayed(b)) - Math.abs(decayed(a)));
    if (hard && nest.trails.length > MAX_TRAILS) nest.trails = nest.trails.slice(0, MAX_TRAILS);
    save();
    return { removed: before - nest.trails.length, kept: nest.trails.length };
  }

  function quorum(signals, need){
    signals = signals || [];
    need = need == null ? 0.67 : need;
    let f = 0, a = 0;
    for (const s of signals){
      const w = Number.isFinite(s.weight) ? s.weight : 1;
      if (String(s.stance || "for").toLowerCase() === "against") a += w; else f += w;
    }
    const total = f + a;
    const ratio = total ? f / total : 0;
    return { reached: total > 0 && ratio >= need, for: f, against: a, total, ratio, need, missing: Math.max(0, need * total - f) };
  }

  function respond(drones, stimulus, opts){
    opts = opts || {};
    load();
    const at = opts.at || now();
    const text = String(stimulus || "").toLowerCase();
    const out = [];
    for (const d of (drones || [])){
      const kw = d.kw || d.skills || [];
      let s = 0;
      for (const k of kw){ const kk = String(k).toLowerCase(); if (!kk) continue; let i = text.indexOf(kk); while (i !== -1){ s++; i = text.indexOf(kk, i + kk.length); } }
      const trust = field("drone:" + d.name, at);
      const recruit = opts.recruit == null ? 0.5 : opts.recruit;
      const threshold = (d.threshold == null ? 1 : d.threshold) - recruit * trust;
      const response = threshold <= 0 ? s * 10 : s / threshold;
      out.push({ drone: d.name, id: d.id, stimulus: s, threshold, trust, response: s > 0 ? response : 0 });
    }
    out.sort((a, b) => b.response - a.response);
    return out;
  }

  function route(candidates, opts){
    opts = opts || {};
    load();
    const at = opts.at || now();
    const explore = opts.explore == null ? 0.15 : opts.explore;
    const items = (candidates || []).map(c => {
      const id = typeof c === "string" ? c : c.id;
      const cost = (typeof c === "object" && c.cost) || 1;
      const trails = nest.trails.filter(t => t.key === "route:" + id || t.key === "route:" + id.replace(/^route:/, ""));
      const score = trails.reduce((n, t) => n + (KIND[t.kind] || KIND.neutral).sign * decayed(t, at), 0);
      const trips = trails.reduce((n, t) => n + (t.reinforcements || 0), 0);
      return { id, cost, score: score / cost, trips, meta: (typeof c === "object" && c.meta) || null };
    });
    items.sort((a, b) => b.score - a.score);
    const any = items.some(i => i.score !== 0);
    let pick = null;
    if (items.length){
      if (!any || (explore > 0 && Math.random() < explore)) pick = items[Math.floor(Math.random() * items.length)];
      else pick = items[0];
    }
    return { ranked: items, pick: pick ? pick.id : null, trailblind: !any };
  }

  function publish(){
    load();
    const at = now();
    return {
      v: 1,
      at,
      by: (typeof window !== "undefined" && window.generatorName) || "obi",
      trails: nest.trails.map(t => ({
        id: t.id, key: t.key, kind: t.kind, signal: t.signal,
        strength: t.strength, reinforcements: t.reinforcements,
        deposited_at: t.deposited_at, reinforced_at: t.reinforced_at, tau: t.tau,
        drone: t.drone, soul_anchor: t.soul_anchor
      }))
    };
  }

  function merge(remote, source){
    load();
    if (!remote || !Array.isArray(remote.trails)) return { merged: 0, created: 0 };
    let created = 0;
    for (const r of remote.trails){
      if (!r || !r.id) continue;
      const t = nest.trails.find(x => x.id === r.id);
      if (!t){ nest.trails.push(Object.assign({ evidence: [], meta: null, source: source || "remote" }, r)); created++; continue; }
      t.strength = Math.max(t.strength || 0, r.strength || 0);
      t.reinforcements = Math.max(t.reinforcements || 0, r.reinforcements || 0);
      t.deposited_at = Math.min(t.deposited_at || Infinity, r.deposited_at || Infinity) || t.deposited_at;
      t.reinforced_at = Math.max(t.reinforced_at || 0, r.reinforced_at || 0);
    }
    save(); mirror();
    return { merged: remote.trails.length - created, created };
  }

  function stats(){
    load();
    const at = now();
    const by = { positive: 0, negative: 0, neutral: 0 };
    for (const t of nest.trails) by[t.kind] = (by[t.kind] || 0) + 1;
    const ranked = nest.trails.slice().sort((a, b) => Math.abs(decayed(b, at)) - Math.abs(decayed(a, at)));
    const top = ranked[0] || null;
    return {
      trails: nest.trails.length,
      by,
      live: nest.trails.filter(t => Math.abs(decayed(t, at)) >= EPS).length,
      seq: nest.seq,
      keys: Array.from(new Set(nest.trails.map(t => t.key.split(":")[0]))).sort(),
      strongest: top ? { key: top.key, kind: top.kind, live: Number(decayed(top, at).toFixed(3)), trips: top.reinforcements } : null
    };
  }

  function exportJSON(){ load(); return JSON.stringify(nest); }
  function importJSON(s){ const p = JSON.parse(s); return merge(p, "import"); }
  function reset(){ nest = { v: 1, seq: 0, trails: [] }; loaded = true; save(); mirror(); return stats(); }

  load();

  window.ObiPheromone = {
    KIND, EPS, DAY, KV_FOLDER,
    load, save, mirror, adoptFromKv,
    deposit, reinforce, repel, find, all, sniff, field,
    decayed, evaporate, quorum, respond, route, publish, merge, stats,
    exportJSON, importJSON, reset,
    get nest(){ return nest; }
  };
})();
