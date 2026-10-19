#!/usr/bin/env node
/* ==========================================================================================
   Builds dist/ for Cloudflare out of the generator's OWN sources.

   The point is that there is exactly one copy of app.js / transcribe.js / … in the repo: the
   perchance build loads them from src/, and this script copies those same bytes into dist/.
   Edit the app in the editor and both builds follow.

   AUDIT 2026-09-21: this script used to copy a hand-written list of 15 module files and
   nothing else. By then the generator had 24 modules and a data tree (curriculum JSON, brand
   assets, canon copies, lesson specs) — so a deploy built this way 404'd nine
   <script src="src/…"> tags (brand, divisions, vault, lessons, lesson-forge, freephoenix,
   curriculum, savewatch) and every data file, and the station booted degraded. The list can
   no longer drift: the WHOLE src/ tree is copied (minus src/cloudflare itself, which holds
   dist/), and the build then ASSERTS that every script index.html asks for is present.

   Run:  node build.mjs        (or: npm run build / npm run deploy)
   ========================================================================================== */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));   // …/src/cloudflare
const ROOT = path.resolve(HERE, "..", "..");                 // workspace root
const SRC = path.join(ROOT, "src");
const DIST = path.join(HERE, "dist");

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

/* 1 — the app's whole source tree, byte for byte. Never list modules by hand again: a
       hand-written list is exactly what went stale. src/cloudflare is skipped (it contains
       dist/, so copying it would recurse). */
const rel = p => path.relative(SRC, p).split(path.sep);
fs.cpSync(SRC, path.join(DIST, "src"), {
  recursive: true,
  filter: s => rel(s)[0] !== "cloudflare"
});

/* 1b — the PANEL, so the self-forge can read its whole self off-perchance too
        (on perchance main.pjs comes from the platform API; here it is a file). */
fs.copyFileSync(path.join(ROOT, "main.pjs"), path.join(DIST, "main.pjs"));

/* 2 — the perchance shim */
for(const f of ["ob1-shim.js", "ob1-patch.js"]) fs.copyFileSync(path.join(HERE, "public", f), path.join(DIST, f));

/* 3 — index.html: drop the perchance server-plugin block, load the shim instead.
       The shim goes before the FIRST of the app's own scripts, so every one of them (the kernel,
       the playbooks, scout, the evaluator, app.js itself) sees `root` already defined. */
let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const before = html.length;
html = html.replace(/<script type="text\/x-server-plugin">[\s\S]*?<\/script>\s*/i, "");
if(html.length === before) throw new Error("build: could not find the <script type=\"text/x-server-plugin\"> block in index.html");
const firstApp = html.match(/<script src="src\/[^"]+"><\/script>/);
if(!firstApp) throw new Error("build: could not find any <script src=\"src/…\"> tags in index.html");
html = html.replace(firstApp[0], '<script src="/ob1-shim.js"></script>\n' + firstApp[0]);
html = html.trimEnd() + '\n<script src="/ob1-patch.js"></script>\n';
fs.writeFileSync(path.join(DIST, "index.html"), html);

/* 3b — ASSERT the build is whole: every script the page asks for must exist in dist/.
        This is the check whose absence let the 15-file list drift for months. */
const wanted = [...html.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)].map(m => m[1]);
const absent = wanted.filter(p => !fs.existsSync(path.join(DIST, p)));
if(absent.length) throw new Error("build: index.html loads scripts that are not in dist/ — " + absent.join(", "));

/* 4 — "untracked": no analytics, nothing injected, and tell crawlers to stay away */
fs.writeFileSync(path.join(DIST, "robots.txt"), "User-agent: *\nDisallow: /\n");
fs.writeFileSync(path.join(DIST, "_headers"), "/*\n  X-Robots-Tag: noindex, nofollow\n  Referrer-Policy: no-referrer\n");
fs.writeFileSync(path.join(DIST, "favicon.svg"),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#12141c"/>' +
  '<text x="16" y="22" font-size="16" text-anchor="middle" fill="#c9a227">◈</text></svg>\n');

const n = fs.readdirSync(DIST, { recursive: true }).length;
console.log(`obi-cloudflare: built dist/ (${n} entries · ${wanted.length} scripts verified) from ${path.relative(process.cwd(), ROOT) || "."}`);
console.log("next:  npx wrangler deploy");
