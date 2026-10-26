// XDAILY — "The circuits".
//
// "The sun rises and the sun goes down, and hurries back to where it rises.
// The wind blows to the south and goes around to the north; round and round
// goes the wind, and on its circuits the wind returns. All streams run to the
// sea, but the sea is not full; to the place where the streams flow, there
// they flow again" (Ecclesiastes 1:5–7). XDAILY is a palace observatory at
// dusk, seen through a brass porthole: the sun travelling its arc, a wind
// gyre turning in the sky, a river running from the mountains to the sea and
// clouds carrying the water back, and an armillary sphere turning on the
// terrace. No people, only sky, water, stone and instruments. Every class
// here (orbit-, gyre-, vane-) is XDAILY's own.

const ICONS = {
  planet: `<circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" stroke-width="2.4"/><ellipse cx="24" cy="24" rx="20" ry="7" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(-20 24 24)"/><circle cx="40" cy="12" r="2" fill="currentColor"/>`,
  globe: `<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M7 24h34M24 7c-6 5-8 11-8 17s2 12 8 17c6-5 8-11 8-17s-2-12-8-17z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 15c4 2 9 3 14 3s10-1 14-3M10 33c4-2 9-3 14-3s10 1 14 3" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
  gear: `<circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.3 11.3l4.2 4.2M32.5 32.5l4.2 4.2M11.3 36.7l4.2-4.2M32.5 15.5l4.2-4.2" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="12.5" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
  heart: `<path d="M24 40C12 32 6 25 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 8-6 15-18 23z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M9 24h8l3-6 4 11 3-7h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`,
  atom: `<circle cx="24" cy="24" r="3" fill="currentColor"/><ellipse cx="24" cy="24" rx="18" ry="7" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="24" rx="18" ry="7" fill="none" stroke="currentColor" stroke-width="2.2" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="18" ry="7" fill="none" stroke="currentColor" stroke-width="2.2" transform="rotate(-60 24 24)"/>`,
  bulb: `<path d="M17 30c-4-3-6-7-6-11a13 13 0 0 1 26 0c0 4-2 8-6 11v4H17z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 38h12M20 42h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 14v8M20 18l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.planet}</svg>`;

/** An armillary sphere: three brass rings that turn around a small globe. */
const armillary = (x, y, r) => `<g transform="translate(${x} ${y})">
  <path d="M-4 ${r + 4}l-10 ${r * 0.9}h28l-10 ${-r * 0.9}z" fill="#8a5a2e"/>
  <g class="orbit-armillar" fill="none" stroke="#e0a45c" stroke-width="2.2">
    <circle r="${r}"/>
    <ellipse rx="${r}" ry="${r * 0.36}" transform="rotate(-23)"/>
    <ellipse class="orbit-armillar__ring" rx="${r * 0.36}" ry="${r}"/>
  </g>
  <circle r="${r * 0.28}" fill="#7fd3e6"/>
  <path d="M${-r * 1.15} ${r * 0.45}L${r * 1.15} ${-r * 0.45}" stroke="#c98b4b" stroke-width="1.6"/>
</g>`;

/**
 * The hero: the three circuits of Ecclesiastes 1 at dusk. The sun runs its
 * arc, a wind gyre turns in the sky, the river runs from the mountains to the
 * sea and the clouds carry the water back over the peaks; an observatory and
 * an armillary sphere stand on the terrace.
 */
const circuits = () => `<svg class="vane-szene" viewBox="0 0 520 520" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="vaneHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a30"/><stop offset=".45" stop-color="#16395a"/><stop offset=".72" stop-color="#3f7c8f"/><stop offset=".9" stop-color="#e3a46a"/><stop offset="1" stop-color="#f5c87c"/></linearGradient>
    <radialGradient id="vaneSonne"><stop offset="0" stop-color="#fff6d6"/><stop offset=".5" stop-color="#f5c04a"/><stop offset="1" stop-color="#f5c04a" stop-opacity="0"/></radialGradient>
    <linearGradient id="vaneMeer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a8a9a"/><stop offset="1" stop-color="#0e3550"/></linearGradient>
    <path id="vaneBogen" d="M40 330C70 110 450 110 480 330"/>
  </defs>
  <rect width="520" height="520" fill="url(#vaneHimmel)"/>
  <g class="vane-sterne" fill="#eaf6ff">${Array.from({ length: 28 }, (_, i) => `<circle style="--d:${(i % 8) * 0.5}s" cx="${(i * 73 + 21) % 520}" cy="${10 + ((i * 41) % 170)}" r="${i % 5 === 0 ? 1.5 : 0.9}"/>`).join("")}</g>
  <use href="#vaneBogen" fill="none" stroke="#e0a45c" stroke-width="1.6" stroke-dasharray="2 8" opacity=".7"/>
  <g class="vane-sonne"><circle r="34" fill="url(#vaneSonne)"/><circle r="12" fill="#ffe7a0"/><animateMotion dur="26s" repeatCount="indefinite" calcMode="paced"><mpath href="#vaneBogen"/></animateMotion></g>
  <g class="gyre-wind" fill="none" stroke="#bfe8f2" stroke-width="2" stroke-linecap="round" opacity=".55">
    <path d="M150 170c40-40 180-40 220 0" stroke-dasharray="10 9"/><path d="M370 170l-12-3 4 11z" fill="#bfe8f2" stroke="none"/>
    <path d="M370 200c-40 40-180 40-220 0" stroke-dasharray="10 9"/><path d="M150 200l12 3-4-11z" fill="#bfe8f2" stroke="none"/>
  </g>
  <g class="vane-wolken" fill="#f4fbff">
    <g class="vane-wolke" style="--d:0s"><ellipse cx="400" cy="250" rx="34" ry="13"/><ellipse cx="420" cy="242" rx="20" ry="12"/><ellipse cx="386" cy="243" rx="16" ry="10"/></g>
    <g class="vane-wolke" style="--d:-9s"><ellipse cx="400" cy="250" rx="28" ry="11"/><ellipse cx="414" cy="243" rx="16" ry="10"/></g>
  </g>
  <g class="vane-regen" stroke="#bfe8f2" stroke-width="1.6" stroke-linecap="round" opacity=".7">${[0, 1, 2, 3, 4].map((i) => `<path style="--d:${i * 0.25}s" d="M${82 + i * 10} 262l-4 12"/>`).join("")}</g>
  <path d="M0 360L50 270l30 34 34-60 46 70 28-26 40 82z" fill="#1d4a52"/>
  <path d="M50 270l-12 22 14-6zM114 244l-12 26 14-8z" fill="#e8f5f5" opacity=".9"/>
  <path d="M0 360h520v160H0z" fill="#25523f"/>
  <path d="M290 372c60 0 140-6 230-14v162H330c-40-70-60-110-40-148z" fill="url(#vaneMeer)"/>
  <g class="vane-wellen" fill="none" stroke="#bfe8f2" stroke-width="1.6" stroke-linecap="round" opacity=".6">${[0, 1, 2].map((i) => `<path style="--d:${i * 0.8}s" d="M${340 + i * 30} ${400 + i * 34}q12-6 24 0t24 0t24 0"/>`).join("")}</g>
  <path d="M150 300c10 20 40 30 60 50s30 50 80 60 70 20 90 24" fill="none" stroke="#7fd3e6" stroke-width="9" stroke-linecap="round" opacity=".35"/>
  <path class="vane-fluss" d="M150 300c10 20 40 30 60 50s30 50 80 60 70 20 90 24" fill="none" stroke="#bfe8f2" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3 10"/>
  <g transform="translate(398 320)">
    <path d="M-50 40V8h100v32z" fill="#e9dcc2"/>
    <path d="M-34 8a34 30 0 0 1 68 0z" fill="#c98b4b"/>
    <path class="orbit-spalt" d="M-3 -21h6v29h-6z" fill="#0b1a30"/>
    <path d="M-50 8h100" stroke="#a36a34" stroke-width="3"/>
    ${[-36, -18, 0, 18, 36].map((x) => `<path d="M${x - 5} 40v-18a5 5 0 0 1 10 0v18z" fill="#173452"/>`).join("")}
  </g>
  ${armillary(250, 410, 30)}
</svg>`;

/** Spain, 2026 world champions — a red-gold comet crosses the ribbon. */
const champions = () => `<aside class="orbit-champions" role="note" aria-label="Spain, 2026 world champions">
  <p><strong>Spain</strong> are the <em>2026</em> World Cup champions <span class="orbit-champions__aside">· congratulations from the observatory</span></p>
  <span class="orbit-champions__comet" aria-hidden="true"></span>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="orbit orbit--${kind}">
<a class="orbit-skip" href="#main">Skip to content</a>
${champions()}
<header class="orbit-head">
  <div class="orbit-head__in">
    <a class="orbit-brand" href="/" aria-label="${esc(site.name)} – home">
      <span class="orbit-brand__mark" aria-hidden="true"><svg viewBox="0 0 44 44" width="40" height="40"><circle cx="22" cy="22" r="7" fill="#f5c04a"/><g class="orbit-brand__ring"><ellipse cx="22" cy="22" rx="19" ry="8" fill="none" stroke="#7fd3e6" stroke-width="2" transform="rotate(-24 22 22)"/><circle cx="39" cy="14" r="2.6" fill="#e0a45c"/></g></svg></span>
      <span class="orbit-brand__word">XDAILY</span>
      <span class="orbit-brand__sub">${esc(site.expansion)}</span>
    </a>
    <nav class="orbit-service" aria-label="About XDAILY">${site.menu.map((m) => `<a href="${m.href}"${m.promo ? " data-promo" : ""}>${esc(m.label)}</a>`).join("")}</nav>
    <button class="orbit-toggle" type="button" aria-expanded="false" aria-controls="orbit-nav">Menu <span class="orbit-toggle__dot" aria-hidden="true"></span></button>
  </div>
  <nav id="orbit-nav" class="orbit-nav" aria-label="Fields">
    <div class="orbit-nav__in">
      <a class="orbit-nav__item" href="/">Home</a>
      ${categories.map((c) => `<a class="orbit-nav__item" href="${c.url}">${icon(c.icon, "orbit-nav__icon")}${esc(c.name)}</a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="orbit-nav__item orbit-nav__item--mobile" href="${m.href}"${m.promo ? " data-promo" : ""}>${esc(m.label)}</a>`).join("\n      ")}
    </div>
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="orbit-foot">
  <svg class="orbit-foot__tide" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 40V22c50-14 100-14 150 0s100 14 150 0 100-14 150 0 100 14 150 0 100-14 150 0 100 14 150 0 100-14 150 0 100 14 150 0V40z" fill="currentColor"/></svg>
  <div class="orbit-foot__in">
    <section class="orbit-foot__brand">
      <p class="orbit-foot__word">XDAILY</p>
      <p class="orbit-foot__sub">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Fields">
      <p class="orbit-foot__title">Fields</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="The observatory">
      <p class="orbit-foot__title">The observatory</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="orbit-foot__note">© ${new Date().getFullYear()} XDAILY · ${esc(site.domain)} · General science education for curious readers. Articles about the human body explain how it works and are not medical advice; for health questions, please see a doctor.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A field card: a numbered plate with a ring that turns when you hover. */
const card = (ctx, a, extra = "", n = 0) => `<article class="gyre-card ${extra}">
  <a class="gyre-card__link" href="${a.url}">
    <span class="gyre-card__ring" aria-hidden="true"><i></i></span>
    <span class="gyre-card__field">${icon(a.cat.icon, "gyre-card__icon")}${ctx.esc(a.cat.name)}</span>
    <h3 class="gyre-card__title">${ctx.esc(a.title)}</h3>
    <p class="gyre-card__text">${ctx.esc(a.description)}</p>
    <span class="gyre-card__foot">${n ? `<span class="gyre-card__no">Nº ${String(n).padStart(2, "0")}</span>` : ""}<span>${a.minutes} min read</span></span>
  </a>
</article>`;

/** The three circuits of Ecclesiastes 1, told as the science behind them. */
const CIRCUITS = [
  ["The sun's circuit", "The sun rises and hurries back to where it rises. We now know it is the Earth that turns, once a day on its axis and once a year around the Sun, and that its tilt of about 23.4 degrees gives us the seasons."],
  ["The wind's circuit", "Round and round goes the wind. Warm air rises near the equator, cools and sinks further north and south, and the turning Earth bends these flows into the great belts of trade winds and westerlies that steer our weather."],
  ["The water's circuit", "All streams run to the sea, yet the sea is never full. Sunlight lifts water from the oceans as vapour, winds carry the clouds inland, rain and snow fall on the hills, and rivers bring the water back: the water cycle."],
];

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="orbit-hero">
  <div class="orbit-hero__in">
    <div class="orbit-hero__text">
      <p class="orbit-hero__kicker">Science for curious minds</p>
      <h1 class="orbit-hero__title">How the world <em>works</em>, explained one clear idea at a time</h1>
      <p class="orbit-hero__lead">${esc(site.tagline)}.</p>
      <p class="orbit-hero__intro">${esc(site.description)}</p>
      <p class="orbit-hero__buttons">${first ? `<a class="orbit-button" href="${first.url}">Start exploring</a>` : ""}<a class="orbit-button orbit-button--line" href="/about/">Who we are</a></p>
    </div>
    <figure class="orbit-hero__porthole"><span class="orbit-hero__dial" aria-hidden="true"></span>${circuits()}</figure>
  </div>
</section>

<section class="orbit-circuits" aria-labelledby="ci-t">
  <header class="orbit-heading"><p class="orbit-heading__kicker">Ecclesiastes 1:5–7</p><h2 id="ci-t">Three circuits, one curious book</h2></header>
  <ol class="orbit-circuits__row">
    ${CIRCUITS.map(([t, x], i) => `<li class="orbit-circuit"><span class="orbit-circuit__orb" aria-hidden="true"><i style="--d:${i * -2}s"></i></span><h3>${t}</h3><p>${x}</p></li>`).join("\n    ")}
  </ol>
</section>

${first ? `<section class="orbit-pick" aria-label="Featured">
  ${card(ctx, first, "gyre-card--big", 1)}
  ${[second, third].filter(Boolean).map((a, i) => card(ctx, a, "", i + 2)).join("")}
</section>` : `<p class="orbit-soon">Our first explainers are being researched, written and fact-checked. Please come back soon.</p>`}

<section class="orbit-fields" aria-labelledby="fi-t">
  <header class="orbit-heading"><p class="orbit-heading__kicker">Six fields of view</p><h2 id="fi-t">Where shall we look today?</h2></header>
  <ul class="orbit-fields__sky">
    ${categories.map((c, i) => `<li><a class="orbit-field" href="${c.url}">
      <span class="orbit-field__system" aria-hidden="true"><span class="orbit-field__track"><i></i></span></span>
      <span class="orbit-field__planet">${icon(c.icon)}</span>
      <span class="orbit-field__no">Field ${["I", "II", "III", "IV", "V", "VI"][i] || i + 1}</span>
      <span class="orbit-field__name">${esc(c.name)}</span>
      <span class="orbit-field__text">${esc(c.description)}</span>
      <span class="orbit-field__count">${c.articles.length} explainers</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${rest.length ? `<section class="orbit-latest" aria-labelledby="la-t">
  <header class="orbit-heading"><p class="orbit-heading__kicker">Freshly observed</p><h2 id="la-t">Latest explainers</h2></header>
  <div class="orbit-latest__grid">${rest.slice(0, 12).map((a) => card(ctx, a)).join("\n    ")}</div>
</section>` : ""}

<section class="orbit-chart" aria-labelledby="ch-t">
  <header class="orbit-heading orbit-heading--night"><p class="orbit-heading__kicker">The star chart</p><h2 id="ch-t">Every explainer, by field</h2></header>
  <div class="orbit-chart__grid">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon)}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `XDAILY – ${site.tagline}`, description: site.description, path: "/" }, body, "home");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="orbit-fieldhead">
  <nav class="orbit-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
  <span class="orbit-fieldhead__planet">${icon(c.icon)}</span>
  <h1>${esc(c.name)}</h1>
  <p>${esc(c.description)}</p>
  <p class="orbit-fieldhead__count">${c.articles.length} explainers in this field</p>
</header>
<section class="orbit-latest orbit-latest--field"><div class="orbit-latest__grid">
  ${c.articles.map((a, i) => card(ctx, a, "", i + 1)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: science explained`,
      description: `${c.description} ${c.articles.length} explainers from ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Home", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "field"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="orbit-article">
  <header class="orbit-article__head">
    <nav class="orbit-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <p class="orbit-article__field">${icon(a.cat.icon)}${esc(a.cat.name)}</p>
    <h1 class="orbit-article__title">${esc(a.title)}</h1>
    <p class="orbit-article__lead">${esc(a.description)}</p>
    <p class="orbit-article__meta">By the ${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} min read</p>
  </header>
  <div class="orbit-article__body">
    <div class="orbit-text">
${a.html}
      <aside class="orbit-note"><p><strong>How we explain.</strong> XDAILY simplifies on purpose, so that the main idea is clear; real science is always richer and still being refined. Numbers are rounded and drawn from established sources such as space agencies, national academies and university textbooks. Articles about the human body explain how it works and are not medical advice: for anything about your own health, please talk to a doctor.</p></aside>
    </div>
    ${toc.length > 2 ? `<nav class="orbit-toc" aria-label="In this explainer"><p class="orbit-toc__title">Flight path</p><ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol></nav>` : ""}
  </div>
</article>
<button class="orbit-gauge" type="button" aria-label="Back to top"><svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false"><circle cx="22" cy="22" r="19" fill="none" stroke="rgba(18,38,63,.15)" stroke-width="3"/><circle class="orbit-gauge__arc" cx="22" cy="22" r="19" fill="none" stroke="#e0a45c" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 22 22)"/><circle cx="22" cy="22" r="7" fill="#f5c04a"/><path d="M22 18v8M18.5 21.5L22 18l3.5 3.5" stroke="#12263f" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
<section class="orbit-latest orbit-latest--more" aria-labelledby="mo-t">
  <header class="orbit-heading"><p class="orbit-heading__kicker">Keep exploring</p><h2 id="mo-t">You might also wonder</h2></header>
  <div class="orbit-latest__grid">${a.related.map((r) => card(ctx, r)).join("")}</div>
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
    "article"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="orbit-article orbit-article--page">
  <header class="orbit-article__head">
    <nav class="orbit-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="orbit-article__title">${esc(p.title)}</h1>
    ${p.updated ? `<p class="orbit-article__meta">Last reviewed ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="orbit-article__body orbit-article__body--one"><div class="orbit-text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Home", path: "/" }, { name: p.title, path: p.url }])] }, body, "page");
}

export function notFound(ctx) {
  const body = `
<section class="orbit-lost">
  <p class="orbit-lost__code">404</p>
  <h1>This page has drifted out of orbit</h1>
  <p>We could not find what you were looking for. One of our fields may have it:</p>
  <ul class="orbit-fields__sky">${ctx.categories.map((c) => `<li><a class="orbit-field" href="${c.url}"><span class="orbit-field__planet">${icon(c.icon)}</span><span class="orbit-field__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Page not found", description: "The page you were looking for does not exist on XDAILY.", path: "/404.html", noindex: true }, body, "lost");
}
