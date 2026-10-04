// QKB — "Fuente de cobre fundido".
//
// The spring of molten copper and the cauldrons fixed in their places (Saba'
// 34:12–13): a warm kitchen-workshop of hammered copper, bronze and bread
// crust. Everything here is QKB's own — its classes (cobre-, ficha-, caldero-)
// appear in no other site of the network.

const ICONS = {
  queso: `<path d="M6 30l26-18 10 6v14z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M6 30h36" stroke="currentColor" stroke-width="2.4"/><circle cx="18" cy="31" r="0" /><circle cx="22" cy="24" r="2.2" fill="currentColor"/><circle cx="31" cy="22" r="1.6" fill="currentColor"/><circle cx="34" cy="28" r="2" fill="currentColor"/>`,
  tarro: `<path d="M14 10h20v5H14z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 15h24v22a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 27c3-2 5 2 8 0s5 2 8 0" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="20" cy="33" r="1.3" fill="currentColor"/><circle cx="27" cy="35" r="1" fill="currentColor"/>`,
  pan: `<path d="M6 30c0-10 8-16 18-16s18 6 18 16c0 3-2 5-5 5H11c-3 0-5-2-5-5z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 21l4 6M23 19l3 7M31 21l3 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  espiral: `<path d="M24 24m-3 0a3 3 0 1 1 6 0a7 7 0 1 1-14 0a11 11 0 1 1 22 0a15 15 0 1 1-30 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  frasco: `<path d="M17 8h14v6l4 5v18a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V19l4-5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 24h22" stroke="currentColor" stroke-width="1.8"/><circle cx="20" cy="31" r="2.5" fill="currentColor"/><circle cx="28" cy="33" r="2" fill="currentColor"/>`,
  balanza: `<path d="M24 8v30M14 40h20M10 14h28" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M10 14l-6 12h12zM38 14l-6 12h12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.pan}</svg>`;

/** España, campeona del mundo 2026 — a hammered-copper plaque with a red-gold sash. */
const champions = () => `<aside class="cobre-placa" role="note" aria-label="España, campeona del mundo 2026">
  <div class="cobre-placa__dentro">
    <span class="cobre-placa__faja" aria-hidden="true"><i></i><i></i><i></i></span>
    <svg class="cobre-placa__copa" viewBox="0 0 64 72" width="30" height="34" aria-hidden="true" focusable="false">
      <defs><linearGradient id="cobreOro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9b0"/><stop offset=".5" stop-color="#e3a94f"/><stop offset="1" stop-color="#8f5320"/></linearGradient></defs>
      <path d="M17 6h30v13c0 11-7 19-15 20-8-1-15-9-15-20z" fill="url(#cobreOro)"/>
      <path d="M17 10H8c0 9 4 14 11 15M47 10h9c0 9-4 14-11 15" fill="none" stroke="url(#cobreOro)" stroke-width="4"/>
      <path d="M28 39h8v11h-8zM16 52h32l3 12H13z" fill="url(#cobreOro)"/>
      <circle cx="32" cy="20" r="5" fill="#c60b1e"/><circle cx="32" cy="20" r="2.4" fill="#ffc400"/>
    </svg>
    <p class="cobre-placa__texto"><em>España</em> campeona del mundo <strong>2026</strong></p>
    <span class="cobre-placa__riel" aria-hidden="true"><span class="cobre-placa__rueda"><svg viewBox="0 0 40 40" width="20" height="20"><circle cx="20" cy="20" r="18" fill="#fffaf0" stroke="#3b2414" stroke-width="2"/><path d="M20 12l7 5-2.7 8h-8.6L13 17z" fill="#3b2414"/><path d="M20 12V3M27 17l8-3M24.3 25l5 7M15.7 25l-5 7M13 17l-8-3" stroke="#3b2414" stroke-width="1.6"/></svg></span></span>
  </div>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="cobre cobre--${kind}">
<a class="cobre-salto" href="#principal">Ir al contenido</a>
<div class="cobre-termometro" aria-hidden="true"><span></span></div>
${champions()}
<header class="cobre-cabecera">
  <div class="cobre-cabecera__fundido" aria-hidden="true"></div>
  <div class="cobre-cabecera__dentro">
    <a class="cobre-sello" href="/" aria-label="${esc(site.name)} — inicio">
      <span class="cobre-sello__medalla" aria-hidden="true"><span>Q</span><span>K</span><span>B</span></span>
      <span class="cobre-sello__nombre">${esc(site.expansion)}</span>
      <span class="cobre-sello__lema">el obrador casero</span>
    </a>
    <button class="cobre-abrir" type="button" aria-expanded="false" aria-controls="cobre-menu">Despensas</button>
    <nav id="cobre-menu" class="cobre-menu" aria-label="Secciones">
      <a class="cobre-menu__item" href="/"><span>Portada</span></a>
      ${categories.map((c) => `<a class="cobre-menu__item" href="${c.url}"><span>${esc(c.name)}</span><i class="cobre-menu__vapor" aria-hidden="true"></i></a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="cobre-menu__item cobre-menu__item--suave" href="${m.href}"><span>${esc(m.label)}</span></a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="principal">
${body}
</main>
<footer class="cobre-pie">
  <div class="cobre-pie__remaches" aria-hidden="true"></div>
  <div class="cobre-pie__dentro">
    <section class="cobre-pie__marca">
      <p class="cobre-pie__nombre">QKB</p>
      <p class="cobre-pie__expansion">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Despensas">
      <p class="cobre-pie__titulo">Despensas</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="La casa">
      <p class="cobre-pie__titulo">La casa</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="cobre-pie__nota">© ${new Date().getFullYear()} QKB · ${esc(site.domain)} · Recetas y guías divulgativas. Ante alergias, embarazo o dudas de salud, consulta a un profesional.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A recipe card: the copper tab with the section, the title, the "ficha". */
const ficha = (ctx, a, extra = "") => `<article class="ficha ${extra}">
  <a class="ficha__enlace" href="${a.url}">
    <span class="ficha__pestana">${icon(a.cat.icon, "ficha__icono")}<span>${ctx.esc(a.cat.name)}</span></span>
    <h3 class="ficha__titulo">${ctx.esc(a.title)}</h3>
    <p class="ficha__resumen">${ctx.esc(a.description)}</p>
    <span class="ficha__pie"><span>${a.minutes} min de lectura</span><span class="ficha__flecha" aria-hidden="true">→</span></span>
  </a>
</article>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="caldero">
  <div class="caldero__brasas" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  <div class="caldero__dentro">
    <div class="caldero__texto">
      <p class="caldero__antetitulo">Recetario y guías del obrador doméstico</p>
      <h1 class="caldero__titulo">Queso, kéfir <span>y</span> bollería</h1>
      <p class="caldero__lema">${esc(site.tagline)}</p>
      <p class="caldero__entrada">${esc(site.description)}</p>
      <p class="caldero__botones"><a class="cobre-boton" href="${first.url}">Empezar a leer</a><a class="cobre-boton cobre-boton--linea" href="/seguridad-alimentaria/">Seguridad alimentaria</a></p>
    </div>
    <div class="caldero__destacados">
      ${ficha(ctx, first, "ficha--grande")}
      <div class="caldero__dos">${ficha(ctx, second)}${ficha(ctx, third)}</div>
    </div>
  </div>
</section>

<section class="ollas" aria-labelledby="ollas-t">
  <header class="cobre-titular"><p class="cobre-titular__ante">Las seis despensas</p><h2 id="ollas-t">¿Qué quieres preparar hoy?</h2></header>
  <ul class="ollas__fila">
    ${categories.map((c) => `<li><a class="olla" href="${c.url}">
      <span class="olla__asa" aria-hidden="true"></span>
      <span class="olla__cuerpo">${icon(c.icon, "olla__icono")}</span>
      <span class="olla__nombre">${esc(c.name)}</span>
      <span class="olla__cuenta">${c.articles.length} guías</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

<section class="recetario" aria-labelledby="rec-t">
  <header class="cobre-titular"><p class="cobre-titular__ante">Del obrador</p><h2 id="rec-t">Últimas recetas y guías</h2></header>
  <div class="recetario__rejilla">
    ${rest.slice(0, 12).map((a) => ficha(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="indice-cobre" aria-labelledby="ind-t">
  <header class="cobre-titular cobre-titular--claro"><p class="cobre-titular__ante">El índice completo</p><h2 id="ind-t">Todas las guías por despensa</h2></header>
  <div class="indice-cobre__cols">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "indice-cobre__icono")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `QKB — ${site.expansion}: el obrador casero`, description: site.description, path: "/" }, body, "portada");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="despensa">
  <div class="despensa__dentro">
    <nav class="cobre-migas" aria-label="Ruta"><a href="/">Portada</a> <span aria-hidden="true">·</span> <span>${esc(c.name)}</span></nav>
    <span class="despensa__olla">${icon(c.icon, "despensa__icono")}</span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="despensa__cuenta">${c.articles.length} recetas y guías</p>
  </div>
</header>
<section class="recetario recetario--despensa"><div class="recetario__rejilla">
  ${c.articles.map((a) => ficha(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: recetas y guías caseras`,
      description: `${c.description} ${c.articles.length} guías del obrador casero de ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Portada", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "despensa"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="receta">
  <header class="receta__cabecera">
    <nav class="cobre-migas" aria-label="Ruta"><a href="/">Portada</a> <span aria-hidden="true">·</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="receta__titulo">${esc(a.title)}</h1>
    <p class="receta__entrada">${esc(a.description)}</p>
  </header>
  <div class="receta__cuerpo">
    <aside class="ficha-tecnica" aria-label="Ficha">
      <p class="ficha-tecnica__titulo">Ficha</p>
      <dl>
        <div><dt>Despensa</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lectura</dt><dd>${a.minutes} minutos</dd></div>
        <div><dt>Publicado</dt><dd><time datetime="${a.date}">${a.dateLabel}</time></dd></div>
        <div><dt>Por</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="ficha-tecnica__titulo ficha-tecnica__titulo--b">Pasos de la guía</p><ol class="ficha-tecnica__pasos">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="receta__texto">
${a.html}
      <aside class="cobre-aviso"><p><strong>Seguridad alimentaria.</strong> Trabaja con utensilios limpios, leche pasteurizada y temperaturas controladas. Las personas embarazadas, inmunodeprimidas, mayores o con alergias deben extremar las precauciones. Lee nuestra <a href="/seguridad-alimentaria/">guía de seguridad alimentaria</a>.</p></aside>
    </div>
  </div>
</article>
<section class="recetario recetario--siguiente" aria-labelledby="sig-t">
  <header class="cobre-titular"><p class="cobre-titular__ante">Para seguir en el obrador</p><h2 id="sig-t">Guías relacionadas</h2></header>
  <div class="recetario__rejilla">${a.related.map((r) => ficha(ctx, r)).join("")}</div>
</section>`;
  return layout(
    ctx,
    {
      title: a.title,
      description: a.description,
      path: a.url,
      type: "article",
      jsonld: [
        ctx.crumbs([{ name: "Portada", path: "/" }, { name: a.cat.name, path: a.cat.url }, { name: a.title, path: a.url }]),
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
    "receta"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="receta receta--pagina">
  <header class="receta__cabecera">
    <nav class="cobre-migas" aria-label="Ruta"><a href="/">Portada</a> <span aria-hidden="true">·</span> <span>${esc(p.title)}</span></nav>
    <h1 class="receta__titulo">${esc(p.title)}</h1>
    ${p.updated ? `<p class="receta__entrada">Última revisión: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="receta__cuerpo receta__cuerpo--uno"><div class="receta__texto">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Portada", path: "/" }, { name: p.title, path: p.url }])] }, body, "pagina");
}

export function notFound(ctx) {
  const body = `
<section class="vacio">
  <p class="vacio__codigo">404</p>
  <h1>Esta receta no está en la despensa</h1>
  <p>El enlace puede ser antiguo o tener una errata. Elige una despensa para seguir:</p>
  <ul class="ollas__fila">${ctx.categories.map((c) => `<li><a class="olla" href="${c.url}"><span class="olla__cuerpo">${icon(c.icon, "olla__icono")}</span><span class="olla__nombre">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en QKB.", path: "/404.html", noindex: true }, body, "vacio");
}
