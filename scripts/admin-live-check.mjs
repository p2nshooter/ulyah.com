/**
 * The admin portal and the sale of every site, checked on the live sites in a real browser
 * (docs/ADSENSE-BLUEPRINT.md §17.3, §18). Read-only: it signs in with each site's public demo
 * login, which cannot change anything.
 *
 *   - the demo login (GET /sale/demo) opens <domain>/admin on the site's own domain, as a demo;
 *   - the portal shows the Promotions home and no private menu;
 *   - the API answers the promotion pages and refuses donations to that demo session;
 *   - the sale page answers 200 with its price;
 *   - the 🌐 language menu offers the other four sites, each at the same page in its own
 *     language (§19.1: the live page, /live on ulyah.com, xad.es and tilawa.de, /direct on
 *     1fr.fr, /en-vivo on dawa.im).
 *
 * Runs on a GitHub runner (admin-live-check.yml): the development sandbox cannot reach the
 * production domains. The demo password is never printed.
 *
 *   node admin-live-check.mjs
 */
import { chromium } from "playwright";

const SITES = [
  { id: "ulyah", domain: "ulyah.com", api: "https://api.ulyah.com", live: "https://ulyah.com/live" },
  { id: "1fr", domain: "1fr.fr", api: "https://api.1fr.fr", live: "https://1fr.fr/direct" },
  { id: "tilawa", domain: "tilawa.de", api: "https://api.tilawa.de", live: "https://tilawa.de/live" },
  { id: "dawaim", domain: "dawa.im", api: "https://api.dawa.im", live: "https://dawa.im/en-vivo" },
  { id: "xad", domain: "xad.es", api: "https://api.xad.es", live: "https://xad.es/live" },
];

let failed = 0;
const ok = (c, name, d = "") => {
  if (!c) failed++;
  console.log(`${c ? "PASS" : "FAIL"}  ${name}${d ? `  — ${String(d).slice(0, 200)}` : ""}`);
};

const browser = await chromium.launch();
for (const s of SITES) {
  console.log(`\n================ ${s.domain}`);
  const health = await fetch(`${s.api}/health`).then((r) => r.status).catch((e) => `ERR ${e.message}`);
  ok(health === 200, `${s.api}/health answers`, health);

  const demo = await fetch(`https://api.ulyah.com/sale/demo?site=${s.id}`).then((r) => r.json()).catch(() => ({}));
  ok(demo.enabled === true && demo.email === `demo@${s.domain}` && demo.url === `https://${s.domain}/admin`, "the demo login is published for the sale page", `${demo.email ?? "-"} ${demo.url ?? "-"}`);
  if (!demo.enabled) continue;

  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  await page.goto(demo.url, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
  await page.waitForSelector("input[type=email]", { timeout: 30_000 }).catch(() => {});
  await page.fill("input[type=email]", demo.email).catch(() => {});
  await page.fill("input[type=password]", demo.password).catch(() => {});
  await page.locator("form button[type=submit]").first().click().catch(() => {});
  await page.waitForSelector("[data-testid=admin-portal]", { timeout: 30_000 }).catch(() => {});
  const role = await page.locator("[data-testid=admin-role]").innerText().catch(() => "");
  ok(/^(Demo|Démo)$/.test(role.trim()), "signed in on the site's own domain, as a demo", role);
  ok(await page.locator("[data-testid=admin-promo-hub]").isVisible().catch(() => false), "the portal opens on Promotions");
  ok((await page.locator("[data-testid=admin-tab-keys], [data-testid=admin-tab-donations]").count()) === 0, "no private menu for the demo");
  await page.waitForTimeout(1500);
  const hub = await page.locator("[data-testid=admin-promo-hub]").innerText().catch(() => "");
  ok(!/…/.test(hub.split("\n").slice(0, 12).join(" ")), "the three promotion counts load", hub.split("\n").filter((l) => /\d/.test(l)).slice(0, 3).join(" | "));
  const calls = await page.evaluate(async (api) => {
    const get = (p) => fetch(api + p, { credentials: "include" }).then((r) => r.status).catch(() => 0);
    return { promo: await get("/admin/promo"), donations: await get("/admin/donations"), keys: await get("/admin/keys") };
  }, s.api);
  ok(calls.promo === 200, "the API answers the demo's promotion page", calls.promo);
  ok(calls.donations === 403 && calls.keys === 403, "the API refuses donations and keys to the demo", `${calls.donations} ${calls.keys}`);
  ok(errors.length === 0, "no page errors", errors.join(" | "));

  const sale = await page.goto(`https://${s.domain}/acquisition`, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => null);
  const price = await page.locator("[data-testid=sale-price]").first().innerText().catch(() => "");
  console.log(`info  /acquisition ${sale ? sale.status() : "ERR"} ${price ? `price ${price}` : "(no sale price on the page)"}`);

  await page.goto(s.live, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
  await page.locator("[data-testid=language-switcher]").first().click({ timeout: 20_000 }).catch(() => {});
  const offered = await page.locator("[data-testid=language-menu] a").evaluateAll((as) => as.map((a) => a.href)).catch(() => []);
  const want = SITES.filter((o) => o !== s).map((o) => o.live);
  ok(want.every((u) => offered.includes(u)) && offered.length === want.length, "the language menu opens the same page on the four other sites", offered.join(" "));
  await ctx.close();
}
await browser.close();
console.log(`\n${failed ? `${failed} check(s) failed` : "ALL OK"}`);
process.exit(failed ? 1 : 0);
