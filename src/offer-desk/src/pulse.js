/* ============================================================================
   THE DROP — the measurement engine (vendored, byte-exact).

   This is the video node's own `src/pulse.js`, copied here unchanged so the
   client-facing page can measure a walkthrough without a perchance page, a
   plugin, or a server of any kind. It is the SAME code that measured the venue
   footage in the station, so the numbers a client sees here and the numbers the
   station sees later are produced by the same arithmetic.

   Source of truth: src/generators/video-node/src/pulse.js (this file is a copy;
   edit it there first and re-copy, or the two drift).

   What it does, in the client's own browser and nothing else: walks the file
   with a bounded number of seeks, measures frame-to-frame luma difference on a
   ~160px canvas, optionally passes the audio for loudness, normalises both
   against the file's OWN floor and peak, and picks the windows with the most of
   both. Nothing is uploaded. Nothing is guessed: fewer windows than asked for is
   reported, never padded.

   Everything below this header is the vendored file, byte for byte, appended by
   copy_lines — do not hand-edit it in place.
   ========================================================================== */

/* ============================================================================
   PULSE — the measurement engine. WHERE in a file is anything HAPPENING?

   The node's first pass over footage pulled its stills EVENLY across the file,
   which answers "what does this look like" and cannot answer "when is anything
   going on". A venue's video is ninety seconds of an empty room and eight
   seconds of people dancing; even spacing cuts its clips from the empty room
   and calls the result "the vibes".

   So the file is MEASURED, in this browser, with two cheap primitives:

     · MOTION — the file is walked on a small canvas (long edge ~160 px) and the
       mean absolute change in LUMA between consecutive samples is the motion
       score: 2 of 255 for a locked-off shot of a wall, 100+ when people move in
       frame. One pass, no model, no upload, nothing decoded that a browser was
       not already going to decode.
     · LOUDNESS — the audio track is decoded (OfflineAudioContext, 8 kHz mono)
       and its RMS is taken in windows the width of a clip. This costs the file
       SIZE in memory, so it is only done when the file is small enough to read
       whole (AUDIO_MAX_BYTES). When it is not, the pass SAYS SO and motion
       decides alone. It never pretends to have heard the file.

   Both curves are NORMALISED against the file's OWN floor and ceiling (the 20th
   and 95th percentile of its own samples), because a measure that is not
   relative to the material is a number with no meaning: a dark, quiet file and
   a bright, loud one must both be able to say "here is where it peaks".

   Then pick() chooses the windows: the mean energy across a clip-length window
   plus the peak inside it, greedily, and no two chosen windows overlap by more
   than half. Every window it returns carries THE NUMBERS IT WAS CHOSEN ON, so a
   human can disagree with the machine, and so "energy 82%" can never be quietly
   promoted into "there is dancing here" — that is the eye's call, not a
   metric's. A window must also clear THE STILLNESS FLOOR (an absolute minimum
   AND a fraction of this file's own best), because a file that is ninety
   percent empty room still has a "busiest" window, and naming four seconds of
   empty room as where the life is would be a lie told with a number. When fewer
   windows clear the floor than were asked for, the count is REPORTED
   (picks.suppressed) rather than padded out with dead air.

   FAIL CLOSED: no metadata → nothing is measured → no clip is claimed. A
   browser that will not decode the audio says so and scores motion alone.
   ========================================================================== */
(function(){
  "use strict";

  const DEFAULT_SAMPLES = 160;                  /* the walk is bounded, always */
  const AUDIO_MAX_BYTES = 260 * 1024 * 1024;    /* read-whole ceiling for audio */
  const VERSION = "1.0";

  const clamp = function(v, a, b){ return v < a ? a : (v > b ? b : v); };
  const r2 = function(n){ return Math.round(n * 100) / 100; };
  const pct = function(x){ return Math.round(clamp(x || 0, 0, 1) * 100) + "%"; };
  const mb = function(n){ return (n / 1024 / 1024).toFixed(1) + " MB"; };

  /* one frame later — or `ms` later if the browser will not give us one. A tab
     in the BACKGROUND never fires rAF, and a measurement pass must not hang
     because of it: it proceeds, and the samples it gets are still real. */
  function nextFrame(ms){
    return new Promise(function(res){
      let done = false;
      const fin = function(){ if(done) return; done = true; res(); };
      try{ requestAnimationFrame(function(){ fin(); }); }catch(e){}
      setTimeout(fin, ms == null ? 100 : ms);
    });
  }
  function seek(v, t){
    return new Promise(function(res){
      let done = false;
      const fin = function(){ if(done) return; done = true; try{ v.removeEventListener("seeked", fin); }catch(e){} res(); };
      try{ v.addEventListener("seeked", fin); }catch(e){}
      try{ v.currentTime = Math.max(0, t); }catch(e){ fin(); return; }
      setTimeout(fin, 6000);      /* one bad seek never hangs the whole walk */
    });
  }

  const LR = 0.299, LG = 0.587, LB = 0.114;
  /* motion and brightness in ONE pass over the pixels: the absolute luma change
     per pixel is the motion, the mean luma is the exposure of the shot */
  function diffLuma(prev, cur){
    let d = 0, l = 0;
    const n = cur.length;
    for(let i = 0; i < n; i += 4){
      const cl = cur[i] * LR + cur[i+1] * LG + cur[i+2] * LB;
      l += cl;
      if(prev) d += Math.abs(cl - (prev[i] * LR + prev[i+1] * LG + prev[i+2] * LB));
    }
    const px = n / 4;
    return { m: prev ? (d / px) / 255 : 0, b: (l / px) / 255 };
  }
  function quantile(sorted, p){
    if(!sorted.length) return 0;
    return sorted[clamp(Math.floor(sorted.length * p), 0, sorted.length - 1)];
  }

  /* ======================================================== the motion walk */
  async function scan(video, opts, hooks){
    opts = opts || {}; hooks = hooks || {};
    const t0 = performance.now();
    if(!video) return { ok:false, why:"there is no video to measure" };
    if(!video.videoWidth || !video.videoHeight)
      return { ok:false, why:"the file has not handed the browser its metadata yet (a tab in the background never does) — nothing was measured" };
    const dur = (opts.duration != null ? opts.duration : video.duration);
    if(!isFinite(dur) || dur <= 0)
      return { ok:false, why:"the file's length is unknown, so there is no timeline to walk" };

    const maxSide = opts.maxSide || 160;
    const want = clamp(opts.samples || DEFAULT_SAMPLES, 8, 600);
    const step = clamp(opts.step || (dur / want), 0.25, 5);
    const canvas = opts.canvas || document.createElement("canvas");
    const sc = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(2, Math.round(video.videoWidth * sc));
    canvas.height = Math.max(2, Math.round(video.videoHeight * sc));
    let ctx = null;
    try{ ctx = canvas.getContext("2d", { willReadFrequently:true }); }catch(e){ ctx = canvas.getContext("2d"); }
    if(!ctx) return { ok:false, why:"no 2d canvas in this browser — the motion walk cannot run" };

    const wasTime = video.currentTime, wasPaused = video.paused;
    try{ video.pause(); }catch(e){}

    const samples = [];
    let prev = null, stopped = false;
    const total = Math.max(1, Math.floor(dur / step));
    try{
      for(let i = 0, t = 0; t < dur - Math.min(0.05, step / 4); i++, t += step){
        if(hooks.shouldStop && hooks.shouldStop()){ stopped = true; break; }
        await seek(video, t);
        await nextFrame(90);
        if(video.readyState < 2) continue;
        try{ ctx.drawImage(video, 0, 0, canvas.width, canvas.height); }catch(e){ continue; }
        let px = null;
        try{ px = ctx.getImageData(0, 0, canvas.width, canvas.height).data; }catch(e){ break; }
        const dl = diffLuma(prev, px);
        samples.push({ t:r2(isFinite(video.currentTime) ? video.currentTime : t), m:dl.m, b:dl.b });
        prev = px;
        if(hooks.onProgress && (i % 3 === 0)) hooks.onProgress(i, total, t);
      }
    }catch(e){
      log_free(hooks, "the walk stopped: " + ((e && e.message) || e));
    }
    try{ video.currentTime = wasTime; if(!wasPaused) video.play().catch(function(){}); }catch(e){}

    const ms = performance.now() - t0;
    if(!samples.length)
      return { ok:false, why:"not one frame could be read out of the file", ms:ms, samples:[] };

    const sorted = samples.map(function(s){ return s.m; }).sort(function(a, b){ return a - b; });
    const floor = quantile(sorted, 0.20), peak = quantile(sorted, 0.95);
    const span = Math.max(1e-4, peak - floor);
    samples.forEach(function(s){ s.n = clamp((s.m - floor) / span, 0, 1); });

    return {
      ok:true, dur:dur, step:step, w:canvas.width, h:canvas.height,
      samples:samples, floor:floor, peak:peak, ms:ms,
      stopped:stopped, complete:!stopped, walked:samples.length
    };
  }
  function log_free(hooks, m){ if(hooks && hooks.onNote) hooks.onNote(m); }

  /* ======================================================== the loudness pass */
  async function audio(file, opts, hooks){
    opts = opts || {}; hooks = hooks || {};
    const t0 = performance.now();
    if(!file) return { ok:false, why:"no file" };
    const maxBytes = opts.maxBytes || AUDIO_MAX_BYTES;
    if(file.size > maxBytes)
      return { ok:false, why:"the file is " + mb(file.size) + " — hearing it would cost that much memory, and the ceiling for that is " + mb(maxBytes) + ". The loudness pass is SKIPPED; motion decides alone, and the clip reasons say so." };
    const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if(!OC) return { ok:false, why:"this browser has no OfflineAudioContext — motion decides alone" };

    let buf = null;
    try{
      if(hooks.onNote) hooks.onNote("reading the audio track (the file is " + mb(file.size) + ")…");
      const ab = await file.arrayBuffer();
      const ctx = new OC(1, 1, opts.rate || 8000);
      buf = await ctx.decodeAudioData(ab);
    }catch(e){
      return { ok:false, why:"the audio track would not decode (" + ((e && e.message) || e) + ") — motion decides alone" };
    }
    const ms0 = performance.now();
    const ch = buf.numberOfChannels, rate = buf.sampleRate;
    const data = [];
    for(let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    /* two samples in every four are read: an RMS envelope does not change when
       you halve the work, and the whole file is being walked here */
    const stride = 2;
    const win = Math.max(1, Math.round((opts.win || 0.3) * rate));
    const hop = Math.max(1, Math.round((opts.hop || 0.5) * rate));
    const env = [];
    for(let i = 0; i + win <= buf.length; i += hop){
      let s = 0, n = 0;
      for(let c = 0; c < ch; c++){
        const d = data[c];
        for(let j = i; j < i + win; j += stride){ const v = d[j]; s += v * v; n++; }
      }
      env.push({ t:r2(i / rate), e:n ? Math.sqrt(s / n) : 0 });
    }
    try{ buf = null; }catch(e){}
    if(!env.length) return { ok:false, why:"the file has no audio samples to measure", ms:performance.now() - t0 };

    const sorted = env.map(function(x){ return x.e; }).sort(function(a, b){ return a - b; });
    const floor = quantile(sorted, 0.20), peak = quantile(sorted, 0.95);
    const span = Math.max(1e-5, peak - floor);
    env.forEach(function(x){ x.n = clamp((x.e - floor) / span, 0, 1); });

    return {
      ok:true, env:env, rate:rate, hop:r2(hop / rate), win:r2(win / rate),
      floor:floor, peak:peak, ms:performance.now() - t0, decodeMs:ms0 - t0,
      channels:ch, seconds:env.length ? env[env.length - 1].t : 0
    };
  }

  /* ======================================================== one score per sample */
  function combine(scanRes, audioRes, opts){
    opts = opts || {};
    const wM = opts.wMotion == null ? 0.6 : opts.wMotion;
    const wA = opts.wAudio == null ? 0.4 : opts.wAudio;
    const hasAudio = !!(audioRes && audioRes.ok && audioRes.env && audioRes.env.length);
    const env = hasAudio ? audioRes.env : null;
    const hop = hasAudio ? (audioRes.hop || 0.5) : 0;
    const samples = ((scanRes && scanRes.samples) || []).map(function(s){
      let a = 0;
      if(hasAudio){
        const j = clamp(Math.round(s.t / hop), 0, env.length - 1);
        a = env[j].n;
      }
      s.a = a;
      s.score = clamp(hasAudio ? (wM * s.n + wA * a) : s.n, 0, 1);
      return s;
    });
    return {
      samples:samples, hasAudio:hasAudio, weights:{ motion:wM, audio:wA },
      dur:(scanRes && scanRes.dur) || (samples.length ? samples[samples.length-1].t : 0),
      step:(scanRes && scanRes.step) || 1,
      floor:(scanRes && scanRes.floor) || 0, peak:(scanRes && scanRes.peak) || 0,
      walkMs:(scanRes && scanRes.ms) || 0, audioMs:hasAudio ? audioRes.ms : 0,
      audioPeak:hasAudio ? audioRes.peak : 0, audioFloor:hasAudio ? audioRes.floor : 0,
      audioWhy:(audioRes && !audioRes.ok) ? audioRes.why : "",
      w:(scanRes && scanRes.w) || 0, h:(scanRes && scanRes.h) || 0,
      walked:(scanRes && scanRes.walked) || samples.length
    };
  }

  /* the score at a moment — the stills pulled at a peak can be ranked by it */
  function at(pulse, t){
    const s = (pulse && pulse.samples) || [];
    if(!s.length) return null;
    let best = s[0], bd = Math.abs(s[0].t - t);
    for(let i = 1; i < s.length; i++){
      const d = Math.abs(s[i].t - t);
      if(d < bd){ bd = d; best = s[i]; }
    }
    return best;
  }

  /* ======================================================== the clip chooser */
  function pick(pulse, opts){
    opts = opts || {};
    const samples = (pulse && pulse.samples) || [];
    if(!samples.length) return [];
    const want = clamp(opts.count || 3, 1, 12);
    const dur = pulse.dur || samples[samples.length - 1].t;
    const len = clamp(opts.len || 5, 1.5, Math.max(1.5, dur));
    const step = pulse.step || (samples.length > 1 ? (samples[1].t - samples[0].t) : 1);
    const k = Math.max(1, Math.round(len / step));

    /* every window that fits inside the file, scored on its MEAN energy and on
       the single busiest sample inside it — a clip that is 4 seconds of nothing
       and 1 second of dancing is not the same as 5 seconds of dancing. */
    const cands = [];
    for(let i = 0; i + k <= samples.length; i++){
      let sum = 0, mx = -1, mi = i;
      for(let j = i; j < i + k; j++){
        sum += samples[j].score;
        if(samples[j].score > mx){ mx = samples[j].score; mi = j; }
      }
      cands.push({ i:i, start:samples[i].t, end:samples[Math.min(samples.length-1, i + k - 1)].t,
                   mean:sum / k, max:mx, peakT:samples[mi].t,
                   motion:samples[mi].n || 0, audio:samples[mi].a || 0,
                   score:(sum / k) * 0.55 + mx * 0.45 });
    }
    if(!cands.length) return [];
    cands.sort(function(a, b){ return b.score - a.score; });

    /* THE STILLNESS FLOOR. A file that is ninety percent empty room still has a
       "busiest" window, and naming four seconds of empty room as where the life
       is would be a lie told with a number. So a candidate must clear an absolute
       floor AND a fraction of this file's own best before it is called a peak —
       and when fewer windows clear it than were asked for, the caller is told
       (picks.suppressed) so it can say "this file only had N moments" instead of
       padding the count out with dead air. */
    const best = cands[0].score;
    const cut = Math.max(opts.minScore == null ? 0.16 : opts.minScore, best * 0.3);
    const strong = cands.filter(function(c){ return c.score >= cut; });

    const blocked = new Array(samples.length).fill(false);
    const keep = Math.max(1, Math.round(k * 0.5));         /* ≤50% overlap */
    const chosen = [];
    for(let c = 0; c < strong.length && chosen.length < want; c++){
      const w = strong[c];
      if(blocked[w.i]) continue;
      chosen.push(w);
      const a = Math.max(0, w.i - k + keep), b = Math.min(samples.length, w.i + k - keep + 1);
      for(let j = a; j < b; j++) blocked[j] = true;
    }
    chosen.sort(function(a, b){ return a.start - b.start; });   /* a reel reads forward */
    const picks = chosen.map(function(w){
      return {
        start:w.start, len:Math.min(len, Math.max(1, dur - w.start)), peakT:w.peakT,
        score:r2(w.score), mean:r2(w.mean), peak:r2(w.max), motion:r2(w.motion), audio:r2(w.audio),
        why: reason(pulse, w, len)
      };
    });
    picks.suppressed = Math.max(0, want - picks.length);
    picks.cut = r2(cut);
    picks.best = r2(best);
    return picks;
  }
  function reason(pulse, w, len){
    const bits = [];
    if(pulse.hasAudio) bits.push("energy " + pct(w.max) + " (motion " + pct(w.motion) + " · loudness " + pct(w.audio) + ")");
    else bits.push("motion " + pct(w.motion) + (pulse.audioWhy ? " (no loudness pass)" : ""));
    return bits.join("") + " — the busiest " + (Math.round(len * 10) / 10) + "s the measurement found in this file · peak at " + w.peakT + "s";
  }

  /* the stills at the busiest moments: the frames a venue would actually use,
     kept in the file's own order because a reel reads forward */
  function topFrames(pulse, frames, k, opts){
    opts = opts || {};
    const list = (frames || []).slice();
    if(k == null) k = 8;
    if(!pulse || !pulse.samples.length || list.length <= k) return list;
    const scored = list.map(function(f, i){
      const t = (f.t == null) ? i : f.t;
      const s = at(pulse, t);
      return { f:f, t:t, score:s ? s.score : 0 };
    });
    scored.sort(function(a, b){ return b.score - a.score || a.t - b.t; });
    return scored.slice(0, k).sort(function(a, b){ return a.t - b.t; }).map(function(x){ return x.f; });
  }
  /* evenly thin a list to a ceiling — used when a whole batch's material is
     longer than the reel should be. Says nothing: the caller reports the count.
     (Kept here so every thinning in the node is the same arithmetic.) */
  function thin(list, cap){
    const a = (list || []).slice();
    if(!cap || a.length <= cap) return a;
    const out = [];
    for(let i = 0; i < cap; i++) out.push(a[Math.round(i * (a.length - 1) / (cap - 1 || 1))]);
    return out.filter(function(x, i){ return out.indexOf(x) === i; });
  }

  /* one line a human can check, for the log and the library row */
  function report(pulse){
    if(!pulse || !pulse.samples.length) return "not measured";
    const span = Math.max(0.01, pulse.step * (pulse.samples.length - 1));
    return pulse.samples.length + " sample(s) every " + (Math.round(pulse.step * 100) / 100) + "s across " +
           (Math.round(span * 10) / 10) + "s · motion floor " + pct(pulse.floor) + " → peak " + pct(pulse.peak) +
           " · " + (pulse.hasAudio ? "loudness heard (floor " + pct(pulse.audioFloor) + " → peak " + pct(pulse.audioPeak) + " of full scale)"
                                  : "MOTION ALONE" + (pulse.audioWhy ? " — " + pulse.audioWhy : "")) +
           " · walked in " + (pulse.walkMs / 1000).toFixed(1) + "s";
  }

  window.Pulse = {
    version: VERSION,
    DEFAULT_SAMPLES: DEFAULT_SAMPLES,
    AUDIO_MAX_BYTES: AUDIO_MAX_BYTES,
    scan: scan, audio: audio, combine: combine, pick: pick,
    at: at, topFrames: topFrames, thin: thin, report: report,
    pct: pct, quantile: quantile
  };
})();