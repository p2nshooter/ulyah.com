/**
 * Pembersihan otomatis 90 hari (pemilik, 2 Nov 2026: „seluruh hasil kerja client atau upload client akan di bersihkan
 * otomatis setiap 90 hari“), dipersempit 8 Nov 2026: „member saja yg d hapus, tp history member jgn pernah d hapus“ ·
 * „Hasil kerja member history nya jgn di hapus, berikan saja penanda dr tgl dll yg pernah d kerjakan member“
 * (docs/MASTER-BLUEPRINT.md §27).
 *
 * Saat sesuatu dibuat, satu entri jadwal ditulis (create-once) di `i/purge90/<tanggal hapus WIB>/<jenis>~<id>`.
 * Cron harian memproses semua tanggal ≤ hari ini dan menghapus HANYA isi naskah & berkas member:
 *  - c (pemeriksaan): teks naskah, tahap AI, rincian per kalimat (memuat teks) — laporan diberi penanda `purgedAt`;
 *  - b (sesi lomba/kelas): sidik jari kemiripan (turunan teks) — sesi & rekap angkanya tetap;
 *  - p (bukti transfer): berkasnya dihapus; ringkasan pembayaran tetap di invoice (catatan keuangan).
 * Yang TIDAK pernah dihapus: riwayat hasil kerja (daftar laporan, judul, tanggal, mesin, persen, label, nilai, token, kode
 * verifikasi, catatan, sesi), akun, saldo & buku besar, pesanan & invoice, log biaya, dan hasil tersimpan perusahaan (§26).
 */
import type { Env } from '../env.ts';
import { Store } from '../lib/store.ts';
import { wibDate } from './settings.ts';
import { checkKey, reportKey, textKey, type CheckDoc, type ReportSummary } from '../engine/cascade.ts';
import { orderKey, type Order } from './orders.ts';
import { PURGE_DAYS } from './policy.ts';

export { PURGE_DAYS };
const DAY = 86_400_000;

export function purgeDate(createdAt: number): string {
  return wibDate(createdAt + PURGE_DAYS * DAY);
}

export async function schedulePurge(store: Store, kind: 'c' | 'b' | 'p', id: string, createdAt: number): Promise<void> {
  await store.createOnce(`i/purge90/${purgeDate(createdAt)}/${kind}~${id}`, {});
}

/** Menghapus isi naskah satu pemeriksaan dan memberi penanda arsip pada laporannya. Riwayat tetap. Aman diulang. */
export async function archiveCheck(store: Store, checkId: string, reportId?: string, now = Date.now()): Promise<void> {
  const del: string[] = [textKey(checkId)];
  for await (const k of store.keys(`c/checks/${checkId}/`)) del.push(k.key);
  await store.del(del);
  if (reportId) await store.cas<ReportSummary>(reportKey(reportId), (r) => (r && (!r.purged || !r.purgedAt) ? { ...r, enc: undefined, purged: true, purgedAt: r.purgedAt ?? now } : null));
}

async function purgeCheck(store: Store, id: string): Promise<boolean> {
  const doc = await store.get<CheckDoc>(checkKey(id));
  // Pemeriksaan yang (sangat tidak mungkin) masih berjalan dilewati; dicoba lagi besok.
  if (doc && doc.stage !== 'done' && doc.stage !== 'failed' && doc.lease > Date.now()) return false;
  await archiveCheck(store, id, doc?.reportId);
  if (doc) await store.del([`i/active/${id}`, `i/user-active/${doc.uid}/${id}`]);
  return true;
}

async function purgeBatch(store: Store, id: string): Promise<boolean> {
  const b = await store.get<{ uid: string; createdAt: number; settled?: boolean }>(`c/batches/${id}.json`);
  // Sesi yang tokennya belum diselesaikan dilewati dulu (cron tiap menit menyelesaikannya).
  if (b && !b.settled && (await store.get(`i/open-batches/${id}`))) return false;
  const del: string[] = [];
  for await (const k of store.keys(`c/fp/${id}/`)) del.push(k.key);
  await store.del(del);
  if (b) await store.cas<{ purgedAt?: number }>(`c/batches/${id}.json`, (cur) => (cur && !cur.purgedAt ? { ...cur, purgedAt: Date.now() } : null));
  return true;
}

async function purgeProofs(env: Env, store: Store, orderId: string): Promise<boolean> {
  const o = await store.get<Order>(orderKey(orderId));
  if (!o?.proofs?.length) return true;
  const files = o.proofs.filter((p) => !p.purged).map((p) => p.key);
  if (files.length) await env.DATA.delete(files);
  await store.cas<Order>(orderKey(orderId), (cur) => (cur?.proofs?.some((p) => !p.purged) ? { ...cur, proofs: cur.proofs.map((p) => ({ ...p, purged: true })) } : null));
  return true;
}

export interface PurgeResult {
  checks: number;
  batches: number;
  proofs: number;
}

/** Proses semua jadwal yang jatuh tempo (≤ hari ini, WIB). Aman diulang. */
export async function runPurge(env: Env, now = Date.now(), budget = 2000): Promise<PurgeResult> {
  const store = new Store(env.DATA);
  const today = wibDate(now);
  const out: PurgeResult = { checks: 0, batches: 0, proofs: 0 };
  let n = 0;
  for await (const k of store.keys('i/purge90/')) {
    const m = /^i\/purge90\/(\d{4}-\d{2}-\d{2})\/([cbp])~(.+)$/.exec(k.key);
    if (!m) {
      await store.del(k.key);
      continue;
    }
    if (m[1]! > today || n >= budget) break;
    n += 1;
    const [, , kind, id] = m as unknown as [string, string, 'c' | 'b' | 'p', string];
    const ok = kind === 'c' ? await purgeCheck(store, id) : kind === 'b' ? await purgeBatch(store, id) : await purgeProofs(env, store, id);
    if (!ok) continue;
    if (kind === 'c') out.checks += 1;
    else if (kind === 'b') out.batches += 1;
    else out.proofs += 1;
    await store.del(k.key);
  }
  await store.put('k/purge-state.json', { at: now, ...out });
  return out;
}
