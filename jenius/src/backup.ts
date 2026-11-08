/**
 * Cadangan harian ke bucket privat jenius-backups, disimpan 35 hari (docs/R2-DATA-BLUEPRINT.md §3).
 * Bertahap: hanya objek yang berubah sejak cadangan terakhir. Isi buku (b/), gambar buku (m/) dan antrean impor (q/)
 * tidak dicadangkan karena bisa diimpor ulang dari sumber terbukanya; akun, kelas, dan dokumen sistem selalu dicadangkan.
 */
import type { Env } from './env.ts';
import { Store } from './lib/store.ts';

const SKIP = ['b/', 'm/', 'q/'];
const wibDate = (ms = Date.now()) => new Date(ms + 7 * 3600_000).toISOString().slice(0, 10);

export async function runBackup(env: Env, now = Date.now()): Promise<{ ok: boolean; copied: number; error?: string }> {
  const store = new Store(env.DATA);
  const state = (await store.get<{ last: number }>('k/backup-state.json')) ?? { last: 0 };
  const date = wibDate(now);
  let copied = 0;
  let error: string | undefined;
  try {
    if (!env.BACKUPS) throw new Error('Binding BACKUPS belum dipasang.');
    let cursor: string | undefined;
    do {
      const res = await env.DATA.list({ cursor, limit: 1000 });
      for (const o of res.objects) {
        if (SKIP.some((p) => o.key.startsWith(p)) || o.key === 'k/backup-state.json') continue;
        if (o.uploaded.getTime() <= state.last) continue;
        const obj = await env.DATA.get(o.key);
        if (!obj) continue;
        await env.BACKUPS.put(`${date}/${o.key}`, obj.body, { httpMetadata: obj.httpMetadata, customMetadata: obj.customMetadata });
        copied += 1;
      }
      cursor = res.truncated ? res.cursor : undefined;
    } while (cursor);
    const cutoff = wibDate(now - 35 * 86_400_000);
    const top = await env.BACKUPS.list({ delimiter: '/', limit: 1000 });
    for (const prefix of top.delimitedPrefixes) {
      const d = prefix.replace(/\/$/, '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d >= cutoff) continue;
      let c2: string | undefined;
      do {
        const old = await env.BACKUPS.list({ prefix, cursor: c2, limit: 1000 });
        if (old.objects.length) await env.BACKUPS.delete(old.objects.map((x) => x.key));
        c2 = old.truncated ? old.cursor : undefined;
      } while (c2);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  await store.put('k/backup-state.json', { at: now, date, copied, ok: !error, error, last: error ? state.last : now });
  return { ok: !error, copied, error };
}
