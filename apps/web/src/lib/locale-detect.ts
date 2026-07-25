import { LOCALE_SITE, DEFAULT_LOCALE, isValidLocale, isLocaleReady } from "@ulyah/shared/i18n";

/**
 * Which language a visitor gets, decided from signals alone.
 *
 * Pulled out of the middleware so it can be run and checked directly
 * (scripts/check-locale-detect.ts) instead of only in production, because it
 * was silently sending Googlebot away from every canonical page:
 *
 *   Googlebot crawls from US addresses and keeps no cookies. cf-ipcountry=US
 *   mapped to "en"; "en" counted as usable because it has its own site; so
 *   https://ulyah.com/quran answered 307 → /en/quran — a page ulyah.com marks
 *   noindex on purpose, since English lives on xad.es. Every one of the 6,333
 *   urls in the sitemap did that. Google was being invited to the site and
 *   redirected, at the door, to a page it is told not to index.
 *
 * The rule that fixes it: a language that has its OWN domain is never chosen
 * automatically. Choosing English is not a language switch on ulyah.com, it is
 * a trip to xad.es — a visitor's explicit decision, never a guess from an IP
 * address.
 */

/** Countries whose majority language is one we serve. Deliberately conservative:
 *  multi-lingual countries are left to Accept-Language rather than guessed. */
export const COUNTRY_TO_LOCALE: Record<string, string> = {
  ID: "id",
  RU: "ru", BY: "ru", KZ: "ru",
  DE: "de", AT: "de", CH: "de", LI: "de",
  FR: "fr", MC: "fr",
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", CL: "es", VE: "es", EC: "es", GT: "es", BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  SA: "ar", AE: "ar", EG: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar", JO: "ar", IQ: "ar", MA: "ar", DZ: "ar", TN: "ar", LB: "ar", YE: "ar", LY: "ar",
  CN: "zh", TW: "zh", HK: "zh", MO: "zh", SG: "zh",
  JP: "ja",
  GB: "en", US: "en", AU: "en", CA: "en", NZ: "en", IE: "en", IN: "en", PH: "en",
};

/** Every locale code any build has ever served, so an old indexed /en/… URL on a
 *  single-language build is REPLACED rather than stacked into /fr/en/… (a 404). */
export const KNOWN_LOCALE_PREFIXES = new Set(["id", "en", "ru", "de", "fr", "es", "ar", "zh", "ja"]);

/**
 * The single-language sites. Each ships only its native language, so there is
 * nothing to detect: geo-detecting here would land a French reader on English
 * (owner: "setiap website pakai bahasa native-nya sebagai default, bukan hasil
 * translate, jangan bahasa Inggris").
 *
 * xad.es was missing from this list. It happened to behave because English is
 * its default anyway, but relying on a coincidence is how the ulyah bug got in.
 */
export const SIBLING_TENANTS = new Set(["1fr", "tilawa", "dawa", "xad"]);

export function localeFromAcceptLanguage(header: string | null | undefined): string | null {
  if (!header) return null;
  const preferred = header.split(",").map((p) => p.split(";")[0]!.trim().toLowerCase().slice(0, 2));
  for (const p of preferred) {
    if (isValidLocale(p)) return p;
  }
  return null;
}

/** In this build AND switched on by the owner. `enabled` is the admin list, or
 *  null when it could not be read — then the built-in readiness gate decides. */
export function isUsable(code: string, enabled: string[] | null): boolean {
  if (!isValidLocale(code)) return false;
  // A language with its own site is always REACHABLE — choosing it leaves for
  // that domain rather than translating anything here.
  if (code === DEFAULT_LOCALE || LOCALE_SITE[code]) return true;
  return enabled ? enabled.includes(code) : isLocaleReady(code);
}

/**
 * Served on THIS domain, in place.
 *
 * The distinction isUsable misses, and the whole bug: English is reachable from
 * ulyah.com (the switcher offers it) but is not served BY ulyah.com — it is
 * served by xad.es. Only a language that is genuinely rendered here may be
 * picked for someone who never asked.
 */
export function servedInPlace(code: string, enabled: string[] | null): boolean {
  if (!isUsable(code, enabled)) return false;
  return code === DEFAULT_LOCALE || !LOCALE_SITE[code];
}

export type LocaleSignals = {
  cookie?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
  /** Codes switched on in the admin portal, or null if the list is unavailable. */
  enabled: string[] | null;
  /** NEXT_PUBLIC_TENANT — a single-language site never detects. */
  tenant: string;
};

export function pickLocale(sig: LocaleSignals): string {
  // A remembered choice counts only while that language is still served HERE. A
  // visitor who once tried Thai must not stay pinned to a locked language, and
  // a stale "en" cookie must not pin them to a noindex twin of xad.es.
  if (sig.cookie && servedInPlace(sig.cookie, sig.enabled)) return sig.cookie;

  if (SIBLING_TENANTS.has(sig.tenant)) return DEFAULT_LOCALE; // native language, always

  const country = sig.country?.toUpperCase();
  const byCountry = country ? COUNTRY_TO_LOCALE[country] : undefined;
  if (byCountry && servedInPlace(byCountry, sig.enabled)) return byCountry;

  const byHeader = localeFromAcceptLanguage(sig.acceptLanguage);
  if (byHeader && servedInPlace(byHeader, sig.enabled)) return byHeader;

  // Nothing to go on: the site's OWN language (owner: "defaultnya indonesia").
  return DEFAULT_LOCALE;
}
