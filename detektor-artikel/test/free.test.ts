/* Kuota gratis (pemilik, 7 Nov 2026; docs/MASTER-BLUEPRINT.md §20): halaman normal dari teks, potongan N halaman
 * pertama, periode minggu/bulan dalam zona waktu situs, reservasi atomik, pengembalian, dan penutup celah curang.
 * Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/lib/store.ts';
import { FakeR2 } from './fake-r2.ts';
import { DEFAULT_FREE, normalizeFree } from '../src/data/settings.ts';
import { normalPages, firstPages, periodOf, freeStatus, reserveFreePages, releaseFreePages, FreeQuotaError, isDisposable, networkAllows, networkOf, MAX_FREE_ACCOUNTS_PER_NETWORK } from '../src/data/free.ts';

const para = (n: number) => Array.from({ length: n }, (_, i) => `kata${i}`).join(' ');

test('halaman normal: kata, karakter, token — mana yang tercapai lebih dulu', () => {
  const f = DEFAULT_FREE;
  assert.equal(normalPages('pendek sekali', f).pages, 1, 'minimal 1 halaman');
  assert.equal(normalPages(para(700), f).pages, 1);
  assert.equal(normalPages(para(701), f).pages, 2, '701 kata = 2 halaman');
  // 300 kata yang sangat panjang (20 huruf): sedikit kata, tetapi karakter melewati satu halaman.
  const longWords = Array.from({ length: 300 }, () => 'a'.repeat(20)).join(' ');
  assert.ok(normalPages(longWords, f).pages >= 2, 'kata super panjang dihitung dari karakter');
  // Teks tanpa spasi: 1 „kata“, tetapi 10.000 karakter.
  assert.equal(normalPages('x'.repeat(10_000), f).pages, Math.ceil(10_000 / f.charsPerPage));
  // Ukuran halaman ikut pengaturan admin.
  assert.equal(normalPages(para(700), normalizeFree({ ...f, wordsPerPage: 350 })).pages, 2);
});

test('N halaman pertama: dipotong di batas paragraf, lalu di batas kata', () => {
  const f = DEFAULT_FREE;
  const text = [para(500), para(500), para(500)].join('\n\n');
  assert.equal(normalPages(text, f).pages, 3);
  const one = firstPages(text, 1, f);
  assert.equal(normalPages(one, f).pages, 1);
  assert.ok(one.split(/\s+/).length >= 690, 'mengisi halaman sampai hampir penuh');
  const two = firstPages(text, 2, f);
  assert.equal(normalPages(two, f).pages, 2);
  assert.ok(two.startsWith(one.slice(0, 50)), 'selalu dari awal naskah');
});

test('periode: minggu mulai Senin 00.00 dan bulan tanggal 1 00.00, dalam zona waktu situs', () => {
  // Minggu 9 Nov 2026 23.30 WIB = 16.30 UTC → masih minggu yang dimulai Senin 2 Nov.
  const sunNight = Date.UTC(2026, 10, 8, 16, 30);
  const w = periodOf(DEFAULT_FREE, sunNight);
  assert.equal(w.key, 'w-2026-11-02');
  assert.equal(w.resetAt, Date.UTC(2026, 10, 8, 17, 0), 'reset Senin 9 Nov 00.00 WIB = 8 Nov 17.00 UTC');
  // Zona Madrid (CET, UTC+1 di November).
  const madrid = normalizeFree({ ...DEFAULT_FREE, resetTz: 'Europe/Madrid' });
  assert.equal(periodOf(madrid, sunNight).key, 'w-2026-11-02');
  assert.equal(periodOf(madrid, sunNight).resetAt, Date.UTC(2026, 10, 8, 23, 0), 'reset Senin 00.00 Madrid = Minggu 23.00 UTC');
  // Bulanan.
  const month = normalizeFree({ ...DEFAULT_FREE, period: 'month' });
  const m = periodOf(month, Date.UTC(2026, 11, 31, 18, 0)); // 1 Jan 2027 01.00 WIB
  assert.equal(m.key, 'm-2027-01');
  assert.equal(m.resetAt, Date.UTC(2027, 0, 31, 17, 0), 'reset 1 Feb 00.00 WIB');
});

test('reservasi atomik: dua pemeriksaan bersamaan tidak memakai sisa kuota yang sama', async () => {
  const store = new Store(new FakeR2());
  const f = normalizeFree({ ...DEFAULT_FREE, pages: 10 });
  const now = Date.UTC(2026, 10, 10, 3, 0);
  await reserveFreePages(store, 'u1', f, 9, 'chk_a', now);
  const results = await Promise.allSettled([reserveFreePages(store, 'u1', f, 1, 'chk_b', now), reserveFreePages(store, 'u1', f, 1, 'chk_c', now)]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1, 'hanya satu yang lolos');
  const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
  assert.ok(rejected.reason instanceof FreeQuotaError && rejected.reason.remaining === 0);
  assert.equal((await freeStatus(store, 'u1', f, now)).remaining, 0);
  // Klik ganda pada pemeriksaan yang sama tidak memotong dua kali.
  await reserveFreePages(store, 'u1', f, 9, 'chk_a', now);
  assert.equal((await freeStatus(store, 'u1', f, now)).used, 10);
  // Pemeriksaan gagal: halamannya kembali, sekali saja.
  const { key } = periodOf(f, now);
  await releaseFreePages(store, 'u1', key, 'chk_a');
  await releaseFreePages(store, 'u1', key, 'chk_a');
  assert.equal((await freeStatus(store, 'u1', f, now)).used, 1);
  // Periode berikutnya mulai dari nol.
  assert.equal((await freeStatus(store, 'u1', f, now + 7 * 86_400_000)).used, 0);
  // Kuota dimatikan admin: tidak ada sisa.
  await assert.rejects(reserveFreePages(store, 'u2', normalizeFree({ ...f, enabled: false }), 1, 'chk_d', now), FreeQuotaError);
});

test('anti-curang: e-mail sekali pakai, batas akun per jaringan', async () => {
  assert.ok(isDisposable('x@mailinator.com'));
  assert.ok(!isDisposable('guru@sekolah.sch.id'));
  assert.equal(networkOf('203.0.113.45'), '203.0.113');
  assert.equal(networkOf('2001:db8:abcd:12::1'), '2001:db8:abcd');
  const store = new Store(new FakeR2());
  for (let i = 0; i < MAX_FREE_ACCOUNTS_PER_NETWORK; i += 1) assert.ok(await networkAllows(store, `u${i}`, 'net1', 'w-2026-11-09'));
  assert.ok(!(await networkAllows(store, 'u-extra', 'net1', 'w-2026-11-09')), 'akun ketiga dari jaringan yang sama ditolak');
  assert.ok(await networkAllows(store, 'u0', 'net1', 'w-2026-11-09'), 'akun yang sudah terdaftar tetap boleh');
  assert.ok(await networkAllows(store, 'u-extra', 'net1', 'w-2026-11-16'), 'periode baru dihitung ulang');
});
