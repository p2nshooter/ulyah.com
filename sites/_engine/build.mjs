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

  // ── Ecosystem menu (owner, 18 Oct 2026) ──────────────────────────────
  // "Promosikan website axto.io dan xaa.es dengan bahasa masing2 situs dengan
  // menu husus yg premium … kalimat yang berbeda di setiap situs". A site that
  // sets `promo: { slug, label }` gets one extra menu item, rendered by its own
  // theme in the header and footer like any other, pointing at its own page
  // content/pages/<slug>.md — written for that site, in its language, so no
  // two sites carry the same text. The head adds a quiet golden glow to that
  // one item (off under prefers-reduced-motion). No ad markup is involved.
  if (site.promo) {
    if (!/^[a-z0-9-]+$/.test(site.promo.slug || "") || !site.promo.label) throw new Error(`site.json promo needs a slug and a label`);
    if (!existsSync(join(dir, "content", "pages", `${site.promo.slug}.md`))) throw new Error(`promo page content/pages/${site.promo.slug}.md is missing`);
    site.menu = [{ label: site.promo.label, href: `/${site.promo.slug}/`, promo: true }, ...(site.menu || []).filter((m) => m.href !== `/${site.promo.slug}/`)];
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
  const has = (f) => existsSync(join(publicDir, f));
  const ogImage = has("og.png") ? `${base}/og.png` : `${base}/og.svg`;
  const org = { "@type": "Organization", "@id": `${base}/#org`, name: site.name, url: `${base}/`, logo: has("icon-512.png") ? `${base}/icon-512.png` : `${base}/favicon.svg` };

  // ── Search titles and snippets (owner, 27 Oct 2026: "perbaiki dulu seluruh SEO websitenya,
  // perkata") ───────────────────────────────────────────────────────────
  // Google shows about 60 characters of a title and 160 of a description. Every headline here
  // puts its keyword first ("Heizkörper entlüften: Wann es nötig ist …"), so a long headline is
  // cut at its last clause break that fits, with the site name when there is room; the H1,
  // og:title and the article itself keep the full headline. No two pages get the same title.
  // A page can name its own with `seoTitle:` in its frontmatter.
  const MAX_TITLE = 60;
  const MAX_DESC = 160;
  const seoTitles = new Map([...articles, ...pages].filter((d) => d.seoTitle).map((d) => [d.url, String(d.seoTitle)]));
  const titleOwner = new Map(); // title → the path that has it
  const trimEnd = (t) => t.trim().replace(/[\s,;:.–—|-]+$/, "");
  function titleChoices(title, path) {
    const brand = path === "/" ? "" : ` · ${site.name}`;
    const out = [];
    const add = (t) => {
      if (t.length >= 10 && t.length <= MAX_TITLE && !out.includes(t)) out.push(t);
    };
    // Longest first: a cut after ":" "?" "!" "." or before " – " " — " " | ", then after a comma.
    const cuts = (re) =>
      [...title.matchAll(re)].map((m) => trimEnd(title.slice(0, m.index + (/^[?!]/.test(m[0]) ? 1 : 0)))).filter(Boolean).reverse();
    const clauses = cuts(/[:?!.](?=\s)|\s[–—|-]\s/g);
    const commas = cuts(/,(?=\s)/g);
    if (brand) add(title + brand);
    add(title);
    for (const c of clauses) if (brand) add(c + brand);
    for (const c of clauses) add(c);
    for (const c of commas) if (brand) add(c + brand);
    for (const c of commas) add(c);
    const words = title.slice(0, MAX_TITLE - 1);
    add(trimEnd(words.slice(0, words.lastIndexOf(" "))) + "…");
    return out;
  }
  function searchTitle(title, path) {
    const choices = seoTitles.has(path) ? [seoTitles.get(path)] : titleChoices(title, path);
    const pick = choices.find((t) => !titleOwner.has(t) || titleOwner.get(t) === path) || choices[0] || title;
    titleOwner.set(pick, path);
    return pick;
  }
  function metaDescription(d) {
    d = String(d).replace(/\s+/g, " ").trim();
    if (d.length <= MAX_DESC) return d;
    const ends = [...d.matchAll(/[.!?](?=\s)/g)].map((m) => m.index + 1).filter((i) => i >= 70 && i <= MAX_DESC);
    if (ends.length) return d.slice(0, ends.at(-1));
    const cut = d.slice(0, MAX_DESC - 1);
    return `${trimEnd(cut.slice(0, cut.lastIndexOf(" ")))}…`;
  }

  function head({ title, description, path, type = "website", jsonld = [], image, noindex = false }) {
    const url = `${base}${path}`;
    const fullTitle = searchTitle(title, path);
    // Google recommends an image on every Article; a theme that names none gets the share image.
    const withImage = (n) => (/^(Article|BlogPosting|NewsArticle)$/.test(n?.["@type"]) && !n.image ? { ...n, image: image || ogImage } : n);
    const graph = [org, { "@type": "WebSite", "@id": `${base}/#site`, name: site.name, url: `${base}/`, inLanguage: site.lang, publisher: { "@id": `${base}/#org` } }, ...jsonld.map(withImage)];
    return [
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
      `<title>${esc(fullTitle)}</title>`,
      `<meta name="description" content="${esc(metaDescription(description))}">`,
      `<link rel="canonical" href="${url}">`,
      // A site still being written ("draft": true) is already online so its
      // domain carries the AdSense meta tag, loader and ads.txt, but it stays
      // out of search results until its library is complete.
      noindex || site.draft ? `<meta name="robots" content="noindex, follow">` : `<meta name="robots" content="index, follow, max-image-preview:large">`,
      `<meta name="theme-color" content="${esc(site.themeColor || "#000000")}">`,
      `<link rel="icon" href="${favicon}" type="image/svg+xml">`,
      has("favicon.ico") ? `<link rel="icon" href="/favicon.ico" sizes="48x48">` : "",
      has("apple-touch-icon.png") ? `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` : "",
      `<link rel="manifest" href="/site.webmanifest">`,
      `<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${base}/feed.xml">`,
      `<meta property="og:type" content="${type}">`,
      `<meta property="og:site_name" content="${esc(site.name)}">`,
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(description)}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:locale" content="${esc(site.ogLocale || locale.replace("-", "_"))}">`,
      `<meta property="og:image" content="${image || ogImage}">`,
      !image && has("og.png") ? `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(site.name)}">` : "",
      `<meta name="twitter:card" content="summary_large_image">`,
      // Google AdSense — the account this site applies with (site.json). The
      // meta tag, the loader and /ads.txt are all built from that one value.
      site.adsense ? `<meta name="google-adsense-account" content="${esc(site.adsense)}">` : "",
      site.adsense ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(site.adsense)}" crossorigin="anonymous"></script>` : "",
      site.fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(site.fonts)}">` : "",
      `<link rel="stylesheet" href="${asset("palace.css")}">`,
      site.promo ? promoStyle(`/${site.promo.slug}/`) : "",
      `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // The ecosystem menu item: bold with a slow golden glow (its label starts with
  // "✦"), scoped to links inside a header or nav. Only inherited properties are
  // touched, so a theme's own ::before/::after decoration stays intact.
  function promoStyle(href) {
    const sel = () => ["header", "nav"].map((w) => `${w} a[href="${href}"]`).join(",");
    return `<style>${sel()}{font-weight:700;letter-spacing:.01em}` +
      `@media (prefers-reduced-motion:no-preference){${sel()}{animation:eco-glow 3.2s ease-in-out infinite}}` +
      `@keyframes eco-glow{0%,100%{text-shadow:0 0 0 rgba(201,162,39,0)}50%{text-shadow:0 0 14px rgba(201,162,39,.55)}}</style>`;
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
  const extras = theme.extraFiles?.(ctx) ?? [];
  for (const extra of extras) emit(extra.path, extra.content);

  // ── Machine files ─────────────────────────────────────────────────────
  if (pub) writeFileSync(join(out, "ads.txt"), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
  // The web app manifest: the icons Android, Chrome and search show for the site. A plain
  // "browser" display — these are reading sites, not apps.
  writeFileSync(
    join(out, "site.webmanifest"),
    JSON.stringify(
      {
        name: site.expansion ? `${site.name} — ${site.expansion}` : site.name,
        short_name: site.name,
        description: metaDescription(site.description),
        lang: site.lang,
        start_url: "/",
        scope: "/",
        display: "browser",
        background_color: "#ffffff",
        theme_color: site.themeColor || "#000000",
        icons: [
          ...(has("icon-192.png") ? [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] : []),
          ...(has("icon-512.png") ? [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }] : []),
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      null,
      2
    ) + "\n"
  );
  // llms.txt (llmstxt.org): what the site is and where its articles are, for AI search
  // engines and assistants — the same facts as the sitemap, with titles and summaries.
  writeFileSync(
    join(out, "llms.txt"),
    [
      `# ${site.name}${site.expansion ? ` — ${site.expansion}` : ""}`,
      "",
      `> ${site.description}`,
      "",
      `Language: ${site.lang}. ${articles.length} articles, last updated ${articles.map((a) => a.updated).sort().at(-1) || new Date().toISOString().slice(0, 10)}. Publisher: ${site.author || site.name}.`,
      ...categories
        .filter((c) => c.articles.length)
        .flatMap((c) => ["", `## ${c.name}`, "", ...c.articles.map((a) => `- [${a.title}](${base}${a.url}): ${a.description}`)]),
      "",
      "## Optional",
      "",
      ...pages.map((p) => `- [${p.title || p.slug}](${base}${p.url})`),
      "",
    ].join("\n")
  );
  // security.txt (RFC 9116): where to report a problem with the site. Rebuilt on every
  // deploy, so its one-year expiry moves along.
  if (site.email) {
    const expires = new Date(Date.now() + 360 * 86_400_000).toISOString().replace(/\.\d{3}Z$/, ".000Z");
    mkdirSync(join(out, ".well-known"), { recursive: true });
    writeFileSync(
      join(out, ".well-known", "security.txt"),
      `Contact: mailto:${site.email}\nExpires: ${expires}\nPreferred-Languages: ${[...new Set([site.lang, "en"])].join(", ")}\nCanonical: ${base}/.well-known/security.txt\n`
    );
  }
  writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: "/", lastmod: articles[0]?.updated || today },
    ...categories.map((c) => ({ loc: c.url, lastmod: c.articles[0]?.updated || today })),
    ...articles.map((a) => ({ loc: a.url, lastmod: a.updated })),
    ...pages.map((p) => ({ loc: p.url, lastmod: p.updated || today })),
    // Pages a theme adds itself (an index of every guide, for instance), unless they ask not to be indexed.
    ...extras
      .filter((e) => e.path.endsWith("/") && !/<meta name="robots" content="noindex/.test(String(e.content)))
      .map((e) => ({ loc: e.path, lastmod: articles[0]?.updated || today })),
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
      // HTTPS only (a year; no includeSubDomains, so mail and other subdomains are never forced),
      // and the site is never framed by another site. AdSense frames its ads inside our page,
      // which this does not touch.
      "  Strict-Transport-Security: max-age=31536000",
      "  X-Frame-Options: SAMEORIGIN",
      "/assets/*",
      "  Cache-Control: public, max-age=31536000, immutable",
      "/ads.txt",
      "  Cache-Control: public, max-age=3600",
      "/site.webmanifest",
      "  Content-Type: application/manifest+json",
      "  Cache-Control: public, max-age=86400",
      "/llms.txt",
      "  Content-Type: text/plain; charset=utf-8",
      "/favicon.ico",
      "  Cache-Control: public, max-age=604800",
      "/apple-touch-icon.png",
      "  Cache-Control: public, max-age=604800",
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
