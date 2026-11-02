/** Kerangka halaman & komponen bersama (publik, portal member, portal admin). */
import { html, raw, type Raw } from '../lib/html.ts';
import { tr, fmtNum, LABELS, type Lang, type LabelKey } from '../lib/i18n.ts';
import type { User } from '../data/users.ts';
import { isAdmin } from '../data/users.ts';
import { PURGE_DAYS } from '../data/policy.ts';

export const BRAND = 'AI Content Analyzer';
const FONT = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';

export const LOGO = raw('<img class="logo-mark" src="/assets/logo-badge-96.webp" srcset="/assets/logo-badge-96.webp 1x, /assets/logo-badge-192.webp 2x" width="40" height="40" alt="">');
export const TAGLINE = 'Detect · Analyze · Verify';

/**
 * Google AdSense xscan.es (pemilik, 2 Nov 2026: „google.com, pub-9354298681597606, DIRECT, f08c47fec0942fa0").
 * Satu konstanta untuk tag meta, loader dan /ads.txt — lihat docs/ADSENSE-CODES.md di akar repo.
 */
export const ADSENSE_PUB = '9354298681597606';
export const ADSENSE_CLIENT = `ca-pub-${ADSENSE_PUB}`;
export const ADS_TXT = `google.com, pub-${ADSENSE_PUB}, DIRECT, f08c47fec0942fa0\n`;

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
<meta name="google-adsense-account" content="${ADSENSE_CLIENT}">
<meta name="theme-color" content="#0a1238">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png"><link rel="icon" href="/assets/favicon-64.png" sizes="64x64" type="image/png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><meta property="og:image" content="/assets/logo-full-1200.webp">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONT}">
<link rel="stylesheet" href="/assets/app.css?v=1">
${o.jsonld ? raw(`<script type="application/ld+json">${JSON.stringify(o.jsonld).replace(/</g, '\\u003c')}</script>`) : ''}
<script src="/assets/app.js?v=1" defer></script>
${o.area === 'public' && !o.noindex ? raw(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`) : ''}
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
  ];
  return html`<header class="topbar" data-elevate>
  <div class="wrap topbar-in">
    <a class="brand" href="${L === 'en' ? '/en' : '/'}">${LOGO}<span class="brand-txt">${BRAND}<small class="brand-tag">${TAGLINE}</small></span></a>
    <nav class="mainnav" aria-label="${tr(L, 'Menu utama', 'Main menu')}">
      ${links.map(([href, label, key]) => html`<a href="${href}" class="${o.active === key ? 'on' : ''}">${label}</a>`)}
    </nav>
    <div class="nav-actions">
      ${o.alt ? html`<a class="lang-switch" href="${o.alt}" hreflang="${L === 'id' ? 'en' : 'id'}" title="${tr(L, 'Ganti bahasa', 'Switch language')}"><b>${L === 'id' ? 'ID' : 'EN'}</b><span>${L === 'id' ? 'EN' : 'ID'}</span></a>` : ''}
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
    <div><a class="brand" href="${p('/', '/en')}">${LOGO}<span class="brand-txt">${BRAND}<small class="brand-tag">${TAGLINE}</small></span></a>
      <p class="muted">${tr(L, 'Deteksi tulisan AI dan penilaian artikel untuk Bahasa Indonesia & English. Hasil adalah bukti pendukung, bukan vonis.', 'AI-writing detection and article grading for Indonesian & English. Results are supporting evidence, not a verdict.')}</p></div>
    <div><h4>${tr(L, 'Produk', 'Product')}</h4><a href="${p('/cara-kerja', '/en/how-it-works')}">${tr(L, 'Cara kerja', 'How it works')}</a><a href="${p('/akurasi', '/en/accuracy')}">${tr(L, 'Akurasi', 'Accuracy')}</a><a href="${p('/harga', '/en/pricing')}">${tr(L, 'Harga', 'Pricing')}</a><a href="${p('/contoh-laporan', '/en/sample-report')}">${tr(L, 'Contoh laporan', 'Sample report')}</a></div>
    <div><h4>${tr(L, 'Kebijakan', 'Policies')}</h4><a href="${p('/kebijakan-privasi', '/en/privacy')}">${tr(L, 'Privasi', 'Privacy')}</a><a href="${p('/syarat', '/en/terms')}">${tr(L, 'Syarat', 'Terms')}</a><a href="${p('/penggunaan-etis', '/en/ethical-use')}">${tr(L, 'Penggunaan etis', 'Ethical use')}</a><a href="/verifikasi${L === 'en' ? '?lang=en' : ''}">${tr(L, 'Verifikasi laporan', 'Verify a report')}</a></div>
    <div><h4>${tr(L, 'Kontak', 'Contact')}</h4><a href="mailto:hello@axto.io">hello@axto.io</a><a href="https://wa.me/6285691234561" rel="noopener">WhatsApp</a></div>
  </div>
  <div class="wrap footer-base"><span>© ${new Date().getFullYear()} ${BRAND}</span><span>${tr(L, 'Data terenkripsi · teks dihapus otomatis · xscan.es', 'Encrypted data · texts deleted automatically · xscan.es')}</span></div>
</footer>`;
}

function sideNav(o: PageOpts): Raw {
  const L = o.L;
  const u = o.user;
  const items: [string, string, string, string][] =
    o.area === 'admin'
      ? [
          ['/admin', '◎', tr(L, 'Dasbor admin', 'Admin dashboard'), 'dash'],
          ['/admin/kunci-api', '🔑', tr(L, 'Kunci API Claude', 'Claude API key'), 'key'],
          ['/admin/mesin', '⚙', tr(L, 'Mesin & ambang', 'Engine & thresholds'), 'engine'],
          ['/admin/benchmark', '◈', tr(L, 'Benchmark akurasi', 'Accuracy benchmark'), 'bench'],
          ['/admin/anggota', '👥', tr(L, 'Anggota', 'Members'), 'members'],
          ['/admin/harga', '％', tr(L, 'Harga & token', 'Pricing & tokens'), 'pricing'],
          ['/admin/pesanan', '🧾', tr(L, 'Pesanan & bukti TF', 'Orders & proofs'), 'orders'],
          ['/admin/pembayaran', '🏦', tr(L, 'Rekening pembayaran', 'Payment accounts'), 'payments'],
          ['/admin/afiliasi', '🤝', tr(L, 'Afiliasi', 'Affiliate'), 'aff'],
          ['/admin/laporan', '▤', tr(L, 'Laporan', 'Reports'), 'reports'],
          ['/admin/biaya', '＄', tr(L, 'Biaya API', 'API cost'), 'cost'],
          ['/admin/audit', '⌁', tr(L, 'Audit & cadangan', 'Audit & backups'), 'audit'],
        ]
      : [
          ['/app', '◎', tr(L, 'Dasbor', 'Dashboard'), 'dash'],
          ['/app/periksa', '＋', tr(L, 'Periksa baru', 'New check'), 'check'],
          ['/app/laporan', '▤', tr(L, 'Laporan', 'Reports'), 'reports'],
          ['/app/sesi', '🏆', tr(L, 'Sesi lomba / kelas', 'Contest / class sessions'), 'batches'],
          ['/app/token', '◔', tr(L, 'Token & deposit', 'Tokens & deposit'), 'credits'],
          ['/app/pesanan', '🧾', tr(L, 'Invoice', 'Invoices'), 'invoices'],
          ['/app/afiliasi', '🤝', tr(L, 'Afiliasi', 'Affiliate'), 'aff'],
          ['/app/pengaturan', '⚙', tr(L, 'Pengaturan', 'Settings'), 'settings'],
        ];
  return html`<aside class="side" id="side">
  <a class="brand" href="${o.area === 'admin' ? '/admin' : '/app'}">${LOGO}<span class="brand-txt">${BRAND}${o.area === 'admin' ? html` <em class="tag-admin">Admin</em>` : ''}<small class="brand-tag">${TAGLINE}</small></span></a>
  <nav aria-label="${tr(L, 'Navigasi portal', 'Portal navigation')}">
    ${items.map(([href, ic, label, key]) => html`<a href="${href}" class="${o.active === key ? 'on' : ''}"><i aria-hidden="true">${ic}</i><span>${label}</span></a>`)}
  </nav>
  <div class="side-foot">
    ${o.area === 'admin' ? html`<a href="/app" class="side-link">← ${tr(L, 'Portal member', 'Member portal')}</a>` : isAdmin(u) ? html`<a href="/admin" class="side-link">⚑ ${tr(L, 'Portal admin', 'Admin portal')}</a>` : ''}
    <a href="/lang?to=${L === 'id' ? 'en' : 'id'}" class="side-link">🌐 ${L === 'id' ? 'English' : 'Bahasa Indonesia'}</a>
    <form method="post" action="/keluar"><button class="side-link" type="submit">⎋ ${tr(L, 'Keluar', 'Log out')}</button></form>
    ${u ? html`<div class="who"><b>${u.name}</b><small>${u.email}</small></div>` : ''}
  </div>
</aside>`;
}

export function page(o: PageOpts): string {
  const L = o.L;
  let bodyHtml: Raw;
  if (o.area === 'public') {
    bodyHtml = html`${publicNav(o)}<main id="main" class="page-public">${o.body}</main>${publicFooter(L)}`;
  } else if (o.area === 'print') {
    bodyHtml = html`<main id="main" class="page-print">${o.body}</main>`;
  } else {
    bodyHtml = html`<div class="shell">${sideNav(o)}<div class="shell-main"><header class="mobilebar"><button class="icon-btn" type="button" data-toggle="side" aria-label="Menu">☰</button><a class="brand" href="/app">${LOGO}<span class="brand-txt">${BRAND}<small class="brand-tag">${TAGLINE}</small></span></a></header><main id="main" class="page-app">${o.body}</main></div></div>`;
  }
  return `<!doctype html><html lang="${L}">${head(o)}<body class="area-${o.area}"><a class="skip" href="#main">${tr(L, 'Langsung ke isi', 'Skip to content')}</a>${bodyHtml}<div class="toasts" aria-live="polite"></div></body></html>`;
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
  const t = tr(L, `Semua hasil kerja (laporan, naskah, sesi lomba/kelas) dan berkas yang Anda unggah dihapus otomatis ${PURGE_DAYS} hari setelah dibuat. Unduh atau cetak laporan yang ingin disimpan. Catatan transaksi (invoice, saldo) tetap disimpan.`, `All your work (reports, texts, contest/class sessions) and the files you upload are deleted automatically ${PURGE_DAYS} days after they are created. Download or print the reports you want to keep. Transaction records (invoices, balances) are kept.`);
  return compact ? html`<p class="muted small notice-purge noprint">🗓 ${t}</p>` : html`<div class="notice-purge noprint" role="note">🗓 <b>${tr(L, `Dibersihkan otomatis setiap ${PURGE_DAYS} hari.`, `Cleaned automatically after ${PURGE_DAYS} days.`)}</b> ${t}</div>`;
}

export function csrfField(token: string): Raw {
  return html`<input type="hidden" name="_csrf" value="${token}">`;
}
