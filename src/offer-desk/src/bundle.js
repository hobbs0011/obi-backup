/* ============================================================================
   THE DROP — THE BUNDLE (src/bundle.js)

   The client's material is read in the client's own browser and never leaves
   it. So the handover — the moment the work goes back to Michael — has to be a
   FILE, made here, on the client's device, that they send with the same button
   they already use for everything else.

   Two things live in this file:

   1. `Bundle.zip` — a real ZIP, written from scratch, STORE method (no
      compression): stills, the contact sheet, the reel, the poster and the
      voice notes are already-compressed bytes, so compressing them again buys
      nothing and costs seconds. A hand-written ZIP also means no dependency, no
      CDN, and no network at all — the page keeps working with the wifi off.

   2. `Bundle.brief` — the brief as markdown: what the desk read, in the trade's
      own language, with the owner's own words quoted and nothing invented. It
      is the first thing Michael reads, and it is deliberately plain text, so it
      can be pasted into a chat, an email, or the station without a converter.

   LAW (README.md → the three laws): a brief carries no number the owner did not
   state, and no asset that was not actually produced here. An empty section is
   written as empty and NAMED, because a false line in a brief is a lie told
   once and paid for later.
   ========================================================================== */
(function(){
"use strict";

/* ------------------------------------------------------------------- crc32 */
const CRC_TABLE = (function(){
  const t = new Uint32Array(256);
  for(let n = 0; n < 256; n++){
    let c = n;
    for(let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes){
  let c = 0xFFFFFFFF;
  for(let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/* --------------------------------------------------------------- zip (store) */
function dosTime(d){
  return ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
}
function dosDate(d){
  return (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
}
function utf8(str){
  return new TextEncoder().encode(str);
}

/* entries: [{ name, data (Uint8Array|string), date? }] → Blob */
function zip(entries){
  const enc = [];
  const central = [];
  let offset = 0;
  const now = new Date();
  (entries || []).forEach(function(e){
    const nameBytes = utf8(String(e.name).replace(/^\/+/, ""));
    const data = (e.data instanceof Uint8Array) ? e.data : (typeof e.data === "string" ? utf8(e.data) : new Uint8Array(e.data || []));
    const crc = crc32(data);
    const d = e.date || now;
    const lh = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);            /* version needed */
    lv.setUint16(6, 0x0800, true);        /* flags: UTF-8 names */
    lv.setUint16(8, 0, true);             /* method: STORE */
    lv.setUint16(10, dosTime(d), true);
    lv.setUint16(12, dosDate(d), true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    lh.set(nameBytes, 30);
    enc.push(lh, data);

    const ch = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime(d), true);
    cv.setUint16(14, dosDate(d), true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    ch.set(nameBytes, 46);
    central.push(ch);

    offset += lh.length + data.length;
  });

  let cdSize = 0;
  central.forEach(function(c){ cdSize += c.length; });
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, central.length, true);
  ev.setUint16(10, central.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob(enc.concat(central, [eocd]), { type:"application/zip" });
}

/* ------------------------------------------------------------------ helpers */
function kb(n){
  if(n < 1024) return n + " B";
  if(n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / 1024 / 1024).toFixed(2) + " MB";
}
function seconds(s){ return (Math.round(s * 100) / 100).toFixed(2) + "s"; }
function download(name, blob){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ try{ a.remove(); URL.revokeObjectURL(url); }catch(e){} }, 4000);
  return url;
}

/* ------------------------------------------------------------------- brief */
/* What the desk read, in words, with the owner's own answers quoted and every
   absence named. `read` is the desk's own measurements — never padded. */
function brief(o){
  o = o || {};
  const T = o.trade || {};
  const L = [];
  const put = function(s){ L.push(s == null ? "" : String(s)); };

  put("# THE DROP — what came back");
  put("");
  put("From: " + (o.who || "(not given)") + "   ·   " + (T.label || "(trade not identified)"));
  put("Taken: " + new Date(o.at || Date.now()).toISOString().replace("T", " ").slice(0, 16) + " UTC");
  put("Read on the sender's own device, in their own browser — nothing was uploaded to make this file.");
  put("");
  put("## The trade, as the desk read it");
  put((T.need ? "What this trade is bought for: " + T.need : "(trade not identified — the desk asks before it builds)"));
  put("");
  if((T.must || []).length){
    put("Found through (the desk's reading, not industry law):");
    T.must.forEach(function(m){ put("- " + m.c + " — " + m.why); });
    put("");
  }
  put("## The page this asks for");
  (T.slots || []).forEach(function(s){ put("- **" + s.name + "** — " + s.why); });
  put("");

  const a = o.answers || {};
  const qs = o.questions || [];
  put("## In their own words");
  if(!qs.length){ put("(no questions were put to them)"); }
  else qs.forEach(function(q){
    const v = (a[q] || "").trim();
    put("**" + q + "**");
    put(v ? v.split("\n").map(function(x){ return "> " + x; }).join("\n") : "> (not answered)");
    put("");
  });

  put("## What they have, and where");
  const links = (o.links || []).filter(function(x){ return x && x.address; });
  if(!links.length){ put("(no links given)"); }
  else links.forEach(function(l){ put("- " + l.address + (l.note ? " — " + l.note : "")); });
  put("");
  if(o.materials && o.materials.length){
    put("## The footage and pictures that came with it");
    o.materials.forEach(function(m){ put("- " + m); });
    put("");
  }

  const r = o.read || {};
  put("## What was measured here (this device, this browser)");
  if(r.stills) put("- stills pulled: " + r.stills);
  if(r.videos) put("- videos read: " + r.videos + (r.skipped && r.skipped.length ? " (" + r.skipped.length + " skipped and named: " + r.skipped.join(", ") + ")" : ""));
  if(r.pulse) put("- " + r.pulse);
  else put("- the pulse was not measured (no video was read)");
  if(r.reel) put("- the reel: " + r.reel);
  else put("- no reel was rendered");
  if(r.why) put("- " + r.why);
  put("");

  put("## What is still missing");
  const missing = (o.missing || []).filter(Boolean);
  put(missing.length ? missing.map(function(m){ return "- " + m; }).join("\n") : "- nothing named");
  put("");
  put("---");
  put("Composed by THE DROP (src/offer-desk/). Every number above was measured on the sender's device; no number was invented, and nothing that was not produced is claimed.");
  return L.join("\n");
}

/* the brief as a chat message — short, so it can be sent without opening a file */
function ping(o){
  o = o || {};
  const T = o.trade || {};
  const a = o.answers || {};
  const qs = (o.questions || []).slice(0, 2);
  const lines = [];
  lines.push("THE DROP — " + (o.who || "a new one") + " · " + (T.label || "trade not identified"));
  if(qs.length) qs.forEach(function(q){
    const v = (a[q] || "").trim();
    if(v) lines.push("• " + v.split("\n")[0].slice(0, 120));
  });
  const r = o.read || {};
  lines.push([r.stills ? r.stills + " stills" : null, r.reel ? "reel " + r.reel : "no reel", ((o.links || []).length + " link(s)")].filter(Boolean).join(" · "));
  return lines.join("\n");
}

window.Bundle = { zip: zip, brief: brief, ping: ping, crc32: crc32, kb: kb, seconds: seconds, download: download };
})();
