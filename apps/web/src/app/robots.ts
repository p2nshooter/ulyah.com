import type { MetadataRoute } from "next";
import { TENANT } from "@/lib/tenant";

// Served at https://ulyah.com/robots.txt. Googlebot (search) and
// Mediapartners-Google (the AdSense ad crawler) are allowed explicitly — the
// AdSense reviewer checks that its crawler is not blocked. Only the private
// admin portal and personal donor dashboard are disallowed; every content
// surface (/quran, /hadits, /kisah, /kitab, /audiobook, /cari, …) stays open.
//
// Owner, 1 Nov 2026: "Matikan seluruh robot yg memblokir crawler google". Cloudflare's managed robots.txt
// puts "Disallow: /" groups for Google-Extended, GoogleOther and Google-CloudVertexBot in front of this
// file. Google merges every group that names the same crawler and, when an Allow and a Disallow rule tie,
// follows the least restrictive one (Google's robots.txt specification), so the group below re-opens the
// site to those Google crawlers with the same private paths closed as for everyone else.
const GOOGLE_CRAWLERS_REOPENED = ["Google-Extended", "GoogleOther", "Google-CloudVertexBot"];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/*/admin", "/*/akun"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: "Googlebot", allow: "/", disallow },
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "AdsBot-Google", allow: "/" },
      { userAgent: GOOGLE_CRAWLERS_REOPENED, allow: "/", disallow },
    ],
    sitemap: [`${TENANT.siteUrl}/sitemap.xml`, `${TENANT.siteUrl}/sitemap.txt`],
    host: TENANT.siteUrl,
  };
}
