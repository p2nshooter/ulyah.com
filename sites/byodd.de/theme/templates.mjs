// BYODD — "Zedernhalle mit Marmorbögen".
//
// The cedar hall of the palace (1 Kings 7:2): cedar beams overhead, ivory
// marble arches below, emerald and gold inlay. Menu items rise into arches,
// the tile floor turns slowly, and a spirit level in the header measures how
// far you have read. Every class here (zeder-, bogen-, marmor-) is BYODD's
// own and appears in no other site of the network.

const ICONS = {
  hammer: `<path d="M10 40 28 22" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M24 12l10-3 7 7-3 10-6-1-2-6-6-2z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
  rolle: `<rect x="8" y="8" width="28" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M36 13h4v10H22v6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><rect x="19" y="29" width="6" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/>`,
  saege: `<path d="M6 30 36 12l4 6-30 18z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M10 34l2 4 3-5 2 4 3-5 2 4 3-5 2 4 3-5 2 4 3-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M36 12l5-4 3 5-4 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
  tropfen: `<path d="M24 6c-6 9-12 15-12 22a12 12 0 0 0 24 0c0-7-6-13-12-22z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M18 29a6 6 0 0 0 5 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  lampe: `<path d="M14 26h20l-5-16H19z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 26v12M16 42h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M20 30l-2 4M28 30l2 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  schluessel: `<circle cx="16" cy="18" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="16" cy="18" r="2.5" fill="currentColor"/><path d="M22 24 40 42M33 35l4-4M37 39l3-3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.hammer}</svg>`;

/** Spanien, Weltmeister 2026 — a folding carpenter's rule that unfolds to
 * 2026, a small rojigualda pennant and a ball rolling along the rule. */
const champions = () => `<aside class="marmor-zollstock" role="note" aria-label="Spanien, Fußball-Weltmeister 2026">
  <div class="marmor-zollstock__innen">
    <span class="marmor-zollstock__wimpel" aria-hidden="true"></span>
    <span class="marmor-zollstock__lineal" aria-hidden="true"><i></i><i></i><i></i><i></i><b>2026</b></span>
    <p class="marmor-zollstock__text"><strong>Spanien</strong> ist Fußball-Weltmeister 2026</p>
    <span class="marmor-zollstock__ball" aria-hidden="true">⚽</span>
    <span class="marmor-zollstock__pokal" aria-hidden="true">🏆</span>
  </div>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="zeder zeder--${kind}">
<a class="zeder-sprung" href="#inhalt">Zum Inhalt springen</a>
${champions()}
<header class="zeder-kopf">
  <div class="zeder-kopf__balken" aria-hidden="true"></div>
  <div class="zeder-kopf__innen">
    <a class="zeder-marke" href="/" aria-label="${esc(site.name)} — Startseite">
      <span class="zeder-marke__bogen" aria-hidden="true"><span>B</span></span>
      <span class="zeder-marke__texte"><span class="zeder-marke__name">BYODD</span><span class="zeder-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <span class="zeder-wasserwaage" aria-hidden="true" title="Lesefortschritt"><span class="zeder-wasserwaage__blase"></span></span>
    <button class="zeder-knopf" type="button" aria-expanded="false" aria-controls="zeder-menue">Themen</button>
  </div>
  <nav id="zeder-menue" class="zeder-menue" aria-label="Themen">
    <a class="zeder-menue__bogen" href="/"><span>Start</span></a>
    ${categories.map((c) => `<a class="zeder-menue__bogen" href="${c.url}"><span>${esc(c.name)}</span></a>`).join("\n    ")}
    ${site.menu.map((m) => `<a class="zeder-menue__bogen zeder-menue__bogen--klein" href="${m.href}"><span>${esc(m.label)}</span></a>`).join("\n    ")}
  </nav>
</header>
<main id="inhalt">
${body}
</main>
<footer class="zeder-fuss">
  <div class="zeder-fuss__boegen" aria-hidden="true"></div>
  <div class="zeder-fuss__innen">
    <section>
      <p class="zeder-fuss__name">BYODD</p>
      <p class="zeder-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen">
      <p class="zeder-fuss__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="BYODD">
      <p class="zeder-fuss__titel">BYODD</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="zeder-fuss__hinweis">© ${new Date().getFullYear()} BYODD · ${esc(site.domain)} · Unabhängige Anleitungen für Heimwerker. Arbeiten an Strom-, Gas- und tragenden Bauteilen gehören in die Hände zugelassener Fachbetriebe. Lies unsere <a href="/sicherheitshinweise/">Sicherheitshinweise</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A marble arch card: the arch fills with light when it comes into view. */
const bogen = (ctx, a, extra = "") => `<article class="bogen ${extra}">
  <a class="bogen__link" href="${a.url}">
    <span class="bogen__kopf">${icon(a.cat.icon, "bogen__icon")}<span class="bogen__thema">${ctx.esc(a.cat.name)}</span></span>
    <h3 class="bogen__titel">${ctx.esc(a.title)}</h3>
    <p class="bogen__text">${ctx.esc(a.description)}</p>
    <span class="bogen__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="bogen__pfeil" aria-hidden="true">→</span></span>
  </a>
</article>`;

/** The hero: three marble arches over a slowly turning tile floor. */
const halle = () => `<svg class="zeder-halle" viewBox="0 0 360 260" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="hMarmor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf7ef"/><stop offset=".55" stop-color="#ece2cf"/><stop offset="1" stop-color="#fbf7ef"/></linearGradient>
    <pattern id="hFliese" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 0 24 12 12 24 0 12Z" fill="#0f6b52" fill-opacity=".18"/><circle cx="12" cy="12" r="2.5" fill="#c9a24a" fill-opacity=".5"/></pattern>
  </defs>
  <g class="zeder-halle__boden"><rect x="-60" y="200" width="480" height="120" fill="url(#hFliese)"/></g>
  <g fill="url(#hMarmor)" stroke="#6b3f22" stroke-width="3">
    <path d="M20 220V110a50 50 0 0 1 100 0v110z"/>
    <path d="M130 220V80a50 50 0 0 1 100 0v140z"/>
    <path d="M240 220V110a50 50 0 0 1 100 0v110z"/>
  </g>
  <g fill="none" stroke="#c9a24a" stroke-width="2"><path d="M34 220V112a36 36 0 0 1 72 0v108M144 220V82a36 36 0 0 1 72 0v138M254 220V112a36 36 0 0 1 72 0v108"/></g>
  <g class="zeder-halle__licht"><path d="M180 70v40M160 90h40" stroke="#0f6b52" stroke-width="4" stroke-linecap="round"/></g>
  <rect x="0" y="220" width="360" height="12" fill="#6b3f22"/>
</svg>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="zeder-start">
  <div class="zeder-start__innen">
    <div class="zeder-start__text">
      <p class="zeder-dachzeile">Heimwerken für Mieter und Eigentümer</p>
      <h1 class="zeder-start__titel">Selbst gemacht, <em>sauber</em> und sicher</h1>
      <p class="zeder-start__claim">${esc(site.tagline)}</p>
      <p class="zeder-start__intro">${esc(site.description)}</p>
      <p class="zeder-start__knoepfe"><a class="zeder-taste" href="${first.url}">Erste Anleitung lesen</a><a class="zeder-taste zeder-taste--rahmen" href="/sicherheitshinweise/">Sicherheit zuerst</a></p>
    </div>
    <div class="zeder-start__bild">${halle()}</div>
  </div>
</section>

<section class="zeder-werkstatt" aria-labelledby="ws-t">
  <header class="zeder-ueber"><p class="zeder-ueber__zeile">Die sechs Werkstätten</p><h2 id="ws-t">Wo möchtest du anfangen?</h2></header>
  <ul class="zeder-werkstatt__reihe">
    ${categories.map((c) => `<li><a class="zeder-nische" href="${c.url}">
      ${icon(c.icon, "zeder-nische__icon")}
      <span class="zeder-nische__name">${esc(c.name)}</span>
      <span class="zeder-nische__zahl">${c.articles.length} Anleitungen</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

<section class="zeder-raster" aria-labelledby="neu-t">
  <header class="zeder-ueber"><p class="zeder-ueber__zeile">Frisch geprüft</p><h2 id="neu-t">Neue Anleitungen</h2></header>
  <div class="zeder-raster__karten">
    ${[first, second, third, ...rest.slice(0, 9)].map((a) => bogen(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="zeder-verzeichnis" aria-labelledby="vz-t">
  <header class="zeder-ueber zeder-ueber--dunkel"><p class="zeder-ueber__zeile">Alles auf einen Blick</p><h2 id="vz-t">Verzeichnis aller Anleitungen</h2></header>
  <div class="zeder-verzeichnis__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "zeder-verzeichnis__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `BYODD — ${site.expansion}: Heimwerken, Renovieren, Wohnen`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="zeder-thema">
  <div class="zeder-thema__innen">
    <nav class="zeder-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="zeder-thema__icon">${icon(c.icon)}</span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="zeder-thema__zahl">${c.articles.length} Anleitungen</p>
  </div>
</header>
<section class="zeder-raster zeder-raster--thema"><div class="zeder-raster__karten">
  ${c.articles.map((a) => bogen(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Anleitungen zum Selbermachen`,
      description: `${c.description} ${c.articles.length} Anleitungen von ${site.name}.`.slice(0, 160),
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
<article class="zeder-anleitung">
  <header class="zeder-anleitung__kopf">
    <nav class="zeder-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="zeder-anleitung__titel">${esc(a.title)}</h1>
    <p class="zeder-anleitung__intro">${esc(a.description)}</p>
  </header>
  <div class="zeder-anleitung__koerper">
    <aside class="zeder-werkbank" aria-label="Angaben zur Anleitung">
      <p class="zeder-werkbank__titel">Auf der Werkbank</p>
      <dl>
        <div><dt>Thema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Min.</dd></div>
        <div><dt>Geprüft</dt><dd><time datetime="${a.updated}">${a.dateLabel}</time></dd></div>
        <div><dt>Von</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="zeder-werkbank__titel zeder-werkbank__titel--b">Arbeitsschritte</p><ol class="zeder-werkbank__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="zeder-anleitung__text">
${a.html}
      <aside class="zeder-hinweis"><p><strong>Sicherheit geht vor.</strong> Trage passende Schutzausrüstung, prüfe vor dem Bohren auf Leitungen und überlasse Arbeiten an der Elektroinstallation, an Gasgeräten und an tragenden Bauteilen zugelassenen Fachbetrieben. Mieter klären größere Eingriffe vorher mit dem Vermieter. Mehr in unseren <a href="/sicherheitshinweise/">Sicherheitshinweisen</a>.</p></aside>
    </div>
  </div>
</article>
<section class="zeder-raster zeder-raster--weiter" aria-labelledby="wt-t">
  <header class="zeder-ueber"><p class="zeder-ueber__zeile">Weiter werkeln</p><h2 id="wt-t">Passende Anleitungen</h2></header>
  <div class="zeder-raster__karten">${a.related.map((r) => bogen(ctx, r)).join("")}</div>
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
<article class="zeder-anleitung zeder-anleitung--seite">
  <header class="zeder-anleitung__kopf">
    <nav class="zeder-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="zeder-anleitung__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="zeder-anleitung__intro">Stand: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="zeder-anleitung__koerper zeder-anleitung__koerper--eins"><div class="zeder-anleitung__text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="zeder-leer">
  <p class="zeder-leer__code">404</p>
  <h1>Hier fehlt ein Brett</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. Such dir eine Werkstatt aus:</p>
  <ul class="zeder-werkstatt__reihe">${ctx.categories.map((c) => `<li><a class="zeder-nische" href="${c.url}">${icon(c.icon, "zeder-nische__icon")}<span class="zeder-nische__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei BYODD nicht.", path: "/404.html", noindex: true }, body, "leer");
}
