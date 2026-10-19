/* ============================================================================
   THE ROLES DESK — src/family.js

   (The file and its global keep the name `family` — it is internal, and every
   role's door is built on `ObiFamily` and `data-family-open`. What a person
   reads says ROLES.)

   WHY THIS FILE EXISTS
   The twelve roles in `src/generators/` are real perchance generators waiting to
   be born: each is one paste of `main.pjs` + `index.html`. That is the right end
   state — a tutor can hand THE 44 to the next tutor without carrying the station
   — but it is twelve pastes before anything can be USED.

   This is the door that makes them usable NOW. It opens any role inside the
   station, in its own document, reading and writing THE SAME RECORDS the desk
   does (`root.kv.intake`, the folder `/intake` uses), because the kit looks for
   the station's folder first. So the work the desk has already done on a student
   is the work the role opens onto — no export, no import, no second copy of
   anything.

   WHAT IT IS NOT. It is not a replacement for the roles being their own
   generators: an iframe inside the station is a doorway, not a shipping crate.
   The crate is still the two files, and `src/generators/<role>/README.md` says so.

   THE SHAPE. `ObiFamily.open(slug)` mounts a full-screen desk with the role in a
   sandboxed frame (allow-scripts · allow-same-origin · allow-popups · allow-
   downloads · allow-modals) so print, download and the record picker all work;
   `ObiFamily.close()` takes it down; `ObiFamily.has(slug)` answers whether a role
   exists (the registry in `src/divisions.js` uses it to render the button).
   ========================================================================== */
(function () {
  "use strict";

  var ROLES = [
    { slug: "cv-forge",           name: "THE CV",                  icon: "doc",       what: "a print-ready A4 CV, blank where the record is blank" },
    { slug: "linkedin-forge",     name: "THE LINKEDIN",            icon: "user",      what: "the profile from the same record, plus the connection build" },
    { slug: "headshot-brief",     name: "THE HEADSHOT",            icon: "image",     what: "the wardrobe, the room, twenty shots, the crops" },
    { slug: "portfolio-intake",   name: "THE PORTFOLIO",           icon: "clipboard", what: "everything sent, kept verbatim, filed against a promise" },
    { slug: "phonics-44",         name: "THE 44",                  icon: "speak",     what: "the 44 sounds as a speaking test, marked by hand" },
    { slug: "presentation-coach", name: "THE WEEKLY PRESENTATION", icon: "record",    what: "15–20 minutes, five beats, ONE correction per run" },
    { slug: "application-board",  name: "THE APPLICATIONS",        icon: "target",    what: "the board, the count, the minutes, what they asked" },
    { slug: "interview-drill",    name: "THE INTERVIEW",           icon: "mic",       what: "the bank, and the drill that makes it boring to say" },
    { slug: "umbrella-brand",     name: "THE UMBRELLA",            icon: "seal",      what: "one holding name and one page that carries the work" },
    { slug: "presence-plan",      name: "THE PRESENCE",            icon: "users",     what: "five fronts, what each is for, a rhythm not a burst" },
    { slug: "work-credit",        name: "THE CREDIT",              icon: "hammer",    what: "real work, the line it earns, gated on the sovereign's word" },
    { slug: "idea-lists",         name: "THE LISTS",               icon: "spark",     what: "lists of ideas to choose from, kept verbatim" }
  ];
  var BASE = "src/generators/";
  var cache = {};

  function has(slug) { return ROLES.some(function (r) { return r.slug === slug; }); }
  function role(slug) { return ROLES.filter(function (r) { return r.slug === slug; })[0] || null; }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function ensureCss() {
    if (document.getElementById("fam-css")) return;
    var s = document.createElement("style");
    s.id = "fam-css";
    s.textContent = [
      "#familyDesk{position:fixed;inset:0;z-index:9000;background:#0b0b14;display:flex;flex-direction:column}",
      "#familyDesk[hidden]{display:none}",
      ".fd-head{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid rgba(168,85,247,.25);",
        "background:#12121f;flex-wrap:wrap}",
      ".fd-head b{font-size:14.5px;letter-spacing:.3px}",
      ".fd-head .fd-what{color:#8b94ad;font-size:12px}",
      ".fd-spacer{flex:1 1 auto}",
      ".fd-btn{background:rgba(168,85,247,.16);border:1px solid rgba(168,85,247,.3);color:#e9e6f2;",
        "border-radius:8px;padding:6px 11px;font:inherit;font-size:12.5px;cursor:pointer}",
      ".fd-btn:hover{border-color:#a855f7}",
      "#familyFrame{flex:1 1 auto;width:100%;border:0;background:#0f0f1a}",
      ".fd-note{color:#8b94ad;font-size:11.5px}",
      ".gen-open[data-open-family]{background:linear-gradient(180deg,rgba(232,197,101,.3),rgba(232,197,101,.12))}"
    ].join("");
    (document.head || document.documentElement).appendChild(s);
  }

  function desk() {
    ensureCss();
    var d = document.getElementById("familyDesk");
    if (!d) {
      d = document.createElement("div");
      d.id = "familyDesk";
      d.hidden = true;
      d.innerHTML = '<div class="fd-head">'
        + '<button class="fd-btn" id="fdClose">\u2715 close</button>'
        + '<b id="fdName">THE ROLES</b><span class="fd-what" id="fdWhat"></span>'
        + '<span class="fd-spacer"></span>'
        + '<select class="fd-btn" id="fdWho" title="which student the role opens onto"></select>'
        + '<span class="fd-note" id="fdNote">reading the station\u2019s own records \u2014 the same store <b>/intake</b> uses</span>'
        + '<button class="fd-btn" id="fdReload">reload the role</button>'
        + "</div>"
        + '<iframe id="familyFrame" sandbox="allow-scripts allow-same-origin allow-popups allow-downloads allow-modals allow-clipboard-write"></iframe>';
      document.body.appendChild(d);
      document.getElementById("fdClose").onclick = close;
      document.getElementById("fdReload").onclick = function () { open(d.dataset.slug, true); };
      document.getElementById("fdWho").onchange = function () { open(d.dataset.slug, true); };
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !d.hidden) close();
      });
    }
    return d;
  }

  async function open(slug, force) {
    var r = role(slug);
    if (!r) return false;
    var d = desk();
    d.dataset.slug = slug;
    document.getElementById("fdName").textContent = r.name;
    document.getElementById("fdWhat").textContent = r.what;
    var frame = document.getElementById("familyFrame");
    if (!frame) return false;
    /* WHO. The desk lists the station's own records and hands the chosen one to
       the role as its deep link, so opening THE 44 from a lesson with Quan on
       the desk opens onto Quan \u2014 not onto whoever was last touched. */
    var who = null;
    try {
      var sel = document.getElementById("fdWho");
      var want = sel.value || null;
      var recs = [];
      try {
        var folder = (window.root && root.kv && root.kv.intake) || null;
        if (folder) {
          var ks = (await folder.keys()).filter(function (k) { return String(k).indexOf("__") !== 0; });
          for (var i = 0; i < ks.length; i++) { var rr2 = await folder.get(ks[i]); if (rr2) recs.push({ id: ks[i], name: rr2.name || ks[i] }); }
        }
      } catch (e) {}
      var opts = recs.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.name) + "</option>"; }).join("");
      sel.innerHTML = (recs.length ? opts : '<option value="">\u2014 no record in this browser \u2014</option>') + '<option value="">(none)</option>';
      if (want && recs.some(function (x) { return x.id === want; })) sel.value = want;
      who = sel.value || null;
    } catch (e) {}
    var html = (!force && cache[slug]) || null;
    if (!html) {
      try {
        var res = await fetch(BASE + slug + "/index.html", { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        html = await res.text();
      } catch (e) {
        frame.srcdoc = "<!doctype html><meta charset=\"utf-8\"><body style=\"background:#0f0f1a;color:#e9e6f2;font:15px system-ui;padding:24px;text-align:left\">"
          + "<b>This role could not be read.</b><p>" + esc(String(e && e.message || e))
          + "</p><p style=\"color:#8b94ad\">The role's source is <span style=\"font-family:ui-monospace,monospace\">" + esc(BASE + slug + "/index.html") + "</span> \u2014 if the workspace has not published it yet, open the file in the editor and paste it into a generator of its own.</p></body>";
        d.hidden = false;
        return false;
      }
      cache[slug] = html;
    }
    /* the block is one document: nothing is fetched at runtime, so srcdoc is the
       whole role. allow-same-origin is what lets it reach this origin's kv \u2014
       which is exactly the point: it is the station's own records. The BRIDGE is
       what makes that true \u2014 a frame is a separate document, so `root` does not
       exist inside it and the kit would quietly fall back to an empty
       localStorage store. The bridge hands the child the station's own kv
       folder, and the note under the header says which of the two it got. */
    var bridge = "<script>(function(){try{"
      + "if(window.parent&&window.parent.root&&window.parent.root.kv)window.root={kv:window.parent.root.kv};"
      + "window.ObiKitStudent=" + JSON.stringify(who || null) + ";"
      + "}catch(e){}})();<\/script>";
    frame.srcdoc = "<!doctype html><html><head><meta charset=\"utf-8\">"
      + '<meta name="viewport" content="width=device-width,initial-scale=1">'
      + "<title>" + esc(r.name) + "</title></head><body>" + bridge + html + "</body></html>";
    d.hidden = false;
    /* say what actually happened, once the frame has had a moment to boot */
    setTimeout(function () {
      var note = document.getElementById("fdNote");
      if (!note) return;
      var bridged = false;
      try { bridged = !!(frame.contentWindow && frame.contentWindow.root && frame.contentWindow.root.kv); } catch (e) {}
      note.innerHTML = bridged
        ? "reading the station\u2019s own records \u2014 the same store <b>/intake</b> uses"
        : '<span style="color:#e6b43c">the records could not be bridged here \u2014 this role is on its own store</span>';
    }, 1200);
    return true;
  }
  function close() {
    var d = document.getElementById("familyDesk");
    if (d) { d.hidden = true; }
  }

  /* any element can open a role: `data-family-open="slug"`. Cards carrying this
     attribute are usually rendered AFTER this file loads (the registry mounts on
     a route change), so a one-shot pass at load is not enough — the observer
     below re-runs the pass whenever the app adds nodes. */
  function upgrade(rootEl) {
    var scope = rootEl || document;
    var els = [];
    if (scope.nodeType === 1 && scope.matches && scope.matches("[data-family-open]:not([data-fam-done])")) els.push(scope);
    if (scope.querySelectorAll) Array.prototype.forEach.call(scope.querySelectorAll("[data-family-open]:not([data-fam-done])"), function (el) { els.push(el); });
    els.forEach(function (el) {
      el.setAttribute("data-fam-done", "1");
      el.onclick = function () { open(el.getAttribute("data-family-open")); };
    });
    return els.length;
  }

  window.ObiFamily = { ROLES: ROLES, open: open, close: close, has: has, role: role, upgrade: upgrade };
  try { upgrade(document); } catch (e) {}
  try {
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            if (added[j] && added[j].nodeType === 1) { try { upgrade(added[j]); } catch (e) {} }
          }
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
