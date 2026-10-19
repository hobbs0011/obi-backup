/* ============================================================================
   THE CREDIT — src/generators/work-credit/src/panel.js

   The tape offers real work, and the exact phrasing to credit it with:

      "It actually gives you hundreds of models to make and I only need to take
       about 100. And you can put that in your CV as well. If you help me."
      "How cool it would be you do some Roblox work with me… Train 67 is the name
       of my game… so you could say you helped consult and design for [it]…
       consultants get paid big money… we're just sitting there using like my $20
       just to learn together."

   Work that exists beats a certificate that does not. So this role SCOPES one
   piece the student can genuinely own, writes the credit line in the tutor's own
   form, and drafts the five-minute answer they have to be able to give in an
   interview without notes.

   THE GATE IS THE SOVEREIGN'S WORD. Nothing may be credited until he has said
   what may be credited; the scope carries a switch for that and refuses to emit
   a line while it is off.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;
  var SKELETON = [
    ["what", "what it is", "the one piece of the product the student genuinely owns"],
    ["doneword", "what \u2018done\u2019 means", "the smallest thing that is finished and can be shown"],
    ["work", "what they will do", "the actual work, in plain verbs \u2014 model, rig, texture, test, edit"],
    ["learned", "what they will learn", "named, so the work is also training"],
    ["shown", "how it is shown", "a link, a build, a file \u2014 so it can be put in front of a stranger"]
  ];

  function WC(rec) {
    if (!rec.creditWork || typeof rec.creditWork !== "object") rec.creditWork = { scope: {}, allowed: false, line: "", added: false };
    var c = rec.creditWork; c.scope = c.scope || {};
    return c;
  }
  function creditTarget(rec, c) { return (c.scope.product || "").trim() || "[the product]"; }
  function lineFor(rec, c) {
    var what = (c.scope.what || "").trim();
    if (!what) return "";
    var target = creditTarget(rec, c);
    return (what.charAt(0).toUpperCase() + what.slice(1)) + " \u2014 helped consult and design for " + target + ".";
  }
  function answerFor(rec, c) {
    var s = c.scope;
    var L = [];
    L.push("WHAT I DID");
    L.push("I helped consult and design for " + creditTarget(rec, c) + ".");
    if (s.what) L.push("My piece was: " + s.what + ".");
    if (s.doneword) L.push("It was finished when: " + s.doneword + ".");
    if (s.work) L.push("Concretely, I " + s.work + ".");
    if (s.learned) L.push("What I took from it: " + s.learned + ".");
    L.push("");
    L.push("THE PROBLEM AND WHAT I DID ABOUT IT");
    L.push("[one thing that went wrong, in one sentence] \u2014 and the one change I made.");
    L.push("");
    L.push("WHY IT IS MINE");
    L.push("The part that was mine alone: " + (s.what || "[name it]") + ".");
    L.push("What I would do differently next time: [one sentence].");
    return L.join("\n");
  }

  K.shell({
    name: "THE CREDIT",
    what: "rec 4 \u2014 one piece of real, shipped work \u00b7 a credit line in the tutor\u2019s own form \u00b7 an answer they can give without notes",
    panel: function (rec, h) {
      var c = WC(rec);
      var item = M.BY_ID.work;
      var line = lineFor(rec, c);
      var gateOk = !!c.allowed;

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("why it beats a certificate", "work that exists beats a course that does not",
                "\u201cit actually gives you hundreds of models to make and I only need to take about 100 \u2026 if you help me\u201d")
        + K.row("the gate", item.gate ? esc(item.gate) : "\u2014",
                gateOk ? K.chip("GIVEN", "var(--ok)") + " the sovereign has said what may be credited"
                       : K.chip("NOT YET GIVEN", "var(--bad)") + " no line is emitted while this is off")
        + K.row("the cost line, in his words", "\u201cwe're just sitting there using like my $20 just to learn together\u201d", ""));

      var scopeCard = K.card("the scope \u2014 small enough to finish",
        SKELETON.map(function (s) {
          return '<div class="ok-row"><b>' + esc(s[0]) + '</b><span class="ok-v">'
            + '<div class="ok-note" style="margin:0 0 4px">' + esc(s[1]) + "</div>"
            + '<input class="ok-input" data-scope="' + esc(s[0]) + '" value="' + esc(c.scope[s[0]] || "") + '" placeholder="' + esc(s[2]) + '">'
            + "</span></div>";
        }).join("")
        + '<div class="ok-sec ok-row"><b>the product</b><span class="ok-v">'
        + '<input class="ok-input" data-scope="product" value="' + esc(c.scope.product || "") + '" placeholder="the product it is a piece of \u2014 the game, the site, the model set">'
        + "</span></div>"
        + '<div class="ok-sec"><label class="ok-check"><input type="checkbox" id="crAllow"' + (gateOk ? " checked" : "") + ">"
        + "<span><b>The sovereign has said what may be credited.</b>"
        + '<div class="ok-note">Until this is ticked, this role produces no credit line at all \u2014 the gate is a switch, not a note.</div></span></label></div>');

      var lineCard = K.card("the credit line, in plain words",
        line
          ? K.row("the line", esc(line), "the tutor's own form on the tape: \u201cyou could say you helped consult and design for\u2026\u201d")
            + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn" data-copy="' + esc(line) + '" data-copy-label="the credit line">copy it</button>'
            + '<button class="ok-btn gold" data-act="toexp">add it to the CV\u2019s experience row</button></div>'
            + (c.added ? K.note("this line is already on the experience row", "") : "")
          : K.note(gateOk ? "Fill \u2018what it is\u2019 and the line writes itself." : "The gate is off, so no line is produced. That is deliberate.", gateOk ? "warn" : "bad"));

      var ansCard = K.card("the five-minute answer",
        line ? '<pre class="ok-mono" style="white-space:pre-wrap;margin:0">' + esc(answerFor(rec, c)) + "</pre>"
          + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn" data-copy="' + esc(answerFor(rec, c)) + '" data-copy-label="the answer">copy the answer</button></div>'
          + K.note("They must be able to give this without notes. The bracketed lines are the ones only they can fill \u2014 this role does not invent a mistake or a lesson.", "")
          : K.note("No scope yet, so there is nothing to be able to talk about.", ""));

      return head + scopeCard + lineCard + ansCard;
    },
    after: function (rec, panel, h) {
      var c = WC(rec);
      /* read the scope out of the DOM at the moment an action runs, not only on
         blur: a field typed and then acted on in one movement must not be lost. */
      function grab() {
        Array.prototype.forEach.call(panel.querySelectorAll("[data-scope]"), function (inp) {
          c.scope[inp.getAttribute("data-scope")] = inp.value;
        });
      }
      Array.prototype.forEach.call(panel.querySelectorAll("[data-scope]"), function (inp) {
        inp.onchange = async function () { c.scope[inp.getAttribute("data-scope")] = inp.value; await K.save(rec); h.render(); };
      });
      var allow = panel.querySelector("#crAllow");
      if (allow) allow.onchange = async function () {
        grab();
        c.allowed = allow.checked;
        K.logLine(rec, "work credit gate " + (allow.checked ? "opened by the sovereign" : "closed"));
        await K.save(rec); h.render();
      };
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          if (btn.getAttribute("data-act") !== "toexp") return;
          grab();
          var line = lineFor(rec, c);
          if (!line) { K.toast("no line to add"); return; }
          var cur = K.val(rec, "experience");
          if (cur.indexOf(line) >= 0) { K.toast("already on the experience row"); return; }
          K.setField(rec, "experience", "Experience", (cur ? cur + "\n" : "") + line, "supplied in THE CREDIT");
          c.added = true;
          await K.save(rec); h.render(); K.toast("added \u2014 THE CV and THE LINKEDIN read this row");
        };
      });
    }
  });

  window.ObiRole = { slug: "work-credit", name: "THE CREDIT", skeleton: SKELETON,
    line: function (rec) { return lineFor(rec, WC(rec)); },
    answer: function (rec) { return answerFor(rec, WC(rec)); } };
})();
