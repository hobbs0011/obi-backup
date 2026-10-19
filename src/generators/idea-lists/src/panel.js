/* ============================================================================
   THE LISTS — src/generators/idea-lists/src/panel.js

   The one function on the tape that asks for a machine by name:

      "And also like we can generate some ideas. Yeah, a couple of lists of like
       a hundred like names."

   So this is the only role in the family that calls a model, and it calls it the
   way that line describes: IDEAS, in lists, big enough to choose from. The model
   is asked for options the student then picks from — never for facts about the
   student, never for a claim, and never for anything that goes on paper unread.

   Everything it produces is filed into the record's inbox VERBATIM, under the
   promise it serves, because generated ideas are material too (L38).

   NO MODEL, NO PROBLEM: every kind carries a built-in seed list, so the role is
   still useful in a page where the ai-text-plugin has not loaded — and it says
   which of the two it is showing.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  var KINDS = [
    { id: "roles", label: "Job titles to search for", item: "apps",
      ask: "job titles a beginner could actually be hired into, in Hanoi and remote, in this field",
      seeds: ["Junior UI Designer", "Product Design Intern", "Junior 3D Artist", "Game Art Intern", "Junior Motion Designer",
              "Social Media Designer", "Brand Assistant", "Junior Graphic Designer", "Level Design Intern", "Junior Web Designer"] },
    { id: "companies", label: "Who to apply to", item: "apps",
      ask: "types of employer that hire beginners in this field, with what they are (studio, agency, product company, outsourcing house)",
      seeds: ["a local design studio", "an outsourcing house that serves foreign clients", "a game studio with a mobile title",
              "an e-commerce company with an in-house design team", "an agency that needs a production designer", "a school that needs lesson materials built"] },
    { id: "topics", label: "Presentation subjects", item: "present",
      ask: "subjects a young person could speak about for twenty minutes out loud without notes",
      seeds: ["a game they play well, explained to someone who has never seen it", "how they would redesign their own CV",
              "the last thing they made and what they would change", "a piece of work they admire and the technique they copied",
              "the job they want and what week one in it looks like"] },
    { id: "headlines", label: "Headline options", item: "linkedin",
      ask: "LinkedIn headline options, one line each, in the form \u2018role \u2014 what I do and what I want\u2019, using only the role and skills supplied and inventing no experience",
      seeds: ["Designer \u2014 3D and layout, looking for a first product-team role", "Junior 3D Artist \u2014 models, textures, and a habit of finishing"] },
    { id: "names", label: "Umbrella / studio names", item: "umbrella",
      ask: "names for a one-person studio that can hold design, 3D and video at once \u2014 short, easy to say, easy to spell, nothing embarrassing in Vietnamese or English",
      seeds: ["their own name", "their name + \u2018studio\u2019", "a two-syllable invented word that reads the same in both languages"] },
    { id: "phonics", label: "Drill sentences", item: "phonics",
      ask: "short sentences, five to eight words, packed with the target sound, natural to say rather than tongue-twisters",
      needs: "the target sound or pair" },
    { id: "questions", label: "Interview questions", item: "interview",
      ask: "interview questions actually asked to juniors in this market, including the awkward personal ones a candidate should not be surprised by",
      needs: "the role being interviewed for",
      seeds: ["What is your blood type?", "Are you married yet? Why not?", "What was your college score \u2014 and can you show it?"] }
  ];

  function IL(rec) { if (!Array.isArray(rec.ideaLists)) rec.ideaLists = []; return rec.ideaLists; }
  function gen() {
    try { if (typeof root !== "undefined" && root && typeof root.generateText === "function") return root.generateText; } catch (e) {}
    return null;
  }

  K.shell({
    name: "THE LISTS",
    what: "rec 4 \u2014 \u201cwe can generate some ideas \u2026 a couple of lists of like a hundred like names\u201d \u2014 the one role that calls a model",
    panel: function (rec, h) {
      var lists = IL(rec);
      var have = !!gen();
      var last = lists.length ? lists[lists.length - 1] : null;

      var head = K.card("what this answers",
        K.row("from the tape", "\u201cAnd also like we can generate some ideas. Yeah, a couple of lists of like a hundred like names.\u201d")
        + K.row("what it is for", "options to CHOOSE from",
                "a list of a hundred is not a plan; it is the raw material for one \u2014 the student picks, and the picked item goes into the record")
        + K.row("the model", have ? K.chip("LOADED", "var(--ok)") + " the ai-text-plugin answered on this page" : K.chip("NOT LOADED", "var(--warn)"),
                have ? "what it writes is shown before it is kept, and filed verbatim when kept"
                     : "this page has no model, so the built-in seed lists are shown instead \u2014 the role still works")
        + (last ? K.row("last list", esc(last.kind) + " \u00b7 " + last.items.length + " item(s) \u00b7 " + esc(K.day(last.at)), "") : ""));

      var makeCard = K.card("make a list",
        '<div class="ok-bar">'
        + '<select class="ok-select" id="ilKind">' + KINDS.map(function (k) { return '<option value="' + k.id + '">' + esc(k.label) + "</option>"; }).join("") + "</select>"
        + '<input class="ok-input" style="flex:1 1 240px" id="ilSubj" placeholder="the subject, the sound, the role \u2014 whatever the list is about">'
        + '<select class="ok-select" id="ilN"><option value="10">10 ideas</option><option value="25" selected>25 ideas</option><option value="50">50 ideas</option><option value="100">100 ideas \u2014 the tape\u2019s own number</option></select>'
        + '<button class="ok-btn gold" data-act="gen">make the list</button></div>'
        + '<div id="ilLoader" hidden class="ok-note" style="margin-top:8px"><span class="ok-mono">\u25cf</span> thinking\u2026 the model can take up to a minute. Nothing was lost \u2014 do not reload.</div>'
        + '<div id="ilOut" style="margin-top:10px"></div>');

      var seedsCard = K.card("the built-in seeds \u2014 no model needed",
        KINDS.filter(function (k) { return k.seeds; }).map(function (k) {
          return "<h3>" + esc(k.label) + "</h3>" + K.ul(k.seeds) + "";
        }).join(""));

      var keptCard = K.card("the lists kept on the record \u2014 " + lists.length,
        lists.length
          ? lists.slice().reverse().slice(0, 6).map(function (l) {
              return '<div class="ok-row"><b>' + esc(K.day(l.at)) + "</b><span class=\"ok-v\">"
                + "<b>" + esc(l.kind) + "</b> " + K.chip(l.by || "the model", "var(--muted)") + " " + K.chip((l.items || []).length + " ideas", "var(--cyan)")
                + '<div class="ok-mono" style="white-space:pre-wrap;margin-top:4px">' + esc((l.items || []).slice(0, 8).join("\n")) + ((l.items || []).length > 8 ? "\n\u2026 and " + (l.items.length - 8) + " more" : "") + "</div>"
                + '<div class="ok-bar" style="margin-top:6px"><button class="ok-btn ghost" data-copy="' + esc((l.items || []).join("\n")) + '" data-copy-label="the list">copy all of it</button></div>'
                + "</span></div>";
            }).join("")
          : K.note("no lists kept yet", ""),
        "Every kept list is also filed in the record's inbox under the promise it serves, verbatim \u2014 so it travels with the record into the station.");

      return head + makeCard + seedsCard + keptCard;
    },
    after: function (rec, panel, h) {
      var lists = IL(rec);
      var btn = panel.querySelector('[data-act="gen"]');
      if (!btn) return;
      btn.onclick = async function () {
        var kindId = (panel.querySelector("#ilKind") || {}).value || "roles";
        var kind = KINDS.filter(function (k) { return k.id === kindId; })[0] || KINDS[0];
        var subj = ((panel.querySelector("#ilSubj") || {}).value || "").trim();
        var n = Number((panel.querySelector("#ilN") || {}).value) || 25;
        var out = panel.querySelector("#ilOut");
        var loader = panel.querySelector("#ilLoader");
        var g = gen();
        if (!g) {
          out.innerHTML = K.card("no model on this page",
            K.note("The ai-text-plugin is not loaded here, so this run used the built-in seeds. In a perchance generator (where <span class=\"ok-mono\">main.pjs</span> imports it) the model answers instead.", "warn")
            + K.ul(kind.seeds || ["nothing built in for this one"]));
          return;
        }
        if (kind.needs && !subj) { K.toast("this list needs " + kind.needs); return; }
        loader.hidden = false;
        var instruction = "You are helping a Vietnamese student build their career material. "
          + "List " + n + " " + kind.ask + (subj ? " about: " + subj : "") + ".\n"
          + "Rules: one per line, no numbering, no commentary, no headings, no duplicates. "
          + "Only options a beginner could genuinely use. Invent nothing about any person \u2014 these are choices, not claims.";
        try {
          var res = await g({ instruction: instruction, startWith: "", stopSequences: [] });
          var text = String(res && (res.text || res) || "").trim();
          var items = text.split("\n").map(function (s) { return s.replace(/^\s*[-*\u2022\d.)\s]+/, "").trim(); }).filter(function (s) { return s.length > 1; });
          if (!items.length) { loader.hidden = true; out.innerHTML = K.card("the model returned nothing", K.note("an empty reply is a reply \u2014 nothing was kept", "bad")); return; }
          lists.push({ at: new Date().toISOString(), kind: kind.label, by: "the model", subject: subj, items: items });
          if (kind.item) K.inbox(rec, kind.item, "idea list \u00b7 " + kind.label + (subj ? " \u00b7 " + subj : ""), items.join("\n"));
          K.logLine(rec, "idea list: " + kind.label + " \u00b7 " + items.length);
          await K.save(rec);
          loader.hidden = true;
          out.innerHTML = K.card("the list \u2014 " + items.length + " idea(s)",
            '<pre class="ok-mono" style="white-space:pre-wrap;margin:0">' + esc(items.join("\n")) + "</pre>"
            + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn" data-copy="' + esc(items.join("\n")) + '" data-copy-label="the list">copy all of it</button></div>',
            "kept on the record and filed in the inbox under " + esc(kind.label) + " \u2014 raw material, verbatim. Nothing from this list reaches a CV, a profile or a page until a human picks it.");
          wireCopy(out);
        } catch (e) {
          loader.hidden = true;
          out.innerHTML = K.card("the model did not answer", K.note(esc(String(e && e.message || e).slice(0, 160)), "bad"));
        }
      };
      function wireCopy(scope) {
        Array.prototype.forEach.call((scope || panel).querySelectorAll("[data-copy]"), function (el) {
          el.onclick = function () { K.copy(el.getAttribute("data-copy"), el.getAttribute("data-copy-label") || "copied"); };
        });
      }
      wireCopy(panel);
    }
  });

  window.ObiRole = { slug: "idea-lists", name: "THE LISTS", kinds: KINDS,
    seeded: true };
})();
