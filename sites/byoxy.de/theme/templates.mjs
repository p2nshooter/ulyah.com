// BYOXY — "Hängende Gärten".
//
// Terraces of green hung from a palace of jade and gold: vines grow down from
// the header as you read, leaves unfold under each menu item, and dew glints
// on the cards. Every class here (garten-, blatt-, ranke-) is BYOXY's own and
// appears in no other site of the network.

const ICONS = {
  monstera: `<path d="M24 42V24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 26C12 26 6 18 8 8c8 0 16 4 16 18zM24 26c12 0 18-8 16-18-8 0-16 4-16 18z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 13l4 4M35 13l-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  kanne: `<path d="M10 20h22v16a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M32 24l10-8M10 24c-4 0-6 3-6 6s2 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M42 16l2 4M40 20l2 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  lupe: `<circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M28 28l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="18" r="2.5" fill="currentColor"/><path d="M15 23l6 0" stroke="currentColor" stroke-width="1.6"/>`,
  steckling: `<path d="M14 42h20l-3-12H17z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 30V14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 20c-6 0-9-4-9-9 6 0 9 4 9 9zM24 16c5 0 8-3 8-8-5 0-8 3-8 8z" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
  kasten: `<path d="M6 26h36l-4 14H10z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 26v-6M24 26V14M34 26v-8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="14" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="11" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="34" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2"/>`,
  basilikum: `<path d="M24 42V20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="17" cy="18" rx="7" ry="10" transform="rotate(-30 17 18)" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="31" cy="18" rx="7" ry="10" transform="rotate(30 31 18)" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="32" rx="5" ry="7" fill="none" stroke="currentColor" stroke-width="2"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.monstera}</svg>`;

/** Spanien, Weltmeister 2026 — a balcony box where red and gold flowers
 * bloom one after another and spell 2026, with a ball rolling along the rim. */
const champions = () => `<aside class="ranke-blumenkasten" role="note" aria-label="Spanien, Fußball-Weltmeister 2026">
  <div class="ranke-blumenkasten__innen">
    <span class="ranke-blumenkasten__beet" aria-hidden="true"><i></i><i></i><i></i><i></i><b>2026</b></span>
    <p class="ranke-blumenkasten__text"><strong>Spanien</strong> ist Fußball-Weltmeister 2026</p>
    <span class="ranke-blumenkasten__ball" aria-hidden="true">⚽</span>
    <span class="ranke-blumenkasten__pokal" aria-hidden="true">🏆</span>
  </div>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="garten garten--${kind}">
<a class="garten-sprung" href="#inhalt">Zum Inhalt springen</a>
${champions()}
<header class="garten-kopf">
  <div class="garten-kopf__ranken" aria-hidden="true"></div>
  <div class="garten-kopf__innen">
    <a class="garten-marke" href="/" aria-label="${esc(site.name)} — Startseite">
      <span class="garten-marke__kuppel" aria-hidden="true"><span>❦</span></span>
      <span class="garten-marke__texte"><span class="garten-marke__name">BYOXY</span><span class="garten-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <span class="garten-ranke" aria-hidden="true" title="Lesefortschritt"><span class="garten-ranke__spitze"></span></span>
    <button class="garten-knopf" type="button" aria-expanded="false" aria-controls="garten-menue">Themen</button>
  </div>
  <nav id="garten-menue" class="garten-menue" aria-label="Themen">
    <a class="garten-menue__blatt" href="/"><span>Start</span></a>
    ${categories.map((c) => `<a class="garten-menue__blatt" href="${c.url}"><span>${esc(c.name)}</span></a>`).join("\n    ")}
    ${site.menu.map((m) => `<a class="garten-menue__blatt garten-menue__blatt--klein" href="${m.href}"><span>${esc(m.label)}</span></a>`).join("\n    ")}
  </nav>
</header>
<main id="inhalt">
${body}
</main>
<footer class="garten-fuss">
  <div class="garten-fuss__blaetter" aria-hidden="true"></div>
  <div class="garten-fuss__innen">
    <section>
      <p class="garten-fuss__name">BYOXY</p>
      <p class="garten-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen">
      <p class="garten-fuss__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="BYOXY">
      <p class="garten-fuss__titel">BYOXY</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="garten-fuss__hinweis">© ${new Date().getFullYear()} BYOXY · ${esc(site.domain)} · Unabhängiger Ratgeber für Pflanzen und grünes Wohnen. Manche Pflanzen sind für Kinder und Haustiere giftig: Lies unsere <a href="/pflanzensicherheit/">Hinweise zur Pflanzensicherheit</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A marble arch card: the arch fills with light when it comes into view. */
const blatt = (ctx, a, extra = "") => `<article class="blatt ${extra}">
  <a class="blatt__link" href="${a.url}">
    <span class="blatt__kopf">${icon(a.cat.icon, "blatt__icon")}<span class="blatt__thema">${ctx.esc(a.cat.name)}</span></span>
    <h3 class="blatt__titel">${ctx.esc(a.title)}</h3>
    <p class="blatt__text">${ctx.esc(a.description)}</p>
    <span class="blatt__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="blatt__pfeil" aria-hidden="true">→</span></span>
  </a>
</article>`;

/** The hero: a terraced garden whose vines sway and drip with dew. */
const garten = () => `<svg class="garten-terrassen" viewBox="0 0 360 280" aria-hidden="true" focusable="false">
  <defs><linearGradient id="gJade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7d5c"/><stop offset="1" stop-color="#16352a"/></linearGradient></defs>
  <g fill="url(#gJade)" stroke="#d9b55a" stroke-width="2.5">
    <path d="M40 90h280v22H40z"/><path d="M70 160h220v22H70z"/><path d="M100 230h160v22H100z"/>
  </g>
  <g class="garten-terrassen__ranken" stroke="#7cc576" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M60 112c4 18-4 30 0 48"/><path d="M110 112c-4 22 4 34 0 52"/><path d="M200 112c4 14-3 24 0 40"/><path d="M300 112c-4 20 4 30 0 46"/>
    <path d="M90 182c3 16-3 26 0 42"/><path d="M180 182c-3 18 3 26 0 40"/><path d="M270 182c3 14-3 22 0 36"/>
  </g>
  <g class="garten-terrassen__tau" fill="#d9f2e2"><circle cx="60" cy="162" r="3.5"/><circle cx="110" cy="166" r="3"/><circle cx="300" cy="160" r="3.5"/><circle cx="180" cy="224" r="3"/></g>
  <g fill="#7cc576"><circle cx="80" cy="82" r="10"/><circle cx="140" cy="76" r="14"/><circle cx="220" cy="80" r="12"/><circle cx="290" cy="78" r="10"/><circle cx="120" cy="150" r="10"/><circle cx="240" cy="148" r="12"/><circle cx="170" cy="220" r="11"/></g>
  <g fill="#d9b55a"><circle cx="140" cy="76" r="3"/><circle cx="240" cy="148" r="3"/></g>
</svg>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="garten-start">
  <div class="garten-start__innen">
    <div class="garten-start__text">
      <p class="garten-dachzeile">Grünes Wohnen für Einsteiger und Pflanzenfreunde</p>
      <h1 class="garten-start__titel">Mehr <em>Grün</em> in jedem Zimmer</h1>
      <p class="garten-start__claim">${esc(site.tagline)}</p>
      <p class="garten-start__intro">${esc(site.description)}</p>
      <p class="garten-start__knoepfe"><a class="garten-taste" href="${first.url}">Ersten Ratgeber lesen</a><a class="garten-taste garten-taste--rahmen" href="/pflanzensicherheit/">Giftige Pflanzen kennen</a></p>
    </div>
    <div class="garten-start__bild">${garten()}</div>
  </div>
</section>

<section class="garten-beete" aria-labelledby="bt-t">
  <header class="garten-ueber"><p class="garten-ueber__zeile">Die sechs Gärten</p><h2 id="bt-t">Was wächst bei dir?</h2></header>
  <ul class="garten-beete__reihe">
    ${categories.map((c) => `<li><a class="garten-terrasse" href="${c.url}">
      ${icon(c.icon, "garten-terrasse__icon")}
      <span class="garten-terrasse__name">${esc(c.name)}</span>
      <span class="garten-terrasse__zahl">${c.articles.length} Ratgeber</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

<section class="garten-raster" aria-labelledby="neu-t">
  <header class="garten-ueber"><p class="garten-ueber__zeile">Frisch gegossen</p><h2 id="neu-t">Neue Ratgeber</h2></header>
  <div class="garten-raster__karten">
    ${[first, second, third, ...rest.slice(0, 9)].map((a) => blatt(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="garten-verzeichnis" aria-labelledby="vz-t">
  <header class="garten-ueber garten-ueber--dunkel"><p class="garten-ueber__zeile">Alles auf einen Blick</p><h2 id="vz-t">Verzeichnis aller Ratgeber</h2></header>
  <div class="garten-verzeichnis__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "garten-verzeichnis__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `BYOXY — ${site.expansion}: Zimmerpflanzen, Balkon, Kräuter`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="garten-thema">
  <div class="garten-thema__innen">
    <nav class="garten-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="garten-thema__icon">${icon(c.icon)}</span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="garten-thema__zahl">${c.articles.length} Ratgeber</p>
  </div>
</header>
<section class="garten-raster garten-raster--thema"><div class="garten-raster__karten">
  ${c.articles.map((a) => blatt(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Ratgeber für Pflanzenfreunde`,
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
<article class="garten-ratgeber">
  <header class="garten-ratgeber__kopf">
    <nav class="garten-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="garten-ratgeber__titel">${esc(a.title)}</h1>
    <p class="garten-ratgeber__intro">${esc(a.description)}</p>
  </header>
  <div class="garten-ratgeber__koerper">
    <aside class="garten-pflanzschild" aria-label="Angaben zum Ratgeber">
      <p class="garten-pflanzschild__titel">Am Pflanzschild</p>
      <dl>
        <div><dt>Thema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Min.</dd></div>
        <div><dt>Geprüft</dt><dd><time datetime="${a.updated}">${a.dateLabel}</time></dd></div>
        <div><dt>Von</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="garten-pflanzschild__titel garten-pflanzschild__titel--b">In diesem Ratgeber</p><ol class="garten-pflanzschild__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="garten-ratgeber__text">
${a.html}
      <aside class="garten-hinweis"><p><strong>Gut zu wissen.</strong> Viele beliebte Zimmerpflanzen sind für Katzen, Hunde und Kleinkinder giftig. Stelle sie außer Reichweite, wasche nach dem Umtopfen die Hände und verwende Pflanzenschutzmittel nur nach Gebrauchsanweisung. Mehr in unseren <a href="/pflanzensicherheit/">Hinweisen zur Pflanzensicherheit</a>.</p></aside>
    </div>
  </div>
</article>
<section class="garten-raster garten-raster--weiter" aria-labelledby="wt-t">
  <header class="garten-ueber"><p class="garten-ueber__zeile">Weiter gärtnern</p><h2 id="wt-t">Passende Ratgeber</h2></header>
  <div class="garten-raster__karten">${a.related.map((r) => blatt(ctx, r)).join("")}</div>
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
    "anleitung"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="garten-ratgeber garten-ratgeber--seite">
  <header class="garten-ratgeber__kopf">
    <nav class="garten-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="garten-ratgeber__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="garten-ratgeber__intro">Stand: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="garten-ratgeber__koerper garten-ratgeber__koerper--eins"><div class="garten-ratgeber__text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="garten-leer">
  <p class="garten-leer__code">404</p>
  <h1>Hier wächst nichts</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. Such dir einen Garten aus:</p>
  <ul class="garten-beete__reihe">${ctx.categories.map((c) => `<li><a class="garten-terrasse" href="${c.url}">${icon(c.icon, "garten-terrasse__icon")}<span class="garten-terrasse__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei BYOXY nicht.", path: "/404.html", noindex: true }, body, "leer");
}
