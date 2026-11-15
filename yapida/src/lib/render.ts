/** Merender halaman publik: pengaturan situs dan daftar lembaga selalu ikut (kepala, menu, kaki, pita siaran langsung). */
import type { Ctx } from './session.ts';
import { getSitus, listHalaman, listUnits } from '../data/site.ts';
import { page, type PageOpts } from '../pages/layout.ts';
import { tidakAdaPage } from '../pages/public.ts';
import { urlBerkas } from '../data/media.ts';

export const origin = (c: Ctx) => (c.env.CANONICAL_HOST ? `https://${c.env.CANONICAL_HOST}` : new URL(c.req.url).origin);
export const media = (c: Ctx) => (f: string | undefined | null) => urlBerkas(c.env, f);
/** Versi kecil sebuah foto (unggahan selalu menyertakan salinan 640 px berakhiran _k.jpg). */
export const kecil = (f: string | undefined | null) => (f && /\.jpg$/.test(f) && !f.endsWith('_k.jpg') ? f.replace(/\.jpg$/, '_k.jpg') : f ?? '');

export async function render(c: Ctx, o: Omit<PageOpts, 'origin' | 'situs' | 'units' | 'kakiHalaman'>, status: 200 | 201 | 400 | 404 | 429 = 200): Promise<Response> {
  const store = c.get('store');
  const [situs, units, halaman] = await Promise.all([getSitus(store), listUnits(store), listHalaman(store)]);
  const kakiHalaman = halaman.filter((h) => h.kaki && h.unit === 'yayasan').map(({ slug, judul }) => ({ slug, judul }));
  const body = page({ ...o, origin: origin(c), situs, units, kakiHalaman, noindex: o.noindex || !c.env.CANONICAL_HOST });
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': status === 200 && !o.noStore ? 'public, max-age=60' : 'no-store' } });
}

export const tidakAda = (c: Ctx) => render(c, { path: new URL(c.req.url).pathname, title: 'Halaman tidak ditemukan — Yayasan Al-Huda Yapida', desc: 'Halaman yang Anda cari tidak ada.', body: tidakAdaPage(), noindex: true, noAds: true }, 404);
