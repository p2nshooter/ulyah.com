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
import { adsenseFor, adsTxt, loaderTag, metaTag } from "./adsense.mjs";

const ENGINE = dirname(fileURLToPath(import.meta.url));
const SITES = resolve(ENGINE, "..");

// The few words the engine writes itself (the sources block under an article, the page of updates), per language.
const WORDS = {
  de: {
    sources: "Quellen und weiterführende Informationen",
    checked: "Zuletzt geprüft am",
    updatesSlug: "aktualisierungen",
    updatesTitle: "Aktualisierungen",
    updatesDescription: (n) => `Was auf NAME neu erschienen ist und welche Ratgeber wir überarbeitet haben, mit Datum: ${n} Einträge, die neuesten zuerst.`,
    updatesIntro: "Hier steht, wann jeder Ratgeber erschienen ist und wann wir ihn überarbeitet haben. Die Daten stammen direkt aus unseren Artikeln: Was hier steht, steht auch über dem jeweiligen Text.",
    published: (n) => (n === 1 ? "Neu erschienen" : `${n} neue Ratgeber`),
    updated: (n) => (n === 1 ? "Überarbeitet" : `${n} Ratgeber überarbeitet`),
  },
  es: {
    sources: "Fuentes y más información",
    checked: "Revisado por última vez el",
    updatesSlug: "novedades",
    updatesTitle: "Novedades",
    updatesDescription: (n) => `Lo que se ha publicado en NAME y las guías que hemos revisado, con su fecha: ${n} entradas, las más recientes primero.`,
    updatesIntro: "Aquí se indica cuándo se publicó cada guía y cuándo la revisamos. Las fechas salen directamente de los artículos: lo que figura aquí figura también al principio de cada texto.",
    published: (n) => (n === 1 ? "Publicado" : `${n} guías nuevas`),
    updated: (n) => (n === 1 ? "Revisado" : `${n} guías revisadas`),
  },
  en: {
    sources: "Sources and further reading",
    checked: "Last checked on",
    updatesSlug: "whats-new",
    updatesTitle: "What's new",
    updatesDescription: (n) => `What has been published on NAME and which guides we have revised, with dates: ${n} entries, newest first.`,
    updatesIntro: "This page shows when each guide was published and when we revised it. The dates come straight from the articles: what is listed here is also shown at the top of each piece.",
    published: (n) => (n === 1 ? "Published" : `${n} new guides`),
    updated: (n) => (n === 1 ? "Revised" : `${n} guides revised`),
  },
  fr: {
    sources: "Sources et pour aller plus loin",
    checked: "Vérifié pour la dernière fois le",
    updatesSlug: "nouveautes",
    updatesTitle: "Nouveautés",
    updatesDescription: (n) => `Ce qui a été publié sur NAME et les guides que nous avons révisés, avec leur date : ${n} entrées, les plus récentes d'abord.`,
    updatesIntro: "Cette page indique quand chaque guide a été publié et quand nous l'avons révisé. Les dates viennent directement des articles : ce qui figure ici figure aussi en tête de chaque texte.",
    published: (n) => (n === 1 ? "Publié" : `${n} nouveaux guides`),
    updated: (n) => (n === 1 ? "Révisé" : `${n} guides révisés`),
  },
};

/** Today in UTC (YYYY-MM-DD). SITES_TODAY overrides it, so a test can build "tomorrow". */
export const today = () => process.env.SITES_TODAY || new Date().toISOString().slice(0, 10);

/** "Title | https://url" → { title, url, host }; anything else → null. */
export function parseSource(line) {
  const m = /^(.+?)\s*\|\s*(https:\/\/\S+)$/.exec(String(line).trim());
  if (!m) return null;
  try {
    return { title: m[1], url: m[2], host: new URL(m[2]).hostname.replace(/^www\./, "") };
  } catch {
    return null;
  }
}

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

  const words = WORDS[site.lang] || WORDS.en;
  const day = today();
  const articleDir = join(dir, "content", "articles");
  // Owner, 2 Nov 2026 (docs/ADSENSE-BLUEPRINT.md §22): an article carries the day it really went online. One dated
  // in the future is written but scheduled: it is not built, linked or listed until its day comes, and the daily
  // run of deploy-sites.yml publishes it then — so a site grows a few guides a week instead of twenty at once.
  const scheduled = [];
  const articles = (existsSync(articleDir) ? readdirSync(articleDir) : [])
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, body } = parseFrontmatter(readFileSync(join(articleDir, file), "utf8"));
      const slug = data.slug || file.replace(/\.md$/, "");
      const cat = catBySlug.get(data.category);
      if (!cat) throw new Error(`${file}: unknown category "${data.category}"`);
      if (!data.title || !data.description || !data.date) throw new Error(`${file}: title, description and date are required`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || (data.updated && !/^\d{4}-\d{2}-\d{2}$/.test(data.updated))) throw new Error(`${file}: date and updated are YYYY-MM-DD`);
      if (data.date > day) {
        scheduled.push({ file, date: data.date, title: data.title });
        return null;
      }
      // An update dated in the future is not shown before its day either.
      if (data.updated && data.updated > day) delete data.updated;
      let { html, headings } = renderMarkdown(body);
      const sourceLines = Array.isArray(data.sources) ? data.sources : data.sources ? [data.sources] : [];
      const sources = sourceLines.map(parseSource);
      if (sources.some((x) => !x)) throw new Error(`${file}: every source is "Title | https://…"`);
      if (sources.length) {
        // Plain outbound links to where the facts come from. The heading joins the article's table of contents.
        const id = "quellen-und-informationen";
        headings = [...headings, { level: 2, text: words.sources, id }];
        html +=
          `\n<section class="engine-quellen" aria-labelledby="${id}">\n<h2 id="${id}">${esc(words.sources)}</h2>\n<ul>\n` +
          sources.map((x) => `<li><a href="${esc(x.url)}" rel="noopener" target="_blank">${esc(x.title)}</a> <span class="engine-quellen__host">(${esc(x.host)})</span></li>`).join("\n") +
          `\n</ul>\n<p class="engine-quellen__stand">${esc(words.checked)} <time datetime="${data.updated || data.date}">${fmtDate(data.updated || data.date)}</time>.</p>\n</section>`;
      }
      const wordCount = countWords(body);
      const a = {
        ...data,
        file,
        slug,
        url: `${paths.article}${slug}/`,
        cat,
        html,
        headings,
        sources,
        words: wordCount,
        minutes: Math.max(1, Math.round(wordCount / 220)),
        dateLabel: fmtDate(data.date),
        updated: data.updated || data.date,
        updatedLabel: fmtDate(data.updated || data.date),
      };
      cat.articles.push(a);
      return a;
    })
    .filter(Boolean)
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
      let { html } = renderMarkdown(body);
      const { headings } = renderMarkdown(body);
      // A tool page (`tool: <name>`): the Markdown is the complete static version — tables a reader and a crawler
      // can use without JavaScript — and theme/assets/tools/<name>.js adds the interactive part above it.
      if (data.tool) {
        if (!/^[a-z0-9-]+$/.test(data.tool)) throw new Error(`${file}: tool is a lowercase name`);
        if (!existsSync(join(dir, "theme", "assets", "tools", `${data.tool}.js`))) throw new Error(`${file}: theme/assets/tools/${data.tool}.js is missing`);
        html = `<div class="engine-werkzeug" id="werkzeug" data-tool="${data.tool}" aria-live="polite"></div>\n${html}`;
      }
      return { ...data, slug, url: `/${slug}/`, html, headings, words: countWords(body) };
    })
    .sort((a, b) => Number(a.order ?? 99) - Number(b.order ?? 99));

  // The page of updates (owner, 2 Nov 2026, §22): when each guide went online and when it was revised, straight from
  // the articles' own dates — the site's upkeep in plain view. Linked from the footer with the legal pages.
  if (articles.length && !pages.some((p) => p.slug === words.updatesSlug)) {
    const events = [];
    for (const a of articles) {
      events.push({ day: a.date, kind: "published", a });
      if (a.updated && a.updated !== a.date) events.push({ day: a.updated, kind: "updated", a });
    }
    const byDay = new Map();
    for (const e of events.sort((x, y) => (x.day === y.day ? x.a.title.localeCompare(y.a.title) : x.day < y.day ? 1 : -1))) {
      const k = `${e.day}|${e.kind}`;
      byDay.set(k, [...(byDay.get(k) || []), e]);
    }
    const md = [words.updatesIntro, ""];
    for (const [k, list] of [...byDay].sort((x, y) => (x[0] < y[0] ? 1 : -1))) {
      const [d, kind] = k.split("|");
      md.push(`## ${fmtDate(d)}: ${words[kind](list.length)}`, "");
      for (const e of list) md.push(`- [${e.a.title.replace(/[[\]]/g, "")}](${e.a.url})${kind === "updated" && e.a.change ? ` — ${e.a.change}` : ""}`);
      md.push("");
    }
    const { html, headings } = renderMarkdown(md.join("\n"));
    const lastDay = events.map((e) => e.day).sort().at(-1);
    pages.push({
      slug: words.updatesSlug,
      url: `/${words.updatesSlug}/`,
      title: words.updatesTitle,
      description: words.updatesDescription(events.length).replace("NAME", site.name),
      updated: lastDay,
      html,
      headings,
      words: countWords(md.join("\n")),
      generated: true,
    });
    site.legal = [...(site.legal || []).filter((l) => l.href !== `/${words.updatesSlug}/`), { label: words.updatesTitle, href: `/${words.updatesSlug}/` }];
  }

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
  // Since 7 Nov 2026 a site can authorise several accounts (adsense.mjs, adsense-stack.json): one meta tag and one
  // ads.txt line per account, one loader (the primary account).
  const ad = adsenseFor(site.domain, site.adsense || "");
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
      // Google AdSense — every account the site authorises gets its meta tag (adsense-stack.json); one loader, the
      // primary account (site.json "adsense"). /ads.txt lists the same accounts.
      ad ? ad.accounts.map((a) => metaTag(esc(a))).join("\n") : "",
      ad ? loaderTag(esc(ad.primary)) : "",
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
  for (const p of pages) {
    let html = theme.page(ctx, p);
    if (p.tool) html = html.replace("</body>", `<script src="${asset(`tools/${p.tool}.js`)}" defer></script>\n</body>`);
    emit(p.url, html);
  }
  writeFileSync(join(out, "404.html"), theme.notFound(ctx));
  const extras = theme.extraFiles?.(ctx) ?? [];
  for (const extra of extras) emit(extra.path, extra.content);

  // ── Machine files ─────────────────────────────────────────────────────
  if (ad) writeFileSync(join(out, "ads.txt"), adsTxt(ad.accounts));
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
  // Owner, 1 Nov 2026: "Pastikan web artikel yg lain jg mematikan robot yg menghalangi crawler google". Should
  // Cloudflare ever prepend "Disallow: /" for Google's own crawlers again, Google merges every group that names the
  // same crawler and follows the least restrictive rule on a tie (Google's robots.txt specification): this second
  // group keeps Google-Extended, GoogleOther and Google-CloudVertexBot allowed.
  writeFileSync(
    join(out, "robots.txt"),
    `User-agent: *\nAllow: /\n\nUser-agent: Google-Extended\nUser-agent: GoogleOther\nUser-agent: Google-CloudVertexBot\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`
  );
  const todayIso = day;
  const urls = [
    { loc: "/", lastmod: articles[0]?.updated || todayIso },
    ...categories.map((c) => ({ loc: c.url, lastmod: c.articles[0]?.updated || todayIso })),
    ...articles.map((a) => ({ loc: a.url, lastmod: a.updated })),
    ...pages.map((p) => ({ loc: p.url, lastmod: p.updated || todayIso })),
    // Pages a theme adds itself (an index of every guide, for instance), unless they ask not to be indexed.
    ...extras
      .filter((e) => e.path.endsWith("/") && !/<meta name="robots" content="noindex/.test(String(e.content)))
      .map((e) => ({ loc: e.path, lastmod: articles[0]?.updated || todayIso })),
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
  if (!quiet && scheduled.length) console.log(`${domain}: ${scheduled.length} scheduled (next ${scheduled.map((x) => x.date).sort()[0]})`);
  return { site, articles, categories, pages, out, scheduled, today: day };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const domains = process.argv.slice(2);
  if (!domains.length) {
    console.error("usage: node sites/_engine/build.mjs <domain> [<domain> …]");
    process.exit(2);
  }
  for (const d of domains) await build(d);
}
