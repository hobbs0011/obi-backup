/* ============================================================================
   OBI — THE EAR · VIDEO + AUDIO TRANSCRIPTION  (src/transcribe.js)

   Transcription of video and audio for the magic chat, built for LONG
   recordings (an hour, and well past it):

     /transcribe https://…/lesson.mp4      remote media URL
     /transcribe                            opens the file picker
     drop / paste a video or audio file     transcribes it
     /transcripts                           the archive of saved transcripts

   Engine: Deepgram pre-recorded API (nova-3) — smart_format, punctuate,
   paragraphs, utterances, diarization. Deepgram fetches a remote URL itself
   (nothing is downloaded here) and accepts a local file up to 2 GB.

   LONG RECORDINGS (a two-hour lesson, a 3 GB video export): Deepgram's sync
   endpoint caps at 2 GB and returns 504 if a job would process longer than ten
   minutes, so big files are handled by src/audio-split.js instead — the audio
   track is decoded in the browser, dropped to 16 kHz mono, and cut into parts
   at points of SILENCE (never mid-word). The parts go to Deepgram one at a
   time and the timestamps are stitched back together, so a three-hour lesson
   is a few minutes of work with progress, retries, and resumable parts.

   Doctrine: this is capture, not editing (L38/L39). The verbatim transcript is
   written to the run's RRL (raw both-speaker log — raw != soul) and kept in the
   per-user kv store for export; nothing is summarized in place. Obi's reading
   is derived text, kept separate from the raw.

   The Deepgram key lives only in this browser's localStorage ("obi_keys"),
   set with /dg token <KEY>. Never in the public source, never in a URL.
   ========================================================================== */
(function(){
"use strict";

const DG_ENDPOINT   = "https://api.deepgram.com/v1/listen";
const DG_MAX_BYTES  = 2 * 1024 * 1024 * 1024;
const DG_WARN_BYTES = 300 * 1024 * 1024;
const SPLIT_BYTES   = 250 * 1024 * 1024;   // bigger than this: extract the audio first
const SPLIT_SEC     = 4 * 60 * 60;         // longer than this: same (504 risk)
const SPLIT_CHUNK   = 20 * 60;             // default part length, seconds
const PART_RETRIES  = 2;
const KV_FOLDER     = "transcripts";
const PART_CHARS    = 4000;
const MAX_PARTS     = 20;
const LIB_LIMIT     = 60;
const PREVIEW_CHARS = 1200;
const CHAT_CHARS    = 6000;

const MEDIA_EXT = /\.(mp4|m4v|mov|webm|mkv|avi|mpg|mpeg|ts|3gp|mp3|m4a|aac|wav|flac|ogg|oga|opus|wma|aif|aiff)$/i;
const MIME_MAP = {
  mp4:"video/mp4", m4v:"video/mp4", mov:"video/quicktime", webm:"video/webm", mkv:"video/x-matroska",
  avi:"video/x-msvideo", mpg:"video/mpeg", mpeg:"video/mpeg", ts:"video/mp2t", "3gp":"video/3gpp",
  mp3:"audio/mpeg", m4a:"audio/mp4", aac:"audio/aac", wav:"audio/wav", flac:"audio/flac",
  ogg:"audio/ogg", oga:"audio/ogg", opus:"audio/opus", wma:"audio/x-ms-wma", aif:"audio/aiff", aiff:"audio/aiff"
};
const PAGE_HOST = /(^|\.)(youtube\.com|youtu\.be|vimeo\.com|tiktok\.com|facebook\.com|instagram\.com|twitter\.com|x\.com|dailymotion\.com|soundcloud\.com|rumble\.com|bitchute\.com)$/i;

const workspace = new Map();
const WS_MAX = 8;                  // transcripts held in memory this session (kv keeps them all)
function wsSet(id, rec){
  workspace.set(id, rec);
  while(workspace.size > WS_MAX){
    const k = workspace.keys().next().value;
    if(k === id) break;
    workspace.delete(k);
  }
  return rec;
}

/* ------------------------------ small helpers ------------------------------ */

function key(){ try{ return (typeof keyGet === "function") ? keyGet("deepgram") : null; }catch(e){ return null; } }
function folder(){ if(!root || !root.kv) throw new Error("kv-plugin not loaded (main.pjs) — /transcripts unavailable"); return root.kv[KV_FOLDER]; }
/* this client's recordings only — see src/clients.js */
function inClient(rec){ try{ if(window.ObiClients && window.ObiClients.matches) return window.ObiClients.matches(rec); }catch(e){} return true; }
function clientName(){ try{ if(window.ObiClients && window.ObiClients.name) return window.ObiClients.name(); }catch(e){} return "Unassigned"; }
function safeEsc(s){ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s); }
function pad(n){ return String(n).padStart(2, "0"); }
function fmtDur(sec){
  sec = Math.max(0, Math.round(Number(sec) || 0));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s);
}
function fmtBytes(b){
  b = Number(b) || 0;
  if(b >= 1073741824) return (b / 1073741824).toFixed(2) + " GB";
  if(b >= 1048576) return (b / 1048576).toFixed(1) + " MB";
  return Math.max(1, Math.round(b / 1024)) + " KB";
}
function mimeFor(name){ return MIME_MAP[(String(name).split(".").pop() || "").toLowerCase()] || "application/octet-stream"; }
function slug(s){ return String(s || "transcript").replace(/\.[a-z0-9]{1,5}$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 60) || "transcript"; }
function newId(){ return "tr-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); }
function clip(s, n){ s = String(s || ""); return s.length > n ? s.slice(0, n) : s; }
/* addBubble returns the inner .bubble div, so removing it leaves an empty .row
   behind in the chat — always drop the whole row. */
function dropRow(el){ if(!el) return; const r = el.closest ? el.closest(".row") : null; (r || el).remove(); }

/* ------------------------------ Deepgram request --------------------------- */

function parseArgs(raw){
  const o = { model:"nova-3", language:"en", diarize:true, utterances:true, paragraphs:true, keyterms:[], set:[] };
  const words = [];
  for(const tok of String(raw || "").trim().split(/\s+/).filter(Boolean)){
    const m = /^--([a-z][a-z-]*)(?:=(.*))?$/i.exec(tok);
    if(!m){ words.push(tok); continue; }
    const k = m[1].toLowerCase(), v = (m[2] || "").trim();
    o.set.push(k);
    if(k === "no-diarize" || k === "no-diarize=true") o.diarize = false;
    else if(k === "diarize") o.diarize = v ? v !== "false" : true;
    else if(k === "utterances") o.utterances = v ? v !== "false" : true;
    else if(k === "paragraphs") o.paragraphs = v ? v !== "false" : true;
    else if(k === "snap") o.noSnap = false;
    else if(k === "no-utterances") o.utterances = false;
    else if(k === "no-paragraphs") o.paragraphs = false;
    else if(k === "lang" || k === "language") o.language = v || "en";
    else if(k === "multi" || k === "multi=true"){ o.language = "multi"; o.diarize = false; }
    else if(k === "detect" || k === "detect-language"){ o.language = ""; o.detect = true; o.diarize = false; }
    else if(k === "model") o.model = v || "nova-3";
    else if(k === "keyterm" || k === "keyterms") o.keyterms = v.split(",").map(s => s.trim()).filter(Boolean);
    else if(k === "force") o.force = true;
    else if(k === "quick") o.quick = true;
    else if(k === "split" || k === "chunk" || k === "parts") o.splitMin = v ? Math.max(1, Math.min(120, parseInt(v, 10) || 20)) : 20;
    else if(k === "whole" || k === "no-split") o.whole = true;
    else if(k === "no-snap") o.noSnap = true;
  }
  return { url: words[0] || "", extra: words.slice(1), opts: o };
}

function queryString(o){
  const p = new URLSearchParams();
  p.set("model", o.model || "nova-3");
  p.set("smart_format", "true");
  p.set("punctuate", "true");
  p.set("fillers", "false");
  if(o.detect) p.set("detect_language", "true");
  else if(o.language) p.set("language", o.language);
  if(o.diarize) p.set("diarize", "true");
  if(o.utterances) p.set("utterances", "true");
  if(o.paragraphs) p.set("paragraphs", "true");
  for(const kt of (o.keyterms || [])) p.append("keyterm", kt);
  return p.toString();
}

/* XHR (not fetch) because it gives upload progress and a hard abort for
   hour-long jobs. Deepgram allows browser origins, so the request goes
   straight there — no proxy, no timeout ceiling. */
function dgRequest(o){
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const target = DG_ENDPOINT + "?" + queryString(o.opts);
    xhr.open("POST", target, true);
    xhr.setRequestHeader("Authorization", "Token " + key());
    xhr.setRequestHeader("Accept", "application/json");
    let payload;
    if(o.file){ xhr.setRequestHeader("Content-Type", o.file.type || mimeFor(o.file.name)); payload = o.file; }
    else { xhr.setRequestHeader("Content-Type", "application/json"); payload = JSON.stringify({ url: o.url }); }
    o.handle.xhr = xhr;
    o.handle.bytes = payload && payload.size ? payload.size : 0;
    if(o.opts.detect || o.opts.language === "multi") o.handle.noDiarize = true;

    let uploaded = false;
    xhr.upload.onprogress = e => { if(e.lengthComputable && o.onUpload) o.onUpload(e.loaded / e.total, e.loaded, e.total); };
    xhr.upload.onload = () => { uploaded = true; if(o.onUpload) o.onUpload(1, o.handle.bytes, o.handle.bytes); if(o.onUploaded) o.onUploaded(); };
    xhr.onload = () => {
      let json = null;
      try{ json = JSON.parse(xhr.responseText); }catch(e){}
      if(xhr.status >= 200 && xhr.status < 300 && json && json.results) return resolve(json);
      const apiErr = (json && (json.err_msg || json.message || json.error)) || "";
      let msg = "HTTP " + xhr.status + (apiErr ? " — " + apiErr : "");
      if(xhr.status === 504) msg = "Deepgram timed out processing this recording (its sync ceiling is 10 minutes of processing) — try a shorter cut, or split the recording.";
      else if(xhr.status === 413) msg = "Deepgram rejected the file as too large (2 GB is the hard cap).";
      else if(xhr.status === 402) msg = "Deepgram says this account is out of credit/quota.";
      else if(xhr.status === 401 || xhr.status === 403) msg = "Deepgram rejected the key — re-set it with /dg token <KEY>.";
      else if(!json) msg += " (non-JSON response)";
      /* The prose above deliberately replaces the raw status text, so the status is
         carried on the error object: retry decisions and the "split it" offer must
         key off the CODE, never off the wording. */
      const err = new Error(msg);
      err.status = xhr.status;
      err.retryable = !(xhr.status === 504 || xhr.status === 413 || xhr.status === 402 || xhr.status === 401 || xhr.status === 403 || xhr.status === 400 || xhr.status === 404 || xhr.status === 415 || xhr.status === 422);
      reject(err);
    };
    xhr.onerror = () => { const e = new Error("network error talking to Deepgram" + (uploaded ? " (upload finished, response lost)" : "")); e.retryable = true; reject(e); };
    xhr.onabort = () => { const e = new Error("cancelled"); e.retryable = false; reject(e); };
    try{ xhr.send(payload); }catch(e){ reject(e); }
  });
}

/* ------------------------------ progress card ------------------------------ */

function jobCard(meta){
  const bubble = addBubble("ass", "");
  const partRow = meta.parts > 1
    ? '<div class="rrow"><b>PARTS</b><span class="vd" data-partsdone>0/' + meta.parts + '</span><div class="rd" data-parts>cutting the audio at pauses…</div></div>'
    : '';
  const prepRow = meta.parts > 1
    ? '<div class="rrow" data-preprow><b>PREP</b><span class="vd" data-prep>0%</span><div class="rd"><div class="tr-bar indet" data-prepbar><i></i></div><span data-prepnote>reading the audio track…</span></div></div>'
    : '';
  bubble.innerHTML = '<div class="rise tr-card">'
    + '<div class="rhead">🎬 Listening — ' + safeEsc(meta.name) + '</div>'
    + '<div class="rrow"><b>SOURCE</b><span class="vd">' + safeEsc(meta.source) + '</span><div class="rd">' + safeEsc(meta.detail || "") + '</div></div>'
    + '<div class="rrow"><b>ENGINE</b><span class="vd">DEEPGRAM</span><div class="rd">' + safeEsc(meta.engine) + '</div></div>'
    + prepRow
    + '<div class="rrow"><b>STATUS</b><span class="vd" data-stage>UPLOADING</span><div class="rd">'
    +   '<div class="tr-bar indet" data-bar><i></i></div></div></div>'
    + '<div class="rrow"><b>ELAPSED</b><span class="vd" data-clock>00:00</span><div class="rd" data-note>starting…</div></div>'
    + partRow
    + '<div class="rrow"><b>ACTIONS</b><span class="vd"></span><div class="rd tr-acts"><button class="ci-act" data-cancel>✗ Cancel</button></div></div>'
    + '<div class="rfoot">' + (meta.parts > 1
        ? "Long recording → the audio track is being extracted and split at pauses, then sent part by part. You can keep chatting while it listens."
        : "An hour of recording is still one job — Deepgram runs far faster than realtime. You can keep chatting while it listens.") + '</div>'
    + '</div>';
  const q = s => bubble.querySelector(s);
  let t0 = Date.now(), elapsed = 0, iv = null;
  const tick = () => { const c = q("[data-clock]"); if(c) c.textContent = fmtDur((elapsed + (Date.now() - t0)) / 1000); };
  const api = {
    bubble,
    cancelled: false,
    setStage(stage, note){
      const el = q("[data-stage]"); if(el) el.textContent = stage;
      if(note != null){ const n = q("[data-note]"); if(n) n.textContent = note; }
    },
    setNote(note){ const n = q("[data-note]"); if(n) n.textContent = note; },
    setPrep(p, note){
      const bar = q("[data-prepbar]"), fill = q("[data-prepbar] i"), pc = q("[data-prep]"), nt = q("[data-prepnote]");
      if(pc) pc.textContent = Math.round(p * 100) + "%";
      if(nt && note) nt.textContent = note;
      if(bar && fill){ bar.classList.remove("indet"); fill.style.width = Math.round(p * 100) + "%"; }
    },
    setPrepStage(stage, note){
      const st = q("[data-stage]"); if(st) st.textContent = stage;
      const nt = q("[data-prepnote]"); if(nt && note) nt.textContent = note;
    },
    setPct(p, loaded, total){
      const bar = q("[data-bar]"), fill = q("[data-bar] i");
      if(!bar || !fill) return;
      if(p >= 1){ bar.classList.remove("indet"); fill.style.width = "100%"; }
      else if(p > 0){ bar.classList.remove("indet"); fill.style.width = Math.round(p * 100) + "%"; api.setNote("uploading " + Math.round(p * 100) + "% · " + fmtBytes(loaded) + " / " + fmtBytes(total)); }
      else { bar.classList.add("indet"); }
    },
    setParts(states){
      const box = q("[data-parts]"), done = q("[data-partsdone]");
      if(!box) return;
      box.innerHTML = states.map((s, i) => {
        const cls = s.state === "done" ? "ok" : s.state === "failed" ? "bad" : s.state === "running" ? "run" : "";
        const mark = s.state === "done" ? "✓" + (s.words ? " " + s.words.toLocaleString() + "w" : "") : s.state === "failed" ? "✗" : s.state === "running" ? "●" : "·";
        const t = s.state === "done" ? fmtDur(s.duration || 0) : "";
        return '<span class="part-chip ' + cls + '" title="' + safeEsc(s.label || ("part " + (i + 1))) + '">' + safeEsc(String(i + 1)) + " " + mark + (t ? " " + t : "") + "</span>";
      }).join(" ");
      if(done) done.textContent = states.filter(s => s.state === "done").length + "/" + states.length;
    },
    onCancel(fn){ const b = q("[data-cancel]"); if(b) b.onclick = () => { api.cancelled = true; fn(); }; },
    stop(){ if(iv){ clearInterval(iv); iv = null; } elapsed += Date.now() - t0; },
    /* a stopped job (a failed part waiting on the user) can be resumed — keep the
       elapsed clock honest instead of freezing it at the moment it stopped */
    resumeClock(){ if(iv) return; t0 = Date.now(); iv = setInterval(tick, 1000); tick(); }
  };
  api.resumeClock();
  return api;
}

function failCard(bubble, msg, hint, action){
  bubble.innerHTML = '<div class="rise tr-card"><div class="rhead">🎬 Transcription failed</div>'
    + '<div class="rrow bad"><b>ERROR</b><span class="vd">STOPPED</span><div class="rd">' + safeEsc(msg) + '</div></div>'
    + (hint ? '<div class="rrow"><b>NEXT</b><span class="vd"></span><div class="rd">' + hint + '</div></div>' : "")
    + (action ? '<div class="rrow"><b>ACTIONS</b><span class="vd"></span><div class="rd tr-acts"><button class="ci-act" data-retry>' + action.label + '</button></div></div>' : "")
    + '<div class="rfoot">Raw is raw: nothing was written to the run log for a failed job.</div></div>';
  if(action){
    const b = bubble.querySelector("[data-retry]");
    if(b) b.onclick = () => action.fn();
  }
}

/* ------------------------------ result parsing ----------------------------- */

function toRec(json, meta){
  const r = json.results || {};
  const ch = (r.channels && r.channels[0]) || {};
  const alt = (ch.alternatives && ch.alternatives[0]) || {};
  const words = alt.words || [];
  const utterances = (r.utterances || []).map(u => ({
    start: Number(u.start) || 0, end: Number(u.end) || 0,
    speaker: (u.speaker == null ? null : Number(u.speaker)),
    text: String(u.transcript || "").trim()
  })).filter(u => u.text);
  const paragraphs = (alt.paragraphs && alt.paragraphs.transcript) || "";
  const plain = String(alt.transcript || paragraphs || words.map(w => w.punctuated_word || w.word || "").join(" ")).trim();

  const speakerSet = new Set();
  for(const w of words) if(w.speaker != null) speakerSet.add(Number(w.speaker));
  const speakers = Array.from(speakerSet).sort((a, b) => a - b);

  let readable;
  if(utterances.length){
    readable = utterances.map(u =>
      "[" + fmtDur(u.start) + "]" + (u.speaker == null ? "" : " Speaker " + (u.speaker + 1) + ":") + " " + u.text
    ).join("\n");
  } else readable = paragraphs || plain;

  const md = json.metadata || {};
  const model = (md.model_info && Object.values(md.model_info)[0] && Object.values(md.model_info)[0].name) || meta.opts.model || "nova-3";

  /* Fluency metrics from the timing map — real, citable evidence for reading reviews. */
  const duration = Number(md.duration) || 0;
  const wpm = (duration && words.length) ? Math.round((words.length / duration) * 60) : 0;
  let pauses = 0, longestPause = 0;
  for(let i = 1; i < utterances.length; i++){
    const gap = utterances[i].start - utterances[i - 1].end;
    if(gap > 3){ pauses++; if(gap > longestPause) longestPause = gap; }
  }

  return {
    id: newId(),
    name: meta.name,
    source: meta.source,
    url: meta.ref || null,
    created: Date.now(),
    duration: duration,
    language: String(md.language || (meta.opts.detect ? "detected" : meta.opts.language) || "en"),
    model: String(model),
    words: words.length,
    chars: readable.length,
    speakers,
    diarized: !!meta.opts.diarize,
    wpm, pauses, longestPause,
    utterances,
    paragraphs,
    text: plain,
    readable,
    request_id: String(md.request_id || "")
  };
}

function statLine(rec){
  return [
    rec.duration ? "1 recording · " + fmtDur(rec.duration) : null,
    rec.words.toLocaleString() + " words",
    rec.speakers.length ? rec.speakers.length + " speaker" + (rec.speakers.length === 1 ? "" : "s") : null,
    rec.diarized ? "diarized" : null
  ].filter(Boolean).join(" · ");
}

function partLine(rec){
  const sp = rec.split || {};
  const total = sp.partTotal || (rec.parts || []).length;
  const bits = [
    rec.partial ? (rec.parts || []).length + " of " + total + " parts" : total + " parts",
    sp.container ? sp.container + " → 16 kHz mono" : null,
    sp.sourceRate ? sp.sourceRate + " Hz source" : null,
    sp.snapped ? "cut at pauses" : "cut at fixed points",
    sp.partTotal ? Math.round((sp.chunkSec || 0) / 60) + " min parts" : null
  ].filter(Boolean);
  return bits.join(" · ");
}

function resultCardHTML(rec){
  const preview = clip(rec.readable, PREVIEW_CHARS);
  const spk = rec.speakers.length ? String(rec.speakers.length) : "off";
  const sp = rec.split || {};
  const totalParts = sp.partTotal || (rec.parts || []).length;
  const partsRow = (rec.parts && (rec.parts.length > 1 || totalParts > 1))
    ? '<div class="rrow' + (rec.partial ? " bad" : "") + '"><b>PARTS</b><span class="vd">' + rec.parts.length
      + "/" + totalParts + (rec.partial ? " PARTIAL" : "") + '</span><div class="rd">'
      + safeEsc(partLine(rec))
      + ' · ' + rec.parts.map(p => "p" + p.index + " " + Number(p.words || 0).toLocaleString() + "w").join(" · ")
      + (rec.partial ? '<br>MISSING: part ' + (rec.missing || []).join(", ") + ' — everything else is verbatim and saved. Click ✂ Parts to see what came through.' : "")
      + '</div></div>'
    : "";
  return '<div class="rise tr-card">'
    + '<div class="rhead">🎬 Transcript — ' + safeEsc(rec.name) + '</div>'
    + '<div class="rrow"><b>DURATION</b><span class="vd">' + (rec.duration ? safeEsc(fmtDur(rec.duration)) : "—") + '</span><div class="rd">'
    +   safeEsc(statLine(rec)) + ' · engine ' + safeEsc(rec.model) + ' · lang ' + safeEsc(rec.language)
    +   (rec.partial && rec.covered ? ' · <b>PARTIAL</b> — ' + safeEsc(fmtDur(rec.covered)) + ' of the recording was transcribed' : '') + '</div></div>'
    + '<div class="rrow"><b>SEGMENTS</b><span class="vd">' + rec.utterances.length + '</span><div class="rd">'
    +   rec.chars.toLocaleString() + ' chars · ' + safeEsc(rec.source) + (rec.url ? ' · ' + safeEsc(clip(rec.url, 90)) : '') + '</div></div>'
    + '<div class="rrow"><b>SPEAKERS</b><span class="vd">' + safeEsc(spk) + '</span><div class="rd">'
    +   (rec.speakers.map(s => "Speaker " + (s + 1)).join(" · ") || "diarization off")
    +   ((rec.parts && rec.parts.length > 1 && rec.diarized) ? " — numbers are part-local (each part is diarized on its own)" : "") + '</div></div>'
    + partsRow
    + '<div class="rrow"><b>PRESERVED</b><span class="vd">RRL</span><div class="rd">run ' + runNoOf() + ' raw log + kv "' + KV_FOLDER + '" · id ' + safeEsc(rec.id) + '</div></div>'
    + '<div class="rrow"><b>PACE</b><span class="vd">' + (rec.wpm ? rec.wpm + " wpm" : "—") + '</span><div class="rd">'
    +   (rec.pauses ? rec.pauses + " pause(s) over 3s · longest " + fmtDur(rec.longestPause) : "no gaps over 3s")
    +   ' · from the word timings, so it can be cited in a review</div></div>'
    + '<div class="rrow tr-preview"><b>PREVIEW</b><div class="rd tr-text">' + safeEsc(preview) + (rec.readable.length > preview.length ? "\n…" : "") + '</div></div>'
    + '<div class="rrow"><b>ACTIONS</b><span class="vd"></span><div class="rd tr-acts">'
    +   '<button class="ci-act" data-act="read" data-id="' + safeEsc(rec.id) + '">🧠 Obi read it</button>'
    +   '<button class="ci-act" data-act="fast" data-id="' + safeEsc(rec.id) + '">⚡ Quick read</button>'
    +   ((rec.parts && rec.parts.length > 1) ? '<button class="ci-act" data-act="parts" data-id="' + safeEsc(rec.id) + '">✂ Parts</button>' : "")
    +   '<button class="ci-act" data-act="txt" data-id="' + safeEsc(rec.id) + '">📄 .txt</button>'
    +   '<button class="ci-act" data-act="srt" data-id="' + safeEsc(rec.id) + '">🎬 .srt</button>'
    +   '<button class="ci-act" data-act="vtt" data-id="' + safeEsc(rec.id) + '">📋 .vtt</button>'
    +   '<button class="ci-act" data-act="chat" data-id="' + safeEsc(rec.id) + '">◈ Show in chat</button>'
    +   '<button class="ci-act" data-act="json" data-id="' + safeEsc(rec.id) + '">🗄 JSON</button>'
    + '</div></div>'
    + '<div class="rfoot">Verbatim capture, never summarized in place (L38/L39). /transcripts for the archive · /dg token to change the key.</div>'
    + '</div>';
}

/* ------------------------------ storage / export --------------------------- */

async function saveRec(rec){ try{ await folder().set(rec.id, rec); }catch(e){} }
async function getRec(id){
  if(workspace.has(id)) return workspace.get(id);
  let rec = null;
  try{ rec = await folder().get(id); }catch(e){ rec = null; }
  if(rec) wsSet(id, rec);
  return rec || null;
}
async function listRecs(){
  let pairs = [];
  try{ pairs = await folder().entries(); }catch(e){ pairs = []; }
  return pairs.map(([k, v]) => v && typeof v === "object" ? v : null).filter(Boolean).filter(inClient)
    .sort((a, b) => (b.created || 0) - (a.created || 0));
}

function rrlCapture(rec){
  try{
    const head = "[TRANSCRIPT " + rec.id + " · " + rec.name + " · " + fmtDur(rec.duration) + " · "
      + rec.words.toLocaleString() + " words · " + rec.model + "]";
    const body = rec.readable || rec.text;
    if(body.length <= 200000) rrlAppend(runNoOf(), "RRL", head + "\n" + body);
    else rrlAppend(runNoOf(), "RRL", head + " — too large for the run log; the verbatim body is held in kv/" + KV_FOLDER + "/" + rec.id);
  }catch(e){}
}

function srtStamp(sec){
  sec = Math.max(0, Number(sec) || 0);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60), ms = Math.round((sec - Math.floor(sec)) * 1000);
  return pad(h) + ":" + pad(m) + ":" + pad(s) + "," + String(ms).padStart(3, "0");
}
function vttStamp(sec){ return srtStamp(sec).replace(",", "."); }
function cuesOf(rec){
  if(rec.utterances && rec.utterances.length) return rec.utterances;
  const paras = String(rec.paragraphs || "").split(/\n+/).map(s => s.trim()).filter(Boolean);
  const base = paras.length ? paras : String(rec.text || "").match(/[^.!?]+[.!?]?/g) || [];
  const step = rec.duration && base.length ? rec.duration / base.length : 0;
  return base.map((t, i) => ({ start: i * step, end: (i + 1) * step, speaker: null, text: t.trim() }));
}
function toSRT(rec){
  return cuesOf(rec).map((u, i) =>
    (i + 1) + "\n" + srtStamp(u.start) + " --> " + srtStamp(u.end) + "\n"
    + (u.speaker == null ? "" : "Speaker " + (u.speaker + 1) + ": ") + u.text + "\n"
  ).join("\n");
}
function toVTT(rec){
  return "WEBVTT\n\n" + cuesOf(rec).map((u, i) =>
    (i + 1) + "\n" + vttStamp(u.start) + " --> " + vttStamp(u.end) + "\n"
    + (u.speaker == null ? "" : "<v Speaker " + (u.speaker + 1) + ">") + u.text + "\n"
  ).join("\n");
}
function toJSON(rec){
  return JSON.stringify({
    id: rec.id, name: rec.name, source: rec.source, url: rec.url, created: new Date(rec.created).toISOString(),
    duration_seconds: rec.duration, language: rec.language, model: rec.model, speakers: rec.speakers,
    words: rec.words, request_id: rec.request_id, utterances: rec.utterances, transcript: rec.text, readable: rec.readable
  }, null, 2);
}
function download(name, text, mime){
  try{
    const url = URL.createObjectURL(new Blob([text], { type: mime || "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click();
    setTimeout(() => { try{ URL.revokeObjectURL(url); a.remove(); }catch(e){} }, 5000);
    return true;
  }catch(e){ return false; }
}

/* ------------------------------ Obi reads it ------------------------------- */

function chunkText(text, size){
  const out = [];
  let buf = "";
  for(const line of String(text || "").split("\n")){
    if(line.length > size){
      if(buf){ out.push(buf); buf = ""; }
      for(let i = 0; i < line.length; i += size) out.push(line.slice(i, i + size));
      continue;
    }
    if(buf && buf.length + line.length + 1 > size){ out.push(buf); buf = ""; }
    buf = buf ? buf + "\n" + line : line;
  }
  if(buf) out.push(buf);
  return out;
}
function groupBySize(arr, size){
  const groups = []; let g = [], n = 0;
  for(const s of arr){
    if(g.length && n + s.length + 2 > size){ groups.push(g); g = []; n = 0; }
    g.push(s); n += s.length + 2;
  }
  if(g.length) groups.push(g);
  return groups;
}
function spread(arr, n){
  if(arr.length <= n) return arr.map((v, i) => ({ v, i, of: arr.length }));
  const out = [];
  for(let k = 0; k < n; k++){ const i = Math.round(k * (arr.length - 1) / (n - 1)); out.push({ v: arr[i], i, of: arr.length }); }
  return out;
}
function sampleText(text, budget){
  text = String(text || "");
  if(text.length <= budget) return text;
  const win = Math.floor(budget / 3);
  return clip(text, win) + "\n…\n" + text.slice(Math.floor(text.length / 2) - win / 2, Math.floor(text.length / 2) + win / 2) + "\n…\n" + text.slice(-win);
}

function readHeader(rec){
  const P = (typeof PERSONA === "string") ? PERSONA : "";
  return P + "\n\nYou are reading a VERBATIM transcript of a real recording"
    + ' ("' + rec.name + '", ' + (rec.duration ? fmtDur(rec.duration) : "unknown length") + ", "
    + (rec.speakers.length ? rec.speakers.length + " speaker(s)" : "no speaker split") + ", engine " + rec.model + ").\n"
    + (rec.partial ? "IMPORTANT: this transcript is PARTIAL — part " + ((rec.missing || []).join(", ")) + " of "
        + ((rec.split && rec.split.partTotal) || "?") + " is missing (only " + (rec.covered ? fmtDur(rec.covered) : "part") + " of "
        + fmtDur(rec.duration) + " was transcribed). Never claim the recording is complete; say what is missing if it matters.\n" : "")
    + (rec.parts && rec.parts.length > 1 ? "It was transcribed in " + rec.parts.length + " parts (cut at pauses) and stitched back into one timeline; each part is marked [PART n/N], and speaker numbers restart in each part.\n" : "")
    + "The words are raw capture: verbatim, with transcription noise, filler, and mis-heard words. Treat them as evidence, not prose. "
    + "Never invent content that isn't in the transcript. If something is unclear, say it is unclear.";
}

async function streamInto(rec, target, instruction, label){
  label = label || "Obi:";
  let out = "";
  const strip = s => String(s || "").replace(/^Obi:\s*/, "").trim();
  const res = await root.generateText({
    instruction,
    startWith: label + "\n",
    stopSequences: ["\nUser:"],
    onChunk: d => { out = d.fullTextSoFar; const shown = strip(out); if(shown) target.textContent = shown; try{ scrollDown(); }catch(e){} }
  });
  const finalShown = strip(out || res.generatedText || res.text || "");
  target.textContent = finalShown || "—";
  try{
    messages.push((label + " " + clip(finalShown, 2000)).trim());
    rrlAppend(runNoOf(), "DNA", label + " [read transcript " + rec.id + "] " + clip(finalShown, 400));
    speak(finalShown.length > 1200 ? "Here is what I found in the recording." : finalShown);
  }catch(e){}
  return finalShown;
}

/* The briefing Obi just wrote is a study summary — save it (derived, pointing
   back at the verbatim transcript) so it survives the session. */
async function afterRead(bubble, rec, text, mode){
  try{
    if(!text || !window.ObiSummary) return;
    const saved = await window.ObiSummary.saveFromRead(rec, text, mode === "fast" ? "fast" : "deep");
    if(!saved) return;
    const foot = document.createElement("div");
    foot.className = "hint";
    foot.style.textAlign = "left";
    foot.textContent = "📝 Saved as study summary " + saved.id + " — /summaries to export it.";
    bubble.appendChild(foot);
  }catch(e){}
}

async function readTranscript(id, mode){
  const rec = await getRec(id);
  if(!rec) { addBubble("ass", "⚠ No transcript with id <b>" + safeEsc(id) + "</b>."); return; }
  const text = rec.readable || rec.text || "";
  if(!String(text).trim()){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎬 ' + safeEsc(rec.name) + '</div><div class="rrow bad"><b>RESULT</b><span class="vd">SILENT</span><div class="rd">Deepgram found no speech in this recording — nothing to read.</div></div></div>');
    return;
  }
  const bubble = addBubble("ass", "");
  const header = readHeader(rec);
  try{
    if(mode === "fast" || text.length <= PART_CHARS){
      const body = mode === "fast" ? sampleText(text, 12000) : text;
      const task = "Write a dense briefing on this recording: what it actually says, in order; the people/names; the numbers and claims; any decisions, promises, or open questions. Then one short line on what is genuinely useful in it. Plain prose, no preamble, no bullet-point padding.";
      const brief = await streamInto(rec, bubble, header + "\n\n<RECORDING>\n" + body + "\n</RECORDING>\n\nTASK: " + task);
      await afterRead(bubble, rec, brief, mode);
      return;
    }
    /* Long recording: map notes per part, fold the notes, then write the briefing. */
    const parts = chunkText(text, PART_CHARS);
    const picked = spread(parts, MAX_PARTS);
    bubble.innerHTML = '<div class="tr-status hint" style="text-align:left"></div><div class="tr-out"></div>';
    const st = bubble.querySelector(".tr-status"), out = bubble.querySelector(".tr-out");
    const setSt = html => { st.innerHTML = html; try{ scrollDown(); }catch(e){} };
    const notes = [];
    for(const p of picked){
      setSt("🧠 reading <b>" + safeEsc(rec.name) + "</b> — part " + (p.i + 1) + " of " + p.of + " · " + notes.length + " notes so far");
      const r = await root.generateText(header
        + "\n\n<TRANSCRIPT_PART>\n" + p.v + "\n</TRANSCRIPT_PART>\n\n"
        + "TASK: Write dense notes for THIS part only — names, numbers, claims, decisions, promises, open questions, in the speaker's own terms. No preamble.");
      notes.push(String(r.generatedText || r.text || r || "").trim());
    }
    if(picked.length < parts.length) notes.unshift("[note: the recording was sampled — parts " + picked.map(p => (p.i + 1)).join(", ") + " of " + parts.length + " were read]");
    let folded = notes, round = 0;
    while(folded.length > 1 && round < 4){
      const groups = groupBySize(folded, 6000);
      if(groups.length === folded.length) break;
      const next = [];
      for(let gi = 0; gi < groups.length; gi++){
        setSt("🧠 folding notes — pass " + (round + 1) + ", group " + (gi + 1) + " of " + groups.length);
        const r = await root.generateText(header + "\n\n<NOTES>\n" + groups[gi].join("\n\n") + "\n</NOTES>\n\n"
          + "TASK: Merge these notes into one dense set. Keep every name, number, decision, promise, and open question. Drop repetition. No preamble.");
        next.push(String(r.generatedText || r.text || r || "").trim());
      }
      folded = next; round++;
    }
    setSt("🧠 writing the briefing…");
    const task = "Using only your notes above, write the briefing on this recording: what it actually says, in order; the people/names; the numbers and claims; decisions, promises, open questions; and one short line on what is genuinely useful in it. Plain prose, no preamble.";
    await streamInto(rec, out, header + "\n\n<NOTES>\n" + folded.join("\n\n") + "\n</NOTES>\n\nTASK: " + task);
    st.remove();
    await afterRead(bubble, rec, out.textContent, "deep");
  }catch(e){
    if(!bubble.textContent) bubble.textContent = "⚠ " + e.message;
    else addBubble("ass", "⚠ Read stopped: " + safeEsc(e.message));
  }
}

/* ------------------------------ actions ------------------------------------ */

async function act(id, verb){
  const rec = await getRec(id);
  if(!rec){ addBubble("ass", "⚠ No transcript with id <b>" + safeEsc(id) + "</b>."); return; }
  const base = slug(rec.name);
  try{
    if(verb === "read") return await readTranscript(id, "deep");
    if(verb === "fast") return await readTranscript(id, "fast");
    if(verb === "txt"){ download(base + ".txt", rec.readable || rec.text, "text/plain;charset=utf-8"); try{ logOp({ kind:"export", action:"transcript:txt", detail: rec.name, result: (rec.chars || 0) + " chars left the browser", ref: rec.id }); }catch(e){} return; }
    if(verb === "srt"){ download(base + ".srt", toSRT(rec), "application/x-subrip;charset=utf-8"); try{ logOp({ kind:"export", action:"transcript:srt", detail: rec.name, ref: rec.id }); }catch(e){} return; }
    if(verb === "vtt"){ download(base + ".vtt", toVTT(rec), "text/vtt;charset=utf-8"); try{ logOp({ kind:"export", action:"transcript:vtt", detail: rec.name, ref: rec.id }); }catch(e){} return; }
    if(verb === "json"){ download(base + ".json", toJSON(rec), "application/json"); try{ logOp({ kind:"export", action:"transcript:json", detail: rec.name, ref: rec.id }); }catch(e){} return; }
    if(verb === "parts"){
      const list = (rec.parts || []);
      if(!list.length){ addBubble("ass", "⚠ <b>" + safeEsc(rec.name) + "</b> wasn't split — it went to Deepgram in one piece."); return; }
      const sp = rec.split || {};
      addBubble("ass", '<div class="rise tr-card"><div class="rhead">✂ ' + safeEsc(rec.name) + ' — ' + list.length + ' parts</div>'
        + '<div class="rrow"><b>HOW</b><span class="vd">' + safeEsc(sp.container || "?") + '</span><div class="rd">' + safeEsc(partLine(rec)) + '</div></div>'
        + list.map(p => '<div class="rrow"><b>PART ' + p.index + '</b><span class="vd">' + safeEsc(fmtDur(p.duration)) + '</span><div class="rd">'
            + safeEsc(fmtDur(p.start)) + '–' + safeEsc(fmtDur(p.end)) + ' · ' + Number(p.words || 0).toLocaleString() + ' words · ' + Number(p.chars || 0).toLocaleString() + ' chars</div></div>').join("")
        + (rec.partial ? '<div class="rrow bad"><b>MISSING</b><span class="vd">' + (rec.missing || []).length + '</span><div class="rd">part ' + (rec.missing || []).join(", ") + ' could not be transcribed — the rest is verbatim and kept.</div></div>' : "")
        + '<div class="rfoot">Each part was cut at a pause, then its timestamps were shifted back into the timeline of the whole recording. The joined transcript lives in the run log (RRL) and kv "' + KV_FOLDER + '".</div></div>');
      return;
    }
    if(verb === "chat"){
      const body = rec.readable || rec.text;
      const shown = clip(body, CHAT_CHARS);
      addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎬 ' + safeEsc(rec.name) + ' — verbatim</div>'
        + '<div class="rrow tr-preview"><div class="rd tr-text">' + safeEsc(shown) + (body.length > shown.length ? "\n…" : "") + '</div></div>'
        + '<div class="rfoot">' + rec.words.toLocaleString() + ' words · ' + fmtDur(rec.duration) + ' · '
        + (body.length > shown.length ? "showing the first " + CHAT_CHARS.toLocaleString() + " chars — download .txt for the whole thing." : "complete.") + '</div></div>');
      return;
    }
    if(verb === "del"){
      if(!window.confirm("Delete transcript \"" + rec.name + "\" permanently?")) return;
      try{ await folder().delete(id); }catch(e){}
      workspace.delete(id);
      try{ logOp({ kind:"delete", action:"transcript", detail: rec.name, result: "deleted from kv + workspace", ref: rec.id }); }catch(e){}
      addBubble("ass", "🗑 Deleted transcript <b>" + safeEsc(rec.name) + "</b>.");
      return;
    }
  }catch(e){
    addBubble("ass", "⚠ " + safeEsc(e.message));
  }
}

function wireActs(scope){
  scope.querySelectorAll("[data-act]").forEach(btn => {
    btn.onclick = () => act(btn.dataset.id, btn.dataset.act);
  });
}

async function library(){
  let recs = [];
  try{ recs = await listRecs(); }
  catch(e){ addBubble("ass", "⚠ Transcript store unavailable: " + safeEsc(e.message)); return; }
  if(!recs.length){
    addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎧 /transcripts · client ' + safeEsc(clientName()) + '</div><div class="rrow"><b>ARCHIVE</b><span class="vd">EMPTY</span><div class="rd">no transcripts stored for this client yet</div></div><div class="rfoot">Start one: <b>/transcribe &lt;video url&gt;</b> — or drop a video/audio file on the chat. Up to an hour (and far beyond) in a single job.</div></div>');
    return;
  }
  const total = recs.reduce((n, r) => n + (r.duration || 0), 0);
  const rows = recs.slice(0, LIB_LIMIT).map(r =>
    '<div class="rrow"><b>' + safeEsc(r.name) + '</b><span class="vd">' + safeEsc(fmtDur(r.duration)) + '</span><div class="rd">'
    + (r.words || 0).toLocaleString() + ' words · ' + safeEsc(new Date(r.created).toLocaleString()) + ' · ' + safeEsc(r.source || "?")
    + ((r.parts && r.parts.length > 1) ? ' · ✂ ' + r.parts.length + ' parts' + (r.partial ? ' (PARTIAL — missing ' + (r.missing || []).join(",") + ')' : '') : '')
    + '<br><span class="tr-acts">'
    + '<button class="ci-act" data-act="read" data-id="' + safeEsc(r.id) + '">🧠 Read</button>'
    + ((r.parts && r.parts.length > 1) ? '<button class="ci-act" data-act="parts" data-id="' + safeEsc(r.id) + '">✂ Parts</button>' : '')
    + '<button class="ci-act" data-act="txt" data-id="' + safeEsc(r.id) + '">📄 .txt</button>'
    + '<button class="ci-act" data-act="srt" data-id="' + safeEsc(r.id) + '">🎬 .srt</button>'
    + '<button class="ci-act" data-act="chat" data-id="' + safeEsc(r.id) + '">◈ Show</button>'
    + '<button class="ci-act" data-act="del" data-id="' + safeEsc(r.id) + '">✗</button>'
    + '</span></div></div>'
  ).join("");
  const bubble = addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎧 /transcripts — the archive · client ' + safeEsc(clientName()) + '</div>'
    + '<div class="rrow"><b>STORED</b><span class="vd">' + recs.length + '</span><div class="rd">'
    + safeEsc(fmtDur(total)) + ' of recording · kept in this browser (kv · ' + KV_FOLDER + ')</div></div>'
    + rows
    + '<div class="rfoot">Raw ≠ soul: transcripts stay local to this machine (raw capture belongs in the run log, not in the network soul).</div></div>');
  wireActs(bubble);
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [/transcripts — " + recs.length + " stored]"); }catch(e){}
}

/* ------------------------------ the run flow ------------------------------- */

function normalizeUrl(raw){
  let u;
  try{ u = new URL(String(raw).trim()); }catch(e){ return { bad: true }; }
  if(!/^https?:$/.test(u.protocol)) return { bad: true };
  if(/(^|\.)drive\.google\.com$/i.test(u.hostname)){
    const m = /\/file\/d\/([^/]+)/.exec(u.pathname);
    const id = m ? m[1] : (u.searchParams.get("id") || "");
    if(id) return { url: "https://drive.google.com/uc?export=download&id=" + id, name: "google-drive-" + id.slice(0, 8), converted: true, direct: true };
  }
  const tail = u.pathname.split("/").filter(Boolean).pop() || u.hostname;
  if(PAGE_HOST.test(u.hostname) && !MEDIA_EXT.test(u.pathname))
    return { url: u.href, name: decodeURIComponent(tail).replace(/[-_]+/g, " ").slice(0, 60) || u.hostname, page: true, host: u.hostname };
  return { url: u.href, name: decodeURIComponent(tail).slice(0, 60) || u.hostname, direct: true };
}

function helpCard(){
  addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎬 /transcribe — the ear</div>'
    + '<div class="rrow"><b>USAGE</b><span class="vd">COMMAND</span><div class="rd">/transcribe &lt;media url&gt; · /transcribe (file picker) · drop or paste a file · /transcripts (archive)</div></div>'
    + '<div class="rrow"><b>LENGTH</b><span class="vd">ANY LENGTH</span><div class="rd">a small file goes to Deepgram whole (2 GB cap); a long one is <b>split</b> — the audio track is pulled out in the browser, dropped to 16 kHz mono, cut into parts at pauses, then stitched back into one timeline. A 3-hour lesson is a normal job.</div></div>'
    + '<div class="rrow"><b>SPLIT</b><span class="vd">AUTO</span><div class="rd">auto for any video, any file over 250 MB, any recording over 4 h · <b>--split=15</b> forces it with 15-minute parts · <b>--whole</b> sends the file in one piece</div></div>'
    + '<div class="rrow"><b>FLAGS</b><span class="vd">OPTIONAL</span><div class="rd">--lang=es · --multi (code-switching) · --detect · --no-diarize · --no-utterances · --model=nova-3 · --keyterm=Obi,Legion · --quick · --force · --split=20 · --whole</div></div>'
    + '<div class="rrow"><b>ENGINE</b><span class="vd">' + (key() ? "KEY OK" : "NO KEY") + '</span><div class="rd">' + (key() ? "Deepgram key present (localStorage obi_keys)" : "set it once with /dg recover (from the NET-PET-AI Cloudflare worker) or /dg token &lt;KEY&gt;") + '</div></div>'
    + '<div class="rrow"><b>ALIASES</b><span class="vd"></span><div class="rd">/tr · /video · /vid · /audio · /listen</div></div>'
    + '<div class="rfoot">Verbatim capture into the run log (RRL) — raw ≠ soul. Obi reading it is a derived layer, never a replacement.</div></div>');
}

function keyCard(){
  addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎬 /transcribe — key required</div>'
    + '<div class="rrow bad"><b>DEEPGRAM</b><span class="vd">NO KEY</span><div class="rd">nothing stored in this browser (localStorage "obi_keys" → deepgram)</div></div>'
    + '<div class="rrow"><b>FIX</b><span class="vd">TWO WAYS</span><div class="rd"><b>/dg recover</b> — pull the key from the NET-PET-AI worker on Cloudflare and verify it · or <b>/dg token &lt;YOUR_DEEPGRAM_KEY&gt;</b> (free tier at deepgram.com, ~$200 credit on signup)</div></div>'
    + '<div class="rrow"><b>WHY</b><span class="vd">LOCAL ONLY</span><div class="rd">the key never enters the public source, the HTML, or a URL — it rides this browser only</div></div>'
    + '<div class="rfoot">Then: /transcribe &lt;video url&gt;, or drop a video/audio file on the chat. An hour of recording is a single job.</div></div>');
}

function pageCard(info, runWith){
  const bubble = addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎬 ' + safeEsc(info.host) + ' — page, not a media file</div>'
    + '<div class="rrow"><b>WHY</b><span class="vd">NEEDS A FILE</span><div class="rd">Deepgram fetches the media itself, so it needs a direct audio/video URL — a watch page is HTML, there is nothing to listen to.</div></div>'
    + '<div class="rrow"><b>INSTEAD</b><span class="vd"></span><div class="rd">point at the direct file (…/video.mp4, .mp3, .m4a, .wav), or drop the downloaded file onto the chat — a local file of any length works</div></div>'
    + '<div class="rrow"><b>ACTIONS</b><span class="vd"></span><div class="rd tr-acts"><button class="ci-act" data-try>Try it anyway</button></div></div></div>');
  bubble.querySelector("[data-try]").onclick = () => { dropRow(bubble); runWith(true); };
}

function pickerCard(extra){
  addBubble("ass", "🎬 Drop a video or audio file on the chat, or the 🎬 button in the composer opens the file picker. Any length works — a 3-hour lesson is split into parts automatically (audio-only, cut at pauses) and stitched back into one timeline."
    + (extra ? " <b>" + extra + "</b>" : ""));
}

/* flags typed with no file attached arm the NEXT file (e.g. /transcribe --split=15) */
let nextOpts = null;

function notMediaCard(name){
  addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎬 Not a media file</div><div class="rrow bad"><b>' + safeEsc(name) + '</b><span class="vd">SKIPPED</span><div class="rd">the ear takes video/audio containers — mp4, mov, webm, mkv, mp3, m4a, wav, flac, ogg, opus…</div></div></div>');
}

function tooBigCard(file){
  addBubble("ass", '<div class="rise tr-card"><div class="rhead">🎬 Too large to send whole</div>'
    + '<div class="rrow bad"><b>' + safeEsc(file.name) + '</b><span class="vd">' + safeEsc(fmtBytes(file.size)) + '</span><div class="rd">Deepgram takes up to 2 GB in one request — and splitting is off (--whole, or the audio workbench did not load).</div></div>'
    + '<div class="rrow"><b>NEXT</b><span class="vd"></span><div class="rd">drop it again without <b>--whole</b> to auto-split · or send the audio track only (mp3/m4a is ~10x smaller than video and transcribes identically) · or host it and use /transcribe &lt;url&gt;</div></div></div>');
}

function probeDuration(file){
  return new Promise(resolve => {
    let url = null, done = false;
    const finish = d => { if(done) return; done = true; try{ if(url) URL.revokeObjectURL(url); }catch(e){} resolve(isFinite(d) ? d : null); };
    try{
      url = URL.createObjectURL(file);
      const el = document.createElement("video");
      el.preload = "metadata";
      el.onloadedmetadata = () => finish(el.duration);
      el.onerror = () => finish(null);
      el.src = url;
      setTimeout(() => finish(null), 6000);
    }catch(e){ finish(null); }
  });
}

function isVideo(file){
  const n = String(file.name || "");
  return /\.(mp4|m4v|mov|webm|mkv|avi|mpg|mpeg|ts|3gp|3g2)$/i.test(n) || /^video\//.test(file.type || "");
}
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function retryable(err){
  if(err && typeof err.retryable === "boolean") return err.retryable;
  const msg = String((err && err.message) || err || "");
  return !/(cancel|too large|timed out|out of credit|rejected the key)/i.test(msg);
}
/* 504 (its 10-minute processing ceiling) and 413 (the 2 GB cap) are the two ways
   Deepgram says "this is too big for one synchronous request" — the cue to split. */
function tooBigForOne(err){
  if(!err) return false;
  if(err.status === 504 || err.status === 413) return true;
  return /(504|413|timed out|too large)/i.test(String(err.message || ""));
}

/* ---- long recordings: extract the audio, split at pauses, send part by part ---- */

function splitMinutes(file, dur, opts){
  if(opts.whole) return 0;
  if(opts.splitMin) return opts.splitMin;
  if(isVideo(file)) return 20;                  // video: pull the audio out either way
  if(file.size > SPLIT_BYTES) return 20;        // too big to send in one piece
  if(dur && dur > SPLIT_SEC) return 20;         // long enough that 504 becomes real
  return 0;
}

/* A split job keeps its decoded audio alive so a failed part can be retried and
   a part-finished recording can still be saved. */
const activeJobs = new Map();

async function runFile(file, over){
  if(!file) return;
  const flags = Object.assign({}, nextOpts || {}, over || {});
  nextOpts = null;
  if(!key()){ keyCard(); return; }
  const name = file.name || "recording";
  const isMedia = MEDIA_EXT.test(name) || /^(video|audio)\//.test(file.type || "");
  if(!isMedia){ notMediaCard(name); return; }

  const dur = await probeDuration(file);
  const opts = Object.assign({ model:"nova-3", language:"en", diarize:true, utterances:true, paragraphs:true }, flags);
  const mins = window.ObiAudioSplit ? splitMinutes(file, dur, opts) : 0;
  if(mins) return runSplit(file, { name, dur, opts, chunkSec: mins * 60 });
  if(file.size > DG_MAX_BYTES){ tooBigCard(file); return; }
  return runFileWhole(file, { name, dur, opts });
}

async function runFileWhole(file, job0){
  const { name, dur, opts } = job0;
  if(file.size > DG_MAX_BYTES){ tooBigCard(file); return; }
  const job = jobCard({
    name, source: "LOCAL FILE",
    detail: fmtBytes(file.size) + (dur ? " · " + fmtDur(dur) : "") + (file.size > DG_WARN_BYTES ? " — big file, upload will take a while" : ""),
    engine: "pre-recorded · " + (opts.model || "nova-3") + (opts.diarize ? " · diarize" : "")
  });
  job.onCancel(() => { try{ job.xhr.abort(); }catch(e){} });
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [transcribing local file \"" + name + "\" · " + fmtBytes(file.size) + (dur ? " · " + fmtDur(dur) : "") + "]"); }catch(e){}

  try{
    const json = await dgRequest({
      file, opts, handle: job,
      onUpload: (p, l, t) => job.setPct(p, l, t),
      onUploaded: () => job.setStage("LISTENING", "upload complete — Deepgram is transcribing" + (dur ? " " + fmtDur(dur) + " of recording" : "") + "…")
    });
    await finishRes(json, { name, source: "LOCAL FILE", opts, ref: null }, job);
  }catch(e){
    job.stop();
    const split = (tooBigForOne(e) && window.ObiAudioSplit)
      ? { label: "✂ Split it into parts and retry", fn: () => { dropRow(job.bubble); runSplit(file, { name, dur, opts, chunkSec: SPLIT_CHUNK }); } }
      : null;
    failCard(job.bubble, e.message, "Nothing was logged. Try again, or /transcribe --force &lt;url&gt; for a remote copy.", split);
  }
}

async function runSplit(file, job0){
  const { name, dur, opts, chunkSec } = job0;
  const job = jobCard({
    name, source: "LOCAL FILE · split",
    detail: fmtBytes(file.size) + (dur ? " · " + fmtDur(dur) : "") + " → 16 kHz mono, cut at pauses",
    engine: "pre-recorded · " + (opts.model || "nova-3") + (opts.diarize ? " · diarize" : "") + " · part-by-part",
    parts: 2
  });
  const signal = { cancelled: false };
  job.onCancel(() => { signal.cancelled = true; try{ if(job.xhr) job.xhr.abort(); }catch(e){} });
  job.setPct(0);
  job.setStage("PREPARING", "extracting the audio track…");
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [transcribing local file \"" + name + "\" · " + fmtBytes(file.size) + (dur ? " · " + fmtDur(dur) : "") + " · split mode]"); }catch(e){}

  let plan;
  try{
    plan = await window.ObiAudioSplit.prepare(file, {
      chunkSec, durationHint: dur, signal, snap: !opts.noSnap,
      onStage: (st, note) => job.setPrepStage(st, note),
      onProgress: p => job.setPrep(p)
    });
  }catch(e){
    job.stop();
    if(signal.cancelled){ failCard(job.bubble, "cancelled", "Nothing was logged."); return; }
    if(file.size <= DG_MAX_BYTES){
      addBubble("ass", "🎬 Couldn't extract the audio (" + safeEsc(clip(e.message, 160)) + ") — sending the whole file to Deepgram instead.");
      return runFileWhole(file, { name, dur, opts });
    }
    failCard(job.bubble, e.message, "The file is over Deepgram's 2 GB cap and the audio couldn't be pulled out here. Export the audio track (mp3/m4a — an hour is ~30–60 MB) and drop that in.");
    return;
  }
  if(signal.cancelled){ job.stop(); failCard(job.bubble, "cancelled", "Nothing was logged."); return; }

  const states = plan.parts.map((p, i) => ({
    state: "pending", words: 0, duration: p.end - p.start,
    label: "part " + (i + 1) + " · " + fmtDur(p.start) + "–" + fmtDur(p.end)
  }));
  job.setParts(states);
  const ctx = {
    id: "job-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
    file, plan, states, recs: plan.parts.map(() => null), job, signal, opts,
    meta: { name, source: "LOCAL FILE · split" },
    split: { container: plan.container, mode: plan.mode, sourceRate: plan.sourceRate, channels: plan.channels, chunkSec: plan.chunkSec, snapped: plan.snapped, partTotal: plan.parts.length }
  };
  activeJobs.set(ctx.id, ctx);
  try{ await runParts(ctx, 0); }
  catch(e){ job.stop(); failCard(job.bubble, e.message, "Nothing was logged."); }
  pruneJobs();
}

/* Decoded audio is the only big thing here (an hour is ~115 MB). Keep at most two
   jobs' worth. A job that is waiting on the user (a failed part, resumable) is
   HELD: its audio is only released after 15 minutes, and when it is released the
   retry buttons are replaced so a stale click can never fail confusingly. */
const JOB_KEEP = 2, JOB_HOLD_MS = 15 * 60 * 1000;
function releaseJob(ctx){
  try{ if(ctx.plan) ctx.plan.store = null; }catch(e){}
  ctx.released = true;
  try{
    const acts = ctx.job && ctx.job.bubble && ctx.job.bubble.querySelector("[data-acts]");
    if(acts) acts.innerHTML = '<span class="hint">the decoded audio was released to free memory — drop the file again to run this job from the start</span>';
  }catch(e){}
}
function pruneJobs(){
  while(activeJobs.size > JOB_KEEP){
    let victim = null;
    for(const [k, v] of activeJobs){ if(!v.hold){ victim = k; break; } }
    if(!victim){
      for(const [k, v] of activeJobs){ if(v.hold && Date.now() - (v.holdAt || 0) > JOB_HOLD_MS){ victim = k; break; } }
    }
    if(!victim) return;                       // every job is resumable and fresh — keep the audio
    const old = activeJobs.get(victim);
    if(old && old.hold) releaseJob(old);
    activeJobs.delete(victim);
  }
}

function partMeta(ctx, i){
  const N = ctx.plan.parts.length, p = ctx.plan.parts[i];
  return {
    name: ctx.meta.name + (N > 1 ? " — part " + (i + 1) : ""),
    source: N > 1 ? "LOCAL FILE · part " + (i + 1) + "/" + N : "LOCAL FILE",
    opts: ctx.opts, ref: null, partIndex: i, partStart: p.start, partEnd: p.end
  };
}

/* ============================================================================
   CRASH-SAFE CHECKPOINTS — a phone can kill this tab mid-recording.

   Every part that comes back from Deepgram is written to kv as it lands, so a
   freeze, a discard or a kill cannot take the work with it: on the next load the
   station finds the unfinished job and offers to save what arrived. What is NOT
   checkpointed is the audio (it is gigabytes, and it is not ours to keep) — so
   CONTINUING a job still needs the file dropped again. What was already
   transcribed never does.
   ========================================================================== */
const CKPT_FOLDER = "bgjobs";
let ckptCache = [];
function jobFolder(){ try{ return root.kv[CKPT_FOLDER]; }catch(e){ return null; } }
async function checkpoint(ctx){
  if(!ctx || !ctx.id || !ctx.plan) return;
  const f = jobFolder(); if(!f) return;
  const label = (ctx.meta && ctx.meta.name) || ctx.name || "recording";
  try{
    await f.set(ctx.id, {
      id: ctx.id, name: label, updated: Date.now(), started: Date.now(),
      total: ctx.plan.parts.length, done: ctx.recs.filter(Boolean).length,
      plan: { duration: ctx.plan.duration || 0, parts: ctx.plan.parts.map(p => ({ start: p.start, end: p.end })) },
      opts: { lang:(ctx.opts||{}).lang || null, model:(ctx.opts||{}).model || null, diarize:(ctx.opts||{}).diarize !== false },
      split: ctx.split || null,
      recs: ctx.recs.map(r => r || null)          /* full part records — mergeParts needs them intact */
    });
    ckptCache = ckptCache.filter(j => j.id !== ctx.id).concat([{ id: ctx.id, name: label, done: ctx.recs.filter(Boolean).length, total: ctx.plan.parts.length, updated: Date.now() }]);
  }catch(e){}
}
async function ckptClear(id){
  try{ const f = jobFolder(); if(f) await f.delete(id); }catch(e){}
  ckptCache = ckptCache.filter(j => j.id !== id);
}
async function ckptAll(){
  try{
    const f = jobFolder(); if(!f) return [];
    const keys = await f.keys(); const out = [];
    for(const k of keys || []){ const j = await f.get(k); if(j) out.push(j); }
    ckptCache = out.map(j => ({ id:j.id, name:j.name, done:(j.recs||[]).filter(Boolean).length, total:j.total || (j.recs||[]).length, updated:j.updated }));
    return out.sort((a, b) => (b.updated || 0) - (a.updated || 0));
  }catch(e){ return []; }
}
/* rebuild the transcript from the parts that arrived, using the SAME merge the
   live path uses — then file it, marked partial and naming what is missing. */
async function recoverJob(id){
  const f = jobFolder(); if(!f) return null;
  const j = await f.get(id); if(!j) return null;
  const recs = (j.recs || []).map(r => r || null);
  if(!recs.some(Boolean)){ await ckptClear(id); return null; }
  let plan = { duration: (j.plan && j.plan.duration) || 0, parts: ((j.plan && j.plan.parts) || []).map(p => ({ start:p.start, end:p.end })) };
  if(!plan.parts.length) plan.parts = [{ start:0, end: plan.duration }];
  /* mergeParts reads `ctx.meta` (name + source) and `ctx.opts.language`, but the
     checkpoint stores a flat label and `lang`. Rebuilding both is what makes this
     path work at all — without it the merge threw
     "Cannot read properties of undefined (reading 'name')" and the parts that had
     already arrived could never be saved. */
  const opts = Object.assign({}, j.opts || {});
  if(opts.lang && !opts.language) opts.language = opts.lang;
  const src = "RECOVERED — the tab was closed or killed mid-job; these are the parts that had already been transcribed";
  const rec = mergeParts({ id:j.id, plan:plan, opts:opts, states:[], split:j.split || null,
    meta:{ name: j.name || "recording", source: src }, recs:recs });
  rec.partial = true;
  rec.missing = recs.map((r, i) => r ? null : i + 1).filter(v => v !== null);
  rec.name = String(j.name || "recording") + " (recovered)";
  rec.source = src;
  await publish(rec);
  await ckptClear(id);
  return rec;
}
async function recoverCard(){
  try{
    const jobs = (await ckptAll()).filter(j => (j.recs || []).some(Boolean));
    if(!jobs.length) return;
    for(const j of jobs.slice(0, 3)){
      const done = (j.recs || []).filter(Boolean).length, total = j.total || (j.recs || []).length;
      const bubble = addBubble("ass", "");
      bubble.innerHTML = '<div class="rise tr-card"><div class="rhead">🛟 Unfinished recording — recovered</div>'
        + '<div class="rrow"><b>' + safeEsc(j.name) + '</b><span class="vd">' + done + "/" + total + '</span><div class="rd">'
        + 'the tab was closed, killed or suspended while this was being transcribed' + (j.updated ? ' (last update ' + new Date(j.updated).toLocaleString() + ')' : '') + '. The parts that had already come back are stored here — <b>the audio is not</b>, so continuing needs the file dropped again.</div></div>'
        + '<div class="rrow"><b>ACTIONS</b><span class="vd"></span><div class="rd tr-acts">'
        + '<button class="ci-act" data-ract="save">💾 Save the ' + done + ' part' + (done === 1 ? "" : "s") + ' that arrived</button>'
        + '<button class="ci-act" data-ract="drop">🗑 Discard</button></div></div>'
        + '<div class="rfoot">Recovered from the checkpoint in this browser (kv <b>' + CKPT_FOLDER + '</b>) — this is what makes a phone killing the tab survivable.</div></div>';
      const sv = bubble.querySelector("[data-ract='save']"), dr = bubble.querySelector("[data-ract='drop']");
      if(sv) sv.onclick = async () => {
        sv.textContent = "saving…";
        try{
          const rec = await recoverJob(j.id);
          if(rec){ bubble.innerHTML = resultCardHTML(rec); wireActs(bubble); }
          else bubble.innerHTML = '<div class="rise"><div class="rhead">🛟 Nothing left to save</div></div>';
        }catch(e){ sv.textContent = "⚠ " + e.message; }
      };
      if(dr) dr.onclick = async () => {
        await ckptClear(j.id);
        bubble.innerHTML = '<div class="rise"><div class="rhead">🗑 Recovery discarded</div><div class="rrow"><b>' + safeEsc(j.name) + '</b><span class="vd"></span><div class="rd">the checkpoint is gone; nothing else changed.</div></div></div>';
      };
    }
    try{ logOp({ kind:"op", action:"transcribe recover", ok:true, detail: jobs.length + " unfinished job(s) found on load", result: "offered — save or discard" }); }catch(e){}
  }catch(e){}
}

async function runParts(ctx, from){
  const job = ctx.job, N = ctx.plan.parts.length;
  if(ctx.running){ return; }              // one pass at a time (a double-clicked retry must not double-send)
  ctx.running = true;
  try{ job.resumeClock && job.resumeClock(); }catch(e){}
  try{
    await runPartsInner(ctx, from);
  }catch(e){
    job.stop();
    failCard(job.bubble, e.message, "Nothing was logged.");
  }finally{
    ctx.running = false;
  }
}

async function runPartsInner(ctx, from){
  const job = ctx.job, N = ctx.plan.parts.length;
  try{ if(from === 0) await checkpoint(ctx); }catch(e){}
  for(let i = from; i < N; i++){
    if(ctx.signal.cancelled) return partStop(ctx, "cancelled", "You cancelled it.");
    let blob;
    try{ blob = window.ObiAudioSplit.partBlob(ctx.plan, i); }
    catch(e){ ctx.states[i].state = "failed"; job.setParts(ctx.states); return partStop(ctx, "failed", ctx.released ? "the decoded audio was released to free memory" : e.message); }
    ctx.states[i].state = "running";
    job.setParts(ctx.states);
    const durTxt = fmtDur(ctx.states[i].duration);
    job.setStage("PART " + (i + 1) + "/" + N, "uploading " + fmtBytes(blob.size) + " (" + durTxt + " of audio)…");
    let lastErr = null, ok = false;
    for(let attempt = 0; attempt <= PART_RETRIES && !ok; attempt++){
      if(ctx.signal.cancelled) return partStop(ctx, "cancelled", "You cancelled it.");
      if(attempt){ job.setStage("PART " + (i + 1) + "/" + N, "retry " + attempt + "/" + PART_RETRIES + " — " + clip(lastErr, 80)); await sleep(1500 * attempt); }
      try{
        const json = await dgRequest({
          file: blob, opts: ctx.opts, handle: job,
          onUpload: (p, l, t) => job.setPct(p, l, t),
          onUploaded: () => job.setStage("PART " + (i + 1) + "/" + N, "Deepgram is transcribing " + durTxt + " of audio…")
        });
        const rec = toRec(json, partMeta(ctx, i));
        ctx.recs[i] = rec;
        ctx.states[i].state = "done";
        ctx.states[i].words = rec.words;
        job.setParts(ctx.states);
        job.setPct(0);
        ok = true;
        try{ await checkpoint(ctx); }catch(e){}   /* durable the moment a part lands */
      }catch(e){
        if(ctx.signal.cancelled) return partStop(ctx, "cancelled", "You cancelled it.");
        lastErr = e.message;
        if(!retryable(e)) break;
      }
    }
    if(!ok){
      ctx.states[i].state = "failed";
      job.setParts(ctx.states);
      return partStop(ctx, "failed", lastErr);
    }
  }
  return finishSplit(ctx, {});
}

function partStop(ctx, why, msg){
  const job = ctx.job;
  job.stop();
  ctx.hold = true; ctx.holdAt = Date.now();    // resumable job: keep its decoded audio
  const okIdx = ctx.recs.map((r, i) => r ? i : -1).filter(i => i >= 0);
  const N = ctx.plan.parts.length;
  const missing = ctx.recs.map((r, i) => r ? -1 : i).filter(i => i >= 0);
  const tooLong = /504|413|timed out|too large/i.test(String(msg || ""));
  const shrinkSec = Math.max(60, Math.round((ctx.plan.chunkSec || 1200) / 2));
  const canShrink = !ctx.released && tooLong && (ctx.plan.chunkSec || 0) > 150 && !!window.ObiAudioSplit;
  if(!okIdx.length){
    failCard(job.bubble, msg || why, ctx.released
      ? "Nothing was logged. The decoded audio has since been released to free memory — drop the file again to retry."
      : "Nothing was logged — no part completed. Nothing is lost: the decoded audio is still held for a retry.",
      ctx.released ? null : { label: "↻ Retry from the start", fn: () => { runParts(ctx, 0); } });
    return;
  }
  const firstMissing = missing[0];
  const bubble = job.bubble;
  const doneWords = ctx.recs.reduce((n, r) => n + (r ? r.words : 0), 0);
  bubble.innerHTML = '<div class="rise tr-card"><div class="rhead">🎬 Part ' + (firstMissing + 1) + ' of ' + N + ' failed</div>'
    + '<div class="rrow bad"><b>' + (why === "cancelled" ? "CANCELLED" : "STOPPED") + '</b><span class="vd">' + okIdx.length + "/" + N + '</span><div class="rd">'
    + safeEsc(clip(msg || "", 200)) + '</div></div>'
    + '<div class="rrow"><b>STATUS</b><span class="vd" data-stage>' + (why === "cancelled" ? "CANCELLED" : "PART " + (firstMissing + 1) + "/" + N) + '</span><div class="rd" data-note>waiting for you</div></div>'
    + '<div class="rrow"><b>PARTS</b><span class="vd" data-partsdone>' + okIdx.length + "/" + N + '</span><div class="rd" data-parts></div></div>'
    + '<div class="rrow"><b>ALREADY CAPTURED</b><span class="vd">' + okIdx.length + '</span><div class="rd">'
    + okIdx.map(i => "part " + (i + 1) + " · " + ctx.states[i].words.toLocaleString() + " words").join(" · ")
    + ' — ' + doneWords.toLocaleString() + ' words total, still held in memory</div></div>'
    + '<div class="rrow"><b>ACTIONS</b><span class="vd"></span><div class="rd tr-acts" data-acts>'
    + '<button class="ci-act" data-act="resume">↻ Retry part ' + (firstMissing + 1) + '</button>'
    + (canShrink ? '<button class="ci-act" data-act="shrink">✂ Retry with ' + (Math.round(shrinkSec / 6) / 10) + '-min parts</button>' : '')
    + '<button class="ci-act" data-act="keep">💾 Save the ' + okIdx.length + ' part' + (okIdx.length === 1 ? "" : "s") + ' that worked</button>'
    + '</div></div>'
    + '<div class="rfoot">Raw is raw: nothing was written to the run log yet. Retrying re-sends only the missing parts.</div></div>';
  job.setParts(ctx.states);
  const b = bubble.querySelector("[data-act='resume']");
  if(b) b.onclick = () => {
    if(ctx.released){ bubble.querySelector("[data-acts]").innerHTML = '<span class="hint">the decoded audio was released to free memory — drop the file again</span>'; return; }
    const acts = bubble.querySelector("[data-acts]");
    if(acts) acts.innerHTML = '<span class="hint">↻ resuming — only the missing parts are re-sent…</span>';
    runParts(ctx, firstMissing);
  };
  const sh = bubble.querySelector("[data-act='shrink']");
  if(sh) sh.onclick = () => {
    const acts = bubble.querySelector("[data-acts]");
    if(ctx.released){ if(acts) acts.innerHTML = '<span class="hint">the decoded audio was released to free memory — drop the file again</span>'; return; }
    replan(ctx, Math.max(60, Math.round(ctx.plan.chunkSec / 2)));
    if(acts) acts.innerHTML = '<span class="hint">✂ re-cut into ' + ctx.plan.parts.length + ' parts, running from the start…</span>';
    runParts(ctx, 0);
  };
  const k = bubble.querySelector("[data-act='keep']");
  if(k) k.onclick = () => finishSplit(ctx, { partial: true });
}

/* A part that Deepgram could not process (its 10-minute synchronous ceiling) is
   usually just too long: re-cut the SAME decoded audio into smaller parts at the
   pauses and run it again. Only the cuts change — no re-decode, no re-download. */
function replan(ctx, chunkSec){
  const st = ctx.plan.store;
  const parts = window.ObiAudioSplit.planParts(st, { chunkSec, snap: ctx.plan.snapped });
  ctx.plan = Object.assign({}, ctx.plan, { parts, chunkSec });
  ctx.states = parts.map((p, i) => ({
    state: "pending", words: 0, duration: p.end - p.start,
    label: "part " + (i + 1) + " · " + fmtDur(p.start) + "–" + fmtDur(p.end)
  }));
  ctx.recs = parts.map(() => null);
  ctx.split = Object.assign({}, ctx.split, { chunkSec, partTotal: parts.length });
  ctx.hold = false; ctx.holdAt = 0;
  ctx.job.setParts(ctx.states);
  return parts;
}

function mergeParts(ctx){
  const N = ctx.plan.parts.length;
  const utterances = [], parts = [], speakers = new Set();
  let words = 0, chars = 0, model = "", language = "", requestId = "";
  const lines = [];
  for(let i = 0; i < N; i++){
    const r = ctx.recs[i];
    if(!r){ lines.push("[PART " + (i + 1) + "/" + N + " · MISSING — this part was never transcribed]"); continue; }
    const off = ctx.plan.parts[i].start, end = ctx.plan.parts[i].end;
    for(const u of r.utterances) utterances.push({ start: u.start + off, end: u.end + off, speaker: u.speaker, text: u.text, part: i + 1 });
    for(const s of r.speakers) speakers.add(s);
    words += r.words; chars += r.chars;
    if(!model) model = r.model;
    if(!language) language = r.language;
    if(!requestId) requestId = r.request_id;
    if(N === 1){
      /* the whole recording came out as one piece of extracted audio — present
         it as a normal transcript, not as a split one */
      lines.push(String(r.readable || r.text || ""));
      parts.push({ index: 1, start: 0, end, duration: end, words: r.words, chars: r.chars,
        text: r.text, readable: r.readable, model: r.model, language: r.language, request_id: r.request_id });
      continue;
    }
    const head = "[PART " + (i + 1) + "/" + N + " · " + fmtDur(off) + "–" + fmtDur(end) + " · " + r.words.toLocaleString() + " words"
      + (r.diarized ? " · speaker numbers are part-local" : "") + "]";
    const body = r.utterances.length
      ? r.utterances.map(u => "[" + fmtDur(u.start + off) + "]" + (u.speaker == null ? "" : " Speaker " + (u.speaker + 1) + ":") + " " + u.text).join("\n")
      : String(r.readable || r.text || "");
    lines.push(head + "\n" + body);
    parts.push({
      index: i + 1, start: off, end, duration: end - off, words: r.words, chars: r.chars,
      text: r.text, readable: r.readable, model: r.model, language: r.language, request_id: r.request_id
    });
  }
  const readable = lines.join("\n\n");
  const duration = ctx.plan.duration;
  const covered = parts.reduce((n, p) => n + (p.duration || 0), 0) || duration;
  const wpm = (covered && words) ? Math.round((words / covered) * 60) : 0;
  let pauses = 0, longestPause = 0;
  for(let i = 1; i < utterances.length; i++){
    const gap = utterances[i].start - utterances[i - 1].end;
    if(gap > 3){ pauses++; if(gap > longestPause) longestPause = gap; }
  }
  return {
    id: newId(),
    name: ctx.meta.name,
    source: ctx.meta.source,
    url: null,
    created: Date.now(),
    duration, language: language || (ctx.opts.language || "en"), model: model || ctx.opts.model || "nova-3",
    words, chars: readable.length, speakers: Array.from(speakers).sort((a, b) => a - b),
    diarized: !!ctx.opts.diarize, wpm, pauses, longestPause, covered,
    utterances, paragraphs: "",
    text: parts.map(p => p.text).join("\n\n"),
    readable, request_id: requestId,
    parts,
    split: ctx.split,
    partial: false, missing: []
  };
}

async function finishSplit(ctx, o){
  const job = ctx.job;
  job.stop();
  if(!ctx.recs.some(r => r)){
    failCard(job.bubble, "nothing transcribed", "No part completed, so there is nothing to save.");
    return;
  }
  const rec = mergeParts(ctx);
  if(ctx.plan.parts.length === 1) rec.source = "LOCAL FILE · audio extracted";
  if(o && o.partial){
    rec.partial = true;
    rec.missing = ctx.recs.map((r, i) => r ? null : i + 1).filter(v => v !== null);
    rec.name = rec.name + " (partial)";
  }
  await publish(rec);
  try{ await ckptClear(ctx.id); }catch(e){}
  job.bubble.innerHTML = resultCardHTML(rec);
  wireActs(job.bubble);
  try{ activeJobs.delete(ctx.id); }catch(e){}
  try{ if(ctx.plan) ctx.plan.store = null; }catch(e){}      // release the decoded audio
  if(ctx.opts && ctx.opts.quick) act(rec.id, "fast");
}

async function publish(rec){
  if(window.ObiReview) window.ObiReview.stamp(rec);
  wsSet(rec.id, rec);
  await saveRec(rec);
  rrlCapture(rec);
  try{ logOp({ kind:"capture", action:"transcribe", detail: rec.name, result: (rec.words || 0).toLocaleString() + " words · " + (rec.chars || 0).toLocaleString() + " chars" + (rec.partial ? " · PARTIAL (" + (rec.missing || []).length + " missing)" : "") + " · " + (rec.duration ? fmtDur(rec.duration) : "?"), ref: rec.id }); }catch(e){}
  try{ if(window.ObiReview) window.ObiReview.file({ id: rec.id, kind: "transcript", title: rec.name }); }catch(e){}
  try{ messages.push("Obi: [transcribed " + rec.name + " — " + rec.words.toLocaleString() + " words]"); }catch(e){}
  try{ speak(rec.duration ? ("Transcribed. " + fmtDur(rec.duration) + ", " + rec.words.toLocaleString() + " words.") : "Transcription complete."); }catch(e){}
  return rec;
}

/* A remote media URL that Deepgram can't take whole (too big / took too long):
   pull it into this browser and split it locally, if the host allows the fetch. */
async function fetchToFile(url, onProgress, ctl){
  const res = await fetch(url, { mode: "cors", credentials: "omit", signal: (ctl && ctl.ctrl) ? ctl.ctrl.signal : undefined });
  if(!res.ok) throw new Error("HTTP " + res.status + " from the host");
  const total = Number(res.headers.get("content-length")) || 0;
  if(total > 4 * 1024 * 1024 * 1024) throw new Error("the file is " + fmtBytes(total) + " — too large to process in the browser");
  let blob;
  if(res.body && res.body.getReader){
    const reader = res.body.getReader();
    const parts = [];
    let got = 0;
    for(;;){
      if(ctl && ctl.cancelled) throw new Error("cancelled");
      const r = await reader.read();
      if(r.done) break;
      parts.push(r.value); got += r.value.length;
      onProgress(total ? got / total : 0, got, total);
    }
    blob = new Blob(parts);
  } else {
    blob = await res.blob();
    onProgress(1, blob.size, blob.size);
  }
  const tail = String(url).split("?")[0].split("/").filter(Boolean).pop() || "recording";
  const name = decodeURIComponent(tail).slice(0, 60) || "recording";
  return new File([blob], name, { type: blob.type || mimeFor(name) });
}

async function runUrlSplit(url, opts, dur){
  const bubble = addBubble("ass", "");
  bubble.innerHTML = '<div class="rise tr-card"><div class="rhead">🎬 Downloading to split — ' + safeEsc(clip(url, 70)) + '</div>'
    + '<div class="rrow"><b>WHY</b><span class="vd">LOCAL</span><div class="rd">the media is being pulled into this browser so the audio can be extracted and sent in parts</div></div>'
    + '<div class="rrow"><b>STATUS</b><span class="vd" data-stage>FETCHING</span><div class="rd"><div class="tr-bar indet" data-bar><i></i></div></div></div>'
    + '<div class="rrow"><b>PROGRESS</b><span class="vd" data-pct>0%</span><div class="rd" data-note>starting…</div></div>'
    + '<div class="rrow"><b>ACTIONS</b><span class="vd"></span><div class="rd tr-acts"><button class="ci-act" data-cancel>✗ Cancel</button></div></div>'
    + '<div class="rfoot">If the host blocks this (no CORS header), download the file yourself and drop it on the chat — same result.</div></div>';
  const q = s => bubble.querySelector(s);
  const ctl = { cancelled: false, ctrl: (typeof AbortController !== "undefined") ? new AbortController() : null };
  try{ q("[data-cancel]").onclick = () => { ctl.cancelled = true; try{ if(ctl.ctrl) ctl.ctrl.abort(); }catch(e){} }; }catch(e){}
  try{
    const file = await fetchToFile(url, (p, got, total) => {
      const bar = q("[data-bar]"), fill = q("[data-bar] i");
      if(bar && fill){ bar.classList.remove("indet"); fill.style.width = Math.round(p * 100) + "%"; }
      const pc = q("[data-pct]"); if(pc) pc.textContent = Math.round(p * 100) + "%";
      const n = q("[data-note]"); if(n) n.textContent = fmtBytes(got) + (total ? " / " + fmtBytes(total) : "");
    }, ctl);
    if(ctl.cancelled){ dropRow(bubble); return; }
    q("[data-stage]").textContent = "DOWNLOADED";
    q("[data-note]").textContent = fmtBytes(file.size) + " — extracting the audio…";
    /* every flag the run was given (--lang, --no-diarize, --keyterm, --model…) has to
       survive the detour through the browser, not just the split length */
    await runFile(file, Object.assign({}, opts, { splitMin: opts.splitMin || 20, whole: false }));
  }catch(e){
    if(ctl.cancelled){ dropRow(bubble); return; }
    failCard(bubble, "could not fetch the media: " + e.message,
      "That host does not allow other sites to download it (no CORS header). Download the file yourself (or record the audio) and drop it on the chat — a local file is split into parts the same way.");
  }
}

async function runUrl(raw, opts){
  const parsed = parseArgs(raw);
  const url = parsed.url;
  const o = opts || parsed.opts;
  if(!url){ if(!key()) keyCard(); else pickerCard(); return; }
  if(!key()){ keyCard(); return; }

  const info = normalizeUrl(url);
  if(info.bad){ addBubble("ass", "⚠ That doesn't look like a full URL — include <b>https://</b>. Or just drop the file on the chat."); return; }
  if(info.page && !o.force){ pageCard(info, force => { if(force){ o.force = true; runUrl(raw, o); } }); return; }
  if(info.converted) addBubble("ass", "🎬 Google Drive link → direct download form. " + (key() ? "Handing it to Deepgram…" : ""));

  const job = jobCard({
    name: info.name, source: "REMOTE URL",
    detail: clip(info.url, 100),
    engine: "pre-recorded · " + o.model + (o.detect ? " · detect-language" : " · lang " + o.language) + (o.diarize ? " · diarize" : "")
  });
  job.onCancel(() => { try{ job.xhr.abort(); }catch(e){} });
  job.setPct(0);
  job.setStage("FETCHING", "Deepgram is pulling the media…");
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [transcribing url " + info.url + "]"); }catch(e){}

  try{
    const json = await dgRequest({ url: info.url, opts: o, handle: job, onUploaded: () => job.setStage("LISTENING", "transcribing…") });
    await finishRes(json, { name: info.name, source: "REMOTE URL", opts: o, ref: info.url }, job);
  }catch(e){
    job.stop();
    const split = (tooBigForOne(e) && window.ObiAudioSplit)
      ? { label: "✂ Download it here and split it", fn: () => runUrlSplit(info.url, o) }
      : null;
    failCard(job.bubble, e.message, "If the host blocks direct downloads, drop the downloaded file here instead — local files of any length work.", split);
  }
}

async function finishRes(json, meta, job){
  job.stop();
  const rec = toRec(json, meta);
  await publish(rec);
  job.bubble.innerHTML = resultCardHTML(rec);
  wireActs(job.bubble);
  if(meta.opts && meta.opts.quick) act(rec.id, "fast");
}

async function run(raw){
  const s = String(raw || "").trim();
  if(/^(help|\?|--help)$/i.test(s)){ helpCard(); return; }
  const parsed = parseArgs(s);
  const url = parsed.url;
  if(!url){
    if(!key()){ keyCard(); return; }
    const flags = parsed.opts || {};
    if((flags.set || []).length) nextOpts = flags;
    return pickerCard((flags.set || []).length ? "flags armed for the next file: --" + flags.set.join(" --") : "");
  }
  if(/^https?:\/\//i.test(url)) return runUrl(s);
  if(/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(url)) return runUrl(s.replace(url, "https://" + url));
  addBubble("ass", "⚠ <b>/transcribe</b> takes a media URL (https://…), or nothing at all to open the file picker. <b>/transcribe help</b> for flags.");
}

/* ------------------------------ UI wiring ---------------------------------- */

function firstMedia(list){
  if(!list || !list.length) return null;
  for(const f of list){
    if(MEDIA_EXT.test(f.name || "") || /^(video|audio)\//.test(f.type || "")) return f;
  }
  return null;
}
function hasFiles(e){
  const dt = e.dataTransfer;
  if(!dt) return false;
  if(dt.files && dt.files.length) return true;
  return Array.prototype.indexOf.call(dt.types || [], "Files") !== -1;
}

function wire(){
  try{
    const btn = document.getElementById("mediaBtn");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*,audio/*,.mp4,.m4v,.mov,.webm,.mkv,.mp3,.m4a,.wav,.flac,.ogg,.opus,.aac";
    input.style.display = "none";
    document.body.appendChild(input);
    input.onchange = () => { const f = input.files && input.files[0]; input.value = ""; if(f) window.ObiTranscribe.runFile(f); };
    if(btn) btn.onclick = () => { if(!key()){ keyCard(); return; } input.click(); };

    const app = document.getElementById("app") || document.body;
    let depth = 0;
    app.addEventListener("dragover", e => {
      if(!hasFiles(e)) return;
      e.preventDefault(); depth++; app.classList.add("dragging");
      /* the drop zone and the transcript card live in the command station — if the
         sovereign is on the 👤 Student Evaluator tab, a drop brings the station up. */
      if(window.Obi && window.Obi.view && window.Obi.view.current() !== "cmd") window.Obi.view.show("cmd");
    });
    app.addEventListener("dragleave", () => { depth = Math.max(0, depth - 1); if(!depth) app.classList.remove("dragging"); });
    app.addEventListener("drop", e => {
      if(!hasFiles(e)) return;
      e.preventDefault(); depth = 0; app.classList.remove("dragging");
      const f = firstMedia(e.dataTransfer.files);
      if(f) window.ObiTranscribe.runFile(f);
      else addBubble("ass", "⚠ That drop wasn't a video or audio file — the ear takes mp4/mov/webm/mkv/mp3/m4a/wav/flac/ogg/opus.");
    });
    ["dragover", "drop"].forEach(ev => window.addEventListener(ev, e => { if(hasFiles(e)) e.preventDefault(); }, false));

    const inp = document.getElementById("inputEl");
    if(inp) inp.addEventListener("paste", e => {
      const f = firstMedia(e.clipboardData && e.clipboardData.files);
      if(f){ e.preventDefault(); window.ObiTranscribe.runFile(f); }
    });
  }catch(e){}
}
function wireWhenReady(){
  if(document.getElementById("mediaBtn")) wire();
  else setTimeout(wireWhenReady, 200);
  setTimeout(() => { try{ recoverCard(); }catch(e){} }, 1500);
}
wireWhenReady();

/* a long job HOLDS the keep-alive (ObiBg) for as long as it runs, so switching to
   another app mid-recording does not throttle the ear. Refcounted, so nesting is safe
   and the lock/wake-lock are released exactly when the last job finishes. */
function guarded(label, fn){
  return function(){
    const B = window.ObiBg;
    try{ B && B.hold(label); }catch(e){}
    const done = () => { try{ B && B.release(); }catch(e){} };
    let p;
    try{ p = fn.apply(this, arguments); }catch(e){ done(); throw e; }
    if(p && typeof p.then === "function") return p.then(v => { done(); return v; }, e => { done(); throw e; });
    done(); return p;
  };
}

window.ObiTranscribe = {
  run: guarded("ear", run), runUrl: guarded("ear:url", runUrl), runUrlSplit: guarded("ear:url-split", runUrlSplit),
  runFile: guarded("ear:file", runFile), runSplit: guarded("ear:split", runSplit),
  library, act, help: helpCard,
  list: listRecs, get: getRec, pending: () => ckptCache, recover: recoverJob, recoverCard,
  download, toSRT, toVTT, toJSON, read: guarded("ear:read", readTranscript),
  /* exposed for debugging + the stress harness */
  parseArgs, splitMinutes, retryable, probeDuration, normalizeUrl, mergeHelpers: { toRec, partLine },
  wsSet, wsSize: () => workspace.size, wsHas: id => workspace.has(id)
};
})();
