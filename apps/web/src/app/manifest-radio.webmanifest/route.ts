import { NextResponse, type NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";

/**
 * Dynamic, locale-aware manifest for the standalone "Radio Qur'an Dunia"
 * mini-app — the installable counterpart to /[locale]/radio. Same design as
 * manifest-sholat.webmanifest: a separate `id` from the main site so the
 * radio can be installed as its own always-on app, `start_url` built from the
 * locale the visitor actually installed from, and `scope: "/"` so any
 * in-app navigation stays inside the installed window instead of getting
 * kicked out to a browser tab.
 */
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("locale") ?? "";
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  const manifest = {
    name: "Radio Qur'an Dunia — ULYAH",
    short_name: "Radio Qur'an",
    description:
      "Al-Qur'an dibacakan tanpa henti 24 jam oleh para qori dunia — radio murottal yang selalu hidup, siap dipasang di layar depan Anda.",
    id: "/radio",
    start_url: `/${locale}/radio`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#06251b",
    theme_color: "#0B3D2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["music", "education", "lifestyle"],
    lang: locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    related_applications: [{ platform: "webapp", url: `${req.nextUrl.origin}/manifest-radio.webmanifest` }],
    prefer_related_applications: false,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
