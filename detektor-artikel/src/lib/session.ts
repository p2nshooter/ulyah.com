/** Sesi: cookie __Host- bertanda tangan HMAC. Versi sesi di dokumen user untuk "keluar dari semua perangkat". */
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Env } from '../env.ts';
import { b64url, fromB64url, hmac, timingSafeEqual } from './crypto.ts';
import { Store } from './store.ts';
import { getUser, type User } from '../data/users.ts';
import type { Lang } from './i18n.ts';

export type HonoEnv = { Bindings: Env; Variables: { user: User | null; sess: SessionPayload | null; store: Store } };
export type Ctx = Context<HonoEnv>;

export interface SessionPayload {
  u: string;
  v: number;
  /** 2FA sudah dilewati dalam sesi ini. */
  t: 0 | 1;
  x: number;
}

const COOKIE = '__Host-tl';
const PENDING = '__Host-tl2';
const DAYS = 14;

function secret(env: Env): string {
  if (env.SESSION_SECRET && env.SESSION_SECRET.length >= 16) return env.SESSION_SECRET;
  throw new Error('SESSION_SECRET belum dipasang.');
}

async function sign(env: Env, payload: object): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${body}.${await hmac(secret(env), body)}`;
}

async function verify<T>(env: Env, token: string | undefined): Promise<T | null> {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  if (!timingSafeEqual(await hmac(secret(env), body), mac)) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(fromB64url(body))) as T & { x: number };
    return p.x > Date.now() ? p : null;
  } catch {
    return null;
  }
}

const cookieOpts = (maxAge: number) => ({ path: '/', secure: true, httpOnly: true, sameSite: 'Lax' as const, maxAge });

export async function startSession(c: Ctx, user: User, twoFactor: boolean): Promise<void> {
  const p: SessionPayload = { u: user.id, v: user.sv, t: twoFactor ? 1 : 0, x: Date.now() + DAYS * 86_400_000 };
  setCookie(c, COOKIE, await sign(c.env, p), cookieOpts(DAYS * 86_400));
  deleteCookie(c, PENDING, { path: '/', secure: true });
}

export function endSession(c: Ctx): void {
  deleteCookie(c, COOKIE, { path: '/', secure: true });
  deleteCookie(c, PENDING, { path: '/', secure: true });
}

export async function setPending2fa(c: Ctx, user: User): Promise<void> {
  setCookie(c, PENDING, await sign(c.env, { u: user.id, v: user.sv, x: Date.now() + 10 * 60_000 }), cookieOpts(600));
}

export async function readPending2fa(c: Ctx): Promise<{ u: string; v: number } | null> {
  return verify<{ u: string; v: number }>(c.env, getCookie(c, PENDING));
}

export async function loadSession(c: Ctx): Promise<void> {
  const store = new Store(c.env.DATA);
  c.set('store', store);
  c.set('user', null);
  c.set('sess', null);
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
  c.set('sess', p);
}

/**
 * Bahasa (pemilik, 7 Nov 2026: „pastikan ketika client merubah ke bhs lain, jgn pernah berubah sebelum d rubah manual oleh
 * member di halaman manapun … Hanya Indonesia defoul bahasa Indonesia, jika terdeteksi negara luar pastika defoultnya bahasa
 * inggris“). Urutan: pilihan manual (akun → cookie) → negara pengunjung (Cloudflare `cf-ipcountry`: ID → id, lainnya → en).
 * Pilihan manual hanya berubah lewat /lang (tombol ganti bahasa).
 */
export function chosenLang(c: Ctx): Lang | null {
  const u = c.get('user');
  if (u?.lang) return u.lang;
  const v = getCookie(c, 'tl_lang');
  return v === 'en' || v === 'id' ? v : null;
}

/** Bahasa bawaan menurut negara; null bila negara tidak diketahui (uji lokal, tanpa header Cloudflare). */
export function countryLang(c: Ctx): Lang | null {
  const cc = (c.req.header('cf-ipcountry') ?? '').trim().toUpperCase();
  if (!cc) return null;
  return cc === 'ID' ? 'id' : 'en';
}

/** Crawler mesin pencari dan iklan tidak pernah dialihkan bahasanya: setiap versi bahasa harus bisa diindeks. */
export function isCrawler(c: Ctx): boolean {
  return /bot\b|bot\/|crawl|spider|slurp|mediapartners|adsbot|googlebot|google-inspectiontool|googleother|bingpreview|yandex|baidu|duckduck|facebookexternalhit|embedly|lighthouse|headlesschrome|petalbot|applebot/i.test(c.req.header('user-agent') ?? '');
}

/** Bahasa portal: pilihan manual → negara → Indonesia. */
export function portalLang(c: Ctx): Lang {
  return chosenLang(c) ?? countryLang(c) ?? 'id';
}

export function setLangCookie(c: Ctx, L: Lang): void {
  setCookie(c, 'tl_lang', L, { path: '/', secure: true, sameSite: 'Lax', maxAge: 365 * 86_400 });
}
