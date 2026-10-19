/* ============================================================================
   PRÄIS VAULT — src/vault.js
   One place for every secret the empire runs on. Command: /vault

   THREE LAYERS — that is the whole idea:
     L1 LOCAL   this browser, localStorage "obi_keys". Instant, private, never
                shipped, never logged, never captured (a secret-bearing command
                is masked before it reaches the soul ledger or the I-LOG).
     L2 CANON   the ONE authority repo (Phoenix-Rising-Ai-Solutions/
                OB-1--Authoritative-, branch master — where GOSPEL-999, the
                Legionnaire Field Guide and the I-LOGs live). Values are SEALED
                with the vault's public key (secret-plugin, ML-KEM / FIPS 203)
                BEFORE they touch git, so the repo can hold them in the open.
                Only the private key — the crown jewel, in this browser — opens
                them. A leaked repo leaks nothing.
     L3 LIVE    the service itself. Every row can be TESTED with a real call:
                Deepgram, GitHub, Cloudflare, DeepSeek, the net-pet-ai worker,
                and the vault worker.

   The vault NEVER prints a secret — it prints a fingerprint (first4…last4 · len).
   Fail closed: a value that fails its own test is reported, never dressed up.
   ========================================================================== */
(function(){
  "use strict";

  const LS = "obi_keys";
  const VAULT_DIR = "OPERATIONS/VAULT";
  const BRANCH = "master";
  const PATH = {
    sealed:   VAULT_DIR + "/prais-vault.sealed.txt",  /* the values, sealed (L2) */
    pub:      VAULT_DIR + "/prais-vault.pub",         /* the public key, safe in the open */
    escrow:   VAULT_DIR + "/prais-vault.key.escrow.json", /* the PRIVATE key, wrapped in a passphrase (L2.5) */
    manifest: VAULT_DIR + "/SECRETS-MANIFEST.md",     /* what is needed, never the values */
    sov100:   "APPS/SOV100-VAULT",                    /* the vault app already on the canon */
    canonMan: "APPS/NET-PET-AI/SECRETS-MANIFEST.md"   /* the canon's own secrets manifest */
  };

  /* WHAT THE EMPIRE RUNS ON — the canon's own SECRETS-MANIFEST (ACTIVE KEYS),
     plus the two tokens this station itself needs to reach the canon and the fleet. */
  const NEEDED = [
    { local:"deepgram",  name:"DEEPGRAM_API_KEY",    svc:"Deepgram",    where:"net-pet-ai worker secret · /api/stt/key",
      why:"the ear — video/audio → verbatim transcript, any length, split at pauses and stitched back" },
    { local:"gh",        name:"GITHUB_TOKEN",        svc:"GitHub",      where:"this browser only",
      why:"the canon — doctrine, sessions, the I-LOG chain, and this vault" },
    { local:"cf",        name:"CLOUDFLARE_API_TOKEN",svc:"Cloudflare",  where:"this browser only · the `nameless-feather-3545` token (full permissions) · /vault set cf <token>",
      why:"the fleet — workers, deploys, secret rotation, Pages, and the R2 store; proven by /accounts/<id>/tokens/verify (an account-owned token is rejected by /user/tokens/verify even when valid) and then by listing the account's worker scripts, with R2 reported as its own separate fact" },
    { local:"cfAcct",    name:"CLOUDFLARE_ACCOUNT_ID",svc:"Cloudflare", where:"this browser only · the account the token is scoped to (it is the S3 endpoint's subdomain)",
      why:"every fleet call is addressed through the account id — fleet status, deploys, and the R2 endpoint https://<account>.r2.cloudflarestorage.com" },
    { local:"cfR2Key",   name:"CLOUDFLARE_R2_ACCESS_KEY_ID",svc:"Cloudflare R2", where:"this browser only · S3-compatible access key id — created at R2 → Manage R2 API Tokens (NOT the API token's own id)",
      why:"the empire's own object store (R2 speaks the S3 API) — half of the signing pair; useless without the secret below. ⚠ AUDIT 2026-09-21, RE-MEASURED: as stored, this value EQUALS the Cloudflare API token's id (122c79ce…) — i.e. it was pasted from the wrong place; an R2 S3 key is a separate credential created at R2 → Manage R2 API Tokens. R2's own state is UNPROVEN from here: through the station's proxy the buckets endpoint answers 400 code 9106 (the Authorization header does not reach it), so R2 cannot be called enabled OR disabled — it has to be checked in the Cloudflare dashboard" },
    { local:"cfR2Secret",name:"CLOUDFLARE_R2_SECRET_ACCESS_KEY",svc:"Cloudflare R2", where:"this browser only · shown once, at R2 API token creation",
      why:"signs every R2 S3 request (AWS SigV4). Proven by a real presigned ListBuckets through the station's proxy — header-signing cannot work here because the proxy strips x-amz-content-sha256" },
    { local:"deepseek",  name:"DEEPSEEK_API_KEY",    svc:"DeepSeek",    where:"net-pet-ai worker secret",
      why:"the brain fallback (chat / lesson / practice / feedback)" },
    { local:"sovereign", name:"SOVEREIGN_KEY",       svc:"net-pet-ai",  where:"net-pet-ai worker secret",
      why:"the worker's admin routes (X-Admin-Key)" },
    { local:"vaultkey",  name:"SOV100_VAULT_KEY",    svc:"sov100-vault-v0", where:"the vault worker's own gate",
      why:"the vault itself — every route answers 401 until this is armed; the scheme is in APPS/SOV100-VAULT/README.md" }
  ];
  /* the canon's FUTURE KEYS — named here so nothing is invented twice later. */
  const PLANNED = [
    ["STRIPE_SECRET_KEY","Stripe","payments"], ["STRIPE_WEBHOOK_SECRET","Stripe","payment verification"],
    ["RESEND_API_KEY","Resend","email notifications"], ["JUSTCALL_API_KEY","JustCall","OBI voice coach"],
    ["ZAPIER_API_KEY","Zapier","automation"], ["ANALYTICS_KEY","Amplitude / Mixpanel","analytics"]
  ];

  /* ------------------------------ the store ------------------------------- */
  function all(){ try{ return JSON.parse(localStorage.getItem(LS) || "{}") || {}; }catch(e){ return {}; } }
  function get(k){ const v = all()[k]; return (typeof v === "string" && v) ? v : null; }
  function put(obj){ try{ localStorage.setItem(LS, JSON.stringify(Object.assign({}, all(), obj))); return true; }catch(e){ return false; } }
  function del(k){ const a = all(); delete a[k]; try{ localStorage.setItem(LS, JSON.stringify(a)); return true; }catch(e){ return false; } }
  function fp(v){ if(!v) return "(none)"; return v.slice(0,4) + "…" + v.slice(-4) + " · len " + v.length; }
  function rowOf(local){ for(const r of NEEDED) if(r.local === local || r.local.toLowerCase() === String(local || "").toLowerCase()) return r; return null; }
  function keyPair(){ const pub = get("vaultPub"), priv = get("vaultPriv"); return (pub && priv) ? { pub: pub, priv: priv } : null; }
  function armed(){ try{ return !!(window.omegaStatusText && window.omegaStatusText().armed); }catch(e){ return false; } }
  function bubble(html, meta){
    if(typeof window.addBubble === "function") window.addBubble("ass", html, meta);
    else console.log("[vault]", html);
  }
  function E(s){ return (typeof window.esc === "function") ? window.esc(s) : String(s == null ? "" : s); }
  function log(o){ try{ if(typeof window.logOp === "function") window.logOp(o); }catch(e){} }
  function dna(line){ try{ if(typeof window.rrlAppend === "function") window.rrlAppend(window.runNoOf ? window.runNoOf() : null, "DNA", line); }catch(e){} }

  /* ---------------------------------------------------------------------------
     THE ESCROW — so the crown jewel is never a single point of failure.

     The private key used to live in exactly ONE place: this browser's
     localStorage. Wipe the storage, lose the machine, open the station
     elsewhere — and the sealed blob on the canon became unreadable FOREVER.
     That is an unacceptable design for the only copy of the only key.

     So the private key is ALSO wrapped in a passphrase the sovereign holds
     (PBKDF2-SHA256, 310k iterations → AES-256-GCM) and the wrapped copy is
     published in TWO independent places:

       · the canon  — OPERATIONS/VAULT/prais-vault.key.escrow.json  (private repo)
       · a mirror on the upload host — reachable with ONLY its URL + the phrase

     Both copies are useless without the passphrase, so publishing them costs
     nothing. Neither is a single point of failure: the browser can die, the
     PAT can be lost, GitHub can be down — /vault recover still returns the
     key from the other side with the passphrase alone.

     The passphrase is NEVER stored, echoed, logged, sealed or committed. Only
     a fingerprint of the wrapped blob is ever shown.
     ------------------------------------------------------------------------- */
  const ESCROW_ITER = 310000;
  function b64u(bytes){ let s = ""; const b = (bytes instanceof Uint8Array) ? bytes : new Uint8Array(bytes); for(let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
  function unb64u(txt){ const bin = atob(String(txt || "")); const u = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function subtle(){ try{ return (typeof crypto !== "undefined" && crypto.subtle) ? crypto.subtle : null; }catch(e){ return null; } }
  async function deriveKey(pass, salt, iter){
    const s = subtle(); if(!s) throw new Error("this browser cannot derive keys (crypto.subtle is unavailable — needs https)");
    const base = await s.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
    return await s.deriveKey({ name:"PBKDF2", salt:salt, iterations:iter || ESCROW_ITER, hash:"SHA-256" }, base, { name:"AES-GCM", length:256 }, false, ["encrypt", "decrypt"]);
  }
  async function sha256hex(s){ const b = await subtle().digest("SHA-256", new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join(""); }
  function escrowMeta(){ const a = all(); return { at:a.vaultEscrowAt || null, url:a.vaultEscrowUrl || null, fp:a.vaultEscrowFp || null, name:a.vaultEscrowName || null,
    escrowJson:a.vaultEscrowJson || null, sealedUrl:a.vaultSealedUrl || null, recoveryUrl:a.vaultRecoveryUrl || null, ptrUrl:a.vaultPtrUrl || null }; }

  /* ===================== THE DURABLE POINTER (L2.7) =========================
     THE FAULT THIS FIXES, in our own words (MASTERMIND-SYNC 2026-09-23): "the
     escrow copy on the canon needs a git token first, and the mirror URL lived in
     the old origin's store". We built the escrow correctly and then wrote its
     ADDRESS into localStorage — the one store a rename destroys. The ciphertext
     survived in three places; the pointer to it survived in none.

     This lane is the pointer. `keyvalue.immanuel.co` is open to write with a
     caller-chosen key, readable with no account and no token, and tied to NO
     origin — so it outlives a rename, a wiped browser, a new machine and a new
     agent. It holds the recovery bundle's URL and nothing else; the bundle is
     ciphertext, so publishing the address costs nothing. Written to fit the
     measured URL ceiling, and a write is only believed after reading it back. */
  const PTR_NS = "prais-agent99", PTR_KEY = "v", PTR_CEILING = 278;
  const ptrGetUrl = () => "https://keyvalue.immanuel.co/api/KeyVal/GetValue/" + PTR_NS + "/" + PTR_KEY;
  const ptrSetUrl = (v) => "https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/" + PTR_NS + "/" + PTR_KEY + "/" + v;
  /* THE URL CANNOT RIDE RAW. Measured on this store, twice: a value written into the
     URL PATH is rejected with HTTP 404 the moment it carries a `.` (the server reads
     it as a file extension) — and a percent-encoded URL 404s too, because `%` is not
     in the accepted alphabet either. `freewire.js` hit the same wall and solved it by
     never putting anything but `[A-Za-z0-9_-]` in the path. So the address is carried
     as base64url: measured end to end, write 200 → read back identical → decodes to
     the exact URL, 158 characters of URL against the 278 ceiling. A raw value is still
     accepted on read, so an older pointer is not made unreadable by this change. */
  function ptrEnc(s){ return btoa(unescape(encodeURIComponent(String(s)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
  function ptrDec(s){
    const t = String(s || "");
    if(!/^[A-Za-z0-9_-]+$/.test(t)) return t;
    try{ const d = decodeURIComponent(escape(atob(t.replace(/-/g,"+").replace(/_/g,"/")))); return /^https?:\/\//i.test(d) ? d : t; }catch(e){ return t; }
  }
  async function ptrRead(){
    try{
      const r = await sf(ptrGetUrl());
      /* MEASURED: an UNWRITTEN key answers 200 with an empty body, but a key written
         EMPTY answers HTTP 500 — so 500 is read as "no address here", not as a fault,
         and the placeholder `-` (freewire's own word for "not known from here") reads
         the same way. Both are honest empty states, not errors dressed as answers. */
      if(!r || (r.status !== 200 && r.status !== 500)) return { ok:false, status:(r && r.status) || 0, why:"the pointer store answered HTTP " + ((r && r.status) || "nothing"), url:ptrGetUrl() };
      let val = String(r.txt || "");
      try{ const j = JSON.parse(val); if(typeof j === "string") val = j; }catch(e){}
      val = val.trim().replace(/^"|"$/g, "");
      if(!val || val === "-") return { ok:false, status:r.status, empty:true, value:"", raw:val,
        why:"the pointer holds no address (" + (!val ? "empty" : "`-`") + ") — no escrow has been published from this line, or the last one was cleared", url:ptrGetUrl() };
      const decoded = ptrDec(val);
      return { ok:!!decoded, status:r.status, value:decoded, raw:val, url:ptrGetUrl() };
    }catch(e){ return { ok:false, why:String((e && e.message) || e).slice(0, 90), url:ptrGetUrl() }; }
  }
  async function ptrWrite(value){
    const v = String(value || "").trim();
    if(!/^https?:\/\//i.test(v)) return { ok:false, why:"the pointer must be an http(s) URL — got " + (v ? "a non-URL" : "nothing") };
    const wire = ptrEnc(v);
    const fit = ptrSetUrl(wire).length;
    if(fit > PTR_CEILING) return { ok:false, why:"the pointer does not fit the measured ceiling: " + fit + " chars against " + PTR_CEILING + ". Nothing was sent." };
    try{
      const r = await sf(ptrSetUrl(wire), { method:"POST" });
      if(!r || r.status !== 200) return { ok:false, why:"the pointer store refused: HTTP " + ((r && r.status) || "nothing") };
      /* A WRITE IS NOT PROVEN BY ITS OWN 200 — it is proven by reading it back. */
      const back = await ptrRead();
      const ok = !!(back.ok && back.value === v);
      return { ok:ok, readback:(back && back.value) || null, url:ptrGetUrl(), wire:wire.length,
        why: ok ? null : "the store accepted the write but did not return the same bytes — treated as NOT written" };
    }catch(e){ return { ok:false, why:"the pointer could not be written: " + String((e && e.message) || e).slice(0, 90) }; }
  }
  /* clearing is a WRITE of the placeholder, not a delete: writing an empty value makes
     this store answer 500 on every later read (measured), which would dress a healthy
     "nothing here" as a fault. `-` is the honest empty, and it reads back as empty. */
  async function ptrClear(){
    try{
      const r = await sf(ptrSetUrl("-"), { method:"POST" });
      if(!r || r.status !== 200) return { ok:false, why:"the pointer store refused the clear: HTTP " + ((r && r.status) || "nothing") };
      const back = await ptrRead();
      return { ok:!(back && back.ok), readback:"-", why:(back && back.ok) ? "the clear did not take — the pointer still holds an address" : null };
    }catch(e){ return { ok:false, why:"the pointer could not be cleared: " + String((e && e.message) || e).slice(0, 90) }; }
  }

  /* THE RECOVERY BUNDLE — one file that carries the WHOLE disaster plan: the wrapped
     private key AND the sealed secrets beside it. With the escrow alone, a machine
     that has never seen this station still needs a GitHub token to read the sealed
     blob off the canon; with the bundle, the passphrase plus ONE url rebuilds every
     key in the empire. Both halves are ciphertext, so publishing it costs nothing:
     without the passphrase it is 8 KB of noise, and the passphrase is stored nowhere. */
  function recoveryDoc(escrowDoc, sealedText){
    return { v:1, kind:"prais-vault-recovery",
      escrow:escrowDoc || null, sealed:sealedText || null,
      pub:(escrowDoc && escrowDoc.pub) || get("vaultPub") || null,
      station:window.generatorName || null, iso:new Date().toISOString(),
      note:"PrAis Vault recovery bundle — the private key wrapped in the sovereign's passphrase, with the sealed secrets beside it. Useless without the passphrase. Open with /vault recover <passphrase> <thisUrl>." };
  }
  /* the two shapes /vault recover must accept, so an escrow-only mirror published by
     an earlier build keeps working: a bare escrow document, or the bundle. */
  function fromBundle(obj){
    if(!obj || typeof obj !== "object") return null;
    if(obj.kind === "prais-vault-escrow") return { doc:obj, sealed:null };
    if(obj.kind === "prais-vault-recovery" && obj.escrow && obj.escrow.kind === "prais-vault-escrow")
      return { doc:obj.escrow, sealed:(typeof obj.sealed === "string" && obj.sealed) ? obj.sealed : null };
    return null;
  }
  async function fetchText(u){
    try{ const r = await fetch(u); const t = await r.text(); if(t) return t; }catch(e){}
    try{ const r = await root.superFetch(u); const t = await r.text(); if(t) return t; }catch(e){}
    return null;
  }
  /* publish one immutable file and PROVE it reads back before we claim it exists */
  async function publish(text){
    try{
      const up = root.uploadPlugin;
      if(!up) return { url:null, note:"the upload-plugin is not loaded, so no mirror was published" };
      const r = await up(text);
      if(r && r.error) return { url:null, note:"the upload host refused it: " + r.error };
      const url = (r && r.url) || null;
      if(!url) return { url:null, note:"the upload host returned no url" };
      const back = await fetchText(url);
      return { url:url, note:(back && back.length) ? "" : "published, but could not be read back — treat it as unverified" };
    }catch(e){ return { url:null, note:"the mirror could not be published: " + String((e && e.message) || e).slice(0, 90) }; }
  }
  /* refresh the mirrors that a no-token machine needs. Called by /vault push, which
     is the command that changes what the sealed blob contains. */
  async function mirrorSealed(sealedText){
    const sb = { url:null, note:"" };
    const m = await publish(sealedText);
    sb.url = m.url; sb.note = m.note;
    if(m.url) put({ vaultSealedUrl:m.url });
    let rec = { url:null, note:"no escrow yet — /vault escrow <passphrase> publishes the one-URL bundle" };
    try{
      const ej = escrowMeta().escrowJson;
      if(ej){
        rec = await publish(JSON.stringify(recoveryDoc(JSON.parse(ej), sealedText)));
        if(rec.url) put({ vaultRecoveryUrl:rec.url });
      }
    }catch(e){ rec = { url:null, note:"the bundle could not be refreshed: " + String((e && e.message) || e).slice(0, 80) }; }
    /* a refreshed bundle gets a NEW url, so the durable pointer is re-aimed — the
       pointer must never be left pointing at a superseded file. */
    let ptr = { ok:false, why:"no bundle url to point at" };
    if(rec.url) ptr = await ptrWrite(rec.url);
    if(ptr.ok) put({ vaultPtrUrl:rec.url, vaultPtrAt:new Date().toISOString() });
    return { sealed:sb, recovery:rec, pointer:ptr };
  }
  async function wrapPriv(pass, priv, pub){
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pass, salt, ESCROW_ITER);
    const ct = await subtle().encrypt({ name:"AES-GCM", iv:iv }, key, new TextEncoder().encode(priv));
    return { v:1, kind:"prais-vault-escrow", alg:"PBKDF2-SHA256=" + ESCROW_ITER + " · AES-256-GCM", iter:ESCROW_ITER,
      salt:b64u(salt), iv:b64u(iv), ct:b64u(ct), pub:pub || null,
      station:window.generatorName || null, iso:new Date().toISOString(),
      note:"The Prais Vault private key, wrapped in the sovereign's passphrase. Useless without it. Open with /vault recover <passphrase>. The passphrase is never stored anywhere." };
  }
  async function unwrapPriv(doc, pass){
    const key = await deriveKey(pass, unb64u(doc.salt), doc.iter || ESCROW_ITER);
    const pt = await subtle().decrypt({ name:"AES-GCM", iv:unb64u(doc.iv) }, key, unb64u(doc.ct));
    return new TextDecoder().decode(pt);
  }
  async function escrowDocFromCanon(){
    if(!get("gh")) return null;
    const got = await ghRead(PATH.escrow);
    if(got.status !== 200) return null;
    const t = decode(got.j);
    try{ const d = JSON.parse(t); return (d && d.kind === "prais-vault-escrow") ? d : null; }catch(e){ return null; }
  }
  async function fetchEscrow(urlOpt){
    /* an explicit URL wins — that is the path a machine with NO storage and NO token
       must take, and it may be either shape (a bare escrow document, or the bundle). */
    if(urlOpt){
      const t = await fetchText(urlOpt);
      if(!t) return { err:"could not fetch " + urlOpt + " — check the URL (it must be the whole link, and the file must still be there)" };
      if(t.charAt(0) !== "{") return { err:"the URL did not return a JSON document" };
      return { src:"mirror", where:urlOpt, text:t };
    }
    /* THE DURABLE POINTER — read before the canon, because it is the only lane that
       needs NOTHING: no token, no stored state, no URL from anyone. This is what
       makes "the passphrase is the reliable half" actually true. */
    const ptr = await ptrRead();
    if(ptr.ok && /^https?:\/\//i.test(ptr.value)){
      const text = await fetchText(ptr.value);
      if(text && text.charAt(0) === "{") return { src:"pointer", where:ptr.value, text:text };
    }
    const fromCanon = await escrowDocFromCanon();
    if(fromCanon) return { src:"canon", where:PATH.escrow, doc:fromCanon };
    const m = escrowMeta();
    /* prefer the bundle: it is the one that carries the sealed secrets too */
    const tries = [[m.recoveryUrl, "the recovery bundle"], [m.url, "the escrow mirror"]];
    for(const t of tries){
      if(!t[0]) continue;
      const text = await fetchText(t[0]);
      if(text && text.charAt(0) === "{") return { src:"mirror", where:t[0], text:text };
    }
    return { err:"no escrow is reachable. The durable pointer (L2.7) answered " + (ptr.ok ? ("\u201c" + ptr.value.slice(0, 60) + "\u201d, but that address did not return a document") : "nothing (\u201c" + (ptr.why || "empty") + "\u201d)") + "; the canon copy needs a GitHub token in this browser" + (get("gh") ? " (a token is present, so the canon file is simply not there yet — run /vault escrow <passphrase>)" : " (none stored)") + ", and this browser knows no mirror URL — pass one: /vault recover <passphrase> <url>" };
  }

  /* ---------------------------- live access tests -------------------------- */
  async function sf(url, opts){
    try{ const r = await root.superFetch(url, opts || {}); const t = await r.text(); let j = null; try{ j = JSON.parse(t); }catch(e){}
      return { status:r.status, j:j, txt:t }; }
    catch(e){ return { status:0, err:String((e && e.message) || e).slice(0, 120) }; }
  }
  const HOSTS = {
    deepgram: "https://api.deepgram.com",
    netpet:   "https://net-pet-ai.mrmichaelhobbs123.workers.dev",
    vault:    "https://sov100-vault-v0.mrmichaelhobbs123.workers.dev"
  };
  /* ------------------------- the R2 (S3) signer ---------------------------
     R2 speaks S3, so the credential pair is proven the only way S3 credentials
     can be proven: by signing a request. AWS SigV4 in the browser with WebCrypto;
     the response travels through the station's proxy because the R2 S3 endpoint
     answers no CORS preflight (a plain fetch would fail before the key was tested,
     which would be a lie about the key). */
  function r2Host(){ const a = get("cfAcct"); return a ? (a + ".r2.cloudflarestorage.com") : null; }
  async function hmac256(keyBytes, msg){
    const k = await subtle().importKey("raw", keyBytes, { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
    return new Uint8Array(await subtle().sign("HMAC", k, new TextEncoder().encode(msg)));
  }
  function hexOf(bytes){ return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(""); }
  function amzStamp(d){
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  async function r2Test(){
    const id = get("cfR2Key"), secret = get("cfR2Secret"), host = r2Host();
    if(!host) return { ok:false, detail:"no CLOUDFLARE_ACCOUNT_ID stored — the S3 endpoint is built from it (/vault set cfAcct <accountId>)" };
    if(!id || !secret) return { ok:false, detail:"the R2 pair is incomplete — both the access key id and the secret are needed (/cf r2 <accessKeyId> <secret>)" };
    if(!subtle()) return { ok:false, detail:"this browser cannot sign (crypto.subtle is unavailable — needs https)" };
    const now = new Date(), amz = amzStamp(now), date = amz.slice(0, 8);
    const region = "auto", service = "s3";
    const scope = date + "/" + region + "/" + service + "/aws4_request";
    /* PRESIGNED-URL SigV4 (query auth), NOT header auth.
       AUDIT 2026-09-21 (pipeline): the header-signed version could never work through this
       station's proxy, because the proxy STRIPS the `x-amz-content-sha256` header — measured
       directly: httpbin through superFetch echoed `X-Amz-Date` but no `X-Amz-Content-Sha256`,
       and R2 answered "Missing x-amz-content-sha256". A signed S3 request needs that header,
       so the proof was impossible, not the key wrong. With query-string auth the credential
       and the signature travel in the URL, and only `host` is signed — nothing the proxy can
       strip. This is the standard "presigned URL" flow and R2 accepts it. */
    const q = [
      "X-Amz-Algorithm=AWS4-HMAC-SHA256",
      "X-Amz-Credential=" + encodeURIComponent(id + "/" + scope),
      "X-Amz-Date=" + amz,
      "X-Amz-Expires=120",
      "X-Amz-SignedHeaders=host"
    ].join("&");
    const canonical = ["GET", "/", q, "host:" + host, "", "host", "UNSIGNED-PAYLOAD"].join("\n");
    const stringToSign = ["AWS4-HMAC-SHA256", amz, scope, hexOf(await subtle().digest("SHA-256", new TextEncoder().encode(canonical)))].join("\n");
    let k = await hmac256(new TextEncoder().encode("AWS4" + secret), date);
    k = await hmac256(k, region); k = await hmac256(k, service); k = await hmac256(k, "aws4_request");
    const signature = hexOf(await hmac256(k, stringToSign));
    const r = await sf("https://" + host + "/?" + q + "&X-Amz-Signature=" + signature, { method:"GET" });
    if(r.status === 200){
      const names = []; const re = /<Name>([^<]+)<\/Name>/g; let m;
      while((m = re.exec(String(r.txt || ""))) && names.length < 30) names.push(m[1]);
      return { ok:true, detail:"R2 accepted the presigned S3 request (HTTP 200)" + (names.length ? " · " + names.length + " bucket(s): " + names.join(", ") : " · no buckets in this account yet") };
    }
    let why = ""; try{ const m = String(r.txt || "").match(/<Message>([^<]+)<\/Message>/); if(m) why = " — " + m[1]; }catch(e){}
    if(!why) try{ const j = r.j; if(j && j.errors && j.errors[0] && j.errors[0].message) why = " — " + j.errors[0].message; }catch(e){}
    return { ok:false, detail:"R2 refused the presigned request (HTTP " + r.status + ")" + why + (r.err ? " — " + r.err : "") };
  }
  const TESTS = {
    deepgram: async v => {
      const r = await sf(HOSTS.deepgram + "/v1/projects", { headers:{ Authorization:"Token " + v } });
      if(r.status === 200){ const n = (r.j && r.j.projects && r.j.projects.length) || 0;
        return { ok:true, detail:"api.deepgram.com accepted the key · " + n + " project(s)" }; }
      return { ok:false, detail:"Deepgram refused it (HTTP " + r.status + ")" + ((r.j && r.j.err_msg) ? " — " + r.j.err_msg : "") + (r.err ? " — " + r.err : "") };
    },
    /* GitHub is tested in FULL, not just "does /user answer": identity, the scopes
       the token actually carries, whether the ONE authority repo can be read, and
       whether it can be WRITTEN. A read-only token that answers /user would pass a
       shallow test and then fail at the first /vault push — so we check the whole
       path here. */
    gh: async v => {
      const H = { Authorization:"Bearer " + v, Accept:"application/vnd.github+json" };
      let r;
      try{ r = await fetch("https://api.github.com/user", { headers:H }); }
      catch(e){ return { ok:false, detail:"fetch failed: " + String((e && e.message) || e).slice(0, 90) }; }
      if(r.status !== 200){ const j = await r.json().catch(() => null);
        return { ok:false, detail:"GitHub refused it (HTTP " + r.status + ")" + ((j && j.message) ? " — " + j.message : "") }; }
      const u = await r.json().catch(() => null);
      const scopes = String(r.headers.get("x-oauth-scopes") || "");
      const list = scopes.split(/\s*,\s*/).filter(Boolean);
      const R = (window.ObiILog && window.ObiILog.REPO) || {};
      let canon = null;
      try{
        const rr = await fetch("https://api.github.com/repos/" + R.owner + "/" + R.repo, { headers:H });
        const rj = await rr.json().catch(() => null);
        if(rr.status !== 200) return { ok:false, detail:"authenticated as @" + (u && u.login) + " but the canon could not be read (HTTP " + rr.status + ")" + ((rj && rj.message) ? " — " + rj.message : "") + " — the token has no access to " + R.owner + "/" + R.repo };
        const p = (rj && rj.permissions) || {};
        canon = { private:!!(rj && rj.private), branch:(rj && rj.default_branch) || "?", push:!!p.push, admin:!!p.admin, pull:!!p.pull };
      }catch(e){ return { ok:false, detail:"authenticated as @" + (u && u.login) + " but the canon read failed: " + String((e && e.message) || e).slice(0, 90) }; }
      const full = list.indexOf("repo") >= 0;
      const power = [];
      if(list.indexOf("repo") >= 0) power.push("repo");
      if(list.indexOf("delete_repo") >= 0) power.push("delete_repo");
      if(list.indexOf("admin:org") >= 0) power.push("admin:org");
      if(list.indexOf("workflow") >= 0) power.push("workflow");
      if(list.indexOf("gist") >= 0) power.push("gist");
      const extra = " · " + (canon.push ? (canon.admin ? "ADMIN" : "write") : "read-only") + " on " + R.owner + "/" + R.repo + " (private:" + canon.private + ", " + canon.branch + ")";
      log({ kind:"secret", action:"vault test gh (deep)", ok:true, detail:"identity + scopes + canon read + write permission (value never logged)", result:"@" + (u && u.login) + " · " + power.join("+") });
      return { ok:true, login:(u && u.login), scopes:list,
        detail:"@" + (u && u.login) + " · " + (full ? "full-access token" : "limited (no `repo` scope)") + " · " + list.length + " scopes" + extra,
        extra:{ login:(u && u.login), scopes:list, canon:canon } };
    },
    cf: async v => {
      /* AUDIT 2026-09-21 (pipeline): this test hit ONLY /user/tokens/verify — the endpoint for
         USER-owned tokens. An ACCOUNT-owned token (the kind created under an account) is
         rejected there with "Invalid API Token" even when it is valid and active, so a working
         token was reported dead. The account endpoint is the authority for an account token, so
         it is tried FIRST now, and the user endpoint is the fallback. */
      const id = get("cfAcct");
      let r = null, via = null;
      if(id){
        r = await sf("https://api.cloudflare.com/client/v4/accounts/" + id + "/tokens/verify", { headers:{ Authorization:"Bearer " + v } });
        if(r.j && r.j.success) via = "account endpoint";
      }
      if(!(r && r.j && r.j.success)){
        const u = await sf("https://api.cloudflare.com/client/v4/user/tokens/verify", { headers:{ Authorization:"Bearer " + v } });
        if(u.j && u.j.success){ r = u; via = "user endpoint"; }
        else r = u;   /* when neither works, the user endpoint's reason is the one to report */
      }
      if(!(r.j && r.j.success)) return { ok:false, detail:"Cloudflare refused it (HTTP " + r.status + ")" + ((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) ? " — " + r.j.errors[0].message : "") + (id ? "" : " · (no account id stored — /vault set cfAcct <accountId>, an account-owned token is verified AT the account)") + (r.err ? " — " + r.err : "") };
      /* deeper than "the token is active": name the account and count the fleet it opens.
         These are the two calls the pipeline actually makes, so a token that answers
         /verify but cannot list workers is reported as partial, not as verified. */
      const bits = ["token " + ((r.j.result && r.j.result.status) || "active") + (via ? " (via the " + via + ")" : "")];
      const tokenId = (r.j.result && r.j.result.id) || null;
      if(id){
        const b = await sf("https://api.cloudflare.com/client/v4/accounts/" + id + "/r2/buckets", { headers:{ Authorization:"Bearer " + v } });
        bits.push(b.j && b.j.success ? (((b.j.result && b.j.result.buckets) || []).length + " R2 bucket(s)") : ("R2 refused (HTTP " + b.status + ")"));
        const w = await sf("https://api.cloudflare.com/client/v4/accounts/" + id + "/workers/scripts", { headers:{ Authorization:"Bearer " + v } });
        bits.push(w.j && w.j.success ? ((w.j.result || []).length + " worker(s)") : ("workers refused (HTTP " + w.status + ")"));
      } else bits.push("no account id stored, so only the token itself is proven — /vault set cfAcct <accountId>");
      /* the R2 S3 pair is a DIFFERENT credential from a Cloudflare API token. If the stored
         "access key id" is the API token's own id, it was pasted from the wrong place and the
         signature can never match — say so instead of letting /cf r2 fail for no stated reason. */
      if(tokenId && get("cfR2Key") && get("cfR2Key") === tokenId)
        bits.push("⚠ the stored R2 access key id IS this API token's id (" + tokenId.slice(0,6) + "…) — an R2 S3 key is a separate credential (R2 → Manage R2 API Tokens), so `/cf r2` cannot sign with it");
      return { ok:true, detail:bits.join(" · ") };
    },
    cfAcct: async v => {
      /* AUDIT 2026-09-21 (pipeline): this test proved the account ONLY by listing R2 buckets. On
         an account where R2 has not been enabled that answers 403 "Please enable R2 through the
         Cloudflare Dashboard" — which is NOT the account being unreadable (and a flaky proxy
         turned it into a bare 400 "Missing X-Auth-Key…", which is doubly misleading). The
         account is now proven by listing worker scripts, and R2 is reported as its own fact. */
      const t = get("cf");
      if(!t) return { ok:false, detail:"the Cloudflare token is not stored locally — /vault set cf <token>" };
      const H = { Authorization:"Bearer " + t };
      const w = await sf("https://api.cloudflare.com/client/v4/accounts/" + v + "/workers/scripts", { headers:H });
      if(!(w.j && w.j.success)) return { ok:false, detail:"the account could not be read (HTTP " + w.status + ")" + ((w.j && w.j.errors && w.j.errors[0] && w.j.errors[0].message) ? " — " + w.j.errors[0].message : "") + (w.err ? " — " + w.err : "") };
      const b = await sf("https://api.cloudflare.com/client/v4/accounts/" + v + "/r2/buckets", { headers:H });
      const r2 = (b.j && b.j.success)
        ? (((b.j.result && b.j.result.buckets) || []).length + " R2 bucket(s)")
        : ("R2 NOT USABLE — " + ((b.j && b.j.errors && b.j.errors[0] && b.j.errors[0].message) || ("HTTP " + b.status)));
      return { ok:true, detail:"account " + v + " opens — " + ((w.j.result || []).length) + " worker(s) · endpoint https://" + v + ".r2.cloudflarestorage.com · " + r2 };
    },
    /* THE R2 S3 PROOF — a real AWS SigV4 request, signed in this browser with WebCrypto.
       Listing the buckets is the credential pair's own proof: the signature either
       matches what R2 recomputes or it does not, and nothing can be dressed up.
       Routed through the station's proxy because the R2 S3 endpoint sends no CORS
       headers — a plain browser fetch would die at the wall before any key was tested. */
    cfR2Key:   async () => await r2Test(),
    cfR2Secret: async () => await r2Test(),
    deepseek: async v => {
      const r = await sf("https://api.deepseek.com/models", { headers:{ Authorization:"Bearer " + v } });
      if(r.status === 200) return { ok:true, detail:"api.deepseek.com accepted the key" };
      return { ok:false, detail:"DeepSeek refused it (HTTP " + r.status + ")" + (r.err ? " — " + r.err : "") };
    },
    sovereign: async v => {
      const r = await sf(HOSTS.netpet + "/api/admin/roster", { headers:{ "X-Admin-Key": v } });
      if(r.status === 200) return { ok:true, detail:"net-pet-ai admin route opened" };
      return { ok:false, detail:"worker answered HTTP " + r.status + (r.status === 401 ? " — wrong key" : "") };
    },
    vaultkey: async v => {
      const r = await sf(HOSTS.vault + "/", { headers: v ? { "X-Admin-Key":v, "X-Vault-Key":v, Authorization:"Bearer " + v } : {} });
      if(r.status === 200) return { ok:true, detail:"the vault worker opened" };
      if(r.status === 401) return { ok:false, detail:"HTTP 401 — the vault is locked (its auth scheme is in APPS/SOV100-VAULT/README.md; needs the canon PAT)" };
      return { ok:false, detail:"HTTP " + r.status + (r.err ? " — " + r.err : "") };
    }
  };
  async function testRow(r, v){
    const t = TESTS[r.local];
    if(!t) return { ok:false, detail:"no tester written yet" };
    if(!v && r.local !== "vaultkey") return { ok:false, detail:"nothing stored locally — cannot test" };
    const out = await t(v);
    lastTest[r.local] = Object.assign({ t:Date.now(), iso:new Date().toISOString() }, out);
    log({ kind:"secret", action:"vault test " + r.local, ok:!!out.ok, detail:"live call to " + r.svc + " (value never logged)", result:out.detail });
    return out;
  }
  const lastTest = {};

  /* --------------------------------- panel -------------------------------- */
  function stateChip(r, v){
    if(!v) return '<span class="chip" style="background:#8a1f1f">NOT SET</span>';
    const lt = lastTest[r.local];
    if(lt && lt.ok) return '<span class="chip" style="background:#1f7a3f">VERIFIED</span>';
    if(lt && !lt.ok) return '<span class="chip" style="background:#8a5a1f">STORED · TEST FAILED</span>';
    return '<span class="chip">STORED · UNTESTED</span>';
  }
  function rows(){
    return NEEDED.map(r => {
      const v = get(r.local);
      const lt = lastTest[r.local];
      return '<div class="rrow"><b>' + E(r.name) + '</b>' + stateChip(r, v)
        + '<div class="rd">' + E(r.svc) + ' · ' + E(v ? fp(v) : "—") + (v ? "" : ' · set with <b>/vault set ' + E(r.local) + ' &lt;value&gt;</b>')
        + (lt ? '<br>last test: ' + E(lt.detail) : "") + '</div></div>';
    }).join("");
  }
  async function cmd(arg){
    const parts = String(arg || "").trim().split(/\s+/);
    const op = (parts[0] || "status").toLowerCase();

    if(op === "set" || op === "add"){
      const local = (parts[1] || "").toLowerCase();
      const val = parts.slice(2).join(" ").trim();
      const r = rowOf(local);
      if(!r || !val){
        bubble('<div class="rise"><div class="rhead">🔐 /vault set — usage</div>'
          + '<div class="rd"><b>/vault set &lt;name&gt; &lt;value&gt;</b> · names: ' + NEEDED.map(x => x.local).join(", ")
          + '<br>A value typed here is masked and is never recorded, captured or logged.</div></div>');
        return;
      }
      put({ [local]:val });
      log({ kind:"secret", action:"vault set " + local, detail:"stored in this browser only (value never logged)", result:fp(val) });
      const t = await testRow(Object.assign({}, r, { local:local }), val);
      bubble('<div class="rise"><div class="rhead">🔐 PrAis Vault — ' + E(r.name) + ' stored</div>'
        + '<div class="rrow"><b>' + E(r.svc) + '</b><span class="vd">' + (t.ok ? "VERIFIED" : "FAILED") + '</span><div class="rd">' + E(fp(val)) + ' · ' + E(t.detail) + '</div></div>'
        + (t.ok ? '' : '<div class="rfoot">Fail closed: it is stored locally, but nothing was sealed or pushed while it fails its own test.</div>')
        + '<div class="rfoot">L1 local only so far. <b>/vault seal</b> to encrypt it for the canon, <b>/vault push</b> (needs /phoenixomegaprotocol) to commit it.</div></div>');
      dna("Obi: [/vault set " + local + " — " + (t.ok ? "verified against " + r.svc : "stored but failed its test") + "]");
      return;
    }
    if(op === "forget" || op === "remove" || op === "delete"){
      const local = (parts[1] || "").toLowerCase();
      if(!local || !get(local)){ bubble('🔐 /vault forget &lt;name&gt; — nothing stored under that name.'); return; }
      del(local); delete lastTest[local];
      log({ kind:"secret", action:"vault forget " + local, detail:"removed from this browser", result:local + " gone locally" });
      bubble('🔐 <b>' + E(local) + '</b> removed from this browser. (The sealed copy on the canon, if any, is untouched — /vault push rewrites it from local.)');
      return;
    }
    if(op === "test"){
      const which = (parts[1] || "all").toLowerCase();
      const list = NEEDED.filter(r => which === "all" ? !!get(r.local) : r.local === which || r.name.toLowerCase() === which);
      if(!list.length){ bubble('🔐 /vault test [name|all] — nothing to test: ' + E(which) + ' is not set locally.'); return; }
      bubble('<div class="rise"><div class="rhead">🔐 PrAis Vault — live access tests</div><div class="rd">Calling the real services… (' + list.length + ')</div></div>');
      const lines = [];
      for(const r of list){ const t = await testRow(r, get(r.local)); lines.push('<div class="rrow' + (t.ok ? "" : " bad") + '"><b>' + E(r.svc) + '</b><span class="vd">' + (t.ok ? "OK" : "NO") + '</span><div class="rd">' + E(r.name) + ' · ' + E(t.detail) + '</div></div>'); }
      bubble('<div class="rise"><div class="rhead">🔐 PrAis Vault — live access tests</div>' + lines.join("")
        + '<div class="rfoot">L3 = the service answered. A key that only *looks* stored is worth nothing; that is what these calls are for.</div></div>');
      return;
    }
    if(op === "key" || op === "keygen" || op === "keys"){
      const sub = (parts[1] || "").toLowerCase();
      const kp = keyPair();
      if(sub === "reveal" || sub === "show"){
        if(!armed()){ bubble('⛔ <b>/vault key reveal</b> shows the crown jewel — arm PHOENIXOMEGAPROTOCOL first: <b>/phoenixomegaprotocol &lt;password&gt;</b>.'); return; }
        if(!kp){ bubble('🔐 No vault keypair yet. <b>/vault key</b> to mint one.'); return; }
        bubble('<div class="rise"><div class="rhead">👑 Vault private key — SAVE THIS ELSEWHERE</div>'
          + '<div class="rrow"><b>PRIVATE</b><span class="vd">CROWN JEWEL</span><div class="rd rd-mono">' + E(kp.priv) + '</div></div>'
          + '<div class="rfoot">It decrypts every sealed value on the canon. Copy it into a password manager now. If it is lost, the sealed vault is unreadable — nothing else can open it.</div></div>', { meta:"SECRET" });
        log({ kind:"secret", action:"vault key reveal", ok:true, detail:"armed reveal (value not logged)", result:"shown to the sovereign" });
        return;
      }
      if(kp){
        const lt = lastTest.vaultkey;
        bubble('<div class="rise"><div class="rhead">🔑 PrAis Vault — the vault key</div>'
          + '<div class="rrow"><b>PUBLIC</b><span class="vd">SHAREABLE</span><div class="rd rd-mono">' + E(kp.pub.slice(0, 72)) + '…</div></div>'
          + '<div class="rrow"><b>PRIVATE</b><span class="vd">HELD HERE</span><div class="rd">' + E(fp(kp.priv)) + ' · reveal needs /phoenixomegaprotocol</div></div>'
          + '<div class="rfoot">The public key is safe to commit (it only encrypts). <b>/vault seal</b> uses it.</div></div>');
        return;
      }
      if(!root.secretPlugin){ bubble('⚠ the secret-plugin did not load — reload the page.'); return; }
      const k = root.secretPlugin.generateKeyPair();
      put({ vaultPub:k.public, vaultPriv:k.private, vaultMade:new Date().toISOString() });
      log({ kind:"secret", action:"vault keypair", ok:true, detail:"ML-KEM (FIPS 203) keypair minted; private key kept in this browser", result:"public " + k.public.length + " chars · private " + k.private.length + " chars" });
      bubble('<div class="rise"><div class="rhead">🔑 PrAis Vault — keypair minted</div>'
        + '<div class="rrow"><b>PUBLIC</b><span class="vd">SHAREABLE</span><div class="rd rd-mono">' + E(k.public) + '</div></div>'
        + '<div class="rrow"><b>PRIVATE</b><span class="vd">CROWN JEWEL</span><div class="rd">kept in this browser · <b>/vault key reveal</b> (after /phoenixomegaprotocol) to save it in your own password manager</div></div>'
        + '<div class="rfoot">ML-KEM (FIPS 203) — post-quantum. Everything the vault seals on the canon can only be opened by this private key.</div></div>');
      dna("Obi: [/vault key — ML-KEM keypair minted]");
      return;
    }
    if(op === "pointer" || op === "ptr"){
      const sub = (parts[1] || "").toLowerCase();
      if(sub === "clear" || sub === "none"){
        const c = await ptrClear();
        if(c.ok) put({ vaultPtrUrl:null, vaultPtrAt:null });
        bubble('<div class="rise"><div class="rhead">🧭 ' + (c.ok ? "Pointer cleared" : "Pointer NOT cleared") + '</div>'
          + '<div class="rrow' + (c.ok ? "" : " bad") + '"><b>VALUE</b><span class="vd">' + (c.ok ? "EMPTY" : "UNCHANGED") + '</span><div class="rd rd-mono">' + E(c.ok ? "-" : (c.why || "refused")) + '</div></div>'
          + '<div class="rfoot">' + E(ptrGetUrl()) + ' now reads as empty, which is the honest state when no escrow has been published from this line.</div></div>');
        return;
      }
      if(sub === "set"){
        const v = parts.slice(2).join(" ").trim();
        if(!v){ bubble('🧭 The shape is <b>/vault pointer set &lt;url&gt;</b>.'); return; }
        const w = await ptrWrite(v);
        if(w.ok) put({ vaultPtrUrl:v, vaultPtrAt:new Date().toISOString() });
        bubble('<div class="rise"><div class="rhead">🧭 ' + (w.ok ? "Pointer aimed" : "Pointer NOT aimed") + '</div>'
          + '<div class="rrow' + (w.ok ? "" : " bad") + '"><b>VALUE</b><span class="vd">' + (w.ok ? "READ BACK IDENTICAL" : "REFUSED") + '</span><div class="rd rd-mono">' + E(w.ok ? v : (w.why || "refused")) + '</div></div>'
          + '<div class="rfoot">' + E(ptrGetUrl()) + ' — worthless to an attacker (it is one URL to ciphertext), priceless to a machine with nothing.</div></div>');
        return;
      }
      const r = await ptrRead();
      bubble('<div class="rise"><div class="rhead">🧭 PrAis Vault — the durable pointer (L2.7)</div>'
        + '<div class="rrow"><b>WHERE</b><span class="vd">ORIGIN-FREE</span><div class="rd rd-mono">' + E(ptrGetUrl()) + '</div></div>'
        + '<div class="rrow' + (r.ok ? "" : " bad") + '"><b>HOLDS</b><span class="vd">' + (r.ok ? "A BUNDLE URL" : "NOTHING") + '</span><div class="rd rd-mono">' + E(r.ok ? r.value : (r.why || "empty")) + '</div></div>'
        + '<div class="rfoot">The address of the recovery bundle, <b>readable with no token, no account and no stored state</b> — everything the old localStorage copy was not. <b>/vault recover &lt;passphrase&gt;</b> reads this first, so the passphrase alone is enough.</div></div>');
      return;
    }
    if(op === "escrow"){
      const kp = keyPair();
      const pass = parts.slice(1).join(" ").trim();
      if(!pass){ bubble(await escrowPanel()); return; }
      if(!kp){ bubble('🔐 There is no vault keypair to escrow yet — <b>/vault key</b> first, then <b>/vault escrow &lt;passphrase&gt;</b>.'); return; }
      if(pass.length < 16){
        bubble('<div class="rise"><div class="rhead">⛔ /vault escrow — refused (fail closed)</div>'
          + '<div class="rd">The escrow passphrase must be at least <b>16 characters</b>. It wraps the crown jewel — the only key that opens the whole vault — and one copy of the wrapped blob sits on a <b>public</b> host, so a short phrase would become the weakest link in the entire vault.</div>'
          + '<div class="rfoot">Use a phrase you can remember and nobody can guess (<span class="rd-mono">correct horse battery staple</span>). Nothing was encrypted, stored, sent or logged. The passphrase you typed was masked and is not recorded.</div></div>');
        return;
      }
      if(!subtle()){ bubble('⚠ This browser cannot derive keys (<span class="rd-mono">crypto.subtle</span> is unavailable) — the escrow fails closed rather than storing something weak.'); return; }
      if(!armed()){ bubble('⛔ <b>/vault escrow</b> writes the wrapped key to the canon — arm PHOENIXOMEGAPROTOCOL first: <b>/phoenixomegaprotocol &lt;password&gt;</b>.'); return; }
      bubble('🔐 /vault escrow — wrapping the private key with PBKDF2-SHA256 × ' + ESCROW_ITER.toLocaleString() + ' → AES-256-GCM…');
      let doc;
      try{ doc = await wrapPriv(pass, kp.priv, kp.pub); }
      catch(e){ bubble('⚠ The escrow could not be built: ' + E(String((e && e.message) || e))); return; }
      const fp = (await sha256hex(doc.ct)).slice(0, 16);
      const json = JSON.stringify(doc);
      /* THE CANON copy is pushed LAST, on purpose: the manifest it commits has to
         carry the mirror's URL, and that URL does not exist until the mirror is
         published. (Committing first left the canon's manifest one step stale.) */
      /* 2) THE MIRRORS — an independent host; readable with only their URLs.
         Immutable uploads (not `editable.set`): editable files require a SAVED
         generator and can demand an anti-bot check, so they are the wrong tool
         for the copies that must exist in a disaster. A plain upload always
         works, and a re-escrow simply publishes new URLs.
         TWO files are published, because two disasters exist:
           · the escrow alone — the wrapped private key (the original mirror)
           · the BUNDLE       — the wrapped key AND the sealed secrets in ONE file,
                                which is what makes a single URL + the passphrase
                                enough to rebuild the whole vault on a machine with
                                no GitHub token and no local storage at all */
      put({ vaultEscrowJson:json });
      const mEsc = await publish(json);
      const mRec = await publish(JSON.stringify(recoveryDoc(doc, (sealedBlob() || {}).text || null)));
      put({ vaultEscrowAt:new Date().toISOString(), vaultEscrowFp:fp,
            vaultEscrowUrl:mEsc.url || escrowMeta().url || null,
            vaultRecoveryUrl:mRec.url || escrowMeta().recoveryUrl || null });
      /* THE DURABLE POINTER — publish the bundle's ADDRESS where a wiped browser, a
         renamed generator and a new agent can all find it with no token. This is the
         half that was missing: without it /vault recover still needed a URL from a
         human, and the human's only copy was the store the rename destroyed. */
      const ptrUrl = mRec.url || mEsc.url || null;
      const ptr = ptrUrl ? await ptrWrite(ptrUrl) : { ok:false, why:"no mirror URL was published, so there is nothing to point at" };
      if(ptr.ok) put({ vaultPtrUrl:ptrUrl, vaultPtrAt:new Date().toISOString() });
      /* THE CANON COPY — authoritative, committed with the now-accurate manifest */
      const L = window.ObiILog, R = (L && L.REPO) || {};
      let pushed = 0, commit = null, errs = [];
      if(L && L.gitCommitFiles && R.owner){
        const files = {};
        files[PATH.escrow] = json;
        files[PATH.manifest] = manifestMd();
        const res = await L.gitCommitFiles({ owner:R.owner, repo:R.repo, branch:BRANCH, files:files,
          message:"prais vault — escrow the private key (passphrase-wrapped) · " + new Date().toISOString() });
        pushed = res.pushed || 0; commit = res.commitSha || null; errs = (res.errors || []).slice(0, 2);
      } else errs.push("the git primitive (src/ilog.js) is not loaded");
      log({ kind:"secret", action:"vault escrow", ok:!!(pushed || mEsc.url), detail:"private key wrapped with PBKDF2-SHA256/" + ESCROW_ITER + " → AES-256-GCM; the passphrase itself is never stored or logged", result:"canon " + (pushed ? "committed" : "FAILED") + " · escrow mirror " + (mEsc.url ? "published" : "none") + " · recovery bundle " + (mRec.url ? "published" : "none") + " · " + fp });
      const sbNow = sealedBlob();
      bubble('<div class="rise"><div class="rhead">🛡 PrAis Vault — the private key is now recoverable</div>'
        + '<div class="rrow"><b>WRAPPED</b><span class="vd">' + E(fp) + '</span><div class="rd">PBKDF2-SHA256 × ' + ESCROW_ITER.toLocaleString() + ' → AES-256-GCM · ' + E(json.length) + ' chars · useless without your passphrase</div></div>'
        + '<div class="rrow' + (pushed ? "" : " bad") + '"><b>CANON</b><span class="vd">' + (pushed ? "COMMITTED" : "FAILED") + '</span><div class="rd">' + E(PATH.escrow) + (commit ? ' · ' + E(String(commit).slice(0, 8)) : "") + (errs.length ? " · " + E(errs.join(" · ")) : "") + '</div></div>'
        + '<div class="rrow' + (mEsc.url ? "" : " bad") + '"><b>ESCROW MIRROR</b><span class="vd">' + (mEsc.url ? "PUBLISHED" : "NONE") + '</span><div class="rd rd-mono">' + E(mEsc.url || mEsc.note) + (mEsc.url && mEsc.note ? "<br>" + E(mEsc.note) : "") + '</div></div>'
        + '<div class="rrow' + (mRec.url ? "" : " bad") + '"><b>RECOVERY BUNDLE</b><span class="vd">' + (mRec.url ? "PUBLISHED" : "NONE") + '</span><div class="rd rd-mono">' + E(mRec.url || mRec.note)
          + (mRec.url ? '<br>the wrapped key + ' + E(sbNow && sbNow.n ? sbNow.n + " sealed secret(s)" : "no sealed blob yet") + ' in one file — <b>this URL + your passphrase rebuilds the whole vault on ANY machine, with no GitHub token</b>' : "") + '</div></div>'
        + '<div class="rrow' + (ptr.ok ? "" : " bad") + '"><b>DURABLE POINTER</b><span class="vd">' + (ptr.ok ? "AIMED" : "NOT AIMED") + '</span><div class="rd">' + (ptr.ok
            ? 'the bundle\u2019s address is published where <b>no token, no stored state and no rename can lose it</b>, and read back identical — so <b>/vault recover &lt;passphrase&gt;</b> now needs nothing else. <span class="rd-mono">' + E(ptr.url) + '</span>'
            : E(ptr.why || "not written")) + '</div></div>'
        + '<div class="rfoot"><b>Your browser is no longer the only copy.</b> Recover anywhere with the passphrase alone: <b>/vault recover &lt;passphrase&gt;</b>' + (mRec.url ? ' — or name the file directly, <b>/vault recover &lt;passphrase&gt; ' + E(mRec.url) + '</b>' : "") + '.<br>'
        + '<b>Write the passphrase in your password manager now</b> — the station never stored it and cannot show it to you again.</div></div>');
      dna("Obi: [/vault escrow — crown jewel wrapped, canon + escrow mirror + recovery bundle published]");
      return;
    }
    if(op === "recover" || op === "restore"){
      let rest = parts.slice(1);
      let url = null;
      if(rest.length && /^https?:\/\//i.test(rest[rest.length - 1])) url = rest.pop();
      const pass = rest.join(" ").trim();
      if(!pass){ bubble('🔐 <b>/vault recover &lt;passphrase&gt; [url]</b> — rebuilds the vault from the escrow. Pass the URL on a machine with no GitHub token (the recovery bundle holds the key AND the sealed secrets, so that alone is enough).'); return; }
      if(!subtle()){ bubble('⚠ This browser cannot derive keys (<span class="rd-mono">crypto.subtle</span> unavailable).'); return; }
      bubble('🔎 /vault recover — looking for the escrow…');
      const got = await fetchEscrow(url);
      if(got.err){ bubble('⚠ ' + E(got.err)); return; }
      let obj = got.doc;
      if(!obj){ try{ obj = JSON.parse(got.text); }catch(e){} }
      const pick = fromBundle(obj);
      if(!pick){ bubble('⚠ That is not a Prais Vault escrow — nor a recovery bundle. (Expected <span class="rd-mono">kind</span> "prais-vault-escrow" or "prais-vault-recovery".)'); return; }
      const doc = pick.doc;
      let priv = null;
      try{ priv = await unwrapPriv(doc, pass); }
      catch(e){
        log({ kind:"secret", action:"vault recover", ok:false, detail:"wrong passphrase — AES-GCM refused the tag", result:"refused, nothing was changed" });
        bubble('<div class="rise"><div class="rhead">⛔ /vault recover — refused</div><div class="rd">That passphrase does not open this escrow (the AES-GCM authentication tag rejected it). Nothing was changed.</div><div class="rfoot">No rate limit here, but there is also no way to weaken the wrap — PBKDF2 × ' + E(String(doc.iter || ESCROW_ITER)) + ' is deliberately slow.</div></div>');
        return;
      }
      put({ vaultPriv:priv, vaultPub:doc.pub || get("vaultPub") });
      /* THIS MACHINE IS A FULL STATION AGAIN. Remember the escrow document itself
         (ciphertext — useless without the passphrase, exactly like the copies on the
         canon and the mirror) plus the links it came from, so a later /vault push can
         refresh the one-URL bundle instead of leaving a stale one behind. Without
         this, a recovered browser could read the vault but never re-publish it. */
      try{
        const keep = { vaultEscrowJson:JSON.stringify(doc),
          vaultEscrowFp:(await sha256hex(String(doc.ct || ""))).slice(0, 16),
          vaultEscrowAt:escrowMeta().at || doc.iso || new Date().toISOString() };
        if(obj && obj.kind === "prais-vault-recovery"){ keep.vaultRecoveryUrl = got.where || escrowMeta().recoveryUrl || null; }
        else keep.vaultEscrowUrl = got.where || escrowMeta().url || null;
        put(keep);
      }catch(e){}
      /* THE PROOF — and, when there is no token, the recovery itself. Open the sealed
         blob with the recovered key, from the freshest source that answers:
           1. the canon                     (needs a GitHub token)
           2. the sealed half of the bundle (needs nothing — this is the no-token path)
           3. this station's sealed mirror  (known only if this browser already had one) */
      let names = null, why = "", sealedFrom = null, sealedText = null;
      if(get("gh")){
        const s = await ghRead(PATH.sealed);
        if(s.status === 200){ sealedText = decode(s.j) || null; if(sealedText) sealedFrom = "the canon"; }
        else why = explain(s);
      } else why = "no GitHub token in this browser";
      if(!sealedText && pick.sealed){ sealedText = pick.sealed; sealedFrom = "the recovery bundle"; }
      if(!sealedText && escrowMeta().sealedUrl){
        const t = await fetchText(escrowMeta().sealedUrl);
        if(t){ sealedText = t; sealedFrom = "the sealed mirror"; }
      }
      if(sealedText && root.secretPlugin){
        try{
          const j = JSON.parse(root.secretPlugin.decrypt(String(sealedText).trim(), priv));
          if(j && j.secrets){
            names = Object.keys(j.secrets);
            const fill = {}; NEEDED.forEach(r => { if(j.secrets[r.name]) fill[r.local] = j.secrets[r.name]; });
            put(fill);
            /* keep the ciphertext too, so the recovered station can /vault seal→push
               without having to re-seal from scratch (it is ciphertext; harmless) */
            sealed = { text:sealedText, n:names.length, at:Date.now() };
            put({ vaultSealed:sealedText, vaultSealedN:names.length, vaultSealedAt:new Date().toISOString() });
          }
        }catch(e){ names = null; why = "the recovered key could not open the copy in " + sealedFrom; }
      }
      if(!names && !why) why = "no sealed copy was reachable (the canon was not readable and nothing carried a sealed blob)";
      log({ kind:"secret", action:"vault recover", ok:true, detail:"private key rebuilt from the " + got.src + " escrow", result:names ? names.length + " secret(s) re-opened from " + sealedFrom : "key restored (seal not re-opened)" });
      bubble('<div class="rise"><div class="rhead">🛡 PrAis Vault — key recovered</div>'
        + '<div class="rrow"><b>SOURCE</b><span class="vd">' + E(String(got.src).toUpperCase()) + '</span><div class="rd rd-mono">' + E(got.where) + (String(got.where).indexOf("recovery") >= 0 || (pick.sealed) ? " · " + E(String(obj && obj.kind || "")) : "") + '</div></div>'
        + '<div class="rrow"><b>KEY</b><span class="vd">RESTORED</span><div class="rd">' + E(fp(priv)) + ' · back in this browser (L1)' + (doc.pub ? " · public key restored from the escrow" : "") + '</div></div>'
        + '<div class="rrow' + (names ? "" : " bad") + '"><b>PROOF</b><span class="vd">' + (names ? names.length + " SECRET" : "UNPROVEN") + '</span><div class="rd">' + (names ? E(names.join(", ")) + " re-opened from " + E(sealedFrom) + " and refilled into this browser" : E(why)) + '</div></div>'
        + '<div class="rfoot">Nothing on disk was touched. <b>/vault test all</b> to prove each key still works.</div></div>');
      dna("Obi: [/vault recover — crown jewel rebuilt from the " + got.src + " escrow" + (names ? " + " + names.length + " secrets re-opened" : "") + "]");
      return;
    }
    if(op === "seal"){
      const kp = keyPair();
      if(!kp){ bubble('🔐 No vault keypair yet — <b>/vault key</b> first (the vault seals to its own public key).'); return; }
      if(!root.secretPlugin){ bubble('⚠ the secret-plugin did not load — reload the page.'); return; }
      const secrets = {}; NEEDED.forEach(r => { const v = get(r.local); if(v) secrets[r.name] = v; });
      const n = Object.keys(secrets).length;
      if(!n){ bubble('🔐 Nothing stored locally to seal.'); return; }
      const plain = JSON.stringify({ v:1, kind:"prais-vault", station:window.generatorName || null, iso:new Date().toISOString(), secrets:secrets });
      let enc; try{ enc = root.secretPlugin.encrypt(plain, kp.pub); }catch(e){ bubble('⚠ seal failed: ' + E(String((e && e.message) || e))); return; }
      sealed = { text:enc, n:n, at:Date.now() };
      put({ vaultSealed:enc, vaultSealedN:n, vaultSealedAt:new Date().toISOString() });
      log({ kind:"secret", action:"vault seal", ok:true, detail:n + " secret(s) encrypted to the vault public key", result:enc.length + " chars sealed" });
      bubble('<div class="rise"><div class="rhead">🔒 PrAis Vault — sealed</div>'
        + '<div class="rrow"><b>SEALED</b><span class="vd">' + n + ' SECRET</span><div class="rd">' + E(enc.length) + ' chars ciphertext · only the vault private key opens it</div></div>'
        + '<div class="rrow"><b>DESTINATION</b><span class="vd">CANON</span><div class="rd">' + E(PATH.sealed) + ' @ ' + E(BRANCH) + '</div></div>'
        + '<div class="rfoot"><b>/vault push</b> (needs /phoenixomegaprotocol — it writes to the canon) commits the sealed blob + the public key + the values-free manifest.</div></div>');
      return;
    }
    if(op === "push"){
      if(!armed()){ bubble('⛔ <b>/vault push</b> writes to the canon — arm PHOENIXOMEGAPROTOCOL first: <b>/phoenixomegaprotocol &lt;password&gt;</b>.'); return; }
      const kp = keyPair();
      const L = window.ObiILog;
      if(!kp){ bubble('🔐 No vault keypair — <b>/vault key</b> first.'); return; }
      if(!L || !L.gitCommitFiles){ bubble('⚠ src/ilog.js (the git primitive) did not load.'); return; }
      if(!sealedBlob()){ bubble('🔐 Nothing sealed yet — <b>/vault seal</b> first (seal is the step that proves the ciphertext exists before anything is committed).'); return; }
      const R = L.REPO || {};
      if(!R.owner || !R.repo){ bubble('⚠ the canon repo coordinates are not on this build.'); return; }
      const sb = sealedBlob();
      /* THE MIRRORS first — the manifest this commit writes has to name them, and a
         machine with no token must be able to recover from the public side alone.
         The sealed blob goes up on its own, and the one-URL recovery bundle is
         refreshed so it always carries the CURRENT ciphertext. */
      bubble('📡 /vault push — publishing the mirrors, then committing to <b>' + E(R.owner + "/" + R.repo) + "</b> @" + E(BRANCH) + "…");
      const mir = await mirrorSealed(sb.text);
      const files = {};
      files[PATH.sealed] = sb.text;
      files[PATH.pub] = kp.pub;
      files[PATH.manifest] = manifestMd();
      const res = await L.gitCommitFiles({ owner:R.owner, repo:R.repo, branch:BRANCH, files:files, message:"prais vault — " + (sb.n || "?") + " secret(s) sealed · " + new Date().toISOString() });
      if(res.pushed){
        log({ kind:"push", action:"vault push", ok:true, detail:PATH.sealed + " + public key + manifest", result:res.pushed + " pushed · commit " + String(res.commitSha || "").slice(0, 8) + " · sealed mirror " + (mir.sealed.url ? "published" : "none") + " · bundle " + (mir.recovery.url ? "refreshed" : "none"), ref:res.commitSha });
        bubble('<div class="rise"><div class="rhead">🔒 PrAis Vault — on the canon</div>'
          + '<div class="rrow"><b>COMMIT</b><span class="vd">' + E(String(res.commitSha || "").slice(0, 8)) + '</span><div class="rd">' + E(res.pushed) + ' file(s) · ' + E(R.owner + "/" + R.repo) + '</div></div>'
          + '<div class="rrow' + (mir.sealed.url ? "" : " bad") + '"><b>SEALED MIRROR</b><span class="vd">' + (mir.sealed.url ? "PUBLISHED" : "NONE") + '</span><div class="rd rd-mono">' + E(mir.sealed.url || mir.sealed.note) + '</div></div>'
          + '<div class="rrow' + (mir.recovery.url ? "" : " bad") + '"><b>RECOVERY BUNDLE</b><span class="vd">' + (mir.recovery.url ? "CURRENT" : "NONE") + '</span><div class="rd rd-mono">' + E(mir.recovery.url || mir.recovery.note) + '</div></div>'
          + '<div class="rfoot">Values are ciphertext on git — the repo can be read by anyone and still give away nothing. The mirrors are ciphertext too: <b>the passphrase is the only key, and it is stored nowhere.</b></div></div>');
        dna("Obi: [/vault push → vault sealed on canon, commit " + String(res.commitSha || "").slice(0, 8) + (mir.recovery.url ? " + mirrors" : "") + "]");
      } else {
        log({ kind:"push", action:"vault push", ok:false, detail:(res.errors || []).join(" · ").slice(0, 300), result:"0 pushed · " + res.failed + " failed" });
        bubble('⚠ Nothing was committed. ' + E((res.errors && res.errors[0]) || "no error text") + '<br><span class="rfoot">A 404/401 here means the stored GitHub token is missing, expired, or has no write scope on this repo (/gh token &lt;PAT&gt;).</span>');
      }
      return;
    }
    if(op === "pull"){
      const kp = keyPair(); const L = window.ObiILog;
      if(!kp){ bubble('🔐 No vault private key in this browser — without it the canon copy cannot be opened. <b>/vault key</b> mints a new keypair (a new one cannot read the old seal).'); return; }
      const got = await ghRead(PATH.sealed);
      if(got.status !== 200){ bubble('⚠ ' + E(explain(got)) + '<br><span class="rfoot">Read path: ' + E(PATH.sealed) + ' @ ' + E(BRANCH) + '</span>'); return; }
      if(!root.secretPlugin){ bubble('⚠ the secret-plugin did not load — reload the page.'); return; }
      /* ghRead hands back the GitHub contents ENVELOPE ({status, j, txt}); the file
         body is base64 inside j.content. An earlier version decoded the envelope
         itself (got.text — a field that does not even exist here), so every pull
         failed with "this private key cannot open it" while the seal was perfectly
         fine. Decode the real payload with the shared helper. */
      const text = decode(got.j);
      if(!text){ bubble('⚠ The canon copy of the seal could not be decoded (' + E(sealedName(got)) + ').'); return; }
      let plain; try{ plain = root.secretPlugin.decrypt(text.trim(), kp.priv); }catch(e){ plain = null; }
      if(!plain){ bubble('⚠ The canon copy exists but this private key cannot open it (' + E(sealedName(got)) + ').'); return; }
      let j = null; try{ j = JSON.parse(plain); }catch(e){}
      if(!j || !j.secrets){ bubble('⚠ Sealed blob decrypted but is not a vault payload.'); return; }
      const names = Object.keys(j.secrets);
      const obj = {}; NEEDED.forEach(r => { if(j.secrets[r.name]) obj[r.local] = j.secrets[r.name]; });
      put(obj);
      log({ kind:"pull", action:"vault pull", ok:true, detail:names.length + " secret(s) opened from the canon", result:"filled L1 for " + Object.keys(obj).length + " name(s)" });
      bubble('<div class="rise"><div class="rhead">🔓 PrAis Vault — opened from the canon</div>'
        + '<div class="rrow"><b>SEALED</b><span class="vd">' + E(j.iso || "?") + '</span><div class="rd">' + E(names.length) + ' secret(s): ' + E(names.join(", ")) + '</div></div>'
        + '<div class="rfoot">Now in this browser (L1). <b>/vault test</b> to prove each one still works.</div></div>');
      return;
    }
    if(op === "manifest" || op === "map"){
      bubble(manifestPanel());
      return;
    }
    if(op === "locate" || op === "canon" || op === "find"){
      await locate();
      return;
    }
    /* default: status */
    bubble(await statusPanel());
    dna("Obi: [/vault — status]");
  }

  /* ------------------------------ canon reads ------------------------------ */
  function base(){ const R = (window.ObiILog && window.ObiILog.REPO) || {}; return (R.owner && R.repo) ? ("https://api.github.com/repos/" + R.owner + "/" + R.repo) : null; }
  async function ghRead(path){
    const b = base(); const L = window.ObiILog;
    if(!b || !L || !L.ghJson) return { status:0, err:"git primitive not loaded" };
    if(!get("gh")) return { status:401, err:"no GitHub token in this browser" };
    return await L.ghJson(b + "/contents/" + path + "?ref=" + BRANCH);
  }
  function decode(j){ if(!j || !j.content) return ""; try{ return decodeURIComponent(escape(atob(String(j.content).replace(/\s+/g, "")))); }catch(e){ return ""; } }
  function explain(got){
    if(got.status === 401) return "no GitHub token in this browser — the canon is private, so nothing can be read (/gh token <PAT>).";
    if(got.status === 404) return "not found on the canon (HTTP 404) — either it is not there, or the token has no access to this repo.";
    if(got.err) return "read failed: " + got.err;
    return "HTTP " + got.status + " " + String((got.j && got.j.message) || "").slice(0, 120);
  }
  function sealedName(got){ return (got.j && got.j.sha) ? String(got.j.sha).slice(0, 8) : "?"; }

  async function exists(path){
    const b = base();
    if(!b || !get("gh")) return { ok:false, why:"no token" };
    const r = await ghRead(path);
    return { ok:r.status === 200, status:r.status, size:(r.j && r.j.size) || 0, sha:(r.j && r.j.sha) || null, why:r.status === 200 ? "present" : explain(r) };
  }

  /* LOCATE — the sovereign's first question: is it already there on git? */
  async function locate(){
    bubble('<div class="rise"><div class="rhead">🧭 /vault locate — looking for the vault on the canon</div><div class="rd">repo + branch dispatched · asking the git primitive…</div></div>');
    const b = base();
    const out = [];
    const rows = [];
    const targets = [
      ["the vault app",                 PATH.sov100],
      ["the vault's own README",        PATH.sov100 + "/README.md"],
      ["sealed vault (this station)",   PATH.sealed],
      ["vault public key",              PATH.pub],
      ["vault manifest",                PATH.manifest],
      ["canon secrets manifest",        PATH.canonMan],
      ["secrets sync script",           "SCRIPTS/secrets-sync-cloudflare.ps1"],
      ["secrets bootstrap script",      "SCRIPTS/secrets-bootstrap.ps1"],
      ["dotenv private keys (should NOT be here)", ".env.keys"]
    ];
    for(const t of targets){
      const e = await exists(t[1]);
      rows.push('<div class="rrow' + (e.ok ? "" : "") + '"><b>' + E(t[0]) + '</b><span class="vd">' + (e.ok ? "PRESENT" : "—") + '</span><div class="rd">' + E(t[1]) + (e.ok ? ' · ' + e.size + ' bytes · ' + E(String(e.sha || "").slice(0, 8)) : ' · ' + E(e.why)) + '</div></div>');
    }
    bubble('<div class="rise"><div class="rhead">🧭 /vault locate — the vault on the canon</div>'
      + '<div class="rrow"><b>REPO</b><span class="vd">ONE AUTHORITY</span><div class="rd">' + E(b ? b.replace("https://api.github.com/repos/", "") : "unknown") + ' @ ' + E(BRANCH) + '</div></div>'
      + rows.join("")
      + '<div class="rfoot">The vault worker <b>sov100-vault-v0</b> is live on Cloudflare and answers <b>401</b> to every route — a locked door with an unknown key. Its scheme is documented in <b>' + E(PATH.sov100) + '/README.md</b>, which is readable the moment a PAT is armed.</div></div>');
    log({ kind:"op", action:"vault locate", ok:!!(b && get("gh")), detail:"probed " + targets.length + " canon paths", result: b ? (get("gh") ? "probed" : "no token — canon is private, nothing readable") : "no base" });
    dna("Obi: [/vault locate — probed the canon for the vault]");
  }

  /* -------------------------------- panels -------------------------------- */
  function manifestMd(){
    const rows = NEEDED.map(r => "| `" + r.name + "` | " + r.svc + " | " + r.why.replace(/\|/g, "/") + " | " + r.where + " |");
    return [
      "# PrAIS VAULT — SECRETS MANIFEST",
      "> WHAT is needed, never the values. Committed by the station (/vault push). Values live:",
      "> L1 this browser (localStorage `obi_keys`) · L2 sealed on the canon (`" + PATH.sealed + "`) · L3 the live service.",
      "",
      "## ACTIVE",
      "| Key | Service | Purpose | Held by |",
      "|-----|---------|---------|---------|",
      rows.join("\n"),
      "",
      "## PLANNED (named so nothing is invented twice)",
      "| Key | Service | For |",
      "|-----|---------|-----|",
      PLANNED.map(p => "| `" + p[0] + "` | " + p[1] + " | " + p[2] + " |").join("\n"),
      "",
      "## Layers",
      "- **L1 local** — `localStorage.obi_keys`. Never shipped, never logged; a secret-typed command is masked before it can reach the soul ledger or the I-LOG.",
      "- **L2 canon** — sealed with the vault public key (secret-plugin, ML-KEM FIPS 203). Ciphertext only, so the repo can hold it in the open; the private key never leaves the sovereign.",
      "- **L2.5 ESCROW** — the *private* key (the crown jewel) wrapped in the sovereign's passphrase (PBKDF2-SHA256 x " + ESCROW_ITER + " -> AES-256-GCM) at `" + PATH.escrow + "`, with mirrors on the upload host. Every copy is useless without the passphrase, so losing one browser can no longer destroy the vault. Recovery: `/vault recover <passphrase>`.",
      "- **L2.6 RECOVERY BUNDLE** — ONE public file (`kind: \"prais-vault-recovery\"`) holding the wrapped private key AND the sealed secrets together, so a single URL plus the passphrase rebuilds every key on a machine that has never seen this station and has NO GitHub token. Published by `/vault escrow`, refreshed by `/vault push`, because it must always carry the current ciphertext. Ciphertext only, so publishing it gives nothing away.",
      "- **L3 live** — the service itself. `/vault test` calls it for real. A key that only looks stored is worth nothing.",
      "",
      "## RECOVERY (if this browser is ever lost)",
      "1. With a GitHub token: open the station anywhere, arm the token (`/gh token <PAT>`), then `/vault recover <passphrase>` — it reads the escrow from the canon.",
      "2. With NOTHING but the passphrase and one link: `/vault recover <passphrase> <recoveryBundleUrl>` — the bundle carries the key *and* the sealed secrets, so the whole vault comes back with no token, no storage and no canon.",
      "3. The passphrase is the ONLY secret in the chain and it is stored nowhere: not here, not on the canon, not in this file, not in the bundle. If it is lost, the escrow cannot be opened by anyone, including the sovereign.",
      "4. What is published, and where:",
      "   - recovery bundle (key + secrets, one URL): " + (escrowMeta().recoveryUrl ? "`" + escrowMeta().recoveryUrl + "`" : "not published yet — `/vault escrow <passphrase>` publishes it"),
      "   - escrow mirror (key only): " + (escrowMeta().url ? "`" + escrowMeta().url + "`" : "not published yet"),
      "   - sealed mirror (secrets only): " + (escrowMeta().sealedUrl ? "`" + escrowMeta().sealedUrl + "`" : "not published yet — `/vault push` publishes it"),
      "",
      "Generated by the PrAis Command Station — " + new Date().toISOString()
    ].join("\n");
  }
  async function escrowPanel(){
    const kp = keyPair();
    const m = escrowMeta();
    let canon = { ok:false, why:"no GitHub token in this browser" };
    if(get("gh")) canon = await exists(PATH.escrow);
    const state = !kp ? "NO KEYPAIR" : (m.at ? "WRAPPED" : "NOT MINTED");
    const badge = !kp ? "#8a1f1f" : (m.at ? "#1f7a3f" : "#8a5a1f");
    return '<div class="rise"><div class="rhead">🛡 PrAis Vault — the escrow (the crown jewel, recoverable)</div>'
      + '<div class="rrow"><b>ESCROW</b><span class="chip" style="background:' + badge + '">' + E(state) + '</span><div class="rd">'
        + (m.at
            ? 'wrapped ' + E(m.at) + ' · fingerprint ' + E(m.fp || "?") + ' · PBKDF2-SHA256 × ' + ESCROW_ITER.toLocaleString() + ' → AES-256-GCM'
            : 'The private key is currently the ONLY copy — it exists in this browser and nowhere else. Run <b>/vault escrow &lt;passphrase&gt;</b> (at least 16 characters) to make it recoverable.')
      + '</div></div>'
      + '<div class="rrow' + (canon.ok ? "" : " bad") + '"><b>CANON COPY</b><span class="vd">' + (canon.ok ? "PRESENT" : "—") + '</span><div class="rd">' + E(PATH.escrow) + (canon.ok ? ' · ' + canon.size + ' bytes · ' + E(String(canon.sha || "").slice(0, 8)) : ' · ' + E(canon.why)) + '</div></div>'
      + '<div class="rrow' + (m.url ? "" : " bad") + '"><b>ESCROW MIRROR</b><span class="vd">' + (m.url ? "PUBLISHED" : "NONE") + '</span><div class="rd rd-mono">' + E(m.url || "no escrow mirror — /vault escrow publishes one") + '</div></div>'
      + '<div class="rrow' + (m.recoveryUrl ? "" : " bad") + '"><b>RECOVERY BUNDLE</b><span class="vd">' + (m.recoveryUrl ? "PUBLISHED" : "NONE") + '</span><div class="rd rd-mono">' + E(m.recoveryUrl || "the key AND the sealed secrets in one file — it is what recovers you with NO GitHub token; /vault escrow publishes it, /vault push refreshes it") + '</div></div>'
      + '<div class="rrow"><b>SEALED MIRROR</b><span class="vd">' + (m.sealedUrl ? "PUBLISHED" : "NONE") + '</span><div class="rd rd-mono">' + E(m.sealedUrl || "the ciphertext on its own — /vault push publishes it") + '</div></div>'
      + '<div class="rfoot">The escrow holds the <b>private key</b>, not the secrets; the bundle holds both, still sealed. Everything published is useless without your passphrase — which is stored nowhere, by design. <b>/vault recover &lt;passphrase&gt;[ url]</b> rebuilds this browser from it.</div></div>';
  }
  function manifestPanel(){
    const rows = NEEDED.map(r => '<div class="rrow"><b>' + E(r.name) + '</b><span class="vd">' + E(r.svc) + '</span><div class="rd">' + E(r.why) + ' · held by ' + E(r.where) + '</div></div>').join("");
    const planned = PLANNED.map(p => '<span class="chip">' + E(p[0]) + '</span>').join(" ");
    return '<div class="rise"><div class="rhead">🗺 PrAis Vault — the empire\'s key manifest</div>' + rows
      + '<div class="rrow"><b>PLANNED</b><span class="vd">' + PLANNED.length + '</span><div class="rd">' + planned + '</div></div>'
      + '<div class="rfoot">Copied from the canon\'s own <b>' + E(PATH.canonMan) + '</b> and extended with the two tokens the station itself needs. <b>/vault push</b> writes this (values-free) to <b>' + E(PATH.manifest) + '</b>.</div></div>';
  }
  async function statusPanel(){
    const kp = keyPair();
    let canonState = "not checked";
    if(get("gh")){
      const e = await exists(PATH.sealed);
      canonState = e.ok ? ("sealed copy on the canon · " + e.size + " bytes · " + String(e.sha || "").slice(0, 8)) : ("no sealed copy readable — " + e.why);
    } else canonState = "no GitHub token — the canon is private, so L2 is invisible from here";
    const missing = NEEDED.filter(r => !get(r.local)).map(r => r.local);
    return '<div class="rise"><div class="rhead">🔐 PrAis Vault — one place for every secret</div>'
      + '<div class="rrow"><b>L1 LOCAL</b><span class="vd">' + (NEEDED.length - missing.length) + "/" + NEEDED.length + '</span><div class="rd">' + (missing.length ? "missing: " + E(missing.join(", ")) : "every known secret is present in this browser") + '</div></div>'
      + rows()
      + '<div class="rrow"><b>L2 CANON</b><span class="vd">' + (kp ? "KEY READY" : "NO KEYPAIR") + '</span><div class="rd">' + E(canonState) + (kp ? ' · public key ' + E(kp.pub.slice(0, 28)) + "…" : "") + '</div></div>'
      + '<div class="rrow' + (escrowMeta().at ? "" : " bad") + '"><b>L2.5 ESCROW</b><span class="vd">' + (escrowMeta().at ? "WRAPPED" : "NOT MINTED") + '</span><div class="rd">'
        + (escrowMeta().at
            ? 'the private key is recoverable · wrapped ' + E(escrowMeta().at) + ' · ' + E(escrowMeta().fp || "")
              + ' · <b>' + (escrowMeta().recoveryUrl ? "1 link recovers everything" : (escrowMeta().url ? "escrow mirrored" : "canon only")) + '</b>'
              + (escrowMeta().recoveryUrl ? '<br><span class="rd-mono">' + E(escrowMeta().recoveryUrl) + '</span>' : ' — <b>/vault escrow &lt;passphrase&gt;</b> publishes the one-URL recovery bundle')
            : 'the private key lives in THIS BROWSER ONLY — <b>/vault escrow &lt;passphrase&gt;</b> makes it recoverable if this browser is ever lost')
        + '</div></div>'
      + (sealedBlob() ? '<div class="rrow"><b>SEALED HERE</b><span class="vd">' + (sealedBlob().n || "?") + ' SECRET</span><div class="rd">' + E(sealedBlob().text.length) + ' chars ciphertext · ready for <b>/vault push</b></div></div>' : "")
      + '<div class="rrow"><b>L3 LIVE</b><span class="vd">' + Object.keys(lastTest).length + ' TESTED</span><div class="rd">' + (Object.keys(lastTest).length ? E(Object.keys(lastTest).map(k => k + ":" + (lastTest[k].ok ? "ok" : "no")).join(" · ")) : "nothing tested yet this session") + '</div></div>'
      + '<div class="rrow"><b>GATE</b><span class="vd">' + (armed() ? "ARMED" : "LOCKED") + '</span><div class="rd">canon writes need PHOENIXOMEGAPROTOCOL (/phoenixomegaprotocol) · ' + (armed() ? "writes authorised" : "seal is free, push is gated") + '</div></div>'
      + '<div class="rfoot"><b>/vault locate</b> (where the vault already is on git) · <b>/vault test [name|all]</b> (real calls) · <b>/vault set &lt;name&gt; &lt;value&gt;</b> · <b>/vault key</b> · <b>/vault seal</b> · <b>/vault push</b> · <b>/vault pull</b> · <b>/vault escrow &lt;passphrase&gt;</b> (make the private key recoverable) · <b>/vault recover &lt;passphrase&gt; [url]</b> · <b>/vault manifest</b>'
      + '</div></div>';
  }

  let sealed = null;
  /* the sealed blob survives a reload: ciphertext in localStorage is harmless
     (only the private key opens it) and it keeps /vault seal → /vault push
     working across a refresh. */
  function sealedBlob(){
    if(sealed) return sealed;
    const t = get("vaultSealed");
    return t ? { text:t, n:Number(all().vaultSealedN) || null, at:all().vaultSealedAt || null } : null;
  }

  window.ObiVault = {
    cmd: cmd, status: statusPanel, locate: locate, manifest: manifestMd, escrowPanel: escrowPanel,
    names: NEEDED.map(r => r.local), get: get, set: put, forget: del, fp: fp, test: testRow,
    sealed: sealedBlob, keyPair: keyPair, paths: PATH, escrow: escrowMeta,
    pointer: ptrRead, pointerWrite: ptrWrite, pointerUrl: ptrGetUrl, pointerClear: ptrClear,
    r2: r2Test, r2Host: r2Host, needs: NEEDED
  };
})();
