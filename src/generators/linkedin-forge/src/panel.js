/* ============================================================================
   THE LINKEDIN — src/generators/linkedin-forge/src/panel.js

   The tape, twice:
      "we primarily just want to work on his phonics and getting his CV and
       LinkedIn set up"
      "I already have LinkedIn with 600 connections… I only have like maybe 40
       LinkedIn friends. I'm gonna have to start building that up."

   So this role does two things and no more: it COMPOSES the profile out of the
   same record the CV is built from (so the two can never disagree), and it runs
   the CONNECTION BUILD the tutor quoted — a target, a count, and who to target.

   It never writes a word the record does not hold. A section with no material is
   shown as a blank to fill, not as a plausible-looking sentence.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  function LI(rec) { if (!rec.li) rec.li = { steps: {}, conns: [], targets: [], openness: [] }; var l = rec.li;
    l.steps = l.steps || {}; l.conns = l.conns || []; l.targets = l.targets || []; l.openness = l.openness || []; return l; }

  /* THE PROFILE, as the sections a recruiter reads. Every line is read from the
     record: summary→About, experience→Experience, skills→Skills, and so on. */
  function sections(rec) {
    var item = M.BY_ID.linkedin;
    return [
      { k: "headline", title: "Headline", from: "the CV headline feeds this",
        value: K.val(rec, "headline"), hint: "one line: the role they want, spelled the way the market spells it" },
      { k: "photo", title: "Photo", from: "THE HEADSHOT shoots it",
        value: K.val(rec, "photo"), hint: "plain wall, chest up \u2014 the SAME photo as the CV" },
      { k: "summary", title: "About", from: "their own words, in the record",
        value: K.val(rec, "summary"), hint: "3\u20135 lines in the first person; no adjective nobody can prove" },
      { k: "education", title: "Education", from: "degree \u00b7 school \u00b7 dates",
        value: [K.val(rec, "degree"), K.val(rec, "school"), K.val(rec, "dates")].filter(Boolean).join(" \u00b7 "),
        hint: "the name ON the certificate \u2014 the same gate the CV carries" },
      { k: "degree", title: "Licenses & certifications", from: "the certificate they actually hold",
        value: K.val(rec, "certificate"), hint: "the course's own name; the tape has one whose name he could not recall" },
      { k: "experience", title: "Experience", from: "the CV's experience rows",
        value: K.lines(K.val(rec, "experience")).join("\n"), hint: "one entry per line: role \u00b7 place \u00b7 what they actually did" },
      { k: "skills", title: "Skills", from: "the tools they really use",
        value: K.lines(K.val(rec, "skills")).join(", "), hint: "the tools, not the ambitions" },
      { k: "languages", title: "Languages", from: "the record",
        value: K.lines(K.val(rec, "languages")).join(", "), hint: "Vietnamese \u00b7 English \u2014 with the level" },
      { k: "links", title: "Contact / links", from: "the record",
        value: K.lines(K.val(rec, "links")).join(" \u00b7 "), hint: "the portfolio and the site, spelled out (LinkedIn hides bare links less badly if they are in About)" }
    ];
  }
  function profileText(rec) {
    var out = [];
    sections(rec).forEach(function (s) {
      if (!String(s.value || "").trim()) return;
      out.push(s.title.toUpperCase(), s.value, "");
    });
    return out.join("\n").trim();
  }
  var TRACK = [
    ["clean_name", "Set the name the market reads", "first + last, no nicknames, no extra words"],
    ["photo", "The photo", "the headshot \u2014 the same file as the CV"],
    ["headline", "The headline", "the role they want, the way the market spells it"],
    ["about", "About", "3\u20135 lines, first person, their own words"],
    ["open_to_work", "Open to work", "on, with the roles they actually want \u2014 never 'anything'"],
    ["experience", "Experience + education", "each row with a date; gaps are fine, invention is not"],
    ["skills_pin", "Pin the three skills", "the three a recruiter would search for"],
    ["connections", "The connection build", "the tutor's own target: 600"],
    ["recruiters", "Follow the recruiters", "the people who hire for the roles they want"],
    ["rhythm", "A rhythm, not a burst", "a few a day, every day \u2014 not 200 in one evening"]
  ];

  K.shell({
    name: "THE LINKEDIN",
    what: "rec 1 \u00b7 rec 3 \u2014 the profile built from the SAME record as the CV, and the 600-connection build",
    panel: function (rec, h) {
      var li = LI(rec);
      var item = M.BY_ID.linkedin;
      var secs = sections(rec);
      var filled = secs.filter(function (s) { return String(s.value || "").trim(); });
      var open = secs.filter(function (s) { return !String(s.value || "").trim(); });
      var doneSteps = TRACK.filter(function (s) { return li.steps[s[0]]; }).length;
      var conns = li.conns;
      var target = Number(K.val(rec, "conn_target")) || 600;
      var have = Number(K.val(rec, "conn_now")) || 0;
      var total = have + conns.reduce(function (a, c) { return a + (Number(c.n) || 0); }, 0);

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("the tutor's own target", "600 connections", "\u201cthe recruiters look at those things\u201d \u2014 and he runs the same play on himself, out loud")
        + K.row("readiness", filled.length + " of " + secs.length + " sections have material"
                + (open.length ? " \u00b7 " + open.length + " still blank" : ""),
                "a blank section is shown as a blank \u2014 this role does not write sentences the record cannot support"));

      /* --- the profile, section by section, each copyable on its own --------- */
      var body = secs.map(function (s) {
        var v = String(s.value || "").trim();
        return K.row(s.title,
          v ? esc(v) : K.blankRule("nothing in the record yet \u2014 " + s.hint)
            + '<div class="ok-bar" style="margin-top:6px">'
            + (v ? '<button class="ok-btn" data-copy="' + esc(v) + '" data-copy-label="' + esc(s.title) + '">copy</button>' : "")
            + '<button class="ok-btn ghost" data-goto="' + esc(s.k) + '">fill it in</button></div>',
          "from \u00b7 " + esc(s.from), v ? "" : "warn");
      }).join("");
      var profileCard = K.card("the profile, section by section", body
        + '<div class="ok-bar" style="margin-top:10px"><button class="ok-btn gold" data-act="copyall">copy the whole profile</button>'
        + '<button class="ok-btn ghost" data-act="print">print the profile sheet</button></div>');

      /* --- the build checklist ---------------------------------------------- */
      var track = TRACK.map(function (s) {
        return '<div class="ok-check"><input type="checkbox" data-step="' + esc(s[0]) + '"' + (li.steps[s[0]] ? " checked" : "") + ">"
          + "<span><b>" + esc(s[1]) + "</b><div class=\"ok-note\">" + esc(s[2]) + "</div></span></div>";
      }).join("");
      var buildCard = K.card("the build \u2014 " + doneSteps + " of " + TRACK.length + " done", track
        + K.note("The checklist is kept on the record, so the next lesson opens where this one stopped.", ""));

      /* --- the connection build -------------------------------------------- */
      var connCard = K.card("the connection build",
        K.row("target", esc(String(target)) + " \u00b7 currently ~" + esc(String(total)),
          "the count is arithmetic: what the record says they have, plus what is logged below")
        + K.row("starting from", esc(String(have)) + " connections",
          "put it in the record as <span class=\"ok-mono\">conn_now</span> so the build has a floor")
        + (conns.length
          ? '<table class="ok-t"><tr><th>day</th><th>sent</th><th>who</th></tr>'
            + conns.slice(-12).reverse().map(function (c) {
              return '<tr><td class="n">' + esc(K.day(c.at)) + '</td><td class="n">' + esc(String(c.n)) + "</td><td>" + esc(c.note || "\u2014") + "</td></tr>";
            }).join("") + "</table>"
          : K.note("nothing logged yet \u2014 a build with no numbers is a mood.", "warn"))
        + '<div class="ok-sec ok-bar">'
        + '<input class="ok-input" style="flex:0 0 90px" id="liN" placeholder="how many" inputmode="numeric">'
        + '<input class="ok-input" style="flex:1 1 240px" id="liWho" placeholder="who \u2014 the recruiters, the agencies, the alumni">'
        + '<button class="ok-btn gold" data-act="log">log a day</button></div>'
        + K.note("A few a day, every day. The tutor's own line: he is building his own from 40 upward, using the same strategies.", ""));

      /* --- who to target ---------------------------------------------------- */
      var tg = li.targets;
      var targetCard = K.card("the recruiters to follow",
        K.row("on file", tg.length + " name(s)", "the people who hire for the roles they actually want \u2014 not everyone in the industry")
        + (tg.length ? "<table class=\"ok-t\"><tr><th>who</th><th>where</th><th>why</th></tr>"
            + tg.map(function (t, i) {
              return '<tr><td>' + esc(t.who) + "</td><td>" + esc(t.where || "\u2014") + "</td><td>" + esc(t.why || "\u2014")
                + ' <button class="ok-btn ghost" data-rmtarget="' + i + '">✕</button></td></tr>';
            }).join("") + "</table>" : "")
        + '<div class="ok-sec ok-bar">'
        + '<input class="ok-input" style="flex:1 1 150px" id="tgWho" placeholder="who \u2014 name or company">'
        + '<input class="ok-input" style="flex:1 1 150px" id="tgWhere" placeholder="where \u2014 LinkedIn / the careers page">'
        + '<input class="ok-input" style="flex:1 1 190px" id="tgWhy" placeholder="why them">'
        + '<button class="ok-btn gold" data-act="addtarget">add</button></div>');

      return head + profileCard + buildCard + connCard + targetCard;
    },
    after: function (rec, panel, h) {
      var li = LI(rec);
      Array.prototype.forEach.call(panel.querySelectorAll("[data-step]"), function (cb) {
        cb.onchange = async function () {
          li.steps[cb.getAttribute("data-step")] = cb.checked;
          K.logLine(rec, "linkedin step " + cb.getAttribute("data-step") + " = " + cb.checked);
          await K.save(rec);
          h.render();
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-goto]"), function (b) {
        b.onclick = function () { K.toast("that row lives in the record \u2014 set it in THE CV, or import a record that has it"); };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-rmtarget]"), function (b) {
        b.onclick = async function () { li.targets.splice(Number(b.getAttribute("data-rmtarget")), 1); await K.save(rec); h.render(); };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "log") {
            var n = Number((panel.querySelector("#liN") || {}).value) || 0;
            var who = ((panel.querySelector("#liWho") || {}).value || "").trim();
            if (!n) { K.toast("how many connections went out?"); return; }
            li.conns.push({ at: new Date().toISOString(), n: n, note: who });
            K.logLine(rec, "connections +" + n + (who ? " \u00b7 " + who : ""));
            await K.save(rec); h.render(); K.toast("logged " + n); return;
          }
          if (act === "addtarget") {
            var who2 = ((panel.querySelector("#tgWho") || {}).value || "").trim();
            if (!who2) { K.toast("who?"); return; }
            li.targets.push({ who: who2, where: ((panel.querySelector("#tgWhere") || {}).value || "").trim(),
              why: ((panel.querySelector("#tgWhy") || {}).value || "").trim() });
            await K.save(rec); h.render(); return;
          }
          if (act === "copyall") { K.copy(profileText(rec), "the profile"); return; }
          if (act === "print") {
            var t = profileText(rec) || "(the record has no profile material yet)";
            var html = K.printSheet(rec.name + " \u2014 LinkedIn profile",
              "<header><h1>" + esc(rec.name) + "</h1><div class=\"hl\">LinkedIn profile \u2014 composed from the record</div>"
              + '<div class="ct">' + esc(K.day(new Date().toISOString())) + " \u00b7 the connection target is " + esc(String(600)) + "</div></header>"
              + "<section><h2>copy each block into LinkedIn</h2><pre style=\"white-space:pre-wrap;font:10.5pt/1.45 Georgia,serif\">" + esc(t) + "</pre></section>"
              + '<footer>Every line came from the record. Blank sections are blank on purpose \u2014 nothing here was invented.</footer>');
            h.io('<div class="ok-card"><h2>the sheet</h2><div class="ok-note">Printed or downloaded \u2014 it carries the text to paste, nothing more.</div>'
              + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn gold" id="liSheet">open it in a tab</button>'
              + '<button class="ok-btn" id="liDl">download the .html</button><button class="ok-btn ghost" id="liClose">close</button></div></div>');
            document.getElementById("liClose").onclick = h.ioHide;
            document.getElementById("liDl").onclick = function () { K.download(K.slug(rec.name) + "-linkedin.html", html); };
            document.getElementById("liSheet").onclick = function () {
              try { var u = URL.createObjectURL(new Blob([html], { type: "text/html" })); window.open(u, "_blank"); }
              catch (e) { K.toast("the browser blocked the tab \u2014 download instead"); }
            };
            return;
          }
        };
      });
    }
  });

  window.ObiRole = { slug: "linkedin-forge", name: "THE LINKEDIN", profile: profileText,
    sections: function (rec) { return sections(rec).map(function (s) { return { k: s.k, title: s.title, value: String(s.value || "") }; }); } };
})();
