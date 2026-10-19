/* ============================================================================
   SITE BUILDER — the Web Development division's generator (role: site).

   ONE JOB. A brief goes in; a real website comes out. Self-contained HTML,
   previewed live in a sandboxed frame, downloadable, filed in a local library.

   The three rules it inherits from every other role (src/generators/README.md):
     · SOUL FIRST (L37/L38/L39). The brief is a sovereign word — recorded
       verbatim into obi_sdnad BEFORE the model is called. Never edited.
     · FAIL CLOSED. No plan without a brief; no build that did not preview; a
       deploy that cannot be measured reads BLOCKED.
     · IT DOES NOT LIE ABOUT HOSTING. This generator can build a file; it cannot
       publish one. Publishing is the sovereign's Cloudflare account; writing the
       authority is the station's PHOENIXOMEGAPROTOCOL gate. Both are named, not
       implied.

   WHY ONE FILE PER SITE. The whole family already learned this: a lesson
   (`src/lessons.js`), a brand deck (`src/brand.js`), an app from Free Phoenix
   (`src/freephoenix.js`) all ship as ONE standalone self-contained HTML file.
   One file previews in a sandboxed frame, downloads, opens offline, and can be
   pasted anywhere. A multi-page site is built as in-file views with a tiny hash
   router — the file stays one artifact.

   THE REPLY CAP. generateText caps its reply, so a file is written IN PARTS:
   an unfinished part ends with <<<MORE>>> and the continuation is asked for with
   the file so far in context. The prefix (system + brief) never changes and the
   file only ever grows, so the prefix stays cached. See genFile().
   ========================================================================== */
(function(){
  "use strict";

  const MEM_KEY   = "obi_sdnad";        /* the same ledger the station reads — whole is one */
  const LIB_KEY   = "obi_sites";        /* the local library (kv folder `sites`, ls mirror) */
  const VOICE_KEY = "obi_site_voice";
  const PART_MARK = /<<<MORE>>>/;
  const END_MARK  = /<<<END>>>/;
  const MAX_PARTS = 12;
  const MAX_LIB   = 12;                 /* the newest N sites are kept; older ones drop with a notice */

  /* THE FROZEN TOKENS (LESSON.008 / BRAND.002). The generated site wears them
     only when the brief says the site is OURS; a client's site wears the
     client's colours, because a website is not a lesson. */
  const FROZEN = { system:"#a855f7", reward:"#f59e0b", ground:"#0f0f1a" };

  /* THE SHAPE LIBRARY (examples/) — distilled to grammar, so a brief starts from
     a design that already shipped instead of a blank prompt. The full files sit
     beside this generator (`examples/`, brought in 2026-09-22): the CV
     (`examples/michael-hobbs-cv/`, live at michael-hobbs.pages.dev/cv) and one
     portfolio template in two palettes (`examples/portfolio-template-violet/` ·
     `-green/` — the only real proof a design is a template and not a one-off).
     A design is a GRAMMAR, not a copy: the build writes fresh HTML for the
     actual subject. `freehand` is the model's own design. */
  const CV_GRAMMAR = [
    "DESIGN GRAMMAR — THE CV (from a site that shipped: examples/michael-hobbs-cv/, live at michael-hobbs.pages.dev/cv). Follow the grammar; write the brief's own subject into it.",
    "· Ground is near-black (#06070b is the shipped one). ONE accent, used only on the name (a gradient), the band rules, links and active states. Body text light grey, secondary text dimmer.",
    "· Type: a condensed/display face for the name and band titles, a clean sans for body. Labels are small, uppercase, letter-spaced, dim.",
    "· Structure in order: a slim nav (wordmark left; flat text links right — on a single page the links are #anchors and the current one is marked active) → a centred masthead (a small uppercase label, then the NAME large in the accent gradient, then a one-line role lead) → the bands.",
    "· The bands are a two-column card grid (one band, usually References, spans both). Each band is a card with a plain <h3> heading and a thin rule — a band holds entries, not prose.",
    "· Entry grammars: JOB = a header row (title left, period right, ruled underneath) + a role line + a <ul> of 2–5 concrete bullets. QUALIFICATION = a title + one meta line. SKILL = a row of chips. CONTACT = 2–4 plain lines (phone · email · place).",
    "· Quiet and dense: 1px rules, letter-spaced labels, little or no border radius, no big shadows, no hero image. It reads as a document, not a brochure.",
    "· Real content for the brief's subject only — never invent facts about a person."
  ].join("\n");

  const PORTFOLIO_GRAMMAR = [
    "DESIGN GRAMMAR — THE PORTFOLIO (from two sites that shipped: examples/portfolio-template-violet/ and examples/portfolio-template-green/ — ONE template, two palettes, two different subjects). Follow the grammar; write the brief's own subject into it.",
    "· Ground is a very dark base; cards are one step lighter; radius ~12px; a card lifts ~3px on hover and its border takes the accent.",
    "· Structure in order: a fixed nav (blurred, ~85% opaque, tinted bottom border — a monogram/wordmark left, 3–5 anchor links right) → a full-height centred hero → the sections → a one-line footer.",
    "· THE HERO: a 140px circular monogram whose background is the accent gradient, then <h1>First <span>Last</span></h1> (the span takes the accent), a one-line tagline, then two buttons — one solid accent, one outline.",
    "· Every section is max-width ~900px, centred, with ~5rem of vertical padding. Every <h2> carries a 4px accent bar as a ::before and a dim one-line sub-heading beneath it.",
    "· CAPABILITIES: an auto-fit grid (minmax 250px) of about six cards — an emoji, an <h3>, two lines each.",
    "· WORK: a 3-up grid of project cards — a ~180px gradient thumb holding one large emoji, an <h3>, two lines, then 2–3 small pill tags.",
    "· ABOUT: a two-column split — 3–4 short paragraphs left; a stack of fact rows right (a dim uppercase LABEL above a value, with a 3px accent left border).",
    "· CONTACT: a grid of 3–4 icon cards (emoji, label, value), each a working link.",
    "· ONE accent plus at most one secondary. Real content for the brief's subject only."
  ].join("\n");

  /* THE VENUE GRAMMAR — the one shape in the library that came from a CLIENT's
     real site, and it is the most instructive of the three: it exists because the
     sovereign corrected the first attempt twice (CANON/MAILALA-PROMPT-REGISTER.md,
     SOUL-06: "too dark of a background… the color font looks gay… we want it to
     look hip and a cool place to chill"). So: warm ground, real photos of the
     place, and the call to action is the channel the guests actually use. */
  const VENUE_GRAMMAR = [
    "DESIGN GRAMMAR — THE VENUE (from a site that shipped: the Mailala hostel & bar, canon.mailala.pages.dev, built to the sovereign's own prompts). Follow the grammar; write the brief's own subject into it.",
    "· Ground is WARM CREAM (#f5efe6) — never dark. Body text is a warm near-black (#1a1714), secondary text muted. Photos of the real place carry the page, not effects.",
    "· Type: a display SERIF with character for h1/h2 (DM Serif Display), a clean sans for body (Inter). Above each section head: a small uppercase letter-spaced label (\"ROOTS · ROCK · REGGAE\", \"THE MENU\").",
    "· The accent set is the venue's own: deep forest green (#2d6a4f · #1b4332), gold (#d4a853), crimson (#a93226), earthy brick (#8b4513), wood (#6b4423). ONE recurring ornament — a three-band stripe in green · gold · crimson — used as a rule under headings and as a card edge.",
    "· Structure in order: a slim sticky nav (wordmark left, 4-5 anchors, one booking button right) → a full-bleed HERO built on a real photo of the place (dark scrim for legibility, the claim in one line, one supporting line, two buttons: the booking action and \"see the menu\") → the story of the place in one band → the signature dish as its own food band with a pre-order button → the menu band (grouped cards with real prices) → the rooms/prices band (one card per room type, the real price on the card) → a photo gallery of the place's own art and light → what's on / events → the roof or the best view → deals → short attributed testimonials → FAQ as <details> → the closing band with the address, a map embed, and the phone → a one-line footer.",
    "· COPY VOICE: warm, direct, second person, short lines. Hospitality with a pulse — never corporate gloss, never clumsy slang pastiche.",
    "· ONE GOAL: get them to book or message. The messaging action (WhatsApp/phone) is repeated in the nav, the hero, the food band, the rooms and the closing band — the same words every time.",
    "· PHOTOS: the venue's OWN photos only, never stock, never an invented URL. Every one carries alt text saying what it actually shows.",
    "· Only use a fact from the brief: prices, the address, the phone, the hours. Never invent one."
  ].join("\n");

  const DESIGNS = {
    freehand:  { id:"freehand",  label:"✧ freehand",              blurb:"the model designs it from the brief",
                 grammar:"", planNote:"" },
    venue:     { id:"venue",     label:"🌴 the venue grammar",     blurb:"warm ground, real photos, one booking action",
                 grammar:VENUE_GRAMMAR,
                 planNote:"The sections are the venue's own, in order: nav · hero · story · signature dish · menu · rooms & prices · gallery · what's on · roof/view · deals · testimonials · FAQ · the closing band with address + map + phone. 8-13 sections." },
    cv:        { id:"cv",        label:"◈ the CV grammar",        blurb:"labelled bands, a dark ground, one accent",
                 grammar:CV_GRAMMAR,
                 planNote:"The sections are the CV's own bands, in order: a masthead band, then each content band the brief implies (Profile · Experience · Skills · whatever the subject has · References). 3–7 bands." },
    portfolio: { id:"portfolio", label:"❖ the portfolio grammar", blurb:"hero → capabilities → work → about → contact",
                 grammar:PORTFOLIO_GRAMMAR,
                 planNote:"The sections are the portfolio's own: hero · capabilities · work · about · contact. Add or drop one only if the brief truly needs it." }
  };
  function design(){ return DESIGNS[state.design] || DESIGNS.freehand; }
  function designBlock(){
    const g = design().grammar;
    return g ? ("\n<" + "DESIGN>\n" + g + "\n</DESIGN>\n") : "";
  }

  /* THE SUBJECT'S OWN PHOTOS. A venue page IS its photographs, and the engine
     must never invent one. The sovereign supplies the hosted URLs (his own files
     or the client's) — and, when he knows, WHAT EACH PHOTO SHOWS, because the
     model CANNOT SEE them: given bare URLs a real build produced confident,
     wrong alt text ("bunk beds in the mixed dorm" over a photo of the rooftop).
     So a line may be `URL | what the photo shows`. Descriptions are used as the
     alt text verbatim; an undescribed photo gets alt="" (decorative) and the
     engine is forbidden from guessing. */
  function photos(){ return (state.photos || []).slice(0, 24); }
  function photoLine(p){ return p.url + (p.what ? "  —  " + p.what : ""); }
  function photoHosts(){ return photos().map(function(p){ try{ return new URL(p.url).host; }catch(e){ return ""; } }).filter(Boolean); }
  function photoBlock(){
    const list = photos();
    if(!list.length) return "";
    const told = list.filter(function(p){ return p.what; });
    return "\n<PHOTOS>\nTHE SUBJECT'S OWN PHOTOGRAPHS — use these and ONLY these as image sources, exactly as written:\n" +
      list.map(function(p, i){ return (i + 1) + ". " + photoLine(p); }).join("\n") +
      "\n" + (told.length
        ? "A photo followed by a description is the subject's own caption: put that text in the <img> alt attribute VERBATIM — it is the truth about that picture, and you cannot see the picture, so never replace it with your own guess."
        : "You cannot see these photographs. Do NOT invent descriptions of what they show.") +
      " For a photo with no description, use alt=\"\" (decorative) — never guess what it is. " +
      "Never invent an image URL, never use a stock or placeholder image service, never fake a photograph with a grey box. " +
      "loading=\"lazy\" on everything except the hero. " +
      "If you need a texture, a divider or an icon, draw it in CSS or inline SVG.\n</PHOTOS>\n";
  }

  /* A CLIENT's page must not leave the builder wearing OUR tokens. This measures
     it and names it — it never silently rewrites the sovereign's file. The
     inverse is measured too: a PrAis page should wear the frozen three. */
  const OUR_MARKS = [
    { what:"PrAis purple #a855f7",        re:/#a855f7/i },
    { what:"PrAis gold #f59e0b",          re:/#f59e0b/i },
    { what:"the PrAis ground #0f0f1a",    re:/#0f0f1a/i },
    { what:"the name PrAis",              re:/\bpr[\s-]?ais\b/i },
    { what:"the Orbitron display face",   re:/orbitron/i }
  ];
  function brandAudit(html, owner){
    if(owner === "client")
      return { ok: !OUR_MARKS.some(m => m.re.test(html)), leaks: OUR_MARKS.filter(m => m.re.test(html)).map(m => m.what) };
    const wear = { system:/#a855f7/i.test(html), reward:/#f59e0b/i.test(html), ground:/#0f0f1a/i.test(html) };
    return { ok: wear.system && wear.reward, wear:wear, leaks:[] };
  }

  /* THE LANDING CHECK. The research in RESEARCH-LANDING-PAGES.md, made measurable:
     every fundamental is a boolean on the finished file, and what is missing is
     NAMED in the log. It never rewrites the sovereign's page. `isLanding` says
     whether "one CTA" and "proof" are the law or just a note — a CV and a dashboard
     are documents, and a document without a call to action is correct. */
  const CTA_RE   = /(\bbook\b|\breserve\b|\border\b|\bget\b|\bstart\b|\bcall\b|whatsapp|\benquir|\binquir|\bcontact\b|sign\s?up|\bbuy\b|\bapply\b|\bdownload\b|free)/i;
  const PROOF_RE = /(testimonial|review|\btrusted by\b|\brated\b|\brating\b|\u2605|as seen|\baward)|(\d(\.\d)?\s*\/\s*(5|10))/i;
  function landingAudit(html, isLanding, allowHosts){
    const h = String(html || "");
    const allow = (allowHosts || []).map(function(s){ return String(s).toLowerCase(); });
    const title = ((h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,""])[1] || "").trim();
    const desc  = ((h.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || [,""])[1] || "").trim();
    const vp    = /<meta[^>]+name=["']viewport["']/i.test(h);
    const h1s   = (h.match(/<h1[\s>]/gi) || []).length;
    const cta   = /<button[\s>]/i.test(h) || /class=["'][^"']*\b(btn|cta|button)\b/i.test(h) || CTA_RE.test(h);
    const act   = /href=["'](tel:|mailto:|https?:\/\/(wa\.me|api\.whatsapp\.com|zalo)[^"']*|#(book|books|booking|contact|reserve))/i.test(h) || /<form[\s>]/i.test(h);
    const proof = PROOF_RE.test(h);
    const imgs  = h.match(/<img[\s>][^>]*>/gi) || [];
    const noAlt = imgs.filter(t => !/\balt=/i.test(t)).length;
    /* ASSET references only — a link to wa.me is the call to action, not an asset. */
    const ext   = (h.match(/<link[^>]+href=["']https?:\/\/[^"']+["']|<img[^>]+src=["']https?:\/\/[^"']+["']|<script[^>]+src=["']https?:\/\/[^"']+["']|<source[^>]+srcset=["']https?:\/\/[^"']+["']|<video[^>]+src=["']https?:\/\/[^"']+["']/gi) || []).filter(function(u){
      if(/fonts\.(googleapis|gstatic)\.com|schema\.org/i.test(u)) return false;
      return !allow.some(function(host){ return u.toLowerCase().indexOf(host) !== -1; });
    });
    const style = /<style[\s>]/i.test(h);
    const checks = [
      { id:"title",         ok: title.length >= 15 && title.length <= 70, note: title ? (title.length + " chars") : "missing", soft:false },
      { id:"description",   ok: desc.length >= 50 && desc.length <= 170,  note: desc  ? (desc.length + " chars")  : "missing", soft:false },
      { id:"viewport",      ok: vp,                    note: vp ? "" : "missing", soft:false },
      { id:"one h1",        ok: h1s === 1,             note: h1s + " found", soft:false },
      { id:"one CTA",       ok: cta,                   note: cta ? "" : "no button and no action verb", soft:!isLanding },
      { id:"way to act",    ok: act,                   note: act ? "" : "no form, tel:, mailto: or booking link", soft:!isLanding },
      { id:"proof",         ok: proof,                 note: proof ? "" : "no proof signal", soft:!isLanding },
      { id:"alts",          ok: noAlt === 0,           note: imgs.length ? (noAlt + "/" + imgs.length + " <img> without alt") : "no <img>", soft:false },
      { id:"no external assets", ok: ext.length === 0, note: ext.length ? (ext.length + " external ref(s) beyond fonts") : "", soft:false },
      { id:"inline css",    ok: style,                 note: style ? "" : "no <style> block — not one file", soft:false }
    ];
    const hard  = checks.filter(c => !c.ok && !c.soft);
    const soft  = checks.filter(c => !c.ok &&  c.soft);
    return { checks:checks, misses:hard.map(missLine), notes:soft.map(missLine), pass: hard.length === 0,
             landing:!!isLanding, ok:checks.filter(c=>c.ok).length, total:checks.length };
    function missLine(c){ return c.id + (c.note ? " (" + c.note + ")" : ""); }
  }

  function $(id){ return document.getElementById(id); }
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }
  function kb(n){ return n < 1024 ? n + " B" : (n/1024).toFixed(1) + " KB"; }

  /* =========================================================== the ledger */
  function loadLedger(){ try{ return JSON.parse(localStorage.getItem(MEM_KEY) || "null") || { runs:[], soul:[] }; }catch(e){ return { runs:[], soul:[] }; } }
  function saveLedger(L){ try{ localStorage.setItem(MEM_KEY, JSON.stringify(L)); }catch(e){} }
  let ledger = loadLedger();

  function currentRun(){
    const last = ledger.runs.length ? ledger.runs[ledger.runs.length-1] : null;
    const now = new Date().toDateString();
    if(!last || new Date(last.t).toDateString() !== now){
      const run = { run: ledger.runs.length + 1, t: Date.now(), closed:false, soulCount:0 };
      ledger.runs.push(run); saveLedger(ledger); return run;
    }
    return last;
  }
  const curRun = currentRun();
  const runNo = curRun.run;

  function captureSoul(text, footnote){
    const entry = { t: Date.now(), role:"sovereign", run: runNo, text: String(text), footnote: footnote || null };
    curRun.soulCount = (curRun.soulCount || 0) + 1;
    ledger.soul.push(entry);
    saveLedger(ledger);
    if(window.cgnMarkDirty) window.cgnMarkDirty();
    paintStats();
    return entry;
  }
  function soulCount(){ return ledger.soul.reduce((n,e) => n + String(e.text || "").length, 0); }

  /* =========================================================== the library
     kv `sites` is the durable home; localStorage is only a mirror so the list is
     readable before kv opens. If neither writes, the library lives for the
     session and SAYS SO (fail closed — never a silent loss). */
  const lib = { rows: [], durable: true };

  async function libLoad(){
    try{
      if(root && root.kv && root.kv.sites){
        const v = await root.kv.sites.get("library");
        if(Array.isArray(v)) { lib.rows = v; lib.durable = true; paintLib(); return; }
      }
    }catch(e){ lib.durable = false; }
    try{ const raw = localStorage.getItem(LIB_KEY); lib.rows = raw ? JSON.parse(raw) : []; }catch(e){ lib.rows = []; }
    paintLib();
  }
  async function libSave(){
    lib.rows = lib.rows.slice(0, MAX_LIB);
    let ok = false;
    try{ if(root && root.kv && root.kv.sites){ await root.kv.sites.set("library", lib.rows); ok = true; } }catch(e){}
    try{ localStorage.setItem(LIB_KEY, JSON.stringify(lib.rows)); ok = true; }catch(e){}
    lib.durable = ok;
    paintLib();
  }

  /* =========================================================== the model */
  /* THE LANDING-PAGE LAW. The market research (RESEARCH-LANDING-PAGES.md: Unbounce
     "The Anatomy of a Landing Page" + HubSpot's 2025 best-practice list) compressed
     to what a builder can obey. It goes into the static prefix, so it is a rule the
     model is held to — and landingAudit() measures the finished file against it,
     because a principle that is never measured is a decoration. */
  const LANDING_RULES = [
    "1. ONE conversion goal. The whole page pushes a single action; every other link either serves it or goes. No nav competing with the call to action (same-page anchors are fine).",
    "2. Above the fold = the claim AND the action, without scrolling: a benefit-first <h1>, one supporting line, the call to action.",
    "3. Benefits before features. Lead each block with the impact on the visitor; the feature is the reason it is true.",
    "4. Proof is specific and never faked. Named, concrete, checkable. If real proof does not exist, write honest placeholder copy — never an invented review, person, or price.",
    "5. ONE call to action, repeated down the page with the SAME words and the same target. Specific beats generic: \"Book a free diagnostic\" ≫ \"Learn more\".",
    "6. Speed: no external assets beyond Google Fonts, few animations, imagery drawn as inline SVG/CSS or already local. Nothing that needs a network to look right.",
    "7. Mobile first: 390px is the design target, >=44px tap targets, no horizontal overflow at any width.",
    "8. The last screen asks again, and there is a real way to act — a working form, tel:, mailto:, wa.me, or a booking anchor. A page with no way to convert is a brochure.",
    "9. Never invent a person, a review, a price, a photo, or a URL."
  ].join("\n");

  /* The static prefix — identical on every call in a build (cache-friendly). */
  const SITE_SYS =
    "You are PR-01, the web build engine of the PrAis command station. You build real, complete, working websites.\n" +
    "RULES:\n" +
    "· Output ONLY the file's contents. No commentary, no explanation, no fences, no preamble.\n" +
    "· ONE self-contained file: all CSS in <style> in <head>, all JS in one <script> before </body>. No build step, no framework CDN.\n" +
    "· It must WORK when the file is opened on its own, offline. Real interactivity, real content — never lorem ipsum, never a mock-up.\n" +
    "· Responsive down to 390px and up to 1920px. No horizontal overflow. Tap targets >= 44px.\n" +
    "· Semantic HTML, accessible: real <h1>/<h2>, alt text, labels, aria where it earns it, visible focus.\n" +
    "· Google Fonts via <link> are allowed and encouraged; no other external asset (no image CDNs, no icon fonts).\n" +
    "· Draw any imagery yourself as inline SVG or CSS gradients. Never invent a URL for a picture.\n" +
    "· If the site is multi-page, put every page in the same file as a <section> view with a tiny hash router (#/, #/about, …) and a working nav.\n" +
    "· Write real copy for the brief — specific, in the language the brief implies (English or Vietnamese). No placeholders.\n" +
    "\nLANDING-PAGE LAW (the market research, and it is measured on the finished file):\n" + LANDING_RULES + "\n";

  /* THE CLIENT INTAKE. A client page is not our page, and "half-branded" is the
     failure mode: our purple somewhere in a client's footer. paletteFor writes
     the rule into the prompt, and brandAudit() measures the finished file
     against it (below) — a warning that is named, never a silent rewrite. */
  function paletteFor(owner, colourText, clientName){
    if(owner === "prais")
      return "PR-01's own palette (FROZEN — do not change these three): system " + FROZEN.system +
             " (links, accents, active state) · reward " + FROZEN.reward + " (value, price, the call to action) · ground " +
             FROZEN.ground + " (the page background). Dark ground, light text, glass panels, uppercase letter-spaced display headings.";
    const own = String(colourText || "").trim();
    const who = String(clientName || "").trim();
    return "THE CLIENT'S OWN PALETTE — this is NOT a PrAis page." +
           (who ? " The client is \"" + who + "\" and the page belongs to them." : "") +
           " Never use PrAis purple #a855f7, never PrAis gold #f59e0b, never the PrAis ground #0f0f1a as a brand colour, never the word PrAis, and never the Orbitron display face — unless the client's own brand happens to be exactly one of those." +
           (own ? (" The client supplied: " + own + ". Build the palette around it.") : " Choose a restrained, professional palette that fits the brief.") +
           " The page must look like the client's, not like something we shipped.";
  }

  const PLAN_SYS =
    "You are PR-01, the web build engine of the PrAis command station.\n" +
    "Return ONLY a section plan for the site described, one line per section, exactly in the form:\n" +
    "NAME — one line saying what the section does and the ONE thing it must get across.\n" +
    "6 to 12 lines. No preamble, no fences, no commentary, no numbering.";

  const state = { busy:false, stop:false, current:null, plan:[], files:[], preview:null, owner:"prais", shape:"one landing page", design:"freehand", photos:[] };

  function log(msg, cls){
    const el = $("logBody");
    if(!el) return;
    const d = document.createElement("div");
    d.className = "ln" + (cls ? " " + cls : "");
    d.textContent = (cls === null ? "" : "› ") + msg;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
  }
  function toast(msg, cls){
    const el = $("toastEl");
    if(!el) return;
    const d = document.createElement("div");
    d.className = "toast" + (cls ? " " + cls : "");
    d.textContent = msg;
    el.appendChild(d);
    setTimeout(() => d.remove(), 4200);
  }
  function speak(text){
    if(!state.voice) return;
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[*#`_~\[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 600));
      speechSynthesis.speak(u);
    }catch(e){}
  }

  async function plan(brief, palette){
    const d = design();
    const out = await root.generateText({
      instruction: PLAN_SYS + "\n\n<BRIEF>\n" + brief + "\n</BRIEF>\n\n<PALETTE>\n" + palette + "\n</PALETTE>\n"
        + designBlock()
        + (d.planNote ? ("\n<SHAPE>\n" + d.planNote + "\n</SHAPE>\n") : "")
    });
    const text = String(out && out.text || "").trim();
    const rows = [];
    for(const line of text.split("\n")){
      const m = /^\s*([A-Za-z0-9][^—:-]{0,42}?)\s*[—:-]\s*(.+)$/.exec(line);
      if(m) rows.push({ name:m[1].trim(), what:m[2].trim() });
      else if(/^\s*\S/.test(line) && line.trim()) rows.push({ name:"", what:line.replace(/^\s*[-*\d.]+\s*/, "").trim() });
    }
    state.plan = rows.slice(0, 14);
    paintPlan();
    return state.plan;
  }

  /* ---- the part-based file writer (the reply cap is ~1024 tokens) ----
     THE CAP DOES NOT ASK PERMISSION. It can cut a reply mid-CSS with no
     <<<MORE>>> at the end, so "is this file finished?" is measured on the FILE
     (does it reach </html>?), never on the model's manners. Verified against the
     real model 2026-09-23: part 1 came back at 3.2 KB, cut inside <style>, with
     no marker — the old loop called that "complete" and filed a page with no
     <body>. It now continues. */
  async function genFile(name, brief, planText, palette, onTick){
    let body = "";
    const isHtml = /\.html?$/i.test(name);
    for(let part = 1; part <= MAX_PARTS; part++){
      if(state.stop) break;
      const head = SITE_SYS
        + "\n<BRIEF>\n" + brief + "\n</BRIEF>\n"
        + (planText ? "\n<PLAN>\n" + planText + "\n</PLAN>\n" : "")
        + "\n<PALETTE>\n" + palette + "\n</PALETTE>\n"
        + designBlock() + photoBlock();
      const designRule = design().grammar
        ? " Follow the DESIGN grammar above exactly for structure, rhythm and restraint — it is a shipped design, not a suggestion — while all content is written fresh for this brief."
        : "";
      const instruction = part === 1
        ? head + "\nTASK: write the file \"" + name + "\" in full." + designRule + " Output ONLY the file's contents. "
          + "Your reply is capped and you will often run out of room mid-file — that is expected. But a reply that stops BEFORE the file is finished MUST end with the exact line <<<MORE>>> and nothing after it. Never stop mid-file without that marker."
        : head + "\nFILE \"" + name + "\" SO FAR:\n<<<\n" + body + "\n>>>\n\nTASK: CONTINUE this file from exactly where it stops." + designRule + " "
          + "Do not repeat anything already written, do not re-open the file, no preamble. Output only the continuation text. "
          + "Carry it to the end this time. If you again run out of room before the file is finished, end with exactly <<<MORE>>> and nothing after it; only if the file is already complete, reply with exactly <<<END>>> and nothing else.";
      const p = root.generateText({
        instruction,
        onChunk: (d) => { if(onTick) onTick(part, body.length + String(d.fullTextSoFar || "").length); }
      });
      state.current = p;
      const out = await p;
      state.current = null;
      if(state.stop) break;
      let t = String(out && out.text || "");
      const more = PART_MARK.test(t);
      const wasEnd = END_MARK.test(t) && !t.replace(END_MARK, "").trim();
      t = t.replace(PART_MARK, "").replace(END_MARK, "");
      const piece = part === 1 ? stripFence(t) : t.replace(/\s+$/, "");
      if(!piece && !more) break;
      body += (body && !body.endsWith("\n") && piece && !piece.startsWith("\n") ? "\n" : "") + piece;
      const finished = isHtml ? /<\/html>\s*$/i.test(body) : !more;
      log("part " + part + " · " + kb(body.length) + " so far" + (finished ? " · complete" : " · unfinished — asking to continue"));
      /* keep writing while the FILE is unfinished; a bare <<<END>>> is the model
         insisting it is done, so we stop and let the warning speak. */
      if(finished || wasEnd) break;
    }
    return stripFence(body);
  }
  function stripFence(s){
    let x = String(s || "").trim();
    x = x.replace(/^```[A-Za-z0-9._+-]*\s*\n/, "").replace(/\n?```\s*$/, "");
    return x.trim();
  }

  /* =========================================================== the build */
  async function build(briefIn){
    if(state.busy) return;
    const brief = String(briefIn != null ? briefIn : ($("briefInput") ? $("briefInput").value : "")).trim();
    if(!brief){ toast("Type the brief first.", "bad"); return; }

    const clientName = state.owner === "client" && $("clientNameInput") ? $("clientNameInput").value.trim() : "";

    /* the subject's own photos — hosted URLs, ONE PER LINE, each optionally
       followed by what it shows:  https://…jpg | the rooftop at night */
    state.photos = ($("photoInput") ? $("photoInput").value : "").split(/\r?\n/)
      .map(function(line){
        const parts = String(line).split(/\s*\|\s*|\s+—\s+|\s+--\s+/);
        const url = String(parts.shift() || "").trim();
        return { url:url, what: parts.join(" ").trim() };
      }).filter(function(p){ return /^https?:\/\//i.test(p.url); });

    /* SOUL FIRST — verbatim, before any model call (L37/L38/L39). */
    captureSoul(brief, "site brief — run " + runNo + " · " + state.owner + (clientName ? ":" + clientName : "") + " · " + state.shape + " · design: " + state.design);

    state.busy = true; state.stop = false;
    $("buildBtn").disabled = true; $("planBtn").disabled = true; $("stopBtn").hidden = false;
    $("buildBtn").innerHTML = '<span class="spin"></span> Building…';
    $("logBody").innerHTML = "";
    const palette = paletteFor(state.owner, $("colourInput") ? $("colourInput").value : "", clientName);
    const shape = state.shape;
    const fullBrief = Shape(brief, shape, state.owner);

    try{
      log("brief captured verbatim · soul " + ledger.soul.length + " · run " + runNo, "gd");
      log("design — " + design().label + (design().blurb ? " (" + design().blurb + ")" : ""));

      if(!state.plan.length){
        log("planning the sections…");
        await plan(fullBrief, palette);
        log("plan ready — " + state.plan.length + " sections", "ok");
      }

      const planText = state.plan.map((r,i) => (i+1) + ". " + (r.name ? r.name + " — " : "") + r.what).join("\n");
      log("writing index.html in parts…");
      const body = await genFile("index.html", fullBrief, planText, palette, (p,n) => {
        $("prevMeta").textContent = "part " + p + " · " + kb(n);
      });
      state.current = null;
      if(state.stop && !body){ log("stopped — nothing came back", "bad"); return; }
      if(!body) throw new Error("nothing came back from the model");
      const complete = /<\/html>\s*$/i.test(body);
      if(!complete) log("WARNING — the file never reached </html>; it is short of complete. Rebuild, or use a smaller Shape.", "bad");

      state.files = [{ name:"index.html", body:body, complete:complete }];
      state.preview = { name:"index.html", body:body };
      paintFiles(); paintPreview();
      log("built — " + kb(body.length) + (state.stop ? " (stopped, kept what arrived)" : ""), state.stop ? "nt" : "ok");

      /* MEASURED, NOT ASSUMED — the brand check on the finished file. */
      const audit = brandAudit(body, state.owner);
      if(state.owner === "client"){
        if(audit.leaks.length){
          log("brand check — this CLIENT page still wears OURS: " + audit.leaks.join(" · ") + ". It is the client's page; fix the palette and rebuild.", "nt");
          toast("The client page still carries our brand marks — see the log.", "nt");
        } else {
          log("brand check — no PrAis marks in the client's page ✧", "gd");
        }
      } else {
        const w = audit.wear;
        log("brand check — frozen tokens: " + (w.system ? "system ✓" : "system ✗") + " · " + (w.reward ? "reward ✓" : "reward ✗") + " · " + (w.ground ? "ground ✓" : "ground ✗"),
            w.system && w.reward ? "gd" : "nt");
      }

      /* MEASURED, NOT ASSUMED — the landing law on the finished file. */
      const landing = landingAudit(body, shape === "one landing page", photoHosts());
      if(landing.misses.length)
        log("landing check — " + landing.misses.length + " of " + landing.total + " fundamentals missing: " + landing.misses.join(" · ") + (landing.notes.length ? " · note: " + landing.notes.join(" · ") : ""), landing.misses.length > 2 ? "nt" : "ok");
      else
        log("landing check — every fundamental present (" + landing.ok + "/" + landing.total + ")" + (landing.notes.length ? " · note: " + landing.notes.join(" · ") : "") + " ✧", "gd");

      const rec = { id:"s" + Date.now().toString(36), t:Date.now(), brief:brief, owner:state.owner, shape:shape,
                    design:state.design, client:clientName || null, audit:audit, landing:landing, complete:complete,
                    plan:state.plan.slice(), palette:palette, files:state.files.slice() };
      lib.rows.unshift(rec);
      await libSave();
      log("filed in the library · " + lib.rows.length + " site(s)", "ok");
      toast("Built — " + kb(body.length) + ". Previewed and filed.", "ok");
      speak("The site is built and previewing.");
    }catch(e){
      const m = (e && e.message) || String(e);
      log("the build failed — " + m, "bad");
      toast("Build failed: " + m, "bad");
    }finally{
      state.busy = false; state.stop = false; state.current = null;
      $("buildBtn").disabled = false; $("planBtn").disabled = false; $("stopBtn").hidden = true;
      $("buildBtn").innerHTML = "✦ Build the site";
      paintStats();
    }
  }

  function Shape(brief, shape, owner){
    let s = brief + "\n\nDELIVERABLE: " + shape + ".";
    if(shape.indexOf("multi-page") !== -1) s += " Implement every page as an in-file <section> view with a tiny hash router and a working nav.";
    if(shape.indexOf("dashboard") !== -1) s += " It is an internal tool: real controls, real state, a working data view (seeded demo data in JS is fine — labelled as demo).";
    if(owner === "client") s += " This is a CLIENT's site — the client's brand, not PrAis's.";
    else s += " This is a PrAis site — wear the frozen three tokens exactly.";
    return s;
  }

  async function run(){
    if(state.busy){ toast("Still building — stop it first.", "bad"); return; }
    const brief = String($("briefInput") ? $("briefInput").value : "").trim();
    if(!brief){ toast("Type the brief first.", "bad"); return; }
    state.busy = true; $("planBtn").disabled = true;
    $("planBtn").innerHTML = '<span class="spin"></span> Planning…';
    try{
      captureSoul(brief, "site plan only — run " + runNo + " · design: " + state.design);
      $("logBody").innerHTML = "";
      log("design — " + design().label);
      await plan(Shape(brief, state.shape, state.owner), paletteFor(state.owner, $("colourInput") ? $("colourInput").value : "", $("clientNameInput") ? $("clientNameInput").value.trim() : ""));
      log("plan ready — " + state.plan.length + " sections (nothing written yet)", "ok");
    }catch(e){
      log("planning failed — " + ((e && e.message) || e), "bad");
    }finally{
      state.busy = false; $("planBtn").disabled = false; $("planBtn").innerHTML = "🧭 Plan it";
      paintStats();
    }
  }

  /* =========================================================== preview */
  function paintPreview(){
    const box = $("prevBox");
    if(!box) return;
    if(!state.preview){ box.innerHTML = '<div class="sb-empty">The preview is sandboxed — scripts run, but the page cannot reach this station\'s storage or network. Build a site to see it here.</div>'; return; }
    box.innerHTML = '<iframe sandbox="allow-scripts allow-modals allow-forms" title="site preview" srcdoc="' + esc(state.preview.body) + '"></iframe>';
    $("prevMeta").textContent = state.preview.name + " · " + kb(state.preview.body.length);
  }
  function paintFiles(){
    const el = $("fileBody");
    if(!el) return;
    if(!state.files.length){ el.innerHTML = '<div class="hint">Nothing built yet.</div>'; return; }
    el.innerHTML = state.files.map((f,i) =>
      '<div class="sb-file"><span class="nm" data-open="' + i + '" title="preview ' + esc(f.name) + '">📄 ' + esc(f.name) + '</span>'
      + '<span class="sz">' + kb(f.body.length) + '</span>'
      + '<button class="x" data-dl="' + i + '" title="download">⬇</button></div>').join("");
    el.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { state.preview = state.files[+b.dataset.open]; paintPreview(); });
    el.querySelectorAll("[data-dl]").forEach(b => b.onclick = () => download(state.files[+b.dataset.dl]));
  }
  function download(f){
    if(!f) return;
    try{
      const url = URL.createObjectURL(new Blob([f.body], { type:"text/html" }));
      const a = document.createElement("a");
      a.href = url; a.download = f.name || "index.html";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast("Downloaded " + (f.name || "index.html"));
    }catch(e){ toast("Download failed: " + ((e && e.message) || e), "bad"); }
  }
  function openTab(){
    if(!state.preview){ toast("Nothing to open — build first.", "bad"); return; }
    try{
      const url = URL.createObjectURL(new Blob([state.preview.body], { type:"text/html" }));
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 20000);
    }catch(e){ toast("Could not open a tab: " + ((e && e.message) || e), "bad"); }
  }

  /* =========================================================== the library UI */
  function paintLib(){
    const el = $("libBody");
    if(!el) return;
    if(!lib.rows.length){ el.innerHTML = '<div class="hint">No sites filed yet.</div>'; return; }
    el.innerHTML = lib.rows.map((r,i) =>
      '<div class="sb-file"><span class="nm" data-libopen="' + i + '" title="' + esc(r.brief) + (r.design && r.design !== "freehand" ? " · design: " + esc(r.design) : "") + (r.client ? " · client: " + esc(r.client) : "") + '">' +
      (r.owner === "prais" ? "◈ " : "◇ ") + (r.design && r.design !== "freehand" ? "❖ " : "") + esc(String(r.brief).slice(0, 52)) + (String(r.brief).length > 52 ? "…" : "") +
      '</span><span class="sz">' + new Date(r.t).toLocaleDateString() + ' · ' + kb((r.files[0] || {}).body ? r.files[0].body.length : 0) +
      (r.audit && r.audit.leaks && r.audit.leaks.length ? ' <i style="color:var(--notice); font-style:normal" title="this client page still wears our tokens: ' + esc(r.audit.leaks.join(", ")) + '">⚠</i>' : "") +
      (r.complete === false ? ' <i style="color:var(--bad); font-style:normal" title="this file never reached </html> — it is short of complete">⛔</i>' : "") +
      (r.landing && r.landing.misses && r.landing.misses.length ? ' <i style="color:var(--notice); font-style:normal" title="the landing check missed: ' + esc(r.landing.misses.join(", ")) + '">◐</i>' : "") +
      '</span>' +
      '<button class="x" data-libdl="' + i + '" title="download">⬇</button>' +
      '<button class="x" data-libdel="' + i + '" title="delete">✕</button></div>'
      + (lib.durable ? "" : '<div class="hint" style="padding:2px 0 6px">⚠ storage refused the write — this entry lives for the session only</div>')
    ).join("");
    el.querySelectorAll("[data-libopen]").forEach(b => b.onclick = () => { const r = lib.rows[+b.dataset.libopen]; if(r){ state.files = r.files.slice(); state.plan = (r.plan || []).slice(); state.preview = state.files[0]; paintFiles(); paintPlan(); paintPreview(); toast("Opened"); } });
    el.querySelectorAll("[data-libdl]").forEach(b => b.onclick = () => { const r = lib.rows[+b.dataset.libdl]; if(r) download(r.files[0]); });
    el.querySelectorAll("[data-libdel]").forEach(b => b.onclick = async () => { lib.rows.splice(+b.dataset.libdel, 1); await libSave(); toast("Removed from this browser"); });
  }

  function paintPlan(){
    const card = $("planCard"), el = $("planBody");
    if(!card || !el) return;
    if(!state.plan.length){ card.hidden = true; return; }
    card.hidden = false;
    el.innerHTML = state.plan.map((r,i) => '<div class="pr"><i>' + String(i+1).padStart(2,"0") + '</i><div>' +
      (r.name ? "<b>" + esc(r.name) + "</b> — " : "") + esc(r.what) + "</div></div>").join("");
  }

  /* =========================================================== deploy — the truth */
  function paintDeploy(){
    const el = $("deployBody");
    if(!el) return;
    const hasCf = (() => { try{ return !!localStorage.getItem("obi_cf_token"); }catch(e){ return false; } })();
    el.innerHTML =
      '<div class="sb-dep ' + (hasCf ? "ok" : "blocked") + '">'
      + '<div class="dt">Cloudflare · the host<span class="st">' + (hasCf ? "TOKEN PRESENT" : "BLOCKED") + '</span></div>'
      + '<div class="dd">' + (hasCf
          ? "A token exists in this generator's storage. The deploy itself is the Cloudflare build — run it from a checkout:"
          : "No Cloudflare token in <b>this generator's</b> storage (the station's vault key is on another origin and cannot be read from here). The deploy cannot be measured, so it reads BLOCKED rather than guessed. The build itself is already in the tree:") + '</div>'
      + '<pre>cd src/cloudflare\nnpm install\nnpx wrangler login\nnpm run deploy          # build.mjs asserts every &lt;script src="src/…"&gt; resolves</pre>'
      + '<div class="dd">One Worker, two Durable Objects. The same codebase runs at <b>localhost:8787</b> with <code>npm run dev</code>.</div>'
      + '</div>'
      + '<div class="sb-dep gate">'
      + '<div class="dt">GitHub · the ONE authority<span class="st">GATE</span></div>'
      + '<div class="dd">This generator cannot write the authority repo — that write is the <b>station\'s</b> path and it is armed by PHOENIXOMEGAPROTOCOL (no Canon change without Sov100). Everything lands under:</div>'
      + '<pre>Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-  (master)\n  OPERATIONS/COMMANDSTATION/…</pre>'
      + '<div class="dd">Hand the built file to the station and run <code>/forge apply</code> or <code>/canon sync</code> there, gate armed.</div>'
      + '</div>'
      + '<div class="sb-dep">'
      + '<div class="dt" style="font-size:11px">What this generator CAN do with the file</div>'
      + '<div class="dd">Preview it sandboxed, download it, keep it in the local library. It never uploads, never publishes, never touches Git.</div>'
      + '</div>';
  }

  /* =========================================================== chrome */
  function paintStats(){
    const el = $("statsEl");
    if(!el) return;
    el.innerHTML = 'RUN <b>' + runNo + '</b> · soul <b>' + soulCount() + '</b> · captures <b>' + ledger.soul.length + '</b> · sites <b>' + lib.rows.length + '</b>' + (lib.durable ? "" : " · ⚠ not durable");
  }
  function showMemory(){
    const p = $("memoryPanel");
    if(!p) return;
    p.classList.toggle("hidden");
    if(p.classList.contains("hidden")) return;
    $("memStats").innerHTML = 'RUN <b>' + runNo + '</b> · captures <b>' + ledger.soul.length + '</b> · soulcount <b>' + soulCount() + '</b> · the ledger is <b>obi_sdnad</b>, the same key the station reads';
    const list = $("memList");
    list.innerHTML = "";
    const items = ledger.soul.slice().reverse().slice(0, 40);
    if(!items.length){ list.innerHTML = '<div class="hint">Nothing captured yet — your next brief is recorded here verbatim.</div>'; return; }
    for(const e of items){
      const d = document.createElement("div");
      d.className = "mem-item";
      d.innerHTML = '<div class="mh">RUN ' + (e.run == null ? "—" : e.run) + " · " + new Date(e.t).toLocaleString() + '</div><div class="mq">' + esc(e.text) + '</div>';
      list.appendChild(d);
    }
  }

  /* =========================================================== the command face
     The documented interface (README) is real here — every one of these is the
     same function the buttons call. */
  async function runCmd(cmd){
    const s = String(cmd || "").trim();
    if(!s) return;
    if(s[0] !== "/"){ if($("briefInput")) $("briefInput").value = s; return; }
    const m = /^\/([A-Za-z-]+)\s*([\s\S]*)$/.exec(s);
    const verb = (m ? m[1] : "").toLowerCase(), arg = (m ? m[2] : "").trim();
    switch(verb){
      case "plan":  if(arg && $("briefInput")) $("briefInput").value = arg; await run(); break;
      case "build": if(arg && $("briefInput")) $("briefInput").value = arg; await build(); break;
      case "sites": showMemory(); toast(lib.rows.length + " site(s) in the library"); break;
      case "open": {
        const i = Math.max(0, (parseInt(arg, 10) || 1) - 1), r = lib.rows[i];
        if(!r){ toast("No site " + (i+1), "bad"); break; }
        state.files = r.files.slice(); state.plan = (r.plan || []).slice(); state.preview = state.files[0];
        paintFiles(); paintPlan(); paintPreview(); toast("Opened"); break;
      }
      case "dl": {
        const i = Math.max(0, (parseInt(arg, 10) || 1) - 1), r = lib.rows[i];
        if(!r){ toast("No site " + (i+1), "bad"); break; }
        download(r.files[0]); break;
      }
      case "design": {
        const id = String(arg || "").toLowerCase().replace(/[^a-z]/g, "");
        if(DESIGNS[id]) { setDesign(id); toast("Design — " + DESIGNS[id].label + " (plan cleared; it will be replanned)"); }
        else toast("Designs: freehand · cv · portfolio — the shape library is the wing's own shipped sites.", "bad");
        break;
      }
      case "brand":
        setOwner(/off|client/i.test(arg) ? "client" : "prais");
        toast("Generated sites will " + (state.owner === "prais" ? "wear the frozen brand" : "use the client's colours"));
        break;
      case "deploy": paintDeploy(); toast("The two paths — and their honest state — are in the deploy card"); break;
      case "help":
        toast("/plan <brief> · /build <brief> · /sites · /open <n> · /dl <n> · /brand on|off · /design freehand|cv|portfolio · /deploy");
        break;
      default: toast("Unknown command — /help", "bad");
    }
  }

  /* =========================================================== wiring */
  function setOwner(o){
    state.owner = o;
    document.querySelectorAll("#ownerChips .chip").forEach(c => c.classList.toggle("on", c.dataset.owner === o));
    if($("siteColourRow")) $("siteColourRow").hidden = (o !== "client");
  }

  /* a design is the shape library (examples/) — picking one replans, because the
     sections are the shape's own. */
  function setDesign(id){
    if(!DESIGNS[id]) return;
    state.design = id;
    document.querySelectorAll("#designChips .chip").forEach(c => c.classList.toggle("on", c.dataset.design === id));
    state.plan = []; paintPlan();
  }

  function boot(){
    /* buttons */
    const planBtn = $("planBtn"), buildBtn = $("buildBtn"), stopBtn = $("stopBtn");
    if(!planBtn || !buildBtn){ return; }   /* the shell is missing — say nothing, do nothing */
    planBtn.onclick = run;
    buildBtn.onclick = () => build();
    stopBtn.onclick = () => {
      state.stop = true;
      try{ if(state.current && state.current.stop) state.current.stop(); }catch(e){}
      log("stopping — keeping what has arrived", "nt");
    };
    if($("openBtn")) $("openBtn").onclick = openTab;
    if($("dlBtn")) $("dlBtn").onclick = () => download(state.preview || state.files[0]);
    if($("memoryBtn")) $("memoryBtn").onclick = showMemory;

    /* owner / shape chips */
    document.querySelectorAll("#ownerChips .chip").forEach(c => c.onclick = () => setOwner(c.dataset.owner));
    document.querySelectorAll("#shapeChips .chip").forEach(c => c.onclick = () => {
      state.shape = c.dataset.shape;
      document.querySelectorAll("#shapeChips .chip").forEach(x => x.classList.toggle("on", x === c));
      state.plan = []; paintPlan();       /* a new shape is a new plan */
    });
    document.querySelectorAll("#designChips .chip").forEach(c => c.onclick = () => setDesign(c.dataset.design));

    /* voice */
    state.voice = (() => { try{ return localStorage.getItem(VOICE_KEY) !== "off"; }catch(e){ return true; } })();
    const vb = $("voiceBtn");
    if(vb){
      const paint = () => { vb.classList.toggle("on", !!state.voice); if($("voiceLbl")) $("voiceLbl").textContent = state.voice ? "Voice on" : "Voice off"; };
      vb.onclick = () => { state.voice = !state.voice; try{ localStorage.setItem(VOICE_KEY, state.voice ? "on" : "off"); }catch(e){} paint(); };
      paint();
    }

    /* the command face */
    const ci = $("cmdInput"), cb = $("cmdBtn");
    if(ci && cb){
      cb.onclick = async () => { const v = ci.value; ci.value = ""; await runCmd(v); };
      ci.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); cb.click(); } });
    }

    paintDeploy(); paintPlan(); paintFiles(); paintPreview(); paintStats();
    libLoad();
    log("ready — type the brief, or /help for the command face.");
    log("this generator builds; it cannot publish. /deploy says so, with the two real paths.", "nt");

    /* deep link: ?brief=<text> (the way Obi routes work to a node) */
    try{
      const q = new URLSearchParams(location.search);
      const b = (q.get("brief") || q.get("p") || "").trim();
      if(b && $("briefInput")){ $("briefInput").value = b; build(b); }
    }catch(e){}
  }

  window.SiteBuilder = {
    run: runCmd, plan: run, build: build, lib: () => lib.rows,
    preview: () => (state.preview ? state.preview.body : null),
    soul: () => ({ run: runNo, captures: ledger.soul.length, soulcount: soulCount() }),
    status: () => ({ run: runNo, busy: state.busy, owner: state.owner, shape: state.shape, design: state.design, plan: state.plan.length,
                     files: state.files.length, sites: lib.rows.length, durable: lib.durable }),
    designs: () => Object.keys(DESIGNS),
    setDesign: setDesign,
    audit: (html, owner) => brandAudit(String(html || ""), owner || state.owner),
    landingAudit: (html, isLanding) => landingAudit(String(html || ""), isLanding === undefined ? true : !!isLanding),
    research: () => "RESEARCH-LANDING-PAGES.md — the market research behind the build, and the checks taken from it",
    deploy: paintDeploy
  };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
