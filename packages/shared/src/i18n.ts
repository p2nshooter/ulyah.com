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

export const LOCALES: LocaleDef[] = [
  { code: "id", label: "Bahasa Indonesia", dir: "ltr", hasQuranTranslation: true },
  { code: "en", label: "English", dir: "ltr", hasQuranTranslation: true },
  { code: "ru", label: "Русский", dir: "ltr", hasQuranTranslation: true },
  { code: "de", label: "Deutsch", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
  { code: "fr", label: "Français", dir: "ltr", hasQuranTranslation: true },
  { code: "ar", label: "العربية", dir: "rtl", hasQuranTranslation: false, isSourceLanguage: true },
  { code: "zh", label: "中文", dir: "ltr", hasQuranTranslation: true },
  { code: "ja", label: "日本語", dir: "ltr", hasQuranTranslation: false, fallbackTranslationLang: "en" },
];

export const DEFAULT_LOCALE = "id";

export function isValidLocale(code: string): boolean {
  return LOCALES.some((l) => l.code === code);
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
