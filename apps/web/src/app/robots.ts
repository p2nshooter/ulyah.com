import type { MetadataRoute } from "next";

// Served at https://ulyah.com/robots.txt. Googlebot (search) and
// Mediapartners-Google (the AdSense ad crawler) are allowed explicitly — the
// AdSense reviewer checks that its crawler is not blocked. Only the private
// admin portal and personal donor dashboard are disallowed; every content
// surface (/quran, /hadits, /kisah, /kitab, /audiobook, /cari, …) stays open.
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/*/admin", "/*/akun"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: "Googlebot", allow: "/", disallow },
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "AdsBot-Google", allow: "/" },
    ],
    sitemap: ["https://ulyah.com/sitemap.xml", "https://ulyah.com/sitemap.txt"],
    host: "https://ulyah.com",
  };
}
