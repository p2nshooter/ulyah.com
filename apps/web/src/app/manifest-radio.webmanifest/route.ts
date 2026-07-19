import { NextResponse, type NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";

// Native-language app name/description per locale — never an Indonesian
// "ULYAH" manifest on a sibling site.
const RADIO_COPY: Record<string, { name: string; short: string; desc: string }> = {
  id: {
    name: `Radio Qur'an Dunia — ${TENANT.siteName}`,
    short: "Radio Qur'an",
    desc: "Al-Qur'an dibacakan tanpa henti 24 jam oleh para qori dunia — radio murottal yang selalu hidup, siap dipasang di layar depan Anda.",
  },
  en: {
    name: `World Qur'an Radio — ${TENANT.siteName}`,
    short: "Qur'an Radio",
    desc: "The Qur'an recited nonstop 24h by world reciters — an always-on murottal radio, ready to install on your home screen.",
  },
  fr: {
    name: `Radio Coran du Monde — ${TENANT.siteName}`,
    short: "Radio Coran",
    desc: "Le Coran récité sans interruption 24 h/24 par les récitateurs du monde — une radio toujours en direct, prête à installer sur votre écran d'accueil.",
  },
  de: {
    name: `Welt-Koranradio — ${TENANT.siteName}`,
    short: "Koranradio",
    desc: "Der Koran rund um die Uhr von Rezitatoren aus aller Welt vorgetragen — ein immer laufendes Radio, bereit für deinen Startbildschirm.",
  },
  es: {
    name: `Radio del Corán del Mundo — ${TENANT.siteName}`,
    short: "Radio del Corán",
    desc: "El Corán recitado sin pausa 24 h por recitadores de todo el mundo — una radio siempre en directo, lista para instalar en tu pantalla de inicio.",
  },
};

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

  const copy = RADIO_COPY[locale] ?? RADIO_COPY.en!;
  const manifest = {
    name: copy.name,
    short_name: copy.short,
    description: copy.desc,
    // A NARROW, app-specific scope + id so the browser treats this as its own
    // independently-installable app (like a separate shop app), NOT part of
    // the main ULYAH app: with a shared "/" scope, installing the main app
    // made the browser consider the Radio already installed and hid its
    // install button. A focused widget app that only owns its own route is
    // exactly what "semua app widget wajib bisa di install mandiri" means.
    id: `/${locale}/radio`,
    start_url: `/${locale}/radio`,
    scope: `/${locale}/radio`,
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
