// Canonical locale registry — single source of truth for apps/web (UI +
// routing) and apps/worker-api (translation/TTS lookups), so the two never
// drift out of sync ("jangan setengah-setengah" requirement: changing the
// language must switch 100% of the site consistently).

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

const ALL_LOCALES: LocaleDef[] = [
  { code: "id", label: "Bahasa Indonesia", dir: "ltr", hasQuranTranslation: true },
  { code: "en", label: "English", dir: "ltr", hasQuranTranslation: true },
  { code: "ru", label: "Русский", dir: "ltr", hasQuranTranslation: true },
  { code: "de", label: "Deutsch", dir: "ltr", hasQuranTranslation: true },
  { code: "fr", label: "Français", dir: "ltr", hasQuranTranslation: true },
  { code: "es", label: "Español", dir: "ltr", hasQuranTranslation: true },
  { code: "ar", label: "العربية", dir: "rtl", hasQuranTranslation: false, isSourceLanguage: true },
  { code: "zh", label: "中文", dir: "ltr", hasQuranTranslation: true },
  { code: "ja", label: "日本語", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
];

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
};
const _tenantL = TENANT_LOCALES[TENANT_ID];

export const LOCALES: LocaleDef[] = _tenantL
  ? ALL_LOCALES.filter((l) => _tenantL.codes.includes(l.code))
  : ALL_LOCALES;

export const DEFAULT_LOCALE = _tenantL ? _tenantL.def : "id";

export function isValidLocale(code: string): boolean {
  return LOCALES.some((l) => l.code === code);
}

// Languages the in-page switcher on ulyah.com actually lets you switch TO.
// The site's own default language is always ready; the rest are opened ONE AT
// A TIME as each is verified fully translated and consistent (owner: "buka
// coretan satu-persatu, jangan ada yang inkonsisten"). Not-yet-ready languages
// stay visibly struck through and unclickable. Add a code here only after its
// whole UI + straggler strings are complete in that language.
export const READY_LOCALE_CODES = new Set<string>(["id", "en", "fr", "de", "es", "zh", "ar"]);

export function isLocaleReady(code: string): boolean {
  return code === DEFAULT_LOCALE || READY_LOCALE_CODES.has(code);
}

export function getLocale(code: string): LocaleDef {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]!;
}

/** Resolves which `lang` to query `translation` with, honoring the fallback chain. */
export function resolveTranslationLang(code: string): string | null {
  const locale = getLocale(code);
  if (locale.isSourceLanguage) return null; // Arabic: text_ar itself is the content, no translation row needed
  return locale.hasQuranTranslation ? locale.code : (locale.fallbackTranslationLang ?? "en");
}
