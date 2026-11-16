/**
 * Render halaman: konten situs dari R2 dalam bahasa antarmuka + status sesi; header cache sesuai keadaan login.
 * Halaman publik Inggris/Jepang hidup di awalan /en dan /ja: tautan internal di HTML yang dihasilkan diberi awalan secara
 * otomatis (satu tempat, tidak ada yang terlewat), sedangkan portal, akun, admin dan API tetap tanpa awalan (bahasanya
 * mengikuti cookie/akun).
 */
import type { Ctx } from './session.ts';
import { getSite } from '../data/settings.ts';
import { isAdmin } from '../data/users.ts';
import { siteFor } from '../data/model.ts';
import { PREFIX, type Lang } from './i18n.ts';
import { page, type PageOpts } from '../pages/layout.ts';

export const origin = (c: Ctx) => (c.env.CANONICAL_HOST ? `https://${c.env.CANONICAL_HOST}` : new URL(c.req.url).origin);
/** Jalur publik dalam bahasa L: '/' → '/en/', '/harga' → '/en/harga'; Indonesia tanpa awalan. */
export const pathFor = (L: Lang, path: string): string => (L === 'id' ? path : `${PREFIX[L]}${path === '/' ? '/' : path}`);
/** Asal + awalan bahasa untuk URL halaman publik (kanonik, JSON-LD). */
export const base = (c: Ctx) => origin(c) + PREFIX[c.get('lang')];

/** Jalur yang tidak pernah diberi awalan bahasa (bukan halaman publik atau bukan HTML). */
const NO_PREFIX = /^\/(assets\/|api\/|portal|admin|masuk|daftar|keluar|lupa-sandi|favicon|manifest\.webmanifest|sw\.js|robots\.txt|sitemap\.xml|ads\.txt|en\/|ja\/|en"|ja")/;
export const isPublicPath = (path: string): boolean => !NO_PREFIX.test(`${path}"`);

/** Beri awalan bahasa pada setiap href="/..." dan action="/..." halaman publik di HTML yang sudah jadi. */
export function localizeLinks(htmlText: string, L: Lang): string {
  if (L === 'id') return htmlText;
  const pre = PREFIX[L];
  return htmlText.replace(/ (href|action)="(\/[^"]*)"/g, (m, attr: string, path: string) => (isPublicPath(path) ? ` ${attr}="${pre}${path === '/' ? '/' : path}"` : m));
}

export async function render(c: Ctx, o: Omit<PageOpts, 'origin' | 'site' | 'lang' | 'user'> & { site?: PageOpts['site'] }, status: 200 | 400 | 401 | 403 | 404 | 429 = 200): Promise<Response> {
  const L = c.get('lang');
  const site = siteFor(o.site ?? (await getSite(c.get('store'))), L);
  const u = c.get('user');
  const bodyText = page({ ...o, path: pathFor(L, o.path), barePath: o.path, origin: origin(c), site, lang: L, user: u ? { name: u.name, admin: isAdmin(u) } : null, noindex: o.noindex || !c.env.CANONICAL_HOST, alternates: !o.noindex && isPublicPath(o.path) });
  const body = localizeLinks(bodyText, L);
  const cache = status === 200 && !u && !o.noindex ? 'public, max-age=60' : 'private, no-store';
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': cache, 'content-language': L, vary: 'Cookie' } });
}
