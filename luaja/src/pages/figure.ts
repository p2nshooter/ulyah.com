/**
 * Pemandu belajar LUAJA — figur ilustrasi dengan potret pemandu; busana dan perlengkapan berganti menurut negara dan
 * suasana (tas, buku, syal, payung, meja belajar). Setiap pose memakai viewBox sendiri dan dikembalikan sebagai SVG inline.
 */
import type { Mood } from './scene.ts';

type HeadKey = 'depan' | 'senyum' | 'samping' | 'lembut' | 'ceria';
interface Head { src: string; ar: number; cx: number; chin: number; cut?: boolean }
/** Titik acu potret (fraksi lebar/tinggi): cx = pusat wajah, chin = dagu, cut = tepi bawah rata. */
const HEADS: Record<HeadKey, Head> = {
  depan: { src: 'p1', ar: 959 / 1816, cx: 0.472, chin: 0.394 },
  senyum: { src: 'p2', ar: 895 / 1715, cx: 0.502, chin: 0.409 },
  samping: { src: 'p5', ar: 1246 / 1804, cx: 0.617, chin: 0.45 },
  lembut: { src: 'p3', ar: 1245 / 1987, cx: 0.541, chin: 0.426, cut: true },
  ceria: { src: 'p4', ar: 1428 / 1923, cx: 0.513, chin: 0.535, cut: true },
};

const SKIN = '#c08a6c', SKIN_2 = '#9e7364';
const r1 = (n: number) => Math.round(n * 10) / 10;

type Tone = 'none' | 'warm' | 'cool' | 'dim';
function toneFor(mood?: Mood): Tone {
  if (!mood) return 'none';
  if (mood === 'senja' || mood === 'gugur') return 'warm';
  if (mood === 'malam') return 'dim';
  if (mood === 'hujan' || mood === 'kabut' || mood === 'salju') return 'cool';
  return 'none';
}
const TONE_FILTER: Record<Tone, string> = {
  none: '',
  warm: '<feColorMatrix type="matrix" values="1.04 0 0 0 0.02  0 0.98 0 0 0  0 0 0.9 0 -0.02  0 0 0 1 0"/>',
  cool: '<feColorMatrix type="matrix" values="0.94 0 0 0 0  0 0.97 0 0 0.01  0 0 1.03 0 0.03  0 0 0 1 0"/>',
  dim: '<feColorMatrix type="matrix" values="0.78 0 0 0 0  0 0.8 0 0 0.01  0 0 0.9 0 0.04  0 0 0 1 0"/>',
};

interface Placed { img: string; x: number; y: number; w: number; h: number; chinY: number; faceX: number; bottom: number }
/** Letakkan gambar kepala sehingga pusat wajah di (faceX, –) dengan tinggi h. */
/* Wajah pemandu dicerahkan (pemilik, 16 Nov 2026: „tolong di cerahin wajah modelnya“): potret aslinya agak redup, jadi
   setiap kepala diberi pencahayaan lembut — lebih terang, sedikit lebih kontras, nada hangat — sebelum penyesuaian suasana. */
const CERAH = '<feComponentTransfer><feFuncR type="linear" slope="1.14" intercept="0.045"/><feFuncG type="linear" slope="1.12" intercept="0.04"/><feFuncB type="linear" slope="1.08" intercept="0.03"/></feComponentTransfer><feComponentTransfer><feFuncR type="gamma" exponent="0.92"/><feFuncG type="gamma" exponent="0.93"/><feFuncB type="gamma" exponent="0.95"/></feComponentTransfer>';
function head(key: HeadKey, faceX: number, y: number, h: number, tone: Tone, small = false): Placed {
  const H = HEADS[key]; const w = h * H.ar; const x = faceX - H.cx * w;
  const fid = `wajah-${key}-${tone}${small ? '-s' : ''}`;
  const filter = `<filter id="${fid}" color-interpolation-filters="sRGB">${CERAH}${TONE_FILTER[tone]}</filter>`;
  const img = `<defs>${filter}</defs><image href="/assets/pemandu/${H.src}${small ? '-s' : ''}.webp" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" preserveAspectRatio="xMidYMid meet" filter="url(#${fid})"/>`;
  return { img, x, y, w, h, chinY: y + H.chin * h, faceX, bottom: y + h };
}

/* ----- primitif busana ----- */
const sleeve = (x1: number, y1: number, x2: number, y2: number, w: number, c: string) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const hand = (cx: number, cy: number, r = 17, rot = 0) => `<g transform="translate(${cx} ${cy}) rotate(${rot})"><ellipse rx="${r}" ry="${r * 1.15}" fill="${SKIN}"/><ellipse cx="${-r * 0.55}" cy="${-r * 0.5}" rx="${r * 0.42}" ry="${r * 0.62}" fill="${SKIN}"/><path d="M${-r * 0.3} ${r * 0.6} q${r * 0.4} ${r * 0.3} ${r * 0.8} 0" stroke="${SKIN_2}" stroke-width="1.5" fill="none" opacity=".6"/></g>`;
const shoes = (y: number, c: string) => `<ellipse cx="166" cy="${y}" rx="26" ry="11" fill="${c}"/><ellipse cx="234" cy="${y}" rx="26" ry="11" fill="${c}"/>`;
const shadow = (cx: number, cy: number, rx: number) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.12}" fill="#000" opacity=".16"/>`;

/** Buku tertutup, dipegang miring. */
function book(cx: number, cy: number, w: number, h: number, rot: number, cover: string, label = '') {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})"><rect x="${-w / 2 + 4}" y="${-h / 2 + 4}" width="${w}" height="${h}" rx="3" fill="#000" opacity=".18"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3" fill="${cover}"/><rect x="${-w / 2}" y="${-h / 2}" width="10" height="${h}" fill="#000" opacity=".22"/><rect x="${-w / 2 + 18}" y="${-h / 2 + 14}" width="${w - 34}" height="4" rx="2" fill="#fff" opacity=".85"/><rect x="${-w / 2 + 18}" y="${-h / 2 + 24}" width="${w * 0.45}" height="4" rx="2" fill="#fff" opacity=".6"/>${label ? `<text x="${-w / 2 + 18}" y="${h / 2 - 14}" font-family="Fraunces,serif" font-size="14" font-weight="700" fill="#fff" opacity=".9">${label}</text>` : ''}<path d="M${w / 2 - 2} ${-h / 2 + 3} v${h - 6}" stroke="#fff" stroke-width="3" opacity=".9"/></g>`;
}
/** Buku terbuka (dibaca). */
function openBook(cx: number, cy: number, w: number, h: number, rot: number, cover: string) {
  const lines = (sx: number) => [0, 1, 2, 3, 4].map((i) => `<rect x="${sx}" y="${-h / 2 + 14 + i * 11}" width="${w / 2 - 26}" height="3" rx="1.5" fill="#8a8073" opacity=".55"/>`).join('');
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})"><path d="M${-w / 2 - 4} ${-h / 2 + 6} Q0 ${-h / 2 - 6} ${w / 2 + 4} ${-h / 2 + 6} L${w / 2 + 4} ${h / 2 + 2} Q0 ${h / 2 + 12} ${-w / 2 - 4} ${h / 2 + 2}z" fill="${cover}"/><path d="M${-w / 2} ${-h / 2 + 8} Q${-w / 4} ${-h / 2} 0 ${-h / 2 + 6} V${h / 2} Q${-w / 4} ${h / 2 + 6} ${-w / 2} ${h / 2}z" fill="#fbf6ea"/><path d="M${w / 2} ${-h / 2 + 8} Q${w / 4} ${-h / 2} 0 ${-h / 2 + 6} V${h / 2} Q${w / 4} ${h / 2 + 6} ${w / 2} ${h / 2}z" fill="#f4eee0"/>${lines(-w / 2 + 12)}${lines(12)}<path d="M0 ${-h / 2 + 6} V${h / 2}" stroke="#d9d0bf" stroke-width="2"/></g>`;
}
function scarf(cx: number, y: number, c: string, c2: string, side: 1 | -1 = -1) {
  // y = garis bawah dagu; syal melingkar di bawahnya (tidak menutup dagu), ekor jatuh di satu sisi
  return `<g><path d="M${cx - 50} ${y + 6} Q${cx} ${y + 44} ${cx + 50} ${y + 6}" stroke="${c}" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M${cx - 50} ${y + 6} Q${cx} ${y + 44} ${cx + 50} ${y + 6}" stroke="${c2}" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="9 13" opacity=".8"/><path d="M${cx + side * 34} ${y + 22} q${side * 10} 70 ${side * 2} 150 l${-side * 28} 0 q${side * 2} -80 ${side * 8} -148z" fill="${c}"/><path d="M${cx + side * 12} ${y + 158} h${side * 24}" stroke="${c2}" stroke-width="5" stroke-linecap="round"/><path d="M${cx + side * 10} ${y + 138} h${side * 26}" stroke="${c2}" stroke-width="5" stroke-linecap="round"/></g>`;
}
function backpackBehind(c: string, c2: string) {
  return `<rect x="92" y="172" width="54" height="190" rx="22" fill="${c2}"/><rect x="254" y="172" width="54" height="190" rx="22" fill="${c2}"/><rect x="112" y="160" width="176" height="60" rx="26" fill="${c}"/>`;
}
const straps = (c: string) => `<path d="M150 150 Q140 230 156 320" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M250 150 Q260 230 244 320" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
function tote(x: number, y: number, c: string, c2: string) {
  return `<g transform="translate(${x} ${y})"><path d="M-14 -70 q14 -40 28 0" stroke="${c2}" stroke-width="5" fill="none"/><path d="M-32 -60 h64 l6 120 h-76z" fill="${c}"/><rect x="-14" y="-44" width="28" height="30" rx="3" fill="#1f2b4d"/><rect x="-10" y="-40" width="20" height="3" fill="#fff" opacity=".8"/><path d="M-26 -60 h52" stroke="#000" stroke-width="3" opacity=".15"/></g>`;
}
function umbrella(cx: number, topY: number, c: string, c2: string, stickBottom: number) {
  const scallops = [-3, -2, -1, 0, 1, 2].map((i) => `<path d="M${cx + i * 54} ${topY + 150} q27 -16 54 0" fill="${c}"/>`).join('');
  return `<g><line x1="${cx}" y1="${topY + 150}" x2="${cx}" y2="${stickBottom}" stroke="#2b2b2b" stroke-width="5" stroke-linecap="round"/><path d="M${cx - 162} ${topY + 150} A162 162 0 0 1 ${cx + 162} ${topY + 150}z" fill="${c}"/>${scallops}<path d="M${cx - 162} ${topY + 150} A162 162 0 0 1 ${cx} ${topY - 12} L${cx} ${topY + 150}z" fill="${c2}" opacity=".35"/><path d="M${cx - 60} ${topY + 150} A162 162 0 0 1 ${cx} ${topY - 12}" stroke="#fff" stroke-width="2" fill="none" opacity=".35"/><circle cx="${cx}" cy="${topY - 14}" r="5" fill="#2b2b2b"/><path d="M${cx} ${stickBottom} q0 22 18 22" stroke="#2b2b2b" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
}
function headphones(cx: number, topY: number, halfW: number, cupY: number, c: string, c2: string) {
  return `<g><path d="M${cx - halfW} ${cupY} A${halfW} ${halfW * 1.05} 0 0 1 ${cx + halfW} ${cupY}" stroke="${c}" stroke-width="14" fill="none" stroke-linecap="round"/><rect x="${cx - halfW - 20}" y="${cupY - 22}" width="40" height="58" rx="14" fill="${c}"/><rect x="${cx + halfW - 20}" y="${cupY - 22}" width="40" height="58" rx="14" fill="${c}"/><rect x="${cx - halfW - 12}" y="${cupY - 14}" width="24" height="42" rx="10" fill="${c2}"/><rect x="${cx + halfW - 12}" y="${cupY - 14}" width="24" height="42" rx="10" fill="${c2}"/></g>`;
}
/** Mantel panjang A-line (badan berdiri). */
function coat(c: string, shade: string, dress: string, opts: { belt?: string; open?: boolean; lapel?: boolean } = {}) {
  const base = `<path d="M122 150 Q200 128 278 150 L300 650 Q200 664 100 650z" fill="${c}"/><path d="M278 150 L300 650 Q250 658 200 657 L212 160z" fill="${shade}" opacity=".35"/>`;
  const front = opts.open === false ? '' : `<path d="M172 270 L160 650 L240 650 L228 270z" fill="${dress}"/><path d="M172 270 L160 650" stroke="#000" stroke-width="2" opacity=".12"/><path d="M228 270 L240 650" stroke="#000" stroke-width="2" opacity=".12"/>`;
  const belt = opts.belt ? `<rect x="118" y="382" width="164" height="22" rx="4" fill="${opts.belt}"/><rect x="186" y="378" width="28" height="30" rx="5" fill="#2b2420" opacity=".8"/>` : '';
  return base + front + belt;
}

export type Pose = 'berlin' | 'london' | 'tokyo' | 'jalan' | 'belajar' | 'sapa' | 'baca';
export interface FigureOpts { mood?: Mood; cls?: string; small?: boolean; label?: string }

export function figure(pose: Pose, o: FigureOpts = {}): string {
  const tone = toneFor(o.mood); const cls = `figure figure-${pose} ${o.cls ?? ''}`; const small = o.small ?? false;
  const wrap = (vb: string, inner: string, title: string) => `<svg class="${cls}" viewBox="${vb}" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${inner}</svg>`;

  if (pose === 'berlin') {
    // Musim gugur/salju Berlin: mantel camel (salju: hijau tua), syal, ransel, buku di pelukan
    const winter = o.mood === 'salju' || o.mood === 'malam';
    const C = winter ? ['#2f5d50', '#1d3f36', '#1b2a4a', '#c0392b', '#e8d5c0', '#8a5a2b', '#6b4321'] : ['#c9955a', '#9a6a36', '#1b2a4a', '#e0a63a', '#b4701c', '#8a5a2b', '#6b4321'];
    const h = head('depan', 200, 24, 250, tone, small);
    const inner = `${shadow(200, 674, 112)}${backpackBehind(C[5]!, C[6]!)}${coat(C[0]!, C[1]!, C[2]!)}${straps(C[5]!)}
      ${sleeve(130, 168, 112, 330, 44, C[0]!)}${sleeve(112, 330, 176, 352, 40, C[0]!)}
      ${sleeve(270, 168, 290, 330, 44, C[0]!)}${sleeve(290, 330, 232, 348, 40, C[0]!)}
      ${shoes(660, '#3b2a1e')}${h.img}${scarf(200, r1(h.chinY + 4), C[3]!, C[4]!)}
      ${book(206, 338, 118, 84, -7, '#1f2b4d', 'A1')}${hand(176, 352, 17, -10)}${hand(236, 348, 17, 12)}`;
    return wrap('0 0 400 720', inner, 'Pemandu belajar LUAJA di Berlin dengan buku pelajaran bahasa Jerman');
  }
  if (pose === 'london') {
    // London: trench krem bersabuk, payung kuning, tote hijau berisi buku
    const C = ['#d9c3a0', '#b89b73', '#2f3d5c', '#7a5f3d', '#f2c94c', '#c9a030', '#2f5d50', '#1d3f36'];
    const h = head('senyum', 200, 170, 250, tone, small);
    const inner = `${shadow(200, 820, 112)}${umbrella(286, 0, C[4]!, C[5]!, 262)}
      <g transform="translate(0 146)">${coat(C[0]!, C[1]!, C[2]!, { belt: C[3]! })}${sleeve(130, 168, 118, 420, 44, C[0]!)}${shoes(660, '#2b2420')}</g>
      ${h.img}
      ${sleeve(276, 322, 326, 170, 44, C[0]!)}${hand(324, 266, 17, 30)}
      ${tote(118, 630, C[6]!, C[7]!)}${hand(118, 568, 17, 0)}`;
    return wrap('0 -20 400 880', inner, 'Pemandu belajar LUAJA di London dengan payung dan buku bahasa Inggris');
  }
  if (pose === 'tokyo') {
    // Tokyo musim semi: kardigan merah muda lembut di atas gaun indigo, membaca buku terbuka, tas selempang kecil
    const C = ['#e8b4bf', '#c98e9c', '#2c3a73', '#f6ecd8', '#b89b73'];
    const h = head('senyum', 200, 24, 250, tone, small);
    const inner = `${shadow(200, 674, 112)}${coat(C[0]!, C[1]!, C[2]!)}<path d="M150 152 Q196 240 262 330" stroke="${C[4]!}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="238" y="326" width="58" height="46" rx="10" fill="${C[3]!}"/><rect x="238" y="326" width="58" height="14" rx="6" fill="${C[4]!}"/>
      ${sleeve(130, 168, 118, 320, 44, C[0]!)}${sleeve(118, 320, 170, 346, 40, C[0]!)}
      ${sleeve(270, 168, 284, 320, 44, C[0]!)}${sleeve(284, 320, 236, 346, 40, C[0]!)}
      ${shoes(660, '#4a3b4e')}${h.img}
      ${openBook(202, 352, 150, 92, -4, '#2c3a73')}${hand(144, 352, 16, -20)}${hand(262, 350, 16, 20)}
      <path d="M252 206 q8 -10 16 0 q-8 10 -16 0" fill="#f7b6c8"/>`;
    return wrap('0 0 400 720', inner, 'Pemandu belajar LUAJA membaca buku bahasa Jepang di bawah pohon sakura');
  }
  if (pose === 'jalan') {
    // Tiga perempat menghadap kanan: mantel biru tua, tote krem, melihat ke pemandangan
    const C = ['#23407a', '#162a56', '#e8d5c0', '#d9c3a0', '#b89b73'];
    const h = head('samping', 200, 24, 250, tone, small);
    const inner = `${shadow(190, 674, 100)}<path d="M126 156 Q190 132 252 160 L270 650 Q190 664 106 650z" fill="${C[0]!}"/><path d="M212 160 L252 160 L270 650 Q240 657 206 656z" fill="${C[1]!}" opacity=".5"/><path d="M196 280 L190 650 L236 650 L228 280z" fill="${C[2]!}"/>
      ${sleeve(134, 174, 124, 430, 44, C[0]!)}${shoes(660, '#2b2420')}${h.img}${tote(124, 500, C[3]!, C[4]!)}${hand(124, 440, 17, 0)}`;
    return wrap('0 0 400 720', inner, 'Pemandu belajar LUAJA berjalan membawa tas buku');
  }
  if (pose === 'belajar') {
    // Di meja belajar: headphone, laptop LUAJA, buku catatan, pensil, cangkir
    const C = ['#9fb8a3', '#7f9a84', '#2c3a73', '#c89b6a', '#9e7445', '#1b2a4a', '#0b1f4d'];
    const h = head('ceria', 260, 12, 300, tone, small);
    const inner = `<path d="M150 206 Q260 182 370 206 L392 310 L128 310z" fill="${C[0]!}"/><path d="M370 206 L392 310 L300 310 L310 212z" fill="${C[1]!}" opacity=".45"/>
      ${h.img}${headphones(260, 0, 118, 128, C[5]!, C[6]!)}
      <rect x="0" y="300" width="520" height="140" fill="${C[3]!}"/><rect x="0" y="300" width="520" height="16" fill="${C[4]!}"/><rect x="0" y="316" width="520" height="4" fill="#000" opacity=".12"/>
      <g transform="translate(372 196)"><rect x="-6" y="0" width="140" height="110" rx="8" fill="#d8dde6"/><rect x="2" y="8" width="124" height="94" rx="4" fill="#2e3440"/><g transform="translate(64 55)"><circle r="18" fill="#ffd766"/><text x="0" y="6" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-size="18" fill="#0b1f4d">L</text></g><rect x="-14" y="108" width="156" height="12" rx="4" fill="#b9c0cc"/></g>
      <path d="M150 326 L336 322 L352 372 L140 376z" fill="#fbf6ea"/><path d="M246 324 L246 374" stroke="#d9d0bf" stroke-width="2"/>${[0, 1, 2, 3].map((i) => `<path d="M${162 + i} ${336 + i * 9} h70" stroke="#aab" stroke-width="2.5" opacity=".6"/>`).join('')}
      ${sleeve(146, 226, 196, 340, 42, C[0]!)}${sleeve(380, 226, 340, 336, 42, C[0]!)}
      <g class="sc-write">${hand(210, 348, 18, 20)}<line x1="196" y1="332" x2="258" y2="300" stroke="#e0a63a" stroke-width="7" stroke-linecap="round"/><path d="M258 300 l10 -6 -4 10z" fill="#2b2420"/></g>${hand(330, 342, 18, -15)}
      <g transform="translate(78 300)"><path d="M-22 -40 h44 l-4 42 h-36z" fill="#f5b301"/><path d="M22 -30 q22 0 20 14 q-2 14 -18 12" stroke="#f5b301" stroke-width="6" fill="none"/><ellipse cx="0" cy="-40" rx="22" ry="6" fill="#6b4a00" opacity=".5"/><path class="sc-fog" d="M-8 -52 q4 -10 0 -18 M4 -50 q4 -10 0 -18" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
    return wrap('0 -20 520 460', inner, 'Pemandu belajar LUAJA di meja belajar dengan laptop, buku catatan dan headphone');
  }
  if (pose === 'baca') {
    // Setengah badan membaca buku terbuka (untuk kartu/CTA kecil)
    const C = ['#e8b4bf', '#c98e9c'];
    const h = head('lembut', 200, 10, 330, tone, small);
    const inner = `<path d="M96 230 Q200 204 304 230 L330 440 L70 440z" fill="${C[0]!}"/><path d="M304 230 L330 440 L228 440 L236 236z" fill="${C[1]!}" opacity=".4"/>${h.img}
      ${sleeve(104, 250, 108, 380, 46, C[0]!)}${sleeve(108, 380, 172, 392, 42, C[0]!)}${sleeve(296, 250, 292, 380, 46, C[0]!)}${sleeve(292, 380, 230, 390, 42, C[0]!)}
      ${openBook(200, 396, 170, 100, -3, '#1f2b4d')}${hand(142, 396, 17, -20)}${hand(260, 394, 17, 20)}`;
    return wrap('0 0 400 440', inner, 'Pemandu belajar LUAJA membaca buku dwibahasa');
  }
  // sapa: setengah badan untuk hero — blazer LUAJA biru tua bertepi emas, buku di tangan kiri, tangan kanan melambai
  const C = ['#13306a', '#0b1f4d', '#f5b301', '#ffd766'];
  const h = head('ceria', 260, 20, 460, tone, small);
  const inner = `<path d="M90 300 Q260 262 430 300 L470 560 L50 560z" fill="${C[0]!}"/><path d="M430 300 L470 560 L300 560 L318 306z" fill="${C[1]!}" opacity=".55"/><path d="M90 300 L130 560" stroke="${C[2]!}" stroke-width="3" opacity=".8"/><path d="M430 300 L390 560" stroke="${C[2]!}" stroke-width="3" opacity=".8"/>
    <rect x="336" y="396" width="30" height="30" rx="15" fill="${C[2]!}"/><text x="351" y="417" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-size="20" fill="#0b1f4d">L</text>
    ${h.img}
    ${sleeve(100, 330, 104, 500, 52, C[0]!)}${sleeve(104, 500, 196, 512, 46, C[0]!)}
    <g class="sc-wave">${sleeve(416, 330, 470, 236, 52, C[0]!)}${hand(474, 206, 22, 10)}</g>
    ${book(222, 506, 150, 104, -6, '#1f2b4d', 'LUAJA')}${hand(176, 522, 20, -12)}
    <g class="sc-twinkle" style="--d:2.6s"><path d="M486 150 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6z" fill="${C[3]!}"/></g><g class="sc-twinkle" style="--d:3.4s;--dl:-1s"><path d="M46 240 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="${C[3]!}"/></g>`;
  return wrap('0 0 520 560', inner, 'Pemandu belajar LUAJA menyapa sambil memegang buku');
}

/** Pose yang cocok untuk tiap jalur. */
export const POSE_FOR = { de: 'berlin', en: 'london', ja: 'tokyo', id: 'sapa' } as const;
