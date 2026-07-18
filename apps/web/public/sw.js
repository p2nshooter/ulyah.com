// Minimal service worker: makes the site installable as an app and keeps the
// last-visited pages available offline. Audio/API stay network-first.
//
// Bump this on every deploy that changes any cached asset's *content* at a
// *fixed* path (icons, wordmark PNGs — anything not content-hashed by
// Next's build). Those paths never change name, so a browser that cached
// one once (even a bad/interrupted response) would otherwise keep serving
// it forever: this cache-first strategy never revalidates against the
// network on its own. Bumping the name makes `activate` below throw the old
// cache away and start clean.
const CACHE = "ulyah-shell-v3";

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => clients.claim())
  )
);

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(e.request);
        if (hit) return hit;
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone());
        return res;
      })
    );
  }
});
