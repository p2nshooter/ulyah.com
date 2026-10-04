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
const EXPECTED = {
  "ulyah.com": "8991272269211824", "axto.io": "8991272269211824", "xaa.es": "8991272269211824",
  "1fr.fr": "5944786950535069", "axto.us": "6908951782430508", "axto.dev": "8469557036744946",
  "jai.lat": "4548005919629272", "lie.skin": "9666205248809954", "oldco.in": "6293576511807510",
  "profity.in": "6146217038829045", "dawo.es": "6019445914743449", "qkb.es": "7516944260248026",
  "byodd.de": "2228462932360966", "xko.es": "6560360898389273", "byoxy.de": "6701063918838796",
  "dawa.es": "6371903555702163", "tilawa.de": "6371903555702163", "xad.es": "2493615451319531",
};
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
    if ((out.adsterraRequests || []).length || out.htmlAdsterra) wrong.push("adsterra");
    out.verdict = out.error ? `UNREACHABLE (${out.error.slice(0, 60)})` : wrong.length ? `WRONG: ${wrong.join(" · ")}` : `OK ca-pub-${pub}`;
    verdicts.push(`${domain.padEnd(12)} ${out.verdict}`);
  }
  console.log(`\n===== ${domain}`);
  for (const [k, v] of Object.entries(out)) if (k !== "domain" && k !== "adsTxtLines") console.log(`${k.padEnd(16)} ${typeof v === "string" ? v : JSON.stringify(v)}`);
  await ctx.close();
}
await browser.close();
console.log("\n===== AdSense verdict (meta + loader + ads.txt + no Adsterra)");
for (const v of verdicts) console.log(v);
