/**
 * Tugas terjadwal (Cron Triggers):
 *  - tiap menit: lanjutkan pemeriksaan yang ditinggal (tab ditutup) + selesaikan token sesi lomba;
 *  - 02.00 WIB: hapus teks yang masa simpannya habis, pembersihan otomatis 90 hari (naskah & unggahan member; riwayat tetap),
 *    lalu backup harian ke bucket privat (35 hari).
 */
import type { Env } from './env.ts';
import { Store } from './lib/store.ts';
import { advance, checkKey, settleCheck, type CheckDoc } from './engine/cascade.ts';
import { settleBatch } from './routes/checks.ts';
import { wibDate } from './data/settings.ts';
import { runPurge, archiveCheck } from './data/purge.ts';
import { repairDepositOps } from './data/deposit.ts';

/** Pemeriksaan yang belum selesai 2 jam setelah dibuat dihentikan oleh sweep (token/kuota kembali utuh). */
export const CHECK_DEADLINE_MS = 2 * 3600_000;

export async function sweep(env: Env, maxSteps = 4): Promise<number> {
  const store = new Store(env.DATA);
  const { items } = await store.list<{ uid: string; at: number }>('i/active/', { limit: 100 });
  let steps = 0;
  const now = Date.now();
  for (const it of items) {
    if (steps >= maxSteps) break;
    const doc = await store.get<CheckDoc>(checkKey(it.id));
    if (!doc) {
      await store.del(it.key);
      continue;
    }
    if (doc.stage === 'done' || doc.stage === 'failed') {
      // Penyelesaian yang sempat terputus diulang di sini (idempoten).
      await settleCheck(env, store, doc);
      if (doc.batchId) await settleBatch(env, store, doc.batchId);
      continue;
    }
    // Hanya yang ditinggal: tidak ada sewa aktif dan tidak berubah 90 detik terakhir.
    if (doc.lease > now || now - doc.updatedAt < 90_000) continue;
    // Batas waktu total (MASTER-BLUEPRINT §9.5, §21): lebih dari 2 jam belum selesai → dihentikan, seluruh token/kuota kembali.
    if (now - doc.createdAt > CHECK_DEADLINE_MS) {
      const failed = await store.cas<CheckDoc>(checkKey(doc.id), (cur) =>
        cur && cur.stage !== 'done' && cur.stage !== 'failed' && cur.lease <= Date.now()
          ? { ...cur, stage: 'failed', lease: 0, error: { code: 'timeout', msg: 'Pemeriksaan melewati batas waktu 2 jam dan dihentikan. Token Anda dikembalikan utuh.' }, updatedAt: Date.now() }
          : null,
      );
      if (failed && failed.stage === 'failed') {
        await settleCheck(env, store, failed);
        if (failed.batchId) await settleBatch(env, store, failed.batchId);
      }
      continue;
    }
    const after = await advance(env, doc.id);
    steps += 1;
    if (after?.batchId && (after.stage === 'done' || after.stage === 'failed')) await settleBatch(env, store, after.batchId);
  }
  // Sesi lomba yang belum diselesaikan (tab ditutup): selesaikan token begitu semua naskah tuntas.
  const { items: open } = await store.list('i/open-batches/', { limit: 50 });
  for (const b of open) await settleBatch(env, store, b.id);
  // Pembelian token dari deposit yang terputus di tengah: selesaikan ke depan (idempoten).
  await repairDepositOps(store);
  return steps;
}

export async function runBackup(env: Env, manual = false): Promise<void> {
  const store = new Store(env.DATA);
  const state = (await store.get<{ last: number }>('k/backup-state.json')) ?? { last: 0 };
  const date = wibDate();
  let copied = 0;
  let error: string | undefined;
  try {
    if (!env.BACKUPS) throw new Error('Binding BACKUPS belum dipasang.');
    let cursor: string | undefined;
    do {
      const res = await env.DATA.list({ cursor, limit: 1000 });
      for (const o of res.objects) {
        if (o.uploaded.getTime() <= state.last) continue;
        const obj = await env.DATA.get(o.key);
        if (!obj) continue;
        await env.BACKUPS.put(`${date}/${o.key}`, obj.body, { httpMetadata: obj.httpMetadata, customMetadata: obj.customMetadata });
        copied += 1;
      }
      cursor = res.truncated ? res.cursor : undefined;
    } while (cursor);
    // Simpan 35 hari: hapus folder tanggal yang lebih lama.
    const cutoff = wibDate(Date.now() - 35 * 86_400_000);
    const top = await env.BACKUPS.list({ delimiter: '/', limit: 1000 });
    for (const prefix of top.delimitedPrefixes) {
      const d = prefix.replace(/\/$/, '');
      if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d < cutoff) {
        let c2: string | undefined;
        do {
          const old = await env.BACKUPS.list({ prefix, cursor: c2, limit: 1000 });
          if (old.objects.length) await env.BACKUPS.delete(old.objects.map((x) => x.key));
          c2 = old.truncated ? old.cursor : undefined;
        } while (c2);
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  await store.put('k/backup-state.json', { at: Date.now(), date, copied, ok: !error, error, last: error ? state.last : Date.now(), manual });
}

/** Hapus teks naskah yang masa simpannya (pilihan member) habis; riwayat, angka laporan & kode verifikasi tetap. */
export async function retention(env: Env): Promise<number> {
  const store = new Store(env.DATA);
  const today = wibDate();
  let purged = 0;
  for await (const k of store.keys('i/expiry/')) {
    const m = /^i\/expiry\/(\d{4}-\d{2}-\d{2})\/([^~]+)~(.+)$/.exec(k.key);
    if (!m) continue;
    if (m[1]! > today) break;
    const [, , checkId, reportId] = m as unknown as [string, string, string, string];
    await archiveCheck(store, checkId, reportId);
    await store.del(k.key);
    purged += 1;
  }
  return purged;
}

export async function scheduled(event: ScheduledController, env: Env): Promise<void> {
  if (event.cron === '* * * * *') {
    await sweep(env);
    return;
  }
  await retention(env);
  await runPurge(env);
  await runBackup(env);
}

export { checkKey };
