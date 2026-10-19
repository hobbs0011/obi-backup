/* ============================================================================
   THE REGISTER PASS (src/tools/register-pass.mjs) — the census, reproducible.

   src/sites/mailala/ASSET-MANIFEST.md documented the recipe for rebuilding the
   register, and said it was "reproducible byte-for-byte". It was not: the pass
   that produced the register lived in a session's scratch space, so a session
   that came later could read the recipe and not run it. This file IS the recipe,
   as code, kept in the estate so the census can always be rebuilt from the bytes.

   IT DOES NOT RUN IN THE PAGE. It is a module for a WORKER WITH THE WORKSPACE
   MOUNTED — the agent's own tool, or any future session's. That is exactly what
   the recipe in ASSET-MANIFEST.md §F describes: a Worker that can `readFile` the
   workspace and holds WebCrypto. Usage:

       const { registerPass } = await import("./src/tools/register-pass.mjs");
       const out = await registerPass({
         read: p => fs.readFile(p),          // Uint8Array for a workspace path
         why: "the human rationale for this pass — what changed and why",
       });
       await fs.writeTextFile("src/sites/mailala/ASSET-MANIFEST.json", out.json);
       await fs.writeTextFile("src/sites/mailala/ASSET-MANIFEST.md",   out.md);

   The pass MEASURES and BUILDS. It does not write anything itself: the write is
   the caller's (a save, or the agent's fs). It returns the two file texts and a
   row-for-row account of what it changed, so nothing about this is a claim.

   THE RULES, unchanged from the recipe and enforced here:
     1. The declared tree is `SRC_SNAPSHOT` out of src/app.js, minus the four
        delivery documents (a self-describing document cannot enumerate itself).
        `main.pjs` and `index.html` are not declared at all, so they are not in
        the census either — the same rule src/relay.js applies in declaredTree().
     2. Every declared file is hashed over its exact bytes, sorted by path.
     3. The tree digest is SHA-256 over the sorted "<path> <sha256>" lines joined
        by "\n" — the recipe the relay's CENSUS stage rebuilds and compares.
     4. byTopLevel: a file directly under src/ is its own row; anything deeper is
        aggregated as "src/<dir>/**", in the order the sorted files first create
        each bucket (which is why "src/brand.js" precedes "src/brand/**").
     5. Asset rows with a local path are re-hashed; rows flagged `inDocument`
        (MK-01, SD-01) are SKIPPED by rule — their digest is over a block inside
        a page, not over the page file. Rows with no local path (the fonts, the
        map) pin a snapshot they fetched and are not re-fetched here.
     6. `self.md` is written from the markdown this pass builds, and the JSON is
        written from itself — a file cannot carry its own digest, which is the
        one declared gap, in `excluded`.
     7. The date is the LOCAL date (Asia/Bangkok) of the machine that runs it.
   ========================================================================== */

export const VERSION = "1.0.0";

export const DELIVERY_DOCS = [
  "src/sites/mailala/ASSET-MANIFEST.md",
  "src/sites/mailala/ASSET-MANIFEST.json",
  "src/sites/mailala/SYNC-PACKET.md",
  "src/sites/mailala/SYNC-PACKET.json"
];

export const REGISTER_JSON = "src/sites/mailala/ASSET-MANIFEST.json";
export const REGISTER_MD   = "src/sites/mailala/ASSET-MANIFEST.md";
export const APP_JS        = "src/app.js";

const enc = new TextEncoder();
const dec = new TextDecoder();
const hex = (b) => Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
const toBytes = (v) => (typeof v === "string") ? enc.encode(v) : new Uint8Array(v);

export async function sha256(v){
  const b = toBytes(v);
  return hex(await crypto.subtle.digest("SHA-256", b));
}

/* rule 1 — the declared tree, read out of the array literal in src/app.js. The
   array is a plain JSON-ish literal of string paths, so it is read by slicing
   between the brackets and testing each quoted run — no eval, no execution of
   the station's code. */
export function readDeclaredTree(appSource){
  const start = appSource.indexOf("const SRC_SNAPSHOT");
  if(start === -1) throw new Error("SRC_SNAPSHOT is not in src/app.js — the census cannot be enumerated");
  const open = appSource.indexOf("[", start);
  if(open === -1) throw new Error("SRC_SNAPSHOT has no array literal");
  let depth = 0, i = open, close = -1, inStr = false, q = "";
  for(; i < appSource.length; i++){
    const c = appSource[i];
    if(inStr){ if(c === "\\"){ i++; continue; } if(c === q) inStr = false; continue; }
    if(c === '"' || c === "'"){ inStr = true; q = c; continue; }
    if(c === "/" && appSource[i + 1] === "/"){ while(i < appSource.length && appSource[i] !== "\n") i++; continue; }
    if(c === "/" && appSource[i + 1] === "*"){ i = appSource.indexOf("*/", i) + 1; continue; }
    if(c === "[") depth++;
    else if(c === "]"){ depth--; if(depth === 0){ close = i; break; } }
  }
  if(close === -1) throw new Error("SRC_SNAPSHOT's array literal never closed");
  const body = appSource.slice(open + 1, close);
  const paths = [];
  const re = /"([^"]+)"/g;
  let m;
  while((m = re.exec(body))) paths.push(m[1]);
  const declared = paths.filter((p) => /^src\//.test(p) && !DELIVERY_DOCS.includes(p));
  const dupes = declared.filter((p, n) => declared.indexOf(p) !== n);
  return { declared, dupes, all: paths };
}

/* rule 2/3/4 — hash every declared file, sum, digest, bucket. */
export async function hashTree(declared, read){
  const files = [], failed = [];
  for(const path of declared){
    try{
      const buf = await read(path);
      if(buf == null) throw new Error("unreadable");
      const b = toBytes(buf);
      files.push({ path, bytes: b.length, sha256: await sha256(b) });
    }catch(e){ failed.push({ path, why: String((e && e.message) || e) }); }
  }
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const bytes = files.reduce((n, f) => n + f.bytes, 0);
  const treeDigestSha256 = files.length
    ? await sha256(files.map((f) => f.path + " " + f.sha256).join("\n"))
    : null;
  const byTopLevel = {};
  for(const f of files){
    const rest = f.path.slice(4);                       /* past "src/" */
    const key = rest.indexOf("/") === -1 ? f.path : ("src/" + rest.split("/")[0] + "/**");
    if(!byTopLevel[key]) byTopLevel[key] = { files: 0, bytes: 0 };
    byTopLevel[key].files++;
    byTopLevel[key].bytes += f.bytes;
  }
  return { files, failed, count: files.length, bytes, treeDigestSha256, byTopLevel };
}

/* the diff that names what moved — the pass states the change list itself rather
   than leaving the next reader to work it out. */
export function diffEstate(recorded, census){
  const was = new Map(((recorded && recorded.files) || []).map((f) => [f.path, String(f.sha256)]));
  const now = new Map(census.files.map((f) => [f.path, f.sha256]));
  const added = census.files.filter((f) => !was.has(f.path));
  const changed = census.files.filter((f) => was.has(f.path) && was.get(f.path) !== f.sha256);
  const removed = ((recorded && recorded.files) || []).filter((f) => !now.has(f.path));
  return {
    added: added.map((f) => f.path), changed: changed.map((f) => f.path), removed: removed.map((f) => f.path),
    countWas: recorded ? recorded.count : null, countNow: census.count,
    bytesWas: recorded ? recorded.bytes : null, bytesNow: census.bytes,
    treeWas: recorded ? recorded.treeDigestSha256 : null, treeNow: census.treeDigestSha256,
    matches: !!(recorded && recorded.count === census.count && recorded.bytes === census.bytes && recorded.treeDigestSha256 === census.treeDigestSha256
      && !added.length && !changed.length && !removed.length)
  };
}

/* rule 7 — the local date of the machine running the pass. */
function localDate(d){
  try{
    const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" });
    return f.format(d);                                  /* en-CA gives YYYY-MM-DD */
  }catch(e){ return d.toISOString().slice(0, 10); }
}

const fmt = (n) => Number(n).toLocaleString("en-US");

/* rule 4 — section G, regenerated: ONLY the headline's numbers and the table rows.
   Everything else in the section (and in sections H and I that follow it) is left
   byte-for-byte alone. The first version of this pass ended the block at the next
   `---` and swallowed section H and the recipe in section I — 38 lines of the
   register destroyed by a boundary rule that guessed. The boundary is the next
   `## ` heading, and the table is found by its own header line; if either is
   missing the pass THROWS rather than rewriting a document it cannot read. */
function rebuildSectionG(md, census){
  const head = "## G · The estate — every shipped file under `src/`";
  const at = md.indexOf(head);
  if(at === -1) throw new Error("section G's heading is not in the markdown — the pass refuses to guess where the table goes");
  const afterHead = md.indexOf("\n", at) + 1;
  const nextHeading = md.indexOf("\n## ", afterHead);
  if(nextHeading === -1) throw new Error("section G has no following `## ` heading — the pass will not rewrite to the end of the file and risk swallowing the sections after it");
  const section = md.slice(afterHead, nextHeading);
  const tableHead = "| area | files | bytes |";
  const tAt = section.indexOf(tableHead);
  if(tAt === -1) throw new Error("section G's table header (`| area | files | bytes |`) is not there — refusing to guess");
  const rowsAt = section.indexOf("\n", section.indexOf("\n", tAt) + 1) + 1;   /* past the header and the |---| rule */
  const rowsEnd = section.indexOf("\n## ", rowsAt) === -1 ? section.length : section.indexOf("\n## ", rowsAt);
  const newRows = Object.keys(census.byTopLevel).map((k) => "| `" + k + "` | " + census.byTopLevel[k].files + " | " + fmt(census.byTopLevel[k].bytes) + " |\n").join("");
  const newSection = section.slice(0, rowsAt) + newRows + section.slice(rowsEnd);
  const head2 = "\n**" + fmt(census.count) + " files · " + fmt(census.bytes) + " B (" + fmt(Math.round(census.bytes / 1024)) + " KB) · tree digest `" + census.treeDigestSha256 + "`**";
  const withHead = newSection.replace(/\n\*\*[\d,]+ files · [\d,]+ B \([\d,]+ KB\) · tree digest `[0-9a-f]*`\*\*/, head2);
  if(withHead === newSection && !new RegExp("\\*\\*" + fmt(census.count) + " files").test(newSection))
    throw new Error("section G's headline line was not found by its shape — refusing to leave a stale count in place");
  return md.slice(0, afterHead) + withHead + md.slice(nextHeading);
}

/* rule 5 / 7 — the asset rows, rewritten by VALUE and never by position.
   The register's tables are not shaped alike: section A ends in `bytes | SHA-256`,
   section B ends in `bytes | SHA-256 | state`. So a rule that says "the last two
   cells" would corrupt section B. This finds the row by its ID (tolerating the
   bold markers the markdown uses), then replaces the cell that HOLDS the old bytes
   and the cell that HOLDS the old digest. A row whose old value cannot be found is
   reported and left exactly as it was. */
function patchAssetRows(md, assets, hashes){
  const rows = [];
  let out = md;
  for(const a of assets){
    if(!a.local) continue;
    if(a.inDocument){ rows.push({ id: a.id, state: "SKIPPED BY RULE", note: "in-document digest (over a block inside the page, not the page file)" }); continue; }
    const h = hashes.get(a.local);
    if(!h){ rows.push({ id: a.id, state: "NOT FOUND", note: a.local + " could not be read in this pass — its row is left exactly as it was" }); continue; }
    const idRe = a.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const lineRe = new RegExp("^\\|\\s*\\**\\s*" + idRe + "\\s*\\**\\s*\\|[^\\n]*$", "m");
    const m = lineRe.exec(out);
    if(!m){ rows.push({ id: a.id, state: "NO ROW IN MD", note: a.local + " — the machine copy carries this asset and the markdown has no row for it" }); continue; }
    let line = m[0];
    const before = line;
    const oldSha = String(a.sha256 || "");
    const oldBytes = Number(a.bytes);
    let shaHits = 0, byteHits = 0;
    if(oldSha){ const t = line.split("`" + oldSha + "`"); shaHits = t.length - 1; if(shaHits) line = t.join("`" + h.sha256 + "`"); }
    if(Number.isFinite(oldBytes)){
      for(const cand of [fmt(oldBytes), String(oldBytes)]){
        if(line.indexOf(cand) !== -1){ const t = line.split(cand); byteHits = t.length - 1; line = t.join(fmt(h.bytes)); break; }
      }
    }
    const moved = (oldBytes !== h.bytes) || (oldSha !== h.sha256);
    if(line === before){
      rows.push({ id: a.id, state: moved ? "MOVED, ROW NOT REWRITTEN" : "MATCHED", note: a.local + (moved ? " — the bytes moved but neither the old digest nor the old length appears in the row, so nothing was guessed at" : " — the row already carries these bytes and this digest") });
      continue;
    }
    out = out.replace(before, line);
    rows.push({ id: a.id, state: moved ? "MOVED" : "MATCHED", note: a.local + " · " + fmt(h.bytes) + " B · " + h.sha256.slice(0, 12) + "…" + (moved ? " (was " + fmt(oldBytes) + " B · " + oldSha.slice(0, 12) + "…; " + byteHits + " length cell + " + shaHits + " digest cell rewritten)" : "") });
  }
  return { md: out, rows };
}

/* the whole pass. `read` is the caller's reader; `why` is the human rationale,
   which the pass keeps and prefixes with the change list it measured itself. */
/* ============================================================================
   THE PACKET PASS (same file — the delivery is one act, so one instrument)

   The register and the packet are ONE delivery: the register states the estate,
   the packet addresses it to a node. So a register pass that moves the census and
   leaves the packet quoting the old one has produced a delivery that contradicts
   itself — which is exactly what had happened: the packet's `register` block, its
   `registerUrls` block (a pass behind, even), its census headline and its CENSUS
   row all still carried the numbers of an earlier edition.

   THIS DOES NOT REWRITE THE PACKET'S PROSE. It replaces FACTS BY VALUE — the old
   register's URLs, its two digests, its two lengths, its census count, bytes and
   tree digest — and it reports every substitution with its count. A substitution
   whose anchor is absent is reported as not found; nothing is guessed at, and the
   history in the prose (the list of passes, the reasons) is APPENDED to, never
   overwritten. The one row it rewrites in full is the relay's own DELIVER row,
   because that row is a claim about the last run and the last run's words are
   known exactly.

   `packetPass({ read, addresses, why, delivernote })` →
     { json, md, rows, changed }
   ========================================================================== */

export const PACKET_JSON = "src/sites/mailala/SYNC-PACKET.json";
export const PACKET_MD   = "src/sites/mailala/SYNC-PACKET.md";

export async function packetPass({ read, addresses, why, delivernote }){
  if(typeof read !== "function") throw new Error("packetPass needs { read }");
  if(!addresses || !addresses.json || !addresses.md)
    throw new Error("packetPass needs { addresses: { json:{url,sha256,bytes}, md:{url,sha256,bytes} } } — the packet will not name an address that was not measured");
  const dec2 = new TextDecoder();
  const t0 = Date.now();
  const rows = [], changed = [];

  const reg = JSON.parse(dec2.decode(toBytes(await read(REGISTER_JSON))));
  const estate = reg.estate || {}, self = reg.self || {};
  if(estate.count == null || !estate.treeDigestSha256) throw new Error("the register in the tree carries no census — run registerPass first; the packet is never handed a guess");

  const j = JSON.parse(dec2.decode(toBytes(await read(PACKET_JSON))));
  const origJsonText = dec2.decode(toBytes(await read(PACKET_JSON)));
  let md = dec2.decode(toBytes(await read(PACKET_MD)));
  const origMd = md;
  const old = {
    json: (j.register && j.register.json) || null, md: (j.register && j.register.md) || null,
    count: j.register ? j.register.censusFiles : null, bytes: j.register ? j.register.censusBytes : null,
    tree: j.register ? j.register.treeDigestSha256 : null
  };

  /* ---- the substitutions, by VALUE. Each is counted; an anchor that is absent is
     reported, never guessed at. ---- */
  const subs = [];
  if(old.json && old.json.url) subs.push({ what:"the register .json URL", from: old.json.url, to: addresses.json.url });
  if(old.md && old.md.url)     subs.push({ what:"the register .md URL",   from: old.md.url,   to: addresses.md.url });
  if(old.json && old.json.sha256) subs.push({ what:"the register .json digest", from: old.json.sha256, to: addresses.json.sha256 });
  if(old.md && old.md.sha256)     subs.push({ what:"the register .md digest",   from: old.md.sha256,   to: addresses.md.sha256 });
  if(old.json && old.json.bytes != null) subs.push({ what:"the register .json length", from: fmt(old.json.bytes), to: fmt(addresses.json.bytes) });
  if(old.md && old.md.bytes != null)     subs.push({ what:"the register .md length",   from: fmt(old.md.bytes),   to: fmt(addresses.md.bytes) });
  if(old.tree)  subs.push({ what:"the tree digest", from: old.tree, to: estate.treeDigestSha256 });
  if(old.count != null) subs.push({ what:"the census count", from: old.count + " files", to: estate.count + " files" });
  if(old.bytes != null) subs.push({ what:"the census bytes", from: fmt(old.bytes), to: fmt(estate.bytes) });
  if(old.bytes != null) subs.push({ what:"the census bytes (bare)", from: String(old.bytes), to: String(estate.bytes) });

  for(const s of subs){
    if(!s.from || s.from === s.to) continue;
    const jHits = JSON.stringify(j).split(s.from).length - 1;
    const mHits = md.split(s.from).length - 1;
    if(jHits || mHits) changed.push({ what: s.what, json: jHits, md: mHits, to: s.to });
    else rows.push({ what: s.what, state: "NOT PRESENT", note: "the packet does not carry `" + String(s.from).slice(0, 40) + "…` — nothing to replace" });
    md = md.split(s.from).join(s.to);
  }
  /* the JSON is a structure, so the same facts are set as FIELDS as well: text
     substitution cannot reach a number, and a field left stale is the exact defect
     this pass exists to remove. */
  j.register = j.register || {};
  j.register.censusFiles = estate.count;
  j.register.censusBytes = estate.bytes;
  j.register.treeDigestSha256 = estate.treeDigestSha256;
  j.register.md = { bytes: addresses.md.bytes, sha256: addresses.md.sha256, url: addresses.md.url };
  j.register.json = { bytes: addresses.json.bytes, sha256: addresses.json.sha256, url: addresses.json.url };
  j.registerUrls = {
    "sites/mailala/ASSET-MANIFEST.json": addresses.json.url,
    "sites/mailala/ASSET-MANIFEST.md": addresses.md.url
  };
  if(j.estate && j.estate.census) j.estate.census = { files: estate.count, bytes: estate.bytes };

  /* the prose is APPENDED to, never rewritten — the history of passes is the point.
     BUT ONLY TERSE: the first edition of this function appended the caller's whole
     rationale here on every cycle, and a packet that grows 1.5 KB per delivery for
     repeating itself is debt, not history. The rationale's home is the register's own
     `revision.why`; this note keeps one measured line per pass. */
  if(typeof j.register.note === "string" && why)
    j.register.note = j.register.note.replace(/\s*$/, " ") + "THIS PASS — the register was re-run (" + fmt(estate.count) + " files · " + fmt(estate.bytes) + " B · tree " + String(estate.treeDigestSha256).slice(0, 12) + "…), re-delivered by digest, and every register fact in this packet was replaced with the measured one. The full rationale is the register's own revision.why.";
  if(typeof delivernote === "string" && delivernote){
    const line = md.match(/^\|\s*DELIVER\s*\|[^\n]*$/m);
    if(line){ md = md.replace(line[0], "| DELIVER | REAL | " + delivernote.replace(/\|/g, "\\|") + " |"); changed.push({ what: "the relay's DELIVER row", json: 0, md: 1, to: "REAL — re-stated in the relay's own words for the run that carried this edition" }); }
    else rows.push({ what: "the relay's DELIVER row", state: "NOT PRESENT", note: "no `| DELIVER |` row in the packet markdown — left alone" });
  }

  const stamp = new Date().toISOString();
  const day = localDate(new Date());
  /* `revision` DESCRIBES THE CURRENT EDITION, so it is rewritten, not appended: the
     register's own revision.why carries the running rationale, and the packet's
     register.note carries the pass history. Appending to both made every delivery
     carry its whole past twice. */
  j.generated = stamp;
  j.revision = { at: stamp, of: day,
    why: "this edition replaces the register's facts with the measured ones: census " + fmt(old.count) + " → " + fmt(estate.count) + " files, " + fmt(old.bytes) + " → " + fmt(estate.bytes) + " B, tree " + String(old.tree || "?").slice(0, 8) + " → " + String(estate.treeDigestSha256).slice(0, 8) + "; the register's own revision.why carries the full rationale and this packet's register.note carries every pass. The relay now runs COMPLETE: DELIVER aims the free wire (pointer written and READ BACK, broadcast on the nerve), so a shut mesh door and an absent cloud token no longer stop the family reaching this register — they are reported COVERED, NOT OPEN, and still say why. The published save is still the old one: nothing here is claimed as saved that was not saved." };

  const jsonText = JSON.stringify(j, null, 2) + "\n";
  rows.push({ what: "the packet (machine)", state: fmt(toBytes(jsonText).length) + " B", note: changed.length + " fact(s) replaced by measurement; the note keeps its history and gains this pass" });
  rows.push({ what: "the packet (human)", state: fmt(toBytes(md).length) + " B", note: "value-for-value; its prose history is appended to, never rewritten" });

  /* IDEMPOTENCE, the same rule as the register's: a pass that has nothing to correct
     must not append its own paragraph again, or a rerun would grow the packet for no
     reason and make the relay carry a document that says nothing new. */
  const realChanges = changed.filter((c) => (c.json || c.md));
  if(!realChanges.length){
    rows.push({ what: "THE PACKET", state: "UNCHANGED", note: "no register fact in the packet is stale and no address moved — the bytes that were already there are returned unchanged, with no new paragraph appended" });
    return { version: VERSION, ms: Date.now() - t0, changed: [], rows, json: origJsonText, md: origMd, unchanged: true };
  }
  return { version: VERSION, ms: Date.now() - t0, changed, rows, json: jsonText, md, unchanged: false };
}

/* ------------------------------------------------------------------------ */

export async function registerPass({ read, why, at }){
  if(typeof read !== "function") throw new Error("registerPass needs { read } — a function from a workspace path to bytes");
  const t0 = Date.now();
  const rows = [];

  const appSource = dec.decode(toBytes(await read(APP_JS)));
  const { declared, dupes } = readDeclaredTree(appSource);
  rows.push({ what: "the declared tree", state: declared.length + " paths", note: "SRC_SNAPSHOT out of src/app.js, minus the four delivery documents" });
  if(dupes.length) rows.push({ what: "DUPLICATE DECLARATIONS", state: String(dupes.length), note: dupes.join(" · ") + " — declared more than once, counted once here" });

  const census = await hashTree(declared, read);
  rows.push({ what: "hashed", state: fmt(census.count) + " files · " + fmt(census.bytes) + " B", note: census.failed.length ? "INCOMPLETE — " + census.failed.length + " unreadable: " + census.failed.map((f) => f.path).join(" · ") : "every declared file was read and digested over its exact bytes" });
  rows.push({ what: "the tree digest", state: String(census.treeDigestSha256).slice(0, 16) + "…", note: "SHA-256 over the sorted <path> <sha256> lines" });

  const json = JSON.parse(dec.decode(toBytes(await read(REGISTER_JSON))));
  const origJsonText = dec.decode(toBytes(await read(REGISTER_JSON)));
  const diff = diffEstate(json.estate, census);
  rows.push({ what: "against the register", state: diff.matches ? "THE SAME" : "MOVED", note: "was " + fmt(diff.countWas) + " files · " + fmt(diff.bytesWas) + " B · tree " + String(diff.treeWas || "").slice(0, 12) + "… ⇒ " + fmt(diff.countNow) + " files · " + fmt(diff.bytesNow) + " B · tree " + String(diff.treeNow).slice(0, 12) + "…" });
  if(diff.added.length)   rows.push({ what: "ADDED",   state: String(diff.added.length),   note: diff.added.join(" · ") });
  if(diff.changed.length) rows.push({ what: "CHANGED", state: String(diff.changed.length), note: diff.changed.join(" · ") });
  if(diff.removed.length) rows.push({ what: "REMOVED", state: String(diff.removed.length), note: diff.removed.join(" · ") });

  /* the asset rows, hashed once and used by both copies. */
  const clean = [];
  for(const a of json.assets){
    if(!a.local) continue;
    try{ const b = toBytes(await read(a.local)); clean.push({ a, bytes: b.length, sha256: await sha256(b) }); }
    catch(e){ clean.push({ a, error: String((e && e.message) || e) }); }
  }
  const hashes = new Map(clean.filter((c) => !c.error).map((c) => [c.a.local, { bytes: c.bytes, sha256: c.sha256 }]));
  for(const c of clean.filter((c) => c.error)) rows.push({ what: c.a.id, state: "UNREADABLE", note: c.a.local + " — " + c.error });

  /* the markdown first: its own digest is what the JSON's `self.md` records. */
  const origMd = dec.decode(toBytes(await read(REGISTER_MD)));
  let md = origMd;
  const g = rebuildSectionG(md, census);
  md = g;
  const patched = patchAssetRows(md, json.assets, hashes);
  md = patched.md;
  for(const r of patched.rows) rows.push({ what: r.id + " (md row)", state: r.state, note: r.note });
  const mdBytes = enc.encode(md).length;
  const mdSha = await sha256(md);

  /* the machine copy: the census, the totals, the asset rows, then itself. */
  const stamp = (at ? new Date(at) : new Date()).toISOString();
  const day = localDate(at ? new Date(at) : new Date());
  json.generated = stamp;
  json.estate.count = census.count;
  json.estate.bytes = census.bytes;
  json.estate.treeDigestSha256 = census.treeDigestSha256;
  json.estate.files = census.files;
  json.estate.byTopLevel = census.byTopLevel;
  json.totals.estateFiles = census.count;
  json.totals.estateBytes = census.bytes;
  json.totals.treeDigest = census.treeDigestSha256;
  let movedRows = 0;
  for(const c of clean){
    if(c.error) continue;
    if(c.a.inDocument) continue;
    if(c.a.bytes !== c.bytes || c.a.sha256 !== c.sha256) movedRows++;
    c.a.bytes = c.bytes; c.a.sha256 = c.sha256; c.a.rehashed = stamp;
  }
  const mechanical =
    "MECHANICAL, measured by the pass: " + fmt(diff.countWas) + " → " + fmt(diff.countNow) + " files, " +
    fmt(diff.bytesWas) + " → " + fmt(diff.bytesNow) + " B, tree " + String(diff.treeWas || "?").slice(0, 16) + " → " + String(diff.treeNow).slice(0, 16) +
    (diff.added.length ? " · ADDED " + diff.added.join(", ") : " · nothing added") +
    (diff.changed.length ? " · CHANGED " + diff.changed.join(", ") : " · nothing changed") +
    (diff.removed.length ? " · REMOVED " + diff.removed.join(", ") : " · nothing removed") +
    " · " + movedRows + " asset row(s) re-hashed, " + (clean.length - movedRows) + " unchanged" +
    ". RATIONALE (the caller's own words): " + String(why || "none given");
  json.revision = { at: stamp, of: day, why: mechanical };
  json.self = {
    md: { path: REGISTER_MD, sha256: mdSha, bytes: mdBytes },
    json: { path: REGISTER_JSON, sha256: null, why: "a file cannot contain its own digest — the one declared gap in this register" }
  };
  const jsonText = JSON.stringify(json, null, 2) + "\n";

  rows.push({ what: "the markdown", state: fmt(mdBytes) + " B", note: "section G regenerated from byTopLevel · E/F rows rewritten in place · sha " + mdSha.slice(0, 16) + "…" });
  rows.push({ what: "the machine copy", state: fmt(enc.encode(jsonText).length) + " B", note: "census + totals + " + clean.length + " asset row(s) + self.md written; its own digest is the declared gap" });

  /* IDEMPOTENCE. A pass over an estate that has not moved must produce the file it
     already read, byte for byte — otherwise the relay re-uploads the register every
     run for nothing but a new timestamp, and "identical bytes are never re-uploaded"
     stops being true of the one document the whole delivery is keyed to. So when the
     census matches, no asset row moved and the markdown came out identical, the
     ORIGINAL bytes are returned and the new stamp is thrown away, on purpose. */
  const unchanged = diff.matches && movedRows === 0 && (md === origMd);
  if(unchanged){
    rows.push({ what: "THE REGISTER", state: "UNCHANGED", note: "the census matches, no asset row moved and the markdown is identical — the bytes that were already there are returned unchanged (a new timestamp is not a reason to make the relay re-upload, and the relay's own digest rule holds only if this pass is idempotent)" });
    return { version: VERSION, ms: Date.now() - t0, census, diff, rows, json: origJsonText, md: origMd, hashes, why: mechanical, unchanged: true };
  }

  return { version: VERSION, ms: Date.now() - t0, census, diff, rows, json: jsonText, md, hashes, why: mechanical, unchanged: false };
}
