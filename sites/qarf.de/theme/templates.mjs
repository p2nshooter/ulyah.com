// QARF — "Die Gewürzkarawane der Königin von Saba".
//
// The queen of Sheba came to Solomon with a caravan, and she gave the king
// gold, precious stones and "spices in great abundance; never again came such
// an abundance of spices" (1 Kings 10:10). Sheba lay on the incense road
// between Yemen and Ethiopia, the very lands where coffee was first drunk.
// So QARF's palace is the night camp of that caravan in front of the palace
// gate: copper pots on the embers, open sacks of cardamom, saffron and coffee
// beans, blue-and-white porcelain, tea glasses and lantern light. No figures
// of people or animals — only sacks, pots, cups, dunes, domes, stars and
// light. Menu items are small tulip tea glasses: when you come near, warm
// amber tea rises in the glass and three thin curls of steam float up.
// Article cards are porcelain tiles, topics are spice sacks with a wax seal.
// Every class here starts with krw- (Karawane) and is QARF's own.

const ICONS = {
  bohne: `<ellipse cx="24" cy="24" rx="12" ry="17" transform="rotate(30 24 24)" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M31.5 10.5c-5 3.5-2 9-7.5 13.5s-3 9.5-8 13.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  kanne: `<path d="M17 40c-3.5-4-3.5-9.5.6-12.6L20 25h8l2.4 2.4c4.1 3.1 4.1 8.6.6 12.6z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M20.5 25l1-5h5l1 5M21.5 20 24 12l2.5 8" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><circle cx="24" cy="10.4" r="1.7" fill="currentColor"/><path d="M18.4 30.5c-5-1-8.4-5.4-11.4-10.5l-1-2 3.2 1.2c2.2 4 4.8 6.8 9 7.6" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M30 25.5c6.2.2 7 9.4 1 12" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M14 42h20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  muehle: `<path d="M15 22l3-6h12l3 6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><rect x="12.5" y="22" width="23" height="20" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M17 33h14v5H17z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="35.5" r="1.2" fill="currentColor"/><path d="M24 16V9h10" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="35.5" cy="9" r="2.6" fill="currentColor"/>`,
  blatt: `<path d="M24 43V20" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M24 33c-8.5 0-13.5-5-14.5-12.5 7.5 0 13.5 4.5 14.5 12.5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 27c7.5-1 12.5-6 12.5-13.5-7.5 1-12.5 5.5-12.5 13.5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 20c-2.4-3.2-2.4-7.4 0-10.6 2.4 3.2 2.4 7.4 0 10.6z" fill="currentColor"/>`,
  teekanne: `<path d="M10 33c0-8.6 6.2-13.6 14-13.6S38 24.4 38 33c0 3.6-2.2 6.4-5.4 6.4H15.4C12.2 39.4 10 36.6 10 33z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M17.5 19.6c.4-3.6 3.2-5.6 6.5-5.6s6.1 2 6.5 5.6" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="24" cy="11.6" r="2" fill="currentColor"/><path d="M37.4 28.5l7-6.5M10.2 25.6c-5.4-.4-6.4 8.4-.2 9" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M12 43h24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  laterne: `<path d="M24 3v5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M15 14.5c0-4 4-6.5 9-6.5s9 2.5 9 6.5z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M16 14.5h16l-2.2 21H18.2z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M15 35.5h18l-2 5H17z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M24 20.5c-3 3-3.2 7 0 9.5 3.2-2.5 3-6.5 0-9.5z" fill="currentColor"/>`,
  tasse: `<path d="M11 18h22v10a10 10 0 0 1-10 10h-2a10 10 0 0 1-10-10z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M33 21h3a4.5 4.5 0 0 1 0 9h-3" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M7 42h30" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M17 13c-2-2 2-3.5 0-6M23 13c-2-2 2-3.5 0-6M29 13c-2-2 2-3.5 0-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.tasse}</svg>`;

/** The site's mark: a porcelain medallion with a copper dallah under steam. */
const medaillon = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle cx="32" cy="32" r="30" fill="#fdf8f1"/>
  <circle cx="32" cy="32" r="27.5" fill="none" stroke="#283a5e" stroke-width="1.6" stroke-dasharray="2.2 2.6"/>
  <circle cx="32" cy="32" r="24" fill="#3b2416"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="#e1a13a" stroke-width="1.6"/>
  <g class="krw-marke__dampf" fill="none" stroke="#fdf8f1" stroke-width="1.4" stroke-linecap="round" opacity=".8">
    <path d="M27 15c-1.6-1.6 1.6-2.8 0-4.6"/><path d="M32 14c-1.6-1.6 1.6-2.8 0-4.6"/><path d="M37 15c-1.6-1.6 1.6-2.8 0-4.6"/>
  </g>
  <path d="M26 48c-3-3.4-3-8 .6-10.6l1.8-2h7.2l1.8 2c3.6 2.6 3.6 7.2.6 10.6z" fill="#e1a13a"/>
  <path d="M28.6 35.4l.9-4.4h5l.9 4.4zM29.8 31 32 23.6l2.2 7.4z" fill="#f3c873"/>
  <circle cx="32" cy="22.6" r="1.4" fill="#f3c873"/>
  <path d="M27.4 40.4c-4.4-.8-7.2-4.6-9.8-9l-.8-1.8 2.8 1c1.8 3.4 4 5.8 7.6 6.6z" fill="#e1a13a"/>
  <path d="M37.2 36c5 .2 5.6 7.6.8 9.6" fill="none" stroke="#e1a13a" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M23 49.4h18" stroke="#6b7d4a" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const pokal = `<svg class="krw-wm__pokal" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="#ffc400"/><path d="M7 5H4c0 3 1.4 4.6 3.4 5M17 5h3c0 3-1.4 4.6-3.4 5" fill="none" stroke="#ffc400" stroke-width="1.6"/><path d="M11 13h2v4h-2z" fill="#ffc400"/><path d="M8 21h8l-1-3H9z" fill="#c60b1e"/></svg>`;

/** Spanien, Weltmeister 2026 — red and yellow coffee beans travel along the
 * banner like a caravan along the horizon; two beans flank the words. */
const champions = () => `<aside class="krw-wm" role="note" aria-label="Spanien ist Fußball-Weltmeister 2026">
  <p class="krw-wm__text"><span class="krw-wm__bohne" aria-hidden="true"></span>${pokal} <strong>Spanien</strong> ist Fußball-Weltmeister 2026 <span class="krw-wm__bohne krw-wm__bohne--gelb" aria-hidden="true"></span></p>
  <span class="krw-wm__reihe" aria-hidden="true"></span>
</aside>`;

/** One tulip tea glass in the menu. */
const glas = (href, label, extra = "") => `<a class="krw-glas${extra}" href="${href}"><span class="krw-glas__gefaess" aria-hidden="true"><span class="krw-glas__dampf"><i></i><i></i><i></i></span><span class="krw-glas__innen"><span class="krw-glas__tee"></span></span><svg class="krw-glas__umriss" viewBox="0 0 16 24" focusable="false"><path d="M1.4 1.2h13.2l-2.5 8.4c1.6 1.9 2.2 4 2.2 6.3 0 2.5-1 4.4-2.7 5.2H4.4c-1.7-.8-2.7-2.7-2.7-5.2 0-2.3.6-4.4 2.2-6.3z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M.6 23h14.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span><span class="krw-glas__wort">${label}</span></a>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="krw krw--${kind}">
<a class="krw-sprung" href="#inhalt">Zum Inhalt springen</a>
${champions()}
<header class="krw-kopf">
  <div class="krw-kopf__innen">
    <a class="krw-marke" href="/" aria-label="${esc(site.name)} — Startseite">
      ${medaillon("krw-marke__bild")}
      <span class="krw-marke__texte"><span class="krw-marke__name">QARF</span><span class="krw-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <button class="krw-knopf" type="button" aria-expanded="false" aria-controls="krw-menue"><span class="krw-knopf__striche" aria-hidden="true"><i></i><i></i><i></i></span>Menü</button>
  </div>
  <nav id="krw-menue" class="krw-menue" aria-label="Hauptmenü">
    ${glas("/", "Start")}
    ${categories.map((c) => glas(c.url, esc(c.name))).join("\n    ")}
    ${site.menu.map((m) => glas(m.href, esc(m.label), " krw-glas--leise")).join("\n    ")}
  </nav>
  <div class="krw-borte" aria-hidden="true"></div>
  ${kind === "ratgeber" ? `<div class="krw-spur" aria-hidden="true"><i></i></div>` : ""}
</header>
<main id="inhalt">
${body}
</main>
<footer class="krw-fuss">
  <svg class="krw-fuss__duene" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 60V38c90-22 170-30 260-12s150 22 240 2 170-34 270-14 160 30 250 10 110-24 180-12v48z" fill="#3b2416"/><path d="M0 60V48c120-14 220-16 330-4s200 10 300-4 210-16 320 0 170 12 250 2v18z" fill="#1a2742"/></svg>
  <div class="krw-fuss__innen">
    <section>
      <p class="krw-fuss__name">QARF</p>
      <p class="krw-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen">
      <p class="krw-fuss__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Über QARF und Rechtliches">
      <p class="krw-fuss__titel">QARF</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="krw-fuss__hinweis">© ${new Date().getFullYear()} QARF · ${esc(site.domain)} · Allgemeine Informationen rund um Kaffee und Tee zu Hause. Angaben zu Koffein und Gesundheit ersetzen keine ärztliche Beratung. Vorsicht mit kochendem Wasser, heißem Dampf und Druckgeräten. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A porcelain tile with a cobalt frame: the guide card. */
const kachel = (ctx, a) => `<article class="krw-kachel">
  <a class="krw-kachel__link" href="${a.url}">
    <span class="krw-kachel__kopf"><span class="krw-kachel__icon">${icon(a.cat.icon)}</span><span class="krw-kachel__thema">${ctx.esc(a.cat.name)}</span></span>
    <h3 class="krw-kachel__titel">${ctx.esc(a.title)}</h3>
    <p class="krw-kachel__text">${ctx.esc(a.description)}</p>
    <span class="krw-kachel__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="krw-kachel__tasse" aria-hidden="true">${icon("tasse")}</span></span>
  </a>
</article>`;

/** The hero: the caravan's night camp before the palace. Steam rises from the
 * copper dallah and the tea glass, the lantern glows and the stars twinkle. */
const lagerbild = () => `<svg class="krw-bild" viewBox="0 0 440 330" role="img" aria-label="Nachtlager einer Gewürzkarawane: Kupferkanne, Porzellanschalen, Teeglas und Gewürzsäcke unter einer Laterne vor einem Palast" focusable="false">
  <defs>
    <linearGradient id="qfHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a2e"/><stop offset=".55" stop-color="#283a5e"/><stop offset=".82" stop-color="#7a5236"/><stop offset="1" stop-color="#c9843f"/></linearGradient>
    <linearGradient id="qfDuene1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e4a2e"/><stop offset="1" stop-color="#4a2f1d"/></linearGradient>
    <linearGradient id="qfDuene2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d3120"/><stop offset="1" stop-color="#2a190e"/></linearGradient>
    <linearGradient id="qfKupfer" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3d18"/><stop offset=".45" stop-color="#e8a35a"/><stop offset="1" stop-color="#8f4a1f"/></linearGradient>
    <linearGradient id="qfMessing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c873"/><stop offset="1" stop-color="#a8701f"/></linearGradient>
    <linearGradient id="qfTee" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2b24e"/><stop offset="1" stop-color="#a24f12"/></linearGradient>
    <radialGradient id="qfSchein" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset=".5" stop-color="#e1a13a" stop-opacity=".25"/><stop offset="1" stop-color="#e1a13a" stop-opacity="0"/></radialGradient>
    <pattern id="qfJute" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#c9a874"/><path d="M0 1.5h6M0 4.5h6" stroke="#a88552" stroke-width=".7"/><path d="M1.5 0v6M4.5 0v6" stroke="#b8955f" stroke-width=".6"/></pattern>
  </defs>
  <rect width="440" height="330" rx="26" fill="url(#qfHimmel)"/>
  <g class="krw-bild__sterne" fill="#fdf8f1"><circle cx="34" cy="34" r="1.5"/><circle cx="84" cy="62" r="1.1"/><circle cx="128" cy="24" r="1.7"/><circle cx="176" cy="54" r="1.1"/><circle cx="226" cy="22" r="1.4"/><circle cx="268" cy="66" r="1"/><circle cx="58" cy="104" r="1"/><circle cx="196" cy="96" r="1.2"/><circle cx="300" cy="30" r="1.2"/></g>
  <g class="krw-bild__sterne krw-bild__sterne--b" fill="#f3c873"><circle cx="104" cy="40" r="1.2"/><circle cx="246" cy="44" r="1.5"/><circle cx="150" cy="78" r="1"/></g>
  <g fill="#1d2a47" opacity=".95">
    <path d="M150 210v-42h10v-14a8 8 0 0 1 16 0v14h8v-10c0-18 14-30 36-34 22 4 36 16 36 34v10h8v-14a8 8 0 0 1 16 0v14h10v42z"/>
    <path d="M216 120c0-8 4-13 4-13s4 5 4 13z"/>
    <rect x="126" y="150" width="10" height="60"/><path d="M124 150l7-14 7 14z"/>
    <rect x="304" y="150" width="10" height="60"/><path d="M302 150l7-14 7 14z"/>
  </g>
  <g fill="#e1a13a" opacity=".55"><path d="M206 210v-22a14 14 0 0 1 28 0v22z"/><rect x="168" y="176" width="8" height="14" rx="4"/><rect x="264" y="176" width="8" height="14" rx="4"/></g>
  <path d="M0 236c60-26 120-34 190-22s120 16 170 0 70-12 80-10v126H0z" fill="url(#qfDuene1)"/>
  <path d="M0 268c80-18 150-20 230-8s150 10 210-6v76H0z" fill="url(#qfDuene2)"/>
  <g class="krw-bild__laterne">
    <path d="M378 0v44" stroke="#a8701f" stroke-width="1.6" stroke-dasharray="3 2"/>
    <circle class="krw-bild__schein" cx="378" cy="76" r="58" fill="url(#qfSchein)"/>
    <path d="M366 52c0-6 5-9 12-9s12 3 12 9z" fill="url(#qfMessing)"/>
    <path d="M367 52h22l-3 38h-16z" fill="#f7cf7e" opacity=".9"/>
    <path d="M367 52h22l-3 38h-16zM378 52v38M372.5 52l1.5 38M383.5 52l-1.5 38" fill="none" stroke="#7a4a14" stroke-width="1.3"/>
    <path class="krw-bild__flamme" d="M378 62c-4.5 4.5-5 10 0 14 5-4 4.5-9.5 0-14z" fill="#fff3c4"/>
    <path d="M366 90h24l-3 7h-18z" fill="url(#qfMessing)"/>
  </g>
  <g transform="translate(18 222)">
    <path d="M6 70c-6-20-2-42 8-52h44c10 10 14 32 8 52z" fill="url(#qfJute)"/>
    <path d="M10 20c8-6 44-6 52 0-8 5-44 5-52 0z" fill="#a88552"/>
    <path d="M14 19c6-10 38-10 44 0-6 4-38 4-44 0z" fill="#c43d14"/>
    <g stroke="#ff8a3d" stroke-width="1.4" stroke-linecap="round"><path d="M22 14l3 4M30 11l1 5M38 12l-2 5M46 14l-3 4"/></g>
    <path d="M14 30c14 4 30 4 44 0" fill="none" stroke="#8f4a1f" stroke-width="2.2"/>
    <path d="M70 70c-4-18-1-36 6-46h38c8 10 11 28 6 46z" fill="url(#qfJute)"/>
    <path d="M74 26c8-5 36-5 44 0-8 4-36 4-44 0z" fill="#a88552"/>
    <path d="M78 25c6-9 30-9 36 0-6 4-30 4-36 0z" fill="#6b7d4a"/>
    <g fill="#8fa067"><ellipse cx="88" cy="20" rx="2.6" ry="1.6"/><ellipse cx="96" cy="17" rx="2.6" ry="1.6"/><ellipse cx="104" cy="20" rx="2.6" ry="1.6"/><ellipse cx="96" cy="22" rx="2.6" ry="1.6"/></g>
    <path d="M78 36c12 3 24 3 36 0" fill="none" stroke="#8f4a1f" stroke-width="2"/>
  </g>
  <ellipse cx="270" cy="288" rx="128" ry="20" fill="#2a190e" opacity=".55"/>
  <ellipse cx="270" cy="282" rx="124" ry="20" fill="url(#qfMessing)"/>
  <ellipse cx="270" cy="280" rx="112" ry="15" fill="none" stroke="#7a4a14" stroke-width="1.2" stroke-dasharray="4 3" opacity=".7"/>
  <g class="krw-bild__dampf" fill="none" stroke="#fdf8f1" stroke-width="2" stroke-linecap="round" opacity=".85">
    <path d="M167 176c-5-5 5-9 0-15s5-9 0-14"/><path d="M178 168c-5-5 5-9 0-15s5-9 0-14"/><path d="M189 176c-5-5 5-9 0-15s5-9 0-14"/>
  </g>
  <g transform="translate(150 186)">
    <path d="M10 92c-9-10-9-24 2-32l6-6h22l6 6c11 8 11 22 2 32z" fill="url(#qfKupfer)"/>
    <path d="M18 54l3-14h16l3 14z" fill="url(#qfKupfer)"/>
    <path d="M21 40l8-24 8 24z" fill="url(#qfKupfer)"/>
    <circle cx="29" cy="14" r="3.4" fill="#f3c873"/>
    <path d="M12 70c-14-3-22-14-30-27l-3-5 8 3c6 10 13 17 25 20z" fill="url(#qfKupfer)"/>
    <path d="M46 56c16 1 18 24 2 30" fill="none" stroke="#8f4a1f" stroke-width="4" stroke-linecap="round"/>
    <path d="M8 72h42" stroke="#f3c873" stroke-width="1.6" opacity=".7"/>
  </g>
  <g transform="translate(232 252)">
    <path d="M0 0h26l-3 16a6 6 0 0 1-6 5h-8a6 6 0 0 1-6-5z" fill="#fdf8f1"/>
    <path d="M1 5h24" stroke="#283a5e" stroke-width="2.6"/><path d="M2.4 11h21" stroke="#283a5e" stroke-width="1" stroke-dasharray="2 2"/>
    <ellipse cx="13" cy="1" rx="13" ry="2.4" fill="#5a3a26"/>
  </g>
  <g transform="translate(268 256)">
    <path d="M0 0h22l-2.6 13a5 5 0 0 1-5 4h-6.8a5 5 0 0 1-5-4z" fill="#fdf8f1"/>
    <path d="M1 4.4h20" stroke="#283a5e" stroke-width="2.4"/><path d="M2.2 9.6h17.6" stroke="#283a5e" stroke-width="1" stroke-dasharray="2 2"/>
    <ellipse cx="11" cy="1" rx="11" ry="2.2" fill="#5a3a26"/>
  </g>
  <g class="krw-bild__dampf krw-bild__dampf--b" fill="none" stroke="#fdf8f1" stroke-width="1.6" stroke-linecap="round" opacity=".8">
    <path d="M318 224c-4-4 4-7 0-12s4-7 0-11"/><path d="M328 218c-4-4 4-7 0-12s4-7 0-11"/>
  </g>
  <g transform="translate(306 228)">
    <path d="M2 2h24l-4.6 14c3 3.4 4 7 4 11 0 4.4-2 8-5 9.6H7.6c-3-1.6-5-5.2-5-9.6 0-4 1-7.6 4-11z" fill="url(#qfTee)" opacity=".92"/>
    <path d="M1 1h26l-4.6 15c3 3.4 4 7 4 11 0 4.4-2 8-5 9.6H6.6c-3-1.6-5-5.2-5-9.6 0-4 1-7.6 4-11z" fill="none" stroke="#fdf8f1" stroke-width="1.6" stroke-linejoin="round" opacity=".9"/>
    <path d="M6 4h3l-3 10" stroke="#fff" stroke-width="1.4" opacity=".5"/>
    <ellipse cx="14" cy="40" rx="16" ry="3.4" fill="#fdf8f1"/><path d="M-1 40h30" stroke="#283a5e" stroke-width="1"/>
  </g>
  <g transform="translate(352 262)">
    <path d="M0 6c0-6 30-6 30 0l-3 9H3z" fill="#fdf8f1"/><path d="M1.5 9h27" stroke="#283a5e" stroke-width="1.6"/>
    <g fill="#6b7d4a"><ellipse cx="9" cy="3" rx="3.4" ry="2"/><ellipse cx="16" cy="1" rx="3.4" ry="2"/><ellipse cx="22" cy="3.4" rx="3.4" ry="2"/><ellipse cx="14" cy="4.4" rx="3.4" ry="2"/></g>
  </g>
  <g fill="#2a190e"><g transform="translate(118 300) rotate(-20)"><ellipse rx="6" ry="4"/></g><g transform="translate(406 300) rotate(30)"><ellipse rx="6" ry="4"/></g><g transform="translate(392 312) rotate(-40)"><ellipse rx="5.4" ry="3.6"/></g><g transform="translate(140 316) rotate(10)"><ellipse rx="5.4" ry="3.6"/></g></g>
  <g stroke="#7a5236" stroke-width="1" fill="none"><path d="M114 300c3-1 5 1 8 0M402 300c3-1 5 1 8 0M388 312c3-1 5 1 8 0M136 316c3-1 5 1 8 0"/></g>
</svg>`;

/** Four values from the brewing table, as a teaser on the home page. */
const SPICK = [
  { name: "Handfilter", wert: "60 g/l · 92–96 °C", zeit: "2½–3½ Min." },
  { name: "French Press", wert: "60–70 g/l · 93–96 °C", zeit: "4 Min." },
  { name: "Grüntee (Sencha)", wert: "10–12 g/l · 70–80 °C", zeit: "1–2 Min." },
  { name: "Schwarztee", wert: "12–15 g/l · 95–100 °C", zeit: "3–5 Min." },
];

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const body = `
<section class="krw-start">
  <div class="krw-start__innen">
    <div class="krw-start__text">
      <p class="krw-dachzeile">Kaffee &amp; Tee zu Hause</p>
      <h1 class="krw-start__titel">Was die Karawane mitbrachte, kommt <em>frisch aufgebrüht</em> in deine Tasse</h1>
      <p class="krw-start__claim">${esc(site.tagline)}</p>
      <p class="krw-start__intro">${esc(site.description)}</p>
      <p class="krw-start__knoepfe"><a class="krw-taste" href="/bruehtabelle/">Zur Brühtabelle</a><a class="krw-taste krw-taste--rahmen" href="${categories[1].url}">Kaffee zubereiten</a></p>
    </div>
    <div class="krw-start__bild">${lagerbild()}</div>
  </div>
</section>

<section class="krw-themen" aria-labelledby="th-t">
  <header class="krw-ueber"><p class="krw-ueber__zeile">Sechs Säcke voller Wissen</p><h2 id="th-t">Was die Karawane geladen hat</h2></header>
  <ol class="krw-saecke">
    ${categories.map((c, i) => `<li style="--i:${i}"><a class="krw-sack krw-sack--${c.icon}" href="${c.url}">
      <span class="krw-sack__inhalt" aria-hidden="true"></span>
      <span class="krw-sack__rand" aria-hidden="true"></span>
      <span class="krw-sack__siegel" aria-hidden="true">${i + 1}</span>
      ${icon(c.icon, "krw-sack__icon")}
      <span class="krw-sack__name">${esc(c.name)}</span>
      <span class="krw-sack__zahl">${c.articles.length} Ratgeber</span>
    </a></li>`).join("\n    ")}
  </ol>
</section>

<section class="krw-spick" aria-labelledby="sp-t">
  <div class="krw-spick__innen">
    <div class="krw-spick__kopf">
      <p class="krw-ueber__zeile">Für die Küchenwand</p>
      <h2 id="sp-t">Die Brühtabelle auf einen Blick</h2>
      <p>Verhältnis, Mahlgrad, Temperatur und Zeit für jede Methode, dazu Ziehzeiten für Grüntee, Oolong, Schwarztee und Kräuter.</p>
      <a class="krw-taste krw-taste--klein" href="/bruehtabelle/">Ganze Tabelle ansehen</a>
    </div>
    <ul class="krw-spick__liste">
      ${SPICK.map((s) => `<li><span class="krw-spick__name">${s.name}</span><span class="krw-spick__wert">${s.wert}</span><span class="krw-spick__zeit">${s.zeit}</span></li>`).join("\n      ")}
    </ul>
  </div>
</section>

<section class="krw-raster" aria-labelledby="neu-t">
  <header class="krw-ueber"><p class="krw-ueber__zeile">Frisch aufgegossen</p><h2 id="neu-t">Neue Ratgeber</h2></header>
  <div class="krw-raster__karten">
    ${articles.slice(0, 12).map((a) => kachel(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="krw-ladeliste" aria-labelledby="ll-t">
  <header class="krw-ueber krw-ueber--nacht"><p class="krw-ueber__zeile">Die ganze Ladung</p><h2 id="ll-t">Alle Ratgeber nach Themen</h2></header>
  <div class="krw-ladeliste__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "krw-ladeliste__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `QARF — ${site.expansion}: Kaffee und Tee zu Hause`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site, categories } = ctx;
  const nr = categories.findIndex((x) => x.slug === c.slug) + 1;
  const body = `
<header class="krw-thema">
  <div class="krw-thema__innen">
    <nav class="krw-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="krw-thema__icon">${icon(c.icon)}<span class="krw-thema__nr">Sack ${nr} von ${categories.length}</span></span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="krw-thema__zahl">${c.articles.length} Ratgeber</p>
  </div>
</header>
<section class="krw-raster krw-raster--thema" aria-label="Ratgeber zum Thema ${esc(c.name)}"><div class="krw-raster__karten">
  ${c.articles.map((a) => kachel(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Ratgeber für Kaffee und Tee`,
      description: `${c.description} ${c.articles.length} Ratgeber von ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "thema"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="krw-ratgeber">
  <header class="krw-ratgeber__kopf">
    <nav class="krw-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="krw-ratgeber__titel">${esc(a.title)}</h1>
    <p class="krw-ratgeber__intro">${esc(a.description)}</p>
  </header>
  <div class="krw-ratgeber__koerper">
    <aside class="krw-fracht" aria-label="Angaben zum Ratgeber">
      <p class="krw-fracht__titel">${icon("laterne", "krw-fracht__laterne")}Frachtbrief</p>
      <dl>
        <div><dt>Thema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Min.</dd></div>
        <div><dt>Stand</dt><dd><time datetime="${a.updated}">${a.updatedLabel}</time></dd></div>
        <div><dt>Von</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="krw-fracht__titel krw-fracht__titel--b">Inhalt</p><ol class="krw-fracht__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
      <a class="krw-fracht__tabelle" href="/bruehtabelle/">${icon("tasse")}Brühtabelle öffnen</a>
    </aside>
    <div class="krw-ratgeber__text">
${a.html}
      <aside class="krw-hinweis"><p><strong>Gut zu wissen:</strong> Dieser Ratgeber beschreibt allgemeine Erfahrungswerte zu Zubereitung und Genuss. Geschmack ist persönlich, und Geräte unterscheiden sich, deshalb sind alle Mengen und Zeiten Startpunkte zum Ausprobieren. Fragen zu Koffein, Unverträglichkeiten, Schwangerschaft oder Medikamenten klärst du am besten mit deiner Ärztin oder deinem Arzt. Bedienungsanleitungen und Sicherheitshinweise der Hersteller gehen immer vor.</p></aside>
    </div>
  </div>
</article>
<section class="krw-raster krw-raster--weiter" aria-labelledby="wt-t">
  <header class="krw-ueber"><p class="krw-ueber__zeile">Noch eine Tasse?</p><h2 id="wt-t">Passende Ratgeber</h2></header>
  <div class="krw-raster__karten">${a.related.map((r) => kachel(ctx, r)).join("")}</div>
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
    "ratgeber"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="krw-ratgeber krw-ratgeber--seite">
  <header class="krw-ratgeber__kopf">
    <nav class="krw-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="krw-ratgeber__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="krw-ratgeber__intro">Stand: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="krw-ratgeber__koerper krw-ratgeber__koerper--eins"><div class="krw-ratgeber__text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="krw-leer">
  <p class="krw-leer__code">404</p>
  <h1>Diese Karawane ist schon weitergezogen</h1>
  <p>Die Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. Hier findest du alle Themen von QARF:</p>
  <ol class="krw-saecke krw-saecke--flach">${ctx.categories.map((c, i) => `<li style="--i:${i}"><a class="krw-sack krw-sack--${c.icon}" href="${c.url}"><span class="krw-sack__inhalt" aria-hidden="true"></span><span class="krw-sack__rand" aria-hidden="true"></span><span class="krw-sack__siegel" aria-hidden="true">${i + 1}</span>${icon(c.icon, "krw-sack__icon")}<span class="krw-sack__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ol>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei QARF nicht.", path: "/404.html", noindex: true }, body, "leer");
}
