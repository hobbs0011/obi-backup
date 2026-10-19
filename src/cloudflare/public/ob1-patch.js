/* ==========================================================================================
   OB-1 on Cloudflare — post-load patch. Runs AFTER src/app.js.

   On perchance the Deepgram key lived in localStorage. Here it lives in a Worker secret and is
   injected at the edge, so the app's "do I have a key?" check is answered with a harmless
   sentinel. The sentinel is never transmitted: ob1-shim.js strips the Authorization header from
   every api.deepgram.com request and the Worker supplies the real one.

   If the Worker has no DEEPGRAM_API_KEY the sentinel is NOT written, so the ear keeps showing its
   key card instead of failing later with a 501 mid-upload.
   ========================================================================================== */
(function(){
  function apply(c){
    if(!c) return;
    window.__OBI_CONFIG = c;
    try{
      if(c.stt){
        const cur = JSON.parse(localStorage.getItem("obi_keys") || "{}");
        if(cur.deepgram !== "server"){
          cur.deepgram = "server";
          localStorage.setItem("obi_keys", JSON.stringify(cur));
        }
      }else{
        console.warn("[obi-cf] No DEEPGRAM_API_KEY on the Worker — transcription is off. " +
          "Set it with:  wrangler secret put DEEPGRAM_API_KEY");
      }
    }catch(e){}
    console.info("[obi-cf] config", c);
  }
  if(window.root && window.root.config) apply(window.root.config);
  window.addEventListener("obi-config", e => apply(e.detail));
})();
