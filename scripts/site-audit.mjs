// Opens every site in a real Chromium and reports what a visitor (and the
// AdSense crawler) actually gets: status, title, menu, article links, the
// AdSense account the page declares, ads.txt, sitemap size, and any Adsterra
// host still being loaded. Run from GitHub Actions, where the sites are
// reachable; prints one block per domain so the job log is the report.
//
//   node scripts/site-audit.mjs jai.lat lie.skin …
import { chromium } from "playwright";

const ADSTERRA = /adsterra|highperformanceformat|effectivegatecpm|effectivecpmnetwork|profitableratecpm|toppersonalcpm/i;
const domains = process.argv.slice(2);

const browser = await chromium.launch();
for (const domain of domains) {
  const out = { domain };
  const ctx = await browser.newContext({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36" });
  const page = await ctx.newPage();
  const adsterraHits = new Set();
  page.on("request", (r) => { if (ADSTERRA.test(r.url())) adsterraHits.add(new URL(r.url()).host); });
  try {
    const res = await page.goto(`https://${domain}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3500);
    out.status = res?.status();
    out.finalUrl = page.url();
    out.server = res?.headers()["server"];
    out.title = await page.title();
    out.lang = await page.evaluate(() => document.documentElement.lang);
    out.adsenseMeta = await page.evaluate(() => document.querySelector('meta[name="google-adsense-account"]')?.content ?? null);
    out.adsenseLoader = await page.evaluate(() => [...document.scripts].map((s) => s.src).filter((s) => s.includes("adsbygoogle")).map((s) => new URL(s).searchParams.get("client")));
    out.h1 = await page.evaluate(() => [...document.querySelectorAll("h1")].map((h) => h.textContent.trim().slice(0, 90)).slice(0, 2));
    out.menu = await page.evaluate(() => [...document.querySelectorAll("header a, nav a")].map((a) => a.textContent.trim().replace(/\s+/g, " ")).filter(Boolean).slice(0, 24));
    out.articleLinks = await page.evaluate(() => new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => /\/(articles?|blog|insights|guides?|help|art[ií]culos?)\//.test(h))).size);
    out.sampleArticles = await page.evaluate(() => [...document.querySelectorAll("a[href]")].filter((a) => /\/(articles?|blog|insights|guides?|help|art[ií]culos?)\//.test(a.getAttribute("href"))).map((a) => a.textContent.trim().replace(/\s+/g, " ").slice(0, 80)).filter(Boolean).slice(0, 5));
    out.htmlAdsterra = ADSTERRA.test(await page.content());
  } catch (e) {
    out.error = String(e.message || e).split("\n")[0];
  }
  out.adsterraRequests = [...adsterraHits];
  for (const path of ["/ads.txt", "/robots.txt", "/sitemap.xml"]) {
    try {
      const r = await ctx.request.get(`https://${domain}${path}`, { timeout: 20000 });
      const body = await r.text();
      if (path === "/sitemap.xml") out.sitemap = `${r.status()} · ${(body.match(/<loc>/g) || []).length} urls`;
      else out[path.slice(1)] = `${r.status()} · ${body.trim().split("\n").slice(0, 3).join(" | ").slice(0, 200)}`;
    } catch (e) {
      out[path.slice(1)] = `ERR ${String(e.message || e).split("\n")[0].slice(0, 120)}`;
    }
  }
  console.log(`\n===== ${domain}`);
  for (const [k, v] of Object.entries(out)) if (k !== "domain") console.log(`${k.padEnd(16)} ${typeof v === "string" ? v : JSON.stringify(v)}`);
  await ctx.close();
}
await browser.close();
