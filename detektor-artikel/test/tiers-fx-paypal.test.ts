import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/lib/store.ts';
import { FakeR2 } from './fake-r2.ts';
import { tierFromTotal, tierOf, autoCeiling, modeAllowed, tierFromOrder, raiseTier, clampTier, isVvip } from '../src/data/tiers.ts';
import { refreshFx, effectiveFx, getFx, FX_DOC, saneRate } from '../src/data/fx.ts';
import { getPaypal, paypalReady, PAYPAL_DOC, capturePaypalOrder, seedPublicKey, sealSeed, SEED_KEY_DOC, type PaypalDoc } from '../src/data/paypal.ts';
import { parseMode, publicModelName, packagePrice, niceUsd, tokenPriceIdr, PUBLIC_MODE } from '../src/engine/pricing.ts';
import { DEFAULT_PACKAGES, DEFAULT_ENGINE, getBilling, normalizeDiscount } from '../src/data/settings.ts';
import { userKey, type User } from '../src/data/users.ts';
import { getPayment, PAYMENT_DOC } from '../src/data/orders.ts';
import { unseal } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';

const MASTER = 'k'.repeat(48);

test('tingkat member: total bayar, paket, admin, override, plafon Smart Auto', async () => {
  assert.equal(tierFromTotal(9_999_999), 1);
  assert.equal(tierFromTotal(10_000_000), 5);
  assert.equal(tierFromTotal(20_000_000), 6);
  assert.equal(tierFromTotal(1_000_000_000), 7);
  assert.ok(isVvip(7) && !isVvip(6));
  assert.equal(clampTier(99), 7);
  assert.equal(clampTier('x'), 1);
  assert.equal(tierOf({ role: 'admin' } as User), 7, 'admin melihat semua mesin');
  assert.equal(tierOf({ role: 'member', tier: 2, tierOverride: 5 } as User), 5, 'override admin menang');
  assert.equal(tierOf(null), 1);
  assert.equal(autoCeiling(1), 1);
  assert.equal(autoCeiling(2), 2);
  assert.equal(autoCeiling(3), 3);
  assert.ok(modeAllowed('haiku', 1) && modeAllowed('auto', 1) && !modeAllowed('sonnet', 1));
  assert.ok(!modeAllowed('fable', 4) && modeAllowed('fable', 5), 'Elite mulai Enterprise');
  const pk = DEFAULT_PACKAGES();
  assert.equal(tierFromOrder({ pkg: 'pro', priceIdr: 1 }, pk), 3);
  assert.equal(tierFromOrder({ pkg: 'super-enterprise', priceIdr: 20_000_000 }, pk), 6);
  assert.equal(tierFromOrder({ kind: 'deposit', pkg: '', priceIdr: 10_000_000 }, pk), 5);
  assert.equal(tierFromOrder({ kind: 'deposit', pkg: '', priceIdr: 500_000 }, pk), 1);
  const st = new Store(new FakeR2());
  await st.put(userKey('u1'), { id: 'u1', role: 'member', tier: 5 });
  await raiseTier(st, 'u1', 2);
  assert.equal((await st.get<User>(userKey('u1')))!.tier, 5, 'tingkat tidak pernah turun karena pesanan kecil');
  await raiseTier(st, 'u1', 7);
  assert.equal((await st.get<User>(userKey('u1')))!.tier, 7);
});

test('nama mesin publik: slug ↔ mode, nama model tidak pernah bocor', () => {
  assert.equal(parseMode('elite'), 'fable');
  assert.equal(parseMode('smart'), 'auto');
  assert.equal(parseMode('advanced'), 'sonnet');
  assert.equal(parseMode('sonnet'), 'sonnet', 'nama lama tetap diterima (tautan lama)');
  assert.equal(parseMode('gpt'), null);
  assert.equal(parseMode(5), null);
  for (const slug of Object.values(PUBLIC_MODE)) assert.ok(!/haiku|sonnet|opus|fable|claude/i.test(slug), slug);
  assert.equal(publicModelName('claude-opus-5-5'), 'Expert');
  assert.equal(publicModelName('claude-fable-5-1'), 'Elite');
  assert.equal(publicModelName('lain'), 'AI');
});

test('paket: diskon bawaan 0, Enterprise Rp10 jt / Super Rp20 jt, token = nominal ÷ harga token', async () => {
  const pk = DEFAULT_PACKAGES();
  assert.ok(pk.every((p) => p.discountPct === 0), 'diskon dikosongkan dulu');
  assert.equal(pk.find((p) => p.key === 'enterprise')!.targetIdr, 10_000_000);
  assert.equal(pk.find((p) => p.key === 'super-enterprise')!.targetIdr, 20_000_000);
  assert.equal(normalizeDiscount(12), 10);
  assert.equal(normalizeDiscount(27), 25);
  assert.equal(normalizeDiscount(99), 30);
  const st = new Store(new FakeR2());
  const b = await getBilling(st);
  const eng = { ...DEFAULT_ENGINE, fx: 16_000 };
  const tp = tokenPriceIdr(b, eng);
  const ent = packagePrice(pk.find((p) => p.key === 'enterprise')!, b, eng);
  assert.equal(ent.idr, 10_000_000);
  assert.equal(ent.tokens, Math.floor(10_000_000 / tp));
  assert.equal(ent.usd, niceUsd(10_000_000 / 16_000));
  const ent25 = packagePrice({ ...pk.find((p) => p.key === 'enterprise')!, discountPct: 25 }, b, eng);
  assert.equal(ent25.idr, 10_000_000, 'diskon menambah token, bukan menurunkan nominal');
  assert.ok(ent25.tokens > ent.tokens);
  // Susunan lama (v1, diskon 10/20/30) → v2: diskon 0, token yang diubah admin dipertahankan.
  await st.put('k/billing.json', { markup: 20, packages: [{ key: 'pro', name: { id: 'Pro', en: 'Pro' }, tokens: 3500, discountPct: 20 }] });
  const b2 = await getBilling(st);
  assert.equal(b2.packages.length, 6);
  assert.equal(b2.packages.find((p) => p.key === 'pro')!.tokens, 3500);
  assert.ok(b2.packages.every((p) => p.discountPct === 0));
});

test('deposit tanpa batas atas: batas lama Rp100 jt dihapus sekali, batas yang disimpan admin sesudahnya dihormati', async () => {
  const st = new Store(new FakeR2());
  assert.equal((await getPayment(st)).maxDepositIdr, 0);
  await st.put(PAYMENT_DOC, { idrEnabled: true, minDepositIdr: 50_000, maxDepositIdr: 100_000_000 });
  assert.equal((await getPayment(st)).maxDepositIdr, 0, 'batas lama dihapus');
  await st.put(PAYMENT_DOC, { idrEnabled: true, minDepositIdr: 50_000, maxDepositIdr: 500_000_000, depVersion: 2 });
  assert.equal((await getPayment(st)).maxDepositIdr, 500_000_000, 'batas baru dari admin tetap');
});

test('kurs USD/IDR harian: sumber cadangan, kurs tak wajar & loncatan >20% ditolak, manual bila otomatis mati', async (t) => {
  const st = new Store(new FakeR2());
  const env = { FX_URLS: 'https://fx-a.test/,https://fx-b.test/' } as unknown as Env;
  const answers: Record<string, unknown> = { 'https://fx-a.test/': 'down', 'https://fx-b.test/': { rates: { IDR: 16_250.456 } } };
  const real = globalThis.fetch;
  t.after(() => { globalThis.fetch = real; });
  globalThis.fetch = (async (u: string) => (answers[u] === 'down' ? new Response('x', { status: 503 }) : Response.json(answers[u]))) as typeof fetch;
  const d1 = await refreshFx(env, st, Date.UTC(2026, 10, 8));
  assert.equal(d1.usdIdr, 16_250.46);
  assert.equal(d1.source, 'test-1', 'sumber kedua dipakai saat sumber pertama mati');
  assert.equal(d1.history!.length, 1);
  answers['https://fx-a.test/'] = { rates: { IDR: 2 } };
  answers['https://fx-b.test/'] = { rates: { IDR: 25_000 } };
  const d2 = await refreshFx(env, st, Date.UTC(2026, 10, 9));
  assert.equal(d2.usdIdr, 16_250.46, 'kurs lama tetap dipakai');
  assert.match(d2.lastError!.msg, /loncatan/);
  answers['https://fx-a.test/'] = { rates: { IDR: 16_400 } };
  const d3 = await refreshFx(env, st, Date.UTC(2026, 10, 9));
  assert.equal(d3.usdIdr, 16_400);
  assert.equal(d3.history!.length, 2);
  assert.equal((await getFx(st)).usdIdr, 16_400);
  assert.ok(saneRate(16_400) && !saneRate(2) && !saneRate(Number.NaN));
  assert.equal(effectiveFx(15_000, d3), 16_400);
  assert.equal(effectiveFx(15_000, { ...d3, auto: false }), 15_000, 'admin mengunci kurs manual');
  assert.equal(effectiveFx(15_000, null), 15_000);
  assert.ok(await st.get(FX_DOC));
});

test('PayPal: kredensial awal dari secret ditanam sekali, tersegel, tanpa teks asli di R2', async () => {
  const r2 = new FakeR2();
  const st = new Store(r2);
  const seed = JSON.stringify({ mode: 'sandbox', clientId: 'CLIENT-ID-PLAIN-1234', secret: 'SECRET-PLAIN-9876' });
  const env = { MASTER_KEY: MASTER, PAYPAL_SEED: seed } as unknown as Env;
  const d = await getPaypal(env, st);
  assert.ok(d.enabled && d.seeded && d.mode === 'sandbox' && paypalReady(d));
  assert.equal(d.sandbox!.idLast4, '1234');
  assert.equal(d.sandbox!.secretLast4, '9876');
  const raw = JSON.stringify(await st.get(PAYPAL_DOC));
  assert.ok(!raw.includes('CLIENT-ID-PLAIN') && !raw.includes('SECRET-PLAIN'), 'R2 hanya berisi data tersegel');
  assert.equal(await unseal<string>(MASTER, d.sandbox!.clientId, 'paypal'), 'CLIENT-ID-PLAIN-1234');
  // Admin menghapus kredensial (seperti tombol Hapus: isi lain dipertahankan) → seed yang sama tidak menanam ulang.
  await st.put(PAYPAL_DOC, { ...d, sandbox: null, enabled: false } satisfies PaypalDoc);
  const again = await getPaypal(env, st);
  assert.ok(!again.sandbox && !paypalReady(again));
  const broken = await getPaypal({ MASTER_KEY: MASTER, PAYPAL_SEED: '{rusak' } as unknown as Env, new Store(new FakeR2()));
  assert.ok(!broken.enabled && !broken.sandbox, 'secret rusak diabaikan');
});

test('PayPal: capture yang sudah pernah di-capture membaca status, ID tidak sah ditolak', async (t) => {
  const st = new Store(new FakeR2());
  const env = { MASTER_KEY: MASTER, PAYPAL_SEED: JSON.stringify({ clientId: 'CID-capture-test', secret: 'S' }), PAYPAL_BASE_URL: 'https://pp.test' } as unknown as Env;
  const d = await getPaypal(env, st);
  const real = globalThis.fetch;
  t.after(() => { globalThis.fetch = real; });
  const seen: string[] = [];
  globalThis.fetch = (async (u: string, init?: RequestInit) => {
    seen.push(`${init?.method ?? 'GET'} ${u}`);
    if (u.endsWith('/v1/oauth2/token')) return Response.json({ access_token: 'T', expires_in: 3600 });
    if (u.endsWith('/capture')) return Response.json({ name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] }, { status: 422 });
    return Response.json({ status: 'COMPLETED', purchase_units: [{ custom_id: 'ord_1', payments: { captures: [{ id: 'CAP1', status: 'COMPLETED', custom_id: 'ord_1', amount: { value: '19.00', currency_code: 'USD' } }] } }] });
  }) as typeof fetch;
  const r = await capturePaypalOrder(env, d, 'ABCDEF123', 'ord_1');
  assert.deepEqual([r.status, r.captureId, r.amount, r.currency, r.customId], ['COMPLETED', 'CAP1', '19.00', 'USD', 'ord_1']);
  assert.ok(seen.some((s) => s === 'GET https://pp.test/v2/checkout/orders/ABCDEF123'));
  await assert.rejects(capturePaypalOrder(env, d, '../../x', 'ord_1'), /tidak sah/);
});

test('PayPal: seed terenkripsi untuk Worker (repo publik) — hanya Worker yang bisa membuka, tidak menimpa isi admin', async () => {
  const st = new Store(new FakeR2());
  const base = { MASTER_KEY: MASTER } as unknown as Env;
  const pub = await seedPublicKey(base, st);
  assert.equal(pub.crv, 'P-256');
  assert.deepEqual(await seedPublicKey(base, st), pub, 'kunci dibuat sekali');
  const keyDoc = JSON.stringify(await st.get(SEED_KEY_DOC));
  assert.ok(!/"d":/.test(keyDoc), 'kunci privat hanya tersimpan tersegel');
  const sealed = await sealSeed(pub, JSON.stringify({ mode: 'sandbox', clientId: 'ENC-CLIENT-ID-abcd', secret: 'ENC-SECRET-wxyz' }));
  assert.match(sealed, /^ecies1\./);
  assert.ok(!sealed.includes('ENC-CLIENT') && !sealed.includes('ENC-SECRET'));
  // Dokumen sudah ada (admin pernah membuka halaman PayPal) tetapi kosong → seed tetap tertanam.
  await st.put(PAYPAL_DOC, { enabled: false, mode: 'sandbox' } satisfies PaypalDoc);
  const env = { MASTER_KEY: MASTER, PAYPAL_SEED: sealed } as unknown as Env;
  const d = await getPaypal(env, st);
  assert.ok(paypalReady(d) && d.sandbox!.idLast4 === 'abcd' && d.seedId);
  assert.equal(await unseal<string>(MASTER, d.sandbox!.secret, 'paypal'), 'ENC-SECRET-wxyz');
  // Worker lain (MASTER_KEY berbeda) tidak bisa membuka seed ini.
  const other = new Store(new FakeR2());
  await seedPublicKey({ MASTER_KEY: 'z'.repeat(48) } as unknown as Env, other);
  const o = await getPaypal({ MASTER_KEY: 'z'.repeat(48), PAYPAL_SEED: sealed } as unknown as Env, other);
  assert.ok(!o.sandbox && !paypalReady(o));
  // Seed baru tidak menimpa kredensial yang sudah diisi admin.
  const sealed2 = await sealSeed(pub, JSON.stringify({ mode: 'sandbox', clientId: 'OTHER-ID-9999', secret: 'S2' }));
  const d2 = await getPaypal({ MASTER_KEY: MASTER, PAYPAL_SEED: sealed2 } as unknown as Env, st);
  assert.equal(d2.sandbox!.idLast4, 'abcd');
  // Mode live kosong → seed live tertanam tanpa mengubah mode aktif.
  const sealed3 = await sealSeed(pub, JSON.stringify({ mode: 'live', clientId: 'LIVE-ID-7777', secret: 'L' }));
  const d3 = await getPaypal({ MASTER_KEY: MASTER, PAYPAL_SEED: sealed3 } as unknown as Env, st);
  assert.ok(d3.live!.idLast4 === '7777' && d3.sandbox!.idLast4 === 'abcd' && d3.mode === 'sandbox');
});
