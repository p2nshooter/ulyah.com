import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { localizedRoute, routeLocales } from "@ulyah/shared/routes";
import { TENANT } from "@/lib/tenant";

/**
 * https://<site>/llms.txt (llmstxt.org) — what this site is and where its main sections are, for AI
 * search engines and assistants (owner, 27 Oct 2026: "perbaiki dulu seluruh SEO websitenya … file2
 * lain yg d butuhkan"). Written in the site's own language, with the site's own localized slugs —
 * the same urls as its sitemap. dawa.es is no longer the owner's: its tenant gets nothing new.
 */
export const dynamic = "force-static";

type L = Record<string, string>;

const ABOUT: L = {
  id: "Portal Islam berbahasa Indonesia: Al-Qur'an dengan terjemah dan tafsir, hadits beserta sanadnya, kitab, kisah, audio murottal, jadwal sholat, kiblat, kalender Hijriyah, zakat dan waris.",
  en: "An Islamic portal in English: the Qur'an with translation and tafsir, hadith with their chains, books, stories, recitation audio, prayer times, qibla, the Hijri calendar, zakat and inheritance.",
  fr: "Un portail islamique en français : le Coran avec traduction et tafsir, les hadiths et leurs chaînes, des livres, des récits, des récitations audio, les horaires de prière, la qibla, le calendrier hégirien, la zakat et l'héritage.",
  de: "Ein islamisches Portal auf Deutsch: der Koran mit Übersetzung und Tafsir, Hadithe mit ihren Überlieferungsketten, Bücher, Geschichten, Rezitationen, Gebetszeiten, Qibla, Hidschri-Kalender, Zakat und Erbrecht.",
  es: "Un portal islámico en español: el Corán con traducción y tafsir, hadices con sus cadenas, libros, relatos, recitaciones en audio, horarios de oración, quibla, calendario hijri, zakat y herencia.",
};

const SECTIONS: [string, L][] = [
  ["/quran", { id: "Al-Qur'an", en: "Qur'an", fr: "Coran", de: "Koran", es: "Corán" }],
  ["/hadits", { id: "Hadits", en: "Hadith", fr: "Hadiths", de: "Hadithe", es: "Hadices" }],
  ["/sanad", { id: "Sanad", en: "Chains of narration", fr: "Chaînes de transmission", de: "Überlieferungsketten", es: "Cadenas de transmisión" }],
  ["/kitab", { id: "Kitab", en: "Books", fr: "Livres", de: "Bücher", es: "Libros" }],
  ["/kitab-pesantren", { id: "Kitab pesantren", en: "Classical books", fr: "Livres classiques", de: "Klassische Bücher", es: "Libros clásicos" }],
  ["/kisah", { id: "Kisah", en: "Stories", fr: "Histoires", de: "Geschichten", es: "Historias" }],
  ["/audiobook", { id: "Audiobook", en: "Audiobooks", fr: "Livres audio", de: "Hörbücher", es: "Audiolibros" }],
  ["/jadwal-sholat", { id: "Jadwal sholat", en: "Prayer times", fr: "Horaires de prière", de: "Gebetszeiten", es: "Horarios de oración" }],
  ["/kiblat", { id: "Arah kiblat", en: "Qibla", fr: "Qibla", de: "Qibla", es: "Quibla" }],
  ["/kalender-hijriyah", { id: "Kalender Hijriyah", en: "Hijri calendar", fr: "Calendrier hégirien", de: "Hidschri-Kalender", es: "Calendario hijri" }],
  ["/zakat", { id: "Zakat", en: "Zakat", fr: "Zakat", de: "Zakat", es: "Zakat" }],
  ["/waris", { id: "Waris", en: "Inheritance", fr: "Héritage", de: "Erbrecht", es: "Herencia" }],
  ["/haji-umroh", { id: "Haji & umroh", en: "Hajj & umrah", fr: "Hajj & omra", de: "Hadsch & Umra", es: "Hach y umra" }],
  ["/radio", { id: "Radio", en: "Radio", fr: "Radio", de: "Radio", es: "Radio" }],
  ["/tanya", { id: "Tanya jawab", en: "Questions", fr: "Questions", de: "Fragen", es: "Preguntas" }],
];

const PAGES: [string, L][] = [
  ["/tentang", { id: "Tentang", en: "About", fr: "À propos", de: "Über uns", es: "Sobre nosotros" }],
  ["/kontak", { id: "Kontak", en: "Contact", fr: "Contact", de: "Kontakt", es: "Contacto" }],
  ["/kebijakan-editorial", { id: "Kebijakan editorial", en: "Editorial policy", fr: "Politique éditoriale", de: "Redaktionelle Richtlinien", es: "Política editorial" }],
  ["/kebijakan-privasi", { id: "Kebijakan privasi", en: "Privacy policy", fr: "Politique de confidentialité", de: "Datenschutz", es: "Política de privacidad" }],
  ["/syarat-ketentuan", { id: "Syarat & ketentuan", en: "Terms", fr: "Conditions d'utilisation", de: "Nutzungsbedingungen", es: "Términos y condiciones" }],
  ["/ekosistem", { id: "Ekosistem", en: "Ecosystem", fr: "Écosystème", de: "Ökosystem", es: "Ecosistema" }],
];

export function GET() {
  if (TENANT.id === "dawa") return new Response("Not found\n", { status: 404 });
  const lang = DEFAULT_LOCALE;
  const has = (route: string) => routeLocales(route)?.includes(lang) ?? true;
  const line = ([route, label]: [string, L]) => `- [${label[lang] ?? label.en}](${TENANT.siteUrl}${localizedRoute(route, lang)})`;
  const tagline = TENANT.tagline[lang];
  const text = [
    `# ${TENANT.siteName}${tagline ? ` — ${tagline}` : ""}`,
    "",
    `> ${ABOUT[lang] ?? ABOUT.en}`,
    "",
    `Sitemap: ${TENANT.siteUrl}/sitemap.xml`,
    "",
    "## Sections",
    "",
    ...SECTIONS.filter(([r]) => has(r)).map(line),
    "",
    "## Optional",
    "",
    ...PAGES.filter(([r]) => has(r)).map(line),
    "",
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
