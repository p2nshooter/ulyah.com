/**
 * Lapisan merek (docs/MASTER-BLUEPRINT.md §19.6): satu mesin, dua wajah. Merek dipilih SAAT BUILD lewat `define`
 * (`wrangler.jsonc` env `ascan` → `__BRAND__ = "ascan"`), tidak pernah dari header permintaan. Tanpa define = xscan.es.
 *
 * Pemilik, 7 Nov 2026: „untuk ascan.es bikin bisnis yg sama dengan xscan.es tp dengan kata2 yg berbeda, bentuk berbeda …
 * logo berbeda … warna berbeda“; 8 Nov 2026: logo ascan.es dari pemilik dan „Pake 2 bahasa aja dulu, Indonesia & Inggris“.
 */
declare const __BRAND__: string | undefined;

export type BrandId = 'xscan' | 'ascan';

export interface BrandSpec {
  id: BrandId;
  host: string;
  name: string;
  tagline: string;
  /** Akun AdSense utama (loader); akun tumpukan dari adsense-stack.json. */
  adsensePub: string;
  css: string;
  themeColor: string;
  font: string;
  favicon32: string;
  favicon64: string;
  appleTouch: string;
  ogImage: string;
  /** Lencana kecil (menu samping, label CEK GRATIS). */
  badge: { src1x: string; src2x: string };
  /** Logo lebar untuk kepala halaman publik (null = lencana + nama). */
  wideLogo: { src1x: string; src2x: string; w: number; h: number } | null;
  watermark: { full: string; tile: string; badge: string };
  /** Awalan nomor invoice per merek. */
  invoicePrefix: string;
  contactEmail: string;
}

export const BRANDS: Record<BrandId, BrandSpec> = {
  xscan: {
    id: 'xscan',
    host: 'xscan.es',
    name: 'AI Content Analyzer',
    tagline: 'Detect · Analyze · Verify',
    adsensePub: '9354298681597606',
    css: '/assets/app.css?v=1',
    themeColor: '#0a1238',
    font: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    favicon32: '/assets/favicon-32.png',
    favicon64: '/assets/favicon-64.png',
    appleTouch: '/assets/apple-touch-icon.png',
    ogImage: '/assets/logo-full-1200.webp',
    badge: { src1x: '/assets/logo-badge-96.webp', src2x: '/assets/logo-badge-192.webp' },
    wideLogo: null,
    watermark: { full: '/assets/watermark.webp', tile: '/assets/watermark-tile.webp', badge: '/assets/logo-badge-96.webp' },
    invoicePrefix: 'XS',
    contactEmail: 'hello@axto.io',
  },
  ascan: {
    id: 'ascan',
    host: 'ascan.es',
    name: 'ascan.es',
    tagline: 'Article & Domain Analyzer',
    adsensePub: '9433622530024776',
    css: '/assets/ascan/ascan.css?v=1',
    themeColor: '#0b3bb5',
    font: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap',
    favicon32: '/assets/ascan/favicon-32.png',
    favicon64: '/assets/ascan/favicon-64.png',
    appleTouch: '/assets/ascan/apple-touch-icon.png',
    ogImage: '/assets/ascan/logo-main-1200.webp',
    badge: { src1x: '/assets/ascan/badge-96.webp', src2x: '/assets/ascan/badge-192.webp' },
    wideLogo: { src1x: '/assets/ascan/logo-main-600.webp', src2x: '/assets/ascan/logo-main-1200.webp', w: 186, h: 48 },
    watermark: { full: '/assets/ascan/watermark.webp', tile: '/assets/ascan/watermark-tile.webp', badge: '/assets/ascan/badge-96.webp' },
    invoicePrefix: 'AS',
    contactEmail: 'hello@axto.io',
  },
};

export const BRAND_ID: BrandId = typeof __BRAND__ !== 'undefined' && __BRAND__ === 'ascan' ? 'ascan' : 'xscan';
export const B: BrandSpec = BRANDS[BRAND_ID];
export const isAscan = BRAND_ID === 'ascan';
