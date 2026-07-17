/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // served from R2 via apps/worker-api, not Next's image optimizer
  },
  experimental: {
    optimizePackageImports: ["@ulyah/shared"],
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
