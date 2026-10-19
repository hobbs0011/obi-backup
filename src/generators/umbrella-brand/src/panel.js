/* ============================================================================
   THE UMBRELLA — src/generators/umbrella-brand/src/panel.js

   The tape, and the tutor showing his own hand as the worked example:

      "I'll show you my website that I set up for myself… you can brand yourself
       under the umbrella and have like sub-… and that expands your…"
      "if you just stick with one, then you can only apply to one sort of thing"

   One holding name, everything they have made beneath it, one line each — and a
   single page that carries them, so the links can go on the CV and the LinkedIn.

   THE GATE IS THE PORTFOLIO. You cannot brand what has not been sent: the pieces
   on this page are read from the record's inbox and nowhere else. A student with
   an empty inbox gets an empty umbrella list and is told why.
   ========================================================================== */
(function () {
  "use strict";
  var K = window.ObiKit, M = window.ObiMethod;
  if (!K || !M) return;
  var esc = K.esc;

  function UM(rec) {
    if (!rec.umbrellaData || typeof rec.umbrellaData !== "object") rec.umbrellaData = { pieces: {}, piecesOrder: [] };
    var u = rec.umbrellaData;
    u.pieces = u.pieces || {}; u.piecesOrder = u.piecesOrder || [];
    return u;
  }
  function pieceKey(x) { return K.slug(String(x.label || x.value).slice(0, 40)) + "-" + String(x.at).slice(11, 19); }
  /* the pieces are the inbox, nothing else. This is the gate, enforced in code. */
  function pieces(rec) {
    var u = UM(rec);
    var got = (rec.inbox || []).filter(function (x) { return x.item === "portfolio" || x.item === "work" || x.item === "umbrella"; });
    return got.map(function (x) {
      var key = pieceKey(x);
      var custom = u.pieces[key] || {};
      return { key: key, entry: x, name: custom.name || String(x.label || "").slice(0, 60),
        line: custom.line || "", shown: custom.shown !== false, link: K.lines(x.value).filter(function (l) { return /^https?:\/\//i.test(l); })[0] || "" };
    });
  }
  function pageHtml(rec) {
    var name = K.val(rec, "umbrella") || rec.name;
    var line = K.val(rec, "umbrella_line") || "";
    var ps = pieces(rec).filter(function (p) { return p.shown; });
    var cards = ps.map(function (p) {
      return '<a class="p" href="' + esc(p.link || "#") + '" target="_blank" rel="noopener noreferrer">'
        + "<b>" + esc(p.name) + "</b>" + (p.line ? "<span>" + esc(p.line) + "</span>" : "") + "</a>";
    }).join("");
    return "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
      + "<title>" + esc(name) + "</title><style>"
      + "*{box-sizing:border-box}body{margin:0;background:#0f0f1a;color:#e9e6f2;text-align:center;"
      + "font:16px/1.6 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;padding:48px 18px 60px}"
      + "h1{font-size:30px;margin:0;letter-spacing:.3px}"
      + ".l{color:#e8c565;font-size:14px;letter-spacing:1.6px;text-transform:uppercase;margin-top:8px}"
      + ".d{max-width:46ch;margin:16px auto 30px;color:#8b94ad;font-size:14.5px}"
      + ".p{display:block;max-width:520px;margin:10px auto;padding:16px 18px;text-align:left;text-decoration:none;"
      + "color:#e9e6f2;background:linear-gradient(180deg,#151524,#1b1b2e);border:1px solid rgba(168,85,247,.25);border-radius:12px}"
      + ".p:hover{border-color:#a855f7}.p b{display:block;font-size:16px}.p span{color:#8b94ad;font-size:13.5px}"
      + ".f{margin-top:34px;color:#6a7290;font-size:12px}"
      + "</style></head><body><h1>" + esc(name) + "</h1>"
      + (line ? '<div class="l">' + esc(line) + "</div>" : "")
      + '<div class="d">Everything I have made, in one place.</div>'
      + (cards || '<div class="d">Nothing has been sent yet.</div>')
      + '<div class="f">' + esc(rec.name || "") + "</div></body></html>";
  }

  K.shell({
    name: "THE UMBRELLA",
    what: "rec 4 \u2014 one holding name, the work beneath it, and one page that carries them",
    panel: function (rec, h) {
      var u = UM(rec);
      var item = M.BY_ID.umbrella;
      var ps = pieces(rec);
      var umb = K.val(rec, "umbrella");
      var line = K.val(rec, "umbrella_line");
      var inboxN = (rec.inbox || []).filter(function (x) { return x.item === "portfolio"; }).length;

      var head = K.card("the promise this answers",
        K.row("from the tape", "\u201c" + esc(item.ev) + "\u201d")
        + K.row("why it matters", "\u201cif you just stick with one, then you can only apply to one sort of thing\u201d",
                "the tutor showed it from his own website: one holding name, every service beneath it")
        + K.row("the gate", item.gate ? esc(item.gate) : "\u2014",
                "enforced here in code: the pieces are read from the portfolio inbox, so an empty inbox cannot produce an umbrella")
        + K.row("pieces on file", ps.length + (inboxN ? " \u00b7 from " + inboxN + " portfolio entr(y/ies)" : ""),
                ps.length ? "" : "send something first \u2014 THE PORTFOLIO is the door"));

      var nameCard = K.card("the holding name",
        K.row("the umbrella", umb ? esc(umb) : K.blankRule("not named yet"),
              "one name that can hold design AND video AND consulting \u2014 a name that says one thing cannot hold three")
        + '<div class="ok-bar" style="margin-top:8px">'
        + '<input class="ok-input" style="flex:1 1 220px" id="umName" placeholder="the umbrella \u2014 e.g. their own name, or a studio name" value="' + esc(umb) + '">'
        + '<input class="ok-input" style="flex:1 1 260px" id="umLine" placeholder="the holding line \u2014 what the whole thing is for, in one line" value="' + esc(line) + '">'
        + '<button class="ok-btn gold" data-act="setname">set it</button></div>'
        + K.note("Their own name is a legitimate answer, and often the best one: it can hold anything and it cannot be wrong.", ""));

      var piecesCard = K.card("the pieces \u2014 everything actually sent",
        ps.length
          ? ps.map(function (p) {
              return '<div class="ok-row"><b>' + esc(String(p.entry.at).slice(0, 10)) + '</b><span class="ok-v">'
                + '<input class="ok-input" style="margin-bottom:5px" data-pname="' + esc(p.key) + '" value="' + esc(p.name) + '" placeholder="what to call it">'
                + '<input class="ok-input" data-pline="' + esc(p.key) + '" value="' + esc(p.line) + '" placeholder="one line \u2014 what it is, and what it shows">'
                + '<div class="ok-note">verbatim from the inbox \u00b7 ' + esc(String(p.entry.value).slice(0, 160)) + "</div>"
                + '<div class="ok-bar" style="margin-top:5px"><label class="ok-check"><input type="checkbox" data-pshow="' + esc(p.key) + '"' + (p.shown ? " checked" : "") + "><span>on the page</span></label>"
                + (p.link ? '<button class="ok-btn ghost" data-copy="' + esc(p.link) + '" data-copy-label="the link">copy the link</button>' : K.chip("no link in the entry", "var(--warn)"))
                + "</div></span></div>";
            }).join("")
          : K.note("Nothing sent yet, so there is nothing to put under the umbrella. This is the gate doing its job, not an error.", "warn"));

      var pageCard = K.card("the one page that carries them",
        K.row("the page", ps.filter(function (p) { return p.shown; }).length + " piece(s) on it",
              "one self-contained .html \u2014 no build step, opens offline, and the links on the CV and the LinkedIn point at it")
        + '<div class="ok-bar" style="margin-top:8px"><button class="ok-btn gold" data-act="open">open the page</button>'
        + '<button class="ok-btn" data-act="dl">download the .html</button>'
        + '<button class="ok-btn ghost" data-act="copyhtml">copy the .html</button></div>'
        + K.note("It says \u2018Everything I have made, in one place\u2019 and lists the pieces. Nothing it does not hold appears on it.", ""));

      return head + nameCard + piecesCard + pageCard;
    },
    after: function (rec, panel, h) {
      var u = UM(rec);
      /* the page is built from the record, so the record is synced out of the
         DOM first: a piece renamed and then exported in one movement keeps the
         new name. */
      function grab() {
        Array.prototype.forEach.call(panel.querySelectorAll("[data-pname],[data-pline],[data-pshow]"), function (el) {
          var key = el.getAttribute("data-pname") || el.getAttribute("data-pline") || el.getAttribute("data-pshow");
          u.pieces[key] = u.pieces[key] || {};
          if (el.hasAttribute("data-pname")) u.pieces[key].name = el.value;
          else if (el.hasAttribute("data-pline")) u.pieces[key].line = el.value;
          else u.pieces[key].shown = el.checked;
        });
      }
      function bind(attr, field) {
        Array.prototype.forEach.call(panel.querySelectorAll("[" + attr + "]"), function (inp) {
          inp.onchange = async function () {
            var key = inp.getAttribute(attr);
            u.pieces[key] = u.pieces[key] || {};
            u.pieces[key][field] = inp.value;
            await K.save(rec);
          };
        });
      }
      bind("data-pname", "name"); bind("data-pline", "line");
      Array.prototype.forEach.call(panel.querySelectorAll("[data-pshow]"), function (cb) {
        cb.onchange = async function () {
          var key = cb.getAttribute("data-pshow");
          u.pieces[key] = u.pieces[key] || {};
          u.pieces[key].shown = cb.checked;
          await K.save(rec);
        };
      });
      Array.prototype.forEach.call(panel.querySelectorAll("[data-act]"), function (btn) {
        btn.onclick = async function () {
          var act = btn.getAttribute("data-act");
          if (act === "setname") {
            var nv = ((panel.querySelector("#umName") || {}).value || "").trim();
            var lv = ((panel.querySelector("#umLine") || {}).value || "").trim();
            grab();
            K.setField(rec, "umbrella", "Umbrella", nv, "supplied in THE UMBRELLA");
            K.setField(rec, "umbrella_line", "Holding line", lv, "supplied in THE UMBRELLA");
            await K.save(rec); h.render(); K.toast("the umbrella is on the record"); return;
          }
          grab();
          await K.save(rec);
          if (act === "open") {
            try { window.open(URL.createObjectURL(new Blob([pageHtml(rec)], { type: "text/html" })), "_blank"); }
            catch (e) { K.toast("the browser blocked the tab \u2014 download it instead"); }
            return;
          }
          if (act === "dl") { K.download(K.slug(K.val(rec, "umbrella") || rec.name) + "-page.html", pageHtml(rec)); return; }
          if (act === "copyhtml") { K.copy(pageHtml(rec), "the page's html"); return; }
        };
      });
    }
  });

  window.ObiRole = { slug: "umbrella-brand", name: "THE UMBRELLA",
    pieces: function (rec) { return pieces(rec).map(function (p) { return { name: p.name, line: p.line, link: p.link }; }); },
    page: pageHtml };
})();
