import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/*/admin", "/*/akun"] }],
    sitemap: "https://ulyah.com/sitemap.xml",
  };
}
