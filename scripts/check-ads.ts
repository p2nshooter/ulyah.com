/**
 * One ad network, the loader + meta + ads.txt only, and nothing between them
 * and the page.
 *
 * Three owner decisions are held here, and all are the kind that rot quietly.
 *
 * NO MANUAL UNITS. "Hapus aja dan bersihkan slot AdSense nya di website manapun
 * karena sy bikin otomatis (ingat kecuali dawa.es), cukup cuplikan AdSense,
 * ads.txt & tag meta" (4 Oct 2026, every site still under review). Auto ads
 * place the ads once a site is approved; an <ins class="adsbygoogle">, a
 * data-ad-slot or an adsbygoogle.push put back anywhere is a failure here.
 *
 * ONE NETWORK. Adsterra was removed from the ecosystem ("hapus iklan adsterra
 * di ekosistem ulyah.com, ganti dengan adsense aja"). Removing a network is not
 * only deleting a component: a reference put back anywhere — the component, a
 * flag named after it, a key in a payload — resurrects the markup, and that is
 * invisible in review.
 *
 * NO CONFIGURATION. "Langsung online aja AdSense dan apus settingan AdSense di
 * dawa.es dan ekosistem ulyah.com, pokoknya ketika ads di pasang langsung
 * online." The central config is gone: no D1 row, no KV mirror, no per-site
 * enabled/approved/autoAds, no admin tab, no fetch on page load. An ad slot in
 * the code IS a live ad.
 *
 * That last one is worth a check of its own because of how it failed before.
 * Every gate was a way for the ads to be silently off, and each one happened:
 * a wildcard CORS header made the config unreadable, so every site read
 * "switched off" for weeks; before that, an empty unit-id box meant enabled,
 * approved, all green, and nothing on the page. None of it errored. The only
 * durable fix is that there is nothing left to be off — so this asserts the
 * absence, which is the thing a future edit would undo.
 *
 *   npx tsx scripts/check-ads.ts
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
let failed = 0;
function check(what: string, ok: boolean, detail = "") {
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}`);
  if (!ok && detail) console.log(`        ${detail}`);
}
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
/** Source with comments stripped: an explanation of a removal is not a use. */
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

console.log("=== the account is one constant: loader, meta tag and ads.txt ===");
const adConfig = read("apps/web/src/lib/ad-config.ts");
const client = /ORIGINAL_ACCOUNT\s*=\s*"(ca-pub-\d{10,20})"/.exec(adConfig);
check("a real publisher id is exported", Boolean(client), adConfig.slice(0, 200));

const layout = read("apps/web/src/app/[locale]/layout.tsx");
check(
  "the loader snippet is in the layout, from that constant, async + crossorigin",
  /adsbygoogle\.js\?client=\$\{AD_CLIENT_ID\}/.test(layout) && /\basync\b/.test(layout) && /crossOrigin="anonymous"/.test(layout),
  "the layout must load pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}"
);
check(
  "the google-adsense-account meta tag is in the layout, from that constant",
  /<meta name="google-adsense-account" content=\{AD_CLIENT_ID\} \/>/.test(layout)
);
check(
  "the layout hard-codes no publisher id",
  !/ca-pub-\d/.test(code(layout)),
  "the layout still hard-codes a publisher id — it must import AD_CLIENT_ID"
);

console.log("\n=== each site declares the account the owner gave it ===");
// docs/ADSENSE-BLUEPRINT.md §2. Since 2026-10-04 every owner site is on the one
// account ca-pub-5693981744147503 ("jadi 1 akun saja"). dawa.es is detached and
// not the owner's any more: it keeps its original account, untouched (§10).
const EXPECTED: Record<string, string> = {
  ulyah: "ca-pub-5693981744147503",
  "1fr": "ca-pub-5693981744147503",
  tilawa: "ca-pub-5693981744147503",
  xad: "ca-pub-5693981744147503",
};
for (const [tenant, pub] of Object.entries(EXPECTED)) {
  const key = tenant === "1fr" ? '"1fr"' : tenant;
  check(`${tenant} declares ${pub}`, new RegExp(`${key}:\\s*"${pub}"`).test(adConfig));
}
check("dawa stays on its own original account", /dawa:\s*ORIGINAL_ACCOUNT/.test(adConfig));
check(
  "ads.txt is built per site from the same constant",
  !existsSync(join(ROOT, "apps/web/public/ads.txt")) &&
    /AD_CLIENT_ID/.test(read("apps/web/src/app/ads.txt/route.ts")),
  "a static public/ads.txt is shared by every tenant build and would name one account on every site"
);

console.log("\n=== no manual ad unit anywhere (Auto ads only) ===");
const UNIT = [/<ins\b[^>]*adsbygoogle/, /data-ad-slot/, /adsbygoogle\s*\|\|\s*\[\]\)\.push|adsbygoogle\.push/, /data-ad-client/];
function walkAll(dir: string, exts: RegExp, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkAll(p, exts, out);
    else if (exts.test(p)) out.push(p);
  }
  return out;
}
const unitFiles: string[] = [];
for (const root of ["apps/web/src", "apps/web/public", "sites/_engine", ...readdirSync(join(ROOT, "sites")).filter((d) => !d.startsWith("_") && statSync(join(ROOT, "sites", d)).isDirectory()).map((d) => `sites/${d}`)]) {
  for (const f of walkAll(join(ROOT, root), /\.(ts|tsx|js|mjs|html|md)$/)) {
    // The generated UI strings, and the engine check that holds this same rule.
    if (f.endsWith("ui-i18n.gen.ts") || f.endsWith("sites/_engine/check.mjs")) continue;
    if (UNIT.some((re) => re.test(code(readFileSync(f, "utf8"))))) unitFiles.push(f.slice(ROOT.length + 1));
  }
}
check("no <ins class=adsbygoogle>, data-ad-slot or adsbygoogle.push", unitFiles.length === 0, unitFiles.join(", "));
for (const gone of ["apps/web/src/components/AdSlot.tsx", "apps/web/src/components/PageAds.tsx", "apps/web/src/lib/ad-stats.ts", "apps/web/src/components/admin/AdStatsPanel.tsx"]) {
  check(`${gone.split("/").pop()} is gone`, !existsSync(join(ROOT, gone)));
}

console.log("\n=== nothing gates a placement ===");
// The words that would bring the switches back. Checked on code, not comments,
// so the files can still explain what was removed.
check(
  "nothing fetches an ad config any more",
  !/fetch\(.*ad-config/.test(code(adConfig)) && !/fetchAdView/.test(code(adConfig)),
  "lib/ad-config.ts is a constants module now — no request, no cache, no fallback"
);
check(
  "the admin has no AdSense tab",
  !existsSync(join(ROOT, "apps/web/src/components/admin/AdsenseTab.tsx")) &&
    !/AdsenseTab/.test(read("apps/web/src/app/[locale]/admin/page.tsx"))
);
check(
  "the worker has no ad config module",
  !existsSync(join(ROOT, "apps/worker-api/src/lib/ad-config.ts"))
);
for (const [file, what] of [
  ["apps/worker-api/src/routes/content.ts", "the public ad-config endpoint"],
  ["apps/worker-api/src/routes/admin.ts", "the admin ad-config endpoints"],
  ["apps/worker-api/src/index.ts", "the one-time dawa activation"],
] as const) {
  check(`${what} is gone`, !/ad-config|adsense-config|activateDawaAdsense/.test(code(read(file))));
}

console.log("\n=== nothing references the removed network ===");
const WIRING = [/\bNetworkAd\b/, /\badsterra\s*[:?]/i, /\.adsterra\b/i, /["'`]adsterra["'`]/i];
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}
const offenders: string[] = [];
for (const root of ["apps/web/src", "apps/worker-api/src"]) {
  for (const f of walk(join(ROOT, root))) {
    if (WIRING.some((re) => re.test(code(readFileSync(f, "utf8"))))) offenders.push(f.slice(f.indexOf("apps/")));
  }
}
check("no live code mentions the old network or its component", offenders.length === 0, offenders.join(", "));
check(
  "the sandboxed ad frame is gone with it",
  !existsSync(join(ROOT, "apps/web/public/ads/frame.html")),
  "public/ads/frame.html only ever served the old network"
);
check(
  "the old network's unit tester page is gone too",
  !existsSync(join(ROOT, "apps/web/public/ads/check.html")),
  "public/ads/check.html rendered Adsterra units by key on every site"
);

console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
