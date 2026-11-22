// ACRACB - Plataforma DX · intermediario de datos (Cloudflare Worker) · versión 8.2
import { connect } from "cloudflare:sockets";
// Dos funciones, separadas:
//  1) Recepción: lee las webs públicas de la lista PERMITIDAS y se las pasa a la plataforma (solo GET, ver abajo).
//  2) Clúster interno de la plataforma (POST /spot, GET /recientes, POST /retirar) y, aparte, difusión a clústeres
//     externos solo a los destinos activados en la lista DESTINOS (más abajo). Detalles junto a su código.
// Solo lee las webs públicas de la lista y se las pasa a la plataforma. Guarda cada respuesta 10 minutos.
// Seguridad: solo GET, solo https, solo las webs de la lista (también tras redirecciones), tamaño máximo, tiempo máximo,
// sin cookies ni cabeceras de la web de origen, y la respuesta nunca puede ejecutarse como página en el navegador.
// 2.10.44: fuera las webs cuyas condiciones de uso no están claras (HamQSL, NRCan, KC2G, GIRO, NG3K, Club Log, DX Summit,
// PSK Reporter, POTA, SOTA y WWFF). Este cambio vale para la próxima vez que se despliegue el intermediario.
const PERMITIDAS = ["kp.gfz-potsdam.de", "kp.gfz.de", "www.sidc.be",
  // de reserva: la plataforma las lee directamente y solo pasa por aquí si el navegador no puede
  "services.swpc.noaa.gov", "spothole.app", "www.hamqth.com", "db1.wspr.live", "api.nasa.gov", "kauai.ccmc.gsfc.nasa.gov", "celestrak.org"];
// Páginas desde las que se puede usar (null = la plataforma abierta como archivo en el ordenador).
// Si la plataforma se aloja también en otro sitio (por ejemplo, el servidor de la asociación), añade aquí su dirección
// exacta, con https y sin barra final, por ejemplo "https://dx.ejemplo.org", y vuelve a publicar el Worker.
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

// ---- clúster interno de la plataforma (sistema A) y difusión externa (sistema B) ----
// 2.11.39 (versión 8), según el documento del proyecto:
//  · El spot se guarda PRIMERO en el clúster interno y se responde al momento; la difusión externa va después, aparte,
//    y nunca retrasa ni impide la publicación interna.
//  · Almacén: Cloudflare D1 (enlazado con el nombre DB) si existe, porque reparte los cambios al momento; si no, el KV
//    (enlazado como SPOTS), que puede tardar hasta un minuto en repartirlos. La tabla se crea sola la primera vez.
//  · Cada spot: identificador único, autor, DX, frecuencia, banda, modo (si se sabe), hora UTC, comentario y el estado
//    de cada destino externo (pendiente, enviado, aceptado o error). Solo spots originales escritos en la plataforma.
//  · Moderación: el autor puede retirar su spot con la clave que recibe al publicarlo (aquí solo se guarda su huella);
//    el administrador, desde el panel de Cloudflare (D1 → acracb-cluster → Console):
//      UPDATE spots SET retirado = 1 WHERE id = 'identificador';
//  · Sin registro: el spot solo se acepta desde la propia web, uno cada 30 s por conexión, y el mismo spot (mismo DX,
//    ±1 kHz) no se repite en 10 minutos. Los errores quedan en los registros del Worker (Observability).
const INDICATIVO = /^(?=.{3,15}$)([A-Z0-9]{1,4}\/)?[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,4}[A-Z](\/[A-Z0-9]{1,4})?$/;
const json = (o, status, origen) => { const h = cabeceras(origen); h.set("Content-Type", "application/json; charset=utf-8"); h.set("Cache-Control", "no-store"); return new Response(JSON.stringify(o), { status, headers: h }); };
const BANDAS = [[1800, 2000, "160m"], [3500, 4000, "80m"], [5250, 5450, "60m"], [7000, 7300, "40m"], [10100, 10150, "30m"], [14000, 14350, "20m"], [18068, 18168, "17m"], [21000, 21450, "15m"], [24890, 24990, "12m"], [28000, 29700, "10m"], [50000, 54000, "6m"], [70000, 70500, "4m"], [144000, 148000, "2m"], [430000, 440000, "70cm"]];
const bandaDe = f => { const b = BANDAS.find(x => f >= x[0] && f <= x[1]); return b ? b[2] : null; };
const modoDe = t => { const m = String(t || "").toUpperCase().match(/\b(CW|SSB|USB|LSB|AM|FM|FT8|FT4|RTTY|PSK31|PSK|JT65|MSK144|Q65|SSTV|DV)\b/); return m ? (m[1] === "USB" || m[1] === "LSB" ? "SSB" : m[1]) : null; };
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
const huella = async t => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(t))));

// destinos externos (sistema B): solo nodos que, según su propia página, admiten spots sin registro ni contraseña.
// Para añadir otro con permiso, copia una línea; para pararlo sin borrarlo, pon «activo: false».
const DESTINOS = [
  // SpottedHam (KM6HBH-1): su página permite anunciar sin cuenta ni contraseña y conectar programas de log.
  { nombre: "SpottedHam", tipo: "telnet", host: "spottedham.com", puerto: 7300, activo: true },
  // WA9PIE-2: «todos son bienvenidos a conectarse» (ARRL, 2016); no filtra spots y está enlazado con nodos de todo el mundo.
  { nombre: "WA9PIE", tipo: "telnet", host: "dxc.wa9pie.net", puerto: 8000, activo: true },
  // EA7JXH (Málaga, CC Cluster): «free for all to use and requires no registration or password», con indicativo válido.
  { nombre: "EA7JXH", tipo: "telnet", host: "dx.ea7jxh.eu", puerto: 7300, activo: true },
];

// ---- almacén: D1 si está enlazado; si no, KV ----
const ESQUEMA = "CREATE TABLE IF NOT EXISTS spots (id TEXT PRIMARY KEY, ts INTEGER NOT NULL, de TEXT NOT NULL, dx TEXT NOT NULL, f REAL NOT NULL, banda TEXT, modo TEXT, info TEXT, estado TEXT, clave TEXT, retirado INTEGER DEFAULT 0)";
let esquemaListo = false;
async function d1(env) { if (!env || !env.DB) return null; if (!esquemaListo) { await env.DB.prepare(ESQUEMA).run(); await env.DB.prepare("CREATE INDEX IF NOT EXISTS spots_ts ON spots(ts)").run(); esquemaListo = true; } return env.DB; }
const publico = r => ({ id: r.id, ts: r.ts, de: r.de, dx: r.dx, f: r.f, banda: r.banda, modo: r.modo, info: r.info, estado: typeof r.estado === "string" ? JSON.parse(r.estado || "{}") : (r.estado || {}) });
async function listaKV(env) { if (!env || !env.SPOTS) return []; try { const a = JSON.parse(await env.SPOTS.get("recientes") || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
async function recientesDe(env, horas = 1) {
  const desde = Date.now() - horas * 3600000, db = await d1(env);
  if (db) { const { results } = await db.prepare("SELECT id, ts, de, dx, f, banda, modo, info, estado FROM spots WHERE ts > ? AND retirado = 0 ORDER BY ts DESC LIMIT 100").bind(desde).all(); return (results || []).map(publico); }
  return (await listaKV(env)).filter(x => x && x.ts > desde && !x.retirado).map(publico).reverse();
}
async function duplicado(env, dx, f) { return (await recientesDe(env, 1 / 6)).find(x => x.dx === dx && Math.abs(x.f - f) <= 1) || null; }
async function guardaSpot(env, sp) {
  const db = await d1(env);
  if (db) { await db.prepare("INSERT INTO spots (id, ts, de, dx, f, banda, modo, info, estado, clave) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(sp.id, sp.ts, sp.de, sp.dx, sp.f, sp.banda, sp.modo, sp.info, JSON.stringify(sp.estado), sp.clave).run(); return "D1"; }
  if (env && env.SPOTS) { const a = (await listaKV(env)).filter(x => Date.now() - x.ts < 3600000).concat([sp]).slice(-80); await env.SPOTS.put("recientes", JSON.stringify(a), { expirationTtl: 7200 }); return "KV"; }
  return null;
}
async function cambiaSpot(env, id, cambio) {
  const db = await d1(env);
  if (db) {
    if (cambio.estado) await db.prepare("UPDATE spots SET estado = ? WHERE id = ?").bind(JSON.stringify(cambio.estado), id).run();
    if (cambio.retirado) await db.prepare("UPDATE spots SET retirado = 1 WHERE id = ?").bind(id).run();
    return;
  }
  if (env && env.SPOTS) { const a = await listaKV(env); const x = a.find(z => z.id === id); if (!x) return; Object.assign(x, cambio); await env.SPOTS.put("recientes", JSON.stringify(a), { expirationTtl: 7200 }); }
}
async function claveDe(env, id) {
  const db = await d1(env);
  if (db) { const r = await db.prepare("SELECT clave FROM spots WHERE id = ?").bind(id).first(); return r ? r.clave : null; }
  const x = (await listaKV(env)).find(z => z.id === id); return x ? x.clave : null;
}

async function spot(request, origen, env, ctx) {
  if (!origen || origen === "null" || !ORIGENES.includes(origen)) return json({ status: "origen no permitido" }, 403, origen);
  if (+(request.headers.get("Content-Length") || 0) > 1024) return json({ status: "demasiado largo" }, 413, origen);
  let d; try { d = JSON.parse((await request.text()).slice(0, 1024)); } catch (e) { return json({ status: "datos no válidos" }, 400, origen); }
  const de = String(d.de_call || "").trim().toUpperCase(), dx = String(d.dx_call || "").trim().toUpperCase();
  const f = Math.round(parseFloat(d.frequency) * 10) / 10, info = String(d.info || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 30);
  if (!INDICATIVO.test(de) || !INDICATIVO.test(dx) || de === dx) return json({ status: "indicativo no válido" }, 400, origen);
  if (!(f >= 1800 && f <= 450000)) return json({ status: "frecuencia no válida" }, 400, origen);
  const banda = bandaDe(f);
  if (!banda) return json({ status: "frecuencia fuera de las bandas de aficionado" }, 400, origen);
  if (!(env && (env.DB || env.SPOTS))) return json({ status: "clúster interno sin almacén enlazado" }, 503, origen);
  // un spot cada 30 segundos por conexión (caché del propio Worker; no se guarda la dirección)
  const cache = caches.default, llave = new Request("https://acracb-dx.invalid/rl/" + await huella(request.headers.get("CF-Connecting-IP") || "x"));
  if (await cache.match(llave)) return json({ status: "espera unos segundos" }, 429, origen);
  await cache.put(llave, new Response("1", { headers: { "Cache-Control": "max-age=30" } }));
  try {
    const dup = await duplicado(env, dx, f);
    if (dup) return json({ status: "duplicado", spot: dup }, 409, origen);
    const clave = hex(crypto.getRandomValues(new Uint8Array(16)));
    const estado = Object.fromEntries(DESTINOS.filter(x => x.activo).map(x => [x.nombre, "pendiente"]));
    const sp = { id: crypto.randomUUID(), ts: Date.now(), de, dx, f, banda, modo: modoDe(info), info, estado, clave: await huella(clave) };
    const donde = await guardaSpot(env, sp);
    const activos = DESTINOS.filter(x => x.activo);
    if (activos.length) ctx.waitUntil(difunde(env, sp, activos));
    return json({ status: "ok", almacen: donde, clave, spot: publico(sp) }, 200, origen);
  } catch (e) {
    console.error("clúster interno: no se pudo guardar", String(e && e.message || e));
    return json({ status: "no se pudo guardar el spot" }, 500, origen);
  }
}
// sistema B: después de publicar, cada destino activo por separado; un intento por destino, sin reintentos repetidos
async function difunde(env, sp, activos) {
  const estado = Object.assign({}, sp.estado);
  await Promise.all(activos.map(async x => {
    const r = await porTelnet(x, sp.de, sp.dx, sp.f, sp.info);
    estado[x.nombre] = r.ok ? (r.visto ? "aceptado" : "enviado") : "error: " + r.msg;
    if (!r.ok) console.warn("difusión", x.nombre, sp.id, r.msg);
  }));
  try { await cambiaSpot(env, sp.id, { estado }); } catch (e) { console.error("estado no guardado", sp.id, String(e)); }
}
async function recientes(origen, env) {
  try { return json(await recientesDe(env, 1), 200, origen); }
  catch (e) { console.error("recientes", String(e)); return json([], 200, origen); }
}
async function retirar(request, origen, env) {
  if (!origen || origen === "null" || !ORIGENES.includes(origen)) return json({ status: "origen no permitido" }, 403, origen);
  let d; try { d = JSON.parse((await request.text()).slice(0, 512)); } catch (e) { return json({ status: "datos no válidos" }, 400, origen); }
  const id = String(d.id || ""), clave = String(d.clave || "");
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[0-9a-f]{32}$/.test(clave)) return json({ status: "datos no válidos" }, 400, origen);
  const h = await claveDe(env, id);
  if (!h || h !== await huella(clave)) return json({ status: "no autorizado" }, 403, origen);
  await cambiaSpot(env, id, { retirado: 1 });
  return json({ status: "ok" }, 200, origen);
}
// sesión telnet corta por spot (entrar con el indicativo del autor, «dx», salir): el Worker no mantiene sesiones abiertas
async function porTelnet(n, de, dx, f, info) {
  let sock;
  try {
    sock = connect({ hostname: n.host, port: n.puerto });
    const w = sock.writable.getWriter(), r = sock.readable.getReader(), dec = new TextDecoder();
    let buf = "", fin = false;
    (async () => { try { for (;;) { const { done, value } = await r.read(); if (done) break; buf += dec.decode(value, { stream: true }); if (buf.length > 65536) buf = buf.slice(-16384); } } catch (e) {} fin = true; })();
    const espera = async (re, ms, desde = 0) => { const lim = Date.now() + ms; while (Date.now() < lim && !fin) { if (re.test(buf.slice(desde))) return true; await new Promise(z => setTimeout(z, 100)); } return re.test(buf.slice(desde)); };
    const manda = t => w.write(new TextEncoder().encode(t + "\r\n"));
    if (!await espera(/login:|call(sign)?:|enter your call/i, 7000)) return { ok: false, msg: "no pidió el indicativo" };
    const tras = buf.length;
    await manda(de);
    if (!await espera(/>\s*$|dxspider|cc ?cluster|welcome|hello|password/i, 7000, tras)) return { ok: false, msg: "no dejó entrar" };
    if (/password/i.test(buf.slice(tras))) { try { await manda("bye"); } catch (e) {} return { ok: false, msg: "pide contraseña" }; }
    await new Promise(z => setTimeout(z, 600));
    const desde = buf.length;
    await manda(`dx ${f.toFixed(1)} ${dx} ${info}`.trim());
    await espera(/DX de|sorry|not (allowed|registered)|registered|invalid|error/i, 4000, desde);
    const resp = buf.slice(desde);
    try { await manda("bye"); } catch (e) {}
    if (/sorry|not allowed|not registered|need to (be )?regist|invalid|error/i.test(resp)) return { ok: false, msg: resp.replace(/\s+/g, " ").trim().slice(0, 60) || "lo rechazó" };
    return { ok: true, visto: /DX de/i.test(resp), msg: "ok" };
  } catch (e) { return { ok: false, msg: "no respondió" };
  } finally { try { sock && sock.close(); } catch (e) {} }
}

export default {
  async fetch(request, env, ctx) {
    const origen = request.headers.get("Origin");
    if (origen && !ORIGENES.includes(origen)) return texto("Origen no permitido", 403, null);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cabeceras(origen) });
    const ruta = new URL(request.url).pathname;
    if (request.method === "POST" && ruta === "/spot") return spot(request, origen, env, ctx);
    if (request.method === "POST" && ruta === "/retirar") return retirar(request, origen, env);
    if (request.method === "GET" && ruta === "/recientes") return recientes(origen, env);
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
