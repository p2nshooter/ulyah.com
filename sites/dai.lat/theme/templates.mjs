// DAI — "La casa del bosque del Líbano".
//
// Solomon's great hall stood on "four rows of cedar pillars, with cedar beams
// upon the pillars" (1 Reyes 7:2): architecture as rhythm, timber and light.
// Lime-washed walls, cedar, terracotta, olive and brass. The colonnade is the
// site's signature — in the hero, under the menu, on the cards. Its classes
// (cedro-, columna-, plano-) are its own.

const ICONS = {
  casa: `<path d="M6 24L24 9l18 15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M11 21v18h26V21" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M20 39V28h8v11" fill="none" stroke="currentColor" stroke-width="2"/>`,
  sillon: `<path d="M10 22v-6a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M6 24a4 4 0 0 1 8 0v4h20v-4a4 4 0 0 1 8 0v10H6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 34v5M38 34v5" stroke="currentColor" stroke-width="2.2"/>`,
  grifo: `<path d="M12 18h16a8 8 0 0 1 8 8v4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M20 18v-6h-6M20 12h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M36 34c0 3-2 5-2 5s-2-2-2-5 2-5 2-5 2 2 2 5z" fill="currentColor"/>`,
  ladrillo: `<path d="M6 12h36v24H6z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M6 20h36M6 28h36M18 12v8M30 12v8M12 20v8M24 20v8M36 20v8M18 28v8M30 28v8" stroke="currentColor" stroke-width="1.6"/>`,
  palmera: `<path d="M24 42c0-10 1-18 0-26" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 16c-4-6-12-6-16-2 6 0 10 1 16 2zM24 16c4-6 12-6 16-2-6 0-10 1-16 2zM24 16c-2-6 0-10 4-12 0 5-2 8-4 12zM24 16c-6 0-11 4-12 10 5-4 8-7 12-10zM24 16c6 0 11 4 12 10-5-4-8-7-12-10z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
  sol: `<circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.casa}</svg>`;

/** España, campeona del mundo 2026 — a hand-painted azulejo in red and gold. */
const champions = () => `<aside class="cedro-azulejo" role="note" aria-label="España, campeona del mundo 2026">
  <svg class="cedro-azulejo__baldosa" viewBox="0 0 40 40" width="26" height="26" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="38" height="38" rx="3" fill="#fff8e6" stroke="#c60b1e" stroke-width="2"/>
    <path d="M20 5l5 10 10 5-10 5-5 10-5-10-10-5 10-5z" fill="#ffc400" stroke="#c60b1e" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="4" fill="#c60b1e"/>
  </svg>
  <p><strong>España</strong>, campeona del mundo <span>2026</span></p>
  <svg class="cedro-azulejo__baldosa" viewBox="0 0 40 40" width="26" height="26" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="38" height="38" rx="3" fill="#fff8e6" stroke="#c60b1e" stroke-width="2"/>
    <path d="M20 5l5 10 10 5-10 5-5 10-5-10-10-5 10-5z" fill="#ffc400" stroke="#c60b1e" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="4" fill="#c60b1e"/>
  </svg>
</aside>`;

/** The cedar colonnade: rows of pillars with a beam, light passing through. */
const colonnade = () => `<svg class="cedro-columnata" viewBox="0 0 560 300" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="cedroMadera" x1="0" x2="1"><stop offset="0" stop-color="#5a3520"/><stop offset=".45" stop-color="#9a6438"/><stop offset=".6" stop-color="#b9824f"/><stop offset="1" stop-color="#5a3520"/></linearGradient>
    <linearGradient id="cedroLuz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d1" stop-opacity=".85"/><stop offset="1" stop-color="#fff3d1" stop-opacity="0"/></linearGradient>
  </defs>
  <rect x="0" y="262" width="560" height="38" fill="#d9c7a6"/>
  <path d="M0 262h560" stroke="#b49a6c" stroke-width="2"/>
  ${[0, 1, 2, 3].map((row) => {
    const y = 40 + row * 14, h = 222 - row * 14, sc = 1 - row * 0.12, op = 1 - row * 0.18;
    return `<g opacity="${op.toFixed(2)}">${Array.from({ length: 7 }, (_, i) => {
      const x = 30 + i * 80 + row * 20;
      return `<rect x="${x}" y="${y}" width="${(22 * sc).toFixed(1)}" height="${h}" rx="3" fill="url(#cedroMadera)"/>`;
    }).join("")}<rect x="${10 + row * 20}" y="${y - 14}" width="${540 - row * 30}" height="14" rx="2" fill="#6b4126"/></g>`;
  }).reverse().join("")}
  <g class="cedro-columnata__luz"><path d="M120 0h40l90 262h-60z" fill="url(#cedroLuz)"/><path d="M300 0h30l80 262h-50z" fill="url(#cedroLuz)"/></g>
</svg>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="cedro cedro--${kind}">
<a class="cedro-saltar" href="#cuerpo">Ir al contenido</a>
<div class="cedro-avance" aria-hidden="true"><span></span></div>
${champions()}
<header class="cedro-encabezado">
  <div class="cedro-encabezado__dentro">
    <a class="cedro-logo" href="/" aria-label="${esc(site.name)} — inicio">
      <span class="cedro-logo__columnas" aria-hidden="true"><i></i><i></i><i></i></span>
      <span><span class="cedro-logo__sigla">DAI</span><span class="cedro-logo__nombre">${esc(site.expansion)}</span></span>
    </a>
    <button class="cedro-menu-boton" type="button" aria-expanded="false" aria-controls="cedro-nav"><span aria-hidden="true">☰</span> Temas</button>
    <nav id="cedro-nav" class="cedro-nav" aria-label="Temas">
      ${categories.map((c) => `<a class="cedro-nav__tema" href="${c.url}"><span class="cedro-nav__pilares" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="cedro-nav__texto">${esc(c.name)}</span></a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="cedro-nav__tema cedro-nav__tema--info" href="${m.href}"><span class="cedro-nav__texto">${esc(m.label)}</span></a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="cuerpo">
${body}
</main>
<footer class="cedro-pie">
  <div class="cedro-pie__viga" aria-hidden="true"></div>
  <div class="cedro-pie__dentro">
    <section>
      <p class="cedro-pie__sigla">DAI</p>
      <p class="cedro-pie__nombre">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Temas en el pie"><p class="cedro-pie__titulo">Temas</p><ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul></nav>
    <nav aria-label="Información"><p class="cedro-pie__titulo">DAI</p><ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul></nav>
  </div>
  <p class="cedro-pie__legal">© ${new Date().getFullYear()} DAI · ${esc(site.domain)} · Contenido divulgativo. Para obras, instalaciones eléctricas, gas o estructura consulta siempre a profesionales con licencia y a la normativa de tu municipio.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

const plano = (ctx, a, extra = "") => `<article class="plano ${extra}">
  <a class="plano__enlace" href="${a.url}">
    <span class="plano__tema">${icon(a.cat.icon, "plano__icono")}${ctx.esc(a.cat.name)}</span>
    <h3 class="plano__titulo">${ctx.esc(a.title)}</h3>
    <p class="plano__resumen">${ctx.esc(a.description)}</p>
    <span class="plano__pie"><span>${a.minutes} min</span><span class="plano__flecha" aria-hidden="true">→</span></span>
  </a>
</article>`;

const enObra = () => `<section class="cedro-obra" aria-labelledby="obra-t">
  <p class="cedro-titulo__ante">En obra</p>
  <h2 id="obra-t" class="cedro-titulo__h">Estamos levantando la biblioteca</h2>
  <p>Las primeras guías de DAI se están escribiendo y revisando. Publicamos cada artículo cuando está completo, con datos comprobados y sin recomendaciones de productos pagadas. Mientras tanto, conoce <a href="/sobre-nosotros/">el proyecto</a> y nuestra <a href="/politica-editorial/">política editorial</a>.</p>
</section>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, ...rest] = articles;
  const body = `
<section class="cedro-salon">
  <div class="cedro-salon__dentro">
    <div class="cedro-salon__texto">
      <p class="cedro-salon__ante">Revista de arquitectura doméstica · América Latina</p>
      <h1 class="cedro-salon__titulo">Casas que se entienden con su <em>clima</em>, su <em>luz</em> y su gente</h1>
      <p class="cedro-salon__entrada">${esc(site.description)}</p>
      <p class="cedro-salon__acciones">${first ? `<a class="cedro-boton" href="${first.url}">Leer la guía más reciente</a>` : `<a class="cedro-boton" href="/sobre-nosotros/">Conoce DAI</a>`}<a class="cedro-boton cedro-boton--claro" href="/politica-editorial/">Nuestro método</a></p>
    </div>
    <figure class="cedro-salon__figura">${colonnade()}</figure>
  </div>
</section>

<section class="cedro-temas" aria-labelledby="temas-t">
  <header class="cedro-titulo"><p class="cedro-titulo__ante">Seis temas</p><h2 id="temas-t" class="cedro-titulo__h">Recorre la casa</h2></header>
  <ul class="cedro-temas__lista">
    ${categories.map((c) => `<li><a class="estancia" href="${c.url}">
      ${icon(c.icon, "estancia__icono")}
      <span class="estancia__nombre">${esc(c.name)}</span>
      <span class="estancia__texto">${esc(c.description)}</span>
      <span class="estancia__cuenta">${c.articles.length ? `${c.articles.length} guías` : "Próximamente"}</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${articles.length ? `<section class="cedro-recientes" aria-labelledby="rec-t">
  <header class="cedro-titulo"><p class="cedro-titulo__ante">Recién publicadas</p><h2 id="rec-t" class="cedro-titulo__h">Últimas guías</h2></header>
  <div class="cedro-rejilla">
    ${first ? plano(ctx, first, "plano--mayor") : ""}
    ${rest.slice(0, 10).map((a) => plano(ctx, a)).join("\n    ")}
  </div>
</section>
<section class="cedro-indice" aria-labelledby="ind-t">
  <header class="cedro-titulo cedro-titulo--oscuro"><p class="cedro-titulo__ante">Planos completos</p><h2 id="ind-t" class="cedro-titulo__h">Todas las guías por tema</h2></header>
  <div class="cedro-indice__cols">
    ${categories.filter((c) => c.articles.length).map((c) => `<section><h3><a href="${c.url}">${esc(c.name)}</a></h3><ul>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ul></section>`).join("\n    ")}
  </div>
</section>` : enObra()}`;
  return layout(ctx, { title: `DAI — ${site.expansion} para América Latina`, description: site.description, path: "/" }, body, "inicio");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="cedro-cabecera-tema">
  <div class="cedro-cabecera-tema__dentro">
    <nav class="cedro-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    ${icon(c.icon, "cedro-cabecera-tema__icono")}
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
  </div>
</header>
${c.articles.length ? `<section class="cedro-recientes"><div class="cedro-rejilla">${c.articles.map((a) => plano(ctx, a)).join("\n")}</div></section>` : enObra()}`;
  return layout(
    ctx,
    {
      title: `${c.name}: guías de diseño y arquitectura`,
      description: c.description.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "tema"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="cedro-guia">
  <header class="cedro-guia__cabecera">
    <nav class="cedro-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="cedro-guia__titulo">${esc(a.title)}</h1>
    <p class="cedro-guia__entrada">${esc(a.description)}</p>
    <p class="cedro-guia__datos">${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} min de lectura</p>
  </header>
  <div class="cedro-guia__cuerpo">
    <aside class="cedro-memoria" aria-label="Memoria de la guía">
      <p class="cedro-memoria__titulo">Memoria descriptiva</p>
      <dl>
        <div><dt>Tema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lectura</dt><dd>${a.minutes} min</dd></div>
        <div><dt>Revisión</dt><dd><time datetime="${a.updated}">${a.updatedLabel}</time></dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="cedro-memoria__titulo">Contenido</p><ol class="cedro-memoria__indice">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="cedro-texto">
${a.html}
      <aside class="cedro-nota"><p><strong>Antes de construir o reformar.</strong> Esta guía es orientativa. Las obras de estructura, electricidad, gas y agua deben hacerlas profesionales con licencia y cumplir la normativa y los permisos de tu municipio. Lee el <a href="/descargo-de-responsabilidad/">descargo de responsabilidad</a>.</p></aside>
    </div>
  </div>
</article>
<section class="cedro-recientes cedro-recientes--siguientes" aria-labelledby="sig-t">
  <header class="cedro-titulo"><p class="cedro-titulo__ante">Para seguir</p><h2 id="sig-t" class="cedro-titulo__h">Guías relacionadas</h2></header>
  <div class="cedro-rejilla">${a.related.map((r) => plano(ctx, r)).join("")}</div>
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
    "guia"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="cedro-guia cedro-guia--pagina">
  <header class="cedro-guia__cabecera">
    <nav class="cedro-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="cedro-guia__titulo">${esc(p.title)}</h1>
    ${p.updated ? `<p class="cedro-guia__datos">Última revisión: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="cedro-guia__cuerpo cedro-guia__cuerpo--simple"><div class="cedro-texto">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: p.title, path: p.url }])] }, body, "pagina");
}

export function notFound(ctx) {
  const body = `
<section class="cedro-sin-planos">
  <p class="cedro-sin-planos__codigo">404</p>
  <h1>Esta habitación no está en los planos</h1>
  <p>Puede que el enlace haya cambiado. Vuelve al <a href="/">inicio</a> o elige un tema:</p>
  <ul class="cedro-temas__lista">${ctx.categories.map((c) => `<li><a class="estancia estancia--mini" href="${c.url}">${icon(c.icon, "estancia__icono")}<span class="estancia__nombre">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en DAI.", path: "/404.html", noindex: true }, body, "vacia");
}
