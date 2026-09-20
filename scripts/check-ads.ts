/**
 * One ad network, and nothing between a placement and the page.
 *
 * Two owner decisions are held here, and both are the kind that rot quietly.
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

console.log("=== the account and the unit are constants ===");
const adConfig = read("apps/web/src/lib/ad-config.ts");
const client = /AD_CLIENT_ID\s*=\s*"(ca-pub-\d{10,20})"/.exec(adConfig);
const slot = /AD_SLOT\s*=\s*"(\d{6,20})"/.exec(adConfig);
check("a real publisher id is exported", Boolean(client), adConfig.slice(0, 200));
check("a real ad-unit id is exported", Boolean(slot), "AD_SLOT must be the data-ad-slot from the unit's snippet");

// The loader script and the units must name the SAME account, or every <ins>
// on the site asks an account the page never loaded.
const layout = read("apps/web/src/app/[locale]/layout.tsx");
check(
  "the loader script uses that same constant",
  /AD_CLIENT_ID/.test(layout) && !/ca-pub-\d/.test(code(layout)),
  "the layout still hard-codes a publisher id — it must import AD_CLIENT_ID"
);

const adSlot = read("apps/web/src/components/AdSlot.tsx");
check(
  "the unit renders the constants",
  /data-ad-client=\{AD_CLIENT_ID\}/.test(adSlot) && /data-ad-slot=\{AD_SLOT\}/.test(adSlot)
);

console.log("\n=== nothing gates a placement ===");
// The words that would bring the switches back. Checked on code, not comments,
// so the files can still explain what was removed.
const GATES = [/\benabled\b/, /\bapproved\b/, /\bautoAds\b/, /fetchAdView/, /ad-config\?site/];
for (const file of ["apps/web/src/components/AdSlot.tsx", "apps/web/src/components/PageAds.tsx"]) {
  const src = code(read(file));
  const found = GATES.filter((re) => re.test(src)).map(String);
  check(`${file.split("/").pop()} has no config gate`, found.length === 0, found.join(", "));
}
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

console.log("\n=== the label stays on every unit ===");
// The one thing that is NOT negotiable when the ads go live everywhere: a
// reader can always tell an ad from the article. It is the policy line that
// costs an account, and the reason a click is worth anything to the advertiser.
check(
  "a caption is rendered with the unit",
  /caption/.test(adSlot) && /AD_L/.test(adSlot),
  "AdSlot must keep its per-language ad label"
);
check(
  "no unit is dressed as content",
  !/data-ad-placeholder/.test(adSlot),
  "the preview scaffolding must not be shown to readers"
);

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

console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
