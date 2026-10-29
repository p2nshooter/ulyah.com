/**
 * Translation, error and layout audit of the five sites (owner, 29 Oct 2026: "Cek jg translate
 * dan seluruh isi nya, apakah masih ada yg tidak konsisten, error, bug dll atau masih ada yg
 * tidak d terjemahkan … jgn ada css yg error, dari A-Z wajib zero bug error dan miss";
 * docs/ADSENSE-BLUEPRINT.md §19). Read-only, in a real browser, on a GitHub runner
 * (site-quality-audit.yml) — the development sandbox cannot reach the production domains.
 *
 * For each site it reads /sitemap.txt, keeps every top-level page and a sample of the deeper
 * ones, and on each page records:
 *   - the HTTP status, page errors and console errors (ads and analytics noise left out);
 *   - failed requests to the site itself or its API, including Next.js prefetches (?_rsc=);
 *   - sideways scrolling at phone width (390 px) and elements wider than the screen;
 *   - text in the wrong language: Indonesian words on the French, German, Spanish and English
 *     sites, and English interface words on every site but xad.es — counted with the sentence
 *     they sit in, for review (a name or a quotation can be legitimate).
 *
 * Output: a summary per site in the job log and the step summary, and audit-report.json with
 * every finding.
 *
 *   node site-quality-audit.mjs [domain …]      SAMPLE=12 (deep pages per section)
 */
import { chromium } from "playwright";
import { writeFileSync, appendFileSync } from "node:fs";

const SITES = {
  "ulyah.com": { lang: "id" },
  "1fr.fr": { lang: "fr" },
  "tilawa.de": { lang: "de" },
  "dawa.im": { lang: "es" },
  "xad.es": { lang: "en" },
};
const domains = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SITES);
const SAMPLE = Number(process.env.SAMPLE ?? 12);

const NOISE = /googlesyndication|doubleclick|google-analytics|googletagmanager|adtrafficquality|fundingchoices|gstatic|youtube|ytimg|cdn\.islamic\.network|everyayah|analytics\/ping|compute-pressure|Permissions policy/i;

// Words that only Indonesian uses (none of them is also a common French, German, Spanish or English word).
const INDONESIAN = /\b(yang|dengan|untuk|tidak|adalah|halaman|selengkapnya|lihat|memuat|sedang|tentang|kembali|bacaan|kisah|doa harian|sholat|dijual|penawaran|bisa)\b/gi;
// English interface words that should not be left on a French, German, Spanish or Indonesian page.
const ENGLISH_UI = /\b(read more|loading|see all|show more|back to|search results|no results|click here|learn more|sign in|log in|download|listen now)\b/gi;

function sampleUrls(urls, domain) {
  const own = urls.filter((u) => {
    try {
      return new URL(u).host.replace(/^www\./, "") === domain;
    } catch {
      return false;
    }
  });
  const top = own.filter((u) => new URL(u).pathname.split("/").filter(Boolean).length <= 1);
  const bySection = new Map();
  for (const u of own) {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    if (parts.length <= 1) continue;
    const key = parts[0];
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(u);
  }
  const deep = [];
  for (const list of bySection.values()) {
    // Spread the sample over the section instead of taking its first pages.
    const step = Math.max(1, Math.floor(list.length / SAMPLE));
    for (let i = 0; i < SAMPLE && i * step < list.length; i++) deep.push(list[i * step]);
  }
  return { top: [...new Set(top)], deep };
}

function wrongLanguage(text, lang) {
  const out = [];
  const add = (re, kind) => {
    for (const m of text.matchAll(re)) {
      const at = m.index ?? 0;
      const sentence = text.slice(Math.max(0, text.lastIndexOf("\n", at) + 1), Math.min(text.length, (text.indexOf("\n", at) + 1 || text.length + 1) - 1)).trim().slice(0, 160);
      out.push({ kind, word: m[0], sentence });
    }
  };
  if (lang !== "id") add(INDONESIAN, "indonesian");
  if (lang !== "en") add(ENGLISH_UI, "english");
  return out;
}

async function audit(ctx, url, lang, phone) {
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e.message).slice(0, 200)}`));
  page.on("console", (m) => m.type() === "error" && !NOISE.test(m.text()) && errors.push(m.text().slice(0, 200)));
  page.on("response", (r) => {
    const u = r.url();
    if (r.status() >= 400 && !NOISE.test(u) && /ulyah\.com|1fr\.fr|tilawa\.de|dawa\.im|xad\.es/.test(u)) failed.push(`${r.status()} ${u.slice(0, 160)}`);
  });
  let status = "ERR";
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    status = res ? res.status() : "no-response";
    await page.waitForTimeout(3500);
  } catch (e) {
    status = `ERR ${String(e.message).slice(0, 80)}`;
  }
  const measures = await page
    .evaluate(() => {
      const vw = window.innerWidth;
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return r.width > 0 && r.right > vw + 2 && s.position !== "fixed" && !el.closest("[aria-hidden=true]") && !el.closest(".overflow-x-auto, .overflow-auto, [data-scroll-x]");
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0, 2).join(".") : ""}`);
      const main = document.querySelector("main") ?? document.body;
      return { overflow: document.documentElement.scrollWidth - vw, wide, text: main?.innerText?.slice(0, 20000) ?? "" };
    })
    .catch(() => ({ overflow: 0, wide: [], text: "" }));
  await page.close();
  return {
    url,
    phone,
    status,
    errors: [...new Set(errors)],
    failed: [...new Set(failed)],
    overflow: measures.overflow > 1 ? measures.overflow : 0,
    wide: measures.wide,
    language: phone ? [] : wrongLanguage(measures.text, lang),
  };
}

const browser = await chromium.launch();
const report = {};
let summary = "## Site quality audit\n\n| Site | Pages | Bad status | JS errors | Failed requests | Sideways scroll (phone) | Wrong-language words |\n|---|---|---|---|---|---|---|\n";
for (const domain of domains) {
  const { lang } = SITES[domain] ?? { lang: "en" };
  const list = await fetch(`https://${domain}/sitemap.txt`).then((r) => r.text()).catch(() => "");
  const urls = list.split("\n").map((s) => s.trim()).filter(Boolean);
  const { top, deep } = sampleUrls(urls.length ? urls : [`https://${domain}/`], domain);
  if (!top.some((u) => new URL(u).pathname === "/")) top.unshift(`https://${domain}/`);
  console.log(`\n================ ${domain} (${lang}) — ${urls.length} urls in the sitemap, auditing ${top.length} top + ${deep.length} deep`);
  const desktop = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const results = [];
  for (const url of [...top, ...deep]) {
    results.push(await audit(desktop, url, lang, false));
    if (top.includes(url)) results.push(await audit(phone, url, lang, true));
    const r = results.at(-1);
    const bad = String(r.status) !== "200" || r.errors.length || r.failed.length || r.overflow;
    if (bad) console.log(`✗ ${r.status} ${r.phone ? "[phone] " : ""}${new URL(url).pathname}${r.overflow ? `  overflow ${r.overflow}px ${r.wide.join(" ")}` : ""}`);
  }
  await desktop.close();
  await phone.close();
  report[domain] = results;

  const bad = results.filter((r) => String(r.status) !== "200");
  const errs = results.filter((r) => r.errors.length);
  const fails = results.filter((r) => r.failed.length);
  const over = results.filter((r) => r.overflow);
  const words = results.flatMap((r) => r.language.map((l) => ({ ...l, url: r.url })));
  summary += `| ${domain} | ${new Set(results.map((r) => r.url)).size} | ${bad.length} | ${errs.length} | ${fails.length} | ${over.length} | ${words.length} |\n`;

  for (const r of bad.slice(0, 20)) console.log(`   status ${r.status} ${r.url}`);
  for (const r of errs.slice(0, 20)) console.log(`   js ${new URL(r.url).pathname}: ${r.errors.slice(0, 2).join(" | ")}`);
  for (const r of fails.slice(0, 20)) console.log(`   req ${new URL(r.url).pathname}: ${r.failed.slice(0, 3).join(" | ")}`);
  for (const r of over.slice(0, 20)) console.log(`   overflow ${r.overflow}px ${new URL(r.url).pathname}: ${r.wide.join(", ")}`);
  const byWord = new Map();
  for (const w of words) byWord.set(`${w.kind}:${w.word.toLowerCase()}`, [...(byWord.get(`${w.kind}:${w.word.toLowerCase()}`) ?? []), w]);
  for (const [k, list] of [...byWord.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 25)) {
    console.log(`   lang ${k} ×${list.length} — e.g. ${new URL(list[0].url).pathname}: "${list[0].sentence}"`);
  }
}
await browser.close();
writeFileSync("audit-report.json", JSON.stringify(report, null, 1));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
console.log(`\n${summary}`);
