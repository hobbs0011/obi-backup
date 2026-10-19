/* ============================================================================
   THE OFFER DESK — the register of everyone who said yes  (src/offers.js)

   The free-website offer has been made to a number of people. Some have said
   yes. They are not the same business: a coach selling a curriculum, a personal
   trainer, a guesthouse, a hotel, a reggae bar. The whole reason THE DROP
   (src/offer-desk/) is dynamic is that ONE link has to serve all of them, and
   this file is the other half of that: the register that says WHO said yes,
   WHAT they are, WHAT they have given, WHAT they still owe, and WHAT the one
   next action is.

   It is deliberately small. It holds no content — the footage, the answers, the
   reel and the brief all live in the bundle that comes back, and every word the
   person said is captured as SOUL (L37) in the moment it arrives. This is the
   index, not the archive.

   WHERE THE DATA LIVES, AND WHY

     kv folder "offers" — this browser, this generator's origin, nobody else's.
     A lead is a real person with a real phone number. NOTHING about them goes
     into src/ (BRAND.028): the source tree is public and ships, the register is
     not. The code below knows the SHAPE of a lead and nothing about any of them.

   COMMANDS

     /offers                     the board — every acceptor, grouped by trade
     /offer <label>              create it, or open it
     /offer desk <label>         THE DROP link to send them, read for their trade
     /offer trade <label> <id>   set their trade (drives the desk and the build)
     /offer got <label> <what>   record what they have given (video · links · answers · drive · footage)
     /offer need <label> <what>  record what is still owed, in one line
     /offer live <label> <url>   the page is live at this url
     /offer sent <label>         the page/bundle went to them
     /offer note <label> <text>  one line of history
     /offer drop <label>         remove the record (says what is kept)
     /offer trades               every trade the desk knows, and what each needs

   FAIL CLOSED: a lead whose trade is unset is shown as UNSET and the desk link
   is refused rather than guessed, because a wrong guess about someone's business
   produces a page confidently about the wrong thing. A lead whose desk URL is
   unknown is shown as having no link yet — never a made-up one.
   ========================================================================== */
(function(){
"use strict";

const VERSION = "1.0";
const FOLDER = "offers";

/* the same trade ids the desk's src/trades.js uses — one vocabulary in two places */
const TRADES = [
  { id:"coach",   label:"a coach selling a programme" },
  { id:"trainer", label:"a personal trainer or a small studio" },
  { id:"hotel",   label:"a hotel or guesthouse" },
  { id:"hostel",  label:"a hostel, guesthouse or bar with a crowd" },
  { id:"cafe",    label:"a café or a restaurant" },
  { id:"salon",   label:"a salon, barber or beauty studio" },
  { id:"trades",  label:"a trade — a builder, plumber, electrician or repair" },
  { id:"shop",    label:"a shop or something sold online" },
  { id:"other",   label:"something not on this list yet" }
];

/* The desk's own host. It is EMPTY until /offer release has actually put a page
   somewhere and read it back — because a register that prints a link nobody can
   open is worse than a register that says there is no link yet. /offer release
   sets it; /offer url <url> overrides it. */
const DEFAULT_DESK = "";

const STATUS_ORDER = ["accepted","material","built","sent","live","paused"];
const STATUS_LABEL = {
  accepted:"SAID YES", material:"MATERIAL IN", built:"PAGE BUILT",
  sent:"SENT", live:"LIVE", paused:"PAUSED"
};

/* ---------------------------------------------------------------- helpers */
function kv(){ if(!root || !root.kv) throw new Error("kv-plugin not loaded (main.pjs)"); return root.kv[FOLDER]; }
function slug(s){ return String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }
function e(s){ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s); }
function fmt(t){ try{ return new Date(t).toLocaleDateString(); } catch(x){ return "?"; } }
function say(html){ if(typeof addBubble === "function") addBubble("ass", html); }
function log(line){ try{ rrlAppend(runNoOf(), "DNA", "Obi: " + line); }catch(err){} }
function tradeOf(id){ return TRADES.filter(function(t){ return t.id === id; })[0] || null; }

async function all(){
  let pairs = [];
  try{ pairs = await kv().entries(); }catch(err){ return []; }
  return pairs.map(function(p){ return p[1] || p[0]; })
    .filter(function(v){ return v && v.id && v.id !== "meta"; })
    .sort(function(a, b){ return (b.updated || 0) - (a.updated || 0); });
}
async function get(id){
  const k = slug(id);
  if(!k) return null;
  try{ const v = await kv().get(k); return (v && v.id) ? v : null; }catch(err){ return null; }
}
async function put(lead){
  lead.updated = Date.now();
  await kv().set(lead.id, lead);
  return lead;
}
async function meta(){
  try{ const m = await kv().get("meta"); return m || null; }catch(err){ return null; }
}
async function setMeta(patch){
  const m = (await meta()) || { id:"meta" };
  Object.assign(m, patch || {});
  try{ await kv().set("meta", m); }catch(err){}
  return m;
}
async function deskUrl(){
  const m = await meta();
  return (m && m.desk) || DEFAULT_DESK || null;
}

/* ---------------------------------------------------------------- create */
async function open(label){
  const raw = String(label || "").trim();
  if(!raw){ await board(); return null; }
  const id = slug(raw) || "lead";
  let lead = await get(id);
  if(!lead){
    lead = {
      id:id, who:raw.slice(0, 60), trade:null, where:"", channel:"", contact:"",
      status:"accepted", gave:[], need:[], links:[], notes:[],
      soulAt:null, built:null, live:null, sentAt:null, created:Date.now(), updated:Date.now()
    };
    try{ await put(lead); }catch(err){ say("⚠ Could not create the register entry: " + e(err.message)); return null; }
    log("[offer " + raw + " — recorded as SAID YES]");
  }
  await card(lead, { created: !!(lead && lead.created && Date.now() - lead.created < 4000) });
  return lead;
}

/* ---------------------------------------------------------------- cards */
function row(k, v, d, cls){
  return '<div class="rrow' + (cls ? " " + cls : "") + '"><b>' + e(k) + '</b><span class="vd">' + v
    + '</span><div class="rd">' + d + "</div></div>";
}
async function card(lead, opts){
  opts = opts || {};
  const t = lead.trade ? tradeOf(lead.trade) : null;
  const url = await deskUrl();
  const desk = (t && url) ? url + "?t=" + encodeURIComponent(t.id) + (lead.who ? "&who=" + encodeURIComponent(lead.who) : "")
                 : "";
  const gave = lead.gave.length ? lead.gave.map(function(x){ return "✔ " + e(x); }).join("<br>") : '<span class="rd">nothing recorded yet</span>';
  const need = lead.need.length ? lead.need.map(function(x){ return "○ " + e(x); }).join("<br>") : '<span class="rd">nothing owed</span>';
  const L = '<div class="rise tr-card"><div class="rhead">◈ /offer — ' + e(lead.who) + "</div>"
    + row("TRADE", t ? e(t.id).toUpperCase() : '<span class="bad">UNSET</span>',
        t ? e(t.label) + " — the desk reads itself for this one"
          : "the desk link is REFUSED until this is set (<b>/offer trade " + e(lead.id) + " &lt;id&gt;</b>). A guess about someone's business is worse than a gap.")
    + row("STATUS", e(STATUS_LABEL[lead.status] || lead.status), (lead.where ? e(lead.where) + " · " : "")
        + (lead.channel ? "via " + e(lead.channel) : "channel not recorded")
        + (lead.contact ? " · " + e(lead.contact) : ""))
    + row("HAS GIVEN", lead.gave.length ? String(lead.gave.length) : "0", gave)
    + row("STILL OWED", lead.need.length ? String(lead.need.length) : "0", need)
    + (lead.links.length ? row("LINKS", String(lead.links.length), lead.links.map(e).join("<br>")) : "")
    + (desk ? row("THE LINK TO SEND", "DROP", '<span class="rd-mono" style="word-break:break-all">' + e(desk) + "</span>")
            : row("THE LINK TO SEND", '<span class="warn">NONE YET</span>',
                url ? "the trade has to be set before a link can be read for it (<b>/offer trade " + e(lead.id) + " &lt;id&gt;</b>)"
                    : "THE DROP has no host yet, so there is nothing to send. <b>/offer release</b> builds the page and puts it live, and only then does a link appear here — a link that cannot be opened is not printed."))
    + (lead.live ? row("LIVE AT", "200", '<span class="rd-mono" style="word-break:break-all">' + e(lead.live) + "</span>") : "")
    + (lead.soulAt ? row("SOUL", "HELD", "their words were captured verbatim at the moment they arrived — " + e(fmt(lead.soulAt))) : "")
    + (lead.notes.length ? row("HISTORY", String(lead.notes.length), lead.notes.slice(-4).map(function(x){ return e(x); }).join("<br>")) : "")
    + row("RECORD", e(lead.id), "created " + e(fmt(lead.created)) + " · kv folder \"" + FOLDER
        + "\" · this browser only. No name, number or word about them is in the source tree.")
    + '<div class="rfoot">'
    + '<button class="ci-act" data-offer="' + e(lead.id) + '" data-do="desk">◈ the link</button> '
    + '<button class="ci-act" data-offer="' + e(lead.id) + '" data-do="trade">◆ trade</button> '
    + '<button class="ci-act" data-offer="' + e(lead.id) + '" data-do="got">✔ has given</button> '
    + '<button class="ci-act" data-offer="' + e(lead.id) + '" data-do="need">○ still owed</button> '
    + '<button class="ci-act" data-offer="' + e(lead.id) + '" data-do="sent">✉ sent</button>'
    + "</div></div>";
  say(L);
  wire();
}

function wire(){
  document.querySelectorAll("[data-offer][data-do]").forEach(function(b){
    b.onclick = function(){
      const id = b.dataset.offer, v = b.dataset.do;
      const usage = {
        desk: "/offer desk " + id,
        trade: "/offer trade " + id + " <" + TRADES.map(function(t){ return t.id; }).join("|") + ">",
        got: "/offer got " + id + " <what they gave>",
        need: "/offer need " + id + " <what is still owed>",
        sent: "/offer sent " + id
      }[v];
      say('<div class="rise"><div class="rrow"><b>TYPE THIS</b><span class="vd">' + e(usage) + '</span>'
        + '<div class="rd">The register takes commands rather than buttons, so every change is a line in the chat and therefore in the record — the same reason nothing here happens silently.</div></div></div>');
    };
  });
}

/* ---------------------------------------------------------------- the board */
async function board(){
  const leads = await all();
  const url = await deskUrl();
  if(!leads.length){
    say('<div class="rise tr-card"><div class="rhead">◈ /offers — the free-website offer</div>'
      + row("ACCEPTED", "0", "nobody is on the register yet")
      + row("START ONE", "1", '<b>/offer &lt;name&gt;</b> — the name you would say out loud, so <b>/offer The Coach</b>')
      + row("WHY IT IS DYNAMIC", "1 LINK", url
          ? 'Every trade gets the SAME link: <span class="rd-mono">' + e(url)
            + "</span> — the desk reads itself for a coach, a trainer, a guesthouse, a bar, a café. One app, sent to everyone, no per-client build of the sender's side."
          : "One app, sent to everyone: the desk reads itself for a coach, a trainer, a guesthouse, a bar, a café. It has <b>no host yet</b> — <b>/offer release</b> builds it and puts it live, and the links appear here once the page has been read back.")
      + '<div class="rfoot">THE DROP is <b>src/offer-desk/</b>. The person opening it drops their footage, links and words; their own browser measures the footage and renders their reel; one bundle comes back. Nothing they send is uploaded to any server.</div></div>');
    return;
  }
  const byTrade = {};
  leads.forEach(function(l){ const k = l.trade || "UNSET"; (byTrade[k] = byTrade[k] || []).push(l); });
  const groups = Object.keys(byTrade).sort(function(a, b){
    if(a === "UNSET") return 1; if(b === "UNSET") return -1;
    return byTrade[b].length - byTrade[a].length || a.localeCompare(b);
  });
  const counts = STATUS_ORDER.map(function(s){
    const n = leads.filter(function(l){ return l.status === s; }).length;
    return n ? '<b>' + n + '</b> ' + STATUS_LABEL[s].toLowerCase() : null;
  }).filter(Boolean).join(" · ");
  const L = ['<div class="rise tr-card"><div class="rhead">◈ /offers — everyone who said yes</div>'];
  L.push(row("ACCEPTED", String(leads.length), counts || "accepted"));
  L.push(row("TRADES", String(groups.filter(function(g){ return g !== "UNSET"; }).length),
    groups.map(function(g){
      const t = tradeOf(g);
      return (g === "UNSET" ? '<span class="bad">UNSET</span> ' : "") + "<b>" + byTrade[g].length + "</b> × " + e(t ? t.label : "(trade not set)");
    }).join("<br>")));
  groups.forEach(function(g){
    const t = tradeOf(g);
    const rows = byTrade[g].map(function(l){
      const owed = l.need.length ? l.need.length + " owed" : "nothing owed";
      return "<b>" + e(l.who) + "</b> <span class=\"rd\">" + (STATUS_LABEL[l.status] || l.status).toLowerCase() + "</span>"
        + " · gave " + l.gave.length + " · " + owed
        + (l.live ? ' · <span class="ok">live</span>' : "")
        + " · <b>/offer " + e(l.who) + "</b>";
    }).join("<br>");
    L.push(row(g === "UNSET" ? "UNSET" : g.toUpperCase(), t ? String(byTrade[g].length) : '<span class="bad">' + byTrade[g].length + "</span>",
      rows + (t ? '<br><span class="rd">' + e(t.label) + "</span>" : '<br><span class="rd">these have no trade, so the desk cannot read itself for them — set it with <b>/offer trade &lt;name&gt; &lt;id&gt;</b></span>')));
  });
  L.push(row("THE LINK", url ? "DROP" : '<span class="warn">NONE YET</span>', url
    ? '<span class="rd-mono" style="word-break:break-all">' + e(url) + "</span> — one link for every trade on this board"
    : "THE DROP has no host yet. <b>/offer release</b> builds the page and deploys it; a link appears here only after it has been read back."));
  L.push('<div class="rfoot">Set the link with <b>/offer url &lt;url&gt;</b> · the trade vocabulary with <b>/offer trades</b> · open one with <b>/offer &lt;name&gt;</b>. '
    + "Nothing on this board is guessed: an unset trade stays unset, and a missing link says there is no link yet.</div></div>");
  say(L.join(""));
  log("[/offers — " + leads.length + " acceptor(s), " + groups.length + " trade group(s)]");
}

/* ---------------------------------------------------------------- trades */
async function trades(){
  const url = await deskUrl();
  const L = ['<div class="rise tr-card"><div class="rhead">◈ /offer trades — the vocabulary the desk reads</div>'];
  L.push(row("TRADES", String(TRADES.length), "the same list the desk ships (src/offer-desk/src/trades.js). One id, two places: this register and the page."));
  TRADES.forEach(function(t){
    L.push(row(t.id.toUpperCase(), t.label, url
      ? '<span class="rd-mono" style="word-break:break-all">' + e(url) + "?t=" + e(t.id) + "</span> — the same link, read for this trade"
      : "the id that makes the same link read as this trade (<b>?t=" + e(t.id) + "</b>) — no host yet, so no page: <b>/offer release</b>"));
  });
  L.push('<div class="rfoot">Why dynamic: a coach\'s page has to be searchable by a buyer choosing a programme; a hostel\'s has to show the room and the evening; a guesthouse\'s has to answer the room, the price and the door. The trade decides the shots they are asked for, the questions they must answer, and the channels a stranger will find them by. Nothing is guessed: an id not on this list is refused rather than rounded to the nearest one.</div></div>');
  say(L.join(""));
}

/* ---------------------------------------------------------------- commands */
async function command(arg){
  const parts = String(arg || "").trim().split(/\s+/).filter(Boolean);
  const op = (parts[0] || "").toLowerCase();
  const rest = parts.slice(1);
  const tail = function(n){ return rest.slice(n).join(" ").trim(); };
  /* the command words, named once. `/offer <name>` creates, so an op is normally just
     the first word of somebody's name — which is why an unknown op has to be treated
     carefully (see the guard below). */
  const OP_WORDS = ["desk", "trade", "got", "need", "live", "sent", "note", "drop"];

  if(!op) return board();
  if(op === "trades" || op === "trade-list") return trades();
  if(op === "release" || op === "deploy" || op === "ship") return release();
  if(op === "file" || op === "html" || op === "download") return offerFile();
  if(op === "url" || op === "link-host"){
    const u = tail(0);
    if(!u){ const m = await deskUrl(); say("The desk link is <b>" + e(m) + "</b>. Change it with <b>/offer url &lt;url&gt;</b>."); return; }
    await setMeta({ desk: u });
    say("✅ The desk link is now <b>" + e(u) + "</b> — every trade link is built from it.");
    log("[/offer url — " + u + "]");
    return;
  }

  const who = rest[0];
  if(!op || !who){
    /* a command named with nothing after it is a usage error, not a request for the
       whole board — the board is what `/offers` is for. */
    if(OP_WORDS.indexOf(op) !== -1){
      say("Usage: <b>/offer " + e(op) + " &lt;name&gt;</b>" + (op === "trade" ? " &lt;trade-id&gt;" : ""));
      return;
    }
    /* ONE WORD IS THE DOCUMENTED WAY TO OPEN A LEAD — `/offer jett-ro` — and this is the
       instruction the board itself prints. It used to fall through to the board, so the
       one-word form never opened anything. Measured 2026-09-24 (the A→Z sweep). */
    return open(op);
  }
  const lead = await get(who);
  if(!lead && OP_WORDS.indexOf(op) !== -1){
    say('⚠ No lead called <b>' + e(who) + "</b> on the register. Start it with <b>/offer " + e(who) + "</b>, then set its trade.");
    return;
  }
  /* AN UNKNOWN OP IN FRONT OF A REAL LEAD IS A TYPO, NOT A NEW PERSON.
     `/offer <name>` is how a lead is created, so any first word can be a name — but if
     that first word is not a command AND it is ALREADY on the register, nobody means to
     create a person out of the pair: they mistyped a sub-command, and without this guard
     the call falls through to the create path and makes a phantom `dexk-jett-ro` beside
     the real one. Measured 2026-09-24 (the A→Z sweep). Fail closed, name the vocabulary,
     create nothing and change nothing. */
  if(lead && OP_WORDS.indexOf(op) === -1){
    say('⚠ <b>' + e(op) + "</b> is not a command, and <b>" + e(lead.who) + "</b> is already on the register — so this reads as a mistyped command rather than a new person, and <b>nothing was created and nothing was changed</b>.<br>"
      + "The commands are: <b>" + OP_WORDS.join("</b> · <b>") + "</b> — for example <b>/offer desk " + e(lead.id) + "</b>. To record a genuinely new person, use a name that is not already here.");
    log("[/offer " + op + " — refused: an unknown command in front of an existing lead (" + lead.id + ")]");
    return;
  }

  if(op === "desk"){
    const t = lead.trade ? tradeOf(lead.trade) : null;
    const url = await deskUrl();
    if(!t){
      say('⚠ <b>' + e(lead.who) + "</b> has no trade set, so there is no link to send. The desk reads itself for the trade, and a guess would produce a page confidently about the wrong business. Set it: <b>/offer trade " + e(lead.id) + " coach|trainer|hotel|hostel|cafe|salon|trades|shop|other</b>.");
      return;
    }
    if(!url){
      say('⚠ There is no desk link yet, because THE DROP has not been put anywhere. <b>/offer release</b> builds it and deploys it; until that succeeds and the page is read back, the register will not print a link that cannot be opened.');
      return;
    }
    const link = url + "?t=" + encodeURIComponent(t.id) + (lead.who ? "&who=" + encodeURIComponent(lead.who) : "");
    say('<div class="rise tr-card"><div class="rhead">◈ THE LINK — ' + e(lead.who) + "</div>"
      + row("SEND THIS", "1 LINK", '<span class="rd-mono" style="word-break:break-all">' + e(link) + "</span>")
      + row("WHAT IT DOES", e(t.id).toUpperCase(), "opens as " + e(t.label) + ": their shots, their questions, their page's parts, in their trade's words")
      + row("WHAT THEY DO", "4 STEPS", "0 read their trade · 1 shoot six frames · 2 drop the footage and their links · 3 the reel, rendered on their own device · 4 one bundle back")
      + row("WHAT YOU GET", "1 FILE", "the reel, the cover, the contact sheet, every still, their voice notes, their answers, their links, and the brief — nothing invented")
      + '<div class="rfoot">Nothing they drop leaves their device unless they send it. The desk does not read their links (a browser is not allowed to read other people\'s pages cross-wise); the reading happens here, on the research hand.</div></div>');
    log("[/offer desk " + lead.id + " — link read for " + t.id + "]");
    return;
  }

  if(op === "trade"){
    const id = (rest[1] || "").toLowerCase();
    const t = tradeOf(id);
    if(!t){
      say('⚠ <b>' + e(id || "(nothing)") + "</b> is not in the vocabulary, so it is refused rather than rounded to the nearest trade.<br>"
        + "The ids are: <b>" + TRADES.map(function(x){ return x.id; }).join("</b> · <b>") + "</b>. See them with <b>/offer trades</b>.");
      return;
    }
    lead.trade = t.id;
    lead.notes.push(fmt(Date.now()) + " — trade set: " + t.id);
    await put(lead);
    say("✅ <b>" + e(lead.who) + "</b> reads as <b>" + e(t.label) + "</b>. The desk link is now live for them — <b>/offer desk " + e(lead.id) + "</b>.");
    log("[/offer trade " + lead.id + " → " + t.id + "]");
    return;
  }

  if(op === "got" || op === "need"){
    const what = tail(1);
    if(!what){ say("Usage: <b>/offer " + op + " " + e(lead.id) + " &lt;one line&gt;</b>"); return; }
    const list = (op === "got") ? lead.gave : lead.need;
    list.push(what);
    if(op === "got"){
      if(lead.status === "accepted") lead.status = "material";
      /* a thing owed becoming a thing given */
      const i = lead.need.findIndex(function(x){ return x.toLowerCase() === what.toLowerCase(); });
      if(i !== -1) lead.need.splice(i, 1);
    }
    lead.notes.push(fmt(Date.now()) + " — " + (op === "got" ? "gave: " : "owed: ") + what);
    await put(lead);
    await card(lead, {});
    log("[/offer " + op + " " + lead.id + "]");
    return;
  }

  if(op === "live"){
    const u = tail(1);
    if(!u){ say("Usage: <b>/offer live " + e(lead.id) + " &lt;url&gt;</b>"); return; }
    lead.live = u;
    lead.status = "live";
    lead.notes.push(fmt(Date.now()) + " — live at " + u);
    await put(lead);
    await card(lead, {});
    log("[/offer live " + lead.id + "]");
    return;
  }

  if(op === "sent"){
    lead.sentAt = Date.now();
    if(lead.status !== "live") lead.status = "sent";
    lead.notes.push(fmt(Date.now()) + " — went to them");
    await put(lead);
    await card(lead, {});
    log("[/offer sent " + lead.id + "]");
    return;
  }

  if(op === "note"){
    const t = tail(1);
    if(!t){ say("Usage: <b>/offer note " + e(lead.id) + " &lt;one line&gt;</b>"); return; }
    lead.notes.push(fmt(Date.now()) + " — " + t);
    await put(lead);
    say("✎ noted on <b>" + e(lead.who) + "</b>: " + e(t));
    return;
  }

  if(op === "drop"){
    if(!window.confirm("Remove the register entry for '" + lead.who + "'? Their words stay in the soul ledger, and nothing they sent lives here — the footage and answers were never on this device unless you filed them.")) return;
    try{ await kv().delete(lead.id); }catch(err){ say("⚠ Could not remove it: " + e(err.message)); return; }
    say("🗑 Removed <b>" + e(lead.who) + "</b> from the register. Nothing else changed: the soul capture of their words is untouched, and no material was held here.");
    log("[/offer drop " + lead.id + "]");
    return;
  }

  /* anything else is a name: open it, EXACTLY as it was typed — a person's name
     is not lower-cased into a slug anywhere but its id */
  return open(String(arg || "").trim());
}

/* ---------------------------------------------------------------- release */
/* THE DESK GOES LIVE

   The page a client opens has to be ONE file that cannot 404: a link sent to a
   stranger must not depend on a relative path that happens to be right on the
   day. So the release INLINES the desk — its stylesheet, its trades, its
   bundler, the measurement engine, the render engine — into a single HTML and
   deploys that as a Cloudflare Worker, which is the same machinery the station
   already uses for /cf deploy.

   The source of truth stays src/offer-desk/ (six readable files). The build is
   a mechanical inline, done here, at release time, so the deployed page can
   never drift from the files by hand.

   It then FETCHES the live URL and checks that the offer text is in what came
   back. A deploy that was not verified is reported as a deploy that was not
   verified — never as "live". */

const CF_BASE = "https://api.cloudflare.com/client/v4/accounts/";
const CF_ROOT = "https://api.cloudflare.com/client/v4/";
const RELEASE = {
  name: "the-drop-prais",
  dir: "src/offer-desk/",
  files: ["src/styles.css", "src/trades.js", "src/bundle.js", "src/pulse.js", "src/reel.js", "src/desk.js"],
  /* the probe is the string the release looks for when it reads the live page
     back. It is the opening line of the desk's own assessment (the headline in
     src/offer-desk/src/trades.js → OFFER.headline), so if that wording changes,
     this string changes with it or the release will report itself unverified. */
  probe: "A reading of what your business shows"
};

function cfToken(){
  try{ if(window.ObiVault && window.ObiVault.get) return window.ObiVault.get("cf"); }catch(e){}
  try{ return JSON.parse(localStorage.getItem("obi_keys") || "{}").cf || null; }catch(e){ return null; }
}
function cfAcct(){
  try{ if(window.ObiVault && window.ObiVault.get) return window.ObiVault.get("cfAcct"); }catch(e){}
  try{ return JSON.parse(localStorage.getItem("obi_keys") || "{}").cfAcct || null; }catch(e){ return null; }
}
/* The transport, and why it is two attempts: on the station's own desktop build
   (src/cloudflare/) api.cloudflare.com is reachable directly. Inside the perchance
   page it is not — the browser refuses the connection — but the fetch proxy is,
   and it passes the Authorization header and a PUT body through untouched (proven:
   a nonsense token came back as Cloudflare's own 9106 authentication failure, not
   as a proxy error). So: direct first, proxy second, and the report says WHICH one
   carried it, because "it deployed" and "the proxy said it deployed" are different
   claims. */
async function cfFetch(url, opts){
  const tries = [];
  try{
    const r = await fetch(url, opts);
    return { status:r.status, txt:await r.text(), via:"direct" };
  }catch(err){ tries.push("direct: " + ((err && err.message) || err)); }
  if(root && root.superFetch){
    try{
      const r = await root.superFetch(url, opts);
      return { status:r.status, txt:await r.text(), via:"the fetch proxy" };
    }catch(err2){ tries.push("proxy: " + ((err2 && err2.message) || err2)); }
  }
  return { status:0, txt:"", via:null, why:tries.join(" · ") };
}
function cfParse(res){
  let j = null;
  try{ j = JSON.parse(res.txt || ""); }catch(e){ j = null; }
  return j;
}
/* what Cloudflare itself says about the token, before anything is built or sent.
   AUDIT 2026-09-23 (the release): this asked ONLY /user/tokens/verify — the endpoint for
   USER-owned tokens. The sovereign's token is ACCOUNT-owned (created under the account), and
   that endpoint answers "Invalid API Token" for a token that is valid and active, so a working
   token was reported dead and THE DROP was blocked on a lie. The account endpoint is the
   authority for an account-owned token, so it is tried FIRST now; the user endpoint is the
   fallback (for a user-owned token), and whichever refuses last is the reason reported. Then
   the token is proven by the call the release actually makes — listing the account's worker
   scripts — because "active" is not the same claim as "allowed to deploy". */
async function tokenCheck(t, acct){
  const H = { method:"GET", headers:{ Authorization:"Bearer " + t } };
  let r = null, at = null;
  if(acct){
    r = await cfFetch(CF_BASE + acct + "/tokens/verify", H);
    if((cfParse(r) || {}).success) at = "the account endpoint";
  }
  if(!(r && (cfParse(r) || {}).success)){
    const u = await cfFetch(CF_ROOT + "user/tokens/verify", H);
    if((cfParse(u) || {}).success){ r = u; at = "the user endpoint"; }
    else r = u;   /* when neither works, the user endpoint's reason is the one to report */
  }
  const j = cfParse(r);
  if(!(j && j.success)){
    return { ok:false, via:r.via, at:at,
      why:(j && j.errors && j.errors[0] && j.errors[0].message) || r.why || (r.txt || "").slice(0, 160),
      note: acct ? null : "no account id is stored — /cf token <token> stores the account alongside it, and an account-owned token is verified AT the account, not at /user" };
  }
  let fleet = null;
  if(acct){
    const w = await cfFetch(CF_BASE + acct + "/workers/scripts", H);
    const wj = cfParse(w);
    fleet = (wj && wj.success) ? ((wj.result || []).length + " worker(s)") : ("the fleet could NOT be listed (HTTP " + w.status + ")");
  }
  return { ok:true, via:r.via, at:at, status:(j.result && j.result.status) || "active", fleet:fleet };
}

/* the one file: read the six real files, inline them, and hand back the page */
async function buildPage(){
  const read = async function(p){
    const r = await fetch(RELEASE.dir + p);
    if(!r.ok) throw new Error(p + " → HTTP " + r.status);
    return await r.text();
  };
  /* the script tag order in index.html IS the load order; the map is built from
     the page itself so a file added to the shell cannot be forgotten here. */
  let html = await read("index.html");
  const wanted = [];
  html.replace(/<script src="src\/([A-Za-z0-9_.-]+)"><\/script>/g, function(m, f){ wanted.push(f); return m; });
  if(!wanted.length) throw new Error("index.html has no <script src=\"src/…\"> tags — refusing to release a page with no code in it");
  const inline = {};
  for(const f of RELEASE.files.concat(wanted.filter(function(f2){ return RELEASE.files.indexOf("src/" + f2) === -1; }))){
    const rel = f.indexOf("src/") === 0 ? f.slice(4) : f;
    if(inline[rel] == null) inline[rel] = await read("src/" + rel);
  }
  const css = await read("src/styles.css");
  html = html.replace(/<link rel="stylesheet" href="src\/styles\.css">/, "<style>\n" + css + "\n</style>");
  let missing = [];
  html = html.replace(/<script src="src\/([A-Za-z0-9_.-]+)"><\/script>/g, function(m, f){
    if(inline[f] == null){ missing.push(f); return m; }
    /* a "</script" inside the code would end the element early; escaping the
       slash is legal inside every string literal the desk has, and is a no-op
       when there is none */
    return "<script>\n" + inline[f].replace(/<\/script/gi, "<\\/script") + "\n</" + "script>";
  });
  if(missing.length) throw new Error("these files are on the page but could not be read: " + missing.join(", "));
  return { html:html, bytes:html.length, inlined:Object.keys(inline).length };
}

async function release(){
  const t = cfToken(), acct = cfAcct();
  if(!t || !acct){
    say("⚠ No Cloudflare token in this browser, so nothing can be released. <b>/cf token &lt;token&gt;</b> first — and until it is set, the desk link above is a claim, not a page.");
    return { ok:false, blocked:true, why:"no token" };
  }
  say("📡 Releasing THE DROP — asking Cloudflare what it thinks of the token first…");
  const tok = await tokenCheck(t, acct);
  if(!tok.ok){
    say('<div class="rise tr-card"><div class="rhead">◈ THE DROP — release BLOCKED</div>'
      + row("TOKEN", '<span class="bad">REFUSED</span>', "Cloudflare says: <b>" + e(tok.why) + "</b>"
          + (tok.via ? " (asked via " + e(tok.via) + ")" : "") + (tok.at ? " — attempted at " + e(tok.at) : "")
          + (tok.note ? "<br>" + e(tok.note) : ""))
      + row("NOTHING HAPPENED", "0 BYTES", "no page was built into a worker, nothing was overwritten, and nothing was called live. The desk in the repo is unchanged.")
      + row("TO FIX", "1 COMMAND", "get a fresh API token at <b>dash.cloudflare.com → My Profile → API Tokens</b> with <b>Workers Scripts : Edit</b> (and Account Settings : Read), then <b>/cf token &lt;the new token&gt;</b>, then <b>/offer release</b> again.")
      + '<div class="rfoot">Fail closed: a deploy that could not authenticate is reported as blocked, never as live. The desk itself is finished and unchanged by this — only the host is missing.</div></div>');
    log("[/offer release — BLOCKED, the Cloudflare token was refused: " + tok.why + "]");
    return { ok:false, blocked:true, why:tok.why };
  }
  let built;
  try{ built = await buildPage(); }
  catch(err){ say("⚠ The build failed and NOTHING was deployed: " + e(err.message)); return { ok:false, why:String(err.message) }; }

  const sub = await cfFetch(CF_BASE + acct + "/workers/subdomain", { method:"GET", headers:{ Authorization:"Bearer " + t } });
  const subj = cfParse(sub);
  const suffix = (subj && subj.success && subj.result && subj.result.subdomain) || "mrmichaelhobbs123";
  const url = "https://" + RELEASE.name + "." + suffix + ".workers.dev";

  /* every path of this host answers with the page, and it may be read from
     anywhere — so the same release can be re-checked by the station itself */
  const body = 'addEventListener("fetch", event => {\n'
    + '  const html = ' + JSON.stringify(built.html) + ';\n'
    + '  event.respondWith(new Response(html, { headers: {\n'
    + '    "content-type": "text/html; charset=utf-8",\n'
    + '    "cache-control": "no-cache",\n'
    + '    "access-control-allow-origin": "*",\n'
    + '    "x-robots-tag": "noindex, nofollow"\n'
    + '  } }));\n});\n';

  const r = await cfFetch(CF_BASE + acct + "/workers/scripts/" + RELEASE.name, {
    method:"PUT", headers:{ Authorization:"Bearer " + t, "Content-Type":"application/javascript" }, body:body
  });
  const rj = cfParse(r);
  if(!(rj && rj.success)){
    const why = (rj && rj.errors && rj.errors[0] && rj.errors[0].message) || r.why || (r.txt || "").slice(0, 200);
    say("⚠ The deploy was REFUSED: " + e(why) + "<br><span class=\"rfoot\">Nothing is live. The page in the repo is unchanged and no file was touched. Carried via: " + e(r.via || "nowhere") + ".</span>");
    log("[/offer release — refused]");
    return { ok:false, why:why };
  }
  await cfFetch(CF_BASE + acct + "/workers/scripts/" + RELEASE.name + "/subdomain", {
    method:"POST", headers:{ Authorization:"Bearer " + t, "Content-Type":"application/json" }, body: JSON.stringify({ enabled:true })
  });

  /* MEASURED, NEVER ASSUMED: fetch the live page and look for the offer line */
  let live = { ok:false, why:"not fetched" };
  for(let i = 0; i < 5; i++){
    const got = await cfFetch(url + "/?release=" + Date.now(), { method:"GET", cache:"no-store" });
    if(got.status){
      const ok = got.status === 200 && got.txt.indexOf(RELEASE.probe) !== -1;
      live = { ok:ok, status:got.status, bytes:got.txt.length, via:got.via,
               why: got.status !== 200 ? ("HTTP " + got.status)
                    : (ok ? "the offer text is in what came back" : "200, but the offer text was NOT in the response") };
      if(ok) break;
    } else {
      live = { ok:false, why:"the fetch failed: " + e(got.why || "unknown") };
    }
    await new Promise(function(res){ setTimeout(res, 1200); });
  }

  if(live.ok) await setMeta({ desk: url + "/" });
  say('<div class="rise tr-card"><div class="rhead">◈ THE DROP — released</div>'
    + row("TOKEN", "ACCEPTED", "Cloudflare verified it at <b>" + e(tok.at || "an endpoint") + "</b>" + (tok.via ? " (asked via " + e(tok.via) + ")" : "")
        + (tok.fleet ? " · the account's fleet is readable: <b>" + e(tok.fleet) + "</b>" : ""))
    + row("BUILT", String(built.inlined) + " inline", "the six files in src/offer-desk/ inlined into one page of <b>" + e((built.bytes / 1024).toFixed(0)) + " KB</b> — one file, so a link sent to a stranger cannot 404 on a relative path")
    + row("DEPLOYED", e(r.via || "?"), "the same machinery as <b>/cf deploy</b>: one worker, no build step to forget, no CDN")
    + row("LIVE AT", live.ok ? "VERIFIED" : "UNVERIFIED", '<span class="rd-mono" style="word-break:break-all">' + e(url) + "</span> — "
        + e(live.why) + (live.bytes ? " (" + e(String(live.bytes)) + " bytes)" : ""))
    + row("THE LINK", live.ok ? "SET" : "NOT SET", live.ok
        ? "every trade link is now built from this: <b>/offer desk &lt;name&gt;</b>"
        : "the register still points at the old link — nothing is claimed about a page that was not read back")
    + '<div class="rfoot">' + (live.ok
      ? "This is measured, not assumed: the page was fetched back from the live URL and the offer text was found in it."
      : "<b>A deploy that was not verified is not called live.</b> Re-run <b>/offer release</b>, or open the URL yourself and see what it says.") + "</div></div>");
  log("[/offer release — " + (live.ok ? "live and verified at " + url : "deployed but UNVERIFIED: " + live.why) + "]");
  return { ok:true, url:url, live:live, bytes:built.bytes, via:r.via };
}

/* THE PAGE AS ONE FILE — for when the token is dead, or before there is a host
   at all. It is the same build the release deploys, handed over instead: one
   HTML file, 170 KB, that opens by double-click and needs no server. It is also
   exactly what Cloudflare Pages wants if the sovereign would rather drop it in
   by hand: dash → Workers & Pages → Create → Pages → Upload assets → drag it in
   → the project is live at <project>.pages.dev. */
function downloadOneFile(name, text){
  const blob = new Blob([text], { type:"text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ try{ a.remove(); URL.revokeObjectURL(url); }catch(e){} }, 4000);
}
async function offerFile(){
  let built;
  try{ built = await buildPage(); }
  catch(err){ say("⚠ The build failed: " + e(err.message)); return { ok:false, why:String(err.message) }; }
  downloadOneFile("the-drop.html", built.html);
  const url = await deskUrl();
  say('<div class="rise tr-card"><div class="rhead">◈ THE DROP — the page as one file</div>'
    + row("BUILT", (built.bytes / 1024).toFixed(0) + " KB", "the six files in src/offer-desk/ inlined into one HTML — no server, no dependencies, opens by double-click")
    + row("IT IS IN YOUR DOWNLOADS", "the-drop.html", "open it on a phone or a desktop and the whole desk runs: the trades, the shots, the drop, the measured pulse, the reel, the bundle")
    + row("TO MAKE IT LIVE ON CLOUDFLARE BY HAND", "2 MINUTES", "<b>dash.cloudflare.com</b> → <b>Workers &amp; Pages</b> → <b>Create</b> → <b>Pages</b> → <b>Upload assets</b> → drag <b>the-drop.html</b> in → deploy. Cloudflare serves it at <b>&lt;project&gt;.pages.dev</b>. (Rename it to <b>index.html</b> before the drag if the project asks for one.)")
    + row("TO MAKE IT LIVE FROM HERE", "1 COMMAND", "<b>/offer release</b> — it builds the same page and deploys it as a worker through the API, then fetches it back to check. That is blocked right now only because the token in the vault is refused by Cloudflare." + (url ? "" : ""))
    + row("THE LINK", url ? "SET" : '<span class="warn">NONE YET</span>', url
        ? '<span class="rd-mono" style="word-break:break-all">' + e(url) + "</span>"
        : "nothing is printed here until a host answers with the page — a link that cannot be opened is not a link")
    + '<div class="rfoot">Nothing about any person on the register is inside this file: it is the desk, not the data. Their words, footage and answers live in this browser and in the bundle they send back.</div></div>');
  log("[/offer file — built " + built.bytes + " bytes]");
  return { ok:true, bytes:built.bytes };
}

/* ---------------------------------------------------------------- exports */
const API = {
  version: VERSION, FOLDER, TRADES, DEFAULT_DESK, RELEASE,
  all: all, get: get, open: open, board: board, trades: trades, command: command,
  deskUrl: deskUrl, setDeskUrl: function(u){ return setMeta({ desk: u }); },
  tradeOf: tradeOf, release: release, buildPage: buildPage, tokenCheck: tokenCheck, file: offerFile
};
window.ObiOffers = API;
})();
