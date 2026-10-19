/* ==========================================================================================
   StoreDO — the durable store behind the Cloudflare build's `root.uploadPlugin` and the CGN
   hub files (`root.uploadPlugin.editable`).

   perchance's upload-plugin hands you an immutable URL plus a `deletionUrl`, and its `editable`
   namespace is a mutable text file with an `editKey` that is returned only on creation.
   That contract is reproduced here exactly, backed by one Durable Object so the whole deploy
   needs no R2 bucket and no extra provisioning step.

   Keys are opaque; blobs are chunked so a single value never hits DO's 128 KiB ceiling.
   ========================================================================================== */

const CHUNK = 96 * 1024;         // bytes per stored chunk (under the 128 KiB value cap)
const MAX_BLOB = 40 * 1024 * 1024;

export class StoreDO {
  constructor(state, env){
    this.state = state;
    this.env = env;
    state.blockConcurrencyWhile(async () => {
      const sql = state.storage.sql;
      sql.exec(`CREATE TABLE IF NOT EXISTS meta(
        key TEXT PRIMARY KEY, type TEXT, kind TEXT, edit_key TEXT, del_token TEXT,
        created INTEGER, size INTEGER, chunks INTEGER)`);
      sql.exec(`CREATE TABLE IF NOT EXISTS blobs(key TEXT, idx INTEGER, data BLOB, PRIMARY KEY(key, idx))`);
    });
  }

  get sql(){ return this.state.storage.sql; }

  _meta(key){
    const r = this.sql.exec(`SELECT * FROM meta WHERE key=?`, key).toArray();
    return r.length ? r[0] : null;
  }

  async _put(key, bytes, type, kind){
    const n = Math.ceil(bytes.length / CHUNK) || 1;
    this.sql.exec(`DELETE FROM blobs WHERE key=?`, key);
    for(let i = 0; i < n; i++){
      const slice = bytes.slice(i * CHUNK, (i + 1) * CHUNK);
      this.sql.exec(`INSERT INTO blobs(key, idx, data) VALUES(?,?,?)`, key, i, slice);
    }
    const m = this._meta(key);
    if(m){
      this.sql.exec(`UPDATE meta SET type=?, kind=?, size=?, chunks=? WHERE key=?`, type, kind, bytes.length, n, key);
      return m;
    }
    const row = { key, type, kind, edit_key: null, del_token: randHex(24), created: Date.now(), size: bytes.length, chunks: n };
    this.sql.exec(`INSERT INTO meta(key,type,kind,edit_key,del_token,created,size,chunks) VALUES(?,?,?,?,?,?,?,?)`,
      row.key, row.type, row.kind, row.edit_key, row.del_token, row.created, row.size, row.chunks);
    return row;
  }

  _read(key){
    const m = this._meta(key);
    if(!m) return null;
    const rows = this.sql.exec(`SELECT idx, data FROM blobs WHERE key=? ORDER BY idx`, key).toArray();
    const out = new Uint8Array(rows.reduce((n, r) => n + r.data.length, 0));
    let o = 0;
    for(const r of rows){ out.set(r.data, o); o += r.data.length; }
    return { meta: m, bytes: out };
  }

  async fetch(req){
    const url = new URL(req.url);
    const seg = url.pathname.split("/").filter(Boolean);
    const op = seg[0] || "";
    const rest = decodeURIComponent(seg.slice(1).join("/"));

    /* ---- immutable upload: POST /put ------------------------------------------------ */
    if(op === "put" && req.method === "POST"){
      const buf = new Uint8Array(await req.arrayBuffer());
      if(!buf.length) return Response.json({ error: "empty file" }, { status: 400 });
      if(buf.length > MAX_BLOB) return Response.json({ error: "file_too_big" }, { status: 413 });
      const key = randHex(16);
      const type = req.headers.get("x-ob1-type") || "application/octet-stream";
      const row = await this._put(key, buf, type, "upload");
      const origin = url.origin;
      return Response.json({ url: origin + "/f/" + key, size: buf.length, type,
        deletionUrl: origin + "/api/delete?key=" + key + "&token=" + row.del_token });
    }

    /* ---- serve an uploaded file: GET /serve/<key> ------------------------------------ */
    if(op === "serve"){
      const got = this._read(rest);
      if(!got) return new Response("not found", { status: 404 });
      return new Response(got.bytes, { headers: {
        "content-type": got.meta.type || "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable" } });
    }

    /* ---- delete: /delete/<key>?token= ------------------------------------------------ */
    if(op === "delete"){
      const m = this._meta(rest);
      if(!m) return Response.json({ ok:false, error:"not found" });
      if(url.searchParams.get("token") !== m.del_token) return Response.json({ ok:false, error:"bad token" }, { status: 403 });
      this.sql.exec(`DELETE FROM blobs WHERE key=?`, rest);
      this.sql.exec(`DELETE FROM meta WHERE key=?`, rest);
      return Response.json({ ok:true });
    }

    /* ---- editable files (CGN hubs): POST /editable ----------------------------------- */
    if(op === "editable"){
      if(req.method === "GET"){
        const key = "editable/" + rest;
        const m = this._meta(key);
        if(!m) return new Response("not found", { status: 404 });
        const got = this._read(key);
        return new Response(got.bytes, { headers: { "content-type": "text/plain;charset=utf-8" } });
      }
      let p = {}; try{ p = await req.json(); }catch(e){ return Response.json({ error:"bad json" }, { status: 400 }); }
      const name = String(p.name || "").trim();
      if(!name) return Response.json({ error:"name required" }, { status: 400 });
      const text = String(p.text == null ? "" : p.text);
      const bytes = new TextEncoder().encode(text);
      if(bytes.length > 5 * 1024 * 1024) return Response.json({ error:"file_too_big" }, { status: 413 });
      const key = "editable/" + name;
      const existing = this._meta(key);
      if(!existing){
        const row = await this._put(key, bytes, "text/plain;charset=utf-8", "editable");
        this.sql.exec(`UPDATE meta SET edit_key=? WHERE key=?`, randHex(24), key);
        const editKey = this._meta(key).edit_key;
        return Response.json({ created: true, editKey, size: bytes.length });
      }
      const given = String(p.editKey || "");
      if(!given || given !== existing.edit_key)
        return Response.json({ created: false, error: "bad or missing editKey" }, { status: 403 });
      await this._put(key, bytes, "text/plain;charset=utf-8", "editable");
      return Response.json({ created: false, size: bytes.length });
    }

    /* ---- does it exist / how big: GET /head/<key> ------------------------------------ */
    if(op === "head"){
      const m = this._meta(rest);
      return Response.json(m ? { exists:true, size:m.size, created:m.created, kind:m.kind } : { exists:false });
    }

    return Response.json({ ok:true, service:"obi-store", chunks:true });
  }
}

function randHex(n){
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, "0")).join("");
}
