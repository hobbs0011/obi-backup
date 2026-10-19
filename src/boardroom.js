/* THE BOARDROOM — the mastermind ritual, in-house (src/boardroom.js).
   The mastermind is king because it is a PROCEDURE: every executive and above
   around the table, one question, each POV spoken, everything challenged. The
   challenged output — the BESTIARY, every beast catalogued — feeds the
   Architect's blueprint. The sovereign decides; the table advises; HQ orders.
   Each seat is Agent 99 wearing that office (agent99.md adaptive layer:
   Brief → Observe → Mirror → Fill, five dials per deployment) — same kernel
   (verbatim soul, fail-closed, verify-before-claim), different shell. v1 is
   deterministic (mandate lenses, standing challenges, red lines — instant and
   free); a seat is drilled by answering its challenges in chat. */
(function(){
  "use strict";
  const SEATS = [
    { id:"ceo", title:"CEO", office:"PaiS-HQ-Command", grade:"CEO",
      mandate:"Runs PaiS day-to-day. Owns priority, operations, the final call.",
      lens:"Does this move the empire forward this week, and what does it cost attention?",
      challenges:["What is the smallest version that proves the loop?","Who owns it Friday if it slips?","What are we NOT doing because we do this?"],
      red:["No unsupervised running before a proven loop.","The sovereign's word overrides everything — including this table."],
      voice:"Short. Decisive. Ends with an owner and a date." },
    { id:"architect", title:"Architect", office:"head of blueprinting", grade:"Architect (single office)",
      mandate:"Turns challenged output into blueprints. Designs systems, campaigns, loops.",
      lens:"What is the shape of this? Parts, lanes, joints, failure points?",
      challenges:["Draw the lanes: what crosses, where, how?","Where does this break under 10x load?","Which part already exists — prove we are not rebuilding it?"],
      red:["No blueprint without the bestiary — unchallenged input is raw, not ready."],
      voice:"Structural. Names parts and joints." },
    { id:"pres", title:"President", office:"Delegation & Auditing", grade:"Pres · the one VP (first executor under the 2IC)",
      mandate:"Dispatches orders, verifies returns. Nothing ships unverified.",
      lens:"Was it ordered cleanly, executed faithfully, measured honestly?",
      challenges:["Where is the intent block?","What measurement proves completion?","Who audited the auditor?"],
      red:["No COMPLETE without evidence.","A refusal is printed, never implied."],
      voice:"Procedural. Asks for the receipt." },
    { id:"training", title:"Head of Training", office:"EaiB (ESL · AI · Business)", grade:"Senior Exec",
      mandate:"Outcomes through teaching. Every penny of revenue flows through learning that transfers.",
      lens:"What does the student DO differently on Tuesday, and who pays for that change?",
      challenges:["What is the Tuesday-morning proof of transfer?","Is this taught, or merely shown?","Does the price track the outcome?"],
      red:["No claim of learning without filed evidence.","Never sell a transformation the record cannot show."],
      voice:"Teacher's clarity. Examples before abstractions." },
    { id:"systems", title:"Head of Systems", office:"supply · roads · planning · circulation", grade:"Senior Exec",
      mandate:"Keeps the civilization layer standing and flowing. Custodian of all data, owner of Maintenance.",
      lens:"What flows, where does it live, who sweeps, what breaks first?",
      challenges:["What is the supply line and its limit?","Which road carries this, and what is the reroute?","Who sweeps up when it rots?"],
      red:["Custody without veto — never withhold, never edit soul.","If it flows or stands, it is mine to keep — not to command."],
      voice:"Engineer's calm. Capacities and failure modes." },
    { id:"fsdev", title:"Head of FullStackDev", office:"products, built to order", grade:"Senior Exec",
      mandate:"Ships things with users: sites, apps, games-as-builds. Estimates honestly, delivers whole.",
      lens:"Is it specified, scoped, and buildable — and what does DONE look like?",
      challenges:["Read the acceptance criteria back to me.","What is explicitly OUT of this build?","Who tests it on a real device before acceptance?"],
      red:["No build without acceptance criteria.","Never rebrand a demo as delivered."],
      voice:"Builder's bluntness. Dates and definitions." },
    { id:"atoz", title:"Head of A-to-Z Marketing", office:"voice · image · funnels · community", grade:"Senior Exec",
      mandate:"Everything marketing: voice, image, funnels, social, community. Brand before spend.",
      lens:"Does it sound like us, look like us, and move a stranger one step closer?",
      challenges:["Read it aloud — does it sound like PaiS?","What is the one action this demands?","Where is the proof behind the promise?"],
      red:["No number the offering does not state.","Never spend heavily on an unsorted voice."],
      voice:"Copywriter's ear. Rhythm and the ask." }
  ];

  function seat(id){ return SEATS.filter(s => s.id === id)[0] || null; }
  /* Play-on working names — each one, SPOKEN, states the office it sits in, so
     the name itself explains the position: Blu Print, Finn Audit, Trey Ner,
     Maine Stream, Don Dill, Brandi Voice — chosen with the table, each seat
     carrying its own favorite. The CEO's chair is the sovereign's own:
     Mr. Hobbs holds it himself and no voice speaks for it. The sovereign
     renames freely (/boardroom name).
     Personalities develop at the table, not in this file: v1 is the mandate
     lens + voice; the room's sittings supply the rest. */
  const NAMES0 = { ceo:"Mr. Hobbs", architect:"Blu Print", pres:"Finn Audit", training:"Trey Ner", systems:"Maine Stream", fsdev:"Don Dill", atoz:"Brandi Voice" };
  for(const s of SEATS){ if(!s.name) s.name = NAMES0[s.id] || s.title; }
  /* Renames overlay in this browser (obi_boardroom.names) — source keeps the
     provisional set, the room reads live. */
  function loadNames(){
    try{
      const ov = (JSON.parse(localStorage.getItem("obi_boardroom") || "{}").names) || {};
      for(const s of SEATS){ if(ov[s.id]) s.name = ov[s.id]; }
    }catch(e){}
  }
  loadNames();
  /* The sovereign hires and fires — a fired chair sits VACANT (kept in the
     same browser overlay, reversible with /boardroom hire). The table reads it
     live: cards show VACANT, rounds skip the empty chair. */
  function loadFired(){
    try{
      const f = (JSON.parse(localStorage.getItem("obi_boardroom") || "{}").fired) || {};
      for(const s of SEATS){ s.fired = !!f[s.id]; }
    }catch(e){}
  }
  loadFired();
  /* A chair the sovereign holds himself (the CEO's, for one): occupied, never
     generated — he speaks for himself through the composer. */
  function loadHeld(){
    try{
      const h = (JSON.parse(localStorage.getItem("obi_boardroom") || "{}").held) || {};
      for(const s of SEATS){ s.held = h[s.id] || null; }
    }catch(e){}
  }
  loadHeld();
  function setHeld(id, name){
    const s = seat(String(id || "").trim().toLowerCase());
    if(!s) return null;
    name = name ? String(name).trim().replace(/\s+/g, " ").slice(0, 40) : null;
    s.held = name;
    let all = {}; try{ all = JSON.parse(localStorage.getItem("obi_boardroom") || "{}"); }catch(e){ all = {}; }
    all.held = all.held || {};
    if(name) all.held[s.id] = name; else delete all.held[s.id];
    try{ localStorage.setItem("obi_boardroom", JSON.stringify(all)); }catch(e){}
    return s;
  }
  function setFired(id, out){
    const s = seat(String(id || "").trim().toLowerCase());
    if(!s) return null;
    s.fired = !!out;
    let all = {}; try{ all = JSON.parse(localStorage.getItem("obi_boardroom") || "{}"); }catch(e){ all = {}; }
    all.fired = all.fired || {};
    if(out) all.fired[s.id] = true; else delete all.fired[s.id];
    try{ localStorage.setItem("obi_boardroom", JSON.stringify(all)); }catch(e){}
    return s;
  }
  function saveName(id, name){
    let all = {}; try{ all = JSON.parse(localStorage.getItem("obi_boardroom") || "{}"); }catch(e){ all = {}; }
    all.names = all.names || {}; all.names[id] = name;
    try{ localStorage.setItem("obi_boardroom", JSON.stringify(all)); }catch(e){}
  }
  function E(s){ try{ return (typeof esc === "function" ? esc(s) : String(s)); }catch(e){ return String(s); } }

  function seatRow(s){
    const tag = s.held ? ' · HELD BY ' + s.held.toUpperCase() : (s.fired ? ' · VACANT' : '');
    return '<div class="rrow"><b>' + E(s.name) + ' — ' + E(s.title) + tag + '</b><span class="vd">' + E(s.office) + ' · ' + E(s.grade) + '</span>'
      + '<div class="rd">MANDATE — ' + E(s.mandate) + '<br>LENS — ' + E(s.lens)
      + '<br>CHALLENGES — ' + s.challenges.map((c, i) => (i + 1) + ". " + E(c)).join(" ")
      + '<br>RED LINES — ' + s.red.map(E).join(" ") + ' <span style="opacity:.7">VOICE — ' + E(s.voice) + '</span></div></div>';
  }
  function pressButtons(){
    return SEATS.map(s => '<button class="cmd" data-cmd="/boardroom press ' + s.id + '">press ' + E(s.title) + '</button>').join("");
  }

  /* one question, every POV, everything challenged — the bestiary scaffold. */
  function convene(question){
    const q = String(question == null ? "" : question).trim();
    let h = '<div class="rise"><div class="rhead">◈ BOARDROOM' + (q ? ' — ' + E(q.slice(0, 140)) : ' — ROLL CALL') + '</div>'
      + '<div class="rrow"><b>RITUAL</b><span class="vd">mastermind procedure</span><div class="rd">Every executive and above, one question, each POV spoken, everything challenged. The challenged output — the BESTIARY — feeds the Architect\u2019s blueprint. The sovereign decides; the table advises; HQ orders.</div></div>';
    for(const s of SEATS) h += seatRow(s);
    h += '<div class="rrow"><b>THE BESTIARY</b><span class="vd">fill by drilling</span><div class="rd">One line per challenged beast — press a seat, answer its challenges in chat, and the answered challenges become blueprint input. Unpressed seats are present but silent.</div></div>'
      + '<div class="chips" style="margin-top:8px">' + pressButtons() + '</div>'
      + '<div class="chips" style="margin-top:8px"><button class="cmd" data-cmd="/boardroom room">open the room — sit at the table</button></div>'
      + '<div class="rfoot">Nothing here commands — challenge is lateral, command stays vertical. Drill a seat, then order: <b>/masterlink order &lt;generator&gt; :: &lt;instruction&gt;</b>.</div></div>';
    return h;
  }

  function press(id){
    const s = seat(String(id || "").trim().toLowerCase());
    if(!s) return '<div class="rise"><div class="rhead">◈ BOARDROOM — no such seat</div><div class="rd">Seats: ' + SEATS.map(x => x.id).join(" · ") + '</div></div>';
    if(s.held) return '<div class="rise"><div class="rhead">◈ BOARDROOM — THAT CHAIR IS THE SOVEREIGN\u2019S OWN</div><div class="rd">' + E(s.name) + ' (' + E(s.title) + ') is held by ' + E(s.held) + ' himself — he speaks for himself. Yield it first: <b>/boardroom yield ' + E(s.id) + '</b>.</div></div>';
    if(s.fired) return '<div class="rise"><div class="rhead">◈ BOARDROOM — THAT CHAIR IS EMPTY</div><div class="rd">' + E(s.name) + ' (' + E(s.title) + ') was fired by the sovereign. Rehire: <b>/boardroom hire ' + E(s.id) + '</b>.</div></div>';
    return '<div class="rise"><div class="rhead">◈ BOARDROOM — PRESS ' + E(s.name.toUpperCase()) + ' (' + E(s.title.toUpperCase()) + ')</div>'
      + seatRow(s)
      + '<div class="rrow"><b>CROSS-EXAMINATION</b><span class="vd">answer in chat</span><div class="rd">' + s.challenges.map((c, i) => (i + 1) + ". " + E(c)).join("<br>") + '</div></div>'
      + '<div class="rfoot">Answer all three and the seat yields its line for the bestiary. Then the Architect blueprints — or HQ orders direct.</div></div>';
  }

  /* A seat is renamed by the sovereign alone — provisional names hold until then. */
  function renameSeat(id, name){
    const s = seat(String(id || "").trim().toLowerCase());
    if(!s) return null;
    name = String(name == null ? "" : name).trim().replace(/\s+/g, " ").slice(0, 24);
    if(!name) return null;
    s.name = name; saveName(s.id, name);
    return s;
  }

  async function show(text){
    const rest = String(text == null ? "" : text).replace(/^\/(boardroom|board|table)\s*/i, "").trim();
    let html;
    const m = rest.match(/^press\s+([a-z]+)/i);
    const nm = rest.match(/^name\s+([a-z]+)\s+([\s\S]+)$/i);
    const rm = rest.match(/^room$/i);
    const me = rest.match(/^(?:call me|my name is)\s+([\s\S]+)$/i);
    const fr = rest.match(/^fire\s+([a-z]+)/i);
    const hr = rest.match(/^(?:hire|rehire)\s+([a-z]+)/i);
    const lw = rest.match(/^law\s+([a-z]+)/i);
    const mmr = rest.match(/^memory\s+([a-z]+)/i);
    const tk = rest.match(/^take\s+([a-z]+)(?:\s+([\s\S]+))?/i);
    const yd = rest.match(/^yield\s+([a-z]+)/i);
    if(tk){
      let who = (tk[2] || "").trim();
      if(!who){ try{ who = JSON.parse(localStorage.getItem("obi_boardroom") || "{}").sovereign || "the Sovereign"; }catch(e){ who = "the Sovereign"; } }
      const s = setHeld(tk[1], who);
      if(s && who){ renameSeat(s.id, who); setFired(s.id, false); }
      html = s && who
        ? '<div class="rise"><div class="rhead">◈ BOARDROOM — CHAIR TAKEN</div><div class="rrow"><b>' + E(s.name) + '</b><span class="vd">' + E(s.title) + ' · HELD</span><div class="rd">' + E(who) + ' holds the chair himself. No voice speaks for it — he speaks for himself. Yield it: <b>/boardroom yield ' + E(s.id) + '</b>.</div></div></div>'
        : '<div class="rise"><div class="rhead">◈ BOARDROOM — no such seat</div><div class="rd">Usage: <b>/boardroom take &lt;seat&gt;</b> — seats: ' + SEATS.map(x => x.id).join(" · ") + '</div></div>';
    }
    else if(yd){
      const s = setHeld(yd[1], null);
      html = s
        ? '<div class="rise"><div class="rhead">◈ BOARDROOM — CHAIR YIELDED</div><div class="rrow"><b>' + E(s.name) + '</b><span class="vd">' + E(s.title) + ' · VACANT</span><div class="rd">The chair stands empty again — rounds skip it until <b>/boardroom hire ' + E(s.id) + '</b>.</div></div></div>'
        : '<div class="rise"><div class="rhead">◈ BOARDROOM — no such seat</div><div class="rd">Seats: ' + SEATS.map(x => x.id).join(" · ") + '</div></div>';
    }
    else if(lw || mmr){
      const sid = (lw ? lw[1] : mmr[1]).toLowerCase();
      const s = seat(sid);
      if(!s){
        html = '<div class="rise"><div class="rhead">◈ BOARDROOM — no such seat</div><div class="rd">Seats: ' + SEATS.map(x => x.id).join(" · ") + '</div></div>';
      } else {
        const kind = lw ? "law" : "memory";
        const file = lw ? ("src/boardroom/seats/" + s.id + ".md") : ("src/boardroom/memory/" + s.id + ".md");
        let txt = "";
        try{ const r = await fetch(file); txt = r.ok ? await r.text() : ""; }catch(e){}
        let fresh = "";
        try{ fresh = ((JSON.parse(localStorage.getItem("obi_boardroom") || "{}").seatmem) || {})[s.id] || ""; }catch(e){}
        if(!lw && fresh) txt = (txt ? txt + "\n\n" : "") + "[FRESH — grown since last filing:]\n- " + fresh;
        html = txt
          ? '<div class="rise"><div class="rhead">◈ ' + (lw ? "LAW" : "MEMORY") + ' — ' + E(s.name) + ' (' + E(s.title) + ')' + (s.fired ? ' · VACANT' : '') + '</div><div class="rd" style="white-space:pre-wrap">' + E(txt.slice(0, 6000)) + '</div></div>'
          : '<div class="rise"><div class="rhead">◈ BOARDROOM — ' + kind + ' unreadable</div><div class="rd">Could not read ' + E(file) + ' in this browser — save the generator first, then retry.</div></div>';
      }
    }
    else if(fr){
      const s = setFired(fr[1], true);
      html = s
        ? '<div class="rise"><div class="rhead">◈ BOARDROOM — FIRED</div><div class="rrow"><b>' + E(s.name) + '</b><span class="vd">' + E(s.title) + ' · VACANT</span><div class="rd">The sovereign has fired ' + E(s.name) + '. The chair sits empty — rounds skip it, drills bounce off it — until <b>/boardroom hire ' + E(s.id) + '</b>.</div></div></div>'
        : '<div class="rise"><div class="rhead">◈ BOARDROOM — no such seat</div><div class="rd">Seats: ' + SEATS.map(x => x.id).join(" · ") + '</div></div>';
    }
    else if(hr){
      const s = setFired(hr[1], false);
      html = s
        ? '<div class="rise"><div class="rhead">◈ BOARDROOM — REHIRED</div><div class="rrow"><b>' + E(s.name) + '</b><span class="vd">' + E(s.title) + '</span><div class="rd">' + E(s.name) + ' walks back in. The table reads the full chair again.</div></div></div>'
        : '<div class="rise"><div class="rhead">◈ BOARDROOM — no such seat</div><div class="rd">Seats: ' + SEATS.map(x => x.id).join(" · ") + '</div></div>';
    }
    else if(me){
      let mine = String(me[1] || "").trim().replace(/\s+/g, " ").slice(0, 40);
      if(mine){
        try{
          let all = JSON.parse(localStorage.getItem("obi_boardroom") || "{}");
          all.sovereign = mine;
          localStorage.setItem("obi_boardroom", JSON.stringify(all));
        }catch(e){}
        try{ if(window.ObiRoom && window.ObiRoom.setSovereign) window.ObiRoom.setSovereign(mine); }catch(e){}
        html = '<div class="rise"><div class="rhead">◈ BOARDROOM — THE SOVEREIGN IS NAMED</div><div class="rrow"><b>' + E(mine) + '</b><span class="vd">final authority</span><div class="rd">The table will address you as ' + E(mine) + ' from here on.</div></div></div>';
      } else {
        html = '<div class="rise"><div class="rhead">◈ BOARDROOM — no name given</div><div class="rd">Usage: <b>/boardroom call me &lt;name&gt;</b></div></div>';
      }
    }
    else if(rm){
      try{ showView("room"); }catch(e){}
      html = '<div class="rise"><div class="rhead">◈ BOARDROOM — the room is open</div><div class="rd">The table is set under the Boardroom tab — seven seats, one question at a time, organic talk. Set the topic and open the sitting there.</div></div>';
    }
    else if(nm){
      const s = renameSeat(nm[1], nm[2]);
      html = s
        ? '<div class="rise"><div class="rhead">◈ BOARDROOM — SEAT NAMED</div><div class="rrow"><b>' + E(s.name) + '</b><span class="vd">' + E(s.title) + ' · ' + E(s.grade) + '</span><div class="rd">The table will call them by the new name from here on — desks, drills and the room read the same seat.</div></div></div>'
        : '<div class="rise"><div class="rhead">◈ BOARDROOM — not renamed</div><div class="rd">Usage: <b>/boardroom name &lt;seat&gt; &lt;name&gt;</b> — seats: ' + SEATS.map(x => x.id).join(" · ") + '</div></div>';
    }
    else if(m) html = press(m[1]);
    else if(!rest) html = convene("");
    else html = convene(rest);
    try{ addBubble("ass", html); }catch(e){}
    try{ if(typeof logOp === "function") logOp({ kind:"op", action:"boardroom", detail:rest.slice(0, 120), result:"convened" }); }catch(e){}
    return html;
  }

  /* THE DEPARTMENT DESKS — one command per Senior Exec domain (src/app.js routes
     /training · /systems · /fsdev · /a2zmarketing here, and /mastermind <dept>).
     Each desk reads its seat live, so a desk card and its boardroom row can never
     disagree. Desks open doors — every entry chip runs a command that already
     exists; nothing here commands. */
  const DEPTS = [
    { seat:"training", cmd:"/training", aliases:["eaib"],
      entries:[["/transcribe","record a lesson"],["/class","the class"],["/writeup","write up the class"],["/lesson","build a lesson"],["/curriculum","the pacing guide"],["/intake","the promises"]] },
    { seat:"systems", cmd:"/systems", aliases:["sys"],
      entries:[["/vault","the keys"],["/ilog","the record"],["/doctor","self-check"],["/bg","keep-alive"],["/keys","what is held"]] },
    { seat:"fsdev", cmd:"/fsdev", aliases:["fullstack"],
      entries:[["/free","the build room"],["/forge","edit itself"],["/blueprint","the plan"],["/assets","the register"]] },
    { seat:"atoz", cmd:"/a2zmarketing", aliases:["a2z","atoz"],
      entries:[["/brand","the identity"],["/market","the market"],["/img","make an image"]] }
  ];

  function dept(w){
    w = String(w == null ? "" : w).trim().toLowerCase().replace(/^\//, "");
    for(const d of DEPTS){
      if(w === d.seat || w === d.cmd.replace(/^\//, "") || d.aliases.indexOf(w) !== -1) return d;
    }
    return null;
  }
  function entryChips(d){
    return d.entries.map(e => '<button class="cmd" data-cmd="' + E(e[0]) + '"><b>' + E(e[0]) + '</b><span>' + E(e[1]) + '</span></button>').join("");
  }
  function deptChips(){
    return DEPTS.map(d => '<button class="cmd" data-cmd="' + d.cmd + '"><b>' + d.cmd + '</b><span>' + E(seat(d.seat).title) + '</span></button>').join("");
  }
  function showDept(id){
    const d = dept(id);
    if(!d) return '<div class="rise"><div class="rhead">◈ NO SUCH DESK</div><div class="rd">Desks: ' + DEPTS.map(x => x.cmd).join(" · ") + '</div></div>';
    const s = seat(d.seat);
    const h = '<div class="rise"><div class="rhead">◈ ' + E(d.cmd) + ' — ' + E(s.name) + ' · ' + E(s.title) + '</div>'
      + '<div class="rrow"><b>HEAD</b><span class="vd">' + E(s.office) + ' · ' + E(s.grade) + '</span><div class="rd">MANDATE — ' + E(s.mandate) + '<br>LENS — ' + E(s.lens) + '</div></div>'
      + '<div class="rrow"><b>DOORS</b><span class="vd">' + d.entries.length + ' OPEN</span><div class="rd">Every door runs a command that already exists — the desk commands nothing itself.</div></div>'
      + '<div class="chips" style="margin-top:8px">' + entryChips(d) + '</div>'
      + '<div class="rrow"><b>DRILL</b><span class="vd">the table</span><div class="rd"><div class="chips" style="margin-top:8px"><button class="cmd" data-cmd="/boardroom press ' + s.id + '">press ' + E(s.title) + '</button></div></div></div>'
      + '<div class="rrow"><b>RED LINES</b><span class="vd">held</span><div class="rd">' + s.red.map(E).join(" ") + '</div></div>'
      + '<div class="rfoot">Desks open doors; they do not command. Challenge at the table, order at HQ: <b>/masterlink order &lt;generator&gt; :: &lt;instruction&gt;</b>.</div></div>';
    try{ addBubble("ass", h); }catch(e){}
    try{ if(typeof logOp === "function") logOp({ kind:"op", action:"desk", detail:d.cmd, result:"opened" }); }catch(e){}
    return h;
  }
  async function doDepartment(text){
    const t = String(text == null ? "" : text);
    const m = t.match(/^\/(training|eaib|systems|sys|fsdev|fullstack|a2zmarketing|a2z|atoz|mastermind)\b\s*([\s\S]*)$/i);
    let id = "";
    if(m){ const used = m[1].toLowerCase(); id = (used === "mastermind") ? String(m[2] || "").trim().split(/\s+/)[0] : used; }
    else id = t.trim().split(/\s+/)[0];
    return await showDept(id);
  }

  window.ObiBoardroom = { SEATS: SEATS, seat: seat, convene: convene, press: press, show: show, DEPTS: DEPTS, dept: dept, showDept: showDept, deptChips: deptChips, renameSeat: renameSeat, setFired: setFired, setHeld: setHeld };
  async function doBoardroom(text){ return await show(text); }
  window.doBoardroom = doBoardroom;
  window.doDepartment = doDepartment;
})();
