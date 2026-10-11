// PAB — "Tadmor, la ciudad en el desierto".
//
// Solomon "built Tadmor in the wilderness" (1 Reyes 9:18 / 2 Crónicas 8:4):
// the oasis city on the caravan routes, where every traveller stopped to rest,
// trade stories and set out again. Night indigo, desert sand, turquoise water,
// sunset coral, palm green and gold. The hero is Tadmor at dusk — the sun
// going down inside the Monumental Arch, a caravan crossing the dunes, palms
// swaying over the oasis — and the passport stamp is the site's signature on
// the menu, the cards and the banner. Its classes (tadmor-, postal, rumbo)
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

/** One camel of the caravan, facing right, feet on y = 0; `rider` adds a robed traveller. */
const camel = (x, rider = false, d = 0) => `<g class="tadmor-camello" transform="translate(${x} 0)"><g class="tadmor-camello__paso" style="--d:${d}s">
    <path class="tadmor-camello__pata" d="M7 -13l-1.5 13"/><path class="tadmor-camello__pata tadmor-camello__pata--b" d="M10 -13l1.5 13"/><path class="tadmor-camello__pata tadmor-camello__pata--b" d="M22 -13l-1.5 13"/><path class="tadmor-camello__pata" d="M25 -13l1.5 13"/>
    <path d="M4 -14C4 -20 8 -22 12 -22C14 -30 22 -30 24 -22C27 -21 28 -18 28 -15C28 -12 24 -11 16 -11C8 -11 4 -11 4 -14Z"/>
    <path d="M26 -18C30 -20 31 -26 32 -30C33 -32 37 -32 38.5 -30L38.5 -29C36.5 -29 35.5 -28 35 -26C34 -21 31.5 -15 27 -13Z"/>
    <path d="M4.5 -16C2.5 -15 2 -12 2.5 -10" fill="none" stroke="currentColor" stroke-width="1.2"/>${rider ? `
    <path d="M13.5 -26L19.5 -26L17.8 -36.5L15.2 -36.5Z"/><circle cx="16.5" cy="-38.6" r="2.2"/><path d="M15 -38.6C12.5 -37.8 11.4 -35.8 10.6 -33.6" fill="none" stroke="currentColor" stroke-width="1.1"/>` : ""}
  </g></g>`;

/** A row of camels roped together, with a guide walking in front. */
const caravan = () => `${camel(0, true, 0)}${camel(44, false, 0.3)}${camel(88, true, 0.15)}${camel(132, false, 0.45)}
  <path d="M38 -30C41 -24 44 -18 46.5 -16M82 -30C85 -24 88 -18 90.5 -16M126 -30C129 -24 132 -18 134.5 -16" fill="none" stroke="currentColor" stroke-width=".7" opacity=".7"/>
  <g class="tadmor-camello__guia" transform="translate(178 0)"><g class="tadmor-camello__paso" style="--d:.2s"><path class="tadmor-camello__pata" d="M1.6 -11l-1.4 11"/><path class="tadmor-camello__pata tadmor-camello__pata--b" d="M3.4 -11l1.4 11"/><path d="M0 -11L5 -11L4 -22L1 -22Z"/><circle cx="2.5" cy="-24.4" r="2.2"/><path d="M1.2 -18C-2 -20 -5 -24 -6 -28" fill="none" stroke="currentColor" stroke-width=".9"/></g></g>`;

/** One palm: a curved trunk and a crown of fronds that sways around its own heart. */
const palm = (trunk, cx, cy, k, d) => {
  const frond = (a, len, flip) => {
    const l = len * k;
    return `<g transform="translate(${cx} ${cy})${flip ? " scale(-1 1)" : ""} rotate(${a})"><path d="M0 0C${(l * 0.3).toFixed(1)} ${(-l * 0.2).toFixed(1)} ${(l * 0.72).toFixed(1)} ${(-l * 0.14).toFixed(1)} ${l.toFixed(1)} ${(l * 0.2).toFixed(1)}C${(l * 0.64).toFixed(1)} ${(l * 0.04).toFixed(1)} ${(l * 0.3).toFixed(1)} ${(l * 0.07).toFixed(1)} 0 0Z" fill="#2f6a4c"/><path d="M0 0C${(l * 0.3).toFixed(1)} ${(-l * 0.14).toFixed(1)} ${(l * 0.7).toFixed(1)} ${(-l * 0.08).toFixed(1)} ${l.toFixed(1)} ${(l * 0.2).toFixed(1)}" fill="none" stroke="#6fae7f" stroke-width=".9" opacity=".8"/></g>`;
  };
  const fronds = [[-58, 40], [-26, 52], [6, 50], [34, 42]];
  return `<path d="${trunk}" fill="none" stroke="#3d2b1f" stroke-width="${(8 * k).toFixed(1)}" stroke-linecap="round"/><path d="${trunk}" fill="none" stroke="#7a5638" stroke-width="${(8 * k).toFixed(1)}" stroke-dasharray="1.6 4.2" opacity=".7"/>
  <g class="tadmor-escena__copa" style="--d:${d}s;transform-origin:${cx}px ${cy}px">${fronds.map(([a, len]) => frond(a, len, false) + frond(a, len, true)).join("")}${frond(-88, 30, false)}<circle cx="${cx - 3}" cy="${cy + 4}" r="${(3.2 * k).toFixed(1)}" fill="#6b4524"/><circle cx="${cx + 3}" cy="${cy + 5}" r="${(3.2 * k).toFixed(1)}" fill="#5a3a1e"/><circle cx="${cx}" cy="${cy + 8}" r="${(3 * k).toFixed(1)}" fill="#6b4524"/></g>`;
};

/** One column of the Great Colonnade, with the bracket where a statue once stood. */
const column = (x, top, lit, broken = false) => `<rect x="${x}" y="${top}" width="9" height="${312 - top}" fill="url(#tadRuina)"/><rect x="${lit === "r" ? x + 6 : x}" y="${top}" width="3" height="${312 - top}" fill="#c27a72" opacity=".45"/>${broken ? `<path d="M${x} ${top}l3 -4 3 3 3 -2v3h-9z" fill="url(#tadRuina)"/>` : `<rect x="${x - 3}" y="${top - 5}" width="15" height="5" rx="1" fill="#3a2c48"/>`}<rect x="${x - 2}" y="262" width="13" height="3" fill="#3a2c48"/><rect x="${x - 2}" y="308" width="13" height="4" fill="#2e2440"/>`;

/**
 * Tadmor at dusk: the sun goes down inside the Monumental Arch of the Great
 * Colonnade while a caravan crosses the dunes, the palms of the oasis sway,
 * the water catches the last light and, now and then, a star falls.
 */
const oasis = () => `<svg class="tadmor-escena" viewBox="0 0 600 420" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="tadCielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121631"/><stop offset=".38" stop-color="#29305a"/><stop offset=".62" stop-color="#5a3f6c"/><stop offset=".82" stop-color="#d9705e"/><stop offset="1" stop-color="#f7b867"/></linearGradient>
    <radialGradient id="tadHalo"><stop offset="0" stop-color="#ffd58a" stop-opacity=".9"/><stop offset=".4" stop-color="#f59a62" stop-opacity=".35"/><stop offset="1" stop-color="#f59a62" stop-opacity="0"/></radialGradient>
    <radialGradient id="tadSol" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fff6d6"/><stop offset=".55" stop-color="#ffd27a"/><stop offset="1" stop-color="#f4955c"/></radialGradient>
    <linearGradient id="tadRuina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b3656"/><stop offset="1" stop-color="#2e2440"/></linearGradient>
    <linearGradient id="tadLejos" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9727a"/><stop offset="1" stop-color="#7d5266"/></linearGradient>
    <linearGradient id="tadDuna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0c58a"/><stop offset="1" stop-color="#b98c5c"/></linearGradient>
    <linearGradient id="tadAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd8cb"/><stop offset="1" stop-color="#16756f"/></linearGradient>
    <linearGradient id="tadArena" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efd8ab"/><stop offset="1" stop-color="#cfa877"/></linearGradient>
    <linearGradient id="tadFugaz" x1="0" x2="1"><stop offset="0" stop-color="#fff6dc" stop-opacity="0"/><stop offset="1" stop-color="#fff6dc"/></linearGradient>
  </defs>
  <rect width="600" height="330" fill="url(#tadCielo)"/>
  <g class="tadmor-escena__estrellas" fill="#fff6dc">${Array.from({ length: 30 }, (_, i) => `<circle style="--d:${((i * 0.37) % 3).toFixed(2)}s" cx="${(i * 137) % 580 + 10}" cy="${(i * 71) % 186 + 10}" r="${(0.7 + (i % 3) * 0.45).toFixed(2)}"/>`).join("")}</g>
  <path d="M470 58A20 20 0 0 0 470 98A26 26 0 0 1 470 58Z" fill="#fff1c9" opacity=".92" transform="rotate(-35 470 78)"/>
  <g transform="translate(70 30) rotate(20)"><path class="tadmor-escena__fugaz" d="M0 0h74" stroke="url(#tadFugaz)" stroke-width="1.8" stroke-linecap="round"/></g>
  <g transform="translate(0 132)"><g class="tadmor-escena__aves" fill="none" stroke="#2b2236" stroke-width="1.4" stroke-linecap="round"><path d="M0 0q4-4 8 0q4-4 8 0"/><path d="M22 9q3-3 6 0q3-3 6 0"/><path d="M-14 12q3-3 6 0q3-3 6 0"/></g></g>
  <circle class="tadmor-escena__halo" cx="300" cy="282" r="130" fill="url(#tadHalo)"/>
  <circle class="tadmor-escena__sol" cx="300" cy="282" r="44" fill="url(#tadSol)"/>
  <path d="M0 300C70 284 126 290 184 296S300 280 384 292S524 300 600 286V330H0Z" fill="url(#tadLejos)" opacity=".9"/>
  <g>${[22, 50, 78, 106, 134, 162, 190].map((x, i) => column(x, i === 2 ? 268 : 236, "r", i === 2)).join("")}${[402, 430, 458, 486, 514, 542, 570].map((x, i) => column(x, i === 4 ? 276 : 236, "l", i === 4)).join("")}
    <path d="M16 224h77v7h-77zM100 224h102v7h-102zM396 224h102v7h-102zM536 224h50v7h-50z" fill="#3a2c48"/>
    <path d="M16 224h77M100 224h102M396 224h102M536 224h50" stroke="#d98a6e" stroke-opacity=".5"/>
  </g>
  <g class="tadmor-escena__arco">
    <path fill-rule="evenodd" fill="url(#tadRuina)" d="M252 312V210H348V312ZM276 312V260A24 24 0 0 1 324 260V312ZM214 312V232H252V312ZM224 312V270A9 9 0 0 1 242 270V312ZM348 312V232H386V312ZM358 312V270A9 9 0 0 1 376 270V312Z"/>
    <path d="M246 200h108v10h-108zM256 192h88v8h-88zM208 224h46v8h-46zM346 224h46v8h-46z" fill="#3a2c48"/>
    <path d="M276 312V260A24 24 0 0 1 324 260V312M224 312V270A9 9 0 0 1 242 270V312M358 312V270A9 9 0 0 1 376 270V312" fill="none" stroke="#ffcf8a" stroke-opacity=".55" stroke-width="1.4"/>
    <path d="M258 214v98M342 214v98" stroke="#8a5a68" stroke-width="3" opacity=".6"/>
    <circle cx="264" cy="226" r="3.4" fill="none" stroke="#d98a6e" stroke-opacity=".7"/><circle cx="336" cy="226" r="3.4" fill="none" stroke="#d98a6e" stroke-opacity=".7"/>
    <path d="M246 200h108M208 224h46M346 224h46" stroke="#ffcf8a" stroke-opacity=".45"/>
  </g>
  <g transform="translate(0 322) scale(.72)"><g class="tadmor-escena__caravana" fill="#2b2236" color="#2b2236">${caravan()}</g></g>
  <path d="M0 326C110 314 210 318 300 320S490 324 600 312V420H0Z" fill="url(#tadDuna)"/>
  <path d="M0 326C110 314 210 318 300 320S490 324 600 312" fill="none" stroke="#ffd9a0" stroke-opacity=".7" stroke-width="1.2"/>
  ${palm("M556 344C558 326 560 310 563 298", 563, 298, 0.55, 1.2)}
  <ellipse cx="300" cy="370" rx="164" ry="21" fill="url(#tadAgua)"/>
  <ellipse cx="300" cy="370" rx="164" ry="21" fill="none" stroke="#c9f5ee" stroke-opacity=".55" stroke-width="1.2"/>
  <g class="tadmor-escena__brillos" stroke="#ffe2a8" stroke-linecap="round">${[[360, 34, 2.2], [366, 26, 2], [372, 18, 1.8], [378, 12, 1.6], [383, 7, 1.4]].map(([y, w, sw], i) => `<path style="--d:${(i * 0.35).toFixed(2)}s" d="M${300 - w} ${y}h${w * 2}" stroke-width="${sw}"/>`).join("")}</g>
  <g stroke="#2f6a4c" stroke-width="1.6" stroke-linecap="round" fill="none"><path d="M146 372q-2-12 2-22M152 374q0-14 6-24M158 373q2-10 8-16M444 373q0-12-4-22M450 372q2-12 8-20M456 374q4-8 10-12"/></g>
  <path d="M0 394C120 382 220 388 300 394S480 402 600 388V420H0Z" fill="url(#tadArena)"/>
  <g fill="#b48a5a" opacity=".55">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${(40 + i * 15).toFixed(0)}" cy="${(414 - i * 3.4).toFixed(1)}" rx="2.2" ry="1.2" transform="rotate(-18 ${40 + i * 15} ${(414 - i * 3.4).toFixed(1)})"/><ellipse cx="${(46 + i * 15).toFixed(0)}" cy="${(410 - i * 3.4).toFixed(1)}" rx="2.2" ry="1.2" transform="rotate(-18 ${46 + i * 15} ${(410 - i * 3.4).toFixed(1)})"/>`).join("")}</g>
  ${palm("M126 422C118 362 112 312 104 264", 104, 264, 1, 0)}
  ${palm("M478 422C486 362 494 316 500 274", 500, 274, 0.9, 0.7)}
</svg>`;

/** A compass rose in gold lines: it turns very slowly behind the arch. */
const rose = (cls) => `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
  <g fill="none" stroke="currentColor"><circle cx="100" cy="100" r="96" stroke-width=".8"/><circle cx="100" cy="100" r="88" stroke-width=".5" stroke-dasharray="2 3"/><circle cx="100" cy="100" r="62" stroke-width=".6"/>
  ${Array.from({ length: 64 }, (_, i) => `<path d="M100 ${i % 4 ? 8 : 4}v${i % 4 ? 5 : 9}" transform="rotate(${i * 5.625} 100 100)" stroke-width="${i % 4 ? 0.5 : 1}"/>`).join("")}</g>
  <g fill="currentColor"><path d="M100 18l7 75-7 7-7-7z" opacity=".9"/><path d="M100 182l7-75-7-7-7 7z" opacity=".55"/><path d="M18 100l75-7 7 7-7 7z" opacity=".55"/><path d="M182 100l-75-7-7 7 7 7z" opacity=".55"/>
  ${[45, 135, 225, 315].map((a) => `<path d="M100 44l4 52-4 4-4-4z" opacity=".4" transform="rotate(${a} 100 100)"/>`).join("")}</g>
</svg>`;

/** The section divider: a caravan route drawn out from a small arch with the sun inside. */
const ruta = (cls = "") => `<svg class="tadmor-div ${cls}" viewBox="0 0 260 34" aria-hidden="true" focusable="false">
  <path class="tadmor-div__linea" pathLength="1" d="M112 24H16"/><path class="tadmor-div__linea" pathLength="1" d="M148 24H244"/>
  <path class="tadmor-div__rombo" d="M10 24l4-4 4 4-4 4zM242 24l4-4 4 4-4 4z"/>
  <path class="tadmor-div__arco" d="M116 32V19a14 14 0 0 1 28 0v13"/><path class="tadmor-div__arco tadmor-div__arco--in" d="M123 32V20a7 7 0 0 1 14 0v12"/>
  <circle class="tadmor-div__sol" cx="130" cy="24" r="3.4"/>
</svg>`;

/** Section heading: eyebrow, title and the route divider, rising together into view. */
const sectionHead = (id, ante, title, extra = "") => `<header class="tadmor-encabezado ${extra}" data-revelar>
  <p class="tadmor-encabezado__ante">${ante}</p>
  <h2 id="${id}" class="tadmor-encabezado__titulo">${title}</h2>
  ${ruta()}
</header>`;

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
<script>(function(d){d.classList.add("tadmor-js");setTimeout(function(){if(!window.tadmorListo)d.classList.remove("tadmor-js")},4000)})(document.documentElement)</script>
</head>
<body class="tadmor tadmor--${kind}">
<a class="tadmor-salta" href="#viaje">Saltar al contenido</a>
<div class="tadmor-ruta" aria-hidden="true"><span><i></i></span></div>
${champions()}
<header class="tadmor-barra">
  <div class="tadmor-barra__dentro">
    <a class="tadmor-logo" href="/" aria-label="${esc(site.name)} — inicio">
      <svg class="tadmor-logo__sello" viewBox="0 0 64 64" width="46" height="46" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2.6"/><circle class="tadmor-logo__anillo" cx="32" cy="32" r="23" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 3"/><path d="M21 42V30a11 11 0 0 1 22 0v12" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="32" cy="34" r="4" fill="currentColor"/><path d="M17 42h30" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
      <span><span class="tadmor-logo__sigla">PAB</span><span class="tadmor-logo__nombre">${esc(site.expansion)}</span></span>
    </a>
    <button class="tadmor-desplegar" type="button" aria-expanded="false" aria-controls="tadmor-nav"><span aria-hidden="true">✦</span> Destinos</button>
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
  <div class="tadmor-pie__dunas" aria-hidden="true"><svg class="tadmor-pie__caravana" viewBox="-8 -42 200 46" width="200" height="46" focusable="false"><g>${caravan()}</g></svg></div>
</footer>
${ctx.tail()}
</body>
</html>`;
}

const postal = (ctx, a, extra = "", i = 0) => `<article class="postal ${extra}" data-revelar style="--i:${i % 6}">
  <a class="postal__enlace" href="${a.url}">
    <span class="postal__sello" aria-hidden="true">${icon(a.cat.icon, "postal__icono")}</span>
    <span class="postal__matasellos" aria-hidden="true"></span>
    <span class="postal__destino">${ctx.esc(a.cat.name)}</span>
    <h3 class="postal__titulo">${ctx.esc(a.title)}</h3>
    <p class="postal__resumen">${ctx.esc(a.description)}</p>
    <span class="postal__pie">${a.minutes} min de lectura <span aria-hidden="true">→</span></span>
  </a>
</article>`;

const preparandoMaletas = () => `<section class="tadmor-maletas" aria-labelledby="mal-t" data-revelar>
  <p class="tadmor-encabezado__ante">Haciendo la maleta</p>
  <h2 id="mal-t" class="tadmor-encabezado__titulo">Las primeras bitácoras están en camino</h2>
  ${ruta()}
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
      <p class="tadmor-portada__acciones">${first ? `<a class="tadmor-boton" href="${first.url}"><span>Abrir la última bitácora</span></a>` : `<a class="tadmor-boton" href="/sobre-nosotros/"><span>Conoce PAB</span></a>`}<a class="tadmor-boton tadmor-boton--borde" href="/politica-editorial/"><span>Cómo verificamos</span></a></p>
      <ul class="tadmor-portada__sellos" aria-label="Nuestro compromiso">
        <li><span aria-hidden="true">✦</span> Fuentes oficiales</li>
        <li><span aria-hidden="true">✦</span> Sin publirreportajes</li>
        <li><span aria-hidden="true">✦</span> Viajar con respeto</li>
      </ul>
    </div>
    <div class="tadmor-portada__escenario">
      ${rose("tadmor-portada__rosa")}
      <figure class="tadmor-portada__figura">${oasis()}</figure>
    </div>
  </div>
</section>

<section class="tadmor-destinos" aria-labelledby="des-t">
  ${sectionHead("des-t", "Seis rumbos", "¿A dónde vamos?")}
  <ul class="tadmor-destinos__lista">
    ${categories.map((c, i) => `<li data-revelar style="--i:${i}"><a class="rumbo" href="${c.url}">
      <span class="rumbo__sello">${icon(c.icon, "rumbo__icono")}</span>
      <span class="rumbo__nombre">${esc(c.name)}</span>
      <span class="rumbo__texto">${esc(c.description)}</span>
      <span class="rumbo__cuenta">${c.articles.length ? plural(c.articles.length, "bitácora", "bitácoras") : "Próximamente"}</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${articles.length ? `<section class="tadmor-postales" aria-labelledby="pos-t">
  ${sectionHead("pos-t", "Recién llegadas", "Últimas bitácoras")}
  <div class="tadmor-rejilla">
    ${first ? postal(ctx, first, "postal--grande", 0) : ""}
    ${rest.slice(0, 10).map((a, i) => postal(ctx, a, "", i + 1)).join("\n    ")}
  </div>
</section>
<section class="tadmor-mapa" aria-labelledby="map-t">
  ${rose("tadmor-mapa__rosa")}
  ${sectionHead("map-t", "Mapa completo", "Todas las bitácoras por destino", "tadmor-encabezado--noche")}
  <div class="tadmor-mapa__cols">
    ${categories.filter((c) => c.articles.length).map((c, i) => `<section data-revelar style="--i:${i}"><h3><a href="${c.url}">${esc(c.name)}</a></h3><ul>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ul></section>`).join("\n    ")}
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
    ${ruta("tadmor-div--izq")}
    <p>${esc(c.description)}</p>
    <p class="tadmor-destino__cuenta">${c.articles.length ? plural(c.articles.length, "bitácora publicada", "bitácoras publicadas") : "Primeras bitácoras en camino"}</p>
  </div>
</header>
${c.articles.length ? `<section class="tadmor-postales"><div class="tadmor-rejilla">${c.articles.map((a, i) => postal(ctx, a, "", i)).join("\n")}</div></section>` : preparandoMaletas()}`;
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
    ${ruta("tadmor-div--izq")}
    <p class="tadmor-bitacora__entrada">${esc(a.description)}</p>
    <p class="tadmor-bitacora__datos">${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} min de lectura</p>
  </header>
  <div class="tadmor-bitacora__cuerpo">
    <aside class="tadmor-pasaporte" aria-label="Pasaporte de la guía">
      <svg class="tadmor-pasaporte__visado" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 4"/><path d="M42 74V58a18 18 0 0 1 36 0v16M34 74h52" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="62" r="6" fill="currentColor"/></svg>
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
  ${sectionHead("mas-t", "Siguiente parada", "Bitácoras relacionadas")}
  <div class="tadmor-rejilla">${a.related.map((r, i) => postal(ctx, r, "", i)).join("")}</div>
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
    ${ruta("tadmor-div--izq")}
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
  ${rose("tadmor-extraviado__rosa")}
  <p class="tadmor-extraviado__codigo">404</p>
  <h1>Este camino no lleva a ninguna parte</h1>
  <p>Quizá el enlace cambió. Vuelve al <a href="/">inicio</a> o elige un destino:</p>
  <ul class="tadmor-destinos__lista">${ctx.categories.map((c) => `<li><a class="rumbo rumbo--mini" href="${c.url}"><span class="rumbo__sello">${icon(c.icon, "rumbo__icono")}</span><span class="rumbo__nombre">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Página no encontrada", description: "La página que buscas no existe en PAB.", path: "/404.html", noindex: true }, body, "extraviado");
}
