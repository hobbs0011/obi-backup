/* ============================================================================
   OBI · IMAGE NODE — the PrAis umbrella's eye.
   One generator, one job: pictures. Every prompt is still a sovereign word
   (L37 ALWAYS_ON_CAPTURE) — captured verbatim into the SDNAD ledger before
   anything else, and synced to the whole organism over CGN.

   Deep-link: ?p=<prompt> auto-fills and auto-generates (used by Obi's /img).
   ========================================================================== */

const MEM_KEY = "obi_sdnad";      /* same ledger key as the station — whole is one */
const HIST_KEY = "obi_image_history";
const MAX_HIST = 8;

function $(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

/* ---------------------- SOUL CAPTURE (L37/L38/L39) ---------------------- */
function loadLedger(){ try{ return JSON.parse(localStorage.getItem(MEM_KEY) || "null") || {runs:[], soul:[]}; }catch(e){ return {runs:[], soul:[]}; } }
function saveLedger(L){ try{ localStorage.setItem(MEM_KEY, JSON.stringify(L)); }catch(e){} }
let ledger = loadLedger();
function currentRun(){
  const last = ledger.runs.length ? ledger.runs[ledger.runs.length-1] : null;
  const now = new Date().toDateString();
  if(!last || new Date(last.t).toDateString() !== now){
    const run = { run: ledger.runs.length+1, t: Date.now(), closed:false, soulCount:0, decisions:[], principles:[] };
    ledger.runs.push(run); saveLedger(ledger); return run;
  }
  return last;
}
const curRun = currentRun();
const runNo = curRun.run;
function captureSoul(text, footnote){
  const entry = { t: Date.now(), role:"sovereign", run: runNo, text: text, footnote: footnote || null };
  curRun.soulCount = (curRun.soulCount||0)+1;
  ledger.soul.push(entry);
  saveLedger(ledger);
  if(window.cgnMarkDirty) window.cgnMarkDirty();
  updateStats();
  return entry;
}

/* ---------------------- IMAGE HISTORY ---------------------- */
function loadHist(){ try{ return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); }catch(e){ return []; } }
function saveHist(h){ try{ localStorage.setItem(HIST_KEY, JSON.stringify(h)); }catch(e){} }
let history = loadHist();

async function thumbnail(dataUrl){
  try{
    const img = new Image();
    img.src = dataUrl;
    await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; });
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const ctx = c.getContext("2d", { willReadFrequently:true });
    const scale = Math.max(256/img.width, 256/img.height);
    const w = img.width*scale, h = img.height*scale;
    ctx.drawImage(img, (256-w)/2, (256-h)/2, w, h);
    return c.toDataURL("image/jpeg", 0.7);
  }catch(e){ return dataUrl; }
}

/* ---------------------- IMAGE GENERATION ---------------------- */
let busy = false;
async function generate(){
  const prompt = promptInput.value.trim();
  if(!prompt || busy) return;
  busy = true;
  genBtn.disabled = true;
  genBtn.classList.add("busy");
  genBtn.innerHTML = "Making…";
  resultEl.innerHTML = '<div class="loader"><div class="spinner"></div> summoning the image…</div>';

  /* SOUL-CAPTURE-FIRST: the prompt is a sovereign word, recorded verbatim. */
  captureSoul(prompt, "image request — " + runNo);

  try{
    const res = await root.generateImage({ prompt, resolution:"768x768" });
    const thumb = await thumbnail(res.dataUrl);
    history.unshift({ p: prompt, thumb, full: res.dataUrl, t: Date.now() });
    if(history.length > MAX_HIST) history.pop();
    saveHist(history);
    resultEl.innerHTML = '<img class="result-img" src="'+res.dataUrl+'"><div class="cap">✨ '+esc(prompt)+'</div>';
    renderHist();
    speak("Here you go — your image.");
  }catch(e){
    resultEl.innerHTML = '<div class="cap warn">⚠ Couldn\'t generate: '+esc(e.message)+'</div>';
  }
  busy = false;
  genBtn.disabled = false;
  genBtn.classList.remove("busy");
  genBtn.innerHTML = "✦ Generate";
}

function renderHist(){
  histList.innerHTML = history.length
    ? history.map((h,i)=>'<div class="hitem" title="'+esc(h.p)+'" onclick="showHist('+i+')"><img src="'+h.thumb+'"><div class="hcap">'+esc(h.p.slice(0,60))+'</div></div>').join("")
    : '<div class="hint">Nothing created yet — describe a picture above.</div>';
}
function showHist(i){
  const h = history[i];
  if(!h) return;
  resultEl.innerHTML = '<img class="result-img" src="'+h.full+'"><div class="cap">✨ '+esc(h.p)+'</div>';
  promptInput.value = h.p;
}

/* ---------------------- UI ---------------------- */
function updateStats(){
  const el = $("statsEl");
  if(!el) return;
  el.innerHTML = 'RUN '+runNo+' · soulcount <b>'+soulCount()+'</b> · captures <b>'+ledger.soul.length+'</b> · history <b>'+history.length+'</b>';
}
function soulCount(){ return ledger.soul.reduce((n,e)=> n + String(e.text||"").length, 0); }

function showMemory(){
  memoryPanel.classList.toggle("hidden");
  if(memoryPanel.classList.contains("hidden")) return;
  memList.innerHTML = "";
  const items = ledger.soul.slice().reverse().slice(0,40);
  if(!items.length) memList.innerHTML = '<div class="hint">No Soul DNA captured yet — your prompts will be recorded here verbatim.</div>';
  items.forEach(e => {
    const d = document.createElement("div");
    d.className = "mem-item";
    const ts = new Date(e.t).toLocaleString();
    d.innerHTML = '<div class="mh">RUN '+(e.run??"—")+' · '+ts+'</div><div class="mq">'+esc(e.text)+'</div>';
    memList.appendChild(d);
  });
}

function speak(text){
  if(!window.voiceEnabled) return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[*#`_~\[\]]/g," ").replace(/\s+/g," ").trim().slice(0,600));
    u.rate = 1.0;
    speechSynthesis.speak(u);
  }catch(e){}
}

/* mic — dictation into the prompt box (lazy-created, no TDZ) */
let recog = null;
function dictate(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ promptInput.placeholder = "Dictation not supported — type instead."; return; }
  if(!recog){
    recog = new SR();
    recog.lang = "en-US"; recog.continuous = false; recog.interimResults = false;
    recog.onresult = (e)=>{
      micBtn.classList.remove("recording");
      const t = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : "";
      if(t.trim()){ promptInput.value = t.trim(); generate(); }
    };
    recog.onerror = () => micBtn.classList.remove("recording");
    recog.onend = () => micBtn.classList.remove("recording");
  }
  if(micBtn.classList.contains("recording")){ try{ recog.stop(); }catch(e){} micBtn.classList.remove("recording"); return; }
  try{ recog.start(); micBtn.classList.add("recording"); }
  catch(e){ micBtn.classList.remove("recording"); }
}
window.dictate = dictate;

/* ---------------------- STYLE PRESETS ---------------------- */
const PRESETS = [
  { label:"Watercolor", add:"watercolor painting, soft washes, paper texture" },
  { label:"Ghibli", add:"studio ghibli style, hand-drawn anime, lush backgrounds" },
  { label:"Pixel", add:"pixel art, 16-bit, retro game sprite" },
  { label:"Cinematic", add:"cinematic film still, dramatic lighting, anamorphic" },
  { label:"Dark fantasy", add:"dark fantasy, moody, intricate detail" },
  { label:"Low-poly 3D", add:"low-poly 3D render, soft studio lighting" }
];
function preset(i){
  const p = PRESETS[i];
  if(!p) return;
  if(promptInput.value.trim() && !promptInput.value.includes(p.add)){
    promptInput.value += ", " + p.add;
  } else if(!promptInput.value.trim()){
    promptInput.value = p.add;
  }
  generate();
}
window.preset = preset;

/* ---------------------- WIRING ---------------------- */
const promptInput = $("promptInput"), genBtn = $("genBtn"), resultEl = $("resultEl"),
      histList = $("histList"), memoryPanel = $("memoryPanel"), memList = $("memList"),
      micBtn = $("micBtn"), statsEl = $("statsEl");
genBtn.onclick = generate;
promptInput.addEventListener("keydown", e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); generate(); } });
micBtn.onclick = dictate;
$("memoryBtn").onclick = () => { showMemory(); updateStats(); };
$("voiceBtn").onclick = () => {
  window.voiceEnabled = !window.voiceEnabled;
  $("voiceBtn").classList.toggle("on", window.voiceEnabled);
  $("voiceLbl").textContent = window.voiceEnabled ? "Voice on" : "Voice off";
};
window.voiceEnabled = true;
$("presetChips").innerHTML = PRESETS.map((p,i)=>'<button class="chip" onclick="preset('+i+')">'+esc(p.label)+'</button>').join("");

/* deep-link ?p=<prompt> — auto-generate (used by Obi's /img routing) */
(async function(){
  renderHist();
  updateStats();
  try{
    const q = new URLSearchParams(location.search);
    const p = (q.get("p")||"").trim();
    if(p){ promptInput.value = p; generate(); }
  }catch(e){}
})();
