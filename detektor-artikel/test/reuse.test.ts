/* Hasil tersimpan per paragraf (pemilik, 8 Nov 2026; docs/MASTER-BLUEPRINT.md §26): naskah yang pernah diunggah dengan
 * mesin yang sama tidak dikirim lagi ke AI; member yang sama membayar `reusePct` %, member lain normal; mesin lain = baru.
 * Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/lib/store.ts';
import { FakeR2 } from './fake-r2.ts';
import { preprocess } from '../src/engine/preprocess.ts';
import { sha256Hex } from '../src/lib/crypto.ts';
import { DEFAULT_BILLING, DEFAULT_ENGINE, DEFAULT_FREE } from '../src/data/settings.ts';
import { rateCard } from '../src/engine/pricing.ts';
import { reserveFreePages, trimFreePages, freeStatus } from '../src/data/free.ts';
import {
  engineKey, planReuse, buildEntries, saveReuse, reuseLines, cachedSentences, cachedParagraphs, mergedDoc, bodyParagraphs, paraKey,
  type FreshResult, type RawLine,
} from '../src/engine/reuse.ts';

const P1 = 'Literasi digital menuntut pembaca memeriksa sumber sebelum membagikan kabar. Banyak orang tergesa menekan tombol bagikan tanpa membaca isinya sampai habis. Kebiasaan kecil ini membuat kabar bohong menyebar lebih cepat daripada koreksinya.';
const P2 = 'Sekolah dapat melatih kebiasaan itu lewat tugas sederhana. Murid diminta mencari dua sumber lain untuk setiap berita yang mereka temukan. Guru lalu meminta mereka menjelaskan mengapa sumber itu bisa dipercaya.';
const P3 = 'Paragraf baru ini belum pernah diperiksa sebelumnya. Isinya membahas peran orang tua di rumah. Orang tua bisa memberi contoh dengan membaca berita bersama anak setiap pagi.';

/** Hasil AI tiruan untuk semua kalimat dan paragraf isi. */
function fakeResult(pp: ReturnType<typeof preprocess>): FreshResult {
  const a: FreshResult['a'] = {};
  const b: FreshResult['b'] = {};
  for (const s of pp.sentences) if (!s.excluded) a[s.i] = { i: s.i, p: 0.2 + (s.i % 3) * 0.1, r: ['uniform_rhythm'] };
  for (const p of bodyParagraphs(pp)) b[p.i] = { i: p.i, p: 0.3, r: [] };
  return { a, b, t2: null, t3: null, d: { a: 0.3, b: 0.35, t2: null, t3: null }, t2Targets: [], t3Targets: [] };
}

async function analyse(store: Store, uid: string, checkId: string, text: string, ek: string, lines: RawLine[]) {
  const pp = preprocess(text);
  const docHash = await sha256Hex(pp.normalized);
  const plan = await planReuse(store, uid, ek, pp, docHash);
  const entries = buildEntries(pp, plan, plan.hashes, fakeResult(pp), lines, checkId);
  const list = await saveReuse(store, { ek, uid, checkId, createdAt: Date.now(), docHash, hashes: plan.hashes, entries, doc: null, rubric: null, reportLang: 'id' });
  return { pp, plan, entries, list };
}

test('kunci mesin: mode, model, effort, Cek Gratis — beda satu saja = mesin baru', async () => {
  const e = DEFAULT_ENGINE;
  const auto = await engineKey(e, 'auto', false);
  assert.equal(auto, await engineKey(structuredClone(e), 'auto', false), 'pengaturan sama = kunci sama');
  assert.notEqual(auto, await engineKey(e, 'sonnet', false), 'mode lain');
  assert.notEqual(auto, await engineKey(e, 'auto', true), 'Cek Gratis = mesin lain');
  assert.notEqual(auto, await engineKey({ ...e, models: { ...e.models, t2: 'claude-opus-5-5' } }, 'auto', false), 'model lain');
  assert.notEqual(auto, await engineKey({ ...e, effort: { ...e.effort, t1: 'low' } }, 'auto', false), 'effort lain');
  assert.equal(await engineKey(e, 'haiku', false), await engineKey({ ...e, models: { ...e.models, t3: 'claude-opus-5' } }, 'haiku', false), 'Haiku saja tidak bergantung model Opus');
});

test('unggah ulang oleh member yang sama: semua paragraf tersimpan, ditagih persen admin, biaya AI 0', async () => {
  const store = new Store(new FakeR2());
  const ek = await engineKey(DEFAULT_ENGINE, 'auto', false);
  const text = `${P1}\n\n${P2}`;
  const lines: RawLine[] = [
    { tier: 't1-a', model: 'claude-haiku-5-5', in: 2000, out: 800, cacheRead: 0, cost: 0.0006 },
    { tier: 't1-b', model: 'claude-haiku-5-5', in: 1500, out: 300, cacheRead: 0, cost: 0.0003 },
    { tier: 'rubric', model: 'claude-haiku-5-5', in: 3000, out: 900, cacheRead: 0, cost: 0.00075 },
  ];
  const first = await analyse(store, 'u1', 'chk_a', text, ek, lines);
  assert.equal(first.plan.words.own + first.plan.words.other, 0, 'pertama kali: tidak ada yang tersimpan');
  assert.equal(Object.keys(first.entries).length, 2, 'dua paragraf disimpan');
  const sumIn = Object.values(first.entries).reduce((a, e) => a + (e.use['t1-a|claude-haiku-5-5']?.[0] ?? 0), 0);
  assert.ok(Math.abs(sumIn - 2000) < 1, 'token AI dibagi habis ke paragraf');
  assert.ok(Object.values(first.entries).every((e) => !Object.keys(e.use).some((k) => k.startsWith('rubric'))), 'rubrik tidak dibagi per paragraf');

  const pp = preprocess(text);
  const again = await planReuse(store, 'u1', ek, pp, await sha256Hex(pp.normalized));
  assert.ok(again.full, 'seluruh naskah tersimpan');
  assert.equal(again.words.other, 0);
  assert.equal(again.words.own, again.words.total, 'semua kata milik sendiri');
  assert.deepEqual(Object.keys(cachedSentences(again, pp, 'a')).length, pp.sentences.filter((s) => !s.excluded).length, 'skor setiap kalimat kembali');
  assert.equal(Object.keys(cachedParagraphs(again)).length, 2);
  assert.ok(Math.abs((mergedDoc(again, pp, 'a', null, 0) ?? 0) - 0.3) < 1e-9, 'nilai dokumen dari lintasan tersimpan');

  const rates = rateCard(DEFAULT_BILLING, DEFAULT_ENGINE);
  const normal = reuseLines({ ...again, pars: Object.fromEntries(Object.entries(again.pars).map(([k, v]) => [k, { ...v, own: false }])) }, rates, DEFAULT_BILLING, 50);
  const own = reuseLines(again, rates, DEFAULT_BILLING, 50);
  const sum = (ls: { tokens: number }[]) => ls.reduce((a, l) => a + l.tokens, 0);
  assert.ok(sum(normal.lines) > 0, 'harga normal > 0');
  assert.ok(Math.abs(sum(own.lines) - sum(normal.lines) / 2) < 0.02, 'member sama: 50 % dari harga normal');
  assert.ok(own.lines.every((l) => l.tier === 'reuse-own'), 'baris milik sendiri diberi tanda');
  assert.ok(normal.lines.every((l) => l.tier !== 'reuse-own'), 'member lain: baris tampil seperti biasa');
  assert.ok(Math.abs(own.savedUsd - 0.0009) < 1e-6, 'biaya AI yang dihemat = biaya lintasan tingkat 1 (tanpa rubrik)');
  assert.equal(sum(reuseLines(again, rates, DEFAULT_BILLING, 0).lines), 0, 'admin bisa membuat 0 %');
});

test('member lain: hasil tersimpan dipakai (biaya AI 0) tetapi bukan milik sendiri; sebagian sama: hanya paragraf baru', async () => {
  const store = new Store(new FakeR2());
  const ek = await engineKey(DEFAULT_ENGINE, 'auto', false);
  await analyse(store, 'u1', 'chk_a', `${P1}\n\n${P2}`, ek, [{ tier: 't1-a', model: 'claude-haiku-5-5', in: 1000, out: 500, cacheRead: 0, cost: 0.0004 }]);
  const pp = preprocess(`${P1}\n\n${P3}`);
  const plan = await planReuse(store, 'u2', ek, pp, await sha256Hex(pp.normalized));
  assert.equal(plan.full, false, 'sebagian saja');
  assert.equal(Object.keys(plan.pars).length, 1, 'P1 tersimpan, P3 baru');
  assert.equal(plan.words.own, 0, 'u2 belum pernah mengunggahnya');
  assert.ok(plan.words.other > 0);
  // Mesin lain: tidak ada yang dipakai ulang.
  const plan2 = await planReuse(store, 'u2', await engineKey(DEFAULT_ENGINE, 'opus', false), pp, await sha256Hex(pp.normalized));
  assert.equal(Object.keys(plan2.pars).length, 0, 'mesin berbeda = diperiksa ulang');
  // Setelah u2 sendiri mengunggahnya, unggahan berikutnya milik sendiri.
  const entries = buildEntries(pp, plan, plan.hashes, fakeResult(pp), [{ tier: 't1-a', model: 'claude-haiku-5-5', in: 400, out: 100, cacheRead: 0, cost: 0.0001 }], 'chk_b');
  assert.deepEqual(Object.keys(entries).map(Number), [pp.paragraphs.find((p) => p.text.startsWith('Paragraf baru'))!.i], 'hanya paragraf baru yang ditulis');
  await saveReuse(store, { ek, uid: 'u2', checkId: 'chk_b', createdAt: Date.now(), docHash: await sha256Hex(pp.normalized), hashes: plan.hashes, entries, doc: null, rubric: null, reportLang: 'id' });
  const plan3 = await planReuse(store, 'u2', ek, pp, await sha256Hex(pp.normalized));
  assert.ok(plan3.full && plan3.words.own === plan3.words.total, 'unggahan ulang u2: semuanya milik sendiri');
});

test('pemecahan kalimat berbeda tidak dipakai ulang; hasil tersimpan tidak pernah kedaluwarsa atau ditimpa', async () => {
  const r2 = new FakeR2();
  const store = new Store(r2);
  const ek = await engineKey(DEFAULT_ENGINE, 'haiku', false);
  const { plan } = await analyse(store, 'u1', 'chk_a', `${P1}\n\n${P2}`, ek, []);
  const h1 = Object.values(plan.hashes)[0]!;
  const e1 = await store.get<{ at: number; w: number[]; src: string }>(paraKey(ek, h1));
  // Hasil sangat lama tetap dipakai (cache perusahaan tidak dihapus walau lewat 90 hari).
  await store.put(paraKey(ek, h1), { ...e1, at: Date.now() - 400 * 86_400_000 });
  const pp = preprocess(`${P1}\n\n${P2}`);
  let p = await planReuse(store, 'u1', ek, pp, await sha256Hex(pp.normalized));
  assert.equal(Object.keys(p.pars).length, 2, 'hasil berumur 400 hari tetap dipakai');
  // Pemeriksaan lain dengan paragraf yang sama tidak menimpa entri pertama.
  await analyse(store, 'u2', 'chk_b', P1, ek, []);
  assert.equal((await store.get<{ src: string }>(paraKey(ek, h1)))!.src, 'chk_a', 'penulis pertama menang');
  // Rusak data jumlah kata kalimat → tidak cocok → diperiksa baru.
  await store.put(paraKey(ek, h1), { ...e1, w: [1, 2, 3] });
  p = await planReuse(store, 'u1', ek, pp, await sha256Hex(pp.normalized));
  assert.equal(Object.keys(p.pars).length, 1, 'kalimat tidak sejajar: paragraf itu tidak dipakai ulang');
});

test('Cek Gratis: halaman milik sendiri dikurangi, hanya bisa turun', async () => {
  const store = new Store(new FakeR2());
  const f = DEFAULT_FREE;
  const { periodKey } = await reserveFreePages(store, 'u1', f, 4, 'chk_f');
  await trimFreePages(store, 'u1', periodKey, 'chk_f', 2);
  assert.equal((await freeStatus(store, 'u1', f)).remaining, f.pages - 2, 'dua halaman kembali');
  await trimFreePages(store, 'u1', periodKey, 'chk_f', 3);
  assert.equal((await freeStatus(store, 'u1', f)).remaining, f.pages - 2, 'tidak pernah naik lagi');
  await trimFreePages(store, 'u1', periodKey, 'chk_f', 2);
  assert.equal((await freeStatus(store, 'u1', f)).remaining, f.pages - 2, 'idempoten');
});
