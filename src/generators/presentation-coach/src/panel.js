/* ============================================================================
   THE WEEKLY PRESENTATION — src/generators/presentation-coach/src/panel.js

   The tape, and the arithmetic inside it:

      "Practice a presentation on the subject, record it for video 15-20 minutes.
       Boom, you're done. We'll do that like a few times a week. …
       it'll be about an hour, probably total, but we'll spread it out. …
       it'll build up like a snowball."

   So: a DOSE (15–20 minutes), a FREQUENCY (a few times a week, ~an hour a week,
   deliberately spread), a SHAPE (five beats), and a READING SHEET with the
   tutor's own rule on it — ONE correction per run, never five:

      "I'm not trying to overwhelm you guys… I'm gonna be a little bit harder
       on you."  — the same sentence said twice.

   Nothing here scores automatically: the tutor watches and marks six rows.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  var BEATS = [
    ["Say what it is \u2014 one sentence", "0:00\u20130:30", "what the thing is, and why it is worth twenty minutes of anyone's time"],
    ["Three points, in order", "to ~12:00", "one point at a time, each with its own little example"],
    ["The example that makes it real", "to ~17:00", "the one story a listener remembers tomorrow"],
    ["What you think about it", "to 20:00", "an opinion, owned \u2014 not a summary of other people's"],
    ["Stop", "\u2014", "no script, no reading: five words on a card at most"]
  ];
  var ROWS = ["Content", "Structure", "Delivery", "Language", "Fluency", "Pronunciation"];
  var TOPIC_SEEDS = [
    "something they have made \u2014 a model, a design, a rebuild of the school magazine",
    "the game they play best, explained to someone who has never seen it",
    "the job they want, and what the first week in it actually looks like",
    "a product they would improve, and exactly how",
    "their own class: what the degree taught, and what it did not",
    "a place they know well, and why a stranger should go",
    "the last thing they learned that surprised them",
    "how they would sell something they own for twice what they paid",
    "a person whose work they admire, and the one technique they copied",
    "a mistake they made, told honestly, with what changed after"
  ];

  function PR(rec) {
    if (!rec.present || typeof rec.present !== "object") rec.present = {};
    var p = rec.present;
    p.beats = p.beats || {}; p.runs = p.runs || [];
    return p;
  }
  function avg(run) {
    var vals = ROWS.map(function (r) { return Number(run.scores && run.scores[r]) || 0; }).filter(function (n) { return n > 0; });
    if (!vals.length) return 0;
    return Math.round((vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) * 10) / 10;
  }
  function readingSheet(rec, p) {
    var topic = K.val(rec, "present_topic") || p.topic || "";
    var body = "<header><h1>The weekly recorded presentation</h1>"
      + '<div class="hl">' + esc(rec.name) + " \u2014 15\u201320 minutes, recorded, a few times a week</div>"
      + '<div class="ct">topic: ' + (topic ? esc(topic) : '<span class="rule">not chosen yet \u2014 it is THEIR subject, that is the point</span>') + "</div></header>"
      + "<section><h2>the shape</h2><table><tr><th>beat</th><th>clock</th><th>what goes there</th></tr>"
      + BEATS.map(function (b, i) {
        return "<tr><td><b>" + (i + 1) + ". " + esc(b[0]) + "</b></td><td>" + esc(b[1]) + "</td><td>" + esc(b[2])
          + (p.beats[i] ? ' \u2014 <i>' + esc(p.beats[i]) + "</i>" : "") + "</td></tr>";
      }).join("") + "</table></section>"
      + "<section><h2>the reading sheet \u2014 six rows, one correction</h2>"
      + "<table><tr><th>row</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>"
      + ROWS.map(function (r) { return "<tr><td><b>" + esc(r) + "</b></td><td></td><td></td><td></td><td></td><td></td></tr>"; }).join("")
      + "</table>"
      + "<p><b>The one correction for this run:</b> <span class=\"rule\">write it here</span></p>"
      + "<p>One correction per run. More than one is how a student stops hearing any of them.</p></section>";
    if (p.runs.length) {
      var last = p.runs[p.runs.length - 1];
      body += "<section><h2>the last run \u2014 " + esc(K.day(last.at)) + "</h2><table>"
        + ROWS.map(function (r) { return "<tr><td>" + esc(r) + "</td><td>" + (last.scores && last.scores[r] ? esc(String(last.scores[r])) : "\u2014") + "</td></tr>"; }).join("")
        + "</table><p><b>the correction given:</b> " + (last.correction ? esc(last.correction) : "<span class=\"rule\">not recorded</span>") + "</p></section>";
    }
    body += "<footer>" + p.runs.length + " run(s) on the record \u00b7 one correction per run \u00b7 the dose is ~an hour a week, spread out, so it \u201cbuilds up like a snowball\u201d</footer>";
    return K.printSheet(rec.name + " \u2014 the reading sheet", body);
  }

  K.shell({
    name: "THE WEEKLY PRESENTATION",
    what: "rec 3 \u2014 15\u201320 minutes, a few times a week, spread out \u00b7 one correction per run",
    panel: function (rec, h) {
      var p = PR(rec);
      var item = M.BY_ID.present;
      var topic = K.val(rec, "present_topic") || p.topic || "";
      var last = p.runs.length ? p.runs[p.runs.length - 1] : null;
      var trend = p.runs.slice(-6).map(function (r) { return avg(r); }).filter(function (n) { return n > 0; });

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("the dose", "15\u201320 minutes \u00b7 a few times a week",
                "the tutor's own arithmetic: about an hour a week, \u201cspread out\u201d \u2014 not one long slog")
        + K.row("the rule that matters most", "ONE correction per run",
                "the same sentence said twice on the tape: \u201cI'm not trying to overwhelm you guys\u201d and \u201cI'm gonna be a little bit harder on you\u201d")
        + K.row("runs received", p.runs.length + (last ? " \u00b7 last " + K.day(last.at) + (avg(last) ? " \u00b7 marked " + avg(last) + "/5" : "") : ""),
                trend.length > 1 ? "trend (last " + trend.length + "): " + trend.join(" \u2192 ") : ""));

      var topicCard = K.card("the subject \u2014 theirs, not ours",
        K.row("on the record", topic ? esc(topic) : K.blankRule("none chosen yet"),
              "a subject they can talk about without notes for twenty minutes \u2014 the fluency is the point, not the topic")
        + '<div class="ok-sec ok-bar">'
        + '<input class="ok-input" style="flex:1 1 300px" id="pcTopic" placeholder="the subject, in their words" value="' + esc(topic) + '">'
        + '<button class="ok-btn gold" data-act="settopic">set it</button></div>'
        + "<h3>if they cannot think of one \u2014 seeds, not scripts</h3>" + K.ul(TOPIC_SEEDS));

      var shapeCard = K.card("the shape \u2014 five beats",
        BEATS.map(function (b, i) {
          return '<div class="ok-row"><b>' + esc(b[1]) + "</b><span class=\"ok-v\"><b>" + esc(b[0]) + "</b>"
            + '<div class="ok-note">' + esc(b[2]) + "</div>"
            + '<input class="ok-input" style="margin-top:5px" data-beat="' + i + '" placeholder="their plan for this beat, in their own words" value="' + esc(p.beats[i] || "") + '">'
            + "</span></div>";
        }).join("")
        + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn" data-act="print">print the reading sheet</button></div>');

      var runCard = K.card("the runs \u2014 and the reading",
        (p.runs.length
          ? '<table class="ok-t"><tr><th>run</th><th>minutes</th><th>marked</th><th>the one correction</th></tr>'
            + p.runs.slice(-8).reverse().map(function (r, i) {
              var idx = p.runs.length - 1 - i;
              return '<tr><td class="n">' + esc(K.day(r.at)) + "</td><td class=\"n\">" + esc(r.mins || "\u2014") + '</td><td class="n">' + (avg(r) || "\u2014") + "</td>"
                + "<td>" + (r.correction ? esc(r.correction) : '<span style="color:var(--bad)">no correction recorded</span>')
                + ' <button class="ok-btn ghost" data-openrun="' + idx + '">read it</button></td></tr>';
            }).join("") + "</table>"
          : K.note("no run logged yet \u2014 the first one is the baseline, not the verdict.", "warn"))
        + '<div class="ok-sec ok-bar">'
        + '<input class="ok-input" style="flex:0 0 110px" id="pcMins" placeholder="minutes" inputmode="numeric">'
        + '<input class="ok-input" style="flex:1 1 240px" id="pcLink" placeholder="where it is \u2014 a link or a file name">'
        + '<button class="ok-btn gold" data-act="logrun">log a run</button></div>');

      var sheetCard = K.card("the reading \u2014 " + (last ? "marking the last run" : "no run to mark yet"),
        last
          ? '<table class="ok-t"><tr><th>row</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>'
            + ROWS.map(function (r) {
              return "<tr><td><b>" + esc(r) + "</b></td>" + [1, 2, 3, 4, 5].map(function (n) {
                var on = Number(last.scores && last.scores[r]) === n;
                return '<td><button class="ok-btn' + (on ? " gold" : " ghost") + '" data-score="' + esc(r) + '|' + n + '">' + n + "</button></td>";
              }).join("") + "</tr>";
            }).join("") + "</table>"
            + '<div class="ok-sec"><b>The ONE correction for this run</b>'
            + '<input class="ok-input" style="margin-top:5px" id="pcCorr" placeholder="one line \u2014 the thing to change next time" value="' + esc(last.correction || "") + '">'
            + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn gold" data-act="savecorr">keep the correction</button></div>'
            + K.note("If you want to write a second correction, that is the sign to stop at one.", "") + "</div>"
          : K.note("Log a run first \u2014 then the six rows appear here.", ""));

      return head + topicCard + shapeCard + runCard + sheetCard;
    },
    after: function (rec, panel, h) {
      var p = PR(rec);
      var cur = p.runs.length - 1;
      Array.prototype.forEach.call(panel.querySelectorAll("[data-beat]"), function (inp) {
        inp.onchange = async function () { p.beats[inp.getAttribute("data-beat")] = inp.value; await K.save(rec); };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-score]"), function (b) {
        b.onclick = async function () {
          if (cur < 0) return;
          var parts = b.getAttribute("data-score").split("|");
          p.runs[cur].scores = p.runs[cur].scores || {};
          p.runs[cur].scores[parts[0]] = Number(parts[1]);
          K.logLine(rec, "presentation marked " + parts[0] + " = " + parts[1]);
          await K.save(rec); h.render();
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-openrun]"), function (b) {
        b.onclick = function () {
          var r = p.runs[Number(b.getAttribute("data-openrun"))];
          if (!r) return;
          h.io(K.card("run \u00b7 " + esc(K.day(r.at)),
            K.row("minutes", esc(r.mins || "\u2014"))
            + K.row("where it is", esc(r.link || "\u2014"))
            + ROWS.map(function (row) { return K.row(row, r.scores && r.scores[row] ? esc(String(r.scores[row])) + " / 5" : K.blankRule("not marked")); }).join("")
            + K.row("the correction given", r.correction ? esc(r.correction) : '<span style="color:var(--bad)">none recorded \u2014 one is required</span>')
            + '<div class="ok-bar"><button class="ok-btn" id="pcIoC">close</button></div>'));
          document.getElementById("pcIoC").onclick = h.ioHide;
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "settopic") {
            var v = ((panel.querySelector("#pcTopic") || {}).value || "").trim();
            K.setField(rec, "present_topic", "Presentation topic", v, "supplied in THE WEEKLY PRESENTATION");
            p.topic = v;
            await K.save(rec); h.render(); K.toast(v ? "topic set" : "topic cleared"); return;
          }
          if (act === "logrun") {
            var mins = ((panel.querySelector("#pcMins") || {}).value || "").trim();
            var link = ((panel.querySelector("#pcLink") || {}).value || "").trim();
            p.runs.push({ at: new Date().toISOString(), mins: mins, link: link, scores: {}, correction: "" });
            if (link) K.inbox(rec, "present", "presentation \u00b7 " + K.day(new Date().toISOString()), link);
            K.logLine(rec, "presentation run logged" + (mins ? " (" + mins + " min)" : ""));
            await K.save(rec); h.render(); K.toast("run logged \u2014 mark it below, one correction"); return;
          }
          if (act === "savecorr") {
            if (cur < 0) return;
            var c = ((panel.querySelector("#pcCorr") || {}).value || "").trim();
            p.runs[cur].correction = c;
            await K.save(rec); h.render(); K.toast(c ? "correction kept" : "cleared"); return;
          }
          if (act === "print") {
            var w = window.open("", "_blank");
            var html = readingSheet(rec, p);
            if (!w) { K.download(K.slug(rec.name) + "-reading-sheet.html", html); K.toast("downloaded"); return; }
            w.document.write(html); w.document.close();
            setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350);
            return;
          }
        };
      });
    }
  });

  window.ObiRole = { slug: "presentation-coach", name: "THE WEEKLY PRESENTATION",
    beats: BEATS, rows: ROWS, seeds: TOPIC_SEEDS,
    sheet: function (rec) { return readingSheet(rec, PR(rec)); } };
})();
