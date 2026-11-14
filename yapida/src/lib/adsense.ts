/**
 * AdSense yapida.sch.id (pemilik, 14 Nov 2026: „kode adsense make yg tumpuk yg sudah ada“; docs/ADSENSE-BLUEPRINT.md §23).
 * Sumber tunggal: adsense-stack.json di akar repo — dibaca langsung saat build, jadi tidak ada salinan yang bisa berbeda.
 * Setiap akun tumpukan mendapat satu tag meta dan satu baris ads.txt; tepat SATU loader per halaman (akun utama domain).
 * Auto ads saja, tanpa unit manual. Portal, halaman masuk, dan halaman baca/latihan jenjang anak tidak memuat loader.
 */
import STACK from '../../../adsense-stack.json';

export const DOMAIN = 'yapida.sch.id';
const primary = (STACK.primary as Record<string, string>)[DOMAIN];
if (!primary) throw new Error(`adsense-stack.json belum memuat akun utama ${DOMAIN}`);
export const ADSENSE_CLIENT: string = primary;
export const ADSENSE_ACCOUNTS: readonly string[] = [...new Set([ADSENSE_CLIENT, ...(STACK.stack as string[])])];
export const ADS_TXT = `${ADSENSE_ACCOUNTS.map((a) => `google.com, ${a.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`).join('\n')}\n`;
export const ADSENSE_METAS = ADSENSE_ACCOUNTS.map((a) => `<meta name="google-adsense-account" content="${a}">`).join('\n');
export const ADSENSE_LOADER = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`;
