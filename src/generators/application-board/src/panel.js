/* ============================================================================
   THE APPLICATIONS — src/generators/application-board/src/panel.js

   The tape gives this one a number, twice, and then does the arithmetic out loud:

      "How many jobs do you apply for this week?"  →  "Twelve?"  →  "Nice. Good job. 12."
      "one of the 12 … how long does the average application take? … Just around 30."
      "Each one has a different set of questions… it's also ask some bit about my
       score… Your college score."  →  "how can they verify that?" → "bring the score."

   So this role is a BOARD, not a pep talk: the count, the minutes, the weekly
   target, and — the part everyone retypes — WHAT EACH COMPANY ASKED, kept so the
   next application starts from a filled-in form instead of a blank one.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;
  var TARGET = 12;

  function AP(rec) { if (!Array.isArray(rec.apps)) rec.apps = []; return rec.apps; }
  function inWeek(apps) {
    var now = Date.now();
    return apps.filter(function (a) { return now - new Date(a.at).getTime() < 7 * 864e5; }).length;
  }
  /* the distinct questions across the whole board, each with who asked it —
     the reason this role exists at all: the second company that asks it gets an
     answer that is already written. */
  function questions(apps) {
    var lib = {}, order = [];
    apps.forEach(function (a) {
      K.lines(a.asked || "").forEach(function (q) {
        var key = q.toLowerCase().replace(/\s+/g, " ").trim();
        if (!key) return;
        if (!lib[key]) { lib[key] = { q: q, who: [] }; order.push(key); }
        if (a.company && lib[key].who.indexOf(a.company) < 0) lib[key].who.push(a.company);
      });
    });
    return order.map(function (k) { return lib[k]; });
  }

  K.shell({
    name: "THE APPLICATIONS",
    what: "rec 1 \u00b7 rec 4 \u2014 the board, the count, the minutes, and what each company actually asked",
    panel: function (rec, h) {
      var apps = AP(rec);
      var item = M.BY_ID.apps;
      var mins = apps.reduce(function (s, a) { return s + (Number(a.mins) || 0); }, 0);
      var wk = inWeek(apps);
      var avg = apps.length ? Math.round(mins / apps.length) : 0;

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("the target", TARGET + " a week \u2014 said out loud and confirmed twice",
                "\u201cTwelve?\u201d \u2026 \u201cNice. Good job. 12.\u201d")
        + K.row("the arithmetic", apps.length + " logged \u00b7 " + mins + " minutes"
                + (avg ? " \u00b7 ~" + avg + " min each" : ""),
                "the tutor's own answer on the length of one: \u201cjust around 30\u201d \u2014 so twelve is about six hours of work, and that is the number to plan the week around")
        + K.row("this week", wk + " of " + TARGET + " \u00b7 " + (wk >= TARGET ? "held" : (TARGET - wk) + " to go"),
                "a week is a rolling window, not a calendar week \u2014 the count moves every day"));

      var logCard = K.card("log one the moment it goes out",
        '<div class="ok-bar">'
        + '<input class="ok-input" style="flex:1 1 150px" id="apCo" placeholder="company">'
        + '<input class="ok-input" style="flex:1 1 150px" id="apRole" placeholder="role \u2014 the title they advertised">'
        + '<input class="ok-input" style="flex:0 0 90px" id="apMins" placeholder="minutes" inputmode="numeric">'
        + "</div>"
        + '<div style="margin-top:6px"><input class="ok-input" id="apAsked" placeholder="what it asked you \u2014 the questions, one per line or separated by \u00b7 (this is the part worth keeping)"></div>'
        + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn gold" data-act="log">log it</button>'
        + '<button class="ok-btn ghost" data-act="csv">download the board (CSV)</button></div>');

      var boardCard = K.card("the board \u2014 " + apps.length + " application(s)",
        apps.length
          ? '<table class="ok-t"><tr><th>date</th><th>company</th><th>role</th><th>min</th><th>what it asked</th><th></th></tr>'
            + apps.slice().reverse().slice(0, 40).map(function (a, i) {
              var idx = apps.length - 1 - i;
              return '<tr><td class="n">' + esc(K.day(a.at)) + "</td><td><b>" + esc(a.company || "\u2014") + "</b></td>"
                + "<td>" + esc(a.role || "\u2014") + '</td><td class="n">' + esc(a.mins || "\u2014") + "</td>"
                + '<td style="font-size:12px">' + esc(String(a.asked || "\u2014").slice(0, 220)) + "</td>"
                + '<td><button class="ok-btn ghost" data-rm="' + idx + '">\u2715</button></td></tr>';
            }).join("") + "</table>"
          : K.note("nothing on the board yet. One application logged is worth more than a plan to log twelve.", "warn"));

      /* the library that stops the retyping */
      var qs = questions(apps);
      var libCard = K.card("what they ask \u2014 " + qs.length + " distinct question(s)",
        qs.length
          ? '<table class="ok-t"><tr><th>the question</th><th>asked by</th></tr>'
            + qs.map(function (x) { return "<tr><td>" + esc(x.q) + '</td><td style="opacity:.75">' + esc(x.who.join(", ") || "\u2014") + "</td></tr>"; }).join("")
            + "</table>"
          : K.note("Nothing yet. As soon as two companies ask the same thing, it shows up here once \u2014 and the answer can be written once.", ""));
      return head + logCard + boardCard + libCard;
    },
    after: function (rec, panel, h) {
      var apps = AP(rec);
      Array.prototype.forEach.call(panel.querySelectorAll("[data-rm]"), function (b) {
        b.onclick = async function () {
          var i = Number(b.getAttribute("data-rm"));
          var gone = apps.splice(i, 1)[0];
          rec.withdrawn = rec.withdrawn || [];
          rec.withdrawn.push({ at: new Date().toISOString(), entry: gone });
          await K.save(rec); h.render(); K.toast("removed \u2014 kept in the withdrawn list");
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "log") {
            var co = ((panel.querySelector("#apCo") || {}).value || "").trim();
            var role = ((panel.querySelector("#apRole") || {}).value || "").trim();
            var mins = ((panel.querySelector("#apMins") || {}).value || "").trim();
            var asked = ((panel.querySelector("#apAsked") || {}).value || "").trim();
            if (!co && !role) { K.toast("at least a company or a role"); return; }
            apps.push({ at: new Date().toISOString(), company: co, role: role, mins: mins, asked: asked });
            K.logLine(rec, "application logged: " + (co || "\u2014") + (role ? " \u00b7 " + role : ""));
            await K.save(rec); h.render();
            K.toast("logged \u2014 " + inWeek(apps) + " of " + TARGET + " this week");
            return;
          }
          if (act === "csv") {
            var rows = [["date", "company", "role", "minutes", "what it asked"]].concat(apps.map(function (a) {
              return [K.day(a.at), a.company || "", a.role || "", a.mins || "", String(a.asked || "").replace(/\n/g, " / ")];
            }));
            var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
            K.download(K.slug(rec.name) + "-applications.csv", csv, "text/csv");
            K.toast("downloaded the board");
            return;
          }
        };
      });
    }
  });

  window.ObiRole = { slug: "application-board", name: "THE APPLICATIONS", target: TARGET,
    count: function (rec) { return AP(rec).length; },
    week: function (rec) { return inWeek(AP(rec)); } };
})();
