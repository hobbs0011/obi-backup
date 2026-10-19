/* ============================================================================
   STORY ENGINE — the sales hand. A reel that just shows pictures is a
   slideshow; a reel that SELLS is a story with the pictures under it.

   THREE THINGS GO IN, ONE STORY COMES OUT.

     1. THE OFFERING — looked up, not guessed. A URL is fetched, its words are
        pulled apart in this file (headings, list items, prices, phones,
        addresses) and what comes back is the venue's OWN offer, with the page
        it came from named beside every number. If the page cannot be read, the
        lookup says so and the story is written from whatever the human typed
        instead. It never fills a gap with a plausible number.

     2. THE HOUSE STYLE — the PrAis marketing register, distilled below. Every
        line of MARKET_STYLE is a transcription of the station's own register
        (`src/brand.js` → MARKET and CODEX, with GOSPEL 444's voice laws), not a
        copywriter's invention: sell the permission and not the object; give the
        offer an identity it can move between; keep the three pillars; prove in
        three beats (mechanism · disruption · outcome); remove friction; name
        the failure before the cure; compare in three rows; lead in English and
        set the translation under it; second person, short, imperative.

     3. THE MATERIAL — what is actually in the pictures. The eye (the vision
        pass) reads the contact sheet and returns one line per tile, in reading
        order, so a story line can be bound to the picture it is about instead
        of being sprinkled over the top of the reel.

   THE STORY IS SIX BEATS AND A LINE PER PICTURE:
        HOOK  the identity line — becomes the title card
        ENEMY what the traveller is settling for instead — the first picture
        PLACE where they are
        PROOF the pillars, shown — the middle pictures
        OFFER the real numbers, from the lookup
        CALL  what to do now — becomes the end card
   and it is DETERMINISTIC TO PARSE (see parse()), so the reel can be dressed
   from it without a human retyping anything.

   THE ONE LAW IT INHERITS FROM THE REGISTER (BRAND.017): the marketing register
   may never claim a number the doctrine does not hold. Here that reads: the
   model may only use numbers that appear in the looked-up offering. A story
   with a made-up price is a lie with a soundtrack.
   ========================================================================== */
(function(){
  "use strict";

  /* ============================================================ the register
     Distilled from src/brand.js (MARKET · CODEX) and GOSPEL 444's voice laws.
     Each line names its source so the transcription can be checked. Nothing
     below is copywriting; it is the register, compressed. */
  const MARKET_STYLE = [
    "THE HOUSE REGISTER — PrAis marketing. This is what we SAY (outward, to the customer).",
    "· THE DOCTRINE (MARKET.headline): we do not sell the object — we sell the permission it buys. A bed is not a bed; it is a night you are allowed to relax in.",
    "· THE KICKER FORM (MARKET.kicker, 'FROM MOUSE TO TIGER'): give the offer a two-part identity the reader can move between — the state now, and the state after.",
    "· THE THREE PILLARS (MARKET.pillars): ONLY WHAT IS ACTUALLY USED · A SYSTEM THAT BEATS WILLPOWER · THE PEOPLE YOU ARE SURROUNDED BY. Proof is always one of these three, never an adjective.",
    "· THE THREE-BEAT PROOF (MARKET.sixty): MECHANISM — why it works; DISRUPTION — what everyone else gets wrong; OUTCOME — what the reader gets. Say all three in that order.",
    "· LOW FRICTION (MARKET.hour, '1 hour, fit it in your current schedule'): part of the offer is that it costs the reader no extra life. Name the smallness of the ask.",
    "· DIAGNOSE BEFORE THE OFFER (MARKET.diagnose): name the failure, name who built the habit, name the reflex — THEN the cure. Never open with the cure.",
    "· THE COMPARISON (MARKET.compare): three rows, the old way and our way, no adjectives. FOCUS · THE DAILY HABIT · WHAT IT BUILDS.",
    "· THE LAW OF BILINGUAL HIERARCHY (MARKET.ads.law): English leads as the commanding anchor; Vietnamese sits under it as the sleek, clean subtitle. Never the reverse, and no text-heavy slop.",
    "· THE VOICE (GOSPEL 444 / LESSON.007): second person. Short. Imperative. CAPS are weight, not shouting. Loud-and-wrong beats silent-and-correct. No hedging, no apology, no sarcasm, no exclamation stacks.",
    "· THE HONESTY CLAUSE (BRAND.017): the marketing register may never claim a number the doctrine does not hold. Only use numbers that appear in THE OFFERING below. No number exists that the offering does not state.",
    "· THE CLOSING FORM (MARKET.offer, 'Message for your FREE assessment.'): one imperative, one channel, one reason to move now. The last line of everything we say is an instruction."
  ].join("\n");

  const ARC = [
    ["HOOK",  "one line, 3-8 words, the identity/before-and-after. Second person or imperative. This is the title card, read in half a second."],
    ["ENEMY", "one line — what the traveller is settling for instead of this. Name the boring alternative honestly; never invent a rival's name."],
    ["PLACE", "one line — where this actually is, using the offering's own facts (street, district, what it is next to)."],
    ["PROOF", "one line — the strongest of the three pillars, in the offering's own terms (the food, the people, the place)."],
    ["OFFER", "one line carrying ONE real number from the offering, exactly as the offering states it."],
    ["CALL",  "one line — the instruction: what to do, on which channel. This is the end card."]
  ];

  /* ============================================================ the offering
     Read a page's words apart, in this file, with no model. Everything returned
     is something the page actually said. */
  const ENT = { "&nbsp;":" ", "&amp;":"&", "&quot;":"\"", "&#39;":"'", "&#x27;":"'", "&lt;":"<", "&gt;":">", "&mdash;":"—", "&ndash;":"–", "&hellip;":"…", "&bull;":"·" };
  function unent(s){
    return String(s)
      .replace(/&#(\d+);/g, function(_, d){ return String.fromCharCode(+d); })
      .replace(/&[a-z#0-9]+;/gi, function(m){ return ENT[m.toLowerCase()] || m; });
  }
  function textOf(html){
    return unent(String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|section|article|tr|td|span)>/gi, "\n")
      .replace(/<[^>]+>/g, " "))
      .replace(/[ \t\u00a0]+/g, " ")
      .replace(/ ?\n ?/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  function grab(re, s, i){ const m = String(s).match(re); return m ? unent(String(m[i == null ? 1 : i]).trim()) : ""; }
  const MONEY = /(?:[$€£₫¥]|VND|USD|EUR|\b\d[\d.,]*\s?(?:k|K|đ|₫|VND|USD)\b)/;
  const PHONE = /(?:\+?\d[\d\s().\-]{6,}\d)/g;
  const ADDR  = /\b\d{1,4}\s?[\/\-]?\s?\d{0,3}\s?[A-ZÀ-Ỹ][\w'’.\- ]{3,40}?(?:street|st\.?|road|rd\.?|lane|alley|avenue|ave\.?|duong|đường|quận|quan|district|ward|phường|pham ngu lao|bui vien|bùi viện)\b/i;

  function readOffering(html, url){
    const raw = String(html || "");
    const text = textOf(raw);
    const lines = text.split("\n").map(function(l){ return l.trim(); }).filter(Boolean);
    const uniq = function(a){ const seen = {}; return a.filter(function(x){ const k = String(x).toLowerCase().trim(); if(!k || seen[k]) return false; seen[k] = 1; return true; }); };

    const out = {
      url:url || "", title:grab(/<title[^>]*>([\s\S]*?)<\/title>/i, raw),
      description:grab(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, raw) ||
                  grab(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i, raw),
      headings:[], items:[], prices:[], phones:[], addresses:[], links:[], words:0, chars:raw.length
    };
    const heads = raw.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi) || [];
    out.headings = uniq(heads.map(function(h){ return textOf(h).replace(/\n/g, " ").trim(); }).filter(function(h){ return h && h.length < 140; })).slice(0, 40);
    const lis = raw.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    out.items = uniq(lis.map(function(l){ return textOf(l).replace(/\n/g, " · ").trim(); }).filter(function(l){ return l && l.length >= 3 && l.length < 160; })).slice(0, 60);
    out.prices = uniq(lines.filter(function(l){ return MONEY.test(l) && l.length < 120; })).slice(0, 30);
    out.phones = uniq((text.match(PHONE) || []).map(function(p){ return p.replace(/\s+/g, " ").trim(); }).filter(function(p){ return p.replace(/\D/g, "").length >= 8; })).slice(0, 8);
    (raw.match(/https?:\/\/wa\.me\/\d+/gi) || []).forEach(function(w){ if(out.phones.indexOf(w) < 0) out.phones.push(w); });
    /* AN ADDRESS IS A SHORT THING. A long sentence that happens to contain
       "District 1" is not an address, and treating one as an address made the
       link audit report a disagreement between two sentences that were never
       addresses at all. So the address is the MATCH, not the line, and a match
       carrying sentence words or a length a street name never has is dropped. */
    const addrHits = [];
    lines.forEach(function(l){
      if(l.length > 110) return;
      const m = l.match(ADDR);
      if(!m) return;
      const a = String(m[0]).replace(/\s+/g, " ").trim();
      if(a.length < 6 || a.length > 80) return;
      if(/\b(in|the|of|and|from|for|with|left|booked|last|only|here|now)\b/i.test(a)) return;
      addrHits.push(a);
    });
    out.addresses = uniq(addrHits).slice(0, 8);
    const hrefs = raw.match(/href=["']([^"']+)["']/gi) || [];
    out.links = uniq(hrefs.map(function(h){ return h.replace(/^href=["']|["']$/g, ""); })
      .filter(function(h){ return /^(https?:|\/|mailto:|tel:|#)/.test(h) && !/\.(css|js|png|jpe?g|svg|webp|ico|woff2?)(\?|$)/i.test(h); })).slice(0, 40);
    out.text = lines.join("\n").slice(0, 8000);
    out.words = out.text.split(/\s+/).filter(Boolean).length;
    out.found = { headings:out.headings.length, items:out.items.length, prices:out.prices.length, phones:out.phones.length, addresses:out.addresses.length };
    return out;
  }

  /* fetch a page and read it. superFetch when the generator has it (it proxies
     through Perchance, so CORS is not the reader's problem), the plain fetch
     otherwise. A failure is reported with its reason — never a silent empty. */
  async function lookup(url, opts){
    opts = opts || {};
    const u = String(url || "").trim();
    if(!u) return { ok:false, why:"no address given" };
    const full = /^https?:\/\//i.test(u) ? u : ("https://" + u);
    let res = null, why = null, via = null;
    try{
      if(window.root && window.root.superFetch){
        via = "superFetch"; res = await window.root.superFetch(full);
      } else if(window.superFetch){
        via = "superFetch"; res = await window.superFetch(full);
      } else {
        via = "fetch"; res = await fetch(full, { mode:"cors" });
      }
    }catch(e){ why = "the fetch itself failed: " + ((e && e.message) || e); }
    if(!res){
      try{ via = "fetch"; res = await fetch(full, { mode:"cors" }); }catch(e){ why = why || ("the fetch itself failed: " + ((e && e.message) || e)); }
    }
    if(!res) return { ok:false, why:why, url:full, via:via };
    let html = "";
    try{ html = await res.text(); }catch(e){ return { ok:false, why:"the response could not be read as text", url:full, via:via, status:res.status }; }
    if(!res.ok && !html){ return { ok:false, why:"the page answered " + res.status, url:full, via:via, status:res.status }; }
    const offer = readOffering(html, full);
    offer.ok = true; offer.via = via; offer.status = res.status;
    return offer;
  }

  /* ============================================================ the writing */
  function materialBlock(opts){
    const shots = opts.shots || [];
    const lines = [];
    lines.push("PICTURES IN THE REEL, IN ORDER (" + shots.length + "):");
    if(!shots.length) lines.push("(none described)");
    shots.forEach(function(s, i){
      const what = String((s && (s.what || s.line || s.name)) || "").trim();
      lines.push("  " + (i + 1) + ". " + (what || ("picture " + (i + 1) + " — nothing described")));
    });
    if(opts.vibe) lines.push("\nTHE LOOK, IN WORDS (the vision pass, on the contact sheet):\n" + String(opts.vibe).slice(0, 2500));
    if(opts.caption) lines.push("\nTHE OWNER'S OWN LINE FOR THIS REEL: " + String(opts.caption));
    return lines.join("\n");
  }
  function offeringBlock(offer){
    if(!offer) return "THE OFFERING: none was looked up. Write only what the pictures and the owner's line support, and name nothing you were not told.";
    const L = [];
    L.push("THE OFFERING — read live from " + (offer.url || "(unknown address)") + ", " + (offer.words || 0) + " words. These are the ONLY facts and numbers you may use:");
    if(offer.title) L.push("  name: " + offer.title);
    if(offer.description) L.push("  the page says: " + offer.description);
    if(offer.headings && offer.headings.length) L.push("  sections: " + offer.headings.slice(0, 18).join(" · "));
    if(offer.items && offer.items.length) L.push("  it lists:\n    - " + offer.items.slice(0, 30).join("\n    - "));
    if(offer.prices && offer.prices.length) L.push("  money on the page:\n    - " + offer.prices.slice(0, 20).join("\n    - "));
    if(offer.phones && offer.phones.length) L.push("  contact: " + offer.phones.join(" · "));
    if(offer.addresses && offer.addresses.length) L.push("  address(es): " + offer.addresses.join(" · "));
    if(!offer.items.length && !offer.prices.length && offer.text) L.push("  the page, verbatim (first 4000 characters):\n" + String(offer.text).slice(0, 4000));
    return L.join("\n");
  }

  const STORY_SYS =
    MARKET_STYLE + "\n\n" +
    "YOUR JOB: write ONE short vertical video's worth of story for the offering below, using the pictures as its scenes. " +
    "It will be burned onto the pictures as text, so every line must be short enough to read in about two seconds — " +
    "aim for 3-9 words a line, and never more than 12.\n" +
    "Answer in EXACTLY this shape, no preamble and no markdown:\n" +
    ARC.map(function(a){ return a[0] + ": <" + a[1] + ">"; }).join("\n") + "\n" +
    "LINES:\n" +
    "1. <one line for picture 1>\n" +
    "2. <one line for picture 2>\n" +
    "... one numbered line per picture, in the order given, no more and no fewer\n" +
    "CAPTION: <2-3 sentences for the post itself, second person, carrying one real number from the offering and ending with the instruction>\n" +
    "TAGS: <8-14 lowercase hashtags, space separated, no punctuation>\n" +
    "RULES:\n" +
    "· The three pillars, the 60% rule, the comparison and the two-part identity are a METHOD. The register's own examples — 'from mouse to tiger', 'the tiger', 'the AI-PET', 'FREE assessment' — belong to a language school and are illustrations of the method, NEVER this story's words. This story's identity, its proof and its call come from THE OFFERING and from the pictures.\n" +
    "· No number that is not in THE OFFERING. No invented name, no invented claim, no emoji, no stacked exclamation marks. If THE OFFERING is EMPTY then NO DIGIT AT ALL may appear anywhere in the answer — not a price, not a count, not a year: a number with nothing behind it is the one thing this register may never write.\n" +
    "· If THE OFFERING is empty, the CALL carries NO channel of its own: write the instruction and leave the channel for the owner. Never reuse the register's illustrations of method ('FREE assessment', 'from mouse to tiger', 'the AI-PET') — they belong to another subject and a hard check in code will strike any line that contains them.\n" +
    "· The pictures are numbered above and are IN ORDER. Every numbered line must belong to ITS picture — twelve lines about twelve different things, not twelve phrasings of one idea.\n" +
    "· The CALL carries the channel the offering itself names (its phone, its WhatsApp, its booking link).\n" +
    "· If the offering is thin, write a thinner story — never a fuller one.";

  function storyPrompt(opts){
    return [
      STORY_SYS,
      "",
      "THE OFFERING\n" + offeringBlock(opts.offer),
      "",
      "THE MATERIAL\n" + materialBlock(opts),
      "",
      "THE TASK\n" +
      (opts.n ? ("Write the six beats, then exactly " + opts.n + " numbered LINES (one per picture above).") : "Write the six beats, then the numbered LINES.") +
      (opts.goal ? ("\nThe job of this reel: " + opts.goal) : "\nThe job of this reel: get the reader to act on the single offer above.") +
      (opts.lang === "vi" ? "\nWrite in Vietnamese. Keep the English anchor short where it reads better as English." :
       opts.lang === "bi" ? "\nWrite each line in English, then the Vietnamese under it, separated by ' / ' — English first, always." : "")
    ].join("\n");
  }

  /* The answer, taken apart. Deterministic: the reel is dressed from this, so a
     beat that did not come back stays empty rather than being invented.
     NOTE: every `$` below is written `(?![\\s\\S])` on purpose. In a multiline
     regex `$` means "end of a LINE", which silently truncated the
     twelve-picture LINES block to its first line — measured, then fixed. */
  const END = "(?![\\s\\S])";
  function parse(text){
    const t = String(text || "");
    const beats = {};
    ["HOOK","ENEMY","PLACE","PROOF","OFFER","CALL","CAPTION","TAGS"].forEach(function(k){
      const m = t.match(new RegExp("^\\s*" + k + "\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:HOOK|ENEMY|PLACE|PROOF|OFFER|CALL|LINES|CAPTION|TAGS)\\s*:|" + END + ")", "im"));
      beats[k] = m ? m[1].replace(/\s+/g, " ").trim() : "";
    });
    const block = (t.match(new RegExp("^\\s*LINES\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:CAPTION|TAGS)\\s*:|" + END + ")", "im")) || [])[1] || "";
    const lines = [];
    block.split("\n").forEach(function(row){
      const m = row.match(/^\s*(\d+)[.)]?\s*[-–—:]?\s*(.+?)\s*$/);
      if(m) lines[+m[1] - 1] = m[2].trim();
    });
    for(let i = 0; i < lines.length; i++) if(lines[i] == null) lines[i] = "";
    return { beats:beats, lines:lines, tags:(beats.TAGS || "").split(/\s+/).filter(Boolean).slice(0, 20) };
  }

  /* ============================================================ the copy audit
     THE COPY AGENT'S OWN RULE, CHECKED IN CODE — not merely forbidden in a prompt.

     A first real run of this engine printed "Message for your FREE assessment."
     onto a hostel reel: the house register had been distilled from a language
     school, and the model reached for the register's own illustration of the
     method when there was nothing else to hold on to. A second run, with no
     offering looked up at all, invented "0 dollars for this look." Both are the
     same failure — the register's examples and invented numbers are the two ways
     copy lies — and both are mechanically detectable, so they are detected here
     and never merely asked for.

       RULE 1  the register's own examples (FREE assessment, from mouse to tiger,
               the AI-PET …) must not appear. They illustrate the METHOD.
       RULE 2  no number the offering does not state (BRAND.017). With no
               offering at all, NO digit may appear anywhere in the copy.
       RULE 3  the CALL must carry a channel — and when nothing was looked up,
               its absence is EXPECTED, so it is reported as a hole for the owner
               to fill rather than as a failure of the copy. */
  const HOUSE_EXAMPLES = [
    "free assessment", "mouse to tiger", "from mouse to tiger", "the tiger", "ai-pet", "ai pet",
    "language school", "book a free", "free trial lesson"
  ];
  function numbersIn(text){ return (String(text == null ? "" : text).match(/\d[\d.,]*/g) || []); }
  function offeringText(offer){
    if(!offer || !offer.ok) return "";
    return [offer.title, offer.description, (offer.headings || []).join(" "), (offer.items || []).join(" "),
            (offer.prices || []).join(" "), (offer.phones || []).join(" "), (offer.addresses || []).join(" "),
            offer.text || ""].join("\n").toLowerCase();
  }
  function channelIn(text){
    return (String(text || "").match(/https?:\/\/\S+|wa\.me\/\d+|[\w.+-]+@[\w.-]+|\+?\d[\d\s().-]{7,}\d/g) || [])[0] || "";
  }
  function auditCopy(parsed, offer){
    const beats = (parsed && parsed.beats) || {};
    const lines = (parsed && parsed.lines) || [];
    const copy = Object.keys(beats).map(function(k){ return beats[k]; }).concat(lines).filter(Boolean).join("\n");
    const low = copy.toLowerCase();
    const rows = [];
    HOUSE_EXAMPLES.forEach(function(x){
      if(low.indexOf(x) >= 0)
        rows.push({ rule:"REGISTER ECHO", bad:x, where:"the copy repeats the register's own example — it illustrates the method and is never this subject's words", verdict:"FAIL" });
    });
    const have = offeringText(offer);
    const offered = !!(offer && offer.ok);
    const seen = {};
    numbersIn(copy).forEach(function(n){
      const key = String(n).replace(/[.,]+$/, "");
      if(!key || seen[key]) return; seen[key] = 1;
      if(!offered){
        rows.push({ rule:"NUMBER WITH NO OFFERING", bad:key, where:"nothing was looked up, so there is no source for this number", verdict:"FAIL" });
        return;
      }
      const digits = key.replace(/[^\d]/g, "");
      if(digits && have.indexOf(digits) < 0 && have.indexOf(key.toLowerCase()) < 0)
        rows.push({ rule:"NUMBER NOT IN THE OFFERING", bad:key, where:"the offering never states this number", verdict:"FAIL" });
    });
    const chan = channelIn(beats.CALL);
    if(!chan)
      rows.push({ rule:"NO CHANNEL IN THE CALL", bad:String(beats.CALL || "(empty)").slice(0, 70),
                  where: offered ? "the offering names a channel and the call does not carry it"
                                 : "no offering was read, so the owner must supply the channel — this is a HOLE, not a lie",
                  verdict: offered ? "WARN" : "HOLE" });
    return rows;
  }
  /* the offending beats are WITHHELD, not shipped. A reel that shows an empty
     line where a claim should be is honest; a reel that shows "0 dollars" is not. */
  function withhold(parsed, violations){
    const bads = violations.filter(function(v){ return v.verdict === "FAIL"; })
                           .map(function(v){ return String(v.bad).toLowerCase().trim(); }).filter(Boolean);
    if(!bads.length) return [];
    const hit = function(s){
      const low = String(s || "").toLowerCase();
      return bads.some(function(b){ return b && low.indexOf(b) >= 0; });
    };
    const held = [];
    ["HOOK","ENEMY","PLACE","PROOF","OFFER","CALL","CAPTION"].forEach(function(k){
      if(parsed.beats[k] && hit(parsed.beats[k])){ held.push(k + ": \"" + parsed.beats[k] + "\""); parsed.beats[k] = ""; }
    });
    parsed.lines = parsed.lines.map(function(l, i){
      if(l && hit(l)){ held.push("line " + (i + 1) + ": \"" + l + "\""); return ""; }
      return l;
    });
    parsed.held = held;
    parsed.filled = Object.keys(parsed.beats).filter(function(k){ return parsed.beats[k]; }).length;
    return held;
  }

  async function writeStory(opts, hooks){
    hooks = hooks || {};
    if(!window.root || !window.root.generateText) return { ok:false, why:"no generateText in this generator — no story is claimed" };
    const n = (opts.shots || []).length;
    const offered = !!(opts.offer && opts.offer.ok);
    const prompt = storyPrompt(Object.assign({}, opts, { n:n }));
    let text = "";
    const call = async function(instruction){
      text = "";
      const p = window.root.generateText({
        instruction:instruction,
        onChunk:function(d){ text += d.textChunk; if(hooks.onChunk) hooks.onChunk(text); }
      });
      if(hooks.onJob) hooks.onJob(p);
      const res = await p;
      return String((res && res.text) || text || "").trim();
    };
    try{
      let final = await call(prompt);
      if(!final) return { ok:false, why:"the register returned nothing" };
      let parsed = parse(final);
      let violations = auditCopy(parsed, opts.offer);
      /* ONE correction pass, with the violations quoted back verbatim. Two runs
         failed these rules before the audit existed; one corrected retry is
         cheap and usually enough. */
      if(violations.some(function(v){ return v.verdict === "FAIL"; })){
        const bad = violations.filter(function(v){ return v.verdict === "FAIL"; });
        if(hooks.onNote) hooks.onNote("the copy broke " + bad.length + " hard rule(s) — correcting once, with the violations quoted back");
        const correction = prompt + "\n\nYOUR LAST ANSWER BROKE THE HARD RULES. Exactly these, quoted:\n" +
          bad.map(function(v){ return "· " + v.rule + " — \"" + v.bad + "\" (" + v.where + ")"; }).join("\n") +
          "\n\nWrite the WHOLE answer again and break none of them. " +
          (offered ? "Every number must appear verbatim in THE OFFERING."
                   : "There is NO offering, so write NO digits at all anywhere, and do not name a channel in the CALL — " +
                     "write the instruction and leave the channel for the owner to fill in.");
        const second = await call(correction);
        if(second){
          const p2 = parse(second);
          const v2 = auditCopy(p2, opts.offer);
          if(v2.filter(function(v){ return v.verdict === "FAIL"; }).length < bad.length){ final = second; parsed = p2; violations = v2; }
        }
      }
      /* anything that STILL breaks a hard rule is withheld and named */
      parsed.violations = violations;
      const held = withhold(parsed, violations);
      if(held.length && hooks.onNote)
        hooks.onNote("WITHHELD " + held.length + " line(s) that broke a hard rule: " + held.join(" · ") + " — an empty line is honest, a false claim is not");
      parsed.ok = true; parsed.text = final; parsed.prompt = prompt;
      parsed.corrected = parsed.text !== (text || "");
      parsed.filled = Object.keys(parsed.beats).filter(function(k){ return parsed.beats[k]; }).length;
      return parsed;
    }catch(e){
      return { ok:false, why:"the write failed: " + ((e && e.message) || e), partial:text };
    }
  }

  window.Story = {
    STYLE: MARKET_STYLE, ARC: ARC, HOUSE_EXAMPLES: HOUSE_EXAMPLES,
    readOffering: readOffering, lookup: lookup, parse: parse, prompt: storyPrompt,
    write: writeStory,
    audit: auditCopy, numbersIn: numbersIn, offeringText: offeringText, channelIn: channelIn, withhold: withhold,
    /* the beats, in the order they are told — the reel's own running order */
    order: ["HOOK","ENEMY","PLACE","PROOF","OFFER","CALL"]
  };
})();
