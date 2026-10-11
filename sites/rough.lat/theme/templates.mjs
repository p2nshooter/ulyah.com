// ROUGH.LAT — "Las granadas de Jaquín y Boaz".
//
// The two bronze pillars of the temple, crowned with lilies and "two hundred
// pomegranates in rows round about" (1 Reyes 7:18–20). A pomegranate split
// open shows its seeds like garnets: the perfect emblem for a magazine about
// raw stones becoming jewels. Ivory paper, deep emerald, burnished bronze and
// champagne gold. Its classes (granada-, pilar-, semilla-) are its own.

const ICONS = {
  geoda: `<ellipse cx="24" cy="25" rx="18" ry="15" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M14 25l5-7 5 4 5-6 5 9-5 6h-10z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
  brillante: `<path d="M8 18l7-9h18l7 9-16 21z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 18h32M18 9l-3 9 9 21 9-21-3-9M24 9l-6 9h12z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>`,
  anillo: `<ellipse cx="24" cy="30" rx="13" ry="11" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M19 17l5-8 5 8-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  rueda: `<circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="24" cy="24" r="4" fill="currentColor"/><path d="M24 9v6M24 33v6M9 24h6M33 24h6M13 13l4 4M31 31l4 4M35 13l-4 4M17 31l-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  estuche: `<path d="M8 20h32v18H8z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M8 20l4-9h24l4 9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="29" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.brillante}</svg>`;

/** A pomegranate (granada) — split, seeds like garnets. Used in the logo and hero. */
const pomegranate = (cls, id) => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <defs><radialGradient id="${id}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#e2526a"/><stop offset=".6" stop-color="#9e1b33"/><stop offset="1" stop-color="#5c0d1d"/></radialGradient></defs>
  <path d="M26 10l3-6 3 5 3-5 3 6" fill="none" stroke="#b08a45" stroke-width="2.2" stroke-linejoin="round"/>
  <circle cx="32" cy="36" r="22" fill="url(#${id})"/>
  <path d="M20 30c4-6 20-6 24 0-2 10-22 10-24 0z" fill="#f4e3c4"/>
  <g fill="#b3122e"><circle cx="26" cy="31" r="2.4"/><circle cx="31" cy="29" r="2.4"/><circle cx="36" cy="31" r="2.4"/><circle cx="29" cy="34" r="2.4"/><circle cx="34" cy="34" r="2.4"/><circle cx="40" cy="32" r="2"/><circle cx="23" cy="33" r="1.8"/></g>
</svg>`;

/** España, campeona del mundo 2026 — a pomegranate of Granada with a red-gold sash. */
const champions = () => `<aside class="granada-campeona" role="note" aria-label="España, campeona del mundo 2026">
  ${pomegranate("granada-campeona__fruto", "grCampeona")}
  <p>¡Felicidades, <em>España</em>! Campeona del mundo <strong>2026</strong></p>
  <span class="granada-campeona__faja" aria-hidden="true"></span>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="granada granada--${kind}">
<a class="granada-salto" href="#contenido">Saltar al contenido</a>
<div class="granada-lectura" aria-hidden="true"><span></span></div>
${champions()}
<header class="granada-cabecera">
  <div class="granada-cabecera__dentro">
    <a class="granada-marca" href="/" aria-label="${esc(site.name)} — inicio">
      ${pomegranate("granada-marca__fruto", "grMarca")}
      <span class="granada-marca__texto"><span class="granada-marca__nombre">ROUGH<i>.LAT</i></span><span class="granada-marca__lema">From Raw Beauty to Timeless Value</span></span>
    </a>
    <button class="granada-boton-menu" type="button" aria-expanded="false" aria-controls="granada-menu">Menú</button>
    <nav id="granada-menu" class="granada-menu" aria-label="Categorías">
      ${categories.map((c) => `<a class="granada-menu__enlace" href="${c.url}">${esc(c.name)}<span class="granada-menu__semillas" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="granada-menu__enlace granada-menu__enlace--casa" href="${m.href}">${esc(m.label)}</a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="contenido">
${body}
</main>
<footer class="granada-pie">
  <div class="granada-pie__cornisa" aria-hidden="true"></div>
  <div class="granada-pie__dentro">
    <section>
      <p class="granada-pie__nombre">ROUGH<i>.LAT</i></p>
      <p class="granada-pie__lema">From Raw Beauty to Timeless Value</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Categorías del pie">
      <p class="granada-pie__titulo">Categorías</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Información legal">
      <p class="granada-pie__titulo">La revista</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="granada-pie__nota">© ${new Date().getFullYear()} ROUGH.LAT · ${esc(site.domain)} · Contenido editorial y divulgativo. No tasamos ni vendemos gemas; consulta siempre a un laboratorio gemológico y a un tasador independiente.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

const tarjeta = (ctx, a, extra = "") => `<article class="semilla ${extra}">
  <a class="semilla__enlace" href="${a.url}">
    <span class="semilla__cat">${icon(a.cat.icon, "semilla__icono")}${ctx.esc(a.cat.name)}</span>
    <h3 class="semilla__titulo">${ctx.esc(a.title)}</h3>
    <p class="semilla__resumen">${ctx.esc(a.description)}</p>
    <span class="semilla__pie">${a.minutes} min · Leer la guía <span aria-hidden="true">→</span></span>
  </a>
</article>`;

const enPreparacion = () => `<section class="granada-preparacion" aria-labelledby="prep-t">
  <p class="granada-encabezado__ante">Primera edición</p>
  <h2 id="prep-t" class="granada-encabezado__titulo">La revista está en preparación</h2>
  <p>Estamos escribiendo, verificando y editando las primeras guías de ROUGH.LAT. Publicamos cada artículo solo cuando está completo y revisado, con sus fuentes. Mientras tanto, conoce <a href="/sobre-nosotros/">nuestro proyecto</a> y nuestra <a href="/politica-editorial/">política editorial</a>.</p>
</section>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, ...rest] = articles;
  const body = `
<section class="granada-portico">
  <div class="granada-portico__dentro">
    <div class="pilar pilar--jaquin" aria-hidden="true"><span class="pilar__lirio"></span><span class="pilar__granadas"></span><span class="pilar__fuste"></span></div>
    <div class="granada-portico__texto">
      <p class="granada-portico__ante">Revista de gemas y joyería · América Latina</p>
      <h1 class="granada-portico__titulo">De la belleza <span>en bruto</span> al valor que perdura</h1>
      <p class="granada-portico__entrada">${esc(site.description)}</p>
      <p class="granada-portico__acciones">${first ? `<a class="granada-btn" href="${first.url}">Leer la última guía</a>` : `<a class="granada-btn" href="/sobre-nosotros/">Conoce la revista</a>`}<a class="granada-btn granada-btn--sutil" href="/politica-editorial/">Cómo verificamos</a></p>
    </div>
    <div class="pilar pilar--boaz" aria-hidden="true"><span class="pilar__lirio"></span><span class="pilar__granadas"></span><span class="pilar__fuste"></span></div>
  </div>
  <div class="granada-portico__fruto">${pomegranate("granada-portico__svg", "grPortico")}</div>
</section>

<section class="granada-salas" aria-labelledby="salas-t">
  <header class="granada-encabezado"><p class="granada-encabezado__ante">Cinco salas</p><h2 id="salas-t" class="granada-encabezado__titulo">Explora la revista</h2></header>
  <ul class="granada-salas__lista">
    ${categories.map((c, i) => `<li><a class="sala" href="${c.url}">
      <span class="sala__numero">${String(i + 1).padStart(2, "0")}</span>
      ${icon(c.icon, "sala__icono")}
      <span class="sala__nombre">${esc(c.name)}</span>
      <span class="sala__texto">${esc(c.description)}</span>
      <span class="sala__cuenta">${c.articles.length ? `${c.articles.length} artículos` : "Muy pronto"}</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${articles.length ? `<section class="granada-novedades" aria-labelledby="nov-t">
  <header class="granada-encabezado"><p class="granada-encabezado__ante">Novedades</p><h2 id="nov-t" class="granada-encabezado__titulo">Lo último publicado</h2></header>
  <div class="granada-rejilla">
    ${first ? tarjeta(ctx, first, "semilla--portada") : ""}
    ${rest.slice(0, 9).map((a) => tarjeta(ctx, a)).join("\n    ")}
  </div>
</section>
<section class="granada-archivo" aria-labelledby="arc-t">
  <header class="granada-encabezado granada-encabezado--oscuro"><p class="granada-encabezado__ante">Archivo</p><h2 id="arc-t" class="granada-encabezado__titulo">Todos los artículos</h2></header>
  <div class="granada-archivo__cols">
    ${categories.filter((c) => c.articles.length).map((c) => `<section><h3><a href="${c.url}">${esc(c.name)}</a></h3><ul>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ul></section>`).join("\n    ")}
  </div>
</section>` : enPreparacion()}`;
  return layout(ctx, { title: `ROUGH.LAT — ${site.expansion}`, description: site.description, path: "/" }, body, "inicio");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="granada-cabeza">
  <div class="granada-cabeza__dentro">
    <nav class="granada-migas" aria-label="Ruta de navegación"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    ${icon(c.icon, "granada-cabeza__icono")}
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
  </div>
</header>
${c.articles.length ? `<section class="granada-novedades"><div class="granada-rejilla">${c.articles.map((a) => tarjeta(ctx, a)).join("\n")}</div></section>` : enPreparacion()}`;
  return layout(
    ctx,
    {
      title: `${c.name} — guías de ROUGH.LAT`,
      description: c.description.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "categoria"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="granada-nota">
  <header class="granada-nota__cabecera">
    <nav class="granada-migas" aria-label="Ruta de navegación"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <p class="granada-nota__cat">${esc(a.cat.name)}</p>
    <h1 class="granada-nota__titulo">${esc(a.title)}</h1>
    <p class="granada-nota__bajada">${esc(a.description)}</p>
    <p class="granada-nota__firma">${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} min de lectura</p>
  </header>
  <div class="granada-nota__cuerpo">
    <aside class="granada-indice" aria-label="Índice del artículo">
      <p class="granada-indice__titulo">Índice</p>
      ${toc.length ? `<ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
      <p class="granada-indice__meta">Revisado el <time datetime="${a.updated}">${a.updatedLabel}</time></p>
    </aside>
    <div class="granada-prosa">
${a.html}
      <aside class="granada-nota__aviso"><p><strong>Nota editorial.</strong> Este artículo es divulgativo. La identidad de una gema la confirma un laboratorio gemológico y su valor, un tasador independiente con la pieza delante. ROUGH.LAT no publica precios ni recomendaciones de inversión. Consulta el <a href="/descargo-de-responsabilidad/">descargo de responsabilidad</a>.</p></aside>
    </div>
  </div>
</article>
<section class="granada-novedades granada-novedades--relacionadas" aria-labelledby="rel-t">
  <header class="granada-encabezado"><p class="granada-encabezado__ante">Sigue leyendo</p><h2 id="rel-t" class="granada-encabezado__titulo">Artículos relacionados</h2></header>
  <div class="granada-rejilla">${a.related.map((r) => tarjeta(ctx, r)).join("")}</div>
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
    "nota"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="granada-nota granada-nota--pagina">
  <header class="granada-nota__cabecera">
    <nav class="granada-migas" aria-label="Ruta de navegación"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="granada-nota__titulo">${esc(p.title)}</h1>
    ${p.updated ? `<p class="granada-nota__firma">Última actualización: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="granada-nota__cuerpo granada-nota__cuerpo--solo"><div class="granada-prosa">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: p.title, path: p.url }])] }, body, "pagina");
}

export function notFound(ctx) {
  const body = `
<section class="granada-perdida">
  ${pomegranate("granada-perdida__fruto", "grPerdida")}
  <p class="granada-perdida__codigo">404</p>
  <h1>Esta página no existe</h1>
  <p>Puede que el enlace haya cambiado. Vuelve al <a href="/">inicio</a> o elige una categoría:</p>
  <p class="granada-perdida__cats">${ctx.categories.map((c) => `<a href="${c.url}">${ctx.esc(c.name)}</a>`).join(" · ")}</p>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en ROUGH.LAT.", path: "/404.html", noindex: true }, body, "perdida");
}
