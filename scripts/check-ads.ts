/**
 * One ad network, and a config that cannot smuggle the old one back.
 *
 * Adsterra was removed from the ecosystem (owner: "hapus iklan adsterra di
 * ekosistem ulyah.com, ganti dengan adsense aja"). Removing a network is not
 * only deleting a component: its flags live in a row of JSON in D1 that is read
 * back on every save, and the sites read a derived view of that row on every
 * page. A leftover `adsterra: true` in the stored config is invisible in code
 * review and would come back the moment anything re-read it.
 *
 * So three things are pinned here:
 *   1. a stored config from BEFORE the removal reads cleanly, and the dead flag
 *      does not survive the round trip;
 *   2. what the sites are served carries no trace of it either;
 *   3. no source file has gone back to referencing the network or its
 *      component, which is what would resurrect the markup.
 *
 *   npx tsx scripts/check-ads.ts
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { defaultAdConfig, publicAdView, AD_PLACEMENTS } from "../apps/worker-api/src/lib/ad-config";

let failed = 0;
function check(what: string, ok: boolean, detail = "") {
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}`);
  if (!ok && detail) console.log(`        ${detail}`);
}

console.log("=== the config the sites are served ===");
const cfg = defaultAdConfig();
const view = publicAdView(cfg, "dawa") as Record<string, unknown>;
check(
  "the public view has exactly the fields a site needs",
  JSON.stringify(Object.keys(view).sort()) === JSON.stringify(["approved", "autoAds", "clientId", "enabled", "slots"]),
  `got ${JSON.stringify(Object.keys(view).sort())}`
);
check("no adsterra flag in the public view", !("adsterra" in view));
check("no adsterra flag in the config itself", !("adsterra" in (cfg as Record<string, unknown>)));
check(
  "no adsterra flag on a site's state",
  Object.values(cfg.sites).every((st) => !("adsterra" in (st as Record<string, unknown>))),
  "a per-site adsterra flag is still being produced"
);

console.log("\n=== a config stored BEFORE the removal still reads ===");
// Exactly the shape the live row carries today: a master flag, and per-site
// state with the old boolean form alongside the newer object form.
const legacy = {
  clientId: "ca-pub-000",
  adsterra: true,
  slots: { in_article: "123" },
  sites: {
    ulyah: { enabled: true, approved: true, adsterra: true },
    dawa: true,
    tilawa: { enabled: false, approved: false, adsterra: false },
  },
} as unknown as Parameters<typeof publicAdView>[0];

// normalizeAdConfig is internal; publicAdView exercises the same coercion,
// which is the path every site's render actually takes.
const fromLegacy = publicAdView(legacy, "ulyah") as Record<string, unknown>;
check("an old row's enabled + approved survive", fromLegacy.enabled === true && fromLegacy.approved === true);
check("its adsterra flag does not", !("adsterra" in fromLegacy));
const legacyBool = publicAdView(legacy, "dawa") as Record<string, unknown>;
check("the oldest boolean form still means 'enabled'", legacyBool.enabled === true && legacyBool.approved === false);

console.log("\n=== auto ads stands our own units down ===");
// The two must never be on at once: Google inserts its own placements, and ours
// would be a second set on the same page. The config enforces it by withholding
// the unit ids, so there is nothing for AdSlot to render even if it tried.
const auto = {
  clientId: "ca-pub-000",
  slots: { in_article: "123", footer: "123" },
  sites: { dawa: { enabled: true, approved: true, autoAds: true } },
} as unknown as Parameters<typeof publicAdView>[0];
const autoView = publicAdView(auto, "dawa");
check("the site is still live", autoView.enabled === true && autoView.approved === true);
check("autoAds is reported to the site", autoView.autoAds === true);
check(
  "no unit ids are sent while Google is placing",
  Object.keys(autoView.slots).length === 0,
  `got ${JSON.stringify(autoView.slots)}`
);
const manual = {
  ...auto,
  sites: { dawa: { enabled: true, approved: true, autoAds: false } },
} as unknown as Parameters<typeof publicAdView>[0];
check("with auto ads off, the ids are sent again", Object.keys(publicAdView(manual, "dawa").slots).length > 0);

console.log("\n=== the placements the admin can give an id ===");
check(
  "every placement AdSlot uses is configurable",
  ["in_article", "in_article_1", "in_article_2", "list", "footer", "sidebar"].every((p) =>
    (AD_PLACEMENTS as readonly string[]).includes(p)
  ),
  `AD_PLACEMENTS is ${AD_PLACEMENTS.join(", ")}`
);

console.log("\n=== nothing references the removed network ===");
const ROOTS = ["apps/web/src", "apps/worker-api/src"];

/**
 * What counts as a reference.
 *
 * The WORD is fine — the admin panel says, in so many words, that the network
 * was removed, and the comments explaining the removal would be worse without
 * it. What must not come back is the wiring: the component, a property named
 * after the flag, a read of it, or its string key in a payload. So the test is
 * on the shapes code uses, not on the prose.
 */
const WIRING = [
  /\bNetworkAd\b/,
  /\badsterra\s*[:?]/i, // a property definition or optional field
  /\.adsterra\b/i, // a read
  /["'`]adsterra["'`]/i, // a key in a payload or a storage key
];
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}
const offenders: string[] = [];
for (const root of ROOTS) {
  for (const f of walk(join(import.meta.dirname, "..", root))) {
    const src = readFileSync(f, "utf8");
    // Comments are stripped first: an explanation of the removal is not a
    // reference to it.
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    if (WIRING.some((re) => re.test(code))) offenders.push(f.slice(f.indexOf("apps/")));
  }
}
check(
  "no live code mentions the old network or its component",
  offenders.length === 0,
  offenders.join(", ")
);
check(
  "the sandboxed ad frame is gone with it",
  !existsSync(join(import.meta.dirname, "..", "apps/web/public/ads/frame.html")),
  "public/ads/frame.html still exists — it only ever served the old network"
);

console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
