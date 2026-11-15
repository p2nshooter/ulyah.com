/** Sesi portal: cookie __Host- bertanda tangan HMAC. Versi sesi di dokumen akun membuat "keluar dari semua perangkat" mungkin. */
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Env } from '../env.ts';
import { b64url, fromB64url, hmac, timingSafeEqual } from './crypto.ts';
import type { Store } from './store.ts';
import { getUser, type User } from '../data/users.ts';

export type HonoEnv = { Bindings: Env; Variables: { store: Store; user: User | null } };
export type Ctx = Context<HonoEnv>;

interface Payload { u: string; v: number; x: number }
const COOKIE = '__Host-yp';
export type { User };
const HARI = 14;

function secret(env: Env): string {
  if (env.SESSION_SECRET && env.SESSION_SECRET.length >= 16) return env.SESSION_SECRET;
  throw new Error('SESSION_SECRET belum dipasang.');
}

export async function startSession(c: Ctx, user: User): Promise<void> {
  const p: Payload = { u: user.id, v: user.sv, x: Date.now() + HARI * 86_400_000 };
  const body = b64url(new TextEncoder().encode(JSON.stringify(p)));
  setCookie(c, COOKIE, `${body}.${await hmac(secret(c.env), body)}`, { path: '/', secure: true, httpOnly: true, sameSite: 'Lax', maxAge: HARI * 86_400 });
}

export function endSession(c: Ctx): void {
  deleteCookie(c, COOKIE, { path: '/', secure: true });
}

/** Membaca sesi: null bila cookie tidak sah, kedaluwarsa, akun nonaktif, atau versi sesi sudah berganti. */
export async function readSession(c: Ctx, store: Store): Promise<User | null> {
  const token = getCookie(c, COOKIE);
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  let ok = false;
  try { ok = timingSafeEqual(await hmac(secret(c.env), body), mac); } catch { return null; }
  if (!ok) return null;
  let p: Payload;
  try { p = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Payload; } catch { return null; }
  if (!p || typeof p.x !== 'number' || p.x < Date.now()) return null;
  const user = await getUser(store, p.u);
  return user && user.aktif && user.sv === p.v ? user : null;
}

/**
 * Penjaga CSRF untuk permintaan yang mengubah data: peramban modern mengirim Sec-Fetch-Site; selain itu Origin harus
 * sama dengan alamat situs. Cookie sesi sendiri SameSite=Lax, jadi ini lapis kedua.
 */
export function asalSama(c: Ctx): boolean {
  const sfs = c.req.header('sec-fetch-site');
  if (sfs) return sfs === 'same-origin' || sfs === 'none';
  const origin = c.req.header('origin');
  if (!origin) return false;
  try { return new URL(origin).host === new URL(c.req.url).host; } catch { return false; }
}
