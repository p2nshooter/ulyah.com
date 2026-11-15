/**
 * Pemandangan negara × suasana (SVG, tanpa gambar eksternal). Dipakai hero, kartu jalur, kepala pelajaran.
 *  - negara: de (Berlin), en (London), ja (Tokyo/Fuji), id (LUAJA: campuran ketiganya)
 *  - suasana: pagi | siang | senja | malam | hujan | salju | sakura | gugur | kabut
 * Gerak (daun jatuh, hujan, salju, kelopak, bintang, bus) lewat kelas CSS .sc-* di app.css; mati pada reduced-motion.
 * Posisi partikel deterministik (seed) agar HTML stabil antar render.
 */
import type { Course } from '../data/model.ts';

export type Country = Course | 'id';
export type Mood = 'pagi' | 'siang' | 'senja' | 'malam' | 'hujan' | 'salju' | 'sakura' | 'gugur' | 'kabut';
export const MOODS: Mood[] = ['pagi', 'siang', 'senja', 'malam', 'hujan', 'salju', 'sakura', 'gugur', 'kabut'];
/** Suasana gelap → teks hero putih; terang → teks hero biru tua. */
export const isDark = (m: Mood): boolean => SKIES[m].dark;
export const MOOD_LABEL: Record<Mood, string> = { pagi: 'Pagi', siang: 'Siang', senja: 'Senja', malam: 'Malam', hujan: 'Hujan', salju: 'Salju', sakura: 'Sakura', gugur: 'Gugur', kabut: 'Kabut' };

interface Palette { sky: [string, string, string]; sun?: string; far: string; mid: string; near: string; ground: string; light: string; dark: boolean }

const SKIES: Record<Mood, Palette> = {
  pagi: { sky: ['#cfdcf0', '#f3dfd3', '#fff3e4'], sun: '#ffd9a0', far: '#9fb0c8', mid: '#6d7f9b', near: '#3f4d66', ground: '#e5dccb', light: '#fff', dark: false },
  siang: { sky: ['#6fb0ea', '#b9dcf7', '#eaf6fe'], sun: '#fff1b8', far: '#8fa9c7', mid: '#5e7596', near: '#36465f', ground: '#e8e0cf', light: '#fff', dark: false },
  senja: { sky: ['#3b2a6e', '#e8625a', '#fbc46a'], sun: '#ffd27a', far: '#5a3f78', mid: '#3a2a52', near: '#241a36', ground: '#4a3b4e', light: '#ffd27a', dark: true },
  malam: { sky: ['#050b24', '#0d1f4d', '#163572'], far: '#182b57', mid: '#10204a', near: '#0a1636', ground: '#0d1a3a', light: '#ffd766', dark: true },
  hujan: { sky: ['#4e5b6e', '#7f8c9d', '#a9b4c0'], far: '#6e7b8e', mid: '#4e5a6d', near: '#2f3847', ground: '#596573', light: '#e6ebf1', dark: true },
  salju: { sky: ['#a9b8d0', '#d5deea', '#f1f4f9'], far: '#bcc8da', mid: '#8d9bb1', near: '#5c6a80', ground: '#f4f7fb', light: '#fff', dark: false },
  sakura: { sky: ['#f4cfdc', '#fbe6ec', '#fff7f9'], sun: '#ffe6ef', far: '#cfaebd', mid: '#9c7f93', near: '#5f4b5a', ground: '#efe4e3', light: '#fff', dark: false },
  gugur: { sky: ['#e9b97e', '#f5dcb6', '#fbf0dd'], sun: '#ffe2a8', far: '#b48a62', mid: '#8a6342', near: '#5a3f2a', ground: '#d9b98a', light: '#fff', dark: false },
  kabut: { sky: ['#a7b3bf', '#c6cfd7', '#e2e7ec'], far: '#b9c2cc', mid: '#98a3af', near: '#6f7a87', ground: '#cfd6dc', light: '#fff', dark: false },
};

/** PRNG kecil deterministik. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const f = (n: number) => Math.round(n * 10) / 10;

function particles(mood: Mood, W: number, H: number, seed: number): string {
  const r = rng(seed);
  const out: string[] = [];
  if (mood === 'gugur') {
    for (let i = 0; i < 26; i++) {
      const x = r() * W, d = 7 + r() * 8, dl = -r() * 12, c = ['#e39b2d', '#c9701f', '#b8451c', '#f1c06b'][i % 4], s = 0.6 + r() * 0.8;
      out.push(`<path class="sc-fall" style="--d:${f(d)}s;--dl:${f(dl)}s;--dx:${f(-6 + r() * 12)}%;--rot:${Math.round(240 + r() * 360)}deg" transform="translate(${f(x)} ${f(-40)}) scale(${f(s)})" d="M0 -12c7 0 13 6 13 12 0 6-6 12-13 12C-7 12-13 6-13 0c0-6 6-12 13-12z" fill="${c}" opacity=".9"/>`);
    }
  } else if (mood === 'sakura') {
    for (let i = 0; i < 34; i++) {
      const x = r() * W, d = 8 + r() * 9, dl = -r() * 14, s = 0.5 + r() * 0.7;
      out.push(`<path class="sc-fall" style="--d:${f(d)}s;--dl:${f(dl)}s;--dx:${f(-8 + r() * 10)}%;--rot:${Math.round(180 + r() * 300)}deg" transform="translate(${f(x)} -30) scale(${f(s)})" d="M0 -10c5-4 11-2 11 4 0 5-5 9-8 14-2-2-4-3-6-4C-6 0-9 -3-8 -7c1-4 5-6 8-3z" fill="${i % 3 ? '#f7b6c8' : '#fbd0dc'}" opacity=".95"/>`);
    }
  } else if (mood === 'salju') {
    for (let i = 0; i < 60; i++) {
      const x = r() * W, d = 9 + r() * 10, dl = -r() * 15, rad = 1.5 + r() * 3.5;
      out.push(`<circle class="sc-fall" style="--d:${f(d)}s;--dl:${f(dl)}s;--dx:${f(-3 + r() * 6)}%;--rot:0deg" cx="${f(x)}" cy="-20" r="${f(rad)}" fill="#fff" opacity="${f(0.5 + r() * 0.5)}"/>`);
    }
  } else if (mood === 'hujan') {
    for (let i = 0; i < 70; i++) {
      const x = r() * W, d = 0.9 + r() * 0.8, dl = -r() * 2, len = 28 + r() * 30;
      out.push(`<line class="sc-rain" style="--d:${f(d)}s;--dl:${f(dl)}s" x1="${f(x)}" y1="-60" x2="${f(x - 6)}" y2="${f(-60 + len)}" stroke="#dfe6ee" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`);
    }
  } else if (mood === 'malam') {
    for (let i = 0; i < 70; i++) {
      const x = r() * W, y = r() * H * 0.55, rad = 0.8 + r() * 1.8;
      out.push(`<circle class="sc-twinkle" style="--d:${f(2 + r() * 4)}s;--dl:${f(-r() * 4)}s" cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="#fff"/>`);
    }
  }
  return out.join('');
}

function sky(p: Palette, W: number, H: number, id: string): string {
  return `<defs>
  <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".55" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
  <radialGradient id="${id}-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${p.sun ?? '#fff'}" stop-opacity=".95"/><stop offset=".45" stop-color="${p.sun ?? '#fff'}" stop-opacity=".45"/><stop offset="1" stop-color="${p.sun ?? '#fff'}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient>
  <linearGradient id="${id}-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd766"/><stop offset="1" stop-color="#ffb347"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>`;
}

function celestial(mood: Mood, p: Palette, W: number, H: number, id: string): string {
  if (mood === 'malam') return `<circle cx="${W * 0.78}" cy="${H * 0.2}" r="46" fill="#fff6d6"/><circle cx="${W * 0.78 + 18}" cy="${H * 0.2 - 10}" r="40" fill="${p.sky[1]}"/>`;
  if (mood === 'senja') return `<circle cx="${W * 0.5}" cy="${H * 0.54}" r="${H * 0.3}" fill="url(#${id}-sun)"/><circle cx="${W * 0.5}" cy="${H * 0.54}" r="52" fill="#ffe6a6" opacity=".95"/>`;
  if (mood === 'pagi' || mood === 'gugur' || mood === 'sakura' || mood === 'siang') return `<circle cx="${W * 0.2}" cy="${H * 0.28}" r="${H * 0.26}" fill="url(#${id}-sun)"/><circle cx="${W * 0.2}" cy="${H * 0.28}" r="40" fill="#fff8e1" opacity=".9"/>`;
  return '';
}

function clouds(mood: Mood, W: number, H: number, seed: number): string {
  if (mood === 'malam' || mood === 'senja') return '';
  const r = rng(seed + 7); const out: string[] = []; const c = mood === 'hujan' || mood === 'kabut' ? '#c5ced8' : '#ffffff';
  for (let i = 0; i < 5; i++) {
    const x = r() * W, y = H * (0.08 + r() * 0.3), s = 0.7 + r() * 1.1, o = mood === 'hujan' ? 0.5 : 0.75;
    out.push(`<g class="sc-drift" style="--d:${Math.round(40 + r() * 40)}s" opacity="${o}" transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" fill="${c}"><ellipse cx="0" cy="0" rx="70" ry="22"/><ellipse cx="-30" cy="-10" rx="36" ry="24"/><ellipse cx="28" cy="-12" rx="42" ry="28"/></g>`);
  }
  return out.join('');
}

function ground(p: Palette, W: number, H: number): string {
  return `<path d="M0 ${H * 0.82} C ${W * 0.25} ${H * 0.78} ${W * 0.6} ${H * 0.86} ${W} ${H * 0.8} V ${H} H0z" fill="${p.ground}"/>`;
}

function tree(x: number, y: number, s: number, crown: string, trunk: string, cls = 'sc-sway'): string {
  return `<g class="${cls}" transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><rect x="-6" y="-70" width="12" height="80" rx="4" fill="${trunk}"/><circle cx="0" cy="-110" r="52" fill="${crown}"/><circle cx="-34" cy="-80" r="38" fill="${crown}"/><circle cx="34" cy="-84" r="40" fill="${crown}"/></g>`;
}

function lamp(x: number, y: number, lit: boolean, light: string): string {
  return `<g transform="translate(${x} ${y})"><rect x="-3" y="-150" width="6" height="150" fill="#2a2f3a"/><rect x="-16" y="-162" width="32" height="14" rx="4" fill="#2a2f3a"/>${lit ? `<circle class="sc-glow" cx="0" cy="-154" r="26" fill="${light}" opacity=".35"/><circle cx="0" cy="-154" r="7" fill="${light}"/>` : ''}</g>`;
}

/* ---------------------------------------------------------------- Berlin */
function berlin(mood: Mood, p: Palette, W: number, H: number, id: string): string {
  const lit = p.dark, gy = H * 0.82;
  const win = (x: number, y: number, w: number, h: number) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${lit ? `url(#${id}-win)` : p.light}" opacity="${lit ? 0.9 : 0.55}"/>`;
  // Fernsehturm
  const tower = `<g transform="translate(${W * 0.14} ${gy})"><rect x="-9" y="-520" width="18" height="520" fill="${p.far}"/><circle cx="0" cy="-470" r="46" fill="${p.far}"/><circle cx="0" cy="-470" r="46" fill="url(#${id}-sun)" opacity=".25"/><rect x="-22" y="-430" width="44" height="22" fill="${p.far}"/><rect x="-3" y="-640" width="6" height="130" fill="${p.far}"/>${lit ? `<circle class="sc-twinkle" cx="0" cy="-640" r="4" fill="#ff5a5a"/>` : ''}</g>`;
  // Brandenburger Tor
  const cols = [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-170 + i * 68}" y="-200" width="26" height="190" fill="${p.mid}"/><rect x="${-176 + i * 68}" y="-206" width="38" height="12" fill="${p.mid}"/>`).join('');
  const tor = `<g transform="translate(${W * 0.5} ${gy})"><rect x="-200" y="-10" width="400" height="12" fill="${p.mid}"/>${cols}<rect x="-200" y="-240" width="400" height="40" fill="${p.mid}"/><rect x="-190" y="-262" width="380" height="22" fill="${p.mid}"/><rect x="-120" y="-300" width="240" height="38" fill="${p.mid}"/>
    <g transform="translate(0 -300)"><path d="M-40 0h80l-8-24h-64z" fill="${p.mid}"/><path d="M-30-24c0-14 12-24 24-24h12c12 0 24 10 24 24z" fill="${p.mid}"/><path d="M-26-48l-10-20 8-2 10 22zM26-48l10-20-8-2-10 22z" fill="${p.mid}"/><rect x="-4" y="-80" width="8" height="34" fill="${p.mid}"/><circle cx="0" cy="-86" r="8" fill="${p.mid}"/></g></g>`;
  // Berliner Dom (kubah) + deretan Altbau
  const dom = `<g transform="translate(${W * 0.82} ${gy})"><rect x="-120" y="-150" width="240" height="150" fill="${p.far}"/><path d="M-70-150c0-70 140-70 140 0z" fill="${p.far}"/><rect x="-4" y="-205" width="8" height="40" fill="${p.far}"/><circle cx="0" cy="-208" r="6" fill="${p.far}"/><rect x="-150" y="-110" width="24" height="110" fill="${p.far}"/><rect x="126" y="-110" width="24" height="110" fill="${p.far}"/></g>`;
  const alt = [0.02, 0.26, 0.68, 0.92].map((fx, k) => { const x = W * fx, h = 150 + (k % 2) * 30, w = 150; const ws = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) ws.push(win(x - w / 2 + 18 + c * 34, gy - h + 24 + r * 40, 18, 26)); return `<rect x="${x - w / 2}" y="${gy - h}" width="${w}" height="${h}" fill="${p.near}"/><rect x="${x - w / 2 - 6}" y="${gy - h - 14}" width="${w + 12}" height="14" fill="${p.near}"/>${ws.join('')}`; }).join('');
  const crown = mood === 'gugur' || mood === 'senja' ? '#d6892e' : mood === 'salju' ? '#dfe7ef' : mood === 'malam' ? '#13305a' : '#4f8a5b';
  const trees = tree(W * 0.34, gy + 6, 0.95, crown, '#3a2a1e') + tree(W * 0.66, gy + 6, 0.9, crown, '#3a2a1e') + tree(W * 0.04, gy + 10, 1.1, crown, '#3a2a1e') + tree(W * 0.97, gy + 10, 1.05, crown, '#3a2a1e');
  const lamps = lamp(W * 0.4, gy + 4, lit, '#ffd766') + lamp(W * 0.6, gy + 4, lit, '#ffd766');
  return tower + dom + alt + tor + trees + lamps;
}

/* ---------------------------------------------------------------- London */
function london(mood: Mood, p: Palette, W: number, H: number, id: string): string {
  const lit = p.dark, gy = H * 0.82;
  const win = (x: number, y: number, w: number, h: number) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${lit ? `url(#${id}-win)` : p.light}" opacity="${lit ? 0.9 : 0.5}"/>`;
  // Elizabeth Tower + Westminster
  const ben = `<g transform="translate(${W * 0.28} ${gy})"><rect x="-26" y="-420" width="52" height="420" fill="${p.mid}"/><rect x="-32" y="-470" width="64" height="56" fill="${p.mid}"/><circle cx="0" cy="-442" r="19" fill="${lit ? '#ffe9a8' : '#f3efe6'}"/><circle cx="0" cy="-442" r="19" fill="none" stroke="${p.near}" stroke-width="3"/><path d="M0-442v-12M0-442l8 6" stroke="${p.near}" stroke-width="2.5" stroke-linecap="round"/><path d="M-32-470l32-70 32 70z" fill="${p.mid}"/><rect x="-3" y="-570" width="6" height="34" fill="${p.mid}"/>${[0, 1, 2, 3, 4].map((i) => win(-9, -400 + i * 60, 18, 30)).join('')}</g>`;
  const westminster = `<g transform="translate(${W * 0.28} ${gy})"><rect x="26" y="-220" width="520" height="220" fill="${p.far}"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${60 + i * 72}" y="-262" width="14" height="48" fill="${p.far}"/>`).join('')}${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => win(50 + i * 50, -180, 16, 70)).join('')}<rect x="500" y="-300" width="60" height="300" fill="${p.far}"/><path d="M500-300l30-60 30 60z" fill="${p.far}"/></g>`;
  // London Eye
  const eye = `<g transform="translate(${W * 0.86} ${gy - 230})"><circle r="210" fill="none" stroke="${p.far}" stroke-width="8"/><circle r="196" fill="none" stroke="${p.far}" stroke-width="3" opacity=".6"/>${Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="0" x2="${f(Math.cos((i / 16) * Math.PI * 2) * 206)}" y2="${f(Math.sin((i / 16) * Math.PI * 2) * 206)}" stroke="${p.far}" stroke-width="3"/>`).join('')}${Array.from({ length: 16 }, (_, i) => `<circle cx="${f(Math.cos((i / 16) * Math.PI * 2) * 206)}" cy="${f(Math.sin((i / 16) * Math.PI * 2) * 206)}" r="9" fill="${lit ? '#ffd766' : '#fff'}" stroke="${p.far}" stroke-width="2"/>`).join('')}<path d="M-60 230l60-230 60 230z" fill="${p.far}"/></g>`;
  // Thames
  const thames = `<path d="M0 ${gy + 40} C ${W * 0.3} ${gy + 20} ${W * 0.6} ${gy + 70} ${W} ${gy + 30} V ${H} H0z" fill="${mood === 'malam' ? '#0a1a3a' : mood === 'hujan' || mood === 'kabut' ? '#6f7f93' : '#8fb0c9'}" opacity=".9"/>${lit ? `<rect x="${W * 0.26}" y="${gy + 40}" width="30" height="120" fill="#ffd766" opacity=".18"/>` : ''}`;
  // bus merah tingkat (bergerak)
  const bus = `<g class="sc-bus"><g transform="translate(0 ${gy - 2})"><rect x="0" y="-120" width="230" height="110" rx="12" fill="#c8102e"/><rect x="0" y="-72" width="230" height="6" fill="#8e0a20"/>${[0, 1, 2, 3].map((i) => `<rect x="${16 + i * 54}" y="-108" width="40" height="28" rx="4" fill="${lit ? '#ffe9a8' : '#dbe9f4'}"/><rect x="${16 + i * 54}" y="-58" width="40" height="30" rx="4" fill="${lit ? '#ffe9a8' : '#dbe9f4'}"/>`).join('')}<circle cx="50" cy="-6" r="16" fill="#1b1f27"/><circle cx="180" cy="-6" r="16" fill="#1b1f27"/><circle cx="50" cy="-6" r="6" fill="#9aa3ad"/><circle cx="180" cy="-6" r="6" fill="#9aa3ad"/></g></g>`;
  // bilik telepon + lampu
  const phone = `<g transform="translate(${W * 0.1} ${gy})"><rect x="-22" y="-120" width="44" height="120" rx="4" fill="#c8102e"/><rect x="-16" y="-100" width="32" height="60" fill="${lit ? '#ffe9a8' : '#e8eef4'}" opacity=".9"/><rect x="-26" y="-130" width="52" height="12" rx="3" fill="#a30d26"/></g>`;
  const lamps = lamp(W * 0.46, gy + 4, lit, '#ffe9a8') + lamp(W * 0.7, gy + 4, lit, '#ffe9a8');
  const fog = mood === 'kabut' || mood === 'hujan' ? `<rect class="sc-fog" x="-200" y="${gy - 260}" width="${W + 400}" height="300" fill="url(#${id}-fog)" opacity=".7"/>` : '';
  return eye + westminster + ben + thames + phone + lamps + bus + fog;
}

/* ---------------------------------------------------------------- Jepang */
function japan(mood: Mood, p: Palette, W: number, H: number, id: string): string {
  const lit = p.dark, gy = H * 0.82;
  const fuji = `<g transform="translate(${W * 0.62} ${gy})"><path d="M-520 0 L-120 -380 Q0 -420 120 -380 L520 0z" fill="${p.far}"/><path d="M-120-380 Q0-420 120-380 L80-330 L50-350 L20-320 L-10-350 L-50-325 L-80-350z" fill="${mood === 'malam' ? '#c9d4ea' : '#fff'}"/></g>`;
  const pink = mood === 'gugur' ? '#d24a2a' : mood === 'malam' ? '#9d6b88' : '#f6b3c3';
  const sakuraTree = (x: number, s: number) => `<g class="sc-sway" transform="translate(${f(x)} ${gy + 6}) scale(${s})"><path d="M-8 0 L-6 -70 Q-30 -100 -24 -130 M-6 -70 Q22 -96 28 -126" stroke="#4a2f23" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="-28" cy="-150" r="46" fill="${pink}"/><circle cx="26" cy="-150" r="52" fill="${pink}"/><circle cx="0" cy="-190" r="48" fill="${pink}"/><circle cx="-56" cy="-110" r="34" fill="${pink}"/><circle cx="60" cy="-112" r="36" fill="${pink}"/></g>`;
  const torii = `<g transform="translate(${W * 0.22} ${gy})"><rect x="-120" y="-300" width="22" height="300" fill="#d9533f"/><rect x="98" y="-300" width="22" height="300" fill="#d9533f"/><rect x="-170" y="-330" width="340" height="24" rx="6" fill="#b23a2a"/><path d="M-176-330 Q0-358 176-330 L176-312 Q0-336 -176-312z" fill="#d9533f"/><rect x="-140" y="-272" width="280" height="16" fill="#b23a2a"/><rect x="-10" y="-330" width="20" height="60" fill="#b23a2a"/></g>`;
  const pagoda = `<g transform="translate(${W * 0.86} ${gy})">${[0, 1, 2, 3, 4].map((i) => { const y = -i * 78, w = 170 - i * 22; return `<rect x="${-w / 2 + 18}" y="${y - 60}" width="${w - 36}" height="60" fill="${p.near}"/><path d="M${-w / 2} ${y - 60} Q0 ${y - 74} ${w / 2} ${y - 60} L${w / 2 - 20} ${y - 86} Q0 ${y - 100} ${-w / 2 + 20} ${y - 86}z" fill="${p.mid}"/>`; }).join('')}<rect x="-4" y="-470" width="8" height="90" fill="${p.mid}"/></g>`;
  const lanterns = lit ? Array.from({ length: 7 }, (_, i) => `<g class="sc-bob" transform="translate(${W * 0.08 + i * W * 0.14} ${gy - 240 - (i % 2) * 20})"><line x1="0" y1="-40" x2="0" y2="0" stroke="#3a2a23" stroke-width="2"/><rect x="-16" y="0" width="32" height="44" rx="10" fill="#f0603d"/><circle class="sc-glow" cx="0" cy="22" r="40" fill="#ffb347" opacity=".25"/><rect x="-18" y="-4" width="36" height="6" rx="2" fill="#2a1f1c"/><rect x="-18" y="42" width="36" height="6" rx="2" fill="#2a1f1c"/></g>`).join('') : '';
  const path = `<path d="M${W * 0.3} ${H} L${W * 0.45} ${gy + 10} L${W * 0.58} ${gy + 10} L${W * 0.78} ${H}z" fill="${mood === 'malam' ? '#1a2850' : '#d8cfc6'}" opacity=".8"/>`;
  return fuji + pagoda + torii + sakuraTree(W * 0.4, 1.05) + sakuraTree(W * 0.72, 0.95) + sakuraTree(W * 0.02, 0.9) + sakuraTree(W * 0.98, 1) + path + lanterns;
}

/* ------------------------------------------------------------ LUAJA (campuran) */
function blend(mood: Mood, p: Palette, W: number, H: number, id: string): string {
  // tiga landmark berjajar: Tor (kiri), Big Ben (tengah), Torii+Fuji (kanan) — satu dunia belajar
  const gy = H * 0.82, lit = p.dark;
  const fuji = `<g transform="translate(${W * 0.84} ${gy})"><path d="M-300 0 L-70 -260 Q0 -285 70 -260 L300 0z" fill="${p.far}"/><path d="M-70-260 Q0-285 70-260 L45-225 L20-245 L0-222 L-20-245 L-45-225z" fill="#fff"/></g>`;
  const tor = `<g transform="translate(${W * 0.16} ${gy}) scale(.72)">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-170 + i * 68}" y="-200" width="26" height="190" fill="${p.mid}"/>`).join('')}<rect x="-200" y="-240" width="400" height="40" fill="${p.mid}"/><rect x="-120" y="-300" width="240" height="38" fill="${p.mid}"/><rect x="-4" y="-340" width="8" height="40" fill="${p.mid}"/></g>`;
  const ben = `<g transform="translate(${W * 0.5} ${gy}) scale(.8)"><rect x="-26" y="-420" width="52" height="420" fill="${p.mid}"/><rect x="-32" y="-470" width="64" height="56" fill="${p.mid}"/><circle cx="0" cy="-442" r="19" fill="${lit ? '#ffe9a8' : '#f3efe6'}"/><path d="M-32-470l32-70 32 70z" fill="${p.mid}"/><rect x="26" y="-200" width="300" height="200" fill="${p.far}"/><rect x="-326" y="-170" width="300" height="170" fill="${p.far}"/></g>`;
  const torii = `<g transform="translate(${W * 0.8} ${gy}) scale(.7)"><rect x="-120" y="-300" width="22" height="300" fill="#d9533f"/><rect x="98" y="-300" width="22" height="300" fill="#d9533f"/><path d="M-176-330 Q0-358 176-330 L176-312 Q0-336 -176-312z" fill="#d9533f"/><rect x="-140" y="-272" width="280" height="16" fill="#b23a2a"/></g>`;
  const crown = mood === 'sakura' ? '#f6b3c3' : mood === 'gugur' ? '#d6892e' : mood === 'malam' ? '#13305a' : '#4f8a5b';
  return fuji + tor + ben + torii + tree(W * 0.32, gy + 6, 1, crown, '#3a2a1e') + tree(W * 0.66, gy + 6, 0.95, crown, '#3a2a1e') + lamp(W * 0.42, gy + 4, lit, '#ffd766') + lamp(W * 0.6, gy + 4, lit, '#ffd766');
}

export interface SceneOpts { w?: number; h?: number; seed?: number; cls?: string; id?: string; preserve?: string }

export function scene(country: Country, mood: Mood, o: SceneOpts = {}): string {
  const W = o.w ?? 1600, H = o.h ?? 900, p = SKIES[mood], id = o.id ?? `sc-${country}-${mood}`;
  const body = country === 'de' ? berlin(mood, p, W, H, id) : country === 'en' ? london(mood, p, W, H, id) : country === 'ja' ? japan(mood, p, W, H, id) : blend(mood, p, W, H, id);
  const snowCap = mood === 'salju' ? `<path d="M0 ${H * 0.82} C ${W * 0.25} ${H * 0.78} ${W * 0.6} ${H * 0.86} ${W} ${H * 0.8} V ${H * 0.86} C ${W * 0.6} ${H * 0.9} ${W * 0.25} ${H * 0.83} 0 ${H * 0.87}z" fill="#fff"/>` : '';
  const puddles = mood === 'hujan' ? `<ellipse cx="${W * 0.35}" cy="${H * 0.9}" rx="120" ry="10" fill="#dfe6ee" opacity=".35"/><ellipse cx="${W * 0.7}" cy="${H * 0.93}" rx="90" ry="8" fill="#dfe6ee" opacity=".3"/>` : '';
  const vignette = p.dark ? `<rect width="${W}" height="${H}" fill="url(#${id}-vig)"/>` : '';
  const defsExtra = `<defs><radialGradient id="${id}-vig" cx=".5" cy=".4" r=".8"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>`;
  return `<svg class="scene-svg ${o.cls ?? ''}" data-country="${country}" data-mood="${mood}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="${o.preserve ?? 'xMidYMax slice'}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${sky(p, W, H, id)}${defsExtra}${celestial(mood, p, W, H, id)}${clouds(mood, W, H, o.seed ?? 3)}${ground(p, W, H)}${snowCap}${body}${puddles}${particles(mood, W, H, o.seed ?? 3)}${vignette}</svg>`;
}

/** Suasana otomatis: jam WIB pelajar + variasi musim per negara (deterministik per hari). */
export function autoMood(country: Country, now = new Date()): Mood {
  const hour = (now.getUTCHours() + 7) % 24;
  const day = Math.floor(now.getTime() / 86_400_000);
  const month = now.getUTCMonth() + 1;
  const special: Mood[] = country === 'ja' ? (month >= 3 && month <= 5 ? ['sakura', 'sakura', 'pagi'] : month >= 10 && month <= 11 ? ['gugur', 'siang'] : ['siang', 'pagi'])
    : country === 'en' ? ['hujan', 'kabut', 'pagi', 'siang']
      : country === 'de' ? (month >= 9 && month <= 11 ? ['gugur', 'gugur', 'siang'] : month === 12 || month <= 2 ? ['salju', 'salju', 'siang'] : ['siang', 'pagi'])
        : ['siang', 'sakura', 'gugur', 'pagi'];
  if (hour >= 19 || hour < 5) return 'malam';
  if (hour >= 17) return 'senja';
  if (hour < 8) return 'pagi';
  return special[day % special.length]!;
}

export const MOOD_ICON: Record<Mood, string> = {
  pagi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 18a5 5 0 0 0-10 0M12 9V2M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M16 6l-4 4-4-4"/></svg>',
  siang: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  senja: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M8 6l4-4 4 4"/></svg>',
  malam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  hujan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 13v8M8 13v8M12 15v8M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"/></svg>',
  salju: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M4.9 7l14.2 10M4.9 17L19.1 7M2 12h20"/></svg>',
  sakura: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22c-4-3-7-8-7-12a7 7 0 0 1 14 0c0 4-3 9-7 12zM12 2v8M8 6l4 4 4-4"/></svg>',
  gugur: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 22l9-9"/></svg>',
  kabut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 10h18M3 14h12M3 18h16M7 6h12"/></svg>',
};
