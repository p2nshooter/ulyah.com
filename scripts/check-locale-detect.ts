/**
 * Which language does a visitor actually get?
 *
 * This exists because the answer was wrong for the most important visitor we
 * have, and nothing in the build could tell us: Googlebot crawls from US
 * addresses and keeps no cookies, cf-ipcountry=US mapped to "en", and "en"
 * counted as usable because it has its own site — so every bare ulyah.com url
 * answered 307 → /en/…, a page ulyah.com deliberately marks noindex. All 6,333
 * urls in the sitemap did it. Nothing failed; the site was simply never indexed.
 *
 * So the decision is a pure function now, and this runs it against the visitors
 * that matter. It exits non-zero if any expectation breaks.
 *
 *   pnpm check:locale
 */
import { pickLocale, servedInPlace, SIBLING_TENANTS } from "../apps/web/src/lib/locale-detect";
import { DEFAULT_LOCALE, LOCALE_SITE } from "../packages/shared/src/i18n";

// LOCALES and DEFAULT_LOCALE are inlined from NEXT_PUBLIC_TENANT at build time,
// so this checks whichever site it is run for. The deploy runs it once per
// tenant; run it locally with NEXT_PUBLIC_TENANT=dawa (or 1fr / tilawa / xad).
const TENANT = process.env.NEXT_PUBLIC_TENANT || "ulyah";

type Case = {
  what: string;
  signals: Parameters<typeof pickLocale>[0];
  expect: string;
  why: string;
};

// ulyah.com: Indonesian hub. en/fr/de/es have their own domains; every other
// language is switched off (IN_PLACE_LANGUAGES = false).
const ULYAH: Case[] = [
  {
    what: "Googlebot (US, no cookie)",
    signals: { country: "US", enabled: null, tenant: "ulyah" },
    expect: "id",
    why: "THE bug: used to be 'en' → 307 to /en/… → noindex, on every url in the sitemap",
  },
  {
    what: "Googlebot with Accept-Language: en",
    signals: { country: "US", acceptLanguage: "en-US,en;q=0.9", enabled: null, tenant: "ulyah" },
    expect: "id",
    why: "English is served by xad.es, not by ulyah.com — never chosen for someone who did not ask",
  },
  {
    what: "reader in Indonesia",
    signals: { country: "ID", acceptLanguage: "id-ID,id;q=0.9", enabled: null, tenant: "ulyah" },
    expect: "id",
    why: "the site's own language",
  },
  {
    what: "reader in Germany",
    signals: { country: "DE", acceptLanguage: "de-DE,de;q=0.9", enabled: null, tenant: "ulyah" },
    expect: "id",
    why: "German lives on tilawa.de — the switcher takes them there, an IP address does not",
  },
  {
    what: "reader in Spain",
    signals: { country: "ES", enabled: null, tenant: "ulyah" },
    expect: "id",
    why: "Spanish lives on dawa.es",
  },
  {
    what: "stale cookie from the old redirect (ulyah_locale=en)",
    signals: { cookie: "en", country: "US", enabled: null, tenant: "ulyah" },
    expect: "id",
    why: "the cookie the bug itself wrote must not keep pinning readers to the noindex twin",
  },
  {
    what: "cookie for a switched-off language (th)",
    signals: { cookie: "th", country: "TH", enabled: null, tenant: "ulyah" },
    expect: "id",
    why: "owner: kembaliin dulu default webnya ke bahasa Indonesia",
  },
  {
    what: "cookie for a language the owner switched ON (ar)",
    signals: { cookie: "ar", enabled: ["ar"], tenant: "ulyah" },
    expect: "ar",
    why: "an explicit choice, in a language ulyah.com really does serve in place",
  },
  {
    what: "reader in Saudi Arabia, Arabic switched on",
    signals: { country: "SA", enabled: ["ar"], tenant: "ulyah" },
    expect: "ar",
    why: "Arabic has no domain of its own, so the hub serves it — geo may pick it",
  },
  {
    what: "reader in Saudi Arabia, Arabic switched off",
    signals: { country: "SA", enabled: [], tenant: "ulyah" },
    expect: "id",
    why: "a language the owner has not switched on is not served to anyone",
  },
];

function run(cases: Case[], title: string): number {
  console.log(`\n=== ${title} ===`);
  let failed = 0;
  for (const c of cases) {
    const got = pickLocale(c.signals);
    const ok = got === c.expect;
    if (!ok) failed++;
    console.log(`  ${ok ? "ok  " : "FAIL"}  ${c.what.padEnd(46)} → ${got}   (expected ${c.expect})`);
    console.log(`        ${c.why}`);
  }
  return failed;
}

/**
 * A single-language site never detects: whatever the signals say, the reader
 * gets its native language. Same signals as above, one expectation.
 */
const siblingCases = (): Case[] =>
  [
    ["Googlebot (US, no cookie)", { country: "US", enabled: null, tenant: TENANT }],
    ["Googlebot, Accept-Language: en", { country: "US", acceptLanguage: "en-US,en;q=0.9", enabled: null, tenant: TENANT }],
    ["reader in Indonesia", { country: "ID", acceptLanguage: "id-ID,id;q=0.9", enabled: null, tenant: TENANT }],
    ["reader in Germany", { country: "DE", enabled: null, tenant: TENANT }],
    ["stale cookie (en)", { cookie: "en", country: "US", enabled: null, tenant: TENANT }],
    ["cookie for a language this site does not ship (th)", { cookie: "th", enabled: null, tenant: TENANT }],
  ].map(([what, signals]) => ({
    what: what as string,
    signals: signals as Parameters<typeof pickLocale>[0],
    expect: DEFAULT_LOCALE,
    why: "owner: setiap website pakai bahasa native-nya, bukan hasil translate",
  }));

const isSibling = SIBLING_TENANTS.has(TENANT);
let failed = isSibling
  ? run(siblingCases(), `${TENANT} (single language, default=${DEFAULT_LOCALE})`)
  : run(ULYAH, `ulyah.com (tenant=ulyah, default=${DEFAULT_LOCALE})`);

// The property that must hold on EVERY site: a language with a domain of its
// own is never served in place — except when it is this very site's language.
console.log("\n=== a language with its own domain is never served in place ===");
for (const code of Object.keys(LOCALE_SITE)) {
  const inPlace = servedInPlace(code, null);
  const expected = code === DEFAULT_LOCALE;
  const ok = inPlace === expected;
  if (!ok) failed++;
  const note = expected ? "(this site's own language)" : `(lives on ${LOCALE_SITE[code]})`;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${code} served in place → ${String(inPlace).padEnd(5)} ${note}`);
}

console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
