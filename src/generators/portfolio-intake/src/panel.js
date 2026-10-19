/* ============================================================================
   THE PORTFOLIO INTAKE — src/generators/portfolio-intake/src/panel.js

   The tape, twice, and the tutor is plainly repeating himself because it matters:

      "you can be sending me over everything you have. All the stuff you've done
       in your portfolio… And then I can use that to begin setting up your profile."
      "if you don't send it, you know what it does? It just gains dust and just
       sits there. So just try to send everything."

   So this role is a BIN WITH A LABEL ON IT. Whatever arrives is kept verbatim,
   the moment it arrives (L38 RAW_FIRST_DERIVE), and filed against the promise it
   can serve — a magazine under the portfolio, a link under the LinkedIn, a clip
   under the presentation. Nothing is summarised, nothing is rewritten, nothing
   is thrown away, and the item it serves moves to MATERIAL IN because material
   arrived — never because anyone remembered that it probably had.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  var LOGGABLE = ["cv", "linkedin", "headshot", "portfolio", "phonics", "present", "apps", "interview", "umbrella", "presence", "work"];

  function markItem(rec, item, at) {
    rec.owed = rec.owed || {};
    var cur = rec.owed[item] || { state: "not_started" };
    var order = ["not_started", "waiting", "received", "building", "done"];
    var now = order.indexOf(cur.state) < order.indexOf("received") ? "received" : cur.state;
    rec.owed[item] = { state: now, at: at || new Date().toISOString(), note: cur.note || "" };
    return { before: cur.state, after: now };
  }

  function inboxMarkdown(rec) {
    var byItem = {};
    (rec.inbox || []).slice().reverse().forEach(function (x) { (byItem[x.item] = byItem[x.item] || []).push(x); });
    var out = ["# THE INBOX \u2014 " + (rec.name || rec.id), "",
      "Everything received, verbatim, newest first. Nothing here was summarised.",
      "Written " + new Date().toISOString().slice(0, 16).replace("T", " ") + " \u00b7 " + (rec.inbox || []).length + " item(s).", ""];
    Object.keys(byItem).forEach(function (item) {
      var it = M.BY_ID[item];
      out.push("## " + (it ? it.title : item) + " \u2014 under `" + item + "`", "");
      byItem[item].forEach(function (x) {
        out.push("- **" + x.label + "** (" + x.kind + ", " + String(x.at).slice(0, 16).replace("T", " ") + ")");
        out.push("");
        out.push("      " + String(x.value).replace(/\n/g, "\n      "));
        out.push("");
      });
    });
    return out.join("\n");
  }

  K.shell({
    name: "THE PORTFOLIO",
    what: "rec 1 \u00b7 rec 2 \u2014 everything they have ever made, sent once, kept verbatim, filed against the promise it serves",
    panel: function (rec, h) {
      var item = M.BY_ID.portfolio;
      var inbox = rec.inbox || [];
      var byItem = {};
      inbox.forEach(function (x) { byItem[x.item] = (byItem[x.item] || 0) + 1; });

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("the tutor's reason", "\u201cit just gains dust and just sits there\u201d",
                "the asset already exists; the intake is what stops it decaying unused")
        + K.row("received", inbox.length + " thing(s)" + (inbox.length ? " \u00b7 in " + Object.keys(byItem).length + " of the promises" : ""),
                "kept verbatim, forever \u2014 this inbox is the raw record, not a summary of it"));

      /* --- the bin ---------------------------------------------------------- */
      var picker = '<select class="ok-select" id="pfItem">'
        + LOGGABLE.map(function (id) { return '<option value="' + id + '">' + esc(M.BY_ID[id] ? M.BY_ID[id].title : id) + "</option>"; }).join("")
        + '<option value="auto">\u2014 file it automatically (guess from the words) \u2014</option></select>';
      var bin = K.card("what arrived",
        '<textarea class="ok-textarea" id="pfWhat" style="min-height:120px" placeholder="paste it whole \u2014 the link, the file name, what they said about it, the text of the PDF. Every word is kept."></textarea>'
        + '<div class="ok-bar" style="margin-top:8px">'
        + '<input class="ok-input" style="flex:1 1 200px" id="pfLabel" placeholder="a label (optional \u2014 \u201cthe magazine\u201d, \u201cportfolio link\u201d)">'
        + picker
        + '<button class="ok-btn gold" data-act="file">file it</button></div>'
        + K.note("It is kept VERBATIM (L38). Filing guesses the promise from the words when you leave it on auto \u2014 the guess is shown after, and the material is never altered by it.", ""));

      /* --- the promises, and what each one has actually received ------------ */
      var promiseCard = K.card("the promises, and what has arrived",
        '<table class="ok-t"><tr><th>promise</th><th>owner</th><th>received</th><th>the tape</th></tr>'
        + M.ITEMS.filter(function (it) { return LOGGABLE.indexOf(it.id) >= 0; }).map(function (it) {
          var n = byItem[it.id] || 0;
          var st = (rec.owed || {})[it.id];
          return '<tr><td><b>' + esc(it.title) + "</b></td><td>" + esc(it.who === "station" ? "we owe it" : "they owe it") + "</td>"
            + '<td class="n" style="color:' + (n ? "var(--cyan)" : "var(--muted)") + '">' + (n ? n + " \u00b7 " + esc(st ? st.state : "received") : "\u2014") + "</td>"
            + '<td style="opacity:.7">' + esc(it.ev) + "</td></tr>";
        }).join("") + "</table>");

      /* --- the inbox -------------------------------------------------------- */
      var grouped = Object.keys(byItem).sort(function (a, b) { return byItem[b] - byItem[a]; });
      var box = grouped.length
        ? grouped.map(function (it) {
            var rows = inbox.filter(function (x) { return x.item === it; }).slice().reverse();
            return '<h3>' + esc(M.BY_ID[it] ? M.BY_ID[it].title : it) + " \u2014 " + rows.length + "</h3>"
              + rows.map(function (x, i) {
                  return '<div class="ok-row"><b>' + esc(K.day(x.at)) + "</b><span class=\"ok-v\">"
                    + "<b>" + esc(x.label) + "</b> " + K.chip(x.kind, "var(--muted)")
                    + '<div class="ok-mono" style="white-space:pre-wrap;word-break:break-word;margin-top:3px">' + esc(String(x.value).slice(0, 1200)) + "</div>"
                    + '<div class="ok-bar" style="margin-top:6px"><button class="ok-btn ghost" data-copy="' + esc(String(x.value)) + '" data-copy-label="the entry">copy verbatim</button>'
                    + '<button class="ok-btn ghost" data-drop="' + esc(it) + '|' + esc(String(x.at)) + '">withdraw</button></div>'
                    + "</span></div>";
                }).join("");
          }).join("")
        : K.note("nothing has arrived yet. The first thing sent is the one worth the most: it is already made.", "warn");
      var inboxCard = K.card("the inbox \u2014 verbatim, newest first", box
        + '<div class="ok-bar" style="margin-top:10px"><button class="ok-btn" data-act="md">download the inbox (markdown)</button>'
        + '<button class="ok-btn ghost" data-act="reo">run the filing again</button></div>',
        "L38 \u00b7 the raw thing is kept before anything is derived from it, and it is kept forever. A withdrawal is recorded, not silent.");

      return head + bin + promiseCard + inboxCard;
    },
    after: function (rec, panel, h) {
      Array.prototype.forEach.call(panel.querySelectorAll("[data-drop]"), function (b) {
        b.onclick = async function () {
          var parts = b.getAttribute("data-drop").split("|");
          var item = parts[0], at = parts[1];
          var i = (rec.inbox || []).findIndex(function (x) { return x.item === item && String(x.at) === at; });
          if (i < 0) return;
          var gone = rec.inbox.splice(i, 1)[0];
          rec.withdrawn = rec.withdrawn || [];
          rec.withdrawn.push({ at: new Date().toISOString(), entry: gone });
          K.logLine(rec, "withdrew from " + item + ": " + (gone.label || ""));
          await K.save(rec); h.render(); K.toast("withdrawn \u2014 kept in the record's withdrawn list, not deleted");
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "file") {
            var what = ((panel.querySelector("#pfWhat") || {}).value || "").trim();
            if (!what) { K.toast("nothing to file"); return; }
            var label = ((panel.querySelector("#pfLabel") || {}).value || "").trim();
            var picked = (panel.querySelector("#pfItem") || {}).value || "auto";
            var itemId = picked === "auto" ? M.matchItem(label ? label + " " + what : what) : picked;
            var e = K.inbox(rec, itemId, label || undefined, what);
            var mv = markItem(rec, itemId, e.at);
            await K.save(rec);
            h.render();
            K.toast("filed under " + (M.BY_ID[itemId] ? M.BY_ID[itemId].title : itemId)
              + (picked === "auto" ? " (guessed from the words)" : "") + " \u00b7 " + mv.before + " \u2192 " + mv.after);
            return;
          }
          if (act === "md") { K.download(K.slug(rec.name) + "-inbox.md", inboxMarkdown(rec), "text/markdown"); return; }
          if (act === "reo") {
            var moved = 0;
            (rec.inbox || []).forEach(function (x) {
              if (x.item) return;
              var g = M.matchItem(x.label + " " + x.value);
              x.item = g; moved++;
            });
            await K.save(rec); h.render();
            K.toast(moved ? "re-filed " + moved + " entry(s)" : "every entry already carries its promise");
            return;
          }
        };
      });
    }
  });

  window.ObiRole = { slug: "portfolio-intake", name: "THE PORTFOLIO",
    markdown: inboxMarkdown, match: M.matchItem };
})();
