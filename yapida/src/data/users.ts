/**
 * Akun portal di R2. Masuk dengan memilih nama akun dari daftar dan mengetik PIN 5 angka di papan angka bergambar yang
 * posisinya diacak setiap kali (pemilik, 15 Nov 2026). Enam peran berjenjang (docs/YAPIDA-BLUEPRINT.md §3): super admin
 * mengelola semuanya; peran lembaga hanya lembaganya.
 *
 * PIN 5 angka hanya 100.000 kemungkinan, jadi:
 *  - disimpan sebagai PBKDF2-SHA256 (100.000 iterasi) atas HMAC(PIN, rahasia server) — salinan R2 saja tidak cukup untuk
 *    menebaknya;
 *  - lima kali salah → akun terkunci 15 menit, lalu 30, 60, … sampai 24 jam (penghitung di dokumen akun);
 *  - batas laju per alamat IP di depan (KV).
 */
import type { Store } from '../lib/store.ts';
import { invTs } from '../lib/store.ts';
import { b64url, fromB64url, hmac, newId, timingSafeEqual } from '../lib/crypto.ts';
import { slugify } from '../lib/text.ts';

export type Peran = 'super' | 'ketua' | 'yayasan' | 'kepala' | 'lembaga' | 'kontributor';

export const PERAN: Record<Peran, { nama: string; tingkat: number; lingkup: 'semua' | 'lembaga'; ket: string }> = {
  super: { nama: 'Super Admin', tingkat: 100, lingkup: 'semua', ket: 'Mengelola seluruh situs, semua lembaga, semua akun, dan pengaturan teknis.' },
  ketua: { nama: 'Ketua Yayasan', tingkat: 80, lingkup: 'semua', ket: 'Profil yayasan dan isi semua lembaga: menyunting, menayangkan, menurunkan.' },
  yayasan: { nama: 'Admin Yayasan', tingkat: 70, lingkup: 'semua', ket: 'Isi tingkat yayasan dan semua lembaga, serta akun lembaga.' },
  kepala: { nama: 'Kepala Lembaga', tingkat: 50, lingkup: 'lembaga', ket: 'Profil, struktur, guru, dan semua isi lembaganya; akun kontributor lembaganya.' },
  lembaga: { nama: 'Admin Lembaga', tingkat: 40, lingkup: 'lembaga', ket: 'Mengisi dan menayangkan isi lembaganya.' },
  kontributor: { nama: 'Kontributor', tingkat: 20, lingkup: 'lembaga', ket: 'Guru atau ustadz: menulis draf yang ditinjau admin lembaga.' },
};
export const URUTAN_PERAN: Peran[] = ['super', 'ketua', 'yayasan', 'kepala', 'lembaga', 'kontributor'];
export const isPeran = (v: unknown): v is Peran => typeof v === 'string' && v in PERAN;

export interface User {
  id: string;
  /** Nama akun yang tampil di daftar masuk, mis. "Admin MI Al Huda". Unik. */
  nama: string;
  peran: Peran;
  /** Slug lembaga yang dikelola (peran lingkup lembaga). */
  units: string[];
  pin: string;
  /** Versi sesi: naik saat PIN diganti atau akun dinonaktifkan → semua sesi lama gugur. */
  sv: number;
  wajibGanti: boolean;
  aktif: boolean;
  buat: number;
  gagal: number;
  kunciKe: number;
  kunciSampai: number;
  masukTerakhir?: number;
}

export const userKey = (id: string) => `c/users/${id}.json`;
const namaGuard = (nama: string) => `u/akun/${slugify(nama, 60) || 'akun'}`;
export const PIN_RE = /^\d{5}$/;

export const tingkat = (u: Pick<User, 'peran'>) => PERAN[u.peran].tingkat;
export const lingkupSemua = (u: Pick<User, 'peran'>) => PERAN[u.peran].lingkup === 'semua';

/** Boleh mengelola lembaga ini? Peran yayasan: semua (termasuk tingkat yayasan). Peran lembaga: hanya lembaganya. */
export function bolehUnit(u: Pick<User, 'peran' | 'units'>, unit: string): boolean {
  if (lingkupSemua(u)) return true;
  return unit !== 'yayasan' && u.units.includes(unit);
}

/** Boleh menayangkan (bukan hanya menulis draf)? */
export const bolehTayang = (u: Pick<User, 'peran'>) => tingkat(u) >= PERAN.lembaga.tingkat;

/** Boleh mengelola akun `target`? Hanya peran di bawahnya; kepala lembaga hanya kontributor lembaganya sendiri. */
export function bolehKelolaAkun(aktor: Pick<User, 'peran' | 'units' | 'id'>, target: Pick<User, 'peran' | 'units' | 'id'>): boolean {
  if (aktor.id === target.id) return false;
  if (aktor.peran === 'super') return true;
  if (tingkat(aktor) <= tingkat(target)) return false;
  if (aktor.peran === 'ketua' || aktor.peran === 'yayasan') return true;
  if (aktor.peran === 'kepala') return target.peran === 'kontributor' && target.units.length > 0 && target.units.every((x) => aktor.units.includes(x));
  return false;
}

export function peranYangBolehDiberi(aktor: Pick<User, 'peran'>): Peran[] {
  if (aktor.peran === 'super') return URUTAN_PERAN;
  if (aktor.peran === 'ketua' || aktor.peran === 'yayasan') return URUTAN_PERAN.filter((p) => PERAN[p].tingkat < tingkat(aktor));
  if (aktor.peran === 'kepala') return ['kontributor'];
  return [];
}

/* ── PIN ────────────────────────────────────────────────────────────────── */

const enc = new TextEncoder();
const ITER = 100_000;

async function pbkdf2(input: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(input), 'PBKDF2', false, ['deriveBits']);
  return b64url(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256));
}

export async function hashPin(pin: string, pepper: string): Promise<string> {
  if (!PIN_RE.test(pin)) throw new Error('PIN harus 5 angka.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pin1$${ITER}$${b64url(salt)}$${await pbkdf2(await hmac(pepper, `pin:${pin}`), salt)}`;
}

export async function cocokPin(pin: string, stored: string, pepper: string): Promise<boolean> {
  const [alg, , salt, hash] = stored.split('$');
  if (alg !== 'pin1' || !salt || !hash || !PIN_RE.test(pin)) return false;
  return timingSafeEqual(await pbkdf2(await hmac(pepper, `pin:${pin}`), fromB64url(salt)), hash);
}

/** PIN acak untuk akun baru / atur ulang. Menghindari PIN yang mudah ditebak (semua sama, berurutan). */
export function pinAcak(): string {
  for (;;) {
    const r = crypto.getRandomValues(new Uint32Array(1))[0]! & 0x1ffff;
    if (r >= 100_000) continue;
    const p = String(r).padStart(5, '0');
    if (pinLemah(p)) continue;
    return p;
  }
}

export function pinLemah(p: string): boolean {
  if (/^(\d)\1{4}$/.test(p)) return true;
  const naik = '01234567890', turun = '98765432109';
  return naik.includes(p) || turun.includes(p) || ['12345', '54321', '11111', '00000', '12321', '11223'].includes(p);
}

/* ── kunci setelah salah berulang ───────────────────────────────────────── */

export const MAKS_SALAH = 5;
export const lamaKunci = (ke: number) => Math.min(24 * 60, 15 * 2 ** Math.max(0, ke)) * 60_000;

/* ── baca & tulis ───────────────────────────────────────────────────────── */

export async function getUser(store: Store, id: string): Promise<User | null> {
  return /^usr_[0-9A-Z]{20}$/.test(id) ? store.get<User>(userKey(id)) : null;
}

export class NamaTerpakai extends Error {}

export interface UserItem { id: string; nama: string; peran: Peran; units: string[]; aktif: boolean }
const ringkas = (u: User) => ({ n: u.nama, p: u.peran, u: u.units, a: u.aktif });
const ixKey = (u: Pick<User, 'buat' | 'id'>) => `i/users/${invTs(u.buat)}~${u.id}`;

export async function createUser(store: Store, input: { nama: string; peran: Peran; units?: string[]; pin: string; pepper: string; wajibGanti?: boolean; id?: string }): Promise<User> {
  const nama = input.nama.replace(/\s+/g, ' ').trim().slice(0, 60);
  if (nama.length < 3) throw new Error('Nama akun minimal 3 huruf.');
  const id = input.id ?? newId('usr');
  if (!(await store.createOnce(namaGuard(nama), { id }))) {
    const g = await store.get<{ id: string }>(namaGuard(nama));
    if (g?.id !== id) throw new NamaTerpakai(`Nama akun „${nama}“ sudah dipakai.`);
  }
  const user: User = {
    id, nama, peran: input.peran, units: PERAN[input.peran].lingkup === 'lembaga' ? [...new Set(input.units ?? [])] : [],
    pin: await hashPin(input.pin, input.pepper), sv: 1, wajibGanti: input.wajibGanti ?? true, aktif: true, buat: Date.now(), gagal: 0, kunciKe: 0, kunciSampai: 0,
  };
  await store.put(userKey(id), user);
  await store.put(ixKey(user), {}, ringkas(user));
  return user;
}

/** Ubah akun (CAS). Mengganti nama memindahkan penjaga nama unik. */
export async function updateUser(store: Store, id: string, fn: (u: User) => User | null): Promise<User | null> {
  const lama = await getUser(store, id);
  if (!lama) return null;
  const next = await store.cas<User>(userKey(id), (cur) => (cur ? fn(cur) : null), 'Akun');
  if (!next) return null;
  if (next.nama !== lama.nama && slugify(next.nama, 60) !== slugify(lama.nama, 60)) {
    if (!(await store.createOnce(namaGuard(next.nama), { id }))) {
      await store.cas<User>(userKey(id), (cur) => (cur ? { ...cur, nama: lama.nama } : null), 'Akun');
      throw new NamaTerpakai(`Nama akun „${next.nama}“ sudah dipakai.`);
    }
    await store.del(namaGuard(lama.nama));
  }
  await store.put(ixKey(next), {}, ringkas(next));
  return next;
}

export async function listUsers(store: Store): Promise<UserItem[]> {
  const r = await store.list<{ n: string; p: Peran; u: string[]; a: boolean }>('i/users/', { limit: 1000 });
  return r.items.filter((x) => x.meta.n).map((x) => ({ id: x.id, nama: x.meta.n, peran: x.meta.p, units: x.meta.u ?? [], aktif: x.meta.a !== false }));
}

export type HasilMasuk = { ok: true; user: User } | { ok: false; alasan: 'tidak-ada' | 'nonaktif' | 'terkunci' | 'salah'; sisa?: number; sampai?: number };

/** Memeriksa PIN dan mencatat percobaan yang salah di dokumen akun. */
export async function masuk(store: Store, id: string, pin: string, pepper: string, now = Date.now()): Promise<HasilMasuk> {
  const u = await getUser(store, id);
  if (!u) return { ok: false, alasan: 'tidak-ada' };
  if (!u.aktif) return { ok: false, alasan: 'nonaktif' };
  if (u.kunciSampai > now) return { ok: false, alasan: 'terkunci', sampai: u.kunciSampai };
  if (await cocokPin(pin, u.pin, pepper)) {
    const next = await store.cas<User>(userKey(id), (cur) => (cur ? { ...cur, gagal: 0, kunciKe: 0, kunciSampai: 0, masukTerakhir: now } : null), 'Akun');
    return { ok: true, user: next ?? u };
  }
  let hasil: HasilMasuk = { ok: false, alasan: 'salah' };
  await store.cas<User>(userKey(id), (cur) => {
    if (!cur) return null;
    const gagal = cur.gagal + 1;
    if (gagal >= MAKS_SALAH) {
      const sampai = now + lamaKunci(cur.kunciKe);
      hasil = { ok: false, alasan: 'terkunci', sampai };
      return { ...cur, gagal: 0, kunciKe: cur.kunciKe + 1, kunciSampai: sampai };
    }
    hasil = { ok: false, alasan: 'salah', sisa: MAKS_SALAH - gagal };
    return { ...cur, gagal };
  }, 'Akun');
  return hasil;
}
