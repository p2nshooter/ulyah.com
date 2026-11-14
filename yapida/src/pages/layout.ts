/** Kerangka halaman publik: <head> (SEO, AdSense tumpuk, font), kepala situs, kaki, dan alat interaktif (tasbih, tema). */
import { html, raw, esc, type Raw } from '../lib/html.ts';
import { ADSENSE_LOADER, ADSENSE_METAS } from '../lib/adsense.ts';
import { KELOMPOK, URUTAN_KELOMPOK, type Situs } from '../data/model.ts';
import type { UnitItem } from '../data/site.ts';

/** Versi aset — naikkan setiap CSS/JS berubah agar cache peramban dan CDN ikut berganti. */
export const ASSET_V = '1';

/** Tombol Portal di kepala situs — dinyalakan bersama rute /portal (fase portal). */
export const PORTAL_AKTIF = false;

const ICON: Record<string, string> = {
  kubah: '<path d="M12 2v2.2M12 4.2c-3.6 2-5.6 4.6-5.6 7.5V13h11.2v-1.3c0-2.9-2-5.5-5.6-7.5ZM4 13h16v8H4zM9.5 21v-3.5a2.5 2.5 0 0 1 5 0V21"/>',
  buku: '<path d="M12 6.5C10 5 7.3 4.5 4 4.8v13.4c3.3-.3 6 .2 8 1.7 2-1.5 4.7-2 8-1.7V4.8c-3.3-.3-6 .2-8 1.7ZM12 6.5v13.4"/>',
  pena: '<path d="M4 20l1.2-4.6L16.4 4.2a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8 4 20ZM14.5 6.1l3.4 3.4M4 20h16"/>',
  niaga: '<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12v8h13v-8M10 20v-4.5h4V20"/>',
  tangan: '<path d="M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.600-7.500 10-7.500 10Z"/>',
  bintang: '<path d="M12 2.5l2.3 4.2 4.7-1.200-1.200 4.700 4.200 2.300-4.200 2.300 1.200 4.700-4.700-1.200L12 22.500l-2.300-4.200-4.700 1.200 1.200-4.700L2 12.500l4.200-2.300L5 5.500l4.700 1.200Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  tutup: '<path d="M6 6l12 12M18 6 6 18"/>',
  bulan: '<path d="M20 14.500A8.500 8.500 0 0 1 9.500 4 8.500 8.500 0 1 0 20 14.500Z"/>',
  surya: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
  panah: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21.500s-6.500-6-6.500-11a6.500 6.500 0 0 1 13 0c0 5-6.500 11-6.500 11Z"/><circle cx="12" cy="10.500" r="2.300"/>',
  tasbih: '<circle cx="12" cy="4.500" r="1.700"/><circle cx="17.300" cy="6.700" r="1.700"/><circle cx="19.500" cy="12" r="1.700"/><circle cx="17.300" cy="17.300" r="1.700"/><circle cx="6.700" cy="17.300" r="1.700"/><circle cx="4.500" cy="12" r="1.700"/><circle cx="6.700" cy="6.700" r="1.700"/><path d="M12 15.500v6M10 19.500h4"/>',
  masuk: '<path d="M14 4h5v16h-5M10 8l4 4-4 4M14 12H4"/>',
  wa: '<path d="M4 20l1.300-4.200A8 8 0 1 1 8.500 19L4 20Z"/><path d="M9 8.500c0 3.500 2.500 6 6 6.500l1-1.500-2-1-.800.800c-1-.500-1.800-1.300-2.300-2.300l.800-.800-1-2L9 8.500Z"/>',
  surat: '<path d="M3.500 6h17v12h-17zM3.500 6.500l8.500 6.500 8.500-6.500"/>',
  telepon: '<path d="M6 3.500h3.500l1.500 4-2 1.500a11 11 0 0 0 6 6l1.500-2 4 1.500V18a2.500 2.500 0 0 1-2.500 2.500C10.500 20.500 3.500 13.500 3.500 6A2.500 2.500 0 0 1 6 3.500Z"/>',
};

export function icon(name: string, cls = ''): Raw {
  return raw(`<svg class="ik${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] ?? ICON.bintang}</svg>`);
}

/** Pemisah bagian: garis emas dengan bintang delapan di tengah. */
export const hiasan = raw('<div class="hias" aria-hidden="true"><span></span><svg viewBox="0 0 40 40" width="26" height="26"><path d="M20 2l5.300 7.200 8.800-1.300-1.300 8.800L40 22l-7.200 5.300 1.300 8.800-8.800-1.300L20 42l-5.300-7.200-8.800 1.300 1.300-8.800L0 22l7.200-5.300-1.300-8.800 8.800 1.300Z" transform="translate(0 -2)" fill="currentColor"/></svg><span></span></div>');

export interface PageOpts {
  origin: string;
  path: string;
  title: string;
  desc: string;
  situs: Situs;
  units: UnitItem[];
  body: Raw;
  /** Menu yang sedang aktif. */
  aktif?: string;
  /** Tanpa loader AdSense (portal, halaman anak). Tag meta akun tetap ada. */
  noAds?: boolean;
  noindex?: boolean;
  jsonLd?: unknown[];
  ogImage?: string;
  ogType?: string;
  /** Kelas tambahan di <body>. */
  kelas?: string;
}

export const alamatLengkap = (s: Situs) => `${s.alamat.jalan}, Desa ${s.alamat.desa}, Kecamatan ${s.alamat.kecamatan}, ${s.alamat.kabupaten}, ${s.alamat.provinsi} ${s.alamat.kodepos}`;

export function orgJsonLd(origin: string, s: Situs): unknown {
  const same = Object.values(s.sosmed).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'NGO'],
    '@id': `${origin}/#yayasan`,
    name: s.nama,
    alternateName: s.singkatan,
    url: `${origin}/`,
    logo: `${origin}/assets/icon-512.png`,
    description: s.deskripsi,
    foundingDate: s.legal.akta.tanggal,
    address: { '@type': 'PostalAddress', streetAddress: s.alamat.jalan, addressLocality: `${s.alamat.desa}, ${s.alamat.kecamatan}`, addressRegion: `${s.alamat.kabupaten}, ${s.alamat.provinsi}`, postalCode: s.alamat.kodepos, addressCountry: 'ID' },
    ...(s.kontak.email ? { email: s.kontak.email } : {}),
    ...(s.kontak.telepon ? { telephone: s.kontak.telepon } : {}),
    ...(same.length ? { sameAs: same } : {}),
  };
}

export function crumbs(origin: string, items: [string, string][]): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [['Beranda', '/'] as [string, string], ...items].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${origin}${path}` })),
  };
}

const ld = (v: unknown) => raw(`<script type="application/ld+json">${JSON.stringify(v).replace(/</g, '\\u003c')}</script>`);

/** Menu utama. Modul baru menambah baris di sini begitu rutenya ada — tidak pernah menautkan halaman yang belum dibuat. */
export const MENU: { id: string; label: string; href: string }[] = [
  { id: 'beranda', label: 'Beranda', href: '/' },
  { id: 'profil', label: 'Profil', href: '/profil' },
  { id: 'lembaga', label: 'Lembaga', href: '/lembaga' },
  { id: 'kontak', label: 'Kontak', href: '/kontak' },
];

function megaLembaga(units: UnitItem[]): Raw {
  return html`<div class="mega" data-mega hidden>
    <div class="mega-isi">${URUTAN_KELOMPOK.map((k) => html`<div class="mega-kol"><p class="mega-judul">${icon(KELOMPOK[k].ikon)}${KELOMPOK[k].nama}</p>
      ${units.filter((u) => u.kelompok === k).map((u) => html`<a href="/lembaga/${u.slug}">${u.singkat}</a>`)}</div>`)}</div>
  </div>`;
}

export function page(o: PageOpts): string {
  const s = o.situs;
  const url = `${o.origin}${o.path}`;
  const og = o.ogImage ?? `${o.origin}/assets/og.png`;
  const v = ASSET_V;
  const kaki = [['Kebijakan Privasi', '/h/kebijakan-privasi'], ['Syarat Penggunaan', '/h/syarat-penggunaan']];
  return `<!doctype html>
<html lang="id" data-tema="siang">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${esc(url)}">
${o.noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#053727">
<meta property="og:type" content="${esc(o.ogType ?? 'website')}">
<meta property="og:site_name" content="${esc(s.nama)}">
<meta property="og:locale" content="id_ID">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta name="twitter:card" content="summary_large_image">
${ADSENSE_METAS}
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/png" href="/assets/favicon-64.png" sizes="64x64">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preload" href="/assets/fonts/jakarta.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/app.css?v=${v}">
<script src="/assets/tema.js?v=${v}"></script>
${o.noAds ? '' : ADSENSE_LOADER}
${[orgJsonLd(o.origin, s), ...(o.jsonLd ?? [])].map((x) => ld(x).s).join('\n')}
</head>
<body class="${esc(o.kelas ?? '')}">
<a class="lompat" href="#isi">Langsung ke isi</a>
<div class="pita">
  <div class="wadah pita-isi">
    <span class="pita-kiri"><span class="arab-in" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span></span>
    <span class="pita-kanan"><span data-hijri></span><span class="titik" aria-hidden="true">·</span><span data-jam></span></span>
  </div>
</div>
<header class="kepala" data-kepala>
  <div class="wadah kepala-isi">
    <a class="merek" href="/" aria-label="${esc(s.nama)} — beranda">
      <img src="/assets/logo-192.webp" width="44" height="56" alt="">
      <span class="merek-teks"><b>${esc(s.singkatan)}</b><small>Yayasan Al-Huda</small></span>
    </a>
    <nav class="menu" aria-label="Menu utama" data-menu>
      ${MENU.map((m) => (m.id === 'lembaga'
        ? `<div class="menu-induk"><a href="${m.href}"${o.aktif === m.id ? ' aria-current="page"' : ''} data-mega-buka aria-haspopup="true">${m.label}<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.600"/></svg></a>${megaLembaga(o.units).s}</div>`
        : `<a href="${m.href}"${o.aktif === m.id ? ' aria-current="page"' : ''}>${m.label}</a>`)).join('\n      ')}
    </nav>
    <div class="alat">
      <button class="tbl-ikon" type="button" data-tema-ganti aria-label="Ganti tema siang atau malam">${icon('bulan', 'ik-malam').s}${icon('surya', 'ik-siang').s}</button>
      ${PORTAL_AKTIF ? `<a class="tbl tbl-emas tbl-kecil" href="/portal">${icon('masuk').s}<span>Portal</span></a>` : ''}
      <button class="tbl-ikon menu-tombol" type="button" data-menu-buka aria-label="Buka menu" aria-expanded="false">${icon('menu').s}</button>
    </div>
  </div>
</header>
<main id="isi">
${o.body.s}
</main>
<footer class="kaki">
  <div class="kaki-pola" aria-hidden="true"></div>
  <div class="wadah kaki-isi">
    <div class="kaki-merek">
      <img src="/assets/logo-192.webp" width="66" height="84" alt="" loading="lazy">
      <p class="kaki-nama">${esc(s.nama)}</p>
      <p class="kaki-alamat">${icon('pin').s}<span>${esc(alamatLengkap(s))}</span></p>
    </div>
    ${URUTAN_KELOMPOK.map((k) => `<nav class="kaki-kol" aria-label="${esc(KELOMPOK[k].nama)}"><p>${esc(KELOMPOK[k].nama)}</p>${o.units.filter((u) => u.kelompok === k).map((u) => `<a href="/lembaga/${esc(u.slug)}">${esc(u.singkat)}</a>`).join('')}</nav>`).join('\n    ')}
  </div>
  <div class="wadah kaki-bawah">
    <p>© <span data-tahun>2026</span> ${esc(s.nama)} · Akta No. ${esc(s.legal.akta.nomor)}, SK Menkumham ${esc(s.legal.sk.nomor)}</p>
    <p class="kaki-taut">${MENU.slice(1).map((m) => `<a href="${m.href}">${m.label}</a>`).join('')}${s.donasi.tampil ? '<a href="/donasi">Donasi</a>' : ''}${kaki.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}</p>
  </div>
</footer>
<button class="tasbih-tombol" type="button" data-tasbih-buka aria-label="Buka tasbih digital">${icon('tasbih').s}<span>Tasbih</span></button>
<div class="tasbih" data-tasbih hidden role="dialog" aria-modal="true" aria-label="Tasbih digital">
  <div class="tasbih-kartu">
    <button class="tbl-ikon tasbih-tutup" type="button" data-tasbih-tutup aria-label="Tutup tasbih">${icon('tutup').s}</button>
    <p class="tasbih-arab arab" lang="ar" dir="rtl" data-tasbih-arab></p>
    <p class="tasbih-latin" data-tasbih-latin></p>
    <button class="tasbih-manik" type="button" data-tasbih-ketuk aria-label="Ketuk untuk menghitung">
      <svg viewBox="0 0 200 200" aria-hidden="true"><circle class="tasbih-jalur" cx="100" cy="100" r="88"/><circle class="tasbih-maju" cx="100" cy="100" r="88" data-tasbih-maju/></svg>
      <span class="tasbih-angka" data-tasbih-angka>0</span><span class="tasbih-target" data-tasbih-target>dari 33</span>
    </button>
    <div class="tasbih-pilih" data-tasbih-pilih></div>
    <div class="tasbih-aksi"><button class="tbl tbl-garis tbl-kecil" type="button" data-tasbih-ulang>Ulangi</button><span data-tasbih-putaran>Putaran 0</span></div>
  </div>
</div>
<script src="/assets/app.js?v=${v}" defer></script>
</body>
</html>`;
}
