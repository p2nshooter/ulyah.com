/**
 * Dua bahasa (pemilik, 8 Nov 2026: „Pake 2 bahasa aja dulu, Indonesia & Inggris“): antarmuka dan artikel ID/EN.
 * Indonesia di akar, Inggris di bawah /en. Buku tetap dalam bahasa aslinya.
 */
export type Lang = 'id' | 'en';
export type Pair = readonly [string, string];

export const tr = (L: Lang, id: string, en: string): string => (L === 'en' ? en : id);
export const pick = (L: Lang, p: Pair): string => (L === 'en' ? p[1] : p[0]);
export const other = (L: Lang): Lang => (L === 'en' ? 'id' : 'en');

/** Halaman tetap: [Indonesia, Inggris]. */
export const PAGES = {
  home: ['/', '/en'],
  lanes: ['/jalur', '/en/lanes'],
  articles: ['/artikel', '/en/articles'],
  tools: ['/alat', '/en/tools'],
  teachers: ['/untuk-guru', '/en/for-teachers'],
  about: ['/tentang', '/en/about'],
  contact: ['/kontak', '/en/contact'],
  privacy: ['/kebijakan-privasi', '/en/privacy-policy'],
  cookies: ['/kebijakan-cookie', '/en/cookie-policy'],
  terms: ['/syarat-dan-ketentuan', '/en/terms'],
  accessibility: ['/aksesibilitas', '/en/accessibility'],
  licenses: ['/lisensi', '/en/licenses'],
  disclaimer: ['/penafian', '/en/disclaimer'],
  guide: ['/panduan', '/en/guide'],
  search: ['/cari', '/en/search'],
} as const;
export type PageKey = keyof typeof PAGES;
export const P = (L: Lang, k: PageKey): string => (L === 'en' ? PAGES[k][1] : PAGES[k][0]);

export const bookPath = (L: Lang, id: string) => (L === 'en' ? `/en/book/${id}` : `/buku/${id}`);
export const readPath = (L: Lang, id: string, n = 1) => (L === 'en' ? `/en/read/${id}/${n}` : `/baca/${id}/${n}`);
export const lanePath = (L: Lang, slug: Pair) => (L === 'en' ? `/en/lanes/${slug[1]}` : `/jalur/${slug[0]}`);
export const articlePath = (L: Lang, slug: Pair) => (L === 'en' ? `/en/articles/${slug[1]}` : `/artikel/${slug[0]}`);
export const toolPath = (L: Lang, slug: Pair) => (L === 'en' ? `/en/tools/${slug[1]}` : `/alat/${slug[0]}`);

export function fmtNum(L: Lang, n: number): string {
  return new Intl.NumberFormat(L === 'en' ? 'en-US' : 'id-ID').format(n);
}

export function fmtDate(L: Lang, at: number | string): string {
  const d = typeof at === 'number' ? new Date(at) : new Date(`${at}T00:00:00Z`);
  return new Intl.DateTimeFormat(L === 'en' ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

export function minutesLabel(L: Lang, m: number): string {
  if (m < 60) return tr(L, `${m} menit`, `${m} min`);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return L === 'en' ? `${h} h${r ? ` ${r} min` : ''}` : `${h} jam${r ? ` ${r} menit` : ''}`;
}
