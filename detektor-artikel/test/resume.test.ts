/**
 * MASTER-BLUEPRINT §30 (pemilik, 8 Nov 2026: „Limit habis tetep terpotong, gagal tetep terpotong tp pekerjaan bisa d
 * lanjutkan jika deposit lagi atau membeli token lagi“): tagihan kerja yang sudah selesai, penyelesaian per putaran,
 * dan „Lanjutkan“ dengan saldo penuh / sebagian / kurang.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/lib/store.ts';
import { FakeR2 } from './fake-r2.ts';
import { consumedTokens, dueOnStop, settleCheck, checkKey, textKey, type CheckDoc } from '../src/engine/cascade.ts';
import { resumeCheck, ResumeError } from '../src/routes/checks.ts';
import { credit, balanceOf, reserve } from '../src/data/wallet.ts';
import { getBilling, getEngine } from '../src/data/settings.ts';
import { rateCard, lineTokens } from '../src/engine/pricing.ts';
import { seal } from '../src/lib/crypto.ts';
import { userKey, type User } from '../src/data/users.ts';
import type { Env } from '../src/env.ts';

const MASTER = 'k'.repeat(48);
const kv = { get: async () => null, put: async () => undefined, delete: async () => undefined };

async function setup(balance: number) {
  const r2 = new FakeR2();
  const store = new Store(r2);
  const env = { DATA: r2, MASTER_KEY: MASTER, RL: kv } as unknown as Env;
  const user = { id: 'u1', role: 'member', email: 'a@contoh.id', name: 'A', tier: 3 } as unknown as User;
  await store.put(userKey('u1'), user);
  if (balance) await credit(store, 'u1', balance, 'admin', 'saldo awal', 'seed');
  const text = Array.from({ length: 40 }, (_, i) => `Kalimat nomor ${i} tentang literasi digital dan kebiasaan membaca.`).join(' ');
  await store.put(textKey('c1'), await seal(MASTER, { raw: text }));
  const billing = await getBilling(store);
  const eng = await getEngine(store);
  // Dua panggilan AI tahap pertama sudah selesai (log per panggilan).
  await store.put('l/cu/c1/0001', { tier: 't1-a', model: eng.models.t1, in: 1500, out: 900, cacheRead: 0, cost: 0.003 });
  await store.put('l/cu/c1/0002', { tier: 't1-b', model: eng.models.t1, in: 1500, out: 900, cacheRead: 0, cost: 0.003 });
  const rate = rateCard(billing, eng)[eng.models.t1]!;
  const used = Math.round(2 * lineTokens(rate, 1500, 900, 0) * 100) / 100;
  return { r2, store, env, user, billing, eng, used };
}

function stoppedDoc(over: Partial<CheckDoc> = {}): CheckDoc {
  const now = Date.now();
  return {
    id: 'c1', uid: 'u1', createdAt: now, updatedAt: now, title: 'Uji', author: '', genre: 'general', level: 'unknown', reportLang: 'id',
    rubricId: null, mode: 'auto', stage: 'failed', attempts: 1, lease: 0, reserved: 0, cost: 0.006, words: 400,
    error: { code: 'stopped', msg: 'dihentikan' }, resume: { stage: 't2', reason: 'failed', at: now }, ...over,
  } as CheckDoc;
}

test('§30: pemakaian AI dihitung dari log per panggilan dengan tarif publik', async () => {
  const { store, billing, eng, used } = await setup(0);
  assert.equal(await consumedTokens(store, 'c1', billing, eng), used);
  assert.equal(await consumedTokens(store, 'tidak-ada', billing, eng), 0);
});

test('§30: tagihan saat terhenti = kerja yang selesai, tidak pernah melebihi pesanan; Cek Gratis & admin 0', async () => {
  const { store, eng, used } = await setup(0);
  const all = Math.ceil(used);
  assert.equal(await dueOnStop(store, stoppedDoc({ reserve: { tokens: 500 } as never, reserved: 500 }), eng), all);
  assert.equal(await dueOnStop(store, stoppedDoc({ reserve: { tokens: 1 } as never, reserved: 1 }), eng), 1, 'dibatasi pesanan');
  assert.equal(await dueOnStop(store, stoppedDoc({ reserve: { tokens: 500 } as never, reserved: 500, billed: all }), eng), 0, 'yang sudah dibayar tidak ditagih ulang');
  assert.equal(await dueOnStop(store, stoppedDoc({ reserve: { batch: true } }), eng), all, 'sesi: dari pesanan sesi');
  assert.equal(await dueOnStop(store, stoppedDoc({ reserve: { none: true } }), eng), 0);
  assert.equal(await dueOnStop(store, stoppedDoc({ reserve: { tokens: 500 } as never, reserved: 500, free: { pages: 1, periodKey: 'w' } }), eng), 0);
});

test('§30: penyelesaian terhenti menagih kerja yang selesai, sisanya kembali — sekali saja', async () => {
  const { store, env, used } = await setup(1000);
  const res = await reserve(store, 'u1', 300, 'Pesan c1', 'c1');
  assert.equal(await balanceOf(store, 'u1'), 700);
  const due = Math.ceil(used);
  const doc = stoppedDoc({ reserve: res, reserved: 300, charged: due, billed: due });
  await store.put(checkKey('c1'), doc);
  await settleCheck(env, store, doc);
  await settleCheck(env, store, doc);
  assert.equal(await balanceOf(store, 'u1'), 1000 - due, 'hanya kerja yang selesai yang terpotong');
});

test('§30: Lanjutkan memesan sisa pekerjaan dan meneruskan dari tahap yang terhenti', async () => {
  const { store, env, user, used } = await setup(2000);
  const due = Math.ceil(used);
  await store.put(checkKey('c1'), stoppedDoc({ billed: due, reserve: { tokens: 300 } as never, reserved: 300, charged: due }));
  const after = await resumeCheck(env, store, user, 'c1', 'id');
  assert.equal(after.stage, 't2');
  assert.equal(after.round, 1);
  assert.ok(!after.resume && !after.error && !after.partial);
  assert.ok(after.reserved > 0 && after.costPrev === 0.006 && after.charged === undefined);
  assert.equal(await balanceOf(store, 'u1'), 2000 - after.reserved);
  assert.ok(await store.get('i/active/c1'), 'kembali ke antrean aktif');
  await assert.rejects(resumeCheck(env, store, user, 'c1', 'id'), (e: ResumeError) => e.status === 409);
  // Putaran 1 selesai: pengembalian memakai kunci putaran sendiri (tidak bentrok dengan putaran 0).
  const done = { ...after, stage: 'done' as const, charged: 5, tokens: due + 5 };
  await settleCheck(env, store, done);
  await settleCheck(env, store, done);
  assert.equal(await balanceOf(store, 'u1'), 2000 - 5);
});

test('§30: saldo kurang → pesanan sebagian (dijeda lagi bila habis); saldo tidak cukup → 402, saldo utuh', async () => {
  const a = await setup(0);
  await a.store.put(checkKey('c1'), stoppedDoc({ reserve: { tokens: 300 } as never, reserved: 300, charged: 0, billed: 0 }));
  const owed = Math.ceil(a.used);
  await credit(a.store, 'u1', owed, 'admin', 'kurang', 'few');
  await assert.rejects(resumeCheck(a.env, a.store, a.user, 'c1', 'id'), (e: ResumeError) => e.status === 402 && e.code === 'no_tokens');
  assert.equal(await balanceOf(a.store, 'u1'), owed, 'tidak ada yang terpotong');
  await credit(a.store, 'u1', 3, 'admin', 'tambah', 'few2');
  const after = await resumeCheck(a.env, a.store, a.user, 'c1', 'id');
  assert.ok(after.partial && after.reserved === owed + 3 && after.stage === 't2');
  assert.equal(await balanceOf(a.store, 'u1'), 0);
});

test('§30: hanya pemiliknya, hanya yang bisa dilanjutkan, dan naskahnya masih ada', async () => {
  const { store, env, user } = await setup(500);
  await store.put(checkKey('c1'), stoppedDoc({ uid: 'lain' }));
  await assert.rejects(resumeCheck(env, store, user, 'c1', 'id'), (e: ResumeError) => e.status === 404);
  await store.put(checkKey('c1'), stoppedDoc({ resume: undefined }));
  await assert.rejects(resumeCheck(env, store, user, 'c1', 'id'), (e: ResumeError) => e.status === 409);
  await store.put(checkKey('c1'), stoppedDoc());
  await store.del(textKey('c1'));
  await assert.rejects(resumeCheck(env, store, user, 'c1', 'id'), (e: ResumeError) => e.status === 410 && e.code === 'gone');
  assert.equal(await balanceOf(store, 'u1'), 500);
});
