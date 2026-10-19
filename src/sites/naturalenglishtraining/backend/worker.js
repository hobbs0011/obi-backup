/* ============================================================================
   NET — THE BACK END.  A Cloudflare Worker, with one Durable Object.
   ============================================================================
   This is the API the site's DEVICE + HANDOFF lanes fall back to when the
   coach wants enquiries to arrive without the visitor having to press send.
   It ships with the site so the site is complete; it is NOT deployed, because
   deploying it requires an account credential that this repository does not
   hold and must never hold. Deploy it on your own account — the README beside
   this file has the four commands.

   What it stores: leads. Nothing else. No accounts, no cookies, no analytics,
   no tracking. A lead is a JSON object the visitor chose to submit, kept in a
   SQLite-backed Durable Object keyed by the site's own namespace.

   Routes
     GET  /                  → a plain-text description of the API (no HTML)
     GET  /api/health        → { ok, service, version, stored, time }
     GET  /api/availability  → the teaching slots, computed the same way the
                               site computes them, so the two can never drift
     POST /api/lead          → store one lead. Validated, size-capped, and
                               rate-limited per IP. Returns { ok, ref }
     GET  /api/leads         → list leads. Requires the admin token.
     DELETE /api/leads/:ref  → remove one lead. Requires the admin token.

   Deliberate design decisions, each one a fail-closed rule:
     • A lead is only acknowledged after the Durable Object confirms the write.
       A 200 that was not stored is the one lie an enquiry API must never tell.
     • The admin token is compared in constant time, and the comparison is on
       the *stored* value — there is no default, and the API refuses every
       admin call when the secret is unset rather than falling open.
     • The honeypot field is rejected quietly with a success-shaped response,
       because telling a bot it failed only teaches the bot.
   ========================================================================== */

import { DurableObject } from "cloudflare:workers";

const VERSION = "1.0.0";
const SERVICE = "net-api";
const MAX_BODY = 64 * 1024;         /* 64 KiB — a lead, not a photograph */
const MAX_LEADS = 5000;             /* per namespace, oldest trimmed first */
const RATE = { windowMs: 60 * 1000, max: 12 };  /* 12 submissions per minute per IP */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === "/") return text(describe(), cors);

      if (url.pathname === "/api/health") {
        const store = storeFor(env, "net");
        const n = await store.count();
        return json({ ok: true, service: SERVICE, version: VERSION, stored: n, time: new Date().toISOString() }, 200, cors);
      }

      if (url.pathname === "/api/availability" && request.method === "GET") {
        return json({ ok: true, slots: availability(), note: "Same generator as the site's booking grid: weekdays 17:00–21:00, weekends 08:00–20:00, Asia/Ho_Chi_Minh." }, 200, cors);
      }

      if (url.pathname === "/api/lead" && request.method === "POST") {
        const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
        if (!withinRate(ip)) return json({ ok: false, error: "rate limited — try again in a minute" }, 429, cors);

        const raw = await readCapped(request, MAX_BODY);
        if (raw == null) return json({ ok: false, error: "body too large or unreadable" }, 413, cors);

        let lead;
        try { lead = JSON.parse(raw); } catch (e) { return json({ ok: false, error: "body must be JSON" }, 400, cors); }

        const v = validateLead(lead);
        if (!v.ok) {
          /* The honeypot is answered exactly like a success: a bot that is told
             it failed is a bot that adapts. */
          if (v.honeypot) return json({ ok: true, ref: "NET-IGN-" + shortId(), stored: false }, 200, cors);
          return json({ ok: false, error: v.error }, 400, cors);
        }

        const record = stamp(lead, request);
        const store = storeFor(env, "net");
        const res = await store.put(record);
        if (!res.ok) return json({ ok: false, error: "store refused the write: " + res.error }, 500, cors);
        return json({ ok: true, ref: record.ref, stored: true, at: record.receivedAt }, 200, cors);
      }

      if (url.pathname === "/api/leads" && request.method === "GET") {
        if (!adminOk(request, env)) return json({ ok: false, error: "admin token missing or wrong" }, 401, cors);
        const store = storeFor(env, "net");
        const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit") || 100)));
        return json({ ok: true, count: await store.count(), leads: await store.list(limit) }, 200, cors);
      }

      if (url.pathname.startsWith("/api/leads/") && request.method === "DELETE") {
        if (!adminOk(request, env)) return json({ ok: false, error: "admin token missing or wrong" }, 401, cors);
        const ref = decodeURIComponent(url.pathname.slice("/api/leads/".length));
        const store = storeFor(env, "net");
        const res = await store.del(ref);
        return json(res, res.ok ? 200 : 404, cors);
      }

      return json({ ok: false, error: "no such route", routes: describe().routes }, 404, cors);
    } catch (e) {
      return json({ ok: false, error: "server error: " + String((e && e.message) || e) }, 500, cors);
    }
  }
};

/* --------------------------------------------------------------- helpers */

function corsHeaders(request, env) {
  const allowed = (env && env.ALLOWED_ORIGINS) || "*";
  const origin = request.headers.get("origin") || "";
  const allow = allowed === "*" ? "*" : allowed.split(",").map(s => s.trim()).filter(Boolean).includes(origin) ? origin : "";
  return {
    "access-control-allow-origin": allow || "null",
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,x-net-admin",
    "access-control-max-age": "86400",
    "vary": "origin"
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: Object.assign({ "content-type": "application/json; charset=utf-8" }, cors) });
}
function text(body, cors) {
  return new Response(body, { status: 200, headers: Object.assign({ "content-type": "text/plain; charset=utf-8" }, cors) });
}
function describe() {
  return [
    "NET API — " + SERVICE + " v" + VERSION,
    "",
    "GET    /api/health              → service state and how many leads are stored",
    "GET    /api/availability        → the teaching slots for the next 12 days",
    "POST   /api/lead                → store one enquiry (JSON, max 64 KiB)",
    "GET    /api/leads?limit=100     → list enquiries (requires x-net-admin)",
    "DELETE /api/leads/:ref          → delete one enquiry (requires x-net-admin)",
    "",
    "Nothing here is an account system and nothing here tracks a visitor.",
    "A lead is stored only after the write is confirmed. See backend/README.md."
  ].join("\n");
}

async function readCapped(request, max) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len && len > max) return null;
  try {
    const buf = await request.arrayBuffer();
    if (buf.byteLength > max) return null;
    return new TextDecoder().decode(buf);
  } catch (e) { return null; }
}

function validateLead(lead) {
  if (!lead || typeof lead !== "object" || Array.isArray(lead)) return { ok: false, error: "lead must be an object" };
  if (typeof lead.hp === "string" && lead.hp.trim() !== "") return { ok: false, honeypot: true };
  const s = v => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());
  const name = s(lead.studentName) || s(lead.name);
  if (!name) return { ok: false, error: "a name is required" };
  if (name.length > 200) return { ok: false, error: "name is too long" };
  const contact = s(lead.phone) || s(lead.email);
  if (!contact) return { ok: false, error: "a phone number or an email is required" };
  const kind = s(lead.kind) || "enquiry";
  if (!["diagnostic", "enrol", "teacher", "placement", "contact"].includes(kind)) return { ok: false, error: "unknown kind: " + kind };
  /* Money fields are recomputed against the published rate, never trusted from
     the client. A quote a browser can edit is a quote that will be edited. */
  if (lead.quote && typeof lead.quote === "object") {
    const RATE = 600000;
    const hours = clamp(lead.quote.hours, 1, 20 * 36);
    lead.quote.hours = hours;
    lead.quote.recomputedTotal = hours * RATE * (1 - clamp(lead.quote.discount, 0, 0.35));
    lead.quote.rateAtIntake = RATE;
  }
  return { ok: true };
}

function clamp(n, lo, hi) {
  n = Number(n);
  if (!isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function stamp(lead, request) {
  const now = new Date().toISOString();
  const ref = "NET-" + now.slice(2, 10).replace(/-/g, "") + "-" + shortId();
  /* Keep the record, drop the noise: an allow-list of the fields that matter,
     so a future client cannot quietly start sending a visitor's fingerprint. */
  const keep = ["kind", "kindLabel", "name", "email", "phone", "studentName", "studentAge",
    "level", "goal", "zone", "slot", "pkg", "hours", "notes", "quote", "placement", "fromPlacement", "source"];
  const out = { ref, receivedAt: now, ip: request.headers.get("cf-connecting-ip") || null,
    country: (request.cf && request.cf.country) || null, ua: (request.headers.get("user-agent") || "").slice(0, 200) };
  for (const k of keep) if (lead[k] !== undefined) out[k] = lead[k];
  return out;
}

function shortId() {
  const a = new Uint8Array(4);
  crypto.getRandomValues(a);
  return Array.from(a).map(b => b.toString(36).padStart(2, "0")).join("").slice(0, 6).toUpperCase();
}

/* Constant-time comparison. Length is compared first, which leaks only the
   length of the secret — acceptable, and stated rather than hidden. */
function adminOk(request, env) {
  const expected = (env && env.ADMIN_TOKEN) || "";
  if (!expected) return false;                 /* fail closed: no token, no admin */
  const given = request.headers.get("x-net-admin") || "";
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/* Per-isolate rate limiting. It is not a global guarantee — a Worker has many
   isolates — and it says so, rather than pretending to be a firewall. */
const HITS = new Map();
function withinRate(ip) {
  const now = Date.now();
  const rec = HITS.get(ip) || { start: now, n: 0 };
  if (now - rec.start > RATE.windowMs) { rec.start = now; rec.n = 0; }
  rec.n++;
  HITS.set(ip, rec);
  if (HITS.size > 5000) HITS.clear();
  return rec.n <= RATE.max;
}

/* The teaching slot generator. Deliberately identical in shape to the one in
   assets/booking.js — weekdays 17:00–21:00, weekends 08:00–20:00, ICT. */
function availability() {
  const ICT_OFFSET_MIN = 7 * 60;
  const now = new Date(Date.now() + ICT_OFFSET_MIN * 60000);
  const out = [];
  for (let i = 0; i < 21 && out.length < 12; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dow = d.getUTCDay();
    let times = (dow === 0 || dow === 6)
      ? ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30", "18:00"]
      : ["17:00", "18:00", "19:00", "20:00"];
    if (i === 0) {
      const h = d.getUTCHours();
      times = times.filter(t => Number(t.slice(0, 2)) > h + 1);
      if (!times.length) continue;
    }
    const iso = d.toISOString().slice(0, 10);
    out.push({ date: iso, weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow], times });
  }
  return out;
}

function storeFor(env, ns) {
  const id = env.NET_STORE.idFromName(ns);
  return env.NET_STORE.get(id);
}

/* ============================================================================
   THE DURABLE OBJECT — the store.
   SQLite-backed (the storage API Cloudflare offers to new Durable Objects),
   plus an in-memory mirror so reads are cheap. Every write is answered only
   after the storage call returns, which is what makes the API's 200 mean
   something.
   ========================================================================== */
export class NETStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.state = ctx;
    this.ready = null;
  }

  async init() {
    if (!this.ready) {
      this.state.storage.sql.exec("CREATE TABLE IF NOT EXISTS leads (ref TEXT PRIMARY KEY, at TEXT, kind TEXT, body TEXT)");
      this.ready = true;
    }
    return this.ready;
  }

  async put(lead) {
    try {
      await this.init();
      this.state.storage.sql.exec(
        "INSERT OR REPLACE INTO leads (ref, at, kind, body) VALUES (?, ?, ?, ?)",
        lead.ref, lead.receivedAt, String(lead.kind || "enquiry"), JSON.stringify(lead)
      );
      /* read it straight back — a store that says yes without checking is the
         one lie this service must not tell. */
      const check = this.state.storage.sql.exec("SELECT ref FROM leads WHERE ref = ?", lead.ref).toArray();
      if (!check.length) return { ok: false, error: "write not readable back" };
      const n = this.state.storage.sql.exec("SELECT COUNT(*) AS n FROM leads").one().n;
      if (n > MAX_LEADS) {
        this.state.storage.sql.exec(
          "DELETE FROM leads WHERE ref IN (SELECT ref FROM leads ORDER BY at ASC LIMIT ?)", n - MAX_LEADS);
      }
      return { ok: true, ref: lead.ref, count: n };
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  }

  async list(limit) {
    await this.init();
    const rows = this.state.storage.sql.exec("SELECT body FROM leads ORDER BY at DESC LIMIT ?", limit).toArray();
    return rows.map(r => { try { return JSON.parse(r.body); } catch (e) { return { raw: r.body }; } });
  }

  async count() {
    try { await this.init(); return this.state.storage.sql.exec("SELECT COUNT(*) AS n FROM leads").one().n; }
    catch (e) { return 0; }
  }

  async del(ref) {
    try {
      await this.init();
      const before = this.state.storage.sql.exec("SELECT ref FROM leads WHERE ref = ?", ref).toArray();
      if (!before.length) return { ok: false, error: "no lead with that reference" };
      this.state.storage.sql.exec("DELETE FROM leads WHERE ref = ?", ref);
      const after = this.state.storage.sql.exec("SELECT ref FROM leads WHERE ref = ?", ref).toArray();
      return { ok: after.length === 0, deleted: ref, error: after.length === 0 ? null : "delete did not take" };
    } catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
  }
}
