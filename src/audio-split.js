/* ============================================================================
   OBI — THE AUDIO WORKBENCH  (src/audio-split.js)

   Makes LONG class recordings transcribable. A two-hour lesson is often a
   1-3 GB video file, which neither Deepgram's 2 GB cap nor its 10-minute
   synchronous processing ceiling will take as-is. This module pulls the AUDIO
   out of any media file, drops it to 16 kHz mono (which is exactly what a
   speech model wants — ~115 MB per hour instead of gigabytes), and cuts it
   into parts at points of SILENCE so a part boundary never lands mid-word.

   Then src/transcribe.js sends the parts one at a time and stitches the
   timestamps back together, so a 3-hour recording is transcribed in a few
   minutes, with progress, retries, and no single point of failure.

   Decoders, best first (all client-side; nothing is uploaded but the audio):
     WAV / RF64-ish PCM  — parsed here byte-by-byte, streamed in blocks.
     MP4 / M4A / MOV     — mp4box.js (demux) + WebCodecs AudioDecoder, streaming,
                           so a multi-GB file never sits in memory: only the
                           audio track is decoded and only the 16 kHz PCM is kept.
     anything else       — the browser's own decoder (decodeAudioData), which
                           needs the whole file in memory, so it is size-guarded.

   Nothing here talks to the network. window.ObiAudioSplit is the API.
   ========================================================================== */
(function(){
"use strict";

const DST_RATE   = 16000;             // speech model rate; 115 MB per hour mono
const RMS_FRAME  = 320;               // 20 ms frame for the silence map
const PCM_BLOCK  = DST_RATE * 30;     // 30 s blocks of Int16
const COPY_STEP  = 8 * 1024 * 1024;   // mp4 demux read step
const OUT_BLOCK  = DST_RATE * 10;     // 10 s of Int16 handed to the store at a time

/* ------------------------------ PCM store --------------------------------- */
/* Holds the whole recording as 16 kHz mono Int16 in blocks, plus a 20 ms RMS
   envelope (the silence map used to choose cut points). */

function store(){
  return { blocks: [], buf: null, bufLen: 0, total: 0, rms: [], rmsN: 0, accN: 0, sumsq: 0 };
}
function storePush(st, arr){
  if(!arr || !arr.length) return;
  let sumsq = st.sumsq, accN = st.accN, rmsN = st.rmsN, rms = st.rms;
  for(let i = 0; i < arr.length; i++){
    const v = arr[i] / 32768;
    sumsq += v * v; accN++;
    if(accN >= RMS_FRAME){
      rms.push(Math.sqrt(sumsq / RMS_FRAME)); rmsN++;
      sumsq = 0; accN = 0;
    }
  }
  st.sumsq = sumsq; st.accN = accN; st.rmsN = rmsN;
  let off = 0;
  while(off < arr.length){
    if(!st.buf){ st.buf = new Int16Array(PCM_BLOCK); st.bufLen = 0; }
    const n = Math.min(PCM_BLOCK - st.bufLen, arr.length - off);
    st.buf.set(arr.subarray(off, off + n), st.bufLen);
    st.bufLen += n; off += n; st.total += n;
    if(st.bufLen === PCM_BLOCK){ st.blocks.push(st.buf); st.buf = null; st.bufLen = 0; }
  }
}
function storeSeal(st){
  if(st.buf && st.bufLen){ st.blocks.push(st.buf); st.buf = null; st.bufLen = 0; }
  return st;
}
function storeSlice(st, a, b){
  a = Math.max(0, Math.floor(a)); b = Math.min(st.total, Math.floor(b));
  const out = new Int16Array(Math.max(0, b - a));
  let w = 0, base = 0;
  for(const blk of st.blocks){
    const blkEnd = base + blk.length;
    if(blkEnd > a && base < b){
      const s = Math.max(a, base), e = Math.min(b, blkEnd);
      out.set(blk.subarray(s - base, e - base), w);
      w += e - s;
    }
    base = blkEnd;
    if(base >= b) break;
  }
  return out;
}
function storeRmsAt(st, frame){
  const r = st.rms[frame];
  return (r == null) ? 0 : r;
}
function storeRmsCount(st){ return st.rmsN; }
function storeBuffers(st){ return st.blocks.length + (st.buf ? 1 : 0); }

/* ------------------------------ resampler --------------------------------- */
/* Stateful: box low-pass of width ~= the downsample ratio, then linear
   interpolation onto the 16 kHz grid. Accepts arbitrary-length input. */

function resampler(srcRate, onBlock){
  const ratio = srcRate / DST_RATE;
  const K = Math.max(1, Math.round(ratio));
  const win = new Float64Array(K);
  let wi = 0, wsum = 0, wn = 0;
  let idx = -1;
  const ys = [];
  let ysBase = 0;
  let pos = 0;
  let outBuf = new Int16Array(OUT_BLOCK), outLen = 0;
  function flush(){
    if(!outLen) return;
    onBlock(outBuf.slice(0, outLen));
    outBuf = new Int16Array(OUT_BLOCK); outLen = 0;
  }
  function emit(v){
    if(v > 1) v = 1; else if(v < -1) v = -1;
    outBuf[outLen++] = v < 0 ? v * 32768 : v * 32767;
    if(outLen === OUT_BLOCK) flush();
  }
  function push(sample){
    idx++;
    if(wn >= K) wsum -= win[wi];
    win[wi] = sample; wsum += sample; wi = (wi + 1) % K; wn++;
    const y = wsum / Math.min(wn, K);
    ys.push(y);
    /* emit every 16 kHz sample whose interpolating pair is available */
    for(;;){
      const i0 = Math.floor(pos);
      const need = i0 + 1 - ysBase;
      if(need >= ys.length) break;
      const a = ys[i0 - ysBase], b = ys[i0 + 1 - ysBase];
      emit(a + (b - a) * (pos - i0));
      pos += ratio;
    }
    const keep = Math.floor(pos) - ysBase - 8;
    if(keep > 4096){ ys.splice(0, keep); ysBase += keep; }
  }
  return { push, done(){ flush(); return outLen; } };
}

/* ------------------------------ container sniff ---------------------------- */

const MP4_EXT = /\.(mp4|m4v|m4a|m4b|mov|qt|3gp|3g2|f4v|ismv|isma)$/i;
const WAV_EXT = /\.(wav|wave|bwf)$/i;

async function sniff(file){
  let head = new Uint8Array(0);
  try{ head = new Uint8Array(await file.slice(0, 65536).arrayBuffer()); }catch(e){}
  const tag = (o, n) => { let s = ""; for(let i = 0; i < n; i++) s += String.fromCharCode(head[o + i] || 0); return s; };
  if(tag(0, 4) === "RIFF" && tag(8, 4) === "WAVE") return "wav";
  if(tag(0, 4) === "RF64" && tag(8, 4) === "WAVE") return "wav";
  if(tag(4, 4) === "ftyp" || tag(4, 4) === "moov" || tag(4, 4) === "wide" || tag(4, 4) === "free") return "mp4";
  const name = String(file.name || "");
  if(WAV_EXT.test(name)) return "wav";
  if(MP4_EXT.test(name)) return "mp4";
  if(tag(0, 4) === "OggS") return "webaudio";
  if(tag(0, 4) === "fLaC") return "webaudio";
  if(head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) return "webaudio"; // mkv/webm
  if(tag(0, 3) === "ID3" || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0)) return "webaudio"; // mp3
  return "webaudio";
}

/* ------------------------------ WAV decoder -------------------------------- */

function readStr(bytes, o, n){ let s = ""; for(let i = 0; i < n; i++) s += String.fromCharCode(bytes[o + i] || 0); return s; }

async function wavInfo(file){
  /* Walk the RIFF chunk table (headers only) to find fmt + data. */
  let off = 12, fmt = null, data = null, guard = 0;
  while(off + 8 <= file.size && guard++ < 400){
    const hdr = new Uint8Array(await file.slice(off, off + 8).arrayBuffer());
    if(hdr.length < 8) break;
    const id = readStr(hdr, 0, 4);
    const size = hdr[4] | (hdr[5] << 8) | (hdr[6] << 16) | (hdr[7] << 24);
    if(id === "fmt "){
      const b = new Uint8Array(await file.slice(off + 8, off + 8 + Math.min(size, 64)).arrayBuffer());
      fmt = {
        format: b[0] | (b[1] << 8),
        channels: b[2] | (b[3] << 8),
        rate: b[4] | (b[5] << 8) | (b[6] << 16) | (b[7] << 24),
        bits: b[14] | (b[15] << 8),
        sub: b.length >= 26 ? (b[24] | (b[25] << 8)) : null
      };
    } else if(id === "data"){
      data = { off: off + 8, size: size > 0 ? size : (file.size - off - 8) };
      if(fmt) break;
    }
    off += 8 + size + (size % 2);
  }
  if(!fmt || !data) throw new Error("not a readable WAV (missing fmt/data chunk)");
  let format = fmt.format;
  if(format === 0xfffe && fmt.sub != null) format = fmt.sub;
  if(format !== 1 && format !== 3) throw new Error("WAV is compressed (format " + format + ") — the browser's decoder will try instead");
  if(!fmt.channels || !fmt.rate) throw new Error("WAV header is incomplete");
  return { ...fmt, format, data };
}

async function pcmFromWav(file, ctx){
  const info = await wavInfo(file);
  const bytesPer = Math.max(1, info.bits / 8);
  const frameBytes = bytesPer * info.channels;
  const rs = resampler(info.rate, blk => storePush(ctx.store, blk));
  const totalFrames = Math.floor(info.data.size / frameBytes);
  const stepFrames = Math.max(1, Math.floor(COPY_STEP / frameBytes));
  let done = 0;
  ctx.setStage("DECODING", "reading WAV · " + info.rate + " Hz · " + info.channels + " ch · " + info.bits + "-bit");
  while(done < totalFrames && !ctx.stopped()){
    const n = Math.min(stepFrames, totalFrames - done);
    const buf = new Uint8Array(await file.slice(info.data.off + done * frameBytes, info.data.off + (done + n) * frameBytes).arrayBuffer());
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const usable = Math.floor(buf.byteLength / frameBytes);
    for(let f = 0; f < usable; f++){
      const base = f * frameBytes;
      let mono = 0;
      for(let c = 0; c < info.channels; c++){
        const o = base + c * bytesPer;
        let v = 0;
        if(info.format === 3) v = dv.getFloat32(o, true);
        else if(info.bits === 8) v = (dv.getUint8(o) - 128) / 128;
        else if(info.bits === 16) v = dv.getInt16(o, true) / 32768;
        else if(info.bits === 24){ const lo = dv.getUint16(o, true), hi = dv.getInt8(o + 2); v = ((hi << 16) | lo) / 8388608; }
        else if(info.bits === 32) v = dv.getInt32(o, true) / 2147483648;
        else throw new Error("unsupported WAV bit depth " + info.bits);
        mono += v;
      }
      rs.push(mono / info.channels);
    }
    done += usable;
    ctx.progress(done / totalFrames);
  }
  rs.done();
  storeSeal(ctx.store);
  return { sourceRate: info.rate, channels: info.channels, container: "wav" };
}

/* ------------------------------ MP4 decoder -------------------------------- */
/* mp4box.js demuxes (streamed in 8 MB steps from the File, so memory stays
   flat), WebCodecs AudioDecoder decodes the audio track only. */

function esdsDescription(entry){
  /* The AudioSpecificConfig lives at ESDS → DecoderConfigDescriptor(0x04) →
     DecoderSpecificInfo(0x05). Parse the payload by hand so it does not depend
     on how a given mp4box build models descriptor nodes. */
  const payload = entry && entry.esds && entry.esds.data;
  if(payload && payload.length){
    try{
      let o = (payload[0] === 0x03) ? 0 : 4;   // some builds keep the fullbox version/flags
      const readTag = () => {
        const tag = payload[o++];
        let size = 0;
        for(let i = 0; i < 4; i++){ const b = payload[o++]; size = (size << 7) | (b & 0x7f); if(!(b & 0x80)) break; }
        return { tag, size };
      };
      const es = readTag();
      if(es.tag === 0x03){
        o += 2;
        const flags = payload[o++];
        if(flags & 0x80) o += 2;
        if(flags & 0x40){ o += 1; o += payload[o]; }
        if(flags & 0x20) o += 2;
        const dc = readTag();
        if(dc.tag === 0x04){
          o += 13;
          const ds = readTag();
          if(ds.tag === 0x05) return payload.slice(o, o + ds.size);
        }
      }
    }catch(e){}
  }
  /* fallback: walk mp4box's descriptor tree */
  try{
    const descs = entry.esds.esd.descs || [];
    const dc = descs.filter(d => d.tag === 0x04)[0];
    const ds = dc && (dc.descs || []).filter(d => d.tag === 0x05)[0];
    if(ds && ds.data) return (ds.data instanceof Uint8Array) ? ds.data : new Uint8Array(ds.data);
  }catch(e){}
  return null;
}

async function mp4Pcm(file, ctx){
  if(typeof AudioDecoder === "undefined") throw new Error("WebCodecs AudioDecoder unavailable — the browser decoder will try instead");
  const mod = await import("https://esm.sh/mp4box@0.5.2");
  const MP4Box = mod.createFile ? mod : (mod.default || mod);
  const createFile = MP4Box.createFile || (MP4Box.default && MP4Box.default.createFile);
  if(!createFile) throw new Error("mp4box did not load");

  const mp4 = createFile();
  let info = null, desc = null, dec = null, rate = 48000, channels = 1, trackId = 0;
  let srcPcm = [];        // mono float blocks awaiting the resampler
  let srcLen = 0;
  let frames = 0;
  let rs = null;          // built only once the track's REAL sample rate is known
  let readyErr = null, readyDone = false;

  const drain = async force => {
    if(!rs || (!force && srcLen < 48000) || !srcLen) return;
    const joined = new Float32Array(srcLen);
    let o = 0;
    for(const b of srcPcm){ joined.set(b, o); o += b.length; }
    srcPcm = []; srcLen = 0;
    for(let i = 0; i < joined.length; i++) rs.push(joined[i]);
    await new Promise(r => setTimeout(r, 0));
  };

  const ready = new Promise((resolve, reject) => {
    mp4.onReady = i => {
      const t = (i.audioTracks || [])[0];
      if(!t) return reject(new Error("no audio track in this file"));
      info = i;
      rate = (t.audio && t.audio.sample_rate) || 48000;
      channels = (t.audio && t.audio.channel_count) || 1;
      trackId = t.id;
      /* The resampler must use the track's real rate. Assuming 48 kHz stretches
         (or squashes) the whole timeline — a 44.1 kHz phone video landed 8% off,
         which puts every timestamp in the transcript in the wrong place. */
      if(!rs) rs = resampler(rate, blk => storePush(ctx.store, blk));
      try{
        const entry = mp4.getTrackById(t.id).mdia.minf.stbl.stsd.entries[0];
        desc = esdsDescription(entry);
      }catch(e){ desc = null; }
      dec = new AudioDecoder({
        output: d => {
          try{
            const n = d.numberOfFrames, ch = d.numberOfChannels;
            const plane = new Float32Array(n);
            const mono = new Float32Array(n);
            for(let c = 0; c < ch; c++){
              try{ d.copyTo(plane, { planeIndex: c, format: "f32-planar" }); }catch(e){ plane.fill(0); }
              for(let i = 0; i < n; i++) mono[i] += plane[i] / ch;
            }
            srcPcm.push(mono); srcLen += n; frames += n;
          }catch(e){} finally { try{ d.close(); }catch(e){} }
        },
        error: e => { if(!ctx.failed) ctx.failed = String(e && e.message || e); }
      });
      const cfg = { codec: t.codec || "mp4a.40.2", sampleRate: rate, numberOfChannels: channels };
      if(desc) cfg.description = desc;
      let configured = false;
      try{ dec.configure(cfg); configured = true; }
      catch(e){
        try{ dec.configure({ codec: t.codec || "mp4a.40.2", sampleRate: rate, numberOfChannels: channels }); configured = true; }catch(e2){}
      }
      if(!configured) return reject(new Error("AudioDecoder would not accept this audio track (" + (t.codec || "?") + ")"));
      mp4.setExtractionOptions(t.id, null, { nbSamples: 512 });
      mp4.start();
      resolve();
    };
    mp4.onError = e => reject(new Error("mp4box: " + e));
  });
  ready.then(() => { readyDone = true; }, e => { readyDone = true; readyErr = e; });

  mp4.onSamples = (id, user, ss) => {
    for(const s of ss){
      try{
        dec.decode(new EncodedAudioChunk({
          type: "key",
          timestamp: Math.round((s.cts / s.timescale) * 1e6),
          duration: Math.round((s.duration / s.timescale) * 1e6),
          data: new Uint8Array(s.data)
        }));
      }catch(e){ ctx.failed = ctx.failed || String(e.message || e); }
    }
    /* hand decoded chunks their own copy above, then let mp4box drop the bytes it
       has already given us — otherwise a multi-GB video accumulates in memory */
    try{
      const last = ss[ss.length - 1];
      if(last && typeof mp4.releaseUsedSamples === "function") mp4.releaseUsedSamples(id, last.number);
    }catch(e){}
  };

  let off = 0, announced = false;
  ctx.setStage("DECODING", "opening MP4 container…");
  while(off < file.size && !ctx.stopped() && !readyErr){
    const end = Math.min(file.size, off + COPY_STEP);
    const ab = await file.slice(off, end).arrayBuffer();
    ab.fileStart = off;
    mp4.appendBuffer(ab);
    off = end;
    if(readyDone && !announced){
      announced = true;
      ctx.setStage("DECODING", "pulling the audio track · " + rate + " Hz · " + channels + " ch");
    }
    await drain(false);
    /* let the decoder catch up so decoded PCM can't pile up */
    while(dec && dec.decodeQueueSize > 96 && !ctx.stopped()) await new Promise(r => setTimeout(r, 8));
    ctx.progress(file.size ? off / file.size : 1);
  }
  try{ mp4.flush(); }catch(e){}
  if(!readyDone){
    /* moov can sit at the END of the file (most phone/camera videos do), so the
       sample tables only appear once everything has been appended — wait for them
       here rather than inside the append loop, where it would deadlock, but never
       wait forever on a file that simply has no readable header. */
    await Promise.race([
      ready,
      new Promise((_, rej) => setTimeout(() => rej(new Error("no readable MP4 header (moov box missing or the file is truncated)")), 6000))
    ]);
  } else if(readyErr){
    throw readyErr;
  }
  if(ctx.stopped()) throw Object.assign(new Error("cancelled"), { cancelled: true });
  if(dec){ try{ await dec.flush(); }catch(e){} }
  await drain(true);
  if(rs) rs.done();
  storeSeal(ctx.store);
  if(ctx.failed) throw new Error("audio decode: " + ctx.failed);
  if(!frames) throw new Error("no audio frames decoded");
  return { sourceRate: rate, channels, container: "mp4", decodedFrames: frames };
}

/* --------------------------- browser decoder ------------------------------- */

async function webaudioPcm(file, ctx){
  const durationHint = ctx.durationHint || 0;
  const est = durationHint ? durationHint * 48000 * 2 * 4 : file.size * 8;
  if(est > 1.6e9) throw new Error("this container needs the browser decoder, which holds the whole recording in memory — " +
    (Math.round(est / 1e6) + " MB estimated").toString() + ". Split it to audio first (mp3/m4a) or use a different copy.");
  ctx.setStage("DECODING", "handing the file to the browser's audio decoder…");
  const raw = await file.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) throw new Error("no WebAudio in this browser");
  const ac = new AC();
  let buf = null;
  try{
    buf = await new Promise((resolve, reject) => {
      const p = ac.decodeAudioData(raw, resolve, reject);
      if(p && p.then) p.then(resolve, reject);
    });
  }catch(e){
    try{ ac.close(); }catch(x){}
    throw new Error("the browser could not decode this container");
  }
  try{ ac.close(); }catch(e){}
  const ch = buf.numberOfChannels, rate = buf.sampleRate, n = buf.length;
  ctx.setStage("DECODING", "decoded " + rate + " Hz · " + ch + " ch — downsampling to 16 kHz mono…");
  const rs = resampler(rate, blk => storePush(ctx.store, blk));
  const planes = [];
  for(let c = 0; c < ch; c++) planes.push(buf.getChannelData(c));
  const step = 48000 * 5;
  for(let s = 0; s < n; s += step){
    if(ctx.stopped()) break;
    const e = Math.min(n, s + step);
    const mono = new Float32Array(e - s);
    for(let c = 0; c < ch; c++){
      const p = planes[c];
      for(let i = s; i < e; i++) mono[i - s] += p[i] / ch;
    }
    for(let i = 0; i < mono.length; i++) rs.push(mono[i]);
    ctx.progress(s / n);
    await new Promise(r => setTimeout(r, 0));
  }
  rs.done();
  storeSeal(ctx.store);
  return { sourceRate: rate, channels: ch, container: "webaudio" };
}

/* ------------------------------ cutting in silence ------------------------- */

function snapCut(st, targetSample){
  /* Look for the quietest 20 ms frame within +/- 25 s of the target, then move
     to the middle of that pause, so a part boundary lands between words rather
     than in one. */
  const frame = Math.round(targetSample / RMS_FRAME);
  const nFrames = storeRmsCount(st);
  if(!nFrames) return targetSample;
  const win = Math.round(25 * DST_RATE / RMS_FRAME);
  const lo = Math.max(1, frame - win), hi = Math.min(nFrames - 2, frame + win);
  if(hi <= lo) return targetSample;
  let best = -1, bestScore = Infinity, avg = 0, cnt = 0;
  for(let f = lo; f <= hi; f++){
    const v = storeRmsAt(st, f);
    avg += v; cnt++;
    const bias = 1 + Math.abs(f - frame) / (win * 3); // gently prefer near the target
    /* the audible test dominates, but the tiny distance term breaks ties between
       equally quiet frames — without it a row of silent frames all score 0 and the
       FIRST one (up to 25 s early) wins, quietly shrinking every part */
    const score = v * bias + (Math.abs(f - frame) / Math.max(1, win)) * 1e-6;
    if(score < bestScore){ bestScore = score; best = f; }
  }
  avg = cnt ? avg / cnt : 0;
  if(best < 0) return targetSample;
  const q = storeRmsAt(st, best);
  if(q > avg * 0.75) return targetSample;   // nothing clearly quiet — plain cut
  const thr = Math.max(q * 1.5, avg * 0.12); // "quiet enough" to be the same pause
  let a = best, b = best;
  while(a > lo && storeRmsAt(st, a - 1) <= thr) a--;
  while(b < hi && storeRmsAt(st, b + 1) <= thr) b++;
  return Math.round(((a + b) / 2)) * RMS_FRAME;
}

function planParts(st, opts){
  const chunkSec = Math.max(60, Number(opts.chunkSec) || 1200);
  const total = st.total;
  const chunkSamples = Math.round(chunkSec * DST_RATE);
  const minTail = Math.round(DST_RATE * 20);
  const floorSample = Math.round(Math.min(DST_RATE * 60, chunkSamples * 0.6));
  const cuts = [0];
  let start = 0;
  while(total - start > chunkSamples + minTail){
    const target = start + chunkSamples;
    let cut = opts.snap === false ? target : snapCut(st, target);
    if(cut <= start + floorSample || cut >= total) cut = target;  // never produce a stub part
    cuts.push(cut);
    start = cut;
  }
  cuts.push(total);
  const parts = [];
  for(let i = 0; i < cuts.length - 1; i++){
    parts.push({
      index: i,
      startSample: cuts[i],
      endSample: cuts[i + 1],
      start: cuts[i] / DST_RATE,
      end: cuts[i + 1] / DST_RATE
    });
  }
  return parts;
}

function wavBlob(int16){
  const n = int16.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const dv = new DataView(buf);
  const str = (o, s) => { for(let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); dv.setUint32(4, 36 + n * 2, true); str(8, "WAVE");
  str(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, DST_RATE, true); dv.setUint32(28, DST_RATE * 2, true);
  dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  str(36, "data"); dv.setUint32(40, n * 2, true);
  new Int16Array(buf, 44, n).set(int16);
  return new Blob([buf], { type: "audio/wav" });
}

/* ------------------------------ public API --------------------------------- */

function caps(){
  return {
    webcodecs: typeof AudioDecoder !== "undefined",
    webaudio: !!(window.AudioContext || window.webkitAudioContext)
  };
}

async function prepare(file, opts){
  opts = opts || {};
  const ctx = { store: store(), cancelled: false, failed: null, durationHint: opts.durationHint || 0 };
  ctx.stopped = () => !!(opts.signal && opts.signal.cancelled) || ctx.cancelled;
  ctx.setStage = (stage, note) => { try{ opts.onStage && opts.onStage(stage, note); }catch(e){} };
  ctx.progress = p => { try{ opts.onProgress && opts.onProgress(Math.max(0, Math.min(1, p))); }catch(e){} };

  if(!file || !file.size) throw new Error("the file is empty — there is nothing to listen to");

  const kind = await sniff(file);
  let used = null, tried = [];
  const runners = [];
  if(kind === "wav") runners.push(["wav", () => pcmFromWav(file, ctx)]);
  if(kind === "mp4") runners.push(["mp4", () => mp4Pcm(file, ctx)]);
  runners.push(["webaudio", () => webaudioPcm(file, ctx)]);

  for(const [name, fn] of runners){
    if(ctx.stopped()) throw Object.assign(new Error("cancelled"), { cancelled: true });
    try{
      const res = await fn();
      used = Object.assign({ mode: name }, res);
      break;
    }catch(e){
      if(e && (e.cancelled || /cancel/i.test(e.message || ""))) throw Object.assign(new Error("cancelled"), { cancelled: true });
      tried.push(name + ": " + (e && e.message || e));
      ctx.store = store();   // start clean for the next decoder
      ctx.failed = null;
    }
  }
  if(!used) throw new Error("could not get audio out of this file — " + tried.join(" · "));
  if(!ctx.store.total) throw new Error("no audio samples were produced — is there a sound track in this file?");

  const parts = planParts(ctx.store, opts);
  return {
    store: ctx.store,
    mode: used.mode,
    sourceRate: used.sourceRate,
    channels: used.channels,
    container: used.container,
    duration: ctx.store.total / DST_RATE,
    sampleRate: DST_RATE,
    chunkSec: Math.max(60, Number(opts.chunkSec) || 1200),
    snapped: opts.snap !== false,
    parts,
    notes: tried
  };
}

function partBlob(plan, index){
  const p = plan.parts[index];
  if(!p) throw new Error("no such part " + index);
  return wavBlob(storeSlice(plan.store, p.startSample, p.endSample));
}

window.ObiAudioSplit = {
  prepare, partBlob, caps, sniff,
  store: { slice: storeSlice, rmsCount: storeRmsCount, buffers: storeBuffers },
  planParts, wavBlob, storeSlice, storeRmsAt
};
})();
