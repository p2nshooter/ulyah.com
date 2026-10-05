// QULEN — "Das hörende Herz".
//
// In 1 Kön 3,9 bittet Salomo nicht um Reichtum, sondern um ein hörendes Herz,
// um verstehen zu können. Dieser Palast ist ein nächtlicher Lesesaal in
// Nachtpetrol: Pergamentseiten mit zinnoberrotem Heftrand, kleine Goldsterne
// wie unter einer gelungenen Arbeit und ein Rosettenfenster aus acht Herzen.
// Die Menüpunkte sind Registerreiter eines Hefts: Kommt man ihnen nahe, zieht
// sich eine handgeschriebene Tintenlinie unter das Wort, und kleine Goldsterne
// erscheinen. Keine Lebewesen, nur Herzen, Sterne, Bücher, Linien und Papier.
// Jede Klasse beginnt mit hh- und gehört allein QULEN.

/** Farben der Registerreiter: Start + sechs Kapitel. */
const FARBEN = ["#0f4246", "#1d6b66", "#c4462a", "#b8892f", "#2b5f73", "#b5532f", "#8f6a26"];

/** Ein Herz mit der Spitze im Ursprung und den Bögen nach oben. */
const HERZ = "M0 0C-3-4-9-7-9-12a4.5 4.5 0 0 1 9-1a4.5 4.5 0 0 1 9 1C9-7 3-4 0 0Z";

/** Fünfzackiger Stern als Pfad. */
function sternPfad(cx, cy, R, r = R * 0.44) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R;
    const w = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i ? "L" : "M"}${(cx + rad * Math.cos(w)).toFixed(2)} ${(cy + rad * Math.sin(w)).toFixed(2)}`;
  }
  return `${d}Z`;
}

const stern = (cls = "") =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="${sternPfad(12, 12, 11)}" fill="currentColor"/></svg>`;

/** Die handgeschriebene Tintenlinie (pathLength=1, damit sie sich selbst zeichnen kann). */
const TINTE = "M3 7.6C13 4.2 23 9.6 36 6.4S60 3.4 73 6.9 91 8.6 97 5.2";
const tinte = (cls) =>
  `<svg class="${cls}" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${TINTE}" pathLength="1"/></svg>`;

const ICONS = {
  kalender: `<rect x="8" y="10" width="32" height="32" rx="4"/><path d="M8 19h32"/><path d="M16 6v8M32 6v8" stroke-width="2.7"/><path d="M14.5 30.5l4.2 4.2 8.3-9.2" stroke-width="2.7"/><path d="M31 28h4.5M31 34h4.5" stroke-width="2" opacity=".7"/>`,
  sanduhr: `<path d="M11 6h26M11 42h26" stroke-width="2.7"/><path d="M15 6c0 9 5 13 9 18-4 5-9 9-9 18M33 6c0 9-5 13-9 18 4 5 9 9 9 18"/><path d="M18.5 38.5c2-3.4 3.8-4.6 5.5-4.6s3.5 1.2 5.5 4.6z" fill="currentColor" stroke="none"/><path d="M19 12.5h10c-1.2 2.8-3 4.4-5 6-2-1.6-3.8-3.2-5-6z" fill="currentColor" stroke="none" opacity=".55"/><path d="M24 25v6" stroke-width="1.6" stroke-dasharray="1.5 2"/>`,
  lampe: `<path d="M5 29c3 6 10 9 19 9 7 0 12-2 15-5l6-5c-4-1.5-8-1-11 1-3-3-7-4.5-11-4.5-8 0-14.5 1.8-18 4.5z"/><path d="M17 38l-2.5 4.5h19L31 38"/><path d="M5.5 29c-3-.5-3.8-4.2-1-6"/><path d="M43.5 23.5c-3.2-2.6-2.6-6.8.4-10.2.9 3 3.9 4.4 3 8.3-.4 1.8-1.7 2.6-3.4 1.9z" fill="currentColor" stroke="none"/><path d="M14 29.5c4-1.6 10-1.6 14 0" stroke-width="1.8" opacity=".6"/>`,
  karteikarten: `<rect x="13" y="7" width="29" height="21" rx="2.5" opacity=".55" transform="rotate(7 27 18)"/><rect x="6" y="16" width="32" height="24" rx="2.5"/><path d="M6 23h32"/><path d="M11 29.5h20M11 34.5h13" stroke-width="2" opacity=".75"/>`,
  zirkel: `<circle cx="24" cy="8.5" r="3.2"/><path d="M22.4 11.4 13.5 39M25.6 11.4 34.5 39"/><path d="M34.5 39l1.6 4" stroke-width="1.8"/><path d="M16.5 29h15" stroke-width="2"/><path d="M6 43c10-6 26-6 36 0" stroke-width="1.8" stroke-dasharray="2 3"/>`,
  tafel: `<rect x="6" y="7" width="36" height="25" rx="2.5"/><path d="M11.5 26l7-7 5.2 4 9.3-9.3"/><path d="M30 13.7h3.3V17" stroke-width="2"/><path d="M17 32l-5 10.5M31 32l5 10.5M24 32v6"/>`,
  herz: `<path d="M24 41S7 31 7 18.5a8.5 8.5 0 0 1 17-2.2 8.5 8.5 0 0 1 17 2.2C41 31 24 41 24 41z"/><path d="M31.5 13.5c2.6 1 4.1 3.2 4.3 6M35 9.5c4.4 1.8 7 5.6 7.3 10.2" stroke-width="1.9" opacity=".8"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="hh-icon ${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.herz}</g></svg>`;

/** Acht Herzen um eine Mitte: das Rosettenfenster des hörenden Herzens. */
const blaetter = (scale = 1, stroke = "#ecc874", w = 1.4) =>
  `<g fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round">${Array.from(
    { length: 8 },
    (_, k) => `<path d="${HERZ}" transform="rotate(${k * 45}) translate(0 -4.5) scale(${scale})"/>`
  ).join("")}</g>`;

const rosette = (cls = "") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle cx="32" cy="32" r="30.5" fill="#0b2c30" stroke="#c69a3e" stroke-width="2"/>
  <circle cx="32" cy="32" r="26.5" fill="none" stroke="#c69a3e" stroke-width=".8" stroke-dasharray="1.6 2.4" opacity=".8"/>
  <g transform="translate(32 32)">${blaetter(0.95, "#ecc874", 1.5)}</g>
  <path d="M32 37.4c-1-1.2-5.2-3.3-5.2-6.4a2.7 2.7 0 0 1 5.2-1.1 2.7 2.7 0 0 1 5.2 1.1c0 3.1-4.2 5.2-5.2 6.4z" fill="#cf4a2c" stroke="#fbf7ec" stroke-width=".9"/>
</svg>`;

/** Ein rot-gelb-rotes Band, dessen Wellen in einer Endlosschleife wehen. */
function bandWelle() {
  const W = 2400;
  const P = 150;
  const welle = (y0, dicke, amp, phase) => {
    const oben = [];
    const unten = [];
    for (let x = 0; x <= W; x += 15) {
      const y = y0 + amp * Math.sin(((x + phase) / P) * Math.PI * 2);
      oben.push(`${x} ${y.toFixed(2)}`);
      unten.unshift(`${x} ${(y + dicke).toFixed(2)}`);
    }
    return `M${oben.join("L")}L${unten.join("L")}Z`;
  };
  return `<svg class="hh-wm__band" viewBox="0 0 1200 12" preserveAspectRatio="none" aria-hidden="true" focusable="false"><g class="hh-wm__wehen">
    <path d="${welle(1.6, 3, 1.4, 0)}" fill="#b3141c"/>
    <path d="${welle(4.4, 3.6, 1.4, 0)}" fill="#f2bf1a"/>
    <path d="${welle(7.8, 3, 1.4, 0)}" fill="#b3141c"/>
  </g></svg>`;
}

/** Spanien, Fußball-Weltmeister 2026: ein rot-gelber Papierflieger gleitet
 * über das Band, der Pokal glänzt, der Ball läuft auf seiner Bahn. */
const weltmeister = () => `<aside class="hh-wm" role="note" aria-label="Spanien ist Fußball-Weltmeister 2026">
  <span class="hh-wm__himmel" aria-hidden="true"><span class="hh-wm__flugbahn"><svg class="hh-wm__flieger" viewBox="0 0 52 30" aria-hidden="true" focusable="false"><path d="M2 15.5 50 2 22 19.5z" fill="#f2bf1a"/><path d="M22 19.5 50 2 30 28z" fill="#b3141c"/><path d="M22 19.5 24.5 27.5 30 28z" fill="#7d0d13"/><path d="M2 15.5 50 2" stroke="#fff4c9" stroke-width=".8" opacity=".7"/></svg></span></span>
  <p class="hh-wm__zeile">
    <svg class="hh-wm__pokal" viewBox="0 0 32 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hhPokalGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6420"/><stop offset=".42" stop-color="#f3d68a"/><stop offset=".68" stop-color="#c69a3e"/><stop offset="1" stop-color="#7a561a"/></linearGradient>
        <clipPath id="hhPokalForm"><path d="M8 3h16v9c0 6-3.5 10-8 10S8 18 8 12zM14 22h4v6h-4zM10 28h12l2 6H8z"/></clipPath>
      </defs>
      <path d="M8.5 6.5H4.5c0 6 2.2 9.3 5.5 9.8M23.5 6.5h4c0 6-2.2 9.3-5.5 9.8" fill="none" stroke="#c69a3e" stroke-width="2"/>
      <path d="M8 3h16v9c0 6-3.5 10-8 10S8 18 8 12z" fill="url(#hhPokalGold)"/>
      <path d="M14 22h4v6h-4z" fill="#b8892f"/>
      <path d="M10 28h12l2 6H8z" fill="url(#hhPokalGold)"/>
      <rect x="6.5" y="34" width="19" height="3.4" rx="1.2" fill="#7a561a"/>
      <path d="M16 7.2l1.2 2.5 2.7.3-2 1.8.6 2.7-2.5-1.4-2.5 1.4.6-2.7-2-1.8 2.7-.3z" fill="#fbf7ec" opacity=".85"/>
      <g clip-path="url(#hhPokalForm)"><g transform="skewX(-18)"><rect class="hh-wm__glanz" x="0" y="0" width="5" height="40" fill="#fffbe8" opacity=".75"/></g></g>
    </svg>
    <span class="hh-wm__text"><strong>Spanien</strong> ist Fußball-Weltmeister 2026</span>
    <span class="hh-wm__bahn" aria-hidden="true"><span class="hh-wm__ball"><svg viewBox="0 0 20 20" focusable="false"><circle cx="10" cy="10" r="9" fill="#fbf7ec" stroke="#0b2c30" stroke-width="1"/><path d="M10 5.6l3.3 2.4-1.3 3.9H8l-1.3-3.9z" fill="#0b2c30"/><path d="M10 5.6V1.4M13.3 8l3.9-1.3M12 11.9l2.4 3.3M8 11.9l-2.4 3.3M6.7 8 2.8 6.7" stroke="#0b2c30" stroke-width=".9"/></svg></span></span>
  </p>
  ${bandWelle()}
</aside>`;

/** Kurzname eines Kapitels für den Registerreiter. */
const kurz = (name) => name.split(" & ")[0];
const farbe = (ctx, cat) => FARBEN[ctx.categories.findIndex((c) => c.slug === cat.slug) + 1] || FARBEN[0];

function reiter(ctx, { href, label, i }, pfad, aktiv) {
  const aktuell = href === pfad ? ' aria-current="page"' : href === aktiv ? ' aria-current="true"' : "";
  return `<li><a class="hh-reiter" href="${href}" style="--hh-farbe:${FARBEN[i] || FARBEN[0]}"${aktuell}><span class="hh-reiter__wort">${ctx.esc(label)}</span>${tinte("hh-reiter__tinte")}<span class="hh-reiter__sterne" aria-hidden="true">${stern("s1")}${stern("s2")}${stern("s3")}</span></a></li>`;
}

function layout(ctx, meta, body, kind = "", aktiv = "") {
  const { site, categories, esc } = ctx;
  const reiterListe = [{ href: "/", label: "Start", i: 0 }, ...categories.map((c, n) => ({ href: c.url, label: kurz(c.name), i: n + 1 }))];
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="hh hh--${kind}">
<script>document.documentElement.className+=" hh-js"</script>
<a class="hh-sprung" href="#inhalt">Zum Inhalt springen</a>
${weltmeister()}
<header class="hh-kopf">
  <div class="hh-kopf__zeile">
    <a class="hh-marke" href="/" aria-label="${esc(site.name)}, ${esc(site.expansion)}: zur Startseite">
      ${rosette("hh-marke__rosette")}
      <span class="hh-marke__texte"><span class="hh-marke__name">${esc(site.name)}</span><span class="hh-marke__lang"><b>Qu</b>elle des <b>Le</b>r<b>n</b>ens</span></span>
    </a>
    <nav class="hh-oben" aria-label="Über ${esc(site.name)}">
      ${site.menu.map((m) => `<a href="${m.href}"${m.href === meta.path ? ' aria-current="page"' : ""}>${esc(m.label)}</a>`).join("\n      ")}
    </nav>
    <button class="hh-knopf" type="button" aria-expanded="false" aria-controls="hh-menue"><span class="hh-knopf__striche" aria-hidden="true"><i></i><i></i><i></i></span><span class="hh-knopf__wort">Menü</span></button>
  </div>
  <nav id="hh-menue" class="hh-menue" aria-label="Kapitel">
    <ul class="hh-reiterleiste">
      ${reiterListe.map((r) => reiter(ctx, r, meta.path, aktiv)).join("\n      ")}
    </ul>
    <ul class="hh-menue__mehr">
      ${site.menu.map((m) => `<li><a href="${m.href}"${m.href === meta.path ? ' aria-current="page"' : ""}>${esc(m.label)}</a></li>`).join("\n      ")}
    </ul>
  </nav>
</header>
${kind === "geschichte" ? `<div class="hh-lesefaden" aria-hidden="true"><i></i></div>` : ""}
<main id="inhalt" tabindex="-1">
${body}
</main>
<footer class="hh-fuss">
  <div class="hh-fuss__borte" aria-hidden="true"></div>
  <div class="hh-fuss__innen">
    <section class="hh-fuss__wir">
      <p class="hh-fuss__name">${rosette("hh-fuss__rosette")}<span>${esc(site.name)}</span></p>
      <p class="hh-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Kapitel im Fußbereich">
      <p class="hh-fuss__titel">Kapitel</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="${esc(site.name)} und Rechtliches">
      <p class="hh-fuss__titel">${esc(site.name)}</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="hh-fuss__hinweis">© ${new Date().getFullYear()} ${esc(site.name)} · ${esc(site.domain)} · Alle Geschichten auf dieser Website sind frei erfunden; Namen, Personen, Schulen, Betriebe und Hochschulen sind ausgedacht. Die Praxisteile geben allgemeine Lernhinweise und ersetzen keine pädagogische, ärztliche oder psychologische Beratung. Wenn Lernen dauerhaft schwerfällt oder Angst und Druck überhandnehmen: <a href="/hilfe-und-beratung/">Hilfe &amp; Beratung</a>. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** Eine Karteikarte mit rotem Kopfstrich: die Karte einer Geschichte. */
const karte = (ctx, a) => `<article class="hh-karte" style="--hh-farbe:${farbe(ctx, a.cat)}">
  <a class="hh-karte__link" href="${a.url}">
    <span class="hh-karte__kopf">${icon(a.cat.icon, "hh-karte__icon")}<span class="hh-karte__kapitel">${ctx.esc(a.cat.name)}</span></span>
    <h3 class="hh-karte__titel">${ctx.esc(a.title)}</h3>
    <p class="hh-karte__text">${ctx.esc(a.description)}</p>
    <span class="hh-karte__fuss"><span>Geschichte + Praxisteil · ${a.minutes} Min.</span>${stern("hh-karte__stern")}</span>
  </a>
</article>`;

/** Abschnittskopf mit Dachzeile und einer Tintenlinie, die sich zeichnet. */
const ueber = (zeile, titel, id, extra = "") => `<header class="hh-ueber ${extra}">
  <p class="hh-ueber__zeile">${zeile}</p>
  <h2 id="${id}">${titel}</h2>
  ${tinte("hh-ueber__strich")}
</header>`;

/** Das Register: sechs Trennblätter, deren Reiter versetzt herausschauen. */
const registerblaetter = (ctx, { mitText = true, h = "h3" } = {}) => `<ol class="hh-trenn">
  ${ctx.categories
    .map(
      (c, i) => `<li style="--hh-farbe:${FARBEN[i + 1]};--i:${i}"><a class="hh-trenn__blatt" href="${c.url}">
      <span class="hh-trenn__reiter">${String(i + 1).padStart(2, "0")}</span>
      ${icon(c.icon, "hh-trenn__icon")}
      <${h} class="hh-trenn__name">${ctx.esc(c.name)}</${h}>
      ${mitText ? `<p class="hh-trenn__text">${ctx.esc(c.description)}</p>` : ""}
      <span class="hh-trenn__zahl">${c.articles.length === 1 ? "1 Geschichte" : `${c.articles.length} Geschichten`}</span>
    </a></li>`
    )
    .join("\n  ")}
</ol>`;

/** Der Blick in den Lesesaal: Rosettenfenster, Lichtfall, offenes Heft. */
const lesesaal = () => `<svg class="hh-saal" viewBox="0 0 480 400" role="img" aria-labelledby="hhSaalT">
  <title id="hhSaalT">Ein nächtlicher Lesesaal mit goldenem Rosettenfenster aus Herzen und einem offenen Heft</title>
  <defs>
    <linearGradient id="hhSaalNacht" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#061d20"/><stop offset=".62" stop-color="#0f3d42"/><stop offset="1" stop-color="#1b4d52"/></linearGradient>
    <radialGradient id="hhSaalGlut" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#fff2c4"/><stop offset=".45" stop-color="#ecc874"/><stop offset="1" stop-color="#8a6420"/></radialGradient>
    <linearGradient id="hhSaalLicht" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecc874" stop-opacity=".55"/><stop offset="1" stop-color="#ecc874" stop-opacity="0"/></linearGradient>
    <linearGradient id="hhSaalSeite" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dcbc"/><stop offset=".85" stop-color="#fbf7ec"/><stop offset="1" stop-color="#e3d3ad"/></linearGradient>
    <linearGradient id="hhSaalSeite2" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#e9dcbc"/><stop offset=".85" stop-color="#fbf7ec"/><stop offset="1" stop-color="#e3d3ad"/></linearGradient>
    <clipPath id="hhSaalBogen"><path d="M8 400V188C8 84 112 8 240 8s232 76 232 180v212z"/></clipPath>
  </defs>
  <g clip-path="url(#hhSaalBogen)">
    <rect width="480" height="400" fill="url(#hhSaalNacht)"/>
    <g class="hh-saal__sterne" fill="#ecc874">
      <path d="${sternPfad(70, 120, 5)}"/><path d="${sternPfad(410, 108, 4)}" opacity=".8"/><path d="${sternPfad(392, 196, 3)}" opacity=".7"/><path d="${sternPfad(96, 214, 3.4)}" opacity=".75"/><path d="${sternPfad(136, 70, 2.6)}" opacity=".6"/><path d="${sternPfad(352, 62, 3)}" opacity=".7"/>
    </g>
    <path class="hh-saal__licht" d="M168 252h144l118 148H50z" fill="url(#hhSaalLicht)"/>
    <path d="M160 254V134a80 80 0 0 1 160 0v120z" fill="url(#hhSaalGlut)"/>
    <g class="hh-saal__rosette" transform="translate(240 136)">
      <circle r="58" fill="none" stroke="#0b2c30" stroke-width="5"/>
      <g class="hh-saal__drehen">
        <circle r="50" fill="none" stroke="#0b2c30" stroke-width="1.6" stroke-dasharray="3 4"/>
        <g transform="scale(2.6)">${blaetter(1, "#0b2c30", 1.15)}</g>
      </g>
      <path d="M0 9c-1.8-2-9-5.6-9-11a4.6 4.6 0 0 1 9-1.9 4.6 4.6 0 0 1 9 1.9c0 5.4-7.2 9-9 11z" fill="#cf4a2c" stroke="#0b2c30" stroke-width="1.6"/>
    </g>
    <path d="M160 254V134a80 80 0 0 1 160 0v120z" fill="none" stroke="#c69a3e" stroke-width="5"/>
    <path d="M200 254v-46M240 254v-46M280 254v-46M160 208h160" stroke="#0b2c30" stroke-width="4"/>
    <path d="M0 330h480v70H0z" fill="#0a2a2e"/>
    <g stroke="#c69a3e" stroke-opacity=".35" stroke-width="1.2">
      <path d="M240 330 40 400M240 330 140 400M240 330v70M240 330l100 70M240 330l200 70M0 352h480M0 376h480"/>
    </g>
    <g class="hh-saal__pult">
      <path d="M150 340h180l-18 26H168z" fill="#2a1f14" stroke="#8a6420" stroke-width="1.5"/>
      <path d="M232 366h16v34h-16z" fill="#2a1f14"/>
      <path d="M240 336c-28-10-66-12-96-6l-6-30c32-6 72-4 102 8z" fill="url(#hhSaalSeite)" stroke="#8a6420" stroke-width="1.4"/>
      <path d="M240 336c28-10 66-12 96-6l6-30c-32-6-72-4-102 8z" fill="url(#hhSaalSeite2)" stroke="#8a6420" stroke-width="1.4"/>
      <path d="M240 308v28" stroke="#8a6420" stroke-width="1.6"/>
      <path d="M158 302l5 28" stroke="#cf4a2c" stroke-width="1.4" opacity=".8"/>
      <g stroke="#2b5f73" stroke-opacity=".35" stroke-width="1"><path d="M166 306c22-3 46-2 66 4M167 314c22-3 45-2 65 4M168 322c22-3 44-2 64 4"/><path d="M248 310c20-6 44-7 66-4M249 318c20-6 43-7 65-4M250 326c20-6 42-7 64-4"/></g>
      <path class="hh-saal__schrift" pathLength="1" d="M252 313c6-4 9 2 13-1s5-5 9-2 6 2 10-1 7-2 11-1 6 0 9-2M253 321c5-3 9 0 12-1s6-4 10-2 7 1 11-1" fill="none" stroke="#a8361d" stroke-width="1.6" stroke-linecap="round"/>
      <path d="${sternPfad(186, 314, 6)}" fill="#c69a3e"/>
      <g transform="rotate(-24 318 296)"><rect x="288" y="292" width="54" height="7" rx="3.5" fill="#0b2c30" stroke="#c69a3e" stroke-width="1.2"/><path d="M342 292l12 3.5-12 3.5z" fill="#c69a3e"/><path d="M354 295.5h2" stroke="#a8361d" stroke-width="2" stroke-linecap="round"/><rect x="296" y="292" width="3" height="7" fill="#c69a3e"/></g>
    </g>
    <rect class="hh-saal__glanz" x="-160" y="0" width="90" height="400" fill="#fff6dc" opacity=".12" transform="skewX(-16)"/>
  </g>
  <path d="M8 400V188C8 84 112 8 240 8s232 76 232 180v212" fill="none" stroke="#c69a3e" stroke-width="6"/>
  <path d="M20 400V190C20 94 118 20 240 20s220 74 220 170v210" fill="none" stroke="#ecc874" stroke-width="1.2" stroke-dasharray="2 5" opacity=".8"/>
</svg>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const erste = articles[0];
  const body = `
<section class="hh-start" aria-labelledby="hh-start-t">
  <div class="hh-start__innen">
    <div class="hh-start__text">
      <p class="hh-dachzeile">${esc(site.expansion)}</p>
      <h1 id="hh-start-t" class="hh-start__titel">Mutmachgeschichten vom Lernen, <em>mit Tipps, die wirklich helfen</em></h1>
      ${tinte("hh-start__strich")}
      <p class="hh-start__claim">${esc(site.tagline)}</p>
      <p class="hh-start__intro">Bei uns erzählen Schülerinnen und Schüler, Auszubildende und Studierende, wie sie über eine Hürde gekommen sind. Diese Menschen gibt es nicht wirklich, ihre Geschichten sind frei erfunden. Die Hürden aber kennen fast alle: der Berg vor der Prüfung, die Lücke in Mathe, das Herzklopfen vor dem Referat. Nach jeder Geschichte folgt ein Praxisteil, den du sofort ausprobieren kannst.</p>
      <p class="hh-start__knoepfe">${erste ? `<a class="hh-taste" href="${erste.url}">Neueste Geschichte lesen</a>` : ""}<a class="hh-taste hh-taste--rahmen" href="#hh-kapitel-t">Die sechs Kapitel</a></p>
    </div>
    <div class="hh-start__bild">${lesesaal()}</div>
  </div>
</section>

<section class="hh-weg" aria-labelledby="hh-weg-t">
  ${ueber("So ist jede Geschichte gebaut", "Erst zuhören, dann ausprobieren", "hh-weg-t", "hh-ueber--nacht")}
  <ol class="hh-weg__schritte">
    <li><span class="hh-weg__nr">1</span><h3>Eine erfundene Geschichte</h3><p>Eine Schülerin, ein Azubi oder eine Studentin steckt fest. Die Figuren sind ausgedacht, die Situationen kommen aus dem echten Schul-, Ausbildungs- und Hochschulalltag in Deutschland.</p></li>
    <li><span class="hh-weg__nr">2</span><h3>Was dahintersteckt</h3><p>Wir sehen genau hin: Warum hat es nicht geklappt, und was hat am Ende den Unterschied gemacht? Ohne erhobenen Zeigefinger und ohne Wunderformel.</p></li>
    <li><span class="hh-weg__nr">3</span><h3>Dein Praxisteil</h3><p>Lernpläne, Checklisten und kleine Übungen zum Mitnehmen. Und ein ehrlicher Hinweis, wann eine Lehrkraft, Beratungsstelle oder Fachperson weiterhelfen kann.</p></li>
  </ol>
</section>

<section class="hh-kapitel" aria-labelledby="hh-kapitel-t">
  ${ueber("Sechs Kapitel", "Wobei suchst du gerade Mut und Rat?", "hh-kapitel-t")}
  ${registerblaetter(ctx)}
</section>

<section class="hh-neu" aria-labelledby="hh-neu-t">
  ${ueber("Frisch aus dem Heft", "Neue Lerngeschichten", "hh-neu-t")}
  ${articles.length ? `<div class="hh-raster">${articles.slice(0, 9).map((a) => karte(ctx, a)).join("\n    ")}</div>` : `<p class="hh-leerhinweis">Die ersten Geschichten erscheinen in Kürze.</p>`}
</section>

<section class="hh-herz" aria-labelledby="hh-herz-t">
  <div class="hh-herz__innen">
    <div class="hh-herz__bild">${rosette("hh-herz__rosette")}</div>
    <div class="hh-herz__text">
      <p class="hh-ueber__zeile">Über ${esc(site.name)}</p>
      <h2 id="hh-herz-t">Ein hörendes Herz für alle, die lernen</h2>
      <p>In einer alten Erzählung (1 Kön 3,9) wünscht sich der junge König Salomo kein Gold und keinen Ruhm, sondern ein <strong>hörendes Herz</strong>, um zu verstehen. Genau damit fängt gutes Lernen an: hinhören, was dich blockiert, was dir fehlt und was dir guttut.</p>
      <p>${esc(site.name)} steht für <strong>Qu</strong>elle des <strong>Le</strong>r<strong>n</strong>ens. Wir schreiben für Schülerinnen und Schüler, Auszubildende, Studierende und alle, die sie begleiten. Unsere Geschichten sind Fiktion und als solche gekennzeichnet; unsere Tipps sind sorgfältig recherchiert, ohne Wunderversprechen und ohne Diagnosen.</p>
      <p class="hh-herz__links"><a class="hh-taste hh-taste--gold" href="/ueber-uns/">Mehr über uns</a><a class="hh-taste hh-taste--hell" href="/redaktionsgrundsaetze/">So schreiben wir</a></p>
    </div>
  </div>
</section>

${articles.length ? `<section class="hh-verzeichnis" aria-labelledby="hh-verz-t">
  ${ueber("Alles auf einen Blick", "Alle Lerngeschichten im Register", "hh-verz-t")}
  <div class="hh-verzeichnis__spalten">
    ${categories
      .filter((c) => c.articles.length)
      .map((c) => `<section style="--hh-farbe:${farbe(ctx, c)}"><h3><a href="${c.url}">${icon(c.icon, "hh-verzeichnis__icon")}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`)
      .join("\n    ")}
  </div>
</section>` : ""}`;
  return layout(ctx, { title: `${site.name}: ${site.expansion}. Mutmachgeschichten und Lerntipps`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site, categories } = ctx;
  const nr = categories.findIndex((x) => x.slug === c.slug) + 1;
  const andere = categories.filter((x) => x.slug !== c.slug);
  const body = `
<header class="hh-kapitelkopf" style="--hh-farbe:${farbe(ctx, c)}">
  <div class="hh-kapitelkopf__innen">
    <nav class="hh-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li aria-current="page">${esc(c.name)}</li></ol></nav>
    <p class="hh-kapitelkopf__nr"><span class="hh-kapitelkopf__icon">${icon(c.icon)}</span>Kapitel ${nr} von ${categories.length}</p>
    <h1>${esc(c.name)}</h1>
    ${tinte("hh-kapitelkopf__strich")}
    <p class="hh-kapitelkopf__text">${esc(c.description)}</p>
    <p class="hh-kapitelkopf__zahl">${c.articles.length === 1 ? "1 Geschichte" : `${c.articles.length} Geschichten`} mit Praxisteil · alle Geschichten frei erfunden</p>
  </div>
</header>
<section class="hh-neu hh-neu--kapitel" aria-label="Geschichten in diesem Kapitel">
  ${c.articles.length ? `<div class="hh-raster">${c.articles.map((a) => karte(ctx, a)).join("\n  ")}</div>` : `<p class="hh-leerhinweis">Die ersten Geschichten in diesem Kapitel erscheinen in Kürze.</p>`}
</section>
<nav class="hh-andere" aria-labelledby="hh-andere-t">
  <h2 id="hh-andere-t" class="hh-andere__titel">Weitere Kapitel</h2>
  <ul>${andere.map((x) => `<li><a href="${x.url}" style="--hh-farbe:${farbe(ctx, x)}">${icon(x.icon, "hh-andere__icon")}<span>${esc(x.name)}</span></a></li>`).join("")}</ul>
</nav>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Lerngeschichten und Tipps`,
      description: `${c.description}`.slice(0, 200),
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
        },
      ],
    },
    body,
    "kapitel"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const aktualisiert = a.updated && a.updated !== a.date;
  const body = `
<article class="hh-geschichte" style="--hh-farbe:${farbe(ctx, a.cat)}">
  <header class="hh-geschichte__kopf">
    <nav class="hh-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li><a href="${a.cat.url}">${esc(a.cat.name)}</a></li><li aria-current="page">${esc(a.title)}</li></ol></nav>
    <p class="hh-geschichte__art"><span class="hh-siegel">${stern("hh-siegel__stern")}Erfundene Geschichte</span><span class="hh-geschichte__plus">mit Praxisteil</span></p>
    <h1 class="hh-geschichte__titel">${esc(a.title)}</h1>
    ${tinte("hh-geschichte__strich")}
    <p class="hh-geschichte__intro">${esc(a.description)}</p>
    <ul class="hh-geschichte__meta">
      <li><a href="${a.cat.url}">${icon(a.cat.icon, "hh-geschichte__icon")}${esc(a.cat.name)}</a></li>
      <li><time datetime="${a.date}">${a.dateLabel}</time>${aktualisiert ? `, aktualisiert am <time datetime="${a.updated}">${a.updatedLabel}</time>` : ""}</li>
      <li>${a.minutes} Min. Lesezeit</li>
      <li>Von der ${esc(site.author)}</li>
    </ul>
  </header>
  <div class="hh-geschichte__raster${toc.length > 1 ? "" : " hh-geschichte__raster--eins"}">
    ${toc.length > 1 ? `<aside class="hh-inhalt" aria-label="Inhaltsverzeichnis">
      <details class="hh-inhalt__klappe" open>
        <summary>Inhalt <span class="hh-inhalt__zahl">${toc.length} Abschnitte</span></summary>
        <ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>
      </details>
    </aside>` : ""}
    <div class="hh-heft">
      <aside class="hh-fiktion" aria-label="Hinweis zur Geschichte"><p><strong>Frei erfunden:</strong> Die Geschichte in diesem Beitrag ist ausgedacht. Personen, Namen, Schulen, Betriebe und Orte sind fiktiv, Ähnlichkeiten mit echten Menschen wären Zufall. Der Praxisteil sammelt erprobte Lernstrategien und ersetzt keine persönliche Beratung.</p></aside>
      <div class="hh-text">
${a.html}
      </div>
      <aside class="hh-hilfe" aria-label="Wenn es schwer bleibt">
        <p class="hh-hilfe__titel">${icon("herz", "hh-hilfe__icon")}Wenn es schwer bleibt</p>
        <p>Lernschwierigkeiten haben viele Ursachen. Wenn Probleme über Wochen anhalten, Angst deinen Alltag bestimmt oder du dich dauerhaft erschöpft fühlst, sprich mit einer Vertrauensperson: einer Lehrkraft, der Schulsozialarbeit, der Ausbildungsberatung deiner Kammer oder der psychologischen Beratung deiner Hochschule. Ob zum Beispiel eine Lese-Rechtschreib-Schwäche, eine Rechenstörung oder ADHS dahintersteckt, kann nur eine Fachperson klären. Anlaufstellen findest du unter <a href="/hilfe-und-beratung/">Hilfe &amp; Beratung</a>.</p>
      </aside>
    </div>
  </div>
</article>
${a.related.length ? `<section class="hh-neu hh-neu--weiter" aria-labelledby="hh-weiter-t">
  ${ueber("Weiterlesen", "Passende Lerngeschichten", "hh-weiter-t")}
  <div class="hh-raster">${a.related.map((r) => karte(ctx, r)).join("")}</div>
</section>` : ""}
<nav class="hh-andere" aria-labelledby="hh-alle-t">
  <h2 id="hh-alle-t" class="hh-andere__titel">Alle Kapitel</h2>
  <ul>${ctx.categories.map((x) => `<li><a href="${x.url}" style="--hh-farbe:${farbe(ctx, x)}"${x.slug === a.cat.slug ? ' aria-current="true"' : ""}>${icon(x.icon, "hh-andere__icon")}<span>${esc(x.name)}</span></a></li>`).join("")}</ul>
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
          genre: "Fiktive Lerngeschichte mit Praxisteil",
          image: `${base}/og.svg`,
          author: { "@type": "Organization", name: site.author, url: `${base}/ueber-uns/` },
          publisher: { "@id": `${base}/#org` },
          mainEntityOfPage: `${base}${a.url}`,
        },
      ],
    },
    body,
    "geschichte",
    a.cat.url
  );
}

export function page(ctx, p) {
  const { esc, base, site } = ctx;
  const art = { "ueber-uns": "AboutPage", kontakt: "ContactPage" }[p.slug] || "WebPage";
  const body = `
<article class="hh-geschichte hh-geschichte--seite">
  <header class="hh-geschichte__kopf">
    <nav class="hh-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li aria-current="page">${esc(p.title)}</li></ol></nav>
    <h1 class="hh-geschichte__titel">${esc(p.title)}</h1>
    ${tinte("hh-geschichte__strich")}
    ${p.description ? `<p class="hh-geschichte__intro">${esc(p.description)}</p>` : ""}
    ${p.updated ? `<p class="hh-geschichte__stand">Stand: <time datetime="${p.updated}">${ctx.fmtDate(p.updated)}</time></p>` : ""}
  </header>
  <div class="hh-geschichte__raster hh-geschichte__raster--eins">
    <div class="hh-heft"><div class="hh-text">
${p.html}
    </div></div>
  </div>
</article>`;
  return layout(
    ctx,
    {
      title: p.title,
      description: p.description || site.description,
      path: p.url,
      jsonld: [
        ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }]),
        { "@type": art, name: p.title, url: `${base}${p.url}`, inLanguage: site.lang, isPartOf: { "@id": `${base}/#site` } },
      ],
    },
    body,
    "seite"
  );
}

export function notFound(ctx) {
  const body = `
<section class="hh-leer" aria-labelledby="hh-leer-t">
  <p class="hh-leer__code" aria-hidden="true">4<span>${stern("hh-leer__stern")}</span>4</p>
  <h1 id="hh-leer-t">Diese Seite steht in keinem unserer Hefte</h1>
  ${tinte("hh-leer__strich")}
  <p>Vielleicht war der Link veraltet oder hatte einen Tippfehler. Kein Grund zur Sorge: Fehler sind hier ausdrücklich erlaubt. Such dir einfach ein Kapitel aus oder geh zur <a href="/">Startseite</a>.</p>
  ${registerblaetter(ctx, { mitText: false, h: "h2" })}
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es bei QULEN nicht. Hier geht es zu den sechs Kapiteln der Lerngeschichten.", path: "/404.html", noindex: true }, body, "leer");
}
