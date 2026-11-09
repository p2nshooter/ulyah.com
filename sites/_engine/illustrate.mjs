// An animated picture on top of every article (owner, 9 Nov 2026, docs/ADSENSE-BLUEPRINT.md §29: „Tolong setiap artikel
// kasih gambar animasi yg sesuai tema, jgn polosan begitu“).
//
// The picture is drawn from the article's own subject: the words of its title, slug and summary are matched against
// the motifs of lib/motifs.mjs (German, Spanish and English stems), with the motifs of the site's own topics weighed
// first, so a guide about descaling a kettle shows a kettle, one about Monstera a Monstera, one about padel a racket.
// When the words name nothing, the motif of the article's topic (site.json category icon) stands in. Around it: a
// scene that suits it (hills and sky, waves, a room, or a night sky), two companions, things drifting through
// (leaves, bubbles, sparkles, snow …), in colours drawn from the site's own theme colour. Every article of a site
// gets its own arrangement and colours (seeded by its file name), so no two pictures are the same.
//
// Inline SVG + CSS, no image file, no script: about 6–10 kB per article, sharp on every screen, nothing to load.
// Motion stops under prefers-reduced-motion; the picture is decoration with a text alternative, never an ad slot.
import { COLORS, ICON_MOTIF, MOTIFS } from "./lib/motifs.mjs";

const W = 800;
const H = 320;
const GROUND = 280;

/** Lower case, umlauts spelled out, accents dropped: "Kühlschrank" → "kuehlschrank", "Calefacción" → "calefaccion". */
export const fold = (t) =>
  ` ${String(t || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9/]+/g, " ")} `;

function hits(text, keys) {
  let n = 0;
  for (const raw of keys) {
    const k = fold(raw).trim();
    if (!k) continue;
    // Long stems match inside German compounds ("Filterkaffee"), four letters only at the start of a word ("Putzplan"),
    // three or fewer only as a whole word ("LED", "Tee", never the "cal" of "Calathea").
    const whole = /\s$/.test(raw) || k.length <= 3;
    const found = k.length >= 5 && !k.includes(" ") && !whole ? text.includes(k) : text.includes(` ${k}${whole ? " " : ""}`);
    if (found) n += 1 + Math.min(k.length, 12) / 12;
  }
  return n;
}

/** The motif of an article and two companions. The subject of a headline comes before its colon ("Wasserkocher
 * entkalken: Mittel, Anleitung …"), so a word there decides; words after it and in the summary only pick companions. */
export function pickMotifs(a, site) {
  const title = String(a.title || "");
  const cut = title.search(/[:–—?]/);
  const subject = fold(cut > 0 ? title.slice(0, cut) : title);
  const rest = fold(`${cut > 0 ? title.slice(cut) : ""} ${String(a.slug || "").replace(/-/g, " ")}`);
  const desc = fold(a.description);
  const catMotif = ICON_MOTIF[a.cat?.icon] || null;
  const siteMotifs = new Set((site.categories || []).map((c) => ICON_MOTIF[c.icon]).filter(Boolean));
  const near = new Set(catMotif ? MOTIFS[catMotif]?.with || [] : []);
  const scored = [];
  for (const [name, m] of Object.entries(MOTIFS)) {
    const s = hits(subject, m.keys);
    const t = hits(rest, m.keys);
    const d = hits(desc, m.keys);
    if (!s && !t && !d) continue;
    const score = s * 6 + t * 2 + d + (name === catMotif ? 1 : near.has(name) ? 0.5 : 0) + (siteMotifs.has(name) ? 0.4 : 0);
    scored.push({ name, score, s, t });
  }
  scored.sort((x, y) => y.score - x.score);
  const lead = scored.find((x) => x.s > 0);
  const main = lead?.name || catMotif || [...siteMotifs][0] || "book";
  const extras = [];
  const add = (n) => {
    if (n && MOTIFS[n] && n !== main && !extras.includes(n) && extras.length < 2) extras.push(n);
  };
  for (const x of scored) if (x.s || x.t) add(x.name);
  add(catMotif);
  for (const n of MOTIFS[main].with || []) add(n);
  for (const n of MOTIFS[catMotif]?.with || []) add(n);
  return { main, extras };
}

// ── colour ─────────────────────────────────────────────────────────────
function hexHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}
const hsl = (h, s, l, a) => `hsl(${Math.round(((h % 360) + 360) % 360)} ${Math.round(s)}% ${Math.round(l)}%${a === undefined ? "" : ` / ${a}`})`;

function seeded(str) {
  let h = 2166136261;
  for (const c of String(str)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  let t = h >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ── particles ──────────────────────────────────────────────────────────
const PARTICLE = {
  leaf: (x, y, s, c) => `<path d="M${x} ${y} q${6 * s} -${9 * s} 0 -${18 * s} q-${6 * s} ${9 * s} 0 ${18 * s}z" fill="${c.leaf}"/>`,
  petal: (x, y, s, c) => `<ellipse cx="${x}" cy="${y}" rx="${4 * s}" ry="${7 * s}" fill="${c.pink}"/>`,
  bubble: (x, y, s) => `<circle cx="${x}" cy="${y}" r="${7 * s}" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="2"/>`,
  sparkle: (x, y, s) => `<path d="M${x} ${y - 8 * s} L${x + 2 * s} ${y - 2 * s} L${x + 8 * s} ${y} L${x + 2 * s} ${y + 2 * s} L${x} ${y + 8 * s} L${x - 2 * s} ${y + 2 * s} L${x - 8 * s} ${y} L${x - 2 * s} ${y - 2 * s}Z" fill="#fff"/>`,
  star: (x, y, s) => `<circle cx="${x}" cy="${y}" r="${2.2 * s}" fill="#fff"/>`,
  snow: (x, y, s) => `<g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M${x} ${y - 7 * s}v${14 * s}M${x - 6 * s} ${y - 3.5 * s}l${12 * s} ${7 * s}M${x - 6 * s} ${y + 3.5 * s}l${12 * s} -${7 * s}"/></g>`,
  heart: (x, y, s, c) => `<path d="M${x} ${y + 7 * s} q-${11 * s} -${7 * s} -${9 * s} -${13 * s} q${2 * s} -${5 * s} ${9 * s} -${1 * s} q${7 * s} -${4 * s} ${9 * s} ${1 * s} q${2 * s} ${6 * s} -${9 * s} ${13 * s}z" fill="${c.pink}"/>`,
  drop: (x, y, s, c) => `<path d="M${x} ${y} q-${5 * s} ${8 * s} 0 ${12 * s} q${5 * s} -${4 * s} 0 -${12 * s}z" fill="${c.water}"/>`,
  coin: (x, y, s, c) => `<circle cx="${x}" cy="${y}" r="${7 * s}" fill="${c.yellow}" stroke="#b8860b" stroke-width="2"/>`,
  dot: (x, y, s) => `<circle cx="${x}" cy="${y}" r="${3 * s}" fill="#fff" fill-opacity=".8"/>`,
};
// How each kind moves: falling, rising or twinkling in place.
const MOTION = { leaf: "fall", petal: "fall", snow: "fall", drop: "fall", coin: "fall", bubble: "rise", heart: "rise", dot: "rise", sparkle: "twinkle", star: "twinkle" };

const CSS = `.engine-bild{margin:0 0 1.4em;border-radius:20px;overflow:hidden;line-height:0;box-shadow:0 14px 34px rgba(20,30,50,.16);background:#eef3f8}
.engine-bild svg{display:block;width:100%;height:auto;aspect-ratio:${W}/${H}}
.engine-bild [class^="eb-"],.engine-bild [class*=" eb-"]{transform-box:fill-box;transform-origin:50% 50%}
.engine-bild .eb-float{animation:eb-float 5s ease-in-out infinite}
.engine-bild .eb-sway{transform-origin:50% 100%;animation:eb-sway 4.5s ease-in-out infinite alternate}
.engine-bild .eb-swing{animation:eb-swing 2.6s ease-in-out infinite alternate}
.engine-bild .eb-saw{animation:eb-saw .9s ease-in-out infinite alternate}
.engine-bild .eb-spin{animation:eb-spin 6s linear infinite}
.engine-bild .eb-spin-slow{animation:eb-spin 28s linear infinite}
.engine-bild .eb-spin-rev{animation:eb-spin 5s linear infinite reverse}
.engine-bild .eb-spin-y{animation:eb-spin-y 2.6s ease-in-out infinite}
.engine-bild .eb-glow{animation:eb-glow 2.8s ease-in-out infinite alternate}
.engine-bild .eb-twinkle{animation:eb-twinkle 2s ease-in-out infinite alternate}
.engine-bild .eb-blink{animation:eb-blink 1.2s ease-in-out infinite alternate}
.engine-bild .eb-blink-eyes{animation:eb-blink-eyes 4.5s infinite}
.engine-bild .eb-ping{animation:eb-ping 1.6s ease-in-out infinite}
.engine-bild .eb-wave{animation:eb-blink 1.6s ease-in-out infinite alternate}
.engine-bild .eb-pulse{animation:eb-pulse 2.2s ease-in-out infinite alternate}
.engine-bild .eb-beat{animation:eb-beat 1.5s ease-in-out infinite}
.engine-bild .eb-flip{transform-origin:0 50%;animation:eb-flip 4s ease-in-out infinite}
.engine-bild .eb-turn{animation:eb-turn 7s ease-in-out infinite}
.engine-bild .eb-draw{stroke-dasharray:320;animation:eb-draw 4.5s ease-in-out infinite}
.engine-bild .eb-write{animation:eb-write 1.8s ease-in-out infinite alternate}
.engine-bild .eb-scan{animation:eb-scan 6s ease-in-out infinite}
.engine-bild .eb-bounce{animation:eb-bounce 2.2s ease-in-out infinite}
.engine-bild .eb-crawl{animation:eb-crawl 7s ease-in-out infinite alternate}
.engine-bild .eb-fly{animation:eb-fly 5s ease-in-out infinite}
.engine-bild .eb-flap{animation:eb-flap .28s ease-in-out infinite alternate}
.engine-bild .eb-chop{transform-origin:100% 50%;animation:eb-chop 1.3s ease-in-out infinite}
.engine-bild .eb-roll{animation:eb-roll 3s ease-in-out infinite alternate}
.engine-bild .eb-stir{animation:eb-stir 1.4s ease-in-out infinite alternate}
.engine-bild .eb-tilt{animation:eb-tilt 4s ease-in-out infinite alternate}
.engine-bild .eb-dash{animation:eb-dash 2s linear infinite}
.engine-bild .eb-wave-flag{animation:eb-flag 1s ease-in-out infinite alternate}
.engine-bild .eb-needle{animation:eb-needle 5s ease-in-out infinite}
.engine-bild .eb-step{animation:eb-step 2.6s ease-in-out infinite alternate}
.engine-bild .eb-beam{animation:eb-beam 5s ease-in-out infinite alternate}
.engine-bild .eb-bob{animation:eb-bob 3.4s ease-in-out infinite alternate}
.engine-bild .eb-swim{animation:eb-swim 4s ease-in-out infinite alternate}
.engine-bild .eb-ride{animation:eb-ride 3s ease-in-out infinite alternate}
.engine-bild .eb-flash{animation:eb-flash 4s ease-out infinite}
.engine-bild .eb-tail{animation:eb-tail 2.2s ease-in-out infinite alternate}
.engine-bild .eb-twitch{animation:eb-twitch 3.2s ease-in-out infinite}
.engine-bild .eb-drift{animation:eb-drift 14s ease-in-out infinite alternate}
.engine-bild .eb-brush{animation:eb-brush 1.4s ease-in-out infinite alternate}
.engine-bild .eb-breathe{animation:eb-pulse 3.4s ease-in-out infinite alternate}
.engine-bild .eb-scrub{animation:eb-scrub .8s ease-in-out infinite alternate}
.engine-bild .eb-spray{animation:eb-spray 1.2s ease-out infinite}
.engine-bild .eb-hop{animation:eb-hop 2.6s ease-in-out infinite}
.engine-bild .eb-wobble{animation:eb-wobble 1.6s ease-in-out infinite alternate}
.engine-bild .eb-peek{animation:eb-peek 3s ease-in-out infinite alternate}
.engine-bild .eb-glide{animation:eb-glide 5s ease-in-out infinite alternate}
.engine-bild .eb-flutter{animation:eb-flutter 2.6s ease-in-out infinite alternate}
.engine-bild .eb-pop{animation:eb-pop 1.8s ease-in-out infinite alternate}
.engine-bild .eb-run{animation:eb-run .5s ease-in-out infinite alternate}
.engine-bild .eb-speed{animation:eb-speed .6s ease-in-out infinite alternate}
.engine-bild .eb-bounce-ball{animation:eb-ball 1.4s cubic-bezier(.4,0,.6,1) infinite}
.engine-bild .eb-shadow{animation:eb-shadow 1.4s cubic-bezier(.4,0,.6,1) infinite}
.engine-bild .eb-lift{animation:eb-lift 1.8s ease-in-out infinite alternate}
.engine-bild .eb-lid{animation:eb-lid 3s ease-in-out infinite alternate}
.engine-bild .eb-shine{animation:eb-shine 2.4s ease-in-out infinite alternate}
.engine-bild .eb-charge{transform-origin:0 50%;animation:eb-charge 3s ease-in-out infinite}
.engine-bild .eb-level{transform-origin:50% 100%;animation:eb-level 4s ease-in-out infinite alternate}
.engine-bild .eb-plugin{animation:eb-plugin 2s ease-in-out infinite alternate}
.engine-bild .eb-launch{animation:eb-launch 2s ease-in-out infinite alternate}
.engine-bild .eb-flame{animation:eb-flame .6s ease-in-out infinite alternate}
.engine-bild .eb-coin-drop{animation:eb-coin 2.4s ease-in infinite}
.engine-bild .eb-rise{animation:eb-rise 3.2s ease-out infinite}
.engine-bild .eb-steam{animation:eb-steam 3s ease-in-out infinite}
.engine-bild .eb-drop{animation:eb-drop 1.5s ease-in infinite}
.engine-bild .eb-p-fall{animation:eb-p-fall linear infinite}
.engine-bild .eb-p-rise{animation:eb-p-rise linear infinite}
.engine-bild .eb-p-twinkle{animation:eb-twinkle ease-in-out infinite alternate}
.engine-bild .eb-cloud{animation:eb-drift 22s ease-in-out infinite alternate}
.engine-bild .eb-waves{animation:eb-waves 6s ease-in-out infinite alternate}
.engine-bild .eb-halo{animation:eb-pulse 6s ease-in-out infinite alternate}
@keyframes eb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes eb-sway{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
@keyframes eb-swing{from{transform:rotate(-12deg)}to{transform:rotate(10deg)}}
@keyframes eb-saw{from{transform:translateX(-10px)}to{transform:translateX(10px)}}
@keyframes eb-spin{to{transform:rotate(360deg)}}
@keyframes eb-spin-y{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.15)}}
@keyframes eb-glow{from{opacity:.25;transform:scale(.92)}to{opacity:.65;transform:scale(1.06)}}
@keyframes eb-twinkle{from{opacity:.25;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
@keyframes eb-blink{from{opacity:1}to{opacity:.2}}
@keyframes eb-blink-eyes{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes eb-ping{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
@keyframes eb-pulse{from{transform:scale(1)}to{transform:scale(1.06)}}
@keyframes eb-beat{0%,40%,100%{transform:scale(1)}15%{transform:scale(1.09)}28%{transform:scale(1.03)}}
@keyframes eb-flip{0%,35%{transform:scaleX(1)}55%,85%{transform:scaleX(-1)}100%{transform:scaleX(1)}}
@keyframes eb-turn{0%,80%{transform:rotate(0)}100%{transform:rotate(180deg)}}
@keyframes eb-draw{0%{stroke-dashoffset:320}60%,100%{stroke-dashoffset:0}}
@keyframes eb-write{from{transform:translate(0,0)}to{transform:translate(-14px,6px)}}
@keyframes eb-scan{0%,100%{transform:translate(0,0)}33%{transform:translate(12px,-8px)}66%{transform:translate(-10px,5px)}}
@keyframes eb-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes eb-crawl{from{transform:translateX(-12px)}to{transform:translateX(12px)}}
@keyframes eb-fly{0%,100%{transform:translate(0,0)}30%{transform:translate(16px,-12px)}65%{transform:translate(-12px,-4px)}}
@keyframes eb-flap{from{transform:scaleY(1)}to{transform:scaleY(.55)}}
@keyframes eb-chop{0%,100%{transform:rotate(0)}40%{transform:rotate(-12deg)}}
@keyframes eb-roll{from{transform:translateX(-16px)}to{transform:translateX(16px)}}
@keyframes eb-stir{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
@keyframes eb-tilt{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}
@keyframes eb-dash{to{stroke-dashoffset:-40}}
@keyframes eb-flag{from{transform:scaleX(1) skewY(0)}to{transform:scaleX(.88) skewY(6deg)}}
@keyframes eb-needle{0%,100%{transform:rotate(0)}20%{transform:rotate(-28deg)}45%{transform:rotate(22deg)}70%{transform:rotate(-8deg)}}
@keyframes eb-step{from{transform:rotate(-6deg) translateY(0)}to{transform:rotate(4deg) translateY(-6px)}}
@keyframes eb-beam{from{transform:rotate(-16deg)}to{transform:rotate(16deg)}}
@keyframes eb-bob{from{transform:translateY(0) rotate(-3deg)}to{transform:translateY(-7px) rotate(3deg)}}
@keyframes eb-swim{from{transform:translate(-12px,3px)}to{transform:translate(12px,-3px)}}
@keyframes eb-ride{from{transform:translateX(-10px)}to{transform:translateX(10px)}}
@keyframes eb-flash{0%,86%,100%{opacity:0}90%{opacity:.95}}
@keyframes eb-tail{from{transform:rotate(-10deg)}to{transform:rotate(14deg)}}
@keyframes eb-twitch{0%,70%,100%{transform:rotate(0)}80%{transform:rotate(-12deg)}90%{transform:rotate(4deg)}}
@keyframes eb-drift{from{transform:translateX(-24px)}to{transform:translateX(24px)}}
@keyframes eb-brush{from{transform:translateX(-14px)}to{transform:translateX(14px)}}
@keyframes eb-scrub{from{transform:translate(-10px,0) rotate(-4deg)}to{transform:translate(10px,-3px) rotate(4deg)}}
@keyframes eb-spray{from{transform:translate(0,0);opacity:1}to{transform:translate(20px,-6px);opacity:0}}
@keyframes eb-hop{0%,30%,100%{transform:translateY(0)}15%{transform:translateY(-12px)}}
@keyframes eb-wobble{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
@keyframes eb-peek{from{transform:translateY(5px)}to{transform:translateY(-3px)}}
@keyframes eb-glide{from{transform:translate(0,0) rotate(-6deg)}to{transform:translate(10px,10px) rotate(6deg)}}
@keyframes eb-flutter{from{transform:rotate(-8deg) translateY(0)}to{transform:rotate(8deg) translateY(-8px)}}
@keyframes eb-pop{from{transform:scale(.9);opacity:.65}to{transform:scale(1.1);opacity:1}}
@keyframes eb-run{from{transform:translateY(0)}to{transform:translateY(-7px)}}
@keyframes eb-speed{from{transform:translateX(0);opacity:1}to{transform:translateX(-12px);opacity:.3}}
@keyframes eb-ball{0%,100%{transform:translateY(0)}50%{transform:translateY(-42px)}}
@keyframes eb-shadow{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.6)}}
@keyframes eb-lift{from{transform:translateY(0)}to{transform:translateY(-20px)}}
@keyframes eb-lid{from{transform:rotate(0)}to{transform:rotate(-12deg)}}
@keyframes eb-shine{from{opacity:.15}to{opacity:.9}}
@keyframes eb-charge{0%{transform:scaleX(.15)}80%,100%{transform:scaleX(1)}}
@keyframes eb-level{from{transform:scaleY(.45)}to{transform:scaleY(1)}}
@keyframes eb-plugin{from{transform:translateX(-12px)}to{transform:translateX(0)}}
@keyframes eb-launch{from{transform:translateY(0)}to{transform:translateY(-12px)}}
@keyframes eb-flame{from{transform:scale(1.04,.9)}to{transform:scale(.95,1.12)}}
@keyframes eb-coin{0%{transform:translateY(-30px);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateY(40px);opacity:0}}
@keyframes eb-rise{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-34px);opacity:0}}
@keyframes eb-steam{0%{transform:translateY(6px);opacity:0}40%{opacity:.9}100%{transform:translateY(-16px);opacity:0}}
@keyframes eb-drop{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(44px);opacity:0}}
@keyframes eb-p-fall{0%{transform:translate(0,-40px) rotate(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate(30px,${H}px) rotate(220deg);opacity:0}}
@keyframes eb-p-rise{0%{transform:translateY(40px);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateY(-${H}px);opacity:0}}
@keyframes eb-waves{from{transform:translateX(-30px)}to{transform:translateX(0)}}
@media (prefers-reduced-motion:reduce){.engine-bild *{animation:none!important}}
@media print{.engine-bild{box-shadow:none}}`;

const ALT = {
  de: (t) => `Illustration zum Ratgeber: ${t}`,
  es: (t) => `Ilustración de la guía: ${t}`,
  en: (t) => `Illustration for the guide: ${t}`,
  fr: (t) => `Illustration du guide : ${t}`,
};

/** A motif placed in the scene: its 200 × 200 box scaled, standing on the ground at x. */
function place(name, x, scale, P, ground = GROUND, extraClass = "") {
  const m = MOTIFS[name];
  // Inline transform origins in motifs are coordinates of their own 200 × 200 box.
  const svg = m.draw(P).replace(/style="transform-origin:(-?[\d.]+px -?[\d.]+px)/g, 'style="transform-box:view-box;transform-origin:$1');
  const tx = x - 100 * scale;
  const ty = ground - 186 * scale;
  return `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale})"><g class="${extraClass}">${svg}</g></g>`;
}

export function illustration(a, { site, lang, themeColor }) {
  const rnd = seeded(`${site.domain}/${a.file || a.slug}`);
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const { main, extras } = pickMotifs(a, site);
  const m = MOTIFS[main];
  const group = m.group;
  const base = hexHsl(themeColor) || { h: rnd() * 360, s: 0.4, l: 0.4 };
  const hue = base.s < 0.12 ? rnd() * 360 : base.h;
  const shift = pick([0, 24, -24, 150, 190, 210]);
  const P = {
    a: hsl(hue + shift, 62, 55),
    b: hsl(hue + shift + 42, 70, 62),
    c: hsl(hue + shift + 180, 55, 62),
  };
  const id = `eb${Math.floor(rnd() * 1e9).toString(36)}`;
  const parts = [];
  // Sky / wall
  const night = group === "sky";
  const top = night ? hsl(232, 45, 16) : group === "in" ? hsl(hue + shift, 45, 94) : hsl(200, 70, 88);
  const bottom = night ? hsl(252, 48, 30) : group === "in" ? hsl(hue + shift + 30, 55, 86) : hsl(hue + shift + 30, 65, 93);
  parts.push(
    `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>` +
      `<radialGradient id="${id}h"><stop offset="0" stop-color="#fff" stop-opacity="${night ? 0.28 : 0.85}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#${id}s)"/>`
  );
  // Layout: the main motif left, centre or right; the companions on the other side.
  const layout = pick([0, 1, 2]);
  const mainX = [250, 400, 560][layout];
  const sideX = [[520, 680], [130, 670], [120, 290]][layout];
  // Background details per scene
  if (night) {
    for (let i = 0; i < 26; i++) parts.push(`<circle class="eb-p-twinkle" style="animation-duration:${(1.5 + rnd() * 2.5).toFixed(1)}s;animation-delay:${(rnd() * 3).toFixed(1)}s" cx="${Math.round(rnd() * W)}" cy="${Math.round(rnd() * 200)}" r="${(1 + rnd() * 1.8).toFixed(1)}" fill="#fff"/>`);
    parts.push(`<circle cx="${W - 90}" cy="64" r="26" fill="#fff7d6" opacity=".9"/><circle cx="${W - 80}" cy="58" r="24" fill="${top}"/>`);
    parts.push(`<path d="M0 ${GROUND - 8} Q200 ${GROUND - 40} 400 ${GROUND - 14} T800 ${GROUND - 20} V${H} H0Z" fill="${hsl(hue + 230, 35, 14)}"/>`);
  } else if (group === "in") {
    // A wall with a framed window of light, a shelf line, soft round lights and a floor.
    for (let i = 0; i < 7; i++) parts.push(`<circle cx="${Math.round(rnd() * W)}" cy="${Math.round(30 + rnd() * 170)}" r="${Math.round(18 + rnd() * 46)}" fill="#fff" opacity="${(0.12 + rnd() * 0.22).toFixed(2)}"/>`);
    const wx = pick([60, 640, 330]);
    if (Math.abs(wx - mainX) > 140) parts.push(`<g opacity=".55"><rect x="${wx}" y="44" width="110" height="130" rx="10" fill="#fff"/><rect x="${wx + 10}" y="54" width="90" height="110" rx="6" fill="${hsl(200, 70, 86)}"/><path d="M${wx + 55} 54v110M${wx + 10} 109h90" stroke="#fff" stroke-width="6"/></g>`);
    parts.push(`<rect y="${GROUND - 2}" width="${W}" height="${H - GROUND + 2}" fill="${hsl(hue + shift + 20, 28, 76)}"/><rect y="${GROUND - 6}" width="${W}" height="8" fill="${hsl(hue + shift + 20, 30, 66)}"/>`);
    for (let x = 0; x < W; x += 80) parts.push(`<path d="M${x} ${GROUND + 2} l-30 ${H - GROUND}" stroke="${hsl(hue + shift + 20, 30, 70)}" stroke-width="2"/>`);
  } else {
    // Sun, clouds, far hills or the sea
    const sunX = pick([90, 700, 160, 620]);
    parts.push(`<circle class="eb-halo" cx="${sunX}" cy="62" r="64" fill="url(#${id}h)"/><circle cx="${sunX}" cy="62" r="30" fill="#ffe27a"/>`);
    for (let i = 0; i < 3; i++) {
      const cx = Math.round(80 + rnd() * 640), cy = Math.round(36 + rnd() * 70), s = 0.6 + rnd() * 0.6;
      parts.push(`<g class="eb-cloud" style="animation-delay:-${(rnd() * 10).toFixed(1)}s"><path transform="translate(${cx} ${cy}) scale(${s.toFixed(2)})" d="M-60 20 a22 22 0 0 1 8 -42 a32 32 0 0 1 60 -8 a26 26 0 0 1 32 50z" fill="#fff" opacity=".92"/></g>`);
    }
    if (group === "sea") {
      parts.push(`<rect y="${GROUND - 40}" width="${W}" height="${H}" fill="${hsl(205, 70, 62)}"/>`);
      for (let i = 0; i < 3; i++) {
        const y = GROUND - 34 + i * 26;
        parts.push(`<path class="eb-waves" style="animation-delay:-${i * 1.3}s" d="M-40 ${y} ${[...Array(15)].map((_, k) => `q30 -12 60 0`).join(" ")} V${H} H-40Z" fill="${hsl(205 + i * 6, 72, 55 - i * 7)}"/>`);
      }
    } else {
      parts.push(`<path d="M0 ${GROUND - 70} Q140 ${GROUND - 130} 300 ${GROUND - 76} T620 ${GROUND - 92} T800 ${GROUND - 80} V${H} H0Z" fill="${hsl(hue + shift + 110, 30, 78)}"/>`);
      parts.push(`<path d="M0 ${GROUND - 18} Q180 ${GROUND - 60} 380 ${GROUND - 24} T800 ${GROUND - 30} V${H} H0Z" fill="${hsl(120 + (hue % 40) - 20, 42, 58)}"/>`);
      parts.push(`<rect y="${GROUND - 4}" width="${W}" height="${H - GROUND + 4}" fill="${hsl(120 + (hue % 40) - 20, 44, 50)}"/>`);
    }
  }
  // The halo behind the main motif, then shadows and motifs
  parts.push(`<circle class="eb-halo" cx="${mainX}" cy="${GROUND - 120}" r="150" fill="url(#${id}h)"/>`);
  const mainScale = 1.26;
  const sideScale = 0.6;
  const ground = group === "sea" && m.group === "sea" ? GROUND - 10 : GROUND;
  const shadow = (x, w) => `<ellipse cx="${x}" cy="${GROUND + 6}" rx="${w}" ry="9" fill="#14202e" opacity="${night ? 0.35 : 0.14}"/>`;
  extras.forEach((n, i) => {
    const x = sideX[i];
    parts.push(shadow(x, 46), place(n, x, sideScale, P, GROUND + 2, i ? "eb-float" : ""));
  });
  parts.push(shadow(mainX, 96), place(main, mainX, mainScale, P, ground));
  // Things drifting through the scene
  const kind = m.particles || "dot";
  const draw = PARTICLE[kind] || PARTICLE.dot;
  const motion = MOTION[kind] || "rise";
  const n = night ? 6 : 12;
  for (let i = 0; i < n; i++) {
    const x = Math.round(rnd() * W);
    const y = motion === "fall" ? Math.round(-20 + rnd() * 40) : motion === "rise" ? Math.round(GROUND - 20 + rnd() * 40) : Math.round(20 + rnd() * 200);
    const s = (0.7 + rnd() * 0.8).toFixed(2);
    const dur = motion === "twinkle" ? (1.4 + rnd() * 2).toFixed(1) : (7 + rnd() * 7).toFixed(1);
    parts.push(`<g class="eb-p-${motion}" style="animation-duration:${dur}s;animation-delay:-${(rnd() * Number(dur)).toFixed(1)}s">${draw(x, y, Number(s), COLORS)}</g>`);
  }
  const alt = (ALT[lang] || ALT.en)(a.title);
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return (
    `<figure class="engine-bild" data-motif="${main}"><style>${CSS}</style>` +
    `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(alt)}" preserveAspectRatio="xMidYMid slice" focusable="false">` +
    parts.join("") +
    `</svg></figure>`
  );
}
