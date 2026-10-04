// XKO — "Sala del sol de ámbar".
//
// The hall where the wind and the sun serve the king (Saba' 34:12): a cobalt
// night hall lit by an amber sun, with gold wiring that carries a spark
// along the menu. Everything here is XKO's own — its classes (kilo-, voltio-,
// ambar-) appear in no other site of the network.

const ICONS = {
  factura: `<path d="M13 6h22v36l-4-3-3.5 3-3.5-3-3.5 3-3.5-3-4 3z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 15h12M18 21h12M18 27h7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M29 26l-3 5h4l-3 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  rayo: `<path d="M27 4 11 27h11l-4 17 19-26H25z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>`,
  sol: `<circle cx="24" cy="20" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 5v4M24 31v4M9 20h4M35 20h4M13.4 9.4l2.8 2.8M31.8 27.8l2.8 2.8M13.4 30.6l2.8-2.8M31.8 12.2l2.8-2.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M8 43l5-7h22l5 7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`,
  casa: `<path d="M6 23 24 8l18 15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 20v20h26V20" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 26h18M15 31h18M15 36h18" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2"/>`,
  termo: `<path d="M20 8a4 4 0 0 1 8 0v20a8 8 0 1 1-8 0z" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="24" cy="34" r="3.5" fill="currentColor"/><path d="M24 31V16M32 12h6M32 18h4M32 24h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  bombilla: `<path d="M24 6a12 12 0 0 0-7 21.7c1.4 1 2 2.4 2 4.3h10c0-1.9.6-3.3 2-4.3A12 12 0 0 0 24 6z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M19 37h10M20 42h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M21 20l3 5 3-5" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.rayo}</svg>`;

/** España, campeona del mundo 2026 — an electricity meter whose wheels roll
 * up to 2026, a red-gold pylon flag and a ball running along the wire. */
const champions = () => `<aside class="ambar-contador" role="note" aria-label="España, campeona del mundo 2026">
  <div class="ambar-contador__dentro">
    <span class="ambar-contador__torre" aria-hidden="true"><i class="ambar-contador__bandera"></i></span>
    <span class="ambar-contador__lcd" aria-hidden="true"><span class="ambar-contador__cifras"></span><small>kWh de gloria</small></span>
    <p class="ambar-contador__texto"><strong>España</strong>, campeona del mundo 2026</p>
    <span class="ambar-contador__cable" aria-hidden="true"><span class="ambar-contador__balon">⚽</span></span>
    <span class="ambar-contador__copa" aria-hidden="true">🏆</span>
  </div>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="kilo kilo--${kind}">
<a class="kilo-salto" href="#contenido">Saltar al contenido</a>
${champions()}
<header class="kilo-cabecera">
  <div class="kilo-cabecera__sol" aria-hidden="true"></div>
  <div class="kilo-cabecera__dentro">
    <a class="kilo-marca" href="/" aria-label="${esc(site.name)} — inicio">
      <span class="kilo-marca__disco" aria-hidden="true"><span class="kilo-marca__rayos"></span><span class="kilo-marca__letras">XKO</span></span>
      <span class="kilo-marca__textos"><span class="kilo-marca__nombre">${esc(site.expansion)}</span><span class="kilo-marca__lema">ahorro energético en casa</span></span>
    </a>
    <button class="kilo-interruptor" type="button" aria-expanded="false" aria-controls="kilo-menu"><span class="kilo-interruptor__palanca" aria-hidden="true"></span>Temas</button>
  </div>
  <nav id="kilo-menu" class="kilo-menu" aria-label="Temas">
    <span class="kilo-menu__cable" aria-hidden="true"><span class="kilo-menu__chispa"></span></span>
    <a class="kilo-menu__item" href="/"><span class="kilo-menu__luz" aria-hidden="true"></span><span>Inicio</span></a>
    ${categories.map((c) => `<a class="kilo-menu__item" href="${c.url}"><span class="kilo-menu__luz" aria-hidden="true"></span><span>${esc(c.name)}</span></a>`).join("\n    ")}
    ${site.menu.map((m) => `<a class="kilo-menu__item kilo-menu__item--casa" href="${m.href}"><span>${esc(m.label)}</span></a>`).join("\n    ")}
  </nav>
  <div class="kilo-medidor" aria-hidden="true"><span></span></div>
</header>
<main id="contenido">
${body}
</main>
<footer class="kilo-pie">
  <svg class="kilo-pie__circuito" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 30h180l20-20h240l20 20h300l20 20h200l20-20h200" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="200" cy="10" r="3" fill="currentColor"/><circle cx="780" cy="50" r="3" fill="currentColor"/><circle cx="1000" cy="30" r="3" fill="currentColor"/></svg>
  <div class="kilo-pie__dentro">
    <section>
      <p class="kilo-pie__nombre">XKO</p>
      <p class="kilo-pie__expansion">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Temas">
      <p class="kilo-pie__titulo">Temas</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="XKO">
      <p class="kilo-pie__titulo">XKO</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="kilo-pie__nota">© ${new Date().getFullYear()} XKO · ${esc(site.domain)} · Información divulgativa e independiente. No vendemos energía ni cobramos de comercializadoras. Precios y normas cambian: comprueba siempre las condiciones vigentes.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A switch-plate card: the plate lights up when it comes into view. */
const placa = (ctx, a, extra = "") => `<article class="voltio ${extra}">
  <a class="voltio__enlace" href="${a.url}">
    <span class="voltio__cabeza">${icon(a.cat.icon, "voltio__icono")}<span class="voltio__tema">${ctx.esc(a.cat.name)}</span><span class="voltio__led" aria-hidden="true"></span></span>
    <h3 class="voltio__titulo">${ctx.esc(a.title)}</h3>
    <p class="voltio__resumen">${ctx.esc(a.description)}</p>
    <span class="voltio__pie"><span>${a.minutes} min</span><span class="voltio__flecha" aria-hidden="true">⟶</span></span>
  </a>
</article>`;

/** The hero gauge: a dial whose needle sweeps from "gasto" to "ahorro". */
const dial = () => `<svg class="kilo-dial" viewBox="0 0 240 150" aria-hidden="true" focusable="false">
  <defs><linearGradient id="dialArco" x1="0" x2="1"><stop offset="0" stop-color="#d94b2b"/><stop offset=".5" stop-color="#f2a33a"/><stop offset="1" stop-color="#3fb37f"/></linearGradient></defs>
  <path d="M30 130a90 90 0 0 1 180 0" fill="none" stroke="#24345f" stroke-width="18" stroke-linecap="round"/>
  <path class="kilo-dial__arco" d="M30 130a90 90 0 0 1 180 0" fill="none" stroke="url(#dialArco)" stroke-width="18" stroke-linecap="round" pathLength="100"/>
  <g class="kilo-dial__aguja"><path d="M120 130 116 60l4-6 4 6z" fill="#ffe2a0"/><circle cx="120" cy="130" r="9" fill="#ffe2a0"/><circle cx="120" cy="130" r="4" fill="#0e1a3a"/></g>
  <text x="26" y="148" font-size="11" fill="#9fb0cf">gasto</text><text x="186" y="148" font-size="11" fill="#9fb0cf">ahorro</text>
</svg>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="kilo-portada">
  <div class="kilo-portada__dentro">
    <div class="kilo-portada__texto">
      <p class="kilo-antetitulo">Guías independientes de energía doméstica</p>
      <h1 class="kilo-portada__titulo">Gasta menos luz <em>sin pasar frío</em> ni calor</h1>
      <p class="kilo-portada__lema">${esc(site.tagline)}</p>
      <p class="kilo-portada__entrada">${esc(site.description)}</p>
      <p class="kilo-portada__botones"><a class="kilo-boton" href="${first.url}">Empieza por tu factura</a><a class="kilo-boton kilo-boton--hilo" href="/metodologia/">Cómo calculamos</a></p>
    </div>
    <div class="kilo-portada__panel">
      ${dial()}
      ${placa(ctx, first, "voltio--grande")}
    </div>
  </div>
</section>

<section class="kilo-cuadro" aria-labelledby="cuadro-t">
  <header class="kilo-titular"><p class="kilo-titular__ante">El cuadro eléctrico</p><h2 id="cuadro-t">Seis circuitos para ahorrar</h2></header>
  <ul class="kilo-cuadro__fila">
    ${categories.map((c) => `<li><a class="kilo-diferencial" href="${c.url}">
      <span class="kilo-diferencial__palanca" aria-hidden="true"></span>
      ${icon(c.icon, "kilo-diferencial__icono")}
      <span class="kilo-diferencial__nombre">${esc(c.name)}</span>
      <span class="kilo-diferencial__cuenta">${c.articles.length} guías</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

<section class="kilo-rejilla" aria-labelledby="ult-t">
  <header class="kilo-titular"><p class="kilo-titular__ante">Recién revisadas</p><h2 id="ult-t">Últimas guías</h2></header>
  <div class="kilo-rejilla__cajas">
    ${[second, third, ...rest.slice(0, 10)].map((a) => placa(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="kilo-indice" aria-labelledby="ind-t">
  <header class="kilo-titular kilo-titular--noche"><p class="kilo-titular__ante">Todo XKO</p><h2 id="ind-t">Índice de guías por tema</h2></header>
  <div class="kilo-indice__cols">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "kilo-indice__icono")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `XKO — ${site.expansion}: ahorro energético en casa`, description: site.description, path: "/" }, body, "inicio");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="kilo-tema">
  <div class="kilo-tema__dentro">
    <nav class="kilo-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="kilo-tema__icono">${icon(c.icon)}</span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="kilo-tema__cuenta">${c.articles.length} guías</p>
  </div>
</header>
<section class="kilo-rejilla kilo-rejilla--tema"><div class="kilo-rejilla__cajas">
  ${c.articles.map((a) => placa(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: guías para ahorrar energía`,
      description: `${c.description} ${c.articles.length} guías de ${site.name}.`.slice(0, 160),
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
<article class="kilo-guia">
  <header class="kilo-guia__cabecera">
    <nav class="kilo-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="kilo-guia__titulo">${esc(a.title)}</h1>
    <p class="kilo-guia__entrada">${esc(a.description)}</p>
  </header>
  <div class="kilo-guia__cuerpo">
    <aside class="kilo-lectura" aria-label="Datos de la guía">
      <p class="kilo-lectura__titulo">Lectura del contador</p>
      <dl>
        <div><dt>Tema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lectura</dt><dd>${a.minutes} min</dd></div>
        <div><dt>Revisada</dt><dd><time datetime="${a.updated}">${a.dateLabel}</time></dd></div>
        <div><dt>Por</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="kilo-lectura__titulo kilo-lectura__titulo--b">En esta guía</p><ol class="kilo-lectura__indice">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="kilo-guia__texto">
${a.html}
      <aside class="kilo-nota"><p><strong>Antes de decidir.</strong> Precios, peajes, impuestos y ayudas cambian con frecuencia. Usa estas guías para entender y comparar, y comprueba siempre las condiciones vigentes en tu contrato, en el comparador de la CNMC o con un instalador habilitado. Lee <a href="/metodologia/">cómo calculamos</a>.</p></aside>
    </div>
  </div>
</article>
<section class="kilo-rejilla kilo-rejilla--relacion" aria-labelledby="rel-t">
  <header class="kilo-titular"><p class="kilo-titular__ante">Sigue ahorrando</p><h2 id="rel-t">Guías relacionadas</h2></header>
  <div class="kilo-rejilla__cajas">${a.related.map((r) => placa(ctx, r)).join("")}</div>
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
<article class="kilo-guia kilo-guia--pagina">
  <header class="kilo-guia__cabecera">
    <nav class="kilo-migas" aria-label="Ruta"><a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="kilo-guia__titulo">${esc(p.title)}</h1>
    ${p.updated ? `<p class="kilo-guia__entrada">Última revisión: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="kilo-guia__cuerpo kilo-guia__cuerpo--uno"><div class="kilo-guia__texto">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: p.title, path: p.url }])] }, body, "pagina");
}

export function notFound(ctx) {
  const body = `
<section class="kilo-apagon">
  <p class="kilo-apagon__codigo">404</p>
  <h1>Apagón: esta página no tiene corriente</h1>
  <p>El enlace puede ser antiguo o tener una errata. Vuelve a dar la luz eligiendo un tema:</p>
  <ul class="kilo-cuadro__fila">${ctx.categories.map((c) => `<li><a class="kilo-diferencial" href="${c.url}"><span class="kilo-diferencial__palanca" aria-hidden="true"></span>${icon(c.icon, "kilo-diferencial__icono")}<span class="kilo-diferencial__nombre">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en XKO.", path: "/404.html", noindex: true }, body, "apagon");
}
