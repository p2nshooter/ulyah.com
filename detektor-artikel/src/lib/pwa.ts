/**
 * Aplikasi terpasang di HP (PWA) — pemilik, 8 Nov 2026: „Buatkan agar xscan dan ascan bisa di install di HP dengan logo
 * gambar HP di paling atas, jika sudah d install hilangkan logonya“. Merek (nama, ikon, warna) dari src/brand.ts.
 *
 * Service worker hanya menyimpan aset statis (/assets/) dan satu halaman luring. Halaman portal, API, laporan, dan apa pun
 * yang berisi data member TIDAK pernah disimpan di cache perangkat.
 */
import { B } from '../brand.ts';

/**
 * Versi aset statis: dinaikkan setiap kali app.css/app.js berubah. Service worker menyimpan aset cache-first, jadi tanpa
 * versi baru perangkat yang sudah memasang aplikasi tidak pernah menerima tampilan/skrip baru.
 */
export const ASSET_V = '20261108d';
export const SW_VERSION = `v-${ASSET_V}`;

export function manifest(lang: 'id' | 'en'): string {
  return JSON.stringify({
    id: '/',
    name: `${B.host} — ${B.tagline}`,
    short_name: B.host,
    description: lang === 'en' ? 'Check writing for AI, grade it with rubrics and print verifiable reports.' : 'Periksa tulisan dari AI, nilai dengan rubrik, dan cetak laporan yang bisa diverifikasi.',
    lang,
    start_url: '/app?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: B.themeColor,
    icons: [
      { src: B.icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: B.icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: B.icon512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  });
}

/** Service worker: aset statis cache-first, navigasi selalu ke jaringan dengan halaman luring sebagai cadangan. */
export function serviceWorker(): string {
  const precache = ['/offline', `/assets/app.css?v=${ASSET_V}`, `/assets/app.js?v=${ASSET_V}`, B.icon192, B.favicon32];
  return `const C = 'pwa-${B.id}-${SW_VERSION}';
const PRE = ${JSON.stringify(precache)};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => caches.match('/offline'))); return; }
  if (u.pathname.startsWith('/assets/')) {
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(C).then((c) => c.put(r, copy)); } return res; })));
  }
});
`;
}
