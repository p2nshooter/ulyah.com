/**
 * Offline proof that the AdOps rules do what docs/ADMANAGER-BLUEPRINT.md says.
 *
 * No network: the Google calls are exercised against recorded response
 * shapes (from the official v1 protos), and the JWT is signed with a key
 * generated here and verified with its public half. Run: npx tsx scripts/check-adops.ts
 */
import { OWNER_SITES, EXCLUDED_TRACK_IDS, automatableSites, siteByTrackId, OWNER_ADSENSE_CLIENT } from "../packages/shared/src/owner-sites.ts";
import { desiredAdUnits, diffAdUnits, siteOfCode, chunk, POSITIONS, AD_PLACEMENT, AUTO_POSITION } from "../apps/worker-api/src/lib/adops/plan.ts";
import { nextFloor, tierOf, shouldPark, INITIAL_FLOOR, rpm, fill } from "../apps/worker-api/src/lib/adops/yield.ts";
import { parseRows, readValue, reportBody, adUnitBody, adManagerClient, listAdUnits } from "../apps/worker-api/src/lib/adops/admanager.ts";
import { listAdsenseSites, parseAdsenseReport, adsenseReportUrl } from "../apps/worker-api/src/lib/adops/adsense.ts";
import { readFileSync } from "node:fs";
import { parseServiceAccount, signJwt } from "../apps/worker-api/src/lib/adops/google.ts";
import { isoWeek } from "../apps/worker-api/src/lib/adops/runner.ts";

let failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (!cond) failed++;
  console.log(`  ${cond ? "ok  " : "FAIL"}  ${name}${!cond && detail ? `\n        ${detail}` : ""}`);
}
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
console.log("\n=== registry ===");
check("dawa.es is not in the registry", !OWNER_SITES.some((s) => s.domain === "dawa.es" || s.trackId === "dawa"));
check("dawa is the excluded beacon id", EXCLUDED_TRACK_IDS.has("dawa"));
check("27 owner sites (17 built + 10 planned)", OWNER_SITES.length === 27 && automatableSites().length === 17, `${OWNER_SITES.length} / ${automatableSites().length}`);
check("track ids and domains are unique", new Set(OWNER_SITES.map((s) => s.trackId)).size === OWNER_SITES.length && new Set(OWNER_SITES.map((s) => s.domain)).size === OWNER_SITES.length);
check("track ids are valid ad unit codes", OWNER_SITES.every((s) => /^[a-z0-9-]+$/.test(s.trackId)));
check("legacy xad-es beacon maps to xad.es", siteByTrackId("xad-es")?.domain === "xad.es");
check("one AdSense account", OWNER_ADSENSE_CLIENT === "ca-pub-5693981744147503");

console.log("\n=== inventory plan (§5) ===");
const two = [{ trackId: "xko-es", domain: "xko.es" }, { trackId: "byodd-de", domain: "byodd.de" }];
const plan = desiredAdUnits(two);
check("2 sites → 2 site nodes + 10 slots", plan.length === 12, String(plan.length));
check("site nodes come before their slots", plan.slice(0, 2).every((p) => p.parentCode === null) && plan.slice(2).every((p) => p.parentCode !== null));
check("slot codes are <trackId>-<position>", plan.filter((p) => p.position).every((p) => p.code === `${p.site}-${p.position}`));
check("plan is deterministic (order-independent)", eq(desiredAdUnits(two), desiredAdUnits([...two].reverse())));
check("top and in1 are protected, others not", POSITIONS.top.protected && POSITIONS.in1.protected && !POSITIONS.in2.protected && !POSITIONS.side.protected && !POSITIONS.end.protected);
const reg = new Set(OWNER_SITES.map((s) => s.trackId));
check("siteOfCode resolves slots and nodes", siteOfCode("xko-es-top", reg) === "xko-es" && siteOfCode("xko-es", reg) === "xko-es" && siteOfCode("someone-elses-unit", reg) === null);
check("a site id that ends like a position is not confused", siteOfCode("1fr-end", reg) === "1fr" && siteOfCode("1fr", reg) === "1fr");

const actual = [
  { name: "networks/1/adUnits/10", code: "xko-es", status: "ACTIVE" },
  { name: "networks/1/adUnits/11", code: "xko-es-top", status: "ACTIVE" },
  { name: "networks/1/adUnits/12", code: "xko-es-in2", status: "INACTIVE" }, // parked by the yield rule
  { name: "networks/1/adUnits/13", code: "xko-es-side", status: "INACTIVE" }, // inactive for no reason
  { name: "networks/1/adUnits/20", code: "qkb-es-top", status: "ACTIVE" }, // qkb.es no longer READY
  { name: "networks/1/adUnits/30", code: "foreign-unit", status: "ACTIVE" }, // not ours
];
const diff = diffAdUnits([{ trackId: "xko-es", domain: "xko.es" }], [...reg], actual, new Set(["xko-es-in2"]));
check("creates only what is missing", eq(diff.create.map((d) => d.code), ["xko-es-in1", "xko-es-end"]), diff.create.map((d) => d.code).join(","));
check("reactivates an inactive planned unit, not a parked one", eq(diff.activate.map((a) => a.code), ["xko-es-side"]));
check("deactivates units of a site that is no longer READY", eq(diff.deactivate.map((a) => a.code), ["qkb-es-top"]));
check("never touches units outside the registry", !diff.deactivate.some((a) => a.code === "foreign-unit"));
check("batches never exceed 100", chunk(Array.from({ length: 250 }, (_, i) => i)).map((b) => b.length).join(",") === "100,100,50");

const body = adUnitBody(plan[2]!, "networks/1/adUnits/10") as { adUnitSizes: { size: { sizeType: string }; environmentType: string }[]; parentAdUnit: string; adUnitCode: string };
check("ad unit body has parent, code and BROWSER sizes", body.parentAdUnit === "networks/1/adUnits/10" && body.adUnitCode === plan[2]!.code && body.adUnitSizes.every((s) => s.environmentType === "BROWSER"));
check("fluid size uses sizeType FLUID", body.adUnitSizes.some((s) => s.size.sizeType === "FLUID"));

console.log("\n=== floors (§6) ===");
check("tiers", tierOf("US") === "T1" && tierOf("de") === "T1" && tierOf("ES") === "T2" && tierOf("ID") === "T3" && tierOf(null) === "T3");
const start = { floor: INITIAL_FLOOR.T1, previousFloor: null, lastStep: null } as const;
const week = (requests: number, impressions: number, revenue: number) => ({ requests, impressions, revenue });
check("rpm and fill", rpm(week(1000, 800, 2)) === 2 && fill(week(1000, 800, 2)) === 0.8);
let d = nextFloor(start, week(1500, 1200, 3), null);
check("under 2,000 requests: hold", !d.changed && d.floor === 0.5);
d = nextFloor(start, week(10000, 3000, 20), null);
check("fill < 40%: −15%", d.changed && d.floor === 0.43 && d.lastStep === "down", JSON.stringify(d));
d = nextFloor(start, week(10000, 8000, 20), null);
check("first measured week: +10%", d.changed && d.floor === 0.55 && d.lastStep === "up", JSON.stringify(d));
const up = { floor: 0.55, previousFloor: 0.5, lastStep: "up" as const };
d = nextFloor(up, week(10000, 8000, 25), week(10000, 8000, 20));
check("RPM up: keep climbing", d.changed && d.floor === 0.61 && d.lastStep === "up", JSON.stringify(d));
d = nextFloor(up, week(10000, 8000, 15), week(10000, 8000, 20));
check("RPM down after a raise: revert then step down", d.changed && d.floor === 0.45 && d.lastStep === "down" && d.previousFloor === 0.55, JSON.stringify(d));
d = nextFloor(up, week(10000, 8000, 20.1), week(10000, 8000, 20));
check("RPM ±2%: hold", !d.changed && d.floor === 0.55);
d = nextFloor({ floor: 5, previousFloor: 4.5, lastStep: "up" }, week(10000, 8000, 30), week(10000, 8000, 20));
check("never above 5.00", !d.changed && d.floor === 5);
d = nextFloor({ floor: 0.01, previousFloor: 0.02, lastStep: "down" }, week(10000, 1000, 1), null);
check("never below 0.01", d.floor === 0.01);
check("same input → same output", eq(nextFloor(up, week(10000, 8000, 25), week(10000, 8000, 20)), nextFloor(up, week(10000, 8000, 25), week(10000, 8000, 20))));

console.log("\n=== weak positions (§7) ===");
const weak = { code: "xko-es-side", protected: false, weeks: Array(4).fill({ requests: 3000, revenue: 0.3 }), siteRpm: [2, 2, 2, 2] };
check("RPM < 20% of site 4 weeks running: park", shouldPark(weak).park);
check("protected positions are never parked", !shouldPark({ ...weak, code: "xko-es-top", protected: true }).park);
check("one decent week saves it", !shouldPark({ ...weak, weeks: [{ requests: 3000, revenue: 3 }, ...weak.weeks.slice(1)] }).park);
check("too little data: keep", !shouldPark({ ...weak, weeks: Array(4).fill({ requests: 100, revenue: 0 }) }).park);

console.log("\n=== Google response shapes ===");
check("MONEY as doubleValue is currency units", readValue({ doubleValue: 1.25 }, "money") === 1.25);
check("MONEY as intValue is micros", readValue({ intValue: "1250000" }, "money") === 1.25);
check("DATE int → YYYY-MM-DD", readValue({ intValue: "20261003" }, "date") === "2026-10-03");
const rows = parseRows([
  {
    dimensionValues: [{ intValue: "20261003" }, { stringValue: "xko-es-top" }, { stringValue: "de" }],
    metricValueGroups: [{ primaryValues: [{ intValue: "1200" }, { intValue: "900" }, { intValue: "4" }, { doubleValue: 1.8 }] }],
  },
]);
check("report row parsed", eq(rows[0], { date: "2026-10-03", adUnitCode: "xko-es-top", country: "DE", requests: 1200, impressions: 900, clicks: 4, revenue: 1.8 }), JSON.stringify(rows[0]));
const rb = reportBody() as { reportDefinition: { reportType: string; dateRange: { relative: string }; dimensions: string[] } };
check("report is HISTORICAL, yesterday, by date/ad unit/country", rb.reportDefinition.reportType === "HISTORICAL" && rb.reportDefinition.dateRange.relative === "YESTERDAY" && eq(rb.reportDefinition.dimensions, ["DATE", "AD_UNIT_CODE", "COUNTRY_CODE"]));

// Paging through a fake Ad Manager: two pages of ad units.
const pages: Record<string, unknown> = {
  "networks/1/adUnits?pageSize=1000": { adUnits: [{ name: "networks/1/adUnits/1", adUnitCode: "a", status: "ACTIVE" }], nextPageToken: "p2" },
  "networks/1/adUnits?pageSize=1000&pageToken=p2": { adUnits: [{ name: "networks/1/adUnits/2", adUnitCode: "b", status: "INACTIVE" }, { name: "networks/1/adUnits/3" }] },
};
const fakeFetch = (async (url: string) => {
  const path = String(url).replace("https://admanager.googleapis.com/v1/", "");
  const bodyOut = pages[path];
  return new Response(bodyOut ? JSON.stringify(bodyOut) : '{"error":{"message":"nope"}}', { status: bodyOut ? 200 : 404 });
}) as typeof fetch;
const units = await listAdUnits(adManagerClient("t", "1", fakeFetch));
check("ad units are read across pages; units without a code are skipped", eq(units.map((u) => u.code), ["a", "b"]));

const adsenseFetch = (async () =>
  new Response(JSON.stringify({ sites: [{ domain: "www.XKO.es", state: "READY", autoAdsEnabled: true }, { domain: "qkb.es", state: "GETTING_READY" }] }), { status: 200 })) as typeof fetch;
const as = await listAdsenseSites("t", "pub-5693981744147503", adsenseFetch);
check("AdSense domains normalised, states kept", eq(as, [{ domain: "xko.es", state: "READY", autoAdsEnabled: true }, { domain: "qkb.es", state: "GETTING_READY", autoAdsEnabled: false }]));

console.log("\n=== service account JWT ===");
const kp = (await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
const pkcs8 = Buffer.from(await crypto.subtle.exportKey("pkcs8", kp.privateKey)).toString("base64");
const pem = `-----BEGIN PRIVATE KEY-----\n${pkcs8.match(/.{1,64}/g)!.join("\n")}\n-----END PRIVATE KEY-----\n`;
const sa = parseServiceAccount(JSON.stringify({ type: "service_account", client_email: "adops@proj.iam.gserviceaccount.com", private_key: pem }));
const jwt = await signJwt(sa, "scope-a scope-b", 1_800_000_000);
const [h, p, sig] = jwt.split(".");
const dec = (s: string) => JSON.parse(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", kp.publicKey, Buffer.from(sig!.replace(/-/g, "+").replace(/_/g, "/"), "base64"), new TextEncoder().encode(`${h}.${p}`));
check("JWT signature verifies with the public key", valid);
check("JWT claims", dec(p!).iss === sa.client_email && dec(p!).scope === "scope-a scope-b" && dec(p!).exp - dec(p!).iat === 3600 && dec(h!).alg === "RS256");
let threw = "";
try {
  parseServiceAccount('{"type":"authorized_user"}');
} catch (e) {
  threw = (e as Error).message;
}
check("a non service-account JSON is refused with a readable message", threw.includes("service_account"));

console.log("\n=== Auto ads mode (owner: no manual slots) ===");
check("placement is Auto ads", AD_PLACEMENT === "auto");
check("Auto-ads rows are stored under position 'auto'", AUTO_POSITION === "auto");
{
  const u = new URL(adsenseReportUrl("pub-5693981744147503"));
  check(
    "report asks AdSense for the 7-day DATE × DOMAIN × COUNTRY earnings report in USD",
    u.pathname === "/v2/accounts/pub-5693981744147503/reports:generate" &&
      u.searchParams.get("dateRange") === "LAST_7_DAYS" &&
      u.searchParams.getAll("dimensions").join(",") === "DATE,DOMAIN_NAME,COUNTRY_CODE" &&
      u.searchParams.getAll("metrics").includes("ESTIMATED_EARNINGS") &&
      u.searchParams.getAll("metrics").includes("PAGE_VIEWS") &&
      u.searchParams.get("currencyCode") === "USD"
  );
  // Columns deliberately out of order: parsing is by header name.
  const rows = parseAdsenseReport({
    headers: [{ name: "COUNTRY_CODE" }, { name: "DATE" }, { name: "DOMAIN_NAME" }, { name: "ESTIMATED_EARNINGS" }, { name: "PAGE_VIEWS" }, { name: "AD_REQUESTS" }, { name: "IMPRESSIONS" }, { name: "CLICKS" }],
    rows: [{ cells: [{ value: "de" }, { value: "2026-10-03" }, { value: "www.XKO.es" }, { value: "1.25" }, { value: "900" }, { value: "2000" }, { value: "1500" }, { value: "4" }] }],
  });
  check(
    "report rows parse by header name, domain normalised",
    rows.length === 1 && rows[0]!.domain === "xko.es" && rows[0]!.country === "DE" && rows[0]!.earnings === 1.25 && rows[0]!.pageViews === 900 && rows[0]!.clicks === 4
  );
  let missing = "";
  try {
    parseAdsenseReport({ headers: [{ name: "DATE" }], rows: [{ cells: [{ value: "2026-10-03" }] }] });
  } catch (e) {
    missing = (e as Error).message;
  }
  check("a report missing a column is refused, not misread", missing.includes("DOMAIN_NAME"));
  const runner = readFileSync(new URL("../apps/worker-api/src/lib/adops/runner.ts", import.meta.url), "utf8");
  check("in Auto ads mode the runner never creates Ad Manager inventory", /if \(AD_PLACEMENT === "auto"\) \{[\s\S]{0,400}tidak membuat inventory/.test(runner));
  check("floors and parking only run in Ad Manager mode", /AD_PLACEMENT === "gam" && !\(await env\.CACHE_KV\.get\(`adops:weekly/.test(runner));
}

console.log("\n=== schedule ===");
check("ISO week", isoWeek(new Date("2026-10-04T12:00:00Z")) === "2026-W40" && isoWeek(new Date("2027-01-01T00:00:00Z")) === "2026-W53");

console.log(failed ? `\n${failed} check(s) failed` : "\nALL OK");
process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
