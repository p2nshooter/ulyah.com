// ZUVIK — "Hof der Granatäpfel".
//
// The inner courtyard of the palace, where the household lives: a pomegranate
// tree by the fountain (Song of Songs 6:11 — "to see whether the pomegranates
// were in bloom"), warm lime-washed walls, windows that light up one by one in
// the evening. Menu items are windows that glow when you come near; story cards
// are lit window frames. No figures — only house, tree, fruit, light. Every
// class here (hof-, fenster-, granat-) is ZUVIK's own.

const ICONS = {
  sonne: `<circle cx="24" cy="26" r="8" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M24 8v5M24 39v4M8 26h4M36 26h4M12.7 14.7l3.5 3.5M31.8 33.8l3.5 3.5M12.7 37.3l3.5-3.5M31.8 18.2l3.5-3.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  haende: `<path d="M8 30c4-1 8 1 11 4l4 4c1.5 1.5 3.5 1.5 5 0l9-9c1.5-1.5 1.5-3.5 0-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 18c-4 1-8-1-11-4l-3-3c-1.5-1.5-3.5-1.5-5 0l-8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  baum: `<path d="M24 42V26M24 32l-6-5M24 29l6-5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M24 6c-9 0-15 6-15 13 0 6 5 9 15 9s15-3 15-9c0-7-6-13-15-13z" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="17" cy="17" r="2.4" fill="currentColor"/><circle cx="30" cy="14" r="2.4" fill="currentColor"/>`,
  laterne: `<path d="M24 5v5M19 10h10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M16 14h16l2 6v12l-2 6H16l-2-6V20z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 21c-2.5 3-2.5 6 0 9 2.5-3 2.5-6 0-9z" fill="currentColor"/>`,
  ranzen: `<rect x="11" y="14" width="26" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M18 14v-3a6 6 0 0 1 12 0v3M11 26h26M22 26v5h4v-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
  haus: `<path d="M7 23 24 9l17 14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 20v21h24V20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 41V31h8v10" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="24" cy="23" r="2.6" fill="currentColor"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.haus}</svg>`;

/** The pomegranate of the courtyard, the site's mark. */
const granatapfel = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <path d="M26 10l3 6 3-7 3 7 3-6 1 9H25z" fill="#e3a72f" stroke="#6e1a28" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="32" cy="38" r="21" fill="#9e2b3c" stroke="#6e1a28" stroke-width="2.5"/>
  <path d="M19 33a14 14 0 0 1 9-10" fill="none" stroke="#f3cf7a" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  <g fill="#f8d9de"><circle cx="30" cy="40" r="2.2"/><circle cx="36" cy="44" r="2.2"/><circle cx="38" cy="37" r="2.2"/><circle cx="31" cy="47" r="2.2"/></g>
</svg>`;

/** Spanien, Weltmeister 2026 — bunting across the courtyard in rojigualda,
 * swinging in the evening breeze, with a small gold cup. */
const champions = () => `<aside class="hof-wimpel" role="note" aria-label="Spanien, Fußball-Weltmeister 2026">
  <div class="hof-wimpel__schnur" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
  <p class="hof-wimpel__text"><span class="hof-wimpel__pokal" aria-hidden="true">🏆</span> <strong>Spanien</strong> ist Fußball-Weltmeister 2026 <span class="hof-wimpel__ball" aria-hidden="true">⚽</span></p>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="hof hof--${kind}">
<a class="hof-sprung" href="#inhalt">Zum Inhalt springen</a>
${champions()}
<header class="hof-kopf">
  <div class="hof-kopf__innen">
    <a class="hof-marke" href="/" aria-label="${esc(site.name)} — Startseite">
      ${granatapfel("hof-marke__frucht")}
      <span class="hof-marke__texte"><span class="hof-marke__name">ZUVIK</span><span class="hof-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <span class="hof-lesekerze" aria-hidden="true" title="Lesefortschritt"><span class="hof-lesekerze__licht"></span></span>
    <button class="hof-knopf" type="button" aria-expanded="false" aria-controls="hof-menue">Räume</button>
  </div>
  <nav id="hof-menue" class="hof-menue" aria-label="Räume">
    <a class="fenster" href="/"><span>Start</span></a>
    ${categories.map((c) => `<a class="fenster" href="${c.url}"><span>${esc(c.name)}</span></a>`).join("\n    ")}
    ${site.menu.map((m) => `<a class="fenster fenster--klein" href="${m.href}"><span>${esc(m.label)}</span></a>`).join("\n    ")}
  </nav>
</header>
<main id="inhalt">
${body}
</main>
<footer class="hof-fuss">
  <div class="hof-fuss__dach" aria-hidden="true"></div>
  <div class="hof-fuss__innen">
    <section>
      <p class="hof-fuss__name">ZUVIK</p>
      <p class="hof-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Räume">
      <p class="hof-fuss__titel">Räume</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="ZUVIK">
      <p class="hof-fuss__titel">ZUVIK</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="hof-fuss__hinweis">© ${new Date().getFullYear()} ZUVIK · ${esc(site.domain)} · Erfundene Geschichten aus dem Familienalltag mit Anregungen für Eltern. Sie ersetzen keine pädagogische, psychologische oder medizinische Beratung. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A lit window: the story card glows warmer as it comes into view. */
const fensterkarte = (ctx, a, extra = "") => `<article class="granat-karte ${extra}">
  <a class="granat-karte__link" href="${a.url}">
    <span class="granat-karte__bogen" aria-hidden="true">${icon(a.cat.icon, "granat-karte__icon")}</span>
    <span class="granat-karte__raum">${ctx.esc(a.cat.name)}</span>
    <h3 class="granat-karte__titel">${ctx.esc(a.title)}</h3>
    <p class="granat-karte__text">${ctx.esc(a.description)}</p>
    <span class="granat-karte__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="granat-karte__pfeil" aria-hidden="true">→</span></span>
  </a>
</article>`;

/** The hero: a house front at dusk; its windows light up one after another,
 * the pomegranate tree stands by the fountain. */
const hofbild = () => `<svg class="hof-bild" viewBox="0 0 380 280" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="zHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f0f17"/><stop offset=".6" stop-color="#9e2b3c"/><stop offset="1" stop-color="#e3a72f"/></linearGradient>
    <linearGradient id="zWand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf4e6"/><stop offset="1" stop-color="#efdcb8"/></linearGradient>
    <radialGradient id="zLicht" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#e3a72f"/></radialGradient>
  </defs>
  <rect x="0" y="0" width="380" height="280" rx="22" fill="url(#zHimmel)"/>
  <circle cx="318" cy="52" r="16" fill="#f3cf7a" opacity=".9"/>
  <path d="M60 248V110l90-60 90 60v138z" fill="url(#zWand)" stroke="#6e1a28" stroke-width="3"/>
  <path d="M50 116l100-70 100 70" fill="none" stroke="#6e1a28" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <g class="hof-bild__fenster" stroke="#6e1a28" stroke-width="2.5">
    <path class="f1" d="M84 170v-28a14 14 0 0 1 28 0v28z"/>
    <path class="f2" d="M136 170v-28a14 14 0 0 1 28 0v28z"/>
    <path class="f3" d="M188 170v-28a14 14 0 0 1 28 0v28z"/>
    <path class="f4" d="M136 118v-18a14 14 0 0 1 28 0v18z"/>
  </g>
  <path d="M132 248v-40a18 18 0 0 1 36 0v40z" fill="#6e1a28"/>
  <g class="hof-bild__baum">
    <path d="M300 248v-56" stroke="#5b3a22" stroke-width="7" stroke-linecap="round"/>
    <path d="M300 214l-18-14M300 204l16-16" stroke="#5b3a22" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="300" cy="176" rx="46" ry="34" fill="#4f6a2c"/>
    <ellipse cx="286" cy="166" rx="26" ry="18" fill="#6b7a3a"/>
    <g fill="#c2263c" stroke="#6e1a28" stroke-width="1.5"><circle cx="278" cy="184" r="7"/><circle cx="312" cy="170" r="7"/><circle cx="324" cy="192" r="6"/><circle cx="294" cy="196" r="6"/></g>
  </g>
  <ellipse cx="236" cy="252" rx="34" ry="8" fill="#5a8fa6" opacity=".8"/>
  <path d="M220 252c4-18 28-18 32 0" fill="none" stroke="#c8e3ec" stroke-width="2" class="hof-bild__brunnen"/>
  <rect x="0" y="248" width="380" height="32" fill="#c97b52"/>
  <path d="M0 256h380" stroke="#9d5b38" stroke-width="2" stroke-dasharray="10 8"/>
</svg>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, ...rest] = articles;
  const body = `
<section class="hof-start">
  <div class="hof-start__innen">
    <div class="hof-start__text">
      <p class="hof-dachzeile">Geschichten aus dem Familienalltag</p>
      <h1 class="hof-start__titel">Wo zuhause <em>gelacht</em> wird, wird auch gestritten und versöhnt</h1>
      <p class="hof-start__claim">${esc(site.tagline)}</p>
      <p class="hof-start__intro">${esc(site.description)}</p>
      <p class="hof-start__knoepfe"><a class="hof-taste" href="${first.url}">Erste Geschichte lesen</a><a class="hof-taste hof-taste--rahmen" href="/ueber-uns/">Was ist ZUVIK?</a></p>
    </div>
    <div class="hof-start__bild">${hofbild()}</div>
  </div>
</section>

<section class="hof-raeume" aria-labelledby="rm-t">
  <header class="hof-ueber"><p class="hof-ueber__zeile">Sechs Räume, ein Zuhause</p><h2 id="rm-t">In welchen Raum möchtet ihr schauen?</h2></header>
  <ul class="hof-raeume__reihe">
    ${categories.map((c) => `<li><a class="hof-tuer" href="${c.url}">
      ${icon(c.icon, "hof-tuer__icon")}
      <span class="hof-tuer__name">${esc(c.name)}</span>
      <span class="hof-tuer__zahl">${c.articles.length} Geschichten</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

<section class="hof-raster" aria-labelledby="neu-t">
  <header class="hof-ueber"><p class="hof-ueber__zeile">Neu im Hof</p><h2 id="neu-t">Die neuesten Geschichten</h2></header>
  <div class="hof-raster__karten">
    ${[first, ...rest.slice(0, 11)].map((a) => fensterkarte(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="hof-verzeichnis" aria-labelledby="vz-t">
  <header class="hof-ueber hof-ueber--dunkel"><p class="hof-ueber__zeile">Alle Geschichten</p><h2 id="vz-t">Das Verzeichnis</h2></header>
  <div class="hof-verzeichnis__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "hof-verzeichnis__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `ZUVIK — ${site.expansion}: Familiengeschichten mit Ideen für den Alltag`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="hof-raum">
  <div class="hof-raum__innen">
    <nav class="hof-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="hof-raum__icon">${icon(c.icon)}</span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="hof-raum__zahl">${c.articles.length} Geschichten</p>
  </div>
</header>
<section class="hof-raster hof-raster--raum"><div class="hof-raster__karten">
  ${c.articles.map((a) => fensterkarte(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Familiengeschichten mit Ideen für den Alltag`,
      description: `${c.description} ${c.articles.length} Geschichten von ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "raum"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="hof-geschichte">
  <header class="hof-geschichte__kopf">
    <nav class="hof-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="hof-geschichte__titel">${esc(a.title)}</h1>
    <p class="hof-geschichte__intro">${esc(a.description)}</p>
  </header>
  <div class="hof-geschichte__koerper">
    <aside class="hof-sims" aria-label="Angaben zur Geschichte">
      <p class="hof-sims__titel">Auf dem Fenstersims</p>
      <dl>
        <div><dt>Raum</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Min.</dd></div>
        <div><dt>Erschienen</dt><dd><time datetime="${a.updated}">${a.dateLabel}</time></dd></div>
        <div><dt>Von</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="hof-sims__titel hof-sims__titel--b">Kapitel</p><ol class="hof-sims__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="hof-geschichte__text">
${a.html}
      <aside class="hof-hinweis"><p><strong>Erfunden, aber nicht ausgedacht.</strong> Die Familien in unseren Geschichten gibt es so nicht; ihre Situationen kennen viele Eltern trotzdem. Die Anregungen sind Ideen aus dem Alltag, keine Beratung. Wenn euch etwas dauerhaft belastet, sprecht mit eurer Kinderärztin, eurem Kinderarzt oder einer Familienberatungsstelle in eurer Nähe.</p></aside>
    </div>
  </div>
</article>
<section class="hof-raster hof-raster--weiter" aria-labelledby="wt-t">
  <header class="hof-ueber"><p class="hof-ueber__zeile">Weiterlesen</p><h2 id="wt-t">Noch mehr aus dem Hof</h2></header>
  <div class="hof-raster__karten">${a.related.map((r) => fensterkarte(ctx, r)).join("")}</div>
</section>`;
  return layout(
    ctx,
    {
      title: a.title,
      description: a.description,
      path: a.url,
      type: "article",
      jsonld: [
        ctx.crumbs([{ name: "Start", path: "/" }, { name: a.cat.name, path: a.cat.url }, { name: a.title, path: a.url }]),
        {
          "@type": "Article",
          headline: a.title,
          description: a.description,
          genre: "Familiengeschichte",
          datePublished: a.date,
          dateModified: a.updated,
          inLanguage: site.lang,
          wordCount: a.words,
          articleSection: a.cat.name,
          author: { "@type": "Organization", name: site.author, url: `${base}/ueber-uns/` },
          publisher: { "@id": `${base}/#org` },
          mainEntityOfPage: `${base}${a.url}`,
        },
      ],
    },
    body,
    "geschichte"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="hof-geschichte hof-geschichte--seite">
  <header class="hof-geschichte__kopf">
    <nav class="hof-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="hof-geschichte__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="hof-geschichte__intro">Stand: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="hof-geschichte__koerper hof-geschichte__koerper--eins"><div class="hof-geschichte__text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="hof-leer">
  <p class="hof-leer__code">404</p>
  <h1>Hinter dieser Tür ist niemand zuhause</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. Schaut doch in einen anderen Raum:</p>
  <ul class="hof-raeume__reihe">${ctx.categories.map((c) => `<li><a class="hof-tuer" href="${c.url}">${icon(c.icon, "hof-tuer__icon")}<span class="hof-tuer__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei ZUVIK nicht.", path: "/404.html", noindex: true }, body, "leer");
}
