import { NextResponse, type NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";

// Native-language app name/description per locale (never Indonesian/ULYAH on
// a sibling site).
const FLIPBOOK_COPY: Record<string, { name: string; short: string; desc: string }> = {
  id: {
    name: `Al-Qur'an Flipbook — ${TENANT.siteName}`,
    short: "Qur'an Flipbook",
    desc: "Mushaf yang bisa dibalik halamannya langsung di browser, siap dipasang sebagai aplikasi tersendiri.",
  },
  en: {
    name: `Qur'an Flipbook — ${TENANT.siteName}`,
    short: "Qur'an Flipbook",
    desc: "A mushaf you can page through right in the browser, installable as its own app.",
  },
  fr: {
    name: `Coran Flipbook — ${TENANT.siteName}`,
    short: "Coran Flipbook",
    desc: "Un mushaf que l'on feuillette directement dans le navigateur, installable comme application indépendante.",
  },
  de: {
    name: `Koran-Flipbook — ${TENANT.siteName}`,
    short: "Koran-Flipbook",
    desc: "Ein Mushaf zum Umblättern direkt im Browser, als eigene App installierbar.",
  },
  es: {
    name: `Corán Flipbook — ${TENANT.siteName}`,
    short: "Corán Flipbook",
    desc: "Un mushaf cuyas páginas puedes pasar directamente en el navegador, instalable como aplicación independiente.",
  },
};

/**
 * Dynamic, locale-aware manifest for the standalone "Qur'an Flipbook"
 * mini-app — same independently-installable pattern as manifest-radio and
 * manifest-sholat: its own narrow scope/id so installing it (or any other
 * ULYAH widget) never hides another widget's install button.
 */
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("locale") ?? "";
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  const copy = FLIPBOOK_COPY[locale] ?? FLIPBOOK_COPY.en!;
  const manifest = {
    name: copy.name,
    short_name: copy.short,
    description: copy.desc,
    id: `/${locale}/quran-flipbook`,
    start_url: `/${locale}/quran-flipbook`,
    scope: `/${locale}/quran-flipbook`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#06251b",
    theme_color: "#0B3D2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["education", "lifestyle", "books"],
    lang: locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    related_applications: [{ platform: "webapp", url: `${req.nextUrl.origin}/manifest-quran-flipbook.webmanifest` }],
    prefer_related_applications: false,
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
