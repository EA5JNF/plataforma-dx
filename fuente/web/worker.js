// ACRACB - Plataforma DX · intermediario de datos (Cloudflare Worker) · versión 3
// 2.11.26: además, POST /spot reenvía a DX Summit los spots que anuncian los usuarios desde la plataforma. Desde el
// navegador no se puede (DX Summit solo acepta envíos desde su propia web); desde aquí, sí. Solo desde la plataforma,
// con los datos revisados, un spot cada 30 segundos por conexión y sin guardar nada.
// Solo lee las webs públicas de la lista y se las pasa a la plataforma. Guarda cada respuesta 10 minutos.
// Seguridad: solo GET, solo https, solo las webs de la lista (también tras redirecciones), tamaño máximo, tiempo máximo,
// sin cookies ni cabeceras de la web de origen, y la respuesta nunca puede ejecutarse como página en el navegador.
// 2.10.44: fuera las webs cuyas condiciones de uso no están claras (HamQSL, NRCan, KC2G, GIRO, NG3K, Club Log, DX Summit,
// PSK Reporter, POTA, SOTA y WWFF). Este cambio vale para la próxima vez que se despliegue el intermediario.
const PERMITIDAS = ["kp.gfz-potsdam.de", "kp.gfz.de", "www.sidc.be",
  // de reserva: la plataforma las lee directamente y solo pasa por aquí si el navegador no puede
  "services.swpc.noaa.gov", "spothole.app", "www.hamqth.com", "db1.wspr.live", "api.nasa.gov", "kauai.ccmc.gsfc.nasa.gov", "celestrak.org"];
// Páginas desde las que se puede usar (null = la plataforma abierta como archivo en el ordenador)
const ORIGENES = ["https://ea5jnf.github.io", "null"];
const MAX_BYTES = 8 * 1024 * 1024, MAX_URL = 2048, TIEMPO_MS = 12000, MAX_SALTOS = 3;

function cabeceras(origen) {
  const h = new Headers({
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Cross-Origin-Resource-Policy": "cross-origin"
  });
  h.set("Access-Control-Allow-Origin", origen && ORIGENES.includes(origen) ? origen : ORIGENES[0]);
  return h;
}
const texto = (msg, status, origen) => { const h = cabeceras(origen); h.set("Content-Type", "text/plain; charset=utf-8"); h.set("Cache-Control", "no-store"); return new Response(msg, { status, headers: h }); };

function valida(u) {
  let d;
  try { d = new URL(u); } catch (e) { return null; }
  if (d.protocol !== "https:" || d.username || d.password || (d.port && d.port !== "443")) return null;
  if (!PERMITIDAS.includes(d.hostname)) return null;
  return d;
}

// ---- anunciar un spot ----
const DXS = "https://new.dxsummit.fi/api/v1/spots";
const INDICATIVO = /^(?=.{3,15}$)([A-Z0-9]{1,4}\/)?[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,4}[A-Z](\/[A-Z0-9]{1,4})?$/;
const json = (o, status, origen) => { const h = cabeceras(origen); h.set("Content-Type", "application/json; charset=utf-8"); h.set("Cache-Control", "no-store"); return new Response(JSON.stringify(o), { status, headers: h }); };
async function spot(request, origen) {
  if (!origen || origen === "null" || !ORIGENES.includes(origen)) return json({ status: "origen no permitido" }, 403, origen);
  const largo = +(request.headers.get("Content-Length") || 0);
  if (largo > 1024) return json({ status: "demasiado largo" }, 413, origen);
  let d; try { d = JSON.parse((await request.text()).slice(0, 1024)); } catch (e) { return json({ status: "datos no válidos" }, 400, origen); }
  const de = String(d.de_call || "").trim().toUpperCase(), dx = String(d.dx_call || "").trim().toUpperCase();
  const f = Math.round(parseFloat(d.frequency) * 10) / 10, info = String(d.info || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 30);
  if (!INDICATIVO.test(de) || !INDICATIVO.test(dx) || de === dx) return json({ status: "indicativo no válido" }, 400, origen);
  if (!(f >= 1800 && f <= 450000)) return json({ status: "frecuencia no válida" }, 400, origen);
  // un spot cada 30 segundos por conexión (se recuerda en la caché del propio Worker, sin guardar datos)
  const ip = request.headers.get("CF-Connecting-IP") || "x", llave = new Request("https://acracb-dx.invalid/rl/" + encodeURIComponent(ip));
  const cache = caches.default;
  if (await cache.match(llave)) return json({ status: "espera unos segundos" }, 429, origen);
  await cache.put(llave, new Response("1", { headers: { "Cache-Control": "max-age=30" } }));
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), TIEMPO_MS);
  try {
    const r = await fetch(DXS, { method: "POST", signal: ac.signal, headers: { "Content-Type": "application/json", "User-Agent": "ACRACB-PlataformaDX/3.0 (club de radioaficionados)" },
      body: JSON.stringify({ de_call: de, dx_call: dx, frequency: f.toFixed(1), info }) });
    let j = null; try { j = await r.json(); } catch (e) {}
    const ok = r.ok && (!j || j.status == null || j.status === "ok");
    return json({ status: ok ? "ok" : (j && j.status ? String(j.status).slice(0, 80) : "DX Summit respondió " + r.status) }, ok ? 200 : 502, origen);
  } catch (e) {
    return json({ status: "DX Summit no respondió" }, 502, origen);
  } finally { clearTimeout(t); }
}

export default {
  async fetch(request) {
    const origen = request.headers.get("Origin");
    if (origen && !ORIGENES.includes(origen)) return texto("Origen no permitido", 403, null);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cabeceras(origen) });
    if (request.method === "POST" && new URL(request.url).pathname === "/spot") return spot(request, origen);
    if (request.method !== "GET" && request.method !== "HEAD") return texto("Método no permitido", 405, origen);
    if (request.url.length > MAX_URL) return texto("Dirección demasiado larga", 414, origen);
    const u = new URL(request.url).searchParams.get("u");
    if (!u) return texto("ACRACB DX: intermediario activo", 200, origen);
    let destino = valida(u);
    if (!destino) return texto("Fuente no permitida", 403, origen);
    const psk = destino.hostname === "retrieve.pskreporter.info", ttl = psk ? 120 : 600;
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), TIEMPO_MS);
    try {
      let r;
      for (let salto = 0; ; salto++) {
        r = await fetch(destino.toString(), {
          method: "GET", redirect: "manual", signal: ac.signal,
          headers: { "User-Agent": "ACRACB-PlataformaDX/2.0 (club de radioaficionados)", "Accept": "*/*" },
          cf: { cacheTtl: ttl, cacheEverything: true }
        });
        if (r.status < 300 || r.status > 399) break;
        const loc = r.headers.get("Location");
        const sig = loc ? valida(new URL(loc, destino).toString()) : null;
        if (!sig || salto >= MAX_SALTOS) return texto("Redirección no permitida", 502, origen);
        destino = sig;
      }
      const cl = +(r.headers.get("Content-Length") || 0);
      if (cl > MAX_BYTES) return texto("Respuesta demasiado grande", 502, origen);
      // se lee con tope de tamaño aunque la web no diga cuánto ocupa
      const lector = r.body ? r.body.getReader() : null, trozos = [];
      let total = 0;
      if (lector) for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BYTES) { try { await lector.cancel(); } catch (e) {} return texto("Respuesta demasiado grande", 502, origen); }
        trozos.push(value);
      }
      const cuerpo = new Uint8Array(total); let o = 0; for (const c of trozos) { cuerpo.set(c, o); o += c.byteLength; }
      const h = cabeceras(origen), ct = (r.headers.get("Content-Type") || "").toLowerCase();
      // solo se devuelven datos (JSON, XML o texto), nunca HTML ejecutable
      h.set("Content-Type", ct.includes("json") ? "application/json; charset=utf-8" : ct.includes("xml") ? "text/xml; charset=utf-8" : "text/plain; charset=utf-8");
      h.set("Cache-Control", r.ok ? `public, max-age=${ttl}` : "no-store");
      return new Response(request.method === "HEAD" ? null : cuerpo, { status: r.status, headers: h });
    } catch (e) {
      return texto(e && e.name === "AbortError" ? "La fuente tardó demasiado" : "La fuente no respondió", 502, origen);
    } finally { clearTimeout(t); }
  }
};
