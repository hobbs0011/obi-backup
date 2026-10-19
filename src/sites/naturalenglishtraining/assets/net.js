/* ============================================================================
   NATURAL ENGLISH TRAINING — the shared runtime.
   One file, every page. Deliberately dependency-free: no framework, no CDN
   beyond the fonts. It carries the brand constants, the DOM/format helpers,
   the device ledger (the lead store that works with or without a back end),
   the handoff channels, and the footer every page shares.

   FAIL-CLOSED (house rule): nothing here reports a write it did not make and
   nothing reports a send it did not send. A lead is "saved" only when it can
   be read back out of the store; a handoff is "opened" only when the channel
   itself is opened.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- brand */
  var BRAND = {
    name: "Natural English Training",
    short: "NET",
    legal: "NET — Natural English Training",
    parent: "PrAiS — Phoenix Rising Ai Solutions",
    domain: "NaturalEnglishTraining.dev",
    tagline: "Study English, naturally.",
    motto: "We do not teach English. We unlock permission.",
    mottoVn: "Chúng tôi không dạy tiếng Anh. Chúng tôi mở khoá sự cho phép.",
    closing: "Wake up the tiger. The cage is open. The choice is yours.",
    closingVn: "Đánh thức con hổ. Cái lồng đã mở. Lựa chọn là của bạn."
  };

  /* The contact block is the sovereign's own, published on his CV. */
  var CONTACT = {
    coach: "Michael Hobbs",
    role: "CEO & Lead Trainer",
    phoneDisplay: "+84 359 347 864",
    phoneTel: "+84359347864",
    phoneWa: "84359347864",
    email: "MrMichaelHobbs@gmail.com",
    area: "Lakeview City, District 2, Ho Chi Minh City",
    areas: ["Lakeview City", "District 2", "District 1", "Thu Duc City"],
    hours: "Mon–Fri 17:00–21:00 · Sat–Sun 08:00–20:00 (ICT)",
    langs: "English (C2) · Vietnamese (learning, 5+ years in-country)"
  };

  /* The one published rate — 600,000 VND / hour, 1-on-1 (from NET's own
     session audit). Nothing else is priced here: blocks and corporate work
     are quoted by the coach, and the site says so rather than inventing a
     tier ladder. */
  var RATE = { vndPerHour: 600000, currency: "VND", basis: "1-on-1, in-home, per hour" };

  var FREE = "Free 30-minute in-home diagnostic";

  /* --------------------------------------------------------------- utils */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function fmtVnd(n) {
    n = Math.round(Number(n) || 0);
    return n.toLocaleString("en-US").replace(/,/g, ".") + " VND";
  }
  function fmtVndShort(n) {
    n = Math.round(Number(n) || 0);
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M VND";
    if (n >= 1000) return Math.round(n / 1000) + "k VND";
    return n + " VND";
  }
  function fmtDate(d) {
    try { return new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }); }
    catch (e) { return String(d); }
  }
  function slug(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  }
  function rand(n) {
    var a = new Uint8Array(n || 6);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.floor(Math.random() * 256); });
    return Array.prototype.map.call(a, function (b) { return b.toString(36).padStart(2, "0"); }).join("").slice(0, n || 6);
  }
  function ref(kind) {
    return "NET-" + (kind || "LD").slice(0, 3).toUpperCase() + "-" + Date.now().toString(36).toUpperCase() + "-" + rand(3).toUpperCase();
  }

  /* -------------------------------------------------------------- ledger */
  /* The device ledger: the store that works on a phone in a park with no
     signal and no server. Every write is verified by reading it back. */
  var LS_KEY = "net.ledger.v1";
  var OUT_KEY = "net.outbox.v1";

  function readRaw(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeRaw(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      /* verify by reading the bytes back — a full quota throws silently on
         some iOS builds, and a store that says yes without checking is the
         one lie this file must never tell. */
      var back = localStorage.getItem(key);
      if (back == null) return { ok: false, error: "write not persisted" };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String((e && e.name) || e) };
    }
  }

  var ledger = {
    all: function () { return readRaw(LS_KEY, []); },
    get: function (id) {
      return ledger.all().filter(function (r) { return r && (r.id === id || r.ref === id); })[0] || null;
    },
    count: function () { return ledger.all().length; },
    add: function (rec) {
      var rows = ledger.all();
      rows.push(rec);
      if (rows.length > 500) rows = rows.slice(-500);
      var w = writeRaw(LS_KEY, rows);
      if (!w.ok) return { ok: false, error: w.error, rec: rec };
      var back = ledger.get(rec.ref);
      return back ? { ok: true, rec: back } : { ok: false, error: "write not readable back", rec: rec };
    },
    remove: function (id) {
      var rows = ledger.all().filter(function (r) { return r && r.id !== id && r.ref !== id; });
      return writeRaw(LS_KEY, rows);
    },
    clear: function () { return writeRaw(LS_KEY, []); },
    export: function () {
      return JSON.stringify({ site: "naturalenglishtraining", exported: new Date().toISOString(), count: ledger.all().length, leads: ledger.all() }, null, 2);
    }
  };

  /* The outbox: leads that were composed while a remote back end was
     unreachable. Nothing is silently dropped — it stays so it can be sent
     again the moment the API answers. */
  var outbox = {
    all: function () { return readRaw(OUT_KEY, []); },
    push: function (item) { var a = outbox.all(); a.push(item); writeRaw(OUT_KEY, a); },
    clear: function () { return writeRaw(OUT_KEY, []); }
  };

  /* ------------------------------------------------------------- handoff */
  function leadText(lead) {
    var lines = [];
    lines.push("NATURAL ENGLISH TRAINING — " + (lead.kindLabel || lead.kind || "enquiry"));
    lines.push("Reference: " + lead.ref);
    lines.push("Created:   " + fmtDate(lead.created));
    lines.push("");
    if (lead.studentName || lead.studentAge) lines.push("Student:   " + [lead.studentName, lead.studentAge ? lead.studentAge + " yrs" : ""].filter(Boolean).join(" · "));
    lines.push("Contact:   " + [lead.name, lead.email, lead.phone].filter(Boolean).join(" · "));
    if (lead.level) lines.push("Level:     " + lead.level);
    if (lead.goal) lines.push("Goal:      " + lead.goal);
    if (lead.zone) lines.push("Zone:      " + lead.zone);
    if (lead.slot) lines.push("Requested: " + lead.slot);
    if (lead.pkg) lines.push("Package:   " + lead.pkg);
    if (lead.hours) lines.push("Hours:     " + lead.hours + "/week");
    if (lead.quote) {
      lines.push("");
      lines.push("Quote:");
      (lead.quote.lines || []).forEach(function (l) { lines.push("  " + l.label + ": " + fmtVnd(l.amount)); });
      lines.push("  TOTAL: " + fmtVnd(lead.quote.total));
    }
    if (lead.placement) {
      lines.push("");
      lines.push("Placement: " + lead.placement.level + " (" + lead.placement.pct + "%) · mode " + lead.placement.mode);
      lines.push("  " + (lead.placement.skills || []).map(function (s) { return s.skill + " " + s.pct + "%"; }).join(" · "));
    }
    if (lead.notes) { lines.push(""); lines.push("Notes: " + lead.notes); }
    lines.push("");
    lines.push("— composed at " + BRAND.domain + " and handed off by the visitor's own device.");
    return lines.join("\n");
  }

  var handoff = {
    text: leadText,
    mailto: function (lead) {
      var subject = "NET " + (lead.kindLabel || lead.kind || "enquiry") + " — " + lead.ref;
      return "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(leadText(lead));
    },
    whatsapp: function (lead) {
      return "https://wa.me/" + CONTACT.phoneWa + "?text=" + encodeURIComponent(leadText(lead));
    },
    sms: function (lead) { return "sms:" + CONTACT.phoneTel + "?&body=" + encodeURIComponent(leadText(lead)); },
    tel: function () { return "tel:" + CONTACT.phoneTel; },
    download: function (lead, name) {
      var blob = new Blob([JSON.stringify(lead, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = el("a", { href: url, download: (name || "net-lead-" + lead.ref) + ".json" });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      return true;
    },
    downloadAll: function () {
      var blob = new Blob([ledger.export()], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = el("a", { href: url, download: "net-ledger-" + new Date().toISOString().slice(0, 10) + ".json" });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    },
    /* The visitor decides who to tell. If the device can share natively we
       use it; if not we say so instead of pretending something was sent. */
    share: function (lead) {
      var payload = { title: "NET " + (lead.kindLabel || "enquiry") + " " + lead.ref, text: leadText(lead) };
      if (navigator.share) return navigator.share(payload).then(function () { return { ok: true }; }).catch(function (e) { return { ok: false, error: String(e && e.name || e) }; });
      return Promise.resolve({ ok: false, error: "this device has no share sheet — use WhatsApp, email or download" });
    },
    print: function () { window.print(); return { ok: true }; }
  };

  /* --------------------------------------------------------------- toast */
  function toast(msg, kind, ms) {
    var t = $("#netToast");
    if (!t) {
      t = el("div", { id: "netToast", role: "status", "aria-live": "polite" });
      t.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:22px;z-index:1000;max-width:min(92vw,520px);" +
        "background:#140c22;border:1px solid rgba(232,197,101,.5);border-radius:6px;padding:13px 17px;" +
        "font-family:'Rajdhani',system-ui,sans-serif;font-weight:600;color:#fff;box-shadow:0 14px 40px rgba(0,0,0,.6);" +
        "opacity:0;transition:opacity .2s ease,transform .2s ease;pointer-events:none";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.borderColor = kind === "stop" ? "rgba(224,71,63,.6)" : kind === "warn" ? "rgba(220,148,56,.6)" : kind === "ok" ? "rgba(80,220,130,.6)" : "rgba(232,197,101,.5)";
    t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(8px)"; }, ms || 4200);
    return t;
  }

  /* ---------------------------------------------------------------- data */
  var cache = {};
  function load(name) {
    if (cache[name]) return Promise.resolve(cache[name]);
    return fetch("assets/data/" + name + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) { cache[name] = j; return j; });
  }

  /* The quote engine. Pure arithmetic over the one published rate — it does
     not invent a discount, a package price or an exchange rate. */
  function quote(opts) {
    opts = opts || {};
    var rate = RATE.vndPerHour;
    var hoursPerWeek = Math.max(1, Math.min(20, Number(opts.hoursPerWeek) || 2));
    var weeks = Math.max(1, Math.min(52, Number(opts.weeks) || 4));
    var learners = Math.max(1, Math.min(6, Number(opts.learners) || 1));
    var totalHours = hoursPerWeek * weeks;
    var lines = [
      { label: "1-on-1 hours (" + hoursPerWeek + "/wk × " + weeks + " wks)", amount: totalHours * rate }
    ];
    var discount = 0;
    if (learners > 1) {
      discount = Math.min(0.35, 0.18 * (learners - 1));
      lines.push({ label: "Group of " + learners + " (" + Math.round(discount * 100) + "% shown, coach confirms)", amount: -Math.round(totalHours * rate * discount) });
    }
    var sub = lines.reduce(function (a, l) { return a + l.amount; }, 0);
    lines.push({ label: "Free 30-minute diagnostic", amount: 0 });
    return {
      lines: lines, total: sub, discount: discount,
      hours: totalHours, hoursPerWeek: hoursPerWeek, weeks: weeks, learners: learners,
      rate: rate, currency: RATE.currency, basis: RATE.basis,
      note: "Quoted at NET's published rate of " + fmtVnd(rate) + " per hour (" + RATE.basis + "). Blocks, group and corporate rates are the coach's call and are confirmed on the free diagnostic — the calculator does not invent them."
    };
  }

  /* -------------------------------------------------------------- footer */
  function footerPages() {
    return [
      ["The Method", "method.html"], ["Programmes", "programs.html"], ["Pricing", "pricing.html"],
      ["Placement test", "placement.html"], ["Results", "results.html"], ["Parents", "parents.html"],
      ["About", "about.html"], ["Teach for NET", "teachers.html"], ["FAQ", "faq.html"],
      ["Book a diagnostic", "book.html"], ["Privacy & terms", "legal.html"]
    ];
  }
  function mountFooter() {
    var host = $("#netFooter");
    if (!host) return;
    var year = new Date().getFullYear();
    var pages = footerPages().map(function (p) { return '<li><a href="' + p[1] + '">' + esc(p[0]) + "</a></li>"; }).join("");
    host.innerHTML =
      '<div class="wrap"><div class="fgrid">' +
        '<div>' +
          '<div class="brand"><span class="sig" data-sig="phoenix"></span><span class="wm">NET<small>Natural English Training</small></span></div>' +
          '<p class="small muted" style="margin-top:12px">' + esc(BRAND.tagline) + ' — the English wing of ' + esc(BRAND.parent) + '. One-to-one, in-home and online, ages 1–70: primary, secondary, IELTS, business English and the 2026 English + AI advantage.</p>' +
          '<p class="mono small">' + esc(BRAND.domain) + "</p>" +
        "</div>" +
        '<div><h4>Reach the coach</h4><ul>' +
          '<li><a href="' + handoff.tel() + '">' + esc(CONTACT.phoneDisplay) + "</a></li>" +
          '<li><a href="mailto:' + CONTACT.email + '">' + esc(CONTACT.email) + "</a></li>" +
          '<li><a href="https://wa.me/' + CONTACT.phoneWa + '">WhatsApp</a></li>' +
          '<li class="muted small">' + esc(CONTACT.area) + "</li>" +
          '<li class="muted small">' + esc(CONTACT.hours) + "</li>" +
        "</ul></div>" +
        '<div><h4>The site</h4><ul>' + pages + "</ul></div>" +
        '<div><h4>Status</h4><ul>' +
          '<li><span class="pill live"><span class="dot"></span>Bookings open</span></li>' +
          '<li><span class="pill">' + esc(FREE) + "</span></li>" +
          '<li class="muted small" style="margin-top:8px">No account, no app to install. Your enquiry is stored on your own device and handed to the coach by the channel you choose.</li>' +
        "</ul></div>" +
      "</div>" +
      '<div class="fbot"><span>© ' + year + " " + esc(BRAND.legal) + " · a " + esc(BRAND.parent) + " wing</span>" +
      '<span>' + esc(BRAND.closing) + "</span></div></div>";
    paintSigils(host);
  }

  /* --------------------------------------------------------------- sigil */
  /* BRAND.003: every mark is drawn, never a font glyph or an emoji. This is
     the phoenix-out-of-the-stack mark, in the doctrine's gold. */
  var SIGILS = {
    phoenix: '<svg viewBox="0 0 48 48" role="img" aria-label="NET phoenix mark"><defs><linearGradient id="nx1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5d98b"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><path d="M24 5c3.4 5.2 3 9.4-.6 13.3 4-1.3 6.6-3.7 8.2-7.1 1.8 4.7.7 8.8-2.6 12.1 3.4-.4 6-1.9 7.9-4.6-.4 5.1-2.7 8.8-6.7 11.1 2.6 1 5.3 1.2 8.1.6-2.5 4.6-6.6 7.2-11.6 7.3l-1.3 6.4h-4.6l-1.3-6.4c-5-.1-9.1-2.7-11.6-7.3 2.8.6 5.5.4 8.1-.6-4-2.3-6.3-6-6.7-11.1 1.9 2.7 4.5 4.2 7.9 4.6-3.3-3.3-4.4-7.4-2.6-12.1 1.6 3.4 4.2 5.8 8.2 7.1C21 14.4 20.6 10.2 24 5Z" fill="url(#nx1)"/><path d="M24 20.5c1.9 2.1 2.8 4.3 2.8 6.6 0 2.4-1 4.4-2.8 6.1-1.8-1.7-2.8-3.7-2.8-6.1 0-2.3.9-4.5 2.8-6.6Z" fill="#0f0f1a"/></svg>',
    tiger: '<svg viewBox="0 0 48 48" role="img" aria-label="tiger mark"><g fill="none" stroke="#e8c565" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8l7 9M40 8l-7 9"/><path d="M24 12c7.7 0 14 5.9 14 13.2 0 7.6-6.3 13.3-14 13.3s-14-5.7-14-13.3C10 17.9 16.3 12 24 12Z"/><path d="M18.5 24.5h.01M29.5 24.5h.01" stroke-width="3.4"/><path d="M24 29v3.5M21 34.5h6"/><path d="M24 9.5l1.7 2.6h-3.4L24 9.5Z" fill="#e8c565"/></g></svg>',
    mouse: '<svg viewBox="0 0 48 48" role="img" aria-label="mouse mark"><g fill="none" stroke="#94a3b8" stroke-width="1.7" stroke-linecap="round"><circle cx="17" cy="20" r="4.6"/><circle cx="31" cy="20" r="4.6"/><path d="M24 25c-4 0-7 3.4-7 7.5S20 40 24 40s7-3.4 7-7.5S28 25 24 25Z"/><path d="M19 42c-6 2-9-1-9-1M29 42c6 2 9-1 9-1"/><path d="M24 27v3"/></g></svg>',
    shield: '<svg viewBox="0 0 48 48" role="img" aria-label="guarantee mark"><g fill="none" stroke="#e8c565" stroke-width="1.7" stroke-linejoin="round"><path d="M24 5l15 6v12c0 9.4-6.2 17.3-15 20-8.8-2.7-15-10.6-15-20V11l15-6Z"/><path d="M16.5 24.5l5.5 5.5 10-11" stroke-width="2.4"/></g></svg>',
    dial: '<svg viewBox="0 0 48 48" role="img" aria-label="45/15 mark"><circle cx="24" cy="24" r="17" fill="none" stroke="#2a1040" stroke-width="7"/><circle cx="24" cy="24" r="17" fill="none" stroke="#f59e0b" stroke-width="7" stroke-linecap="round" stroke-dasharray="80.1 106.8" transform="rotate(-90 24 24)"/><circle cx="24" cy="24" r="17" fill="none" stroke="#a855f7" stroke-width="7" stroke-linecap="round" stroke-dasharray="26.7 160.2" stroke-dashoffset="-80.1" transform="rotate(-90 24 24)"/><text x="24" y="27" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="9" fill="#fff">45/15</text></svg>',
    brain: '<svg viewBox="0 0 48 48" role="img" aria-label="60 percent rule mark"><g fill="none" stroke="#e8c565" stroke-width="1.6" stroke-linecap="round"><path d="M22 9c-4-3-9-1-10 3-4 1-5 6-2 9-2 4 1 8 5 8 0 3 4 5 7 3V9Z"/><path d="M26 9c4-3 9-1 10 3 4 1 5 6 2 9 2 4-1 8-5 8 0 3-4 5-7 3V9Z"/><path d="M24 32v6"/><circle cx="16" cy="18" r="1.6" fill="#f59e0b" stroke="none"/><circle cx="18" cy="26" r="1.6" fill="#a855f7" stroke="none"/><circle cx="31" cy="20" r="1.6" fill="#f59e0b" stroke="none"/><circle cx="30" cy="28" r="1.6" fill="#a855f7" stroke="none"/></g></svg>',
    pet: '<svg viewBox="0 0 48 48" role="img" aria-label="AI-PET mark"><g fill="none" stroke="#e8c565" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="15" y="8" width="18" height="32" rx="4"/><path d="M21 12h6M24 33h.01"/><path d="M8 20c-2 2-2 6 0 8M40 20c2 2 2 6 0 8"/></g></svg>',
    seal: '<svg viewBox="0 0 48 48" role="img" aria-label="Guarantee seal"><circle cx="24" cy="21" r="13" fill="none" stroke="#e8c565" stroke-width="1.6"/><circle cx="24" cy="21" r="9" fill="none" stroke="#e8c565" stroke-width="1" opacity=".5"/><path d="M18 32l-2 12 8-4 8 4-2-12" fill="none" stroke="#e8c565" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 21l3 3 6-7" stroke="#f59e0b" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>'
  };
  function sigil(name) { return SIGILS[name] || SIGILS.phoenix; }
  function paintSigils(root) {
    /* Set as innerHTML rather than DOMParser + importNode: the HTML parser
       puts <svg> and its children in the SVG namespace, while an imported
       node can land with a null namespace and then renders as nothing at all
       — an invisible icon that still measures 36×36 and passes every check
       that does not look at the pixels. */
    $$("[data-sig]", root || document).forEach(function (n) {
      if (n.dataset.sigDone) return;
      n.innerHTML = sigil(n.dataset.sig);
      n.dataset.sigDone = "1";
    });
  }

  /* ----------------------------------------------------------- nav wiring */
  function mountNav() {
    var b = $("#netBurger"), links = $("#netLinks");
    if (b && links) {
      b.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        b.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });
    }
    /* mark the current page in the nav, from the filename — no per-page flag
       to forget. */
    var here = location.pathname.split("/").pop() || "index.html";
    $$("#netLinks a").forEach(function (a) {
      var target = a.getAttribute("href");
      if (target === here) a.setAttribute("aria-current", "page");
    });
  }

  function boot() {
    paintSigils();
    mountNav();
    mountFooter();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.NET = {
    BRAND: BRAND, CONTACT: CONTACT, RATE: RATE, FREE: FREE,
    esc: esc, el: el, $: $, $$: $$,
    fmtVnd: fmtVnd, fmtVndShort: fmtVndShort, fmtDate: fmtDate, slug: slug, rand: rand, ref: ref,
    ledger: ledger, outbox: outbox, handoff: handoff, toast: toast, load: load, quote: quote,
    sigil: sigil, paintSigils: paintSigils, mountFooter: mountFooter, footerPages: footerPages,
    VERSION: "1.0.0"
  };
})();
