/* Batas waktu total pemeriksaan (MASTER-BLUEPRINT §9.5, §21): yang macet lebih dari 2 jam dihentikan oleh sweep dan
 * seluruh token yang dipesan kembali; yang masih di bawah batas tidak disentuh. Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/lib/store.ts';
import { FakeR2 } from './fake-r2.ts';
import { sweep, CHECK_DEADLINE_MS } from '../src/cron.ts';
import { checkKey, type CheckDoc } from '../src/engine/cascade.ts';
import { credit, reserve, balanceOf } from '../src/data/wallet.ts';

function stuck(id: string, ageMs: number, extra: Partial<CheckDoc> = {}): CheckDoc {
  const t = Date.now() - ageMs;
  return {
    id, uid: 'u1', createdAt: t, updatedAt: t, title: 'x', author: '', genre: 'essay', level: 'unknown', reportLang: 'id', rubricId: null,
    mode: 'auto', stage: 't2', lease: 0, attempts: 0, cost: 0, reserved: 0, reserve: { none: true }, ...extra,
  } as unknown as CheckDoc;
}

test('sweep: pemeriksaan macet > 2 jam dihentikan dan token pesanannya kembali utuh', async () => {
  const r2 = new FakeR2();
  const store = new Store(r2 as never);
  const env = { DATA: r2 } as never;
  await credit(store, 'u1', 500, 'admin', 'uji', 'seed-1');
  const res = await reserve(store, 'u1', 120, 'pesan', 'chk_old');
  assert.equal(await balanceOf(store, 'u1'), 380);
  await store.put(checkKey('chk_old'), stuck('chk_old', CHECK_DEADLINE_MS + 60_000, { reserved: 120, reserve: res as never }));
  await store.put('i/active/chk_old', {});
  await store.put(checkKey('chk_new'), stuck('chk_new', 10 * 60_000, { lease: Date.now() + 300_000 }));
  await store.put('i/active/chk_new', {});
  await sweep(env);
  const old = await store.get<CheckDoc>(checkKey('chk_old'));
  assert.equal(old?.stage, 'failed');
  assert.equal(old?.error?.code, 'timeout');
  assert.equal(await balanceOf(store, 'u1'), 500, 'seluruh pesanan kembali');
  assert.equal((await store.get<CheckDoc>(checkKey('chk_new')))?.stage, 't2', 'yang masih berjalan tidak disentuh');
  await sweep(env);
  assert.equal(await balanceOf(store, 'u1'), 500, 'sweep berulang tidak mengembalikan dua kali');
});
