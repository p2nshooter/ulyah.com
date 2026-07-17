import { NextResponse, type NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";

/**
 * Dynamic, locale-aware manifest for the standalone "Qur'an Flipbook"
 * mini-app — same independently-installable pattern as manifest-radio and
 * manifest-sholat: its own narrow scope/id so installing it (or any other
 * ULYAH widget) never hides another widget's install button.
 */
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("locale") ?? "";
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  const manifest = {
    name: "Al-Qur'an Flipbook — ULYAH",
    short_name: "Qur'an Flipbook",
    description: "Mushaf yang bisa dibalik halamannya langsung di browser, siap dipasang sebagai aplikasi tersendiri.",
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
