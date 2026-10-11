// ROUGH — "El taller del lapidario".
//
// "Piedras grandes, piedras costosas, piedras labradas" (1 Reyes 5:17): the
// workshop where the king's stones were cut. Forest green felt, ivory paper,
// charcoal steel and champagne-gold light on a freshly polished facet.
// Everything here belongs to ROUGH alone — its classes (lapida-, faceta-,
// veta-) appear in no other site of the network.

const ICONS = {
  cristal: `<path d="M24 4l12 10-4 26H16L12 14z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 14h24M24 4l-4 10 4 26 4-26z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
  talla: `<path d="M8 18l8-10h16l8 10-16 22z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 18h32M16 8l4 10 4-10 4 10 4-10M20 18l4 22 4-22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
  lupa: `<circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M28 28l12 12" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M15 19l5-5 5 5-5 6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
  balanza: `<path d="M24 7v32M15 41h18M9 13h30" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M9 13l-5 11h10zM39 13l-5 11h10z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M21 7l3-3 3 3-3 3z" fill="currentColor"/>`,
  anillo: `<circle cx="24" cy="29" r="12" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M18 14l3-6h6l3 6-6 5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  navaja: `<path d="M6 30c10-2 20-8 30-20l4 3c-7 12-17 19-30 22z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 35l-4 6M14 34l4 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.talla}</svg>`;

/** España, campeona del mundo 2026 — a cut ruby set in gold on a felt band. */
const champions = () => `<aside class="lapida-campeona" role="note" aria-label="España, campeona del mundo 2026">
  <svg class="lapida-campeona__gema" viewBox="0 0 40 34" width="26" height="22" aria-hidden="true" focusable="false">
    <path d="M4 12l7-9h18l7 9-16 20z" fill="#c60b1e"/><path d="M4 12h32M11 3l5 9 4-9 4 9 5-9M16 12l4 20 4-20" fill="none" stroke="#ffc400" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>
  <p><em>España</em> campeona del mundo <strong>2026</strong></p>
  <span class="lapida-campeona__brillo" aria-hidden="true"></span>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
<script>(function(d){d.classList.add("lapida-js");setTimeout(function(){if(!window.lapidaLista)d.classList.remove("lapida-js")},4000)})(document.documentElement)</script>
</head>
<body class="lapida lapida--${kind}">
<a class="lapida-salto" href="#principal">Ir al contenido</a>
<div class="lapida-progreso" aria-hidden="true"><span><i></i></span></div>
${champions()}
<header class="lapida-cabecera">
  <div class="lapida-cabecera__dentro">
    <a class="lapida-marca" href="/" aria-label="${esc(site.name)} — portada">
      <svg class="lapida-marca__gema" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false"><path d="M6 18l9-12h18l9 12-18 24z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M6 18h36M15 6l5 12 4-12 4 12 5-12M20 18l4 24 4-24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
      <span class="lapida-marca__nombre">ROUGH</span>
      <span class="lapida-marca__lema">${esc(site.tagline)}</span>
    </a>
    <button class="lapida-abrir" type="button" aria-expanded="false" aria-controls="lapida-menu"><span aria-hidden="true"></span>Secciones</button>
    <nav id="lapida-menu" class="lapida-menu" aria-label="Secciones">
      ${categories.map((c) => `<a class="lapida-menu__item" href="${c.url}"><svg class="lapida-menu__faceta" viewBox="0 0 60 14" aria-hidden="true" focusable="false"><path d="M2 7l8-5h40l8 5-8 5H10z"/></svg><span>${esc(c.name)}</span></a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="lapida-menu__item lapida-menu__item--casa" href="${m.href}"><span>${esc(m.label)}</span></a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="principal">
${body}
</main>
<footer class="lapida-pie">
  <div class="lapida-pie__veta" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  <div class="lapida-pie__dentro">
    <section class="lapida-pie__marca">
      <p class="lapida-pie__nombre">ROUGH</p>
      <p class="lapida-pie__expansion">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Secciones del pie">
      <p class="lapida-pie__titulo">El taller</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Información">
      <p class="lapida-pie__titulo">La casa</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="lapida-pie__nota">© ${new Date().getFullYear()} ROUGH · ${esc(site.domain)} · Contenido divulgativo. Ninguna guía sustituye una tasación profesional ni un informe de laboratorio gemológico.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** An article card: a ticket hanging from the lapidary's board. */
const ficha = (ctx, a, extra = "", i = 0) => `<article class="faceta ${extra}" data-revelar style="--i:${i % 6}">
  <a class="faceta__enlace" href="${a.url}">
    <span class="faceta__seccion">${icon(a.cat.icon, "faceta__icono")}<span>${ctx.esc(a.cat.name)}</span></span>
    <h3 class="faceta__titulo">${ctx.esc(a.title)}</h3>
    <p class="faceta__resumen">${ctx.esc(a.description)}</p>
    <span class="faceta__pie"><span>${a.minutes} min de lectura</span><span class="faceta__flecha" aria-hidden="true">→</span></span>
  </a>
</article>`;

/** Divider: a cut stone between two engraved rules. */
const divisor = () => `<svg class="lapida-divisor" viewBox="0 0 240 24" aria-hidden="true" focusable="false"><path class="lapida-divisor__linea" pathLength="1" d="M4 12H96M144 12H236"/><path class="lapida-divisor__gema" d="M106 9l5-6h18l5 6-14 13z"/><path class="lapida-divisor__facetas" d="M106 9h28M111 3l3 6 6-6 6 6 3-6M114 9l6 13 6-13"/></svg>`;

const preparando = (ctx) => `<section class="lapida-obra" aria-labelledby="obra-t">
  <header class="lapida-titular" data-revelar><p class="lapida-titular__ante">En el banco de trabajo</p><h2 id="obra-t">La biblioteca se está tallando</h2>${divisor()}</header>
  <p class="lapida-obra__texto">Estamos escribiendo y revisando las primeras guías de ROUGH. Cada artículo se publica cuando está completo, con fuentes verificables y sin cifras inventadas. Mientras tanto puedes conocer <a href="/sobre-nosotros/">quiénes somos</a> y <a href="/politica-editorial/">cómo trabajamos</a>.</p>
</section>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, ...rest] = articles;
  const body = `
<section class="lapida-portada">
  <div class="lapida-portada__dentro">
    <div class="lapida-portada__texto">
      <p class="lapida-portada__ante">Revista de gemología práctica y estilo con carácter</p>
      <h1 class="lapida-portada__titulo"><span class="lapida-oro">De la piedra</span> <em>en bruto</em> <span class="lapida-oro">al valor que perdura</span></h1>
      <p class="lapida-portada__entrada">${esc(site.description)}</p>
      <p class="lapida-portada__botones">${first ? `<a class="lapida-boton" href="${first.url}"><span>Empezar a leer</span></a>` : `<a class="lapida-boton" href="/sobre-nosotros/"><span>Conoce ROUGH</span></a>`}<a class="lapida-boton lapida-boton--linea" href="/politica-editorial/"><span>Cómo trabajamos</span></a></p>
    </div>
    <figure class="lapida-cristal" aria-hidden="true">
      <span class="lapida-cristal__prisma"></span>
      <svg class="lapida-cristal__dial" viewBox="0 0 400 400" focusable="false">
        <circle cx="200" cy="200" r="188" fill="none" stroke="#d6b979" stroke-opacity=".55" stroke-width="1.2"/>
        <circle cx="200" cy="200" r="172" fill="none" stroke="#d6b979" stroke-opacity=".25" stroke-width="1"/>
        <g stroke="#d6b979" stroke-opacity=".7">${Array.from({ length: 72 }, (_, i) => `<path d="M200 ${i % 6 === 0 ? 12 : 16}v${i % 6 === 0 ? 14 : 7}" transform="rotate(${i * 5} 200 200)" stroke-width="${i % 6 === 0 ? 1.6 : 1}"/>`).join("")}</g>
        <g fill="#d6b979" fill-opacity=".8" font-size="11" font-family="Figtree, sans-serif" text-anchor="middle">${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => `<text x="200" y="44" transform="rotate(${d} 200 200)">${d}°</text>`).join("")}</g>
      </svg>
      <svg class="lapida-cristal__gema" viewBox="0 0 320 320" focusable="false">
        <defs>
          <radialGradient id="lapFondo" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#5fae8b"/><stop offset=".55" stop-color="#1d5a43"/><stop offset="1" stop-color="#0b2419"/></radialGradient>
          <linearGradient id="lapOro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2cc"/><stop offset=".45" stop-color="#d6b979"/><stop offset="1" stop-color="#8f6d33"/></linearGradient>
        </defs>
        <circle cx="160" cy="160" r="134" fill="url(#lapFondo)" stroke="url(#lapOro)" stroke-width="3"/>
        <g class="lapida-cristal__caras">
          ${Array.from({ length: 8 }, (_, i) => `<path class="lapida-faceta-luz" style="--d:${(i * 0.45).toFixed(2)}s" d="M160 160L${(160 + 134 * Math.cos((i * 45 - 90) * Math.PI / 180)).toFixed(1)} ${(160 + 134 * Math.sin((i * 45 - 90) * Math.PI / 180)).toFixed(1)}A134 134 0 0 1 ${(160 + 134 * Math.cos(((i + 1) * 45 - 90) * Math.PI / 180)).toFixed(1)} ${(160 + 134 * Math.sin(((i + 1) * 45 - 90) * Math.PI / 180)).toFixed(1)}Z"/>`).join("")}
        </g>
        <g fill="none" stroke="url(#lapOro)" stroke-width="1.4" stroke-linejoin="round">
          <path d="M160 74l61 25 25 61-25 61-61 25-61-25-25-61 25-61z"/>
          ${Array.from({ length: 8 }, (_, i) => { const a = (i * 45 - 90) * Math.PI / 180, b = (i * 45 - 67.5) * Math.PI / 180; const p = (r, t) => `${(160 + r * Math.cos(t)).toFixed(1)} ${(160 + r * Math.sin(t)).toFixed(1)}`; return `<path d="M${p(86, a)}L${p(134, b)}L${p(86, a + Math.PI / 4)}M${p(86, a)}L${p(134, a)}M${p(52, b)}L${p(86, a)}M${p(52, b)}L${p(86, a + Math.PI / 4)}"/>`; }).join("")}
          <path d="M160 108l37 15 15 37-15 37-37 15-37-15-15-37 15-37z" stroke-opacity=".75"/>
        </g>
        <path class="lapida-cristal__destello" d="M118 96l14 34-34-14 34-14-14 34" fill="none" stroke="#fff8e6" stroke-width="0"/>
      </svg>
      ${[[18, 22, 0], [78, 12, 1.2], [88, 70, 2.1], [10, 76, 3], [52, 4, 3.8]].map(([x, y, d]) => `<span class="lapida-chispa" style="--x:${x}%;--y:${y}%;--d:${d}s"></span>`).join("")}
    </figure>
  </div>
</section>

<section class="lapida-cajones" aria-labelledby="caj-t">
  <header class="lapida-titular" data-revelar><p class="lapida-titular__ante">Seis cajones del taller</p><h2 id="caj-t">¿Qué quieres aprender hoy?</h2>${divisor()}</header>
  <ul class="lapida-cajones__fila">
    ${categories.map((c, i) => `<li data-revelar style="--i:${i}"><a class="cajon" href="${c.url}">
      <span class="cajon__tirador" aria-hidden="true"></span>
      ${icon(c.icon, "cajon__icono")}
      <span class="cajon__nombre">${esc(c.name)}</span>
      <span class="cajon__texto">${esc(c.description)}</span>
      <span class="cajon__cuenta">${c.articles.length ? `${c.articles.length} guías` : "Próximamente"}</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${articles.length ? `<section class="lapida-vitrina" aria-labelledby="vit-t">
  <header class="lapida-titular" data-revelar><p class="lapida-titular__ante">Recién pulidas</p><h2 id="vit-t">Últimas guías</h2>${divisor()}</header>
  <div class="lapida-vitrina__rejilla">
    ${first ? ficha(ctx, first, "faceta--grande") : ""}
    ${rest.slice(0, 11).map((a, i) => ficha(ctx, a, "", i + 1)).join("\n    ")}
  </div>
</section>

<section class="lapida-indice" aria-labelledby="ind-t">
  <header class="lapida-titular lapida-titular--claro" data-revelar><p class="lapida-titular__ante">El inventario completo</p><h2 id="ind-t">Todas las guías por sección</h2>${divisor()}</header>
  <div class="lapida-indice__cols">
    ${categories.filter((c) => c.articles.length).map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "lapida-indice__icono")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>` : preparando(ctx)}`;
  return layout(ctx, { title: `ROUGH — ${site.expansion}`, description: site.description, path: "/" }, body, "portada");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="lapida-seccion">
  <div class="lapida-seccion__dentro">
    <nav class="lapida-migas" aria-label="Ruta"><a href="/">Portada</a> <span aria-hidden="true">/</span> <span>${esc(c.name)}</span></nav>
    ${icon(c.icon, "lapida-seccion__icono")}
    <h1>${esc(c.name)}</h1>
    ${divisor()}
    <p>${esc(c.description)}</p>
    <p class="lapida-seccion__cuenta">${c.articles.length ? `${c.articles.length} guías` : "Primeras guías en preparación"}</p>
  </div>
</header>
${c.articles.length ? `<section class="lapida-vitrina lapida-vitrina--seccion"><div class="lapida-vitrina__rejilla">
  ${c.articles.map((a, i) => ficha(ctx, a, "", i)).join("\n  ")}
</div></section>` : preparando(ctx)}`;
  return layout(
    ctx,
    {
      title: `${c.name}: guías de ROUGH`,
      description: `${c.description}`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Portada", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "seccion"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="lapida-articulo">
  <header class="lapida-articulo__cabecera">
    <nav class="lapida-migas" aria-label="Ruta"><a href="/">Portada</a> <span aria-hidden="true">/</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="lapida-articulo__titulo">${esc(a.title)}</h1>
    ${divisor()}
    <p class="lapida-articulo__entrada">${esc(a.description)}</p>
    <p class="lapida-articulo__datos"><span>${esc(site.author)}</span><span><time datetime="${a.date}">${a.dateLabel}</time></span><span>${a.minutes} min de lectura</span></p>
  </header>
  <div class="lapida-articulo__cuerpo">
    <aside class="lapida-ficha" aria-label="Ficha de la guía">
      <p class="lapida-ficha__titulo">Ficha del lapidario</p>
      <dl>
        <div><dt>Sección</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lectura</dt><dd>${a.minutes} minutos</dd></div>
        <div><dt>Revisado</dt><dd><time datetime="${a.updated}">${a.updatedLabel}</time></dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="lapida-ficha__titulo lapida-ficha__titulo--b">En esta guía</p><ol class="lapida-ficha__indice">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="lapida-texto">
${a.html}
      <aside class="lapida-aviso"><p><strong>Aviso del taller.</strong> Las guías de ROUGH son divulgativas. El valor de una gema solo puede establecerlo un tasador cualificado con la piedra delante, y su identidad, un laboratorio gemológico. No publicamos precios de mercado ni recomendaciones de inversión. Más en el <a href="/descargo-de-responsabilidad/">descargo de responsabilidad</a>.</p></aside>
    </div>
  </div>
</article>
<section class="lapida-vitrina lapida-vitrina--sigue" aria-labelledby="sig-t">
  <header class="lapida-titular" data-revelar><p class="lapida-titular__ante">Sigue en el taller</p><h2 id="sig-t">Guías relacionadas</h2>${divisor()}</header>
  <div class="lapida-vitrina__rejilla">${a.related.map((r, i) => ficha(ctx, r, "", i)).join("")}</div>
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
    "articulo"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="lapida-articulo lapida-articulo--pagina">
  <header class="lapida-articulo__cabecera">
    <nav class="lapida-migas" aria-label="Ruta"><a href="/">Portada</a> <span aria-hidden="true">/</span> <span>${esc(p.title)}</span></nav>
    <h1 class="lapida-articulo__titulo">${esc(p.title)}</h1>
    ${divisor()}
    ${p.updated ? `<p class="lapida-articulo__entrada">Última revisión: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="lapida-articulo__cuerpo lapida-articulo__cuerpo--uno"><div class="lapida-texto">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Portada", path: "/" }, { name: p.title, path: p.url }])] }, body, "pagina");
}

export function notFound(ctx) {
  const body = `
<section class="lapida-vacio">
  <p class="lapida-vacio__codigo">404</p>
  <h1>Esta piedra no está en el inventario</h1>
  ${divisor()}
  <p>El enlace puede ser antiguo o tener una errata. Elige una sección del taller:</p>
  <ul class="lapida-cajones__fila">${ctx.categories.map((c) => `<li><a class="cajon cajon--mini" href="${c.url}">${icon(c.icon, "cajon__icono")}<span class="cajon__nombre">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en ROUGH.", path: "/404.html", noindex: true }, body, "vacio");
}
