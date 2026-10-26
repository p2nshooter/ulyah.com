// ZOEVIAN — "Der Zedernhof".
//
// Of Solomon it is said that "he spoke of trees, from the cedar of Lebanon to
// the hyssop that grows out of the wall; he spoke also of beasts and of birds"
// (1 Kön 5:13). ZOEVIAN is that courtyard: a palace garden wall of ivory stone
// with a pointed lattice window, a cedar on one side, hyssop in the joints, and
// at dawn a small flight of birds crossing a lapis sky that warms to apricot.
// No people, only stone, trees, light and birds. Every class here (zedern-,
// feder-, flug-) is ZOEVIAN's own.

const ICONS = {
  sparrow: `<path d="M8 30c4-9 12-14 21-13l7-5 2 6c3 2 4 6 3 10-3 7-11 10-20 9l-6 6-1-6c-3-1-5-3-6-7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="33" cy="20" r="1.6" fill="currentColor"/><path d="M38 21l5-1-4 3" fill="currentColor"/><path d="M18 27c4 1 8 0 11-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  feeder: `<path d="M8 18L24 7l16 11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M13 18v18h22V18" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10 36h28" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><g fill="currentColor"><circle cx="19" cy="33" r="1.6"/><circle cx="24" cy="32" r="1.6"/><circle cx="29" cy="33" r="1.6"/><circle cx="22" cy="29" r="1.4"/><circle cx="27" cy="29" r="1.4"/></g><path d="M24 36v6" stroke="currentColor" stroke-width="2.2"/>`,
  nest: `<path d="M10 20L24 9l14 11v20H10z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="25" r="4.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M24 33v4M20 37h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  feather: `<path d="M38 8C22 10 12 22 11 38l4-4c2-10 9-18 19-22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M38 8c1 12-6 24-20 27M17 30l8-1M20 24l9-2M24 18l9-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 38l-3 3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  lens: `<circle cx="15" cy="30" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="33" cy="30" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M21 24l3-12h0l3 12M23 30h2M12 22l3-9h4M36 22l-3-9h-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`,
  perch: `<path d="M24 6v4M12 42V22a12 12 0 0 1 24 0v20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18 42V22M24 42V14M30 42V22" stroke="currentColor" stroke-width="1.4" opacity=".7"/><path d="M10 34h28M8 42h32" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M20 33c1-4 4-6 7-5l3-2 0 3c1 2 0 4-2 4z" fill="currentColor"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.feather}</svg>`;

/** A bird in flight: two wing arcs that beat (the wing group scales in Y). */
const bird = (x, y, s, cls = "", delay = 0) => `<g class="flug-vogel ${cls}" style="--d:${delay}s" transform="translate(${x} ${y}) scale(${s})">
  <g class="flug-vogel__schwinge"><path d="M-22 0c8-9 15-9 22 2 7-11 14-11 22-2-9-2-15 1-19 7l-3 4-3-4c-4-6-10-9-19-7z"/></g>
</g>`;

/** A cedar of Lebanon: tiers of flat, layered branches on one trunk. */
const cedar = (x, base, h) => {
  const tiers = Array.from({ length: 5 }, (_, i) => {
    const y = base - h * (0.28 + i * 0.15);
    const w = h * (0.62 - i * 0.1);
    return `<path d="M${x - w} ${y.toFixed(1)}c${(w * 0.4).toFixed(1)} -${(h * 0.07).toFixed(1)} ${(w * 1.6).toFixed(1)} -${(h * 0.07).toFixed(1)} ${(w * 2).toFixed(1)} 0c-${(w * 0.6).toFixed(1)} ${(h * 0.035).toFixed(1)} -${(w * 1.4).toFixed(1)} ${(h * 0.035).toFixed(1)} -${(w * 2).toFixed(1)} 0z"/>`;
  }).join("");
  return `<g class="flug-zeder"><path d="M${x - 5} ${base}l3-${h * 0.85}h4l3 ${h * 0.85}z" fill="#3b2b1c"/><g fill="#2f4d34">${tiers}</g></g>`;
};

/** Spain, 2026 world champions — a red-gold feather drifting along a ribbon. */
const champions = () => `<aside class="zedern-meister" role="note" aria-label="Spanien, Weltmeister 2026">
  <span class="zedern-meister__feder" aria-hidden="true">
    <svg viewBox="0 0 40 40" width="28" height="28" focusable="false">
      <path d="M33 5C19 7 10 18 9 33c8-1 18-8 22-18" fill="#c60b1e"/>
      <path d="M33 5c-4 9-11 19-24 28" fill="none" stroke="#ffc400" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M17 24l7-1M20 19l7-2" stroke="#ffc400" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  </span>
  <p><strong>Spanien</strong> ist Fußball-Weltmeister <em>2026</em> <span class="zedern-meister__aside">· ein Gruß aus dem Zedernhof</span></p>
  <span class="zedern-meister__band" aria-hidden="true"></span>
</aside>`;

/**
 * The hero: an ivory palace wall with a pointed lattice window, a cedar on
 * the left, hyssop in the wall joints, the sun rising behind the window and a
 * small flight of birds crossing from right to left.
 */
const courtyard = () => `<svg class="flug-szene" viewBox="0 0 640 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="flugHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16244a"/><stop offset=".5" stop-color="#2c4683"/><stop offset=".82" stop-color="#d98f6a"/><stop offset="1" stop-color="#f6d3a0"/></linearGradient>
    <radialGradient id="flugSonne"><stop offset="0" stop-color="#fff6df"/><stop offset=".55" stop-color="#f6c98a"/><stop offset="1" stop-color="#f6c98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="flugGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc9a"/><stop offset=".55" stop-color="#c9a24a"/><stop offset="1" stop-color="#8a6420"/></linearGradient>
    <pattern id="flugGitter" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M11 0l11 11-11 11L0 11z" fill="none" stroke="#c9a24a" stroke-width="1.6"/><circle cx="11" cy="11" r="2" fill="#c9a24a"/></pattern>
    <clipPath id="flugFenster"><path d="M250 400V206c0-62 36-104 70-122 34 18 70 60 70 122v194z"/></clipPath>
  </defs>
  <rect width="640" height="440" fill="url(#flugHimmel)"/>
  <g class="flug-sterne" fill="#eef0f7">${Array.from({ length: 22 }, (_, i) => `<circle cx="${(i * 97) % 640}" cy="${12 + ((i * 53) % 150)}" r="${i % 3 === 0 ? 1.6 : 1}" style="--d:${(i % 7) * 0.4}s"/>`).join("")}</g>
  <circle class="flug-sonne" cx="320" cy="300" r="92" fill="url(#flugSonne)"/>
  <path d="M0 330c120-26 220-30 320-14s200 18 320-10v134H0z" fill="#3e6a46" opacity=".55"/>
  <g class="flug-mauer">
    <path d="M150 440V214h340v226z" fill="#f4ecdc"/>
    <path d="M150 214h340" stroke="url(#flugGold)" stroke-width="6"/>
    <g stroke="#d8ccb3" stroke-width="1.2">${Array.from({ length: 8 }, (_, r) => `<path d="M150 ${238 + r * 26}h340"/>` + Array.from({ length: 6 }, (_, c) => `<path d="M${168 + c * 62 + (r % 2) * 31} ${214 + r * 26 + 2}v24"/>`).join("")).join("")}</g>
    <path d="M238 440V202c0-70 42-116 82-136 40 20 82 66 82 136v238z" fill="#e9dcc2"/>
    <g clip-path="url(#flugFenster)"><rect x="240" y="60" width="160" height="380" fill="url(#flugHimmel)"/><circle class="flug-sonne flug-sonne--innen" cx="320" cy="300" r="70" fill="url(#flugSonne)"/><rect x="240" y="60" width="160" height="380" fill="url(#flugGitter)" opacity=".85"/></g>
    <path d="M250 400V206c0-62 36-104 70-122 34 18 70 60 70 122v194" fill="none" stroke="url(#flugGold)" stroke-width="5"/>
    <g class="flug-ysop" fill="#5d8b59">${[[176, 262], [452, 314], [206, 366], [470, 236]].map(([x, y], i) => `<path style="--d:${i * 0.6}s" d="M${x} ${y}c-2-8 0-14 4-18 0 6 2 11 0 18zm4 0c2-7 6-11 11-12-2 6-5 10-11 12zm-4 0c-5-3-8-7-8-12 5 2 8 6 8 12z"/>`).join("")}</g>
  </g>
  ${cedar(78, 440, 330)}
  ${cedar(590, 440, 220)}
  <g class="flug-schwarm" fill="#e58a33">
    ${bird(560, 120, 1.25, "", 0)}
    ${bird(612, 92, 0.9, "", 0.25)}
    ${bird(520, 72, 0.8, "", 0.5)}
    ${bird(470, 140, 0.65, "flug-vogel--fern", 0.15)}
  </g>
  <g transform="translate(452 214)"><g class="flug-wiedehopf">
    <g class="flug-wiedehopf__haube" stroke-linecap="round" fill="none">
      <g stroke="#d9822b" stroke-width="3.2"><path d="M4 -10L-7.300000000000001 -16.5"/><path d="M4 -10L-3.5 -20.6"/><path d="M4 -10L1.7000000000000002 -22.8"/><path d="M4 -10L7.4 -22.6"/><path d="M4 -10L12.4 -20.0"/></g>
      <g stroke="#1f2433" stroke-width="3.4" stroke-dasharray="0 10 3 20"><path d="M4 -10L-7.300000000000001 -16.5"/><path d="M4 -10L-3.5 -20.6"/><path d="M4 -10L1.7000000000000002 -22.8"/><path d="M4 -10L7.4 -22.6"/><path d="M4 -10L12.4 -20.0"/></g>
    </g>
    <ellipse cx="-4" cy="-2" rx="17" ry="8" fill="#d9822b"/>
    <circle cx="7" cy="-8" r="6.5" fill="#d9822b"/>
    <path d="M-20-5c6-2 14-2 20 1l-4 7c-6 1-12 0-18-2z" fill="#1f2433"/>
    <path d="M-18-3h14M-17 1h12" stroke="#f4ecdc" stroke-width="1.6" stroke-dasharray="3 3"/>
    <path d="M12-8l18 5-18-1z" fill="#3b2b1c"/><circle cx="9" cy="-9" r="1.3" fill="#1f2433"/>
    <path d="M-7 5v6M-1 5v6" stroke="#3b2b1c" stroke-width="1.8"/>
  </g></g>
</svg>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="zedern zedern--${kind}">
<a class="zedern-sprung" href="#main">Zum Inhalt springen</a>
<div class="zedern-flugbahn" aria-hidden="true"><span><i></i></span></div>
${champions()}
<header class="zedern-kopf">
  <div class="zedern-kopf__in">
    <a class="zedern-marke" href="/" aria-label="${esc(site.name)} – Startseite">
      <span class="zedern-marke__bogen" aria-hidden="true"><svg viewBox="0 0 44 44" width="40" height="40"><path d="M8 42V20a14 15 0 0 1 28 0v22" fill="none" stroke="currentColor" stroke-width="2.6"/><path class="zedern-marke__vogel" d="M11 23c4-4 7-4 10 1 3-5 6-5 10-1-3 0-6 1-8 4l-2 3-2-3c-2-3-5-4-8-4z" fill="#e58a33"/></svg></span>
      <span class="zedern-marke__wort">ZOEVIAN</span>
      <span class="zedern-marke__lang">${esc(site.expansion)}</span>
    </a>
    <button class="zedern-schalter" type="button" aria-expanded="false" aria-controls="zedern-nav">Themen <span class="zedern-schalter__fluegel" aria-hidden="true"><i></i><i></i></span></button>
  </div>
  <nav id="zedern-nav" class="zedern-nav" aria-label="Themen">
    <div class="zedern-nav__in">
      <a class="zedern-nav__item" href="/"><span class="zedern-nav__feder" aria-hidden="true"></span>Start</a>
      ${categories.map((c) => `<a class="zedern-nav__item" href="${c.url}"><span class="zedern-nav__feder" aria-hidden="true"></span>${esc(c.name)}</a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="zedern-nav__item zedern-nav__item--leise" href="${m.href}"${m.promo ? " data-promo" : ""}>${esc(m.label)}</a>`).join("\n      ")}
    </div>
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="zedern-fuss">
  <svg class="zedern-fuss__zinnen" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 40V22${Array.from({ length: 24 }, (_, i) => `h25v-12a10 12 0 0 1 25 0v12`).join("")}V40z" fill="currentColor"/></svg>
  <div class="zedern-fuss__in">
    <section class="zedern-fuss__marke">
      <p class="zedern-fuss__wort">ZOEVIAN</p>
      <p class="zedern-fuss__lang">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen">
      <p class="zedern-fuss__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Über ZOEVIAN">
      <p class="zedern-fuss__titel">Das Haus</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="zedern-fuss__hinweis">© ${new Date().getFullYear()} ZOEVIAN · ${esc(site.domain)} · Allgemeine Informationen über Vögel und Vogelschutz. Für verletzte oder kranke Wildvögel sind Wildvogelstationen und Tierärzte zuständig, für Ziervögel eine vogelkundige Tierarztpraxis.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A feather card: an arched top like a window, topic, title, summary, time. */
const karte = (ctx, a, extra = "") => `<article class="feder-karte ${extra}">
  <a class="feder-karte__link" href="${a.url}">
    <span class="feder-karte__thema">${icon(a.cat.icon, "feder-karte__icon")}${ctx.esc(a.cat.name)}</span>
    <h3 class="feder-karte__titel">${ctx.esc(a.title)}</h3>
    <p class="feder-karte__text">${ctx.esc(a.description)}</p>
    <span class="feder-karte__fuss">${a.minutes} Min. Lesezeit <span class="feder-karte__flug" aria-hidden="true"><svg viewBox="-24 -12 48 24" width="26" height="13"><path d="M-22 0c8-9 15-9 22 2 7-11 14-11 22-2-9-2-15 1-19 7l-3 4-3-4c-4-6-10-9-19-7z" fill="currentColor"/></svg></span></span>
  </a>
</article>`;

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="zedern-held">
  <figure class="zedern-held__bild">${courtyard()}</figure>
  <div class="zedern-held__text">
    <p class="zedern-held__dach">Der Vogelratgeber für Garten, Balkon und Natur</p>
    <h1 class="zedern-held__titel">Vögel <em>erkennen</em>, richtig füttern, gut beherbergen</h1>
    <p class="zedern-held__lead">${esc(site.tagline)}.</p>
    <p class="zedern-held__intro">${esc(site.description)}</p>
    <p class="zedern-held__knoepfe">${first ? `<a class="zedern-knopf" href="${first.url}">Jetzt lesen</a>` : ""}<a class="zedern-knopf zedern-knopf--hohl" href="/ueber-uns/">Wer wir sind</a></p>
  </div>
</section>

${first ? `<section class="zedern-auswahl" aria-label="Empfohlen">
  ${karte(ctx, first, "feder-karte--gross")}
  ${[second, third].filter(Boolean).map((a) => karte(ctx, a)).join("")}
</section>` : `<p class="zedern-bald">Die ersten Ratgeber entstehen gerade von Hand. Schau bald wieder vorbei.</p>`}

<section class="zedern-themen" aria-labelledby="th-t">
  <header class="zedern-ueber"><p class="zedern-ueber__dach">Sechs Themen</p><h2 id="th-t">Wo möchtest du heute landen?</h2></header>
  <ul class="zedern-themen__reihe">
    ${categories.map((c, i) => `<li><a class="zedern-thema" href="${c.url}">
      <span class="zedern-thema__bogen">${icon(c.icon)}</span>
      <span class="zedern-thema__nr">${["I", "II", "III", "IV", "V", "VI"][i] || i + 1}</span>
      <span class="zedern-thema__name">${esc(c.name)}</span>
      <span class="zedern-thema__text">${esc(c.description)}</span>
      <span class="zedern-thema__zahl">${c.articles.length} Ratgeber</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${rest.length ? `<section class="zedern-neu" aria-labelledby="neu-t">
  <header class="zedern-ueber"><p class="zedern-ueber__dach">Frisch geschlüpft</p><h2 id="neu-t">Neueste Ratgeber</h2></header>
  <div class="zedern-neu__raster">${rest.slice(0, 12).map((a) => karte(ctx, a)).join("\n    ")}</div>
</section>` : ""}

<section class="zedern-archiv" aria-labelledby="ar-t">
  <header class="zedern-ueber zedern-ueber--nacht"><p class="zedern-ueber__dach">Die ganze Bibliothek</p><h2 id="ar-t">Alle Ratgeber nach Thema</h2></header>
  <div class="zedern-archiv__gitter">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon)}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `ZOEVIAN – ${site.tagline}`, description: site.description, path: "/" }, body, "start");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="zedern-themakopf">
  <nav class="zedern-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
  <span class="zedern-themakopf__bogen">${icon(c.icon)}</span>
  <h1>${esc(c.name)}</h1>
  <p>${esc(c.description)}</p>
  <p class="zedern-themakopf__zahl">${c.articles.length} Ratgeber in diesem Thema</p>
</header>
<section class="zedern-neu zedern-neu--thema"><div class="zedern-neu__raster">
  ${c.articles.map((a) => karte(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Ratgeber über Vögel`,
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
<article class="zedern-beitrag">
  <header class="zedern-beitrag__kopf">
    <nav class="zedern-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <p class="zedern-beitrag__thema">${icon(a.cat.icon)}${esc(a.cat.name)}</p>
    <h1 class="zedern-beitrag__titel">${esc(a.title)}</h1>
    <p class="zedern-beitrag__lead">${esc(a.description)}</p>
    <p class="zedern-beitrag__meta">Von der ${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} Min. Lesezeit</p>
  </header>
  <div class="zedern-beitrag__koerper">
    ${toc.length > 2 ? `<nav class="zedern-inhalt" aria-label="In diesem Ratgeber"><p class="zedern-inhalt__titel">In diesem Ratgeber</p><ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol></nav>` : ""}
    <div class="zedern-text">
${a.html}
      <aside class="zedern-hinweis"><p><strong>Rücksicht zuerst.</strong> ZOEVIAN gibt allgemeine Hinweise. Wildvögel und ihre Nester sind gesetzlich geschützt: Halte Abstand zu brütenden Vögeln, störe keine Nester und fasse Jungvögel nur an, wenn sie in unmittelbarer Gefahr sind. Einen verletzten Wildvogel bringst du zu einer Wildvogelstation oder Tierarztpraxis, einen kranken Ziervogel zu einer vogelkundigen Tierärztin oder einem vogelkundigen Tierarzt.</p></aside>
    </div>
  </div>
</article>
<section class="zedern-neu zedern-neu--weiter" aria-labelledby="mehr-t">
  <header class="zedern-ueber"><p class="zedern-ueber__dach">Weiterfliegen</p><h2 id="mehr-t">Das könnte dich auch interessieren</h2></header>
  <div class="zedern-neu__raster">${a.related.map((r) => karte(ctx, r)).join("")}</div>
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
<article class="zedern-beitrag zedern-beitrag--seite">
  <header class="zedern-beitrag__kopf">
    <nav class="zedern-pfad" aria-label="Brotkrumen"><a href="/">Start</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="zedern-beitrag__titel">${esc(p.title)}</h1>
    ${p.updated ? `<p class="zedern-beitrag__meta">Zuletzt geprüft am ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="zedern-beitrag__koerper zedern-beitrag__koerper--eins"><div class="zedern-text">
${p.html}
  </div></div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] }, body, "seite");
}

export function notFound(ctx) {
  const body = `
<section class="zedern-verloren">
  <p class="zedern-verloren__code">404</p>
  <h1>Dieser Vogel ist ausgeflogen</h1>
  <p>Die gesuchte Seite gibt es nicht (mehr). Vielleicht findest du in einem unserer Themen, was du suchst:</p>
  <ul class="zedern-themen__reihe">${ctx.categories.map((c) => `<li><a class="zedern-thema" href="${c.url}"><span class="zedern-thema__bogen">${icon(c.icon)}</span><span class="zedern-thema__name">${ctx.esc(c.name)}</span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: "Die gesuchte Seite gibt es auf ZOEVIAN nicht.", path: "/404.html", noindex: true }, body, "verloren");
}
