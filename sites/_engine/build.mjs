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
import { translateHtml, translateJson, translateScript, translator } from "./lib/i18n.mjs";
import { illustration } from "./illustrate.mjs";

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
    toolsKicker: "Werkzeuge",
    calcTitle: "Mit eigenen Zahlen rechnen",
    toolsTitle: "Rechnen Sie mit Ihren eigenen Zahlen",
    toolsLead: "Kostenlose Rechner, die in Ihrem Browser laufen: ohne Anmeldung, und nichts, was Sie eingeben, wird gesendet.",
    toolsOpen: "Öffnen",
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
    toolsKicker: "Herramientas",
    calcTitle: "Calcúlalo con tus datos",
    toolsTitle: "Haz las cuentas con tus propios datos",
    toolsLead: "Calculadoras gratuitas que funcionan en tu navegador: sin registro y sin enviar nada de lo que escribes.",
    toolsOpen: "Abrir",
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
    toolsKicker: "Tools",
    calcTitle: "Work it out with your own numbers",
    toolsTitle: "Do the sums with your own numbers",
    toolsLead: "Free calculators that run in your browser: no sign-up, and nothing you type is sent anywhere.",
    toolsOpen: "Open",
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
    toolsKicker: "Outils",
    calcTitle: "Calculez avec vos propres chiffres",
    toolsTitle: "Faites le calcul avec vos propres chiffres",
    toolsLead: "Des calculateurs gratuits qui fonctionnent dans votre navigateur : sans inscription, et rien de ce que vous saisissez n’est envoyé.",
    toolsOpen: "Ouvrir",
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
  const site0 = JSON.parse(readFileSync(join(dir, "site.json"), "utf8"));
  const out = join(dir, "dist");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const base = `https://${site0.domain}`;
  const day = today();

  // ── Editions ──────────────────────────────────────────────────────────
  // Every site has its own language. A German or Spanish site with an "en" block in site.json also has an English
  // edition under /en/ (owner, 8–9 Nov 2026, docs/ADSENSE-BLUEPRINT.md §28–29): its articles and pages are written by
  // hand in content/en/ (same file names as the originals, English slugs in the frontmatter), its categories, menus
  // and tagline come from the "en" block, and the words the theme writes itself from theme/en.json.
  const english = site0.en && site0.lang !== "en";
  if (english) {
    for (const k of ["since", "paths", "categories", "description"]) if (!site0.en[k]) throw new Error(`site.json "en" needs "${k}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(site0.en.since)) throw new Error(`site.json en.since is YYYY-MM-DD`);
  }
  const uiFile = join(dir, "theme", "en.json");
  const uiList = english && existsSync(uiFile) ? JSON.parse(readFileSync(uiFile, "utf8")) : {};
  const trEn = translator(uiList);

  function loadEdition(variant) {
    const en = variant === "en";
    const v = en ? site0.en : {};
    const site = en
      ? {
          ...site0,
          ...Object.fromEntries(["name", "expansion", "tagline", "description", "author", "email", "menu", "legal", "fonts"].filter((k) => v[k] !== undefined).map((k) => [k, v[k]])),
          lang: "en",
          locale: v.locale || "en-GB",
          ogLocale: v.ogLocale || (v.locale || "en-GB").replace("-", "_"),
          since: v.since,
          promo: site0.promo && v.promo ? { ...site0.promo, ...v.promo } : undefined,
          menu: [...(v.menu || [])],
          legal: [...(v.legal || [])],
        }
      : { ...site0, menu: [...(site0.menu || [])], legal: [...(site0.legal || [])] };
    const paths = en ? { ...v.paths } : { article: "/articles/", category: "/category/", ...(site0.paths || {}) };
    if (en && (!/^\/en\//.test(paths.article || "") || !/^\/en\//.test(paths.category || ""))) throw new Error(`site.json en.paths live under /en/`);
    const locale = site.locale || site.lang;
    const fmtDate = (iso) =>
      new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
    const words = WORDS[site.lang] || WORDS.en;
    const categories = site0.categories.map((c) => {
      const t = en ? v.categories[c.slug] : null;
      if (en && (!t || !t.name || !t.description)) throw new Error(`site.json en.categories.${c.slug} needs a name and a description`);
      const urlSlug = t?.slug || c.slug;
      // `slug` stays the original one: themes use it for their own classes and comparisons; the URL is English.
      return { ...c, ...(t ? { name: t.name, description: t.description } : {}), urlSlug, url: `${paths.category}${urlSlug}/`, articles: [] };
    });
    site.categories = categories;
    const catBySlug = new Map(categories.map((c) => [c.slug, c]));

    // Owner, 2 Nov 2026 (docs/ADSENSE-BLUEPRINT.md §22): an article carries the day it really went online. One dated
    // in the future is written but scheduled: it is not built, linked or listed until its day comes, and the daily
    // run of deploy-sites.yml publishes it then — so a site grows a few guides a week instead of twenty at once.
    // An English article went online with the English edition (en.since) — or with its original, if that came later.
    const scheduled = [];
    const origDir = join(dir, "content", "articles");
    const articleDir = en ? join(dir, "content", "en", "articles") : origDir;
    const articles = (existsSync(articleDir) ? readdirSync(articleDir) : [])
      .filter((f) => f.endsWith(".md"))
      .map((file) => {
        let { data, body } = parseFrontmatter(readFileSync(join(articleDir, file), "utf8"));
        if (en) {
          if (!existsSync(join(origDir, file))) throw new Error(`content/en/articles/${file}: no original content/articles/${file}`);
          const orig = parseFrontmatter(readFileSync(join(origDir, file), "utf8")).data;
          if (!data.slug) throw new Error(`content/en/articles/${file}: an English slug is required`);
          const date = [orig.date, data.date || v.since].sort().at(-1);
          data = { ...orig, updated: undefined, change: undefined, ...data, date, category: orig.category, original: orig.slug || file.replace(/\.md$/, "") };
          if (data.updated && data.updated < date) delete data.updated;
        }
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
          body: html,
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
    // The reading order the voice follows from one article to the next (§29 „auto pindah“): the rest of the same
    // topic first, then the next topic, round the whole library.
    const order = categories.flatMap((c) => c.articles);
    order.forEach((a, i) => (a.next = order[(i + 1) % order.length]));

    const pageDir = en ? join(dir, "content", "en", "pages") : join(dir, "content", "pages");
    const pages = (existsSync(pageDir) ? readdirSync(pageDir) : [])
      .filter((f) => f.endsWith(".md"))
      .map((file) => {
        const { data, body } = parseFrontmatter(readFileSync(join(pageDir, file), "utf8"));
        const own = file.replace(/\.md$/, "");
        if (en && !existsSync(join(dir, "content", "pages", file))) throw new Error(`content/en/pages/${file}: no original content/pages/${file}`);
        if (en && !data.slug) throw new Error(`content/en/pages/${file}: an English slug is required`);
        // The English page is the same page: it keeps the original's tool and its place in the order.
        if (en) {
          const orig = parseFrontmatter(readFileSync(join(dir, "content", "pages", file), "utf8")).data;
          for (const k of ["tool", "order"]) if (data[k] == null && orig[k] != null) data[k] = orig[k];
        }
        // `slug` stays the original one (themes compare it, e.g. "ueber-uns" → AboutPage); the URL is English.
        const slug = en ? own : data.slug || own;
        const urlSlug = data.slug || own;
        let { html } = renderMarkdown(body);
        const { headings } = renderMarkdown(body);
        // A tool page (`tool: <name>`): the Markdown is the complete static version — tables a reader and a crawler
        // can use without JavaScript — and theme/assets/tools/<name>.js adds the interactive part above it. The
        // English page gets the tool when the theme has an English script (tools/<name>.en.js), or when the tool is
        // built on the engine's shared runtime (EngineTool.mount), whose one script speaks every language of the site.
        let tool = data.tool;
        if (tool) {
          if (!/^[a-z0-9-]+$/.test(tool)) throw new Error(`${file}: tool is a lowercase name`);
          const toolFile = (n) => join(dir, "theme", "assets", "tools", `${n}.js`);
          const bilingual = existsSync(toolFile(tool)) && readFileSync(toolFile(tool), "utf8").includes("EngineTool.mount(");
          const script = en && !bilingual ? `${tool}.en` : tool;
          if (!existsSync(toolFile(script))) {
            if (!en) throw new Error(`${file}: theme/assets/tools/${tool}.js is missing`);
            tool = undefined;
          } else {
            tool = script;
            html = `<div class="engine-werkzeug" id="werkzeug" data-tool="${data.tool}" aria-live="polite"></div>\n${html}`;
          }
        }
        const url = en ? `/en/${urlSlug}/` : `/${slug}/`;
        return { ...data, tool, file, slug, url, html, headings, words: countWords(body) };
      })
      .sort((a, b) => Number(a.order ?? 99) - Number(b.order ?? 99));

    // Ecosystem menu (owner, 18 Oct 2026): "Promosikan website axto.io dan xaa.es dengan bahasa masing2 situs dengan
    // menu husus yg premium … kalimat yang berbeda di setiap situs". A site that sets `promo: { slug, label }` gets
    // one extra menu item, rendered by its own theme in the header and footer like any other, pointing at its own
    // page content/pages/<slug>.md — written for that site, in its language, so no two sites carry the same text.
    // The head adds a quiet golden glow to that one item (off under prefers-reduced-motion). No ad markup.
    if (site.promo) {
      if (!/^[a-z0-9-]+$/.test(site.promo.slug || "") || !site.promo.label) throw new Error(`site.json promo needs a slug and a label`);
      const promoPage = pages.find((p) => p.file === `${site.promo.slug}.md`);
      if (!promoPage) throw new Error(`promo page content/${en ? "en/" : ""}pages/${site.promo.slug}.md is missing`);
      site.promo = { ...site.promo, href: promoPage.url };
      site.menu = [{ label: site.promo.label, href: promoPage.url, promo: true }, ...site.menu.filter((m) => m.href !== promoPage.url && m.href !== `/${site.promo.slug}/`)];
    }

    // The page of updates (owner, 2 Nov 2026, §22): when each guide went online and when it was revised, straight
    // from the articles' own dates — the site's upkeep in plain view. Linked from the footer with the legal pages.
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
      const url = en ? `/en/${words.updatesSlug}/` : `/${words.updatesSlug}/`;
      pages.push({
        file: "__updates",
        slug: words.updatesSlug,
        url,
        title: words.updatesTitle,
        description: words.updatesDescription(events.length).replace("NAME", site.name),
        updated: lastDay,
        html,
        headings,
        words: countWords(md.join("\n")),
        generated: true,
      });
      site.legal = [...site.legal.filter((l) => l.href !== url), { label: words.updatesTitle, href: url }];
    }
    return { variant: variant || site0.lang, en, site, paths, locale, fmtDate, words, categories, articles, pages, scheduled, home: en ? "/en/" : "/" };
  }

  const primary = loadEdition(null);
  const second = english ? loadEdition("en") : null;
  const editions = second ? [primary, second] : [primary];

  // ── Pairs: the same page in both languages (hreflang, the language switch, links in the English text) ──
  const toEn = new Map(); // original path → English path
  const pairOf = new Map(); // any path → { [lang]: path }
  if (second) {
    const pair = (a, b) => {
      if (!a || !b) return;
      toEn.set(a, b);
      const p = { [site0.lang]: a, en: b };
      pairOf.set(a, p);
      pairOf.set(b, p);
    };
    pair("/", "/en/");
    for (const c of primary.categories) pair(c.url, second.categories.find((x) => x.slug === c.slug)?.url);
    const enArticle = new Map(second.articles.map((a) => [a.file, a]));
    for (const a of primary.articles) pair(a.url, enArticle.get(a.file)?.url);
    const enPage = new Map(second.pages.map((p) => [p.file, p]));
    for (const p of primary.pages) pair(p.url, enPage.get(p.file)?.url);
    // Menus and legal links of the English edition may name the original pages: they lead to the English ones.
    for (const list of [second.site.menu, second.site.legal]) for (const m of list) m.href = toEn.get(m.href) || m.href;
  }
  // Links inside the English text and the theme's own fixed links ("/", "/metodologia/") lead to the English pages.
  const enPath = (path) => {
    const [p, hash = ""] = String(path).split("#");
    const hit = toEn.get(p);
    return hit ? hit + (hash ? `#${hash}` : "") : path;
  };
  // Absolute links to the site itself, except its root and #fragment ids (the Organization and WebSite of the
  // structured data are the same for both languages).
  const selfUrl = new RegExp(`(["(])${base.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&")}(\\/[^"\\s)#]*)(?=["\\s)])`, "g");
  const rewriteAbsolute = (text) => text.replace(selfUrl, (m, pre, p) => (p === "/" || p.startsWith("/en/") ? m : `${pre}${base}${enPath(p)}`));
  const rewriteLinks = (html) =>
    rewriteAbsolute(html.replace(/(\shref=")(\/[^"]*)"/g, (m, pre, p) => (p.startsWith("/en/") || p.startsWith("/assets/") ? m : `${pre}${enPath(p)}"`)));

  for (const ed of editions) {
    for (const a of ed.articles) {
      let body = a.body;
      if (ed.en) body = rewriteLinks(body);
      // The site's calculators that fit this article (frontmatter `calculators:` or site.json "calculators" per topic,
      // both naming tool pages by file name), as a box above the sources: the reader can do the sums right away (§30).
      const calcStems = a.calculators || ed.site.calculators?.[a.category] || [];
      const calcPages = [].concat(calcStems).map((stem) => ed.pages.find((p) => p.file === `${stem}.md` && p.tool)).filter(Boolean);
      if (calcPages.length) {
        const w = WORDS[ed.en ? "en" : ed.site.lang] || WORDS.en;
        const box =
          `<aside class="engine-rechner" aria-label="${esc(w.calcTitle)}"><style>.engine-rechner{margin:32px 0;padding:18px 20px;border-radius:16px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);background:color-mix(in srgb,currentColor 4%,transparent)}.engine-rechner p{margin:0 0 8px;font-weight:700}.engine-rechner ul{margin:0;padding-left:1.2em}.engine-rechner li{margin:4px 0}</style>` +
          `<p>${esc(w.calcTitle)}</p><ul>${calcPages.map((p) => `<li><a href="${p.url}">${esc(p.short || p.title.split(":")[0])}</a>: ${esc(p.description || "")}</li>`).join("")}</ul></aside>\n`;
        const at = body.indexOf('<section class="engine-quellen"');
        body = at > -1 ? body.slice(0, at) + box + body.slice(at) : body + "\n" + box;
      }
      // An animated picture of the article's own subject on top (§29 „setiap artikel kasih gambar animasi yg sesuai
      // tema“), then the listen / auto scroll / slides bar (§28), built by assets/engine-reader.js in place of the
      // empty mark — crawlers and readers without JavaScript see the article unchanged. The mark carries the next
      // article of the reading order, so the voice can carry on there (§29 „auto pindah“).
      const next = a.next && a.next !== a ? ` data-next="${esc(a.next.url)}" data-next-title="${esc(a.next.title)}"` : "";
      const voice = ` data-voice-lang="${esc(ed.locale)}"`;
      a.illustration = illustration(a, { site: ed.site, lang: ed.site.lang, themeColor: site0.themeColor });
      // The way on is a real link written here, so the reader follows it with a click and never builds a URL itself.
      const nextLink = next ? `<a data-engine-next href="${esc(a.next.url)}" tabindex="-1"></a>` : "";
      a.html = `<!--engine-content-->\n${a.illustration}\n<div data-engine-reader${next}${voice} hidden>${nextLink}</div>\n${body}\n<!--/engine-content-->`;
    }
    if (ed.en) for (const p of ed.pages) p.html = `<!--engine-content-->\n${rewriteLinks(p.html)}\n<!--/engine-content-->`;
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
  // The theme script of the English edition: its few words ("Menü", "Schließen") in English.
  if (second && uiList.script && existsSync(join(assetSrc, "palace.js"))) {
    const js = translateScript(readFileSync(join(assetSrc, "palace.js"), "utf8"), uiList.script);
    writeFileSync(join(out, "assets", "palace.en.js"), js);
    assetVersion["palace.en.js"] = createHash("sha256").update(js).digest("hex").slice(0, 10);
  }
  // The engine's own scripts and styles (every site, same code): the article reader bar (§28–29).
  for (const f of ["engine-reader.js", "engine-tool.js"]) {
    const src = join(ENGINE, "assets", f);
    mkdirSync(join(out, "assets"), { recursive: true });
    cpSync(src, join(out, "assets", f));
    assetVersion[f] = createHash("sha256").update(readFileSync(src)).digest("hex").slice(0, 10);
  }
  const publicDir = join(dir, "public");
  if (existsSync(publicDir)) cpSync(publicDir, out, { recursive: true });

  // ── What every page's <head> and tail carry ────────────────────────────
  // A site may be built before its AdSense account exists ("persiapan"): then
  // it carries no AdSense tag and no ads.txt until site.json gets the id.
  // Since 7 Nov 2026 a site can authorise several accounts (adsense.mjs, adsense-stack.json): one meta tag and one
  // ads.txt line per account, one loader (the primary account).
  const ad = adsenseFor(site0.domain, site0.adsense || "");
  // The favicon is cached hard by browsers; its content hash in the URL makes
  // a new icon show up on the next visit instead of weeks later.
  const favFile = join(publicDir, "favicon.svg");
  const favicon = `/favicon.svg${existsSync(favFile) ? `?v=${createHash("sha256").update(readFileSync(favFile)).digest("hex").slice(0, 8)}` : ""}`;
  const asset = (name) => `/assets/${name}${assetVersion[name] ? `?v=${assetVersion[name]}` : ""}`;
  const has = (f) => existsSync(join(publicDir, f));
  const ogImage = has("og.png") ? `${base}/og.png` : `${base}/og.svg`;
  const org = { "@type": "Organization", "@id": `${base}/#org`, name: site0.name, url: `${base}/`, logo: has("icon-512.png") ? `${base}/icon-512.png` : `${base}/favicon.svg` };

  // ── Search titles and snippets (owner, 27 Oct 2026: "perbaiki dulu seluruh SEO websitenya,
  // perkata") ───────────────────────────────────────────────────────────
  // Google shows about 60 characters of a title and 160 of a description. Every headline here
  // puts its keyword first ("Heizkörper entlüften: Wann es nötig ist …"), so a long headline is
  // cut at its last clause break that fits, with the site name when there is room; the H1,
  // og:title and the article itself keep the full headline. No two pages get the same title.
  // A page can name its own with `seoTitle:` in its frontmatter.
  const MAX_TITLE = 60;
  const MAX_DESC = 160;
  const seoTitles = new Map(editions.flatMap((ed) => [...ed.articles, ...ed.pages]).filter((d) => d.seoTitle).map((d) => [d.url, String(d.seoTitle)]));
  const titleOwner = new Map(); // title → the path that has it
  const trimEnd = (t) => t.trim().replace(/[\s,;:.–—|-]+$/, "");
  function titleChoices(title, path, name) {
    const brand = path === "/" || path === "/en/" ? "" : ` · ${name}`;
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
  function searchTitle(title, path, name) {
    const choices = seoTitles.has(path) ? [seoTitles.get(path)] : titleChoices(title, path, name);
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

  // The ecosystem menu item: bold with a slow golden glow (its label starts with
  // "✦"), scoped to links inside a header or nav. Only inherited properties are
  // touched, so a theme's own ::before/::after decoration stays intact.
  function promoStyle(href) {
    const sel = () => ["header", "nav"].map((w) => `${w} a[href="${href}"]`).join(",");
    return `<style>${sel()}{font-weight:700;letter-spacing:.01em}` +
      `@media (prefers-reduced-motion:no-preference){${sel()}{animation:eco-glow 3.2s ease-in-out infinite}}` +
      `@keyframes eco-glow{0%,100%{text-shadow:0 0 0 rgba(201,162,39,0)}50%{text-shadow:0 0 14px rgba(201,162,39,.55)}}</style>`;
  }

  const LANG_NAME = { de: "Deutsch", es: "Español", en: "English", fr: "Français" };
  const LANG_LABEL = { de: "Sprache", es: "Idioma", en: "Language", fr: "Langue" };
  const langStyle =
    `<style>.engine-lang{display:flex;justify-content:flex-end;gap:10px;padding:6px 16px;font:500 14px/1.3 system-ui,sans-serif;position:relative;z-index:5}` +
    `.engine-lang a{color:inherit;text-decoration:none;border:1px solid color-mix(in srgb,currentColor 30%,transparent);border-radius:999px;padding:4px 12px;background:color-mix(in srgb,currentColor 6%,transparent)}` +
    `.engine-lang a:hover,.engine-lang a:focus-visible{background:color-mix(in srgb,currentColor 16%,transparent)}@media print{.engine-lang{display:none}}</style>`;

  const files = [];
  const emit = (path, html) => {
    const file = path.endsWith("/") ? join(out, path, "index.html") : join(out, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    files.push(path);
  };
  let theme = null;

  for (const ed of editions) {
    const { site, paths, articles, categories, pages, fmtDate } = ed;
    const tr = ed.en ? trEn : (t) => t;
    const mapPath = (p) => (ed.en ? enPath(p) : p);
    const feed = ed.en ? "/en/feed.xml" : "/feed.xml";

    function alternates(path) {
      const p = pairOf.get(path);
      if (!p) return "";
      return [
        `<link rel="alternate" hreflang="${site0.lang}" href="${base}${p[site0.lang]}">`,
        `<link rel="alternate" hreflang="en" href="${base}${p.en}">`,
        `<link rel="alternate" hreflang="x-default" href="${base}${p[site0.lang]}">`,
      ].join("\n");
    }

    function head({ title, description, path, type = "website", jsonld = [], image, noindex = false }) {
      path = mapPath(path);
      title = tr(title);
      description = tr(description);
      jsonld = ed.en ? translateJson(jsonld, tr) : jsonld;
      const url = `${base}${path}`;
      const fullTitle = searchTitle(title, path, site.name);
      // Google recommends an image on every Article; a theme that names none gets the share image.
      const withImage = (n) => (/^(Article|BlogPosting|NewsArticle)$/.test(n?.["@type"]) && !n.image ? { ...n, image: image || ogImage } : n);
      const webSite = { "@type": "WebSite", "@id": `${base}/#site`, name: site0.name, url: `${base}/`, inLanguage: second ? [site0.lang, "en"] : site0.lang, publisher: { "@id": `${base}/#org` } };
      const graph = [org, webSite, ...jsonld.map(withImage)];
      return [
        `<meta charset="utf-8">`,
        `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
        `<title>${esc(fullTitle)}</title>`,
        `<meta name="description" content="${esc(metaDescription(description))}">`,
        `<link rel="canonical" href="${url}">`,
        alternates(path),
        // A site still being written ("draft": true) is already online so its
        // domain carries the AdSense meta tag, loader and ads.txt, but it stays
        // out of search results until its library is complete.
        noindex || site.draft ? `<meta name="robots" content="noindex, follow">` : `<meta name="robots" content="index, follow, max-image-preview:large">`,
        `<meta name="theme-color" content="${esc(site.themeColor || "#000000")}">`,
        `<link rel="icon" href="${favicon}" type="image/svg+xml">`,
        has("favicon.ico") ? `<link rel="icon" href="/favicon.ico" sizes="48x48">` : "",
        has("apple-touch-icon.png") ? `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` : "",
        `<link rel="manifest" href="/site.webmanifest">`,
        `<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${base}${feed}">`,
        `<meta property="og:type" content="${type}">`,
        `<meta property="og:site_name" content="${esc(site.name)}">`,
        `<meta property="og:title" content="${esc(title)}">`,
        `<meta property="og:description" content="${esc(description)}">`,
        `<meta property="og:url" content="${url}">`,
        `<meta property="og:locale" content="${esc(site.ogLocale || ed.locale.replace("-", "_"))}">`,
        second ? `<meta property="og:locale:alternate" content="${esc(ed.en ? site0.ogLocale || (site0.locale || site0.lang).replace("-", "_") : site0.en.ogLocale || (site0.en.locale || "en-GB").replace("-", "_"))}">` : "",
        `<meta property="og:image" content="${image || ogImage}">`,
        !image && has("og.png") ? `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(site.name)}">` : "",
        `<meta name="twitter:card" content="summary_large_image">`,
        // Google AdSense — every account the site authorises gets its meta tag (adsense-stack.json); one loader, the
        // primary account (site.json "adsense"). /ads.txt lists the same accounts.
        ad ? ad.accounts.map((a) => metaTag(esc(a))).join("\n") : "",
        ad ? loaderTag(esc(ad.primary)) : "",
        site.fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(site.fonts)}">` : "",
        `<link rel="stylesheet" href="${asset("palace.css")}">`,
        site.promo ? promoStyle(site.promo.href) : "",
        second ? langStyle : "",
        `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    // One cookieless page view to the ulyah.com admin, where every site of the
    // owner is counted. No presence heartbeat: it is one write per page, never
    // a write every few seconds against the shared D1 quota.
    const script = ed.en && assetVersion["palace.en.js"] ? "palace.en.js" : "palace.js";
    const tail = () =>
      `<script>try{var b=JSON.stringify({site:${JSON.stringify(site.trackId)},path:location.pathname});navigator.sendBeacon?navigator.sendBeacon("https://api.ulyah.com/track",new Blob([b],{type:"text/plain"})):fetch("https://api.ulyah.com/track",{method:"POST",body:b,keepalive:true})}catch(e){}</script>\n` +
      `<script src="${asset(script)}" defer></script>`;

    const crumbs = (items) => ({
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, n) => ({ "@type": "ListItem", position: n + 1, name: tr(it.name), item: `${base}${mapPath(it.path)}` })),
    });

    const ctx = { site, base, paths, articles, categories, pages, esc, asset, head, tail, fmtDate, crumbs, slugify, lang: site.lang, edition: ed.en ? "en" : "original" };
    theme ||= await import(pathToFileURL(join(dir, "theme", "templates.mjs")).href);

    // The language switch at the top of every page of a two-language site: the same page in the other language,
    // or that edition's home page when the page exists in one language only.
    const other = ed.en ? site0.lang : "en";
    const switchFor = (path) => {
      const target = pairOf.get(path)?.[other] || (ed.en ? "/" : "/en/");
      return `<nav class="engine-lang" aria-label="${LANG_LABEL[site.lang] || "Language"}"><a href="${target}" hreflang="${other}" lang="${other}">🌐 ${LANG_NAME[other] || other}</a></nav>`;
    };
    const finish = (path, html) => {
      if (ed.en) {
        // The head is English already (head() above); only its structured data may name an original page through a
        // fixed path in the theme. The body: the theme's fixed links and words.
        const at = html.search(/<body\b/);
        const top = html.slice(0, at).replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, o, json, c) => o + rewriteAbsolute(json) + c);
        html = top + translateHtml(rewriteLinks(html.slice(at)), tr);
      }
      if (second) html = html.replace(/(<body\b[^>]*>)/, `$1\n${switchFor(path)}`);
      return html;
    };

    emit(ed.home, toolsBand(finish(ed.home, theme.home(ctx)), ed));
    for (const c of categories) emit(c.url, finish(c.url, theme.category(ctx, c)));
    for (const a of articles) emit(a.url, finish(a.url, theme.article(ctx, a)).replace("</body>", `<script src="${asset("engine-reader.js")}" defer></script>\n</body>`));
    for (const p of pages) {
      let html = finish(p.url, theme.page(ctx, p));
      if (p.tool) {
        // A tool on the shared runtime gets the runtime first (both deferred, so they run in this order).
        const shared = readFileSync(join(dir, "theme", "assets", "tools", `${p.tool}.js`), "utf8").includes("EngineTool.mount(");
        const runtime = shared ? `<script src="${asset("engine-tool.js")}" defer></script>\n` : "";
        html = html.replace("</body>", `${runtime}<script src="${asset(`tools/${p.tool}.js`)}" defer></script>\n</body>`);
      }
      emit(p.url, html);
    }
    if (!ed.en) writeFileSync(join(out, "404.html"), theme.notFound(ctx));
    ed.extras = (theme.extraFiles?.(ctx) ?? []).map((e) => ({ ...e, path: ed.en && !e.path.startsWith("/en/") ? `/en${e.path}` : e.path }));
    for (const extra of ed.extras) emit(extra.path, ed.en && extra.path.endsWith("/") ? finish(extra.path, extra.content) : extra.content);
  }

  // ── Machine files ─────────────────────────────────────────────────────
  const site = primary.site;
  const articles = primary.articles;
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
  const llmsEdition = (ed) =>
    ed.categories
      .filter((c) => c.articles.length)
      .flatMap((c) => ["", `## ${c.name}`, "", ...c.articles.map((a) => `- [${a.title}](${base}${a.url}): ${a.description}`)]);
  writeFileSync(
    join(out, "llms.txt"),
    [
      `# ${site.name}${site.expansion ? ` — ${site.expansion}` : ""}`,
      "",
      `> ${site.description}`,
      "",
      `Language: ${site.lang}${second ? ` (English edition: ${base}/en/, ${second.articles.length} articles)` : ""}. ${articles.length} articles, last updated ${articles.map((a) => a.updated).sort().at(-1) || new Date().toISOString().slice(0, 10)}. Publisher: ${site.author || site.name}.`,
      ...llmsEdition(primary),
      ...(second ? ["", `# English edition — ${second.site.description}`, ...llmsEdition(second)] : []),
      "",
      "## Optional",
      "",
      ...editions.flatMap((ed) => ed.pages.map((p) => `- [${p.title || p.slug}](${base}${p.url})`)),
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
  const urls = editions.flatMap((ed) => [
    { loc: ed.home, lastmod: ed.articles[0]?.updated || todayIso },
    ...ed.categories.map((c) => ({ loc: c.url, lastmod: c.articles[0]?.updated || todayIso })),
    ...ed.articles.map((a) => ({ loc: a.url, lastmod: a.updated })),
    ...ed.pages.map((p) => ({ loc: p.url, lastmod: p.updated || todayIso })),
    // Pages a theme adds itself (an index of every guide, for instance), unless they ask not to be indexed.
    ...ed.extras
      .filter((e) => e.path.endsWith("/") && !/<meta name="robots" content="noindex/.test(String(e.content)))
      .map((e) => ({ loc: e.path, lastmod: ed.articles[0]?.updated || todayIso })),
  ]);
  // Both languages of a page are named in the sitemap too (Google's sitemap form of hreflang).
  const alt = (loc) => {
    const p = pairOf.get(loc);
    if (!p) return "";
    return [site0.lang, "en"].map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${base}${p[l]}"/>`).join("") + `<xhtml:link rel="alternate" hreflang="x-default" href="${base}${p[site0.lang]}"/>`;
  };
  writeFileSync(
    join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${second ? ` xmlns:xhtml="http://www.w3.org/1999/xhtml"` : ""}>\n` +
      urls.map((u) => `  <url><loc>${base}${u.loc}</loc><lastmod>${u.lastmod}</lastmod>${alt(u.loc)}</url>`).join("\n") +
      `\n</urlset>\n`
  );
  for (const ed of editions) {
    writeFileSync(
      join(out, ed.en ? "en" : "", "feed.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(ed.site.name)}</title><link>${base}${ed.home}</link>` +
        `<description>${esc(ed.site.description)}</description><language>${esc(ed.site.lang)}</language>\n` +
        ed.articles
          .slice(0, 30)
          .map((a) => `<item><title>${esc(a.title)}</title><link>${base}${a.url}</link><guid>${base}${a.url}</guid><pubDate>${new Date(`${a.date}T08:00:00Z`).toUTCString()}</pubDate><description>${esc(a.description)}</description></item>`)
          .join("\n") +
        `\n</channel></rss>\n`
    );
  }
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
  if (!quiet) {
    console.log(
      `${domain}: ${articles.length} articles (${total.toLocaleString("en")} words, shortest ${Math.min(...articles.map((a) => a.words))}), ` +
        `${primary.categories.length} categories, ${primary.pages.length} pages` +
        (second ? ` + English edition: ${second.articles.length} articles, ${second.pages.length} pages` : "") +
        ` → ${files.length + 1} HTML files in sites/${domain}/dist`
    );
    for (const ed of editions) if (ed.scheduled.length) console.log(`${domain}${ed.en ? " (en)" : ""}: ${ed.scheduled.length} scheduled (next ${ed.scheduled.map((x) => x.date).sort()[0]})`);
  }
  return {
    site,
    articles,
    categories: primary.categories,
    pages: primary.pages,
    out,
    scheduled: primary.scheduled,
    today: day,
    english: second ? { site: second.site, articles: second.articles, categories: second.categories, pages: second.pages, scheduled: second.scheduled, ui: uiList } : null,
    pairs: pairOf,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const domains = process.argv.slice(2);
  if (!domains.length) {
    console.error("usage: node sites/_engine/build.mjs <domain> [<domain> …]");
    process.exit(2);
  }
  for (const d of domains) await build(d);
}

/** The site's tools as a band on the home page, right under its first section, unless the theme already shows them
 *  (§22 A4, §30): a visitor and a crawler see straight away that the site has more than text. */
function toolsBand(html, ed) {
  const tools = ed.pages.filter((p) => p.tool);
  if (!tools.length || tools.some((p) => html.includes(`href="${p.url}"`))) return html;
  // A site may word the band in its own voice (site.json "toolsBand": { kicker, title, lead, open }), e.g. „du“ for „Sie“.
  const own = (!ed.en && ed.site.toolsBand) || {};
  const base = WORDS[ed.en ? "en" : ed.site.lang] || WORDS.en;
  const w = { ...base, toolsKicker: own.kicker || base.toolsKicker, toolsTitle: own.title || base.toolsTitle, toolsLead: own.lead || base.toolsLead, toolsOpen: own.open || base.toolsOpen };
  const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const band =
    `\n<section class="engine-tools-band" aria-labelledby="engine-tools-band-t">` +
    `<style>.engine-tools-band{max-width:1120px;margin:48px auto;padding:0 20px}.engine-tools-band__kicker{text-transform:uppercase;letter-spacing:.12em;font-size:.78em;font-weight:700;margin:0 0 6px;opacity:.75}` +
    `.engine-tools-band h2{margin:0 0 8px}.engine-tools-band__lead{margin:0 0 20px;opacity:.85}.engine-tools-band ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}` +
    `.engine-tools-band a{display:flex;flex-direction:column;gap:6px;height:100%;box-sizing:border-box;padding:18px;border-radius:16px;border:1px solid color-mix(in srgb,currentColor 16%,transparent);text-decoration:none;color:inherit;transition:transform .2s ease,box-shadow .2s ease}` +
    `.engine-tools-band a:hover,.engine-tools-band a:focus-visible{transform:translateY(-3px);box-shadow:0 10px 24px color-mix(in srgb,currentColor 12%,transparent)}.engine-tools-band strong{font-size:1.05em}.engine-tools-band span{font-size:.92em;opacity:.85}` +
    `.engine-tools-band em{font-style:normal;font-weight:700;font-size:.9em;margin-top:auto}@media (prefers-reduced-motion:reduce){.engine-tools-band a{transition:none}}</style>` +
    `<p class="engine-tools-band__kicker">${esc(w.toolsKicker)}</p><h2 id="engine-tools-band-t">${esc(w.toolsTitle)}</h2><p class="engine-tools-band__lead">${esc(w.toolsLead)}</p><ul>` +
    tools.map((p) => `<li><a href="${p.url}"><strong>${esc(p.short || p.title.split(":")[0])}</strong><span>${esc(p.description || "")}</span><em>${esc(w.toolsOpen)} →</em></a></li>`).join("") +
    `</ul></section>\n`;
  const main = html.search(/<main[\s>]/);
  if (main < 0) return html;
  const close = html.indexOf("</section>", main);
  const end = html.indexOf("</main>", main);
  const at = close > -1 && (end < 0 || close < end) ? close + "</section>".length : end;
  return at > -1 ? html.slice(0, at) + band + html.slice(at) : html;
}
