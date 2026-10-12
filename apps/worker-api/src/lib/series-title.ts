/**
 * Titles of the numbered study series, written from a template per language
 * instead of by machine translation.
 *
 * The compiler (lib/compile.ts) names every session with a fixed pattern —
 * "Tadabbur Al-Qur'an — Sesi 1322: Al-Baqarah", "Kajian Hadits Shahih — Sesi
 * 742 (40 Hadits)" in Indonesian, "Qur'an Reflection — Session …" and
 * "Authentic Hadith Session …" in English. Sending those through the
 * translator produced titles such as "The Qur'an is the Qur'an, the Qur'an is
 * the Quran." and "Der Koran ist der Koran, der 1322." on thousands of pages:
 * exactly the kind of broken, machine-made heading that reads as low-value
 * content to a reviewer. The parts that vary — the session number, the surah
 * range, the number of hadith — are names and numbers, so the title can be
 * rebuilt exactly in any language without a translator.
 */

type Kind = "tadabbur" | "hadits";

const PATTERNS: { kind: Kind; re: RegExp }[] = [
  { kind: "tadabbur", re: /^Tadabbur Al-Qur['’]an\s*[—–-]\s*Sesi\s+(\d+)\s*:\s*(.+)$/ },
  { kind: "tadabbur", re: /^Qur['’]an Reflection\s*[—–-]\s*Session\s+(\d+)\s*:\s*(.+)$/ },
  { kind: "hadits", re: /^Kajian Hadits Shahih\s*[—–-]\s*Sesi\s+(\d+)\s*\((\d+)\s+Hadits\)$/ },
  { kind: "hadits", re: /^Authentic Hadith Session\s+(\d+)\s*\((\d+)\s+Hadith\)$/ },
];

const TEMPLATES: Record<Kind, Record<string, (n: string, x: string) => string>> = {
  tadabbur: {
    id: (n, s) => `Tadabbur Al-Qur'an — Sesi ${n}: ${s}`,
    en: (n, s) => `Qur'an Reflection — Session ${n}: ${s}`,
    fr: (n, s) => `Méditation du Coran — Séance ${n} : ${s}`,
    de: (n, s) => `Koran-Betrachtung — Sitzung ${n}: ${s}`,
    es: (n, s) => `Reflexión sobre el Corán — Sesión ${n}: ${s}`,
  },
  hadits: {
    id: (n, k) => `Kajian Hadits Shahih — Sesi ${n} (${k} Hadits)`,
    en: (n, k) => `Authentic Hadith Session ${n} (${k} Hadith)`,
    fr: (n, k) => `Hadiths authentiques — Séance ${n} (${k} hadiths)`,
    de: (n, k) => `Authentische Hadithe — Sitzung ${n} (${k} Hadithe)`,
    es: (n, k) => `Hadices auténticos — Sesión ${n} (${k} hadices)`,
  },
};

/**
 * The title of a series session in `lang`, rebuilt from its original
 * (untranslated) title — or null when the title is not a series title or the
 * language has no template, in which case the caller keeps what it had.
 */
export function seriesTitle(original: string | null | undefined, lang: string): string | null {
  if (!original) return null;
  const text = original.trim();
  for (const { kind, re } of PATTERNS) {
    const m = re.exec(text);
    if (!m) continue;
    const make = TEMPLATES[kind][lang];
    return make ? make(m[1]!, m[2]!.trim()) : null;
  }
  return null;
}
