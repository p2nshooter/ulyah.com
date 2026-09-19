/**
 * Every internal link points at the url the site actually serves.
 *
 * A sibling site serves its own language's slug at a bare path — dawa.es/libros,
 * not dawa.es/es/kitab — and the middleware enforces that with redirects. So a
 * link written by hand as `/${locale}/kitab` still WORKS, which is exactly why
 * this went unnoticed: it works by being redirected twice.
 *
 *   /es/kitab  →301→  /kitab  →301→  /libros
 *
 * Twice, on every click and every crawl of every internal link on the site. For
 * a site that has just been accepted for ads that is real money and real crawl
 * budget: a redirect is a round trip before a single byte of the page is sent,
 * and Search Console files the whole internal link graph under "page with
 * redirect".
 *
 * Two halves, and both matter:
 *   1. routePath() produces the right url for each site, including the query
 *      strings and deep content paths that the sweep had to carry through;
 *   2. no source file has gone back to writing the path by hand.
 *
 *   npx tsx scripts/check-internal-links.ts          (ulyah)
 *   NEXT_PUBLIC_TENANT=dawa npx tsx scripts/check-internal-links.ts
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { routePath, localePath } from "../apps/web/src/lib/paths";
import { DEFAULT_LOCALE } from "../packages/shared/src/i18n";

const TENANT = process.env.NEXT_PUBLIC_TENANT || "ulyah";

let failed = 0;
function check(what: string, got: string, want: string) {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what.padEnd(42)} → ${got}${ok ? "" : `   (expected ${want})`}`);
}

// What each site should emit for the same handful of routes. The hub keeps the
// Indonesian folder names because that is what it is written in; each sibling
// uses its own language's slug. Nobody carries a locale prefix: the site's own
// language always lives at the bare path.
const EXPECTED: Record<string, Record<string, string>> = {
  ulyah: {
    "/kitab": "/kitab",
    "/kitab-pesantren": "/kitab-pesantren",
    "/hadits": "/hadits",
    "/kisah/kisah-nabi-yusuf-01": "/kisah/kisah-nabi-yusuf-01",
    "/quran/mushaf": "/quran/mushaf",
  },
  dawa: {
    "/kitab": "/libros",
    "/kitab-pesantren": "/libros-clasicos",
    "/hadits": "/hadiz",
    "/kisah/kisah-nabi-yusuf-01": "/historias/kisah-nabi-yusuf-01",
    "/quran/mushaf": "/coran/mushaf",
  },
  "1fr": {
    "/kitab": "/livres",
    "/kitab-pesantren": "/livres-classiques",
    "/hadits": "/hadith",
    "/kisah/kisah-nabi-yusuf-01": "/histoires/kisah-nabi-yusuf-01",
    "/quran/mushaf": "/coran/mushaf",
  },
  tilawa: {
    "/kitab": "/buecher",
    "/kitab-pesantren": "/klassische-buecher",
    "/hadits": "/hadith",
    "/kisah/kisah-nabi-yusuf-01": "/geschichten/kisah-nabi-yusuf-01",
    "/quran/mushaf": "/koran/mushaf",
  },
  xad: {
    "/kitab": "/books",
    "/kitab-pesantren": "/classical-books",
    "/hadits": "/hadith",
    "/kisah/kisah-nabi-yusuf-01": "/stories/kisah-nabi-yusuf-01",
    "/quran/mushaf": "/quran/mushaf",
  },
};

console.log(`=== ${TENANT} (default locale ${DEFAULT_LOCALE}) — one url, no redirect ===`);
const want = EXPECTED[TENANT] ?? EXPECTED.ulyah!;
for (const [route, url] of Object.entries(want)) {
  check(route, routePath(DEFAULT_LOCALE, route), url);
}

console.log("\n=== query strings and hashes are carried through ===");
check("/kitab/aqidah?page=2", routePath(DEFAULT_LOCALE, "/kitab/aqidah?page=2"), `${want["/kitab"]}/aqidah?page=2`);
check("/quran#ayat-5", routePath(DEFAULT_LOCALE, "/quran#ayat-5"), `${routePath(DEFAULT_LOCALE, "/quran")}#ayat-5`);

console.log("\n=== a language this site does not serve still resolves ===");
// The hub links to nothing but itself now, but routePath must stay total: an
// unknown route keeps its own path rather than throwing or producing "//".
check("/route-that-does-not-exist", routePath(DEFAULT_LOCALE, "/route-that-does-not-exist"), "/route-that-does-not-exist");
check("localePath('', '')", localePath(DEFAULT_LOCALE, ""), "/");

// ── The source sweep ─────────────────────────────────────────────────────
// A hand-written locale prefix in an href is the bug this check exists for, so
// look for it directly. `routePath(locale, …)` is the only spelling allowed.
console.log("\n=== no file writes a locale prefix by hand ===");
const SRC = join(import.meta.dirname, "..", "apps", "web", "src");
const HAND_WRITTEN = /(?:href|action)=\{`\/\$\{\s*locale\s*\}\//;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

const offenders = walk(SRC).filter((f) => HAND_WRITTEN.test(readFileSync(f, "utf8")));
if (offenders.length) {
  failed += offenders.length;
  for (const f of offenders) console.log(`  FAIL  ${f.replace(SRC, "apps/web/src")}`);
  console.log("        use routePath(locale, `/route`) — see apps/web/src/lib/paths.ts");
} else {
  console.log("  ok    every internal link goes through routePath()");
}

// ── Canonicals ───────────────────────────────────────────────────────────
// A canonical that names a url which redirects is worse than none: Google is
// told the real page lives somewhere it does not. dawa.es served
// /libros-clasicos while announcing <link rel="canonical" href=".../kitab-
// pesantren"> — the Indonesian route, which 301s straight back. Every sibling
// site did this on every page that declares one.
console.log("\n=== every canonical is built with routePath ===");
const CANONICAL_LOCALEPATH = /canonical:\s*localePath\(/;
const canonOffenders = walk(SRC).filter((f) => CANONICAL_LOCALEPATH.test(readFileSync(f, "utf8")));
if (canonOffenders.length) {
  failed += canonOffenders.length;
  for (const f of canonOffenders) console.log(`  FAIL  ${f.replace(SRC, "apps/web/src")}`);
  console.log("        localePath keeps the route's name on disk; a sibling serves its own slug.");
} else {
  console.log("  ok    no canonical points at a url that only redirects");
}

// ── Pages that must carry their own title ────────────────────────────────
// A page with no metadata inherits the site default, so the library index and
// the story index both shipped the home page's <title>. Two pages, one title,
// and the smaller one stops being indexed.
console.log("\n=== the big index pages declare their own metadata ===");
for (const rel of ["app/[locale]/kitab/page.tsx", "app/[locale]/kisah/page.tsx", "app/[locale]/hadits/page.tsx"]) {
  const src = readFileSync(join(SRC, rel), "utf8");
  const has = /export\s+(async\s+)?function\s+generateMetadata|export\s+const\s+metadata/.test(src);
  if (!has) failed++;
  console.log(`  ${has ? "ok  " : "FAIL"}  ${rel}`);
}

// ── Every advertised route is a real page ────────────────────────────────
// A route in ROUTE_SLUGS is announced to Google in five languages, on every
// page, as an hreflang alternate. /kisah/tokoh was announced that way for
// months with nothing rendering it: Next matched /kisah/[slug] with
// slug="tokoh", found no story, and served the framework's bare "404: This
// page could not be found" — with HTTP 200. A soft-404 under a url we
// advertise is the kind of thing that costs a site its ad approval.
console.log("\n=== every route with an hreflang has a page ===");
const routesSrc = readFileSync(join(import.meta.dirname, "..", "packages", "shared", "src", "routes.ts"), "utf8");
const slugBlock = routesSrc.slice(
  routesSrc.indexOf("export const ROUTE_SLUGS"),
  routesSrc.indexOf("\n};", routesSrc.indexOf("export const ROUTE_SLUGS"))
);
const declared = [...slugBlock.matchAll(/^\s*"(\/[^"]*)":\s*\{/gm)].map((m) => m[1]!);
const pageless = declared.filter((r) => !existsSync(join(SRC, "app", "[locale]", ...r.slice(1).split("/"), "page.tsx")));
if (pageless.length) {
  failed += pageless.length;
  for (const r of pageless) console.log(`  FAIL  ${r} — announced in hreflang, no page.tsx renders it`);
} else {
  console.log(`  ok    all ${declared.length} announced routes render a real page`);
}

console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
