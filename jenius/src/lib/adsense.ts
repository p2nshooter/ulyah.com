/**
 * AdSense jenius.es (docs/JENIUS-BLUEPRINT.md §11; docs/ADSENSE-BLUEPRINT.md §23): akun utama
 * ca-pub-6146217038829045 (satu-satunya loader) + akun tumpukan dari adsense-stack.json di akar repo — satu tag meta dan
 * satu baris ads.txt per akun. Urutan & isi diperiksa uji unit terhadap adsense-stack.json.
 * Iklan hanya di halaman dewasa (beranda, artikel, alat, panduan, guru); pembaca buku dan halaman anak tanpa loader.
 */
export const ADSENSE_CLIENT = 'ca-pub-6146217038829045';
export const ADSENSE_STACK = [
  'ca-pub-9915280882234592',
  'ca-pub-9354298681597606',
  'ca-pub-6560360898389273',
  'ca-pub-5928074389292014',
  'ca-pub-1480130604232181',
  'ca-pub-5092800160376210',
  'ca-pub-7250589269548267',
  'ca-pub-6381187608934514',
  'ca-pub-4304267428455702',
  'ca-pub-6293576511807510',
  'ca-pub-9221781326457936',
  'ca-pub-4906992051458194',
  'ca-pub-9433622530024776',
  'ca-pub-6146217038829045',
  'ca-pub-2493615451319531',
  'ca-pub-5693981744147503',
  'ca-pub-8212039662308316',
  'ca-pub-4504974645924459',
  'ca-pub-6284085719914185',
  'ca-pub-7345352440829958',
  'ca-pub-5254913739159445',
  'ca-pub-6701063918838796',
];
export const ADSENSE_ACCOUNTS: readonly string[] = [...new Set([ADSENSE_CLIENT, ...ADSENSE_STACK])];
export const ADS_TXT = `${ADSENSE_ACCOUNTS.map((a) => `google.com, ${a.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`).join('\n')}\n`;
export const ADSENSE_METAS = ADSENSE_ACCOUNTS.map((a) => `<meta name="google-adsense-account" content="${a}">`).join('\n');
export const ADSENSE_LOADER = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`;
