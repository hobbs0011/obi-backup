/* ============================================================================
   REEL ENGINE — images into video. The inverse of the stills pull.

   ONE JOB. A list of pictures goes in; a real, playable video comes out. No
   server, no upload, no library on the file: the frames are composed on a
   canvas, handed to the browser's own hardware codec (WebCodecs), and muxed
   into an MP4 with sound. Nothing leaves the machine, and the file is measured
   before it is claimed.

   WHY THIS EXISTS. Pulling stills OUT of footage is only half an eye. The
   sovereign's venue has four clips and eighteen photographs, and the thing a
   venue actually needs is the other direction: photographs, cut into a
   vertical reel with the sound of the room under them. Same node, same
   material, backwards.

   TWO ENGINES, CHOSEN BY MEASUREMENT, NEVER BY HOPE (see caps()):
     · WEBCodecs — the fast path. The browser's own encoder (H.264 + AAC in an
       MP4, or VP9 + Opus in a WebM) is driven frame by frame, so a thirty
       second reel is written in a few seconds of wall clock, at an exact fps,
       whether or not anyone is looking at the tab. Audio is decoded with the
       Web Audio API, trimmed and faded offline, and encoded alongside.
     · MEDIARECORDER — the fallback, for a browser without WebCodecs. Real
       time: the composition is played ON SCREEN into a canvas capture stream,
       so a thirty second reel costs thirty seconds of wall clock. Honest, and
       named as such in the result (`engine`).

   WHAT IT REFUSES TO DO. It never claims a duration it did not encode, a
   sound it did not capture, or a codec the browser did not accept:
     · a silent reel is labelled silent, with the reason;
     · if no video codec is supported it says so and writes nothing;
     · the finished file is read back through a <video> element (verify()) so
       the numbers reported are the numbers a player sees, not the ones the
       engine intended.

   THE COMPOSITION. A reel is a uniform timeline of SHOTS. A shot is a picture
   (or a title/end card, which is a shot with no picture), and every shot has a
   hold time and a motion. Shots overlap by the crossfade, so
       total = n * hold - (n - 1) * crossfade
   is what the file will run for. Nothing else in this file is time-critical:
   the draw() below is the whole visual language.
   ========================================================================== */
(function(){
  "use strict";

  const MUXURL = {
    mp4:  "https://esm.sh/mp4-muxer@5.2.1",
    webm: "https://esm.sh/webm-muxer@5.1.3"
  };
  const _muxCache = {};
  async function muxerModule(kind){
    if(!_muxCache[kind]) _muxCache[kind] = await import(MUXURL[kind]);
    return _muxCache[kind];
  }

  /* The candidate encoders, best first. H.264 in an MP4 is the one that plays
     everywhere a venue would put a clip — a phone, an Instagram upload, a
     Windows laptop from 2011 — so it leads, and VP9/WebM is the runner-up for
     a browser whose H.264 is hardware-gated at the size we asked for.
     The level is the part people get wrong: avc1.42001f is Baseline LEVEL 3.1,
     which refuses 1080x1920 outright. Everything here is level 4.0 or above. */
  const VIDEO_CANDS = [
    { codec:"avc1.42E028", profile:"baseline", container:"mp4", mux:"mp4", muxCodec:"avc",  audioCodec:"aac",  audioMux:"aac"  },
    { codec:"avc1.420028", profile:"baseline", container:"mp4", mux:"mp4", muxCodec:"avc",  audioCodec:"aac",  audioMux:"aac"  },
    { codec:"avc1.4d0028", profile:"main",     container:"mp4", mux:"mp4", muxCodec:"avc",  audioCodec:"aac",  audioMux:"aac"  },
    { codec:"avc1.640028", profile:"high",     container:"mp4", mux:"mp4", muxCodec:"avc",  audioCodec:"aac",  audioMux:"aac"  },
    { codec:"vp09.00.10.08", profile:"vp9",    container:"webm", mux:"webm", muxCodec:"V_VP9", audioCodec:"opus", audioMux:"A_OPUS" }
  ];
  const AUDIO_CANDS = { aac:["mp4a.40.2", 128000], opus:["opus", 128000] };

  function bitrateFor(w, h, fps){
    const bits = w * h * Math.max(12, fps) * 0.14;
    return Math.max(2_000_000, Math.min(20_000_000, Math.round(bits / 100000) * 100000));
  }
  const clamp = function(v, a, b){ return v < a ? a : (v > b ? b : v); };

  /* ============================================================ capability */
  /* Answer the only question that matters before a render: can THIS browser
     write a video, and in what container? Measured, not assumed. */
  async function caps(w, h, fps){
    w = w || 1080; h = h || 1920; fps = fps || 30;
    const out = {
      webcodecs: typeof window.VideoEncoder === "function",
      audioEncoder: typeof window.AudioEncoder === "function",
      recorder: typeof window.MediaRecorder === "function",
      captureStream: (function(){ try{ return !!document.createElement("canvas").captureStream; }catch(e){ return false; } })(),
      video: null, audio: null, container: null, reason: ""
    };
    if(out.webcodecs){
      for(const c of VIDEO_CANDS){
        let okA = false;
        try{
          const r = await window.VideoEncoder.isConfigSupported({
            codec:c.codec, width:w, height:h, bitrate:bitrateFor(w, h, fps), framerate:fps
          });
          okA = !!r.supported;
        }catch(e){ okA = false; }
        if(!okA) continue;
        let okB = true, acodec = null;
        if(out.audioEncoder){
          const [code, rate] = AUDIO_CANDS[c.audioCodec];
          try{
            const ra = await window.AudioEncoder.isConfigSupported({ codec:code, sampleRate:48000, numberOfChannels:2, bitrate:rate });
            okB = !!ra.supported;
          }catch(e){ okB = false; }
          if(okB) acodec = code;
        }
        out.video = c; out.audio = okB ? acodec : null;
        out.container = c.container;
        out.reason = c.codec + " accepted at " + w + "x" + h + (okB ? " with " + acodec : " (no audio encoder — reels will be silent)");
        return out;
      }
    }
    if(out.recorder && out.captureStream){
      out.container = (function(){
        const cands = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
        for(const m of cands){ try{ if(MediaRecorder.isTypeSupported(m)) return m; }catch(e){} }
        return "video/webm";
      })();
      out.reason = "no WebCodecs — falling back to MediaRecorder (" + out.container + "), which records in REAL TIME";
      return out;
    }
    out.reason = "this browser can neither encode (no WebCodecs) nor record (no MediaRecorder) a video";
    return out;
  }

  /* ============================================================ the timeline */
  /* A shot: {bmp, w, h, motion, hold?} — or a card: {card:"title"|"end", ...}.
     plan() is pure arithmetic so the UI can show the exact length of a reel
     before a single frame is drawn. */
  const MOTION_CYCLE = ["in","out","pan-r","in","pan-l","out","up","in","down","out"];

  function plan(opts){
    opts = opts || {};
    const shots = [];
    const intro = opts.titleCard && String(opts.titleCard.title || "").trim();
    const outro = opts.endCard && String(opts.endCard.title || "").trim();
    if(intro) shots.push({ card:"title", title:String(opts.titleCard.title), sub:String(opts.titleCard.sub || ""), kicker:String(opts.titleCard.kicker || ""), motion:"none" });
    const pics = (opts.shots || []).filter(function(s){ return s && (s.bmp || s.img); });
    pics.forEach(function(s, i){
      let m = s.motion || opts.motion || "auto";
      if(m === "auto") m = MOTION_CYCLE[(i + (opts.seed || 0)) % MOTION_CYCLE.length];
      shots.push({ bmp:s.bmp || s.img, w:s.w, h:s.h, url:s.url, motion:m, hold:s.hold || opts.perShot || 2.6,
                   caption:(s.caption || "").trim() || null, name:s.name || null, tainted:!!s.tainted });
    });
    if(outro) shots.push({ card:"end", title:String(opts.endCard.title), sub:String(opts.endCard.sub || ""), kicker:String(opts.endCard.kicker || ""), motion:"none" });

    const n = shots.length;
    const perShot = Math.max(0.4, Number(opts.perShot) || 2.6);
    /* per-shot holds may differ; the crossfade is clamped to the shortest hold
       so a 1s shot can never fade into itself */
    const holds = shots.map(function(s){ return Math.max(0.4, Number(s.hold) || perShot); });
    const minHold = holds.length ? Math.min.apply(null, holds) : perShot;
    const cross = clamp(Number(opts.transition), 0, Math.min(minHold * 0.6, 3));

    if(!n) return { shots:[], n:0, perShot:perShot, cross:cross, total:0, frames:0 };

    /* each shot starts when the previous one begins to fade out */
    let t = 0;
    shots.forEach(function(s, i){
      s.start = t;
      s.hold = holds[i];
      t += (i === n - 1) ? 0 : (holds[i] - cross);
    });
    const total = shots[n - 1].start + shots[n - 1].hold;
    const fps = clamp(Number(opts.fps) || 30, 12, 60);
    return { shots:shots, n:n, perShot:perShot, cross:cross, total:total, fps:fps, frames:Math.round(total * fps) };
  }

  /* how long the reel will run, without building it */
  function duration(opts){
    const p = plan(opts);
    return { n:p.n, total:p.total, frames:p.frames, cross:p.cross };
  }

  /* ============================================================ the drawing */
  /* Everything you can see in a reel is in this one function. It is called
     once per output frame, with the wall clock replaced by t. */
  function coverRect(iw, ih, W, H, z, panX, panY){
    const s = Math.max(W / iw, H / ih) * z;
    const dw = iw * s, dh = ih * s;
    const slackX = Math.max(0, (dw - W) / 2), slackY = Math.max(0, (dh - H) / 2);
    return { dw:dw, dh:dh, x:(W - dw) / 2 + panX * slackX, y:(H - dh) / 2 + panY * slackY };
  }
  function containRect(iw, ih, W, H){
    const s = Math.min(W / iw, H / ih);
    const dw = iw * s, dh = ih * s;
    return { dw:dw, dh:dh, x:(W - dw) / 2, y:(H - dh) / 2 };
  }
  function motionOf(kind, e, amt){
    const z = 1 + amt, pan = { x:0, y:0 };
    switch(kind){
      case "in":    return { z:1 + amt * e, x:0, y:0 };
      case "out":   return { z:1 + amt * (1 - e), x:0, y:0 };
      case "pan-r": return { z:1 + amt * 0.5, x: 1 - 2 * e, y:0 };
      case "pan-l": return { z:1 + amt * 0.5, x: -1 + 2 * e, y:0 };
      case "up":    return { z:1 + amt * 0.5, x:0, y: 1 - 2 * e };
      case "down":  return { z:1 + amt * 0.5, x:0, y: -1 + 2 * e };
      default:      return { z:1, x:0, y:0 };
    }
  }
  /* a soft, cheap out-of-focus backdrop for pictures that do not fill the
     frame: the picture drawn tiny and blown back up is a box blur for free. */
  function softBackdrop(ctx, bmp, W, H, cache){
    const tw = 48, th = Math.max(2, Math.round(48 * H / W));
    if(!cache.cv){ cache.cv = document.createElement("canvas"); cache.ctx = cache.cv.getContext("2d"); }
    cache.cv.width = tw; cache.cv.height = th;
    const r = coverRect(bmp.width, bmp.height, tw, th, 1, 0, 0);
    cache.ctx.drawImage(bmp, r.x, r.y, r.dw, r.dh);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(cache.cv, 0, 0, tw, th, 0, 0, W, H);
  }

  function makePainter(W, H, P, opts){
    const vign = (Number(opts.vignette) || 0);
    const bar  = !!opts.progressBar;
    const cap  = String(opts.caption || "").trim();
    const perShot = P.shots.some(function(s){ return !!s.caption; });
    const mark = String(opts.watermark || "").trim();
    const fit  = opts.fit === "contain" ? "contain" : "cover";
    const amt  = clamp(Number(opts.motionAmount) || 0.14, 0, 0.5);
    const bg   = opts.bg || "#000000";
    const back = { cv:null, ctx:null };
    let vg = null;
    const capFont = Math.round(W * 0.052) + "px Inter, system-ui, sans-serif";
    const capSm   = Math.round(W * 0.026) + "px Inter, system-ui, sans-serif";
    const cardBig = "800 " + Math.round(W * 0.115) + "px Orbitron, Inter, sans-serif";
    const cardSub = Math.round(W * 0.038) + "px Inter, system-ui, sans-serif";

    function textShadowed(ctx, text, x, y, font, fill, maxW){
      ctx.font = font; ctx.fillStyle = fill;
      ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = Math.round(W * 0.02); ctx.shadowOffsetY = 2;
      ctx.fillText(text, x, y, maxW);
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    }

    return function paint(ctx, t){
      ctx.save();
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      /* which shots are alive at this instant, oldest first */
      const live = [];
      for(let i = 0; i < P.shots.length; i++){
        const s = P.shots[i];
        if(t >= s.start - 1e-6 && t <= s.start + s.hold + 1e-6) live.push(s);
      }
      if(!live.length){ ctx.restore(); return; }

      const drawShot = function(s, alpha){
        if(s.card){
          ctx.globalAlpha = alpha;
          ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
          const e = clamp((t - s.start) / s.hold, 0, 1);
          const rise = (1 - clamp(e * 3, 0, 1)) * H * 0.04;
          ctx.textAlign = "center";
          if(s.kicker){
            ctx.font = cardSub; ctx.fillStyle = "#d4a853";
            ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 24;
            ctx.fillText(String(s.kicker), W / 2, H * 0.44 + rise, W * 0.82);
            ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
          }
          ctx.font = cardBig; ctx.fillStyle = "#f5efe6";
          ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 30;
          const ty = H * 0.52 + rise;
          const words = String(s.title).split(/\s+/);
          const lines = []; let line = "";
          words.forEach(function(wd){
            const test = line ? line + " " + wd : wd;
            if(ctx.measureText(test).width > W * 0.8 && line){ lines.push(line); line = wd; } else line = test;
          });
          if(line) lines.push(line);
          lines.forEach(function(L, i){
            ctx.fillText(L, W / 2, ty + i * W * 0.135, W * 0.86);
          });
          if(s.sub){
            ctx.font = cardSub; ctx.fillStyle = "#d4a853";
            ctx.fillText(s.sub, W / 2, ty + lines.length * W * 0.135 + W * 0.02, W * 0.8);
          }
          ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          return;
        }
        const bmp = s.bmp;
        const e = clamp((t - s.start) / s.hold, 0, 1);
        const eased = e * e * (3 - 2 * e);         /* smoothstep: no robotic ramps */
        const m = motionOf(s.motion, eased, amt);
        ctx.globalAlpha = alpha;
        if(fit === "contain"){
          softBackdrop(ctx, bmp, W, H, back);
          ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, 0, W, H);
          const r = containRect(bmp.width, bmp.height, W, H);
          ctx.drawImage(bmp, r.x, r.y, r.dw, r.dh);
        } else {
          const r = coverRect(bmp.width, bmp.height, W, H, m.z, m.x, m.y);
          ctx.drawImage(bmp, r.x, r.y, r.dw, r.dh);
        }
        ctx.globalAlpha = 1;
      };

      /* the first live shot is the base; each later one fades in over it. This
         is a crossfade that never dips to black in the middle. */
      drawShot(live[0], 1);
      for(let i = 1; i < live.length; i++){
        const s = live[i];
        const a = P.cross > 0.001 ? clamp((t - s.start) / P.cross, 0, 1) : 1;
        if(a > 0.001) drawShot(s, a);
      }

      if(vign > 0.001){
        if(!vg || vg._w !== W || vg._h !== H){
          vg = ctx.createRadialGradient(W / 2, H * 0.46, Math.min(W, H) * 0.25, W / 2, H * 0.5, Math.max(W, H) * 0.72);
          vg.addColorStop(0, "rgba(0,0,0,0)");
          vg.addColorStop(1, "rgba(0,0,0," + vign.toFixed(3) + ")");
          vg._w = W; vg._h = H;
        }
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      }

      /* THE TEXT. Either one caption for the whole reel, or — when the story has
         dressed it — a different line on every picture. Only one line is ever on
         screen: a line changes when the incoming picture has fully arrived, not
         during the fade, so no two lines ever overlap and none is ever missing. */
      const lineAt = function(){
        if(!perShot) return cap;
        let owner = null;
        for(let i = 0; i < live.length; i++){
          if(live[i].card) continue;
          if(t >= live[i].start + P.cross - 1e-6 || live.length === 1) owner = live[i];
        }
        return owner && owner.caption ? owner.caption : "";
      };
      const text = lineAt();
      if(text){
        const sc = ctx.createLinearGradient(0, H * 0.58, 0, H);
        sc.addColorStop(0, "rgba(0,0,0,0)");
        sc.addColorStop(1, "rgba(0,0,0,0.78)");
        ctx.fillStyle = sc; ctx.fillRect(0, H * 0.58, W, H * 0.42);
        ctx.textAlign = "left";
        textShadowed(ctx, text, W * 0.06, bar ? H * 0.9 : H * 0.93, capFont, "#f5efe6", W * 0.88);
      }
      if(mark){
        ctx.textAlign = "left";
        ctx.globalAlpha = 0.85;
        textShadowed(ctx, mark, W * 0.06, H * 0.055, capSm, "#f5efe6", W * 0.7);
        ctx.globalAlpha = 1;
      }
      if(bar){
        ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fillRect(0, H - Math.max(3, H * 0.006), W, Math.max(3, H * 0.006));
        ctx.fillStyle = "#d4a853";
        ctx.fillRect(0, H - Math.max(3, H * 0.006), W * clamp(t / P.total, 0, 1), Math.max(3, H * 0.006));
      }
      ctx.restore();
    };
  }

  /* pictures in, bitmaps out — decoded once, so the nine hundred draws of a
     reel are cheap. Three doors, in order of how clean the result is:
       1. fetch() — the picture arrives as bytes, so the canvas stays UNTAINTED
          and the encoder may read it. Needs the host to send CORS headers;
          the file host this family uses does.
       2. <img crossOrigin> — same cleanliness, no fetch.
       3. <img> plain — always loads, but TAINTS the canvas, which an encoder
          will refuse. Kept because a picture still draws; the shot is flagged
          so the caller can tell the truth about why a render failed. */
  function decodeUrl(src, cors){
    return new Promise(function(res){
      const im = new Image();
      if(cors) im.crossOrigin = "anonymous";
      im.onload = function(){ res(im); };
      im.onerror = function(){ res(null); };
      im.src = src;
    });
  }
  async function loadShots(list){
    const out = [];
    const failed = [];
    for(const s of (list || [])){
      const src = (s && (s.url || s.src)) || s;
      if(!src){ continue; }
      let bmp = null, tainted = false;
      try{
        const r = await fetch(src, { mode:"cors" });
        if(r.ok) bmp = await createImageBitmap(await r.blob());
      }catch(e){ /* the host does not allow a read — try the element doors */ }
      if(!bmp){
        const im = await decodeUrl(src, true);
        if(im){ try{ bmp = await createImageBitmap(im); }catch(e){ bmp = null; } }
      }
      if(!bmp){
        const im = await decodeUrl(src, false);
        if(im){ try{ bmp = await createImageBitmap(im); tainted = true; }catch(e){ bmp = null; } }
      }
      if(bmp) out.push({ bmp:bmp, w:bmp.width, h:bmp.height, url:src, tainted:tainted });
      else failed.push(String(src).slice(0, 80));
    }
    out.failed = failed;
    return out;
  }

  /* the audio bed: decoded, trimmed, looped, faded — offline, exactly the
     length of the reel. Returns null (and a reason) if it cannot be had. */
  async function prepareAudio(blob, seconds, opt){
    opt = opt || {};
    if(!blob) return { buffer:null, why:"no bed" };
    const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if(!AC) return { buffer:null, why:"this browser has no OfflineAudioContext" };
    let decoded = null, ctx = null;
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
      decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    }catch(e){
      try{ if(ctx) ctx.close(); }catch(e2){}
      return { buffer:null, why:"the audio would not decode (" + ((e && e.message) || e) + ")" };
    }
    try{ ctx.close(); }catch(e){}
    const sr = 48000;
    const frames = Math.max(1, Math.round(seconds * sr));
    const off = new AC(2, frames, sr);
    const src = off.createBufferSource();
    src.buffer = decoded;
    src.loop = (opt.loop !== false);
    src.loopStart = 0; src.loopEnd = decoded.duration;
    const gain = opt.gain == null ? 1 : clamp(Number(opt.gain), 0, 4);
    const g = off.createGain();
    const fi = clamp(Number(opt.fadeIn) || 1.2, 0, seconds / 2);
    const fo = clamp(Number(opt.fadeOut) || 2.0, 0, seconds / 2);
    g.gain.setValueAtTime(0.0001, 0);
    g.gain.linearRampToValueAtTime(gain, fi);
    if(seconds > fi + fo + 0.05){
      g.gain.setValueAtTime(gain, seconds - fo);
      g.gain.linearRampToValueAtTime(0.0001, seconds);
    }
    src.connect(g); g.connect(off.destination);
    src.start(0, clamp(Number(opt.startAt) || 0, 0, Math.max(0, decoded.duration - 0.01)));
    const buffer = await off.startRendering();
    return { buffer:buffer, why:null, source:{ duration:decoded.duration, channels:decoded.numberOfChannels, sampleRate:decoded.sampleRate, format:null } };
  }

  /* ============================================================ the render */
  /* THE FAST PATH. Frames are composed and encoded as quickly as the machine
     will take them; the audio bed is encoded alongside; both are muxed into a
     single file. Deterministic: the fps is the fps, and the length is the
     length, regardless of whether the tab is in front. */
  async function renderWebCodecs(opts, hooks){
    hooks = hooks || {};
    const W = opts.w, H = opts.h, fps = opts.fps;
    const P = plan(opts);
    if(!P.n) throw new Error("no shots to render");
    const cap = await caps(W, H, fps);
    if(!cap.webcodecs || !cap.video) throw new Error(cap.reason || "no WebCodecs encoder");
    const v = cap.video;

    const mod = await muxerModule(v.mux);
    const Muxer = mod.Muxer, Target = mod.ArrayBufferTarget;
    const target = new Target();

    const audioPlan = opts.audio && opts.audio.blob ? await prepareAudio(opts.audio.blob, P.total, opts.audio) : { buffer:null, why:"no bed" };
    const useAudio = !!(audioPlan.buffer && cap.audio && typeof window.AudioEncoder === "function");
    if(audioPlan.buffer && !useAudio && !audioPlan.why) audioPlan.why = "this browser has no audio encoder of a kind the muxer takes";

    const muxCfg = { target:target, fastStart:"in-memory", video:{ codec:v.muxCodec, width:W, height:H, frameRate:fps } };
    if(useAudio) muxCfg.audio = { codec:v.audioMux, numberOfChannels:2, sampleRate:48000 };
    const muxer = new Muxer(muxCfg);

    const vchunks = [], achunks = [];
    let descV = null, descA = null;

    const enc = new window.VideoEncoder({
      output: function(chunk, meta){
        vchunks.push({ chunk:chunk, meta:meta, t:chunk.timestamp });
        if(meta && meta.decoderConfig && meta.decoderConfig.description && !descV) descV = meta.decoderConfig.description;
      },
      error: function(e){ hooks.onError && hooks.onError(e); }
    });
    enc.configure({ codec:v.codec, width:W, height:H, bitrate:bitrateFor(W, H, fps), framerate:fps,
                    ...(v.muxCodec === "avc" ? { avc:{ format:"avc" } } : {}) });

    let aenc = null;
    if(useAudio){
      aenc = new window.AudioEncoder({
        output: function(chunk, meta){
          achunks.push({ chunk:chunk, meta:meta, t:chunk.timestamp });
          if(meta && meta.decoderConfig && meta.decoderConfig.description && !descA) descA = meta.decoderConfig.description;
        },
        error: function(e){ hooks.onError && hooks.onError(e); }
      });
      aenc.configure({ codec:cap.audio, sampleRate:48000, numberOfChannels:2, bitrate:AUDIO_CANDS[v.audioCodec][1] });
    }

    const canvas = opts.canvas || document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    try{ await document.fonts.ready; }catch(e){}
    const paint = makePainter(W, H, P, opts);

    const t0 = performance.now();
    const total = P.frames;
    for(let f = 0; f < total; f++){
      if(hooks.shouldStop && hooks.shouldStop()){ try{ enc.close(); }catch(e){} throw new Error("stopped"); }
      const t = f / fps;
      paint(ctx, t);
      let frame;
      try{
        frame = new window.VideoFrame(canvas, { timestamp: Math.round(f * 1e6 / fps), duration: Math.round(1e6 / fps) });
      }catch(e){
        try{ enc.close(); }catch(e2){}
        throw new Error("the encoder refused the picture — one of the shots was loaded without CORS, which taints the canvas. Use pictures the host allows to be read (or drop the files in from disk). [" + ((e && e.message) || e) + "]");
      }
      enc.encode(frame, { keyFrame: f % Math.max(1, fps * 2) === 0 });
      frame.close();
      if(hooks.onFrame) hooks.onFrame(f + 1, total, t);
      /* let the encoder drain rather than queueing 900 frames of raw pixels,
         and hand the event loop back often enough that the page stays alive */
      while(enc.encodeQueueSize > 12){ await new Promise(function(r){ setTimeout(r, 1); }); }
      if(f % 6 === 0) await new Promise(function(r){ setTimeout(r, 0); });
    }
    await enc.flush();
    try{ enc.close(); }catch(e){}

    if(useAudio){
      const buf = audioPlan.buffer, sr = 48000, ch = buf.numberOfChannels;
      const chans = [];
      for(let c = 0; c < 2; c++) chans.push((c < ch ? buf.getChannelData(c) : buf.getChannelData(0)));
      const N = buf.length, STEP = 1024;
      for(let i = 0; i < N; i += STEP){
        const n = Math.min(STEP, N - i);
        const data = new Float32Array(n * 2);
        data.set(chans[0].subarray(i, i + n), 0);
        data.set(chans[1].subarray(i, i + n), n);
        const ad = new window.AudioData({ format:"f32-planar", sampleRate:sr, numberOfFrames:n, numberOfChannels:2,
                                          timestamp: Math.round(i * 1e6 / sr), data:data });
        aenc.encode(ad);
        ad.close();
        if(i % (STEP * 40) === 0) await new Promise(function(r){ setTimeout(r, 0); });
      }
      await aenc.flush();
      try{ aenc.close(); }catch(e){}
    }

    /* mux in timestamp order — the one order every muxer agrees on */
    const all = [];
    vchunks.forEach(function(c){ all.push({ kind:"v", t:c.t, chunk:c.chunk, meta:c.meta }); });
    achunks.forEach(function(c){ all.push({ kind:"a", t:c.t, chunk:c.chunk, meta:c.meta }); });
    all.sort(function(a, b){ return a.t - b.t; });
    for(const it of all){
      let meta = it.meta;
      if(it.kind === "v"){
        if(!meta || !meta.decoderConfig) meta = { decoderConfig:{ codec:v.codec, width:W, height:H, description:descV } };
        else if(!meta.decoderConfig.description) meta = { decoderConfig:Object.assign({}, meta.decoderConfig, { description:descV }) };
        muxer.addVideoChunk(it.chunk, meta);
      } else {
        if(!meta || !meta.decoderConfig) meta = { decoderConfig:{ codec:cap.audio, sampleRate:48000, numberOfChannels:2, description:descA } };
        else if(!meta.decoderConfig.description) meta = { decoderConfig:Object.assign({}, meta.decoderConfig, { description:descA }) };
        muxer.addAudioChunk(it.chunk, meta);
      }
    }
    muxer.finalize();
    const blob = new Blob([target.buffer], { type: v.container === "mp4" ? "video/mp4" : "video/webm" });

    return {
      blob:blob, bytes:blob.size, engine:"webcodecs", container:v.container, ext:v.container === "mp4" ? ".mp4" : ".webm",
      codec:v.codec, profile:v.profile, audio:useAudio ? cap.audio : null, audioWhy:useAudio ? null : (audioPlan.why || null),
      w:W, h:H, fps:fps, frames:P.frames, seconds:P.total, ms:Math.round(performance.now() - t0),
      shots:P.n, cross:P.cross, realtimeFactor: (performance.now() - t0) / 1000 / Math.max(0.001, P.total)
    };
  }

  /* THE FALLBACK. No WebCodecs: play the composition on screen into a canvas
     capture stream. Real time, so the cost is the length of the reel. */
  async function renderRecorder(opts, hooks){
    hooks = hooks || {};
    const W = opts.w, H = opts.h, fps = opts.fps;
    const P = plan(opts);
    if(!P.n) throw new Error("no shots to render");
    const cap = await caps(W, H, fps);
    if(!(cap.recorder && cap.captureStream)) throw new Error(cap.reason || "this browser cannot record");
    const canvas = opts.canvas || document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    try{ await document.fonts.ready; }catch(e){}
    const paint = makePainter(W, H, P, opts);
    const stream = canvas.captureStream(fps);
    const tracks = stream.getVideoTracks();
    let audioNode = null, audioNote = null, actx = null;
    if(opts.audio && opts.audio.blob){
      try{
        const Ctx = window.AudioContext || window.webkitAudioContext;
        actx = new Ctx();
        const buf = await actx.decodeAudioData(await opts.audio.blob.arrayBuffer());
        const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
        const g = actx.createGain(); g.gain.value = opts.audio.gain == null ? 1 : opts.audio.gain;
        const dest = actx.createMediaStreamDestination();
        src.connect(g); g.connect(dest);
        src.start(0, clamp(Number(opts.audio.startAt) || 0, 0, Math.max(0, buf.duration - 0.01)));
        dest.stream.getAudioTracks().forEach(function(tr){ tracks.push(tr); });
        audioNode = { src:src, ctx:actx };
        await actx.resume().catch(function(){});
      }catch(e){ audioNote = "the bed could not be played: " + ((e && e.message) || e); }
    }
    const rec = new MediaRecorder(new MediaStream(tracks), {
      mimeType: cap.container.indexOf(";") > 0 ? cap.container : undefined,
      videoBitsPerSecond: bitrateFor(W, H, fps)
    });
    const chunks = [];
    rec.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
    const stopped = new Promise(function(res){ rec.onstop = res; });
    const t0 = performance.now();
    rec.start(200);
    await new Promise(function(res){
      function step(){
        const t = (performance.now() - t0) / 1000;
        if(hooks.shouldStop && hooks.shouldStop()){ res(); return; }
        if(t >= P.total){ paint(ctx, P.total); res(); return; }
        paint(ctx, t);
        if(hooks.onFrame) hooks.onFrame(Math.min(P.frames, Math.round(t * fps)), P.frames, t);
        requestAnimationFrame(step);
      }
      step();
    });
    try{ rec.stop(); }catch(e){}
    await stopped;
    if(audioNode){ try{ audioNode.ctx.close(); }catch(e){} }
    const blob = new Blob(chunks, { type: cap.container.split(";")[0] });
    return {
      blob:blob, bytes:blob.size, engine:"recorder", container: cap.container.indexOf("mp4") >= 0 ? "mp4" : "webm",
      ext: cap.container.indexOf("mp4") >= 0 ? ".mp4" : ".webm", codec:cap.container,
      audio: audioNote ? null : (audioNode ? "captured" : null), audioWhy: audioNote,
      w:W, h:H, fps:fps, frames:P.frames, seconds:P.total, ms:Math.round(performance.now() - t0),
      shots:P.n, cross:P.cross, realtime:true
    };
  }

  async function render(opts, hooks){
    const cap = await caps(opts.w, opts.h, opts.fps);
    if(cap.webcodecs && cap.video) return renderWebCodecs(opts, hooks);
    return renderRecorder(opts, hooks);
  }

  /* ------------------------------------------------------------------ preview
     The composition played back on a visible canvas, nothing recorded: the way
     to tune a reel without paying for it. Real-time by nature, so a hidden tab
     shows a still frame — which is what a hidden tab should show. */
  function preview(opts, hooks){
    hooks = hooks || {};
    const W = opts.w, H = opts.h, fps = opts.fps;
    const P = plan(opts);
    const canvas = opts.canvas;
    if(!canvas) return null;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const paint = makePainter(W, H, P, opts);
    let raf = 0, t0 = 0, alive = true, loop = opts.loop !== false, rep = 0;
    const step = function(now){
      if(!alive) return;
      if(!t0) t0 = now;
      const t = (now - t0) / 1000;
      if(t >= P.total){
        if(!loop){ paint(ctx, P.total); hooks.onDone && hooks.onDone(); return; }
        t0 = now; rep++;
      }
      paint(ctx, t % Math.max(0.001, P.total));
      hooks.onFrame && hooks.onFrame(t, P.total, rep);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return { stop: function(){ alive = false; try{ cancelAnimationFrame(raf); }catch(e){} } };
  }

  /* ------------------------------------------------------------------ verify
     Read the file back through a <video> element. What a player sees is the
     only duration worth reporting, so this is what the node reports. */
  function verify(blob, timeout){
    return new Promise(function(res){
      let url = null, done = false;
      try{ url = URL.createObjectURL(blob); }catch(e){ return res({ ok:false, why:"no object URL" }); }
      const v = document.createElement("video");
      const finish = function(o){
        if(done) return; done = true;
        try{ v.removeAttribute("src"); }catch(e){}
        res(Object.assign({ url:url }, o));
      };
      v.preload = "metadata"; v.muted = true;
      v.onloadedmetadata = function(){
        finish({ ok:true, seconds:v.duration, w:v.videoWidth, h:v.videoHeight, playable:!!(v.videoWidth && v.duration > 0) });
      };
      v.onerror = function(){ finish({ ok:false, why:"the browser would not open the file it just wrote" }); };
      setTimeout(function(){ finish({ ok:false, why:"no metadata after " + ((timeout || 8000) / 1000) + "s" }); }, timeout || 8000);
      v.src = url;
    });
  }

  /* one frame of the composition, drawn once — the poster, the thumbnail, and
     the way to LOOK at a reel without playing it. */
  function poster(opts, t, canvas){
    const W = opts.w, H = opts.h;
    const P = plan(opts);
    const cv = canvas || document.createElement("canvas");
    cv.width = W; cv.height = H;
    makePainter(W, H, P, opts)(cv.getContext("2d"), clamp(Number(t) || 0, 0, P.total));
    return cv;
  }

  window.Reel = {
    caps: caps, plan: plan, duration: duration, loadShots: loadShots,
    render: render, preview: preview, verify: verify, bitrateFor: bitrateFor,
    poster: poster, MOTIONS: ["auto","in","out","pan-r","pan-l","up","down","none"]
  };
})();
