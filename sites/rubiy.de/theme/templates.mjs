// RUBIY — "Die königliche Speisekammer".
//
// Solomon's household needed daily "thirty measures of fine flour, sixty of
// meal … beside harts, roebucks and fatted fowl" (1 Kings 4:22–23): a palace
// lives from its pantry. RUBIY is that pantry: cedar shelves, copper pots and
// rows of preserving jars that fill with the colours of the season. Menu items
// are jar labels; on hover the lid turns and the jar fills from the bottom.
// Every class here (spk-, glas, etikett-) is RUBIY's own.

const ICONS = {
  spargel: `<path d="M18 42c0-12 2-24 6-34M24 42c0-12 1-22 4-32M30 42c0-11 0-20 2-28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M22 10l2-4 2 4M26 12l2-4 2 4M30 16l2-4 2 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 34h22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  tomate: `<circle cx="24" cy="27" r="14" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M24 13l-3-5M24 13l4-4M24 13l-7-1M24 13l7-1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M15 25a9 9 0 0 1 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".6"/>`,
  kuerbis: `<path d="M24 14c-10 0-16 6-16 14s6 13 16 13 16-5 16-13-6-14-16-14z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 14c-4 6-4 21 0 27M24 14c4 6 4 21 0 27" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 14c0-4 2-7 5-8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`,
  kohl: `<circle cx="24" cy="26" r="15" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 11c-6 6-6 24 0 30M24 11c6 6 6 24 0 30M10 24c8-3 20-3 28 0" fill="none" stroke="currentColor" stroke-width="2"/>`,
  glas: `<rect x="13" y="13" width="22" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="11" y="7" width="26" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 28h16v8a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="currentColor" opacity=".35"/><path d="M17 22h14" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/>`,
  messer: `<path d="M8 38 34 12c3-3 7-2 7 2L16 39z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 38l-2 4 6-2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 30l4 4" stroke="currentColor" stroke-width="2"/>`,
  loeffel: `<ellipse cx="17" cy="15" rx="7" ry="9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M21 22 38 40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.loeffel}</svg>`;

/** The mark: a copper preserving jar with a beet-red fill and a gold lid. */
const marke = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <rect x="14" y="16" width="36" height="42" rx="9" fill="#fbf6ee" stroke="#b5653a" stroke-width="3"/>
  <path d="M17 36h30v13a6 6 0 0 1-6 6H23a6 6 0 0 1-6-6z" fill="#7a1f3d"/>
  <path d="M17 36c5-3 10 3 15 0s10-3 15 0" fill="none" stroke="#a83a5c" stroke-width="2"/>
  <rect x="11" y="7" width="42" height="11" rx="3" fill="#d9a441" stroke="#8a5a1c" stroke-width="2"/>
  <path d="M15 12h34" stroke="#8a5a1c" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M24 26h16" stroke="#5f7a5a" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

/** Spanien, Weltmeister 2026 — a ristra of red peppers and lemons swings
 * across the pantry door. */
const champions = () => `<aside class="spk-wm" role="note" aria-label="Spanien, Fußball-Weltmeister 2026">
  <div class="spk-wm__ristra" aria-hidden="true">${Array.from({ length: 11 }, (_, i) => `<i class="${i % 3 === 1 ? "zitrone" : "paprika"}" style="--i:${i}"></i>`).join("")}</div>
  <p class="spk-wm__text"><span aria-hidden="true">🏆</span> <strong>Spanien</strong> ist Fußball-Weltmeister 2026 <span aria-hidden="true">⚽</span></p>
</aside>`;

const glasLink = (href, label, cls = "") =>
  `<a class="glas ${cls}" href="${href}"><span class="glas__deckel" aria-hidden="true"></span><span class="glas__inhalt" aria-hidden="true"></span><span class="glas__etikett">${label}</span></a>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="spk spk--${kind}">
<a class="spk-sprung" href="#inhalt">Zum Inhalt springen</a>
${champions()}
<header class="spk-kopf">
  <div class="spk-kopf__innen">
    <a class="spk-marke" href="/" aria-label="${esc(site.name)} — Startseite">
      ${marke("spk-marke__glas")}
      <span class="spk-marke__texte"><span class="spk-marke__name">RUBIY</span><span class="spk-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <button class="spk-knopf" type="button" aria-expanded="false" aria-controls="spk-menue">Regal</button>
  </div>
  <nav id="spk-menue" class="spk-menue" aria-label="Jahreszeiten und Themen">
    <div class="spk-menue__brett">
    ${glasLink("/", "Start")}
    ${categories.map((c) => glasLink(c.url, esc(c.name), `glas--${c.slug}`)).join("\n    ")}
    ${site.menu.map((m) => glasLink(m.href, esc(m.label), "glas--leise")).join("\n    ")}
    </div>
  </nav>
  ${kind === "rezept" ? `<div class="spk-pegel" aria-hidden="true"><i></i></div>` : ""}
</header>
<main id="inhalt">
${body}
</main>
<footer class="spk-fuss">
  <div class="spk-fuss__innen">
    <section>
      <p class="spk-fuss__name">RUBIY</p>
      <p class="spk-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Jahreszeiten">
      <p class="spk-fuss__titel">Jahreszeiten &amp; Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="RUBIY">
      <p class="spk-fuss__titel">RUBIY</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="spk-fuss__hinweis">© ${new Date().getFullYear()} RUBIY · ${esc(site.domain)} · Rezepte und Küchenwissen für zu Hause. Bei Allergien, Unverträglichkeiten und beim Sammeln von Wildpflanzen und Pilzen gelten besondere Vorsichtsregeln. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

const seasonClass = (slug) => `etikett--${slug}`;

/** A recipe card is a jar label tied to the shelf with string. */
const etikett = (ctx, a) => `<article class="etikett ${seasonClass(a.cat.slug)}">
  <a class="etikett__link" href="${a.url}">
    <span class="etikett__band" aria-hidden="true"></span>
    <span class="etikett__kopf"><span class="etikett__icon">${icon(a.cat.icon)}</span><span class="etikett__zeit">${ctx.esc(a.cat.name)}</span></span>
    <h3 class="etikett__titel">${ctx.esc(a.title)}</h3>
    <p class="etikett__text">${ctx.esc(a.description)}</p>
    <span class="etikett__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="etikett__pfeil" aria-hidden="true">→</span></span>
  </a>
</article>`;

/** The hero: three cedar shelves in the royal pantry; the jars on them fill
 * and empty with the colours of the four seasons. */
const regal = () => {
  const jars = [
    [44, 66, "f"], [104, 66, "s"], [164, 66, "h"], [224, 66, "w"], [284, 66, "f"],
    [44, 156, "h"], [104, 156, "w"], [164, 156, "f"], [224, 156, "s"], [284, 156, "h"],
    [74, 246, "s"], [134, 246, "h"], [194, 246, "w"], [254, 246, "f"],
  ];
  return `<svg class="spk-bild" viewBox="0 0 380 320" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="rbHolz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4430"/><stop offset="1" stop-color="#3d2518"/></linearGradient>
    <linearGradient id="rbWand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3e7d3"/><stop offset="1" stop-color="#e5d2b2"/></linearGradient>
    <clipPath id="rbClip"><rect x="-17" y="-34" width="34" height="46" rx="7"/></clipPath>
  </defs>
  <rect width="380" height="320" rx="22" fill="url(#rbWand)"/>
  <path d="M0 0h380v18H0z" fill="#b5653a" opacity=".25"/>
  ${[100, 190, 280].map((y) => `<rect x="14" y="${y}" width="352" height="12" rx="3" fill="url(#rbHolz)"/><rect x="14" y="${y + 12}" width="352" height="4" fill="#2a170e" opacity=".25"/>`).join("")}
  <g class="spk-bild__glaeser">
  ${jars
    .map(
      ([x, y, s], i) => `<g transform="translate(${x + 12} ${y + 34})" class="j j--${s}" style="--d:${(i % 7) * 0.6}s">
      <g clip-path="url(#rbClip)"><rect class="j__fuell" x="-17" y="-34" width="34" height="46"/></g>
      <rect x="-17" y="-34" width="34" height="46" rx="7" fill="none" stroke="#8a5a1c" stroke-width="2"/>
      <rect x="-19" y="-41" width="38" height="8" rx="2" fill="#d9a441" stroke="#8a5a1c" stroke-width="1.5"/>
      <rect x="-10" y="-20" width="20" height="10" rx="2" fill="#fbf6ee" opacity=".9"/>
    </g>`
    )
    .join("")}
  </g>
  <g transform="translate(300 270)"><ellipse cx="0" cy="8" rx="34" ry="6" fill="#2a170e" opacity=".2"/><path d="M-30 -10h60l-6 18h-48z" fill="#b5653a" stroke="#7a3f1f" stroke-width="2"/><path d="M-36 -12h72" stroke="#7a3f1f" stroke-width="4" stroke-linecap="round"/><path class="spk-bild__dampf" d="M-10 -20c-4-8 4-10 0-18M6 -20c-4-8 4-10 0-18" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></g>
</svg>`;
};

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, ...rest] = articles;
  const body = `
<section class="spk-start">
  <div class="spk-start__innen">
    <div class="spk-start__text">
      <p class="spk-dachzeile">Saisonal kochen</p>
      <h1 class="spk-start__titel">Die Küche im <em>Takt des Jahres</em></h1>
      <p class="spk-start__claim">${esc(site.tagline)}</p>
      <p class="spk-start__intro">${esc(site.description)}</p>
      <p class="spk-start__knoepfe"><a class="spk-taste" href="/saisonkalender/">Was hat jetzt Saison?</a><a class="spk-taste spk-taste--rahmen" href="${first.url}">Neuestes Rezept</a></p>
    </div>
    <div class="spk-start__bild">${regal()}</div>
  </div>
</section>

<section class="spk-zeiten" aria-labelledby="jz-t">
  <header class="spk-ueber"><p class="spk-ueber__zeile">Aus der Speisekammer</p><h2 id="jz-t">Vier Jahreszeiten, zwei Handwerke</h2></header>
  <ul class="spk-zeiten__reihe">
    ${categories.map((c) => `<li><a class="spk-fach spk-fach--${c.slug}" href="${c.url}">
      <span class="spk-fach__glas">${icon(c.icon, "spk-fach__icon")}</span>
      <span class="spk-fach__name">${esc(c.name)}</span>
      <span class="spk-fach__zahl">${c.articles.length} Beiträge</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

<section class="spk-raster" aria-labelledby="neu-t">
  <header class="spk-ueber"><p class="spk-ueber__zeile">Frisch aus der Küche</p><h2 id="neu-t">Neue Rezepte &amp; Ratgeber</h2></header>
  <div class="spk-raster__karten">
    ${[first, ...rest.slice(0, 11)].map((a) => etikett(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="spk-verzeichnis" aria-labelledby="vz-t">
  <header class="spk-ueber spk-ueber--dunkel"><p class="spk-ueber__zeile">Das ganze Regal</p><h2 id="vz-t">Alle Beiträge</h2></header>
  <div class="spk-verzeichnis__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "spk-verzeichnis__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `RUBIY — ${site.expansion}: saisonal kochen`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="spk-fachkopf spk-fachkopf--${c.slug}">
  <div class="spk-fachkopf__innen">
    <nav class="spk-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="spk-fachkopf__glas">${icon(c.icon)}</span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="spk-fachkopf__zahl">${c.articles.length} Beiträge</p>
  </div>
</header>
<section class="spk-raster spk-raster--fach"><div class="spk-raster__karten">
  ${c.articles.map((a) => etikett(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: saisonale Rezepte und Küchenwissen`,
      description: `${c.description} ${c.articles.length} Beiträge von ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "fach"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="spk-rezept spk-rezept--${a.cat.slug}">
  <header class="spk-rezept__kopf">
    <nav class="spk-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="spk-rezept__titel">${esc(a.title)}</h1>
    <p class="spk-rezept__intro">${esc(a.description)}</p>
  </header>
  <div class="spk-rezept__koerper">
    <aside class="spk-zettel" aria-label="Angaben zum Beitrag">
      <p class="spk-zettel__titel">Vom Küchenzettel</p>
      <dl>
        <div><dt>Thema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Min.</dd></div>
        <div><dt>Stand</dt><dd><time datetime="${a.updated}">${a.dateLabel}</time></dd></div>
        <div><dt>Von</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="spk-zettel__titel spk-zettel__titel--b">Inhalt</p><ol class="spk-zettel__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="spk-rezept__text">
${a.html}
      <aside class="spk-hinweis"><p><strong>Gut zu wissen:</strong> Mengen und Garzeiten sind Richtwerte und hängen von Zutaten, Herd und Geschmack ab. Bei Allergien und Unverträglichkeiten prüfe jede Zutat. Wildpflanzen und Pilze nur sammeln und essen, wenn du sie sicher bestimmen kannst. Mehr in unserem <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p></aside>
    </div>
  </div>
</article>
<section class="spk-raster spk-raster--weiter" aria-labelledby="wt-t">
  <header class="spk-ueber"><p class="spk-ueber__zeile">Aus demselben Regal</p><h2 id="wt-t">Passt gut dazu</h2></header>
  <div class="spk-raster__karten">${a.related.map((r) => etikett(ctx, r)).join("")}</div>
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
    "rezept"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="spk-rezept spk-rezept--seite">
  <header class="spk-rezept__kopf">
    <nav class="spk-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="spk-rezept__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="spk-rezept__intro">Stand: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="spk-rezept__koerper spk-rezept__koerper--eins"><div class="spk-rezept__text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="spk-leer">
  <p class="spk-leer__code">404</p>
  <h1>Dieses Glas steht nicht im Regal</h1>
  <p>Die Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. Schau doch in eines dieser Fächer:</p>
  <ul class="spk-zeiten__reihe">${ctx.categories.map((c) => `<li><a class="spk-fach spk-fach--${c.slug}" href="${c.url}"><span class="spk-fach__glas">${icon(c.icon, "spk-fach__icon")}</span><span class="spk-fach__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei RUBIY nicht.", path: "/404.html", noindex: true }, body, "leer");
}
