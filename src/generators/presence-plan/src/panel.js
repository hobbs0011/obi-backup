/* ============================================================================
   THE PRESENCE — src/generators/presence-plan/src/panel.js

   The tape gives the channels, and the reason for each:

      "You only have a LinkedIn. … you don't have a Facebook? WhatsApp is the
       biggest for global."
      "a lot of business is done in Vietnam on Facebook. And believe it or not a
       lot is done on TikTok… we can automate that stuff… We just want to drive
       traffic, get eyes on you… and target recruiters."
      "just pop that link into Zalo"

   So: five fronts, what each one is FOR, and the one line that keeps it honest —
   the account is a shop window, not a personality. Nothing here invents an
   audience, and nothing posts on the student's behalf.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  var CHANNELS = [
    { id: "linkedin", name: "LinkedIn", why: "the professional front \u2014 where recruiters actually look",
      from: "rec 4 \u2014 \u201cYou only have a LinkedIn\u201d",
      steps: ["the profile is THE LINKEDIN's job \u2014 do that first", "the headshot, the same file as the CV", "turn on 'open to work' with the real roles", "connect with the recruiters on the target list"] },
    { id: "facebook", name: "Facebook", why: "where business is done in this market",
      from: "rec 4 \u2014 \u201ca lot of business is done in Vietnam on Facebook\u201d",
      steps: ["a professional name and the real photo", "one line of work in the bio", "the pinned post is the portfolio link", "the old public posts are checked, not deleted in a panic"] },
    { id: "tiktok", name: "TikTok", why: "traffic \u2014 \u201cbelieve it or not a lot is done on TikTok\u201d",
      from: "rec 4 \u2014 and the student \u2018disliked but acknowledged it as a channel\u2019",
      steps: ["name + photo matching the others", "the bio carries the one line and the link", "three pieces, posted, not a feed \u2014 the goal is eyes, not followers", "no trend-chasing, no invented persona"] },
    { id: "whatsapp", name: "WhatsApp", why: "the global channel \u2014 one number that answers",
      from: "rec 4 \u2014 \u201cWhatsApp is the biggest for global\u201d",
      steps: ["the number goes on the CV and the LinkedIn", "profile photo and name set", "a short professional 'about'", "answered within a day \u2014 a dead number is worse than none"] },
    { id: "zalo", name: "Zalo", why: "how a link is actually delivered here",
      from: "rec 4 \u2014 \u201cjust pop that link into Zalo and then that's the last thing\u201d",
      steps: ["the portfolio link inline, not as an attachment", "the CV as a PDF named properly", "the same photo"] }
  ];
  var RHYTHM = [
    ["every day", "10 connections, 5 comments on a recruiter's or a company's post", "the build is a habit, not an evening"],
    ["twice a week", "one post: a piece of work, a step finished, a lesson learned", "show the work, not the mood"],
    ["weekly", "one application batch logged in THE APPLICATIONS", "the count is the point"],
    ["never", "200 connections in one evening", "it reads as a bot and it wastes the list"]
  ];

  function PR(rec) {
    if (!rec.presence || typeof rec.presence !== "object") rec.presence = { done: {} };
    rec.presence.done = rec.presence.done || {};
    return rec.presence;
  }

  K.shell({
    name: "THE PRESENCE",
    what: "rec 4 \u2014 Facebook, TikTok, WhatsApp and Zalo: what each one is FOR, and a rhythm instead of a burst",
    panel: function (rec, h) {
      var p = PR(rec);
      var item = M.BY_ID.presence;
      var total = 0, done = 0;
      CHANNELS.forEach(function (c) { c.steps.forEach(function (s, i) { total++; if (p.done[c.id + ":" + i]) done++; }); });

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("where the business is", "Facebook, and TikTok more than anyone admits",
                "\u201cbelieve it or not a lot is done on TikTok\u201d \u2014 and the tutor's own summary of why: \u201cdrive traffic, get eyes on you, and target recruiters\u201d")
        + K.row("the global channel", "WhatsApp", "\u201cWhatsApp is the biggest for global\u201d \u2014 one number, on the CV, answered")
        + K.row("the line not to cross", "do not invent an audience",
                "the account is a shop window, not a personality \u2014 three real pieces beat thirty invented posts")
        + K.row("the fronts", done + " of " + total + " steps done", ""));

      var fronts = CHANNELS.map(function (c) {
        var cdone = c.steps.filter(function (s, i) { return p.done[c.id + ":" + i]; }).length;
        return K.card(c.name + " \u2014 " + cdone + "/" + c.steps.length + (c.id === "linkedin" && K.val(rec, "photo") ? " \u00b7 the photo is on the record" : ""),
          K.row("what it is for", esc(c.why), esc(c.from))
          + c.steps.map(function (s, i) {
            return '<div class="ok-check"><input type="checkbox" data-pr="' + c.id + ":" + i + '"' + (p.done[c.id + ":" + i] ? " checked" : "") + "><span>" + esc(s) + "</span></div>";
          }).join(""));
      }).join("");

      var rhythm = K.card("the rhythm",
        '<table class="ok-t"><tr><th>how often</th><th>what</th><th>why</th></tr>'
        + RHYTHM.map(function (r) { return '<tr><td class="n">' + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td style=\"opacity:.75\">" + esc(r[2]) + "</td></tr>"; }).join("")
        + "</table>"
        + K.note("The tutor runs the same play on himself, out loud on the tape \u2014 building his own from ~40 upward. This is a rhythm, not a campaign.", ""));

      var assets = K.card("what the fronts need from the record",
        K.row("the photo", K.val(rec, "photo") ? esc(K.val(rec, "photo")) : K.blankRule("not supplied \u2014 THE HEADSHOT produces it"),
              "the same file on all five, or it does not look like one person")
        + K.row("the one line of work", K.val(rec, "headline") ? esc(K.val(rec, "headline")) : K.blankRule("not supplied \u2014 set it in THE CV"),
              "it is the bio on every front")
        + K.row("the link every front points at", K.val(rec, "links") ? esc(K.lines(K.val(rec, "links")).join(" \u00b7 ")) : K.blankRule("not supplied"),
              "THE UMBRELLA's page is the natural target")
        + K.row("the number for WhatsApp", K.val(rec, "phone") ? esc(K.val(rec, "phone")) : K.blankRule("not supplied"),
              "\u201cthe biggest for global\u201d, so it has to be a number that answers"));

      return head + fronts + rhythm + assets;
    },
    after: function (rec, panel, h) {
      var p = PR(rec);
      Array.prototype.forEach.call(panel.querySelectorAll("[data-pr]"), function (cb) {
        cb.onchange = async function () {
          p.done[cb.getAttribute("data-pr")] = cb.checked;
          K.logLine(rec, "presence " + cb.getAttribute("data-pr") + " " + (cb.checked ? "done" : "unmarked"));
          await K.save(rec); h.render();
        };
      });
    }
  });

  window.ObiRole = { slug: "presence-plan", name: "THE PRESENCE", channels: CHANNELS, rhythm: RHYTHM };
})();
