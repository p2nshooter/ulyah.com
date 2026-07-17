import { NextResponse, type NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";

/**
 * Dynamic, locale-aware manifest for the "Jadwal Sholat" mini-app — replaces
 * the old static /public/manifest-sholat.json, which hardcoded
 * `start_url`/`scope` to "/id/jadwal-sholat" no matter which locale the
 * visitor actually installed from. Two real problems that fixes:
 *
 * 1. A visitor installing from any non-Indonesian locale page (e.g.
 *    /fr/jadwal-sholat) still got an installed app whose start_url opens the
 *    Indonesian page — wrong language on every launch.
 * 2. Scope was locked to exactly "/id/jadwal-sholat" — any in-app navigation
 *    elsewhere on the site (home logo, language switcher, footer links) fell
 *    outside that scope and kicked the visitor out of the installed app's
 *    standalone window into the regular browser, which reads as broken.
 *
 * Fix: build `start_url` from the real locale the visitor installed from
 * (?locale=xx, passed by the page that links here) and widen `scope` to "/"
 * so any same-origin navigation stays inside the installed app shell.
 */
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("locale") ?? "";
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  const manifest = {
    name: "Jadwal Sholat & Radio Qori — ULYAH",
    short_name: "Jadwal Sholat",
    description:
      "Jadwal sholat sesuai lokasi Anda, hitung mundur Ramadhan, jam dunia, dan Radio Qori Dunia yang selalu hidup.",
    // Narrow, app-specific scope + id so this installs as its own standalone
    // app independent of the main ULYAH app and the Radio app — otherwise a
    // shared "/" scope makes the browser treat one install as covering all of
    // them and the per-widget install buttons never appear.
    id: `/${locale}/jadwal-sholat`,
    start_url: `/${locale}/jadwal-sholat`,
    scope: `/${locale}/jadwal-sholat`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#06251b",
    theme_color: "#0B3D2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["lifestyle", "utilities", "education"],
    lang: locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    related_applications: [{ platform: "webapp", url: `${req.nextUrl.origin}/manifest-sholat.webmanifest` }],
    prefer_related_applications: false,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
