// Canonical locale registry — single source of truth for apps/web (UI +
// routing) and apps/worker-api (translation/TTS lookups), so the two never
// drift out of sync ("jangan setengah-setengah" requirement: changing the
// language must switch 100% of the site consistently).

// Extensionless on purpose. index.ts can use ".js" because nothing bundles it —
// the apps import the "@ulyah/shared/i18n" subpath directly. This file IS
// bundled by Next.js, and webpack will not resolve a ".js" specifier onto a
// ".ts" file, so the extension broke the web build (and only the build: tsc
// resolved it happily, so the typecheck stayed green and the failure did not
// surface until deploy).
import { LOCALE_READINESS, type LocaleReadiness } from "./locale-readiness.gen";

export type { LocaleReadiness };

export interface LocaleDef {
  code: string; // BCP-47-ish, matches `translation.lang` and `voice_persona.lang`
  label: string; // shown in the language switcher, in its own language
  dir: "ltr" | "rtl";
  /** True if `translation` table has real licensed Qur'an translation rows for this lang. */
  hasQuranTranslation: boolean;
  /** Arabic is the ayah's own source language — no separate translation line is shown. */
  isSourceLanguage?: boolean;
  /** Falls back to this lang's ayah translation when hasQuranTranslation is false. */
  fallbackTranslationLang?: string;
}

export const ALL_LOCALES: LocaleDef[] = [
  { code: "id", label: "Bahasa Indonesia", dir: "ltr", hasQuranTranslation: true },
  { code: "en", label: "English", dir: "ltr", hasQuranTranslation: true },
  { code: "ru", label: "Русский", dir: "ltr", hasQuranTranslation: true },
  { code: "de", label: "Deutsch", dir: "ltr", hasQuranTranslation: true },
  { code: "fr", label: "Français", dir: "ltr", hasQuranTranslation: true },
  { code: "es", label: "Español", dir: "ltr", hasQuranTranslation: true },
  { code: "ar", label: "العربية", dir: "rtl", hasQuranTranslation: false, isSourceLanguage: true },
  { code: "zh", label: "中文", dir: "ltr", hasQuranTranslation: true },
  { code: "ja", label: "日本語", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  // Languages with no dedicated ecosystem domain — served on ulyah.com itself.
  // No licensed Qur'an-translation rows yet, so the ayah line falls back to
  // English while the rest of the site (UI + all DB content) is machine-
  // translated and cached in D1. RTL set for Arabic-script languages.
  { code: "ur", label: "اردو", dir: "rtl", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "hi", label: "हिन्दी", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "bn", label: "বাংলা", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "tr", label: "Türkçe", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "fa", label: "فارسی", dir: "rtl", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "ms", label: "Bahasa Melayu", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "sw", label: "Kiswahili", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "pt", label: "Português", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "nl", label: "Nederlands", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "it", label: "Italiano", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "ta", label: "தமிழ்", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "ha", label: "Hausa", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "ps", label: "پښتو", dir: "rtl", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "th", label: "ไทย", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "ko", label: "한국어", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "vi", label: "Tiếng Việt", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "uz", label: "Oʻzbekcha", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "so", label: "Soomaali", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "pl", label: "Polski", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
];

// The four languages that have their OWN ecosystem domain. On ulyah.com they
// still appear in the language switcher, but clicking one jumps straight to
// its site (owner: "arahkan saja ke website nya … langsung pindah domain")
// instead of switching locale in place — the sites cross-promote each other.
export const LOCALE_SITE: Record<string, string> = {
  en: "https://xad.es",
  de: "https://tilawa.de",
  es: "https://dawa.es",
  fr: "https://1fr.fr",
};

// The hub that hosts Indonesian AND every language without its own domain
// (ar/ru/zh/ja plus the India/Turkey/Persia/… set). Its default locale (id)
// lives at bare URLs; the others live under a /<code> prefix.
export const HUB_SITE = "https://ulyah.com";
const HUB_DEFAULT = "id";

/**
 * Absolute canonical URL for a given language's copy of a route — the single
 * source of truth shared by every domain's sitemap so the hreflang graph is
 * consistent no matter which site emits it. A language with its own domain
 * lives there at a bare URL; Indonesian lives bare on the hub; every other
 * language lives on the hub under its /<code> prefix.
 */
export function localeCanonicalUrl(code: string, route = ""): string {
  const domain = LOCALE_SITE[code];
  if (domain) return `${domain}${route}`;
  if (code === HUB_DEFAULT) return `${HUB_SITE}${route}`;
  return `${HUB_SITE}/${code}${route}`;
}

// Tenant narrowing (see apps/web/src/lib/tenant.ts): each sibling site ships
// ONLY its own native language — owner rule: "hanya menggunakan bahasa induk
// extension domain name" (1fr.fr = French only, tilawa.de = German only,
// dawa.es = Spanish only; no English/Indonesian/other UI languages on a
// sibling). Arabic remains the Qur'an/Hadith source text everywhere — that's
// scripture, not a UI language. NEXT_PUBLIC_TENANT is inlined by Next.js at
// build time; the worker-api build never sets it, so the API keeps validating
// the full list for all sites.
declare const process: { env?: Record<string, string | undefined> } | undefined;
const TENANT_ID = (typeof process !== "undefined" && process?.env?.NEXT_PUBLIC_TENANT) || "ulyah";
const TENANT_LOCALES: Record<string, { codes: string[]; def: string }> = {
  "1fr": { codes: ["fr"], def: "fr" },
  tilawa: { codes: ["de"], def: "de" },
  dawa: { codes: ["es"], def: "es" },
  xad: { codes: ["en"], def: "en" }, // xad.es = the English member of the ecosystem
};
const _tenantL = TENANT_LOCALES[TENANT_ID];

export const LOCALES: LocaleDef[] = _tenantL
  ? ALL_LOCALES.filter((l) => _tenantL.codes.includes(l.code))
  : ALL_LOCALES;

export const DEFAULT_LOCALE = _tenantL ? _tenantL.def : "id";

export function isValidLocale(code: string): boolean {
  return LOCALES.some((l) => l.code === code);
}

/**
 * Is this language finished enough to offer a visitor?
 *
 * Owner rule: a half-translated language must NOT be selectable — "kesian
 * pengunjung kalau bahasanya berubah-ubah". Being able to click a language and
 * land on a page that is Thai in the header and English in the article is worse
 * than not offering Thai at all, so the switcher strikes those languages
 * through and refuses the click until they are genuinely complete.
 *
 * "Complete" is MEASURED, not declared — see scripts/generate-locale-readiness.ts:
 * the UI half counts dictionary strings that are still English, the content half
 * counts how much of the site's own writing has been translated and cached in
 * D1, and a language scores the LOWER of the two.
 *
 * Two categories are ready without needing that score:
 *  - the site's own language, which is what everything is authored in;
 *  - a language with its own ecosystem domain (1fr.fr, tilawa.de, dawa.es,
 *    xad.es). Those are separate single-language sites, and the switcher sends
 *    the visitor to the site rather than translating in place.
 */
export function isLocaleReady(code: string): boolean {
  if (code === DEFAULT_LOCALE) return true;
  if (LOCALE_SITE[code]) return true;
  return (LOCALE_READINESS[code]?.overall ?? 0) >= 100;
}

/** How complete a language is, for the switcher's badge and the admin portal. */
export function localeReadiness(code: string): LocaleReadiness {
  if (code === DEFAULT_LOCALE) return { dict: 100, content: 100, overall: 100, missing: [] };
  return LOCALE_READINESS[code] ?? { dict: 0, content: 0, overall: 0, missing: [] };
}

/** The languages a visitor may actually be sent to right now. */
export const READY_LOCALES: LocaleDef[] = LOCALES.filter((l) => isLocaleReady(l.code));

export function getLocale(code: string): LocaleDef {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]!;
}

/** Resolves which `lang` to query `translation` with, honoring the fallback chain. */
export function resolveTranslationLang(code: string): string | null {
  const locale = getLocale(code);
  if (locale.isSourceLanguage) return null; // Arabic: text_ar itself is the content, no translation row needed
  return locale.hasQuranTranslation ? locale.code : (locale.fallbackTranslationLang ?? "en");
}
