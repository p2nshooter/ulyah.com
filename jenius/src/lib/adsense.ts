/**
 * AdSense jenius.es (docs/JENIUS-BLUEPRINT.md §11; docs/ADSENSE-BLUEPRINT.md §23): akun utama
 * ca-pub-6560360898389273 (satu-satunya loader; 22 Nov 2026: hanya 3 akun tersisa) + akun tumpukan dari adsense-stack.json di akar repo — satu tag meta dan
 * satu baris ads.txt per akun. Urutan & isi diperiksa uji unit terhadap adsense-stack.json.
 * Iklan hanya di halaman dewasa (beranda, artikel, alat, panduan, guru); pembaca buku dan halaman anak tanpa loader.
 */
export const ADSENSE_CLIENT = 'ca-pub-6560360898389273';
export const ADSENSE_STACK = [
  'ca-pub-6560360898389273',
  'ca-pub-4906992051458194',
  'ca-pub-5928074389292014',
  'ca-pub-6701063918838796',
];
export const ADSENSE_ACCOUNTS: readonly string[] = [...new Set([ADSENSE_CLIENT, ...ADSENSE_STACK])];
export const ADS_TXT = `${ADSENSE_ACCOUNTS.map((a) => `google.com, ${a.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`).join('\n')}\n`;
export const ADSENSE_METAS = ADSENSE_ACCOUNTS.map((a) => `<meta name="google-adsense-account" content="${a}">`).join('\n');
export const ADSENSE_LOADER = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`;
