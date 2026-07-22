// Service worker: makes the site installable AND makes the installed app open
// RELIABLY — even on a cold, slow or dropped mobile connection. The previous
// version only cached static assets and let every navigation hit the network
// unguarded, so launching the installed app on a flaky link showed a blank
// screen ("harus buka browser dulu, sering ga kebuka"). Now navigations are
// network-first WITH A TIMEOUT and fall back to a cached app shell, so the app
// always opens instantly and refreshes in the background when online.
//
// Bump CACHE on every deploy that changes a fixed-path cached asset's content
// (icons, wordmark PNGs) — those paths never change name, so activate() must
// throw the old cache away.
const CACHE = "ulyah-shell-v11c"; // v11c: bigger wordmark + boat rock
const SHELL = "/"; // the app's start_url (canonical bare path)
const NAV_TIMEOUT = 3500; // ms before we serve the cached shell instead of waiting

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add(SHELL))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => clients.claim())
  )
);

// Network-first-with-timeout for page navigations. Whichever answers first —
// the network, or (after NAV_TIMEOUT) the cached shell — wins; a successful
// network response is always cached for the next launch, and a total network
// failure falls back to the cached page, then the cached shell, then a tiny
// inline offline notice. The result: the installed app opens every time.
function navigate(request) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (r) => {
      if (!settled && r) {
        settled = true;
        resolve(r);
      }
    };
    const timer = setTimeout(async () => {
      const cached = (await caches.match(request)) || (await caches.match(SHELL));
      settle(cached);
    }, NAV_TIMEOUT);

    fetch(request)
      .then((res) => {
        clearTimeout(timer);
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        }
        settle(res);
      })
      .catch(async () => {
        clearTimeout(timer);
        const cached = (await caches.match(request)) || (await caches.match(SHELL));
        settle(
          cached ||
            new Response(
              "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><body style='font-family:system-ui;padding:2rem;text-align:center;color:#0B3D2E'><h1>Offline</h1><p>Sambungan terputus. Coba buka lagi setelah terhubung.</p>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            )
        );
      });
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;

  // Page navigations (this is what a home-screen launch triggers).
  if (req.mode === "navigate") {
    e.respondWith(navigate(req));
    return;
  }

  // Fixed-path static assets: cache-first (fast, offline-friendly).
  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      })
    );
  }
});
