/* ============================================================================
   THE ROLE BUILDER — src/generators/role-kit/build.js        (v1 · 2026-09-22)

   Compose every role's `index.html` out of its three sources:

       role-kit/kit.js        the family kit      (theme · store · record · import/export · shell)
       role-kit/method.js     the tape's tables   (the promises · the 44 sounds · the bank · the CV rows)
       <role>/src/panel.js    the role's own logic

   WHY A BUILDER AT ALL. Each role is meant to be pasted into a perchance
   generator as TWO files (`main.pjs` + `index.html`) with no runtime fetch and
   no src/ step — so the shared code has to be inlined. Inlining by hand across
   twelve roles is how a family drifts; this composes them all from one kit.

   RUN IT (no node needed — any context with the two file functions):

       const { buildRoles } = await import("./src/generators/role-kit/build.js");
       await buildRoles({ readTextFile, writeTextFile });        // all roles
       await buildRoles({ readTextFile, writeTextFile }, ["cv-forge"]);   // just one

   The workspace's own agent runs exactly this through its worker's `fs`.
   Re-run it after ANY edit to kit.js, method.js or a role's panel.js.
   ========================================================================== */

export const ROLES = [
  { slug: "cv-forge",           name: "THE CV",                     panel: "cv-forge" },
  { slug: "linkedin-forge",     name: "THE LINKEDIN",               panel: "linkedin-forge" },
  { slug: "headshot-brief",     name: "THE HEADSHOT",               panel: "headshot-brief" },
  { slug: "portfolio-intake",   name: "THE PORTFOLIO",              panel: "portfolio-intake" },
  { slug: "phonics-44",         name: "THE 44",                     panel: "phonics-44" },
  { slug: "presentation-coach", name: "THE WEEKLY PRESENTATION",    panel: "presentation-coach" },
  { slug: "application-board",  name: "THE APPLICATIONS",           panel: "application-board" },
  { slug: "interview-drill",    name: "THE INTERVIEW",              panel: "interview-drill" },
  { slug: "umbrella-brand",     name: "THE UMBRELLA",               panel: "umbrella-brand" },
  { slug: "presence-plan",      name: "THE PRESENCE",               panel: "presence-plan" },
  { slug: "work-credit",        name: "THE CREDIT",                 panel: "work-credit" },
  { slug: "idea-lists",         name: "THE LISTS",                  panel: "idea-lists" }
];

const HEADER = (r) => `<!-- ============================================================================
     ${r.name} \u2014 src/generators/${r.slug}/index.html
     GENERATED \u2014 do not hand-edit. Built by src/generators/role-kit/build.js from:
       1  src/generators/role-kit/kit.js      the family kit: theme \u00b7 store \u00b7 record \u00b7 import/export \u00b7 shell
       2  src/generators/role-kit/method.js   the tape's tables: the promises \u00b7 the 44 sounds \u00b7 the bank \u00b7 the CV rows
       3  src/generators/${r.slug}/src/panel.js   this role's own logic

     THE PASTE RECIPE \u2014 two files, nothing else:
       1.  main.pjs    \u2192 paste into the new generator's main.pjs
       2.  index.html  \u2192 paste into the new generator's index.html
     Nothing is fetched at runtime and the page opens offline. The record lives in
     this browser (kv with the kv-plugin, localStorage without it) and never in
     the public source. The deep link is ?student=<name>.
     ============================================================================ -->
<div id="okRoot"></div>
`;

const PART = (n, title, body) => `
<script>
/* ==================== ${n} \u00b7 ${title} ==================== */
${body}
</script>
`;

export async function buildRoles(fs, only) {
  const want = only && only.length ? ROLES.filter((r) => only.indexOf(r.slug) >= 0) : ROLES;
  const kit = await fs.readTextFile("src/generators/role-kit/kit.js");
  const method = await fs.readTextFile("src/generators/role-kit/method.js");
  const out = [];
  for (const r of want) {
    let panel;
    try {
      panel = await fs.readTextFile("src/generators/" + r.slug + "/src/panel.js");
    } catch (e) {
      out.push({ role: r.slug, skipped: "no src/panel.js yet" });
      continue;
    }
    const html = HEADER(r)
      + PART(1, "THE ROLE KIT \u2014 the family", kit)
      + PART(2, "THE METHOD \u2014 the tape's tables", method)
      + PART(3, "THE ROLE: " + r.name, panel);
    await fs.writeTextFile("src/generators/" + r.slug + "/index.html", html);
    out.push({ role: r.slug, bytes: html.length, lines: html.split("\n").length });
  }
  return out;
}
