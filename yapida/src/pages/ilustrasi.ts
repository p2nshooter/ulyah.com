/**
 * Ilustrasi garis emas per mata pelajaran untuk sampul buku pelajaran (pemilik, 17 Nov 2026: „Kasih gambarnya sesuai mata
 * pelajaran … gambar animasi atau interaktif biar lebih menyenangkan“). Satu gaya untuk semua: garis emas (currentColor)
 * di atas sampul berornamen, bagian yang bergerak diberi kelas animasi (pustaka.css § ilustrasi) yang berjalan saat buku
 * terlihat di layar atau disentuh, dan berhenti untuk pengguna yang memilih „kurangi gerakan“.
 */

const BUKA = '<svg class="ilu ILU" viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const svg = (slug: string, isi: string) => `${BUKA.replace('ILU', `ilu-${slug}`)}${isi}</svg>`;
const huruf = (x: number, y: number, t: string, o: { uk?: number; kelas?: string; font?: string; tebal?: boolean } = {}) =>
  `<text${o.kelas ? ` class="${o.kelas}"` : ''} x="${x}" y="${y}" text-anchor="middle" font-size="${o.uk ?? 10}" fill="currentColor" stroke="none" font-family="${o.font ?? 'Fraunces, Georgia, serif'}"${o.tebal ? ' font-weight="700"' : ''}>${t}</text>`;

const ILUSTRASI: Record<string, string> = {
  matematika: svg('matematika', `
    <circle class="gores" cx="32" cy="35" r="18" stroke-dasharray="114" />
    <path d="M32 19 L47.5 44 H16.5 Z" fill="currentColor" fill-opacity=".14" />
    ${huruf(32, 39, 'π', { uk: 13 })}
    <g class="melayang"><path d="M9 12h7M12.5 8.5v7" /></g>
    <g class="melayang d2"><path d="M48 11h8" /></g>
    <g class="melayang d3"><path d="M8 52l6 6M14 52l-6 6" /></g>
    <g class="melayang d4"><path d="M49 56h8" /><circle cx="53" cy="52.2" r="1" fill="currentColor" stroke="none" /><circle cx="53" cy="59.8" r="1" fill="currentColor" stroke="none" /></g>`),

  ipa: svg('ipa', `
    <circle cx="30" cy="30" r="4.2" fill="currentColor" stroke="none" />
    <g class="putar"><ellipse cx="30" cy="30" rx="22" ry="7.5" /><circle cx="52" cy="30" r="2.3" fill="currentColor" stroke="none" /></g>
    <g transform="rotate(60 30 30)"><g class="putar lambat"><ellipse cx="30" cy="30" rx="22" ry="7.5" /><circle cx="8" cy="30" r="2.3" fill="currentColor" stroke="none" /></g></g>
    <g transform="rotate(120 30 30)"><g class="putar balik"><ellipse cx="30" cy="30" rx="22" ry="7.5" /><circle cx="52" cy="30" r="2.3" fill="currentColor" stroke="none" /></g></g>
    <g class="goyang"><path d="M46 58c8-1 12-7 12-14-7 0-12 5-12 14z" fill="currentColor" fill-opacity=".22" /><path d="M46 58l7-8" /></g>`),

  ips: svg('ips', `
    <circle cx="28" cy="33" r="17" fill="currentColor" fill-opacity=".1" />
    <path d="M11 33h34M14 24.5h28M14 41.5h28" stroke-width="1.5" />
    <ellipse class="geleng" cx="28" cy="33" rx="8" ry="17" stroke-width="1.6" />
    <ellipse class="geleng d2" cx="28" cy="33" rx="14" ry="17" stroke-width="1.2" opacity=".7" />
    <path d="M14 48c6 6 22 6 28 0M28 50v8M20 60h16" />
    <g class="mantul"><path d="M50 4c-4.4 0-8 3.4-8 7.8C42 17.5 50 26 50 26s8-8.5 8-14.2C58 7.4 54.4 4 50 4z" fill="currentColor" fill-opacity=".22" /><circle cx="50" cy="11.6" r="2.6" /></g>`),

  'bahasa-indonesia': svg('bahasa-indonesia', `
    <path d="M6 22c9-4 18-4 26 2v30c-8-5-17-5-26-1z" fill="currentColor" fill-opacity=".08" />
    <path d="M58 22c-9-4-18-4-26 2v30c8-5 17-5 26-1z" />
    <path d="M11 30h14M11 36h14M11 42h11" stroke-width="1.4" opacity=".65" />
    <path class="halaman" d="M32 24c8-6 17-6 26-2v31c-9-4-18-4-26 1z" fill="currentColor" fill-opacity=".16" />
    ${huruf(18, 14, 'A', { uk: 12, kelas: 'melayang', tebal: true })}
    ${huruf(32, 11, 'b', { uk: 10, kelas: 'melayang d2' })}
    ${huruf(46, 15, 'C', { uk: 11, kelas: 'melayang d3', tebal: true })}`),

  'bahasa-inggris': svg('bahasa-inggris', `
    <g class="letup"><path d="M6 12a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H20l-7 6v-6h-1a6 6 0 0 1-6-6z" fill="currentColor" fill-opacity=".14" />${huruf(24, 21, 'Hello!', { uk: 9, tebal: true })}</g>
    <g class="letup d2"><path d="M58 36a6 6 0 0 0-6-6H30a6 6 0 0 0-6 6v10a6 6 0 0 0 6 6h16l7 6v-6h-1a6 6 0 0 0 6-6z" />${huruf(41, 45, 'ABC', { uk: 9.5, tebal: true })}</g>`),

  'bahasa-arab': svg('bahasa-arab', `
    ${huruf(48, 36, 'أ', { uk: 22, kelas: 'muncul', font: 'Amiri, serif' })}
    ${huruf(32, 38, 'ب', { uk: 22, kelas: 'muncul d2', font: 'Amiri, serif' })}
    ${huruf(16, 38, 'ت', { uk: 22, kelas: 'muncul d3', font: 'Amiri, serif' })}
    <path class="gores" d="M6 48c10 6 20-4 26 2s16 4 26-2" stroke-dasharray="70" />
    <path d="M30 56l2-2 2 2-2 2z" fill="currentColor" stroke="none" />`),

  ppkn: svg('ppkn', `
    <path d="M12 60V6" stroke-width="2.4" />
    <circle cx="12" cy="5" r="2" fill="currentColor" stroke="none" />
    <g class="kibar"><path d="M13 8c8-4 16 4 26 0v12c-10 4-18-4-26 0z" fill="currentColor" fill-opacity=".85" /><path d="M13 20c8-4 16 4 26 0v12c-10 4-18-4-26 0z" /></g>
    <path d="M42 36h18v10c0 7-9 13-9 13s-9-6-9-13z" fill="currentColor" fill-opacity=".1" />
    <path class="kelip" d="M51 40.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="currentColor" stroke="none" />`),

  pjok: svg('pjok', `
    <ellipse class="bayang" cx="32" cy="57" rx="11" ry="2.4" fill="currentColor" fill-opacity=".28" stroke="none" />
    <g class="mantul-bola"><circle cx="32" cy="20" r="11" fill="currentColor" fill-opacity=".1" /><path d="M32 14.5l4.8 3.5-1.8 5.6h-6l-1.8-5.6z" fill="currentColor" stroke="none" /><path d="M32 9v5.5M42.6 17.3l-5.8.7M21.4 17.3l5.8.7M26 29.2l3-5.6M38 29.2l-3-5.6" stroke-width="1.6" /></g>
    <path class="kelip" d="M8 22h7M6 28h9" opacity=".7" />
    <path d="M4 60h56" opacity=".45" />`),

  'seni-budaya-prakarya': svg('seni-budaya-prakarya', `
    <path d="M30 12C17 12 7 20 7 30c0 8 6 12 12 10 3-1 5 1 5 4 0 4 4 7 9 7 12 0 21-9 21-20S43 12 30 12z" fill="currentColor" fill-opacity=".12" />
    <circle cx="19" cy="25" r="3.2" fill="currentColor" stroke="none" />
    <circle cx="29" cy="19.5" r="3.2" fill="currentColor" fill-opacity=".55" stroke="none" />
    <circle cx="40" cy="22" r="3.2" fill="currentColor" stroke="none" />
    <circle cx="38" cy="37" r="3.6" />
    <g class="goyang kuas"><path d="M45 56l13-17" stroke-width="2.4" /><path d="M43 58c-3 1-6 3-6 6 3 0 6-2 7-5z" fill="currentColor" stroke="none" /></g>
    <g class="melayang"><path d="M11 55v-8l8-2v8" /><circle cx="9" cy="55" r="2.2" fill="currentColor" stroke="none" /><circle cx="17" cy="53" r="2.2" fill="currentColor" stroke="none" /></g>`),

  tik: svg('tik', `
    <rect x="12" y="13" width="40" height="27" rx="2.5" fill="currentColor" fill-opacity=".08" />
    <path d="M5 44h54l-4 7H9z" fill="currentColor" fill-opacity=".16" />
    <path d="M25 22l-5 4.5 5 4.5M39 22l5 4.5-5 4.5M34.5 20l-5 13" stroke-width="1.9" />
    <path class="kedip" d="M21 36h5" stroke-width="2.2" />
    <g class="sinyal"><path d="M50 9a5 5 0 0 1 5 5" /><path class="d2" d="M50 4a10 10 0 0 1 10 10" /></g>`),

  'pendidikan-agama-islam': svg('pendidikan-agama-islam', `
    <path class="kelip" d="M35 9.5a4.5 4.5 0 1 1-4.6-5.3 3.6 3.6 0 0 0 4.6 5.3z" fill="currentColor" stroke="none" />
    <path d="M32 21v-7" />
    <path d="M17 40c0-10 7-16 15-20 8 4 15 10 15 20z" fill="currentColor" fill-opacity=".16" />
    <path d="M13 40h38v18H13z" />
    <path d="M27 58v-8a5 5 0 0 1 10 0v8" />
    <path d="M5 58V32h5v26M4 32l3.5-6 3.5 6M54 58V32h5v26M53 32l3.5-6 3.5 6" />
    <circle class="kelip d2" cx="17" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle class="kelip d3" cx="48" cy="9" r="1.1" fill="currentColor" stroke="none" />
    <circle class="kelip" cx="56" cy="18" r="1" fill="currentColor" stroke="none" />`),

  tematik: svg('tematik', `
    <rect x="9" y="9" width="21" height="21" rx="3" fill="currentColor" fill-opacity=".14" />
    <rect x="34" y="9" width="21" height="21" rx="3" />
    <rect x="9" y="34" width="21" height="21" rx="3" />
    <g class="geser"><rect x="34" y="34" width="21" height="21" rx="3" fill="currentColor" fill-opacity=".3" /><circle cx="34" cy="44.5" r="3.2" fill="currentColor" stroke="none" /></g>
    <circle cx="30" cy="19.5" r="3.2" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="30" r="3.2" fill="currentColor" stroke="none" />`),
};

const KUNCI: Record<string, string> = {
  Matematika: 'matematika', IPA: 'ipa', IPAS: 'ipa', IPS: 'ips', 'Bahasa Indonesia': 'bahasa-indonesia', 'Bahasa Inggris': 'bahasa-inggris',
  'Bahasa Arab': 'bahasa-arab', PPKn: 'ppkn', 'Pendidikan Pancasila': 'ppkn', PJOK: 'pjok', 'Seni Budaya & Prakarya': 'seni-budaya-prakarya',
  'Seni Budaya': 'seni-budaya-prakarya', TIK: 'tik', Informatika: 'tik', 'Pendidikan Agama Islam': 'pendidikan-agama-islam', Tematik: 'tematik',
  Fikih: 'pendidikan-agama-islam', 'Akidah Akhlak': 'pendidikan-agama-islam', 'Al-Qur’an Hadis': 'pendidikan-agama-islam', 'Sejarah Kebudayaan Islam': 'pendidikan-agama-islam',
};

/** SVG ilustrasi untuk sebuah mata pelajaran, atau string kosong bila tidak dikenal. */
export function ilustrasiMapel(mapel: string | undefined): string {
  if (!mapel) return '';
  return ILUSTRASI[KUNCI[mapel] ?? ''] ?? '';
}
