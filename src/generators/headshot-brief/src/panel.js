/* ============================================================================
   THE HEADSHOT — src/generators/headshot-brief/src/panel.js

   The tape settles this one out loud, wardrobe included:

      "we're back with suit… and then a little color tie… or do you want to just
       be a little bit more semi-casual and just have like a black suit…?
       … So that covers the selfie portion."

   One photo, used for the CV, the LinkedIn, Facebook and WhatsApp. This role is
   the BRIEF: what to wear (in the tutor's own words), the room, the shot list,
   the pick, and the crops each platform actually needs — then it records the
   chosen file, so every other role wears the same face.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  var WARDROBE = [
    "a suit and a white shirt \u2014 the tape's first answer",
    "or a black suit and a white shirt",
    "a coloured tie is optional \u2014 his own example was \u201ca little color tie\u201d",
    "semi-casual is allowed \u2014 but the shirt is IRONED and the collar is straight",
    "no logo, no slogan, no pattern that shimmers"
  ];
  var ROOM = [
    "a plain wall, near a window \u2014 daylight, no flash, no ceiling light",
    "stand a metre from the wall so it does not cast a shadow behind the head",
    "the phone at EYE LEVEL (not below the chin), held by someone else or propped",
    "portrait, highest resolution the phone has, no filter, no beauty mode",
    "chest up and slightly wide, so there is room to crop both ways"
  ];
  var SHOTS = [
    "straight to the lens, neutral face",
    "straight to the lens, light smile",
    "a quarter turn to the left, eyes back to the lens",
    "a quarter turn to the right, eyes back to the lens",
    "chin slightly down \u00b7 chin slightly up",
    "arms folded \u00b7 hands out of frame",
    "shirt collar buttoned \u00b7 open one button",
    "tie on \u00b7 tie off",
    "and the rest, until there are TWENTY"
  ];
  var CROPS = [
    ["LinkedIn profile photo", "400 \u00d7 400", "head and shoulders, eyes about a third down from the top"],
    ["CV / passport-ish", "35 \u00d7 45 mm", "head from chin to crown, a little air above the head"],
    ["Facebook profile", "1080 \u00d7 1080", "the same square, larger"],
    ["WhatsApp / Zalo avatar", "square", "the head reads at 40 px \u2014 crop tighter than feels comfortable"],
    ["Email + any application form", "the original", "keep the uncropped frame; forms ask for odd ratios"]
  ];

  K.shell({
    name: "THE HEADSHOT",
    what: "rec 3 \u2014 the wardrobe, decided on mic \u00b7 one photo, every surface",
    panel: function (rec, h) {
      var item = M.BY_ID.headshot;
      var photo = K.val(rec, "photo");
      var hs = rec.headshot || (rec.headshot = { picked: "", notes: "", done: {} });
      hs.done = hs.done || {};

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("status", photo ? K.chip("ON THE RECORD", "var(--ok)") + " " + esc(String(photo).slice(0, 70)) : K.chip("WAITING ON THEM", "var(--warn)"),
                photo ? "" : "the shoot has not happened")
        + K.row("what it is for", "one photo, four surfaces",
                "the CV, the LinkedIn, Facebook and the global number \u2014 the same file on all of them"));

      var brief = K.card("the brief",
        '<div class="ok-grid">'
        + "<div><h3>what to wear \u2014 the tutor\u2019s answer, on tape</h3>" + K.ul(WARDROBE) + "</div>"
        + '<div><h3>the room and the camera</h3>' + K.ul(ROOM) + "</div>"
        + "</div>"
        + "<h3>the shot list \u2014 shoot twenty, pick one</h3>"
        + K.ul(SHOTS.map(function (s, i) { return '<label class="ok-check"><input type="checkbox" data-shot="' + i + '"' + (hs.done["shot" + i] ? " checked" : "") + "><span>" + esc(s) + "</span></label>"; }))
        + K.note("Twenty is the point: nobody's twenty-first try is worse than their first, and the good frame is usually around 14.", ""));

      var cropTable = '<table class="ok-t"><tr><th>surface</th><th>size</th><th>crop</th></tr>'
        + CROPS.map(function (c) { return '<tr><td class="n">' + esc(c[0]) + '</td><td class="n">' + esc(c[1]) + "</td><td>" + esc(c[2]) + "</td></tr>"; }).join("") + "</table>";
      var cropCard = K.card("the crops each surface needs", cropTable
        + K.note("Do the crops from the ORIGINAL every time. Re-cropping a crop is how a face goes soft.", ""));

      var fileCard = K.card("the chosen file",
        K.row("the record's photo row", photo ? esc(String(photo)) : K.blankRule("nothing supplied \u2014 and nothing is invented"),
              "whatever is in the record is what the CV, the LinkedIn and the presence roles will use")
        + '<div class="ok-sec ok-bar">'
        + '<input class="ok-input" style="flex:1 1 300px" id="hsFile" placeholder="the file name or the URL of the one you picked">'
        + '<button class="ok-btn gold" data-act="set">put it on the record</button></div>'
        + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn ghost" data-act="print">print the shoot card</button></div>'
        + K.note("Print the shoot card, stick it on the wall, and the shoot is ten minutes \u2014 not a conversation.", ""));

      return head + brief + cropCard + fileCard;
    },
    after: function (rec, panel, h) {
      var hs = rec.headshot || (rec.headshot = { done: {} });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-shot]"), function (cb) {
        cb.onchange = async function () { hs.done["shot" + cb.getAttribute("data-shot")] = cb.checked; await K.save(rec); };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "set") {
            var v = ((panel.querySelector("#hsFile") || {}).value || "").trim();
            if (!v) { K.toast("nothing to record"); return; }
            K.setField(rec, "photo", "Headshot", v, "supplied in THE HEADSHOT");
            await K.save(rec); h.render(); K.toast("on the record \u2014 every role wears it now"); return;
          }
          if (act === "print") {
            var html = K.printSheet(rec.name + " \u2014 the shoot card",
              "<header><h1>The headshot</h1><div class=\"hl\">shoot twenty, pick one \u00b7 " + esc(rec.name) + "</div>"
              + '<div class="ct">the file: ' + (K.val(rec, "photo") ? esc(K.val(rec, "photo")) : '<span class="rule">not picked yet</span>') + "</div></header>"
              + "<section><h2>wear</h2>" + (function () { return "<ul>" + WARDROBE.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; })() + "</section>"
              + "<section><h2>room and camera</h2><ul>" + ROOM.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>"
              + "<section><h2>the shot list</h2><ul>" + SHOTS.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>"
              + "<section><h2>crops</h2><table><tr><th>surface</th><th>size</th><th>crop</th></tr>"
              + CROPS.map(function (c) { return "<tr><td>" + esc(c[0]) + "</td><td>" + esc(c[1]) + "</td><td>" + esc(c[2]) + "</td></tr>"; }).join("") + "</table></section>"
              + "<footer>the tutor's own verdict on the wardrobe is quoted above; nothing here was invented.</footer>");
            K.download(K.slug(rec.name) + "-shoot-card.html", html);
            K.toast("downloaded \u2014 print it and shoot"); return;
          }
        };
      });
    }
  });

  window.ObiRole = { slug: "headshot-brief", name: "THE HEADSHOT",
    brief: { wardrobe: WARDROBE, room: ROOM, shots: SHOTS, crops: CROPS } };
})();
