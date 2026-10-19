/* ============================================================================
   THE RUBRIC — the instrument the word "evaluator" means (src/rubric.js).

   What was missing: this station could record a lesson, summarise it and write a
   review — all of it prose. Prose cannot be audited, cannot be compared across
   terms, and cannot be re-checked a year later. A rubric can. The estate's own
   inventory has carried `ana.rubric` as MISSING since the day it was written, with
   the note "the word 'evaluator' means this. Everything else either feeds it or
   reports it." This file is that row, built.

   THE LAW — enforced HERE, in code, never asked of the model:
     1. NO CITATION, NO SCORE. A band with no verbatim span from the record is not
        a score. It is NOT SCORED, excluded from the total, and listed in the
        omission audit.
     2. THE MACHINE VERIFIES EVERY CITATION. A quote the engine cannot find in the
        raw record is REFUSED and never counted — however plausible it reads.
     3. THE MACHINE DERIVES THE TIMESTAMP. The model is never asked for one: a
        model that can invent a quote can invent a clock. The engine searches the
        transcript's own utterance map and reads the time off the record.
     4. ARITHMETIC BEATS OPINION. Where the record supports a number — words, wpm,
        pauses, duration, parts, dates, speakers — the band is COMPUTED and the
        model's band is kept as DISSENT, printed and not used.
     5. COVERAGE TRAVELS WITH EVERY TOTAL. "41 of 48" without "over 6 of 8
        criteria" is not a score, it is a partial reading of a child.
     6. THRESHOLDS ARE STATED, NOT UNIVERSAL. Every computed band prints the
        thresholds it used, so a disagreement can be had with the threshold and not
        with the engine.
     7. A SCORECARD IS APPEND-ONLY. Re-scoring writes a NEW run and marks the old
        one superseded. Nothing is ever rewritten — the record's life obeys the
        record's law (annotate, never rewrite).
     8. A PARTIAL RECORD SCORES ONLY WHAT IT HOLDS, and says what is missing.

   HOW EACH CRITERION IS ESTABLISHED — printed for every single one:
     COMPUTED    arithmetic on the raw record. Strongest: nobody judged it.
     CITED       a verbatim span the engine located itself, with its source and its
                 timestamp read off the record.
     REFUSED     the model gave a quote the record does not contain. Printed as the
                 refusal it is, with the model's own span shown beside the record.
     NOT SCORED  no verified ground. Fail closed. An error nobody found is not the
                 same as no error, so absence is never scored.
     CONTEXT     a reading of the EVIDENCE (how much there is, how sound it is).
                 Printed, used by the gate, and EXCLUDED from the composite — a
                 rubric must not pay a student for the quality of the recording.

   Every stored run carries the rubric's version and sha-256, the record digest, and
   can be re-verified against the live record at any time (/rubric verify).
   ========================================================================== */
(function(){
  const VERSION = "1.0.0";
  const KV_FOLDER = "rubrics";
  const RAW_BUDGET = 60000;        /* chars of raw record handed to the model      */
  const MIN_QUOTE_WORDS = 4;       /* below this a "quote" proves nothing          */

  /* THE LAW — printed by /rubric, enforced in the code below, never asked of the
     model. If a reading of this file ever disagrees with this list, the list wins. */
  const LAW = [
    "NO CITATION, NO SCORE — a band with no verbatim span from the record is NOT SCORED, excluded from the total and listed in the omission audit.",
    "THE MACHINE VERIFIES EVERY CITATION — a quote the engine cannot find in the raw record is REFUSED and never counted, however plausible it reads.",
    "THE MACHINE READS THE CLOCK — the model is never asked for a timestamp; the engine finds the span in the transcript's own utterance map and reads the time off the record.",
    "ARITHMETIC BEATS OPINION — where the record supports a number (words, wpm, pauses, duration, parts, dates, speakers) the band is COMPUTED and the model's band is kept as recorded DISSENT.",
    "COVERAGE TRAVELS WITH EVERY TOTAL — a total over 3 of 8 criteria is a partial reading and is printed as one.",
    "THRESHOLDS ARE STATED, NOT UNIVERSAL — every computed band prints the thresholds it used, so the argument can be had with the threshold instead of with the engine.",
    "A SCORECARD IS APPEND-ONLY — re-scoring writes a new run and annotates the old one as superseded; nothing is ever rewritten.",
    "A PARTIAL RECORD SCORES ONLY WHAT IT HOLDS and says what is missing — an error nobody found is not the same as no error."
  ];

  /* ------------------------------------------------------------------ basics */
  function e(s){ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }
  function bubble(html){ try{ return addBubble("ass", html); }catch(err){ return null; } }
  function row(k, v, d){ return '<div class="rrow"><b>' + e(k) + '</b><span class="vd">' + (v == null ? "" : v) + '</span>' + (d ? '<div class="rd">' + d + '</div>' : '') + '</div>'; }
  function box(title, body, foot){ return bubble('<div class="rise"><div class="rhead">' + title + '</div>' + body + (foot ? '<div class="rfoot">' + foot + '</div>' : '') + '</div>'); }
  function pre(t){ return '<pre style="white-space:pre-wrap;font:12px/1.5 ui-monospace,Menlo,monospace;text-align:left;margin:6px 0;max-height:280px;overflow:auto">' + e(t) + '</pre>'; }
  function folder(){ try{ return root.kv[KV_FOLDER]; }catch(err){ return null; } }
  function clip(s, n){ s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) : s; }
  function slug(s){ return String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function fmtDate(t){ try{ return new Date(t).toLocaleDateString(); }catch(err){ return "?"; } }
  function fmtDur(sec){ sec = Number(sec) || 0; const m = Math.floor(sec / 60), s = Math.floor(sec % 60); return m + ":" + String(s).padStart(2, "0"); }
  function nowId(p){ return p + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); }
  const enc = new TextEncoder();
  function hex(buf){ return Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, "0")).join(""); }
  async function sha256(text){ return hex(await crypto.subtle.digest("SHA-256", enc.encode(String(text)))); }

  /* normalisation, so a quote is checked on its WORDS and not on an ASR's
     comma placement. Two strengths are reported: STRICT (whitespace and case
     only) and LENIENT (punctuation ignored, word order must still hold). */
  function norm(s){
    return String(s == null ? "" : s).toLowerCase()
      .replace(/[\u2018\u2019\u201b\u2032]/g, "'").replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2010-\u2015]/g, "-").replace(/\s+/g, " ").trim();
  }
  function wordsOnly(s){ return norm(s).replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim(); }
  function wordCount(s){ const w = wordsOnly(s); return w ? w.split(" ").length : 0; }

  /* --------------------------------------------------------------- the bands
     One shape everywhere: bands ascend, ordinal 1 = weakest. A criterion's band
     scale defines what its number MEANS, and it is never hidden from the reader. */
  function bands(list){ return list.map((b, i) => ({ id: b[0], label: b[1], desc: b[2] || "", ordinal: i + 1 })); }
  const CEFR = bands([
    ["A1", "A1", "can use a few words and memorised phrases about themselves"],
    ["A2", "A2", "can handle short, routine exchanges with support"],
    ["B1", "B1", "can keep going on familiar matters and explain a viewpoint briefly"],
    ["B2", "B2", "can argue a case fluently and adjust register"],
    ["C1", "C1", "can express themselves fluently and precisely, flexibly and effectively"],
    ["C2", "C2", "can express themselves with effortless precision, including nuance"]
  ]);
  const FREQ = bands([
    ["pervasive", "PERVASIVE", "the pattern is present through most of the record"],
    ["very-frequent", "VERY FREQUENT", "present repeatedly and hard to miss"],
    ["frequent", "FREQUENT", "a recurring feature that interferes with meaning"],
    ["occasional", "OCCASIONAL", "present but not intrusive"],
    ["rare", "RARE", "isolated instances"],
    ["none-found", "NONE FOUND", "no verified instance in this record"]
  ]);

  /* ------------------------------------------------------------- the measures
     Arithmetic on the raw record. Each returns { value, display, ordinal, scale }
     and PRINTS its thresholds — a reader may argue with the threshold, which is
     the only honest way to argue with a number. */
  const MEASURES = {
    /* speaking rate: words per minute of actual recording */
    rate(m){
      if(!m.wpm || !m.duration) return null;
      const T = [[50,1],[80,2],[110,3],[140,4],[170,5],[1e9,6]];
      return { value: m.wpm, display: m.wpm + " wpm over " + fmtDur(m.duration), ordinal: T.find(t => m.wpm < t[0])[1],
        scale: "stated thresholds: <50 A1 · <80 A2 · <110 B1 · <140 B2 · <170 C1 · 170+ C2 (a rate proxy, not a CEFR verdict)" };
    },
    /* pausing: pauses longer than 3s per 10 minutes of recording */
    pausing(m){
      if(!m.duration) return null;
      const per10 = m.pauses / (m.duration / 600);
      const T = [[1,6],[3,5],[6,4],[12,3],[20,2],[1e9,1]];
      return { value: Number(per10.toFixed(2)), display: per10.toFixed(1) + " pauses per 10 min (" + m.pauses + " in " + fmtDur(m.duration) + (m.longestPause ? ", longest " + m.longestPause.toFixed(1) + "s" : "") + ")",
        ordinal: T.find(t => per10 < t[0])[1],
        scale: "stated thresholds, pauses >3s per 10 min: <1 A1-free · <3 C2-band · <6 C1 · <12 B2 · <20 B1 · 20+ A2-and-below (inverted: fewer pauses reads better)" };
    },
    /* how much speech the evidence actually holds — CONTEXT, never a pupil's mark */
    volume(m){
      const n = m.words || 0;
      const T = [[150,1],[400,2],[900,3],[1800,4],[3500,5],[1e9,6]];
      return { value: n, display: n.toLocaleString() + " words of speech in the record", ordinal: T.find(t => n < t[0])[1],
        scale: "stated thresholds, words in the evidence: <150 · <400 · <900 · <1800 · <3500 · 3500+" };
    },
    /* how sound the evidence is — CONTEXT */
    evidence(m){
      let pts = 0;
      pts += m.sources >= 1 ? 1 : 0;
      pts += m.sources >= 3 ? 1 : 0;
      pts += m.days >= 7 ? 1 : 0;
      pts += m.days >= 28 ? 1 : 0;
      pts += (m.partsMissing ? 0 : m.transcripts ? 1 : 0);
      pts += m.chars >= 8000 ? 1 : 0;
      pts = Math.max(1, Math.min(6, pts));
      return { value: pts, display: m.sources + " source(s) · " + m.chars.toLocaleString() + " chars · " + (m.days || 0) + " day(s) spanned" + (m.partsMissing ? " · " + m.partsMissing + " part(s) MISSING" : ""),
        ordinal: pts, scale: "stated scoring: 1 point each for a source, 3+ sources, 7+ days, 28+ days, complete parts, 8k+ chars" };
    },
    /* error frequency: this one counts the VERIFIED citations and nothing else */
    errorCount(m, verified){
      const n = verified || 0;
      const per1k = m.words ? (n / m.words) * 1000 : 0;
      const T = [[0.0001,6],[2,5],[5,4],[10,3],[20,2],[1e9,1]];
      return { value: n, display: n + " verified instance(s) in " + (m.words ? m.words.toLocaleString() : "0") + " words (" + per1k.toFixed(1) + " per 1,000)",
        ordinal: T.find(t => per1k < t[0])[1],
        scale: "stated thresholds, instances per 1,000 words: 0 → none found · <2 → rare · <5 → occasional · <10 → frequent · <20 → very frequent · 20+ → pervasive" };
    }
  };

  /* ------------------------------------------------------------ the families
     Four built-ins: two for the pupil (the CEFR lenses the parents and schools
     already speak), one for the lesson, one for the error pattern. Each criterion
     states what it looks for, and every band says what it means. */
  const BUILT = [
    {
      id: "cefr.speaking", name: "CEFR — spoken performance", scale: "CEFR A1–C2", role: "student",
      purpose: "Place one student's spoken performance in this evidence on the CEFR scale, with every band cited.",
      criteria: [
        { id: "fluency.rate", name: "Delivery rate", w: 1, measure: "rate", question: "How much speech per minute does the record actually contain?", bands: CEFR },
        { id: "fluency.pausing", name: "Flow / pausing", w: 1, measure: "pausing", question: "Where does the speaker stop long enough to break the flow?", bands: CEFR },
        { id: "range", name: "Range", w: 1, question: "Does the speaker use varied structures and lexis, or the same two frames? Show it.", bands: CEFR },
        { id: "accuracy", name: "Accuracy", w: 1, question: "How far does grammar and word choice hold up under the demands of the task? Quote the failures, not the impression of them.", bands: CEFR },
        { id: "interaction", name: "Interaction", w: 1, question: "Does the speaker ask, respond, repair, and take turns unprompted?", bands: CEFR },
        { id: "coherence", name: "Coherence", w: 1, question: "Do the turns connect into a sustained answer, or arrive as disconnected fragments?", bands: CEFR },
        { id: "evidence.volume", name: "Evidence — how much speech", w: 1, role: "context", measure: "volume", question: "How much speech is there to judge at all?", bands: CEFR }
      ]
    },
    {
      id: "cefr.writing", name: "CEFR — written performance", scale: "CEFR A1–C2", role: "student",
      purpose: "Place one student's written work on the CEFR scale, quote by quote.",
      criteria: [
        { id: "task", name: "Task achievement", w: 1, question: "Does the piece do what the task asked, completely, or only the easy half?", bands: CEFR },
        { id: "coherence", name: "Coherence and cohesion", w: 1, question: "Do the ideas sequence and link, or pile up?", bands: CEFR },
        { id: "lexis", name: "Lexical resource", w: 1, question: "Is the vocabulary adequate, varied, and used correctly?", bands: CEFR },
        { id: "grammar", name: "Grammatical range and accuracy", w: 1, question: "Is there range beyond the safe construction, and does it hold?", bands: CEFR },
        { id: "register", name: "Register and effect", w: 1, question: "Is the voice right for the reader and the purpose?", bands: CEFR }
      ]
    },
    {
      id: "teach.lesson", name: "The lesson as taught", scale: "6-band practice scale", role: "class",
      purpose: "Judge a lesson from its own record: what was taught, what the learners did, and what the evidence cannot show.",
      criteria: [
        { id: "coverage", name: "Coverage against the plan", w: 1, question: "Which planned material actually appears in the record, and which does not? Name both.", bands: bands([["1","NOT SHOWN","nothing in the record shows it"],["2","TOUCHED","named but not worked"],["3","PARTIAL","worked but left unfinished"],["4","COVERED","worked through as planned"],["5","WORKED","worked through and revisited"],["6","CONSOLIDATED","worked, revisited and checked for learning"]]) },
        { id: "clarity", name: "Clarity of instruction", w: 1, question: "Were instructions and explanations understood, or re-explained? Quote the moment it lands or fails to.", bands: FREQ.slice().reverse().map((b, i) => ({ id: "c" + (i + 1), label: ["CLOUDED","MUDDY","UNEVEN","CLEAR","CRISP","MODEL-LEVEL"][i], desc: b.desc, ordinal: i + 1 })) },
        { id: "output", name: "Learner output", w: 1, question: "How much did the learners themselves produce — speech, answers, work — rather than receive?", bands: bands([["1","NONE","learners produced nothing the record shows"],["2","ECHOED","repetition only"],["3","ANSWERS","short answers, little extended speech"],["4","EXTENDED","extended learner speech in evidence"],["5","DISCOURSE","learners built on each other"],["6","OWNERSHIP","learners initiated, questioned and led"]]) },
        { id: "target", name: "Use of the target language", w: 1, question: "How much of the lesson ran in English — and was first-language use purposeful or drift?", bands: bands([["1","ABSENT","the target language hardly appears"],["2","TRANSLATED","mostly mediated through L1"],["3","STRATEGIC","L1 explains, English works"],["4","MAJORITY","mostly target language"],["5","SUSTAINED","target language sustained throughout"],["6","IMMERSIVE","target language throughout, including management"]]) },
        { id: "evidence.quality", name: "Evidence — how sound is this record", w: 1, role: "context", measure: "evidence", question: "How sound is the record this lesson is being judged from?", bands: bands([["1","THIN",""],["2","SPARSE",""],["3","ADEQUATE",""],["4","GOOD",""],["5","STRONG",""],["6","COMPLETE",""]]) }
      ]
    },
    {
      id: "err.taxonomy", name: "Error taxonomy — what to teach next", scale: "6-band frequency scale", role: "student",
      purpose: "Turn a record into a teachable list: each category scored on the verified instances the engine can find, never on an impression.",
      criteria: [
        { id: "grammar", name: "Grammar", w: 1, measure: "errorCount", question: "Quote every grammar error you can see, verbatim, exactly as spoken or written.", bands: FREQ },
        { id: "lexis", name: "Lexis and word choice", w: 1, measure: "errorCount", question: "Quote every wrong, missing or invented word, verbatim.", bands: FREQ },
        { id: "pronunciation", name: "Pronunciation and stress", w: 1, measure: "errorCount", question: "Quote only where the record shows the sound failing to carry meaning — no speculation about accent.", bands: FREQ },
        { id: "discourse", name: "Discourse and register", w: 1, measure: "errorCount", question: "Quote turns that fail to connect, or land wrongly for the situation.", bands: FREQ }
      ]
    }
  ];

  /* --------------------------------------------------------- custom rubrics
     A teacher's own rubric, defined in one line, versioned and hashed. */
  async function define(name, list, opts){
    opts = opts || {};
    name = String(name || "").trim();
    const crit = (list || []).map(c => String(c || "").trim()).filter(Boolean);
    if(!name || crit.length < 2) return { ok: false, why: "a custom rubric needs a name and at least two criteria" };
    const scale = opts.scale || ["1 EMERGING", "2 DEVELOPING", "3 SECURE", "4 STRONG", "5 EXEMPLARY", "6 AUTHORITATIVE"];
    const bset = bands(scale.map(s => { const sp = s.indexOf(" "); return [slug(s.slice(0, sp)) || "b" + s, s.slice(0, sp), s.slice(sp + 1)]; }));
    const id = "x." + slug(name);
    const prev = await get(id);
    const def = {
      id: id, name: name, custom: true, scale: opts.scaleName || "6-band custom scale",
      version: prev ? (prev.version + 1) : 1,
      purpose: opts.purpose || ("Judge " + name + " from the record, criterion by criterion, every band cited."),
      criteria: crit.map((q, i) => { const sp = q.split("::"); return { id: slug(sp[0]) || ("c" + (i + 1)), name: (sp[1] || sp[0]).trim(), w: 1, question: (sp[2] || sp[0]).trim(), bands: bset }; }),
      defined: Date.now()
    };
    def.sha = await sha256(JSON.stringify({ n: def.name, v: def.version, c: def.criteria.map(c => c.id + "|" + c.name + "|" + c.question) }));
    try{ await folder().set("def-" + id, def); }catch(err){ return { ok: false, why: "could not save: " + err.message }; }
    try{ logOp({ kind: "rubric", action: "define", detail: name + " · " + def.criteria.length + " criteria", result: "v" + def.version + " · " + def.sha.slice(0, 12) }); }catch(err){}
    return { ok: true, def: def };
  }

  async function customs(){
    try{ const pairs = await folder().entries(); return pairs.map(p => p[1]).filter(v => v && v.custom); }catch(err){ return []; }
  }
  async function get(id){
    id = String(id || "").trim();
    const b = BUILT.find(r => r.id === id);
    if(b){ const out = JSON.parse(JSON.stringify(b)); out.version = 1; out.frozen = true; out.sha = await sha256(JSON.stringify({ n: out.id, c: out.criteria.map(c => c.id + "|" + c.question) })); out.built = true; return out; }
    try{ return await folder().get("def-" + id) || null; }catch(err){ return null; }
  }
  async function list(){
    const out = [];
    for(const b of BUILT){ const d = await get(b.id); out.push({ id: d.id, name: d.name, scale: d.scale, criteria: d.criteria.length, version: d.version, sha: d.sha, custom: false }); }
    for(const c of await customs()) out.push({ id: c.id, name: c.name, scale: c.scale, criteria: c.criteria.length, version: c.version, sha: c.sha, custom: true });
    return out;
  }
  /* a rubric is frozen once it has scored: a new definition becomes a new version,
     so a stored run's cited rubric never silently changes under it */
  async function remove(id){
    const d = await get(id);
    if(!d || !d.custom) return { ok: false, why: "only custom rubrics can be removed" };
    const used = (await runs()).some(r => r.rubric && r.rubric.id === id);
    if(used) return { ok: false, why: "this rubric has scored runs on record — a definition that has judged something is not deleted, it is versioned" };
    try{ await folder().delete("def-" + id); }catch(err){ return { ok: false, why: err.message }; }
    return { ok: true };
  }

  /* ------------------------------------------------------------- the evidence
     The FULL record, not a sample: a quote is verified against every byte the
     station holds, even when only part of it was fitted into the prompt. */
  async function gather(ent){
    const sources = [], metrics = { sources: 0, transcripts: 0, summaries: 0, notes: 0, words: 0, chars: 0, duration: 0, wpm: 0, pauses: 0, longestPause: 0, speakers: 0, partsMissing: 0, diarized: false, from: null, to: null, days: 0, missing: [] };
    for(const n of (ent.notes || [])){
      sources.push({ id: null, kind: "note", name: "reviewer note · " + fmtDate(n.t), text: String(n.text || ""), t: n.t || null, utterances: null });
      metrics.notes++;
    }
    for(const s of (ent.sources || [])){
      const isTr = String(s.id || "").startsWith("tr-");
      let rec = null;
      try{ if(isTr && window.ObiTranscribe) rec = await window.ObiTranscribe.get(s.id); }catch(err){}
      if(!rec){ try{ if(window.ObiSummary) rec = await window.ObiSummary.get(s.id); }catch(err){} }
      if(!rec){
        metrics.missing.push(String(s.title || s.id));
        sources.push({ id: s.id, kind: "missing", name: String(s.title || s.id), text: "", t: s.t || null });
        continue;
      }
      const kind = isTr ? "transcript" : "summary";
      const text = String(isTr ? (rec.readable || rec.text || "") : (rec.text || rec.body || ""));
      const src = { id: rec.id, kind: kind, name: rec.name || rec.title || s.title || rec.id, text: text,
        utterances: rec.utterances || null, t: rec.created || s.t || null, partial: !!rec.partial, missing: rec.missing || [] };
      sources.push(src);
      metrics.sources++;
      metrics.chars += text.length;
      if(kind === "transcript"){
        metrics.transcripts++;
        metrics.words += Number(rec.words) || wordCount(text);
        metrics.duration += Number(rec.duration) || 0;
        metrics.pauses += Number(rec.pauses) || 0;
        metrics.longestPause = Math.max(metrics.longestPause, Number(rec.longestPause) || 0);
        metrics.speakers = Math.max(metrics.speakers, (rec.speakers || []).length);
        metrics.diarized = metrics.diarized || !!rec.diarized;
        if(rec.partial) metrics.partsMissing += (rec.missing || []).length || 1;
        const d = Number(rec.words) || 0;
        if(rec.duration && d) metrics.wpm = Math.max(metrics.wpm, Math.round((d / Number(rec.duration)) * 60));
      }
      const t = rec.created || s.t || null;
      if(t){ if(!metrics.from || t < metrics.from) metrics.from = t; if(!metrics.to || t > metrics.to) metrics.to = t; }
    }
    for(const s of sources){ if(s.t){ if(!metrics.from || s.t < metrics.from) metrics.from = s.t; if(!metrics.to || s.t > metrics.to) metrics.to = s.t; } }
    metrics.summaries = sources.filter(s => s.kind === "summary").length;
    if(metrics.from && metrics.to) metrics.days = Math.max(1, Math.round((metrics.to - metrics.from) / 86400000));
    /* the record handed to the model: full if it fits, sampled (and said so) if not */
    let body = sources.filter(s => s.text).map(s => "• " + s.kind + " · " + s.name + (s.t ? " · " + fmtDate(s.t) : "") + (s.partial ? " · PARTIAL" : "") + ":\n" + s.text).join("\n\n");
    let sampled = false;
    if(body.length > RAW_BUDGET){ const head = body.slice(0, Math.floor(RAW_BUDGET * 0.6)); const tail = body.slice(-Math.floor(RAW_BUDGET * 0.35)); body = head + "\n\n[… middle of the record omitted from the prompt for length — citations are still verified against the WHOLE record …]\n\n" + tail; sampled = true; }
    return { sources: sources, body: body, metrics: metrics, sampled: sampled, count: sources.filter(s => s.text).length };
  }

  /* the evidence-sufficiency gate — fail closed, and say which way it fails */
  function gate(ev){
    const m = ev.metrics, reasons = [];
    if(!ev.count) return { ok: false, provisional: false, reasons: ["no evidence is attached to this subject at all"] };
    if(m.chars < 400) reasons.push("the whole record is " + m.chars + " characters — thinner than a single short answer");
    if(!m.days || m.days < 2) reasons.push("the record covers a single day (" + (m.days || 0) + ") — it cannot show a trend, only a moment");
    if(m.partsMissing) reasons.push(m.partsMissing + " part(s) of the recording are MISSING — anything in them cannot be scored");
    if(m.missing.length) reasons.push(m.missing.length + " attached source(s) could not be read at all: " + m.missing.join(", "));
    if(ev.sampled) reasons.push("the record was longer than the prompt could hold and was sampled — citations are still verified against the whole record");
    if(m.sources === 1 && m.notes === 0) reasons.push("one source only, with no reviewer note — nothing cross-checks it");
    return { ok: true, provisional: reasons.length > 0, reasons: reasons };
  }

  /* -------------------------------------------------- locating a citation
     The heart of the thing: the engine finds the span itself, resolves which
     source holds it, and reads the timestamp off the record's own timeline.
     The timeline is read PRECISELY: the utterances are concatenated into one
     normalised text with an offset→utterance map, the span is found by boundary
     rather than by substring luck, and the clock comes from the utterance the span
     actually sits in. If the span sits in no utterance (a summary, a note, a quote
     that spans a gap) there is NO timestamp — an unreadable clock is reported as
     one, never guessed at. */
  function timeline(src){
    const U = src.utterances || [];
    if(!U.length) return null;
    const S = { hay: "", map: [], whay: "", wmap: [] };
    for(let k = 0; k < U.length; k++){
      const hs = norm(U[k].text || ""), hw = wordsOnly(U[k].text || "");
      if(hs){ if(S.hay){ S.hay += " "; S.map.push(k); } S.hay += hs; for(let c = 0; c < hs.length; c++) S.map.push(k); }
      if(hw){ if(S.whay){ S.whay += " "; S.wmap.push(k); } S.whay += hw; for(let c = 0; c < hw.length; c++) S.wmap.push(k); }
    }
    S.U = U;
    return S;
  }
  function boundaryFind(hay, needle){
    let from = 0;
    while(true){
      const at = hay.indexOf(needle, from);
      if(at === -1) return -1;
      const end = at + needle.length;
      if((at === 0 || hay[at - 1] === " ") && (end >= hay.length || hay[end] === " ")) return at;
      from = at + 1;
    }
  }
  function tsIn(src, q, qw){
    const T = timeline(src);
    if(T){
      let at = boundaryFind(T.hay, q);
      if(at !== -1) return stamp(T, at, q.length);
      if(qw){
        at = boundaryFind(T.whay, qw);
        if(at !== -1) return stamp(T, at, qw.length);
      }
      return { ts: null, speaker: null, why: "the span is not inside any single utterance of this recording — the clock is not guessed at, so none is shown" };
    }
    /* a summary or a note has no timeline: fall back to a bracketed time if the
       text itself carries one at the head of the line holding the quote */
    const lines = String(src.text || "").split("\n");
    for(const ln of lines){ if(norm(ln).indexOf(q) !== -1){ const m = ln.match(/\[(\d+:\d{2}(?::\d{2})?)\]/); if(m) return { ts: m[1], speaker: null }; } }
    return { ts: null, speaker: null };
  }
  function stamp(T, at, len){
    const k = T.map[at], kEnd = T.map[Math.min(T.map.length - 1, at + len - 1)];
    const u = T.U[k];
    return { ts: fmtDur(u.start), speaker: (u.speaker == null ? null : "Speaker " + (u.speaker + 1)),
      span: (kEnd - k + 1), endTs: (kEnd > k ? fmtDur(T.U[kEnd].end) : null) };
  }
  function locate(quote, sources){
    const q = norm(quote);
    if(!q) return { ok: false, why: "empty quote" };
    if(wordCount(q) < MIN_QUOTE_WORDS) return { ok: false, why: "under " + MIN_QUOTE_WORDS + " words — too short to prove anything" };
    for(const src of sources){
      if(!src.text) continue;
      if(norm(src.text).indexOf(q) !== -1) return { ok: true, match: "STRICT", src: src, ts: tsIn(src, q, wordsOnly(quote)) };
    }
    const qw = wordsOnly(quote);
    if(wordCount(qw) >= MIN_QUOTE_WORDS){
      for(const src of sources){
        if(!src.text) continue;
        if(wordsOnly(src.text).indexOf(qw) !== -1) return { ok: true, match: "LENIENT", src: src, ts: tsIn(src, q, qw) };
      }
    }
    return { ok: false, why: "the record does not contain this span, verbatim or word-for-word" };
  }

  /* ------------------------------------------------------------ the prompt
     Static head first (the law + the rubric), then the record, then the task —
     the same order every time, so the head is a cached prefix across runs. */
  function head(def){
    return "You are scoring a real student's record against a fixed rubric. You are an instrument, not a coach.\n\n"
      + "THE LAW OF THIS INSTRUMENT — you cannot break these, the machine checks them:\n"
      + "1. Every band you give MUST carry a short VERBATIM quote copied exactly from the record below. Not paraphrased, not tidied, not translated.\n"
      + "2. If you cannot find a verbatim quote for a criterion, write \"NONE\" for its band. Writing NONE is correct and expected; inventing a quote is not.\n"
      + "3. Never give a timestamp. The engine reads times off the record itself.\n"
      + "4. Never give a number, name, date or claim that is not in the record.\n"
      + "5. Quote the EVIDENCE that decided the band, including a quote that shows a weakness if that is what you saw.\n\n"
      + "RUBRIC " + def.id + " (v" + def.version + ") — " + def.name + " — scale: " + def.scale + "\n" + def.purpose + "\n\n"
      + def.criteria.map(c => "• " + c.id + " — " + c.name + (c.role === "context" ? " [CONTEXT: describes the evidence, not the learner]" : "")
          + "\n    look for: " + c.question
          + (c.measure ? "\n    measured: the ENGINE computes this one from the record itself — still quote the evidence you saw, and give your own band; the engine's number is used and your band is kept as dissent" : "")
          + "\n    bands: " + c.bands.map(b => b.label + " (" + (b.desc || b.label) + ")").join(" | ")).join("\n")
      + "\n\nANSWER WITH JSON ONLY — no preamble, no code fence, no commentary:\n"
      + "{\"criteria\":[{\"id\":\"<criterion id>\",\"band\":\"<exact band label from above, or NONE>\",\"quotes\":[\"<verbatim span from the record>\"]}],\"note\":\"<one honest sentence about what this evidence CANNOT show>\"}\n"
      + "For criteria whose bands are a frequency scale, put every instance you can find in \"quotes\" — the engine counts the verified ones, and only those.\n";
  }
  function task(def, ent, focus){
    return "\nTASK: score " + (ent.kind === "class" ? "this CLASS" : "this STUDENT") + " (" + ent.name + ") against every criterion of " + def.id
      + " above, using ONLY the record that follows. Return the JSON object described above and nothing else."
      + (focus ? " The reviewer asked you to look particularly at: " + focus : "");
  }

  /* --------------------------------------------------------------- parsing
     Tolerant extraction, but the RESULT is not tolerated: a band that is not one
     of the rubric's own band labels is discarded, because a band id that does not
     exist cannot be printed, compared or trended. */
  function parseJson(raw){
    let t = String(raw || "");
    const i = t.indexOf("{");
    if(i === -1) return { ok: false, why: "no JSON object in the response" };
    let depth = 0, inStr = false, esc2 = false, end = -1;
    for(let k = i; k < t.length; k++){
      const c = t[k];
      if(inStr){ if(esc2) esc2 = false; else if(c === "\\") esc2 = true; else if(c === '"') inStr = false; continue; }
      if(c === '"'){ inStr = true; continue; }
      if(c === "{") depth++;
      else if(c === "}"){ depth--; if(depth === 0){ end = k; break; } }
    }
    if(end === -1) return { ok: false, why: "the JSON object was never closed (the response was cut off)" };
    const body = t.slice(i, end + 1);
    try{ return { ok: true, data: JSON.parse(body), body: body }; }
    catch(err){
      try{ return { ok: true, data: JSON.parse(body.replace(/,\s*([}\]])/g, "$1")), body: body, repaired: true }; }
      catch(err2){ return { ok: false, why: "the JSON did not parse: " + err.message, body: body }; }
    }
  }
  function bandOf(crit, label){
    const v = norm(label);
    if(!v || v === "none" || v === "n/a" || v === "null") return null;
    return crit.bands.find(b => norm(b.label) === v || norm(b.id) === v) || null;
  }
  function mean(xs){ return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }

  /* --------------------------------------------------------------- scoring */
  async function scoreRun(def, ent, opts){
    opts = opts || {};
    const ev = await gather(ent);
    const g = gate(ev);
    if(!g.ok){ const r = { ok: false, gate: g, ev: ev, ent: ent, def: def }; return r; }

    let raw = "", acc = "";
    const modelOut = async () => {
      if(typeof opts.model === "function") return String(await opts.model(def, ent, ev) || "");
      const res = await root.generateText({ instruction: head(def) + "\n<RECORD>\n" + ev.body + "\n</RECORD>\n" + task(def, ent, opts.focus),
        startWith: "{", onChunk: d => { acc = d.fullTextSoFar; if(opts.onChunk) opts.onChunk(acc); } });
      return String(acc || res.generatedText || res.text || "");
    };

    try{ raw = await modelOut(); }
    catch(err){ return { ok: false, gate: g, ev: ev, ent: ent, def: def, error: String(err && err.message || err) }; }

    const p = parseJson(raw);
    const byId = {};
    if(p.ok && p.data && Array.isArray(p.data.criteria)) for(const c of p.data.criteria) if(c && c.id) byId[slug(c.id)] = c;

    const out = [], dissent = [], refused = [], omissions = [];
    for(const c of def.criteria){
      const m = byId[slug(c.id)] || null;
      const item = { id: c.id, name: c.name, role: c.role || "score", how: "not_scored", band: null, ordinal: null, quote: null, quoteSrc: null, quoteSrcKind: null, quoteTs: null, quoteSpeaker: null, match: null, value: null, display: null, scale: null, dissent: null, why: null };
      const quotes = m ? (Array.isArray(m.quotes) ? m.quotes : (m.quote ? [m.quote] : [])) : [];
      const claims = m ? bandOf(c, m.band) : null;
      let verified = [];
      for(const qt of quotes){
        const loc = locate(qt, ev.sources);
        if(loc.ok) verified.push({ quote: String(qt), src: loc.src, ts: loc.ts.ts, speaker: loc.ts.speaker, span: loc.ts.span || 1, endTs: loc.ts.endTs || null, why: loc.ts.why || null, match: loc.match });
        else refused.push({ id: c.id, quote: String(qt), why: loc.why });
      }
      const v0 = verified[0] || null;

      if(c.measure && MEASURES[c.measure] && c.measure !== "errorCount"){
        const mm = MEASURES[c.measure](ev.metrics);
        if(mm){
          item.how = "computed"; item.value = mm.value; item.display = mm.display; item.scale = mm.scale;
          item.ordinal = mm.ordinal; item.band = (c.bands[mm.ordinal - 1] || {}).label || ("band " + mm.ordinal); item.bandId = (c.bands[mm.ordinal - 1] || {}).id;
          if(claims && claims.ordinal !== mm.ordinal) { item.dissent = claims.label; dissent.push({ id: c.id, model: claims.label, computed: item.band, why: "the record's own numbers decide this one" }); }
          if(v0){ item.quote = v0.quote; item.quoteSrc = v0.src.id; item.quoteSrcKind = v0.src.kind; item.quoteTs = v0.ts; item.quoteEnd = v0.endTs; item.quoteSpan = v0.span; item.tsWhy = v0.why; item.quoteSpeaker = v0.speaker; item.match = v0.match; }
          out.push(item); continue;
        }
      }
      if(c.measure === "errorCount"){
        if(verified.length){
          const mm = MEASURES.errorCount(ev.metrics, verified.length);
          item.how = "computed"; item.value = mm.value; item.display = mm.display; item.scale = mm.scale;
          item.ordinal = mm.ordinal; item.band = (c.bands[mm.ordinal - 1] || {}).label || ("band " + mm.ordinal); item.bandId = (c.bands[mm.ordinal - 1] || {}).id;
          item.citations = verified.map(v => ({ quote: v.quote, src: v.src.id, kind: v.src.kind, ts: v.ts, speaker: v.speaker, match: v.match }));
          item.quote = v0.quote; item.quoteSrc = v0.src.id; item.quoteSrcKind = v0.src.kind; item.quoteTs = v0.ts; item.quoteEnd = v0.endTs; item.quoteSpan = v0.span; item.tsWhy = v0.why; item.quoteSpeaker = v0.speaker; item.match = v0.match;
          if(claims && claims.ordinal !== mm.ordinal){ item.dissent = claims.label; dissent.push({ id: c.id, model: claims.label, computed: item.band, why: verified.length + " verified instance(s) counted by the engine" }); }
          out.push(item); continue;
        }
        item.why = refused.some(r => r.id === c.id) ? "the model's instance(s) were not found in the record — " + refused.filter(r => r.id === c.id).length + " refused" : "no instance was found — and an error nobody found is not the same as no error";
        omissions.push(item); out.push(item); continue;
      }
      /* judged criterion: it lives or dies on a verified citation */
      if(v0 && claims){
        item.how = "cited"; item.band = claims.label; item.bandId = claims.id; item.ordinal = claims.ordinal;
        item.quote = v0.quote; item.quoteSrc = v0.src.id; item.quoteSrcKind = v0.src.kind; item.quoteTs = v0.ts; item.quoteEnd = v0.endTs; item.quoteSpan = v0.span; item.tsWhy = v0.why; item.quoteSpeaker = v0.speaker; item.match = v0.match;
        out.push(item); continue;
      }
      item.why = !claims && verified.length ? "a verified quote but no band from the rubric's list" : (!v0 && claims ? "a band (" + claims.label + ") with no verified citation — refused" : (!m ? "the model returned nothing for this criterion" : "no verified ground"));
      omissions.push(item); out.push(item);
    }

    const scored = out.filter(x => x.role !== "context" && x.how !== "not_scored" && x.ordinal);
    const measured = out.filter(x => x.role !== "context" && x.how === "not_scored").length;
    /* ADVERSE-ACTION REASONS — exactly what stood below the top band, each one with
       the verified span that decided it. A judgement that cannot say what lowered it
       is not a judgement a parent can answer. Absence is NOT listed here: a criterion
       that was never scored is an omission and is reported as one. */
    const topOrd = Math.max.apply(null, def.criteria.map(c => c.bands.length));
    const adverse = scored.filter(x => x.ordinal < topOrd).map(x => ({ id: x.id, name: x.name, band: x.band, gap: topOrd - x.ordinal,
      quote: x.quote, src: x.quoteSrc, ts: x.quoteTs, display: x.display, how: x.how })).sort((a, b) => b.gap - a.gap);
    const maxOrd = Math.max.apply(null, def.criteria.map(c => c.bands.length));
    const total = scored.reduce((a, x) => a + (x.ordinal * 1), 0);
    const maxTotal = scored.reduce((a, x) => a + maxOrd, 0);
    const scale = def.criteria[0].bands;
    const cOrd = scored.length ? Math.round(mean(scored.map(x => x.ordinal))) : null;
    const composite = cOrd ? (scale[cOrd - 1] || {}).label : null;
    const computedN = scored.filter(x => x.how === "computed").length;
    const citedN = scored.filter(x => x.how === "cited").length;

    const run = {
      id: nowId("rb-"), created: Date.now(), client: (window.ObiReview && window.ObiReview.clientId ? window.ObiReview.clientId() : null),
      rubric: { id: def.id, name: def.name, version: def.version, sha: def.sha, scale: def.scale, custom: !!def.custom },
      subject: { kind: ent.kind, name: ent.name, id: ent.id },
      criteria: out, dissent: dissent, refused: refused, omissions: omissions.map(x => ({ id: x.id, name: x.name, why: x.why })),
      adverse: adverse,
      coverage: { scored: scored.length, criteria: def.criteria.filter(c => c.role !== "context").length, contextN: out.filter(x => x.role === "context").length, notScored: measured, sources: ev.metrics.sources, notes: ev.metrics.notes, chars: ev.metrics.chars, words: ev.metrics.words, days: ev.metrics.days, from: ev.metrics.from, to: ev.metrics.to, sampled: ev.sampled, missing: ev.metrics.missing.length, partsMissing: ev.metrics.partsMissing },
      total: { sum: total, max: maxTotal, mean: scored.length ? Number(mean(scored.map(x => x.ordinal)).toFixed(2)) : null, composite: composite, maxOrdinal: maxOrd,
        form: total + "/" + maxTotal + " over " + scored.length + " of " + def.criteria.filter(c => c.role !== "context").length + " criteria" },
      confidence: { computed: computedN, cited: citedN, notScored: measured, note: citedN && !computedN ? "every scored criterion rests on a verified citation — a person's reading, checked against the record" : (computedN && !citedN ? "every scored criterion is arithmetic on the record — no judgement in the number" : (computedN + citedN ? "mixed: " + computedN + " computed · " + citedN + " cited" : "nothing scored")) },
      provisional: g.provisional, gate: g.reasons, model: { chars: raw.length, repaired: !!p.repaired, note: (p.ok && p.data && p.data.note) ? String(p.data.note).slice(0, 500) : null, parsed: !!p.ok, why: p.ok ? null : p.why },
      raw: clip(raw, 8000), period: (ev.metrics.from && ev.metrics.to) ? (fmtDate(ev.metrics.from) + " → " + fmtDate(ev.metrics.to)) : "unknown"
    };
    run.digest = await sha256(JSON.stringify({ r: run.rubric, s: run.subject.name, c: run.criteria.map(x => x.id + ":" + x.how + ":" + x.band + ":" + (x.quote || "").slice(0, 60)), t: run.total.form }));
    run.verdict = !p.ok ? "UNPARSED" : (scored.length === 0 ? "NOTHING SCORED" : (measured ? "PARTIAL" : "REAL"));
    return { ok: true, run: run, def: def, ent: ent, ev: ev, gate: g };
  }

  function save(run){ try{ return folder().set(run.id, run); }catch(err){ return Promise.resolve(null); } }
  async function runs(subject){
    let pairs = [];
    try{ pairs = await folder().entries(); }catch(err){}
    let all = pairs.map(p => p[1]).filter(v => v && v.id && v.rubric && v.criteria);
    if(subject){ const s = slug(subject); all = all.filter(r => slug(r.subject.name) === s || r.subject.id === s); }
    return all.sort((a, b) => b.created - a.created);
  }
  async function getRun(id){ try{ return await folder().get(String(id)) || null; }catch(err){ return null; } }

  /* -------------------------------------------------------- re-verification
     The thing that makes a scorecard worth keeping: it can be audited later,
     against the record as it stands now. */
  async function verify(id, opts){
    opts = opts || {};
    const r = opts.run || (id && typeof id === "object" ? id : await getRun(id));
    if(!r) return { ok: false, why: "no run on record called " + id };
    const ent = await resolveEntity(r.subject.kind, r.subject.name);
    if(!ent) return { ok: false, why: "the subject (" + r.subject.name + ") is not on this client's roster any more — the scorecard stands, but its ground cannot be re-read here", run: r };
    const ev = await gather(ent);
    const rows = [];
    for(const c of r.criteria){
      if(c.how === "computed"){ rows.push({ id: c.id, state: "STANDS", why: "computed from the record's own numbers — re-runnable, not re-verifiable by quote" }); continue; }
      if(!c.quote){ rows.push({ id: c.id, state: "NOT SCORED", why: "no citation to verify — this was never scored" }); continue; }
      const loc = locate(c.quote, ev.sources);
      if(loc.ok) rows.push({ id: c.id, state: "VERIFIED", why: "found again in " + (loc.src.name) + (loc.ts.ts ? " at " + loc.ts.ts : "") + " · " + loc.match, ts: loc.ts.ts });
      else rows.push({ id: c.id, state: "DRIFTED", why: "NOT found in the record as it stands now — either the record changed or the citation was never there: " + loc.why });
    }
    const bad = rows.filter(x => x.state === "DRIFTED").length;
    return { ok: true, run: r, rows: rows, verdict: bad ? "DRIFTED" : "ALL STAND" };
  }

  /* ------------------------------------------------------------- the trend
     Band movement for one subject under one rubric — the thing a term report
     needs and prose can never give. */
  async function trend(subject){
    const all = await runs(subject);
    if(all.length < 2) return { ok: true, runs: all.length, note: all.length ? "one run on record — a trend needs two" : "no runs on record for that subject", rows: [] };
    const byRubric = {};
    for(const r of all){ const k = r.rubric.id + "@" + r.rubric.version; (byRubric[k] = byRubric[k] || []).push(r); }
    const out = [];
    for(const k in byRubric){
      const set = byRubric[k].slice().sort((a, b) => a.created - b.created);
      if(set.length < 2) continue;
      const first = set[0], last = set[set.length - 1];
      const rows = [];
      for(const c of last.criteria){
        const f = first.criteria.find(x => x.id === c.id);
        if(!c.ordinal || !f || !f.ordinal){ rows.push({ id: c.id, name: c.name, state: "NO COMPARISON", why: (c.ordinal ? "the earlier run did not score it" : "this run did not score it") }); continue; }
        const delta = c.ordinal - f.ordinal;
        rows.push({ id: c.id, name: c.name, from: f.band, to: c.band, delta: delta, state: delta > 0 ? "MOVED UP" : (delta < 0 ? "MOVED DOWN" : "HELD") });
      }
      out.push({ rubric: last.rubric, runs: set.length, from: first.created, to: last.created, period: first.period + " ⇒ " + last.period,
        means: { first: first.total.mean, last: last.total.mean }, rows: rows });
    }
    return { ok: true, runs: all.length, sets: out };
  }

  /* ----------------------------------------------------------- the subject */
  async function resolveEntity(kindHint, name){
    const R = window.ObiReview;
    if(!R) return null;
    if(name){
      const want = slug(name);
      for(const k of (kindHint ? [kindHint] : ["student", "class"])){
        let list = [];
        try{ list = (k === "student") ? await R.students() : await R.classes(); }catch(err){}
        const hit = (list || []).find(x => x && (x.id === want || slug(x.name) === want));
        if(hit) return hit;
      }
      return null;
    }
    try{ return await R.current(); }catch(err){ return null; }
  }

  /* ------------------------------------------------------------ the card */
  function bandChip(c){
    const col = c.how === "not_scored" ? "#ff5a5a" : (c.role === "context" ? "#8a93a6" : (c.how === "computed" ? "#4cd97b" : "#f5a623"));
    return '<span class="chip" style="background:' + col + ';color:#08110c">' + e(c.band || "NOT SCORED") + '</span>';
  }
  function card(res){
    const r = res.run, def = res.def, c = r.coverage;
    const how = x => x.how === "computed" ? '<span style="color:#4cd97b">COMPUTED</span>' : (x.how === "cited" ? '<span style="color:#f5a623">CITED</span>' : '<span style="color:#ff5a5a">NOT SCORED</span>');
    const body = r.criteria.map(x => {
      const cite = x.quote ? ('<div style="margin:4px 0 0 0;padding:6px 8px;border-left:3px solid #2f3a4a;background:rgba(255,255,255,.03)">\u201c' + e(x.quote) + '\u201d<div class="hint" style="margin-top:3px">' + e(x.quoteSrcKind || "") + ' \u00b7 ' + e(x.quoteSrc || "") + (x.quoteTs ? (' \u00b7 <b>' + e(x.quoteTs) + (x.quoteSpan > 1 ? '\u2013' + e(x.quoteEnd || "") : "") + '</b>' + (x.quoteSpan > 1 ? ' (spanning ' + x.quoteSpan + ' utterances)' : '')) : (' \u00b7 <i>' + e(x.tsWhy || "no timeline in this source") + '</i>')) + (x.quoteSpeaker ? ' \u00b7 ' + e(x.quoteSpeaker) : '') + ' \u00b7 ' + e(x.match || "") + ' match</div></div>') : (x.display ? '<div class="rd">' + e(x.display) + '</div>' : '');
      return '<div class="rrow' + (x.how === "not_scored" ? ' bad' : '') + '"><b>' + e(x.name) + (x.role === "context" ? ' <span class="hint">(context — not in the composite)</span>' : '') + '</b><span class="vd">' + bandChip(x) + ' ' + how(x) + '</span>'
        + '<div class="rd">' + e(x.why || x.question || "") + cite + (x.scale ? '<div class="hint" style="margin-top:3px">' + e(x.scale) + '</div>' : '') + (x.dissent ? '<div class="hint" style="margin-top:3px;color:#f5a623">the model said ' + e(x.dissent) + ' — overridden by the record\u2019s own numbers (dissent recorded)</div>' : '') + '</div></div>';
    }).join("");
    const refRows = r.refused.length ? r.refused.map(x => '<div class="rrow bad"><b>' + e(x.id) + '</b><span class="vd">REFUSED</span><div class="rd">\u201c' + e(x.quote) + '\u201d<div class="hint">' + e(x.why) + '</div></div></div>').join("") : "";
    const omRows = r.omissions.length ? r.omissions.map(x => '<div class="rrow bad"><b>' + e(x.name) + '</b><span class="vd">NOT SCORED</span><div class="rd">' + e(x.why) + '</div></div>').join("") : "";
    const head = '<div class="rise"><div class="rhead">\u2696 /rubric \u2014 ' + e(r.subject.name) + ' \u00b7 ' + e(r.rubric.name) + ' v' + r.rubric.version + '</div>';
    return head
      + row("VERDICT", '<b style="color:' + (r.verdict === "REAL" ? "#4cd97b" : r.verdict === "PARTIAL" ? "#f5a623" : "#ff5a5a") + '">' + e(r.verdict) + '</b>' + (r.provisional ? ' <span class="chip" style="background:#f5a623;color:#08110c">PROVISIONAL</span>' : ''), r.total.form + (r.total.composite ? ' \u00b7 composite <b>' + e(r.total.composite) + '</b> (the centre of gravity, equally weighted)' : '') + ' \u00b7 period ' + e(r.period))
      + row("HOW IT WAS ESTABLISHED", r.confidence.computed + " computed \u00b7 " + r.confidence.cited + " cited \u00b7 " + r.confidence.notScored + " not scored", e(r.confidence.note))
      + row("THE RUBRIC", e(r.rubric.id) + " v" + r.rubric.version + " \u00b7 " + e(r.rubric.scale), "digest <b>" + e(String(r.rubric.sha).slice(0, 20)) + "\u2026</b> \u00b7 the definition that judged this cannot change without the digest changing")
      + row("THE RECORD", c.sources + " source(s) \u00b7 " + c.notes + " note(s) \u00b7 " + c.chars.toLocaleString() + " chars" + (c.words ? " \u00b7 " + c.words.toLocaleString() + " words" : "") + (c.days ? " \u00b7 " + c.days + " day(s)" : ""), r.gate.length ? e(r.gate.join(" \u00b7 ")) : "no reservations: the record is sound enough to score without a caveat")
      + body + refRows
      + (r.adverse.length ? '<div class="rhead" style="margin-top:8px">WHAT LOWERED IT — the adverse-action reasons, each with the span that decided it</div>'
          + r.adverse.map(x => row(x.name, bandChip(x), (x.quote ? '\u201c' + e(x.quote) + '\u201d' : e(x.display || "")) + ' \u00b7 ' + e(x.how) + (x.gap > 1 ? ' \u00b7 ' + x.gap + ' bands below the top' : '') )).join("") : "")
      + (omRows ? '<div class="rhead" style="margin-top:8px">OMISSION AUDIT \u2014 what this scorecard could not judge</div>' + omRows : "")
      + row("RUN", e(r.id) + " \u00b7 " + e(new Date(r.created).toLocaleString()) + " \u00b7 digest " + e(String(r.digest).slice(0, 16)) + "\u2026", "append-only \u00b7 /rubric verify " + e(r.id) + " re-checks every citation against the record as it stands")
      + (r.model.note ? row("WHAT THIS EVIDENCE CANNOT SHOW", "", e(r.model.note)) : "")
      + '<div class="rfoot">Every quote above was located by the engine inside the raw record \u2014 a quote it could not find was refused and is listed as refused. A band with no citation is not a score. <b>/rubric trend ' + e(r.subject.name) + '</b> \u00b7 <b>/rubric verify ' + e(r.id) + '</b></div></div>';
  }

  /* ------------------------------------------------------- the command run */
  async function run(defId, subjectName, opts){
    opts = opts || {};
    const def = await get(defId);
    if(!def) return { ok: false, why: "no rubric called " + defId + " — /rubric list" };
    const ent = await resolveEntity(opts.kind, subjectName);
    if(!ent) return { ok: false, why: subjectName ? ("nothing called " + subjectName + " on this client's roster") : "no student or class is active — /student <name> or /class <name>" };
    if(def.role && def.role !== "any" && ent.kind !== def.role) return { ok: false, why: "this rubric judges a " + def.role + ", and the active subject is a " + ent.kind + " (" + ent.name + ")" };
    return await scoreRun(def, ent, opts);
  }
  async function score(defId, subjectName, opts){
    const res = await run(defId, subjectName, opts);
    if(!res.ok){ return res; }
    await save(res.run);
    try{ logOp({ kind: "rubric", action: "score", detail: res.run.subject.kind + " " + res.run.subject.name + " · " + res.run.rubric.id + " v" + res.run.rubric.version, result: res.run.verdict + " · " + res.run.total.form + (res.run.total.composite ? " · " + res.run.total.composite : "") + " · " + res.run.id, ref: res.run.id }); }catch(err){}
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [rubric " + res.run.rubric.id + " on " + res.run.subject.name + " \u2014 " + res.run.verdict + " \u00b7 " + res.run.total.form + " \u00b7 " + res.run.coverage.scored + " cited/computed of " + res.run.coverage.criteria + "]"); }catch(err){}
    try{ messages.push("Obi: [scored " + res.run.subject.name + " against " + res.run.rubric.id + " \u2014 " + res.run.total.form + "]"); }catch(err){}
    return res;
  }
  /* mark the earlier run superseded — an ANNOTATION, never a rewrite */
  async function supersede(prevId, newId){
    const prev = await getRun(prevId);
    if(!prev) return false;
    prev.supersededBy = newId;
    prev.supersededAt = Date.now();
    try{ await folder().set(prev.id, prev); }catch(err){}
    return true;
  }

  /* --------------------------------------------------------- output formats */
  function toMarkdown(r){
    const L = [];
    L.push("# Scorecard — " + r.subject.name);
    L.push("");
    L.push("**Rubric:** " + r.rubric.name + " (`" + r.rubric.id + "` v" + r.rubric.version + ") · scale " + r.rubric.scale + "  ");
    L.push("**Rubric digest:** `" + r.rubric.sha + "`  ");
    L.push("**Record:** " + r.coverage.sources + " source(s), " + r.coverage.notes + " note(s), " + r.coverage.chars.toLocaleString() + " chars, period " + r.period + "  ");
    L.push("**Verdict:** " + r.verdict + (r.provisional ? " (PROVISIONAL)" : "") + " · **" + r.total.form + "**" + (r.total.composite ? " · composite " + r.total.composite : "") + "  ");
    L.push("**Run:** `" + r.id + "` · digest `" + r.digest + "` · " + new Date(r.created).toISOString());
    L.push("");
    L.push("| Criterion | Band | Established | Citation | Source | Time |");
    L.push("|---|---|---|---|---|---|");
    for(const c of r.criteria) L.push("| " + c.name + (c.role === "context" ? " _(context)_" : "") + " | " + (c.band || "NOT SCORED") + " | " + c.how + " | " + (c.quote ? '"' + String(c.quote).replace(/\|/g, "\\|") + '"' : (c.display || c.why || "—")) + " | " + (c.quoteSrc || "—") + " | " + (c.quoteTs || "—") + " |");
    if(r.adverse && r.adverse.length){ L.push(""); L.push("## What lowered it — every criterion below the top band, with the span that decided it"); for(const a of r.adverse) L.push("- **" + a.name + "** \u2014 " + a.band + " (" + a.how + ") \u2014 " + (a.quote ? '"' + a.quote + '"' : a.display || "")); }
    if(r.omissions.length){ L.push(""); L.push("## Omission audit — what this scorecard could not judge"); for(const o of r.omissions) L.push("- **" + o.name + "** — " + o.why); }
    if(r.refused.length){ L.push(""); L.push("## Refused citations (not found in the record)"); for(const x of r.refused) L.push("- **" + x.id + "** — \u201c" + x.quote + "\u201d — " + x.why); }
    if(r.dissent.length){ L.push(""); L.push("## Dissent (the model\u2019s band, overridden by the record\u2019s own numbers)"); for(const d2 of r.dissent) L.push("- **" + d2.id + "** — model said " + d2.model + ", the record says " + d2.computed + " (" + d2.why + ")"); }
    if(r.gate.length){ L.push(""); L.push("## Reservations"); for(const g of r.gate) L.push("- " + g); }
    if(r.model.note){ L.push(""); L.push("**What this evidence cannot show:** " + r.model.note); }
    L.push("");
    L.push("_Every quote in this document was located by the engine inside the raw record. A band with no verified citation is not a score._");
    return L.join("\n");
  }
  function toPrintHTML(r){
    const rows = r.criteria.map(c => "<tr><td>" + e(c.name) + "</td><td class='b'>" + e(c.band || "NOT SCORED") + "</td><td>" + e(c.how) + "</td><td><i>" + e(c.quote || c.display || c.why || "") + "</i>" + (c.quoteTs ? " <span class='t'>" + e(c.quoteTs) + "</span>" : "") + "</td></tr>").join("");
    return "<!doctype html><meta charset='utf-8'><title>Scorecard — " + e(r.subject.name) + "</title>"
      + "<style>body{font:15px/1.6 Georgia,serif;max-width:820px;margin:40px auto;padding:0 22px;color:#1a1a1a}h1{font-size:24px}table{border-collapse:collapse;width:100%;margin:16px 0}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left;vertical-align:top;font-size:13px}.b{font-weight:700}.t{color:#666}.meta{color:#555;font-size:13px}footer{margin-top:26px;border-top:1px solid #ddd;padding-top:10px;color:#666;font-size:12px}@media print{body{margin:0}}</style>"
      + "<h1>Scorecard — " + e(r.subject.name) + "</h1>"
      + "<p class='meta'>" + e(r.rubric.name) + " (<code>" + e(r.rubric.id) + "</code> v" + r.rubric.version + ") · scale " + e(r.rubric.scale) + " · record " + r.coverage.sources + " source(s), " + r.coverage.chars.toLocaleString() + " chars, " + e(r.period) + "<br>verdict <b>" + e(r.verdict) + "</b>" + (r.provisional ? " (PROVISIONAL)" : "") + " · <b>" + e(r.total.form) + "</b>" + (r.total.composite ? " · composite " + e(r.total.composite) : "") + " · run " + e(r.id) + " · digest " + e(String(r.digest).slice(0, 16)) + "</p>"
      + "<table><tr><th>Criterion</th><th>Band</th><th>Established</th><th>Citation from the record</th></tr>" + rows + "</table>"
      + (r.omissions.length ? "<h2>Omission audit</h2><ul>" + r.omissions.map(o => "<li><b>" + e(o.name) + "</b> — " + e(o.why) + "</li>").join("") + "</ul>" : "")
      + (r.gate.length ? "<h2>Reservations</h2><ul>" + r.gate.map(g => "<li>" + e(g) + "</li>").join("") + "</ul>" : "")
      + (r.model.note ? "<p><b>What this evidence cannot show:</b> " + e(r.model.note) + "</p>" : "")
      + "<footer>Every quote was located by the engine inside the raw record. Rubric digest " + e(String(r.rubric.sha).slice(0, 24)) + "… — the definition that judged this cannot change without it. Run digest " + e(String(r.digest).slice(0, 24)) + "…</footer>";
  }
  function download(name, text, mime){
    try{
      const a = document.createElement("a");
      a.href = "data:" + (mime || "text/plain") + ";charset=utf-8," + encodeURIComponent(text);
      a.download = name; document.body.appendChild(a); a.click(); a.remove();
      return true;
    }catch(err){ return false; }
  }

  /* ------------------------------------------------------------- self-test
     The canary for this instrument (this inventory row is checked by hand
     today — /rubric canary checks THIS one by machine). No model, no network:
     it drives the real pipeline with a canned response and asserts the law. */
  async function canary(){
    const checks = [];
    const t = {
      id: "tr-canary", name: "CANARY — a synthetic lesson record", words: 900, duration: 540, wpm: 100, pauses: 4, longestPause: 5.4, speakers: [0, 1], diarized: true,
      readable: "[0:00] Speaker 1: Good morning everyone, today we are going to look at the past perfect.\n[0:12] Speaker 2: Can you say that again please.\n[0:20] Speaker 1: The past perfect is for something that happened before another past action.\n[1:30] Speaker 2: I have went there last year.\n[2:40] Speaker 1: Write the sentence in your book and then compare answers.",
      utterances: [
        { start: 0, end: 10, text: "Good morning everyone, today we are going to look at the past perfect.", speaker: 0 },
        { start: 12, end: 18, text: "Can you say that again please.", speaker: 1 },
        { start: 20, end: 30, text: "The past perfect is for something that happened before another past action.", speaker: 0 },
        { start: 90, end: 96, text: "I have went there last year.", speaker: 1 },
        { start: 160, end: 168, text: "Write the sentence in your book and then compare answers.", speaker: 0 }
      ],
      text: "Good morning everyone today we are going to look at the past perfect. Can you say that again please. The past perfect is for something happened before.",
      created: Date.now() - 86400000 * 20, partial: false, parts: 1
    };
    const ent = { id: "canary", kind: "student", name: "CANARY", notes: [{ t: Date.now() - 86400000 * 19, text: "Canary note: the class ran long." }], sources: [{ id: "tr-canary", kind: "transcript", title: "Canary", t: t.created }] };
    const realTr = window.ObiTranscribe, realSu = window.ObiSummary;
    window.ObiTranscribe = { get: async id => (id === t.id ? t : null) };
    window.ObiSummary = { get: async () => null };
    try{
      const def = await get("cefr.speaking");
      /* 1. the arithmetic is real */
      const rate = MEASURES.rate({ wpm: 100, duration: 540 });
      checks.push(["rate measure computes 100wpm → the third of six bands", rate && rate.ordinal === 3, rate ? rate.display : "null"]);
      const pause = MEASURES.pausing({ duration: 600, pauses: 4, longestPause: 5.4 });
      checks.push(["pausing computes pauses per 10 min", pause && Math.abs(pause.value - 4) < 0.01, pause ? pause.display : "null"]);
      /* 2. a true quote is found, with its time read off the record */
      const good = locate("I have went there last year.", [{ id: "tr-canary", kind: "transcript", text: t.readable, utterances: t.utterances, name: "CANARY" }]);
      checks.push(["a real span is located STRICT", good.ok && good.match === "STRICT", good.ok ? good.match + " at " + good.ts.ts : good.why]);
      checks.push(["the timestamp comes off the record, not the model", good.ok && good.ts.ts === "1:30", good.ok ? String(good.ts.ts) : "—"]);
      /* 3. an invented quote is refused */
      const bad = locate("I have gone there many times before.", [{ id: "tr-canary", kind: "transcript", text: t.readable, utterances: t.utterances, name: "CANARY" }]);
      checks.push(["an invented span is refused", !bad.ok, bad.why]);
      const tiny = locate("past perfect", [{ id: "t", kind: "transcript", text: t.readable, name: "x" }]);
      checks.push(["a 3-word 'quote' is refused as unprovable", !tiny.ok, tiny.why]);
      const lenient = locate("Good morning everyone, today we are going to look at the past perfect", [{ id: "t", kind: "transcript", text: "Good morning everyone today we are going to look at the past perfect.", name: "x" }]);
      checks.push(["punctuation drift is matched LENIENT, never silently", lenient.ok && lenient.match === "LENIENT", lenient.ok ? lenient.match : lenient.why]);
      /* the clock is precise: the span is found by boundary in an offset→utterance
         map, so a span across two utterances reports the first clock and the span,
         and a span that sits in no utterance gets NO clock rather than a guess */
      const canarySrc = { id: "tr-canary", kind: "transcript", name: "CANARY", text: t.readable, utterances: t.utterances };
      const spanL = locate("The past perfect is for something that happened before another past action.", [canarySrc]);
      checks.push(["a located span reports its speaker and clock exactly", spanL.ok && spanL.ts.ts === "0:20" && spanL.ts.speaker === "Speaker 1" && spanL.ts.span === 1, spanL.ok ? (spanL.ts.ts + " " + spanL.ts.speaker + " span " + spanL.ts.span) : spanL.why]);
      const noClock = locate("Speaker 1: Good morning everyone", [canarySrc]);
      checks.push(["a span found in the text but in NO utterance gets no clock, and says why", noClock.ok && !noClock.ts.ts && !!noClock.ts.why, noClock.ok ? ("ts=" + noClock.ts.ts + " \u00b7 " + String(noClock.ts.why).slice(0, 70)) : noClock.why]);
      /* 4. the whole pipeline, with a canned model that breaks the law on purpose */
      const canned = JSON.stringify({ criteria: [
        { id: "fluency.rate", band: "C2", quotes: ["Good morning everyone, today we are going to look at the past perfect."] },
        { id: "range", band: "B1", quotes: ["I have went there last year."] },
        { id: "accuracy", band: "B2", quotes: ["I have went there many times before."] },
        { id: "interaction", band: "A2" },
        { id: "coherence", band: "B1", quotes: ["Write the sentence in your book and then compare answers."] }
      ], note: "One lesson cannot show a term of progress." });
      const res = await scoreRun(def, ent, { model: async () => canned });
      checks.push(["the run parses and returns a REAL/partial verdict", res.ok && !!res.run, res.ok ? res.run.verdict : res.why]);
      const r = res.run;
      const cRate = r.criteria.find(x => x.id === "fluency.rate"), cAcc = r.criteria.find(x => x.id === "accuracy"), cInt = r.criteria.find(x => x.id === "interaction");
      checks.push(["a computed criterion wins over the model's band, and records the dissent", cRate.how === "computed" && cRate.band === "B1" && cRate.dissent === "C2", cRate.band + " (model said " + cRate.dissent + ")"]);
      checks.push(["the model's refused quote is listed as refused, and its criterion is NOT SCORED", cAcc.how === "not_scored" && r.refused.length === 1, cAcc.why]);
      checks.push(["a band with no citation is NOT SCORED and enters the omission audit", cInt.how === "not_scored" && r.omissions.some(o => o.id === "interaction"), cInt.why]);
      checks.push(["coverage travels with the total", r.total.form.indexOf("over") !== -1 && r.coverage.scored === 4 && r.coverage.criteria === 6, r.total.form + " · " + r.confidence.note]);
      checks.push(["every engine-measured criterion is COMPUTED, not judged", r.criteria.find(x => x.id === "fluency.pausing").how === "computed" && r.criteria.find(x => x.id === "evidence.volume").how === "computed", "pausing=" + r.criteria.find(x => x.id === "fluency.pausing").how + " · volume(context)=" + r.criteria.find(x => x.id === "evidence.volume").how]);
      checks.push(["the citation carries its source and time", cRate.quoteSrc === "tr-canary" && cRate.quoteTs === "0:00", cRate.quoteTs + " · " + cRate.match]);
      checks.push(["the adverse-action reasons name exactly what stood below the top band", r.adverse.length === 4 && r.adverse.every(a => a.quote || a.display), r.adverse.map(a => a.id + "=" + a.band).join(", ")]);
      checks.push(["the run is digest-stamped and append-only", !!(r.digest && r.digest.length === 64), r.digest.slice(0, 16) + "…"]);
      /* 5. re-verification catches a citation that is not in the record */
      const forged = JSON.parse(JSON.stringify(r)); forged.id = "rb-canary-forged"; forged.criteria.find(x => x.id === "range").quote = "This sentence was never spoken by anybody.";
      const realRev = window.ObiReview;
      window.ObiReview = { students: async () => [ent], classes: async () => [], current: async () => ent, clientId: () => null };
      try{
        const v = await verify(forged);
        checks.push(["verify catches a citation that is not in the record", v.ok && v.verdict === "DRIFTED", v.ok ? v.rows.filter(x => x.state === "DRIFTED").map(x => x.id).join(",") : v.why]);
        const ok2 = JSON.parse(JSON.stringify(r)); ok2.id = "rb-canary-honest";
        const v2 = await verify(ok2);
        checks.push(["verify passes a citation that IS in the record", v2.ok && v2.verdict === "ALL STAND", v2.ok ? v2.verdict : v2.why]);
      }finally{ window.ObiReview = realRev; }
    } finally { window.ObiTranscribe = realTr; window.ObiSummary = realSu; }
    const pass = checks.filter(c => c[1]).length;
    return { pass: pass, total: checks.length, checks: checks };
  }

  function state(){
    return { version: VERSION, built: BUILT.length, families: BUILT.map(b => b.id), law: LAW.length, sandbox: "rubrics/" };
  }

  console.log("[rubric] v" + VERSION + " loaded \u2014 /rubric: the spectrum, the citation check, the run record (" + BUILT.length + " families)");
  window.ObiRubric = {
    VERSION: VERSION, BUILT: BUILT, MEASURES: MEASURES, minQuoteWords: MIN_QUOTE_WORDS,
    define: define, list: list, get: get, remove: remove,
    gather: gather, gate: gate, locate: locate, norm: norm, parseJson: parseJson,
    score: score, run: run, save: save, runs: runs, getRun: getRun, verify: verify, trend: trend, supersede: supersede,
    card: card, toMarkdown: toMarkdown, toPrintHTML: toPrintHTML, download: download, canary: canary, state: state,
    resolveEntity: resolveEntity
  };
  if(window.ObiScout){
    window.ObiScout.hooks.rubric = () => {
      const st = state();
      return { verdict: "INFO", summary: st.families.length + " rubric families · the citation check is enforced in code · /rubric canary checks this instrument by machine", rows: st.families.map(f => [f, "built-in", "every band cited, verified and timestamped from the record"]), cache: [] };
    };
  }
})();
