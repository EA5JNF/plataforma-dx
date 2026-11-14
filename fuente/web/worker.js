// ACRACB - Plataforma DX · intermediario de datos (Cloudflare Worker) · versión 2
// Solo lee las webs públicas de la lista y se las pasa a la plataforma. Guarda cada respuesta 10 minutos (PSK Reporter, 2).
// Seguridad: solo GET, solo https, solo las webs de la lista (también tras redirecciones), tamaño máximo, tiempo máximo,
// sin cookies ni cabeceras de la web de origen, y la respuesta nunca puede ejecutarse como página en el navegador.
const PERMITIDAS = ["www.hamqsl.com", "www.spaceweather.gc.ca", "kp.gfz-potsdam.de", "kp.gfz.de", "www.sidc.be", "prop.kc2g.com",
  "lgdc.uml.edu", "www.ng3k.com", "clublog.org", "www.dxsummit.fi", "retrieve.pskreporter.info",
  // de reserva: la plataforma las lee directamente y solo pasa por aquí si el navegador no puede
  "services.swpc.noaa.gov", "spothole.app", "www.hamqth.com", "spots.wwff.co", "api.pota.app", "api2.sota.org.uk",
  "db1.wspr.live", "api.nasa.gov", "kauai.ccmc.gsfc.nasa.gov", "giro.uml.edu"];
// Páginas desde las que se puede usar (null = la plataforma abierta como archivo en el ordenador)
const ORIGENES = ["https://ea5jnf.github.io", "null"];
const MAX_BYTES = 8 * 1024 * 1024, MAX_URL = 2048, TIEMPO_MS = 12000, MAX_SALTOS = 3;

function cabeceras(origen) {
  const h = new Headers({
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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

export default {
  async fetch(request) {
    const origen = request.headers.get("Origin");
    if (origen && !ORIGENES.includes(origen)) return texto("Origen no permitido", 403, null);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cabeceras(origen) });
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
