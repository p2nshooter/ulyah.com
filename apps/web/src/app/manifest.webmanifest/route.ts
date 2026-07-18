import { NextResponse, type NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";

/**
 * Per-tenant PWA manifest — replaces the static, ulyah-only
 * /public/manifest.json so each site installs as its OWN app with the right
 * name, icon and colours (owner: "semua website warna aplikasi harus seimbang
 * dengan website"): tilawa.de must not install as a green "Ulyah" app, 1fr.fr
 * must not either. Built at request time from the build-time TENANT, and
 * locale-aware (?locale=xx) so the installed app opens in the language it was
 * installed from.
 */
const THEME: Record<string, { theme: string; bg: string }> = {
  ulyah: { theme: "#0B3D2E", bg: "#06251b" }, // emerald, dark splash
  "1fr": { theme: "#17294a", bg: "#fbf8f0" }, // navy on ivory (light identity)
  tilawa: { theme: "#14181d", bg: "#14181d" }, // charcoal
};

const NAME: Record<string, string> = {
  ulyah: "Ulyah — Listen to Islam",
  "1fr": "One Faith France",
  tilawa: "Tilawa — Islam hören",
};

const DESC: Record<string, string> = {
  ulyah: "Al-Qur'an, tafsir, hadits, dan kisah-kisah Islami dalam pengalaman audio yang tenang dan mendalam.",
  "1fr": "Le Coran, le tafsir, les hadiths et les récits islamiques dans une expérience audio apaisante.",
  tilawa: "Der Koran, Tafsir, Hadithe und islamische Geschichten in einem ruhigen Hörerlebnis.",
};

function icons() {
  if (TENANT.id === "ulyah") {
    return [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ];
  }
  if (TENANT.id === "tilawa") {
    return [
      { src: "/brand/tilawa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/tilawa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/tilawa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ];
  }
  // 1fr (and any future sibling): one square icon declared at both sizes.
  return [
    { src: TENANT.logoIcon, sizes: "192x192", type: "image/png" },
    { src: TENANT.logoIcon, sizes: "512x512", type: "image/png" },
    { src: TENANT.logoIcon, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ];
}

export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("locale") ?? "";
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = THEME[TENANT.id] ?? THEME.ulyah!;

  const manifest = {
    name: NAME[TENANT.id] ?? TENANT.siteName,
    short_name: TENANT.siteName,
    description: DESC[TENANT.id] ?? DESC.ulyah!,
    id: "/",
    start_url: `/${locale}`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: t.bg,
    theme_color: t.theme,
    icons: icons(),
    categories: ["education", "books", "lifestyle"],
    lang: locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    prefer_related_applications: false,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
