/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // served from R2 via apps/worker-api, not Next's image optimizer
  },
  experimental: {
    optimizePackageImports: ["@ulyah/shared"],
    // The router must not guess a page's route from the address alone. Every
    // page in the site's own language is served at a bare path that the
    // middleware rewrites (/kitab → /id/kitab), so the guess Next 16 makes by
    // default reads /kitab as the home page with locale "kitab": each prefetch
    // asked for a segment that does not exist (404) and was then repeated
    // dozens of times (docs/ADSENSE-BLUEPRINT.md §19). Asking the server for
    // the route tree gives the rewritten route.
    optimisticRouting: false,
  },
  // Cache policy so a fresh deploy is visible immediately (owner: "dr td g ada
  // yg berubah" — the browser was serving a stale cached page after each
  // deploy). Content-hashed build assets stay immutable forever; the HTML
  // document must be revalidated every load, so a redeploy that points at a new
  // hashed CSS/JS bundle is picked up on the very next visit instead of days
  // later. The service worker (public/sw.js) never caches HTML, so these two
  // rules fully control document freshness.
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Everything else (HTML documents, the manifest, sw.js) must revalidate.
        source: "/:path*",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
