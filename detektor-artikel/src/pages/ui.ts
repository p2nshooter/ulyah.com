/** Kerangka halaman & komponen bersama (publik, portal member, portal admin). */
import { html, raw, type Raw } from '../lib/html.ts';
import { tr, fmtNum, LABELS, type Lang, type LabelKey } from '../lib/i18n.ts';
import type { User } from '../data/users.ts';
import { isAdmin } from '../data/users.ts';
import { PURGE_DAYS } from '../data/policy.ts';
import { B, isAscan } from '../brand.ts';
import { ASSET_V } from '../lib/pwa.ts';

/** Nama, logo, warna dan akun AdSense datang dari lapisan merek (src/brand.ts) — xscan.es atau ascan.es. */
export const BRAND = B.name;
const FONT = B.font;

export const LOGO = raw(`<img class="logo-mark" src="${B.badge.src1x}" srcset="${B.badge.src1x} 1x, ${B.badge.src2x} 2x" width="40" height="40" alt="">`);
export const TAGLINE = B.tagline;
export const BRAND_HOST = B.host;
/** Tanda air laporan Cek Gratis: logo domain yang dipudarkan (berkas dari pemilik, 8 Nov 2026). */
export const WATERMARK = B.watermark;

/** Blok merek di kepala halaman: ascan.es memakai logo lebar dari pemilik; xscan.es lencana + nama + slogan. */
export function brandMark(extra: Raw | string = ''): Raw {
  if (B.wideLogo) {
    const w = B.wideLogo;
    return html`<img class="logo-wide" src="${w.src1x}" srcset="${w.src1x} 1x, ${w.src2x} 2x" width="${w.w}" height="${w.h}" alt="${B.host} — ${B.tagline}">${extra}`;
  }
  return html`${LOGO}<span class="brand-txt">${BRAND}${extra}<small class="brand-tag">${TAGLINE}</small></span>`;
}

/**
 * Google AdSense xscan.es (pemilik, 2 Nov 2026: „google.com, pub-9354298681597606, DIRECT, f08c47fec0942fa0").
 * Satu konstanta untuk tag meta, loader dan /ads.txt — lihat docs/ADSENSE-CODES.md di akar repo.
 */
export const ADSENSE_PUB = B.adsensePub;
export const ADSENSE_CLIENT = `ca-pub-${ADSENSE_PUB}`;

/**
 * Akun yang ditumpuk (pemilik: 16 akun 7 Nov 2026, akun ke-17 pub-8212039662308316 8 Nov 2026; „kode2 adsense ini di tumpuk aja di dusun yg rapih agar tidak
 * saling bentrok dan tidak melanggar kebijakan adsense"). Daftar dan urutannya sama dengan adsense-stack.json di akar
 * repo (diperiksa scripts/check-ads.ts). Setiap akun mendapat tag meta dan baris ads.txt sendiri; loader tetap SATU,
 * akun utama di atas, karena Google mengabaikan tag kepala AdSense kedua di halaman yang sama.
 */
export const ADSENSE_STACK = [
  'ca-pub-6560360898389273',
  'ca-pub-4906992051458194',
  'ca-pub-5928074389292014',
];
export const ADSENSE_ACCOUNTS: readonly string[] = [...new Set([ADSENSE_CLIENT, ...ADSENSE_STACK])];
export const ADS_TXT = `${ADSENSE_ACCOUNTS.map((a) => `google.com, ${a.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`).join('\n')}\n`;
const ADSENSE_METAS = ADSENSE_ACCOUNTS.map((a) => `<meta name="google-adsense-account" content="${a}">`).join('\n');

export interface PageOpts {
  L: Lang;
  title: string;
  desc?: string;
  body: Raw;
  user?: User | null;
  area: 'public' | 'app' | 'admin' | 'print';
  path?: string;
  /** URL halaman yang sama dalam bahasa lain (publik). */
  alt?: string;
  noindex?: boolean;
  canonical?: string;
  jsonld?: unknown;
  active?: string;
  /**
   * Loader AdSense di area member — HANYA untuk halaman yang berisi konten untuk dibaca (laporan Cek Gratis beserta
   * panduannya). Tidak pernah di layar unggah, layar proses, pembayaran, pengaturan, admin, atau cetak
   * (docs/MASTER-BLUEPRINT.md §20.6).
   */
  ads?: boolean;
}

function head(o: PageOpts): Raw {
  const t = o.area === 'public' ? `${o.title} · ${BRAND}` : `${o.title} — ${BRAND}`;
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title>
${o.desc ? html`<meta name="description" content="${o.desc}">` : ''}
${o.noindex || o.area !== 'public' ? html`<meta name="robots" content="noindex, nofollow">` : ''}
${o.canonical ? html`<link rel="canonical" href="${o.canonical}">` : ''}
${o.alt && o.path ? html`<link rel="alternate" hreflang="${o.L === 'id' ? 'en' : 'id'}" href="${o.alt}"><link rel="alternate" hreflang="${o.L}" href="${o.path}">` : ''}
${raw(ADSENSE_METAS)}
<meta name="theme-color" content="${B.themeColor}">
<link rel="manifest" href="/manifest.webmanifest"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="${B.host}">
<link rel="icon" href="${B.favicon32}" sizes="32x32" type="image/png"><link rel="icon" href="${B.favicon64}" sizes="64x64" type="image/png"><link rel="apple-touch-icon" href="${B.appleTouch}"><meta property="og:image" content="${B.ogImage}"><meta property="og:site_name" content="${B.host}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONT}">
<link rel="stylesheet" href="/assets/app.css?v=${ASSET_V}">${isAscan ? html`<link rel="stylesheet" href="${B.css}">` : ''}
${o.jsonld ? raw(`<script type="application/ld+json">${JSON.stringify(o.jsonld).replace(/</g, '\\u003c')}</script>`) : ''}
<script src="/assets/app.js?v=${ASSET_V}" defer></script>
${(o.area === 'public' && !o.noindex) || (o.area === 'app' && o.ads) ? raw(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`) : ''}
</head>`;
}

function publicNav(o: PageOpts): Raw {
  const L = o.L;
  const p = (id: string, en: string) => (L === 'en' ? en : id);
  const links: [string, string, string][] = [
    [p('/cara-kerja', '/en/how-it-works'), tr(L, 'Cara kerja', 'How it works'), 'how'],
    [p('/akurasi', '/en/accuracy'), tr(L, 'Akurasi', 'Accuracy'), 'acc'],
    [p('/harga', '/en/pricing'), tr(L, 'Harga', 'Pricing'), 'price'],
    [p('/contoh-laporan', '/en/sample-report'), tr(L, 'Contoh laporan', 'Sample report'), 'sample'],
    [p('/panduan', '/en/guide'), tr(L, 'Panduan', 'Guide'), 'guide'],
  ];
  return html`<header class="topbar" data-elevate>
  <div class="wrap topbar-in">
    <a class="brand" href="${L === 'en' ? '/en' : '/'}">${brandMark()}</a>
    <nav class="mainnav" aria-label="${tr(L, 'Menu utama', 'Main menu')}">
      ${links.map(([href, label, key]) => html`<a href="${href}" class="${o.active === key ? 'on' : ''}">${label}</a>`)}
    </nav>
    <div class="nav-actions">
      ${o.alt ? html`<a class="lang-switch" href="/lang?to=${L === 'id' ? 'en' : 'id'}&amp;next=${encodeURIComponent(new URL(o.alt, 'https://x.invalid').pathname)}" rel="nofollow" hreflang="${L === 'id' ? 'en' : 'id'}" title="${tr(L, 'Ganti bahasa', 'Switch language')}"><b>${L === 'id' ? 'ID' : 'EN'}</b><span>${L === 'id' ? 'EN' : 'ID'}</span></a>` : ''}
      ${o.user
        ? html`<a class="btn btn-primary btn-sm" href="/app">${tr(L, 'Dasbor', 'Dashboard')}</a>`
        : html`<a class="btn btn-ghost btn-sm hide-sm" href="/masuk${L === 'en' ? '?lang=en' : ''}">${tr(L, 'Masuk', 'Log in')}</a><a class="btn btn-primary btn-sm" href="/daftar${L === 'en' ? '?lang=en' : ''}">${tr(L, 'Daftar', 'Sign up')}</a>`}
      <button class="icon-btn menu-btn" type="button" data-toggle="mainnav" aria-label="Menu">☰</button>
    </div>
  </div>
</header>`;
}

function publicFooter(L: Lang): Raw {
  const p = (id: string, en: string) => (L === 'en' ? en : id);
  return html`<footer class="footer">
  <div class="wrap footer-grid">
    <div><a class="brand" href="${p('/', '/en')}">${brandMark()}</a>
      <p class="muted">${tr(L, 'Deteksi tulisan AI dan penilaian artikel untuk Bahasa Indonesia & English. Hasil adalah bukti pendukung, bukan vonis.', 'AI-writing detection and article grading for Indonesian & English. Results are supporting evidence, not a verdict.')}</p></div>
    <div><h4>${tr(L, 'Produk', 'Product')}</h4><a href="${p('/cara-kerja', '/en/how-it-works')}">${tr(L, 'Cara kerja', 'How it works')}</a><a href="${p('/akurasi', '/en/accuracy')}">${tr(L, 'Akurasi', 'Accuracy')}</a><a href="${p('/harga', '/en/pricing')}">${tr(L, 'Harga', 'Pricing')}</a><a href="${p('/contoh-laporan', '/en/sample-report')}">${tr(L, 'Contoh laporan', 'Sample report')}</a><a href="${p('/panduan', '/en/guide')}">${tr(L, 'Panduan pemakaian', 'User guide')}</a></div>
    <div><h4>${tr(L, 'Kebijakan', 'Policies')}</h4><a href="${p('/kebijakan-privasi', '/en/privacy')}">${tr(L, 'Privasi', 'Privacy')}</a><a href="${p('/syarat', '/en/terms')}">${tr(L, 'Syarat', 'Terms')}</a><a href="${p('/penggunaan-etis', '/en/ethical-use')}">${tr(L, 'Penggunaan etis', 'Ethical use')}</a><a href="/verifikasi${L === 'en' ? '?lang=en' : ''}">${tr(L, 'Verifikasi laporan', 'Verify a report')}</a></div>
    <div><h4>${tr(L, 'Kontak', 'Contact')}</h4><a href="mailto:hello@axto.io">hello@axto.io</a><a href="https://wa.me/6285691234561" rel="noopener">WhatsApp</a></div>
  </div>
  <div class="wrap footer-base"><span>© ${new Date().getFullYear()} ${BRAND}</span><span>${tr(L, 'Data terenkripsi · teks dihapus otomatis · xscan.es', 'Encrypted data · texts deleted automatically · xscan.es')}</span></div>
</footer>`;
}

/* Ikon garis seragam (24×24, goresan 1,8) — satu gaya untuk semua menu portal, menggantikan campuran emoji dan simbol. */
const IKON: Record<string, string> = {
  dash: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>',
  engine: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  bench: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  members: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  pricing: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  free: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12M12 9c-2-4-7-3-5 0M12 9c2-4 7-3 5 0"/>',
  controls: '<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
  orders: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
  invoices: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
  payments: '<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  paypal: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
  fx: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  aff: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/>',
  reports: '<path d="M6 3h8l4 4v14H6V3z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  cost: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
  finance: '<path d="M3 7a2 2 0 012-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.3"/>',
  audit: '<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  guide: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1V5z"/><path d="M12 6v14"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  batches: '<path d="M8 4h8v5a4 4 0 01-8 0V4z"/><path d="M8 6H4c0 3 1.5 5 4 5M16 6h4c0 3-1.5 5-4 5M12 13v4M8 21h8"/>',
  credits: '<ellipse cx="9" cy="8" rx="6" ry="3"/><path d="M3 8v4c0 1.7 2.7 3 6 3s6-1.3 6-3V8"/><path d="M9 15v1c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.2-1.4-2.3-3.5-2.8"/>',
  settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  home: '<path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
};
export const ikon = (k: string): Raw => raw(`<svg class="ic" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IKON[k] ?? IKON.dash}</svg>`);

type NavItem = [href: string, label: string, key: string];
type NavGroup = [title: string, items: NavItem[]];

/**
 * Menu portal dikelompokkan menurut pekerjaan (pemilik, 16 Nov 2026: „css d portal member dan portal admin masih susah di
 * mengerti kurang user friendly“): setiap kelompok punya judul, ikon satu gaya, dan urutan mengikuti alur kerja.
 */
function navGroups(o: PageOpts): NavGroup[] {
  const L = o.L;
  if (o.area === 'admin') {
    return [
      ['', [['/admin', tr(L, 'Dasbor admin', 'Admin dashboard'), 'dash']]],
      [tr(L, 'Pelanggan', 'Customers'), [
        ['/admin/anggota', tr(L, 'Anggota', 'Members'), 'members'],
        ['/admin/pesanan', tr(L, 'Pesanan & bukti TF', 'Orders & proofs'), 'orders'],
        ['/admin/laporan', tr(L, 'Laporan', 'Reports'), 'reports'],
        ['/admin/afiliasi', tr(L, 'Afiliasi', 'Affiliate'), 'aff'],
      ]],
      [tr(L, 'Harga & pembayaran', 'Pricing & payments'), [
        ['/admin/harga', tr(L, 'Harga & token', 'Pricing & tokens'), 'pricing'],
        ['/admin/kuota-gratis', tr(L, 'Kuota gratis', 'Free quota'), 'free'],
        ['/admin/pembayaran', tr(L, 'Rekening pembayaran', 'Payment accounts'), 'payments'],
        ['/admin/paypal', 'PayPal', 'paypal'],
        ['/admin/kurs', tr(L, 'Kurs USD/IDR', 'USD/IDR rate'), 'fx'],
      ]],
      [tr(L, 'Mesin & biaya', 'Engine & cost'), [
        ['/admin/kunci-api', tr(L, 'Kunci API Claude', 'Claude API key'), 'key'],
        ['/admin/mesin', tr(L, 'Mesin & ambang', 'Engine & thresholds'), 'engine'],
        ['/admin/benchmark', tr(L, 'Benchmark akurasi', 'Accuracy benchmark'), 'bench'],
        ['/admin/kendali', tr(L, 'Kendali biaya', 'Cost controls'), 'controls'],
        ['/admin/biaya', tr(L, 'Biaya API', 'API cost'), 'cost'],
        ['/admin/keuangan', tr(L, 'Token & laba', 'Tokens & profit'), 'finance'],
      ]],
      [tr(L, 'Sistem', 'System'), [
        ['/admin/audit', tr(L, 'Audit & cadangan', 'Audit & backups'), 'audit'],
        ['/admin/panduan', tr(L, 'Panduan admin', 'Admin guide'), 'guide'],
      ]],
    ];
  }
  return [
    ['', [
      ['/app', tr(L, 'Dasbor', 'Dashboard'), 'dash'],
      ['/app/periksa', tr(L, 'Periksa baru', 'New check'), 'check'],
    ]],
    [tr(L, 'Hasil', 'Results'), [
      ['/app/laporan', tr(L, 'Laporan', 'Reports'), 'reports'],
      ['/app/sesi', tr(L, 'Sesi lomba / kelas', 'Contest / class sessions'), 'batches'],
    ]],
    [tr(L, 'Saldo', 'Balance'), [
      ['/app/token', tr(L, 'Token & deposit', 'Tokens & deposit'), 'credits'],
      ['/app/pesanan', tr(L, 'Invoice', 'Invoices'), 'invoices'],
      ['/app/afiliasi', tr(L, 'Afiliasi', 'Affiliate'), 'aff'],
    ]],
    [tr(L, 'Akun', 'Account'), [
      ['/app/pengaturan', tr(L, 'Pengaturan', 'Settings'), 'settings'],
      [L === 'en' ? '/en/guide' : '/panduan', tr(L, 'Panduan', 'Guide'), 'guide'],
    ]],
  ];
}

function sideNav(o: PageOpts): Raw {
  const L = o.L;
  const u = o.user;
  // Pemilik, 8 Nov 2026: tombol ✕ untuk menutup menu di HP dan tombol ke beranda situs dari portal member maupun admin.
  return html`<aside class="side" id="side" ${o.area === 'admin' ? raw('data-admin-notify') : ''}>
  <div class="side-head"><a class="brand" href="${o.area === 'admin' ? '/admin' : '/app'}">${brandMark(o.area === 'admin' ? html` <em class="tag-admin">Admin</em>` : '')}</a><button class="side-close" type="button" data-close-side aria-label="${tr(L, 'Tutup menu', 'Close menu')}" title="${tr(L, 'Tutup menu', 'Close menu')}">✕</button></div>
  <a class="side-home" href="${L === 'en' ? '/en' : '/'}" data-home-link>${ikon('home')} <span>${tr(L, 'Beranda situs', 'Website home')}</span></a>
  <nav aria-label="${tr(L, 'Navigasi portal', 'Portal navigation')}">
    ${navGroups(o).map(([judul, items]) => html`${judul ? html`<p class="side-group">${judul}</p>` : ''}${items.map(([href, label, key]) => html`<a href="${href}" class="${o.active === key ? 'on' : ''}" data-nav="${key}"${raw(o.active === key ? ' aria-current="page"' : '')}>${ikon(key)}<span>${label}</span><b class="nav-badge" data-badge="${key}" hidden></b></a>`)}`)}
  </nav>
  <div class="side-foot">
    ${o.area === 'admin' ? html`<a href="/app" class="side-link">← ${tr(L, 'Portal member', 'Member portal')}</a><button type="button" class="side-link" data-notify-enable hidden>🔔 ${tr(L, 'Aktifkan notifikasi', 'Turn on notifications')}</button>` : isAdmin(u) ? html`<a href="/admin" class="side-link">⚑ ${tr(L, 'Portal admin', 'Admin portal')}</a>` : ''}
    <a href="/lang?to=${L === 'id' ? 'en' : 'id'}" class="side-link">🌐 ${L === 'id' ? 'English' : 'Bahasa Indonesia'}</a>
    <form method="post" action="/keluar"><button class="side-link" type="submit">⎋ ${tr(L, 'Keluar', 'Log out')}</button></form>
    ${u ? html`<div class="who"><b>${u.name}</b><small>${u.email}</small></div>` : ''}
  </div>
</aside>`;
}

/** Bilah bawah di HP: empat tujuan tersering + tombol Menu (membuka menu samping). */
function tabBar(o: PageOpts): Raw {
  const L = o.L;
  const items: NavItem[] = o.area === 'admin'
    ? [['/admin', tr(L, 'Dasbor', 'Home'), 'dash'], ['/admin/pesanan', tr(L, 'Pesanan', 'Orders'), 'orders'], ['/admin/anggota', tr(L, 'Anggota', 'Members'), 'members'], ['/admin/harga', tr(L, 'Harga', 'Pricing'), 'pricing']]
    : [['/app', tr(L, 'Dasbor', 'Home'), 'dash'], ['/app/periksa', tr(L, 'Periksa', 'Check'), 'check'], ['/app/laporan', tr(L, 'Laporan', 'Reports'), 'reports'], ['/app/token', tr(L, 'Token', 'Tokens'), 'credits']];
  return html`<nav class="tabbar noprint" aria-label="${tr(L, 'Pintasan', 'Shortcuts')}">
  ${items.map(([href, label, key]) => html`<a href="${href}" class="${o.active === key ? 'on' : ''}${key === 'check' ? ' tab-utama' : ''}"${raw(o.active === key ? ' aria-current="page"' : '')}>${ikon(key)}<span>${label}</span></a>`)}
  <button type="button" data-toggle="side" aria-controls="side">${ikon('more')}<span>${tr(L, 'Menu', 'Menu')}</span></button>
</nav>`;
}

export function page(o: PageOpts): string {
  const L = o.L;
  let bodyHtml: Raw;
  if (o.area === 'public') {
    bodyHtml = html`${publicNav(o)}<main id="main" class="page-public">${o.body}</main>${publicFooter(L)}`;
  } else if (o.area === 'print') {
    bodyHtml = html`<main id="main" class="page-print">${o.body}</main>`;
  } else {
    bodyHtml = html`<div class="shell">${sideNav(o)}<div class="side-backdrop" data-close-side hidden></div><div class="shell-main"><header class="mobilebar"><button class="icon-btn" type="button" data-toggle="side" aria-label="Menu" aria-controls="side">☰</button><a class="brand" href="${o.area === 'admin' ? '/admin' : '/app'}">${brandMark()}</a><a class="icon-btn home-btn" href="${L === 'en' ? '/en' : '/'}" aria-label="${tr(L, 'Beranda situs', 'Website home')}" title="${tr(L, 'Beranda situs', 'Website home')}">🏠</a></header><main id="main" class="page-app">${o.body}</main>${tabBar(o)}</div></div>`;
  }
  return `<!doctype html><html lang="${L}">${head(o)}<body class="area-${o.area} brand-${B.id}"><a class="skip" href="#main">${tr(L, 'Langsung ke isi', 'Skip to content')}</a>${o.area === 'print' ? '' : installBar(L)}${bodyHtml}<div class="toasts" aria-live="polite"></div></body></html>`;
}

/* ── komponen ─────────────────────────────────────────────────────────── */

export function pageHead(title: string, sub?: string, actions?: Raw): Raw {
  return html`<div class="page-head reveal"><div><h1>${title}</h1>${sub ? html`<p class="lead">${sub}</p>` : ''}</div>${actions ? html`<div class="page-actions">${actions}</div>` : ''}</div>`;
}

/** Kotak panduan yang bisa ditutup (ingatan per pengguna di localStorage). */
export function guide(L: Lang, id: string, title: string, steps: string[]): Raw {
  return html`<section class="guide reveal" data-guide="${id}">
  <div class="guide-ic" aria-hidden="true">💡</div>
  <div><h3>${title}</h3><ol>${steps.map((s) => html`<li>${raw(s)}</li>`)}</ol></div>
  <button type="button" class="guide-x" data-guide-close aria-label="${tr(L, 'Tutup panduan', 'Close guide')}">×</button>
</section>`;
}

export function tip(text: string): Raw {
  return html`<span class="tipdot" tabindex="0" role="note" data-tip="${text}">?</span>`;
}

export function flash(L: Lang, ok?: string | null, err?: string | null): Raw {
  return html`${ok ? html`<div class="flash ok" role="status">✓ ${ok}</div>` : ''}${err ? html`<div class="flash err" role="alert">⚠ ${err}</div>` : ''}`;
}

export function labelPill(L: Lang, key: LabelKey): Raw {
  const cls = key === 'ai' ? 'p-ai' : key === 'partly' ? 'p-mix' : key === 'human' ? 'p-hum' : 'p-unk';
  return html`<span class="pill ${cls}">${L === 'en' ? LABELS[key].en : LABELS[key].id}</span>`;
}

export function compBar(comp: { ai: number; mix: number; hum: number }, big = false): Raw {
  return html`<div class="cbar ${big ? 'big' : ''}" role="img" aria-label="AI ${comp.ai}%, mix ${comp.mix}%, human ${comp.hum}%"><span class="a" style="--w:${comp.ai}%"></span><span class="m" style="--w:${comp.mix}%"></span><span class="h" style="--w:${comp.hum}%"></span></div>`;
}

/** Cincin persen beranimasi (stroke-dashoffset), angka menghitung naik. */
export function ring(value: number, label: string, tone: 'ai' | 'mix' | 'hum' | 'brand'): Raw {
  const r = 42;
  const c = 2 * Math.PI * r;
  return html`<figure class="ring tone-${tone}" style="--c:${c.toFixed(2)};--v:${Math.max(0, Math.min(100, value))}">
  <svg viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="${r}"/><circle class="bar" cx="50" cy="50" r="${r}"/></svg>
  <figcaption><b data-count="${value}">${value}</b><small>%</small><span>${label}</span></figcaption>
</figure>`;
}

export function empty(icon: string, title: string, text: string, cta?: Raw): Raw {
  return html`<div class="empty reveal"><div class="empty-ic" aria-hidden="true">${icon}</div><h3>${title}</h3><p class="muted">${text}</p>${cta ?? ''}</div>`;
}

export function stat(label: string, value: string, hint?: string): Raw {
  return html`<div class="stat reveal"><span class="stat-k">${label}</span><b class="stat-v">${value}</b>${hint ? html`<small class="muted">${hint}</small>` : ''}</div>`;
}

export function words(L: Lang, n: number): string {
  return `${fmtNum(L, n)} ${tr(L, 'kata', 'words')}`;
}

/** Pemberitahuan pembersihan otomatis (pemilik, 2 Nov 2026). */
export function purgeNotice(L: Lang, compact = false): Raw {
  const t = tr(L, `Naskah, rincian per kalimat, dan berkas yang Anda unggah dihapus otomatis ${PURGE_DAYS} hari setelah dibuat. Riwayat kerja Anda — tanggal, judul, angka hasil, nilai, token, dan kode verifikasi — tidak pernah dihapus; laporan lama diberi tanda Arsip. Catatan transaksi (invoice, saldo) tetap disimpan.`, `Texts, per-sentence detail and the files you upload are deleted automatically ${PURGE_DAYS} days after they are created. Your work history — date, title, result figures, score, tokens and verification code — is never deleted; older reports are marked Archive. Transaction records (invoices, balances) are kept.`);
  return compact ? html`<p class="muted small notice-purge noprint">🗓 ${t}</p>` : html`<div class="notice-purge noprint" role="note">🗓 <b>${tr(L, `Naskah dibersihkan otomatis setelah ${PURGE_DAYS} hari; riwayat tetap.`, `Texts are cleaned after ${PURGE_DAYS} days; history stays.`)}</b> ${t}</div>`;
}

export function csrfField(token: string): Raw {
  return html`<input type="hidden" name="_csrf" value="${token}">`;
}

/**
 * Pemberitahuan portal member (pemilik, 8 Nov 2026: „berikan notif bahwa xscan hanya membantu analisa dan tidak
 * memutuskan hasil di portal member“ — dan „jgn di catat di laporan member … cukup di portal member“). Hanya di layar
 * portal; tidak pernah di laporan, halaman cetak, atau berkas unduhan.
 */
export function assistNotice(L: Lang): Raw {
  return html`<div class="assist-note noprint reveal" role="note" data-assist-note><b>ⓘ ${tr(L, `${B.host} membantu Anda menganalisis — tidak memutuskan.`, `${B.host} helps you analyse — it does not decide.`)}</b> ${tr(L, 'Keputusan akhir, seperti nilai, peringkat, sanksi, atau kelayakan terbit, tetap di tangan Anda sebagai guru, juri, panitia, editor, atau pimpinan.', 'The final call — a grade, a ranking, a sanction or whether to publish — stays with you as the teacher, judge, organiser, editor or manager.')}</div>`;
}

/**
 * Spanduk „Pasang di HP“ di paling atas (pemilik, 8 Nov 2026). Tersembunyi sampai peramban menawarkan pemasangan
 * (atau di iPhone/iPad: petunjuk Bagikan → Tambahkan ke Layar Utama); hilang setelah terpasang atau ditutup (7 hari).
 */
export function installBar(L: Lang): Raw {
  return html`<div class="pwa-bar" data-pwa-bar hidden role="region" aria-label="${tr(L, 'Pasang aplikasi', 'Install the app')}">
  <span class="pwa-phone" aria-hidden="true">📱</span><img src="${B.icon192}" width="36" height="36" alt="">
  <div class="pwa-txt"><b>${tr(L, `Pasang ${B.host} di HP Anda`, `Install ${B.host} on your phone`)}</b><small data-pwa-hint>${tr(L, 'Buka lebih cepat dari layar utama, seperti aplikasi.', 'Open it faster from your home screen, like an app.')}</small><small data-pwa-ios hidden>${tr(L, 'Ketuk ⎙ Bagikan, lalu „Tambahkan ke Layar Utama“.', 'Tap ⎙ Share, then “Add to Home Screen”.')}</small></div>
  <button class="btn btn-primary btn-sm" type="button" data-pwa-install hidden>${tr(L, 'Pasang', 'Install')}</button>
  <button class="icon-btn" type="button" data-pwa-close aria-label="${tr(L, 'Tutup', 'Close')}">×</button>
</div>`;
}
