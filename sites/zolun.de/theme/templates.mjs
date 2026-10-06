// ZOLUN — "Die Schiffe von Tarschisch".
//
// "Denn der König hatte Tarschisch-Schiffe auf dem Meer … Einmal in drei Jahren
// kamen die Tarschisch-Schiffe und brachten Gold, Silber und Elfenbein"
// (1 Kön 10,22). In this palace the fleet comes home to the German coast:
// deep sea, sand, a coral sunset and polished brass. Only things made by
// hands are drawn — hulls, square sails, rigging, compass roses, portholes,
// sea charts and routes. The cargo list also names apes and peacocks; they
// are deliberately left out (no living beings anywhere).
//
// Menu: every item carries its own small compass needle that swings onto the
// course and a dotted route that draws itself to the word; the large compass
// rose in the brand turns its needle towards the item you point at.
// Every class (tar-, kurs, segel, bullauge) is ZOLUN's own.

const ICONS = {
  leuchtturm: `<path d="M19 43l3.4-27h5.2L31 43z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M20.6 30h8.8M21.6 22.5h6.8" stroke="currentColor" stroke-width="2.6"/><path d="M20 16h10M22 16v-5h6v5M25 11V7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M33 10.5l9-3.5M33 13.5h10M33 16.5l9 3.5M17 10.5 8 7M17 13.5H7M17 16.5 8 20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".65"/><path d="M8 43h34" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  insel: `<path d="M6 33c6-9 12-13 18-13 7 0 13 5 18 13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M15 26c3 2 6 2 9 0M26 23c3 2 6 2 8 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".6"/><path d="M30 20V6" stroke="currentColor" stroke-width="2"/><path d="M30 6.5l9 3.2-9 3.2z" fill="currentColor"/><path d="M4 38c4-3 7-3 11 0s7 3 11 0 7-3 11 0 6 3 8 1.5M8 44c3-2 6-2 9 0s6 2 9 0 6-2 9 0" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>`,
  welle: `<path d="M12 27h24l-3.5 6.5h-17z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 27V8" stroke="currentColor" stroke-width="2"/><path d="M24 9c5 3 8 9 8 15h-8z" fill="currentColor" opacity=".85"/><path d="M23 11c-4 3-6 8-6 13h6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 38c4-3 7-3 11 0s7 3 11 0 7-3 11 0 6 3 7 1.6M10 44c3-2 6-2 9 0s6 2 9 0 6-2 9 0" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>`,
  tor: `<path d="M6 43V17l5-7 5 7v26M32 43V17l5-7 5 7v26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 43V24h16v19" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M19.5 43V35a4.5 4.5 0 0 1 9 0v8" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16 24v-3.5h3V24M22.5 24v-3.5h3V24M29 24v-3.5h3V24" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 22v4M37 22v4M11 31v4M37 31v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M3 43h42" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  fahrkarte: `<path d="M6 13h36v7a4 4 0 0 0 0 8v7H6v-7a4 4 0 0 0 0-8z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M31 15v3M31 22v4M31 30v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 20h14M11 25h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".75"/><path d="M11 30.5c3-2 6-2 9 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".6"/><circle cx="37" cy="24" r="1.6" fill="currentColor"/>`,
  koffer: `<rect x="7" y="15" width="34" height="25" rx="4" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M18 15v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M15 15v25M33 15v25" stroke="currentColor" stroke-width="2" opacity=".75"/><path d="M24 22l1.8 3.6 4 .6-2.9 2.8.7 4L24 31.1 20.4 33l.7-4-2.9-2.8 4-.6z" fill="currentColor"/><path d="M12 40v3M36 40v3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  anker: `<circle cx="24" cy="9" r="3.6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M24 12.6V41M16 19h16" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M8 29c1 7 8 12 16 12s15-5 16-12" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M5 31l3-3.5 3 3.5M37 31l3-3.5 3 3.5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.anker}</svg>`;

/** Ticks around a compass dial, every 360/n degrees. */
const ticks = (n, cx, cy, r1, r2, every = 0, r3 = r2) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n;
    const long = every && i % every === 0;
    const ri = long ? r3 : r2;
    const f = (v) => v.toFixed(2);
    return `<line x1="${f(cx + Math.sin(a) * r1)}" y1="${f(cy - Math.cos(a) * r1)}" x2="${f(cx + Math.sin(a) * ri)}" y2="${f(cy - Math.cos(a) * ri)}"/>`;
  }).join("");

/** An eight-pointed rose: long cardinal points, short diagonals, each split
 * into a light and a dark half like a polished brass star. */
const rose = (cx, cy, long, short, w, light, dark) => {
  const point = (len, half, rot) =>
    `<g transform="rotate(${rot} ${cx} ${cy})"><path d="M${cx} ${cy - len}L${cx - half} ${cy - half}L${cx} ${cy}z" fill="${light}"/><path d="M${cx} ${cy - len}L${cx + half} ${cy - half}L${cx} ${cy}z" fill="${dark}"/></g>`;
  return [45, 135, 225, 315].map((r) => point(short, w * 0.8, r)).join("") + [0, 90, 180, 270].map((r) => point(long, w, r)).join("");
};

/** The brand: a brass compass rose on deep sea; its needle follows the menu. */
const kompassrose = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle cx="32" cy="32" r="31" fill="#b88a3e"/>
  <circle cx="32" cy="32" r="29.4" fill="none" stroke="#f0d79a" stroke-width="1.2"/>
  <circle cx="32" cy="32" r="26.5" fill="#0a2233"/>
  <g stroke="#e2c27a" stroke-width=".9" stroke-linecap="round" opacity=".8">${ticks(32, 32, 32, 26, 24.2, 4, 22.6)}</g>
  ${rose(32, 32, 20, 11, 3.4, "#f0d79a", "#b88a3e")}
  <g class="tar-marke__nadel"><path d="M32 9.5l2.6 22.5h-5.2z" fill="#e8735a"/><path d="M32 54.5l2.6-22.5h-5.2z" fill="#f3e6cc"/></g>
  <circle cx="32" cy="32" r="3" fill="#0a2233" stroke="#f0d79a" stroke-width="1.6"/>
</svg>`;

/** A small swinging needle for each menu item. */
const nadel = `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".55"/><g class="kurs__zeiger"><path d="M10 2.6l1.9 7.4H8.1z" fill="#e8735a"/><path d="M10 17.4l1.9-7.4H8.1z" fill="currentColor"/></g><circle cx="10" cy="10" r="1.3" fill="currentColor"/></svg>`;

/** A ship for the voyage-progress line of an article. */
const schiffchen = `<svg viewBox="0 0 40 30" aria-hidden="true" focusable="false"><path d="M20 3v20" stroke="#0a2233" stroke-width="1.6"/><path d="M11 5.5h18l-2 13H13z" fill="#f3e6cc" stroke="#b88a3e" stroke-width="1.2"/><path d="M16 5.5v13M24 5.5v13" stroke="#e8735a" stroke-width="2"/><path d="M20 2.5l7 2.4-7 1.6z" fill="#e8735a"/><path d="M3 22h34c-2 4-6 6-15 6S5 26 3 22z" fill="#5a3b28"/><path d="M3 22h34" stroke="#e2c27a" stroke-width="1.2"/></svg>`;

/** Spanien, Fußball-Weltmeister 2026 — dressed overall like a ship in
 * harbour: a line of red-yellow-red signal pennants flutters above, a brass
 * trophy catches the light, a ball rolls along its rope and back. */
const flaggengala = () => `<aside class="tar-wm" role="note" aria-label="Spanien ist Fußball-Weltmeister 2026">
  <div class="tar-wm__leine" aria-hidden="true">${Array.from({ length: 30 }, (_, i) => `<i style="--w:${i}"></i>`).join("")}</div>
  <div class="tar-wm__innen">
    <svg class="tar-wm__pokal" viewBox="0 0 40 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="zlPokal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a87422"/><stop offset=".45" stop-color="#ffe08a"/><stop offset=".7" stop-color="#e9b543"/><stop offset="1" stop-color="#9c6a1d"/></linearGradient>
        <clipPath id="zlPokalForm"><path d="M9 4h22v8c0 8-4 14-11 15C13 26 9 20 9 12zM17 27h6v7h-6zM12 34h16l2 6H10zM8 40h24v5H8z"/></clipPath>
      </defs>
      <path d="M9 7H4c0 7 3 11 7 12M31 7h5c0 7-3 11-7 12" fill="none" stroke="#e9b543" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M9 4h22v8c0 8-4 14-11 15C13 26 9 20 9 12zM17 27h6v7h-6zM12 34h16l2 6H10z" fill="url(#zlPokal)"/>
      <path d="M8 40h24v5H8z" fill="#5a3b28"/>
      <path d="M8 42h24" stroke="#c60b1e" stroke-width="1.6"/><path d="M8 43.6h24" stroke="#ffc400" stroke-width="1"/>
      <g clip-path="url(#zlPokalForm)"><g transform="rotate(18 20 24)"><rect class="tar-wm__glanz" x="-14" y="-4" width="7" height="56" fill="#fffbe8" opacity=".85"/></g></g>
      <path d="M20 9.5l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" fill="#fff6d6" opacity=".9"/>
    </svg>
    <span class="tar-wm__band" aria-hidden="true"></span>
    <p class="tar-wm__text"><strong>Spanien</strong> ist Fußball-Weltmeister 2026</p>
    <span class="tar-wm__bahn" aria-hidden="true"><span class="tar-wm__ball"><svg viewBox="0 0 20 20" focusable="false"><circle cx="10" cy="10" r="9" fill="#fffdf6" stroke="#0a2233" stroke-width="1.2"/><path d="M10 6.2l3.4 2.5-1.3 4h-4.2l-1.3-4z" fill="#0a2233"/><path d="M10 6.2V1.6M13.4 8.7l4.3-1.3M12.1 12.7l2.6 3.7M7.9 12.7l-2.6 3.7M6.6 8.7 2.3 7.4" stroke="#0a2233" stroke-width="1"/></svg></span></span>
  </div>
</aside>`;

function layout(ctx, meta, body, kind = "", aktiv = meta.path) {
  const { site, categories, esc } = ctx;
  const kurs = (href, label, extra = "") =>
    `<a class="kurs${extra}" href="${href}"${aktiv === href ? ` aria-current="page"` : ""}><span class="kurs__nadel">${nadel}</span><span class="kurs__wort">${esc(label)}</span><span class="kurs__route" aria-hidden="true"></span></a>`;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
<noscript><style>.tar-steuer{display:block!important}.tar-ruder{display:none!important}</style></noscript>
</head>
<body class="tar tar--${kind}">
<a class="tar-sprung" href="#inhalt">Zum Inhalt springen</a>
<div class="tar-oben">
${flaggengala()}
<header class="tar-deck">
  <div class="tar-deck__innen">
    <a class="tar-marke" href="/" aria-label="${esc(site.name)}, Startseite">
      ${kompassrose("tar-marke__rose")}
      <span class="tar-marke__texte"><span class="tar-marke__name">ZOLUN</span><span class="tar-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <button class="tar-ruder" type="button" aria-expanded="false" aria-controls="tar-steuer"><svg class="tar-ruder__rad" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 1.5v21M1.5 12h21M4.6 4.6l14.8 14.8M19.4 4.6 4.6 19.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span class="tar-ruder__wort">Menü</span></button>
    <div id="tar-steuer" class="tar-steuer">
      <nav class="tar-kurse" aria-label="Themen">
        ${kurs("/", "Start")}
        ${categories.map((c) => kurs(c.url, c.name)).join("\n        ")}
      </nav>
      <nav class="tar-zusatz" aria-label="Über ZOLUN">
        ${site.menu.map((m) => kurs(m.href, m.label, " kurs--leise")).join("\n        ")}
      </nav>
    </div>
  </div>
</header>
</div>
<main id="inhalt">
${body}
</main>
<footer class="tar-kiel">
  <svg class="tar-kiel__wellen" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 34c80-18 160-18 240 0s160 18 240 0 160-18 240 0 160 18 240 0 160-18 240 0 160 18 240 0v26H0z" fill="#0f3047"/><path d="M0 44c80-14 160-14 240 0s160 14 240 0 160-14 240 0 160 14 240 0 160-14 240 0 160 14 240 0v16H0z" fill="#0a2233"/></svg>
  <div class="tar-kiel__innen">
    <section class="tar-kiel__marke">
      ${kompassrose("tar-kiel__rose")}
      <p class="tar-kiel__name">ZOLUN</p>
      <p class="tar-kiel__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen im Fußbereich">
      <p class="tar-kiel__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="ZOLUN und Rechtliches">
      <p class="tar-kiel__titel">ZOLUN</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="tar-kiel__hinweis">© ${new Date().getFullYear()} ZOLUN · ${esc(site.domain)} · Allgemeine Reiseinformationen ohne Gewähr. Preise, Fahrpläne, Tarife, Fährzeiten und Öffnungszeiten ändern sich: Prüfe vor der Reise die Angaben der Verkehrsunternehmen, Gemeinden und Gastgeber. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a> und im <a href="/reisecheck/">Reisecheck</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A guide card: a sand-coloured sail with brass rivets. */
const segel = (ctx, a, h = "h3") => `<article class="segel">
  <a class="segel__link" href="${a.url}">
    <span class="segel__kopf"><span class="segel__bullauge">${icon(a.cat.icon)}</span><span class="segel__thema">${ctx.esc(a.cat.name)}</span></span>
    <${h} class="segel__titel">${ctx.esc(a.title)}</${h}>
    <p class="segel__text">${ctx.esc(a.description)}</p>
    <span class="segel__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="segel__kurs">Kurs setzen <span aria-hidden="true">→</span></span></span>
  </a>
</article>`;

const PEILUNG = ["N · 000°", "NO · 045°", "O · 090°", "SO · 135°", "S · 180°", "SW · 225°", "W · 270°", "NW · 315°"];

/** A swell that tiles seamlessly: crest and trough every `half` units, long
 * enough to slide one full period to the left and start again unseen. */
const duenung = (y, half, amp) => {
  const n = Math.ceil((480 + 2 * half) / half) + 1;
  const k = (v) => +v.toFixed(1);
  let d = `M0 ${y}c${k(half / 3)} ${-amp} ${k((2 * half) / 3)} ${-amp} ${half} 0`;
  for (let i = 1; i < n; i++) d += `s${k((2 * half) / 3)} ${i % 2 ? amp : -amp} ${half} 0`;
  return { line: d, area: `${d}V500H0z` };
};

/** The hero: a brass porthole. Through the glass a Tarshish ship with a
 * striped square sail rides the evening swell under a coral sky; rhumb
 * lines of an old sea chart fan out behind it. */
const bullauge = () => {
  const c = 240;
  const hinten = duenung(318, 120, 8);
  const vorn = duenung(352, 100, 10);
  const ganzvorn = duenung(404, 144, 12);
  const bolts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI * 2) / 10 + Math.PI / 10;
    return `<g transform="translate(${(c + Math.sin(a) * 217).toFixed(1)} ${(c - Math.cos(a) * 217).toFixed(1)})"><circle r="8.5" fill="url(#zlBolzen)"/><path d="M-4.5 0h9" stroke="#6d4c1f" stroke-width="1.6"/></g>`;
  }).join("");
  const rhumbs = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI * 2) / 16;
    return `<line x1="118" y1="150" x2="${(118 + Math.sin(a) * 420).toFixed(1)}" y2="${(150 - Math.cos(a) * 420).toFixed(1)}"/>`;
  }).join("");
  return `<svg class="bullauge" viewBox="0 0 480 480" role="img" aria-label="Ein Segelschiff mit gestreiftem Rahsegel fährt bei Sonnenuntergang über das Meer, gesehen durch ein Bullauge aus Messing" focusable="false">
  <defs>
    <linearGradient id="zlHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2233"/><stop offset=".38" stop-color="#22506a"/><stop offset=".62" stop-color="#c77b6a"/><stop offset=".74" stop-color="#f09a6b"/><stop offset=".8" stop-color="#f6c98a"/></linearGradient>
    <linearGradient id="zlMeer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6176"/><stop offset=".5" stop-color="#143b52"/><stop offset="1" stop-color="#0a2233"/></linearGradient>
    <radialGradient id="zlSonne" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2cf"/><stop offset=".45" stop-color="#ffd38a"/><stop offset="1" stop-color="#f08a5d" stop-opacity="0"/></radialGradient>
    <linearGradient id="zlRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc9b"/><stop offset=".35" stop-color="#b88a3e"/><stop offset=".6" stop-color="#e9c97f"/><stop offset="1" stop-color="#7a5622"/></linearGradient>
    <radialGradient id="zlBolzen" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff0c2"/><stop offset=".5" stop-color="#c99a4a"/><stop offset="1" stop-color="#6d4c1f"/></radialGradient>
    <linearGradient id="zlSegel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf3e2"/><stop offset="1" stop-color="#e5cfa6"/></linearGradient>
    <linearGradient id="zlGlas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="zlFenster"><circle cx="${c}" cy="${c}" r="196"/></clipPath>
    <mask id="zlRouteMaske"><path class="bullauge__routezug" d="M70 128C140 96 220 104 262 150S350 214 410 196" fill="none" stroke="#fff" stroke-width="10"/></mask>
  </defs>
  <path d="M440 214h24a8 8 0 0 1 8 8v36a8 8 0 0 1-8 8h-24z" fill="url(#zlRing)" stroke="#6d4c1f" stroke-width="1.5"/>
  <circle cx="${c}" cy="${c}" r="232" fill="url(#zlRing)"/>
  <circle cx="${c}" cy="${c}" r="232" fill="none" stroke="#5a3d17" stroke-width="2" opacity=".6"/>
  <circle cx="${c}" cy="${c}" r="204" fill="#5a3d17"/>
  ${bolts}
  <g clip-path="url(#zlFenster)">
    <rect x="0" y="0" width="480" height="300" fill="url(#zlHimmel)"/>
    <g stroke="#f0d79a" stroke-width=".8" opacity=".28">${rhumbs}</g>
    <g opacity=".55">${rose(118, 150, 26, 14, 4, "#f0d79a", "#b88a3e")}</g>
    <circle cx="118" cy="150" r="30" fill="none" stroke="#f0d79a" stroke-width="1" opacity=".5"/>
    <g fill="#fdf3dd" opacity=".75"><circle cx="300" cy="70" r="1.4"/><circle cx="360" cy="104" r="1.1"/><circle cx="210" cy="60" r="1.2"/><circle cx="398" cy="140" r="1"/></g>
    <path d="M70 128C140 96 220 104 262 150S350 214 410 196" fill="none" stroke="#f6c98a" stroke-width="2.4" stroke-linecap="round" stroke-dasharray=".1 8" mask="url(#zlRouteMaske)"/>
    <g fill="#f6c98a"><circle cx="70" cy="128" r="3.4"/><path d="M410 189.5l6.5 6.5-6.5 6.5-6.5-6.5z"/></g>
    <circle class="bullauge__sonne" cx="330" cy="298" r="92" fill="url(#zlSonne)"/>
    <circle cx="330" cy="298" r="34" fill="#ffe2a6"/>
    <rect x="0" y="298" width="480" height="190" fill="url(#zlMeer)"/>
    <g class="bullauge__glitzern" fill="#ffd9a0"><rect x="300" y="306" width="60" height="2.4" rx="1.2" opacity=".85"/><rect x="290" y="316" width="80" height="2.2" rx="1.1" opacity=".7"/><rect x="306" y="328" width="52" height="2" rx="1" opacity=".55"/><rect x="284" y="342" width="90" height="2" rx="1" opacity=".4"/><rect x="312" y="358" width="44" height="1.8" rx=".9" opacity=".3"/></g>
    <g class="bullauge__see bullauge__see--hinten"><path d="${hinten.area}" fill="#1d4a61" opacity=".75"/></g>
    <g class="bullauge__schiff">
      <g transform="translate(176 330)">
        <path d="M0-24V-196" stroke="#4a3322" stroke-width="5" stroke-linecap="round"/>
        <path d="M0-196L118-40M0-196L-122-58M0-180L-70-34M0-180L70-30" stroke="#3a2a22" stroke-width="1.4" opacity=".85"/>
        <path d="M-80-178Q0-192 80-178" fill="none" stroke="#4a3322" stroke-width="5" stroke-linecap="round"/>
        <path d="M-76-176Q0-188 76-176L70-66Q0-50-70-66Z" fill="url(#zlSegel)" stroke="#b88a3e" stroke-width="1.4"/>
        <path d="M-50-180L-46-61M-18-185L-17-55M18-185L17-55M50-180L46-61" stroke="#e8735a" stroke-width="9" opacity=".9"/>
        <path d="M-70-150Q0-140 72-150M-70-120Q0-110 71-120M-70-92Q0-82 70-92" fill="none" stroke="#b88a3e" stroke-width=".9" opacity=".7"/>
        <path d="M-72-66Q0-52 72-66" fill="none" stroke="#4a3322" stroke-width="4" stroke-linecap="round"/>
        <path class="bullauge__wimpel" d="M0-198l26 6-26 6z" fill="#e8735a"/>
        <path d="M-118-30L108-30C116-32 124-42 128-60C131-50 126-30 114-16C84 6-74 6-110-12C-124-20-132-44-134-72C-126-60-122-42-118-30Z" fill="#5a3b28"/>
        <path d="M-118-30L108-30" stroke="#e2c27a" stroke-width="3"/>
        <path d="M-112-20L106-20" stroke="#3a2a22" stroke-width="1.6" opacity=".7"/>
        <g fill="#e2c27a">${[-90, -60, -30, 0, 30, 60, 88].map((x) => `<circle cx="${x}" cy="-25" r="3.2"/>`).join("")}</g>
        <path d="M-134-72c-6-6-12-6-14 0s4 10 10 6" fill="none" stroke="#5a3b28" stroke-width="5" stroke-linecap="round"/>
      </g>
    </g>
    <g class="bullauge__see bullauge__see--vorn"><path d="${vorn.area}" fill="#123a50"/><path d="${vorn.line}" fill="none" stroke="#f3e6cc" stroke-width="1.6" opacity=".45"/></g>
    <g class="bullauge__see bullauge__see--ganzvorn"><path d="${ganzvorn.area}" fill="#0a2233"/></g>
    <g transform="rotate(24 240 240)"><rect class="bullauge__glanz" x="-200" y="-80" width="120" height="640" fill="url(#zlGlas)"/></g>
    <path d="M90 150a160 160 0 0 1 120-104" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".14"/>
  </g>
  <circle cx="${c}" cy="${c}" r="196" fill="none" stroke="#f6dc9b" stroke-width="2.5" opacity=".7"/>
</svg>`;
};

/** A row of arches, the colonnade of the harbour hall, between sections
 * (drawn in CSS so the arches keep their proportions at every width). */
const arkaden = (cls = "") => `<div class="tar-arkaden ${cls}" aria-hidden="true"></div>`;

const kopfzeile = (zeile, titel, id, extra = "") =>
  `<header class="tar-ueber${extra}"><p class="tar-ueber__zeile">${zeile}</p><h2 id="${id}">${titel}</h2><span class="tar-ueber__stern" aria-hidden="true"></span></header>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const latest = articles.slice(0, 9);
  const body = `
<section class="tar-hafen">
  <div class="tar-hafen__innen">
    <div class="tar-hafen__text">
      <p class="tar-dachzeile">Urlaub in Deutschland</p>
      <h1 class="tar-hafen__titel">Setz die Segel: Ferien <em>zwischen Ostsee, Land und Nordsee</em></h1>
      <p class="tar-hafen__claim">${esc(site.tagline)}</p>
      <p class="tar-hafen__intro">Ob Wattenmeer oder Bodden, Inselfähre oder Bergsee, Altstadtwochenende oder Sommerferien mit Kindern und Hund: Wir erklären, wie Reisen im eigenen Land funktioniert, worauf es bei Anreise und Unterkunft ankommt und wo du Fahrpläne, Tarife und Regeln verlässlich prüfst.</p>
      <p class="tar-hafen__knoepfe"><a class="tar-taste" href="${categories[0].url}">Zur Küste</a><a class="tar-taste tar-taste--rahmen" href="/reisecheck/">Reisecheck vor der Abfahrt</a></p>
    </div>
    <div class="tar-hafen__bild">${bullauge()}<p class="tar-hafen__plakette" aria-hidden="true">Tarschisch · 1 Kön 10,22</p></div>
  </div>
  ${arkaden("tar-arkaden--sand")}
</section>

<section class="tar-kurstafel" aria-labelledby="kt-t">
  ${kopfzeile("Sechs Kurse", "Wohin soll die Reise gehen?", "kt-t")}
  <ol class="tar-kompasse">
    ${categories
      .map(
        (c, i) => `<li style="--i:${i};--peil:${i * 45}deg"><a class="tar-hafenkarte" href="${c.url}">
      <span class="tar-hafenkarte__peilung">Kurs ${PEILUNG[i % 8]}</span>
      <span class="tar-hafenkarte__dose" aria-hidden="true">${icon(c.icon, "tar-hafenkarte__icon")}<span class="tar-hafenkarte__zeiger"></span></span>
      <span class="tar-hafenkarte__name">${esc(c.name)}</span>
      <span class="tar-hafenkarte__text">${esc(c.description)}</span>
      <span class="tar-hafenkarte__zahl">${c.articles.length} Ratgeber</span>
    </a></li>`
      )
      .join("\n    ")}
  </ol>
</section>

<section class="tar-raster" aria-labelledby="neu-t">
  ${kopfzeile("Frisch im Logbuch", "Neue Reiseratgeber", "neu-t")}
  <div class="tar-raster__karten">
    ${latest.map((a) => segel(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="tar-anbord" aria-labelledby="ab-t">
  <div class="tar-anbord__innen">
    <div class="tar-anbord__text">
      <p class="tar-dachzeile tar-dachzeile--hell">An Bord von ZOLUN</p>
      <h2 id="ab-t">Ein Ratgeber, der lieber prüft als verspricht</h2>
      <p>Alle drei Jahre, so erzählt das Buch der Könige, kehrte die Flotte von Tarschisch mit kostbarer Fracht heim. Unsere Fracht ist bescheidener und alltagstauglicher: verlässliches Wissen für Urlaub im eigenen Land. Wir erklären Gezeiten und Fähren, Deutschlandticket und Kurtaxe, Ferienwohnung und Campingplatz so, dass du selbst gute Entscheidungen triffst.</p>
      <p>Was sich ständig ändert, also Preise, Fahrpläne und Öffnungszeiten, nennen wir nicht aus dem Gedächtnis. Wir sagen dir, wo du es offiziell nachliest.</p>
      <p class="tar-hafen__knoepfe"><a class="tar-taste tar-taste--messing" href="/ueber-uns/">Über uns</a><a class="tar-taste tar-taste--hell" href="/redaktionsgrundsaetze/">So arbeiten wir</a></p>
    </div>
    <ul class="tar-anbord__liste">
      <li><span class="tar-anbord__nr">I</span><span><strong>Ehrlich statt Katalog:</strong> keine erfundenen Preise, keine geschönten Strandfotos, keine Superlative.</span></li>
      <li><span class="tar-anbord__nr">II</span><span><strong>Gründlich:</strong> jeder Ratgeber erklärt Zusammenhänge, nicht nur eine Liste von Tipps.</span></li>
      <li><span class="tar-anbord__nr">III</span><span><strong>Mit Rücksicht:</strong> auf Kinder, Hunde, kleines Budget, Natur und Menschen, die vor Ort leben.</span></li>
    </ul>
  </div>
</section>

<section class="tar-seekarte" aria-labelledby="sk-t">
  ${kopfzeile("Die ganze Seekarte", "Alle Reiseratgeber", "sk-t")}
  <div class="tar-seekarte__spalten">
    ${categories
      .map(
        (c) =>
          `<section><h3><a href="${c.url}">${icon(c.icon, "tar-seekarte__icon")}${esc(c.name)}</a></h3>${
            c.articles.length
              ? `<ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol>`
              : `<p class="tar-seekarte__leer">Die ersten Ratgeber zu diesem Kurs sind in Arbeit.</p>`
          }</section>`
      )
      .join("\n    ")}
  </div>
</section>`;
  return layout(
    ctx,
    {
      title: `ZOLUN · ${site.expansion}: Urlaub in Deutschland`,
      description: site.description,
      path: "/",
      jsonld: [
        {
          "@type": "ItemList",
          name: "Themen von ZOLUN",
          itemListElement: categories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: `${ctx.base}${c.url}` })),
        },
      ],
    },
    body,
    "start"
  );
}

export function category(ctx, c) {
  const { esc, site, categories } = ctx;
  const nr = categories.findIndex((x) => x.slug === c.slug);
  const body = `
<header class="tar-thema">
  <div class="tar-thema__innen">
    <nav class="tar-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span aria-current="page">${esc(c.name)}</span></nav>
    <span class="tar-thema__dose">${icon(c.icon)}</span>
    <p class="tar-thema__peilung">Kurs ${PEILUNG[nr % 8]}</p>
    <h1>${esc(c.name)}</h1>
    <p class="tar-thema__text">${esc(c.description)}</p>
    <p class="tar-thema__zahl">${c.articles.length} Ratgeber</p>
  </div>
  ${arkaden("tar-arkaden--sand")}
</header>
<section class="tar-raster tar-raster--thema" aria-label="Ratgeber zum Thema ${esc(c.name)}">
  ${
    c.articles.length
      ? `<div class="tar-raster__karten">\n  ${c.articles.map((a) => segel(ctx, a, "h2")).join("\n  ")}\n</div>`
      : `<p class="tar-leerhinweis">Zu diesem Kurs schreiben wir gerade die ersten Ratgeber. Schau dich bis dahin in den anderen Themen um.</p>`
  }
</section>
<nav class="tar-andere" aria-labelledby="ak-t">
  ${kopfzeile("Weitere Kurse", "Andere Themen entdecken", "ak-t")}
  <ul>${categories
    .filter((x) => x !== c)
    .map((x) => `<li><a href="${x.url}">${icon(x.icon)}<span>${esc(x.name)}</span></a></li>`)
    .join("")}</ul>
</nav>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Urlaub in Deutschland planen`,
      description: `${c.description} Ratgeber von ${site.name}.`.slice(0, 200),
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
          mainEntity: { "@type": "ItemList", itemListElement: c.articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${ctx.base}${a.url}`, name: a.title })) },
        },
      ],
    },
    body,
    "thema"
  );
}

export function article(ctx, a) {
  const { esc, site, base, categories } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="tar-logbuch">
  <header class="tar-logbuch__kopf">
    <nav class="tar-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a> <span aria-hidden="true">›</span> <span aria-current="page">${esc(a.title)}</span></nav>
    <p class="tar-logbuch__thema"><a href="${a.cat.url}">${icon(a.cat.icon)}${esc(a.cat.name)}</a></p>
    <h1 class="tar-logbuch__titel">${esc(a.title)}</h1>
    <p class="tar-logbuch__intro">${esc(a.description)}</p>
    <p class="tar-logbuch__meta"><span>Stand: <time datetime="${a.updated}">${a.updatedLabel}</time></span><span>${a.minutes} Min. Lesezeit</span><span>Von der ${esc(site.author)}</span></p>
  </header>
  <div class="tar-logbuch__koerper">
    <aside class="tar-kursbuch" aria-label="Kursbuch zu diesem Ratgeber">
      <div class="tar-kursbuch__fahrt" aria-hidden="true"><span class="tar-kursbuch__linie"></span><span class="tar-kursbuch__schiff">${schiffchen}</span></div>
      ${
        toc.length > 1
          ? `<nav aria-labelledby="kb-t"><p class="tar-kursbuch__titel" id="kb-t">Inhalt</p><ol class="tar-kursbuch__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol></nav>`
          : ""
      }
      <dl class="tar-kursbuch__daten">
        <div><dt>Thema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Veröffentlicht</dt><dd><time datetime="${a.date}">${a.dateLabel}</time></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Minuten</dd></div>
      </dl>
    </aside>
    <div class="tar-logbuch__text">
${a.html}
      <aside class="tar-pruefen" aria-label="Vor der Reise prüfen"><p><strong>Vor der Abfahrt prüfen:</strong> Fahrpläne, Ticketregeln, Fährzeiten, Preise, Kurtaxe und Öffnungszeiten ändern sich, oft von Saison zu Saison. Verlass dich für deine Buchung auf die Angaben der Verkehrsunternehmen, der Gemeinde oder Tourist-Information und deines Gastgebers. Wo du was nachliest, steht im <a href="/reisecheck/">Reisecheck</a>.</p></aside>
    </div>
  </div>
</article>
<section class="tar-raster tar-raster--weiter" aria-labelledby="wt-t">
  ${kopfzeile("Weiter auf Kurs", "Passende Ratgeber", "wt-t")}
  <div class="tar-raster__karten">${a.related.map((r) => segel(ctx, r)).join("")}</div>
</section>
<nav class="tar-andere" aria-labelledby="ak-t">
  ${kopfzeile("Alle Kurse", "Themen von ZOLUN", "ak-t")}
  <ul>${categories.map((x) => `<li><a href="${x.url}"${x === a.cat ? ` aria-current="true"` : ""}>${icon(x.icon)}<span>${esc(x.name)}</span></a></li>`).join("")}</ul>
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
          image: `${base}/og.svg`,
          author: { "@type": "Organization", name: site.author, url: `${base}/ueber-uns/` },
          publisher: { "@id": `${base}/#org` },
          mainEntityOfPage: `${base}${a.url}`,
        },
      ],
    },
    body,
    "logbuch",
    a.cat.url
  );
}

export function page(ctx, p) {
  const { esc, base } = ctx;
  const typ = { "ueber-uns": "AboutPage", kontakt: "ContactPage" }[p.slug] || "WebPage";
  const body = `
<article class="tar-logbuch tar-logbuch--seite">
  <header class="tar-logbuch__kopf">
    <nav class="tar-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span aria-current="page">${esc(p.title)}</span></nav>
    <span class="tar-logbuch__siegel" aria-hidden="true">${icon("anker")}</span>
    <h1 class="tar-logbuch__titel">${esc(p.title)}</h1>
    ${p.description ? `<p class="tar-logbuch__intro">${esc(p.description)}</p>` : ""}
    ${p.updated ? `<p class="tar-logbuch__meta"><span>Stand: <time datetime="${p.updated}">${ctx.fmtDate(p.updated)}</time></span></p>` : ""}
  </header>
  <div class="tar-logbuch__koerper tar-logbuch__koerper--eins"><div class="tar-logbuch__text">
${p.html}
  </div></div>
</article>`;
  return layout(
    ctx,
    {
      title: p.title,
      description: p.description,
      path: p.url,
      jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }]), { "@type": typ, name: p.title, url: `${base}${p.url}`, inLanguage: ctx.site.lang }],
    },
    body,
    "seite"
  );
}

export function notFound(ctx) {
  const body = `
<section class="tar-verirrt">
  <p class="tar-verirrt__code" aria-hidden="true">404</p>
  ${kompassrose("tar-verirrt__rose")}
  <h1>Hier liegt kein Hafen</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link veraltet oder hatte einen Tippfehler. Nimm einfach einen neuen Kurs:</p>
  <ul class="tar-andere__liste">${ctx.categories.map((c) => `<li><a href="${c.url}">${icon(c.icon)}<span>${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
  <p><a class="tar-taste" href="/">Zurück zur Startseite</a></p>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei ZOLUN nicht. Hier geht es zurück zu allen Reisethemen.", path: "/404.html", noindex: true }, body, "verirrt");
}
