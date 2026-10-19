// CRONE — "The hall of glass".
//
// When the Queen of Sheba came to Solomon she was shown into a hall whose
// floor was glass laid over water, so clear that she lifted her hem (an-Naml
// 27:44). A wise woman, tested and testing, at ease in the grandest room in the
// world: that is the spirit of CRONE. Deep plum night, amethyst, rose gold,
// pearl and sage. The hero is the hall itself — slender arches, lanterns
// swinging gently, the moon in a high window, and the glass floor rippling
// with reflected light. No figures, only architecture, water and light. Every
// class here (sheba-, glass-, folio-) is CRONE's own.

const ICONS = {
  mirror: `<ellipse cx="24" cy="19" rx="11" ry="14" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 33v9M17 42h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M19 13c2-3 5-4 8-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  hanger: `<path d="M24 14a4 4 0 1 1 4-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 14v4L6 32a2 2 0 0 0 1 4h34a2 2 0 0 0 1-4L24 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
  path: `<path d="M10 42c4-10 22-6 24-16S20 14 24 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="40" r="2.4" fill="currentColor"/><circle cx="33" cy="24" r="2.4" fill="currentColor"/><circle cx="24" cy="7" r="2.4" fill="currentColor"/>`,
  pot: `<path d="M12 28h24l-3 14H15z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 28V14M24 20c-6 0-9-4-9-9 6 0 9 4 9 9zM24 17c5 0 8-3 8-8-5 0-8 3-8 8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  lantern: `<path d="M18 10h12l4 6v18l-4 6H18l-4-6V16z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 4v6M14 16h20M14 34h20" stroke="currentColor" stroke-width="2"/><path d="M24 20c3 4 3 7 0 9-3-2-3-5 0-9z" fill="currentColor"/>`,
  compass: `<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M30 18l-4 10-10 4 4-10z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="24" r="1.8" fill="currentColor"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.lantern}</svg>`;

/** Spain, 2026 world champions — a rose-gold medallion turning on a ribbon. */
const champions = () => `<aside class="sheba-medal" role="note" aria-label="Spain, 2026 World Cup champions">
  <span class="sheba-medal__coin" aria-hidden="true">
    <svg viewBox="0 0 60 60" width="34" height="34" focusable="false">
      <defs><linearGradient id="shebaGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0c2"/><stop offset=".5" stop-color="#e2b45a"/><stop offset="1" stop-color="#9c6a28"/></linearGradient></defs>
      <circle cx="30" cy="30" r="27" fill="url(#shebaGold)" stroke="#c60b1e" stroke-width="3"/>
      <path d="M21 17h18v8c0 7-4 12-9 13-5-1-9-6-9-13z" fill="#c60b1e"/><path d="M27 38h6v6h-6zM22 46h16v3H22z" fill="#c60b1e"/>
      <path d="M21 20h-5c0 5 2 8 6 8M39 20h5c0 5-2 8-6 8" fill="none" stroke="#c60b1e" stroke-width="2"/>
    </svg>
  </span>
  <p><strong>Spain</strong> — world champions <em>2026</em> <span class="sheba-medal__aside">· a toast from the hall of glass</span></p>
  <span class="sheba-medal__ribbon" aria-hidden="true"></span>
</aside>`;

/** One slender arch of the hall, with a lantern swinging from its keystone. */
const arch = (x, w, d) => `<g class="glass-arch">
  <path d="M${x} 300V${170}a${w / 2} ${w / 1.6} 0 0 1 ${w} 0V300" fill="none" stroke="#d9a38b" stroke-width="3"/>
  <path d="M${x + 8} 300V${172}a${w / 2 - 8} ${w / 1.6 - 8} 0 0 1 ${w - 16} 0V300" fill="none" stroke="#7d5a8c" stroke-width="1.2" opacity=".7"/>
  <g class="glass-lantern" style="--d:${d}s;transform-origin:${x + w / 2}px 120px"><path d="M${x + w / 2} 120v36" stroke="#d9a38b" stroke-width="1.4"/>
    <circle cx="${x + w / 2}" cy="${170}" r="26" fill="url(#glassGlow)"/>
    <path d="M${x + w / 2 - 8} 156h16l4 8v12l-4 6h-16l-4-6v-12z" fill="#3a1f44" stroke="#e2b45a" stroke-width="1.4"/>
    <path d="M${x + w / 2} 162c3 4 3 8 0 10-3-2-3-6 0-10z" fill="#ffd98a"/></g>
</g>`;

/**
 * The hall of glass: arches and lanterns, the moon in a high round window,
 * stars beyond, and the floor of glass over water rippling with reflections.
 */
const hall = () => `<svg class="glass-scene" viewBox="0 0 600 420" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="glassNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b0e22"/><stop offset=".7" stop-color="#3a1f44"/><stop offset="1" stop-color="#5b3463"/></linearGradient>
    <radialGradient id="glassGlow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="glassWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f8fa6"/><stop offset="1" stop-color="#2a3d52"/></linearGradient>
    <radialGradient id="glassMoon" cx=".4" cy=".4"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e9dccb"/></radialGradient>
    <clipPath id="glassWindow"><circle cx="300" cy="78" r="44"/></clipPath>
  </defs>
  <rect width="600" height="420" fill="url(#glassNight)"/>
  <g class="glass-stars" fill="#f7efe6">${Array.from({ length: 26 }, (_, i) => `<circle style="--d:${((i * 0.41) % 3).toFixed(2)}s" cx="${(i * 97) % 580 + 10}" cy="${(i * 53) % 120 + 8}" r="${(0.6 + (i % 3) * 0.4).toFixed(2)}"/>`).join("")}</g>
  <circle cx="300" cy="78" r="48" fill="none" stroke="#d9a38b" stroke-width="3"/>
  <g clip-path="url(#glassWindow)"><rect x="250" y="30" width="100" height="100" fill="#24122c"/><circle class="glass-moon" cx="318" cy="70" r="20" fill="url(#glassMoon)"/></g>
  <path d="M256 78h88M300 34v88" stroke="#d9a38b" stroke-width="1.4" opacity=".6"/>
  ${arch(40, 120, 0)}${arch(240, 120, 0.7)}${arch(440, 120, 1.4)}
  <rect x="0" y="300" width="600" height="120" fill="url(#glassWater)"/>
  <g class="glass-floor" stroke="#cfe4ee" stroke-width="1.2" fill="none" opacity=".55">
    ${Array.from({ length: 9 }, (_, i) => `<path style="--d:${(i * 0.45).toFixed(2)}s" d="M${-40 + i * 8} ${312 + i * 12}c60 -6 120 6 180 0s120 -6 180 0 120 6 180 0 120 -6 180 0"/>`).join("")}
  </g>
  <g class="glass-reflect" opacity=".5">${[100, 300, 500].map((x, i) => `<ellipse style="--d:${i * 0.6}s" cx="${x}" cy="346" rx="20" ry="5" fill="#ffd98a"/>`).join("")}</g>
  <path d="M0 300h600" stroke="#d9a38b" stroke-width="3"/>
  <g stroke="#e9dccb" stroke-width=".8" opacity=".3">${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 50} 300L${i * 50 - 60 + i * 10} 420"/>`).join("")}</g>
</svg>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="sheba sheba--${kind}">
<a class="sheba-skip" href="#main">Skip to content</a>
<div class="sheba-thread" aria-hidden="true"><span></span></div>
${champions()}
<header class="sheba-head">
  <div class="sheba-head__in">
    <a class="sheba-mark" href="/" aria-label="${esc(site.name)} — home">
      <span class="sheba-mark__ring" aria-hidden="true"><svg viewBox="0 0 44 44" width="40" height="40"><circle cx="22" cy="22" r="19" fill="none" stroke="currentColor" stroke-width="2"/><path d="M28 10a13 13 0 1 0 0 24 10 10 0 1 1 0-24z" fill="currentColor"/></svg></span>
      <span class="sheba-mark__word">CRONE</span>
      <span class="sheba-mark__long">${esc(site.expansion)}</span>
    </a>
    <button class="sheba-toggle" type="button" aria-expanded="false" aria-controls="sheba-nav">Chapters <span class="sheba-toggle__dot" aria-hidden="true"></span></button>
    <nav id="sheba-nav" class="sheba-nav" aria-label="Chapters">
      <a class="sheba-nav__item" href="/">Home</a>
      ${categories.map((c) => `<a class="sheba-nav__item" href="${c.url}">${esc(c.name)}</a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="sheba-nav__item sheba-nav__item--soft" href="${m.href}">${esc(m.label)}</a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="sheba-foot">
  <div class="sheba-foot__in">
    <section class="sheba-foot__brand">
      <p class="sheba-foot__word">CRONE</p>
      <p class="sheba-foot__long">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Chapters">
      <p class="sheba-foot__title">Chapters</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="About CRONE">
      <p class="sheba-foot__title">The house</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="sheba-foot__note">© ${new Date().getFullYear()} CRONE · ${esc(site.domain)} · Lifestyle information for adults. Not medical advice: for health questions, speak to your doctor.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A folio card: chapter ribbon, title, summary and reading time. */
const folio = (ctx, a, extra = "") => `<article class="folio ${extra}">
  <a class="folio__link" href="${a.url}">
    <span class="folio__ribbon">${icon(a.cat.icon, "folio__icon")}${ctx.esc(a.cat.name)}</span>
    <h3 class="folio__title">${ctx.esc(a.title)}</h3>
    <p class="folio__sum">${ctx.esc(a.description)}</p>
    <span class="folio__foot">${a.minutes} minute read <span class="folio__arrow" aria-hidden="true">⟶</span></span>
  </a>
</article>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="sheba-hero">
  <figure class="sheba-hero__art">${hall()}</figure>
  <div class="sheba-hero__text">
    <p class="sheba-hero__kicker">A magazine for women over fifty</p>
    <h1 class="sheba-hero__title">Wiser, bolder, <em>more yourself</em></h1>
    <p class="sheba-hero__lead">${esc(site.tagline)}.</p>
    <p class="sheba-hero__intro">${esc(site.description)}</p>
    <p class="sheba-hero__buttons">${first ? `<a class="sheba-button" href="${first.url}">Begin reading</a>` : ""}<a class="sheba-button sheba-button--ghost" href="/about/">Our promise</a></p>
  </div>
</section>

${first ? `<section class="sheba-picks" aria-label="Featured">
  ${folio(ctx, first, "folio--wide")}
  ${[second, third].filter(Boolean).map((a) => folio(ctx, a)).join("")}
</section>` : `<p class="sheba-soon">Our first stories are being written by hand. Come back soon.</p>`}

<section class="sheba-chapters" aria-labelledby="ch-t">
  <header class="sheba-heading"><p class="sheba-heading__kicker">Six chapters</p><h2 id="ch-t">Where shall we wander today?</h2></header>
  <ul class="sheba-chapters__grid">
    ${categories.map((c, i) => `<li><a class="sheba-chapter" href="${c.url}">
      <span class="sheba-chapter__num">${["I", "II", "III", "IV", "V", "VI"][i] || i + 1}</span>
      <span class="sheba-chapter__icon">${icon(c.icon)}</span>
      <span class="sheba-chapter__name">${esc(c.name)}</span>
      <span class="sheba-chapter__desc">${esc(c.description)}</span>
      <span class="sheba-chapter__count">${c.articles.length} stories</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${rest.length ? `<section class="sheba-latest" aria-labelledby="new-t">
  <header class="sheba-heading"><p class="sheba-heading__kicker">New in the journal</p><h2 id="new-t">Latest stories</h2></header>
  <div class="sheba-latest__grid">${rest.slice(0, 12).map((a) => folio(ctx, a)).join("\n    ")}</div>
</section>` : ""}

<section class="sheba-library" aria-labelledby="lib-t">
  <header class="sheba-heading sheba-heading--night"><p class="sheba-heading__kicker">The whole library</p><h2 id="lib-t">Every story, chapter by chapter</h2></header>
  <div class="sheba-library__cols">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `CRONE — ${site.tagline}`, description: site.description, path: "/" }, body, "home");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="sheba-chapter-head">
  <nav class="sheba-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
  <span class="sheba-chapter-head__icon">${icon(c.icon)}</span>
  <h1>${esc(c.name)}</h1>
  <p>${esc(c.description)}</p>
  <p class="sheba-chapter-head__count">${c.articles.length} stories in this chapter</p>
</header>
<section class="sheba-latest sheba-latest--chapter"><div class="sheba-latest__grid">
  ${c.articles.map((a) => folio(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: stories and guides for women over 50`,
      description: `${c.description} ${c.articles.length} stories from ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Home", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "chapter"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="sheba-story">
  <header class="sheba-story__head">
    <nav class="sheba-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="sheba-story__title">${esc(a.title)}</h1>
    <p class="sheba-story__lead">${esc(a.description)}</p>
    <p class="sheba-story__meta">By ${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} minute read</p>
  </header>
  <div class="sheba-story__body">
    ${toc.length > 2 ? `<nav class="sheba-contents" aria-label="In this story"><p class="sheba-contents__title">In this story</p><ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol></nav>` : ""}
    <div class="sheba-prose">
${a.html}
      <aside class="sheba-note"><p><strong>A gentle note.</strong> CRONE shares general lifestyle information, not medical advice. If you have a health condition, take medication, or notice new pain, dizziness or changes in your skin, eyes or body, please speak to your doctor or pharmacist before changing your routine.</p></aside>
    </div>
  </div>
</article>
<section class="sheba-latest sheba-latest--next" aria-labelledby="more-t">
  <header class="sheba-heading"><p class="sheba-heading__kicker">Keep wandering</p><h2 id="more-t">You may also enjoy</h2></header>
  <div class="sheba-latest__grid">${a.related.map((r) => folio(ctx, r)).join("")}</div>
</section>`;
  return layout(
    ctx,
    {
      title: a.title,
      description: a.description,
      path: a.url,
      type: "article",
      jsonld: [
        ctx.crumbs([{ name: "Home", path: "/" }, { name: a.cat.name, path: a.cat.url }, { name: a.title, path: a.url }]),
        {
          "@type": "Article",
          headline: a.title,
          description: a.description,
          datePublished: a.date,
          dateModified: a.updated,
          inLanguage: site.lang,
          wordCount: a.words,
          articleSection: a.cat.name,
          author: { "@type": "Organization", name: site.author, url: `${base}/about/` },
          publisher: { "@id": `${base}/#org` },
          mainEntityOfPage: `${base}${a.url}`,
        },
      ],
    },
    body,
    "story"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="sheba-story sheba-story--page">
  <header class="sheba-story__head">
    <nav class="sheba-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="sheba-story__title">${esc(p.title)}</h1>
    ${p.updated ? `<p class="sheba-story__meta">Last reviewed ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="sheba-story__body sheba-story__body--single"><div class="sheba-prose">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Home", path: "/" }, { name: p.title, path: p.url }])] }, body, "page");
}

export function notFound(ctx) {
  const body = `
<section class="sheba-lost">
  <p class="sheba-lost__code">404</p>
  <h1>This door opens onto still water</h1>
  <p>The page you wanted is not here. Perhaps one of our chapters will do:</p>
  <ul class="sheba-chapters__grid">${ctx.categories.map((c) => `<li><a class="sheba-chapter" href="${c.url}"><span class="sheba-chapter__icon">${icon(c.icon)}</span><span class="sheba-chapter__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Page not found", description: "The page you were looking for is not on CRONE.", path: "/404.html", noindex: true }, body, "lost");
}
