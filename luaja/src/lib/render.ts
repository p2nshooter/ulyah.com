/** Render halaman: konten situs dari R2 + status sesi; header cache sesuai keadaan login. */
import type { Ctx } from './session.ts';
import { getSite } from '../data/settings.ts';
import { isAdmin } from '../data/users.ts';
import { page, type PageOpts } from '../pages/layout.ts';

export const origin = (c: Ctx) => (c.env.CANONICAL_HOST ? `https://${c.env.CANONICAL_HOST}` : new URL(c.req.url).origin);

export async function render(c: Ctx, o: Omit<PageOpts, 'origin' | 'site' | 'lang' | 'user'> & { site?: PageOpts['site'] }, status: 200 | 400 | 401 | 403 | 404 | 429 = 200): Promise<Response> {
  const site = o.site ?? (await getSite(c.get('store')));
  const u = c.get('user');
  const body = page({ ...o, origin: origin(c), site, lang: c.get('lang'), user: u ? { name: u.name, admin: isAdmin(u) } : null, noindex: o.noindex || !c.env.CANONICAL_HOST });
  const cache = status === 200 && !u && !o.noindex ? 'public, max-age=60' : 'private, no-store';
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': cache } });
}
