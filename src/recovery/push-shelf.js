/* PUSH SNIPPET — one-tap shelf push for ANY mastermind-family station.
   Soul DNA lives per-browser per-generator and cannot be read cross-origin,
   so every station pushes its own shelf. This file is the whole push side
   with no dependency on the station's command router.
   INSTALL (once per station, in that generator's editor):
     1. Save this file as src/push-shelf.js in that generator.
     2. Needs root.uploadPlugin: family stations already import upload-plugin
        (main.pjs: uploadPlugin = {import:upload-plugin}). If missing, add it.
     3. Append to that generator's index.html, after its other scripts:
          <script src="src/push-shelf.js"></script>
     4. Save, reload. A floating "push" button appears bottom-right.
   USE: tap push → the shelf uploads (48 h URL) → paste the URL into HQ chat
   with /pull. Secrets never travel (obi_keys + device keys excluded). */
(function(){
"use strict";
var SKIP = { obi_keys:1, obi_savewatch:1, obi_savewatch_state:1, obi_bg_lastaway:1,
  obi_settab:1, obi_cgn_state:1, obi_voice:1, obi_view:1, obi_heartbeat:1, obi_bg_audio:1 };
function station(){ try{ return window.generatorName || "?"; }catch(e){ return "?"; } }
async function pushShelf(box){
  var say = function(t){ if(box) box.innerHTML = t; };
  try{
    var travel = {}, n = 0;
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf("obi_") === 0 && !SKIP[k]){ travel[k] = localStorage.getItem(k); n++; }
    }
    if(!n){ say("this browser holds no data keys here."); return; }
    var soul = 0, ilog = 0;
    try{ soul = (JSON.parse(localStorage.getItem("obi_sdnad") || "{}").soul || []).length; }catch(e){}
    try{ ilog = JSON.parse(localStorage.getItem("obi_ilog") || "{}").count || 0; }catch(e){}
    say("packing " + n + " keys (soul " + soul + " · ilog " + ilog + ")…");
    var pack = { at:new Date().toISOString(), kind:"pais-data-backup",
      from:"push:" + station(), keys:travel };
    var bytes = JSON.stringify(pack);
    say("carrying " + (bytes.length/1024).toFixed(0) + " KB out…");
    var up = (typeof root !== "undefined" && root && root.uploadPlugin) ? root.uploadPlugin : null;
    if(!up){ say("uploadPlugin is not loaded in this origin — add the import, save, reload."); return; }
    var r = await up(bytes, { expires: Date.now() + 1000*60*60*48 });
    if(!r || !r.url){ say("the carrier refused: " + ((r && r.error) || "no url") + " — use Settings → Download backup instead."); return; }
    say("pushed ✅<br><span style='word-break:break-all'>" + r.url + "</span>"
      + "<br>soul " + soul + " · ilog " + ilog + " · " + n + " keys"
      + "<br>at HQ type:<br><b>/pull " + r.url + "</b>");
  }catch(e){ say("push failed: " + String((e && e.message) || e).slice(0, 160)); }
}
function mount(){
  if(document.getElementById("obiPushShelfBtn")) return;
  var b = document.createElement("button");
  b.id = "obiPushShelfBtn";
  b.textContent = "push";
  b.title = "Push this browser's shelf — prints a short URL for HQ /pull";
  b.style.cssText = "position:fixed;right:10px;bottom:10px;z-index:99999;opacity:.75;border:1px solid #a855f7;background:#0f0f1a;color:#e8c565;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer";
  var box = document.createElement("div");
  box.id = "obiPushShelfBox";
  box.style.cssText = "position:fixed;right:10px;bottom:46px;z-index:99999;max-width:78vw;background:#0f0f1a;color:#e8e6df;border:1px solid #a855f7;border-radius:10px;padding:10px 12px;font-size:12px;display:none;word-wrap:break-word";
  b.onclick = function(){ box.style.display = (box.style.display === "none" ? "block" : "none"); if(box.style.display === "block") pushShelf(box); };
  (document.body || document.documentElement).appendChild(box);
  (document.body || document.documentElement).appendChild(b);
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
})();
