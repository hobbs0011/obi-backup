/* ============================================================================
   NET — BOOKING, AND THE OTHER FORMS.
   The booking flow is the site's conversion goal on every page, so it is the
   most carefully built thing here: it must work on a phone in a café with one
   bar of signal, it must never lose what the visitor typed, and it must show
   its work — the quote arithmetic, the slot, and where the enquiry went.

   Order of operations on submit:
     1. validate            — and say exactly which field failed, in the field
     2. compose the lead    — one JSON object, everything in it
     3. DEVICE   write it   — and read it straight back out to prove it landed
     4. API      try it     — only if an endpoint is configured; record verdict
     5. RECEIPT  show it    — reference, lanes with their real state, handoffs
   ========================================================================== */
(function () {
  "use strict";
  var N = window.NET;
  if (!N) return;

  var GOALS = [
    "Speak without translating in my head",
    "Keep up with school English (primary)",
    "Keep up with school English (secondary)",
    "IELTS — target band",
    "Business English / meetings & presentations",
    "English + AI (the 2026 advantage)",
    "Summer intensive — break the fear",
    "Help my child start English early (1–5)",
    "Not sure yet — tell me what I need"
  ];
  var ZONES = N.CONTACT.areas.concat(["Outside the zone (online only)", "Online — anywhere"]);
  var KINDS = [
    { v: "parent", t: "A parent, booking for my child" },
    { v: "adult", t: "An adult, booking for myself" },
    { v: "company", t: "A company / school, booking for a team" },
    { v: "teacher", t: "A teacher, applying to teach for NET" }
  ];

  function pad(n) { return String(n).padStart(2, "0"); }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  function upcoming() {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < 21 && out.length < 12; i++) {
      var day = new Date(d.getTime() + i * 86400000);
      var dow = day.getDay();
      var times;
      if (dow === 0 || dow === 6) times = ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30", "18:00"];
      else times = ["17:00", "18:00", "19:00", "20:00"];
      /* today's already-past hours are not offered — an unavailable slot on a
         booking form is how a business teaches a customer not to trust it. */
      if (i === 0) {
        var nowH = new Date().getHours();
        times = times.filter(function (t) { return Number(t.slice(0, 2)) > nowH + 1; });
        if (!times.length) continue;
      }
      out.push({
        iso: iso(day),
        label: day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
        times: times
      });
    }
    return out;
  }

  function field(id, label, inner, hint, req) {
    return '<div class="field" data-field="' + id + '"><label for="' + id + '">' + label +
      (req ? ' <span class="req" aria-hidden="true">*</span>' : "") + "</label>" + inner +
      (hint ? '<div class="hint">' + hint + "</div>" : "") + '<div class="err" data-err hidden></div></div>';
  }

  function mount(host) {
    if (!host) return;
    var days = upcoming();
    var params = new URLSearchParams(location.search);
    var preLevel = params.get("level") || "";
    var preRef = params.get("ref") || "";
    /* Prefill from the pages that link here — the placement test (level +
       reference) and the pricing calculator (hours / weeks / learners). A
       handoff that loses what the visitor already entered is a wasted hour. */
    var pre = {
      hours: params.get("hours") ? Number(params.get("hours")) : 2,
      weeks: params.get("weeks") ? Number(params.get("weeks")) : 8,
      learners: params.get("learners") ? Number(params.get("learners")) : 1,
      goal: params.get("goal") || ""
    };
    if (preRef) pre.level = preLevel;

    var html =
      '<div class="grid" style="grid-template-columns:1.35fr .65fr;gap:26px;align-items:start" id="bookGrid">' +
        '<form id="bookForm" novalidate>' +
          '<div class="hud">' +
            '<div class="hudbar"><span>Step 1 — who is this for</span><span class="mono">' + N.esc(N.FREE) + "</span></div>" +
            field("kind", "I am…", '<select id="kind" name="kind">' + KINDS.map(function (k) { return '<option value="' + k.v + '">' + N.esc(k.t) + "</option>"; }).join("") + "</select>", "", true) +
            '<div class="row">' +
              field("studentName", "Student's name", '<input id="studentName" name="studentName" autocomplete="name" placeholder="e.g. Minh Anh">', "", true) +
              field("studentAge", "Student's age", '<input id="studentAge" name="studentAge" inputmode="numeric" placeholder="e.g. 9">', "Any age from 1 to 70. This changes the plan, not the price.", true) +
            "</div>" +
            field("level", "Current English level",
              '<select id="level" name="level"><option value="">I don\'t know — find out on the free diagnostic</option>' +
              ["A1", "A2", "B1", "B2", "C1", "C2"].map(function (l) { return '<option value="' + l + '"' + (preLevel === l ? " selected" : "") + ">" + l + "</option>"; }).join("") +
              '<option value="unmeasured">Measured on this site\'s placement test</option></select>',
              preLevel ? "Pre-filled from your placement test — change it if you like." : 'Not sure? Take the <a href="placement.html">8-minute placement test</a> first, or let the diagnostic find it.', false) +
            field("goal", "What is the goal?", '<select id="goal" name="goal">' + GOALS.map(function (g) { return '<option value="' + N.esc(g) + '"' + (pre.goal && g.toLowerCase().indexOf(pre.goal.toLowerCase()) > -1 ? " selected" : "") + ">" + N.esc(g) + "</option>"; }).join("") + "</select>", "", true) +
            field("zone", "Where?", '<select id="zone" name="zone">' + ZONES.map(function (z) { return '<option value="' + N.esc(z) + '">' + N.esc(z) + "</option>"; }).join("") + "</select>", "In-home within the zone; online anywhere.", true) +
          "</div>" +

          '<div class="hud" style="margin-top:18px">' +
            '<div class="hudbar"><span>Step 2 — the slot</span><span class="mono">Mon–Fri 17:00–21:00 · Sat–Sun 08:00–20:00 (ICT)</span></div>' +
            field("day", "Preferred day", '<select id="day" name="day">' + days.map(function (d) { return '<option value="' + d.iso + '">' + N.esc(d.label) + "</option>"; }).join("") + "</select>", "The next 12 teachable days. The coach confirms the exact time on the call.", true) +
            '<div class="field" data-field="time"><label>Preferred time <span class="req">*</span></label><div class="chips" id="timeChips"></div><div class="err" data-err hidden></div></div>' +
            '<div class="field"><label>Anything the coach should know</label><textarea id="notes" name="notes" placeholder="School, current books, what has been tried, what the student is afraid of…"></textarea></div>' +
          "</div>" +

          '<div class="hud" style="margin-top:18px">' +
            '<div class="hudbar"><span>Step 3 — how you want the hours shaped</span><span class="mono">this only builds the estimate</span></div>' +
            '<div class="row">' +
              field("hoursPerWeek", "Hours per week", '<select id="hoursPerWeek">' + [1, 2, 3, 4, 5, 6].map(function (h) { return "<option" + (h === pre.hours ? " selected" : "") + ">" + h + "</option>"; }).join("") + "</select>", "Two is the standard NET week.", false) +
              field("weeks", "For how many weeks", '<select id="weeks">' + [4, 8, 12, 16, 24, 36].map(function (w) { return "<option" + (w === pre.weeks ? " selected" : "") + ">" + w + "</option>"; }).join("") + "</select>", "", false) +
            "</div>" +
            field("learners", "Learners sharing the hour", '<select id="learners">' + [1, 2, 3, 4].map(function (l) { return "<option" + (l === pre.learners ? " selected" : "") + ">" + l + "</option>"; }).join("") + "</select>", "One-to-one is the published rate. Group pricing is confirmed by the coach.", false) +
          "</div>" +

          '<div class="hud" style="margin-top:18px">' +
            '<div class="hudbar"><span>Step 4 — how to reach you</span><span class="mono">nothing is stored on a server</span></div>' +
            '<div class="row">' +
              field("name", "Your name", '<input id="name" name="name" autocomplete="name" placeholder="e.g. Chi Lan">', "", true) +
              field("phone", "Phone / WhatsApp", '<input id="phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="e.g. 090 123 4567">', "Or email — at least one is needed.", true) +
            "</div>" +
            field("email", "Email", '<input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com">', "", false) +
            '<label class="check"><input type="checkbox" id="consent"><span>I understand this enquiry is stored on <b>this device</b> and is sent to the coach only through the channel I choose below. No account, no mailing list.</span></label>' +
          "</div>" +

          '<div class="btnrow" style="margin-top:20px">' +
            '<button class="btn btn-primary" type="submit" id="bookSubmit">Request the free diagnostic</button>' +
            '<button class="btn btn-ghost" type="button" id="bookPrint">Print this form</button>' +
          "</div>" +
          '<div class="err" id="formErr" style="margin-top:12px" hidden></div>' +
        "</form>" +

        '<aside id="bookAside">' +
          '<div class="quote" id="quoteCard"></div>' +
          '<div class="card" style="margin-top:16px">' +
            '<div class="card-kick">What happens next</div>' +
            '<ol class="small" style="padding-left:18px;margin:0">' +
              "<li>You press the button — the enquiry is written to your own device first.</li>" +
              "<li>You choose the channel: WhatsApp, email, SMS, the share sheet, or a file.</li>" +
              "<li>The coach replies with a time for the free 30-minute diagnostic.</li>" +
              "<li>You decide after the diagnostic — not before it.</li>" +
            "</ol>" +
          "</div>" +
          '<div class="card" style="margin-top:16px">' +
            '<div class="card-kick">Reach him right now</div>' +
            '<div class="btnrow">' +
              '<a class="btn btn-ghost btn-sm" href="tel:' + N.CONTACT.phoneTel + '">Call</a>' +
              '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/' + N.CONTACT.phoneWa + '">WhatsApp</a>' +
            "</div>" +
            '<p class="small muted" style="margin-top:10px">' + N.esc(N.CONTACT.phoneDisplay) + "<br>" + N.esc(N.CONTACT.email) + "</p>" +
          "</div>" +
        "</aside>" +
      "</div>" +
      '<div id="bookReceipt"></div>';

    host.innerHTML = html;
    var root = host;
    var grid = root.querySelector("#bookGrid");
    if (window.matchMedia("(max-width:900px)").matches) { grid.style.gridTemplateColumns = "1fr"; grid.style.gap = "20px"; }
    N.paintSigils(root);

    function el(id) { return root.querySelector("#" + id); }
    function val(id) { var e = el(id); return e ? String(e.value || "").trim() : ""; }

    /* --- time chips --------------------------------------------------- */
    var chosenTime = "";
    function paintTimes() {
      var day = days.filter(function (d) { return d.iso === val("day"); })[0] || days[0];
      var box = el("timeChips");
      box.innerHTML = day.times.map(function (t) {
        return '<button type="button" class="chip" data-t="' + t + '" style="cursor:pointer;min-height:40px;padding:8px 14px">' + t + "</button>";
      }).join("");
      box.querySelectorAll(".chip").forEach(function (b) {
        b.addEventListener("click", function () {
          chosenTime = b.dataset.t;
          box.querySelectorAll(".chip").forEach(function (x) { x.style.borderColor = ""; x.style.background = ""; x.style.color = ""; });
          b.style.borderColor = "#f59e0b"; b.style.background = "rgba(245,158,11,.14)"; b.style.color = "#fff";
        });
      });
      if (!day.times.length) box.innerHTML = '<span class="small muted">No remaining hours today — pick another day.</span>';
    }

    /* --- the live quote ----------------------------------------------- */
    function paintQuote() {
      var q = N.quote({ hoursPerWeek: val("hoursPerWeek"), weeks: val("weeks"), learners: val("learners") });
      el("quoteCard").innerHTML =
        '<div class="qhead">Your estimate</div><div class="qbody">' +
        q.lines.map(function (l) {
          return '<div class="qline"><span>' + N.esc(l.label) + '</span><span class="qv">' + (l.amount < 0 ? "−" : "") + N.fmtVnd(Math.abs(l.amount)) + "</span></div>";
        }).join("") +
        '<div class="qtotal"><span>Estimated total</span><b>' + N.fmtVnd(q.total) + "</b></div>" +
        '<p class="hint" style="margin-top:12px">' + N.esc(q.note) + "</p>" +
        '<p class="hint">' + q.hours + " hours total · " + q.hoursPerWeek + "/week for " + q.weeks + " weeks.</p>" +
        "</div>";
      return q;
    }

    /* --- validation ---------------------------------------------------- */
    function fail(id, msg) {
      var f = root.querySelector('[data-field="' + id + '"]');
      if (!f) return;
      f.classList.add("bad");
      var e = f.querySelector("[data-err]");
      if (e) { e.textContent = msg; e.hidden = false; }
    }
    function clearFails() {
      root.querySelectorAll(".field").forEach(function (f) {
        f.classList.remove("bad");
        var e = f.querySelector("[data-err]");
        if (e) { e.hidden = true; e.textContent = ""; }
      });
    }

    function collect() {
      clearFails();
      var bad = [];
      if (!val("studentName")) { fail("studentName", "Required — whose lessons are these?"); bad.push("studentName"); }
      if (!val("studentAge") || !/^\d{1,3}$/.test(val("studentAge"))) { fail("studentAge", "Required — a number in years (1–99)."); bad.push("studentAge"); }
      if (!val("goal")) { fail("goal", "Required."); bad.push("goal"); }
      if (!val("zone")) { fail("zone", "Required."); bad.push("zone"); }
      if (!chosenTime) { fail("time", "Pick a time — the coach confirms it, so an approximate one is fine."); bad.push("time"); }
      if (!val("name")) { fail("name", "Required — who should the coach ask for?"); bad.push("name"); }
      if (!val("phone") && !val("email")) { fail("phone", "A phone/WhatsApp number or an email — at least one."); fail("email", "…or an email."); bad.push("phone"); }
      if (val("email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val("email"))) { fail("email", "That email address looks incomplete."); bad.push("email"); }
      if (!el("consent").checked) { bad.push("consent"); }
      var err = el("formErr");
      if (bad.length) {
        err.hidden = false;
        err.textContent = bad.indexOf("consent") > -1 && bad.length === 1
          ? "Please tick the line about where your enquiry is stored."
          : bad.length + " field" + (bad.length === 1 ? "" : "s") + " still need" + (bad.length === 1 ? "s" : "") + " attention: " + bad.join(", ") + ".";
        var first = root.querySelector(".field.bad");
        if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
        return null;
      }
      err.hidden = true;
      return true;
    }

    function buildLead(q) {
      var day = days.filter(function (d) { return d.iso === val("day"); })[0] || {};
      var r = N.ref("book");
      return {
        id: r, ref: r,
        created: new Date().toISOString(),
        kind: "diagnostic", kindLabel: "Free diagnostic request",
        name: val("name"), email: val("email"), phone: val("phone"),
        studentName: val("studentName"), studentAge: val("studentAge"),
        level: val("level") || "not stated",
        goal: val("goal"), zone: val("zone"),
        slot: (day.label || val("day")) + " at " + chosenTime + " (ICT, to confirm)",
        pkg: val("kind"),
        hours: val("hoursPerWeek"),
        notes: val("notes"),
        fromPlacement: preRef || null,
        quote: q,
        source: "book.html"
      };
    }

    /* --- the receipt --------------------------------------------------- */
    function receipt(lead, deviceWrite, apiAttempt) {
      var lanes = [
        { lane: "DEVICE", verdict: deviceWrite.ok ? "STORED" : "FAILED", evidence: deviceWrite.ok ? "read back from this device's ledger · " + N.ledger.count() + " record(s)" : deviceWrite.error },
        { lane: "API", verdict: apiAttempt ? apiAttempt.verdict : "NOT TRIED", evidence: apiAttempt ? apiAttempt.evidence : "" },
        { lane: "HANDOFF", verdict: "READY", evidence: "choose a channel below — nothing is sent until you press it" }
      ];
      var cls = function (v) { return v === "STORED" || v === "DELIVERED" || v === "READY" ? "live" : v === "FAILED" || v === "REFUSED" ? "blocked" : ""; };
      el("bookReceipt").innerHTML =
        '<div class="hud gold" style="margin-top:26px" id="receiptCard">' +
          '<div class="hudbar"><span>Your request</span><span class="mono">' + N.esc(lead.ref) + "</span>" +
          '<span class="pill live"><span class="dot"></span>' + N.esc(lead.slot) + "</span></div>" +
          "<h2 style=\"margin-bottom:6px\">Saved. Now send it — you choose how.</h2>" +
          '<p class="small muted">Reference <b>' + N.esc(lead.ref) + "</b> · composed " + N.esc(N.fmtDate(lead.created)) + " · student " + N.esc(lead.studentName) + ", " + N.esc(lead.studentAge) + " yrs · " + N.esc(lead.goal) + "</p>" +
          '<div class="tablewrap" style="margin:16px 0"><table class="matrix"><thead><tr><th>Lane</th><th>Verdict</th><th>Evidence</th></tr></thead><tbody>' +
            lanes.map(function (l) {
              return "<tr><td>" + l.lane + '</td><td><span class="pill ' + cls(l.verdict) + '">' + N.esc(l.verdict) + "</span></td><td class=\"mono small\">" + N.esc(l.evidence || "—") + "</td></tr>";
            }).join("") + "</tbody></table></div>" +
          '<div class="btnrow">' +
            '<a class="btn btn-primary" target="_blank" rel="noopener" href="' + N.handoff.whatsapp(lead) + '">Send on WhatsApp</a>' +
            '<a class="btn btn-ghost" href="' + N.handoff.mailto(lead) + '">Send by email</a>' +
            '<a class="btn btn-ghost" href="' + N.handoff.sms(lead) + '">Send by SMS</a>' +
            '<button class="btn btn-ghost" type="button" id="rShare">Share…</button>' +
            '<button class="btn btn-ghost" type="button" id="rDl">Download the file</button>' +
            '<button class="btn btn-ghost" type="button" id="rCopy">Copy the text</button>' +
            '<button class="btn btn-sys" type="button" id="rPrint">Print the receipt</button>' +
          "</div>" +
          '<p class="hint" id="rNote">Nothing has left this device yet. The four lanes above are exactly as they are — not a summary of them.</p>' +
          '<p class="kick" style="margin-top:22px">The exact record</p>' +
          '<pre class="receipt">' + N.esc(N.handoff.text(lead)) + "</pre>" +
        "</div>";
      el("bookReceipt").scrollIntoView({ behavior: "smooth", block: "start" });

      el("rShare").addEventListener("click", function () {
        N.handoff.share(lead).then(function (r) { el("rNote").textContent = r.ok ? "Sent through the device share sheet." : "Not sent: " + r.error; });
      });
      el("rDl").addEventListener("click", function () { N.handoff.download(lead); el("rNote").textContent = "File written to your downloads folder."; });
      el("rCopy").addEventListener("click", function () {
        (navigator.clipboard ? navigator.clipboard.writeText(N.handoff.text(lead)) : Promise.reject())
          .then(function () { el("rNote").textContent = "Copied — paste it into any channel you like."; })
          .catch(function () { el("rNote").textContent = "Clipboard blocked by the browser. Use Download instead."; });
      });
      el("rPrint").addEventListener("click", function () { window.print(); });
    }

    /* --- wiring -------------------------------------------------------- */
    el("day").addEventListener("change", function () { chosenTime = ""; paintTimes(); });
    ["hoursPerWeek", "weeks", "learners"].forEach(function (id) { el(id).addEventListener("change", paintQuote); });
    el("bookPrint").addEventListener("click", function () { window.print(); });
    el("kind").addEventListener("change", function () {
      var student = root.querySelector("#studentName");
      if (val("kind") === "adult" && !student.value) student.value = val("name") || "";
    });

    el("bookForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = collect();
      if (!ok) return;
      var q = paintQuote();
      var btn = el("bookSubmit");
      btn.disabled = true; btn.innerHTML = '<span class="loader"></span> Saving…';
      var lead = buildLead(q);
      var w = N.ledger.add(lead);
      N.api.submit(lead).then(function (attempt) {
        /* re-read the ledger so the stored copy carries the delivery verdict */
        var stored = N.ledger.get(lead.ref);
        if (stored) { stored.delivery = attempt; N.ledger.remove(lead.ref); N.ledger.add(stored); }
        btn.disabled = false; btn.textContent = "Request another diagnostic";
        receipt(lead, w, attempt);
      });
    });

    paintTimes(); paintQuote();
  }

  /* --------------------------------------------------- the teacher intake */
  function teacherForm(host) {
    if (!host) return;
    host.innerHTML =
      '<form id="ttForm" novalidate><div class="hud">' +
        '<div class="hudbar"><span>Teach for NET</span><span class="mono">goes straight to the lead trainer</span></div>' +
        '<div class="row">' +
          field("tName", "Your name", '<input id="tName" placeholder="Full name">', "", true) +
          field("tPhone", "Phone / WhatsApp", '<input id="tPhone" inputmode="tel" placeholder="090 123 4567">', "", true) +
        "</div>" +
        field("tEmail", "Email", '<input id="tEmail" type="email" placeholder="you@example.com">', "", true) +
        '<div class="row">' +
          field("tLevel", "Your English level", '<select id="tLevel"><option>C2 (certified or demonstrable)</option><option>C1</option><option>B2</option><option>Other / explain below</option></select>', "", true) +
          field("tExp", "Years teaching", '<select id="tExp"><option>0–1</option><option>2–3</option><option>4–6</option><option>7+</option></select>', "", true) +
        "</div>" +
        field("tArea", "Where you can teach", '<select id="tArea">' + ZONES.map(function (z) { return "<option>" + N.esc(z) + "</option>"; }).join("") + "</select>", "", true) +
        field("tCerts", "Certificates & background", '<textarea id="tCerts" placeholder="TESOL/TEFL/CELTA, Montessori, Cambridge, degree, work permit status, schools you have taught at…"></textarea>', "", false) +
        field("tWhy", "Why NET?", '<textarea id="tWhy" placeholder="What you think of the 60% rule and the 45/15 protocol. Be specific — this is read by a person."></textarea>', "", true) +
        '<div class="btnrow"><button class="btn btn-primary" type="submit" id="ttSubmit">Send my application</button>' +
        '<a class="btn btn-ghost" href="method.html">Read the method first</a></div>' +
        '<div class="err" id="ttErr" style="margin-top:12px" hidden></div>' +
      '</div></form><div id="ttReceipt"></div>';

    host.querySelector("#ttForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var g = function (id) { var n = host.querySelector("#" + id); return n ? String(n.value || "").trim() : ""; };
      var miss = ["tName", "tPhone", "tEmail", "tWhy"].filter(function (k) { return !g(k); });
      var err = host.querySelector("#ttErr");
      if (miss.length) { err.hidden = false; err.textContent = "Still needed: " + miss.join(", "); return; }
      err.hidden = true;
      var lead = {
        id: N.ref("tec"), created: new Date().toISOString(), kind: "teacher", kindLabel: "Teacher application",
        name: g("tName"), phone: g("tPhone"), email: g("tEmail"),
        level: g("tLevel"), goal: "Teach for NET", zone: g("tArea"),
        notes: "Experience: " + g("tExp") + " years · Certificates: " + g("tCerts") + " · Why NET: " + g("tWhy"),
        source: "teachers.html"
      };
      var w = N.ledger.add(lead);
      var btn = host.querySelector("#ttSubmit"); btn.disabled = true; btn.innerHTML = '<span class="loader"></span> Saving…';
      N.api.submit(lead).then(function (a) {
        btn.disabled = false; btn.textContent = "Send another";
        host.querySelector("#ttReceipt").innerHTML =
          '<div class="hud gold" style="margin-top:22px"><div class="hudbar"><span>Application saved</span><span class="mono">' + N.esc(lead.ref) + "</span></div>" +
          '<div class="tablewrap"><table class="matrix"><tbody>' +
            "<tr><td>Device</td><td>" + (w.ok ? '<span class="pill live">STORED</span>' : '<span class="pill blocked">FAILED</span>') + "</td><td class=\"mono small\">" + N.esc(w.ok ? "written and read back" : w.error) + "</td></tr>" +
            '<tr><td>API</td><td><span class="pill ' + (a.verdict === "DELIVERED" ? "live" : a.verdict === "REFUSED" ? "blocked" : "") + '">' + N.esc(a.verdict) + '</span></td><td class="mono small">' + N.esc(a.evidence || "—") + "</td></tr>" +
          "</tbody></table></div>" +
          '<p class="small muted" style="margin-top:12px">Now send it the way you prefer:</p><div class="btnrow">' +
            '<a class="btn btn-primary" target="_blank" rel="noopener" href="' + N.handoff.whatsapp(lead) + '">WhatsApp</a>' +
            '<a class="btn btn-ghost" href="' + N.handoff.mailto(lead) + '">Email</a>' +
            '<button class="btn btn-ghost" type="button" id="ttDl">Download</button>' +
          "</div></div>";
        host.querySelector("#ttReceipt").scrollIntoView({ behavior: "smooth", block: "start" });
        host.querySelector("#ttDl").addEventListener("click", function () { N.handoff.download(lead); });
      });
    });
  }

  window.NETBooking = { mount: mount, teacherForm: teacherForm, upcoming: upcoming, VERSION: "1.0.0" };
})();
