/* ============================================================================
   THE FAMILY'S BEHAVIOURAL TEST — src/generators/role-kit/test-actions.js

   test-roles.js proves every role BOOTS. This proves every role DOES SOMETHING:
   it drives the real controls in each role's page and then reads the RECORD back
   — so a handler that renders beautifully and saves nothing fails here.

   Run it the same way:

       <script src="src/generators/role-kit/test-actions.js"></script>

   It seeds a synthetic student, drives the roles, asserts on the store, cleans up
   after itself, and prints PASS/FAIL per role.
   ========================================================================== */
(async function () {
  "use strict";
  if (window.__actionTestsRunning) return;
  window.__actionTestsRunning = true;

  var ROLES = ["cv-forge", "linkedin-forge", "headshot-brief", "portfolio-intake", "phonics-44", "presentation-coach",
    "application-board", "interview-drill", "umbrella-brand", "presence-plan", "work-credit", "idea-lists"];
  var BASE = location.origin + "/src/generators/";
  var ID = "action-test-student";

  /* THE STORE A BARE ROLE READS. Opened as its own page — no perchance
     kv-plugin inlined, no family bridge — the kit falls back to localStorage,
     so the harness must write THERE, in the same key space the role reads. It
     never touches the station's kv folder, so a run inside the station cannot
     leave a synthetic student in anyone's real records. */
  var PREV_LAST, HAVE_PREV = false;
  async function put(id, rec) {
    try { localStorage.setItem("ok:rec:" + id, JSON.stringify(rec)); return "localStorage"; } catch (e) { return null; }
  }
  async function del(id) {
    try { localStorage.removeItem("ok:rec:" + id); return "localStorage"; } catch (e) { return null; }
  }

  async function seed() {
    var rec = {
      v: "intake/1", id: ID, name: "Action Test", spelling: "A-C-T", role: "student", tutor: "the tutor",
      evidenceSet: [], note: "", owed: {}, log: [], at: new Date().toISOString(),
      inbox: [
        { at: "2026-09-23T10:00:00.000Z", kind: "link", label: "the magazine", value: "https://example.com/magazine.pdf", item: "portfolio" },
        { at: "2026-09-23T10:05:00.000Z", kind: "text", label: "what he said", value: "I reworked it because I had to study that class again.", item: "portfolio" }
      ],
      fields: [
        { k: "name", label: "Name", value: "Action Test", ev: "synthetic", state: "stated" },
        { k: "headline", label: "Headline", value: "Designer, looking for a first role", ev: "synthetic", state: "stated" },
        { k: "phone", label: "Phone", value: "+84 000", ev: "synthetic", state: "stated" },
        { k: "links", label: "Links", value: "https://example.com/portfolio", ev: "synthetic", state: "stated" },
        { k: "guess_degree", label: "Degree (guess)", value: "Ravi design", ev: "the machine guessed this", state: "unresolved" }
      ]
    };
    if (!HAVE_PREV) { try { PREV_LAST = localStorage.getItem("ok:last"); } catch (e) {} HAVE_PREV = true; }
    var where = await put(ID, rec);
    try { localStorage.setItem("ok:last", ID); } catch (e) {}
    return where || false;
  }
  async function clean() {
    await del(ID);
    try { if (PREV_LAST == null) localStorage.removeItem("ok:last"); else localStorage.setItem("ok:last", PREV_LAST); } catch (e) {}
  }

  async function open(slug) {
    var txt = await (await fetch(BASE + slug + "/index.html", { cache: "no-store" })).text();
    var f = document.createElement("iframe");
    f.style.cssText = "position:absolute;left:-99999px;width:1000px;height:800px";
    f.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><scr' + 'ipt>window.__errs=[];'
      + 'window.addEventListener("error",function(e){__errs.push(String(e.message))});'
      + 'window.addEventListener("unhandledrejection",function(e){__errs.push("rejection: "+String(e.reason&&e.reason.message||e.reason))});'
      + '</scr' + 'ipt></head><body>' + txt + "</body></html>";
    document.body.appendChild(f);
    for (var i = 0; i < 60; i++) {
      await new Promise(function (r) { setTimeout(r, 150); });
      if (f.contentDocument && f.contentDocument.querySelector("#okPanel") && f.contentDocument.querySelector("#okPanel").children.length) break;
    }
    await new Promise(function (r) { setTimeout(r, 250); });
    return f;
  }
  var click = function (d, sel) { var el = d.querySelector(sel); if (el) { try { el.click(); } catch (e) {} } return !!el; };
  var set = function (d, sel, v) { var el = d.querySelector(sel); if (!el) return false; el.value = v; return true; };
  var tick = function (d, sel, on) { var el = d.querySelector(sel); if (!el) return false; if (el.checked !== on) { el.checked = on; el.onchange && el.onchange(); } return true; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 300); }); };

  /* One function per role: drive the real controls, then read the record back. */
  var DRIVE = {
    "cv-forge": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      set(d, '[data-cv="summary"]', "Synthetic summary written by the test.");
      click(d, '[data-act="save"]');
      await wait(500);
      var rec = await K.get(ID);
      var got = K.val(rec, "summary");
      var sheet = f.contentWindow.ObiRole.sheet(rec);
      var leaks = sheet.indexOf("Ravi design") >= 0;
      return [["the form wrote the record", got === "Synthetic summary written by the test."],
              ["the CV sheet carries it", sheet.indexOf("Synthetic summary") > 0],
              ["the unresolved degree did NOT reach the paper", !leaks]];
    },
    "linkedin-forge": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      tick(d, '[data-step="clean_name"]', true);
      await wait(400);
      set(d, "#liN", "12"); set(d, "#liWho", "three studios");
      click(d, '[data-act="log"]');
      await wait(500);
      var rec = await K.get(ID);
      var li = rec.li || {};
      var profile = f.contentWindow.ObiRole.profile(rec);
      return [["the checklist step was kept", li.steps && li.steps.clean_name === true],
              ["the connection log took the number", (li.conns || []).length === 1 && li.conns[0].n === 12],
              ["the profile is composed from the record", profile.indexOf("Designer, looking for a first role") > 0]];
    },
    "headshot-brief": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      set(d, "#hsFile", "headshot-01.jpg");
      click(d, '[data-act="set"]');
      await wait(500);
      var rec = await K.get(ID);
      return [["the chosen file landed on the record's photo row", K.val(rec, "photo") === "headshot-01.jpg"]];
    },
    "portfolio-intake": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      set(d, "#pfWhat", "A link to a video edit I did: https://example.com/edit");
      set(d, "#pfLabel", "the video edit");
      click(d, '[data-act="file"]');
      await wait(500);
      var rec = await K.get(ID);
      var entry = (rec.inbox || []).filter(function (x) { return x.label === "the video edit"; })[0];
      var md = f.contentWindow.ObiRole.markdown(rec);
      return [["the thing arrived and was kept VERBATIM", !!entry && entry.value.indexOf("https://example.com/edit") >= 0],
              ["it was filed against a promise", !!entry && !!entry.item],
              ["the markdown export carries it", md.indexOf("the video edit") > 0]];
    },
    "phonics-44": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      click(d, '[data-mark="/th/ (voiceless)|drill"]');
      await wait(500);
      var rec = await K.get(ID);
      var marks = (rec.phonics || {}).marks || {};
      var drill = f.contentWindow.ObiRole.drill(rec);
      var sheet = f.contentWindow.ObiRole.sheet(rec);
      return [["a sound was marked", marks["/th/ (voiceless)"] && marks["/th/ (voiceless)"].state === "drill"],
              ["it appears on the drill list", drill.indexOf("/th/ (voiceless)") >= 0],
              ["the printed sheet names it", sheet.indexOf("DR") > 0 && sheet.indexOf("voiceless") > 0]];
    },
    "presentation-coach": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      set(d, "#pcTopic", "How I would improve a game I play");
      click(d, '[data-act="settopic"]');
      await wait(400);
      set(d, "#pcMins", "17"); set(d, "#pcLink", "recording-01.mp4");
      click(d, '[data-act="logrun"]');
      await wait(500);
      var d2 = f.contentDocument;
      click(d2, '[data-score="Content|4"]');
      await wait(400);
      set(f.contentDocument, "#pcCorr", "Slow the middle section down.");
      click(f.contentDocument, '[data-act="savecorr"]');
      await wait(500);
      var rec = await K.get(ID);
      var p = rec.present || {};
      var run = (p.runs || [])[p.runs.length - 1] || {};
      return [["the topic was set on the record", K.val(rec, "present_topic").indexOf("improve a game") >= 0],
              ["the run was logged with its minutes", run.mins === "17"],
              ["the reading was marked", run.scores && run.scores.Content === 4],
              ["the ONE correction was kept", run.correction === "Slow the middle section down."]];
    },
    "application-board": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      set(d, "#apCo", "Studio X"); set(d, "#apRole", "Junior UI Designer"); set(d, "#apMins", "35");
      set(d, "#apAsked", "What is your blood type?\nWhat was your college score?");
      click(d, '[data-act="log"]');
      await wait(500);
      var rec = await K.get(ID);
      return [["the application is on the board", (rec.apps || []).length === 1 && rec.apps[0].company === "Studio X"],
              ["its minutes were kept", rec.apps[0].mins === "35"],
              ["what it asked was kept", String(rec.apps[0].asked).indexOf("blood type") >= 0],
              ["the weekly count moved", f.contentWindow.ObiRole.week(rec) === 1]];
    },
    "interview-drill": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      tick(d, "[data-ready]", true);
      await wait(400);
      set(f.contentDocument, "#ivBroke", "salary \u00b7 why this company");
      set(f.contentDocument, "#ivNote", "rewrite both, run again");
      click(f.contentDocument, '[data-act="logrun"]');
      await wait(500);
      var rec = await K.get(ID);
      var iv = rec.interview || {};
      return [["a question was marked rehearsed", Object.keys(iv.ready || {}).length === 1],
              ["the run was held", (iv.runs || []).length === 1],
              ["the three that broke were kept", (iv.runs[0].broke || []).length === 2]];
    },
    "umbrella-brand": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      set(d, "#umName", "Action Studio"); set(d, "#umLine", "Design, 3D and video");
      click(d, '[data-act="setname"]');
      await wait(500);
      var rec = await K.get(ID);
      var pieces = f.contentWindow.ObiRole.pieces(rec);
      var page = f.contentWindow.ObiRole.page(rec);
      return [["the umbrella is on the record", K.val(rec, "umbrella") === "Action Studio"],
              ["the pieces come from the inbox ONLY", pieces.length === 2],
              ["the page carries a real piece", page.indexOf("the magazine") > 0],
              ["the page carries the holding line", page.indexOf("Design, 3D and video") > 0]];
    },
    "presence-plan": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      tick(d, "[data-pr]", true);
      await wait(400);
      var rec = await K.get(ID);
      return [["a presence step was ticked and kept", Object.keys((rec.presence || {}).done || {}).length === 1]];
    },
    "work-credit": async function (f) {
      var d = f.contentDocument, K = f.contentWindow.ObiKit;
      var before = f.contentWindow.ObiRole.line(await K.get(ID));
      set(d, '[data-scope="what"]', "the gotcha-box placement pass");
      set(d, '[data-scope="product"]', "Train 67");
      click(d, '[data-act="goto"]');
      await wait(300);
      var d2 = f.contentDocument;
      var noLine = f.contentWindow.ObiRole.line(await K.get(ID));
      tick(d2, "#crAllow", true);
      await wait(500);
      var rec = await K.get(ID);
      var line = f.contentWindow.ObiRole.line(rec);
      click(d2 = f.contentDocument, '[data-act="toexp"]');
      await wait(600);
      var rec2 = await K.get(ID);
      return [["no line while the gate is off", before === "" && noLine === ""],
              ["the line is written in the tutor's own form", line.indexOf("helped consult and design for Train 67") > 0],
              ["it was added to the experience row", K.val(rec2, "experience").indexOf("Train 67") >= 0],
              ["the answer is drafted from the scope", f.contentWindow.ObiRole.answer(rec2).indexOf("WHY IT IS MINE") > 0]];
    },
    "idea-lists": async function (f) {
      var d = f.contentDocument;
      var hasModel = !!(f.contentWindow.root && f.contentWindow.root.generateText);
      click(d, '[data-act="gen"]');
      await wait(900);
      var d2 = f.contentDocument;
      var txt = (d2.querySelector("#ilOut") || {}).innerText || "";
      var seeds = d2.querySelectorAll(".ok-list li").length;
      return [["the built-in seeds are on the page", seeds >= 3],
              [hasModel ? "the model answered" : "with no model it says so instead of failing", hasModel ? txt.length > 200 : (txt.indexOf("built-in seeds") >= 0 || txt.indexOf("no model") >= 0)]];
    }
  };

  var host = document.getElementById("actionTests");
  if (!host) {
    host = document.createElement("div");
    host.id = "actionTests";
    host.style.cssText = "text-align:left;background:#0f0f1a;color:#e9e6f2;padding:14px;font:14px/1.5 system-ui,sans-serif";
    document.body.appendChild(host);
  }
  host.innerHTML = '<h2 style="font:700 16px system-ui;margin:0 0 6px">the family \u2014 driving every role</h2><div id="actRows" style="font-family:ui-monospace,monospace;font-size:13px">starting\u2026</div>';
  var results = [];
  function draw() {
    document.getElementById("actRows").innerHTML = results.map(function (x) {
      var fails = (x.checks || []).filter(function (c) { return !c[1]; });
      return '<div style="padding:4px 0;border-top:1px solid rgba(168,85,247,.15)">'
        + '<span style="color:' + (x.ok ? "#50dc82" : "#e0473f") + '">' + (x.ok ? "\u2713" : "\u2717") + "</span> "
        + x.slug.padEnd(20) + '<span style="opacity:.75">' + (x.checks || []).length + " check(s)"
        + (fails.length ? " \u2014 FAILED: " + fails.map(function (c) { return c[0]; }).join(" \u00b7 ") : "")
        + (x.err ? " \u2014 threw: " + String(x.err).slice(0, 110) : "") + "</span></div>";
    }).join("") + '<div style="margin-top:8px">' + results.filter(function (x) { return x.ok; }).length + " / " + results.length
      + " roles behave · " + results.reduce(function (a, x) { return a + (x.checks || []).length; }, 0) + " checks run</div>";
  }

  var seeded = await seed();
  for (var i = 0; i < ROLES.length; i++) {
    var slug = ROLES[i], r = { slug: slug, ok: false, checks: [] };
    results.push(r);
    try {
      var f = await open(slug);
      if (!f.contentWindow.ObiRole) { r.err = "the role never exposed its surface"; draw(); continue; }
      var checks = await DRIVE[slug](f);
      r.checks = checks;
      var errs = (f.contentWindow.__errs || []);
      r.ok = checks.every(function (c) { return c[1]; }) && errs.length === 0;
      if (errs.length) r.err = errs[0];
      /* reset the record between roles so every check starts from the same state */
      try { await del(ID); await seed(); } catch (e) {}
      f.remove();
    } catch (e) { r.err = String(e && e.message || e); }
    draw();
  }
  window.__actionTests = results;
  window.__actionTestsRunning = false;
  window.__actionSeeded = seeded;
  setTimeout(clean, 3000);
})();
