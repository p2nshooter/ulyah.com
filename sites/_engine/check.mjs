#!/usr/bin/env node
// The gate every site passes before it is deployed: what an AdSense reviewer
// looks for, checked on the built files rather than promised in a README.
//
//   node sites/_engine/check.mjs dawo.es
//
// Fails (exit 1) when anything below is not true.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const SITES = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIN_ARTICLES = 40;
const MIN_WORDS = 1200; // every article
const MIN_AVG_WORDS = 1400; // the library as a whole
const BANNED = /adsterra|highperformanceformat|effectivecpmnetwork|effectivegatecpm|profitableratecpm|popads|propellerads|lorem ipsum/i;

/** Pages every site must have, by language. Each entry: any one of these slugs. */
const REQUIRED_PAGES = {
  es: [["sobre-nosotros"], ["contacto"], ["politica-de-privacidad"], ["politica-de-cookies"], ["aviso-legal"], ["terminos-y-condiciones"], ["descargo-de-responsabilidad"]],
  en: [["about"], ["contact"], ["privacy-policy", "privacy"], ["terms", "terms-of-use"], ["disclaimer"]],
  // Germany: Impressum (§ 5 DDG) and Datenschutzerklärung are mandatory.
  de: [["ueber-uns"], ["kontakt"], ["impressum"], ["datenschutz"], ["cookie-richtlinie"], ["nutzungsbedingungen"], ["haftungsausschluss"]],
};

export async function check(domain) {
  let failed = 0;
  const ok = (cond, what, detail = "") => {
    if (!cond) failed++;
    console.log(`  ${cond ? "ok  " : "FAIL"}  ${what}${!cond && detail ? `\n        ${detail}` : ""}`);
    return cond;
  };
  let manualSnippets = null;
  console.log(`\n=== ${domain} ===`);
  const { site, articles, categories, pages, out } = await build(domain, { quiet: true });

  // Content
  ok(articles.length >= MIN_ARTICLES, `at least ${MIN_ARTICLES} articles (${articles.length})`);
  const short = articles.filter((a) => a.words < MIN_WORDS);
  ok(short.length === 0, `every article has ${MIN_WORDS}+ words`, short.map((a) => `${a.file}: ${a.words}`).join(", "));
  const avg = Math.round(articles.reduce((n, a) => n + a.words, 0) / Math.max(1, articles.length));
  ok(avg >= MIN_AVG_WORDS, `average length ${MIN_AVG_WORDS}+ words (${avg})`);
  const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const titles = new Map();
  for (const a of articles) {
    const k = norm(a.title);
    titles.set(k, [...(titles.get(k) || []), a.file]);
  }
  const dup = [...titles.values()].filter((v) => v.length > 1);
  ok(dup.length === 0, "no two articles share a title", dup.map((d) => d.join(" = ")).join("; "));
  const badDesc = articles.filter((a) => a.description.length < 70 || a.description.length > 200);
  ok(badDesc.length === 0, "every description is 70–200 characters", badDesc.map((a) => `${a.file}: ${a.description.length}`).join(", "));
  const thinCats = categories.filter((c) => c.articles.length < 3);
  ok(thinCats.length === 0, "every category has 3+ articles", thinCats.map((c) => `${c.slug}: ${c.articles.length}`).join(", "));

  // Required pages
  const have = new Set(pages.map((p) => p.slug));
  for (const alts of REQUIRED_PAGES[site.lang] || REQUIRED_PAGES.en) {
    ok(alts.some((s) => have.has(s)), `page /${alts[0]}/ exists`);
  }
  const thinPages = pages.filter((p) => p.words < 150);
  ok(thinPages.length === 0, "no thin legal/about page (150+ words each)", thinPages.map((p) => `${p.slug}: ${p.words}`).join(", "));

  // AdSense — a site prepared before its account exists has none yet.
  if (site.adsense) {
    const pub = site.adsense.replace(/^ca-/, "");
    ok(/^ca-pub-\d{16}$/.test(site.adsense), `AdSense account looks real (${site.adsense})`);
    ok(readFileSync(join(out, "ads.txt"), "utf8").trim() === `google.com, ${pub}, DIRECT, f08c47fec0942fa0`, "ads.txt authorises exactly that account");
    // The three snippets as Google hands them over, kept by hand in
    // sites/<domain>/ADSENSE.txt. The build must match them word for word.
    const manualFile = join(SITES, domain, "ADSENSE.txt");
    if (ok(existsSync(manualFile), "ADSENSE.txt holds the three snippets from Google")) {
      const manual = readFileSync(manualFile, "utf8");
      manualSnippets = {
        meta: (manual.match(/<meta name="google-adsense-account" content="[^"]+">/) || [""])[0],
        loader: (manual.match(/<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]+"\s+crossorigin="anonymous"><\/script>/) || [""])[0].replace(/\s+/g, " "),
        adsTxt: (manual.match(/^google\.com, pub-\d{16}, DIRECT, f08c47fec0942fa0$/m) || [""])[0],
      };
      ok(
        manualSnippets.meta === `<meta name="google-adsense-account" content="${site.adsense}">` &&
          manualSnippets.loader.includes(`client=${site.adsense}"`) &&
          manualSnippets.adsTxt === `google.com, ${pub}, DIRECT, f08c47fec0942fa0`,
        "ADSENSE.txt (meta tag, loader, ads.txt line) matches site.json",
        JSON.stringify(manualSnippets),
      );
      ok(readFileSync(join(out, "ads.txt"), "utf8").trim() === manualSnippets.adsTxt, "built ads.txt is the line from ADSENSE.txt");
    }
  } else {
    console.log("  note  no AdSense account yet — add \"adsense\" to site.json when it exists");
  }

  // Every built HTML file
  const html = [];
  const walk = (d) => {
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith(".html")) html.push(p);
    }
  };
  walk(out);
  const missingTag = [];
  const banned = [];
  const brokenLinks = new Set();
  const langWrong = [];
  for (const file of html) {
    const s = readFileSync(file, "utf8");
    const rel = file.slice(out.length);
    if (site.adsense && (!s.includes(`<meta name="google-adsense-account" content="${site.adsense}">`) || !s.includes(`adsbygoogle.js?client=${site.adsense}`))) missingTag.push(rel);
    else if (manualSnippets && (!s.includes(manualSnippets.meta) || !s.includes(manualSnippets.loader))) missingTag.push(rel);
    if (BANNED.test(s)) banned.push(rel);
    if (!new RegExp(`<html[^>]*lang="${site.lang}`).test(s)) langWrong.push(rel);
    for (const m of s.matchAll(/href="(\/[^"#?]*)/g)) {
      const target = m[1];
      if (target.startsWith("/assets/")) continue;
      const exists = target.endsWith("/")
        ? existsSync(join(out, target, "index.html"))
        : existsSync(join(out, target));
      if (!exists) brokenLinks.add(`${target} (in ${rel})`);
    }
  }
  if (site.adsense) ok(missingTag.length === 0, `all ${html.length} pages carry the AdSense meta tag and loader`, missingTag.slice(0, 5).join(", "));
  ok(banned.length === 0, "no other ad network and no placeholder text anywhere", banned.slice(0, 5).join(", "));
  ok(langWrong.length === 0, `every page declares lang="${site.lang}"`, langWrong.slice(0, 5).join(", "));
  ok(brokenLinks.size === 0, "no internal link points at a missing page", [...brokenLinks].slice(0, 8).join(", "));

  return failed;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const domains = process.argv.slice(2);
  let failed = 0;
  for (const d of domains) failed += await check(d);
  console.log(failed ? `\n${failed} check(s) failed` : "\nALL OK");
  process.exit(failed ? 1 : 0);
}
