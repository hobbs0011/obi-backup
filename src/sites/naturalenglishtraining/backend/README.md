# NET — the back end

The site is **local-first on purpose**. Every page captures an enquiry on the visitor's own device
and hands it to the coach through a channel the visitor chooses. That is not a limitation worked
around; it is the design, and it is why the form works in a café with one bar of signal.

This folder is the *other* lane: a real API, so that enquiries can also arrive without the visitor
pressing send. It ships complete. **It is not deployed** — deploying it needs a Cloudflare account
credential, and that credential does not live in this repository and must never live in a public
source file. Deploy it on your own account with your own token.

---

## What is here

| file | what it is |
|---|---|
| `worker.js` | the whole API: a Worker with five routes and one SQLite-backed Durable Object |
| `wrangler.toml` | the deploy config — the DO binding, the migration, and the non-secret vars |

## Routes

| method | path | auth | what it does |
|---|---|---|---|
| `GET` | `/` | none | a plain-text description of the API (no HTML, no marketing) |
| `GET` | `/api/health` | none | `{ ok, service, version, stored, time }` — the count is read from the store, not cached |
| `GET` | `/api/availability` | none | the next 12 teaching days and their hours, from the same generator the site's booking grid uses |
| `POST` | `/api/lead` | none | store one enquiry. JSON, 64 KiB cap, rate-limited per IP, honeypot field |
| `GET` | `/api/leads?limit=100` | `x-net-admin` | list enquiries, newest first |
| `DELETE` | `/api/leads/:ref` | `x-net-admin` | delete one enquiry by its reference |

## Deploy — four commands

```bash
cd backend
npx wrangler secret put ADMIN_TOKEN        # a long random string; you will need it once
npx wrangler deploy
# then, on every page of the site:
#   <meta name="net-api" content="https://net-api.YOUR-SUBDOMAIN.workers.dev">
```

To try it without touching the site, set it for one browser only:

```js
NET.api.setEndpoint("https://net-api.YOUR-SUBDOMAIN.workers.dev");
NET.api.health().then(console.log);   // { ok: true, service: "net-api", stored: 0, ... }
```

## The design rules this code obeys

These are the same rules the rest of the estate is held to, and they are why the code looks the
way it does.

1. **A 200 means stored.** `POST /api/lead` writes through the Durable Object, then reads the
   record straight back out of the database before answering. A write that cannot be read back is
   answered `500` with the store's own error text. An enquiry API that says `ok` without storing is
   the one lie that would make the whole lane worthless.
2. **Fail closed on admin.** If `ADMIN_TOKEN` is unset, every admin call is refused. There is no
   default token, no fallback, and no development bypass. The comparison is length-checked and
   constant-time.
3. **The client's arithmetic is not trusted.** If a lead carries a quote, the hour count is clamped
   and the total is recomputed against the published rate (600,000 VND/hour) inside `validateLead`.
   A price a browser can edit is a price that will be edited.
4. **An allow-list, not a passthrough.** `stamp()` copies the named fields a lead actually needs and
   nothing else, so a future client cannot quietly begin sending a fingerprint. No cookies are set,
   no visitor is identified, nothing is logged beyond the record itself.
5. **A bot is not told it failed.** A filled honeypot field returns the same shape as a success.
6. **Honest rate limiting.** The limiter is per isolate, and the code says so in a comment rather
   than implying it is a global firewall. Cloudflare's own WAF is the right place for that.

## What it deliberately does not do

- No accounts, no sessions, no cookies, no analytics.
- No payment handling. The site never processes money and neither does this.
- No email sending. A lead lands in the store and the coach reads it; wiring an email provider is a
  decision for the account owner, with their own credential.
- No PII beyond what a parent typed into the form on purpose.

## Checking it

```bash
curl -s https://net-api.YOUR-SUBDOMAIN.workers.dev/api/health
curl -s -X POST https://net-api.YOUR-SUBDOMAIN.workers.dev/api/lead \
  -H 'content-type: application/json' \
  -d '{"kind":"diagnostic","studentName":"Test","studentAge":"9","name":"Test Parent","phone":"0900000000"}'
curl -s -H "x-net-admin: $ADMIN_TOKEN" https://net-api.YOUR-SUBDOMAIN.workers.dev/api/leads?limit=5
```

A submitted lead should then appear in the site's own lane table as `DELIVERED` with the HTTP
status and the reference the API returned — the site records the verdict verbatim, so the receipt a
visitor sees and the record the coach reads carry the same evidence.
