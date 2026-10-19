/* ============================================================================
   THE CV — src/generators/cv-forge/src/panel.js

   The first of the family's functions, and the one that carries the family's
   hardest rule. The tape:

      "You don't have a CV yet?"  →  "No, I don't have."
      "the name on your degree…?" →  "the name of the communications … and media"

   So: a CV is made from what the student actually has, in the order a one-page
   CV runs, and a row nobody has supplied is printed as a RULED LINE and named in
   the footer. It is never filled in.

   L41 FAILCLOSED_CAPTURE — "a guessed degree is worse than a blank one."
   The record keeps the machine's guess (state:"unresolved") for the tutor to see
   and to correct; the paper never wears it.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;

  function esc(s) { return K.esc(s); }
  function stateOfRow(rec, k) {
    var f = K.raw(rec, k);
    if (!f || !String(f.value || "").trim()) return "blank";
    return f.state === "unresolved" ? "unresolved" : "stated";
  }
  /* the sheet itself — same idiom as the station's print room: one standalone
     .html with its own @page rule. No PDF writer, and it says so. */
  function buildCV(rec) {
    var g = function (k) { return K.val(rec, k); };
    var miss = [];
    var need = function (k, label) { var v = g(k) || (k === "name" ? rec.name : ""); if (!v) miss.push(label); return v; };
    var name = need("name", "Name") || rec.name || "";
    var headline = need("headline", "Headline");
    var summary = need("summary", "Summary");
    var school = need("school", "School");
    var degree = need("degree", "Degree");
    var dates = g("dates"), gpa = g("gpa");
    var contact = [g("phone"), g("email"), g("city")].filter(Boolean);
    var links = K.lines(g("links")), exp = K.lines(g("experience")),
        skills = K.lines(g("skills")), langs = K.lines(g("languages"));
    var rule = function (t) { return '<div class="rule">' + esc(t) + "</div>"; };
    var part = function (title, html) {
      return "<section><h2>" + esc(title) + "</h2>"
        + (html || rule(title.toLowerCase() + " — not supplied")) + "</section>";
    };
    var ul = function (a) { return a.length ? "<ul>" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; };
    var body =
        "<header><h1>" + esc(name) + "</h1>"
      + (headline ? '<div class="hl">' + esc(headline) + "</div>" : '<div class="hl rule">headline — not supplied</div>')
      + '<div class="ct">' + (contact.length ? contact.map(esc).join(" \u00b7 ") : '<span class="rule">phone \u00b7 email \u00b7 city — not supplied</span>') + "</div>"
      + (links.length ? '<div class="ct">' + links.map(esc).join(" \u00b7 ") + "</div>" : "")
      + "</header>"
      + part("Profile", summary ? "<p>" + esc(summary) + "</p>" : "")
      + part("Education", (school || degree || dates || gpa)
          ? "<p>" + (degree ? "<b>" + esc(degree) + "</b>" : '<span class="rule">degree — not supplied</span>')
            + (school ? " \u00b7 " + esc(school) : "") + (dates ? " \u00b7 " + esc(dates) : "") + (gpa ? " \u00b7 " + esc(gpa) : "") + "</p>" : "")
      + part("Experience & Projects", ul(exp))
      + part("Skills", ul(skills))
      + part("Languages", ul(langs));
    var foot = miss.length
      ? '<footer class="warn">' + miss.length + " row(s) were blank when this was printed: " + esc(miss.join(", "))
        + ". They were left blank on purpose \u2014 <b>a guessed degree is worse than a blank one.</b>"
        + " Fill the row and print again (the tutor's rule is a CONFIRMED degree name, never the machine's guess).</footer>"
      : "<footer>Every row on this page came from the record. Nothing was invented.</footer>";
    return K.printSheet(name + " \u2014 CV", body + foot);
  }

  function plainText(rec) {
    var g = function (k) { return K.val(rec, k); };
    var L = [];
    L.push(rec.name || "");
    if (g("headline")) L.push(g("headline"));
    var c = [g("phone"), g("email"), g("city")].filter(Boolean).join(" \u00b7 ");
    if (c) L.push(c);
    if (g("links")) L.push(K.lines(g("links")).join(" \u00b7 "));
    if (g("summary")) L.push("", "PROFILE", g("summary"));
    if (g("degree") || g("school")) L.push("", "EDUCATION", [g("degree"), g("school"), g("dates"), g("gpa")].filter(Boolean).join(" \u00b7 "));
    if (K.lines(g("experience")).length) L.push("", "EXPERIENCE & PROJECTS", K.lines(g("experience")).map(function (x) { return "- " + x; }).join("\n"));
    if (K.lines(g("skills")).length) L.push("", "SKILLS", K.lines(g("skills")).join(", "));
    if (K.lines(g("languages")).length) L.push("", "LANGUAGES", K.lines(g("languages")).join(", "));
    return L.join("\n");
  }

  function openSheet(html) {
    try {
      var url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      var w = window.open(url, "_blank");
      if (!w) { K.toast("the browser blocked the sheet \u2014 use Download instead"); }
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 60000);
      return !!w;
    } catch (e) { return false; }
  }

  K.shell({
    name: "THE CV",
    what: "rec 3 \u2014 \u201cYou don't have a CV yet?\u201d \u00b7 filled from what they have, blank where they have not \u00b7 never a guess",
    panel: function (rec, h) {
      var have = [], miss = [], unres = [];
      M.CV_FIELDS.forEach(function (row) {
        var st = stateOfRow(rec, row[0]);
        if (st === "stated") have.push(row); else if (st === "unresolved") unres.push(row); else miss.push(row);
      });
      var item = M.BY_ID.cv;

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("the gate", item.gate ? "<span style=\"color:var(--warn)\">" + esc(item.gate) + "</span>" : "\u2014",
                "nothing prints past it")
        + K.row("the sheet", have.length + " of " + M.CV_FIELDS.length + " rows stated"
                + (unres.length ? " \u00b7 " + unres.length + " unresolved" : "")
                + (miss.length ? " \u00b7 " + miss.length + " not supplied" : ""),
                "a ruled line is not a failure \u2014 it is the honest state of the record"));

      var form = '<table class="ok-t"><tr><th style="width:22%">row</th><th>what it says</th><th style="width:20%">state</th></tr>'
        + M.CV_FIELDS.map(function (row) {
          var k = row[0], st = stateOfRow(rec, k);
          var f = K.raw(rec, k);
          var val = f ? String(f.value || "") : "";
          var multi = ["summary", "experience", "skills", "links", "languages"].indexOf(k) >= 0;
          var input = multi
            ? '<textarea class="ok-textarea" data-cv="' + esc(k) + '" style="min-height:64px">' + esc(val) + "</textarea>"
            : '<input class="ok-input" data-cv="' + esc(k) + '" value="' + esc(val) + '">';
          var chip = st === "stated" ? K.chip("STATED", "var(--ok)")
            : st === "unresolved" ? K.chip("UNRESOLVED \u2014 WON'T PRINT", "var(--bad)")
            : K.chip("NOT SUPPLIED", "var(--muted)");
          return '<tr><td class="n"><b>' + esc(row[1]) + "</b><div class=\"ok-note\">" + esc(row[2] || "") + "</div></td>"
            + "<td>" + input
            + (st === "unresolved" ? '<div class="ok-note bad">the machine guessed this. Confirm it and it prints; leave it and it stays off the paper.</div>' : "")
            + (f && f.ev ? '<div class="ok-note">evidence \u00b7 ' + esc(f.ev) + "</div>" : "")
            + "</td><td>" + chip + "</td></tr>";
        }).join("") + "</table>";

      var acts = '<div class="ok-bar" style="margin-top:10px">'
        + '<button class="ok-btn gold" data-act="save">save the record</button>'
        + '<button class="ok-btn" data-act="print">print the sheet (A4)</button>'
        + '<button class="ok-btn" data-act="sheet">open the sheet in a tab</button>'
        + '<button class="ok-btn ghost" data-act="dl">download the .html</button>'
        + '<button class="ok-btn ghost" data-act="text">copy as plain text</button>'
        + "</div>";

      return head + K.card("the sheet, row by row", form + acts
        + K.note("A row set here is a row the student or the tutor SUPPLIED. The record keeps where each row came from (its evidence line), so a CV can be defended line by line.", ""),
        "the record lives in this browser \u00b7 export it to move it to another role or to the station");
    },
    after: function (rec, panel, h) {
      var grab = function () {
        var out = {};
        Array.prototype.forEach.call(panel.querySelectorAll("[data-cv]"), function (el) { out[el.getAttribute("data-cv")] = el.value; });
        return out;
      };
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "save") {
            var vals = grab();
            M.CV_FIELDS.forEach(function (row) {
              var k = row[0], v = vals[k];
              var cur = K.raw(rec, k);
              var curV = cur ? String(cur.value || "") : "";
              if (String(v == null ? "" : v) === curV) return;
              /* a human typing over an unresolved row CONFIRMS it — that is the
                 only way a guessed row ever reaches paper. */
              K.setField(rec, k, row[1], v, cur ? cur.ev : "supplied in THE CV", v ? "stated" : "");
            });
            var ok = await K.save(rec);
            h.toast(ok ? "saved" : "the write did NOT go through");
            h.render();
            return;
          }
          var sheet = buildCV(rec);
          if (act === "sheet") { if (!openSheet(sheet)) K.download(K.slug(rec.name) + "-cv.html", sheet); return; }
          if (act === "dl") { K.download(K.slug(rec.name) + "-cv.html", sheet); K.toast("downloaded \u2014 open it and print"); return; }
          if (act === "print") {
            var w = window.open("", "_blank");
            if (!w) { K.toast("the browser blocked the tab \u2014 use Download, then open it"); return; }
            w.document.write(sheet); w.document.close();
            setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350);
            return;
          }
          if (act === "text") { K.copy(plainText(rec), "the CV as plain text"); return; }
        };
      });
    }
  });

  /* THE ROLE'S PUBLIC SURFACE. A pure function of a record, so anything that can
     hold a record can produce this role's artifact without the page: the station
     can deep-link it, a test can read it, and nothing has to be clicked. */
  window.ObiRole = { slug: "cv-forge", name: "THE CV", sheet: buildCV, text: plainText };
})();
