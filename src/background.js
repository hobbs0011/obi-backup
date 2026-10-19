/* ObiBg — BACKGROUND OPERATION (src/background.js).

   THE PROBLEM THIS ANSWERS. A tab that is not visible is throttled by the browser:
   timers are clamped, Chrome applies "intensive throttling" (~1 timer/minute) to a
   long-hidden page, requestAnimationFrame stops, and on mobile the page can be frozen
   or suspended outright. So the moment the sovereign switches to another app, work
   that runs in the page stalls — which is what "does it keep working in the
   background?" is really asking. (Operating with the DEVICE OFF is a different
   problem entirely, and no web page can do it: that is what a server runner is for.)

   WHAT THIS DOES — best effort, and measured:
     · holds a WEB LOCK while a job runs. Holding a Web Lock is one of the documented
       exemptions from Chrome's intensive timer throttling, so a hidden page keeps its
       timers at the normal clamp instead of once a minute.
     · holds a SCREEN WAKE LOCK while a job runs and the page is visible, so the phone
       doesn't sleep mid-upload.
     · optional SILENT KEEP-ALIVE AUDIO (ObiBg.audio(true)) — playing audio is the
       other documented exemption, and on iOS/mobile it is the only lever a web page
       has left. OFF by default: it lights the speaker indicator and touches the
       device's audio session (and this station already speaks replies).
     · reports honestly — in the chat and in the I-LOG — when the page went hidden
       mid-job and when it came back, with how long it was gone. "It kept running" is
       a measurement here, not a hope.

   WHAT IT CANNOT DO. A page cannot survive the browser freezing it, the OS suspending
   it, or memory pressure discarding the tab. For work that must finish regardless,
   hand it to something that is not the page: the Durable Object runner for small
   jobs, GitHub Actions for heavy ones — see src/COSTS.md.
   ========================================================================== */
(function(){
  const LOCK_NAME = "obi-job";
  const MAX_HOLD_MS = 45 * 60 * 1000;   /* a leak must never keep a screen awake forever */

  let holds = 0;
  let labels = [];
  let heldSince = 0;
  let lockResolve = null;
  let wake = null;
  let audioEl = null;
  let audioOn = false;
  /* OFF by default. The tone is inaudible by construction, but it is still the only
     thing in this app that makes sound on its own, so it is opt-in: `/bg audio on`
     (or the ⚙ Settings row) arms it and remembers the choice. The Web Lock and the
     wake lock — the exemptions that do not touch the speaker — stay automatic. */
  let autoAudio = false;
  try{ autoAudio = localStorage.getItem("obi_bg_audio") === "on"; }catch(e){}
  let hiddenAt = null;
  let pauses = 0;          /* how many times a job was hidden, this session */
  let lastHiddenFor = 0;
  /* a 1 s heartbeat: a hidden page's timers get clamped, and under Chrome's
     intensive throttling to ~1/minute. The gaps between beats are therefore a
     MEASUREMENT of whether this page is still moving in the background — the
     answer to "is it still working while I'm in another tab?". */
  let hbLast = Date.now(), hbMaxGap = 0, hbBeats = 0, hbThrottled = 0, hbWorstAt = 0;
  /* THE AWAY-EPISODE PROBE — the answer to "did it keep working while I was gone?".
     While the page is hidden, count how many times that 1 s heartbeat actually
     fired. Beats ≈ seconds means the page kept moving; beats far below seconds
     means the browser clamped or throttled it. The counters above live in memory,
     and the station reloads constantly (every /forge apply, every reincarnate,
     every time an agent drives it), so a reload used to ERASE the only evidence
     there was. This episode summary is therefore persisted to localStorage and
     re-reported by /bg — and, once it is long enough to matter, written into the
     append-only I-LOG as well. */
  const AWAY_KEY = "obi_bg_lastaway";
  let away = null;          /* the open hidden episode */
  let lastAway = null;      /* the last finished one, mirrored to localStorage */
  try{ lastAway = JSON.parse(localStorage.getItem(AWAY_KEY) || "null"); }catch(e){ lastAway = null; }
  function awayBegin(){ away = { t: now(), beats: 0, maxGap: 0, throttled: 0, holds: holds, hidden: document.visibilityState === "hidden" }; }
  function awayEnd(){
    if(!away) return null;
    const secs = Math.max(1, Math.round((now() - away.t) / 1000));
    /* if the timer never fired at all while hidden, the worst gap IS the window */
    const maxGap = away.beats === 0 ? secs * 1000 : away.maxGap;
    lastAway = { at: away.t, seconds: secs, beats: away.beats, maxGapMs: maxGap,
      throttled: away.throttled, holds: away.holds, ratio: Math.round((away.beats / secs) * 100) };
    away = null;
    try{ localStorage.setItem(AWAY_KEY, JSON.stringify(lastAway)); }catch(e){}
    return lastAway;
  }
  function awayLine(a){
    if(!a) return "never measured — switch away and come back, then run /bg";
    if(a.seconds < 10) return "away " + a.seconds + "s — " + a.beats + " beat(s) · too short to judge (needs ~30s)";
    const mins = a.seconds >= 90 ? Math.floor(a.seconds / 60) + "m " + (a.seconds % 60) + "s" : a.seconds + "s";
    const avg = Math.round((a.seconds / Math.max(1, a.beats)) * 10) / 10;
    let verdict;
    if(a.throttled) verdict = "<b>throttled " + a.throttled + "×</b> — worst gap " + Math.round(a.maxGapMs / 1000) + "s; the page was slowed, not stopped";
    else if(a.ratio >= 80) verdict = "<b>kept moving at full speed</b> — a beat every " + avg + "s";
    else if(a.ratio >= 25) verdict = "<b>clamped</b> — a beat every " + avg + "s (normal for a hidden tab, and work still proceeds)";
    else verdict = "<b>heavily throttled</b> — only " + a.beats + " beat(s) in " + a.seconds + "s";
    return "away " + mins + " · " + verdict + (a.holds ? " · a job was holding the keep-alive" : " · nothing was holding it");
  }

  function now(){ return Date.now(); }
  function note(html, detail, ok){
    try{ if(typeof window.addBubble === "function") window.addBubble("ass", html); }catch(e){}
    try{ if(typeof window.logOp === "function") window.logOp({ kind:"op", action:"background", ok: ok !== false, detail: detail || "", result: holds + " hold(s)" }); }catch(e){}
  }

  /* ---- the Web Lock: the page stops being a candidate for intensive throttling --- */
  function holdLock(){
    if(lockResolve || !navigator.locks || !navigator.locks.request) return;
    try{
      navigator.locks.request(LOCK_NAME, { mode:"exclusive" }, () => new Promise(res => {
        /* the grant is async: if the job finished while it was pending, let it go
           immediately instead of holding a lock nobody will ever release. */
        if(holds <= 0) return res();
        lockResolve = res;
      }));
    }catch(e){}
  }
  function freeLock(){
    const r = lockResolve; lockResolve = null;
    try{ if(r) r(); }catch(e){}
  }

  /* ---- the wake lock: the screen stays on while the job runs --------------------- */
  async function takeWake(){
    try{
      if(wake || !navigator.wakeLock || document.visibilityState !== "visible") return;
      const w = await navigator.wakeLock.request("screen");
      if(holds <= 0){ try{ w.release(); }catch(e){} return; }   /* released mid-request */
      wake = w;
      try{ w.addEventListener("release", () => { if(wake === w) wake = null; }); }catch(e){}
    }catch(e){ wake = null; }
  }
  function dropWake(){
    const w = wake; wake = null;
    try{ if(w) w.release(); }catch(e){}
  }

  /* ---- optional: a silent loop, so the page counts as "playing audio" ------------ */
  function silentWavUrl(){
    /* Not pure silence: Chromium decides "is this page playing audio?" from the
       actual output signal, so a file of zeros reads as NOT playing and buys no
       exemption. This is a 19 Hz tone at ~2% amplitude — far below what a phone or
       laptop speaker can move air at, and below what an ear hears — but real signal.

       TWO THINGS THAT USED TO MAKE IT AUDIBLE:
         · it was clamped to volume 0.001 by the <audio> element, which leaves the
           samples near ±1 LSB — quiet enough that Chromium may have counted it as
           silence (no exemption) while some DACs still rendered the step.
         · it was 8000 Hz / 1 second, so any resample to a 44.1 kHz device left a
           discontinuity at the loop seam — once per second. A tick every second is
           exactly what a "dinging" complaint sounds like.
       So: 48 kHz (a rate nothing has to resample), two seconds, and a whole number
       of cycles in the buffer (19 × 2 = 38), which makes the loop mathematically
       seamless. Amplitude is in the samples; the element plays at full volume. */
    const rate = 48000, n = rate * 2, f = 19;
    const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, s) => { for(let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true);
    v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
    for(let i = 0; i < n; i++){
      const a = Math.round(Math.sin(2 * Math.PI * f * (i / rate)) * 655);   /* ≈2% of full scale */
      v.setInt16(44 + i * 2, a, true);
    }
    return URL.createObjectURL(new Blob([buf], { type:"audio/wav" }));
  }
  function playAudio(){
    if(!audioOn) return;
    try{
      if(!audioEl){
        audioEl = document.createElement("audio");
        audioEl.src = silentWavUrl();
        audioEl.loop = true;
        audioEl.volume = 1;
        audioEl.setAttribute("playsinline", "");
        audioEl.style.display = "none";
        document.body.appendChild(audioEl);
      }
      const p = audioEl.play();
      if(p && p.catch) p.catch(() => {});          /* autoplay policy: needs a gesture */
    }catch(e){}
  }
  function stopAudio(){ try{ if(audioEl) audioEl.pause(); }catch(e){} }

  /* ---- visibility: say what happened, don't pretend ----------------------------- */
  function onVis(){
    const hidden = document.visibilityState === "hidden";
    if(hidden){
      dropWake();
      hiddenAt = now();
      awayBegin();
      if(holds){
        pauses++;
        note("⏸ Page hidden while <b>" + labels.join(", ") + "</b> runs — the phone/browser may throttle it. "
           + "The keep-alive lock is held; <b>stay off this tab is fine, closing it is not</b>.", "hidden mid-job (holds=" + holds + ")", true);
      }
    } else {
      if(hiddenAt){
        lastHiddenFor = Math.round((now() - hiddenAt) / 1000);
        hiddenAt = null;
        const aw = awayEnd();
        /* a real measurement, in the chat and in the record — but only when the
           trip was long enough to mean anything (switching tabs for 3 seconds is
           not news, and every chat line here is also an I-LOG entry). */
        if(aw && (aw.seconds >= 30 || aw.throttled || holds)){
          note("▶ Back after <b>" + aw.seconds + "s</b> hidden — " + awayLine(aw),
            "away " + aw.seconds + "s · " + aw.beats + " beats · throttled " + aw.throttled + "x · worst " + Math.round(aw.maxGapMs / 1000) + "s", true);
        }
      }
      if(holds){ takeWake(); playAudio(); }
    }
  }
  try{ document.addEventListener("visibilitychange", onVis); }catch(e){}

  /* ---- the API ------------------------------------------------------------------ */
  function hold(label){
    holds++; labels.push(String(label || "job"));
    if(holds === 1) heldSince = now();
    holdLock(); takeWake();
    if(autoAudio && !audioOn){ audioOn = true; playAudio(); }
    return holds;
  }
  function release(){
    holds = Math.max(0, holds - 1);
    labels.pop();
    if(!holds){
      /* say whether the browser actually throttled us while the job ran */
      if(hbThrottled && heldSince && hbWorstAt >= heldSince){
        note("⚠ The browser <b>throttled this page</b> while the job ran — worst gap between heartbeats "
           + Math.round(hbMaxGap / 1000) + "s (" + hbThrottled + " time(s)). The work continued, but slower than real time. "
           + "Keep-alive audio is " + (autoAudio ? "on" : "<b>off</b> — <b>/bg audio on</b> is the strongest lever on mobile") + ".", "throttled " + hbThrottled + "x · worst " + Math.round(hbMaxGap/1000) + "s", true);
      }
      heldSince = 0; freeLock(); dropWake();
      if(audioOn && autoAudio){ audioOn = false; stopAudio(); }
    }
    return holds;
  }
  /* wrap any async job: guard("ear", () => runJob()) */
  async function guard(label, fn){
    hold(label);
    try{ return await fn(); } finally{ release(); }
  }
  function audio(on){
    autoAudio = !!on;
    try{ localStorage.setItem("obi_bg_audio", autoAudio ? "on" : "off"); }catch(e){}
    audioOn = autoAudio;
    if(audioOn){
      playAudio();
      note("🔊 Keep-alive audio <b>on</b> — it now rides along with every job and the page counts as playing audio, which is one of the documented exemptions from the browser's throttling and freezing. It is a 19 Hz tone: real signal, below what a speaker or an ear reproduces. The speaker indicator may still show.", "keep-alive audio ON (remembered in this browser)", true);
    } else {
      stopAudio();
      note("🔇 Keep-alive audio <b>off</b> — remembered in this browser. On a phone this makes suspension much more likely; the Web Lock still helps on desktop.", "keep-alive audio OFF (remembered)", true);
    }
    return autoAudio;
  }
  function status(){
    return {
      holds: holds, labels: labels.slice(), lock: !!lockResolve, wake: !!wake, audio: audioOn, autoAudio: autoAudio,
      heldMs: heldSince ? now() - heldSince : 0,
      hidden: document.visibilityState === "hidden",
      hiddenFor: hiddenAt ? Math.round((now() - hiddenAt) / 1000) : 0,
      pauses: pauses, lastHiddenFor: lastHiddenFor,
      away: away ? { seconds: Math.round((now() - away.t) / 1000), beats: away.beats, throttled: away.throttled, holds: away.holds } : null,
      lastAway: lastAway, lastAwayLine: awayLine(lastAway),
      heartbeat: { beats: hbBeats, maxGapMs: hbMaxGap, throttled: hbThrottled, worstAt: hbWorstAt },
      supported: { locks: !!(navigator.locks && navigator.locks.request), wakeLock: !!navigator.wakeLock }
    };
  }
  function text(){
    const s = status();
    const hb = s.heartbeat.throttled ? "throttled " + s.heartbeat.throttled + "x (worst gap " + Math.round(s.heartbeat.maxGapMs/1000) + "s)" : "no throttling seen";
    return "BG " + (s.holds ? "HOLDING " + s.holds + " (" + s.labels.join(", ") + ")" : "idle")
      + " · lock " + (s.lock ? "held" : "—") + " · wake " + (s.wake ? "held" : "—") + " · audio " + (s.audio ? "on" : (s.autoAudio ? "auto" : "off"))
      + " · hidden " + s.pauses + "x" + (s.lastHiddenFor ? " (last " + s.lastHiddenFor + "s)" : "")
      + " · heartbeat " + hb
      + (s.lastAway ? " · last away " + s.lastAway.seconds + "s/" + s.lastAway.beats + " beats" : "");
  }

  /* the 1 s heartbeat — the measurement behind "is it still moving in the
     background?". A visible page beats every second; a hidden one is clamped, and
     Chrome's intensive throttling stretches it to ~1/minute, which shows up here
     as a huge gap. */
  setInterval(() => {
    const t = now(), gap = t - hbLast;
    hbLast = t; hbBeats++;
    if(gap > 1800){
      hbThrottled++;
      if(gap > hbMaxGap){ hbMaxGap = gap; hbWorstAt = t; }
      if(away) away.throttled++;
    }
    /* the same beat, counted for the away-episode probe: how many of the ticks
       actually landed while the page was hidden */
    if(away){ away.beats++; if(gap > away.maxGap) away.maxGap = gap; }
  }, 1000);

  /* a leaked hold must not keep a screen awake forever */
  setInterval(() => {
    if(holds && heldSince && now() - heldSince > MAX_HOLD_MS){
      note("⚠ Keep-alive held over " + Math.round(MAX_HOLD_MS / 60000) + " min — released it (a job leaked its hold).", "auto-release after max hold", false);
      holds = 0; labels = []; heldSince = 0; freeLock(); dropWake(); stopAudio();
    }
  }, 60000);

  window.ObiBg = {
    hold, release, guard, audio, status, text, onVis, awayLine,
    /* start a clean measurement: `/bg` → switch tab → come back → `/bg` again.
       The LAST-AWAY summary is deliberately NOT cleared here — it is the answer to
       a question that was asked before this reload, and losing it was the bug. */
    probeReset(){ hbMaxGap = 0; hbThrottled = 0; hbWorstAt = 0; hbBeats = 0; hbLast = now(); if(away) awayBegin(); return true; },
    lastAway(){ return lastAway; },
    clearAway(){ lastAway = null; try{ localStorage.removeItem(AWAY_KEY); }catch(e){} return true; },
    heartbeat(){ return { beats: hbBeats, maxGapMs: hbMaxGap, throttled: hbThrottled, worstAt: hbWorstAt, hidden: document.visibilityState === "hidden" }; }
  };
})();
