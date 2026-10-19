/* ============================================================================
   THE DROP — THE DESK (src/offer-desk/src/desk.js)

   This is the page a person opens from one link, after saying yes to the free
   website offer. It is the client's half of the drop station: they drop, the
   desk reads, and one file goes back.

   WHAT IT DOES, IN ORDER

     0  the offer, and WHAT THEY DO — routed to a trade (src/trades.js). The
        trade decides everything after this: the shots, the questions, the parts
        their page will need, and the channels a stranger will find them by.
     1  shoot this — six specific frames, with the reason each one exists.
     2  drop it — video, pictures, voice. Read from their own disk by their own
        browser. Nothing is uploaded, ever, at any point, by anything.
     3  the read — stills, a timecoded contact sheet, THE PULSE (where the life
        in the footage actually is, measured), and a rendered vertical reel with
        their own words on it. All of it on their device.
     4  send it back — one bundle (a real ZIP, written here) plus the short
        message, sent however they already send things.

   THE THREE LAWS (README.md carries them in full)

     1. NOTHING IS UPLOADED. Not the footage, not the answers, not the reel.
        The only thing that leaves is the bundle, when the owner sends it.
     2. NO NUMBER THE OWNER DID NOT STATE. The reel and the brief carry their
        words, their links and what was measured here — and nothing else. Where
        a line would have to be invented, the line is absent and the absence is
        named in the log and in the brief.
     3. FAIL CLOSED AND SAY WHY. No metadata means nothing is measured and it
        says so. No encoder means no reel and it says so. A file that was
        skipped is skipped BY NAME. A measurement that was not taken is never
        reported as zero: it is reported as not taken.

   Everything the person types or drops is captured verbatim on this device
   (localStorage "drop_soul") before it is used for anything — L37 — and it
   rides back in the bundle as soul.json so the record survives the tab.
   ========================================================================== */
(function(){
"use strict";

const VERSION = "1.0";
const LS_SOUL = "drop_soul";
const MAX_STILL_LONG = 1280;      /* stills are pulled at this long edge, in px */
const REEL_W = 1080, REEL_H = 1920, REEL_FPS = 30;
const SEEK_TIMEOUT = 6000;
const META_TIMEOUT = 9000;

/* ============================================================== tiny helpers */
const $ = function(id){ return document.getElementById(id); };
function esc(s){
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function kb(n){ return window.Bundle ? window.Bundle.kb(n) : (n + " B"); }
function mmss(s){ s = Math.max(0, s || 0); const m = Math.floor(s / 60); return m + ":" + String(Math.floor(s % 60)).padStart(2, "0"); }
function r2(n){ return Math.round(n * 100) / 100; }

const state = {
  trade: null, routed: false, name: "",
  answers: {}, links: [], shotsDone: {},
  videos: [], pics: [], voices: [],
  sheet: null, sheetBlob: null, poster: null, posterBlob: null,
  reel: null, busy: false, cancel: false, started: Date.now(),
  /* the probe in flight — a dropped file is opened by the browser asynchronously, and
     every read path waits on it (settledProbes) rather than running past it */
  probing: null
};

/* ------------------------------------------------------------------- the log */
function log(msg, cls){
  const box = $("logBox");
  if(!box) return;
  const t = new Date().toTimeString().slice(0, 8);
  const line = document.createElement("div");
  if(cls) line.className = "l-" + cls;
  line.innerHTML = "<span style='opacity:.55'>" + t + "</span> " + msg;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}
function sub2(box, text){
  const d = document.createElement("div");
  d.className = "sub2";
  d.textContent = text;
  box.appendChild(d);
  return d;
}
function meta(box, html){
  const d = document.createElement("div");
  d.className = "meta";
  d.innerHTML = html;
  box.appendChild(d);
  return d;
}

/* ====================================================== the soul ledger (L37) */
function soulLoad(){
  try{ return JSON.parse(localStorage.getItem(LS_SOUL) || "[]") || []; }catch(e){ return []; }
}
function soulPush(kind, text, foot){
  const rec = { at: Date.now(), kind: kind, text: String(text == null ? "" : text).slice(0, 20000), foot: foot || "" };
  const all = soulLoad();
  all.push(rec);
  try{ localStorage.setItem(LS_SOUL, JSON.stringify(all.slice(-500))); }catch(e){}
  paintSoul();
  return rec;
}
function paintSoul(){
  const all = soulLoad();
  const bytes = (function(){ try{ return (localStorage.getItem(LS_SOUL) || "").length; }catch(e){ return 0; } })();
  const box = $("memBox");
  if(!box) return;
  if(!all.length){
    box.innerHTML = "nothing yet — every word you type here is kept on this device, verbatim, before it is used for anything.";
    return;
  }
  const last = String(all[all.length - 1].text || "");
  box.innerHTML = "<b>" + all.length + "</b> capture(s) · <b>" + kb(bytes) + "</b> held in this browser only · the newest: "
    + "<span style='color:var(--text-solid)'>" + esc(last.slice(0, 90)) + (last.length > 90 ? "…" : "") + "</span>";
}

/* ================================================================ the trade */
function paintOffer(){
  const O = window.Trades.OFFER;
  $("offerHead").textContent = O.headline;
  $("offerLine").textContent = O.line;
  $("offerCost").textContent = O.cost;
  /* the one place on the page that says what is received: the proof of work.
     It states the deliverable and then stops — the artefact is the argument. */
  const pf = $("offerProof");
  if(pf) pf.textContent = O.proof || "";
}
function paintGrid(){
  const grid = $("tradeGrid");
  grid.innerHTML = window.Trades.ALL.map(function(t){
    return '<button class="trade' + (state.trade && state.trade.id === t.id ? " on" : "") + '" data-t="' + t.id + '">'
      + "<b>" + esc(t.id === "other" ? "something else" : t.id) + "</b>" + esc(t.label) + "</button>";
  }).join("");
  grid.querySelectorAll("[data-t]").forEach(function(b){
    b.onclick = function(){ selectTrade(window.Trades.get(b.dataset.t)); };
  });
}
function selectTrade(t){
  if(!t) return;
  state.trade = t;
  state.routed = true;
  soulPush("trade", t.id, "chosen from the desk's own list");
  $("tradeChip").innerHTML = "<b>" + esc(t.label) + "</b>";
  $("tradeResetBtn").hidden = false;
  paintGrid();
  paintPanel();
  paintShots();
  paintAnswers();
  ["shootCard", "dropCard", "readCard", "voiceCard", "sendCard"].forEach(function(id){ $(id).hidden = false; });
  log("trade read as <b>" + esc(t.label) + "</b>" + (t.id === "other" ? " — the desk does not know this one yet, so it is asking rather than guessing" : ""), t.id === "other" ? "warn" : "ok");
  try{ $("shootCard").scrollIntoView({ behavior: "smooth", block: "start" }); }catch(e){}
}
function paintPanel(){
  const t = state.trade, box = $("tradePanel");
  if(!t){ box.hidden = true; return; }
  box.hidden = false;
  const L = [];
  L.push('<div class="rule"></div>');
  L.push('<div class="step">the desk read your trade</div>');
  L.push('<p class="tp-need">' + esc(t.need) + "</p>");
  L.push('<div class="tp-grid">');
  L.push('<div class="tp-box"><h3>What your page has to do</h3><ul>' + t.slots.map(function(s){
    return "<li><b>" + esc(s.name) + "</b> <span>— " + esc(s.why) + "</span></li>";
  }).join("") + "</ul></div>");
  L.push('<div class="tp-box"><h3>How people will find you</h3><ul>' + t.must.map(function(m){
    return "<li><b>" + esc(m.c) + "</b> <span>— " + esc(m.why) + "</span></li>";
  }).join("") + "</ul><p class='hint' style='margin-top:8px'>This is the desk\'s own reading of the trade, not industry law. If one of these is wrong for you, say so — it goes in the brief.</p></div>");
  L.push("</div>");
  L.push('<div class="tp-box" style="margin-top:12px"><h3>One thing this trade\'s pages always get wrong</h3><p>' + esc(t.trap) + "</p></div>");
  L.push('<div class="askrow" style="margin-top:14px"><label for="nameInput">And what should the page call you, or the place?</label>'
    + '<input id="nameInput" type="text" placeholder="the name on the sign" value="' + esc(state.name) + '"></div>');
  box.innerHTML = L.join("");
  const n = $("nameInput");
  if(n){
    n.oninput = function(){ state.name = n.value; };
    n.onchange = function(){ if(n.value.trim()) soulPush("name", n.value.trim(), "said on the desk"); };
  }
}
function route(text){
  const raw = String(text || "").trim();
  if(!raw){ log("say what you do first — the whole page is read from that answer", "warn"); return; }
  soulPush("what-they-do", raw, "the desk's first question");
  const r = window.Trades.find(raw);
  log("routing “" + esc(raw) + "” → <b>" + esc(r.trade.label) + "</b> (" + esc(r.why) + ")", r.hit ? "ok" : "warn");
  selectTrade(r.trade);
}

/* ================================================================ step 1 · shots */
function paintShots(){
  const t = state.trade, box = $("shotList");
  if(!t) return;
  box.innerHTML = t.shots.map(function(s, i){
    const done = !!state.shotsDone[t.id + ":" + i];
    return '<div class="shot' + (done ? " done" : "") + '" data-i="' + i + '"><div class="n">' + (i + 1) + '</div>'
      + '<div><div class="t">' + esc(s.t) + '</div><div class="w">' + esc(s.why) + "</div></div></div>";
  }).join("");
  box.querySelectorAll(".shot").forEach(function(el){
    el.onclick = function(){
      const k = t.id + ":" + el.dataset.i;
      state.shotsDone[k] = !state.shotsDone[k];
      el.classList.toggle("done", !!state.shotsDone[k]);
      paintShotNote();
    };
  });
  paintShotNote();
  $("shotNote").innerHTML = "The reason each frame is there is under it, so you can judge it yourself — if a shot does not fit your place, skip it and say why. <b>What this trade's pages always get wrong:</b> " + esc(t.trap);
}
function paintShotNote(){
  const t = state.trade; if(!t) return;
  const n = t.shots.filter(function(_, i){ return state.shotsDone[t.id + ":" + i]; }).length;
  $("shotProg") && ($("shotProg").textContent = n + "/" + t.shots.length);
}

/* =============================================================== step 2 · drop */
function wireDrop(){
  const zone = $("dropZone");
  const fin = $("fileInput"), pin = $("picInput");
  zone.onclick = function(){ fin.click(); };
  zone.onkeydown = function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); fin.click(); } };
  $("addPicBtn").onclick = function(){ pin.click(); };
  $("probeBtn").onclick = function(){ probeAll(); };
  $("clearBtn").onclick = function(){
    if(!window.confirm("Empty the desk? Everything read here — stills, the sheet, the reel — is released from memory. Nothing was ever uploaded, so there is nothing to delete anywhere else.")) return;
    releaseAll();
  };
  fin.onchange = function(){ queueVideos([].slice.call(fin.files || [])); fin.value = ""; };
  pin.onchange = function(){ queuePics([].slice.call(pin.files || [])); pin.value = ""; };
  ["dragenter", "dragover"].forEach(function(ev){
    zone.addEventListener(ev, function(e){ e.preventDefault(); zone.style.borderColor = "var(--purple)"; });
  });
  ["dragleave", "drop"].forEach(function(ev){
    zone.addEventListener(ev, function(e){ e.preventDefault(); zone.style.borderColor = ""; });
  });
  zone.addEventListener("drop", function(e){
    const files = [].slice.call((e.dataTransfer && e.dataTransfer.files) || []);
    queueVideos(files.filter(function(f){ return /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(f.name); }));
    queuePics(files.filter(function(f){ return /^image\//.test(f.type); }));
  });
  /* the whole window is a drop target: a client dragging a video onto a page
     should never have to find the exact box first */
  window.addEventListener("dragover", function(e){ e.preventDefault(); });
  window.addEventListener("drop", function(e){ e.preventDefault(); });
}
function releaseAll(){
  state.videos.forEach(function(v){
    try{ if(v.url) URL.revokeObjectURL(v.url); }catch(e){}
    (v.stills || []).forEach(function(s){ try{ URL.revokeObjectURL(s.url); }catch(e){} });
    try{ if(v.el){ v.el.removeAttribute("src"); v.el.load && v.el.load(); } }catch(e){}
  });
  state.pics.concat(state.voices).forEach(function(p){ try{ URL.revokeObjectURL(p.url); }catch(e){} });
  if(state.reel && state.reel.url){ try{ URL.revokeObjectURL(state.reel.url); }catch(e){} }
  state.videos = []; state.pics = []; state.voices = [];
  state.sheet = null; state.sheetBlob = null; state.poster = null; state.posterBlob = null; state.reel = null;
  $("queueBox").innerHTML = ""; $("readBox").innerHTML = ""; $("pulseBox").innerHTML = "";
  $("sheetBox").hidden = true; $("reelBox").hidden = true;
  $("clearBtn").hidden = true;
  log("the desk is empty. Nothing was uploaded at any point, so nothing has to be deleted anywhere.", "ok");
}
function queueVideos(files){
  if(!files.length) return;
  files.forEach(function(f){
    const it = { file: f, name: f.name, size: f.size, url: URL.createObjectURL(f), meta: null, stills: [], pulse: null, picks: null, el: null };
    state.videos.push(it);
    soulPush("video", f.name, kb(f.size));
  });
  log("queued <b>" + files.length + "</b> video(s) — " + files.map(function(f){ return esc(f.name) + " (" + kb(f.size) + ")"; }).join(", "));
  paintQueue();
  probeAll();
}
function queuePics(files){
  if(!files.length) return;
  files.forEach(function(f){
    const it = { file: f, name: f.name, size: f.size, url: URL.createObjectURL(f) };
    state.pics.push(it);
    soulPush("picture", f.name, kb(f.size));
  });
  log("added <b>" + files.length + "</b> picture(s) to the reel");
  paintQueue();
}
function paintQueue(){
  const box = $("queueBox");
  $("clearBtn").hidden = !(state.videos.length || state.pics.length || state.voices.length);
  if(!state.videos.length && !state.pics.length && !state.voices.length){ box.innerHTML = ""; return; }
  const rows = [];
  state.videos.forEach(function(v, i){
    const m = v.meta;
    const st = !m ? '<span class="pill">not read yet</span>'
      : (m.ok ? '<span class="pill ok">' + mmss(m.dur) + " · " + m.w + "×" + m.h + "</span>"
              : '<span class="pill bad">SKIPPED</span>');
    rows.push('<div class="qitem"><span class="nm">🎬 ' + esc(v.name) + "<i>" + kb(v.size) + (m && !m.ok ? " · " + esc(m.why) : "") + "</i></span>"
      + st + '<button class="tbtn sm" data-act="del-v" data-i="' + i + '">✕</button></div>');
  });
  state.pics.forEach(function(p, i){
    rows.push('<div class="qitem"><span class="nm">🖼 ' + esc(p.name) + "<i>" + kb(p.size) + "</i></span>"
      + '<span class="pill">into the reel</span><button class="tbtn sm" data-act="del-p" data-i="' + i + '">✕</button></div>');
  });
  state.voices.forEach(function(v, i){
    rows.push('<div class="qitem"><span class="nm">🎙 ' + esc(v.name) + "<i>" + kb(v.size) + "</i></span>"
      + '<span class="pill ok">voice note</span><button class="tbtn sm" data-act="del-vc" data-i="' + i + '">✕</button></div>');
  });
  box.innerHTML = '<div class="sub2">On the desk</div>' + rows.join("");
  box.querySelectorAll("[data-act]").forEach(function(b){
    b.onclick = function(){
      const i = +b.dataset.i, a = b.dataset.act;
      if(a === "del-v"){ try{ URL.revokeObjectURL(state.videos[i].url); }catch(e){} state.videos.splice(i, 1); }
      if(a === "del-p"){ try{ URL.revokeObjectURL(state.pics[i].url); }catch(e){} state.pics.splice(i, 1); }
      if(a === "del-vc"){ try{ URL.revokeObjectURL(state.voices[i].url); }catch(e){} state.voices.splice(i, 1); }
      paintQueue();
    };
  });
}

/* =============================================================== probing */
function probeItem(it){
  return new Promise(function(res){
    if(!it.el){
      const v = document.createElement("video");
      v.preload = "metadata"; v.muted = true; v.playsInline = true;
      it.el = v;
      v.src = it.url;
    }
    const v = it.el;
    let done = false;
    const fin = function(o){ if(done) return; done = true; clearTimeout(tim); res(o); };
    const tim = setTimeout(function(){
      /* MEASURED, NOT GUESSED. This used to assert that a background tab was the cause,
         always — so a damaged file in a foreground tab was reported as a browser quirk,
         and the person was told to do something that could not help. The page can see
         which of the two it is, so it says that. (Measured 2026-09-24: with the tab
         hidden, a valid H.264 MP4 also fails to report metadata. The cause is real.) */
      fin({ ok:false, why:"no metadata after " + (META_TIMEOUT / 1000) + "s — " + (document.hidden
        ? "this tab is in the background and the browser does not load a media file while it is hidden: bring the tab to the front and press ↻ Re-read"
        : "the file did not report itself in that time, so it may be damaged or in a format this device cannot open: try another file, or the same one re-exported") });
    }, META_TIMEOUT);
    v.onloadedmetadata = function(){ fin({ ok:true, dur:v.duration, w:v.videoWidth, h:v.videoHeight }); };
    v.onerror = function(){ fin({ ok:false, why:"the browser would not open this file (" + ((v.error && v.error.code) || "?") + ") — it may be a format this device cannot decode" }); };
  });
}
/* a MediaRecorder WebM reports Infinity for its own duration. The browser has to
   be made to read the file through before it knows how long it is — without this
   there is no timeline, so no pulse and no stills. */
function recoverDuration(v){
  return new Promise(function(res){
    if(isFinite(v.duration) && v.duration > 0) return res(v.duration);
    let done = false;
    const fin = function(d){ if(done) return; done = true; clearTimeout(t); res(d); };
    const t = setTimeout(function(){ fin(isFinite(v.duration) ? v.duration : 0); }, 8000);
    v.addEventListener("durationchange", function(){ if(isFinite(v.duration) && v.duration > 0) fin(v.duration); });
    try{ v.currentTime = 1e101; }catch(e){ fin(0); }
  });
}
/* THE PROBE IS TRACKED, because it is asynchronous and everything else is not.
   `queueVideos` fires this and returns, so the read is free to start while the browser
   is still opening the file. Measured 2026-09-24 (the A→Z sweep): a video dropped and
   read in the same breath was skipped entirely — a reel was built from the pictures
   alone, the pulse went unmeasured, and the log said nothing about either. So the
   promise is kept on the state, and `settledProbes()` is awaited by every read path. */
function probeAll(){
  const unread = state.videos.filter(function(v){ return !v.meta; });
  if(!unread.length){
    /* an empty desk and a fully-read desk are different facts, and the log says which */
    log(state.videos.length ? "every video on the desk has already been read" : "there is nothing on the desk to read yet — drop a video (or pictures) first", "warn");
    return Promise.resolve();
  }
  const run = probeUnread(unread);
  state.probing = run;
  return run;
}
/* await the probe in flight, once — then forget it, so a later read is never held by a
   probe that has already finished. */
async function settledProbes(){
  if(!state.probing) return;
  const p = state.probing;
  state.probing = null;
  try{ await p; }catch(e){}
}
async function probeUnread(unread){
  for(const it of unread){
    let m = await probeItem(it);
    if(m.ok && (!isFinite(m.dur) || m.dur <= 0)){
      const d = await recoverDuration(it.el);
      m.dur = d;
      if(d > 0) log("<b>" + esc(it.name) + "</b> did not report its own length (a recorder container) — it was read through and recovered as <b>" + r2(d) + "s</b>");
    }
    if(m.ok && (!m.w || !m.h)) m = { ok:false, why:"the file has no picture dimensions — it may be audio only" };
    it.meta = m;
    if(m.ok) log("<b>" + esc(it.name) + "</b> read: " + mmss(m.dur) + " · " + m.w + "×" + m.h, "ok");
    else log("<b>" + esc(it.name) + "</b> SKIPPED — " + esc(m.why), "bad");
    try{ it.el.currentTime = 0; }catch(e){}
    paintQueue();
  }
}

/* ============================================================== stills + sheet */
function seekTo(v, t){
  return new Promise(function(res){
    let done = false;
    const fin = function(){ if(done) return; done = true; try{ v.removeEventListener("seeked", fin); }catch(e){} res(); };
    try{ v.addEventListener("seeked", fin); }catch(e){}
    try{ v.currentTime = Math.max(0.01, t); }catch(e){ fin(); return; }
    setTimeout(fin, SEEK_TIMEOUT);      /* one bad seek never hangs the pass */
  });
}
async function grab(it, t){
  const v = it.el;
  await seekTo(v, t);
  if(!v.videoWidth) return null;
  const sc = Math.min(1, MAX_STILL_LONG / Math.max(v.videoWidth, v.videoHeight));
  const c = document.createElement("canvas");
  c.width = Math.max(2, Math.round(v.videoWidth * sc));
  c.height = Math.max(2, Math.round(v.videoHeight * sc));
  c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
  const blob = await new Promise(function(r){ c.toBlob(r, "image/jpeg", 0.88); });
  if(!blob) return null;
  return { t: r2(v.currentTime), blob: blob, url: URL.createObjectURL(blob), w: c.width, h: c.height, name: it.name };
}
/* n stills, evenly, never more than the file can honestly give */
async function pullStills(it, n){
  const out = [];
  const dur = it.meta && it.meta.dur;
  if(!dur) return out;
  for(let i = 0; i < n; i++){
    const t = Math.min(dur - 0.05, Math.max(0.05, (dur * (i + 0.5)) / n));
    const s = await grab(it, t);
    if(s) out.push(s);
  }
  return out;
}
/* the contact sheet: every tile carries its own second, burned in, because every
   later sentence about a moment has to be checkable against the number */
async function makeSheet(tiles, perRow){
  const cols = perRow || 4;
  const rows = Math.ceil(tiles.length / cols);
  const tw = 360;
  const first = tiles[0] && tiles[0].img;
  const th = Math.round(tw * (first && first.width ? (first.height / first.width) : 0.5625));
  const c = document.createElement("canvas");
  c.width = cols * tw; c.height = rows * th;
  const g = c.getContext("2d");
  g.fillStyle = "#0f0f1a"; g.fillRect(0, 0, c.width, c.height);
  tiles.forEach(function(s, i){
    const x = (i % cols) * tw, y = Math.floor(i / cols) * th;
    g.drawImage(s.img, x, y, tw, th);
    g.fillStyle = "rgba(0,0,0,.7)"; g.fillRect(x, y + th - 22, 92, 22);
    g.fillStyle = "#f8fafc"; g.font = "14px ui-monospace,monospace";
    g.fillText(mmss(s.t), x + 6, y + th - 6);
  });
  const blob = await new Promise(function(r){ c.toBlob(r, "image/jpeg", 0.9); });
  return { blob: blob, w: c.width, h: c.height, url: URL.createObjectURL(blob), n: tiles.length };
}

/* ================================================================ the pulse */
async function runPulse(it){
  const scan = await window.Pulse.scan(it.el, { samples: 140, maxSide: 160 }, {
    shouldStop: function(){ return state.cancel; },
    onNote: function(m){ log(esc(m), "warn"); }
  });
  if(!scan.ok){ log("<b>" + esc(it.name) + "</b> could not be measured — " + esc(scan.why), "bad"); return null; }
  const aud = await window.Pulse.audio(it.file, {}, { onNote: function(m){ log(esc(m), "warn"); } });
  const pulse = window.Pulse.combine(scan, aud, {});
  const picks = window.Pulse.pick(pulse, { count: 3, len: 4 });
  it.pulse = pulse; it.picks = picks;
  return pulse;
}
function paintPulse(){
  const box = $("pulseBox");
  const measured = state.videos.filter(function(v){ return v.pulse; });
  const skipped = state.videos.filter(function(v){ return v.meta && !v.meta.ok; });
  const notRead = state.videos.filter(function(v){ return !v.meta });
  box.innerHTML = "";
  if(notRead.length) meta(box, "<span class='warn'>" + notRead.length + " file(s) have not been read yet — press ↻ Re-read. Nothing is claimed about a file that was not read.</span>");
  if(!measured.length){
    meta(box, "the pulse has not been measured yet.");
  } else {
    measured.forEach(function(v){
      const p = v.pulse;
      const line = "motion floor <b>" + Math.round(p.floor * 100) + "%</b> → peak <b>" + Math.round(p.peak * 100) + "%</b>"
        + " · " + (p.hasAudio
          ? "loudness heard (floor " + Math.round(p.audioFloor * 100) + "% → peak " + Math.round(p.audioPeak * 100) + "%)"
          : "MOTION ALONE" + (p.audioWhy ? " — " + esc(p.audioWhy) : ""))
        + " · walked in " + r2(p.walkMs / 1000) + "s";
      const box2 = document.createElement("div");
      box2.className = "tp-box";
      box2.style.marginTop = "10px";
      box2.innerHTML = '<h3>🎬 ' + esc(v.name) + " · " + mmss(p.dur) + "</h3>"
        + '<div class="pline"><b>length</b><span>' + mmss(p.dur) + " · " + p.walked + " sample(s) every " + r2(p.step) + "s</span></div>"
        + '<div class="pline"><b>the read</b><span>' + line + "</span></div>"
        + '<div class="pline"><b>the life</b><span>' + (function(){
            const picks = v.picks || [];
            if(!picks.length) return "no window cleared the stillness floor — this file has no moment this measurement would call alive, and it is not being padded with one";
            const seen = {}, moments = [];
            picks.forEach(function(k){
              const key = Math.round(k.peakT * 10);
              if(seen[key]) return;
              seen[key] = 1;
              moments.push("at <b>" + mmss(k.peakT) + "</b> (" + esc(k.why) + ")");
            });
            return moments.join("<br>") + (moments.length < picks.length
              ? "<br><span style='color:var(--text-dim)'>" + picks.length + " windows cleared the floor, " + moments.length + " distinct moment(s) — the busiest second in this file is inside more than one window, and it is counted once.</span>"
              : "");
          })() + "</span></div>"
        + ((v.picks && v.picks.suppressed) ? '<div class="pline"><b>asked for</b><span>3 windows · found <b>' + v.picks.length + "</b> · <b>" + v.picks.suppressed + "</b> suppressed by the stillness floor (a file with five seconds of life in it gets one clip from those five seconds, and says so)</span></div>" : "");
      box.appendChild(box2);
    });
  }
  if(skipped.length) meta(box, "<span class='bad'>skipped by name: " + skipped.map(function(v){ return esc(v.name); }).join(", ") + "</span>");
}

/* ==================================================================== the reel */
async function bitmapOf(blob){
  try{ return await createImageBitmap(blob); }catch(e){ return null; }
}
/* the pictures for the reel, in this order:
   1. the stills AT the measured peaks (the moments the pulse actually found)
   2. the pictures the owner dropped in
   3. nothing else. No stock, no stand-in, no placeholder. */
async function reelShots(){
  const out = [];
  const taken = [];    /* [source, second] — no two shots from the same moment */
  for(const v of state.videos){
    if(!v.meta || !v.meta.ok || !v.stills.length) continue;
    const chosen = v.pulse ? window.Pulse.topFrames(v.pulse, v.stills, 3, {}) : v.stills.slice(0, 3);
    for(const s of chosen){
      /* two windows can both peak on the same second — the pulse reports both,
         and the reel should not show the same moment twice */
      if(taken.some(function(x){ return x[0] === v.name && Math.abs(x[1] - s.t) < 1.5; })) continue;
      const bmp = await bitmapOf(s.blob);
      if(bmp){ taken.push([v.name, s.t]); out.push({ bmp: bmp, w: bmp.width, h: bmp.height, _t: s.t, _src: v.name, _why: "a measured peak" }); }
    }
  }
  for(const p of state.pics){
    const bmp = await bitmapOf(p.file);
    if(bmp) out.push({ bmp: bmp, w: bmp.width, h: bmp.height, _src: p.name, _why: "you sent it" });
  }
  return out;
}
/* captions: ONLY the owner's own words. There is no line in this function that
   can invent a claim, because every line it can emit was typed or dropped by the
   person it is written for. Nothing to say → no caption, and the log says so. */
function captionPool(){
  const lines = [];
  Object.keys(state.answers).forEach(function(q){
    String(state.answers[q] || "").split(/\n+/).forEach(function(l){
      const s = l.trim();
      if(s) lines.push(s);
    });
  });
  if(state.name && state.name.trim()) lines.push(state.name.trim());
  return lines;
}
function reelOptsFor(shots){
  const t = state.trade || {};
  const pool = captionPool();
  const shotsWithCaps = shots.map(function(s, i){
    return { bmp: s.bmp, w: s.w, h: s.h, motion: "auto", hold: 2.6, caption: pool.length ? (pool[i % pool.length] || "") : "" };
  });
  const opts = {
    w: REEL_W, h: REEL_H, fps: REEL_FPS, perShot: 2.6, transition: 0.6,
    motion: "auto", seed: 3, vignette: 0.35, progressBar: false, watermark: "",
    shots: shotsWithCaps
  };
  /* the title card says only what the desk was told */
  const firstAns = (state.answers[t.answers && t.answers[0]] || "").trim();
  const title = firstAns ? firstAns.split(/\n/)[0].slice(0, 46) : (state.name || "");
  if(title) opts.titleCard = { kicker: t.label || "", title: title, sub: state.name || "" };
  const channel = firstChannel();
  if(channel) opts.endCard = { kicker: "ONE WAY IN", title: channel.label, sub: channel.sub };
  return { opts: opts, captioned: pool.length, cards: !!(opts.titleCard || opts.endCard) };
}
/* the way in: the first real channel the owner actually gave us — never invented */
function firstChannel(){
  const raw = (state.links || []).join("\n");
  const wa = raw.match(/wa\.me\/(\d+)/);
  if(wa) return { label: "Message us on WhatsApp", sub: "+" + wa[1] };
  const tel = raw.match(/(\+?\d[\d\s\-()]{6,}\d)/);
  if(tel) return { label: "Call us", sub: tel[1] };
  const at = raw.match(/instagram\.com\/([A-Za-z0-9._]+)/);
  if(at) return { label: "Instagram @" + at[1], sub: "" };
  const site = (state.links || []).map(function(x){ return x.match(/^(?:https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})(\/|$)/i); }).filter(Boolean)[0];
  if(site) return { label: site[1], sub: "" };
  return null;
}
async function renderReel(){
  const box = $("readBox");
  box.innerHTML = "";
  /* the same guard as runRead, because the reel can be called directly — the station's
     harness, and any future in-page capture, call it past the read. */
  if(state.probing){ log("waiting for the file(s) on the desk to be read…"); await settledProbes(); }
  /* A HIDDEN TAB CANNOT RENDER USEFULLY, so it does not pretend to try. A browser
     throttles timers to about one a second and stops painting while the tab is hidden,
     and the encoder's drain loop is built on those timers: measured 2026-09-24, a
     10.6-second reel took 50s hidden against 3.88s in front, and a 255-frame reel did
     not finish inside four minutes. An apparently frozen page is worse than a refusal,
     so the desk refuses, says why, and claims nothing. */
  if(document.hidden){
    const why = "this tab is in the background, and a browser throttles timers and stops painting while a tab is hidden — the render would crawl (measured: 50s hidden for a reel that takes 3.9s in front) or appear to hang. Nothing was rendered and nothing is claimed: bring this tab to the front and press the button again.";
    log("the reel was not rendered — " + esc(why), "bad");
    meta(box, "<span class='bad'>" + esc(why) + "</span>");
    return null;
  }
  const shots = await reelShots();
  if(!shots.length){
    meta(box, "<span class='bad'>there is nothing to build a reel from yet — read a video so the stills exist, or add pictures.</span>");
    log("no reel: no material. Nothing was rendered and nothing is claimed.", "bad");
    return null;
  }
  const built = reelOptsFor(shots);
  const opts = built.opts;
  const cap = await window.Reel.caps(REEL_W, REEL_H, REEL_FPS);
  const P = window.Reel.plan(opts);
  log("reel plan — <b>" + P.n + "</b> shot(s) · <b>" + r2(P.total) + "s</b> · " + REEL_W + "×" + REEL_H + " · " + P.frames + " frames");
  log("engine — " + esc(cap.reason));
  if(!built.captioned) log("no captions: nothing was typed for the reel, and the desk does not write words for people.", "warn");
  if(!built.cards) log("no cards: the desk had no title or channel of yours to put on them, so it put none.", "warn");

  const bar = document.createElement("div");
  bar.className = "bar";
  bar.innerHTML = "<i></i>";
  const stage = document.createElement("div");
  stage.className = "meta";
  box.appendChild(bar); box.appendChild(stage);
  const cv = $("reelCanvas");
  cv.hidden = false;

  state.cancel = false;
  $("cancelBtn").hidden = false;
  const t0 = performance.now();
  let res = null;
  try{
    res = await window.Reel.render(opts, {
      canvas: cv,
      shouldStop: function(){ return state.cancel; },
      onFrame: function(f, total, t){
        bar.firstChild.style.width = (100 * f / total).toFixed(1) + "%";
        stage.innerHTML = "rendering <b>" + f + "/" + total + "</b> · " + r2(t) + "s · keep this tab in front";
      }
    });
  }catch(e){
    log("the reel was not written: " + esc((e && e.message) || e), "bad");
    meta(box, "<span class='bad'>the render failed — see the log. Nothing is claimed about a reel that does not exist.</span>");
    $("cancelBtn").hidden = true;
    return null;
  }
  $("cancelBtn").hidden = true;
  if(state.cancel || !res || !res.blob){
    log("the render was stopped. No file was produced.", "warn");
    return null;
  }
  const ver = await window.Reel.verify(res.blob);
  res.url = URL.createObjectURL(res.blob);
  res.verified = ver;
  res.shots = shots;
  state.reel = res;

  const pOpts = opts;
  const posterCv = window.Reel.poster(pOpts, Math.min(1.2, P.total / 3), document.createElement("canvas"));
  state.poster = posterCv;
  state.posterBlob = await new Promise(function(r){ posterCv.toBlob(r, "image/jpeg", 0.9); });

  const rv = $("reelVideo");
  rv.hidden = false; rv.src = res.url;
  $("reelBox").hidden = false;
  $("reelMeta").innerHTML = "<b>" + kb(res.bytes) + "</b> · " + esc(String(res.container || "").toUpperCase()) + "/" + esc(res.codec || "?")
    + (res.audio ? " + " + esc(res.audio) : " · silent") + " · " + res.frames + " frames · " + P.n + " shots"
    + " · wrote in " + r2(res.ms / 1000) + "s" + (res.realtimeFactor ? " (" + r2(1 / res.realtimeFactor) + "× real time)" : " (real time)")
    + (ver.ok ? '<br><span class="ok">read back through a player: ' + r2(ver.seconds) + "s · " + ver.w + "×" + ver.h + " — playable</span>"
              : '<br><span class="warn">could not be read back (' + esc(ver.why) + ") — the numbers above are the encoder's intent, not a player's</span>");
  log("reel — " + kb(res.bytes) + " · " + esc(String(res.container || "").toUpperCase()) + " · " + res.frames + " frames · wrote in " + r2(res.ms / 1000) + "s", "ok");
  if(ver.ok) log("read back through a <video>: " + r2(ver.seconds) + "s · " + ver.w + "×" + ver.h + " · playable — the file is what it says it is", "ok");
  soulPush("reel", P.n + " shots → " + kb(res.bytes) + " " + (res.container || ""), ver.ok ? r2(ver.seconds) + "s, read back playable" : "unverified");
  return res;
}
function wireRead(){
  $("pulseBtn").onclick = function(){ runRead("pulse"); };
  $("sheetBtn").onclick = function(){ runRead("sheet"); };
  $("allBtn").onclick = function(){ runRead("all"); };
  $("cancelBtn").onclick = function(){ state.cancel = true; log("stopping — the pass in front will finish its current step", "warn"); };
  $("reelDlBtn").onclick = function(){
    if(!state.reel){ return; }
    window.Bundle.download("reel." + (state.reel.container || "mp4"), state.reel.blob);
    log("the reel is downloading onto your device — " + kb(state.reel.bytes));
  };
  $("posterDlBtn").onclick = function(){
    if(!state.posterBlob) return;
    window.Bundle.download("cover.jpg", state.posterBlob);
  };
  $("previewBtn").onclick = function(){
    if(!state.reel){ return; }
    const rv = $("reelVideo");
    rv.hidden = false;
    rv.currentTime = 0;
    rv.play().catch(function(){});
  };
}
async function runRead(what){
  if(state.busy){ log("the desk is already working — one pass at a time", "warn"); return; }
  /* a file that was just dropped is still being read. Wait for it before deciding what
     is on the desk, or the read runs past it and leaves it out of everything. */
  if(state.probing){
    state.busy = true;
    log("waiting for the file(s) on the desk to be read…");
    try{ await settledProbes(); }finally{ state.busy = false; }
  }
  const usable = state.videos.filter(function(v){ return v.meta && v.meta.ok; });
  /* and whatever is STILL unread or unreadable is named at the moment it is left out:
     a video silently absent from a read is the same failure as a measurement reported
     as zero. */
  const left = state.videos.filter(function(v){ return !v.meta || !v.meta.ok; });
  if(left.length) log("not read, so not used: " + left.map(function(v){ return "<b>" + esc(v.name) + "</b> (" + esc((v.meta && v.meta.why) || "still being read") + ")"; }).join(" · "), "warn");
  if(what === "pulse" && !usable.length){
    log("nothing to measure: a pulse is a reading of a video, and no video has been read here yet. Pictures go straight into the reel.", "warn");
    return;
  }
  if(what !== "sheet" && !usable.length && !state.pics.length){
    log("there is nothing to read yet — drop a video (or pictures) first", "warn"); return;
  }
  state.busy = true; state.cancel = false;
  const btn = $("allBtn"); const was = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = "working…";
  const box = $("readBox");
  try{
    /* 1 — stills, if they do not exist yet */
    for(const v of usable){
      if(v.stills.length) continue;
      if(state.cancel) break;
      log("pulling stills from <b>" + esc(v.name) + "</b>…");
      v.stills = await pullStills(v, 12);
      log("stills — <b>" + v.stills.length + "</b> from " + esc(v.name));
    }
    /* 2 — the pulse, which decides WHICH stills matter */
    if(what !== "sheet"){
      for(const v of usable){
        if(v.pulse || state.cancel) continue;
        log("measuring the pulse of <b>" + esc(v.name) + "</b> — walking the file, this takes a moment…");
        await runPulse(v);
      }
      paintPulse();
    }
    /* 3 — the contact sheet, with each tile's own second burned in */
    if(what !== "pulse"){
      const all = [];
      for(const v of usable) v.stills.forEach(function(s){ all.push(s); });
      if(all.length){
        const imgs = [];
        for(const s of all){
          const bmp = await bitmapOf(s.blob);
          if(bmp) imgs.push({ img: bmp, t: s.t });
        }
        if(imgs.length){
          state.sheet = await makeSheet(imgs, Math.min(4, imgs.length));
          state.sheetBlob = state.sheet.blob;
          $("sheetImg").src = state.sheet.url;
          $("sheetBox").hidden = false;
          log("contact sheet — " + state.sheet.n + " tiles, each carrying its own second", "ok");
        }
      }
    }
    /* 4 — the reel */
    if(what === "all" && !state.cancel){
      box.innerHTML = "";
      await renderReel();
      $("sendCard").hidden = false;
      try{ $("sendCard").scrollIntoView({ behavior: "smooth", block: "start" }); }catch(e){}
    }
  }catch(e){
    log("the read stopped: " + esc((e && e.message) || e), "bad");
  }finally{
    state.busy = false;
    btn.disabled = false; btn.innerHTML = was;
    $("cancelBtn").hidden = true;
  }
}

/* ============================================================= the answers */
function paintAnswers(){
  const t = state.trade, box = $("answersWrap");
  if(!t){ return; }
  box.innerHTML = t.answers.map(function(q, i){
    const v = state.answers[q] || "";
    return '<div class="q"><div class="qh">' + (i + 1) + ". " + esc(q) + '</div>'
      + '<textarea data-q="' + esc(q) + '" rows="3" placeholder="in your own words">' + esc(v) + "</textarea></div>";
  }).join("");
  box.querySelectorAll("[data-q]").forEach(function(ta){
    ta.onchange = function(){
      const q = ta.dataset.q;
      state.answers[q] = ta.value;
      if(ta.value.trim()) soulPush("answer", ta.value.trim(), q);
    };
  });
}
function wireVoice(){
  const btn = $("recBtn"), st = $("recState");
  let rec = null, chunks = [], t0 = 0;
  btn.onclick = async function(){
    if(rec && rec.state === "recording"){
      rec.stop();
      return;
    }
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      log("this browser will not let a page use the microphone — type the answers instead, or record on your phone and send the file.", "bad");
      return;
    }
    let stream = null;
    try{ stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch(e){ log("the microphone was refused (" + esc(e.name || e) + ") — nothing is recorded without it. Type the answers instead.", "bad"); return; }
    if(typeof MediaRecorder === "undefined"){
      stream.getTracks().forEach(function(tr){ tr.stop(); });
      log("this browser has no MediaRecorder — a voice note cannot be recorded here", "bad");
      return;
    }
    chunks = [];
    rec = new MediaRecorder(stream);
    rec.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function(){
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      const it = { file: blob, name: "voice-" + (state.voices.length + 1) + ".webm", size: blob.size, url: URL.createObjectURL(blob), ms: Date.now() - t0 };
      state.voices.push(it);
      soulPush("voice note", it.name, kb(blob.size));
      paintQueue(); paintRecs();
      stream.getTracks().forEach(function(tr){ tr.stop(); });
      st.textContent = "";
      btn.innerHTML = "● Record a voice note";
      log("voice note kept on this device — " + kb(blob.size) + " · " + r2(it.ms / 1000) + "s", "ok");
    };
    rec.start();
    t0 = Date.now();
    btn.innerHTML = "■ Stop recording";
    st.textContent = "recording…";
    log("recording — press stop when you are done");
  };
}
function paintRecs(){
  const box = $("recList");
  if(!state.voices.length){ box.innerHTML = ""; return; }
  box.innerHTML = state.voices.map(function(v, i){
    return '<div class="rec"><audio controls src="' + v.url + '"></audio><span>' + esc(v.name) + " · " + kb(v.size)
      + '</span><button class="tbtn sm" data-vc="' + i + '">✕</button></div>';
  }).join("");
  box.querySelectorAll("[data-vc]").forEach(function(b){
    b.onclick = function(){
      try{ URL.revokeObjectURL(state.voices[+b.dataset.vc].url); }catch(e){}
      state.voices.splice(+b.dataset.vc, 1);
      paintQueue(); paintRecs();
    };
  });
}

/* ============================================================= the handover */
function collect(){
  const t = state.trade || {};
  const read = {};
  const usable = state.videos.filter(function(v){ return v.meta && v.meta.ok; });
  read.videos = usable.length;
  read.stills = usable.reduce(function(a, v){ return a + v.stills.length; }, 0);
  read.skipped = state.videos.filter(function(v){ return v.meta && !v.meta.ok; }).map(function(v){ return v.name + " — " + v.meta.why; });
  const pulsed = usable.filter(function(v){ return v.pulse; });
  read.pulse = pulsed.length
    ? pulsed.map(function(v){
        const p = v.pulse;
        return esc(v.name) + ": " + mmss(p.dur) + " · motion peak " + Math.round(p.peak * 100) + "%"
          + (p.hasAudio ? " · loudness peak " + Math.round(p.audioPeak * 100) + "%" : " · MOTION ALONE" + (p.audioWhy ? " (" + p.audioWhy + ")" : ""))
          + " · " + ((v.picks || []).length ? (v.picks || []).length + " moment(s) cleared the stillness floor at " + (v.picks || []).map(function(k){ return mmss(k.peakT); }).join(", ") : "no moment cleared the stillness floor");
      }).join(" || ")
    : "";
  if(state.reel){
    read.reel = kb(state.reel.bytes) + " " + String(state.reel.container || "").toUpperCase() + " · " + state.reel.frames + " frames · "
      + r2(state.reel.verified && state.reel.verified.ok ? state.reel.verified.seconds : 0) + "s · "
      + (state.reel.verified && state.reel.verified.ok ? "read back playable at " + state.reel.verified.w + "×" + state.reel.verified.h : "UNVERIFIED — the browser would not read it back");
  }
  const materials = state.videos.map(function(v){
    const tail = (v.meta && v.meta.ok)
      ? (", " + mmss(v.meta.dur) + ", " + v.meta.w + "×" + v.meta.h)
      : (", SKIPPED — " + (v.meta ? v.meta.why : "not read"));
    return "video: " + v.name + " (" + kb(v.size) + tail + ")";
  }).concat(
    state.pics.map(function(p){ return "picture: " + p.name + " (" + kb(p.size) + ")"; }),
    state.voices.map(function(v){ return "voice note: " + v.name + " (" + kb(v.size) + ")"; })
  );
  const missing = [];
  if(!state.videos.length) missing.push("no walkthrough video was dropped at all — this is the one thing the page is built from");
  state.videos.forEach(function(v){
    if(v.meta && !v.meta.ok) missing.push("the video " + v.name + " could not be read here (" + v.meta.why + ") — it may work from another device, or as an mp4");
  });
  const answered = (t.answers || []).filter(function(q){ return (state.answers[q] || "").trim(); }).length;
  if((t.answers || []).length && !answered) missing.push("none of the questions were answered, in text or in a voice note");
  if(!state.links.length) missing.push("no links were given, so nothing could be checked against your existing presence");
  const shotCount = (t.shots || []).filter(function(_, i){ return state.shotsDone[t.id + ":" + i]; }).length;
  if((t.shots || []).length && shotCount < (t.shots || []).length) missing.push(shotCount + " of " + (t.shots || []).length + " of the recommended shots are not ticked as taken" + (shotCount ? "" : " — the reel may be short of material"));
  if(!state.reel) missing.push("no reel was rendered in this session");
  const answeredQ = [];
  (t.answers || []).forEach(function(q){ answeredQ.push(q); });

  const o = {
    who: (state.name || "").trim() || "(not given)",
    trade: t, at: state.started,
    where: "on the sender's own device",
    questions: answeredQ.length ? answeredQ : ((Object.keys(state.answers).length) ? Object.keys(state.answers) : (t.answers || [])),
    answers: state.answers,
    links: state.links.map(function(a){ return { address: a, note: "" }; }),
    materials: materials, read: read, missing: missing,
    shotCount: shotCount, shotTotal: (t.shots || []).length
  };
  return o;
}
async function makeBundle(doDownload){
  const o = collect();
  const entries = [];
  entries.push({ name: "brief.md", data: window.Bundle.brief(o) });
  entries.push({ name: "answers.json", data: JSON.stringify({ trade: o.trade.id, tradeLabel: o.trade.label, who: o.who, at: new Date(o.at).toISOString(), questions: o.questions, answers: o.answers, links: o.links, read: o.read, missing: o.missing }, null, 2) });
  entries.push({ name: "links.txt", data: state.links.length ? state.links.join("\n") : "(no links were given)" });
  entries.push({ name: "soul.json", data: JSON.stringify(soulLoad(), null, 1) });
  if(state.sheetBlob) entries.push({ name: "sheet.jpg", data: new Uint8Array(await state.sheetBlob.arrayBuffer()) });
  if(state.posterBlob) entries.push({ name: "cover.jpg", data: new Uint8Array(await state.posterBlob.arrayBuffer()) });
  if(state.reel) entries.push({ name: "reel." + (state.reel.container || "mp4"), data: new Uint8Array(await state.reel.blob.arrayBuffer()) });
  let i = 0;
  for(const v of state.videos){
    for(const s of (v.stills || [])){
      i++;
      entries.push({ name: "stills/" + String(i).padStart(2, "0") + "-" + mmss(s.t).replace(":", "m") + "s.jpg", data: new Uint8Array(await s.blob.arrayBuffer()) });
    }
  }
  for(const v of state.voices) entries.push({ name: "voice/" + v.name, data: new Uint8Array(await v.file.arrayBuffer()) });
  const blob = window.Bundle.zip(entries);
  if(doDownload !== false) window.Bundle.download("the-drop.zip", blob);
  const box = $("sendBox");
  box.innerHTML = "";
  const card = document.createElement("div");
  card.className = "tp-box";
  card.style.marginTop = "12px";
  card.innerHTML = "<h3>the bundle</h3>"
    + '<div class="pline"><b>made</b><span><b>' + window.Bundle.kb(blob.size) + "</b> · " + entries.length + " file(s), written on your device</span></div>"
    + '<div class="pline"><b>inside</b><span>' + entries.map(function(e){ return esc(e.name); }).join(" · ") + "</span></div>"
    + '<div class="pline"><b>next</b><span>it is in your downloads. Send it to me the way you already send things — WhatsApp, email, Drive. Then press the message button below so I know it is coming.</span></div>';
  box.appendChild(card);
  log("bundle written — <b>" + window.Bundle.kb(blob.size) + "</b>, " + entries.length + " files, all on your device", "ok");
  soulPush("bundle", entries.length + " files · " + window.Bundle.kb(blob.size), "sent from the desk");
  return blob;
}
function wireSend(){
  $("bundleBtn").onclick = function(){ makeBundle().catch(function(e){ log("the bundle could not be written: " + esc(e && e.message), "bad"); }); };
  $("briefBtn").onclick = function(){
    const o = collect();
    const text = window.Bundle.brief(o);
    const blob = new Blob([text], { type: "text/markdown" });
    window.Bundle.download("brief.md", blob);
    log("the brief is downloading as brief.md — plain text, nothing invented");
  };
  $("pingBtn").onclick = function(){
    const text = window.Bundle.ping(collect());
    const done = function(){
      $("pingBtn").textContent = "✉ Copied";
      setTimeout(function(){ $("pingBtn").textContent = "✉ Copy the short message"; }, 2200);
      log("the short message is on your clipboard — paste it into the chat with the bundle");
    };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text, done); });
    else fallbackCopy(text, done);
  };
  /* the WhatsApp link carries the message and lets the sender pick the chat —
     the desk does NOT invent a phone number to send to. A wrong number is worse
     than no number. */
  const upd = function(){
    const text = window.Bundle.ping(collect());
    $("waLink").href = "https://wa.me/?text=" + encodeURIComponent(text);
  };
  $("waLink").onclick = upd;
  setInterval(upd, 4000);
}
function fallbackCopy(text, done){
  try{
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); done();
  }catch(e){ log("could not copy automatically — open the brief and copy it from there", "warn"); }
}

/* ============================================================= the device check */
async function paintCaps(){
  const box = $("capsBox");
  box.hidden = false;
  const c = window.Trades.can(window);
  const rows = [
    ["reads files from disk", c.file, "the whole point — a file is read where it sits, so there is no size limit"],
    ["measures motion", c.canvas, "the pulse walks the frames on a canvas"],
    ["renders video", c.encode || c.record, c.encode ? "WebCodecs — fast, and it works with the tab in the background" : (c.record ? "MediaRecorder — real time, and the tab must stay in front" : "NO — this browser cannot render a reel, and the desk will say so rather than pretend")],
    ["microphone", c.mic, "for recording your answers out loud"],
    ["makes the bundle", c.zip, "a ZIP is written here, on your device"]
  ];
  box.innerHTML = '<div class="step">what this device can do</div>'
    + rows.map(function(r){
      return '<div class="pline"><b>' + (r[1] ? "✓" : "✗") + "</b><span>" + esc(r[0]) + " — " + esc(r[2]) + "</span></div>";
    }).join("")
    + '<div class="meta" id="capsDeep">measuring the encoders for a 1080×1920 reel…</div>';
  try{
    const cap = await window.Reel.caps(REEL_W, REEL_H, REEL_FPS);
    const el = $("capsDeep");
    if(el) el.innerHTML = "the encoder says: <b>" + esc(cap.reason) + "</b>";
    log("device check — " + esc(cap.reason));
  }catch(e){
    const el = $("capsDeep");
    if(el) el.textContent = "the encoder could not be asked: " + ((e && e.message) || e);
  }
}

/* ==================================================================== boot */
function boot(){
  /* The shell marks its start-hidden sections with class="hidden" (so a plain
     page hides them before any script runs). From here on, the desk drives
     visibility through the [hidden] ATTRIBUTE — which the stylesheet gives
     `!important`, exactly as the perchance engine does — so there is one
     mechanism, not two. Converted once, at boot, and never again. */
  [].slice.call(document.querySelectorAll(".hidden")).forEach(function(el){
    el.classList.remove("hidden");
    el.hidden = true;
  });
  paintOffer();
  paintGrid();
  paintSoul();
  wireDrop(); wireRead(); wireVoice(); wireSend();
  $("capsBtn").onclick = function(){ if($("capsBox").hidden) paintCaps(); else $("capsBox").hidden = true; };
  $("routeBtn").onclick = function(){ route($("whoInput").value); };
  $("whoInput").addEventListener("keydown", function(e){ if(e.key === "Enter") route($("whoInput").value); });
  $("tradeResetBtn").onclick = function(){ window.location.href = window.location.pathname; };

  /* the link can carry the trade (?t=hostel) and a name (?who=...), so a client
     can be sent a page that already knows what they are — the same page for
     everyone, read differently. */
  const q = new URLSearchParams(window.location.search);
  const t = q.get("t") || q.get("v") || q.get("trade");
  const who = q.get("who") || q.get("name");
  if(who){ state.name = who; }
  if(t){
    const hit = window.Trades.get(t);
    if(hit) selectTrade(hit);
    else {
      const r = window.Trades.find(t);
      log("nothing in the desk's list is called “" + esc(t) + "” — " + esc(r.why) + ". Choose below, or say what you do.", "warn");
    }
  }
  log("THE DROP is open. Nothing you drop here is uploaded: your browser reads the file where it sits, measures it here, and renders the reel here. The only thing that leaves is the bundle, when you send it.");
  log("device — " + (window.Trades.can(window).encode ? "<b>WebCodecs present</b> (fast render)" : (window.Trades.can(window).record ? "<b>MediaRecorder only</b> (real-time render, keep this tab in front)" : "<b>no video encoder in this browser</b> — the reel cannot be rendered here")), window.Trades.can(window).encode ? "ok" : "warn");
  window.Desk = {
    version: VERSION, state: state,
    trade: function(){ return state.trade; },
    select: selectTrade, route: route,
    read: runRead, reel: renderReel, bundle: makeBundle, zipBundle: function(){ return makeBundle(false); },
    brief: function(){ return window.Bundle.brief(collect()); },
    collect: collect, soul: soulLoad, log: log,
    /* Feeding the desk from code — the way the station drives this page in a
       harness, and the way a future in-page capture (a phone's own recorder)
       would hand material over. Files must be real File/Blob objects. */
    addVideos: queueVideos, addPics: queuePics,
    addVoice: function(blob, name){
      const it = { file: blob, name: name || ("voice-" + (state.voices.length + 1) + ".webm"), size: blob.size, url: URL.createObjectURL(blob) };
      state.voices.push(it); soulPush("voice note", it.name, kb(blob.size));
      paintQueue(); paintRecs();
      return it;
    },
    setLinks: function(list){
      state.links = (list || []).map(function(s){ return String(s).trim(); }).filter(Boolean);
      if($("linksInput")) $("linksInput").value = state.links.join("\n");
      return state.links;
    },
    setName: function(n){ state.name = String(n || ""); if($("nameInput")) $("nameInput").value = state.name; },
    setAnswers: function(o){
      Object.keys(o || {}).forEach(function(k){ state.answers[k] = o[k]; });
      paintAnswers();
    },
    /* the hook the station uses when it drives this page in a harness */
    feed: function(o){
      if(!o) return;
      if(o.trade) selectTrade(window.Trades.get(o.trade) || window.Trades.find(o.trade).trade);
      if(o.answers) window.Desk.setAnswers(o.answers);
      if(o.links) window.Desk.setLinks(o.links);
      if(o.name) window.Desk.setName(o.name);
    }
  };
  const links = $("linksInput");
  if(links){
    links.onchange = function(){
      state.links = links.value.split(/\n+/).map(function(s){ return s.trim(); }).filter(Boolean);
      soulPush("links", state.links.join(" · "), state.links.length + " address(es) given on the desk");
      log("links recorded here — <b>" + state.links.length + "</b>. The desk does not read them: your browser is not allowed to read other people's pages cross-wise, and claiming to have read them would be a lie. The reading happens on my side.", "ok");
    };
  }
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();
