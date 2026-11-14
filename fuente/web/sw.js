/* ACRACB · Plataforma DX
   - Muestra las notificaciones y abre la web al tocarlas.
   - Guarda en el dispositivo la previsión VOACAP de tu zona (no cambia nunca) para no volver a descargarla.
   - La página se pide siempre a la red; si tarda más de 4 s o no hay conexión, se abre la última copia guardada.
   No guarda nada tuyo: el log ADIF y tus ajustes siguen solo en el navegador.
   Lo guardado tiene tope: las 6 últimas zonas VOACAP y solo la versión actual del código. */
const PAGE = "acracb-page-v2", DATA = "acracb-hubs-v3";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== PAGE && k !== DATA) await caches.delete(k);
  await self.clients.claim();
})()));
/* archivos con huella (lib/app1-es-1a2b3c4d5e.js): al guardar uno nuevo se borran las versiones viejas del mismo nombre,
   para que lo guardado en el dispositivo no crezca con cada actualización */
const HASHED = /\/lib\/([a-z0-9-]+)-[0-9a-f]{10}\.js$/;
/* zonas VOACAP: se guardan como mucho las 6 últimas usadas (cada una ocupa ~1 MB por mes) */
const ZONE = /\/hubs\/v\d+\/([A-Za-z0-9]+)\//, MAXZ = 6;
async function pruneZones(c) {
  const order = [];
  for (const k of await c.keys()) { const m = new URL(k.url).pathname.match(ZONE); if (m) { const i = order.indexOf(m[1]); if (i >= 0) order.splice(i, 1); order.push(m[1]); } }
  if (order.length <= MAXZ) return;
  const drop = new Set(order.slice(0, order.length - MAXZ));
  for (const k of await c.keys()) { const m = new URL(k.url).pathname.match(ZONE); if (m && drop.has(m[1])) await c.delete(k); }
}
async function prune(c, url) {
  if (ZONE.test(new URL(url).pathname)) return pruneZones(c);
  const m = new URL(url).pathname.match(HASHED); if (!m) return;
  for (const k of await c.keys()) { const n = new URL(k.url).pathname.match(HASHED); if (n && n[1] === m[1] && k.url !== url) await c.delete(k); }
}
async function dataFirst(req) {
  const c = await caches.open(DATA), hit = await c.match(req);
  if (hit) return hit;
  const r = await fetch(req, { credentials: "omit" });
  if (r.ok && r.status === 200 && (r.type === "basic" || r.type === "cors")) { await c.put(req, r.clone()); prune(c, req.url).catch(() => {}); }
  return r;
}
async function pageFirst(req) {
  const c = await caches.open(PAGE);
  /* se pregunta siempre al servidor (sin usar la copia de 10 min del navegador): una versión nueva se ve al recargar */
  let fresh = req; try { fresh = new Request(req.url, { cache: "no-cache", credentials: "same-origin", redirect: "follow" }); } catch (e) {}
  const net = fetch(fresh).then(r => { if (r.ok) c.put(req, r.clone()); return r; });
  const slow = new Promise(res => setTimeout(res, 4000));
  try {
    const r = await Promise.race([net, slow.then(() => null)]);
    if (r) return r;
    const old = await c.match(req, { ignoreSearch: true });
    return old || await net;
  } catch (e) {
    const old = await c.match(req, { ignoreSearch: true });
    if (old) return old;
    throw e;
  }
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  /* zonas VOACAP en Cloudflare Pages: también se guardan en el dispositivo */
  if ((u.origin === "https://acracb-voacap.pages.dev" || u.origin === "https://acracb-voacap-respaldo.pages.dev") && u.pathname.includes("/hubs/")) { e.respondWith(dataFirst(req)); return; }
  if (u.origin !== location.origin) return;
  if (u.pathname.includes("/hubs/") || u.pathname.includes("/lib/")) { e.respondWith(dataFirst(req)); return; }
  if (req.mode === "navigate" || /\.(html|json|png|svg|webmanifest)$/.test(u.pathname) || u.pathname.endsWith("/")) e.respondWith(pageFirst(req));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ("focus" in w) return w.focus();
    return self.clients.openWindow("./");
  }));
});
