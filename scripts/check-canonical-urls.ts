/**
 * One url per page, and an hreflang graph that points both ways.
 *
 * Two things Search Console punishes and neither a build nor a typecheck can
 * see:
 *
 *  · the same page reachable at more than one url — www and apex, an Indonesian
 *    slug and its Spanish twin, /id/quran and /quran. Google picks one and the
 *    signals for the rest are wasted, or it reports "Duplikat, Google memilih
 *    kanonis yang berbeda" and keeps neither.
 *
 *  · hreflang that is not reciprocal. If ulyah.com/quran says "my French
 *    version is 1fr.fr/coran", then 1fr.fr/coran must say "my Indonesian
 *    version is ulyah.com/quran". If it does not, the annotation is discarded
 *    silently — which is what happened while the whole ecosystem declared the
 *    five HOME pages as every page's alternates.
 *
 * Both are pure url arithmetic, so both can be checked here rather than
 * discovered in Search Console eight weeks later.
 *
 *   pnpm check:urls
 */
import { localizedRoute, canonicalRoute } from "../packages/shared/src/routes";
import { localeCanonicalUrl } from "../packages/shared/src/i18n";

/** The five sites, and the language each one serves at its bare urls. */
const SITES: { host: string; locale: string }[] = [
  { host: "ulyah.com", locale: "id" },
  { host: "xad.es", locale: "en" },
  { host: "1fr.fr", locale: "fr" },
  { host: "tilawa.de", locale: "de" },
  { host: "dawa.es", locale: "es" },
];

/** Section routes plus one real example of every kind of content page. */
const ROUTES = [
  "",
  "/quran",
  "/quran/mushaf",
  "/hadits",
  "/kisah",
  "/kisah/tokoh",
  "/kitab",
  "/kitab-pesantren",
  "/jadwal-sholat",
  "/kalender-hijriyah",
  "/kebijakan-privasi",
  "/kids",
  "/imsakiyah",
  "/kisah/hikmah-kesabaran-nabi-ayyub",
  "/kisah/kisah-nabi-yusuf-01-mimpi",
  "/kisah/tokoh/nabi-musa",
  "/kitab/balaghah",
  "/kitab/balaghah/1234",
  "/kitab-pesantren/safinatun-najah",
  "/hadits/bukhari",
];

let failed = 0;
const fail = (msg: string) => {
  failed++;
  console.log(`  FAIL  ${msg}`);
};

// ── 1. One url per page, and it survives the round trip ────────────────────
//
// The middleware rewrites a localized slug onto the Indonesian route that
// exists on disk. If that rewrite cannot find its way back, the page 404s; if
// two different routes produce the same url, two pages collide.
console.log("=== one url per page, and the middleware can resolve it ===");
for (const { host, locale } of SITES) {
  const seen = new Map<string, string>();
  let bad = 0;
  for (const route of ROUTES) {
    const slug = localizedRoute(route, locale);
    const url = `https://${host}${slug}`;

    const clash = seen.get(url);
    if (clash !== undefined && clash !== route) {
      fail(`${url} is produced by BOTH ${clash || "/"} and ${route || "/"}`);
      bad++;
    }
    seen.set(url, route);

    // Indonesian is the language the route folders are named in, so nothing is
    // rewritten there; every other site must be able to map back.
    const back = locale === "id" ? route : (canonicalRoute(slug, locale) ?? slug);
    if (back !== route) {
      fail(`${url} resolves to ${back}, but the page lives at ${route || "/"}`);
      bad++;
    }
  }
  console.log(`  ${bad === 0 ? "ok  " : "FAIL"}  ${host.padEnd(11)} ${ROUTES.length} routes, ${seen.size} distinct urls`);
}

// ── 2. hreflang points both ways ───────────────────────────────────────────
//
// For every page and every pair of sites: the url site A advertises as site B's
// version must be exactly the url site B serves that page at. One character of
// difference and Google drops the annotation.
console.log("\n=== hreflang is reciprocal across all five sites ===");
let pairs = 0;
let bad = 0;
for (const route of ROUTES) {
  for (const a of SITES) {
    for (const b of SITES) {
      if (a.host === b.host) continue;
      pairs++;
      // What A's Link header claims for B's language.
      const advertised = localeCanonicalUrl(b.locale, localizedRoute(route, b.locale));
      // What B actually serves that page at.
      const actual = `https://${b.host}${localizedRoute(route, b.locale)}`;
      if (advertised !== actual) {
        fail(`${a.host} advertises ${b.locale} as ${advertised}, but ${b.host} serves ${actual}`);
        bad++;
      }
    }
  }
}
console.log(`  ${bad === 0 ? "ok  " : "FAIL"}  ${pairs} cross-site claims over ${ROUTES.length} routes`);

// ── 3. x-default is the hub, on every site and every page ──────────────────
console.log("\n=== x-default always resolves to the Indonesian hub ===");
bad = 0;
for (const route of ROUTES) {
  const xd = localeCanonicalUrl("id", localizedRoute(route, "id"));
  if (!xd.startsWith("https://ulyah.com")) {
    fail(`x-default for ${route || "/"} is ${xd}`);
    bad++;
  }
}
console.log(`  ${bad === 0 ? "ok  " : "FAIL"}  ${ROUTES.length} routes`);

// ── 4. No site advertises an Indonesian slug as its own url ────────────────
//
// The complaint that started this: "sitemap-nya jangan pakai bahasa Indonesia
// untuk situs yang bukan berbahasa Indonesia."
console.log("\n=== no non-Indonesian site serves an Indonesian section slug ===");
const INDONESIAN_ONLY = ["/jadwal-sholat", "/kalender-hijriyah", "/kebijakan-privasi", "/kitab-pesantren", "/kisah", "/kitab", "/hadits"];
bad = 0;
for (const { host, locale } of SITES) {
  if (locale === "id") continue;
  for (const route of INDONESIAN_ONLY) {
    const slug = localizedRoute(route, locale);
    if (slug === route) {
      fail(`${host} still serves ${route} — no ${locale} slug for it`);
      bad++;
    }
  }
}
console.log(`  ${bad === 0 ? "ok  " : "FAIL"}  ${INDONESIAN_ONLY.length} sections × 4 sites`);

// ── 5. Sitemap files are named in each site's own language ─────────────────
//
// /sitemap.xml is an index of one file per language per section. The filenames
// are not pages and will never rank, but a Spanish sitemap list full of
// Indonesian words is the same defect in a different place, and it is derived
// from the same table, so it is checkable here.
console.log("\n=== sitemap filenames follow each site's language ===");
const SITEMAP_SECTIONS = [null, "/kisah", "/kitab", "/hadits"]; // null = the section routes
bad = 0;
for (const { host, locale } of SITES) {
  const ids = SITEMAP_SECTIONS.map((route) =>
    route ? `${locale}-${localizedRoute(route, locale).replace(/^\//, "")}` : locale
  );
  if (new Set(ids).size !== ids.length) {
    fail(`${host} would publish two sitemaps with the same name: ${ids.join(", ")}`);
    bad++;
  }
  // On a non-Indonesian site no filename may still be the Indonesian word.
  if (locale !== "id") {
    for (const route of SITEMAP_SECTIONS) {
      if (!route) continue;
      if (localizedRoute(route, locale) === route) {
        fail(`${host} names its ${route} sitemap in Indonesian`);
        bad++;
      }
    }
  }
  console.log(`  ${bad === 0 ? "ok  " : "FAIL"}  ${host.padEnd(11)} ${ids.map((i) => `${i}.xml`).join("  ")}`);
}

console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
