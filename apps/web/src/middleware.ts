import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, isValidLocale } from "@ulyah/shared/i18n";

const LOCALE_COOKIE = "ulyah_locale";

// Dynamic page show/hide (sibling sites). The admin portal marks pages hidden;
// the middleware always runs per-request (unlike a statically-cached page), so
// it is the reliable place to keep a hidden page unreachable. The hidden set is
// fetched from the content API and cached per-isolate for 60s. Fails OPEN.
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT ?? "ulyah";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";
let hiddenCache: { paths: string[]; at: number } | null = null;

async function hiddenPaths(): Promise<string[]> {
  if (TENANT_ID === "ulyah") return [];
  const now = Date.now();
  if (hiddenCache && now - hiddenCache.at < 60_000) return hiddenCache.paths;
  try {
    const res = await fetch(`${API_BASE}/content/site-pages?tenant=${TENANT_ID}`);
    if (res.ok) {
      const j = (await res.json()) as { pages?: { path: string; visible: boolean }[] };
      const paths = (j.pages ?? []).filter((p) => !p.visible).map((p) => p.path);
      hiddenCache = { paths, at: now };
      return paths;
    }
  } catch {
    /* fail open — keep serving the page */
  }
  return hiddenCache?.paths ?? [];
}

function pathIsHidden(hidden: string[], pageless: string): boolean {
  for (const h of hidden) {
    if (h === pageless) return true;
    if (h !== "/" && pageless.startsWith(h + "/")) return true;
  }
  return false;
}

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

// Sibling tenants (1fr.fr, tilawa.de) ship a single native default language
// (fr / de). Owner rule: "setiap website pakai bahasa native-nya sebagai
// default, bukan hasil translate, jangan bahasa Inggris." So on a sibling
// build we do NOT geo/Accept-Language-detect (which would land a visitor on
// English); we honour an explicit cookie only, else the native default.
const IS_SIBLING_TENANT =
  process.env.NEXT_PUBLIC_TENANT === "1fr" || process.env.NEXT_PUBLIC_TENANT === "tilawa";

function detectLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  if (IS_SIBLING_TENANT) return DEFAULT_LOCALE; // native language first

  // Cloudflare appends this header to every request at the edge — no
  // separate geo-IP lookup service needed.
  const country = req.headers.get("cf-ipcountry")?.toUpperCase();
  // Every candidate is validated against isValidLocale, which is build-aware:
  // on the 1fr.fr tenant LOCALES is only fr/en/ar, so a geo/accept-language
  // guess of "id"/"de"/… must NOT be returned — otherwise the middleware
  // redirects to /id, /id isn't a valid prefix on that build, and it loops
  // (ERR_TOO_MANY_REDIRECTS). We fall through to the neutral default instead.
  if (country && COUNTRY_TO_LOCALE[country] && isValidLocale(COUNTRY_TO_LOCALE[country]!)) {
    return COUNTRY_TO_LOCALE[country]!;
  }

  const fromHeader = localeFromAcceptLanguage(req.headers.get("accept-language"));
  if (fromHeader) return fromHeader;

  // Neutral fallback that is always a valid locale in the current build:
  // English on ulyah (default "id" is fine for content but English is the
  // safer neutral guess), the build default (fr) on 1fr.
  const neutral = DEFAULT_LOCALE === "id" ? "en" : DEFAULT_LOCALE;
  return isValidLocale(neutral) ? neutral : DEFAULT_LOCALE;
}

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
};

function withSecurity(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Force HTTPS ONLY when we can prove the *client* used plain HTTP. Inside a
  // Cloudflare Worker (OpenNext) the internal req.nextUrl.protocol is often
  // "http:" even for an HTTPS visitor, and workers.dev never sets
  // x-forwarded-proto — trusting either of those made every request redirect
  // to itself forever (ERR_TOO_MANY_REDIRECTS, owner screenshot). The only
  // header that reflects the true client scheme at Cloudflare is cf-visitor
  // ({"scheme":"https"|"http"}); x-forwarded-proto is the standard-proxy
  // fallback. If neither says "http", assume HTTPS and do NOT redirect.
  const cfScheme = (() => {
    try {
      const v = req.headers.get("cf-visitor");
      return v ? (JSON.parse(v).scheme as string | undefined) : undefined;
    } catch {
      return undefined;
    }
  })();
  const clientProto = cfScheme ?? req.headers.get("x-forwarded-proto") ?? undefined;
  if (clientProto === "http") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return withSecurity(NextResponse.redirect(url, 301));
  }

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
    // A page the admin has hidden for this sibling is sent home (unreachable).
    if (TENANT_ID !== "ulyah") {
      const pageless = "/" + segments.slice(2).join("/");
      if (pathIsHidden(await hiddenPaths(), pageless === "/" ? "/" : pageless.replace(/\/$/, ""))) {
        return withSecurity(NextResponse.redirect(new URL(`/${maybeLocale}`, req.url)));
      }
    }
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
