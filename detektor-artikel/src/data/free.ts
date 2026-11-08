/**
 * Kuota gratis member (pemilik, 7 Nov 2026; docs/MASTER-BLUEPRINT.md §20). Semua angka dari `k/free.json` (getFree).
 *
 * - Satu „halaman normal“ diukur dari TEKS, bukan dari berkas: maks. kata, karakter, atau token per halaman — mana yang
 *   tercapai lebih dulu. Teks tersembunyi dan karakter tak terlihat sudah dibuang oleh preprocess sebelum dihitung di
 *   sini (hitungan memakai teks yang sama dengan yang dikirim ke model).
 * - Pemakaian per periode disimpan di satu dokumen per member per periode (`free/{uid}/{periode}.json`), diubah dengan
 *   compare-and-swap: dua pemeriksaan bersamaan tidak bisa memakai sisa kuota yang sama.
 * - Periode memakai zona waktu situs: minggu = Senin 00.00, bulan = tanggal 1 00.00.
 */
import type { Store } from '../lib/store.ts';
import type { FreeSettings } from './settings.ts';

/** Perkiraan token masukan dari karakter: 1 token per 3,5 karakter (sedikit lebih ketat dari rata-rata Indonesia/Inggris). */
const CHARS_PER_TOKEN = 3.5;

export interface PageCount {
  pages: number;
  words: number;
  chars: number;
  tokens: number;
}

const wordsOf = (t: string) => (t.match(/\S+/g) ?? []).length;

/** Jumlah halaman normal sebuah teks (minimal 1). */
export function normalPages(text: string, f: FreeSettings): PageCount {
  const t = text.replace(/\s+/g, ' ').trim();
  const words = wordsOf(t);
  const chars = t.length;
  const tokens = Math.ceil(chars / CHARS_PER_TOKEN);
  const pages = Math.max(1, Math.ceil(words / f.wordsPerPage), Math.ceil(chars / f.charsPerPage), Math.ceil(tokens / f.tokensPerPage));
  return { pages, words, chars, tokens };
}

/**
 * Bagian awal teks yang muat dalam `n` halaman normal, dipotong di batas paragraf; paragraf yang terlalu panjang dipotong
 * di batas kata. Dipakai untuk pilihan „periksa N halaman pertama gratis“ — laporan menandainya sebagai sebagian.
 */
export function firstPages(text: string, n: number, f: FreeSettings): string {
  const paras = text.replace(/\r\n?/g, '\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of paras) {
    const next = [...out, p].join('\n\n');
    if (normalPages(next, f).pages <= n) {
      out.push(p);
      continue;
    }
    // Paragraf ini tidak muat utuh: ambil kata demi kata sampai batas.
    const words = p.split(/\s+/);
    let lo = 0;
    let hi = words.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (normalPages([...out, words.slice(0, mid).join(' ')].join('\n\n'), f).pages <= n) lo = mid;
      else hi = mid - 1;
    }
    if (lo > 0) out.push(words.slice(0, lo).join(' '));
    break;
  }
  return out.join('\n\n');
}

/* ── periode dalam zona waktu situs ─────────────────────────────────────────────────────────────────────────────── */

function wall(ms: number, tz: string): { y: number; m: number; d: number; dow: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }).formatToParts(new Date(ms));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { y: Number(get('year')), m: Number(get('month')), d: Number(get('day')), dow };
}

/** Selisih zona waktu (ms) pada saat `ms`: waktu dinding − UTC. */
function offsetMs(ms: number, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(new Date(ms));
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second')) - Math.floor(ms / 1000) * 1000;
}

/** Epoch UTC dari tengah malam tanggal dinding (y, m, d) di zona `tz`. */
function midnight(y: number, m: number, d: number, tz: string): number {
  const guess = Date.UTC(y, m - 1, d);
  return guess - offsetMs(guess - offsetMs(guess, tz), tz);
}

export interface Period {
  /** Kunci dokumen pemakaian: `w-YYYY-MM-DD` (Senin) atau `m-YYYY-MM`. */
  key: string;
  startAt: number;
  resetAt: number;
}

export function periodOf(f: FreeSettings, now = Date.now()): Period {
  const w = wall(now, f.resetTz);
  const pad = (x: number) => String(x).padStart(2, '0');
  if (f.period === 'month') {
    const startAt = midnight(w.y, w.m, 1, f.resetTz);
    const ny = w.m === 12 ? w.y + 1 : w.y;
    const nm = w.m === 12 ? 1 : w.m + 1;
    return { key: `m-${w.y}-${pad(w.m)}`, startAt, resetAt: midnight(ny, nm, 1, f.resetTz) };
  }
  const back = (w.dow + 6) % 7; // hari sejak Senin
  const mon = new Date(Date.UTC(w.y, w.m - 1, w.d - back));
  const startAt = midnight(mon.getUTCFullYear(), mon.getUTCMonth() + 1, mon.getUTCDate(), f.resetTz);
  const next = new Date(Date.UTC(w.y, w.m - 1, w.d - back + 7));
  return {
    key: `w-${mon.getUTCFullYear()}-${pad(mon.getUTCMonth() + 1)}-${pad(mon.getUTCDate())}`,
    startAt,
    resetAt: midnight(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), f.resetTz),
  };
}

/* ── pemakaian per member per periode ───────────────────────────────────────────────────────────────────────────── */

export interface FreeUsage {
  used: number;
  /** checkId → halaman yang dipakai (untuk dikembalikan bila pemeriksaan gagal). */
  checks: Record<string, number>;
}

const usageKey = (uid: string, key: string) => `free/${uid}/${key}.json`;

export async function freeStatus(store: Store, uid: string, f: FreeSettings, now = Date.now()): Promise<{ used: number; remaining: number; period: Period }> {
  const period = periodOf(f, now);
  const u = await store.get<FreeUsage>(usageKey(uid, period.key));
  const used = u?.used ?? 0;
  return { used, remaining: f.enabled ? Math.max(0, f.pages - used) : 0, period };
}

export class FreeQuotaError extends Error {
  constructor(readonly remaining: number) {
    super('free quota');
  }
}

/** Memakai `pages` halaman gratis secara atomik; gagal bila sisa tidak cukup. Idempoten per checkId. */
export async function reserveFreePages(store: Store, uid: string, f: FreeSettings, pages: number, checkId: string, now = Date.now()): Promise<{ periodKey: string; remaining: number }> {
  const period = periodOf(f, now);
  let remaining = 0;
  await store.cas<FreeUsage>(
    usageKey(uid, period.key),
    (cur) => {
      const u: FreeUsage = cur ?? { used: 0, checks: {} };
      if (u.checks[checkId] !== undefined) {
        remaining = Math.max(0, f.pages - u.used);
        return u; // sudah dipesan (klik ganda)
      }
      if (!f.enabled || u.used + pages > f.pages) throw new FreeQuotaError(Math.max(0, f.pages - u.used));
      remaining = f.pages - u.used - pages;
      return { used: u.used + pages, checks: { ...u.checks, [checkId]: pages } };
    },
    'Kuota gratis',
  );
  return { periodKey: period.key, remaining };
}

/** Mengembalikan halaman gratis sebuah pemeriksaan yang gagal (idempoten). */
export async function releaseFreePages(store: Store, uid: string, periodKey: string, checkId: string): Promise<void> {
  await store.cas<FreeUsage>(
    usageKey(uid, periodKey),
    (cur) => {
      if (!cur || cur.checks[checkId] === undefined) return null; // tidak ada yang dikembalikan, tidak menulis
      const { [checkId]: back, ...rest } = cur.checks;
      return { used: Math.max(0, cur.used - (back ?? 0)), checks: rest };
    },
    'Kuota gratis',
  );
}

/* ── anti-curang ────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Domain e-mail sekali pakai yang paling umum: akun dengan e-mail ini tidak mendapat kuota gratis. */
export const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com', '10minutemail.com', 'temp-mail.org',
  'tempmail.com', 'tempmail.net', 'yopmail.com', 'yopmail.net', 'trashmail.com', 'getnada.com', 'dispostable.com',
  'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'tempail.com',
  'tempr.email', 'discard.email', 'mailnesia.com', 'spamgourmet.com', 'moakt.com', 'burnermail.io', 'inboxkitten.com',
]);

export function isDisposable(email: string): boolean {
  const d = email.split('@')[1]?.toLowerCase().trim() ?? '';
  return DISPOSABLE_DOMAINS.has(d);
}

/** Maks. akun berbeda per jaringan + perangkat yang mendapat kuota gratis dalam satu periode. */
export const MAX_FREE_ACCOUNTS_PER_NETWORK = 2;

/**
 * Apakah akun ini boleh memakai kuota gratis dari jaringan ini pada periode ini. Jaringan = hash bergaram dari IP /24
 * (IPv4) atau /48 (IPv6) + user-agent; tidak ada IP mentah yang disimpan. Penanda dibuat sekali per akun (createOnce).
 */
export async function networkAllows(store: Store, uid: string, netHash: string, periodKey: string): Promise<boolean> {
  const prefix = `i/free-net/${periodKey}/${netHash}/`;
  const { items } = await store.list(prefix, { limit: MAX_FREE_ACCOUNTS_PER_NETWORK + 2 });
  if (items.some((it) => it.id === uid)) return true;
  if (items.length >= MAX_FREE_ACCOUNTS_PER_NETWORK) return false;
  await store.createOnce(`${prefix}${uid}`, {}, { at: Date.now() });
  return true;
}

/** Bagian jaringan dari sebuah IP: /24 untuk IPv4, /48 untuk IPv6. */
export function networkOf(ip: string): string {
  if (ip.includes(':')) return ip.split(':').slice(0, 3).join(':');
  return ip.split('.').slice(0, 3).join('.');
}
