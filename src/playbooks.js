/* ObiPlaybooks — the purchasable offerings of Agent 99 OS (src/AGENT99-OS.md §4).

   The kernel never changes. An OFFERING is a playbook: a Roman formation (who
   leads, who covers, who holds the reserve, which gates are mandatory) welded to
   an ant rule-set (which trails exist, how fast they decay, what counts as
   quorum). Activating one re-weights the whole organism without rewriting it.

   Nothing here invents lore: the drones are the tunnel's Legion, the pheromone
   laws are the canon phetrail laws (L-PHE-1..5), and GOSPEL/LFG are law, not
   proposals. Doctrine that is NOT yet canon is staged in src/PROPOSED-CANON.md. */
(function(){
  const LKEY = "obi_playbook";
  const SKEY = "obi_playbook_supply";
  const FORMA_KEY = "obi_playbook_formations";
  const KV_FOLDER = "pheromones";

  const CASTE = {
    speculator: "scout — wanders ahead of the column, lays the first trail",
    forager: "forager — cheapest line, runs on the pheromone field",
    faber: "faber — builds/fixes inside the nest",
    scriba: "scriba — records verbatim, never edits",
    optio: "optio — the shield: verifies what the line reports",
    signifer: "signifer — carries the standard: the visible answer",
    praefectus: "praefectus castrorum — holds the camp and the roads",
    haruspex: "haruspex — seals and re-opens the run",
    legatus: "legatus — a delegated mission commander",
    massa: "the mass — the undifferentiated Legion (fallback)"
  };

  const LEGION = [
    { name:"PhoenixScout", id:1, caste:"speculator", threshold:0.5, line:"scout", skills:["recon","canon","sweep"], kw:["scout","recon","sweep","survey","inspect","phetrail","probe"] },
    { name:"SoulSearch",    id:2, caste:"scriba",     threshold:0.9, line:"hastati", skills:["soul","memory","ledger"], kw:["soul","memory","ledger","search","find","remember","recall","sdnad"] },
    { name:"DNA Registry",  id:3, caste:"scriba",     threshold:0.8, line:"hastati", skills:["dna","sdnad","capture"],  kw:["dna","registry","sdnad","capture","soul-dna","souldna"] },
    { name:"ForceMarch",    id:4, caste:"legatus",    threshold:1.4, line:"principes", skills:["deploy","pipeline","launch"], kw:["forcemarch","force march","deploy","pipeline","launch","push","stage","ship"] },
    { name:"NetPet",        id:5, caste:"faber",      threshold:1.2, line:"principes", skills:["worker","cloudflare","tunnel"], kw:["net-pet","netpet","worker","cloudflare","cf ","tunnel","wrangler"] },
    { name:"ImageGen",      id:6, caste:"signifer",   threshold:1.0, line:"hastati", skills:["image","art","vision"],  kw:["image","img","picture","draw","art","poster","logo","icon","vision"] },
    { name:"WebLookup",     id:7, caste:"forager",    threshold:0.7, line:"hastati", skills:["web","search","url"],    kw:["web","search","url","lookup","fetch","browse","wikipedia"] },
    { name:"Terminal",      id:8, caste:"faber",      threshold:1.3, line:"principes", skills:["shell","script","run"], kw:["terminal","shell","script","run command",".ps1",".sh","execute"] },
    { name:"Audit",         id:9, caste:"optio",      threshold:1.1, line:"shield", skills:["audit","verify","compliance"], kw:["audit","verify","compliance","check","validate","gate"] },
    { name:"Reincarnate",   id:10, caste:"haruspex",  threshold:1.6, line:"triarii", skills:["reincarnation","lifecycle"], kw:["reincarnat","rise","death","rebirth","purge","soul-cycle"] },
    { name:"Queue",         id:11, caste:"praefectus", threshold:1.0, line:"hastati", skills:["queue","status","command"], kw:["queue","status","commands","pending","list"] },
    { name:"Network",       id:12, caste:"praefectus", threshold:1.1, line:"principes", skills:["cgn","network","mesh"], kw:["network","mesh","cgn","connected generator","node","hub"] },
    { name:"Report",        id:13, caste:"signifer",  threshold:1.0, line:"principes", skills:["report","document","summarize"], kw:["report","document","summar","write up","brief"] },
    { name:"SiteBuilder",   id:14, caste:"faber",     threshold:1.2, line:"principes", skills:["build","site","webdev","page"], kw:["build","building","rebuild","website","web site","webpage","web page","landing page","homepage","site","html","front-end","app","one-pager"] },
    { name:"Umbrella",      id:15, caste:"praefectus", threshold:1.1, line:"principes", skills:["umbrella","station","authority","fleet"], kw:["umbrella","command station","the station","generators","my generators","our generators","other generators","masterlink","master link","aim the link"] },
    { name:"Legion",        id:0,  caste:"massa",     threshold:1.0, line:"triarii", skills:["agent99","route"], kw:[] }
  ];
  const byName = {}; for (const d of LEGION) byName[d.name] = d;

  const CATALOGUE = [
    {
      id:"PRINCIPIA", rung:1, name:"PRINCIPIA — the command post",
      tagline:"The camp gate. Dictate, capture, translate, queue. One line, no reserve.",
      roman:{ formation:"single line", principle:"imperium — the sovereign's word is the order", axes:["soul","command"] },
      ant:{ rule:"lay a neutral trail on every order; no recruitment yet" },
      formation:{ hastati:["SoulSearch","DNA Registry","WebLookup","ImageGen","Queue"], principes:[], triarii:[], shield:null },
      gate:{ recon:"off", audit:"off", quorum:0.5 },
      pheromone:{ positiveTauDays:30, negativeTauDays:180, recruit:0.25, explore:0.25 },
      supply:{ unit:"commands", budget:80, contractBelow:0.2 }
    },
    {
      id:"CASTRA", rung:2, name:"CASTRA — the marching camp",
      tagline:"Every operation fortifies before it moves. Nothing runs uncheckpointed.",
      roman:{ formation:"one line + a ditch", principle:"castra — fortify before you march", axes:["soul","evidence"] },
      ant:{ rule:"trails survive the worker: the nest is the checkpoint" },
      formation:{ hastati:["SoulSearch","WebLookup","ImageGen"], principes:["NetPet","Terminal"], triarii:["Legion"], shield:"Audit" },
      gate:{ recon:"off", audit:"required", quorum:0.6 },
      pheromone:{ positiveTauDays:30, negativeTauDays:180, recruit:0.4, explore:0.2 },
      supply:{ unit:"commands", budget:150, contractBelow:0.2 }
    },
    {
      id:"TESTUDO", rung:3, name:"TESTUDO — the tortoise (evidence-mandatory)",
      tagline:"No claim leaves unshielded. Two witnesses and an optio on every output.",
      roman:{ formation:"overlapping shields", principle:"testudo — mutual cover; no uncovered claim", axes:["evidence","authority"] },
      ant:{ rule:"quorum sensing — a conclusion is taken only when the colony agrees; below quorum it camps and asks" },
      formation:{ hastati:["SoulSearch","WebLookup"], principes:["Report","DNA Registry"], triarii:["Reincarnate"], shield:"Audit" },
      gate:{ recon:"required", audit:"shield", quorum:0.67 },
      pheromone:{ positiveTauDays:45, negativeTauDays:180, recruit:0.5, explore:0.1 },
      supply:{ unit:"commands", budget:120, contractBelow:0.25 }
    },
    {
      id:"TRIPLEX", rung:4, name:"TRIPLEX ACIES — the three lines",
      tagline:"Engage, reinforce, hold the reserve. A failed line falls back, never restarts.",
      roman:{ formation:"hastati / principes / triarii", principle:"triplex acies — reserves win the long fight", axes:["evidence","supply"] },
      ant:{ rule:"division of labour by response threshold; the tired line rotates out" },
      formation:{ hastati:["SoulSearch","WebLookup","ImageGen","Queue"], principes:["NetPet","Terminal","Report","Network"], triarii:["Reincarnate","Legion"], shield:"Audit" },
      gate:{ recon:"required", audit:"shield", quorum:0.67 },
      pheromone:{ positiveTauDays:30, negativeTauDays:180, recruit:0.6, explore:0.15 },
      supply:{ unit:"commands", budget:250, contractBelow:0.2 }
    },
    {
      id:"EXPEDITIO", rung:5, name:"EXPEDITIO — the raid (creative)",
      tagline:"Speed over armour. Heavy recruitment, light audit, trails evaporate fast.",
      roman:{ formation:"light infantry, no baggage", principle:"expeditio — speed is the armour", axes:["velocity","recruitment"] },
      ant:{ rule:"short positive half-life, strong recruitment — trends fade, so must the trails" },
      formation:{ hastati:["ImageGen","WebLookup","Report"], principes:["NetPet"], triarii:["Legion"], shield:null },
      gate:{ recon:"off", audit:"off", quorum:0.5 },
      pheromone:{ positiveTauDays:7, negativeTauDays:90, recruit:0.9, explore:0.3 },
      supply:{ unit:"commands", budget:200, contractBelow:0.15 }
    },
    {
      id:"FRUMENTARIA", rung:6, name:"FRUMENTARIA — the supply corps (ops)",
      tagline:"No campaign outruns supply. Routes are chosen by cost, not by taste.",
      roman:{ formation:"baggage train first", principle:"frumentarii — logistics decides the war", axes:["supply","route"] },
      ant:{ rule:"shortest-path emergence — the road that returns first gets reinforced first" },
      formation:{ hastati:["Queue","NetPet"], principes:["Terminal","Network","Report"], triarii:["Legion"], shield:"Audit" },
      gate:{ recon:"off", audit:"required", quorum:0.6 },
      pheromone:{ positiveTauDays:60, negativeTauDays:180, recruit:0.35, explore:0.08 },
      supply:{ unit:"commands", budget:400, contractBelow:0.35 }
    },
    {
      id:"FORMICA", rung:7, name:"FORMICA — the nest (high-volume repetition)",
      tagline:"Thousands of identical items. No commander; the field does the allocating.",
      roman:{ formation:"manipular — many small identical units", principle:"quincunx rotation — swap the tired unit, keep the shape", axes:["volume","consistency"] },
      ant:{ rule:"pure stigmergy: response thresholds, quorum on every batch, trails decide the router" },
      formation:{ hastati:["SoulSearch","DNA Registry","Report","WebLookup"], principes:["Audit","Queue"], triarii:["Legion"], shield:"Audit" },
      gate:{ recon:"off", audit:"shield", quorum:0.75 },
      pheromone:{ positiveTauDays:90, negativeTauDays:180, recruit:0.7, explore:0.05 },
      supply:{ unit:"commands", budget:1000, contractBelow:0.2 }
    },
    {
      id:"DICTATOR", rung:8, name:"DICTATOR — salus rei publicae (emergency)",
      tagline:"One drone, total authority, a hard timer, and an audit that rolls it all back.",
      roman:{ formation:"one appointed magistrate, six months, then account", principle:"salus rei publicae suprema lex — the republic may be saved by suspending its rules, once, briefly, on the record", axes:["survival","accountability"] },
      ant:{ rule:"a colony under attack collapses to a single pheromone: defend the nest; all other trails are ignored" },
      formation:{ hastati:["NetPet","Terminal","ForceMarch"], principes:["Audit"], triarii:["Reincarnate"], shield:"Audit" },
      gate:{ recon:"off", audit:"shield", quorum:0.5, emergency:true, timerMinutes:120, rollback:true },
      pheromone:{ positiveTauDays:14, negativeTauDays:180, recruit:1, explore:0 },
      supply:{ unit:"commands", budget:60, contractBelow:0.1 }
    }
  ];
  const byId = {}; for (const p of CATALOGUE) byId[p.id] = p;

  function state(){
    let id = "PRINCIPIA";
    try{ id = localStorage.getItem(LKEY) || "PRINCIPIA"; }catch(e){}
    return byId[id] || byId.PRINCIPIA;
  }

  async function activate(id){
    const p = byId[String(id || "").toUpperCase()];
    if (!p) return { ok:false, error:"no such offering — try /playbook to list them" };
    try{ localStorage.setItem(LKEY, p.id); }catch(e){}
    try{ localStorage.removeItem(FORMA_KEY); }catch(e){}
    try{ if (root && root.kv && root.kv[KV_FOLDER]) await root.kv[KV_FOLDER].set("active_playbook", p.id); }catch(e){}
    supplied().reset = true;
    spend(0);
    return { ok:true, playbook:p };
  }

  function supplied(){
    let s = null;
    try{ s = JSON.parse(localStorage.getItem(SKEY) || "null"); }catch(e){}
    const day = new Date().toISOString().slice(0, 10);
    if (!s || s.day !== day) s = { day, used:0, reset:false };
    return s;
  }
  function spend(n){
    const s = supplied();
    s.used = (s.used || 0) + (n || 0);
    try{ localStorage.setItem(SKEY, JSON.stringify(s)); }catch(e){}
    return s;
  }
  function supplyReport(){
    const s = supplied(), p = state();
    const left = Math.max(0, (p.supply.budget || 0) - (s.used || 0));
    const frac = p.supply.budget ? left / p.supply.budget : 1;
    return { used:s.used || 0, budget:p.supply.budget, left, frac, contract: frac <= (p.supply.contractBelow || 0), unit:p.supply.unit };
  }

  function legalLineOf(name){
    const d = byName[name];
    return d ? d.line : "hastati";
  }

  function echelon(text, playbook){
    const p = playbook || state();
    const order = ["hastati", "principes", "triarii"];
    const out = { hastati:[], principes:[], triarii:[], shield:null, scout:null };
    for (const line of order) for (const n of (p.formation[line] || [])) out[line].push({ name:n, id:(byName[n] || {}).id, caste:(byName[n] || {}).caste });
    out.shield = p.formation.shield ? { name:p.formation.shield, id:(byName[p.formation.shield] || {}).id } : null;
    if (p.formation.hastati && p.formation.hastati.indexOf("PhoenixScout") === -1 && p.gate.recon !== "off") out.scout = { name:"PhoenixScout", id:1 };
    return out;
  }

  function formationFor(droneName, playbook){
    const p = playbook || state();
    const e = echelon(null, p);
    const line = legalLineOf(droneName);
    return {
      line: line === "scout" ? "scout" : line === "shield" ? "shield" : line,
      role: line === "triarii" ? "reserve" : "line",
      shield: e.shield,
      reserve: e.triarii,
      axes: p.roman.axes
    };
  }

  function gate(text, opts){
    opts = opts || {};
    const p = state();
    const t = String(text || "");
    let slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "command";
    if (slug.length > 40){ slug = slug.slice(0, 40); const i = slug.lastIndexOf("-"); if (i > 20) slug = slug.slice(0, i); }
    const key = "mission:" + (opts.mission || slug);
    const out = { allow:true, hold:false, reason:null, key, playbook:p.id, shield:null, quorum:p.gate.quorum };

    if (p.gate.emergency){
      out.emergency = true;
      out.timerMinutes = p.gate.timerMinutes;
      out.rollback = !!p.gate.rollback;
      out.reason = "DICTATOR: rules suspended, timer running, Audit holds the rollback.";
      return out;
    }

    if (p.gate.recon === "required" && window.ObiPheromone){
      const isRecon = /recon|scout|scout|probe|survey|inspect|verify|look|check|find/i.test(t);
      const scouted = window.ObiPheromone.sniff({ key, kind:"positive", min:0.3, limit:1 }).length > 0
                   || window.ObiPheromone.sniff({ key:"mission:scout", kind:"positive", min:0.3, limit:1 }).length > 0
                   || window.ObiPheromone.sniff({ prefix:"canon:", kind:"positive", min:0.3, limit:1 }).length > 0;
      if (!isRecon && !scouted){
        out.allow = false; out.hold = true;
        out.reason = "speculatores first — no recon trail on this ground yet. Scout it, then march (L58 MAP≠TERRAIN).";
      }
    }

    if (p.gate.audit === "shield") out.shield = p.formation.shield || "Audit";
    return out;
  }

  function tau(kind){
    const p = state();
    const days = kind === "negative" ? p.pheromone.negativeTauDays : p.pheromone.positiveTauDays;
    return days * 86400000;
  }

  function depositOrder(text, opts){
    opts = opts || {};
    const p = state();
    const P = window.ObiPheromone;
    if (!P) return null;
    const mission = opts.mission || "command";
    const key = "mission:" + mission;
    const t = P.deposit({
      kind: "neutral", key, signal: opts.drone || "",
      text: String(text || "").slice(0, 200),
      anchor: opts.anchor || null,
      drone: opts.drone || "", run: opts.run, session: opts.session,
      tau: p.pheromone.neutralTauDays ? p.pheromone.neutralTauDays * 86400000 : undefined,
      weight: 1
    });
    spend(opts.spend == null ? 1 : opts.spend);
    return t;
  }

  function recordOutcome(drone, mission, ok, opts){
    opts = opts || {};
    const p = state();
    const P = window.ObiPheromone;
    if (!P) return null;
    const t = P.deposit({
      kind: ok ? "positive" : "negative",
      key: "drone:" + (drone || "Legion"),
      signal: mission || "command",
      text: opts.text || null,
      drone: drone || "Legion",
      run: opts.run, session: opts.session,
      tau: tau(ok ? "positive" : "negative"),
      weight: 1
    });
    P.deposit({ kind: ok ? "positive" : "negative", key: "mission:" + (mission || "command"), signal: drone || "", drone: drone, tau: tau(ok ? "positive" : "negative"), weight: 1 });
    if (ok) P.evaporate();
    return t;
  }

  function list(){ return CATALOGUE.map(p => ({ id:p.id, rung:p.rung, name:p.name, tagline:p.tagline, active: p.id === state().id })); }

  function describe(id){
    const p = byId[String(id || state().id).toUpperCase()] || state();
    const e = echelon(null, p);
    const line = (arr) => arr.length ? arr.map(d => d.name).join(" · ") : "—";
    const sup = supplyReport();
    const rows = [
      ["DOCTRINE", p.roman.principle],
      ["AXES", p.roman.axes.join("  ×  ")],
      ["ANT", p.ant.rule],
      ["HASTATI", line(e.hastati)],
      ["PRINCIPES", line(e.principes)],
      ["TRIARII", line(e.triarii)],
      ["SHIELD", e.shield ? e.shield.name + " (optio)" : "—"],
      ["GATES", "recon " + p.gate.recon + " · audit " + p.gate.audit + " · quorum " + Math.round((p.gate.quorum || 0) * 100) + "%"],
      ["TRAILS", "positive τ " + p.pheromone.positiveTauDays + "d · negative τ " + p.pheromone.negativeTauDays + "d · recruit " + p.pheromone.recruit + " · explore " + p.pheromone.explore],
      ["SUPPLY", sup.used + " / " + sup.budget + " " + sup.unit + (sup.contract ? "  ⚠ CONTRACT — commit less, verify more" : "")]
    ];
    return '<div class="rise"><div class="rhead">◆ ' + p.id + ' · rung ' + p.rung + ' · ' + (p.id === state().id ? "ACTIVE" : "offering") + '</div>'
      + '<div class="rrow"><b>' + p.name.replace(/^[A-Z]+ — /, "") + '</b><span class="vd">OFFERING</span><div class="rd">' + p.tagline + '</div></div>'
      + rows.map(r => '<div class="rrow"><b>' + r[0] + '</b><span class="vd"></span><div class="rd">' + r[1] + '</div></div>').join("")
      + '</div>';
  }

  const api = {
    CATALOGUE, LEGION, CASTE, state, active: state, activate, list, describe,
    echelon, formationFor, gate, tau, depositOrder, recordOutcome,
    spend, supplyReport, byName,
    get ids(){ return CATALOGUE.map(p => p.id); }
  };
  window.ObiPlaybooks = api;
})();
