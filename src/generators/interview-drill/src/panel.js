/* ============================================================================
   THE INTERVIEW — src/generators/interview-drill/src/panel.js

   The tape names the deliverable and then hands over the evidence:

      "I don't know if I interview on Zoom or outside?" → "So that's something
       that we can practice as interviews."
      "Is it the international company or the Vietnamese company? Is there asking
       more bullshit questions? … What's your blood type? Are you married yet?
       Why not?"

   The bank's first group is therefore not invented: those four were asked of a
   student, and the tutor repeated them out loud as the real thing. The drill is
   the tutor's own: run it cold, recorded, mark the three that broke, rewrite only
   those, run it again — until it is boring to say. Boring is the target.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  var STEPS = [
    "a call, on camera, full length \u2014 the real mode is a screen, not a room",
    "the tutor asks from the bank below, cold, in a believable order",
    "record the answer to every question; do not coach mid-answer",
    "mark the three that broke",
    "rewrite ONLY those three answers, then run it again",
    "repeat until it is boring to say \u2014 boring is the target"
  ];

  function IV(rec) {
    if (!rec.interview || typeof rec.interview !== "object") rec.interview = {};
    var v = rec.interview;
    v.runs = v.runs || []; v.ready = v.ready || {};
    return v;
  }
  function flatten() {
    var out = [];
    M.BANK.forEach(function (g) { g[1].forEach(function (q) { out.push({ group: g[0], q: q }); }); });
    return out;
  }
  function drillSheet(rec, iv) {
    var flat = flatten();
    var rows = flat.map(function (f, i) {
      return "<tr><td>" + esc(f.group) + "</td><td>" + esc(f.q) + "</td><td style=\"width:16%\">"
        + (iv.ready[String(i + 1)] ? "rehearsed" : "") + "</td></tr>";
    }).join("");
    var runs = iv.runs.map(function (r, i) {
      return "<tr><td>" + esc(K.day(r.at)) + "</td><td>" + esc((r.broke || []).join(" \u00b7 ") || "\u2014") + "</td><td>" + esc(r.note || "") + "</td></tr>";
    }).join("");
    return K.printSheet(rec.name + " \u2014 the interview drill",
      "<header><h1>The interview drill</h1>"
      + '<div class="hl">' + esc(rec.name) + " \u2014 the bank, the drill, and the three that broke</div>"
      + '<div class="ct">' + iv.runs.length + " run(s) held \u00b7 " + flat.filter(function (f, i) { return iv.ready[String(i + 1)]; }).length + " of " + flat.length + " rehearsed to boring</div></header>"
      + "<section><h2>the drill</h2><ol>" + STEPS.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></section>"
      + "<section><h2>the bank</h2><table><tr><th>group</th><th>the question</th><th>rehearsed</th></tr>" + rows + "</table>"
      + "<p>The first group is first on purpose: those four were actually asked, and they are the ones a candidate freezes on.</p></section>"
      + (runs ? "<section><h2>the runs</h2><table><tr><th>date</th><th>the three that broke</th><th>note</th></tr>" + runs + "</table></section>" : "")
      + "<footer>boring is the target \u00b7 rewrite only the three that broke \u00b7 the real mode is a screen, not a room</footer>");
  }

  K.shell({
    name: "THE INTERVIEW",
    what: "rec 1 \u00b7 rec 4 \u2014 the bank this market actually asks, and the drill that makes it boring to say",
    panel: function (rec, h) {
      var iv = IV(rec);
      var item = M.BY_ID.interview;
      var flat = flatten();
      var readyN = flat.filter(function (f, i) { return iv.ready[String(i + 1)]; }).length;
      var last = iv.runs.length ? iv.runs[iv.runs.length - 1] : null;

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("the first group is not invented", "it was asked",
                "\u201cWhat's your blood type? Are you married yet? Why not?\u201d \u2014 the tutor repeated them out loud as the real thing. Do not flinch at them; answer them.")
        + K.row("runs held", iv.runs.length + (last ? " \u00b7 last " + K.day(last.at) : ""),
                "a run is a real call, on camera, full length \u2014 not a rehearsal in the head")
        + K.row("rehearsed to boring", readyN + " of " + flat.length,
                "tick a question only when it has stopped being interesting to say"));

      var n = 0;
      var bankCard = K.card("the bank",
        M.BANK.map(function (g) {
          return "<h3>" + esc(g[0]) + (g[0].indexOf("ACTUALLY") >= 0 ? ' <span class="ok-tag" style="color:var(--cyan)">asked on the tape</span>' : "") + "</h3>"
            + g[1].map(function (q) {
              n++;
              var key = String(n), on = !!iv.ready[key];
              return '<div class="ok-check"><input type="checkbox" data-ready="' + key + '"' + (on ? " checked" : "") + ">"
                + "<span>" + esc(q) + (on ? ' <span class="ok-tag" style="color:var(--ok)">boring</span>' : "") + "</span></div>";
            }).join("");
        }).join("")
        + '<div class="ok-bar" style="margin-top:10px"><button class="ok-btn" data-act="print">print the bank and the drill</button>'
        + '<button class="ok-btn ghost" data-act="copy">copy the whole bank</button></div>');

      var runCard = K.card("the runs \u2014 and the three that broke",
        (iv.runs.length
          ? '<table class="ok-t"><tr><th>date</th><th>the three that broke</th><th>note</th></tr>'
            + iv.runs.slice().reverse().slice(0, 10).map(function (r) {
              return '<tr><td class="n">' + esc(K.day(r.at)) + "</td><td>" + esc((r.broke || []).join(" \u00b7 ") || "\u2014") + "</td><td>" + esc(r.note || "") + "</td></tr>";
            }).join("") + "</table>"
          : K.note("no run held yet", "warn"))
        + '<div class="ok-sec"><b>Hold a run</b>'
        + '<div class="ok-bar" style="margin-top:6px">'
        + '<input class="ok-input" style="flex:1 1 260px" id="ivBroke" placeholder="the three that broke \u2014 separated by \u00b7">'
        + '<input class="ok-input" style="flex:1 1 200px" id="ivNote" placeholder="what to change before the next run">'
        + '<button class="ok-btn gold" data-act="logrun">log the run</button></div>'
        + K.note("Only the three that broke get rewritten. Rewriting everything after every run is how a student stops practising.", "") + "</div>");

      return head + bankCard + runCard;
    },
    after: function (rec, panel, h) {
      var iv = IV(rec);
      Array.prototype.forEach.call(panel.querySelectorAll("[data-ready]"), function (cb) {
        cb.onchange = async function () {
          iv.ready[cb.getAttribute("data-ready")] = cb.checked;
          K.logLine(rec, "interview question " + cb.getAttribute("data-ready") + " " + (cb.checked ? "rehearsed to boring" : "unmarked"));
          await K.save(rec); h.render();
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "logrun") {
            var broke = K.lines((panel.querySelector("#ivBroke") || {}).value || "");
            var noteTxt = ((panel.querySelector("#ivNote") || {}).value || "").trim();
            iv.runs.push({ at: new Date().toISOString(), broke: broke, note: noteTxt });
            K.logLine(rec, "interview run held, " + broke.length + " broke");
            await K.save(rec); h.render(); K.toast("run logged"); return;
          }
          if (act === "copy") {
            K.copy(M.BANK.map(function (g) { return g[0] + "\n" + g[1].map(function (q) { return "- " + q; }).join("\n"); }).join("\n\n"), "the bank");
            return;
          }
          if (act === "print") {
            var html = drillSheet(rec, iv);
            var w = window.open("", "_blank");
            if (!w) { K.download(K.slug(rec.name) + "-interview.html", html); K.toast("downloaded"); return; }
            w.document.write(html); w.document.close();
            setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350);
            return;
          }
        };
      });
    }
  });

  window.ObiRole = { slug: "interview-drill", name: "THE INTERVIEW", bank: M.BANK, steps: STEPS,
    sheet: function (rec) { return drillSheet(rec, IV(rec)); } };
})();
