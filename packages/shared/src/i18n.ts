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
 * MASTER SWITCH for translating ulyah.com in place.
 *
 * Owner decision: "coret dulu seluruh bahasa di ulyah.com kecuali yang link ke
 * ekosistem — ulyah.com fokus aja dulu ke bahasa Indonesia."
 *
 * ulyah.com is an Indonesian site. The four languages that have their OWN
 * finished site (1fr.fr, tilawa.de, dawa.es, xad.es) still appear, because
 * choosing one sends the visitor to that site rather than translating anything.
 * Every other language is switched off here regardless of how complete its
 * measurement says it is — the admin portal keeps showing the real progress, so
 * flipping this back to true is a one-line change once a language is genuinely
 * finished end to end.
 */
const IN_PLACE_LANGUAGES = false;

/**
 * The ONLY languages a machine translator may ever be pointed at.
 *
 * One language per site, and that is the whole list: Indonesian for the hub,
 * and the four languages that own a domain (1fr.fr French, tilawa.de German,
 * dawa.es Spanish, xad.es English). Owner: "stop auto translate di ulyah.com,
 * cukup ulyah.com menggunakan bahasa Indonesia dan ekosistem situs yg lain
 * menggunakan bahasa extensi situsnya masing-masing … tetep terjemahkan ke
 * bahasa Indonesia untuk ulyah.com dan bahasa masing-masing dr ekosistem."
 *
 * So the rule is about WHICH LANGUAGE A SITE IS IN, not about refusing to
 * translate. Source material that arrives in another language — an English
 * tafsir edition, an English occasion-of-revelation, an Arabic kitab title —
 * is still rendered into the language of the site that shows it. What stopped
 * is translating ulyah.com INTO twenty-four other languages: that is what the
 * hub used to do, what filled D1 with cache rows nobody read, and what put
 * half-translated pages in front of readers.
 *
 * Derived from HUB_DEFAULT plus the keys of LOCALE_SITE, so the list can never
 * drift away from "the sites that exist".
 *
 * (Scripture is a separate rule and a stricter one: the Qur'an and hadith matn
 * are reproduced, never machine-translated — see the Arabic masking in
 * apps/worker-api/src/lib/mt.ts and scripts/prune-mt-arabic.ts.)
 */
export const MT_TARGET_LANGS: readonly string[] = Object.freeze([HUB_DEFAULT, ...Object.keys(LOCALE_SITE)]);

/**
 * May this (source → target) pair be machine-translated at all?
 *
 * Checked at the single entry point of every translator (apps/worker-api
 * lib/mt.ts), so there is one answer for the whole ecosystem and no route can
 * quietly get its own. Same language in and out is not a translation, and a
 * target outside the five ecosystem languages is refused — the caller keeps the
 * source text, which is what a cache miss has always produced.
 */
export function machineTranslationAllowed(targetLang: string, sourceLang?: string): boolean {
  if (!targetLang) return false;
  if (sourceLang && sourceLang === targetLang) return false;
  return MT_TARGET_LANGS.includes(targetLang);
}

/**
 * Is this language served IN PLACE by this build — rendered here, by us?
 *
 * Only the site's own language is. On ulyah.com that is Indonesian and nothing
 * else: the four ecosystem languages are reachable from the switcher, but
 * choosing one is a trip to that site, not a translation of this one. Every
 * other language is off at the source, not merely hidden — the owner switch in
 * the admin portal can no longer bring one back, because bringing one back
 * means rendering the whole hub in a language it is not written in, which is
 * precisely what was switched off.
 */
export function isServedInPlace(code: string): boolean {
  return code === DEFAULT_LOCALE;
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
  if (!IN_PLACE_LANGUAGES) return false;
  return (LOCALE_READINESS[code]?.overall ?? 0) >= 100;
}

/** How complete a language is, for the switcher's badge and the admin portal. */
export function localeReadiness(code: string): LocaleReadiness {
  if (code === DEFAULT_LOCALE) return { dict: 100, content: 100, overall: 100, missing: [] };
  return LOCALE_READINESS[code] ?? { dict: 0, content: 0, overall: 0, missing: [] };
}

/** The languages a visitor may actually be sent to right now. */
export const READY_LOCALES: LocaleDef[] = LOCALES.filter((l) => isLocaleReady(l.code));

/**
 * The languages this build actually RENDERS — one, always: its own.
 *
 * Every other language either lives on its own domain or is not served at all,
 * and the middleware redirects both away before a page is ever rendered. So
 * prerendering the whole locale registry produced a copy of every static page in
 * 28 languages, 27 of which nothing could reach: not linked, not crawlable (the
 * middleware bounces the crawler too), and carried in the deploy regardless.
 */
export const SERVED_LOCALES: LocaleDef[] = LOCALES.filter((l) => isServedInPlace(l.code));

export function getLocale(code: string): LocaleDef {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]!;
}

/** Resolves which `lang` to query `translation` with, honoring the fallback chain. */
export function resolveTranslationLang(code: string): string | null {
  const locale = getLocale(code);
  if (locale.isSourceLanguage) return null; // Arabic: text_ar itself is the content, no translation row needed
  return locale.hasQuranTranslation ? locale.code : (locale.fallbackTranslationLang ?? "en");
}
