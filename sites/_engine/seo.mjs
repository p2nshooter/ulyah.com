// SEO audit of a built site (owner, 27 Oct 2026: "perbaiki dulu seluruh SEO websitenya, perkata, link xml
// sitemap dan file2 lain yg dibutuhkan … backlink yg tidak melanggar adsense"). Reads sites/<domain>/dist and
// reports, per page and for the site, what a search engine (and an AdSense reviewer) gets:
//
//   pages     title 10–60, meta description 70–160, both unique; one H1; canonical = the page's own absolute
//             URL; Open Graph + Twitter card; valid JSON-LD; no accidental noindex; every <img> with alt,
//             width and height; the page's keyword (from its URL) in the title, H1 and description
//   sitemap   every page listed once, nothing listed that does not exist, valid lastmod, same host
//   files     robots.txt (Sitemap line), sitemap.xml, ads.txt, feed.xml (+ <link rel=alternate>),
//             404.html, favicon, site.webmanifest, llms.txt, /.well-known/security.txt
//   links     links to the owner's other sites: plain, clearly labelled, not hidden, not nofollow, never
//             inside an article body, a handful per page (AdSense / Google link-scheme rules)
//
//   node sites/_engine/seo.mjs <domain> [--json]      exit 1 when a gate fails
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OWN = /(^|\.)(axto\.io|xaa\.es|ulyah\.com|1fr\.fr|tilawa\.de|xad\.es|axto\.us|axto\.dev|jai\.lat|lie\.skin|oldco\.in|profity\.in)$/;
const STOP = new Set("the and for with from your that this what how why who are was were into onto over under about your our you der die das und mit von für den dem des ein eine einer zur zum wie was warum les des une pour avec dans sur que qui los las del una para con por como que qué cómo dan yang untuk dengan dari pada ini itu cara".split(" "));

export function auditSite(domain) {
  const dir = join(root, domain);
  const out = join(dir, "dist");
  const site = JSON.parse(readFileSync(join(dir, "site.json"), "utf8"));
  const base = `https://${site.domain}`;
  const issues = [];                // { level: "fail"|"warn", where, what }
  const add = (level, where, what) => issues.push({ level, where, what });

  const files = [];
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else files.push(p); } };
  walk(out);
  const html = files.filter((f) => f.endsWith(".html") && !f.endsWith("/404.html"));
  const urlOf = (f) => { const rel = f.slice(out.length).replace(/index\.html$/, ""); return rel || "/"; };

  const titles = new Map(), descs = new Map();
  const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i")) || [])[1];
  const metaContent = (s, key, by = "name") => { const m = s.match(new RegExp(`<meta[^>]*\\b${by}="${key}"[^>]*>`, "i")); return m ? attr(m[0], "content") : undefined; };
  // &amp; last, so "&amp;lt;" stays the text "&lt;" instead of turning into "<".
  const decode = (t) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  // The visible text of an HTML fragment: tags removed until none are left (one pass would turn
  // "<<b>b>" into "<b>"), then any stray "<" dropped.
  const textOf = (fragment) => {
    let t = String(fragment);
    for (let prev = ""; prev !== t; ) {
      prev = t;
      t = t.replace(/<[^<>]*>/g, "");
    }
    return t.replace(/</g, "");
  };
  // URLs spell German umlauts out (ä → ae, ß → ss), so the text is folded the same way first.
  const fold = (t) => decode(t).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  let ownLinkPages = 0, articleBodyOwnLinks = 0;

  for (const f of html) {
    const s = readFileSync(f, "utf8");
    const url = urlOf(f);
    const title = decode((s.match(/<title>([^<]*)<\/title>/i) || [])[1] || "").trim();
    const desc = decode(metaContent(s, "description") || "").trim();
    if (!title) add("fail", url, "no <title>");
    else {
      if (title.length < 10 || title.length > 60) add("fail", url, `title ${title.length} chars (10–60): ${title.slice(0, 80)}`);
      titles.set(title, [...(titles.get(title) || []), url]);
    }
    if (!desc) add("fail", url, "no meta description");
    else {
      if (desc.length < 70 || desc.length > 160) add(desc.length > 160 || desc.length < 50 ? "fail" : "warn", url, `meta description ${desc.length} chars (70–160)`);
      descs.set(desc, [...(descs.get(desc) || []), url]);
    }
    const h1 = (s.match(/<h1\b/gi) || []).length;
    if (h1 !== 1) add("fail", url, `${h1} <h1> (exactly one)`);
    const canon = (s.match(/<link[^>]*rel="canonical"[^>]*>/i) || [])[0];
    const href = canon ? attr(canon, "href") : "";
    if (!href) add("fail", url, "no canonical");
    else if (href !== base + url) add("fail", url, `canonical ${href} ≠ ${base + url}`);
    for (const [k, by] of [["og:title", "property"], ["og:description", "property"], ["og:url", "property"], ["og:image", "property"], ["og:type", "property"], ["twitter:card", "name"]]) {
      if (!metaContent(s, k, by)) add("warn", url, `no ${k}`);
    }
    const ogImg = metaContent(s, "og:image", "property");
    if (ogImg && !/^https:\/\//.test(ogImg)) add("warn", url, `og:image not absolute: ${ogImg}`);
    if (/<meta[^>]*name="robots"[^>]*noindex/i.test(s) && !site.draft) add("fail", url, "noindex on a live page");
    for (const m of s.matchAll(/<script\b[^>]*\btype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script[^>]*>/gi)) {
      try { JSON.parse(m[1]); } catch { add("fail", url, "invalid JSON-LD"); }
    }
    if (!/application\/ld\+json/.test(s)) add("warn", url, "no JSON-LD");
    for (const m of s.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      if (attr(tag, "alt") === undefined) add("fail", url, `<img> without alt: ${(attr(tag, "src") || "").slice(0, 60)}`);
      if (!attr(tag, "width") || !attr(tag, "height")) add("warn", url, `<img> without width/height (CLS): ${(attr(tag, "src") || "").slice(0, 60)}`);
    }
    // Keyword of the page: the meaningful words of its last URL segment, in title + H1 + description.
    const seg = url.split("/").filter(Boolean).pop() || "";
    const words = seg.split("-").filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w));
    if (words.length >= 2 && url.split("/").filter(Boolean).length >= 2) {
      const h1Text = fold(textOf((s.match(/<h1\b[^>]*>([\s\S]*?)<\/h1[^>]*>/i) || [])[1] || ""));
      const hay = fold(title) + " " + h1Text;
      const hit = words.filter((w) => hay.includes(w.slice(0, Math.max(4, w.length - 2)))).length;
      if (hit / words.length < 0.5) add("warn", url, `keyword of the URL (${words.join(" ")}) mostly missing from title/H1`);
    }
    // Links to the owner's other sites: AdSense / link-scheme hygiene.
    const own = [...s.matchAll(/<a\b[^>]*href="https?:\/\/([^/"]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi)].filter((m) => OWN.test(m[1].replace(/^www\./, "")) && m[1].replace(/^www\./, "") !== site.domain);
    if (own.length) ownLinkPages += 1;
    if (own.length > 12) add("warn", url, `${own.length} links to the owner's other sites (keep it to a handful)`);
    for (const m of own) {
      const tag = m[0].slice(0, m[0].indexOf(">") + 1);
      const text = textOf(m[2]).trim();
      if (!text && !/aria-label=|<img[^>]*alt="[^"]+"/.test(m[0])) add("fail", url, `empty link to ${m[1]} (hidden link)`);
      if (/display:\s*none|visibility:\s*hidden|font-size:\s*0/.test(tag)) add("fail", url, `hidden link to ${m[1]}`);
      if (/rel="[^"]*\b(sponsored)\b/.test(tag)) add("warn", url, `link to ${m[1]} marked sponsored`);
    }
    const body = (s.match(/<article\b[\s\S]*?<\/article>/i) || [])[0] || "";
    const inBody = [...body.matchAll(/href="https?:\/\/([^/"]+)/gi)].filter((m) => OWN.test(m[1].replace(/^www\./, "")) && m[1].replace(/^www\./, "") !== site.domain).length;
    // The one ecosystem page (site.json "promo") is about the owner's projects, so its links belong
    // in its text; anywhere else a link to another own site inside an article is a link scheme risk.
    const isPromo = site.promo && url === `/${site.promo.slug}/`;
    if (inBody && !isPromo) { articleBodyOwnLinks += inBody; add("warn", url, `${inBody} link(s) to the owner's sites inside the article body`); }
    if (isPromo && own.length > 8) add("warn", url, `${own.length} links on the ecosystem page (keep it to a handful)`);
  }
  for (const [t, us] of titles) if (us.length > 1) add("fail", us.join(", "), `duplicate title: ${t.slice(0, 60)}`);
  for (const [d, us] of descs) if (us.length > 1) add("fail", us.join(", "), `duplicate meta description: ${d.slice(0, 60)}`);

  // Sitemap ↔ pages
  const sm = existsSync(join(out, "sitemap.xml")) ? readFileSync(join(out, "sitemap.xml"), "utf8") : "";
  if (!sm) add("fail", "/sitemap.xml", "missing");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const lastmods = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  const seen = new Set();
  for (const loc of locs) {
    if (seen.has(loc)) add("fail", "/sitemap.xml", `listed twice: ${loc}`);
    seen.add(loc);
    if (!loc.startsWith(base + "/")) { add("fail", "/sitemap.xml", `other host: ${loc}`); continue; }
    const p = loc.slice(base.length);
    const exists = p.endsWith("/") ? existsSync(join(out, p, "index.html")) : existsSync(join(out, p));
    if (!exists) add("fail", "/sitemap.xml", `lists a missing page: ${p}`);
  }
  for (const lm of lastmods) if (!/^\d{4}-\d{2}-\d{2}/.test(lm) || Date.parse(lm) > Date.now() + 86_400_000) add("fail", "/sitemap.xml", `bad lastmod ${lm}`);
  for (const f of html) { const u = base + urlOf(f); if (!seen.has(u)) add("warn", "/sitemap.xml", `page not listed: ${urlOf(f)}`); }

  // Machine files
  const robots = existsSync(join(out, "robots.txt")) ? readFileSync(join(out, "robots.txt"), "utf8") : "";
  if (!robots) add("fail", "/robots.txt", "missing");
  else if (!robots.includes(`Sitemap: ${base}/sitemap.xml`)) add("fail", "/robots.txt", "no Sitemap line");
  if (site.adsense && !existsSync(join(out, "ads.txt"))) add("fail", "/ads.txt", "missing");
  if (!existsSync(join(out, "404.html"))) add("fail", "/404.html", "missing");
  if (!existsSync(join(out, "feed.xml"))) add("warn", "/feed.xml", "missing");
  const home = existsSync(join(out, "index.html")) ? readFileSync(join(out, "index.html"), "utf8") : "";
  if (!/rel="alternate"[^>]*application\/rss\+xml/.test(home)) add("warn", "/", "feed.xml not linked (<link rel=alternate type=application/rss+xml>)");
  if (!/rel="icon"/.test(home)) add("warn", "/", "no favicon link");
  if (!/rel="manifest"/.test(home) || !files.some((f) => /site\.webmanifest$|manifest\.webmanifest$|manifest\.json$/.test(f))) add("warn", "/", "no web app manifest");
  if (!/rel="apple-touch-icon"/.test(home)) add("warn", "/", "no apple-touch-icon");
  if (!existsSync(join(out, "llms.txt"))) add("warn", "/llms.txt", "missing (summary for AI search engines)");
  if (!existsSync(join(out, ".well-known", "security.txt"))) add("warn", "/.well-known/security.txt", "missing");
  return { domain, pages: html.length, ownLinkPages, articleBodyOwnLinks, issues };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const domains = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  let failed = 0;
  const all = domains.map(auditSite);
  if (process.argv.includes("--json")) { console.log(JSON.stringify(all, null, 1)); process.exit(0); }
  for (const r of all) {
    const fails = r.issues.filter((i) => i.level === "fail"), warns = r.issues.filter((i) => i.level === "warn");
    failed += fails.length;
    console.log(`\n${r.domain}: ${r.pages} pages · ${fails.length} fail · ${warns.length} warn · own-site links on ${r.ownLinkPages} pages`);
    for (const i of [...fails, ...warns].slice(0, 40)) console.log(`  ${i.level === "fail" ? "✗" : "!"} ${i.where} — ${i.what}`);
  }
  process.exit(failed ? 1 : 0);
}
