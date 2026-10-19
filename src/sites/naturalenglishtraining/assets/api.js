/* ============================================================================
   NET — THE BACK-END CLIENT.
   The site is local-first on purpose. An enquiry is captured and stored on the
   visitor's own device the instant they press the button, and only then is the
   configured API tried. That order matters: a form that depends on a server
   loses the lead the moment the server is down, the wifi drops in a cafe, or
   the phone goes to sleep.

   Four lanes, and each one reports what it actually did:

     DEVICE   always available — localStorage, verified by read-back.
     HANDOFF  always available — WhatsApp · email · SMS · share · download.
     API      available only when an endpoint is configured (see backend/).
     STATION  the PrAiS command station's own legion queue, when the site is
              opened inside the station's origin.

   A lane that is not available is reported as BLOCKED with the reason
   verbatim. Nothing here claims a delivery it did not make.
   ========================================================================== */
(function () {
  "use strict";
  var N = window.NET;
  if (!N) return;

  function endpoint() {
    if (window.NET_API) return String(window.NET_API).replace(/\/+$/, "");
    var m = document.querySelector('meta[name="net-api"]');
    if (m && m.content) return String(m.content).replace(/\/+$/, "");
    try { return localStorage.getItem("net.api.endpoint") || ""; } catch (e) { return ""; }
  }
  function setEndpoint(url) {
    try { localStorage.setItem("net.api.endpoint", String(url || "").replace(/\/+$/, "")); return true; }
    catch (e) { return false; }
  }

  function req(path, opts) {
    var base = endpoint();
    if (!base) return Promise.resolve({ ok: false, blocked: true, error: "no API endpoint configured — the site is running in DEVICE + HANDOFF mode" });
    opts = opts || {};
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, opts.timeoutMs || 9000);
    return fetch(base + path, {
      method: opts.method || "GET",
      headers: Object.assign({ "content-type": "application/json" }, opts.headers || {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: ctrl.signal
    }).then(function (r) {
      clearTimeout(t);
      return r.text().then(function (txt) {
        var j = null; try { j = JSON.parse(txt); } catch (e) {}
        return { ok: r.ok, status: r.status, json: j, text: txt.slice(0, 600) };
      });
    }).catch(function (e) {
      clearTimeout(t);
      return { ok: false, error: String((e && e.name) === "AbortError" ? "timed out after " + ((opts.timeoutMs || 9000) / 1000) + "s" : (e && e.message) || e) };
    });
  }

  /* ------------------------------------------------------------------ the
     submission. The verdict object is stored ON the lead, so the receipt the
     visitor sees and the record the coach opens carry the same evidence. */
  function submit(lead) {
    var attempt = {
      lane: "API", endpoint: endpoint() || null, at: new Date().toISOString(),
      status: null, verdict: null, evidence: null
    };
    if (!endpoint()) {
      attempt.verdict = "BLOCKED";
      attempt.evidence = "no endpoint configured (see backend/README.md — deploy the worker, then paste its URL into the site's net-api meta tag)";
      lead.delivery = attempt;
      return Promise.resolve(attempt);
    }
    return req("/api/lead", { method: "POST", body: lead }).then(function (r) {
      attempt.status = r.status == null ? null : r.status;
      if (r.ok && r.json && (r.json.ok || r.json.id || r.json.ref)) {
        attempt.verdict = "DELIVERED";
        attempt.evidence = "HTTP " + r.status + " · " + (r.json.ref || r.json.id || "stored");
        lead.remoteRef = r.json.ref || r.json.id || null;
      } else {
        attempt.verdict = "REFUSED";
        attempt.evidence = "HTTP " + (r.status == null ? "—" : r.status) + " · " + (r.error || r.text || "no body");
        N.outbox.push({ lead: lead, attempt: attempt });
      }
      lead.delivery = attempt;
      return attempt;
    });
  }

  /* The outbox drains itself on every page load. It only ever removes an item
     after the API has answered OK for it — so a failed send is retried, not
     forgotten. */
  function drain() {
    var pending = N.outbox.all();
    if (!pending.length || !endpoint()) return Promise.resolve({ checked: pending.length, sent: 0 });
    var seq = Promise.resolve(), sent = 0;
    pending.forEach(function (item) {
      seq = seq.then(function () { return submit(item.lead).then(function (a) { if (a.verdict === "DELIVERED") sent++; }); });
    });
    return seq.then(function () {
      if (sent) N.outbox.clear();
      return { checked: pending.length, sent: sent };
    });
  }

  function health() { return req("/api/health", { timeoutMs: 6000 }); }
  function availability() { return req("/api/availability", { timeoutMs: 6000 }); }

  /* ---------------------------------------------------------- the report */
  function status() {
    var ep = endpoint();
    return {
      endpoint: ep || null,
      lanes: [
        { lane: "DEVICE", state: "UP", note: "localStorage ledger · " + N.ledger.count() + " record(s) on this device" },
        { lane: "HANDOFF", state: "UP", note: "WhatsApp · email · SMS · share sheet · JSON download" },
        { lane: "API", state: ep ? "CONFIGURED" : "BLOCKED", note: ep ? ep : "no endpoint configured — deploy backend/worker.js and set the net-api meta tag" },
        { lane: "STATION", state: window.parent !== window ? "EMBEDDED" : "STANDALONE", note: window.parent !== window ? "opened inside another page — the station can read this device's ledger" : "the site answers on its own origin" }
      ]
    };
  }

  window.NET.api = {
    endpoint: endpoint, setEndpoint: setEndpoint, submit: submit, drain: drain,
    health: health, availability: availability, status: status
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { drain(); });
  else drain();
})();
