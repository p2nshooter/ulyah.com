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

// What each domain must declare (docs/ADSENSE-CODES.md). A site missing its
// meta tag, loader or ads.txt line is reported as such at the end.
// Since 2026-10-04 every owner site is on ONE account ("jadi 1 akun saja").
// dawa.es is detached — no longer the owner's — and is not audited at all
// (docs/ADSENSE-BLUEPRINT.md §10). Every page must carry the loader + meta +
// ads.txt and NO manual unit: the sites run Auto ads (owner, 4 Oct 2026).
const ONE_ACCOUNT = "5693981744147503";
const EXPECTED = Object.fromEntries([
  "ulyah.com", "axto.io", "xaa.es", "1fr.fr", "axto.us", "axto.dev", "jai.lat", "lie.skin",
  "oldco.in", "profity.in", "dawo.es", "qkb.es", "byodd.de", "xko.es", "byoxy.de", "tilawa.de",
  "xad.es", "byoy.de", "qarf.de", "qulen.de", "qurm.de", "rubiy.de", "zavik.de", "zevok.de",
  "zolun.de", "zufiq.de", "zuvik.de",
].map((d) => [d, ONE_ACCOUNT]));
const verdicts = [];

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
  // What the AdSense verification crawler reads: the HTML the server sends,
  // before any JavaScript runs. A loader added only in the browser (for
  // example next/script afterInteractive) passes the checks above but fails
  // verification, so the raw HTML is checked on its own.
  try {
    const r = await ctx.request.get(`https://${domain}/`, { timeout: 20000 });
    const raw = await r.text();
    out.rawMeta = (raw.match(/<meta[^>]+name="google-adsense-account"[^>]*>/) || [null])[0];
    out.rawLoader = [...raw.matchAll(/<script[^>]+adsbygoogle\.js\?client=(ca-pub-\d+)/g)].map((m) => m[1]);
    // Manual units in the SERVER html. Auto ads inserts its own <ins> in the
    // browser after approval, so only the raw html can tell a hand-placed slot.
    out.manualUnits = (raw.match(/<ins\b[^>]*adsbygoogle|data-ad-slot=/g) || []).length;
  } catch (e) {
    out.rawMeta = `ERR ${String(e.message || e).split("\n")[0].slice(0, 80)}`;
  }
  for (const path of ["/ads.txt", "/robots.txt", "/sitemap.xml"]) {
    try {
      const r = await ctx.request.get(`https://${domain}${path}`, { timeout: 20000 });
      const body = await r.text();
      if (path === "/ads.txt") out.adsTxtLines = body.split("\n").map((l) => l.trim());
      if (path === "/sitemap.xml") out.sitemap = `${r.status()} · ${(body.match(/<loc>/g) || []).length} urls`;
      else out[path.slice(1)] = `${r.status()} · ${body.trim().split("\n").slice(0, 3).join(" | ").slice(0, 200)}`;
    } catch (e) {
      out[path.slice(1)] = `ERR ${String(e.message || e).split("\n")[0].slice(0, 120)}`;
    }
  }
  const pub = EXPECTED[domain];
  if (pub) {
    const wrong = [];
    if (out.adsenseMeta !== `ca-pub-${pub}`) wrong.push(`meta=${out.adsenseMeta}`);
    if (!(out.adsenseLoader || []).includes(`ca-pub-${pub}`)) wrong.push(`loader=${JSON.stringify(out.adsenseLoader)}`);
    if (!(out.adsTxtLines || []).includes(`google.com, pub-${pub}, DIRECT, f08c47fec0942fa0`)) wrong.push("ads.txt");
    if (!String(out.rawMeta || "").includes(`ca-pub-${pub}`)) wrong.push("meta missing from server HTML");
    if (!(out.rawLoader || []).includes(`ca-pub-${pub}`)) wrong.push("loader missing from server HTML");
    if ((out.adsterraRequests || []).length || out.htmlAdsterra) wrong.push("adsterra");
    if (out.manualUnits) wrong.push(`${out.manualUnits} manual ad unit(s) — Auto ads only`);
    out.verdict = out.error ? `UNREACHABLE (${out.error.slice(0, 60)})` : wrong.length ? `WRONG: ${wrong.join(" · ")}` : `OK ca-pub-${pub}`;
    verdicts.push(`${domain.padEnd(12)} ${out.verdict}`);
  }
  console.log(`\n===== ${domain}`);
  for (const [k, v] of Object.entries(out)) if (k !== "domain" && k !== "adsTxtLines") console.log(`${k.padEnd(16)} ${typeof v === "string" ? v : JSON.stringify(v)}`);
  await ctx.close();
}
await browser.close();
console.log("\n===== AdSense verdict (meta + loader in server HTML and in the browser + ads.txt + no manual unit + no Adsterra)");
for (const v of verdicts) console.log(v);
