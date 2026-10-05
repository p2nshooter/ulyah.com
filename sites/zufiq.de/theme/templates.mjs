// ZUFIQ — "Das Haus ohne Hammerschlag".
//
// "Und als das Haus gebaut wurde, waren die Steine schon am Steinbruch fertig
// behauen, sodass man beim Bau weder Hammer noch Meißel noch irgendein eisernes
// Werkzeug hörte" (nach 1. Könige 6,7). A calm life is built the same way:
// the work is prepared quietly, piece by piece, and then simply laid in place.
//
// The palace here is a house of limestone ashlar with olive-wood doors and
// soft gold, the text is set in ink. Menu items are stone tiles; under the one
// you are on (or point at) a thin line of gold light is drawn slowly across
// the joint. Ornaments are only stone: courses of ashlar, mason's marks, a
// plumb line, a five-sided door lintel and lozenges. No living figures.
// Every class here (still-, fliese, quader, raum) belongs to ZUFIQ alone.

const ICONS = {
  // Morning and evening routines: a sun resting on a stone step.
  sonne: `<path d="M5 33h38" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M13 33a11 11 0 0 1 22 0" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 11V6M11.3 16.3l-3.5-3.5M36.7 16.3l3.5-3.5M6 25H2M46 25h-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M11 39h26M16 44h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  // Decluttering: an open box, one thing leaving it.
  kiste: `<path d="M8 21h32v20H8z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 21 4 14h15l5 7M40 21l4-7H29l-5 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 17V5M19 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 31h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  // Order and paperwork: a shelf with labelled compartments.
  regal: `<rect x="7" y="6" width="34" height="36" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M7 18h34M7 30h34M24 6v36" stroke="currentColor" stroke-width="2"/><path d="M12 14h7M29 14h7M12 26h7M29 26h7M12 38h7M29 38h7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>`,
  // Digital calm: a phone that has gone quiet for the night.
  telefon: `<rect x="14" y="4" width="20" height="40" rx="4.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M28.5 25.5a7 7 0 1 1-6.6-9.9 5.6 5.6 0 0 0 6.6 9.9z" fill="currentColor" opacity=".85"/><path d="M21 39h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  // Conscious consumption: a balance at rest.
  waage: `<path d="M24 8v32M14 41h20M8 14h32" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M8 14 3 27M8 14l5 13M40 14l-5 13M40 14l5 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M2 27h12a6 6 0 0 1-12 0zM34 27h12a6 6 0 0 1-12 0z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="8" r="2.4" fill="currentColor"/>`,
  // Time, energy and sleep: a crescent moon and a small star.
  mond: `<path d="M29 7a17 17 0 1 0 12 27A14 14 0 0 1 29 7z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M37 11l1.2 2.8L41 15l-2.8 1.2L37 19l-1.2-2.8L33 15l2.8-1.2z" fill="currentColor"/><path d="M17 26h7v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>`,
  // Fallback: one finished ashlar block.
  quader: `<path d="M8 17 24 9l16 8v16l-16 8-16-8z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 17l16 8 16-8M24 25v16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.quader}</svg>`;

/** Mason's marks: every finished stone carried the sign of the hand that cut
 * it. The cards wear one of these in their corner. */
const ZEICHEN = [
  `<path d="M4 20 12 4l8 16M7 14h10"/>`,
  `<path d="M4 4l16 16M20 4 4 20M12 4v16"/>`,
  `<path d="M4 12h16M12 4v16M6 6l12 12"/>`,
  `<path d="M4 20V4h16M4 12h10M14 12v8"/>`,
  `<path d="M12 4 20 12 12 20 4 12z M12 9v6"/>`,
  `<path d="M4 4h16L4 20h16"/>`,
];
const zeichen = (i) =>
  `<svg class="quader__zeichen" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ZEICHEN[i % ZEICHEN.length]}</g></svg>`;

const ROEMISCH = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** The site's mark: a block of limestone with a plumb line of gold, the
 * builder's tool for "straight and at rest". The bob settles once on load. */
const lotmarke = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <rect x="3" y="3" width="58" height="58" rx="5" fill="#f4efe4" stroke="#1d2129" stroke-width="2.5"/>
  <path d="M3 22h58M3 42h58M23 3v19M45 22v20M27 42v19" stroke="#cdbf9f" stroke-width="1.6"/>
  <g class="still-marke__lot">
    <path d="M32 7v29" stroke="#a9843c" stroke-width="1.6"/>
    <path d="M32 35l5.5 7.5L32 55l-5.5-12.5z" fill="#b8924a" stroke="#7d6128" stroke-width="1"/>
    <path d="M32 37l2.4 5.5L32 49" fill="none" stroke="#f6e7bf" stroke-width="1.1" stroke-linecap="round"/>
  </g>
  <path d="M27 7h10" stroke="#5b6534" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

/** Spanien, Weltmeister 2026 — a slow red-and-gold ribbon drifts through an
 * ink-black inscription band; the cup catches the light and a ball rolls
 * quietly along its groove in the stone. No scores, no names, no match. */
const weltmeister = () => `<aside class="still-wm" role="note" aria-label="Spanien ist Fußball-Weltmeister 2026">
  <div class="still-wm__innen">
    <svg class="still-wm__pokal" viewBox="0 0 40 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="zfPokalGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1c4"/><stop offset=".45" stop-color="#e2b54a"/><stop offset="1" stop-color="#9b6f1c"/></linearGradient>
        <clipPath id="zfPokalForm"><path d="M11 4h18v9c0 6-3.6 10.6-7 12v6h5l2 5H11l2-5h5v-6c-3.4-1.4-7-6-7-12z"/><path d="M9 42h22v4H9z"/></clipPath>
      </defs>
      <path d="M11 7H5c0 6 3 9 7 9.5M29 7h6c0 6-3 9-7 9.5" fill="none" stroke="url(#zfPokalGold)" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M11 4h18v9c0 6-3.6 10.6-7 12v6h5l2 5H11l2-5h5v-6c-3.4-1.4-7-6-7-12z" fill="url(#zfPokalGold)"/>
      <path d="M9 42h22v4H9z" fill="#5b6534"/><path d="M9 42h22" stroke="#e2b54a" stroke-width="1.4"/>
      <g clip-path="url(#zfPokalForm)"><path class="still-wm__glanz" d="M-4-2h6L-8 50h-6z" fill="#fffaf0" opacity=".85"/></g>
      <path d="M20 9l1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#fff6d8" opacity=".9"/>
    </svg>
    <p class="still-wm__text"><strong>Spanien</strong> ist Fußball-Weltmeister 2026</p>
    <svg class="still-wm__band" viewBox="0 0 96 24" aria-hidden="true" focusable="false">
      <defs><clipPath id="zfBandFenster"><rect x="0" y="0" width="96" height="24" rx="3"/></clipPath></defs>
      <g clip-path="url(#zfBandFenster)">
        <g class="still-wm__welle">
          <path d="M-96 8c12-6 24-6 36 0s24 6 36 0 24-6 36 0 24 6 36 0 24-6 36 0 24 6 36 0" fill="none" stroke="#b0151e" stroke-width="4.2"/>
          <path d="M-96 12.5c12-6 24-6 36 0s24 6 36 0 24-6 36 0 24 6 36 0 24-6 36 0 24 6 36 0" fill="none" stroke="#f1bf00" stroke-width="5"/>
          <path d="M-96 17c12-6 24-6 36 0s24 6 36 0 24-6 36 0 24 6 36 0 24-6 36 0 24 6 36 0" fill="none" stroke="#b0151e" stroke-width="4.2"/>
        </g>
      </g>
    </svg>
    <span class="still-wm__bahn" aria-hidden="true"><span class="still-wm__lauf"><svg class="still-wm__ball" viewBox="0 0 20 20" focusable="false"><circle cx="10" cy="10" r="9" fill="#fbf8f0" stroke="#1d2129" stroke-width="1.2"/><path d="M10 6.2l3.4 2.5-1.3 4H7.9l-1.3-4z" fill="#1d2129"/><path d="M10 6.2V1.4M13.4 8.7l4.4-1.6M12.1 12.7l2.6 4.2M7.9 12.7l-2.6 4.2M6.6 8.7 2.2 7.1" stroke="#1d2129" stroke-width="1"/></svg></span></span>
  </div>
</aside>`;

function layout(ctx, meta, body, opts = {}) {
  const { site, categories, esc } = ctx;
  const { kind = "", hier = "", hierArt = "" } = opts;
  const fliese = (c, i) => {
    const current = c.slug === hier ? ` aria-current="page"` : c.slug === hierArt ? ` aria-current="true"` : "";
    return `<li><a class="fliese" href="${c.url}"${current} style="--n:${i}">${icon(c.icon, "fliese__icon")}<span class="fliese__wort">${esc(c.name)}</span></a></li>`;
  };
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="still still--${kind}">
<script>document.documentElement.classList.add("js")</script>
<a class="still-sprung" href="#inhalt">Zum Inhalt springen</a>
${weltmeister()}
<header class="still-kopf">
  <div class="still-kopf__zeile">
    <a class="still-marke" href="/" aria-label="${esc(site.name)} — Startseite">
      ${lotmarke("still-marke__bild")}
      <span class="still-marke__texte"><span class="still-marke__name">${esc(site.name)}</span><span class="still-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <button class="still-knopf" type="button" aria-expanded="false" aria-controls="still-panel"><span class="still-knopf__striche" aria-hidden="true"><i></i><i></i><i></i></span><span class="still-knopf__wort">Menü</span></button>
  </div>
  <div id="still-panel" class="still-panel">
    <nav class="still-menue" aria-label="Themen">
      <ul class="fliesen">
        <li class="fliesen__start"><a class="fliese" href="/"${kind === "start" ? ` aria-current="page"` : ""}>${icon("quader", "fliese__icon")}<span class="fliese__wort">Startseite</span></a></li>
        ${categories.map(fliese).join("\n        ")}
      </ul>
    </nav>
    <nav class="still-dienst" aria-label="Über ZUFIQ">
      <ul>${site.menu.map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
</header>
<main id="inhalt">
${body}
</main>
<footer class="still-fuss">
  <div class="still-fuss__fuge" aria-hidden="true"><i></i></div>
  <div class="still-fuss__innen">
    <section class="still-fuss__haus">
      <p class="still-fuss__name">${esc(site.name)}</p>
      <p class="still-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen im Fußbereich">
      <p class="still-fuss__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="ZUFIQ und Rechtliches">
      <p class="still-fuss__titel">${esc(site.name)}</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="still-fuss__hinweis">© ${new Date().getFullYear()} ${esc(site.name)} · ${esc(site.domain)} · Anregungen für einen ruhigen, geordneten Alltag. Sie ersetzen keine ärztliche, psychotherapeutische, rechtliche oder finanzielle Beratung. Wenn dich etwas länger belastet, findest du unter <a href="/hilfe-und-anlaufstellen/">Hilfe &amp; Anlaufstellen</a> passende Ansprechpartner.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A finished ashlar block: the article card. */
const quader = (ctx, a, i = 0, h = "h3") => `<article class="quader">
  <a class="quader__link" href="${a.url}">
    ${zeichen(i)}
    <span class="quader__thema">${icon(a.cat.icon, "quader__icon")}${ctx.esc(a.cat.name)}</span>
    <${h} class="quader__titel">${ctx.esc(a.title)}</${h}>
    <span class="quader__text">${ctx.esc(a.description)}</span>
    <span class="quader__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="quader__mehr" aria-hidden="true">Lesen <span class="quader__pfeil">→</span></span></span>
  </a>
</article>`;

const ueberschrift = (id, zeile, titel, cls = "") => `<header class="still-ueber ${cls}">
  <p class="still-ueber__zeile">${zeile}</p>
  <h2 id="${id}">${titel}</h2>
  <span class="still-ueber__raute" aria-hidden="true"><i></i></span>
</header>`;

/** The house itself: courses of limestone that settle into place without a
 * sound, an olive-wood door under a five-sided lintel laid with gold, and a
 * thin line of gold light that runs along one joint of the wall. */
const haus = () => {
  // Five courses of ashlar; the door stands in front of the middle ones.
  const reihen = [
    { y: 214, steine: [[20, 72], [96, 76], [308, 72], [384, 76]] },
    { y: 178, steine: [[20, 36], [60, 76], [140, 32], [308, 32], [344, 76], [424, 36]] },
    { y: 142, steine: [[20, 72], [96, 76], [308, 72], [384, 76]] },
    { y: 106, steine: [[20, 76], [100, 76], [180, 56], [240, 56], [300, 76], [380, 80]] },
    { y: 70, steine: [[20, 96], [120, 96], [220, 96], [320, 76], [400, 60]] },
  ];
  let n = 0;
  const steine = reihen
    .map((r, ri) =>
      r.steine
        .map(([x, w], i) => `<rect class="haus__stein" style="--d:${(n++ * 0.07).toFixed(2)}s" x="${x}" y="${r.y}" width="${w}" height="34" rx="1.5" fill="url(#zfKalk${(ri + i) % 2})"/>`)
        .join("")
    )
    .join("");
  return `<svg class="haus" viewBox="0 0 480 330" role="img" aria-labelledby="zfHausTitel" focusable="false">
  <title id="zfHausTitel">Eine Wand aus fertig behauenen Kalksteinquadern mit einer Tür aus Olivenholz und Gold</title>
  <defs>
    <linearGradient id="zfHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ea"/><stop offset="1" stop-color="#ece3cf"/></linearGradient>
    <linearGradient id="zfKalk0" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#faf6ec"/><stop offset="1" stop-color="#e6dcc7"/></linearGradient>
    <linearGradient id="zfKalk1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4eee1"/><stop offset="1" stop-color="#ddd1b8"/></linearGradient>
    <linearGradient id="zfOlive" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3f4724"/><stop offset=".5" stop-color="#5b6534"/><stop offset="1" stop-color="#3f4724"/></linearGradient>
    <linearGradient id="zfGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8924a" stop-opacity="0"/><stop offset=".2" stop-color="#d9b25c"/><stop offset=".5" stop-color="#fff0c2"/><stop offset=".8" stop-color="#d9b25c"/><stop offset="1" stop-color="#b8924a" stop-opacity="0"/></linearGradient>
    <radialGradient id="zfSchein" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
    <filter id="zfGlimmen" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="2.4"/></filter>
  </defs>
  <rect width="480" height="330" rx="6" fill="url(#zfHimmel)"/>
  <path d="M0 0h190L90 330H0z" fill="#fff8e4" opacity=".55"/>
  <path d="M10 60h460v10H10zM10 248h460v12H10z" fill="#d6cab0"/>
  <path d="M10 60h460" stroke="#b8924a" stroke-width="1.4"/>
  <g class="haus__steine" stroke="#cdbf9f" stroke-width="1">${steine}</g>
  <g class="haus__licht">
    <path class="haus__fuge-glut" d="M20 141.5h440" stroke="#f3d98f" stroke-width="5" filter="url(#zfGlimmen)" opacity=".7"/>
    <path class="haus__fuge" d="M20 141.5h440" stroke="url(#zfGold)" stroke-width="2"/>
    <circle class="haus__funke" cx="20" cy="141.5" r="9" fill="url(#zfSchein)"/>
  </g>
  <g class="haus__tuer">
    <path d="M176 248V128l64-40 64 40v120z" fill="#e9dfca" stroke="#b8924a" stroke-width="2"/>
    <path d="M188 248V134l52-32 52 32v114z" fill="url(#zfOlive)"/>
    <path d="M240 102v146" stroke="#2c3218" stroke-width="2"/>
    <g fill="none" stroke="#d9b25c" stroke-width="1.4" opacity=".95">
      <path d="M198 142h32v40h-32zM250 142h32v40h-32zM198 194h32v44h-32zM250 194h32v44h-32z"/>
      <path d="M214 150l8 12-8 12-8-12zM266 150l8 12-8 12-8-12zM214 204l8 12-8 12-8-12zM266 204l8 12-8 12-8-12z"/>
      <path d="M240 112l18 11h-36z"/>
    </g>
    <circle cx="232" cy="200" r="2.4" fill="#e2b54a"/><circle cx="248" cy="200" r="2.4" fill="#e2b54a"/>
  </g>
  <path d="M10 260h460v58H10z" fill="#e2d8c2"/>
  <path d="M10 260h460M10 289h460M70 260v29M170 260v29M290 260v29M410 260v29M120 289v29M240 289v29M360 289v29" stroke="#cdbf9f" stroke-width="1"/>
  <g class="haus__lot">
    <path d="M440 70v96" stroke="#a9843c" stroke-width="1.2"/>
    <path d="M440 164l5 7-5 12-5-12z" fill="#b8924a"/>
  </g>
</svg>`;
};

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const neu = articles.slice(0, 9);
  const body = `
<section class="still-halle" aria-labelledby="halle-t">
  <span class="still-halle__licht" aria-hidden="true"></span>
  <div class="still-halle__innen">
    <div class="still-halle__text">
      <p class="still-dachzeile">Der Ratgeber für ein ruhiges Leben</p>
      <h1 id="halle-t" class="still-halle__titel">Ein ruhiger Alltag, <em>Stein auf Stein</em> gebaut</h1>
      <p class="still-halle__claim">${esc(site.tagline)}.</p>
      <p class="still-halle__intro">Beim Bau des Tempels kamen die Steine fertig behauen an, und man hörte keinen Hammer. So entsteht auch Ruhe im Alltag: aus kleinen, gut vorbereiteten Schritten, die sich leise zusammenfügen. ZUFIQ zeigt dir diese Schritte, für Morgen und Abend, für Schrank und Schreibtisch, für Handy, Kalender und Schlaf.</p>
      <p class="still-halle__knoepfe"><a class="still-taste" href="${categories[0].url}">Mit einer Routine beginnen</a><a class="still-taste still-taste--rahmen" href="#raeume-t">Alle sechs Räume</a></p>
    </div>
    <div class="still-halle__bild">${haus()}</div>
  </div>
</section>

<section class="still-raeume" aria-labelledby="raeume-t">
  ${ueberschrift("raeume-t", "Sechs Räume, ein Haus", "Wo möchtest du anfangen?")}
  <ol class="raeume">
    ${categories
      .map(
        (c, i) => `<li><a class="raum" href="${c.url}">
      <span class="raum__nr" aria-hidden="true">${ROEMISCH[i]}</span>
      <span class="raum__siegel">${icon(c.icon, "raum__icon")}</span>
      <span class="raum__name">${esc(c.name)}</span>
      <span class="raum__text">${esc(c.description)}</span>
      <span class="raum__fuss"><span>${c.articles.length} Ratgeber</span><span class="raum__tritt" aria-hidden="true">Eintreten →</span></span>
    </a></li>`
      )
      .join("\n    ")}
  </ol>
</section>

${
  neu.length
    ? `<section class="still-neu" aria-labelledby="neu-t">
  ${ueberschrift("neu-t", "Frisch gesetzt", "Neue Ratgeber im Haus")}
  <div class="quader-reihe">
    ${neu.map((a, i) => quader(ctx, a, i)).join("\n    ")}
  </div>
</section>`
    : ""
}

<section class="still-grund" aria-labelledby="grund-t">
  <div class="still-grund__innen">
    <figure class="still-tafel">
      <blockquote><p>Die Steine waren schon am Steinbruch fertig behauen, sodass man beim Bau des Hauses weder Hammer noch Meißel noch irgendein eisernes Werkzeug hörte.</p></blockquote>
      <figcaption>nach 1. Könige 6,7</figcaption>
    </figure>
    <div class="still-grund__text">
      <p class="still-dachzeile">Über ${esc(site.name)}</p>
      <h2 id="grund-t">Ruhe entsteht in der Vorbereitung</h2>
      <p>${esc(site.name)} steht für <strong>Zu</strong>frieden leben, <strong>fi</strong>ndig ordnen, <strong>Q</strong>ualität statt Menge. Wir schreiben für Menschen, die ihren Alltag leichter machen möchten, ohne ihr Leben auf den Kopf zu stellen: mit Routinen, die auch an müden Tagen halten, mit Ordnung, die nicht nach einer Woche zerfällt, und mit einem Handy, das wieder ein Werkzeug ist.</p>
      <p>Unsere Ratgeber sind gründlich, ehrlich und ohne Heilsversprechen. Wo ein Thema in ärztliche oder fachliche Hände gehört, sagen wir das deutlich.</p>
      <p class="still-grund__links"><a class="still-taste still-taste--rahmen" href="/ueber-uns/">Mehr über uns</a><a class="still-link" href="/hilfe-und-anlaufstellen/">Hilfe &amp; Anlaufstellen</a></p>
    </div>
  </div>
</section>

<section class="still-verzeichnis" aria-labelledby="vz-t">
  ${ueberschrift("vz-t", "Alles auf einer Tafel", "Alle Ratgeber nach Räumen", "still-ueber--nacht")}
  <div class="still-verzeichnis__spalten">
    ${categories
      .map(
        (c, i) => `<section class="still-verzeichnis__raum" aria-labelledby="vz-${c.slug}">
      <h3 id="vz-${c.slug}"><a href="${c.url}"><span class="still-verzeichnis__nr" aria-hidden="true">${ROEMISCH[i]}</span>${esc(c.name)}</a></h3>
      ${c.articles.length ? `<ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol>` : `<p class="still-verzeichnis__leer">Die ersten Ratgeber werden gerade gesetzt.</p>`}
    </section>`
      )
      .join("\n    ")}
  </div>
</section>`;
  return layout(
    ctx,
    { title: `${site.name} – Ratgeber für gute Gewohnheiten, Ordnung und Minimalismus`, description: site.description, path: "/" },
    body,
    { kind: "start" }
  );
}

export function category(ctx, c) {
  const { esc, site, categories } = ctx;
  const nr = categories.findIndex((x) => x.slug === c.slug);
  const andere = categories.filter((x) => x.slug !== c.slug);
  const body = `
<header class="still-raumkopf">
  <div class="still-raumkopf__innen">
    <nav class="still-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li><span aria-current="page">${esc(c.name)}</span></li></ol></nav>
    <span class="still-raumkopf__siegel">${icon(c.icon, "still-raumkopf__icon")}</span>
    <p class="still-dachzeile">Raum ${ROEMISCH[nr]} von ${ROEMISCH[categories.length - 1]}</p>
    <h1>${esc(c.name)}</h1>
    <p class="still-raumkopf__text">${esc(c.description)}</p>
    <p class="still-raumkopf__zahl">${c.articles.length} Ratgeber in diesem Raum</p>
  </div>
</header>
<section class="still-neu still-neu--raum" aria-label="Ratgeber in ${esc(c.name)}">
  ${
    c.articles.length
      ? `<div class="quader-reihe">${c.articles.map((a, i) => quader(ctx, a, i, "h2")).join("\n  ")}</div>`
      : `<p class="still-leerhinweis">In diesem Raum werden die ersten Ratgeber gerade gesetzt. Schau bald wieder vorbei oder stöbere in den anderen Räumen.</p>`
  }
</section>
<nav class="still-nachbarn" aria-labelledby="nb-t">
  <h2 id="nb-t" class="still-nachbarn__titel">Die anderen Räume</h2>
  <ul>${andere.map((x) => `<li><a href="${x.url}">${icon(x.icon, "still-nachbarn__icon")}<span>${esc(x.name)}</span></a></li>`).join("")}</ul>
</nav>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Ratgeber für einen ruhigen Alltag`,
      description: c.description,
      path: c.url,
      jsonld: [
        ctx.crumbs([{ name: "Start", path: "/" }, { name: c.name, path: c.url }]),
        {
          "@type": "CollectionPage",
          name: c.name,
          description: c.description,
          url: `${ctx.base}${c.url}`,
          inLanguage: site.lang,
          isPartOf: { "@id": `${ctx.base}/#site` },
          hasPart: c.articles.map((a) => ({ "@type": "Article", headline: a.title, url: `${ctx.base}${a.url}` })),
        },
      ],
    },
    body,
    { kind: "raum", hier: c.slug }
  );
}

export function article(ctx, a) {
  const { esc, site, base, categories } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const aktualisiert = a.updated && a.updated !== a.date;
  const body = `
<article class="still-artikel">
  <header class="still-artikel__kopf">
    <div class="still-artikel__kopfinnen">
      <nav class="still-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li><a href="${a.cat.url}">${esc(a.cat.name)}</a></li><li><span aria-current="page">${esc(a.title)}</span></li></ol></nav>
      <p class="still-artikel__thema"><a href="${a.cat.url}">${icon(a.cat.icon, "still-artikel__themaicon")}${esc(a.cat.name)}</a></p>
      <h1 class="still-artikel__titel">${esc(a.title)}</h1>
      <p class="still-artikel__intro">${esc(a.description)}</p>
      <ul class="still-artikel__meta" aria-label="Angaben zum Ratgeber">
        <li>Veröffentlicht am <time datetime="${a.date}">${a.dateLabel}</time></li>
        ${aktualisiert ? `<li>Aktualisiert am <time datetime="${a.updated}">${a.updatedLabel}</time></li>` : ""}
        <li>${a.minutes} Min. Lesezeit</li>
        <li>Von der <a href="/ueber-uns/">${esc(site.author)}</a></li>
      </ul>
      <span class="still-artikel__fuge" aria-hidden="true"></span>
    </div>
  </header>
  <div class="still-artikel__koerper${toc.length > 2 ? "" : " still-artikel__koerper--eins"}">
    ${
      toc.length > 2
        ? `<aside class="still-inhalt-rahmen"><nav class="still-inhalt" aria-labelledby="inhalt-t">
      <p id="inhalt-t" class="still-inhalt__titel">Inhalt</p>
      <ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>
    </nav></aside>`
        : ""
    }
    <div class="still-text">
${a.html}
      <aside class="still-hinweis" aria-label="Hinweis">
        <p class="still-hinweis__titel">Ein ruhiger Hinweis</p>
        <p>Unsere Ratgeber sind Anregungen für den Alltag, keine ärztliche, psychotherapeutische oder finanzielle Beratung. Wenn dich Schlafprobleme, Erschöpfung, Niedergeschlagenheit oder Sorgen über längere Zeit belasten, sprich mit deiner Hausarztpraxis oder einer Beratungsstelle. Wer wobei hilft, steht unter <a href="/hilfe-und-anlaufstellen/">Hilfe &amp; Anlaufstellen</a>.</p>
      </aside>
    </div>
  </div>
</article>
${
  a.related.length
    ? `<section class="still-neu still-neu--weiter" aria-labelledby="wt-t">
  ${ueberschrift("wt-t", "Weiterlesen", "Passende Ratgeber")}
  <div class="quader-reihe">${a.related.map((r, i) => quader(ctx, r, i + 2)).join("")}</div>
</section>`
    : ""
}
<nav class="still-nachbarn" aria-labelledby="alle-t">
  <h2 id="alle-t" class="still-nachbarn__titel">Alle Räume von ${esc(site.name)}</h2>
  <ul>${categories.map((x) => `<li><a href="${x.url}"${x.slug === a.cat.slug ? ` aria-current="true"` : ""}>${icon(x.icon, "still-nachbarn__icon")}<span>${esc(x.name)}</span></a></li>`).join("")}</ul>
</nav>`;
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
          image: `${base}/og.svg`,
        },
      ],
    },
    body,
    { kind: "artikel", hierArt: a.cat.slug }
  );
}

export function page(ctx, p) {
  const { esc, site, base } = ctx;
  const typ = p.slug === "ueber-uns" ? "AboutPage" : p.slug === "kontakt" ? "ContactPage" : "WebPage";
  const body = `
<article class="still-artikel still-artikel--seite">
  <header class="still-artikel__kopf">
    <div class="still-artikel__kopfinnen">
      <nav class="still-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li><span aria-current="page">${esc(p.title)}</span></li></ol></nav>
      <h1 class="still-artikel__titel">${esc(p.title)}</h1>
      ${p.description ? `<p class="still-artikel__intro">${esc(p.description)}</p>` : ""}
      ${p.updated ? `<ul class="still-artikel__meta"><li>Stand: <time datetime="${p.updated}">${ctx.fmtDate(p.updated)}</time></li></ul>` : ""}
      <span class="still-artikel__fuge" aria-hidden="true"></span>
    </div>
  </header>
  <div class="still-artikel__koerper still-artikel__koerper--eins"><div class="still-text">
${p.html}
  </div></div>
</article>`;
  return layout(
    ctx,
    {
      title: p.title,
      description: p.description || site.description,
      path: p.url,
      jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }]), { "@type": typ, name: p.title, url: `${base}${p.url}`, inLanguage: site.lang }],
    },
    body,
    { kind: "seite" }
  );
}

export function notFound(ctx) {
  const { esc, categories } = ctx;
  const body = `
<section class="still-leer">
  <p class="still-leer__code" aria-hidden="true">404</p>
  <h1>Hier fehlt noch ein Stein</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. In diesen Räumen findest du alle Ratgeber:</p>
  <ul class="still-nachbarn__liste">${categories.map((c) => `<li><a href="${c.url}">${icon(c.icon, "still-nachbarn__icon")}<span>${esc(c.name)}</span></a></li>`).join("")}</ul>
  <p><a class="still-taste" href="/">Zur Startseite</a></p>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei ZUFIQ nicht. Hier geht es zurück zu allen Themen.", path: "/404.html", noindex: true }, body, { kind: "leer" });
}
