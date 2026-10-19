// SAVED — "The store cities of Solomon".
//
// "And all the store cities that Solomon had" (1 Kings 9:19): the granaries
// and cellars where a wise house kept its grain, oil and wine against the lean
// years. Cedar beams, wheat gold, olive green, terracotta jars and lamp light.
// The hero is a granary arcade at harvest — wheat swaying in the doorway,
// lamps breathing, jars filling one by one on the shelves and the steward's
// scale settling into balance. Every class here (granary-, jar-, ledger-,
// sheaf-) belongs to SAVED alone.

const ICONS = {
  basket: `<path d="M8 20h32l-4 20H12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M15 20l6-12M33 20l-6-12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M14 27h20M15 33h18" stroke="currentColor" stroke-width="1.8"/>`,
  lamp: `<path d="M24 6c-7 0-12 5-12 11 0 5 3 7 5 10 1 2 1 4 1 5h12c0-1 0-3 1-5 2-3 5-5 5-10 0-6-5-11-12-11z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M19 37h10M20 42h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 15v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  wrench: `<path d="M30 6a9 9 0 0 0-8 12L8 32a4 4 0 0 0 6 6l14-14a9 9 0 0 0 12-8l-5 3-5-2-1-5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
  tag: `<path d="M6 8h16l20 20-14 14L8 22z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="15" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2"/>`,
  ledger: `<rect x="9" y="6" width="30" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 6v36M20 15h13M20 22h13M20 29h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  kite: `<path d="M24 4l14 16-14 18-14-18z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 4v34M10 20h28" stroke="currentColor" stroke-width="1.6"/><path d="M24 38c-2 3 2 4 0 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.ledger}</svg>`;

/** Spain, 2026 world champions — a wax seal pressed into the steward's ledger. */
const champions = () => `<aside class="granary-seal" role="note" aria-label="Spain, 2026 World Cup champions">
  <span class="granary-seal__wax" aria-hidden="true">
    <svg viewBox="0 0 64 64" width="38" height="38" focusable="false">
      <path d="M32 3l6 5 8-1 3 7 7 3-1 8 5 6-5 6 1 8-7 3-3 7-8-1-6 5-6-5-8 1-3-7-7-3 1-8-5-6 5-6-1-8 7-3 3-7 8 1z" fill="#a8141f"/>
      <circle cx="32" cy="32" r="17" fill="none" stroke="#f3c64a" stroke-width="2"/>
      <path d="M32 20l3.6 7.6 8.2 1-6 5.8 1.6 8.2L32 38.6l-7.4 4 1.6-8.2-6-5.8 8.2-1z" fill="#f3c64a"/>
    </svg>
  </span>
  <p><strong>Spain</strong>, world champions <span class="granary-seal__year">2026</span> <span class="granary-seal__note">· sealed in the ledger of great years</span></p>
  <span class="granary-seal__ribbon" aria-hidden="true"><i></i><i></i><i></i></span>
</aside>`;

/** One clay jar on the shelf; it fills (CSS) a little after the one before it. */
const jar = (x, y, s, d, fill) => `<g class="jar" transform="translate(${x} ${y}) scale(${s})" style="--d:${d}s">
  <path d="M-10 -34h20v5c7 3 11 10 11 18 0 12-8 21-21 21s-21-9-21-21c0-8 4-15 11-18z" fill="#a4532e"/>
  <clipPath id="jarIn${x}"><path d="M-10 -29c-7 3-11 10-11 18 0 12 8 21 21 21s21-9 21-21c0-8-4-15-11-18z"/></clipPath>
  <rect class="jar__fill" clip-path="url(#jarIn${x})" x="-22" y="-30" width="44" height="42" fill="${fill}"/>
  <path d="M-10 -34h20v5c7 3 11 10 11 18 0 12-8 21-21 21s-21-9-21-21c0-8 4-15 11-18z" fill="none" stroke="#5e2a14" stroke-width="2"/>
  <path d="M-15 -14c8 4 22 4 30 0" fill="none" stroke="#e7b77c" stroke-width="1.6" opacity=".7"/>
  <rect x="-12" y="-38" width="24" height="5" rx="2" fill="#6b3a1c"/>
</g>`;

/** A sheaf of wheat that sways around its tied waist. */
const sheaf = (x, d) => `<g class="sheaf" transform="translate(${x} 318)" style="--d:${d}s">${[-16, -9, -3, 3, 9, 16]
  .map((a, i) => `<g transform="rotate(${a})"><path d="M0 0V-${70 + (i % 3) * 8}" stroke="#c99a3a" stroke-width="2"/>${Array.from({ length: 6 }, (_, k) => `<ellipse cx="${k % 2 ? 3 : -3}" cy="-${58 + (i % 3) * 8 + k * 4}" rx="2.4" ry="4.4" fill="#e9bf52" transform="rotate(${k % 2 ? 25 : -25} ${k % 2 ? 3 : -3} -${58 + (i % 3) * 8 + k * 4})"/>`).join("")}</g>`)
  .join("")}<path d="M-8 -26h16" stroke="#7a4b1f" stroke-width="4" stroke-linecap="round"/></g>`;

/**
 * The granary arcade at harvest: three cedar arches, shelves of jars that fill
 * one after another, sheaves in the doorway, hanging lamps that breathe and the
 * steward's balance settling level.
 */
const storehouse = () => `<svg class="granary-scene" viewBox="0 0 600 400" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="grSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2618"/><stop offset=".55" stop-color="#7b4a26"/><stop offset="1" stop-color="#e9a44f"/></linearGradient>
    <linearGradient id="grWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2e3c4"/><stop offset="1" stop-color="#d8bd8c"/></linearGradient>
    <linearGradient id="grCedar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2c19"/><stop offset=".5" stop-color="#6e4224"/><stop offset="1" stop-color="#4a2c19"/></linearGradient>
    <radialGradient id="grGlow"><stop offset="0" stop-color="#ffdf8a" stop-opacity=".9"/><stop offset="1" stop-color="#ffdf8a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="600" height="400" fill="url(#grWall)"/>
  ${[60, 240, 420]
    .map(
      (x) => `<path d="M${x} 330V150a60 60 0 0 1 120 0v180z" fill="url(#grSky)"/><path d="M${x} 330V150a60 60 0 0 1 120 0v180" fill="none" stroke="#8a5a32" stroke-width="6"/><circle class="granary-scene__sun" cx="${x + 60}" cy="250" r="26" fill="#ffd27a" opacity=".85"/>`
    )
    .join("")}
  <rect x="0" y="40" width="600" height="18" fill="url(#grCedar)"/>
  ${[30, 210, 390, 570].map((x) => `<rect x="${x - 10}" y="58" width="20" height="272" fill="url(#grCedar)"/>`).join("")}
  ${[120, 300, 480]
    .map((x, i) => `<g class="granary-scene__lamp" style="--d:${i * 0.8}s"><path d="M${x} 58v34" stroke="#3b2414" stroke-width="2"/><circle cx="${x}" cy="104" r="34" fill="url(#grGlow)"/><path d="M${x - 9} 92h18l-3 16h-12z" fill="#8a5a32"/><path d="M${x} 96c3 4 3 7 0 9-3-2-3-5 0-9z" fill="#ffd36a"/></g>`)
    .join("")}
  <rect x="0" y="330" width="600" height="70" fill="#7a4b2a"/>
  <rect x="0" y="330" width="600" height="8" fill="#5a341c"/>
  <g class="granary-scene__shelf"><rect x="186" y="214" width="46" height="6" fill="#5a341c"/><rect x="368" y="214" width="46" height="6" fill="#5a341c"/></g>
  ${jar(209, 210, 0.62, 0.2, "#d9a441")}${jar(391, 210, 0.62, 1.1, "#7f8c3a")}
  ${jar(30, 372, 0.95, 0.6, "#e0b04d")}${jar(560, 372, 0.95, 1.6, "#8b9a44")}${jar(512, 378, 0.7, 2.2, "#b8452f")}
  ${sheaf(98, 0)}${sheaf(140, 0.6)}${sheaf(462, 0.3)}
  <g class="granary-scene__scale" transform="translate(300 300)">
    <path d="M0 0v-62M-24 4h48" stroke="#3b2414" stroke-width="4" stroke-linecap="round"/>
    <g class="granary-scene__beam"><path d="M-54 -60h108" stroke="#3b2414" stroke-width="4" stroke-linecap="round"/>
      <path d="M-54 -60l-14 30h28zM54 -60l-14 30h28z" fill="none" stroke="#3b2414" stroke-width="1.6"/>
      <path d="M-70 -30a16 6 0 0 0 32 0z" fill="#c99a3a"/><path d="M38 -30a16 6 0 0 0 32 0z" fill="#c99a3a"/>
      <circle cx="-58" cy="-36" r="4" fill="#e9bf52"/><circle cx="-50" cy="-36" r="4" fill="#e9bf52"/><ellipse cx="54" cy="-37" rx="9" ry="4" fill="#d9a441"/></g>
    <circle cx="0" cy="-62" r="5" fill="#e9bf52" stroke="#3b2414" stroke-width="2"/>
  </g>
</svg>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="granary granary--${kind}">
<a class="granary-skip" href="#main">Skip to content</a>
<div class="granary-progress" aria-hidden="true"><span></span></div>
${champions()}
<header class="granary-head">
  <div class="granary-head__beam" aria-hidden="true"></div>
  <div class="granary-head__in">
    <a class="granary-mark" href="/" aria-label="${esc(site.name)} — home">
      <span class="granary-mark__jar" aria-hidden="true"><svg viewBox="0 0 40 48" width="34" height="40"><path d="M14 4h12v4c6 3 9 9 9 16 0 11-7 20-15 20S5 35 5 24c0-7 3-13 9-16z" fill="currentColor"/><path d="M11 22c5 3 13 3 18 0" fill="none" stroke="#f3c64a" stroke-width="2"/></svg></span>
      <span class="granary-mark__word">SAVED</span>
      <span class="granary-mark__long">${esc(site.expansion)}</span>
    </a>
    <button class="granary-toggle" type="button" aria-expanded="false" aria-controls="granary-nav"><span class="granary-toggle__bars" aria-hidden="true"></span>Topics</button>
    <nav id="granary-nav" class="granary-nav" aria-label="Topics">
      <a class="granary-nav__item" href="/">Home</a>
      ${categories.map((c) => `<a class="granary-nav__item" href="${c.url}">${icon(c.icon, "granary-nav__icon")}<span>${esc(c.name)}</span></a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="granary-nav__item granary-nav__item--quiet" href="${m.href}"><span>${esc(m.label)}</span></a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="granary-foot">
  <div class="granary-foot__arches" aria-hidden="true"></div>
  <div class="granary-foot__in">
    <section class="granary-foot__brand">
      <p class="granary-foot__word">SAVED</p>
      <p class="granary-foot__long">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Topics">
      <p class="granary-foot__title">The storerooms</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="About SAVED">
      <p class="granary-foot__title">The house</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="granary-foot__note">© ${new Date().getFullYear()} SAVED · ${esc(site.domain)} · General information for households, not personal financial, legal or professional advice.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A ledger card: the topic tab, the title, the summary, the reading time. */
const card = (ctx, a, extra = "") => `<article class="ledger-card ${extra}">
  <a class="ledger-card__link" href="${a.url}">
    <span class="ledger-card__tab">${icon(a.cat.icon, "ledger-card__icon")}<span>${ctx.esc(a.cat.name)}</span></span>
    <h3 class="ledger-card__title">${ctx.esc(a.title)}</h3>
    <p class="ledger-card__sum">${ctx.esc(a.description)}</p>
    <span class="ledger-card__foot"><span>${a.minutes} min read</span><span class="ledger-card__arrow" aria-hidden="true">→</span></span>
  </a>
</article>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const featured = first
    ? `<div class="granary-hero__picks">${card(ctx, first, "ledger-card--big")}${second || third ? `<div class="granary-hero__pair">${[second, third].filter(Boolean).map((a) => card(ctx, a)).join("")}</div>` : ""}</div>`
    : `<div class="granary-hero__picks"><p class="granary-hero__soon">The first guides are being written by hand. Come back soon.</p></div>`;
  const body = `
<section class="granary-hero">
  <div class="granary-hero__in">
    <div class="granary-hero__text">
      <p class="granary-hero__kicker">A household guide to spending wisely</p>
      <h1 class="granary-hero__title">Fill the storeroom, <span>not the bin</span></h1>
      <p class="granary-hero__lead">${esc(site.tagline)}.</p>
      <p class="granary-hero__intro">${esc(site.description)}</p>
      <p class="granary-hero__buttons">${first ? `<a class="granary-button" href="${first.url}">Start reading</a>` : ""}<a class="granary-button granary-button--line" href="/about/">How we write</a></p>
    </div>
    <figure class="granary-hero__art">${storehouse()}</figure>
  </div>
  ${featured}
</section>

<section class="granary-rooms" aria-labelledby="rooms-t">
  <header class="granary-heading"><p class="granary-heading__kicker">Six storerooms</p><h2 id="rooms-t">Where would you like to save today?</h2></header>
  <ul class="granary-rooms__grid">
    ${categories.map((c) => `<li><a class="granary-room" href="${c.url}">
      <span class="granary-room__arch" aria-hidden="true">${icon(c.icon, "granary-room__icon")}</span>
      <span class="granary-room__name">${esc(c.name)}</span>
      <span class="granary-room__desc">${esc(c.description)}</span>
      <span class="granary-room__count">${c.articles.length} guides</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${rest.length ? `<section class="granary-latest" aria-labelledby="latest-t">
  <header class="granary-heading"><p class="granary-heading__kicker">Fresh from the storeroom</p><h2 id="latest-t">Latest guides</h2></header>
  <div class="granary-latest__grid">
    ${rest.slice(0, 12).map((a) => card(ctx, a)).join("\n    ")}
  </div>
</section>` : ""}

<section class="granary-index" aria-labelledby="index-t">
  <header class="granary-heading granary-heading--light"><p class="granary-heading__kicker">The full inventory</p><h2 id="index-t">Every guide, room by room</h2></header>
  <div class="granary-index__cols">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "granary-index__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `SAVED — ${site.expansion}`, description: site.description, path: "/" }, body, "home");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="granary-room-head">
  <div class="granary-room-head__in">
    <nav class="granary-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <span>${esc(c.name)}</span></nav>
    <span class="granary-room-head__arch">${icon(c.icon, "granary-room-head__icon")}</span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="granary-room-head__count">${c.articles.length} guides</p>
  </div>
</header>
<section class="granary-latest granary-latest--room"><div class="granary-latest__grid">
  ${c.articles.map((a) => card(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: practical guides to spending less`,
      description: `${c.description} ${c.articles.length} guides from ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Home", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "room"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="granary-guide">
  <header class="granary-guide__head">
    <nav class="granary-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="granary-guide__title">${esc(a.title)}</h1>
    <p class="granary-guide__lead">${esc(a.description)}</p>
    <p class="granary-guide__meta"><span>${esc(site.author)}</span><span><time datetime="${a.date}">${a.dateLabel}</time></span><span>${a.minutes} min read</span></p>
  </header>
  <div class="granary-guide__body">
    <aside class="granary-tally" aria-label="In this guide">
      <p class="granary-tally__title">Tally sheet</p>
      <dl>
        <div><dt>Storeroom</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Reading</dt><dd>${a.minutes} minutes</dd></div>
        <div><dt>Updated</dt><dd><time datetime="${a.updated}">${a.updatedLabel}</time></dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="granary-tally__title granary-tally__title--b">In this guide</p><ol class="granary-tally__steps">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="granary-prose">
${a.html}
      <aside class="granary-note"><p><strong>Good to know.</strong> Prices, tariffs and consumer rules differ by country and change over time. Use these guides as general information, check current local rules, and ask a qualified professional before decisions about debt, tax, electrical or gas work.</p></aside>
    </div>
  </div>
</article>
<section class="granary-latest granary-latest--next" aria-labelledby="next-t">
  <header class="granary-heading"><p class="granary-heading__kicker">Keep reading</p><h2 id="next-t">Related guides</h2></header>
  <div class="granary-latest__grid">${a.related.map((r) => card(ctx, r)).join("")}</div>
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
    "guide"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="granary-guide granary-guide--page">
  <header class="granary-guide__head">
    <nav class="granary-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <span>${esc(p.title)}</span></nav>
    <h1 class="granary-guide__title">${esc(p.title)}</h1>
    ${p.updated ? `<p class="granary-guide__lead">Last reviewed: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="granary-guide__body granary-guide__body--single"><div class="granary-prose">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Home", path: "/" }, { name: p.title, path: p.url }])] }, body, "page");
}

export function notFound(ctx) {
  const body = `
<section class="granary-empty">
  <p class="granary-empty__code">404</p>
  <h1>This shelf is empty</h1>
  <p>The link may be old or mistyped. Pick a storeroom to keep going:</p>
  <ul class="granary-rooms__grid">${ctx.categories.map((c) => `<li><a class="granary-room" href="${c.url}"><span class="granary-room__arch">${icon(c.icon, "granary-room__icon")}</span><span class="granary-room__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Page not found", description: "The page you were looking for is not on SAVED.", path: "/404.html", noindex: true }, body, "empty");
}
