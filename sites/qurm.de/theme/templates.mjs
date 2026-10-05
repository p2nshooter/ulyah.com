// QURM — "Der Turm auf dem Libanon".
//
// "Deine Nase ist wie der Turm auf dem Libanon, der nach Damaskus schaut"
// (Hohelied 7:5). Solomon's watchtower stands on a granite crag above
// mountains covered in cedars, and it is dawn: the sky turns from slate blue
// to apricot, mist drifts between the ridges, a light still burns in the
// tower window. From the top of a watchtower you see every path at once,
// which is what a hiking guide should give you.
//
// The site is built from that picture. Menu items are wooden trail
// signposts: on hover they tilt a little on their nails and an elevation
// profile draws itself beneath them. Topic tiles are trail boards, article
// cards are stage boards with their own route profile, the article sidebar
// is the summit log ("Gipfelbuch"), and the reading progress is an elevation
// profile under the header that fills up to the summit as you read.
// Spanien 2026: a rojigualda summit flag waves on the little tower in the
// banner, and once per visit red and yellow pennants flutter down.
//
// No people or animals are drawn: only stone, cedars, mountains, light,
// signposts and flags. Every class here (warte-, pfosten, wegtafel, etappe,
// gipfelbuch) is QURM's own and appears in no other site of the network.

// ── Small helpers ──────────────────────────────────────────────────────────

/** A stable number from a string, so a page always gets the same profile. */
const hash = (s) => {
  let h = 2166136261;
  for (const ch of String(s)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** Points of an elevation profile: up from the valley, a summit, a bit down. */
function punkte(seed, w, h, n = 9) {
  let x = hash(seed) || 1;
  const rnd = () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296);
  const gipfel = 0.45 + rnd() * 0.35; // where the summit lies, 0…1
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const naehe = 1 - Math.min(1, Math.abs(t - gipfel) / Math.max(gipfel, 1 - gipfel));
    const hoehe = 0.12 + naehe * 0.7 + (rnd() - 0.5) * 0.22;
    pts.push([+(t * w).toFixed(1), +(h - Math.max(0.06, Math.min(0.94, hoehe)) * h).toFixed(1)]);
  }
  return pts;
}

/** A smooth line through the points (quadratic curves via midpoints). */
function linie(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${x} ${y} ${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}
const flaeche = (pts, w, h) => `${linie(pts)} L${w} ${h} L0 ${h} Z`;
const gipfelpunkt = (pts) => pts.reduce((a, b) => (b[1] < a[1] ? b : a));

// ── Icons (48 × 48, drawn in currentColor) ─────────────────────────────────
const ICONS = {
  wegweiser: `<path d="M24 5v38" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M9 10h21l6 5.5-6 5.5H9z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M39 24H18l-6 5.5 6 5.5h21z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 43h16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`,
  gipfel: `<path d="M3 41 18 17l6 9 7-13 14 28z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 23l4 2 3-2M27 20l4 2 3-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/><path d="M31 13V4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M31 4h9l-2.5 3 2.5 3h-9" fill="currentColor"/>`,
  rucksack: `<rect x="11" y="12" width="26" height="31" rx="8" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M18 12V9a6 6 0 0 1 12 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M11 23c4 3 22 3 26 0" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="17" y="29" width="14" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 23v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  wetter: `<path d="M13 31h21a8 8 0 0 0 1-16 11 11 0 0 0-21 2.5A6.8 6.8 0 0 0 13 31z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M25 31l-5 7.5h6L22 46" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 35l-1.5 4M15 35l-1.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  kompass: `<circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 10l5 14H19z" fill="currentColor"/><path d="M24 38l5-14H19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M24 3v3M24 42v3M3 24h3M42 24h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  spuren: `<path d="M15 6c5 0 7.5 4.5 7.5 9.5S20 23 20 26c0 4.5-1.2 8-5 8s-5.2-4-5.2-8.4c0-3 .2-5.6-.8-9.6C7.8 11 10 6 15 6z" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M11 36.5h8" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M34 19c3.4 0 5 3 5 6.4s-1.6 5-1.6 7c0 3-.8 5.3-3.4 5.3s-3.4-2.6-3.4-5.6c0-2 .1-3.7-.5-6.4-.7-3.2.8-6.7 3.9-6.7z" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M31.5 40.5h5.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>`,
  turm: `<path d="M16 43V16h16v27" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 16V9h4v3h4V9h6v3h4V9h4v7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M21 43v-7a3 3 0 0 1 6 0v7M22 26v-3a2 2 0 0 1 4 0v3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 43h28" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.turm}</svg>`;

/** The mark: a stone tower in front of the rising sun, cedars at its foot. */
const marke = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <defs><linearGradient id="qmMarkeHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a7896"/><stop offset=".62" stop-color="#f2a65a"/><stop offset="1" stop-color="#fbd7ae"/></linearGradient></defs>
  <circle cx="32" cy="32" r="30" fill="url(#qmMarkeHimmel)" stroke="#f8f9f7" stroke-width="2.5"/>
  <circle cx="22" cy="40" r="9" fill="#fff1dc" opacity=".9"/>
  <path d="M3 44c8-6 15-8 22-5s14 2 20-3 12-5 16-2v4a30 30 0 0 1-58 6z" fill="#1f4d3a"/>
  <path d="M33 50V22h12v28z" fill="#3d4a52"/>
  <path d="M31 22v-6h3v3h3v-3h4v3h3v-3h3v6z" fill="#3d4a52"/>
  <path d="M38 32a1.8 1.8 0 0 1 3.6 0v4H38z" fill="#f2a65a" class="warte-marke__licht"/>
  <path d="M39.5 16V7" stroke="#f8f9f7" stroke-width="1.4"/>
  <path d="M39.5 7h7l-2 2.2 2 2.2h-7z" fill="#f2a65a"/>
</svg>`;

/** Spanien, Weltmeister 2026: a summit flag in rojigualda on a little tower,
 * with a garland of red and yellow pennants along the banner. */
const wm = () => `<aside class="warte-wm" role="note" aria-label="Spanien ist Fußball-Weltmeister 2026">
  <span class="warte-wm__kette" aria-hidden="true"></span>
  <p class="warte-wm__text">
    <svg class="warte-wm__turm" viewBox="0 0 46 40" width="46" height="40" aria-hidden="true" focusable="false">
      <defs><linearGradient id="qmRojigualda" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c60b1e"/><stop offset=".25" stop-color="#c60b1e"/><stop offset=".25" stop-color="#ffc400"/><stop offset=".75" stop-color="#ffc400"/><stop offset=".75" stop-color="#c60b1e"/><stop offset="1" stop-color="#c60b1e"/></linearGradient></defs>
      <path d="M2 40c6-5 12-7 18-6s12 1 24-4v10z" fill="#1f4d3a"/>
      <path d="M9 38V20h12v18z" fill="#8a979e"/>
      <path d="M7 20v-5h3v2.4h3V15h4v2.4h3V15h3v5z" fill="#8a979e"/>
      <path d="M13.5 28a1.5 1.5 0 0 1 3 0v4h-3z" fill="#f2a65a"/>
      <path d="M15 15V2" stroke="#f8f9f7" stroke-width="1.3"/>
      <path class="warte-wm__fahne" d="M15 3C20 1 25 5 33 3v10c-8 2-13-2-18 0z" fill="url(#qmRojigualda)">
        <animate attributeName="d" dur="1.8s" repeatCount="indefinite" values="M15 3C20 1 25 5 33 3v10c-8 2-13-2-18 0z;M15 3C20 5 26 1 33 4v10c-7-3-13 1-18-1z;M15 3C20 1 25 5 33 3v10c-8 2-13-2-18 0z"/>
      </path>
    </svg>
    <span><strong>Spanien</strong> ist Fußball-Weltmeister 2026</span>
  </p>
</aside>`;

/** A wooden trail signpost for the menu, with its own elevation profile. */
const pfosten = (href, label, extra = "") => {
  const p = punkte(`pf-${label}`, 120, 16, 7);
  return `<a class="pfosten${extra}" href="${href}"><span class="pfosten__brett">${label}</span><svg class="pfosten__profil" viewBox="0 0 120 16" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${linie(p)}" pathLength="100"/></svg></a>`;
};

/** Reading progress: the route profile of this article under the header. */
const hoehenprofil = (seed) => {
  const p = punkte(`hp-${seed}`, 1000, 22, 15);
  const area = flaeche(p, 1000, 22);
  return `<div class="warte-hoehe" aria-hidden="true">
    <svg class="warte-hoehe__grund" viewBox="0 0 1000 22" preserveAspectRatio="none" focusable="false"><path d="${area}"/></svg>
    <svg class="warte-hoehe__weg" viewBox="0 0 1000 22" preserveAspectRatio="none" focusable="false"><path class="warte-hoehe__flaeche" d="${area}"/><path class="warte-hoehe__linie" d="${linie(p)}" vector-effect="non-scaling-stroke"/></svg>
    <span class="warte-hoehe__fahne"></span>
  </div>`;
};

function layout(ctx, meta, body, kind = "", seed = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="warte warte--${kind}">
<a class="warte-sprung" href="#inhalt">Zum Inhalt springen</a>
${wm()}
<header class="warte-kopf">
  <div class="warte-kopf__innen">
    <a class="warte-marke" href="/" aria-label="${esc(site.name)}, zur Startseite">
      ${marke("warte-marke__bild")}
      <span class="warte-marke__texte"><span class="warte-marke__name">QURM</span><span class="warte-marke__motto">${esc(site.expansion)}</span></span>
    </a>
    <button class="warte-knopf" type="button" aria-expanded="false" aria-controls="warte-wege warte-dienst"><span class="warte-knopf__striche" aria-hidden="true"><i></i><i></i><i></i></span>Wege</button>
  </div>
  <nav id="warte-wege" class="warte-wege" aria-label="Themen">
    ${pfosten("/", "Start")}
    ${categories.map((c) => pfosten(c.url, esc(c.name))).join("\n    ")}
  </nav>
  <nav id="warte-dienst" class="warte-dienst" aria-label="Service">
    ${site.menu.map((m) => pfosten(m.href, esc(m.label), " pfosten--klein")).join("\n    ")}
  </nav>
  ${kind === "ratgeber" ? hoehenprofil(seed) : ""}
</header>
<main id="inhalt">
${body}
</main>
<footer class="warte-fuss">
  <svg class="warte-fuss__grat" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M0 70V46l90-18 70 12 110-30 80 22 70-10 120 20 90-26 60 8 100-20 90 30 110-14 80 16 120-24 100 20 70-6 80 14v36z" fill="#1d262b"/>
    <path d="M0 70V58l140-12 120 10 160-16 150 14 130-8 160 12 140-14 150 10 130-6 160 10v12z" fill="#151c20"/>
  </svg>
  <div class="warte-fuss__innen">
    <section>
      <p class="warte-fuss__name">${marke("warte-fuss__marke")}QURM</p>
      <p class="warte-fuss__motto">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen im Fußbereich">
      <p class="warte-fuss__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Über QURM und Rechtliches">
      <p class="warte-fuss__titel">QURM</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="warte-fuss__hinweis">© ${new Date().getFullYear()} QURM · ${esc(site.domain)} · Allgemeine Informationen rund ums Wandern in Deutschland. Wege, Sperrungen und Bedingungen ändern sich: Prüf vor jeder Tour Wetterbericht und aktuelle Hinweise der Gebiete. Im Notfall wählst du überall in Deutschland die <strong>112</strong>. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A stage board: the article card, with its own small route profile. */
const etappe = (ctx, a) => {
  const p = punkte(a.slug, 96, 26, 8);
  const [gx, gy] = gipfelpunkt(p);
  return `<article class="etappe">
  <a class="etappe__link" href="${a.url}">
    <span class="etappe__kopf"><span class="etappe__icon">${icon(a.cat.icon)}</span><span class="etappe__thema">${ctx.esc(a.cat.name)}</span></span>
    <h3 class="etappe__titel">${ctx.esc(a.title)}</h3>
    <p class="etappe__text">${ctx.esc(a.description)}</p>
    <span class="etappe__fuss"><span class="etappe__zeit">${a.minutes} Min. Lesezeit</span><svg class="etappe__profil" viewBox="0 0 96 26" aria-hidden="true" focusable="false"><path class="etappe__flaeche" d="${flaeche(p, 96, 26)}"/><path class="etappe__linie" d="${linie(p)}"/><circle cx="${gx}" cy="${gy}" r="2.6"/></svg></span>
  </a>
</article>`;
};

/** A Lebanon cedar: a short trunk and broad, flat tiers of branches. */
function zeder(x, y, s, farbe = "#1f4d3a", licht = "#2d6a51") {
  const tiers = [
    [0, 26, 5.2],
    [-9, 21, 4.6],
    [-17, 15, 4],
    [-24, 9, 3.4],
  ];
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-1.6 0h3.2l-.6-26h-2z" fill="#2b2420"/>${tiers
    .map(([dy, rx, ry], i) => `<ellipse cx="${(i % 2 ? 2 : -2)}" cy="${dy - 4}" rx="${rx}" ry="${ry}" fill="${farbe}"/><ellipse cx="${(i % 2 ? 0 : -4)}" cy="${dy - 5.4}" rx="${rx * 0.72}" ry="${ry * 0.45}" fill="${licht}" opacity=".7"/>`)
    .join("")}</g>`;
}

/** The hero: the watchtower on its crag above cedar mountains at dawn. */
const turmbild = () => `<svg class="warte-bild" viewBox="0 0 480 400" role="img" aria-label="Ein steinerner Wachturm auf einem Felsen über zedernbewaldeten Bergen im Morgenrot" focusable="false">
  <defs>
    <linearGradient id="qmHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34506a"/><stop offset=".34" stop-color="#5a7896"/><stop offset=".6" stop-color="#c8a294"/><stop offset=".78" stop-color="#f2a65a"/><stop offset="1" stop-color="#fbd9b0"/></linearGradient>
    <radialGradient id="qmSonne" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffaf0"/><stop offset=".45" stop-color="#ffd9a3"/><stop offset="1" stop-color="#f2a65a" stop-opacity="0"/></radialGradient>
    <linearGradient id="qmFern" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ea4b7"/><stop offset="1" stop-color="#b6c3cf"/></linearGradient>
    <linearGradient id="qmMitte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a7896"/><stop offset="1" stop-color="#6f8ba3"/></linearGradient>
    <linearGradient id="qmWald" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#245a44"/><stop offset="1" stop-color="#163a2b"/></linearGradient>
    <linearGradient id="qmFels" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#55636b"/><stop offset="1" stop-color="#2b353b"/></linearGradient>
    <linearGradient id="qmStein" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a8a7c"/><stop offset=".22" stop-color="#6f7b82"/><stop offset="1" stop-color="#3d4a52"/></linearGradient>
    <radialGradient id="qmFensterGlut" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe2b5"/><stop offset="1" stop-color="#f2a65a" stop-opacity="0"/></radialGradient>
    <clipPath id="qmRahmen"><rect width="480" height="400" rx="28"/></clipPath>
  </defs>
  <g clip-path="url(#qmRahmen)">
    <rect width="480" height="400" fill="url(#qmHimmel)"/>
    <g class="warte-bild__sterne" fill="#f8f9f7"><circle cx="38" cy="36" r="1.5"/><circle cx="92" cy="64" r="1.1"/><circle cx="160" cy="26" r="1.4"/><circle cx="226" cy="52" r="1"/><circle cx="300" cy="30" r="1.3"/><circle cx="410" cy="48" r="1.2"/><circle cx="452" cy="22" r="1"/></g>
    <g class="warte-bild__sonne">
      <circle class="warte-bild__glut" cx="170" cy="236" r="120" fill="url(#qmSonne)"/>
      <circle cx="170" cy="236" r="34" fill="#fff3e2"/>
    </g>
    <path d="M0 242 42 214l26 12 42-46 30 24 32-36 34 38 36-20 40-42 34 44 34-20 42 30 40-34 48 30v200H0z" fill="url(#qmFern)" opacity=".92"/>
    <path d="M110 180l-10 13 6-1 6 5 5-6 4 2zM280 146l-11 15 7-2 5 6 6-7 6 3zM172 168l-8 11 6-1 4 4 4-5 4 1z" fill="#f8f9f7" opacity=".9"/>
    <path class="warte-bild__nebel warte-bild__nebel--1" d="M-40 252c40-10 90-6 140-2s110 8 170 0 140-8 250 2v18c-110-6-180 4-250 6s-120-6-170-6-100 2-140 8z" fill="#f8f9f7" opacity=".42"/>
    <path d="M0 292 52 256l36 14 52-34 50 30 38-22 42 18 48-36 42 30 52-18 68 22v140H0z" fill="url(#qmMitte)"/>
    ${[[18, 284, 0.62], [64, 268, 0.55], [128, 262, 0.6], [176, 274, 0.5], [236, 266, 0.56], [300, 258, 0.52], [430, 266, 0.58]].map(([x, y, s]) => zeder(x, y, s, "#3f6f73", "#5b8a87")).join("")}
    <path class="warte-bild__nebel warte-bild__nebel--2" d="M-30 300c60-12 120-8 180-2s130 6 200-2 120-4 160 2v16c-50-6-100-4-160 2s-140 8-200 2-110-8-180-2z" fill="#f8f9f7" opacity=".36"/>
    <path d="M0 326c40-18 84-24 130-14s84 6 120-6 80-10 120 4 70 14 110 10v80H0z" fill="url(#qmWald)"/>
    ${[[24, 334, 1.05], [70, 318, 1.2], [116, 322, 0.95], [168, 314, 1.1], [214, 320, 0.9], [264, 314, 1]].map(([x, y, s]) => zeder(x, y, s)).join("")}
    <path d="M262 400l14-62 28-14 26-22 50-6 30 14 30 18 40 8v64z" fill="url(#qmFels)"/>
    <path d="M300 330l24-20 18 2-26 22zM382 314l26 10-8 6-22-8z" fill="#f8f9f7" opacity=".08"/>
    <g class="warte-bild__turm">
      <path d="M338 302l4-128h40l4 128z" fill="url(#qmStein)"/>
      <path d="M342 174h40l1 14h-42z" fill="#2f3a40" opacity=".35"/>
      <path d="M330 176v-16h64v16z" fill="#56636b"/>
      <path d="M330 160v-13h11v6h7v-6h12v6h7v-6h12v6h7v-6h8v13z" fill="#4b585f"/>
      <path d="M330 147h11v3h-11zM348 147h12v3h-12zM367 147h12v3h-12zM386 147h8v3h-8z" fill="#f2a65a" opacity=".55"/>
      <g stroke="#2b353b" stroke-width="1" opacity=".45" fill="none"><path d="M341 196h43M340 218h45M340 240h46M339 262h47M339 284h48"/><path d="M356 174v22M372 196v22M352 218v22M370 240v22M358 262v22M376 284v18M364 174v0"/></g>
      <circle cx="362" cy="214" r="22" fill="url(#qmFensterGlut)" class="warte-bild__schein"/>
      <path d="M355 224v-13a7 7 0 0 1 14 0v13z" fill="#f2a65a" class="warte-bild__fenster"/>
      <path d="M362 204v20M355 216h14" stroke="#3d4a52" stroke-width="1.4"/>
      <path d="M353 302v-18a9 9 0 0 1 18 0v18z" fill="#1d262b"/>
      <path d="M340 178l2 124h-4z" fill="#f2a65a" opacity=".35"/>
      <path d="M362 147v-38" stroke="#f8f9f7" stroke-width="1.6"/>
      <path d="M362 110c7-3 12 2 22-1l-3 7 3 7c-10 3-15-2-22 1z" fill="#f2a65a">
        <animate attributeName="d" dur="2.6s" repeatCount="indefinite" values="M362 110c7-3 12 2 22-1l-3 7 3 7c-10 3-15-2-22 1z;M362 110c7 2 13-3 22 1l-3 7 3 6c-9-3-15 3-22-1z;M362 110c7-3 12 2 22-1l-3 7 3 7c-10 3-15-2-22 1z"/>
      </path>
    </g>
    <path class="warte-bild__pfad" d="M40 400c30-20 70-26 110-30s70-18 96-28 50-10 70-18 30-14 46-20" fill="none" stroke="#f2a65a" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"/>
    <g transform="translate(250 352)"><path d="M0 0v-26" stroke="#7a5a3c" stroke-width="3"/><path d="M-2 -24h18l5 4-5 4H-2z" fill="#a8774a"/><path d="M2 -12h-16l-4 3.5 4 3.5H2z" fill="#93683f"/></g>
  </g>
  <rect x="1" y="1" width="478" height="398" rx="27" fill="none" stroke="#f8f9f7" stroke-opacity=".35" stroke-width="2"/>
</svg>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const body = `
<section class="warte-start">
  <div class="warte-start__innen">
    <div class="warte-start__text">
      <p class="warte-dachzeile">Wandern in Deutschland</p>
      <h1 class="warte-start__titel">Jeder gute Weg beginnt im <em>Morgenlicht</em></h1>
      <p class="warte-start__claim">${esc(site.tagline)}</p>
      <p class="warte-start__intro">Vom Rennsteig bis zur Zugspitze, vom ersten Wanderschuh bis zur Nacht auf der Hütte: Wir erklären, wie Wege verlaufen, was du mitnimmst und wann du besser umkehrst.</p>
      <p class="warte-start__knoepfe"><a class="warte-taste" href="${categories[0].url}">Fernwege entdecken</a><a class="warte-taste warte-taste--rahmen" href="/sicher-unterwegs/">Sicher unterwegs</a></p>
    </div>
    <div class="warte-start__bild">${turmbild()}</div>
  </div>
</section>

<section class="warte-tafeln" aria-labelledby="tf-t">
  <header class="warte-ueber"><p class="warte-ueber__zeile">Vom Turm aus gesehen</p><h2 id="tf-t">Sechs Wege, ein Ziel: sicher ankommen</h2></header>
  <ol class="warte-tafeln__liste">
    ${categories
      .map((c, i) => {
        const p = punkte(`tf-${c.slug}`, 200, 30, 9);
        return `<li><a class="wegtafel" href="${c.url}">
      <span class="wegtafel__brett">Weg ${i + 1}</span>
      ${icon(c.icon, "wegtafel__icon")}
      <span class="wegtafel__name">${esc(c.name)}</span>
      <span class="wegtafel__text">${esc(c.description)}</span>
      <span class="wegtafel__zahl">${c.articles.length} Ratgeber</span>
      <svg class="wegtafel__profil" viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${linie(p)}" pathLength="100"/></svg>
    </a></li>`;
      })
      .join("\n    ")}
  </ol>
</section>

<section class="warte-raster" aria-labelledby="neu-t">
  <header class="warte-ueber"><p class="warte-ueber__zeile">Frisch ins Gipfelbuch geschrieben</p><h2 id="neu-t">Neue Ratgeber</h2></header>
  <div class="warte-raster__karten">
    ${articles.slice(0, 9).map((a) => etappe(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="warte-notruf" aria-labelledby="nr-t">
  <div class="warte-notruf__innen">
    <p class="warte-notruf__zahl" aria-hidden="true">112</p>
    <div>
      <h2 id="nr-t">Wenn etwas passiert: 112</h2>
      <p>Die 112 erreichst du in ganz Deutschland und in der EU, kostenlos und auch ohne Guthaben. Über sie kommt im Gebirge auch die Bergwacht. Was du am Telefon sagst, was ins Notfallset gehört und wie du Wetter und Gelände richtig einschätzt, steht auf unserer Seite <a href="/sicher-unterwegs/">Sicher unterwegs</a>.</p>
    </div>
  </div>
</section>

<section class="warte-netz" aria-labelledby="vz-t">
  <header class="warte-ueber warte-ueber--nacht"><p class="warte-ueber__zeile">Das ganze Wegenetz</p><h2 id="vz-t">Alle Ratgeber auf einen Blick</h2></header>
  <div class="warte-netz__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "warte-netz__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `QURM: ${site.expansion}. Der Wanderratgeber für Deutschland`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site, categories } = ctx;
  const nr = categories.findIndex((x) => x.slug === c.slug) + 1;
  const body = `
<header class="warte-thema">
  <div class="warte-thema__innen">
    <nav class="warte-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="warte-thema__icon">${icon(c.icon)}<span class="warte-thema__nr">Weg ${nr} von ${categories.length}</span></span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="warte-thema__zahl">${c.articles.length} Ratgeber</p>
  </div>
</header>
<section class="warte-raster warte-raster--thema" aria-label="Ratgeber in ${esc(c.name)}"><div class="warte-raster__karten">
  ${c.articles.map((a) => etappe(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Wanderratgeber`,
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
<article class="warte-text">
  <header class="warte-text__kopf">
    <nav class="warte-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="warte-text__titel">${esc(a.title)}</h1>
    <p class="warte-text__intro">${esc(a.description)}</p>
  </header>
  <div class="warte-text__koerper">
    <aside class="gipfelbuch" aria-label="Angaben zum Ratgeber">
      <p class="gipfelbuch__titel">${icon("turm", "gipfelbuch__icon")}Gipfelbuch</p>
      <dl>
        <div><dt>Thema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Min.</dd></div>
        <div><dt>Stand</dt><dd><time datetime="${a.updated}">${a.updatedLabel}</time></dd></div>
        <div><dt>Von</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="gipfelbuch__titel gipfelbuch__titel--b">Wegpunkte</p><ol class="gipfelbuch__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
    </aside>
    <div class="warte-text__inhalt">
${a.html}
      <aside class="warte-hinweis"><p><strong>Bevor du losgehst:</strong> Wege werden umgelegt, gesperrt oder nach Unwettern beschädigt, und das Wetter in den Bergen ändert sich schnell. Prüf vor jeder Tour den aktuellen Wetterbericht und die Hinweise des Gebiets, etwa von Nationalpark, Wanderverein oder Tourist-Information, und kehr lieber einmal zu früh um. Im Notfall wählst du die <strong>112</strong>. Mehr dazu auf der Seite <a href="/sicher-unterwegs/">Sicher unterwegs</a>.</p></aside>
    </div>
  </div>
</article>
<section class="warte-raster warte-raster--weiter" aria-labelledby="wt-t">
  <header class="warte-ueber"><p class="warte-ueber__zeile">Weitergehen</p><h2 id="wt-t">Passende Ratgeber</h2></header>
  <div class="warte-raster__karten">${a.related.map((r) => etappe(ctx, r)).join("")}</div>
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
    "ratgeber",
    a.slug
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="warte-text warte-text--seite">
  <header class="warte-text__kopf">
    <nav class="warte-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="warte-text__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="warte-text__intro">Stand: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="warte-text__koerper warte-text__koerper--eins"><div class="warte-text__inhalt">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="warte-leer">
  <p class="warte-leer__code">404</p>
  <h1>Hier endet der Weg</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. Von hier aus geht es weiter:</p>
  <ol class="warte-tafeln__liste warte-tafeln__liste--flach">${ctx.categories.map((c, i) => `<li><a class="wegtafel" href="${c.url}"><span class="wegtafel__brett">Weg ${i + 1}</span>${icon(c.icon, "wegtafel__icon")}<span class="wegtafel__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ol>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei QURM nicht.", path: "/404.html", noindex: true }, body, "leer");
}
