// ODAILY — "The lamp that does not go out".
//
// "She rises while it is still night and provides food for her household …
// her lamp does not go out at night" (Proverbs 31:15, 18). ODAILY is that
// kitchen in the last hour before dawn: a plaster wall warmed by the bread
// oven, a clay lamp burning steadily on the shelf, herbs and garlic hanging
// beneath it, loaves cooling on a board, a pot breathing steam, and through
// the arched window the morning star in a sky turning from indigo to saffron.
// No people, only bread, fire, clay and light. Every class here (hearth-,
// loaf-, ember-) is ODAILY's own.

const ICONS = {
  knife: `<path d="M6 34L30 10c3-3 8-3 10 0L14 36z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 36l-4 6-4-2 2-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 26l6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  pan: `<ellipse cx="20" cy="26" rx="15" ry="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M5 26v3c0 4 7 7 15 7s15-3 15-7v-3M35 26h9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M14 16c0-3 3-3 3-6M22 16c0-3 3-3 3-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  planner: `<rect x="7" y="9" width="34" height="31" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M7 17h34M15 5v8M33 5v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M14 25h5M23 25h5M32 25h3M14 32h5M23 32h5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  loaf: `<path d="M6 30c0-10 8-16 18-16s18 6 18 16v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 22l4 6M23 20l3 7M31 22l3 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  flask: `<path d="M19 6h10M21 6v12L9 38a3 3 0 0 0 3 4h24a3 3 0 0 0 3-4L27 18V6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M13 31h22" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="36" r="1.8" fill="currentColor"/><circle cx="27" cy="34" r="1.4" fill="currentColor"/>`,
  jar: `<path d="M15 6h18v6H15z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 12h22c2 0 3 2 3 4v22a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V16c0-2 1-4 3-4z" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="15" y="22" width="18" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.loaf}</svg>`;

/** A round loaf on the board, scored three times across the top. */
const loaf = (x, y, r) => `<g transform="translate(${x} ${y})">
  <ellipse cx="0" cy="${r * 0.18}" rx="${r * 1.08}" ry="${r * 0.32}" fill="#5a3418" opacity=".35"/>
  <path d="M${-r} 0a${r} ${r * 0.72} 0 0 1 ${2 * r} 0z" fill="url(#emberKruste)"/>
  <path d="M${-r * 0.5} ${-r * 0.42}q${r * 0.22} ${-r * 0.1} ${r * 0.34} ${r * 0.08}M${-r * 0.12} ${-r * 0.58}q${r * 0.22} ${-r * 0.1} ${r * 0.34} ${r * 0.08}M${r * 0.28} ${-r * 0.44}q${r * 0.22} ${-r * 0.1} ${r * 0.34} ${r * 0.08}" stroke="#f6dcae" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</g>`;

/**
 * The hero: the kitchen an hour before dawn. Arched window with the morning
 * star, a shelf with a steadily burning clay lamp, jars, hanging herbs and
 * garlic, the beehive bread oven glowing on the right, loaves on a board and
 * a pot breathing steam on the table.
 */
const kitchen = () => `<svg class="ember-szene" viewBox="0 0 640 400" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="emberWand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e7d6b6"/><stop offset=".7" stop-color="#f0dfbf"/><stop offset="1" stop-color="#f6d3a2"/></linearGradient>
    <radialGradient id="emberSchein" gradientUnits="userSpaceOnUse" cx="530" cy="290" r="300"><stop offset="0" stop-color="#ffb35c" stop-opacity=".55"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
    <linearGradient id="emberHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2347"/><stop offset=".55" stop-color="#5b3c66"/><stop offset=".82" stop-color="#d9826a"/><stop offset="1" stop-color="#f3b860"/></linearGradient>
    <linearGradient id="emberKruste" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d89a52"/><stop offset=".6" stop-color="#b2682c"/><stop offset="1" stop-color="#7a4520"/></linearGradient>
    <linearGradient id="emberLehm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d0794a"/><stop offset="1" stop-color="#9a4a26"/></linearGradient>
    <radialGradient id="emberGlut"><stop offset="0" stop-color="#fff2b8"/><stop offset=".45" stop-color="#ffb13d"/><stop offset="1" stop-color="#b8381a"/></radialGradient>
    <linearGradient id="emberHolz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a32"/><stop offset="1" stop-color="#5e3a1d"/></linearGradient>
    <clipPath id="emberFenster"><path d="M70 230V120a60 60 0 0 1 120 0v110z"/></clipPath>
  </defs>
  <rect x="-480" y="0" width="1600" height="336" fill="url(#emberSchein)" class="ember-schein"/>
  <g clip-path="url(#emberFenster)">
    <rect x="60" y="50" width="140" height="190" fill="url(#emberHimmel)"/>
    <rect class="ember-daemmerung" x="60" y="50" width="140" height="190" fill="#f6c46b"/>
    <g fill="#fff5dc">${[[92, 92, 1.4], [150, 80, 1], [120, 120, 0.9], [170, 110, 1.2], [100, 140, 0.8]].map(([x, y, r], i) => `<circle class="ember-stern" style="--d:${i * 0.6}s" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
    <g class="ember-morgenstern"><circle cx="132" cy="104" r="3.2" fill="#fff8e4"/><path d="M132 96v16M124 104h16" stroke="#fff8e4" stroke-width=".9" opacity=".8"/></g>
    <path d="M60 222c30-12 60-16 90-10s40 6 50 2v28H60z" fill="#3d3a2a" opacity=".7"/>
  </g>
  <path d="M70 230V120a60 60 0 0 1 120 0v110" fill="none" stroke="#7a4a25" stroke-width="7"/>
  <path d="M130 62v168M70 160h120" stroke="#7a4a25" stroke-width="3"/>
  <path d="M62 232h136" stroke="#6b4020" stroke-width="8" stroke-linecap="round"/>
  <g class="ember-regal">
    <path d="M300 118h300" stroke="#7a4a25" stroke-width="10" stroke-linecap="round"/>
    <path d="M318 123v14M582 123v14" stroke="#5e3a1d" stroke-width="5"/>
    <g transform="translate(350 113)">
      <path d="M-22 0c4-12 40-12 44 0 0 6-10 8-22 8S-22 6-22 0z" fill="url(#emberLehm)"/>
      <path d="M18 -4c8-2 12-6 12-12" stroke="#9a4a26" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g class="ember-flamme"><path d="M30 -18c-6-8-2-16 2-22 3 8 8 12 4 20-1 2-4 3-6 2z" fill="#ffb13d"/><path d="M31 -20c-2-5 0-9 2-12 1 4 3 7 1 11z" fill="#fff2b8"/></g>
    </g>
    <circle cx="380" cy="64" r="60" fill="#ffcf7a" fill-opacity=".18" class="ember-lampenschein"/>
    <g transform="translate(430 113)"><path d="M-14 0v-30a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v30z" fill="#6f8a5a"/><path d="M-16 -38h32v6h-32z" fill="#4f6640"/><rect x="-9" y="-24" width="18" height="12" rx="2" fill="#f4ead3"/></g>
    <g transform="translate(476 113)"><path d="M-12 0v-24a12 10 0 0 1 24 0v24z" fill="#c9a24a"/><path d="M-13 -30h26v6h-26z" fill="#8a6420"/></g>
    <g transform="translate(530 113)"><path d="M-16 0v-40a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v40z" fill="#d6c4a0"/><path d="M-18 -50h36v7h-36z" fill="#7a4a25"/><rect x="-10" y="-30" width="20" height="14" rx="2" fill="#fff8ea"/></g>
    <g class="ember-kraeuter" fill="#6f8a5a">
      <g style="--d:0s"><path d="M330 128v26" stroke="#5e3a1d" stroke-width="1.6"/><path d="M330 154c-8 4-10 16-4 24 2-8 2-16 4-24zm0 0c8 4 10 16 4 24-2-8-2-16-4-24zm0 6c-3 8-2 18 0 24 2-6 3-16 0-24z"/></g>
      <g style="--d:.8s"><path d="M560 128v22" stroke="#5e3a1d" stroke-width="1.6"/><g fill="#f1e6cf" stroke="#c9b88f" stroke-width="1"><circle cx="556" cy="156" r="6"/><circle cx="565" cy="160" r="6"/><circle cx="558" cy="168" r="6"/><circle cx="566" cy="173" r="5.5"/></g></g>
    </g>
  </g>
  <g class="ember-ofen">
    <path d="M440 336c0-80 40-128 90-132 50 4 90 52 90 132z" fill="url(#emberLehm)"/>
    <path d="M462 300c40-10 96-10 136 0M476 262c32-8 76-8 108 0M494 228c22-5 50-5 72 0" stroke="#7a3a1c" stroke-width="1.6" fill="none" opacity=".5"/>
    <path d="M490 336v-38a40 40 0 0 1 80 0v38z" fill="#2a120a"/>
    <path class="ember-glut" d="M494 336v-30a36 34 0 0 1 72 0v30z" fill="url(#emberGlut)"/>
    <g class="ember-funken" fill="#ffd27a">${[[510, 318], [528, 310], [546, 320], [536, 326], [520, 328]].map(([x, y], i) => `<circle style="--d:${i * 0.5}s" cx="${x}" cy="${y}" r="1.8"/>`).join("")}</g>
    <path class="ember-flimmern" d="M520 196c-4-10 4-16 0-26M540 196c4-10-4-16 0-26" stroke="#efe1c4" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>
  </g>
  <g>
    <rect x="210" y="322" width="170" height="14" rx="5" fill="#b88552"/>
    ${loaf(250, 322, 30)}
    ${loaf(320, 322, 24)}
    <g transform="translate(130 336)">
      <path d="M-42 -40h84l-6 36a6 6 0 0 1-6 4h-60a6 6 0 0 1-6-4z" fill="#3a3a33"/>
      <path d="M-48 -44h96" stroke="#24241f" stroke-width="7" stroke-linecap="round"/>
      <path d="M-52 -36h-8M52 -36h8" stroke="#24241f" stroke-width="5" stroke-linecap="round"/>
      <g class="ember-dampf" fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round">
        <path style="--d:0s" d="M-20 -52c-8-10 8-16 0-28"/>
        <path style="--d:1.1s" d="M0 -54c8-10-8-16 0-28"/>
        <path style="--d:2.2s" d="M20 -52c-8-10 8-16 0-28"/>
      </g>
    </g>
    <g transform="translate(410 336)">
      <path d="M-14 0l-4-34h36l-4 34z" fill="#c9a24a"/>
      <g class="ember-aehren" stroke="#c9963e" stroke-width="2" fill="#e6b85c">
        <path d="M-6 -34c-4-24-10-36-14-46" fill="none"/><ellipse cx="-20" cy="-82" rx="3" ry="8" transform="rotate(-24 -20 -82)"/>
        <path d="M0 -34c0-26 0-40 2-54" fill="none"/><ellipse cx="2" cy="-90" rx="3" ry="8"/>
        <path d="M6 -34c6-22 12-34 18-42" fill="none"/><ellipse cx="25" cy="-79" rx="3" ry="8" transform="rotate(28 25 -79)"/>
      </g>
    </g>
  </g>
</svg>`;

/** Spain, 2026 world champions — a red-gold flame on a striped table runner. */
const champions = () => `<aside class="hearth-champions" role="note" aria-label="Spain, 2026 world champions">
  <span class="hearth-champions__flame" aria-hidden="true"><svg viewBox="0 0 24 32" width="16" height="22" focusable="false"><path d="M12 31C4 29 2 22 5 15c2 4 4 5 5 5-1-7 2-14 8-19 0 8 6 11 6 19 0 7-5 11-12 11z" fill="#c60b1e"/><path d="M12 29c-4-1-5-5-3-9 1 2 2 3 3 3 0-4 2-7 4-9 0 5 3 6 3 10 0 3-3 5-7 5z" fill="#ffc400"/></svg></span>
  <p><strong>Spain</strong> are the <em>2026</em> World Cup champions <span class="hearth-champions__aside">· a toast from our kitchen</span></p>
  <span class="hearth-champions__runner" aria-hidden="true"></span>
</aside>`;

function layout(ctx, meta, body, kind = "") {
  const { site, categories, esc } = ctx;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="hearth hearth--${kind}">
<a class="hearth-skip" href="#main">Skip to content</a>
${champions()}
<header class="hearth-head">
  <div class="hearth-head__in">
    <a class="hearth-brand" href="/" aria-label="${esc(site.name)} – home">
      <span class="hearth-brand__mark" aria-hidden="true"><svg viewBox="0 0 44 44" width="42" height="42"><circle cx="22" cy="22" r="20" fill="#33401f"/><path d="M9 29c0-8 6-12 13-12s13 4 13 12v2H9z" fill="#d89a52"/><path d="M15 23l3 4M21 21l2 5M27 23l3 4" stroke="#f6dcae" stroke-width="1.8" stroke-linecap="round"/><path class="hearth-brand__steam" d="M18 14c-2-3 2-5 0-8M26 14c2-3-2-5 0-8" stroke="#f6dcae" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg></span>
      <span class="hearth-brand__word">ODAILY</span>
      <span class="hearth-brand__sub">${esc(site.expansion)}</span>
    </a>
    <nav class="hearth-service" aria-label="About ODAILY">${site.menu.map((m) => `<a href="${m.href}"${m.promo ? " data-promo" : ""}>${esc(m.label)}</a>`).join("")}</nav>
    <button class="hearth-toggle" type="button" aria-expanded="false" aria-controls="hearth-nav">Menu <span class="hearth-toggle__lines" aria-hidden="true"><i></i><i></i><i></i></span></button>
  </div>
  <nav id="hearth-nav" class="hearth-nav" aria-label="Sections">
    <div class="hearth-nav__in">
      <a class="hearth-nav__tab" href="/">Home</a>
      ${categories.map((c) => `<a class="hearth-nav__tab" href="${c.url}">${icon(c.icon, "hearth-nav__icon")}${esc(c.name)}</a>`).join("\n      ")}
      ${site.menu.map((m) => `<a class="hearth-nav__tab hearth-nav__tab--mobile" href="${m.href}"${m.promo ? " data-promo" : ""}>${esc(m.label)}</a>`).join("\n      ")}
    </div>
  </nav>
  <div class="hearth-bake" aria-hidden="true"><span></span></div>
</header>
<main id="main">
${body}
</main>
<footer class="hearth-foot">
  <div class="hearth-foot__cloth" aria-hidden="true"></div>
  <div class="hearth-foot__in">
    <section class="hearth-foot__brand">
      <p class="hearth-foot__word">ODAILY</p>
      <p class="hearth-foot__sub">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Sections">
      <p class="hearth-foot__title">On the table</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="About ODAILY">
      <p class="hearth-foot__title">The household</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <p class="hearth-foot__note">© ${new Date().getFullYear()} ODAILY · ${esc(site.domain)} · General cooking information for home kitchens. For allergies, special diets or medical nutrition, follow the advice of a doctor or registered dietitian; for food safety, the guidance of your national food safety agency.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A recipe card: ruled lines, a red top rule, a category tab and a timer. */
const card = (ctx, a, extra = "") => `<article class="loaf-card ${extra}">
  <a class="loaf-card__link" href="${a.url}">
    <span class="loaf-card__tab">${icon(a.cat.icon, "loaf-card__icon")}${ctx.esc(a.cat.name)}</span>
    <h3 class="loaf-card__title">${ctx.esc(a.title)}</h3>
    <p class="loaf-card__text">${ctx.esc(a.description)}</p>
    <span class="loaf-card__foot"><span class="loaf-card__timer" aria-hidden="true"></span>${a.minutes} min read</span>
  </a>
</article>`;

/** Three habits from Proverbs 31, told for a home kitchen. */
const HABITS = [
  ["Start before you start", "She rises while it is still night. In a home kitchen that means ten quiet minutes the evening before: beans soaking, meat moved to the fridge to thaw, tomorrow's vegetables washed. Dinner the next day is half made before anyone is hungry."],
  ["Keep the lamp lit", "Her lamp does not go out. A pantry with a few dependable staples (onions, garlic, rice, pasta, tinned tomatoes, eggs, good oil) means there is always the start of a meal, even on the evening nothing went to plan."],
  ["Feed the whole household", "She provides food for her household. Good everyday cooking is not about showing off; it is plain, nourishing food that suits the people at your table, their ages, their tastes and your budget."],
];

export function home(ctx) {
  const { site, articles, categories, esc } = ctx;
  const [first, second, third, ...rest] = articles;
  const body = `
<section class="hearth-hero">
  <figure class="hearth-hero__scene">${kitchen()}</figure>
  <div class="hearth-hero__card">
    <p class="hearth-hero__kicker">Home cooking for real weeknights</p>
    <h1 class="hearth-hero__title">Cook with <em>confidence</em>, every single day</h1>
    <p class="hearth-hero__lead">${esc(site.tagline)}.</p>
    <p class="hearth-hero__intro">${esc(site.description)}</p>
    <p class="hearth-hero__buttons">${first ? `<a class="hearth-button" href="${first.url}">Start cooking</a>` : ""}<a class="hearth-button hearth-button--line" href="/about/">Who we are</a></p>
  </div>
</section>

<section class="hearth-habits" aria-labelledby="ha-t">
  <header class="hearth-heading"><p class="hearth-heading__kicker">Proverbs 31</p><h2 id="ha-t">Three habits of a calm kitchen</h2></header>
  <ol class="hearth-habits__row">
    ${HABITS.map(([t, x], i) => `<li class="hearth-habit"><span class="hearth-habit__num" aria-hidden="true">${i + 1}</span><h3>${t}</h3><p>${x}</p></li>`).join("\n    ")}
  </ol>
</section>

${first ? `<section class="hearth-pick" aria-label="Featured">
  ${card(ctx, first, "loaf-card--big")}
  ${[second, third].filter(Boolean).map((a) => card(ctx, a)).join("")}
</section>` : `<p class="hearth-soon">Our first guides are being written and tested in a real home kitchen. Please come back soon.</p>`}

<section class="hearth-pantry" aria-labelledby="pa-t">
  <header class="hearth-heading"><p class="hearth-heading__kicker">Six jars on the shelf</p><h2 id="pa-t">What would you like to cook?</h2></header>
  <ul class="hearth-pantry__shelf">
    ${categories.map((c) => `<li><a class="hearth-jar" href="${c.url}">
      <span class="hearth-jar__lid" aria-hidden="true"></span>
      <span class="hearth-jar__icon">${icon(c.icon)}</span>
      <span class="hearth-jar__label"><span class="hearth-jar__name">${esc(c.name)}</span><span class="hearth-jar__count">${c.articles.length} guides</span></span>
      <span class="hearth-jar__text">${esc(c.description)}</span>
    </a></li>`).join("\n    ")}
  </ul>
</section>

${rest.length ? `<section class="hearth-latest" aria-labelledby="la-t">
  <header class="hearth-heading"><p class="hearth-heading__kicker">Fresh from the oven</p><h2 id="la-t">Latest guides</h2></header>
  <div class="hearth-latest__grid">${rest.slice(0, 12).map((a) => card(ctx, a)).join("\n    ")}</div>
</section>` : ""}

<section class="hearth-box" aria-labelledby="bo-t">
  <header class="hearth-heading hearth-heading--dark"><p class="hearth-heading__kicker">The recipe box</p><h2 id="bo-t">Every guide, by section</h2></header>
  <div class="hearth-box__dividers">
    ${categories.map((c) => `<section><h3><a href="${c.url}">${icon(c.icon)}${esc(c.name)}</a></h3><ol>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ol></section>`).join("\n    ")}
  </div>
</section>`;
  return layout(ctx, { title: `ODAILY – ${site.tagline}`, description: site.description, path: "/" }, body, "home");
}

export function category(ctx, c) {
  const { esc, site } = ctx;
  const body = `
<header class="hearth-sectionhead">
  <nav class="hearth-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span></nav>
  <span class="hearth-sectionhead__jar">${icon(c.icon)}</span>
  <h1>${esc(c.name)}</h1>
  <p>${esc(c.description)}</p>
  <p class="hearth-sectionhead__count">${c.articles.length} guides in this section</p>
</header>
<section class="hearth-latest hearth-latest--section"><div class="hearth-latest__grid">
  ${c.articles.map((a) => card(ctx, a)).join("\n  ")}
</div></section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: home cooking guides`,
      description: `${c.description} ${c.articles.length} guides from ${site.name}.`.slice(0, 160),
      path: c.url,
      jsonld: [ctx.crumbs([{ name: "Home", path: "/" }, { name: c.name, path: c.url }]), { "@type": "CollectionPage", name: c.name, url: `${ctx.base}${c.url}`, inLanguage: site.lang }],
    },
    body,
    "section"
  );
}

export function article(ctx, a) {
  const { esc, site, base } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="hearth-article">
  <header class="hearth-article__head">
    <nav class="hearth-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <a href="${a.cat.url}">${esc(a.cat.name)}</a></nav>
    <p class="hearth-article__label">${icon(a.cat.icon)}${esc(a.cat.name)}</p>
    <h1 class="hearth-article__title">${esc(a.title)}</h1>
    <p class="hearth-article__lead">${esc(a.description)}</p>
    <p class="hearth-article__meta">By the ${esc(site.author)} · <time datetime="${a.date}">${a.dateLabel}</time> · ${a.minutes} min read</p>
  </header>
  ${toc.length > 2 ? `<nav class="hearth-toc" aria-label="In this guide"><p class="hearth-toc__title">In this guide</p><ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol></nav>` : ""}
  <div class="hearth-text">
${a.html}
    <aside class="hearth-note"><p><strong>A note from our kitchen.</strong> ODAILY gives general cooking guidance. Cooking times and temperatures vary with ovens, pans and ingredients, so use your senses and a thermometer where it matters. Cook meat, poultry, eggs and leftovers to safe temperatures, keep raw and cooked food apart, and follow your national food safety agency. If you or a guest has a food allergy or a medical diet, check every ingredient label and follow the advice of a doctor or registered dietitian.</p></aside>
  </div>
</article>
<section class="hearth-latest hearth-latest--more" aria-labelledby="mo-t">
  <header class="hearth-heading"><p class="hearth-heading__kicker">Keep cooking</p><h2 id="mo-t">You might also like</h2></header>
  <div class="hearth-latest__grid">${a.related.map((r) => card(ctx, r)).join("")}</div>
</section>`;
  return layout(
    ctx,
    {
      title: a.title,
      description: a.description,
      path: a.url,
      type: "article",
      jsonld: [
        ctx.crumbs([{ name: "Home", path: "/" }, { name: a.cat.name, path: a.cat.url }, { name: a.title, path: a.url }]),
        {
          "@type": "Article",
          headline: a.title,
          description: a.description,
          datePublished: a.date,
          dateModified: a.updated,
          inLanguage: site.lang,
          wordCount: a.words,
          articleSection: a.cat.name,
          author: { "@type": "Organization", name: site.author, url: `${base}/about/` },
          publisher: { "@id": `${base}/#org` },
          mainEntityOfPage: `${base}${a.url}`,
        },
      ],
    },
    body,
    "article"
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const body = `
<article class="hearth-article hearth-article--page">
  <header class="hearth-article__head">
    <nav class="hearth-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
    <h1 class="hearth-article__title">${esc(p.title)}</h1>
    ${p.updated ? `<p class="hearth-article__meta">Last reviewed ${ctx.fmtDate(p.updated)}</p>` : ""}
  </header>
  <div class="hearth-text">
${p.html}
  </div>
</article>`;
  return layout(ctx, { title: p.title, description: p.description, path: p.url, jsonld: [ctx.crumbs([{ name: "Home", path: "/" }, { name: p.title, path: p.url }])] }, body, "page");
}

export function notFound(ctx) {
  const body = `
<section class="hearth-lost">
  <p class="hearth-lost__code">404</p>
  <h1>This page has gone stale</h1>
  <p>We could not find what you were looking for. Perhaps one of our sections has it:</p>
  <ul class="hearth-pantry__shelf">${ctx.categories.map((c) => `<li><a class="hearth-jar" href="${c.url}"><span class="hearth-jar__lid" aria-hidden="true"></span><span class="hearth-jar__icon">${icon(c.icon)}</span><span class="hearth-jar__label"><span class="hearth-jar__name">${ctx.esc(c.name)}</span></span></a></li>`).join("")}</ul>
</section>`;
  return layout(ctx, { title: "Page not found", description: "The page you were looking for does not exist on ODAILY.", path: "/404.html", noindex: true }, body, "lost");
}
