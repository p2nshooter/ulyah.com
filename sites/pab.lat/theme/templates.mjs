// PAB — "Tadmor, la ciudad en el desierto".
//
// Solomon "built Tadmor in the wilderness" (1 Reyes 9:18 / 2 Crónicas 8:4):
// the oasis city on the caravan routes, where every traveller stopped to rest,
// trade stories and set out again. Night indigo, desert sand, turquoise water,
// sunset coral and palm green. The passport stamp is the site's signature —
// on the menu, the cards and the banner. Its classes (tadmor-, sello-, oasis-)
// are its own.

const ICONS = {
  ola: `<path d="M4 30c5 0 5-5 10-5s5 5 10 5 5-5 10-5 5 5 10 5M4 38c5 0 5-5 10-5s5 5 10 5 5-5 10-5 5 5 10 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="34" cy="13" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
  arco: `<path d="M8 42V22a16 16 0 0 1 32 0v20" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 42V24a8 8 0 0 1 16 0v18M4 42h40" fill="none" stroke="currentColor" stroke-width="2"/>`,
  montana: `<path d="M4 40l14-24 8 12 6-8 12 20z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 23l4 3 4-3" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
  camino: `<path d="M18 6L8 42M30 6l10 36" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 10v6M24 22v6M24 34v6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  maleta: `<rect x="8" y="14" width="32" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M18 14v-4h12v4M8 24h32" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
  plato: `<circle cx="24" cy="26" r="13" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="24" cy="26" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 8v12M4 8v6a2 2 0 0 0 4 0V8M42 8c-3 2-3 8 0 10v14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.camino}</svg>`;

/** España, campeona del mundo 2026 — an entry stamp in red and gold ink. */
const champions = () => `<aside class="tadmor-sellado" role="note" aria-label="España, campeona del mundo 2026">
  <svg class="tadmor-sellado__sello" viewBox="0 0 80 80" width="44" height="44" aria-hidden="true" focusable="false">
    <circle cx="40" cy="40" r="35" fill="none" stroke="#c60b1e" stroke-width="3"/>
    <circle cx="40" cy="40" r="27" fill="none" stroke="#c60b1e" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M40 22l4 9 10 1-7.5 6.5 2.5 9.5-9-5-9 5 2.5-9.5L26 32l10-1z" fill="#ffc400" stroke="#c60b1e" stroke-width="1.2"/>
    <text x="40" y="60" text-anchor="middle" font-size="9" font-weight="700" fill="#c60b1e" font-family="Arial, sans-serif">2026</text>
  </svg>
  <p><strong>España</strong> campeona del mundo 2026 <span>· ¡sello de honor en el pasaporte!</span></p>
</aside>`;

/** The oasis of Tadmor: night sky, rising sun, colonnade ruins, palms and water. */
const oasis = () => `<svg class="tadmor-oasis" viewBox="0 0 600 340" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="tadCielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2340"/><stop offset=".55" stop-color="#4a3a63"/><stop offset=".85" stop-color="#e2725b"/><stop offset="1" stop-color="#f3b26b"/></linearGradient>
    <linearGradient id="tadArena" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d9b9"/><stop offset="1" stop-color="#c9ad7d"/></linearGradient>
  </defs>
  <rect width="600" height="340" fill="url(#tadCielo)"/>
  <g class="tadmor-oasis__estrellas" fill="#fff6dc">${[[60, 40], [130, 70], [210, 30], [300, 55], [380, 25], [460, 60], [540, 35], [95, 110], [500, 105]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join("")}</g>
  <circle class="tadmor-oasis__sol" cx="300" cy="250" r="56" fill="#ffd27a"/>
  <g fill="#3a2f45" opacity=".85">${[150, 190, 230, 370, 410, 450].map((x) => `<rect x="${x}" y="196" width="14" height="80" rx="2"/><rect x="${x - 4}" y="190" width="22" height="8" rx="1"/>`).join("")}<rect x="140" y="182" width="88" height="10"/><rect x="362" y="182" width="104" height="10"/></g>
  <path d="M0 280c90-24 180-18 300-8s210 6 300-12v80H0z" fill="url(#tadArena)"/>
  <ellipse cx="300" cy="300" rx="120" ry="14" fill="#2aa198" opacity=".85"/>
  <ellipse class="tadmor-oasis__brillo" cx="300" cy="298" rx="60" ry="4" fill="#bff3ea"/>
  <g fill="none" stroke="#2e4f3c" stroke-width="5" stroke-linecap="round">
    <path d="M95 300c4-30 2-56-6-82"/><path d="M505 300c-4-30-2-56 6-82"/>
  </g>
  <g fill="#3d6b4f" class="tadmor-oasis__palmas">
    <path d="M89 218c-20-8-38-2-46 8 18-4 30-4 46-8zM89 218c18-10 38-6 46 4-16-2-30-2-46-4zM89 218c-6-18 2-32 14-36-6 14-8 24-14 36zM89 218c-14 4-24 16-26 30 10-12 16-20 26-30z"/>
    <path d="M511 218c20-8 38-2 46 8-18-4-30-4-46-8zM511 218c-18-10-38-6-46 4 16-2 30-2 46-4zM511 218c6-18-2-32-14-36 6 14 8 24 14 36zM511 218c14 4 24 16 26 30-10-12-16-20-26-30z"/>
  </g>
</svg>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="tadmor tadmor--${kind}">
<a class="tadmor-salta" href="#viaje">Saltar al contenido</a>
<div class="tadmor-ruta" aria-hidden="true"><span></span></div>
${champions()}
<header class="tadmor-barra">
  <div class="tadmor-barra__dentro">
    <a class="tadmor-logo" href="/" aria-label="${esc(site.name)} — inicio">
      <svg class="tadmor-logo__sello" viewBox="0 0 64 64" width="44" height="44" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 3"/><path d="M20 40c4-10 8-14 12-14s8 4 12 14M32 26v-8M28 20c2-3 6-3 8 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      <span><span class="tadmor-logo__sigla">PAB</span><span class="tadmor-logo__nombre">${esc(site.expansion)}</span></span>
    </a>
    <button class="tadmor-desplegar" type="button" aria-expanded="false" aria-controls="tadmor-nav">Destinos</button>
    <nav id="tadmor-nav" class="tadmor-nav" aria-label="Destinos">
      ${categories.map((c) => `<a class="tadmor-nav__destino" href="${c.url}"><span class="tadmor-nav__sello" aria-hidden="true"></span>${esc(c.name)}</a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="tadmor-nav__destino tadmor-nav__destino--info" href="${m.href}">${esc(m.label)}</a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="viaje">
${body}
</main>
<footer class="tadmor-pie">
  <div class="tadmor-pie__dunas" aria-hidden="true"></div>
  <div class="tadmor-pie__dentro">
    <section>
      <p class="tadmor-pie__sigla">PAB</p>
      <p class="tadmor-pie__nombre">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Destinos del pie"><p class="tadmor-pie__titulo">Destinos</p><ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul></nav>
    <nav aria-label="Información"><p class="tadmor-pie__titulo">La revista</p><ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul></nav>
  </div>
  <p class="tadmor-pie__aviso">© ${new Date().getFullYear()} PAB · ${esc(site.domain)} · Requisitos de entrada, horarios y precios cambian: confírmalos siempre en fuentes oficiales antes de viajar.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

const postal = (ctx, a, extra = "") => `<article class="postal ${extra}">
  <a class="postal__enlace" href="${a.url}">
    <span class="postal__sello" aria-hidden="true">${icon(a.cat.icon, "postal__icono")}</span>
    <span class="postal__destino">${ctx.esc(a.cat.name)}</span>
    <h3 class="postal__titulo">${ctx.esc(a.title)}</h3>
    <p class="postal__resumen">${ctx.esc(a.description)}</p>
    <span class="postal__pie">${a.minutes} min de lectura <span aria-hidden="true">→</span></span>
  </a>
</article>`;

const preparandoMaletas = () => `<section class="tadmor-maletas" aria-labelledby="mal-t">
  <p class="tadmor-encabezado__ante">Haciendo la maleta</p>
  <h2 id="mal-t" class="tadmor-encabezado__titulo">Las primeras bitácoras están en camino</h2>
  <p>Estamos escribiendo y verificando las primeras guías de PAB. Cada una se publica completa, con datos comprobados en fuentes oficiales y sin promociones disfrazadas. Mientras tanto, conoce <a href="/sobre-nosotros/">la revista</a> y nuestra <a href="/politica-editorial/">política editorial</a>.</p>
</section>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, ...rest] = articles;
  const body = `
<section class="tadmor-portada">
  <div class="tadmor-portada__dentro">
    <div class="tadmor-portada__texto">
      <p class="tadmor-portada__ante">Revista de viajes · América Latina</p>
      <h1 class="tadmor-portada__titulo">Paisajes, aventuras <em>y bitácoras</em> para viajar mejor</h1>
      <p class="tadmor-portada__entrada">${esc(site.description)}</p>
      <p class="tadmor-portada__acciones">${first ? `<a class="tadmor-boton" href="${first.url}">Abrir la última bitácora</a>` : `<a class="tadmor-boton" href="/sobre-nosotros/">Conoce PAB</a>`}<a class="tadmor-boton tadmor-boton--borde" href="/politica-editorial/">Cómo verificamos</a></p>
    </div>
    <figure class="tadmor-portada__figura">${oasis()}</figure>
  </div>
</section>

<section class="tadmor-destinos" aria-labelledby="des-t">
  <header class="tadmor-encabezado"><p class="tadmor-encabezado__ante">Seis rumbos</p><h2 id="des-t" class="tadmor-encabezado__titulo">¿A dónde vamos?</h2></header>
  <ul class="tadmor-destinos__lista">
    ${categories.map((c) => `<li><a class="rumbo" href="${c.url}">
      <span class="rumbo__sello">${icon(c.icon, "rumbo__icono")}</span>
      <span class="rumbo__nombre">${esc(c.name)}</span>
      <span class="rumbo__texto">${esc(c.description)}</span>
      <span class="rumbo__cuenta">${c.articles.length ? `${c.articles.length} bitácoras` : "Próximamente"}</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${articles.length ? `<section class="tadmor-postales" aria-labelledby="pos-t">
  <header class="tadmor-encabezado"><p class="tadmor-encabezado__ante">Recién llegadas</p><h2 id="pos-t" class="tadmor-encabezado__titulo">Últimas bitácoras</h2></header>
  <div class="tadmor-rejilla">
    ${first ? postal(ctx, first, "postal--grande") : ""}
    ${rest.slice(0, 10).map((a) => postal(ctx, a)).join("\n    ")}
  </div>
</section>
<section class="tadmor-mapa" aria-labelledby="map-t">
  <header class="tadmor-encabezado tadmor-encabezado--noche"><p class="tadmor-encabezado__ante">Mapa completo</p><h2 id="map-t" class="tadmor-encabezado__titulo">Todas las bitácoras por destino</h2></header>
  <div class="tadmor-mapa__cols">
    ${categories.filter((c) => c.articles.length).map((c) => `<section><h3><a href="${c.url}">${esc(c.name)}</a></h3><ul>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ul></section>`).join("\n    ")}
  </div>
</section>` : preparandoMaletas()}`;
  return layout(ctx, { title: `PAB — ${site.expansion} por América Latina`, description: site.description, path: "/" }, body, "inicio");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="tadmor-destino">
  <div class="tadmor-destino__dentro">
    <nav class="tadmor-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="tadmor-destino__sello">${icon(c.icon, "tadmor-destino__icono")}</span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
  </div>
</header>
${c.articles.length ? `<section class="tadmor-postales"><div class="tadmor-rejilla">${c.articles.map((a) => postal(ctx, a)).join("\n")}</div></section>` : preparandoMaletas()}`;
  return layout(
    ctx,
    {
      title: `${c.name}: guías de viaje por América Latina`,
      description: c.description.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "destino"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="tadmor-bitacora">
  <header class="tadmor-bitacora__cabecera">
    <nav class="tadmor-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="tadmor-bitacora__titulo">${esc(a.title)}</h1>
    <p class="tadmor-bitacora__entrada">${esc(a.description)}</p>
    <p class="tadmor-bitacora__datos">${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} min de lectura</p>
  </header>
  <div class="tadmor-bitacora__cuerpo">
    <aside class="tadmor-pasaporte" aria-label="Pasaporte de la guía">
      <p class="tadmor-pasaporte__titulo">Pasaporte de la guía</p>
      <dl>
        <div><dt>Destino</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lectura</dt><dd>${a.minutes} min</dd></div>
        <div><dt>Verificado</dt><dd><time datetime="${a.updated}">${a.updatedLabel}</time></dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="tadmor-pasaporte__titulo">Itinerario</p><ol class="tadmor-pasaporte__itinerario">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="tadmor-relato">
${a.html}
      <aside class="tadmor-advertencia"><p><strong>Antes de salir.</strong> Requisitos de entrada, vacunas, horarios, precios y condiciones de seguridad cambian con frecuencia. Confírmalos en las fuentes oficiales del país (migración, cancillería, parques nacionales, autoridades sanitarias) poco antes de viajar. Lee el <a href="/descargo-de-responsabilidad/">descargo de responsabilidad</a>.</p></aside>
    </div>
  </div>
</article>
<section class="tadmor-postales tadmor-postales--mas" aria-labelledby="mas-t">
  <header class="tadmor-encabezado"><p class="tadmor-encabezado__ante">Siguiente parada</p><h2 id="mas-t" class="tadmor-encabezado__titulo">Bitácoras relacionadas</h2></header>
  <div class="tadmor-rejilla">${a.related.map((r) => postal(ctx, r)).join("")}</div>
</section>`;
  return layout(
    ctx,
    {
      title: a.title,
      description: a.description,
      path: a.url,
      type: "article",
      jsonld: [
        ctx.crumbs([{ name: "Inicio", path: "/" }, { name: a.cat.name, path: a.cat.url }, { name: a.title, path: a.url }]),
        {
          "@type": "Article",
          headline: a.title,
          description: a.description,
          datePublished: a.date,
          dateModified: a.updated,
          inLanguage: site.lang,
          wordCount: a.words,
          articleSection: a.cat.name,
          author: { "@type": "Organization", name: site.author, url: `${base}/sobre-nosotros/` },
          publisher: { "@id": `${base}/#org` },
          mainEntityOfPage: `${base}${a.url}`,
        },
      ],
    },
    body,
    "bitacora"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="tadmor-bitacora tadmor-bitacora--pagina">
  <header class="tadmor-bitacora__cabecera">
    <nav class="tadmor-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="tadmor-bitacora__titulo">${esc(p.title)}</h1>
    ${p.updated ? `<p class="tadmor-bitacora__datos">Última revisión: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="tadmor-bitacora__cuerpo tadmor-bitacora__cuerpo--uno"><div class="tadmor-relato">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: p.title, path: p.url }])] }, body, "pagina");
}

export function notFound(ctx) {
  const body = `
<section class="tadmor-extraviado">
  <p class="tadmor-extraviado__codigo">404</p>
  <h1>Este camino no lleva a ninguna parte</h1>
  <p>Quizá el enlace cambió. Vuelve al <a href="/">inicio</a> o elige un destino:</p>
  <ul class="tadmor-destinos__lista">${ctx.categories.map((c) => `<li><a class="rumbo rumbo--mini" href="${c.url}"><span class="rumbo__sello">${icon(c.icon, "rumbo__icono")}</span><span class="rumbo__nombre">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en PAB.", path: "/404.html", noindex: true }, body, "extraviado");
}
