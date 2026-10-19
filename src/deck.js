/* ============================================================================
   OBI — THE DECK READER  (src/deck.js)
   Plug-and-play intake for the 📚 Lesson Creator: drop a slide-deck PDF and
   the Build room's brief (topic + sovereign's notes) fills itself.

   WHAT IT DOES
     extractPdf(file)  — PDF → per-page text, IN THIS BROWSER. The file is
                         never uploaded anywhere; parsing runs locally via
                         pdf.js (CDN, pinned). Scanned/image-only pages come
                         back empty — those decks need a transcript, not this.
     briefFromPdf(name, extracted) — filename + page texts → { topic, notes }.
                         Notes are clipped to fit the staged build (the brief
                         rides along on every one of the 7 model calls, so a
                         20-page deck goes in as its words, not its weight).

   WHO CALLS IT
     src/lessons.js — the ✍ Build room's "📎 From deck (PDF)" picker calls
     ObiDeck.extractPdf + briefFromPdf, then fills desk.topic / desk.notes.
     Nothing else depends on it; if the CDN is unreachable the picker says
     so and the hand-typed brief still works.
   ========================================================================== */
(function(){
"use strict";

/* Pinned. Proven in the preview 2026-10-16 (getDocument present, 20-page
   Grade-5 deck extracted page-clean). Bump only after re-proving. */
var PDFJS_URL = "https://esm.sh/pdfjs-dist@4.4.168/legacy/build/pdf.mjs";
var WORKER_URL = "https://esm.sh/pdfjs-dist@4.4.168/legacy/build/pdf.worker.mjs";

var pdfjsPromise = null;
function pdfjs(){
  if(pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = import(PDFJS_URL).then(function(m){
    try{
      if(m && m.GlobalWorkerOptions) m.GlobalWorkerOptions.workerSrc = WORKER_URL;
    }catch(e){}
    return m;
  }).catch(function(e){
    pdfjsPromise = null;
    throw new Error("the PDF engine (pdf.js CDN) did not load — check connection and try again");
  });
  return pdfjsPromise;
}

function pageText(items, perPageChars){
  var t = "";
  for(var i = 0; i < items.length; i++){
    var s = items[i] && items[i].str != null ? String(items[i].str) : "";
    if(!s) continue;
    t += (t && !/\s$/.test(t) ? " " : "") + s;
    if(t.length >= perPageChars) break;
  }
  return t.replace(/\s+/g, " ").trim().slice(0, perPageChars);
}

/* source: File | Blob | ArrayBuffer | Uint8Array.
   Returns { pages:[{n,text}], text, pageCount, emptyPages, ms }. */
async function extractPdf(source, opts){
  opts = opts || {};
  var maxPages = Math.max(1, Math.min(60, Number(opts.maxPages) || 40));
  var perPageChars = Math.max(200, Math.min(3000, Number(opts.perPageChars) || 1200));
  var t0 = Date.now();
  var lib = await pdfjs();
  var data = null;
  if(source instanceof Uint8Array) data = source;
  else if(source instanceof ArrayBuffer) data = new Uint8Array(source);
  else if(source && typeof source.arrayBuffer === "function") data = new Uint8Array(await source.arrayBuffer());
  else throw new Error("that is not a file I can read");
  if(!data || !data.length) throw new Error("that file is empty");
  var pdf = await lib.getDocument({ data: data }).promise;
  var n = Math.min(pdf.numPages, maxPages);
  var pages = [], empty = 0;
  for(var p = 1; p <= n; p++){
    var pg = await pdf.getPage(p);
    var tc = await pg.getTextContent();
    var t = pageText(tc.items || [], perPageChars);
    if(!t) empty++;
    pages.push({ n:p, text:t });
    try{ if(pg.cleanup) pg.cleanup(); }catch(e){}
  }
  try{ if(pdf.destroy) await pdf.destroy(); }catch(e){}
  return {
    pages: pages,
    text: pages.filter(function(pg){ return pg.text; }).map(function(pg){ return "[p" + pg.n + "] " + pg.text; }).join("\n"),
    pageCount: pdf.numPages,
    pagesRead: n,
    emptyPages: empty,
    truncated: pdf.numPages > n,
    ms: Date.now() - t0
  };
}

/* "Grade_5_Unit_3_Lesson_2.pdf" → "Grade 5 Unit 3 Lesson 2" */
function topicFromName(name){
  var t = String(name || "").replace(/\.[a-z0-9]+$/i, "").replace(/[_\-\.]+/g, " ").replace(/\s+/g, " ").trim();
  return t || "Untitled deck";
}

/* The brief that fills ✍ Build: topic from the filename, notes as the deck's
   own words, clipped so the staged build (7 calls, brief on every call) stays
   lean. Full page text is NOT kept — the notes field is the record. */
function briefFromPdf(name, extracted, opts){
  opts = opts || {};
  var budget = Math.max(500, Math.min(6000, Number(opts.notesBudget) || 3000));
  var head = "Slide deck «" + topicFromName(name) + "» (" + extracted.pageCount + " page(s)"
    + (extracted.emptyPages ? ", " + extracted.emptyPages + " without selectable text" : "") + "). Its own words:\n";
  var room = Math.max(200, budget - head.length);
  var body = String(extracted.text || "");
  var clipped = body.length > room;
  if(clipped) body = body.slice(0, room).replace(/\s+\S*$/, "") + "\n…(clipped to fit the build — the full deck stays in your file)";
  return { topic: topicFromName(name), notes: head + body, clipped: clipped, pages: extracted.pageCount };
}

window.ObiDeck = {
  extractPdf: extractPdf,
  briefFromPdf: briefFromPdf,
  topicFromName: topicFromName,
  PDFJS_URL: PDFJS_URL
};
})();
