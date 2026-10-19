/* ============================================================================
   VIDEO NODE — the build division's eye (role: video).

   ONE JOB. A video goes in; stills, a contact sheet, vertical shorts, and the
   vibe in words come out. The footage never leaves the machine.

   WHY THIS EXISTS (the sovereign's own words): "I cannot attach the videos
   because 20MB is too big? fix that by making possible in the generator." The
   editor's chat attachment cap does not exist in here — a file chosen from disk
   is read by the browser with the File API, so a 10 GB file is exactly as
   possible as a 10 KB one, and nothing is uploaded to do it.

   The four rules it inherits from every other role (src/generators/README.md):
     · SOUL FIRST (L37/L38/L39). The source file is DESCRIBED and recorded
       verbatim into obi_sdnad before a single frame is pulled — the material is
       a sovereign word. Never uploaded, never edited.
     · FAIL CLOSED. No file → nothing is claimed. A browser that cannot capture a
       clip says so and cuts no shorts. A silent clip is labelled silent.
     · IT MEASURES. Every still, short and sheet carries its real byte count and
       real dimensions — never "done" without a number beside it.
     · IT DOES NOT LIE ABOUT THE MODEL. The vibe comes from the vision model
       looking at the contact sheet; if the model did not answer, the card says
       so instead of inventing words.

   THE VIBE IN WORDS is the reason the node exists in the family: the sheet is
   one image that holds the whole file's look, so ONE vision call returns the
   vibe, the art direction, a palette and a brief — and that brief is what the
   Site Builder takes (?brief=). Mailala was built from exactly this move.

   MANY VIDEOS, ONE SHOT (the sovereign: "drop multiple larger videos in and it
   can do it all in one shot … capture smaller video clips of the vibes and
   dancing ect, make it intelligent"). Every dropped video becomes a QUEUE ITEM
   with its own object URL, its own <video> and its own results, and ONE of them
   is the active source at a time — so nothing is ever read into memory and a
   4 GB file costs what a 4 MB one costs. /sweep walks the whole queue in one
   pass: stills → MEASURE → the sheet → the eye → the clips → the reel → the
   story → the render.

   AND IT IS MEASURED, NOT GUESSED (src/pulse.js): the clip chooser does not cut
   clips at even intervals and call them "the vibes". The file is walked on a
   small canvas and its frame-to-frame luma change is the MOTION curve; its audio
   is decoded (when the file is small enough to read whole) and its loudness is
   the second curve; both are normalised against the file's own floor and peak.
   The clips come from the busiest windows, EVERY CLIP PRINTS THE NUMBERS IT WAS
   CHOSEN ON, and the vision pass — shown the sheet with a timecode on every tile
   — names the moments it can actually SEE, which are folded in as the eye's own
   picks. A metric never gets to call itself "dancing"; that word comes from the
   eye, and it is quoted as the eye's.
   ========================================================================== */
(function(){
  "use strict";

  const MEM_KEY   = "obi_sdnad";        /* the same ledger the station reads — whole is one */
  const LIB_KEY   = "obi_video_lib";    /* local mirror of the kv folder */
  const VOICE_KEY = "obi_video_voice";
  const BUILDER   = "site-builder";     /* the wing that takes the brief (?brief=) */

  const state = {
    file:null, url:null, video:null, probe:null,
    nFrames:12, maxW:960, nShorts:3, shortLen:15, crop:"9:16",
    frames:[], sheet:null, shorts:[], vibeText:"", brief:"", tiles:[], moments:[],
    /* the reel */
    shots:[], shotBmp:{}, bed:null, bedName:"", reel:null, preview:null, job:null,
    caps:null, stage:"source",
    reelUI:{ aspect:"9:16", per:"2.6", trans:"0.5", motion:"auto", fit:"cover", res:"1080", fps:"30",
             extra:{ vignette:true, bar:true, cards:false } },
    /* the story */
    offer:null, story:null, storyLive:"",
    /* the pulse (src/pulse.js) — measured, never assumed */
    pulse:null,
    busy:false, cancel:false, voice:true, durable:false
  };

  /* ==========================================================================
     THE QUEUE. Several videos, dropped at once, walked one at a time.

     The node used to hold exactly one source: the last file dropped evicted the
     one before it. The sovereign's ask was the opposite — "drop multiple larger
     videos in and it can do it all in one shot". So every dropped video becomes
     a QUEUE ITEM: its own object URL, its own <video> element, its own stills,
     sheet, pulse, clips, vibe and brief. Exactly ONE item is the ACTIVE source
     (the one on the stage, the one the buttons work on); `activate()` swaps the
     active item's results into the state the rest of this file already uses.

     NOTHING IS EVER READ WHOLE INTO MEMORY except a file small enough for the
     optional loudness pass (see pulse.js). A 4 GB video costs this node the same
     as a 4 MB one: an object URL and a <video> element pointed at it.
     ========================================================================== */
  const Q = { items:[], active:null, seq:0 };

  /* the batch's knobs, mirrored by the chips in the queue card */
  const batch = { running:false, cancel:false, phase:"", opts:{ perVideo:12, peaks:4, clips:3, clipLen:5, audio:"auto", reel:"8", sell:"story" } };

  function $(id){ return document.getElementById(id); }
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]; });
  }
  function kb(n){
    n = n || 0;
    if(n < 1024) return n + " B";
    if(n < 1024*1024) return (n/1024).toFixed(1) + " KB";
    return (n/1024/1024).toFixed(2) + " MB";
  }
  function secs(s){
    s = Math.max(0, Number(s) || 0);
    const m = Math.floor(s/60), r = Math.round(s % 60);
    return (m ? m + "m " : "") + r + "s";
  }

  /* =========================================================== the ledger */
  function loadLedger(){ try{ return JSON.parse(localStorage.getItem(MEM_KEY) || "null") || { runs:[], soul:[] }; }catch(e){ return { runs:[], soul:[] }; } }
  function saveLedger(L){ try{ localStorage.setItem(MEM_KEY, JSON.stringify(L)); }catch(e){} }
  let ledger = loadLedger();

  function currentRun(){
    const last = ledger.runs.length ? ledger.runs[ledger.runs.length-1] : null;
    const now = new Date().toDateString();
    if(!last || new Date(last.t).toDateString() !== now){
      const run = { run: ledger.runs.length + 1, t: Date.now(), closed:false, soulCount:0 };
      ledger.runs.push(run); saveLedger(ledger); return run;
    }
    return last;
  }
  const curRun = currentRun();
  const runNo = curRun.run;

  function captureSoul(text, footnote){
    const entry = { t: Date.now(), role:"sovereign", run: runNo, text: String(text), footnote: footnote || null };
    curRun.soulCount = (curRun.soulCount || 0) + 1;
    ledger.soul.push(entry);
    if(ledger.soul.length > 400) ledger.soul = ledger.soul.slice(-400);
    saveLedger(ledger);
    if(window.CGN && window.CGN.push) window.CGN.push().catch(function(){});
    return entry;
  }
  function soulCount(){ return ledger.soul.filter(function(e){ return e.role === "sovereign"; }).length; }

  /* =========================================================== the library */
  const lib = { rows:[], durable:false, folder:null };
  async function libLoad(){
    let rows = [];
    try{
      if(window.root && window.root.kv && window.root.kv.videos){
        lib.folder = window.root.kv.videos;
        for(const e of await lib.folder.entries()){
          const v = e && e.value !== undefined ? e.value : e;
          if(v && typeof v === "object") rows.push(v);
        }
        lib.durable = true;
      }
    }catch(e){ lib.durable = false; }
    if(!rows.length){ try{ rows = JSON.parse(localStorage.getItem(LIB_KEY) || "[]") || []; }catch(e){ rows = []; } }
    lib.rows = rows.slice(0, 12);
    paintLib();
  }
  async function libSave(){
    lib.rows = lib.rows.slice(0, 12);
    try{ localStorage.setItem(LIB_KEY, JSON.stringify(lib.rows)); }catch(e){}
    try{
      if(lib.folder){
        const pairs = lib.rows.map(function(r){ return [String(r.id), r]; });
        if(lib.folder.setMany) await lib.folder.setMany(pairs);
        else for(const p of pairs) await lib.folder.set(p[0], p[1]);
        lib.durable = true;
      }
    }catch(e){ lib.durable = false; }
  }

  /* =========================================================== chrome */
  function log(msg, cls){
    const el = $("logBody"); if(!el) return;
    const d = document.createElement("div");
    d.className = "ln" + (cls ? " " + cls : "");
    d.textContent = msg;
    el.appendChild(d); el.scrollTop = el.scrollHeight;
  }
  function toast(msg, cls){
    const el = $("toastEl"); if(!el) return;
    const d = document.createElement("div");
    d.className = "toast" + (cls ? " " + cls : "");
    d.textContent = msg;
    el.appendChild(d);
    setTimeout(function(){ d.remove(); }, 3800);
  }
  function speak(t){
    if(!state.voice || !window.speechSynthesis) return;
    try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(t)); u.rate = 1.02; speechSynthesis.speak(u); }catch(e){}
  }
  function paintStats(){
    const el = $("statsEl"); if(!el) return;
    el.innerHTML = "RUN <b>" + runNo + "</b> · soul <b>" + soulCount() + "</b> · queue <b>" + Q.items.length + "</b> · stills <b>" + state.frames.length + "</b> · clips <b>" + state.shorts.length + "</b> · reel <b>" + state.shots.length + "</b> · files <b>" + lib.rows.length + "</b>" + (lib.durable ? "" : " · ⚠ not durable");
  }
  function paintProbe(){
    const el = $("probeBox"); if(!el) return;
    const p = state.probe;
    if(!p){ el.innerHTML = ""; return; }
    const cell = function(k, v){ return '<div class="p"><b>' + k + '</b><span>' + esc(v) + '</span></div>'; };
    el.innerHTML =
      cell("file", p.name) +
      cell("size", kb(p.size)) +
      cell("type", p.type || "unknown") +
      cell("frame", p.w + " × " + p.h) +
      cell("ratio", p.w && p.h ? (p.w > p.h ? "landscape" : "portrait") : "unknown") +
      cell("length", p.duration ? secs(p.duration) : "unknown") +
      cell("capture", p.canCapture ? "yes" : "NO — clips blocked") +
      cell("mime", p.mime || "—");
  }
  function paintFrames(){
    const el = $("frameList"); if(!el) return;
    const m = $("frameMeta");
    if(m) m.innerHTML = state.frames.length ? "<b>" + state.frames.length + "</b> still(s) · " + kb(state.frames.reduce(function(a,f){ return a + f.bytes; }, 0)) : "";
    if(!state.frames.length){ el.innerHTML = '<div class="hint">No stills yet.</div>'; return; }
    el.innerHTML = state.frames.map(function(f,i){
      return '<div class="fr"><img src="' + f.url + '" alt="still at ' + f.t.toFixed(2) + 's" loading="lazy">' +
             '<span class="t">' + f.t.toFixed(2) + 's</span><button class="d" data-frdl="' + i + '" title="download">⬇</button></div>';
    }).join("");
    el.querySelectorAll("[data-frdl]").forEach(function(b){
      b.onclick = function(){ download(state.frames[+b.dataset.frdl].blob, "still-" + String(+b.dataset.frdl + 1).padStart(2,"0") + ".jpg"); };
    });
  }
  function paintShorts(){
    const el = $("shortList"); if(!el) return;
    const m = $("shortMeta");
    if(m) m.innerHTML = state.shorts.length ? "<b>" + state.shorts.length + "</b> clip(s) · " + kb(state.shorts.reduce(function(a,s){ return a + s.bytes; }, 0)) : "";
    if(!state.shorts.length){ el.innerHTML = '<div class="hint">No clips yet.</div>'; return; }
    el.innerHTML = state.shorts.map(function(s,i){
      const thumb = s.poster ? '<img class="th" src="' + s.poster.url + '" alt="">' : '<video src="' + s.url + '" muted playsinline preload="metadata"></video>';
      return '<div class="short">' + thumb +
             '<div class="sh-main"><span class="nm">clip-' + String(i+1).padStart(2,"0") + " · " + s.len.toFixed(1) + "s"
             + (isFinite(s.start) ? " @ " + s.start.toFixed(1) + "s" : "") + (s.muted ? " · SILENT" : "") + " · " + kb(s.bytes) + " " + esc(s.ext || "") + '</span>' +
             (s.why ? '<span class="why">' + esc(s.why) + '</span>' : '<span class="why">even spacing — nothing was measured for this file</span>') +
             '</div>' +
             '<button class="x" data-shdl="' + i + '" title="download">⬇</button></div>';
    }).join("");
    el.querySelectorAll("[data-shdl]").forEach(function(b){
      b.onclick = function(){ const s = state.shorts[+b.dataset.shdl]; download(s.blob, "clip-" + String(+b.dataset.shdl + 1).padStart(2,"0") + (s.ext || ".webm")); };
    });
  }
  function paintLib(){
    const el = $("libBody"); if(!el) return;
    if(!lib.rows.length){ el.innerHTML = '<div class="hint">No files filed yet.</div>'; return; }
    el.innerHTML = lib.rows.map(function(r,i){
      return '<div class="sb-file"><span class="nm" title="' + esc(r.note || "") + '">🎞 ' + esc(String(r.name || "?").slice(0, 44)) + '</span>' +
             '<span class="sz">' + (r.frames||0) + "f · " + (r.shorts||0) + "s · " + kb(r.size||0) + '</span>' +
             '<button class="x" data-libdel="' + i + '" title="forget">✕</button></div>';
    }).join("");
    el.querySelectorAll("[data-libdel]").forEach(function(b){
      b.onclick = async function(){ lib.rows.splice(+b.dataset.libdel, 1); await libSave(); paintLib(); paintStats(); toast("Forgotten"); };
    });
  }
  function paintStage(){
    const stage = $("stage"), meta = $("stageMeta");
    if(!stage) return;
    if(!state.video){
      stage.innerHTML = '<div class="sb-empty">No file yet. Drop one above — it is read from your disk and never uploaded.</div>';
      if(meta) meta.textContent = "";
      return;
    }
    /* the ACTIVE queue item's element goes up: the previous one is taken down,
       so switching between queued videos never stacks two <video>s in here */
    if(state.video.parentNode !== stage){ stage.innerHTML = ""; stage.appendChild(state.video); }
    if(meta) meta.innerHTML = state.probe ? "<b>" + esc(state.probe.name) + "</b> · " + secs(state.probe.duration) : "";
  }
  function paintVibe(){
    const el = $("vibeBody"), m = $("vibeMeta");
    if(el) el.textContent = state.vibeText || "";
    if(m) m.innerHTML = state.vibeText ? "<b>" + state.vibeText.split(/\s+/).length + "</b> words" : "";
    const h = $("handBtn"); if(h) h.hidden = !state.brief;
  }

  /* =========================================================== the queue */
  function isVideoFile(f){
    return /^video\//.test((f && f.type) || "") || /\.(mp4|mov|webm|mkv|m4v|avi|ogv|3gp)$/i.test((f && f.name) || "");
  }
  function isImageFile(f){
    return /^image\//.test((f && f.type) || "") || /\.(jpe?g|png|webp|gif|avif|bmp|heic)$/i.test((f && f.name) || "");
  }
  function mkItem(file){
    return {
      id:"v" + (++Q.seq), file:file, name:file.name, size:file.size, type:file.type || "",
      url:null, video:null, probe:null, status:"queued", err:"",
      frames:[], sheet:null, shorts:[], vibe:"", tiles:[], brief:"", moments:[],
      pulse:null, clipPlan:[], note:"", t0:0, t1:0
    };
  }
  /* every video dropped gets its OWN object URL and its OWN <video>. The file is
     handed to the browser off the disk exactly once and never held as bytes. */
  function armItem(it, quiet){
    const url = URL.createObjectURL(it.file);
    it.url = url;
    const v = document.createElement("video");
    v.src = url; v.controls = true; v.playsInline = true; v.preload = "metadata";
    v.style.width = "100%"; v.style.background = "#000";
    it.video = v;
    armProbe(v, it.file, { item:it, quiet:!!quiet });
  }
  function addVideos(files, opts){
    opts = opts || {};
    const list = Array.prototype.slice.call(files || []).filter(isVideoFile);
    if(!list.length) return [];
    const made = [];
    list.forEach(function(f, i){
      const it = mkItem(f);
      armItem(it, !(Q.items.length === 0));
      Q.items.push(it); made.push(it);
      /* SOUL FIRST — the file is described verbatim before anything is taken
         from it. One entry per file, so a drop of twenty is twenty records. */
      captureSoul("SOURCE QUEUED: " + f.name + " · " + f.size + " bytes · " + (f.type || "unknown type") +
                  " · item " + Q.items.length + " of the drop",
                  "video node · run " + runNo + " · read locally, never uploaded");
      log("queued " + (i + 1) + "/" + list.length + " — " + f.name + " · " + kb(f.size) +
          (list.length > 1 ? " · it waits its turn; nothing is read ahead of it" : ""), "gd");
    });
    if(!Q.active) activate(Q.items[0], true);
    paintQueue(); paintStats(); paintBatch();
    if(made.length > 1){
      toast(made.length + " videos queued — " + kb(made.reduce(function(a, x){ return a + x.size; }, 0)) + " in all, read one at a time.", "ok");
      speak(made.length + " videos are in the queue.");
    }
    return made;
  }
  function releaseItem(it){
    if(!it) return;
    if(it.url) try{ URL.revokeObjectURL(it.url); }catch(e){}
    (it.frames || []).forEach(function(f){ try{ URL.revokeObjectURL(f.url); }catch(e){} });
    (it.shorts || []).forEach(function(s){
      try{ URL.revokeObjectURL(s.url); }catch(e){}
      if(s.poster) try{ URL.revokeObjectURL(s.poster.url); }catch(e){}
    });
    if(it.sheet) try{ URL.revokeObjectURL(it.sheet.url); }catch(e){}
    if(it.video){ try{ it.video.pause(); it.video.removeAttribute("src"); it.video.load(); }catch(e){} }
  }
  function removeItem(it){
    const i = Q.items.indexOf(it);
    if(i < 0) return;
    const wasActive = Q.active === it;
    releaseItem(it);
    Q.items.splice(i, 1);
    if(wasActive){
      Q.active = null;
      state.file = null; state.url = null; state.video = null; state.probe = null;
      state.frames = []; state.sheet = null; state.shorts = []; state.vibeText = ""; state.brief = "";
      state.tiles = []; state.moments = []; state.pulse = null;
      const next = Q.items[Math.min(i, Q.items.length - 1)];
      if(next) activate(next, true);
      else { paintStage(); paintProbe(); paintFrames(); paintShorts(); paintVibe(); }
      const sw = $("sheetWrap"); if(sw) sw.hidden = !state.sheet;
    }
    log("taken out of the queue — its object URLs are released", "nt");
    paintQueue(); paintStats(); paintBatch();
  }
  /* the ACTIVE item is the one on the stage and the one the buttons work on.
     Swapping items swaps their results into the state the rest of this file
     already used for a single file — so every panel keeps working unchanged. */
  function stash(){
    const a = Q.active; if(!a) return;
    a.frames = state.frames; a.sheet = state.sheet; a.shorts = state.shorts;
    a.vibe = state.vibeText; a.brief = state.brief;
    a.tiles = state.tiles || []; a.moments = state.moments || [];
    a.pulse = state.pulse;
  }
  function activate(it, quiet){
    if(!it) return null;
    if(Q.active === it) return it;
    stash();
    Q.active = it;
    state.file = it.file; state.url = it.url; state.probe = it.probe; state.video = it.video;
    state.frames = it.frames || []; state.sheet = it.sheet || null; state.shorts = it.shorts || [];
    state.vibeText = it.vibe || ""; state.brief = it.brief || "";
    state.tiles = it.tiles || []; state.moments = it.moments || []; state.pulse = it.pulse || null;
    paintStage(); paintProbe(); paintFrames(); paintShorts(); paintVibe();
    const sw = $("sheetWrap"), si = $("sheetImg");
    if(sw && si){ if(state.sheet){ si.src = state.sheet.url; sw.hidden = false; } else sw.hidden = true; }
    const cb = $("clearBtn"); if(cb) cb.hidden = false;
    const zb = $("zipBtn"); if(zb) zb.hidden = !state.frames.length;
    paintQueue(); paintStats();
    if(!quiet)
      log("now reading " + it.name + " — item " + (Q.items.indexOf(it) + 1) + " of " + Q.items.length +
          (it.frames.length ? " · its stills, sheet and clips are back on the page" : ""), "gd");
    return it;
  }
  /* the metadata watcher. A tab in the BACKGROUND never gets it — Chrome defers
     media loading in a hidden document — so a queued file that never loads is
     SKIPPED and named, never left as a spinner. */
  function ensureProbe(it, timeoutMs){
    if(!it) return Promise.resolve(null);
    if(it.probe) return Promise.resolve(it.probe);
    if(it.status === "failed") return Promise.resolve(null);
    const t0 = Date.now();
    return new Promise(function(res){
      const tick = function(){
        if(it.probe) return res(it.probe);
        if(it.status === "failed") return res(null);
        if(batch.cancel || state.cancel) return res(null);
        if(Date.now() - t0 > (timeoutMs || 25000)){
          it.status = "failed"; it.err = "the metadata never arrived (a background tab defers media loading)";
          log(it.name + " — the browser has not handed over its metadata in " + Math.round((Date.now() - t0) / 1000) +
              "s. A tab in the BACKGROUND never does: Chrome defers media loading in a hidden document. This file is SKIPPED, " +
              "not judged. Bring the tab to the front and run it again.", "bad");
          paintQueue(); paintBatch();
          return res(null);
        }
        setTimeout(tick, 250);
      };
      tick();
    });
  }

  /* =========================================================== file intake */
  function pickFile(file){
    if(!file){ return; }
    /* a picture is not a source file — it is reel material, and it never goes
       near the video probe. The node takes both through the same door. */
    if(isImageFile(file) && !isVideoFile(file)){
      if(!state.shots.length) showStage("reel");
      addImageFiles([file]);
      return;
    }
    const made = addVideos([file]);
    if(made.length) activate(made[0]);
  }
  /* The browser is the one that decides when a file's metadata arrives — and it
     DEFERS media loading while the tab is in the background, which is a state the
     sovereign will hit by accident. So the probe is armed here, watched, and can
     be re-armed from the button: a stall is REPORTED, never left as a spinner. */
  function armProbe(v, file, opts){
    opts = opts || {};
    const it = opts.item || null;
    const mine = !it || Q.active === it;      /* is this the file on the stage? */
    v.onloadedmetadata = function(){
      const probe = {
        name:file.name, size:file.size, type:file.type || "",
        w:v.videoWidth, h:v.videoHeight,
        duration:(isFinite(v.duration) ? v.duration : 0),
        canCapture: !!(v.captureStream || v.mozCaptureStream),
        mime: pickMime()
      };
      if(it){ it.probe = probe; it.watchdog = false; if(it.status === "queued") it.status = "ready"; }
      if(state.video === v){
        state.probe = probe; state.watchdog = false;
        paintProbe(); paintStage(); paintStats();
        const clear = $("clearBtn"); if(clear) clear.hidden = false;
      }
      if(!isFinite(probe.duration) || probe.duration <= 0) resolveDuration(v, probe, it);
      const canCap = probe.canCapture;
      if(mine){
        log("source — " + file.name + " · " + kb(file.size) + " · " + (probe.w + "×" + probe.h) +
            " · " + (probe.duration ? secs(probe.duration) : "length unknown") + " · read locally, nothing uploaded", "gd");
        if(!canCap)
          log("this browser cannot capture a clip from a <video> (no captureStream): stills and the sheet work, clips read BLOCKED", "nt");
        toast("Source read — " + kb(file.size) + ". Nothing was uploaded.", "ok");
      } else {
        log("· " + file.name + " is ready — " + probe.w + "×" + probe.h + " · " + (probe.duration ? secs(probe.duration) : "length unknown"), "gd");
      }
      paintQueue(); paintBatch();
    };
    v.onerror = function(){
      if(it){ it.watchdog = false; it.status = "failed"; it.err = "the browser could not decode this file"; }
      if(state.video === v) state.watchdog = false;
      log("the browser could not decode " + file.name + " — not a video it understands, or the file is damaged. No claim is made about its contents.", "bad");
      if(mine) toast("That file could not be decoded.", "bad");
      paintQueue();
    };
    /* the watchdog: silence is a state, and it gets a name */
    if(it) it.watchdog = true; else state.watchdog = true;
    setTimeout(function(){
      const pending = it ? it.watchdog : state.watchdog;
      if(!pending || (it ? it.probe : state.probe)) return;
      if(it) it.watchdog = false; else state.watchdog = false;
      if(!mine) return;
      log("the browser has not handed over " + file.name + "'s metadata yet. Chrome defers media loading while this tab is in the BACKGROUND — bring the tab to the front and press ↻ Re-probe. Nothing is claimed about the file until it loads.", "nt");
      toast("The file has not loaded yet — is this tab in the background?", "nt");
    }, 7000);
  }
  /* A FILE WHOSE LENGTH IS NOT IN ITS HEADER. A WebM written by MediaRecorder —
     which is what a phone clip or a screen recording often is — carries no
     duration, so the browser reports `Infinity` and everything downstream (the
     pulse, the clips) would have no timeline to work on. The browser is MADE to
     work it out: seeking far past the end forces it to read to the end of the
     file, and then it knows. Bounded to a few seconds, and either way the log
     says what happened — the node never quietly treats an unknown length as zero. */
  function resolveDuration(v, probe, it){
    let settled = false;
    const finish = function(viaSeek){
      if(settled) return; settled = true;
      try{ v.removeEventListener("durationchange", onDC); }catch(e){}
      const fromMeta = isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
      const fromSeek = (viaSeek && isFinite(v.currentTime) && v.currentTime > 0) ? v.currentTime : 0;
      const d = fromMeta || fromSeek;
      const mine = (state.video === v);
      if(d > 0){
        probe.duration = d;
        probe.durationVia = fromMeta ? "the header, after the browser was made to read the file" : "the seek it clamped to — there is no duration in the header at all";
        if(it) it.probe = probe;
        if(mine) state.probe = probe;
        log("the length of " + probe.name + " was not in its header (a WebM written by MediaRecorder does that) — it is " + secs(d) +
            " by " + (fromMeta ? "reading the file through" : "the end the browser clamped the seek to"), "gd");
        if(mine){ paintProbe(); paintStage(); }
        paintQueue(); paintBatch();
      } else {
        log("the length of " + probe.name + " could not be worked out — the browser will not report it. Everything that needs a timeline " +
            "(the pulse, the clips) will say so rather than guess, and the stills will be pulled by position instead.", "nt");
      }
      setTimeout(function(){ try{ if(v.currentTime > 0.5) v.currentTime = 0; }catch(e){} }, 400);
    };
    const onDC = function(){ if(isFinite(v.duration) && v.duration > 0) finish(false); };
    v.addEventListener("durationchange", onDC);
    try{ v.currentTime = 1e7; }catch(e){ finish(false); return; }
    setTimeout(function(){ finish(true); }, 7000);
  }
  function clearSource(quiet){
    /* ✕ Clear releases THE ACTIVE SOURCE — its object URLs are revoked and its
       entry leaves the queue. Every other queued file is left exactly as it is,
       because dropping twenty videos and clearing one must not clear twenty. */
    const a = Q.active;
    if(a){
      releaseItem(a);
      const i = Q.items.indexOf(a);
      if(i >= 0) Q.items.splice(i, 1);
      Q.active = null;
    }
    state.file = null; state.url = null; state.video = null; state.probe = null;
    state.frames = []; state.shorts = []; state.sheet = null; state.vibeText = ""; state.brief = "";
    state.tiles = []; state.moments = []; state.pulse = null;
    const sw = $("sheetWrap"); if(sw) sw.hidden = true;
    const cb = $("clearBtn"); if(cb) cb.hidden = true;
    const next = Q.items[0];
    if(next) activate(next, true);
    else { paintStage(); paintProbe(); paintFrames(); paintShorts(); paintVibe(); }
    paintQueue(); paintStats(); paintBatch();
    if(!quiet) log("cleared — the source's object URLs are released" + (Q.items.length ? ", and " + Q.items.length + " file(s) are still queued" : " (the queue is empty)"), "gd");
  }

  /* =========================================================== stills */
  function seek(v, t){
    return new Promise(function(res){
      let done = false;
      const finish = function(){ if(done) return; done = true; v.removeEventListener("seeked", finish); res(); };
      v.addEventListener("seeked", finish);
      try{ v.currentTime = Math.max(0, t); }catch(e){ finish(); return; }
      setTimeout(finish, 5000);   /* never hang the run on one bad seek */
    });
  }
  function drawInto(v, canvas, maxW, crop){
    const vw = v.videoWidth || 1280, vh = v.videoHeight || 720;
    let sw = vw, sh = vh, sx = 0, sy = 0;
    if(crop === "9:16"){
      sw = Math.min(vw, Math.round(vh * 9 / 16)); sh = vh; sx = Math.round((vw - sw) / 2);
    }
    const scale = Math.min(1, maxW / sw);
    canvas.width = Math.max(2, Math.round(sw * scale));
    canvas.height = Math.max(2, Math.round(sh * scale));
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  function canvasBlob(canvas, type, q){
    return new Promise(function(res){ canvas.toBlob(function(b){ res(b); }, type || "image/jpeg", q == null ? 0.95 : q); });
  }
  /* the stills, in the file's own order, each carrying the SHEET TILE it became.
     A picture's tile index is what binds the eye's one-line-per-tile reading to
     the right picture, so the order here is the order of the sheet. */
  function indexFrames(){
    state.frames.sort(function(a, b){ return (a.t || 0) - (b.t || 0); });
    state.frames.forEach(function(f, i){ f.tile = i; });
    if(Q.active) Q.active.frames = state.frames;
    return state.frames;
  }
  async function grabFrames(n, maxW, opts){
    opts = opts || {};
    if(!state.video || !state.probe){ if(!opts.quiet) toast("Drop a video first.", "bad"); return null; }
    if(state.busy){ if(!opts.quiet) toast("Still working — let it finish.", "bad"); return null; }
    n = n || state.nFrames; maxW = maxW || state.maxW;
    state.busy = true;
    const btn = $("framesBtn"); if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Pulling…'; }
    const v = state.video;
    const dur = state.probe.duration;
    log("pulling " + n + " stills at up to " + maxW + "px" + (dur ? " across " + secs(dur) : "") + "…");
    const canvas = document.createElement("canvas");
    const out = [];
    try{
      for(let i = 0; i < n; i++){
        if(state.cancel) break;
        const t = dur ? dur * (i + 0.5) / n : i * 2;
        await seek(v, t);
        drawInto(v, canvas, maxW, "source");
        const blob = await canvasBlob(canvas, "image/jpeg", 0.95);
        if(!blob) continue;
        out.push({ t:(v.currentTime || t), blob:blob, url:URL.createObjectURL(blob), bytes:blob.size, w:canvas.width, h:canvas.height });
      }
    }catch(e){
      log("the pull stopped: " + ((e && e.message) || e), "bad");
    }
    state.frames = out;
    state.busy = false;
    if(btn){ btn.disabled = false; btn.innerHTML = "✦ Grab the stills"; }
    indexFrames();
    paintFrames(); paintStats();
    const zb = $("zipBtn"); if(zb) zb.hidden = !out.length;
    if(!out.length){ log("no stills came out — the file gave the browser nothing to draw. Nothing is claimed.", "bad"); return null; }
    log("stills — " + out.length + " image(s), " + kb(out.reduce(function(a,f){ return a + f.bytes; }, 0)) + " · " + out[0].w + "×" + out[0].h, "ok");
    if(!opts.quiet){ toast(out.length + " stills pulled", "ok"); speak("The stills are out."); }
    if(Q.active) paintQueue();
    return out;
  }
  /* stills at GIVEN moments — the ones the pulse says are busy, or the ones the
     eye named. APPENDED to the stills already pulled, then the whole list is put
     back in time order so the sheet still reads like the file does. */
  async function grabFramesAt(times, maxW, opts){
    opts = opts || {};
    if(!state.video || !state.probe || !times || !times.length) return [];
    const v = state.video;
    const dur = state.probe.duration || 0;
    const canvas = document.createElement("canvas");
    const out = [];
    const have = function(t){
      return state.frames.some(function(f){ return Math.abs((f.t || 0) - t) < 0.35; });
    };
    for(const raw of times){
      if(state.cancel) break;
      const t = Math.max(0, Math.min(dur ? dur - 0.05 : raw, raw));
      if(have(t)) continue;
      try{
        await seek(v, t);
        drawInto(v, canvas, maxW || state.maxW, "source");
        const blob = await canvasBlob(canvas, "image/jpeg", 0.95);
        if(!blob) continue;
        out.push({ t:(v.currentTime || t), blob:blob, url:URL.createObjectURL(blob), bytes:blob.size,
                   w:canvas.width, h:canvas.height, atPeak:true });
      }catch(e){}
    }
    if(out.length){
      state.frames = state.frames.concat(out);
      indexFrames(); paintFrames(); paintStats();
      if(Q.active) paintQueue();
    }
    return out;
  }

  /* the EYE'S COPY of the sheet. A vision endpoint takes a small image and drops
     an oversized one on the floor without saying so — measured, not guessed: a
     21-megapixel sheet came back as "please provide the image". So the model is
     sent a readable copy (long edge ~1600, under 3.5 MB) and the size it was
     actually sent at is printed beside the sheet's own size. */
  async function eyeCopy(canvas){
    const ladder = [[1568, 0.85], [1120, 0.82], [840, 0.80], [640, 0.78]];
    for(const step of ladder){
      const sc = Math.min(1, step[0] / Math.max(canvas.width, canvas.height));
      const c2 = document.createElement("canvas");
      c2.width = Math.max(2, Math.round(canvas.width * sc));
      c2.height = Math.max(2, Math.round(canvas.height * sc));
      const x = c2.getContext("2d");
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
      x.drawImage(canvas, 0, 0, c2.width, c2.height);
      const blob = await canvasBlob(c2, "image/jpeg", step[1]);
      if(blob && blob.size <= 3.5 * 1024 * 1024) return { blob:blob, w:c2.width, h:c2.height, bytes:blob.size };
    }
    return null;
  }

  /* =========================================================== the sheet */
  async function buildSheet(perRow, opts){
    opts = opts || {};
    /* the sheet is the material, whatever the material is: the stills pulled out
       of a file, or the pictures standing in the reel. Same one image, same one
       look at it. */
    const src = state.frames.length ? state.frames : state.shots;
    if(!src.length){ toast("Pull stills first — or put pictures in the reel.", "bad"); return null; }
    if(state.busy){ toast("Still working — let it finish.", "bad"); return null; }
    /* when every tile came out of a video, the tile carries its own SECONDS — so
       the eye can be asked WHERE something is happening and answer in the file's
       own timeline instead of in tile numbers a human would have to translate */
    const timed = opts.times !== false && src.length > 0 && src.every(function(f){ return isFinite(f.t); });
    state.busy = true;
    const btn = $("sheetBtn"); if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Building…'; }
    try{
      const cols = Math.max(1, Math.min(8, perRow || Math.ceil(Math.sqrt(src.length))));
      const rows = Math.ceil(src.length / cols);
      /* decoded the same way the reel decodes — through a CORS-clean fetch —
         because a sheet drawn from a tainted canvas cannot be exported at all */
      const imgs = await Promise.all(src.map(async function(f){
        if(state.shotBmp[f.url]) return state.shotBmp[f.url];
        const got = await window.Reel.loadShots([f.url]);
        if(!got.length) throw new Error("a picture would not decode");
        state.shotBmp[f.url] = got[0].bmp;
        return got[0].bmp;
      }));
      const cellW = Math.max.apply(null, imgs.map(function(i){ return i.width; }));
      const cellH = Math.max.apply(null, imgs.map(function(i){ return i.height; }));
      const gap = 12, pad = 40;
      const cw = pad * 2 + cols * cellW + (cols - 1) * gap;
      const ch = pad * 2 + rows * cellH + (rows - 1) * gap;
      const canvas = document.createElement("canvas");
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cw, ch);
      imgs.forEach(function(im, i){
        const col = i % cols, row = Math.floor(i / cols);
        const x = pad + col * (cellW + gap) + Math.floor((cellW - im.width) / 2);
        const y = pad + row * (cellH + gap) + Math.floor((cellH - im.height) / 2);
        ctx.drawImage(im, x, y);
        if(timed && isFinite(src[i].t)){
          /* the tile's own second, burned in. Without this the eye can only say
             "the tile in the middle-right", and no clip could be cut from it. */
          const label = src[i].t.toFixed(1) + "s";
          const fs = Math.max(15, Math.round(Math.min(cellW, cellH) * 0.05));
          const pd = Math.round(fs * 0.5);
          ctx.font = "700 " + fs + "px Inter, system-ui, sans-serif";
          const bw = ctx.measureText(label).width + pd * 2;
          const bh = fs + pd * 2;
          const bx = x + 4, by = y + im.height - bh - 4;
          ctx.fillStyle = "rgba(0,0,0,0.68)";
          ctx.fillRect(bx, by, bw, bh);
          ctx.fillStyle = "#ffffff";
          ctx.textBaseline = "middle";
          ctx.fillText(label, bx + pd, by + bh / 2 + 1);
          ctx.textBaseline = "alphabetic";
        }
      });
      const blob = await canvasBlob(canvas, "image/jpeg", 0.95);
      if(state.sheet) try{ URL.revokeObjectURL(state.sheet.url); }catch(e){}
      const eye = await eyeCopy(canvas);
      state.sheet = { blob:blob, url:URL.createObjectURL(blob), bytes:blob.size, w:cw, h:ch, cols:cols, rows:rows, timed:timed,
                      eye: eye ? eye.blob : null, eyeW: eye ? eye.w : 0, eyeH: eye ? eye.h : 0, eyeBytes: eye ? eye.bytes : 0 };
      const wrap = $("sheetWrap"), img = $("sheetImg");
      if(wrap && img){ img.src = state.sheet.url; wrap.hidden = false; }
      log("contact sheet — " + src.length + (state.frames.length ? " stills" : " reel pictures") + " in " + cols + "×" + rows + " · " + cw + "×" + ch + " · " + kb(blob.size) +
          (timed ? " · every tile stamped with its own second, so the eye can name a MOMENT and not just a tile" : ""), "ok");
      if(eye) log("the eye's copy — " + eye.w + "×" + eye.h + " · " + kb(eye.bytes) + " (the model is shown this, not the full sheet)", "gd");
      else log("no eye's copy could be made under the vision limit — the vibe pass will read the full sheet and may be refused", "nt");
      toast("Sheet built — " + kb(blob.size), "ok");
      return state.sheet;
    }catch(e){
      log("the sheet failed: " + ((e && e.message) || e), "bad");
      return null;
    }finally{
      state.busy = false;
      if(btn){ btn.disabled = false; btn.innerHTML = "▦ Contact sheet"; }
    }
  }

  /* =========================================================== shorts */
  function pickMime(){
    const cands = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];
    if(!window.MediaRecorder) return "";
    for(let i = 0; i < cands.length; i++){
      try{ if(MediaRecorder.isTypeSupported(cands[i])) return cands[i]; }catch(e){}
    }
    return "";
  }
  function extOf(mime){ return /mp4/i.test(mime) ? ".mp4" : (mime ? ".webm" : ".bin"); }
  async function safePlay(v){
    try{ v.muted = false; await v.play(); return { muted:false }; }
    catch(e){
      try{ v.muted = true; await v.play(); return { muted:true, why:(e && e.message) || String(e) }; }
      catch(e2){ return { muted:true, blocked:true, why:(e2 && e2.message) || String(e2) }; }
    }
  }
  async function recordClip(v, start, len, crop, mime, outW){
    const canvas = document.createElement("canvas");
    const tracks = [];
    const vstream = canvas.captureStream(30);
    tracks.push(vstream.getVideoTracks()[0]);
    let audioNote = "", audio = null;
    try{
      const ms = v.captureStream ? v.captureStream() : (v.mozCaptureStream ? v.mozCaptureStream() : null);
      if(ms){ audio = ms.getAudioTracks()[0]; if(audio) tracks.push(audio); else audioNote = "the file has no audio track"; }
      else audioNote = "this browser cannot capture audio from a <video>";
    }catch(e){ audioNote = "audio capture failed: " + ((e && e.message) || e); }

    await seek(v, start);
    await new Promise(function(r){ requestAnimationFrame(r); });
    const play = await safePlay(v);
    if(play.blocked) return { error:"the browser refused to play the file (no user gesture left on the tab) — nothing was recorded" };
    if(play.muted) audioNote = "played muted (the browser refused unmuted playback" + (play.why ? ": " + play.why : "") + ")";

    const stream = new MediaStream(tracks);
    const rec = new MediaRecorder(stream, { mimeType:mime, videoBitsPerSecond: 6000000 });
    const chunks = [];
    rec.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
    const stopped = new Promise(function(res){ rec.onstop = res; });
    const t0 = v.currentTime;
    const wall0 = performance.now();
    rec.start(250);
    await new Promise(function(res){
      function step(){
        if(state.cancel || v.ended || (v.currentTime - t0) >= len){ res(); return; }
        try{ drawInto(v, canvas, outW || 1080, crop); }catch(e){}
        requestAnimationFrame(step);
      }
      step();
    });
    try{ rec.stop(); }catch(e){}
    await stopped;
    try{ v.pause(); }catch(e){}
    if(audio) try{ audio.stop && audio.stop(); }catch(e){}
    const blob = new Blob(chunks, { type:mime });
    return { blob:blob, bytes:blob.size, len:(performance.now() - wall0) / 1000, start:start, muted:play.muted, note:audioNote, ext:extOf(mime), mime:mime };
  }
  async function makeShorts(n, len, crop){
    if(!state.video || !state.probe){ toast("Drop a video first.", "bad"); return null; }
    if(state.busy){ toast("Still working — let it finish.", "bad"); return null; }
    const mime = pickMime();
    if(!mime || !state.probe.canCapture){
      log("shorts read BLOCKED — " + (!mime ? "this browser cannot record (no MediaRecorder)" : "this browser cannot capture a stream from a <video>") + ". The stills and the sheet still work; no clip is claimed.", "bad");
      toast("This browser cannot cut clips — stills still work.", "bad");
      return null;
    }
    n = n || state.nShorts; len = len || state.shortLen; crop = crop || state.crop;
    /* A MEASURED FILE IS CUT WHERE THE NUMBERS SAY. If this file has a pulse
       (the queue run measures every file, or /pulse does), the clips come from
       its busiest windows and every one of them carries the motion and loudness
       it was chosen on. If it has not been measured, the old even spacing is
       used and the log says so — the node never implies a decision it did not
       make. */
    const it = Q.active;
    if(it && it.pulse){
      log("this file has been measured — the clips come from its busiest windows, not from even spacing", "gd");
      return await cutPickedClips(it, { want:n, len:len, crop:crop });
    }
    if(it) log("this file has NOT been measured, so the clips are cut by even spacing and nothing is claimed about where the life in it is (run /pulse, or use the queue run, to measure it)", "nt");
    const dur = state.probe.duration;
    state.busy = true; state.cancel = false;
    const btn = $("shortsBtn"), cx = $("cancelBtn");
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Cutting…'; }
    if(cx) cx.hidden = false;
    const out = [];
    log("cutting " + n + " short(s) · " + len + "s each · " + crop + " · " + mime + " — this runs in real time, about " + secs(n * len) + " of playback");
    try{
      for(let i = 0; i < n; i++){
        if(state.cancel) break;
        const start = dur ? Math.max(0, dur * (i + 0.5) / n - len / 2) : i * len;
        log("· short " + (i+1) + " from " + start.toFixed(1) + "s…");
        const r = await recordClip(state.video, start, len, crop, mime, crop === "9:16" ? Math.min(1080, Math.round((state.probe.h || 1920) * 9 / 16 / 2) * 2) : Math.min(1280, state.probe.w || 1280));
        if(r.error){ log("· short " + (i+1) + " — " + r.error, "bad"); break; }
        out.push({ blob:r.blob, url:URL.createObjectURL(r.blob), bytes:r.bytes, len:r.len, start:r.start, muted:r.muted, ext:r.ext, mime:r.mime, note:r.note });
        log("· short " + (i+1) + " — " + kb(r.bytes) + " · " + r.len.toFixed(1) + "s recorded" + (r.muted ? " · SILENT" : "") + (r.note ? " (" + r.note + ")" : ""), r.muted ? "nt" : "ok");
      }
    }catch(e){
      log("cutting stopped: " + ((e && e.message) || e), "bad");
    }
    state.shorts = out;
    state.busy = false;
    if(btn){ btn.disabled = false; btn.innerHTML = "✦ Cut the shorts"; }
    if(cx) cx.hidden = true;
    paintShorts(); paintStats();
    if(!out.length){ log("no shorts were written. Nothing is claimed.", "nt"); return null; }
    const silent = out.filter(function(s){ return s.muted; }).length;
    log("shorts — " + out.length + " clip(s), " + kb(out.reduce(function(a,s){ return a + s.bytes; }, 0)) + (silent ? " · " + silent + " silent" : " · sound captured") + " · container " + extOf(mime), "gd");
    toast(out.length + " shorts cut", "ok");
    speak("The shorts are cut.");
    return out;
  }

  /* ==========================================================================
     THE REEL — pictures into video.
     The node's second face. A list of pictures becomes one vertical video,
     composed on the canvas in the stage and encoded by the browser itself.
     ========================================================================== */
  const MOTION_LABEL = { auto:"auto", "in":"zoom in", out:"zoom out", "pan-r":"pan →", "pan-l":"pan ←", up:"pan ↑", down:"pan ↓", none:"still" };

  function aspectWH(){
    const res = Math.max(240, parseInt(state.reelUI.res, 10) || 1080);
    const even = function(n){ n = Math.round(n); return n % 2 ? n + 1 : n; };
    switch(state.reelUI.aspect){
      case "4:5":  return { w:res, h:even(res * 5 / 4) };
      case "1:1":  return { w:res, h:res };
      case "16:9": return { w:even(res * 16 / 9), h:res };
      default:     return { w:res, h:even(res * 16 / 9) };
    }
  }
  /* the options the engine takes, built once from the UI. Pure: no bitmaps, so
     the readout can be painted on every keystroke without decoding anything. */
  function reelOpts(){
    const wh = aspectWH();
    const ui = state.reelUI;
    const contact = state.offer && (state.offer.phones || []).length ? state.offer.phones[0] : "";
    const s = state.story;
    const opts = {
      w:wh.w, h:wh.h, fps:+ui.fps || 30, perShot:+ui.per || 2.6, transition:+ui.trans || 0,
      motion:ui.motion, fit:ui.fit, seed:3,
      vignette: ui.extra.vignette ? 0.5 : 0, progressBar: !!ui.extra.bar,
      caption:(($("capInput") && $("capInput").value) || "").trim(),
      watermark:(($("markInput") && $("markInput").value) || "").trim(),
      shots: state.shots.map(function(x){
        return { url:x.url, motion:x.motion, hold:x.hold, caption:x.caption, name:x.name, bmp:state.shotBmp[x.url] || null };
      }),
      audio: state.bed ? { blob:state.bed, gain:1, fadeIn:1.2, fadeOut:2.0, loop:true, startAt:0 } : null
    };
    if(ui.extra.cards){
      const titleEl = $("titleInput");
      const t = (titleEl && titleEl.value || "").trim();
      opts.titleCard = s ? { kicker:s.beats.ENEMY || "", title:s.beats.HOOK || t || "—", sub:s.beats.PLACE || "" }
                         : (t ? { title:t, sub:(opts.caption || "") } : null);
      opts.endCard = s ? { kicker:s.beats.OFFER || "", title:s.beats.CALL_SHORT || s.beats.CALL || "", sub: s.beats.CALL_CHANNEL || contact || (opts.caption || "") }
                       : (t ? { title:t, kicker:"", sub: contact || "" } : null);
      if(!opts.titleCard) delete opts.titleCard;
      if(!opts.endCard) delete opts.endCard;
    }
    return opts;
  }
  const motionOpts = function(sel){
    return ["auto","in","out","pan-r","pan-l","up","down","none"].map(function(m){
      return '<option value="' + m + '"' + (m === sel ? " selected" : "") + ">" + MOTION_LABEL[m] + "</option>";
    }).join("");
  };
  function paintShots(){
    const el = $("shotList"); if(!el) return;
    if(!state.shots.length){
      el.innerHTML = '<div class="hint">No pictures yet. <b>⊕ the stills</b> pulls the frames you extracted into the reel — or <b>🖼 pictures</b> takes photographs straight off the disk.</div>';
    } else {
      el.innerHTML = state.shots.map(function(s, i){
        const thumb = s.thumb
          ? '<img class="th" src="' + s.thumb + '" alt="">'
          : '<div class="th card">▣</div>';
        return '<div class="shot">' + thumb +
          '<span class="n">' + (i + 1) + '</span>' +
          '<select data-mv="' + i + '" title="motion for this picture">' + motionOpts(s.motion) + '</select>' +
          '<input class="ln" data-ln="' + i + '" value="' + esc(s.caption || "") + '" placeholder="the line burned onto this picture">' +
          '<button class="mv" data-up="' + i + '" title="move earlier">◀</button>' +
          '<button class="mv" data-dn="' + i + '" title="move later">▶</button>' +
          '<button class="x" data-rm="' + i + '" title="remove">✕</button></div>';
      }).join("");
      el.querySelectorAll("[data-ln]").forEach(function(inp){
        inp.oninput = function(){ const s = state.shots[+inp.dataset.ln]; if(s) s.caption = inp.value; };
        inp.onchange = function(){ paintReelReadout(); };
      });
      el.querySelectorAll("[data-mv]").forEach(function(sel){
        sel.onchange = function(){
          const s = state.shots[+sel.dataset.mv]; if(s){ s.motion = sel.value; paintReelPoster(); }
        };
      });
      el.querySelectorAll("[data-up]").forEach(function(b){
        b.onclick = function(){ moveShot(+b.dataset.up, -1); };
      });
      el.querySelectorAll("[data-dn]").forEach(function(b){
        b.onclick = function(){ moveShot(+b.dataset.dn, 1); };
      });
      el.querySelectorAll("[data-rm]").forEach(function(b){
        b.onclick = function(){ removeShot(+b.dataset.rm); };
      });
    }
    paintReelReadout();
  }
  function paintReelReadout(){
    const el = $("reelReadout"); if(!el) return;
    const opts = reelOpts();
    const d = window.Reel ? window.Reel.duration(opts) : { n:0, total:0, frames:0 };
    const cap = state.caps || {};
    const wh = aspectWH();
    const v = cap.video || {};
    const bytes = window.Reel && state.shots.length
      ? window.Reel.bitrateFor(wh.w, wh.h, +state.reelUI.fps) / 8 * d.total : 0;
    el.innerHTML =
      "<b>" + state.shots.length + "</b> picture(s) · <b>" + state.reelUI.per + "s</b> each · <b>" + state.reelUI.trans + "s</b> crossfade" +
      " <span class='bl'>→ " + d.total.toFixed(1) + "s</span> · " + wh.w + "×" + wh.h + " · " + state.reelUI.fps + " fps · " + d.frames + " frames<br>" +
      (state.bed ? "sound: <b>" + esc(state.bedName || "bed") + "</b>" : "<span class='bl'>silent (no bed)</span>") +
      " · writes <span class='bl'>" + (v.container ? (v.container.toUpperCase() + " · " + v.codec + (cap.audio ? " + " + cap.audio : " · no audio encoder")) : (cap.recorder ? "MediaRecorder (real time)" : "NOTHING — this browser cannot encode video")) + "</span>" +
      (bytes ? " · about " + kb(bytes) : "") +
      (state.shots.some(function(s){ return s.caption; }) ? " · <b>story-dressed</b>" : "");
  }
  /* the storyboard, drawn on the stage: one frame of the composition, which is
     how you tune a reel without paying 25 seconds for it */
  function paintReelPoster(){
    const cv = $("reelCanvas"); if(!cv) return;
    if(!state.shots.length || !state.shotBmp[state.shots[0].url] || !window.Reel) return;
    const opts = reelOpts();
    if(!(opts.shots || []).every(function(s){ return s.bmp; })) return;
    const P = window.Reel.plan(opts);
    if(!P.n) return;
    const t = P.shots[0].start + P.shots[0].hold * 0.75;
    try{ window.Reel.poster(opts, t, cv); }catch(e){}
    const m = $("reelStageMeta");
    if(m) m.textContent = "storyboard · frame at " + t.toFixed(1) + "s";
  }
  async function ensureBitmaps(){
    const missing = state.shots.filter(function(s){ return !state.shotBmp[s.url]; });
    if(!missing.length) return true;
    log("reading " + missing.length + " picture(s) into the composer…");
    const got = await window.Reel.loadShots(missing.map(function(s){ return s.url; }));
    got.forEach(function(g){
      state.shotBmp[g.url] = g.bmp;
      const s = state.shots.filter(function(x){ return x.url === g.url; })[0];
      if(s){ s.px = g.w + "×" + g.h; s.w = g.w; s.h = g.h; }
    });
    if(got.failed && got.failed.length) log(got.failed.length + " picture(s) would not decode and are out of the reel: " + got.failed.join(", "), "bad");
    return state.shots.every(function(s){ return !!state.shotBmp[s.url]; });
  }
  async function makeThumb(s){
    const bmp = state.shotBmp[s.url];
    if(!bmp) return "";
    const c = document.createElement("canvas");
    const tw = 60, th = 80;
    c.width = tw; c.height = th;
    const ctx = c.getContext("2d");
    const sc = Math.max(tw / bmp.width, th / bmp.height);
    const dw = bmp.width * sc, dh = bmp.height * sc;
    ctx.drawImage(bmp, (tw - dw) / 2, (th - dh) / 2, dw, dh);
    try{ return c.toDataURL("image/jpeg", 0.7); }catch(e){ return ""; }
  }
  async function refreshThumbs(){
    for(const s of state.shots){ if(!s.thumb){ const t = await makeThumb(s); if(t) s.thumb = t; } }
    paintShots();
  }
  function pushShot(shot, quiet){
    state.shots.push(shot);
    if(!quiet) captureSoul("REEL: " + (shot.name || shot.url), "video node · a picture handed to the reel · run " + runNo);
  }
  /* the stills the IMAGE HAND made go into the reel too — so the copy hand has
     something to write over and the video hand has something to render. They are
     the same pictures the page will use; the reel is just where they are worked. */
  async function shotsFromMade(){
    if(!DROP.made.length) return 0;
    const before = state.shots.length;
    DROP.made.forEach(function(m){
      if(!m.dataUrl) return;
      pushShot({ url:m.dataUrl, name:m.slot, bytes:m.bytes, motion:"auto", hold:+state.reelUI.per || 2.6,
                 caption:"", from:"made" });
    });
    await ensureBitmaps(); await refreshThumbs();
    const added = state.shots.length - before;
    if(added) log("the reel took the " + added + " picture(s) the image hand made — so the copy hand can write over them and the video hand can render them", "gd");
    return added;
  }
  async function addShotsFromFrames(){
    if(!state.frames.length){ toast("Pull the stills first.", "bad"); return 0; }
    const before = state.shots.length;
    state.frames.forEach(function(f, i){
      pushShot({ url:f.url, name:"still " + (i + 1), motion:"auto", hold:+state.reelUI.per || 2.6, caption:"", from:"still",
                 what:(state.tiles || [])[f.tile] || "", bytes:f.bytes });
    });
    await ensureBitmaps(); await refreshThumbs();
    log("the reel took " + (state.shots.length - before) + " still(s) — " + before + " → " + state.shots.length, "ok");
    toast((state.shots.length - before) + " stills in the reel", "ok");
    return state.shots.length - before;
  }
  async function addImageFiles(files){
    const list = Array.prototype.slice.call(files || []);
    if(!list.length) return 0;
    let added = 0;
    for(const f of list){
      if(!isImageFile(f) || isVideoFile(f)) continue;
      const url = URL.createObjectURL(f);
      pushShot({ url:url, name:f.name, bytes:f.size, motion:"auto", hold:+state.reelUI.per || 2.6, caption:"", from:"image" });
      added++;
      log("picture — " + f.name + " · " + kb(f.size) + " · read locally, never uploaded");
    }
    if(!added){ toast("That was not a picture.", "bad"); return 0; }
    await ensureBitmaps(); await refreshThumbs();
    syncImages();
    toast(added + " picture(s) into the reel", "ok");
    speak("The pictures are in the reel.");
    return added;
  }
  function removeShot(i){
    const s = state.shots[i]; if(!s) return;
    state.shots.splice(i, 1);
    paintShots(); paintReelPoster();
  }
  function moveShot(i, d){
    const j = i + d;
    if(j < 0 || j >= state.shots.length) return;
    const t = state.shots[i]; state.shots[i] = state.shots[j]; state.shots[j] = t;
    paintShots(); paintReelPoster();
  }
  function shuffleShots(){
    for(let i = state.shots.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      const t = state.shots[i]; state.shots[i] = state.shots[j]; state.shots[j] = t;
    }
    paintShots(); paintReelPoster();
    log("shuffled " + state.shots.length + " pictures");
  }
  function clearShots(){
    Object.keys(state.shotBmp).forEach(function(k){ try{ state.shotBmp[k].close && state.shotBmp[k].close(); }catch(e){} });
    state.shotBmp = {};
    state.shots = [];
    if(state.reel){ try{ URL.revokeObjectURL(state.reel.url); }catch(e){} state.reel = null; }
    const rv = $("reelVideo"); if(rv){ rv.hidden = true; rv.removeAttribute("src"); }
    const db = $("reelDlBtn"); if(db) db.hidden = true;
    paintShots(); paintReelPoster();
  }
  function setBed(file){
    if(!file){ state.bed = null; state.bedName = ""; }
    else { state.bed = file; state.bedName = file.name + " · " + kb(file.size); }
    const nm = $("bedName"); if(nm) nm.textContent = state.bed ? ("bed: " + state.bedName) : "no bed — the reel will be silent";
    const bc = $("bedClearBtn"); if(bc) bc.hidden = !state.bed;
    paintReelReadout();
  }
  function stopReel(){ state.cancel = true; log("stopping the reel — the frames already written are kept", "nt"); }
  function previewReel(){
    if(!state.shots.length){ toast("Put pictures in the reel first.", "bad"); return null; }
    if(state.preview){ state.preview.stop(); state.preview = null; log("preview stopped"); return null; }
    const cv = $("reelCanvas");
    const opts = reelOpts();
    if(!(opts.shots || []).every(function(s){ return s.bmp; })){ ensureBitmaps().then(previewReel); return null; }
    showStage("reel");
    state.preview = window.Reel.preview(opts, { canvas:cv, onFrame:function(t, total, rep){ } });
    log("previewing " + window.Reel.duration(opts).total.toFixed(1) + "s of composition in real time — nothing is being recorded, and the tab must be in front for it to move", "gd");
    const pb = $("reelPreviewBtn"); if(pb) pb.innerHTML = "■ Stop preview";
    const t = setInterval(function(){ if(!state.preview){ clearInterval(t); if(pb) pb.innerHTML = "▶ Preview"; } }, 400);
    return state.preview;
  }
  function total2s(s){ return s.toFixed(1) + "s"; }
  async function renderReel(){
    if(!state.shots.length){ toast("Put pictures in the reel first.", "bad"); return null; }
    if(state.busy){ toast("Still working — let it finish.", "bad"); return null; }
    if(!window.Reel){ log("the reel engine did not load — nothing is claimed", "bad"); return null; }
    if(state.preview){ state.preview.stop(); state.preview = null; }
    state.busy = true; state.cancel = false;
    const btn = $("reelBtn"), cx = $("reelCancelBtn"), wrap = $("reelProgWrap"), bar = $("reelProgBar");
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Rendering…'; }
    if(cx) cx.hidden = false;
    if(wrap) wrap.hidden = false;
    showStage("reel");
    const ok = await ensureBitmaps();
    if(!ok){ log("some pictures would not decode — the reel is not rendered", "bad"); finishReel(); return null; }
    const opts = reelOpts();
    const P = window.Reel.plan(opts);
    const wh = aspectWH();
    const cap = await window.Reel.caps(wh.w, wh.h, +state.reelUI.fps);
    state.caps = cap;
    log("rendering " + P.n + " shot(s) · " + P.total.toFixed(1) + "s · " + wh.w + "×" + wh.h + " · " + state.reelUI.fps + "fps · " + P.frames + " frames", "gd");
    log("engine — " + cap.reason);
    const t0 = performance.now();
    let res = null;
    try{
      res = await window.Reel.render(opts, {
        canvas: $("reelCanvas"),
        shouldStop: function(){ return state.cancel; },
        onFrame: function(f, total, t){
          if(bar) bar.style.width = (100 * f / total).toFixed(1) + "%";
          const m = $("reelStageMeta");
          if(m) m.textContent = "rendering " + f + "/" + total + " · " + t.toFixed(1) + "s";
        }
      });
    }catch(e){
      log("the reel was not written: " + ((e && e.message) || e), "bad");
      toast("The reel failed — see the log.", "bad");
      finishReel(); return null;
    }
    const ver = await window.Reel.verify(res.blob);
    res.url = URL.createObjectURL(res.blob);
    res.verified = ver;
    if(state.reel) try{ URL.revokeObjectURL(state.reel.url); }catch(e){}
    state.reel = res;
    const rv = $("reelVideo");
    if(rv){ rv.hidden = false; rv.src = res.url; }
    const db = $("reelDlBtn"); if(db) db.hidden = false;
    const m = $("reelStageMeta");
    if(m) m.innerHTML = "<b>" + kb(res.bytes) + "</b> · " + esc(res.container.toUpperCase()) + " · " + (ver.ok ? (ver.seconds.toFixed(2) + "s") : "unverified") + " · " + res.engine;
    log("reel — " + kb(res.bytes) + " · " + esc(res.container.toUpperCase()) + "/" + res.codec +
        (res.audio ? " + " + res.audio : " · SILENT" + (res.audioWhy ? " (" + res.audioWhy + ")" : "")) +
        " · " + res.frames + " frames · wrote in " + ((res.ms / 1000).toFixed(1)) + "s" +
        (res.realtimeFactor ? " (" + (1 / res.realtimeFactor).toFixed(1) + "× real time)" : " (real time)"), "gd");
    if(ver.ok) log("read back through a <video>: " + ver.seconds.toFixed(2) + "s · " + ver.w + "×" + ver.h + " · playable — the file is what it says it is", "ok");
    else log("the file could not be read back (" + ver.why + ") — treat the numbers above as the encoder's intent, not a player's", "nt");
    if(res.audioWhy && !res.audio) log("audio — " + res.audioWhy, "nt");
    captureSoul("REEL RENDER: " + state.shots.length + " pictures → " + kb(res.bytes) + " " + res.container + " · " + res.frames + " frames · " + (ver.ok ? ver.seconds.toFixed(2) + "s" : "unverified"),
                "video node · run " + runNo + " · composed and encoded in this browser, nothing uploaded");
    state.lib_pending = { name:"reel-" + state.shots.length + "p." + res.container, size:res.bytes, frames:0, shorts:1, note:(state.story ? state.story.beats.HOOK || "" : "") };
    lib.rows.unshift({ id:"reel-" + Date.now(), name:state.lib_pending.name, size:res.bytes, frames:0, shorts:1,
                       note:(state.story && state.story.beats.HOOK) || state.reelUI.aspect + " reel", t:Date.now() });
    await libSave(); paintLib(); paintStats();
    toast("The reel is written — " + kb(res.bytes), "ok");
    speak("The reel is written.");
    finishReel();
    function finishReel(){
      state.busy = false;
      if(btn){ btn.disabled = false; btn.innerHTML = "✦ Render the reel"; }
      if(cx) cx.hidden = true;
      if(bar) bar.style.width = "100%";
      setTimeout(function(){ if(wrap) wrap.hidden = true; if(bar) bar.style.width = "0%"; }, 1600);
    }
    return res;
  }
  function downloadReel(){
    if(!state.reel){ toast("Render the reel first.", "bad"); return; }
    download(state.reel.blob, "reel-" + state.shots.length + "p" + state.reel.ext);
  }
  function savePoster(){
    const cv = $("reelCanvas");
    if(!cv || !state.shots.length){ toast("Nothing to draw yet.", "bad"); return; }
    const opts = reelOpts();
    if(!(opts.shots || []).every(function(s){ return s.bmp; })){ ensureBitmaps().then(savePoster); return; }
    const P = window.Reel.plan(opts);
    const t = P.shots[Math.min(1, P.n - 1)].start + 0.4;
    const c = window.Reel.poster(opts, t);
    c.toBlob(function(b){ download(b, "reel-poster.jpg"); }, "image/jpeg", 0.94);
    log("poster saved — one frame of the composition at " + t.toFixed(1) + "s");
  }
  function showStage(which){
    state.stage = which;
    const sw = $("stageWrap"), rs = $("reelStage");
    if(sw) sw.hidden = which !== "source";
    if(rs) rs.hidden = which !== "reel";
    document.querySelectorAll("[data-stage]").forEach(function(b){ b.classList.toggle("on", b.dataset.stage === which); });
    if(which === "reel"){ paintReelPoster(); }
  }

  /* ==========================================================================
     THE STORY — the offering, looked up; the register, applied; the reel, sold.
     ========================================================================== */
  function paintOffer(){
    const el = $("offerBox"); if(!el) return;
    const o = state.offer;
    if(!o || !o.ok){ el.innerHTML = o && o.why ? '<div class="hint">the lookup failed: ' + esc(o.why) + '</div>' : ""; return; }
    const f = o.found || {};
    const cell = function(k, v){ return '<div class="of"><b>' + k + '</b><span>' + esc(v) + '</span></div>'; };
    el.innerHTML =
      cell("read from", (o.url || "").replace(/^https?:\/\//, "").slice(0, 40)) +
      cell("words", o.words) +
      cell("sections", f.headings || 0) +
      cell("listed items", f.items || 0) +
      cell("money lines", f.prices || 0) +
      cell("contact", (o.phones && o.phones[0]) || "none found");
  }
  function paintStory(){
    const el = $("storyBody"), st = $("storyStatus");
    const s = state.story;
    if(el){
      if(!s){ el.innerHTML = ""; }
      else {
        el.innerHTML = window.Story.order.map(function(k){
          const v = s.beats[k];
          if(!v) return "";
          const note = (window.Story.ARC.filter(function(a){ return a[0] === k; })[0] || [])[1] || "";
          return '<div class="beat"><div class="bh">' + k + '</div><div class="bl">' + esc(v) + '</div>' +
                 (k === "HOOK" || k === "CALL" ? '<div class="bd">' + esc(note.split(".")[0]) + '</div>' : "") + "</div>";
        }).join("") +
        (s.lines.some(function(l){ return l; }) ? '<div class="beat"><div class="bh">LINES · one per picture</div><div class="bl">' +
          s.lines.map(function(l, i){ return (i + 1) + ". " + esc(l || "—"); }).join("<br>") + "</div></div>" : "") +
        (s.beats.CAPTION ? '<div class="beat"><div class="bh">CAPTION</div><div class="bl">' + esc(s.beats.CAPTION) + "</div></div>" : "") +
        (s.tags.length ? '<div class="beat"><div class="bh">TAGS</div><div class="bl" style="font-size:12.5px;color:var(--text-dim)">' + esc(s.tags.join(" ")) + "</div></div>" : "");
      }
    }
    if(st) st.innerHTML = s ? (s.lines.filter(function(l){ return l; }).length + " line(s) · " + s.filled + " beat(s) · the register: MARKET v2.0 (src/brand.js)") : "";
    const ab = $("storyApplyBtn"); if(ab) ab.hidden = !s;
    const cb = $("storyCopyBtn"); if(cb) cb.hidden = !s;
  }
  async function lookupOffering(){
    const inp = $("lookupInput");
    const url = (inp && inp.value || "").trim();
    if(!url){ toast("Give it the address of the venue's page.", "bad"); return null; }
    const btn = $("lookupBtn");
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Reading…'; }
    log("looking up the offering at " + url + "…");
    const o = await window.Story.lookup(url);
    state.offer = o;
    if(btn){ btn.disabled = false; btn.innerHTML = "🔍 look up the offering"; }
    if(!o.ok){
      log("the offering could not be read: " + o.why + " — nothing is claimed about what this venue sells", "bad");
      toast("That page could not be read.", "bad");
      paintOffer(); return null;
    }
    log("offering read via " + o.via + " — " + o.words + " words · " + (o.found.headings) + " section(s) · " + (o.found.items) + " listed item(s) · " + (o.found.prices) + " money line(s) · " + (o.found.phones) + " contact(s)", "ok");
    if(o.found.prices) log("money on the page: " + o.prices.slice(0, 6).join(" · "), "gd");
    captureSoul("OFFERING READ: " + o.url + " · " + o.words + " words · " + o.found.items + " items · " + o.found.prices + " price lines",
                "video node · read live, never edited · run " + runNo);
    paintOffer();
    toast("The offering is read — " + o.words + " words.", "ok");
    return o;
  }
  async function writeTheStory(){
    if(!window.Story){ log("the story engine did not load", "bad"); return null; }
    if(!state.shots.length){ toast("Put pictures in the reel first — the story is told over them.", "bad"); return null; }
    const btn = $("storyBtn");
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Writing…'; }
    const el = $("storyBody");
    const st = $("storyStatus");
    if(el) el.innerHTML = "";
    if(st) st.textContent = "writing the story over " + state.shots.length + " picture(s)…";
    state.story = null;
    log("writing the story — the register (MARKET v2.0) over " + (state.offer && state.offer.ok ? "the offering read from " + state.offer.url : "no offering (none was looked up)") + " and " + state.shots.length + " picture(s)");
    const t0 = performance.now();
    const res = await window.Story.write({
      offer: state.offer,
      shots: state.shots.map(function(s, i){ return { what:s.what || "", name:s.name || ("picture " + (i+1)) }; }),
      vibe: state.vibeText, caption: (($("capInput") && $("capInput").value) || "").trim(),
      lang:"en", goal: (($("goalInput") && $("goalInput").value) || "").trim()
    }, {
      onChunk:function(t){ state.storyLive = t; if(el) el.textContent = t; if(el) el.scrollTop = el.scrollHeight; },
      onNote:function(m){ log("· " + m, "nt"); }
    });
    if(btn){ btn.disabled = false; btn.innerHTML = "✎ Write the story"; }
    if(!res.ok){
      log("no story was written: " + res.why, "bad");
      toast("The story failed — see the log.", "bad");
      if(st) st.textContent = "no story — " + res.why;
      return null;
    }
    state.story = res;
    state.storyLive = "";
    paintStory();
    const viol = (res.violations || []).filter(function(v){ return v.verdict === "FAIL"; });
    log("story — " + res.filled + " beat(s) · " + res.lines.filter(function(l){ return l; }).length + " line(s) · " + res.text.split(/\s+/).length + " words · written in " + ((performance.now() - t0) / 1000).toFixed(1) + "s", "ok");
    if(viol.length || (res.held || []).length)
      log("the copy audit — " + viol.length + " hard violation(s), " + (res.held || []).length + " line(s) WITHHELD. The full table is in the audit panel (▣ Audit everything).", "bad");
    else log("the copy audit — no hard rule was broken: every number was read, and no register example was reused", "ok");
    captureSoul("STORY: " + res.text, "video node · written from the offering and the register · run " + runNo);
    toast("The story is written.", "ok");
    speak("The story is written.");
    return res;
  }
  function dressReel(){
    const s = state.story;
    if(!s){ toast("Write the story first.", "bad"); return; }
    const n = state.shots.length;
    let used = 0;
    for(let i = 0; i < n; i++){
      const line = s.lines[i] || "";
      if(line){ state.shots[i].caption = line; used++; }
    }
    /* the call is one line in the answer, but a card wants two: the instruction
       as the display line and the channel underneath it. The URL is lifted out of
       the middle of the sentence rather than printed at title size. */
    const call = s.beats.CALL || "";
    const chan = (call.match(/https?:\/\/\S+|[\w.+-]+@[\w.-]+|\+?\d[\d\s().-]{7,}\d/g) || [])[0] || "";
    const short = call.replace(chan, "").replace(/[\s|·,:;–-]+$/, "").replace(/^[\s|·,:;–-]+/, "")
                      .replace(/\s+([.,!?;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
    if(short) s.beats.CALL_SHORT = short;
    if(chan) s.beats.CALL_CHANNEL = chan;
    const ti = $("titleInput"); if(ti && s.beats.HOOK) ti.value = s.beats.HOOK;
    state.reelUI.extra.cards = true;
    const chip = document.querySelector('[data-set="extra"] .chip[data-val="cards"]');
    if(chip) chip.classList.add("on");
    paintShots(); paintReelPoster(); paintReelReadout();
    log("the reel is dressed — " + used + " of " + n + " picture(s) carry a story line · the hook is the title card · " +
        (short ? "'" + short + "'" : "the call") + (chan ? " over " + chan : "") + " is the end card · render to burn it in", "gd");
    toast("Dressed — render the reel to burn it in.", "ok");
    showStage("reel");
  }
  function copyStory(){
    if(!state.story) return;
    const txt = window.Story.order.map(function(k){ return k + ": " + state.story.beats[k]; }).join("\n") +
      "\n\n" + state.story.beats.CAPTION + "\n\n" + state.story.tags.join(" ");
    navigator.clipboard.writeText(txt).then(function(){ toast("Story copied.", "ok"); }, function(){ toast("The clipboard was refused — select the text instead.", "bad"); });
  }


  /* THE EYE'S BRIEF. When the sheet's tiles carry their own seconds, the eye is
     asked one more thing — WHERE, in the file's own timeline, anything is
     happening. That answer is what lets a clip be cut from a moment the model
     can SEE (a crowd, someone dancing), while the numbers from src/pulse.js say
     how busy it actually is. Neither one is allowed to pretend to be the other. */
  function vibeInstruction(timed){
    return "You are PR-01's eye: the vision pass of a build engine. You are looking at a contact sheet — a grid of " +
    "stills pulled from one video" + (timed ? ", each tile stamped in its corner with the SECOND of the video it was taken from" : "") + " — and your job is to hand a designer the whole look of it in words.\n" +
    "Answer in EXACTLY this shape, no preamble:\n" +
    "VIBE: one line — what this place/thing feels like, in the words a person would actually use.\n" +
    "ART: 3-6 bullets — the art direction (light, texture, subject, composition, what to keep, what to avoid).\n" +
    "PALETTE: 5 hex colours taken from the sheet, each with a one-word name.\n" +
    "WORDS: 12-20 keywords for a copywriter.\n" +
    "TILES: one line per tile of the sheet, in READING ORDER (left to right, top to bottom, then the next row), " +
    "numbered 1, 2, 3 … — each a short, concrete description of what is in THAT tile and nothing else. " +
    "Do not repeat the tile's timecode as its description.\n" +
    (timed
      ? "MOMENTS: up to six lines, each `<seconds> — <what is happening there>`, where `<seconds>` is the timecode " +
        "printed on the tile. Name only the seconds where the most is going on: people, crowds, dancing, movement, " +
        "action, someone reacting, a dish arriving. Take the numbers from the tiles themselves and never invent a time " +
        "that is not on the sheet. Fewer lines is better than padding. If the whole file is quiet and still, answer " +
        "exactly `MOMENTS: none — nothing is happening anywhere in this file`.\n"
      : "") +
    "BRIEF: one paragraph that could be handed to a website builder as the brief for one page.\n" +
    "Only describe what is visible in the sheet. If something is unclear, say so.";
  }
  async function readVibe(){
    const material = state.frames.length ? state.frames : state.shots;
    if(!material.length){ toast("Pull stills — or put pictures in the reel. The sheet is what the eye looks at.", "bad"); return null; }
    if(!window.root || !window.root.generateText){ log("no generateText in this generator — the vision pass is unavailable, so no vibe is claimed", "bad"); return null; }
    const sheet = state.sheet || await buildSheet();
    if(!sheet) return null;
    const timed = !!sheet.timed;
    const el = $("vibeBody"), btn = $("vibeBtn");
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Looking…'; }
    el.textContent = "";
    state.vibeText = "";
    const eyeBlob = sheet.eye || sheet.blob;
    log("showing the eye " + (sheet.eye ? "its copy of the sheet — " + sheet.eyeW + "×" + sheet.eyeH + " · " + kb(sheet.eyeBytes) : "the full sheet — " + sheet.w + "×" + sheet.h + " · " + kb(sheet.bytes)) +
        (state.frames.length ? " (" + state.frames.length + " stills" + (timed ? ", every tile timecoded" : "") + ")" : " (" + state.shots.length + " reel pictures)"));
    try{
      const p = window.root.generateText({
        instruction:[ vibeInstruction(timed), eyeBlob ],
        onChunk:function(d){ state.vibeText += d.textChunk; el.textContent = state.vibeText; el.scrollTop = el.scrollHeight; }
      });
      state.job = p;
      const res = await p;
      state.job = null;
      const text = String((res && res.text) || state.vibeText || "");
      if(!text.trim()){
        state.vibeText = "";
        log("the eye returned nothing — no vibe is claimed", "bad");
        return null;
      }
      /* A model that never received the picture says so in prose. That is not a
         vibe, and it must not be filed as one. Nor is an echoed template. */
      const echo = /\[(one line description|description|bullet|12-20 keywords|one paragraph)/i.test(text) ||
                   /\[object Blob\]/i.test(text) ||
                   (text.length < 260 && /(provide|attach|upload|send)\s+(the\s+)?(image|picture|blob)|cannot (analyze|see)|no image (was )?(provided|attached)/i.test(text));
      if(echo){
        state.vibeText = "";
        log("the eye did not read the sheet — it echoed the format back, or asked for the picture again. No vibe is claimed. (the copy sent was " + kb(sheet.eyeBytes || sheet.bytes) + ")", "bad");
        toast("The eye did not read the sheet — see the log.", "bad");
        return null;
      }
      state.vibeText = text;
      paintVibe();
      /* the tiles: the sheet's grid, read in order, becomes what each picture is.
         This is the material the story engine writes over — without it a line
         would have to be sprinkled over the reel instead of bound to a picture. */
      const tiles = (text.match(/TILES\s*:\s*([\s\S]*?)(?=\n\s*[A-Z]{3,}\s*:|(?![\s\S]))/i) || [])[1] || "";
      const list = [];
      tiles.split("\n").forEach(function(row){
        const t = row.match(/^\s*(\d+)[.)]?\s*[-–—:]?\s*(.+?)\s*$/);
        /* a placeholder the model echoed back is not a description of a tile */
        if(t && !/^\[.*\]$/.test(t[2].trim())) list[+t[1] - 1] = t[2].trim();
      });
      const found = list.filter(function(x){ return x; });
      state.tiles = found;
      /* a still pulled out of a video already carries the tile it became (see
         indexFrames), so the reel binds its own line when it is assembled — the
         only thing left to bind here is a reel made of PICTURES, where the reel
         IS the sheet's material. */
      const fromShots = !state.frames.length;
      if(found.length && fromShots && state.shots.length){
        let bound = 0;
        state.shots.forEach(function(s, i){
          if(list[i] && !s.what){ s.what = list[i]; bound++; }
        });
        log("the eye named " + found.length + " tile(s) in reading order — " + bound + " bound to the reel's pictures as their material", "ok");
      } else if(found.length){
        log("the eye named " + found.length + " tile(s) in reading order — held as this file's material, and a still carries the line of the tile it became", "ok");
      }
      paintShots();
      /* THE MOMENTS: the eye's own "here is where something is happening", in the
         file's own seconds, taken off the timecodes burned into the tiles. A time
         that is not on the sheet is not accepted, and "none" is an answer — a file
         where nothing happens says so instead of having clips invented for it. */
      const block = (text.match(/MOMENTS\s*:\s*([\s\S]*?)(?=\n\s*[A-Z]{3,}\s*:|(?![\s\S]))/i) || [])[1] || "";
      const dur = (state.probe && state.probe.duration) || 0;
      const mom = [];
      if(block && !/^\s*(none|n\/a|nothing)\b/i.test(block.trim())){
        block.split("\n").forEach(function(row){
          const mm = row.match(/^\s*(?:#|t\s*=|at\s*)?(\d+(?:\.\d+)?)\s*(?:s\b|sec\w*)?\s*(?:[-–—:·|]|\s)\s*(.+?)\s*$/i);
          if(!mm) return;
          const t = parseFloat(mm[1]);
          const what = mm[2].trim().replace(/^[-–—:·|\s]+/, "");
          if(!isFinite(t) || !what || /^\[.*\]$/.test(what)) return;
          if(dur && t > dur + 1.5) return;
          if(!mom.some(function(x){ return Math.abs(x.t - t) < 0.6; })) mom.push({ t:t, what:what });
        });
      }
      state.moments = mom;
      if(mom.length) log("the eye named " + mom.length + " moment(s) on the sheet — " + mom.map(function(x){ return x.t + "s: " + x.what; }).join(" · "), "ok");
      else if(block){
        log("the eye named no moment — " + (block.split("\n")[0] || "").trim().slice(0, 140), "nt");
        /* the eye sees a GRID OF STILLS; a still cannot show movement, so the eye
           saying \"nothing is happening\" is not a disagreement with a motion
           measurement — it is a different instrument answering a different
           question. Say which one is which rather than letting the two look
           like they contradict each other. */
        const p = state.pulse;
        if(p && p.samples && p.samples.length && isFinite(p.peak) && p.peak > 0){
          const busiest = (p.samples || []).reduce(function(a, b){ return (b.v > (a ? a.v : -1)) ? b : a; }, null);
          log("   that is not the numbers disagreeing: the eye is looking at stills, and a still cannot show movement. The motion measured on this file peaks at " +
              window.Pulse.pct(p.peak) + " of its own full scale" + (busiest ? " around " + busiest.t.toFixed(1) + "s" : "") +
              " — so the clips are still cut from the measured windows, and each one carries its number instead of a claim about dancing.", "nt");
        }
      }
      else if(timed) log("the eye did not answer the MOMENTS line — the clips will be chosen on the measured pulse alone", "nt");
      const m = text.match(/BRIEF:\s*([\s\S]+)$/i);
      state.brief = m ? m[1].trim() : text.trim();
      paintVibe();
      log("vibe read — " + text.split(/\s+/).length + " words · the brief is ready for the builder", "ok");
      toast("The vibe is in words.", "ok");
      speak("The vibe is read.");
      return text;
    }catch(e){
      state.job = null;
      log("the eye failed: " + ((e && e.message) || e), "bad");
      return null;
    }finally{
      if(btn){ btn.disabled = false; btn.innerHTML = "◎ Read the vibe"; }
    }
  }
  async function handToBuilder(){
    if(!state.brief){ toast("Read the vibe first.", "bad"); return; }
    let copied = false;
    try{ await navigator.clipboard.writeText(state.brief); copied = true; }catch(e){ copied = false; }
    try{ localStorage.setItem("obi_video_brief", state.brief); }catch(e){}
    const url = "https://perchance.org/" + BUILDER + "?brief=" + encodeURIComponent(state.brief.slice(0, 1800));
    log("the brief is " + (copied ? "on the clipboard" : "in this page's storage (the clipboard was refused)") +
        " and set in the builder's deep link: " + BUILDER + "?brief=…", copied ? "ok" : "nt");
    window.open(url, "_blank", "noopener");
    toast(copied ? "Brief copied — the Site Builder is opening." : "Brief stored — the Site Builder is opening.", "ok");
  }

  /* ==========================================================================
     ONE SHOT — the whole queue in a single pass.

     Per video: read it → stills → MEASURE THE PULSE → stills at the peaks →
     the contact sheet (each tile stamped with its own second) → the eye (the
     vibe, one line per tile, and the moments it can see) → the clips, cut from
     the measured peaks with the eye's moments folded in → its pictures into the
     reel. Then, once for the whole drop: the reel of everything, the story over
     it, and the render.

     Two things this deliberately does NOT do:
       · it never claims a clip is "the dancing" — a clip is cut from a measured
         window, the numbers are printed beside it, and the eye's reason is
         quoted as the eye's, separately;
       · it never silently skips a file. A file whose metadata never arrives is
         SKIPPED AND NAMED, with the reason (a background tab defers media
         loading), and the run carries on with the rest.
     ========================================================================== */
  let sweeping = false;

  function paintBatchBar(frac, text){
    const w = $("batchBarWrap"), b = $("batchBar");
    if(w) w.hidden = false;
    if(b) b.style.width = (100 * Math.max(0, Math.min(1, frac || 0))).toFixed(1) + "%";
    if(text){
      batch.phase = text;
      const st = $("batchStatus");
      if(st) st.textContent = text;
    }
  }
  function batchBarOff(){
    const w = $("batchBarWrap"), b = $("batchBar");
    if(w) w.hidden = true;
    if(b) b.style.width = "0%";
  }
  function paintBatch(){
    const st = $("batchStatus");
    if(!st) return;
    const n = Q.items.length;
    if(!n){ st.innerHTML = "Nothing queued yet — drop one video or twenty."; return; }
    const done = Q.items.filter(function(x){ return x.status === "done"; }).length;
    const clips = Q.items.reduce(function(a, x){ return a + (x.shorts || []).length; }, 0);
    const left = n - done;
    /* recording is REAL TIME, so the run's cost is knowable before it starts,
       and it is printed rather than discovered halfway through */
    const est = left * (batch.opts.clips > 0 ? batch.opts.clips * (batch.opts.clipLen + 0.8) : 0);
    st.innerHTML = "<b>" + done + "</b> of <b>" + n + "</b> swept · <b>" + clips + "</b> clip(s) cut · " +
      (batch.opts.sell === "story" ? "then the reel and the story · " : "") +
      "clips record in real time, so roughly <b>" + secs(est) + "</b> of that is unavoidable" +
      (batch.running ? " · <b>" + esc(batch.phase || "working") + "</b>" : "");
  }
  function paintQueue(){
    const el = $("queueList"), m = $("queueMeta");
    if(m) m.innerHTML = Q.items.length
      ? "<b>" + Q.items.length + "</b> video(s) · " + kb(Q.items.reduce(function(a, x){ return a + x.size; }, 0)) + " · read one at a time"
      : "";
    if(!el) return;
    if(!Q.items.length){
      el.innerHTML = '<div class="hint">Nothing queued. Drop one video or twenty — they are read off your disk, in order, and never uploaded.</div>';
      return;
    }
    const LABEL = { queued:"waiting", reading:"reading", ready:"ready", working:"sweeping", cutting:"cutting clips", done:"swept", failed:"SKIPPED" };
    el.innerHTML = Q.items.map(function(it, i){
      const active = it === Q.active;
      const st = it.status;
      const cls = st === "done" ? "ok" : (st === "failed" ? "bad" : (st === "ready" ? "gd" : (st === "queued" ? "" : "run")));
      const facts = [];
      if(it.probe) facts.push(it.probe.w + "×" + it.probe.h + " · " + (it.probe.duration ? secs(it.probe.duration) : "length unknown"));
      if(it.frames.length) facts.push(it.frames.length + " still(s)");
      if(it.sheet) facts.push("sheet " + kb(it.sheet.bytes));
      if(it.pulse) facts.push("pulse " + it.pulse.samples.length + " samples / " + (it.pulse.hasAudio ? "motion + loudness" : "MOTION ONLY"));
      if((it.moments || []).length) facts.push("the eye named " + it.moments.length + " moment(s)");
      if(it.shorts.length) facts.push(it.shorts.length + " clip(s)");
      else if(it.pulse) facts.push("no clip cut yet");
      if((it.tiles || []).length) facts.push(it.tiles.length + " tile(s) named");
      const clips = (it.shorts || []).map(function(s, j){
        return '<div class="q-clip"><b>#' + (j + 1) + ' · ' + s.len.toFixed(1) + 's @ ' + s.start.toFixed(1) + 's</b>' +
               '<span>' + esc(s.why || "even spacing — nothing was measured for this file") + (s.muted ? ' · <i>SILENT</i>' : "") + '</span>' +
               '<button class="x" data-qdl="' + i + ':' + j + '" title="download">⬇</button></div>';
      }).join("");
      return '<div class="q-row' + (active ? " on" : "") + '">' +
        '<div class="q-main"><span class="q-n">' + (i + 1) + '</span>' +
          '<span class="q-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
          '<span class="q-sz">' + kb(it.size) + '</span>' +
          '<span class="q-st ' + cls + '">' + (LABEL[st] || st) + '</span></div>' +
        (it.err ? '<div class="q-facts bad">' + esc(it.err) + '</div>' : "") +
        (facts.length ? '<div class="q-facts">' + esc(facts.join(" · ")) + '</div>' : "") +
        (clips ? '<div class="q-clips">' + clips + '</div>' : "") +
        ((it.moments || []).length ? '<div class="q-facts">the eye: ' + esc(it.moments.map(function(x){ return x.t + "s " + x.what; }).join(" · ").slice(0, 220)) + '</div>' : "") +
        '<div class="q-btns">' +
          (active ? '<span class="q-now">on the stage</span>' : '<button class="tbtn" data-qact="' + i + ':act">read this one</button>') +
          '<button class="tbtn" data-qact="' + i + ':sweep">sweep it</button>' +
          '<button class="tbtn" data-qact="' + i + ':reel">a reel of it</button>' +
          '<button class="tbtn danger" data-qact="' + i + ':rm">✕</button>' +
        '</div></div>';
    }).join("");
    el.querySelectorAll("[data-qact]").forEach(function(b){
      b.onclick = async function(){
        const parts = b.dataset.qact.split(":");
        const it = Q.items[+parts[0]];
        if(!it) return;
        if(parts[1] === "act") activate(it);
        else if(parts[1] === "rm") removeItem(it);
        else if(parts[1] === "sweep") await sweepOne(it, +parts[0]);
        else if(parts[1] === "reel") await reelOfItem(it);
      };
    });
    el.querySelectorAll("[data-qdl]").forEach(function(b){
      b.onclick = function(){
        const parts = b.dataset.qdl.split(":");
        const it = Q.items[+parts[0]]; if(!it) return;
        const s = it.shorts[+parts[1]]; if(!s) return;
        download(s.blob, (it.name.replace(/\.[^.]+$/, "") || "video") + "-clip-" + String(+parts[1] + 1).padStart(2, "0") + (s.ext || ".webm"));
      };
    });
  }

  /* ---------------------------------------------------------- the pulse */
  async function measurePulse(it){
    if(!window.Pulse){
      log("the pulse engine (src/pulse.js) did not load — nothing is measured for " + it.name +
          ", and its clips will be cut by even spacing. The log will say so besides every clip.", "bad");
      return null;
    }
    if(!it.probe || !isFinite(it.probe.duration) || it.probe.duration <= 0){
      log("nothing can be measured in " + it.name + " — its length is unknown", "nt");
      return null;
    }
    log("measuring " + it.name + " — where is anything actually happening in it?", "gd");
    let scan = null;
    try{
      scan = await window.Pulse.scan(it.video, { samples:window.Pulse.DEFAULT_SAMPLES, duration:it.probe.duration }, {
        shouldStop:function(){ return state.cancel || batch.cancel; },
        onProgress:function(i, total, t){
          paintBatchBar(0.06 + 0.3 * (i / Math.max(1, total)),
            "measuring " + it.name + " — " + t.toFixed(0) + "s of " + (it.probe.duration || 0).toFixed(0) + "s · " + Math.round(100 * i / Math.max(1, total)) + "%");
        }
      });
    }catch(e){ scan = { ok:false, why:((e && e.message) || String(e)) }; }
    if(!scan || !scan.ok){
      log("the motion walk could not run on " + it.name + ": " + ((scan && scan.why) || "unknown reason") +
          " — NO clip from this file will claim to be a peak.", "nt");
      it.pulse = null; paintQueue();
      return null;
    }
    log("motion — " + scan.samples.length + " sample(s) every " + scan.step.toFixed(2) + "s on a " + scan.w + "×" + scan.h +
        " canvas · luma change floor " + window.Pulse.pct(scan.floor) + " → peak " + window.Pulse.pct(scan.peak) +
        " · walked in " + (scan.ms / 1000).toFixed(1) + "s", "gd");
    let aud = null;
    if(batch.opts.audio !== "off"){
      try{
        aud = await window.Pulse.audio(it.file, { hop:scan.step, win:Math.min(0.4, Math.max(0.2, scan.step)) },
                                      { onNote:function(m){ log("· " + m); } });
      }catch(e){ aud = { ok:false, why:((e && e.message) || String(e)) }; }
      if(aud && aud.ok)
        log("loudness — " + aud.env.length + " window(s) at " + (aud.rate / 1000) + " kHz · floor " + window.Pulse.pct(aud.floor) +
            " → peak " + window.Pulse.pct(aud.peak) + " of full scale · read in " + (aud.ms / 1000).toFixed(1) + "s", "gd");
      else
        log("loudness — " + ((aud && aud.why) || "not measured") + " · THE CLIPS WILL BE CHOSEN ON MOTION ALONE AND WILL SAY SO", "nt");
    } else {
      log("loudness — skipped (the toggle says motion only) · the clips will say so", "nt");
    }
    const pulse = window.Pulse.combine(scan, aud);
    it.pulse = pulse; state.pulse = pulse;
    log("the pulse of " + it.name + " — " + window.Pulse.report(pulse), "ok");
    paintQueue(); paintBatch();
    return pulse;
  }

  /* ---------------------------------------------------------- the clips */
  /* WHERE THE CLIPS COME FROM — two kinds of evidence, and they are never
     confused for one another:

       · THE NUMBERS (pulse.pick) — the windows with the most motion and the most
         loudness. They cannot tell a crowd dancing from a camera being swung.
       · THE EYE — the vision pass was shown the sheet with every tile timecoded
         and asked to name the seconds where something is happening. It can tell
         a crowd from a whip-pan and it cannot measure anything.

     A named moment near a measured peak SNAPS onto it and the clip then carries
     both reasons. A named moment nowhere near any peak is KEPT as its own clip,
     labelled as the eye's call with no number attached — because there is no
     number behind it. With neither, the clips fall back to even spacing and the
     reason line says exactly that. */
  function planClips(it, want, len){
    want = (want == null) ? (batch.opts.clips | 0) : (want | 0);
    len = Math.max(1.5, +(len || batch.opts.clipLen || 5));
    if(want <= 0) return [];
    const out = [];
    const measured = it.pulse ? window.Pulse.pick(it.pulse, { count: want + 2, len:len }) : [];
    if(measured.suppressed)
      log("· only " + measured.length + " window(s) of " + it.name + " cleared the stillness floor (energy ≥ " +
          Math.round((measured.cut || 0) * 100) + "% of this file's own best of " + Math.round((measured.best || 0) * 100) +
          "%) — so no clip is padded out with the quiet parts. A file with five seconds of life in it gets one clip from those five seconds, and says so.", "nt");
    measured.forEach(function(p){
      out.push({ start:p.start, len:p.len, peakT:p.peakT, motion:p.motion, audio:p.audio, score:p.score, why:p.why, named:[] });
    });
    (it.moments || []).filter(function(m){ return m && isFinite(m.t); }).forEach(function(m){
      const near = out.map(function(c){ return { c:c, d:Math.abs(c.start + c.len / 2 - m.t) }; })
                     .sort(function(a, b){ return a.d - b.d; })[0];
      if(near && near.d < Math.max(2, len * 0.75)){
        if(near.c.named.indexOf(m.what) < 0) near.c.named.push(m.what);
      } else {
        const dur = (it.probe && it.probe.duration) || 0;
        const start = Math.max(0, Math.min(dur ? dur - len : m.t, m.t - len / 2));
        out.push({ start:+(start.toFixed(2)), len:len, peakT:m.t, motion:null, audio:null, score:null,
                   why:"the eye picked this moment: " + m.what + " (no measured peak anywhere near it — this is the eye's call, not a number's)",
                   named:[m.what] });
      }
    });
    out.forEach(function(c){ if(c.named.length) c.why += " · the eye: " + c.named.join("; "); });
    out.sort(function(a, b){ return (b.score == null ? -1 : b.score) - (a.score == null ? -1 : a.score); });
    const kept = [];
    out.forEach(function(c){
      if(kept.length >= want) return;
      if(kept.some(function(k){ return Math.abs(k.start - c.start) < Math.max(1.5, len * 0.5); })) return;
      kept.push(c);
    });
    kept.sort(function(a, b){ return a.start - b.start; });
    if(!kept.length){
      const dur = (it.probe && it.probe.duration) || 0;
      log("· nothing in " + it.name + " could be measured or named, so the clips fall back to EVEN SPACING — and they will say so", "nt");
      for(let i = 0; i < want; i++){
        const start = dur ? Math.max(0, dur * (i + 0.5) / want - len / 2) : i * len;
        kept.push({ start:+(start.toFixed(2)), len:len, peakT:start + len / 2, motion:null, audio:null, score:null,
                    why:"even spacing — nothing in this file could be measured or named, so this clip claims no peak", named:[] });
      }
    }
    return kept;
  }
  async function cutPickedClips(it, o){
    o = o || {};
    const want = o.want == null ? batch.opts.clips : o.want;
    const len = o.len == null ? batch.opts.clipLen : o.len;
    const crop = o.crop || state.crop;
    const prevStatus = it.status;
    const plan = planClips(it, want, len);
    it.clipPlan = plan;
    if(!plan.length){ log("· clips — none wanted and none planned", "nt"); return []; }
    const mime = pickMime();
    if(!mime || !it.probe || !it.probe.canCapture){
      log("clips read BLOCKED for " + it.name + " — " +
          (!mime ? "this browser cannot record (no MediaRecorder)" : "this browser cannot capture a stream from a <video>") +
          ". The plan of " + plan.length + " clip(s) is kept and printed here, but NO clip is claimed. Stills, the sheet and the vibe still work.", "bad");
      plan.forEach(function(p, i){ log("   plan " + (i + 1) + ": " + p.start.toFixed(1) + "s → " + (p.start + p.len).toFixed(1) + "s — " + p.why, "nt"); });
      it.shorts = [];
      paintQueue();
      return [];
    }
    log("cutting " + plan.length + " clip(s) from " + it.name + " — " + len + "s each · " + crop + " · " + mime +
        " — recording is REAL TIME, about " + secs(plan.length * len + plan.length * 0.8));
    it.status = "cutting"; paintQueue(); paintBatch();
    const out = [];
    for(let i = 0; i < plan.length; i++){
      const p = plan[i];
      if(state.cancel || batch.cancel) break;
      paintBatchBar(i / plan.length, "cutting " + it.name + " — clip " + (i + 1) + " of " + plan.length + " from " + p.start.toFixed(1) + "s");
      log("· clip " + (i + 1) + " from " + p.start.toFixed(1) + "s — " + p.why);
      const outW = crop === "9:16"
        ? Math.min(1080, Math.round((it.probe.h || 1920) * 9 / 16 / 2) * 2)
        : Math.min(1280, it.probe.w || 1280);
      let r = null;
      try{ r = await recordClip(it.video, p.start, p.len, crop, mime, outW); }
      catch(e){ r = { error:((e && e.message) || String(e)) }; }
      if(!r || r.error){ log("· clip " + (i + 1) + " was NOT written — " + ((r && r.error) || "unknown reason"), "bad"); continue; }
      const clip = { blob:r.blob, url:URL.createObjectURL(r.blob), bytes:r.bytes, len:r.len, start:p.start, end:p.start + p.len,
                     muted:r.muted, ext:r.ext, mime:r.mime, note:r.note, why:p.why, motion:p.motion, audio:p.audio,
                     score:p.score, peakT:p.peakT, named:p.named, name:it.name };
      /* the clip's own poster: one frame of the busiest instant inside it, which
         is both the clip's thumbnail and a picture the reel can use */
      try{
        const dur = it.probe.duration || 0;
        const pt = Math.max(0, Math.min(dur ? dur - 0.05 : p.peakT, p.peakT));
        await seek(it.video, pt);
        const c = document.createElement("canvas");
        drawInto(it.video, c, 1280, crop);
        const pb = await canvasBlob(c, "image/jpeg", 0.94);
        if(pb) clip.poster = { blob:pb, url:URL.createObjectURL(pb), bytes:pb.size, w:c.width, h:c.height, t:p.peakT };
      }catch(e){}
      out.push(clip);
      log("· clip " + (i + 1) + " — " + kb(r.bytes) + " · " + r.len.toFixed(1) + "s" + (r.muted ? " · SILENT" : "") +
          (r.note ? " (" + r.note + ")" : "") + (clip.poster ? " · poster at " + p.peakT + "s" : ""), r.muted ? "nt" : "ok");
      paintQueue();
    }
    it.shorts = out;
    it.status = prevStatus === "done" ? "done" : "working";
    state.shorts = out;
    paintShorts(); paintStats(); paintQueue(); paintBatch();
    if(!out.length){ log("no clip was written for " + it.name + ". Nothing is claimed.", "nt"); return out; }
    const silent = out.filter(function(s){ return s.muted; }).length;
    log(it.name + " — " + out.length + " clip(s), " + kb(out.reduce(function(a, s){ return a + s.bytes; }, 0)) +
        (batch.opts.audio !== "off" && it.pulse && it.pulse.hasAudio ? " · chosen on motion + loudness" : " · chosen on motion only") +
        (silent ? " · " + silent + " SILENT" : " · sound captured"), "gd");
    return out;
  }

  /* ---------------------------------------------------------- the sweep */
  async function sweepOne(it, idx){
    if(sweeping){ toast("One sweep at a time.", "bad"); return null; }
    if(!it) return null;
    sweeping = true;
    batch.phase = it.name;
    try{
      if(Q.active !== it) activate(it);
      it.err = "";
      it.t0 = performance.now();
      if(it.status === "failed" && !it.probe){
        log(it.name + " was already skipped — " + (it.err || "its metadata never arrived"), "nt");
        return null;
      }
      it.status = "reading"; paintQueue(); paintBatch();
      const probe = await ensureProbe(it);
      if(!probe){
        if(it.status !== "failed"){ it.status = "failed"; it.err = "the metadata never arrived"; }
        paintQueue(); paintBatch(); paintStats();
        return null;
      }
      if(!probe.canCapture)
        log(it.name + " — this browser cannot capture a stream from a <video>, so its CLIPS read BLOCKED. Its stills, sheet and vibe still work.", "nt");
      it.status = "working"; paintQueue();

      log("— " + it.name + " · " + kb(it.size) + " · " + (idx + 1) + " of " + Q.items.length + " —", "gd");
      const t0 = performance.now();

      /* 1 — the stills, evenly across the whole file */
      const stills = Math.max(1, batch.opts.perVideo | 0);
      await grabFrames(stills, state.maxW, { quiet:true });
      if(!state.frames.length)
        log("no still came out of " + it.name + " — the browser gave nothing to draw. The file is skipped rather than guessed at.", "bad");
      it.frames = state.frames;

      /* 2 — THE MEASUREMENT. Everything downstream depends on it, and nothing
             claims to know where the life in this file is until it has run. */
      await measurePulse(it);

      /* 3 — the stills at the busiest moments, appended in time order, so the
             sheet (and the eye, and the reel) hold the ACTION and not only the
             room. This is the "capture the vibes" half of the still pass. */
      if(it.pulse && (batch.opts.peaks | 0) > 0){
        const tops = window.Pulse.pick(it.pulse, { count:batch.opts.peaks | 0, len:Math.max(1.5, Math.min(2.5, batch.opts.clipLen)) });
        /* two peaks can land on the same second — and a second that already had a
           still in it is not pulled twice. The times are deduped before the pull,
           and the line quotes the stills that actually came out. */
        const asked = [];
        tops.forEach(function(p){
          const t = +p.peakT;
          if(!asked.some(function(x){ return Math.abs(x - t) < 0.35; })) asked.push(t);
        });
        if(asked.length){
          const got = await grabFramesAt(asked, state.maxW, { quiet:true });
          it.frames = state.frames;
          log("· the busiest " + asked.length + " moment(s) were pulled as stills too — " +
              (got.length ? got.map(function(f){ return f.t.toFixed(1) + "s"; }).join(", ") : "none: every one of them already had a still there") +
              (got.length < asked.length ? " (" + (asked.length - got.length) + " already had a still there)" : ""), "gd");
        } else {
          log("· no peak stills — the measured peaks all landed on the same second", "nt");
        }
      } else if((batch.opts.peaks | 0) > 0 && !it.pulse){
        log("· no peak stills could be pulled — the file was not measured", "nt");
      }

      /* 4 — the sheet, every tile stamped with its own second */
      await buildSheet(null, { times:true });
      it.sheet = state.sheet;

      /* 5 — the eye: the vibe, one line per tile, and WHERE things happen */
      await readVibe();
      it.vibe = state.vibeText; it.brief = state.brief;
      it.tiles = (state.tiles || []).slice(); it.moments = (state.moments || []).slice();

      /* 6 — the clips, from the numbers, with the eye's moments folded in */
      if((batch.opts.clips | 0) > 0) await cutPickedClips(it);
      else log("· clips — none asked for (the chip says none)", "nt");

      it.t1 = performance.now();
      it.status = "done";
      it.note = it.frames.length + " still(s) · " + (it.sheet ? kb(it.sheet.bytes) + " sheet" : "no sheet") + " · " +
                it.shorts.length + " clip(s) · " + (it.pulse ? "pulse measured" : "NOT measured") + " · " +
                ((performance.now() - t0) / 1000).toFixed(0) + "s";
      log(it.name + " is swept — " + it.note, "ok");
      return it;
    }catch(e){
      it.status = "failed"; it.err = "the sweep of this file threw: " + ((e && e.message) || e);
      log(it.name + " — " + it.err, "bad");
      return null;
    }finally{
      sweeping = false;
      if(Q.active) Q.active.frames = state.frames;
      paintQueue(); paintBatch(); paintStats();
    }
  }

  /* ------------------------------------------------- the reel of everything */
  async function buildMasterReel(){
    const mode = batch.opts.reel;
    if(mode === "off"){ log("· the reel — nothing was put in it (the chip says nothing)", "nt"); return 0; }
    if(!window.Reel){ log("the reel engine did not load — no reel was assembled", "bad"); return 0; }
    const cand = [];
    Q.items.forEach(function(it){
      if(it.status === "failed" && !it.frames.length) return;
      /* the clips' own posters first: those are the moments of actual life, and
         they are pictures the reel can hold like any other */
      (it.shorts || []).forEach(function(s, j){
        if(s.poster) cand.push({ f:s.poster, tag:it.name + " · clip " + (j + 1) + " @" + s.start.toFixed(1) + "s",
                                 line:(s.named && s.named[0]) || "", energy:(s.score == null ? 0.5 : s.score), from:"clip" });
      });
      const all = it.frames || [];
      const use = mode === "all" ? all.slice() : (it.pulse ? window.Pulse.topFrames(it.pulse, all, Math.min(8, all.length)) : all.slice(0, 8));
      use.forEach(function(f){
        const s = it.pulse ? window.Pulse.at(it.pulse, f.t) : null;
        cand.push({ f:f, tag:it.name + " @" + (f.t != null ? f.t.toFixed(1) + "s" : "—"),
                    line:(it.tiles || [])[f.tile] || "", energy:s ? s.score : 0 });
      });
    });
    if(!cand.length){ log("· the reel — not one picture came out of the queue, so nothing is in it", "nt"); return 0; }
    const CAP = 42;
    const use = window.Pulse ? window.Pulse.thin(cand, CAP) : cand.slice(0, CAP);
    if(use.length < cand.length)
      log("· the reel — " + cand.length + " picture(s) were available and " + CAP +
          " is as long as one reel should be, so " + (cand.length - use.length) +
          " were thinned out evenly. All of them are still in the queue and in the zip.", "nt");
    clearShots();
    use.forEach(function(s){
      pushShot({ url:s.f.url, name:s.tag, bytes:s.f.bytes, motion:"auto", hold:+state.reelUI.per || 2.6,
                 caption:"", what:s.line, energy:s.energy, from:s.from || "still" }, true);
    });
    captureSoul("REEL ASSEMBLED: " + state.shots.length + " picture(s) from " + Q.items.length + " video(s), taken at their measured peaks",
                "video node · run " + runNo);
    const ok = await ensureBitmaps();
    if(!ok) log("some pictures would not decode and are out of the reel — the render will say the same thing", "nt");
    await refreshThumbs();
    const d = window.Reel.duration(reelOpts());
    log("· the reel holds " + state.shots.length + " picture(s) from " + Q.items.filter(function(x){ return (x.frames || []).length; }).length +
        " video(s) — the clips' own peak frames first, then each video's busiest stills, in time order. " +
        d.total.toFixed(1) + "s at " + state.reelUI.per + "s a picture.", "ok");
    if(d.total > 75) log("· that is a long reel for a venue — set 'seconds a picture' in the reel card lower if you want it under a minute", "nt");
    paintShots(); paintReelReadout(); showStage("reel");
    return state.shots.length;
  }
  /* the story, over the reel of the whole drop */
  async function sellTheReel(){
    if(!state.shots.length){ log("· nothing was put in the reel, so there is nothing to sell", "nt"); return null; }
    const li = $("lookupInput");
    if(li && li.value.trim() && !(state.offer && state.offer.ok)) await lookupOffering();
    if(!state.offer || !state.offer.ok)
      log("· no offering was read, so the register writes from the pictures and the vibes alone — no number is invented for it", "nt");
    /* the master story is told over EVERY video's look, each headed by its file */
    const parts = Q.items.filter(function(it){ return it.vibe; }).map(function(it){ return "—— " + it.name + " ———\n" + it.vibe; });
    if(parts.length){ state.vibeText = parts.join("\n\n").slice(0, 6000); paintVibe(); }
    await writeTheStory();
    if(state.story) dressReel();
    else log("no story was written, so the reel goes out undressed — every picture still carries its own tile line", "nt");
    return await renderReel();
  }
  async function runSweep(){
    if(batch.running){ toast("The sweep is already running — ■ Stop ends it.", "bad"); return null; }
    if(!Q.items.length){ toast("Drop some video first.", "bad"); return null; }
    const todo = Q.items.filter(function(it){ return it.status !== "failed"; });
    if(!todo.length){ toast("Every queued file was skipped — nothing to sweep.", "bad"); return null; }
    batch.running = true; batch.cancel = false; state.cancel = false;
    const bb = $("batchBtn"), bc = $("batchCancelBtn");
    if(bb){ bb.disabled = true; bb.innerHTML = '<span class="spin"></span> Sweeping…'; }
    if(bc) bc.hidden = false;
    const w = $("batchBarWrap"); if(w) w.hidden = false;
    const est = todo.length * ((batch.opts.clips | 0) > 0 ? batch.opts.clips * (batch.opts.clipLen + 0.8) : 0);
    log("— THE SWEEP — " + todo.length + " video(s) of " + Q.items.length + " queued, one pass: " +
        "stills → measure the pulse → the sheet → the eye → the clips → the reel → the story → the render —", "gd");
    if(est) log("recording is REAL TIME, so roughly " + secs(est) + " of this run is the clips and cannot be hurried (" +
                (batch.opts.clips) + " a video × " + batch.opts.clipLen + "s). Keep this tab in the FRONT.", "nt");
    const t0 = performance.now();
    let swept = 0, skipped = 0;
    try{
      for(let i = 0; i < Q.items.length; i++){
        const it = Q.items[i];
        if(batch.cancel) break;
        if(it.status === "failed" && !it.probe){ skipped++; log("· skipping " + it.name + " — " + (it.err || "it never loaded"), "nt"); continue; }
        const r = await sweepOne(it, i);
        if(it.status === "done") swept++; else skipped++;
      }
      if(!batch.cancel){
        paintBatchBar(0.72, "the queue is swept — building the reel from everything");
        await buildMasterReel();
      } else {
        log("the sweep was stopped — the reel is not assembled from a partial run", "nt");
      }
      if(!batch.cancel && batch.opts.sell === "story" && state.shots.length){
        paintBatchBar(0.86, "writing the story over " + state.shots.length + " picture(s)");
        await sellTheReel();
        paintBatchBar(0.98, "done");
      } else if(batch.opts.sell !== "story"){
        log("· and then — the chip says stop at the clips, so no story was written and no reel was rendered", "nt");
      }
    }catch(e){
      log("the sweep stopped on an error: " + ((e && e.message) || e), "bad");
    }
    batch.running = false; batch.cancel = false;
    if(bb){ bb.disabled = false; bb.innerHTML = "✦ Run the whole thing"; }
    if(bc) bc.hidden = true;
    paintBatchBar(1, "");
    setTimeout(batchBarOff, 1600);
    const clips = Q.items.reduce(function(a, x){ return a + (x.shorts || []).length; }, 0);
    const stills = Q.items.reduce(function(a, x){ return a + (x.frames || []).length; }, 0);
    const moments = Q.items.reduce(function(a, x){ return a + ((x.moments || []).length); }, 0);
    log("— THE SWEEP IS DONE — " + swept + " of " + Q.items.length + " video(s) swept" + (skipped ? ", " + skipped + " skipped" : "") +
        " · " + stills + " still(s) · " + clips + " clip(s) · the eye named " + moments + " moment(s) · " +
        (state.reel ? "one reel, " + kb(state.reel.bytes) + (state.reel.verified && state.reel.verified.ok ? " (" + state.reel.verified.seconds.toFixed(1) + "s, read back playable)" : "") : "no reel") +
        " · " + ((performance.now() - t0) / 1000).toFixed(0) + "s of wall clock", "ok");
    if(skipped) log("every skipped file is named above with its reason. Nothing was assumed about it.", "nt");
    log("everything is on this page — ⬇ Everything, zipped takes the stills, the clips, every clip poster, the sheets, the vibe and the brief in one file.", "gd");
    captureSoul("SWEEP: " + Q.items.length + " video(s) → " + stills + " stills · " + clips + " clips · " +
                (state.reel ? kb(state.reel.bytes) + " reel" : "no reel") + " · " + moments + " moment(s) named by the eye",
                "video node · run " + runNo + " · measured, cut and encoded in this browser, nothing uploaded");
    toast("The sweep is done — " + clips + " clip(s), " + stills + " still(s).", "ok");
    speak("The sweep is done.");
    paintQueue(); paintStats(); paintBatch();
    return { swept:swept, skipped:skipped, stills:stills, clips:clips, reel:state.reel ? state.reel.bytes : 0 };
  }
  /* a reel of ONE video, without disturbing the master: the reel is emptied and
     refilled from that item's busiest pictures, rendered, and then the master's
     contents are put back exactly as they were (its bitmaps are NOT closed). */
  async function reelOfItem(it){
    if(!it || !window.Reel){ log("the reel engine did not load", "bad"); return null; }
    if(!(it.frames || []).length){ toast("That video has no stills yet — sweep it first.", "bad"); return null; }
    const keepShots = state.shots, keepBmp = state.shotBmp, keepReel = state.reel;
    state.shots = []; state.shotBmp = {};
    const use = it.pulse ? window.Pulse.topFrames(it.pulse, it.frames, Math.min(12, it.frames.length)) : it.frames.slice(0, 12);
    use.forEach(function(f){
      pushShot({ url:f.url, name:it.name + " @" + (f.t != null ? f.t.toFixed(1) + "s" : "—"), motion:"auto",
                 hold:+state.reelUI.per || 2.6, caption:"", what:(it.tiles || [])[f.tile] || "", from:"still" }, true);
    });
    await ensureBitmaps(); await refreshThumbs();
    log("rendering a reel of " + it.name + " alone — " + state.shots.length + " of its busiest picture(s)", "gd");
    const r = await renderReel();
    it.reel = r ? { bytes:r.bytes, url:r.url, seconds:(r.verified && r.verified.ok) ? r.verified.seconds : r.seconds } : null;
    const mine = state.shotBmp;
    state.shots = keepShots; state.shotBmp = keepBmp; state.reel = keepReel;
    Object.keys(mine).forEach(function(k){ if(!keepBmp[k]) try{ mine[k].close(); }catch(e){} });
    paintShots(); paintReelReadout();
    if(r) log("· " + it.name + " has a reel of its own — " + kb(r.bytes) + " · the master reel is back exactly where it was", "ok");
    paintQueue();
    return r;
  }
  /* EVERYTHING, ONE ZIP: every still, every clip, every clip poster, every sheet,
     the vibe and the brief per file, the story, the reel, and a README that says
     which clip was chosen on what. */
  async function zipAll(){
    const items = [];
    const head = [];
    if(state.story){
      const txt = window.Story.order.map(function(k){ return k + ": " + (state.story.beats[k] || ""); }).join("\n") +
                  "\n\nCAPTION: " + (state.story.beats.CAPTION || "") + "\n\n" + (state.story.tags || []).join(" ");
      items.push({ name:"story.txt", blob:new Blob([txt], { type:"text/plain" }) });
    }
    Q.items.forEach(function(it){
      const base = (it.name.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_").slice(0, 48)) || ("video-" + it.id);
      head.push(base + ": " + it.size + " bytes · " + (it.probe ? it.probe.w + "x" + it.probe.h + " · " + (it.probe.duration || 0).toFixed(1) + "s" : "NEVER LOADED") +
                " · " + it.frames.length + " still(s) · " + it.shorts.length + " clip(s) · " +
                (it.pulse ? "pulse measured (" + it.pulse.samples.length + " samples, " + (it.pulse.hasAudio ? "motion + loudness" : "MOTION ONLY") + ")" : "NOT measured"));
      if(it.sheet) items.push({ name:base + "-sheet.jpg", blob:it.sheet.blob });
      (it.frames || []).forEach(function(f, i){
        items.push({ name:base + "-still-" + String(i + 1).padStart(2, "0") + "-" + (f.t != null ? f.t.toFixed(1) + "s" : "x") + ".jpg", blob:f.blob });
      });
      (it.shorts || []).forEach(function(s, i){
        items.push({ name:base + "-clip-" + String(i + 1).padStart(2, "0") + "-" + s.start.toFixed(1) + "s" + (s.ext || ".webm"), blob:s.blob });
        if(s.poster) items.push({ name:base + "-clip-" + String(i + 1).padStart(2, "0") + "-poster.jpg", blob:s.poster.blob });
      });
      if(it.vibe) items.push({ name:base + "-vibe.txt", blob:new Blob([it.vibe], { type:"text/plain" }) });
      if(it.brief) items.push({ name:base + "-brief.txt", blob:new Blob([it.brief], { type:"text/plain" }) });
      if((it.shorts || []).length)
        items.push({ name:base + "-clips.txt", blob:new Blob([it.shorts.map(function(s, i){
          return "#" + (i + 1) + "  " + s.start.toFixed(1) + "s → " + (s.end != null ? s.end.toFixed(1) : (s.start + s.len).toFixed(1)) + "s  (" +
                 s.len.toFixed(1) + "s" + (s.muted ? ", SILENT" : "") + ")\n    chosen on: " + (s.why || "even spacing") + "\n";
        }).join("\n")], { type:"text/plain" }) });
    });
    if(state.reel) items.push({ name:"reel" + (state.reel.ext || ".mp4"), blob:state.reel.blob });
    if(!items.length){ toast("Nothing to zip yet.", "bad"); return 0; }
    items.push({ name:"README.txt", blob:new Blob([
      "VIDEO NODE — everything from one sweep.\n\n" + head.join("\n") +
      "\n\nEvery file here was produced IN THIS BROWSER from files on your disk. Nothing was uploaded.\n" +
      "Clips are cut from each video's MEASURED peaks — motion (frame-to-frame luma change), plus loudness when the file " +
      "was small enough to read whole. Each clip's own reason, with the numbers it was chosen on, is in the -clips.txt " +
      "beside it. Where a clip's reason says \"the eye\", the vision pass named that moment; where it says \"even spacing\", " +
      "nothing could be measured and the node says so rather than pretending to have found something.\n" +
      (state.reel ? "\nreel" + (state.reel.ext || ".mp4") + " — the reel of the whole sweep, read back through a <video> and verified playable.\n" : "")
    ], { type:"text/plain" }) });
    try{
      const zip = await zipStore(items);
      download(zip, "video-node-sweep-" + new Date().toISOString().slice(0, 10) + ".zip");
      log("zipped " + items.length + " file(s) — " + kb(zip.size) + " · every still, clip, poster, sheet, vibe, brief and the story", "ok");
      return zip.size;
    }catch(e){
      log("the zip failed: " + ((e && e.message) || e) + " — download the pieces instead", "bad");
      return 0;
    }
  }


  /* ==========================================================================
     THE OTHER THREE DOORS, AND THE CONDUCTOR.

     Doors 1 and 2 (video, pictures) are the queue above. This is doors 3 and 4
     (the links they already have, and the sovereign's own words) plus the pass
     that turns the whole drop into a blueprint and an audit.

     The division of labour is deliberate:
       · src/drop.js measures and reads — the link audit is CODE, from the fetches.
       · the model researches the INDUSTRY and writes the PLAN. It is told, and
         told again, that industry knowledge is a prior and must be marked as one.
       · the register (src/story.js) writes the copy, and its own law is checked
         in code before anything is burned into a picture.
       · this file holds them together, paints them, and refuses to call anything
         finished that did not pass its audit.
     ========================================================================== */
  const DROP = {
    images:[], links:[], pages:[], linkAudit:null,
    prompt:{ text:"", name:"", industry:"", job:"" },
    research:null, blueprint:null, orders:[], made:[], auditData:null, gate:null, doc:"", busy:false
  };

  function condBar(frac, text){
    const w = $("condBarWrap"), b = $("condBar"), st = $("condStatus");
    if(w) w.hidden = false;
    if(b) b.style.width = (100 * Math.max(0, Math.min(1, frac || 0))).toFixed(1) + "%";
    if(st && text) st.textContent = text;
  }
  function condBarOff(){ const w = $("condBarWrap"), b = $("condBar"); if(w) w.hidden = true; if(b) b.style.width = "0%"; }

  /* the pictures the owner dropped, as assets — measured, not assumed */
  function syncImages(){
    DROP.images = state.shots.filter(function(s){ return s.from === "image"; }).map(function(s){
      return { name:s.name, bytes:s.bytes || 0, url:s.url, w:s.w || 0, h:s.h || 0, kb:Math.round((s.bytes || 0) / 1024) };
    });
  }
  function dropCtx(){
    return {
      prompt: DROP.prompt,
      pages: DROP.pages,
      linkAudit: DROP.linkAudit,
      videos: Q.items.map(function(it){
        const s = it.shorts || [];
        return { name:it.name, w:it.probe ? it.probe.w : 0, h:it.probe ? it.probe.h : 0,
                 seconds:it.probe ? it.probe.duration : 0, clips:s.length,
                 pulse: it.pulse ? { samples:it.pulse.samples.length, hasAudio:it.pulse.hasAudio } : null,
                 silent: s.length ? s.every(function(x){ return x.muted; }) : false,
                 moments:(it.moments || []).length };
      }),
      images: DROP.images.map(function(i){ return { name:i.name, w:i.w, h:i.h, bytes:i.bytes, kb:i.kb }; }),
      vibe: state.vibeText,
      story: state.story,
      reel: state.reel ? { bytes:state.reel.bytes, container:state.reel.container, engine:state.reel.engine,
                           audio:!!state.reel.audio,
                           seconds:(state.reel.verified && state.reel.verified.ok) ? state.reel.verified.seconds : (state.reel.seconds || 0),
                           verified:!!(state.reel.verified && state.reel.verified.ok) } : null,
      orders: DROP.orders, made: DROP.made, run: runNo,
      gate: DROP.gate
    };
  }

  function paintDrops(){
    const lm = $("linksMeta");
    if(lm){
      const contact = function(p){ return p.kind.id === "email" || p.kind.id === "phone"; };
      const read = DROP.pages.filter(function(p){ return p.read; }).length;
      const contacts = DROP.pages.filter(contact).length;
      /* a telephone number and an address are ways to be contacted, not pages.
         Calling them "unread" would read as a failure, and they are not one. */
      const unread = DROP.pages.filter(function(p){ return !p.read && !contact(p); }).length;
      lm.innerHTML = DROP.pages.length
        ? "<b>" + read + "</b> page(s) read · " + (unread ? "<b>" + unread + "</b> unread · " : "") + (contacts ? "<b>" + contacts + "</b> way(s) to be contacted" : "")
        : (DROP.links.length ? "<b>" + DROP.links.length + "</b> link(s) typed, not read yet" : "");
    }
    const cm = $("condMeta");
    if(cm){
      const a = DROP.auditData;
      const g = DROP.gate;
      cm.innerHTML = [
        DROP.research ? "research <b>✓</b>" : "",
        DROP.blueprint ? "blueprint <b>✓</b>" : "",
        a ? "<b>" + a.passes.length + "</b>P · <b>" + a.warns.length + "</b>W · <b>" + a.holes.length + "</b>H · <b>" + a.fails.length + "</b>F" : "",
        g ? "<b>" + g.verdict + "</b>" : ""
      ].filter(Boolean).join(" · ");
    }
    paintGate();
  }
  function paintPages(){
    const el = $("pagesBox"); if(!el) return;
    if(!DROP.pages.length){ el.innerHTML = '<div class="hint">No link read yet.</div>'; return; }
    el.innerHTML = DROP.pages.map(function(p){
      const contact = (p.kind.id === "email" || p.kind.id === "phone");
      const state = contact ? "held" : (p.read ? (p.thin ? "warn" : "ok") : "bad");
      const badge = contact ? "A WAY TO BE CONTACTED" : (p.read ? (p.thin ? ("THIN — only " + p.words + " words") : (p.words + " words read")) : "UNREAD");
      return '<div class="pg' + (p.read || contact ? "" : " bad") + '">' +
        '<div class="ph"><span class="pi">' + p.kind.icon + '</span><b>' + esc(p.kind.label) + '</b>' +
        '<span class="pu" title="' + esc(p.url) + '">' + esc(p.url.replace(/^https?:\/\//, "").slice(0, 52)) + '</span>' +
        '<span class="pv ' + state + '">' + badge + '</span></div>' +
        (contact
          ? '<div class="pd">' + esc(p.handle || p.url) + ' — a way to be contacted, not a page, so there is nothing here to read. It counts as GIVEN.</div>'
          : (p.read
            ? (p.title ? '<div class="pt">' + esc(String(p.title).slice(0, 150)) + '</div>' : "") +
              '<div class="pd">' + [(p.found && p.found.headings || 0) + " section(s)", (p.found && p.found.items || 0) + " item(s)",
                (p.found && p.found.prices || 0) + " money line(s)", (p.found && p.found.phones || 0) + " contact(s)",
                (p.links || []).length + " outbound link(s)"].join(" · ") + "</div>" +
              (p.thin ? '<div class="pd">read, but it yielded almost nothing — a page that needs JavaScript or sits behind a login. Read-but-thin, so nothing is claimed from it.</div>' : "")
            : '<div class="pd">' + esc(p.why || "could not be read") + " — recorded as UNREAD, which is not the same as absent</div>")) +
        '</div>';
    }).join("");
    paintDrops();
  }
  function paintLinkAudit(){
    const el = $("linkAuditBox"); if(!el) return;
    const a = DROP.linkAudit;
    if(!a){ el.innerHTML = ""; return; }
    const cls = function(v){ return v === "LINKED" ? "ok" : (v.indexOf("NOT LINKED") >= 0 ? "bad" : "warn"); };
    el.innerHTML = '<div class="ah">The link audit — in code, from the fetches, with no model in it</div>' +
      (a.primary ? '<div class="hint" style="text-align:left">Their own site is <b>' + esc(a.primary.replace(/^https?:\/\//, "")) +
                   '</b> and it links out to ' + a.siteHosts + ' host(s).</div>' : '<div class="hint" style="text-align:left">No page of theirs was readable as a website, so the cross-check has nothing to stand on.</div>') +
      a.rows.map(function(r){
        return '<div class="lr ' + cls(r.verdict) + '"><span class="li">' + r.icon + '</span><b>' + esc(r.label) + '</b>' +
               '<span class="lv">' + esc(r.verdict) + '</span>' + (r.need ? '<span class="ln">this industry needs it</span>' : "") +
               (r.why ? '<span class="lw">' + esc(r.why) + '</span>' : "") + '</div>';
      }).join("") +
      a.mismatches.map(function(m){
        return '<div class="lr bad"><span class="li">!</span><b>' + esc(m.kind) + ' DISAGREEMENT</b><span class="lv">' + esc(m.detail) + '</span></div>';
      }).join("") +
      (a.unread.length ? '<div class="hint" style="text-align:left">Unread, and therefore unproven rather than absent: ' + esc(a.unread.join(" · ")) + '</div>' : "");
  }
  function paintResearch(){
    const el = $("researchBox"); if(!el) return;
    const r = DROP.research;
    if(!r){ el.innerHTML = ""; return; }
    if(!r.ok){ el.innerHTML = '<div class="hint">the research failed: ' + esc(r.why) + '</div>'; return; }
    el.innerHTML = "<h4>◇ The research</h4>" +
      '<div class="rh">' + esc(r.industry) + " — " + esc(r.customer) + "</div>" +
      (r.checks.length ? "<h5>What a customer checks, in order</h5><ul>" + r.checks.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      (r.practice.length ? "<h5>Best practice for this industry <i>(the model's knowledge — a prior, not a measurement)</i></h5><ul>" + r.practice.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      (r.must.length ? "<h5>Channels and pages this industry needs</h5><ul>" + r.must.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      (r.wins.length ? "<h5>Quick wins, given what was read</h5><ul>" + r.wins.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "");
  }
  function paintBlueprint(){
    const el = $("blueprintBox"); if(!el) return;
    const b = DROP.blueprint;
    if(!b){ el.innerHTML = ""; return; }
    if(!b.ok){ el.innerHTML = '<div class="hint">the blueprint failed: ' + esc(b.why) + '</div>'; return; }
    const kv = function(k){ return b.blocks[k] ? "<div class='bk'><b>" + k + "</b><span>" + esc(b.blocks[k]) + "</span></div>" : ""; };
    el.innerHTML = "<h4>✧ The blueprint — the first prototype</h4>" +
      kv("IDENTITY") + kv("OFFER") + kv("AUDIENCE") + kv("POSITION") +
      (b.pillars.length ? "<h5>The pillars</h5><ul>" + b.pillars.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      (b.proof.length ? "<h5>Proof — mechanism · disruption · outcome</h5><ul>" + b.proof.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      (b.page.length ? "<h5>The running order</h5><ol>" + b.page.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" : "") +
      (b.links.length ? "<h5>Links to add or fix</h5><ul>" + b.links.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      ((b.copy.HEADLINE || b.copy.KICKER || b.copy.CTA)
        ? "<h5>The copy</h5><ul>" + ["HEADLINE","KICKER","CTA"].filter(function(k){ return b.copy[k]; })
            .map(function(k){ return "<li><b>" + k + "</b> " + esc(b.copy[k]) + "</li>"; }).join("") + "</ul>" : "") +
      (b.next ? "<div class='bk'><b>NEXT</b><span>" + esc(b.next) + "</span></div>" : "");
  }
  function paintOrders(){
    const el = $("ordersBox"); if(!el) return;
    if(!DROP.orders.length){ el.innerHTML = DROP.blueprint ? '<div class="hint">No orders — nothing the prototype needs is missing.</div>' : ""; return; }
    const ctx = dropCtx();
    el.innerHTML = "<div class='ah'>✦ The orders — what must be made, which hand makes it, and whether that hand has answered</div>" +
      DROP.orders.map(function(o){
        const f = window.Drop.orderFilled(o, ctx);
        return '<div class="ord' + (f.ok ? " done" : "") + '"><b>' + esc(o.slot) + '</b>' +
               '<span class="oa">→ the ' + esc(o.agent) + ' agent</span>' +
               '<span class="ow">' + esc(o.want) + '</span>' +
               '<span class="op">' + esc(o.prompt) + '</span>' +
               '<span class="om">' + (f.ok ? "answered — " + esc(f.measured) : "open — " + esc(f.why)) + "</span>" +
               "</div>";
      }).join("");
  }
  function paintMade(){
    const el = $("madeBox"); if(!el) return;
    if(!DROP.made.length){ el.innerHTML = ""; return; }
    el.innerHTML = "<div class='ah'>The assets the orders produced — on this page, never uploaded</div>" +
      DROP.made.map(function(m, i){
        return '<div class="mk"><img src="' + m.dataUrl + '" alt="' + esc(m.slot) + '">' +
               '<div class="mm"><b>' + esc(m.slot) + '</b><span>' + m.w + "×" + m.h + " · " + Math.round(m.bytes / 1024) + " KB</span>" +
               '<span class="mp">' + esc(String(m.prompt).slice(0, 160)) + '</span>' +
               '<button class="tbtn" data-mkdl="' + i + '">⬇</button></div></div>';
      }).join("");
    el.querySelectorAll("[data-mkdl]").forEach(function(b){
      b.onclick = function(){
        const m = DROP.made[+b.dataset.mkdl]; if(!m) return;
        const a = document.createElement("a"); a.href = m.dataUrl;
        a.download = (m.slot.replace(/[^\w.-]+/g, "-").slice(0, 40) || "asset") + ".jpg";
        document.body.appendChild(a); a.click(); a.remove();
      };
    });
  }
  function paintAuditBox(){
    const el = $("auditBox"); if(!el) return;
    const a = DROP.auditData;
    if(!a){ el.innerHTML = ""; return; }
    const V = { PASS:"ok", WARN:"warn", HOLE:"hole", FAIL:"bad" };
    el.innerHTML = "<div class='ah'>▣ The audit — <b>" + a.passes.length + "</b> pass · <b>" + a.warns.length + "</b> warn · <b>" +
        a.holes.length + "</b> hole · <b>" + a.fails.length + "</b> fail</div>" +
      "<table class='at'><tbody>" + a.rows.map(function(r){
        return "<tr class='" + (V[r.verdict] || "") + "'><td class='k'>" + esc(r.kind) + "</td>" +
               "<td class='a'>" + esc(String(r.asset).slice(0, 54)) + "</td>" +
               "<td class='v'>" + r.verdict + "</td>" +
               "<td class='m'>" + esc(String(r.measured).slice(0, 80)) + "</td>" +
               "<td class='w'>" + esc(String(r.why).slice(0, 240)) + "</td></tr>";
      }).join("") + "</tbody></table>" +
      (a.fails.length
        ? '<div class="hint" style="text-align:left; color:var(--bad)">' + a.fails.length +
          " hard rule(s) are broken <b>in this node's own output</b> — a claim it cannot stand behind, or a file that will not play. Nothing should be executed until they are fixed, then audit again.</div>"
        : '<div class="hint" style="text-align:left; color:var(--ok)">No hard rule is broken in the content this node produced. ' +
          (a.holes.length ? a.holes.length + " hole(s) remain (things the prototype still needs)." : "Nothing is missing either.") + "</div>");
  }

  function setLinksFromInput(){
    const t = $("linksInput");
    const raw = String((t && t.value) || "");
    const out = [];
    raw.split(/[\n\r,;]+/).forEach(function(line){
      const s = line.trim();
      if(!s || /^#/.test(s)) return;
      /* A line may hold several links separated by spaces — but a PHONE NUMBER
         holds spaces too. Splitting "+84 768 701 106" on whitespace is how this
         node once tried to fetch https://0.0.106/, and then reported four dead
         websites as if the owner had given them. So a line is split further
         ONLY when every piece looks like a link. */
      const parts = s.split(/\s+/).filter(Boolean);
      if(parts.length > 1 && parts.every(function(p){ return /[.\/:@]/.test(p); })) parts.forEach(function(p){ out.push(p); });
      else out.push(s);
    });
    DROP.links = out;
    return DROP.links;
  }
  async function readTheLinks(quiet){
    setLinksFromInput();
    if(!DROP.links.length){ if(!quiet) toast("Give it at least one link.", "bad"); return null; }
    const btn = $("readLinksBtn");
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Reading…'; }
    log("reading " + DROP.links.length + " link(s) live — every one through superFetch, read in code, nothing edited", "gd");
    try{
      DROP.pages = await window.Drop.readUrls(DROP.links, {
        onStep:function(i, n, s){ condBar(0.05 + 0.2 * (i / n), "reading " + (i + 1) + " of " + n + " — " + s); },
        onNote:function(m){ log("· " + m, "gd"); }
      });
    }catch(e){
      log("the link read failed: " + ((e && e.message) || e), "bad");
    }
    if(btn){ btn.disabled = false; btn.innerHTML = "🔍 Read every link"; }
    const read = DROP.pages.filter(function(p){ return p.read; }).length;
    log("links — " + read + " read · " + (DROP.pages.length - read) + " unread" +
        (DROP.pages.length - read ? " (an unread page is named above with its reason; it is NOT evidence of anything)" : ""), read ? "ok" : "bad");
    captureSoul("LINKS READ: " + DROP.pages.map(function(p){ return p.url + (p.read ? "" : " (UNREAD)"); }).join(" · "),
                "video node · the drop station · fetched live, never edited · run " + runNo);
    paintPages();
    if(DROP.pages.length) crossCheck(true);
    return DROP.pages;
  }
  function crossCheck(quiet){
    if(!DROP.pages.length){ if(!quiet) toast("Read the links first.", "bad"); return null; }
    const need = (DROP.research && DROP.research.channels) || [];
    DROP.linkAudit = window.Drop.auditLinks(DROP.pages, { need:need });
    const a = DROP.linkAudit;
    log("the link audit — " + a.rows.length + " channel(s) judged from the fetches: " +
        a.rows.filter(function(r){ return r.verdict === "LINKED"; }).length + " linked · " +
        a.missingFromSite.length + " they have but their site never links · " +
        a.absentNeeded.length + " this industry needs and was found nowhere", "gd");
    a.missingFromSite.forEach(function(r){
      log("   ! " + r.label + " — " + r.verdict + (r.why ? " (" + r.why + ")" : ""), "nt");
    });
    a.mismatches.forEach(function(m){ log("   ! " + m.kind + " DISAGREEMENT — " + m.detail, "nt"); });
    paintLinkAudit(); paintDrops();
    return a;
  }
  async function runResearch(quiet){
    const ctx = dropCtx();
    if(!ctx.pages.some(function(p){ return p.read; }) && !ctx.prompt.text){
      log("no page was readable and no prompt was given — there is nothing to research. Nothing is claimed.", "bad");
      return null;
    }
    log("researching — what was read, and the model's knowledge of the industry, kept apart", "gd");
    const el = $("researchBox");
    if(el) el.innerHTML = '<div class="hint">researching…</div>';
    DROP.research = await window.Drop.research(ctx, {
      onChunk:function(t){ if(el) el.textContent = t; if(el) el.scrollTop = el.scrollHeight; },
      onNote:function(m){ log("· " + m); }
    });
    if(!DROP.research || !DROP.research.ok){
      log("no research was written: " + ((DROP.research && DROP.research.why) || "unknown"), "bad");
      paintResearch(); return null;
    }
    log("research — " + DROP.research.industry + " · " + DROP.research.checks.length + " thing(s) customers check · " +
        DROP.research.practice.length + " best-practice line(s) · " + DROP.research.must.length + " channel(s) this industry needs", "ok");
    paintResearch(); paintDrops();
    /* the industry's own must-haves sharpen the link audit — a channel this
       industry needs that was found NOWHERE is a different finding from one the
       owner simply never mentioned, and now the audit can tell them apart. */
    if(DROP.pages.length) crossCheck(true);
    return DROP.research;
  }
  async function runBlueprint(quiet){
    const ctx = dropCtx();
    if(!DROP.research && !ctx.pages.length && !ctx.prompt.text){
      log("nothing to build a blueprint from — read the links, or write the prompt", "bad"); return null;
    }
    log("writing the blueprint — identity, offer, the running order, the assets, the copy", "gd");
    const el = $("blueprintBox");
    if(el) el.innerHTML = '<div class="hint">writing…</div>';
    DROP.blueprint = await window.Drop.blueprint(ctx, {
      onChunk:function(t){ if(el) el.textContent = t; if(el) el.scrollTop = el.scrollHeight; }
    });
    if(!DROP.blueprint || !DROP.blueprint.ok){
      log("no blueprint was written: " + ((DROP.blueprint && DROP.blueprint.why) || "unknown"), "bad");
      paintBlueprint(); return null;
    }
    DROP.orders = window.Drop.ordersFor(DROP.blueprint, dropCtx());
    log("the blueprint — " + DROP.blueprint.page.length + " section(s) in the running order · " +
        DROP.blueprint.need.length + " asset order(s) · " + DROP.blueprint.links.length + " link(s) to add", "ok");
    paintBlueprint(); paintOrders(); paintDrops();
    return DROP.blueprint;
  }
  /* ==========================================================================
     THE THREE HANDS — audit, render and perfect the content BEFORE the execution.

     An order is an asset the prototype needs. Each is addressed to the hand that
     can actually make it, and each hand is then RUN rather than described:

       · the IMAGE hand — text-to-image, here in this node: one image per order;
       · the VIDEO hand — this node itself: it builds the reel from the footage
         and RENDERS it (a real film, with the copy burned in);
       · the COPY hand — the register (src/story.js): the house marketing voice,
         writing over the reel's pictures. There is no separate "copy agent" in
         this family; the register IS the copy hand, and its law — no number the
         offering does not state, no reused register example — is then checked in
         code, and a line that breaks it is WITHHELD rather than shipped.

     Nothing is marked done because a step ran: every order is re-audited after
     the hands have worked, and only a hand that actually produced something
     turns its order from a HOLE into a PASS. Then the gate decides.
     ========================================================================== */
  async function runImageHand(orders){
    if(!window.root || !window.root.generateImage){
      log("· the image hand — there is no generateImage (text-to-image-plugin) in this generator, so its " + orders.length +
          " order(s) cannot be made here. Each is kept as an order carrying its agent and its exact prompt, and the image node takes it at ?p=…", "bad");
      return 0;
    }
    let made = 0;
    for(let i = 0; i < orders.length; i++){
      const o = orders[i];
      if(state.cancel) break;
      condBar(0.08 + 0.3 * (i / orders.length), "making " + o.slot + " (" + (i + 1) + " of " + orders.length + ") — the image hand");
      log("· making " + o.slot + " — " + o.prompt.slice(0, 200));
      try{
        const asked = resFor(o.slot + " " + o.want);
        const res = await window.root.generateImage(o.prompt, { resolution:asked });
        const dataUrl = (res && res.dataUrl) || "";
        if(!dataUrl){ log("   " + o.slot + " — the image hand returned nothing. No asset is claimed.", "bad"); continue; }
        /* the plugin reports the resolution it actually used on `inputs`; the
           requested one is the fallback. Never a guess. */
        const reported = (res && res.inputs && res.inputs.resolution) || (res && res.resolution) || asked;
        const wh = (String(reported || "").match(/(\d+)\s*[x×]\s*(\d+)/) || []);
        const mk = { slot:o.slot, agent:"image", prompt:o.prompt, dataUrl:dataUrl,
                     w:wh ? +wh[1] : 0, h:wh ? +wh[2] : 0, bytes:Math.round(dataUrl.length * 0.75) };
        DROP.made.push(mk); made++;
        captureSoul("ASSET MADE: " + o.slot + " — " + o.prompt, "video node · the image hand · run " + runNo);
        log("   " + o.slot + " — made, " + mk.w + "×" + mk.h + " · " + Math.round(mk.bytes / 1024) + " KB", "ok");
      }catch(e){ log("   " + o.slot + " — the image hand failed: " + ((e && e.message) || e), "bad"); }
    }
    return made;
  }

  async function runCopyHand(){
    if(!window.Story){ log("· the copy hand — the register (src/story.js) did not load, so no copy is claimed", "bad"); return false; }
    /* the register writes over pictures. If the reel is empty but stills were
       pulled, those stills ARE the drop's pictures, so they go in first. */
    if(!state.shots.length && state.frames.length){
      await addShotsFromFrames();
      log("· the copy hand — the register writes over pictures, so the stills in hand were put into the reel first (" + state.shots.length + ")", "gd");
    }
    if(!state.shots.length && DROP.made.length){
      await shotsFromMade();
    }
    if(!state.shots.length){
      log("· the copy hand — there are no pictures for the register to write over. Drop pictures, or sweep a video, and the copy can be written", "nt");
      return false;
    }
    if(!(state.offer && state.offer.ok)){
      const u = (DROP.linkAudit && DROP.linkAudit.primary) ||
                ((DROP.pages.filter(function(p){ return p.read && p.kind.id === "site"; })[0] || {}).url) ||
                ((DROP.pages.filter(function(p){ return p.read; })[0] || {}).url) || "";
      if(u){
        log("· the copy hand reads the offering first, so it is never allowed to invent a number: " + u, "gd");
        try{
          const o = await window.Story.lookup(u);
          if(o && o.ok){ state.offer = o; paintOffer();
            log("· the offering — " + o.words + " words · " + o.found.prices + " money line(s) · a number may be used ONLY if it came from here", "gd"); }
          else log("· the offering could not be read (" + ((o && o.why) || "unknown") + ") — so the register is forbidden ANY digit, and the copy audit enforces it", "nt");
        }catch(e){ log("· the offering lookup failed: " + ((e && e.message) || e), "nt"); }
      } else log("· no page was readable, so there is no offering at all — the register is forbidden any digit, and the audit enforces it", "nt");
    }
    const res = await writeTheStory();
    if(!res){ log("· the copy hand — no copy was written, so the copy order(s) stay open", "bad"); return false; }
    const bad = (res.violations || []).filter(function(v){ return v.verdict === "FAIL"; });
    if(bad.length) log("· the copy hand — the copy was written, but " + bad.length + " hard rule(s) broke. Those beats are WITHHELD and named in the audit: nothing false goes to the customer.", "bad");
    return true;
  }

  async function runVideoHand(){
    if(state.reel){
      log("· the video hand — a film is already rendered (" + kb(state.reel.bytes) + (state.reel.verified && state.reel.verified.ok ? ", read back playable" : ", NOT verified") + "), so this order is answered", "gd");
      return true;
    }
    if(!window.Reel){ log("· the video hand — the reel engine (src/reel.js) did not load, so nothing can be rendered", "bad"); return false; }
    const clips = Q.items.reduce(function(a, it){ return a + (it.shorts || []).length; }, 0);
    if(!state.shots.length && !clips && !state.frames.length){
      log("· the video hand — no footage, and nothing in the reel. It will not render a film out of nothing, so this order stays open: the shot has to be filmed, " +
          "and the model's knowledge is not a substitute for a real shot.", "nt");
      return false;
    }
    if(!state.shots.length) await addShotsFromFrames();
    if(!state.shots.length) await shotsFromMade();
    if(!state.shots.length){ log("· the video hand — there is nothing to put in a film", "nt"); return false; }
    /* the render burns the copy in, so the copy has to exist before it starts */
    if(!state.story){
      log("· the video hand — the render burns the copy in, so the register is run first", "gd");
      await runCopyHand();
    }
    if(state.story) dressReel();
    else log("· the video hand — no copy was written, so the film goes out undressed (each picture still carries its own tile line)", "nt");
    const r = await renderReel();
    return !!r;
  }

  async function runOrders(){
    if(!DROP.orders.length){ toast("No orders — assemble the blueprint first.", "bad"); return null; }
    syncImages();
    const byHand = { video:[], image:[], copy:[] };
    DROP.orders.forEach(function(o){ (byHand[o.agent] || (byHand[o.agent] = [])).push(o); });
    log("— perfecting the content: " + DROP.orders.length + " order(s) → " + byHand.image.length + " to the image hand · " +
        byHand.video.length + " to the video hand · " + byHand.copy.length + " to the copy hand —", "gd");
    DROP.orders.forEach(function(o){
      log("· " + o.slot + " → the " + o.agent + " hand — " + o.why +
          (o.agent === "video" ? " (this node IS the video hand: it cuts the footage and renders the film)" :
           o.agent === "copy" ? " (the copy hand IS the register — src/story.js; there is no separate copy agent in this family)" : ""), "nt");
    });
    const btn = $("ordersBtn"), cc = $("condCancelBtn");
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Working…'; }
    if(cc) cc.hidden = false;
    state.cancel = false;
    const done = { image:0, video:0, copy:0 };
    try{
      /* the order is the pipeline's own order: the image hand makes the stills
         first, the copy hand writes over them, and the video hand renders them
         into a film with the copy burned in. Running them the other way round
         would leave the later hands with nothing to work on. */
      if(byHand.image.length){ condBar(0.08, "the image hand — making the stills the page needs"); done.image = await runImageHand(byHand.image); }
      if(byHand.copy.length){ condBar(0.42, "the copy hand — the register, writing over the pictures"); if(await runCopyHand()) done.copy = byHand.copy.length; }
      if(byHand.video.length){ condBar(0.62, "the video hand — cutting and rendering the film"); if(await runVideoHand()) done.video = byHand.video.length; }
      condBar(0.95, "re-auditing everything the hands made");
      runAudit(true);
      const a = DROP.auditData;
      log("— THE HANDS HAVE WORKED — image " + done.image + "/" + byHand.image.length + " · video " + done.video + "/" + byHand.video.length +
          " · copy " + done.copy + "/" + byHand.copy.length + " · " + a.holes.length + " hole(s) left · " + a.fails.length + " fail(s)",
          a.fails.length ? "bad" : "gd");
      if(!byHand.image.length && !byHand.video.length && !byHand.copy.length)
        log("· nothing was missing, so no hand had anything to make", "nt");
    }catch(e){ log("the hands stopped: " + ((e && e.message) || e), "bad"); }
    if(btn){ btn.disabled = false; btn.innerHTML = "✦ Perfect the content"; }
    if(cc) cc.hidden = true;
    setTimeout(condBarOff, 1200);
    paintOrders(); paintMade(); paintDrops();
    gateCheck(true);
    return done;
  }
  function resFor(s){
    const low = String(s).toLowerCase();
    if(/\b(banner|hero|og|cover|social|wide|header)\b/.test(low)) return "768x512";
    if(/\b(icon|logo|mark|avatar|favicon|badge|square)\b/.test(low)) return "512x512";
    return "768x768";
  }
  function runAudit(quiet){
    DROP.auditData = window.Drop.audit(dropCtx());
    const a = DROP.auditData;
    log("the audit — " + a.passes.length + " pass · " + a.warns.length + " warn · " + a.holes.length + " hole · " + a.fails.length + " fail", a.fails.length ? "bad" : "gd");
    a.rows.filter(function(r){ return r.verdict === "FAIL"; }).forEach(function(r){
      log("   ✗ " + r.kind + " · " + r.asset + " — " + r.why + " [" + r.measured + "]", "bad");
    });
    a.rows.filter(function(r){ return r.verdict === "HOLE"; }).forEach(function(r){
      log("   ○ " + r.kind + " · " + r.asset + " — " + r.why, "nt");
    });
    paintAuditBox(); paintDrops();
    return a;
  }
  /* ------------------------------------------------------------- the gate
     The last thing before anything is executed: MAY IT GO OUT? The audit measures;
     the gate decides, and it is not allowed to be generous. A FAIL — a false claim,
     or a door the customer cannot walk through — BLOCKS. A remaining HOLE is work
     not done: the build is not ready, but nothing is wrong. Only when there is
     neither does the gate say the build may be executed. */
  function gateCheck(quiet){
    const ctx = dropCtx();
    if(!DROP.auditData) DROP.auditData = window.Drop.audit(ctx);
    DROP.gate = window.Drop.gate(DROP.auditData, ctx);
    const g = DROP.gate;
    if(g.blocked){
      log("— THE GATE: " + g.verdict + " —", "bad");
      log("   " + g.line, "bad");
      g.fails.forEach(function(r){ log("   ✗ " + r.kind + " · " + r.asset + " — " + r.why, "bad"); });
      if(g.holes.length) log("   (" + g.holes.length + " hole(s) also remain, listed after the failures)", "nt");
      toast("BLOCKED — " + g.fails.length + " hard failure(s). See the audit.", "bad");
    } else if(g.ok){
      log("— THE GATE: " + g.verdict + " —", "ok");
      log("   " + g.line, "ok");
      captureSoul("GATE: READY TO EXECUTE — " + g.passes.length + " thing(s) checked, nothing broken and nothing missing",
                  "video node · the drop station · run " + runNo);
      toast("READY TO EXECUTE — nothing is broken and nothing is missing.", "ok");
      speak("The gate is open. This is ready to execute.");
    } else {
      log("— THE GATE: " + g.verdict + " —", "gd");
      log("   " + g.line, "gd");
      g.holes.forEach(function(r){ log("   ○ " + r.kind + " · " + r.asset + " — " + r.why, "nt"); });
      toast("NOT YET COMPLETE — " + g.holes.length + " thing(s) still missing.", "nt");
    }
    paintGate();
    return g;
  }
  function paintGate(){
    const el = $("gateBox"); if(!el) return;
    const g = DROP.gate;
    if(!g){ el.innerHTML = ""; return; }
    const cls = g.blocked ? "bad" : (g.ok ? "ok" : "warn");
    el.innerHTML = '<div class="gate ' + cls + '"><div class="gh">' + esc(g.verdict) + "</div>" +
      '<div class="gl">' + esc(g.line) + "</div>" +
      '<div class="gc">' + g.passes.length + " pass · " + g.warns.length + " warn · " + g.holes.length + " hole · " + g.fails.length + " fail</div>" +
      (g.reasons.length ? "<ul class='gr'>" + g.reasons.map(function(r){
        return "<li class='" + (r.level === "FAIL" ? "bad" : "") + "'><b>" + r.level + "</b> " + esc(r.text) + "</li>";
      }).join("") + "</ul>" : "") +
      ((g.fixes && g.fixes.length) ? '<div class="gf"><b>FOR THE PROTOTYPE TO FIX — faults in their own site, not in this node\'s output:</b><ul class="gr">' +
        g.fixes.map(function(r){ return "<li><b>" + esc(r.asset) + "</b> " + esc(r.why) + "</li>"; }).join("") + "</ul></div>" : "") +
      "</div>";
  }
  /* the whole thing, in one pass — the way the sovereign asked for it */
  async function assemble(){
    if(DROP.busy){ toast("The conductor is already running.", "bad"); return null; }
    DROP.prompt = {
      text: (($("promptInput") || {}).value || "").trim(),
      name: (($("bizNameInput") || {}).value || "").trim(),
      industry: (($("bizIndustryInput") || {}).value || "").trim(),
      job: (($("jobInput") || {}).value || "").trim()
    };
    setLinksFromInput();
    if(!DROP.prompt.text && !DROP.orders.length && !DROP.links.length){
      toast("Give it something — the links, or the prompt.", "bad"); return null;
    }
    DROP.busy = true; state.cancel = false;
    const bb = $("assembleBtn"), bc = $("condCancelBtn");
    if(bb){ bb.disabled = true; bb.innerHTML = '<span class="spin"></span> Working…'; }
    if(bc) bc.hidden = false;
    if(DROP.prompt.text)
      captureSoul("PROMPT: " + DROP.prompt.text + (DROP.prompt.job ? " · the job: " + DROP.prompt.job : ""),
                  "video node · the drop station · run " + runNo);
    log("— THE CONDUCTOR — read every link → research → blueprint → orders → audit —", "gd");
    const t0 = performance.now();
    try{
      if(DROP.links.length) await readTheLinks(true);
      condBar(0.3, "cross-checking the links against the industry's needs");
      if(DROP.pages.length) crossCheck(true);
      condBar(0.36, "research");
      await runResearch(true);
      condBar(0.6, "the blueprint");
      await runBlueprint(true);
      condBar(0.78, "the audit");
      runAudit(true);
      DROP.doc = window.Drop.doc(dropCtx());
      condBar(0.92, "the gate — may this be executed?");
      gateCheck(true);
      condBar(1, "assembled");
      const a = DROP.auditData;
      const g = DROP.gate || {};
      log("— ASSEMBLED — " + DROP.pages.length + " link(s) · " + (DROP.research ? "research" : "no research") + " · " +
          (DROP.blueprint ? DROP.blueprint.page.length + " section(s)" : "no blueprint") + " · " + DROP.orders.length + " order(s) · " +
          a.passes.length + "P/" + a.warns.length + "W/" + a.holes.length + "H/" + a.fails.length + "F · THE GATE: " + (g.verdict || "—") + " · " +
          ((performance.now() - t0) / 1000).toFixed(0) + "s", g.blocked ? "bad" : "ok");
      if(a.fails.length) log("HARD FAILURES are listed above. Nothing should be executed until they are fixed.", "bad");
      log("the blueprint doc is ready — ⧉ download it, or → send it to the Site Builder as the brief.", "gd");
      captureSoul("BLUEPRINT: " + ((DROP.blueprint && DROP.blueprint.blocks.IDENTITY) || ""), "video node · run " + runNo);
      toast("The blueprint is assembled — " + (g.verdict || "audited") + ".", g.blocked ? "bad" : (g.ok ? "ok" : "nt"));
      speak("The blueprint is assembled.");
    }catch(e){
      log("the conductor stopped: " + ((e && e.message) || e), "bad");
    }
    DROP.busy = false;
    if(bb){ bb.disabled = false; bb.innerHTML = "✧ Assemble the blueprint"; }
    if(bc) bc.hidden = true;
    setTimeout(condBarOff, 1600);
    paintDrops();
    return { research:DROP.research, blueprint:DROP.blueprint, orders:DROP.orders, audit:DROP.auditData };
  }
  function blueprintDoc(){
    DROP.doc = window.Drop.doc(dropCtx());
    if(!DROP.doc){ toast("Nothing to write yet.", "bad"); return ""; }
    download(new Blob([DROP.doc], { type:"text/markdown" }), "blueprint-" + (DROP.prompt.name || "client").toLowerCase().replace(/[^\w]+/g, "-").slice(0, 40) + ".md");
    log("the blueprint doc — " + DROP.doc.split("\n").length + " line(s) · what was read, the link audit, the research, the blueprint, the orders and the audit, in one file", "ok");
    return DROP.doc;
  }
  function shipBlueprint(){
    const brief = window.Drop.brief(DROP.blueprint, dropCtx());
    if(!brief){ toast("Assemble the blueprint first.", "bad"); return; }
    let copied = false;
    try{ navigator.clipboard.writeText(brief); copied = true; }catch(e){}
    try{ localStorage.setItem("obi_video_brief", brief); }catch(e){}
    const url = "https://perchance.org/" + BUILDER + "?brief=" + encodeURIComponent(brief.slice(0, 1800));
    log("the prototype's brief — " + brief.split("\n").length + " line(s), " + brief.length + " chars — is " +
        (copied ? "on the clipboard" : "in this page's storage (the clipboard was refused)") + " and set in the builder's deep link", "gd");
    log("· the full doc (with the audit table) is ⧉ The blueprint doc — the builder gets the running order, the copy and the job.", "nt");
    window.open(url, "_blank", "noopener");
    toast("The brief is going to the Site Builder.", "ok");
  }

  /* =========================================================== download + zip */
  function download(blob, name){
    try{
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }catch(e){ toast("The download was refused.", "bad"); }
  }
  /* store-only ZIP: no library, no CDN, works offline. (CRC32 + the two headers.) */
  let CRC_T = null;
  function crcTable(){
    if(CRC_T) return CRC_T;
    CRC_T = new Uint32Array(256);
    for(let n = 0; n < 256; n++){
      let c = n;
      for(let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      CRC_T[n] = c >>> 0;
    }
    return CRC_T;
  }
  function crc32(u8){
    const T = crcTable();
    let c = 0xFFFFFFFF;
    for(let i = 0; i < u8.length; i++) c = T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  async function zipStore(items){
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)) & 0xffff;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;
    for(const it of items){
      const data = new Uint8Array(await it.blob.arrayBuffer());
      const name = enc.encode(it.name);
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true);
      lh.setUint16(4, 20, true); lh.setUint16(6, 0, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true);
      cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0, true); cd.setUint16(10, 0, true);
      cd.setUint16(12, dosTime, true); cd.setUint16(14, dosDate, true);
      cd.setUint32(16, crc, true); cd.setUint32(20, data.length, true); cd.setUint32(24, data.length, true);
      cd.setUint16(28, name.length, true); cd.setUint16(30, 0, true); cd.setUint16(32, 0, true);
      cd.setUint16(34, 0, true); cd.setUint16(36, 0, true); cd.setUint32(38, 0, true);
      cd.setUint32(42, offset, true);
      central.push(new Uint8Array(cd.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const cdSize = central.reduce(function(a, p){ return a + p.length; }, 0);
    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true);
    eocd.setUint16(8, items.length, true); eocd.setUint16(10, items.length, true);
    eocd.setUint32(12, cdSize, true); eocd.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [new Uint8Array(eocd.buffer)]), { type:"application/zip" });
  }
  async function downloadAll(){
    if(!state.frames.length){ toast("Nothing to save yet.", "bad"); return; }
    const base = (state.file ? state.file.name.replace(/\.[^.]+$/, "") : "video");
    const items = [];
    if(state.sheet) items.push({ name:base + "-sheet.jpg", blob:state.sheet.blob });
    state.frames.forEach(function(f, i){ items.push({ name:base + "-still-" + String(i+1).padStart(2,"0") + ".jpg", blob:f.blob }); });
    state.shorts.forEach(function(s, i){ items.push({ name:base + "-short-" + String(i+1).padStart(2,"0") + s.ext, blob:s.blob }); });
    try{
      const zip = await zipStore(items);
      download(zip, base + "-extract.zip");
      log("zipped " + items.length + " file(s) — " + kb(zip.size), "ok");
    }catch(e){ log("the zip failed: " + ((e && e.message) || e) + " — download the pieces instead", "bad"); }
  }

  /* =========================================================== the self-test */
  /* Every node in this family has one honest failure mode: "this browser cannot
     do it". Rather than discover that halfway through a run, /test measures what
     this browser can do — and proves the sheet and the zip on synthetic stills,
     which need no file at all. */
  async function selfTest(){
    log("— self-test: what THIS browser can do, measured —");
    const mime = pickMime();
    log("· MediaRecorder: " + (window.MediaRecorder ? "present" : "ABSENT") + " · container it will write: " + (mime || "none supported"));
    let cap = false;
    try{ const t = document.createElement("video"); cap = !!(t.captureStream || t.mozCaptureStream); }catch(e){}
    log("· <video>.captureStream: " + (cap ? "present" : "ABSENT — shorts read BLOCKED in this browser; stills + sheet still work"));
    log("· vision pass (generateText): " + (window.root && window.root.generateText ? "present" : "ABSENT — the vibe cannot be read here"));
    log("· reel engine (src/reel.js): " + (window.Reel ? "loaded" : "ABSENT"));
    log("· story engine (src/story.js): " + (window.Story ? "loaded" : "ABSENT"));
    log("· pulse engine (src/pulse.js): " + (window.Pulse ? "loaded v" + window.Pulse.version : "ABSENT — clips would be cut by even spacing, and every one of them would say so"));
    log("· AudioDecoder path for the loudness pass: OfflineAudioContext " + ((window.OfflineAudioContext || window.webkitOfflineAudioContext) ? "present (files up to " + (window.Pulse ? (window.Pulse.AUDIO_MAX_BYTES / 1024 / 1024).toFixed(0) : "?") + " MB can be heard whole)" : "ABSENT — every score would be motion alone"));
    if(window.Pulse){
      /* the chooser is pure arithmetic, so it can be PROVED with no video at all:
         sixty quiet samples with ONE busy sample at 30s — pick() has to find that
         spike, and it has to say what it found it on. */
      const fake = { samples:[], hasAudio:true, step:1, dur:60, floor:0, peak:1, walkMs:0, audioFloor:0, audioPeak:0.8, audioWhy:"" };
      for(let i = 0; i < 60; i++)
        fake.samples.push({ t:i, m:i === 30 ? 0.9 : 0.02, n:i === 30 ? 1 : 0.02, a:i === 30 ? 1 : 0.05, score:i === 30 ? 1 : 0.04 });
      const got = window.Pulse.pick(fake, { count:2, len:5 });
      const hit = got.length > 0 && Math.abs(got[0].start - 28) <= 3;
      log("· the clip chooser: a synthetic pulse, quiet everywhere except ONE sample at 30s → it picked " +
          (got.length ? got.map(function(p){ return p.start + "s"; }).join(", ") : "NOTHING") +
          " · " + (hit ? "found the spike" : "MISSED THE SPIKE") +
          " · the reason it gives: " + (got.length ? got[0].why : "—"), hit ? "ok" : "bad");
      const flat = { samples:[], hasAudio:false, step:1, dur:30, floor:0, peak:0, walkMs:0, audioFloor:0, audioPeak:0, audioWhy:"test" };
      for(let i = 0; i < 30; i++) flat.samples.push({ t:i, m:0.01, n:0, a:0, score:0 });
      const flatPick = window.Pulse.pick(flat, { count:2, len:4 });
      log("· the same chooser on a file where EVERY sample is still: " + (flatPick.length === 0
            ? "it refuses to name a peak — 0 window(s) cleared the stillness floor, so the node falls back to EVEN SPACING and says so, instead of calling a dead stretch the busiest part of the file"
            : "it returned " + flatPick.length + " window(s), which it should not"), flatPick.length === 0 ? "ok" : "bad");
    }
    if(window.Reel){
      const c = await window.Reel.caps(1080, 1920, 30);
      log("· the reel's encoder: " + (c.reason || "none") + (c.video ? " · about " + Math.round(window.Reel.bitrateFor(1080, 1920, 30) / 1000000) + " Mbps" : ""));
      /* prove the whole reel path on synthetic pictures — no file, no upload,
         and the encoder actually writes and the file actually reads back */
      const keepShots = state.shots, keepBmp = state.shotBmp;
      const cv = document.createElement("canvas");
      const synth = [];
      for(let i = 0; i < 5; i++){
        cv.width = 270; cv.height = 480;
        const x = cv.getContext("2d");
        const g = x.createLinearGradient(0, 0, 270, 480);
        g.addColorStop(0, "hsl(" + (i * 72) + ",62%,42%)"); g.addColorStop(1, "hsl(" + (i * 72 + 35) + ",55%,18%)");
        x.fillStyle = g; x.fillRect(0, 0, 270, 480);
        x.fillStyle = "#fff"; x.font = "600 22px sans-serif"; x.textAlign = "center";
        x.fillText("REEL TEST " + (i + 1), 135, 250);
        const b = await canvasBlob(cv, "image/jpeg", 0.92);
        synth.push({ url:URL.createObjectURL(b), blob:b, nm:"t" + i });
      }
      const loaded = await window.Reel.loadShots(synth.map(function(s){ return s.url; }));
      const opts = { w:270, h:480, fps:20, perShot:0.7, transition:0.2, motion:"auto", vignette:0.4, progressBar:true,
                     caption:"self-test", shots:loaded.map(function(l, i){ return { bmp:l.bmp, w:l.w, h:l.h, caption:"line " + (i + 1) }; }) };
      try{
        const r = await window.Reel.render(opts, {});
        const v = await window.Reel.verify(r.blob, 9000);
        log("· reel render: 5 synthetic pictures → " + kb(r.bytes) + " " + r.container.toUpperCase() + "/" + r.codec +
            " · " + r.frames + " frames · " + r.seconds.toFixed(2) + "s of reel in " + (r.ms / 1000).toFixed(2) + "s of wall clock" +
            " · read back: " + (v.ok ? (v.seconds.toFixed(2) + "s " + v.w + "×" + v.h + " playable") : ("FAILED — " + v.why)), v.ok ? "ok" : "bad");
      }catch(e){
        log("· reel render FAILED on synthetic pictures: " + ((e && e.message) || e), "bad");
      }
      synth.forEach(function(s){ try{ URL.revokeObjectURL(s.url); }catch(e){} });
      state.shots = keepShots; state.shotBmp = keepBmp;
      paintShots();
    }
    log("· the offering lookup: " + ((window.root && window.root.superFetch) ? "superFetch present (any page can be read)" : (window.superFetch ? "superFetch present" : "no superFetch — only pages that allow CORS")));
    const keep = state.frames.slice();
    const canvas = document.createElement("canvas");
    const synth = [];
    for(let i = 0; i < 6; i++){
      canvas.width = 320; canvas.height = 180;
      const ctx = canvas.getContext("2d");
      const grd = ctx.createLinearGradient(0, 0, 320, 180);
      grd.addColorStop(0, "hsl(" + (i * 60) + ",60%,45%)");
      grd.addColorStop(1, "hsl(" + (i * 60 + 40) + ",50%,25%)");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = "#fff"; ctx.font = "20px sans-serif"; ctx.fillText("Test still " + (i + 1), 20, 100);
      const b = await canvasBlob(canvas, "image/jpeg", 0.95);
      synth.push({ t:i, blob:b, url:URL.createObjectURL(b), bytes:b.size, w:320, h:180 });
    }
    state.frames = synth;
    const sheet = await buildSheet(3);
    log("· stills → sheet: 6 synthetic JPEGs (" + kb(synth.reduce(function(a,f){ return a + f.bytes; }, 0)) + ")" +
        (sheet ? " → sheet " + sheet.w + "×" + sheet.h + " = " + kb(sheet.bytes) : " → sheet FAILED"), sheet ? "ok" : "bad");
    let zipBytes = 0;
    try{
      const z = await zipStore(synth.map(function(f, i){ return { name:"test-" + String(i+1) + ".jpg", blob:f.blob }; }));
      zipBytes = z.size;
    }catch(e){}
    log("· zip: " + (zipBytes ? kb(zipBytes) + " (store-only, no library, offline)" : "FAILED"), zipBytes ? "ok" : "bad");
    synth.forEach(function(f){ try{ URL.revokeObjectURL(f.url); }catch(e){} });
    state.frames = keep;
    paintFrames(); paintStats();
    const ok = !!sheet && !!zipBytes;
    log(ok ? "— the sheet and the zip work in this browser. The video path needs a real file, and a tab in the FOREGROUND (the browser defers media loading in a background tab). —"
           : "— part of the non-media path failed here. —", ok ? "gd" : "bad");
    toast(ok ? "Self-test passed — sheet + zip measured." : "Self-test found a failure — see the log.", ok ? "ok" : "bad");
    return { mime:mime, canCapture:cap, hasVision:!!(window.root && window.root.generateText), sheetBytes:sheet ? sheet.bytes : 0, zipBytes:zipBytes };
  }

  /* =========================================================== command face */
  async function runCmd(cmd){
    const s = String(cmd == null ? "" : cmd).trim();
    if(!s) return;
    log("› " + s, "gd");
    const [head, ...rest] = s.replace(/^\//, "").split(/\s+/);
    const c = head.toLowerCase();
    if(c === "frames" || c === "stills"){ await grabFrames(parseInt(rest[0], 10) || state.nFrames); return; }
    if(c === "sheet"){ await buildSheet(); return; }
    if(c === "shorts" || c === "clips"){
      const it = Q.active;
      const n = parseInt(rest[0], 10) || state.nShorts;
      const len = parseFloat(rest[1]) || state.shortLen;
      if(c === "clips" && it){ await cutPickedClips(it, { want:n, len:len }); return; }
      await makeShorts(n, len); return;
    }
    if(c === "vibe" || c === "read"){ await readVibe(); return; }
    if(c === "hand" || c === "brief"){ await handToBuilder(); return; }
    if(c === "all"){
      if(Q.items.length > 1){ log("/all with " + Q.items.length + " video(s) queued → the whole sweep, in one pass", "gd"); await runSweep(); return; }
      await grabFrames(); await buildSheet(); await makeShorts(); await readVibe(); return;
    }
    if(c === "save" || c === "zip"){ await downloadAll(); return; }
    if(c === "test"){ await selfTest(); return; }
    if(c === "clear"){ clearSource(); return; }
    /* the queue and the sweep */
    if(c === "sweep" || c === "one" || c === "oneshot" || c === "onepass" || c === "run"){ await runSweep(); return; }
    if(c === "queue"){
      if(!Q.items.length){ log("the queue is empty — drop some video", "nt"); return; }
      log("queue — " + Q.items.length + " video(s):", "gd");
      Q.items.forEach(function(it, i){
        log("  " + (i + 1) + ". " + it.name + " · " + kb(it.size) + " · [" + it.status + "]" + (it === Q.active ? " ← on the stage" : "") +
            (it.probe ? " · " + it.probe.w + "×" + it.probe.h + " · " + secs(it.probe.duration) : "") +
            " · " + it.frames.length + " still(s) · " + it.shorts.length + " clip(s)" +
            (it.pulse ? " · pulse " + it.pulse.samples.length + " samples" + (it.pulse.hasAudio ? " (sound)" : " (MOTION ONLY)") : " · NOT measured"), "gd");
      });
      return;
    }
    if(c === "pulse"){
      const it = Q.active;
      if(!it){ log("no source — drop a video first", "bad"); return; }
      const p = await measurePulse(it);
      if(!p) return;
      /* the shape of the file in one line of text: a space is a still moment, an
         @ is the busiest sample in it. A measurement you can look at. */
      log("the pulse — one character a sample, a space is still and @ is the busiest:", "gd");
      log(p.samples.map(function(s){ return " .:-=+*#%@"[Math.max(0, Math.min(9, Math.round(s.score * 9.4)))]; }).join(""));
      log("  " + p.step.toFixed(2) + "s a character · " + (p.samples.length * p.step).toFixed(0) + "s long · " + window.Pulse.report(p), "gd");
      const pl = window.Pulse.pick(p, { count: (batch.opts.clips | 0) || 3, len: batch.opts.clipLen });
      pl.forEach(function(x, i){ log("  pick " + (i + 1) + " — " + x.start.toFixed(1) + "s → " + (x.start + x.len).toFixed(1) + "s · " + x.why, "gd"); });
      return;
    }
    if(c === "moments"){
      const it = Q.active;
      if(!it){ log("no source", "bad"); return; }
      if(!(it.moments || []).length){ log("the eye has named no moment for " + it.name + (it.vibe ? "" : " — the vibe has not been read"), "nt"); return; }
      log("the eye's moments in " + it.name + " — " + it.moments.map(function(x){ return x.t + "s: " + x.what; }).join(" · "), "gd");
      return;
    }
    if(c === "zipall" || c === "everything"){ await zipAll(); return; }
    if(c === "activate"){
      const i = (parseInt(rest[0], 10) || 1) - 1;
      if(!Q.items[i]){ log("no item " + (i + 1) + " in the queue", "nt"); return; }
      activate(Q.items[i]); return;
    }
    /* ---- drops 3 and 4, and the conductor ---- */
    if(c === "links"){
      const a = $("linksInput");
      if(rest.length && a) a.value = rest.join(" ");
      await readTheLinks(); return;
    }
    if(c === "cross" || c === "xcheck"){ crossCheck(); return; }
    if(c === "prompt"){
      const p = $("promptInput");
      if(rest.length && p){ p.value = rest.join(" "); log("the prompt is set — " + p.value.slice(0, 160), "gd"); }
      else log("give it the words: /prompt <what this is, in your own words>", "nt");
      return;
    }
    if(c === "research"){ await runResearch(); return; }
    if(c === "blueprint"){ await runBlueprint(); return; }
    if(c === "orders" || c === "make" || c === "perfect"){ await runOrders(); return; }
    if(c === "audit"){ runAudit(); return; }
    if(c === "gate"){ gateCheck(); return; }
    if(c === "assemble" || c === "conductor"){ await assemble(); return; }
    if(c === "doc"){ blueprintDoc(); return; }
    if(c === "ship" || c === "prototype"){ shipBlueprint(); return; }
    /* the reel and the story */
    if(c === "reel" || c === "render"){ await renderReel(); return; }
    if(c === "preview"){ previewReel(); return; }
    if(c === "poster"){ savePoster(); return; }
    if(c === "stills-reel" || c === "usestills"){ await addShotsFromFrames(); return; }
    if(c === "add"){
      const urls = rest.join(" ").split(/\s+/).filter(function(u){ return /^(https?:|blob:|data:)/.test(u); });
      if(!urls.length){ log("give /add one or more picture URLs", "nt"); return; }
      urls.forEach(function(u){ pushShot({ url:u, name:u.split("/").pop().slice(0, 40), motion:"auto", hold:+state.reelUI.per || 2.6, caption:"", from:"url" }); });
      await ensureBitmaps(); await refreshThumbs();
      log("added " + urls.length + " picture(s) — the reel holds " + state.shots.length, "ok");
      return;
    }
    if(c === "clearreel"){ clearShots(); return; }
    if(c === "lookup"){
      const a = $("lookupInput");
      if(rest.length && a) a.value = rest.join(" ");
      await lookupOffering(); return;
    }
    if(c === "story"){ await writeTheStory(); return; }
    if(c === "dress"){ dressReel(); return; }
    if(c === "sold"){ await lookupOffering(); await writeTheStory(); dressReel(); await renderReel(); return; }
    if(c === "help" || c === "?"){
      log("— drops 3 & 4, and the conductor —", "gd");
      log("/links <url…> — read every address they have, live (their site, socials, listing)");
      log("/cross — cross-check them: what their own site never links, what disagrees, what is missing");
      log("/prompt <words> — the sovereign's own words for the job");
      log("/research — what was read + the model's knowledge of the industry, kept apart and labelled");
      log("/blueprint — identity, running order, assets, links, copy — the first prototype");
      log("/orders — make what the blueprint says is missing (image · video · copy hands)");
      log("/audit — measure every asset against a threshold and give it a verdict");
      log("/assemble — THE CONDUCTOR: links → research → blueprint → orders → audit, in one pass");
      log("/doc — the whole blueprint as one markdown file");
      log("/ship — send the blueprint to the Site Builder as its brief");
      log("— the queue (drop as many videos as you like) —", "gd");
      log("/sweep — ONE SHOT: every queued video → stills → measure → sheet → the eye → clips → the reel → the story → the render");
      log("/queue — what is queued, and how far each file has got");
      log("/activate <n> — put item n on the stage (every button works on it)");
      log("/zipall — every still, clip, poster, sheet, vibe, brief and the story as one zip");
      log("— one file at a time (the ACTIVE item) —", "gd");
      log("/frames [n] — pull n stills across the file");
      log("/sheet — the contact sheet (grid composite, every tile timecoded)");
      log("/pulse — MEASURE the file: motion, plus loudness when it fits. Prints the pulse as one line of text");
      log("/clips [n] [seconds] — cut n clips from the measured peaks (no pulse? then even spacing, and it says so)");
      log("/shorts [n] [seconds] — the same, by the old name");
      log("/vibe — the vision pass: the sheet, in words + one line per tile + the MOMENTS it can see");
      log("/moments — the moments the eye named, in seconds");
      log("/hand — copy the brief and open the Site Builder with it");
      log("/all — the footage side of the active file (or the whole sweep when several are queued)");
      log("/save — the ACTIVE file's stills, clips and sheet as one zip");
      log("/test — measure what THIS browser can do (no file needed)");
      log("/clear — release the ACTIVE file and take it out of the queue");
      log("— the reel (pictures in, one video out) —", "gd");
      log("/add <url…> — put pictures into the reel");
      log("/stills-reel — put the stills you pulled into the reel");
      log("/reel — compose and render the reel (fast: the browser's own encoder)");
      log("/preview — play the composition on the stage, nothing recorded");
      log("/poster — save one frame of the composition as an image");
      log("/clearreel — empty the reel");
      log("— the story (the marketing register, over the pictures) —", "gd");
      log("/lookup <url|host> — read what the offering actually is, live");
      log("/story — write the story: hook · enemy · place · proof · offer · call");
      log("/dress — burn the story onto the reel (a line per picture)");
      log("/sold — lookup → story → dress → render, in one run");
      return;
    }
    log("unknown command — /help", "nt");
  }

  /* =========================================================== boot */
  function boot(){
    const drop = $("drop"), input = $("fileInput");
    if(drop && input){
      drop.onclick = function(){ input.click(); };
      drop.onkeydown = function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); input.click(); } };
      drop.ondragover = function(e){ e.preventDefault(); drop.classList.add("over"); };
      drop.ondragleave = function(){ drop.classList.remove("over"); };
      drop.ondrop = function(e){
        e.preventDefault(); drop.classList.remove("over");
        const all = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []);
        if(!all.length) return;
        const vids = all.filter(isVideoFile);
        const pics = all.filter(function(f){ return isImageFile(f) && !isVideoFile(f); });
        if(pics.length) addImageFiles(pics);
        if(vids.length) addVideos(vids);
        else if(!pics.length) toast("That was neither a video this browser can read nor a picture.", "bad");
      };
      input.onchange = function(){
        if(input.files && input.files.length) addVideos(Array.prototype.slice.call(input.files));
        input.value = "";
      };
    }
    const iin = $("imgInput");
    if(iin) iin.onchange = function(){ addImageFiles(iin.files); iin.value = ""; };
    const setChips = function(sel, attr, fn){
      document.querySelectorAll(sel + " .chip").forEach(function(ch){
        ch.onclick = function(){
          document.querySelectorAll(sel + " .chip").forEach(function(x){ x.classList.toggle("on", x === ch); });
          fn(ch.dataset[attr]);
        };
      });
    };
    setChips("#countChips", "n", function(v){ state.nFrames = parseInt(v, 10) || 12; });
    setChips("#widthChips", "w", function(v){ state.maxW = parseInt(v, 10) || 960; });
    setChips("#shortChips", "s", function(v){ state.nShorts = parseInt(v, 10) || 3; });
    setChips("#cropChips", "crop", function(v){ state.crop = v; });

    /* the reel's controls: one generic chip row, addressed by data-set, so a new
       knob is a line of HTML and nothing else. Multi-pick rows (the finish
       toggles) hold a set of values instead of one. */
    const MULTI = { extra:true };
    document.querySelectorAll("[data-set]").forEach(function(row){
      const key = row.dataset.set;
      row.querySelectorAll(".chip").forEach(function(ch){
        ch.onclick = function(){
          const val = ch.dataset.val;
          if(MULTI[key]){
            const bag = state.reelUI[key];
            bag[val] = !bag[val];
            ch.classList.toggle("on", !!bag[val]);
          } else {
            row.querySelectorAll(".chip").forEach(function(x){ x.classList.toggle("on", x === ch); });
            state.reelUI[key] = val;
          }
          paintReelReadout(); paintReelPoster();
        };
      });
    });
    document.querySelectorAll("[data-stage]").forEach(function(b){
      b.onclick = function(){ showStage(b.dataset.stage); };
    });
    /* the queue's knobs — the same generic chip row the reel uses. Numeric rows
       are written as numbers so nothing downstream has to parse a string. */
    const BNUM = { perVideo:1, peaks:1, clips:1, clipLen:1 };
    document.querySelectorAll("[data-batch]").forEach(function(row){
      const key = row.dataset.batch;
      row.querySelectorAll(".chip").forEach(function(ch){
        ch.onclick = function(){
          row.querySelectorAll(".chip").forEach(function(x){ x.classList.toggle("on", x === ch); });
          const v = ch.dataset.val;
          batch.opts[key] = BNUM[key] ? parseInt(v, 10) : v;
          paintBatch();
        };
      });
    });
    const capIn = $("capInput"); if(capIn) capIn.oninput = function(){ paintReelReadout(); };
    const ttlIn = $("titleInput"); if(ttlIn) ttlIn.oninput = function(){ paintReelPoster(); };

    const wire = function(id, fn){ const el = $(id); if(el) el.onclick = fn; };
    wire("framesBtn", function(){ grabFrames(); });
    wire("sheetBtn", function(){ buildSheet(); });
    wire("vibeBtn", function(){ readVibe(); });
    wire("handBtn", function(){ handToBuilder(); });
    wire("shortsBtn", function(){ makeShorts(); });
    wire("zipBtn", function(){ downloadAll(); });
    wire("clearBtn", function(){ clearSource(); });
    wire("refreshBtn", function(){
      if(!state.video || !state.file){ toast("Nothing loaded.", "bad"); return; }
      log("re-probing " + state.file.name + "…");
      try{ state.video.load(); }catch(e){}
      armProbe(state.video, state.file, { item:Q.active });
    });
    /* the queue and the sweep */
    wire("batchBtn", function(){ runSweep(); });
    wire("batchCancelBtn", function(){ batch.cancel = true; state.cancel = true; log("stopping the sweep — everything already written is kept", "nt"); });
    wire("batchZipBtn", function(){ zipAll(); });
    /* the other two doors and the conductor */
    wire("readLinksBtn", function(){ readTheLinks(); });
    wire("linkAuditBtn", function(){ crossCheck(); });
    wire("assembleBtn", function(){ assemble(); });
    wire("researchBtn", function(){ runResearch(); });
    wire("ordersBtn", function(){ runOrders(); });
    wire("gateBtn", function(){ gateCheck(); });
    wire("auditBtn", function(){ runAudit(); });
    wire("docBtn", function(){ blueprintDoc(); });
    wire("shipBtn", function(){ shipBlueprint(); });
    wire("condCancelBtn", function(){ state.cancel = true; log("stopping the conductor — everything already written is kept", "nt"); });
    const linksIn = $("linksInput");
    if(linksIn) linksIn.addEventListener("blur", function(){ setLinksFromInput(); paintDrops(); });
    /* the reel */
    wire("addImagesBtn", function(){ const i = $("imgInput"); if(i) i.click(); });
    wire("shotsFromStillsBtn", function(){ addShotsFromFrames(); });
    wire("shotsFromFilesBtn", function(){ const i = $("imgInput"); if(i) i.click(); });
    wire("shotsShuffleBtn", function(){ shuffleShots(); });
    wire("shotsClearBtn", function(){ clearShots(); });
    wire("reelBtn", function(){ renderReel(); });
    wire("reelPreviewBtn", function(){ previewReel(); });
    wire("reelCancelBtn", function(){ stopReel(); });
    wire("reelDlBtn", function(){ downloadReel(); });
    wire("reelPosterBtn", function(){ savePoster(); });
    wire("bedBtn", function(){ const b = $("bedInput"); if(b) b.click(); });
    wire("bedClearBtn", function(){ setBed(null); });
    const bedIn = $("bedInput");
    if(bedIn) bedIn.onchange = function(){ if(bedIn.files && bedIn.files[0]) setBed(bedIn.files[0]); bedIn.value = ""; };
    /* the story */
    wire("lookupBtn", function(){ lookupOffering(); });
    wire("storyBtn", function(){ writeTheStory(); });
    wire("storyApplyBtn", function(){ dressReel(); });
    wire("storyCopyBtn", function(){ copyStory(); });
    const li = $("lookupInput");
    if(li) li.addEventListener("keydown", function(e){ if(e.key === "Enter"){ e.preventDefault(); lookupOffering(); } });
    const cancel = $("cancelBtn");
    if(cancel) cancel.onclick = function(){ state.cancel = true; log("stopping — keeping what has been written", "nt"); };

    const ci = $("cmdInput"), cb = $("cmdBtn");
    if(ci && cb){
      cb.onclick = async function(){ const v = ci.value; ci.value = ""; await runCmd(v); };
      ci.addEventListener("keydown", function(e){ if(e.key === "Enter"){ e.preventDefault(); cb.click(); } });
    }
    state.voice = (function(){ try{ return localStorage.getItem(VOICE_KEY) !== "off"; }catch(e){ return true; } })();
    const vb = $("voiceBtn");
    if(vb){
      const paint = function(){
        vb.classList.toggle("on", !!state.voice);
        if($("voiceLbl")) $("voiceLbl").textContent = state.voice ? "Voice on" : "Voice off";
      };
      vb.onclick = function(){ state.voice = !state.voice; try{ localStorage.setItem(VOICE_KEY, state.voice ? "on" : "off"); }catch(e){} paint(); };
      paint();
    }
    const mb = $("memoryBtn");
    if(mb) mb.onclick = function(){
      const p = $("memoryPanel"); if(!p) return;
      p.classList.toggle("hidden");
      const st = $("memStats"), list = $("memList");
      if(st) st.innerHTML = "runs <b>" + ledger.runs.length + "</b> · sovereign captures <b>" + ledger.soul.length + "</b> · this run <b>" + runNo + "</b>";
      if(list) list.innerHTML = ledger.soul.slice(-40).reverse().map(function(e){
        return '<div class="mem-item"><div class="mh">' + new Date(e.t).toLocaleString() + " · run " + (e.run || "?") + (e.footnote ? " · " + esc(e.footnote) : "") + '</div><div class="mq">' + esc(e.text) + "</div></div>";
      }).join("") || '<div class="hint">Nothing captured yet.</div>';
    };

    paintProbe(); paintStage(); paintFrames(); paintShorts(); paintVibe(); paintStats();
    paintShots(); paintOffer(); paintStory(); paintQueue(); paintBatch();
    paintDrops(); paintPages(); paintLinkAudit(); paintResearch(); paintBlueprint();
    paintOrders(); paintMade(); paintAuditBox(); paintGate();
    setBed(null);
    showStage("source");
    if(window.Reel) window.Reel.caps(1080, 1920, 30).then(function(c){
      state.caps = c;
      paintReelReadout();
      if(!c.video && !c.recorder) log("this browser cannot write a video at all — the reel reads BLOCKED. The stills, the sheet and the vibe still work; nothing is claimed.", "bad");
    }).catch(function(){});
    libLoad();
    log("ready — drop a video — or ten of them — or pictures. All of it is read from your disk: no upload, no attachment cap.");
    log("FOOTAGE: /sweep runs the whole queue in one pass (stills → measure → the sheet → the eye → the clips → the reel → the story). Or one file at a time: /frames · /sheet · /pulse · /vibe · /clips.", "nt");
    log("PICTURES: /add <url…> or drop images — the reel → the story → the reel again. /all runs the footage side of the ACTIVE file (and the whole sweep when several are queued).", "nt");
    if(!window.Pulse) log("the pulse engine (src/pulse.js) did not load — the clips would be cut by even spacing, and every clip would say so", "nt");
    if(!pickMime()) log("this browser cannot record clips (no MediaRecorder) — stills and the sheet still work", "nt");
  }

  window.VideoNode = {
    status: function(){
      return { run:runNo, file:state.file ? state.file.name : null, bytes:state.file ? state.file.size : 0,
               probe:state.probe, frames:state.frames.length, shorts:state.shorts.length,
               sheet:state.sheet ? state.sheet.bytes : 0, busy:state.busy, durable:lib.durable,
               canRecord:!!pickMime(), captures:ledger.soul.length,
               queue:Q.items.length, activeIndex:Q.active ? Q.items.indexOf(Q.active) : -1,
               swept:Q.items.filter(function(x){ return x.status === "done"; }).length,
               clips:Q.items.reduce(function(a, x){ return a + (x.shorts || []).length; }, 0),
               moments:Q.items.reduce(function(a, x){ return a + ((x.moments || []).length); }, 0),
               drops: { videos:Q.items.length, images:DROP.images.length, links:DROP.links.length, pagesRead:DROP.pages.filter(function(p){ return p.read; }).length,
                        prompt:!!DROP.prompt.text, research:!!(DROP.research && DROP.research.ok), blueprint:!!(DROP.blueprint && DROP.blueprint.ok),
                        orders:DROP.orders.length, made:DROP.made.length,
                        audit:DROP.auditData ? { pass:DROP.auditData.passes.length, warn:DROP.auditData.warns.length,
                                                 hole:DROP.auditData.holes.length, fail:DROP.auditData.fails.length } : null,
                        gate:DROP.gate ? { verdict:DROP.gate.verdict, blocked:DROP.gate.blocked, ok:DROP.gate.ok } : null },
               pulse:state.pulse ? { samples:state.pulse.samples.length, step:state.pulse.step, hasAudio:state.pulse.hasAudio,
                                     audioWhy:state.pulse.audioWhy } : null,
               shots:state.shots.length, reel:state.reel ? { bytes:state.reel.bytes, container:state.reel.container, seconds:state.reel.seconds, engine:state.reel.engine, audio:state.reel.audio } : null,
               offer:state.offer ? { url:state.offer.url, ok:state.offer.ok, words:state.offer.words, found:state.offer.found } : null,
               story:state.story ? { filled:state.story.filled, lines:state.story.lines.filter(function(l){ return l; }).length, beats:state.story.beats } : null,
               stage:state.stage };
    },
    pick: pickFile, frames: grabFrames, frameAt: grabFramesAt, sheet: buildSheet, shorts: makeShorts, vibe: readVibe,
    hand: handToBuilder, zip: downloadAll, clear: clearSource, run: runCmd, selfTest: selfTest,
    brief: function(){ return state.brief; }, vibeText: function(){ return state.vibeText; },
    library: function(){ return lib.rows; },
    /* ---- the queue and the sweep ---- */
    addVideos: function(files){ return addVideos(files); },
    queue: function(){
      return Q.items.map(function(it){
        return { id:it.id, name:it.name, bytes:it.size, status:it.status, err:it.err || "",
                 w:it.probe ? it.probe.w : 0, h:it.probe ? it.probe.h : 0, seconds:it.probe ? it.probe.duration : 0,
                 canCapture:it.probe ? it.probe.canCapture : false,
                 frames:it.frames.length, sheet:it.sheet ? it.sheet.bytes : 0, clips:it.shorts.length,
                 tiles:(it.tiles || []).length, moments:(it.moments || []).slice(),
                 vibe:it.vibe ? it.vibe.split(/\s+/).length : 0,
                 pulse:it.pulse ? { samples:it.pulse.samples.length, step:it.pulse.step, hasAudio:it.pulse.hasAudio,
                                    audioWhy:it.pulse.audioWhy } : null,
                 clipReasons:it.shorts.map(function(s){ return { start:s.start, len:s.len, why:s.why }; }) };
      });
    },
    activeIndex: function(){ return Q.active ? Q.items.indexOf(Q.active) : -1; },
    activate: function(i){ return activate(Q.items[i]); },
    removeItem: function(i){ return removeItem(Q.items[i]); },
    sweep: runSweep, sweepOne: function(i){ return sweepOne(Q.items[i], i); },
    batch: function(){ return { running:batch.running, phase:batch.phase, opts:JSON.parse(JSON.stringify(batch.opts)) }; },
    setBatch: function(o){ Object.assign(batch.opts, o || {}); paintBatch(); return batch.opts; },
    pulse: function(i){ const it = (i == null ? Q.active : Q.items[i]); return it ? it.pulse : null; },
    measure: function(i){ return measurePulse(i == null ? Q.active : Q.items[i]); },
    planClips: function(i, want, len){ const it = (i == null ? Q.active : Q.items[i]); return it ? planClips(it, want, len) : []; },
    cutClips: function(i, o){ const it = (i == null ? Q.active : Q.items[i]); return it ? cutPickedClips(it, o) : []; },
    zipAll: zipAll, reelOfItem: reelOfItem, buildMasterReel: buildMasterReel,
    /* ---- drops 3 & 4, and the conductor ---- */
    setLinks: function(text){ const a = $("linksInput"); if(a && text != null) a.value = text; return setLinksFromInput(); },
    readLinks: readTheLinks, crossCheck: crossCheck, linkAuditData: function(){ return DROP.linkAudit; },
    pages: function(){ return DROP.pages.map(function(p){ return { url:p.url, kind:p.kind.id, label:p.kind.label, read:!!p.read, why:p.why || "",
      words:p.words || 0, links:(p.links || []).length, prices:(p.prices || []).length, phones:(p.phones || []) }; }); },
    setPrompt: function(o){ Object.assign(DROP.prompt, o || {}); return DROP.prompt; },
    promptWords: function(){ return DROP.prompt; },
    research: runResearch, researchData: function(){ return DROP.research; },
    blueprint: runBlueprint, blueprintData: function(){ return DROP.blueprint; },
    orders: runOrders, ordersList: function(){ return DROP.orders.slice(); },
    /* orders can be handed IN as well as derived from the blueprint — this is how
       another agent in the family can put work on this node's three hands. */
    setOrders: function(list){ DROP.orders = (list || []).slice(); paintOrders(); return DROP.orders; },
    audit: runAudit, auditData: function(){ return DROP.auditData; },
    gate: gateCheck, gateData: function(){ return DROP.gate; },
    perfect: runOrders,
    assemble: assemble, made: function(){ return DROP.made.map(function(m){ return { slot:m.slot, prompt:m.prompt, w:m.w, h:m.h, bytes:m.bytes }; }); },
    madeAssets: function(){ return DROP.made; },
    docText: function(){ return window.Drop.doc(dropCtx()); },
    briefForBuilder: function(){ return window.Drop.brief(DROP.blueprint, dropCtx()); },
    ship: shipBlueprint, images: function(){ return DROP.images.slice(); },
    /* the reel */
    addImages: addImageFiles, useStills: addShotsFromFrames, shots: function(){ return state.shots; },
    clearReel: clearShots, shuffle: shuffleShots, bed: setBed, reel: renderReel, reelm: renderReel,
    previewReel: previewReel, stopReel: stopReel, poster: savePoster, reelBlob: function(){ return state.reel ? state.reel.blob : null; },
    showStage: showStage, reelOpts: reelOpts,
    /* the story */
    lookup: lookupOffering, story: writeTheStory, dress: dressReel, copyStory: copyStory,
    offer: function(){ return state.offer; }, storyData: function(){ return state.story; },
    readOffering: function(html, url){ return window.Story ? window.Story.readOffering(html, url) : null; }
  };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
