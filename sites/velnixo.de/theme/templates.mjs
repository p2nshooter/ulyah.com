// VELNIXO — "Die ehernen Räder".
//
// Solomon's master craftsman cast ten bronze stands for the temple court, and
// each stood on wheels "like the wheels of a chariot: their axles, their rims,
// their spokes and their hubs, all of cast bronze" (1 Kön 7:33). A wheel made
// with that much care is the spirit of VELNIXO: patina green, warm bronze,
// cream paper and deep teal night. The hero is a bronze wheel turning slowly on
// a paved road that winds into the hills, with the sun low behind arches of
// verdigris. No figures, only wheels, roads, hills and light. Every class here
// (nabe-, speiche-, felge-) is VELNIXO's own.

const ICONS = {
  frame: `<path d="M12 34l9-16h12l-6 16H12zM21 18l-3-6h-4M33 18l3-6h4M27 34l9-16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="12" cy="34" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="36" cy="34" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
  wrench: `<path d="M31 7a9 9 0 0 0-9 12L8 33a3.5 3.5 0 0 0 5 5l14-14a9 9 0 0 0 12-9l-6 6-5-1-1-5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
  bolt: `<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M26 10l-9 16h7l-2 12 9-16h-7z" fill="currentColor"/>`,
  shield: `<path d="M24 6l15 6v10c0 10-6 17-15 20-9-3-15-10-15-20V12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M17 24l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  route: `<circle cx="12" cy="38" r="4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="36" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15 36c10-4 4-14 12-16s6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="3 4" stroke-linecap="round"/>`,
  bag: `<path d="M10 18h28l-2 22H12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 18v-4a6 6 0 0 1 12 0v4M10 26h28" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.frame}</svg>`;

/** A spoked wheel: rim, hub and `n` spokes. Used in the hero, menu and marks. */
const wheel = (cx, cy, r, n = 16, cls = "") => {
  const spokes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return `<path d="M${cx} ${cy}L${(cx + Math.cos(a) * r * 0.92).toFixed(1)} ${(cy + Math.sin(a) * r * 0.92).toFixed(1)}"/>`;
  }).join("");
  return `<g class="${cls}" style="transform-origin:${cx}px ${cy}px">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#felgeBronze)" stroke-width="${(r * 0.09).toFixed(1)}"/>
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.86).toFixed(1)}" fill="none" stroke="#e8c98f" stroke-width="1" opacity=".55"/>
    <g stroke="#e8c98f" stroke-width="${Math.max(1, r * 0.018).toFixed(1)}" opacity=".9">${spokes}</g>
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.12).toFixed(1)}" fill="url(#felgeBronze)" stroke="#3b2a14" stroke-width="1.2"/>
  </g>`;
};

/** Spain, 2026 world champions — a red-and-gold wheel rolling along a ribbon. */
const champions = () => `<aside class="nabe-meister" role="note" aria-label="Spanien, Weltmeister 2026">
  <span class="nabe-meister__rad" aria-hidden="true">
    <svg viewBox="0 0 40 40" width="30" height="30" focusable="false">
      <circle cx="20" cy="20" r="17" fill="none" stroke="#c60b1e" stroke-width="4"/>
      <circle cx="20" cy="20" r="12" fill="none" stroke="#ffc400" stroke-width="2"/>
      <g stroke="#ffc400" stroke-width="1.6">${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<path d="M20 20L${(20 + Math.cos(a) * 12).toFixed(1)} ${(20 + Math.sin(a) * 12).toFixed(1)}"/>`; }).join("")}</g>
      <circle cx="20" cy="20" r="3" fill="#c60b1e"/>
    </svg>
  </span>
  <p><strong>Spanien</strong> – Fußball-Weltmeister <em>2026</em> <span class="nabe-meister__aside">· Glückwunsch aus der Speichenwerkstatt</span></p>
  <span class="nabe-meister__band" aria-hidden="true"></span>
</aside>`;

/**
 * The hero: two bronze wheels on a paved road that winds into patina hills,
 * a low sun behind three verdigris arches, and the road's centre line
 * flowing towards the viewer.
 */
const road = () => `<svg class="felge-scene" viewBox="0 0 600 420" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="felgeSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2b2b"/><stop offset=".55" stop-color="#1f5450"/><stop offset="1" stop-color="#d9a35b"/></linearGradient>
    <linearGradient id="felgeBronze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2d29b"/><stop offset=".45" stop-color="#c0843f"/><stop offset="1" stop-color="#6e4519"/></linearGradient>
    <radialGradient id="felgeSun"><stop offset="0" stop-color="#fff3d6"/><stop offset=".6" stop-color="#f4c77a"/><stop offset="1" stop-color="#f4c77a" stop-opacity="0"/></radialGradient>
    <linearGradient id="felgeRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5a55"/><stop offset="1" stop-color="#1d2826"/></linearGradient>
  </defs>
  <rect width="600" height="420" fill="url(#felgeSky)"/>
  <circle class="felge-sun" cx="300" cy="196" r="70" fill="url(#felgeSun)"/>
  <g class="felge-arches" fill="none" stroke="#7fb3a3" stroke-width="3" opacity=".75">
    <path d="M150 230V150a40 46 0 0 1 80 0v80"/><path d="M260 230V128a40 50 0 0 1 80 0v102"/><path d="M370 230V150a40 46 0 0 1 80 0v80"/>
  </g>
  <path d="M0 250c80-40 160-34 230-12s150 20 220-10 110-16 150 2v190H0z" fill="#2f6b5f"/>
  <path d="M0 286c110-30 200-20 290 0s200 14 310-14v148H0z" fill="#235147"/>
  <path class="felge-roadbed" d="M258 230c-10 40-90 80-210 190h504c-120-110-200-150-210-190z" fill="url(#felgeRoad)"/>
  <g class="felge-line" stroke="#f2d29b" stroke-width="4" stroke-linecap="round">
    ${Array.from({ length: 7 }, (_, i) => `<path style="--d:${(i * 0.35).toFixed(2)}s" d="M300 ${236 + i * 26}v${6 + i * 3}"/>`).join("")}
  </g>
  <g class="felge-stones" fill="#7fb3a3" opacity=".35">${Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 71) % 600}" cy="${300 + ((i * 37) % 110)}" r="${1 + (i % 3)}"/>`).join("")}</g>
  ${wheel(160, 330, 62, 18, "felge-wheel")}
  ${wheel(440, 330, 62, 18, "felge-wheel felge-wheel--b")}
  <path d="M160 330L230 268h150l60 62M230 268l-20-24h-22M380 268l14-28h26" fill="none" stroke="#e8c98f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M230 268l70 62h-140M300 330l80-62" fill="none" stroke="#c0843f" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="300" cy="330" r="10" fill="url(#felgeBronze)" stroke="#3b2a14"/>
</svg>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="nabe nabe--${kind}">
<a class="nabe-skip" href="#main">Zum Inhalt springen</a>
<div class="nabe-kette" aria-hidden="true"><span></span></div>
${champions()}
<header class="nabe-kopf">
  <div class="nabe-kopf__in">
    <a class="nabe-marke" href="/" aria-label="${esc(site.name)} – Startseite">
      <span class="nabe-marke__rad" aria-hidden="true"><svg viewBox="0 0 44 44" width="40" height="40"><circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" stroke-width="3"/><g stroke="currentColor" stroke-width="1.4">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M22 22L${(22 + Math.cos(a) * 16).toFixed(1)} ${(22 + Math.sin(a) * 16).toFixed(1)}"/>`; }).join("")}</g><circle cx="22" cy="22" r="3.4" fill="currentColor"/></svg></span>
      <span class="nabe-marke__wort">VELNIXO</span>
      <span class="nabe-marke__lang">${esc(site.expansion)}</span>
    </a>
    <button class="nabe-schalter" type="button" aria-expanded="false" aria-controls="nabe-nav">Rubriken <span class="nabe-schalter__rad" aria-hidden="true"></span></button>
    <nav id="nabe-nav" class="nabe-nav" aria-label="Rubriken">
      <a class="nabe-nav__item" href="/"><span class="speiche" aria-hidden="true"></span>Start</a>
      ${categories.map((c) => `<a class="nabe-nav__item" href="${c.url}"><span class="speiche" aria-hidden="true"></span>${esc(c.name)}</a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="nabe-nav__item nabe-nav__item--leise" href="${m.href}">${esc(m.label)}</a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="nabe-fuss">
  <div class="nabe-fuss__in">
    <section class="nabe-fuss__marke">
      <p class="nabe-fuss__wort">VELNIXO</p>
      <p class="nabe-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Rubriken">
      <p class="nabe-fuss__titel">Rubriken</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Über VELNIXO">
      <p class="nabe-fuss__titel">Werkstattbüro</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="nabe-fuss__hinweis">© ${new Date().getFullYear()} VELNIXO · ${esc(site.domain)} · Allgemeine Informationen rund ums Radfahren. Sicherheitsrelevante Arbeiten an Bremsen, Lenkung, Rahmen, Akku und Motor gehören im Zweifel in eine Fachwerkstatt.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A spoke card: rubric hub, title, summary and reading time. */
const karte = (ctx, a, extra = "") => `<article class="speiche-karte ${extra}">
  <a class="speiche-karte__link" href="${a.url}">
    <span class="speiche-karte__rubrik">${icon(a.cat.icon, "speiche-karte__icon")}${ctx.esc(a.cat.name)}</span>
    <h3 class="speiche-karte__titel">${ctx.esc(a.title)}</h3>
    <p class="speiche-karte__text">${ctx.esc(a.description)}</p>
    <span class="speiche-karte__fuss">${a.minutes} Min. Lesezeit <span class="speiche-karte__pfeil" aria-hidden="true">→</span></span>
  </a>
</article>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="nabe-held">
  <figure class="nabe-held__bild">${road()}</figure>
  <div class="nabe-held__text">
    <p class="nabe-held__dach">Der Fahrradratgeber für Deutschland</p>
    <h1 class="nabe-held__titel">Gut ausgewählt, gut gepflegt, <em>gut unterwegs</em></h1>
    <p class="nabe-held__lead">${esc(site.tagline)}.</p>
    <p class="nabe-held__intro">${esc(site.description)}</p>
    <p class="nabe-held__knoepfe">${first ? `<a class="nabe-knopf" href="${first.url}">Jetzt lesen</a>` : ""}<a class="nabe-knopf nabe-knopf--hohl" href="/ueber-uns/">Unser Anspruch</a></p>
  </div>
</section>

${first ? `<section class="nabe-auswahl" aria-label="Empfohlen">
  ${karte(ctx, first, "speiche-karte--breit")}
  ${[second, third].filter(Boolean).map((a) => karte(ctx, a)).join("")}
</section>` : `<p class="nabe-bald">Die ersten Ratgeber entstehen gerade von Hand. Schau bald wieder vorbei.</p>`}

<section class="nabe-rubriken" aria-labelledby="rb-t">
  <header class="nabe-ueber"><p class="nabe-ueber__dach">Sechs Rubriken</p><h2 id="rb-t">Wohin soll es heute gehen?</h2></header>
  <ul class="nabe-rubriken__raster">
    ${categories.map((c, i) => `<li><a class="nabe-rubrik" href="${c.url}">
      <span class="nabe-rubrik__nr">${String(i + 1).padStart(2, "0")}</span>
      <span class="nabe-rubrik__icon">${icon(c.icon)}</span>
      <span class="nabe-rubrik__name">${esc(c.name)}</span>
      <span class="nabe-rubrik__text">${esc(c.description)}</span>
      <span class="nabe-rubrik__zahl">${c.articles.length} Ratgeber</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${rest.length ? `<section class="nabe-neu" aria-labelledby="neu-t">
  <header class="nabe-ueber"><p class="nabe-ueber__dach">Neu in der Werkstatt</p><h2 id="neu-t">Neueste Ratgeber</h2></header>
  <div class="nabe-neu__raster">${rest.slice(0, 12).map((a) => karte(ctx, a)).join("\n    ")}</div>
</section>` : ""}

<section class="nabe-archiv" aria-labelledby="ar-t">
  <header class="nabe-ueber nabe-ueber--nacht"><p class="nabe-ueber__dach">Das ganze Archiv</p><h2 id="ar-t">Alle Ratgeber nach Rubrik</h2></header>
  <div class="nabe-archiv__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `VELNIXO – ${site.tagline}`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="nabe-rubrikkopf">
  <nav class="nabe-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
  <span class="nabe-rubrikkopf__icon">${icon(c.icon)}</span>
  <h1>${esc(c.name)}</h1>
  <p>${esc(c.description)}</p>
  <p class="nabe-rubrikkopf__zahl">${c.articles.length} Ratgeber in dieser Rubrik</p>
</header>
<section class="nabe-neu nabe-neu--rubrik"><div class="nabe-neu__raster">
  ${c.articles.map((a) => karte(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Ratgeber rund ums Fahrrad`,
      description: `${c.description} ${c.articles.length} Ratgeber von ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "rubrik"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="nabe-beitrag">
  <header class="nabe-beitrag__kopf">
    <nav class="nabe-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="nabe-beitrag__titel">${esc(a.title)}</h1>
    <p class="nabe-beitrag__lead">${esc(a.description)}</p>
    <p class="nabe-beitrag__meta">Von der ${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} Min. Lesezeit</p>
  </header>
  <div class="nabe-beitrag__koerper">
    ${toc.length > 2 ? `<nav class="nabe-inhalt" aria-label="In diesem Ratgeber"><p class="nabe-inhalt__titel">In diesem Ratgeber</p><ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol></nav>` : ""}
    <div class="nabe-text">
${a.html}
      <aside class="nabe-hinweis"><p><strong>Sicher schrauben.</strong> VELNIXO gibt allgemeine Hinweise. Maßgeblich sind die Angaben des Herstellers deines Fahrrads und seiner Bauteile. Arbeiten an Bremsen, Lenkung, Gabel, Rahmen, Laufrädern sowie an Akku und Motor eines E-Bikes sind sicherheitsrelevant: Wenn du unsicher bist, übernimmt das eine Fachwerkstatt. Nach jeder Arbeit gilt: erst eine Probefahrt auf einem ruhigen Platz.</p></aside>
    </div>
  </div>
</article>
<section class="nabe-neu nabe-neu--weiter" aria-labelledby="mehr-t">
  <header class="nabe-ueber"><p class="nabe-ueber__dach">Weiterfahren</p><h2 id="mehr-t">Das könnte dich auch interessieren</h2></header>
  <div class="nabe-neu__raster">${a.related.map((r) => karte(ctx, r)).join("")}</div>
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
    "beitrag"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="nabe-beitrag nabe-beitrag--seite">
  <header class="nabe-beitrag__kopf">
    <nav class="nabe-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="nabe-beitrag__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="nabe-beitrag__meta">Zuletzt geprüft am ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="nabe-beitrag__koerper nabe-beitrag__koerper--eins"><div class="nabe-text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="nabe-verloren">
  <p class="nabe-verloren__code">404</p>
  <h1>Hier endet der Radweg</h1>
  <p>Die gesuchte Seite gibt es nicht (mehr). Vielleicht hilft dir eine unserer Rubriken weiter:</p>
  <ul class="nabe-rubriken__raster">${ctx.categories.map((c) => `<li><a class="nabe-rubrik" href="${c.url}"><span class="nabe-rubrik__icon">${icon(c.icon)}</span><span class="nabe-rubrik__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es auf VELNIXO nicht.", path: "/404.html", noindex: true }, body, "verloren");
}
