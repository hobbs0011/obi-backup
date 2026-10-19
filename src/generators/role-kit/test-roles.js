/* ============================================================================
   THE FAMILY'S OWN TEST — src/generators/role-kit/test-roles.js

   WHAT IT DOES. Opens every role's generated `index.html` side by side in
   sandboxed frames, waits for it to boot, and checks the things that actually
   break a role: the kit loaded, the shell mounted, the panel rendered against a
   record, the role's public surface exists, and — the one that matters — the
   frame threw nothing.

   It seeds SYNTHETIC records first (a fictional student with real-shaped rows),
   so it never touches anyone's real data, and it cleans up after itself.

   HOW TO RUN IT. Any page served from this workspace can host it:

       <script src="src/generators/role-kit/test-roles.js"></script>

   or paste the file's contents into a perchance generator's chat / console.
   The same checks are what a new agent should run after editing kit.js,
   method.js or any role's panel.js — a role that will not boot is worse than a
   role that does not exist.
   ========================================================================== */
(async function () {
  "use strict";
  if (window.__roleTestsRunning) return;
  window.__roleTestsRunning = true;

  var ROLES = [
    ["cv-forge", "THE CV"], ["linkedin-forge", "THE LINKEDIN"], ["headshot-brief", "THE HEADSHOT"],
    ["portfolio-intake", "THE PORTFOLIO"], ["phonics-44", "THE 44"], ["presentation-coach", "THE WEEKLY PRESENTATION"],
    ["application-board", "THE APPLICATIONS"], ["interview-drill", "THE INTERVIEW"], ["umbrella-brand", "THE UMBRELLA"],
    ["presence-plan", "THE PRESENCE"], ["work-credit", "THE CREDIT"], ["idea-lists", "THE LISTS"]
  ];
  var BASE = location.origin + "/src/generators/";

  /* --- a SYNTHETIC student. Not a real person, and not one of the brothers. --- */
  var rec = {
    v: "intake/1", id: "kit-test-student", name: "Test Student", spelling: "T-E-S-T", role: "student",
    tutor: "the tutor", evidenceSet: ["a synthetic record made by the kit's own test"], note: "", at: new Date().toISOString(),
    owed: { phonics: { state: "received", at: new Date().toISOString() }, present: { state: "waiting", at: null } },
    inbox: [
      { at: new Date().toISOString(), kind: "link", label: "the magazine", value: "https://example.com/magazine.pdf", item: "portfolio" },
      { at: new Date().toISOString(), kind: "text", label: "what he said about it", value: "I reworked it because I had to study that class again.", item: "portfolio" }
    ],
    log: [],
    fields: [
      { k: "name", label: "Name", value: "Test Student", ev: "synthetic", state: "stated" },
      { k: "headline", label: "Headline", value: "Designer \u2014 looking for a first role on a product team", ev: "synthetic", state: "stated" },
      { k: "phone", label: "Phone", value: "+84 000 000 000", ev: "synthetic", state: "stated" },
      { k: "email", label: "Email", value: "test@example.com", ev: "synthetic", state: "stated" },
      { k: "city", label: "City", value: "Hanoi \u00b7 open to remote", ev: "synthetic", state: "stated" },
      { k: "links", label: "Links", value: "https://example.com/portfolio", ev: "synthetic", state: "stated" },
      { k: "summary", label: "Summary", value: "I build things and then rebuild them smaller. I want a team that ships.", ev: "synthetic", state: "stated" },
      { k: "school", label: "School", value: "Four years of schooling", ev: "synthetic", state: "stated" },
      { k: "degree", label: "Degree", value: "Communications and Media", ev: "synthetic", state: "stated" },
      { k: "dates", label: "Dates", value: "2022 \u2192 2026", ev: "synthetic", state: "stated" },
      { k: "gpa", label: "Result / GPA", value: "5 or 6 out of 10", ev: "synthetic", state: "stated" },
      { k: "experience", label: "Experience", value: "School magazine redesign \u2014 layout and art direction\n3D modelling \u2014 hundreds of models, ~100 kept", ev: "synthetic", state: "stated" },
      { k: "skills", label: "Skills", value: "Blender\nFigma\nRoblox Studio", ev: "synthetic", state: "stated" },
      { k: "languages", label: "Languages", value: "Vietnamese \u2014 native\nEnglish \u2014 intermediate", ev: "synthetic", state: "stated" },
      { k: "photo", label: "Headshot", value: "headshot-01.jpg", ev: "synthetic", state: "stated" },
      { k: "present_topic", label: "Presentation topic", value: "How I would improve a game I play", ev: "synthetic", state: "stated" },
      { k: "conn_now", label: "Connections now", value: "40", ev: "synthetic", state: "stated" },
      { k: "umbrella", label: "Umbrella", value: "", ev: "synthetic", state: "stated" },
      { k: "certificate", label: "Certificate", value: "3D modelling online course (name not supplied)", ev: "synthetic", state: "stated" },
      { k: "guess_degree", label: "Degree (machine guess)", value: "Ravi design", ev: "the machine guessed this", state: "unresolved" }
    ]
  };

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
    if (!HAVE_PREV) { try { PREV_LAST = localStorage.getItem("ok:last"); } catch (e) {} HAVE_PREV = true; }
    var a = await put(rec.id, rec);
    var b = await put("zz-test-bare", { v: "intake/1", id: "zz-test-bare", name: "Bare Record", fields: [], inbox: [], owed: {}, log: [] });
    try { localStorage.setItem("ok:last", rec.id); } catch (e) {}
    return a && b ? a : false;
  }
  async function clean() {
    await del("kit-test-student");
    await del("zz-test-bare");
    try { if (PREV_LAST == null) localStorage.removeItem("ok:last"); else localStorage.setItem("ok:last", PREV_LAST); } catch (e) {}
  }

  var host = document.getElementById("roleTests");
  if (!host) {
    host = document.createElement("div");
    host.id = "roleTests";
    host.style.cssText = "text-align:left;background:#0f0f1a;color:#e9e6f2;padding:14px;font:14px/1.5 system-ui,sans-serif";
    document.body.appendChild(host);
  }
  host.innerHTML = '<h2 style="font:700 16px system-ui;margin:0 0 6px">the family \u2014 booting every role</h2>'
    + '<div id="roleRows" style="font-family:ui-monospace,monospace;font-size:13px">starting\u2026</div>'
    + '<div id="roleFrames" style="position:absolute;left:-99999px;top:0"></div>';

  var frames = document.getElementById("roleFrames");
  var results = [];
  var seeded = await seed();

  function line(r) {
    var rows = document.getElementById("roleRows");
    rows.innerHTML = results.map(function (x) {
      return '<div style="padding:3px 0;border-top:1px solid rgba(168,85,247,.15)">'
        + '<span style="color:' + (x.ok ? "#50dc82" : "#e0473f") + '">' + (x.ok ? "\u2713" : "\u2717") + "</span> "
        + x.slug.padEnd(20) + ' <span style="opacity:.7">' + (x.note || "") + "</span></div>";
    }).join("") + '<div style="margin-top:8px">' + (results.filter(function (x) { return x.ok; }).length + " / " + results.length + " roles boot clean")
      + (seeded ? "" : " \u00b7 WARNING: localStorage is unavailable, the seeds did not take") + "</div>";
  }

  for (var i = 0; i < ROLES.length; i++) {
    var slug = ROLES[i][0], name = ROLES[i][1];
    var res = { slug: slug, ok: false, note: "" };
    results.push(res);
    try {
      var txt = await (await fetch(BASE + slug + "/index.html", { cache: "no-store" })).text();
      if (!txt || txt.length < 2000) { res.note = "index.html is missing or tiny (" + (txt || "").length + " B) \u2014 run role-kit/build.js"; line(); continue; }
      var f = document.createElement("iframe");
      f.style.cssText = "width:1000px;height:700px;border:1px solid #333;background:#0f0f1a";
      f.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><scr' + 'ipt>'
        + 'window.__errs=[];window.addEventListener("error",function(e){__errs.push(String(e.message))});'
        + 'window.addEventListener("unhandledrejection",function(e){__errs.push("rejection: "+String(e.reason&&e.reason.message||e.reason))});'
        + '</scr' + 'ipt></head><body>' + txt + "</body></html>";
      frames.appendChild(f);
      var w = f.contentWindow, d = null, ok = false;
      for (var k = 0; k < 60; k++) {
        await new Promise(function (r) { setTimeout(r, 150); });
        d = f.contentDocument;
        if (d && d.querySelector(".ok-head") && d.querySelector("#okPanel") && d.querySelector("#okPanel").children.length) { ok = true; break; }
      }
      if (!ok) {
        var be = (w && w.__errs) || [];
        res.note = "never booted the shell" + (be.length ? " \u2014 it threw: " + String(be[0]).slice(0, 110) : "");
        line(); continue;
      }
      var title = (d.querySelector(".ok-title") || {}).textContent || "";
      var panelText = (d.getElementById("okPanel").innerText || "").trim();
      var roleObj = w.ObiRole;
      var picker = d.getElementById("okWho") ? d.getElementById("okWho").value : "";
      var errs = w.__errs || [];
      var problems = [];
      if (title.indexOf(name) !== 0) problems.push("title reads \u201c" + title.slice(0, 30) + "\u201d");
      if (panelText.length < 200) problems.push("panel barely rendered (" + panelText.length + " chars)");
      if (!roleObj || roleObj.slug !== slug) problems.push("no window.ObiRole surface");
      if (!picker) problems.push("the record picker found no record");
      if (errs.length) problems.push("threw: " + errs[0].slice(0, 90));
      res.ok = problems.length === 0;
      res.note = problems.length ? problems.join(" \u00b7 ") : (Math.round(panelText.length / 10) / 100) + "k chars rendered \u00b7 record \u201c" + picker + "\u201d";
    } catch (e) {
      res.note = "test itself failed: " + String(e && e.message || e).slice(0, 90);
    }
    line();
  }

  window.__roleTests = results;
  window.__roleTestsRunning = false;
  setTimeout(clean, 2000);
})();
