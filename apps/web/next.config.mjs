/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // served from R2 via apps/worker-api, not Next's image optimizer
  },
  experimental: {
    optimizePackageImports: ["@ulyah/shared"],
  },
};

export default nextConfig;
