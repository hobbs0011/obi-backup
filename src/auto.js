/* ObiAuto — the master kill-switch for every automatic network lane (src/auto.js).

   WHY THIS EXISTS. The station has five lanes that move on their own:
     · the brain auto-sync  (src/brain.js — every 5 min: superFetch + heartbeat editable.write)
     · the relay auto-run   (src/relay.js — every 30 min)
     · the market auto-scan (src/market.js — every 30 min)
     · the masterlink watch (src/masterlink.js — every 3 min, superFetch reads of named generators)
     · the CGN dirty flush (src/cgn.js — every 60 s when joined)
   None of them posts to social media — but from the sovereign's chair they are all
   "auto posting": traffic nobody typed. Command #10 ("Stop auto posting") routed to
   the Legion with score 0 because no drone owned it. Now one switch owns them all.

   CONTRACT.
     · localStorage "obi_auto" = "on" | "off". ABSENT means OFF (stopped by default
       since 2026-10-16: the sovereign said stop, so stopped is the resting state).
     · window.ObiAuto.canAuto() — every lane checks this per-tick AND at start.
     · window.ObiAuto.setAuto(on) — flips the flag, persists it, and when turning ON
       arms the lanes that are loaded; when turning OFF the next tick of each lane
       no-ops (no reload needed to stop; reload needed to fully disarm timers that
       already fired — which is why setAuto(false) also calls every known stop()).
     · /auto — the chat door (wired in src/app.js): /auto · /auto on · /auto off.
   The 1-second background heartbeat (src/background.js), the watchdog and the
   voice-line painter stay running: they are local measurements, not traffic.
   ========================================================================== */
(function(){
  "use strict";
  const KEY = "obi_auto";

  function read(){
    try{
      const v = localStorage.getItem(KEY);
      if(v === "on" || v === "off") return v;
    }catch(e){}
    return "off"; /* stopped is the resting state (2026-10-16, command #10) */
  }
  function canAuto(){
    return read() === "on";
  }
  function setAuto(on){
    const v = on ? "on" : "off";
    try{ localStorage.setItem(KEY, v); }catch(e){}
    if(!on){
      try{ if(window.ObiMasterlink && window.ObiMasterlink.stop) window.ObiMasterlink.stop(); }catch(e){}
      /* brain/relay/market have no stop(): their ticks check canAuto() per-run,
         so the next scheduled tick no-ops. The flag is the stop. */
    } else {
      try{ if(window.ObiBrain && window.ObiBrain.start) window.ObiBrain.start(); }catch(e){}
      try{ if(window.ObiRelay && window.ObiRelay.start) window.ObiRelay.start(); }catch(e){}
      try{ if(window.ObiMarket && window.ObiMarket.start) window.ObiMarket.start(); }catch(e){}
      try{
        if(window.ObiMasterlink && window.ObiMasterlink.start){
          window.ObiMasterlink.config().then(c => { if(c && c.auto) window.ObiMasterlink.start(true); }).catch(()=>{});
        }
      }catch(e){}
    }
    return v;
  }
  function state(){
    return {
      auto: read(),
      stopped: read() !== "on",
      lanes: ["brain(5m)", "relay(30m)", "market(30m)", "masterlink-watch(3m)", "cgn-flush(60s)"],
      local: ["background-heartbeat(1s)", "watchdog(20s)", "voice-line(30s)"]
    };
  }

  window.ObiAuto = { KEY, read, canAuto, setAuto, state };
})();
