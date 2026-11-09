/**
 * Kerangka halaman jenius.es: kepala SEO (canonical, hreflang ID/EN, OG, JSON-LD), tag meta AdSense di semua halaman,
 * loader AdSense HANYA di halaman dewasa (§1 no. 5), navigasi, kaki dengan halaman wajib, pemberitahuan cookie, spanduk
 * pasang aplikasi (PWA).
 */
import { html, raw, esc, type Raw } from '../lib/html.ts';
import { tr, P, type Lang, type PageKey } from '../lib/i18n.ts';
import { ADSENSE_METAS, ADSENSE_LOADER } from '../lib/adsense.ts';

/** Akun (fase J-B): selama belum dibuka, header tidak menautkan ke halaman masuk yang belum ada. */
export let ACCOUNTS_OPEN = false;
export const setAccountsOpen = (v: boolean) => { ACCOUNTS_OPEN = v; };

export const ASSET_V = '20261109c';
export const SITE = { name: 'jenius.es', tagline: ['E-Book bersuara', 'E-Book with Voice'] as const, origin: 'https://jenius.es' };

export interface PageOpts {
  L: Lang;
  title: string;
  desc: string;
  /** Jalur kanonik halaman ini (tanpa domain). */
  path: string;
  /** Jalur versi bahasa lain (hreflang). */
  alt?: string;
  body: Raw;
  /** Halaman dewasa = loader AdSense dipasang. Halaman anak/pembaca: false. */
  ads: boolean;
  origin: string;
  noindex?: boolean;
  jsonLd?: unknown[];
  ogImage?: string;
  /** Kelas tambahan <body> (mis. `reader`). */
  bodyClass?: string;
  active?: PageKey | 'reader';
  user?: { name: string } | null;
}

// Satu Raw (bukan array): page() memakai template string biasa, dan array di sana tergabung dengan koma.
const nav = (L: Lang, active?: string): Raw => html`${[
  ['lanes', '📚', tr(L, 'Jalur Baca', 'Reading Lanes')],
  ['articles', '📝', tr(L, 'Artikel', 'Articles')],
  ['tools', '🧰', tr(L, 'Alat Gratis', 'Free Tools')],
  ['teachers', '🍎', tr(L, 'Untuk Guru', 'For Teachers')],
].map(([k, ic, t], i) => html`<a href="${P(L, k as PageKey)}" style="--i:${i}" ${active === k ? raw('aria-current="page"') : ''}><span class="nav-ic" aria-hidden="true">${ic}</span><span>${t}</span></a>`)}${[
  // Ubin tambahan hanya di menu HP (layar penuh).
  [L === 'en' ? '/en/lanes/textbooks' : '/jalur/buku-pelajaran', '📘', tr(L, 'Buku Pelajaran', 'Textbooks')],
  [P(L, 'search'), '🔍', tr(L, 'Cari buku', 'Search')],
  [P(L, 'guide'), '🧭', tr(L, 'Panduan', 'Guide')],
  [P(L, 'about'), '✨', tr(L, 'Tentang', 'About')],
].map(([href, ic, t], i) => html`<a class="nav-extra" href="${href}" style="--i:${i + 4}"><span class="nav-ic" aria-hidden="true">${ic}</span><span>${t}</span></a>`)}`;

export function page(o: PageOpts): string {
  const { L } = o;
  const canonical = `${o.origin}${o.path}`;
  const altUrl = o.alt ? `${o.origin}${o.alt}` : null;
  const idUrl = L === 'id' ? canonical : altUrl;
  const enUrl = L === 'en' ? canonical : altUrl;
  const og = o.ogImage ?? `${o.origin}/assets/logo-main-1200.webp`;
  const ld = (o.jsonLd ?? []).map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="${L}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${esc(canonical)}">
${idUrl ? `<link rel="alternate" hreflang="id" href="${esc(idUrl)}">` : ''}
${enUrl ? `<link rel="alternate" hreflang="en" href="${esc(enUrl)}">` : ''}
${idUrl ? `<link rel="alternate" hreflang="x-default" href="${esc(idUrl)}">` : ''}
${o.noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="jenius.es">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:locale" content="${L === 'en' ? 'en_US' : 'id_ID'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b2a6b">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32">
<link rel="icon" href="/assets/favicon-64.png" sizes="64x64">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
${ADSENSE_METAS}
${o.ads ? ADSENSE_LOADER : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="/assets/app.css?v=${ASSET_V}">
${ld}
</head>
<body class="${esc(o.bodyClass ?? '')}">
<a class="skip" href="#main">${tr(L, 'Langsung ke isi', 'Skip to content')}</a>
<div class="pwa-bar" data-pwa hidden><img src="/assets/icon-192.png" alt="" width="36" height="36"><span><b>${tr(L, 'Pasang jenius.es di HP', 'Install jenius.es on your phone')}</b> ${tr(L, '— buku bersuara, bisa dibaca tanpa internet.', '— voiced books, readable offline.')}</span><button type="button" class="btn btn-sm btn-primary" data-pwa-install hidden>${tr(L, 'Pasang', 'Install')}</button><button type="button" class="btn btn-sm btn-ghost" data-pwa-close aria-label="${tr(L, 'Tutup', 'Close')}">✕</button></div>
<header class="top"><div class="top-glow" aria-hidden="true"></div>
  <div class="wrap top-in">
    <a class="brand" href="${P(L, 'home')}" aria-label="jenius.es"><img src="/assets/badge-96.webp" alt="" width="40" height="40"><span><b>jenius.es</b><small>${L === 'en' ? SITE.tagline[1] : SITE.tagline[0]}</small></span></a>
    <nav class="main-nav" aria-label="${tr(L, 'Menu utama', 'Main menu')}">${nav(L, o.active)}</nav>
    <div class="top-actions">
      ${o.alt ? html`<a class="lang-switch" href="${o.alt}" hreflang="${L === 'en' ? 'id' : 'en'}" lang="${L === 'en' ? 'id' : 'en'}">${L === 'en' ? 'ID' : 'EN'}</a>` : ''}
      ${o.user ? html`<a class="btn btn-sm btn-ghost" href="${L === 'en' ? '/en/me' : '/saya'}">👤 ${o.user.name}</a>` : ACCOUNTS_OPEN ? html`<a class="btn btn-sm btn-primary" href="${L === 'en' ? '/en/login' : '/masuk'}">${tr(L, 'Masuk', 'Log in')}</a>` : html`<a class="btn btn-sm btn-primary" href="${P(L, 'lanes')}">▶ ${tr(L, 'Baca gratis', 'Read free')}</a>`}
      <button class="menu-btn" type="button" data-menu aria-label="${tr(L, 'Buka menu', 'Open menu')}" aria-expanded="false">☰</button>
    </div>
  </div>
</header>
<main id="main">${o.body}</main>
<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-brand"><img src="/assets/logo-main-600.webp" alt="jenius.es — E-Book with Voice" width="200" height="60" loading="lazy">
      <p>${tr(L, 'Perpustakaan baca bersuara yang gratis untuk semua: anak, pelajar, mahasiswa, guru, dan pembaca umum. Buku dari sumber terbuka, dibacakan suara sintetis, dengan atribusi lengkap.', 'A free voiced reading library for everyone: children, students, teachers and general readers. Books from open sources, read aloud by synthetic voices, fully attributed.')}</p></div>
    <nav aria-label="${tr(L, 'Informasi', 'Information')}">
      <a href="${P(L, 'about')}">${tr(L, 'Tentang', 'About')}</a>
      <a href="${P(L, 'guide')}">${tr(L, 'Panduan', 'Guide')}</a>
      <a href="${P(L, 'licenses')}">${tr(L, 'Lisensi & atribusi', 'Licences & credits')}</a>
      <a href="${P(L, 'contact')}">${tr(L, 'Kontak', 'Contact')}</a>
    </nav>
    <nav aria-label="${tr(L, 'Hukum', 'Legal')}">
      <a href="${P(L, 'privacy')}">${tr(L, 'Kebijakan privasi', 'Privacy policy')}</a>
      <a href="${P(L, 'cookies')}">${tr(L, 'Kebijakan cookie', 'Cookie policy')}</a>
      <a href="${P(L, 'terms')}">${tr(L, 'Syarat & ketentuan', 'Terms')}</a>
      <a href="${P(L, 'disclaimer')}">${tr(L, 'Penafian', 'Disclaimer')}</a>
      <a href="${P(L, 'accessibility')}">${tr(L, 'Aksesibilitas', 'Accessibility')}</a>
    </nav>
  </div>
  <p class="wrap fine">© 2026 jenius.es · ${tr(L, 'Suara pembaca adalah suara sintetis.', 'Reader voices are synthetic.')} · ${tr(L, 'Halaman anak dan pembaca buku tanpa iklan.', 'Children’s pages and the book reader carry no ads.')}</p>
</footer>
<div class="cookie" data-cookie hidden role="dialog" aria-live="polite" aria-label="${tr(L, 'Cookie', 'Cookies')}">
  <p>${tr(L, 'Kami memakai cookie penting untuk masuk dan menyimpan posisi baca. Iklan Google di halaman dewasa dapat memakai cookie — lihat', 'We use essential cookies for sign-in and to remember your reading position. Google ads on adult pages may use cookies — see the')} <a href="${P(L, 'cookies')}">${tr(L, 'kebijakan cookie', 'cookie policy')}</a>.</p>
  <button type="button" class="btn btn-sm btn-primary" data-cookie-ok>${tr(L, 'Mengerti', 'Got it')}</button>
</div>
<script src="/assets/app.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/** Remah roti (BreadcrumbList) untuk JSON-LD. */
export function crumbs(origin: string, items: [string, string][]): unknown {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${origin}${path}` })) };
}

export const pageHead = (title: string, lead?: string, eyebrow?: string) =>
  html`<section class="page-head"><div class="wrap">${eyebrow ? html`<span class="eyebrow">${eyebrow}</span>` : ''}<h1>${title}</h1>${lead ? html`<p class="lead">${lead}</p>` : ''}</div></section>`;
