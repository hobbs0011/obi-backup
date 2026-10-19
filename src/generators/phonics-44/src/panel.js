/* ============================================================================
   THE 44 — src/generators/phonics-44/src/panel.js

   The tape, and the refusal inside it:

      "we get to use that conversation we've just had to test your 44 phonics.
       I won't make you read any of the annoying gay stuff."

   The tutor refused the reading test on purpose: 44 sounds are assessed by
   SPEAKING them. So the instrument here is a mark sheet, not a quiz — the student
   sits it on a recording, the recording is transcribed, and a human marks which
   sounds slipped. Nothing is scored automatically, and the card says so.

   The drill is the other half, and the dose is small on purpose: only the sounds
   that slipped, ten minutes a day, and the same set again in a week.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  function PH(rec) {
    if (!rec.phonics || typeof rec.phonics !== "object") rec.phonics = {};
    var p = rec.phonics;
    p.marks = p.marks || {}; p.runs = p.runs || [];
    return p;
  }
  var SOUNDS = M.PHONEMES.map(function (r) { return { id: r[0], spelling: r[1], say: r[2] }; });
  function stateOf(p, id) { var m = p.marks[id]; return m && m.state ? m.state : "unmarked"; }

  function drillList(p) {
    return SOUNDS.filter(function (s) { return stateOf(p, s.id) === "drill"; });
  }
  function markSheet(rec, p) {
    var counts = { ok: 0, drill: 0, unmarked: 0 };
    SOUNDS.forEach(function (s) { counts[stateOf(p, s.id)]++; });
    var rows = SOUNDS.map(function (s) {
      var st = stateOf(p, s.id);
      var m = p.marks[s.id] || {};
      return "<tr><td><b>" + esc(s.id) + "</b></td><td>" + esc(s.spelling) + "</td><td>" + esc(s.say) + "</td>"
        + "<td>" + (st === "unmarked" ? "\u2014" : esc(st === "drill" ? "DRILL" : "OK")) + "</td>"
        + "<td>" + (m.note ? esc(m.note) : "") + "</td></tr>";
    }).join("");
    var pairs = M.MINIMAL_PAIRS.map(function (pr) { return "<tr><td>" + esc(pr[0]) + "</td><td>" + esc(pr[1]) + "</td><td></td></tr>"; }).join("");
    return K.printSheet(rec.name + " \u2014 the 44 sounds",
      "<header><h1>The 44 sounds</h1>"
      + '<div class="hl">' + esc(rec.name) + " \u2014 a SPEAKING test, sat on a recording</div>"
      + '<div class="ct">sat ' + esc(K.day(new Date().toISOString())) + " \u00b7 marked by hand \u00b7 44 sounds: "
      + counts.ok + " ok \u00b7 " + counts.drill + " to drill \u00b7 " + counts.unmarked + " unmarked</div></header>"
      + "<section><h2>the sounds</h2><table><tr><th>sound</th><th>spelling</th><th>say these</th><th>mark</th><th>note</th></tr>" + rows + "</table></section>"
      + "<section><h2>the collisions</h2><table><tr><th>pair</th><th>say both</th><th>mark</th></tr>" + pairs + "</table>"
      + "<p>Say both, in one breath, ten times \u2014 the mouth learns the difference faster than the ear.</p></section>"
      + (drillList(p).length
        ? "<section><h2>drill only these \u2014 ten minutes a day</h2><ul>" + drillList(p).map(function (s) { return "<li><b>" + esc(s.id) + "</b> \u2014 " + esc(s.say) + "</li>"; }).join("") + "</ul></section>"
        : "")
      + "<footer>run order: sit \u2192 record \u2192 transcribe \u2192 mark \u2192 drill \u2192 re-sit the same set in a week. No automatic scoring: a machine does not hear a student the way the tutor does.</footer>");
  }

  K.shell({
    name: "THE 44",
    what: "rec 3 \u00b7 rec 4 \u2014 the 44 sounds, spoken not read \u00b7 marked by hand \u00b7 drilled ten minutes a day",
    panel: function (rec, h) {
      var p = PH(rec);
      var item = M.BY_ID.phonics;
      var counts = { ok: 0, drill: 0, unmarked: 0 };
      SOUNDS.forEach(function (s) { counts[stateOf(p, s.id)]++; });
      var drill = drillList(p);

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("what it is", "a SPEAKING test, not a reading test",
                "the tutor refused to have them read: \u201cI won't make you read any of the annoying gay stuff\u201d")
        + K.row("the run", "sit \u2192 record \u2192 transcribe \u2192 mark \u2192 drill \u2192 re-sit",
                "sit it once, mark it, drill ONLY what slipped, and sit the same set again in a week")
        + K.row("the sheet so far", counts.ok + " ok \u00b7 " + counts.drill + " to drill \u00b7 " + counts.unmarked + " unmarked",
                "\u201cno automatic scoring\u201d is not a limitation, it is the design \u2014 a human marks what a human heard"));

      var soundsCard = K.card("the 44 sounds \u2014 mark what you heard",
        '<div class="ok-bar" style="margin-bottom:8px">'
        + '<button class="ok-btn gold" data-act="markallok">mark every unmarked OK \u2014 I heard them</button>'
        + '<button class="ok-btn ghost" data-act="clear">clear the marks</button>'
        + '<button class="ok-btn ghost" data-act="print">print the mark sheet</button>'
        + '<button class="ok-btn ghost" data-act="drill">print the drill list only</button></div>'
        + '<table class="ok-t"><tr><th>sound</th><th>spelling</th><th>say these</th><th>mark</th></tr>'
        + SOUNDS.map(function (s) {
          var st = stateOf(p, s.id);
          var m = p.marks[s.id] || {};
          return '<tr><td class="n"><b>' + esc(s.id) + "</b></td><td class=\"n\">" + esc(s.spelling) + "</td><td>" + esc(s.say) + "</td>"
            + "<td>"
            + '<button class="ok-btn' + (st === "ok" ? " gold" : " ghost") + '" data-mark="' + esc(s.id) + '|ok">ok</button> '
            + '<button class="ok-btn' + (st === "drill" ? " gold" : " ghost") + '" data-mark="' + esc(s.id) + '|drill">drill</button>'
            + (m.at ? '<div class="ok-note">' + esc(K.day(m.at)) + "</div>" : "")
            + '<input class="ok-input" style="margin-top:4px;font-size:12px" data-note="' + esc(s.id) + '" placeholder="what you actually heard" value="' + esc(m.note || "") + '">'
            + "</td></tr>";
        }).join("") + "</table>");

      var pairsCard = K.card("the collisions this market actually makes",
        '<table class="ok-t"><tr><th>pair</th><th>say both, ten times</th></tr>'
        + M.MINIMAL_PAIRS.map(function (pr) { return '<tr><td class="n">' + esc(pr[0]) + "</td><td>" + esc(pr[1]) + "</td></tr>"; }).join("")
        + "</table>"
        + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn ghost" data-copy="' + esc(M.MINIMAL_PAIRS.map(function (pr) { return pr[0] + " \u2014 " + pr[1]; }).join("\n")) + '" data-copy-label="the collisions">copy the pairs</button></div>');

      var drillCard = K.card("the drill list \u2014 only what slipped",
        drill.length
          ? K.ul(drill.map(function (s) { return "<b>" + esc(s.id) + "</b> \u2014 " + esc(s.say); })) + K.note("Ten minutes a day. The rest of the hour is the weekly recording.", "")
          : K.note("Nothing marked DRILL yet. Sit the set, record it, mark it, and this list fills itself.", ""));

      var runsCard = K.card("the sittings",
        p.runs.length
          ? '<table class="ok-t"><tr><th>sat</th><th>transcript</th><th>ok / drill</th></tr>'
            + p.runs.slice(-8).reverse().map(function (r) {
              return '<tr><td class="n">' + esc(K.day(r.at)) + "</td><td>" + esc(r.link || "\u2014") + '</td><td class="n">' + esc(String(r.ok || 0)) + " / " + esc(String(r.drill || 0)) + "</td></tr>";
            }).join("") + "</table>"
          : K.note("no sitting logged yet", "warn")
        + '<div class="ok-bar" style="margin-top:8px">'
        + '<input class="ok-input" style="flex:1 1 260px" id="phRun" placeholder="where the recording is \u2014 a link, a file name, or \u2018/transcribe\u2019">'
        + '<button class="ok-btn gold" data-act="logrun">log this sitting</button></div>'
        + K.note("A sitting is recorded, transcribed, then marked above \u2014 the log is what makes the next one comparable.", ""));

      return head + soundsCard + pairsCard + drillCard + runsCard;
    },
    after: function (rec, panel, h) {
      var p = PH(rec);
      Array.prototype.forEach.call(panel.querySelectorAll("[data-mark]"), function (b) {
        b.onclick = async function () {
          var parts = b.getAttribute("data-mark").split("|");
          var id = parts[0], st = parts[1];
          var cur = p.marks[id];
          if (cur && cur.state === st) { delete p.marks[id]; }
          else p.marks[id] = { state: st, at: new Date().toISOString(), note: (cur && cur.note) || "" };
          K.logLine(rec, "phonics " + id + " = " + st);
          await K.save(rec); h.render();
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-note]"), function (inp) {
        inp.onchange = async function () {
          var id = inp.getAttribute("data-note");
          p.marks[id] = p.marks[id] || { state: "unmarked", at: new Date().toISOString() };
          p.marks[id].note = inp.value;
          await K.save(rec);
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "markallok") {
            SOUNDS.forEach(function (s) { if (stateOf(p, s.id) === "unmarked") p.marks[s.id] = { state: "ok", at: new Date().toISOString(), note: "" }; });
            K.logLine(rec, "phonics: every unmarked sound marked ok by hand");
            await K.save(rec); h.render(); K.toast("marked \u2014 a human said they heard them"); return;
          }
          if (act === "clear") {
            p.marks = {}; K.logLine(rec, "phonics marks cleared"); await K.save(rec); h.render(); return;
          }
          if (act === "logrun") {
            var link = ((panel.querySelector("#phRun") || {}).value || "").trim();
            var counts = { ok: 0, drill: 0, unmarked: 0 };
            SOUNDS.forEach(function (s) { counts[stateOf(p, s.id)]++; });
            p.runs.push({ at: new Date().toISOString(), link: link, ok: counts.ok, drill: counts.drill, unmarked: counts.unmarked });
            if (link) K.inbox(rec, "phonics", "sitting \u00b7 " + K.day(new Date().toISOString()), link);
            K.logLine(rec, "phonics sitting logged with " + counts.drill + " to drill");
            await K.save(rec); h.render(); K.toast("sitting logged"); return;
          }
          if (act === "print" || act === "drill") {
            var html = act === "print" ? markSheet(rec, p) : K.printSheet(rec.name + " \u2014 drill list",
              "<header><h1>Drill these</h1><div class=\"hl\">" + esc(rec.name) + " \u2014 ten minutes a day</div></header>"
              + "<section>" + (drill.length ? "<ul>" + drill.map(function (s) { return "<li><b>" + esc(s.id) + "</b> \u2014 " + esc(s.say) + "</li>"; }).join("") + "</ul>" : "<p>Nothing marked DRILL.</p>") + "</section>"
              + "<footer>only the sounds that slipped \u00b7 re-sit the full set in a week</footer>");
            var w = window.open("", "_blank");
            if (!w) { K.download(K.slug(rec.name) + "-44.html", html); K.toast("downloaded"); return; }
            w.document.write(html); w.document.close();
            setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350);
            return;
          }
        };
      });
    }
  });

  window.ObiRole = { slug: "phonics-44", name: "THE 44", sounds: SOUNDS, pairs: M.MINIMAL_PAIRS,
    sheet: function (rec) { return markSheet(rec, PH(rec)); },
    drill: function (rec) { var p = PH(rec); return drillList(p).map(function (s) { return s.id; }); } };
})();
