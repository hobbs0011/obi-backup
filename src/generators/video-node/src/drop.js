/* ============================================================================
   DROP — the conductor. Material goes in; a blueprint and an audit come out.

   THE FOUR DOORS (the sovereign's brief, verbatim): "the generator can be like
   this: Video Drop / Image Drop / Link Drop / Prompt Drop". So there are four
   ways in and they are not the same kind of thing:

     VIDEO  — footage. Measured (src/pulse.js), cut into clips on the peaks, read
              by the eye, and assembled into the reel (src/reel.js).
     IMAGE  — stills the client already has. Measured (size, aspect, bytes) and
              read by the eye on the contact sheet like anything else.
     LINK   — where they already ARE online: their site, their socials, their
              listing. Fetched live and READ (src/story.js → readOffering, with
              no model, so what comes back is what the page actually said), then
              CROSS-CHECKED — this file.
     PROMPT — the sovereign's own words: what this is, and what job it has.

   WHAT THIS FILE DOES THAT NOTHING ELSE IN THE NODE DOES:

     1. THE LINK AUDIT, IN CODE. "find any links missing from any current online
        branding or websites or socials they have". Every channel gets a verdict
        from evidence, not from a model: LINKED (a link to it is on their own
        site) · NAMED ONLY (their site says "follow us on Instagram" and never
        links it — a real, common, measurable loss) · GIVEN, NOT LINKED (they
        told us, their site does not) · ON THE SITE, NOT GIVEN · ABSENT. It also
        reports DISAGREEMENTS: a phone number that differs between their site and
        their listing, an address that does not match. A page that could not be
        read (a login wall) is named as unread, never silently counted as absent.

     2. THE RESEARCH, IN TWO HALVES THAT ARE NEVER MIXED. (a) WHAT WAS READ — the
        facts, each with the URL it came from. (b) THE MODEL'S KNOWLEDGE OF THE
        INDUSTRY — conventions and best practice, which is a PRIOR, not a
        measurement, and is labelled as one everywhere it appears. The register's
        honesty clause applies to research exactly as it applies to copy: no
        benchmark is quoted as a fact.

     3. THE BLUEPRINT — everything pulled together: identity, offer, audience,
        position, pillars, proof, the sections of the first prototype in order
        with the asset that fills each, what we have, what must be MADE, the links
        to add, and the copy. That document is the site's brief (?brief=).

     4. THE ORDERS AND THE AUDIT — "connect with the video, image and copy agents
        we have to audit, render and perfect all the content before the
        execution". Each missing asset becomes an ORDER addressed to the agent
        that can fill it (image · video · copy). Every asset, from every door,
        is then AUDITED: measured, with the threshold it was measured against,
        and a verdict — PASS · WARN · HOLE (missing) · FAIL (a rule broken). The
        copy audit is the register's own law enforced in code (BRAND.017: no
        number the offering does not state; no register example reused).

   FAIL CLOSED, ALWAYS: a page that would not load is unread, not empty; a
   channel that could not be checked is unproven, not absent; a number with no
   source is struck from the copy and named. Nothing here guesses on behalf of
   the client and then dresses the guess as research.
   ========================================================================== */
(function(){
  "use strict";

  const VERSION = "1.0";

  /* ============================================================ the channels
     What a presence is made of. Ordered the way a customer meets them: the
     site first, then the places they check it against. */
  const CHANNELS = [
    { id:"site",        label:"Website",        icon:"🌐", re:/./, rank:1 },
    { id:"instagram",   label:"Instagram",      icon:"◎", re:/(^|\.)instagram\.com$/i,     rx:/instagram/i },
    { id:"facebook",    label:"Facebook",       icon:"f", re:/(^|\.)facebook\.com$|(^|\.)fb\.com$/i, rx:/facebook/i },
    { id:"tiktok",      label:"TikTok",         icon:"♪", re:/(^|\.)tiktok\.com$/i,        rx:/tiktok/i },
    { id:"youtube",     label:"YouTube",        icon:"▶", re:/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, rx:/youtube/i },
    { id:"x",           label:"X / Twitter",    icon:"𝕏", re:/(^|\.)(x|twitter)\.com$/i,   rx:/(twitter|\bx\.com)/i },
    { id:"linkedin",    label:"LinkedIn",       icon:"in", re:/(^|\.)linkedin\.com$/i,     rx:/linkedin/i },
    { id:"pinterest",   label:"Pinterest",      icon:"p", re:/(^|\.)pinterest\.[a-z.]+$/i, rx:/pinterest/i },
    { id:"threads",     label:"Threads",        icon:"@", re:/(^|\.)threads\.(net|com)$/i, rx:/threads\.net/i },
    { id:"googlemaps",  label:"Google listing", icon:"📍", re:/(^|\.)(maps\.app\.goo\.gl|goo\.gl|google\.[a-z.]+)$/i, rx:/google maps|google listing|find us on google|maps\.app\.goo\.gl/i },
    { id:"whatsapp",    label:"WhatsApp",       icon:"✆", re:/(^|\.)(wa\.me|whatsapp\.com|api\.whatsapp\.com)$/i, rx:/whatsapp|wa\.me/i },
    { id:"telegram",    label:"Telegram",       icon:"➤", re:/(^|\.)(t\.me|telegram\.(me|org))$/i, rx:/telegram|t\.me/i },
    { id:"zalo",        label:"Zalo",           icon:"z", re:/(^|\.)zalo\.me$/i,            rx:/zalo/i },
    { id:"tripadvisor", label:"Tripadvisor",    icon:"◉", re:/(^|\.)tripadvisor\.[a-z.]+$/i, rx:/tripadvisor/i },
    { id:"booking",     label:"Booking site",   icon:"⌂", re:/(^|\.)(booking\.com|agoda\.[a-z.]+|hostelworld\.com|airbnb\.[a-z.]+|expedia\.[a-z.]+|trip\.com)$/i, rx:/booking\.com|hostelworld|agoda|airbnb/i },
    { id:"delivery",    label:"Delivery app",   icon:"🛵", re:/(^|\.)(foodpanda\.[a-z.]+|grab\.com|shopeefood\.vn|gojek\.com|deliveroo\.[a-z.]+|ubereats\.com|just-eat\.[a-z.]+)$/i, rx:/foodpanda|grab ?food|shopeefood|deliveroo|ubereats/i },
    { id:"menu",        label:"Menu / booking page", icon:"❑", re:/(^|\.)(linktr\.ee|beacons\.ai|taplink\.cc|calendly\.com|booksy\.com|opentable\.[a-z.]+|resy\.com|thefork\.[a-z.]+|sevenrooms\.com)$/i, rx:/linktr\.ee|beacons\.ai|taplink\.cc|calendly\.com|booksy\.com|opentable\.|resy\.com|thefork\.|sevenrooms\./i },
    { id:"email",       label:"Email",          icon:"✉", re:/^$/, rx:/[\w.+-]+@[\w.-]+\.\w+/ },
    { id:"phone",       label:"Phone",          icon:"☎", re:/^$/, rx:/\+\d[\d\s().-]{6,}\d/ }
  ];
  const CH = {};
  CHANNELS.forEach(function(c){ CH[c.id] = c; });
  const ORDER = CHANNELS.map(function(c){ return c.id; });

  function classify(raw){
    const s = String(raw || "").trim();
    if(!s) return CH.site;
    if(/^mailto:/i.test(s)) return CH.email;
    if(/^tel:/i.test(s)) return CH.phone;
    if(/^[\w.+-]+@[\w.-]+\.\w+$/.test(s)) return CH.email;
    /* a bare number is a phone, not a hostname — "+84 768 701 106" must not be
       looked up as a website */
    if(digits(s).length >= 8 && /^\+?[\d\s().-]+$/.test(s)) return CH.phone;
    const h = hostOf(/^https?:/i.test(s) ? s : "https://" + s);
    for(let i = 1; i < CHANNELS.length; i++){
      const c = CHANNELS[i];
      if(c.re && c.re.source !== "^$" && c.re.test(h)) return c;
    }
    return CH.site;
  }
  function hostOf(u){
    try{ return String(new URL(u).hostname || "").toLowerCase().replace(/^www\./, ""); }catch(e){ return ""; }
  }
  function norm(u){
    let s = String(u == null ? "" : u).trim();
    if(!s) return "";
    if(/^mailto:/i.test(s)) return s;
    if(/^tel:/i.test(s)) return s;
    if(/^[\w.+-]+@[\w.-]+\.\w+$/.test(s)) return "mailto:" + s;
    /* a telephone number is NOT a URL — prefixing it with https:// invents a
       hostname out of the digits and the spaces */
    if(digits(s).length >= 8 && /^\+?[\d\s().-]+$/.test(s)) return s;
    if(!/^https?:/i.test(s)) s = "https://" + s;
    try{ const x = new URL(s); x.hash = ""; return x.toString(); }catch(e){ return s; }
  }
  function absUrl(href, base){
    try{ return new URL(href, base || undefined).toString(); }catch(e){ return ""; }
  }
  /* every host a page links to, plus every href, both absolute */
  function linksOf(page){
    const out = [];
    (page && page.links || []).forEach(function(h){
      const a = absUrl(h, page.url);
      if(a) out.push(a);
    });
    return out;
  }
  function digits(s){ return String(s || "").replace(/[^\d]/g, ""); }

  /* --------------------------------------------------------- read the links */
  async function readUrls(urls, hooks){
    hooks = hooks || {};
    const seen = {};
    const list = [];
    (urls || []).forEach(function(u){
      const raw = String(u == null ? "" : u).trim();
      if(!raw) return;
      /* CLASSIFY THE RAW TEXT. "+84 768 701 106" is a telephone number, and
         prefixing it with https:// first would turn it into a hostname nobody
         ever gave — which is exactly how this node once reported four dead
         websites from one phone number. */
      const kind = classify(raw);
      const n = (kind.id === "phone") ? raw : norm(raw);
      const key = kind.id + "|" + n;
      if(!n || seen[key]) return;
      seen[key] = 1; list.push({ raw:raw, url:n, kind:kind });
    });
    const pages = [];
    for(let i = 0; i < list.length; i++){
      const url = list[i].url;
      const kind = list[i].kind;
      if(hooks.onStep) hooks.onStep(i, list.length, kind.label + " — " + url);
      if(kind.id === "email"){
        pages.push({ url:url, kind:kind, ok:true, handle:url.replace(/^mailto:/, ""), read:false,
                     why:"a way to be contacted — not a page, so there is nothing to read", words:0 });
        continue;
      }
      if(kind.id === "phone"){
        pages.push({ url:url, kind:kind, ok:true, handle:url, read:false,
                     why:"a way to be contacted — not a page, so there is nothing to read", words:0 });
        continue;
      }
      let r = null;
      try{ r = await window.Story.lookup(url); }
      catch(e){ r = { ok:false, why:((e && e.message) || String(e)) }; }
      if(!r || !r.ok){
        pages.push({ url:url, kind:kind, ok:false, read:false, why:(r && r.why) || "the page could not be read",
                     words:0, unread:true });
        if(hooks.onNote) hooks.onNote(kind.label + " could not be read: " + ((r && r.why) || "unknown") + " — it is recorded as UNREAD, never as absent");
        continue;
      }
      const thin = (r.words || 0) < 40;
      pages.push({
        url:url, kind:kind, ok:true, read:true, thin:thin, via:r.via, status:r.status,
        title:r.title || "", description:r.description || "", words:r.words || 0,
        headings:r.headings || [], items:r.items || [], prices:r.prices || [], phones:r.phones || [],
        addresses:r.addresses || [], links:r.links || [], text:r.text || "", found:r.found || {}
      });
      if(hooks.onNote)
        hooks.onNote(kind.label + " — read " + (r.words || 0) + " words · " + (r.found && r.found.headings || 0) + " section(s) · " +
                     (r.found && r.found.prices || 0) + " money line(s) · " + (r.found && r.found.phones || 0) + " contact(s)" +
                     (r.title ? " · “" + String(r.title).slice(0, 70) + "”" : ""));
      if(thin && hooks.onNote)
        hooks.onNote(kind.label + " — read, but it yielded almost nothing (" + (r.words || 0) + " words). A page that needs JavaScript or sits behind a login is read-but-thin, which is not evidence of much. Nothing is claimed from it.");
    }
    return pages;
  }

  /* ============================================================ the link audit
     CODE, NOT A MODEL. Every verdict below is a fact about what was fetched. */
  function auditLinks(pages, opts){
    opts = opts || {};
    const need = opts.need || [];                    /* channel ids the industry needs */
    const primary = (pages || []).filter(function(p){ return p.ok && p.kind.id === "site" && p.read; })
                                 .sort(function(a, b){ return a.url.length - b.url.length; })[0] || null;
    const siteText = primary ? (primary.text || "").toLowerCase() : "";
    const siteHosts = {};
    const siteHrefs = primary ? linksOf(primary) : [];
    siteHrefs.forEach(function(a){ const h = hostOf(a); if(h) siteHosts[h] = (siteHosts[h] || 0) + 1; });

    /* links found on their site that point at a channel — the site's own word */
    const found = {};
    siteHrefs.forEach(function(a){
      const k = classify(a);
      if(k.id === "site") return;
      found[k.id] = found[k.id] || [];
      found[k.id].push(a);
    });
    /* handle-shaped things the site names in its text without linking them */
    const namedIn = function(c){
      if(!siteText || !c.rx) return false;
      return c.rx.test(siteText);
    };

    const rows = [];
    ORDER.forEach(function(id){
      const c = CH[id];
      if(id === "site") return;
      const given = (pages || []).find(function(p){ return !p.unread && p.kind.id === id; }) || null;
      const linked = !!(found[id] && found[id].length);
      const named = !linked && namedIn(c);
      const needs = need.indexOf(id) >= 0;
      let verdict = "ABSENT";
      if(given && linked) verdict = "LINKED";
      else if(given && named) verdict = "GIVEN · NAMED ON THE SITE, NEVER LINKED";
      else if(given) verdict = "GIVEN · NOT LINKED FROM THE SITE";
      else if(linked) verdict = "ON THE SITE, NEVER GIVEN TO US";
      else if(named) verdict = "NAMED ON THE SITE, NEVER LINKED";
      const page = given && given.url ? given.url : (linked ? found[id][0] : "");
      if(!given && primary && !linked && !named && !needs) return;      /* not asked for, not there, not needed — noise */
      rows.push({ id:id, label:c.label, icon:c.icon, given:!!given, linked:linked, named:named, need:needs,
                  verdict:verdict, href:page, unread:!!(given && given.unread), thin:!!(given && given.thin),
                  why: given && given.unread ? "given, but the page could not be read — unproven, not absent"
                     : (given && given.thin ? "given and read, but the page yielded almost nothing (" + given.words + " words) — read-but-thin, so nothing is claimed from it"
                     : "") });
    });

    /* ---- disagreements: the same fact told two ways in two places ---- */
    const mismatches = [];
    const phoneAgg = {}, addrAgg = {};
    (pages || []).forEach(function(p){
      if(!p.ok || !p.read) return;
      (p.phones || []).forEach(function(x){
        const d = digits(x);
        if(d.length < 8) return;
        phoneAgg[d] = phoneAgg[d] || { set:{}, at:[] };
        phoneAgg[d].set[x.replace(/\s+/g, " ").trim()] = 1; phoneAgg[d].at.push(p.kind.label);
      });
      (p.addresses || []).forEach(function(x){
        const k = String(x).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
        if(k.length < 8) return;
        addrAgg[k] = addrAgg[k] || { set:{}, at:[] };
        addrAgg[k].set[String(x).trim()] = 1; addrAgg[k].at.push(p.kind.label);
      });
    });
    const phoneSets = Object.keys(phoneAgg).map(function(k){ return phoneAgg[k]; }).filter(function(g){ return Object.keys(g.set).length > 0; });
    if(phoneSets.length > 1){
      mismatches.push({ kind:"PHONE", detail:phoneSets.map(function(g){ return Object.keys(g.set).join(" / ") + " (" + uniq(g.at).join(", ") + ")"; }).join("  vs  "),
                        why:"the contact number is not the same everywhere it appears" });
    }
    const addrSets = Object.keys(addrAgg).map(function(k){ return addrAgg[k]; });
    if(addrSets.length > 1){
      mismatches.push({ kind:"ADDRESS", detail:addrSets.map(function(g){ return Object.keys(g.set)[0] + " (" + uniq(g.at).join(", ") + ")"; }).join("  vs  "),
                        why:"the address is not written the same way everywhere it appears" });
    }
    const unread = (pages || []).filter(function(p){ return p.unread; }).map(function(p){ return p.kind.label + " (" + p.url + ")"; });
    return {
      primary: primary ? primary.url : null,
      siteLinks: siteHrefs.length,
      siteHosts: Object.keys(siteHosts).length,
      rows: rows,
      missingFromSite: rows.filter(function(r){ return r.given && !r.linked; }),
      absentNeeded: rows.filter(function(r){ return !r.given && !r.linked && r.need; }),
      mismatches: mismatches,
      unread: unread
    };
  }
  function uniq(a){
    const seen = {}, out = [];
    (a || []).forEach(function(x){ if(!seen[x]){ seen[x] = 1; out.push(x); } });
    return out;
  }

  /* ============================================================ the research */
  const RESEARCH_ARC = [
    ["INDUSTRY",  "one line — what this business actually is, in plain words"],
    ["CUSTOMER",  "one line — who buys, described the way they would describe themselves"],
    ["THEY CHECK", "4-6 bullets — what a customer looks at before they buy in THIS industry, in the order they look"],
    ["BEST PRACTICE", "6-9 numbered lines — what the best operators in this industry actually do online. Specific and checkable, not 'be authentic'"],
    ["MUST HAVE", "one line per channel or page this industry needs to be findable and trusted, as `id — why`. Use these ids where they fit: " +
                  CHANNELS.map(function(c){ return c.id; }).join(", ")],
    ["QUICK WINS", "3-5 bullets — what THIS business could do this week, said in terms of what was actually read about them"],
    ["SOURCES READ", "one line per page that was read, as `url — what it is`. Never list a page that was not read"]
  ];
  function researchInstruction(){
    return "You are the research hand of a build engine (PrAis). Everything below THE MATERIAL was fetched live and read in code; it is what those pages actually say. " +
      "Your job is to turn that into the research a builder needs before a first prototype: what this business is, who buys, what those buyers check, and what the best " +
      "operators in this industry do online.\n" +
      "Answer in EXACTLY this shape, no preamble and no markdown:\n" +
      RESEARCH_ARC.map(function(a){ return a[0] + ": <" + a[1] + ">"; }).join("\n") + "\n" +
      "RULES:\n" +
      "· TWO KINDS OF STATEMENT, NEVER MIXED. Anything about THIS business must come from THE MATERIAL and be traceable to it. Anything about the INDUSTRY is your own " +
      "knowledge — write it plainly, and where you give a benchmark or a statistic mark it `(rule of thumb, not measured)`. Never invent a fact about this business, its " +
      "numbers, its competitors or its location.\n" +
      "· No number this business did not state, and none dressed as a measurement.\n" +
      "· If THE MATERIAL is thin, the research is thin and says so. A short honest answer beats a padded one.\n" +
      "· Plain sentences. No emoji. No hedging adverbs.";
  }
  function materialBlock(ctx){
    const L = [];
    const pr = ctx.prompt || {};
    L.push("THE PROMPT (the sovereign's own words, verbatim):");
    L.push(pr.text ? ("  " + String(pr.text).slice(0, 3000)) : "  (none given)");
    if(pr.job) L.push("  the job: " + String(pr.job).slice(0, 600));
    if(pr.name) L.push("  the name: " + pr.name);
    if(pr.industry) L.push("  the industry, as the owner describes it: " + pr.industry);
    L.push("");
    L.push("THE PAGES FETCHED LIVE (" + (ctx.pages || []).length + "):");
    (ctx.pages || []).forEach(function(p){
      L.push("  — " + p.kind.label + " · " + p.url);
      if(!p.ok || !p.read){ L.push("      NOT READ: " + (p.why || "unknown") + " (an unread page is not evidence of anything)"); return; }
      if(p.title) L.push("      title: " + p.title);
      if(p.description) L.push("      description: " + p.description);
      if(p.headings && p.headings.length) L.push("      sections: " + p.headings.slice(0, 12).join(" · "));
      if(p.items && p.items.length) L.push("      lists:\n        - " + p.items.slice(0, 22).join("\n        - "));
      if(p.prices && p.prices.length) L.push("      money: " + p.prices.slice(0, 12).join(" · "));
      if(p.phones && p.phones.length) L.push("      contacts: " + p.phones.slice(0, 6).join(" · "));
      if(p.addresses && p.addresses.length) L.push("      addresses: " + p.addresses.slice(0, 4).join(" · "));
      if(p.links && p.links.length) L.push("      outbound links: " + p.links.slice(0, 18).join(" "));
    });
    L.push("");
    L.push("THE LINK AUDIT (in code, from the fetches — a fact about what is and is not linked):");
    const al = ctx.linkAudit;
    if(al){
      if(al.primary) L.push("  their own site: " + al.primary + " — it links out to " + al.siteHosts + " host(s)");
      al.rows.forEach(function(r){
        L.push("  · " + r.label + " — " + r.verdict + (r.href ? " [" + r.href + "]" : "") + (r.need ? " (this industry needs it)" : ""));
      });
      al.mismatches.forEach(function(m){ L.push("  ! " + m.kind + " DISAGREEMENT: " + m.detail); });
      if(al.unread.length) L.push("  (unread pages, not evidence either way: " + al.unread.join(" · ") + ")");
    } else L.push("  (no link audit)");
    L.push("");
    L.push("THE MATERIAL THEY DROPPED:");
    L.push("  video: " + ((ctx.videos || []).length) + " file(s)" + (ctx.videos || []).map(function(v){ return " · " + v.name + " " + v.w + "x" + v.h + " " + (v.seconds || 0).toFixed(1) + "s"; }).join(""));
    L.push("  pictures: " + ((ctx.images || []).length) + " file(s)" + (ctx.images || []).map(function(i){ return " · " + i.name + " " + i.w + "x" + i.h; }).join(""));
    if(ctx.vibe) L.push("  what the eye saw in their footage: " + String(ctx.vibe).slice(0, 1400));
    return L.join("\n");
  }
  function researchPrompt(ctx){
    return [researchInstruction(), "", "THE MATERIAL", materialBlock(ctx),
            "", "THE TASK", "Write the research. Name the industry honestly — if THE MATERIAL does not say what this business is, say what the pages " +
            "do support and mark the rest as unknown."].join("\n");
  }
  function parseBlocks(text, keys){
    const t = String(text || "");
    const out = {};
    const up = keys.map(function(k){ return String(k).toUpperCase(); });
    keys.forEach(function(k){
      const re = new RegExp("^\\s*" + String(k).toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+") +
                            "\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:" + up.map(function(u){ return u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"); }).join("|") +
                            ")\\s*:|(?![\\s\\S]))", "im");
      const m = t.match(re);
      out[String(k).toUpperCase()] = m ? m[1].trim() : "";
    });
    return out;
  }
  function bullets(block){
    return String(block || "").split("\n").map(function(l){
      return l.replace(/^\s*(?:[-•*·]|\d+[.)])\s*/, "").trim();
    }).filter(Boolean);
  }
  function channelsFromResearch(text){
    const block = parseBlocks(text, ["MUST HAVE"])["MUST HAVE"] || "";
    const ids = [];
    bullets(block).forEach(function(l){
      const low = l.toLowerCase();
      CHANNELS.forEach(function(c){
        if(c.id === "site") return;
        if(ids.indexOf(c.id) >= 0) return;
        if(low.indexOf(c.id) >= 0 || low.indexOf(c.label.toLowerCase()) >= 0 || (c.rx && c.rx.test(low))) ids.push(c.id);
      });
    });
    return ids;
  }
  async function research(ctx, hooks){
    hooks = hooks || {};
    if(!window.root || !window.root.generateText) return { ok:false, why:"no generateText — no research is claimed" };
    const prompt = researchPrompt(ctx);
    let text = "";
    try{
      const p = window.root.generateText({
        instruction:prompt,
        onChunk:function(d){ text += d.textChunk; if(hooks.onChunk) hooks.onChunk(text); }
      });
      if(hooks.onJob) hooks.onJob(p);
      const res = await p;
      const final = String((res && res.text) || text || "").trim();
      if(!final) return { ok:false, why:"the research hand returned nothing" };
      const blocks = parseBlocks(final, RESEARCH_ARC.map(function(a){ return a[0]; }));
      return { ok:true, text:final, prompt:prompt, blocks:blocks,
               industry:blocks.INDUSTRY || "", customer:blocks.CUSTOMER || "",
               checks:bullets(blocks["THEY CHECK"]), practice:bullets(blocks["BEST PRACTICE"]),
               must:bullets(blocks["MUST HAVE"]), wins:bullets(blocks["QUICK WINS"]),
               sources:bullets(blocks["SOURCES READ"]), channels:channelsFromResearch(final) };
    }catch(e){ return { ok:false, why:"the research failed: " + ((e && e.message) || e), partial:text }; }
  }
  /* ============================================================ the blueprint */
  const BLUEPRINT_ARC = [
    ["IDENTITY",   "one line — what this is, in the words a customer would use"],
    ["OFFER",      "one line — the thing being sold, and the smallest true version of it"],
    ["AUDIENCE",   "one line — who it is for"],
    ["POSITION",   "one line — the two-part identity: the state they are in now, and the state after (the house kicker form)"],
    ["PILLARS",    "3 bullets — only what is actually used · a system that beats willpower · the people around you — written for THIS business"],
    ["PROOF",      "3 bullets — mechanism · disruption · outcome, each in this business's own terms and using only what was read"],
    ["PAGE",       "one line per section of the first prototype, in order, as `section — what it says — the asset that fills it (photo|video|copy|none)`"],
    ["ASSETS HAVE", "one line per asset we actually hold, as `slot — file — measured size`"],
    ["ASSETS NEED", "one line per asset the prototype needs and we do NOT have, as `slot — exactly what it must show`. Only ask for what the page truly needs"],
    ["LINKS TO ADD", "one line per link/channel that must be added or fixed, taken from the audit"],
    ["COPY",       "three lines: `HEADLINE: …` · `KICKER: …` · `CTA: …`. No number that was not read"],
    ["NEXT",       "one line — the single first thing to do to reach the prototype"]
  ];
  function blueprintInstruction(){
    return "You are the architect of a build engine (PrAis). Above is THE RESEARCH and THE AUDIT of one business: what was read live, what the industry does, and what is " +
      "missing. Your job is the BLUEPRINT for the first prototype — everything pulled together so a builder can start, and so the owner can check it.\n" +
      "Answer in EXACTLY this shape, no preamble and no markdown:\n" +
      BLUEPRINT_ARC.map(function(a){ return a[0] + ": <" + a[1] + ">"; }).join("\n") + "\n" +
      "RULES:\n" +
      "· Every fact about this business comes from THE MATERIAL or THE RESEARCH, and every number was read somewhere. A blueprint with an invented price or an invented " +
      "address is worthless, so write NO number that is not in THE MATERIAL.\n" +
      "· ASSETS NEED is an ORDER LIST, not a wish list. Each line must name the slot and what the asset must SHOW, because another agent is going to make it. " +
      "If nothing is missing, write `ASSETS NEED: none — everything the page needs is in hand`.\n" +
      "· Never ask for a photo of a thing the business does not do, and never ask for a stock-photo of an abstraction ('a feeling of welcome'). Ask for the real thing: " +
      "'the front of the building in daylight', 'a plated dish, from above', 'the two people who work the bar'.\n" +
      "· The PAGE is the running order of the first prototype and nothing more. Five to nine sections. Every section must earn its place or be cut.";
  }
  function blueprintPrompt(ctx){
    return [blueprintInstruction(), "",
            "THE PROMPT\n" + materialBlock(ctx),
            "",
            "THE RESEARCH\n" + String((ctx.research && ctx.research.text) || "(none)").slice(0, 6000),
            "",
            "THE TASK\nWrite the blueprint for the first prototype."].join("\n");
  }
  async function blueprint(ctx, hooks){
    hooks = hooks || {};
    if(!window.root || !window.root.generateText) return { ok:false, why:"no generateText — no blueprint is claimed" };
    const prompt = blueprintPrompt(ctx);
    let text = "";
    try{
      const p = window.root.generateText({
        instruction:prompt,
        onChunk:function(d){ text += d.textChunk; if(hooks.onChunk) hooks.onChunk(text); }
      });
      if(hooks.onJob) hooks.onJob(p);
      const res = await p;
      const final = String((res && res.text) || text || "").trim();
      if(!final) return { ok:false, why:"the architect returned nothing" };
      const b = parseBlocks(final, BLUEPRINT_ARC.map(function(a){ return a[0]; }));
      const copy = {};
      bullets(b.COPY).concat(String(b.COPY || "").split("·")).forEach(function(l){
        const m = l.match(/^\s*(HEADLINE|KICKER|CTA)\s*:\s*(.+)$/i);
        if(m) copy[m[1].toUpperCase()] = m[2].trim();
      });
      return { ok:true, text:final, prompt:prompt, blocks:b,
               page:bullets(b.PAGE), have:bullets(b["ASSETS HAVE"]), need:bullets(b["ASSETS NEED"]),
               links:bullets(b["LINKS TO ADD"]), pillars:bullets(b.PILLARS), proof:bullets(b.PROOF),
               copy:copy, next:b.NEXT || "" };
    }catch(e){ return { ok:false, why:"the blueprint failed: " + ((e && e.message) || e), partial:text }; }
  }

  /* ============================================================ the orders
     Each missing asset becomes an ORDER addressed to the agent that can fill it.
     The routing is a keyword read of what the slot needs — and every order says
     which agent it goes to and why, so nothing is silently claimed by the wrong
     hand. `none — …` is the honest "nothing is missing". */
  function ordersFor(bp, ctx){
    const out = [];
    const needs = (bp && bp.need) || [];
    needs.forEach(function(line){
      const low = line.toLowerCase();
      if(/^\s*none\b/.test(low)) return;
      const slot = (line.split(/[—–-]/)[0] || "").trim().slice(0, 60);
      const want = line.slice(slot.length).replace(/^[\s—–-]+/, "").trim().slice(0, 400);
      let agent = "image", why = "a still the page can hold";
      if(/\b(reel|clip|footage|video|film|time-?lapse|drone|motion)\b/.test(low)){ agent = "video"; why = "moving pictures — the video agent cuts and renders it"; }
      else if(/\b(copy|headline|text|wording|caption|bio|description|about us|faq|menu text)\b/.test(low)){ agent = "copy"; why = "words — the copy agent writes them in the house register"; }
      else if(/\b(logo|icon|mark|avatar|favicon|badge|crest)\b/.test(low)){ agent = "image"; why = "a mark — the image agent draws it"; }
      else if(/\b(banner|hero|og|social|cover|poster|thumbnail|card)\b/.test(low)){ agent = "image"; why = "a framed picture at a fixed size — the image agent makes it"; }
      out.push({ slot:slot, want:want, agent:agent, why:why,
                 prompt:promptFor(agent, slot, want, ctx) });
    });
    return out;
  }
  function promptFor(agent, slot, want, ctx){
    const id = (ctx && ctx.prompt && ctx.prompt.name) || "this business";
    if(agent === "copy")
      return "Write the copy for the " + slot + " section. What it must say: " + want + ". Register: " + id + "'s own words, second person, short, imperative, no number that was not read.";
    if(agent === "video")
      return "Produce " + slot + ": " + want + ". Use the footage already dropped if it shows this; otherwise say plainly that it does not and name what would have to be shot.";
    return "Photograph or render: " + want + " — for " + id + "'s " + slot + " slot. Real, specific, no text in the frame, no synthetic-looking people, no stock-photo abstractions.";
  }

  /* ============================================================ the assets table */
  function assetsTable(ctx){
    const rows = [];
    (ctx.videos || []).forEach(function(v){
      rows.push({ slot:v.name, kind:"video", agent:"video", measured:v.w + "×" + v.h + " · " + (v.seconds || 0).toFixed(1) + "s · " + (v.clips || 0) + " clip(s)" +
        (v.pulse ? " · pulse " + v.pulse.samples + " samples" : " · NOT measured") + (v.silent ? " · silent" : ""),
        w:v.w, h:v.h, seconds:v.seconds || 0, clips:v.clips || 0, pulse:!!v.pulse, silent:!!v.silent });
    });
    (ctx.images || []).forEach(function(i){
      rows.push({ slot:i.name, kind:"image", agent:"image", measured:i.w + "×" + i.h + " · " + (i.kb || 0) + " KB",
                  w:i.w, h:i.h, bytes:i.bytes || 0 });
    });
    (ctx.pages || []).forEach(function(p){
      rows.push({ slot:p.url, kind:"link", agent:"link",
                  measured:(p.read ? (p.words + " words read") : "NOT READ — " + (p.why || "unread")) + " · " + p.kind.label,
                  ok:!!p.read });
    });
    if(ctx.reel) rows.push({ slot:"the reel", kind:"video", agent:"video",
                             measured:(ctx.reel.container || "").toUpperCase() + " · " + (ctx.reel.seconds || 0).toFixed(1) + "s · " +
                                      Math.round((ctx.reel.bytes || 0) / 1024) + " KB · " + (ctx.reel.verified ? "read back playable" : "NOT verified") });
    if(ctx.made && ctx.made.length) ctx.made.forEach(function(m){
      rows.push({ slot:m.slot, kind:"image", agent:"image", measured:"made — " + (m.w || 0) + "×" + (m.h || 0) + " · " + Math.round((m.bytes || 0) / 1024) + " KB" });
    });
    return rows;
  }

  /* --------------------------------------------------------- has the hand answered?
     An ORDER is an asset the prototype needs. Until a hand fills it the audit
     carries it as a HOLE, and the gate is not allowed to say the build is ready.
     Once a hand has answered, the SAME order reads PASS and quotes what came
     back — so the audit is a picture of the state of the build, not a list of
     everything that was ever missing. */

  /* a slot and an asset name are compared loosely: "HERO — image" and "hero" are
     the same slot, and so are "Hero image" and "HERO". */
  function slotKey(s){
    return String(s == null ? "" : s).toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^the-/, "")
      .replace(/-(image|photo|picture|shot|reel|clip|video|copy|text|words)$/, "")
      .replace(/^-+|-+$/g, "");
  }
  function matchMade(slot, list){
    const k = slotKey(slot);
    if(!k) return null;
    const hit = (list || []).filter(function(x){ return slotKey(x.slot || x.name) === k; });
    return hit.length ? hit[hit.length - 1] : null;
  }
  function orderFilled(o, ctx){
    const agent = o.agent;
    if(agent === "image"){
      const m = matchMade(o.slot, (ctx.made || []).concat(ctx.images || []));
      if(m) return { ok:true, measured:"made — " + (m.w || 0) + "×" + (m.h || 0) + " · " + Math.round((m.bytes || 0) / 1024) + " KB",
                     why:"the image hand answered this order; it is in the build" };
      return { ok:false, why:"nothing to put here yet — the image hand has not made it" };
    }
    if(agent === "copy"){
      const st = ctx.story;
      if(!st) return { ok:false, why:"the words do not exist yet — the copy hand (the register) has not written them" };
      const bad = (st.violations || []).filter(function(x){ return x.verdict === "FAIL"; });
      if(bad.length) return { ok:false, why:"the copy was written but a hard rule broke in it: " + bad[0].where + " — it is withheld, so this slot is still empty" };
      /* say WHICH of the register's own beats answers this slot, so the human can
         check the line instead of taking "written" on trust */
      const BEAT = [["headline|hook|title|hero|strap", "HOOK"], ["kicker|sub|tag", "KICKER"], ["call|cta|action|book|contact", "CALL"],
                    ["caption|social|post", "CAPTION"], ["body|about|description|story", "BODY"], ["offer|price|deal", "OFFER"],
                    ["place|location|where", "PLACE"], ["proof|trust|review", "PROOF"], ["caption", "CAPTION"]];
      const low = String(o.slot + " " + o.want).toLowerCase();
      let beat = "";
      for(let i = 0; i < BEAT.length && !beat; i++){ if(new RegExp(BEAT[i][0], "i").test(low) && st.beats[BEAT[i][1]]) beat = BEAT[i][1]; }
      const written = (st.lines || []).filter(Boolean).length;
      return { ok:true,
               measured:(beat ? beat + " = “" + String(st.beats[beat]).slice(0, 80) + "”" : written + " line(s) of page copy") +
                        " · " + (st.filled || 0) + " beat(s) · no hard rule broken",
               why: beat ? "the register wrote it in the house voice, and its own law was checked in code"
                         : "the copy hand wrote the page's words in the house register; the register's own law was checked in code" };
    }
    /* video */
    if(ctx.reel) return { ok:true, measured:(ctx.reel.container || "").toUpperCase() + " · " + (ctx.reel.seconds || 0).toFixed(1) + "s · " +
                                               Math.round((ctx.reel.bytes || 0) / 1024) + " KB" + (ctx.reel.verified ? " · read back playable" : " · NOT verified"),
                          why:"the video hand rendered the footage into a film — this slot can take it" };
    const clips = (ctx.videos || []).reduce(function(a, v){ return a + (v.clips || 0); }, 0);
    return { ok:false, why: clips
      ? "there is footage (" + clips + " clip(s)) but nothing has been rendered into a film yet — the video hand has not answered this order"
      : "no footage was dropped that shows this, and the model's knowledge is not a substitute for a real shot" };
  }

  /* ============================================================ THE GATE
     The one question that matters after everything else has run: MAY THIS BE
     EXECUTED? The audit measures; the gate decides, and it is not allowed to be
     generous about it.

     FAIL is narrow on purpose: it is a fault in THIS NODE'S OWN OUTPUT — a claim
     it cannot stand behind (an invented number, a line that had to be withheld),
     or a file that will not play back. Only that can be fixed here, and only that
     BLOCKS. A missing asset is a HOLE: work not done, so the build is not ready,
     but nothing is wrong. And a defect in the client's existing site is a job the
     prototype is going to do — so it warns, and becomes an order. */
  function gate(auditData, ctx){
    const a = auditData || audit(ctx || {});
    const fails = a.fails, holes = a.holes;
    const reasons = [];
    fails.forEach(function(r){
      reasons.push({ level:"FAIL", text:(r.kind + " · " + r.asset + " — " + r.why + " [" + r.measured + "]") });
    });
    holes.forEach(function(r){
      reasons.push({ level:"HOLE", text:(r.kind + " · " + r.asset + " — " + r.why) });
    });
    const blocked = fails.length > 0;
    const complete = !blocked && holes.length === 0;
    const verdict = blocked ? "BLOCKED" : (complete ? "READY TO EXECUTE" : "NOT YET COMPLETE");
    /* things the client's own site gets wrong: not this node's fault, and not a
       reason to hold the prototype back — the prototype is where they get fixed */
    const fixes = a.warns.filter(function(r){ return r.kind === "link"; });
    return {
      ok: complete, blocked: blocked, verdict: verdict, reasons: reasons, fixes: fixes,
      fails: fails, holes: holes, warns: a.warns, passes: a.passes,
      line: blocked
        ? "BLOCKED — " + fails.length + " hard failure(s) in this node's own output. This must not be executed until they are fixed and re-audited."
        : (complete
            ? "READY TO EXECUTE — nothing in this node's output is broken and nothing the prototype needs is missing. " + a.passes.length + " thing(s) checked out." +
              (fixes.length ? " " + fixes.length + " fault(s) in the client's own site are listed below: the prototype is where they get fixed." : "")
            : "NOT YET COMPLETE — nothing is broken, but " + holes.length + " thing(s) the prototype needs are still missing. Named below, so nothing goes out with a hole in it.")
    };
  }

  /* ============================================================ THE AUDIT
     Every asset, measured, with the threshold it was measured against and a
     verdict. Thresholds are the node's own opinion and are stated as such —
     they are not industry law and are not presented as measurements. */
  const T = { videoShort:720, videoLong:1280, imageLong:1200, imageHero:1600, reelLongS:75, reelShortS:6 };
  function audit(ctx){
    const rows = [];
    const push = function(kind, asset, verdict, measured, why){ rows.push({ kind:kind, asset:asset, verdict:verdict, measured:measured, why:why }); };

    (ctx.videos || []).forEach(function(v){
      const short = Math.min(v.w || 0, v.h || 0);
      const aspect = (v.w && v.h) ? (v.w === v.h ? "1:1" : (v.h > v.w ? "9:16-ish" : "16:9-ish")) : "unknown";
      let verdict = "PASS", why = "usable at " + aspect;
      if(!short) { verdict = "HOLE"; why = "the file never gave the browser its dimensions"; }
      else if(short < T.videoShort){ verdict = "WARN"; why = "the short edge is under " + T.videoShort + "px — fine on a phone, soft on a desktop hero"; }
      if(v.silent){ verdict = verdict === "PASS" ? "WARN" : verdict; why += "; it has no audio (say so on the page, or put music under it)"; }
      if(!v.pulse){ verdict = "HOLE"; why += "; it was never measured, so nothing is claimed about where the life in it is"; }
      push("video", v.name, verdict, v.w + "×" + v.h + " · " + (v.seconds || 0).toFixed(1) + "s · " + (v.clips || 0) + " clip(s) cut · " + aspect, why);
    });

    (ctx.images || []).forEach(function(i){
      const long = Math.max(i.w || 0, i.h || 0);
      let verdict = "PASS", why = "fine for a card or a gallery tile";
      if(!long){ verdict = "HOLE"; why = "it would not decode"; }
      else if(long < T.imageLong){ verdict = "WARN"; why = "the long edge is under " + T.imageLong + "px — it will not carry a full-width hero"; }
      else if(long >= T.imageHero) why = "carries a full-width hero at 1× and 2× on a phone";
      push("image", i.name, verdict, i.w + "×" + i.h + " · " + (i.kb || 0) + " KB", why);
    });

    (ctx.linkAudit && ctx.linkAudit.rows || []).forEach(function(r){
      let verdict = "PASS", why = "a link to it is on their own site";
      /* A defect in the CLIENT'S EXISTING SITE is a job for the prototype, not a
         fault in the content this node produced — so it WARNS and becomes an
         order. Only a fault in the node's OWN output (below: an invented number,
         a withheld line, a file that will not play) is allowed to FAIL, because
         only that can be fixed here. */
      if(r.verdict.indexOf("NOT LINKED") >= 0 && r.given){ verdict = "WARN"; why = "they have it and their own site never links it — a customer cannot get there from where they land. The prototype must link it; the blueprint orders the fix."; }
      else if(r.verdict.indexOf("NAMED ON THE SITE") >= 0 && !r.given){ verdict = "WARN"; why = "their site names it in words and never links it"; }
      else if(r.verdict.indexOf("ON THE SITE, NEVER GIVEN") >= 0){ verdict = "WARN"; why = "it is on their site but they did not tell us about it — check who owns it"; }
      else if(r.unread){ verdict = "HOLE"; why = "the page could not be read — unproven, not absent"; }
      else if(r.verdict === "ABSENT" && r.need){ verdict = "HOLE"; why = "this industry needs it and it was not found anywhere"; }
      else if(r.verdict === "ABSENT"){ verdict = "WARN"; why = "not found by this sweep — that is not the same as not existing"; }
      push("link", r.icon + " " + r.label, verdict, r.verdict + (r.href ? " · " + r.href : ""), why);
    });

    (ctx.linkAudit && ctx.linkAudit.mismatches || []).forEach(function(m){
      push("link", m.kind + " DISAGREEMENT", "WARN", m.detail, m.why + " — one of the two is wrong, and a customer who rings the wrong one does not come back");
    });

    /* the copy audit — the register's own law, enforced in code */
    if(ctx.story){
      const v = (ctx.story.violations || []).slice();
      if(!v.length) push("copy", "the story", "PASS", (ctx.story.lines || []).filter(Boolean).length + " line(s) · " + ctx.story.filled + " beat(s)", "no hard rule was broken: every number was read, and no register example was reused");
      v.forEach(function(x){
        push("copy", x.rule, x.verdict === "FAIL" ? "FAIL" : (x.verdict === "HOLE" ? "HOLE" : "WARN"), "\"" + x.bad + "\"", x.where);
      });
      (ctx.story.held || []).forEach(function(h){
        push("copy", "WITHHELD", "WARN", h, "this line broke a hard rule and is NOT in the reel — an empty line is honest, a false claim is not");
      });
    } else {
      push("copy", "the story", "HOLE", "not written", "no copy exists yet, so nothing is being claimed to the customer");
    }

    if(ctx.reel){
      let verdict = "PASS", why = "rendered and read back through a <video> — the file is what it says it is";
      const secs = ctx.reel.seconds || 0;
      if(secs > T.reelLongS){ verdict = "WARN"; why = "over " + T.reelLongS + "s — long for a social reel; shorten 'seconds a picture' or drop pictures"; }
      if(secs && secs < T.reelShortS){ verdict = "WARN"; why = "under " + T.reelShortS + "s — too short to land the call"; }
      if(ctx.reel.verified === false){ verdict = "FAIL"; why = "the file was NOT read back as playable — treat the numbers as the encoder's intent, not a player's"; }
      push("video", "the reel", verdict, secs.toFixed(1) + "s · " + Math.round((ctx.reel.bytes || 0) / 1024) + " KB · " + (ctx.reel.audio ? "with audio" : "SILENT") + (ctx.reel.engine ? " · " + ctx.reel.engine : ""), why);
    } else {
      push("video", "the reel", "HOLE", "not rendered", "there is no film yet, so the strongest asset this business has does not exist");
    }
    (ctx.orders || []).forEach(function(o){
      const filled = orderFilled(o, ctx);
      if(filled.ok) push(o.agent, o.slot, "PASS", filled.measured, filled.why);
      else push(o.agent, "ORDER: " + o.slot, "HOLE", "→ the " + o.agent + " agent: " + o.why, filled.why);
    });

    const fails = rows.filter(function(r){ return r.verdict === "FAIL"; });
    const holes = rows.filter(function(r){ return r.verdict === "HOLE"; });
    const warns = rows.filter(function(r){ return r.verdict === "WARN"; });
    return { rows:rows, fails:fails, holes:holes, warns:warns, passes:rows.filter(function(r){ return r.verdict === "PASS"; }) };
  }

  /* ============================================================ the document
     The blueprint as one markdown file: what was read, what is missing, what is
     ordered, what the audit says. This is what a human reads, and this is what
     the site builder's brief is built from. */
  function doc(ctx){
    const L = [];
    const bp = ctx.blueprint, rs = ctx.research, au = ctx.auditData;
    L.push("# THE BLUEPRINT — " + ((ctx.prompt && ctx.prompt.name) || "this business"));
    L.push("");
    if(ctx.prompt && ctx.prompt.text){ L.push("**The prompt, verbatim**"); L.push(""); L.push("> " + String(ctx.prompt.text).replace(/\n/g, "\n> ")); L.push(""); }
    if(ctx.prompt && ctx.prompt.job){ L.push("**The job:** " + ctx.prompt.job); L.push(""); }
    L.push("---");
    L.push("");
    L.push("## 1 · What was read");
    L.push("");
    (ctx.pages || []).forEach(function(p){
      L.push("### " + p.kind.icon + " " + p.kind.label + " — " + p.url);
      if(!p.read){ L.push(""); L.push("**NOT READ** — " + (p.why || "unread") + ". An unread page is not evidence of anything."); L.push(""); return; }
      if(p.title) L.push("*" + p.title + "*");
      if(p.description) L.push("> " + p.description);
      L.push("");
      if(p.headings && p.headings.length) L.push("- sections: " + p.headings.slice(0, 12).join(" · "));
      if(p.items && p.items.length) L.push("- lists: " + p.items.slice(0, 14).join(" · "));
      if(p.prices && p.prices.length) L.push("- money: " + p.prices.slice(0, 10).join(" · "));
      if(p.phones && p.phones.length) L.push("- contacts: " + p.phones.slice(0, 6).join(" · "));
      if(p.addresses && p.addresses.length) L.push("- addresses: " + p.addresses.slice(0, 4).join(" · "));
      L.push("");
    });
    const al = ctx.linkAudit;
    if(al){
      L.push("## 2 · The link audit — what is there, and what is missing");
      L.push("");
      if(al.primary) L.push("Their own site is **" + al.primary + "**, and it links out to " + al.siteHosts + " host(s).");
      L.push("");
      L.push("| channel | verdict | found at |");
      L.push("|---|---|---|");
      al.rows.forEach(function(r){ L.push("| " + r.label + (r.need ? " *(needed)*" : "") + " | " + r.verdict + " | " + (r.href || "—") + " |"); });
      L.push("");
      if(al.missingFromSite.length){
        L.push("**They have it and their own site does not link it:** " + al.missingFromSite.map(function(r){ return r.label; }).join(", ") + ".");
        L.push("");
      }
      if(al.absentNeeded.length){
        L.push("**This industry needs these and nothing was found:** " + al.absentNeeded.map(function(r){ return r.label; }).join(", ") + ".");
        L.push("");
      }
      al.mismatches.forEach(function(m){ L.push("**" + m.kind + " DISAGREEMENT** — " + m.detail); L.push(""); });
      if(al.unread.length){ L.push("*Could not be read (unproven, not absent):* " + al.unread.join(" · ")); L.push(""); }
    }
    if(rs && rs.ok){
      L.push("## 3 · The research");
      L.push("");
      L.push("Read live: **" + rs.industry + "** · **" + rs.customer + "**");
      L.push("");
      if(rs.checks.length){ L.push("**What a customer checks, in order**"); rs.checks.forEach(function(x){ L.push("- " + x); }); L.push(""); }
      if(rs.practice.length){ L.push("**Best practice for this industry** *(the model's knowledge — a prior, not a measurement)*"); rs.practice.forEach(function(x){ L.push("- " + x); }); L.push(""); }
      if(rs.must.length){ L.push("**Channels and pages this industry needs**"); rs.must.forEach(function(x){ L.push("- " + x); }); L.push(""); }
      if(rs.wins.length){ L.push("**Quick wins, given what was read**"); rs.wins.forEach(function(x){ L.push("- " + x); }); L.push(""); }
    }
    if(bp && bp.ok){
      L.push("## 4 · The blueprint");
      L.push("");
      ["IDENTITY","OFFER","AUDIENCE","POSITION"].forEach(function(k){ if(bp.blocks[k]) L.push("**" + k + "** — " + bp.blocks[k]); });
      L.push("");
      if(bp.pillars.length){ L.push("**PILLARS**"); bp.pillars.forEach(function(x){ L.push("- " + x); }); L.push(""); }
      if(bp.proof.length){ L.push("**PROOF**"); bp.proof.forEach(function(x){ L.push("- " + x); }); L.push(""); }
      if(bp.page.length){ L.push("**THE FIRST PROTOTYPE, in running order**"); bp.page.forEach(function(x, i){ L.push((i + 1) + ". " + x); }); L.push(""); }
      if(bp.have.length){ L.push("**Assets in hand**"); bp.have.forEach(function(x){ L.push("- " + x); }); L.push(""); }
      if(bp.need.length){ L.push("**Assets to make** *(orders)*"); bp.need.forEach(function(x){ L.push("- " + x); }); L.push(""); }
      if(bp.links.length){ L.push("**Links to add or fix**"); bp.links.forEach(function(x){ L.push("- " + x); }); L.push(""); }
      if(bp.copy && (bp.copy.HEADLINE || bp.copy.KICKER || bp.copy.CTA)){
        L.push("**COPY**");
        ["HEADLINE","KICKER","CTA"].forEach(function(k){ if(bp.copy[k]) L.push("- " + k + ": " + bp.copy[k]); });
        L.push("");
      }
      if(bp.next) { L.push("**NEXT** — " + bp.next); L.push(""); }
    }
    if(ctx.orders && ctx.orders.length){
      L.push("## 5 · The orders");
      L.push("");
      L.push("| slot | agent | what it must show | prompt |");
      L.push("|---|---|---|---|");
      ctx.orders.forEach(function(o){ L.push("| " + o.slot + " | " + o.agent + " | " + o.want.replace(/\|/g, "/") + " | " + o.prompt.replace(/\|/g, "/") + " |"); });
      L.push("");
    }
    if(au){
      L.push("## 6 · The audit");
      L.push("");
      L.push("| kind | asset | verdict | measured | why |");
      L.push("|---|---|---|---|---|");
      au.rows.forEach(function(r){ L.push("| " + r.kind + " | " + String(r.asset).replace(/\|/g, "/") + " | **" + r.verdict + "** | " + String(r.measured).replace(/\|/g, "/") + " | " + String(r.why).replace(/\|/g, "/") + " |"); });
      L.push("");
      L.push("**" + au.passes.length + " pass · " + au.warns.length + " warn · " + au.holes.length + " hole · " + au.fails.length + " fail.** " +
             (au.fails.length ? "A FAIL is a fault in this node's own output and must be fixed before execution; a WARN about the client's own site is a job for the prototype." : "The content this node produced breaks no hard rule."));
      L.push("");
      const g = ctx.gate || gate(au, ctx);
      L.push("## 7 · The gate — may this be executed?");
      L.push("");
      L.push("**" + g.verdict + "** — " + g.line);
      L.push("");
      if(g.reasons.length){
        g.reasons.forEach(function(r){ L.push("- `" + r.level + "` " + r.text); });
        L.push("");
      }
      if(g.fixes && g.fixes.length){
        L.push("**For the prototype to fix** (faults in their own site, not in this node's output):");
        g.fixes.forEach(function(r){ L.push("- " + r.asset + " — " + r.why); });
        L.push("");
      }
      L.push("*The gate is not allowed to be generous: a fault in this node's own output blocks, and a remaining hole is named rather than waved through.*");
      L.push("");
    }
    L.push("---");
    L.push("");
    L.push("*Assembled by the drop station (video node · role `video`), run " + (ctx.run || "?") + ". Every fact above was fetched live or measured in the browser; " +
           "nothing was uploaded. The model's knowledge is marked as such wherever it appears.*");
    return L.join("\n");
  }

  /* the brief the site builder takes (?brief=) — the blueprint, not the whole doc */
  function brief(bp, ctx){
    if(!bp || !bp.ok) return "";
    const b = bp.blocks;
    return [
      "BUILD THIS PAGE. " + (ctx.prompt && ctx.prompt.name ? ctx.prompt.name + ": " : "") + (b.IDENTITY || ""),
      "OFFER: " + (b.OFFER || ""),
      "AUDIENCE: " + (b.AUDIENCE || ""),
      "POSITION: " + (b.POSITION || ""),
      bp.pillars.length ? "PILLARS: " + bp.pillars.join(" · ") : "",
      bp.proof.length ? "PROOF: " + bp.proof.join(" · ") : "",
      bp.page.length ? "SECTIONS, IN ORDER:\n" + bp.page.map(function(x, i){ return (i + 1) + ". " + x; }).join("\n") : "",
      bp.copy.HEADLINE ? "HEADLINE: " + bp.copy.HEADLINE : "",
      bp.copy.KICKER ? "KICKER: " + bp.copy.KICKER : "",
      bp.copy.CTA ? "CTA: " + bp.copy.CTA : "",
      (ctx.prompt && ctx.prompt.job) ? "THE JOB: " + ctx.prompt.job : ""
    ].filter(Boolean).join("\n");
  }

  window.Drop = {
    version: VERSION,
    CHANNELS: CHANNELS, classify: classify, norm: norm, hostOf: hostOf, auditLinks: auditLinks,
    readUrls: readUrls, research: research, blueprint: blueprint, ordersFor: ordersFor,
    assetsTable: assetsTable, audit: audit, gate: gate, orderFilled: orderFilled, doc: doc, brief: brief,
    parseBlocks: parseBlocks, bullets: bullets, channelsFromResearch: channelsFromResearch,
    T: T
  };
})();
