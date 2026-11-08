/**
 * Menghitung ulang rekap member dari catatan yang tidak pernah dihapus (pemeriksaan, sesi, pesanan, buku besar, log komisi)
 * — untuk data sebelum rekap ada (8 Nov 2026) dan sebagai tombol „Hitung ulang“ di Admin → Token & laba. Setiap kejadian yang
 * dihitung diberi penanda sekali-pakai yang sama dengan penambahan harian, jadi kejadian berikutnya tidak terhitung ganda.
 */
import type { Store } from '../lib/store.ts';
import { checkKey, type CheckDoc } from '../engine/cascade.ts';
import { orderKey, currencyOf, isDeposit, type Order } from './orders.ts';
import { getUser } from './users.ts';
import { emptyStats, statsKey, type MemberStats } from './stats.ts';

async function each<T>(xs: T[], n: number, fn: (x: T) => Promise<void>): Promise<void> {
  for (let k = 0; k < xs.length; k += n) await Promise.all(xs.slice(k, k + n).map(fn));
}

async function listAll(store: Store, prefix: string, max = 20_000): Promise<{ key: string; id: string }[]> {
  const out: { key: string; id: string }[] = [];
  let cursor: string | undefined;
  do {
    const r = await store.list(prefix, { limit: 1000, cursor });
    out.push(...r.items.map((i) => ({ key: i.key, id: i.id })));
    cursor = r.cursor;
  } while (cursor && out.length < max);
  return out;
}

export async function rebuildStats(store: Store, uid: string, now = Date.now()): Promise<MemberStats> {
  const s = emptyStats();
  const once: string[] = [];
  const seen = (at: number) => {
    s.firstAt = Math.min(s.firstAt ?? at, at);
    s.lastAt = Math.max(s.lastAt ?? at, at);
  };
  // Pemeriksaan (dokumen pemeriksaan tidak pernah dihapus).
  await each(await listAll(store, `i/user-checks/${uid}/`), 32, async (it) => {
    const d = await store.get<CheckDoc>(checkKey(it.id));
    if (!d || d.bench || (d.stage !== 'done' && d.stage !== 'failed')) return;
    const done = d.stage === 'done';
    s.checks += done ? 1 : 0;
    s.freeChecks += done && d.free ? 1 : 0;
    s.tokensUsed += done && d.reserve && 'tokens' in d.reserve ? d.charged ?? 0 : 0;
    s.costUsd += d.cost || 0;
    s.freeCostUsd += d.free ? d.cost || 0 : 0;
    s.savedUsd += done ? d.reuse?.savedUsd ?? 0 : 0;
    seen(d.createdAt);
    once.push(`chk:${d.id}`);
  });
  // Sesi lomba/kelas yang sudah diselesaikan: token sesi yang dipotong.
  await each(await listAll(store, `i/user-batches/${uid}/`), 32, async (it) => {
    const b = await store.get<{ reservedTokens?: number; refundedTokens?: number; settled?: boolean; createdAt: number }>(`c/batches/${it.id}.json`);
    if (!b?.settled || !b.reservedTokens) return;
    s.tokensUsed += Math.max(0, b.reservedTokens - (b.refundedTokens ?? 0));
    seen(b.createdAt);
    once.push(`batch:${it.id}`);
  });
  // Pesanan lunas: uang masuk, token dibeli, komisi afiliasi (dari log komisi pereferensinya).
  const user = await getUser(store, uid);
  const commissions = new Map<string, number>();
  if (user?.ref) {
    for (const it of await listAll(store, `l/aff/${user.ref}/`, 5000)) {
      const e = await store.get<{ kind: string; idr: number; note: string }>(it.key);
      const m = e?.kind === 'commission' ? /pesanan (\S+)/.exec(e.note) : null;
      if (m) commissions.set(m[1]!, (commissions.get(m[1]!) ?? 0) + e!.idr);
    }
  }
  await each(await listAll(store, `i/user-orders/${uid}/`), 32, async (it) => {
    const o = await store.get<Order>(orderKey(it.id));
    if (!o || o.status !== 'credited') return;
    if (currencyOf(o) === 'USD') s.paidUsd += o.priceUsd;
    else s.paidIdr += o.priceIdr;
    if (!isDeposit(o)) s.tokensBought += o.tokens;
    else s.depositTopupIdr += o.priceIdr;
    seen(o.createdAt);
    once.push(`ord:${o.id}`);
    const com = commissions.get(o.id) ?? 0;
    if (com > 0) {
      s.commissionIdr += com;
      once.push(`com:${o.id}`);
    }
  });
  // Deposit yang ditukar menjadi token (buku besar: pembelian yang bukan invoice dan bukan tukar komisi).
  for (const it of await listAll(store, `l/ledger/${uid}/`)) {
    const e = await store.get<{ at: number; kind: string; tokens: number; note: string }>(it.key);
    if (!e || e.kind !== 'purchase' || e.tokens <= 0 || /^Invoice /.test(e.note) || /^Tukar komisi/.test(e.note)) continue;
    s.tokensBought += e.tokens;
    s.tokensFromDeposit += e.tokens;
  }
  // Rupiah deposit yang ditukar (buku besar deposit: beli paket / tukar token).
  for (const it of await listAll(store, `l/dep/${uid}/`)) {
    const e = await store.get<{ kind: string; idr: number }>(it.key);
    if (e && (e.kind === 'buy' || e.kind === 'convert') && e.idr < 0) s.depositToTokensIdr += -e.idr;
  }
  for (const k of Object.keys(s) as (keyof MemberStats)[]) {
    if (typeof s[k] === 'number' && k !== 'v') (s[k] as number) = Math.round((s[k] as number) * 1e6) / 1e6;
  }
  s.rebuiltAt = now;
  await each(once, 32, async (k) => { await store.createOnce(`u/stats-once/${k}`, { at: now, rebuilt: true }); });
  await store.put(statsKey(uid), s);
  return s;
}
