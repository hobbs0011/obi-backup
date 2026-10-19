/* ============================================================================
   OBI — STUDY SUMMARIES  (src/summary.js)

   The generator is the Student Summary Generator, so a summary is a first-class
   artifact, not just chat text:

     /summary              latest transcript → study summary (else this session)
     /summary session      summary of the current run (both-speaker RRL log)
     /summary <url>        fetch a page and summarize it
     /summary <text…>      summarize notes you paste
     /summaries            the archive: read / export / delete

   Doctrine: the summary is DERIVED. The raw it came from is never replaced —
   a recording summary points back at the verbatim transcript in the RRL / the
   transcripts store (L38 raw first, L43 no summaries of summaries, L44 the
   ledger derives from raw). Every summary is saved per-user in kv and noted in
   the run log as DNA.
   ========================================================================== */
(function(){
"use strict";

const KV_FOLDER = "summaries";
const MAX_INPUT = 12000;
const LIB_LIMIT = 60;

const workspace = new Map();

function esc2(s){ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s); }
function folder(){ if(!root || !root.kv) throw new Error("kv-plugin not loaded (main.pjs)"); return root.kv[KV_FOLDER]; }
/* this client's summaries only — see src/clients.js */
function inClient(rec){ try{ if(window.ObiClients && window.ObiClients.matches) return window.ObiClients.matches(rec); }catch(e){} return true; }
function clientName(){ try{ if(window.ObiClients && window.ObiClients.name) return window.ObiClients.name(); }catch(e){} return "Unassigned"; }
function pad(n){ return String(n).padStart(2, "0"); }
function fmtDur(sec){
  sec = Math.max(0, Math.round(Number(sec) || 0));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s);
}
function clip(s, n){ s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) : s; }
function slug(s){ return String(s || "summary").replace(/\.[a-z0-9]{1,5}$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 60) || "summary"; }
function newId(){ return "sm-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); }
function firstLine(s, n){
  n = n || 70;
  const l = String(s || "").split("\n").map(x => x.trim()).filter(Boolean)[0] || "untitled";
  if(l.length <= n) return l;
  const cut = l.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return (sp > 30 ? cut.slice(0, sp) : cut).replace(/[\s,;:.\-–—]+$/, "") + "…";
}
function download(name, text, mime){
  try{
    const url = URL.createObjectURL(new Blob([text], { type: mime || "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click();
    setTimeout(() => { try{ URL.revokeObjectURL(url); a.remove(); }catch(e){} }, 5000);
    return true;
  }catch(e){ return false; }
}
function sampleText(text, budget){
  text = String(text || "");
  if(text.length <= budget) return { text, sampled: false, full: text.length };
  const win = Math.floor(budget / 3);
  const mid = Math.floor(text.length / 2);
  return { text: clip(text, win) + "\n…\n" + text.slice(mid - Math.floor(win / 2), mid + Math.floor(win / 2)) + "\n…\n" + text.slice(-win), sampled: true, full: text.length };
}

/* ------------------------------ prompt design ------------------------------ */

/* Static first (shared prefix), source in the middle, the task last. */
function staticPrompt(){
  const P = (typeof PERSONA === "string") ? PERSONA : "";
  return P + "\n\nYou write STUDY SUMMARIES for a student. You are given raw source material — a verbatim "
    + "recording transcript, a web page, pasted notes, or a session log. Work ONLY from that source: never invent a "
    + "name, number, definition, or claim that is not in it. Keep the source's own terms. If something is unclear or "
    + "absent, say so plainly. Plain prose with short labelled sections when the material is ordered. No preamble, no "
    + "meta-commentary about the act of summarizing, no filler bullets.";
}
function taskFor(kind){
  if(kind === "session")
    return "TASK: Write the session summary: (1) what this session covered, (2) the decisions actually made, "
      + "(3) open threads and anything unresolved, (4) the sovereign's own words that matter — quote them verbatim, "
      + "never paraphrase a quote. Then one final line: \"Next: \" followed by the single most useful next action.";
  if(kind === "recording")
    return "TASK: Write the study summary of this recording: (1) what it covers, (2) the key points in the order they "
      + "appear, (3) names, numbers, definitions and claims worth remembering, (4) what the recording leaves unclear or "
      + "unanswered. Then one final line: \"Study next: \" followed by the single most useful thing for the student to review.";
  if(kind === "web")
    return "TASK: Write the study summary of this page: (1) what it is about, (2) the key points in order, (3) names, "
      + "numbers and claims worth remembering, (4) anything unclear, unsupported or missing. Then one final line: "
      + "\"Study next: \" followed by the single most useful thing for the student to do with it.";
  return "TASK: Write the study summary of these notes: (1) what they cover, (2) the key points in the order they "
    + "appear, (3) names, numbers, definitions and claims worth remembering, (4) what is left unclear or unfinished. "
    + "Then one final line: \"Study next: \" followed by the single most useful thing for the student to review.";
}

/* ------------------------------ saving ------------------------------------- */

async function saveSummary(o){
  const rec = {
    id: newId(), title: String(o.title || "untitled").slice(0, 120), kind: o.kind || "notes",
    source: String(o.source || "?").slice(0, 200), ref: o.ref || null, created: Date.now(),
    chars: String(o.text || "").length, text: String(o.text || ""), generator: window.generatorName || null,
    student: null, classId: null
  };
  try{ if(window.ObiReview && window.ObiReview.stamp) window.ObiReview.stamp(rec); }catch(e){}
  workspace.set(rec.id, rec);
  try{ await folder().set(rec.id, rec); }catch(e){}
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [summary " + rec.id + " · " + rec.kind + " · " + rec.title + (rec.ref ? " ← " + rec.ref : "") + "]"); }catch(e){}
  try{ messages.push("Obi: [saved summary " + rec.title + "]"); }catch(e){}
  try{ if(window.ObiReview && window.ObiReview.file) window.ObiReview.file({ id: rec.id, kind: "summary", title: rec.title }); }catch(e){}
  return rec;
}
async function getRec(id){
  if(workspace.has(id)) return workspace.get(id);
  let rec = null;
  try{ rec = await folder().get(id); }catch(e){}
  if(rec) workspace.set(id, rec);
  return rec || null;
}
async function listRecs(){
  let pairs = [];
  try{ pairs = await folder().entries(); }catch(e){}
  return pairs.map(([k, v]) => v && typeof v === "object" ? v : null).filter(Boolean).filter(inClient).sort((a, b) => (b.created || 0) - (a.created || 0));
}
function toMarkdown(rec){
  return "# " + rec.title + "\n\n"
    + "*" + rec.kind + " · " + new Date(rec.created).toLocaleString() + " · source: " + (rec.source || "?") + " · Student Summary Generator (Obi)*\n"
    + (rec.ref ? "*Raw source kept separately: " + rec.ref + " — this summary never replaces it.*\n" : "")
    + "\n" + rec.text + "\n";
}

/* ------------------------------ the summary UI ----------------------------- */

function startBubble(){
  const bubble = addBubble("ass", "");
  bubble.innerHTML = '<div class="tr-status hint" style="text-align:left"></div><div class="tr-out"></div>';
  return bubble;
}
async function streamSummary(bubble, kind, sourceLabel, body, sampledNote){
  const st = bubble.querySelector(".tr-status");
  const out = bubble.querySelector(".tr-out");
  st.innerHTML = "📝 summarizing " + esc2(sourceLabel) + " — " + (kind === "session" ? "this session" : kind) + (sampledNote ? " · " + esc2(sampledNote) : "") + "…";
  let acc = "";
  const strip = s => String(s || "").replace(/^Obi:\s*/, "").trim();
  const res = await root.generateText({
    instruction: staticPrompt() + "\n\n<SOURCE kind=\"" + kind + "\">\n" + body + "\n</SOURCE>\n\n" + taskFor(kind),
    startWith: "Obi:\n",
    stopSequences: ["\nUser:"],
    onChunk: d => { acc = d.fullTextSoFar; const shown = strip(acc); if(shown) out.textContent = shown; try{ scrollDown(); }catch(e){} }
  });
  const text = strip(acc || res.generatedText || res.text || "");
  out.textContent = text || "—";
  return text;
}
function finishBubble(bubble, rec){
  const st = bubble.querySelector(".tr-status");
  st.innerHTML = "📝 saved as <b>" + esc2(rec.title) + "</b> · id " + esc2(rec.id) + " · /summaries";
  let acts = bubble.querySelector(".sm-acts");
  if(!acts){
    acts = document.createElement("div");
    acts.className = "tr-acts sm-acts";
    acts.style.marginTop = "8px";
    bubble.appendChild(acts);
  }
  acts.innerHTML = "";
  [["md", "📄 .md"], ["txt", "📄 .txt"], ["chat", "◈ Show"]].forEach(([verb, label]) => {
    const b = document.createElement("button");
    b.className = "ci-act"; b.textContent = label;
    b.onclick = () => act(rec.id, verb);
    acts.appendChild(b);
  });
  const foot = document.createElement("div");
  foot.className = "hint";
  foot.style.textAlign = "left";
  foot.textContent = rec.ref
    ? "Derived from " + rec.ref + " — the verbatim raw is kept untouched (raw first, L38)."
    : "Derived text — the raw you gave is still in the run log (raw first, L38).";
  bubble.appendChild(foot);
  try{ speak("Summary saved."); }catch(e){}
}

/* ------------------------------ sources ------------------------------------ */

function sessionSource(){
  let rr = null;
  try{ rr = loadRRL(runNoOf()); }catch(e){}
  const entries = (rr && rr.entries) || [];
  const lines = entries.map(e => "[" + (e.role || "?") + "] " + String(e.text || "").trim()).filter(s => s.length > 6);
  return { kind: "session", source: "run " + runNoOf() + " · " + lines.length + " log lines", text: lines.join("\n") };
}
async function transcriptSource(id){
  if(!window.ObiTranscribe) throw new Error("the ear (src/transcribe.js) isn't loaded");
  let rec = null;
  try{ if(id && id !== "last") rec = await window.ObiTranscribe.get(id); }catch(e){}
  if(!rec){
    const all = await window.ObiTranscribe.list();
    if(!all.length) return null;
    rec = all[0];
  }
  return { kind: "recording", source: rec.name + (rec.duration ? " · " + fmtDur(rec.duration) : "") + " · verbatim transcript"
      + ((rec.parts && rec.parts.length > 1) ? " · " + rec.parts.length + " parts" : "")
      + (rec.partial ? " · PARTIAL (part " + (rec.missing || []).join(",") + " missing)" : ""),
    text: rec.readable || rec.text, title: rec.name, ref: rec.id, transcript: rec };
}
async function urlSource(url){
  const r = await root.superFetch(url);
  if(!r.ok) throw new Error("HTTP " + r.status);
  let t = await r.text();
  t = t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
       .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  let host = url;
  try{ host = new URL(url).hostname + new URL(url).pathname.slice(0, 40); }catch(e){}
  return { kind: "web", source: host, text: t, title: host };
}

/* ------------------------------ commands ----------------------------------- */

async function run(arg){
  const s = String(arg || "").trim();
  const low = s.toLowerCase();
  let src = null;
  try{
    if(!s){
      src = await transcriptSource("last");
      if(!src) src = sessionSource();
    } else if(low === "session" || low === "chat" || low === "run"){
      src = sessionSource();
    } else if(low === "last" || low === "transcript"){
      src = await transcriptSource("last");
      if(!src){ addBubble("ass", "No transcripts stored yet — <b>/transcribe &lt;url&gt;</b> or drop a recording here first."); return; }
    } else if(/^sm-[a-z0-9-]+$/i.test(s)){
      addBubble("ass", "That's already a summary — a summary of a summary breaks the chain (L43). <b>/summary transcript " + esc2(s) + "</b>? No: use the raw transcript id (<b>tr-…</b>, see /transcripts).");
      return;
    } else if(low.startsWith("transcript ") || /^tr-[a-z0-9-]+$/i.test(s)){
      const id = low.startsWith("transcript ") ? s.slice(11).trim() : s;
      src = await transcriptSource(id);
      if(!src){ addBubble("ass", "No transcript with id <b>" + esc2(id) + "</b>. /transcripts lists them."); return; }
    } else if(/^https?:\/\//i.test(s) || /^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s)){
      src = await urlSource(/^https?:/i.test(s) ? s : "https://" + s);
    } else {
      src = { kind: "notes", source: "pasted notes", text: s, title: firstLine(s) };
    }
  }catch(e){
    addBubble("ass", "⚠ Couldn't get that source: " + esc2(e.message));
    return;
  }
  if(!src || !String(src.text || "").trim()){
    addBubble("ass", src && src.kind === "session"
      ? "This run's log is empty — nothing to summarize yet. Talk to me, or <b>/transcribe &lt;url&gt;</b> a recording first."
      : "⚠ Nothing to summarize — the source came back empty.");
    return;
  }

  const prepared = sampleText(src.text, MAX_INPUT);
  const note = prepared.sampled ? "sampled " + prepared.full.toLocaleString() + " chars down to " + MAX_INPUT.toLocaleString() + " for this pass" : "";
  const bubble = startBubble();
  let text = "";
  try{
    text = await streamSummary(bubble, src.kind, src.source, prepared.text, note);
  }catch(e){
    bubble.querySelector(".tr-status").textContent = "⚠ " + e.message;
    return;
  }
  if(!text){ bubble.querySelector(".tr-status").textContent = "⚠ The model returned nothing — try again."; return; }

  const rec = await saveSummary({
    title: src.title || (src.kind === "recording" ? "recording" : src.kind === "session" ? "session " + runNoOf() : "notes"),
    kind: src.kind, source: src.source, ref: src.ref || null, text
  });
  finishBubble(bubble, rec);
  return rec;
}

/* called by src/transcribe.js after Obi reads a recording — the briefing becomes
   a saved summary linked to the verbatim transcript. */
async function saveFromRead(transcriptRec, text, mode){
  if(!text || !transcriptRec) return null;
  return await saveSummary({
    title: transcriptRec.name + (mode === "fast" ? " — quick read" : " — briefing"),
    kind: "recording",
    source: transcriptRec.name + (transcriptRec.duration ? " · " + fmtDur(transcriptRec.duration) : ""),
    ref: transcriptRec.id,
    text
  });
}

async function act(id, verb){
  const rec = await getRec(id);
  if(!rec){ addBubble("ass", "⚠ No summary with id <b>" + esc2(id) + "</b>."); return; }
  if(verb === "md"){ download(slug(rec.title) + ".md", toMarkdown(rec), "text/markdown;charset=utf-8"); return; }
  if(verb === "txt"){ download(slug(rec.title) + ".txt", rec.text, "text/plain;charset=utf-8"); return; }
  if(verb === "chat"){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">📝 ' + esc2(rec.title) + '</div>'
      + '<div class="rrow"><b>' + esc2(rec.kind.toUpperCase()) + '</b><span class="vd">' + esc2(new Date(rec.created).toLocaleDateString()) + '</span><div class="rd">'
      + esc2(rec.source) + (rec.ref ? " · raw: " + esc2(rec.ref) : "") + '</div></div>'
      + '<div class="rrow tr-preview"><div class="rd tr-text">' + esc2(rec.text) + '</div></div>'
      + '<div class="rfoot">Saved summary. The raw it came from is untouched.</div></div>');
    return;
  }
  if(verb === "del"){
    if(!window.confirm("Delete summary \"" + rec.title + "\" permanently?")) return;
    try{ await folder().delete(id); }catch(e){}
    workspace.delete(id);
    addBubble("ass", "🗑 Deleted summary <b>" + esc2(rec.title) + "</b>.");
    return;
  }
}

async function library(){
  let recs = [];
  try{ recs = await listRecs(); }
  catch(e){ addBubble("ass", "⚠ Summary store unavailable: " + esc2(e.message)); return; }
  if(!recs.length){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">📝 /summaries · client ' + esc2(clientName()) + '</div><div class="rrow"><b>ARCHIVE</b><span class="vd">EMPTY</span><div class="rd">no summaries stored for this client yet</div></div>'
      + '<div class="rfoot"><b>/summary</b> summarizes the latest recording (or this session) · <b>/summary &lt;url&gt;</b> summarizes a page · <b>/summary &lt;text&gt;</b> summarizes notes.</div></div>');
    return;
  }
  const rows = recs.slice(0, LIB_LIMIT).map(r =>
    '<div class="rrow"><b>' + esc2(r.title) + '</b><span class="vd">' + esc2(r.kind) + '</span><div class="rd">'
    + esc2(new Date(r.created).toLocaleString()) + ' · ' + esc2((r.chars || 0).toLocaleString()) + ' chars · ' + esc2(r.source || "?")
    + (r.ref ? ' · raw: ' + esc2(r.ref) : '')
    + '<br><span class="tr-acts">'
    + '<button class="ci-act" data-act="chat" data-id="' + esc2(r.id) + '">◈ Show</button>'
    + '<button class="ci-act" data-act="md" data-id="' + esc2(r.id) + '">📄 .md</button>'
    + '<button class="ci-act" data-act="txt" data-id="' + esc2(r.id) + '">📄 .txt</button>'
    + '<button class="ci-act" data-act="del" data-id="' + esc2(r.id) + '">✗</button>'
    + '</span></div></div>'
  ).join("");
  const bubble = addBubble("ass", '<div class="rise tr-card"><div class="rhead">📝 /summaries — the archive · client ' + esc2(clientName()) + '</div>'
    + '<div class="rrow"><b>STORED</b><span class="vd">' + recs.length + '</span><div class="rd">study summaries kept in this browser (kv · ' + KV_FOLDER + ')</div></div>'
    + rows
    + '<div class="rfoot">Derived text, each one pointing back at its raw source. /transcripts holds the verbatim transcripts.</div></div>');
  bubble.querySelectorAll("[data-act]").forEach(btn => { btn.onclick = () => act(btn.dataset.id, btn.dataset.act); });
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [/summaries — " + recs.length + " stored]"); }catch(e){}
}

window.ObiSummary = { run, library, act, saveFromRead, list: listRecs, get: getRec, toMarkdown, save: saveSummary };
})();
