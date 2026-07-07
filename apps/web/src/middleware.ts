import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, isValidLocale } from "@ulyah/shared/i18n";

const LOCALE_COOKIE = "ulyah_locale";

/**
 * Country -> language mapping for first-visit geo detection. Deliberately
 * conservative: only maps countries whose majority/official language is one
 * of our 8 supported locales. Everything else falls back to English, per
 * explicit product requirement ("jika bahasa tidak tersedia... default
 * bahasa Inggris"). Indonesian visitors (CF-IPCountry=ID) always get full
 * Indonesian, per explicit requirement.
 */
const COUNTRY_TO_LOCALE: Record<string, string> = {
  ID: "id",
  RU: "ru", BY: "ru", KZ: "ru",
  DE: "de", AT: "de", CH: "de", LI: "de",
  FR: "fr", MC: "fr", // Belgium/Canada/Switzerland are multi-lingual — left to Accept-Language instead of a blanket guess
  SA: "ar", AE: "ar", EG: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar", JO: "ar", IQ: "ar", MA: "ar", DZ: "ar", TN: "ar", LB: "ar", YE: "ar", LY: "ar",
  CN: "zh", TW: "zh", HK: "zh", MO: "zh", SG: "zh",
  JP: "ja",
  GB: "en", US: "en", AU: "en", CA: "en", NZ: "en", IE: "en", IN: "en", PH: "en",
};

function localeFromAcceptLanguage(header: string | null): string | null {
  if (!header) return null;
  const preferred = header.split(",").map((p) => p.split(";")[0]!.trim().toLowerCase().slice(0, 2));
  for (const p of preferred) {
    if (isValidLocale(p)) return p;
  }
  return null;
}

function detectLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  // Cloudflare appends this header to every request at the edge — no
  // separate geo-IP lookup service needed.
  const country = req.headers.get("cf-ipcountry")?.toUpperCase();
  if (country === "ID") return "id"; // explicit: Indonesian IPs always get full Indonesian
  if (country && COUNTRY_TO_LOCALE[country]) return COUNTRY_TO_LOCALE[country]!;

  const fromHeader = localeFromAcceptLanguage(req.headers.get("accept-language"));
  if (fromHeader) return fromHeader;

  return DEFAULT_LOCALE === "id" ? "en" : DEFAULT_LOCALE; // English is the safe neutral fallback
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets, API proxy routes, and Next internals.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // files like /favicon.ico, /manifest.json
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (maybeLocale && isValidLocale(maybeLocale)) {
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, maybeLocale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  }

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set(LOCALE_COOKIE, locale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
