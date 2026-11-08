/**
 * Notifikasi portal admin (pemilik, 8 Nov 2026: „buatkan notifikasi jika ada pembayaran masuk yg belum di cek, atau ada yg
 * baru di setiap menu masing2, misal ada member baru dll keluarkan notifnya“).
 *
 * - Pesanan: jumlah bukti transfer yang MENUNGGU dicek (antrean `i/order-review/`) — hilang hanya setelah disetujui/ditolak.
 * - Anggota, laporan, pencairan afiliasi: jumlah yang BARU sejak admin terakhir membuka menu itu.
 * „Terakhir dibuka“ disimpan per admin di satu dokumen R2 (`u/admin-seen/{uid}.json`), diperbarui dengan CAS.
 */
import { invTs, type Store } from '../lib/store.ts';

export type SeenKey = 'members' | 'reports' | 'payouts';
export interface AdminSeen { members?: number; reports?: number; payouts?: number }
export interface AdminBadges { orders: number; members: number; reports: number; payouts: number; total: number }

const seenKey = (uid: string) => `u/admin-seen/${uid}.json`;
const MAX = 99;

/** Banyaknya entri indeks terbalik-waktu (`{prefix}{invTs}~id`) yang lebih baru dari `since`. */
async function newerThan(store: Store, prefix: string, since: number): Promise<number> {
  const edge = invTs(since);
  const { items } = await store.list(prefix, { limit: MAX + 1 });
  let n = 0;
  for (const it of items) {
    const ts = it.key.slice(prefix.length).split('~')[0] ?? '';
    if (ts < edge) n += 1;
    else break; // urut terbaru dulu: sisanya lebih lama
  }
  return Math.min(n, MAX);
}

export async function adminBadges(store: Store, uid: string, now = Date.now()): Promise<AdminBadges> {
  const seen = (await store.get<AdminSeen>(seenKey(uid))) ?? {};
  // Admin baru: hitung mulai 7 hari terakhir, bukan sejak awal situs.
  const base = now - 7 * 86_400_000;
  const [review, members, reports, payouts] = await Promise.all([
    store.list('i/order-review/', { limit: MAX + 1 }),
    newerThan(store, 'i/users/', seen.members ?? base),
    newerThan(store, 'i/reports/', seen.reports ?? base),
    newerThan(store, 'i/payouts/', seen.payouts ?? base),
  ]);
  const orders = Math.min(review.items.length, MAX);
  return { orders, members, reports, payouts, total: orders + members + reports + payouts };
}

export async function markSeen(store: Store, uid: string, key: SeenKey, now = Date.now()): Promise<void> {
  await store.cas<AdminSeen>(seenKey(uid), (cur) => ({ ...(cur ?? {}), [key]: now }));
}

/** Menu admin → kunci „terakhir dibuka“ yang ditandai saat menu itu dibuka. */
export const SEEN_BY_PATH: Record<string, SeenKey> = { '/admin/anggota': 'members', '/admin/laporan': 'reports', '/admin/afiliasi': 'payouts' };
