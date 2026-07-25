/**
 * URL slugs in each site's own language.
 *
 * Every route folder is named in Indonesian, because ulyah.com is written in
 * Indonesian. That leaked into the sibling sites: dawa.es advertised
 * `/jadwal-sholat`, tilawa.de `/kalender-hijriyah`, 1fr.fr `/kebijakan-privasi`
 * — Indonesian URLs on a Spanish, German and French site, in their sitemaps and
 * in the hreflang graph (owner: "sitemap-nya jangan pakai bahasa Indonesia
 * untuk situs yang bukan berbahasa Indonesia").
 *
 * That is not cosmetic. The words in a URL are one of the signals a search
 * engine weighs, and they are shown in the result itself — a Spanish reader
 * seeing `dawa.es/jadwal-sholat` has no idea it means prayer times.
 *
 * So each route has a slug per language. The folder names never change: the
 * middleware rewrites a localized slug onto the Indonesian route internally,
 * and on a non-Indonesian site the Indonesian slug redirects permanently to the
 * localized one, so exactly ONE url is indexable per page.
 *
 * Islamic proper nouns stay themselves — Qur'an is Qur'an in every language,
 * and hadith/sanad/imsakiyah are the words those readers actually search for.
 * Only the ordinary Indonesian words are translated.
 */

/** route (as it exists on disk) → slug per language. */
export const ROUTE_SLUGS: Record<string, Record<string, string>> = {
  "/quran": { en: "/quran", fr: "/coran", de: "/koran", es: "/coran" },
  "/quran/mushaf": { en: "/quran/mushaf", fr: "/coran/mushaf", de: "/koran/mushaf", es: "/coran/mushaf" },
  "/quran-flipbook": {
    en: "/quran-flipbook",
    fr: "/coran-livre-feuillete",
    de: "/koran-blaetterbuch",
    es: "/coran-libro-hojeable",
  },
  "/hadits": { en: "/hadith", fr: "/hadith", de: "/hadith", es: "/hadiz" },
  "/sanad": { en: "/sanad", fr: "/sanad", de: "/sanad", es: "/sanad" },
  "/kitab": { en: "/books", fr: "/livres", de: "/buecher", es: "/libros" },
  "/kitab-pesantren": {
    en: "/classical-books",
    fr: "/livres-classiques",
    de: "/klassische-buecher",
    es: "/libros-clasicos",
  },
  "/kisah": { en: "/stories", fr: "/histoires", de: "/geschichten", es: "/historias" },
  "/kisah/tokoh": { en: "/stories/figures", fr: "/histoires/figures", de: "/geschichten/personen", es: "/historias/figuras" },
  "/kids": { en: "/kids", fr: "/enfants", de: "/kinder", es: "/ninos" },
  "/anak": { en: "/kids-films", fr: "/films-enfants", de: "/kinderfilme", es: "/peliculas-infantiles" },
  "/audiobook": { en: "/audiobooks", fr: "/livres-audio", de: "/hoerbuecher", es: "/audiolibros" },
  "/harian": { en: "/daily", fr: "/quotidien", de: "/taeglich", es: "/diario" },
  "/amalan": { en: "/daily-practices", fr: "/pratiques-quotidiennes", de: "/tagespraxis", es: "/practicas-diarias" },
  "/jadwal-sholat": { en: "/prayer-times", fr: "/horaires-priere", de: "/gebetszeiten", es: "/horarios-de-oracion" },
  "/imsakiyah": { en: "/imsakiyah", fr: "/imsakiyah", de: "/imsakiyah", es: "/imsakiyah" },
  "/kiblat": { en: "/qibla", fr: "/qibla", de: "/qibla", es: "/quibla" },
  "/kalender-hijriyah": {
    en: "/hijri-calendar",
    fr: "/calendrier-hegirien",
    de: "/hidschri-kalender",
    es: "/calendario-hijri",
  },
  "/haji-umroh": { en: "/hajj-umrah", fr: "/hajj-omra", de: "/hadsch-umra", es: "/hach-umra" },
  "/zakat": { en: "/zakat", fr: "/zakat", de: "/zakat", es: "/zakat" },
  "/waris": { en: "/inheritance", fr: "/heritage", de: "/erbrecht", es: "/herencia" },
  "/nasakh": { en: "/nasakh-mansukh", fr: "/nasikh-mansukh", de: "/nasich-mansuch", es: "/nasij-mansuj" },
  "/radio": { en: "/radio", fr: "/radio", de: "/radio", es: "/radio" },
  "/live": { en: "/live", fr: "/direct", de: "/live", es: "/en-vivo" },
  "/tanya": { en: "/ask", fr: "/questions", de: "/fragen", es: "/preguntas" },
  "/cari": { en: "/search", fr: "/recherche", de: "/suche", es: "/buscar" },
  "/donasi": { en: "/donate", fr: "/faire-un-don", de: "/spenden", es: "/donar" },
  "/tentang": { en: "/about", fr: "/a-propos", de: "/ueber-uns", es: "/sobre-nosotros" },
  "/kontak": { en: "/contact", fr: "/contact", de: "/kontakt", es: "/contacto" },
  "/syukur": { en: "/gratitude", fr: "/gratitude", de: "/dankbarkeit", es: "/gratitud" },
  "/terima-kasih": { en: "/thank-you", fr: "/merci", de: "/danke", es: "/gracias" },
  "/kebijakan-privasi": {
    en: "/privacy-policy",
    fr: "/politique-confidentialite",
    de: "/datenschutz",
    es: "/politica-de-privacidad",
  },
  "/widget": { en: "/widget", fr: "/widget", de: "/widget", es: "/widget" },
  // The Amazon shelf. ulyah.com has no entry because Amazon does not operate in
  // Indonesia and the store is not published there at all — the folder is named
  // in Indonesian only because every folder in this repo is.
  "/toko": { en: "/store", fr: "/boutique", de: "/shop", es: "/tienda" },
};

/**
 * Routes that do NOT exist on every site, and the languages that do have them.
 *
 * /toko is the Amazon shelf. It exists only where there is an Amazon to point
 * at, and Amazon does not operate in Indonesia, so the page 404s on ulyah.com.
 * Without this, dawa.es would declare `hreflang="id" → ulyah.com/toko` and hand
 * Google an alternate that does not exist — the same class of error as pointing
 * hreflang at a redirect, and the reason this table is here rather than in one
 * of the two places that need it.
 */
export const ROUTE_LOCALES: Record<string, readonly string[]> = {
  "/toko": ["en", "fr", "de", "es"],
};

/** Which languages have this route at all. Undefined means "every language". */
export function routeLocales(route: string): readonly string[] | undefined {
  return ROUTE_LOCALES[route];
}

/** Reverse lookup, built once: "/es/horarios-de-oracion" → "/jadwal-sholat". */
const REVERSE: Record<string, Record<string, string>> = (() => {
  const out: Record<string, Record<string, string>> = {};
  for (const [route, byLang] of Object.entries(ROUTE_SLUGS)) {
    for (const [lang, slug] of Object.entries(byLang)) {
      (out[lang] ??= {})[slug] = route;
    }
  }
  return out;
})();

/**
 * The URL this route should have on a site in `locale`. Indonesian — and any
 * language with no entry — keeps the route as it is on disk.
 *
 * Deep paths localize only their SECTION: /kisah/kisah-adam-01 becomes
 * /historias/kisah-adam-01, because the part after the section is the content's
 * own identifier and has to stay stable. Getting this wrong would fill the
 * sitemap with urls that merely redirect, which wastes the crawl budget and
 * shows up in Search Console as an error.
 */
export function localizedRoute(route: string, locale: string): string {
  if (!route || route === "/") return route;
  const exact = ROUTE_SLUGS[route]?.[locale];
  if (exact) return exact;
  // Longest matching section prefix wins, so /quran/mushaf beats /quran.
  for (let at = route.lastIndexOf("/"); at > 0; ) {
    const head = route.slice(0, at);
    const mapped = ROUTE_SLUGS[head]?.[locale];
    if (mapped) return mapped + route.slice(at);
    at = head.lastIndexOf("/");
  }
  return route;
}

/**
 * Turn a localized URL back into the route that actually exists on disk.
 * Returns null when the path is already canonical (or is content, e.g.
 * /historias/kisah-adam-01, whose first segment is matched on its own).
 */
export function canonicalRoute(path: string, locale: string): string | null {
  const table = REVERSE[locale];
  if (!table) return null;
  const clean = path.replace(/\/+$/, "") || "/";
  if (table[clean]) return table[clean]!;
  // Deep paths: the SECTION is localized, the part after it is the content's
  // own id — /historias/kisah-adam-01 → /kisah/kisah-adam-01.
  //
  // Longest head first. A section can be two segments deep (/historias/figuras
  // → /kisah/tokoh), and matching only the first would turn it into
  // /kisah/figuras — a 404 on every sibling site.
  for (let at = clean.lastIndexOf("/"); at > 0; ) {
    const head = clean.slice(0, at);
    const mapped = table[head];
    if (mapped) return mapped + clean.slice(at);
    at = head.lastIndexOf("/");
  }
  return null;
}

/** Every localized first segment for a language — lets the middleware tell a
 *  localized URL from an unknown one without scanning the whole table. */
export function localizedPrefixes(locale: string): string[] {
  return Object.keys(REVERSE[locale] ?? {});
}
