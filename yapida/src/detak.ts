/**
 * Detak tiap menit (§5c, §5d). Kuota 5 cron akun Cloudflare sudah terpakai, jadi cron `* * * * *` milik Worker
 * detektor-artikel di akun yang sama memanggil entrypoint RPC `Jam.menit()` lewat service binding — jalur ini tidak
 * terbuka ke internet. Setiap tugas berdiri sendiri: satu yang gagal tidak menghentikan yang lain.
 */
import type { Env } from './env.ts';
import { Store } from './lib/store.ts';
import { siapkanBerikut, siaran } from './data/radio.ts';

export async function detak(env: Env, now = Date.now()): Promise<Record<string, string>> {
  const store = new Store(env.DATA);
  const hasil: Record<string, string> = {};
  try {
    const r = await siaran(env, store, now);
    if (r) { await siapkanBerikut(env, store, r.s); hasil.radio = `putaran ${r.s.putaran} surah ${r.s.surah} khatam ${r.s.khatam}`; }
  } catch (err) {
    hasil.radio = `galat: ${err instanceof Error ? err.message : String(err)}`;
  }
  return hasil;
}
