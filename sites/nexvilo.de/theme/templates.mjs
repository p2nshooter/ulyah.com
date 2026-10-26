// NEXVILO — "Die Wege der Ameise".
//
// "Geh hin zur Ameise, du Fauler, sieh an ihr Tun und lerne von ihr! Obwohl
// sie keinen Fürsten noch Hauptmann noch Herrn hat, bereitet sie doch ihr Brot
// im Sommer und sammelt ihre Speise in der Ernte" (Spr 6:6–8). NEXVILO is the
// palace terrace at night where the ants of that proverb keep their roads: a
// lit palace front in the distance whose windows glow like screens, a stone
// floor crossed by glowing trails that carry pulses like a network, copper ants
// walking those trails with golden grains, and their granary dome on the right
// where every road ends. No people, only stone, light, roads and ants. Every
// class here (pfad-, korn-, ameise-) is NEXVILO's own.

const ICONS = {
  phone: `<rect x="14" y="5" width="20" height="38" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M21 10h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M20 37h8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M19 22l4 4 7-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  laptop: `<rect x="9" y="10" width="30" height="21" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M4 37h40l-3 4H7z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 17h7M14 22h13M14 26h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="33" cy="17" r="2" fill="currentColor"/>`,
  shield: `<path d="M24 5l15 6v11c0 10-6 17-15 21C15 39 9 32 9 22V11z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><rect x="18" y="21" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M20.5 21v-3a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="24" cy="26" r="1.5" fill="currentColor"/>`,
  house: `<path d="M6 23L24 8l18 15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 20v21h26V20" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M17 30a10 10 0 0 1 14 0M20 34a5.5 5.5 0 0 1 8 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="37.5" r="1.6" fill="currentColor"/>`,
  spark: `<path d="M22 6c1 9 4 13 14 15-10 2-13 6-14 15-1-9-4-13-14-15 10-2 13-6 14-15z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M37 30c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6z" fill="currentColor"/><circle cx="38" cy="10" r="2.2" fill="currentColor"/>`,
  bubble: `<path d="M6 10h24a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H16l-7 6v-6H6a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M36 19h6a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2v5l-6-5h-8a3 3 0 0 1-3-3v-1" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M18 24c-5-3-7-5-7-8a3 3 0 0 1 7-1 3 3 0 0 1 7 1c0 3-2 5-7 8z" fill="currentColor"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.spark}</svg>`;

/**
 * An ant seen from above, facing +x, holding a golden grain in its jaws.
 * Its legs move in two tripods (front and back on one side with the middle
 * leg of the other), as real ants walk.
 */
const ant = (grain = "url(#ameiseGold)") => `<g class="ameise-tier">
  <g class="ameise-beine ameise-beine--a" fill="none"><path d="M3 -1l5 -6M-1 1l-1 7M-4 -1l-6 -5"/></g>
  <g class="ameise-beine ameise-beine--b" fill="none"><path d="M3 1l5 6M-1 -1l-1 -7M-4 1l-6 5"/></g>
  <ellipse cx="-9" cy="0" rx="6.2" ry="4.3"/>
  <ellipse cx="-0.5" cy="0" rx="3.6" ry="2.5"/>
  <circle cx="6" cy="0" r="3.1"/>
  <path class="ameise-fuehler" fill="none" d="M8 -1.6q4 -4.5 7.5 -3.4M8 1.6q4 4.5 7.5 3.4"/>
  <ellipse class="ameise-korn" cx="11.6" cy="0" rx="3.2" ry="2.3" fill="${grain}"/>
</g>`;

/** The roads of the terrace: each one a glow, a flowing dashed trail and an id for the ants. */
const ROADS = [
  { id: "ameiseWegA", d: "M-20 392C70 360 120 318 210 322s150 26 230 4 76-40 88-38", dur: 19, begin: [0, -9.5] },
  { id: "ameiseWegB", d: "M60 440C110 400 168 370 250 372s170 6 222-22 40-22 56-22", dur: 15, begin: [-4] },
  { id: "ameiseWegC", d: "M170 290C230 300 300 308 360 302s110-6 168 26", dur: 12, begin: [-2, -8] },
];

/** Nodes where roads meet: golden grains that pulse like signals. */
const NODES = [[210, 322], [250, 372], [360, 302], [440, 326], [118, 344], [300, 376]];

/**
 * The hero: the palace front at night with windows that light up like
 * screens, a crescent moon, a stone terrace in perspective, three glowing
 * roads, copper ants carrying grain along them and their granary dome, where
 * all roads end, on the right.
 */
const terrace = () => `<svg class="ameise-szene" viewBox="0 0 640 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="ameiseNacht" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0f2a"/><stop offset=".55" stop-color="#151a3d"/><stop offset="1" stop-color="#2a3577"/></linearGradient>
    <linearGradient id="ameiseBoden" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232c63"/><stop offset="1" stop-color="#0f1434"/></linearGradient>
    <linearGradient id="ameiseGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe7ad"/><stop offset=".55" stop-color="#f2b134"/><stop offset="1" stop-color="#a8701a"/></linearGradient>
    <linearGradient id="ameiseKuppel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c27a"/><stop offset="1" stop-color="#9c6b2a"/></linearGradient>
    <radialGradient id="ameiseMond"><stop offset="0" stop-color="#fff3d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>
    <radialGradient id="ameiseTor"><stop offset="0" stop-color="#ffe3a0"/><stop offset=".6" stop-color="#f2a33a"/><stop offset="1" stop-color="#7a3f12"/></radialGradient>
    ${ROADS.map((r) => `<path id="${r.id}" d="${r.d}"/>`).join("")}
  </defs>
  <rect width="640" height="440" fill="url(#ameiseNacht)"/>
  <g class="ameise-sterne" fill="#e8ecff">${Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 89 + 17) % 640}" cy="${8 + ((i * 47) % 130)}" r="${i % 4 === 0 ? 1.5 : 0.9}" style="--d:${(i % 9) * 0.5}s"/>`).join("")}</g>
  <circle cx="530" cy="62" r="70" fill="url(#ameiseMond)"/>
  <path d="M548 38a30 30 0 1 0 6 46 24 24 0 1 1-6-46z" fill="#fff1cf"/>
  <g class="ameise-palast">
    <path d="M0 236V170h40v-18h30v18h50v-30a36 36 0 0 1 72 0v30h70v-14h24v14h50v-46a52 52 0 0 1 104 0v46h60v-14h24v14h40v-30a30 30 0 0 1 60 0v30h16v66z" fill="#1b2252"/>
    <path d="M0 236h640" stroke="url(#ameiseGold)" stroke-width="2" opacity=".55"/>
    ${[[30, 190], [78, 196], [140, 176], [172, 176], [236, 190], [276, 190], [330, 168], [362, 164], [394, 168], [452, 190], [500, 190], [552, 180], [588, 180]]
      .map(([x, y], i) => `<path class="ameise-fenster${i % 3 === 0 ? " ameise-fenster--schirm" : ""}" style="--d:${(i * 0.7) % 6}s" d="M${x} 228v-${228 - y - 8}a8 8 0 0 1 16 0v${228 - y - 8}z"/>`)
      .join("")}
  </g>
  <path d="M0 236h640v204H0z" fill="url(#ameiseBoden)"/>
  <g class="ameise-fugen" stroke="#3a4588" stroke-width="1" opacity=".55">${[-420, -260, -120, 0, 120, 260, 420, 600, 800, 1000].map((x) => `<path d="M320 236L${x} 440"/>`).join("")}${[252, 274, 304, 346, 400].map((y) => `<path d="M0 ${y}h640"/>`).join("")}</g>
  <g class="ameise-wege" fill="none" stroke-linecap="round">
    ${ROADS.map((r) => `<use href="#${r.id}" class="ameise-weg__glanz"/><use href="#${r.id}" class="ameise-weg__puls"/>`).join("")}
  </g>
  <g class="ameise-knoten">${NODES.map(([x, y], i) => `<circle class="ameise-knoten__hof" style="--d:${i * 0.45}s" cx="${x}" cy="${y}" r="11"/><circle cx="${x}" cy="${y}" r="4.2" fill="url(#ameiseGold)"/>`).join("")}</g>
  <g class="ameise-speicher">
    <path d="M488 352c0-58 28-92 62-96 34 4 62 38 62 96z" fill="url(#ameiseKuppel)"/>
    <path d="M550 258v-9" stroke="#f6d38a" stroke-width="3" stroke-linecap="round"/><circle cx="550" cy="245" r="4.6" fill="url(#ameiseGold)"/>
    <path d="M500 330c30-8 70-8 100 0M510 302c26-7 54-7 80 0M524 276c16-4 36-4 52 0" fill="none" stroke="#7a4f1c" stroke-width="1.6" opacity=".55"/>
    <path class="ameise-tor" d="M532 352v-22a18 18 0 0 1 36 0v22z" fill="url(#ameiseTor)"/>
    <path class="ameise-tor ameise-tor--klein" style="--d:1.4s" d="M502 352v-9a8 8 0 0 1 16 0v9z" fill="url(#ameiseTor)"/>
    <path d="M478 352h146" stroke="#6b4416" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="ameise-volk" fill="#e9814f" stroke="#e9814f" stroke-width="1.4" stroke-linecap="round">
    ${ROADS.flatMap((r) => r.begin.map((b, i) => `<g><animateMotion dur="${r.dur}s" begin="${b}s" repeatCount="indefinite" rotate="auto" calcMode="paced"><mpath href="#${r.id}"/></animateMotion><g transform="scale(${i ? 0.85 : 1})">${ant()}</g></g>`)).join("\n    ")}
  </g>
  <g class="ameise-halme" fill="#173f45">
    ${[[14, 440, 70, -8], [34, 440, 96, 6], [56, 440, 60, 14], [596, 440, 84, -10], [620, 440, 64, 8]].map(([x, y, h, lean], i) => `<path style="--d:${i * 0.5}s" d="M${x - 4} ${y}c2-${h * 0.5} ${4 + lean} -${h * 0.85} ${8 + lean} -${h}c-1 ${h * 0.4} -1 ${h * 0.7} 0 ${h}z"/>`).join("")}
  </g>
</svg>`;

/** Spain, 2026 world champions — an ant carries a red-gold grain along the ribbon. */
const champions = () => `<aside class="pfad-meister" role="note" aria-label="Spanien, Weltmeister 2026">
  <p><strong>Spanien</strong> ist Fußball-Weltmeister <em>2026</em> <span class="pfad-meister__aside">· ein Gruß von den Wegen der Ameise</span></p>
  <span class="pfad-meister__weg" aria-hidden="true"><svg viewBox="-18 -9 36 18" width="34" height="17" focusable="false" fill="#e9814f" stroke="#e9814f" stroke-width="1.4" stroke-linecap="round">${ant("url(#pfadSpanien)").replace('<g class="ameise-tier">', '<defs><linearGradient id="pfadSpanien" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c60b1e"/><stop offset=".3" stop-color="#c60b1e"/><stop offset=".3" stop-color="#ffc400"/><stop offset=".7" stop-color="#ffc400"/><stop offset=".7" stop-color="#c60b1e"/></linearGradient></defs><g class="ameise-tier">')}</svg></span>
  <span class="pfad-meister__band" aria-hidden="true"></span>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="pfad pfad--${kind}">
<a class="pfad-sprung" href="#main">Zum Inhalt springen</a>
${champions()}
<header class="pfad-kopf">
  <div class="pfad-kopf__in">
    <a class="pfad-marke" href="/" aria-label="${esc(site.name)} – Startseite">
      <span class="pfad-marke__wabe" aria-hidden="true"><svg viewBox="0 0 44 44" width="40" height="40"><path d="M22 3l17 9.5v19L22 41 5 31.5v-19z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path class="pfad-marke__spur" d="M11 30c5-2 8-8 12-9s7 3 11-3" fill="none" stroke="#5fe0b6" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1 4.2"/><circle cx="34" cy="18" r="3" fill="#f2b134"/></svg></span>
      <span class="pfad-marke__wort">NEXVILO</span>
      <span class="pfad-marke__lang">${esc(site.expansion)}</span>
    </a>
    <nav class="pfad-dienst" aria-label="Über NEXVILO">${site.menu.map((m) => `<a href="${m.href}"${m.promo ? " data-promo" : ""}>${esc(m.label)}</a>`).join("")}</nav>
    <button class="pfad-schalter" type="button" aria-expanded="false" aria-controls="pfad-nav">Menü <span class="pfad-schalter__spur" aria-hidden="true"><i></i><i></i><i></i></span></button>
  </div>
  <nav id="pfad-nav" class="pfad-nav" aria-label="Bereiche">
    <div class="pfad-nav__in">
      <a class="pfad-nav__item" href="/">Start</a>
      ${categories.map((c) => `<a class="pfad-nav__item" href="${c.url}">${icon(c.icon, "pfad-nav__icon")}${esc(c.name)}</a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="pfad-nav__item pfad-nav__item--mobil" href="${m.href}"${m.promo ? " data-promo" : ""}>${esc(m.label)}</a>`).join("\n      ")}
    </div>
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="pfad-fuss">
  <svg class="pfad-fuss__bau" viewBox="0 0 1200 70" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 70V34C80 22 150 40 240 30s160-20 260-8 170 22 280 10 180-18 270-10 110 14 150 10V70z" fill="currentColor"/><g fill="#0b0f2a" opacity=".55"><ellipse cx="180" cy="54" rx="34" ry="9"/><ellipse cx="520" cy="58" rx="42" ry="8"/><ellipse cx="880" cy="54" rx="30" ry="8"/><path d="M214 54c60 6 200 6 264 4M562 58c80-2 220-2 288-4" stroke="#0b0f2a" stroke-width="4" fill="none"/></g></svg>
  <div class="pfad-fuss__in">
    <section class="pfad-fuss__marke">
      <p class="pfad-fuss__wort">NEXVILO</p>
      <p class="pfad-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Bereiche">
      <p class="pfad-fuss__titel">Bereiche</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Das Haus">
      <p class="pfad-fuss__titel">Das Haus</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="pfad-fuss__hinweis">© ${new Date().getFullYear()} NEXVILO · ${esc(site.domain)} · Allgemeine Anleitungen zum digitalen Alltag, unabhängig von Herstellern und Händlern. Bei Betrug: Karte über den Sperr-Notruf 116 116 sperren, Anzeige bei der Polizei erstatten; Rat gibt es bei der Verbraucherzentrale.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A grain card: chamfered corners, a hexagon icon, a little trail that lights up. */
const karte = (ctx, a, extra = "") => `<article class="korn-karte ${extra}">
  <a class="korn-karte__link" href="${a.url}">
    <span class="korn-karte__bereich"><span class="korn-karte__wabe">${icon(a.cat.icon)}</span>${ctx.esc(a.cat.name)}</span>
    <h3 class="korn-karte__titel">${ctx.esc(a.title)}</h3>
    <p class="korn-karte__text">${ctx.esc(a.description)}</p>
    <span class="korn-karte__fuss">${a.minutes} Min. Lesezeit <span class="korn-karte__spur" aria-hidden="true"><i></i><i></i><i></i><b></b></span></span>
  </a>
</article>`;

/** Three lessons from Proverbs 6, told as habits for digital life. */
const LESSONS = [
  ["Im Sommer sammeln", "Die Ameise legt Vorräte an, bevor der Winter kommt. Digital heißt das: Fotos sichern, Passwörter ordnen und Notfallcodes ausdrucken, solange alles funktioniert, nicht erst, wenn das Handy weg ist."],
  ["Die eigenen Wege kennen", "Ameisen finden ihren Weg, weil sie ihn kennen. Wer weiß, wie echte Nachrichten der Bank, des Paketdienstes oder der Familie aussehen, erkennt eine Fälschung, bevor er klickt."],
  ["Ohne Fürsten", "Die Ameise braucht niemanden, der sie antreibt. Du brauchst für die meisten Probleme keinen Techniker: Mit einer klaren Anleitung richtest du Geräte selbst ein und behältst die Kontrolle."],
];

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="pfad-held">
  <div class="pfad-held__in">
    <div class="pfad-held__text">
      <p class="pfad-held__dach">Der Ratgeber für Handy, PC und Zuhause</p>
      <h1 class="pfad-held__titel">Digitaler Alltag, <em>Schritt für Schritt</em> verstanden</h1>
      <p class="pfad-held__lead">${esc(site.tagline)}.</p>
      <p class="pfad-held__intro">${esc(site.description)}</p>
      <p class="pfad-held__knoepfe">${first ? `<a class="pfad-knopf" href="${first.url}">Erste Anleitung lesen</a>` : ""}<a class="pfad-knopf pfad-knopf--hohl" href="/ueber-uns/">Wer wir sind</a></p>
    </div>
    <figure class="pfad-held__bild">${terrace()}</figure>
  </div>
</section>

<section class="pfad-lehre" aria-labelledby="le-t">
  <header class="pfad-ueber"><p class="pfad-ueber__dach">Sprüche 6,6</p><h2 id="le-t">Was wir von der Ameise lernen</h2></header>
  <ol class="pfad-lehre__reihe">
    ${LESSONS.map(([t, x], i) => `<li class="pfad-lehre__schritt"><span class="pfad-lehre__nr" aria-hidden="true">${i + 1}</span><h3>${t}</h3><p>${x}</p></li>`).join("\n    ")}
  </ol>
</section>

${first ? `<section class="pfad-auswahl" aria-label="Empfohlen">
  ${karte(ctx, first, "korn-karte--gross")}
  ${[second, third].filter(Boolean).map((a) => karte(ctx, a)).join("")}
</section>` : `<p class="pfad-bald">Die ersten Anleitungen entstehen gerade, jede von Hand geschrieben und geprüft. Schau bald wieder vorbei.</p>`}

<section class="pfad-bau" aria-labelledby="ba-t">
  <header class="pfad-ueber"><p class="pfad-ueber__dach">Sechs Kammern</p><h2 id="ba-t">Wobei können wir dir helfen?</h2></header>
  <ul class="pfad-bau__kammern">
    ${categories.map((c, i) => `<li><a class="pfad-kammer" href="${c.url}">
      <span class="pfad-kammer__wabe">${icon(c.icon)}</span>
      <span class="pfad-kammer__nr">Kammer ${i + 1}</span>
      <span class="pfad-kammer__name">${esc(c.name)}</span>
      <span class="pfad-kammer__text">${esc(c.description)}</span>
      <span class="pfad-kammer__zahl">${c.articles.length} Anleitungen</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${rest.length ? `<section class="pfad-neu" aria-labelledby="neu-t">
  <header class="pfad-ueber"><p class="pfad-ueber__dach">Frisch eingetragen</p><h2 id="neu-t">Neueste Anleitungen</h2></header>
  <div class="pfad-neu__raster">${rest.slice(0, 12).map((a) => karte(ctx, a)).join("\n    ")}</div>
</section>` : ""}

<section class="pfad-archiv" aria-labelledby="ar-t">
  <header class="pfad-ueber pfad-ueber--nacht"><p class="pfad-ueber__dach">Der ganze Vorrat</p><h2 id="ar-t">Alle Anleitungen nach Bereich</h2></header>
  <div class="pfad-archiv__gaenge">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon)}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `NEXVILO – ${site.tagline}`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="pfad-bereichkopf">
  <nav class="pfad-krumen" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
  <span class="pfad-bereichkopf__wabe">${icon(c.icon)}</span>
  <h1>${esc(c.name)}</h1>
  <p>${esc(c.description)}</p>
  <p class="pfad-bereichkopf__zahl">${c.articles.length} Anleitungen in diesem Bereich</p>
</header>
<section class="pfad-neu pfad-neu--bereich"><div class="pfad-neu__raster">
  ${c.articles.map((a) => karte(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Anleitungen und Ratgeber`,
      description: `${c.description} ${c.articles.length} Anleitungen von ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "bereich"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<div class="pfad-spur" aria-hidden="true"><span><svg viewBox="-18 -9 36 18" width="30" height="15" focusable="false" fill="#e9814f" stroke="#e9814f" stroke-width="1.4" stroke-linecap="round">${ant("#f2b134")}</svg></span></div>
<article class="pfad-beitrag">
  <header class="pfad-beitrag__kopf">
    <nav class="pfad-krumen" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <p class="pfad-beitrag__bereich">${icon(a.cat.icon)}${esc(a.cat.name)}</p>
    <h1 class="pfad-beitrag__titel">${esc(a.title)}</h1>
    <p class="pfad-beitrag__lead">${esc(a.description)}</p>
    <p class="pfad-beitrag__meta">Von der ${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} Min. Lesezeit</p>
  </header>
  <div class="pfad-beitrag__koerper">
    ${toc.length > 2 ? `<nav class="pfad-inhalt" aria-label="In dieser Anleitung"><p class="pfad-inhalt__titel">Der Weg durch diese Anleitung</p><ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol></nav>` : ""}
    <div class="pfad-text">
${a.html}
      <aside class="pfad-hinweis"><p><strong>Gut zu wissen.</strong> NEXVILO erklärt allgemein, wie Geräte, Dienste und Einstellungen funktionieren. Menüs und Bezeichnungen ändern sich mit jedem Update und unterscheiden sich je nach Hersteller, deshalb kann es bei dir etwas anders aussehen. Sichere wichtige Daten, bevor du etwas zurücksetzt oder löschst. Wurdest du betrogen, lass Karten und Konten über den Sperr-Notruf 116 116 oder direkt bei deiner Bank sperren, erstatte Anzeige bei der Polizei und hol dir Rat bei der Verbraucherzentrale.</p></aside>
    </div>
  </div>
</article>
<section class="pfad-neu pfad-neu--weiter" aria-labelledby="mehr-t">
  <header class="pfad-ueber"><p class="pfad-ueber__dach">Der Weg geht weiter</p><h2 id="mehr-t">Das könnte dir auch helfen</h2></header>
  <div class="pfad-neu__raster">${a.related.map((r) => karte(ctx, r)).join("")}</div>
</section>`;
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
        },
      ],
    },
    body,
    "beitrag"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="pfad-beitrag pfad-beitrag--seite">
  <header class="pfad-beitrag__kopf">
    <nav class="pfad-krumen" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="pfad-beitrag__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="pfad-beitrag__meta">Zuletzt geprüft am ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="pfad-beitrag__koerper pfad-beitrag__koerper--eins"><div class="pfad-text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="pfad-verirrt">
  <p class="pfad-verirrt__code">404</p>
  <h1>Hier endet der Ameisenweg</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht führt dich einer unserer Bereiche ans Ziel:</p>
  <ul class="pfad-bau__kammern">${ctx.categories.map((c) => `<li><a class="pfad-kammer" href="${c.url}"><span class="pfad-kammer__wabe">${icon(c.icon)}</span><span class="pfad-kammer__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es auf NEXVILO nicht.", path: "/404.html", noindex: true }, body, "verirrt");
}
