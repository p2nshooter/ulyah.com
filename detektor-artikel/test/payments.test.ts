import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store, invTs } from '../src/lib/store.ts';
import { FakeR2 } from './fake-r2.ts';
import { topUp, spendForTokens, depositBalance, repairDepositOps, adminAdjust, DepositInsufficientError, getDeposit } from '../src/data/deposit.ts';
import { balanceOf } from '../src/data/wallet.ts';
import { sniffProof, invoiceNo, fmtMoney, getPayment, DEFAULT_PAYMENT } from '../src/data/orders.ts';
import { schedulePurge, runPurge, purgeDate } from '../src/data/purge.ts';
import { PURGE_DAYS } from '../src/data/policy.ts';
import type { Env } from '../src/env.ts';

test('deposit: isi saldo idempoten, tidak bisa minus, beli token tepat sekali', async () => {
  const st = new Store(new FakeR2());
  assert.equal(await topUp(st, 'u1', 100_000, 'ord_A', 'inv'), true);
  assert.equal(await topUp(st, 'u1', 100_000, 'ord_A', 'inv'), false, 'pesanan deposit yang sama tidak menambah dua kali');
  assert.equal(await depositBalance(st, 'u1'), 100_000);
  assert.equal((await getDeposit(st, 'u1')).totalIdr, 100_000);
  // Beli: klik ganda dengan nomor operasi yang sama hanya memotong & menambah token sekali.
  assert.equal(await spendForTokens(st, 'u1', 'u1-dop_1', 33_000, 300, 'buy', 'Starter'), 'done');
  assert.equal(await spendForTokens(st, 'u1', 'u1-dop_1', 33_000, 300, 'buy', 'Starter'), 'duplicate');
  // Kiriman ulang yang diubah (paket lebih besar, nomor operasi sama) tetap memakai nilai tersimpan.
  assert.equal(await spendForTokens(st, 'u1', 'u1-dop_1', 99_000, 99_999, 'buy', 'Lembaga'), 'duplicate');
  assert.equal(await depositBalance(st, 'u1'), 67_000);
  assert.equal(await balanceOf(st, 'u1'), 300);
  // Tidak cukup: tidak ada potongan, tidak ada token.
  await assert.rejects(spendForTokens(st, 'u1', 'u1-dop_2', 70_000, 600, 'convert', 'x'), DepositInsufficientError);
  assert.equal(await depositBalance(st, 'u1'), 67_000);
  assert.equal(await balanceOf(st, 'u1'), 300);
  // Operasi yang sudah dibatalkan tidak pernah menghasilkan token walau dikirim ulang.
  await assert.rejects(spendForTokens(st, 'u1', 'u1-dop_2', 10_000, 30, 'convert', 'x'), DepositInsufficientError);
  assert.equal(await balanceOf(st, 'u1'), 300);
  // Koreksi admin juga tidak bisa membuat saldo minus.
  assert.equal(await adminAdjust(st, 'u1', -1_000_000, 'x', 'a1'), 'insufficient');
  assert.equal(await adminAdjust(st, 'u1', -7_000, 'x', 'a2'), 'applied');
  assert.equal(await depositBalance(st, 'u1'), 60_000);
});

test('deposit: Worker berhenti setelah potong deposit → cron menyelesaikan ke depan (token tetap masuk)', async () => {
  const r2 = new FakeR2();
  const st = new Store(r2);
  await topUp(st, 'u2', 50_000, 'ord_B', 'inv');
  // Tiru crash: jurnal dibuat dan deposit dipotong, tetapi token belum dikreditkan.
  await st.createOnce('c/deposit-ops/u2-dop_X.json', { id: 'u2-dop_X', uid: 'u2', idr: 33_000, tokens: 300, note: 'Starter', state: 'started', createdAt: Date.now() - 10 * 60_000 });
  await st.put('i/deposit-ops-open/u2-dop_X', {}, { uid: 'u2' });
  await st.cas<{ balanceIdr: number; totalIdr: number; updatedAt: number; applied: string[] }>('c/deposits/u2.json', (d) => ({ ...d!, balanceIdr: d!.balanceIdr - 33_000, applied: [...d!.applied, 'buy:u2-dop_X'] }));
  // Operasi kedua yang terputus SEBELUM memotong deposit → dibatalkan, tidak ada token.
  await st.createOnce('c/deposit-ops/u2-dop_Y.json', { id: 'u2-dop_Y', uid: 'u2', idr: 10_000, tokens: 90, note: 'x', state: 'started', createdAt: Date.now() - 10 * 60_000 });
  await st.put('i/deposit-ops-open/u2-dop_Y', {}, { uid: 'u2' });
  assert.equal(await repairDepositOps(st), 2);
  assert.equal(await balanceOf(st, 'u2'), 300);
  assert.equal(await depositBalance(st, 'u2'), 17_000);
  assert.equal(await repairDepositOps(st), 0, 'aman diulang');
  await assert.rejects(spendForTokens(st, 'u2', 'u2-dop_Y', 10_000, 90, 'convert', 'x'), DepositInsufficientError);
  assert.equal(await balanceOf(st, 'u2'), 300);
});

test('bukti transfer: jenis dikenali dari isi berkas, bukan nama', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const pdf = new TextEncoder().encode('%PDF-1.7 xxxxxxx');
  const webp = new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 ');
  assert.equal(sniffProof(png)?.type, 'image/png');
  assert.equal(sniffProof(jpg)?.type, 'image/jpeg');
  assert.equal(sniffProof(pdf)?.type, 'application/pdf');
  assert.equal(sniffProof(webp)?.type, 'image/webp');
  assert.equal(sniffProof(new TextEncoder().encode('<html><script>alert(1)</script>')), null);
  assert.equal(invoiceNo({ id: 'ord_01JC8ABCDEFGHJKMNPQR', createdAt: Date.UTC(2026, 10, 2, 20, 0) }), 'XS-20261103-KMNPQR');
  assert.equal(fmtMoney('id', 'IDR', 1386000), 'Rp 1.386.000');
  assert.equal(fmtMoney('en', 'USD', 84.5), 'US$84.50');
});

test('rekening bawaan = rekening pembayaran ulyah.com; IDR & USD aktif', async () => {
  const p = await getPayment(new Store(new FakeR2()));
  assert.equal(p.swift, 'BNINIDJA');
  assert.equal(p.accountIdr, '2090571484');
  assert.equal(p.accountUsd, '2090571495');
  assert.equal(p.beneficiary, 'YUSRON EFENDI');
  assert.ok(p.idrEnabled && p.usdEnabled && DEFAULT_PAYMENT.minDepositIdr > 0);
});

test(`pembersihan otomatis ${PURGE_DAYS} hari: hasil kerja & unggahan terhapus, catatan transaksi tetap`, async () => {
  const r2 = new FakeR2();
  const st = new Store(r2);
  const env = { DATA: r2 } as unknown as Env;
  const old = Date.now() - (PURGE_DAYS + 1) * 86_400_000;
  // Pemeriksaan lama + laporannya.
  await st.put('c/checks/chk_old.json', { id: 'chk_old', uid: 'u1', createdAt: old, stage: 'done', lease: 0, reportId: 'rpt_old' });
  await st.put('c/checks/chk_old/t1.json', {});
  await st.put('c/texts/chk_old.json', {});
  await st.put('l/cu/chk_old/1.json', {});
  await st.put(`i/user-checks/u1/${invTs(old)}~chk_old`, {});
  await st.put('c/reports/rpt_old.json', { id: 'rpt_old', createdAt: old, hash: 'h'.repeat(64), verifyCode: 'ABCD-EFGH' });
  await st.put(`i/user-reports/u1/${invTs(old)}~rpt_old`, {});
  await st.put(`i/reports/${invTs(old)}~rpt_old`, {});
  await st.put(`i/hash/u1/${'h'.repeat(32)}/rpt_old`, {});
  await st.put('c/verify/ABCD-EFGH.json', {});
  await st.put('c/report-notes/rpt_old.json', {});
  await schedulePurge(st, 'c', 'chk_old', old);
  // Sesi lomba lama.
  await st.put('c/batches/ses_old.json', { uid: 'u1', createdAt: old, settled: true });
  await st.put(`i/user-batches/u1/${invTs(old)}~ses_old`, {});
  await st.put('i/batch-items/ses_old/00001~chk_old', {});
  await schedulePurge(st, 'b', 'ses_old', old);
  // Bukti transfer lama pada pesanan yang sudah lunas.
  await st.put('c/orders/ord_old.json', { id: 'ord_old', status: 'credited', proofs: [{ key: 'f/proofs/ord_old/1.png', type: 'image/png' }] });
  await r2.put('f/proofs/ord_old/1.png', 'x');
  await schedulePurge(st, 'p', 'ord_old', old);
  // Catatan transaksi & pekerjaan baru.
  await st.put('c/wallets/u1.json', { balance: 5 });
  await st.put('c/checks/chk_new.json', { id: 'chk_new', uid: 'u1', createdAt: Date.now(), stage: 'done', lease: 0 });
  await schedulePurge(st, 'c', 'chk_new', Date.now());

  const res = await runPurge(env);
  assert.deepEqual(res, { checks: 1, batches: 1, proofs: 1 });
  for (const k of ['c/checks/chk_old.json', 'c/checks/chk_old/t1.json', 'c/texts/chk_old.json', 'l/cu/chk_old/1.json', 'c/reports/rpt_old.json', 'c/verify/ABCD-EFGH.json', 'c/report-notes/rpt_old.json', `i/reports/${invTs(old)}~rpt_old`, `i/user-reports/u1/${invTs(old)}~rpt_old`, 'c/batches/ses_old.json', 'i/batch-items/ses_old/00001~chk_old', 'f/proofs/ord_old/1.png']) {
    assert.equal(r2.m.has(k), false, `${k} terhapus`);
  }
  assert.ok(r2.m.has('c/wallets/u1.json'), 'saldo tetap');
  assert.ok(r2.m.has('c/checks/chk_new.json'), 'pekerjaan baru tetap');
  assert.ok(r2.m.has(`i/purge90/${purgeDate(Date.now())}/c~chk_new`), 'jadwal baru tetap menunggu');
  const ord = (await st.get<{ status: string; proofs: { purged?: boolean }[] }>('c/orders/ord_old.json'))!;
  assert.equal(ord.status, 'credited', 'invoice tetap');
  assert.equal(ord.proofs[0]!.purged, true);
  assert.deepEqual(await runPurge(env), { checks: 0, batches: 0, proofs: 0 }, 'aman diulang');
});
