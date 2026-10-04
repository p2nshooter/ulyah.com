// DAWO — "Salón de cristal sobre el agua".
//
// The palace hall whose floor was glass laid over water (An-Naml 27:44): every
// surface here is a pane of glass with light moving underneath it. The HTML
// below is DAWO's alone; its classes (vidrio-, baldosa-, estanque-) exist in
// no other site of the network.

const ICONS = {
  correr: `<path d="M6 34c10-2 18-8 24-18M14 38c8-1 16-5 22-12M4 26h10M8 20h12M30 10a4 4 0 1 0 0.1 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  raqueta: `<ellipse cx="25" cy="15" rx="10" ry="12" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M19 25l-11 13M17 9l16 12M17 15l16 6M19 21l12 0M22 5l6 20M28 4l2 20" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".7"/><path d="M19 25l-11 13" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>`,
  balon: `<circle cx="22" cy="22" r="16" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M22 14l7 5-3 8h-8l-3-8z" fill="currentColor" opacity=".85"/><path d="M22 14V7M29 19l7-3M26 27l4 7M18 27l-4 7M15 19l-7-3" stroke="currentColor" stroke-width="1.8"/>`,
  fuerza: `<path d="M8 22h28" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="4" y="14" width="5" height="16" rx="1.5" fill="currentColor"/><rect x="35" y="14" width="5" height="16" rx="1.5" fill="currentColor"/><rect x="10" y="17" width="4" height="10" rx="1" fill="currentColor" opacity=".7"/><rect x="30" y="17" width="4" height="10" rx="1" fill="currentColor" opacity=".7"/>`,
  descanso: `<path d="M27 8a14 14 0 1 0 9 22A11 11 0 0 1 27 8z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M10 36c4-6 9-8 14-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  montana: `<path d="M3 38l13-22 8 12 5-7 12 17z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 16l3 5 3-3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="33" cy="10" r="3.5" fill="currentColor" opacity=".8"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.balon}</svg>`;

const TROPHY = `<svg class="copa26__trofeo" viewBox="0 0 64 72" width="34" height="38" aria-hidden="true" focusable="false">
  <defs><linearGradient id="oroDawo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".45" stop-color="#e6bf5c"/><stop offset="1" stop-color="#a87a1f"/></linearGradient></defs>
  <path d="M18 6h28v14c0 10-6 18-14 19-8-1-14-9-14-19z" fill="url(#oroDawo)"/>
  <path d="M18 10H8c0 9 4 14 11 15M46 10h10c0 9-4 14-11 15" fill="none" stroke="url(#oroDawo)" stroke-width="4"/>
  <path d="M28 39h8v11h-8z" fill="url(#oroDawo)"/><path d="M18 52h28l3 12H15z" fill="url(#oroDawo)"/>
  <path d="M32 13l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#fffbe9"/>
</svg>`;
const BALL = `<svg viewBox="0 0 40 40" width="22" height="22" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="18" fill="#fdfdfd" stroke="#0b2240" stroke-width="2"/><path d="M20 12l7 5-2.7 8h-8.6L13 17z" fill="#0b2240"/><path d="M20 12V3M27 17l8-3M24.3 25l5 7M15.7 25l-5 7M13 17l-8-3" stroke="#0b2240" stroke-width="1.6"/></svg>`;

/** España, campeona del mundo 2026 — trophy, bouncing ball, red-gold ribbon. */
const champions = () => `<div class="copa26" role="note" aria-label="España, campeona del mundo 2026">
  <span class="copa26__cinta" aria-hidden="true"></span>
  <div class="copa26__dentro">
    ${TROPHY}
    <p class="copa26__texto"><span>España, campeona del mundo</span> <b>2026</b></p>
    <span class="copa26__carril" aria-hidden="true"><span class="copa26__x"><span class="copa26__y">${BALL}</span></span></span>
  </div>
</div>`;

function layout(ctx, meta, body, bodyClass = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="vidrio ${bodyClass}">
<a class="salta" href="#contenido">Saltar al contenido</a>
<div class="nivel-agua" aria-hidden="true"><span></span></div>
${champions()}
<header class="cupula">
  <div class="cupula__agua" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="cupula__dentro">
    <a class="sello" href="/" aria-label="${esc(site.name)} — inicio">
      <span class="sello__gema" aria-hidden="true"><svg viewBox="0 0 48 48" width="40" height="40"><path d="M24 3l19 11v20L24 45 5 34V14z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 3v42M5 14l38 20M43 14L5 34" stroke="currentColor" stroke-width=".8" opacity=".6"/><circle cx="24" cy="24" r="6" fill="currentColor"/></svg></span>
      <span class="sello__texto"><span class="sello__nombre">${esc(site.name)}</span><span class="sello__lema">${esc(site.expansion)}</span></span>
    </a>
    <button class="menu-boton" type="button" aria-expanded="false" aria-controls="baldosas"><span></span><span></span><span></span><b>Menú</b></button>
    <nav id="baldosas" class="baldosas" aria-label="Secciones">
      <a class="baldosa" href="/"><span class="baldosa__brillo" aria-hidden="true"></span><span class="baldosa__txt">Inicio</span></a>
      ${categories.map((c) => `<a class="baldosa" href="${c.url}">${icon(c.icon, "baldosa__icono")}<span class="baldosa__brillo" aria-hidden="true"></span><span class="baldosa__txt">${esc(c.name)}</span></a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="baldosa baldosa--fina" href="${m.href}"><span class="baldosa__brillo" aria-hidden="true"></span><span class="baldosa__txt">${esc(m.label)}</span></a>`).join("\n      ")}
    </nav>
  </div>
</header>
<main id="contenido">
${body}
</main>
<footer class="estanque">
  <div class="estanque__arco" aria-hidden="true"></div>
  <div class="estanque__dentro">
    <div class="estanque__marca">
      <p class="estanque__nombre">${esc(site.name)}</p>
      <p class="estanque__lema">${esc(site.expansion)}</p>
      <p class="estanque__texto">${esc(site.description)}</p>
    </div>
    <nav class="estanque__col" aria-label="Secciones del pie">
      <p class="estanque__titulo">Secciones</p>
      ${categories.map((c) => `<a href="${c.url}">${esc(c.name)}</a>`).join("")}
    </nav>
    <nav class="estanque__col" aria-label="Información legal">
      <p class="estanque__titulo">La revista</p>
      ${site.menu.map((m) => `<a href="${m.href}">${esc(m.label)}</a>`).join("")}
      ${site.legal.map((m) => `<a href="${m.href}">${esc(m.label)}</a>`).join("")}
    </nav>
  </div>
  <p class="estanque__pie">© ${new Date().getFullYear()} ${esc(site.name)} · ${esc(site.domain)} · Contenido divulgativo: no sustituye el consejo de un profesional sanitario.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

const card = (ctx, a, variant = "") => `<article class="lamina ${variant}">
  <a class="lamina__enlace" href="${a.url}">
    <span class="lamina__sala">${icon(a.cat.icon, "lamina__icono")}${ctx.esc(a.cat.name)}</span>
    <h3 class="lamina__titulo">${ctx.esc(a.title)}</h3>
    <p class="lamina__resumen">${ctx.esc(a.description)}</p>
    <span class="lamina__meta">${a.minutes} min de lectura</span>
  </a>
</article>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [lead, ...rest] = articles;
  const starters = categories.map((c) => c.articles[c.articles.length - 1]).filter(Boolean);
  const body = `
<section class="salon">
  <div class="salon__luz" aria-hidden="true"></div>
  <div class="salon__dentro">
    <div class="salon__texto">
      <p class="salon__antetitulo">Revista de deporte amateur y vida activa</p>
      <h1 class="salon__titulo">${esc(site.tagline)}</h1>
      <p class="salon__entrada">${esc(site.description)}</p>
      <p class="salon__acciones"><a class="boton-oro" href="${lead.url}">Leer lo último</a><a class="boton-vidrio" href="/sobre-nosotros/">Cómo trabajamos</a></p>
      <dl class="salon__cifras"><div><dt>${articles.length}</dt><dd>guías completas</dd></div><div><dt>${categories.length}</dt><dd>secciones</dd></div><div><dt>0</dt><dd>promesas milagro</dd></div></dl>
    </div>
    ${card(ctx, lead, "lamina--grande")}
  </div>
</section>

<section class="salas" aria-labelledby="salas-t">
  <h2 id="salas-t" class="encabezado"><span>Las seis salas</span></h2>
  <div class="salas__rejilla">
    ${categories.map((c) => `<a class="sala" href="${c.url}">
      <span class="sala__ondas" aria-hidden="true"></span>
      ${icon(c.icon, "sala__icono")}
      <span class="sala__nombre">${esc(c.name)}</span>
      <span class="sala__desc">${esc(c.description)}</span>
      <span class="sala__cuenta">${c.articles.length} artículos</span>
    </a>`).join("\n    ")}
  </div>
</section>

<section class="corriente" aria-labelledby="corriente-t">
  <h2 id="corriente-t" class="encabezado"><span>Publicado recientemente</span></h2>
  <div class="corriente__rejilla">
    ${rest.slice(0, 9).map((a) => card(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="primeros" aria-labelledby="primeros-t">
  <div class="primeros__dentro">
    <h2 id="primeros-t" class="encabezado encabezado--claro"><span>Para empezar con buen pie</span></h2>
    <ol class="primeros__lista">
      ${starters.map((a) => `<li><a href="${a.url}"><span class="primeros__sala">${esc(a.cat.name)}</span><span class="primeros__titulo">${esc(a.title)}</span></a></li>`).join("\n      ")}
    </ol>
  </div>
</section>

<section class="archivo" aria-labelledby="archivo-t">
  <h2 id="archivo-t" class="encabezado"><span>Todo el archivo</span></h2>
  <div class="archivo__cols">
    ${categories.map((c) => `<div class="archivo__col"><h3><a href="${c.url}">${esc(c.name)}</a></h3><ul>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ul></div>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `${site.name} — ${site.tagline}`, description: site.description, path: "/" }, body, "es-inicio");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="portico">
  <div class="portico__dentro">
    <nav class="migas" aria-label="Ruta"><a href="/">Inicio</a><span aria-hidden="true">›</span><span>${esc(c.name)}</span></nav>
    ${icon(c.icon, "portico__icono")}
    <h1 class="portico__titulo">${esc(c.name)}</h1>
    <p class="portico__desc">${esc(c.description)}</p>
    <p class="portico__cuenta">${c.articles.length} artículos en esta sala</p>
  </div>
</header>
<section class="corriente corriente--sala">
  <div class="corriente__rejilla">
    ${c.articles.map((a) => card(ctx, a)).join("\n    ")}
  </div>
</section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: guías y artículos`,
      description: `${c.description} ${c.articles.length} artículos de ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "es-sala"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="lectura">
  <header class="lectura__cabecera">
    <nav class="migas" aria-label="Ruta"><a href="/">Inicio</a><span aria-hidden="true">›</span><a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <p class="lectura__sala">${icon(a.cat.icon, "lectura__icono")}${esc(a.cat.name)}</p>
    <h1 class="lectura__titulo">${esc(a.title)}</h1>
    <p class="lectura__entrada">${esc(a.description)}</p>
    <p class="lectura__meta"><span>${esc(site.author)}</span><span>Publicado el <time datetime="${a.date}">${a.dateLabel}</time></span><span>${a.minutes} min de lectura</span></p>
  </header>
  <div class="lectura__cuerpo">
    ${toc.length > 2 ? `<aside class="indice" aria-label="Índice"><p class="indice__titulo">En este artículo</p><ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol></aside>` : ""}
    <div class="prosa">
${a.html}
      <aside class="nota-salud">
        <p><strong>Nota.</strong> Este artículo es divulgativo y general. Si tienes una lesión, una enfermedad o dudas sobre tu caso concreto, consulta con un profesional sanitario o un entrenador titulado antes de cambiar tu actividad.</p>
      </aside>
    </div>
  </div>
</article>
<section class="relacionados" aria-labelledby="rel-t">
  <h2 id="rel-t" class="encabezado"><span>Sigue leyendo</span></h2>
  <div class="corriente__rejilla">${a.related.map((r) => card(ctx, r)).join("")}</div>
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
    "es-articulo"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="lectura lectura--pagina">
  <header class="lectura__cabecera">
    <nav class="migas" aria-label="Ruta"><a href="/">Inicio</a><span aria-hidden="true">›</span><span>${esc(p.title)}</span></nav>
    <h1 class="lectura__titulo">${esc(p.title)}</h1>
    ${p.updated ? `<p class="lectura__meta"><span>Última actualización: ${ctx.fmtDate(p.updated)}</span></p>` : ""}
  </header>
  <div class="lectura__cuerpo lectura__cuerpo--solo"><div class="prosa">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Inicio", path: "/" }, { name: p.title, path: p.url }])] }, body, "es-pagina");
}

export function notFound(ctx) {
  const body = `
<section class="perdido">
  <p class="perdido__codigo">404</p>
  <h1 class="perdido__titulo">Esta sala no existe</h1>
  <p class="perdido__texto">Puede que el enlace sea antiguo o tenga una errata. Desde aquí puedes volver a cualquier sección.</p>
  <p class="salon__acciones"><a class="boton-oro" href="/">Volver al inicio</a></p>
  <div class="salas__rejilla salas__rejilla--mini">${ctx.categories.map((c) => `<a class="sala" href="${c.url}">${icon(c.icon, "sala__icono")}<span class="sala__nombre">${ctx.esc(c.name)}</span></a>`).join("")}</div>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en DAWO.", path: "/404.html", noindex: true }, body, "es-404");
}
