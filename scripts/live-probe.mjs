/**
 * Open the live sites in a real browser and report what a visitor (or an
 * AdSense reviewer) actually gets: HTTP status, JavaScript errors, failed
 * requests (with their status), and whether anything in the header sits on
 * top of anything else.
 *
 * Read-only. Runs on a GitHub runner (live-probe.yml) because the development
 * sandbox cannot reach the production domains.
 *
 * Usage: node scripts/live-probe.mjs dawa.es ulyah.com 1fr.fr …
 *   PROBE_LINKS=15   internal links followed per site (from its home page)
 */
import { chromium } from "playwright";

const domains = process.argv.slice(2);
const MAX_LINKS = Number(process.env.PROBE_LINKS ?? 15);

const NOISE = /googlesyndication|doubleclick|google-analytics|googletagmanager|adtrafficquality|fundingchoices|gstatic\.com\/recaptcha/;

async function headerOverlaps(page) {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return ["no <header>"];
    const items = [...header.querySelectorAll("img, a, button, span, nav")]
      .filter((el) => {
        const s = getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        // Leaf-ish boxes only: an element that contains another is not "on top" of it.
        return r.width > 4 && r.height > 4 && r.bottom > 0 && el.children.length === 0;
      })
      .map((el) => ({ el, r: el.getBoundingClientRect() }));
    const out = [];
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i].r, b = items[j].r;
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > 3 && h > 3 && !items[i].el.contains(items[j].el) && !items[j].el.contains(items[i].el)) {
          const name = (el) => (el.getAttribute("aria-label") || el.getAttribute("alt") || el.textContent || el.className || el.tagName).toString().trim().slice(0, 24);
          out.push(`${name(items[i].el)} × ${name(items[j].el)}`);
        }
      }
    return out.slice(0, 12);
  });
}

async function visit(ctx, url) {
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on("console", (m) => m.type() === "error" && !NOISE.test(m.text()) && errors.push(m.text().slice(0, 200)));
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && !NOISE.test(r.url())) failed.push(`${r.status()} ${r.url().slice(0, 140)}`);
  });
  page.on("requestfailed", (r) => !NOISE.test(r.url()) && failed.push(`FAILED ${r.failure()?.errorText ?? ""} ${r.url().slice(0, 140)}`));
  let status;
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    status = res ? res.status() : "no-response";
  } catch (e) {
    status = `ERR ${String(e.message).slice(0, 80)}`;
  }
  const title = await page.title().catch(() => "");
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 4000) ?? "").catch(() => "");
  const visibleError = /Error 1\d{3}|Internal server error|Application error|Tidak ada hasil|No results|Aucun résultat|Keine Ergebnisse|Sin resultados|exceeded/i.exec(bodyText)?.[0] ?? null;
  return { page, status, title, errors, failed, visibleError };
}

const browser = await chromium.launch();
let problems = 0;
for (const domain of domains) {
  console.log(`\n================ ${domain}`);
  for (const vp of [
    { name: "desktop", width: 1366, height: 900 },
    { name: "mobile", width: 390, height: 844, isMobile: true },
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile });
    const home = await visit(ctx, `https://${domain}/`);
    const overlaps = await headerOverlaps(home.page).catch(() => ["(could not measure)"]);
    console.log(`[${vp.name}] home ${home.status} "${home.title.slice(0, 70)}"`);
    if (home.visibleError) console.log(`   ! visible on page: ${home.visibleError}`);
    console.log(`   header overlaps: ${overlaps.length ? overlaps.join(" | ") : "none"}`);
    for (const e of home.errors.slice(0, 8)) console.log(`   js: ${e}`);
    for (const f of [...new Set(home.failed)].slice(0, 10)) console.log(`   req: ${f}`);
    problems += home.errors.length + home.failed.length + (home.visibleError ? 1 : 0);

    if (vp.name === "desktop") {
      const links = await home.page
        .evaluate((host) => [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => new URL(h).host.replace(/^www\./, "") === host && !h.includes("#")))], domain)
        .catch(() => []);
      for (const link of links.slice(0, MAX_LINKS)) {
        const v = await visit(ctx, link);
        const bad = v.errors.length || v.failed.length || v.visibleError || String(v.status) !== "200";
        if (bad) problems++;
        console.log(`   ${bad ? "✗" : "✓"} ${v.status} ${new URL(link).pathname.slice(0, 60)}${v.visibleError ? `  ! ${v.visibleError}` : ""}`);
        if (bad) {
          for (const e of v.errors.slice(0, 3)) console.log(`       js: ${e}`);
          for (const f of [...new Set(v.failed)].slice(0, 4)) console.log(`       req: ${f}`);
        }
        await v.page.close();
      }
    }
    await home.page.close();
    await ctx.close();
  }
}
await browser.close();
console.log(`\n${problems} problem(s) seen.`);
