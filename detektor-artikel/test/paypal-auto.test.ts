/**
 * PayPal tanpa webhook PayPal (pemilik, 8 Nov 2026: „webhook di buat dari sisi anda, jadi ga perlu webhook dr paypal“;
 * „input di live PayPal … pastikan masuk ke R2 dan di encrypt termasuk sandbox nya“): seed v2 dua mode, uji koneksi +
 * daftar webhook otomatis, dan pemeriksaan sendiri order yang belum lunas.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/lib/store.ts';
import { FakeR2 } from './fake-r2.ts';
import { getPaypal, checkPaypal, seedPublicKey, sealSeed, PAYPAL_DOC, type PaypalDoc } from '../src/data/paypal.ts';
import { reconcilePaypal, openKey } from '../src/routes/paypal.ts';
import { orderKey, type Order } from '../src/data/orders.ts';
import { balanceOf } from '../src/data/wallet.ts';
import { userKey } from '../src/data/users.ts';
import { unseal } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';

const MASTER = 'k'.repeat(48);
const kv = { get: async () => null, put: async () => undefined, delete: async () => undefined };

test('seed v2: sandbox + live sekaligus, terenkripsi; tanpa `replace` isi admin tidak ditimpa, dengan `replace` diganti', async () => {
  const r2 = new FakeR2();
  const store = new Store(r2);
  const base = { MASTER_KEY: MASTER, DATA: r2 } as unknown as Env;
  const pub = await seedPublicKey(base, store);
  // Admin sudah mengisi live (…OLD1).
  await store.put(PAYPAL_DOC, { enabled: true, mode: 'sandbox', live: { clientId: { v: 1, iv: 'x', ct: 'y' }, secret: { v: 1, iv: 'x', ct: 'y' }, idLast4: 'OLD1', secretLast4: 'OLD2', savedAt: 1, savedBy: 'admin' } } as PaypalDoc);
  const both = { sandbox: { clientId: 'SANDBOX-ID-AAAA', secret: 'SANDBOX-SECRET-BBBB' }, live: { clientId: 'LIVE-ID-HKd0', secret: 'LIVE-SECRET-ZZLk' }, activate: 'live' };
  const d1 = await getPaypal({ ...base, PAYPAL_SEED: await sealSeed(pub, JSON.stringify(both)) } as Env, store);
  assert.equal(d1.sandbox!.idLast4, 'AAAA', 'sandbox kosong → terisi');
  assert.equal(d1.live!.idLast4, 'OLD1', 'tanpa replace: live milik admin tetap');
  const d2 = await getPaypal({ ...base, PAYPAL_SEED: await sealSeed(pub, JSON.stringify({ ...both, replace: true })) } as Env, store);
  assert.equal(d2.live!.idLast4, 'HKd0', 'replace: live diganti atas perintah pemilik');
  assert.equal(d2.pendingActivate, 'live', 'live diaktifkan setelah uji koneksinya berhasil');
  assert.equal(d2.mode, 'sandbox', 'mode belum berpindah sebelum diuji');
  const raw = JSON.stringify(await store.get(PAYPAL_DOC));
  assert.ok(!/LIVE-SECRET|SANDBOX-SECRET|LIVE-ID-HKd0/.test(raw), 'R2 hanya berisi data tersegel');
  assert.equal(await unseal<string>(MASTER, d2.live!.secret, 'paypal'), 'LIVE-SECRET-ZZLk');
});

test('uji koneksi: hasil per mode tanpa rahasia, webhook didaftarkan otomatis, live diaktifkan hanya bila diterima PayPal', async (t) => {
  const r2 = new FakeR2();
  const store = new Store(r2);
  const pubEnv = { MASTER_KEY: MASTER, DATA: r2, PAYPAL_BASE_URL: 'https://pp.test' } as unknown as Env;
  const pub = await seedPublicKey(pubEnv, store);
  const env = { ...pubEnv, PAYPAL_SEED: await sealSeed(pub, JSON.stringify({ sandbox: { clientId: 'SB-GOOD-0001', secret: 'S1' }, live: { clientId: 'LV-BAD-0002', secret: 'S2' }, activate: 'live' })) } as Env;
  let liveOk = false;
  const hooks: string[] = [];
  const real = globalThis.fetch;
  t.after(() => { globalThis.fetch = real; });
  globalThis.fetch = (async (u: string, init?: RequestInit) => {
    if (u.endsWith('/v1/oauth2/token')) {
      const who = atob(String((init?.headers as Record<string, string>).authorization).replace('Basic ', ''));
      if (who.startsWith('SB-GOOD') || (liveOk && who.startsWith('LV-'))) return Response.json({ access_token: `T-${who.slice(0, 2)}`, expires_in: 3600 });
      return Response.json({ error: 'invalid_client', error_description: 'Client Authentication failed' }, { status: 401 });
    }
    if (u.endsWith('/v1/notifications/webhooks') && init?.method === 'POST') { hooks.push(JSON.parse(String(init.body)).url); return Response.json({ id: `WH-${hooks.length}` }, { status: 201 }); }
    return Response.json({}, { status: 404 });
  }) as typeof fetch;
  const d1 = await checkPaypal(env, store, 'https://xscan.es/api/paypal/webhook');
  assert.ok(d1.tests!.sandbox!.ok && /Webhook terdaftar/.test(d1.tests!.sandbox!.msg));
  assert.ok(!d1.tests!.live!.ok && /Client Authentication failed/.test(d1.tests!.live!.msg));
  assert.equal(d1.webhook!.sandbox, 'WH-1');
  assert.equal(d1.mode, 'sandbox', 'live gagal → tetap sandbox');
  assert.equal(d1.pendingActivate, 'live');
  assert.ok(!JSON.stringify(d1.tests).includes('S2') && !JSON.stringify(d1.tests).includes('LV-BAD-0002'));
  liveOk = true;
  const d2 = await checkPaypal(env, store, 'https://xscan.es/api/paypal/webhook');
  assert.ok(d2.tests!.live!.ok && d2.mode === 'live' && d2.enabled && !d2.pendingActivate, 'live diterima → aktif');
  assert.equal(d2.webhook!.live, 'WH-2');
  assert.deepEqual(hooks, ['https://xscan.es/api/paypal/webhook', 'https://xscan.es/api/paypal/webhook']);
});

test('tanpa webhook PayPal: cron memeriksa order terbuka — disetujui → capture → token masuk; menunggu → dijadwalkan ulang; > 72 jam → dilepas', async (t) => {
  const r2 = new FakeR2();
  const store = new Store(r2);
  const pubEnv = { MASTER_KEY: MASTER, DATA: r2, RL: kv, PAYPAL_BASE_URL: 'https://pp.test' } as unknown as Env;
  const pub = await seedPublicKey(pubEnv, store);
  const env = { ...pubEnv, PAYPAL_SEED: await sealSeed(pub, JSON.stringify({ sandbox: { clientId: 'SB-GOOD-0003', secret: 'S' } })) } as Env;
  await getPaypal(env, store);
  await store.put(userKey('u1'), { id: 'u1', role: 'member', email: 'a@contoh.id', name: 'A' });
  const now = Date.now();
  const order = (id: string, pp: string): Order => ({ id, uid: 'u1', email: 'a@contoh.id', pkg: 'starter', tokens: 300, currency: 'USD', priceIdr: 200000, priceUsd: 12, status: 'pending', createdAt: now, method: 'paypal', fxRate: 16000, paypal: { orderId: pp, mode: 'sandbox', status: 'CREATED' }, proofs: [] } as unknown as Order);
  await store.put(orderKey('ord_A'), order('ord_A', 'PPAPPROVED1'));
  await store.put(orderKey('ord_B'), order('ord_B', 'PPWAITING01'));
  await store.put(orderKey('ord_C'), order('ord_C', 'PPOLD000001'));
  await store.put(openKey('ord_A'), {}, { at: now - 120_000, next: now - 1 });
  await store.put(openKey('ord_B'), {}, { at: now - 120_000, next: now - 1 });
  await store.put(openKey('ord_C'), {}, { at: now - 73 * 3600_000, next: now - 1 });
  const captured: string[] = [];
  const real = globalThis.fetch;
  t.after(() => { globalThis.fetch = real; });
  globalThis.fetch = (async (u: string, init?: RequestInit) => {
    if (u.endsWith('/v1/oauth2/token')) return Response.json({ access_token: 'T', expires_in: 3600 });
    const m = /\/v2\/checkout\/orders\/([A-Z0-9]+)(\/capture)?$/.exec(u);
    if (m?.[1] === 'PPAPPROVED1' && m[2]) {
      captured.push(m[1]);
      return Response.json({ id: m[1], status: 'COMPLETED', purchase_units: [{ custom_id: 'ord_A', payments: { captures: [{ id: 'CAPA', status: 'COMPLETED', custom_id: 'ord_A', amount: { value: '12.00', currency_code: 'USD' } }] } }] }, { status: 201 });
    }
    if (m?.[1] === 'PPAPPROVED1') return Response.json({ id: m[1], status: 'APPROVED', purchase_units: [{ custom_id: 'ord_A' }] });
    if (m?.[1] === 'PPWAITING01') return Response.json({ id: m[1], status: 'PAYER_ACTION_REQUIRED', purchase_units: [{ custom_id: 'ord_B' }] });
    void init;
    return Response.json({ name: 'RESOURCE_NOT_FOUND' }, { status: 404 });
  }) as typeof fetch;
  assert.equal(await reconcilePaypal(env, store, now), 1);
  assert.deepEqual(captured, ['PPAPPROVED1'], 'hanya order yang disetujui yang di-capture, dengan ID tersimpan');
  assert.equal((await store.get<Order>(orderKey('ord_A')))!.status, 'credited');
  assert.equal(await balanceOf(store, 'u1'), 300, 'token masuk tanpa webhook');
  assert.equal(await store.get(openKey('ord_A')), null, 'order lunas keluar dari daftar periksa');
  const waiting = (await store.list<{ next?: number }>('i/paypal-open/')).items.find((x) => x.id === 'ord_B');
  assert.ok(waiting && Number(waiting.meta.next) > now, 'menunggu persetujuan → dijadwalkan ulang');
  assert.equal(await store.get(openKey('ord_C')), null, 'lebih dari 72 jam → dilepas');
  assert.equal(await reconcilePaypal(env, store, now + 1), 0, 'aman diulang: tidak ada token ganda');
  assert.equal(await balanceOf(store, 'u1'), 300);
});
