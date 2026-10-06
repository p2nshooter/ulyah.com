// ZEVOK — "Das eherne Meer".
//
// In the court of Solomon's temple stood a great basin cast in bronze, the
// "molten sea", made for washing; its rim was shaped like the rim of a cup,
// like an open lily blossom, and two rows of gourds ran around it beneath the
// brim (1 Kings 7:23–26). It stood on twelve oxen; this palace never draws
// them, nor any other living being. What it shows: the basin, its lily rim,
// the water inside, light travelling over bronze, and the two bronze pillars
// with lily capitals that stood at the porch (1 Kings 7:15–22).
//
// Menu items are small bronze vessels: water rises in a wave inside the one
// you point at, and a few bubbles climb to its surface. The Spain 2026 banner
// floats red and yellow soap bubbles. Every class here (erz-…) is ZEVOK's own.

const ICONS = {
  eimer: `<path d="M10 18h28l-3.4 21.6a3.2 3.2 0 0 1-3.2 2.7H16.6a3.2 3.2 0 0 1-3.2-2.7z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 18c0-8.5 5.4-13 12-13s12 4.5 12 13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12.6 25c2.9 1.9 5.8 1.9 8.7 0s5.8-1.9 8.7 0 4.2 1.4 5.4 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".75"/><circle cx="24" cy="33" r="2.2" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".7"/>`,
  tropfen: `<path d="M22 6c6.2 9 11 15.4 11 21.4a11 11 0 0 1-22 0C11 21.4 15.8 15 22 6z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16.6 28.4a5.6 5.6 0 0 0 4.6 5.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".75"/><path d="M38 7v8M34 11h8M36.5 22v4M34.5 24h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  trommel: `<rect x="8" y="6" width="32" height="36" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8 15h32" stroke="currentColor" stroke-width="1.8" opacity=".7"/><path d="M13 10.5h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="34" cy="10.5" r="1.8" fill="currentColor"/><circle cx="24" cy="28" r="9.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16.2 29.4c2.6 1.7 5.2 1.7 7.8 0s5.2-1.7 7.8 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>`,
  herd: `<rect x="8" y="7" width="32" height="35" rx="3.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8 16h32" stroke="currentColor" stroke-width="1.8" opacity=".7"/><circle cx="14" cy="11.5" r="1.9" fill="currentColor"/><circle cx="20.5" cy="11.5" r="1.9" fill="currentColor"/><rect x="28" y="9.6" width="7" height="3.8" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="13" y="21" width="22" height="14" rx="2.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M17 25.5l5-2.5M17 30l9-4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".65"/>`,
  wanne: `<path d="M5 24h38v3.5a10.5 10.5 0 0 1-10.5 10.5h-17A10.5 10.5 0 0 1 5 27.5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 38l-2 4.5M35 38l2 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M11 24V11.5a4.5 4.5 0 0 1 9 0V13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="29" cy="18" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="35.5" cy="13" r="1.8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="38" cy="19.5" r="1.3" fill="currentColor" opacity=".7"/>`,
  flasche: `<path d="M15 21h15v19a3.2 3.2 0 0 1-3.2 3.2h-8.6A3.2 3.2 0 0 1 15 40z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M18.5 21v-5h8v5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M17 16V9.5h12.5l4 3.2h-4.2V16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M19 29h7M19 34h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".7"/><circle cx="38.5" cy="9" r="1.3" fill="currentColor"/><circle cx="41.5" cy="13" r="1.3" fill="currentColor"/><circle cx="38.5" cy="16.5" r="1.1" fill="currentColor" opacity=".7"/>`,
  lilie: `<path d="M24 42V24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M24 24c-4.4-6-4.4-12.4 0-17 4.4 4.6 4.4 11 0 17z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M23 25c-6.4-.6-12-4.6-14.4-11 6.6-.2 11.6 4 14.4 11zM25 25c6.4-.6 12-4.6 14.4-11-6.6-.2-11.6 4-14.4 11z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 42h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  mischen: `<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 17.5c2.4 3.4 3.6 5.6 3.6 7.4a3.6 3.6 0 0 1-7.2 0c0-1.8 1.2-4 3.6-7.4zM33 17.5c2.4 3.4 3.6 5.6 3.6 7.4a3.6 3.6 0 0 1-7.2 0c0-1.8 1.2-4 3.6-7.4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 36 36 12" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`,
  lueften: `<rect x="8" y="7" width="22" height="34" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M19 7v34M8 24h22" stroke="currentColor" stroke-width="1.8" opacity=".7"/><path d="M30 15c4-2 7 1 5 3.6s-6 .6-2.6-2.2M33 26h9M33 31h6c2.6 0 3 3.4.6 3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  testen: `<circle cx="21" cy="21" r="11" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M29 29l10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M15.5 21.2l3.8 3.8 6.6-7.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  etikett: `<path d="M7 9.5h17l17 17-14.5 14.5-19.5-19.5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="14.5" cy="16.5" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 25.5l6-6M24.5 29l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".75"/>`,
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.lilie}</svg>`;

/** ZEVOK's seal: a small bronze basin with a lily lip, full of clear water. */
const siegel = (cls = "", k = "K") => `<svg class="${cls}" viewBox="0 0 64 64" width="52" height="52" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="erzSgBronze${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e4420"/><stop offset=".38" stop-color="#e9be7d"/><stop offset=".62" stop-color="#b47a3c"/><stop offset="1" stop-color="#5d391a"/></linearGradient>
    <radialGradient id="erzSgWasser${k}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#c9f1ec"/><stop offset="1" stop-color="#2aa7a5"/></radialGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="#0f1f36"/>
  <circle cx="32" cy="32" r="28.2" fill="none" stroke="#d9a25f" stroke-width="2"/>
  <circle cx="32" cy="32" r="24.6" fill="none" stroke="#d9a25f" stroke-width=".8" stroke-dasharray="1.6 2.4" opacity=".7"/>
  <path d="M11.4 29.6c-3-1-4.4-3.6-3.8-6.4 3 .8 4.6 3.2 3.8 6.4zM52.6 29.6c3-1 4.4-3.6 3.8-6.4-3 .8-4.6 3.2-3.8 6.4z" fill="#e9be7d"/>
  <path d="M12.6 30c.8 11.4 8.8 18.6 19.4 18.6S50.6 41.4 51.4 30z" fill="url(#erzSgBronze${k})"/>
  <g fill="#f4d9a8" opacity=".85"><circle cx="19" cy="36.5" r="1.3"/><circle cx="25.4" cy="38.4" r="1.3"/><circle cx="32" cy="39" r="1.3"/><circle cx="38.6" cy="38.4" r="1.3"/><circle cx="45" cy="36.5" r="1.3"/></g>
  <ellipse cx="32" cy="30" rx="19.6" ry="5" fill="#e9be7d"/>
  <ellipse cx="32" cy="30" rx="16.6" ry="3.6" fill="url(#erzSgWasser${k})"/>
  <path d="M26 52.6h12l2 3.6H24z" fill="#b47a3c"/>
  <circle cx="27" cy="19" r="2.4" fill="none" stroke="#9fe3dc" stroke-width="1.2"/>
  <circle cx="35.4" cy="13.6" r="1.6" fill="none" stroke="#9fe3dc" stroke-width="1.1"/>
</svg>`;

/** The golden trophy for the Spain 2026 banner, with a shine that passes over it. */
const pokal = () => `<svg class="erz-wm__pokal" viewBox="0 0 32 40" width="26" height="32" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="erzPkGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".45" stop-color="#f2c230"/><stop offset="1" stop-color="#b9831a"/></linearGradient>
    <linearGradient id="erzPkGlanz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="erzPkForm"><path d="M8 3h16v9.5C24 18.6 20.6 23 16 23s-8-4.4-8-10.5zM14 23h4v5.5h-4zM10 28.5h12l1.2 4.5H8.8zM7.6 33h16.8v4.4H7.6z"/></clipPath>
  </defs>
  <path d="M8.4 6.4H4.2c0 5.6 2.2 8.8 5.6 9.8M23.6 6.4h4.2c0 5.6-2.2 8.8-5.6 9.8" fill="none" stroke="#e2ae2c" stroke-width="2.2" stroke-linecap="round"/>
  <g clip-path="url(#erzPkForm)">
    <rect width="32" height="40" fill="url(#erzPkGold)"/>
    <rect class="erz-wm__glanz" x="-14" y="-4" width="9" height="48" fill="url(#erzPkGlanz)" transform="skewX(-18)"/>
  </g>
  <path d="M7.6 33h16.8v4.4H7.6z" fill="#7a4f12" opacity=".55"/>
  <path d="M12 7.5v5.6" stroke="#fff6d6" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
</svg>`;

const ball = () => `<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="9" fill="#fbf8f1" stroke="#0f1f36" stroke-width="1.2"/><path d="M10 6.2l3.4 2.5-1.3 4H7.9l-1.3-4z" fill="#0f1f36"/><path d="M10 1v5.2M13.4 8.7l4.9-1.6M12.1 12.7l3 4.2M7.9 12.7l-3 4.2M6.6 8.7 1.7 7.1" stroke="#0f1f36" stroke-width="1"/></svg>`;

/** Spanien, Weltmeister 2026: a golden trophy with a shine, a ball rolling in
 * its bronze groove, a red-yellow-red ribbon and soap bubbles in red and gold. */
const weltmeister = () => `<div class="erz-wm" role="note" aria-label="Spanien ist Fußball-Weltmeister 2026">
  <span class="erz-wm__seifen" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
  <div class="erz-wm__innen">
    ${pokal()}
    <span class="erz-wm__band" aria-hidden="true"></span>
    <p class="erz-wm__text"><strong>Spanien</strong> ist Fußball-Weltmeister 2026</p>
    <span class="erz-wm__bahn" aria-hidden="true"><span class="erz-wm__ball">${ball()}</span></span>
  </div>
</div>`;

/** Points on the basin's lip, for petals and the two rows of gourds. */
const rund = (cx, cy, rx, ry, from, to, step, fn) => {
  const out = [];
  for (let d = from; d <= to + 0.001; d += step) {
    const t = (d * Math.PI) / 180;
    out.push(fn(cx + rx * Math.cos(t), cy + ry * Math.sin(t), t, d));
  }
  return out.join("");
};
const n1 = (v) => Math.round(v * 10) / 10;

/** The hero: the bronze sea in a high arched hall between two lily pillars.
 * Light sweeps over the bronze, rings spread on the water, bubbles rise. */
const ehernesMeer = () => {
  const cx = 280, cy = 214, rx = 168, ry = 34;
  // Lily petals around the lip, drawn behind the rim so they flare out of it.
  const petal = (x, y, t) => {
    const dx = rx * Math.cos(t), dy = ry * Math.sin(t);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const f = 0.55 + 0.45 * (Math.hypot(dx, dy) / rx);
    return `<path d="M0 0C-9-7-8.4-19 0-29 8.4-19 9-7 0 0z" transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(ang)}) scale(${n1(f * 100) / 100})"/>`;
  };
  const gourd = (x, y) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="4.2"/>`;
  const pillar = (x) => `<g class="erz-bild__saeule">
      <rect x="${x - 22}" y="414" width="64" height="18" rx="3" fill="url(#erzHlBronzeQ)"/>
      <rect x="${x - 14}" y="150" width="48" height="266" fill="url(#erzHlBronzeQ)"/>
      <path d="M${x - 6} 156v256M${x + 4} 156v256M${x + 14} 156v256M${x + 24} 156v256" stroke="#5d391a" stroke-width="1.4" opacity=".55"/>
      <path d="M${x - 26} 150c0-24 14-40 36-40s36 16 36 40z" fill="url(#erzHlBronzeQ)"/>
      <path d="M${x - 26} 150c-8-6-10-16-6-24 8 4 10 14 6 24zM${x + 46} 150c8-6 10-16 6-24-8 4-10 14-6 24zM${x + 10} 110c-6-8-6-18 0-26 6 8 6 18 0 26z" fill="#e9be7d"/>
      <path d="M${x - 20} 132h60M${x - 16} 122h52" stroke="#f4d9a8" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>
    </g>`;
  return `<svg class="erz-bild" viewBox="0 0 560 460" role="img" aria-labelledby="erzHlTitel erzHlText" focusable="false">
  <title id="erzHlTitel">Das eherne Meer</title>
  <desc id="erzHlText">Ein großes Becken aus Bronze mit einem Rand wie eine Lilienblüte, gefüllt mit klarem Wasser, zwischen zwei Bronzesäulen in einer hohen Halle.</desc>
  <defs>
    <linearGradient id="erzHlHalle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#081325"/><stop offset=".55" stop-color="#13284a"/><stop offset="1" stop-color="#1e3c63"/></linearGradient>
    <radialGradient id="erzHlSchein" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="#9fe3dc" stop-opacity=".34"/><stop offset="1" stop-color="#9fe3dc" stop-opacity="0"/></radialGradient>
    <linearGradient id="erzHlBronze" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2c12"/><stop offset=".22" stop-color="#9a6630"/><stop offset=".4" stop-color="#e9be7d"/><stop offset=".55" stop-color="#b47a3c"/><stop offset=".85" stop-color="#7a4b22"/><stop offset="1" stop-color="#3f250e"/></linearGradient>
    <linearGradient id="erzHlBronzeQ" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d391a"/><stop offset=".35" stop-color="#d9a25f"/><stop offset=".6" stop-color="#a86e34"/><stop offset="1" stop-color="#4a2c12"/></linearGradient>
    <linearGradient id="erzHlLippe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4d9a8"/><stop offset="1" stop-color="#b47a3c"/></linearGradient>
    <radialGradient id="erzHlWasser" cx=".42" cy=".4" r=".75"><stop offset="0" stop-color="#d8f6f1"/><stop offset=".45" stop-color="#6fd3cd"/><stop offset="1" stop-color="#1d8a8f"/></radialGradient>
    <linearGradient id="erzHlGlanz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6e0" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e0" stop-opacity=".55"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></linearGradient>
    <linearGradient id="erzHlBoden" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a4a73"/><stop offset="1" stop-color="#0d1c33"/></linearGradient>
    <pattern id="erzHlGitter" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0h14M0 0v14" stroke="#d9a25f" stroke-width="1" opacity=".55"/></pattern>
    <pattern id="erzHlNetz" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0h12M0 0v12" stroke="#3f250e" stroke-width="1.3" opacity=".6"/></pattern>
    <clipPath id="erzHlKoerper"><path d="M${cx - rx + 4} ${cy}C${cx - rx + 10} ${cy + 96} ${cx - 92} ${cy + 156} ${cx - 40} ${cy + 162}H${cx + 40}C${cx + 92} ${cy + 156} ${cx + rx - 10} ${cy + 96} ${cx + rx - 4} ${cy}z"/></clipPath>
  </defs>
  <rect width="560" height="460" rx="30" fill="url(#erzHlHalle)"/>
  <g class="erz-bild__strahlen" fill="#fff6e0">
    <path d="M196 0h34L330 460h-86z" opacity=".05"/>
    <path d="M262 0h20L392 460h-50z" opacity=".045"/>
  </g>
  <path d="M146 460V196a134 134 0 0 1 268 0v264" fill="url(#erzHlGitter)" opacity=".35"/>
  <path d="M146 460V196a134 134 0 0 1 268 0v264" fill="none" stroke="#d9a25f" stroke-width="2.4" opacity=".75"/>
  <path d="M160 460V198a120 120 0 0 1 240 0v262" fill="none" stroke="#d9a25f" stroke-width="1" opacity=".45"/>
  <circle cx="280" cy="194" r="190" fill="url(#erzHlSchein)"/>
  <path d="M0 396h560v64H0z" fill="url(#erzHlBoden)"/>
  <path d="M0 396h560" stroke="#d9a25f" stroke-width="1.2" opacity=".5"/>
  <ellipse cx="${cx}" cy="430" rx="190" ry="16" fill="#d9a25f" opacity=".12"/>
  ${pillar(52)}
  ${pillar(486)}
  <g class="erz-bild__sockel">
    <path d="M178 388h204v14c0 9-46 16-102 16s-102-7-102-16z" fill="#4a2c12"/>
    <ellipse cx="${cx}" cy="388" rx="102" ry="12" fill="url(#erzHlBronzeQ)"/>
    <path d="M212 372h136v14H212z" fill="url(#erzHlBronzeQ)"/>
    <ellipse cx="${cx}" cy="372" rx="68" ry="8" fill="#e9be7d" opacity=".8"/>
  </g>
  <g class="erz-bild__blueten" fill="url(#erzHlLippe)" stroke="#7a4b22" stroke-width="1">
    ${rund(cx, cy, rx, ry, 0, 345, 15, petal)}
  </g>
  <path d="M${cx - rx + 4} ${cy}C${cx - rx + 10} ${cy + 96} ${cx - 92} ${cy + 156} ${cx - 40} ${cy + 162}H${cx + 40}C${cx + 92} ${cy + 156} ${cx + rx - 10} ${cy + 96} ${cx + rx - 4} ${cy}z" fill="url(#erzHlBronze)"/>
  <g clip-path="url(#erzHlKoerper)">
    <path d="M0 ${cy + 64}C120 ${cy + 92} 440 ${cy + 92} 560 ${cy + 64}V${cy + 98}C440 ${cy + 126} 120 ${cy + 126} 0 ${cy + 98}z" fill="url(#erzHlNetz)"/>
    <path d="M0 ${cy + 64}C120 ${cy + 92} 440 ${cy + 92} 560 ${cy + 64}M0 ${cy + 98}C120 ${cy + 126} 440 ${cy + 126} 560 ${cy + 98}" fill="none" stroke="#f4d9a8" stroke-width="1.4" opacity=".6"/>
    <g fill="#f4d9a8" stroke="#6e4420" stroke-width=".8" opacity=".9">
      ${rund(cx, cy + 20, rx - 8, ry + 6, 12, 168, 8, gourd)}
      ${rund(cx, cy + 36, rx - 18, ry + 10, 16, 164, 8.5, gourd)}
    </g>
    <rect class="erz-bild__glanz" x="0" y="${cy - 10}" width="110" height="190" fill="url(#erzHlGlanz)"/>
  </g>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#erzHlLippe)" stroke="#7a4b22" stroke-width="1.2"/>
  <ellipse cx="${cx}" cy="${cy + 1}" rx="${rx - 14}" ry="${ry - 8}" fill="url(#erzHlWasser)"/>
  <g class="erz-bild__ringe" fill="none" stroke="#f2fffd" stroke-width="1.4">
    <ellipse class="r1" cx="${cx - 18}" cy="${cy + 2}" rx="40" ry="7"/>
    <ellipse class="r2" cx="${cx - 18}" cy="${cy + 2}" rx="40" ry="7"/>
    <ellipse class="r3" cx="${cx - 18}" cy="${cy + 2}" rx="40" ry="7"/>
  </g>
  <path d="M${cx - 120} ${cy - 6}c40-10 90-12 140-8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45"/>
  <g class="erz-bild__perlen" fill="none" stroke="#c9f1ec" stroke-width="1.4">
    <circle class="b1" cx="232" cy="200" r="5"/>
    <circle class="b2" cx="300" cy="204" r="3.6"/>
    <circle class="b3" cx="336" cy="198" r="4.4"/>
    <circle class="b4" cx="262" cy="206" r="2.8"/>
  </g>
</svg>`;
};

/** Which menu item holds water (the page you are on). */
const ist = (a, b) => (a === b ? ` aria-current="page"` : "");

function layout(ctx, meta, body, kind, hier = "") {
  const { site, categories, esc } = ctx;
  const pegel = (href, label, extra = "") =>
    `<li><a class="erz-pegel${extra}" href="${href}"${ist(href, hier)}><span class="erz-pegel__wort">${esc(label)}</span><span class="erz-pegel__perlen" aria-hidden="true"><i></i><i></i><i></i></span></a></li>`;
  return `<!doctype html>
<html lang="${site.lang}">
<head>
${ctx.head(meta)}
</head>
<body class="erz erz--${kind}">
<script>document.documentElement.classList.add("erz-js")</script>
<a class="erz-tauchsprung" href="#erz-inhalt">Zum Inhalt springen</a>
<header class="erz-haupt">
  ${weltmeister()}
  <div class="erz-haupt__leiste">
    <a class="erz-siegel" href="/" aria-label="${esc(site.name)}: zur Startseite">
      ${siegel("erz-siegel__bild")}
      <span class="erz-siegel__texte"><span class="erz-siegel__name">${esc(site.name)}</span><span class="erz-siegel__zeile">${esc(site.expansion)}</span></span>
    </a>
    <ul class="erz-nebenwege" aria-label="Über ZEVOK">${site.menu.map((m) => `<li><a href="${m.href}"${ist(m.href, hier)}>${esc(m.label)}</a></li>`).join("")}</ul>
    <button class="erz-schalter" type="button" aria-expanded="false" aria-controls="erz-wasserlauf"><span class="erz-schalter__wellen" aria-hidden="true"><i></i><i></i><i></i></span><span class="erz-schalter__wort">Menü</span></button>
  </div>
  <nav id="erz-wasserlauf" class="erz-wasserlauf" aria-label="Hauptmenü">
    <ul class="erz-wasserlauf__reihe">
      ${pegel("/", "Start")}
      ${categories.map((c) => pegel(c.url, c.name)).join("\n      ")}
    </ul>
    <ul class="erz-wasserlauf__neben">
      ${site.menu.map((m) => pegel(m.href, m.label, " erz-pegel--still")).join("\n      ")}
    </ul>
  </nav>
  <div class="erz-lilienrand" aria-hidden="true"></div>
</header>
${kind === "ratgeber" ? `<div class="erz-lesepegel" aria-hidden="true"><i></i></div>` : ""}
<main id="erz-inhalt" tabindex="-1">
${body}
</main>
<footer class="erz-sockel">
  <div class="erz-sockel__fries" aria-hidden="true"></div>
  <div class="erz-sockel__innen">
    <section class="erz-sockel__marke">
      <p class="erz-sockel__name">${siegel("erz-sockel__siegel", "F")}<span>${esc(site.name)}</span></p>
      <p class="erz-sockel__zeile">${esc(site.expansion)}</p>
      <p>${esc(site.description)}</p>
    </section>
    <nav aria-label="Themen im Fußbereich">
      <p class="erz-sockel__titel">Themen</p>
      <ul>${categories.map((c) => `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Über ZEVOK und Rechtliches">
      <p class="erz-sockel__titel">${esc(site.name)}</p>
      <ul>${[...site.menu, ...site.legal].map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`).join("")}</ul>
    </nav>
    <section class="erz-sockel__notfall" aria-label="Im Notfall">
      <p class="erz-sockel__titel">Im Notfall</p>
      <p>Reiniger verschluckt, in die Augen bekommen oder Dämpfe eingeatmet? Ruhe bewahren, frische Luft, und beim <strong>Giftinformationszentrum</strong> deines Bundeslandes anrufen. Bei Atemnot, Bewusstlosigkeit oder Krämpfen sofort die <strong>112</strong>.</p>
      <p><a href="/sicherheit-beim-putzen/">Sicher putzen: die Grundregeln</a></p>
    </section>
  </div>
  <p class="erz-sockel__hinweis">© ${new Date().getFullYear()} ${esc(site.name)} · ${esc(site.domain)} · Allgemeine Informationen rund um Reinigung, Fleckentfernung und Wäschepflege. Beachte immer die Pflegeetiketten und die Hinweise der Hersteller, teste an einer unauffälligen Stelle und mische niemals Reinigungsmittel. Mehr im <a href="/haftungsausschluss/">Haftungsausschluss</a>.</p>
</footer>
${ctx.tail()}
</body>
</html>`;
}

/** A linen tablet edged in bronze: the article card. */
const tafel = (ctx, a, ueberschrift = "h3") => `<article class="erz-tafel">
  <a class="erz-tafel__link" href="${a.url}">
    <span class="erz-tafel__kopf"><span class="erz-tafel__icon">${icon(a.cat.icon)}</span><span class="erz-tafel__thema">${ctx.esc(a.cat.name)}</span></span>
    <${ueberschrift} class="erz-tafel__titel">${ctx.esc(a.title)}</${ueberschrift}>
    <p class="erz-tafel__text">${ctx.esc(a.description)}</p>
    <span class="erz-tafel__fuss"><span>${a.minutes} Min. Lesezeit</span><span class="erz-tafel__pfeil" aria-hidden="true">→</span></span>
  </a>
</article>`;

const anzahl = (n) => `${n} Ratgeber`;

/** The four rules at the edge of the basin, repeated wherever it helps. */
const REGELN = [
  { icon: "mischen", titel: "Niemals mischen", text: "Chlorhaltige Reiniger nie mit Säuren wie Essig, Zitronensäure oder WC-Reiniger und nie mit Ammoniak zusammenbringen: Es können giftige Gase entstehen." },
  { icon: "lueften", titel: "Gut lüften", text: "Beim Putzen Fenster öffnen, besonders in kleinen Bädern. Dämpfe von Reinigern reizen Augen und Atemwege, auch wenn sie angenehm riechen." },
  { icon: "testen", titel: "Erst testen", text: "Jedes Mittel zuerst an einer unauffälligen Stelle ausprobieren und trocknen lassen. Erst wenn sich Farbe und Oberfläche nicht verändern, weitermachen." },
  { icon: "etikett", titel: "Etikett lesen", text: "Pflegeetikett und Herstellerhinweise gehen vor jedem Hausmittel-Tipp. Sie sagen, was ein Material verträgt und was es dauerhaft beschädigt." },
];
const regeln = (cls = "") => `<ul class="erz-regeln ${cls}">
    ${REGELN.map((r) => `<li class="erz-regel">${icon(r.icon, "erz-regel__icon")}<p><strong>${r.titel}</strong> ${r.text}</p></li>`).join("\n    ")}
  </ul>`;

export function home(ctx) {
  const { site, articles, categories, esc, base } = ctx;
  const neu = articles.slice(0, 9);
  const body = `
<section class="erz-halle" aria-labelledby="erz-halle-t">
  <div class="erz-halle__innen">
    <div class="erz-halle__text">
      <p class="erz-dachzeile">Der Haushalts-Ratgeber</p>
      <h1 id="erz-halle-t" class="erz-halle__titel">Haushalt leicht gemacht: <em>sauber, sicher</em> und mit System</h1>
      <p class="erz-halle__claim">${esc(site.tagline)}</p>
      <p class="erz-halle__intro">Hier erfährst du, welcher Fleck welche Behandlung braucht, was ein Pflegesymbol wirklich bedeutet, in welcher Reihenfolge man ein Bad putzt und wofür Essig, Natron oder Soda taugen und wofür nicht. Ohne Wundermittel, ohne Markenwerbung, mit klaren Schritten.</p>
      <p class="erz-halle__knoepfe"><a class="erz-taste" href="${categories[1].url}">Flecken nach Art finden</a><a class="erz-taste erz-taste--rand" href="/sicherheit-beim-putzen/">Sicher putzen: die Grundregeln</a></p>
    </div>
    <figure class="erz-halle__bild">${ehernesMeer()}<figcaption>Das eherne Meer: ein Becken aus Bronze zum Waschen, sein Rand geformt wie eine Lilienblüte.</figcaption></figure>
  </div>
</section>

<section class="erz-becken" aria-labelledby="erz-becken-t">
  <header class="erz-ueber"><p class="erz-ueber__zeile">Sechs Becken</p><h2 id="erz-becken-t">Womit möchtest du anfangen?</h2><p class="erz-ueber__text">Jedes Thema ist ein eigenes Becken voller Anleitungen. Fahr mit der Maus über ein Becken oder tippe es an: Das Wasser steigt.</p></header>
  <ol class="erz-becken__reihe">
    ${categories
      .map(
        (c, i) => `<li><a class="erz-schale" href="${c.url}" style="--i:${i}">
      <span class="erz-schale__wasser" aria-hidden="true"></span>
      <span class="erz-schale__nr" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <span class="erz-schale__icon">${icon(c.icon)}</span>
      <span class="erz-schale__name">${esc(c.name)}</span>
      <span class="erz-schale__text">${esc(c.description)}</span>
      <span class="erz-schale__zahl">${c.articles.length ? anzahl(c.articles.length) : "Erste Ratgeber in Arbeit"}</span>
    </a></li>`
      )
      .join("\n    ")}
  </ol>
</section>

<section class="erz-rand" aria-labelledby="erz-rand-t">
  <div class="erz-rand__innen">
    <header class="erz-ueber erz-ueber--hell"><p class="erz-ueber__zeile">Am Beckenrand</p><h2 id="erz-rand-t">Vier Regeln, die vor jedem Tipp gelten</h2></header>
    ${regeln()}
    <p class="erz-rand__mehr"><a class="erz-taste erz-taste--aqua" href="/sicherheit-beim-putzen/">Alles zur Sicherheit beim Putzen</a></p>
  </div>
</section>

${
  neu.length
    ? `<section class="erz-tafeln" aria-labelledby="erz-neu-t">
  <header class="erz-ueber"><p class="erz-ueber__zeile">Frisch geschöpft</p><h2 id="erz-neu-t">Neue Ratgeber</h2></header>
  <div class="erz-tafeln__raster">
    ${neu.map((a) => tafel(ctx, a)).join("\n    ")}
  </div>
</section>

<section class="erz-verzeichnis" aria-labelledby="erz-vz-t">
  <header class="erz-ueber"><p class="erz-ueber__zeile">Alles auf einen Blick</p><h2 id="erz-vz-t">Alle Ratgeber nach Thema</h2></header>
  <div class="erz-verzeichnis__spalten">
    ${categories
      .filter((c) => c.articles.length)
      .map((c) => `<section><h3><a href="${c.url}">${icon(c.icon, "erz-verzeichnis__icon")}${esc(c.name)}</a></h3><ul>${c.articles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join("")}</ul></section>`)
      .join("\n    ")}
  </div>
</section>`
    : ""
}

<section class="erz-kunde" aria-labelledby="erz-kunde-t">
  <div class="erz-kunde__innen">
    <div class="erz-kunde__zeichen" aria-hidden="true">${icon("lilie")}</div>
    <div>
      <p class="erz-ueber__zeile">Über ${esc(site.name)}</p>
      <h2 id="erz-kunde-t">Warum ein Becken aus Bronze?</h2>
      <p>Im ersten Buch der Könige wird ein gewaltiges, in Bronze gegossenes Becken beschrieben, das „eherne Meer“. Es diente dem Waschen, und sein Rand war geformt wie eine aufgeblühte Lilie. Für uns ist es ein schönes Bild dafür, worum es bei ${esc(site.name)} geht: Sauberkeit mit Sorgfalt, mit dem richtigen Mittel für das richtige Material, und ein Zuhause, in dem man sich wohlfühlt.</p>
      <p>Der Name steht für <strong>Z</strong>uverlässig <strong>e</strong>rklärt, <strong>v</strong>on <strong>O</strong>fen bis <strong>K</strong>ragen. Unsere Redaktion schreibt jeden Ratgeber selbst, prüft Hinweise zu Haushaltschemie besonders sorgfältig und nennt keine Marken als Empfehlung.</p>
      <p><a class="erz-taste erz-taste--rand" href="/ueber-uns/">Mehr über uns</a> <a class="erz-kunde__link" href="/redaktionsgrundsaetze/">So arbeiten wir</a></p>
    </div>
  </div>
</section>`;
  return layout(
    ctx,
    {
      title: `${site.name}: Haushalt leicht gemacht – Putzen, Flecken, Wäsche`,
      description: site.description,
      path: "/",
      jsonld: [
        {
          "@type": "ItemList",
          name: `Themen von ${site.name}`,
          itemListElement: categories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: `${base}${c.url}` })),
        },
      ],
    },
    body,
    "start",
    "/"
  );
}

export function category(ctx, c) {
  const { esc, site, categories, base } = ctx;
  const nr = categories.findIndex((x) => x.slug === c.slug) + 1;
  const andere = categories.filter((x) => x !== c);
  const body = `
<header class="erz-themenkopf">
  <div class="erz-themenkopf__innen">
    <nav class="erz-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li><span aria-current="page">${esc(c.name)}</span></li></ol></nav>
    <div class="erz-themenkopf__zeile">
      <span class="erz-themenkopf__icon">${icon(c.icon)}</span>
      <div>
        <p class="erz-dachzeile erz-dachzeile--hell">Becken ${String(nr).padStart(2, "0")} von ${String(categories.length).padStart(2, "0")}</p>
        <h1>${esc(c.name)}</h1>
      </div>
    </div>
    <p class="erz-themenkopf__text">${esc(c.description)}</p>
    <p class="erz-themenkopf__zahl">${c.articles.length ? anzahl(c.articles.length) : "Die ersten Ratgeber zu diesem Thema sind in Arbeit."}</p>
  </div>
</header>
<section class="erz-tafeln erz-tafeln--thema" aria-label="Ratgeber zum Thema ${esc(c.name)}">
  <div class="erz-tafeln__raster">
    ${c.articles.map((a) => tafel(ctx, a, "h2")).join("\n    ")}
  </div>
</section>
<section class="erz-weitere" aria-labelledby="erz-weitere-t">
  <h2 id="erz-weitere-t" class="erz-weitere__titel">Weitere Themen</h2>
  <ul class="erz-chips">${andere.map((x) => `<li><a href="${x.url}">${icon(x.icon, "erz-chips__icon")}${esc(x.name)}</a></li>`).join("")}</ul>
</section>`;
  return layout(
    ctx,
    {
      title: `${c.name}: Anleitungen und Tipps`,
      description: c.description,
      path: c.url,
      jsonld: [
        ctx.crumbs([{ name: "Start", path: "/" }, { name: c.name, path: c.url }]),
        {
          "@type": "CollectionPage",
          name: c.name,
          description: c.description,
          url: `${base}${c.url}`,
          inLanguage: site.lang,
          isPartOf: { "@id": `${base}/#site` },
          ...(c.articles.length
            ? { mainEntity: { "@type": "ItemList", itemListElement: c.articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${base}${a.url}`, name: a.title })) } }
            : {}),
        },
      ],
    },
    body,
    "thema",
    c.url
  );
}

export function article(ctx, a) {
  const { esc, site, base, categories } = ctx;
  const toc = a.headings.filter((h) => h.level === 2);
  const body = `
<article class="erz-ratgeber">
  <header class="erz-ratgeber__kopf">
    <nav class="erz-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li><a href="${a.cat.url}">${esc(a.cat.name)}</a></li><li><span aria-current="page">${esc(a.title)}</span></li></ol></nav>
    <p class="erz-ratgeber__thema"><a href="${a.cat.url}">${icon(a.cat.icon)}${esc(a.cat.name)}</a></p>
    <h1 class="erz-ratgeber__titel">${esc(a.title)}</h1>
    <p class="erz-ratgeber__vorspann">${esc(a.description)}</p>
    <ul class="erz-ratgeber__meta">
      <li>Von <a href="/ueber-uns/">${esc(site.author)}</a></li>
      <li>${a.updated !== a.date ? "Aktualisiert" : "Veröffentlicht"} am <time datetime="${a.updated}">${a.updatedLabel}</time></li>
      <li>${a.minutes} Min. Lesezeit</li>
    </ul>
  </header>
  <div class="erz-ratgeber__koerper">
    ${
      toc.length > 1
        ? `<aside class="erz-inhalt" aria-labelledby="erz-inhalt-t">
      <details class="erz-inhalt__klappe" open>
        <summary id="erz-inhalt-t">Inhalt</summary>
        <ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>
      </details>
    </aside>`
        : ""
    }
    <div class="erz-text">
${a.html}
      <aside class="erz-merkstein" aria-label="Sicherheitshinweis">
        <p class="erz-merkstein__titel">${icon("mischen", "erz-merkstein__icon")}Sicher arbeiten</p>
        <p>Reinigungsmittel niemals mischen, vor allem keine chlorhaltigen Produkte mit Säuren oder Ammoniak. Beim Putzen lüften, Handschuhe tragen, jedes Mittel zuerst an einer unauffälligen Stelle testen und das Pflegeetikett beachten. Bei wertvollen oder empfindlichen Stücken lohnt der Weg in eine Textilreinigung oder zu einem Fachbetrieb. <a href="/sicherheit-beim-putzen/">Die Grundregeln im Überblick</a>.</p>
      </aside>
    </div>
  </div>
</article>
<section class="erz-weitere erz-weitere--ratgeber" aria-labelledby="erz-themen-t">
  <h2 id="erz-themen-t" class="erz-weitere__titel">Alle Themen</h2>
  <ul class="erz-chips">${categories.map((x) => `<li><a href="${x.url}"${x === a.cat ? ` aria-current="true"` : ""}>${icon(x.icon, "erz-chips__icon")}${esc(x.name)}</a></li>`).join("")}</ul>
</section>
${
  a.related.length
    ? `<section class="erz-tafeln erz-tafeln--weiter" aria-labelledby="erz-weiter-t">
  <header class="erz-ueber"><p class="erz-ueber__zeile">Weiterlesen</p><h2 id="erz-weiter-t">Passende Ratgeber</h2></header>
  <div class="erz-tafeln__raster">${a.related.map((r) => tafel(ctx, r)).join("")}</div>
</section>`
    : ""
}`;
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
    "ratgeber",
    a.cat.url
  );
}

export function page(ctx, p) {
  const { esc } = ctx;
  const toc = p.headings.filter((h) => h.level === 2);
  const body = `
<article class="erz-ratgeber erz-ratgeber--seite">
  <header class="erz-ratgeber__kopf">
    <nav class="erz-pfad" aria-label="Brotkrumen"><ol><li><a href="/">Start</a></li><li><span aria-current="page">${esc(p.title)}</span></li></ol></nav>
    <h1 class="erz-ratgeber__titel">${esc(p.title)}</h1>
    ${p.description ? `<p class="erz-ratgeber__vorspann">${esc(p.description)}</p>` : ""}
    ${p.updated ? `<ul class="erz-ratgeber__meta"><li>Stand: <time datetime="${p.updated}">${ctx.fmtDate(p.updated)}</time></li></ul>` : ""}
  </header>
  <div class="erz-ratgeber__koerper erz-ratgeber__koerper--seite">
    ${
      toc.length > 4
        ? `<aside class="erz-inhalt" aria-labelledby="erz-inhalt-t">
      <details class="erz-inhalt__klappe" open>
        <summary id="erz-inhalt-t">Inhalt</summary>
        <ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>
      </details>
    </aside>`
        : ""
    }
    <div class="erz-text">
${p.html}
    </div>
  </div>
</article>`;
  return layout(
    ctx,
    { title: p.title, description: p.description || p.title, path: p.url, jsonld: [ctx.crumbs([{ name: "Start", path: "/" }, { name: p.title, path: p.url }])] },
    body,
    "seite",
    p.url
  );
}

export function notFound(ctx) {
  const { esc, categories, site } = ctx;
  const body = `
<section class="erz-leer">
  <p class="erz-leer__code" aria-hidden="true">404</p>
  <h1>Hier ist nur klares Wasser</h1>
  <p>Diese Seite gibt es nicht (mehr). Vielleicht war der Link veraltet oder hatte einen Tippfehler. Von hier aus geht es in alle sechs Becken von ${esc(site.name)}:</p>
  <ul class="erz-chips erz-chips--gross">${categories.map((c) => `<li><a href="${c.url}">${icon(c.icon, "erz-chips__icon")}${esc(c.name)}</a></li>`).join("")}</ul>
  <p><a class="erz-taste" href="/">Zur Startseite</a></p>
</section>`;
  return layout(ctx, { title: "Seite nicht gefunden", description: `Die gesuchte Seite gibt es bei ${site.name} nicht.`, path: "/404.html", noindex: true }, body, "leer");
}
