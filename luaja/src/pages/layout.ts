/**
 * Kerangka halaman LUAJA: <head> (SEO, JSON-LD, AdSense tumpuk, font), kepala situs dengan logo 5-ketuk (pintu admin),
 * menu, kaki, toast, dan skrip. Tema negara & suasana diteruskan lewat atribut <html data-theme data-mood>.
 */
import { html, raw, esc, type Raw } from '../lib/html.ts';
import { ADSENSE_LOADER, ADSENSE_METAS } from '../lib/adsense.ts';
import { COURSE_META, COURSES, type SiteContent } from '../data/model.ts';
import type { Lang } from '../lib/i18n.ts';
import { tr } from '../lib/i18n.ts';
import type { Country, Mood } from './scene.ts';

/** Versi aset — naikkan setiap CSS/JS berubah agar cache peramban dan CDN ikut berganti. */
export const ASSET_V = '1';

const ICON: Record<string, string> = {
  tangga: '<path d="M4 20h4v-4h4v-4h4V8h4V4"/>',
  suara: '<path d="M11 5 6 9H2v6h4l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  buku: '<path d="M12 6.5C10 5 7.3 4.5 4 4.8v13.4c3.3-.3 6 .2 8 1.7 2-1.5 4.7-2 8-1.7V4.8c-3.3-.3-6 .2-8 1.7ZM12 6.5v13.4"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
  kartu: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M8 15h4"/>',
  ujian: '<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  tutup: '<path d="M6 6l12 12M18 6 6 18"/>',
  panah: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  cek: '<path d="m5 12 4 4L19 6"/>',
  gembok: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  bintang: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  masuk: '<path d="M14 4h5v16h-5M10 8l4 4-4 4M14 12H4"/>',
  main: '<path d="M8 5v14l11-7z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  surat: '<path d="M3.5 6h17v12h-17zM3.5 6.5l8.5 6.5 8.5-6.5"/>',
  wa: '<path d="M4 20l1.3-4.2A8 8 0 1 1 8.5 19L4 20Z"/><path d="M9 8.5c0 3.5 2.5 6 6 6.5l1-1.5-2-1-.8.8c-1-.5-1.8-1.3-2.3-2.3l.8-.8-1-2L9 8.5Z"/>',
  unggah: '<path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  dunia: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  sekolah: '<path d="m3 9 9-5 9 5-9 5z"/><path d="M7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5M21 9v6"/>',
  piala: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
  jam: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bulan: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>',
  surya: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  pasang: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
};
export function icon(name: string, cls = ''): Raw {
  return raw(`<svg class="ik${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] ?? ICON.bintang}</svg>`);
}

/** Logo LUAJA: tangga perjalanan yang menanjak menuju bintang emas; garisnya menggambar diri saat halaman dibuka. */
export function logoMark(size = 40, animate = true): Raw {
  return raw(`<svg class="logo-mark${animate ? ' anim' : ''}" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">
<defs><linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1746b8"/><stop offset="1" stop-color="#0b1f4d"/></linearGradient><linearGradient id="lg-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd766"/><stop offset="1" stop-color="#f5b301"/></linearGradient></defs>
<rect width="64" height="64" rx="18" fill="url(#lg-bg)"/>
<path class="lg-path" d="M14 48h10v-9h9v-9h9v-9h8" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
<path class="lg-star" d="M50 10l2.2 4.6 4.8.6-3.5 3.4.9 4.8L50 21.1l-4.4 2.3.9-4.8L43 15.2l4.8-.6z" fill="url(#lg-gold)"/>
<circle cx="14" cy="48" r="3.2" fill="url(#lg-gold)"/>
</svg>`);
}

export interface PageOpts {
  origin: string;
  path: string;
  title: string;
  desc: string;
  site: SiteContent;
  body: Raw;
  lang?: Lang;
  theme?: Country;
  mood?: Mood;
  /** Menu aktif. */
  active?: string;
  /** Tanpa loader AdSense (portal, masuk, pembayaran, kuis, pelajaran berbayar). Tag meta akun tetap ada. */
  noAds?: boolean;
  noindex?: boolean;
  jsonLd?: unknown[];
  ogImage?: string;
  ogType?: string;
  bodyClass?: string;
  /** Tanpa kepala/kaki (halaman pelajaran mode fokus memakai kerangka sendiri). */
  bare?: boolean;
  /** Pengguna masuk? (mengubah tombol di kepala) */
  user?: { name: string; admin: boolean } | null;
  headExtra?: string;
}

export function orgJsonLd(origin: string, s: SiteContent): unknown {
  const same = Object.values(s.social).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${origin}/#org`,
    name: s.name,
    alternateName: s.tagline,
    url: `${origin}/`,
    logo: `${origin}/assets/icon-512.png`,
    description: s.description,
    email: s.contact.email,
    areaServed: 'ID',
    ...(same.length ? { sameAs: same } : {}),
  };
}
export const webSiteJsonLd = (origin: string, s: SiteContent) => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: s.name, inLanguage: 'id', publisher: { '@id': `${origin}/#org` } });
export function crumbs(origin: string, items: [string, string][]): unknown {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Beranda', '/'] as [string, string], ...items].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${origin}${path}` })) };
}
export const faqJsonLd = (faq: { q: string; a: string }[]) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
export function courseJsonLd(origin: string, s: SiteContent, code: 'de' | 'en' | 'ja', priceOne: number): unknown {
  const m = COURSE_META[code];
  return { '@context': 'https://schema.org', '@type': 'Course', name: `${m.name} (${m.native}) — ${m.levels[0]!.name} sampai ${m.levels[m.levels.length - 1]!.name}`, description: `Kursus ${m.name} interaktif berurutan untuk penutur Indonesia: ${m.levels.map((l) => l.name).join(', ')}.`, provider: { '@type': 'EducationalOrganization', name: s.name, url: `${origin}/` }, inLanguage: code, url: `${origin}/${m.slug}`, offers: { '@type': 'Offer', price: priceOne, priceCurrency: 'IDR', category: 'Langganan tahunan', availability: 'https://schema.org/InStock', url: `${origin}/harga` }, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT5H' } };
}
const ld = (v: unknown) => `<script type="application/ld+json">${JSON.stringify(v).replace(/</g, '\\u003c')}</script>`;

export function breadcrumbs(items: [string, string][]): Raw {
  return html`<nav class="breadcrumbs" aria-label="Jejak"><ol><li><a href="/">Beranda</a></li>${items.map(([n, p], i) => (i === items.length - 1 ? html`<li aria-current="page">${n}</li>` : html`<li><a href="${p}">${n}</a></li>`))}</ol></nav>`;
}

export const MENU = (L: Lang): { id: string; label: string; href: string }[] => [
  { id: 'jerman', label: tr(L, 'Jerman', 'German'), href: '/jerman' },
  { id: 'inggris', label: tr(L, 'Inggris', 'English'), href: '/inggris' },
  { id: 'jepang', label: tr(L, 'Jepang', 'Japanese'), href: '/jepang' },
  { id: 'latihan', label: tr(L, 'Latihan soal', 'Practice tests'), href: '/latihan' },
  { id: 'harga', label: tr(L, 'Harga', 'Pricing'), href: '/harga' },
];

export function page(o: PageOpts): string {
  const s = o.site, L = o.lang ?? 'id';
  const url = `${o.origin}${o.path}`;
  const og = o.ogImage ?? `${o.origin}/assets/og.png`;
  const v = ASSET_V;
  const menu = MENU(L);
  const ads = !o.noAds && s.adsEnabled;
  const head = `<!doctype html>
<html lang="${L}" data-theme="${esc(o.theme ?? 'id')}"${o.mood ? ` data-mood="${esc(o.mood)}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${esc(url)}">
${o.noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#0b1f4d">
<meta property="og:type" content="${esc(o.ogType ?? 'website')}">
<meta property="og:site_name" content="${esc(s.name)}">
<meta property="og:locale" content="${L === 'en' ? 'en_GB' : 'id_ID'}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta name="twitter:card" content="summary_large_image">
${ADSENSE_METAS}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preload" href="/assets/fonts/jakarta.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/app.css?v=${v}">
<script>try{var d=localStorage.getItem('lj_dark');if(d)document.documentElement.setAttribute('data-dark',d);var f=localStorage.getItem('lj_fs');if(f)document.documentElement.style.setProperty('--base-size',f+'%')}catch(e){}</script>
${ads ? ADSENSE_LOADER : ''}
${[orgJsonLd(o.origin, s), webSiteJsonLd(o.origin, s), ...(o.jsonLd ?? [])].map(ld).join('\n')}
${o.headExtra ?? ''}
</head>
<body class="${esc(o.bodyClass ?? '')}">
<a class="skip" href="#isi">${tr(L, 'Langsung ke isi', 'Skip to content')}</a>`;
  if (o.bare) return `${head}<main id="isi">${o.body.s}</main><div class="toast" id="toast" role="status" aria-live="polite"></div><script src="/assets/app.js?v=${v}" defer></script></body></html>`;
  const header = `<header class="site-head" id="atas">
<div class="wrap">
<a class="logo" href="/" data-logo aria-label="${esc(s.name)} — beranda">${logoMark(40).s}<span class="word">${esc(s.name)}<small>${tr(L, 'Belajar bahasa tanpa batas', 'Learn without limits')}</small></span></a>
<button class="btn btn-ghost btn-icon nav-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu" data-nav-toggle>${icon('menu').s}</button>
<nav class="nav" id="nav" aria-label="Utama">
${menu.map((m) => `<a href="${m.href}"${o.active === m.id ? ' aria-current="page"' : ''}>${esc(m.label)}</a>`).join('')}
<span class="lang-switch" aria-label="Bahasa antarmuka"><a href="?lang=id"${L === 'id' ? ' aria-current="true"' : ''}>ID</a><a href="?lang=en"${L === 'en' ? ' aria-current="true"' : ''}>EN</a></span>
${o.user ? `<a class="btn btn-ghost btn-sm" href="${o.user.admin ? '/admin' : '/portal'}">${icon('masuk').s}${esc(o.user.name.split(' ')[0] ?? '')}</a>` : `<a class="btn btn-ghost btn-sm" href="/masuk">${tr(L, 'Masuk', 'Sign in')}</a><a class="btn btn-gold btn-sm" href="/daftar">${tr(L, 'Mulai', 'Start')}</a>`}
</nav>
</div>
</header>`;
  const year = new Date().getFullYear();
  const footer = `<footer class="site-foot">
<div class="wrap">
<div class="foot-grid">
<div><a class="logo" href="/">${logoMark(36, false).s}<span class="word">${esc(s.name)}<small>${esc(s.tagline)}</small></span></a><p style="margin-top:14px;color:#c9d2ec;font-size:var(--fs-1)">${esc(s.description)}</p><p><a class="btn btn-white btn-sm" href="/daftar">${tr(L, 'Mulai belajar', 'Start learning')}</a></p></div>
<div><h4>${tr(L, 'Belajar', 'Learn')}</h4><ul>${COURSES.map((c) => `<li><a href="/${COURSE_META[c].slug}">${esc(COURSE_META[c].name)}</a></li>`).join('')}<li><a href="/coba">${tr(L, 'Pelajaran gratis', 'Free lessons')}</a></li></ul></div>
<div><h4>${tr(L, 'Latihan soal', 'Practice tests')}</h4><ul><li><a href="/latihan?bahasa=de">Goethe A1–B1</a></li><li><a href="/latihan?bahasa=en#toefl">TOEFL ITP</a></li><li><a href="/latihan?bahasa=en#ielts">IELTS Academic</a></li><li><a href="/latihan?bahasa=ja">JLPT N5–N4</a></li><li><a href="/harga">${tr(L, 'Harga & promo', 'Pricing & offers')}</a></li></ul></div>
<div><h4>LUAJA</h4><ul><li><a href="/tentang">${tr(L, 'Tentang', 'About')}</a></li><li><a href="/kontak">${tr(L, 'Kontak', 'Contact')}</a></li><li><a href="/privasi">${tr(L, 'Privasi', 'Privacy')}</a></li><li><a href="/syarat">${tr(L, 'Syarat & ketentuan', 'Terms')}</a></li><li><a href="/kredit">${tr(L, 'Sumber & lisensi', 'Sources & licences')}</a></li><li><a href="/portal">${tr(L, 'Portal member', 'Member portal')}</a></li></ul></div>
</div>
<div class="foot-bottom"><span>© ${year} ${esc(s.name)} · luaja.com</span><span class="a11y-bar"><button type="button" data-fs="-" aria-label="Perkecil huruf">A−</button><button type="button" data-fs="+" aria-label="Perbesar huruf">A+</button><button type="button" data-dark aria-label="Mode gelap">◐</button></span><span>${esc(s.slogan)}</span></div>
</div>
</footer>`;
  return `${head}
${header}
<main id="isi">${o.body.s}</main>
${footer}
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script src="/assets/app.js?v=${v}" defer></script>
</body>
</html>`;
}
