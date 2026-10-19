/* ==========================================================================================
   OB-1 on Cloudflare — the perchance shim.

   Loaded BEFORE src/app.js. It defines the six plugin APIs the app was written against, so the
   app itself is byte-identical to the perchance build:

     root.kv                -> IndexedDB, in the browser, per generator name (nothing leaves the device)
     root.generateText      -> POST /api/text      (streaming; onChunk + .stop())
     root.generateImage     -> POST /api/image
     root.superFetch        -> POST /api/fetch     (edge proxy, no CORS wall)
     root.uploadPlugin      -> POST /api/upload    (+ .editable, the CGN hub files)
     root.createServerSocket-> WebSocket to /api/tunnel (TunnelDO)

   It also rewrites api.deepgram.com to /api/deepgram and strips the Authorization header, so the
   app's transcription code runs unchanged while the key lives only in a Worker secret.
   ========================================================================================== */
(function(){
  "use strict";

  /* ------------------------------- identity globals ------------------------------- */
  function hex(n){
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return Array.from(a).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  let pid = null;
  try{ pid = localStorage.getItem("ob1_pid"); }catch(e){}
  if(!pid){ pid = hex(16); try{ localStorage.setItem("ob1_pid", pid); }catch(e){} }
  window.generatorPublicId = pid;
  window.generatorName = window.OBI_NAME || "obi-cf";
  window.generatorIsUnsaved = false;
  window.__OBI_CLOUDFLARE = true;

  /* where CGN reads/writes its hub + node files (src/cgn.js keeps the same <base>/<gen>/<file> shape) */
  window.OBI_EDITABLE_BASE = location.origin + "/api/editable";

  const realFetch = window.fetch.bind(window);

  /* ------------------------------------ kv --------------------------------------- */
  const DB_NAME = "ob1-kv:" + window.generatorName;
  let dbp = null;
  function db(){
    if(dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => { if(!r.result.objectStoreNames.contains("kv")) r.result.createObjectStore("kv"); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  const SEP = "\u0000";
  const K = (f, k) => f + SEP + String(k);
  const REQ = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function txn(mode, fn){
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction("kv", mode);
      let out;
      try{ out = fn(t.objectStore("kv")); }
      catch(e){ try{ t.abort(); }catch(_){} rej(e); return; }
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error("aborted"));
    });
  }
  function folder(name){
    const pre = name + SEP;
    const strip = ks => ks.map(k => String(k)).filter(k => k.startsWith(pre)).map(k => k.slice(pre.length));
    return {
      set:           (k, v)      => txn("readwrite", s => { s.put(v, K(name, k)); return v; }),
      get:           k           => txn("readonly",  s => REQ(s.get(K(name, k)))),
      delete:        k           => txn("readwrite", s => { s.delete(K(name, k)); return true; }),
      setMany:       pairs       => txn("readwrite", s => { for(const p of pairs) s.put(p[1], K(name, p[0])); return true; }),
      getMany:       keys        => txn("readonly",  s => Promise.all(keys.map(k => REQ(s.get(K(name, k)))))),
      deleteMany:    keys        => txn("readwrite", s => { for(const k of keys) s.delete(K(name, k)); return true; }),
      keys:          ()          => txn("readonly",  s => REQ(s.getAllKeys()).then(strip)),
      values:        ()          => txn("readonly",  s => REQ(s.getAll())),
      entries:       ()          => txn("readonly",  s => Promise.all([REQ(s.getAllKeys()), REQ(s.getAll())]).then(([ks, vs]) => {
                                      const out = [];
                                      for(let i = 0; i < ks.length; i++){ const k = String(ks[i]); if(k.startsWith(pre)) out.push([k.slice(pre.length), vs[i]]); }
                                      return out;
                                    })),
      update:        (k, fn)     => txn("readwrite", s => new Promise((res, rej) => {
                                      const r = s.get(K(name, k));
                                      r.onsuccess = () => { const nv = fn(r.result); s.put(nv, K(name, k)); res(nv); };
                                      r.onerror = () => rej(r.error);
                                    }))
    };
  }
  const kv = new Proxy({}, {
    get(t, p){ if(p === "then" || typeof p !== "string") return undefined; return folder(p); },
    has(){ return true; }
  });

  /* --------------------------------- generateText -------------------------------- */
  function generateText(input){
    const opts = (input && typeof input === "object") ? Object.assign({}, input) : { instruction: String(input == null ? "" : input) };
    const ctrl = new AbortController();
    const p = (async () => {
      if(opts.getMetaObject) return { model: "workers-ai", streaming: true, stop: () => ctrl.abort() };
      const res = await fetch("/api/text", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ instruction: opts.instruction, startWith: opts.startWith || "", stopSequences: opts.stopSequences || [] }),
        signal: ctrl.signal
      });
      if(!res.ok){ let t = ""; try{ t = await res.text(); }catch(e){} throw new Error("HTTP " + res.status + (t ? " — " + t.slice(0, 300) : "")); }
      const reader = res.body.getReader(), dec = new TextDecoder();
      let buf = "", full = "";
      for(;;){
        const { done, value } = await reader.read();
        if(done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while((i = buf.indexOf("\n")) !== -1){
          const line = buf.slice(0, i); buf = buf.slice(i + 1);
          if(!line.trim()) continue;
          let evt; try{ evt = JSON.parse(line); }catch(e){ continue; }
          if(evt.error) throw new Error(evt.error);
          if(evt.delta){ full += evt.delta; if(opts.onChunk) try{ opts.onChunk({ textChunk: evt.delta, fullTextSoFar: full }); }catch(e){} }
        }
      }
      return { generatedText: full, text: full, raw: full };
    })();
    p.stop = () => { try{ ctrl.abort(); }catch(e){} };
    try{ Object.defineProperty(p, "toString", { value: () => "" }); }catch(e){}
    return p;
  }

  /* -------------------------------- generateImage -------------------------------- */
  async function generateImage(input){
    const opts = (input && typeof input === "object") ? input : { prompt: String(input || "") };
    const res = await fetch("/api/image", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: opts.prompt, negativePrompt: opts.negativePrompt,
        resolution: opts.resolution || "768x768", seed: opts.seed })
    });
    let j = {}; try{ j = await res.json(); }catch(e){}
    if(!res.ok || !j.dataUrl) throw new Error(j.error || ("image: HTTP " + res.status));
    return { dataUrl: j.dataUrl, prompt: opts.prompt, inputs: opts, canvas: null };
  }

  /* ---------------------------------- superFetch --------------------------------- */
  function superFetch(url, opts){
    let abs;
    try{ abs = new URL(String(url), location.href); }catch(e){ return Promise.reject(new Error("bad url")); }
    const method = (opts && opts.method) || "GET";
    /* anything on our own origin (CGN hub/node files) goes direct — no need to proxy ourselves */
    if(abs.origin === location.origin) return realFetch(abs.href, { method, headers: (opts && opts.headers) || undefined });
    return realFetch("/api/fetch", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: abs.href, method,
        headers: (opts && opts.headers) || null,
        body: (opts && typeof opts.body === "string") ? opts.body : null })
    });
  }

  /* --------------------------------- uploadPlugin -------------------------------- */
  async function uploadPlugin(data){
    let blob = data;
    if(typeof data === "string") blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    /* duck-typed, not `instanceof Blob`: a Blob from another realm (iframe, worker) is still a Blob */
    const isBlob = blob && typeof blob === "object" && typeof blob.size === "number" && typeof blob.arrayBuffer === "function";
    if(!isBlob) return { url: null, size: 0, error: "invalid_filetype", deletionUrl: null };
    if(!blob.type) blob = new Blob([blob], { type: "text/plain;charset=utf-8" });
    const res = await fetch("/api/upload", {
      method: "POST", headers: { "x-ob1-type": blob.type || "application/octet-stream" }, body: blob
    });
    let j = {}; try{ j = await res.json(); }catch(e){}
    if(!res.ok) return { url: null, size: 0, error: res.status === 413 ? "file_too_big" : (j.error || "upload failed"), deletionUrl: null };
    return { url: j.url, size: j.size, error: null, deletionUrl: j.deletionUrl };
  }
  uploadPlugin.editable = {
    async set(name, text, opts){
      const res = await fetch("/api/editable", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, text, editKey: (opts && opts.editKey) || null })
      });
      let j = {}; try{ j = await res.json(); }catch(e){}
      if(!res.ok) throw new Error(j.error || ("editable: HTTP " + res.status));
      return j;
    },
    async get(name){
      const res = await fetch("/api/editable/" + encodeURIComponent(name));
      if(res.status === 404) return null;
      if(!res.ok) throw new Error("editable: HTTP " + res.status);
      return await res.text();
    }
  };

  /* ------------------------------ createServerSocket ------------------------------ */
  function createServerSocket(){
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(proto + "//" + location.host + "/api/tunnel");
    const listeners = { open: [], close: [], error: [], message: [] };
    const waiters = new Map();
    let seq = 0;
    const fire = (type, ev) => { for(const f of [...(listeners[type] || [])]) try{ f(ev); }catch(e){} };

    ws.addEventListener("open",  e => fire("open", e));
    ws.addEventListener("close", e => fire("close", e));
    ws.addEventListener("error", e => fire("error", e));
    ws.addEventListener("message", e => {
      let d = null;
      try{ d = JSON.parse(e.data); }catch(ex){ return fire("message", e); }
      if(d && d.t === "rpc"){
        const w = waiters.get(d.rid);
        if(w){ waiters.delete(d.rid); d.ok ? w.res(d.value) : w.rej(new Error(d.error || "rpc error")); }
        return;
      }
      if(d && d.t === "pub"){ fire("message", { data: d.msg }); return; }
      fire("message", e);
    });

    const sock = {
      binaryType: "arraybuffer",
      addEventListener(type, fn, opts){
        if(opts && opts.once){
          const once = ev => { sock.removeEventListener(type, once); fn(ev); };
          (listeners[type] = listeners[type] || []).push(once);
          return;
        }
        (listeners[type] = listeners[type] || []).push(fn);
      },
      removeEventListener(type, fn){
        const a = listeners[type]; if(!a) return;
        const i = a.indexOf(fn); if(i !== -1) a.splice(i, 1);
      },
      close(){ try{ ws.close(); }catch(e){} },
      rpc: {}
    };
    for(const m of ["send", "history", "claim", "complete", "fail", "status"]){
      sock.rpc[m] = data => new Promise((res, rej) => {
        const rid = ++seq;
        waiters.set(rid, { res, rej });
        try{ ws.send(JSON.stringify({ t: "rpc", rid, m, d: data == null ? "{}" : String(data) })); }
        catch(e){ waiters.delete(rid); rej(e); return; }
        setTimeout(() => { if(waiters.has(rid)){ waiters.delete(rid); rej(new Error("rpc timeout: " + m)); } }, 20000);
      });
    }
    return sock;
  }

  /* ------------------------- Deepgram, server-keyed ------------------------------ */
  const DG = "https://api.deepgram.com";
  try{
    const oOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url){
      let u = String(url);
      if(u.startsWith(DG)) u = "/api/deepgram" + u.slice(DG.length);
      return oOpen.apply(this, [method, u].concat(Array.prototype.slice.call(arguments, 2)));
    };
    const oSet = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(k, v){
      if(String(k).toLowerCase() === "authorization") return;   /* the Worker adds the real key */
      return oSet.apply(this, arguments);
    };
  }catch(e){}

  window.fetch = function(input, init){
    if(typeof input === "string" && input.startsWith(DG)){
      const mapped = "/api/deepgram" + input.slice(DG.length);
      if(init && init.headers){
        const h = Object.assign({}, init.headers);
        delete h.Authorization; delete h.authorization;
        init = Object.assign({}, init, { headers: h });
      }
      return realFetch(mapped, init);
    }
    return realFetch(input, init);
  };

  /* ------------------------------------ root ------------------------------------- */
  const root = {
    kv, generateText, generateImage, superFetch, uploadPlugin, createServerSocket,
    config: null
  };
  window.root = root;

  fetch("/api/config").then(r => r.json()).then(c => {
    root.config = c;
    if(c && c.name) window.generatorName = c.name;
    window.dispatchEvent(new CustomEvent("obi-config", { detail: c }));
  }).catch(() => {});
})();
