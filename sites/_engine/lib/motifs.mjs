// The pictures the article illustrations are made of (owner, 9 Nov 2026, docs/ADSENSE-BLUEPRINT.md §29: „setiap artikel
// kasih gambar animasi yg sesuai tema, jgn polosan begitu“). Each motif is a small flat drawing in a 200 × 200 box
// (ground at y ≈ 186), outlined in ink, with its own moving part where it has one (steam, drops, wheels, a beam).
//
//   name: { group, particles, keys: [...], with: [...], draw(P) }
//     group      the scene it stands in: "out" (hills and sky), "sea" (waves), "in" (a room), "sky" (night, space)
//     particles  what drifts through the scene: leaf, bubble, sparkle, snow, heart, star, drop, petal, coin, dot, note
//     keys       word stems that make an article's own subject (German, Spanish, English; umlauts and accents folded:
//                ä → ae, ñ → n), matched inside the words of its title, slug and summary
//     with       companions drawn small beside it
//     draw(P)    the SVG of the drawing; P is the scene palette (P.a main accent, P.b second, P.c third)
//
// Moving parts use the classes of illustrate.mjs (eb-steam, eb-drop, eb-spin, eb-glow, eb-beam, eb-swing, eb-flap,
// eb-tail, eb-sway): the motif itself only says which part moves.

const K = "#26323f"; // ink
const S = `stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const N = `stroke="none"`;
const C = {
  green: "#3f9d5a", leaf: "#62bf5f", lime: "#a6d65a", wood: "#c0874f", woodD: "#8a5a32", red: "#e0473c", orange: "#f0892a",
  yellow: "#f7c948", gold: "#e3b23c", blue: "#3d8fd6", water: "#63b8ea", sky: "#a8daf5", grey: "#a7b1bc", greyD: "#66717d",
  white: "#ffffff", cream: "#fff4df", pink: "#f4a0b9", purple: "#8f6bd8", brown: "#8a5a3b", coffee: "#6b3f25", steel: "#cfd8e1",
  skin: "#f3c9a1", snow: "#f4f8fb", teal: "#2fb3a6", brick: "#c8553d", night: "#2e3a6b",
};
export { C as COLORS };

const steam = (x, y, h = 34) =>
  `<g fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".9">` +
  [0, 1, 2].map((i) => `<path class="eb-steam" style="animation-delay:${i * 0.7}s" d="M${x + (i - 1) * 16} ${y} q-7 -${h / 3} 0 -${(h * 2) / 3} q7 -${h / 3} 0 -${h}"/>`).join("") +
  `</g>`;
const drops = (x, y, color = C.water, n = 3, gap = 10) =>
  [...Array(n)].map((_, i) => `<path class="eb-drop" style="animation-delay:${(i * 0.45).toFixed(2)}s" d="M${x + (i - (n - 1) / 2) * gap} ${y} q-5 8 0 12 q5 -4 0 -12z" fill="${color}" ${N}/>`).join("");
const glow = (x, y, r, color = C.yellow) => `<circle class="eb-glow" cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity=".35" ${N}/>`;
const sparkle = (x, y, s = 1, color = "#fff") =>
  `<path class="eb-twinkle" d="M${x} ${y - 9 * s} L${x + 2.5 * s} ${y - 2.5 * s} L${x + 9 * s} ${y} L${x + 2.5 * s} ${y + 2.5 * s} L${x} ${y + 9 * s} L${x - 2.5 * s} ${y + 2.5 * s} L${x - 9 * s} ${y} L${x - 2.5 * s} ${y - 2.5 * s}Z" fill="${color}" ${N}/>`;
const leafShape = (x, y, r, rot, fill = C.leaf) =>
  `<path transform="rotate(${rot} ${x} ${y})" d="M${x} ${y} q${r * 0.6} -${r * 0.9} 0 -${r * 1.8} q-${r * 0.6} ${r * 0.9} 0 ${r * 1.8}z" fill="${fill}"/>`;
const pot = (fill = C.brick) => `<path d="M62 140 h76 l-9 46 h-58z" fill="${fill}"/><rect x="56" y="132" width="88" height="14" rx="4" fill="${fill}"/>`;
const wheel = (cx, cy, r) =>
  `<g class="eb-spin"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none"/><circle cx="${cx}" cy="${cy}" r="4" fill="${K}"/>` +
  [0, 45, 90, 135].map((a) => `<line x1="${cx + r * Math.cos((a * Math.PI) / 180)}" y1="${cy + r * Math.sin((a * Math.PI) / 180)}" x2="${cx - r * Math.cos((a * Math.PI) / 180)}" y2="${cy - r * Math.sin((a * Math.PI) / 180)}" stroke-width="2"/>`).join("") +
  `</g>`;

export const MOTIFS = {
  // ── home, DIY, rooms ─────────────────────────────────────────────
  house: {
    group: "out", particles: "dot", with: ["key", "lamp", "tree"],
    keys: ["haus", "wohnung", "zuhause", "casa", "vivienda", "hogar", "piso", "house", "home", "dach", "tejado", "fassade", "fachada", "bau", "arquitect", "umzug", "mudanza", "einzug"],
    draw: (P) => `<g ${S}><rect x="128" y="44" width="16" height="34" fill="${C.brick}"/><g fill="#fff" opacity=".85" ${N}><circle class="eb-rise" cx="136" cy="36" r="6"/><circle class="eb-rise" style="animation-delay:1.2s" cx="140" cy="28" r="5"/></g><path d="M30 100 L100 40 L170 100Z" fill="${P.a}"/><rect x="46" y="96" width="108" height="90" fill="${C.cream}"/><rect x="86" y="132" width="28" height="54" fill="${C.wood}"/><circle cx="108" cy="160" r="2.5" fill="${K}"/><rect x="56" y="110" width="24" height="24" fill="${C.sky}"/><rect x="120" y="110" width="24" height="24" fill="${C.sky}"/><path d="M68 110v24M56 122h24M132 110v24M120 122h24" stroke-width="2.5"/></g>`,
  },
  hammer: {
    group: "in", particles: "dot", with: ["saw", "drill", "toolbox"],
    keys: ["hammer", "nagel", "werkzeug", "martillo", "clavo", "herramienta", "tool", "nail", "heimwerk", "bricolaje", "diy"],
    draw: () => `<g ${S} class="eb-swing" style="transform-origin:40% 90%"><rect x="88" y="70" width="18" height="112" rx="6" fill="${C.wood}" transform="rotate(-28 97 126)"/><path d="M60 52 h80 v26 h-80 q-14 -13 0 -26z" fill="${C.greyD}" transform="rotate(-28 100 65)"/></g><g ${S}><rect x="140" y="160" width="8" height="26" fill="${C.steel}"/><rect x="134" y="154" width="20" height="8" rx="2" fill="${C.steel}"/></g>`,
  },
  roller: {
    group: "in", particles: "dot", with: ["bucket", "brush", "house"],
    keys: ["streich", "farbe", "wand", "tapete", "maler", "pintar", "pintura", "pared", "rodillo", "paint", "wall", "roller", "wallpaper", "putz"],
    draw: (P) => `<g ${S}><rect x="30" y="120" width="140" height="66" fill="${C.cream}"/><path d="M30 120 h70 v66 h-70z" fill="${P.a}" opacity=".85"/><g class="eb-sway" style="transform-origin:50% 100%"><rect x="56" y="40" width="96" height="34" rx="12" fill="${P.a}"/><path d="M152 57 h14 v40 h-56 v20" fill="none"/><rect x="102" y="114" width="16" height="56" rx="6" fill="${C.wood}"/></g></g>`,
  },
  saw: {
    group: "in", particles: "dot", with: ["plank", "hammer", "drill"],
    keys: ["saege", "holz", "moebel", "sierra", "madera", "mueble", "saw", "wood", "furniture", "bretter", "tisch", "mesa", "regal"],
    draw: () => `<g ${S}><rect x="24" y="150" width="152" height="30" rx="4" fill="${C.wood}"/><path d="M40 165 h120" stroke="${C.woodD}" stroke-width="3"/><g class="eb-saw"><path d="M60 70 L170 120 L160 140 L52 92Z" fill="${C.steel}"/><path d="M58 92 l6 8 l6 -6 l6 8 l6 -6 l6 8 l6 -6 l6 8 l6 -6 l6 8 l6 -6 l6 8 l6 -6 l6 8 l6 -6 l6 8" fill="none" stroke-width="2.5"/><rect x="22" y="52" width="46" height="40" rx="12" fill="${C.red}" transform="rotate(24 45 72)"/><rect x="34" y="64" width="20" height="14" rx="5" fill="#fff" transform="rotate(24 44 71)"/></g></g>`,
  },
  drill: {
    group: "in", particles: "dot", with: ["hammer", "toolbox", "plug"],
    keys: ["bohr", "duebel", "schraub", "taladro", "taco", "tornillo", "drill", "screw", "anker", "aufhaeng", "colgar"],
    draw: (P) => `<g ${S}><rect x="40" y="62" width="100" height="44" rx="14" fill="${P.a}"/><path d="M78 104 l-10 66 h34 l4 -66z" fill="${P.a}"/><rect x="64" y="166" width="46" height="18" rx="5" fill="${C.greyD}"/><rect x="140" y="74" width="16" height="20" fill="${C.greyD}"/><g class="eb-spin" style="transform-origin:174px 84px"><path d="M156 80 h36 l-4 4 l4 4 h-36z" fill="${C.steel}"/></g></g>`,
  },
  wrench: {
    group: "in", particles: "dot", with: ["screwdriver", "toolbox", "bike"],
    keys: ["reparat", "repar", "werkstatt", "schraubenschl", "llave", "wrench", "repair", "fix", "wartung", "mantenimiento", "maintenance", "kaputt", "averia"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:50% 80%"><path d="M62 160 L128 76 a28 28 0 1 1 22 18 L84 178 a14 14 0 0 1 -22 -18z" fill="${C.steel}"/><path d="M142 46 l-12 14 l8 12 l16 -2 l8 -16" fill="${P.b || C.white}"/><circle cx="74" cy="168" r="5" fill="#fff"/></g>`,
  },
  screwdriver: {
    group: "in", particles: "dot", with: ["wrench", "drill"],
    keys: ["schraubendreh", "destornill", "screwdriver"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:50% 90%"><rect x="88" y="104" width="24" height="76" rx="10" fill="${P.a}"/><rect x="96" y="40" width="8" height="66" fill="${C.steel}"/><path d="M96 40 l4 -12 l4 12z" fill="${C.steel}"/></g>`,
  },
  toolbox: {
    group: "in", particles: "dot", with: ["hammer", "wrench", "drill"],
    keys: ["grundausstattung", "werkzeugkoffer", "caja de herramientas", "toolbox", "anfaenger", "grundlagen", "basicos", "basics"],
    draw: (P) => `<g ${S}><path d="M76 92 v-18 h48 v18" fill="none" stroke-width="6"/><rect x="30" y="92" width="140" height="90" rx="8" fill="${P.a}"/><rect x="30" y="92" width="140" height="26" rx="6" fill="${C.red}"/><rect x="88" y="110" width="24" height="16" rx="3" fill="${C.gold}"/></g><g ${S} class="eb-float"><rect x="56" y="50" width="12" height="44" fill="${C.wood}"/><path d="M48 46 h28 v12 h-28z" fill="${C.greyD}"/><path d="M130 40 l10 0 l0 50 l-10 0z" fill="${C.steel}"/></g>`,
  },
  key: {
    group: "in", particles: "sparkle", with: ["house", "lock"],
    keys: ["schluessel", "schloss", "llave", "cerradura", "key", "lock", "einbruch", "seguridad en casa"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:30% 30%"><circle cx="64" cy="70" r="34" fill="${C.gold}"/><circle cx="64" cy="70" r="12" fill="#fff"/><path d="M90 90 L160 160 l-10 10 l-10 -10 l-8 8 l-10 -10 l-8 8 L74 106z" fill="${C.gold}"/></g>`,
  },
  lamp: {
    group: "in", particles: "dot", with: ["armchair", "plant", "frame"],
    keys: ["lampe", "licht", "leuchte", "beleucht", "deko", "lampara", "luz", "iluminac", "decorac", "lamp", "light", "decor", "gemuetlich", "acogedor", "cosy"],
    draw: (P) => `<g ${S}>${glow(100, 112, 54)}<path d="M62 46 h76 l20 56 h-116z" fill="${P.a}"/><rect x="94" y="102" width="12" height="62" fill="${C.greyD}"/><path d="M60 186 q40 -26 80 0z" fill="${C.greyD}"/><circle cx="100" cy="110" r="10" fill="${C.yellow}" class="eb-glow"/></g>`,
  },
  bulb: {
    group: "in", particles: "sparkle", with: ["plug", "lamp", "meter"],
    keys: ["gluehbirne", "led", "bombilla", "idea", "bulb", "invent", "idee", "einfall", "creativ", "kreativ"],
    draw: (P) => `<g ${S}>${glow(100, 82, 66)}<path d="M100 28 a48 48 0 0 0 -28 87 q8 7 8 21 h40 q0 -14 8 -21 a48 48 0 0 0 -28 -87z" fill="${C.yellow}"/><path d="M86 112 l8 -26 l6 14 l6 -14 l8 26" fill="none" stroke-width="3"/><rect x="80" y="136" width="40" height="14" rx="4" fill="${C.greyD}"/><rect x="84" y="150" width="32" height="12" rx="4" fill="${C.grey}"/><path d="M92 162 h16 l-4 10 h-8z" fill="${C.greyD}"/></g>`,
  },
  armchair: {
    group: "in", particles: "dot", with: ["lamp", "plant", "frame"],
    keys: ["sessel", "sofa", "wohnzimmer", "sillon", "salon", "interior", "living", "armchair", "couch", "mueble tapizado", "einricht"],
    draw: (P) => `<g ${S}><rect x="48" y="50" width="104" height="80" rx="22" fill="${P.a}"/><rect x="28" y="96" width="34" height="70" rx="14" fill="${P.a}"/><rect x="138" y="96" width="34" height="70" rx="14" fill="${P.a}"/><rect x="58" y="118" width="84" height="40" rx="10" fill="${P.b}"/><path d="M44 166 v18 M156 166 v18" stroke-width="7"/></g>`,
  },
  frame: {
    group: "in", particles: "dot", with: ["lamp", "armchair"],
    keys: ["bild", "rahmen", "galerie", "cuadro", "marco", "frame", "picture", "wanddeko"],
    draw: (P) => `<g ${S}><rect x="40" y="36" width="120" height="96" rx="4" fill="${C.wood}"/><rect x="54" y="50" width="92" height="68" fill="${C.sky}"/><path d="M54 118 l30 -32 l22 20 l14 -12 l26 24z" fill="${C.green}"/><circle cx="126" cy="70" r="9" fill="${C.yellow}" class="eb-glow"/></g><g ${S}><rect x="70" y="150" width="60" height="36" rx="6" fill="${P.a}"/></g>`,
  },
  brick: {
    group: "in", particles: "dot", with: ["house", "trowel"],
    keys: ["ziegel", "mauer", "stein", "ladrillo", "muro", "acabado", "brick", "beton", "hormigon", "concrete", "fliese", "azulejo", "tile", "suelo", "floor", "materiales de construccion", "bodenbelag", "fussboden"],
    draw: () => `<g ${S}>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${30 + c * 48 + (r % 2 ? 24 : 0) - (r % 2 && c === 2 ? 0 : 0)}" y="${70 + r * 28}" width="44" height="24" rx="3" fill="${(r + c) % 2 ? C.brick : "#d9714f"}"/>`).join("")).join("")}</g><g ${S} class="eb-swing" style="transform-origin:150px 60px"><path d="M120 30 l40 0 l-10 28 h-20z" fill="${C.steel}"/><rect x="134" y="8" width="12" height="24" rx="4" fill="${C.wood}"/></g>`,
  },
  trowel: {
    group: "in", particles: "dot", with: ["brick"],
    keys: ["kelle", "llana", "trowel", "fugen", "juntas"],
    draw: () => `<g ${S} class="eb-sway"><path d="M60 130 L100 40 L140 130z" fill="${C.steel}"/><rect x="94" y="130" width="12" height="34" fill="${C.greyD}"/><rect x="86" y="160" width="28" height="22" rx="8" fill="${C.wood}"/></g>`,
  },
  plank: {
    group: "in", particles: "dot", with: ["saw", "hammer"],
    keys: ["holzart", "brett", "parkett", "dielen", "tablon", "parquet", "plank", "lumber", "lasur", "barniz", "varnish", "oel", "aceite"],
    draw: () => `<g ${S}><rect x="20" y="128" width="160" height="26" rx="4" fill="${C.wood}"/><rect x="34" y="102" width="140" height="26" rx="4" fill="#d29a60"/><rect x="26" y="154" width="150" height="26" rx="4" fill="${C.woodD}"/><ellipse cx="62" cy="64" rx="34" ry="34" fill="#e2b07a"/><circle cx="62" cy="64" r="22" fill="none" stroke-width="2.5"/><circle cx="62" cy="64" r="10" fill="none" stroke-width="2.5"/></g>`,
  },
  faucet: {
    group: "in", particles: "bubble", with: ["sink", "drop", "bathtub"],
    keys: ["wasserhahn", "armatur", "kueche", "bad ", "badezimmer", "grifo", "cocina", "bano", "faucet", "tap", "kitchen", "bathroom", "spuele", "fregadero", "sink", "abfluss", "desague", "drain", "silikon", "dichtung"],
    draw: (P) => `<g ${S}><path d="M40 70 h70 q30 0 30 30 v14 h-20 v-12 q0 -10 -10 -10 h-70z" fill="${C.steel}"/><rect x="64" y="42" width="16" height="28" fill="${C.steel}"/><rect x="50" y="34" width="44" height="12" rx="6" fill="${P.a}"/></g>${drops(130, 122, C.water, 3, 0)}<g ${S}><path d="M60 160 h140 v26 h-140z" fill="#fff" stroke="none"/><path d="M80 158 q50 30 100 0" fill="${C.water}" opacity=".6"/></g>`,
  },
  sink: {
    group: "in", particles: "bubble", with: ["faucet"],
    keys: ["waschbecken", "lavabo", "becken", "basin"],
    draw: (P) => `<g ${S}><path d="M30 110 h140 q0 60 -70 60 q-70 0 -70 -60z" fill="#fff"/><rect x="90" y="168" width="20" height="18" fill="${C.steel}"/><path d="M90 60 h20 v26 q0 6 6 6 h18" fill="none" stroke-width="10" stroke="${C.steel}"/><path d="M90 60 h20 v26 q0 6 6 6 h18" fill="none" stroke-width="3"/></g>${drops(134, 100, C.water, 2, 0)}`,
  },
  drop: {
    group: "in", particles: "bubble", with: ["faucet", "sponge", "spray"],
    keys: ["fleck", "flecken", "mancha", "stain", "tropf", "gota", "drop", "wasser", "agua", "water", "feucht", "humedad", "damp", "schimmel", "moho", "mould", "mold", "kalk", "cal"],
    draw: (P) => `<g ${S} class="eb-float"><path d="M100 26 q52 66 52 100 a52 52 0 0 1 -104 0 q0 -34 52 -100z" fill="${C.water}"/><path d="M74 128 a26 26 0 0 0 22 26" fill="none" stroke="#fff" stroke-width="6"/></g>`,
  },
  // ── plants and garden ────────────────────────────────────────────
  monstera: {
    group: "in", particles: "leaf", with: ["wateringCan", "cactus", "plant"],
    keys: ["monstera", "zimmerpflanze", "zimmerpflanzen", "calathea", "sansevieria", "bogenhanf", "orchidee", "orquidea", "orchid", "kalanchoe", "zamioculcas", "gummibaum", "drachenbaum", "yucca", "efeutute", "geigenfeige", "einblatt", "farn", "helecho", "fern", "planta de interior", "houseplant", "indoor plant", "blattpflanze", "philodendron", "efeutute", "pothos", "ficus", "palme im", "umtopf", "repot", "trasplant"],
    draw: () => `<g ${S}>${pot(C.brick)}</g><g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M100 134 q-4 -40 -30 -66 M100 134 q6 -50 34 -76 M100 134 v-90" fill="none" stroke="${C.green}" stroke-width="6"/><path d="M70 68 q-40 -6 -42 -36 q34 -8 50 26z" fill="${C.leaf}"/><path d="M134 58 q34 -22 46 2 q-18 32 -50 10z" fill="${C.green}"/><path d="M100 44 q-24 -24 0 -40 q24 16 0 40z" fill="${C.leaf}"/><path d="M44 40 l20 12 M172 54 l-24 6" stroke="#fff" stroke-width="3"/></g>`,
  },
  plant: {
    group: "in", particles: "leaf", with: ["wateringCan", "monstera"],
    keys: ["pflanze", "pflanzen", "planta", "plantas", "plant", "gruen", "verde", "green", "topf", "maceta", "duenger", "abono", "fertili", "erde", "sustrato", "soil", "licht fuer", "standort"],
    draw: () => `<g ${S}>${pot(C.orange)}</g><g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M100 134 v-70" stroke="${C.green}" stroke-width="6"/>${leafShape(100, 104, 26, -55)}${leafShape(100, 96, 28, 55, C.green)}${leafShape(100, 74, 24, -30, C.lime)}${leafShape(100, 70, 22, 30)}</g>`,
  },
  cactus: {
    group: "in", particles: "sparkle", with: ["plant", "sun"],
    keys: ["kaktus", "sukkulent", "cactus", "suculent", "succulent", "aloe"],
    draw: () => `<g ${S}>${pot("#d9714f")}</g><g ${S} class="eb-sway" style="transform-origin:50% 100%"><rect x="80" y="44" width="40" height="96" rx="20" fill="${C.green}"/><path d="M80 104 h-18 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 20 0 v14 h8" fill="${C.green}"/><path d="M120 92 h14 a10 10 0 0 0 10 -10 v-16 a10 10 0 0 0 -20 0 v8 h-4" fill="${C.green}"/><circle cx="100" cy="40" r="9" fill="${C.pink}"/></g>`,
  },
  wateringCan: {
    group: "out", particles: "drop", with: ["plant", "flower", "seedling"],
    keys: ["giess", "bewaesser", "regar", "riego", "water your", "watering", "giesskanne", "regadera", "urlaubsbewaesserung", "tropfanlage", "drip"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:30% 100%"><path d="M50 80 h80 v80 a10 10 0 0 1 -10 10 h-60 a10 10 0 0 1 -10 -10z" fill="${P.a}"/><path d="M130 100 l46 -34 l8 10 l-46 40z" fill="${P.a}"/><path d="M60 80 q30 -46 60 0" fill="none" stroke-width="7"/><rect x="174" y="58" width="16" height="22" rx="4" fill="${C.greyD}" transform="rotate(-36 182 69)"/></g>${drops(186, 92, C.water, 3, 8)}`,
  },
  seedling: {
    group: "out", particles: "leaf", with: ["wateringCan", "plant", "seedBag"],
    keys: ["keim", "saat", "saatgut", "aussaat", "steckling", "vermehr", "jungpflanze", "semilla", "siembra", "esqueje", "germin", "plantel", "seed", "sow", "cutting", "propagat", "anzucht", "ableger"],
    draw: () => `<g ${S}><path d="M28 186 q72 -44 144 0z" fill="${C.brown}"/></g><g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M100 170 v-62" stroke="${C.green}" stroke-width="6"/><path d="M100 120 q-48 4 -52 -38 q46 -2 52 38z" fill="${C.leaf}"/><path d="M100 110 q40 -4 48 -42 q-44 -6 -48 42z" fill="${C.lime}"/></g>`,
  },
  seedBag: {
    group: "out", particles: "leaf", with: ["seedling"],
    keys: ["saattuete", "sobre de semillas", "seed packet", "sortenwahl"],
    draw: () => `<g ${S} class="eb-sway"><path d="M56 40 h88 v136 h-88z" fill="${C.cream}"/><path d="M56 40 l10 -12 h68 l10 12" fill="${C.wood}"/><circle cx="100" cy="96" r="30" fill="${C.leaf}"/><path d="M100 126 v-40 M100 98 q-14 -4 -16 -18 M100 104 q14 -4 18 -16" stroke-width="3" fill="none"/><path d="M70 146 h60 M70 160 h40" stroke-width="3"/></g>`,
  },
  carrot: {
    group: "out", particles: "leaf", with: ["seedling", "tomato", "cabbage"],
    keys: ["moehre", "karotte", "gemuese", "gemuesegarten", "beet", "zanahoria", "huerto", "hortaliza", "verdura", "carrot", "vegetable", "veg", "hochbeet", "bancal", "raised bed"],
    draw: () => `<g ${S}><path d="M20 186 q80 -40 160 0z" fill="${C.brown}"/></g><g ${S} class="eb-sway" style="transform-origin:50% 60%"><path d="M100 168 L72 76 q28 -16 56 0z" fill="${C.orange}"/><path d="M84 100 h12 M90 124 h12 M94 146 h8" stroke-width="3"/><path d="M100 72 q-30 -30 -18 -54 q14 20 18 40 q4 -30 22 -42 q6 30 -10 52 q28 -14 40 -4 q-16 20 -52 8z" fill="${C.leaf}"/></g>`,
  },
  tomato: {
    group: "out", particles: "leaf", with: ["carrot", "basil", "plant"],
    keys: ["tomate", "tomaten", "tomato", "sommer", "verano", "summer", "paprika", "pimiento"],
    draw: () => `<g ${S} class="eb-float"><circle cx="100" cy="112" r="62" fill="${C.red}"/><path d="M100 54 l-24 -10 l16 18 l-26 6 l28 4 l-6 22 l12 -18 l12 18 l-6 -22 l28 -4 l-26 -6 l16 -18z" fill="${C.green}"/><path d="M62 96 a40 40 0 0 1 22 -26" fill="none" stroke="#fff" stroke-width="7" opacity=".7"/></g>`,
  },
  apple: {
    group: "out", particles: "petal", with: ["tree", "berries", "basket"],
    keys: ["apfel", "obst", "obstbaum", "manzana", "fruta", "frutal", "apple", "fruit", "orchard", "birne", "pera", "pear", "kirsch", "cereza", "cherry", "streuobst"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 30%"><path d="M100 64 q-30 -18 -54 4 q-26 30 -6 76 q18 36 46 30 q14 -6 28 0 q28 6 46 -30 q20 -46 -6 -76 q-24 -22 -54 -4z" fill="${C.red}"/><path d="M100 64 q2 -24 14 -34" fill="none" stroke-width="5"/><path d="M110 40 q22 -22 46 -8 q-20 24 -46 8z" fill="${C.leaf}"/><path d="M60 94 a34 34 0 0 1 14 -22" fill="none" stroke="#fff" stroke-width="7" opacity=".7"/></g>`,
  },
  berries: {
    group: "out", particles: "petal", with: ["apple", "basket"],
    keys: ["beere", "erdbeer", "himbeer", "johannis", "heidelbeer", "fresa", "frambues", "arandano", "baya", "berry", "berries", "strawberr"],
    draw: () => `<g ${S} class="eb-float"><path d="M100 60 q60 0 52 52 q-10 52 -52 72 q-42 -20 -52 -72 q-8 -52 52 -52z" fill="${C.red}"/><path d="M100 64 l-30 -18 l18 22 l-26 4 l38 2 l0 0 l38 -2 l-26 -4 l18 -22z" fill="${C.green}"/><g fill="${C.yellow}" ${N}>${[[80, 96], [112, 92], [96, 118], [126, 120], [72, 126], [100, 148], [118, 146], [84, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="4.5"/>`).join("")}</g></g>`,
  },
  flower: {
    group: "out", particles: "petal", with: ["bee", "butterfly", "seedling"],
    keys: ["bluete", "blume", "bluehwiese", "wildblume", "staude", "flor", "flores", "jardin", "flower", "bloom", "garden", "garten", "insekt", "nuetzling", "naturgarten", "bestaeub", "polliniz", "rose", "lavendel", "lavanda"],
    draw: () => `<g ${S}><path d="M100 186 v-88" stroke="${C.green}" stroke-width="6"/>${leafShape(100, 160, 20, -60)}${leafShape(100, 150, 20, 60, C.green)}</g><g ${S} class="eb-spin-slow" style="transform-origin:100px 76px">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="100" cy="46" rx="16" ry="26" fill="${C.pink}" transform="rotate(${a} 100 76)"/>`).join("")}<circle cx="100" cy="76" r="18" fill="${C.yellow}"/></g>`,
  },
  bee: {
    group: "out", particles: "petal", with: ["flower"],
    keys: ["biene", "hummel", "wildbiene", "abeja", "bee", "bumblebee", "insektenhotel", "hotel de insectos"],
    draw: () => `<g class="eb-fly"><g ${S}><g class="eb-flap" style="transform-origin:100px 80px"><ellipse cx="84" cy="62" rx="22" ry="30" fill="#fff" opacity=".9" transform="rotate(-24 84 62)"/><ellipse cx="118" cy="60" rx="22" ry="30" fill="#fff" opacity=".9" transform="rotate(24 118 60)"/></g><ellipse cx="100" cy="112" rx="50" ry="36" fill="${C.yellow}"/><path d="M82 80 v64 M106 78 v68" stroke-width="12" stroke="${K}"/><circle cx="146" cy="104" r="20" fill="${C.yellow}"/><circle cx="152" cy="98" r="4" fill="${K}"/><path d="M52 112 l-14 0" stroke-width="5"/></g></g>`,
  },
  butterfly: {
    group: "out", particles: "petal", with: ["flower"],
    keys: ["schmetterling", "mariposa", "butterfly", "raupe", "oruga"],
    draw: () => `<g class="eb-fly"><g ${S}><g class="eb-flap" style="transform-origin:100px 100px"><path d="M100 100 q-60 -70 -70 -20 q-6 34 70 20z" fill="${C.orange}"/><path d="M100 100 q60 -70 70 -20 q6 34 -70 20z" fill="${C.orange}"/><path d="M100 104 q-46 6 -44 40 q20 18 44 -40z" fill="${C.purple}"/><path d="M100 104 q46 6 44 40 q-20 18 -44 -40z" fill="${C.purple}"/></g><rect x="95" y="70" width="10" height="70" rx="5" fill="${K}"/></g></g>`,
  },
  ladybug: {
    group: "out", particles: "leaf", with: ["leaf", "magnifier"],
    keys: ["marienkaefer", "blattlaus", "laeuse", "mariquita", "pulgon", "ladybird", "ladybug", "aphid", "schaedling", "plaga", "pest", "trauermuecke", "spinnmilbe", "thrips", "trips", "milben", "woll", "schmierlaus", "cochinilla", "mealybug", "nematod"],
    draw: () => `<g ${S}><path d="M20 160 q80 -60 170 10 q-90 40 -170 -10z" fill="${C.leaf}"/></g><g ${S} class="eb-crawl"><path d="M70 120 a40 40 0 0 1 80 0z" fill="${C.red}" transform="translate(-10 0)"/><path d="M100 82 v38" stroke-width="3" transform="translate(-10 0)"/><circle cx="148" cy="112" r="14" fill="${K}"/>${[[78, 104], [104, 100], [86, 114], [116, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${K}"/>`).join("")}</g>`,
  },
  snail: {
    group: "out", particles: "drop", with: ["lettuce", "flower"],
    keys: ["schnecke", "caracol", "babosa", "snail", "slug "],
    draw: () => `<g ${S} class="eb-crawl"><path d="M30 170 q0 -20 30 -20 h90 q20 0 26 -30 l6 -20 l-4 -14 M176 90 l-12 -12" fill="${C.skin}" stroke-width="4"/><circle cx="96" cy="118" r="44" fill="${C.wood}"/><path d="M96 118 m-30 0 a30 30 0 1 1 30 30 a20 20 0 1 1 -20 -20 a10 10 0 1 1 10 10" fill="none" stroke-width="4"/></g>`,
  },
  lettuce: {
    group: "out", particles: "leaf", with: ["snail", "carrot"],
    keys: ["salat", "lechuga", "lettuce", "spinat", "espinaca", "spinach", "mangold", "acelga"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M100 180 q-70 0 -70 -60 q0 -40 30 -50 q10 -30 40 -24 q30 -6 40 24 q30 10 30 50 q0 60 -70 60z" fill="${C.lime}"/><path d="M100 180 q-40 -10 -40 -60 q20 -40 40 -40 q20 0 40 40 q0 50 -40 60z" fill="${C.leaf}"/><path d="M100 176 v-80" stroke-width="3"/></g>`,
  },
  magnifier: {
    group: "in", particles: "sparkle", with: ["leaf", "ladybug", "gem"],
    keys: ["lupe", "pruef", "erkenn", "diagnos", "lupa", "identific", "magnif", "check", "inspect", "erkennen", "bestimmen", "identify", "kontroll", "revision", "probleme", "problema", "problem"],
    draw: () => `<g ${S} class="eb-scan"><circle cx="86" cy="86" r="50" fill="${C.sky}" opacity=".85"/><circle cx="86" cy="86" r="50" fill="none" stroke-width="12" stroke="${C.greyD}"/><circle cx="86" cy="86" r="50" fill="none"/><path d="M122 122 l44 44" stroke-width="18" stroke="${C.wood}"/><path d="M62 70 a28 28 0 0 1 22 -16" fill="none" stroke="#fff" stroke-width="6"/></g>`,
  },
  basil: {
    group: "in", particles: "leaf", with: ["plant", "tomato", "knife"],
    keys: ["basilikum", "kraeuter", "kraut", "albahaca", "hierba", "aromatic", "herb", "basil", "petersilie", "perejil", "parsley", "minze", "menta", "mint", "rosmarin", "romero", "rosemary", "schnittlauch", "thymian", "tomillo"],
    draw: () => `<g ${S}>${pot(C.wood)}</g><g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M100 134 v-74 M100 112 l-24 -20 M100 100 l26 -22" stroke="${C.green}" stroke-width="5" fill="none"/>${leafShape(76, 94, 18, -70)}${leafShape(126, 80, 18, 70, C.green)}${leafShape(100, 62, 20, 0)}${leafShape(88, 120, 14, -100, C.lime)}${leafShape(114, 116, 14, 100)}</g>`,
  },
  planter: {
    group: "out", particles: "petal", with: ["flower", "basil", "tomato"],
    keys: ["balkon", "terrasse", "balkonkasten", "kuebel", "balcon", "terraza", "jardinera", "balcony", "terrace", "patio", "window box"],
    draw: () => `<g ${S}><rect x="20" y="186" width="160" height="0" fill="none"/><path d="M24 128 h152 l-10 52 h-132z" fill="${C.wood}"/><path d="M36 150 h128" stroke-width="3"/></g><g ${S} class="eb-sway" style="transform-origin:50% 100%">${[50, 100, 150].map((x, i) => `<path d="M${x} 128 v-40" stroke="${C.green}" stroke-width="5"/><circle cx="${x}" cy="${78 - (i % 2) * 10}" r="16" fill="${[C.pink, C.yellow, C.red][i]}"/><circle cx="${x}" cy="${78 - (i % 2) * 10}" r="6" fill="${C.orange}"/>`).join("")}</g>`,
  },
  compost: {
    group: "out", particles: "leaf", with: ["worm", "seedling", "leaf"],
    keys: ["kompost", "boden", "humus", "mulch", "compost", "suelo", "lombri", "soil", "abono organico", "gruenduengung", "wurm", "worm"],
    draw: () => `<g ${S}><path d="M40 70 h120 l-8 112 h-104z" fill="${C.green}"/><path d="M40 70 h120 v-14 h-120z" fill="#2f7d47"/><path d="M58 96 h84 M56 124 h88 M54 152 h92" stroke-width="3"/><path d="M80 60 q20 -40 40 0" fill="none" stroke-width="5"/></g><g ${S} class="eb-float">${leafShape(60, 46, 14, -40, C.orange)}${leafShape(140, 40, 14, 40, C.lime)}</g>`,
  },
  worm: {
    group: "out", particles: "leaf", with: ["compost"],
    keys: ["regenwurm", "lombriz", "earthworm"],
    draw: () => `<g ${S}><path d="M20 186 q80 -50 160 0z" fill="${C.brown}"/></g><g class="eb-crawl"><path d="M50 150 q20 -30 40 0 t40 0 q14 -24 30 -4" fill="none" stroke="${C.pink}" stroke-width="18" stroke-linecap="round"/><path d="M50 150 q20 -30 40 0 t40 0 q14 -24 30 -4" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round" opacity=".4"/><circle cx="162" cy="144" r="2.5" fill="${K}"/></g>`,
  },
  cycle: {
    group: "out", particles: "leaf", with: ["carrot", "seedling", "cabbage"],
    keys: ["mischkultur", "fruchtfolge", "rotation", "asociacion", "companion", "kreislauf", "ciclo", "cycle", "nachbar", "vecino"],
    draw: () => `<g ${S} class="eb-spin-slow" style="transform-origin:100px 100px"><path d="M100 34 a66 66 0 0 1 62 44 l12 -6 l-6 30 l-26 -14 l12 -6 a50 50 0 0 0 -54 -32z" fill="${C.green}"/><path d="M166 112 a66 66 0 0 1 -50 52 l2 14 l-26 -16 l22 -20 l2 14 a50 50 0 0 0 38 -44z" fill="${C.orange}"/><path d="M80 162 a66 66 0 0 1 -44 -60 l-12 2 l18 -26 l16 24 l-12 2 a50 50 0 0 0 34 46z" fill="${C.yellow}"/></g><g ${S} class="eb-float">${leafShape(100, 112, 18, 0)}</g>`,
  },
  tree: {
    group: "out", particles: "leaf", with: ["house", "bird", "apple"],
    keys: ["baum", "baeume", "generation", "grosseltern", "oma", "opa", "arbol", "abuel", "tree", "grandparent", "familie", "family", "wald", "bosque", "forest", "hecke", "seto"],
    draw: () => `<g ${S}><path d="M90 186 v-60 q-20 -10 -24 -24 M110 186 v-56 q16 -6 22 -22" fill="${C.wood}" stroke-width="4"/><rect x="88" y="120" width="24" height="66" fill="${C.wood}"/></g><g ${S} class="eb-sway" style="transform-origin:50% 70%"><circle cx="100" cy="72" r="50" fill="${C.green}"/><circle cx="62" cy="96" r="32" fill="${C.leaf}"/><circle cx="140" cy="94" r="34" fill="${C.leaf}"/><circle cx="84" cy="62" r="6" fill="${C.red}"/><circle cx="122" cy="80" r="6" fill="${C.red}"/><circle cx="72" cy="100" r="6" fill="${C.red}"/></g>`,
  },
  leaf: {
    group: "out", particles: "leaf", with: ["tree", "teaLeaf"],
    keys: ["blatt", "laub", "hoja", "leaf", "leaves", "herbstlaub"],
    draw: () => `<g ${S} class="eb-sway"><path d="M40 160 q-10 -110 120 -130 q16 110 -120 130z" fill="${C.leaf}"/><path d="M40 160 q50 -50 100 -112 M76 120 l-6 -30 M100 94 l-4 -30 M100 94 l30 4 M76 120 l32 6" fill="none" stroke-width="3"/></g>`,
  },
  // ── kitchen, cooking, baking, preserving ─────────────────────────
  potCook: {
    group: "in", particles: "dot", with: ["knife", "pan", "jar"],
    keys: ["kochen", "rezept", "gericht", "eintopf", "suppe", "cocinar", "receta", "plato", "guiso", "sopa", "cook", "recipe", "dinner", "soup", "stew", "abendessen", "cena", "brueh", "caldo", "broth", "garen", "hervir", "boil"],
    draw: (P) => `${steam(100, 70, 40)}<g ${S}><rect x="40" y="86" width="120" height="84" rx="12" fill="${P.a}"/><rect x="30" y="78" width="140" height="16" rx="6" fill="${C.greyD}"/><path d="M40 112 h-16 M160 112 h16" stroke-width="10"/><rect x="88" y="66" width="24" height="12" rx="4" fill="${C.greyD}"/></g>`,
  },
  pan: {
    group: "in", particles: "dot", with: ["potCook", "knife", "egg"],
    keys: ["pfanne", "braten", "sartén", "sarten", "freir", "frying", "pan", "fry", "saute", "egg", "ei ", "huevo", "omelett", "tortilla", "schnell", "rapido", "weeknight", "quick"],
    draw: () => `${steam(84, 92, 30)}<g ${S}><ellipse cx="84" cy="128" rx="66" ry="30" fill="${C.greyD}"/><ellipse cx="84" cy="122" rx="56" ry="22" fill="#3b4652"/><path d="M146 120 l48 -16" stroke-width="12" stroke="${C.wood}"/><path d="M146 120 l48 -16" stroke-width="3"/><ellipse cx="80" cy="120" rx="26" ry="12" fill="#fff"/><circle cx="84" cy="118" r="8" fill="${C.yellow}"/></g>`,
  },
  egg: {
    group: "in", particles: "dot", with: ["pan", "whisk"],
    keys: ["eier", "huevos", "eggs"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M100 30 q50 0 50 90 a50 50 0 0 1 -100 0 q0 -90 50 -90z" fill="${C.cream}"/><path d="M72 90 a30 30 0 0 1 14 -30" fill="none" stroke="#fff" stroke-width="6"/></g>`,
  },
  knife: {
    group: "in", particles: "dot", with: ["board", "tomato", "carrot"],
    keys: ["messer", "schneid", "cuchillo", "cortar", "knife", "chop", "cut", "slice", "schaerf", "afilar", "sharpen", "kuechenwissen", "technik", "basics"],
    draw: () => `<g ${S}><rect x="20" y="140" width="160" height="40" rx="10" fill="${C.wood}"/><circle cx="160" cy="160" r="6" fill="#fff"/></g><g ${S} class="eb-chop" style="transform-origin:150px 120px"><path d="M30 120 q60 -70 110 -60 l4 26 q-60 -6 -114 34z" fill="${C.steel}"/><rect x="138" y="58" width="50" height="22" rx="8" fill="${K}" transform="rotate(10 160 70)"/></g><g ${S}><circle cx="70" cy="150" r="10" fill="${C.orange}"/><circle cx="96" cy="152" r="10" fill="${C.orange}"/></g>`,
  },
  board: {
    group: "in", particles: "dot", with: ["knife"],
    keys: ["brett", "tabla", "board", "mise en place"],
    draw: () => `<g ${S} class="eb-float"><rect x="30" y="70" width="140" height="96" rx="16" fill="${C.wood}"/><circle cx="150" cy="90" r="8" fill="#fff"/><circle cx="76" cy="122" r="16" fill="${C.red}"/><circle cx="110" cy="126" r="12" fill="${C.leaf}"/></g>`,
  },
  planner: {
    group: "in", particles: "dot", with: ["jar", "potCook", "calendar"],
    keys: ["wochenplan", "meal prep", "meal-prep", "plan", "planung", "planificac", "menu semanal", "batch", "vorkochen", "einkaufsliste", "lista de la compra", "shopping list", "planner"],
    draw: (P) => `<g ${S}><rect x="40" y="34" width="120" height="150" rx="10" fill="#fff"/><rect x="40" y="34" width="120" height="30" rx="10" fill="${P.a}"/>${[0, 1, 2, 3].map((i) => `<rect x="54" y="${78 + i * 26}" width="14" height="14" rx="3" fill="${i < 2 ? C.leaf : "#fff"}"/><path d="M78 ${85 + i * 26} h66" stroke-width="3"/>`).join("")}<path d="M57 85 l4 4 l6 -8 M57 111 l4 4 l6 -8" stroke="#fff" stroke-width="3" fill="none"/></g><g ${S} class="eb-sway"><rect x="146" y="70" width="12" height="80" rx="3" fill="${C.yellow}" transform="rotate(20 152 110)"/></g>`,
  },
  loaf: {
    group: "in", particles: "dot", with: ["wheat", "rollingPin", "oven"],
    keys: ["brot", "backen", "sauerteig", "teig", "pan ", "masa madre", "hornear", "masa", "bread", "bake", "baking", "sourdough", "dough", "loaf", "broetchen", "hefe", "levadura", "yeast", "mehl", "harina", "flour"],
    draw: () => `${steam(100, 62, 30)}<g ${S}><path d="M30 150 q0 -80 70 -80 q70 0 70 80 q0 26 -20 26 h-100 q-20 0 -20 -26z" fill="#d89a52"/><path d="M66 102 l-10 22 M100 92 v26 M134 102 l10 22" stroke-width="5"/></g>`,
  },
  wheat: {
    group: "out", particles: "dot", with: ["loaf"],
    keys: ["getreide", "weizen", "dinkel", "roggen", "trigo", "cereal", "centeno", "espelta", "wheat", "grain", "rye", "spelt"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M100 186 v-140" stroke="${C.gold}" stroke-width="5"/>${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="88" cy="${60 + i * 20}" rx="9" ry="15" fill="${C.gold}" transform="rotate(-30 88 ${60 + i * 20})"/><ellipse cx="112" cy="${60 + i * 20}" rx="9" ry="15" fill="${C.gold}" transform="rotate(30 112 ${60 + i * 20})"/>`).join("")}<ellipse cx="100" cy="44" rx="8" ry="14" fill="${C.gold}"/></g>`,
  },
  rollingPin: {
    group: "in", particles: "dot", with: ["loaf", "spiral"],
    keys: ["nudelholz", "rodillo de cocina", "rolling pin", "ausrollen", "estirar", "kekse", "galleta", "cookie", "plaetzchen", "kuchen", "tarta", "cake"],
    draw: () => `<g ${S}><ellipse cx="100" cy="164" rx="80" ry="18" fill="${C.cream}"/></g><g ${S} class="eb-roll"><rect x="40" y="110" width="120" height="34" rx="16" fill="${C.wood}"/><rect x="12" y="120" width="30" height="14" rx="7" fill="${C.woodD}"/><rect x="158" y="120" width="30" height="14" rx="7" fill="${C.woodD}"/></g>`,
  },
  spiral: {
    group: "in", particles: "dot", with: ["loaf", "coffeeCup", "rollingPin"],
    keys: ["bolleria", "croissant", "zimtschnecke", "ensaimada", "brioche", "bolle", "pastry", "bun", "suizo", "napolitana", "hojaldre", "gebaeck", "kuchen", "sweet"],
    draw: () => `<g ${S} class="eb-spin-slow" style="transform-origin:100px 110px"><circle cx="100" cy="110" r="66" fill="#d89a52"/><path d="M100 110 m0 -8 a8 8 0 1 1 -8 8 a18 18 0 1 1 18 18 a30 30 0 1 1 -30 -30 a44 44 0 1 1 44 44" fill="none" stroke="${C.woodD}" stroke-width="7"/></g><g fill="#fff" ${N}><circle cx="70" cy="80" r="4"/><circle cx="128" cy="92" r="4"/><circle cx="96" cy="150" r="4"/></g>`,
  },
  cheese: {
    group: "in", particles: "dot", with: ["knife", "jar", "milk"],
    keys: ["kaese", "queso", "cuajada", "cheese", "curd", "rennet", "cuajo", "lab", "afinado", "requeson", "mozzarella", "ricotta", "manchego", "feta"],
    draw: () => `<g ${S} class="eb-float"><path d="M24 150 L176 150 L176 106 L60 52 Q24 70 24 106Z" fill="${C.yellow}"/><path d="M24 106 L176 106" fill="none"/><circle cx="70" cy="126" r="11" fill="${C.gold}"/><circle cx="120" cy="134" r="7" fill="${C.gold}"/><circle cx="150" cy="122" r="9" fill="${C.gold}"/><circle cx="82" cy="84" r="7" fill="${C.gold}"/></g>`,
  },
  milk: {
    group: "in", particles: "bubble", with: ["cheese", "jar"],
    keys: ["milch", "leche", "milk", "joghurt", "yogur", "yogurt", "dairy", "lacteo"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M66 58 h68 v20 l14 20 v84 h-96 v-84 l14 -20z" fill="#fff"/><rect x="66" y="40" width="68" height="20" rx="4" fill="${C.blue}"/><rect x="52" y="112" width="96" height="40" fill="${C.sky}"/><path d="M80 132 q20 -14 40 0" fill="none" stroke-width="3"/></g>`,
  },
  jar: {
    group: "in", particles: "bubble", with: ["fermentJar", "cabbage", "basket"],
    keys: ["einmach", "einkoch", "konserv", "vorrat", "glas", "marmelade", "konfituere", "conserva", "frasco", "tarro", "mermelada", "jar", "preserv", "canning", "jam", "pantry", "storage", "almacen", "despensa", "haltbar", "durar"],
    draw: () => `<g ${S} class="eb-float"><rect x="56" y="40" width="88" height="24" rx="6" fill="${C.red}"/><path d="M48 70 q0 -8 10 -8 h84 q10 0 10 8 v100 q0 14 -14 14 h-76 q-14 0 -14 -14z" fill="#ffe0e0"/><path d="M50 96 h100 v74 q0 14 -14 14 h-72 q-14 0 -14 -14z" fill="${C.red}" opacity=".8"/><rect x="70" y="108" width="60" height="34" rx="4" fill="#fff"/><path d="M80 120 h40 M84 130 h32" stroke-width="3"/><path d="M60 80 v30" stroke="#fff" stroke-width="6"/></g>`,
  },
  fermentJar: {
    group: "in", particles: "bubble", with: ["jar", "cabbage", "milk"],
    keys: ["ferment", "kefir", "kombucha", "sauerkraut", "kimchi", "chucrut", "probiot", "fermento", "milchsaeure", "lacto"],
    draw: () => `<g ${S}><path d="M56 60 h88 v110 q0 14 -14 14 h-60 q-14 0 -14 -14z" fill="#f5f0e0"/><path d="M58 92 h84 v78 q0 12 -12 12 h-60 q-12 0 -12 -12z" fill="${C.lime}" opacity=".85"/><rect x="50" y="44" width="100" height="18" rx="6" fill="${C.wood}"/></g><g fill="#fff" ${N}>${[[76, 160], [100, 150], [122, 166], [88, 130], [114, 124]].map(([x, y], i) => `<circle class="eb-rise" style="animation-delay:${i * 0.5}s" cx="${x}" cy="${y}" r="${4 + (i % 2) * 2}"/>`).join("")}</g>`,
  },
  scale: {
    group: "in", particles: "dot", with: ["jar", "loaf", "ledger"],
    keys: ["waage", "wiegen", "gramm", "balanza", "pesar", "gramo", "medir", "scale", "weigh", "gram", "measure", "technik", "tecnica", "technique", "temperatura", "ph "],
    draw: (P) => `<g ${S}><rect x="34" y="120" width="132" height="62" rx="12" fill="${P.a}"/><rect x="66" y="136" width="68" height="28" rx="5" fill="#d9f5e5"/><path d="M78 150 h44" stroke-width="3"/><ellipse cx="100" cy="112" rx="70" ry="10" fill="${C.steel}"/></g><g ${S} class="eb-bounce"><path d="M60 100 q40 -70 80 0z" fill="#e8d0a8"/></g>`,
  },
  balance: {
    group: "in", particles: "coin", with: ["coins", "gem", "ledger"],
    keys: ["preis", "wert", "bewert", "valor", "tasac", "value", "apprais", "bewusster konsum", "consumo consciente", "conscious consum", "bewusst", "abwaegen", "fair"],
    draw: () => `<g ${S}><path d="M100 34 v130" stroke-width="6"/><path d="M70 182 h60 l-10 -18 h-40z" fill="${C.gold}"/><circle cx="100" cy="34" r="8" fill="${C.gold}"/></g><g ${S} class="eb-tilt" style="transform-origin:100px 50px"><path d="M30 50 h140" stroke-width="6"/><path d="M30 50 l-18 50 h36z M170 50 l-18 50 h36z" fill="none" stroke-width="3"/><path d="M8 100 q22 18 44 0z M148 100 q22 18 44 0z" fill="${C.gold}"/></g>`,
  },
  whisk: {
    group: "in", particles: "dot", with: ["egg", "loaf", "bowl"],
    keys: ["schneebesen", "ruehren", "batir", "varilla", "whisk", "mix", "emulsi", "sauce", "salsa", "sosse", "mayonesa"],
    draw: (P) => `<g ${S}><path d="M30 120 h140 q0 64 -70 64 q-70 0 -70 -64z" fill="${P.a}"/><ellipse cx="100" cy="120" rx="70" ry="12" fill="${C.cream}"/></g><g ${S} class="eb-stir" style="transform-origin:100px 120px"><rect x="94" y="20" width="12" height="44" rx="5" fill="${C.wood}"/><path d="M100 64 q-30 30 0 64 q30 -34 0 -64 M100 64 q-14 30 0 64 q14 -34 0 -64" fill="none" stroke-width="3"/></g>`,
  },
  flask: {
    group: "in", particles: "bubble", with: ["scale", "potCook", "atom"],
    keys: ["wissenschaft", "chemie", "ciencia", "quimica", "science", "chemistry", "maillard", "warum", "por que", "why", "experiment", "reaction", "reaccion"],
    draw: () => `<g ${S}><path d="M82 30 h36 M88 30 v50 l-46 82 q-6 18 14 18 h88 q20 0 14 -18 l-46 -82 v-50" fill="#eef7ff"/><path d="M60 140 h80 l16 26 q4 10 -8 10 h-96 q-12 0 -8 -10z" fill="${C.teal}"/></g><g fill="#fff" ${N}>${[[84, 156], [104, 148], [118, 160], [96, 120]].map(([x, y], i) => `<circle class="eb-rise" style="animation-delay:${i * 0.6}s" cx="${x}" cy="${y}" r="5"/>`).join("")}</g>`,
  },
  oven: {
    group: "in", particles: "dot", with: ["loaf", "potCook", "sponge"],
    keys: ["backofen", "ofen", "herd", "kochfeld", "horno", "vitro", "induccion", "fogon", "oven", "stove", "hob", "cooktop", "dunstabzug", "campana", "extractor", "mikrowelle", "microondas", "microwave"],
    draw: (P) => `<g ${S}><rect x="34" y="40" width="132" height="146" rx="10" fill="${C.steel}"/><rect x="34" y="40" width="132" height="30" rx="10" fill="${C.greyD}"/>${[60, 86, 114, 140].map((x) => `<circle cx="${x}" cy="55" r="7" fill="#fff"/>`).join("")}<rect x="50" y="84" width="100" height="78" rx="8" fill="#3b4652"/>${glow(100, 124, 30, C.orange)}<path d="M60 92 h80" stroke-width="3" stroke="#fff"/></g>`,
  },
  pumpkin: {
    group: "out", particles: "leaf", with: ["apple", "cabbage", "lantern"],
    keys: ["kuerbis", "herbst", "calabaza", "otono", "pumpkin", "autumn", "fall", "squash", "maronen", "castana", "pilz", "seta", "mushroom"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><ellipse cx="100" cy="124" rx="76" ry="56" fill="${C.orange}"/><ellipse cx="100" cy="124" rx="44" ry="56" fill="#f59f43"/><ellipse cx="100" cy="124" rx="14" ry="56" fill="${C.orange}"/><path d="M100 70 q-4 -24 12 -34" stroke-width="8" stroke="${C.woodD}" fill="none"/>${leafShape(118, 60, 16, 60)}</g>`,
  },
  asparagus: {
    group: "out", particles: "petal", with: ["basil", "carrot", "lettuce"],
    keys: ["spargel", "fruehling", "baerlauch", "rhabarber", "esparrago", "primavera", "asparagus", "spring", "radieschen", "rabano", "erbse", "guisante", "pea"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%">${[64, 84, 104, 124, 144].map((x, i) => `<path d="M${x} 186 v-${110 + (i % 2) * 20}" stroke="${i % 2 ? C.green : C.lime}" stroke-width="16"/><path d="M${x - 8} ${76 - (i % 2) * 20} q8 -16 16 0" fill="${C.purple}"/>`).join("")}<rect x="54" y="140" width="100" height="16" rx="4" fill="${C.red}"/></g>`,
  },
  cabbage: {
    group: "out", particles: "snow", with: ["pumpkin", "jar", "potCook"],
    keys: ["kohl", "winter", "wirsing", "gruenkohl", "rotkohl", "steckrueb", "repollo", "col ", "invierno", "berza", "cabbage", "kale", "invierno", "rueben", "nabo"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><circle cx="100" cy="116" r="66" fill="#7fbf6a"/><path d="M100 50 q-50 20 -40 100 M100 50 q50 20 40 100 M100 52 v120" fill="none" stroke-width="3"/><path d="M34 116 q-10 -40 30 -60 q-10 40 6 80z" fill="${C.green}"/><path d="M166 116 q10 -40 -30 -60 q10 40 -6 80z" fill="${C.green}"/></g>`,
  },
  plate: {
    group: "in", particles: "dot", with: ["potCook", "knife", "coffeeCup"],
    keys: ["essen", "gericht", "kulinar", "comida", "gastronom", "sabor", "plato tipico", "food", "dish", "cuisine", "taste", "restaurant", "mercado", "markt", "market"],
    draw: () => `${steam(100, 74, 30)}<g ${S}><ellipse cx="100" cy="140" rx="84" ry="34" fill="#fff"/><ellipse cx="100" cy="134" rx="58" ry="20" fill="${C.cream}"/><circle cx="80" cy="128" r="14" fill="${C.red}"/><circle cx="110" cy="124" r="12" fill="${C.leaf}"/><ellipse cx="118" cy="140" rx="18" ry="8" fill="${C.yellow}"/></g><g ${S}><path d="M14 104 v60 M8 104 v20 q6 8 12 0 v-20 M186 104 v60 M186 104 q-12 20 0 30" fill="none" stroke-width="4"/></g>`,
  },
  basket: {
    group: "in", particles: "coin", with: ["tag", "coins", "apple"],
    keys: ["einkauf", "lebensmittel", "supermarkt", "compra", "supermercado", "aliment", "groceries", "grocery", "shopping", "basket", "korb", "cesta", "food waste", "reste", "sobras", "leftover"],
    draw: () => `<g ${S}><path d="M60 80 q40 -60 80 0" fill="none" stroke-width="6"/><path d="M26 80 h148 l-16 100 h-116z" fill="${C.wood}"/><path d="M50 96 l12 72 M80 96 l4 72 M120 96 l-4 72 M150 96 l-12 72 M36 120 h128 M40 146 h120" stroke-width="3" fill="none"/></g><g ${S} class="eb-float"><circle cx="70" cy="72" r="16" fill="${C.red}"/><circle cx="104" cy="66" r="18" fill="${C.orange}"/><path d="M128 76 q10 -40 34 -36 q-6 30 -34 36z" fill="${C.leaf}"/></g>`,
  },
  // ── coffee and tea ───────────────────────────────────────────────
  coffeeCup: {
    group: "in", particles: "dot", with: ["bean", "grinder", "moka"],
    keys: ["kaffee", "espresso", "cappuccino", "latte", "cafe", "coffee", "crema", "filterkaffee", "kaffeegenuss", "barista", "milchschaum", "espuma"],
    draw: () => `${steam(96, 76, 36)}<g ${S}><path d="M44 86 h104 v40 a52 52 0 0 1 -104 0z" fill="#fff"/><path d="M148 96 h10 a20 20 0 0 1 0 40 h-14" fill="none" stroke-width="8"/><ellipse cx="96" cy="88" rx="50" ry="8" fill="${C.coffee}"/><ellipse cx="96" cy="180" rx="76" ry="8" fill="${C.steel}"/></g>`,
  },
  bean: {
    group: "in", particles: "dot", with: ["coffeeCup", "grinder"],
    keys: ["bohne", "roest", "arabica", "robusta", "grano", "tueste", "tostad", "bean", "roast", "herkunft", "origen", "origin", "sorte", "variedad", "variety"],
    draw: () => `<g ${S} class="eb-spin-slow" style="transform-origin:100px 100px"><ellipse cx="100" cy="100" rx="48" ry="66" fill="${C.coffee}" transform="rotate(30 100 100)"/><path d="M76 52 q40 40 0 96" fill="none" stroke="#3d2314" stroke-width="7" transform="rotate(30 100 100)"/></g><g ${S} class="eb-float"><ellipse cx="160" cy="54" rx="14" ry="20" fill="${C.coffee}" transform="rotate(-20 160 54)"/><ellipse cx="40" cy="150" rx="12" ry="18" fill="${C.coffee}" transform="rotate(40 40 150)"/></g>`,
  },
  grinder: {
    group: "in", particles: "dot", with: ["bean", "coffeeCup", "kettle"],
    keys: ["muehle", "mahl", "mahlgrad", "molino", "molienda", "grinder", "grind", "wasser", "agua", "water", "haerte", "dureza", "hardness"],
    draw: () => `<g ${S}><rect x="56" y="90" width="88" height="92" rx="8" fill="${C.wood}"/><rect x="74" y="130" width="52" height="30" rx="4" fill="${C.woodD}"/><path d="M60 90 l12 -30 h56 l12 30z" fill="${C.steel}"/></g><g ${S} class="eb-spin" style="transform-origin:100px 54px"><path d="M100 54 h46" stroke-width="6"/><circle cx="146" cy="54" r="9" fill="${C.wood}"/><circle cx="100" cy="54" r="7" fill="${C.greyD}"/></g>`,
  },
  moka: {
    group: "in", particles: "dot", with: ["coffeeCup", "bean"],
    keys: ["mokka", "siebtraeger", "french press", "filter", "aeropress", "cafetera", "prensa", "goteo", "brew", "zubereit", "preparar", "extraction", "extraccion"],
    draw: () => `${steam(100, 40, 26)}<g ${S}><path d="M70 40 h60 l-10 50 h-40z" fill="${C.steel}"/><path d="M130 50 h12 l-8 30" fill="none" stroke-width="6"/><path d="M76 96 h48 l14 84 h-76z" fill="${C.steel}"/><rect x="68" y="88" width="64" height="10" rx="3" fill="${C.greyD}"/><path d="M76 40 l-14 -6" stroke-width="6"/></g>`,
  },
  kettle: {
    group: "in", particles: "dot", with: ["teapot", "coffeeCup"],
    keys: ["wasserkocher", "kessel", "hervidor", "tetera electrica", "kettle", "temperatur", "temperature"],
    draw: (P) => `${steam(160, 64, 30)}<g ${S}><path d="M50 80 h100 l14 96 h-128z" fill="${P.a}"/><path d="M150 100 l26 -24" stroke-width="10"/><path d="M70 80 q30 -50 60 0" fill="none" stroke-width="8"/><rect x="40" y="172" width="120" height="12" rx="4" fill="${C.greyD}"/></g>`,
  },
  teapot: {
    group: "in", particles: "dot", with: ["teaCup", "teaLeaf", "kettle"],
    keys: ["teekanne", "aufguss", "ziehzeit", "tetera", "infusion", "teapot", "steep", "brew tea", "zubereiten"],
    draw: (P) => `${steam(168, 70, 28)}<g ${S}><path d="M40 110 a60 52 0 0 1 120 0 v20 a60 50 0 0 1 -120 0z" fill="${P.a}"/><path d="M156 110 q24 -10 22 -34" fill="none" stroke-width="10"/><path d="M42 106 q-30 0 -24 30 q6 20 26 16" fill="none" stroke-width="8"/><rect x="86" y="50" width="28" height="14" rx="6" fill="${P.b}"/><ellipse cx="100" cy="66" rx="40" ry="8" fill="${P.b}"/><path d="M60 130 q40 16 80 0" fill="none" stroke="#fff" stroke-width="4"/></g>`,
  },
  teaCup: {
    group: "in", particles: "dot", with: ["teapot", "teaLeaf"],
    keys: ["tee", "te ", "tea", "matcha", "eistee", "iced tea", "te helado", "gruentee", "schwarztee", "kraeutertee", "rooibos", "chai", "te verde", "te negro", "green tea", "black tea"],
    draw: () => `${steam(100, 80, 34)}<g ${S}><path d="M40 92 h120 q0 70 -60 70 q-60 0 -60 -70z" fill="#fff"/><ellipse cx="100" cy="94" rx="58" ry="8" fill="#c9a348"/><path d="M160 104 q24 0 20 20 q-4 16 -26 14" fill="none" stroke-width="7"/><ellipse cx="100" cy="176" rx="80" ry="10" fill="${C.steel}"/><path d="M124 92 v-50" stroke-width="2"/><rect x="116" y="30" width="18" height="14" fill="${C.yellow}"/></g>`,
  },
  teaLeaf: {
    group: "out", particles: "leaf", with: ["teaCup", "teapot"],
    keys: ["teesorte", "teeblatt", "tipo de te", "variedad de te", "teeanbau", "tea leaf", "darjeeling", "assam", "sencha", "oolong"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M100 186 v-40" stroke="${C.green}" stroke-width="6"/>${leafShape(100, 150, 40, -30, C.green)}${leafShape(100, 150, 44, 30, C.leaf)}${leafShape(100, 140, 34, 0, C.lime)}</g>`,
  },
  lantern: {
    group: "sky", particles: "star", with: ["moon", "candle", "star"],
    keys: ["laterne", "fest", "feier", "advent", "weihnacht", "sankt martin", "farol", "fiesta", "celebra", "navidad", "lantern", "festival", "christmas", "celebrat", "ritual", "genuss", "sinn", "proposito", "purpose", "verbunden", "connection"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 0%"><path d="M100 4 v30" stroke-width="4"/><path d="M76 34 h48 l-6 14 h-36z" fill="${C.greyD}"/>${glow(100, 104, 60, C.orange)}<path d="M70 48 h60 q16 50 0 112 h-60 q-16 -62 0 -112z" fill="${C.orange}" opacity=".9"/><path d="M84 48 q-8 56 0 112 M116 48 q8 56 0 112" fill="none" stroke-width="3"/><rect x="74" y="158" width="52" height="14" rx="4" fill="${C.greyD}"/><circle cx="100" cy="110" r="10" fill="${C.yellow}" class="eb-glow"/></g>`,
  },
  // ── tech ────────────────────────────────────────────────────────
  phone: {
    group: "in", particles: "dot", with: ["chat", "shield", "wifi"],
    keys: ["smartphone", "handy", "iphone", "android", "movil", "telefono", "phone", "mobile", "app ", "apps", "akku", "bateria", "battery", "whatsapp", "bildschirmzeit", "pantalla", "screen time", "digital detox", "digitale ruhe", "benachrichtig", "notificac", "notification"],
    draw: (P) => `<g ${S} class="eb-float"><rect x="58" y="22" width="84" height="160" rx="16" fill="${K}"/><rect x="66" y="38" width="68" height="124" rx="6" fill="${P.a}"/><rect x="88" y="168" width="24" height="5" rx="2.5" fill="#fff" ${N}/><rect x="74" y="50" width="22" height="22" rx="5" fill="#fff" ${N}/><rect x="104" y="50" width="22" height="22" rx="5" fill="${C.yellow}" ${N}/><rect x="74" y="80" width="22" height="22" rx="5" fill="${C.leaf}" ${N}/><rect x="104" y="80" width="22" height="22" rx="5" fill="${C.pink}" ${N}/><rect x="74" y="112" width="52" height="40" rx="6" fill="#fff" opacity=".8" ${N}/></g><g ${S}><circle class="eb-ping" cx="140" cy="30" r="12" fill="${C.red}"/></g>`,
  },
  laptop: {
    group: "in", particles: "dot", with: ["phone", "shield", "chip"],
    keys: ["computer", "laptop", "windows", "pc ", "rechner", "notebook", "ordenador", "portatil", "drucker", "impresora", "printer", "software", "update", "backup", "copia de seguridad", "festplatte", "disco", "office", "browser", "navegador"],
    draw: (P) => `<g ${S}><rect x="38" y="44" width="124" height="88" rx="8" fill="${K}"/><rect x="48" y="54" width="104" height="68" rx="3" fill="${P.a}"/><path d="M20 140 h160 l-10 22 h-140z" fill="${C.steel}"/><rect x="58" y="64" width="50" height="8" rx="3" fill="#fff" ${N}/><rect x="58" y="80" width="80" height="6" rx="3" fill="#fff" opacity=".7" ${N}/><rect x="58" y="92" width="64" height="6" rx="3" fill="#fff" opacity=".7" ${N}/><rect class="eb-blink" x="58" y="104" width="4" height="10" fill="#fff" ${N}/></g>`,
  },
  shield: {
    group: "in", particles: "sparkle", with: ["lock", "phone", "laptop"],
    keys: ["sicher", "schutz", "passwort", "virus", "phishing", "betrug", "datenschutz", "seguridad", "segur", "proteg", "contrasena", "estafa", "fraude", "privacidad", "security", "safe", "protect", "password", "scam", "fraud", "privacy", "helm", "casco", "helmet", "unfall", "accidente", "accident", "verkehr", "trafico", "traffic"],
    draw: (P) => `<g ${S} class="eb-pulse"><path d="M100 22 l66 24 v46 q0 58 -66 88 q-66 -30 -66 -88 v-46z" fill="${P.a}"/><path d="M100 40 l50 18 v34 q0 44 -50 68z" fill="#fff" opacity=".25" ${N}/><path d="M72 100 l20 20 l38 -42" fill="none" stroke="#fff" stroke-width="12"/></g>`,
  },
  lock: {
    group: "in", particles: "sparkle", with: ["shield", "key"],
    keys: ["verschluessel", "zwei-faktor", "2fa", "cifrado", "dos factores", "encrypt", "two-factor", "login", "konto", "cuenta", "account"],
    draw: (P) => `<g ${S} class="eb-float"><path d="M64 90 v-26 a36 36 0 0 1 72 0 v26" fill="none" stroke-width="14" stroke="${C.greyD}"/><path d="M64 90 v-26 a36 36 0 0 1 72 0 v26" fill="none"/><rect x="40" y="88" width="120" height="92" rx="14" fill="${C.gold}"/><circle cx="100" cy="128" r="12" fill="${K}"/><rect x="95" y="132" width="10" height="26" rx="4" fill="${K}"/></g>`,
  },
  wifi: {
    group: "in", particles: "dot", with: ["house", "phone", "laptop"],
    keys: ["wlan", "wifi", "router", "internet", "netz", "red ", "network", "fritzbox", "repeater", "mesh", "smart home", "smarthome", "hogar inteligente", "alexa", "sprachassist", "asistente de voz", "voice assistant", "thermostat", "steckdose"],
    draw: (P) => `<g ${S}><rect x="40" y="130" width="120" height="44" rx="10" fill="${P.a}"/><path d="M60 130 l-10 -40 M140 130 l10 -40" stroke-width="6"/><circle cx="64" cy="152" r="5" fill="${C.leaf}" class="eb-blink"/><circle cx="84" cy="152" r="5" fill="${C.leaf}"/></g><g fill="none" stroke="${P.b}" stroke-width="9" stroke-linecap="round">${[22, 40, 58].map((r, i) => `<path class="eb-wave" style="animation-delay:${i * 0.35}s" d="M${100 - r} ${96 - r * 0.2} a${r} ${r} 0 0 1 ${r * 2} 0"/>`).join("")}</g><circle cx="100" cy="100" r="7" fill="${P.b}"/>`,
  },
  chip: {
    group: "in", particles: "sparkle", with: ["laptop", "chat", "phone"],
    keys: ["ki ", "ki-", "kuenstliche intelligenz", "chatgpt", "chatbot", "ia ", "inteligencia artificial", "ai ", "artificial intelligence", "algorithm", "algoritmo", "automatisier", "automatiz", "prompt"],
    draw: (P) => `<g ${S}>${[50, 75, 100, 125, 150].map((v) => `<path d="M${v} 30 v20 M${v} 150 v20 M30 ${v} h20 M150 ${v} h20" stroke-width="5"/>`).join("")}<rect x="48" y="48" width="104" height="104" rx="14" fill="${K}"/><rect x="66" y="66" width="68" height="68" rx="8" fill="${P.a}"/></g>${sparkle(100, 100, 2.4, "#fff")}${sparkle(150, 30, 1.2, C.yellow)}`,
  },
  chat: {
    group: "in", particles: "dot", with: ["phone", "laptop", "heart"],
    keys: ["chat", "messenger", "nachricht", "social media", "soziale", "mensaje", "redes sociales", "message", "online", "digital", "videocall", "videollamada", "email", "e-mail", "correo"],
    draw: (P) => `<g ${S} class="eb-float"><path d="M24 40 h110 a12 12 0 0 1 12 12 v54 a12 12 0 0 1 -12 12 h-70 l-24 22 v-22 h-16 a12 12 0 0 1 -12 -12 v-54 a12 12 0 0 1 12 -12z" fill="${P.a}"/><circle cx="56" cy="80" r="7" fill="#fff" class="eb-blink"/><circle cx="80" cy="80" r="7" fill="#fff" class="eb-blink" style="animation-delay:.3s"/><circle cx="104" cy="80" r="7" fill="#fff" class="eb-blink" style="animation-delay:.6s"/></g><g ${S} class="eb-float" style="animation-delay:1s"><path d="M96 112 h68 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-6 v18 l-20 -18 h-42 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12z" fill="${P.b}"/><path d="M112 140 h44" stroke-width="5" stroke="#fff"/></g>`,
  },
  // ── learning ────────────────────────────────────────────────────
  book: {
    group: "in", particles: "sparkle", with: ["pencil", "lamp", "cap"],
    keys: ["buch", "lesen", "lernen", "geschichte", "libro", "leer", "aprend", "historia", "book", "read", "learn", "story", "studium", "estudi", "study", "schule", "escuela", "school", "mut", "valor", "courage"],
    draw: (P) => `<g ${S}><path d="M100 60 q-40 -20 -80 -6 v110 q40 -14 80 6z" fill="#fff"/><path d="M100 60 q40 -20 80 -6 v110 q-40 -14 -80 6z" fill="#fff"/><path d="M100 60 v110" stroke-width="3"/><path d="M34 76 q28 -8 52 2 M34 96 q28 -8 52 2 M34 116 q28 -8 52 2 M114 78 q28 -10 52 -2 M114 98 q28 -10 52 -2" fill="none" stroke-width="3" stroke="${C.grey}"/><g class="eb-flip" style="transform-origin:100px 110px"><path d="M100 60 q40 -20 80 -6 v110 q-40 -14 -80 6z" fill="${P.a}" opacity=".85"/></g></g>`,
  },
  calendar: {
    group: "in", particles: "dot", with: ["pencil", "book", "planner"],
    keys: ["kalender", "lernplan", "wochenplan", "hausaufgab", "termin", "calendario", "deberes", "horario", "calendar", "homework", "schedule", "routine", "rutina", "gewohnheit", "habito", "habit", "jahreszeit", "estacion", "season", "monat", "mes ", "month"],
    draw: (P) => `<g ${S}><rect x="30" y="40" width="140" height="140" rx="12" fill="#fff"/><rect x="30" y="40" width="140" height="36" rx="12" fill="${P.a}"/><path d="M62 28 v24 M138 28 v24" stroke-width="8"/>${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${44 + c * 24}" y="${88 + r * 22}" width="16" height="14" rx="3" fill="${r === 1 && c === 2 ? C.red : C.steel}" ${r === 1 && c === 2 ? 'class="eb-pulse"' : ""}/>`).join("")).join("")}</g>`,
  },
  hourglass: {
    group: "in", particles: "dot", with: ["calendar", "book", "clock"],
    keys: ["pruefung", "klausur", "test", "angst", "stress", "zeit", "sanduhr", "examen", "ansiedad", "tiempo", "exam", "anxiety", "time", "deadline", "abgabe", "aufschieb", "procrastin"],
    draw: () => `<g ${S} class="eb-turn" style="transform-origin:100px 104px"><rect x="50" y="22" width="100" height="14" rx="4" fill="${C.wood}"/><rect x="50" y="172" width="100" height="14" rx="4" fill="${C.wood}"/><path d="M62 36 h76 q0 46 -32 68 q32 22 32 68 h-76 q0 -46 32 -68 q-32 -22 -32 -68z" fill="#eef7ff"/><path d="M74 56 h52 q-6 26 -26 40 q-20 -14 -26 -40z" fill="${C.gold}"/><path d="M70 170 q30 -34 60 0z" fill="${C.gold}"/><path d="M100 100 v66" stroke="${C.gold}" stroke-width="3" class="eb-blink"/></g>`,
  },
  clock: {
    group: "in", particles: "dot", with: ["calendar", "hourglass", "moon"],
    keys: ["uhr", "wecker", "reloj", "despertador", "clock", "alarm", "morgen", "manana", "morning", "abend", "noche", "evening", "puenktlich", "zeitmanag"],
    draw: (P) => `<g ${S}><circle cx="100" cy="106" r="70" fill="#fff"/><circle cx="100" cy="106" r="70" fill="none" stroke-width="10" stroke="${P.a}"/><circle cx="100" cy="106" r="70" fill="none"/>${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => `<path d="M100 44 v10" transform="rotate(${a} 100 106)" stroke-width="3"/>`).join("")}<g class="eb-spin-slow" style="transform-origin:100px 106px"><path d="M100 106 v-48" stroke-width="5"/></g><g class="eb-spin" style="transform-origin:100px 106px;animation-duration:6s"><path d="M100 106 h34" stroke-width="5"/></g><circle cx="100" cy="106" r="6" fill="${K}"/></g>`,
  },
  cards: {
    group: "in", particles: "sparkle", with: ["book", "pencil"],
    keys: ["vokabel", "karteikart", "lernmethod", "gedaechtnis", "merken", "vocabulario", "tarjeta", "memoria", "flashcard", "vocabulary", "memory", "memoris", "sprache", "idioma", "language", "englisch", "ingles"],
    draw: (P) => `<g ${S}><rect x="30" y="70" width="110" height="74" rx="8" fill="${P.b}" transform="rotate(-10 85 107)"/><rect x="46" y="64" width="110" height="74" rx="8" fill="#fff" transform="rotate(4 101 101)"/></g><g ${S} class="eb-flip" style="transform-origin:110px 120px"><rect x="56" y="84" width="110" height="74" rx="8" fill="${P.a}"/><path d="M74 108 h50 M74 124 h70" stroke="#fff" stroke-width="5"/></g>`,
  },
  geometry: {
    group: "in", particles: "dot", with: ["pencil", "board", "book"],
    keys: ["mathe", "rechnen", "geometr", "formel", "lernluecke", "matematic", "calcul", "formula", "math", "geometry", "equation", "bruch", "fraccion", "fraction", "zirkel", "compas de dibujo"],
    draw: () => `<g ${S}><path d="M20 180 h160 l-160 -110z" fill="${C.yellow}" opacity=".9"/><path d="M44 164 h66 l-66 -46z" fill="#fff"/></g><g ${S} class="eb-swing" style="transform-origin:120px 30px"><circle cx="120" cy="30" r="10" fill="${C.greyD}"/><path d="M120 36 l-30 110 M120 36 l34 104" stroke-width="7"/><path d="M90 146 l-4 14" stroke-width="4"/></g>`,
  },
  blackboard: {
    group: "in", particles: "dot", with: ["book", "pencil", "chat"],
    keys: ["referat", "praesentation", "vortrag", "tafel", "presentac", "exposic", "pizarra", "presentation", "talk", "speech", "rede", "discurso", "lehrer", "profesor", "teacher", "unterricht", "clase"],
    draw: () => `<g ${S}><rect x="24" y="30" width="152" height="104" rx="6" fill="#2f5d4a"/><rect x="24" y="30" width="152" height="104" rx="6" fill="none" stroke-width="10" stroke="${C.wood}"/><rect x="24" y="30" width="152" height="104" rx="6" fill="none"/><path d="M60 158 l-16 28 M140 158 l16 28 M100 134 v52" stroke-width="6"/></g><g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path class="eb-draw" d="M46 104 q20 -40 40 -10 t40 -20 t34 -10"/><path d="M48 58 h40" opacity=".7"/></g>`,
  },
  pencil: {
    group: "in", particles: "dot", with: ["book", "calendar"],
    keys: ["schreib", "aufsatz", "notiz", "heft", "escrib", "redacc", "apunte", "cuaderno", "write", "essay", "notes", "notebook", "tagebuch", "diario", "journal"],
    draw: () => `<g ${S}><rect x="40" y="40" width="110" height="140" rx="6" fill="#fff"/><path d="M56 70 h78 M56 94 h78 M56 118 h56" stroke="${C.sky}" stroke-width="3"/></g><g ${S} class="eb-write"><path d="M120 150 l50 -90 l18 10 l-50 90 l-20 8z" fill="${C.yellow}"/><path d="M170 60 l18 10 l6 -10 l-18 -10z" fill="${C.pink}"/><path d="M118 168 l2 -18 l16 8z" fill="${C.cream}"/></g>`,
  },
  cap: {
    group: "in", particles: "sparkle", with: ["book", "pencil"],
    keys: ["abschluss", "abitur", "ausbildung", "universit", "graduac", "titulo", "bachillerato", "graduat", "degree", "career", "beruf", "carrera", "bewerbung", "praktikum", "practicas"],
    draw: (P) => `<g ${S} class="eb-float"><path d="M100 40 l84 34 l-84 34 l-84 -34z" fill="${K}"/><path d="M52 90 v40 q48 26 96 0 v-40 l-48 18z" fill="${K}"/><path d="M168 82 v46" stroke-width="4"/><circle cx="168" cy="134" r="8" fill="${C.gold}"/></g>`,
  },
  // ── hiking, outdoors, travel ─────────────────────────────────────
  mountain: {
    group: "out", particles: "dot", with: ["boot", "backpack", "signpost"],
    keys: ["berg", "gipfel", "alpen", "wander", "tour", "montan", "cumbre", "sender", "naturaleza", "mountain", "summit", "hike", "hiking", "trail", "nature", "harz", "schwarzwald", "allgaeu", "andes", "volcan", "vulkan", "sierra ", "klettersteig", "aussicht", "mirador"],
    draw: () => `<g ${S}><path d="M4 186 L74 60 L112 120 L132 92 L196 186z" fill="#7d8fa8"/><path d="M74 60 L58 90 l14 -6 l10 10 l12 -6z" fill="#fff"/><path d="M132 92 l-10 16 l10 -4 l8 6 l4 -6z" fill="#fff"/><path d="M4 186 q60 -40 110 -10 q40 -30 82 10z" fill="${C.green}"/></g><g ${S} class="eb-wave-flag" style="transform-origin:74px 60px"><path d="M74 60 v-34" stroke-width="3"/><path d="M74 26 h24 l-6 7 l6 7 h-24z" fill="${C.red}"/></g>`,
  },
  signpost: {
    group: "out", particles: "leaf", with: ["mountain", "boot", "map"],
    keys: ["wegweiser", "fernwander", "weitwander", "etappe", "markier", "sendero", "gr ", "camino de", "etapa", "senal", "signpost", "long-distance", "stage", "waymark", "route", "ruta", "rennsteig", "jakobsweg"],
    draw: (P) => `<g ${S}><rect x="92" y="40" width="16" height="146" rx="4" fill="${C.wood}"/></g><g ${S} class="eb-sway" style="transform-origin:100px 60px"><path d="M100 50 h70 l14 14 l-14 14 h-70z" fill="${P.a}"/><path d="M100 92 h-70 l-14 14 l14 14 h70z" fill="${P.b}"/><path d="M114 64 h40 M40 106 h40" stroke="#fff" stroke-width="4"/></g>`,
  },
  backpack: {
    group: "out", particles: "leaf", with: ["boot", "tent", "bottle"],
    keys: ["rucksack", "ausruest", "packliste", "mochila", "equipo", "equipaje", "backpack", "gear", "equipment", "packing", "kit", "tasche", "bolsa", "bag", "alforja", "pannier", "fahrradtasche"],
    draw: (P) => `<g ${S} class="eb-bounce"><path d="M64 60 q36 -40 72 0" fill="none" stroke-width="8"/><rect x="44" y="56" width="112" height="128" rx="26" fill="${P.a}"/><rect x="64" y="110" width="72" height="50" rx="10" fill="${P.b}"/><path d="M64 128 h72" stroke-width="3"/><path d="M60 80 q40 16 80 0" fill="none" stroke-width="4"/><rect x="92" y="122" width="16" height="10" rx="3" fill="${C.gold}"/></g>`,
  },
  boot: {
    group: "out", particles: "leaf", with: ["backpack", "mountain"],
    keys: ["schuh", "stiefel", "wanderschuh", "bota", "zapat", "calzado", "boot", "shoe", "footwear", "socken", "calcetin", "blase", "ampolla", "blister"],
    draw: () => `<g ${S} class="eb-step" style="transform-origin:50% 100%"><path d="M50 40 h50 v70 q40 10 66 30 q12 10 10 34 h-140 q-6 -40 14 -60z" fill="${C.wood}"/><path d="M36 174 h140 v12 h-140z" fill="${K}"/><path d="M64 60 h30 M64 76 h30 M64 92 h30" stroke-width="4"/><path d="M50 40 h50 v14 h-50z" fill="${C.red}"/></g>`,
  },
  compass: {
    group: "out", particles: "dot", with: ["map", "mountain", "signpost"],
    keys: ["kompass", "navigation", "orientier", "karte", "brujula", "orientac", "mapa", "compass", "navigat", "gps", "map ", "maps", "entdeck", "descubr", "discover", "travel", "reise"],
    draw: () => `<g ${S}><circle cx="100" cy="104" r="74" fill="${C.gold}"/><circle cx="100" cy="104" r="60" fill="#fff"/><path d="M100 50 v8 M100 150 v8 M46 104 h8 M146 104 h8" stroke-width="4"/></g><g ${S} class="eb-needle" style="transform-origin:100px 104px"><path d="M100 54 l14 50 h-28z" fill="${C.red}"/><path d="M100 154 l14 -50 h-28z" fill="${C.steel}"/><circle cx="100" cy="104" r="7" fill="${K}"/></g>`,
  },
  map: {
    group: "out", particles: "dot", with: ["compass", "pin", "suitcase"],
    keys: ["karte", "landkarte", "stadtplan", "mapa", "plano", "map", "itinerar", "reiseroute", "planung", "planificac", "planning"],
    draw: () => `<g ${S}><path d="M20 50 l52 -16 l56 16 l52 -16 v130 l-52 16 l-56 -16 l-52 16z" fill="${C.cream}"/><path d="M72 34 v130 M128 50 v130" stroke-width="3"/><path d="M36 120 q30 -40 60 -10 t70 -30" fill="none" stroke="${C.red}" stroke-width="5" stroke-dasharray="8 8" class="eb-dash"/></g><g ${S} class="eb-bounce"><path d="M150 40 a18 18 0 0 1 18 18 q0 16 -18 36 q-18 -20 -18 -36 a18 18 0 0 1 18 -18z" fill="${C.red}"/><circle cx="150" cy="58" r="6" fill="#fff"/></g>`,
  },
  pin: {
    group: "out", particles: "dot", with: ["map", "bike", "suitcase"],
    keys: ["route", "strecke", "radweg", "radtour", "ruta", "recorrido", "itinerario", "cycle route", "tour ", "touren", "radreise", "viaje en bici", "bike trip", "etappe", "region"],
    draw: (P) => `<g ${S}><path d="M10 170 q50 -40 90 -10 t90 -20" fill="none" stroke-width="7" stroke-dasharray="10 9" class="eb-dash"/></g><g ${S} class="eb-bounce"><path d="M100 24 a40 40 0 0 1 40 40 q0 34 -40 80 q-40 -46 -40 -80 a40 40 0 0 1 40 -40z" fill="${P.a}"/><circle cx="100" cy="64" r="15" fill="#fff"/></g>`,
  },
  weather: {
    group: "out", particles: "drop", with: ["umbrella", "mountain", "sun"],
    keys: ["wetter", "gewitter", "regen", "unwetter", "clima", "tiempo atmosf", "tormenta", "lluvia", "weather", "storm", "rain", "thunder", "blitz", "rayo ", "lightning", "kaelte", "frio", "cold", "hitze", "calor", "heat", "sicherheit", "notfall", "emergencia", "emergency", "erste hilfe", "primeros auxilios", "first aid"],
    draw: () => `<g ${S}><circle cx="70" cy="70" r="30" fill="${C.yellow}" class="eb-glow"/><path d="M60 126 a28 28 0 0 1 8 -54 a36 36 0 0 1 68 -6 a30 30 0 0 1 10 60z" fill="#fff"/></g><g fill="${C.blue}" ${N}>${[70, 100, 130].map((x, i) => `<path class="eb-drop" style="animation-delay:${i * 0.4}s" d="M${x} 136 q-5 9 0 13 q5 -4 0 -13z"/>`).join("")}</g><path class="eb-blink" d="M112 128 l-14 26 h14 l-8 22 l26 -32 h-14 l8 -16z" fill="${C.yellow}" ${S}/>`,
  },
  umbrella: {
    group: "out", particles: "drop", with: ["weather", "boot"],
    keys: ["regenjacke", "regenschirm", "paraguas", "chubasquero", "umbrella", "raincoat", "wasserdicht", "impermeable", "waterproof"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><path d="M20 100 a80 70 0 0 1 160 0 q-20 -14 -40 0 q-20 -14 -40 0 q-20 -14 -40 0 q-20 -14 -40 0z" fill="${P.a}"/><path d="M100 100 v66 q0 16 -16 16 q-12 0 -14 -12" fill="none" stroke-width="6"/></g>`,
  },
  tent: {
    group: "out", particles: "star", with: ["mountain", "backpack", "campfire"],
    keys: ["zelt", "camping", "uebernacht", "huette", "tienda de campana", "acampada", "refugio", "tent", "campsite", "hut", "biwak", "vivac", "bivouac"],
    draw: (P) => `<g ${S}><path d="M10 182 L100 40 L190 182z" fill="${P.a}"/><path d="M100 40 L70 182 h60z" fill="${P.b}"/><path d="M100 40 v142" stroke-width="3"/><path d="M100 40 l-6 -14 M100 40 l6 -14" stroke-width="4"/></g><g ${S} class="eb-wave-flag" style="transform-origin:100px 26px"><path d="M100 26 h20 l-5 6 l5 6 h-20z" fill="${C.yellow}"/></g>`,
  },
  campfire: {
    group: "sky", particles: "star", with: ["tent"],
    keys: ["lagerfeuer", "feuer", "hoguera", "fuego", "campfire", "fire", "grill", "barbacoa", "bbq", "grillen", "asado"],
    draw: () => `<g ${S}><path d="M40 176 l120 -26 M40 150 l120 26" stroke="${C.woodD}" stroke-width="16"/></g>${glow(100, 120, 60, C.orange)}<g ${S} class="eb-flame" style="transform-origin:100px 166px"><path d="M100 40 q46 50 30 100 q-8 26 -30 26 q-22 0 -30 -26 q-16 -50 30 -100z" fill="${C.orange}"/><path d="M100 90 q22 30 12 56 q-4 14 -12 14 q-8 0 -12 -14 q-10 -26 12 -56z" fill="${C.yellow}"/></g>`,
  },
  paws: {
    group: "out", particles: "heart", with: ["dog", "boot", "family"],
    keys: ["hund", "kinder", "spuren", "familienwander", "perro", "ninos", "huella", "familia", "dog", "kids", "children", "family hike", "pfote", "pata", "paw"],
    draw: () => `<g fill="${C.woodD}" ${S}>${[[46, 150, -20], [96, 112, 10], [142, 70, -10]].map(([x, y, r], i) => `<g class="eb-pop" style="animation-delay:${i * 0.5}s;transform-origin:${x}px ${y}px"><g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="16" ry="13"/><circle cx="${x - 16}" cy="${y - 16}" r="6"/><circle cx="${x - 5}" cy="${y - 24}" r="6"/><circle cx="${x + 7}" cy="${y - 24}" r="6"/><circle cx="${x + 17}" cy="${y - 15}" r="6"/></g></g>`).join("")}</g>`,
  },
  dog: {
    group: "out", particles: "heart", with: ["paws", "ball"],
    keys: ["mit hund", "con perro", "with dog", "dog-friendly", "hundefreundlich"],
    draw: () => `<g ${S}><ellipse cx="96" cy="140" rx="54" ry="30" fill="${C.wood}"/><circle cx="148" cy="96" r="30" fill="${C.wood}"/><path d="M128 76 q-14 -6 -10 26 q12 -6 16 -16z" fill="${C.woodD}"/><path d="M60 160 v24 M80 164 v22 M114 164 v22 M134 160 v24" stroke-width="10" stroke="${C.wood}"/><path d="M60 160 v24 M80 164 v22 M114 164 v22 M134 160 v24" stroke-width="2"/><circle cx="156" cy="92" r="4" fill="${K}"/><circle cx="176" cy="104" r="6" fill="${K}"/><path d="M164 116 q8 6 12 0" fill="none" stroke-width="3"/></g><g ${S} class="eb-tail" style="transform-origin:44px 134px"><path d="M44 134 q-24 -10 -24 -40" fill="none" stroke-width="10" stroke="${C.wood}"/><path d="M44 134 q-24 -10 -24 -40" fill="none" stroke-width="2"/></g>`,
  },
  lighthouse: {
    group: "sea", particles: "dot", with: ["boat", "island", "wave"],
    keys: ["leuchtturm", "nordsee", "ostsee", "kueste", "faro", "costa", "lighthouse", "coast", "seaside", "strand", "wattenmeer", "deich", "dune", "duene"],
    draw: () => `<g class="eb-beam" style="transform-origin:100px 44px"><path d="M100 44 L260 10 L260 80Z" fill="${C.yellow}" opacity=".35"/><path d="M100 44 L-60 10 L-60 80Z" fill="${C.yellow}" opacity=".35"/></g><g ${S}><path d="M76 186 l12 -126 h24 l12 126z" fill="#fff"/><path d="M80 146 h40 l2 20 h-44z M84 100 h32 l2 20 h-36z" fill="${C.red}"/><rect x="84" y="36" width="32" height="24" rx="3" fill="${C.yellow}" class="eb-glow"/><path d="M80 36 l20 -16 l20 16z" fill="${C.red}"/><path d="M76 60 h48" stroke-width="6"/></g>`,
  },
  island: {
    group: "sea", particles: "dot", with: ["boat", "lighthouse", "sun"],
    keys: ["insel", "inseln", "fehmarn", "sylt", "ruegen", "isla", "islas", "canarias", "baleares", "caribe", "island", "islands", "karibik", "palme", "palmera", "palm", "tropic"],
    draw: () => `<g ${S}><ellipse cx="100" cy="176" rx="86" ry="22" fill="${C.cream}"/><path d="M100 172 q-6 -60 16 -110" fill="none" stroke-width="10" stroke="${C.wood}"/><path d="M100 172 q-6 -60 16 -110" fill="none" stroke-width="2"/></g><g ${S} class="eb-sway" style="transform-origin:116px 62px"><path d="M116 62 q-40 -26 -70 0 q34 -4 70 0z" fill="${C.leaf}"/><path d="M116 62 q40 -26 70 4 q-36 -6 -70 -4z" fill="${C.green}"/><path d="M116 62 q-20 -40 0 -54 q14 28 0 54z" fill="${C.leaf}"/><path d="M116 62 q-46 4 -54 40 q28 -26 54 -40z" fill="${C.green}"/><path d="M116 62 q40 10 46 46 q-24 -30 -46 -46z" fill="${C.leaf}"/><circle cx="110" cy="68" r="7" fill="${C.woodD}"/><circle cx="122" cy="70" r="7" fill="${C.woodD}"/></g>`,
  },
  boat: {
    group: "sea", particles: "dot", with: ["lighthouse", "wave", "island"],
    keys: ["segel", "boot", "faehre", "schiff", "barco", "velero", "ferry", "crucero", "boat", "sail", "ferry", "cruise", "kanu", "kayak", "piragua", "paddel", "sup "],
    draw: (P) => `<g ${S} class="eb-bob"><path d="M30 140 h140 l-24 34 h-92z" fill="${P.a}"/><path d="M100 20 v120" stroke-width="5"/><path d="M104 26 q50 40 54 104 h-54z" fill="#fff"/><path d="M96 40 q-36 40 -40 90 h40z" fill="${C.cream}"/><path d="M100 20 l20 6 l-20 6" fill="${C.red}"/></g>`,
  },
  wave: {
    group: "sea", particles: "drop", with: ["boat", "island", "fish"],
    keys: ["see", "seen", "fluss", "baden", "schwimm", "lago", "rio", "playa", "costa", "bano", "nadar", "lake", "river", "beach", "swim", "surf", "ola", "welle", "wave", "mar ", "meer", "sea", "ocean", "oceano", "kanal", "natacion", "piscina", "bodensee", "schwimmbad"],
    draw: () => `<g ${S} class="eb-bob"><path d="M10 150 q20 -110 110 -100 q-40 10 -40 50 q0 30 30 30 q16 0 24 -14 q12 30 -14 50 q-50 36 -110 -16z" fill="${C.blue}"/><path d="M60 110 q4 -34 40 -46" fill="none" stroke="#fff" stroke-width="7"/></g><g fill="#fff" ${N}><circle class="eb-twinkle" cx="122" cy="56" r="6"/><circle class="eb-twinkle" style="animation-delay:.6s" cx="140" cy="74" r="4"/></g>`,
  },
  fish: {
    group: "sea", particles: "bubble", with: ["wave", "boat"],
    keys: ["fisch", "angel", "pescado", "pesca", "marisco", "fish", "seafood", "fishing", "meeresfruecht"],
    draw: () => `<g ${S} class="eb-swim"><path d="M30 100 q60 -60 120 0 q-60 60 -120 0z" fill="${C.orange}"/><path d="M150 100 l36 -26 v52z" fill="${C.orange}"/><circle cx="60" cy="94" r="6" fill="#fff"/><circle cx="60" cy="94" r="2.5" fill="${K}"/><path d="M90 76 q10 24 0 48 M112 78 q10 22 0 44" fill="none" stroke-width="3"/></g>`,
  },
  gate: {
    group: "out", particles: "dot", with: ["suitcase", "ticket", "map"],
    keys: ["stadt", "staedte", "altstadt", "berlin", "muenchen", "hamburg", "dresden", "koeln", "ciudad", "ciudades", "cultura", "museo", "colonial", "city", "cities", "culture", "museum", "tor ", "puerta", "arco", "arch", "denkmal", "monumento", "monument", "kirche", "iglesia", "church", "plaza", "platz", "square", "unesco", "patrimonio", "heritage", "burgen", "burg ", "castillo", "castle", "altstaedte"],
    draw: (P) => `<g ${S}><rect x="20" y="70" width="160" height="116" fill="${C.cream}"/><path d="M14 70 h172 v-16 h-172z" fill="${P.a}"/><path d="M60 186 v-70 a40 40 0 0 1 80 0 v70z" fill="${C.sky}"/>${[30, 160].map((x) => `<rect x="${x - 8}" y="84" width="16" height="102" fill="#f0e2c4"/>`).join("")}<path d="M100 54 v-30" stroke-width="3"/></g><g ${S} class="eb-wave-flag" style="transform-origin:100px 24px"><path d="M100 24 h28 l-7 8 l7 8 h-28z" fill="${C.red}"/></g>`,
  },
  train: {
    group: "out", particles: "dot", with: ["ticket", "suitcase", "gate"],
    keys: ["bahn", "zug", "anreise", "deutschlandticket", "ice ", "regionalzug", "tren", "renfe", "ave ", "train", "rail", "railway", "anfahrt", "llegar", "getting there", "bus ", "autobus", "fernbus"],
    draw: (P) => `<g class="eb-ride"><g ${S}><rect x="20" y="60" width="150" height="96" rx="24" fill="${P.a}"/><rect x="36" y="76" width="34" height="30" rx="5" fill="${C.sky}"/><rect x="80" y="76" width="34" height="30" rx="5" fill="${C.sky}"/><rect x="124" y="76" width="34" height="30" rx="5" fill="${C.sky}"/><path d="M20 124 h150" stroke-width="5" stroke="#fff"/><circle cx="160" cy="138" r="6" fill="${C.yellow}" class="eb-glow"/>${wheel(54, 162, 14)}${wheel(136, 162, 14)}</g></g><path d="M0 182 h200" stroke="${K}" stroke-width="4"/>`,
  },
  ticket: {
    group: "in", particles: "dot", with: ["train", "suitcase"],
    keys: ["ticket", "fahrkarte", "billete", "entrada", "unterkunft", "hotel", "ferienwohnung", "pension", "alojamiento", "reserva", "booking", "accommodation", "buchen", "reservar", "book "],
    draw: (P) => `<g ${S} class="eb-float"><path d="M20 60 h160 v26 a14 14 0 0 0 0 28 v26 h-160 v-26 a14 14 0 0 0 0 -28z" fill="${P.a}"/><path d="M130 60 v80" stroke-dasharray="6 6" stroke-width="3"/><path d="M40 84 h70 M40 104 h50 M40 122 h60" stroke="#fff" stroke-width="5"/><circle cx="156" cy="100" r="12" fill="#fff"/></g>`,
  },
  suitcase: {
    group: "in", particles: "dot", with: ["ticket", "map", "camera"],
    keys: ["koffer", "reise", "urlaub", "maleta", "viaje", "vacacion", "suitcase", "trip", "holiday", "vacation", "budget", "presupuesto", "packen", "equipaje", "luggage", "flug", "vuelo", "flight"],
    draw: (P) => `<g ${S} class="eb-bounce"><path d="M76 56 v-20 h48 v20" fill="none" stroke-width="7"/><rect x="34" y="56" width="132" height="116" rx="14" fill="${P.a}"/><path d="M70 56 v116 M130 56 v116" stroke-width="6" stroke="${P.b}"/><path d="M70 56 v116 M130 56 v116" stroke-width="2"/><circle cx="56" cy="180" r="7" fill="${K}"/><circle cx="144" cy="180" r="7" fill="${K}"/><rect x="44" y="70" width="30" height="20" rx="4" fill="${C.yellow}" transform="rotate(-10 59 80)"/></g>`,
  },
  camera: {
    group: "in", particles: "sparkle", with: ["bird", "binoculars", "suitcase"],
    keys: ["kamera", "foto", "fotograf", "camara", "fotografia", "camera", "photo", "photograph", "objektiv", "objetivo", "lens", "teleobjektiv", "zoom"],
    draw: (P) => `<g ${S}><rect x="24" y="64" width="152" height="104" rx="16" fill="${K}"/><rect x="60" y="48" width="44" height="20" rx="5" fill="${K}"/><circle cx="100" cy="116" r="40" fill="${C.greyD}"/><circle cx="100" cy="116" r="28" fill="${P.a}"/><circle cx="90" cy="106" r="8" fill="#fff" opacity=".7"/><rect x="140" y="76" width="22" height="12" rx="3" fill="${C.red}" class="eb-blink"/></g><circle class="eb-flash" cx="150" cy="50" r="18" fill="#fff" opacity="0"/>`,
  },
  road: {
    group: "out", particles: "dot", with: ["car", "map", "signpost"],
    keys: ["strasse", "autofahrt", "roadtrip", "carretera", "ruta en coche", "road", "road trip", "drive", "highway", "autopista", "auto", "coche", "car", "mietwagen", "alquiler de coche", "rental car"],
    draw: () => `<g ${S}><path d="M60 186 q30 -80 30 -110 q0 -30 30 -60 h20 q-30 30 -30 60 q0 30 40 110z" fill="${C.greyD}"/><path d="M102 180 q4 -40 4 -60 q0 -30 22 -60" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="12 12" class="eb-dash"/></g>`,
  },
  car: {
    group: "out", particles: "dot", with: ["road", "map"],
    keys: ["auto ", "coche", "car ", "wohnmobil", "autocaravana", "camper", "van"],
    draw: (P) => `<g class="eb-ride"><g ${S}><path d="M20 140 v-24 q0 -10 10 -12 l26 -6 l24 -30 h56 l26 30 l18 4 q10 2 10 14 v24z" fill="${P.a}"/><path d="M86 74 h24 v26 h-44z M118 74 h12 l20 26 h-32z" fill="${C.sky}"/>${wheel(56, 146, 16)}${wheel(146, 146, 16)}</g></g>`,
  },
  // ── cats ────────────────────────────────────────────────────────
  cat: {
    group: "in", particles: "heart", with: ["yarn", "bowl", "fish"],
    keys: ["katze", "kater", "kitten", "katzen", "gato", "gatito", "felino", "cat", "kitten", "feline", "stubentiger", "verhalten", "conducta", "behaviour", "behavior", "schnurr", "ronron", "purr"],
    draw: () => `<g ${S}><g class="eb-tail" style="transform-origin:140px 170px"><path d="M140 170 q50 -6 40 -60 q-4 -16 -16 -12" fill="none" stroke-width="16" stroke="${C.orange}"/><path d="M140 170 q50 -6 40 -60 q-4 -16 -16 -12" fill="none" stroke-width="3"/></g><path d="M56 186 q-10 -70 44 -86 q54 16 44 86z" fill="${C.orange}"/><circle cx="100" cy="76" r="40" fill="${C.orange}"/><path d="M66 56 l-4 -34 l28 18z M134 56 l4 -34 l-28 18z" fill="${C.orange}"/><path d="M70 40 l2 10 l8 -4 M130 40 l-2 10 l-8 -4" fill="${C.pink}" stroke-width="2"/><g class="eb-blink-eyes"><ellipse cx="86" cy="74" rx="5" ry="8" fill="${K}"/><ellipse cx="114" cy="74" rx="5" ry="8" fill="${K}"/></g><path d="M96 88 h8 l-4 5z" fill="${C.pink}"/><path d="M100 93 q-6 8 -12 4 M100 93 q6 8 12 4 M60 86 h20 M60 94 l20 -2 M140 86 h-20 M140 94 l-20 -2" fill="none" stroke-width="2.5"/><path d="M84 120 q16 10 32 0 M80 140 q20 10 40 0" fill="none" stroke="#c9661a" stroke-width="4"/></g>`,
  },
  bowl: {
    group: "in", particles: "heart", with: ["cat", "fish"],
    keys: ["napf", "futter", "fuetter", "ernaehr", "nassfutter", "trockenfutter", "comedero", "pienso", "comida", "aliment", "food", "feeding", "diet", "nutrition", "naehrstoff", "nutriente", "trinken", "beber", "drink"],
    draw: (P) => `<g ${S}><path d="M30 120 h140 l-16 56 h-108z" fill="${P.a}"/><ellipse cx="100" cy="120" rx="70" ry="14" fill="${C.wood}"/>${[[76, 112], [96, 108], [116, 112], [88, 116], [108, 117], [128, 116]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${C.woodD}"/>`).join("")}<path d="M70 150 q14 -14 26 0 q12 -14 26 0" fill="none" stroke="#fff" stroke-width="4"/></g><g ${S} class="eb-swim"><path d="M120 50 q24 -24 48 0 q-24 24 -48 0z" fill="${C.sky}"/><path d="M168 50 l14 -10 v20z" fill="${C.sky}"/></g>`,
  },
  heart: {
    group: "in", particles: "heart", with: ["cat", "stethoscope", "family"],
    keys: ["gesund", "tierarzt", "krank", "impf", "salud", "veterinar", "enferm", "vacun", "health", "vet", "ill", "vaccin", "herz", "corazon", "heart", "liebe", "amor", "love", "body", "korper", "cuerpo", "koerper", "blut", "sangre", "blood"],
    draw: (P) => `<g ${S} class="eb-beat" style="transform-origin:100px 110px"><path d="M100 178 q-90 -54 -84 -110 q6 -40 46 -42 q28 0 38 28 q10 -28 38 -28 q40 2 46 42 q6 56 -84 110z" fill="${C.red}"/><path d="M46 70 a24 24 0 0 1 20 -24" fill="none" stroke="#fff" stroke-width="7" opacity=".7"/><path d="M30 110 h40 l10 -22 l16 46 l12 -30 h62" fill="none" stroke="#fff" stroke-width="5"/></g>`,
  },
  stethoscope: {
    group: "in", particles: "heart", with: ["heart", "cat"],
    keys: ["arzt", "untersuch", "symptom", "medico", "sintoma", "doctor", "symptom", "check-up", "vorsorge", "prevencion", "prevention"],
    draw: () => `<g ${S}><path d="M60 30 v50 a40 40 0 0 0 80 0 v-50" fill="none" stroke-width="9" stroke="${C.greyD}"/><path d="M100 120 v20 a30 30 0 0 0 60 0 v-14" fill="none" stroke-width="9" stroke="${C.greyD}"/><circle cx="160" cy="118" r="18" fill="${C.steel}"/><circle cx="160" cy="118" r="8" fill="${C.greyD}"/><circle cx="60" cy="28" r="7" fill="${K}"/><circle cx="140" cy="28" r="7" fill="${K}"/></g><g ${S} class="eb-beat" style="transform-origin:60px 160px"><path d="M60 182 q-30 -18 -28 -36 q2 -14 14 -14 q10 0 14 10 q4 -10 14 -10 q12 0 14 14 q2 18 -28 36z" fill="${C.red}"/></g>`,
  },
  ear: {
    group: "in", particles: "heart", with: ["cat", "yarn"],
    keys: ["ohr", "koerpersprache", "kommunik", "miau", "oreja", "lenguaje corporal", "comunicac", "maullid", "ear", "body language", "communicat", "meow", "kratz", "arana", "scratch"],
    draw: () => `<g ${S}><path d="M40 186 q0 -90 60 -110 q60 20 60 110z" fill="${C.greyD}"/><path d="M58 98 l-10 -66 l46 34z M142 98 l10 -66 l-46 34z" fill="${C.greyD}"/><path d="M62 82 l-6 -36 l26 20z M138 82 l6 -36 l-26 20z" fill="${C.pink}" class="eb-twitch"/><circle cx="82" cy="120" r="9" fill="${C.yellow}"/><circle cx="118" cy="120" r="9" fill="${C.yellow}"/><circle cx="82" cy="120" r="4" fill="${K}"/><circle cx="118" cy="120" r="4" fill="${K}"/></g><g fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"><path class="eb-wave" d="M172 60 q10 10 0 20"/><path class="eb-wave" style="animation-delay:.4s" d="M182 52 q18 18 0 36"/></g>`,
  },
  window: {
    group: "in", particles: "dot", with: ["cat", "plant", "sun"],
    keys: ["fenster", "freigang", "balkonnetz", "wohnung", "ventana", "terraza", "exterior", "window", "outdoor", "indoor", "aislamiento", "daemmung", "insulat", "fenstertausch", "doble acristal", "double glaz", "rollladen", "persiana", "blind", "zugluft", "corriente"],
    draw: () => `<g ${S}><rect x="34" y="28" width="132" height="140" rx="6" fill="${C.sky}"/><path d="M100 28 v140 M34 98 h132" stroke-width="7" stroke="#fff"/><path d="M100 28 v140 M34 98 h132" stroke-width="2"/><rect x="34" y="28" width="132" height="140" rx="6" fill="none" stroke-width="8" stroke="#fff"/><rect x="34" y="28" width="132" height="140" rx="6" fill="none"/><rect x="24" y="166" width="152" height="16" rx="4" fill="${C.wood}"/></g><circle class="eb-glow" cx="66" cy="62" r="16" fill="${C.yellow}" ${S}/><g ${S} class="eb-drift"><path d="M110 70 a10 10 0 0 1 14 -10 a14 14 0 0 1 26 6 a9 9 0 0 1 0 18 h-36 a8 8 0 0 1 -4 -14z" fill="#fff"/></g>`,
  },
  brush: {
    group: "in", particles: "sparkle", with: ["cat", "bowl"],
    keys: ["buerst", "fellpflege", "krallen", "baden", "cepill", "pelo", "unas", "aseo", "brush", "grooming", "claws", "coat", "fell", "pelaje", "fellpflege", "krallenpflege"],
    draw: (P) => `<g ${S} class="eb-brush"><rect x="40" y="70" width="96" height="40" rx="14" fill="${P.a}"/><rect x="132" y="80" width="56" height="20" rx="10" fill="${C.wood}"/>${[52, 64, 76, 88, 100, 112, 124].map((x) => `<path d="M${x} 110 v20" stroke-width="3"/>`).join("")}</g><g ${S}><path d="M20 186 q80 -50 160 0z" fill="${C.orange}" opacity=".7"/></g>`,
  },
  catBasket: {
    group: "in", particles: "heart", with: ["cat", "yarn"],
    keys: ["eingewoehn", "einzug", "neue katze", "zweitkatze", "transportbox", "adapt", "llegada", "nuevo gato", "arrival", "new cat", "korb", "cama", "bed", "schlafplatz", "kuschel"],
    draw: () => `<g ${S}><path d="M26 120 h148 q-6 62 -74 62 q-68 0 -74 -62z" fill="${C.wood}"/><path d="M40 136 q60 16 120 0 M46 156 q54 14 108 0" fill="none" stroke-width="3"/><ellipse cx="100" cy="120" rx="74" ry="12" fill="${C.woodD}"/></g><g ${S} class="eb-breathe" style="transform-origin:100px 120px"><path d="M50 120 q4 -40 50 -40 q46 0 50 40z" fill="${C.greyD}"/><path d="M60 96 l-6 -22 l20 12z M86 84 l2 -20 l14 14z" fill="${C.greyD}"/><path d="M68 104 q6 4 12 0 M90 100 q6 4 12 0" fill="none" stroke-width="3"/></g><g fill="${K}" font-family="sans-serif" font-weight="700"><text class="eb-rise" x="150" y="70" font-size="20">z</text><text class="eb-rise" style="animation-delay:1s" x="164" y="54" font-size="15">z</text></g>`,
  },
  yarn: {
    group: "in", particles: "heart", with: ["cat", "catBasket"],
    keys: ["wolle", "spielzeug", "beschaeftig", "ovillo", "juguete", "yarn", "toy", "langeweile", "aburrim", "boredom"],
    draw: () => `<g ${S} class="eb-roll"><circle cx="100" cy="120" r="56" fill="${C.pink}"/><path d="M58 90 q40 20 80 -10 M48 120 q50 20 104 -6 M58 150 q40 -60 80 -60 M70 166 q30 -60 70 -40" fill="none" stroke-width="3"/></g><g ${S}><path d="M144 160 q30 20 50 0" fill="none" stroke="${C.pink}" stroke-width="5"/></g>`,
  },
  // ── cleaning and laundry ────────────────────────────────────────
  bucket: {
    group: "in", particles: "bubble", with: ["mop", "spray", "sponge"],
    keys: ["putz", "reinig", "sauber", "putzplan", "frühjahrsputz", "limpi", "limpiez", "fregar", "clean", "cleaning", "tidy", "eimer", "cubo", "bucket", "wisch", "mop", "fregona", "boden wischen", "staub", "polvo", "dust", "staubsaug", "aspirad", "vacuum"],
    draw: (P) => `<g ${S}><path d="M50 80 q50 -60 100 0" fill="none" stroke-width="6"/><path d="M40 80 h120 l-14 102 h-92z" fill="${P.a}"/><ellipse cx="100" cy="80" rx="60" ry="12" fill="${C.water}"/></g><g fill="#fff" ${S} stroke-width="3">${[[70, 70, 16], [100, 60, 20], [132, 70, 14], [86, 44, 12], [118, 40, 10]].map(([x, y, r], i) => `<circle class="eb-rise" style="animation-delay:${i * 0.4}s" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
  },
  mop: {
    group: "in", particles: "bubble", with: ["bucket", "drop"],
    keys: ["wischmopp", "fliesen", "laminat", "fregona", "suelo", "mop", "floor", "parkett", "boeden", "fussboden", "bodenpflege"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><rect x="94" y="10" width="12" height="130" rx="5" fill="${C.wood}"/><path d="M60 140 h80 v14 h-80z" fill="${C.greyD}"/>${[64, 76, 88, 100, 112, 124, 136].map((x) => `<path d="M${x} 154 q-2 16 2 30" stroke-width="7" stroke="${C.sky}" fill="none"/>`).join("")}</g><g fill="${C.water}" ${N}><ellipse class="eb-glow" cx="100" cy="186" rx="70" ry="6"/></g>`,
  },
  spray: {
    group: "in", particles: "bubble", with: ["sponge", "bucket", "bottle"],
    keys: ["spray", "reiniger", "essig", "hausmittel", "natron", "zitrone", "pulverizad", "vinagre", "remedio casero", "bicarbonato", "limon", "vinegar", "home remedy", "baking soda", "lemon", "soda", "zitronensaeure"],
    draw: (P) => `<g ${S}><path d="M64 80 h56 l10 100 h-76z" fill="${P.a}"/><path d="M76 80 v-20 h32 v20" fill="${C.greyD}"/><path d="M76 60 h-14 v-20 h56 l14 14 v6z" fill="${C.greyD}"/><path d="M70 30 l-10 -6" stroke-width="5"/><rect x="72" y="104" width="40" height="40" rx="4" fill="#fff"/><path d="M82 118 h20 M82 130 h14" stroke-width="3"/></g><g fill="${C.water}" ${N}>${[[150, 40], [164, 30], [160, 54], [178, 44], [174, 62]].map(([x, y], i) => `<circle class="eb-spray" style="animation-delay:${i * 0.2}s" cx="${x}" cy="${y}" r="4"/>`).join("")}</g>`,
  },
  sponge: {
    group: "in", particles: "bubble", with: ["spray", "bucket", "drop"],
    keys: ["schwamm", "lappen", "mikrofaser", "esponja", "bayeta", "microfibra", "sponge", "cloth", "microfibre", "microfiber", "schrubb", "frotar", "scrub", "kalk", "kalkflecken", "cal ", "limescale"],
    draw: () => `<g ${S} class="eb-scrub"><rect x="40" y="80" width="120" height="60" rx="12" fill="${C.yellow}"/><rect x="40" y="80" width="120" height="22" rx="10" fill="${C.green}"/>${[[64, 118], [92, 126], [124, 118], [146, 128], [78, 132]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${C.gold}"/>`).join("")}</g><g fill="#fff" ${S} stroke-width="3">${[[40, 70, 10], [166, 66, 12], [150, 40, 8], [56, 44, 7]].map(([x, y, r], i) => `<circle class="eb-rise" style="animation-delay:${i * 0.5}s" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
  },
  washer: {
    group: "in", particles: "bubble", with: ["shirt", "bottle", "basketLaundry"],
    keys: ["waesche", "waschen", "waschmaschine", "trockner", "bügel", "buegel", "lavar", "lavadora", "ropa", "colada", "secadora", "planchar", "laundry", "washing", "washer", "dryer", "iron", "waschmittel", "detergente", "detergent", "weichspueler", "suavizante", "softener", "pflegesymbol", "etiqueta"],
    draw: (P) => `<g ${S}><rect x="30" y="24" width="140" height="162" rx="14" fill="#fff"/><path d="M30 60 h140" stroke-width="3"/><circle cx="54" cy="42" r="6" fill="${P.a}"/><rect x="110" y="36" width="44" height="12" rx="4" fill="${C.steel}"/><circle cx="100" cy="122" r="50" fill="${C.steel}"/><circle cx="100" cy="122" r="38" fill="${C.sky}"/></g><g class="eb-spin" style="transform-origin:100px 122px"><path d="M66 128 q34 -30 68 0 q-34 30 -68 0z" fill="${P.a}" opacity=".8"/><circle cx="84" cy="102" r="7" fill="#fff"/><circle cx="118" cy="146" r="6" fill="#fff"/></g>`,
  },
  shirt: {
    group: "in", particles: "bubble", with: ["washer", "hanger"],
    keys: ["hemd", "kleidung", "textil", "pullover", "wolle", "seide", "camisa", "prenda", "tejido", "jersey", "lana", "seda", "shirt", "clothes", "clothing", "fabric", "wool", "silk", "jeans", "vaquero", "fleckentfern", "mancha en la ropa"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:50% 10%"><path d="M70 30 l-50 26 l18 40 l20 -8 v96 h84 v-96 l20 8 l18 -40 l-50 -26 q-30 22 -60 0z" fill="${P.a}"/><path d="M70 30 q30 22 60 0" fill="none" stroke-width="4"/><circle cx="118" cy="120" r="12" fill="${C.woodD}" opacity=".6"/></g>`,
  },
  hanger: {
    group: "in", particles: "sparkle", with: ["shirt", "mirror", "dress"],
    keys: ["kleiderschrank", "garderobe", "outfit", "stil", "mode", "armario", "estilo", "moda", "ropa", "wardrobe", "style", "fashion", "outfit", "capsule", "dress", "kleid", "vestido"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:100px 20px"><path d="M100 20 a10 10 0 1 1 10 10 q-10 0 -10 12 l-78 46 h156 l-78 -46" fill="none" stroke-width="5"/><path d="M66 88 h68 l-10 18 l30 76 h-108 l30 -76z" fill="${P.a}"/><path d="M76 106 h48" stroke-width="3"/></g>`,
  },
  dress: {
    group: "in", particles: "sparkle", with: ["hanger", "mirror"],
    keys: ["kleid", "vestido", "dress", "rock", "falda", "skirt", "bluse", "blusa", "blouse"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:50% 0%"><path d="M76 24 l8 30 h32 l8 -30 M84 54 l-12 30 l-36 98 h128 l-36 -98 l-12 -30z" fill="${P.a}"/><path d="M72 84 h56" stroke-width="4"/></g>`,
  },
  stove: {
    group: "in", particles: "bubble", with: ["sponge", "spray", "oven"],
    keys: ["herd reinig", "backofen reinig", "dunstabzug", "fett", "eingebrannt", "horno sucio", "grasa", "campana extractora", "grease", "oven cleaning", "kuehlschrank", "nevera", "fridge", "spuelmaschine", "lavavajillas", "dishwasher", "abwasch", "geschirr", "platos", "dishes"],
    draw: () => `<g ${S}><rect x="30" y="86" width="140" height="100" rx="8" fill="#fff"/><rect x="44" y="100" width="112" height="70" rx="6" fill="${C.greyD}"/><rect x="30" y="70" width="140" height="18" rx="4" fill="${C.steel}"/></g><g ${S} class="eb-scrub"><rect x="100" y="120" width="60" height="30" rx="8" fill="${C.yellow}"/></g><g fill="#fff" ${S} stroke-width="3">${[[70, 60, 12], [100, 50, 9], [130, 58, 11]].map(([x, y, r], i) => `<circle class="eb-rise" style="animation-delay:${i * 0.5}s" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
  },
  bathtub: {
    group: "in", particles: "bubble", with: ["drop", "sponge", "faucet"],
    keys: ["badewanne", "dusche", "toilette", "wc", "fugen", "badreinig", "banera", "ducha", "inodoro", "bano", "bathtub", "shower", "toilet", "bathroom", "grout", "duschkopf", "alcachofa", "glas", "mampara"],
    draw: (P) => `<g ${S}><path d="M18 100 h164 v20 q0 44 -44 44 h-76 q-44 0 -44 -44z" fill="#fff"/><path d="M44 164 l-8 20 M156 164 l8 20" stroke-width="6"/><path d="M160 100 v-60 a16 16 0 0 1 32 0" fill="none" stroke-width="6"/></g><g fill="#fff" ${S} stroke-width="3">${[[50, 92, 16], [78, 84, 20], [108, 90, 16], [134, 86, 14], [64, 66, 10], [100, 62, 12]].map(([x, y, r], i) => `<circle class="eb-rise" style="animation-delay:${i * 0.35}s" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g><g ${S} class="eb-bob"><path d="M118 70 q8 -14 20 -6 q12 -4 12 8 q0 12 -16 12 h-14 q-8 0 -2 -14z" fill="${C.yellow}"/></g>`,
  },
  bottle: {
    group: "in", particles: "bubble", with: ["spray", "sponge"],
    keys: ["flasche", "dosier", "botella", "producto", "dosis", "bottle", "product", "dose", "waschmittel", "detergente", "putzmittel", "reinigungsmittel"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><rect x="84" y="20" width="32" height="24" rx="5" fill="${C.greyD}"/><path d="M80 44 h40 l16 30 v100 q0 10 -10 10 h-52 q-10 0 -10 -10 v-100z" fill="${P.a}"/><rect x="72" y="96" width="56" height="48" rx="6" fill="#fff"/><path d="M84 112 h32 M84 126 h24" stroke-width="3"/><path d="M96 82 h6" stroke="#fff" stroke-width="6"/></g>`,
  },
  basketLaundry: {
    group: "in", particles: "bubble", with: ["washer", "shirt"],
    keys: ["waeschekorb", "sortier", "cesto de la ropa", "separar", "laundry basket", "sort", "trocknen", "tender", "drying", "waeschelein", "tendedero", "clothesline"],
    draw: () => `<g ${S}><path d="M30 186 h140" /><path d="M10 40 h180" stroke-width="3"/>${[[34, C.red], [86, C.blue], [138, C.yellow]].map(([x, c], i) => `<g class="eb-sway" style="transform-origin:${x + 18}px 40px;animation-delay:${i * 0.4}s"><path d="M${x} 40 h36 v20 l10 6 l-6 14 l-6 -4 v50 h-32 v-50 l-6 4 l-6 -14 l10 -6z" fill="${c}"/><rect x="${x + 6}" y="34" width="6" height="14" fill="${C.wood}"/><rect x="${x + 26}" y="34" width="6" height="14" fill="${C.wood}"/></g>`).join("")}</g>`,
  },
  // ── birds ───────────────────────────────────────────────────────
  bird: {
    group: "out", particles: "leaf", with: ["feeder", "nest", "feather"],
    keys: ["vogel", "voegel", "spatz", "meise", "amsel", "rotkehlchen", "fink", "gartenvoegel", "pajaro", "ave ", "aves", "gorrion", "bird", "birds", "sparrow", "tit", "robin", "blackbird", "finch", "zugvoegel", "migrac", "migration", "gesang", "canto", "song"],
    draw: () => `<g ${S}><path d="M10 160 q90 -20 180 6" fill="none" stroke-width="8" stroke="${C.wood}"/>${leafShape(40, 160, 12, -60)}${leafShape(170, 162, 12, 60, C.green)}</g><g ${S} class="eb-hop" style="transform-origin:100px 150px"><path d="M60 120 q0 -50 46 -54 q34 0 40 30 l20 6 l-20 8 q-6 34 -50 36 q-20 0 -36 -26z" fill="${C.wood}"/><path d="M76 132 q20 18 52 4 q-4 -22 -30 -26 q-20 4 -22 22z" fill="${C.cream}"/><g class="eb-flap" style="transform-origin:96px 104px"><path d="M90 100 q-34 0 -48 30 q36 4 56 -16z" fill="${C.woodD}"/></g><circle cx="126" cy="90" r="5" fill="${K}"/><path d="M88 150 l-4 12 M104 150 l2 12" stroke-width="4"/></g>`,
  },
  feeder: {
    group: "out", particles: "dot", with: ["bird", "seeds"],
    keys: ["futterhaus", "fuetter", "vogelfutter", "meisenknoedel", "traenke", "vogelbad", "comedero", "alimentar", "bebedero", "feeder", "feeding", "bird bath", "suet", "fettfutter", "winterfuetter", "ganzjahres"],
    draw: (P) => `<g ${S}><path d="M100 10 v26" stroke-width="3"/><path d="M30 76 l70 -40 l70 40z" fill="${C.red}"/><rect x="44" y="76" width="112" height="60" fill="${C.wood}" opacity=".3"/><path d="M50 76 v60 M150 76 v60" stroke-width="6"/><rect x="36" y="136" width="128" height="14" rx="4" fill="${C.wood}"/>${[60, 76, 92, 108, 124, 140].map((x) => `<circle cx="${x}" cy="132" r="4" fill="${C.gold}"/>`).join("")}</g><g ${S} class="eb-hop" style="transform-origin:130px 130px"><path d="M114 128 q0 -24 22 -26 q16 0 18 14 l10 3 l-10 4 q-2 16 -24 18 q-10 0 -16 -13z" fill="${C.blue}"/><path d="M124 120 q10 10 26 2" fill="${C.yellow}" stroke-width="2"/><circle cx="144" cy="110" r="3" fill="${K}"/></g>`,
  },
  nest: {
    group: "out", particles: "leaf", with: ["bird", "birdhouse", "egg"],
    keys: ["nist", "nest", "brut", "lebensraum", "nido", "habitat", "cria", "nesting", "breeding", "kueken", "polluelo", "chick", "eier"],
    draw: () => `<g ${S}><path d="M10 150 q80 -20 180 0" fill="none" stroke-width="8" stroke="${C.wood}"/><path d="M36 120 q64 70 128 0 q-10 40 -64 46 q-54 -6 -64 -46z" fill="${C.wood}"/><path d="M40 124 q60 30 120 0 M48 140 q52 22 104 0" fill="none" stroke="${C.woodD}" stroke-width="3"/></g><g ${S}>${[[76, 112, 0], [100, 106, 0.6], [124, 112, 1.2]].map(([x, y, d]) => `<g class="eb-wobble" style="transform-origin:${x}px ${y + 16}px;animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="15" ry="19" fill="#bfe4f2"/></g>`).join("")}</g>`,
  },
  birdhouse: {
    group: "out", particles: "leaf", with: ["nest", "bird", "tree"],
    keys: ["nistkasten", "vogelhaus", "caja nido", "casita", "birdhouse", "nest box", "bauen", "construir", "build"],
    draw: (P) => `<g ${S}><rect x="92" y="150" width="16" height="36" fill="${C.wood}"/><path d="M40 70 l60 -44 l60 44z" fill="${C.red}"/><rect x="54" y="70" width="92" height="84" fill="${C.wood}"/><circle cx="100" cy="104" r="16" fill="${K}"/><path d="M100 126 h14" stroke-width="5"/></g><g ${S} class="eb-peek" style="transform-origin:100px 104px"><circle cx="100" cy="104" r="11" fill="${C.yellow}"/><circle cx="104" cy="100" r="2.5" fill="${K}"/><path d="M110 104 l6 2 l-6 2z" fill="${C.orange}"/></g>`,
  },
  feather: {
    group: "out", particles: "leaf", with: ["bird", "binoculars"],
    keys: ["feder", "art", "arten", "bestimm", "erkennen", "pluma", "especie", "identific", "feather", "species", "identify", "gefieder", "plumaje", "plumage"],
    draw: () => `<g ${S} class="eb-glide"><path d="M50 170 q10 -110 110 -150 q-6 110 -110 150z" fill="${C.sky}"/><path d="M50 170 q50 -60 100 -140 M80 130 l-20 -20 M100 104 l-20 -24 M120 76 l-14 -22 M86 124 l30 4 M104 98 l30 2 M120 72 l26 0" fill="none" stroke-width="3"/></g>`,
  },
  binoculars: {
    group: "out", particles: "dot", with: ["bird", "camera", "feather"],
    keys: ["fernglas", "beobacht", "prismatico", "observ", "binocular", "watching", "birdwatching", "spektiv", "zaehl", "censo", "count"],
    draw: () => `<g ${S} class="eb-scan"><rect x="36" y="60" width="50" height="90" rx="20" fill="${K}"/><rect x="114" y="60" width="50" height="90" rx="20" fill="${K}"/><rect x="80" y="76" width="40" height="40" rx="8" fill="${C.greyD}"/><circle cx="61" cy="150" r="26" fill="${C.greyD}"/><circle cx="139" cy="150" r="26" fill="${C.greyD}"/><circle cx="61" cy="150" r="16" fill="${C.sky}"/><circle cx="139" cy="150" r="16" fill="${C.sky}"/><path d="M54 142 a8 8 0 0 1 8 -6 M132 142 a8 8 0 0 1 8 -6" fill="none" stroke="#fff" stroke-width="4"/></g>`,
  },
  budgie: {
    group: "in", particles: "dot", with: ["birdcage", "seeds"],
    keys: ["wellensittich", "kanarien", "nymphensittich", "papagei", "ziervogel", "voliere", "periquito", "canario", "loro", "budgie", "canary", "parrot", "aviary", "voliere", "haltung"],
    draw: () => `<g ${S}><path d="M20 156 h160" stroke-width="8" stroke="${C.wood}"/></g><g ${S} class="eb-hop" style="transform-origin:100px 156px"><path d="M100 150 q-36 0 -36 -50 q0 -50 40 -50 q30 0 30 40 q0 60 -34 60z" fill="${C.leaf}"/><path d="M94 52 q30 -6 40 20 q-16 8 -40 -4z" fill="${C.yellow}"/><circle cx="118" cy="66" r="4" fill="${K}"/><path d="M134 72 q8 4 2 12 q-6 -2 -6 -8z" fill="${C.orange}"/><path d="M76 140 l-20 40" stroke-width="8" stroke="${C.blue}"/><g class="eb-flap" style="transform-origin:86px 90px"><path d="M84 84 q-16 30 4 56 q12 -30 -4 -56z" fill="${C.green}"/></g><path d="M92 150 l-2 8 M108 150 l2 8" stroke-width="4"/></g>`,
  },
  birdcage: {
    group: "in", particles: "dot", with: ["budgie"],
    keys: ["kaefig", "jaula", "cage"],
    draw: () => `<g ${S}><path d="M100 10 v14" stroke-width="4"/><circle cx="100" cy="10" r="6" fill="none"/><path d="M40 90 q0 -66 60 -66 q60 0 60 66 v80 h-120z" fill="#fff" opacity=".5"/>${[52, 70, 88, 112, 130, 148].map((x) => `<path d="M${x} ${x < 100 ? 60 - (x - 52) / 3 : 44 + (x - 112) / 2.5} v110" stroke-width="2.5"/>`).join("")}<rect x="30" y="170" width="140" height="16" rx="5" fill="${C.gold}"/><path d="M60 120 h80" stroke-width="5" stroke="${C.wood}"/></g><g ${S} class="eb-swing" style="transform-origin:100px 60px"><circle cx="100" cy="104" r="12" fill="${C.yellow}"/><circle cx="104" cy="100" r="2.5" fill="${K}"/></g>`,
  },
  seeds: {
    group: "out", particles: "dot", with: ["feeder", "bird"],
    keys: ["koerner", "sonnenblumenkerne", "semillas", "pipas", "seeds", "sunflower", "sonnenblume", "girasol"],
    draw: () => `<g ${S}><path d="M100 186 v-70" stroke="${C.green}" stroke-width="6"/>${leafShape(100, 160, 20, -60)}</g><g ${S} class="eb-spin-slow" style="transform-origin:100px 80px">${[...Array(12)].map((_, i) => `<ellipse cx="100" cy="36" rx="11" ry="22" fill="${C.yellow}" transform="rotate(${i * 30} 100 80)"/>`).join("")}<circle cx="100" cy="80" r="28" fill="${C.woodD}"/></g>`,
  },
  // ── calm, habits, home order ─────────────────────────────────────
  sun: {
    group: "out", particles: "dot", with: ["cloud", "calendar", "coffeeCup"],
    keys: ["sonne", "sonnig", "morgenroutine", "aufsteh", "tag", "sol", "solar", "manana", "dia", "sun", "sunny", "morning", "day", "photovolta", "fotovolta", "placas", "panel", "balkonkraftwerk", "energie", "energia", "energy", "licht", "luz natural", "daylight", "sommerhitze"],
    draw: () => `<g class="eb-spin-slow" style="transform-origin:100px 100px">${[...Array(12)].map((_, i) => `<path d="M100 14 l9 26 h-18z" fill="${C.orange}" transform="rotate(${i * 30} 100 100)" ${S} stroke-width="3"/>`).join("")}</g><g ${S}><circle cx="100" cy="100" r="50" fill="${C.yellow}"/><circle cx="84" cy="94" r="5" fill="${K}"/><circle cx="116" cy="94" r="5" fill="${K}"/><path d="M80 114 q20 16 40 0" fill="none" stroke-width="4"/><circle cx="74" cy="110" r="6" fill="${C.pink}" ${N}/><circle cx="126" cy="110" r="6" fill="${C.pink}" ${N}/></g>`,
  },
  cloud: {
    group: "out", particles: "dot", with: ["sun", "weather"],
    keys: ["wolke", "nube", "cloud", "himmel", "cielo", "sky"],
    draw: () => `<g ${S} class="eb-drift"><path d="M40 140 a30 30 0 0 1 10 -58 a40 40 0 0 1 76 -12 a34 34 0 0 1 34 70z" fill="#fff"/></g>`,
  },
  moon: {
    group: "sky", particles: "star", with: ["star", "clock", "candle"],
    keys: ["schlaf", "nacht", "abendroutine", "muede", "erholung", "ruhe", "sueno", "dormir", "noche", "descanso", "cansancio", "sleep", "night", "rest", "tired", "bedtime", "mond", "luna", "moon", "abend", "einschlafen", "insomnio", "insomnia", "regenera", "recover", "erschoepf", "agotam", "exhaust", "energie und schlaf"],
    draw: () => `<g ${S} class="eb-float"><path d="M130 30 a70 70 0 1 0 40 120 a56 56 0 1 1 -40 -120z" fill="${C.yellow}"/><circle cx="96" cy="86" r="8" fill="${C.gold}" ${N}/><circle cx="80" cy="128" r="6" fill="${C.gold}" ${N}/></g>${sparkle(160, 50, 1.4, C.yellow)}${sparkle(40, 50, 1, "#fff")}`,
  },
  star: {
    group: "sky", particles: "star", with: ["moon", "lantern"],
    keys: ["stern", "estrella", "star", "wunsch", "deseo", "wish", "traum", "sueno ", "dream"],
    draw: () => `<g ${S} class="eb-spin-slow" style="transform-origin:100px 104px"><path d="M100 24 l22 50 l54 6 l-40 36 l12 52 l-48 -28 l-48 28 l12 -52 l-40 -36 l54 -6z" fill="${C.yellow}"/></g>${sparkle(40, 40, 1.3, "#fff")}${sparkle(170, 160, 1, "#fff")}`,
  },
  candle: {
    group: "in", particles: "dot", with: ["moon", "book", "teaCup"],
    keys: ["kerze", "achtsam", "meditat", "entspann", "vela", "atencion plena", "relaj", "candle", "mindful", "relax", "calm", "gelassen", "sereno", "ruhig", "tranquil", "stille", "silencio", "silence", "atem", "respira", "breath"],
    draw: (P) => `${glow(100, 56, 50, C.orange)}<g ${S}><rect x="70" y="80" width="60" height="100" rx="8" fill="${P.a}"/><ellipse cx="100" cy="80" rx="30" ry="7" fill="${P.b}"/><path d="M100 80 v-12" stroke-width="3"/><path d="M80 100 q4 14 0 24" fill="none" stroke="#fff" stroke-width="4"/></g><g ${S} class="eb-flame" style="transform-origin:100px 68px"><path d="M100 26 q20 22 12 36 q-4 8 -12 8 q-8 0 -12 -8 q-8 -14 12 -36z" fill="${C.orange}"/><path d="M100 44 q8 10 4 18 q-2 4 -4 4 q-2 0 -4 -4 q-4 -8 4 -18z" fill="${C.yellow}"/></g>`,
  },
  box: {
    group: "in", particles: "dot", with: ["shelf", "tag", "heart"],
    keys: ["ausmist", "minimalis", "entruempel", "aufraeum", "kiste", "karton", "desorden", "minimalism", "ordenar", "caja", "declutter", "minimalist", "tidy up", "boxes", "verschenk", "regalar", "donate", "spende", "loslassen", "soltar", "let go", "verkauf", "vender", "sell", "flohmarkt", "rastro", "flea market", "secondhand", "segunda mano", "second-hand"],
    draw: () => `<g ${S}><path d="M30 80 l70 -26 l70 26 v86 l-70 24 l-70 -24z" fill="${C.wood}"/><path d="M30 80 l70 24 l70 -24 M100 104 v86" fill="none" stroke-width="3"/><path d="M30 80 l-16 -26 l70 -24 l16 24z" fill="#d9a066"/><path d="M170 80 l16 -26 l-70 -24 l-16 24z" fill="#d9a066"/><path d="M58 128 l24 8" stroke-width="5" stroke="#fff"/></g><g ${S} class="eb-pop" style="transform-origin:120px 40px"><path d="M120 50 q-24 -16 -14 -32 q10 -12 22 4 q12 -16 22 -4 q10 16 -14 32z" fill="${C.red}" transform="translate(-20 -6) scale(1.1)"/></g>`,
  },
  shelf: {
    group: "in", particles: "dot", with: ["box", "book", "plant"],
    keys: ["ordnung", "regal", "papierkram", "ablage", "dokumente", "ordner", "orden", "estanteria", "papeleo", "documentos", "archivar", "order", "shelf", "paperwork", "documents", "filing", "organis", "organiz", "steuer", "impuesto", "tax", "vertrag", "contrato", "contract", "versicherung", "seguro", "insurance"],
    draw: (P) => `<g ${S}><rect x="26" y="20" width="148" height="166" rx="6" fill="${C.wood}"/><rect x="36" y="30" width="128" height="64" fill="${C.cream}"/><rect x="36" y="106" width="128" height="68" fill="${C.cream}"/>${[[44, 36, P.a], [62, 46, P.b], [80, 40, C.red], [98, 50, C.leaf]].map(([x, h, c]) => `<rect x="${x}" y="${94 - h}" width="16" height="${h}" fill="${c}"/>`).join("")}<rect x="120" y="70" width="34" height="24" fill="${C.wood}"/><rect x="46" y="140" width="52" height="34" fill="${P.a}"/><rect x="108" y="128" width="46" height="46" fill="#fff"/><path d="M116 142 h30 M116 154 h24" stroke-width="3"/></g><g ${S} class="eb-sway" style="transform-origin:140px 70px"><path d="M140 70 v-24" stroke="${C.green}" stroke-width="4"/>${leafShape(140, 50, 10, -40)}${leafShape(140, 46, 10, 40, C.green)}</g>`,
  },
  // ── family, kids, seasons ───────────────────────────────────────
  hands: {
    group: "in", particles: "heart", with: ["heart", "kite", "house"],
    keys: ["geschwister", "streit", "zusammenhalt", "teilen", "hermanos", "pelea", "compartir", "siblings", "sharing", "together", "miteinander", "juntos", "freundschaft", "amistad", "friendship", "gemeinsam", "comunidad", "community"],
    draw: () => `<g ${S}><path d="M20 150 q20 -40 50 -44 l40 -6 q12 0 12 10 q0 10 -12 12 l-20 2 l40 -4 q14 0 14 12 q0 12 -14 12 l-46 6 q-30 4 -50 30z" fill="${C.skin}"/><path d="M180 150 q-20 -40 -50 -44 l-30 0" fill="none" stroke-width="4"/><path d="M180 150 q-20 -40 -50 -44 l-20 -2 q-10 4 -6 14 q20 30 56 32z" fill="#d9a074"/></g><g ${S} class="eb-beat" style="transform-origin:100px 54px"><path d="M100 80 q-34 -20 -32 -42 q2 -16 16 -16 q12 0 16 12 q4 -12 16 -12 q14 0 16 16 q2 22 -32 42z" fill="${C.red}"/></g>`,
  },
  kite: {
    group: "out", particles: "dot", with: ["sun", "cloud", "balloon"],
    keys: ["drachen", "freizeit", "ausflug", "wochenende", "spielen", "cometa", "ocio", "excursion", "fin de semana", "jugar", "kite", "leisure", "outing", "weekend", "play", "ferien", "vacaciones escolares", "school holiday", "familienzeit", "tiempo en familia", "family time"],
    draw: (P) => `<g class="eb-flutter" style="transform-origin:100px 150px"><g ${S}><path d="M100 14 l50 50 l-50 70 l-50 -70z" fill="${P.a}"/><path d="M100 14 v120 M50 64 h100" stroke-width="3"/><path d="M100 14 l50 50 h-50z" fill="${C.yellow}"/><path d="M100 134 q-20 20 0 34 q20 14 0 30" fill="none" stroke-width="3"/>${[[92, 150], [106, 166], [94, 184]].map(([x, y]) => `<path d="M${x} ${y} l8 -6 l8 6 l-8 6z" fill="${C.red}" stroke-width="2"/>`).join("")}</g></g>`,
  },
  balloon: {
    group: "out", particles: "dot", with: ["kite", "gift"],
    keys: ["geburtstag", "party", "cumpleanos", "fiesta", "birthday", "celebration", "luftballon", "globo", "balloon"],
    draw: () => `<g ${S}>${[[70, 70, C.red, 0], [118, 56, C.blue, 0.6], [148, 92, C.yellow, 1.2]].map(([x, y, c, d]) => `<g class="eb-float" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="26" ry="32" fill="${c}"/><path d="M${x} ${y + 32} q-8 30 6 70" fill="none" stroke-width="2.5"/><path d="M${x - 10} ${y - 12} a14 14 0 0 1 8 -10" fill="none" stroke="#fff" stroke-width="5"/></g>`).join("")}</g>`,
  },
  gift: {
    group: "in", particles: "sparkle", with: ["balloon", "lantern"],
    keys: ["geschenk", "bescherung", "regalo", "gift", "present", "ostern", "pascua", "easter", "nikolaus", "reyes"],
    draw: () => `<g ${S} class="eb-bounce"><rect x="40" y="80" width="120" height="100" rx="6" fill="${C.red}"/><rect x="32" y="64" width="136" height="26" rx="5" fill="#f06a5d"/><path d="M100 64 v116" stroke-width="16" stroke="${C.yellow}"/><path d="M100 64 v116" stroke-width="3"/><path d="M100 64 q-40 -40 -40 -10 q0 14 40 10 q40 4 40 -10 q0 -30 -40 10z" fill="${C.yellow}"/></g>`,
  },
  schoolbag: {
    group: "in", particles: "dot", with: ["pencil", "book", "apple"],
    keys: ["schule", "kita", "kindergarten", "einschul", "ranzen", "schulweg", "escuela", "guarderia", "colegio", "mochila escolar", "school", "nursery", "kindergarten", "schoolbag", "lehrer", "erzieher", "maestra", "teacher", "lernen zuhause"],
    draw: (P) => `<g ${S} class="eb-bounce"><rect x="40" y="40" width="120" height="140" rx="26" fill="${P.a}"/><path d="M40 92 q60 -40 120 0 v-26 q-60 -40 -120 0z" fill="${P.b}"/><rect x="88" y="96" width="24" height="14" rx="4" fill="${C.gold}"/><rect x="62" y="124" width="76" height="40" rx="10" fill="#fff" opacity=".5"/><circle cx="74" cy="144" r="8" fill="${C.yellow}"/><path d="M120 136 l8 8 l-8 8" fill="none" stroke-width="3"/></g>`,
  },
  family: {
    group: "in", particles: "heart", with: ["house", "heart", "hands"],
    keys: ["familie", "eltern", "mama", "papa", "familienalltag", "erziehung", "kinder", "familia", "padres", "crianza", "hijos", "ninos", "family", "parents", "parenting", "kids", "children", "zuhause", "convivencia", "zusammenleben", "living together", "alltag", "dia a dia", "everyday"],
    draw: () => `<g ${S}>${[[56, 70, 34, C.blue], [144, 66, 36, C.red], [100, 112, 22, C.yellow]].map(([x, y, r, c], i) => `<g class="eb-bounce" style="animation-delay:${i * 0.35}s"><circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="${C.skin}"/><path d="M${x - r * 0.9} ${y + r * 2.6 > 186 ? 186 : y + r * 3} q0 -${r * 2.2} ${r * 0.9} -${r * 2.2} q${r * 0.9} 0 ${r * 0.9} ${r * 2.2}z" fill="${c}"/><circle cx="${x - r * 0.18}" cy="${y - 2}" r="2.5" fill="${K}"/><circle cx="${x + r * 0.18}" cy="${y - 2}" r="2.5" fill="${K}"/><path d="M${x - r * 0.2} ${y + r * 0.22} q${r * 0.2} ${r * 0.16} ${r * 0.4} 0" fill="none" stroke-width="2.5"/></g>`).join("")}</g>`,
  },
  // ── sport ───────────────────────────────────────────────────────
  shoe: {
    group: "out", particles: "dot", with: ["stopwatch", "bottle", "road"],
    keys: ["laufen", "joggen", "lauf", "marathon", "correr", "carrera", "running", "run ", "jogging", "zapatilla", "sneaker", "trainer", "5 km", "10 km", "media maraton", "half marathon", "spazier", "caminar", "walk", "bewegung", "movimiento", "move"],
    draw: (P) => `<g ${S} class="eb-run"><path d="M24 150 q0 -30 20 -40 l40 -40 l30 10 q10 20 34 26 l30 10 q20 8 20 30 v14 h-174z" fill="${P.a}"/><path d="M24 160 h174 v14 q0 8 -8 8 h-158 q-8 0 -8 -8z" fill="#fff"/><path d="M84 90 l14 14 M76 100 l14 14 M68 110 l14 14" stroke-width="4" stroke="#fff"/><path d="M120 120 q30 14 60 6" fill="none" stroke="${P.b}" stroke-width="6"/></g><g stroke="${K}" stroke-width="5" stroke-linecap="round" class="eb-speed"><path d="M6 110 h20 M0 128 h18 M8 146 h14"/></g>`,
  },
  racket: {
    group: "out", particles: "dot", with: ["ball", "shoe"],
    keys: ["padel", "tennis", "raqueta", "pala", "squash", "badminton", "racket", "racquet", "pickleball", "tischtennis", "ping pong"],
    draw: (P) => `<g ${S} class="eb-swing" style="transform-origin:60px 170px"><ellipse cx="110" cy="70" rx="56" ry="58" fill="${P.a}"/>${[[90, 50], [110, 46], [130, 50], [92, 76], [112, 74], [132, 78], [100, 100], [122, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" ${N}/>`).join("")}<path d="M80 118 l-30 54" stroke-width="18"/><path d="M80 118 l-30 54" stroke-width="10" stroke="${C.greyD}"/></g><g ${S} class="eb-bounce-ball"><circle cx="170" cy="150" r="16" fill="${C.lime}"/><path d="M156 142 q14 8 28 0 M156 158 q14 -8 28 0" fill="none" stroke="#fff" stroke-width="3"/></g>`,
  },
  ball: {
    group: "out", particles: "dot", with: ["shoe", "trophy", "stopwatch"],
    keys: ["fussball", "futbol", "balon", "football", "soccer", "ball", "mannschaft", "equipo", "team", "liga", "league", "mundial", "weltmeister", "world cup", "torwart", "portero", "goalkeeper", "entrenamiento", "training", "basket", "baloncesto", "volley"],
    draw: () => `<g class="eb-bounce-ball"><g ${S} class="eb-spin" style="transform-origin:100px 104px"><circle cx="100" cy="104" r="66" fill="#fff"/><path d="M100 72 l26 18 l-10 30 h-32 l-10 -30z" fill="${K}"/><path d="M100 72 v-34 M126 90 l32 -10 M116 120 l20 28 M84 120 l-20 28 M74 90 l-32 -10" stroke-width="3"/><path d="M60 52 l-6 18 l14 10 M140 52 l6 18 l-14 10 M44 130 l18 4 l10 16 M156 130 l-18 4 l-10 16 M100 170 v-12" stroke-width="3" fill="none"/></g></g><ellipse class="eb-shadow" cx="100" cy="186" rx="50" ry="6" fill="${K}" opacity=".18"/>`,
  },
  trophy: {
    group: "in", particles: "sparkle", with: ["ball", "shoe"],
    keys: ["sieger", "gewinn", "meister", "pokal", "victoria", "campeon", "trofeo", "copa", "win", "champion", "trophy", "cup", "ziel", "meta", "goal", "erfolg", "exito", "success"],
    draw: () => `<g ${S}><path d="M60 30 h80 v40 a40 40 0 0 1 -80 0z" fill="${C.gold}"/><path d="M60 40 h-22 q0 40 30 44 M140 40 h22 q0 40 -30 44" fill="none" stroke-width="7"/><rect x="92" y="108" width="16" height="30" fill="${C.gold}"/><rect x="62" y="138" width="76" height="16" rx="3" fill="${C.gold}"/><rect x="52" y="154" width="96" height="30" rx="4" fill="${C.woodD}"/></g>${sparkle(80, 60, 1.4)}${sparkle(150, 26, 1, C.yellow)}`,
  },
  dumbbell: {
    group: "in", particles: "dot", with: ["bottle", "stopwatch", "mat"],
    keys: ["kraft", "muskel", "fitness", "training", "fuerza", "musculo", "gimnasio", "pesas", "strength", "muscle", "gym", "weights", "workout", "core", "rumpf", "abdominal", "sentadilla", "squat", "kniebeug"],
    draw: () => `<g ${S} class="eb-lift"><rect x="40" y="92" width="120" height="16" rx="6" fill="${C.steel}"/><rect x="24" y="60" width="26" height="80" rx="8" fill="${K}"/><rect x="150" y="60" width="26" height="80" rx="8" fill="${K}"/><rect x="8" y="74" width="20" height="52" rx="6" fill="${C.greyD}"/><rect x="172" y="74" width="20" height="52" rx="6" fill="${C.greyD}"/></g>`,
  },
  mat: {
    group: "in", particles: "dot", with: ["dumbbell", "candle"],
    keys: ["yoga", "dehn", "stretch", "estira", "movilidad", "beweglich", "mobility", "flexib", "pilates", "esterilla", "mat", "faszien", "fascia", "rueckenschmerz", "dolor de espalda", "back pain", "yogamatte", "isomatte"],
    draw: (P) => `<g ${S}><path d="M20 160 h130 a24 24 0 0 1 0 0 v20 h-130z" fill="${P.a}"/><circle cx="160" cy="160" r="26" fill="${P.a}"/><circle cx="160" cy="160" r="14" fill="${P.b}"/><circle cx="160" cy="160" r="5" fill="${P.a}"/></g><g ${S} class="eb-breathe" style="transform-origin:80px 150px"><circle cx="70" cy="62" r="14" fill="${C.skin}"/><path d="M70 76 l0 44 l-30 30 M70 120 l40 30 M70 90 l-36 -20 M70 90 l40 -24" fill="none" stroke-width="9"/></g>`,
  },
  stopwatch: {
    group: "in", particles: "dot", with: ["shoe", "ball", "bottle"],
    keys: ["tempo", "zeit", "pace", "intervall", "ritmo", "cronometro", "intervalo", "stopwatch", "interval", "speed", "plan de entrenamiento", "trainingsplan", "training plan", "puls", "pulso", "heart rate"],
    draw: (P) => `<g ${S}><rect x="88" y="20" width="24" height="16" rx="4" fill="${K}"/><path d="M150 50 l12 -12" stroke-width="8"/><circle cx="100" cy="112" r="70" fill="${P.a}"/><circle cx="100" cy="112" r="56" fill="#fff"/>${[0, 90, 180, 270].map((a) => `<path d="M100 62 v10" transform="rotate(${a} 100 112)" stroke-width="4"/>`).join("")}<g class="eb-spin" style="transform-origin:100px 112px;animation-duration:3s"><path d="M100 112 v-46" stroke-width="5" stroke="${C.red}"/></g><circle cx="100" cy="112" r="6" fill="${K}"/></g>`,
  },
  waterBottle: {
    group: "out", particles: "drop", with: ["shoe", "apple"],
    keys: ["trinken", "hydrat", "isoton", "beber", "hidrata", "isotonic", "drink", "electrolyt", "electrolit", "wasserflasche", "bidon", "water bottle"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:50% 100%"><rect x="80" y="18" width="40" height="24" rx="6" fill="${K}"/><path d="M74 42 h52 v136 q0 8 -8 8 h-36 q-8 0 -8 -8z" fill="${C.sky}"/><path d="M74 90 h52 v88 q0 8 -8 8 h-36 q-8 0 -8 -8z" fill="${C.water}"/><rect x="74" y="100" width="52" height="30" fill="${P.a}"/></g>`,
  },
  restBed: {
    group: "sky", particles: "star", with: ["moon", "apple", "clock"],
    keys: ["regenerat", "pause", "ruhetag", "erholung", "descanso", "recuperac", "rest day", "recovery", "nutric", "ernaehrung fuer sport", "nutrition", "protein", "proteina"],
    draw: (P) => `<g ${S}><rect x="20" y="118" width="160" height="40" rx="8" fill="${P.a}"/><rect x="20" y="90" width="20" height="96" rx="4" fill="${C.wood}"/><rect x="160" y="110" width="20" height="76" rx="4" fill="${C.wood}"/><rect x="44" y="102" width="44" height="22" rx="10" fill="#fff"/><path d="M84 118 q40 -20 76 0" fill="${P.b}"/></g><g fill="#fff" font-family="sans-serif" font-weight="700" ${S} stroke-width="1.5"><text class="eb-rise" x="96" y="80" font-size="24">z</text><text class="eb-rise" style="animation-delay:1s" x="116" y="60" font-size="18">z</text><text class="eb-rise" style="animation-delay:2s" x="132" y="44" font-size="14">z</text></g>`,
  },
  // ── gems, jewellery, grooming ────────────────────────────────────
  crystal: {
    group: "in", particles: "sparkle", with: ["gem", "magnifier", "geode"],
    keys: ["kristall", "mineral", "rohstein", "cristal", "piedra en bruto", "gema en bruto", "bruto", "mineral", "crystal", "raw", "rough gem", "cuarzo", "quarz", "quartz", "amatist", "amethyst", "turmalin", "tourmaline", "mina", "mine", "yacimiento"],
    draw: () => `<g ${S}><path d="M30 186 l20 -70 l20 -20 l14 90z" fill="#c9b4f0"/><path d="M70 186 l10 -120 l26 -30 l24 30 l4 120z" fill="${C.purple}"/><path d="M80 66 l26 -30 l0 150 h-26z" fill="#b294ec" ${N}/><path d="M130 186 l10 -80 l20 -16 l16 20 l-6 76z" fill="#a585e6"/></g>${sparkle(96, 60, 1.4)}${sparkle(150, 100, 1)}${sparkle(50, 120, 0.9)}`,
  },
  gem: {
    group: "in", particles: "sparkle", with: ["ring", "magnifier", "crystal"],
    keys: ["edelstein", "diamant", "rubin", "saphir", "smaragd", "brillant", "piedra preciosa", "diamante", "rubi", "zafiro", "esmeralda", "brillante", "gem", "gemstone", "diamond", "ruby", "sapphire", "emerald", "talla", "schliff", "cut", "quilat", "karat", "carat", "pureza", "clarity", "reinheit"],
    draw: () => `<g ${S} class="eb-float"><path d="M50 70 l26 -30 h48 l26 30 l-50 100z" fill="${C.teal}"/><path d="M50 70 h100 M76 40 l-6 30 l30 100 l30 -100 l-6 -30 M70 70 l30 -30 l30 30" fill="none" stroke-width="3"/><path d="M76 40 l-6 30 h30z" fill="#9de6dd" ${N}/></g>${sparkle(150, 40, 1.6)}${sparkle(46, 120, 1)}`,
  },
  ring: {
    group: "in", particles: "sparkle", with: ["gem", "jewelBox"],
    keys: ["ring", "schmuck", "verlobung", "ehering", "anillo", "joya", "joyeria", "compromiso", "alianza", "jewel", "jewellery", "jewelry", "engagement", "wedding ring", "gold", "oro", "silber", "plata", "silver", "platin", "metal", "legierung", "aleacion", "alloy"],
    draw: () => `<g ${S}><circle cx="100" cy="124" r="56" fill="none" stroke="${C.gold}" stroke-width="16"/><circle cx="100" cy="124" r="56" fill="none" stroke-width="3"/><circle cx="100" cy="124" r="64" fill="none" stroke-width="3"/><circle cx="100" cy="124" r="48" fill="none" stroke-width="3"/></g><g ${S} class="eb-float"><path d="M76 50 l12 -18 h24 l12 18 l-24 30z" fill="#bfe8ff"/><path d="M76 50 h48" stroke-width="2.5"/></g>${sparkle(140, 34, 1.4)}`,
  },
  jewelBox: {
    group: "in", particles: "sparkle", with: ["ring", "gem"],
    keys: ["schatulle", "etui", "luxus", "estuche", "lujo", "joyero", "luxury", "box", "case", "lifestyle", "estilo de vida", "uhr ", "watch", "reloj de lujo"],
    draw: (P) => `<g ${S}><path d="M30 100 h140 v76 h-140z" fill="${P.a}"/><path d="M30 100 l10 -50 h120 l10 50z" fill="${P.a}" class="eb-lid" style="transform-origin:100px 100px"/><rect x="44" y="108" width="112" height="40" rx="6" fill="#fff4d6"/><circle cx="100" cy="122" r="14" fill="none" stroke="${C.gold}" stroke-width="6"/></g>${sparkle(100, 92, 1.6, C.yellow)}${sparkle(70, 70, 1)}`,
  },
  geode: {
    group: "in", particles: "sparkle", with: ["crystal", "gem"],
    keys: ["geode", "druse", "geoda", "agat", "agata", "agate", "achat"],
    draw: () => `<g ${S}><path d="M30 120 q0 -70 70 -76 q76 6 70 76 q-6 60 -70 62 q-66 -2 -70 -62z" fill="${C.greyD}"/><path d="M50 120 q0 -50 50 -54 q54 4 50 54 q-4 44 -50 46 q-46 -2 -50 -46z" fill="#e6d8ff"/>${[[70, 100], [100, 84], [130, 104], [80, 136], [118, 140], [100, 116]].map(([x, y]) => `<path d="M${x} ${y - 14} l10 14 l-10 14 l-10 -14z" fill="${C.purple}" stroke-width="2"/>`).join("")}</g>${sparkle(100, 116, 1.6)}`,
  },
  wheelGrind: {
    group: "in", particles: "sparkle", with: ["gem", "crystal"],
    keys: ["schleif", "polier", "facett", "pulir", "facetad", "tallado", "artesan", "lapidar", "polish", "faceting", "lapidary", "craft", "handwerk", "artesania", "werkstatt", "taller", "workshop"],
    draw: () => `<g ${S}><rect x="40" y="140" width="120" height="44" rx="8" fill="${C.greyD}"/><rect x="92" y="110" width="16" height="34" fill="${C.steel}"/></g><g ${S} class="eb-spin" style="transform-origin:100px 90px"><circle cx="100" cy="90" r="56" fill="${C.steel}"/><circle cx="100" cy="90" r="40" fill="#e4eaf0"/><path d="M100 34 v112 M44 90 h112" stroke-width="2"/><circle cx="100" cy="90" r="8" fill="${K}"/></g><g fill="${C.yellow}" ${N}>${[[160, 70], [170, 90], [164, 112]].map(([x, y], i) => `<circle class="eb-spray" style="animation-delay:${i * 0.2}s" cx="${x}" cy="${y}" r="3.5"/>`).join("")}</g>`,
  },
  razor: {
    group: "in", particles: "bubble", with: ["brushShave", "mirror"],
    keys: ["rasur", "rasier", "bart", "afeitado", "navaja", "barba", "shave", "shaving", "beard", "razor", "pflege fuer maenner", "cuidado personal", "grooming", "aftershave", "colonia", "perfume", "fragrance", "duft"],
    draw: () => `<g ${S} class="eb-sway" style="transform-origin:60px 150px"><path d="M60 150 l40 -100 q40 -10 60 10 l-60 100z" fill="${C.steel}"/><path d="M60 150 l40 -100" stroke-width="3"/><path d="M60 150 l-30 34 l12 6 l38 -30z" fill="${K}"/></g><g fill="#fff" ${S} stroke-width="3">${[[140, 150, 12], [160, 132, 9], [124, 170, 8]].map(([x, y, r], i) => `<circle class="eb-rise" style="animation-delay:${i * 0.5}s" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
  },
  brushShave: {
    group: "in", particles: "bubble", with: ["razor"],
    keys: ["rasierpinsel", "brocha", "shaving brush", "rasierseife", "jabon de afeitar"],
    draw: () => `<g ${S}><rect x="76" y="110" width="48" height="70" rx="10" fill="${C.wood}"/><path d="M70 110 q-6 -70 30 -80 q36 10 30 80z" fill="#fff"/><path d="M80 60 q20 -20 40 0" fill="none" stroke-width="3"/></g>`,
  },
  mirror: {
    group: "in", particles: "sparkle", with: ["lipstick", "hanger", "flower"],
    keys: ["spiegel", "haut", "beauty", "schoenheit", "espejo", "piel", "belleza", "cosmet", "mirror", "skin", "skincare", "beauty", "makeup", "make-up", "maquillaje", "falten", "arrugas", "wrinkle", "haar", "cabello", "hair", "frisur", "peinado", "hairstyle", "50", "sixty", "menopaus"],
    draw: (P) => `<g ${S}><ellipse cx="100" cy="86" rx="58" ry="70" fill="${P.a}"/><ellipse cx="100" cy="86" rx="46" ry="58" fill="${C.sky}"/><rect x="92" y="154" width="16" height="22" fill="${P.a}"/><path d="M60 184 q40 -16 80 0z" fill="${P.a}"/><path class="eb-shine" d="M70 60 l20 -20 M74 84 l34 -34" stroke="#fff" stroke-width="6"/></g>${sparkle(152, 30, 1.3)}`,
  },
  lipstick: {
    group: "in", particles: "sparkle", with: ["mirror", "flower"],
    keys: ["lippenstift", "pintalabios", "lipstick", "nagellack", "nail polish", "parfum", "esmalte de unas"],
    draw: () => `<g ${S} class="eb-float"><rect x="70" y="110" width="60" height="76" rx="6" fill="${C.gold}"/><rect x="78" y="70" width="44" height="44" fill="${C.steel}"/><path d="M82 70 v-30 q18 -20 36 -8 v38z" fill="${C.red}"/></g>`,
  },
  path: {
    group: "out", particles: "petal", with: ["shoe", "sun", "tree"],
    keys: ["spaziergang", "beweglich", "aktiv", "gesund altern", "paseo", "activa", "envejecer", "walk", "active", "ageing", "aging", "thrive", "balance", "gleichgewicht", "equilibrio", "knochen", "huesos", "bones", "gelenk", "articulac", "joint"],
    draw: () => `<g ${S}><path d="M70 186 q20 -60 50 -80 q30 -20 20 -60 h20 q12 40 -16 66 q-26 26 -34 74z" fill="${C.cream}"/></g><g ${S} class="eb-sway" style="transform-origin:40px 160px">${leafShape(40, 160, 22, -20, C.green)}${leafShape(40, 160, 20, 30)}</g><g ${S} class="eb-sway" style="transform-origin:170px 130px;animation-delay:1s">${leafShape(170, 130, 18, -30)}${leafShape(170, 130, 16, 30, C.green)}</g><g ${S} class="eb-float"><circle cx="150" cy="40" r="16" fill="${C.yellow}"/></g>`,
  },
  // ── energy ──────────────────────────────────────────────────────
  bill: {
    group: "in", particles: "coin", with: ["bolt", "meter", "coins"],
    keys: ["abrechnung", "stromrechnung", "factura", "recibo", "bill", "invoice", "gasto", "kosten", "costs", "coste", "tarif", "tarifa", "pvpc", "mercado libre", "peaje", "cargo", "termino", "impuesto electrico", "bono social", "vertrag", "heizkostenabrechnung"],
    draw: (P) => `<g ${S} class="eb-float"><path d="M44 20 h112 v162 l-14 -10 l-14 10 l-14 -10 l-14 10 l-14 -10 l-14 10 l-14 -10 l-14 10z" fill="#fff"/><path d="M62 46 h76 M62 66 h76 M62 86 h50" stroke-width="4" stroke="${C.grey}"/><rect x="62" y="104" width="76" height="34" rx="6" fill="${P.a}"/><path d="M106 110 l-10 12 h10 l-6 12" fill="none" stroke="#fff" stroke-width="4"/></g>`,
  },
  bolt: {
    group: "in", particles: "sparkle", with: ["plug", "bill", "battery"],
    keys: ["strom", "elektr", "kwh", "kilowatt", "potencia", "electric", "electricidad", "luz", "power", "watt", "e-bike", "ebike", "pedelec", "motor", "akku", "bateria", "battery", "laden", "carga", "charge", "voltio", "volt"],
    draw: () => `${glow(100, 100, 70, C.yellow)}<g ${S} class="eb-pulse"><path d="M116 14 L46 112 h48 l-16 76 L156 82 h-50z" fill="${C.yellow}"/></g>${sparkle(160, 40, 1.4, "#fff")}${sparkle(40, 60, 1, "#fff")}`,
  },
  battery: {
    group: "in", particles: "sparkle", with: ["bolt", "bike", "plug"],
    keys: ["akku", "batterie", "reichweite", "bateria", "autonomia", "battery", "range", "ladegeraet", "cargador", "charger", "speicher", "almacenamiento", "storage battery"],
    draw: () => `<g ${S}><rect x="36" y="56" width="120" height="96" rx="12" fill="#fff"/><rect x="156" y="84" width="16" height="40" rx="4" fill="${K}"/><rect class="eb-charge" x="48" y="68" width="96" height="72" rx="6" fill="${C.leaf}"/><path d="M104 74 l-24 34 h18 l-6 26 l26 -36 h-18z" fill="${C.yellow}"/></g>`,
  },
  solar: {
    group: "out", particles: "sparkle", with: ["sun", "house", "battery"],
    keys: ["solar", "photovolt", "fotovolt", "placa", "panel", "autoconsumo", "excedente", "balkonkraftwerk", "pv-anlage", "inversor", "wechselrichter", "inverter", "self-consumption"],
    draw: () => `<g class="eb-spin-slow" style="transform-origin:160px 36px">${[...Array(8)].map((_, i) => `<path d="M160 6 l5 14 h-10z" fill="${C.orange}" transform="rotate(${i * 45} 160 36)"/>`).join("")}</g><circle cx="160" cy="36" r="16" fill="${C.yellow}" ${S}/><g ${S}><path d="M16 150 l40 -80 h120 l-40 80z" fill="${C.blue}"/><path d="M36 110 h120 M50 70 l-24 80 M96 70 l-24 80 M136 70 l-24 80" stroke-width="3" stroke="#fff"/><path d="M76 150 v34 M120 150 v34" stroke-width="8"/></g><path class="eb-shine" d="M44 140 l36 -60" stroke="#fff" stroke-width="7" opacity=".6"/>`,
  },
  thermometer: {
    group: "in", particles: "dot", with: ["heatpump", "radiator", "snowflake"],
    keys: ["heiz", "heizung", "temperatur", "thermostat", "calefacc", "termostato", "temperatura", "heating", "thermostat", "temperature", "klima", "climatiz", "clima", "kuehl", "refriger", "cooling", "warmwasser", "agua caliente", "hot water", "termo", "boiler", "caldera"],
    draw: () => `<g ${S}><path d="M84 30 a16 16 0 0 1 32 0 v96 a32 32 0 1 1 -32 0z" fill="#fff"/><circle cx="100" cy="152" r="22" fill="${C.red}"/><rect class="eb-level" x="94" y="60" width="12" height="96" rx="6" fill="${C.red}"/><path d="M126 50 h18 M126 70 h12 M126 90 h18 M126 110 h12" stroke-width="4"/></g>`,
  },
  heatpump: {
    group: "out", particles: "dot", with: ["thermometer", "house", "snowflake"],
    keys: ["waermepumpe", "aerotermia", "bomba de calor", "heat pump", "aire acondicionado", "klimaanlage", "air conditioning", "split", "ventilador", "ventilator", "fan"],
    draw: (P) => `<g ${S}><rect x="20" y="56" width="160" height="110" rx="10" fill="#fff"/><circle cx="74" cy="111" r="40" fill="${C.steel}"/>${[0, 1, 2].map((i) => `<path d="M${130} ${80 + i * 16} h36" stroke-width="4"/>`).join("")}<path d="M36 166 v18 M164 166 v18" stroke-width="7"/></g><g ${S} class="eb-spin" style="transform-origin:74px 111px">${[0, 120, 240].map((a) => `<path d="M74 111 q-6 -30 14 -34 q10 14 -14 34z" fill="${P.a}" transform="rotate(${a} 74 111)"/>`).join("")}<circle cx="74" cy="111" r="6" fill="${K}"/></g>`,
  },
  snowflake: {
    group: "sky", particles: "snow", with: ["thermometer", "cabbage"],
    keys: ["frost", "schnee", "eis", "kalt", "nieve", "helada", "hielo", "frio", "snow", "ice", "frost", "cold", "freez", "congel", "gefrier"],
    draw: () => `<g ${S} class="eb-spin-slow" style="transform-origin:100px 100px" stroke="#2c6ea8" fill="none" stroke-width="7">${[0, 60, 120].map((a) => `<path d="M100 30 v140 M100 50 l-16 -14 M100 50 l16 -14 M100 150 l-16 14 M100 150 l16 14" transform="rotate(${a} 100 100)"/>`).join("")}</g><circle cx="100" cy="100" r="10" fill="#bfe4f2" ${S}/>`,
  },
  radiator: {
    group: "in", particles: "dot", with: ["thermometer", "window"],
    keys: ["heizkoerper", "radiador", "radiator", "entlueft", "purgar", "bleed"],
    draw: () => `<g ${S}>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${30 + i * 24}" y="70" width="20" height="100" rx="8" fill="#fff"/>`).join("")}<path d="M20 160 h170" stroke-width="5"/><path d="M40 170 v14 M160 170 v14" stroke-width="6"/></g><g fill="none" stroke="${C.orange}" stroke-width="5" stroke-linecap="round">${[60, 100, 140].map((x, i) => `<path class="eb-steam" style="animation-delay:${i * 0.5}s" d="M${x} 60 q-8 -10 0 -20 q8 -10 0 -20"/>`).join("")}</g>`,
  },
  plug: {
    group: "in", particles: "sparkle", with: ["bolt", "bulb", "bill"],
    keys: ["steckdose", "stecker", "standby", "verbrauch", "enchufe", "consumo", "stand-by", "plug", "socket", "consumption", "electrodomest", "haushaltsgeraet", "appliance", "kuehlschrank", "frigorifico", "etiqueta energetica", "energielabel", "energy label"],
    draw: (P) => `<g ${S}><rect x="114" y="60" width="70" height="90" rx="14" fill="#fff"/><circle cx="140" cy="96" r="5" fill="${K}"/><circle cx="158" cy="96" r="5" fill="${K}"/><path d="M134 120 h30" stroke-width="3"/></g><g ${S} class="eb-plugin"><path d="M10 104 q30 0 40 0" fill="none" stroke-width="6"/><rect x="48" y="80" width="40" height="48" rx="10" fill="${P.a}"/><path d="M88 94 h20 M88 114 h20" stroke-width="6"/></g>${sparkle(110, 70, 1, C.yellow)}`,
  },
  meter: {
    group: "in", particles: "dot", with: ["bill", "bolt", "plug"],
    keys: ["zaehler", "messen", "smart meter", "contador", "medir", "lectura", "meter", "reading", "measure", "verbrauch messen", "medidor", "app de consumo", "curva de carga", "load curve"],
    draw: (P) => `<g ${S}><rect x="30" y="30" width="140" height="150" rx="14" fill="#fff"/><path d="M50 116 a50 50 0 0 1 100 0" fill="none" stroke-width="14" stroke="${C.steel}"/><path d="M50 116 a50 50 0 0 1 100 0" fill="none" stroke-width="3"/><rect x="62" y="134" width="76" height="26" rx="5" fill="#d9f5e5"/><path d="M72 147 h56" stroke-width="3"/></g><g ${S} class="eb-needle" style="transform-origin:100px 116px"><path d="M100 116 l-4 -46 l4 -6 l4 6z" fill="${C.red}"/><circle cx="100" cy="116" r="7" fill="${K}"/></g>`,
  },
  // ── bikes ───────────────────────────────────────────────────────
  bike: {
    group: "out", particles: "leaf", with: ["helmet", "wrench", "pin"],
    keys: ["fahrrad", "rad ", "radfahr", "radel", "bike", "bicycle", "cycling", "bici", "bicicleta", "ciclismo", "rahmen", "cuadro", "frame", "kaufberat", "rennrad", "gravel", "mountainbike", "citybike", "lastenrad", "cargo bike", "kette", "cadena", "chain", "schaltung", "gears", "bremse", "freno", "brake", "reifen", "neumatico", "tyre", "tire", "schlauch", "camara de aire", "cambio de marchas"],
    draw: (P) => `<g class="eb-ride"><g ${S}>${wheel(46, 140, 36)}${wheel(156, 140, 36)}<path d="M46 140 l38 -58 h56 l16 58 M84 82 l26 58 h-64 M110 140 l30 -58" fill="none" stroke="${P.a}" stroke-width="9"/><path d="M46 140 l38 -58 h56 l16 58 M84 82 l26 58 h-64 M110 140 l30 -58" fill="none" stroke-width="2"/><path d="M76 82 l-8 -16 h20" fill="none" stroke-width="5"/><rect x="62" y="58" width="30" height="10" rx="5" fill="${K}"/><path d="M140 82 l-4 -22 h18" fill="none" stroke-width="5"/></g></g>`,
  },
  helmet: {
    group: "out", particles: "dot", with: ["bike", "shield"],
    keys: ["helm", "licht am rad", "sichtbar", "casco", "visibilidad", "helmet", "visibility", "reflekt", "reflect", "radweg", "carril bici", "bike lane"],
    draw: (P) => `<g ${S} class="eb-float"><path d="M24 130 q0 -96 86 -96 q70 0 70 86 l-20 10 h-136z" fill="${P.a}"/><path d="M60 54 q20 30 10 66 M100 38 q16 40 6 82 M136 46 q14 34 6 74" fill="none" stroke="#fff" stroke-width="6"/><path d="M24 130 h140" stroke-width="5"/><path d="M50 130 q10 40 40 40" fill="none" stroke-width="5"/></g>`,
  },
  // ── science ─────────────────────────────────────────────────────
  planet: {
    group: "sky", particles: "star", with: ["rocket", "telescope", "star"],
    keys: ["planet", "weltraum", "mars", "saturn", "jupiter", "espacio", "space", "galax", "universo", "universe", "astronom", "sonnensystem", "sistema solar", "solar system", "nasa", "orbit", "orbita"],
    draw: () => `<g ${S} class="eb-float"><circle cx="100" cy="100" r="54" fill="${C.orange}"/><path d="M50 84 q50 -10 100 6 M48 110 q52 -6 104 8" fill="none" stroke="#c96a1c" stroke-width="7"/></g><g ${S} class="eb-tilt" style="transform-origin:100px 100px"><ellipse cx="100" cy="104" rx="92" ry="22" fill="none" stroke="${C.yellow}" stroke-width="10" transform="rotate(-14 100 104)"/><ellipse cx="100" cy="104" rx="92" ry="22" fill="none" transform="rotate(-14 100 104)"/></g>`,
  },
  rocket: {
    group: "sky", particles: "star", with: ["planet", "star"],
    keys: ["rakete", "raumfahrt", "cohete", "rocket", "launch", "astronaut", "satellit", "satelite", "satellite", "iss"],
    draw: () => `<g class="eb-launch"><g ${S}><path d="M100 14 q36 30 36 90 v40 h-72 v-40 q0 -60 36 -90z" fill="#fff"/><circle cx="100" cy="80" r="16" fill="${C.sky}"/><path d="M64 120 l-24 30 v16 h24z M136 120 l24 30 v16 h-24z" fill="${C.red}"/><path d="M84 144 h32 l-6 12 h-20z" fill="${C.greyD}"/></g><g class="eb-flame" style="transform-origin:100px 156px"><path d="M88 156 q12 50 12 50 q0 0 12 -50z" fill="${C.orange}" ${S} stroke-width="3"/><path d="M94 156 q6 26 6 26 q0 0 6 -26z" fill="${C.yellow}"/></g></g>`,
  },
  telescope: {
    group: "sky", particles: "star", with: ["planet", "moon"],
    keys: ["teleskop", "sternwarte", "telescopio", "observatorio", "telescope", "observatory", "beobachtung des himmels", "eclipse", "finsternis"],
    draw: () => `<g ${S}><path d="M100 120 l-30 66 M100 120 l30 66 M100 120 v66" stroke-width="6"/></g><g ${S} class="eb-scan" style="transform-origin:100px 116px"><rect x="40" y="60" width="130" height="34" rx="10" fill="${C.blue}" transform="rotate(-24 105 77)"/><rect x="18" y="98" width="30" height="20" rx="5" fill="${C.greyD}" transform="rotate(-24 33 108)"/><circle cx="100" cy="116" r="10" fill="${K}"/></g>${sparkle(170, 26, 1.5, C.yellow)}`,
  },
  globe: {
    group: "sky", particles: "star", with: ["planet", "cloud", "wave"],
    keys: ["erde", "planet erde", "klima", "kontinent", "ozean", "tierra", "planeta", "clima", "continente", "earth", "planet earth", "climate", "continent", "ocean", "vulkan", "volcan", "volcano", "erdbeben", "terremoto", "earthquake", "geolog"],
    draw: () => `<g ${S}><circle cx="100" cy="100" r="70" fill="${C.blue}"/></g><g class="eb-spin-slow" style="transform-origin:100px 100px"><path d="M60 60 q20 -10 30 6 q-6 20 -26 18 q-14 10 -6 26 q-20 -10 -18 -30z M110 46 q30 2 44 30 q-16 4 -24 20 q10 20 -6 34 q-20 -10 -14 -40 q-14 -20 0 -44z M70 130 q20 -6 30 10 q-10 20 -30 14z" fill="${C.leaf}" stroke="${K}" stroke-width="3"/></g><circle cx="100" cy="100" r="70" fill="none" ${S}/><path d="M50 70 a60 60 0 0 1 20 -24" fill="none" stroke="#fff" stroke-width="7" opacity=".6"/>`,
  },
  gear: {
    group: "in", particles: "dot", with: ["bulb", "atom", "laptop"],
    keys: ["funktion", "technik", "maschine", "wie funktioniert", "mecanism", "maquina", "como funciona", "how it works", "how things work", "engine", "machine", "mechanism", "motor", "zahnrad", "engranaje", "gear"],
    draw: () => `<g ${S} class="eb-spin" style="transform-origin:80px 110px">${[...Array(10)].map((_, i) => `<rect x="72" y="44" width="16" height="22" rx="3" fill="${C.greyD}" transform="rotate(${i * 36} 80 110)"/>`).join("")}<circle cx="80" cy="110" r="50" fill="${C.greyD}"/><circle cx="80" cy="110" r="18" fill="#fff"/></g><g ${S} class="eb-spin-rev" style="transform-origin:150px 58px">${[...Array(8)].map((_, i) => `<rect x="144" y="20" width="12" height="16" rx="2" fill="${C.orange}" transform="rotate(${i * 45} 150 58)"/>`).join("")}<circle cx="150" cy="58" r="30" fill="${C.orange}"/><circle cx="150" cy="58" r="10" fill="#fff"/></g>`,
  },
  atom: {
    group: "sky", particles: "star", with: ["flask", "bulb", "gear"],
    keys: ["atom", "physik", "chemie", "teilchen", "energie", "fisica", "quimica", "particula", "physics", "chemistry", "particle", "quantum", "quanten", "cuantic", "molekuel", "molecul", "element", "licht und", "light and"],
    draw: () => `<g fill="none" ${S} stroke="${C.sky}" stroke-width="5">${[0, 60, 120].map((a) => `<ellipse cx="100" cy="100" rx="80" ry="28" transform="rotate(${a} 100 100)"/>`).join("")}</g>${[0, 60, 120].map((a, i) => `<g class="eb-spin" style="transform-origin:100px 100px;animation-duration:${4 + i}s"><circle cx="180" cy="100" r="8" fill="${C.yellow}" transform="rotate(${a} 100 100)" ${S} stroke-width="3"/></g>`).join("")}<circle class="eb-pulse" cx="100" cy="100" r="18" fill="${C.red}" ${S}/>`,
  },
  dna: {
    group: "sky", particles: "star", with: ["heart", "atom"],
    keys: ["dna", "adn", "genet", "zelle", "celula", "cell", "biolog", "brain", "gehirn", "cerebro", "neuron", "evolution ", "evolucion ", "gene ", "genes "],
    draw: () => `<g class="eb-float">${[...Array(9)].map((_, i) => { const y = 24 + i * 18, x = 30 * Math.sin(i * 0.8); return `<path d="M${100 - x} ${y} H${100 + x}" stroke="${i % 2 ? C.yellow : C.pink}" stroke-width="5"/><circle cx="${100 - x}" cy="${y}" r="7" fill="${C.teal}" ${S} stroke-width="3"/><circle cx="${100 + x}" cy="${y}" r="7" fill="${C.purple}" ${S} stroke-width="3"/>`; }).join("")}</g>`,
  },
  // ── money ───────────────────────────────────────────────────────
  piggy: {
    group: "in", particles: "coin", with: ["coins", "ledger", "tag"],
    keys: ["sparen", "spar", "geld", "ahorr", "dinero", "ahorro", "save", "saving", "money", "piggy", "notgroschen", "fondo de emergencia", "emergency fund", "frugal", "guenstig", "barato", "cheap", "kosten senken", "reducir gastos", "cut costs"],
    draw: () => `<g ${S} class="eb-bounce"><ellipse cx="100" cy="116" rx="70" ry="54" fill="${C.pink}"/><path d="M54 74 l-6 -24 l24 14z" fill="${C.pink}"/><ellipse cx="168" cy="112" rx="14" ry="18" fill="#f78fae"/><circle cx="164" cy="108" r="3" fill="${K}"/><circle cx="172" cy="116" r="3" fill="${K}"/><circle cx="130" cy="96" r="5" fill="${K}"/><rect x="80" y="62" width="40" height="8" rx="4" fill="${K}"/><path d="M60 162 v20 M90 166 v18 M120 166 v18 M146 160 v20" stroke-width="10" stroke="${C.pink}"/><path d="M60 162 v20 M90 166 v18 M120 166 v18 M146 160 v20" stroke-width="2"/><path d="M30 112 q-20 -6 -14 -22" fill="none" stroke-width="5"/></g><g class="eb-coin-drop"><circle cx="100" cy="30" r="14" fill="${C.gold}" ${S}/></g>`,
  },
  coins: {
    group: "in", particles: "coin", with: ["piggy", "ledger", "balance"],
    keys: ["euro", "muenze", "moneda", "coin", "coste", "preis", "price", "inversion", "investi", "anlage", "zins", "interes", "interest", "rendite", "rentabilidad", "return", "amortiz", "payback", "foerder", "subvencion", "ayuda", "subsidy", "grant", "steuerbonus", "deduccion"],
    draw: () => `<g ${S}>${[0, 1, 2, 3].map((i) => `<ellipse cx="70" cy="${170 - i * 16}" rx="40" ry="12" fill="${C.gold}"/>`).join("")}${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="136" cy="${170 - i * 16}" rx="40" ry="12" fill="${C.gold}"/>`).join("")}</g><g ${S} class="eb-spin-y" style="transform-origin:100px 40px"><circle cx="100" cy="40" r="22" fill="${C.yellow}"/><path d="M100 28 v24 M92 34 q8 -6 16 0 q-16 6 0 12 q8 0 8 -6" fill="none" stroke-width="3"/></g>`,
  },
  tag: {
    group: "in", particles: "coin", with: ["basket", "coins"],
    keys: ["angebot", "rabatt", "schnaeppchen", "preisvergleich", "oferta", "descuento", "rebaja", "chollo", "deal", "discount", "sale", "bargain", "coupon", "cupon", "gutschein", "einkaufen", "comprar", "buy", "kaufen", "kaufberatung", "compra inteligente", "smart shopping"],
    draw: (P) => `<g ${S} class="eb-sway" style="transform-origin:150px 40px"><path d="M150 40 l-100 0 l-34 50 l34 50 h100z" fill="${P.a}" transform="rotate(30 100 90)"/><circle cx="140" cy="50" r="9" fill="#fff" transform="rotate(30 100 90)"/><path d="M60 92 h50 M66 112 h34" stroke="#fff" stroke-width="7" transform="rotate(30 100 90)"/></g><path d="M150 40 q20 -30 40 -10" fill="none" ${S}/>`,
  },
  ledger: {
    group: "in", particles: "coin", with: ["coins", "piggy", "calculator"],
    keys: ["budget", "haushaltsbuch", "finanzen", "ausgaben", "presupuesto", "finanzas", "gastos", "contabil", "budget", "finance", "expenses", "spending", "debt", "schulden", "deuda", "kredit", "credito", "loan", "50/30/20"],
    draw: (P) => `<g ${S}><rect x="40" y="24" width="120" height="156" rx="8" fill="${P.a}"/><rect x="54" y="38" width="96" height="128" rx="4" fill="#fff"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M64 ${58 + i * 20} h46 M124 ${58 + i * 20} h16" stroke-width="3" stroke="${i === 4 ? C.red : C.greyD}"/>`).join("")}<path d="M40 40 v140" stroke-width="10" stroke="${P.b}"/></g><g ${S} class="eb-write"><path d="M140 160 l40 -70 l14 8 l-40 70 l-16 6z" fill="${C.yellow}"/></g>`,
  },
  calculator: {
    group: "in", particles: "coin", with: ["ledger", "coins"],
    keys: ["rechner", "berechnen", "kalkul", "calculadora", "calcular", "calculator", "calculate", "simulador", "simulator", "metodolog", "methodolog", "wie wir rechnen", "como calculamos"],
    draw: (P) => `<g ${S} class="eb-float"><rect x="46" y="20" width="108" height="164" rx="14" fill="${K}"/><rect x="60" y="34" width="80" height="34" rx="5" fill="#d9f5e5"/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${60 + c * 28}" y="${80 + r * 24}" width="22" height="18" rx="4" fill="${r === 3 && c === 2 ? P.a : C.steel}"/>`).join("")).join("")}<rect class="eb-blink" x="122" y="44" width="4" height="16" fill="${K}" ${N}/></g>`,
  },
};

// The category icons of every site (site.json "icon") → the motif that pictures that topic.
export const ICON_MOTIF = {
  hammer: "hammer", rolle: "roller", saege: "saw", tropfen: "drop", lampe: "lamp", schluessel: "key", monstera: "monstera", kanne: "wateringCan",
  lupe: "magnifier", steckling: "seedling", kasten: "planter", basilikum: "basil", moehre: "carrot", kompost: "compost", kreislauf: "cycle",
  apfel: "apple", bluete: "flower", keimling: "seedling", mirror: "mirror", hanger: "hanger", path: "path", pot: "plant", lantern: "lantern",
  compass: "compass", casa: "house", sillon: "armchair", grifo: "faucet", ladrillo: "brick", palmera: "island", sol: "sun", correr: "shoe",
  raqueta: "racket", balon: "ball", fuerza: "dumbbell", descanso: "restBed", montana: "mountain", phone: "phone", laptop: "laptop",
  shield: "shield", house: "wifi", spark: "chip", bubble: "chat", knife: "knife", pan: "pan", planner: "planner", loaf: "loaf", flask: "flask",
  jar: "jar", ola: "wave", arco: "gate", camino: "road", maleta: "suitcase", plato: "plate", bohne: "bean", muehle: "grinder", blatt: "teaLeaf",
  teekanne: "teapot", laterne: "lantern", queso: "cheese", tarro: "fermentJar", espiral: "spiral", frasco: "jar", balanza: "balance",
  kalender: "calendar", sanduhr: "hourglass", karteikarten: "cards", zirkel: "geometry", tafel: "blackboard", wegweiser: "signpost",
  gipfel: "mountain", rucksack: "backpack", wetter: "weather", kompass: "compass", spuren: "paws", cristal: "crystal", talla: "gem",
  lupa: "magnifier", anillo: "ring", navaja: "razor", geoda: "geode", brillante: "gem", rueda: "wheelGrind", estuche: "jewelBox",
  spargel: "asparagus", tomate: "tomato", kuerbis: "pumpkin", kohl: "cabbage", glas: "jar", messer: "knife", basket: "basket", lamp: "bulb",
  wrench: "wrench", tag: "tag", ledger: "ledger", kite: "kite", frame: "bike", bolt: "battery", route: "pin", bag: "backpack", planet: "planet",
  globe: "globe", gear: "gear", heart: "heart", atom: "atom", bulb: "bulb", factura: "bill", rayo: "bolt", termo: "thermometer",
  bombilla: "bulb", korb: "catBasket", napf: "bowl", herz: "heart", ohr: "ear", fenster: "window", buerste: "brush", eimer: "bucket",
  trommel: "washer", herd: "stove", wanne: "bathtub", flasche: "spray", sparrow: "bird", feeder: "feeder", nest: "nest", feather: "feather",
  lens: "camera", perch: "budgie", leuchtturm: "lighthouse", insel: "island", welle: "wave", tor: "gate", fahrkarte: "train",
  koffer: "suitcase", sonne: "sun", kiste: "box", regal: "shelf", telefon: "phone", waage: "balance", mond: "moon", haende: "hands",
  baum: "tree", ranzen: "schoolbag", haus: "family",
};
