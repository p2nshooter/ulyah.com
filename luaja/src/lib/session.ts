/** Sesi: cookie __Host- bertanda tangan HMAC. Versi sesi di dokumen user untuk "keluar dari semua perangkat". */
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Env } from '../env.ts';
import { b64url, fromB64url, hmac, timingSafeEqual } from './crypto.ts';
import { Store } from './store.ts';
import { getSubs, getUser } from '../data/users.ts';
import type { Subs, User } from '../data/model.ts';
import { isLang, type Lang } from './i18n.ts';

export type HonoEnv = { Bindings: Env; Variables: { user: User | null; subs: Subs; store: Store; lang: Lang; /** Bahasa dari cookie/akun (sebelum awalan URL). */ langPref: Lang | null } };
export type Ctx = Context<HonoEnv>;

interface SessionPayload {
  u: string;
  v: number;
  x: number;
}

const COOKIE = '__Host-lj';
const DAYS = 30;

function secret(env: Env): string {
  if (env.SESSION_SECRET && env.SESSION_SECRET.length >= 16) return env.SESSION_SECRET;
  throw new Error('SESSION_SECRET belum dipasang.');
}

async function sign(env: Env, payload: object): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${body}.${await hmac(secret(env), body)}`;
}

async function verify<T extends { x: number }>(env: Env, token: string | undefined): Promise<T | null> {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  if (!timingSafeEqual(await hmac(secret(env), body), mac)) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(fromB64url(body))) as T;
    return p.x > Date.now() ? p : null;
  } catch {
    return null;
  }
}

const cookieOpts = (maxAge: number) => ({ path: '/', secure: true, httpOnly: true, sameSite: 'Lax' as const, maxAge });

export async function startSession(c: Ctx, user: User): Promise<void> {
  const p: SessionPayload = { u: user.id, v: user.sv, x: Date.now() + DAYS * 86_400_000 };
  setCookie(c, COOKIE, await sign(c.env, p), cookieOpts(DAYS * 86_400));
}

export function endSession(c: Ctx): void {
  deleteCookie(c, COOKIE, { path: '/', secure: true });
}

/** Token CSRF sederhana: HMAC dari id user + hari; formulir POST portal/admin menyertakannya. */
export async function csrfToken(c: Ctx, user: User): Promise<string> {
  return (await hmac(secret(c.env), `csrf:${user.id}:${user.sv}`)).slice(0, 24);
}

export async function csrfOk(c: Ctx, user: User, token: string | undefined): Promise<boolean> {
  return Boolean(token) && timingSafeEqual(await csrfToken(c, user), token!);
}

export async function loadSession(c: Ctx): Promise<void> {
  const store = new Store(c.env.DATA);
  c.set('store', store);
  c.set('user', null);
  c.set('subs', {});
  const ui = getCookie(c, 'lj_lang');
  c.set('lang', isLang(ui) ? ui : 'id');
  c.set('langPref', isLang(ui) ? ui : null);
  let p: SessionPayload | null = null;
  try {
    p = await verify<SessionPayload>(c.env, getCookie(c, COOKIE));
  } catch {
    p = null;
  }
  if (!p) return;
  const user = await getUser(store, p.u);
  if (!user || user.sv !== p.v || user.suspended) return;
  c.set('user', user);
  // Pilihan bahasa yang tersimpan di akun mengikuti member ke perangkat mana pun.
  if (isLang(user.ui)) { c.set('lang', user.ui); c.set('langPref', user.ui); }
  c.set('subs', await getSubs(store, user.id));
}

export function setLangCookie(c: Ctx, L: Lang): void {
  setCookie(c, 'lj_lang', L, { path: '/', secure: true, sameSite: 'Lax', maxAge: 365 * 86_400 });
}
