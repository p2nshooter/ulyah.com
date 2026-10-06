#!/usr/bin/env node
// Builds one article site from its folder into static files.
//
//   node sites/_engine/build.mjs dawo.es            → sites/dawo.es/dist/
//
// The folder holds everything that makes the site itself:
//   site.json            identity, language, AdSense account, menus, categories
//   content/articles/    the articles (Markdown + frontmatter) — the database
//   content/pages/       about, contact, privacy, terms … (Markdown)
//   theme/templates.mjs  the HTML of every page type — unique to the site
//   theme/assets/        its CSS, JS and images — unique to the site
//
// The engine only does what must be identical and correct everywhere: the
// AdSense loader + meta tag + ads.txt from site.json, SEO tags, JSON-LD,
// sitemap, RSS, robots, 404 and caching headers. How a site LOOKS is entirely
// its theme's business.

import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { countWords, esc, parseFrontmatter, renderMarkdown, slugify } from "./lib/markdown.mjs";

const ENGINE = dirname(fileURLToPath(import.meta.url));
const SITES = resolve(ENGINE, "..");

export async function build(domain, { quiet = false } = {}) {
  const dir = join(SITES, domain);
  if (!existsSync(join(dir, "site.json"))) throw new Error(`No site.json in sites/${domain}`);
  const site = JSON.parse(readFileSync(join(dir, "site.json"), "utf8"));
  const out = join(dir, "dist");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const base = `https://${site.domain}`;
  const paths = { article: "/articles/", category: "/category/", ...(site.paths || {}) };
  const locale = site.locale || site.lang;
  const fmtDate = (iso) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

  // ── Content ───────────────────────────────────────────────────────────
  const categories = site.categories.map((c) => ({ ...c, url: `${paths.category}${c.slug}/`, articles: [] }));
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const articleDir = join(dir, "content", "articles");
  const articles = (existsSync(articleDir) ? readdirSync(articleDir) : [])
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, body } = parseFrontmatter(readFileSync(join(articleDir, file), "utf8"));
      const slug = data.slug || file.replace(/\.md$/, "");
      const cat = catBySlug.get(data.category);
      if (!cat) throw new Error(`${file}: unknown category "${data.category}"`);
      if (!data.title || !data.description || !data.date) throw new Error(`${file}: title, description and date are required`);
      const { html, headings } = renderMarkdown(body);
      const words = countWords(body);
      const a = {
        ...data,
        file,
        slug,
        url: `${paths.article}${slug}/`,
        cat,
        html,
        headings,
        words,
        minutes: Math.max(1, Math.round(words / 220)),
        dateLabel: fmtDate(data.date),
        updated: data.updated || data.date,
        updatedLabel: fmtDate(data.updated || data.date),
      };
      cat.articles.push(a);
      return a;
    })
    .sort((a, b) => (a.date === b.date ? (a.order ?? a.title).localeCompare(b.order ?? b.title) : a.date < b.date ? 1 : -1));
  for (const a of articles) {
    const same = a.cat.articles.filter((x) => x !== a);
    const others = articles.filter((x) => x.cat !== a.cat);
    a.related = [...same, ...others].slice(0, 3);
  }

  const pageDir = join(dir, "content", "pages");
  const pages = (existsSync(pageDir) ? readdirSync(pageDir) : [])
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, body } = parseFrontmatter(readFileSync(join(pageDir, file), "utf8"));
      const slug = data.slug || file.replace(/\.md$/, "");
      const { html, headings } = renderMarkdown(body);
      return { ...data, slug, url: `/${slug}/`, html, headings, words: countWords(body) };
    })
    .sort((a, b) => Number(a.order ?? 99) - Number(b.order ?? 99));

  // ── Assets (fingerprinted so a new deploy is never served stale CSS) ───
  const assetSrc = join(dir, "theme", "assets");
  const assetVersion = {};
  if (existsSync(assetSrc)) {
    cpSync(assetSrc, join(out, "assets"), { recursive: true });
    for (const f of readdirSync(assetSrc, { recursive: true })) {
      const p = join(assetSrc, String(f));
      try {
        assetVersion[String(f)] = createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 10);
      } catch {
        /* a directory */
      }
    }
  }
  const publicDir = join(dir, "public");
  if (existsSync(publicDir)) cpSync(publicDir, out, { recursive: true });

  // ── What every page's <head> and tail carry ────────────────────────────
  // A site may be built before its AdSense account exists ("persiapan"): then
  // it carries no AdSense tag and no ads.txt until site.json gets the id.
  const pub = site.adsense ? site.adsense.replace(/^ca-/, "") : "";
  // The favicon is cached hard by browsers; its content hash in the URL makes
  // a new icon show up on the next visit instead of weeks later.
  const favFile = join(publicDir, "favicon.svg");
  const favicon = `/favicon.svg${existsSync(favFile) ? `?v=${createHash("sha256").update(readFileSync(favFile)).digest("hex").slice(0, 8)}` : ""}`;
  const asset = (name) => `/assets/${name}${assetVersion[name] ? `?v=${assetVersion[name]}` : ""}`;
  const org = { "@type": "Organization", "@id": `${base}/#org`, name: site.name, url: `${base}/`, logo: `${base}/favicon.svg` };

  function head({ title, description, path, type = "website", jsonld = [], image, noindex = false }) {
    const url = `${base}${path}`;
    const fullTitle = path === "/" ? title : `${title} · ${site.name}`;
    const graph = [org, { "@type": "WebSite", "@id": `${base}/#site`, name: site.name, url: `${base}/`, inLanguage: site.lang, publisher: { "@id": `${base}/#org` } }, ...jsonld];
    return [
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
      `<title>${esc(fullTitle)}</title>`,
      `<meta name="description" content="${esc(description)}">`,
      `<link rel="canonical" href="${url}">`,
      // A site still being written ("draft": true) is already online so its
      // domain carries the AdSense meta tag, loader and ads.txt, but it stays
      // out of search results until its library is complete.
      noindex || site.draft ? `<meta name="robots" content="noindex, follow">` : `<meta name="robots" content="index, follow, max-image-preview:large">`,
      `<meta name="theme-color" content="${esc(site.themeColor || "#000000")}">`,
      `<link rel="icon" href="${favicon}" type="image/svg+xml">`,
      `<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${base}/feed.xml">`,
      `<meta property="og:type" content="${type}">`,
      `<meta property="og:site_name" content="${esc(site.name)}">`,
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(description)}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:locale" content="${esc(site.ogLocale || locale.replace("-", "_"))}">`,
      `<meta property="og:image" content="${image || `${base}/og.svg`}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      // Google AdSense — the account this site applies with (site.json). The
      // meta tag, the loader and /ads.txt are all built from that one value.
      site.adsense ? `<meta name="google-adsense-account" content="${esc(site.adsense)}">` : "",
      site.adsense ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(site.adsense)}" crossorigin="anonymous"></script>` : "",
      site.fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(site.fonts)}">` : "",
      `<link rel="stylesheet" href="${asset("palace.css")}">`,
      `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // One cookieless page view to the ulyah.com admin, where every site of the
  // owner is counted. No presence heartbeat: it is one write per page, never
  // a write every few seconds against the shared D1 quota.
  const tail = () =>
    `<script>try{var b=JSON.stringify({site:${JSON.stringify(site.trackId)},path:location.pathname});navigator.sendBeacon?navigator.sendBeacon("https://api.ulyah.com/track",new Blob([b],{type:"text/plain"})):fetch("https://api.ulyah.com/track",{method:"POST",body:b,keepalive:true})}catch(e){}</script>\n` +
    `<script src="${asset("palace.js")}" defer></script>`;

  const crumbs = (items) => ({
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, n) => ({ "@type": "ListItem", position: n + 1, name: it.name, item: `${base}${it.path}` })),
  });

  const ctx = { site, base, paths, articles, categories, pages, esc, asset, head, tail, fmtDate, crumbs, slugify };
  const theme = await import(pathToFileURL(join(dir, "theme", "templates.mjs")).href);

  const files = [];
  const emit = (path, html) => {
    const file = path.endsWith("/") ? join(out, path, "index.html") : join(out, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    files.push(path);
  };

  emit("/", theme.home(ctx));
  for (const c of categories) emit(c.url, theme.category(ctx, c));
  for (const a of articles) emit(a.url, theme.article(ctx, a));
  for (const p of pages) emit(p.url, theme.page(ctx, p));
  writeFileSync(join(out, "404.html"), theme.notFound(ctx));
  for (const extra of theme.extraFiles?.(ctx) ?? []) emit(extra.path, extra.content);

  // ── Machine files ─────────────────────────────────────────────────────
  if (pub) writeFileSync(join(out, "ads.txt"), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
  writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: "/", lastmod: articles[0]?.updated || today },
    ...categories.map((c) => ({ loc: c.url, lastmod: c.articles[0]?.updated || today })),
    ...articles.map((a) => ({ loc: a.url, lastmod: a.updated })),
    ...pages.map((p) => ({ loc: p.url, lastmod: p.updated || today })),
  ];
  writeFileSync(
    join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${base}${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n") +
      `\n</urlset>\n`
  );
  writeFileSync(
    join(out, "feed.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(site.name)}</title><link>${base}/</link>` +
      `<description>${esc(site.description)}</description><language>${esc(site.lang)}</language>\n` +
      articles
        .slice(0, 30)
        .map((a) => `<item><title>${esc(a.title)}</title><link>${base}${a.url}</link><guid>${base}${a.url}</guid><pubDate>${new Date(`${a.date}T08:00:00Z`).toUTCString()}</pubDate><description>${esc(a.description)}</description></item>`)
        .join("\n") +
      `\n</channel></rss>\n`
  );
  writeFileSync(
    join(out, "_headers"),
    [
      "/*",
      "  X-Content-Type-Options: nosniff",
      "  Referrer-Policy: strict-origin-when-cross-origin",
      "  Permissions-Policy: camera=(), microphone=(), geolocation=()",
      "/assets/*",
      "  Cache-Control: public, max-age=31536000, immutable",
      "/ads.txt",
      "  Cache-Control: public, max-age=3600",
      "",
    ].join("\n")
  );

  const total = articles.reduce((n, a) => n + a.words, 0);
  if (!quiet)
    console.log(
      `${domain}: ${articles.length} articles (${total.toLocaleString("en")} words, shortest ${Math.min(...articles.map((a) => a.words))}), ` +
        `${categories.length} categories, ${pages.length} pages → ${files.length + 1} HTML files in sites/${domain}/dist`
    );
  return { site, articles, categories, pages, out };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const domains = process.argv.slice(2);
  if (!domains.length) {
    console.error("usage: node sites/_engine/build.mjs <domain> [<domain> …]");
    process.exit(2);
  }
  for (const d of domains) await build(d);
}
