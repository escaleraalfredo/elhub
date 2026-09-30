// ElHub service worker: keeps the app usable with weak signal or during
// outages. Pages and API data are network-first with a cached fallback;
// static assets are cache-first. The emergency page is precached.
const VERSION = "elhub-v1";
const PRECACHE = ["/", "/utilidades/emergencia", "/utilidades/clima", "/utilidades/luz"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    if (request.mode === "navigate") return (await cache.match("/utilidades/emergencia")) || Response.error();
    return Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
  }
});
