/* ==========================================================================================
   OB-1 on Cloudflare — the Worker.

   It does two jobs:
     1. serves the static app (dist/) on every route that isn't /api/*,
     2. implements the six perchance plugin APIs the app was written against, so src/app.js,
        src/transcribe.js, … run UNCHANGED:
          generateText  -> POST /api/text      (streaming; Workers AI by default)
          generateImage -> POST /api/image     (Workers AI FLUX by default)
          superFetch    -> POST /api/fetch     (CORS-free proxy)
          uploadPlugin  -> POST /api/upload    (StoreDO)  + /api/editable
          createServerSocket -> /api/tunnel    (TunnelDO, WebSocket)
          kv            -> handled entirely in the browser (IndexedDB) by public/ob1-shim.js

   Nothing here is moderated by a platform, nothing is logged to a third party, and no API key
   ever reaches the browser: the Deepgram key lives in a Worker secret and is injected here.
   ========================================================================================== */

import { TunnelDO } from "./tunnel-do.js";
import { StoreDO } from "./store-do.js";
export { TunnelDO, StoreDO };

const DEFAULT_TEXT_MODEL  = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const DEFAULT_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, accept",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS"
};

export default {
  async fetch(req, env, ctx){
    const url = new URL(req.url);

    /* Optional private-deploy gate. Set OBI_ACCESS_KEY and the site answers 404 to anyone
       without the key — including crawlers and anyone who guesses the workers.dev hostname.
       Visit https://…/?k=YOURKEY once; it plants a cookie and redirects to the clean URL. */
    if(env.OBI_ACCESS_KEY){
      const cookie = /(?:^|;\s*)obi_k=([^;]+)/.exec(req.headers.get("cookie") || "");
      const ok = (url.searchParams.get("k") === env.OBI_ACCESS_KEY) ||
                 (cookie && decodeURIComponent(cookie[1]) === env.OBI_ACCESS_KEY);
      if(!ok) return new Response("Not Found", { status: 404 });
      if(url.searchParams.get("k")){
        url.searchParams.delete("k");
        return new Response(null, { status: 302, headers: {
          location: url.pathname + (url.search || ""),
          "set-cookie": "obi_k=" + encodeURIComponent(env.OBI_ACCESS_KEY) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000"
        } });
      }
    }

    if(req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if(url.pathname.startsWith("/api/")) return api(req, env, ctx, url);
    if(url.pathname.startsWith("/f/")){
      const inner = new Request(new URL("/serve/" + url.pathname.slice(3), url.origin), { method: "GET" });
      return env.STORE.get(env.STORE.idFromName("files")).fetch(inner);
    }
    return env.ASSETS.fetch(req);
  }
};

async function api(req, env, ctx, url){
  const path = url.pathname;
  try{
    if(path === "/api/config")     return json(await config(env));
    if(path === "/api/text")       return await text(req, env, ctx);
    if(path === "/api/image")      return await image(req, env);
    if(path === "/api/fetch")      return await proxyFetch(req);
    if(path.startsWith("/api/deepgram")) return await deepgram(req, env, url);
    if(path === "/api/upload")     return store(env, "/put", req);
    if(path === "/api/delete")     return store(env, "/delete/" + encodeURIComponent(url.searchParams.get("key") || "") + "?token=" + encodeURIComponent(url.searchParams.get("token") || ""), req);
    if(path === "/api/editable")   return store(env, "/editable", req);
    if(path.startsWith("/api/editable/")){
      /* CGN builds perchance-shaped URLs (…/<generator>/<file>); accept those too, keep the file name. */
      const parts = path.slice("/api/editable/".length).split("/").filter(Boolean).map(decodeURIComponent);
      const name = parts.length > 1 ? parts.slice(1).join("/") : (parts[0] || "");
      return store(env, "/editable/" + encodeURIComponent(name), new Request(url.href, { method: "GET" }));
    }
    if(path === "/api/tunnel" || path === "/api/ws") return tunnel(env, req);
    return json({ ok:false, error:"unknown api route " + path }, 404);
  }catch(e){
    return json({ ok:false, error: String((e && e.message) || e) }, 500);
  }
}

const json = (v, status = 200) => new Response(JSON.stringify(v), {
  status, headers: { "content-type": "application/json; charset=utf-8", ...CORS }
});

function store(env, path, req){
  const inner = new Request("https://store.internal" + path, req);
  return env.STORE.get(env.STORE.idFromName("files")).fetch(inner);
}
function tunnel(env, req){
  const id = env.TUNNEL.idFromName("legion");
  return env.TUNNEL.get(id).fetch(req);
}

async function config(env){
  return { name: env.OBI_NAME || "obi-cf",
    text: true, image: true,
    stt: !!env.DEEPGRAM_API_KEY,
    sttProvider: env.DEEPGRAM_API_KEY ? "deepgram" : null,
    llm: env.LLM_BASE_URL ? "custom" : "workers-ai",
    imageModel: env.IMAGE_MODEL || DEFAULT_IMAGE_MODEL };
}

/* ------------------------------------- text ------------------------------------- */
/* Always answers as a stream of newline-delimited JSON: {"delta":"…"} lines, then {"done":true}. */

async function text(req, env, ctx){
  let p = {}; try{ p = await req.json(); }catch(e){}
  if(p.getMetaObject) return json({ ok:true, model: env.LLM_MODEL || DEFAULT_TEXT_MODEL, streaming:true });
  const instruction = String(p.instruction || "");
  if(!instruction.trim()) return json({ ok:false, error:"empty instruction" }, 400);
  const startWith = String(p.startWith || "");
  const stops = Array.isArray(p.stopSequences) ? p.stopSequences : [];
  const messages = [{ role: "user", content: instruction }];
  if(startWith) messages.push({ role: "assistant", content: startWith });

  const out = new TransformStream();
  const w = out.writable.getWriter();
  const enc = new TextEncoder();
  const emit = obj => w.write(enc.encode(JSON.stringify(obj) + "\n"));

  const pump = (async () => {
    try{
      if(env.LLM_BASE_URL){
        await streamOpenAI(env, messages, stops, emit);
      } else {
        await streamWorkersAI(env, messages, stops, emit);
      }
      await emit({ done: true });
    }catch(e){
      await emit({ error: String((e && e.message) || e) });
    }finally{
      try{ await w.close(); }catch(e){}
    }
  })();
  if(ctx && ctx.waitUntil) ctx.waitUntil(pump);
  return new Response(out.readable, { headers: {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-store", ...CORS } });
}

async function streamOpenAI(env, messages, stops, emit){
  const base = String(env.LLM_BASE_URL || "").replace(/\/+$/, "");
  const r = await fetch(base + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + (env.LLM_API_KEY || "") },
    body: JSON.stringify({ model: env.LLM_MODEL || "gpt-4o-mini", messages, stream: true, stop: stops.length ? stops : undefined })
  });
  if(!r.ok) throw new Error("upstream HTTP " + r.status + " " + (await r.text()).slice(0, 300));
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for(;;){
    const { done, value } = await reader.read();
    if(done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while((i = buf.indexOf("\n")) !== -1){
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if(!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if(data === "[DONE]") return;
      try{
        const j = JSON.parse(data);
        const d = j.choices && j.choices[0] && (j.choices[0].delta || j.choices[0].message);
        if(d && d.content) await emit({ delta: d.content });
      }catch(e){}
    }
  }
}

async function streamWorkersAI(env, messages, stops, emit){
  const model = env.LLM_MODEL || DEFAULT_TEXT_MODEL;
  const body = { messages, stream: true };
  if(stops.length) body.stop = stops;
  if(env.OBI_MAX_TOKENS) body.max_tokens = Number(env.OBI_MAX_TOKENS);
  const stream = await env.AI.run(model, body);
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for(;;){
    const { done, value } = await reader.read();
    if(done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while((i = buf.indexOf("\n")) !== -1){
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if(!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if(!data || data === "[DONE]") continue;
      try{ const j = JSON.parse(data); if(j.response) await emit({ delta: j.response }); }catch(e){}
    }
  }
}

/* ------------------------------------- image ------------------------------------ */

async function image(req, env){
  let p = {}; try{ p = await req.json(); }catch(e){}
  const prompt = String(p.prompt || "").trim();
  if(!prompt) return json({ ok:false, error:"empty prompt" }, 400);
  const negative = String(p.negativePrompt || "");
  const full = negative ? prompt + " | avoid: " + negative : prompt;
  const [w, h] = String(p.resolution || "1024x1024").split("x").map(n => Math.max(256, Math.min(1024, parseInt(n, 10) || 1024)));

  if(env.IMAGE_BASE_URL){
    const base = String(env.IMAGE_BASE_URL).replace(/\/+$/, "");
    const r = await fetch(base + "/images/generations", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + (env.IMAGE_API_KEY || "") },
      body: JSON.stringify({ model: env.IMAGE_MODEL || "gpt-image-1", prompt: full, size: w + "x" + h, n: 1 })
    });
    const j = await r.json();
    if(!r.ok) return json({ ok:false, error: (j && (j.error && j.error.message || j.error)) || ("HTTP " + r.status) }, 502);
    const d = (j.data && j.data[0]) || {};
    if(d.b64_json) return json({ dataUrl: "data:image/png;base64," + d.b64_json, prompt });
    if(d.url) return json({ dataUrl: await toDataUrl(d.url), prompt });
    return json({ ok:false, error:"no image in response" }, 502);
  }

  const model = env.IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
  const out = await env.AI.run(model, {
    prompt: full, width: w, height: h,
    num_steps: Number(env.IMAGE_STEPS || 4), seed: p.seed == null ? undefined : Number(p.seed)
  });
  let bytes = null, mime = "image/jpeg";
  if(out instanceof Uint8Array){ bytes = out; }
  else if(out instanceof ReadableStream || (out && typeof out.getReader === "function")){
    const chunks = []; const reader = out.getReader();
    for(;;){ const { done, value } = await reader.read(); if(done) break; chunks.push(value); }
    bytes = concat(chunks);
  } else if(out && out.image){
    return json({ dataUrl: "data:image/" + (out.image_format || "jpeg") + ";base64," + out.image, prompt });
  }
  if(!bytes) return json({ ok:false, error:"unexpected image response" }, 502);
  return json({ dataUrl: "data:" + mime + ";base64," + base64(bytes), prompt });
}

function concat(chunks){
  const n = chunks.reduce((a, c) => a + c.length, 0);
  const out = new Uint8Array(n); let o = 0;
  for(const c of chunks){ out.set(c, o); o += c.length; }
  return out;
}
function base64(bytes){
  let s = "";
  for(let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
async function toDataUrl(url){
  const r = await fetch(url);
  const b = new Uint8Array(await r.arrayBuffer());
  return "data:" + (r.headers.get("content-type") || "image/png") + ";base64," + base64(b);
}

/* ------------------------------------- proxy ------------------------------------ */
/* superFetch — read any URL from the edge, no CORS wall. */

async function proxyFetch(req){
  let p = {}; try{ p = await req.json(); }catch(e){}
  const target = String(p.url || "");
  if(!/^https?:\/\//i.test(target)) return json({ ok:false, error:"url must be absolute http(s)" }, 400);
  const r = await fetch(target, {
    method: p.method || "GET",
    headers: p.headers && typeof p.headers === "object" ? p.headers : {},
    body: p.body || undefined,
    redirect: "follow"
  });
  const headers = new Headers(CORS);
  const ct = r.headers.get("content-type");
  if(ct) headers.set("content-type", ct);
  headers.set("x-ob1-upstream-status", String(r.status));
  return new Response(r.body, { status: r.status, headers });
}

/* ------------------------------------ deepgram ---------------------------------- */
/* The browser thinks it is talking to api.deepgram.com. It is talking to us; the key is added
   here, server-side, so it never exists in the page, in storage, or in a URL. */

async function deepgram(req, env, url){
  if(!env.DEEPGRAM_API_KEY) return json({ ok:false, error:"no DEEPGRAM_API_KEY set on this Worker (wrangler secret put DEEPGRAM_API_KEY)" }, 501);
  const path = url.pathname.replace(/^\/api\/deepgram/, "") || "/v1/listen";
  const target = "https://api.deepgram.com" + path + url.search;
  const h = new Headers();
  h.set("authorization", "Token " + env.DEEPGRAM_API_KEY);
  const ct = req.headers.get("content-type"); if(ct) h.set("content-type", ct);
  const ac = req.headers.get("accept");       if(ac) h.set("accept", ac);
  if(env.DEEPGRAM_PROJECT) h.set("x-dg-project", env.DEEPGRAM_PROJECT);
  const init = { method: req.method, headers: h, redirect: "follow" };
  if(req.method !== "GET" && req.method !== "HEAD") init.body = req.body;
  const r = await fetch(target, init);
  const out = new Headers(CORS);
  const rct = r.headers.get("content-type");
  out.set("content-type", rct || "application/json");
  return new Response(r.body, { status: r.status, headers: out });
}
