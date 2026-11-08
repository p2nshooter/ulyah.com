/* Router mesin + kendali biaya (docs/MASTER-BLUEPRINT.md §8, §9.5; file pemilik „Xscan“ §6): termurah yang mampu,
 * model yang dimatikan tidak pernah dipakai, Fable hanya bila dinyalakan dan tidak untuk naskah rahasia, batas belanja.
 * Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/lib/store.ts';
import { FakeR2 } from './fake-r2.ts';
import { DEFAULT_ENGINE } from '../src/data/settings.ts';
import { DEFAULT_CONTROLS, normalizeControls, addMemberDay, SpendLimitError } from '../src/data/controls.ts';
import { applyRouter, cheapestCapable } from '../src/engine/router.ts';

const eng = () => structuredClone(DEFAULT_ENGINE);
const ctl = (x: Partial<typeof DEFAULT_CONTROLS> = {}) => normalizeControls({ ...DEFAULT_CONTROLS, ...x });

test('router: bawaan = Haiku → Sonnet → Opus (termurah yang mampu per tingkat)', () => {
  const r = applyRouter(eng(), ctl());
  assert.deepEqual(r.eng.models, { t1: 'claude-haiku-5-5', t2: 'claude-sonnet-5-5', t3: 'claude-opus-5-5' });
  assert.deepEqual(r.blocked, []);
  assert.ok(r.notes.every((n) => n.reason === 'configured'));
});

test('router: Fable 5.1 lebih mahal dari Opus → tidak pernah dipilih untuk tingkat 3, mati bawaan', () => {
  assert.equal(cheapestCapable(eng(), ctl({ fableEnabled: true }), 3), 'claude-opus-5-5');
  assert.equal(cheapestCapable(eng(), ctl(), 4), null, 'tingkat banding mati bila Fable tidak dinyalakan');
  assert.equal(cheapestCapable(eng(), ctl({ fableEnabled: true }), 4), 'claude-fable-5-1');
  assert.equal(cheapestCapable(eng(), ctl({ fableEnabled: true }), 4, true), null, 'naskah rahasia tidak dikirim ke Fable (retensi 30 hari)');
});

test('router: model yang dimatikan diganti termurah yang mampu, bukan yang lebih lemah', () => {
  const r = applyRouter(eng(), ctl({ disabledModels: ['claude-sonnet-5-5'] }));
  assert.equal(r.eng.models.t2, 'claude-opus-5-5');
  assert.equal(r.notes.find((n) => n.tier === 't2')?.reason, 'disabled');
  const none = applyRouter(eng(), ctl({ disabledModels: ['claude-sonnet-5-5', 'claude-opus-5-5'] }));
  assert.deepEqual(none.blocked, ['t2', 't3'], 'tanpa model mampu → ditolak, tidak turun ke Haiku');
  const fable = applyRouter(eng(), ctl({ disabledModels: ['claude-sonnet-5-5', 'claude-opus-5-5'], fableEnabled: true }));
  assert.deepEqual([fable.eng.models.t2, fable.eng.models.t3], ['claude-fable-5-1', 'claude-fable-5-1']);
});

test('router: harga dari Admin menentukan — otomatis memilih yang lebih murah, manual mengikuti pilihan admin', () => {
  const e = eng();
  e.prices['claude-opus-5-5'] = { in: 1, out: 5, cacheRead: 0.1 }; // misal Opus turun harga di bawah Sonnet
  const auto = applyRouter(e, ctl());
  assert.equal(auto.eng.models.t2, 'claude-opus-5-5');
  assert.equal(auto.notes.find((n) => n.tier === 't2')?.reason, 'cheaper');
  assert.equal(applyRouter(e, ctl({ router: 'manual' })).eng.models.t2, 'claude-sonnet-5-5');
  const m = eng();
  m.models.t1 = 'claude-sonnet-5-5';
  assert.equal(applyRouter(m, ctl({ router: 'manual' })).eng.models.t1, 'claude-sonnet-5-5', 'manual: admin boleh memakai mesin lebih kuat');
  assert.equal(applyRouter(m, ctl()).eng.models.t1, 'claude-haiku-5-5', 'otomatis: termurah yang mampu');
});

test('kendali: Haiku tidak bisa dimatikan, model asing dibuang, batas negatif jadi 0', () => {
  const c = normalizeControls({ disabledModels: ['claude-haiku-5-5', 'gpt-x', 'claude-opus-5-5', 'claude-opus-5-5'], maxTokensPerCheck: -5, memberDailyTokens: 'x' as never, router: 'weird' as never, emergencyStop: 'yes' as never });
  assert.deepEqual(c.disabledModels, ['claude-opus-5-5']);
  assert.equal(c.maxTokensPerCheck, 0);
  assert.equal(c.memberDailyTokens, 0);
  assert.equal(c.router, 'auto');
  assert.equal(c.emergencyStop, false, 'hanya true yang menyalakan tombol darurat');
});

test('batas harian per member: pesanan dijumlah atomik, yang melewati batas ditolak tanpa mengubah hitungan', async () => {
  const store = new Store(new FakeR2() as never);
  await addMemberDay(store, 'u1', '2026-11-08', 600, 1000);
  await assert.rejects(addMemberDay(store, 'u1', '2026-11-08', 500, 1000), (e: SpendLimitError) => e.used === 600 && e.limit === 1000);
  await addMemberDay(store, 'u1', '2026-11-08', 400, 1000);
  await assert.rejects(addMemberDay(store, 'u1', '2026-11-08', 1, 1000));
  await addMemberDay(store, 'u1', '2026-11-09', 900, 1000);
  await addMemberDay(store, 'u2', '2026-11-08', 999, 1000);
  await addMemberDay(store, 'u1', '2026-11-08', 50_000, 0); // 0 = tanpa batas
  // Bersamaan: 10 pesanan × 150 dengan batas 1000 → paling banyak 6 lolos (900), tidak pernah lebih dari batas.
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => addMemberDay(store, 'u3', '2026-11-08', 150, 1000)));
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 6);
  assert.equal((await store.get<{ tokens: number }>('u/member-day/2026-11-08/u3.json'))?.tokens, 900);
});
