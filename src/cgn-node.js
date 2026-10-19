/* ============================================================================
   CGN NODE KIT — drop into ANY other Perchance generator to join the network.

   Paste this <script src="..."> (or inline copy) into one of your other
   generators. It makes that generator a NODE of the Connected Generator
   Network whose anchor is Obi:

     - PULL: it reads the anchor's HUB file and mirrors the whole-organism
             soul + laws into that generator's own localStorage, so the node
             KNOWS the whole (one organism, many faces).
     - PUSH: it maintains its OWN node file (its own namespace, its own
             editKey) with the soul it captures locally. The anchor pulls
             every member's node file on each /netsync, so your other
             generators' sovereign words flow INTO the whole automatically.
     - RRL:  raw transcripts stay local to each node (raw != soul).

   CONFIGURE the three values below, then:
     nodeJoin()       — first run: create your node file, announce yourself
     nodeSync()       — every sync: pull the hub + push your new captures
     nodeStatus()     — small report for your own console/UI
   For generators that already use the Obi ledger key (obi_sdnad), this also
   merges the whole directly into that ledger so their /memory shows it.
   ========================================================================== */
(function(){
  const CONFIG = {
    net: "obi-network",          // network name (must match the anchor's /netjoin)
    anchorName: "phoenix-rising-ai-solutions-agent99-mastermind", // generator name of the ANCHOR (who created the hub)
    role: "worker",              // this node's role in the organism
    ledgerKey: "obi_sdnad",      // local ledger to merge the whole into (optional)
    mirrorKey: "obi_cgn_mirror"  // dedicated mirror key (always written)
  };
  const SELF = String(window.generatorName || "node").replace(/[^a-z0-9-]/gi,"").toLowerCase();
  const HUB_URL = `https://editable.uploads.dev/file/${CONFIG.anchorName}/obi-cgn-${CONFIG.net}`;
  const NODE_NAME = "cgn-node";
  const NODE_URL = `https://editable.uploads.dev/file/${SELF}/${NODE_NAME}`;

  const fetchJson = async (url) => {
    try{
      let res;
      if(window.root && window.root.superFetch) res = await window.root.superFetch(url);
      else res = await fetch(url);
      if(!res || !res.ok) return null;
      const j = JSON.parse(await res.text());
      return (j && typeof j === "object") ? j : null;
    }catch(e){ return null; }
  };

  const loadMirror = () => { try{ return JSON.parse(localStorage.getItem(CONFIG.mirrorKey) || "null") || {soul:[], laws:[]}; }catch(e){ return {soul:[], laws:[]}; } };
  const saveMirror = m => { try{ localStorage.setItem(CONFIG.mirrorKey, JSON.stringify(m)); }catch(e){} };
  const soulKey = e => (e.t||"") + "|" + String(e.text||"");

  const nodeId = () => {
    let id;
    try{ id = localStorage.getItem(CONFIG.mirrorKey + "_id"); }catch(e){}
    if(!id){ id = (window.generatorPublicId || Math.random().toString(36).slice(2,10)); try{ localStorage.setItem(CONFIG.mirrorKey + "_id", id); }catch(e){} }
    return id;
  };

  function localSoulEntries(){
    /* captures made by THIS generator. Pulls from its own ledger if it has one. */
    try{
      const L = JSON.parse(localStorage.getItem(CONFIG.ledgerKey) || "null");
      if(L && Array.isArray(L.soul)) return L.soul.filter(e => e.role === "sovereign").map(e => ({t:e.t, run:e.run??e.n??null, text:String(e.text||"")}));
    }catch(e){}
    return [];
  }

  /* ---- PUSH: append this node's own captures to its own node file ---- */
  async function nodePush(){
    const nf = (await fetchJson(NODE_URL)) || { net: CONFIG.net, nodeId: nodeId(), name: SELF, role: CONFIG.role, seq: 0, soul: [], laws: [] };
    if(nf.net && nf.net !== CONFIG.net){ nf.net = CONFIG.net; }
    const before = nf.soul.length;
    const known = new Set(nf.soul.map(soulKey));
    let added = 0;
    for(const e of localSoulEntries()){
      if(!e.text) continue;
      if(known.has(soulKey(e))) continue;
      nf.soul.push(e);
      known.add(soulKey(e));
      added++;
    }
    nf.nodeId = nodeId(); nf.name = SELF; nf.role = CONFIG.role;
    nf.updated = Date.now();
    if(added){
      nf.seq = (nf.seq || 0) + 1;
      if(!window.root || !window.root.uploadPlugin) return { ok:false, why:"no uploadPlugin in this generator — read-only node", added:0 };
      const res = await window.root.uploadPlugin.editable.set(NODE_NAME, JSON.stringify(nf), {editKey: localStorage.getItem(CONFIG.mirrorKey + "_key")});
      if(res.error) return { ok:false, why:res.error, added:0 };
      if(res.editKey) try{ localStorage.setItem(CONFIG.mirrorKey + "_key", res.editKey); }catch(e){}
    }
    return { ok:true, added, before, after: nf.soul.length };
  }

  /* ---- PULL: mirror the whole into this node's storage ---- */
  async function nodePull(){
    const hub = await fetchJson(HUB_URL);
    if(!hub) return { ok:false, why:"hub not found (check anchorName + net)" };
    const m = loadMirror();
    const known = new Set(m.soul.map(soulKey));
    let pulled = 0;
    for(const e of hub.soul || []){
      if(!e.text || known.has(soulKey(e))) continue;
      m.soul.push({ t:e.t, run:e.run??null, text:String(e.text), node:e.node||"?" });
      known.add(soulKey(e));
      pulled++;
    }
    const lawsKnown = new Set(m.laws.map(l=>l.num));
    for(const l of hub.laws || []){
      if(l.num === undefined || lawsKnown.has(l.num)) continue;
      m.laws.push(l); lawsKnown.add(l.num);
    }
    m.hub = { net: hub.net, seq: hub.seq, nodes: Object.keys(hub.nodes||{}).length, members: hub.members||[] };
    saveMirror(m);

    /* if the host generator uses the Obi ledger, merge the whole into it too */
    try{
      const L = JSON.parse(localStorage.getItem(CONFIG.ledgerKey) || "null");
      if(L && Array.isArray(L.soul)){
        const lk = new Set(L.soul.map(soulKey));
        let lm = 0;
        for(const e of hub.soul || []){
          if(!e.text || lk.has(soulKey(e))) continue;
          L.soul.push({ t:e.t, role:"sovereign", run:e.run??null, text:e.text, footnote:e.footnote||null, node:e.node||"?" });
          lk.add(soulKey(e)); lm++;
        }
        if(lm) localStorage.setItem(CONFIG.ledgerKey, JSON.stringify(L));
      }
    }catch(e){}

    return { ok:true, pulled, whole: m.soul.length, seq: hub.seq };
  }

  async function nodeSync(){
    const p = await nodePush();
    const pl = await nodePull();
    return { push: p, pull: pl };
  }

  function nodeStatus(){
    const m = loadMirror();
    return {
      net: CONFIG.net, self: SELF, role: CONFIG.role, nodeId: nodeId(),
      localCaptures: localSoulEntries().length,
      mirrorSoul: m.soul.length, mirrorLaws: m.laws.length,
      hub: m.hub || null
    };
  }

  window.CGN = { join: nodePush, sync: nodeSync, pull: nodePull, push: nodePush, status: nodeStatus, config: CONFIG, nodeUrl: NODE_URL, hubUrl: HUB_URL };

  /* boot: mirror the whole once, then announce this node */
  setTimeout(async ()=>{ try{ await nodePull(); await nodePush(); }catch(e){} }, 2000);
})();
