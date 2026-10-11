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

/**
 * The House of the Forest of Lebanon: four rows of cedar pillars under cedar
 * beams, "windows in three rows, light facing light" (1 Reyes 7:2–5), and on
 * the front beam the shields of hammered gold Solomon hung there (1 Reyes
 * 10:16–17). The light shafts breathe and the shields catch the light in turn.
 */
const colonnade = () => `<svg class="cedro-columnata" viewBox="0 0 600 400" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="cedroMadera" x1="0" x2="1"><stop offset="0" stop-color="#4a2b18"/><stop offset=".4" stop-color="#8f5a32"/><stop offset=".58" stop-color="#c38b55"/><stop offset="1" stop-color="#4a2b18"/></linearGradient>
    <linearGradient id="cedroViga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f5a32"/><stop offset="1" stop-color="#4a2b18"/></linearGradient>
    <linearGradient id="cedroLuz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d1" stop-opacity=".9"/><stop offset="1" stop-color="#fff3d1" stop-opacity="0"/></linearGradient>
    <linearGradient id="cedroPared" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe3cb"/><stop offset="1" stop-color="#e2d2b2"/></linearGradient>
    <radialGradient id="cedroEscudo" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fff4c8"/><stop offset=".45" stop-color="#e2b84f"/><stop offset=".8" stop-color="#a87a22"/><stop offset="1" stop-color="#6e4d12"/></radialGradient>
  </defs>
  <rect x="0" y="0" width="600" height="330" fill="url(#cedroPared)"/>
  ${[0, 1, 2].map((r) => Array.from({ length: 6 }, (_, i) => `<rect class="cedro-ventana" style="--d:${((r * 6 + i) * 0.35).toFixed(2)}s" x="${82 + i * 88}" y="${64 + r * 64}" width="24" height="36" rx="12" ry="12"/><path d="M${94 + i * 88} ${66 + r * 64}v34M${82 + i * 88} ${84 + r * 64}h24" stroke="#b99f73" stroke-width=".8"/>`).join("")).join("")}
  <rect x="0" y="330" width="600" height="70" fill="#d6c3a0"/>
  <g stroke="#b99f73" stroke-width="1" opacity=".7">${Array.from({ length: 13 }, (_, i) => `<path d="M${300 + (i - 6) * 18} 330L${300 + (i - 6) * 70} 400"/>`).join("")}<path d="M0 352h600M0 374h600"/></g>
  ${[3, 2, 1, 0].map((row) => {
    const y = 30 + row * 16, h = 300 - row * 16, w = 26 - row * 3, op = 1 - row * 0.17;
    return `<g opacity="${op.toFixed(2)}">${Array.from({ length: 7 }, (_, i) => {
      const x = 23 + i * 88 + row * 12;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#cedroMadera)"/><rect x="${x - 4}" y="${y + h - 10}" width="${w + 8}" height="10" rx="2" fill="#3a2416"/><rect x="${x - 4}" y="${y}" width="${w + 8}" height="8" rx="2" fill="#5a3520"/>`;
    }).join("")}<rect x="${row * 12}" y="${y - 16}" width="${600 - row * 12}" height="16" rx="2" fill="url(#cedroViga)"/></g>`;
  }).join("")}
  <g class="cedro-columnata__luz">${[[0, 0, 0], [2, 1, 2.4], [4, 0, 4.8]].map(([i, r, d]) => {
    const x = 82 + i * 88, y = 100 + r * 64, run = 330 - y;
    return `<g class="cedro-haz" style="--d:${d}s"><path d="M${x - 4} ${y}h32l${run * 0.5 + 30} ${run}h-${run * 0.18 + 62}z" fill="url(#cedroLuz)" opacity=".4"/><path d="M${x + 4} ${y}h16l${run * 0.42 + 14} ${run}h-${run * 0.1 + 30}z" fill="url(#cedroLuz)"/></g>`;
  }).join("")}</g>
  <g class="cedro-escudos">${Array.from({ length: 7 }, (_, i) => {
    const cx = 36 + i * 88;
    return `<g class="cedro-escudo" style="--d:${(i * 0.5).toFixed(2)}s"><path d="M${cx} 30v10" stroke="#3a2416" stroke-width="1.5"/><circle cx="${cx}" cy="56" r="17" fill="url(#cedroEscudo)" stroke="#6e4d12" stroke-width="1.2"/><circle cx="${cx}" cy="56" r="11" fill="none" stroke="#fff1bf" stroke-opacity=".7"/><circle cx="${cx}" cy="56" r="4.5" fill="#fff1bf"/><g stroke="#6e4d12" stroke-opacity=".55" stroke-width=".9">${Array.from({ length: 8 }, (_, k) => `<path d="M${cx} 41.5v5" transform="rotate(${k * 45} ${cx} 56)"/>`).join("")}</g></g>`;
  }).join("")}</g>
  <g class="cedro-motas">${Array.from({ length: 14 }, (_, i) => `<circle style="--d:${(i * 0.7).toFixed(1)}s" cx="${(60 + (i * 41) % 480).toFixed(0)}" cy="${(140 + (i * 53) % 170).toFixed(0)}" r="${(1 + (i % 3) * 0.6).toFixed(1)}"/>`).join("")}</g>
</svg>`;

/** A shield of hammered gold between two cedar rules: the section divider. */
const escudo = () => `<svg class="cedro-divisor" viewBox="0 0 240 30" aria-hidden="true" focusable="false"><path class="cedro-divisor__linea" pathLength="1" d="M4 15H100M140 15H236"/><circle class="cedro-divisor__escudo" cx="120" cy="15" r="12"/><circle class="cedro-divisor__aro" cx="120" cy="15" r="7.5"/><circle class="cedro-divisor__umbo" cx="120" cy="15" r="3"/></svg>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
<script>(function(d){d.classList.add("cedro-js");setTimeout(function(){if(!window.cedroListo)d.classList.remove("cedro-js")},4000)})(document.documentElement)</script>
</head>
<body class="cedro cedro--${kind}">
<a class="cedro-saltar" href="#cuerpo">Ir al contenido</a>
<div class="cedro-avance" aria-hidden="true"><span><i></i></span></div>
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
  <div class="cedro-pie__viga" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="--d:${(i * 0.22).toFixed(2)}s"></i>`).join("")}</div>
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

const plano = (ctx, a, extra = "", i = 0) => `<article class="plano ${extra}" data-revelar style="--i:${i % 6}">
  <a class="plano__enlace" href="${a.url}">
    <span class="plano__tema">${icon(a.cat.icon, "plano__icono")}${ctx.esc(a.cat.name)}</span>
    <h3 class="plano__titulo">${ctx.esc(a.title)}</h3>
    <p class="plano__resumen">${ctx.esc(a.description)}</p>
    <span class="plano__pie"><span>${a.minutes} min</span><span class="plano__flecha" aria-hidden="true">→</span></span>
  </a>
</article>`;

const enObra = () => `<section class="cedro-obra" aria-labelledby="obra-t" data-revelar>
  <p class="cedro-titulo__ante">En obra</p>
  <h2 id="obra-t" class="cedro-titulo__h">Estamos levantando la biblioteca</h2>
  ${escudo()}
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
      <h1 class="cedro-salon__titulo">Casas que se entienden con su <em>clima</em>, su <em>luz</em> y su <em>gente</em></h1>
      <p class="cedro-salon__entrada">${esc(site.description)}</p>
      <p class="cedro-salon__acciones">${first ? `<a class="cedro-boton" href="${first.url}"><span>Leer la guía más reciente</span></a>` : `<a class="cedro-boton" href="/sobre-nosotros/"><span>Conoce DAI</span></a>`}<a class="cedro-boton cedro-boton--claro" href="/politica-editorial/"><span>Nuestro método</span></a></p>
    </div>
    <figure class="cedro-salon__figura">${colonnade()}</figure>
  </div>
</section>

<section class="cedro-temas" aria-labelledby="temas-t">
  <header class="cedro-titulo" data-revelar><p class="cedro-titulo__ante">Seis temas</p><h2 id="temas-t" class="cedro-titulo__h">Recorre la casa</h2>${escudo()}</header>
  <ul class="cedro-temas__lista">
    ${categories.map((c, i) => `<li data-revelar style="--i:${i}"><a class="estancia" href="${c.url}">
      ${icon(c.icon, "estancia__icono")}
      <span class="estancia__nombre">${esc(c.name)}</span>
      <span class="estancia__texto">${esc(c.description)}</span>
      <span class="estancia__cuenta">${c.articles.length ? `${c.articles.length} ${c.articles.length === 1 ? "guía" : "guías"}` : "Próximamente"}</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${articles.length ? `<section class="cedro-recientes" aria-labelledby="rec-t">
  <header class="cedro-titulo" data-revelar><p class="cedro-titulo__ante">Recién publicadas</p><h2 id="rec-t" class="cedro-titulo__h">Últimas guías</h2>${escudo()}</header>
  <div class="cedro-rejilla">
    ${first ? plano(ctx, first, "plano--mayor") : ""}
    ${rest.slice(0, 10).map((a, i) => plano(ctx, a, "", i + 1)).join("\n    ")}
  </div>
</section>
<section class="cedro-indice" aria-labelledby="ind-t">
  <header class="cedro-titulo cedro-titulo--oscuro" data-revelar><p class="cedro-titulo__ante">Planos completos</p><h2 id="ind-t" class="cedro-titulo__h">Todas las guías por tema</h2>${escudo()}</header>
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
    ${escudo()}
    <p>${esc(c.description)}</p>
  </div>
</header>
${c.articles.length ? `<section class="cedro-recientes"><div class="cedro-rejilla">${c.articles.map((a, i) => plano(ctx, a, "", i)).join("\n")}</div></section>` : enObra()}`;
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
    ${escudo()}
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
  <header class="cedro-titulo" data-revelar><p class="cedro-titulo__ante">Para seguir</p><h2 id="sig-t" class="cedro-titulo__h">Guías relacionadas</h2>${escudo()}</header>
  <div class="cedro-rejilla">${a.related.map((r, i) => plano(ctx, r, "", i)).join("")}</div>
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
    ${escudo()}
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
  ${escudo()}
  <p>Puede que el enlace haya cambiado. Vuelve al <a href="/">inicio</a> o elige un tema:</p>
  <ul class="cedro-temas__lista">${ctx.categories.map((c) => `<li><a class="estancia estancia--mini" href="${c.url}">${icon(c.icon, "estancia__icono")}<span class="estancia__nombre">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en DAI.", path: "/404.html", noindex: true }, body, "vacia");
}
