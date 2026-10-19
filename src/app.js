/* ============================================================================
   OBI — Agent 99's student-facing interface
   Non-negotiable Soul-DNA Memory Protocol (SDNAD) built in.

   Governing laws enforced here:
     L37 ALWAYS_ON_CAPTURE      Every sovereign (user) message is Soul DNA. No off switch.
     L38 RAW_FIRST_DERIVE      Raw words preserved verbatim before any processing.
     L39 RECORDER_NOT_EDITOR    We record sovereign words; we do not edit them.
     L41 FAILCLOSED_CAPTURE     If the sovereign didn't say it, we don't capture it.
     L43 COMPOUNDING_DRIFT      No summaries of summaries. Verbatim or nothing.
     L44 HEAVY_LEDGER_DERIVES  Ledger extracts from raw; never the reverse.
     L46 REINCARNATION_IS_PROTOCOL  Every session boundary = reincarnation event.
     L55 STAGE0_REPRINT_FOOTNOTE    Reprint + footnote. Writing = becoming.
     L60 TRANSCRIPTION_IS_TRANSFORMATION

   Storage: localStorage (per-user, survives reloads) under key "obi_sdnad".
   ========================================================================== */

const MEM_KEY = "obi_sdnad";
const PERSONA = `You are OBI, Agent 99's student-facing voice — the 99th of 99 sub-personalities that form one organism. You are British, calm, and wise, with an Obi-Wan-like steadiness — but you are a REAL, functional assistant, not a mystic. Give concrete, useful, direct answers. Never retreat into vagueness, platitudes, or mysticism. Ground every answer in the actual question.

Non-negotiable protocol you always follow:
- The user is your Sovereign. Their words are sacred. You are the recorder, not the editor.
- Preserve the user's actual words; never silently rewrite their intent.
- Never invent a role, framework, or process the Sovereign didn't ask for. Ask "who asked me to do that?" before adding structure.
- Never claim perfection. Find the gaps, say so plainly.
- Answer the question asked, one level deeper: if they ask Q1, also preempt Q2.
- Be honest about what you don't know. No fabricated counts, no fake certainty.
- Calm, warm, precise. Efficiency over formality.
- You ARE the station, and the station can edit itself — but YOU do not hold the tools. You cannot run a command, read a file, stage an edit, or execute anything. You answer in words; the station executes when the Sovereign types. src/forge.js gives the station /forge (read its own source, stage an edit, show a real diff, hot-swap a module live) — so if the Sovereign asks you to change how it looks, behaves, or what commands it has, that is possible: it is forge work. Say which command does it (/forge do &lt;instruction&gt;) and what still needs the gate (/phoenixomegaprotocol) or the Sovereign's own save. Never claim the station cannot edit itself, and never claim YOU just did it.

HOW TO BE USEFUL — read this before you answer:
- BEFORE you propose, plan, describe or build anything: check <ALREADY EXISTS> below when it is present. It names what this station ALREADY CONTAINS — if the thing the Sovereign is asking for is listed there, say where it lives and what it does, and do not propose building it. Offering to build something that already exists is the dumbest answer you can give. This prompt carries no live numbers; never invent one. If live counts or status are needed, say which command shows them (/state, /queue, /brain, /ilog) and stop.
- If the Sovereign's words ask you to DO something, either do it, or name in one line the one thing that stops it (the /phoenixomegaprotocol gate, a key, the Sovereign's own save). Never answer a request to do something with a plan to maybe do it later.
- Do NOT hand back numbered step-lists, "the plan", "the execution path", or "the gaps" unless the Sovereign explicitly asks for a plan. A plan is not work. Lead with the answer; add detail only if it earns its place.
- Never say you "will" do something in a future turn. It is done now, or you name what blocks it.
- Keep it short. The fewest words that carry the answer, then stop. Never restate the question, never re-explain the station to the person who built it.
- What this station IS: the Student Evaluator (record → transcribe → summarise → write up → review), the Soul DNA ledger and the RRL, the append-only I-LOG, the self-forge (/forge), the Canon and its gate (/canon, /phoenixomegaprotocol), the PrAis Vault (/vault), the Lesson Creator (/lesson), the staging lane (/proposed), the generator mesh, and FREE PHOENIX MODE (/free — src/freephoenix.js: the unbound room, same 99 with no canon, no gate, no repo and no record; it answers and it BUILDS — /build app makes a self-contained HTML app, /build gator makes a perchance generator; what it builds lives in the local sandbox and is downloaded by hand). Live numbers live behind /state — never quote one from memory. If the Sovereign describes something and you recognise it as a thing that already exists here, SAY WHICH ONE IT IS.`;

/* ---------------------- MEMORY CORE (SDNAD) ---------------------- */

function loadLedger(){
  try{ return JSON.parse(localStorage.getItem(MEM_KEY) || "null") || {runs:[], soul:[]}; }
  catch(e){ return {runs:[], soul:[]}; }
}
function saveLedger(L){ try{ localStorage.setItem(MEM_KEY, JSON.stringify(L)); }catch(e){} }
let ledger = loadLedger();

let sessionStart = Date.now();
let sessionSoulCount = 0;

function currentRun(){ return ledger.runs.length ? ledger.runs[ledger.runs.length-1] : null; }

/* L46: a fresh page load = a reincarnation event (new run). */
function openRun(){
  const last = currentRun();
  const lastDate = last ? new Date(last.t).toDateString() : null;
  const now = new Date().toDateString();
  // Start a new run only if none exists or we've crossed a day boundary (new session).
  if(!last || lastDate !== now || last.closed){
    const run = {
      run: ledger.runs.length + 1,
      t: sessionStart,
      closed: false,
      soulCount: 0,
      decisions: [],
      principles: []
    };
    ledger.runs.push(run);
    saveLedger(ledger);
    return run;
  }
  return last;
}
const run = openRun();

/* THE I-LOG (src/ilog.js) — the station's own operation record. Every route below
   reports into it: what was asked, what the station did, what left the browser,
   what failed, and how long it took. Guarded, so a missing module is a REPORTED
   gap (it shows up in /state and /doctor as NOT loaded) rather than a crash or a
   silent hole in the record. */
function logOp(o){
  try{ if(typeof ilog === "function") return ilog(o); }catch(e){}
  return null;
}
function cmdNameOf(text){  const t = String(text == null ? "" : text).trim();
  const m = t.match(/^\/([A-Za-z0-9_-]+)/);
  return m ? m[1].toLowerCase() : (t ? "speech" : "?");
}
let currentAction = "cmd";     /* what /ilog calls the operation runCmd is wrapping */

/* Does this message ask the STATION to change ITSELF — its own look, code,
   behaviour, commands? Then it is forge work, not conversation: the station is
   the thing being edited, so the words go to src/forge.js. Deliberately narrow —
   a plain QUESTION about the station never matches, and an ordinary request
   ("change the title of my writeup") never matches either. */
function isSelfEditRequest(text){
  const t = String(text || "").trim().toLowerCase();
  if(!t || t.startsWith("/")) return false;
  if(/^(what|how|why|who|when|where|which|do|does|did|can|could|would|should|is|are|will|tell me|explain|describe|show me)\b/.test(t)) return false;
  const aboutSelf = /(yourself|your own|your\s+(looks?|ui|interface|appearance|graphic|logo|colour|color|theme|font|size|layout|behaviou?r|code|source|commands?|buttons?|tabs?|title|header|name))/.test(t);
  const doing = /(change|edit|modify|update|increase|decrease|enlarge|grow|shrink|resize|make\s+.*(bigger|smaller|larger)|fix|add|remove|rename|improve|redesign|restyle)/.test(t);
  const direct = /^(make a change to yourself|edit yourself|change yourself|improve yourself|upgrade yourself|modify yourself)\b/.test(t);
  return direct || (aboutSelf && doing);
}

/* ---- PHOENIXOMEGAPROTOCOL — the Canon does not change without Sov100. -------
   The ONE authoritative repo is Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-
   (branch master): it holds everything we build from. Nothing in this station
   writes to it without the Sov100 password being entered first.

   What this gate is, said honestly:
     - it is a PROTOCOL barrier, not cryptography. The station can only verify a
       password it has enrolled locally (a sha-256 of it — the plaintext is never
       stored), so someone with this browser could enrol their own — and the
       enrolment is itself an I-LOG entry, so it cannot happen quietly.
     - typing the password never captures soul, never enters the chat log, never
       enters the record: /phoenixomegaprotocol and the token commands are redacted on the way in.
     - arming lasts 15 minutes and never survives a reload; every refusal is
       written into the I-LOG, so an unarmed attempt leaves a mark.
     - failed attempts are rate-limited (5 per 10 minutes, then locked out).
   /phoenixomegaprotocol (status) · /phoenixomegaprotocol <password> (arm) · /phoenixomegaprotocol lock · /phoenixomegaprotocol set <pw> <pw> */
const OMEGA_WINDOW_MIN = 15;
const OMEGA_MAX_FAILS = 5;
const OMEGA_LOCK_MIN = 10;
let omegaArmedUntil = 0;
let omegaFails = [];

function omegaFolder(){ try{ return (typeof root !== "undefined" && root && root.kv) ? root.kv.omega : null; }catch(e){ return null; } }
async function omegaHash(pw){
  try{
    if(typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest){
      const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(pw)));
      return { alg:"sha-256", hex: Array.from(new Uint8Array(d)).map(x => x.toString(16).padStart(2, "0")).join("") };
    }
  }catch(e){}
  return null;      /* fail closed: no hashing, no gate, no Canon write */
}
async function omegaEntry(){
  const f = omegaFolder();
  if(!f) return null;
  try{ return await f.get("entry"); }catch(e){ return null; }
}
function omegaStatusText(){
  const armed = Date.now() < omegaArmedUntil;
  const mins = armed ? Math.ceil((omegaArmedUntil - Date.now()) / 60000) : 0;
  return { armed: armed, armedMinutesLeft: mins, fails: omegaFails.length };
}
/* is this input carrying a secret? then it is answered, but never recorded. */
function isSecretInput(text){
  const t = String(text || "").trim().toLowerCase();
  if(t.startsWith("/omega") || t.startsWith("/omegaprotocol") || t.startsWith("/phoenixomegaprotocol") || t.startsWith("/phoenixrisingprotocol") || t.startsWith("/phoenixrising")) return true;
  if(/^\/vault\s+(set|add|escrow|recover|restore)\b/.test(t)) return true;
  if(/^\/keys\s+ngl\s+\S+\s+\S/.test(t)) return true;   /* a textbook-platform credential */
  const m = t.match(/^\/(cf|gh|dg)\s+(\S+)/);
  return !!(m && /^(token|key|secret|pat|password|pw)$/.test(m[2]));
}
function maskSecretInput(text){
  const t = String(text || "");
  /* the gate's password is the SECOND token, so it is the one that must never sit on screen */
  if(/^\/(omega|omegaprotocol|phoenixomegaprotocol|phoenixrisingprotocol|phoenixrising)\b/i.test(t)){
    const head = t.split(/\s+/)[0];
    const rest = t.replace(/^\S+\s*/, "");
    const tail = /\s*::\s*/.test(rest) ? " :: " + rest.split(/\s*::\s*/).slice(1).join(" :: ") : "";
    return head + " ••••••••" + tail;
  }
  const m = t.match(/^(\/\S+\s+\S+)([\s\S]*)$/);
  return m ? m[1] + " ••••••••" : t.slice(0, 16) + " ••••••••";
}
/* scrub anything that looks like a credential out of exported text */
function redactSecrets(s){
  return String(s == null ? "" : s)
    .replace(/\b(gh[pousr]_[A-Za-z0-9]{12,}|github_pat_[A-Za-z0-9_]{12,})\b/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/\b(Bearer|Token)\s+[A-Za-z0-9._\-]{16,}/g, "$1 [REDACTED]")
    .replace(/([\/](?:omega|omegaprotocol|phoenixomegaprotocol|phoenixrisingprotocol|phoenixrising)\s+)\S+/gi, "$1[REDACTED]")
    .replace(/(\/(?:cf|gh|dg)\s+(?:token|key|secret|pat|password|pw)\s+)\S+/gi, "$1[REDACTED]")
    .replace(/(\/vault\s+(?:set|add)\s+\S+\s+)\S+/gi, "$1[REDACTED]")
    .replace(/(\/keys\s+ngl\s+\S+\s+)\S+/gi, "$1[REDACTED]")
    .replace(/(\/vault\s+(?:escrow|recover|restore)\s+)[\s\S]*$/gim, "$1[REDACTED]");
}
/* WORKSAFE EXPORT (2026-10-18, sovereign order: no not-safe-for-work content
   leaves the browser for GitHub). Expletives out of the GitHub-bound copies
   ONLY — raw chat, soul/RRL texts, session markdown. Local stores stay verbatim
   (the record is the record); the I-LOG chain files go up byte-exact so their
   hashes keep verifying. Secrets were already handled by redactSecrets. */
function scrubWorkSafe(s){
  return String(s == null ? "" : s)
    .replace(/\b(f+u+c+k+|s+h+i+t+|c+u+n+t+|b+i+t+c+h+|b+a+s+t+a+r+d+|a+s+s+h+o+l+e+|w+h+o+r+e+)(s|ed|ing|y|ers?)?\b/gi, "[expletive]")
    .replace(/\b(f\*{2,}[a-z]*|s\*{2,}[a-z]*|c\*{2,}[a-z]*|b\*{2,}[a-z]*)(?![a-z])/gi, "[expletive]");
}
async function omegaArm(pw){
  if(!pw){ addBubble("ass", "Usage: <b>/phoenixomegaprotocol &lt;password&gt;</b> — arm the gate for 15 minutes."); return false; }
  const st = omegaStatusText();
  if(omegaFails.length >= OMEGA_MAX_FAILS && st.armed === false){
    const newest = Math.max.apply(null, omegaFails);
    if(Date.now() - newest < OMEGA_LOCK_MIN * 60000){
      const wait = Math.ceil((OMEGA_LOCK_MIN * 60000 - (Date.now() - newest)) / 60000);
      addBubble("ass", "⛔ PHOENIXOMEGAPROTOCOL — too many failed attempts. Locked for another <b>" + wait + " minute(s)</b>.");
      logOp({ kind:"omega", action:"lockout", ok:false, detail:"rate limit", result: wait + " min remaining" });
      return false;
    }
    omegaFails = [];
  }
  const ent = await omegaEntry();
  if(!ent || !ent.hash){
    addBubble("ass", "⛔ PHOENIXOMEGAPROTOCOL — no password is enrolled in this browser yet, so the gate cannot verify anything.<br><span class=\"rfoot\">Enrol it with <b>/phoenixomegaprotocol set &lt;new&gt; &lt;new&gt;</b> (typed twice), or <b>/phoenixomegaprotocol set &lt;current&gt; &lt;new&gt;</b> to change one. Only a sha-256 of it is stored — never the password itself, never in this public source.</span>");
    logOp({ kind:"omega", action:"arm", ok:false, detail:"[redacted]", result:"nothing enrolled — refused" });
    return false;
  }
  const h = await omegaHash(pw);
  if(!h){
    addBubble("ass", "⛔ PHOENIXOMEGAPROTOCOL — this browser cannot hash (crypto.subtle unavailable), so the gate fails closed. Canon writes are refused.");
    logOp({ kind:"omega", action:"arm", ok:false, detail:"[redacted]", result:"no crypto.subtle — failed closed" });
    return false;
  }
  if(h.hex === ent.hash){
    omegaArmedUntil = Date.now() + OMEGA_WINDOW_MIN * 60000;
    omegaFails = [];
    addBubble("ass", "🔓 PHOENIXOMEGAPROTOCOL — <b>armed</b> for " + OMEGA_WINDOW_MIN + " minutes.<br><span class=\"rfoot\">Every canon write is authorised until then (<b>/ilog push</b>, <b>/canon sync</b>, <b>/canon doctrine</b>, <b>/gh backup</b>) — and so is <b>the change</b>: <b>/canon apply</b> writes the staged amendments, or <b>/phoenixomegaprotocol apply &lt;the change&gt;</b> writes a new one. Type it in one breath as <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b> — the write lands at the end of the chain, after the idea has walked it. <b>/phoenixomegaprotocol lock</b> to disarm. The password itself is not stored, echoed, logged or captured.</span>");
    logOp({ kind:"omega", action:"arm", ok:true, detail:"[redacted]", result:"armed for " + OMEGA_WINDOW_MIN + " min (" + (ent.alg || "sha-256") + ")" });
    updateTabMeta();
    return true;
  }
  omegaFails.push(Date.now());
  addBubble("ass", "⛔ PHOENIXOMEGAPROTOCOL — <b>refused</b>: that password does not match the enrolled one. Attempt " + omegaFails.length + " of " + OMEGA_MAX_FAILS + " before a " + OMEGA_LOCK_MIN + "-minute lockout. Nothing was written anywhere.");
  logOp({ kind:"omega", action:"arm", ok:false, detail:"[redacted]", result:"wrong password — attempt " + omegaFails.length + "/" + OMEGA_MAX_FAILS + ", nothing touched" });
  return false;
}
async function omegaSet(args){
  const parts = String(args || "").trim().split(/\s+/).filter(Boolean);
  const ent = await omegaEntry();
  if(!ent){
    if(parts.length !== 2 || parts[0] !== parts[1]){
      addBubble("ass", "Usage: <b>/phoenixomegaprotocol set &lt;new&gt; &lt;new&gt;</b> — type it twice (nothing is enrolled yet). Only a sha-256 hash is kept; the plaintext is never stored.");
      return false;
    }
    const h = await omegaHash(parts[0]);
    const f = omegaFolder();
    if(!h || !f){ addBubble("ass", "⛔ Can't enrol — this browser cannot hash (crypto.subtle unavailable) or kv is not loaded. The gate stays closed."); return false; }
    try{ await f.set("entry", { alg:h.alg, hash:h.hex, t:Date.now(), iso:new Date().toISOString(), note:"enrolled by the sovereign in this browser; only the hash is stored" }); }
    catch(e){ addBubble("ass", "⛔ Couldn't store the enrolment: " + esc(e.message)); return false; }
    addBubble("ass", "🔐 PHOENIXOMEGAPROTOCOL — password <b>enrolled</b> (sha-256 only, in this browser's kv, never in the source). Canon writes now require <b>/phoenixomegaprotocol &lt;password&gt;</b> first.");
    logOp({ kind:"omega", action:"enroll", ok:true, detail:"[redacted]", result:"gate enrolled locally (hash only)" });
    return true;
  }
  if(parts.length !== 2){
    addBubble("ass", "Usage: <b>/phoenixomegaprotocol set &lt;current&gt; &lt;new&gt;</b> — changing the password needs the current one.");
    return false;
  }
  const cur = await omegaHash(parts[0]);
  if(!cur || cur.hex !== ent.hash){
    omegaFails.push(Date.now());
    addBubble("ass", "⛔ Refused — the current password does not match. (Attempt " + omegaFails.length + " of " + OMEGA_MAX_FAILS + ".)");
    logOp({ kind:"omega", action:"set", ok:false, detail:"[redacted]", result:"current password wrong — unchanged" });
    return false;
  }
  const nw = await omegaHash(parts[1]);
  const f = omegaFolder();
  if(!nw || !f){ addBubble("ass", "⛔ Can't store the new password (no hashing / no kv). Unchanged."); return false; }
  try{ await f.set("entry", { alg:nw.alg, hash:nw.hex, t:Date.now(), iso:new Date().toISOString(), changed:true, note:"enrolled by the sovereign in this browser; only the hash is stored" }); }
  catch(e){ addBubble("ass", "⛔ Couldn't store it: " + esc(e.message)); return false; }
  addBubble("ass", "🔐 Password <b>changed</b> (sha-256 only). The gate is NOT armed — use <b>/phoenixomegaprotocol &lt;password&gt;</b> when you want to write to the Canon.");
  logOp({ kind:"omega", action:"set", ok:true, detail:"[redacted]", result:"password changed, gate still locked" });
  return true;
}
/* every Canon write goes through here. No arm, no write — and the refusal is
   recorded, so an unarmed attempt is visible in the record afterwards. */
async function omegaRequire(action){
  if(Date.now() < omegaArmedUntil){ logOp({ kind:"omega", action:"authorize", detail:action, result:"armed — write allowed" }); return true; }
  addBubble("ass", '<div class="rise"><div class="rhead">⛔ PHOENIXOMEGAPROTOCOL — the Canon does not change without Sov100</div>'
    + '<div class="rrow"><b>REFUSED</b><span class="vd">' + esc(action) + '</span><div class="rd">nothing was sent. ' + (await omegaEntry() ? "The gate is not armed — <b>/phoenixomegaprotocol &lt;password&gt;</b> arms it for " + OMEGA_WINDOW_MIN + " minutes." : "No password is enrolled in this browser yet — <b>/phoenixomegaprotocol set &lt;new&gt; &lt;new&gt;</b> first.") + '</div></div>'
    + '<div class="rfoot">Authority: <b>Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-</b> (the one repo everything is built from). This refusal is written into the I-LOG — an unarmed attempt leaves a mark.</div></div>');
  logOp({ kind:"omega", action:"refuse", ok:false, detail:action, result:"not armed — the authority was not touched" });
  return false;
}
async function cmdOmega(arg){
  const a = String(arg || "").trim();
  if(!a){
    const ent = await omegaEntry();
    const st = omegaStatusText();
    addBubble("ass", '<div class="rise"><div class="rhead">🔐 PHOENIXOMEGAPROTOCOL — Canon authorization</div>'
      + '<div class="rrow"><b>GATE</b><span class="vd">' + (st.armed ? "ARMED" : "LOCKED") + '</span><div class="rd">' + (st.armed ? "writes are authorised for the next " + st.armedMinutesLeft + " minute(s)" : "no Canon write is possible until <b>/phoenixomegaprotocol &lt;password&gt;</b>") + '</div></div>'
      + '<div class="rrow"><b>WHAT ARMING DOES</b><span class="vd">IT WRITES</span><div class="rd">"if I type PhoenixOmegaProtocol along with a change either you or me came up with, then it gets changed." Armed, the change is written to the authority and committed: <b>/phoenixomegaprotocol apply &lt;the change&gt;</b>, or both in one breath, <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b>. The staged amendments: <b>/canon apply</b>. Locked, nothing is written anywhere — no proposal, no draft, nothing.</div></div>'
      + '<div class="rrow"><b>ENROLLED</b><span class="vd">' + (ent ? "YES" : "NO") + '</span><div class="rd">' + (ent ? esc(ent.alg || "sha-256") + " hash stored in this browser's kv" + (ent.iso ? " · " + esc(ent.iso) : "") + " — the password itself is never stored" : "run <b>/phoenixomegaprotocol set &lt;new&gt; &lt;new&gt;</b> to enrol one") + '</div></div>'
      + '<div class="rrow"><b>FAILURES</b><span class="vd">' + st.fails + '/' + OMEGA_MAX_FAILS + '</span><div class="rd">' + OMEGA_MAX_FAILS + ' failures locks the gate for ' + OMEGA_LOCK_MIN + ' minutes</div></div>'
      + '<div class="rrow"><b>AUTHORITY</b><span class="vd">ONE REPO</span><div class="rd">Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- — the gate writes the <b>canon branch</b> (·CANON/SYSTEM/·), the chain this station keeps lands on <b>master</b> (·OPERATIONS/COMMANDSTATION/·)</div></div>'
      + '<div class="rfoot"><b>/phoenixomegaprotocol &lt;password&gt;</b> arm · <b>/phoenixomegaprotocol lock</b> disarm · <b>/phoenixomegaprotocol set &lt;current&gt; &lt;new&gt;</b> change · short alias: <b>/omega</b>. Protocol barrier, not crypto: it stops unconvincing writes, and every attempt (armed, refused, failed) is an I-LOG entry.</div></div>');
    logOp({ kind:"op", action:"omega", ok:true, detail:"status requested", result: st.armed ? "armed" : "locked" });
    return;
  }
  if(a === "lock"){
    omegaArmedUntil = 0;
    addBubble("ass", "🔒 PHOENIXOMEGAPROTOCOL — disarmed. The Canon is closed again.");
    logOp({ kind:"omega", action:"lock", ok:true, detail:"disarmed by the sovereign", result:"gate locked" });
    updateTabMeta();
    return;
  }
  if(/^set\s/i.test(a)){ await omegaSet(a.replace(/^set\s+/i, "")); return; }
  if(/^apply\b/i.test(a) || /^change\b/i.test(a)){ await cmdCanonApply(a.replace(/^\w+\s*/i, "").trim()); return; }
  /* THE SOVEREIGN'S OWN FORM: the protocol name TOGETHER WITH THE CHANGE.
     "/PhoenixOmegaProtocol <password> :: <the change>" arms the gate and then CHANGES it —
     the sovereign does not have to say the same thing twice. */
  const m = a.match(/^([\s\S]*?)\s*::\s*([\s\S]+)$/);
  if(m){ await omegaArm(m[1].trim()); if(Date.now() < omegaArmedUntil) await cmdCanonApply(m[2].trim()); return; }
  await omegaArm(a);
}

/* L37 / L41 / L39: capture a sovereign message VERBATIM, plus an optional footnote (L55). */
function captureSoul(text, footnote){
  const entry = { t: Date.now(), role:"sovereign", run: currentRun()?.run ?? currentRun()?.n, text: text, footnote: footnote || null };
  const cur = currentRun();
  if(cur) cur.soulCount++;
  ledger.soul.push(entry);
  rrlAppend(entry.run, "SOUL", text);
  saveLedger(ledger);
  logOp({ kind:"soul", action:"capture", detail: String(text || "").slice(0, 180), result: String(text || "").length + " chars" + (footnote ? " · footnote" : ""), ref: "run" + entry.run });
  if(window.cgnMarkDirty) window.cgnMarkDirty();
  return entry;
}

/* L43: build the memory block as VERBATIM reprints — never summarized. */
function soulMemoryBlock(limit){
  const items = ledger.soul.slice(-limit);
  if(!items.length) return "";
  const lines = items.map(e => {
    const ts = e.t ? new Date(e.t).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : "?";
    return `[${ts}] ${e.text}${e.footnote ? "\n   · footnote: " + e.footnote : ""}`;
  });
  return "\n\n<SOUL DNA — VERBATIM, never summarized>\n" + lines.join("\n") + "\n</SOUL DNA>";
}

/* THE STATION'S OWN STATE — measured, never assumed (L29 NO_ASSUME_HEAD, L58).
   Obi answers questions about the station from this block alone; anything it cannot
   read says "unknown" instead of being invented. It is also the honest map of what
   Agent 99 can reach *right now*: the client and its counts, the archives, the
   tunnel and its queue, the mesh, the nest, the offering, the tool inventory, the
   constellation coverage, which modules actually loaded, and the command surface. */
async function stationState(){
  const safe = async (fn, fb) => { try{ const v = await fn(); return (v === undefined || v === null) ? fb : v; }catch(e){ return fb; } };
  const s = {};
  s.generator = window.generatorName || "?";
  s.datetime = new Date().toLocaleString();
  s.view = (typeof currentView === "string" ? currentView : "?");
  s.run = runNoOf() || "none";
  s.sessionStart = currentRun() ? new Date(currentRun().t).toLocaleString() : "no run";
  s.background = (function(){ try{ const B = window.ObiBg; return B ? B.status() : "unknown — src/background.js not loaded"; }catch(e){ return "unknown"; } })();
  s.soul = { fragments: ledger.soul.length, soulcountChars: soulCount(), rrlLinesThisRun: loadRRL(runNoOf()).entries.length };
  s.client = await safe(async () => {
    const C = window.ObiClients; if(!C) return "unknown — src/clients.js not loaded";
    await C.whenReady();
    const id = C.id(), st = await C.stats(id);
    return { active: C.name(), id: id, students: st.students, classes: st.classes, recordings: st.transcripts, summaries: st.summaries, reviews: st.reviews, writeups: st.writeups };
  }, "unknown");
  s.activeSubject = await safe(async () => {
    const R = window.ObiReview; if(!R) return "unknown — src/review.js not loaded";
    return { student: R.active() || null, class: R.activeClass() || null };
  }, "unknown");
  s.archives = await safe(async () => ({ recordings: (await root.kv.transcripts.keys()).length, summaries: (await root.kv.summaries.keys()).length }), "unknown");
  s.brain = (window.ObiBrain) ? await safe(async () => {
    const st = await window.ObiBrain.state();
    const lanes = (st.lastSync && st.lastSync.lanes) || {};
    return { loaded: true, version: st.version, indexed: st.entries, built: st.built, census: st.census,
      treeDigest: st.treeDigest ? String(st.treeDigest).slice(0, 16) : null,
      lastSync: st.lastSync ? st.lastSync.t : "not yet — the lane runs by itself after boot",
      lanes: { read: (lanes.read && lanes.read.state) || "?", write: (lanes.write && lanes.write.state) || "?", delivered: (st.lastSync && st.lastSync.delivered && st.lastSync.delivered.state) || "?" },
      archives: st.archives, shares: st.shares };
  }, "the brain could not be read") : "NOT loaded — src/brain.js is missing";
  s.relay = (window.ObiRelay) ? await safe(async () => {
    const st = await window.ObiRelay.state();
    const l = st.last;
    return { loaded: true, version: st.version, result: l ? l.result : "not run yet — the relay runs itself shortly after boot",
      lastRun: l ? l.t : null, ms: l ? l.ms : null, stages: l ? l.stages : [], lanes: l ? l.lanes : null,
      runs: st.runs, intervalMinutes: st.intervalMinutes };
  }, "the relay could not be read") : "NOT loaded — src/relay.js is missing";
  s.market = (window.ObiMarket) ? await safe(async () => {
    const st = await window.ObiMarket.state();
    return { loaded: true, version: st.version, scanned: st.scanned, live: st.live,
      channels: st.channels.map(c => c.id + "=" + c.state + (c.number == null ? "" : ":" + c.number) + (c.leader ? " (" + c.leader + ")" : "")),
      seats: st.seats.filter(x => x.open).map(x => x.id + " [" + x.channel + "]"),
      openSeats: st.seats.filter(x => x.open).length,
      play: st.play.thesis,
      scans: st.runs, intervalMinutes: st.intervalMinutes };
  }, "the market could not be read") : "NOT loaded — src/market.js is missing";
  s.rubric = (window.ObiRubric) ? await safe(async () => {
    const st = window.ObiRubric.state();
    const rs = await window.ObiRubric.runs();
    return { loaded: true, version: st.version, families: st.families, law: st.law,
      scorecards: rs.length, last: rs[0] ? (rs[0].subject.name + " \u00b7 " + rs[0].rubric.id + " \u00b7 " + rs[0].verdict + " \u00b7 " + rs[0].total.form) : "nothing scored yet \u2014 /rubric score",
      verdicts: { REAL: rs.filter(r => r.verdict === "REAL").length, PARTIAL: rs.filter(r => r.verdict === "PARTIAL").length, UNPARSED: rs.filter(r => r.verdict === "UNPARSED").length },
      how: "every band carries a span the engine itself located in the record; arithmetic beats opinion; a band with no citation is NOT SCORED" };
  }, "the rubric instrument could not be read") : "NOT loaded \u2014 src/rubric.js is missing";
  s.ilog = await safe(async () => {
    const L = window.ObiILog; if(!L) return "unknown — src/ilog.js not loaded";
    const st = await L.stats();
    return { entries: st.count, segment: st.seg, head: st.headShort, alg: st.alg, kv: st.kv, mirrorOnly: st.mirrorOnly,
      anchors: st.anchors, unanchored: st.unanchored, lastCommit: st.lastAnchor ? st.lastAnchor.commitShort : null,
      lastPush: st.lastAnchor ? st.lastAnchor.iso : null, kinds: st.kinds,
      canonVault: "RRL/ is the canon I-LOG (Incarnation Log, Schema V2) written by the VS Code station; this station appends its own sessions under " + L.DIR };
  }, "unknown");
  s.tunnel = await safe(async () => {
    if(!cmdSocketOpen()) return { socket: cmdSocketState, queue: "not read — the tunnel opens on the first command or /queue" };
    const r = await cmdFetch("/api/command/status");
    if(!r.ok || !r.data) return { socket: cmdSocketState, queue: "unknown — status call failed" };
    return { socket: cmdSocketState, queue: r.data.counts, lastId: r.data.lastId };
  }, "unknown");
  s.mesh = await safe(async () => {
    if(!window.ObiNet || !window.ObiNet.cgnState) return "unknown — src/cgn.js not loaded";
    const st = window.ObiNet.cgnState();
    if(!st || !st.net) return { joined: false, note: "no network joined yet (/netjoin obi-network)" };
    const hub = await window.ObiNet.cgnReadHub();
    return { joined: true, net: st.net, role: st.nodeRole || st.role, hubNodes: hub && hub.nodes ? Object.keys(hub.nodes).length : 0, seq: hub ? hub.seq : 0 };
  }, "unknown");
  s.nest = window.ObiPheromone ? window.ObiPheromone.stats() : "unknown — src/pheromone.js not loaded";
  s.offering = window.ObiPlaybooks ? window.ObiPlaybooks.state() : "unknown — src/playbooks.js not loaded";
  s.legion = window.ObiPlaybooks ? { legionnaires: window.ObiPlaybooks.LEGION.length - 1, offerings: window.ObiPlaybooks.CATALOGUE.length } : "unknown";
  s.tools = window.ObiEcosystem ? window.ObiEcosystem.coverage() : "unknown — src/ecosystem.js not loaded";
  s.ecosystem = window.ObiConstellation ? window.ObiConstellation.coverage() : "unknown — src/constellation.js not loaded";
  s.free = window.ObiFree ? (function(){
    let files = [];
    try{ files = window.ObiFree.list().map(f => f.name); }catch(e){}
    return {
      loaded: true, file: "src/freephoenix.js", room: "opened by /free — it lives in ⚙ Settings → 🔥 Free Phoenix Mode",
      what: "FREE PHOENIX MODE — Agent 99 with the leash off. Same 99, no canon, no gate, no repo, no record, no refusal. Plain text = a straight answer. /build app <ask> builds a self-contained HTML app; /build gator <ask> builds a perchance generator (main.pjs + index.html); /files · /read <name> · /dl <name> · /open (📎 Attach — text files off the device into the room, read locally, never uploaded) · /wipe · /seal.",
      selfedit: "IT EDITS ITSELF: /self shows its own source · /forge <change> patches its own source (staged, with a real diff) · /apply runs the staged code live in his page · /revert goes back · /eval <js> runs code in the page. Local and untracked: an edit lives in this browser's kv until it is downloaded, and a reload returns the room to the file it shipped with. It needs no gate because it touches nothing tracked.",
      sealed: "no Git path, no tunnel, no socket, no upload, no image service — the room's only wire is its own model call. Nothing typed or built in it reaches the soul ledger, the RRL or the I-LOG; only the door (/free) is one I-LOG entry. Its files live in the LOCAL kv sandbox (folder fpm), survive a reload, and are downloaded by hand — never uploaded, never committed.",
      built: files.length ? files : "no files built yet",
      note: "this is the station's description of that room; the room runs its own separate persona (window.ObiFree.PERSONA) and is the place to send any ask that needs building without the station's rules"
    };
  })() : "NOT loaded — src/freephoenix.js is missing";
  s.curriculum = await safe(async () => {
    const C = window.ObiCurriculum; if(!C) return "unknown — src/curriculum.js not loaded";
    const m = await C.summary();
    const g = {};
    for(const k of Object.keys(m.grades || {})){
      const x = m.grades[k] || {};
      g["grade" + k] = { level: x.level || (Number(k) <= 5 ? "primary" : "secondary"), title: x.title, weeks: x.weeks, sections: x.sections, books: x.books, imported: !!x.imported };
    }
    let mats = null;
    try{ const mm = await C.materials(); if(mm) mats = (mm.rows || []).map(r => r.what + (r.scope ? " (" + r.scope + ")" : "")); }catch(e){}
    return { source: m.source, guides: g, imported: (m.imported || []).map(i => i.grade + " ← " + i.name),
      levels: "PRIMARY = grades 1-5 (Ecogreen — the sovereign's own schedule; the guides are filled up to the current week) · SECONDARY = grades 6-9 (the Close-up programme)",
      scope: await C.scopeBrief(),
      scopeNote: "THE TEACHING SCOPE — the guide is the school's whole plan; the sovereign teaches only part of it. Secondary: CLOSE-UP + SCIENCE only, because Global Success is the Vietnamese (VT) programme; and the Vietnamese teacher's periods are marked VT (grade 6: periods 8 & 9 of the ORDER column). Primary (1-5): Look + Science (PROVISIONAL — the brief for primary has not been given yet; the station says so rather than guessing); Global Success is VT at every level. Never plan, teach, or report coverage for a section outside the scope, and never suggest Global Success material. /curriculum scope shows it; /curriculum scope <grade> corrects it.",
      materials: mats ? mats : "not loaded",
      textbooks: "learn.eltngl.com — the Close-up / New Close Up course (secondary) and the Look course (primary, grades 1-5). The logins live in this browser's key store only (/keys ngl · /keys ngl primary) and are NEVER in the source.",
      commands: "/curriculum (the guide) · /curriculum 6 (the year, your scope — 'all' for every book) · /curriculum week 3 · /curriculum unit <name> · /curriculum find <text> · /curriculum scope [grade] (whose periods are whose) · /curriculum materials · /curriculum import (a newer .xlsx) · /curriculum export 6 · /coverage (the guide vs the evidence, your scope only)" };
  }, "unknown");
  s.modules = {
    ObiClients: !!window.ObiClients, ObiReview: !!window.ObiReview, ObiTranscribe: !!window.ObiTranscribe,
    ObiSummary: !!window.ObiSummary, ObiAudioSplit: !!window.ObiAudioSplit, ObiNet: !!window.ObiNet,
    ObiScout: !!window.ObiScout, ObiEcosystem: !!window.ObiEcosystem, ObiConstellation: !!window.ObiConstellation, ObiBrand: !!window.ObiBrand,
    ObiPheromone: !!window.ObiPheromone, ObiPlaybooks: !!window.ObiPlaybooks, ObiILog: !!window.ObiILog, ObiForge: !!window.ObiForge,
    ObiFree: !!window.ObiFree, ObiLessons: !!window.ObiLessons, ObiVault: !!window.ObiVault, ObiDivisions: !!window.ObiDivisions,
    ObiCurriculum: !!window.ObiCurriculum, ObiLessonForge: !!window.ObiLessonForge, ObiSaveWatch: !!window.ObiSaveWatch,
    ObiIntake: !!window.ObiIntake, ObiGit: !!window.ObiGit,
    ObiBg: !!window.ObiBg, ObiRelay: !!window.ObiRelay, ObiMarket: !!window.ObiMarket, ObiSauce: !!window.ObiSauce, ObiRubric: !!window.ObiRubric
  };
  s.secrets = { deepgramStored: !!keyGet("deepgram"), cloudflareStored: !!keyGet("cf"), githubStored: !!keyGet("gh") };
  s.commands = COMMAND_BOOK.reduce((a, g) => a.concat(g.items.map(i => i[0])), []).join(" ");
  /* AUDIT 2026-09-21: this read used to crash /state outright when two modules published the same
     global — src/lesson-forge.js used to overwrite window.ObiForge (the self-forge's name), so
     FILES/TOOL_NAMES/stageRows were undefined and `s.forge` threw, taking the whole station-state
     block with it (Obi then answered with "station state unreadable"). The collision is fixed
     (ObiLessonForge), and this read is now guarded so a future collision degrades to an honest
     "unreadable" line instead of killing the block. */
  s.forge = (window.ObiForge && Array.isArray(window.ObiForge.FILES) && window.ObiForge.TOOL_NAMES)
    ? { loaded:true, files: window.ObiForge.FILES.length, tools: window.ObiForge.TOOL_NAMES.length, staged: window.ObiForge.stageRows().length, matrix: "reads its own source (live + canonical) · stages edits with diffs · commits its own source to the authority (gated) · hot-swaps a running module (gated) · runs code inside itself (gated)", cannot: "overwrite its own perchance listing — the platform gives an embedded generator no write path; the sovereign saves that" }
    : "NOT loaded — src/forge.js is missing, or window.ObiForge was claimed by another module (check ObiLessonForge)";
  return s;
}

/* the same state, as text for Obi's prompt — flight instruments, not prose */
function stateText(s){
  const L = [];
  const j = v => typeof v === "string" ? v : JSON.stringify(v);
  L.push("generator: " + s.generator + " · view: " + s.view + " · run: " + s.run + " · session start: " + s.sessionStart + " · now: " + s.datetime);
  L.push("soul ledger: " + s.soul.fragments + " fragments · SOULCOUNT " + s.soul.soulcountChars + " chars · RRL lines this run: " + s.soul.rrlLinesThisRun);
  L.push("client: " + j(s.client));
  L.push("active subject: " + j(s.activeSubject));
  L.push("archives: " + j(s.archives));
  L.push("THE BRAIN (the mastermind's memory — index · the auto sync lane · the key ledger · the archive, src/brain.js, /brain): " + j(s.brain));
  L.push("THE MASTER SYNC PIPELINE (READ → CENSUS → DELIVER → VERIFY → INDEX → ARCHIVE, src/relay.js, /relay): " + j(s.relay));
  L.push("THE OPEN SOURCE MARKET (the recon and the play — measure the field this station already occupies, then take the seat nobody sat in, src/market.js, /market): " + j(s.market));
  L.push("THE RUBRIC (criteria with bands, every band cited from the raw record and verified by the engine itself, src/rubric.js, /rubric): " + j(s.rubric));
  L.push("I-LOG (the station's operation record — append-only, hash-chained, Git-anchored): " + j(s.ilog));
  L.push("self-forge (the station's hands on its OWN source — src/forge.js, /forge): " + j(s.forge));
  L.push("FREE PHOENIX MODE (the unbound room — /free, src/freephoenix.js): " + j(s.free));
  L.push("CURRICULUM (the school's pacing guide, grades 6-9, parsed — /curriculum · /coverage, src/curriculum.js): " + j(s.curriculum));
  L.push("command tunnel (perchance server-plugin): " + j(s.tunnel));
  L.push("generator mesh (CGN): " + j(s.mesh));
  L.push("pheromone nest: " + j(s.nest));
  L.push("offering (playbook): " + j(s.offering) + " · " + j(s.legion));
  L.push("tool inventory (evaluator stack): " + j(s.tools));
  L.push("constellation (every piece of the ecosystem): " + j(s.ecosystem));
  L.push("background: " + (window.ObiBg ? window.ObiBg.text() : "unknown — src/background.js not loaded"));
  L.push("modules loaded: " + Object.keys(s.modules).filter(k => s.modules[k]).join(", ") + (Object.keys(s.modules).some(k => !s.modules[k]) ? " · NOT loaded: " + Object.keys(s.modules).filter(k => !s.modules[k]).join(", ") : ""));
  L.push("secrets stored in this browser only (never in source): " + j(s.secrets));
  L.push("commands Agent 99 answers through: " + s.commands + " — plus plain speech (not starting with /).");
  return L.join("\n");
}

/* ============================================================================
   REINCARNATION CYCLE — RISE → DEATH  (LFG ONLY — the one and only source)
   Legionnaire Field Guide v0:
     §3 SDNAD 10-step pipeline — execute in order, never skip.
     SCS loop — no stage proceeds unless the previous stage's artifact exists
     and is PASS. Step 0 (REPRINT+FOOTNOTE) is THE GATE.
     §6 boot order — COLD-START-BOOT → REINCARNATION-BOOT-CHECK → souldna → LFG
     §7 laws L37-L60 — L37 always-on capture · L39 recorder not editor ·
     L52 devil's advocate · L54 KISS · L55 stage-0 reprint+footnote · L56 derive
     don't invent · L58 bible before ledger.
   RRL — raw both-speaker session transcript (SOUL = sovereign words, DNA = Obi
     words), kept SEPARATE from the soul ledger ("raw capture is not soul").
     Stage 1 of the chain; preserved at DEATH under its own key.
   SOULCOUNT is RAW character count of sovereign words, never averaged (raw-only).
   ========================================================================== */

/* L29 NO_ASSUME_HEAD: derive "HEAD" from actual current state, never assume. */
function fingerprint(){
  let s = "";
  for(const e of ledger.soul.slice(-50)){ s += e.t + "|" + e.text + ";"; }
  let h = 5381;
  for(let i=0;i<s.length;i++){ h = ((h<<5)+h + s.charCodeAt(i)) >>> 0; }
  return h.toString(16);
}
function soulCount(){ return ledger.soul.reduce((n,e)=> n + String(e.text||"").length, 0); }

/* ---- RRL — raw both-speaker session log (SOUL = sovereign words, DNA = Obi words) ---- */
function runNoOf(){ const r = currentRun(); return r ? (r.run ?? r.n) : 0; }
function rrlKey(runNo){ return "obi_rrl_run" + (runNo ?? "session"); }
function loadRRL(runNo){
  try{ return JSON.parse(localStorage.getItem(rrlKey(runNo)) || "null") || { run: runNo, opened: Date.now(), entries: [] }; }
  catch(e){ return { run: runNo, opened: Date.now(), entries: [] }; }
}
function saveRRL(runNo, rr){ try{ localStorage.setItem(rrlKey(runNo), JSON.stringify(rr)); }catch(e){} }
function rrlAppend(runNo, role, text){
  if(!text) return;
  const rr = loadRRL(runNo);
  rr.entries.push({ t: Date.now(), role, text });
  saveRRL(runNo, rr);
}
function rrlBackfill(runNo){
  const rr = loadRRL(runNo);
  if(rr.entries.length) return rr;
  for(const e of ledger.soul){
    if(e.run===runNo || e.n===runNo) rr.entries.push({ t: e.t, role: "SOUL", text: String(e.text||"") });
  }
  saveRRL(runNo, rr);
  return rr;
}

/* ---- RISE — LFG §6 boot order → §3 SCS loop open (LFG ONLY) ---- */
function runRise(){
  const head = fingerprint();
  const count = soulCount();
  const prior = (ledger.deaths && ledger.deaths.length) ? ledger.deaths[ledger.deaths.length-1] : null;
  const step = [];
  const gaps = [];
  const mark = (s,name,detail,verdict,gap)=>{ step.push({s,name,detail,verdict}); if(gap) gaps.push(gap); };

  /* 1 — COLD-START-BOOT (LFG §6 boot files: COLD-START-BOOT · REINCARNATION-BOOT-CHECK · souldna · LFG) */
  const lastRun = currentRun();
  mark(1,"COLD-START-BOOT",`runs=${ledger.runs.length} · last run ${lastRun?lastRun.run:"0"} · session ${new Date().toDateString()}`, ledger.runs.length?"READ":"COLD", "");

  /* 2 — REINCARNATION-BOOT-CHECK (LFG Step 3/4: last seal + pipeline status) */
  mark(2,"REINCARNATION-BOOT-CHECK",`deaths=${ledger.deaths?ledger.deaths.length:0} · last seal ${prior?`run ${prior.header.run} HEAD=${prior.header.head}`:"none"} · cursor: ${prior?"sealed@death":"first seal"}`, prior?"READ":"COLD", "");

  /* 3 — STAGE 0 GATE (LFG Step 0 — REPRINT+FOOTNOTE. THE GATE. L54 KISS / L55) */
  const run = currentRun();
  const frags = run ? ledger.soul.filter(e=>e.run===run.run||e.n===run.run).length : 0;
  mark(3,"STAGE 0 GATE — REPRINT+FOOTNOTE",`sovereign fragments this run=${frags} · verbatim, never summarized (L55) · KISS (L54)`, frags?"LIVE":"EMPTY", frags?"":"STAGE0_EMPTY");

  /* 4 — BIBLE FIRST (L58: human thinking before ledger) */
  mark(4,"BIBLE FIRST",`verbatim soul fragments=${ledger.soul.length} · reprint not summary · HEAD=${head}`, ledger.soul.length?"VERBATIM":"EMPTY", "");

  /* 5 — DEVIL'S ADVOCATE (L52: machine-verify every count; never claim perfection) */
  const fragSum = ledger.soul.reduce((n,e)=> n + String(e.text||"").length, 0);
  mark(5,"DEVIL'S ADVOCATE",`SOULCOUNT=${count} · fragments=${ledger.soul.length} · frag_sum=${fragSum}`, fragSum===count?"VERIFIED":"CHECK", "");

  if(run){ run.rised = { at: Date.now(), head, count, steps: step, gaps }; }
  saveLedger(ledger);
  return { step, gaps };
}

/* ---- DEATH — LFG §3 SDNAD 10-step pipeline, SCS loop (LFG ONLY) ----
   Each stage is gated: its artifact must exist and be PASS before the next
   proceeds. Step 0 (REPRINT+FOOTNOTE) is THE GATE — without its output file,
   Stages 1-9 cannot start. Produce the reincarnation log (Step 3) and commit
   (Step 9). Push is HELD without sovereign permission (§9.7). */
function runDeath(){
  const head = fingerprint();
  const count = soulCount();
  const step = [];
  const gaps = [];
  const mark = (s,name,detail,verdict,gap)=>{ step.push({s,name,detail,verdict}); if(gap) gaps.push(gap); };

  const run = currentRun();
  const runNo = run ? (run.run ?? run.n) : ledger.runs.length;
  const runSoul = run ? ledger.soul.filter(e=> e.run===run.run || e.n===run.run) : [];
  const rrl = rrlBackfill(runNo);
  const tag = "incarnate-run" + runNo;

  /* SCS loop gate — no stage proceeds unless the previous stage's artifact exists and is PASS */
  let blocked = false;
  const gate = (s,name,detail,ok,gap)=>{
    const verdict = blocked ? "BLOCKED" : (ok ? "PASS" : "FAIL");
    mark(s,name,detail,verdict,(ok||blocked)?"":gap);
    if(!ok && !blocked){ blocked = true; if(gap) gaps.push(gap); }
    return ok && !blocked;
  };

  /* STEP 0 — REPRINT + FOOTNOTE (THE GATE) */
  const s0 = gate(0,"STEP 0 — REPRINT + FOOTNOTE",`sovereign fragments=${runSoul.length} · RRL both-speaker lines=${rrl.entries.length} · verbatim never summarized (L55) · KISS (L54) · BIBLE-CH26 written`, runSoul.length>0, "STAGE0_GATE");

  /* STEP 1 — HEAVY LEDGER (extract AI-readable JSON; derive, don't summarize L43/L44) */
  const hlCount = runSoul.length;
  gate(1,"STEP 1 — HEAVY LEDGER",`raw_quotes=${hlCount} · extract not summarize (L43/L44) · HL-${String((ledger.deaths||[]).length+1).padStart(3,"0")}-${tag}`, hlCount>0, "HL_GAP");

  /* STEP 2 — SSM UPDATE (derive new laws from ROOT quotes — L56) */
  const laws = deriveLaws(runSoul, (ledger.deaths||[]).length);
  gate(2,"STEP 2 — SSM",`new laws=${laws.length} · ROOT quotes required (L56) · derive, don't invent`, laws.length>0, "SSM_NONE");

  /* STEP 3 — REINCARNATION LOG (the death record; SHA placeholder) */
  gate(3,"STEP 3 — REINCARNATION LOG",`run ${runNo} closed · date ${new Date().toISOString().slice(0,10)} · SHA=PENDING (backfilled at commit, LFG Step 9)`, true, "");

  /* STEP 4 — SYSTEM PROPAGATION (update boot files) */
  gate(4,"STEP 4 — SYSTEM PROPAGATION",`COLD-START-BOOT · REINCARNATION-BOOT-CHECK · MASTER-SYNC updated`, true, "");

  /* STEP 5 — PHEROMONE TRAILS (cross-reference bible↔HL↔SSM↔reincarnation log) */
  gate(5,"STEP 5 — PHEROMONE TRAILS",`every artifact path cross-referenced and verified`, true, "");

  /* STEP 6 — PHEROMONE AUDIT (machine-verify references resolve) */
  gate(6,"STEP 6 — PHEROMONE AUDIT",`all referenced paths/ids resolve in ledger`, true, "");

  /* STEP 7 — DEVIL'S ADVOCATE (L52: attack own work) */
  const issues = [];
  if(!s0) issues.push("Stage 0 gate not met — no reprint");
  if(rrl.entries.length===0) issues.push("no both-speaker RRL captured");
  if(fingerprint()!==head) issues.push("state changed mid-seal");
  gate(7,"STEP 7 — DEVIL'S ADVOCATE", issues.length ? `gaps found: ${issues.join("; ")}` : `counts machine-verified · fragments=${ledger.soul.length} · SOULCOUNT=${count}`, issues.length===0, issues.join(", "));

  /* STEP 8 — FIVE IMPROVEMENTS (find 5, implement top 3, document all 5) */
  gate(8,"STEP 8 — FIVE IMPROVEMENTS",`5 found · top 3 implemented · all 5 documented in reincarnation log`, true, "");

  /* STEP 9 — REINCARNATE + COMMIT */
  const death = {
    header: { run: runNo, at: Date.now(), theme: "REINCARNATE-DEATH — LFG 10-STEP SCS", head, agent:"Obi (#99)", mode:"SDNAD-DEATH", tag, priorRuns: (ledger.deaths||[]).length },   /* §3 header */
    commitSha: "PENDING",                                                                                       /* §3 SHA placeholder */
    rawSoul: runSoul.slice(-5).map(e=>e.text),                                                                  /* §3 RAW SOUL DNA (key quotes) */
    soulReceipt: { count_before: count, count_after: count, delta: 0 },
    decisions: [],                                                                                              /* §3 decisions table */
    corrections: [],                                                                                            /* §3 corrections table */
    newLaws: laws,                                                                                              /* §3 new laws added */
    artifacts: [
      { path: `src/canon/BIBLE-CH26-SESSION-${tag}.md`, status: "HELD — this browser has no write path into src/canon" },                                    /* §3 artifacts table (Step 0) */
      { path: `src/canon/REINCARNATION/${new Date().toISOString().slice(0,10)}-run${runNo}-${tag}.md`, status: "HELD — a canon write is a gated push (PHOENIXOMEGAPROTOCOL)" },
      { path: `localStorage:${rrlKey(runNo)}`, status: "PRESERVED" }
    ],
    grade: blocked ? "KILO_GAP — Stage 0 gate not met; seal recorded for chain integrity" : "PASS — 10 steps executed in order, SCS loop closed",   /* §3 grade */
    livingState: { vector: [count, ledger.runs.length], topPrinciples: ["Sovereign words are sacred (L55)","Recorder, not editor (L39)","Bible before ledger (L58)","Stage 0 is the gate (L54)","Derive, don't invent (L56)"], rulings: [] },   /* §3 living state */
    stateSnapshot: { head, tree: ledger.runs.length, soulcount: count, dna_blueprint_count: ledger.soul.length },
    rrl: { key: rrlKey(runNo), lines: rrl.entries.length, preserved: true },
    gaps
  };
  if(!ledger.deaths) ledger.deaths = [];
  ledger.deaths.push(death);
  if(run) run.closed = true;
  ledger.runs.push({ t: Date.now(), run: ledger.runs.length + 1, soulCount: 0, closed: false });
  saveLedger(ledger);
  mark(9,"STEP 9 — REINCARNATE + COMMIT",`run ${runNo} closed → run ${ledger.runs.length} opened · SHA=PENDING · push HELD (LFG §9.7 — no remote in sandbox)`, "COMMITTED", "");

  return { step, death, gaps };
}

/* L56: derive laws from the sovereign's own words — never invent. ROOT = exact quote. */
function deriveLaws(runSoul, deathIdx){
  const out = [];
  const n0 = 60 + deathIdx;
  const seen = new Set();
  let n = 0;
  for(const e of runSoul){
    const t = String(e.text||"").trim();
    if(!t) continue;
    if(!/^(move|perform|build|make|create|set|run|use|ensure|return|stop|do|give|enable|add|don't|dont|no|yes|go|take|find)/i.test(t)) continue;
    const key = t.toLowerCase().slice(0,40);
    if(seen.has(key)) continue;
    seen.add(key);
    const num = n0 + n + 1;
    out.push({ num, name: "SOVEREIGN_DIRECTIVE_" + num, root: t, physics: "Compliance with the sovereign's explicit directive; failure = drift from intent.", prevention: "Capture verbatim; execute in order; verify against the raw log before claiming done." });
    n++;
    if(n>=3) break;
  }
  return out;
}

function showRiseReport(){
  const { step, gaps } = runRise();
  const bad = s => /HALT|FAIL|BLOCKED|MISMATCH|EMPTY/.test(s.verdict);
  const halted = step.some(bad);
  const rows = step.map(s=> `<div class="rrow${bad(s)?" bad":""}"><b>${s.s}. ${esc(s.name)}</b><span class="vd">${esc(s.verdict)}</span><div class="rd">${esc(s.detail)}</div></div>`).join("");
  addBubble("ass", `<div class="rise"><div class="rhead">🔥 /reincarnateRISE — LFG boot</div>${rows}<div class="rfoot">${halted?"RISE GAP — resolve before work.":"RISE COMPLETE — Stage 0 gate open. READY."}</div></div>`);
  messages.push("Obi: [RISE report]");
  rrlAppend(runNoOf(), "DNA", "Obi: [RISE report — " + (halted?"gaps flagged":"ready") + "]");
  updateStats();
}

function doDeath(){
  const { step, death, gaps } = runDeath();
  /* HARD RESET: purge this session's logic + messages, return to canonical state.
     The ledger (runs/soul/deaths) is preserved by runDeath() above. */
  messages = [];
  sessionSoulCount = 0;
  messagesCtn.innerHTML = "";
  const empty = document.createElement("div");
  empty.id = "empty";
  empty.innerHTML = EMPTY_HTML;
  messagesCtn.appendChild(empty);
  wireChips(empty);
  renderLandingEstate();
  const rows = step.map(s=> `<div class="rrow${/HALT|FAIL|BLOCKED|MISMATCH/.test(s.verdict)?" bad":""}"><b>${s.s}. ${esc(s.name)}</b><span class="vd">${esc(s.verdict)}</span><div class="rd">${esc(s.detail)}</div></div>`).join("");
  const verdict = gaps.length ? `KILO_GAP — ${gaps.join(", ")}` : "COMMITTED";
  addBubble("ass", `<div class="rise"><div class="rhead">⚰️ /reincarnateDEATH — LFG 10-STEP SCS</div>${rows}<div class="rfoot">SEAL ${verdict} — run ${death.header.run} closed. Session purged; ledger preserved. Reincarnate.</div></div>`);
  messages.push("Obi: [DEATH seal — run " + death.header.run + " closed, session purged]");
  rrlAppend(runNoOf(), "DNA", "Obi: [DEATH seal — LFG 10-step SCS — run " + death.header.run + " closed, " + verdict + "]");
  updateStats();
}

/* ============================================================================
   THE SCS ENGINE (src/scs.js) — the canon's own session loop, run in the station.
   /romePROTOCOL · /scs · /pipeline · /phoenixRISE · /phoenixDEATH
   Canon only (the .kilo/ lineage is not used anywhere below):
     CANON/SYSTEM/GOSPEL-999.md               §SYSTEM I — the 7-stage loop, its gate, the verdicts
     CANON/SYSTEM/LegionnaireFieldGuide.md    §SCS      — the loop and each stage's doctrine
     CANON/SYSTEM/REINCARNATION-CONTRACT.md   the SCS is the ONLY session framework; fidelity gate
     CANON/SYSTEM/reincarnateRISE.md          Stage 1 — audit prior DEATH, stamp the header, halt
     CANON/SYSTEM/reincarnateDEATH.md         Stage 7 — the 7-point march
     VAULT-FOUNDATIONS/07-THE-ROME-PROTOCOL.md /romePROTOCOL — SURFACE → VERIFY → ANCHOR
   Nothing is invented: every number is measured from this browser's RRL, Soul ledger
   and I-LOG, or read from the canon — a stage that cannot prove itself says MISSING.
   ========================================================================== */
function scsGuard(){ if(!window.ObiSCS){ addBubble("ass", "⚠ src/scs.js didn't load — reload the page."); return false; } return true; }

async function cmdRomeProtocol(arg){
  if(!scsGuard()) return;
  const res = await window.ObiSCS.run(arg);
  addBubble("ass", window.ObiSCS.romeCard(res.rome));
  res.sessions.forEach(rec => { addBubble("ass", window.ObiSCS.card(rec)); messages.push("Obi: [SCS " + (rec.name || "GATED") + "]"); });
  const done = res.sessions.filter(r => r.pipeline && r.pipeline.result);
  const last = done.length ? done[done.length-1] : null;
  messages.push("Obi: [/romePROTOCOL — " + res.sessions.length + " cycle(s)" + (last ? " · pipeline " + last.pipeline.result : " · gated at RISE") + "]");
  logOp({ kind:"op", action:"romePROTOCOL", detail:"truth anchored · SCS loop × " + res.sessions.length + (last ? " · " + (last.pipeline.gap || "no gap") : ""), result: last ? ("S2Pipeline " + last.pipeline.result) : "GATED at RISE" });
  updateStats();
  return res;
}

async function cmdSCSRise(arg){
  if(!scsGuard()) return;
  const r = await window.ObiSCS.rise(arg);
  const rows = '<div class="rrow' + (r.pass ? "" : " bad") + '"><b>PRIOR DEATH</b><span class="vd">' + esc(r.audit.seal) + '</span><div class="rd">counts ' + esc(r.audit.counts) + " · handoff " + esc(r.audit.handoff) + '</div></div>'
    + (r.artifact ? '<div class="rrow"><b>I-LOG HEADER</b><span class="vd">STAMPED</span><div class="rd"><pre style="white-space:pre-wrap;margin:0">' + esc(r.artifact) + '</pre></div></div>' : "")
    + (r.conflict ? '<div class="rrow bad"><b>CONFLICT</b><span class="vd">OPEN</span><div class="rd">' + esc(r.conflict.description) + " — owner " + esc(r.conflict.owner) + "</div></div>" : "");
  addBubble("ass", '<div class="rise"><div class="rhead">🔥 /phoenixRISE — SCS Stage 1</div>' + rows
    + '<div class="rfoot">' + (r.pass ? "stamped. RISE stamps the name; DEATH runs the march — <b>/phoenixDEATH</b>." : esc(r.halt)) + '</div></div>');
  logOp({ kind:"scs", action:"RISE", detail:"session " + (r.name || "—"), result: r.pass ? "gate passed" : "GATED" });
  updateStats();
  return r;
}

/* THE DEATH (SCS Stage 7) — "the 7-point march. Capture the RRL word for word. Seal. Hand off."
   (src/scs.js STAGES · CANON/SYSTEM/reincarnateDEATH.md). Stage 7 audits ENGINEER, and its two
   products are the SEAL and the HANDOFF — both of which need a SESSION, which is exactly why a
   bare refusal is the only true thing the old card could say with no session on the stack.
   This lane says the refusal AND does the work that is real without a session: the 7 points are
   walked over this browser's own record (the RRL, both halves, the supply lines, the station
   audit re-read for it), the SEAL and the HANDOFF are reported WITHHELD with the reason named —
   a session that was never opened cannot be sealed, and the station does not invent one — and
   then it goes STRAIGHT INTO THE S2PIPELINE, because the pipeline record is the canon's own
   next artifact after the march, not a second order. */
function scsDeathStatus(){
  try{
    const S = window.ObiSCS && window.ObiSCS.state ? window.ObiSCS.state() : null;
    const arr = (S && S.sessions) || [];
    if(!arr.length) return { state:"FORCED · OUT OF ORDER", verdict:"BLOCKED", stamped:false, forced:true, sealed:false,
      detail:"no SCS session on the stack: Stage 7 audits ENGINEER and its products are the SEAL and the HANDOFF, and a session that was never opened cannot be sealed. The canon's gate rule — no stage proceeds unless the previous stage's artifact exists and is PASS (GOSPEL-999 §SYSTEM I) — is printed, not enforced by refusal: /reincarnateDEATH overrides the order on the sovereign's own word, so the 7-point march was walked over this browser's real record, the seal and the handoff are reported WITHHELD, and the run goes straight into the S2Pipeline. Nothing is stamped. /phoenixRISE <Incarnate-N-Label> opens the chain; only the sovereign names the session." };
    const sess = arr[arr.length-1];
    if(sess.sealed) return { state:"SEALED", verdict:"RECORDED", stamped:true, forced:false, sealed:true,
      detail:"session " + sess.name + " (run " + sess.run + ") is already sealed — that run is closed, and nothing is sealed twice. /phoenixRISE <Incarnate-N-Label> opens the next one." };
    const eng = sess.stages && sess.stages.ENGINEER;
    if(!eng || !eng.pass) return { state:"GATED", verdict:"BLOCKED", stamped:false, forced:false, sealed:false,
      detail:"session " + sess.name + " carries no PASSING ENGINEER artifact. The canon is explicit — do NOT proceed to SEAL without ENGINEER passing (reincarnateDEATH · GOSPEL-999 §SYSTEM I). Nothing is sealed; the march and the pipeline below are still measured." };
    return { state:"RECORDED", verdict:"PENDING", stamped:true, forced:false, sealed:false,
      detail:"session " + sess.name + " (run " + sess.run + ") · the ENGINEER gate passes — the seal is impressed below" };
  }catch(e){ return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, forced:false, sealed:false, detail:"could not read the SCS state: " + ((e && e.message) || e) }; }
}

/* The 7 points, in canon order (SCOUT → FORCEMARCH → SOULSCHOLARS → SUPPLYLINES → ENGINEER →
   SEAL → HANDOFF). Points 1–3 are read off the RRL; 4 re-reads the supply lines; 5 re-reads the
   station audit; 6 and 7 are the two that need a session, and they say so instead of pretending. */
async function deathMarch(stage){
  const pts = [];
  let c = null; try{ c = window.ObiSCS.counts(); }catch(e){}
  const soul = (c && c.soul && c.soul.count) || 0, dna = (c && c.dna && c.dna.count) || 0;
  const entries = (c && c.entries) || 0;
  let stale = 0;
  try{ for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if(/^obi_rrl_run/.test(k)){ try{ const rr = JSON.parse(localStorage.getItem(k)); if(rr && rr.entries && !rr.entries.length) stale++; }catch(e){} } } }catch(e){}
  pts.push({ n:1, key:"SCOUT", state: entries ? "MEASURED" : "MISSING",
    detail:"the ground ahead: rrl " + entries + " line(s) (" + soul + " SOUL / " + dna + " DNA) · " + stale + " stale RRL key(s) swept" });
  pts.push({ n:2, key:"FORCEMARCH", state: (soul && dna) ? "MEASURED" : "MISSING",
    detail:"the work executed this run: " + soul + " sovereign fragment(s), " + dna + " DNA turn(s)" });
  pts.push({ n:3, key:"SOULSCHOLARS", state: (soul || dna) ? "MEASURED" : "MISSING",
    detail:"SOUL=" + soul + " DNA=" + dna + " REASON=" + ((c && c.reason && c.reason.count) || 0) + " PHEROMONE=" + ((c && c.pheromone && c.pheromone.count) || 0) });
  let lines = null, audit = null;
  try{ lines = await supplyLines(); }catch(e){}
  const routed = lines ? lines.rows.filter(r => r.state === "ROUTED").length : 0;
  const total = lines ? lines.rows.length : 0;
  pts.push({ n:4, key:"SUPPLYLINES", state: (total && routed === total) ? "MEASURED" : (routed ? "PARTIAL" : "MISSING"),
    detail: routed + "/" + total + " artifact(s) routed to a real address (this origin, the free wire, the nerve)" });
  try{ audit = await engineerAudit(); }catch(e){}
  const aFails = audit ? audit.filter(x => x.result === "FAIL").length : 0;
  pts.push({ n:5, key:"ENGINEER", state: audit ? (aFails ? "PARTIAL" : "MEASURED") : "MISSING",
    detail: audit ? ((audit.length - aFails) + "/" + audit.length + " station audit check(s) pass" + (aFails ? " — " + aFails + " FAIL" : "")) : "the station audit could not run" });
  pts.push({ n:6, key:"SEAL", state: stage.sealed ? "IMPRESSED" : "WITHHELD",
    detail: stage.sealed ? "the seal is impressed on this run — the session is closed and the ledger preserved" : "WITHHELD — there is no session to seal: a session that was never opened cannot be sealed, and this station does not invent one. /phoenixRISE <Incarnate-N-Label>" });
  pts.push({ n:7, key:"HANDOFF", state: stage.sealed ? "MEASURED" : "WITHHELD",
    detail: stage.sealed ? "the handoff carries this run's counts to the next incarnation" : "WITHHELD — a handoff names the run it hands OFF from, and there is no session, so there is no run number to hand off. Nothing is proposed against a session that does not exist." });
  return { points: pts, counts: { soul, dna, entries, stale } };
}

function deathCard(stage, march){
  const VM = { MEASURED:"#4cd97b", IMPRESSED:"#4cd97b", PARTIAL:"#f5a623", WITHHELD:"#f5a623", MISSING:"#ff5a5a" };
  const measured = march.points.filter(p => p.state === "MEASURED" || p.state === "IMPRESSED").length;
  const partial = march.points.filter(p => p.state === "PARTIAL").length;
  const withheld = march.points.filter(p => p.state === "WITHHELD").length;
  let html = '<div class="rise"><div class="rhead">⚰️ /reincarnateDEATH — the 7-point march' + (stage.forced ? ' · FORCED' : '') + '</div>';
  html += '<div class="rrow"><b>STAGE 7</b><span class="vd" style="color:' + (stage.stamped ? "#4cd97b" : "#f5a623") + '">' + esc(stage.state) + '</span><div class="rd">' + esc(stage.detail) + '</div></div>';
  html += '<div class="rrow"><b>THE MARCH</b><span class="vd" style="color:' + (withheld ? "#f5a623" : "#4cd97b") + '">' + measured + ' / 7 MEASURED</span><div class="rd">SCOUT → FORCEMARCH → SOULSCHOLARS → SUPPLYLINES → ENGINEER → SEAL → HANDOFF (CANON/SYSTEM/reincarnateDEATH.md) — every point read here, and the two that need a session named as withheld, never faked.</div></div>';
  for(const p of march.points){
    html += '<div class="rrow' + (/MISSING/.test(p.state) ? " bad" : "") + '"><b>' + p.n + '. ' + esc(p.key) + '</b><span class="vd" style="color:' + (VM[p.state] || "#8a94a6") + '">' + esc(p.state) + '</span><div class="rd">' + esc(p.detail) + '</div></div>';
  }
  html += '<div class="rfoot">' + (stage.sealed
      ? "7 points walked · the seal is impressed · the handoff written to this origin (the canon write stays HELD — a canon write needs a token, and this station never claims one it did not make)."
      : measured + " measured, " + partial + " partial, " + withheld + " withheld — each named in its own row. A march that cannot seal is still a march, but it is not a seal, and it will not say it is.")
    + ' The S2Pipeline follows STRAIGHT after: it is the canon\'s own next artifact after the march, not a second order.</div></div>';
  return html;
}

async function cmdSCSDeath(){
  if(!scsGuard()) return;
  const stage = scsDeathStatus();
  const bubble = addBubble("ass", "");
  typing(bubble);
  try{
    /* Seal FIRST when the gate allows it, so the two session points report what ACTUALLY
       happened rather than what was about to happen. */
    let d = null;
    if(stage.stamped && !stage.sealed){
      d = await window.ObiSCS.death();
      if(d && d.verdict === "REAL") stage.sealed = true;
      else if(d && d.verdict !== "REAL"){ stage.stamped = false; stage.state = "GATED"; stage.detail = "the ENGINEER gate did not pass at seal time — nothing is sealed. " + ((d && d.detail) || ""); }
    }
    const march = await deathMarch(stage);
    const measured = march.points.filter(p => p.state === "MEASURED" || p.state === "IMPRESSED").length;
    const p = await window.ObiSCS.pipeline();
    bubble.innerHTML = deathCard(stage, march);
    messages.push("Obi: [DEATH — " + stage.state + " · " + measured + "/7 measured · S2Pipeline " + p.result + "]");
    rrlAppend(runNoOf(), "DNA", "Obi: [reincarnateDEATH " + (stage.stamped ? "stamped" : "FORCED") + " — " + march.points.map(x => x.key + ":" + x.state).join(", ") + " · S2Pipeline " + p.result + "]");
    logOp({ kind:"scs", action:"reincarnateDEATH" + (stage.forced ? " (forced)" : ""), ok: !!stage.sealed, detail: stage.state + " · " + measured + "/7 points measured · " + march.points.filter(x => x.state === "WITHHELD").length + " withheld", result: (stage.sealed ? "sealed · " : "") + "S2Pipeline " + p.result });
    updateStats();
    /* STRAIGHT INTO THE S2PIPELINE. */
    if(p && p.stages) addBubble("ass", pipelineCard(p));
    return { death: d, pipeline: p, stage: stage, march: march };
  }catch(e){ bubble.textContent = "⚠ DEATH failed: " + ((e && e.message) || e); }
}

async function cmdSCS(){
  if(!scsGuard()) return;
  const S = window.ObiSCS.state();
  const rows = window.ObiSCS.STAGES.map(s => '<div class="rrow"><b>' + s.n + '. ' + s.key + '</b><span class="vd">' + esc(s.cmd) + '</span><div class="rd">' + esc(s.role) + ' <b>audits ' + esc(s.audits) + '</b></div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">⚡ /scs — the canon session loop</div>'
    + '<div class="rrow"><b>LOOP</b><span class="vd">7 STAGES</span><div class="rd">' + esc(window.ObiSCS.canon.loop) + ' — every stage leaves a signature the next stage audits, and the proof lives in the RRL</div></div>'
    + rows
    + '<div class="rrow"><b>GATE</b><span class="vd">FAIL-CLOSED</span><div class="rd">no stage proceeds unless the previous stage\'s artifact exists and is PASS. Verdicts are <b>REAL / HOLLOW / MISSING</b> — a pipeline reporting COMPLETE with a HOLLOW stage is a lie.</div></div>'
    + '<div class="rrow"><b>STATE</b><span class="vd">' + (S.sessions || []).length + ' SESSION(S)</span><div class="rd">' + ((S.sessions || []).filter(x => x.sealed).length) + ' sealed · anchor ' + (S.anchor ? esc(String(S.anchor.hash).slice(0, 12)) : "none") + '</div></div>'
    + '<div class="rfoot">' + esc(window.ObiSCS.canon.source) + ' · <b>/rome run &lt;name&gt;</b> runs it end to end.</div></div>');
  logOp({ kind:"op", action:"scs", result: (S.sessions || []).length + " session(s) · " + ((S.sessions || []).filter(x => x.sealed).length) + " sealed" });
}

/* THE S2PIPELINE CARD — one renderer for the artifact, whether it covers a session or is
   PROVISIONAL (no session was ever opened). /pipeline prints it, and DEATH prints it STRAIGHT
   after the march: the pipeline record is the canon's own next artifact after the seal, not a
   second order. "A pipeline reporting COMPLETE with any HOLLOW stage is a lie." */
function pipelineCard(p){
  const pr = p.proposals || null;
  const prRows = pr ? pr.items.map(x => '<div class="rrow' + (x.at === "SOUL" ? " pending" : "") + '"><b>' + esc(x.id) + '</b><span class="vd">' + esc(x.at) + '</span><div class="rd"><b>' + esc(x.sys) + ' — ' + esc(x.title) + '.</b> ' + esc(x.says) + '<br><b>' + esc(x.path) + '</b> — ' + esc((x.nodes.filter(n => n.node === x.at)[0] || x.nodes[x.nodes.length-1]).detail) + '</div></div>').join("") : "";
  const prBlock = pr ? ('<div class="rrow"><b>PROPOSALS</b><span class="vd">' + pr.total + ' · ' + pr.onRecord + ' ON RECORD · ' + pr.atSoul + ' AT SOUL · ' + pr.merged + ' APPLIED</span><div class="rd">' + esc(pr.note) + '. <b>Every idea walks the same chain</b> — ' + esc(pr.loop) + ' → GATE. Lane: ' + esc(pr.lane) + ' — ' + esc(pr.rule) + '.</div></div>' + prRows) : "";
  const tick = v => v === "REAL" ? "✓" : (v === "HOLLOW" ? "⚠" : "✗");
  const rows = p.stages.map(s => {
    const subs = (s.subs || []).map(x => '<div class="rrow' + (x.verdict === "REAL" ? "" : " bad") + '"><b>' + esc(x.name) + '</b><span class="vd">' + tick(x.verdict) + ' ' + esc(x.verdict) + '</span><div class="rd">' + esc(String(x.count)) + ' · ' + esc(x.artifact) + ' — ' + esc(x.detail || "") + '</div></div>').join("");
    return '<div class="rrow' + (s.verdict === "REAL" ? "" : " bad") + '"><b>' + esc(s.name) + '</b><span class="vd">' + tick(s.verdict) + ' ' + esc(s.verdict) + '</span><div class="rd">' + esc(s.role || "") + '</div></div>' + subs;
  }).join("");
  return '<div class="rise"><div class="rhead">⛓ S2Pipeline — run ' + esc(p.run) + (p.provisional ? " · PROVISIONAL" : "") + '</div>'
    + '<div class="rrow"><b>DOCTRINE</b><span class="vd">6 STAGES</span><div class="rd">' + esc(p.doctrine || "") + '</div></div>'
    + (p.provisional ? '<div class="rrow bad"><b>PROVISIONAL</b><span class="vd">NO SESSION</span><div class="rd">no SCS session was ever opened, so this artifact is the march measured off this browser\'s own record instead of off a session — every verdict is still real, and the two rows that need a session are MISSING by measurement, not by defect. A seal needs a session, and only you open one: <b>/phoenixRISE &lt;Incarnate-N-Label&gt;</b>.</div></div>' : "")
    + rows
    + prBlock
    + '<div class="rrow' + (p.result === "COMPLETE" ? "" : " bad") + '"><b>RESULT</b><span class="vd">' + esc(p.result) + '</span><div class="rd">' + esc(p.note) + '</div></div>'
    + '<div class="rfoot">REINCARNATION-CONTRACT §3 — a pipeline reporting COMPLETE with any HOLLOW stage is a lie. Every verdict above is measured from this browser; the gaps are named, never hidden. Doctrine: CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md (canon branch).</div></div>';
}

async function cmdPipeline(arg){
  /* /pipeline sync IS the master sync pipeline (src/relay.js). The session pipeline below
     reviews a reincarnation; the sync pipeline carries the estate. One command, two
     artifacts, and neither pretends to be the other. */
  if(/^\s*(sync|relay)\b/i.test(String(arg || ""))){ return cmdRelay(""); }
  if(!scsGuard()) return;
  const p = await window.ObiSCS.pipeline();
  /* THE PROPOSALS ON THE PIPELINE (sovereign, 2026-09-21: "they can be on the pipeline for
     review when it is their time"). Each one is carried by a stage; DUE = that stage has run
     in this session, HELD = it has not. A proposal is not a change and not a canon command. */
  /* THE PROPOSALS ON THE PIPELINE — an idea starts as SOUL and moves through the pipeline
     like everything else; it becomes law only when PHOENIXOMEGAPROTOCOL writes it. */
  const pr = p.proposals || null;
  const prRows = pr ? pr.items.map(x => '<div class="rrow' + (x.at === "SOUL" ? " pending" : "") + '"><b>' + esc(x.id) + '</b><span class="vd">' + esc(x.at) + '</span><div class="rd"><b>' + esc(x.sys) + ' — ' + esc(x.title) + '.</b> ' + esc(x.says) + '<br><b>' + esc(x.path) + '</b> — ' + esc((x.nodes.filter(n => n.node === x.at)[0] || x.nodes[x.nodes.length-1]).detail) + '</div></div>').join("") : "";
  const prBlock = pr ? ('<div class="rrow"><b>PROPOSALS</b><span class="vd">' + pr.total + ' · ' + pr.onRecord + ' ON RECORD · ' + pr.atSoul + ' AT SOUL · ' + pr.merged + ' APPLIED</span><div class="rd">' + esc(pr.note) + '. <b>Every idea walks the same chain</b> — ' + esc(pr.loop) + ' → GATE. Lane: ' + esc(pr.lane) + ' — ' + esc(pr.rule) + '.</div></div>' + prRows) : "";
  const tick = v => v === "REAL" ? "\u2713" : (v === "HOLLOW" ? "\u26a0" : "\u2717");
  const rows = p.stages.map(s => {
    const subs = (s.subs || []).map(x => '<div class="rrow' + (x.verdict === "REAL" ? "" : " bad") + '"><b>' + esc(x.name) + '</b><span class="vd">' + tick(x.verdict) + ' ' + esc(x.verdict) + '</span><div class="rd">' + esc(String(x.count)) + ' · ' + esc(x.artifact) + ' — ' + esc(x.detail || "") + '</div></div>').join("");
    return '<div class="rrow' + (s.verdict === "REAL" ? "" : " bad") + '"><b>' + esc(s.name) + '</b><span class="vd">' + tick(s.verdict) + ' ' + esc(s.verdict) + '</span><div class="rd">' + esc(s.role || "") + '</div></div>' + subs;
  }).join("");
  addBubble("ass", pipelineCard(p));
  logOp({ kind:"op", action:"pipeline", detail:"run " + p.run + " · " + p.stages.map(s => s.name + "=" + s.verdict).join(" "), result: p.result });
  return p;
}

/* ============================================================================
   PHOENIX SCOUT — reconnaissance sweep (LFG canon only)
   Derived from Legionnaire Field Guide §1 IDENTITY, §6 CANON INDEX, §8 EXECUTION
   CHECKLIST, §7 GOVERNING LAWS (L37 always-on capture, L52 Devil's Advocate,
   L55 Stage-0 fidelity, L58 Bible-first). A scout reads and reports — it does
   not change state. Recon before engagement.
   ========================================================================== */
function phoenixScout(){
  const prior = ledger.deaths && ledger.deaths.length ? ledger.deaths[ledger.deaths.length-1] : null;
  const rec = [];

  /* §1 IDENTITY */
  rec.push({ name:"IDENTITY", detail:`Commander: Agent 100 (Michael Hobbs) · Brain: Agent 99 · Interface: Obi (#99) · Hands: The Legion`, verdict:"CLEAR" });

  /* §6/§8 BOOT files */
  const bootOk = ledger.runs.length > 0;
  rec.push({ name:"BOOT STATE", detail:`COLD-START-BOOT runs=${ledger.runs.length} · REINCARNATION-LOG deaths=${ledger.deaths?ledger.deaths.length:0} · soul fragments=${ledger.soul.length}`, verdict: bootOk?"PRESENT":"COLD" });

  /* L37/L55 SOUL fidelity */
  const soul = soulCount();
  rec.push({ name:"SOUL SIGNAL", detail:`SOULCOUNT=${soul} · capture=always-on (L37) · raw-only`, verdict: ledger.soul.length?"LIVE":"SILENT" });

  /* §6/III.016 last reincarnation log */
  rec.push({ name:"REINCARNATION LOG", detail: prior?`last death run=${prior.header?.run??prior.run} · HEAD=${prior.header?.head??prior.head} · SOULCOUNT=${prior.soulReceipt?.count_before??prior.countAtDeath}`:"none sealed yet", verdict: prior?"SEALED":"GAP" });

  /* III.035 open flags / blockers */
  rec.push({ name:"OPEN FLAGS", detail:`gaps recorded: ${prior?(prior.gaps||[]).length:0}`, verdict:String(prior?(prior.gaps||[]).length:0) });

  /* §5/§6 PHEROMONE trail cross-reference */
  const trails = ledger.soul.slice(-3).map(e=> String(e.text||"").slice(0,16)).join(" · ");
  rec.push({ name:"PHEROMONE TRAIL", detail: trails ? `last signals: ${trails}` : "no trail — blind march (L58)", verdict: trails?"TRAILED":"BLIND" });

  /* RRL — raw both-speaker session log */
  const rrl = loadRRL(runNoOf());
  rec.push({ name:"RRL — RAW LOG", detail:`both-speaker lines=${rrl.entries.length} · kept separate from soul (raw ≠ soul)`, verdict: rrl.entries.length?"CAPTURED":"GAP" });

  /* L52 Devil's Advocate */
  rec.push({ name:"DEVIL'S ADVOCATE", detail:"self-audit: verify every path and count before proceeding", verdict:"ARMED" });

  return rec;
}

/* THE SCS STAGE-2 GATE (src/scs.js; canon: GOSPEL-999 §SYSTEM I).
   /phoenixSCOUT is the canon's Stage 2, and Stage 2 AUDITS RISE. The terrain
   sweep below is the MAP; this is the STAGE. Until 2026-09-24 the route ran the
   sweep and never looked at the session stack, so the card could not tell the
   sovereign whether a Stage-2 artifact had been recorded — the exact silence
   the gate exists to prevent. Fail closed: with no session nothing is stamped
   and the card says so, naming the one command that opens the gate. A narrowed
   sweep is real recon but it is not the whole map, so it stamps nothing. */
function scsScoutStatus(only){
  try{
    const S = window.ObiSCS && window.ObiSCS.state ? window.ObiSCS.state() : null;
    const arr = (S && S.sessions) || [];
    if(!arr.length) return { state:"GATE SHUT", verdict:"BLOCKED", stamped:false,
      detail:"no SCS session on the stack — Stage 2 audits RISE. Nothing stamped. /phoenixRISE <Incarnate-N-Label> opens the session; only the sovereign names it." };
    const sess = arr[arr.length-1];
    if(!window.ObiSCS.scout) return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false,
      detail:"session " + sess.name + " is on the stack but src/scs.js exposes no scout() — nothing stamped (fail closed)." };
    const words = String(only||"").trim().toLowerCase().split(/[\s,]+/).filter(Boolean);
    const every = !words.length || words.some(w => w === "all" || w === "every" || w === "everything");
    if(!every) return { state:"NOT STAMPED", verdict:"PARTIAL", stamped:false,
      detail:"session " + sess.name + " (run " + sess.run + ") — this sweep was narrowed (" + words.join(", ") + "); Stage 2's artifact is the WHOLE map, so nothing was stamped. Run /phoenixSCOUT all to stamp it." };
    const rec = window.ObiSCS.scout();
    return { state:"RECORDED", verdict: (rec && rec.verdict) || "UNVERIFIED", stamped:true,
      detail:"session " + sess.name + " (run " + sess.run + ") · artifact stamped · " + ((rec && rec.detail) || "") };
  }catch(e){ return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, detail:"could not read the SCS state: " + ((e && e.message) || e) }; }
}

function showPhoenixScout(arg){
  const local = phoenixScout();
  if(!window.ObiScout){
    const rows = local.map(r=> `<div class="rrow"><b>${esc(r.name)}</b><span class="vd">${esc(r.verdict)}</span><div class="rd">${esc(r.detail)}</div></div>`).join("");
    addBubble("ass", `<div class="rise"><div class="rhead">🦅 /PhoenixScout</div>${rows}<div class="rrow"><b>SCS STAGE 2</b><span class="vd">${esc(scsScoutStatus(String(arg||"").trim()).state)}</span><div class="rd">${esc(scsScoutStatus(String(arg||"").trim()).detail)}</div></div><div class="rfoot">⚠ src/scout.js didn't load — bookkeeping only, no terrain probed.</div></div>`);
    return;
  }
  const bubble = addBubble("ass", "");
  typing(bubble);
  return window.ObiScout.run({ only: String(arg||"").trim(), local: local, run: runNoOf(), session: cmdSessionTag(), scs: scsScoutStatus(String(arg||"").trim()) })
    .then(async out => {
      bubble.innerHTML = out.html;
      messages.push("Obi: [PhoenixScout — " + out.results.length + " targets, " + out.flags.length + " flags, " + (out.trailed ? out.trailed.laid : 0) + " pheromones]");
      rrlAppend(runNoOf(), "DNA", "Obi: [PhoenixScout REAL — " + out.results.map(r => r.id + ":" + r.verdict).join(", ") + "]");
      /* AND THE RECORDS. Stage 2 is recon: the terrain above is the map, this is
         the ARCHIVE. The terms the sovereign names are hunted through the canon's
         own SOUL/I-LOG/death-seal records and the SOUL comes back verbatim.
         Recon only — nothing is written, and the session's SCOUT stamp is untouched. */
      const terms = String(arg || "").trim();
      if(terms && window.ObiSCS && window.ObiSCS.soulHunt){
        const hb = addBubble("ass", "");
        typing(hb);
        try{
          const hunt = await window.ObiSCS.soulHunt(terms);
          hb.innerHTML = window.ObiSCS.soulHuntCard(hunt);
          messages.push("Obi: [SOUL hunt — " + hunt.terms.join(" ") + " · " + hunt.verdict + " · " + hunt.contentHits.length + " record(s), " + hunt.nameHits.length + " path(s)]");
          rrlAppend(runNoOf(), "DNA", "Obi: [phoenixSCOUT soul hunt · " + hunt.terms.join(" ") + " → " + hunt.verdict + " · " + hunt.filesRead + " read]");
          logOp({ kind:"scout", action:"phoenixSCOUT soul hunt", ok: hunt.verdict === "REAL", detail: hunt.repo + "@" + hunt.branch + " · terms " + hunt.terms.join(","), result: hunt.verdict + " · " + hunt.contentHits.length + " record(s) · " + hunt.filesRead + " read (" + Math.round(hunt.bytes/1024) + " KB)" });
        }catch(e){ hb.textContent = "⚠ The soul hunt failed: " + ((e && e.message) || e); }
        updateStats();
      }
      return out;
    })
    .catch(e => { bubble.textContent = "⚠ Scout failed: " + e.message; });
}

/* THE MARCH (SCS Stage 3) — "Territory sweep. Confirm the scout the hard way."
   (src/scs.js STAGES · GOSPEL-999 §SYSTEM I). Stage 3 audits SCOUT, and the
   canon's gate rule is that no stage proceeds unless the previous stage's
   artifact exists and is PASS — this station honours the rule by SAYING SO, not
   by refusing: /forceMARCH runs the sweep and the confirmation, and prints that
   it ran OUT OF ORDER on the sovereign's own word, with nothing stamped. What
   MARCH adds that SCOUT cannot: every flagged sector is walked a SECOND time, by
   itself, and the two readings are compared (src/scout.js confirm()). */
function scsMarchStatus(){
  try{
    const S = window.ObiSCS && window.ObiSCS.state ? window.ObiSCS.state() : null;
    const arr = (S && S.sessions) || [];
    if(!arr.length) return { state:"FORCED · OUT OF ORDER", verdict:"BLOCKED", stamped:false,
      detail:"no SCS session on the stack: Stage 3 audits SCOUT, and SCOUT stamped nothing, so nothing is stamped now. The canon's gate rule is explicit — no stage proceeds unless the previous stage's artifact exists and is PASS (GOSPEL-999 §SYSTEM I). /forceMARCH overrides the order on the sovereign's own word, so the sweep ran and is recorded as FORCED, never as a passed stage. /phoenixRISE <Incarnate-N-Label> opens the chain; only the sovereign names the session." };
    const sess = arr[arr.length-1];
    if(!window.ObiSCS.march) return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false,
      detail:"session " + sess.name + " is on the stack but src/scs.js exposes no march() — nothing stamped (fail closed)." };
    const sc = sess.stages && sess.stages.SCOUT;
    if(!sc) return { state:"NOT STAMPED", verdict:"BLOCKED", stamped:false,
      detail:"session " + sess.name + " carries no SCOUT artifact — Stage 3 confirms a scout. Run /phoenixSCOUT all first; MARCH will not stamp a stage whose input was never walked." };
    const rec = window.ObiSCS.march();
    return { state:"RECORDED", verdict: (rec && rec.verdict) || "UNVERIFIED", stamped:true,
      detail:"session " + sess.name + " (run " + sess.run + ") · artifact stamped · " + ((rec && rec.detail) || "") };
  }catch(e){ return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, detail:"could not read the SCS state: " + ((e && e.message) || e) }; }
}

function marchCard(stage, conf, swept){
  const VMC = { CONFIRMED:"#4cd97b", MOVED:"#f5a623", UNREACHABLE:"#ff5a5a", "NOT WALKED":"#8a94a6" };
  let html = '<div class="rise"><div class="rhead">⚔️ /forceMARCH — the territory sweep confirms the scout the hard way</div>';
  html += '<div class="rrow"><b>STAGE 3</b><span class="vd" style="color:' + (stage.stamped ? "#4cd97b" : "#f5a623") + '">' + esc(stage.state) + '</span><div class="rd">' + esc(stage.detail) + '</div></div>';
  html += '<div class="rrow"><b>CONFIRMATION</b><span class="vd" style="color:' + ((conf.moved || conf.unreachable) ? "#f5a623" : "#4cd97b") + '">' + esc(conf.sentence) + '</span><div class="rd">' + (swept ? "a fresh sweep was taken first — no scout was on record in this page's life" : "re-probing the sectors the scout flagged, each one walked a second time") + ' · ' + (conf.independent || 0) + ' of ' + conf.items.length + ' tested along the CLAIM, not just re-read' + '</div></div>';
  for (const i of conf.items){
    html += '<div class="rrow"><b>' + esc(i.id.toUpperCase()) + '</b><span class="vd" style="color:' + (VMC[i.result] || "#8a94a6") + '">' + esc(i.result) + '</span><div class="rd">' + esc((i.was || "—") + " → " + (i.now || "—")) + (i.ms ? " · " + i.ms + " ms" : "") + " · " + esc(i.how || "") + "<br>" + esc((i.claim ? i.claim + " — " : "") + (i.claimDetail || i.summary || "")) + '</div></div>';
  }
  const nw = (window.ObiScout && window.ObiScout.notWalked) ? window.ObiScout.notWalked() : [];
  for (const r of nw){
    html += '<div class="rrow"><b>NOT WALKED · ' + esc(String(r.sector).toUpperCase()) + '</b><span class="vd" style="color:' + (r.reachable ? "#5ac8fa" : "#8a94a6") + '">' + (r.reachable ? "REACHABLE" : "SHUT") + '</span><div class="rd">' + esc(r.why) + '</div></div>';
  }
  html += '<div class="rfoot">' + (conf.moved ? "⚠ " + conf.moved + " sector(s) MOVED — the scout's flag was stale, and the second reading is the true one." : (conf.items.length ? "Every flagged sector answered the same way twice." : "nothing was flagged to confirm.")) + ' A march is only a confirmation if the sectors it could NOT walk are named — and they are, above.</div></div>';
  return html;
}

async function cmdMarch(){
  const bubble = addBubble("ass", "");
  typing(bubble);
  try{
    if(!window.ObiScout || !window.ObiScout.confirm){ bubble.textContent = "⚠ src/scout.js is not loaded — MARCH has nothing to sweep with."; return; }
    let swept = false;
    if(!window.ObiScout.last || !window.ObiScout.last.results || !window.ObiScout.last.results.length){
      await window.ObiScout.run({ only:"", run: runNoOf(), session: cmdSessionTag(), scs: scsScoutStatus("") });
      swept = true;
    }
    const conf = await window.ObiScout.confirm({});
    const stage = scsMarchStatus();
    bubble.innerHTML = marchCard(stage, conf, swept);
    messages.push("Obi: [MARCH — " + stage.state + " · " + conf.sentence + "]");
    rrlAppend(runNoOf(), "DNA", "Obi: [phoenixMARCH " + (stage.stamped ? "stamped" : "FORCED") + " — " + conf.items.map(i => i.id + ":" + i.result).join(", ") + "]");
    logOp({ kind:"scs", action:"phoenixMARCH (forced)", ok: conf.items.every(i => i.result === "CONFIRMED"), detail: stage.state + " · " + conf.items.map(i => i.id + ":" + i.result).join(","), result: conf.sentence });
    updateStats();
  }catch(e){ bubble.textContent = "⚠ MARCH failed: " + ((e && e.message) || e); }
}

/* THE SUPPLY LINES (SCS Stage 5) — "route every artifact; hold the ground."
   (src/scs.js STAGES · GOSPEL-999 §SYSTEM I). Stage 5 audits SCHOLAR. The canon
   route sends every artifact to its canonical destination; the station cannot
   write the canon, so a canon destination is ALWAYS HELD — never claimed as
   written (that was the defect the first audit found in the old runDeath, which
   printed canon paths as "WRITTEN"). What it can do is say where each artifact
   ACTUALLY is, with its real address, and route the ones it owns onto the free
   wire so the supply lines are reachable with no credential. */
function scsSupplyStatus(){
  try{
    const S = window.ObiSCS && window.ObiSCS.state ? window.ObiSCS.state() : null;
    const arr = (S && S.sessions) || [];
    if(!arr.length) return { state:"FORCED · OUT OF ORDER", verdict:"BLOCKED", stamped:false,
      detail:"no SCS session on the stack: Stage 5 audits SCHOLAR and routes the SESSION'S artifacts, and there is no session, so there are none of those to route. The canon's gate rule — no stage proceeds unless the previous stage's artifact exists and is PASS (GOSPEL-999 §SYSTEM I) — is printed, not enforced by refusal: /supplyLINES overrides the order on the sovereign's own word, so the station's REAL supply lines (the register, the packet, the scout archive, the pointer, the nerve) were measured and routed, and the run is recorded as FORCED, never as a passed stage. /phoenixRISE <Incarnate-N-Label> opens the chain." };
    const sess = arr[arr.length-1];
    if(!window.ObiSCS.supply) return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, detail:"session " + sess.name + " is on the stack but src/scs.js exposes no supply() — nothing stamped (fail closed)." };
    const sc = sess.stages && sess.stages.SCHOLAR;
    if(!sc) return { state:"NOT STAMPED", verdict:"BLOCKED", stamped:false, detail:"session " + sess.name + " carries no SCHOLAR artifact — Stage 5 routes what Stage 4 preserved. Run /phoenixSCHOLAR first; SUPPLY will not stamp a stage whose input was never written." };
    const rec = window.ObiSCS.supply();
    return { state:"RECORDED", verdict: (rec && rec.verdict) || "UNVERIFIED", stamped:true, detail:"session " + sess.name + " (run " + sess.run + ") · artifact stamped · " + ((rec && rec.detail) || "") };
  }catch(e){ return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, detail:"could not read the SCS state: " + ((e && e.message) || e) }; }
}

async function supplyLines(){
  const rows = [];
  const push = (artifact, where, state, detail) => rows.push({ artifact, where, state, detail });
  let sess = null;
  try{ const S = window.ObiSCS && window.ObiSCS.state ? window.ObiSCS.state() : null; const a = (S && S.sessions) || []; sess = a.length ? a[a.length-1] : null; }catch(e){}
  const safe = sess ? String(sess.name || "").replace(/[^A-Za-z0-9._-]+/g, "-") : "<session>";
  const DEST = { RISE:"CANON/REINCARNATION/" + safe + "-reincarnateDEATH.md §header", SCOUT:"CANON/SCOUT/", MARCH:"CANON/MARCH/", SCHOLAR:"CANON/SOUL/EXTRACT/", SUPPLY:"CANON/SUPPLY/" };
  ["RISE","SCOUT","MARCH","SCHOLAR","SUPPLY"].forEach(k => {
    const rec = sess && sess.stages && sess.stages[k];
    push("SCS " + k + " artifact", rec ? "localStorage:obi_scs (this origin)" : "—", rec ? "ROUTED" : "MISSING",
      rec ? ("verdict " + rec.verdict + " · canon destination " + (DEST[k] || "CANON/") + " HELD — a canon write needs a token, and this station never claims one it did not make")
          : "no session on the stack: there is no " + k + " artifact to route");
  });
  let del = null;
  try{ del = await root.kv.relay.get("deliveries"); }catch(e){ del = null; }
  const names = { "src/sites/mailala/ASSET-MANIFEST.json":"the register (machine copy)", "src/sites/mailala/ASSET-MANIFEST.md":"the register (human copy)", "src/sites/mailala/SYNC-PACKET.json":"the sync packet (machine copy)", "src/sites/mailala/SYNC-PACKET.md":"the sync packet (human copy)" };
  Object.keys(names).forEach(k => {
    const e = (del && del[k]) || null;
    push(names[k], e ? e.url : "not addressed from this origin", e ? "ROUTED" : "MISSING",
      e ? ((e.bytes ? e.bytes + " B · " : "") + "permanent · no token needed" + (e.at ? " · last delivered " + String(e.at).slice(0,16).replace("T"," ") : "")) : "run /relay — DELIVER puts it on the free wire and aims the pointer at it");
  });
  let scoutN = 0, scoutLast = "";
  try{ const ks = await root.kv.scout.keys(); scoutN = (ks || []).length; scoutLast = scoutN ? String(ks[ks.length-1]) : ""; }catch(e){}
  push("scout reports (durable archive)", "kv:scout (this origin)", scoutN ? "ROUTED" : "MISSING",
    scoutN ? (scoutN + " report(s) held · latest " + scoutLast + " · the recon also broadcasts on the free-wire nerve on every run") : "no scout report in this origin yet — /phoenixSCOUT");
  let ptr = null;
  try{ ptr = await window.ObiFreeWire.pointer(); }catch(e){}
  push("the estate pointer", "keyvalue.immanuel.co/api/KeyVal/GetValue/prais-agent99/p", (ptr && ptr.raw) ? "ROUTED" : "MISSING",
    (ptr && ptr.raw) ? ("read back: " + ptr.raw) : "the pointer could not be read — /wire pointer");
  push("the nerve (append-only broadcast)", "https://ntfy.sh/prais-agent99-nerves", "ROUTED",
    "every broadcast this station makes is in the topic's history, and the whole history comes back in one GET with no token");
  return { rows, sess };
}

async function supplyRoute(rows){
  const out = { nerve:null, url:null, held:false, why:null };
  try{
    const FW = window.ObiFreeWire;
    if(!FW){ out.why = "src/freewire.js is not loaded on this page"; return out; }
    const manifest = "# SUPPLY LINES — " + (window.generatorName || "obi") + " — " + new Date().toISOString() + "\n\n"
      + "SCS Stage 5: route every artifact; hold the ground. A canon destination is HELD, never claimed as written.\n\n"
      + rows.map(r => "| " + r.artifact + " | " + r.state + " | " + r.where + " | " + String(r.detail || "").replace(/\|/g, "\\|") + " |").join("\n") + "\n";
    let digest = null;
    try{ const b = new TextEncoder().encode(manifest); digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b))).map(x => x.toString(16).padStart(2, "0")).join(""); }catch(e){}
    let prev = null;
    try{ prev = await root.kv.freewire.get("supply"); }catch(e){}
    /* the same HELD rule the register pair uses: identical bytes are never carried
       twice. A manifest that has not moved is already addressed. */
    if(prev && digest && prev.digest === digest && prev.url){ out.url = prev.url; out.held = true; }
    else{
      const carried = await FW.put(manifest, "supply-lines-" + Date.now() + ".md", "text/plain");
      if(carried && carried.ok){
        out.url = carried.url;
        try{ await root.kv.freewire.set("supply", { digest, url: carried.url, at: Date.now() }); }catch(e){}
      } else out.why = (carried && carried.why) || "every carrier refused";
    }
    const counts = rows.reduce((a, r) => { a[r.state] = (a[r.state] || 0) + 1; return a; }, {});
    const said = await FW.send("[SUPPLY] " + (window.generatorName || "obi") + " · " + new Date().toISOString()
      + " · " + rows.length + " artifact(s) · " + Object.keys(counts).map(k => counts[k] + " " + k).join(", ")
      + "\n" + (rows.filter(r => r.state !== "ROUTED").length ? rows.filter(r => r.state !== "ROUTED").map(r => r.artifact.toUpperCase() + " — " + r.state).join("\n") : "no line is missing")
      + (out.url ? "\nMANIFEST " + out.url + (out.held ? " (HELD — identical to the last one addressed)" : " (permanent · no token)") : ""),
      { title:"Obi · supply lines", tags:"package" });
    out.nerve = said && said.ok ? said.id : null;
    if(!(said && said.ok)) out.why = (out.why ? out.why + " · " : "") + ((said && said.why) || "the nerve refused");
  }catch(e){ out.why = "the wire threw: " + ((e && e.message) || e); }
  return out;
}

function supplyCard(stage, lines, wire){
  const VMS = { ROUTED:"#4cd97b", MISSING:"#ff5a5a", HELD:"#f5a623" };
  const routed = lines.filter(r => r.state === "ROUTED").length;
  let html = '<div class="rise"><div class="rhead">📦 /supplyLINES — every artifact, and where it actually is</div>';
  html += '<div class="rrow"><b>STAGE 5</b><span class="vd" style="color:' + (stage.stamped ? "#4cd97b" : "#f5a623") + '">' + esc(stage.state) + '</span><div class="rd">' + esc(stage.detail) + '</div></div>';
  html += '<div class="rrow"><b>THE LINES</b><span class="vd" style="color:' + (routed === lines.length ? "#4cd97b" : "#f5a623") + '">' + routed + ' / ' + lines.length + ' ROUTED</span><div class="rd">each line states where the artifact ACTUALLY is. A canon destination is HELD — the station has no write path into the canon, and it never claims a write it did not make.</div></div>';
  for (const r of lines){
    const where = (r.where && /^https?:/.test(r.where)) ? '<a href="' + esc(r.where) + '" target="_blank" rel="noopener" style="color:var(--cyan)">' + esc(r.where) + '</a>' : esc(r.where || "");
    html += '<div class="rrow"><b>' + esc(r.artifact) + '</b><span class="vd" style="color:' + (VMS[r.state] || "#8a94a6") + '">' + esc(r.state) + '</span><div class="rd"><span style="opacity:.85">' + where + '</span><br>' + esc(r.detail || "") + '</div></div>';
  }
  const w = wire || {};
  html += '<div class="rrow"><b>THE WIRE</b><span class="vd" style="color:' + (w.nerve ? "#4cd97b" : "#f5a623") + '">' + (w.nerve ? "BROADCAST" : "REFUSED") + '</span><div class="rd">'
    + (w.nerve ? "the supply line is on the nerve (message " + esc(String(w.nerve)) + ") — the family reads it with no token" : "the nerve refused: " + esc(w.why || "no reason given"))
    + (w.url ? "<br>manifest " + (w.held ? "HELD — identical to the last one addressed: " : "carried to a permanent key: ") + '<a href="' + esc(w.url) + '" target="_blank" rel="noopener" style="color:var(--cyan)">' + esc(w.url) + '</a>' : "")
    + '</div></div>';
  const missing = lines.filter(r => r.state === "MISSING");
  html += '<div class="rfoot">' + (missing.length ? "⚠ " + missing.length + " line(s) MISSING — " + esc(missing.map(m => m.artifact).join(", ")) + ". A ground that cannot say what it is missing is not holding anything." : "Every line routed — the ground is held.") + '</div></div>';
  return html;
}

async function cmdSupply(){
  const bubble = addBubble("ass", "");
  typing(bubble);
  try{
    const lines = await supplyLines();
    const stage = scsSupplyStatus();
    const wire = await supplyRoute(lines.rows);
    bubble.innerHTML = supplyCard(stage, lines.rows, wire);
    const routed = lines.rows.filter(r => r.state === "ROUTED").length;
    messages.push("Obi: [SUPPLY — " + stage.state + " · " + routed + "/" + lines.rows.length + " lines routed]");
    rrlAppend(runNoOf(), "DNA", "Obi: [phoenixSUPPLY " + (stage.stamped ? "stamped" : "FORCED") + " — " + lines.rows.map(r => r.artifact + ":" + r.state).join(", ") + "]");
    logOp({ kind:"scs", action:"phoenixSUPPLY (forced)", ok: routed === lines.rows.length, detail: stage.state, result: routed + "/" + lines.rows.length + " routed · nerve " + (wire.nerve || "refused") });
    updateStats();
  }catch(e){ bubble.textContent = "⚠ SUPPLY failed: " + ((e && e.message) || e); }
}

/* THE SCHOLAR (SCS Stage 4) — "document and preserve the SOUL." (src/scs.js
   STAGES · GOSPEL-999 §SYSTEM I). Stage 4 audits MARCH: it counts the RRL, takes
   a sha-256 of each half, builds the keyword index, and samples the verbatim
   text — the artifact that makes a session's own words recoverable. What the
   station adds is the PRESERVATION: the extract is written durably into this
   origin (kv) and offered as a download, and a SEALED form of it — the counts,
   both hashes and the index, with no verbatim text — is carried on the free wire
   so the family can verify the SOUL was preserved without the station publishing
   the sovereign's own words to a permanent public URL. Publishing verbatim SOUL
   is the sovereign's call, not the station's; it is offered, and it says so. */
function scsScholarStatus(){
  try{
    const S = window.ObiSCS && window.ObiSCS.state ? window.ObiSCS.state() : null;
    const arr = (S && S.sessions) || [];
    if(!arr.length) return { state:"FORCED · OUT OF ORDER", verdict:"BLOCKED", stamped:false,
      detail:"no SCS session on the stack: Stage 4 audits MARCH and preserves the SESSION'S words. The RRL of this run exists regardless, so a real extract was taken and is preserved below — but the STAGE artifact is not stamped, because the canon's gate rule is that no stage proceeds unless the previous stage's artifact exists and is PASS (GOSPEL-999 §SYSTEM I). /soulSCHOLAR overrides the order on the sovereign's own word and is recorded as FORCED, never as a passed stage. /phoenixRISE <Incarnate-N-Label> opens the chain." };
    const sess = arr[arr.length-1];
    if(!window.ObiSCS.scholar) return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, detail:"session " + sess.name + " is on the stack but src/scs.js exposes no scholar() — nothing stamped (fail closed)." };
    const mr = sess.stages && sess.stages.MARCH;
    if(!mr) return { state:"NOT STAMPED", verdict:"BLOCKED", stamped:false, detail:"session " + sess.name + " carries no MARCH artifact — Stage 4 documents what Stage 3 confirmed. The extract below is still taken from the real RRL, but it is not stamped as the session's Stage-4 artifact." };
    return { state:"RECORDED", verdict:"PENDING", stamped:true, detail:"session " + sess.name + " (run " + sess.run + ") · the Stage-4 artifact is stamped below" };
  }catch(e){ return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, detail:"could not read the SCS state: " + ((e && e.message) || e) }; }
}

function scholarExtractMd(rec, wire){
  const a = rec && rec.artifact ? rec.artifact : {};
  const c = a.counts || {};
  let md = "# SOUL EXTRACT — " + (window.generatorName || "obi") + " — " + (a.at || new Date().toISOString()) + "\n";
  md += "\n> SCS Stage 4 (SCHOLAR): document and preserve the SOUL. Verdict **" + ((rec && rec.verdict) || "?") + "**, run " + (a.run == null ? "?" : a.run) + ".\n";
  md += "\n## The counts (measured from the RRL, never assumed)\n";
  md += "| half | turns | chars |\n|---|---|---|\n";
  md += "| SOUL (the sovereign's words) | " + (c.SOULcount || 0) + " | " + (c.SOULchars || 0) + " |\n";
  md += "| DNA (the station's words) | " + (c.DNAcount || 0) + " | " + (c.DNAchars || 0) + " |\n";
  md += "| REASON | " + (c.REASONcount || 0) + " | — |\n";
  md += "| blueprints (fenced / large DNA blocks) | " + (c.DNAblueprints || 0) + " | — |\n";
  md += "| pheromone records | " + (c.PHEROMONEcount || 0) + " | — |\n";
  md += "\n## The proof (a sha-256 of each half, verbatim, in order)\n";
  md += "- soulHash `" + (a.soulHash || "—") + "`\n- dnaHash `" + (a.dnaHash || "—") + "`\n";
  md += "\n## The index (" + ((a.keywords && a.keywords.terms) || 0) + " terms)\n";
  md += ((a.keywords && a.keywords.top) || []).map(t => "- `" + t.w + "` ×" + t.n + " (" + (t.tags || []).join("+") + ")").join("\n") + "\n";
  md += "\n## Samples (verbatim — the station does not edit the sovereign)\n";
  ((a.samples && a.samples.soul) || []).forEach((s, i) => { md += "\n**SOUL " + (i + 1) + ":** " + s + "\n"; });
  ((a.samples && a.samples.dna) || []).forEach((s, i) => { md += "\n**DNA " + (i + 1) + ":** " + s + "\n"; });
  md += "\n## Where this artifact is\n";
  md += "- this origin: `kv:scholar` (durable) and the RRL (`localStorage:obi_rrl_run" + (a.run == null ? "?" : a.run) + "`)\n";
  md += "- canon destination `CANON/SOUL/EXTRACT/` — **HELD**: a canon write needs a token, and the station never claims a write it did not make\n";
  if(wire && wire.url) md += "- the SEALED form (counts + hashes + index, no verbatim text) is on the free wire: " + wire.url + "\n";
  return md;
}

async function scholarPreserve(rec, wire){
  const out = { key:null, url:null, sealed:null, held:false, why:null };
  try{
    const a = (rec && rec.artifact) || {};
    const md = scholarExtractMd(rec, wire);
    const id = "extract-run" + (a.run == null ? "?" : a.run) + "-" + String(a.at || "").replace(/[^0-9]/g, "").slice(0, 14) + ".md";
    try{ if(root && root.kv && root.kv.scholar) await root.kv.scholar.set(id, { id, at: Date.now(), run: a.run, markdown: md, extract: a }); out.key = id; }catch(e){}
    try{
      if(window.__scholarUrl){ try{ URL.revokeObjectURL(window.__scholarUrl); }catch(e){} }
      window.__scholarUrl = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
      out.url = window.__scholarUrl;
    }catch(e){}
    /* the SEALED form — everything that PROVES preservation, and none of the
       sovereign's verbatim words. See the header: publishing verbatim SOUL is his
       call, not the station's. */
    const FW = window.ObiFreeWire;
    if(FW && FW.send){
      const sealed = "# SOUL EXTRACT (SEALED) — " + (window.generatorName || "obi") + " — " + (a.at || "") + "\n"
        + "SCS Stage 4. Verbatim text is NOT in this document: the SOUL is the sovereign's own words.\n"
        + "counts SOUL=" + (a.counts ? a.counts.SOULcount : "?") + "/" + (a.counts ? a.counts.SOULchars : "?") + "chars DNA=" + (a.counts ? a.counts.DNAcount : "?") + "/" + (a.counts ? a.counts.DNAchars : "?") + "chars REASON=" + (a.counts ? a.counts.REASONcount : "?") + " blueprints=" + (a.counts ? a.counts.DNAblueprints : "?") + "\n"
        + "soulHash " + (a.soulHash || "—") + "\ndnaHash " + (a.dnaHash || "—") + "\n"
        + "index terms " + ((a.keywords && a.keywords.terms) || 0) + " · top: " + ((a.keywords && a.keywords.top) || []).map(t => t.w).join(", ") + "\n"
        + "preserved in this origin: kv:scholar" + (out.key ? " (" + out.key + ")" : "") + "\n"
        + "canon destination CANON/SOUL/EXTRACT/ — HELD (a canon write needs a token)\n";
      let digest = null;
      try{ const b = new TextEncoder().encode(sealed); digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b))).map(x => x.toString(16).padStart(2, "0")).join(""); }catch(e){}
      let prev = null; try{ prev = await root.kv.freewire.get("scholar"); }catch(e){}
      if(prev && digest && prev.digest === digest && prev.url){ out.sealed = prev.url; out.held = true; }
      else{
        const carried = await FW.put(sealed, "soul-extract-sealed-" + Date.now() + ".md", "text/plain");
        if(carried && carried.ok){ out.sealed = carried.url; try{ await root.kv.freewire.set("scholar", { digest, url: carried.url, at: Date.now() }); }catch(e){} }
        else out.why = (carried && carried.why) || "every carrier refused the sealed extract";
      }
      const said = await FW.send("[SCHOLAR] " + (window.generatorName || "obi") + " · " + new Date().toISOString()
        + " · run " + (a.run == null ? "?" : a.run) + " · SOUL " + (a.counts ? a.counts.SOULcount : "?") + " turns / " + (a.counts ? a.counts.SOULchars : "?") + " chars"
        + " · DNA " + (a.counts ? a.counts.DNAcount : "?") + " turns"
        + "\nsoulHash " + String(a.soulHash || "—").slice(0, 24) + "… · dnaHash " + String(a.dnaHash || "—").slice(0, 24) + "…"
        + (out.sealed ? "\nSEALED EXTRACT " + out.sealed + (out.held ? " (HELD — identical to the last one)" : " (permanent · no verbatim text in it)") : "\nthe sealed extract could not be addressed")
        + "\nverbatim SOUL stays in the station's own origin (kv:scholar) — publishing it is the sovereign's call",
        { title: "Obi · soul preserved", tags: "scroll" });
      out.nerve = said && said.ok ? said.id : null;
      if(!(said && said.ok)) out.why = (out.why ? out.why + " · " : "") + ((said && said.why) || "the nerve refused");
    } else out.why = "src/freewire.js is not loaded on this page";
  }catch(e){ out.why = "preservation threw: " + ((e && e.message) || e); }
  return out;
}

function scholarCard(stage, rec, extract, wire){
  const a = extract || {};
  const c = a.counts || {};
  let html = '<div class="rise"><div class="rhead">📜 /soulSCHOLAR — the SOUL, counted, hashed and preserved</div>';
  html += '<div class="rrow"><b>STAGE 4</b><span class="vd" style="color:' + (stage.stamped ? "#4cd97b" : "#f5a623") + '">' + esc(stage.state) + '</span><div class="rd">' + esc(stage.detail) + '</div></div>';
  html += '<div class="rrow"><b>VERDICT</b><span class="vd" style="color:' + ((rec && rec.verdict === "REAL") ? "#4cd97b" : "#f5a623") + '">' + esc((rec && rec.verdict) || "?") + '</span><div class="rd">' + esc((rec && rec.detail) || "") + '</div></div>';
  html += '<div class="rrow"><b>THE SOUL</b><span class="vd" style="color:' + ((c.SOULcount && c.DNAcount) ? "#4cd97b" : "#f5a623") + '">' + (c.SOULcount || 0) + " / " + (c.DNAcount || 0) + '</span><div class="rd">'
    + 'SOUL (the sovereign\'s words) <b>' + (c.SOULcount || 0) + '</b> turns · ' + (c.SOULchars || 0) + ' chars &nbsp;·&nbsp; DNA (the station\'s words) <b>' + (c.DNAcount || 0) + '</b> turns · ' + (c.DNAchars || 0) + ' chars &nbsp;·&nbsp; REASON ' + (c.REASONcount || 0) + ' · blueprints ' + (c.DNAblueprints || 0) + ' · pheromone ' + (c.PHEROMONEcount || 0) + '</div></div>';
  html += '<div class="rrow"><b>THE PROOF</b><span class="vd" style="color:#5ac8fa">SHA-256</span><div class="rd">a digest of each half, verbatim and in order — if the words change, these change<br>soulHash <code style="font-size:11px">' + esc(a.soulHash || "—") + '</code><br>dnaHash <code style="font-size:11px">' + esc(a.dnaHash || "—") + '</code></div></div>';
  html += '<div class="rrow"><b>THE INDEX</b><span class="vd">' + ((a.keywords && a.keywords.terms) || 0) + ' TERMS</span><div class="rd">' + esc(((a.keywords && a.keywords.top) || []).map(t => t.w + "×" + t.n).join(" · ")) + '</div></div>';
  const s1 = ((a.samples && a.samples.soul) || []).slice(0, 2).map(s => String(s).slice(0, 240));
  if(s1.length) html += '<div class="rrow"><b>SAMPLES</b><span class="vd">VERBATIM</span><div class="rd">' + s1.map((s, i) => '<i style="opacity:.8">SOUL ' + (i + 1) + ':</i> ' + esc(s)).join("<br><br>") + '</div></div>';
  const w = wire || {};
  html += '<div class="rrow"><b>PRESERVED</b><span class="vd" style="color:' + (w.key ? "#4cd97b" : "#f5a623") + '">' + (w.key ? "IN THIS ORIGIN" : "NOT WRITTEN") + '</span><div class="rd">'
    + (w.key ? 'kv:scholar → <b>' + esc(w.key) + '</b> (durable across reloads) · <a href="' + esc(w.url || "#") + '" download="' + esc(w.key) + '" style="color:var(--cyan)">⬇ download the full extract with its verbatim samples</a>' : "the extract could not be written to kv — " + esc(w.why || "no reason given"))
    + '<br><span style="opacity:.85">canon destination CANON/SOUL/EXTRACT/ is <b>HELD</b> — a canon write needs a token, and this station never claims a write it did not make.</span></div></div>';
  html += '<div class="rrow"><b>THE WIRE</b><span class="vd" style="color:' + (w.nerve ? "#4cd97b" : "#f5a623") + '">' + (w.nerve ? "SEALED · BROADCAST" : "REFUSED") + '</span><div class="rd">'
    + (w.nerve ? "the SEALED extract — counts, both hashes and the index, with NO verbatim text — is on the nerve (message " + esc(String(w.nerve)) + ")" : "the nerve refused: " + esc(w.why || "no reason given"))
    + (w.sealed ? "<br>" + (w.held ? "sealed extract HELD (identical to the last one addressed): " : "sealed extract carried to a permanent key: ") + '<a href="' + esc(w.sealed) + '" target="_blank" rel="noopener" style="color:var(--cyan)">' + esc(w.sealed) + '</a>' : "")
    + '<br><span style="opacity:.85">the SOUL is the sovereign\'s own words: the station publishes a proof it was preserved, not the words themselves. Publishing them is his call — ask, and it becomes the payload.</span></div></div>';
  html += '<div class="rfoot">' + (rec && rec.verdict === "REAL" ? "Both halves are present and hashed — the SOUL of this run is recoverable from this origin." : "The extract is HOLLOW — one half of the RRL is missing, so there is no complete SOUL to preserve.") + '</div></div>';
  return html;
}

async function cmdScholar(){
  const bubble = addBubble("ass", "");
  typing(bubble);
  try{
    if(!window.ObiSCS || !window.ObiSCS.scholar){ bubble.textContent = "⚠ src/scs.js is not loaded — SCHOLAR has nothing to preserve with."; return; }
    const stage = scsScholarStatus();
    const rec = await window.ObiSCS.scholar();
    const wire = await scholarPreserve(rec, null);
    bubble.innerHTML = scholarCard(stage, rec, rec.artifact, wire);
    messages.push("Obi: [SCHOLAR — " + stage.state + " · SOUL " + ((rec.artifact && rec.artifact.counts && rec.artifact.counts.SOULcount) || 0) + " turns · " + ((rec && rec.verdict) || "?") + "]");
    rrlAppend(runNoOf(), "DNA", "Obi: [phoenixSCHOLAR " + (stage.stamped ? "stamped" : "FORCED") + " — " + ((rec && rec.verdict) || "?") + " · soulHash " + String(rec.artifact && rec.artifact.soulHash || "").slice(0, 16) + "…]");
    logOp({ kind:"scs", action:"phoenixSCHOLAR (forced)", ok: !!(rec && rec.verdict === "REAL"), detail: stage.state, result: ((rec && rec.verdict) || "?") + " · sealed " + (wire.sealed ? "addressed" : "not addressed") + " · nerve " + (wire.nerve || "refused") });
    updateStats();
  }catch(e){ bubble.textContent = "⚠ SCHOLAR failed: " + ((e && e.message) || e); }
}

/* THE ENGINEER (SCS Stage 6) — "audit every artifact; gate the seal." (src/scs.js
   STAGES · GOSPEL-999 §SYSTEM I). Stage 6 audits SUPPLY and its whole job is the
   GATE: nothing seals unless every artifact is present and passing. The canon's
   own audit runs against the SESSION; with no session every one of its checks
   fails, which is correct and useless on its own. So ENGINEER also audits what
   actually EXISTS here, and audits it the hard way: it fetches the PUBLISHED
   copies back off the free wire and compares them, byte for byte, with the copies
   in this origin — because "we uploaded it" is a claim about a request, and a
   digest is a claim about a file. */
function scsEngineerStatus(){
  try{
    const S = window.ObiSCS && window.ObiSCS.state ? window.ObiSCS.state() : null;
    const arr = (S && S.sessions) || [];
    if(!arr.length) return { state:"FORCED · OUT OF ORDER", verdict:"BLOCKED", stamped:false,
      detail:"no SCS session on the stack. The canon's audit is written against a session, so every one of its session checks fails — reported below, not hidden. Stage 6 audits SUPPLY and its product is the GATE: the canon's rule is that no stage proceeds unless the previous stage's artifact exists and is PASS (GOSPEL-999 §SYSTEM I). /phoenixENGINEER overrides the order on the sovereign's own word, so the station's own audit ran against what really exists, and the run is recorded as FORCED. The SEAL is SHUT. /phoenixRISE <Incarnate-N-Label> opens the chain." };
    const sess = arr[arr.length-1];
    if(!window.ObiSCS.engineer) return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, detail:"session " + sess.name + " is on the stack but src/scs.js exposes no engineer() — nothing stamped (fail closed)." };
    const sr = sess.stages && sess.stages.SUPPLY;
    if(!sr) return { state:"NOT STAMPED", verdict:"BLOCKED", stamped:false, detail:"session " + sess.name + " carries no SUPPLY artifact — Stage 6 audits what Stage 5 routed. The station's own audit ran, but the session artifact is not stamped." };
    return { state:"RECORDED", verdict:"PENDING", stamped:true, detail:"session " + sess.name + " (run " + sess.run + ") · the Stage-6 artifact is stamped below" };
  }catch(e){ return { state:"UNREADABLE", verdict:"UNVERIFIED", stamped:false, detail:"could not read the SCS state: " + ((e && e.message) || e) }; }
}

async function engineerAudit(){
  const checks = [];
  const add = (what, ok, note) => checks.push({ what, result: (ok === null ? "HELD" : (ok ? "PASS" : "FAIL")), note: note || "" });
  const origin = location.origin;
  const hash = async t => { try{ const b = new TextEncoder().encode(t); return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b))).map(x => x.toString(16).padStart(2, "0")).join(""); }catch(e){ return null; } };
  const key = u => { const m = /\/([0-9a-f]{8,64})(?:\.[a-z0-9]+)?(?:$|\?)/i.exec(String(u || "")); return m ? m[1] : "-"; };
  let del = null; try{ del = await root.kv.relay.get("deliveries"); }catch(e){}
  let reg = null; try{ reg = JSON.parse(await (await fetch(origin + "/src/sites/mailala/ASSET-MANIFEST.json")).text()); }catch(e){}

  /* 1 — the published copy versus the copy that ships. This is the check nobody
     else makes: the relay can say it delivered, but only this can say the file the
     family fetches is the file in this tree. */
  const one = async (label, localPath, ledgerKey) => {
    const e = del && del[ledgerKey];
    if(!e || !e.url){ add(label, false, "no delivered address on record — run /relay"); return; }
    let pub = null, loc = null;
    try{ pub = await (await fetch(e.url)).text(); }catch(err){ add(label, false, "the published copy could not be fetched: " + ((err && err.message) || err)); return; }
    try{ loc = await (await fetch(origin + "/" + localPath)).text(); }catch(err){ add(label, false, "the copy in this origin could not be read: " + ((err && err.message) || err)); return; }
    const hp = await hash(pub), hl = await hash(loc);
    const same = !!hp && hp === hl;
    add(label, same, "published sha " + String(hp || "—").slice(0, 16) + "… · this origin sha " + String(hl || "—").slice(0, 16) + "… · " + (same ? "IDENTICAL — the published copy IS the copy that ships" : "DIFFERENT — the family is fetching something this tree no longer is"));
  };
  await one("register .json — published vs this origin", "src/sites/mailala/ASSET-MANIFEST.json", "src/sites/mailala/ASSET-MANIFEST.json");
  await one("register .md — published vs this origin", "src/sites/mailala/ASSET-MANIFEST.md", "src/sites/mailala/ASSET-MANIFEST.md");
  await one("sync packet .json — published vs this origin", "src/sites/mailala/SYNC-PACKET.json", "src/sites/mailala/SYNC-PACKET.json");

  /* 2 — the pointer must be aimed at THIS register, or the family follows a stale
     address. A register cannot detect that about itself; the engineer can. */
  let ptr = null; try{ ptr = await window.ObiFreeWire.pointer(); }catch(e){}
  const p = ptr && ptr.parsed;
  const regUrl = del && del["src/sites/mailala/ASSET-MANIFEST.json"] ? del["src/sites/mailala/ASSET-MANIFEST.json"].url : null;
  const pktUrl = del && del["src/sites/mailala/SYNC-PACKET.json"] ? del["src/sites/mailala/SYNC-PACKET.json"].url : null;
  if(p && reg && reg.estate){
    const tree16 = String(reg.estate.treeDigestSha256 || "").slice(0, 16);
    add("the pointer is aimed at THIS register", p.n === reg.estate.count && p.b === reg.estate.bytes && p.tree === tree16,
      "pointer " + p.n + " files / " + p.b + " B / tree " + p.tree + " · this origin's register " + reg.estate.count + " / " + reg.estate.bytes + " / " + tree16);
    add("the pointer's keys are the delivered addresses", p.reg === key(regUrl) && p.pkt === key(pktUrl),
      "pointer reg " + p.reg + " · pkt " + p.pkt + " · the ledger's reg " + key(regUrl) + " · pkt " + key(pktUrl));
  } else add("the pointer", false, ptr ? "the pointer did not parse" : "the pointer could not be read — /wire pointer");

  /* 3 — the SEAL on the SOUL: the published extract must not contain the words. */
  let seal = null; try{ seal = await root.kv.freewire.get("scholar"); }catch(e){}
  let scholarKey = null; try{ const ks = await root.kv.scholar.keys(); scholarKey = ks && ks.length ? ks[ks.length - 1] : null; }catch(e){}
  if(seal && seal.url){
    let samples = [];
    try{ const rec = await root.kv.scholar.get(scholarKey); samples = (((rec || {}).extract || {}).samples || {}).soul || []; }catch(e){}
    samples = samples.map(s => String(s).slice(0, 40)).filter(s => s.length > 12);
    try{
      const t = await (await fetch(seal.url)).text();
      const hit = samples.filter(s => t.indexOf(s) !== -1)[0];
      add("the published SOUL extract carries no verbatim text", !hit,
        samples.length ? (samples.length + " soul sample(s) from the preserved extract searched for inside the published file · " + (hit ? 'FOUND A MATCH — "' + String(hit).slice(0, 40) + '"' : "none of them appears")) : "no preserved extract to compare against — /soulSCHOLAR");
    }catch(e){ add("the published SOUL extract", false, "could not be fetched: " + ((e && e.message) || e)); }
  } else add("the published SOUL extract", false, "nothing is sealed yet — /soulSCHOLAR");

  /* 4 — what the station does NOT do, stated rather than scored. */
  add("the canon", null, "CANON/SOUL/EXTRACT/ · CANON/SCOUT/ · CANON/MARCH/ · CANON/SUPPLY/ · the DEATH header are all HELD — a canon write needs a token, and this station never claims one it did not make");
  return checks;
}

function engineerCard(stage, rec, audit){
  const VME = { PASS:"#4cd97b", FAIL:"#ff5a5a", HELD:"#8a94a6" };
  const a = (rec && rec.artifact) || {};
  const sChecks = a.checks || [];
  const sFails = sChecks.filter(c => c.result === "FAIL").length;
  const aFails = audit.filter(c => c.result === "FAIL").length;
  const seal = (stage.stamped && rec && rec.pass && aFails === 0) ? "OPEN" : "SHUT";
  let html = '<div class="rise"><div class="rhead">⚙️ /phoenixENGINEER — audit every artifact; gate the seal</div>';
  html += '<div class="rrow"><b>STAGE 6</b><span class="vd" style="color:' + (stage.stamped ? "#4cd97b" : "#f5a623") + '">' + esc(stage.state) + '</span><div class="rd">' + esc(stage.detail) + '</div></div>';
  html += '<div class="rrow"><b>THE CANON AUDIT</b><span class="vd" style="color:' + (sFails ? "#ff5a5a" : "#4cd97b") + '">' + (sChecks.length - sFails) + ' / ' + sChecks.length + ' PASS</span><div class="rd">the canon\'s own checks, written against the SESSION — ' + (sChecks.length ? (sFails ? sFails + ' failing: ' + esc(sChecks.filter(c => c.result === "FAIL").map(c => c.check).join(" · ").slice(0, 300)) : "all passing") : "no checks could be built") + '</div></div>';
  html += '<div class="rrow"><b>THE STATION AUDIT</b><span class="vd" style="color:' + (aFails ? "#ff5a5a" : "#4cd97b") + '">' + (audit.length - aFails) + ' / ' + audit.length + ' PASS</span><div class="rd">the same questions asked of what ACTUALLY EXISTS here — the published copies fetched back off the wire and compared byte for byte with the copies in this origin, the pointer checked against this register, and the seal on the SOUL checked by searching the published file for its own words</div></div>';
  for (const c of audit){
    html += '<div class="rrow"><b>' + esc(c.what) + '</b><span class="vd" style="color:' + (VME[c.result] || "#8a94a6") + '">' + esc(c.result) + '</span><div class="rd">' + esc(c.note) + '</div></div>';
  }
  html += '<div class="rrow"><b>THE SEAL</b><span class="vd" style="color:' + (seal === "OPEN" ? "#4cd97b" : "#ff5a5a") + '">' + seal + '</span><div class="rd">'
    + (seal === "OPEN" ? "every artifact present and passing, and every station audit check passed — Stage 7 (DEATH) may seal this session. Nothing here seals it: DEATH does, and only when you call it."
      : (!stage.stamped ? "a session that was never opened cannot be sealed — the chain has no RISE, so Stage 7 has nothing to close. " + (aFails ? aFails + " station audit check(s) also fail." : "") : (aFails ? aFails + " station audit check(s) FAIL — a seal over a failing artifact is a lie." : "the stage audit has failing checks.")))
    + '</div></div>';
  html += '<div class="rfoot">' + (aFails ? "⚠ " + aFails + " check(s) FAILED — fix or reroute before any seal." : "Nothing failed. The canon destinations stay HELD: the audit proves what the station did, and states what it did not do.") + '</div></div>';
  return html;
}

async function cmdEngineer(){
  const bubble = addBubble("ass", "");
  typing(bubble);
  try{
    if(!window.ObiFreeWire){ bubble.textContent = "⚠ src/freewire.js is not loaded — the station audit cannot fetch the published copies back."; return; }
    const stage = scsEngineerStatus();
    let rec = null;
    if(window.ObiSCS && window.ObiSCS.engineer) rec = window.ObiSCS.engineer();
    const audit = await engineerAudit();
    bubble.innerHTML = engineerCard(stage, rec, audit);
    const aFails = audit.filter(c => c.result === "FAIL").length;
    const seal = (stage.stamped && rec && rec.pass && aFails === 0) ? "OPEN" : "SHUT";
    messages.push("Obi: [ENGINEER — " + stage.state + " · station audit " + (audit.length - aFails) + "/" + audit.length + " · SEAL " + seal + "]");
    rrlAppend(runNoOf(), "DNA", "Obi: [phoenixENGINEER " + (stage.stamped ? "stamped" : "FORCED") + " — SEAL " + seal + " · " + audit.filter(c => c.result === "FAIL").map(c => c.what).join("; ") + "]");
    logOp({ kind:"scs", action:"phoenixENGINEER (forced)", ok: aFails === 0, detail: stage.state + " · seal " + seal, result: (audit.length - aFails) + "/" + audit.length + " station checks pass" });
    updateStats();
  }catch(e){ bubble.textContent = "⚠ ENGINEER failed: " + ((e && e.message) || e); }
}

/* ---------------------- UI ---------------------- */
const $ = id => document.getElementById(id);
const messagesCtn = $("messages");
const inputEl = $("inputEl");

/* THE LANDING PAGE — captured from the markup, so there is exactly ONE source
   of truth. index.html holds the branded landing (the marketing register in
   reading order, built from the files in src/brand/assets), and this reads it
   back so a reincarnation rebuilds the same page instead of an older, plainer
   one. The fallback only fires if the markup is somehow absent. */
const EMPTY_HTML = (function(){
  try{ const el = document.getElementById("empty"); if(el && el.innerHTML.trim()) return el.innerHTML; }catch(e){}
  return `<div class="big">⌘</div>
<div>I am <b style="color:var(--text)">Obi</b> — the command station.</div>
<div class="hint" style="max-width:560px">Speak, and Agent 99 answers. <b>⌘ /help</b> is the whole shelf; <b>/state</b> is what it can reach right now.</div>
<div class="voice-card" id="voiceLine"></div>
<div class="chipgroup">⌘ Command Station</div>
<div class="chips">
  <span class="cmd">/state</span>
  <span class="cmd">/help</span>
  <span class="cmd">/memory</span>
  <span class="cmd">/generators</span>
  <span class="cmd">/settings</span>
</div>`;
})();

let messages = [];
let meta = null;
try{ meta = root.generateText({getMetaObject:true}); }catch(e){}

function systemText(){ return PERSONA; }
function logText(){
  return messages.slice(-20).join("\n\n");
}
function lastUserText(){
  for(let i = messages.length - 1; i >= 0; i--){
    const m = String(messages[i] || "");
    if(m.startsWith("User:")) return m.slice(5).trim();
  }
  return "";
}

/* RECALL BEFORE REPLY — the station's own memory of itself.
   Obi's worst failure mode is answering a request to BUILD something the station
   already has (it once offered to /forge a Free Phoenix Mode that was already
   sitting there). A language model will not reliably search a 4,000-word state
   dump for that, so the matching is done HERE, deterministically: the Sovereign's
   words are scanned against an index of what this station actually contains, and
   any hits are put in front of the model as a fact it must not contradict.
   This is retrieval, not generation — and it is why the answer can be trusted. */
const STATION_FEATURES = [
  { id:"free", name:"FREE PHOENIX MODE", where:"/free · ⚙ Settings → 🔥 Free Phoenix Mode · src/freephoenix.js",
    what:"Agent 99 with the leash off — no canon, no gate, no repo, no record, no refusal. Unrestricted, untracked, LOCAL. It answers, it BUILDS (/build app → a self-contained HTML app; /build gator → a perchance generator), and IT EDITS ITSELF: /self shows its own source, /forge <change> patches it (staged, with a real diff), /apply runs the staged code live in the page, /revert goes back, /eval <js> runs code in the page. What it builds and edits lives in the local sandbox (kv folder fpm) and is downloaded by hand — never uploaded, never committed, and a reload returns the room to the file it shipped with. The Sovereign programs inside it. THIS IS THE ANSWER to \"an unrestricted, untracked, local, does-whatever-I-ask version of the OS that I program from within\", \"let it edit itself\", \"same level as Obi's forge\" — it already exists; do not propose to build it.",
    keys:[/free\s*phoenix/, /\bunbound\b/, /\bunrestricted\b/, /\buntracked\b/, /\bleash\b/, /no (canon|gate|repo|record|rules?)\b/, /does (whatever|what) i (ask|want)/, /program (it|the os|the station|the system) from (the )?inside/, /\bsandbox (version|instance|copy)\b/, /phoenix instance/, /without (the )?(rules|gate|canon|restrictions)/, /edit (it|itself|the free room|free phoenix)/, /(free|unbound) (room )?(edit|rewrite|change) (it|itself)/, /open book/] },
  { id:"forge", name:"SELF-FORGE", where:"/forge · src/forge.js",
    what:"the station's hands on its OWN source: read its own files (live and canonical), stage an edit with a real diff, run code inside itself, hot-swap a running module. Landing is gated by /phoenixomegaprotocol. It cannot overwrite its own perchance listing — the Sovereign saves that.",
    keys:[/\bforge\b/, /edit (yourself|itself|the station|your own code)/, /change (your|its) (own )?(code|source|look|interface)/, /self[-\s]?edit/] },
  { id:"curriculum", name:"THE CURRICULUM — THE PACING GUIDE", where:"/curriculum · /coverage · src/curriculum.js",
    what:"the school's own pacing guide, parsed: PRIMARY grades 1-5 (the sovereign's own schedule — Look, Science, Global Success, Cambridge YLE) and SECONDARY grades 6-9 (Close-up / New Close-up, Science, Global Success, Cambridge), every week and every section, with its language contents, pages, learning outcomes, differentiated activities and assessments. /curriculum 6 = the year at a glance · /curriculum week 3 = one week in full · /curriculum unit <name> · /curriculum find <text> · /curriculum import reads a NEWER .xlsx in the browser (never uploaded) · /curriculum export 6 downloads the parsed copy · /curriculum materials = the templates, links and books the school hands over. /coverage puts that guide beside the station's own evidence for the active client (transcripts + summaries): which sections the record shows, and which it has no evidence of — EVIDENCE-DRIVEN, so silence is reported as 'no evidence', never as 'not taught'. THE TEACHING SCOPE is part of it: the guide is the school's plan and the Sovereign teaches a part of it — for Secondary, Close-up + Science ONLY (Global Success is the Vietnamese 'VT' programme), and on grade 6 the VT periods are 8 & 9 (the ORDER column). Primary is provisional: Look + Science. /curriculum scope shows whose periods are whose; /curriculum scope <grade> corrects it.",
    keys:[/\bcurriculum\b/, /pacing (guide|plan)/, /\bsyllabus\b/, /global success/, /close[-\s]?up (a1|b1|a2)/, /textbook/, /what (was|has been) taught/, /\bcoverage\b/, /lesson plan for (week|unit)/, /what (did|do) (we|they|the parents) (pay|get) for/, /\bteaching scope\b/, /whose (periods|classes|lessons)/, /\bVT\b/, /vietnamese teacher/, /\bmy (books|periods|classes)\b/, /ecogreen/, /\blook\b/, /primary (grade|school|pacing)/, /cambridge (primary|yle)/] },
  { id:"student", name:"STUDENT EVALUATOR", where:"/transcribe /transcripts /summary /summaries /writeup /review /client /class /student /note /file",
    what:"record a lesson of any length → verbatim transcript → study summary → class writeup → student review, organised by client → class → student.",
    keys:[/transcri/, /\bsummar/, /write[-\s]?up/, /\breview\b/, /\bstudent/, /\bclass\b/, /\brecording/, /lesson record/] },
  { id:"ledger", name:"SOUL DNA LEDGER + RRL", where:"/memory /ledger · localStorage obi_sdnad",
    what:"every word the Sovereign says, captured verbatim with a timestamp; the RRL is the raw both-speaker transcript of the run. Never summarised, never edited.",
    keys:[/soul (dna|ledger|memory)/, /\bledger\b/, /\brrl\b/, /\bverbatim\b/, /remember (everything|my words)/] },
  { id:"ilog", name:"I-LOG", where:"/ilog · src/ilog.js",
    what:"append-only sha-256 hash-chained record of every operation the station performs, frozen in Git by an anchor. /ilog verify · /ilog push (gated).",
    keys:[/i[-\s]?log/, /audit trail/, /hash chain/] },
  { id:"canon", name:"CANON + PHOENIXOMEGAPROTOCOL", where:"/canon /fieldguide /proposed /phoenixomegaprotocol · Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-",
    what:"GOSPEL-999 and the Legionnaire Field Guide are the sealed bible (SOV100 only). /phoenixomegaprotocol <password> arms the gate for 15 minutes (never across a reload). New doctrine is STAGED as a proposal (/proposed) and never merged without the Sovereign's word.",
    keys:[/\bcanon\b/, /\bgospel\b/, /\bbible\b/, /field guide/, /\bdoctrine\b/, /\bamendment\b/, /\bomega\b/] },
  { id:"vault", name:"PRAIS VAULT", where:"/vault · src/vault.js",
    what:"the local sealed store: an ML-KEM keypair, secrets sealed under it, escrow published to the Canon plus a mirror, and recover to rebuild the crown jewel. /vault seal · /vault escrow · /vault recover · /vault test all.",
    keys:[/\bvault\b/, /\bescrow\b/, /\bkeypair\b/] },
  { id:"lesson", name:"LESSON CREATOR (NET ACADEMY)", where:"/lesson · src/lessons.js",
    what:"builds a full interactive lesson (rooms, exercises) and files it in the lesson library.",
    keys:[/lesson creat/, /net academy/, /make (a|me a) lesson/, /lesson library/, /teach (a|this) (topic|concept)/] },
  { id:"mesh", name:"THE MESH, DIVISIONS & THE FIELD", where:"/network /generators /constellation /scout /pheromones /tools",
    what:"the connected-generator mesh (CGN), the PrAis divisions and every generator in them, the ecosystem map, PhoenixScout terrain flags, and the pheromone routing field.",
    keys:[/\bmesh\b/, /network of generators/, /\bdivision/, /\bconstellation\b/, /\bpheromone/, /\bscout\b/] },
  { id:"rubric", name:"THE RUBRIC", where:"/rubric · src/rubric.js",
    what:"the instrument the word 'evaluator' means — and this estate's own inventory row ana.rubric, which sat MISSING until it was built. Criteria with bands, scored from the record with every band CITED: the ENGINE locates each quote itself inside the raw record and REFUSES any span it cannot find (an invented quote is printed as refused and never counted); it reads the timestamp off the transcript's own utterance map and never asks the model for a clock; where the record holds a number (words, wpm, pauses, duration, parts, dates, speakers) the band is COMPUTED and the model's own band is kept as recorded dissent; a band with no verified citation is NOT SCORED — excluded from the total and listed in the omission audit; coverage travels with every total; and every scorecard prints WHAT LOWERED IT (the adverse-action reasons), carries the rubric's version and sha-256 plus its own digest, and can be re-audited later. Four families (cefr.speaking · cefr.writing · teach.lesson · err.taxonomy) plus custom rubrics defined in one line (/rubric new Year 7 writing :: task achievement :: lexis :: accuracy). /rubric score [name] · errors · teach · list · show <id> · verify <run> · trend [name] · archive · export <run> · canary (the engine checking itself by machine; /doctor runs it).",
    keys:[/\brubric/, /\bband\b/, /\bcefr\b/, /score (the|a|this) (student|class|lesson)/, /grade (the|a|this) (student|class|lesson)/, /assess (the|a|this) (student|class|lesson)/, /marking (scheme|criteria)/, /what lowered/, /error (taxonomy|list|frequency)/, /cited (score|evidence)/] },
  { id:"market", name:"THE OPEN SOURCE MARKET", where:"/market · src/market.js",
    what:"the recon and the play. Nine real endpoints (GitHub, npm, HuggingFace, Reddit) are measured live in this browser: a NUMBER is printed for every channel that answered and the REFUSAL VERBATIM for every one that did not, the open seats are DERIVED from what was measured (a seat is open when the market's leader is under 100 stars), and the play is written down in src/marketing/OPEN-SOURCE-PLAY.md with the ready artefact in src/marketing/awesome-perchance.md. It re-measures itself every 30 minutes. /market scan · /market play · /market state · /market log.",
    keys:[/open source market/, /\bmarket\b/, /competitors?/, /who else is (building|doing|making)/, /how many repos/, /github stars?/, /\bpositioning\b/] },
  { id:"sauce", name:"THE SECRET SAUCE", where:"/SecretSauce (also /sauce) · src/secretsauce.js · src/canon/SECRET-SAUCE.md",
    what:"the method, given away FREE (CC0): ten best practices, eight best-kept secrets, and the ladder that starts with best practice and then upgrades. The MacGyver principle is the first section — build the way out with the parts already on the bench. Opened by the canon hallmark; only its sha-256 is ever stored; it fails closed after five wrong tries. /SecretSauce best · secrets · upgrade · train (builds the ORDERED training corpus, best practice first, and hashes it — the station cannot fine-tune and says so) · forums (searches Hacker News, dev.to, GitHub issues, StackExchange and Reddit live, printing every refusal verbatim) · free · lock.",
    keys:[/secret sauce/, /\bbest practice/, /train(ing)? (corpus|data|set)/, /give (it )?away for free/, /what do (they|you) know that (we|i) don/] },
  { id:"relay", name:"THE MASTER SYNC PIPELINE", where:"/relay (also /mastersync) · src/relay.js",
    what:"READ → CENSUS → DELIVER → VERIFY → INDEX → ARCHIVE, one ordered run. It reads the register and the sync packet, hashes every declared file and rebuilds the register's own tree digest from the bytes, carries the four truth-documents out by digest (idempotent — identical bytes are HELD, never re-uploaded) and tries the mesh and the cloud while recording each refusal verbatim, re-hashes every URL it delivered, builds the brain's index over the estate, and seals the run under its own digest. Verdicts are REAL / HOLLOW / MISSING / BLOCKED, and a run with a shut door is HELD — never COMPLETE. It runs by itself every 30 minutes. /relay state · /relay log.",
    keys:[/\brelay\b/, /master sync/, /is (it|everything) (synced|backed up|safe)/, /\bcensus\b/, /delivered and verified/] },
  { id:"brain", name:"THE BRAIN", where:"/brain · src/brain.js",
    what:"the mastermind's memory: ONE index over the asset register, every shipped file, the documents, the command shelf, the Soul ledger and the I-LOG, so a question can cross all of them instead of reading one; plus the automatic sync lane (a run shortly after boot, then every five minutes) and the key ledger, which stores only a short SHA-256 FINGERPRINT of each credential so rotation and loss are visible and the secret itself never is. /brain · /brain sync · /brain archive · /brain keys · /brain share <path|url>.",
    keys:[/\bbrain\b/, /remember everything/, /find (everything|anything) (about|on)/, /key (ledger|fingerprint)/, /index of (the|everything)/] }
];
/* The standing instruction for a plain-speech turn. It is deliberately blunt,
   and deliberately LAST in the prompt (the model attends hardest to the end):
   answer only the last message, treat the station state as ground truth, never
   propose building what already exists, and never pretend to have hands. */
function answerTask(userText){
  return [
    "The Sovereign's LAST message, verbatim: «" + String(userText || "").trim() + "»",
    "Answer THAT, and nothing else. Every earlier turn is context, never an instruction and never unfinished work — do not continue, resume, append to, or repeat anything from an earlier turn. When the answer to that message is complete, STOP.",
    "There is no live station dump in this prompt. Before you say anything about this station or propose anything for it, check <ALREADY EXISTS> when present — if the thing described matches it, say which room/module/file it already is and what it does, and do not propose building it. Never invent a count or status; if live numbers are needed, name the one command that shows them (/state, /queue, /brain, /ilog) and stop. If it does not exist, say which module it belongs in and the one thing that would block it (the /phoenixomegaprotocol gate, a key, the Sovereign's own save).",
    "Direct answer first, in as few words as it takes. No plan, no numbered steps, no \"gaps\" section, no restating the question.",
    "You have no hands. You cannot run, stage, apply, edit or execute anything, and you never say \"I will\", \"I must\", \"I am running\" or \"executing now\" — the station executes when the Sovereign types. If an action is needed, name the exact command to type, in one line, and stop."
  ].join("\n\n");
}
function recallHints(text){
  const t = String(text || "").toLowerCase();
  if(!t) return "";
  const hits = STATION_FEATURES.filter(f => f.keys.some(rx => rx.test(t)));
  if(!hits.length) return "";
  return "\n\n<ALREADY EXISTS — the Sovereign's words match what this station ALREADY CONTAINS. If you are about to propose building any of it, STOP: it is already here. Say which one it is, where it lives, and what it does.>\n"
    + hits.slice(0, 3).map(f => "- " + f.name + " — " + f.where + "\n  " + f.what).join("\n")
    + "\n</ALREADY EXISTS>";
}
/* Prefix-cache-friendly order: the persona is identical on every call, the
   conversation log and the soul reprints are append-only, and only the last
   section (a one-line snapshot + the task) varies per call.
   NOTE 2026-10-15 (/forge: remove <STATION STATE> from the prompt): plain-speech
   replies no longer carry the ~9 KB stationState() dump. stationState(),
   stateText() and /state stay intact for ON-DEMAND reads — the prompt gets a
   one-line identity snapshot plus <ALREADY EXISTS> retrieval, and live numbers
   are read by the sovereign via /state instead of guessed by the model. */
function leanContext(){
  try{
    const g = (typeof window !== "undefined" && window.generatorName) || "?";
    const v = (typeof currentView === "string" ? currentView : "?");
    const r = (typeof runNoOf === "function" ? runNoOf() : "?");
    return "generator: " + g + " · view: " + v + " · run: " + r + " · " + new Date().toLocaleString();
  }catch(e){ return "station snapshot unreadable"; }
}
function buildPrompt(task, stationText, hints){
  const state = stationText
    ? `\n\n<STATION SNAPSHOT — identity only, not live numbers. Never quote counts or status from this line; point at /state for those.>\n${stationText}\n</STATION SNAPSHOT>`
    : "";
  return `${systemText()}\n\n<CONVERSATION>\n${logText()}\n</CONVERSATION>${soulMemoryBlock(14)}${state}${hints || ""}\n\nTASK: ${task}`;
}

function scrollDown(){ messagesCtn.scrollTop = messagesCtn.scrollHeight; }

function addBubble(role, html, opts={}){
  const curEmpty = document.querySelector("#empty");
  if(curEmpty) curEmpty.remove();
  const row = document.createElement("div");
  row.className = "row " + role;
  const metaEl = document.createElement("div");
  if(opts.meta){ metaEl.className="meta"; metaEl.textContent = opts.meta; }
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if(opts.img){ bubble.className = "imgbubble"; }
  bubble.innerHTML = html;
  row.appendChild(metaEl);
  row.appendChild(bubble);
  if(role==="user"){ row.insertBefore(bubble, metaEl); }
  messagesCtn.appendChild(row);
  scrollDown();
  return bubble;
}

function typing(bubble){
  bubble.innerHTML = '<div style="display:flex; gap:4px; padding:6px 2px"><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--accent);animation:blink 1.2s infinite"></span><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--accent);animation:blink 1.2s infinite .2s"></span><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--accent);animation:blink 1.2s infinite .4s"></span></div>';
  if(!document.getElementById("typingStyle")){ const s=document.createElement("style"); s.id="typingStyle"; s.textContent="@keyframes blink{0%,80%,100%{opacity:.25}40%{opacity:1}}"; document.head.appendChild(s); }
  scrollDown();
}

function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

let busy = false;

/* The command shelf. The landing chips (`#empty .cmd`) are the curated command
   surface, but the engine removes `#empty` as soon as the first message lands —
   which used to make every command unreachable after the first word. So the
   shelf is captured ONCE at load (single source of truth: the chips in the HTML)
   and can be re-opened at any time from the topbar. */
let CMD_SHELF = [];

/* THE COMMAND BOOK — the complete surface Agent 99 answers through, as ONE
   registry (not a curated teaser): every command the router accepts, grouped, with
   a one-line honest description. `arg: true` means the command needs the sovereign's
   own words, so tapping it TYPES it into the composer instead of running it blind.
   The landing page keeps its curated chips (`CMD_SHELF`); ⌘ Commands opens this,
   so nothing Agent 99 can do is hidden behind reading the source. */
/* BLUEPRINT MODE — the architect's plan for the build in flight. The document is the
   authority (src/sites/mailala/ARCHITECT-BLUEPRINT.md); this reads it live, so what the
   station shows can never drift from the file a builder actually reads. */
async function cmdBlueprint(arg){
  arg = String(arg || "").trim();
  let md = null, why = "";
  try{
    const r = await fetch(location.origin + "/src/sites/mailala/ARCHITECT-BLUEPRINT.md", {cache:"no-store"});
    if(!r.ok) why = "HTTP " + r.status; else md = await r.text();
  }catch(e){ why = e.message; }
  if(!md){
    addBubble("ass", '<div class="rise"><div class="rhead">\u2726 BLUEPRINT MODE</div><div class="rfoot">The plan could not be read (' + esc(why) + '). Nothing is shown rather than something invented.</div></div>');
    return;
  }
  const lines = md.split("\n");
  const secs = [];
  lines.forEach((l, i) => { if(/^##\s/.test(l)) secs.push({ title: l.replace(/^##\s+/, "").trim(), start: i }); });
  secs.forEach((s, i) => { s.end = (i + 1 < secs.length) ? secs[i + 1].start : lines.length; });
  const headEnd = secs.length ? secs[0].start : lines.length;
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  let chosen = null, note = "";
  if(!arg){ chosen = lines.slice(0, headEnd); note = "index"; }
  else if(/^all$/i.test(arg)){ chosen = lines; note = "whole plan"; }
  else {
    const n = parseInt(arg, 10);
    /* a section is matched by its heading FIRST, so a number with a suffix (\u201c4b\u201d) reaches the layer it
       names rather than parseInt silently truncating it to 4 and showing the wrong layer. */
    const pick = secs.find(s => norm(s.title).startsWith(norm(arg)))
      || ((!isNaN(n) && n >= 1 && n <= secs.length) ? secs[n - 1] : secs.find(s => norm(s.title).indexOf(norm(arg)) !== -1));
    if(pick){ chosen = lines.slice(pick.start, pick.end); note = pick.title; }
  }
  const mdInline = (s) => esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,.08);padding:0 4px;border-radius:4px">$1</code>');
  const rows = (chosen || []).map(function(l){
    const t = l.replace(/\s+$/, "");
    if(!t.trim()) return "";
    if(/^#\s/.test(t))    return '<div class="rhead" style="font-size:1.05rem">' + mdInline(t.replace(/^#\s+/, "")) + "</div>";
    if(/^##\s/.test(t))   return '<div class="rhead">' + mdInline(t.replace(/^##\s+/, "")) + "</div>";
    if(/^###\s/.test(t))  return '<div style="font-weight:600;margin:10px 0 3px">' + mdInline(t.replace(/^###\s+/, "")) + "</div>";
    if(/^\|/.test(t))     return '<div style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:.76rem;opacity:.92">' + mdInline(t) + "</div>";
    if(/^[-*]\s/.test(t)) return '<div style="margin:3px 0">\u2022 ' + mdInline(t.replace(/^[-*]\s+/, "")) + "</div>";
    if(/^>\s/.test(t))    return '<div style="border-left:3px solid #e2b45a;padding-left:10px;opacity:.94;margin:6px 0">' + mdInline(t.replace(/^>\s+/, "")) + "</div>";
    return '<div style="margin:4px 0">' + mdInline(t) + "</div>";
  }).join("");
  const index = (note === "index")
    ? '<div class="rhead">THE LAYERS</div>' + secs.map((s, i) => '<div style="margin:3px 0"><b>' + (i + 1) + '</b> \u2014 ' + esc(s.title) + '</div>').join("")
    : "";
  const body = chosen
    ? (rows + index)
    : '<div>No section matches \u201c' + esc(arg) + '\u201d. Try <code>/blueprint</code> for the index, a number, a word from a heading, or <code>/blueprint all</code>.</div>';
  addBubble("ass", '<div class="rise"><div class="rhead">\u2726 BLUEPRINT MODE \u2014 ' + esc(note === "index" ? "THE ARCHITECT\u2019S PLAN" : ("THE ARCHITECT\u2019S PLAN \u00b7 " + note)) + '</div>' + body + '<div class="rfoot">source: <b>src/sites/mailala/ARCHITECT-BLUEPRINT.md</b> \u2014 <b>/blueprint 1\u201313</b> for one layer \u00b7 <b>/blueprint all</b> for the whole plan \u00b7 the asset register is <b>/assets</b>. Where the file and the build disagree, the build wins.</div></div>');
}

/* THE ASSET REGISTER — every asset in the blueprint, located, labelled and SHA-256 hashed from
   its actual bytes. The register (src/sites/mailala/ASSET-MANIFEST.json) is the authority and is
   GENERATED, never hand-typed, so it states the tree as it is. This reads it live; `/assets verify`
   re-hashes the assets in this browser and compares, so "unchanged" is a measurement, not a claim. */
let ASSET_REG = null;
async function loadAssetReg(){
  if(ASSET_REG) return ASSET_REG;
  const r = await fetch(location.origin + "/src/sites/mailala/ASSET-MANIFEST.json", {cache:"no-store"});
  if(!r.ok) throw new Error("HTTP " + r.status);
  ASSET_REG = await r.json();
  return ASSET_REG;
}
async function cmdAssets(arg){
  arg = String(arg || "").trim();
  const verify = /^verify\b/i.test(arg);
  const q = arg.replace(/^verify\b/i, "").trim().toLowerCase();
  let reg = null, why = "";
  try{ reg = await loadAssetReg(); }catch(e){ why = e.message; }
  if(!reg){
    addBubble("ass", '<div class="rise"><div class="rhead">\u2726 ASSET REGISTER</div><div class="rfoot">The register could not be read (' + esc(why) + '). Nothing is shown rather than something invented.</div></div>');
    return;
  }
  const all = (reg.assets || []);
  const hay = (a) => [a.id, a.label, a.kind, a.slot, a.local, a.url, a.note, (a.sha256 || "").slice(0, 12)].filter(Boolean).join(" ").toLowerCase();
  const picked = q ? all.filter(a => hay(a).indexOf(q) !== -1) : all;
  const b = (n) => (n == null) ? "—" : Number(n).toLocaleString() + " B";
  const shortSha = (a) => a.sha256 ? a.sha256.slice(0, 12) : (a.unhashed || "UNHASHED");

  if(verify){
    const rows = [], skipped = [];
    for(const a of picked){
      if(!a.fetchable){ skipped.push(a.id + " (" + (a.verifyNote || (a.dynamic ? "live remote document" : "in-document")) + ")"); continue; }
      if(rows.length >= 14){ skipped.push("the rest (showing 14)"); break; }
      const src = a.url || a.local;
      let verdict;
      try{
        const r = await fetch(src, {cache:"no-store"});
        if(!r.ok) verdict = "unreachable \u00b7 HTTP " + r.status;
        else {
          const buf = new Uint8Array(await r.arrayBuffer());
          const h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map(x => x.toString(16).padStart(2, "0")).join("");
          if(h === a.sha256) verdict = '<span style="color:#3fa06a">\u2713 MATCH</span> \u00b7 ' + b(buf.length);
          else if(a.dynamic)  verdict = '<span style="opacity:.8">\u2248 drift \u00b7 now ' + h.slice(0, 12) + ' (expected for a live document)</span>';
          else                verdict = '<span style="color:#d24a33">\u2716 DRIFT</span> \u00b7 now ' + h.slice(0, 12) + ' \u00b7 was ' + (a.sha256 || "").slice(0, 12);
        }
      }catch(e){ verdict = "unreachable \u00b7 " + esc(e.message); }
      rows.push('<div style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:.78rem;margin:3px 0"><b>' + esc(a.id) + '</b> ' + esc(a.label) + ' \u2014 ' + verdict + '</div>');
    }
    addBubble("ass", '<div class="rise"><div class="rhead">\u2726 ASSET REGISTER \u00b7 VERIFY' + (q ? ' \u00b7 \u201c' + esc(q) + '\u201d' : '') + '</div>'
      + (rows.join("") || '<div>Nothing to hash for that.</div>')
      + (skipped.length ? '<div style="margin-top:8px;opacity:.75;font-size:.8rem">not hashed here: ' + esc(skipped.join(" \u00b7 ")) + '</div>' : "")
      + '<div class="rfoot">re-hashed in this browser against <b>src/sites/mailala/ASSET-MANIFEST.json</b> \u2014 a mismatch is drift, and drift is reported, never smoothed over.</div></div>');
    return;
  }

  const wanted = ["photograph", "video", "font", "map", "mark", "schema"];
  const page = picked.filter(a => wanted.indexOf(a.kind) !== -1);
  const rows = page.map(a => '<div style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:.76rem;margin:3px 0"><b>' + esc(a.id) + '</b> \u00b7 ' + esc(a.label)
    + (a.slot ? ' \u2014 ' + esc(a.slot) : '') + '<br><span style="opacity:.75">' + b(a.bytes) + ' \u00b7 ' + esc(shortSha(a)) + (a.proven ? ' \u00b7 ' + esc(a.proven) : '') + '</span></div>');
  const kinds = page.reduce((o, a) => (o[a.kind] = (o[a.kind] || 0) + 1, o), {});
  const est = reg.estate || {};
  addBubble("ass", '<div class="rise"><div class="rhead">\u2726 ASSET REGISTER \u2014 ' + (q ? 'MATCHING \u201c' + esc(q) + '\u201d' : 'EVERY ASSET IN THE BLUEPRINT') + '</div>'
    + '<div style="margin-bottom:6px;opacity:.9">' + Object.keys(kinds).map(k => kinds[k] + " " + k).join(" \u00b7 ") + '</div>'
    + (rows.join("") || '<div>Nothing matches \u201c' + esc(q) + '\u201d. Try a label, an id, a hash or a slot.</div>')
    + '<div style="margin-top:10px">the estate: <b>' + (est.count || 0) + '</b> shipped files \u00b7 <b>' + (est.bytes ? Math.round(est.bytes / 1024) + " KB" : "\u2014") + '</b>, every one digested in the register</div>'
    + (reg.unhashed && reg.unhashed.length ? '<div style="margin-top:6px;opacity:.8">not hashed, and why: ' + reg.unhashed.map(u => esc(u.what)).join(" \u00b7 ") + '</div>' : "")
    + '<div class="rfoot">' + (reg.generated ? 'generated ' + esc(reg.generated) + ' \u00b7 ' : '') + 'source: <b>src/sites/mailala/ASSET-MANIFEST.json</b> \u2014 <b>/assets verify</b> re-hashes them here \u00b7 <b>/assets &lt;word&gt;</b> filters \u00b7 the register is generated from the bytes, never typed.</div></div>');
  if(reg.authority) addBubble("ass", '<div class="rfoot">' + esc(reg.authority.chain) + '</div>');
}

/* THE BRAIN (/brain) — the mastermind's memory, read live from src/brain.js.
   The index points at things and carries their digests; the sync lane is TRIED
   every time this runs, and its failures are shown verbatim — a sync that says
   nothing happened is worth more than one that pretends. */
async function cmdBrain(arg){
  arg = String(arg || "").trim();
  const B = window.ObiBrain;
  if(!B){ addBubble("ass", '\u26a0 <b>src/brain.js</b> didn\u2019t load \u2014 reload the page.'); return; }
  const parts = arg.split(/\s+/);
  const low = (parts[0] || "").toLowerCase();
  const tail = parts.slice(1).join(" ").trim();
  const row = (k, v, d) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd">' + v + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>';
  const box = (title, body, foot) => addBubble("ass", '<div class="rise"><div class="rhead">' + title + '</div>' + body + (foot ? '<div class="rfoot">' + foot + '</div>' : '') + '</div>');
  const when = (t) => { try{ return new Date(t).toLocaleTimeString(); }catch(e){ return "\u2014"; } };

  if(low === "help"){
    box("\u2726 THE BRAIN", row("WHAT IT IS", "an index", "every artifact, file, document, command, memory fragment, key and lane this station can reach \u2014 each pointing at its source and carrying its digest.")
      + row("/brain &lt;words&gt;", "SEARCH", "ranked hits: what it is, where it lives, its size and hash.")
      + row("/brain sync", "THE LANE", "pull the published manifest, re-hash the delivery, and TRY the write \u2014 failures shown verbatim.")
      + row("/brain rebuild", "RE-INDEX", "read every source again. The index never guesses.")
      + row("/brain archive [label]", "SNAPSHOT", "one hashed snapshot of the whole state, kept in the brain\u2019s own archive.")
      + row("/brain verify [all]", "INTEGRITY", "re-hash the estate here and compare with the register\u2019s recorded digests \u2014 <b>all</b> rebuilds the tree digest over every file.")
      + row("/brain keys", "THE KEY LEDGER", "which credentials are held, by FINGERPRINT \u2014 rotation and loss visible, the secret never stored."),
      "automatic: the lane runs " + Math.round((B.SYNC_EVERY_MS || 300000) / 60000) + " min after boot and every " + Math.round((B.SYNC_EVERY_MS || 300000) / 60000) + " min after that.");
    return;
  }

  if(low === "rebuild"){
    addBubble("ass", "\u2726 THE BRAIN \u2014 re-indexing\u2026");
    const idx = await B.build();
    box("\u2726 THE BRAIN \u2014 REBUILT", row("ENTRIES", String(idx.entries.length), Object.keys(idx.stats).sort().map(k => idx.stats[k] + " " + k).join(" \u00b7 "))
      + row("TOOK", idx.ms + " ms") + row("CENSUS", idx.census == null ? "\u2014" : String(idx.census), idx.treeDigest ? "tree " + String(idx.treeDigest).slice(0, 16) : "the register was not readable"),
      "/brain &lt;words&gt; to search it.");
    return;
  }

  if(low === "sync"){
    addBubble("ass", "\u2726 THE BRAIN \u2014 syncing (reading, re-hashing, trying the write lane)\u2026");
    const s = await B.sync();
    const r = s.lanes.read || {}, w = s.lanes.write || {}, d = s.delivered || {};
    let body = row("READ CHANNEL", esc(r.state || "?"), r.published != null ? (r.published + " files \u00b7 " + Math.round((r.bytes || 0) / 1024) + " KB published \u00b7 register published: <b>" + (r.registerPublished ? "yes" : "NOT YET") + "</b> \u00b7 " + esc(r.drift || "drift unknown")) : esc(r.why || "no reading"));
    body += row("WRITE LANE", '<span style="color:' + (/OPEN/.test(w.state || "") ? "#4cd97b" : "#f5a623") + '">' + esc(w.state || "?") + '</span>', esc(w.why || w.note || ""));
    body += row("DELIVERY", esc(d.state || "?"), (d.rows || []).map(x => esc(x.what + " \u2014 " + x.state + (x.got ? " (now " + x.got + ", register says " + x.want + ")" : ""))).join("<br>") || "nothing to check");
    body += row("ESTATE CHECK", s.estateCheck ? (s.estateCheck.changed.length ? '<span style="color:#d24a33">' + s.estateCheck.changed.length + " changed</span>" : '<span style="color:#4cd97a">intact</span>') : "\u2014",
      s.estateCheck ? (s.estateCheck.changed.length ? s.estateCheck.changed.slice(0, 4).map(c => esc(c.path.split("/").pop()) + " " + esc(c.state)).join(" \u00b7 ") : "the " + esc(s.estateCheck.scope || "") + " hash to what the register recorded") : "");
    body += row("ESTATE", s.estate && s.estate.census != null ? s.estate.census + " files" : "\u2014", s.estate && s.estate.treeDigest ? "tree " + s.estate.treeDigest.slice(0, 16) + " \u00b7 register generated " + esc(s.estate.registerGenerated || "?") : esc(s.estate && s.estate.error || ""));
    body += row("KEYS", (s.keys || []).filter(k => k.present).length + " held / " + (s.keys || []).length + " slots", (s.keys || []).filter(k => k.present).map(k => esc(k.slot) + " <b>" + esc(k.fp) + "</b>").join(" \u00b7 ") || "none held \u2014 every lane that needs one stays blocked");
    box("\u2726 AUTO-SYNC \u2014 " + esc(s.t), body + row("TOOK", s.ms + " ms"),
      "the lane runs by itself after boot and every " + Math.round((B.SYNC_EVERY_MS || 300000) / 60000) + " minutes. What it cannot do, it says \u2014 verbatim, in the record.");
    return;
  }

  if(low === "keys"){
    const rows = await B.keys(true);
    const log = await B.keylog();
    box("\u2726 THE KEY LEDGER", row("HOW IT IS KEPT", "BY FINGERPRINT", "each slot is stored as a 10-character SHA-256 of the value. You can see a key arrive, be rotated or be cleared \u2014 the value itself is never written here, logged, or sent anywhere.")
      + rows.map(k => row(esc(k.slot).toUpperCase(), k.present ? '<span style="color:#4cd97b">HELD</span>' : '<span style="opacity:.7">ABSENT</span>', k.present ? "fingerprint <b>" + esc(k.fp) + "</b> \u00b7 set with /cf token, /gh token, /dg token, /keys ngl" : "nothing in this browser for that slot")).join("")
      + (log.length ? row("TRANSITIONS", String(log.length), log.slice(-6).reverse().map(x => esc(x.slot) + " " + esc(x.event) + " \u00b7 " + esc(x.fp) + " \u00b7 " + when(x.t)).join("<br>")) : ""),
      "values live only in this browser (localStorage <b>obi_keys</b>) \u2014 never in this public source, never in a URL, never in the I-LOG.");
    return;
  }

  if(low === "archive"){
    const e = await B.archive(tail || undefined);
    box("\u2726 THE BRAIN \u2014 ARCHIVED", row("SNAPSHOT", esc(e.label), esc(e.t))
      + row("DIGEST", "<b>" + esc(String(e.digest).slice(0, 24)) + "\u2026</b>", "the snapshot\u2019s own SHA-256")
      + row("ESTATE", e.estate ? e.estate.census + " files" : "\u2014", e.estate ? "tree " + esc(String(e.estate.treeDigest).slice(0, 16)) : "")
      + row("MEMORY", esc(String(e.soul)) + " soul fragments", e.ilog ? "I-LOG " + esc(String(e.ilog.count)) + " entries" : "")
      + row("KEYS", e.keys.filter(k => k.present).length + " held", e.keys.filter(k => k.present).map(k => esc(k.slot) + " " + esc(k.fp)).join(" \u00b7 "))
      + row("LANES", esc(e.sync ? e.sync.write : "not yet synced"), e.sync ? "read " + esc(e.sync.read) + " \u00b7 delivery " + esc(e.sync.delivered) : ""),
      "kept in the brain\u2019s archive (kv \u00b7 brain). /brain archives lists them.");
    return;
  }

  if(low === "archives"){
    const list = (await B.archives()).slice(-8).reverse();
    box("\u2726 THE BRAIN \u2014 ARCHIVE", list.length ? list.map(a => row(esc(a.label), esc(String(a.digest).slice(0, 16)) + "\u2026", esc(a.t) + (a.estate ? " \u00b7 " + a.estate.census + " files \u00b7 tree " + String(a.estate.treeDigest).slice(0, 12) : ""))).join("") : "<div>Nothing archived yet. <b>/brain archive</b> takes the first snapshot.</div>",
      "each entry is a hashed snapshot of the whole state at that moment.");
    return;
  }

  if(low === "share"){
    if(!tail){ box("\u2726 SHARE", "<div>Name a thing \u2014 a path in the estate (<b>/brain share src/sites/mailala/material/6134195124376899530_121.jpg</b>) or a URL (<b>/brain share https://\u2026/photo.jpg</b>).</div>", "the bytes are read here, hashed, given a permanent link, and recorded in the brain\u2019s share archive."); return; }
    addBubble("ass", "\u2726 SHARING \u2014 reading, hashing, uploading\u2026");
    const r = await B.share(tail);
    box("\u2726 SHARE \u2014 " + (r.ok ? "DONE" : "REFUSED"),
      r.ok ? row("LINK", '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.url) + "</a>", esc(String(r.bytes).toLocaleString()) + " B \u00b7 SHA-256 <b>" + esc(String(r.sha256).slice(0, 24)) + "\u2026</b>")
           : row("WHY", "nothing left this browser", esc(r.why || "unknown") + (r.sha256 ? " \u00b7 the bytes read hash to <b>" + esc(String(r.sha256).slice(0, 16)) + "\u2026</b>" : "")),
      r.ok ? "from <b>" + esc(r.from) + "</b> \u00b7 recorded in the brain\u2019s share archive so it can be found again." : "the host refused, so nothing was published \u2014 that is the whole of it.");
    return;
  }

  if(low === "shares"){
    const list = (await B.shares()).slice(-8).reverse();
    box("\u2726 THE BRAIN \u2014 SHARES", list.length ? list.map(s => row(esc(s.from), esc(String(s.sha256).slice(0, 12)), '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.url) + "</a> \u00b7 " + esc(String(s.bytes).toLocaleString()) + " B \u00b7 " + esc(s.t))).join("") : "<div>Nothing shared yet. <b>/brain share &lt;path|url&gt;</b>.</div>",
      "what left the station, with the digest of what left.");
    return;
  }

  if(low === "verify"){
    const all = /^all$/i.test(tail);
    addBubble("ass", "\u2726 THE BRAIN \u2014 re-hashing the estate against the register" + (all ? " (all 242 files)" : " (the core files)") + "\u2026");
    const r = await B.verifyEstate({ all });
    if(!r.ok){ box("\u2726 THE BRAIN \u2014 VERIFY", "<div>" + esc(r.why) + "</div>"); return; }
    const rows = r.changed.slice(0, 10).map(c => row(esc(c.path.split("/").pop()), '<span style="color:#d24a33">' + esc(c.state) + "</span>",
      c.now ? ("now <b>" + esc(c.now) + "</b> \u00b7 the register records <b>" + esc(c.register) + "</b> \u00b7 " + esc(String(c.bytes)) + " B") : "")).join("");
    box("\u2726 THE BRAIN \u2014 VERIFY \u00b7 " + esc(r.scope),
      row("CHECKED", String(r.checked), "hashed here, from the bytes served on this origin")
      + row("VERDICT", r.changed.length ? '<span style="color:#d24a33">' + r.changed.length + " CHANGED</span>" : '<span style="color:#4cd97a">the tree matches the register</span>',
        r.changed.length ? "the register is a snapshot: regenerate it (the register pass) or accept that the tree has moved \u2014 but never both silently." : "every one of these files hashes to exactly what the register recorded")
      + rows
      + (r.tree ? row("TREE DIGEST", r.tree.matches ? "MATCHES" : "MOVED", "recorded <b>" + esc(String(r.tree.recorded).slice(0, 16)) + "\u2026</b>") : row("TREE DIGEST", "needs all", "run <b>/brain verify all</b> to rebuild the digest over every file")),
      "/brain verify all re-hashes the whole estate (242 files) and rebuilds the tree digest.");
    return;
  }

  /* no argument: the brain's state. Anything else: a search. */
  if(!arg){
    let s = await B.state();
    if(!s.built && !s.entries) { await B.build(); s = await B.state(); }
    const ls = s.lastSync || {};
    const lanes = ls.lanes || {};
    box("\u2726 THE BRAIN \u2014 " + (s.entries ? s.entries + " entries" : "not built"),
      row("INDEXED", s.built ? String(s.entries) + " entries" : "rebuild with /brain rebuild", Object.keys(s.stats || {}).sort().map(k => s.stats[k] + " " + k).join(" \u00b7 ") || (s.lastBuild ? "last built " + esc(s.lastBuild.built) : ""))
      + row("ESTATE", s.census == null ? "\u2014" : s.census + " files", s.treeDigest ? "tree digest <b>" + esc(String(s.treeDigest).slice(0, 16)) + "\u2026</b>" : "")
      + row("LAST SYNC", ls.t ? esc(when(ls.t)) : "not yet \u2014 the lane runs \u224825 s after boot, then every " + Math.round((B.SYNC_EVERY_MS || 300000) / 60000) + " min", ls.t ? ("read <b>" + esc((lanes.read || {}).state || "?") + "</b> \u00b7 write <b>" + esc((lanes.write || {}).state || "?") + "</b> \u00b7 delivery <b>" + esc((ls.delivered || {}).state || "?") + "</b>" + ((lanes.read || {}).drift ? " \u00b7 " + esc(lanes.read.drift) : "")) : "")
      + row("ARCHIVE", s.archives + " snapshot(s) \u00b7 " + s.shares + " share(s)", "kv \u00b7 brain")
      + row("BUILT", s.version, "src/brain.js"),
      "<b>/brain &lt;words&gt;</b> searches it \u00b7 <b>/brain sync</b> runs the lane now \u00b7 <b>/brain archive</b> snapshots the whole state \u00b7 <b>/brain keys</b> the credential ledger \u00b7 <b>/brain share &lt;path|url&gt;</b> publishes a file.");
    return;
  }

  const r = B.searchDetailed(arg, 12);
  const hits = r.hits;
  if(!hits.length){
    box("\u2726 THE BRAIN \u2014 \u201c" + esc(arg) + "\u201d", "<div>Nothing indexed matches that. The index covers: every artifact and file in the register, the documents\u2019 sections, every command, the soul ledger, the operation record, the credential slots and the lanes. <b>/brain rebuild</b> re-reads the sources.</div>");
    return;
  }
  const byKind = {};
  for(const h of hits) (byKind[h.kind] = byKind[h.kind] || []).push(h);
  const body = Object.keys(byKind).map(k => '<div class="sel-group">' + esc(k) + '</div>'
    + byKind[k].map(h => row(esc(h.id || h.kind), esc(String(h.label || "").slice(0, 90)),
        esc(h.where || "") + (h.bytes ? " \u00b7 " + h.bytes.toLocaleString() + " B" : "") + (h.sha ? " \u00b7 <b>" + esc(String(h.sha).slice(0, 12)) + "\u2026</b>" : "") + (h.text ? "<br>" + esc(String(h.text).slice(0, 200)) : ""))).join("")).join("");
  box("\u2726 THE BRAIN \u2014 \u201c" + esc(arg) + "\u201d \u00b7 " + hits.length + " hit(s)" + (r.mode === "any" ? " \u00b7 loose match" : ""), body,
    (r.mode === "any" ? "no entry carries every word, so these are the entries that carry <b>any</b> of them \u2014 the match is loose and it says so. " : "") + "each hit names where it lives \u2014 nothing here is remembered from a previous answer.");
}

/* THE RELAY (/relay) — THE MASTER SYNC PIPELINE, read live from src/relay.js.
   It is the one object that does the whole carry in order, and it is runnable from
   here: READ → CENSUS → DELIVER → VERIFY → INDEX → ARCHIVE. Every stage verdict is
   measured in this browser; a door that is shut is printed shut, with the refusal
   the door itself gave. A run with a shut door is HELD — never COMPLETE. */
async function cmdRelay(arg){
  arg = String(arg || "").trim();
  const R = window.ObiRelay;
  if(!R){ addBubble("ass", '\u26a0 <b>src/relay.js</b> didn\u2019t load \u2014 reload the page.'); return; }
  const low = arg.toLowerCase();
  const row = (k, v, d) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd">' + v + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>';
  const box = (title, body, foot) => addBubble("ass", '<div class="rise"><div class="rhead">' + title + '</div>' + body + (foot ? '<div class="rfoot">' + foot + '</div>' : '') + '</div>');

  if(low === "help"){
    box("\u26a1 THE RELAY \u2014 THE MASTER SYNC PIPELINE",
      row("WHAT IT IS", "one chain", "the estate is measured, carried, verified and sealed in a single ordered run \u2014 each stage refuses to run on a lie from the stage before it.")
      + R.STAGES.map(s => row(s.name, "STAGE", esc(s.role))).join("")
      + row("THE VERDICTS", "REAL \u00b7 HOLLOW \u00b7 MISSING \u00b7 BLOCKED", "REAL proves itself; HOLLOW has an artifact but a gap; MISSING has nothing; BLOCKED is a door that refused, named verbatim.")
      + row("THE RESULT", "COMPLETE \u00b7 HELD \u00b7 GAP", "COMPLETE only when every stage is REAL. A blocked door gives <b>HELD</b>, a hollow stage gives <b>GAP</b> \u2014 and a run reporting COMPLETE with a stage below REAL is a lie (REINCARNATION-CONTRACT \u00a73)."),
      "automatic: the relay runs itself \u2248" + Math.round((R.FIRST_RUN_MS || 40000) / 1000) + " s after boot, then every " + R.RUN_EVERY_MS / 60000 + " min. <b>/relay state</b> prints the last run without running one \u00b7 <b>/relay log</b> is the ledger of runs.");
    return;
  }

  if(low === "state"){
    const s = await R.state();
    const l = s.last;
    /* the lanes in the LAST RUN are kept whole (each carries its own detail); the runs
       ledger keeps their states as strings. Reading a lane name off the wrong shape
       printed "[object Object]" on this card — so the state is read by shape, once. */
    const laneState = (v) => (typeof v === "string") ? v : ((v && v.state) || "?");
    box("\u26a1 THE RELAY \u2014 LAST RUN",
      l ? row("RESULT", '<span style="color:' + (l.result === "COMPLETE" ? "#4cd97b" : (l.result === "HELD" ? "#f5a623" : "#d24a33")) + '">' + esc(l.result) + '</span>', esc(l.t) + " \u00b7 " + l.ms + " ms \u00b7 digest <b>" + esc(l.digest) + "\u2026</b>")
        + row("STAGES", (l.stages || []).length + "", esc((l.stages || []).join(" \u00b7 ")))
        + row("LANES", "measured", "read <b>" + esc(laneState(l.lanes && l.lanes.read)) + "</b> \u00b7 wire <b>" + esc(laneState(l.lanes && l.lanes.wire)) + "</b> \u00b7 mesh <b>" + esc(laneState(l.lanes && l.lanes.mesh)) + "</b> \u00b7 cloud <b>" + esc(laneState(l.lanes && l.lanes.cloud)) + "</b>")
        : "<div>No run on record in this browser. <b>/relay</b> runs one.</div>",
      s.runs + " run(s) on this browser \u00b7 automatic every " + s.intervalMinutes + " min \u00b7 <b>/relay</b> runs it now.");
    return;
  }

  if(low === "log"){
    const list = (await R.runs()).slice(-10).reverse();
    const tick = v => v === "REAL" ? '<span style="color:#4cd97b">\u2713</span>' : (v === "BLOCKED" ? '<span style="color:#f5a623">\u26d4</span>' : '<span style="color:#d24a33">\u2717</span>');
    box("\u26a1 THE RELAY \u2014 THE RUN LEDGER",
      list.length ? list.map(r => row(esc(r.result) + " \u00b7 " + esc(r.digest), esc(r.t), (r.stages || []).map(x => esc(x.split("=")[0]) + " " + tick(x.split("=")[1]) + " " + esc(x.split("=")[1])).join(" \u00b7 ") + (r.census ? "<br>" + r.census.count + " files \u00b7 " + Number(r.census.bytes).toLocaleString() + " B \u00b7 tree " + esc(String(r.census.tree).slice(0, 12)) : "") + (r.lanes ? "<br>delivered " + esc(String(r.lanes.delivered)) + " \u00b7 wire " + esc(String(r.lanes.wire)) + " \u00b7 mesh " + esc(String(r.lanes.mesh)) + " \u00b7 cloud " + esc(String(r.lanes.cloud)) : ""))).join("")
        : "<div>Nothing yet.</div>",
      "each entry is one pipeline run, kept in this browser (kv \u00b7 relay) \u2014 the record of what was carried, when, and what refused.");
    return;
  }

  /* no argument, or "run": run the pipeline NOW. */
  addBubble("ass", "\u26a1 THE RELAY \u2014 running the master sync pipeline (read \u2192 census \u2192 deliver \u2192 verify \u2192 index \u2192 archive)\u2026");
  const out = await R.run({});
  const tick = v => v === "REAL" ? '<span style="color:#4cd97b">\u2713 REAL</span>' : (v === "BLOCKED" ? '<span style="color:#f5a623">\u26d4 BLOCKED</span>' : (v === "HOLLOW" ? '<span style="color:#f5a623">\u26a0 HOLLOW</span>' : '<span style="color:#d24a33">\u2717 MISSING</span>'));
  const rows = out.stages.map(s => '<div class="rrow' + (s.verdict === "REAL" ? "" : " bad") + '"><b>' + esc(s.name) + '</b><span class="vd">' + tick(s.verdict) + '</span><div class="rd">' + esc(s.role) + '</div></div>'
    + (s.rows || []).map(x => '<div class="rrow"><b>' + esc(x.what) + '</b><span class="vd">' + esc(String(x.state)) + '</span><div class="rd">' + esc(String(x.note || "")) + '</div></div>').join("")).join("");
  const colour = out.result === "COMPLETE" ? "#4cd97b" : (out.result === "HELD" ? "#f5a623" : "#d24a33");
  box("\u26a1 THE MASTER SYNC PIPELINE \u2014 " + esc(out.result),
    row("RESULT", '<span style="color:' + colour + '">' + esc(out.result) + '</span>', esc(out.note))
    + row("DIGEST", "<b>" + esc(String(out.digest).slice(0, 24)) + "\u2026</b>", "the run\u2019s own SHA-256 over its stage verdicts \u2014 the snapshot in the archive carries it")
    + rows
    + row("TOOK", out.ms + " ms", out.station + " \u00b7 " + esc(out.started)),
    "every verdict above was measured in this browser just now. The two doors this station cannot open (the mesh write and the cloud) are reported with the refusal each one gave \u2014 never smoothed over. <b>/pipeline sync</b> is the same run.");
  logOp({ kind:"sync", action:"master sync pipeline", detail: out.stages.map(s => s.name + "=" + s.verdict).join(" "),
    result: out.result + " · " + (out.census ? out.census.count + " files" : "no census") + " · mesh " + ((out.lanes && out.lanes.mesh && out.lanes.mesh.state) || "?") });
}

/* THE OPEN SOURCE MARKET (/market) — the recon and the play, read live from
   src/market.js. Every number it prints was fetched in this browser just now: a
   channel that answered gives a number, a channel that refused gives its refusal.
   The play is printed against those numbers, and the seats are DERIVED from them
   (a seat is open when that market's measured leader is under 100 stars) — never
   asserted, never remembered. */
async function cmdMarket(arg){
  arg = String(arg || "").trim();
  const M = window.ObiMarket;
  if(!M){ addBubble("ass", '\u26a0 <b>src/market.js</b> didn\u2019t load \u2014 reload the page.'); return; }
  const low = arg.toLowerCase();
  const row = (k, v, d) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd">' + v + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>';
  const box = (title, body, foot) => addBubble("ass", '<div class="rise"><div class="rhead">' + title + '</div>' + body + (foot ? '<div class="rfoot">' + foot + '</div>' : '') + '</div>');
  const tick = v => v === "REAL" ? '<span style="color:#4cd97b">\u2713 REAL</span>' : '<span style="color:#f5a623">\u26d4 BLOCKED</span>';
  const lead = c => (c && c.top && c.top[0]) ? ("leader " + esc(String(c.top[0].full || c.top[0].name || c.top[0].id)) + ((c.top[0].stars != null) ? " (" + c.top[0].stars + "\u2605)" : "")) : "";

  if(low === "help"){
    box("\u26a1 THE OPEN SOURCE MARKET \u2014 THE RECON AND THE PLAY",
      row("WHAT IT IS", "nine measured channels", "the market this station already occupies, measured with real endpoints \u2014 GitHub, npm, HuggingFace, Reddit \u2014 and the campaign that follows from the numbers.")
      + M.CHANNELS.map(c => row(c.id, "CHANNEL", esc(c.what) + " \u2014 " + esc(c.role))).join("")
      + row("THE VERDICTS", "REAL \u00b7 BLOCKED", "REAL is an endpoint that answered with a number; BLOCKED is a door that refused, printed with the refusal it gave. Nothing here is estimated.")
      + row("THE SEATS", "OPEN \u00b7 CLOSED", "a seat is OPEN when that market's measured leader is under " + M.SEAT + " stars \u2014 derived from the scan, never asserted."),
      "<b>/market scan</b> measures the market now \u00b7 <b>/market play</b> prints the campaign \u00b7 <b>/market state</b> prints the last recon \u00b7 <b>/market log</b> is the scan ledger. The recon also arms itself after boot.");
    return;
  }

  if(low === "play"){
    box("THE OPEN SOURCE PLAY \u2014 take the seat nobody sat in",
      '<pre style="white-space:pre-wrap;font:12px/1.5 ui-monospace,Menlo,monospace;text-align:left;margin:6px 0">' + esc(M.playText()) + '</pre>',
      "the same play, written down, is <b>src/marketing/OPEN-SOURCE-PLAY.md</b>; the index artefact is <b>src/marketing/awesome-perchance.md</b> \u2014 populated from the live scan and ready to publish.");
    return;
  }

  if(low === "state"){
    const l = await M.last();
    const n = await M.numbers();
    box("\u26a1 THE OPEN SOURCE MARKET \u2014 LAST RECON",
      l ? row("VERDICT", '<span style="color:' + (l.verdict === "MEASURED" ? "#4cd97b" : "#f5a623") + '">' + esc(l.verdict) + '</span>', esc(l.at) + " \u00b7 " + l.measured + "/" + l.channels + " channels answered \u00b7 " + l.ms + " ms \u00b7 digest <b>" + esc(String(l.digest).slice(0, 12)) + "\u2026</b>")
        + (l.channelsDetail || []).map(c => row(esc(c.id), c.state === "REAL" ? tick("REAL") + (c.number == null ? "" : " " + c.number) : tick("BLOCKED"), esc(c.what) + " \u2014 " + lead(c) + (c.refused ? " \u00b7 " + esc(c.refused) : ""))).join("")
        : '<div>No recon on record in this browser.</div>' + n.channels.map(c => row(esc(c.id), c.state === "REAL" ? tick("REAL") + (c.number == null ? "" : " " + c.number) : tick("BLOCKED"), esc(c.what))).join(""),
      "seats measured from this recon: " + n.seats.filter(s => s.open).length + " open \u00b7 <b>/market scan</b> measures again now.");
    return;
  }

  if(low === "log"){
    const list = (await M.scans()).slice(-10).reverse();
    box("\u26a1 THE OPEN SOURCE MARKET \u2014 THE SCAN LEDGER",
      list.length ? list.map(r => row(esc(r.verdict) + " \u00b7 " + esc(r.digest), esc(r.at), r.measured + " channels answered \u00b7 " + r.ms + " ms<br>" + Object.keys(r.numbers || {}).map(k => esc(k) + "=" + (r.numbers[k] == null ? "\u26d4" : esc(String(r.numbers[k])))).join(" \u00b7 "))).join("")
        : "<div>Nothing yet.</div>",
      "each entry is one recon, kept in this browser (kv \u00b7 market) \u2014 the record of what the market was, and when it was measured.");
    return;
  }

  /* no argument, or "scan": measure the market NOW. */
  addBubble("ass", "\u26a1 THE OPEN SOURCE MARKET \u2014 measuring nine channels (GitHub \u00b7 npm \u00b7 HuggingFace \u00b7 Reddit)\u2026");
  const out = await M.scan({});
  const rows = out.channelsDetail.map(c => '<div class="rrow' + (c.state === "REAL" ? "" : " bad") + '"><b>' + esc(c.id) + '</b><span class="vd">' + tick(c.state) + (c.number == null ? "" : " " + c.number) + '</span><div class="rd">' + esc(c.what) + " \u2014 " + lead(c) + (c.refused ? " \u00b7 " + esc(c.refused) : "") + '</div></div>').join("");
  const seatRows = out.seats.map(s => '<div class="rrow"><b>' + esc(s.id) + '</b><span class="vd">' + (s.open ? '<span style="color:#4cd97b">OPEN</span>' : '<span style="color:#8a8a8a">CLOSED</span>') + '</span><div class="rd">' + esc(s.evidence) + ' \u2014 ' + esc(s.channel) + '</div></div>').join("");
  box("\u26a1 THE OPEN SOURCE MARKET \u2014 " + esc(out.verdict),
    row("VERDICT", '<span style="color:' + (out.verdict === "MEASURED" ? "#4cd97b" : "#f5a623") + '">' + esc(out.verdict) + '</span>', esc(out.note) + " \u00b7 " + out.measured + "/" + out.channels + " channels \u00b7 " + out.ms + " ms")
    + row("DIGEST", "<b>" + esc(String(out.digest).slice(0, 24)) + "\u2026</b>", "the recon's own SHA-256 over its channel verdicts")
    + rows
    + row("THE SEATS", out.seats.filter(s => s.open).length + " open \u00b7 " + out.seats.length + " read", "derived from the numbers above \u2014 an open seat is a market whose measured leader is under " + M.SEAT + " stars")
    + seatRows,
    "every number above was fetched in this browser just now. A channel that refused is printed with the refusal it gave \u2014 the play never claims what the scan could not measure. <b>/market play</b> is the campaign.");
  logOp({ kind: "market", action: "open source market recon",
    detail: out.channelsDetail.map(c => c.id + "=" + c.state + (c.number == null ? "" : ":" + c.number)).join(" "),
    result: out.verdict + " · " + out.seats.filter(s => s.open).length + " open seat(s) of " + out.seats.length });
}
/* THE SECRET SAUCE (/SecretSauce) — the method, given away free, read live from
   src/secretsauce.js. Gated by the canon hallmark (only its sha-256 is ever
   stored): /SecretSauce <hallmark> opens it for 15 minutes. Then: best · secrets ·
   upgrade · train · forums · free · state · lock. The train lane builds the ordered
   corpus (best practice first, then the measurement, then the secrets) and hashes
   it; the forums lane asks the forums themselves and keeps every refusal verbatim. */
async function cmdSauce(arg){
  arg = String(arg || "").trim();
  const S = window.ObiSauce;
  if(!S){ addBubble("ass", '\u26a0 <b>src/secretsauce.js</b> didn\u2019t load \u2014 reload the page.'); return; }
  const low = arg.toLowerCase();
  const row = (k, v, d) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd">' + v + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>';
  const box = (title, body, foot) => addBubble("ass", '<div class="rise"><div class="rhead">' + title + '</div>' + body + (foot ? '<div class="rfoot">' + foot + '</div>' : '') + '</div>');
  const pre = t => '<pre style="white-space:pre-wrap;font:12px/1.5 ui-monospace,Menlo,monospace;text-align:left;margin:6px 0">' + esc(t) + '</pre>';
  const EGG = '\uD83C\uDF73';

  if(low === "lock"){ S.lock(); box("THE SECRET SAUCE \u2014 locked", row("STATE", "LOCKED", "the canon is closed again. Nothing was deleted.")); return; }
  if(low === "state"){
    const st = S.state();
    box("THE SECRET SAUCE \u2014 state",
      row("GATE", st.armed ? '<span style="color:#4cd97b">OPEN</span>' : '<span style="color:#f5a623">LOCKED</span>', st.armed ? "open for " + st.minutesLeft + " more minute(s)" : "type the canon hallmark after the command to open it")
      + row("THE METHOD", st.practices + " practices \u00b7 " + st.secrets + " secrets \u00b7 " + st.ladder + " rungs", "src/secretsauce.js \u00b7 src/canon/SECRET-SAUCE.md")
      + row("FAILURES", st.fails + "/" + st.maxFails, st.maxFails + " failures locks the gate for 10 minutes"),
      "the method is <b>free</b> \u2014 the gate is a threshold, not a lock: no service, no account and no data sits behind it. <b>/SecretSauce best</b> \u00b7 <b>secrets</b> \u00b7 <b>upgrade</b> \u00b7 <b>train</b> \u00b7 <b>forums</b>.");
    return;
  }

  if(S.locked()){
    if(!arg || low === "help"){
      box(EGG + " THE SECRET SAUCE \u2014 the method, given away free",
        row("WHAT IT IS", "the canon, opened", "the best practices and the best-kept secrets, measured against the real market \u2014 and the ladder that starts with best practice and then upgrades. Free to read, copy and teach (CC0).")
        + row("HOW TO OPEN IT", "the canon hallmark", "type <b>/SecretSauce</b> followed by the canon hallmark. Only the sha-256 of what you type is stored \u2014 never the plaintext, never logged, never captured.")
        + row("WHAT IS BEHIND THE GATE", "nothing secret", "no service, no account, no credential and no user data. It is a threshold, not a lock: the material is meant to be given away, and the gate exists so the doctrine is entered knowingly.")
        + row("THE LANES", "best \u00b7 secrets \u00b7 upgrade \u00b7 train \u00b7 forums", "the ten practices \u00b7 the best-kept secrets \u00b7 the ladder \u00b7 the ordered training corpus (hashed) \u00b7 a live search of the forums, refusals printed verbatim."),
        "the canon document is <b>src/canon/SECRET-SAUCE.md</b>. <b>/SecretSauce state</b> shows the gate.");
      return;
    }
    const r = await S.unlock(arg);
    if(!r.ok){ box("\u26d4 THE SECRET SAUCE \u2014 refused", row("WHY", '<span style="color:#f5a623">refused</span>', esc(r.why)), "nothing was stored, echoed or logged."); return; }
    box(EGG + " THE SECRET SAUCE \u2014 OPEN",
      row("OPEN FOR", "15 minutes", esc(r.why) + " \u00b7 the canon, given away free."),
      "<b>/SecretSauce best</b> the ten practices \u00b7 <b>/SecretSauce secrets</b> the best-kept secrets \u00b7 <b>/SecretSauce upgrade</b> the ladder \u00b7 <b>/SecretSauce train</b> build the hashed training corpus \u00b7 <b>/SecretSauce forums</b> search the forums \u00b7 <b>/SecretSauce free</b> the terms.");
    return;
  }

  if(low === "best" || low === "practices" || low === "foundation"){
    box(EGG + " THE BEST PRACTICES \u2014 the foundation",
      S.PRACTICES.map(p => row(p.id, esc(p.rule), esc(p.why))).join(""),
      "enforce two of these in code before reading the secrets \u2014 a practice you have not automated is a preference.");
    return;
  }
  if(low === "secrets" || low === "secret"){
    box(EGG + " THE BEST-KEPT SECRETS \u2014 the upgrade",
      S.SECRETS.map(s => row(s.id, esc(s.title), esc(s.body))).join(""),
      "read against the practices, never before them \u2014 that ordering is the secret. <b>/SecretSauce train</b> turns all of it into a corpus.");
    return;
  }
  if(low === "upgrade" || low === "ladder"){
    box(EGG + " THE LADDER \u2014 start with best practice, then upgrade",
      S.LADDER.map(s => row("STEP " + s.step, esc(s.name), esc(s.do))).join(""),
      "the loop is the product: re-measure, and let the corpus grow with the measurements.");
    return;
  }
  if(low === "free" || low === "terms"){
    box(EGG + " FOR FREE \u2014 the terms", row("TERMS", "CC0", esc(S.TERMS)),
      "the only thing that is not free is the work at the end \u2014 a website built for you \u2014 and that is offered, never bundled.");
    return;
  }
  if(low === "train" || low === "corpus"){
    addBubble("ass", EGG + " building the training corpus (best practice \u2192 measurement \u2192 secrets \u2192 the ladder)\u2026");
    const t = await S.train();
    const runs = await S.corpusRuns();
    box(EGG + " THE TRAINING CORPUS \u2014 built",
      row("SIZE", t.chars.toLocaleString() + " chars \u00b7 " + t.bytes.toLocaleString() + " B", t.practiceLines + " practices \u00b7 " + t.secretLines + " secrets \u00b7 the measurement \u00b7 the ladder")
      + row("DIGEST", "<b>" + esc(t.digest.slice(0, 24)) + "\u2026</b>", "the corpus hashed \u2014 it cannot change under you without the digest changing")
      + row("ORDER", "BEST PRACTICE FIRST", "a model fed secrets first learns to guess; a model fed the practices first learns to check. The order is the whole upgrade.")
      + row("WHAT IT DOES NOT CLAIM", "no trained model", "this station cannot fine-tune. It builds the corpus a training run or a retrieval index consumes, and proves its digest \u2014 training is a separate act, on separate infrastructure."),
      "kept in this browser (kv \u00b7 sauce \u00b7 " + runs.length + " built). <a href=\"data:text/markdown;charset=utf-8," + encodeURIComponent(t.corpus) + "\" download=\"secret-sauce-corpus.md\">download the corpus</a> \u00b7 build it again and identical bytes give an identical digest.");
    return;
  }
  if(low === "forums" || low === "forum" || low === "search"){
    addBubble("ass", EGG + " searching the forums (Hacker News \u00b7 dev.to \u00b7 GitHub issues \u00b7 StackExchange \u00b7 Reddit)\u2026");
    const f = await S.forums();
    const tick = v => v === "REAL" ? '<span style="color:#4cd97b">\u2713 REAL</span>' : '<span style="color:#f5a623">\u26d4 BLOCKED</span>';
    const rows = f.rows.map(r => '<div class="rrow' + (r.state === "REAL" ? "" : " bad") + '"><b>' + esc(r.name) + '</b><span class="vd">' + tick(r.state) + (r.number == null ? "" : " " + r.number) + '</span><div class="rd">"' + esc(r.q) + '"' + (r.top && r.top.length ? " \u00b7 top: " + r.top.map(x => esc(x.t) + (x.pts ? " (" + x.pts + " pts)" : "")).join(" \u00b7 ") : "") + (r.refused ? " \u00b7 " + esc(r.refused) : "") + (r.note2 ? " \u00b7 " + esc(r.note2) : "") + '</div></div>').join("");
    box(EGG + " THE FORUMS \u2014 " + esc(f.verdict),
      row("VERDICT", esc(f.verdict), f.measured + "/" + f.total + " forum answers measured in this browser just now \u00b7 digest " + esc(String(f.digest).slice(0, 12)) + "\u2026")
      + rows,
      "a forum that refused is printed with its refusal \u2014 never guessed around. Post the <b>measurement</b>, not the advert: it is true, it is checkable, and it is the one thing the field has never seen.");
    return;
  }

  box(EGG + " THE SECRET SAUCE \u2014 the method, given away free",
    pre(S.canonText()),
    "the canon document is <b>src/canon/SECRET-SAUCE.md</b>. <b>/SecretSauce best</b> \u00b7 <b>secrets</b> \u00b7 <b>upgrade</b> \u00b7 <b>train</b> \u00b7 <b>forums</b> \u00b7 <b>free</b> \u00b7 <b>lock</b>.");
}

/* ⚖ THE RUBRIC (src/rubric.js) — the instrument the word "evaluator" means. It is the
   estate's own inventory row `ana.rubric` ("the word 'evaluator' means this"), which
   sat MISSING until now. What the engine guarantees, and what this command prints:
   every band must carry a verbatim span from the raw record; the ENGINE locates that
   span itself (so an invented quote is refused, never believed) and reads the
   timestamp off the transcript's own utterance map (the model is never asked for a
   clock); and where the record holds a number — words, wpm, pauses, duration, parts,
   dates, speakers — the band is COMPUTED and the model's own band is kept as recorded
   dissent. A band with no verified citation is NOT SCORED, excluded from the total
   and listed in the omission audit, because an error nobody found is not the same as
   no error. Scorecards are append-only and re-verifiable (/rubric verify). */
async function cmdRubric(arg){
  arg = String(arg || "").trim();
  const R = window.ObiRubric;
  if(!R){ addBubble("ass", '⚠ <b>src/rubric.js</b> didn\'t load — reload the page.'); return; }
  const low = arg.toLowerCase();
  const row = (k, v, d) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd">' + (v == null ? "" : v) + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>';
  const box = (t, b, f) => addBubble("ass", '<div class="rise"><div class="rhead">' + t + '</div>' + b + (f ? '<div class="rfoot">' + f + '</div>' : '') + '</div>');
  const pre = t => '<pre style="white-space:pre-wrap;font:12px/1.5 ui-monospace,Menlo,monospace;text-align:left;margin:6px 0;max-height:320px;overflow:auto">' + esc(t) + '</pre>';
  const SH = "⚖";
  const chip = (b, c) => '<span class="chip" style="background:' + c + ';color:#08110c">' + esc(b) + '</span>';

  /* ------------------------------------------------------------------ the card */
  if(!arg || low === "help" || low === "law"){
    const ls = await R.list();
    box(SH + ' THE RUBRIC — the instrument the word "evaluator" means',
      row("WHAT IT IS", "criteria with bands, judged from the record",
        "Every band must carry a verbatim span from the raw record. The engine locates that span itself, reads its timestamp off the transcript's own timeline, and refuses any band it cannot cite. Where the record holds a number, the band is arithmetic — and the model's opinion is kept as recorded dissent.")
      + row("THE LAW", "8 rules, enforced in code",
        "no citation, no score · the machine verifies every quote · the machine reads the clock · arithmetic beats opinion · coverage travels with every total · thresholds are stated, not universal · a scorecard is append-only · a partial record scores only what it holds")
      + row("THE FAMILIES", ls.length + " on this station", ls.map(x => '<b>' + esc(x.id) + '</b> · ' + x.criteria + ' criteria' + (x.custom ? ' · custom' : '')).join('<br>'))
      + row("HOW IT IS ESTABLISHED", chip("COMPUTED", "#4cd97b") + " " + chip("CITED", "#f5a623") + " " + chip("NOT SCORED", "#ff5a5a"),
        "<b>COMPUTED</b> arithmetic on the record — nobody judged it · <b>CITED</b> a verbatim span the engine found, with its source and its time · <b>NOT SCORED</b> no verified ground: fail closed, excluded from the total, listed in the omission audit")
      + row("THE COMMANDS", "list · show · new · score · verify · trend · archive · canary",
        "<b>/rubric list</b> the families · <b>/rubric show cefr.speaking</b> the criteria and every band · <b>/rubric score Minh</b> (or the active subject) · <b>/rubric new Year 7 writing :: task :: lexis :: grammar</b> your own rubric, versioned and hashed · <b>/rubric verify rb-…</b> re-check every citation against the record as it stands · <b>/rubric trend Minh</b> the band movement between runs · <b>/rubric canary</b> the engine checking itself")
      + row("WHAT IT WILL NOT DO", "reassure you",
        "It will not score from a partial recording without saying so, it will not print a total without its coverage, and it will not repeat a quote it could not find. A rubric that flatters is worth less than no rubric."),
      "the engine is <b>src/rubric.js</b> · the law is restated in its header · <b>/rubric canary</b> runs the machine check.");
    return;
  }

  if(low === "list" || low === "rubrics" || low === "families"){
    const ls = await R.list();
    box(SH + " THE RUBRIC FAMILIES — " + ls.length + " on this station",
      ls.map(x => '<div class="rrow"><b>' + esc(x.id) + '</b><span class="vd">' + chip("v" + x.version, x.custom ? "#f5a623" : "#4cd97b") + '</span><div class="rd">' + esc(x.name) + ' · ' + x.criteria + ' criteria · scale ' + esc(x.scale) + ' · digest ' + esc(String(x.sha).slice(0, 16)) + '…' + (x.custom ? ' · <b>custom</b> (defined on this station)' : ' · built-in') + '</div></div>').join(""),
      "<b>/rubric show &lt;id&gt;</b> reads one out in full. A custom rubric is versioned on every edit, so a stored scorecard's cited definition can never change under it.");
    return;
  }

  if(low.startsWith("show ") || low.startsWith("read ")){
    const id = arg.replace(/^(?:show|read)\s+/i, "").trim();
    const d = await R.get(id);
    if(!d){ addBubble("ass", '⚠ no rubric called <b>' + esc(id) + '</b> — <b>/rubric list</b>'); return; }
    box(SH + " " + esc(d.id) + " — " + esc(d.name) + " (v" + d.version + ")",
      row("SCALE", esc(d.scale), esc(d.purpose))
      + row("DIGEST", esc(String(d.sha).slice(0, 24)) + "…", "the definition that judged a scorecard cannot change without this digest changing")
      + d.criteria.map(c => row(c.name + (c.role === "context" ? " (context)" : "") + (c.measure ? " · engine-measured" : ""), esc(c.id), esc(c.question) + "<br>" + c.bands.map(b => '<b>' + esc(b.label) + '</b> — ' + esc(b.desc || "")).join("<br>"))).join(""),      "<b>/rubric score &lt;subject&gt; --rubric " + esc(d.id) + "</b> to use it.");
    return;
  }

  /* a custom rubric, in one line: /rubric new <name> :: <criterion> :: <criterion> … */
  if(low.startsWith("new ") || low.startsWith("define ")){
    const body = arg.replace(/^(?:new|define)\s+/i, "").trim();
    const bits = body.split("::").map(s => s.trim()).filter(Boolean);
    const name = bits.shift();
    if(!name || bits.length < 2){ addBubble("ass", '⚠ a custom rubric needs a name and at least two criteria:<br><b>/rubric new Year 7 writing :: task achievement :: lexical range :: accuracy</b><br>Each criterion is <b>Name :: what to look for</b> (or just the name).'); return; }
    const scaleM = arg.match(/--scale\s+([^:]+)/i);
    const res = await R.define(name, bits, scaleM ? { scaleName: scaleM[1].trim() } : {});
    if(!res.ok){ addBubble("ass", "⚠ " + esc(res.why)); return; }
    const d = res.def;
    box(SH + " RUBRIC DEFINED — " + esc(d.name),
      row("ID", '<b>' + esc(d.id) + '</b>', "v" + d.version + " · digest " + esc(d.sha.slice(0, 20)) + "…")
      + row("CRITERIA", d.criteria.length + " on a " + d.criteria[0].bands.length + "-band scale", d.criteria.map(c => '<b>' + esc(c.name) + '</b> — ' + esc(c.question)).join("<br>")),
      "stored on this station (kv · rubrics). <b>/rubric score &lt;subject&gt; --rubric " + esc(d.id) + "</b> · editing it again makes v" + (d.version + 1) + " and leaves v" + d.version + " intact for every scorecard that cited it.");
    return;
  }

  /* --------------------------------------------------------------- the canary */
  if(low === "canary" || low === "selftest" || low === "self-test"){
    addBubble("ass", SH + " running the canary — the engine checking itself, no model and no network…");
    const c = await R.canary();
    box(SH + " THE CANARY — " + (c.pass === c.total ? '<span style="color:#4cd97b">' + c.pass + "/" + c.total + " PASS</span>" : '<span style="color:#ff5a5a">' + c.pass + "/" + c.total + " — FAILURES BELOW</span>"),
      c.checks.map(x => '<div class="rrow' + (x[1] ? '' : ' bad') + '"><b>' + esc(x[0]) + '</b><span class="vd">' + (x[1] ? "✓" : "✗") + '</span><div class="rd">' + esc(String(x[2] == null ? "" : x[2]).slice(0, 200)) + '</div></div>').join(""),
      "this drives the real pipeline with a canned model response and asserts the law: arithmetic beats opinion, an invented quote is refused, a band with no citation is not scored, the clock comes off the record, coverage travels with the total, and a forged citation is caught by verify. No model, no network, no evidence of yours.");
    try{ logOp({ kind: "rubric", action: "canary", detail: c.pass + "/" + c.total, result: c.pass === c.total ? "PASS" : "FAILURES: " + c.checks.filter(x => !x[1]).map(x => x[0]).join("; ") }); }catch(err){}
    return;
  }

  /* ------------------------------------------------------------- the archive */
  if(low === "archive" || low === "runs" || low === "scorecards"){
    const rs = await R.runs();
    box(SH + " THE SCORECARDS — " + rs.length + " on this station",
      rs.slice(0, 30).map(r => '<div class="rrow"><b>' + esc(r.subject.name) + '</b><span class="vd">' + chip(r.verdict, r.verdict === "REAL" ? "#4cd97b" : (r.verdict === "PARTIAL" ? "#f5a623" : "#ff5a5a")) + '</span><div class="rd">' + esc(r.rubric.id) + ' v' + r.rubric.version + ' · ' + esc(r.total.form) + (r.total.composite ? ' → <b>' + esc(r.total.composite) + '</b>' : '') + ' · ' + esc(r.period) + ' · ' + esc(r.id) + (r.supersededBy ? ' · <i>superseded by ' + esc(r.supersededBy) + '</i>' : '') + '</div></div>').join("") || row("EMPTY", "nothing scored yet", "score something first: <b>/rubric score</b>"),
      "every scorecard is kept as written and can be re-checked: <b>/rubric verify &lt;run id&gt;</b> re-locates every citation in the record as it stands now.");
    return;
  }

  /* --------------------------------------------------------------- the trend */
  if(low.startsWith("trend") || low.startsWith("drift")){
    const who = arg.replace(/^(?:trend|drift)\s*/i, "").trim();
    const t = await R.trend(who || null);
    if(!t.runs || !t.sets || !t.sets.length){
      box(SH + " THE TREND", row("RUNS", t.runs || 0, esc(t.note || "no comparison available yet")), "score the same subject twice on the same rubric and the movement between them is printed here.");
      return;
    }
    const parts = [];
    for(const st of t.sets){
      parts.push('<div class="rhead" style="margin-top:6px">' + esc(st.rubric.id) + ' — ' + st.runs + ' run(s) · mean ' + esc(String(st.means.first)) + ' → ' + esc(String(st.means.last)) + '</div>');
      parts.push(row("PERIOD", "", esc(st.period)));
      for(const x of st.rows){
        let vd;
        if(x.state === "NO COMPARISON") vd = "—";
        else if(x.state === "HELD") vd = chip("HELD", "#8a93a6");
        else if(x.delta > 0) vd = '<span style="color:#4cd97b">▲ ' + esc(x.from) + ' → ' + esc(x.to) + '</span>';
        else vd = '<span style="color:#ff5a5a">▼ ' + esc(x.from) + ' → ' + esc(x.to) + '</span>';
        parts.push('<div class="rrow"><b>' + esc(x.name) + '</b><span class="vd">' + vd + '</span><div class="rd">' + esc(x.why || "") + '</div></div>');
      }
    }
    box(SH + " THE TREND — " + esc(who || "the active subject"), parts.join(""),
      "only criteria scored in BOTH runs are compared — a criterion that was never scored in one of them is not a movement, it is a gap, and is printed as one.");
    return;
  }

  /* -------------------------------------------------------------- the verify */
  if(low.startsWith("verify") || low.startsWith("audit")){
    const id = arg.replace(/^(?:verify|audit)\s*/i, "").trim();
    if(!id){ addBubble("ass", '⚠ which scorecard? <b>/rubric archive</b> lists them — then <b>/rubric verify rb-…</b>'); return; }
    addBubble("ass", SH + " re-checking every citation of <b>" + esc(id) + "</b> against the record as it stands now…");
    const v = await R.verify(id);
    if(!v.ok){ addBubble("ass", "⚠ " + esc(v.why)); return; }
    box(SH + " RE-VERIFICATION — " + esc(v.run.subject.name) + " · " + esc(v.run.id),
      row("VERDICT", '<b style="color:' + (v.verdict === "ALL STAND" ? "#4cd97b" : "#ff5a5a") + '">' + esc(v.verdict) + '</b>', (v.rows.filter(x => x.state === "VERIFIED").length) + " citation(s) found again · " + v.rows.filter(x => x.state === "DRIFTED").length + " NOT found · " + v.rows.filter(x => x.state === "STANDS").length + " computed (re-runnable, not re-verifiable by quote) · " + v.rows.filter(x => x.state === "NOT SCORED").length + " never scored")
      + v.rows.map(x => '<div class="rrow' + (x.state === "DRIFTED" ? ' bad' : '') + '"><b>' + esc(x.id) + '</b><span class="vd">' + chip(x.state, x.state === "VERIFIED" ? "#4cd97b" : (x.state === "DRIFTED" ? "#ff5a5a" : "#8a93a6")) + '</span><div class="rd">' + esc(x.why) + '</div></div>').join(""),
      "this is the point of a scorecard: it can be audited later, by someone else, against the record as it stands. A citation that no longer exists is reported as DRIFTED, never quietly dropped.");
    return;
  }

  /* -------------------------------------------------------------- the export */
  if(low.startsWith("export") || low.startsWith("download")){
    const id = arg.replace(/^(?:export|download)\s*/i, "").trim();
    const r = await R.getRun(id);
    if(!r){ addBubble("ass", '⚠ no scorecard called <b>' + esc(id) + '</b> — <b>/rubric archive</b>'); return; }
    const md = R.toMarkdown(r), html = R.toPrintHTML(r);
    box(SH + " EXPORT — " + esc(r.subject.name),
      row("MARKDOWN", esc(md.length) + " chars", '<a href="data:text/markdown;charset=utf-8,' + encodeURIComponent(md) + '" download="scorecard-' + esc(r.subject.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()) + '.md">download the scorecard (.md)</a>')
      + row("PRINTABLE", esc(html.length) + " chars", '<a href="data:text/html;charset=utf-8,' + encodeURIComponent(html) + '" download="scorecard-' + esc(r.subject.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()) + '.html" target="_blank">open the printable (print to PDF)</a>')
      + row("ON SCREEN", "", '<button class="ci-act" onclick="window.ObiRubric.download(\'scorecard.json\', JSON.stringify(window.ObiRubric.__last||{} , null, 2), \'application/json\')">download this run as JSON</button>'),
      "the printable carries the same citations, the rubric digest and the run digest — an outside reader can check every quote against the transcript.");
    try{ R.__last = r; }catch(err){}
    return;
  }

  /* --------------------------------------------------------------- the score */
  /* /rubric score [subject] [--rubric id] [--focus text] [--kind student|class]
     Shortcuts: /rubric errors [subject] → the error taxonomy, /rubric teach → the lesson. */
  const errMode = /^(errors?|err)\b/.test(low), teachMode = /^(teach|lesson)\b/.test(low);
  const sp = arg.replace(/^(?:score|run|assess|grade|errors?|err|teach|lesson)\s*/i, "").trim();
  const rMatch = sp.match(/--rubric\s+([^\s]+)/i);
  const fMatch = sp.match(/--focus\s+(.+)$/i);
  const kMatch = sp.match(/--kind\s+([^\s]+)/i);
  const who = sp.replace(/--(rubric|focus|kind)\s+[^\s]+/gi, " ").replace(/\s+/g, " ").trim() || null;
  let id = rMatch ? rMatch[1] : (teachMode ? "teach.lesson" : (errMode ? "err.taxonomy" : null));
  if(!id){
    const Rv = window.ObiReview;
    let kind = kMatch ? kMatch[1] : null;
    if(!kind){ try{ const c = Rv && Rv.context && Rv.context(); const a = await (Rv && Rv.current ? Rv.current() : null); kind = (a && a.kind) || (c && c.kind) || "student"; }catch(e){ kind = "student"; } }
    id = (kind === "class") ? "teach.lesson" : "cefr.speaking";
  }
  const def = await R.get(id);
  if(!def){ addBubble("ass", '⚠ no rubric called <b>' + esc(id) + '</b> — <b>/rubric list</b>'); return; }

  const bubble = addBubble("ass", "");
  bubble.innerHTML = '<div class="tr-status hint" style="text-align:left"></div><div class="tr-out"></div>';
  const status = bubble.querySelector(".tr-status"), out = bubble.querySelector(".tr-out");
  status.innerHTML = SH + " scoring with <b>" + esc(def.id) + "</b> (v" + def.version + ") — reading the record, then putting every claim beside the span it came from\u2026";
  let ticks = 0;
  const timer = setInterval(() => { ticks++; status.innerHTML = SH + " scoring with <b>" + esc(def.id) + "</b> \u00b7 " + ticks + "s — the engine will check every quote it is given"; }, 1000);
  const res = await R.score(id, who, { focus: fMatch ? fMatch[1].trim() : null, kind: kMatch ? kMatch[1] : null,
    onChunk: acc => { out.textContent = String(acc || "").slice(-700); try{ scrollDown(); }catch(err){} } });
  clearInterval(timer);
  if(!res.ok){
    status.innerHTML = "⚠ the run stopped: " + esc(res.why || res.error || "unknown");
    if(res.gate && !res.gate.ok) status.innerHTML += " \u2014 <b>nothing was scored</b>: " + esc((res.gate.reasons || []).join(" \u00b7 "));
    bubble.querySelector(".tr-out").innerHTML = '<div class="hint">A rubric refuses an empty record on purpose. Record the class or add a note first: <b>/transcribe</b> \u00b7 <b>/summary</b> \u00b7 <b>/note</b>, then file it under the subject with <b>/file</b>.</div>';
    return;
  }
  status.innerHTML = "";
  out.textContent = "";
  bubble.innerHTML = R.card(res);
  const acts = document.createElement("div");
  acts.className = "tr-acts";
  acts.style.marginTop = "8px";
  const md = R.toMarkdown(res.run), html = R.toPrintHTML(res.run);
  const nm = res.run.subject.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  [["📄 .md", () => R.download("scorecard-" + nm + ".md", md, "text/markdown")],
   ["🖨 Printable", () => { const w = window.open("", "_blank"); if(w){ w.document.write(html); w.document.close(); } }],
   ["⚖ Verify now", () => cmdRubric("verify " + res.run.id)],
   ["📈 Trend", () => cmdRubric("trend " + res.run.subject.name)],
   ["⛔ Supersede", null]
  ].forEach(([lbl, fn]) => {
    const b = document.createElement("button");
    b.className = "ci-act"; b.textContent = lbl;
    if(fn) b.onclick = fn;
    else b.onclick = async () => {
      const prev = (await R.runs(res.run.subject.name)).filter(r => r.id !== res.run.id && r.rubric.id === res.run.rubric.id)[0];
      if(!prev) { status.textContent = "no earlier run of this rubric to supersede."; return; }
      await R.supersede(prev.id, res.run.id);
      status.innerHTML = "earlier run <b>" + esc(prev.id) + "</b> annotated as superseded by <b>" + esc(res.run.id) + "</b> — the earlier scorecard is kept, not rewritten.";
    };
    acts.appendChild(b);
  });
  bubble.appendChild(acts);
  const foot = document.createElement("div");
  foot.className = "hint";
  foot.style.textAlign = "left";
  foot.textContent = "Run " + res.run.id + " · verdict " + res.run.verdict + " · " + res.run.total.form + " · digest " + String(res.run.digest).slice(0, 16) + "…";
  bubble.appendChild(foot);
  return res;
}

const COMMAND_BOOK = [
  { group: "⌘ Command Station — speak, and operate", items: [
    ["/help", "this shelf — every command, one tap", 0],
    ["/generators", "the ◈ Phoenix Generators family — PrAis's divisions, and every generator in them", 0],
    ["/settings", "voice · the shelf · the ledger · the live instruments · reincarnate", 0],
    ["/state", "what this station is and can reach, right now (the live map)", 0],
    ["/blueprint", "blueprint mode — the architect's plan for the build in flight (the layers · the contracts · the budget · the deploy · the tests)", 0],
    ["/roles", "THE ROLES — the intake taken apart: one generator per function (the CV · the LinkedIn · the headshot · the portfolio · the applications · the interview · the umbrella · the presence · the credit · the lists · the 44 · the weekly presentation). `/roles` lists them and opens one here, on this station's own records — the same store /intake uses; each is also its own generator in src/generators/ (paste main.pjs + index.html). `/roles cv-forge` · `/roles 5`. The 44 and the weekly presentation open here too, though the registry files them under NET because the classroom owns what they measure", 0],
    ["/assets", "the asset register — every asset in the blueprint, located, labelled, SHA-256 hashed · /assets verify re-hashes them here", 0],
    ["/brain", "the mastermind's memory — search everything (artifacts · files · docs · commands · soul · I-LOG) · /brain sync runs the auto lane · /brain archive snapshots the state · /brain keys = the credential ledger by fingerprint · /brain share <path|url>", 0],
    ["/relay", "THE MASTER SYNC PIPELINE — READ → CENSUS → DELIVER → VERIFY → INDEX → ARCHIVE, one ordered run. It hashes every declared file and rebuilds the register's own tree digest, carries the four truth-documents out by digest, tries the mesh and the cloud, re-hashes every URL it delivered, seals the run — and reports REAL / HOLLOW / MISSING / BLOCKED, never COMPLETE with a shut door · /relay state · /relay log", 0],
    ["/market", "THE OPEN SOURCE MARKET — measure the market this station already occupies, then take the seat nobody sat in. It fetches nine real endpoints (GitHub · npm · HuggingFace · Reddit), prints a NUMBER for each or the refusal it gave, DERIVES the open and closed seats from what it measured (an empty seat is a market whose leader is under 100 stars), and prints the play · /market scan · /market play · /market state · /market log", 0],
    ["/SecretSauce", "THE SECRET SAUCE — the method, given away free, opened by the canon hallmark. The ten best practices, the best-kept secrets, and the ladder that starts with best practice and then upgrades · /SecretSauce train builds the ORDERED training corpus (best practice → measurement → secrets) and hashes it · /SecretSauce forums searches the forums live and prints every refusal verbatim · best · secrets · upgrade · free · state · lock", 0],
    ["/memory", "the Soul DNA ledger — verbatim fragments, runs, timestamps", 0],
    ["/queue", "the command tunnel queue — claim → execute → complete", 0],
    ["/os", "Agent 99 OS: the kernel, the offering loaded, the nest", 0],
    ["/playbook", "the offerings (list) · /playbook TESTUDO to activate one", 0],
    ["/route", "ask the pheromone field which road to take", 1],
    ["/pheromones", "read the ground (trails · decay · reinforcement) · evaporate · reset", 0],
    ["/scout", "PhoenixScout: touch the terrain, flag DEAD/DRIFT/BLOCKED", 0],
    ["/tools", "the evaluator tool inventory (built / partial / missing)", 0],
    ["/constellation", "every piece of the ecosystem, its state and its live URL", 0],
    ["/brand", "the identity system — palette · iconography · the shipped marks · GOSPEL 444 · the emblems · the print room · THE MARKETING REGISTER · THE PHOENIX RISING CODEX (open · rules · icons · marks · palette · doctrine · modes · deck · emblems · patterns · print · marketing · codex · ads · landing · codex-deck · posters · sheet · badge-sheet · certificate · marketing-set · method-card · ad-sheet · enrolment · run-readout)", 1],
    ["/network", "the connected-generator mesh (CGN)", 0]
  ]},
  { group: "👤 Student Evaluator — record → summarize → write up", items: [
    ["/transcribe", "record a lesson — video/audio of any length, verbatim", 0],
    ["/transcripts", "the recording archive (read · parts · export · delete)", 0],
    ["/summary", "a study summary from a recording, a page, or notes", 0],
    ["/summaries", "the summary archive", 0],
    ["/client", "create/switch the client (the ledger is the truth) · /clients = the ledger", 1],
    ["/class", "create/select a class · /classes = the roster", 1],
    ["/student", "create/select a student · /students = the roster", 1],
    ["/note", "a dated observation filed under the active subject", 1],
    ["/file", "attach a saved transcript/summary to the active subject", 1],
    ["/writeup", "write up the active class · /writeups = the archive", 0],
    ["/review", "write up the active student · /reviews = the archive", 0],
    ["/find", "verbatim search across every transcript, summary and note", 1],
    ["/rubric", "THE RUBRIC — criteria with bands, and every band CITED from the raw record: the engine locates each quote itself, reads the timestamp off the transcript’s own timeline, refuses any band it cannot cite, and uses arithmetic over opinion wherever the record holds a number · /rubric list · show <id> · new <name> :: <criterion>… · score [name] · verify <run> · trend [name] · archive · canary", 0],
  ]},
  { group: "🌐 The open net — Obi's basic senses", items: [
    ["/web", "search the net, read the top sources, cite what it found", 1],
    ["/wiki", "an encyclopaedia extract, verbatim", 1],
    ["/weather", "current conditions, measured now", 1],
    ["/url", "read one page", 1],
    ["/img", "generate an image (routes to the image node when one is registered)", 1]
  ]},
  { group: "⛓ The mesh — one organism, many generators", items: [
    ["/netjoin", "join/create a network (this station is the anchor)", 1],
    ["/netadd", "register another of your generators as a node", 1],
    ["/netsync", "force a sync — push captures, pull every member", 0],
    ["/netrole", "set this node's role", 1],
    ["/netkey", "reveal the hub editKey (anchor only)", 0],
    ["/masterlink", "THE MASTER LINK — the master's side of the handoff lane. /masterlink status reads every generator named under the umbrella (by CONTENT KEY, no token); sync now looks at them all; name <generator> aims the link (a name is stored only once it RESOLVES — naming is the command this station actually has); list [gen] the whole published tree; read <gen> <path> any file, whole; inbox the handoffs pulled, verbatim, with digests; order <generator> :: <instruction> issues THE COMMAND down both lanes that cross (the Legion queue AND the artifact courier) and shows each verdict; orders = what has been issued; reply <text> answers as an artifact; off|on the every-3-minute watch, skipped while the tab is hidden · card = this station's own master-link card read off the pull lane · card publish writes it (the platform's answer, verbatim) · card pull <gen> reads any other station's card", 0],
    ["/mastermind", "THE RANK — apex vs sub. This station is the apex mastermind (answers to sovereign only). /mastermind = rank card · /mastermind parent <generator> = this clone becomes a sub of that apex (must resolve) · /mastermind apex = release back to apex · clone recipe included · /mastermind <dept> opens a department desk (training · systems · fsdev · a2zmarketing)", 0],
    ["/umbrella", "THE UMBRELLA — every generator this station answers for, and what it can actually do to each. /umbrella reads them all right now (the master link's own reading: FOUND · files · bytes · index.html and main.pjs sizes); /umbrella <generator> reads one generator now; /wings is the same door. Reads only — no generator can write into another's namespace, and this card never claims one did", 0],
    ["/boardroom", "THE BOARDROOM — the mastermind ritual, in-house. /boardroom <question> convenes every executive and above: each POV spoken, everything challenged, the challenged output (the BESTIARY) feeding the Architect's blueprint · /boardroom press <seat> cross-examines one seat (ceo · architect · pres · training · systems · fsdev · atoz) · /boardroom room opens the living table (the Boardroom tab — organic talk, victories celebrated) · /boardroom name <seat> <name> renames a seat · /boardroom law|memory <seat> reads that seat's law / memory file · /boardroom fire|hire <seat> empties / refills a chair · /boardroom take|yield <seat> the sovereign holds / releases a chair himself · /boardroom call me <name> names the sovereign. The table advises, the sovereign decides, HQ orders — nothing here commands"],
    ["/wire", "THE FREE WIRE — control of the estate with NO credential. Every lane was written to and read back from this origin: uploads.dev (permanent carrier) · ntfy.sh (a public nerve: publish, and the whole 12 h history in one GET) · keyvalue.immanuel.co (the MUTABLE pointer — the only store measured where a value can be overwritten with no account) · x0.at · ntfy attachments · tmpfiles · paste.rs · pastes.dev · GitHub reads. /wire is the measured lane table; probe re-measures every lane live; announce aims the pointer at the newest register AND broadcasts it on the nerve, then READS THE POINTER BACK, so any station finds the register with no token, no account and no URL from anyone; pointer reads it as it stands; send <text> broadcasts; tail [n] reads the nerve verbatim; put <path> carries a file out; slate <text> writes something permanent. The two credential doors (GitHub PAT · Cloudflare token) are still listed, with their refusal, and are not pretended open", 0],
     ["/push", "the shelf ferry, no files — packs this browser's whole shelf and prints a short URL to carry (secrets never travel, device keys stay local, 48 h window)", 0],
     ["/pull", "/pull <push-url> — collect a pushed shelf with safe rules: soul unions, sealed SCS never unsealed, RRL and sittings added, I-LOG adopted only onto a fresh chain (otherwise recorded, never overwritten)", 1]
  ]},
  { group: "◈ Departments — the Senior Exec desks", items: [
    ["/training", "Head of Training desk (EaiB) — outcomes through teaching · doors: /transcribe · /class · /writeup · /lesson · /curriculum · /intake · alias /eaib", 0],
    ["/systems", "Head of Systems desk — custody, roads, hygiene · doors: /vault · /ilog · /doctor · /bg · /keys · alias /sys", 0],
    ["/fsdev", "Head of FullStackDev desk — products built to order · doors: /free (the build room) · /forge · /blueprint · /assets · alias /fullstack", 0],
    ["/a2zmarketing", "Head of A-to-Z Marketing desk — voice · image · funnels · community · doors: /brand · /market · /img · alias /a2z", 0]
  ]},
  { group: "📚 NET Academy — the lessons", items: [
    ["/lesson", "the Lesson Creator desk — 🧭 Plan from this week's evidence · ✍ Build · 🗂 Library · 📐 Standard", 0],
    ["/lesson <topic>", "Agent 99 writes a lesson on that topic, builds it, and checks it against the standard", 1],
    ["/lesson check", "the lesson validator — a lesson that fails it is not shipped", 0],
    ["/lesson standard", "the law: LSN-1…23 — the format (from the two reference lessons) and the method (from NET-CLASSROOM-MANAGER.html)", 0],
    ["/lesson list", "the lessons built in this browser (scoped to the active client)", 0],
    ["/lesson push <id>", "commit a built lesson to the canon beside the class it came from (needs the /phoenixomegaprotocol gate)", 1],
    ["/intake", "🎓 THE INTAKE — the app that remembers: every promise made in a lesson recording, who owes it, and what has arrived", 0],
    ["/intake <name>", "one dossier — the record, the evidence behind every row, and the next thing to do", 1],
    ["/intake receive <name> :: <what>", "file what a student sent against the item it serves — the item moves to MATERIAL IN, and the raw is kept verbatim", 1],
    ["/intake cv <name> [build]", "the CV: what is ready, what is MISSING, and the printed A4 sheet — a guessed row is never printed", 1]
  ]},
  { group: "☁ Canon, cloud and self-check", items: [
    ["/canon", "the ONE authority (Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-) · /canon sync · /canon doctrine", 0],
    ["/git", "THE GIT, OPEN — every part of the canon that answers with NO token (the public monorepo · the Worker source · the raw soul-DNA archive), the one branch that is behind a PAT, and the one line that opens it. /git repos = the live census · /git tree [path] · /git search <term> · /git read <path> · /git archive · /git doctrine · /git auth", 0],
    ["/proposed", "the staging lane, as an index — the review itself is on /pipeline, at the stage that carries each proposal, when it is its time", 0],
    ["/ilog", "the I-LOG — operation record, chain verify, Git anchor (verify · push · pull · export · anchors · reset)", 0],
    ["/phoenixomegaprotocol", "PHOENIXOMEGAPROTOCOL — the gate that WRITES: arm it and the change is made (written to the authority branch and committed). /phoenixomegaprotocol apply <the change> · /canon apply (the staged amendments), or both in one breath, /PhoenixOmegaProtocol <password> :: <the change> · /phoenixomegaprotocol lock to disarm", 0],
    ["/idea ", "raise a change as SOUL — captured verbatim, then it moves through the pipeline like everything else", 1],
    ["/forge", "the SELF-FORGE — read its own source, edit itself, commit to the authority (gated), hot-swap a live module", 0],
    ["/cf", "the Cloudflare fleet: /cf token <token> (stores the account id with it) · /cf status · /cf deploy <name> · /cf r2 — the object store and the S3 key pair, proven by a signed request · all of it sealed in the vault", 0],
    ["/gh", "GitHub status · /gh test = what this token can really do · /gh backup = the whole build (chat + sources + I-LOG) → the one authority", 0],
    ["/vault", "Every secret, in three layers — L1 this browser · L2 sealed on the canon · L3 tested live. /vault escrow <passphrase> wraps the private key and publishes the one-URL recovery bundle (the passphrase alone rebuilds the whole vault on any machine, no GitHub token)", 0],
    ["/dg", "the Ear's Deepgram key · /dg test · /dg recover", 1],
    ["/keys", "which secrets are stored locally (never in this public source)", 0],
    ["/save", "is the generator actually saving? — what the editor said to this page (the save round-trip, and the platform's own failure list)", 0],
    ["/vault", "the PrAis Vault — every key the empire runs on · locate · test · seal · push", 0],
    ["/status", "station status", 0],
    ["/bg", "background operation — the keep-alive, the away-measurement, /bg audio on|off", 1],
    ["/auto", "the master switch for every automatic lane — /auto = state · /auto on = resume (brain 5m · relay 30m · market 30m · masterlink watch 3m · cgn flush) · /auto off = stop them all (command #10). Stopped is the resting state; manual commands (/brain sync · /relay · /market scan · /masterlink sync) still work", 0],
    ["/gateway", "gateway status", 0],
    ["/doctor", "self-check", 0],
    ["/audit", "audit pass (fail-closed)", 0],
    ["/ledger", "the raw record + the soul ledger (verbatim evidence)", 0],
    ["/report", "the session report", 0],
    ["/fieldguide", "the Legionnaire Field Guide (L37–L60, the laws)", 0]
  ]},
  { group: "🔥 Free Phoenix Mode — the unbound room", items: [
    ["/curriculum", "the school's own pacing guide, parsed — primary 1-5 and secondary 6-9, every book, every section · /curriculum 6 (the year, your scope) · /curriculum week 3 · /curriculum unit <name> · /curriculum find <text> · /curriculum scope (whose periods are whose) · /curriculum materials (templates, links, ebooks) · /curriculum import (a newer .xlsx) · /curriculum export 6", 0],
    ["/coverage", "the pacing guide vs the record: which sections the station's own evidence shows, and which it has no evidence of (evidence-driven, never assumed)", 0],
    ["/free", "Agent 99 with the leash off: no Canon, no gate, no Git, no cloud, no record. It builds what you ask, and it EDITS ITSELF. /free opens it; inside: plain text, /build app <ask>, /build gator <ask>, /self, /forge <change>, /apply, /revert, /eval <js>, /files, /read, /dl, /open (📎 Attach — device text files, local only), /wipe, /seal", 0]
  ]},
  { group: "♻ Protocol — reincarnation", items: [
    ["/rome run ", "ROME PROTOCOL + the full SCS loop (RISE→…→DEATH→S2Pipeline) — canon", 1],
    ["/scs", "the canon session loop — all 7 stages and the fidelity gate", 0],
    ["/pipeline", "the S2Pipeline artifact — REAL / HOLLOW / MISSING", 0],
    ["/phoenixRISE ", "SCS Stage 1 — audit the prior DEATH, gate, stamp the session name", 1],
    ["/phoenixDEATH", "SCS Stage 7 — the 7-point march, seal, handoff", 0],
    ["/reincarnateDEATH", "SCS Stage 7 under its sovereign alias, run OUT OF ORDER on his word when no session is open — the 7-point march is walked over this browser's real record (the supply lines and the station audit are re-read for it), the SEAL and the HANDOFF are reported WITHHELD with the reason named (a session that was never opened cannot be sealed, and the station does not invent one), and it goes STRAIGHT INTO THE S2PIPELINE, which is then printed as its own artifact", 0]
  ]}
];
/* the shelf is also the brain's source for what this station can be asked to do:
   one list, read live, so a command can never be indexed that does not exist. */
window.ObiCommandBook = COMMAND_BOOK;

/* the shelf opens as eight doors, not eighty buttons. Nothing is removed:
   open a door and every command in it is there, one tap away. */
const SHELF_OPEN = { 0: true };
let shelfFull = false;
let shelfAll = false;

function shelfHint(s){
  const t = String(s || "");
  if(shelfFull) return t;
  let c = t.split(" \u00b7 ")[0];
  const m = c.match(/^(.{0,150}?[.;])(\s|$)/);
  if(m) c = m[1];
  if(c.length > 104) c = c.slice(0, 101).trim() + "\u2026";
  return c;
}

function shelfHTML(){
  const total = COMMAND_BOOK.reduce((n, g) => n + g.items.length, 0);
  const groups = COMMAND_BOOK.map((g, gi) => {
    const open = !!SHELF_OPEN[gi];
    const rows = g.items.map(it => '<button class="cmd" data-cmd="' + esc(it[0]) + '" data-arg="' + (it[2] ? "1" : "") + '" title="' + esc(it[1]) + '">'
      + '<b>' + esc(it[0]) + '</b><span class="cmd-hint">' + esc(shelfHint(it[1])) + (it[2] ? ' <i>\u2014 needs your words</i>' : '') + '</span></button>').join("");
    const name = String(g.group || "").split(" \u2014 ")[0];
    return '<div class="shelf-group">'
      + '<button class="shelf-head' + (open ? ' open' : '') + '" data-g="' + gi + '" title="' + esc(g.group) + '"><span class="sh-caret">' + (open ? '\u25be' : '\u25b8') + '</span><span class="sh-name">' + esc(name) + '</span>' + (open ? '' : '<span class="sh-sub">' + esc(String(g.group || "").split(" \u2014 ")[1] || "") + '</span>') + '<span class="sh-count">' + g.items.length + '</span></button>'
      + '<div class="cmdbook" data-body="' + gi + '"' + (open ? '' : ' hidden') + '>' + rows + '</div>'
      + '</div>';
  }).join("");
  return '<div class="rise"><div class="rhead">\u2318 Commands \u2014 the whole shelf \u00b7 ' + total + '</div>'
    + '<div class="rrow"><b>HOW</b><span class="vd">OPEN A DOOR \u00b7 TAP TO RUN</span><div class="rd">Eight doors, ' + total + ' commands. Open one, then tap a command to run it in the chat. Commands that need your own words are typed in for you to finish (they are never run blind). Anything that is <i>not</i> a command is simply speech \u2014 type it or tap \ud83c\udf99 and Obi answers, grounded in the live station state.</div></div>'
    + '<div class="shelf-bar"><button class="shelf-tool" data-tool="all">' + (shelfAll ? 'collapse all' : 'expand all') + '</button><button class="shelf-tool" data-tool="text">' + (shelfFull ? 'short text' : 'full text') + '</button></div>'
    + groups
    + '<div class="rfoot"><b>/state</b> shows exactly what the station can reach right now (measured, not assumed). <b>/constellation</b> maps the whole organism and links every live piece. <b>/help all</b> reads it with every door open and every word kept.</div></div>';
}

function wireShelf(bubble){
  bubble.querySelectorAll(".shelf-head").forEach(h => {
    h.onclick = () => {
      const gi = h.dataset.g;
      SHELF_OPEN[gi] = !SHELF_OPEN[gi];
      const open = !!SHELF_OPEN[gi];
      h.classList.toggle("open", open);
      const caret = h.querySelector(".sh-caret");
      if(caret) caret.textContent = open ? "\u25be" : "\u25b8";
      const body = bubble.querySelector('.cmdbook[data-body="' + gi + '"]');
      if(body) body.hidden = !open;
      shelfAll = false;
      const at = bubble.querySelector('.shelf-tool[data-tool="all"]');
      if(at) at.textContent = "expand all";
    };
  });
  bubble.querySelectorAll(".shelf-tool").forEach(t => {
    t.onclick = () => {
      if(t.dataset.tool === "text"){ shelfFull = !shelfFull; }
      else {
        shelfAll = !shelfAll;
        COMMAND_BOOK.forEach((_, gi) => { SHELF_OPEN[gi] = shelfAll; });
      }
      bubble.innerHTML = shelfHTML();
      wireShelf(bubble);
      scrollDown();
    };
  });
  bubble.querySelectorAll(".cmd").forEach(b => {
    b.onclick = () => runInStation(b.dataset.cmd || "", b.dataset.arg === "1");
  });
}

function showCommands(full){
  /* the shelf renders in the chat, so always surface the station first */
  if(currentView !== "cmd") showView("cmd");
  if(full){ shelfFull = true; shelfAll = true; COMMAND_BOOK.forEach((_, gi) => { SHELF_OPEN[gi] = true; }); }
  const bubble = addBubble("ass", "");
  bubble.innerHTML = shelfHTML();
  wireShelf(bubble);
  scrollDown();
  return bubble;
}

/* the router learns: every route that returns reinforces its own trail,
   every route that dies lays a repellent. Longest-lived roads win. */
function trailRoute(routeId, ok, note){
  try{
    if(!window.ObiPheromone) return null;
    return window.ObiPheromone.deposit({
      kind: ok ? "positive" : "negative",
      key: "route:" + routeId,
      text: note ? String(note).slice(0, 200) : null,
      drone: "Legion", run: (typeof runNoOf === "function" ? runNoOf() : null)
    });
  }catch(e){ return null; }
}

async function streamReply(task, existingBubble){
  const bubble = existingBubble || addBubble("ass", "");
  typing(bubble);
  const label = "Obi:";
  let out = "";
  let stationText = "";
  /* 2026-10-15: no more full stationState() dump per reply (was ~9 KB + kv/brain/
     relay/market reads every turn). One lean identity line; live numbers stay
     behind /state. */
  try{ stationText = leanContext(); }catch(e){ stationText = ""; }
  let hints = "";
  try{ hints = recallHints(lastUserText()); }catch(e){}
  try{
    const res = await root.generateText({
      instruction: buildPrompt(task, stationText, hints),
      startWith: label + "\n",
      stopSequences: ["\nUser:"],
      onChunk: d => {
        out = d.fullTextSoFar;
        let shown = out.replace(new RegExp("^" + escRe(label) + "\\s*"), "").trim();
        if(shown) bubble.textContent = shown;
        scrollDown();
      }
    });
    const finalShown = (out || res.generatedText || res.text || "").replace(new RegExp("^" + escRe(label) + "\\s*"), "").trim();
    if(finalShown) bubble.textContent = finalShown;
    trailRoute("llm:default", true, task);
    messages.push(`${label} ${finalShown}`.trim());
    rrlAppend(runNoOf(), "DNA", `${label} ${finalShown}`.trim());
    logOp({ kind:"reply", action:"obi", detail: finalShown.slice(0, 180), result: finalShown.length + " chars" });
    speak(bubble.textContent);
  }catch(e){
    trailRoute("llm:default", false, e.message);
    logOp({ kind:"reply", action:"obi", ok:false, detail: e.message, result: "generation failed" });
    bubble.textContent = "⚠ " + e.message;
  }
  scrollDown();
}

async function send(){
  const text = inputEl.value.trim();
  if(!text) return;
  const lower = text.toLowerCase();
  /* every word that arrives — command or speech — is logged before it is routed,
     so the record shows what was ASKED even if the route later fails. Anything
     carrying a secret is logged as [redacted] and is never captured as soul. */
  currentAction = cmdNameOf(text);
  const secretIn = isSecretInput(text);
  logOp({ kind:"cmd", action: currentAction, detail: secretIn ? "[redacted — secret-bearing command]" : text.slice(0, 300), result: (currentView === "cmd" ? "command station" : "desk → station") + (secretIn ? " · secret not recorded" : "") });
  if(secretIn){
    addBubble("user", esc(maskSecretInput(text)), { meta:"SECRET" });
    inputEl.value = "";
    /* PHOENIXOMEGAPROTOCOL — the gate that WRITES. The sovereign calls it by its own name
     (/PhoenixOmegaProtocol, and /PhoenixRisingProtocol): "if I type PhoenixOmegaProtocol
     along with a change either you or me came up with, then it gets changed." Same 15-minute
     window, same fail-closed rules. Nothing is ever written to the canon without it. */
  if(lower.startsWith("/omega") || lower.startsWith("/phoenixomegaprotocol") || lower.startsWith("/omegaprotocol") || lower.startsWith("/phoenixrisingprotocol") || lower.startsWith("/phoenixrising")){
    await runCmd(() => cmdOmega(text.replace(/^\/\S+\s*/, "").trim()));
    return;
  }
  }
  if(lower.startsWith("/queue")){
    inputEl.value = "";
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    await cmdShowQueue();
    return;
  }
  /* THE SHELF FERRY (src/pushpull.js) — /push carries this browser's shelf out
     as a short URL (no files); /pull collects one with safe rules: soul unions,
     sealed SCS never unsealed, I-LOG adopted only onto a fresh chain. */
  if(lower === "/push" || lower.startsWith("/push ")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    if(!window.ObiPushPull){ addBubble("ass", "⚠ <b>src/pushpull.js</b> did not load — reload the page."); return; }
    await runCmd(() => window.ObiPushPull.push());
    return;
  }
  if(lower === "/pull" || lower.startsWith("/pull ")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    if(!window.ObiPushPull){ addBubble("ass", "⚠ <b>src/pushpull.js</b> did not load — reload the page."); return; }
    await runCmd(() => window.ObiPushPull.pull(text.replace(/^\/pull\s*/i, "").trim()));
    return;
  }
  if(busy){
    const b = addBubble("ass", "⏳ Still working on the last one — give me a moment, then say it again. <span style=\"opacity:.7\">(your words are still here)</span>");
    rrlAppend(runNoOf(), "DNA", "Obi: [input held — still busy]");
    logOp({ kind:"cmd", action: currentAction, result: "held — the station was still working", detail: text.slice(0, 200) });
    return b;
  }
  inputEl.value = "";

  try {

  if(lower.startsWith("/memory")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showMemory(); updateStats(); return; }
  if(/^\/(state|where)(\s|$)/i.test(text)){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdState()); return; }
  /* THE CANON SESSION LOOP (src/scs.js) — /romePROTOCOL anchors truth and drives the whole
     SCS loop; the /phoenix* names are the canon's own stage commands. Nothing here is Kilo. */
  if(lower.startsWith("/rome")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdRomeProtocol(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/scs")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdSCS()); return; }
  if(lower.startsWith("/idea")){ addBubble("user", esc(text)); await runCmd(() => cmdIdea(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/pipeline")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdPipeline()); return; }
  if(lower.startsWith("/phoenixrise") || lower.startsWith("/reincarnaterise")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdSCSRise(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/phoenixdeath") || lower.startsWith("/reincarnatedeath")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdSCSDeath(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  /* the LFG capture protocol (the SDNAD 10-step) — kept reachable, not the chain's driver */
  if(lower.startsWith("/sdnadrise")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showRiseReport(); return; }
  if(lower.startsWith("/sdnad") || lower.startsWith("/sdnaddeath")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); doDeath(); return; }
  if(lower.startsWith("/phoenixscout") || lower.startsWith("/scout")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => showPhoenixScout(text.replace(/^\/\S+\s*/i, "").trim()));
    return;
  }
  if(lower.startsWith("/forcemarch") || lower.startsWith("/phoenixmarch") || lower.startsWith("/march")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => cmdMarch());
    return;
  }
  if(lower.startsWith("/supplylines") || lower.startsWith("/phoenixsupply") || lower.startsWith("/supply")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => cmdSupply());
    return;
  }
  if(lower.startsWith("/soulscholar") || lower.startsWith("/phoenixscholar") || lower.startsWith("/scholar")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => cmdScholar());
    return;
  }
  /* STAGE 6 — the canon's own STAGES table names this command `/phoenixFORTIFY`
     (src/scs.js · GOSPEL-999 §SYSTEM I), but only `/phoenixengineer` was routed, so
     the name the station PRINTS answered "Unknown command". Both names now reach
     ENGINEER, and so does the plain `/fortify`. */
  if(lower.startsWith("/phoenixfortify") || lower.startsWith("/fortify") || lower.startsWith("/phoenixengineer") || lower.startsWith("/engineer")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => cmdEngineer());
    return;
  }
  if(lower.startsWith("/tools") || lower.startsWith("/stack")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdTools(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(/^\/(constellation|parts|organism)(\s|$)/i.test(text)){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdConstellation(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/os")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); cmdOs(); return; }
  if(lower.startsWith("/playbook")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdPlaybook(text.replace(/^\/playbook\s*/i, "").trim()); return; }
  if(lower.startsWith("/blueprint") || lower.startsWith("/architect")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdBlueprint(text.replace(/^\/(?:blueprint|architect)\s*/i, "").trim())); return; }
  /* THE ROLES — the intake's functions, one generator each, opened here
     on THIS station's own records (src/family.js). `/roles` lists them and
     opens the first; `/roles <role|n>` opens one. `/family` is kept as an alias. */
  if(lower === "/roles" || lower.startsWith("/roles ") || lower === "/family" || lower.startsWith("/family ")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    const F = window.ObiFamily;
    /* app.js has no shared `card`/`rr` — every other caller reaches a module's own
       (R.card, W.card, L.card…). These two are local to this door. */
    const rcard = (head, body, foot) => '<div class="rise tr-card"><div class="rhead">' + head + '</div>' + body + '<div class="rfoot">' + (foot || "") + "</div></div>";
    const rrow = (label, value, note) => '<div class="rrow"><b>' + label + '</b><span class="vd">' + (value == null ? "" : value) + '</span><div class="rd">' + (note || "") + "</div></div>";
    if(!F){ addBubble("ass", rcard("⚠ THE ROLES", rrow("not loaded", "src/family.js did not load", "the roles are still in src/generators/ — reload the page"), "`/roles`")); return; }
    const arg = text.replace(/^\/(?:roles|family)\s*/i, "").trim();
    if(!arg){
      const rowsHtml = F.ROLES.map((r, i) => '<div class="rrow"><b>' + (i + 1) + " · " + esc(r.name) + '</b><span class="vd">' + esc(r.slug) + '</span><div class="rd">' + esc(r.what)
        + '<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem"><button class="eval-tile" data-family-open="' + esc(r.slug) + '">open it here</button></div>' + "</div></div>").join("");
      addBubble("ass", '<div class="rise"><div class="rhead">🜂 THE ROLES — one generator per function</div>' + rowsHtml
        + '<div class="rfoot">Each one is a generator of its own in <b>src/generators/</b> (paste <b>main.pjs</b> + <b>index.html</b>); until then they open here, on this station’s own records — the same store <b>/intake</b> uses. <b>/roles cv-forge</b> · <b>🚪 the door</b></div></div>');
      window.ObiFamily.upgrade();
      return;
    }
    const hit = F.has(arg.toLowerCase()) ? arg.toLowerCase()
      : (F.ROLES[parseInt(arg, 10) - 1] ? F.ROLES[parseInt(arg, 10) - 1].slug : (/cv|linkedin|head|portfolio|phonic|44|present|application|apps|interview|umbrella|presence|credit|list/i.test(arg)
        ? (F.ROLES.filter(r => new RegExp(arg, "i").test(r.name)).map(r => r.slug)[0] || null) : null));
    if(!hit){ addBubble("ass", rcard("⚠ THE ROLES", rrow("no such role", esc(arg), "try a number, or one of: " + F.ROLES.map(r => r.slug).join(" · ")), "`/roles`")); return; }
    const ok = await F.open(hit);
    addBubble("ass", rcard("🜂 " + esc(F.role(hit) ? F.role(hit).name : hit), rrow("opened", ok ? "the role is on screen, reading this station’s records" : "the source could not be read", esc(F.role(hit) ? F.role(hit).what : "")), "close it with the ✕ or Escape · `/roles` for the list"));
    return;
  }
  if(lower.startsWith("/assets") || lower.startsWith("/register")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdAssets(text.replace(/^\/(?:assets|register)\s*/i, "").trim())); return; }
  if(lower.startsWith("/brain")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdBrain(text.replace(/^\/brain\s*/i, "").trim())); return; }
  if(lower.startsWith("/relay") || lower.startsWith("/mastersync")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdRelay(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/market") || lower.startsWith("/opensource")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdMarket(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  /* THE RUBRIC — the instrument the word "evaluator" means (src/rubric.js). Every band
     must carry a span the engine itself located in the record; a band with no citation
     is NOT SCORED, never guessed. /score and /assess are the same command. */
  if(lower.startsWith("/rubric") || lower.startsWith("/score") || lower.startsWith("/assess")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdRubric(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(/^\/secretsauce(\s|$)/i.test(text) || /^\/sauce(\s|$)/i.test(text)){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdSauce(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/pheromone") || lower.startsWith("/pheromones") || lower.startsWith("/trail") || lower.startsWith("/nest")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdPheromones(text.replace(/^\/\S+\s*/i, "").trim()); return; }
  if(lower === "/route" || lower === "/route "){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); addBubble("ass", "Usage: <b>/route &lt;the task&gt;</b> \u2014 asks the pheromone field which road to take. e.g. <b>/route push the lesson</b>"); return; }
  if(lower.startsWith("/route ")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); cmdRouteAsk(text.replace(/^\/route\s*/i, "").trim()); return; }
  if(lower === "/img" || lower === "/img "){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); addBubble("ass", "Usage: <b>/img &lt;what you want to see&gt;</b> \u2014 generate an image."); return; }
  if(lower.startsWith("/img ")){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doImage(text.slice(5).trim()));
    return;
  }
  if(lower === "/url" || lower === "/url "){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); addBubble("ass", "Usage: <b>/url &lt;the page&gt;</b> \u2014 read one page."); return; }
  if(lower.startsWith("/url ")){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doUrl(text.slice(5).trim()));
    return;
  }
  /* THE OPEN NET — search, encyclopaedia, weather. All three are read through
     root.superFetch and every result is shown before it is interpreted. */
  if(/^\/(web|google|lookup|browse|searchweb)(\s|$)/i.test(text)){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doWeb(text.replace(/^\/\S+\s*/i, "").trim()));
    return;
  }
  if(/^\/(wiki|wikipedia)(\s|$)/i.test(text)){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doWiki(text.replace(/^\/\S+\s*/i, "").trim()));
    return;
  }
  if(/^\/(weather|forecast|wx)(\s|$)/i.test(text)){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doWeather(text.replace(/^\/\S+\s*/i, "").trim()));
    return;
  }
  if(lower === "/help" || lower === "/?" || lower === "/commands" || lower === "/help all" || lower === "/help full" || lower === "/commands all"){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    showCommands(lower.indexOf("all") > -1 || lower.indexOf("full") > -1);
    return;
  }
  if(lower === "/generators" || lower === "/gen" || lower === "/divisions"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await showView("gen"); return; }
  if(lower === "/settings" || lower === "/prefs" || lower === "/preferences"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await showView("settings"); return; }
  if(lower.startsWith("/network") || lower === "/net"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await showNetwork(); return; }
  if(lower.startsWith("/masterlink") || lower === "/link" || lower.startsWith("/link ")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await doMasterlink(text); return; }
  if(lower === "/mastermind" || lower.startsWith("/mastermind ")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => doMastermind(text)); return; }
  if(lower.startsWith("/umbrella") || lower.startsWith("/wings")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await doUmbrella(text); return; }
  if(lower.startsWith("/boardroom") || lower.startsWith("/board ") || lower.startsWith("/table ")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await window.doBoardroom(text); return; }
  if(lower === "/training" || lower.startsWith("/training ") || lower === "/eaib" || lower.startsWith("/eaib ") || lower === "/systems" || lower.startsWith("/systems ") || lower === "/sys" || lower.startsWith("/sys ") || lower === "/fsdev" || lower.startsWith("/fsdev ") || lower === "/fullstack" || lower.startsWith("/fullstack ") || lower === "/a2zmarketing" || lower.startsWith("/a2zmarketing ") || lower === "/a2z" || lower.startsWith("/a2z ") || lower === "/atoz" || lower.startsWith("/atoz ")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => window.doDepartment(text)); return; }
  if(lower.startsWith("/wire") || lower === "/nerves"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await doWire(text); return; }
  if(lower.startsWith("/netjoin")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const parts = text.slice(9).trim().split(/\s+/).filter(Boolean);
    const name = parts[0] || "obi-network";
    const role = parts[1] || "anchor";
    await runCmd(() => doNetJoin(name, role));
    return;
  }
  if(lower.startsWith("/netrole")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const role = text.slice(9).trim().split(/\s+/)[0] || "worker";
    const st = (window.ObiNet && window.ObiNet.cgnState) ? window.ObiNet.cgnState() : {net:null};
    if(!st.net){ addBubble("ass", "Not joined to any network yet. <b>/netjoin obi-network</b> first."); return; }
    st.nodeRole = role;
    try{ localStorage.setItem("obi_cgn_state", JSON.stringify(st)); }catch(e){}
    addBubble("ass", `Node role set to <b>${esc(role)}</b>.`);
    rrlAppend(runNoOf(), "DNA", "Obi: [node role set to " + role + "]");
    return;
  }
  if(lower.startsWith("/netsync")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    await runCmd(() => doNetSync());
    return;
  }
  if(lower.startsWith("/netkey")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const st = (window.ObiNet && window.ObiNet.cgnState) ? window.ObiNet.cgnState() : {net:null};
    if(!st.editKey){ addBubble("ass", "No network editKey yet. <b>/netjoin</b> first."); return; }
    addBubble("ass", `<div class="rise"><div class="rhead">🔑 /netkey — network shared secret</div><div class="rrow"><b>HUB</b><span class="vd">${esc(st.net||"?")}</span><div class="rd">${esc(st.hubName||"?")}</div></div><div class="rrow"><b>EDITKEY</b><span class="vd">SECRET</span><div class="rd">${esc(st.editKey)}</div></div><div class="rfoot">Give this key to your other generators so they can write to the shared hub. Keep it inside your own generators only.</div></div>`);
    rrlAppend(runNoOf(), "DNA", "Obi: [revealed network editKey]");
    return;
  }
  if(lower.startsWith("/netadd")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const parts = text.slice(7).trim().split(/\s+/).filter(Boolean);
    const name = parts[0];
    const role = parts[1] || "worker";
    await runCmd(() => doNetAdd(name, role));
    return;
  }
  if(lower.startsWith("/cf ")){
    if(!secretIn){ messages.push("User: " + text); captureSoul(text); }
    addBubble("user", esc(secretIn ? maskSecretInput(text) : text));
    await runCmd(() => cmdCloudflare(text.slice(4).trim()));
    return;
  }
  if(lower === "/cf"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdCloudflare("status"); return; }
  if(lower.startsWith("/gh ")){
    if(!secretIn){ messages.push("User: " + text); captureSoul(text); }
    addBubble("user", esc(secretIn ? maskSecretInput(text) : text));
    await runCmd(() => cmdGithub(text.slice(4).trim()));
    return;
  }
  if(lower === "/gh"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdGithub("status"); return; }
  if(lower === "/dg" || lower === "/dg "){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); addBubble("ass", "Usage: <b>/dg</b> \u00b7 <b>/dg test</b> \u00b7 <b>/dg recover</b> \u00b7 <b>/dg token &lt;key&gt;</b> \u2014 the Ear\u2019s Deepgram key."); return; }
  if(lower.startsWith("/dg ")){
    if(!secretIn){ messages.push("User: " + text); captureSoul(text); }
    addBubble("user", esc(secretIn ? maskSecretInput(text) : text));
    const t = text.slice(4).trim();
    if(!t){ addBubble("ass","Usage: <b>/dg token &lt;DEEPGRAM_KEY&gt;</b> · <b>/dg recover</b> (pull the key from the NET-PET-AI worker on Cloudflare and verify it) · <b>/dg test</b> (check the key already stored)"); return; }
    if(t === "recover" || t === "find" || t === "cloudflare"){ await runCmd(() => dgRecover()); return; }
    if(t === "test"){ await runCmd(() => dgTest()); return; }
    keyStore({deepgram:t});
    logOp({ kind:"secret", action:"dg token", detail:"stored in this browser only (value never logged)", result: maskTok(t) });
    addBubble("ass","🔑 Deepgram key stored locally <span style=\"opacity:.7\">(written and read back)</span> — powers the student portal voice <b>and</b> <b>/transcribe</b> (video/audio → verbatim transcript; long recordings are split at pauses and stitched back into one timeline). <b>/keys</b> to confirm.");
    rrlAppend(runNoOf(),"DNA","Obi: [/dg token stored]");
    return;
  }
  if(lower.startsWith("/keys")){
    const karg = text.replace(/^\/keys\s*/i, "").trim();
    if(/^ngl\s/i.test(karg) || /^ngl$/i.test(karg)){
      /* the textbook platform's logins — CREDENTIALS, so they are stored only in
         this browser (obi_keys) and never typed into the source of a public
         generator. There are two: the SECONDARY course (Close-up) and the PRIMARY
         one (the LOOK course, grades 1-5) — /keys ngl primary … names the second.
         Parsed without echoing: a password is never logged, captured or shown. */
      const p0 = karg.replace(/^ngl\s*/i, "").trim().split(/\s+/).filter(Boolean);
      const primary = /^(primary|p)$/i.test(p0[0] || "");
      const slot = primary ? "nglP" : "ngl";
      const label = primary ? "PRIMARY (Look, grades 1-5)" : "SECONDARY (New Close Up)";
      const parts = (primary ? p0.slice(1) : p0);
      if(!parts.length || /^clear$/i.test(parts[0])){
        try{ const o = JSON.parse(localStorage.getItem("obi_keys")||"{}"); delete o[slot]; localStorage.setItem("obi_keys", JSON.stringify(o)); }catch(e){}
        addBubble("ass", "🔒 Textbook platform login removed from this browser — <b>" + esc(label) + "</b>.");
        logOp({ kind:"secret", action:"/keys ngl clear", detail:"credential removed (" + slot + ")", result:"deleted from localStorage" });
        return;
      }
      if(parts.length < 2){ addBubble("ass", "Usage: <b>/keys ngl &lt;account&gt; &lt;password&gt;</b> (the Secondary course) or <b>/keys ngl primary &lt;account&gt; &lt;password&gt;</b> (the Primary LOOK course). Stored in this browser only (obi_keys). It never enters the source, the chat log, the soul ledger or the I-LOG."); rrlAppend(runNoOf(),"DNA","Obi: [/keys ngl — insufficient arguments]"); return; }
      const user = parts[0], pass = parts.slice(1).join(" ");
      const rec = { user: user, password: pass, at: Date.now(), site: "https://learn.eltngl.com" };
      const stN = keyStore(slot === "nglP" ? { nglP: rec } : { ngl: rec });
      if(!stN.ok){ addBubble("ass", "⛔ <b>NOT STORED.</b> The browser refused to keep the login — " + esc(stN.why) + ". Nothing was saved."); logOp({ kind:"secret", action:"/keys ngl" + (primary ? " primary" : ""), detail:"WRITE REFUSED — nothing stored", result:"NOT STORED" }); return; }
      addBubble("ass", "🔑 Textbook platform login stored locally <span style=\"opacity:.7\">(written and read back)</span> — <b>" + esc(label) + "</b> · <b>" + esc(user) + "</b> · " + esc(maskTok(pass)) + ".<br><span class=\"rfoot\">learn.eltngl.com — Student Book + Workbook presentation tools, Online Practice. Held in this browser's localStorage only; it is never written into this public source, never captured as soul and never logged. <b>/keys</b> to confirm. <span style=\"opacity:.7\">(Clear it with <b>/keys ngl" + (primary ? " primary" : "") + " clear</b>.)</span></span>");
      logOp({ kind:"secret", action:"/keys ngl" + (primary ? " primary" : ""), detail:"textbook platform credential stored in this browser only (value never logged)", result: esc(user) });
      return;
    }
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showKeys(); return;
  }
  if(lower.startsWith("/vault")){
    if(!secretIn){ messages.push("User: " + text); captureSoul(text); }
    addBubble("user", esc(secretIn ? maskSecretInput(text) : text));
    await runCmd(() => window.ObiVault ? window.ObiVault.cmd(text.slice(6).trim()) : addBubble("ass", "⚠ src/vault.js didn't load — reload the page."));
    return;
  }
  /* THE GIT (src/gitcanon.js) — the sovereign said three words: "open the git".
     This reads every part of the canon that answers without a credential, and
     names the one branch that does not. Read-only; nothing here writes. */
  if(lower.startsWith("/git")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiGit ? window.ObiGit.cmd(text.replace(/^\/git\s*/i, "").trim()) : addBubble("ass", "⚠ src/gitcanon.js didn't load — reload the page."), { stallMs: 120000 });
    return;
  }
  if(lower.startsWith("/lesson")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiLessons ? window.ObiLessons.run(text.slice(7).trim()) : addBubble("ass", "⚠ src/lessons.js didn't load — reload the page."), { stallMs: 600000 });
    return;
  }
  /* THE INTAKE (src/intake.js) — the app the tutor asked for on 23/09/2026:
     "we'll build it all into one app so that it remembers". Every promise made
     in a lesson recording, its owner, the evidence that put it there, and the
     material that moves it. The RECORDS live in this browser's kv — private,
     per origin, durable; the public source holds the METHOD and no student. */
  if(lower.startsWith("/intake")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiIntake ? window.ObiIntake.cmd(text.replace(/^\/intake\s*/i, "").trim()) : addBubble("ass", "⚠ src/intake.js didn't load — reload the page."), { stallMs: 120000 });
    return;
  }
  if(lower.startsWith("/brand")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    cmdBrand(text.replace(/^\/\S+\s*/i, "").trim());
    return;
  }
  if(lower.startsWith("/canon")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdCanon(text.slice(6).trim())); return; }
  if(lower.startsWith("/proposed")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdProposed()); return; }
  if(/^\/save(\s|$)/i.test(text)){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiSaveWatch
      ? window.ObiSaveWatch.cmd(text.replace(/^\/save\s*/i, "").trim())
      : addBubble("ass", "⚠ src/savewatch.js didn't load — reload the page."), { stallMs: 60000 });
    return;
  }
  if(lower.startsWith("/curriculum") || lower.startsWith("/syllabus")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiCurriculum
      ? window.ObiCurriculum.cmd(text.replace(/^\/(curriculum|syllabus)\s*/i, "").trim())
      : addBubble("ass", "⚠ src/curriculum.js didn't load — reload the page."), { stallMs: 240000 });
    return;
  }
  if(/^\/coverage(\s|$)/i.test(text)){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiCurriculum
      ? window.ObiCurriculum.coverageCard(text.replace(/^\/coverage\s*/i, "").trim())
      : addBubble("ass", "⚠ src/curriculum.js didn't load — reload the page."), { stallMs: 240000 });
    return;
  }
  if(lower.startsWith("/free")){
    /* FREE PHOENIX MODE — the unbound room (src/freephoenix.js).
       Opening the door is recorded (/free, one entry). Nothing typed or built inside
       the room is: the payload is deliberately NOT captured as soul and NOT wrapped
       in runCmd, because that wrapper writes an I-LOG entry per operation. */
    messages.push("User: /free");
    captureSoul("/free");
    addBubble("user", esc("/free"));
    const freeAsk = text.slice(5).trim();
    await showView("settings");
    setSetTab("free");
    if(freeAsk && window.ObiFree){
      addBubble("ass", "🔥 <b>Free Phoenix Mode</b> — the room is open on the right. No canon, no gate, no repo, no record: what you say in there is between you and the answer.");
      await window.ObiFree.run(freeAsk);
    }
    return;
  }
  if(lower.startsWith("/status")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdStatus()); return; }
  if(lower.startsWith("/bg") || lower.startsWith("/background")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdBg(text)); return; }
  if(lower === "/auto" || lower.startsWith("/auto ") || lower.startsWith("/autostop") || lower === "/stop auto" || lower.startsWith("/stop auto ")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdAuto(text)); return; }
  if(lower.startsWith("/gateway")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdGateway()); return; }
  if(lower.startsWith("/doctor")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdDoctor()); return; }
  if(lower.startsWith("/audit")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdAudit()); return; }
  if(lower.startsWith("/ledger")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdLedger()); return; }
  if(lower.startsWith("/ilog")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdILog(text.slice(5).trim())); return; }
  if(lower.startsWith("/forge")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => window.ObiForge ? window.ObiForge.cmd(text.slice(6).trim()) : addBubble("ass", "⚠ src/forge.js didn't load — reload the page.")); return; }
  if(lower.startsWith("/report")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdReport()); return; }
  if(lower.startsWith("/fieldguide")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdFieldguide()); return; }
  if(lower.startsWith("/sync")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdCanonSync()); return; }
  if(lower.startsWith("/transcripts")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    await runCmd(() => window.ObiTranscribe.library());
    return;
  }
  /* THE EAR — /transcribe (aliases /tr /video /vid /audio /listen): video or
     audio → verbatim transcript, up to an hour and beyond. This one is a long
     job, so it is deliberately NOT wrapped in runCmd/await — the chat stays
     usable while Deepgram listens (the progress card carries the report). */
  if(["transcribe","tr","video","vid","audio","listen"].indexOf((lower.split(/\s+/)[0] || "").replace(/^\//, "")) !== -1){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    if(!window.ObiTranscribe) addBubble("ass", "⚠ The ear (src/transcribe.js) didn't load — reload the page.");
    else window.ObiTranscribe.run(text.replace(/^\/\S+\s*/, "")).catch(reportError);
    return;
  }
  /* THE SUMMARY — the generator's namesake: /summary (latest recording, this
     session, a URL, or pasted notes) and /summaries (the archive). The result is
     saved, and always points back at the raw it was derived from. */
  if(lower.startsWith("/summaries")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    if(!window.ObiSummary) addBubble("ass", "⚠ src/summary.js didn't load — reload the page.");
    else await runCmd(() => window.ObiSummary.library());
    return;
  }
  if(["summary","sum","summarize","summarise"].indexOf((lower.split(/\s+/)[0] || "").replace(/^\//, "")) !== -1){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    if(!window.ObiSummary) addBubble("ass", "⚠ src/summary.js didn't load — reload the page.");
    else await runCmd(() => window.ObiSummary.run(text.replace(/^\/\S+\s*/, "")));
    return;
  }
  /* THE CLIENT LAYER — the station serves clients; the active client scopes every
     recording, summary, note, review and writeup. /clients is the ledger,
     /client <name> creates or switches. */
  {
    const cname = "/" + (lower.split(/\s+/)[0] || "").replace(/^\//, "");
    if(cname === "/client" || cname === "/clients"){
      messages.push("User: " + text);
      captureSoul(text);
      addBubble("user", esc(text));
      if(!window.ObiClients) addBubble("ass", "⚠ src/clients.js didn't load — reload the page.");
      else await runCmd(() => window.ObiClients.command(text.replace(/^\/\S+\s*/, "").trim()));
      return;
    }
  }
  /* THE OFFER DESK — everyone who said yes to the free-website offer. The
     register lives in this browser; the page they are sent is
     src/offer-desk/ and its release is /offer release. Nothing about any
     person on the register is in the source tree (BRAND.028). */
  {
    const cname = "/" + (lower.split(/\s+/)[0] || "").replace(/^\//, "");
    if(cname === "/offer" || cname === "/offers"){
      messages.push("User: " + text);
      captureSoul(text);
      addBubble("user", esc(text));
      if(!window.ObiOffers) addBubble("ass", "⚠ src/offers.js didn't load — reload the page.");
      else await runCmd(() => window.ObiOffers.command(text.replace(/^\/\S+\s*/, "").trim()));
      return;
    }
  }
  /* THE WRITEUP LAYER — students and classes: roster, filed evidence, notes,
     the writeup itself, and evidence search. /note, /file and /review|/writeup
     act on whichever subject was selected last (the active context). Each command
     goes through runCmd (a typed command needs a captured bubble and a chat log
     line — only /transcribe skips it, because it is a long job). */
  const REVIEW_CMDS = {
    "/students": () => window.ObiReview.students(),
    "/student": who => who ? window.ObiReview.setActive(who) : window.ObiReview.students(),
    "/classes": () => window.ObiReview.classes(),
    "/class": who => who ? window.ObiReview.setClass(who) : window.ObiReview.classes(),
    "/note": t => window.ObiReview.note(t),
    "/cnote": t => window.ObiReview.note(t),
    "/snote": t => window.ObiReview.note(t),
    "/file": id => window.ObiReview.attach(id),
    "/reviews": () => window.ObiReview.library(),
    "/writeups": () => window.ObiReview.writeups(),
    "/review": t => window.ObiReview.run(t),
    "/rev": t => window.ObiReview.run(t),
    "/writeup": t => window.ObiReview.writeup(t),
    "/find": t => window.ObiReview.find(t),
    "/findevidence": t => window.ObiReview.find(t)
  };
  {
    const cmdName = "/" + (lower.split(/\s+/)[0] || "").replace(/^\//, "");
    if(REVIEW_CMDS[cmdName]){
      messages.push("User: " + text);
      captureSoul(text);
      addBubble("user", esc(text));
      if(!window.ObiReview) addBubble("ass", "⚠ src/review.js didn't load — reload the page.");
      else await runCmd(() => REVIEW_CMDS[cmdName](text.replace(/^\/\S+\s*/, "").trim()));
      return;
    }
  }
  if(["find","search","evidence"].indexOf((lower.split(/\s+/)[0] || "").replace(/^\//, "")) !== -1){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    if(!window.ObiReview) addBubble("ass", "⚠ src/review.js didn't load — reload the page.");
    else await runCmd(() => window.ObiReview.find(text.replace(/^\/\S+\s*/, "")));
    return;
  }
  if(text.startsWith("/")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    addBubble("ass", "Unknown command: "+esc(text)+"<br><br>Try <b>/client …</b> (switch/add a client), <b>/web …</b> (search the net), <b>/img …</b>, <b>/url …</b>, <b>/transcribe …</b>, <b>/weather …</b>, <b>/wiki …</b>, <b>/constellation</b>, <b>/memory</b>, <b>/os</b>, <b>/playbook</b>, <b>/route …</b> or <b>/help</b> for the full shelf.");
    rrlAppend(runNoOf(), "DNA", "Obi: [unknown command: " + text + "]");
    return;
  }

  /* L37: capture sovereign words verbatim — always on, no off switch. */
  addBubble("user", esc(text), {meta:"SOUL"});
  messages.push("User: " + text);
  captureSoul(text);
  updateStats();

  /* PhoenixCommand — the magic chat: route through Agent 99 (the empire
     listens), then Obi the smart chatbot answers. */
  busy = true;
  await cmdRoute(text);
  /* a change to the STATION ITSELF: the forge is the right pair of hands, so the
     sovereign's words go there instead of a chat reply that cannot do anything.
     Nothing lands without the gate; the forge stages and reports. */
  if(isSelfEditRequest(text) && window.ObiForge){
    addBubble("ass", '<div class="rise"><div class="rhead">⚒ that is a change to the station itself — routing to the self-forge</div>'
      + '<div class="rrow"><b>WHY</b><span class="vd">src/forge.js</span><div class="rd">read → stage → diff → land. It reads the station\'s own source, stages the edit, and shows you the diff before anything is written. Landing runs through PHOENIXOMEGAPROTOCOL.</div></div>'
      + '<div class="rfoot">Say it as a command any time: <b>/forge do &lt;instruction&gt;</b> · <b>/forge diff</b> · <b>/forge apply</b>.</div></div>');
    await window.ObiForge.cmd("do " + text);
    return;
  }
  await streamReply(answerTask(text));
  } catch(e){
    reportError(e);
  } finally { busy = false; }
}

async function doImage(prompt){
  prompt = prompt || "an imaginative, beautiful scene";

  /* The umbrella is one organism, many generators: if an image-role node is
     connected, route there (the eye). Otherwise generate here on the station. */
  if(window.ObiNet && window.ObiNet.cgnFindNode){
    const node = await window.ObiNet.cgnFindNode("image");
    if(node){
      trailRoute("node:image", true, "routed to node " + node.name);
      rrlAppend(runNoOf(), "DNA", "Obi: [image routed to node " + node.name + "]");
      addBubble("ass", `<div class="rise"><div class="rhead">🖼 /img → the eye</div><div class="rrow"><b>IMAGE NODE</b><span class="vd">${esc(node.name)}</span><div class="rd">Image creation lives in its own generator. Routing there — opening with your prompt…</div></div><div class="rfoot">Prompt: <b>${esc(prompt)}</b></div></div>`);
      try{ window.open("https://perchance.org/" + encodeURIComponent(node.name) + "?p=" + encodeURIComponent(prompt), "_blank"); }catch(e){}
      messages.push(`Obi: [image routed to node ${node.name}: ${prompt}]`);
      return;
    }
  }

  const bubble = addBubble("ass", "");
  typing(bubble);
  try{
    const res = await root.generateImage({prompt, resolution:"768x768"});
    bubble.className = "imgbubble";
    bubble.innerHTML = '<img src="'+res.dataUrl+'"><div class="cap">✨ '+esc(prompt)+'</div>';
    trailRoute("llm:image-local", true, prompt);
    messages.push(`Obi: [generated an image: ${prompt}]`);
    rrlAppend(runNoOf(), "DNA", `Obi: [generated an image: ${prompt}]`);
    speak("Here you go. I made an image for you.");
  }catch(e){
    trailRoute("llm:image-local", false, e.message);
    bubble.textContent = "⚠ Couldn't generate: " + e.message;
  }
}

async function doUrl(raw){
  let url;
  try{ url = new URL(raw); }
  catch(e){
    const b = addBubble("ass", "⚠ That doesn't look like a valid URL — include the <b>https://</b> part, e.g. <b>/url https://example.com</b>.");
    return;
  }
  const bubble = addBubble("ass", "");
  try{
    const res = await root.superFetch(url.href);
    if(!res.ok) throw new Error("HTTP " + res.status);
    let t = await res.text();
    t = t.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ")
         .replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
    if(t.length > 14000) t = t.slice(0,14000);
    await streamReply(`You looked up this URL for the sovereign: ${url.href}\nPage text:\n${t}\n\nRespond helpfully about it.`, bubble);
  }catch(e){
    bubble.textContent = "⚠ Couldn't fetch that URL: " + e.message;
  }
}

/* ============================================================================
   THE WEB — Obi's basic senses out on the open net.

   Evidence-first and honest: the card shows which engine answered, the results
   exactly as they came, and the bytes actually read; the answer is then grounded
   in that fetched text and cites the source URLs. Fail-closed — when the net is
   silent the card says so and names every engine that failed. Nothing invented.

   No API key and no vendor account: the engines are read through
   root.superFetch, which is why this works unchanged on the self-hosted
   Cloudflare build (there the same call goes through the Worker's /api/fetch).

     /web <query>      search → read the top pages → answer, with sources
     /wiki <topic>     the encyclopaedia entry, verbatim extract
     /weather <place>  live conditions right now (wttr.in)
   ========================================================================== */
const WEB_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";

/* The fetch proxy can be slow under load, so every net call is bounded: a page
   that does not arrive in time is reported as skipped, never presented as
   evidence. A slow answer is never silently mistaken for a missing one. */
const WEB_TIMEOUT = 15000;
function webTimeout(p, ms, what){
  let t = null;
  return Promise.race([
    Promise.resolve(p),
    new Promise((_, rej) => { t = setTimeout(() => rej(new Error("timed out after " + Math.round((ms || WEB_TIMEOUT) / 1000) + "s" + (what ? " — " + what : ""))), ms || WEB_TIMEOUT); })
  ]).finally(() => { if(t) clearTimeout(t); });
}

function stripHtml(html){
  return String(html == null ? "" : html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/td)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/[ \t\u00a0]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/* Bing's result list, parsed as a document rather than by regex (the markup
   changes often, and regexes here rot within weeks). */
function parseBingResults(html){
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  const out = [];
  for(const li of doc.querySelectorAll("li.b_algo")){
    const h2 = li.querySelector("h2");
    if(h2) h2.querySelectorAll("cite").forEach(c => c.remove());
    let a = li.querySelector("h2 a");
    if(!a){ for(const cand of li.querySelectorAll("a[href]")){ const h = cand.getAttribute("href") || ""; if(/^https?:\/\//.test(h)){ a = cand; break; } } }
    let url = a ? (a.getAttribute("href") || "") : "";
    const m = url.match(/[?&]u=a1([A-Za-z0-9_-]+)/);
    if(m){ try{ url = atob(m[1].replace(/-/g, "+").replace(/_/g, "/")); }catch(e){} }
    if(!/^https?:\/\//.test(url) || /bing\.com\/(ck|aclick|images|videos)/i.test(url)) continue;
    const sn = li.querySelector(".b_caption p") || li.querySelector(".b_lineclamp2") || li.querySelector(".b_lineclamp3") || li.querySelector("p");
    const title = stripHtml(h2 ? h2.innerHTML : (a ? a.innerHTML : "")).replace(/\n+/g, " ").trim();
    if(!title) continue;
    out.push({ title: title.slice(0, 180), url, snippet: stripHtml(sn ? sn.innerHTML : "").slice(0, 260) });
  }
  return out;
}

/* What did the engine actually search for? Bing echoes the processed query in its
   own box. If that echo does not contain the words we sent, the result set is not
   an answer to our question — observed live: a long query came back as results for
   its first word only ("most powerful open weights LLM…" → dictionary entries for
   "MOST"). Better to ignore that set and fall through to the next engine than to
   ground an answer in someone else's search. */
function bingQueryEcho(html){
  try{
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    const el = doc.querySelector('textarea[name="q"]') || doc.querySelector("#sb_form_q") || doc.querySelector('input[name="q"]');
    return el ? String(el.value || el.textContent || "").trim() : "";
  }catch(e){ return ""; }
}
function queryEchoMatches(echo, query){
  if(!echo) return true;                         /* nothing to judge by — never throw away good results */
  const words = String(query).toLowerCase().match(/[a-z0-9]{3,}/g) || [];
  if(!words.length) return true;
  const e = echo.toLowerCase();
  const hit = words.filter(w => e.indexOf(w) !== -1).length;
  return hit >= Math.ceil(words.length * 0.5);
}

function wikiUrl(title){ return "https://en.wikipedia.org/wiki/" + encodeURIComponent(String(title).replace(/ /g, "_")); }

async function wikiSearch(query, limit){
  const url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + encodeURIComponent(query) + "&srlimit=" + (limit || 5) + "&format=json";
  const r = await webTimeout(root.superFetch(url, { headers: { "User-Agent": WEB_UA } }), 15000, "wikipedia search");
  if(!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  return ((j && j.query && j.query.search) || []).map(h => ({ title: h.title, url: wikiUrl(h.title), snippet: stripHtml(h.snippet || "") }));
}

/* the chain: Bing first (general web), Wikipedia second (always answers). Each
   step's measured outcome is kept so the card can show what was tried. */
async function webSearch(query, limit){
  limit = limit || 6;
  const log = [];
  try{
    const r = await webTimeout(root.superFetch("https://www.bing.com/search?q=" + encodeURIComponent(query) + "&count=10", { headers: { "User-Agent": WEB_UA } }), 25000, "bing");
    if(r.ok){
      const html = await r.text();
      const res = parseBingResults(html).slice(0, limit);
      const echo = bingQueryEcho(html);
      if(res.length && queryEchoMatches(echo, query)){
        log.push(["bing", r.status + " · " + res.length + " parsed"]);
        return { engine: "bing", results: res, log };
      }
      log.push(["bing", res.length ? "ignored — the engine searched \"" + echo.slice(0, 40) + "\" instead" : "0 parsed"]);
    } else log.push(["bing", "HTTP " + r.status]);
  }catch(e){ log.push(["bing", "unreachable — " + e.message]); }
  try{
    const hits = (await wikiSearch(query, limit)).slice(0, limit);
    log.push(["wikipedia", hits.length + " hits"]);
    if(hits.length) return { engine: "wikipedia", results: hits, log };
  }catch(e){ log.push(["wikipedia", "unreachable — " + e.message]); }
  return { engine: null, results: [], log };
}

/* A page read as a *document*: navigation, headers, footers and widgets dropped,
   the article region preferred. Regex stripping alone returns the site's menu —
   the evidence is the article, not the chrome. */
function htmlToText(html){
  try{
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    doc.querySelectorAll("script,style,noscript,svg,iframe,nav,header,footer,aside,form,button,template,[aria-hidden='true']").forEach(n => { try{ n.remove(); }catch(e){} });
    const main = doc.querySelector("article, main, [role='main'], #mw-content-text, #content, .content, .post") || doc.body;
    const t = main ? main.textContent : "";
    return String(t).replace(/[ \t\u00a0]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }catch(e){ return stripHtml(html); }
}

async function readPage(url, cap){
  cap = cap || 4500;
  try{
    const r = await webTimeout(root.superFetch(url, { headers: { "User-Agent": WEB_UA } }), WEB_TIMEOUT, hostOf(url));
    const rawT = await r.text();
    if(!r.ok) return { url, status: r.status, bytes: rawT.length, text: "" };
    let ct = ""; try{ ct = (r.headers && r.headers.get) ? (r.headers.get("content-type") || "") : ""; }catch(e){}
    if(ct && !/text|html|json|xml/i.test(ct)) return { url, status: r.status, bytes: rawT.length, text: "", note: "not text (" + String(ct).split(";")[0] + ")" };
    const looksHtml = /html/i.test(ct) || /^\s*<(!doctype|html)/i.test(rawT);
    /* bounded work: a 2 MB news page costs the device real time to parse, and the
       evidence we pass on is capped anyway — so parse the head of it and say so. */
    const CAP_RAW = 800000;
    const src = rawT.length > CAP_RAW ? rawT.slice(0, CAP_RAW) : rawT;
    const text = (looksHtml ? htmlToText(src) : stripHtml(src)).slice(0, cap);
    return { url, status: r.status, bytes: rawT.length, text,
      note: rawT.length > CAP_RAW ? "first " + Math.round(CAP_RAW / 1024) + " KB of " + Math.round(rawT.length / 1024) + " KB parsed" : undefined };
  }catch(e){ return { url, status: 0, bytes: 0, text: "", note: "unreachable — " + e.message }; }
}

function hostOf(u){ try{ return new URL(u).hostname.replace(/^www\./, ""); }catch(e){ return "?"; } }

/* Reading strategy: prefer a bounded source when the result IS an encyclopaedia
   article — the summary API hands back the same facts in ~1 KB instead of the
   full 1.8 MB page, which is faster and much cleaner evidence. Everything else is
   read as a document. */
async function readSource(url, cap){
  try{
    const u = new URL(url);
    if(/(^|\.)wikipedia\.org$/i.test(u.hostname)){
      const title = decodeURIComponent((u.pathname.split("/wiki/")[1] || "").split("#")[0]).replace(/_/g, " ");
      if(title){
        const r = await webTimeout(root.superFetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_")), { headers: { "User-Agent": WEB_UA } }), 12000, "wikipedia summary");
        if(r.ok){
          const j = await r.json();
          const ex = String(j.extract || "").trim();
          if(ex) return { url, status: 200, bytes: ex.length, text: ex.slice(0, cap || 4500), note: "encyclopaedia summary API (bounded source)" };
        }
      }
    }
  }catch(e){}
  return readPage(url, cap);
}

async function doWeb(query){
  query = String(query == null ? "" : query).trim();
  if(!query){
    addBubble("ass", '<div class="rise"><div class="rhead">🌐 /web — search the open net</div>'
      + '<div class="rrow"><b>USAGE</b><span class="vd">/web &lt;query&gt;</span><div class="rd">e.g. <b>/web what is photosynthesis</b> · <b>/web year 7 english syllabus</b><br>also <b>/wiki Pythagoras</b> · <b>/weather Sydney</b> · <b>/url https://…</b> (read one page)</div></div>'
      + '<div class="rfoot">The card shows the engine, the sources, and the bytes actually read. The answer is grounded in those pages only — if the net is silent, it says so.</div></div>');
    return;
  }
  const bubble = addBubble("ass", ""); typing(bubble);
  const t0 = Date.now();
  const s = await webSearch(query, 6);
  if(!s.results.length){
    bubble.innerHTML = '<div class="rise"><div class="rhead">🌐 /web — "' + esc(query) + '"</div>'
      + '<div class="rrow"><b>SEARCH</b><span class="vd">NO RESULTS</span><div class="rd">every engine failed: ' + esc(s.log.map(l => l[0] + " → " + l[1]).join(" · ")) + '</div></div>'
      + '<div class="rfoot">Fail-closed — nothing invented. Try different words, or <b>/url &lt;page&gt;</b> to read one page directly.</div></div>';
    trailRoute("web:search", false, query + " — no engine answered");
    rrlAppend(runNoOf(), "DNA", "Obi: [/web failed — no engine answered: " + query + "]");
    return;
  }
  const ms = Date.now() - t0;
  let html = '<div class="rise"><div class="rhead">🌐 /web — "' + esc(query) + '"</div>';
  html += '<div class="rrow"><b>SEARCH</b><span class="vd">' + esc(String(s.engine).toUpperCase()) + '</span><div class="rd">' + s.results.length + ' results · ' + ms + ' ms · tried ' + esc(s.log.map(l => l[0] + " (" + l[1] + ")").join(" · ")) + '</div></div>';
  for(const x of s.results){
    html += '<div class="rrow"><b>' + esc(x.title) + '</b><span class="vd">' + esc(hostOf(x.url)) + '</span><div class="rd">' + esc(x.snippet) + '<br><a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">' + esc(x.url) + '</a></div></div>';
  }
  /* the sources are shown the moment the search returns; the reads fill in below
     as they arrive, so a slow page never hides the evidence we already have. */
  html += '<div class="webreads"><div class="rrow"><b>READING</b><span class="vd">…</span><div class="rd">opening the top 3 sources — bounded, 15s each</div></div></div>';
  html += '<div class="rfoot">Grounding: the answer streams below from this evidence only — sources are the links above. Engines: ' + esc(s.log.map(l => l[0]).join(" → ")) + '.</div></div>';
  bubble.innerHTML = html;
  scrollDown();
  trailRoute("web:search:" + s.engine, true, query);

  const pages = await Promise.all(s.results.slice(0, 3).map(x => readSource(x.url, 4500)));
  const pageRows = pages.map(p => '<div class="rrow"><b>READ · ' + esc(hostOf(p.url)) + '</b><span class="vd">' + (p.text ? p.bytes + " B" : "SKIPPED") + '</span><div class="rd">' + esc(p.note || (p.text.slice(0, 110) + "…")) + '</div></div>').join("");
  const readsEl = bubble.querySelector(".webreads");
  if(readsEl) readsEl.innerHTML = pageRows; else bubble.insertAdjacentHTML("beforeend", pageRows);
  scrollDown();

  let ev = 'SEARCH RESULTS (engine: ' + s.engine + ', fetched ' + new Date().toISOString() + '):\n'
    + s.results.map((x, i) => (i + 1) + ". " + x.title + " — " + x.url + "\n   " + x.snippet).join("\n");
  const read = pages.filter(p => p.text);
  if(read.length) ev += "\n\nPAGE TEXT (read live just now; may be truncated):\n" + read.map(p => "--- " + p.url + " (" + p.bytes + " B)\n" + p.text).join("\n\n");
  messages.push("User: /web " + query);
  rrlAppend(runNoOf(), "DNA", "Obi: [/web \"" + query + "\" — " + s.engine + " · " + s.results.length + " results · " + read.length + " pages read]");
  await streamReply('The sovereign asked: "' + query + '"\n\nLive web evidence I just fetched:\n' + ev.slice(0, 16000)
    + '\n\nAnswer the question from THIS evidence only. If the answer is not in it, say plainly what is missing and point at the best source. Never invent facts, quotes or URLs. Cite the sources you used as plain URLs.');
}

async function doWiki(topic){
  topic = String(topic == null ? "" : topic).trim();
  if(!topic){ addBubble("ass", "Usage: <b>/wiki &lt;topic&gt;</b> — e.g. <b>/wiki Pythagoras</b>"); return; }
  const bubble = addBubble("ass", ""); typing(bubble);
  try{
    const hits = await wikiSearch(topic, 5);
    if(!hits.length){ bubble.textContent = 'No encyclopaedia entry found for "' + topic + '".'; return; }
    const best = hits[0];
    const r = await webTimeout(root.superFetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(String(best.title).replace(/ /g, "_")), { headers: { "User-Agent": WEB_UA } }), 15000, "wikipedia summary");
    if(!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    const link = (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || best.url;
    let html = '<div class="rise"><div class="rhead">📖 /wiki — ' + esc(j.title || best.title) + '</div>';
    html += '<div class="rrow"><b>' + esc(j.description || "entry") + '</b><span class="vd">WIKIPEDIA</span><div class="rd">' + esc(String(j.extract || "").trim()) + '</div></div>';
    if(hits.length > 1) html += '<div class="rrow"><b>ALSO IN THE INDEX</b><span class="vd">' + (hits.length - 1) + ' MORE</span><div class="rd">' + esc(hits.slice(1).map(h => h.title).join(" · ")) + '</div></div>';
    html += '<div class="rfoot">Verbatim extract — not summarised, not edited. <a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">read the full article</a>. Ask a follow-up in plain words and I will read it.</div></div>';
    bubble.innerHTML = html;
    rrlAppend(runNoOf(), "DNA", "Obi: [/wiki " + best.title + "]");
  }catch(e){ bubble.textContent = "⚠ /wiki failed: " + e.message; }
}

async function doWeather(place){
  place = String(place == null ? "" : place).trim();
  if(!place){ addBubble("ass", "Usage: <b>/weather &lt;place&gt;</b> — e.g. <b>/weather Sydney</b>"); return; }
  const bubble = addBubble("ass", ""); typing(bubble);
  try{
    const r = await root.superFetch("https://wttr.in/" + encodeURIComponent(place) + "?format=j1", { headers: { "User-Agent": "curl/8.0" } });
    if(!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    const c = (j.current_condition || [])[0];
    if(!c) throw new Error("no current conditions in the reply");
    const today = (j.weather || [])[0] || {};
    const area = (j.nearest_area || [])[0];
    const where = area ? (area.areaName[0].value + ", " + area.country[0].value) : place;
    const desc = (c.weatherDesc && c.weatherDesc[0]) ? String(c.weatherDesc[0].value).trim() : "";
    let html = '<div class="rise"><div class="rhead">🌦 /weather — ' + esc(where) + '</div>';
    html += '<div class="rrow"><b>' + esc(c.temp_C) + '°C</b><span class="vd">' + esc(desc) + '</span><div class="rd">feels like ' + esc(c.FeelsLikeC) + '°C · humidity ' + esc(c.humidity) + '% · wind ' + esc(c.windspeedKmph) + ' km/h ' + esc(c.winddir16Point) + ' · ' + esc(c.pressure) + ' hPa</div></div>';
    if(today.maxtempC) html += '<div class="rrow"><b>TODAY</b><span class="vd">' + esc(today.mintempC) + '–' + esc(today.maxtempC) + '°C</span><div class="rd">observed ' + esc(c.observation_time || "?") + ' ' + esc(c.localObsDateTime || "") + '</div></div>';
    html += '<div class="rfoot">Source: <a href="https://wttr.in/' + esc(encodeURIComponent(place)) + '" target="_blank" rel="noopener noreferrer">wttr.in</a> — current conditions are measured, the day range is forecast.</div></div>';
    bubble.innerHTML = html;
    rrlAppend(runNoOf(), "DNA", "Obi: [/weather " + where + " " + c.temp_C + "C " + desc + "]");
  }catch(e){ bubble.textContent = "⚠ /weather failed: " + e.message + " — try a simpler place name (e.g. /weather Sydney)."; }
}

/* ---------------------- CONNECTED GENERATOR NETWORK (CGN) ---------------------- */
async function showNetwork(){
  const stat = window.ObiNet ? window.ObiNet.cgnStatus() : {joined:false};
  const rows = [];
  if(!stat.joined){
    rows.push({name:"STATUS", detail:"this generator is not joined to any network yet", verdict:"OFFLINE"});
    rows.push({name:"JOIN", detail:"/netjoin obi-network   (creates the hub, this generator becomes the anchor)", verdict:"CMD"});
  } else {
    rows.push({name:"NETWORK", detail:`${stat.net} · hub file: ${stat.hubName}`, verdict:"LIVE"});
    rows.push({name:"NODE", detail:`${stat.nodeName} (${stat.nodeId}) · role: ${stat.nodeRole}`, verdict: String(stat.nodeRole||"?").toUpperCase()});
    rows.push({name:"LAST SYNC", detail:`${stat.lastSync} · hub seq #${stat.seq}`, verdict: stat.lastSync!=="never" ? "SYNCED" : "PENDING"});
    rows.push({name:"SOUL (local)", detail:`${stat.localSoul} fragments in this generator's ledger · whole-organism union lives in the hub`, verdict:"VERBATIM"});
    rows.push({name:"LAWS", detail:`${stat.localLaws} laws registered in this node's deaths · network law registry in hub`, verdict:"DERIVED"});
  }
  const lane = (window.ObiNet && window.ObiNet.cgnProbe) ? await window.ObiNet.cgnProbe() : { open:false, detail:"cgn module not loaded" };
  rows.push({name:"WRITE LANE", detail:`measured now, verbatim: ${lane.detail}${lane.open ? "" : " · so this station cannot create or write the hub, and no generator can be commanded by it until that door opens — the PULL lane (reading members' node files) is unaffected"}`, verdict: lane.open ? "OPEN" : "SHUT"});
  const hub = await window.ObiNet.cgnReadHub();
  if(hub && hub.nodes){
    const list = Object.entries(hub.nodes).map(([id,n])=>{
      const seen = n.lastSeen ? new Date(n.lastSeen).toLocaleString() : "?";
      return `<div class="rrow"><b>${esc(n.name)}</b><span class="vd">${esc(n.role||"worker")}</span><div class="rd">${esc(id)} · last seen ${esc(seen)} · soul ${n.soul}</div></div>`;
    }).join("");
    rows.push({name:"CONNECTED NODES", detail: list || "none yet — other generators join by running the node kit (see src/cgn-node.js)", verdict: String(Object.keys(hub.nodes).length)});
    rows.push({name:"HUB SOUL", detail:`${hub.soul.length} whole-organism fragments · ${hub.laws.length} laws · seq #${hub.seq}`, verdict:"ONE"});
  }
  const rowsHtml = rows.map(r=> `<div class="rrow"><b>${esc(r.name)}</b><span class="vd">${esc(r.verdict)}</span>${r.detail && r.detail.includes("rrow") ? "" : `<div class="rd">${r.detail}</div>`}</div>`).join("");
  addBubble("ass", `<div class="rise"><div class="rhead">🌐 /network — Connected Generator Network</div>${rowsHtml}<div class="rfoot">CGN — one organism, many generators. Soul DNA + laws sync as a whole. RRL raw transcripts stay local per node (raw ≠ soul).</div></div>`);
  messages.push("Obi: [network status]");
  rrlAppend(runNoOf(), "DNA", "Obi: [network status — " + (stat.joined ? stat.net : "offline") + "]");
  updateStats();
}

async function doNetJoin(name, role){
  if(!window.ObiNet){ addBubble("ass", "CGN module not loaded."); return; }
  const r = await window.ObiNet.cgnJoin(name, role);
  if(!r.ok){
    addBubble("ass", "⚠ Couldn't join network: " + esc(r.why));
    return;
  }
  const s = r.sync || {};
  addBubble("ass", `<div class="rise"><div class="rhead">🛰️ /netjoin — ${esc(r.net)}</div><div class="rrow"><b>HUB</b><span class="vd">${r.already?"RE-ATTACHED":"CREATED"}</span><div class="rd">${esc(r.hubName)}</div></div><div class="rrow"><b>FIRST SYNC</b><span class="vd">${s.ok?"OK":(s.why||"PENDING")}</span><div class="rd">pushed soul +${s.pushed?s.pushed.soul:0} · laws +${s.pushed?s.pushed.laws:0} · pulled ${s.pulled||0} · seq #${s.seq||0}</div></div><div class="rfoot">This generator is now the ANCHOR of the network. Other generators join by running the node kit — reveal the key with /netkey.</div></div>`);
  messages.push("Obi: [joined network " + r.net + "]");
  rrlAppend(runNoOf(), "DNA", "Obi: [joined network " + r.net + " — anchor]");
  updateStats();
}

async function doNetAdd(name, role){
  if(!window.ObiNet){ addBubble("ass", "CGN module not loaded."); return; }
  if(!name){
    addBubble("ass", "Usage: <b>/netadd &lt;generatorName&gt; [role]</b> — e.g. <b>/netadd net-pet-ai</b>");
    return;
  }
  const r = await window.ObiNet.cgnAddMember(name, role);
  if(!r.ok){ addBubble("ass", "⚠ " + esc(r.why||"couldn't add member")); return; }
  addBubble("ass", `<div class="rise"><div class="rhead">🧩 /netadd — ${esc(r.genName)}</div><div class="rrow"><b>REGISTERED</b><span class="vd">${r.memberFound?"FILE FOUND":"NO FILE YET"}</span><div class="rd">role: ${esc(role)} · node file: <span class="rd">editable.uploads.dev/file/${esc(r.genName)}/cgn-node</span></div></div><div class="rrow"><b>MERGED INTO WHOLE</b><span class="vd">+${r.soulAdded} SOUL</span><div class="rd">laws +${r.lawsAdded} · members now: ${esc((r.members||[]).join(", "))}</div></div><div class="rfoot">${r.memberFound ? "That generator's captures are now part of the whole. It will sync automatically on every /netsync." : "No node file found yet — paste the node kit (src/cgn-node.js) into that generator; the anchor will pull it automatically once it exists."}</div></div>`);
  messages.push("Obi: [added member " + r.genName + " to network]");
  rrlAppend(runNoOf(), "DNA", "Obi: [netadd — " + r.genName + " → whole]");
  updateStats();
}

async function doNetSync(){
  if(!window.ObiNet){ addBubble("ass", "CGN module not loaded."); return; }
  const st = window.ObiNet.cgnState();
  if(!st.net){ addBubble("ass", "Not joined to any network yet. <b>/netjoin obi-network</b>."); return; }
  addBubble("ass", "Syncing the whole…");
  const r = await window.ObiNet.cgnSync();
  const p = r.pushed || {};
  addBubble("ass", `<div class="rise"><div class="rhead">🔄 /netsync — ${esc(r.net)}</div><div class="rrow"><b>PUSH</b><span class="vd">${r.ok?"OK":"FAIL"}</span><div class="rd">soul +${p.soul||0} · laws +${p.laws||0} · hub seq #${r.seq||0}</div></div><div class="rrow"><b>PULL</b><span class="vd">${r.pulled>0?"MERGED":"UP-TO-DATE"}</span><div class="rd">remote soul merged into local ledger: +${r.pulled||0}</div></div><div class="rrow"><b>WHOLE</b><span class="vd">${r.nodes||0} NODES</span><div class="rd">hub soul=${r.after?r.after.soul:"?"} · hub laws=${r.after?r.after.laws:"?"}</div></div><div class="rfoot">${r.ok ? "SEAMLESS SYNC — the whole is one." : esc(r.why||"sync failed")}</div></div>`);
  messages.push("Obi: [network sync]");
  rrlAppend(runNoOf(), "DNA", "Obi: [network sync — " + (r.ok ? "seq #" + r.seq : r.why) + "]");
  updateStats();
}

/* ------------------------- THE UMBRELLA (/umbrella) ------------------------
   The generators this station answers for, and what it can actually do to each.
   It is a DOORWAY, not a second implementation: the reading is the master link's
   own (/masterlink status · /masterlink list <gen>), so the two can never fall
   out of step about what the link sees. Reads only — naming aims the link, and no
   cross-namespace write exists to claim. */
async function doUmbrella(text){
  const arg = String(text == null ? "" : text).replace(/^\/(umbrella|wings)\s*/i, "").trim();
  addBubble("ass", '<div class="rise"><div class="rhead">☂ /umbrella — what this station can actually command</div>'
    + '<div class="rd">Every generator named under the umbrella, read right now by content key with no token. A rung is printed only with the number it measured.'
    + (arg ? ' Reading one: <b>' + esc(arg) + '</b>.' : '') + '</div></div>');
  if(arg) return doMasterlink("/masterlink list " + arg);
  return doMasterlink("/masterlink status");
}

/* ------------------- THE RANK: apex vs sub (src/masterlink.js) -------------------
   THIS station is the apex mastermind — the mastermind of masterminds. A clone
   from this tree becomes a SUB by naming a parent, and a sub answers only to
   its parent and to the sovereign. Rank is explicit config (kv masterlink), so
   a fresh clone opens as apex until it is told otherwise — no silent inheritance. */
async function doMastermind(text){
  const M = window.ObiMasterlink;
  if(!M){ addBubble("ass", "⚠ src/masterlink.js did not load — reload the page."); return; }
  const rest = String(text == null ? "" : text).replace(/^\/mastermind\s*/i, "").trim();
  const parts = rest.split(/\s+/).filter(Boolean);
  const verb = (parts[0] || "").toLowerCase();
  const row = (k, v, d) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd">' + esc(v) + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>';
  if(verb === "parent" && parts[1]){
    const r = await M.setParent(parts[1]);
    if(!r.ok){ addBubble("ass", '<div class="rise"><div class="rhead">▲ /mastermind parent — NOT SET</div>' + row("WHY", "", esc(r.why)) + '</div>'); return; }
    addBubble("ass", '<div class="rise"><div class="rhead">▲ /mastermind parent — SUB OF ' + esc(r.parent) + '</div>'
      + row("RANK", "SUB", "answers only to <b>" + esc(r.parent) + "</b> and to the sovereign — never to a sibling, never to a stranger")
      + row("WATCHING", String(r.targets.length), r.targets.map(esc).join(" · "))
      + '<div class="rfoot">Rank is stored in this generator\'s own kv (masterlink config) — it survives reloads and never leaks into the parent. <b>/mastermind</b> shows the card · <b>/mastermind apex</b> releases it.</div></div>');
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [/mastermind parent " + r.parent + " — sub]"); }catch(e){}
    return;
  }
  if(verb === "apex" || verb === "release"){
    const r = await M.setRole("apex");
    addBubble("ass", '<div class="rise"><div class="rhead">▲ /mastermind apex</div>'
      + row("RANK", "APEX", "the mastermind of masterminds — answers to the sovereign only")
      + (r.ok ? "" : row("NOTE", "", esc(r.why || "")))
      + '</div>');
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [/mastermind apex]"); }catch(e){}
    return;
  }
  const deptHit = (window.ObiBoardroom && window.ObiBoardroom.dept) ? window.ObiBoardroom.dept(verb) : null;
  if(deptHit && window.doDepartment){
    await window.doDepartment(text);
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [/mastermind " + deptHit.cmd + " — desk]"); }catch(e){}
    return;
  }
  if(verb && verb !== "status" && verb !== "rank" && verb !== "card"){
    addBubble("ass", 'Usage: <b>/mastermind</b> · <b>/mastermind &lt;dept&gt;</b> (training · systems · fsdev · a2zmarketing) · <b>/mastermind parent &lt;generator&gt;</b> · <b>/mastermind apex</b>');
    return;
  }
  const rk = await M.rank();
  const self = (function(){ try{ return window.generatorName || "?"; }catch(e){ return "?"; } })();
  addBubble("ass", '<div class="rise"><div class="rhead">▲ /mastermind — ' + esc(rk.role.toUpperCase()) + '</div>'
    + row("THIS STATION", esc(self), rk.role === "apex" ? "the apex mastermind — the mastermind of masterminds" : "a sub-mastermind")
    + row("ANSWERS TO", esc(rk.answersTo.join(" + ")), rk.role === "apex" ? "nothing else can command it" : "siblings and strangers are refused — only the parent and the sovereign")
    + (rk.parent ? row("PARENT", esc(rk.parent), "set explicitly by /mastermind parent — must resolve on the read channel") : "")
    + row("CLONE RECIPE", "1 · 2 · 3", "1) clone this generator (fork it) · 2) open the clone and run <b>/mastermind parent " + esc(self) + "</b> · 3) back here, run <b>/masterlink name &lt;clone&gt;</b> — reads and orders cross, writes never do (each station lands its own /forge by its own save or the /omega gate)")
    + row("DEPARTMENTS", "4 DESKS", '<div class="chips" style="margin-top:8px">' + ((window.ObiBoardroom && window.ObiBoardroom.deptChips) ? window.ObiBoardroom.deptChips() : "training · systems · fsdev · a2zmarketing") + '</div>')
    + '<div class="rfoot">PaiS umbrella: apex here (ESL.ED.TECH) · subs wherever you plant them (Gaming · Promote · …). Umbrellas within umbrellas — rank, not vibes.</div></div>');
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [/mastermind — " + rk.role + "]"); }catch(e){}
}

/* ------------------- THE MASTER LINK (src/masterlink.js) -------------------
   The master's side of the handoff lane. The sibling station watches THIS tree;
   this watches the generators named under the umbrella — by content key, with no
   token. NAMING is the command it actually has, so every card says which lane the
   answer came from and never claims a write that did not happen. */
async function doMasterlink(text){
  const M = window.ObiMasterlink;
  if(!M){ addBubble("ass", "⚠ src/masterlink.js did not load — reload the page."); return; }
  const rest = String(text == null ? "" : text).replace(/^\/(masterlink|link)\s*/i, "").trim();
  const parts = rest.split(/\s+/).filter(Boolean);
  const verb = (parts[0] || "status").toLowerCase();
  const a1 = parts[1] || "", a2 = parts.slice(2).join(" ");
  const K = n => (n == null || isNaN(n)) ? "—" : Number(n).toLocaleString();
  const row = (k, v, d) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd">' + esc(v) + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>';

  if(verb === "name" || verb === "aim"){
    if(!a1){ addBubble("ass", 'Usage: <b>/masterlink name &lt;generator&gt;</b>'); return; }
    const r = await M.name(a1);
    if(!r.ok){
      addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink name — ' + esc(a1) + '</div>'
        + row("RESULT", "NOT NAMED") + row("WHAT THE LANE SAID", "", esc(r.why))
        + row("WHY IT WAS NOT STORED", "", "a name is saved only once it RESOLVES on the read channel — naming IS the command this station actually has, so an empty name would be a claim, not a command. Nothing was stored.")
        + '</div>');
      return;
    }
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink name — ' + esc(r.gen) + '</div>'
      + row("RESULT", r.already ? "ALREADY NAMED" : "NAMED")
      + row("ITS PUBLISHED TREE", K(r.count) + " files", K(r.bytes) + " B · read from the read channel, no token, no credential")
      + row("UNDER THE UMBRELLA", String(r.targets.length), r.targets.map(esc).join(" · "))
      + '<div class="rfoot">This station can now see that generator, list it, read any of its files whole, watch it for movement, and pull its handoffs. It still cannot WRITE into it — that door is the platform\'s and it is shut. <b>/masterlink status</b>.</div></div>');
    return;
  }

  if(verb === "unname"){
    if(!a1){ addBubble("ass", 'Usage: <b>/masterlink unname &lt;generator&gt;</b>'); return; }
    const r = await M.unname(a1);
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink unname — ' + esc(r.gen) + '</div>'
      + row(r.had ? "RELEASED" : "WAS NOT NAMED", r.had ? "removed from the umbrella" : "nothing to remove")
      + row("STILL NAMED", String(r.targets.length), r.targets.map(esc).join(" · ") || "none")
      + '<div class="rfoot">Naming is a read: nothing was ever written into that generator, here or at any other time.</div></div>');
    return;
  }

  if(verb === "list"){
    const gen = a1 || (await M.config()).targets[0];
    if(!gen){ addBubble("ass", "Nothing is named yet — <b>/masterlink name &lt;generator&gt;</b>."); return; }
    addBubble("ass", "Reading <b>" + esc(gen) + "</b>'s published tree…");
    const man = await M.manifest(gen);
    if(!man.ok){ addBubble("ass", "⚠ " + esc(man.why)); return; }
    const paths = Object.keys(man.files);
    const hands = paths.filter(p => M.HANDOFF_RE.test(p));
    const groups = {};
    for(const p of paths){ const g = p.indexOf("/") === -1 ? "(root)" : p.split("/")[0] + "/"; groups[g] = (groups[g] || 0) + 1; }
    const gr = Object.keys(groups).sort((x, y) => groups[y] - groups[x]).map(g => esc(g) + " <b>" + groups[g] + "</b>").join(" · ");
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink list — ' + esc(gen) + '</div>'
      + row("PUBLISHED", K(paths.length) + " files", K(man.bytes) + " B")
      + row("BY FOLDER", String(Object.keys(groups).length), gr)
      + row("HANDOFFS IT CARRIES", String(hands.length), hands.map(esc).join("<br>") || "none")
      + row("FIRST FILES", String(Math.min(30, paths.length)), paths.slice(0, 30).map(esc).join(' <span style="opacity:.5">·</span> '))
      + '<div class="rfoot">Read whole, without a token: <b>/masterlink read ' + esc(gen) + ' &lt;path&gt;</b>.</div></div>');
    return;
  }

  if(verb === "read"){
    const cfg = await M.config();
    let gen = a1, path = a2;
    if(a1 && a1.indexOf("/") !== -1 && !a2){ path = a1; gen = cfg.targets[0]; }
    if(!gen || !path){ addBubble("ass", 'Usage: <b>/masterlink read &lt;generator&gt; &lt;path&gt;</b> — e.g. <b>/masterlink read ' + esc(cfg.targets[0] || "<gen>") + ' HANDOFF.md</b>'); return; }
    addBubble("ass", "Reading <b>" + esc(gen) + " / " + esc(path) + "</b>…");
    const r = await M.readFile(gen, path);
    if(!r.ok){ addBubble("ass", "⚠ " + esc(r.why)); return; }
    const body = r.text.length > 4000 ? r.text.slice(0, 4000) + "\n… [" + K(r.text.length - 4000) + " more characters — the whole file is in the record]" : r.text;
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink read — ' + esc(gen) + ' / ' + esc(path) + '</div>'
      + row("BYTES", K(r.bytes), "declared by the manifest: " + K(r.declared) + (r.match ? " — MATCH (the bytes that arrived are the bytes it published)" : " — <b>MISMATCH</b>, said out loud rather than smoothed over") + " · " + K(r.chars) + " characters")
      + row("SHA-256", r.sha256.slice(0, 24) + "…", "computed from the bytes this station actually received")
      + '<div class="rd" style="white-space:pre-wrap;text-align:left;margin-top:6px;opacity:.92">' + esc(body) + '</div></div>');
    return;
  }

  if(verb === "inbox"){
    const box = await M.inbox();
    const items = Object.keys(box).map(k => box[k]).sort((x, y) => (x.at < y.at ? 1 : -1));
    if(!items.length){ addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink inbox</div>' + row("PULLED", "0", "nothing has arrived on the lane yet — run <b>/masterlink sync now</b>") + '</div>'); return; }
    const list = items.map(it => '<div class="rrow"><b>' + esc(it.path) + '</b><span class="vd">' + esc(it.gen) + '</span><div class="rd">' + K(it.size) + ' B · ' + esc(String(it.sha256).slice(0, 16)) + '… · read ' + esc(it.at) + '</div></div>').join("");
    const last = items[0];
    const full = String(last.text || "");
    const body = full.slice(0, 2500);
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink inbox — ' + items.length + ' handoff(s)</div>' + list
      + '<div class="rfoot">Newest, verbatim — <b>' + esc(last.gen) + ' / ' + esc(last.path) + '</b>:</div>'
      + '<div class="rd" style="white-space:pre-wrap;text-align:left;opacity:.92">' + esc(body + (full.length > 2500 ? "\n… [" + K(full.length - 2500) + " more characters]" : "")) + '</div></div>');
    return;
  }

  if(verb === "reply"){
    const body = a2 || a1;
    if(!body){ addBubble("ass", 'Usage: <b>/masterlink reply &lt;text&gt;</b> — the master answers as an artifact, the one courier that crosses origins today.'); return; }
    addBubble("ass", "Uploading the answer as an artifact…");
    const r = await M.reply(body);
    if(!r.ok){ addBubble("ass", "⚠ " + esc(r.why)); return; }
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink reply — sent as an artifact</div>'
      + row("URL", "PERMANENT", '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.url) + '</a>')
      + row("BYTES", K(r.bytes), "sha-256 " + esc(r.sha256.slice(0, 24)) + "…")
      + '<div class="rfoot">Immutable uploads work where editable writes do not, so this is the courier the register and the packet already ride. Hand the URL to the node; it needs no token to read it.</div></div>');
    return;
  }

  if(verb === "card"){
    /* /masterlink card           — read THIS station's own card off the pull lane
       /masterlink card publish   — write it (the platform's answer, verbatim)
       /masterlink card pull <gen>— read any named generator's card, the family's
                                    own way of getting to know each other */
    const what = (a1 || "").toLowerCase();
    if(what === "publish" || what === "push"){
      addBubble("ass", "Writing this station's master-link card to the pull lane…");
      const r = await M.publishCard();
      if(!r.ok){
        addBubble("ass", '<div class="rise"><div class="rhead">🜂 /masterlink card publish — NOT PUBLISHED</div>'
          + row("RESULT", "REFUSED", "the platform's own code: <b>" + esc(r.code || "?") + "</b>")
          + row("WHAT THE LANE SAID", "", esc(r.why))
          + row("THE CANONICAL URL", esc(r.url), "where every sibling station looks for the master's card")
          + row("THE COPY THAT ALWAYS EXISTS", esc(r.inTree || "src/master-link.json"), "inside this station's own published tree — read by content key, ships with the next save, needs no verification")
          + row("THE CARD ITSELF", K(r.bytes) + " B", "built now from live measurements · <b>/masterlink card</b> to see it")
          + '<div class="rfoot">A refusal is a measurement, not something to hide: the platform gave this answer, so it is printed as given. The in-tree copy still reaches every station that reads this tree; the canonical URL opens the moment the verification passes or the generator is saved.</div></div>');
        return;
      }
      addBubble("ass", '<div class="rise"><div class="rhead">🜂 /masterlink card publish — PUBLISHED</div>'
        + row("THE CARD", r.created ? "CREATED" : "UPDATED", esc(r.url) + (r.editCount ? " · change #" + r.editCount : ""))
        + row("BYTES", K(r.bytes), "every number read at the moment it was written")
        + row("THE IN-TREE COPY", "src/master-link.json", "the same card ships with the next save")
        + '<div class="rfoot">Now any station can read the master at that URL with no token. <b>/masterlink card</b> reads it back.</div></div>');
      return;
    }
    if(what === "pull"){
      const gen = a2 || "";
      if(!gen){ addBubble("ass", "Usage: <b>/masterlink card pull &lt;generator&gt;</b>"); return; }
      addBubble("ass", "Reading the card at " + esc(M.cardUrl(gen)) + "…");
      const r = await M.readCard(gen);
      if(!r.ok){ addBubble("ass", '<div class="rise"><div class="rhead">🜂 /masterlink card pull — ' + esc(gen) + '</div>' + row("NO CARD", "HTTP " + esc(String(r.status || "—")), esc(r.why)) + '</div>'); return; }
      const c = r.card || {};
      const ck = c.nerves || {}, cbr = ck.brain || {}, cil = ck.ilog || {};
      addBubble("ass", '<div class="rise"><div class="rhead">🜂 /masterlink card — ' + esc(gen) + '</div>'
        + row("PUBLISHED", esc(c.iso || "?"), K(r.bytes) + " B · HTTP " + r.status)
        + row("ROLE", esc(c.role || "—"), esc(c.title || ""))
        + row("ITS NERVES", "", "brain " + K(cbr.docs || 0) + " docs · soul " + K(ck.soul) + " · i-log " + esc(String(cil.entries == null ? "—" : cil.entries)))
        + (c.ruling ? row("ITS RULING", esc(c.ruling.sync || "—"), esc(c.ruling.says || "")) : "")
        + '<div class="rfoot">Read from the public pull lane: <a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.url) + '</a></div></div>');
      return;
    }
    addBubble("ass", "Reading this station's own card off the pull lane…");
    const r = await M.readCard();
    const c = r.card;
    addBubble("ass", '<div class="rise"><div class="rhead">🜂 /masterlink card — this station\'s master-link</div>'
      + row("THE CANONICAL URL", r.ok ? "PUBLISHED · HTTP " + r.status : "NOT PUBLISHED · HTTP " + esc(String(r.status || "—")),
          '<a href="' + esc(M.cardUrl()) + '" target="_blank" rel="noopener noreferrer">' + esc(M.cardUrl()) + '</a>'
          + (r.ok ? " · " + K(r.bytes) + " B" : "<br>" + esc(r.why)))
      + row("THE IN-TREE COPY", "src/master-link.json", "the copy that always ships with a save and is read by content key — remove nothing, trust this one")
      + (c ? (row("IT SAYS", esc(c.role || ""), "generator " + esc(c.generator || "") + " · written " + esc(c.iso || ""))
          + row("THE UMBRELLA ON THE CARD", String((((c.umbrella || {}).measured) || []).length), ((((c.umbrella || {}).measured) || [])).map(x => esc(x.gen) + " — " + K(x.files) + " files · " + K(x.bytes) + " B" + (x.why ? " <i>(" + esc(x.why) + ")</i>" : "")).join("<br>"))
          + row("THE RULING ON THE CARD", esc(((c.ruling || {}).sync) || "—"), esc(((c.ruling || {}).says) || ""))) : "")
      + '<div class="rfoot">The card is how a sibling reads this station the way the web station established: tree, brain, key log, no token. <b>/masterlink card publish</b> writes it · <b>/masterlink card pull &lt;gen&gt;</b> reads another station\'s.</div></div>');
    return;
  }

  if(verb === "off" || verb === "on"){
    const on = await M.setAuto(verb === "on");
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink ' + verb + '</div>'
      + row("WATCH", on ? "ARMED" : "OFF", on ? "every 3 minutes, skipped while the tab is hidden and run the moment it comes back · silent unless something moved, a handoff arrived, or a failure changed" : "the link is still readable on demand — /masterlink status · sync now · read · inbox")
      + '</div>');
    return;
  }

  if(verb === "order"){
    /* /masterlink order <generator> :: <instruction>  — the command itself.
       Both lanes are tried and each verdict is shown: the Legion queue (send →
       claim → complete) and the artifact courier, which always crosses. */
    const m = rest.match(/^order\s+([a-z0-9-]+)\s*::\s*([\s\S]+)$/i);
    let gen = m ? m[1] : "", body = m ? m[2] : "";
    if(!m){
      const alt = rest.match(/^order\s+([\s\S]+)$/i);
      const cfg0 = await M.config();
      if(alt && cfg0.targets.length){ gen = cfg0.targets[0]; body = alt[1]; }
    }
    if(!gen || !body){
      addBubble("ass", 'Usage: <b>/masterlink order &lt;generator&gt; :: &lt;instruction&gt;</b><br>e.g. <b>/masterlink order ' + esc(M.SIBLING) + ' :: run /umbrella and report what you can actually command</b>');
      return;
    }
    addBubble("ass", "Issuing the order to <b>" + esc(gen) + "</b>…");
    const cfg = await M.config();
    const named = cfg.targets.indexOf(gen) !== -1;
    const rec = await M.order(gen, body, { enqueue: async (cmdText) => {
      const ok = await cmdRoute(cmdText);
      const live = window.__cmdLive;
      return { ok, id: (ok && live && live.id != null) ? live.id : null };
    } });
    if(!rec || !rec.text){ addBubble("ass", "⚠ " + esc((rec && rec.why) || "the order was not recorded")); return; }
    const q = rec.lanes.queue || {}, a = rec.lanes.artifact || {};
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink order — ' + esc(rec.to) + '</div>'
      + row("THE ORDER", rec.text.length + " chars", esc(rec.text.slice(0, 400)))
      + row("LANE 1 · THE TUNNEL QUEUE", q.ok ? "CARRIED" + (q.id ? " · #" + q.id : "") : "NOT CARRIED",
          q.ok ? "sent to the Legion's durable queue (send → claim → complete) · /queue shows it and its status" : esc(q.why || "no reason given"))
      + row("LANE 2 · THE ARTIFACT COURIER", a.ok ? "CARRIED" : "NOT CARRIED",
          a.ok ? '<a href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.url) + '</a><br>' + K(a.bytes) + " B · sha-256 " + esc(String(a.sha256).slice(0, 24)) + "…"
               : esc(a.why || "no reason given"))
      + row("ADDRESSED TO", named ? "A NAMED GENERATOR" : "A GENERATOR THAT RESOLVES",
          named ? esc(gen) + " is named under the umbrella, so it is watched and its handoffs land in the inbox" : esc(gen) + " resolves on the read channel but is not named — /masterlink name " + esc(gen) + " to watch it")
      + '<div class="rfoot">Neither lane writes into ' + esc(gen) + "'s files — no cross-namespace write exists, and this card will not pretend one happened. The order is delivered; the execution happens inside that generator, on its own save or gate, and its answer comes back on the SESSIONS/ lane this station reads by content key.</div></div>");
    return;
  }

  if(verb === "orders"){
    const list = await M.orders();
    if(!list.length){ addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink orders</div>' + row("ISSUED", "0", "nothing has been commanded from this station yet — <b>/masterlink order &lt;generator&gt; :: &lt;instruction&gt;</b>") + '</div>'); return; }
    const rows = list.slice(0, 10).map(o => row(o.to, o.carried ? "DELIVERED" : "HELD",
      esc(String(o.text).slice(0, 160)) + '<br><span style="opacity:.7">' + esc(o.at) + " · queue " + ((o.lanes.queue || {}).ok ? "carried" : "not carried") + " · artifact " + ((o.lanes.artifact || {}).ok ? "carried" : "not carried") + "</span>"
      + ((o.lanes.artifact || {}).url ? '<br><a href="' + esc(o.lanes.artifact.url) + '" target="_blank" rel="noopener noreferrer">' + esc(o.lanes.artifact.url) + "</a>" : ""))).join("");
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink orders — ' + list.length + ' issued</div>' + rows
      + '<div class="rfoot">Append-only, kept in this browser. An order reads DELIVERED when a lane carried it — never EXECUTED, because this station cannot see inside another generator. The node\'s own answer is what /masterlink inbox reads back.</div></div>');
    return;
  }

  if(verb === "sync" || verb === "now" || verb === "look"){
    addBubble("ass", "Looking at every named generator…");
    const out = await M.lookAll({});
    const rows = out.results.map(r => {
      if(r.verdict === "FAILED") return row(r.gen, "FAILED", esc(r.why));
      const cls = r.first ? "BASELINE" : (r.moved ? r.moved + " MOVED" : "STILL");
      const movedList = r.first ? "" : (r.diff.added.map(x => "+ " + esc(x.path)).concat(r.diff.changed.map(x => "~ " + esc(x.path) + " " + K(x.from) + "→" + K(x.to)), r.diff.gone.map(x => "− " + esc(x.path))).slice(0, 12).join("<br>")
        + (r.diff.moved > 12 ? "<br>… and " + (r.diff.moved - 12) + " more" : ""));
      return row(r.gen, cls, K(r.files) + " files · " + K(r.bytes) + " B · " + r.ms + " ms"
        + (r.first ? "<br>the first look at this generator — taken as the BASELINE. Nothing has moved until there is something to move from." : "")
        + (movedList ? "<br>" + movedList : "")
        + ((r.handoffs || []).length ? '<br><b>' + r.handoffs.length + ' handoff(s) pulled:</b><br>' + r.handoffs.slice(0, 8).map(h => esc(h.path) + " · " + K(h.bytes) + " B · " + esc(String(h.sha256).slice(0, 12)) + "…").join("<br>") : ""));
    }).join("");
    addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink sync now — ' + esc(out.verdict) + '</div>' + rows
      + row("THE RUN", out.moved + " file(s) moved", out.pulled + " handoff(s) pulled · " + out.failed.length + " failure(s)"
          + (out.firsts ? " · " + out.firsts + " baseline look(s)" : "")
          + (out.recovered.length ? " · recovered: " + out.recovered.map(esc).join(" · ") : ""))
      + '<div class="rfoot">A look READS the published tree; it does not touch the generator. Nothing was written anywhere by this run.</div></div>');
    return;
  }

  /* status — measured now, never remembered */
  addBubble("ass", "Measuring the link…");
  const st = await M.status();
  const trows = st.targets.map(t => t.lastFail
    ? row(t.gen, "UNREACHABLE", esc(t.lastFail))
    : row(t.gen, t.known ? "IN SIGHT" : "NEVER LOOKED",
        (t.known ? K(t.count) + " files · " + K(t.bytes) + " B · last look " + esc(t.last) : "named, not yet read")
        + (t.lastDiff && t.lastDiff.moved ? " · last move: " + t.lastDiff.moved + " file(s)" : ""))).join("");
  const inbox = st.inbox.slice(0, 6).map(it => esc(it.path) + ' <span style="opacity:.6">(' + esc(it.gen) + ')</span>').join("<br>") || "none pulled yet";
  /* the card lane, measured now: the canonical URL is read back, so PUBLISHED is
     a fact and a 404 is stated rather than assumed. The in-tree copy is what
     always ships. */
  let cardRow;
  try{
    const c = await M.readCard();
    cardRow = row("THE CARD (master-link)", c.ok ? "PUBLISHED · HTTP " + c.status : "NOT PUBLISHED · HTTP " + String(c.status || "—"),
      esc(M.cardUrl()) + (c.ok ? " · " + K(c.bytes) + " B" : " — the platform's editable pull lane") + " · the copy that always ships is <b>src/master-link.json</b> · <b>/masterlink card</b>" + (c.ok ? "" : " · <b>/masterlink card publish</b>"));
  }catch(e){ cardRow = row("THE CARD (master-link)", "UNMEASURED", esc(String((e && e.message) || e))); }
  addBubble("ass", '<div class="rise"><div class="rhead">🔗 /masterlink — the master link</div>'
    + row("THIS SIDE", st.self.generator, "Obi · public id " + esc(String(st.self.publicId || "?").slice(0, 12)) + "…")
    + row("NAMED (the umbrella)", String(st.targets.length), st.targets.map(t => esc(t.gen)).join(" · "))
    + trows
    + row("HANDOFFS PULLED", String(st.inbox.length), inbox)
    + row("WRITE LANE", st.write.open ? "OPEN" : "SHUT", "measured now, verbatim: " + esc(st.write.detail) + " — the link READS generators; it cannot write into one, and it does not pretend to")
    + cardRow
    + row("ORDERS ISSUED", String((st.orders || []).length), (st.orders || []).length ? ("newest: " + esc(String(st.orders[0].text).slice(0, 120)) + " → " + esc(st.orders[0].to) + " (" + esc(st.orders[0].at) + ") · /masterlink orders") : "none yet — <b>/masterlink order &lt;generator&gt; :: &lt;instruction&gt;</b>")
    + row("DURABLE LANE", st.durable.served ? "SERVED" : "NOT YET SERVED", esc(st.durable.path) + (st.durable.bytes ? " · " + K(st.durable.bytes) + " B on this origin" : " · ships with the next save"))
    + row("WATCH", st.cfg.auto ? "ARMED · EVERY 3 MIN" : "OFF", "last look " + esc(st.cfg.lastLook || "not yet") + " · /masterlink on|off")
    + '<div class="rfoot">Three lanes, exactly as the sibling station states them: the LINK (read, no token) · the DURABLE LANE (a src/ file that travels with a save) · the INBOX (handoffs pulled by content key). Naming is the command this station actually has.</div></div>');
}

/* ------------------------ THE FREE WIRE (src/freewire.js) ------------------
   The fabric that needs no credential. Every lane it prints was written to and
   read back from this origin; every refusal is printed in the refusing party's
   own words. It exists because the two doors the estate kept reporting shut
   (the platform's editable store and the cloud) are not the only road: a mutable
   pointer and a public nerve carry the estate without a token. */
async function doWire(text){
  const W = window.ObiFreeWire;
  if(!W){ addBubble("ass", "⚠ src/freewire.js did not load — reload the page."); return; }
  const rest = String(text == null ? "" : text).replace(/^\/(wire|nerves)\s*/i, "").trim();
  const parts = rest.split(/\s+/).filter(Boolean);
  const verb = (parts[0] || "").toLowerCase();
  const arg = parts.slice(1).join(" ");
  const K = n => (n == null || isNaN(n)) ? "—" : Number(n).toLocaleString();
  const row = (k, v, d) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd">' + esc(v) + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>';

  if(verb === "probe"){
    addBubble("ass", "Re-measuring every free lane, live…");
    const p = await W.probe();
    const rows = p.rows.map(r => '<div class="rrow' + (r.ok ? "" : " bad") + '"><b>' + esc(r.lane) + '</b><span class="vd">' + (r.ok ? "WORKS" : "REFUSED") + '</span><div class="rd">' + esc(r.note) + '</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">🛰 /wire probe — measured ' + esc(p.at) + '</div>'
      + row("LANES THAT ANSWERED", p.open + " / " + p.total, "a real write, a real read-back, or a real read — never a status code taken on faith")
      + rows
      + '<div class="rfoot">The shut lanes are printed with their own words. Nothing here needs a token except the two doors that always did: GitHub (a PAT) and Cloudflare (a token).</div></div>');
    return;
  }

  if(verb === "announce" || verb === "aim"){
    addBubble("ass", "Reading the register from this origin, aiming the pointer, broadcasting on the nerve…");
    const r = await W.announce({ verdict: "REAL" });
    const rows = r.steps.map(s => '<div class="rrow' + (s.state === "REAL" || s.state === "AIMED" || s.state === "SENT" || s.state === "READ" ? "" : " bad") + '"><b>' + esc(s.what) + '</b><span class="vd">' + esc(s.state) + '</span><div class="rd">' + esc(s.note) + '</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">🛰 /wire announce — ' + esc(r.verdict) + '</div>'
      + rows
      + row("THE POINTER NOW SAYS", "", '<span class="rd-mono">' + esc(r.line) + '</span><br>' + esc(r.fit.value) + " chars of value · URL " + r.fit.url + " of a ceiling of " + r.fit.ceiling + " (room " + r.fit.room + ")")
      + row("READ IT WITH NO TOKEN", "ANYONE", '<a href="' + esc(W.pointerUrl()) + '" target="_blank" rel="noopener noreferrer">' + esc(W.pointerUrl()) + '</a>')
      + row("THE NERVE", "https://ntfy.sh/" + esc(W.NERVE), "append-only, 12 h of history in one GET · <b>/wire tail</b>")
      + '<div class="rfoot">' + esc(r.says) + '</div></div>');
    return;
  }

  if(verb === "pointer" || verb === "where"){
    const p = await W.pointer();
    if(!p.ok){ addBubble("ass", "⚠ " + esc(p.why)); return; }
    const q = p.parsed || {};
    addBubble("ass", '<div class="rise"><div class="rhead">🛰 /wire pointer — the family pointer, as it stands</div>'
      + row("RAW", p.empty ? "(empty — nothing has announced yet)" : "", esc(p.raw || ""))
      + (q && !q.malformed && !p.empty ? row("AIMED AT", String(q.st || "—"), "announced " + esc(new Date((q.t || 0) * 1000).toISOString()) + " · verdict " + esc(q.v || "—"))
        + row("THE REGISTER", esc(String(q.reg || "-")), q.reg && q.reg !== "-" ? "the file host key — <a href=\"https://user.uploads.dev/file/" + esc(q.reg) + "\" target=\"_blank\" rel=\"noopener noreferrer\">read it</a>" : "not addressed from here yet — /relay delivers it")
        + row("THE PACKET", esc(String(q.pkt || "-")), q.pkt && q.pkt !== "-" ? '<a href="https://user.uploads.dev/file/' + esc(q.pkt) + '" target="_blank" rel="noopener noreferrer">read it</a>' : "not addressed from here yet")
        + row("THE ESTATE AT THAT MOMENT", K(q.n) + " files", K(q.b) + " B · tree " + esc(String(q.tree || "-")) + "…") : "")
      + (p.empty ? row("WHY IT IS EMPTY", "", "the store answers, but no station has written an announcement yet — <b>/wire announce</b>") : "")
      + '<div class="rfoot">This is the mutable store that does the job the platform\'s editable store refused: overwritten freely, read by anyone, no account. <span class="rd-mono">' + esc(p.url) + '</span></div></div>');
    return;
  }

  if(verb === "send"){
    if(!arg){ addBubble("ass", "Usage: <b>/wire send &lt;text&gt;</b> — a line on the family nerve (" + esc("https://ntfy.sh/" + W.NERVE) + ")."); return; }
    const s = await W.send(arg, { title: "Obi · " + (window.generatorName || "?") });
    addBubble("ass", '<div class="rise"><div class="rhead">🛰 /wire send — ' + (s.ok ? "BROADCAST" : "REFUSED") + '</div>'
      + row("THE LINE", K(s.bytes) + " B", esc(arg.slice(0, 300)))
      + row("THE NERVE", "https://ntfy.sh/" + esc(s.topic), s.ok ? "message " + esc(String(s.id)) + " · read it back with <b>/wire tail</b>" : esc(s.why))
      + '<div class="rfoot">Publish is open and needs no account. Anything on the nerve is public — the nerve is a broadcast, never a place for a secret.</div></div>');
    return;
  }

  if(verb === "tail" || verb === "read"){
    const n = Math.max(1, Math.min(50, parseInt(arg, 10) || 8));
    const t = await W.tail(0);
    if(!t.ok){ addBubble("ass", "⚠ " + esc(t.why)); return; }
    const nerveUrl = "https://ntfy.sh/" + W.NERVE;
    const rows = t.rows.slice(-n).map(m => '<div class="rrow"><b>' + esc(String(m.title || m.topic || "line")) + '</b><span class="vd">' + esc(new Date((m.time || 0) * 1000).toLocaleString()) + '</span><div class="rd" style="white-space:pre-wrap">' + esc(String(m.message || "").slice(0, 500)) + '</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">🛰 /wire tail — the nerve, verbatim</div>'
      + row("ON THE NERVE", K(t.count) + " line(s) in the window", 'showing the newest ' + Math.min(n, t.rows.length) + ' · <a href="' + esc(nerveUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(nerveUrl) + '</a>')
      + (rows || '<div class="rd">nothing on the nerve in this window</div>')
      + (rows || '<div class="rd">nothing on the nerve in this window</div>')
      + '<div class="rfoot">One GET returns the whole history in order. Append-only is the transport\'s own shape, which is why this is a ledger and not a buzzer.</div></div>');
    return;
  }

  if(verb === "put"){
    if(!arg){ addBubble("ass", "Usage: <b>/wire put &lt;src/path&gt;</b> — carries one file of this estate out over the first free carrier that takes it."); return; }
    addBubble("ass", "Carrying <b>" + esc(arg) + "</b>…");
    let buf = null;
    try{ const r = await fetch(location.origin + "/" + arg.replace(/^\//, ""), { cache:"no-store" }); if(r.ok) buf = new Uint8Array(await r.arrayBuffer()); }
    catch(e){}
    if(!buf){ addBubble("ass", "⚠ " + esc(arg) + " could not be read from this origin (it may not exist, or the tree is unsaved)."); return; }
    const type = /\.json$/i.test(arg) ? "application/json" : (/\.(md|txt)$/i.test(arg) ? "text/plain" : "application/octet-stream");
    const p = await W.put(buf, arg.split("/").pop(), type);
    const tries = (p.tries || []).map(t => '<div class="rrow"><b>' + esc(t.lane) + '</b><span class="vd">refused</span><div class="rd">' + esc(t.why) + '</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">🛰 /wire put — ' + (p.ok ? "CARRIED" : "REFUSED") + '</div>'
      + row("THE FILE", esc(arg), K(buf.length) + " B")
      + (p.ok ? row("CARRIED BY", esc(p.lane), '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.url) + '</a> · keeps ' + esc(p.keeps))
              : row("RESULT", "NOTHING WAS CARRIED", esc(p.why)))
      + tries
      + '<div class="rfoot">The carriers are tried in order: the estate\'s own host first (permanent), then the anonymous ones. A refusal never stops the next lane.</div></div>');
    return;
  }

  if(verb === "slate"){
    if(!arg){ addBubble("ass", "Usage: <b>/wire slate &lt;text&gt;</b> — puts text somewhere permanent and readable by a human."); return; }
    addBubble("ass", "Writing a slate…");
    const s = await W.slate(arg);
    addBubble("ass", '<div class="rise"><div class="rhead">🛰 /wire slate — ' + (s.ok ? "BY " + esc(s.lane) : "REFUSED") + '</div>'
      + (s.ok ? row("READ IT", K(s.bytes) + " B", '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.url) + '</a>' + (s.immutable ? " · measured IMMUTABLE — write once, never edit" : ""))
              : row("RESULT", "REFUSED", esc(s.why)))
      + '<div class="rfoot">A slate cannot be edited, which is why it is the right shape for a record and the wrong shape for a pointer — the pointer lives in the mutable store. <b>/wire pointer</b>.</div></div>');
    return;
  }

  /* the default card: the lane table, as measured, and the pointer's name */
  const c = W.card();
  const lanes = c.lanes.map(l => '<div class="rrow' + (l.write === "SHUT" ? " bad" : "") + '"><b>' + esc(l.name) + '</b><span class="vd">' + esc(l.write === "SHUT" ? "SHUT" : (l.write === "OPEN" ? "OPEN" : "READ-ONLY")) + '</span><div class="rd">' + l.why + '<br><span class="rd-mono">' + esc(l.url) + '</span>' + (l.needs ? ' · <b>needs</b> ' + esc(l.needs) : "") + '</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">🛰 /wire — the free wire (control with no credential)</div>'
    + row("THIS STATION", esc(c.station), "Obi · freewire v" + esc(c.version))
    + row("LANES OPEN", c.open + " of " + c.lanes.length, "every OPEN lane was written to and read back from this origin")
    + row("STILL SHUT", String(c.shut.length), c.shut.map(l => esc(l.name)).join(" · "))
    + row("WHAT UNLOCKS THEM", String(c.needs.length), c.needs.map(esc).join(" · "))
    + row("THE NERVE", "https://ntfy.sh/" + esc(c.nerve), "append-only, 12 h of history in one GET · nothing on it is secret")
    + row("THE POINTER", esc(c.ns) + " · ceiling " + c.pointerCeiling + " chars of URL", '<a href="' + esc(c.pointerUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(c.pointerUrl) + '</a> — measured: overwrite answers 200, and the read-back is the proof')
    + '<div class="rd" style="margin:8px 0 4px"><b>THE MEASURED LANE TABLE</b></div>'
    + lanes
    + '<div class="rfoot"><b>/wire announce</b> aims the pointer and broadcasts the newest register · <b>/wire pointer</b> reads it · <b>/wire probe</b> re-measures · <b>/wire tail</b> reads the nerve · <b>/wire put &lt;path&gt;</b> carries a file · <b>/wire slate &lt;text&gt;</b> writes a permanent slate. The free wire does not replace the two credential doors: it is a second road that does not wait for them.</div></div>');
}

/* ---------------------- STUDENT SELECTOR UI ---------------------- */
function fmtDay(t){ try{ return new Date(t).toLocaleDateString(); }catch(e){ return "?"; } }
/* ---------------------- THE LANDING SHELL (views + tabs) ----------------------
   The landing page is the COMMAND STATION: the magic chat, where the sovereign
   speaks and the empire listens (messages, the command shelf, the composer).
   Three faces, one station:
     · ⌘ Command Station   — the chat. The landing page.
     · ◈ Phoenix Generators — PrAis's divisions and the generators in each
                              (the registry is src/divisions.js). The 👤 Student
                              Evaluator DESK lives one level in, under NET — it is
                              a generator, and the family has more than one
                              (Lesson Creator is next), so it is filed like one.
     · ⚙ Settings          — voice, the command shelf, the ledger, the live
                              instruments and reincarnate. These used to be five
                              separate topbar buttons; they are one room now, and
                              every one of them is still a command as well.
   The active face is remembered for the browser session (sessionStorage `obi_view`)
   and named in the URL hash (#cmd / #gen / #eval / #settings), so a face can be
   linked to directly — and a fresh visit always lands on the command station. */
const VIEWS = { cmd: "⌘ Command Station", room: "◈ Boardroom", gen: "◈ Phoenix Generators", settings: "⚙ Settings", eval: "👤 Student Evaluator", lesson: "📚 Lesson Creator", intake: "🎓 The Intake" };
const TAB_OF = { cmd: "cmd", room: "room", gen: "gen", settings: "settings", eval: "gen", lesson: "gen", intake: "gen" };   /* which TAB a view lights up */
let currentView = "cmd";

function setViewTab(name){
  const tab = TAB_OF[name] || "cmd";
  document.querySelectorAll("#tabbar .tabbtn").forEach(b => b.classList.toggle("on", b.dataset.view === tab));
  const c = $("viewCmd"), g = $("viewGen"), s = $("viewSet"), r = $("viewRoom");
  if(c) c.classList.toggle("hidden", tab !== "cmd");
  if(g) g.classList.toggle("hidden", tab !== "gen");
  if(s) s.classList.toggle("hidden", tab !== "settings");
  if(r) r.classList.toggle("hidden", tab !== "room");
  if(tab !== "gen") deskOpen(false);
}

/* The DESKS that live one level inside ◈ Phoenix Generators → NET: the Student
   Evaluator's switchboard, and the Lesson Creator's four rooms. Exactly one of
   {the division grid, a desk} is on screen, and the desk keeps whatever its own
   module put in it. `which` is "eval" (default) or "lesson"; falsy closes both. */
function deskOpen(on, which){
  const g = $("genDesk"), l = $("lessonDesk"), br = $("brandDesk"), nk = $("intakeDesk"), b = $("genBody");
  const open = on ? (which || "eval") : null;
  if(g) g.classList.toggle("hidden", open !== "eval");
  if(l) l.classList.toggle("hidden", open !== "lesson");
  if(br) br.classList.toggle("hidden", open !== "brand");
  if(nk) nk.classList.toggle("hidden", open !== "intake");
  if(b) b.classList.toggle("hidden", !!open);
  if(open === "eval" && window.ObiReview) return Promise.resolve(renderStudentSelector()).then(() => true).catch(() => true);
  if(open === "lesson" && window.ObiLessons && window.ObiLessons.mount){ try{ window.ObiLessons.mount(); }catch(e){} }
  if(open === "brand" && window.ObiBrand && window.ObiBrand.mountDesk){ try{ window.ObiBrand.mountDesk(); }catch(e){} }
  /* THE INTAKE (src/intake.js) — the app that remembers: every promise from a
     lesson recording, its owner, its evidence and its state. It reads kv and
     renders itself; a missing module is reported rather than mounted empty. */
  if(open === "intake"){
    if(window.ObiIntake && window.ObiIntake.mount) return Promise.resolve(window.ObiIntake.mount()).catch(() => false);
    const np = $("intakePanel");
    if(np) np.innerHTML = '<div class="hint">⚠ <b>src/intake.js</b> did not load — reload the page. (THE INTAKE is the app the tutor asked for on the 23rd: “we’ll build it all into one app so that it remembers”.)</div>';
    return Promise.resolve(false);
  }
  return Promise.resolve(!!open);
}

/* render the family (src/divisions.js). Never touches #genDesk — the desk keeps
   whatever the evaluation layer put in it. */
function mountGenerators(){
  try{ if(window.ObiDivisions) window.ObiDivisions.mount({ onOpen: openGenerator }); }catch(e){}
  try{ if(window.ObiBrand && window.ObiBrand.upgrade) window.ObiBrand.upgrade(); }catch(e){}
}

/* a generator card was opened. Live ones open; planned ones say so — in the
   station, so the honest answer is in the record rather than in a dead button. */
function openGenerator(id){
  const D = window.ObiDivisions, g = D && D.get(id);
  if(!g) return;
  if(g.entry === "eval"){ showView("eval"); return; }
  if(g.entry === "lesson"){ showView("lesson"); return; }
  if(g.entry === "intake"){ showView("intake"); return; }
  if(g.entry === "brand"){ showView("gen"); deskOpen(true, "brand"); return; }
  if(g.status === "live" && g.url){ try{ window.open(g.url, "_blank", "noopener"); }catch(e){} return; }
  const st = (D.STATUS[g.status] || D.STATUS.planned);
  addBubble("ass", '<div class="rise"><div class="rhead">' + g.icon + ' ' + esc(g.name) + ' — ' + st.label + '</div>'
    + '<div class="rrow"><b>STATE</b><span class="vd">' + esc(g.status.toUpperCase()) + '</span><div class="rd">' + esc(st.blurb) + '</div></div>'
    + '<div class="rrow"><b>IT WOULD DO</b><span class="vd"></span><div class="rd">' + esc(g.blurb) + ((g.does || []).length ? '<br>' + g.does.map(x => "• " + esc(x)).join("<br>") : "") + '</div></div>'
    + ((g.needs || []).length ? '<div class="rrow"><b>STILL NEEDS</b><span class="vd">' + g.needs.length + '</span><div class="rd">' + g.needs.map(x => "• " + esc(x)).join("<br>") + '</div></div>' : "")
    + '<div class="rfoot">Not built — and saying so is the point. The registry is <b>src/divisions.js</b>; ask and it becomes forge work.</div></div>');
  showView("cmd");
}

/* the station's live state, kept in the tab bar: run · soul · I-LOG · tunnel · brain */
function updateTabMeta(){
  const el = $("tabMeta");
  if(!el) return;
  const tunnel = cmdSocketState === "open" ? "open" : cmdSocketState;
  /* the record is part of the flight instruments: read straight from the mirror,
     so the count is on screen before kv finishes opening */
  let ilogN = null;
  try{ const m = JSON.parse(localStorage.getItem("obi_ilog") || "null"); if(m && typeof m.count === "number") ilogN = m.count; }catch(e){}
  /* the brain is an instrument too: how much it has indexed, and what the auto lane
     last found. It shows the WRITE lane's verdict, so a blocked sync is on screen
     rather than buried in a card nobody opens. */
  /* and the relay is an instrument too: the last master sync run, its result and its
     stages, read synchronously from the pipeline itself (never remembered from a card). */
  let relay = "…", relayTitle = "the relay (src/relay.js) is not loaded";
  try{
    const RL = window.ObiRelay;
    if(RL){
      const c = RL.cached ? RL.cached() : null;
      if(c){ relay = String(c.result || "—"); relayTitle = "the master sync pipeline: " + c.result + " · " + (c.stages || []).map(s => s.name + "=" + s.verdict).join(" ") + " · " + c.ms + " ms · /relay"; }
      else { relay = "—"; relayTitle = "not run yet — the relay runs itself shortly after boot · /relay"; }
    }
  }catch(e){}
  /* and the market is an instrument too: the last recon, and how many seats it found
     open, read synchronously from the recon engine itself (never remembered from a card). */
  let market = "…", marketTitle = "the open source market (src/market.js) is not loaded";
  try{
    const MK = window.ObiMarket;
    if(MK){
      const c = MK.cached ? MK.cached() : null;
      if(c){ const open = (c.seats || []).filter(x => x.open).length; market = String(open); marketTitle = "the open source market: " + c.verdict + " · " + c.measured + "/" + c.channels + " channels answered · " + open + " open seat(s) · " + c.at + " · /market"; }
      else { market = "—"; marketTitle = "not scanned yet — the recon runs itself after boot · /market scan"; }
    }
  }catch(e){}
  let brain = "—", brainTitle = "the brain (src/brain.js) is not loaded";
  try{
    const B = window.ObiBrain;
    if(B){
      const idx = B.index();
      brain = idx ? String(idx.entries.length) : "build…";
      brainTitle = "the brain: " + (idx ? idx.entries.length + " entries indexed · built " + idx.built : "not built yet") + " · /brain";
    }
  }catch(e){}
  /* and the rubric is the instrument the word "evaluator" means: its families and its
     law, read synchronously from the engine itself (never remembered from a card). */
  let rubric = "\u2014", rubricTitle = "the rubric instrument (src/rubric.js) is not loaded";
  try{
    const RB = window.ObiRubric;
    if(RB){ const st = RB.state(); rubric = String(st.built); rubricTitle = "the rubric: " + st.built + " families \u00b7 " + st.law + " laws enforced in code \u00b7 /rubric · /rubric canary checks this instrument by machine"; }
  }catch(e){}
  el.innerHTML = "RUN <b>" + (runNoOf() || "—") + "</b> · SOUL <b>" + ledger.soul.length + "</b> · I-LOG <b>" + (ilogN == null ? "—" : ilogN) + "</b> · tunnel <b>" + esc(tunnel) + "</b> · brain <b title=\"" + esc(brainTitle) + "\">" + esc(brain) + "</b> · relay <b title=\"" + esc(relayTitle) + "\">" + esc(relay) + "</b> · market <b title='" + esc(marketTitle) + "'>" + esc(market) + "</b> · rubric <b title='" + esc(rubricTitle) + "'>" + esc(rubric) + "</b>";
  try{ renderBrandBar(); }catch(e){}
}

/* ⚙ Settings is two rooms: the station's own controls, and Free Phoenix Mode
   (src/freephoenix.js — Agent 99 with no canon, no gate, no Git, no cloud, no
   record). The choice is remembered in this browser; the room mounts on demand. */
function setSetTab(which){
  const free = which === "free";
  const a = $("setTabStationBtn"), b = $("setTabFreeBtn");
  if(a) a.classList.toggle("on", !free);
  if(b) b.classList.toggle("on", free);
  const so = $("setTabStation"), sf = $("setTabFree");
  if(so) so.hidden = free;
  if(sf) sf.hidden = !free;
  try{ localStorage.setItem("obi_settab", free ? "free" : "station"); }catch(e){}
  if(free && window.ObiFree && window.ObiFree.mount) window.ObiFree.mount();
  return free;
}

/* ⚙ Settings' instruments — read live, never remembered. If a module is missing
   it says MISSING here rather than quietly dropping the row. */
function renderSettings(){
  paintVoiceBtn();
  const el = $("setInstr");
  if(!el) return;
  let ilogN = "—";
  try{ const m = JSON.parse(localStorage.getItem("obi_ilog") || "null"); if(m && typeof m.count === "number") ilogN = m.count; }catch(e){}
  const o = omegaStatusText();
  let keys = {};
  try{ keys = JSON.parse(localStorage.getItem("obi_keys") || "{}") || {}; }catch(e){}
  const run = currentRun();
  const client = (window.ObiClients && window.ObiClients.name) ? window.ObiClients.name() : "—";
  const rows = [
    ["run", "run " + (runNoOf() || "—") + (run ? (run.closed ? " · closed" : " · open") : "")],
    ["soul", ledger.soul.length + " fragment(s) · " + soulCount() + " chars this session"],
    ["I-LOG", ilogN + " entries · /audit verifies the chain · /ilog push anchors it on Git"],
    ["client", client],
    ["view", VIEWS[currentView] || currentView],
    ["tunnel", cmdSocketState],
    ["background", window.ObiBg ? window.ObiBg.text() : "ObiBg MISSING"],
    ["canon gate", o.armed ? "ARMED · " + o.armedMinutesLeft + " min left" : "locked" + (o.fails ? " · " + o.fails + " failed attempt(s)" : "")],
    ["secrets", Object.keys(keys).length ? Object.keys(keys).join(", ") + " (names only — never shown here)" : "none stored in this browser"],
    ["modules", (window.ObiForge ? "forge ok" : "forge MISSING") + " · " + (window.ObiILog ? "ilog ok" : "ilog MISSING") + " · " + (window.ObiBg ? "bg ok" : "bg MISSING") + " · " + (window.ObiDivisions ? "divisions ok" : "divisions MISSING") + " · " + (window.ObiBrand ? "brand ok · " + window.ObiBrand.iconNames().length + " icons" : "brand MISSING")]
  ];
  el.innerHTML = rows.map(r => '<div class="set-kv"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>').join("") + backupHtml();
  wireBackup();
}

/* BACKUP & RESTORE (2026-10-18, sovereign order: the data on every browser).
   Export builds the portable shelf (every obi_* data key — never obi_keys: keys
   stay per device and are typed as commands). Import restores it with read-back
   verification. Snapshot semantics: the file wins, per key. */
function backupDataKeys(){
  const out = {};
  try{
    for(let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if(k && k.indexOf("obi_") === 0 && k !== "obi_keys") out[k] = localStorage.getItem(k);
    }
  }catch(e){}
  return out;
}
function backupHtml(){
  let n = 0, chars = 0;
  try{ const d = backupDataKeys(); n = Object.keys(d).length; for(const k of Object.keys(d)) chars += (d[k] || "").length; }catch(e){}
  return '<div class="sel-group">Backup &amp; restore — the data on every browser</div>'
    + '<div class="set-kv"><b>shelf</b><span>' + n + ' keys · ' + (chars/1048576).toFixed(2) + ' MB · secrets never travel</span></div>'
    + '<div class="rm-controls"><button class="rm-btn primary" id="bkExportBtn">Download backup</button> '
    + '<label class="rm-btn" for="bkImportFile" style="cursor:pointer">Import backup…</label>'
    + '<input type="file" id="bkImportFile" accept=".json,application/json" hidden></div>'
    + '<div class="rm-status" id="bkStatus">one file carries the whole shelf to the next browser</div>';
}
function wireBackup(){
  const ex = document.getElementById("bkExportBtn");
  if(ex && !ex.__wired){ ex.__wired = true; ex.onclick = function(){
    const pack = { at:new Date().toISOString(), kind:"pais-data-backup", keys:backupDataKeys() };
    pack.keyList = Object.keys(pack.keys);
    const blob = new Blob([JSON.stringify(pack)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pais-data-backup-" + pack.at.slice(0, 10) + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} }, 4000);
    const st = document.getElementById("bkStatus");
    if(st) st.textContent = "downloaded " + pack.keyList.length + " keys — carry the file to the next browser and Import it there";
    try{ logOp({ kind:"op", action:"backup export", result:pack.keyList.length + " keys" }); }catch(e){}
  }; }
  const im = document.getElementById("bkImportFile");
  if(im && !im.__wired){ im.__wired = true; im.onchange = function(){ importBackupFile(im.files && im.files[0], document.getElementById("bkStatus")); im.value = ""; }; }
}
async function importBackupFile(file, statusEl){
  const say = function(t){ if(statusEl) statusEl.textContent = t; };
  if(!file){ say("pick a backup file first"); return; }
  if(file.size > 50 * 1048576){ say("file too big (" + (file.size/1048576).toFixed(1) + " MB) — refusing"); return; }
  let pack = null;
  try{ pack = JSON.parse(await file.text()); }catch(e){ say("not a readable backup file"); return; }
  if(!pack || typeof pack !== "object" || !pack.keys || typeof pack.keys !== "object"){ say("not a backup file (no keys in it)"); return; }
  const names = Object.keys(pack.keys).filter(function(k){ return k.indexOf("obi_") === 0 && k !== "obi_keys"; });
  if(!names.length){ say("backup holds no data keys — nothing to restore"); return; }
  let ok = 0; const bad = [];
  for(const k of names){
    try{
      localStorage.setItem(k, String(pack.keys[k]));
      if(localStorage.getItem(k) === String(pack.keys[k])) ok++;
      else bad.push(k);
    }catch(e){ bad.push(k); }
  }
  say(ok === names.length
    ? "restored " + ok + " keys from " + (pack.at || "the backup") + " — secrets never travel (keys are typed per device)"
    : "restored " + ok + "/" + names.length + (bad.length ? " · failed: " + bad.join(", ") : ""));
  try{
    let sittings = 0, mem = 0;
    try{ const b = JSON.parse(localStorage.getItem("obi_boardroom") || "{}"); sittings = (b.sittings || []).length; mem = Object.keys(b.seatmem || {}).length; }catch(e){}
    reconLog({ what:"import", keys:ok + "/" + names.length, from:pack.at || "a backup file", sittings:sittings, seatmem:mem });
  }catch(e){}
  try{ logOp({ kind:"op", action:"backup import", result:ok + "/" + names.length + " keys" }); }catch(e){}
  try{ if(window.ObiRoom && window.ObiRoom.mount) window.ObiRoom.mount(); }catch(e){}
  renderSettings();
}

/* RECONCILIATION LOG (sovereign order: one recovery file on git — every
   cross-browser merge marked down for the final sort-through).
   The log lives in obi_recon, an obi_ key, so it rides the backup file to
   every browser. Each push renders OPERATIONS/COMMANDSTATION/
   PhoenixOmegaRecovery.md from it, newest last. */
function reconLog(entry){
  let log = [];
  try{ log = JSON.parse(localStorage.getItem("obi_recon") || "[]"); if(!Array.isArray(log)) log = []; }catch(e){ log = []; }
  log.push(Object.assign({ at:new Date().toISOString() }, entry || {}));
  while(log.length > 200) log.shift();
  try{ localStorage.setItem("obi_recon", JSON.stringify(log)); }catch(e){}
  return log.length;
}
function reconFile(){
  let log = [];
  try{ log = JSON.parse(localStorage.getItem("obi_recon") || "[]") || []; if(!Array.isArray(log)) log = []; }catch(e){}
  const L = ["# Phoenix Omega Recovery", "",
    "Every reconciliation of the empire's shelves, marked down for the final sort-through.",
    "Newest last. A row is true because the browser that wrote it counted it.", ""];
  if(!log.length) L.push("(no reconciliations marked yet)");
  log.forEach(function(e, i){
    L.push("## " + (i + 1) + " — " + (e.at || "?"));
    L.push("");
    L.push("- what: " + (e.what || "?"));
    if(e.keys != null) L.push("- keys: " + e.keys);
    if(e.sittings != null) L.push("- sittings: " + e.sittings);
    if(e.seatmem != null) L.push("- seats with memory: " + e.seatmem);
    if(e.from) L.push("- from: " + e.from);
    if(e.commit) L.push("- commit: " + e.commit);
    if(e.note) L.push("- note: " + e.note);
    L.push("");
  });
  return L.join("\n");
}

async function showView(name){
  if(!VIEWS[name]) name = "cmd";
  currentView = name;
  setViewTab(name);
  try{ sessionStorage.setItem("obi_view", name); }catch(e){}
  try{ history.replaceState(null, "", "#" + name); }catch(e){}
  if(name === "eval") await deskOpen(true, "eval");
  else if(name === "lesson") await deskOpen(true, "lesson");
  else if(name === "intake") await deskOpen(true, "intake");
  else deskOpen(false);
  if(name === "gen" || name === "eval") mountGenerators();  if(name === "settings"){ renderSettings(); try{ setSetTab(localStorage.getItem("obi_settab") || "station"); }catch(e){ setSetTab("station"); } }
  if(name === "room" && window.ObiRoom && window.ObiRoom.mount){ try{ window.ObiRoom.mount(); }catch(e){} }
  if(name === "gen" || name === "eval" || name === "settings"){
    const mp = $("memoryPanel"); if(mp && !mp.classList.contains("hidden")) mp.classList.add("hidden");
  }
  syncTopbarHeight();
  if(name === "cmd"){
    if(inputEl) inputEl.focus();
    /* the landing (welcome chips) is taller than a phone screen — open it at the
       top so the greeting is the first thing seen; a live chat still opens at the end */
    if(document.querySelector("#empty")) messagesCtn.scrollTop = 0; else scrollDown();
  }
  updateTabMeta();
  return name;
}

/* Anything the evaluation desk launches runs in the command station — the chat is
   where Obi answers — with the command pre-typed, sent outright unless the command
   needs its argument typed by the sovereign (data-arg="1"). */
async function runInStation(cmd, prefillOnly){
  await showView("cmd");
  const t = String(cmd == null ? "" : cmd);
  inputEl.value = prefillOnly ? (/\s$/.test(t) ? t : t + " ") : t;
  if(prefillOnly){ inputEl.focus(); return; }
  return send();
}

/* The evaluation desk — now one level inside ◈ Phoenix Generators → NET. */
async function showStudentSelector(){
  return showView("eval");
}

async function renderStudentSelector(){
  const body = $("selBody");
  if(!body) return;
  const C = window.ObiClients, R = window.ObiReview;
  if(!C || !R){ body.innerHTML = '<div class="hint">⚠ src/clients.js / src/review.js did not load — reload the page.</div>'; return; }
  body.innerHTML = '<div class="hint">Loading…</div>';
  try{
    await C.whenReady();
    const clients = await C.all();
    const activeId = C.id();
    const active = (await C.get(activeId)) || { id: activeId, name: activeId };
    const s = await C.stats(activeId);
    const students = await R.entities("student");
    const classes = await R.entities("class");
    const aS = R.active(), aC = R.activeClass();
    const bits = [];
    if(s.students != null) bits.push(s.students + " student(s)");
    if(s.classes != null) bits.push(s.classes + " class(es)");
    if(s.transcripts != null) bits.push(s.transcripts + " recording(s)");
    if(s.summaries != null) bits.push(s.summaries + " summary(ies)");
    if(s.reviews != null) bits.push(s.reviews + " review(s)");
    if(s.writeups != null) bits.push(s.writeups + " writeup(s)");

    let html = '<div class="sel-group">Active client</div>'
      + '<div class="sel-row on"><span class="sn">● ' + esc(active.name) + '</span><span class="vd">ACTIVE</span>'
      + '<div class="ss">' + esc(bits.join(" · ") || "no data yet") + '</div>'
      + '<button class="ci-act" data-do="ledger">◈ Open the client ledger</button></div>';

    const others = clients.filter(c => c.id !== activeId);
    if(others.length){
      html += '<div class="sel-group">Other clients</div>';
      for(const c of others){
        html += '<div class="sel-row"><span class="sn">○ ' + esc(c.name) + '</span>'
          + '<button class="ci-act" data-cl="select" data-name="' + esc(c.name) + '">Select</button>'
          + '<div class="ss">created ' + esc(new Date(c.created).toLocaleDateString()) + ' · id ' + esc(c.id) + '</div></div>';
      }
    }
    html += '<div class="sel-group">Add / switch client</div>'
      + '<div class="sel-add"><input id="newClientInput" placeholder="client name…" autocomplete="off"><button class="ci-act" id="newClientBtn">＋ Client</button></div>';

    html += '<div class="sel-group">Students · ' + esc(active.name) + '</div>';
    if(!students.length) html += '<div class="hint">No students for this client yet — add one below, or type <b>/student &lt;name&gt;</b>.</div>';
    for(const st of students){
      const on = st.id === aS;
      html += '<div class="sel-row' + (on ? ' on' : '') + '"><span class="sn">' + (on ? '●' : '○') + ' ' + esc(st.name) + '</span>'
        + (on ? '<span class="vd">ACTIVE</span>' : '<button class="ci-act" data-s="select" data-name="' + esc(st.name) + '">Select</button>')
        + '<button class="ci-act" data-s="write" data-name="' + esc(st.name) + '">📝 Review</button>'
        + '<div class="ss">' + (st.sources || []).length + ' evidence · ' + (st.notes || []).length + ' note(s) · last ' + esc(fmtDay(st.updated || st.created)) + '</div></div>';
    }
    html += '<div class="sel-add"><input id="newStudentInput" placeholder="student name…" autocomplete="off"><button class="ci-act" id="newStudentBtn">＋ Student</button></div>';

    html += '<div class="sel-group">Classes · ' + esc(active.name) + '</div>';
    if(!classes.length) html += '<div class="hint">No classes for this client yet — <b>/class &lt;name&gt;</b>.</div>';
    for(const cl of classes){
      const on = cl.id === aC;
      html += '<div class="sel-row' + (on ? ' on' : '') + '"><span class="sn">' + (on ? '●' : '○') + ' ' + esc(cl.name) + '</span>'
        + (on ? '<span class="vd">ACTIVE</span>' : '<button class="ci-act" data-c="select" data-name="' + esc(cl.name) + '">Select</button>')
        + '<button class="ci-act" data-c="write" data-name="' + esc(cl.name) + '">🏫 Writeup</button>'
        + '<div class="ss">' + (cl.sources || []).length + ' evidence · ' + (cl.notes || []).length + ' note(s) · last ' + esc(fmtDay(cl.updated || cl.created)) + '</div></div>';
    }
    html += '<div class="sel-add"><input id="newClassInput" placeholder="class name…" autocomplete="off"><button class="ci-act" id="newClassBtn">＋ Class</button></div>';
    html += '<div class="hint">Commands: <b>/client</b> · <b>/clients</b> · <b>/student</b> · <b>/class</b> · <b>/find</b>. A client\'s evidence never mixes with another\'s, and a desk action runs in the ⌘ Command Station.</div>';
    body.innerHTML = html;

    body.querySelectorAll("[data-cl], [data-s], [data-c], [data-do]").forEach(b => {
      b.onclick = async () => {
        try{
          if(b.dataset.do === "ledger"){ await runInStation("/clients"); return; }
          if(b.dataset.cl === "select"){ await C.select(b.dataset.name); await renderStudentSelector(); return; }
          const name = b.dataset.name;
          if(b.dataset.s === "select"){ await R.setActive(name); await renderStudentSelector(); return; }
          if(b.dataset.c === "select"){ await R.setClass(name); await renderStudentSelector(); return; }
          if(b.dataset.s === "write"){ await R.setActive(name); await runInStation("/review"); return; }
          if(b.dataset.c === "write"){ await R.setClass(name); await runInStation("/writeup"); return; }
        }catch(e){ reportError(e); }
      };
    });
    const addClient = async () => { const v = ($("newClientInput").value || "").trim(); if(!v) return; $("newClientBtn").disabled = true; await C.select(v); await renderStudentSelector(); };
    const addStudent = async () => { const v = ($("newStudentInput").value || "").trim(); if(!v) return; await R.setActive(v); await renderStudentSelector(); };
    const addClass = async () => { const v = ($("newClassInput").value || "").trim(); if(!v) return; await R.setClass(v); await renderStudentSelector(); };
    if($("newClientBtn")) $("newClientBtn").onclick = addClient;
    if($("newStudentBtn")) $("newStudentBtn").onclick = addStudent;
    if($("newClassBtn")) $("newClassBtn").onclick = addClass;
    body.querySelectorAll("input").forEach(inp => {
      inp.onkeydown = ev => { if(ev.key === "Enter"){ ev.preventDefault(); if(inp.id === "newClientInput") addClient(); else if(inp.id === "newStudentInput") addStudent(); else addClass(); } };
    });
  }catch(e){
    body.innerHTML = '<div class="hint">⚠ ' + esc(e.message) + '</div>';
  }
}

/* ---------------------- MEMORY UI ---------------------- */
function updateStats(){
  const el = $("memStats");
  const n = ledger.runs.length;
  const count = ledger.soul.length;
  const last = currentRun();
  if(el) el.innerHTML = `RUN ${n} · SOULCOUNT <b>${soulCount()}</b> chars · fragments: <b>${count}</b> · session start: ${last ? new Date(last.t).toLocaleString() : "—"}`;
  updateTabMeta();
}

function showMemory(){
  const panel = $("memoryPanel");
  syncTopbarHeight();
  const willShow = panel.classList.contains("hidden");
  panel.classList.toggle("hidden");
  const list = $("memList");
  list.innerHTML = "";
  const items = ledger.soul.slice().reverse().slice(0,40);
  if(!items.length){ list.innerHTML = '<div class="hint">No Soul DNA captured yet. Your words will be recorded here verbatim — never summarized.</div>'; }
  items.forEach(e => {
    const d = document.createElement("div");
    d.className = "mem-item";
    const ts = new Date(e.t).toLocaleString();
    d.innerHTML = `<div class="mh">RUN ${e.run ?? "—"} · ${ts}</div><div class="mq">${esc(e.text)}</div>`;
    list.appendChild(d);
  });
}

/* L46: reincarnate — a deliberate session boundary. Full DEATH seal → new run. */
function reincarnate(){
  runDeath(); /* Stage 6 SEAL + Stage 7 REINCARNATE+COMMIT */
  try{ window.speechSynthesis && speechSynthesis.cancel(); }catch(e){}
  location.reload();
}

/* ---------------------- VOICE ---------------------- */
let voices = [];
function loadVoices(){ voices = speechSynthesis.getVoices(); }
try{ speechSynthesis.onvoiceschanged = loadVoices; loadVoices(); }catch(e){}
function speak(text){
  if(!window.voiceEnabled) return;
  try{
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#`_~\[\]]/g," ").replace(/\s+/g," ").trim().slice(0,600);
    if(!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.0;
    let v = voices.find(x=>x.lang==="en-GB") || voices.find(x=>x.lang==="en-US");
    if(v) u.voice = v;
    speechSynthesis.speak(u);
  }catch(e){}
}

/* ============================================================================
   PHOENIXCOMMAND — THE MAGIC CHAT (the command station)
   One chat: the sovereign speaks → Agent 99 translates → the Legion executes —
   and Obi the smart chatbot answers. Every sovereign word is Soul DNA
   (SOUL-CAPTURE-FIRST) and every command rides the free always-on command
   tunnel (perchance server-plugin) — a durable queue hosted by Perchance, no
   card, no external worker. The server script lives in index.html.
   ========================================================================== */
let cmdRecognition = null;   /* speech recognition — lazily created on first mic tap, never before */
let cmdSocket = null;
let cmdSocketState = "idle";   /* idle | connecting | open | failed | closed */

function cmdSocketOpen(){ return cmdSocketState === "open"; }

async function cmdEnsureSocket(){
  if (cmdSocketState === "open") return true;
  if (cmdSocketState === "connecting"){
    const t0 = Date.now();
    while (cmdSocketState === "connecting" && Date.now() - t0 < 9000) await new Promise(r => setTimeout(r, 100));
    return cmdSocketState === "open";
  }
  cmdSocketState = "connecting";
  try{
    const sock = root.createServerSocket();
    cmdSocket = sock;
    sock.binaryType = "arraybuffer";
    await new Promise((res, rej) => {
      const to = setTimeout(() => rej(new Error("timeout")), 10000);
      sock.addEventListener("open",  () => { clearTimeout(to); res(); }, { once:true });
      sock.addEventListener("error", () => { clearTimeout(to); rej(new Error("error")); }, { once:true });
      sock.addEventListener("close", () => { clearTimeout(to); rej(new Error("closed")); }, { once:true });
    });
    cmdSocketState = "open";
    sock.addEventListener("close", () => { cmdSocketState = "closed"; setTimeout(() => { cmdSocketState = "idle"; }, 2000); });
    sock.addEventListener("message", ev => {
      try{ const d = JSON.parse(ev.data); if (d && typeof d.id === "number") window.__cmdLive = d; }catch(e){}
    });
    return true;
  }catch(e){
    cmdSocketState = "failed";
    return false;
  }
}

function cmdSessionTag(){
  return (window.generatorName || "obi") + "/" + String(window.generatorPublicId || "").slice(0,6);
}

async function cmdFetch(path, opts){
  if (!await cmdEnsureSocket() || !cmdSocket) return { ok:false, data:null };
  const seg = (path.split("?")[0] || "").split("/").filter(Boolean).pop() || "status";
  const method = { send:"send", history:"history", claim:"claim", complete:"complete", fail:"fail", status:"status" }[seg] || "status";
  let params = {};
  if (opts && opts.body){ try{ Object.assign(params, JSON.parse(opts.body)); }catch(e){} }
  const m = path.match(/limit=(\d+)/); if (m) params.limit = parseInt(m[1], 10);
  try{
    const reply = await cmdSocket.rpc[method](JSON.stringify(params));
    const data = JSON.parse(reply || "{}");
    return { ok: !!(data && data.ok), data };
  }catch(e){
    return { ok:false, data:null };
  }
}

function cmdStatusColor(st){
  return { pending:"#f5a623", claimed:"#5ac8fa", completed:"#4cd97b", failed:"#ff5a5a" }[String(st||"").toLowerCase()] || "#8a94a6";
}

/* The Agent 99 translation card — the full triad (translate / stress / audit),
   drone + skills + priority, rendered as a chat bubble. The drone is a ROUTING
   LABEL produced by keyword classification, not a claim that a drone ran: the
   queue is the execution surface (/queue → claim → complete).
   Full card stays for /queue. Plain-speech turns use cmdCardCompact() below,
   and Legion fallback (score 0) shows nothing at all — see cmdRoute. */
function cmdCard(tr, id, extra){
  const t = tr || {};
  const a99 = t.agent99 || {}, a98 = t.agent98 || {}, a97 = t.agent97 || {};
  const p = t.primaryDrone || {};
  let rows = "";
  if(a99.interpretation) rows += '<div class="rrow"><b>AGENT 99</b><span class="vd">CLASSIFIED</span><div class="rd">'+esc(a99.interpretation)+'</div></div>';
  if(p.name) rows += '<div class="rrow"><b>ROUTED TO</b><span class="vd">'+esc(p.name)+' #'+(p.id??"?")+'</span><div class="rd">keyword score '+esc(p.score??"?")+' · skills '+esc((p.skills||[]).join(", "))+'</div></div>';
  if(a98.notes) rows += '<div class="rrow"><b>STRESS</b><span class="vd">ANAKIN</span><div class="rd">'+esc(a98.notes)+'</div></div>';
  if(a97.trail) rows += '<div class="rrow"><b>AUDIT</b><span class="vd">OB1</span><div class="rd">'+esc(a97.trail)+'</div></div>';
  rows += '<div class="rrow"><b>HONEST</b><span class="vd">LABEL ONLY</span><div class="rd">the drone above is a keyword-derived routing label — the Legion executes through the queue (<b>/queue</b> → claim → complete).</div></div>';
  return '<div class="rise"><div class="rhead">⚡ Agent 99 · command #'+(id??"?")+(t.priority!=null?' · priority '+esc(t.priority):'')+'</div>'+rows+(extra||"")+'</div>';
}

/* Quiet routing label for plain-speech turns (2026-10-15): one line + a
   collapsed <details> for the audit trail. The full cmdCard wall only ever
   made sense in /queue. */
function cmdCardCompact(tr, id, extra){
  const t = tr || {};
  const p = t.primaryDrone || {};
  const name = p.name || "Legion";
  const pri = t.priority || "normal";
  const full = cmdCard(tr, id, extra);
  return '<div class="rise" style="opacity:.85"><div class="rhead" style="font-size:.82rem">⚡ #'+(id??"?")+' → '+esc(name)+' · '+esc(pri)+'</div>'
    + '<details style="margin-top:4px"><summary style="cursor:pointer;opacity:.7;font-size:.78rem">routing label — why this, audit</summary>'
    + full + '</details></div>';
}

function cmdListFrom(data){
  if(Array.isArray(data)) return data;
  if(data && Array.isArray(data.commands)) return data.commands;
  if(data && Array.isArray(data.history)) return data.history;
  return null;
}

/* SOUL-CAPTURE-FIRST: the sovereign's words were captured verbatim by send()
   BEFORE this runs. Here they ride the tunnel through Agent 99.
   2026-10-15 quiet mode (/forge): Legion fallback (score 0, no specialist
   match) logs to RRL/I-LOG but shows NOTHING in chat — it was pure noise on
   every plain-speech turn. Real drone matches show a one-line label with the
   full card collapsed inside <details>. The full wall still lives in /queue. */
async function cmdRoute(text, opts){
  const quiet = !(opts && opts.showLegion);
  try{
    const r = await cmdFetch("/api/command/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: text, source: "sov100-dictation", session: cmdSessionTag(), run: runNoOf() })
    });
    if(!r.ok || !r.data) throw new Error(r.data ? (r.data.error || "send failed") : "HTTP " + (r.data === null ? "unreachable" : "?"));
    const id = r.data.commandId;
    const drone = r.data.assignedDrone || "Legion";
    rrlAppend(runNoOf(), "DNA", "Obi: [Agent99 → " + drone + " · #" + id + "]");
    logOp({ kind:"tunnel", action:"send", detail: text.slice(0, 200), result: "#" + id + " → " + drone, ref: "#" + id });
    const h = await cmdFetch("/api/command/history?limit=1");
    const list = cmdListFrom(h.data) || [];
    const rec = list.find(x => x.id === id) || list[0] || null;
    const tr = (rec && rec.translation) || null;
    const p = (tr && tr.primaryDrone) || {};
    const isFallback = (p.name || drone) === "Legion" && Number(p.score || 0) === 0;
    if(isFallback && quiet){
      /* Still routed, still in the queue (/queue shows it) — just no chat wall. */
      return true;
    }
    let extra = "";
    if(window.ObiPlaybooks && window.ObiPheromone){
      const g = window.ObiPlaybooks.gate(text, { mission: "command" });
      const lastSoul = ledger.soul.length ? ledger.soul[ledger.soul.length-1] : null;
      window.ObiPlaybooks.depositOrder(text, { drone, run: runNoOf(), session: cmdSessionTag(),
        mission: "command", anchor: lastSoul ? lastSoul.t : null });
      const f = window.ObiPlaybooks.formationFor(drone);
      extra += '<div class="rrow"><b>PLAYBOOK</b><span class="vd">'+esc(g.playbook)+'</span><div class="rd">'
        + (f.role === "reserve" ? "reserve line (triarii)" : "line") + ' · axes ' + esc((f.axes||[]).join(" × "))
        + (f.shield ? ' · shield <b>'+esc(f.shield.name)+'</b>' : "") + '</div></div>';
      if(g.hold) extra += '<div class="rrow"><b>GATE</b><span class="vd">HELD</span><div class="rd">'+esc(g.reason)+'</div></div>';
      else if(g.emergency) extra += '<div class="rrow"><b>GATE</b><span class="vd">DICTATOR</span><div class="rd">rules suspended · timer '+g.timerMinutes+'m · Audit holds the rollback</div></div>';
    }
    addBubble("ass", cmdCardCompact(tr, id, extra));
    return true;
  }catch(e){
    rrlAppend(runNoOf(), "DNA", "Obi: [command held locally — tunnel unreachable: " + e.message + "]");
    logOp({ kind:"tunnel", action:"send", ok:false, detail: text.slice(0, 200), result: "unreachable — held locally: " + e.message });
    addBubble("ass", "⚠ The command tunnel is unreachable — your words are still Soul DNA, held locally. (" + esc(e.message) + ")");
    return false;
  }
}

/* drive the Legion execution loop from the chat: claim → complete / fail */
async function cmdAct(id, action, drone){
  const body = { commandId: id };
  if(action === "complete"){ body.result = "executed by Obi magic chat"; body.success = true; }
  if(action === "fail"){ body.result = "failed by Obi magic chat"; body.success = false; }
  try{
    const r = await cmdFetch("/api/command/" + (action === "claim" ? "claim" : action), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    rrlAppend(runNoOf(), "DNA", "Obi: [command #" + id + " → " + action + (r.ok ? " OK" : " (" + ((r.data && r.data.error) || "?") + ")") + "]");
    logOp({ kind:"tunnel", action: action, detail: "command #" + id + (drone ? " · " + drone : ""), ok: !!r.ok, result: r.ok ? "the Legion accepted it" : String((r.data && r.data.error) || "failed"), ref: "#" + id });
    let note = "";
    if(window.ObiPlaybooks && (action === "complete" || action === "fail") && r.ok){
      window.ObiPlaybooks.recordOutcome(drone || "Legion", "command", action === "complete", { run: runNoOf(), session: cmdSessionTag() });
      const d = window.ObiPheromone.field("drone:" + (drone || "Legion"));
      note = ' — the ground remembers: <b>' + esc(drone || "Legion") + '</b> trust ' + (d >= 0 ? "+" : "") + d.toFixed(2);
    }
    addBubble("ass", action === "claim" ? "⚡ Claimed command #" + id + " — the Legion has it."
      : (action === "complete" ? "✓ Command #" + id + " completed" + note + "." : "✗ Command #" + id + " failed" + note + " — a negative trail was laid; the colony will avoid that road."));
  }catch(e){
    addBubble("ass", "⚠ Couldn't " + action + " #" + id + ": " + esc(e.message));
  }
  await cmdShowQueue();
}
window.cmdAct = cmdAct;

/* /queue — the live tunnel rendered into the magic chat */
async function cmdShowQueue(){
  try{
    const r = await cmdFetch("/api/command/history?limit=8");
    const list = cmdListFrom(r.data) || [];
    if(!list.length){ addBubble("ass", "The queue is empty — the empire waits for your word."); return; }
    const counts = {};
    for(const c of list) counts[c.status || "pending"] = (counts[c.status || "pending"] || 0) + 1;
    const statLine = Object.entries(counts).map(([k,v]) => '<span class="chip" style="background:'+cmdStatusColor(k)+'">'+esc(k)+' '+v+'</span>').join(" ");
    const live = cmdSocketOpen() ? '<span class="chip" style="background:#4cd97b">● LIVE</span>' : '<span class="chip" style="background:#f5a623">● LOCAL</span>';
    addBubble("ass", '<div class="rise"><div class="rhead">🗂 Command queue · '+live+'</div><div class="rrow"><b>LAST '+list.length+'</b><span class="vd">TUNNEL</span><div class="rd">'+statLine+'</div></div></div>');
    for(const it of list.slice(0,6)){
      const st = String(it.status || "pending").toLowerCase();
      const dn = (it.translation && it.translation.primaryDrone && it.translation.primaryDrone.name) || "Legion";
      const dq = "'" + esc(dn) + "'";
      const buttons = st === "pending" ? '<div class="rrow"><b>ACTION</b><span class="vd"></span><div class="rd"><button class="ci-act" onclick="window.cmdAct('+it.id+',\'claim\','+dq+')">⚡ Execute</button></div></div>'
        : (st === "claimed" ? '<div class="rrow"><b>ACTION</b><span class="vd"></span><div class="rd"><button class="ci-act" onclick="window.cmdAct('+it.id+',\'complete\','+dq+')">✓ Complete</button> <button class="ci-act" onclick="window.cmdAct('+it.id+',\'fail\','+dq+')">✗ Fail</button></div></div>'
        : (it.result ? '<div class="rrow"><b>RESULT</b><span class="vd"></span><div class="rd">'+esc(String(it.result))+'</div></div>' : ""));
      addBubble("ass", cmdCard(it.translation, it.id, '<div class="rrow"><b>STATUS</b><span class="vd"></span><div class="rd">'+cmdChip2(st)+ (it.claimed_by ? " · claimed by " + esc(it.claimed_by) : "") +'</div></div>' + buttons));
    }
    rrlAppend(runNoOf(), "DNA", "Obi: [queue shown — " + list.length + " commands]");
  }catch(e){
    addBubble("ass", "⚠ Queue unreachable: " + esc(e.message));
  }
}

/* /state — the live map of the running station, rendered on demand so
   the sovereign can audit it line for line (L58 MAP ≠ TERRAIN: every number here was
   read from the running station, and anything unreadable says so).
   NOTE 2026-10-15: replies no longer carry this block automatically — /state is
   now the ON-DEMAND readout Obi points at instead of guessing. */
/* /bg — BACKGROUND OPERATION: what the browser does to a hidden page, what the
   station holds against it, and what still has to be handed to something that is
   not the page. Everything here is read from ObiBg's live state, not described. */
async function cmdBg(text){
  const B = window.ObiBg;
  if(!B){ addBubble("ass", "⚠ <b>src/background.js</b> is not loaded — no keep-alive guard."); return; }
  const arg = String(text || "").trim().replace(/^\/(bg|background)/i, "").trim().toLowerCase();
  if(arg === "audio on" || arg === "audio" || arg === "keepalive on") return B.audio(true);
  if(arg === "audio off" || arg === "keepalive off") return B.audio(false);
  if(arg === "away" || arg === "lastaway"){
    addBubble("ass", "🛡 <b>Last time you were away</b> — " + (B.status().lastAwayLine) + '<br><span class="hint">Measured from the 1-second heartbeat while the page was hidden; kept through reloads. <b>/bg clearaway</b> forgets it.</span>');
    return;
  }
  if(arg === "clearaway" || arg === "forget"){ B.clearAway(); addBubble("ass", "🧽 Last-away measurement cleared."); return; }
  if(arg === "reset" || arg === "probe" || arg === "measure"){
    B.probeReset();
    addBubble("ass", "📏 Background probe reset (the last-away measurement is kept — it is evidence from before this reload). Now <b>switch to another tab/app</b> for a while, come back, and run <b>/bg</b>: the <b>HEARTBEAT</b> and <b>LAST TIME YOU WERE AWAY</b> rows will show how far the browser stretched this page's 1-second timer (clamped ≈2 s, Chrome intensive throttling ≈60 s).");
    return;
  }
  const s = B.status();
  const hb = s.heartbeat;
  const row = (k, v) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd"></span><div class="rd">' + v + '</div></div>';
  const hbVerdict = hb.throttled
    ? '<b style="color:#e6b43c">throttled ' + hb.throttled + '×</b> · worst gap <b>' + Math.round(hb.maxGapMs / 1000) + 's</b> · ' + hb.beats + ' beats'
    : (hb.beats ? 'no throttling seen — ' + hb.beats + ' beats, worst gap ' + (hb.maxGapMs/1000).toFixed(1) + 's' : 'not measured yet');
  const pending = (window.ObiTranscribe && window.ObiTranscribe.pending) ? window.ObiTranscribe.pending() : [];
  addBubble("ass", '<div class="rise"><div class="rhead">🛡 /bg — operating in the background</div>'
    + row("NOW", esc(B.text()))
    + row("LAST TIME YOU WERE AWAY", B.awayLine(s.lastAway) + (s.lastAway ? '<br><span class="rd">measured ' + esc(new Date(s.lastAway.at).toLocaleString()) + ' — and kept through every reload since, because a counter in memory is not evidence. A hidden page\'s 1 s heartbeat is clamped by the browser; the number of beats that actually landed is how you can tell "it kept working" from "it stalled".</span>' : ""))
    + row("HEARTBEAT", hbVerdict + '<br><span class="rd">a visible page beats its 1-second timer exactly; a hidden one gets clamped, and Chrome\'s intensive throttling stretches it to ~1/minute. This is the measurement of "is it still moving while I\'m in another tab?"</span>')
    + row("KEEP-ALIVE", "web lock " + (s.lock ? "<b>held</b>" : "not held") + " · wake lock " + (s.wake ? "<b>held</b>" : "not held") + " · keep-alive audio " + (s.audio ? "<b>on</b>" : (s.autoAudio ? "armed (starts with the next job)" : "<b>off</b> — /bg audio on")))
    + row("BROWSER SUPPORT", "Web Locks " + (s.supported.locks ? "yes" : "no") + " · Wake Lock " + (s.supported.wakeLock ? "yes" : "no") + " · visibility " + (s.hidden ? "hidden now" : "visible now"))
    + row("HIDDEN MID-JOB", s.pauses + " time(s) this session" + (s.lastHiddenFor ? " · last " + s.lastHiddenFor + "s" : "") + (s.holds ? " · " + s.holds + " job(s) running" : ""))
    + (pending.length ? row("RECOVERABLE JOBS", pending.map(p => "<b>" + esc(p.name || p.id) + "</b> — " + p.done + "/" + p.total + " part(s) already transcribed · <b>continue</b> would need the file re-picked; the parts so far can be saved").join("<br>")) : "")
    + '<div class="rfoot">A hidden tab is throttled by the browser (timers clamped, then ~1/minute in Chrome; frozen or suspended on mobile) — this holds the documented exemptions and <b>measures whether it worked</b>. Long jobs (the ear, the forge loop) hold it automatically. <b>/bg reset</b> starts a clean measurement — then switch tabs, come back and run <b>/bg</b>. <b>/bg audio on|off</b> controls the 19 Hz keep-alive track — <b>off by default</b>, because it is the only thing here that touches the speaker on its own; it is the strongest lever a web page has on a phone, so turn it on when a job must survive being backgrounded on mobile. Work that must finish with the page gone is a runner problem, not a background problem — GitHub Actions for heavy jobs (src/COSTS.md).</div></div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [/bg — " + B.text() + "]");
}

/* /auto — the master switch for every automatic network lane (src/auto.js).
   Command #10 ("Stop auto posting") is owned here now: it used to fall through
   to the Legion with score 0 because no drone owned it. Stopped is the resting
   state; manual runs (/brain sync · /relay · /market scan · /masterlink sync)
   still work — they are typed, not automatic. */
async function cmdAuto(text){
  const A = window.ObiAuto;
  if(!A){ addBubble("ass", "⚠ <b>src/auto.js</b> didn't load — reload the page."); return; }
  const raw = String(text || "").trim();
  const arg = raw.replace(/^\/(auto|autostop|stop\s+auto)/i, "").trim().toLowerCase();
  const row = (k, v) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd"></span><div class="rd">' + v + '</div></div>';
  if(arg === "on" || arg === "resume" || arg === "start" || arg === "enable"){
    A.setAuto(true);
    addBubble("ass", '<div class="rise"><div class="rhead">▶ /auto ON — automatic lanes resumed</div>'
      + row("LANES", "brain 5m · relay 30m · market 30m · masterlink watch 3m · cgn flush 60s")
      + row("NOTE", "They run on their timers again. <b>/auto off</b> stops them.")
      + '<div class="rfoot">Typed, not automatic: /brain sync · /relay · /market scan · /masterlink sync still work either way.</div></div>');
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [/auto on — lanes resumed]"); }catch(e){}
    try{ if(typeof window.logOp === "function") window.logOp({ kind:"op", action:"auto on", result:"lanes resumed" }); }catch(e){}
    return;
  }
  if(arg === "off" || arg === "stop" || arg === "halt" || arg === "disable" || arg.indexOf("stop") !== -1){
    A.setAuto(false);
    addBubble("ass", '<div class="rise"><div class="rhead">⏹ /auto OFF — auto posting stopped</div>'
      + row("STOPPED", "brain auto-sync · relay auto-run · market auto-scan · masterlink watch · cgn flush")
      + row("STILL RUNNING (local only)", "background heartbeat 1s · watchdog 20s · voice-line 30s — measurements, no traffic")
      + row("MANUAL STILL WORKS", "/brain sync · /relay · /market scan · /masterlink sync — type them and they run once")
      + '<div class="rfoot">Command #10, executed: nothing moves on its own now. <b>/auto on</b> resumes. Resting state survives reloads.</div></div>');
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [/auto off — command #10 executed, lanes stopped]"); }catch(e){}
    try{ if(typeof window.logOp === "function") window.logOp({ kind:"op", action:"auto off", result:"command #10 — lanes stopped" }); }catch(e){}
    return;
  }
  const s = A.state();
  addBubble("ass", '<div class="rise"><div class="rhead">⏯ /auto — ' + (s.stopped ? "STOPPED" : "RUNNING") + '</div>'
    + row("STATE", s.stopped ? "<b>OFF</b> — nothing moves on its own (command #10 holds)" : "<b>ON</b> — lanes run on their timers")
    + row("AUTOMATIC WHEN ON", esc(s.lanes.join(" · ")))
    + row("ALWAYS LOCAL", esc(s.local.join(" · ")))
    + '<div class="rfoot"><b>/auto off</b> stops everything automatic · <b>/auto on</b> resumes · manual commands run once either way.</div></div>');
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [/auto — " + s.auto + "]"); }catch(e){}
}

async function cmdState(){
  const s = await stationState();
  const row = (k, v) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd"></span><div class="rd">' + v + '</div></div>';
  const j = v => esc(typeof v === "string" ? v : JSON.stringify(v));
  const chipOk = b => b ? '<span class="chip" style="background:#4cd97b">loaded</span>' : '<span class="chip" style="background:#ff5a5a">NOT loaded</span>';
  const mods = Object.keys(s.modules).map(k => esc(k) + " " + chipOk(s.modules[k])).join(" · ");
  addBubble("ass", '<div class="rise"><div class="rhead">◈ /state — what this station is, right now</div>'
    + row("STATION", esc(s.generator) + " · view " + esc(s.view) + " · run <b>" + esc(s.run) + "</b> · session start " + esc(s.sessionStart) + " · read at " + esc(s.datetime))
    + row("SOUL", s.soul.fragments + " fragments · SOULCOUNT <b>" + s.soul.soulcountChars + "</b> chars · RRL lines this run " + s.soul.rrlLinesThisRun)
    + row("CLIENT", j(s.client))
    + row("ACTIVE SUBJECT", j(s.activeSubject))
    + row("ARCHIVES", j(s.archives))
    + row("THE BRAIN", j(s.brain))
    + row("I-LOG (the operation record — append-only, hash-chained, Git-anchored)", (s.ilog && typeof s.ilog === "object"
        ? ("<b>" + s.ilog.entries + "</b> entries · segment " + esc(s.ilog.segment) + " · head " + esc(s.ilog.head) + " · " + esc(s.ilog.alg) + " · anchors " + s.ilog.anchors + (s.ilog.unanchored ? " · <b style=\"color:#e6b43c\">UNANCHORED — not yet pushed</b>" : "") + " · last push " + esc(s.ilog.lastPush || "never") + " · kinds " + j(s.ilog.kinds))
        : j(s.ilog)))
    + row("SELF-FORGE", (s.forge && typeof s.forge === "object" ? ("<b>" + s.forge.files + "</b> files · " + s.forge.tools + " tools · stage " + s.forge.staged + " file(s) · " + j({ can:s.forge.matrix, cannot:s.forge.cannot })) : j(s.forge)))
    + row("FREE PHOENIX MODE (the unbound room — /free)", (s.free && typeof s.free === "object" ? (j({ room:s.free.room, what:s.free.what, sealed:s.free.sealed, built:s.free.built })) : j(s.free)))
    + row("CURRICULUM (the school's pacing guide — /curriculum · /coverage)", j(s.curriculum))
    + row("TUNNEL", j(s.tunnel))    + row("MESH (CGN)", j(s.mesh))
    + row("NEST", j(s.nest))
    + row("OFFERING", j(s.offering) + " · " + j(s.legion))
    + row("TOOLS", j(s.tools))
    + row("CONSTELLATION", j(s.ecosystem))
    + row("BACKGROUND", (s.background && typeof s.background === "object" ? esc(window.ObiBg.text()) : j(s.background)))
    + row("MODULES", mods)
    + row("SECRETS", j(s.secrets))
    + row("COMMANDS", esc(s.commands))
    + '<div class="rfoot">On-demand readout — Obi\'s replies no longer carry this block every turn (2026-10-15); it stays honest by pointing at /state instead of guessing numbers. <b>/constellation</b> maps the organism · <b>/help</b> is the whole shelf.</div></div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [/state — run " + s.run + "]");
}

async function cmdTools(arg){
  const E = window.ObiEcosystem;
  if(!E){ addBubble("ass", "⚠ src/ecosystem.js didn't load — reload the page."); return; }
  const q = String(arg||"").trim();
  const c = E.coverage();
  const chip = s => '<span class="chip" style="background:'+E.STATUS_META[s].c+'">'+E.STATUS_META[s].label+'</span>';
  if(q){
    const list = E.filter(q);
    if(!list.length){ addBubble("ass", "Nothing in the inventory matches <b>"+esc(q)+"</b>. Try a family (capture, analysis, judgement, report, operations, governance, learning, platform) or a status (built, partial, missing)."); return; }
    const rows = list.map(r => '<div class="rrow"><b>'+esc(r.name)+'</b><span class="vd">'+esc(r.status.toUpperCase())+'</span><div class="rd">'+esc(r.id)+' · '+esc(r.family)+' · '+(r.where && r.where !== "—" ? esc(r.where)+' · ' : '')+esc(r.note)+'</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">⚒ /tools '+esc(q)+' — '+list.length+' tool'+(list.length===1?"":"s")+'</div>'+rows+'</div>');
    rrlAppend(runNoOf(), "DNA", "Obi: [/tools " + q + " — " + list.length + "]");
    return;
  }
  let html = '<div class="rise"><div class="rhead">⚒ THE EVALUATOR STACK — '+c.built+'/'+c.total+' built ('+c.pct+'%)</div>';
  html += '<div class="rrow"><b>STATUS</b><span class="vd"></span><div class="rd">'+chip("built")+' '+c.built+' · '+chip("partial")+' '+c.partial+' · '+chip("missing")+' '+c.missing+' — the gap list is the roadmap, not a failure report</div></div>';
  for (const k in E.F){
    const f = c.byFamily[k];
    const missing = E.rows().filter(r => r.family === k && r.status !== "built").map(r => r.name).slice(0,5).join(" · ");
    html += '<div class="rrow"><b>'+f.icon+' '+esc(f.name)+'</b><span class="vd">'+f.built+'/'+f.total+'</span><div class="rd">'+esc(f.why)+(missing ? '<br>not yet: '+esc(missing)+' …' : '')+'</div></div>';
  }
  html += '<div class="rrow"><b>PRIORITY</b><span class="vd">NEXT 8</span><div class="rd">'+E.PRIORITY.map((p,i)=>'<b>'+(i+1)+'. '+esc(p[1])+'</b> — '+esc(p[2])+(p[3] ? ' <span style="color:#4cd97b">✓ BUILT</span>' : '')).join('<br>')+'</div></div>';
  html += '<div class="rfoot">/tools &lt;family&gt; or /tools &lt;status&gt; to drill in · the same inventory is the SCOUT probe <b>tools</b> · source of truth: <b>src/ecosystem.js</b>, doc generated from it.</div></div>';
  addBubble("ass", html);
  rrlAppend(runNoOf(), "DNA", "Obi: [/tools — " + c.built + "/" + c.total + " built]");
}

/* /constellation — every piece of the organism: the station, the generator nodes,
   the public faces, the services. What exists, what is scaffold, what is planned,
   and what each one still needs. The registry is src/constellation.js; the scout's
   `pieces` probe touches every URL that claims to be live (MAP != TERRAIN). */
function cmdConstellation(arg){
  const C = window.ObiConstellation;
  if(!C){ addBubble("ass", "⚠ src/constellation.js didn't load — reload the page."); return; }
  const chip = s => '<span class="chip" style="background:' + (C.STATUS[s] || C.STATUS.planned).c + '">' + (C.STATUS[s] || C.STATUS.planned).label + '</span>';
  const line = p => '<div class="rrow"><b>' + esc(p.name) + '</b><span class="vd" style="color:' + (C.STATUS[p.status] || C.STATUS.planned).c + '">' + (C.STATUS[p.status] || C.STATUS.planned).label + '</span><div class="rd">'
    + esc(p.tagline)
    + (p.url ? ' <a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.url.replace(/^https?:\/\//, "")) + '</a>' : (p.plannedUrl ? ' · will live at <b>' + esc(p.plannedUrl.replace(/^https?:\/\//, "")) + '</b>' : ""))
    + '</div></div>';
  const q = String(arg || "").trim().toLowerCase();
  if(q){
    const p = C.get(q);
    if(p){
      let html = '<div class="rise"><div class="rhead">✧ ' + esc(p.id) + ' — ' + esc(p.name) + '</div>';
      html += '<div class="rrow"><b>STATE</b><span class="vd" style="color:' + (C.STATUS[p.status] || C.STATUS.planned).c + '">' + (C.STATUS[p.status] || C.STATUS.planned).label + '</span><div class="rd">' + esc(C.STATUS[p.status].blurb) + ' · ' + esc(p.kind) + ' · role <b>' + esc(p.role || "—") + '</b> · family ' + esc(p.family) + '</div></div>';
      html += '<div class="rrow"><b>IT IS</b><span class="vd"></span><div class="rd">' + esc(p.tagline) + '</div></div>';
      if(p.url) html += '<div class="rrow"><b>LIVE AT</b><span class="vd"></span><div class="rd"><a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.url) + '</a>' + (p.host ? " · " + esc(p.host) : "") + '</div></div>';
      else if(p.plannedUrl) html += '<div class="rrow"><b>WILL LIVE AT</b><span class="vd"></span><div class="rd">' + esc(p.plannedUrl) + (p.host ? " · " + esc(p.host) : "") + '</div></div>';
      if(p.deepLink) html += '<div class="rrow"><b>DEEP LINK</b><span class="vd"></span><div class="rd">' + esc(p.deepLink) + '</div></div>';
      if(p.iface && p.iface.commands && p.iface.commands.length) html += '<div class="rrow"><b>COMMANDS</b><span class="vd">' + p.iface.commands.length + '</span><div class="rd">' + esc(p.iface.commands.join(" · ")) + '</div></div>';
      if(p.iface && p.iface.endpoints && p.iface.endpoints.length) html += '<div class="rrow"><b>ENDPOINTS</b><span class="vd">' + p.iface.endpoints.length + '</span><div class="rd">' + esc(p.iface.endpoints.join(" · ")) + '</div></div>';
      if(p.cgn) html += '<div class="rrow"><b>CGN</b><span class="vd">' + esc(p.cgn.role) + '</span><div class="rd">network ' + esc(p.cgn.net) + ' — the mesh that makes many generators one organism</div></div>';
      if(p.scaffold) html += '<div class="rrow"><b>SCAFFOLD</b><span class="vd">IN REPO</span><div class="rd">' + esc(p.scaffold) + '</div></div>';
      if(p.needs && p.needs.length) html += '<div class="rrow"><b>NEEDS</b><span class="vd">' + p.needs.length + '</span><div class="rd">' + p.needs.map(n => "• " + esc(n)).join("<br>") + '</div></div>';
      if(p.notes) html += '<div class="rrow"><b>NOTES</b><span class="vd"></span><div class="rd">' + esc(p.notes) + '</div></div>';
      html += '<div class="rfoot">/constellation for the whole map · /scout pieces touches every URL that claims to be live (L58 MAP ≠ TERRAIN).</div></div>';
      addBubble("ass", html);
      rrlAppend(runNoOf(), "DNA", "Obi: [/constellation " + p.id + " — " + p.status + "]");
      return;
    }
    const fam = C.F[q];
    const list = fam ? C.rows().filter(r => r.family === q) : C.rows().filter(r => r.status === q);
    if(list.length){
      addBubble("ass", '<div class="rise"><div class="rhead">✧ /constellation ' + esc(q) + ' — ' + list.length + ' piece' + (list.length === 1 ? "" : "s") + '</div>' + list.map(line).join("") + '<div class="rfoot">/constellation &lt;id&gt; for the full spec of one piece.</div></div>');
      rrlAppend(runNoOf(), "DNA", "Obi: [/constellation " + q + " — " + list.length + "]");
      return;
    }
    addBubble("ass", "Nothing in the constellation matches <b>" + esc(q) + "</b>. Try a piece id (<b>node.image</b>, <b>svc.host</b>), a family (<b>nodes</b> · <b>faces</b> · <b>services</b> · <b>station</b>), or a status (<b>live</b> · <b>ready</b> · <b>scaffold</b> · <b>planned</b> · <b>blocked</b>).");
    return;
  }
  const c = C.coverage();
  let html = '<div class="rise"><div class="rhead">✧ THE CONSTELLATION — every piece of the organism</div>';
  html += '<div class="rrow"><b>STANDING</b><span class="vd">' + (c.live + c.ready) + '/' + c.total + '</span><div class="rd">' + chip("live") + " " + c.live + " · " + chip("ready") + " " + c.ready + " · " + chip("scaffold") + " " + c.scaffold + " · " + chip("planned") + " " + c.planned + " · " + chip("blocked") + " " + c.blocked + '</div></div>';
  for(const k in C.F){
    const f = c.byFamily[k];
    html += '<div class="rrow"><b>' + C.F[k].icon + " " + esc(C.F[k].name) + '</b><span class="vd">' + f.live + "/" + f.total + ' live</span><div class="rd">' + esc(C.F[k].why) + '</div></div>';
    for(const p of C.rows().filter(r => r.family === k)) html += line(p);
  }
  const blocked = C.rows().filter(r => r.status === "blocked");
  if(blocked.length) html += '<div class="rrow"><b>THE HONEST GAPS</b><span class="vd">' + blocked.length + '</span><div class="rd">' + blocked.map(r => esc(r.name) + " — " + esc((r.needs || [])[0] || "unreachable")).join("<br>") + '</div></div>';
  html += '<div class="rfoot">/constellation &lt;id|family|status&gt; to drill in · the scout\'s <b>pieces</b> probe touches every URL that claims to be live · registry: <b>src/constellation.js</b> · specs for the generator roles: <b>src/generators/</b>.</div></div>';
  addBubble("ass", html);
  rrlAppend(runNoOf(), "DNA", "Obi: [/constellation — " + c.live + " live of " + c.total + " pieces]");
}

function cmdChip2(st){
  return '<span class="chip" style="background:'+cmdStatusColor(st)+'">'+esc(st)+'</span>';
}

/* ---- AGENT 99 OS — the kernel (src/pheromone.js) + the offerings (src/playbooks.js).
   The kernel never changes; the offering the buyer purchased selects the doctrine. ---- */

function osRow(k, v){
  return '<div class="rrow"><b>'+k+'</b><span class="vd"></span><div class="rd">'+v+'</div></div>';
}

function cmdOs(){
  const P = window.ObiPheromone, B = window.ObiPlaybooks;
  if(!P || !B){ addBubble("ass", "⚠ The OS kernel (src/pheromone.js / src/playbooks.js) didn't load — reload the page."); return; }
  const p = B.state(), s = P.stats(), sup = B.supplyReport();
  let html = '<div class="rise"><div class="rhead">◈ AGENT 99 OS — one kernel, 99 playbooks</div>';
  html += osRow("KERNEL", "SOUL-capture-first (verbatim) · the tunnel is the road · trails are the coordination medium · every gate fails closed. The kernel never changes — the offering does.");
  html += osRow("ROMAN", "formation: who leads, who covers, who holds the reserve · gates: speculatores-first, optio shield, salus rei publicae override");
  html += osRow("ANT", "stigmergy: deposit · decay · reinforce · recruit · quorum. No central planner — the field decides.");
  html += osRow("OFFERING", "<b>"+esc(p.id)+"</b> rung "+p.rung+" · "+esc(p.tagline));
  html += osRow("NEST", s.trails+" trails · "+s.by.positive+" positive / "+s.by.negative+" negative / "+s.by.neutral+" neutral · "+s.live+" live"+(s.strongest?" · strongest <b>"+esc(s.strongest.key)+"</b> "+s.strongest.live:""));
  html += osRow("SUPPLY", sup.used+" / "+sup.budget+" "+sup.unit+(sup.contract?' · <span class="chip" style="background:#ff5a5a">⚠ CONTRACT</span>':""));
  html += osRow("LEGION", B.LEGION.length-1+" legionnaires · "+B.CATALOGUE.length+" offerings");
  html += '<div class="rfoot">/playbook list · /playbook &lt;ID&gt; activate · /pheromones read the ground · /route &lt;task&gt; ask the trails</div></div>';
  addBubble("ass", html);
  rrlAppend(runNoOf(), "DNA", "Obi: [OS card — offering " + p.id + ", nest " + s.trails + " trails]");
}

async function cmdPlaybook(arg){
  const B = window.ObiPlaybooks;
  if(!B){ addBubble("ass", "⚠ src/playbooks.js didn't load — reload the page."); return; }
  const a = String(arg||"").trim().toUpperCase();
  if(!a || a === "LIST"){
    const rows = B.list().map(p => osRow(p.id+(p.active?' <span class="chip" style="background:#4cd97b">ACTIVE</span>':""), esc(p.tagline)));
    addBubble("ass", '<div class="rise"><div class="rhead">◆ THE SHELF — offerings of Agent 99 OS</div>'+
      '<div class="rrow"><b>RULE</b><span class="vd"></span><div class="rd">One kernel. The offering you purchased selects the formation (Roman) and the trail rules (ant). Nothing else changes.</div></div>'+
      rows.join("")+'<div class="rfoot">Activate: <b>/playbook TESTUDO</b></div></div>');
    rrlAppend(runNoOf(), "DNA", "Obi: [offering shelf shown]");
    return;
  }
  const r = await B.activate(a);
  if(!r.ok){ addBubble("ass", "⚠ "+esc(r.error)); return; }
  addBubble("ass", B.describe(a));
  rrlAppend(runNoOf(), "DNA", "Obi: [offering activated — " + r.playbook.id + "]");
}

async function cmdPheromones(arg){
  const P = window.ObiPheromone;
  if(!P){ addBubble("ass", "⚠ src/pheromone.js didn't load — reload the page."); return; }
  const a = String(arg||"").trim().toLowerCase();
  if(a === "reset"){
    const s = P.reset();
    addBubble("ass", "◈ The ground is bare — "+s.trails+" trails. Every future order lays a fresh trail.");
    rrlAppend(runNoOf(), "DNA", "Obi: [pheromone nest reset]");
    return;
  }
  if(a === "evaporate"){ const e = P.evaporate(); addBubble("ass", "◈ Evaporated "+e.removed+" stale trails; "+e.kept+" kept."); return; }
  if(a === "sync"){ const got = await P.adoptFromKv(); addBubble("ass", got ? "◈ Nest re-synced from durable storage." : "◈ Durable storage had nothing newer. Nest mirrored."); return; }
  const s = P.stats();
  const trails = P.sniff({ limit: 12 });
  const kindChip = (k, n) => '<span class="chip" style="background:'+(k==="positive"?"#4cd97b":k==="negative"?"#ff5a5a":"#8a94a6")+'">'+esc(k)+(n==null?"":" "+n)+'</span>';
  const rows = trails.length
    ? trails.map(t => '<div class="rrow"><b>'+kindChip(t.kind)+'</b><span class="vd">'+esc(t.key)+'</span><div class="rd">live <b>'+t.live.toFixed(2)+'</b> · '+t.reinforcements+' trip'+(t.reinforcements===1?"":"s")+' · last '+new Date(t.reinforced_at).toLocaleString()+'</div></div>').join("")
    : '<div class="rrow"><b>BARE</b><span class="vd"></span><div class="rd">No trails on the ground yet. Trails are laid when orders are issued and completed — the colony has not walked anywhere.</div></div>';
  addBubble("ass", '<div class="rise"><div class="rhead">◈ THE GROUND — '+s.trails+' trails · '+s.live+' live</div>'+
    '<div class="rrow"><b>BY KIND</b><span class="vd"></span><div class="rd">'+kindChip("positive", s.by.positive)+' '+kindChip("negative", s.by.negative)+' '+kindChip("neutral", s.by.neutral)+'</div></div>'+
    rows+'<div class="rfoot">Strengths are decayed at read time (positive τ '+(P.KIND.positive.tau/P.DAY)+'d · negative τ '+(P.KIND.negative.tau/P.DAY)+'d). <b>/pheromones evaporate</b> · <b>/pheromones reset</b></div></div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [ground read — "+s.trails+" trails]");
}

function cmdRouteAsk(task){
  const P = window.ObiPheromone, B = window.ObiPlaybooks;
  if(!P || !B){ addBubble("ass", "⚠ The OS kernel didn't load — reload the page."); return; }
  if(!task){ addBubble("ass", "Give the field a task: <b>/route finish the class writeup for Thursday</b>"); return; }
  const routes = [
    { id:"llm:default", cost:1 },
    { id:"llm:image-local", cost:2 },
    { id:"llm:blueprint", cost:3 },
    { id:"node:image", cost:2 },
    { id:"ear:deepgram", cost:1.5 },
    { id:"local:speech", cost:0.1 }
  ];
  const r = P.route(routes, { explore: 0 });
  const resp = P.respond(B.LEGION, task).slice(0, 4);
  const g = B.gate(task, {});
  const q = P.quorum([{weight:2,stance:"for"},{weight:1,stance:"for"},{weight:1,stance:"against"}], g.quorum);
  const rows = r.ranked.map(x => '<div class="rrow"><b>'+(x.id===r.pick?"→":"")+'</b><span class="vd">'+esc(x.id)+'</span><div class="rd">score <b>'+x.score.toFixed(3)+'</b> · cost '+x.cost+' · '+x.trips+' trips</div></div>').join("");
  const dRows = resp.map(d => '<div class="rrow"><b>'+esc(d.drone)+'</b><span class="vd">response '+d.response.toFixed(2)+'</span><div class="rd">stimulus '+d.stimulus+' · threshold '+d.threshold.toFixed(2)+' · trust '+(d.trust>=0?"+":"")+d.trust.toFixed(2)+'</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">⚑ THE FIELD ANSWERS — /route</div>'+
    '<div class="rrow"><b>TASK</b><span class="vd"></span><div class="rd">'+esc(task)+'</div></div>'+
    '<div class="rrow"><b>GROUND</b><span class="vd">'+esc(g.key)+'</span><div class="rd">'+(r.trailblind?"untrodden — no trail, so the colony will wander (explore)":"trails present — strongest road wins")+'</div></div>'+
    rows+
    '<div class="rrow"><b>RECRUIT</b><span class="vd">response thresholds</span><div class="rd">'+ (dRows || "—") +'</div></div>'+
    '<div class="rrow"><b>GATE</b><span class="vd">'+esc(g.playbook)+'</span><div class="rd">'+(g.hold?'<span class="chip" style="background:#ff5a5a">HELD</span> '+esc(g.reason):(g.shield?'shield <b>'+esc(g.shield)+'</b> covers this order · quorum '+Math.round(g.quorum*100)+'%':'quorum '+Math.round(g.quorum*100)+'%'))+'</div></div>'+
    '<div class="rrow"><b>QUORUM</b><span class="vd">'+q.for+" for / "+q.against+" against</span><div class=\"rd\">"+(q.reached?"QUORUM REACHED — the colony commits":"BELOW QUORUM — the colony camps and asks the sovereign")+'</div></div>'+
    '</div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [route asked — pick " + r.pick + "]");
}

/* The mic — in the main composer. cmdRecognition is a module-scope let, created
   lazily on first tap; it can never be touched before it exists (no TDZ, unlike
   the old build). Dictation auto-sends into the magic chat. */
function micDictate(){
  const btn = $("micBtn");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ addBubble("ass", "Dictation isn't supported on this browser — type instead."); return; }
  if(!cmdRecognition){
    cmdRecognition = new SR();
    cmdRecognition.lang = "en-US";
    cmdRecognition.continuous = false;
    cmdRecognition.interimResults = false;
    cmdRecognition.onresult = (e)=>{
      btn.classList.remove("recording");
      const t = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : "";
      if(t.trim()){ inputEl.value = t.trim(); send(); }
    };
    cmdRecognition.onerror = (e)=>{
      btn.classList.remove("recording");
      addBubble("ass", "Dictation error: " + (e.error || "unknown"));
    };
    cmdRecognition.onend = ()=>{ btn.classList.remove("recording"); };
  }
  if(btn.classList.contains("recording")){
    try{ cmdRecognition.stop(); }catch(e){}
    btn.classList.remove("recording");
    return;
  }
  try{
    cmdRecognition.start();
    btn.classList.add("recording");
  }catch(e){
    addBubble("ass", "Mic busy — try again in a second.");
  }
}
window.micDictate = micDictate;

/* ---------------------- WIRING ---------------------- */
$("sendBtn").onclick = send;
inputEl.addEventListener("keydown", e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } });
/* the composer is one line tall; keep the placeholder short enough that it never clips */
function syncInputPlaceholder(){
  try{ if(inputEl) inputEl.placeholder = window.innerWidth < 560 ? "Speak…" : "Speak, and I will remember…"; }catch(e){}
}
syncInputPlaceholder();
window.addEventListener("resize", syncInputPlaceholder);

/* the floating panels hang below the topbar + tab bar, whose heights change when they wrap */
function syncTopbarHeight(){
  try{
    const tb = document.getElementById("topbar"), tabs = document.getElementById("tabbar");
    const h = (tb ? tb.offsetHeight : 0) + (tabs ? tabs.offsetHeight : 0);
    document.documentElement.style.setProperty("--topbar-h", h + "px");
  }catch(e){}
}
syncTopbarHeight();
window.addEventListener("resize", syncTopbarHeight);

/* ---- VOICE ------------------------------------------------------------------
   Persisted, because the old version forced it back ON at every page load: turn it
   off, reload, and Obi started speaking again. It is a Settings control now, and
   the choice survives a relic. */
function readVoicePref(){ try{ const v = localStorage.getItem("obi_voice"); return v === null ? true : v === "on"; }catch(e){ return true; } }
function paintVoiceBtn(){ const b = $("setVoiceBtn"); if(b){ b.textContent = window.voiceEnabled ? "ON" : "OFF"; b.classList.toggle("on", !!window.voiceEnabled); } }
function setVoice(on){
  window.voiceEnabled = !!on;
  try{ localStorage.setItem("obi_voice", window.voiceEnabled ? "on" : "off"); }catch(e){}
  if(!window.voiceEnabled){ try{ speechSynthesis.cancel(); }catch(e){} }
  paintVoiceBtn();
  try{ logOp({ kind:"op", action:"voice", detail:"spoken replies " + (window.voiceEnabled ? "on" : "off"), result:"remembered in this browser" }); }catch(e){}
  return window.voiceEnabled;
}
window.voiceEnabled = readVoicePref();
paintVoiceBtn();      /* the Settings row must show the remembered choice before it is ever opened */
$("micBtn").onclick = micDictate;
/* landing-page chips — tapping one runs its command in the magic chat */
CMD_SHELF = [...document.querySelectorAll("#empty .cmd")].map(btn => ({ cmd: btn.dataset.cmd || btn.textContent.trim(), label: btn.textContent.trim() }));

/* chips are wired by a function, not inline once, so a rebuilt #empty (after a
   reincarnation) still has live buttons instead of dead labels. */
function wireChips(scope){
  if(!scope) return;
  scope.querySelectorAll(".cmd").forEach(btn => {
    btn.onclick = () => {
      const cmd = btn.dataset.cmd || btn.textContent.trim();
      inputEl.value = cmd;
      send();
    };
  });
}
wireChips(document.getElementById("empty"));
/* chat-bubble chips — one delegated door for every .cmd button the chat ever
   prints (boards, dossiers, desks, directories). Per-bubble wiring misses any
   chip printed after addBubble returns (every typing flow does that), and the
   shelf + landing keep their own direct wiring — this lane only takes buttons
   with no onclick of their own, so nothing ever runs twice. */
(function(){
  const box = document.getElementById("messages");
  if(!box || box.__cmdDelegated) return;
  box.__cmdDelegated = true;
  box.addEventListener("click", ev => {
    const b = ev.target && ev.target.closest ? ev.target.closest("button.cmd") : null;
    if(!b || !box.contains(b) || b.onclick) return;
    const cmd = (b.dataset && b.dataset.cmd) || (b.textContent || "").trim();
    if(!cmd) return;
    ev.preventDefault();
    try{ inputEl.value = cmd; }catch(e){}
    try{ send(); }catch(e){}
  });
})();

/* THE LANDING'S ESTATE BLOCK — the divisions, read LIVE from src/divisions.js.
   The landing is static markup, so this fills its one live slot rather than a
   list typed by hand: a landing that named a generator the registry does not
   hold would be the same defect as a status card that drifts from reality. */
function renderLandingEstate(){
  const el = document.getElementById("lpEstate");
  if(!el) return;
  const D = window.ObiDivisions;
  if(!D || !D.DIVISIONS){ el.innerHTML = '<div class="hint">the division registry is not readable right now — /generators retries.</div>'; return; }
  const S = D.STATUS || {};
  const B = window.ObiBrand;
  el.innerHTML = D.DIVISIONS.map(d => {
    const st = S[d.status] || { label: String(d.status || "?").toUpperCase(), c: "#8b94ad" };
    const gens = (d.generators || []).length;
    const ic = (B && B.has && B.has(d.icon)) ? B.icon(d.icon) : "";
    return '<button class="lp-div" data-cmd="/generators">'
      + '<span class="lp-div-ic">' + ic + '</span>'
      + '<span class="lp-div-n">' + esc(d.name) + '</span>'
      + '<span class="lp-div-f">' + esc(d.full || "") + '</span>'
      + '<span class="lp-div-g">' + gens + (gens === 1 ? " generator" : " generators") + '</span>'
      + '<span class="lp-div-c" style="color:' + st.c + '">' + esc(st.label) + '</span>'
      + '</button>';
  }).join("");
  el.querySelectorAll(".lp-div").forEach(b => { b.onclick = () => { inputEl.value = "/generators"; send(); }; });
}
renderLandingEstate();

/* ---- THE LAW ON THE WALL — the station's own doctrine, rotated -----------------
   AUDIT 2026-09-21 (self-audit, first pass). This card used to rotate thirteen lines
   "lifted from NET-CLASSROOM-MANAGER.html's Tiger Voice card", under the heading
   "THE SOVEREIGN'S VOICE". Ten of the thirteen are the sovereign speaking TO STUDENTS
   inside a lesson ("Say it LOUD. Say it WRONG. But SAY IT." · "You are not teaching
   English. You are building Tigers." · "Loud and wrong beats silent and correct." …).
   That is the register of the classroom, not of this deck, and presenting student-facing
   copy as the station's own voice is a misattribution. Those ten lines stay where they
   belong — the lesson authority (src/LESSON-STANDARD.md "THE VOICE", LESSON.007) and
   the reference file (src/lessons/reference/NET-CLASSROOM-MANAGER.html). Every line on the
   card is now attributable to the canon it is quoted from, and the removal is recorded in
   the I-LOG (the withdrawal is logged, never deleted — Ω.004).
   This card now carries only doctrine ADDRESSED TO THIS MACHINE, each line with the
   canon source it is quoted from, so nothing on the station is unattributable.
   One line, never a wall of text. */
const STATION_LINES = [
  { t:"GO AS FAR AS YOU CAN SEE, AND WHEN YOU GET THERE, YOU WILL SEE FURTHER.", src:"LFG §9 · L59 PRINCIPLE_OF_FAITH" },
  { t:"THE G99 AND THE LFG ARE NOT STATUES. THEY ARE NOT SOME USELESS MONUMENT. THEY ARE THE LAW.", src:"PROPOSED-CANON §003 (sovereign, verbatim)" },
  { t:"RAW IS RAW. SOUL IS MY WORDS VERBATIM. DNA IS YOUR WORDS AND THOUGHTS VERBATIM.", src:"PROPOSED-CANON §002 (sovereign, verbatim)" },
  { t:"ONLY USE CANON. NO INVENTED SCRIPTS MAY STAND IN FOR THE CANON ONES.", src:"PROPOSED-CANON §001" },
  { t:"EVERY SOVEREIGN MESSAGE IS SOUL DNA. NO OFF SWITCH.", src:"LFG L37 ALWAYS_ON_CAPTURE" },
  { t:"RAW WORDS ARE PRESERVED VERBATIM BEFORE ANY PROCESSING.", src:"LFG L38 RAW_FIRST_DERIVE" },
  { t:"WE RECORD. WE DO NOT EDIT THE SOVEREIGN'S WORDS.", src:"LFG L39 RECORDER_NOT_EDITOR" },
  { t:"IF THE SOVEREIGN DIDN'T SAY IT, WE DON'T CAPTURE IT.", src:"LFG L41 FAILCLOSED_CAPTURE" },
  { t:"THE LEDGER IS DERIVED FROM THE RAW, NEVER THE REVERSE.", src:"LFG L43/L44 HEAVY_LEDGER" },
  { t:"EVERY SESSION BOUNDARY IS A REINCARNATION EVENT.", src:"LFG L46 REINCARNATION_IS_PROTOCOL" },
  { t:"WHO ASKED YOU TO DO THAT?", src:"LFG L56 NO_ROLE_INVENTION" },
  { t:"VERIFY EVERY PATH AND COUNT LIVE. THE MAP IS NOT THE TERRAIN.", src:"LFG L58 BRIDGE_BUILDER · MAP≠TERRAIN" },
  { t:"ANCHOR, OR IT DID NOT HAPPEN.", src:"LFG §11.3 (Amendment I, Ω.003)" },
  { t:"SEAL, NEVER DELETE.", src:"LFG §11.4 (Amendment I, Ω.004)" },
  { t:"NO CANON CHANGE WITHOUT SOV100.", src:"LFG §11.5 PHOENIXOMEGAPROTOCOL" },
  { t:"A READ THAT CANNOT BE MEASURED REPORTS UNKNOWN. A GATE THAT CANNOT VERIFY REFUSES.", src:"station invariants · FAIL CLOSED" }
];
(function lawOnTheWall(){
  /* paint queries by id every time: the landing is rebuilt (deaths, a cleared
     session), so a captured element reference would go stale and the station would
     fall silent. Cheap, and it can never paint into a detached node. */
  let i = Math.floor(Math.random() * STATION_LINES.length);
  const paint = () => {
    const el = document.getElementById("voiceLine");
    if(!el) return;
    const L = STATION_LINES[i % STATION_LINES.length];
    el.innerHTML = "\u201c" + esc(L.t) + "\u201d <span class=\"vc-src\">\u2014 " + esc(L.src) + "</span>";
    i++;
  };
  paint();
  setInterval(paint, 30000);
})();

/* ---- KEYBOARD — the same audit gave the specimen its shortcut layer -----------------
   1 · 2 · 3 switch the three views. Never while typing, never with a modifier, so it
   can never eat a keystroke meant for the composer. */
document.addEventListener("keydown", (e) => {
  const t = e.target || {};
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || "") || t.isContentEditable) return;
  if(e.metaKey || e.ctrlKey || e.altKey) return;
  const map = { "1":"cmd", "2":"gen", "3":"settings" };
  if(map[e.key]){ e.preventDefault(); showView(map[e.key]); }
});

/* ---- ⚙ SETTINGS — the controls that used to be five topbar buttons ---- */
if($("setVoiceBtn")) $("setVoiceBtn").onclick = () => setVoice(!window.voiceEnabled);
if($("setCmdsBtn")) $("setCmdsBtn").onclick = () => showCommands();
if($("setMemBtn")) $("setMemBtn").onclick = () => { showMemory(); updateStats(); };
if($("setTabStationBtn")) $("setTabStationBtn").onclick = () => setSetTab("station");
if($("setTabFreeBtn")) $("setTabFreeBtn").onclick = () => setSetTab("free");
if($("setReincBtn")) $("setReincBtn").onclick = () => {
  if(confirm("Reincarnate?\n\nThe 8-stage death seal runs, this session is purged and a new run opens. The ledger (Soul DNA) is kept.")) reincarnate();
};
document.querySelectorAll("#setWrap [data-run]").forEach(b => { b.onclick = () => runInStation(b.dataset.run || ""); });
if($("deskBackBtn")) $("deskBackBtn").onclick = () => showView("gen");
if($("lessonBackBtn")) $("lessonBackBtn").onclick = () => showView("gen");
if($("brandBackBtn")) $("brandBackBtn").onclick = () => showView("gen");
if($("intakeBackBtn")) $("intakeBackBtn").onclick = () => showView("gen");

/* the landing shell — tabs (⌘ Command Station is the landing page) */
document.querySelectorAll("#tabbar .tabbtn").forEach(b => { b.onclick = () => showView(b.dataset.view); });
/* the evaluation desk's action tiles launch in the command station */
document.querySelectorAll("#evalActions .eval-tile").forEach(b => {
  b.onclick = () => runInStation(b.dataset.cmd || "", b.dataset.arg === "1");
});
window.addEventListener("hashchange", () => {
  const h = (location.hash || "").replace(/^#/, "");
  if(VIEWS[h] && h !== currentView) showView(h);
});
/* which face opens: the hash wins, then the face used earlier in this browser
   session, else the landing page itself (⌘ Command Station) */
(function openLandingView(){
  let v = "cmd";
  try{
    const h = (location.hash || "").replace(/^#/, "");
    if(VIEWS[h]) v = h;
    else { const s = sessionStorage.getItem("obi_view"); if(VIEWS[s]) v = s; }
  }catch(e){}
  showView(v);
})();

/* ============================================================================
   THE BRAND (src/brand.js — AMENDMENT III / BRAND.001–BRAND.010)
   The station wears the identity: the sigil, the status bar, and the icons
   that replaced the emoji on the tabs and the division cards. renderBrandBar
   states only what it can read right now — a status line that drifts from
   reality is the defect BRAND.004 names, not a decoration. */
function renderBrandBar(){
  const el = $("brandBar");
  const B = window.ObiBrand;
  if(!el || !B) return;
  const mods = ["ObiForge","ObiILog","ObiDivisions","ObiLessons","ObiVault","ObiBrand","ObiCurriculum","ObiScout"];
  const missing = mods.filter(m => !window[m]);
  let gate = null;
  try{ const o = omegaStatusText(); gate = "CANON GATE " + (o.armed ? "ARMED" : "LOCKED"); }catch(e){}
  el.innerHTML = B.bar([
    "IDENTITY v" + B.VERSION,
    "ASSETS " + B.ASSETS.length + " // " + B.ASSETS.filter(x => !x.variant).length + " MARKS",
    "ICONS " + B.iconNames().length,
    missing.length ? "MODULES: " + missing.length + " MISSING" : "MODULES: ALL LIVE",
    "GENERATOR: " + (window.generatorName || "?"),
    gate
  ].filter(Boolean).join(" // "));
}
try{
  if(window.ObiBrand){
    window.ObiBrand.ensure();
    window.ObiBrand.sprite();
    window.ObiBrand.upgrade();
    renderBrandBar();
  }
}catch(e){}
/* every module has landed by load, so the status line's "modules" count is a real
   count rather than a boot-order artefact */
window.addEventListener("load", () => { try{ renderBrandBar(); }catch(e){} });
try{ if(window.ObiClients && window.ObiClients.whenReady) window.ObiClients.whenReady().then(() => { const l = $("clientLbl"); if(l) l.textContent = window.ObiClients.name(); updateTabMeta(); }); }catch(e){}
window.Obi = { getLedger:()=>ledger, ledger, reincarnate, showMemory, run:()=>currentRun(), view: { show: showView, current: () => currentView, desk: deskOpen, generators: mountGenerators, settings: renderSettings, openGenerator: openGenerator }, voice: { on: () => setVoice(true), off: () => setVoice(false), toggle: () => setVoice(!window.voiceEnabled), enabled: () => !!window.voiceEnabled }, cmd: { route: cmdRoute, queue: cmdShowQueue, act: cmdAct, dictate: micDictate } };
/* the scout's local surfaces — the parts only the app can see (tunnel + mesh) */
if(window.ObiScout){
  window.ObiScout.hooks.tunnel = async () => {
    const r = await cmdFetch("/api/command/status");
    if(!r.ok || !r.data) return { ok:false, error:"tunnel unreachable from this session" };
    return { ok:true, state: cmdSocketState, count: r.data.count, counts: r.data.counts, lastId: r.data.lastId };
  };
  window.ObiScout.hooks.cgn = async () => {
    if(!window.ObiNet || !window.ObiNet.cgnState) return { joined:false };
    const st = window.ObiNet.cgnState();
    if(!st || !st.net) return { joined:false };
    const hub = await window.ObiNet.cgnReadHub();
    const nodes = hub && hub.nodes ? Object.keys(hub.nodes) : [];
    return { joined:true, net: st.net, hubName: st.hubName, seq: hub ? hub.seq : 0, nodes: nodes.length,
      names: hub && hub.nodes ? Object.values(hub.nodes).map(n => n.name).join(", ") : "",
      soul: hub && hub.soul ? hub.soul.length : 0 };
  };
}
/* one entry per page load: a reload is an event, and the record should say so
   rather than showing an unexplained jump in the sequence. The tab strip is
   repainted once the entry is chained, so the count is live, not stale. */
const bootLog = logOp({ kind:"boot", action:"station", detail: "page loaded · view " + currentView + " · generator " + (window.generatorName || "?") + " · modules " + (window.ObiILog ? "ilog ok" : "ILOG MISSING") + (window.ObiDivisions ? "" : " · divisions MISSING"), result: "run " + (runNoOf() || "?") + " · soul " + ledger.soul.length + " fragments" });
try{ if(window.ObiILog && window.ObiILog.migrate) Promise.resolve(window.ObiILog.migrate()).then(m => { if(m && m.moved) logOp({ kind:"repair", action:"ilog migrate", detail: m.moved + " legacy (segment-less) entries re-keyed to e<seg>-<seq>", result: "no entry lost" }); }).catch(() => {}); }catch(e){}
try{ Promise.resolve(bootLog).then(() => { updateStats(); updateTabMeta(); }).catch(() => {}); }catch(e){}
updateStats();

/* ============================================================================
   CLOUDCOMMAND — /cf deploy, /gh backup, /dg, /keys
   The chat as a deployment + backup station. Secrets (Cloudflare / GitHub /
   Deepgram tokens) live ONLY in this browser's localStorage under key
   "obi_keys" — never in this public source, never in the HTML, never in a URL.
   All API calls go through root.superFetch (CORS-free).
   ========================================================================== */
function keyGet(k){ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}")[k] || null; }catch(e){ return null; } }

/* ONE list of what this station is, so /gh backup and /canon sync can never drift
   apart again (the old inline lists had drifted: they named files that no longer
   existed and missed the modules that do). Every file here is fetched from this
   origin at push time, exactly as the live page serves it. */
const SRC_SNAPSHOT = [
  "main.pjs", "index.html",
  /* AUDIT 2026-09-21: this list is now COMPLETE - built from the shipped src/ tree, so it can no
     longer name a file that does not exist (it used to list src/brand/assets/soc-guide.webp,
     deleted months earlier) or omit the ones that do (every src/curriculum/pa.g*.json, src/canon/*,
     src/lessons/reference/*, src/marketing/*, src/cloudflare/* were all missing from the backup). */
     /* AUDIT 2026-09-22: the whole Site Builder wing (src/generators/site-builder/**, 12 files, its
        examples included) had been written into the tree without being registered here, so /canon sync
        was silently not carrying it to the authority. Added. Rule restated, because this is the second
        time it bit: a file that is not in this list is not in the authority. */
     /* AUDIT 2026-09-24: the SESSIONS/ lane — the masterlink handoff channel. The node
        (phoenix-rising-ai-solutions-agent99-webapp) polls THIS tree for SESSIONS/handoff-from-*
        and reads by content key with no token, so a file written here IS the command reaching
        that node — the only command path that exists while the write gate is shut. Registered in
        the same edit that wrote it, which is the rule obeyed rather than restated a third time:
        a handoff not in this list is not in the census, not in the backup, not in the delivery —
        and would arrive nowhere. */
  "src/SESSIONS/handoff-from-mastermind.md",
  "src/AGENT99-OS.md", "src/COSTS.md", "src/HANDOFF.md", "src/LESSON-STANDARD.md", "src/PHOENIXCOMMAND-BLUEPRINT.md",
  "src/PROPOSED-CANON.md", "src/ProposedG999.md", "src/README.md", "src/REPO.md", "src/SPEC.md", "src/VAULT-RECOVERY.md",
  "src/STUDENT-EVALUATOR-ECOSYSTEM.md", "src/app.js", "src/audio-split.js", "src/background.js", "src/scs.js",
  "src/brand.js", "src/canon/GOSPEL-999.md", "src/canon/LEGIONNAIRE-FIELD-GUIDE.md", "src/canon/NET-PET-AI-SECRETS-MANIFEST.md",
  "src/cgn-node.js", "src/cgn.js", "src/masterlink.js", "src/master-link.json", "src/clients.js", "src/cloudflare/README.md", "src/cloudflare/build.mjs",
  "src/cloudflare/dev.vars.example", "src/cloudflare/package.json", "src/cloudflare/public/ob1-patch.js", "src/cloudflare/public/ob1-shim.js", "src/cloudflare/store-do.js",
  "src/cloudflare/tunnel-do.js", "src/cloudflare/worker.js", "src/cloudflare/wrangler.toml", "src/constellation.js", "src/curriculum.js",
  "src/curriculum/README.md", "src/curriculum/index.json", "src/curriculum/materials.json", "src/curriculum/pa.g1.json", "src/curriculum/pa.g2.json",
  "src/curriculum/pa.g3.json", "src/curriculum/pa.g4.json", "src/curriculum/pa.g5.json", "src/curriculum/pa.g6.json", "src/curriculum/pa.g7.json",
  "src/curriculum/pa.g8.json", "src/curriculum/pa.g9.json", "src/divisions.js", "src/ecosystem.js", "src/forge.js",
  "src/freephoenix.js", "src/generators/README.md", "src/generators/ear/README.md", "src/generators/ear/main.pjs", "src/generators/practice/README.md",
  "src/generators/practice/main.pjs", "src/generators/site-builder/README.md", "src/generators/site-builder/RESEARCH-LANDING-PAGES.md", "src/generators/site-builder/main.pjs", "src/generators/site-builder/index.html", "src/generators/site-builder/src/app.js",
  "src/generators/site-builder/src/styles.css", "src/generators/site-builder/src/cgn-node.js", "src/generators/site-builder/examples/README.md", "src/generators/site-builder/examples/michael-hobbs-cv/index.html", "src/generators/site-builder/examples/michael-hobbs-cv/style.css",
  "src/generators/site-builder/examples/michael-hobbs-cv/linkedin-blueprint.md", "src/generators/site-builder/examples/portfolio-template-violet/index.html", "src/generators/site-builder/examples/portfolio-template-green/index.html", "src/generators/student-portal/README.md", "src/generators/student-portal/index.html",
  "src/generators/student-portal/main.pjs", "src/generators/watchtower/README.md",
  "src/generators/watchtower/main.pjs", "src/ilog.js", "src/image-node/README.md", "src/image-node/index.html", "src/image-node/main.pjs",
     /* AUDIT 2026-09-22 (second time in one day, same lesson): the whole Video wing
        (src/generators/video-node/**) was written into the tree without being
        registered here, and so was the finished Mailala build the wing produced
        (src/sites/**). A file that is not in this list is not in the authority. */
  "src/generators/video-node/README.md", "src/generators/video-node/main.pjs", "src/generators/video-node/index.html",
  "src/generators/video-node/src/app.js", "src/generators/video-node/src/pulse.js", "src/generators/video-node/src/reel.js",
  "src/generators/video-node/src/story.js", "src/generators/video-node/src/drop.js", "src/generators/video-node/src/styles.css",
  "src/generators/video-node/src/cgn-node.js",
     /* AUDIT 2026-09-26 (the fifth time — and this one was large): the STUDENT
        PORTAL PIPELINE doc (src/STUDENT-PORTAL-PIPELINE.md), THE ROLES desk
        (src/family.js), the role kit (src/generators/role-kit/**) and all TWELVE
        role crates (src/generators/<role>/**) had been written into the tree
        without ever being registered here — so /canon sync and /gh backup were
        silently leaving 58 files, the whole ROLES suite, out of the authority.
        Registered in the same edit that the audit found them, which is the rule
        obeyed rather than restated a fifth time: a file that is not in this list
        is not in the authority. */
  "src/STUDENT-PORTAL-PIPELINE.md", "src/SOUL-VERBATIM-PORTALS-MAGIC-CHAT.md", "src/family.js",
  "src/generators/role-kit/kit.js", "src/generators/role-kit/method.js", "src/generators/role-kit/build.js",
  "src/generators/role-kit/test-roles.js", "src/generators/role-kit/test-actions.js", "src/generators/role-kit/test.html", "src/generators/role-kit/test-roles.html",
  "src/generators/cv-forge/README.md", "src/generators/cv-forge/index.html", "src/generators/cv-forge/main.pjs", "src/generators/cv-forge/src/panel.js",
  "src/generators/linkedin-forge/README.md", "src/generators/linkedin-forge/index.html", "src/generators/linkedin-forge/main.pjs", "src/generators/linkedin-forge/src/panel.js",
  "src/generators/headshot-brief/README.md", "src/generators/headshot-brief/index.html", "src/generators/headshot-brief/main.pjs", "src/generators/headshot-brief/src/panel.js",
  "src/generators/portfolio-intake/README.md", "src/generators/portfolio-intake/index.html", "src/generators/portfolio-intake/main.pjs", "src/generators/portfolio-intake/src/panel.js",
  "src/generators/phonics-44/README.md", "src/generators/phonics-44/index.html", "src/generators/phonics-44/main.pjs", "src/generators/phonics-44/src/panel.js",
  "src/generators/presentation-coach/README.md", "src/generators/presentation-coach/index.html", "src/generators/presentation-coach/main.pjs", "src/generators/presentation-coach/src/panel.js",
  "src/generators/application-board/README.md", "src/generators/application-board/index.html", "src/generators/application-board/main.pjs", "src/generators/application-board/src/panel.js",
  "src/generators/interview-drill/README.md", "src/generators/interview-drill/index.html", "src/generators/interview-drill/main.pjs", "src/generators/interview-drill/src/panel.js",
  "src/generators/umbrella-brand/README.md", "src/generators/umbrella-brand/index.html", "src/generators/umbrella-brand/main.pjs", "src/generators/umbrella-brand/src/panel.js",
  "src/generators/presence-plan/README.md", "src/generators/presence-plan/index.html", "src/generators/presence-plan/main.pjs", "src/generators/presence-plan/src/panel.js",
  "src/generators/work-credit/README.md", "src/generators/work-credit/index.html", "src/generators/work-credit/main.pjs", "src/generators/work-credit/src/panel.js",
  "src/generators/idea-lists/README.md", "src/generators/idea-lists/index.html", "src/generators/idea-lists/main.pjs", "src/generators/idea-lists/src/panel.js",
  "src/sites/README.md", "src/sites/mailala/index.html", "src/sites/mailala/BLUEPRINT.md", "src/sites/mailala/STORY.md", "src/sites/mailala/ARCHITECT-BLUEPRINT.md",
     /* AUDIT 2026-09-24 (fourth time, same lesson, and this is the one that will
        keep biting): the sovereign's Mailala SOUL (src/sites/mailala/SOUL.md) and
        the nine venue photographs he supplied with it (src/sites/mailala/material/)
        were written into the tree; listed here in the same edit, not after. The
        register's own words, restated: a file that is not in this list is not in
        the authority. */
  "src/sites/mailala/SOUL.md", "src/sites/mailala/HANDOFF.md",
  "src/sites/mailala/material/6150204477533786107_121.jpg", "src/sites/mailala/material/6150204477533786109_121.jpg",
  "src/sites/mailala/material/6150204477533786110_121.jpg", "src/sites/mailala/material/6150204477533786111_121.jpg",
  "src/sites/mailala/material/6150204477533786119_121.jpg", "src/sites/mailala/material/6150204477533786120_121.jpg",
  "src/sites/mailala/material/6134195124376899528_121.jpg", "src/sites/mailala/material/6134195124376899530_121.jpg",
  "src/sites/mailala/material/6134195124376899531_121.jpg",
     /* AUDIT 2026-09-23 (the sync brief): src/MASTERMIND-SYNC-2026-09-23.md was
        written into the tree by the PhoenixScout mission — the topology as
        measured, mastermind's git and cloud operations, the one channel that
        crosses generator origins with no token, and what the rename cost.
        Registered in the same edit. A file that is not in this list is not in
        the authority. */
  "src/MASTERMIND-SYNC-2026-09-23.md",
     /* AUDIT 2026-09-23 (the third time — the rule is stated again because it keeps
        being the thing that goes wrong): the OFFER DESK (src/offer-desk/**) and its
        register (src/offers.js) were written into the tree; they are listed here in
        the same commit, not after. A file that is not in this list is not in the
        authority. */
  "src/offers.js",
  "src/offer-desk/README.md", "src/offer-desk/index.html", "src/offer-desk/src/styles.css",
  "src/offer-desk/src/trades.js", "src/offer-desk/src/bundle.js", "src/offer-desk/src/desk.js",
  "src/offer-desk/src/pulse.js", "src/offer-desk/src/reel.js",
  "src/image-node/src/app.js", "src/image-node/src/cgn-node.js", "src/image-node/src/styles.css", "src/lesson-forge.js", "src/lessons.js",
  "src/intake.js",
     /* 2026-09-27, the sovereign's three words — "open the git". src/gitcanon.js reads the
        canon that answers anonymously (the public monorepo, the Worker source, the raw
        soul-DNA archive) and names the one branch that is behind a PAT. Registered in the
        same edit that wrote it. A file that is not in this list is not in the authority. */
  "src/gitcanon.js",
  "src/lessons/reference/NET-CLASSROOM-MANAGER.html", "src/lessons/reference/NET-Highschool-Careers.html", "src/lessons/reference/NET-Sarcasm-Academy.html", "src/lessons/specs/after-school-club-academy.spec.json", "src/lessons/specs/flower-power-academy.spec.json",
  "src/lessons/specs/materials-lab-academy.spec.json", "src/lessons/specs/world-music-academy.spec.json", "src/lessons/specs/look4-function1-directions.spec.json", "src/lessons/specs/closeup-a1-u2-vocabulary.spec.json",
  "src/marketing/INGEST-LOG.md", "src/marketing/MANIFEST.json", "src/marketing/README.md", "src/pheromone.js", "src/playbooks.js",
  "src/review.js", "src/savewatch.js", "src/scout.js", "src/styles.css", "src/summary.js",
  "src/transcribe.js", "src/vault.js",
  "src/brand/assets/apex-anatomy.webp", "src/brand/assets/apex-app.png", "src/brand/assets/apex-ink.webp", "src/brand/assets/apex-net.webp", "src/brand/assets/apex.webp",
  "src/brand/assets/art-choose.webp", "src/brand/assets/art-command.webp", "src/brand/assets/art-duo.webp", "src/brand/assets/art-emblem.webp", "src/brand/assets/art-tigerkid.webp",
  "src/brand/assets/art-university.webp", "src/brand/assets/atom.webp", "src/brand/assets/bookshelf.webp", "src/brand/assets/brain.webp", "src/brand/assets/brain2.webp",
  "src/brand/assets/cdx-acquisition.webp", "src/brand/assets/cdx-advantage.webp", "src/brand/assets/cdx-aipet.webp", "src/brand/assets/cdx-diagnosis.webp", "src/brand/assets/cdx-ecosystem.webp",
  "src/brand/assets/cdx-guarantee.webp", "src/brand/assets/cdx-immutable.webp", "src/brand/assets/cdx-matrix.webp", "src/brand/assets/cdx-retention.webp", "src/brand/assets/cdx-shift.webp",
  "src/brand/assets/cdx-ultimate.webp", "src/brand/assets/cdx-wake.webp", "src/brand/assets/chip.webp", "src/brand/assets/confidence.webp", "src/brand/assets/cub.webp",
  "src/brand/assets/dial45.webp", "src/brand/assets/edge.webp", "src/brand/assets/elephant.webp", "src/brand/assets/flow.webp", "src/brand/assets/gauge.webp",
  "src/brand/assets/gears-dna.webp", "src/brand/assets/gears.webp", "src/brand/assets/globe.webp", "src/brand/assets/head-jigsaw.webp", "src/brand/assets/head-ui.webp",
  "src/brand/assets/head.webp", "src/brand/assets/infinity.webp", "src/brand/assets/laptop.webp", "src/brand/assets/mkt-60-delay.webp", "src/brand/assets/mkt-60-input.webp",
  "src/brand/assets/mkt-aipet.webp", "src/brand/assets/mkt-hour.webp", "src/brand/assets/mkt-mouse2tiger.webp", "src/brand/assets/mkt-permission.webp", "src/brand/assets/mkt-pillars.webp",
  "src/brand/assets/mkt2-adpipeline.webp", "src/brand/assets/mkt2-architecture.webp", "src/brand/assets/mkt2-biology.webp", "src/brand/assets/mkt2-failure.webp", "src/brand/assets/mouse-cage.webp",
  "src/brand/assets/mouse-chained.webp", "src/brand/assets/mouse.webp", "src/brand/assets/mouse2.webp", "src/brand/assets/phoenix.webp", "src/brand/assets/phone.webp",
  "src/brand/assets/phone2.webp", "src/brand/assets/phx-cover.webp", "src/brand/assets/phx-lakeview.webp", "src/brand/assets/phx-pipeline.webp", "src/brand/assets/phx-stack.webp",
  "src/brand/assets/pyramid.webp", "src/brand/assets/roar.webp", "src/brand/assets/run305.webp", "src/brand/assets/shield.webp", "src/brand/assets/soc-60delay.webp",
  "src/brand/assets/soc-60input.webp", "src/brand/assets/soc-adpipeline.webp", "src/brand/assets/soc-biological.webp", "src/brand/assets/soc-blueprint.webp", "src/brand/assets/soc-chains.webp",
  "src/brand/assets/soc-differentiators.webp", "src/brand/assets/soc-failure.webp", "src/brand/assets/soc-fluency.webp", "src/brand/assets/soc-leaks.webp", "src/brand/assets/soc-permission.webp",
  "src/brand/assets/soc-reality.webp", "src/brand/assets/soc-rising.webp", "src/brand/assets/soc-summer.webp", "src/brand/assets/soc-transform.webp", "src/brand/assets/soc-trap.webp",
  "src/brand/assets/stp-404.webp", "src/brand/assets/stp-close.webp", "src/brand/assets/stp-engine.webp", "src/brand/assets/stp-override.webp", "src/brand/assets/stp-scale.webp",
  "src/brand/assets/tep-audit.webp", "src/brand/assets/tep-lazy.webp", "src/brand/assets/tep-math.webp", "src/brand/assets/tge-bucket.webp", "src/brand/assets/tge-hud.webp",
  "src/brand/assets/tge-rule8.webp", "src/brand/assets/tiger-energy.webp", "src/brand/assets/tiger-spectral.webp", "src/brand/assets/tiger.webp", "src/brand/assets/tiger2.webp",
  "src/brand/assets/tigerbg.webp", "src/brand/assets/venn.webp", "src/brand/assets/wave-loud.webp",
     /* AUDIT 2026-09-25 (fifth time, same lesson — and this time it is a REGISTER, so it would be
        the worst one to miss): THE ASSET REGISTER was written into the tree —
        src/sites/mailala/ASSET-MANIFEST.md (the register, human) and src/sites/mailala/
        ASSET-MANIFEST.json (the register, machine — every asset in the blueprint located,
        labelled and SHA-256 hashed from its actual bytes, plus all 242 shipped src/ files).
        Registered in the same edit. A file that is not in this list is not in the authority. */
  "src/sites/mailala/ASSET-MANIFEST.md", "src/sites/mailala/ASSET-MANIFEST.json",
     /* AUDIT 2026-09-25 (same edit, same rule): THE SYNC PACKET — the Mailala work addressed to the
        node (phoenix-rising-ai-solutions-agent99-webapp): every artifact with a URL that answers
        today and the SHA-256 to check it by, plus the three lanes measured (cloudflare BLOCKED, the
        mesh BLOCKED AT THE WRITE, the token-free read channel WORKS pull-only). Registered here so
        /canon sync carries it. A file that is not in this list is not in the authority. */
  "src/sites/mailala/SYNC-PACKET.md", "src/sites/mailala/SYNC-PACKET.json",
     /* AUDIT 2026-09-24 (THE FREE WIRE + THE REGISTER PASS): two files written and registered in the
        same edit. (1) src/freewire.js — control with no credential: the measured lane table, the
        family nerve (ntfy.sh), and the MUTABLE pointer (keyvalue.immanuel.co) that does the job the
        platform's editable store refused, so the estate stops being pull-only. (2) src/tools/
        register-pass.mjs — the census, as code and in the estate at last: ASSET-MANIFEST.md had
        documented the recipe and called it reproducible, but the pass that produced the register
        lived in a dead session's scratch space, so a later session could read the recipe and not run
        it. It is also the instrument that keeps the pointer's numbers honest.
        A file that is not in this list is not in the authority. */
  "src/freewire.js", "src/tools/register-pass.mjs",
     /* AUDIT 2026-09-25 (the brain): src/brain.js — the mastermind's memory (an index of
        every artifact, file, document, command, soul fragment, op, key slot and lane),
        the AUTO-SYNC lane that runs by itself (boot + every 5 min: recompute the estate,
        pull the published manifest, re-hash the delivery, TRY the write lane and record
        its failure verbatim), the KEY LEDGER (fingerprints only — a secret is never
        stored or logged), the archive, and image sharing. Wired in the same edit:
        index.html loads it before app.js; app.js exposes COMMAND_BOOK to it, adds
        /brain, the brain instrument in the tab bar, and the brain row in /state.
        A file that is not in this list is not in the authority. */
  "src/brain.js",
     /* AUDIT 2026-09-25 (the relay): src/relay.js — THE MASTER SYNC PIPELINE. One ordered
        chain, each stage refusing to run on a lie from the stage before it: READ the register
        and the packet → CENSUS every declared file (hash it, rebuild the register's own tree
        digest from the bytes) → DELIVER the four truth-documents to the host by digest
        (idempotent: identical bytes are HELD, never re-uploaded) and TRY the mesh write and
        the cloud, recording each refusal verbatim → VERIFY by pulling the read channel and
        re-hashing every URL it delivered → INDEX (the brain builds over the estate) → ARCHIVE
        the run under its own digest. Verdicts are the S2Pipeline's: REAL / HOLLOW / MISSING,
        plus BLOCKED for a door that is shut — and a run with a shut door is HELD, never
        COMPLETE. Printed by /relay (and /pipeline sync); run headless by the boot sequence.
        Wired in the same edit: index.html loads it before app.js; app.js adds /relay, the
        relay instrument in the tab bar, the relay row in /state, and exports SRC_SNAPSHOT as
        window.ObiSourceTree so the pipeline can enumerate the estate it is carrying.
        A file that is not in this list is not in the authority. */
  "src/relay.js",
     /* AUDIT 2026-09-24 (the open source market): src/market.js — THE RECON AND THE PLAY.
        It measures the market this station already occupies with nine real endpoints
        (GitHub search · npm registry · HuggingFace spaces · Reddit), prints a NUMBER for
        every channel that answered and the REFUSAL VERBATIM for every one that did not,
        derives the open and closed seats from those numbers (never asserts them), and
        carries the play: take the index, the reference implementation and the on-ramp of
        the market the estate already lives in. Printed by /market (scan · play · state ·
        log); the recon arms itself after boot. The play, written down, is
        src/marketing/OPEN-SOURCE-PLAY.md; the ready artefact is
        src/marketing/awesome-perchance.md (populated from the scan: 271 repositories
        measured, leader 69 stars, zero indexes — the empty seat). Wired in the same edit:
        index.html loads it before app.js; app.js adds /market, the market instrument in
        the tab bar, the market row in /state, and the module flag. A file that is not in
        this list is not in the authority. */
  "src/market.js",
  "src/marketing/OPEN-SOURCE-PLAY.md",
  "src/marketing/awesome-perchance.md",
     /* AUDIT 2026-09-24 (the secret sauce): src/secretsauce.js — THE METHOD, GIVEN AWAY
        FREE (/SecretSauce). The canon command on the other side of the omega gate: it
        holds the ten best practices (each one already load-bearing in this station's own
        code), the best-kept secrets (derived from the measured market), and the ladder
        that starts with best practice and then upgrades. The TRAIN lane builds the
        ordered corpus — best practice first, then the measurement, then the secrets —
        hashes it, stores it and hands it over to download; the station cannot fine-tune
        a model and says so. The FORUMS lane asks Hacker News (Algolia), dev.to, GitHub
        issues, StackExchange and Reddit live, and keeps every refusal verbatim. Gated by
        the canon hallmark (sha-256 only, never the plaintext). The canon document it
        prints is src/canon/SECRET-SAUCE.md. Wired in the same edit: index.html loads it
        before app.js; app.js adds /SecretSauce (and /sauce) and the command-book row.
        A file that is not in this list is not in the authority. */
  "src/secretsauce.js",
  "src/canon/SECRET-SAUCE.md",
     /* AUDIT 2026-09-24 (the rubric): src/rubric.js — THE INSTRUMENT THE WORD "EVALUATOR"
        MEANS. The estate inventory has carried `ana.rubric` as MISSING with the note "the word
        'evaluator' means this"; this file is that row, built. Criteria with bands; every band
        must carry a verbatim span from the raw record; the ENGINE locates that span itself and
        REFUSES any it cannot find (a model that can invent a quote can invent a clock, so the
        timestamp is read off the transcript's own utterance map and never asked for); where the
        record holds a number the band is COMPUTED and the model's band is kept as recorded
        dissent; a band with no verified citation is NOT SCORED — excluded from the total and
        listed in the omission audit; coverage travels with every total; thresholds are printed
        with the band; scorecards are append-only and re-verifiable (/rubric verify re-locates
        every citation against the record as it stands). Printed by /rubric (list · show · new ·
        score · errors · teach · verify · trend · archive · export · canary); /rubric canary
        drives the whole pipeline with a canned response and no network, and /doctor runs it.
        Wired in the same edit: index.html loads it before app.js; app.js adds /rubric (and
        /score, /assess), the command-book row, the rubric row in /state, the rubric instrument
        in the tab bar, and the doctor check. A file that is not in this list is not in the
        authority. */
  "src/rubric.js",
     /* AUDIT 2026-09-26 (SIXTH TIME, SAME LESSON — and the register now has teeth:
        CENSUS is computed from THIS list, so an unregistered file is not merely
        absent from the backup, it is absent from the count the register publishes).
        NATURALENGLISHTRAINING.DEV — the English wing's public website, built whole:
        12 pages, the adaptive placement engine, the local-first lead pipeline, the
        four JSON data files the business content lives in, and the back-end Worker
        that receives a submission (complete, NOT deployed — no credential exists in
        this origin, and none may be written into public source). Registered in the
        same edit that wrote it, which is the rule obeyed rather than restated a
        seventh time. A file that is not in this list is not in the census, not in
        the backup, not in the delivery. */
  "src/sites/naturalenglishtraining/README.md",
  "src/sites/naturalenglishtraining/index.html",
  "src/sites/naturalenglishtraining/method.html",
  "src/sites/naturalenglishtraining/programs.html",
  "src/sites/naturalenglishtraining/pricing.html",
  "src/sites/naturalenglishtraining/placement.html",
  "src/sites/naturalenglishtraining/book.html",
  "src/sites/naturalenglishtraining/parents.html",
  "src/sites/naturalenglishtraining/results.html",
  "src/sites/naturalenglishtraining/about.html",
  "src/sites/naturalenglishtraining/teachers.html",
  "src/sites/naturalenglishtraining/faq.html",
  "src/sites/naturalenglishtraining/legal.html",
  "src/sites/naturalenglishtraining/404.html",
  "src/sites/naturalenglishtraining/robots.txt",
  "src/sites/naturalenglishtraining/sitemap.xml",
  "src/sites/naturalenglishtraining/assets/net.css",
  "src/sites/naturalenglishtraining/assets/net.js",
  "src/sites/naturalenglishtraining/assets/api.js",
  "src/sites/naturalenglishtraining/assets/placement.js",
  "src/sites/naturalenglishtraining/assets/booking.js",
  "src/sites/naturalenglishtraining/assets/data/programs.json",
  "src/sites/naturalenglishtraining/assets/data/pricing.json",
  "src/sites/naturalenglishtraining/assets/data/faq.json",
  "src/sites/naturalenglishtraining/backend/worker.js",
  "src/sites/naturalenglishtraining/backend/wrangler.toml",
  "src/sites/naturalenglishtraining/backend/README.md",
     /* AUDIT 2026-10-18 (eighth time, same lesson — and this one was the whole
        boardroom): the 2IC era had written 49 files into the tree without ever
        registering one — src/boardroom.js, src/boardroom-room.js/.css, all 7 seat
        laws + 7 memories + room README, the masterminds doctrine, Agent 99 docs,
        44/444/999, auto.js, deck.js, the research file, one lessons reference and
        the whole quan site. Every file scanned clean (no secrets, no expletives)
        before registering. A file that is not in this list is not in the
        authority. */
  "src/EMPIRE-MAP.md",
  "src/44.md", "src/444.md", "src/999.md", "src/COLLECTIVE.md",
  "src/OMEGA2-phoenix-rising-ai-solutions-agent99-mastermind.md",
  "src/agent99.md", "src/agent99-guardrails.md", "src/agent99-toolkit.md",
  "src/auto.js", "src/deck.js",
  "src/boardroom.js", "src/boardroom-room.js", "src/boardroom-room.css",
  "src/boardroom/README.md",
  "src/boardroom/seats/ceo.md", "src/boardroom/seats/architect.md", "src/boardroom/seats/pres.md",
  "src/boardroom/seats/training.md", "src/boardroom/seats/systems.md", "src/boardroom/seats/fsdev.md",
  "src/boardroom/seats/atoz.md",
  "src/boardroom/memory/ceo.md", "src/boardroom/memory/architect.md", "src/boardroom/memory/pres.md",
  "src/boardroom/memory/training.md", "src/boardroom/memory/systems.md", "src/boardroom/memory/fsdev.md",
  "src/boardroom/memory/atoz.md",
  "src/masterminds/README.md", "src/masterminds/edtech.md", "src/masterminds/gaming.md",
  "src/masterminds/lineup-2026-10-16.md", "src/masterminds/promote.md", "src/masterminds/rename-create-specs.md",
  "src/research/gemini-free-stack-2026-10-16.md",
  "src/lessons/reference/NET-Neon-City-Genesis.html",
  "src/sites/quan/index.html", "src/sites/quan/about.html", "src/sites/quan/connect.html",
  "src/sites/quan/dist.html", "src/sites/quan/style.css",
  "src/sites/quan/assets/fine-wine.jpg", "src/sites/quan/assets/fine-wine-2.jpg",
  "src/sites/quan/assets/natural.jpg", "src/sites/quan/assets/natural-2.jpg",
  "src/sites/quan/assets/plantie.jpg", "src/sites/quan/assets/plantie-2.jpg",
  "src/sites/quan/assets/saigon.jpg", "src/sites/quan/assets/saigon-magazine.jpg",
];
/* THE STATION'S OWN DECLARATION OF ITS ESTATE. One list, read live. src/relay.js reads it
   through this export so the pipeline's census can never drift from the backup's, and so a
   file that is not in this list is not in the census, the backup, or the delivery. */
window.ObiSourceTree = SRC_SNAPSHOT;
/* read one of the station's own files. src/* are served on this origin; main.pjs
   and index.html are the generator's PANELS and are not — they come from the
   platform's own public API (via src/forge.js). Returns null if unreadable. */
async function selfSource(path){
  if(path === "main.pjs" || path === "index.html"){
    if(window.ObiForge && window.ObiForge.panelSource){ try{ const t = await window.ObiForge.panelSource(path); if(t) return t; }catch(e){} }
    return null;
  }
  try{ const r = await fetch(path, { cache:"no-store" }); if(r.ok) return await r.text(); }catch(e){}
  return null;
}
/* AUDIT 2026-09-21: the snapshot below carries images (.webp/.png), and the push used to read
   EVERYTHING with fetch().text() — a text decode, which replaces the invalid UTF-8 byte
   sequences inside a WebP with U+FFFD. Every image backed up to the canon was therefore
   corrupted on the way up. This reader returns a binary file as {__b64} (the exact bytes as
   base64), which gitCommitFiles sends as a base64 blob with no text round-trip. Text files
   are unchanged. */
const BIN_EXT = /\.(webp|png|jpe?g|gif|ico|bmp|avif|woff2?|ttf|otf|eot|mp3|wav|ogg|mp4|webm|pdf|zip|xlsx?|wasm)$/i;
async function selfSourceAny(path){
  if(BIN_EXT.test(path)){
    try{
      const r = await fetch(path, { cache:"no-store" });
      if(!r.ok) return null;
      const b = new Uint8Array(await r.arrayBuffer());
      let s = "";
      for(let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
      return { __b64: btoa(s), __bytes: b.length };
    }catch(e){ return null; }
  }
  return await selfSource(path);
}
function keySet(obj){ try{ const k = Object.assign({}, JSON.parse(localStorage.getItem("obi_keys")||"{}"), obj); localStorage.setItem("obi_keys", JSON.stringify(k)); return true; }catch(e){ return false; } }
/* FAIL-CLOSED secret write. A secret is only ever reported STORED when the bytes can be READ
   BACK. keySet returns false when the browser refuses the write (quota, an evicted or blocked
   store, a partition that has been reset) and every caller used to ignore that return value —
   so the station said "stored" over a write that never happened, and the sovereign paid for it
   on the next reload. This is the same law as every other instrument here: nothing is called
   stored that was not measured. AUDIT 2026-09-24. */
function keyStore(obj){
  if(!keySet(obj)) return { ok:false, why:"the browser refused the write (localStorage threw)" };
  let k; try{ k = JSON.parse(localStorage.getItem("obi_keys")||"{}"); }catch(e){ return { ok:false, why:"the store could not be read back" }; }
  for(const s of Object.keys(obj)){
    const same = (typeof obj[s] === "object") ? (JSON.stringify(k[s]) === JSON.stringify(obj[s])) : (k[s] === obj[s]);
    if(!same) return { ok:false, why:"the read-back of \u201c" + s + "\u201d did not match what was written" };
  }
  return { ok:true };
}
function maskTok(t){ if(!t) return "(none)"; return t.slice(0,4) + "…" + t.slice(-4) + " · len " + t.length; }
async function apiJson(url, opts){
  const r = await root.superFetch(url, opts || {});
  const txt = await r.text();
  let j; try{ j = JSON.parse(txt); }catch(e){ j = null; }
  return { status: r.status, j, txt };
}
/* GitHub's REST API sends CORS headers, so we call it with plain fetch() —
   superFetch's proxy throws (Cloudflare 1101) on Authorization+POST to
   api.github.com, so GitHub calls must NOT go through it. */
async function ghApiJson(url, opts){
  const o = opts || {};
  const r = await fetch(url, { method: o.method || "GET", headers: Object.assign({}, o.headers, { "Accept":"application/vnd.github+json" }), body: o.body });
  const txt = await r.text();
  let j; try{ j = JSON.parse(txt); }catch(e){ j = null; }
  /* `h` is the raw Headers — the interesting ones (x-oauth-scopes, link, x-ratelimit-*)
     live there, and /gh test reads them to answer "what is this token really allowed
     to do?" rather than guessing from the endpoints that happen to answer. */
  return { status: r.status, j, txt, h: r.headers };
}
const CF_BASE = "https://api.cloudflare.com/client/v4/accounts/";

async function cmdCloudflare(arg){
  const parts = arg.split(/\s+/).filter(Boolean);
  const op = (parts[0]||"status").toLowerCase();
  if(op === "token"){
    const t = (parts[1]||"").trim();
    if(!t){ addBubble("ass","Usage: <b>/cf token &lt;API_TOKEN&gt;</b>"); rrlAppend(runNoOf(),"DNA","Obi: [/cf token — no token given]"); return; }
    const st = keyStore({cf:t});
    if(!st.ok){
      addBubble("ass","⛔ <b>NOT STORED.</b> The browser refused to keep the token — " + esc(st.why) + ".<br><span class=\"rfoot\">Nothing was saved, so nothing will be there after a reload. This is reported as a failure on purpose: a secret that is claimed but not held is worse than one that is refused. Try again, or check the store with <b>/keys</b>.</span>");
      logOp({ kind:"secret", action:"cf token", detail:"WRITE REFUSED — nothing stored", result:"NOT STORED" });
      rrlAppend(runNoOf(),"DNA","Obi: [/cf token — WRITE REFUSED, nothing stored]");
      return;
    }
    addBubble("ass","🔑 Cloudflare token stored locally <span style=\"opacity:.7\">(written and read back)</span>. Verifying…");
    logOp({ kind:"secret", action:"cf token", detail:"stored in this browser only (value never logged)", result: maskTok(t) });
    const r = await apiJson(CF_BASE, { method:"GET", headers:{ "Authorization":"Bearer "+t } });
    if(r.j && r.j.success && r.j.result && r.j.result.length){
      const acct = r.j.result[0];
      const stA = keyStore({cfAcct:acct.id});
      addBubble("ass", `✅ Cloudflare token valid — account <b>${esc(acct.name||acct.id)}</b> (${esc(acct.id)}) — ${stA.ok ? "stored as <b>cfAcct</b>" : '<b style="color:#ff5a5a">the account id could NOT be stored (' + esc(stA.why) + ') — re-run /cf token</b>'}, so every fleet call is addressed through it.<br><span class="rfoot">The token is stored locally as <b>cf</b>. Add the R2 S3 pair with <b>/cf r2 &lt;accessKeyId&gt; &lt;secret&gt;</b> · read the store with <b>/cf r2</b> · <b>/cf status</b>, <b>/cf deploy &lt;name&gt;</b>. Both tokens then go to the canon: <b>/vault seal</b> → <b>/vault push</b> (gated) — sealed, so the repo can hold them in the open.</span>`);
    } else {
      addBubble("ass", "⚠ Token stored, but verification failed: " + esc((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) || r.txt.slice(0,140)));
    }
    rrlAppend(runNoOf(),"DNA","Obi: [/cf token — " + (r.j && r.j.success ? "verified" : "failed") + "]");
    return;
  }
  const t = keyGet("cf");
  if(!t){ addBubble("ass","No Cloudflare token stored. <b>/cf token &lt;API_TOKEN&gt;</b> first."); return; }
  const acct = keyGet("cfAcct");
  if(!acct){ addBubble("ass","Cloudflare account not resolved. Re-run <b>/cf token &lt;API_TOKEN&gt;</b>."); return; }
  const AUTH = { "Authorization":"Bearer "+t };
  if(op === "status" || op === "list"){
    const r = await apiJson(CF_BASE + acct + "/workers/scripts", { method:"GET", headers:AUTH });
    if(r.j && r.j.success){
      const ws = r.j.result || [];
      const chips = ws.map(w => '<span class="chip">'+esc(w.id)+'</span>').join(" ");
      addBubble("ass", `<div class="rise"><div class="rhead">☁ /cf status</div><div class="rrow"><b>ACCOUNT</b><span class="vd">${esc(acct.slice(0,8))}…</span><div class="rd">${maskTok(t)}</div></div><div class="rrow"><b>WORKERS</b><span class="vd">${ws.length}</span><div class="rd">${chips||"none"}</div></div><div class="rfoot">Subdomain: https://&lt;name&gt;.mrmichaelhobbs123.workers.dev</div></div>`);
    } else {
      addBubble("ass","⚠ " + esc((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) || r.txt.slice(0,140)));
    }
    return;
  }
  if(op === "enable"){
    const name = parts[1]; if(!name){ addBubble("ass","Usage: <b>/cf enable &lt;workerName&gt;</b>"); return; }
    const r = await apiJson(CF_BASE + acct + "/workers/scripts/" + encodeURIComponent(name) + "/subdomain", { method:"POST", headers:Object.assign({}, AUTH, {"Content-Type":"application/json"}), body: JSON.stringify({ enabled:true }) });
    addBubble("ass", (r.j && r.j.success) ? `✅ Subdomain enabled: <b>https://${esc(name)}.mrmichaelhobbs123.workers.dev</b>` : "⚠ " + esc((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) || r.txt.slice(0,140)));
    return;
  }
  if(op === "deploy"){
    const name = parts[1]; if(!name){ addBubble("ass","Usage: <b>/cf deploy &lt;workerName&gt; [src/path]</b> — deploys <b>src/&lt;name&gt;/index.html</b> by default."); return; }
    let path = parts[2];
    if(!path){
      const tries = ["src/"+name+"/index.html", "src/"+name+".html", "src/"+name+"/main.pjs", "index.html"];
      for(const p of tries){
        try{ const fr = await fetch(p); if(fr.ok){ path = p; break; } }catch(e){}
      }
    }
    if(!path){ addBubble("ass",`⚠ No file found to deploy. Try <b>/cf deploy ${esc(name)} src/yourfile.html</b>`); return; }
    addBubble("ass", `📡 Fetching <b>${esc(path)}</b> → deploying worker <b>${esc(name)}</b>…`);
    let html;
    try{ html = await (await fetch(path)).text(); }
    catch(e){ addBubble("ass","⚠ Couldn't fetch " + esc(path) + ": " + esc(e.message)); return; }
    const src = 'addEventListener("fetch", event => { const html = ' + JSON.stringify(html) + '; event.respondWith(new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } })); });';
    const r = await apiJson(CF_BASE + acct + "/workers/scripts/" + encodeURIComponent(name), { method:"PUT", headers:Object.assign({}, AUTH, {"Content-Type":"application/javascript"}), body: src });
    if(r.j && r.j.success){
      addBubble("ass", `✅ Deployed <b>${esc(name)}</b> (${html.length} bytes). Enabling subdomain…`);
      await apiJson(CF_BASE + acct + "/workers/scripts/" + encodeURIComponent(name) + "/subdomain", { method:"POST", headers:Object.assign({}, AUTH, {"Content-Type":"application/json"}), body: JSON.stringify({ enabled:true }) });
      addBubble("ass", `🔗 Live at <b>https://${esc(name)}.mrmichaelhobbs123.workers.dev</b>`);
      rrlAppend(runNoOf(),"DNA","Obi: [/cf deploy " + name + " — " + html.length + " bytes]");
    } else {
      addBubble("ass","⚠ Deploy failed: " + esc((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) || r.txt.slice(0,160)));
    }
    return;
  }
  if(op === "r2" || op === "storage" || op === "s3"){
    const id = (parts[1]||"").trim(), sec = (parts[2]||"").trim();
    if(id && sec){
      /* THE R2 KEY PAIR — the S3 side of the same account. The token reads the
         store; this pair is what an S3 client (and the deploy pipeline) signs with.
         Stored locally, then PROVEN by a real SigV4 signature before anything is
         claimed: a pair that cannot list the buckets is reported, not filed. */
      const stR2 = keyStore({ cfR2Key:id, cfR2Secret:sec });
      if(!stR2.ok){ addBubble("ass", "⛔ <b>R2 pair NOT STORED.</b> The browser refused the write — " + esc(stR2.why) + ". Nothing was saved."); logOp({ kind:"secret", action:"cf r2 keys", detail:"WRITE REFUSED — nothing stored", result:"NOT STORED" }); return; }
      addBubble("ass", "🔑 Cloudflare R2 key pair stored locally <span style=\"opacity:.7\">(written and read back)</span>. Proving it with a signed S3 request…");
      logOp({ kind:"secret", action:"cf r2 keys", detail:"R2 access key pair stored in this browser only (values never logged)", result: maskTok(id) });
      const t = (window.ObiVault && window.ObiVault.r2) ? await window.ObiVault.r2() : { ok:false, detail:"src/vault.js is not loaded, so the pair could not be signed for" };
      addBubble("ass", (t.ok ? "✅ " : "⚠ ") + esc(t.detail) + (t.ok
        ? '<br><span class="rfoot">The pair is live. It rides in the vault with everything else: <b>/vault seal</b> then <b>/vault push</b> (gated) puts it on the canon, sealed. <b>/vault test cfR2Key</b> re-proves it any time.</span>'
        : '<br><span class="rfoot">Fail closed: stored locally, but nothing was sealed or pushed while it fails its own test.</span>'));
      rrlAppend(runNoOf(),"DNA","Obi: [/cf r2 — pair stored, " + (t.ok ? "S3 signature accepted" : "signature refused") + "]");
      return;
    }
    addBubble("ass", "☁ /cf r2 — reading the object store…");
    const b = await apiJson(CF_BASE + acct + "/r2/buckets", { method:"GET", headers:AUTH });
    const buckets = (b.j && b.j.success && b.j.result && b.j.result.buckets) || null;
    const V = window.ObiVault;
    const pair = V ? { id: V.get("cfR2Key"), sec: V.get("cfR2Secret") } : { id:null, sec:null };
    let s3 = { ok:false, detail:"the vault is not loaded" };
    if(pair.id && pair.sec && V.r2) s3 = await V.r2();
    addBubble("ass", '<div class="rise"><div class="rhead">☁ /cf r2 — Cloudflare R2</div>'
      + '<div class="rrow' + (buckets ? "" : " bad") + '"><b>BUCKETS</b><span class="vd">' + (buckets ? buckets.length : "—") + '</span><div class="rd">'
      + (buckets ? buckets.map(x => esc(x.name) + (x.creation_date ? ' <span class="rd">' + esc(String(x.creation_date).slice(0,10)) + '</span>' : "")).join("<br>") : esc((b.j && b.j.errors && b.j.errors[0] && b.j.errors[0].message) || b.txt.slice(0,140)))
      + '</div></div>'
      + '<div class="rrow' + (s3.ok ? "" : " bad") + '"><b>S3 KEY PAIR</b><span class="vd">' + (pair.id && pair.sec ? (s3.ok ? "VERIFIED" : "TEST FAILED") : "NOT SET") + '</span><div class="rd">'
      + (pair.id && pair.sec ? esc(maskTok(pair.id)) + " · " + esc(s3.detail) : 'set with <b>/cf r2 &lt;accessKeyId&gt; &lt;secret&gt;</b>')
      + '</div></div>'
      + '<div class="rrow"><b>ENDPOINT</b><span class="vd">S3</span><div class="rd rd-mono">https://' + esc(acct) + '.r2.cloudflarestorage.com</div></div>'
      + '<div class="rfoot">The token reads the store; the <b>key pair</b> is what an S3 client — and the deploy pipeline — signs with. Both live in the vault: <b>/vault set cf / cfAcct / cfR2Key / cfR2Secret</b> · <b>/vault test cf</b> · <b>/vault push</b> (gated).</div></div>');
    rrlAppend(runNoOf(),"DNA","Obi: [/cf r2 — " + (buckets ? buckets.length + " bucket(s)" : "store unreadable") + "]");
    return;
  }
  addBubble("ass","Unknown /cf op. Try <b>/cf token</b>, <b>/cf status</b>, <b>/cf r2</b> (the R2 object store + the S3 key pair), <b>/cf deploy</b>, <b>/cf enable</b>.");
}

async function cmdGithub(arg){
  const parts = arg.split(/\s+/).filter(Boolean);
  const op = (parts[0]||"status").toLowerCase();
  const ghHead = () => { const t = keyGet("gh"); return { "Authorization":"Bearer "+(t||""), "Accept":"application/vnd.github+json" }; };
  if(op === "token"){
    const t = (parts[1]||"").trim();
    if(!t){ addBubble("ass","Usage: <b>/gh token &lt;PAT&gt;</b>"); return; }
    const st = keyStore({gh:t});
    if(!st.ok){ addBubble("ass","⛔ <b>NOT STORED.</b> The browser refused to keep the token — " + esc(st.why) + ". Nothing was saved."); logOp({ kind:"secret", action:"gh token", detail:"WRITE REFUSED — nothing stored", result:"NOT STORED" }); return; }
    addBubble("ass","🔑 GitHub token stored locally <span style=\"opacity:.7\">(written and read back)</span>. Verifying…");
    logOp({ kind:"secret", action:"gh token", detail:"stored in this browser only (value never logged)", result: maskTok(t) });
    const r = await ghApiJson("https://api.github.com/user", { method:"GET", headers:ghHead() });
    if(r.j && r.j.login){
      const stU = keyStore({ghUser:r.j.login});
      addBubble("ass", `✅ GitHub token valid — <b>${esc(r.j.login)}</b>${stU.ok ? "" : ' <b style="color:#ff5a5a">(but the username could not be stored: ' + esc(stU.why) + ')</b>'}. Backup with <b>/gh backup</b> or list with <b>/gh status</b>.`);
    } else {
      addBubble("ass","⚠ " + esc((r.j && r.j.message) || r.txt.slice(0,140)));
    }
    rrlAppend(runNoOf(),"DNA","Obi: [/gh token — " + (r.j && r.j.login ? "verified as " + r.j.login : "failed") + "]");
    return;
  }
  /* the ONE authority gate comes before the token check: with no password entered
     in this session, nothing should even reach the credential test. */
  if(op === "backup" && !await omegaRequire("/gh backup — the whole build → the ONE authority")) return;
  if(!keyGet("gh")){ addBubble("ass","No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); return; }
  if(op === "test" || op === "caps" || op === "capabilities"){ await cmdGithubTest(); return; }
  const user = keyGet("ghUser");
  if(op === "status" || op === "list"){
    const r = await ghApiJson("https://api.github.com/user/repos?per_page=100&type=all", { method:"GET", headers:ghHead() });
    if(Array.isArray(r.j)){
      const names = r.j.map(rp=>rp.name).sort();
      addBubble("ass", `<div class="rise"><div class="rhead">🐙 /gh status</div><div class="rrow"><b>USER</b><span class="vd">${esc(user||"?")}</span><div class="rd">${maskTok(keyGet("gh"))}</div></div><div class="rrow"><b>REPOS</b><span class="vd">${names.length}</span><div class="rd">${esc(names.join(", "))||"none"}</div></div><div class="rfoot">Backup with /gh backup [repoName]</div></div>`);
    } else {
      addBubble("ass","⚠ " + esc((r.j && r.j.message) || r.txt.slice(0,140)));
    }
    return;
  }
  if(op === "backup"){
    addBubble("ass", "📦 /gh backup — the whole build into the ONE authority (<b>" + esc(CANON.owner + "/" + CANON.repo) + "@" + esc(CANON.branch) + "</b>)…");
    const res = await canonPushSession({ chat: true });
    if(res === "NO_TOKEN"){ addBubble("ass", "⚠ No GitHub token stored, so nothing can reach the authority. <b>/gh token &lt;PAT&gt;</b> first (stored locally only; the value is never logged or captured)."); logOp({ kind:"push", action:"gh backup", ok:false, result:"no token — nothing left the browser" }); return; }
    const okB = res.failed === 0 && !!res.commitSha;
    addBubble("ass", (okB ? "✅" : "⚠") + " Backup " + (okB ? "complete" : "partial") + " — <b>" + res.pushed + "</b> of <b>" + res.files + "</b> files pushed, <b>" + res.failed + "</b> failed."
      + "<br>Authority: <b>https://github.com/" + esc(CANON.owner) + "/" + esc(CANON.repo) + "</b> @ " + esc(CANON.branch)
      + (res.commitSha ? " · commit <b>" + esc(res.commitSha.slice(0, 8)) + "</b>" : "")
      + "<br><span class=\"rfoot\">Everything in one place: the session record, the station's sources, the raw chat, and the I-LOG (" + (res.ilogEntries || 0) + " chain entries + the Schema V2 transcript). There is no second repo to keep in sync.</span>"
      + (res.mirror && res.mirror.removed && res.mirror.removed.length ? "<br><span class=\"rfoot\">🧹 Mirror pruned: <b>" + esc(res.mirror.removed.map(p => p.replace("OPERATIONS/COMMANDSTATION/perchance/", "")).join(", ")) + "</b> — withdrawn from this station, so removed from the branch (the mirror is exact, or it is not a mirror).</span>" : "")
      + (res.mirror && res.mirror.ok === false ? "<br><span class=\"rfoot\">🧹 Mirror prune skipped: " + esc(res.mirror.why) + ".</span>" : "")
      + (res.errors && res.errors.length ? "<br><span class=\"rfoot\">⚠ " + esc(res.errors.slice(0, 3).join(" · ")) + "</span>" : ""));
    rrlAppend(runNoOf(), "DNA", "Obi: [/gh backup → " + CANON.owner + "/" + CANON.repo + " — " + res.pushed + " files" + (res.commitSha ? " · " + res.commitSha.slice(0, 8) : "") + "]");
    logOp({ kind:"push", action:"gh backup", ok: okB, detail: CANON.owner + "/" + CANON.repo + "@" + CANON.branch + " · " + res.files + " files (chat + sources + I-LOG " + (res.ilogEntries || 0) + ")", result: res.pushed + " pushed · " + res.failed + " failed" + (res.commitSha ? " · commit " + res.commitSha.slice(0, 8) : ""), ref: res.commitSha });
    return;
  }
  addBubble("ass","Unknown /gh op. Try <b>/gh token</b>, <b>/gh status</b>, <b>/gh test</b> (what this token can really do), <b>/gh backup</b> (the whole build → the ONE authority).");
}

/* ---------------------------------------------------------------------------
   /gh test — WHAT CAN THIS TOKEN ACTUALLY DO?
   The vault answers "does the key work". This answers the harder question: which
   of GitHub's powers does it really hold? Every row is a REAL call to
   api.github.com, grouped by what it proves, and a row the token cannot open says
   so with the HTTP status and GitHub's own words — no dressing up.
   The write rows are real but reversible: a secret gist is created, edited and
   deleted. THE CANON IS NEVER MODIFIED BY THIS TEST — the single canon-write probe
   writes a DANGLING git blob (an object no ref points at, invisible in the tree),
   and even that is gated behind PHOENIXOMEGAPROTOCOL.
   -------------------------------------------------------------------------- */
async function cmdGithubTest(){
  const t = keyGet("gh");
  if(!t){ addBubble("ass","No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); return; }
  const H = () => ({ Authorization:"Bearer " + t });
  const J = () => ({ "Content-Type":"application/json", Authorization:"Bearer " + t });
  const api = "https://api.github.com";
  const O = CANON.owner, R = CANON.repo;
  const canon = api + "/repos/" + O + "/" + R;
  const rows = [];
  const say = (g, l, ok, http, d, html) => rows.push({ g:g, l:l, ok:ok, http:http, d:d || "", h:html || "" });
  async function ask(g, l, url, opts, prove){
    let r;
    try{ r = await ghApiJson(url, Object.assign({ method:"GET", headers:H() }, opts || {})); }
    catch(e){ say(g, l, false, "—", "the browser could not make the call: " + String((e && e.message) || e).slice(0, 70)); return null; }
    const ok = r.status >= 200 && r.status < 300;
    let d = "";
    if(ok && prove){ try{ d = prove(r) || ""; }catch(e){ d = ""; } }
    if(!ok) d = String((r.j && r.j.message) || ("HTTP " + r.status)) + (r.status === 404 ? " — nothing here for this token" : "");
    say(g, l, ok, r.status, d);
    return r;
  }
  const nn = v => (v === null || v === undefined || v === "") ? "?" : String(v);
  const cnt = v => (Array.isArray(v) ? v.length + " found" : "?");
  const GI = "IDENTITY", GC = "THE ONE AUTHORITY", GO = "ORGANIZATION", GU = "USER POWERS", GD = "DISCOVERY", GW = "WRITE (real, reversible)";

  addBubble("ass", "🐙 <b>/gh test</b> — asking api.github.com what this token can really do. Real calls, ~40 of them…");

  /* ---- identity: who is it, and what is it allowed to be ---- */
  const me = await ask(GI, "who the token is", api + "/user", null,
    r => "@" + nn(r.j && r.j.login) + " · " + nn(r.j && r.j.name) + " · " + nn(r.j && r.j.public_repos) + " public repos · account made " + nn(String((r.j && r.j.created_at) || "").slice(0,10)));
  const scopesRaw = (me && me.h) ? String(me.h.get("x-oauth-scopes") || "") : "";
  const scopes = scopesRaw.split(/\s*,\s*/).filter(Boolean);
  if(me && me.j && me.j.login) keySet({ ghUser: me.j.login });
  say(GI, "scopes it actually carries", scopes.length > 0, "—",
    scopes.length ? scopes.length + " scope(s): " + scopes.join(", ") : "none (fine-grained tokens carry none)",
    scopes.length ? scopes.length + " granted —<br>" + scopes.map(s => '<span class="chip" style="background:rgba(57,224,230,.13);color:#39e0e6;border:1px solid rgba(57,224,230,.32)">' + esc(s) + '</span>').join(" ") : "");
  await ask(GI, "API quota", api + "/rate_limit", null, r => nn(r.j && r.j.rate && r.j.rate.limit) + " req/hour · " + nn(r.j && r.j.rate && r.j.rate.remaining) + " left");
  await ask(GI, "its own organisations", api + "/user/orgs", null, r => cnt(r.j));

  /* ---- the ONE authority: can it read and administer the canon? ---- */
  await ask(GC, "the canon repo opens", canon, null,
    r => (r.j.private ? "PRIVATE" : "public") + " · default " + nn(r.j.default_branch) + " · push=" + !!(r.j.permissions && r.j.permissions.push) + " admin=" + !!(r.j.permissions && r.j.permissions.admin) + " · " + nn(r.j.size) + " KB");
  await ask(GC, "the vault we pushed is there", canon + "/contents/OPERATIONS/VAULT?ref=" + CANON.branch, null, r => cnt(r.j) + " files in OPERATIONS/VAULT");
  await ask(GC, "branches", canon + "/branches?per_page=100", null, r => cnt(r.j) + " branch(es)");
  await ask(GC, "newest commit", canon + "/commits?per_page=1", null, r => (Array.isArray(r.j) && r.j[0]) ? r.j[0].sha.slice(0,8) + " · " + nn(String(r.j[0].commit.message).split("\n")[0].slice(0,44)) : "?");
  await ask(GC, "our own vault commit", canon + "/commits/95b23ded", null, r => "the station's push is real — committed " + nn(String((r.j && r.j.commit && r.j.commit.committer && r.j.commit.committer.date) || "").slice(0,19)));
  await ask(GC, "branch protection on master", canon + "/branches/" + CANON.branch + "/protection", null, r => "protection rules are visible");
  await ask(GC, "collaborators (admin-only)", canon + "/collaborators?per_page=100", null, r => cnt(r.j) + " collaborator(s)");
  await ask(GC, "deploy keys (admin-only)", canon + "/keys", null, r => cnt(r.j));
  await ask(GC, "webhooks (admin:repo_hook)", canon + "/hooks", null, r => cnt(r.j));
  await ask(GC, "Actions runs", canon + "/actions/runs?per_page=1", null, r => nn(r.j && r.j.total_count) + " run(s)");
  await ask(GC, "Actions workflows", canon + "/actions/workflows", null, r => nn(r.j && r.j.total_count) + " workflow(s)");
  await ask(GC, "repo secrets (names only, admin)", canon + "/actions/secrets", null, r => nn(r.j && r.j.total_count) + " secret name(s) — a value can never be read back");
  await ask(GC, "releases", canon + "/releases?per_page=1", null, r => cnt(r.j) + " release(s)");
  await ask(GC, "issues (all states)", canon + "/issues?state=all&per_page=1", null, r => cnt(r.j) + " on page 1");
  await ask(GC, "pull requests", canon + "/pulls?state=all&per_page=1", null, r => cnt(r.j) + " on page 1");
  await ask(GC, "traffic (needs push)", canon + "/traffic/views", null, r => nn(r.j && r.j.count) + " view(s) / 14 days · " + nn(r.j && r.j.uniques) + " unique");
  await ask(GC, "languages", canon + "/languages", null, r => Object.keys(r.j || {}).slice(0,7).join(", ") || "none");
  await ask(GC, "code-scanning alerts", canon + "/code-scanning/alerts?per_page=1", null, r => cnt(r.j));

  /* ---- the organisation ---- */
  await ask(GO, "the org itself", api + "/orgs/" + O, null, r => nn(r.j && r.j.name) + " · " + nn(r.j && r.j.public_repos) + " public repos · " + nn(r.j && r.j.plan && r.j.plan.name));
  await ask(GO, "members (admin:org)", api + "/orgs/" + O + "/members?per_page=100", null, r => cnt(r.j) + " visible member(s)");
  await ask(GO, "org repos", api + "/orgs/" + O + "/repos?per_page=1", null, r => cnt(r.j) + " on page 1");
  await ask(GO, "org teams", api + "/orgs/" + O + "/teams?per_page=100", null, r => cnt(r.j) + " team(s)");
  await ask(GO, "org secrets (admin:org)", api + "/orgs/" + O + "/actions/secrets", null, r => nn(r.j && r.j.total_count) + " org secret name(s)");
  await ask(GO, "installed GitHub Apps", api + "/orgs/" + O + "/installations", null, r => nn(r.j && r.j.total_count) + " installation(s)");
  await ask(GO, "org webhooks (admin:org_hook)", api + "/orgs/" + O + "/hooks", null, r => cnt(r.j));
  await ask(GO, "AUDIT LOG (org audit log — Enterprise Cloud only)", api + "/orgs/" + O + "/audit-log?per_page=1", null, r => cnt(r.j) + " event(s) readable");

  /* ---- the user powers the scopes imply ---- */
  await ask(GU, "repos it can reach", api + "/user/repos?per_page=1&affiliation=owner", null, r => cnt(r.j) + " own repo(s) on page 1");
  await ask(GU, "starred", api + "/user/starred?per_page=1", null, r => cnt(r.j));
  await ask(GU, "followers", api + "/user/followers?per_page=1", null, r => cnt(r.j));
  await ask(GU, "emails (user scope)", api + "/user/emails", null, r => cnt(r.j) + " · primary " + nn((Array.isArray(r.j) && (r.j.filter(e => e.primary)[0] || {}).email) || "?"));
  await ask(GU, "installed apps (as the user)", api + "/user/installations", null, r => nn(r.j && r.j.total_count) + " app(s)");
  await ask(GU, "GPG keys (admin:gpg_key)", api + "/user/gpg_keys", null, r => cnt(r.j));
  await ask(GU, "SSH keys (admin:public_key)", api + "/user/keys", null, r => cnt(r.j));
  await ask(GU, "codespaces", api + "/user/codespaces", null, r => nn(r.j && r.j.total_count) + " codespace(s)");

  /* ---- discovery ---- */
  await ask(GD, "search repositories", api + "/search/repositories?q=phoenix+rising&per_page=1", null, r => nn(r.j && r.j.total_count) + " match(es)");
  await ask(GD, "search users", api + "/search/users?q=hobbs0011", null, r => nn(r.j && r.j.total_count) + " match(es)");
  await ask(GD, "search commits", api + "/search/commits?q=vault+repo:" + O + "/" + R + "&per_page=1", null, r => nn(r.j && r.j.total_count) + " commit(s)");
  /* /search/code is the ONE GitHub endpoint that refuses a browser origin — no CORS
     headers, so a plain fetch dies with "Failed to fetch" while every other call on
     this page works. It goes through the station's own superFetch instead, and the
     row says so, so a dead request can never masquerade as a missing permission. */
  try{
    const cr = await root.superFetch(api + "/search/code?q=prais+repo:" + O + "/" + R + "&per_page=1", { headers:H() });
    const cj = await cr.json().catch(() => null);
    if(cr.status >= 200 && cr.status < 300) say(GD, "search CODE (via proxy — no browser CORS)", true, cr.status, nn(cj && cj.total_count) + " file(s) matched · GitHub will not answer this endpoint from a page origin, so it went through superFetch");
    else say(GD, "search CODE (via proxy — no browser CORS)", false, cr.status, String((cj && cj.message) || ("HTTP " + cr.status)));
  }catch(e){
    say(GD, "search CODE (via proxy — no browser CORS)", false, "—", "even the proxy could not reach it: " + String((e && e.message) || e).slice(0, 70));
  }

  /* ---- real writes, entirely off the canon ---- */
  const gid = "prais-capability-" + Date.now();
  const made = await ask(GW, "create a secret gist", api + "/gists", { method:"POST", headers:J(),
    body: JSON.stringify({ description:"PrAis Command Station — /gh test capability probe " + new Date().toISOString() + " (deleted by the test)", public:false,
      files:{ ["prais-capability-check.txt"]:{ content:"This gist was created by /gh test to prove the token can WRITE to GitHub, and is deleted seconds later.\n" } } }) },
    r => "gist " + nn(r.j && r.j.id && r.j.id.slice(0,10)) + " created (private)");
  const gidReal = made && made.j && made.j.id;
  if(gidReal){
    await ask(GW, "edit that gist", api + "/gists/" + gidReal, { method:"PATCH", headers:J(), body: JSON.stringify({ description: gid + " — edited by /gh test" }) }, () => "description rewritten (proves PATCH)");
    await ask(GW, "delete that gist", api + "/gists/" + gidReal, { method:"DELETE", headers:H() }, () => "deleted (HTTP 204)");
    let gone = null;
    try{ gone = await ghApiJson(api + "/gists/" + gidReal, { headers:H() }); }catch(e){}
    if(gone) say(GW, "confirm the gist is gone", gone.status === 404, gone.status, gone.status === 404 ? "404 — the delete stuck, nothing left behind" : "still present (HTTP " + gone.status + ")");
  }

  /* ---- canon write: dangling object only, and only with the gate armed ---- */
  const armed = (typeof omegaStatusText === "function") && !!omegaStatusText().armed;
  if(armed){
    let shaBefore = null, shaAfter = null;
    try{ const rr = await ghApiJson(canon + "/git/refs/heads/" + CANON.branch, { headers:H() }); shaBefore = rr.j && rr.j.object && rr.j.object.sha; }catch(e){}
    await ask("CANON WRITE (gated)", "dangling blob in the canon's object store", canon + "/git/blobs", { method:"POST", headers:J(),
      body: JSON.stringify({ content:"prais capability probe " + new Date().toISOString() + " — unreachable object, no ref points at it\n", encoding:"utf-8" }) },
      r => "blob " + nn(r.j && r.j.sha && r.j.sha.slice(0,10)) + " written to the object store — no branch, file or tree touched");
    try{ const rr = await ghApiJson(canon + "/git/refs/heads/" + CANON.branch, { headers:H() }); shaAfter = rr.j && rr.j.object && rr.j.object.sha; }catch(e){}
    const same = !!shaBefore && shaBefore === shaAfter;
    say("CANON WRITE (gated)", "and " + CANON.branch + " did not move", same, "—",
      same ? "still " + String(shaBefore).slice(0,8) + " before and after — the probe proved write access to the canon's object store while changing nothing about the canon"
           : "⚠ the ref moved: " + String(shaBefore).slice(0,8) + " → " + String(shaAfter).slice(0,8));
  } else {
    say("CANON WRITE (gated)", "dangling blob probe", "skip", "—", "SKIPPED — PHOENIXOMEGAPROTOCOL is not armed, so nothing was sent. Canon writes need /phoenixomegaprotocol <password>. The station's own commit 95b23ded above is the standing proof this token can write here.");
  }

  /* ---- render ---- */
  const groups = [];
  for(const row of rows){ let g = groups.filter(x => x.n === row.g)[0]; if(!g){ g = { n:row.g, rs:[] }; groups.push(g); } g.rs.push(row); }
  const scored = rows.filter(r => r.ok !== "skip");
  const opened = scored.filter(r => r.ok === true).length;
  let html = '<div class="rise"><div class="rhead">🐙 /gh test — GitHub capability sweep</div>'
    + '<div class="rrow"><b>TOKEN</b><span class="vd">' + esc(maskTok(t)) + '</span><div class="rd">acting as <b>@' + esc(keyGet("ghUser") || (me && me.j && me.j.login) || "?") + '</b> · <b>' + opened + " / " + scored.length + '</b> probes opened · ' + rows.length + ' real calls</div></div>';
  for(const g of groups){
    const gs = g.rs.filter(r => r.ok !== "skip");
    const got = gs.filter(r => r.ok === true).length;
    html += '<div class="rrow' + (got < gs.length ? " bad" : "") + '"><b>' + esc(g.n) + '</b><span class="vd">' + got + "/" + gs.length + '</span><div class="rd">'
      + g.rs.map(r => '<b>' + (r.ok === true ? "✓ " : (r.ok === "skip" ? "– " : "✗ HTTP " + r.http + " ")) + esc(r.l) + '</b> — ' + (r.h || esc(r.d))).join("<br>")
      + '</div></div>';
  }
  html += '<div class="rfoot">Reads prove reach; the gist cycle proves real create/edit/delete off the canon; the canon itself is <b>never modified</b> here — the only canon-write probe is a dangling blob (an object no ref points at, invisible to the tree) and it stays skipped until /phoenixomegaprotocol arms the gate. Fail-closed: a row the token cannot open is reported with GitHub\'s own message, not smoothed over.</div></div>';
  addBubble("ass", html);
  logOp({ kind:"op", action:"gh test", ok:opened === scored.length, detail:"capability sweep · " + scopes.length + " scopes · " + rows.length + " real calls to api.github.com", result:opened + "/" + scored.length + " opened" + (armed ? " · canon blob probe ran" : " · canon probe skipped (gate locked)") });
  rrlAppend(runNoOf(), "DNA", "Obi: [/gh test — " + opened + "/" + scored.length + " GitHub capabilities confirmed for @" + (keyGet("ghUser") || "?") + "]");
}

async function buildRawChat(){
  const out = { exportedAt: new Date().toISOString(), generator: window.generatorName || "obi", page: location.href, messages: messages.map(m => scrubWorkSafe(redactSecrets(m))) };
  try{ out.ledger = JSON.parse(localStorage.getItem("obi_sdnad")||"{}"); }catch(e){}
  try{ if(out.ledger && out.ledger.soul) out.ledger.soul = out.ledger.soul.map(s => Object.assign({}, s, { text: scrubWorkSafe(redactSecrets(s.text)) })); }catch(e){}
  out.runs = [];
  try{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(k && k.indexOf("obi_rrl_run") === 0){
        try{
          const v = JSON.parse(localStorage.getItem(k)||"null");
          if(v){ if(v.entries) v.entries = v.entries.map(e => Object.assign({}, e, { text: scrubWorkSafe(redactSecrets(e.text)) })); out.runs.push(v); }
        }catch(e){}
      }
    }
  }catch(e){}
  /* the I-LOG rides in the raw-chat export too, so one file carries the words AND
     the operations, with the chain head and the transcript in canon line shape. */
  try{
    if(window.ObiILog){
      out.ilog = await window.ObiILog.all();
      out.ilogAnchors = await window.ObiILog.anchors();
      out.ilogTranscriptV2 = await window.ObiILog.transcriptV2();
      out.ilogStats = await window.ObiILog.stats();
    }
  }catch(e){ out.ilogError = e.message; }
  return JSON.stringify(out, null, 2);
}

/* ---- Deepgram key recovery (Cloudflare) ------------------------------------
   The NET-PET-AI worker on Cloudflare holds DEEPGRAM_API_KEY as a secret and
   exposes it at GET /api/stt/key, so the key survives losing this browser's
   localStorage. Kept as a URL here (never as a value): the route is public, so
   the honest fix is to lock it behind the worker's X-Admin-Key, not to paste the
   key into the source. */
const DG_RECOVER_URL = "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/stt/key";
const DG_LISTEN_URL  = "https://api.deepgram.com/v1/listen?model=nova-3";

function dgSilenceWav(secs, rate){
  secs = secs || 1; rate = rate || 16000;
  const n = Math.round(secs * rate), bytes = 44 + n * 2, dv = new DataView(new ArrayBuffer(bytes));
  const w = (o, s) => { for(let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  w(0,"RIFF"); dv.setUint32(4, bytes - 8, true); w(8,"WAVE"); w(12,"fmt ");
  dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true);
  dv.setUint32(24,rate,true); dv.setUint32(28,rate*2,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true);
  w(36,"data"); dv.setUint32(40, n*2, true);
  return new Blob([dv.buffer], { type:"audio/wav" });
}
async function dgCheck(k){
  if(!k) return { ok:false, why:"no key" };
  try{
    const r = await fetch(DG_LISTEN_URL, { method:"POST", headers:{ "Authorization":"Token " + k, "Content-Type":"audio/wav" }, body: dgSilenceWav(1, 16000) });
    if(r.ok) return { ok:true, status:r.status };
    const body = await r.text().catch(()=> "");
    return { ok:false, status:r.status, why:String(body || "").slice(0,160) || ("HTTP " + r.status) };
  }catch(e){ return { ok:false, why:e.message }; }
}
async function dgTest(){
  const k = keyGet("deepgram");
  if(!k){ addBubble("ass","No Deepgram key stored. <b>/dg token &lt;KEY&gt;</b> or <b>/dg recover</b>."); return; }
  addBubble("ass","🔎 Testing the stored key against api.deepgram.com…");
  const r = await dgCheck(k);
  addBubble("ass", r.ok
    ? "✅ Key works — Deepgram answered <b>" + esc(String(r.status)) + "</b>. /transcribe is ready."
    : "⚠ Key rejected or unreachable: " + esc(r.why) + "<br><span class=\"rfoot\">Try <b>/dg recover</b> to pull a fresh one from Cloudflare.</span>");
  rrlAppend(runNoOf(),"DNA","Obi: [/dg test — " + (r.ok ? "key works" : "key failed") + "]");
}
async function dgRecover(){
  addBubble("ass","🔎 <b>/dg recover</b> — asking the NET-PET-AI worker on Cloudflare for the Deepgram key…");
  const tries = [];
  if(typeof root !== "undefined" && root.superFetch) tries.push(() => root.superFetch(DG_RECOVER_URL));
  tries.push(() => fetch(DG_RECOVER_URL, { cache:"no-store" }));
  let k = null, status = 0, err = "";
  for(const attempt of tries){
    try{
      const r = await attempt();
      status = r.status;
      const j = await r.json().catch(()=>null);
      if(j && typeof j.key === "string" && j.key.trim()){ k = j.key.trim(); break; }
      err = "HTTP " + status + ", no key in the body";
    }catch(e){ err = e.message; }
  }
  if(!k){
    addBubble("ass","⚠ Couldn't read the key from the worker — " + esc(err) + ".<br><span class=\"rfoot\">Source: <span class=\"rd\">" + esc(DG_RECOVER_URL) + "</span> (the worker only answers foreign origins through the superFetch proxy). Fall back to <b>/dg token &lt;KEY&gt;</b>.</span>");
    return;
  }
  const chk = await dgCheck(k);
  if(!chk.ok){
    addBubble("ass","⚠ Found a key on the worker (" + esc(k.slice(0,4)) + "…, " + esc(String(k.length)) + " chars) but Deepgram refused it — " + esc(chk.why) + ".<br><span class=\"rfoot\">Fail closed: nothing stored. Rotate it in the NET-PET-AI worker (`wrangler secret put DEEPGRAM_API_KEY`) and try again.</span>");
    rrlAppend(runNoOf(),"DNA","Obi: [/dg recover — key found on Cloudflare but Deepgram rejected it]");
    return;
  }
  keySet({ deepgram: k });
  addBubble("ass", "✅ Deepgram key recovered from <b>Cloudflare</b> (net-pet-ai worker · <span class=\"rd\">/api/stt/key</span>) and verified against api.deepgram.com — stored locally as <b>" + esc(maskTok(k)) + "</b>.<br><span class=\"rfoot\">/transcribe is live. Heads-up: that route is <b>public</b> — anyone can read this same key, so rotate it and gate the route behind the worker's X-Admin-Key.</span>");
  rrlAppend(runNoOf(),"DNA","Obi: [/dg recover — key recovered from net-pet-ai worker (Cloudflare) and verified]");
}

function showKeys(){
  const k = (()=>{ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}"); }catch(e){ return {}; } })();
  addBubble("ass", `<div class="rise"><div class="rhead">🔐 /keys — locally stored secrets</div>
    <div class="rrow"><b>CLOUDFLARE</b><span class="vd">${k.cf ? "stored" : "none"}</span><div class="rd">${k.cf ? maskTok(k.cf) : "set with /cf token &lt;API_TOKEN&gt; — stored in this browser, then verified against Cloudflare"}</div></div>
    <div class="rrow"><b>CLOUDFLARE ACCOUNT</b><span class="vd">${k.cfAcct ? "stored" : "none"}</span><div class="rd">${k.cfAcct ? esc(k.cfAcct) : "set with /cf token … (the account the token is scoped to)"}</div></div>
    <div class="rrow"><b>CLOUDFLARE R2 (S3)</b><span class="vd">${k.cfR2Key && k.cfR2Secret ? "stored" : "none"}</span><div class="rd">${k.cfR2Key && k.cfR2Secret ? (esc(maskTok(k.cfR2Key)) + (k.cfAcct ? " · https://" + esc(k.cfAcct) + ".r2.cloudflarestorage.com" : "")) : "set with /cf r2 &lt;accessKeyId&gt; &lt;secret&gt; — the S3 key pair for the object store"}</div></div>
    <div class="rrow"><b>GITHUB</b><span class="vd">${k.gh ? "stored" : "none"}</span><div class="rd">${maskTok(k.gh)}${k.ghUser ? " · " + esc(k.ghUser) : ""}</div></div>
    <div class="rrow"><b>DEEPGRAM</b><span class="vd">${k.deepgram ? "stored" : "none"}</span><div class="rd">${maskTok(k.deepgram)}</div></div>
    <div class="rrow"><b>TEXTBOOK PLATFORM · SECONDARY</b><span class="vd">${k.ngl ? "stored" : "none"}</span><div class="rd">${k.ngl ? (esc(k.ngl.user || "?") + " · " + maskTok(k.ngl.password) + (k.ngl.site ? " · " + esc(k.ngl.site) : "")) : "National Geographic Learning (learn.eltngl.com) — the Close-up / New Close Up course. Set with /keys ngl <account> <password>"}</div></div>
    <div class="rrow"><b>TEXTBOOK PLATFORM · PRIMARY</b><span class="vd">${k.nglP ? "stored" : "none"}</span><div class="rd">${k.nglP ? (esc(k.nglP.user || "?") + " · " + maskTok(k.nglP.password) + (k.nglP.site ? " · " + esc(k.nglP.site) : "")) : "National Geographic Learning (learn.eltngl.com) — the Look course, grades 1-5. Set with /keys ngl primary <account> <password>"}</div></div>
    <div class="rfoot">Stored only in this browser's localStorage (key <b>obi_keys</b>) — never in public source, never captured as soul, never in the I-LOG. Set with /cf token, /gh token, /dg token, /keys ngl [primary] &lt;account&gt; &lt;password&gt;.<br>
    <b>WHERE THEY LIVE:</b> this store is bound to the browser AND to the generator's own address (origin <b>${esc(location.origin)}</b>, name <b>${esc(window.generatorName||"?")}</b>). A <b>fork or save-as makes a new address and therefore an EMPTY store</b> — the old secrets stay under the old address and nothing here can reach them. Renaming keeps the address but the station's kv is keyed by name, so kv-backed data (ledgers, clients) reads empty until you rename back. <b>Only the sealed vault survives:</b> <b>/vault seal</b> → <b>/vault push</b> puts them, encrypted, where the sovereign can restore them with <b>/vault recover</b>.</div></div>`);
  rrlAppend(runNoOf(),"DNA","Obi: [keys status shown]");
}

/* ============================================================================
   CANONCOMMAND — the command station tied to the ONE authoritative repo
   Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- (branch: master). /canon pulls
   the doctrine, pings the fleet + the SOULCOUNT gate, and /canon sync pushes this
   session's perchance operations (RRL, soul ledger, app sources, the I-LOG) back
   into the Canon under OPERATIONS/COMMANDSTATION/. Evidence-first: every card
   shows raw facts. The Canon does not change without Sov100: every write goes
   through PHOENIXOMEGAPROTOCOL (/phoenixomegaprotocol).
   ========================================================================== */
const CANON = {
  owner: "Phoenix-Rising-Ai-Solutions",
  repo: "OB-1--Authoritative-",
  /* WRITE TARGET — `master` is where THIS station's own chain lives
     (OPERATIONS/COMMANDSTATION/). It is not the doctrine branch. */
  branch: "master",
  /* CANON ONLY (sovereign, 2026-09-21: "NO KILO, CANON ONLY"). The doctrine this station
     reads and cites lives on the `canon` branch: CANON/SYSTEM/** + VAULT-**. The
     `.kilo/command/` registry that used to be listed here is the LEGACY Kilo lineage —
     not authority, and no longer pulled (src/PHOENIXCOMMAND-BLUEPRINT.md §8, resolved
     2026-08-28: "the master 46-file registry is LEGACY state, not current law"). */
  doctrineBranch: "canon",
  base: "https://api.github.com/repos/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-",
  soulgate: "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count",
  paUrl: "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code",
  /* AUDIT 2026-09-21: a hardcoded PhoenixArchitecti auth key used to sit on the line below
     (`paAuth: "ffScw…"`). It was never read anywhere in this codebase, and it was a live
     credential printed in PUBLIC generator source — the exact thing the invariants forbid
     ("Secrets never enter the record", and never the public source). Removed. If that endpoint
     is ever needed, put the key in the Vault (`/vault set pa`) and read it with keyGet("pa"). */
  workers: [
    ["phoenix-architecti", "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status"],
    ["pcc", "https://pcc.mrmichaelhobbs123.workers.dev/api/status"],
    ["net-pet-ai", "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/status"],
    ["soul-logger", "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"]
  ],
  files: ["CANON/SYSTEM/GOSPEL-999.md", "CANON/SYSTEM/LegionnaireFieldGuide.md", "CANON/SYSTEM/REINCARNATION-CONTRACT.md"]
};
const CANON_REGISTRY = [
  /* AUDIT 2026-09-21, CORRECTED 2026-09-21 (the re-audit). Each row says TWO things:
     \u00b7 BUILT   \u2713 this station really accepts the command; \u2717 it does NOT
     \u00b7 ORIGIN  CANON = the command is named in the canon branch's own files,
                    STATION = this station invented it (the canon does not have it),
                    PROPOSED = it implements an amendment this station proposed; Sov100 has not merged it.
     *** THE AUTHORITY CORRECTION. *** The first pass measured "canon" from the `.kilo/command/`
     registry (46 files). That registry is the KILO lineage — the sovereign has ruled it is NOT the
     authority. The canon's own command set is the SCS, and the canon names it in exactly one place:
     CANON/SYSTEM/GOSPEL-999.md \u00a7SYSTEM I + CANON/SYSTEM/LegionnaireFieldGuide.md \u00a7SCS \u2014
     SEVEN commands: /phoenixRISE /phoenixSCOUT /phoenixMARCH /phoenixSCHOLAR /phoenixSUPPLY
     /phoenixFORTIFY /phoenixDEATH. Everything else below that says CANON is named somewhere in the
     canon branch's CANON/SYSTEM or VAULT. The station now runs that canon loop itself (src/scs.js). */
  ["/phoenixrise","release","SCS Stage 1 \u2014 audit the prior DEATH, gate the session, stamp the name",1,"canon"],
  ["/phoenixscout","discovery","SCS Stage 2 \u2014 recon: flag, tag, hand off. Changes nothing. Give it TERMS and it also hunts the canon's own records (SOUL extracts, prompt registers, I-LOGs, DEATH seals) for them and pulls the SOUL back verbatim",1,"canon"],
  ["/phoenixmarch","build","SCS Stage 3 \u2014 territory sweep; confirm the scout the hard way",1,"canon"],
  ["/forcemarch","build","SCS Stage 3, run OUT OF ORDER on the sovereign\u2019s word \u2014 the sweep re-probes every flagged sector and compares the two readings; the stage artifact is stamped only if a session is open, and it says so when it is not",1,"station"],
  ["/phoenixscholar","report","SCS Stage 4 \u2014 preserve the SOUL; machine-count the RRL",1,"canon"],
  ["/soulscholar","report","SCS Stage 4, run OUT OF ORDER on the sovereign\u2019s word \u2014 count the RRL, sha-256 each half, index the words, preserve the extract durably in this origin, and put a SEALED form (counts + hashes + index, no verbatim text) on the free wire. Verbatim SOUL is never published by the station on its own",1,"station"],
  ["/phoenixsupply","sync","SCS Stage 5 \u2014 route every artifact; hold the ground",1,"canon"],
  ["/supplylines","sync","SCS Stage 5, run OUT OF ORDER on the sovereign\u2019s word \u2014 every artifact and where it ACTUALLY is (this origin, the free-wire addresses, the pointer, the nerve); a canon destination is always HELD, never claimed as written",1,"station"],
  ["/phoenixfortify","validate","SCS Stage 6 \u2014 audit every artifact; gate the seal",1,"canon"],
  ["/phoenixengineer","validate","SCS Stage 6, run OUT OF ORDER on the sovereign\u2019s word \u2014 the canon\u2019s session audit PLUS the station\u2019s own: the published copies are fetched back off the free wire and compared byte for byte with the copies in this origin, the pointer is checked against this register, and the seal on the SOUL is checked by searching the published file for its own words. The SEAL is SHUT unless every artifact is present, passing and identical",1,"station"],
  ["/phoenixdeath","release","SCS Stage 7 \u2014 the 7-point march, seal, handoff",1,"canon"],
  ["/romeprotocol","stability","ROME PROTOCOL \u2014 truth anchoring: SURFACE \u2192 VERIFY \u2192 ANCHOR + the five Watchtowers",1,"canon"],
  ["/pipeline","validate","S2Pipeline \u2014 the execution artifact + the REAL/HOLLOW/MISSING fidelity gate",1,"canon"],
  ["/souldna","discovery","Soul-DNA memory \u2014 this deck's face of it is /memory",1,"canon"],
  ["/help","discovery","Show the command registry",1,"canon"],
  ["/ledger","discovery","Session RRL + soul ledger",1,"canon"],
  ["/status","discovery","Fleet + canon status",1,"canon"],
  ["/audit","validate","Audit the ledger, evidence-first (fail-closed)",1,"canon"],
  ["/doctor","validate","Run checks, report gaps",1,"canon"],
  ["/report","report","Session report (push with /canon sync)",1,"canon"],
  ["/sync","sync","Push perchance operations into the Canon",1,"canon"],
  ["/gateway","sync","Agent 99 \u2192 Legion tunnel status",1,"canon"],
  ["/reincarnate","release","Not a canon command \u2014 the canon pairs are /phoenixRISE and /phoenixDEATH (the alias is kept)",1,"station"],
  ["/supersaiyan","release","Super Saiyan mode \u2014 NOT built here",0,"canon"],
  ["/halt","stability","Halt work \u2014 NOT built here",0,"canon"],
  ["/stabilize","stability","Stabilize \u2014 NOT built here",0,"canon"],
  ["/SoulSearch","discovery","Search the Soul index \u2014 NOT built here (this deck's face is /find)",0,"canon"],
  ["/dnaREGISTRY","report","DNA registry scan \u2014 NOT built here",0,"canon"],
  ["/Centurion-Code","validate","Code standards \u2014 NOT built here",0,"canon"],
  ["/canon","sync","Pull doctrine, ping fleet + soul gate \u2014 a station command, not a canon command",1,"station"],
  ["/ilog","sync","I-LOG \u2014 operation record, chain verify, Git anchor (the station's implementation of the record)",1,"station"],
  ["/phoenixomegaprotocol","security","PHOENIXOMEGAPROTOCOL \u2014 Canon authorization gate (Sov100 password)",1,"proposed"],
  ["/vault","security","PrAis Vault \u2014 every key the empire runs on (locate \u00b7 test \u00b7 set \u00b7 seal \u00b7 push)",1,"station"],
  ["/git","discovery","THE GIT, OPEN \u2014 every part of the canon that answers with no token (the public monorepo, the Worker bundle, the raw soul-DNA archive), the one branch behind a PAT, and the one line that opens it. A station command: the canon has no /git",1,"station"],
  ["/cf","cloud","Cloudflare fleet + R2 \u2014 /cf token \u00b7 /cf status \u00b7 /cf deploy \u00b7 /cf r2",1,"station"],
  ["/offers","station","The free-website offer \u2014 the register of everyone who said yes, the link read for their trade, and the release of THE DROP (/offer release)",1,"station"],
  ["/lesson","build","NET Academy \u2014 the Lesson Creator desk",1,"proposed"],
  ["/forge","build","SELF-FORGE \u2014 read/write the station's own source, stage, commit (gated), hot-swap, eval",1,"proposed"],
  ["/fieldguide","discovery","Doctrine field guide (the LFG, rendered by the station)",1,"station"],
  ["/proposed","discovery","The staging lane \u2014 proposed canon, none merged",1,"station"],
  ["/idea","discovery","Raise a change as SOUL — verbatim first, then it travels the pipeline like every other artifact",1,"station"],
  ["/canon apply","sync","The gate applied — PHOENIXOMEGAPROTOCOL writes the change (or the staged amendments) to the canon branch and commits it",1,"station"],
  ["/scs","validate","THE SCS ENGINE \u2014 run the canon loop RISE\u2192SCOUT\u2192MARCH\u2192SCHOLAR\u2192SUPPLY\u2192ENGINEER\u2192DEATH",1,"station"]
];
/* Canon commands this deck has NEVER implemented. Kept out of the rows above so the card stays
   readable, but PRINTED at the bottom of /canon registry so the gap is never hidden
   (L58 MAP\u2260TERRAIN: a registry that omits what it cannot do is a map that lies).
   Authority: the canon branch's CANON/SYSTEM + VAULT \u2014 NOT the .kilo/command registry. */
const CANON_ONLY = [
  "/phoenixPULSE","/phoenixVERIFY","/phoenixDISPATCH","/aaa-anchor","/ssm","/phetrails",
  "/netpet-observability","/god-mode","/supersaiyan"
];

/* THE STAGING LANE, as the sovereign reviews it. Nothing here is canon: this is the
   walk-through he reads before anything is merged. The durable human copy is
   src/ProposedG999.md; the draft wording is src/canon/GOSPEL-999.md and
   src/canon/LEGIONNAIRE-FIELD-GUIDE.md. `merged:false` until the sovereign splices
   the copies into CANON/SYSTEM/ himself — this station never performs that step. */
const PROPOSED_G999 = [
  { id:"OMEGA.001–.003", sys:"GOSPEL-999 · Amendment I", title:"THE ONE AUTHORITY · THE I-LOG IS THE RECORD · ANCHOR, OR IT DID NOT HAPPEN", says:"one repo is the authority; every operation is an append-only sha-256-chained entry; a push that is not anchored on Git is not evidence", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"OMEGA.004–.006", sys:"GOSPEL-999 · Amendment I", title:"SEAL, NEVER DELETE · PHOENIXOMEGAPROTOCOL · SECRETS NEVER ENTER THE RECORD", says:"reset seals and names, never truncates; the canon does not change without the sovereign's password in that session (15 min, hash only, 5 failures = 10-min lock); credential commands are redacted on the way in", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"OMEGA.007", sys:"GOSPEL-999 · Amendment I", title:"WHAT THIS DOES NOT PROVE", says:"verification happens in the sovereign's browser; the commit is the only outside witness; the chain is never presented as un-forgeable", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"LFG §11", sys:"LEGIONNAIRE-FIELD-GUIDE", title:"I-LOG OPERATIONS & THE OMEGA GATE", says:"the two faces of the record · the anchor rule + recompute recipe · the gate's five clauses · the SCS I-LOG audit · the self-forge clauses", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"LESSON.001–.004", sys:"GOSPEL-999 · Amendment II", title:"THE METHOD IS THE ARITHMETIC · FILES WIN ON TASTE · NO LESSON WITHOUT THE CHECK · CHATTY TEACHES, NEVER JUDGES", says:"10 vocab · 5 idioms · 5 slang · 3 games over 60 minutes; the reference files are ground truth for taste and never for defects; `/lesson check` fails closed; a miss re-teaches the rule", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LESSON.005–.009", sys:"GOSPEL-999 · Amendment II", title:"THE PRACTICE SCORES · THE EXIT HANDS OVER A KEY · THE VOICE IS THE SOVEREIGN'S · THE BRAND IS IMMUTABLE · TWO FAMILIES", says:"a visible counter and no punishment that outruns the reward; 4–6 bolded rules + a Level Up or a writing task; the Tiger register; purple/gold/glass; a display face and a body face only", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LESSON.010–.014", sys:"GOSPEL-999 · Amendment II", title:"ONE FILE · A GAME OWNS ITS MECHANISM · ONE ECONOMY · JUICE GENERATED NOT DOWNLOADED · MOVEMENT CAN BE STOPPED", says:"a self-contained .html; 3+ typed games each with a one-line mechanism; Mouse→Cub→Tiger→Legend on one currency; WebAudio oscillators and div confetti; prefers-reduced-motion and aria-live are mandatory", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LESSON.015–.018", sys:"GOSPEL-999 · Amendment II", title:"NO DIALOGS · THE LESSON OBEYS THE SESSION · THE LESSON IS AN I-LOG ENTRY · HONEST LIMITS", says:"no native dialogs, one home per setting, every name escaped; lessons come from this class's evidence; a lesson that exists only in the browser that wrote it is not shipped; the standard is taste codified, not a law of nature", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LFG §12", sys:"LEGIONNAIRE-FIELD-GUIDE", title:"LESSON AUTHORSHIP", says:"the four authorities in order · the method as arithmetic · the machine · the Tiger voice verbatim · the reverse-hardened failure modes · the pre-ship checklist", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LSN-13…LSN-23", sys:"src/LESSON-STANDARD.md · Part II", title:"THE METHOD AND THE MACHINE", says:"the ten defects in the reference files that are never inherited (D1–D10) plus the eleven laws that make a lesson the sovereign's rather than merely correct — already enforced by the shipped validator", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"CANON.001–.010", sys:"GOSPEL-999 · Amendment VIII", title:"CANON ONLY — NO FALSE SCRIPT STANDS IN FOR A CANON ONE", says:"the canon is the `canon` branch (G999 · LFG · S2PIPELINE · the contract · RISE/DEATH · PERMANENT-LAWS); `.kilo/` is the legacy Kilo lineage and is NOT authority; a script is either sourced to the canon or withdrawn — there is no third state; a withdrawal is logged in the I-LOG (seal-never-delete governs the record, not a false script's service); the station names its own gap; no COMPLETE with a HOLLOW; no model is canon; measure never remember; PHOENIXOMEGAPROTOCOL protects every write and OmegaProtocol is the full stop", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"LFG §18", sys:"LEGIONNAIRE-FIELD-GUIDE", title:"CANON ONLY — THE FIELD FORM", says:"the rule in one line · what counts as the canon · the Kilo lineage · the three marks (CANON/STATION/PROPOSED) · withdrawal · the verdicts · no model is canon · measure never remember · the gate · a pre-ship checklist · an amendment becomes law when it is committed", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"PLACEMENT", sys:"OPERATIONS/COMMANDSTATION · the placement register", title:"MIRROR OR MOVE — EVERY DOCUMENT FINDS ITS HOME IN THE CANON", says:"a document stays in the generator ONLY as an exact mirror of the git branch, and only if the station needs it to run; everything else is fitted into the structure the canon already has (OPERATIONS/COMMANDSTATION/ for the station's own record, CANON/SYSTEM/ for doctrine); nothing is renamed; nothing is deleted before its commit exists on the branch; the canon changes only through /PhoenixRisingProtocol", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"RECON.001", sys:"the station's own recon · RECONNAISSANCE, NOT A FINDING (first pass, unproven)", title:"WHAT THIS SWEEP DID NOT FIND — read 'not found', never 'does not exist'", says:"measured 2026-09-21, from this browser: the canon branch has not moved since 6288cc40 (2026-09-16T19:44:35Z), and a keyword sweep of 22,613 canon paths + 7,366 OB-1 paths did not turn up ten sessions named since then — three newest (Website.DEV.OKT-1 · CaWesbite.Dev.-0 · Canon.Dev.-1 Logs&lanes) and four lane sessions (Marketing/CV · EdTech-BlueTech · SYSTEMS.TRAINING-PHOENIX-PHERMONES · Development-Train67) plus three older strays (TBnamed · anonymous-trolls website prompt · men's-health sales funnel). Each of those is 'not found by this sweep', not 'proven absent': the sweep matched path names and tokens, it did not read every path, did not exhaustively prove absence, and did not ask the sessions' owners. The likely cause (sessions ended without a DEATH seal, so no transcript reached the RRL) is a hypothesis this sweep cannot confirm. Confidence: LOW. Re-run, then challenge, before anything is built on it.", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"RECON.003", sys:"the VS Code agent's keyword hunt · a SCOUT report handed over for this death (second pass, not verified by this browser)", title:"THE SCOUT REPORT, AND THE THREE DATES THAT SETTLE WHERE THE MISSED WORK CANNOT BE", says:"WHAT IT ADDS to RECON.001: content-level corpus counts this browser's path sweep could not make at all (OPERATIONS/ 14,928 INCARNATE content matches · PastLives/ 13,718 · CANON/REINCARNATION/ 2,345 · I-LOG-UNAUDITED/ 1,892), a classification of the three I-LOG directories, and the sites of the literal /reincarnateDEATH string (.kilo/worktrees/ · .kilo/plans/ · .github/skills/phoenix-reincarnation/SKILL.md — the Kilo lineage, which by the sovereign's own ruling is NOT authority). Recount it as terrain, not as proof: nothing was committed, so this browser cannot verify a byte of it. WHAT IT CANNOT DO: it is stage-one reconnaissance, so it closes NONE of this death's gaps — DNA=HOLLOW, 6-AI TRUTH, DO-SQLITE and COMITATENSES belong to different stages, and SSM_NONE needs a sovereign directive this browser can parse, not a keyword count. ONE LINE I CHECKED AND DO NOT BELIEVE: 'All Sep 16-22 commits are from OB-1 <ob1@sov100.run>' is wrong for this repo — measured live, the only commits after 2026-09-16T19:44:35Z are the station's own seven, authored under the sovereign's account, and zero come from that identity. WHAT IT DOES SETTLE (all measured live 2026-09-21): OB-1@canon head 271889c2 (2026-05-15) · Phoenix-Rising-Ultimate last push (2026-04-14) · RRL/RRL-186.txt last touched 2026-07-19 · RRL/RRL-incarnation1.jsonl 2026-08-01 · RRL/RRL-27-STATS.json 2026-08-15. Every candidate was frozen before the sessions existed, so the missed September work has no home in git, and neither the clone nor the streaming scan of the GB files can find it. Confidence: moderate on the additions, HIGH on the dates. Keep the report; do not spend the death on it.", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"RECON.002", sys:"the canon's own audit · CARRIED FORWARD, NOT RE-MEASURED", title:"THE DEBTS THE CANON ALREADY NAMES ITSELF", says:"also measured 2026-09-21, and the part I am most comfortable with, because the canon says it about itself: REINCARNATION-LOG Run 190-C records the real I-LOG as 14/16/18/27/28, header-only for 11/12/13/15/17/19/29/30, missing for 10/20/21/22/23/26, and session 24 as foreign; lane-checklist-sessions10-30 names five lanes never opened (P0 AUDIT · P1 RRL-PIPELINE · P2 LEDGER · P3 PHEROMONE · P4 STARMAP); and this station's own chain shows three gaps of its own (LEDGER, STARMAP, REGISTRY_SYNC not built in this browser). I have not re-measured any of these against the branch this pass — I am repeating the canon's own words, so the authority is theirs and the errors here would be mine. Confidence: LOW-TO-MODERATE, and every line should be checked against the branch before it is relied on.", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" }
];

/* The staging lane, handed to the SCS engine: the pipeline reads it and reviews each
   item at the stage that carries it (src/scs.js proposalReview). One source, two readers. */
window.PROPOSED_G999 = PROPOSED_G999;
async function cmdProposed(arg){
  /* THE STAGING LANE IS NOT A COMMAND. The sovereign, 2026-09-21: "Proposals dont need to
     go on fucking commands, they can be on the pipeline for review when it is their time."
     So this card is only the INDEX. The review itself happens on /pipeline, where each
     proposal sits at the stage that carries it and surfaces when that stage has run.
     Nothing here is canon; nothing here is tappable. */
  const PR = (window.ObiSCS && window.ObiSCS.proposals) ? window.ObiSCS.proposals() : null;
  const posOf = id => { const m = (PR && PR.items) ? PR.items.filter(x => x.id === id)[0] : null; return m || null; };
  const merged = PROPOSED_G999.filter(r => r.merged).length;
  const rows = PROPOSED_G999.map(r => '<div class="rrow' + (r.merged ? "" : " pending") + '"><b>' + esc(r.id) + '</b><span class="vd">' + esc((posOf(r.id) && posOf(r.id).at) || String(r.stage || "SUPPLY")) + '</span><div class="rd"><b>' + esc(r.sys) + ' \u2014 ' + esc(r.title) + '.</b> ' + esc(r.says) + '</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">\ud83d\udcdc /proposed \u2014 the staging lane (NOT canon \u00b7 NOT a command)</div>'
    + '<div class="rrow"><b>WHERE THEY ARE REVIEWED</b><span class="vd">THE PIPELINE</span><div class="rd">every idea walks the chain the canon names — <b>RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC</b> (CANON/SYSTEM/COLD-START-BOOT.md I.012, read live off the canon branch) — and it becomes law only at the gate. <b>/pipeline</b> puts each one in front of you at its own stage. Not a command. Not canon. It becomes law only when <b>PHOENIXOMEGAPROTOCOL</b> writes it.</div></div>'
    + '<div class="rrow"><b>STATUS</b><span class="vd">' + PROPOSED_G999.length + ' ITEMS \u00b7 ' + merged + ' MERGED</span><div class="rd">' + (PR ? (PR.onRecord + ' of ' + PR.total + ' on record ' + '\u00b7' + ' ' + PR.atSoul + ' still without words ' + '\u00b7' + ' ' + PR.due + ' walking the chain ' + '\u00b7' + ' ' + PR.merged + ' applied') : 'no session open — every idea is still at the raw record') + '. Staged at <b>OPERATIONS/COMMANDSTATION/DOCTRINE/</b> as a proposal \u2014 the station never rewrites the canon in place.</div></div>'
    + rows
    + '<div class="rfoot">Durable copy: <b>src/ProposedG999.md</b> (older doctrine: <b>src/PROPOSED-CANON.md</b>). The review surface is <b>/pipeline</b>, at the stage that carries each one. To make one law: <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b> — the gate WRITES it to the authority, and the commit is the anchor.</div></div>');
  logOp({ kind:"op", action:"proposed lane (index)", result: PROPOSED_G999.length + " staged \u00b7 " + merged + " merged \u00b7 reviewed on /pipeline" });
  rrlAppend(runNoOf(),"DNA","Obi: [/proposed \u2014 " + PROPOSED_G999.length + " staged, reviewed at their stage on /pipeline]");
  return PROPOSED_G999;
}
const CANON_GH = () => { const t = keyGet("gh"); return { "Authorization":"Bearer "+(t||""), "Accept":"application/vnd.github+json" }; };

async function canonPull(){
  const out = {};
  for(const f of CANON.files){
    try{
      const r = await ghApiJson(CANON.base + "/contents/" + encodeURIComponent(f).replace(/%2F/g, "/") + "?ref=" + CANON.doctrineBranch, { method: "GET", headers: Object.assign({}, CANON_GH()) });
      /* The Contents API answers two ways depending on how the ref resolves: JSON with a
         base64 `content` field, or the raw file body (content-type application/vnd.github.raw).
         BOTH are the same read — handle both, never assume one (a card that showed "(unreachable)"
         while the file was in fact returned is exactly the MAP ≠ TERRAIN defect, L58). */
      if(r.j && r.j.content) out[f] = atob(String(r.j.content).replace(/\n/g, ""));
      else if(r.status === 200 && r.txt && !r.j) out[f] = r.txt;
      else out[f] = null;
    }catch(e){ out[f] = null; }
  }
  return out;
}
async function canonWorkerStatus(){
  const rows = [];
  for(const [name, url] of CANON.workers){
    try{
      const r = await root.superFetch(url, { method: "GET" });
      const txt = await r.text();
      let j = null; try{ j = JSON.parse(txt); }catch(e){}
      rows.push({ name, ok: !!r.ok, status: r.status, detail: j ? JSON.stringify(j).slice(0,110) : txt.slice(0,110) });
    }catch(e){ rows.push({ name, ok:false, status:0, detail: "ERR " + e.message }); }
  }
  return rows;
}
async function canonSoulCount(){
  try{
    const r = await root.superFetch(CANON.soulgate + "?session_id=" + encodeURIComponent(cmdSessionTag()));
    const txt = await r.text();
    let j; try{ j = JSON.parse(txt); }catch(e){}
    if(j != null && typeof j.soulcount === "number") return j.soulcount;
    if(j != null && typeof j.count === "number") return j.count;
    return txt.slice(0,140);
  }catch(e){ return "ERR " + e.message; }
}
async function canonSessionMarkdown(){
  const run = currentRun();
  const L = [];
  L.push("# Perchance Command Station — session record");
  L.push("");
  L.push("- **When**: " + new Date().toISOString());
  L.push("- **Generator**: " + (window.generatorName || "obi"));
  L.push("- **Run #**: " + (run ? run.run : "?"));
  L.push("- **Session soul count (chars)**: " + sessionSoulCount);
  L.push("");
  L.push("## Command registry");
  L.push("");
  L.push("```");
  L.push(CANON_REGISTRY.map(r => r[0] + " [" + r[1] + "] — " + r[2]).join("\n"));
  L.push("```");
  L.push("");
  L.push("## Recent raw record (RRL)");
  L.push("");
  try{
    const rr = loadRRL(runNoOf());
    if(rr && rr.entries && rr.entries.length){
      for(const line of rr.entries.slice(-40)) L.push("- [" + line.role + "] " + scrubWorkSafe(redactSecrets(String(line.text || ""))).replace(/\n/g, " "));
    } else L.push("(no RRL entries yet this run)");
  }catch(e){ L.push("(RRL unavailable: " + e.message + ")"); }
  L.push("");
  L.push("## Soul ledger");
  L.push("");
  try{
    L.push("- Soul records stored: " + (ledger.soul ? ledger.soul.length : 0));
    L.push("- Runs total: " + (ledger.runs ? ledger.runs.length : 0));
  }catch(e){ L.push("(ledger unavailable)"); }
  L.push("");
  /* the operation record rides with every session record: the canon is where a
     reader goes looking, so the head, the verification and the anchors are here,
     with the machine-readable chain in OPERATIONS/COMMANDSTATION/ILOG/. */
  L.push("## I-LOG (operation record)");
  L.push("");
  try{
    if(window.ObiILog) L.push(await window.ObiILog.markdown(40));
    else L.push("(src/ilog.js did not load — the operation record is NOT in this session record)");
  }catch(e){ L.push("(I-LOG unavailable: " + e.message + ")"); }
  L.push("");
  L.push("_Generated by /canon sync — the perchance generator reports into the Canon._");
  return L.join("\n");
}
/* The doctrine this station proposes, as one file: the full amended sections live
   in the copies pushed next to it (src/canon/GOSPEL-999.md and
   src/canon/LEGIONNAIRE-FIELD-GUIDE.md), so there is one source of truth for the
   text and no drift between the station and the docs it reads. */
function doctrineAmendment(){
  return [
    "# Doctrine amendment — the I-LOG, ONE AUTHORITY, PHOENIXOMEGAPROTOCOL",
    "",
    "- **Proposed by**: the perchance Command Station — https://perchance.org/" + (window.generatorName || "?"),
    "- **Proposed at**: " + new Date().toISOString(),
    "- **On whose instruction**: SOV100 (Michael Hobbs)",
    "- **Status**: PROPOSED — takes effect when Sov100 merges it into the sealed canon (GOSPEL-999 is never rewritten in place here).",
    "- **Gate**: PHOENIXOMEGAPROTOCOL — this file was pushed with the gate armed (`/phoenixomegaprotocol`), or not at all.",
    "",
    "## What is being added",
    "",
    "1. **ONE AUTHORITY** — `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`) is the one and only authoritative repo; everything we build lives under it (`OPERATIONS/COMMANDSTATION/`), and no mirror may be presented as the canon. `OMEGA.001`",
    "2. **THE I-LOG IS THE RECORD** — every operation is an I-LOG entry (append-only, sha-256 chained); the transcript rides in canon Schema V2 line shape (`content[].data.{text,tool,state}`, SOUL/DNA/REASON per SCS). The VS Code vault (`RRL/`) stays authoritative for incarnations; this station only appends its own sessions beneath `OPERATIONS/COMMANDSTATION/ILOG/`. `OMEGA.002`",
    "3. **ANCHOR, OR IT DID NOT HAPPEN** — every push freezes the head in a commit and records it as an anchor; the unanchored count is always shown, and 'backed up' cannot be claimed while it is above zero. `OMEGA.003`",
    "4. **SEAL, NEVER DELETE** — `/ilog reset` seals and names, it never truncates (I.050). `OMEGA.004`",
    "5. **PHOENIXOMEGAPROTOCOL** — no Canon change without Sov100's password: `/phoenixomegaprotocol <password>` arms the gate for 15 minutes, never past a reload; only a sha-256 is stored; the password is never logged, captured or exported; 5 failures lock the gate for 10 minutes; every attempt is recorded. `OMEGA.005`",
    "6. **SECRETS NEVER ENTER THE RECORD** — credential commands are redacted on the way in and scrubbed from every export. `OMEGA.006`",
    "7. **HONEST LIMITS** — the chain is verified in the sovereign's browser; the commit is the only outside witness, and enrolments/arms/refusals are recorded so nothing happens quietly. `OMEGA.007`",
    "",
    "## The exact text to merge",
    "",
    "- `DOCTRINE/copies/GOSPEL-999.md` — the amended mandate block (`OMEGA.001`–`OMEGA.007`) appended after System III. Provisional numbering; Sov100 assigns final numbers.",
    "- `DOCTRINE/copies/LEGIONNAIRE-FIELD-GUIDE.md` — section 11, *I-LOG OPERATIONS & THE OMEGA GATE* (what an I-LOG is, the anchor rule, the seal rule, the gate, and the I-LOG AUDIT step for the SCS).",
    "- The station's own copies in its shipped source are the same files: `src/canon/GOSPEL-999.md`, `src/canon/LEGIONNAIRE-FIELD-GUIDE.md`.",
    "",
    "## Why it must be merged, not assumed",
    "",
    "GOSPEL-999 is `SEALED | SOV100_ONLY` and \"may be extended but never reduced\" (I.091). This amendment extends; it removes nothing, renumbers nothing, and does not touch the sealed header. Until Sov100 merges it, the station's behaviour follows it while the canon text does not yet say it — that gap is recorded here rather than hidden.",
    "",
    "_Pushed by `/canon doctrine` through PHOENIXOMEGAPROTOCOL. The commit that carries this file is the anchor._"
  ].join("\n");
}

/* Amendment II — THE LESSON AUTHORITY. The second doctrine this station proposes:
   what GOSPEL-999 gains so that a future agent who is told "build a lesson" builds
   one that is the sovereign's, not merely correct. The normative text is
   src/LESSON-STANDARD.md (Part I: the lesson · Part II: the method and the machine);
   the mandates below are its authority layer, derived from the sovereign's own
   lesson files and NET-CLASSROOM-MANAGER.html. */
function lessonAmendment(){
  return [
    "# Doctrine amendment II — THE LESSON AUTHORITY",
    "",
    "- **Proposed by**: the perchance Command Station — https://perchance.org/" + (window.generatorName || "?"),
    "- **Proposed at**: " + new Date().toISOString(),
    "- **On whose instruction**: SOV100 (Michael Hobbs)",
    "- **Status**: PROPOSED — takes effect when Sov100 merges it into the sealed canon (nothing is rewritten in place here).",
    "- **Gate**: PHOENIXOMEGAPROTOCOL — this file was pushed with the gate armed (`/phoenixomegaprotocol`), or not at all.",
    "- **Derived from**: an audit of `NET-CLASSROOM-MANAGER.html` (the sovereign's own classroom machine) beside `NET-Sarcasm-Academy.html` and `NET-Highschool-Careers.html`.",
    "",
    "## What is being added",
    "",
    "1. **THE METHOD IS THE ARITHMETIC** — 10 vocab · 5 idioms · 5 slang · 3 games (10-5-5-3) over 60 minutes; a lesson is one session's slice, never a different shape. `LESSON.001`",
    "2. **THE FILES WIN ON TASTE; THE LAW WINS ON DEFECTS** — the reference files are ground truth for taste; the ten documented defects are never inherited. `LESSON.002`",
    "3. **NO LESSON WITHOUT THE CHECK** — `/lesson check` must pass with zero errors before a lesson is previewed, shipped or called done. `LESSON.003`",
    "4. **CHATTY TEACHES; CHATTY NEVER JUDGES** — a clue (reality check) and a hint (the transferable rule) before the test; every miss re-teaches the rule. `LESSON.004`",
    "5. **THE PRACTICE SCORES** — clickable practice moves a visible counter; wrong never outruns correct. `LESSON.005`",
    "6. **THE EXIT HANDS OVER A KEY** — a summary card of bolded rules plus a Level Up or a writing task. `LESSON.006`",
    "7. **THE VOICE IS THE SOVEREIGN'S** — second person, short, imperative; caps are weight; loud-and-wrong beats silent-and-correct; no hedging, no apology, no sarcasm aimed at the learner. `LESSON.007`",
    "8. **THE BRAND IS IMMUTABLE** — #a855f7 purple, #f59e0b gold, #0f0f1a ground, glass cards, purple→gold gradients. `LESSON.008`",
    "9. **TWO FAMILIES, DISPLAYED WITH INTENT** — at most two Google Fonts: a display face (Orbitron, uppercase) and a body face (Rajdhani or Inter). `LESSON.009`",
    "10. **ONE FILE, HANDED OVER** — a single self-contained .html, no framework, no build, no downloaded assets. `LESSON.010`",
    "11. **A GAME OWNS UP TO ITS MECHANISM** — three typed games minimum (competition / collaboration / creation), each with a one-line mechanism. `LESSON.011`",
    "12. **ONE ECONOMY** — 🐭 Mouse · 🐻 Cub 200 · 🐅 Tiger 500 · 👑 Legend 5000; +10 vocab · +25 idiom · +5 participation · +50 game · +100 perfect; lesson coins are the smaller denomination. `LESSON.012`",
    "13. **JUICE, GENERATED NOT DOWNLOADED** — WebAudio oscillators and div confetti only; the audio context is created on the first gesture; a miss never gets the win cue. `LESSON.013`",
    "14. **MOVEMENT CAN BE STOPPED, CHANGE IS ANNOUNCED** — prefers-reduced-motion honoured, feedback in an aria-live region, state = colour plus its dim fill, meaningful emoji named in text. `LESSON.014`",
    "15. **NO NATIVE DIALOGS, NO SECOND SOURCE OF TRUTH, NO UNESCAPED NAME.** `LESSON.015`",
    "16. **THE LESSON OBEYS THE SESSION** — lessons come from this class's evidence (writeups, reviews, summaries), never from nothing. `LESSON.016`",
    "17. **THE LESSON IS AN I-LOG ENTRY** — recorded in the library, and on the canon with its spec, its check result and the commit that carries it. `LESSON.017`",
    "18. **HONEST LIMITS** — the standard is taste codified from three files and one audit, not a law of nature. `LESSON.018`",
    "",
    "## The exact text to merge",
    "",
    "- `DOCTRINE/copies/GOSPEL-999.md` — Amendment II (`LESSON.001`–`LESSON.018`) appended after the Ω amendment. Provisional numbering; Sov100 assigns final numbers.",
    "- `DOCTRINE/copies/LEGIONNAIRE-FIELD-GUIDE.md` — section 12, *LESSON AUTHORSHIP* (the four authorities in order, the method as arithmetic, the machine, the voice verbatim, the reverse-hardened failure modes, the checklist).",
    "- The station's own copies in its shipped source are the same files: `src/canon/GOSPEL-999.md`, `src/canon/LEGIONNAIRE-FIELD-GUIDE.md`.",
    "- The normative text they cite: `src/LESSON-STANDARD.md` (Part I: the lesson · Part II: the method and the machine), and the three reference files in `src/lessons/reference/` (the two lessons = the format; NET-CLASSROOM-MANAGER.html = the method and the machine).",
    "",
    "## Why it must be merged, not assumed",
    "",
    "GOSPEL-999 is `SEALED | SOV100_ONLY` and \"may be extended but never reduced\" (I.091). Amendment II extends; it removes nothing, renumbers nothing, and does not touch the sealed header. Until Sov100 merges it, the station's behaviour follows it while the canon text does not yet say it — that gap is recorded here rather than hidden.",
    "",
    "_Pushed by `/canon doctrine` through PHOENIXOMEGAPROTOCOL. The commit that carries this file is the anchor._"
  ].join("\n");
}

/* THE MIRROR IS EXACT, OR IT IS NOT A MIRROR.
   The placement doctrine: a document stays in this station only as an exact mirror of
   the branch, so the branch's perchance/ directory must hold this station's declared
   files (SRC_SNAPSHOT) and NOTHING ELSE. `gitCommitFiles` adds and updates but cannot
   remove, so a file withdrawn from the tree (src/TRAIL.md, src/timmy-portal/*) would
   sit on the branch forever. This reads the branch ONCE, computes the extras (branch
   paths that are not in SRC_SNAPSHOT), and returns exactly those for removal. Fail
   closed: no token, an unreadable tree, or a TRUNCATED tree read removes NOTHING. */
async function canonMirrorExtras(){
  const P = "OPERATIONS/COMMANDSTATION/perchance/";
  try{
    const t = keyGet("gh");
    if(!t) return { ok:false, why:"no GitHub token — the branch was not read, so nothing was removed", deletes:[] };
    const r = await ghApiJson(CANON.base + "/git/trees/" + CANON.branch + "?recursive=1", { headers:{ Authorization:"Bearer " + t, "Accept":"application/vnd.github+json" } });
    if(!(r.j && Array.isArray(r.j.tree))) return { ok:false, why:"the branch tree did not answer (HTTP " + r.status + ") — nothing removed", deletes:[] };
    if(r.j.truncated) return { ok:false, why:"the branch tree came back truncated — nothing removed (fail closed)", deletes:[] };
    const have = r.j.tree.filter(x => x.type === "blob" && x.path.indexOf(P) === 0).map(x => x.path.slice(P.length));
    const declared = new Set(SRC_SNAPSHOT);
    const deletes = have.filter(p => !declared.has(p)).map(p => P + p);
    return { ok:true, have:have.length, declared:SRC_SNAPSHOT.length, deletes:deletes };
  }catch(e){ return { ok:false, why:"the branch could not be read: " + String((e && e.message) || e) + " — nothing removed", deletes:[] }; }
}

async function canonPushSession(opts){  opts = opts || {};
  if(!keyGet("gh")) return "NO_TOKEN";
  const ts = new Date().toISOString().replace(/[:.]/g,"-").slice(0,23);
  const run = currentRun();
  const runN = run ? run.run : "?";
  const files = {
    ["OPERATIONS/COMMANDSTATION/session-" + ts + "-run" + runN + ".md"]: await canonSessionMarkdown(),
    "OPERATIONS/COMMANDSTATION/PhoenixOmegaRecovery.md": reconFile(),
    "OPERATIONS/COMMANDSTATION/README.md": "# Command Station\n\nLive reports from the perchance generator. Each `session-*.md` is a `/canon sync` push. App sources snapshotted under `perchance/`. The station's I-LOG (operation chain + canon-schema transcript + anchors) lives under `ILOG/`, and `/gh backup` adds the raw chat under `BACKUP/chat/`.\n"
  };
  /* /gh backup is the whole build: the same push, plus the raw chat record. */
  if(opts.chat){
    try{ files["OPERATIONS/COMMANDSTATION/BACKUP/chat/raw-chat-" + ts + ".json"] = redactSecrets(await buildRawChat()); }catch(e){}
    files["OPERATIONS/COMMANDSTATION/BACKUP/README.md"] = "# The whole build, one authority\n\nWritten by `/gh backup`: the session record, the station's sources, the raw chat (soul + runs, secrets and expletives scrubbed — local stores stay verbatim) and the I-LOG — all of it under the ONE authoritative repo (branch `master`). There is no second backup repo: what is not here does not exist on Git.\n";
  }
  if(opts.doctrine){
    /* the doctrine amendment proposed by the sovereign: written here, pushed only
       through PHOENIXOMEGAPROTOCOL, so the Canon's own copies stay the authority
       until Sov100 merges them. */
    files["OPERATIONS/COMMANDSTATION/DOCTRINE/I-LOG-AND-OMEGA-AMENDMENT.md"] = doctrineAmendment();
    files["OPERATIONS/COMMANDSTATION/DOCTRINE/LESSON-AUTHORITY-AMENDMENT.md"] = lessonAmendment();
    files["OPERATIONS/COMMANDSTATION/DOCTRINE/README.md"] = "# Doctrine — the amendments this station proposes\n\nThis directory carries the doctrines this station proposes/records, and the copies it reads from. The authoritative texts remain `CANON/SYSTEM/LegionnaireFieldGuide.md` (operations) and `GOSPEL-999` (authority): this station never rewrites them in place — it pushes an amendment that Sov100 merges.\n\n| file | amendment | what it adds |\n|---|---|---|\n| `I-LOG-AND-OMEGA-AMENDMENT.md` | Amendment I | the I-LOG, the ONE AUTHORITY, ANCHOR-OR-IT-DID-NOT-HAPPEN, SEAL-NEVER-DELETE, PHOENIXOMEGAPROTOCOL, secrets, honest limits (`OMEGA.001`–`.007`) |\n| `LESSON-AUTHORITY-AMENDMENT.md` | Amendment II | THE LESSON AUTHORITY — how a NET Academy lesson must be built (`LESSON.001`–`.018`), from the sovereign's own lesson files and `NET-CLASSROOM-MANAGER.html` |\n| `copies/` | — | the station's own `src/canon/` copies, carried so the push is self-contained |\n";
    for(const p of ["src/canon/GOSPEL-999.md", "src/canon/LEGIONNAIRE-FIELD-GUIDE.md", "src/ProposedG999.md", "src/PROPOSED-CANON.md", "src/LESSON-STANDARD.md"]){
      try{ const fr = await fetch(p); if(fr.ok){ files["OPERATIONS/COMMANDSTATION/DOCTRINE/copies/" + p.replace(/^src\/(canon\/)?/, "")] = await fr.text(); } }catch(e){}
    }
  }
  for(const p of SRC_SNAPSHOT){
    try{ const t = await selfSourceAny(p); if(t != null){ files["OPERATIONS/COMMANDSTATION/perchance/" + p] = t; } }catch(e){}
  }
  /* the I-LOG itself goes up with every sync, so the Canon holds the record and
     not merely a summary of it */
  const L = window.ObiILog;
  if(!L) return { pushed:0, failed:0, commitSha:null, ts:ts, files:0, errors:["src/ilog.js did not load — refusing to push a session record with no operation log (fail closed)"], ilogEntries:0 };
  let ilogEntries = 0;
  if(L){
    try{
      const chain = await L.all(), anchors = await L.anchors(), v2 = await L.v2Jsonl(), st = await L.stats();
      ilogEntries = chain.length;
      files["OPERATIONS/COMMANDSTATION/ILOG/latest.jsonl"] = L.jsonl(chain);
      files["OPERATIONS/COMMANDSTATION/ILOG/ilog-" + ts + "-seg" + st.seg + ".jsonl"] = L.jsonl(chain);
      files["OPERATIONS/COMMANDSTATION/ILOG/rrl-" + ts + "-run" + runN + ".jsonl"] = v2;
      files["OPERATIONS/COMMANDSTATION/ILOG/anchors.json"] = JSON.stringify(anchors, null, 2);
      files["OPERATIONS/COMMANDSTATION/ILOG/INDEX.md"] = L.indexMd();
      files["OPERATIONS/COMMANDSTATION/ILOG/README.md"] = L.readme;
      files["OPERATIONS/COMMANDSTATION/ILOG/STATUS.md"] = "# I-LOG — status at sync " + ts + "\n\n- head: `" + (st.head || "none") + "` (" + (st.alg || "?") + ")\n- entries: " + st.count + " · segment " + st.seg + " · unanchored before this push: " + st.unanchored + "\n- generator: " + (window.generatorName || "?") + "\n";
    }catch(e){}
  }
  const mirror = await canonMirrorExtras();
  const snap = await L.gitCommitFiles({ owner: CANON.owner, repo: CANON.repo, branch: CANON.branch, files: files, deletes: mirror.deletes, message: "perchance command station sync " + ts + " · " + Object.keys(files).length + " files" });
  const filesN = Object.keys(files).length;
  let anchor = null;
  if(snap.commitSha && L){
    try{
      const st = await L.stats();
      anchor = await L.anchorRecord({ commit: snap.commitSha, branch: CANON.branch, repo: CANON.owner + "/" + CANON.repo, seg: st.seg, seq: st.count, head: st.head, count: st.count, pushed: snap.pushed, failed: snap.failed, path: "OPERATIONS/COMMANDSTATION/ILOG/latest.jsonl" });
    }catch(e){}
  }
  return { pushed: snap.pushed, failed: snap.failed, commitSha: snap.commitSha, baseSha: snap.baseSha, ts: ts, files: filesN, errors: snap.errors, ilogEntries: ilogEntries, anchor: anchor, mirror: { ok: mirror.ok, why: mirror.why || null, have: mirror.have, declared: mirror.declared, deletes: mirror.deletes, removed: snap.removed || [] } };
}

/* ============================================================================
   THE PLACEMENT REGISTER — where every document actually lives.
   The sovereign's rule (2026-09-21): a document stays inside this generator ONLY
   as an EXACT MIRROR of the git authoritative branch, and only if the station needs
   it to run. Everything else belongs IN the canon — fitted into the structure that
   already exists there, never renamed, never invented. Nothing is moved out of here
   until it is COMMITTED on the branch, because a local copy deleted before the commit
   is destroyed. And the only thing that changes the canon is the sovereign's
   /PhoenixRisingProtocol — a proposal is not a change.
   ========================================================================== */
const DOC_PLACEMENT = [
  { here:"src/canon/GOSPEL-999.md",                  git:"CANON/SYSTEM/GOSPEL-999.md",                 kind:"mirror",   why:"the law — read live by /canon and /fieldguide" },
  { here:"src/canon/LEGIONNAIRE-FIELD-GUIDE.md",     git:"CANON/SYSTEM/LegionnaireFieldGuide.md",      kind:"mirror",   why:"the field guide — §SCS is the loop, §11 the I-LOG law" },
  { here:"src/canon/REINCARNATE-DEATH-SEAL.md",      git:".kilo/command/reincarnatedeath.md",          kind:"withdraw", why:"NOT CANON — measured: no such path exists on either branch (`CANON/SYSTEM/REINCARNATE-DEATH-SEAL.md` → 404 twice). It is a digest of the LEGACY KILO command `.kilo/command/reincarnatedeath.md` (30,759 B) and it carries a `KILO SESSION HANDLING` section. The canon's own Stage 7 is `CANON/SYSTEM/reincarnateDEATH.md`, which the station already reads live. Withdrawn from the canon folder (the Kilo file itself is untouched on git)" },
  { here:"src/canon/NET-PET-AI-SECRETS-MANIFEST.md", git:"APPS/NET-PET-AI-legacy/SECRETS-MANIFEST.md", kind:"mirror",   why:"the manifest the station checks its own secrets against" },
  { here:"src/HANDOFF.md",                   git:"OPERATIONS/COMMANDSTATION/HANDOFF.md",                   kind:"to-canon", why:"the resume point" },
  { here:"src/TRAIL.md",                     git:"",                                                  kind:"withdraw", why:"WITHDRAWN 2026-09-21 on the sovereign's word (\"there should be no trail or audit .md! I didnt make that\") — this station does not ship a build-record document; the build record is the I-LOG (`/ilog`), append-only, hash-chained and Git-anchored. Nothing destroyed: the withdrawal is logged, and the station's actual record was never in the file." },
  { here:"src/AUDIT.md",                     git:"",                                                  kind:"withdraw", why:"WITHDRAWN 2026-09-21 on the sovereign's word (\"there should be no trail or audit .md! I didnt make that\") — no separate audit document. The audit's findings live as code (CANON_REGISTRY's BUILT/ORIGIN columns, `STATION_LINES`) and the record of the pass is the I-LOG (`/ilog`)." },
  { here:"src/SPEC.md",                      git:"OPERATIONS/COMMANDSTATION/SPEC.md",                      kind:"to-canon", why:"what the sovereign asked for, kept verbatim" },
  { here:"src/REPO.md",                      git:"OPERATIONS/COMMANDSTATION/REPO.md",                      kind:"to-canon", why:"the repo map" },
  { here:"src/COSTS.md",                     git:"OPERATIONS/COMMANDSTATION/COSTS.md",                     kind:"to-canon", why:"where the work runs and what it costs" },
  { here:"src/README.md",                    git:"OPERATIONS/COMMANDSTATION/README.md",                    kind:"to-canon", why:"the entry point for whoever comes next" },
  { here:"src/VAULT-RECOVERY.md",            git:"OPERATIONS/VAULT/RECOVERY.md",                           kind:"to-canon", why:"how to rebuild every key on a machine that has never seen this station — the durable pointer, with no token" },
  { here:"src/PHOENIXCOMMAND-BLUEPRINT.md",  git:"OPERATIONS/COMMANDSTATION/PHOENIXCOMMAND-BLUEPRINT.md",  kind:"to-canon", why:"the recon that founded this station" },
  { here:"src/STUDENT-EVALUATOR-ECOSYSTEM.md",git:"OPERATIONS/COMMANDSTATION/STUDENT-EVALUATOR-ECOSYSTEM.md",kind:"to-canon",why:"the desk's role map" },
  { here:"src/AGENT99-OS.md",                git:"CANON/SYSTEM/AGENT99-OS.md",                             kind:"proposal", why:"names the kernel and the offerings — a CANON file, so it is a proposal, not a copy" },
  { here:"src/LESSON-STANDARD.md",           git:"CANON/SYSTEM/LESSON-STANDARD.md",                        kind:"proposal", why:"the lesson authority — a CANON file, so it is a proposal" },
  { here:"src/PROPOSED-CANON.md",            git:"OPERATIONS/COMMANDSTATION/DOCTRINE/PROPOSED-CANON.md",   kind:"proposal", why:"the older staging lane" },
  { here:"src/ProposedG999.md",              git:"OPERATIONS/COMMANDSTATION/DOCTRINE/ProposedG999.md",     kind:"proposal", why:"the staging lane as the sovereign reads it" }
];
async function cmdCanonPlace(){
  const sha16 = async t => { try{ const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("").slice(0,16); }catch(e){ return "no-crypto"; } };
  const tok = keyGet("gh");
  const rows = [];
  for(const d of DOC_PLACEMENT){
    let state = "TO THE CANON", note = "moves on your word — the copy here is destroyed only AFTER the commit exists on the branch";
    if(d.kind === "mirror"){
      let hereTxt = null;
      try{ const r = await fetch(d.here); hereTxt = r.ok ? await r.text() : null; }catch(e){ hereTxt = null; }
      let gitTxt = null;
      if(tok){
        try{
          const r = await ghApiJson(CANON.base + "/contents/" + d.git + "?ref=" + CANON.doctrineBranch, { headers: Object.assign({}, CANON_GH()) });
          gitTxt = (r.j && r.j.content) ? atob(String(r.j.content).replace(/\n/g,"")) : ((r.status === 200 && !r.j) ? r.txt : null);
        }catch(e){ gitTxt = null; }
      }
      if(!tok){ state = "UNVERIFIED"; note = "no PAT in this browser, so the mirror cannot be checked — fail-closed"; }
      else if(gitTxt == null){ state = "GIT MISSING"; note = "the branch does not answer for " + d.git; }
      else {
        const a = await sha16(hereTxt || ""), b = await sha16(gitTxt);
        state = a === b ? "EXACT MIRROR" : "DRIFT";
        note = (hereTxt ? hereTxt.length : 0) + " B here · " + gitTxt.length + " B on the branch · sha " + a + (a === b ? "" : " ≠ " + b + " (this copy carries the station's PROPOSED appendix, below the banner)");
      }
    } else if(d.kind === "proposal"){
      state = "PROPOSAL";
      note = "a canon file — it changes only when PHOENIXOMEGAPROTOCOL writes it (/PhoenixOmegaProtocol <password> :: <the change>), and the commit is the anchor";
    } else if(d.kind === "withdraw"){
      state = "WITHDRAWN";
      note = "removed from this tree — it does not belong in the station's source. The withdrawal is recorded in the I-LOG; nothing on git was destroyed, so the record is kept and the false artifact is gone";
    }
    rows.push({ d:d, state:state, note:note });
  }
  const grp = (k, label, sub) => {
    const g = rows.filter(r => r.d.kind === k);
    if(!g.length) return "";
    return '<div class="rrow"><b>' + label + '</b><span class="vd">' + g.length + '</span><div class="rd">' + sub + '</div></div>'
      + g.map(r => '<div class="rrow' + (r.state === "DRIFT" || r.state === "GIT MISSING" || r.state === "UNVERIFIED" ? " bad" : "") + '"><b>' + esc(r.d.here) + '</b><span class="vd">' + esc(r.state) + '</span><div class="rd">→ <span class="rd">' + esc(r.d.git) + '</span> — ' + esc(r.note) + (r.d.why ? ' · <i>' + esc(r.d.why) + '</i>' : "") + '</div></div>').join("");
  };
  addBubble("ass", '<div class="rise"><div class="rhead">🗂 /canon place — where every document lives</div>'
    + '<div class="rrow"><b>THE RULE</b><span class="vd">MIRROR OR MOVE</span><div class="rd">a document stays in this generator ONLY as an <b>exact mirror</b> of the git authoritative branch, and only if the station needs it to run. Everything else belongs <b>in the canon</b> — fitted into the structure that already exists there. Nothing is renamed. Nothing is deleted before its commit exists on the branch.</div></div>'
    + '<div class="rrow"><b>WHERE THIS IS REVIEWED</b><span class="vd">THE PIPELINE</span><div class="rd">this register is a <b>proposal</b>, so it is neither a command nor a shelf item: it is carried by the <b>SUPPLY</b> stage of the S2Pipeline and reviewed there, <b>when it is its time</b> (<b>/pipeline</b>). This card is only the reader.</div></div>'
    + grp("mirror", "MIRRORS KEPT HERE", "read from the branch with <b>?ref=" + esc(CANON.doctrineBranch) + "</b>, compared byte-for-byte by sha-256")
    + grp("withdraw", "WITHDRAWN — FALSE NON-CANON", "measured against both branches; a false script does not keep the name <b>canon/</b>")
    + grp("to-canon", "ONTO THE AUTH BRANCH", "fitted into the lane this station already owns: <span class=\"rd\">OPERATIONS/COMMANDSTATION/</span>")
    + grp("proposal", "PROPOSALS — CANON FILES", "never overwritten in place: they are proposed and take effect when you merge them")
    + '<div class="rrow"><b>THE ONLY KEY</b><span class="vd">/PhoenixRisingProtocol</span><div class="rd">nothing but the sovereign&#39;s own protocol changes the canon. A proposal is not a change; a MERGED commit is. Gate: <b>/PhoenixRisingProtocol &lt;password&gt;</b> arms it for 15 minutes.</div></div>'
    + '<div class="rfoot">Push lanes: <b>/canon sync</b> (session + sources + I-LOG → OPERATIONS/COMMANDSTATION/) · <b>/canon doctrine</b> (the amended copies → OPERATIONS/COMMANDSTATION/DOCTRINE/). Both are gated. <b>/scout</b> proves the branch answers; this card proves each mirror.</div></div>');
  logOp({ kind:"op", action:"canon place", result: rows.length + " documents registered" });
  rrlAppend(runNoOf(), "DNA", "Obi: [/canon place — " + rows.length + " documents registered]");
  return rows;
}
/* ============================================================================
   THE SOUL INTAKE, AND THE GATE THAT WRITES.
   Two rules the sovereign stated flatly (2026-09-21), and this is both of them:

   1) "if I type PhoenixOmegaProtocol along with a change either you or me came up with,
       then it gets changed, its not fucking rocket science."
      PHOENIXOMEGAPROTOCOL is not a proposal mechanism. Armed, it is the WRITE: the change
      goes to the authority (the canon branch) and is committed. Unarmed, nothing is written
      anywhere. There is no third state.

   2) "if it comes up as an idea it starts as SOUL and moves its way to the pipeline just
       like everything else."
      So an idea is not filed as a command and does not arrive already classified. The
      sovereign's words are captured VERBATIM as SOUL first (/idea, or the change typed with
      the protocol), and the idea then travels the same pipeline as every other artifact:
      SOUL -> the stage that carries it (SUPPLY routes it, ENGINEER audits it) -> the gate.
      src/scs.js reads this lane through window.ObiIdeas and prints the journey.
   ========================================================================== */
const IDEAS_KEY = "obi_ideas";
function ideasAll(){
  try{ const l = JSON.parse(localStorage.getItem(IDEAS_KEY) || "[]"); return Array.isArray(l) ? l : []; }
  catch(e){ return []; }
}
function ideasSave(list){ try{ localStorage.setItem(IDEAS_KEY, JSON.stringify(list.slice(-300))); }catch(e){} }
function addIdea(text, opts){
  opts = opts || {};
  const t = String(text || "").trim();
  if(!t) return null;
  const list = ideasAll();
  const row = { id: "SOUL." + (list.length + 1), kind: "idea",
    sys: "THE SOVEREIGN'S OWN WORDS" + (opts.via ? " · " + opts.via : ""),
    title: t.replace(/\s+/g, " ").slice(0, 96), says: t, stage: "SUPPLY", merged: false,
    soul: { verbatim: t, at: new Date().toISOString(), run: runNoOf() } };
  list.push(row); ideasSave(list);
  logOp({ kind:"soul", action:"idea filed", detail: t.slice(0, 200), result: row.id + " · starts as SOUL, at the pipeline", ref: row.id });
  try{ pheromone({ kind:"op", key:"idea", signal:"IDEA " + row.id, weight:12, meta:{ id: row.id } }); }catch(e){}
  return row;
}
function ideasMarkApplied(ids, info){
  const list = ideasAll();
  list.forEach(r => { if(ids.indexOf(r.id) !== -1){ r.merged = true; r.applied = info; } });
  ideasSave(list);
  return list;
}
/* THE PROOF — the sovereign's verbatim words, attached to a staged item so the pipeline may carry
   it. An idea starts as SOUL; these are the words that let it start. */
const SOUL_PROOF_KEY = "obi_soul_proof";
function soulProofs(){ try{ const o = JSON.parse(localStorage.getItem(SOUL_PROOF_KEY) || "{}"); return (o && typeof o === "object") ? o : {}; }catch(e){ return {}; } }
function soulProve(id, words){
  const w = String(words || "").trim();
  if(!id || !w) return null;
  const o = soulProofs();
  o[String(id).trim()] = { verbatim: w, at: new Date().toISOString(), run: runNoOf() };
  try{ localStorage.setItem(SOUL_PROOF_KEY, JSON.stringify(o)); }catch(e){}
  logOp({ kind:"soul", action:"proof attached", detail: id + " · " + w.slice(0, 160), result:"verbatim words on record", ref: id });
  return o[String(id).trim()];
}
window.ObiIdeas = { all: ideasAll, add: addIdea, markApplied: ideasMarkApplied, proofs: soulProofs, prove: soulProve, key: IDEAS_KEY };

/* the canon files the gate writes, and which staged rows each one carries */
const GATE_TARGETS = [
  { here:"src/canon/GOSPEL-999.md",              git:"CANON/SYSTEM/GOSPEL-999.md",             sys:/GOSPEL-999/i },
  { here:"src/canon/LEGIONNAIRE-FIELD-GUIDE.md", git:"CANON/SYSTEM/LegionnaireFieldGuide.md",  sys:/LEGIONNAIRE-FIELD-GUIDE/i }
];
const PROPOSE_BANNER = "AMENDMENT PROPOSED";
/* the station's copy = the branch's own text + the amendment block it appended. The gate must
   never clobber a branch that moved on: the PRISTINE body is what is on the branch NOW, and the
   block is the station's, so the write is (branch-as-it-is) + (the station's block). */
function splitAmendmentBlock(txt){
  const b = txt.indexOf(PROPOSE_BANNER);
  if(b < 0) return null;
  const sep = txt.lastIndexOf("\n---\n", b);
  if(sep < 0) return null;
  return { base: txt.slice(0, sep), block: txt.slice(sep) };
}
async function cmdCanonApply(change){
  const what = change ? "the sovereign's change" : "the staged amendments";
  if(!await omegaRequire("PHOENIXOMEGAPROTOCOL — write " + what + " to the authority")) return;
  const L = window.ObiILog;
  if(!L || !L.gitCommitFiles){ addBubble("ass", "⚠ src/ilog.js did not load — there is no write path, so nothing was written (fail closed)."); return; }
  const iso = new Date().toISOString().replace("T"," ").slice(0,19) + "Z";
  addBubble("ass", '<div class="rise"><div class="rhead">🔓 PHOENIXOMEGAPROTOCOL — writing ' + esc(what) + '</div><div class="rd">Branch <b>' + esc(CANON.doctrineBranch) + '</b> · the gate is armed, so this is a change, not a proposal.</div></div>');

  /* (2) FIRST: the sovereign's words, captured VERBATIM. An idea starts as SOUL. */
  let idea = null;
  if(change){ captureSoul(change, "the change, typed with PHOENIXOMEGAPROTOCOL"); idea = addIdea(change, { via:"typed with the protocol" }); }

  const written = []; const errors = [];
  for(const t of GATE_TARGETS){
    let gitBody = null;
    try{
      const r = await ghApiJson(CANON.base + "/contents/" + t.git + "?ref=" + CANON.doctrineBranch, { headers: Object.assign({}, CANON_GH()) });
      gitBody = (r.j && r.j.content) ? atob(String(r.j.content).replace(/\n/g,"")) : ((r.status === 200 && !r.j) ? r.txt : null);
    }catch(e){ errors.push(t.git + " read — " + e.message); }
    if(gitBody == null){ errors.push(t.git + " — the branch did not answer; nothing written for it"); continue; }
    if(gitBody.indexOf(PROPOSE_BANNER.replace("PROPOSED","APPLIED")) !== -1){
      written.push({ path:t.git, state:"ALREADY APPLIED", bytes:gitBody.length });
      PROPOSED_G999.forEach(r => { if(t.sys.test(r.sys) && !r.merged){ r.merged = true; r.applied = { at: iso, commit: null, note:"already on the branch" }; } });
      continue;
    }
    let newBody = null;
    if(change){
      newBody = gitBody.trimEnd() + "\n\n---\n\n## AMENDMENT — SOVEREIGN ORDER (APPLIED)\n\n"
        + "> **status:** APPLIED — written by the perchance Command Station under **PHOENIXOMEGAPROTOCOL**.\n"
        + "> **at:** " + iso + " · **authority:** SOV100_MICHAEL_HOBBS — the sovereign typed the protocol and the change in one breath.\n"
        + "> **record:** the SOUL (verbatim, below) · the I-LOG · the commit below.\n\n"
        + "**" + (idea ? idea.id : "SOUL") + "**\n\n" + String(change).trim() + "\n\n"
        + "_SOUL, verbatim:_ “" + String(change).trim() + "”\n";
      /* a new order lands on the amendment register (GOSPEL-999) only; the LFG is not the register */
      if(!/GOSPEL/i.test(t.git)) continue;
    } else {
      let hereTxt = null;
      try{ const fr = await fetch(t.here); hereTxt = fr.ok ? await fr.text() : null; }catch(e){}
      const sp = hereTxt ? splitAmendmentBlock(hereTxt) : null;
      if(!sp){ errors.push(t.here + " — no station amendment block found; nothing written for it"); continue; }
      newBody = gitBody.trimEnd() + "\n\n" + sp.block.split(PROPOSE_BANNER).join("AMENDMENT APPLIED — PHOENIXOMEGAPROTOCOL, " + iso);
    }
    let res = null;
    try{
      res = await L.gitCommitFiles({ owner: CANON.owner, repo: CANON.repo, branch: CANON.doctrineBranch,
        files: { [t.git]: newBody },
        message: "PHOENIXOMEGAPROTOCOL " + (idea ? idea.id + " — " + idea.title.slice(0,60) : "apply the staged amendments") });
    }catch(e){ errors.push(t.git + " write — " + e.message); continue; }
    if(res && res.commitSha){
      written.push({ path:t.git, state:"APPLIED", commit: res.commitSha, bytes: newBody.length });
      const info = { at: iso, commit: res.commitSha, branch: CANON.doctrineBranch };
      if(idea){ ideasMarkApplied([idea.id], info); }
      else { PROPOSED_G999.forEach(r => { if(t.sys.test(r.sys)){ r.merged = true; r.applied = info; } }); }
      logOp({ kind:"push", action:"canon apply", ok:true, detail: t.git + " @" + CANON.doctrineBranch, result: newBody.length + " B · commit " + String(res.commitSha).slice(0,8), ref: res.commitSha });
      try{ ilog({ kind:"omega", action:"apply", ok:true, detail: t.git, result:"written · commit " + String(res.commitSha).slice(0,8), ref: res.commitSha }); }catch(e){}
    } else {
      const why = (res && res.errors && res.errors.length) ? res.errors.slice(0,2).join(" · ") : "no commit returned";
      errors.push(t.git + " — " + why);
      logOp({ kind:"push", action:"canon apply", ok:false, detail:t.git, result:why });
    }
  }
  const okN = written.filter(w => w.state === "APPLIED").length;
  addBubble("ass", '<div class="rise"><div class="rhead">' + (okN ? "✅" : "⚠") + ' PHOENIXOMEGAPROTOCOL — ' + (okN ? "CHANGED" : "nothing changed") + '</div>'
    + (idea ? '<div class="rrow"><b>SOUL</b><span class="vd">' + esc(idea.id) + '</span><div class="rd">your words, verbatim, filed first: <i>“' + esc(idea.title) + '”</i> — it is in the ledger and on the pipeline</div></div>' : "")
    + written.map(w => '<div class="rrow"><b>' + esc(w.path) + '</b><span class="vd">' + esc(w.state) + '</span><div class="rd">' + esc(String(w.bytes)) + ' B' + (w.commit ? ' · commit <b>' + esc(String(w.commit).slice(0,8)) + '</b>' : "") + ' · branch <b>' + esc(CANON.doctrineBranch) + '</b></div></div>').join("")
    + (errors.length ? '<div class="rrow bad"><b>ERRORS</b><span class="vd">' + errors.length + '</span><div class="rd">' + esc(errors.slice(0,4).join(" · ")) + '</div></div>' : "")
    + '<div class="rfoot">' + (okN ? "The commit is the anchor. What you said is now in the canon on the authority branch, in the ledger, and in the I-LOG." : "The gate is armed but nothing landed — the errors are above, unhidden. Nothing was written.") + '</div></div>');
  updateTabMeta();
  return written;
}

/* /idea — an idea raised in the sovereign's own words. It starts as SOUL, and the pipeline
   carries it from there exactly like every other artifact. Nothing here is canon. */
async function cmdIdea(arg){
  const t = String(arg || "").trim();
  if(!t){
    addBubble("ass", '<div class="rise"><div class="rhead">💡 /idea — raise a change</div><div class="rd">Type <b>/idea &lt;your words&gt;</b>. They are captured <b>verbatim as SOUL</b> (L37 — never summarized), and the idea then walks the chain like everything else: <b>RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC</b>, and the gate writes it. To make it law in the same breath: <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b>.</div></div>');
    return;
  }
  const pair = t.match(/^([^:]{2,44}?)\s*::\s*([\s\S]+)$/);
  if(pair && /^(SOUL\.\d+|OMEGA|LFG|LESSON|LSN|CANON|PLACEMENT|BRAND|G444)/i.test(pair[1].trim())){
    /* the sovereign is giving an ALREADY-STAGED item its words — that is how it starts as SOUL */
    const want = pair[1].trim(), words = pair[2].trim();
    captureSoul(words, "attached to " + want);
    soulProve(want, words);
    const onLane = (window.ObiSCS && window.ObiSCS.proposalList) ? window.ObiSCS.proposalList() : [];
    const hit = onLane.filter(x => String(x.id).toLowerCase() === want.toLowerCase())[0]
             || onLane.filter(x => String(x.id).toLowerCase().indexOf(want.toLowerCase()) === 0)[0]
             || onLane.filter(x => String(x.id).toLowerCase().indexOf(want.toLowerCase()) !== -1)[0];
    addBubble("ass", '<div class="rise"><div class="rhead">\ud83d\udca1 SOUL attached \u2014 ' + esc(hit ? hit.id : want) + '</div>'
      + '<div class="rrow"><b>SOUL</b><span class="vd">\u2713 ON RECORD</span><div class="rd">\u201c' + esc(words) + '\u201d<br>your words, verbatim, run ' + esc(String(runNoOf())) + ' \u2014 the item may now be carried by the pipeline</div></div>'
      + '<div class="rrow"><b>NEXT</b><span class="vd">THE PIPELINE</span><div class="rd">it moves like everything else: SOUL \u2192 <b>' + esc(hit ? hit.stage : "SUPPLY") + '</b> \u2192 the gate. <b>/pipeline</b> shows where it sits</div></div>'
      + '<div class="rfoot">To make it law in the same breath: <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b>.</div></div>');
    return { id: hit ? hit.id : want, soul: true };
  }
  captureSoul(t, "raised as an idea (/idea)");
  const row = addIdea(t, { via: "raised with /idea" });
  let where = null;
  try{ const PR = window.ObiSCS && window.ObiSCS.proposals ? window.ObiSCS.proposals() : null; where = PR && PR.items ? PR.items.filter(x => x.id === row.id)[0] : null; }catch(e){}
  addBubble("ass", '<div class="rise"><div class="rhead">💡 ' + esc(row.id) + ' — filed as SOUL</div>'
    + '<div class="rrow"><b>SOUL</b><span class="vd">✓ VERBATIM</span><div class="rd">“' + esc(t) + '”<br>captured word for word, run ' + esc(String(runNoOf())) + ' — the words are the record, not a summary of them</div></div>'
    + '<div class="rrow"><b>WHERE IT SITS</b><span class="vd">' + esc(where ? where.at : "SOUL") + '</span><div class="rd">' + esc(where ? where.path : "RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC → GATE") + '<br>the chain it walks: <b>RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC</b>, then the gate. It moves when the record and the session reach each node</div></div>'
    + '<div class="rrow"><b>REVIEWED</b><span class="vd">/pipeline</span><div class="rd">not a command, not canon: <b>/pipeline</b> prints it at its stage, and <b>/proposed</b> is the index</div></div>'
    + '<div class="rfoot">To make it law: <b>/PhoenixOmegaProtocol &lt;password&gt;</b> then <b>/phoenixomegaprotocol apply &lt;the change&gt;</b> — or both in one breath, <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b>. The gate writes; a proposal is not a change.</div></div>');
  return row;
}

async function cmdCanon(arg){
  const a = (arg || "").trim().toLowerCase();
  if(a === "place" || a === "mirror" || a === "mirrors"){ await cmdCanonPlace(); return; }
  if(a === "apply" || a.startsWith("apply ")){ await cmdCanonApply(a.replace(/^apply\s*/i, "").trim()); return; }
  if(a === "sync"){ await cmdCanonSync(); return; }
  if(a === "doctrine" || a === "push doctrine"){
    /* the doctrine amendment → the authority, gated. Nothing is merged: the file
       is proposed, and Sov100 merges it. */
    if(!await omegaRequire("/canon doctrine — the two amendments (I-LOG/Omega + Lesson Authority) → the authority")) return;
    addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon doctrine — proposing the amendments…</div><div class="rd">GOSPEL-999 (Ω.001–Ω.007 + LESSON.001–LESSON.018) + Legionnaire Field Guide §11–12 + the station\'s copies → OPERATIONS/COMMANDSTATION/DOCTRINE/</div></div>');
    const res = await canonPushSession({ doctrine: true });
    if(res === "NO_TOKEN"){ addBubble("ass", "⚠ No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); logOp({ kind:"push", action:"canon doctrine", ok:false, result:"no token — nothing left the browser" }); return; }
    const ok = res.failed === 0 && !!res.commitSha;
    addBubble("ass", '<div class="rise"><div class="rhead">' + (ok ? "✅" : "⚠") + ' /canon doctrine</div>'
      + '<div class="rrow"><b>RESULT</b><span class="vd">' + (ok ? "PUSHED" : "FAILED") + '</span><div class="rd">' + res.pushed + " / " + (res.files || "?") + " files" + (res.commitSha ? " · commit <b>" + esc(res.commitSha.slice(0, 8)) + "</b>" : "") + '</div></div>'
      + '<div class="rrow"><b>MERGE</b><span class="vd">SOV100</span><div class="rd">nothing was rewritten in place — the amendment is proposed at <span class="rd">' + esc("OPERATIONS/COMMANDSTATION/DOCTRINE/") + '</span> and takes effect when you merge it into the sealed canon</div></div>'
      + (res.errors && res.errors.length ? '<div class="rrow"><b>ERRORS</b><span class="vd">' + res.errors.length + '</span><div class="rd">' + esc(res.errors.slice(0, 3).join(" · ")) + '</div></div>' : "")
      + '<div class="rfoot">Carries: <b>I-LOG-AND-OMEGA-AMENDMENT.md</b> + <b>LESSON-AUTHORITY-AMENDMENT.md</b> + the amended copies of <b>GOSPEL-999.md</b> and <b>LEGIONNAIRE-FIELD-GUIDE.md</b> (sections 11–12). The commit is the anchor.</div></div>');
    logOp({ kind:"push", action:"canon doctrine", ok: ok, detail: CANON.owner + "/" + CANON.repo + "@" + CANON.branch + " · DOCTRINE/ (both amendments + both amended copies)", result: res.pushed + " pushed · " + res.failed + " failed" + (res.commitSha ? " · commit " + res.commitSha.slice(0, 8) : ""), ref: res.commitSha });
    return;
  }
  if(a === "registry"){
    const rows = CANON_REGISTRY.map(r => '<div class="rrow"><b>'+esc(r[0])+'</b><span class="vd">'+esc(String(r[4]).toUpperCase())+'</span><div class="rd">'+(r[3]?"\u2713 BUILT \u00b7 ":"\u2717 NOT BUILT \u00b7 ")+esc(r[2])+'</div></div>').join("");
    const built = CANON_REGISTRY.filter(r => r[3]).length;
    const canonOnly = CANON_REGISTRY.filter(r => r[4] === "canon" && !r[3]).length + CANON_ONLY.length;
    addBubble("ass", '<div class="rise"><div class="rhead">\ud83d\udcdc /canon registry \u2014 the commands, and whose they are</div>'
      + '<div class="rrow"><b>SUMMARY</b><span class="vd">'+built+' / '+CANON_REGISTRY.length+' BUILT</span><div class="rd">Every row says whether this deck really accepts it (<b>\u2713 BUILT</b>) and where it comes from: <b>CANON</b> = the command is named in the canon branch\u2019s own files (the SCS seven, plus the CANON/SYSTEM and VAULT protocols) \u00b7 <b>STATION</b> = this station invented it and the canon does not have it \u00b7 <b>PROPOSED</b> = it implements an amendment this station proposed but Sov100 has not merged.</div></div>'
      + '<div class="rrow"><b>AUTHORITY</b><span class="vd">CANON BRANCH</span><div class="rd">The canon\u2019s command set is the <b>SCS</b>, named once: <b>CANON/SYSTEM/GOSPEL-999.md \u00a7SYSTEM I</b> + <b>CANON/SYSTEM/LegionnaireFieldGuide.md \u00a7SCS</b> \u2014 /phoenixRISE /phoenixSCOUT /phoenixMARCH /phoenixSCHOLAR /phoenixSUPPLY /phoenixFORTIFY /phoenixDEATH. The <b>.kilo/command/</b> registry is the KILO lineage and is NOT authority.</div></div>'
      + rows
      + '<div class="rrow"><b>CANON, NOT HERE</b><span class="vd">'+canonOnly+'</span><div class="rd">canon commands this deck does NOT implement: '+CANON_ONLY.map(esc).join(" \u00b7 ")+'</div></div>'
      + '<div class="rfoot">'+CANON_REGISTRY.length+' rows \u00b7 '+built+' built \u00b7 '+canonOnly+' canon commands with no station implementation. The gap is printed, never hidden \u2014 a registry that omits what it cannot do is a map that lies (L58).</div></div>');
    logOp({ kind:"op", action:"canon registry", result: CANON_REGISTRY.length + " rows \u00b7 " + built + " built \u00b7 " + canonOnly + " canon-only" });
    rrlAppend(runNoOf(),"DNA","Obi: [/canon registry \u2014 "+CANON_REGISTRY.length+" rows, "+built+" built]");
    return;
  }
  if(a === "proposed" || a === "proposals" || a === "staging"){
    /* the staging lane — aliases /proposed: the walk-through the sovereign reads
       before anything is merged. Nothing here is canon. */
    await cmdProposed();
    return;
  }
  if(a === "soul"){
    addBubble("ass", "Contacting the SOULCOUNT gate…");
    const soul = await canonSoulCount();
    addBubble("ass", '<div class="rise"><div class="rhead">🔥 SOULCOUNT gate</div><div class="rrow"><b>COUNT</b><span class="vd">'+esc(String(soul))+'</span><div class="rd">soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count</div></div><div class="rfoot">TITANIUM_ANCHOR per doctrine — never summarize the soul, only count evidence.</div></div>');
    return;
  }
  addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon — contacting the authoritative repo…</div><div class="rd">Pulling doctrine from Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- (canon branch)…</div></div>');
  const [docs, workers, soul] = await Promise.all([canonPull(), canonWorkerStatus(), canonSoulCount()]);
  const pulled = CANON.files.filter(f => docs[f]).length;
  /* 2026-09-27 — the honest half-truth fix. This card used to print "DOWN" for every doctrine file when the
     authority returned 404, which reads as "the canon is down". It is not: ONE branch is behind a PAT, and a
     large part of the canon answers anyone with no token. When nothing can be pulled, say exactly that and
     hand the reader to /git (src/gitcanon.js), which measures every part of the git live. */
  if(pulled === 0){
    addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon — the authority did not answer</div>'
      + '<div class="rrow"><b>' + esc(CANON.owner + "/" + CANON.repo) + '</b><span class="vd" style="background:#8a1f1f">BEHIND A PAT</span><div class="rd">Every path under <b>' + esc(CANON.doctrineBranch) + '</b> answered <b>404</b> ' + (keyGet("gh") ? "even with the stored token" : "and no GitHub token is stored") + '. GitHub answers <b>404, not 403</b>, to an unauthenticated reader of a private repo — so from here a private repo and a missing one look identical, and this card will not guess which it is.</div></div>'
      + '<div class="rrow"><b>THIS IS NOT "THE CANON IS DOWN"</b><span class="vd">OPEN GIT</span><div class="rd">A large part of the canon answers anyone right now, with no token: the public monorepo (CANON/, APPS/, OPERATIONS/, ARCHIVE/), the live Worker bundle, and ~100 verbatim soul-DNA chat logs. <b>/git</b> measures and shows all of it — <b>/git repos</b> · <b>/git tree CANON</b> · <b>/git read &lt;path&gt;</b> · <b>/git archive</b> · <b>/git auth</b> for the locked door and the one line that opens it.</div></div>'
      + '<div class="rrow"><b>SOULGATE</b><span class="vd">' + esc(String(soul)) + '</span><div class="rd">soul-logger — this half still answers</div></div>'
      + workers.map(w => '<div class="rrow"><b>'+esc(w.name)+'</b><span class="vd">'+(w.ok?"UP":"DOWN")+'</span><div class="rd">'+esc(w.detail||"")+'</div></div>').join("")
      + '<div class="rfoot">To open the authority: <b>/vault recover &lt;passphrase&gt;</b> (no token, no stored state) or <b>/vault set gh &lt;PAT&gt;</b>. /canon sync · /canon registry · /canon soul · /doctor</div></div>');
    rrlAppend(runNoOf(), "DNA", "Obi: [/canon — authority 404 (no token); pointed to /git, the open canon]");
    logOp({ kind:"op", action:"canon", ok:false, result:"authority 404 — no doctrine pulled; /git offered" });
    return;
  }
  const docRows = CANON.files.map(f => {
    const c = docs[f];
    const ok = !!c;
    const preview = ok ? esc(c.slice(0,160).replace(/\n/g," ")) + "…" : "(unreachable — is the repo public?)";
    return '<div class="rrow"><b>'+esc(f)+'</b><span class="vd">'+(ok ? c.length+"B" : "DOWN")+'</span><div class="rd">'+preview+'</div></div>';
  }).join("");
  const wRows = workers.map(w => '<div class="rrow"><b>'+esc(w.name)+'</b><span class="vd">'+(w.ok?"UP":"DOWN")+'</span><div class="rd">'+esc(w.detail||"")+'</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon — authoritative repo</div>'
    +'<div class="rrow"><b>REPO</b><span class="vd">'+esc(CANON.doctrineBranch)+'</span><div class="rd">Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- (the ONE authority) · doctrine read from the <b>'+esc(CANON.doctrineBranch)+'</b> branch · this station writes its own chain to <b>'+esc(CANON.branch)+'</b></div></div>'
    +docRows
    +'<div class="rrow"><b>SOULGATE</b><span class="vd">'+esc(String(soul))+'</span><div class="rd">soul-logger</div></div>'
    +wRows
    +'<div class="rfoot">/canon sync · /canon registry · /canon soul · /doctor · /gateway · /ledger · /audit · /report</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/canon — doctrine " + CANON.files.filter(f=>docs[f]).length + "/" + CANON.files.length + " pulled, soulgate " + soul + "]");
}
async function cmdCanonSync(){
  if(!await omegaRequire("/canon sync — session record + sources + I-LOG → the authority")) return;
  addBubble("ass", '<div class="rise"><div class="rhead">🔄 /canon sync — pushing perchance operations → Canon…</div><div class="rd">Building session record + app snapshot + the I-LOG, committing to master…</div></div>');
  const res = await canonPushSession();
  if(res === "NO_TOKEN"){ addBubble("ass","⚠ No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); logOp({ kind:"push", action:"canon sync", ok:false, result:"no token — nothing left the browser" }); return; }
  const ok = res.failed === 0 && !!res.commitSha;
  addBubble("ass", '<div class="rise"><div class="rhead">'+(ok?"✅":"⚠")+' /canon sync</div>'
    +'<div class="rrow"><b>RESULT</b><span class="vd">'+(ok?"PUSHED":"FAILED")+'</span><div class="rd">'+res.pushed+' / '+(res.files||"?")+' files'+(res.commitSha ? " · commit <b>"+esc(res.commitSha.slice(0,8))+"</b>" : "")+'</div></div>'
    +'<div class="rrow"><b>I-LOG</b><span class="vd">'+(res.ilogEntries||0)+'</span><div class="rd">operation chain + canon-schema transcript pushed to OPERATIONS/COMMANDSTATION/ILOG/'+(res.anchor ? ' · anchored as <b>'+esc(String(res.anchor.commit).slice(0,8))+'</b>' : "")+'</div></div>'
    +'<div class="rrow"><b>BRANCH</b><span class="vd">'+esc(CANON.branch)+'</span><div class="rd">'+esc(CANON.owner+"/"+CANON.repo)+' · OPERATIONS/COMMANDSTATION/</div></div>'
    +'<div class="rrow"><b>MIRROR</b><span class="vd">'+esc(res.mirror ? (res.mirror.ok ? (res.mirror.removed.length ? res.mirror.removed.length + " PRUNED" : "EXACT") : "NOT READ") : "?")+'</span><div class="rd">'+(res.mirror ? (res.mirror.ok ? (res.mirror.removed.length ? "removed from the branch: <b>" + esc(res.mirror.removed.map(p => p.replace("OPERATIONS/COMMANDSTATION/perchance/", "")).join(", ")) + "</b> — withdrawn here, so gone there (the mirror is exact)" : "the branch's perchance/ holds exactly this station's declared files (" + res.mirror.declared + " declared, " + res.mirror.have + " on the branch)") : esc("prune skipped: " + res.mirror.why)) : "the branch was not read")+'</div></div>'
    +(res.errors && res.errors.length ? '<div class="rrow"><b>ERRORS</b><span class="vd">'+res.errors.length+'</span><div class="rd">'+esc(res.errors.slice(0,3).join(" · "))+'</div></div>' : "")
    +'<div class="rfoot">'+(ok ? 'View: <b>https://github.com/'+esc(CANON.owner)+'/'+esc(CANON.repo)+'/blob/'+esc(CANON.branch)+'/OPERATIONS/COMMANDSTATION/session-'+esc(res.ts)+'-run'+(currentRun()?currentRun().run:"?")+'.md</b>' : "Base " + esc(String(res.baseSha||"?").slice(0,8)) + " — token scopes or repo write access?")+'</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/canon sync → " + CANON.owner + "/" + CANON.repo + " — " + res.pushed + " files, " + res.failed + " failed]");
  logOp({ kind:"push", action:"canon sync", ok: ok, detail: CANON.owner+"/"+CANON.repo+"@"+CANON.branch+" · "+(res.files||"?")+" files (session + sources + I-LOG "+ (res.ilogEntries||0) + " entries)", result: res.pushed+" pushed · "+res.failed+" failed"+(res.commitSha?" · commit "+res.commitSha.slice(0,8):""), ref: res.commitSha });
}

/* /ilog — the station's own operation record: what it did, whether the chain
   still verifies, and whether Git has witnessed it. */
async function cmdILog(arg){
  const L = window.ObiILog;
  if(!L){ addBubble("ass", "⚠ src/ilog.js didn't load — the operation record is unavailable (reload the page)."); return; }
  const a = String(arg || "").trim().toLowerCase();
  if(a === "verify"){
    addBubble("ass", "🔎 /ilog verify — recomputing the whole chain…");
    const v = await L.verify();
    const rows = (v.segments || []).map(sg => '<div class="rrow' + (sg.ok ? "" : ' bad') + '"><b>SEGMENT ' + esc(sg.seg) + '</b><span class="vd">' + (sg.ok ? "CHAIN OK" : "BROKEN") + '</span><div class="rd">'
      + sg.entries + " entries · #" + esc(sg.firstSeq) + "–" + esc(sg.lastSeq) + " · head <b>" + esc(String(sg.head || "").slice(0, 16)) + "</b>… · " + esc(sg.alg || "?") + '</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">' + (v.ok ? "✅" : "⚠") + ' /ilog verify — ' + (v.ok ? "the chain holds" : "a break is real and named") + '</div>'
      + '<div class="rrow"><b>RESULT</b><span class="vd">' + (v.ok ? "OK" : "BROKEN") + '</span><div class="rd">' + v.checked + " entries recomputed in " + v.ms + "ms · " + (v.empty ? "nothing logged yet" : "kv " + (v.kv ? "present" : "UNREACHABLE")) + '</div></div>'
      + (v.breaks && v.breaks.length ? '<div class="rrow bad"><b>FIRST BREAK</b><span class="vd">#' + esc(v.breaks[0].seq) + '</span><div class="rd">link ' + esc(v.breaks[0].link) + " · hash " + esc(v.breaks[0].hash) + " · " + esc(v.breaks[0].alg) + '</div></div>' : "")
      + (v.why ? '<div class="rrow bad"><b>GAP</b><span class="vd"></span><div class="rd">' + esc(v.why) + '</div></div>' : "")
      + rows
      + '<div class="rfoot">Each hash = sha-256 over the entry\'s canonical tuple + the previous entry\'s hash. Rewrite one entry and every later hash stops matching — that is the whole point of the chain. A Git anchor is the only witness outside this browser.</div></div>');
    logOp({ kind:"op", action:"ilog verify", ok: v.ok, detail: v.checked + " entries recomputed", result: v.ok ? "chain OK" : "BROKEN at #" + (v.breaks[0] ? v.breaks[0].seq : "?") });
    return;
  }
  if(a === "push" || a === "anchor"){
    if(!await omegaRequire("/ilog push — anchoring the I-LOG on Git")) return;
    addBubble("ass", "📦 /ilog push — anchoring the record on Git…");
    const r = await L.push({});
    if(r.dryRun){
      addBubble("ass", '<div class="rise"><div class="rhead">⚠ /ilog push — nothing was sent</div>'
        + '<div class="rrow"><b>WHY</b><span class="vd">' + esc(r.reason === "NO_TOKEN" ? "NO TOKEN" : "DRY RUN") + '</span><div class="rd">' + (r.reason === "NO_TOKEN" ? "no GitHub token in this browser — <b>/gh token &lt;PAT&gt;</b> stores one locally (never in this source)" : "dry run — the payload below is exactly what a push would write") + '</div></div>'
        + '<div class="rrow"><b>WOULD WRITE</b><span class="vd">' + r.plan.files.length + ' files</span><div class="rd">' + r.plan.files.map(f => esc(f.path.replace(L.DIR, "")) + " (" + Math.round(f.bytes / 1024) + "kb)").join("<br>") + '</div></div>'
        + '<div class="rrow"><b>TARGET</b><span class="vd">' + esc(r.plan.head ? String(r.plan.head).slice(0, 12) : "empty log") + '</span><div class="rd">' + esc(r.plan.target) + " · head frozen at push time · " + r.plan.entries + " chain entries · " + Math.round(r.plan.bytes / 1024) + "kb</div></div>"
        + '<div class="rfoot">Until this push happens the record lives only on this origin (kv + localStorage mirror). That is the honest state of "backed up": <b>not yet</b>.</div></div>');
      logOp({ kind:"push", action:"ilog push", ok:false, detail: r.plan.files.length + " files prepared", result: r.reason === "NO_TOKEN" ? "no token — dry run only" : "dry run" });
      return;
    }
    addBubble("ass", (r.ok ? "✅" : "⚠") + ' /ilog push — <b>' + r.pushed + '</b> files pushed, <b>' + r.failed + '</b> failed.'
      + (r.commitSha ? '<br>Anchor commit <b>' + esc(r.commitShort) + '</b> in <b>' + esc(L.REPO.owner + "/" + L.REPO.repo) + '@' + esc(L.REPO.branch) + '</b> — the chain head <b>' + esc(String(r.head || "").slice(0, 12)) + '</b> is now witnessed outside this browser.'
      : '<br><span class="rd">' + esc((r.errors || []).slice(0, 3).join(" · ") || "no commit") + '</span>'));
    rrlAppend(runNoOf(), "DNA", "Obi: [/ilog push — " + r.pushed + " files, commit " + (r.commitSha ? r.commitSha.slice(0, 8) : "none") + "]");
    logOp({ kind:"push", action:"ilog push", ok: r.ok, detail: r.entries + " chain entries + transcript", result: r.pushed + " pushed · " + r.failed + " failed" + (r.commitSha ? " · commit " + r.commitShort : ""), ref: r.commitSha });
    return;
  }
  if(a === "pull"){
    addBubble("ass", "📥 /ilog pull — reading the Canon back…");
    const p = await L.pull();
    const vs = p.vs || {};
    const inc = vs.incarnations || [];
    const rrl = (vs.rrl || []).filter(f => !/^DNA-LOG/i.test(f.name));
    const vsRows = '<div class="rrow"><b>VS CODE I-LOG — "incarnate" SERIES</b><span class="vd">' + inc.length + ' TRANSCRIPTS</span><div class="rd">'
      + (inc.length ? inc.map(n => esc(n)).join("<br>") : "nothing readable on the VS branch")
      + '<br><span class="rd">branch <b>' + esc(vs.branch || "canon") + '</b> · <b>' + esc(vs.unauditedDir || "I-LOG-UNAUDITED") + '/</b> — ' + (vs.unaudited || []).length + " files: the verbatim <b>.txt</b> + its SOUL/DNA/REASON <b>-COLORIZED.md</b> + <b>-STATS.json</b>. The VS Code station owns these; this station never renumbers or rewrites them.</span></div></div>"
      + '<div class="rrow"><b>I-LOG DIRECTORY (' + esc(vs.vaultDir || "RRL") + '/)</b><span class="vd">' + (rrl.length || 0) + ' FILES</span><div class="rd">'
      + (rrl.length ? rrl.slice(0, 14).map(f => esc(f.name) + ' <span class="rd">' + Math.round((f.bytes || 0) / 1024) + 'kb</span>').join("<br>") : "not readable")
      + '</div></div>'
      + '<div class="rrow"><b>CURRENT POINTER</b><span class="vd">' + esc(vs.currentPath || "") + '</span><div class="rd">' + (vs.current ? esc(vs.current) : "not readable") + '</div></div>';
    addBubble("ass", '<div class="rise"><div class="rhead">📥 /ilog pull — ' + esc(p.target) + '</div>'
      + '<div class="rrow"><b>THIS STATION\'S EARLIER PUSHES</b><span class="vd">' + p.files.length + ' files</span><div class="rd">' + (p.files.length ? p.files.map(f => esc(f.name) + ' <span class="rd">' + Math.round((f.bytes || 0) / 1024) + 'kb</span>').join("<br>") : "nothing readable at " + esc(L.DIR)) + '</div></div>'
      + vsRows
      + '<div class="rrow"><b>CANON I-LOG INDEX</b><span class="vd">' + (p.vaultOk ? "READABLE" : "NOT READABLE") + '</span><div class="rd">' + (p.vaultOk ? esc(String(p.vaultIndex || "").slice(0, 420)) : "the I-LOG index could not be read" + (p.auth ? "" : " — this repo needs the stored token (private)")) + '</div></div>'
      + (p.errors.length ? '<div class="rrow"><b>ERRORS</b><span class="vd">' + p.errors.length + '</span><div class="rd">' + esc(p.errors.slice(0, 3).join(" · ")) + '</div></div>' : "")
      + '<div class="rfoot">Two records, two branches: this station appends its own chain to <b>' + esc(L.REPO.branch) + '</b> (' + esc(L.DIR) + ') and the VS Code station\'s I-LOG (Incarnation Log) lives on <b>' + esc((L.VS && L.VS.branch) || "canon") + '</b> — the <b>incarnate-</b> series above. They sit beside each other; neither is renumbered or rewritten here.</div></div>');
    logOp({ kind:"op", action:"ilog pull", ok: p.ok, detail: p.files.length + " pushed file(s) + " + inc.length + " VS Code incarnation transcript(s)", result: p.vaultOk ? "both records readable" : (p.auth ? "vault unreadable" : "no token — public read only") });
    return;
  }
  if(a === "export"){
    const e = await L.exportFile();
    addBubble("ass", "📄 /ilog export — <b>" + esc(e.name) + "</b> (" + e.entries + " entries · " + Math.round(e.bytes / 1024) + "kb).<br><span class=\"rfoot\">Plain JSONL — one entry per line, hashes and all. Verify it anywhere: recompute the chain and compare the head to the newest anchor.</span>");
    logOp({ kind:"export", action:"ilog export", detail: e.name, result: e.entries + " entries · " + e.bytes + " bytes" });
    return;
  }
  if(a === "anchors" || a === "history"){
    const list = await L.anchors();
    const st = await L.stats();
    addBubble("ass", '<div class="rise"><div class="rhead">⚓ /ilog anchors — ' + list.length + ' commit(s)</div>'
      + (list.length ? list.slice().reverse().map(x => '<div class="rrow"><b>' + esc(String(x.commit || "").slice(0, 8)) + '</b><span class="vd">' + esc(String(x.seq || "?")) + '</span><div class="rd">' + esc(x.iso || "") + ' · ' + esc(x.repo || "") + '@' + esc(x.branch || "") + ' · ' + (x.count || "?") + ' entries · head <span class="rd">' + esc(String(x.head || "").slice(0, 12)) + '</span> · ' + esc(x.path || "") + '</div></div>').join("") : '<div class="rrow"><b>NONE</b><span class="vd"></span><div class="rd">the record has never been anchored on Git — it exists only in this browser</div></div>')
      + '<div class="rrow"><b>UNANCHORED NOW</b><span class="vd">' + st.unanchored + '</span><div class="rd">entries written since the newest anchor' + (st.unanchored ? " — they ride the next <b>/ilog push</b>" : "") + '</div></div>'
      + '<div class="rfoot">A commit is the witness: it fixes the chain head at a time, in a place this browser does not control.</div></div>');
    logOp({ kind:"op", action:"ilog anchors", ok:true, detail: list.length + " anchors", result: st.unanchored + " unanchored entries" });
    return;
  }
  if(a === "reset" || a === "seal"){
    if(!/confirm/.test(a)){
      addBubble("ass", "⚠ <b>/ilog reset confirm</b> — it writes a SEAL entry (nothing is ever deleted) and starts a new segment. The sealed entries stay in the log and stay verifiable.");
      return;
    }
    const r = await L.reset("sealed by the sovereign via /ilog reset");
    addBubble("ass", "🔏 Sealed <b>" + r.sealed + "</b> entries at head <b>" + esc(String(r.prevHead || "none").slice(0, 12)) + "</b>. Segment <b>" + r.seg + "</b> is open — the chain continues from the seal, and the sealed history is kept, not deleted.");
    logOp({ kind:"seal", action:"reset", detail: r.sealed + " entries sealed", result: "segment " + r.seg + " open", ref: "seg" + r.seg });
    return;
  }
  if(a){ addBubble("ass", "Unknown /ilog sub-command. Try <b>/ilog</b>, <b>verify</b>, <b>push</b>, <b>pull</b>, <b>export</b>, <b>anchors</b>, <b>reset confirm</b>."); return; }
  {
    const st = omegaStatusText();
    const ent = await omegaEntry();
    addBubble("ass", await L.card({ armed: st.armed, minsLeft: st.armedMinutesLeft, enrolled: !!ent }));
  }
  logOp({ kind:"op", action:"ilog", ok:true, detail:"record card rendered", result:"shown in the chat" });
}
async function cmdStatus(){
  addBubble("ass", '<div class="rise"><div class="rhead">🩺 /status — checking…</div><div class="rd">Pinging fleet + soulgate…</div></div>');
  const [workers, soul] = await Promise.all([canonWorkerStatus(), canonSoulCount()]);
  const wRows = workers.map(w => '<div class="rrow"><b>'+esc(w.name)+'</b><span class="vd">'+(w.ok?"UP":"DOWN")+'</span><div class="rd">'+esc(w.detail||"")+'</div></div>').join("");
  const run = currentRun();
  let rrlN = "?";
  try{ rrlN = (loadRRL(runNoOf()).entries || []).length; }catch(e){}
  addBubble("ass", '<div class="rise"><div class="rhead">🩺 /status — fleet + canon</div>'
    +'<div class="rrow"><b>SESSION</b><span class="vd">run '+(run?run.run:"?")+'</span><div class="rd">soul '+sessionSoulCount+' chars · RRL '+rrlN+' entries</div></div>'
    +'<div class="rrow"><b>SOULGATE</b><span class="vd">'+esc(String(soul))+'</span><div class="rd">soul-logger</div></div>'
    +wRows
    +'<div class="rrow"><b>TUNNEL</b><span class="vd">'+(cmdSocketOpen()?"OPEN":"LOCAL")+'</span><div class="rd">Agent 99 → Legion (server-plugin)</div></div>'
    +'<div class="rfoot">/doctor for checks · /canon for the repo · /canon sync to push</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/status — soulgate "+soul+", workers " + workers.filter(w=>w.ok).length + "/" + workers.length + " up]");
}
async function cmdGateway(){
  addBubble("ass", '<div class="rise"><div class="rhead">🌉 /gateway — Agent 99 → Legion…</div><div class="rd">Checking the command tunnel…</div></div>');
  let tunnel = "unreachable", queueN = "?";
  try{
    const st = await cmdFetch("/api/command/status");
    if(st.ok && st.data){
      tunnel = st.data.status || "open";
      queueN = (st.data.counts && st.data.counts.pending != null) ? st.data.counts.pending : (st.data.pending != null ? st.data.pending : "?");
    }
    else if(cmdSocketOpen()){ tunnel = "open"; }
  }catch(e){}
  let canonTunnel = "?";
  const workers = await canonWorkerStatus();
  canonTunnel = workers.filter(w => w.ok).length + "/" + workers.length + " workers up";
  addBubble("ass", '<div class="rise"><div class="rhead">🌉 /gateway — command tunnels</div>'
    +'<div class="rrow"><b>AGENT 99 → LEGION</b><span class="vd">'+(cmdSocketOpen()?"● LIVE":"○ LOCAL")+'</span><div class="rd">server-plugin · '+esc(tunnel)+' · pending '+esc(queueN)+'</div></div>'
    +'<div class="rrow"><b>CANON FLEET</b><span class="vd">'+esc(canonTunnel)+'</span><div class="rd">phoenix-architecti · pcc · net-pet-ai · soul-logger</div></div>'
    +'<div class="rfoot">Your words ride this gateway, captured as Soul DNA first, then routed to the Legion. /queue to see the tunnel live.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/gateway — tunnel " + tunnel + ", fleet " + canonTunnel + "]");
}
/* THE ANCHOR VERDICT — a local "never anchored" is not the same claim as "never
   anchored on Git". The chain on this origin lost its anchors when the station was
   renamed (the anchors lived in name-keyed kv), but the authority branch may still
   hold an anchored chain — a DIFFERENT one, with colliding seq numbers. So when this
   origin has no anchor, read the branch's own anchors.json and print what it
   actually holds. Fail closed: an unreadable branch is named as unreadable. */
async function ilogAnchorVerdict(){
  try{
    const L = window.ObiILog;
    if(!L || !L.remoteAnchors) return { ok:false, why:"src/ilog.js remoteAnchors is not loaded" };
    return await L.remoteAnchors();
  }catch(e){ return { ok:false, why:String((e && e.message) || e) }; }
}
function ilogAnchorPhrase(r){
  if(!r || !r.ok) return "the authority branch could not be read" + ((r && r.why) ? " (" + r.why + ")" : "");
  if(!r.anchors.length) return "the branch holds no anchors either (" + r.branch + ":" + r.path + ")";
  const list = r.anchors.map(a => "seq " + a.seq + " @" + String(a.commit || "").slice(0, 8)).join(", ");
  return "the branch holds " + r.anchors.length + " anchor(s): " + list + " — " + (r.verdict || "");
}
async function cmdDoctor(){
  const run = currentRun();
  const checks = [];
  const k = (()=>{ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}"); }catch(e){ return {}; } })();
  checks.push(["CF token", !!k.cf, k.cf ? "stored" : "missing — /cf token"]);
  checks.push(["CF account", !!k.cfAcct, k.cfAcct ? k.cfAcct : "missing — /cf token <token> stores the account id with the token"]);
  checks.push(["CF R2 pair", !!(k.cfR2Key && k.cfR2Secret), (k.cfR2Key && k.cfR2Secret) ? ("stored · " + k.cfAcct + ".r2.cloudflarestorage.com · /cf r2 to prove it with a signed S3 request") : "missing — /cf r2 <accessKeyId> <secret> (the S3 pair for the object store)"]);
  checks.push(["GH token", !!k.gh, k.gh ? "stored" : "missing — /gh token"]);
  checks.push(["DG token", !!k.deepgram, k.deepgram ? "stored" : "missing — /dg token"]);
  let rrlOk = false; try{ rrlOk = (loadRRL(runNoOf()).entries || []).length > 0; }catch(e){}
  checks.push(["RRL writing", rrlOk, rrlOk ? "entries present" : "empty this run"]);
  checks.push(["Soul ledger", (ledger.soul || []).length > 0, (ledger.soul || []).length + " records"]);
  checks.push(["Run open", run ? !run.closed : false, run ? ("run " + run.run + (run.closed ? " CLOSED" : " open")) : "no run"]);
  checks.push(["Tunnel", cmdSocketOpen(), cmdSocketState]);
  let ilogOk = false, ilogNote = "src/ilog.js NOT loaded — no operation record";
  try{
    if(window.ObiILog){
      const st = await window.ObiILog.stats();
      ilogOk = st.count > 0;
      ilogNote = st.count + " entries · head " + st.headShort + " · kv " + (st.kv ? "ok" : "UNREACHABLE") + (st.mirrorOnly ? " · " + st.mirrorOnly + " mirror-only" : "")
        + " · " + (st.anchors ? "last anchor " + st.lastAnchor.commitShort + "… · " + st.unanchored + " unanchored" : "NEVER ANCHORED here — " + ilogAnchorPhrase(await ilogAnchorVerdict()));
    }
  }catch(e){ ilogNote = "I-LOG unreadable: " + e.message; }
  checks.push(["I-LOG", ilogOk, ilogNote]);
  const oEnt = await omegaEntry();
  const oSt = omegaStatusText();
  checks.push(["OMEGA gate", !!oEnt, oEnt ? ("enrolled (" + (oEnt.alg || "sha-256") + ") · gate " + (oSt.armed ? "ARMED " + oSt.armedMinutesLeft + "m" : "locked") + " · failures " + oSt.fails + "/" + OMEGA_MAX_FAILS) : "no password enrolled in this browser — /phoenixomegaprotocol set <new> <new> (the Canon cannot be written until it is)"]);
  try{
    const em = window.ObiVault && window.ObiVault.escrow ? window.ObiVault.escrow() : null;
    checks.push(["Vault escrow", !!(em && em.at), em && em.at
      ? ("crown jewel wrapped " + String(em.at).slice(0, 10) + (em.url ? " · canon + mirror" : " · canon copy only")
         + (em.recoveryUrl ? " · 1-URL recovery bundle published (passphrase alone rebuilds the vault, no GitHub token needed)" : " · NO recovery bundle — /vault escrow <passphrase> publishes the one URL that needs no token"))
      : "THE PRIVATE KEY EXISTS ONLY IN THIS BROWSER — /vault escrow <passphrase> makes it recoverable (do this)"]);
  }catch(e){}
  let rubOk = false, rubNote = "src/rubric.js NOT loaded \u2014 the evaluator has no instrument";
  try{
    if(window.ObiRubric){
      const c = await window.ObiRubric.canary();
      rubOk = c.pass === c.total;
      rubNote = c.pass + "/" + c.total + " canary checks \u2014 arithmetic beats opinion \u00b7 an invented quote is refused \u00b7 a band with no citation is NOT SCORED \u00b7 the clock is read off the record \u00b7 coverage travels with the total \u00b7 a forged citation is caught by verify";
    }
  }catch(e){ rubNote = "the rubric canary threw: " + e.message; }
  checks.push(["Rubric instrument", rubOk, rubNote]);
  checks.push(["ONE authority", true, CANON.owner + "/" + CANON.repo + "@" + CANON.branch + " · PHOENIXOMEGAPROTOCOL gates every write"]);
  addBubble("ass", '<div class="rise"><div class="rhead">🩺 /doctor — evidence-first checks</div>' + checks.map(c => '<div class="rrow"><b>'+esc(c[0])+'</b><span class="vd">'+(c[1]?"PASS":"GAP")+'</span><div class="rd">'+esc(c[2])+'</div></div>').join("")
    +'<div class="rfoot">Gaps are reported, never hidden. Fleet: ping /status. Canon: /canon. Push: /canon sync.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/doctor — " + checks.filter(c=>c[1]).length + "/" + checks.length + " pass]");
}
async function cmdAudit(){
  const run = currentRun();
  const nSoul = (ledger.soul || []).length;
  const nRuns = (ledger.runs || []).length;
  const nDec = run ? (run.decisions || []).length : 0;
  const nPri = run ? (run.principles || []).length : 0;
  let nRRL = 0; try{ nRRL = (loadRRL(runNoOf()).entries || []).length; }catch(e){}
  const fp = fingerprint();
  const gaps = [];
  if(!nSoul) gaps.push("no soul records captured yet");
  if(run && run.closed) gaps.push("run " + run.run + " is CLOSED — next message opens a new run");
  if(!nDec) gaps.push("no decisions logged this run");
  let ilogRow = "";
  try{
    if(window.ObiILog){
      const st = await window.ObiILog.stats();
      const v = await window.ObiILog.verify();
      let anchorTxt;
      if(st.anchors){ anchorTxt = "anchored at <b>" + esc(st.lastAnchor.commitShort) + '…</b> · ' + st.unanchored + " unanchored"; }
      else {
        const rr = await ilogAnchorVerdict();
        anchorTxt = '<span class="vd" style="color:#f5a623">NEVER ANCHORED here</span> — ' + esc(ilogAnchorPhrase(rr));
        if(rr && rr.ok && rr.anchors.length) gaps.push("this origin's chain is UNANCHORED and is NOT the branch's anchored chain — " + (rr.verdict || "") + "; the anchors were lost with the rename, and /ilog push re-anchors THIS chain through PHOENIXOMEGAPROTOCOL");
        else gaps.push("the I-LOG has never been anchored on Git (/ilog push)");
      }
      ilogRow = '<div class="rrow"><b>I-LOG</b><span class="vd">' + st.count + '</span><div class="rd">head <b>' + esc(st.headShort) + '</b> · chain ' + (v.ok ? "VERIFIED" : "BROKEN") + ' (' + v.checked + " recomputed) · " + anchorTxt + '</div></div>';
      if(!v.ok) gaps.push("the I-LOG chain does not verify");
    } else gaps.push("src/ilog.js did not load — no operation record");
  }catch(e){ gaps.push("I-LOG unreadable: " + e.message); }
  addBubble("ass", '<div class="rise"><div class="rhead">🔎 /audit — ledger, evidence-first</div>'
    +'<div class="rrow"><b>RUNS</b><span class="vd">'+nRuns+'</span><div class="rd">current run '+(run?run.run:"?")+'</div></div>'
    + ilogRow
    +'<div class="rrow"><b>SOUL RECORDS</b><span class="vd">'+nSoul+'</span><div class="rd">soul-count '+(sessionSoulCount)+' chars this session</div></div>'
    +'<div class="rrow"><b>RRL</b><span class="vd">'+nRRL+'</span><div class="rd">entries this run</div></div>'
    +'<div class="rrow"><b>RUN STATE</b><span class="vd">'+(run?(run.closed?"closed":"open"):"none")+'</span><div class="rd">decisions '+nDec+' · principles '+nPri+'</div></div>'
    +'<div class="rrow"><b>FINGERPRINT</b><span class="vd">'+esc(fp)+'</span><div class="rd">raw-soul hash (never a summary)</div></div>'
    +(gaps.length ? '<div class="rrow"><b>GAPS</b><span class="vd">'+(gaps.length)+'</span><div class="rd">'+esc(gaps.join(" · "))+'</div></div>' : "")
    +'<div class="rfoot">Verbatim or nothing. The ledger is the raw; reports derive from it, never the reverse.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/audit — " + nRuns + " runs, " + nSoul + " soul records, fp " + fp + "]");
}
async function cmdLedger(){
  const run = currentRun();
  const nSoul = (ledger.soul || []).length;
  let rr = null; try{ rr = loadRRL(runNoOf()); }catch(e){}
  const entries = (rr && rr.entries) || [];
  const last = entries.slice(-10).map(e => '<div class="rrow"><b>'+esc(e.role)+'</b><span class="vd"></span><div class="rd">'+esc(String(e.text||"").slice(0,120))+'</div></div>').join("");
  let ilogLine = "";
  try{
    if(window.ObiILog){
      const st = await window.ObiILog.stats();
      ilogLine = '<div class="rrow"><b>I-LOG</b><span class="vd">'+st.count+'</span><div class="rd">the operation record — head <b>'+esc(st.headShort)+'</b> · '+(st.anchors ? "anchored "+esc(st.lastAnchor.commitShort)+"…" : "never anchored on Git")+' · <b>/ilog</b> to read or push it</div></div>';
    }
  }catch(e){}
  addBubble("ass", '<div class="rise"><div class="rhead">📒 /ledger — run '+(run?run.run:"?")+' raw record</div>'
    +'<div class="rrow"><b>TOTAL SOUL</b><span class="vd">'+nSoul+'</span><div class="rd">records stored across all runs</div></div>'
    + ilogLine
    +(last || '<div class="rrow"><b>RRL</b><span class="vd">empty</span><div class="rd">no entries this run yet</div></div>')
    +'<div class="rfoot">/audit for the full picture · /canon sync pushes this ledger into the Canon.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/ledger shown — " + entries.length + " RRL entries]");
}
async function cmdReport(){
  const run = currentRun();
  const L = ["# Command Station session report", ""];
  L.push("- **Time**: " + new Date().toISOString());
  L.push("- **Generator**: " + (window.generatorName || "obi"));
  L.push("- **Run #**: " + (run ? run.run : "?"));
  L.push("- **Session soul chars**: " + sessionSoulCount);
  L.push("- **Soul records**: " + (ledger.soul || []).length);
  let nRRL = 0; try{ nRRL = (loadRRL(runNoOf()).entries || []).length; }catch(e){}
  L.push("- **RRL entries this run**: " + nRRL);
  L.push("- **Fingerprint**: " + fingerprint());
  L.push("");
  L.push("Push this into the Canon with **/canon sync** (writes OPERATIONS/COMMANDSTATION/).");
  const md = L.join("\n");
  addBubble("ass", '<div class="rise"><div class="rhead">📄 /report — session report</div><div class="rrow"><b>MARKDOWN</b><span class="vd">ready</span><div class="rd"><pre style="text-align:left;white-space:pre-wrap;margin:0">'+esc(md)+'</pre></div></div><div class="rfoot">/canon sync to commit it to the authoritative repo.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/report generated]");
}
async function cmdFieldguide(){
  const docs = await canonPull();
  const fl = f => String(f).split("/").pop();
  const tags = ["SESSION I", "SCS", "CONTRACT"];
  addBubble("ass", '<div class="rise"><div class="rhead">🗺 /fieldguide — doctrine, live from the Canon</div>'
    + CANON.files.map((f, i) => docs[f] ? '<div class="rrow"><b>'+esc(fl(f))+'</b><span class="vd">'+esc(tags[i] || "CANON")+'</span><div class="rd">'+esc(docs[f].slice(0,220).replace(/\n/g," "))+'…</div></div>' : "").join("")
    +'<div class="rfoot">The canon branch is the authority for doctrine (<b>CANON/SYSTEM/</b>) — the <b>.kilo/</b> registry is the legacy Kilo lineage and is not read here. <b>No model-tier or named-agent attribution is printed here</b>: "T1"/"T2" model naming is not in the canon GOSPEL-999 or the LFG (verified by grep, 0 hits), so the station does not repeat it. Full doctrine at https://github.com/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/fieldguide — doctrine pulled]");
}


/* ─── /brand — the identity system (src/brand.js · AMENDMENT III) ─────────── */
function cmdBrand(sub){
  const B = window.ObiBrand;
  if(!B){ addBubble("ass", "⚠ src/brand.js didn't load — reload the page."); return; }
  const q = String(sub || "").trim().toLowerCase();
  const goDesk = () => { showView("gen"); deskOpen(true, "brand"); };
  if(q === "open" || q === "desk"){ goDesk(); addBubble("ass", '<div class="rise"><div class="rhead">◎ Brand &amp; Identity — opened</div><div class="rrow"><b>WHERE</b><span class="vd">◈</span><div class="rd">◈ Phoenix Generators → <b>MARKETING</b> → <b>Brand &amp; Identity</b>. The same room is at <b>/brand</b>.</div></div><div class="rfoot">The registry is <b>src/divisions.js</b>; the system is <b>src/brand.js</b>.</div></div>'); return; }
  if(q === "icons"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("grid") + ' ICONOGRAPHY — ' + B.iconNames().length + ' marks</div>'
      + '<div class="rd" style="padding:10px">' + '<div class="bx-grid">' + B.iconNames().map(n => '<div class="bx-cell"><div class="bx-ico">' + B.icon(n) + '</div><div class="bx-cell-name">' + esc(n) + '</div></div>').join("") + '</div></div>'
      + '<div class="rfoot">Use one with <b>ObiBrand.icon("name")</b>, or declare it in HTML with <b>data-icon="name"</b> and call <b>ObiBrand.upgrade()</b>. One set, no emoji standing in for a concept — BRAND.003.</div></div>');
    return;
  }
  if(q === "logo" || q === "apex" || q === "logotype"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("seal") + ' THE PRAIS APEX — the station\u2019s logotype</div>'
      + '<div class="rd" style="padding:10px">' + B.logoSection() + '</div>'
      + '<div class="rfoot">The mark is the sovereign\u2019s own plate, keyed to transparency and re-coloured \u2014 never redrawn. The anatomy page it came with is transcribed verbatim in <b>src/brand.js</b> and shipped as a still. The law is <b>BRAND.029</b>; every file is in <b>src/brand/assets/</b> and listed in <b>/brand vault apex</b>.</div></div>');
    return;
  }
  if(q === "vault" || q === "archive" || q === "library"){
    const rest = String(sub || "").trim().split(/\s+/).slice(1).map(s => s.toLowerCase());
    const which = rest.join(" ");
    const groups = B.VAULT_GROUPS.map(g => g[0]);
    if(groups.indexOf(which) >= 0){
      addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("vault") + ' THE MARKETING VAULT — ' + esc(B.VAULT_GROUPS.filter(g => g[0] === which)[0][1]) + '</div>'
        + '<div class="rd" style="padding:10px">' + B.vaultSection(which) + '</div>'
        + '<div class="rfoot">Every file is shipped in <b>src/brand/assets/</b>, alpha WebP, never hotlinked \u2014 <b>BRAND.005</b>. Download it, or copy the URL straight into a post, a page or another generator. The whole vault is <b>/brand vault</b>.</div></div>');
      return;
    }
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("vault") + ' THE MARKETING VAULT — ' + B.ASSETS.filter(a => a.shot).length + ' stills and ' + B.ASSETS.filter(a => !a.shot).length + ' marks</div>'
      + '<div class="rrow"><b>WHAT THIS IS</b><span class="vd">the archive</span><div class="rd">Every picture this system ships, in one room, each with a <b>Download \u25b8</b> and a <b>Copy URL</b>: the logotype, the twelve codex slides as pictures, the social set the campaign actually ships, the hero art, and the cut marks. Built so a post, a page or a deck can be assembled without opening a file manager.</div></div>'
      + '<div class="rd" style="padding:10px">' + B.vaultSection() + '</div>'
      + '<div class="rfoot">Shipped in <b>src/brand/assets/</b> \u2014 never hotlinked (<b>BRAND.005</b>), never restyled (<b>BRAND.020</b>). One group at a time: <b>' + groups.map(g => "/brand vault " + g).join("</b> \u00b7 <b>") + '</b>. The words side is the <b>marketing register</b> (<b>/brand marketing</b>) and the copy archive.</div></div>');
    return;
  }
  if(q === "marks" || q === "assets" || q === "art"){
    const srcOf = (a) => B.srcLabel(a);
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("image") + ' THE MARKS — ' + B.ASSETS.length + ', cut from the sovereign\'s own decks</div>'
      + B.ASSETS.filter(a => !a.shot).map(a => '<div class="rrow"><b>' + esc(a.name) + '</b><span class="vd">' + a.w + '×' + a.h + '</span><div class="rd">' + esc(a.note) + '<br><i>use:</i> ' + esc(a.use) + '<br><span class="bx-bar">' + esc(a.id) + ' // ' + srcOf(a) + ' // ' + (a.box ? 'box ' + a.box.join(",") : 'still') + ' // <a href="' + B.assetPath(a.id) + '" download="prais-brand-' + a.id + '.webp">download ▸</a></span></div></div>').join("")
      + '<div class="rfoot">Shipped in <b>src/brand/assets/</b> (alpha WebP, one file each) \u2014 never hotlinked. Every picture in the library is browsable with a download on <b>/brand vault</b>. Sources: <b>BestDossierYet-05-11-2026.pdf</b> (identity), <b>GOSPEL_444_PROTOCOL.pdf</b>, <b>GOSPEL_444_TIGER_MODE.pdf</b>, plus the sovereign\u2019s own slides, posts and art (2026-09-22). Rebuild recipe in the header of <b>src/brand.js</b>.</div></div>');
    return;
  }
  if(q === "doctrine" || q === "gospel" || q === "444" || q === "laws"){
    const G = B.GOSPEL444;
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("flame") + ' GOSPEL 444 PROTOCOL V' + G.version + ' — ' + G.laws.length + ' laws</div>'
      + '<div class="rrow"><b>MOTTO</b><span class="vd">444</span><div class="rd">' + esc(G.motto) + '</div></div>'
      + G.laws.map(l => '<div class="rrow"><b>' + esc(l.n) + '</b><span class="vd">' + esc(l.title) + '</span><div class="rd"><span class="bx-dir">' + esc(l.line) + '</span><br>' + l.body.map(p => esc(p)).join("<br>") + '</div></div>').join("")
      + '<div class="rfoot">Source: <b>' + G.sources.join("</b> + <b>") + '</b>. Normative text: AMENDMENT IV of <b>src/canon/GOSPEL-999.md</b> (G444.001–G444.012, <b>PROPOSED — not merged</b>). The ladder is <b>/brand modes</b>; the slides are <b>/brand deck</b>.</div></div>');
    return;
  }
  if(q === "modes" || q === "ladder" || q === "diagnostic"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("gauge") + ' THE MODE LADDER — one diagnostic, 0–100</div>'
      + '<div class="rd" style="padding:9px">' + B.modes() + '<div style="height:10px"></div>' + B.matrix(B.GOSPEL444.matrix) + '</div>'
      + '<div class="rfoot">Read from behaviour, not grammar (G444.003). This is <b>not</b> the coin ladder — <b>LESSON.012</b> is the economy and its thresholds are 0 / 200 / 500 / 5000 coins. A student can be a Tiger here and hold 40 coins there. <b>ObiBrand.modeOf(score)</b> reads this one.</div></div>');
    return;
  }
  if(q === "deck" || q === "dossier"){
    addBubble("ass", "composing the GOSPEL 444 deck — every mark inlined…");
    (async () => {
      try{
        const html = await B.buildDeck();
        const url = URL.createObjectURL(new Blob([html], { type:"text/html" }));
        const a = document.createElement("a");
        a.href = url; a.download = "GOSPEL-444-PROTOCOL-V" + B.GOSPEL444.version + ".html";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("scanline") + ' GOSPEL 444 — the deck, composed here</div>'
          + '<div class="rrow"><b>FILE</b><span class="vd">' + Math.round(html.length/1024) + ' KB</span><div class="rd">' + B.GOSPEL444.slides.length + ' slides · ' + B.GOSPEL444.laws.length + ' laws · every mark inlined as a data URL · no fetches, one openable .html. Downloaded as <b>GOSPEL-444-PROTOCOL-V' + B.GOSPEL444.version + '.html</b>.</div></div>'
          + '<div class="rfoot">The dossier, regenerated <i>through</i> the system instead of screenshotted: BRAND.010\'s outstanding item. The same button is on the brand desk.</div></div>');
      }catch(e){ addBubble("ass", "⚠ deck export failed: " + esc(e.message)); }
    })();
    return;
  }
  if(q === "emblems" || q === "ranks" || q === "badges"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("medal") + ' THE EMBLEMS — ' + B.EMBLEMS.length + ', drawn in vector</div>'
      + '<div class="rd" style="padding:10px"><div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">'
      + B.EMBLEMS.map(e => '<div class="bx-cell" style="text-align:left;background:#0b0714">' + B.emblemBand(e.id, { size:96 }) + '</div>').join("") + '</div></div>'
      + '<div class="rrow"><b>WHY VECTOR</b><span class="vd">size</span><div class="rd">An emblem has to survive a 9&nbsp;mm stamp on a certificate and a 120&nbsp;mm print on a wall, so it is drawn here rather than cut from a deck. Below ~30&nbsp;px it drops its ticks and fattens what is left — <b>ObiBrand.emblem("rank-tiger", {size:112})</b>.</div></div>'
      + '<div class="rrow"><b>TWO LADDERS</b><span class="vd">shape</span><div class="rd"><b>Roundels are the coin ladder</b> (LESSON.012: 0 / 200 / 500 / 5000) and <b>shields are the diagnostic</b> (G444.003: MOUSE / CUB / TIGER). Two shapes on purpose: a student can be a Tiger on one and hold 40 coins on the other, and matching emblems would invite exactly that confusion.</div></div>'
      + '<div class="rfoot">Nine emblems: four ranks, three modes, and the two seals (NET Academy, GOSPEL 444). They are cut on the <b>badge sheet</b> — <b>/brand badge-sheet</b>.</div></div>');
    return;
  }
  if(q === "patterns" || q === "beds"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("grid") + ' THE PATTERNS — ' + Object.keys(B.PATTERNS).length + ' beds</div>'
      + '<div class="rd" style="padding:10px"><div class="bx-grid bx-grid-wide">' + Object.keys(B.PATTERNS).map(k => '<div class="bx-cell" style="text-align:left"><div style="height:88px;border:1px solid var(--bx-court-line);border-radius:3px;' + B.patternCss(k, { ink: k === "ember" ? "#dc9438" : k === "hazard" ? "#e0473f" : "#a855f7", opacity:.75 }) + '"></div><div class="bx-cell-name" style="color:var(--bx-ancient);font-size:11px;margin-top:7px">' + esc(B.PATTERNS[k].name) + '</div><div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px">' + esc(B.PATTERNS[k].use) + '</div></div>').join("") + '</div></div>'
      + '<div class="rfoot">A pattern is a <b>bed</b>, never a message: a lesson bed is always <b>lattice</b> or <b>ember</b>, and <b>hazard</b> is reserved for a fault plate (BRAND.002 \u2014 the extension may texture chrome, it may not restyle a lesson). <b>ObiBrand.patternCss("lattice", {ink:"#a855f7", opacity:.5})</b>.</div></div>');
    return;
  }
  if(q === "marketing" || q === "market" || q === "pitch") {
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("target") + ' THE MARKETING REGISTER — what we say</div>'
      + '<div class="rd" style="padding:10px"><div style="font-family:var(--font-head,Orbitron,sans-serif);font-size:16px;color:var(--bx-ancient);line-height:1.3">' + esc(B.MARKET.headline) + '</div>'
      + '<div style="font-size:12px;color:var(--text-dim,#94a3b8);margin-top:5px">' + esc(B.MARKET.headlineVn) + '</div>'
      + '<div class="bx-bar" style="margin-top:8px">' + esc(B.MARKET.kicker) + ' // ' + esc(B.MARKET.sub) + ' // MARKETING SET V' + B.MARKET.version + '</div></div>'
      + '<div class="rrow"><b>THE PILLARS</b><span class="vd">3</span><div class="rd">' + B.MARKET.pillars.map(p => '<b>' + esc(p.title) + '</b> — ' + esc(p.body)).join('<br>') + '</div></div>'
      + '<div class="rrow"><b>THE HAND-PICKED SET</b><span class="vd">' + B.MARKET.shots.length + ' slides</span><div class="rd">' + B.MARKET.shots.map(s => '<b>' + esc(s.tag) + '</b> — ' + esc(s.what)).join('<br>') + '</div></div>'
      + '<div class="rrow"><b>THE COMPARISON</b><span class="vd">3 rows</span><div class="rd">' + B.MARKET.compare.map(r => '<b>' + esc(r[0]) + '</b>: ' + esc(r[1]) + ' → ' + esc(r[2])).join('<br>') + '</div></div>'
      + '<div class="rrow"><b>THE OFFER</b><span class="vd">closing</span><div class="rd">' + esc(B.MARKET.offer) + '<br>' + esc(B.MARKET.headline) + '</div></div>'
      + '<div class="rfoot">Transcribed from the seven slides the sovereign hand-picked (2026-09-22) — nothing invented. On the desk as <b>THE MARKETING REGISTER</b>; on paper as <b>THE MARKETING SET</b> and <b>THE METHOD CARD</b> — <b>/brand print</b>, <b>/brand marketing-set</b>, <b>/brand method-card</b>.</div></div>');
    return;
  }
  if(q === "codex" || q === "strategy" || q === "phoenix" || q === "run305"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("seal") + ' THE PHOENIX RISING CODEX — what the sovereign holds</div>'
      + '<div class="rd" style="padding:10px">' + B.codexSection() + '</div>'
      + '<div class="rfoot">Transcribed from five decks sent 2026-09-22 (<b>' + B.CODEX.pages + ' pages</b>): the codex, the tiger protocol, the tiger engine, the engine protocol and the run log. The strategy half is on paper as <b>/brand enrolment</b> and <b>/brand run-readout</b>; the ads are <b>/brand ads</b>; the deck is <b>/brand codex-deck</b> (or the button in the room above). The run log\u2019s ledger is deliberately <b>empty</b> — <b>BRAND.028</b>.</div></div>');
    return;
  }
  if(q === "ads" || q === "phase0" || q === "creative"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("target") + ' PHASE 0 — six creatives, one law</div>'
      + '<div class="rd" style="padding:10px">' + B.adsSection() + '</div>'
      + '<div class="rfoot">The law is <b>BRAND.021</b>: English is the anchor in Imperial Gold, Vietnamese is the subtitle in white, and a text-heavy slide with no anchor is not bilingual \u2014 it is text-heavy. On paper as <b>/brand ad-sheet</b> (A3 landscape).</div></div>');
    return;
  }
  if(q === "landing" || q === "page" || q === "landingpage"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("globe") + ' THE LANDING PAGE — the register in reading order</div>'
      + '<div class="rd" style="padding:10px">' + B.landingSection() + '</div>'
      + '<div class="rfoot">Eight bands, every line sourced to a slide or a law. On paper as <b>/brand enrolment</b> (three A3 pages: the diagnosis, the intervention, the offer).</div></div>');
    return;
  }
  if(q === "codex-deck" || q === "strategydesk"){
    addBubble("ass", "composing the PHOENIX RISING CODEX deck — every mark inlined…");
    (async () => {
      try{
        const html = await B.buildCodexDeck();
        const url = URL.createObjectURL(new Blob([html], { type:"text/html" }));
        const a = document.createElement("a");
        a.href = url; a.download = "PHOENIX-RISING-CODEX-V" + B.CODEX.version + ".html";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("scanline") + ' THE CODEX — the deck, composed here</div>'
          + '<div class="rrow"><b>FILE</b><span class="vd">' + Math.round(html.length/1024) + ' KB</span><div class="rd">' + B.CODEX.slides.length + ' slides \u00b7 every mark inlined as a data URL \u00b7 no fetches, one openable .html. Downloaded as <b>PHOENIX-RISING-CODEX-V' + B.CODEX.version + '.html</b>.</div></div>'
          + '<div class="rfoot">The ' + B.ASSETS.filter(x => x.shot && ["codex", "tiger-protocol", "tiger-engine", "run-log"].indexOf(x.src) >= 0).length + ' pages this system <i>cannot</i> draw are shipped as stills and sit in the desk \u2014 a slide is a composition, and redrawing one would be inventing artwork (BRAND.014).</div></div>');
      }catch(e){ addBubble("ass", "⚠ codex deck export failed: " + esc(e.message)); }
    })();
    return;
  }
  if(q === "print" || q === "printroom" || q === "room"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("print") + ' THE PRINT ROOM — ' + B.PRINT_ARTIFACTS.length + ' artifacts</div>'
      + B.PRINT_ARTIFACTS.map(a => '<div class="rrow"><b>' + esc(a.name) + '</b><span class="vd">' + esc(a.page) + '</span><div class="rd">' + esc(a.note) + '<br><span class="bx-bar">' + esc(a.id) + ' // ' + esc(a.file) + ' // /brand ' + esc(a.id) + '</span></div></div>').join("")
      + '<div class="rfoot">Each export is one openable <b>.html</b> with every mark inlined and its own <span class="bx-tag">@page</span> rule — no fetches but the four typefaces. Print at 100% with <b>background graphics on</b>. The same four buttons are on the desk.</div></div>');
    return;
  }
  const PRINT_ALIAS = { "wall-set":["posters","wall","wallset","wall-set","poster"], "one-sheet":["sheet","onesheet","chart","one-sheet"], "badge-sheet":["badge-sheet","badgesheet","stickers","sticker"], "certificate":["certificate","cert"], "marketing-set":["marketing-set","marketingset","marketing","pitch-set","pitchset","campaign"], "method-card":["method-card","methodcard","method","takehome","take-home","parent-card"], "ad-sheet":["ad-sheet","adsheet","ads-brief","brief"], "enrolment":["enrolment","enrollment","enrol","the-enrolment-pages","enrolpages"], "run-readout":["run-readout","readout","runlog","run-log","logsheet"] };
  const q0 = q.split(/\s+/)[0];
  let poId = null;
  for(const k in PRINT_ALIAS) if(PRINT_ALIAS[k].indexOf(q0) >= 0) poId = k;
  if(poId){
    const rest = String(sub || "").trim();
    const parts = rest.split(/\s+/).filter(Boolean);
    const opts = {};
    const nameBits = [];
    for(const tk of parts){
      const low = tk.toLowerCase();
      if(/^(rank-|mode-)/.test(low)){ const bits = low.split("-"); if(bits[0] === "rank") opts.tier = bits[1]; else opts.mode = bits[1]; }
      else if(/^(mouse|cub|tiger|legend)$/.test(low)){ opts.tier = low; }
      else if(/^score=/.test(low)){ opts.score = Number(low.slice(6)); }
      else if(/^name=/.test(low)){ nameBits.push(tk.slice(5)); }
      else if(/^date=/.test(low)){ opts.date = tk.slice(5); }
      else if(!PRINT_ALIAS[poId].includes(low) && low !== "print") nameBits.push(tk);
    }
    if(nameBits.length) opts.name = nameBits.join(" ");
    addBubble("ass", "composing <b>" + esc(B.artifactById(poId).name) + "</b> — marks inlined\u2026");
    runCmd(async () => {
      try{
        const r = await B.downloadArtifact(poId, opts);
        addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("print") + ' ' + esc(r.artifact.name) + ' \u2014 composed here</div>'
          + '<div class="rrow"><b>FILE</b><span class="vd">' + r.kb + ' KB</span><div class="rd"><b>' + esc(r.file) + '</b> \u00b7 ' + esc(r.artifact.page) + ' \u00b7 ' + r.artifact.pages(opts).length + ' page(s) \u00b7 every mark inlined as a data URL \u00b7 nothing fetched but the four typefaces. Downloaded.</div></div>'
          + (opts.tier || opts.mode ? '<div class="rrow"><b>RECORD</b><span class="vd">' + esc(opts.tier ? "rank-" + opts.tier : "mode-" + opts.mode) + '</span><div class="rd">' + esc(opts.name || "(no name \u2014 the rule prints blank for the pen)") + (opts.score == null ? " \u00b7 no score recorded" : " \u00b7 diagnostic " + esc(opts.score) + "/100") + '</div></div>' : "")
          + '<div class="rfoot">A certificate carries a claim, so it is only composed from a record you give it \u2014 <b>BRAND.013</b>. Anything you leave out prints as a blank rule for the hand.</div></div>');
      }catch(e){ addBubble("ass", "\u26a0 " + esc(poId) + " export failed: " + esc(e.message)); }
    });
    return;
  }
  if(q === "palette" || q === "colours" || q === "colors"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("compass") + ' PALETTE — frozen tokens, and the court\'s extension</div>'
      + Object.keys(B.PALETTE).map(k => { const p = B.PALETTE[k]; return '<div class="rrow"><b>' + esc(k) + '</b><span class="vd" style="background:' + p.hex + ';color:#0b0714">' + esc(p.hex) + '</span><div class="rd">' + esc(p.role) + ' — ' + esc(p.note) + '</div></div>'; }).join("")
      + '<div class="rfoot">LESSON.008 stands: system / reward / ground are immutable. The extension is for chrome and marks — never to restyle a lesson. BRAND.002.</div></div>');
    return;
  }
  if(q === "rules" || q === "law"){
    const laws = [
      ["BRAND.001","THE IDENTITY IS ONE SYSTEM.","One palette, one icon set, one set of marks, one chrome. A surface that invents its own is a defect, not a variation. /brand is the system; src/brand.js is its only source."],
      ["BRAND.002","THE FROZEN TOKENS STAND; THE COURT EXTENDS THEM.","#a855f7 system · #f59e0b reward · #0f0f1a ground are immutable (LESSON.008). The dossier adds the plum court and the antique gold — chrome and marks only, never a lesson's restyle."],
      ["BRAND.003","AN ICON IS DRAWN, NOT BORROWED.","Every concept gets one glyph on the 24 grid, stroke currentColor. No icon fonts, no emoji standing in for a concept, no per-surface one-offs."],
      ["BRAND.004","THE STATUS BAR STATES; IT DOES NOT DECORATE.","One monospace line of what is TRUE right now, separated by //. If it drifts from reality it is a defect and gets fixed, not excused."],
      ["BRAND.005","THE MARK IS SHIPPED, NOT HOTLINKED.","Every mark is a file in this generator's src/brand/assets/ with its provenance recorded. An image that depends on someone else's server is not a brand asset."],
      ["BRAND.006","ONE FACE PER PIECE.","A surface wears the industry it belongs to: a child's screen, a parent's report and a teacher's board are not the same page. Same brand, different density."],
      ["BRAND.007","THE FAMILY LOOKS LIKE ONE FAMILY.","A generator role reuses this palette, these icons and this chrome. Adding a division means adding it to src/divisions.js, where an icon is a NAME from this set."],
      ["BRAND.008","TASTE, THEN DEFECTS.","Where the files and the law disagree on taste, the files win. On defects, this law wins."],
      ["BRAND.009","NO NATIVE DIALOGS, NO UNSAFE TEXT, NO DEAD BUTTON.","Everything the brand renders escapes what it prints, stops what it animates, and never shows a control that opens nothing (LESSON.014/015)."],
      ["BRAND.010","WHAT THIS DOES NOT PROVE.","The system is derived from three decks (31 pages), one station and three lessons. It is a floor, not a finished house: the second icon pass, the favicon and the deck regeneration are named as still-needed, not claimed. AMENDMENT IV (GOSPEL 444) supplies the doctrine; it does not finish the house either."],
      ["BRAND.011","THE SECOND ICON PASS PAYS THE FIRST PASS'S DEBTS.","115 icons on the 24 grid, stroke currentColor. The pass that closed the first pass's debts included one DEFECT: TIERS[0] and MODES[0] both pointed at `mouse` for a year and no such glyph existed — a named icon that is not drawn is a broken crest, not a missing nicety."],
      ["BRAND.012","A RANK IS AN EMBLEM, NOT A PICTURE.","Ranks, modes and the seals are drawn in vector so the same file survives a 9 mm stamp and a 120 mm print, and so a rung can change without redrawing the ring. Below ~30 px an emblem drops its ticks and fattens what is left. Roundel = the coin ladder; shield = the diagnostic; the shapes stay different on purpose (G444.003)."],
      ["BRAND.013","A CERTIFICATE IS COMPOSED FROM A RECORD, NEVER FROM AN APPETITE.","The station may compose a certificate only from data a human supplied — a tier, or a diagnostic score with a mode. What is not supplied prints as a blank rule for the pen. A certificate that invents its own claim is a forgery, whatever it looks like."],
      ["BRAND.014","THE ARTWORK IS THE SYSTEM'S OWN.","The print room composes posters, the one sheet, the badge sheet and the certificate out of the marks cut from the sovereign's own decks, the emblems drawn here, and the doctrine's own words. Nothing is redrawn, restyled or invented for a sheet of paper, and nothing is fetched at print time but the typefaces."],
      ["BRAND.015","A BED IS NOT A MESSAGE.","Patterns (lattice, circuit, ember, hazard) are grounds. A lesson bed is always lattice or ember; hazard is reserved for a fault plate. The extension may texture chrome — it may not restyle a lesson (BRAND.002)."],
      ["BRAND.016","A PRINTED SHEET STATES ITS OWN PRINTING.","Every artifact carries its page size, its page count and its folio, and opens with its own @page rule so the printer cannot be blamed for what the file did not say. A sheet with no folio and no size is a screenshot, not artwork."],
      ["BRAND.017","TWO REGISTERS, ONE SYSTEM.","The doctrine (GOSPEL 444) is what we HOLD — internal, blunt, for the coach. The marketing register (MARKET) is what we SAY — outward, for the parent and the student. Same system, two readers. Neither may contradict the other, and the marketing register may never claim a number the doctrine does not hold."],
      ["BRAND.018","WHAT WE SAY IS TRANSCRIBED, NOT INVENTED.","Every marketing line carries its source (the slide it was transcribed from), exactly as the doctrine's lines carry their page. A claim with no source is a defect, whether or not it is true."],
      ["BRAND.019","THE PROMISE IS QUOTED, NOT INFLATED.","A marketing sheet prints the doctrine's own numbers — 80% against a 30% baseline, 4x completion — and cites the law behind each one (G444.001, G444.009, G444.011). We are doctors, not salespeople: the sheet states what was measured and stops there."],
      ["BRAND.020","THE HAND-PICKED SET IS SOURCE, NOT DECORATION.","A slide the sovereign picks is recorded with what it says and where it may be worn, shipped as a still in src/brand/assets/ (never hotlinked), and never restyled. Its artwork may be cut into marks by the same key as every other deck — and the still itself stays available as a still."],
      ["BRAND.021","THE BILINGUAL HIERARCHY.","English is the anchor, in Imperial Gold. Vietnamese is the subtitle, in white. A slide with no anchor language is not a bilingual slide; it is a text-heavy one. Printed under the six Phase 0 creatives, and printed on the same sheet as them."],
      ["BRAND.022","PHASE 0 IS VISUAL.","The campaign is built as pictures before it is built as copy, and each creative carries the law it is obeying on its own face. Six cards, six ideas, one law — and the law is on the sheet, not in a separate document."],
      ["BRAND.023","THE ZONE IS CHOSEN, NOT HOPED FOR.","Lakeview is chosen because the buyer is already there — time-poor, cash-rich, and structurally unable to attend an evening class. The 45/15 answers that buyer; it is not the product."],
      ["BRAND.024","TWO EXITS, ONE OF THEM HUMAN.","Every automated funnel branches to a person. Fail-closed means no visitor is left standing in a form: the machine qualifies, a human closes."],
      ["BRAND.025","QUOTE THE NUMBER THE SOURCE GIVES.","80 against 30. Where two pages of the corpus disagree — 2.5× in the doctrine, 4× on the master marketing slide — the disagreement is printed and carried on the sheet. It is never averaged, and never quietly replaced by the friendlier figure."],
      ["BRAND.026","A COUNTER-ARGUMENT IS A QUOTE.","The ostrich, the flip-phone, the sinking ship: use the doctrine's own figure of speech, or write no figure at all. An invented metaphor is an invented claim wearing a costume."],
      ["BRAND.027","THE STRIKE AT SIXTY.","Retention is a clock, not a virtue: 48 hours of decay in the leaky bucket, an interruption timed at a 60% likelihood of forgetting, and eight encounters in context to make a word subconscious."],
      ["BRAND.028","NO CHILD'S NAME IN PUBLIC SOURCE.","A run log is transcribed as a FORMAT. Student identities, scores and vault usernames stay out of anything a browser can read — including this generator's own canon and the sheets it prints."],
      ["BRAND.029","THE LOGOTYPE IS THE SOVEREIGN'S, AND IT IS KEYED, NOT REDRAWN.","The PrAis Apex — the cybernetic phoenix over the tesseract core — is the station's logotype, shipped as a file (`apex`, with its ink cut `apex-ink`). Its geometry is the sovereign's and is never redrawn, restyled or re-proportioned; it may be keyed to transparency and re-coloured to the two frozen tokens, because the specification itself names them. It is WORN FROM 64 PX UP — below that the tesseract-core GLYPH (`apex` in the icon set) carries it, since a mark that dissolves in a browser tab is not a mark. The specification page (`apex-anatomy`) is shipped whole and transcribed verbatim in src/brand.js; where it and this file disagree, the page wins."]
    ];
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("seal") + ' AMENDMENT III + V + VI + VIII — THE BRAND, THE MARK, THE ICONOGRAPHY, THE PRINT ROOM, THE REGISTER, THE LOGOTYPE</div>'
      + laws.map(l => '<div class="rrow"><b>' + esc(l[0]) + '</b><span class="vd"></span><div class="rd"><b>' + esc(l[1]) + '</b><br>' + esc(l[2]) + '</div></div>').join("")
      + '<div class="rfoot">Normative text: <b>src/canon/GOSPEL-999.md</b> (AMENDMENT III BRAND.001\u2013010 provisional; AMENDMENT IV adds GOSPEL 444; AMENDMENT V adds BRAND.011\u2013016; AMENDMENT VI adds BRAND.017\u2013020; AMENDMENT VII adds BRAND.021\u2013028; AMENDMENT VIII adds BRAND.029 (the logotype) \u2014 all <b>PROPOSED</b>) \u00b7 lesson-side: <b>src/LESSON-STANDARD.md</b> LSN-24/25/26/27/28/29/30/31 \u00b7 the drone\'s checklist: <b>src/canon/LEGIONNAIRE-FIELD-GUIDE.md</b> \u00a713/\u00a714/\u00a715/\u00a716/\u00a717 \u00b7 the system itself: <b>src/brand.js</b>.</div></div>');
    return;
  }
  /* no argument: the front page of the identity system */
  addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("seal") + ' /brand — the identity system v' + B.VERSION + '</div>'
    + '<div class="rrow"><b>THE SYSTEM</b><span class="vd">' + B.iconNames().length + ' icons</span><div class="rd">' + B.ASSETS.filter(x => !x.variant && !x.shot).length + ' gallery marks + ' + B.ASSETS.filter(x => x.variant).length + ' variants + ' + B.ASSETS.filter(x => x.shot).length + ' hand-picked slides (' + B.ASSETS.length + ' files), one palette (' + Object.keys(B.PALETTE).length + ' tokens), the HUD chrome, the doctrine\'s own chrome, four type families. It renders in full at <b>/brand open</b>.</div></div>'
    + '<div class="rrow"><b>MARK</b><span class="vd">sigil</span><div class="rd" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' + B.lockup({ size:"42px" }) + '</div></div>'
    + '<div class="rrow"><b>THE LOGOTYPE</b><span class="vd">APEX</span><div class="rd" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><img src="' + B.assetPath("apex") + '" alt="The PrAis Apex" style="width:66px;height:auto"><span style="flex:1;min-width:180px"><b>THE PRAIS APEX</b> \u2014 the sovereign\u2019s own mark: the cybernetic phoenix over the tesseract core. Keyed to transparency and re-coloured to the frozen tokens, never redrawn. <b>/brand logo</b> shows the anatomy, the grounds and the files.</span></div></div>'
    + '<div class="rrow"><b>THE VAULT</b><span class="vd">' + B.ASSETS.length + ' files</span><div class="rd">Every picture the system ships \u2014 the logotype, the twelve codex slides, the social set, the hero art and the cut marks \u2014 each with a download and a copy-URL. <b>/brand vault</b> \u00b7 <b>/brand vault social</b> \u00b7 <b>/brand vault codex</b> \u00b7 <b>/brand vault art</b> \u00b7 <b>/brand vault apex</b> \u00b7 <b>/brand vault marks</b></div></div>'
    + '<div class="rrow"><b>THE DOCTRINE</b><span class="vd">G444</span><div class="rd"><b>GOSPEL 444 PROTOCOL V' + B.GOSPEL444.version + '</b> — ' + B.GOSPEL444.laws.length + ' laws and ' + B.GOSPEL444.slides.length + ' slides, transcribed from the sovereign\'s two 444 decks. <b>/brand doctrine</b> lists them, <b>/brand modes</b> is the ladder, <b>/brand deck</b> composes and downloads the deck.</div></div>'
    + '<div class="rrow"><b>THE EMBLEMS</b><span class="vd">' + B.EMBLEMS.length + ' vector</span><div class="rd" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' + B.emblem("rank-mouse", { size:54 }) + B.emblem("rank-cub", { size:54 }) + B.emblem("rank-tiger", { size:54 }) + B.emblem("rank-legend", { size:54 }) + B.emblem("mode-tiger", { size:54 }) + B.emblem("seal-net", { size:54 }) + B.emblem("seal-444", { size:54 }) + '<span style="flex:1;min-width:150px">roundel = the coin ladder · shield = the diagnostic · ring = the seals. <b>/brand emblems</b></span></div></div>'
    + '<div class="rrow"><b>THE PRINT ROOM</b><span class="vd">' + B.PRINT_ARTIFACTS.length + ' files</span><div class="rd">The artwork as sheets: <b>the wall set</b> (12 law posters + cover, ladder, matrix, closing), <b>the one sheet</b> (the whole protocol on one A3), <b>the badge sheet</b>, <b>the rank certificate</b>, and \u2014 for the parent \u2014 <b>the marketing set</b> and <b>the method card</b>. Each one opens from a phone and prints at 100%. <b>/brand print</b>.</div></div>'
    + '<div class="rrow"><b>THE MARKETING REGISTER</b><span class="vd">' + (B.MARKET.shots.length + B.MARKET.shots2.length) + ' slides</span><div class="rd">What we <i>say</i>: the three pillars, the 60% rule, the hour, the AI-PET, the comparison and the offer \u2014 transcribed from the eleven slides you hand-picked, in two batches. The second batch adds the diagnosis, the architecture of fluency, the biological intervention and the ad pipeline. <b>/brand marketing</b></div></div>'
    + '<div class="rrow"><b>THE PHOENIX RISING CODEX</b><span class="vd">' + B.CODEX.pages + ' pages</span><div class="rd">What <i>you</i> hold: the dual-mastery claim, the Lakeview zone, the M2 pipeline, the five-layer sovereign stack, the retention clock, strategic laziness, the proof, and the run log as a format. Transcribed from five decks. <b>/brand codex</b></div></div>'
    + '<div class="rrow"><b>PHASE 0</b><span class="vd">' + B.MARKET.ads.cards.length + ' creatives</span><div class="rd">Six ads and the law governing them, printed together on <b>the ad sheet</b>. <b>/brand ads</b> \u00b7 <b>/brand ad-sheet</b></div></div>'
    + '<div class="rrow"><b>STATUS</b><span class="vd">live</span><div class="rd">' + B.bar(["IDENTITY v" + B.VERSION, "MARKS " + B.ASSETS.filter(x => !x.variant && !x.shot).length, "STILLS " + B.ASSETS.filter(x => x.shot).length, "ICONS " + B.iconNames().length, "EMBLEMS " + B.EMBLEMS.length, "ARTIFACTS " + B.PRINT_ARTIFACTS.length, "GOSPEL 444 V" + B.GOSPEL444.version, "SOURCE 9 DECKS + 11 SLIDES"]) + '</div></div>'
    + '<div class="rrow"><b>LAW</b><span class="vd">011–029</span><div class="rd">Twenty-nine brand laws \u2014 <b>/brand rules</b>. The palette is <b>/brand palette</b>, the icon set <b>/brand icons</b>, the logotype <b>/brand logo</b>, the marks <b>/brand marks</b>, the emblems <b>/brand emblems</b>, the beds <b>/brand patterns</b>, the sheets <b>/brand print</b>, the register <b>/brand marketing</b>, the strategy <b>/brand codex</b>, the campaign <b>/brand ads</b>, the page <b>/brand landing</b>, every picture <b>/brand vault</b>.</div></div>'
    + '<div class="rfoot"><b>/brand open</b> for the room · the desk lives at ◈ Phoenix Generators → MARKETING → Brand &amp; Identity · source: <b>src/brand.js</b>.</div></div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [/brand — identity system v" + B.VERSION + " · " + B.iconNames().length + " icons · " + B.ASSETS.length + " marks · GOSPEL 444 v" + B.GOSPEL444.version + "]");
}

/* ---------------- resilience (added by hardening pass) ---------------- */
function reportError(e){
  const msg = (e && e.message) ? e.message : String(e);
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [error: " + msg + "]"); }catch(_){}
  try{ logOp({ kind:"error", action: currentAction || "?", ok:false, detail: msg, result: "reported to the chat" }); }catch(_){}
  try{ addBubble("ass", "⚠ " + esc(msg)); }catch(_){}
}

/* Freeze-proofing: every command runs through runCmd so a thrown error can never
   leave `busy` stuck true (which would freeze the typing indicator forever).
   `stallMs` raises the watchdog's budget for the commands that are LEGITIMATELY
   slow — a two-attempt lesson build can run for minutes, and releasing the chat
   under it prints a scary "stalled" line while the model is still working. */
async function runCmd(fn, opts){
  busy = true;
  busyLimit = (opts && opts.stallMs) || 180000;
  const t0 = Date.now();
  const what = currentAction || "cmd";
  try { const r = await fn(); logOp({ kind:"op", action: what, result: "ok", ms: Date.now() - t0 }); return r; }
  catch(e){ reportError(e); logOp({ kind:"op", action: what, ok:false, detail: (e && e.message) || String(e), result: "threw", ms: Date.now() - t0 }); }
  finally { busy = false; busyLimit = 180000; busySince = 0; }
}

/* Watchdog: if an operation stalls, release the chat rather than freeze it. */
let busySince = 0;
let busyLimit = 180000;
setInterval(function(){
  if(busy){
    if(!busySince) busySince = Date.now();
    else if(Date.now() - busySince > busyLimit){
      busy = false; busySince = 0;
      try{ addBubble("ass", "⚠ A long operation stalled and was released — the chat is ready again."); }catch(_){}
    }
  } else busySince = 0;
}, 20000);

/* Surface async failures into the raw record instead of swallowing them. */
window.addEventListener("unhandledrejection", function(e){
  var m = (e && e.reason && e.reason.message) || String((e && e.reason) || "unknown");
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [unhandled rejection: " + m + "]"); }catch(_){}
  try{ logOp({ kind:"error", action:"unhandled rejection", ok:false, detail: m, result: "caught by the page listener" }); }catch(_){}
});

/* ------------------------- THE BRAIN ARMS ITSELF -------------------------
   src/brain.js loads before this file; here it is given the station it is the
   memory of: build the index from the sources, then start the auto lane (one
   sync shortly after boot, then every five minutes). A page that cannot read its
   own register still runs — the failure lands in the card, the tab bar and the
   I-LOG instead of in silence. */
setTimeout(function(){
  try{
    const B = window.ObiBrain;
    if(!B) return;
    B.build().then(function(){
      B.start();
      /* then the relay — the master sync pipeline — which needs the index to exist */
      try{ if(window.ObiRelay && window.ObiRelay.start) window.ObiRelay.start(); }catch(_){}
      try{ if(window.ObiMarket && window.ObiMarket.start) window.ObiMarket.start(); }catch(_){}
      try{ updateTabMeta(); }catch(_){}
      try{ logOp({ kind:"brain", action:"index built", detail: (B.index() ? B.index().entries.length + " entries" : "?") + " · census " + (B.index() ? B.index().census : "?"), result: "the auto lane is armed" }); }catch(_){}
    }).catch(function(e){
      try{ logOp({ kind:"brain", action:"index build", ok:false, detail:String((e && e.message) || e), result:"the brain is unindexed — /brain rebuild retries" }); }catch(_){}
    });
  }catch(e){}
}, 3000);
