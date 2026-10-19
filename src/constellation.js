/* ============================================================================
   THE CONSTELLATION — every piece of the organism, in one place.

   One source of truth for what the ecosystem IS: the station, the generator
   nodes, the public faces, and the services underneath. Each piece carries its
   real state, its interface, and what it still needs. Nothing here is aspirational
   without saying so:

     live      answering right now, verified
     ready     built + verified, waiting on a deploy (the sovereign's account)
     scaffold  the generator is written (ready to paste) but does not exist yet
     planned   specified, not written
     blocked   real, but we cannot touch it without a credential

   Void of hype, this is the map:
     STATION    the anchor — capture, transcribe, write up, review, command
     NODES      one organism, many faces: each role is its own generator (CGN)
     FACES      where the work meets the customer (the shelf, the portals)
     SERVICES   host, vault, tunnel, mesh, canon

   A planned piece is a PLACEHOLDER on purpose: it names the generator, its role,
   its deep-link contract and its CGN wiring so the day it is created nothing has
   to be re-thought. /constellation reads this; the scout's `pieces` probe touches
   every URL that claims to be live (MAP ≠ TERRAIN).

   Source of truth for the *tools* is src/ecosystem.js (the evaluator stack).
   This file is the source of truth for the *pieces*.
   ========================================================================== */
(function(){
  "use strict";

  const F = {
    station:  { id:"station",  icon:"◈", name:"STATION — the anchor",     why:"the command post: capture the room, write up the class, review the student, drive the Legion" },
    family:   { id:"family",   icon:"🜂", name:"FAMILY — the generator mesh", why:"the stations that actually answer, measured by content key with no token — named under /umbrella, read and addressed by /masterlink" },
    nodes:    { id:"nodes",    icon:"🜂", name:"NODES — generator roles", why:"one organism, many faces: each role is its own generator, joined to the whole over CGN" },
    faces:    { id:"faces",    icon:"🌐", name:"FACES — public surfaces",  why:"where the work meets the customer: the shelf that sells it, the portals they log into" },
    services: { id:"services", icon:"⚙", name:"SERVICES — the plumbing",  why:"host, vault, tunnel, mesh, canon — invisible when right, fatal when wrong" }
  };

  const STATUS = {
    live:     { c:"#4cd97b", label:"LIVE",     blurb:"answering right now — verified" },
    ready:    { c:"#38bdf8", label:"READY",    blurb:"built and verified, waiting on a deploy" },
    scaffold: { c:"#f5a623", label:"SCAFFOLD", blurb:"written and ready to paste — the generator does not exist yet" },
    retired:  { c:"#6b7280", label:"RETIRED",  blurb:"pulled from the constellation \u2014 kept for the record" },
    planned:  { c:"#8a94a6", label:"PLANNED",  blurb:"specified here, not written" },
    blocked:  { c:"#ff5a5a", label:"BLOCKED",  blurb:"real, but needs a credential we do not hold" }
  };

  /* The station's own URL is derived from the live generator name, so a rename
     (the sovereign has renamed this generator more than once) never leaves the
     constellation — or the scout's self-probe — pointing at a dead slug. */
  const SELF_URL = (typeof window !== "undefined" && window.generatorName)
    ? "https://perchance.org/" + window.generatorName
    : "https://perchance.org/prais-command-station";

  const PIECES = [
    /* ------------------------------- STATION ------------------------------- */
    {
      id: "station.obi", family: "station", kind: "generator", role: "anchor",
      name: "Obi — the station", status: "live",
      url: SELF_URL,
      expect: "Student Summary Generator",
      tagline: "the student-file + student-review portion: the ear, the writeup layer, the command post",
      iface: { commands: ["/client", "/clients", "/transcribe", "/summary", "/writeup", "/review", "/web", "/scout", "/os", "/route", "/netjoin"], endpoints: [] },
      cgn: { net: "obi-network", role: "anchor" },
      needs: ["join the mesh: /netjoin obi-network (the hub does not exist yet)"],
      notes: "Renamed three times now: net-studentfeedback-timmy → net-student-evaluator → prais-command-station (the publicId has been stable, but the station's kv is keyed by generator, so each rename presents an EMPTY station — rename back to recover the old data; see src/HANDOFF.md). Three faces: ⌘ Command Station (#cmd — the magic chat), ◈ Phoenix Generators (#gen — PrAis's divisions, with the 👤 Student Evaluator desk one level in under NET, and Lesson Creator next), ⚙ Settings (#settings — voice, the shelf, the ledger, the live instruments, reincarnate). The registry for the family is src/divisions.js; the desk itself is the client → student/class switchboard plus the record → summarize → write-up tiles. Everything else in this list is either a node it drives, a face it serves, or a service it leans on. It is also the Anchor (the hub writer) by design — which is why the mesh cannot be joined until it is named explicitly. It also carries the client layer (src/clients.js): the station serves many CLIENTS, each one isolated (students, classes, recordings, summaries, notes, reviews, writeups); Timmy is client #1 and legacy data is adopted into him."
    },

    /* -------------------------------- NODES -------------------------------- */
    {
      id: "node.image", family: "nodes", kind: "generator", role: "image",
      name: "Image node — the eye", status: "scaffold",
      url: null, plannedUrl: "https://perchance.org/obi-image",
      tagline: "makes the pictures; the station routes /img to it when it is present",
      iface: { commands: [], endpoints: [] },
      cgn: { net: "obi-network", role: "image" },
      deepLink: "?p=<prompt> — opens with the prompt filled and generates",
      scaffold: "src/image-node/ (main.pjs · index.html · src/app.js · src/styles.css · src/cgn-node.js)",
      needs: ["create the generator from src/image-node/", "open it once (it writes its node file)", "/netadd obi-image image"],
      notes: "Complete and ready to paste. Multiple image nodes are allowed — the station routes to whichever image node is registered, so styles can be split across several (portrait / diagram / poster)."
    },
    {
      id: "node.ear", family: "nodes", kind: "generator", role: "ear",
      name: "Ear node — the listener", status: "planned",
      url: null, plannedUrl: "https://perchance.org/obi-ear",
      tagline: "a phone left in the room: capture long recordings without touching the station",
      iface: { commands: ["/listen <url>", "/stop", "/state"], endpoints: [] },
      cgn: { net: "obi-network", role: "ear" },
      deepLink: "?rec=<media url> — the node opens listening",
      needs: ["fork the station's ear (src/transcribe.js + src/audio-split.js) into a shell", "Deepgram key on that origin", "push transcripts to the station's archive over CGN"],
      notes: "The station already transcribes hours-long recordings; the ear node exists so the *in-room* device is disposable and the station stays at the desk. Same part-split machinery, thinner shell."
    },
    {
      id: "node.portal", family: "nodes", kind: "generator", role: "portal",
      name: "Student portal — the door (one per student)", status: "planned",
      url: null, plannedUrl: "https://perchance.org/<student-slug>",
      tagline: "each student gets their own generator: their world, their homework, their voice",
      iface: { commands: ["#login (PIN)", "#parent", "#student", "study request", "daily log"], endpoints: [] },
      cgn: { net: "obi-network", role: "portal" },
      deepLink: "?student=<name> — the portal knows whose it is",
      scaffold: "src/generators/student-portal/ (main.pjs · index.html · README — the generalized client portal)",
      needs: ["the old hand-built snapshot was wiped 2026-09-22 (its client dropped) — build the next portal from src/generators/student-portal/, not from that file", "change PINs + move the check server-side", "CGN node so the portal's captures flow into the student's file"],
      notes: "The sovereign's stated direction: one generator per student. The portal is the *student's* surface; the station stays the teacher's. The first real instance was retired with its client on 2026-09-22 (face.client-portal); the next one is built from the generalized source, and nothing about it is live until it runs."
    },
    {
      id: "node.practice", family: "nodes", kind: "generator", role: "practice",
      name: "Practice node — the drill", status: "planned",
      url: null, plannedUrl: "https://perchance.org/obi-practice",
      tagline: "turns this week's evidence into exercises the student can actually do",
      iface: { commands: ["/drill <topic>", "/quiz", "/vocab"], endpoints: [] },
      cgn: { net: "obi-network", role: "practice" },
      needs: ["a generator over the student's own filed evidence", "generated drills cached in kv", "results reported back to the station as evidence"],
      notes: "This is the 'learning loop' family of the evaluator stack (src/ecosystem.js) finally getting a body: retrieval practice and spaced repetition from the student's own transcript, not generic worksheets."
    },
    {
      id: "node.watchtower", family: "nodes", kind: "generator", role: "watchtower",
      name: "Watchtower — the teacher's board", status: "planned",
      url: null, plannedUrl: "https://perchance.org/obi-watchtower",
      tagline: "every student, one board: who is behind, who is ready, what was never taught",
      iface: { commands: ["/roster", "/term", "/coverage", "/who"], endpoints: [] },
      cgn: { net: "obi-network", role: "watchtower" },
      needs: ["read the CGN hub for every portal + the station's rosters", "term progress across students", "coverage-vs-syllabus — the engine now exists in the station (/coverage · src/curriculum.js, built 2026-09-21); the watchtower is it at class scale"],
      notes: "The station can already write one student's review; the watchtower is the class-level view — the parent question ('what did we pay for?') answered with evidence."
    },

    {
      id: "node.site", family: "nodes", kind: "generator", role: "site",
      name: "Site Builder — the hand that puts a page on the web", status: "scaffold",
      url: null, plannedUrl: "https://perchance.org/prais-site-builder",
      tagline: "a brief goes in, a real self-contained website comes out — previewed, downloadable, and honest about who can publish it",
      iface: { commands: ["/plan <brief>", "/build <brief>", "/sites", "/open <n>", "/dl <n>", "/brand on|off", "/deploy"], endpoints: [] },
      cgn: { net: "obi-network", role: "site" },
      deepLink: "?brief=<text> — opens with the brief filled and builds",
      scaffold: "src/generators/site-builder/ (README · main.pjs · index.html · src/app.js · src/styles.css · src/cgn-node.js)",
      needs: ["create the generator from src/generators/site-builder/ and open it once (it writes its node file)", "/netadd <name> site",
              "a publish path: the Cloudflare build is in src/cloudflare/ but deploying needs the sovereign's account (no token held → BLOCKED)"],
      notes: "The Web Development division's first generator (the division was empty until this). It reuses the website machinery already built — src/cloudflare/ (one Worker, two Durable Objects, build.mjs asserting every <script src> resolves), face.prais on Cloudflare Pages — and the build-in-parts machinery proven in src/freephoenix.js (unfinished part ends <<<MORE>>>). It builds ONE self-contained HTML file per site (the same law as a lesson, a deck, a built app), previews it in a sandboxed iframe and files it locally. It cannot publish and it says so: publishing is the sovereign's account, and a write to the authority is the station's PHOENIXOMEGAPROTOCOL gate. MARKED scaffold ON PURPOSE — the source is written and parse-checked but has never run in a generator of its own."
    },

    {
      id: "node.video", family: "nodes", kind: "generator", role: "video",
      name: "Video Node — the eye", status: "scaffold",
      url: null, plannedUrl: "https://perchance.org/prais-video-node",
      tagline: "the drop station — video · pictures · links · words in; a blueprint, a reel and a verdict out",
      iface: { commands: ["/sweep", "/sweepone <n>", "/activate <n>", "/queue", "/zipall", "/pulse [n]", "/plan [n]", "/test", "/links <a b c…>", "/cross", "/prompt <words>", "/research", "/blueprint", "/orders", "/perfect", "/audit", "/gate", "/assemble", "/doc", "/ship", "/frames [n]", "/sheet", "/shorts [n] [s]", "/vibe", "/hand", "/all", "/save", "/add <url…>", "/stills-reel", "/reel", "/preview", "/poster", "/lookup <url>", "/story", "/dress", "/sold"], endpoints: [] },
      cgn: { net: "obi-network", role: "video" },
      deepLink: "?brief= (outbound, to the Site Builder — the vision pass writes the brief the builder takes)",
      scaffold: "src/generators/video-node/ (README · main.pjs · index.html · src/app.js · src/pulse.js · src/reel.js · src/story.js · src/drop.js · src/styles.css · src/cgn-node.js)",
      needs: ["create the generator from src/generators/video-node/ and open it once (it writes its node file)", "/netadd <name> video",
              "the venue's own music as the reel's bed (a file off the disk — nothing is uploaded)",
              "paste main.pjs as-is: it imports text-to-image-plugin so the image hand can be run in-node"],
      notes: "Built for one sentence from the sovereign: 'I cannot attach the videos because 20MB is too big? fix that by making possible in the generator.' A file chosen from disk is read with the File API, so the chat's attachment cap simply does not exist in here. It has since grown into the DROP STATION — four doors (video · pictures · links · the owner's own words) and one conductor. Footage in → a queue read one at a time (a 4 GB file costs what a 4 MB one does), stills, a timecoded contact sheet, THE PULSE (src/pulse.js: a motion walk + a loudness pass, normalised against the file's own floor and peak, with a stillness floor so quiet parts are never padded into clips), clips cut from the measured peaks, and the look in words. Links in → every address fetched live through superFetch and read IN CODE, then the LINK AUDIT (linked · given-but-not-linked · on the site but never given · named but never linked · absent) plus phone/address disagreement detection. Words in → research (the model's industry knowledge is labelled `rule of thumb, not measured`), a blueprint for the first prototype, and orders for whatever is missing. Then THE THREE HANDS ARE RUN, not described: the image hand (text-to-image-plugin, in-node), the copy hand (the register — src/story.js IS the copy hand; there is no separate copy agent in the family), and the video hand (this node: it renders the film). Every order is re-audited, so an order only reads PASS when a hand actually made it. Then THE GATE answers one question — READY TO EXECUTE / NOT YET COMPLETE / BLOCKED — where only a fault in this node's OWN output (an invented number, a withheld line, a file that will not play back) is allowed to block; a fault in the client's own site becomes an order for the prototype. The register's law is enforced in code: no number the offering does not state (and with no offering, no digit at all), and no register example reused. Measured live: 12 venue photographs and canon.mailala.pages.dev read → a 29.9s 1080×1920 MP4 with an AAC bed, 897 frames, written in 6.5s and read back as playable; and a full station run on the same venue → 4 links read, 6 industry must-haves, a 6-section blueprint, 5 assets made, a 8.9s MP4 rendered, 8 pass / 5 warn / 1 hole / 0 fail, gate NOT YET COMPLETE. MARKED scaffold ON PURPOSE — exercised end to end in a harness, but never yet a generator of its own."
    },

    /* -------------------------------- ROLES -------------------------------- */
    {
      id: "node.roles", family: "nodes", kind: "generator", role: "roles",
      name: "The Roles — one generator per function of the intake", status: "scaffold",
      url: null,
      tagline: "the intake taken apart: the CV · the LinkedIn · the headshot · the portfolio · the 44 · the presentation · the applications · the interview · the umbrella · the presence · the credit · the lists",
      iface: { commands: [], endpoints: [] },
      cgn: null,
      deepLink: "?student=<name> — opens straight onto a record",
      scaffold: "src/generators/role-kit/ (kit.js · method.js · build.js · test-roles.js · test-actions.js) + the twelve role folders, each README · main.pjs · index.html (generated) · src/panel.js",
      needs: ["paste a role's main.pjs + index.html into a generator of its own — no role has been published yet (which is why the crate says scaffold)",
              "a perchance name for each role, if they are to be public",
              "the two method tables reconciled with src/intake.js whenever either moves (there is no build step that can keep them in sync)"],
      notes: "BUILT ON ONE ORDER, 2026-09-22: \"I want to make a generator for each of the functions we are doing for the brothers, so they can be reused.\" Twelve roles, one per function the lesson of the 23rd produced, all built from three shared sources — role-kit/kit.js (theme · record store · the intake/1 record shape · import/export · the fail-closed field reader · the shared page furniture), role-kit/method.js (the tape's own tables: the promises, the 44 sounds, the collisions, the interview bank, the CV rows — no student in it), and each role's own src/panel.js. index.html is GENERATED (role-kit/build.js inlines the kit and the method), so a role ships as ONE paste of two files, fetches nothing at runtime, and opens offline. NOT CGN NODES: these share a RECORD, not a mesh — that is why cgn is null and why they are registered on the SHELF (src/divisions.js) rather than as mesh nodes: ten of them under the CAREER division, with the 44 and the Weekly Presentation filed under NET because the classroom owns what they measure. VERIFIED 2026-09-22, and the verification is in the tree: role-kit/test-roles.js (12/12 boot) and role-kit/test-actions.js (12/12 behave — it drives the real controls and reads the record back; 0 frames threw). NOT PROVEN: not one of them has been pasted into a generator of its own, so nothing here is called live."
    },

    /* -------------------------------- FACES -------------------------------- */
    {
      id: "face.prais", family: "faces", kind: "site", role: "shelf",
      name: "PrAiS storefront — the shelf", status: "live",
      url: "https://e3301ee8.michael-hobbs.pages.dev/prais",
      expect: "PrAiS",
      tagline: "the public face: what is offered, and to whom",
      iface: { commands: [], endpoints: [] },
      cgn: null,
      host: "Cloudflare Pages",
      notes: "Live and read: 'Phoenix Rising AI solutions that remember… smarter architecture'. The natural public face of the offering catalogue (src/AGENT99-OS.md §4)."
    },
    {
      id: "face.client-portal", family: "faces", kind: "site", role: "client-portal",
      name: "Client portal — retired", status: "retired",
      url: null, deployedUrl: "https://timmy-portal.mrmichaelhobbs123.workers.dev/",
      tagline: "the first client's portal — retired with the client, 2026-09-22",
      iface: { commands: ["#login", "#parent", "#gameplan"], endpoints: [] },
      cgn: null,
      host: "Cloudflare Worker — deployment left in place; the source was wiped from src/",
      notes: "WIPED 2026-09-22 at the sovereign's instruction — \"timmy dropped us, so wipe him\". The client record is out of the ledger, src/timmy-portal/ is gone from the tree, and the scout no longer probes it. The Worker deployment itself is untouched (it is the sovereign's account, not this station's to delete), so the URL is recorded here as a fact rather than as a live service this station watches. The generalized replacement design is src/generators/student-portal/."
    },

    /* ------------------------------ FAMILY ---------------------------------
       THE LIVE GENERATOR MESH, as measured on 2026-09-24 — by content key, one
       token-free call each. These are not products on a shelf (src/divisions.js)
       and not planned nodes: they EXIST, they are saved, and this station reads
       their whole published trees. `noProbe` keeps the scout from superFetching
       ~880 KB of perchance.org per station on every sweep — existence here is
       proven by the read channel, not by a page fetch. */
    {
      id: "family.mastermind", family: "family", kind: "generator", role: "master",
      name: "Mastermind — the live master (this station)", status: "live",
      url: SELF_URL, noProbe: true,
      tagline: "the station the whole family aims at — the anchor of the umbrella",
      iface: { commands: ["/masterlink", "/umbrella", "/relay", "/market"], endpoints: [] },
      cgn: { net: "phoenix-rising-ai-solutions", role: "master" },
      measured: { files: 279, bytes: 19047403, at: "2026-09-24" },
      notes: "The master of the family. Its master-link card SRC/master-link.json ships with the next save; the canonical pull URL (editable.uploads.dev/file/<this-generator>/master-link) is written the moment the platform's human-verification passes or the generator is saved — until then the refusal anti_bot_verification_needed is printed verbatim, never hidden."
    },
    {
      id: "family.webapp", family: "family", kind: "generator", role: "webdev",
      name: "OBI CLONE-Web-Dev — the web station", status: "live",
      url: "https://perchance.org/phoenix-rising-ai-solutions-agent99-webapp", noProbe: true,
      tagline: "the build division's station — sites, dashboards, client tools",
      iface: { commands: ["/umbrella", "/masterlink", "/build", "/site"], endpoints: [] },
      cgn: { net: "phoenix-rising-ai-solutions", role: "webdev" },
      measured: { files: 236, bytes: 16612832, at: "2026-09-24" },
      notes: "Named and read on 2026-09-24. It is the station that established the pull lane: its own card is published at editable.uploads.dev/file/phoenix-rising-ai-solutions-agent99-webapp/master-link (read 200 OK, 1,028 B, in this browser). Its src/mastersync.js already lists this station FIRST in DEFAULT_MASTERS (phoenix-rising-ai-solutions-agent99-mastermind), ahead of the unfound mastercommand."
    },
    {
      id: "family.gamingcommand", family: "family", kind: "generator", role: "gaming",
      name: "Gaming Command — the games station", status: "live",
      url: "https://perchance.org/phoenix-rising-ai-solutions-agent99-gamingcommand", noProbe: true,
      tagline: "the Gaming division's station — its first product is a Roblox experience, code-complete and not yet published",
      iface: { commands: ["/umbrella", "/gamedivision", "/heartbeat", "/masterlink"], endpoints: [] },
      cgn: { net: "phoenix-rising-ai-solutions", role: "gaming" },
      measured: { files: 244, bytes: 18468102, at: "2026-09-24" },
      notes: "FOUND 2026-09-24 after the family's own ORD-1 (src/SESSIONS/umbrella-orders.md) — the name had never been probed. It carries the modules the master's own tree does NOT: src/gamedivision.js (48,199 B, window.ObiGameDivision — reads the Roblox build 'Train 6-7 — Survive a Brainrot' from the public monorepo), src/umbrella.js (27,388 B), src/heartbeat.js (26,704 B, Cloudflare time), src/mastermind.js (24,428 B) and cloudflare/FINDINGS.json. Named under this station's umbrella (244 files · 18,468,102 B) and its ORD-1 was answered and closed on 2026-09-24."
    },
    {
      id: "family.mastercommand", family: "family", kind: "generator", role: "ghost",
      name: "mastercommand — the ghost the family synced to", status: "planned",
      url: null, plannedUrl: "https://perchance.org/phoenix-rising-ai-solutions-mastercommand", noProbe: true,
      tagline: "a name on a 30-second timer that does not exist",
      iface: { commands: [], endpoints: [] },
      cgn: null,
      notes: "MEASURED UNFOUND on perchance.org/api/getGeneratorsAndDependencies, 2026-09-24 (the gaming station's own FINDINGS.json records the same, RECON.001: a sweep that finds nothing has not proven absence). Every station in the family auto-synced to this name. Its replacement is family.mastermind: the family syncs to the LIVE master."
    },

    /* ------------------------------ SERVICES ------------------------------- */
    {
      id: "svc.host", family: "services", kind: "build", role: "host",
      name: "Self-hosted station (Cloudflare)", status: "ready",
      url: null, plannedUrl: "https://<name>.<subdomain>.workers.dev",
      tagline: "the same app, on the sovereign's own account: unrestricted, untracked, private",
      iface: { commands: [], endpoints: ["POST /api/text", "POST /api/image", "POST /api/fetch", "POST /api/upload", "POST /api/editable", "WS /api/tunnel"] },
      cgn: null,
      scaffold: "src/cloudflare/ (worker.js · tunnel-do.js · store-do.js · ob1-shim.js · build.mjs)",
      needs: ["npx wrangler login", "npm run deploy", "npx wrangler secret put DEEPGRAM_API_KEY"],
      notes: "Verified by running it: every plugin API the app uses is shimmed, the tunnel's drone tables are byte-identical, the Deepgram key lives in a Worker secret. Deploying it needs the sovereign's account — nothing else."
    },
    {
      id: "svc.soul", family: "services", kind: "worker", role: "vault",
      name: "soul-logger — the authoritative vault", status: "live",
      url: "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count",
      expect: "session_id",
      tagline: "the one place the raw words are counted, per session, by law",
      iface: { commands: [], endpoints: ["GET /health", "GET /api/soul/count?session_id=", "POST /api/soul/extract"] },
      cgn: null,
      host: "Cloudflare Worker + D1 `soul-archive`",
      notes: "Aggregate SOULCOUNT is banned there by doctrine (L31/L32) — an unauthenticated count returns 400 'session_id required'. That 400 is the gate WORKING, not a failure."
    },
    {
      id: "svc.tunnel", family: "services", kind: "service", role: "tunnel",
      name: "PhoenixCommand tunnel", status: "live",
      url: null,
      tagline: "the always-on command queue every piece can send orders through",
      iface: { commands: ["/queue", "/route <task>"], endpoints: ["send", "history", "claim", "complete", "fail", "status"] },
      cgn: null,
      host: "perchance server-plugin (now) · TunnelDO (self-hosted)",
      notes: "Same six RPCs, same drone classification tables, same 500-command window on both hosts — the port is byte-identical, so a command classifies identically whichever host serves it."
    },
    {
      id: "svc.mesh", family: "services", kind: "service", role: "mesh",
      name: "CGN — the mesh", status: "scaffold",
      url: null,
      tagline: "the network that makes many generators one organism",
      iface: { commands: ["/netjoin <net>", "/netadd <gen> <role>", "/netsync", "/network", "/netrole", "/netkey"], endpoints: [] },
      cgn: { net: "obi-network", role: "anchor" },
      needs: ["/netjoin obi-network on the station (creates the hub in ITS namespace)", "point src/cgn-node.js CONFIG.anchorName at the real anchor generator name", "open each node generator once so it writes its node file"],
      notes: "Written and tested, but NOT JOINED: no hub file exists (404 at both plausible anchor names), and this browser holds no CGN state. Known integration bug to fix first — cgn-node.js defaults to anchorName 'obi', and no generator named 'obi' exists on perchance. The anchor's real name must be agreed and set in one place."
    },
    {
      id: "svc.canon", family: "services", kind: "repo", role: "canon",
      name: "Canon — the private repo", status: "live",
      url: "https://github.com/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-",
      tagline: "the laws, the field guide, the death seal — the doctrine every piece obeys",
      iface: { commands: ["/canon", "/gh backup", "/fieldguide"], endpoints: [] },
      cgn: null,
      host: "GitHub (private)",
      needs: ["nothing to READ it — a write-scoped PAT is held and proven; a WRITE still needs PHOENIXOMEGAPROTOCOL armed (/phoenixomegaprotocol)"],
      notes: "MEASURED 2026-09-26, live: the stored PAT opens it — /gh test reports PRIVATE · default master · push=true · admin=true · 12 branches · newest commit 6984675c. This row said “held nowhere right now” while the station held the credential and was using it — corrected. src/canon/ holds the fetched docs (LFG · GOSPEL-999 · the death seal); the open monorepo is readable with no token at all (/git)."
    },
    {
      id: "svc.cf", family: "services", kind: "account", role: "host-account",
      name: "Cloudflare account", status: "live",
      url: null,
      tagline: "where every public piece is actually hosted",
      iface: { commands: ["/cf status", "/cf deploy"], endpoints: [] },
      cgn: null,
      needs: ["nothing to READ the account — the token is held and proven (/cf status · /cf r2); a deploy is one command (/cf deploy <name>)"],
      notes: "MEASURED 2026-09-26, live: /cf status reaches account 3c7b1766…ea and lists 23 Worker scripts, and the R2 S3 key pair passes its own signed test. The earlier full scan (recorded in the I-LOG) read 20 Workers, 10 Pages, 2 D1, 8 KV, 0 zones. This row said “held nowhere right now” while the station held the credential — corrected."
    }
  ];

  function rows(){ return PIECES.map(p => Object.assign({}, p)); }
  function get(id){
    const q = String(id || "").trim().toLowerCase();
    if(!q) return null;
    return PIECES.find(p => p.id === q) || PIECES.find(p => p.id.indexOf(q) !== -1) || PIECES.find(p => p.name.toLowerCase().indexOf(q) !== -1) || null;
  }
  function coverage(){
    const out = { total: PIECES.length, live:0, ready:0, scaffold:0, planned:0, blocked:0, retired:0, byFamily:{} };
    for(const k in F) out.byFamily[k] = { name:F[k].name, icon:F[k].icon, why:F[k].why, total:0, live:0 };
    for(const p of PIECES){ out[p.status]++; out.byFamily[p.family].total++; if(p.status === "live") out.byFamily[p.family].live++; }
    out.pct = Math.round(((out.live + out.ready) / out.total) * 100);
    return out;
  }
  /* every piece that claims a URL we can actually touch. `noProbe` pieces are
     excluded on purpose: the family stations ARE live, but they are proven by the
     content-key read channel (a manifest call), not by superFetching ~880 KB of
     perchance.org page on every sweep. */
  function probeTargets(){
    return PIECES.filter(p => p.url && /^https?:/i.test(p.url) && !p.noProbe).map(p => ({ id:p.id, url:p.url, expect:p.expect || null, status:p.status }));
  }

  window.ObiConstellation = { F, STATUS, PIECES, rows, get, coverage, probeTargets };

  /* the scout's `pieces` probe lives with the data (same as the ecosystem probe) */
  if(window.ObiScout){
    window.ObiScout.hooks.constellation = async () => {
      const targets = probeTargets();
      const rowsOut = [], cache = [];
      let live = 0, dead = 0;
      for(const t of targets){
        try{
          const r = await window.root.superFetch(t.url, { headers: { "User-Agent": "ObiConstellation/1" } });
          const body = await r.text();
          const hit = !t.expect || body.indexOf(t.expect) !== -1;
          /* a gate that answers 400 ON PURPOSE (e.g. soul-logger refusing an
             unauthenticated aggregate count) is the piece working, not drifting —
             same reading the scout's `fleet` probe applies. */
          const gated = r.status === 400 && hit;
          const ok = (r.status === 200 || gated) && hit;
          if(ok) live++; else dead++;
          rowsOut.push([t.id, (ok ? (gated ? "LIVE (" + r.status + " as designed)" : "LIVE") : "DRIFT") + " · HTTP " + r.status, body.length + " B" + (t.expect ? " · marker \"" + t.expect + "\" " + (hit ? "present" : "ABSENT") : "")]);
          cache.push(["piece:" + t.id, ok]);
        }catch(e){
          dead++;
          rowsOut.push([t.id, "DEAD", String(e.message).slice(0, 110)]);
          cache.push(["piece:" + t.id, false]);
        }
      }
      const rest = PIECES.filter(p => !targets.some(t => t.id === p.id));
      if(rest.length) rowsOut.push([rest.length + " piece(s) with no URL to touch", "NOT PROBED", rest.map(p => p.id + " (" + p.status + ")").join(" · ")]);
      return {
        verdict: dead === 0 ? "LIVE" : (live ? "DRIFT" : "DEAD"),
        summary: live + "/" + targets.length + " constellation pieces answering" + (dead ? " · " + dead + " unreachable or drifted" : ""),
        rows: rowsOut, cache
      };
    };
  }
})();
