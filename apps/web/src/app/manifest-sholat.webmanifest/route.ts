import { NextResponse, type NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";

// Native-language app name/description per locale — a sibling site must
// never install an app named "ULYAH" with an Indonesian description
// (owner: language + branding purity on every surface, manifests included).
const SHOLAT_COPY: Record<string, { name: string; short: string; desc: string }> = {
  id: {
    name: `Jadwal Sholat & Radio Qori — ${TENANT.siteName}`,
    short: "Jadwal Sholat",
    desc: "Jadwal sholat sesuai lokasi Anda, hitung mundur Ramadhan, jam dunia, dan Radio Qori Dunia yang selalu hidup.",
  },
  en: {
    name: `Prayer Times & Qori Radio — ${TENANT.siteName}`,
    short: "Prayer Times",
    desc: "Prayer times for your location, Ramadan countdown, world clocks, and the always-on World Reciters Radio.",
  },
  fr: {
    name: `Heures de prière & Radio — ${TENANT.siteName}`,
    short: "Heures de prière",
    desc: "Les heures de prière selon votre position, le compte à rebours du Ramadan, les horloges mondiales et la radio des récitateurs toujours en direct.",
  },
  de: {
    name: `Gebetszeiten & Radio — ${TENANT.siteName}`,
    short: "Gebetszeiten",
    desc: "Gebetszeiten für deinen Standort, Ramadan-Countdown, Weltuhren und das immer laufende Rezitatoren-Radio.",
  },
  es: {
    name: `Horarios de oración y Radio — ${TENANT.siteName}`,
    short: "Horarios de oración",
    desc: "Horarios de oración según tu ubicación, cuenta atrás del Ramadán, relojes del mundo y la radio de recitadores siempre en directo.",
  },
};

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

  const copy = SHOLAT_COPY[locale] ?? SHOLAT_COPY.en!;
  const manifest = {
    name: copy.name,
    short_name: copy.short,
    description: copy.desc,
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
