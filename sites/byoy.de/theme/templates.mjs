// BYOY — "Der Weinberg von Baal-Hamon".
//
// "Solomon had a vineyard at Baal-Hamon; he let out the vineyard to keepers"
// (Song of Songs 8:11). This palace is not a hall but a hillside: terraced
// garden slopes held by walls of pale limestone, rows of vines on wooden
// stakes, red soil between them, straw-gold light, and on the crest a round
// watchtower from which the keepers watched over the harvest. The kitchen
// garden lies on the lowest terrace, where the soil is deepest.
//
// Translated into the site:
//   · header      — vine-green slope crowned by a limestone coping
//   · menu        — every item is a vine row ("Rebzeile"): on hover a tendril
//                   curls out underneath (SVG stroke-dasharray draw) and a small
//                   leaf unfurls at its tip
//   · topic tiles — six vineyard plots ("Lagen"); their grape clusters ripen
//                   from green to purple when you come near
//   · cards       — harvest tags ("Lese") hung on a straw-gold cord
//   · directory   — the dark press house ("Kelterhaus") where everything is
//                   gathered
//   · progress    — a tendril that grows along the header while you read
//   · Spain 2026  — a garland of red tomatoes and yellow peppers on a vine
//                   across the banner; the confetti falls as tomatoes.
// No figures of people or animals: only stone, wood, soil, plants and light.
// Every class here (hamon-, rebzeile, lese) is BYOY's own.

const ICONS = {
  moehre: `<path d="M31 15 13 39c-1.4 2 .6 3.8 2.6 2.4L37 22c2.6-3.2-3-9.6-6-7z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 33l4 2.4M22.5 27l4 2.4M27 21.5l3.4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M34 16c-.4-5 1.4-8.6 4.4-11M35.6 18.4c4-2.2 7.4-2.2 10.4 0M35 17c2.6-4.2 6-5.6 9.4-5.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  kompost: `<path d="M8 20h32v21H8z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 27h32M8 34h32M15 20v21M33 20v21" stroke="currentColor" stroke-width="1.7" opacity=".75"/><path d="M14 20c1-6 6-9 11-7M26 20c2-7 8-9 13-6-2 4-7 7-13 6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  kreislauf: `<path d="M24 8a16 16 0 0 1 14.6 9.4M40 26a16 16 0 0 1-9.4 14.6M24 40a16 16 0 0 1-14.6-9.4M8 22A16 16 0 0 1 17.4 9.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M36 13.6l2.8 4.2 4.4-2.6M34.4 42.4l-4.2-1.8 1.6-4.8M12 35.4l-2.8-4.4-4.4 2.4M13.6 5.6l4 3.8-3.2 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 31v-7M24 26c-1-3-4-4.6-6.4-4 .4 3 3.2 4.6 6.4 4zM24 24c1-3 4-4.6 6.4-4-.4 3-3.2 4.6-6.4 4z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
  apfel: `<path d="M24 15c-4.6-3.4-15-3-15.6 8.4C7.8 34 15 42 20 42c2 0 2.8-1 4-1s2 1 4 1c5 0 12.2-8 11.6-18.6C39 12 28.6 11.6 24 15z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 15c0-4 1.2-7.4 4-9.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M27 10.6c3-4 8-4.6 10.6-2.6-3 4-7.6 4.6-10.6 2.6z" fill="currentColor" opacity=".8"/>`,
  bluete: `<circle cx="24" cy="19" r="4.2" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="2.2"><ellipse cx="24" cy="10.4" rx="4" ry="5.2"/><ellipse cx="32.2" cy="16.4" rx="5.2" ry="4" transform="rotate(-18 32.2 16.4)"/><ellipse cx="29" cy="26" rx="4" ry="5.2" transform="rotate(-36 29 26)"/><ellipse cx="19" cy="26" rx="4" ry="5.2" transform="rotate(36 19 26)"/><ellipse cx="15.8" cy="16.4" rx="5.2" ry="4" transform="rotate(18 15.8 16.4)"/></g><path d="M24 31v12M24 38c3-4 7-5 10-4-2 4-6 5-10 4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  keimling: `<path d="M24 41V24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 27c-2-7.4-8.6-10.6-15-9.6 1 7.2 7.6 10.6 15 9.6zM24 24.4c2-7.4 8.6-10.6 15-9.6-1 7.2-7.6 10.6-15 9.6z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M12 41.6c4-2.4 20-2.4 24 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  blatt: `<path d="M24 42V30M24 30c-2 1-8 2-12-2 2-2 1-5 3-7-3-1-5-4-5-7 4 1 7 0 9-3 1 3 3 4 5 4 2 0 4-1 5-4 2 3 5 4 9 3 0 3-2 6-5 7 2 2 1 5 3 7-4 4-10 3-12 2z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 30V16M24 26l-6-5M24 26l6-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.blatt}</svg>`;

/** The site's mark: the watchtower on the crest of the terraced vineyard. */
const wachturm = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle cx="32" cy="32" r="30" fill="#f6f1e4" stroke="#d8b45a" stroke-width="3"/>
  <clipPath id="byMarke"><circle cx="32" cy="32" r="28"/></clipPath>
  <g clip-path="url(#byMarke)">
    <path d="M0 44c14-6 26-9 36-10s20 0 28 2v28H0z" fill="#2f4a2a"/>
    <path d="M0 50c14-5 28-8 40-8s18 1 24 3" fill="none" stroke="#f6f1e4" stroke-width="2.4"/>
    <path d="M0 57c16-4 30-6 42-6s16 1 22 2" fill="none" stroke="#f6f1e4" stroke-width="2.4"/>
    <path d="M23 40V18h-2v-5h4v3h3v-3h4v3h3v-3h4v5h-2v22z" fill="#e9dfc6" stroke="#a65a3a" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M28.5 40v-6a3.5 3.5 0 0 1 7 0v6" fill="#a65a3a"/>
    <path d="M32 21v5" stroke="#a65a3a" stroke-width="2" stroke-linecap="round"/>
  </g>
  <g class="hamon-marke__traube" fill="#5b2a5e"><circle cx="48" cy="21" r="3"/><circle cx="54" cy="21" r="3"/><circle cx="51" cy="26" r="3"/><circle cx="45.6" cy="26" r="2.6"/><circle cx="48.6" cy="31" r="2.8"/><circle cx="54.6" cy="26.4" r="2.4"/></g>
  <path d="M51 18c0-3 2-5 5-6" fill="none" stroke="#2f4a2a" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;

/** A ripening grape cluster for the topic tiles. */
const traube = (cls = "") => {
  const beeren = [[9, 16], [17, 16], [25, 16], [33, 16], [13, 23], [21, 23], [29, 23], [17, 30], [25, 30], [21, 37]];
  return `<svg class="${cls}" viewBox="0 0 42 46" aria-hidden="true" focusable="false">
    <path d="M21 3c0 3-1.4 6-.4 9" fill="none" stroke="#7a5a3a" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M22 7c4-4 10-4.6 14-1.6-3.4 4-9.4 4.8-14 1.6z" fill="#5f8a43"/>
    ${beeren.map(([x, y], i) => `<circle class="beere" style="--i:${i}" cx="${x}" cy="${y}" r="4.3"/>`).join("")}
  </svg>`;
};

/** Spanien, Weltmeister 2026 — a vine garland strung across the banner with
 * red tomatoes and yellow peppers swinging from it. */
const girlande = () => {
  const swags = 16;
  let vine = "M0 7";
  let fruits = "";
  let leaves = "";
  for (let i = 0; i < swags; i++) {
    const x = i * 100;
    vine += ` Q${x + 50} 21 ${x + 100} 7`;
    leaves += `<path d="M${x} 7c-5 0-8 4-6 8 2-1 4 0 5 1 0-2 1-3 3-3-1-2-1-4-2-6zM${x} 7c5 0 8 4 6 8-2-1-4 0-5 1 0-2-1-3-3-3 1-2 1-4 2-6z" fill="#7fa35a"/>`;
    const d = (i % 5) * 0.35;
    // Middle of every swag: alternately a tomato and a long pepper.
    if (i % 2 === 0) {
      fruits += `<g class="hamon-wm__frucht" style="--d:${d}s"><path d="M${x + 50} 14v6" stroke="#4d6b3a" stroke-width="1.6"/><circle cx="${x + 50}" cy="27" r="7.4" fill="#c60b1e"/><path d="M${x + 50} 19.4l2.4 2.6 3-.6-2 2.4M${x + 50} 19.4l-2.4 2.6-3-.6 2 2.4" fill="none" stroke="#4d6b3a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${x + 47.4}" cy="24.6" r="1.8" fill="#fff" opacity=".45"/></g>`;
    } else {
      fruits += `<g class="hamon-wm__frucht" style="--d:${d}s"><path d="M${x + 50} 14v4" stroke="#4d6b3a" stroke-width="1.8" stroke-linecap="round"/><path d="M${x + 45} 20c2-2.4 8-2.4 10 0 .4 7-2 13-5 17-3-4-5.4-10-5-17z" fill="#ffc400"/><path d="M${x + 46} 19.4c2.4 1.4 5.6 1.4 8 0" fill="none" stroke="#4d6b3a" stroke-width="2" stroke-linecap="round"/><path d="M${x + 47.4} 23c-.2 3 .4 6 1.4 8.6" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".5"/></g>`;
    }
    // Two cherry tomatoes / small peppers on the sides of each swag.
    const cols = i % 2 === 0 ? ["#ffc400", "#c60b1e"] : ["#c60b1e", "#ffc400"];
    for (const [k, dx] of [[0, 24], [1, 76]]) {
      const y = 7 + 14 * (1 - Math.pow((dx - 50) / 50, 2));
      fruits += `<g class="hamon-wm__frucht hamon-wm__frucht--klein" style="--d:${d + 0.2 + k * 0.3}s"><path d="M${x + dx} ${y.toFixed(1)}v4" stroke="#4d6b3a" stroke-width="1.3"/><circle cx="${x + dx}" cy="${(y + 8).toFixed(1)}" r="4.2" fill="${cols[k]}"/><path d="M${x + dx - 2.2} ${(y + 4).toFixed(1)}h4.4" stroke="#4d6b3a" stroke-width="1.4" stroke-linecap="round"/></g>`;
    }
  }
  return `<svg class="hamon-wm__girlande" viewBox="0 0 1600 40" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
    <path d="${vine}" fill="none" stroke="#4d6b3a" stroke-width="2.6" stroke-linecap="round"/>
    <path d="${vine}" fill="none" stroke="#7fa35a" stroke-width="1" stroke-dasharray="3 9" stroke-linecap="round"/>
    ${leaves}${fruits}
  </svg>`;
};

const champions = () => `<aside class="hamon-wm" role="note" aria-label="Spanien, Fußball-Weltmeister 2026">
  ${girlande()}
  <p class="hamon-wm__text"><span class="hamon-wm__pokal" aria-hidden="true">🏆</span> <strong>Spanien</strong> ist Fußball-Weltmeister 2026 <span aria-hidden="true">⚽</span></p>
</aside>`;

/** One menu item: a vine row whose tendril curls out and leaf unfurls. */
const rebzeile = (ctx, href, label, extra = "") => `<a class="rebzeile${extra}" href="${href}"><span class="rebzeile__wort">${ctx.esc(label)}</span><svg class="rebzeile__ranke" viewBox="0 0 64 24" aria-hidden="true" focusable="false"><path class="rebzeile__trieb" pathLength="1" d="M3 5c9 0 13 7 22 7s15-8 23-5c5 2 5.6 8 1.4 9.4-3 1-5.4-1.6-3.6-3.8 1.4-1.6 3.8-.6 3.2 1"/><path class="rebzeile__blatt" d="M25 12c-5 .2-8 4-5.6 7.6 1.6-1 3-.8 4 .4.2-1.4.8-2 1.6-2.2.8.2 1.4.8 1.6 2.2 1-1.2 2.4-1.4 4-.4C33 16 30 12.2 25 12z"/></svg></a>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="hamon hamon--${kind}">
<a class="hamon-sprung" href="#inhalt">Zum Inhalt springen</a>
${champions()}
<header class="hamon-kopf">
  <div class="hamon-kopf__innen">
    <a class="hamon-marke" href="/" aria-label="${esc(site.name)}: Startseite">
      ${wachturm("hamon-marke__bild")}
      <span class="hamon-marke__texte"><span class="hamon-marke__name">BYOY</span><span class="hamon-marke__lang">${esc(site.expansion)}</span></span>
    </a>
    <button class="hamon-knopf" type="button" aria-expanded="false" aria-controls="hamon-menue"><span class="hamon-knopf__striche" aria-hidden="true"><i></i><i></i><i></i></span>Menü</button>
  </div>
  <nav id="hamon-menue" class="hamon-menue" aria-label="Hauptmenü">
    ${rebzeile(ctx, "/", "Start")}
    ${categories.map((c) => rebzeile(ctx, c.url, c.name)).join("\n    ")}
    ${site.menu.map((m) => rebzeile(ctx, m.href, m.label, " rebzeile--seite")).join("\n    ")}
  </nav>
  <div class="hamon-kopf__mauer" aria-hidden="true"></div>
  ${kind === "wissen" ? `<div class="hamon-fortschritt" aria-hidden="true"><i></i></div>` : ""}
</header>
<main id="inhalt">
${body}
</main>
<footer class="hamon-fuss">
  <div class="hamon-fuss__terrassen" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hamon-fuss__innen">
    <section>
      <p class="hamon-fuss__name">BYOY</p>
      <p class="hamon-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen im Fußbereich">
      <p class="hamon-fuss__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="BYOY und Rechtliches">
      <p class="hamon-fuss__titel">BYOY</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="hamon-fuss__hinweis">© ${new Date().getFullYear()} BYOY · ${esc(site.domain)} · Allgemeine Informationen zum biologischen Gärtnern in Deutschland. Termine und Mengen sind Richtwerte, die je nach Region, Boden und Witterung abweichen. Wir empfehlen keine chemisch-synthetischen Pflanzenschutzmittel. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A harvest tag on a straw cord: the article card. */
const lese = (ctx, a) => `<article class="lese">
  <a class="lese__link" href="${a.url}">
    <span class="lese__kopf"><span class="lese__siegel">${icon(a.cat.icon)}</span><span class="lese__thema">${ctx.esc(a.cat.name)}</span></span>
    <h3 class="lese__titel">${ctx.esc(a.title)}</h3>
    <p class="lese__text">${ctx.esc(a.description)}</p>
    <span class="lese__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="lese__blatt" aria-hidden="true">${icon("blatt")}</span></span>
  </a>
</article>`;

/** The hero: terraced slopes with limestone walls and vine rows, the
 * watchtower on the crest, the kitchen garden on the lowest terrace. */
const weinberg = () => {
  // Terrace bands: [top of the planted surface, x from which the slope exists]
  const baender = [[100, 300], [146, 180], [192, 40], [238, 0], [284, 0]];
  const stoecke = baender
    .map(([y0, von], b) => {
      let s = `<path d="M0 ${y0 + 13}H480" stroke="#9c9478" stroke-width=".7"/>`;
      for (let x = von + (b % 2 ? 14 : 4); x < 480; x += 26) {
        const n = Math.round(x / 26) + b;
        const traubeHier = n % 2 === 0;
        s += `<g class="hamon-bild__stock" style="--n:${n % 7}" transform="translate(${x} ${y0 + 31})"><path d="M0 0V-22" stroke="#7a5a3a" stroke-width="1.7"/><g class="hamon-bild__laub"><ellipse cx="-5" cy="-19" rx="7" ry="5" fill="#5f8a43"/><ellipse cx="5.4" cy="-17" rx="7" ry="5" fill="#4b7336"/><ellipse cx="0" cy="-24" rx="6.4" ry="4.6" fill="#6f9a4d"/>${traubeHier ? `<g fill="#5b2a5e"><circle cx="2" cy="-11" r="2.2"/><circle cx="6" cy="-11" r="2.2"/><circle cx="4" cy="-7.4" r="2.2"/></g>` : ""}</g></g>`;
      }
      return s;
    })
    .join("");
  const mauern = [...baender, [330, 0]]
    .map(([y0]) => `<rect x="0" y="${y0 + 32}" width="480" height="13" fill="url(#byKalk)"/><path d="M0 ${y0 + 38.5}H480" stroke="#cbbf9e" stroke-width=".8"/><path d="${Array.from({ length: 24 }, (_, k) => `M${k * 20 + (y0 % 20 ? 10 : 0)} ${y0 + 32}v6.5M${k * 20 + (y0 % 20 ? 0 : 10)} ${y0 + 38.5}v6.5`).join("")}" stroke="#cbbf9e" stroke-width=".8"/>`)
    .join("");
  // The kitchen garden on the lowest terrace: cabbages, tomato stakes, beans.
  let garten = "";
  for (let x = 10; x < 480; x += 30) {
    const art = Math.round(x / 30) % 3;
    if (art === 0) garten += `<g transform="translate(${x} 356)"><circle r="8" fill="#8fb36a"/><circle r="4.6" fill="#b8d08e"/><path d="M-8 0c3-3 13-3 16 0" fill="none" stroke="#5f8a43" stroke-width="1.2"/></g>`;
    else if (art === 1) garten += `<g class="hamon-bild__stock" style="--n:${x % 5}" transform="translate(${x} 362)"><path d="M0 0V-26" stroke="#7a5a3a" stroke-width="1.6"/><g class="hamon-bild__laub"><ellipse cx="-3" cy="-16" rx="5" ry="7" fill="#4b7336"/><ellipse cx="3.4" cy="-21" rx="5" ry="6" fill="#5f8a43"/><circle cx="-3" cy="-9" r="3.2" fill="#c8402c"/><circle cx="4" cy="-13" r="3" fill="#d24d33"/><circle cx="1" cy="-25" r="2.6" fill="#e2a33c"/></g></g>`;
    else garten += `<g transform="translate(${x} 360)"><path d="M-7 0c0-8 3-12 7-14 4 2 7 6 7 14" fill="#6f9a4d"/><path d="M0 0v-14" stroke="#4b7336" stroke-width="1.2"/><circle cx="-3" cy="-7" r="1.6" fill="#f2e6b8"/><circle cx="3" cy="-10" r="1.6" fill="#f2e6b8"/></g>`;
  }
  return `<svg class="hamon-bild" viewBox="0 0 480 380" role="img" aria-label="Terrassierter Weinberg mit Kalksteinmauern, Rebzeilen, einem Wachturm auf dem Hügel und einem Gemüsegarten auf der untersten Terrasse">
  <defs>
    <linearGradient id="byHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf7e6"/><stop offset=".65" stop-color="#f4e6bf"/><stop offset="1" stop-color="#ead7a2"/></linearGradient>
    <radialGradient id="bySonne" cx=".42" cy=".4" r=".7"><stop offset="0" stop-color="#fff8e0"/><stop offset="1" stop-color="#d8b45a"/></radialGradient>
    <linearGradient id="byHang" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d8a4c"/><stop offset="1" stop-color="#3d5c33"/></linearGradient>
    <linearGradient id="byKalk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8ef"/><stop offset="1" stop-color="#e2d7bb"/></linearGradient>
    <linearGradient id="byErde" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8694a"/><stop offset="1" stop-color="#8c4a30"/></linearGradient>
    <clipPath id="byHuegel"><path d="M0 380V240c60-26 120-44 190-68 60-20 110-48 160-68 40-14 90-18 130-12v288z"/></clipPath>
    <clipPath id="byRahmen"><rect width="480" height="380" rx="28"/></clipPath>
  </defs>
  <g clip-path="url(#byRahmen)">
    <rect width="480" height="380" fill="url(#byHimmel)"/>
    <g class="hamon-bild__strahlen" stroke="#d8b45a" stroke-width="2.4" stroke-linecap="round" opacity=".7">
      ${Array.from({ length: 12 }, (_, k) => {
        const w = (k * Math.PI) / 6;
        return `<path d="M${(236 + Math.cos(w) * 36).toFixed(1)} ${(66 + Math.sin(w) * 36).toFixed(1)}L${(236 + Math.cos(w) * 47).toFixed(1)} ${(66 + Math.sin(w) * 47).toFixed(1)}"/>`;
      }).join("")}
    </g>
    <circle cx="236" cy="66" r="26" fill="url(#bySonne)"/>
    <g class="hamon-bild__wolke" fill="#fffbf1" opacity=".92"><ellipse cx="330" cy="44" rx="30" ry="9"/><ellipse cx="346" cy="37" rx="16" ry="10"/><ellipse cx="318" cy="39" rx="12" ry="8"/></g>
    <g class="hamon-bild__wolke hamon-bild__wolke--b" fill="#fffbf1" opacity=".8"><ellipse cx="130" cy="120" rx="26" ry="7"/><ellipse cx="142" cy="114" rx="13" ry="8"/></g>
    <path d="M0 214c50-30 110-40 170-58 70-22 120-56 200-74 40-9 80-8 110-4v320H0z" fill="#b9c49a" opacity=".55"/>
    <g clip-path="url(#byHuegel)">
      <rect y="90" width="480" height="290" fill="url(#byErde)"/>
      ${[...baender, [330, 0]].map(([y0]) => `<rect x="0" y="${y0}" width="480" height="32" fill="url(#byHang)"/>`).join("")}
      ${mauern}
      ${stoecke}
      <rect x="0" y="336" width="480" height="24" fill="#8c4a30" opacity=".55"/>
      ${garten}
    </g>
    <g class="hamon-bild__turm">
      <path d="M372 104V50h-4v-9h8v5h6v-5h8v5h6v-5h8v9h-4v54z" fill="url(#byKalk)" stroke="#a89a74" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M372 64h32M372 80h32M372 94h32" stroke="#d6cba9" stroke-width="1"/>
      <path d="M383 104V91a5 5 0 0 1 10 0v13" fill="#5a3a26"/>
      <path d="M388 58v9" stroke="#5a3a26" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M388 41V22" stroke="#7a5a3a" stroke-width="1.6"/>
      <path class="hamon-bild__wimpel" d="M388 22l20 5-20 5z" fill="#a65a3a"/>
    </g>
    <g class="hamon-bild__ranke">
      <path d="M-4 16c30 4 52 18 84 16s52-14 80-8" fill="none" stroke="#6b4a2a" stroke-width="4.4" stroke-linecap="round"/>
      <path class="hamon-bild__spirale" pathLength="1" d="M160 24c10 2 14 10 9 15-4 4-10 0-7-4 2-2 5-1 4 2" fill="none" stroke="#5f8a43" stroke-width="1.8" stroke-linecap="round"/>
      <g class="hamon-bild__grossblatt"><path d="M46 26c-12-2-24 4-26 16 6-2 10 1 12 4-4 3-4 8-2 12 6-4 10-4 14-2 0-6 4-10 8-11-2-5-1-10 2-13-3-4-5-6-8-6z" fill="#4b7336"/><path d="M46 26 34 46M40 36l-12 2M40 36l2 12" stroke="#2f4a2a" stroke-width="1" fill="none"/></g>
      <g class="hamon-bild__grossblatt hamon-bild__grossblatt--b"><path d="M120 30c12-4 26 0 30 12-6-1-10 2-11 6 4 2 5 7 4 11-6-3-10-3-14-1-1-6-5-9-9-10 1-5 0-9-3-12 1-3 2-5 3-6z" fill="#5f8a43"/><path d="M120 30l18 18M131 41l12-1M131 41l-1 12" stroke="#2f4a2a" stroke-width="1" fill="none"/></g>
      <g class="hamon-bild__traube">
        <path d="M84 32c0 6 1 10 0 14" stroke="#6b4a2a" stroke-width="1.8" fill="none"/>
        <g fill="#5b2a5e">${[[74, 50], [82, 49], [90, 50], [98, 51], [78, 57], [86, 57], [94, 58], [82, 64], [90, 65], [86, 72], [78, 64.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6"/>`).join("")}</g>
        <g fill="#fff" opacity=".35"><circle cx="80.6" cy="47.6" r="1.3"/><circle cx="88.6" cy="55.6" r="1.3"/><circle cx="84.6" cy="62.6" r="1.2"/></g>
      </g>
    </g>
  </g>
</svg>`;
};

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const body = `
<section class="hamon-auftakt">
  <div class="hamon-auftakt__innen">
    <div class="hamon-auftakt__text">
      <p class="hamon-dachzeile">Der Ratgeber für den Bio-Garten</p>
      <h1 class="hamon-auftakt__titel">Ein Garten, der <em>ohne Gift</em> gedeiht</h1>
      <p class="hamon-auftakt__claim">${esc(site.tagline)}</p>
      <p class="hamon-auftakt__intro">${esc(site.description)}</p>
      <p class="hamon-auftakt__knoepfe"><a class="hamon-taste" href="${categories[0].url}">Mit dem Gemüsegarten beginnen</a><a class="hamon-taste hamon-taste--rahmen" href="/gartenkalender/">Zum Gartenkalender</a></p>
    </div>
    <div class="hamon-auftakt__bild">${weinberg()}</div>
  </div>
</section>

<section class="hamon-lagen" aria-labelledby="lagen-t">
  <header class="hamon-ueber"><p class="hamon-ueber__zeile">Sechs Lagen am Hang</p><h2 id="lagen-t">Wo möchtest du anfangen?</h2></header>
  <ol class="hamon-lagen__liste">
    ${categories.map((c, i) => `<li><a class="hamon-lage" href="${c.url}">
      <span class="hamon-lage__nr">Lage ${i + 1}</span>
      <span class="hamon-lage__siegel">${icon(c.icon)}</span>
      <span class="hamon-lage__name">${esc(c.name)}</span>
      <span class="hamon-lage__text">${esc(c.description)}</span>
      <span class="hamon-lage__zahl">${c.articles.length} Anleitungen</span>
      ${traube("hamon-lage__traube")}
    </a></li>`).join("\n    ")}
  </ol>
</section>

<section class="hamon-ernte" aria-labelledby="neu-t">
  <header class="hamon-ueber"><p class="hamon-ueber__zeile">Frisch geerntet</p><h2 id="neu-t">Neue Anleitungen</h2></header>
  <div class="hamon-ernte__karten">
    ${articles.slice(0, 9).map((a) => lese(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="hamon-kelter" aria-labelledby="vz-t">
  <header class="hamon-ueber hamon-ueber--dunkel"><p class="hamon-ueber__zeile">Das Kelterhaus</p><h2 id="vz-t">Alle Anleitungen auf einen Blick</h2></header>
  <div class="hamon-kelter__spalten">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "hamon-kelter__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `BYOY: ${site.expansion}. Der Ratgeber für den Bio-Garten`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site, categories } = ctx;
  const nr = categories.findIndex((x) => x.slug === c.slug) + 1;
  const body = `
<header class="hamon-thema">
  <div class="hamon-thema__innen">
    <nav class="hamon-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
    <span class="hamon-thema__siegel">${icon(c.icon)}<span class="hamon-thema__nr">Lage ${nr}</span></span>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.description)}</p>
    <p class="hamon-thema__zahl">${c.articles.length} Anleitungen</p>
  </div>
</header>
<section class="hamon-ernte hamon-ernte--thema" aria-label="Anleitungen zu ${esc(c.name)}"><div class="hamon-ernte__karten">
  ${c.articles.map((a) => lese(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Anleitungen für den Bio-Garten`,
      description: `${c.description} ${c.articles.length} Anleitungen von ${site.name}.`.slice(0, 160),
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
<article class="hamon-wissen">
  <header class="hamon-wissen__kopf">
    <nav class="hamon-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <h1 class="hamon-wissen__titel">${esc(a.title)}</h1>
    <p class="hamon-wissen__intro">${esc(a.description)}</p>
  </header>
  <div class="hamon-wissen__koerper">
    <aside class="hamon-tafel" aria-label="Angaben zur Anleitung">
      <p class="hamon-tafel__titel">${icon("blatt", "hamon-tafel__icon")}Auf einen Blick</p>
      <dl>
        <div><dt>Thema</dt><dd><a href="${a.cat.url}">${esc(a.cat.name)}</a></dd></div>
        <div><dt>Lesezeit</dt><dd>${a.minutes} Min.</dd></div>
        <div><dt>Stand</dt><dd><time datetime="${a.updated}">${a.updatedLabel}</time></dd></div>
        <div><dt>Von</dt><dd>${esc(site.author)}</dd></div>
      </dl>
      ${toc.length > 2 ? `<p class="hamon-tafel__titel hamon-tafel__titel--b">Inhalt</p><ol class="hamon-tafel__inhalt">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>` : ""}
      <a class="hamon-tafel__kalender" href="/gartenkalender/">Was ist diesen Monat zu tun? <span>Zum Gartenkalender</span></a>
    </aside>
    <div class="hamon-wissen__text">
${a.html}
      <aside class="hamon-hinweis"><p><strong>Gut zu wissen:</strong> Termine, Abstände und Mengen in dieser Anleitung sind Richtwerte für Deutschland. Im Weinbauklima am Oberrhein beginnt die Saison oft zwei bis drei Wochen früher als im Mittelgebirge oder an der Küste. Beobachte deinen eigenen Garten, notiere, was funktioniert, und passe die Tipps an Boden, Lage und Witterung an. Pflanzenschutz bei BYOY heißt immer: vorbeugen, Nützlinge fördern und ohne chemisch-synthetische Mittel auskommen.</p></aside>
    </div>
  </div>
</article>
<section class="hamon-ernte hamon-ernte--weiter" aria-labelledby="wt-t">
  <header class="hamon-ueber"><p class="hamon-ueber__zeile">Weiterlesen</p><h2 id="wt-t">Passende Anleitungen</h2></header>
  <div class="hamon-ernte__karten">${a.related.map((r) => lese(ctx, r)).join("")}</div>
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
    "wissen"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="hamon-wissen hamon-wissen--seite">
  <header class="hamon-wissen__kopf">
    <nav class="hamon-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="hamon-wissen__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="hamon-wissen__intro">Stand: ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="hamon-wissen__koerper hamon-wissen__koerper--eins"><div class="hamon-wissen__text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="hamon-leer">
  <p class="hamon-leer__code">404</p>
  <h1>In dieser Reihe wächst nichts</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link alt oder hatte einen Tippfehler. Hier geht es zu den sechs Lagen unseres Gartens:</p>
  <ol class="hamon-lagen__liste hamon-lagen__liste--flach">${ctx.categories.map((c, i) => `<li><a class="hamon-lage" href="${c.url}"><span class="hamon-lage__nr">Lage ${i + 1}</span><span class="hamon-lage__siegel">${icon(c.icon)}</span><span class="hamon-lage__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ol>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei BYOY nicht.", path: "/404.html", noindex: true }, body, "leer");
}
