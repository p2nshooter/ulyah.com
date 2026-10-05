// ZAVIK — "Die Löwenstufen".
//
// Solomon's ivory throne had six steps with a lion on either side of each
// (1 Kings 10:18–20). In this palace the lions have become house cats: the
// site climbs six steps of ivory and amber, and on every step a pair of cat
// eyes keeps watch. No animal figures are drawn — only steps, paw prints,
// eyes, whiskers, a moon and a ball of yarn. Menu items are steps whose eyes
// open with a slow blink (a cat's sign of trust) when you come near. Every
// class here (thr-, stufe, kissen-) is ZAVIK's own.

const ICONS = {
  korb: `<path d="M8 22h32l-4 18H12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 22c0-7 4-12 10-12s10 5 10 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M13 29h22M14 35h20M20 22v18M28 22v18" stroke="currentColor" stroke-width="1.8" opacity=".7"/>`,
  napf: `<path d="M6 26h36c-1 9-8 14-18 14S7 35 6 26z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M4 26h40" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="18" cy="20" r="3" fill="currentColor"/><circle cx="25" cy="17" r="3" fill="currentColor"/><circle cx="31" cy="21" r="3" fill="currentColor"/>`,
  herz: `<path d="M24 40S8 30 8 19a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 11-16 21-16 21z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 25h7l3-5 4 9 3-4h7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  ohr: `<path d="M10 40 14 8l12 12 12-12 4 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M17 17l1 10M31 17l-1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M18 34c4 3 8 3 12 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  fenster: `<path d="M10 42V18a14 14 0 0 1 28 0v24z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 6v36M10 26h28" stroke="currentColor" stroke-width="2" opacity=".75"/><circle cx="33" cy="13" r="2.6" fill="currentColor"/>`,
  buerste: `<rect x="8" y="12" width="32" height="12" rx="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M13 24v8M18 24v10M23 24v8M28 24v10M33 24v8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M40 18h4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  pfote: `<ellipse cx="24" cy="31" rx="9" ry="7.5" fill="currentColor"/><ellipse cx="13" cy="20" rx="3.6" ry="4.6" fill="currentColor"/><ellipse cx="20" cy="13" rx="3.6" ry="4.8" fill="currentColor"/><ellipse cx="28" cy="13" rx="3.6" ry="4.8" fill="currentColor"/><ellipse cx="35" cy="20" rx="3.6" ry="4.6" fill="currentColor"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.pfote}</svg>`;

/** The site's mark: an ivory medallion with two amber eyes and whiskers. */
const augenmedaillon = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle cx="32" cy="32" r="29" fill="#faf6ee" stroke="#e0a02b" stroke-width="3"/>
  <circle cx="32" cy="32" r="23" fill="#241a33"/>
  <g class="thr-marke__lider">
    <path d="M14 30c4-7 13-7 17 0-4 7-13 7-17 0z" fill="#f5c86a"/>
    <path d="M33 30c4-7 13-7 17 0-4 7-13 7-17 0z" fill="#f5c86a"/>
    <path d="M22.5 25.5c-1.2 3-1.2 6 0 9M41.5 25.5c-1.2 3-1.2 6 0 9" stroke="#241a33" stroke-width="2.6" stroke-linecap="round"/>
  </g>
  <path d="M30 40l2 2 2-2" fill="none" stroke="#f5c86a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6 40l15-2M6 45l15-4M58 40l-15-2M58 45l-15-4" stroke="#dfe3ea" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>
</svg>`;

/** Spanien, Weltmeister 2026 — a ball of yarn in rojigualda rolls along the
 * banner and leaves a red-and-yellow thread behind. */
const champions = () => `<aside class="thr-wm" role="note" aria-label="Spanien, Fußball-Weltmeister 2026">
  <span class="thr-wm__faden" aria-hidden="true"></span>
  <span class="thr-wm__knaeuel" aria-hidden="true"></span>
  <p class="thr-wm__text"><span class="thr-wm__pokal" aria-hidden="true">🏆</span> <strong>Spanien</strong> ist Fußball-Weltmeister 2026 <span aria-hidden="true">⚽</span></p>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="thr thr--${kind}">
<a class="thr-sprung" href="#inhalt">Zum Inhalt springen</a>
${champions()}
<header class="thr-kopf">
  <div class="thr-kopf__innen">
    <a class="thr-marke" href="/" aria-label="${esc(site.name)} — Startseite">
      ${augenmedaillon("thr-marke__bild")}
      <span class="thr-marke__texte"><span class="thr-marke__name">ZAVIK</span><span class="thr-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <button class="thr-knopf" type="button" aria-expanded="false" aria-controls="thr-menue">Themen</button>
  </div>
  <nav id="thr-menue" class="thr-menue" aria-label="Themen">
    <a class="stufe" href="/"><span class="stufe__augen" aria-hidden="true"><i></i><i></i></span><span class="stufe__wort">Start</span></a>
    ${categories.map((c) => `<a class="stufe" href="${c.url}"><span class="stufe__augen" aria-hidden="true"><i></i><i></i></span><span class="stufe__wort">${esc(c.name)}</span></a>`).join("\n    ")}
    ${site.menu.map((m) => `<a class="stufe stufe--leise" href="${m.href}"><span class="stufe__augen" aria-hidden="true"><i></i><i></i></span><span class="stufe__wort">${esc(m.label)}</span></a>`).join("\n    ")}
  </nav>
  ${kind === "wissen" ? `<div class="thr-faden" aria-hidden="true"><i></i></div>` : ""}
</header>
<main id="inhalt">
${body}
</main>
<footer class="thr-fuss">
  <div class="thr-fuss__stufen" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="thr-fuss__innen">
    <section>
      <p class="thr-fuss__name">ZAVIK</p>
      <p class="thr-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen">
      <p class="thr-fuss__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="ZAVIK">
      <p class="thr-fuss__titel">ZAVIK</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="thr-fuss__hinweis">© ${new Date().getFullYear()} ZAVIK · ${esc(site.domain)} · Allgemeine Informationen rund um die Katzenhaltung. Sie ersetzen keine Untersuchung und Beratung durch eine Tierärztin oder einen Tierarzt. Im Notfall: sofort die tierärztliche Praxis oder Tierklinik anrufen. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A velvet cushion on the step: the guide card. */
const kissen = (ctx, a) => `<article class="kissen">
  <a class="kissen__link" href="${a.url}">
    <span class="kissen__kopf"><span class="kissen__icon">${icon(a.cat.icon)}</span><span class="kissen__thema">${ctx.esc(a.cat.name)}</span></span>
    <h3 class="kissen__titel">${ctx.esc(a.title)}</h3>
    <p class="kissen__text">${ctx.esc(a.description)}</p>
    <span class="kissen__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="kissen__pfote" aria-hidden="true">${icon("pfote")}</span></span>
  </a>
</article>`;

/** The hero: six ivory steps under a moon. Paw prints appear on them one by
 * one, climbing to the top; a ball of yarn waits on the lowest step. */
const stufenbild = () => `<svg class="thr-bild" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="zvNacht" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140e1f"/><stop offset=".7" stop-color="#3b2a52"/><stop offset="1" stop-color="#5b4373"/></linearGradient>
    <linearGradient id="zvElfenbein" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#e9dfcb"/></linearGradient>
    <radialGradient id="zvMond" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#fff8e1"/><stop offset="1" stop-color="#f5c86a"/></radialGradient>
  </defs>
  <rect width="400" height="300" rx="24" fill="url(#zvNacht)"/>
  <g fill="#dfe3ea" class="thr-bild__sterne"><circle cx="40" cy="40" r="1.6"/><circle cx="96" cy="70" r="1.2"/><circle cx="150" cy="30" r="1.8"/><circle cx="210" cy="62" r="1.2"/><circle cx="250" cy="24" r="1.4"/><circle cx="70" cy="110" r="1.1"/><circle cx="180" cy="96" r="1.3"/></g>
  <circle cx="320" cy="70" r="34" fill="url(#zvMond)"/>
  <circle cx="320" cy="70" r="46" fill="none" stroke="#f5c86a" stroke-opacity=".25" stroke-width="10"/>
  <g stroke="#c9b48a" stroke-width="1.5">
    <rect x="20" y="250" width="360" height="30" fill="url(#zvElfenbein)"/>
    <rect x="60" y="222" width="300" height="28" fill="url(#zvElfenbein)"/>
    <rect x="100" y="194" width="260" height="28" fill="url(#zvElfenbein)"/>
    <rect x="140" y="166" width="220" height="28" fill="url(#zvElfenbein)"/>
    <rect x="180" y="138" width="180" height="28" fill="url(#zvElfenbein)"/>
    <rect x="220" y="110" width="140" height="28" fill="url(#zvElfenbein)"/>
  </g>
  <g fill="#e0a02b"><rect x="20" y="250" width="360" height="4"/><rect x="60" y="222" width="300" height="4"/><rect x="100" y="194" width="260" height="4"/><rect x="140" y="166" width="220" height="4"/><rect x="180" y="138" width="180" height="4"/><rect x="220" y="110" width="140" height="4"/></g>
  <g class="thr-bild__spur" fill="#b8502e">
    ${[[78, 244], [118, 216], [158, 188], [198, 160], [238, 132], [278, 104]]
      .map(
        ([x, y], i) =>
          `<g class="p${i + 1}" transform="translate(${x} ${y}) rotate(${i % 2 ? 12 : -12})"><ellipse cx="0" cy="0" rx="6" ry="5"/><ellipse cx="-7" cy="-7" rx="2.2" ry="2.8"/><ellipse cx="-2.4" cy="-10" rx="2.2" ry="2.8"/><ellipse cx="2.4" cy="-10" rx="2.2" ry="2.8"/><ellipse cx="7" cy="-7" rx="2.2" ry="2.8"/></g>`
      )
      .join("")}
  </g>
  <g class="thr-bild__knaeuel" transform="translate(44 236)">
    <circle r="14" fill="#c60b1e"/>
    <path d="M-12-6c8 4 16 4 24 0M-13 2c9 5 17 5 26 0M-9 10c6 3 12 3 18 0" fill="none" stroke="#ffc400" stroke-width="2.2"/>
    <path d="M12 6c10 6 20 8 34 8" fill="none" stroke="#ffc400" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, ...rest] = articles;
  const body = `
<section class="thr-start">
  <div class="thr-start__innen">
    <div class="thr-start__text">
      <p class="thr-dachzeile">Der Katzen-Ratgeber</p>
      <h1 class="thr-start__titel">Sechs Stufen zu einem <em>guten Leben</em> mit deiner Katze</h1>
      <p class="thr-start__claim">${esc(site.tagline)}</p>
      <p class="thr-start__intro">${esc(site.description)}</p>
      <p class="thr-start__knoepfe"><a class="thr-taste" href="${categories[0].url}">Mit dem Einzug beginnen</a><a class="thr-taste thr-taste--rahmen" href="/notfall-und-tierarzt/">Notfall &amp; Tierarzt</a></p>
    </div>
    <div class="thr-start__bild">${stufenbild()}</div>
  </div>
</section>

<section class="thr-themen" aria-labelledby="th-t">
  <header class="thr-ueber"><p class="thr-ueber__zeile">Sechs Stufen</p><h2 id="th-t">Welches Thema beschäftigt dich?</h2></header>
  <ol class="thr-treppe">
    ${categories.map((c, i) => `<li style="--s:${i}"><a class="thr-tritt" href="${c.url}">
      <span class="thr-tritt__nr">${i + 1}</span>
      ${icon(c.icon, "thr-tritt__icon")}
      <span class="thr-tritt__name">${esc(c.name)}</span>
      <span class="thr-tritt__zahl">${c.articles.length} Ratgeber</span>
    </a></li>`).join("\n    ")}
  </ol>
</section>

<section class="thr-raster" aria-labelledby="neu-t">
  <header class="thr-ueber"><p class="thr-ueber__zeile">Frisch aufgeschrieben</p><h2 id="neu-t">Neue Ratgeber</h2></header>
  <div class="thr-raster__karten">
    ${[first, ...rest.slice(0, 11)].map((a) => kissen(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="thr-verzeichnis" aria-labelledby="vz-t">
  <header class="thr-ueber thr-ueber--nacht"><p class="thr-ueber__zeile">Alles auf einen Blick</p><h2 id="vz-t">Alle Ratgeber</h2></header>
  <div class="thr-verzeichnis__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "thr-verzeichnis__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `ZAVIK — ${site.expansion}: der Katzen-Ratgeber`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site, categories } = ctx;
  const nr = categories.findIndex((x) => x.slug === c.slug) + 1;
  const body = `
<header class="thr-thema">
  <div class="thr-thema__innen">
    <nav class="thr-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="thr-thema__icon">${icon(c.icon)}<span class="thr-thema__nr">Stufe ${nr}</span></span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="thr-thema__zahl">${c.articles.length} Ratgeber</p>
  </div>
</header>
<section class="thr-raster thr-raster--thema"><div class="thr-raster__karten">
  ${c.articles.map((a) => kissen(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Katzen-Ratgeber`,
      description: `${c.description} ${c.articles.length} Ratgeber von ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "thema"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="thr-wissen">
  <header class="thr-wissen__kopf">
    <nav class="thr-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="thr-wissen__titel">${esc(a.title)}</h1>
    <p class="thr-wissen__intro">${esc(a.description)}</p>
  </header>
  <div class="thr-wissen__koerper">
    <aside class="thr-blick" aria-label="Angaben zum Ratgeber">
      <p class="thr-blick__titel"><span class="thr-blick__augen" aria-hidden="true"><i></i><i></i></span>Auf einen Blick</p>
      <dl>
        <div><dt>Thema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Min.</dd></div>
        <div><dt>Stand</dt><dd><time datetime="${a.updated}">${a.dateLabel}</time></dd></div>
        <div><dt>Von</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="thr-blick__titel thr-blick__titel--b">Inhalt</p><ol class="thr-blick__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="thr-wissen__text">
${a.html}
      <aside class="thr-tierarzt"><p><strong>Wichtig:</strong> Dieser Ratgeber gibt allgemeine Informationen und ersetzt keine Untersuchung. Jede Katze ist anders. Wenn sich deine Katze ungewohnt verhält, nicht frisst, Schmerzen zeigt oder du unsicher bist, ruf deine Tierarztpraxis an. Im Notfall auch nachts oder am Wochenende: Tierklinik oder tierärztlicher Notdienst. <a href="/notfall-und-tierarzt/">Woran du einen Notfall erkennst</a>.</p></aside>
    </div>
  </div>
</article>
<section class="thr-raster thr-raster--weiter" aria-labelledby="wt-t">
  <header class="thr-ueber"><p class="thr-ueber__zeile">Weiterlesen</p><h2 id="wt-t">Passende Ratgeber</h2></header>
  <div class="thr-raster__karten">${a.related.map((r) => kissen(ctx, r)).join("")}</div>
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
    "wissen"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="thr-wissen thr-wissen--seite">
  <header class="thr-wissen__kopf">
    <nav class="thr-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="thr-wissen__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="thr-wissen__intro">Stand: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="thr-wissen__koerper thr-wissen__koerper--eins"><div class="thr-wissen__text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="thr-leer">
  <p class="thr-leer__code">404</p>
  <h1>Hier ist die Katze nicht</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. Die Themen findest du hier:</p>
  <ol class="thr-treppe thr-treppe--flach">${ctx.categories.map((c, i) => `<li style="--s:${i}"><a class="thr-tritt" href="${c.url}"><span class="thr-tritt__nr">${i + 1}</span>${icon(c.icon, "thr-tritt__icon")}<span class="thr-tritt__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ol>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei ZAVIK nicht.", path: "/404.html", noindex: true }, body, "leer");
}
