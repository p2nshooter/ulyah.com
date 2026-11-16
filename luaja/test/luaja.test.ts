/* luaja.com di dalam proses (R2 tiruan): AdSense tumpuk, mutu pelajaran & bank soal, kunci tidak bocor, penilaian,
 * alur member (daftar → tagihan → bukti bayar → admin menyetujui → akses terbuka, idempoten). Jalankan: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { ADSENSE_ACCOUNTS, ADSENSE_CLIENT, ADS_TXT, DOMAIN } from '../src/lib/adsense.ts';
import { LESSONS } from '../src/course/index.ts';
import { validateLesson, grade, clientLesson } from '../src/course/schema.ts';
import { SETS, nextSet, totalQuestions } from '../src/practice/index.ts';
import { validateSet, gradeSet, publicSet, IncompleteError, predict } from '../src/practice/types.ts';
import { DEFAULT_PRICING, priceFor } from '../src/data/model.ts';
import type { Env } from '../src/env.ts';

const stack = JSON.parse(fs.readFileSync(new URL('../../adsense-stack.json', import.meta.url), 'utf8')) as { stack: string[]; primary: Record<string, string> };

function env(extra: Partial<Env> = {}): Env {
  return { DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS: {} as Fetcher, CANONICAL_HOST: 'luaja.com', SESSION_SECRET: 'test-secret-0123456789abcdef', OWNER_BOOTSTRAP_EMAIL: 'owner@luaja.test', OWNER_BOOTSTRAP_PASSWORD: 'owner-pass-123', ...extra };
}
const req = (e: Env, path: string, init: RequestInit & { cookie?: string } = {}) => {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set('cookie', init.cookie);
  return worker.fetch(new Request(`https://luaja.com${path}`, { ...init, headers, redirect: 'manual' }) as never, e, {} as ExecutionContext);
};
const cookieOf = (r: Response) => (r.headers.get('set-cookie') ?? '').split(/,(?=\s*[^;=\s]+=)/).map((x) => x.split(';')[0]!.trim()).filter((x) => x.startsWith('__Host-lj=')).join('; ');
const form = (o: Record<string, string>) => new URLSearchParams(o);
const csrfIn = (h: string) => /name="_csrf" value="([^"]+)"/.exec(h)?.[1] ?? '';

test('AdSense: akun utama luaja.com dan tumpukan persis adsense-stack.json', () => {
  assert.equal(DOMAIN, 'luaja.com');
  assert.equal(ADSENSE_CLIENT, stack.primary['luaja.com']);
  assert.equal(ADSENSE_CLIENT, 'ca-pub-6701063918838796');
  assert.deepEqual([...ADSENSE_ACCOUNTS], [...new Set([stack.primary['luaja.com']!, ...stack.stack])]);
  assert.equal(ADS_TXT.trim().split('\n').length, ADSENSE_ACCOUNTS.length);
});

test('halaman publik: satu tag meta per akun, tepat satu loader; portal & latihan tanpa loader', async () => {
  const e = env();
  for (const p of ['/', '/jerman', '/inggris', '/jepang', '/harga', '/coba', '/latihan', '/tentang', '/belajar/de-a1-m01-l01']) {
    const r = await req(e, p);
    assert.equal(r.status, 200, p);
    const h = await r.text();
    for (const a of ADSENSE_ACCOUNTS) assert.ok(h.includes(`<meta name="google-adsense-account" content="${a}">`), `${p}: meta ${a}`);
    assert.equal((h.match(/adsbygoogle\.js\?client=/g) ?? []).length, 1, `${p}: satu loader`);
    assert.ok(h.includes('<link rel="canonical" href="https://luaja.com'), `${p}: canonical`);
    assert.ok(h.includes('application/ld+json'), `${p}: JSON-LD`);
  }
  for (const p of ['/latihan/de-a1-p1', '/masuk', '/daftar']) {
    const h = await (await req(e, p)).text();
    assert.equal((h.match(/adsbygoogle\.js\?client=/g) ?? []).length, 0, `${p}: tanpa loader`);
    assert.ok(h.includes('google-adsense-account'), `${p}: tag meta tetap ada`);
  }
  assert.equal(await (await req(e, '/ads.txt')).text(), ADS_TXT);
});

test('semua pelajaran lolos standar mutu; kunci tidak pernah ada di data peramban', () => {
  assert.equal(LESSONS.length, 15);
  for (const l of LESSONS) {
    assert.deepEqual(validateLesson(l), [], l.code);
    const js = JSON.stringify(clientLesson(l));
    assert.ok(!js.includes('"answer"') && !js.includes('"why"'), `${l.code}: kunci bocor`);
  }
  for (const c of ['de', 'en', 'ja']) assert.ok(LESSONS.some((l) => l.course === c && l.free), `${c}: ada pelajaran gratis`);
});

test('bank soal: ratusan butir, semua valid, kunci tidak terkirim, wajib lengkap sebelum dinilai', () => {
  assert.ok(SETS.length >= 50, `${SETS.length} paket`);
  assert.ok(totalQuestions() >= 900, `${totalQuestions()} soal`);
  const ids = new Set<string>();
  for (const s of SETS) {
    assert.ok(!ids.has(s.id), `id ganda ${s.id}`);
    ids.add(s.id);
    assert.deepEqual(validateSet(s), [], s.id);
    const js = JSON.stringify(publicSet(s));
    assert.ok(!js.includes('"answer"') && !js.includes('"why"'), `${s.id}: kunci bocor`);
  }
  const s = SETS.find((x) => x.id === 'de-a1-p1')!;
  assert.throws(() => gradeSet(s, {}), IncompleteError);
  const all = Object.fromEntries(s.questions.map((q) => [q.id, q.answer]));
  const g = gradeSet(s, all);
  assert.equal(g.correct, g.total);
  assert.equal(g.prediction.pass, true);
  assert.ok(g.message.title.length > 5);
  assert.ok(nextSet('de-a1-p1'), 'ada paket berikutnya');
  // skala prediksi
  const ielts = SETS.find((x) => x.exam === 'ielts')!;
  assert.match(predict(ielts, 0.8).score, /^Band \d/);
  const toefl = SETS.find((x) => x.exam === 'toefl-itp')!;
  assert.match(predict(toefl, 0.5).score, /≈ \d{3} total/);
});

test('penilaian pelajaran: susun kata & teks Jepang tanpa peduli spasi', () => {
  const ja = LESSONS.find((l) => l.code === 'ja-n5-m01-l02')!;
  const order = ja.practice.find((e) => e.type === 'order')!;
  assert.equal(order.type, 'order');
  assert.ok(grade(order, 'ケンさん は がくせい です 。'), 'spasi antarkata tidak memengaruhi');
  const dict = ja.independent.find((e) => e.type === 'dictation')!;
  assert.ok(dict.type === 'dictation' && grade(dict, dict.text.replace(/ /g, '')), 'dikte Jepang tanpa spasi tetap benar');
  const de = LESSONS.find((l) => l.code === 'de-a1-m01-l01')!;
  const gap = de.practice.find((e) => e.type === 'gap')!;
  assert.ok(grade(gap, ' Bin '));
  assert.ok(!grade(gap, 'bist'));
});

test('harga: 1 bahasa, 2 bahasa, 3 bahasa per kategori', () => {
  assert.equal(priceFor(DEFAULT_PRICING, 'umum', ['de']), 500_000);
  assert.equal(priceFor(DEFAULT_PRICING, 'umum', ['de', 'en']), 1_000_000);
  assert.equal(priceFor(DEFAULT_PRICING, 'umum', ['de', 'en', 'ja']), 1_300_000);
  assert.equal(priceFor(DEFAULT_PRICING, 'pelajar', ['ja']), 350_000);
  assert.equal(priceFor(DEFAULT_PRICING, 'pelajar', ['de', 'en', 'ja']), 1_000_000);
  assert.equal(priceFor(DEFAULT_PRICING, 'juara', ['en']), 200_000);
  assert.equal(priceFor(DEFAULT_PRICING, 'juara', ['de', 'en', 'ja']), 500_000);
});

test('API latihan: menolak jawaban belum lengkap, menilai paket gratis, menolak paket member untuk tamu', async () => {
  const e = env();
  const s = SETS.find((x) => x.id === 'en-toefl-p1')!;
  let r = await req(e, `/api/latihan/${s.id}`, { method: 'POST', body: JSON.stringify({ answers: {} }), headers: { 'content-type': 'application/json' } });
  assert.equal(r.status, 400);
  r = await req(e, `/api/latihan/${s.id}`, { method: 'POST', body: JSON.stringify({ answers: Object.fromEntries(s.questions.map((q) => [q.id, 0])) }), headers: { 'content-type': 'application/json' } });
  assert.equal(r.status, 200);
  const g = (await r.json()) as { items: { answer: number }[]; prediction: { score: string } };
  assert.equal(g.items.length, s.questions.length);
  assert.ok(g.prediction.score);
  const locked = SETS.find((x) => !x.free)!;
  r = await req(e, `/api/latihan/${locked.id}`, { method: 'POST', body: JSON.stringify({ answers: {} }), headers: { 'content-type': 'application/json' } });
  assert.equal(r.status, 403);
});

test('alur member: daftar → tagihan → bukti bayar → admin setujui → pelajaran berbayar terbuka (idempoten)', async () => {
  const e = env();
  // daftar
  let r = await req(e, '/daftar', { method: 'POST', body: form({ name: 'Siti Aminah', email: 'siti@contoh.id', password: 'rahasia123', setuju: 'on' }) });
  assert.equal(r.status, 302);
  const member = cookieOf(r);
  assert.ok(member, 'sesi member');
  // pelajaran berbayar terkunci
  let h = await (await req(e, '/belajar/de-a1-m01-l02', { cookie: member })).text();
  assert.ok(h.includes('Pelajaran khusus member'));
  // buat tagihan juara 3 bahasa
  h = await (await req(e, '/portal/paket', { cookie: member })).text();
  const body = new URLSearchParams({ _csrf: csrfIn(h), kategori: 'juara' });
  for (const k of ['de', 'en', 'ja']) body.append('bahasa', k);
  r = await req(e, '/portal/paket', { method: 'POST', body, cookie: member });
  assert.equal(r.status, 302);
  const invPath = new URL(r.headers.get('location')!, 'https://luaja.com').pathname;
  h = await (await req(e, invPath, { cookie: member })).text();
  assert.ok(h.includes('901592737762') && h.includes('Yusron Efendi'), 'rekening tampil kepada pemilik tagihan');
  assert.ok(h.includes('Rp500.000'), 'harga juara 3 bahasa');
  // rekening tidak ada di halaman publik
  assert.ok(!(await (await req(e, '/harga')).text()).includes('901592737762'));
  // unggah tanpa dokumen promo → ditolak
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
  let fd = new FormData();
  fd.set('_csrf', csrfIn(h));
  fd.set('bukti', new File([png], 'transfer.png', { type: 'image/png' }));
  r = await req(e, `${invPath}/bukti`, { method: 'POST', body: fd, cookie: member });
  assert.match(r.headers.get('location') ?? '', /err=/);
  // dengan dokumen promo → review
  fd = new FormData();
  fd.set('_csrf', csrfIn(h));
  fd.set('bukti', new File([png], 'transfer.png', { type: 'image/png' }));
  fd.set('promo', new File([png], 'rapor.png', { type: 'image/png' }));
  r = await req(e, `${invPath}/bukti`, { method: 'POST', body: fd, cookie: member });
  assert.match(r.headers.get('location') ?? '', /ok=1/);
  // admin (pemilik bawaan lewat secret) menyetujui
  r = await req(e, '/admin/masuk', { method: 'POST', body: form({ email: 'owner@luaja.test', password: 'owner-pass-123' }) });
  assert.equal(r.status, 302);
  const owner = cookieOf(r);
  h = await (await req(e, '/admin/pembayaran', { cookie: owner })).text();
  assert.ok(h.includes('Siti Aminah'));
  const invId = invPath.split('/').pop()!;
  for (let i = 0; i < 2; i += 1) {
    r = await req(e, `/admin/pembayaran/${invId}/setujui`, { method: 'POST', body: form({ _csrf: csrfIn(h) }), cookie: owner });
    assert.equal(r.status, 302);
  }
  // akses terbuka
  h = await (await req(e, '/belajar/de-a1-m01-l02', { cookie: member })).text();
  assert.ok(!h.includes('Pelajaran khusus member') && h.includes('data-lesson'), 'pelajaran berbayar terbuka');
  h = await (await req(e, '/portal', { cookie: member })).text();
  assert.equal((h.match(/pill pill-ok">Aktif/g) ?? []).length, 3, 'tiga bahasa aktif');
  // persetujuan ganda tidak menggandakan masa aktif: satu tahun ± 1 hari
  const subsRaw = [...(e.DATA as unknown as FakeR2).m.entries()].find(([k]) => k.startsWith('c/subs/'))![1].v;
  const subs = JSON.parse(subsRaw) as Record<string, { until: number }>;
  const days = (subs.de!.until - Date.now()) / 86_400_000;
  assert.ok(days > 364 && days < 366, `masa aktif ${days}`);
});

test('portal & admin terlindungi', async () => {
  const e = env();
  assert.equal((await req(e, '/portal')).status, 302);
  assert.match((await req(e, '/admin')).headers.get('location') ?? '', /\/admin\/masuk/);
  const r = await req(e, '/daftar', { method: 'POST', body: form({ name: 'A', email: 'a@contoh.id', password: 'rahasia123', setuju: 'on' }) });
  const cookie = cookieOf(r);
  assert.match((await req(e, '/admin', { cookie })).headers.get('location') ?? '', /\/admin\/masuk/);
  assert.equal((await req(e, '/admin/masuk', { method: 'POST', body: form({ email: 'a@contoh.id', password: 'rahasia123' }) })).status, 403);
});

test('PayPal: kredensial disegel, order → capture → lunas + langganan aktif; webhook palsu ditolak; nominal salah tidak melunasi', async () => {
  const e = env({ MASTER_KEY: 'master-key-for-tests-0123456789abcdef' });
  const calls: string[] = [];
  let capturedAmount = '32.00';
  let invForMock = '';
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const u = new URL(url);
    if (u.protocol !== 'https:' || u.host !== 'api-m.sandbox.paypal.com') return realFetch(input as RequestInfo, init);
    calls.push(u.pathname);
    const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });
    if (url.endsWith('/v1/oauth2/token')) return json({ access_token: 'tok' });
    if (url.endsWith('/v2/checkout/orders')) {
      const b = JSON.parse(String(init?.body));
      return json({ id: 'ORDER1', status: 'CREATED', links: [{ rel: 'payer-action', href: 'https://paypal.test/approve' }], echo: b });
    }
    if (url.endsWith('/v2/checkout/orders/ORDER1/capture')) return json({ id: 'ORDER1', status: 'COMPLETED', payer: { email_address: 'buyer@paypal.test' }, purchase_units: [{ payments: { captures: [{ id: 'CAP1', status: 'COMPLETED', custom_id: invForMock, amount: { value: capturedAmount, currency_code: 'USD' } }] } }] });
    if (url.endsWith('/v1/notifications/verify-webhook-signature')) return json({ verification_status: 'FAILURE' });
    return json({}, 404);
  }) as typeof fetch;
  try {
    // pemilik menyimpan kredensial sandbox
    let r = await req(e, '/admin/masuk', { method: 'POST', body: form({ email: 'owner@luaja.test', password: 'owner-pass-123' }) });
    const owner = cookieOf(r);
    let h = await (await req(e, '/admin/paypal', { cookie: owner })).text();
    r = await req(e, '/admin/paypal', { method: 'POST', cookie: owner, body: form({ _csrf: csrfIn(h), enabled: 'on', mode: 'sandbox', sandbox_client: 'SB-CLIENT', sandbox_secret: 'SB-SECRET-VALUE', sandbox_webhook: 'WH-1', live_client: '', live_secret: '', live_webhook: '' }) });
    assert.match(r.headers.get('location') ?? '', /ok=/);
    const stored = [...(e.DATA as unknown as FakeR2).m.entries()].find(([k]) => k === 'k/paypal.json')![1].v;
    assert.ok(!stored.includes('SB-SECRET-VALUE'), 'secret tersimpan terenkripsi, bukan teks biasa');
    h = await (await req(e, '/admin/paypal', { cookie: owner })).text();
    assert.ok(!h.includes('SB-SECRET-VALUE'), 'secret tidak pernah ditampilkan ulang');
    // member membuat tagihan USD
    r = await req(e, '/daftar', { method: 'POST', body: form({ name: 'Buyer', email: 'buyer@contoh.id', password: 'rahasia123', setuju: 'on' }) });
    const member = cookieOf(r);
    h = await (await req(e, '/portal/paket', { cookie: member })).text();
    const body = new URLSearchParams({ _csrf: csrfIn(h), kategori: 'umum', mata_uang: 'USD', bahasa: 'en' });
    r = await req(e, '/portal/paket', { method: 'POST', body, cookie: member });
    const invPath = new URL(r.headers.get('location')!, 'https://luaja.com').pathname;
    const invId = invPath.split('/').pop()!;
    invForMock = invId;
    h = await (await req(e, invPath, { cookie: member })).text();
    assert.ok(h.includes('US$32.00') && h.includes('data-paypal=') && h.includes('BNINIDJA') && h.includes('2090571495'), 'tagihan USD: PayPal + BNI USD + SWIFT');
    // webhook dengan tanda tangan tidak sah ditolak
    r = await req(e, '/api/paypal/webhook', { method: 'POST', body: JSON.stringify({ event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { custom_id: invId, status: 'COMPLETED', amount: { value: '32.00', currency_code: 'USD' } } }) });
    assert.equal(r.status, 400);
    // nominal salah tidak melunasi
    r = await req(e, `/api/paypal/order/${invId}`, { method: 'POST', cookie: member });
    assert.equal(((await r.json()) as { id: string }).id, 'ORDER1');
    capturedAmount = '1.00';
    r = await req(e, `/api/paypal/capture/${invId}`, { method: 'POST', cookie: member, body: JSON.stringify({ orderId: 'ORDER1' }), headers: { 'content-type': 'application/json' } });
    assert.equal(r.status, 409);
    // nominal benar → lunas, langganan aktif, kuitansi
    capturedAmount = '32.00';
    r = await req(e, `/api/paypal/capture/${invId}`, { method: 'POST', cookie: member, body: JSON.stringify({ orderId: 'ORDER1' }), headers: { 'content-type': 'application/json' } });
    assert.equal(r.status, 200);
    h = await (await req(e, '/belajar/en-beginner-m01-l02', { cookie: member })).text();
    assert.ok(h.includes('data-lesson'), 'pelajaran Inggris berbayar terbuka');
    h = await (await req(e, `${invPath}/invoice`, { cookie: member })).text();
    assert.ok(h.includes('KUITANSI') && h.includes('US$32.00') && h.includes('CAP1'));
    assert.ok(calls.some((u) => u.includes('/capture')));
    // tagihan orang lain tidak bisa dibuka
    r = await req(e, '/daftar', { method: 'POST', body: form({ name: 'Other', email: 'other@contoh.id', password: 'rahasia123', setuju: 'on' }) });
    assert.equal((await req(e, `${invPath}/invoice`, { cookie: cookieOf(r) })).status, 404);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('harga per mata uang: IDR, USD, JPY', () => {
  assert.equal(priceFor(DEFAULT_PRICING, 'umum', ['de'], 'USD'), 32);
  assert.equal(priceFor(DEFAULT_PRICING, 'umum', ['de', 'en', 'ja'], 'JPY'), 12_400);
  assert.equal(priceFor(DEFAULT_PRICING, 'pelajar', ['de', 'en'], 'USD'), 44);
});

/* ── metode bayar: CRUD dari admin, templat tersembunyi, dokumen lama ─────────────────────────────── */
async function ownerAndMember(e: Env, email: string) {
  let r = await req(e, '/admin/masuk', { method: 'POST', body: form({ email: 'owner@luaja.test', password: 'owner-pass-123' }) });
  const owner = cookieOf(r);
  r = await req(e, '/daftar', { method: 'POST', body: form({ name: 'Pembeli', email, password: 'rahasia123', setuju: 'on' }) });
  return { owner, member: cookieOf(r) };
}
async function newInvoice(e: Env, member: string, currency: string, bahasa = 'en') {
  const h = await (await req(e, '/portal/paket', { cookie: member })).text();
  const r = await req(e, '/portal/paket', { method: 'POST', cookie: member, body: new URLSearchParams({ _csrf: csrfIn(h), kategori: 'umum', mata_uang: currency, bahasa }) });
  const path = new URL(r.headers.get('location')!, 'https://luaja.com').pathname;
  return { path, id: path.split('/').pop()!, location: r.headers.get('location')! };
}

test('metode bayar: dokumen lama diubah, tambah/ubah/hapus dari admin, templat internasional tersembunyi sampai diisi', async () => {
  const e = env();
  await (e.DATA as unknown as R2Bucket).put('k/payment.json', JSON.stringify({ bank: 'SeaBank', account: '111222333', holder: 'Pemilik Lama', note: 'n', whatsapp: '', bni: { name: 'BNI', swift: 'BNINIDJA', code: '009', holder: 'PEMILIK', address: 'Jakarta', accounts: { IDR: '444', USD: '555666', JPY: '777' } } }));
  const { owner, member } = await ownerAndMember(e, 'crud@contoh.id');
  let inv = await newInvoice(e, member, 'USD');
  let h = await (await req(e, inv.path, { cookie: member })).text();
  assert.ok(h.includes('555666') && h.includes('BNINIDJA'), 'rekening BNI USD dari dokumen lama');
  assert.ok(!h.includes('data-method="wise"'), 'Wise tersembunyi selama belum diisi');
  h = await (await req(e, '/admin/rekening', { cookie: owner })).text();
  assert.ok(h.includes('Wise') && h.includes('Tersembunyi'));
  const csrf = csrfIn(h);
  // mengisi templat Wise → tampil untuk tagihan USD
  let r = await req(e, '/admin/rekening/simpan', { method: 'POST', cookie: owner, body: form({ _csrf: csrf, id: 'wise', kind: 'wise', name: 'Wise', cur_USD: 'on', account: 'bayar@wise.test', holder: '', bankName: '', swift: '', code: '', address: '', instructions: 'Pilih kirim ke e-mail.', enabled: 'on' }) });
  assert.match(decodeURIComponent(r.headers.get('location') ?? ''), /tayang/);
  h = await (await req(e, inv.path, { cookie: member })).text();
  assert.ok(h.includes('data-method="wise"') && h.includes('bayar@wise.test') && h.includes('Pilih kirim ke e-mail.'));
  // menambah bank baru (IDR) lalu menghapus SeaBank
  r = await req(e, '/admin/rekening/simpan', { method: 'POST', cookie: owner, body: form({ _csrf: csrf, id: '', kind: 'bank', name: 'BCA', cur_IDR: 'on', account: '8889990001', holder: 'PT Pembeli Baru', bankName: '', swift: '', code: '', address: '', instructions: '', enabled: 'on' }) });
  assert.match(decodeURIComponent(r.headers.get('location') ?? ''), /ditambahkan/);
  await req(e, '/admin/rekening/seabank/hapus', { method: 'POST', cookie: owner, body: form({ _csrf: csrf }) });
  inv = await newInvoice(e, member, 'IDR', 'de');
  h = await (await req(e, inv.path, { cookie: member })).text();
  assert.ok(h.includes('8889990001') && h.includes('PT Pembeli Baru'), 'BCA baru tampil');
  assert.ok(!h.includes('111222333'), 'SeaBank sudah dihapus');
  // tanpa satu pun cara bayar JPY → JPY tidak ditawarkan dan ditolak server
  await req(e, '/admin/rekening/bni-jpy/hapus', { method: 'POST', cookie: owner, body: form({ _csrf: csrf }) });
  await req(e, '/admin/rekening/revolut/hapus', { method: 'POST', cookie: owner, body: form({ _csrf: csrf }) });
  h = await (await req(e, '/portal/paket', { cookie: member })).text();
  assert.ok(!h.includes('value="JPY"') && h.includes('value="USD"'));
  r = await req(e, '/portal/paket', { method: 'POST', cookie: member, body: new URLSearchParams({ _csrf: csrfIn(h), kategori: 'umum', mata_uang: 'JPY', bahasa: 'de' }) });
  assert.match(r.headers.get('location') ?? '', /err=/);
  // CSRF wajib
  assert.match((await req(e, '/admin/rekening/wise/hapus', { method: 'POST', cookie: owner, body: form({ _csrf: 'salah' }) })).headers.get('location') ?? '', /err=/);
});

/* ── gerbang otomatis: Stripe, Xendit, Midtrans ───────────────────────────────────────────────────── */
async function hex(alg: 'SHA-256' | 'SHA-512', key: string | null, data: string) {
  const enc = new TextEncoder();
  const buf = key === null ? await crypto.subtle.digest(alg, enc.encode(data)) : await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: alg }, false, ['sign']), enc.encode(data));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

test('gerbang Stripe/Xendit/Midtrans: tersembunyi sampai dikonfigurasi, webhook sah melunasi, tanda tangan palsu & nominal salah ditolak', async () => {
  const e = env({ MASTER_KEY: 'master-key-for-tests-0123456789abcdef' });
  const seen: { url: string; body: string }[] = [];
  const state = { stripePaid: 'unpaid', stripeInv: '', xenditStatus: 'PENDING', xenditInv: '', xenditAmount: 500_000, midOrder: '', midInv: '' };
  const realFetch = globalThis.fetch;
  const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const u = new URL(String(input instanceof Request ? input.url : input));
    const hosts = ['api.stripe.com', 'api.xendit.co', 'app.sandbox.midtrans.com', 'api.sandbox.midtrans.com'];
    if (u.protocol !== 'https:' || !hosts.includes(u.host)) return realFetch(input as RequestInfo, init);
    const body = String(init?.body ?? '');
    seen.push({ url: `${u.host}${u.pathname}`, body });
    if (u.host === 'api.stripe.com') {
      if (u.pathname === '/v1/checkout/sessions') return json({ id: 'cs_test_1', url: 'https://checkout.stripe.test/1' });
      if (u.pathname === '/v1/checkout/sessions/cs_test_1') return json({ id: 'cs_test_1', payment_status: state.stripePaid, status: 'complete', amount_total: 3200, currency: 'usd', metadata: { invoice: state.stripeInv } });
      if (u.pathname === '/v1/balance') return json({ object: 'balance' });
    }
    if (u.host === 'api.xendit.co') {
      if (u.pathname === '/v2/invoices') return json({ id: 'xinv_1', invoice_url: 'https://checkout.xendit.test/xinv_1', status: 'PENDING' });
      if (u.pathname === '/v2/invoices/xinv_1') return json({ id: 'xinv_1', status: state.xenditStatus, amount: state.xenditAmount, paid_amount: state.xenditAmount, currency: 'IDR', external_id: state.xenditInv });
    }
    if (u.host === 'app.sandbox.midtrans.com' && u.pathname === '/snap/v1/transactions') {
      state.midOrder = (JSON.parse(body) as { transaction_details: { order_id: string } }).transaction_details.order_id;
      return json({ token: 't', redirect_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/t' });
    }
    if (u.host === 'api.sandbox.midtrans.com' && u.pathname === `/v2/${state.midOrder}/status`) return json({ status_code: '200', order_id: state.midOrder, transaction_status: 'settlement', gross_amount: '500000.00', currency: 'IDR', custom_field1: state.midInv });
    return json({ error: { code: 'not_mocked' } }, 404);
  }) as typeof fetch;
  try {
    const { owner, member } = await ownerAndMember(e, 'gw@contoh.id');
    let inv = await newInvoice(e, member, 'USD');
    let h = await (await req(e, inv.path, { cookie: member })).text();
    assert.ok(!h.includes('data-gw='), 'tanpa kunci: tidak ada tombol gerbang');
    // Stripe: kunci salah format ditolak; kunci uji disimpan terenkripsi
    h = await (await req(e, '/admin/gerbang/stripe', { cookie: owner })).text();
    const csrf = csrfIn(h);
    const stripeForm = (sk: string) => form({ _csrf: csrf, enabled: 'on', mode: 'test', cur_USD: 'on', cur_IDR: 'on', live_pub: '', live_secret: '', live_hook: '', test_pub: 'pk_test_abc', test_secret: sk, test_hook: 'whsec_testsecret' });
    let r = await req(e, '/admin/gerbang/stripe', { method: 'POST', cookie: owner, body: stripeForm('sk_live_salah') });
    assert.match(r.headers.get('location') ?? '', /err=/);
    r = await req(e, '/admin/gerbang/stripe', { method: 'POST', cookie: owner, body: stripeForm('sk_test_rahasia') });
    assert.match(r.headers.get('location') ?? '', /ok=/);
    const raw = [...(e.DATA as unknown as FakeR2).m.entries()].find(([k]) => k === 'k/gw-stripe.json')![1].v;
    assert.ok(!raw.includes('sk_test_rahasia') && !raw.includes('whsec_testsecret'), 'kunci tersegel');
    h = await (await req(e, inv.path, { cookie: member })).text();
    assert.ok(h.includes('data-gw="stripe"'));
    r = await req(e, `/api/bayar/stripe/${inv.id}`, { method: 'POST', cookie: member, body: form({ _csrf: csrfIn(h) }) });
    assert.equal(r.status, 303);
    assert.equal(r.headers.get('location'), 'https://checkout.stripe.test/1');
    const sent = new URLSearchParams(seen.find((s) => s.url === 'api.stripe.com/v1/checkout/sessions')!.body);
    assert.equal(sent.get('line_items[0][price_data][unit_amount]'), '3200');
    assert.equal(sent.get('metadata[invoice]'), inv.id);
    state.stripeInv = inv.id;
    // kembali sebelum lunas → belum aktif
    r = await req(e, `/api/bayar/stripe/kembali/${inv.id}?ref=cs_test_1`, { cookie: member });
    assert.match(r.headers.get('location') ?? '', /err=/);
    // webhook palsu ditolak; webhook sah melunasi
    const payload = JSON.stringify({ type: 'checkout.session.completed', livemode: false, data: { object: { id: 'cs_test_1' } } });
    const t = Math.floor(Date.now() / 1000);
    r = await req(e, '/api/bayar/stripe/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': `t=${t},v1=${'0'.repeat(64)}` } });
    assert.equal(r.status, 400);
    state.stripePaid = 'paid';
    r = await req(e, '/api/bayar/stripe/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': `t=${t},v1=${await hex('SHA-256', 'whsec_testsecret', `${t}.${payload}`)}` } });
    assert.equal(r.status, 200);
    h = await (await req(e, `${inv.path}/invoice`, { cookie: member })).text();
    assert.ok(h.includes('KUITANSI') && h.includes('Stripe'));
    assert.ok((await (await req(e, '/belajar/en-beginner-m01-l02', { cookie: member })).text()).includes('data-lesson'), 'langganan aktif');

    // Xendit (IDR): token callback salah ditolak, nominal salah tidak melunasi, status PAID melunasi
    r = await req(e, '/admin/gerbang/xendit', { method: 'POST', cookie: owner, body: form({ _csrf: csrf, enabled: 'on', mode: 'test', cur_IDR: 'on', live_pub: '', live_secret: '', live_hook: '', test_pub: '', test_secret: 'xnd_development_rahasia', test_hook: 'token-callback-123' }) });
    assert.match(r.headers.get('location') ?? '', /ok=/);
    inv = await newInvoice(e, member, 'IDR', 'de');
    state.xenditInv = inv.id;
    h = await (await req(e, inv.path, { cookie: member })).text();
    assert.ok(h.includes('data-gw="xendit"') && h.includes('data-gw="stripe"'), 'Xendit + Stripe untuk IDR');
    r = await req(e, `/api/bayar/xendit/${inv.id}`, { method: 'POST', cookie: member, body: form({ _csrf: csrfIn(h) }) });
    assert.equal(r.headers.get('location'), 'https://checkout.xendit.test/xinv_1');
    r = await req(e, '/api/bayar/xendit/webhook', { method: 'POST', body: JSON.stringify({ id: 'xinv_1', status: 'PAID' }), headers: { 'x-callback-token': 'salah' } });
    assert.equal(r.status, 400);
    state.xenditStatus = 'PAID';
    state.xenditAmount = 1000;
    await req(e, '/api/bayar/xendit/webhook', { method: 'POST', body: JSON.stringify({ id: 'xinv_1', status: 'PAID' }), headers: { 'x-callback-token': 'token-callback-123' } });
    assert.ok(!(await (await req(e, inv.path, { cookie: member })).text()).includes('Pembayaran terverifikasi'), 'nominal salah: belum lunas');
    state.xenditAmount = 500_000;
    r = await req(e, `/api/bayar/xendit/kembali/${inv.id}`, { cookie: member });
    assert.match(r.headers.get('location') ?? '', /lunas=1/);

    // Midtrans (IDR): signature_key SHA-512 diverifikasi
    r = await req(e, '/admin/gerbang/midtrans', { method: 'POST', cookie: owner, body: form({ _csrf: csrf, enabled: 'on', mode: 'test', cur_IDR: 'on', live_pub: '', live_secret: '', test_pub: 'SB-Mid-client-abc', test_secret: 'SB-Mid-server-rahasia' }) });
    assert.match(r.headers.get('location') ?? '', /ok=/);
    const m2 = await ownerAndMember(e, 'mid@contoh.id');
    inv = await newInvoice(e, m2.member, 'IDR', 'ja');
    state.midInv = inv.id;
    h = await (await req(e, inv.path, { cookie: m2.member })).text();
    r = await req(e, `/api/bayar/midtrans/${inv.id}`, { method: 'POST', cookie: m2.member, body: form({ _csrf: csrfIn(h) }) });
    const snap = new URL(r.headers.get('location') ?? 'about:blank');
    assert.equal(snap.protocol, 'https:');
    assert.equal(snap.host, 'app.sandbox.midtrans.com');
    assert.ok(snap.pathname.startsWith('/snap/'));
    assert.ok(state.midOrder.startsWith(`${inv.id}~`));
    const note = { order_id: state.midOrder, status_code: '200', gross_amount: '500000.00', transaction_status: 'settlement' };
    r = await req(e, '/api/bayar/midtrans/webhook', { method: 'POST', body: JSON.stringify({ ...note, signature_key: 'palsu' }) });
    assert.equal(r.status, 400);
    r = await req(e, '/api/bayar/midtrans/webhook', { method: 'POST', body: JSON.stringify({ ...note, signature_key: await hex('SHA-512', null, `${note.order_id}${note.status_code}${note.gross_amount}SB-Mid-server-rahasia`) }) });
    assert.equal(r.status, 200);
    assert.ok((await (await req(e, inv.path, { cookie: m2.member })).text()).includes('Pembayaran terverifikasi'));
    // hapus kunci mode aktif → gerbang tersembunyi lagi
    await req(e, '/admin/gerbang/xendit/hapus/test', { method: 'POST', cookie: owner, body: form({ _csrf: csrf }) });
    inv = await newInvoice(e, m2.member, 'IDR', 'de');
    h = await (await req(e, inv.path, { cookie: m2.member })).text();
    assert.ok(!h.includes('data-gw="xendit"') && h.includes('data-gw="midtrans"'));
  } finally {
    globalThis.fetch = realFetch;
  }
});

/* ── tiga bahasa: awalan URL, bahasa awal dari negara, pilihan manual, hreflang, kamus lengkap ─────── */
import { KEYS, t as tr, LANGS } from '../src/lib/i18n.ts';
import { recordQuiz } from '../src/data/progress.ts';
import { Store } from '../src/lib/store.ts';

const BROWSER = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36', accept: 'text/html,application/xhtml+xml' };

test('kamus antarmuka: setiap kunci punya teks Indonesia, Inggris dan Jepang dengan penanda {…} yang sama', () => {
  for (const k of KEYS) {
    const vals = LANGS.map((L) => tr(L, k));
    vals.forEach((v, i) => assert.ok(v.trim().length > 0, `${k} kosong untuk ${LANGS[i]}`));
    const marks = vals.map((v) => (v.match(/\{[a-z]+\}/g) ?? []).sort().join(','));
    assert.ok(marks.every((m) => m === marks[0]), `${k}: penanda berbeda ${marks.join(' | ')}`);
  }
  assert.ok(KEYS.length > 300);
});

test('tiga bahasa: /en dan /ja dirender dalam bahasanya, tautan berawalan, hreflang & kanonik benar', async () => {
  const e = env();
  for (const [path, lang, word] of [['/', 'id', 'Pilih bahasamu'], ['/en/', 'en', 'Choose your language'], ['/ja/', 'ja', '学ぶ言語を選ぶ']] as const) {
    const r = await req(e, path);
    assert.equal(r.status, 200, path);
    assert.equal(r.headers.get('content-language'), lang);
    const h = await r.text();
    assert.ok(h.includes(`<html lang="${lang}"`), `${path}: html lang`);
    assert.ok(h.includes(word), `${path}: teks ${word}`);
    for (const L of ['id', 'en', 'ja']) assert.ok(h.includes(`hreflang="${L}" href="https://luaja.com${L === 'id' ? '' : `/${L}`}/"`), `${path}: hreflang ${L}`);
    assert.ok(h.includes('hreflang="x-default" href="https://luaja.com/"'));
    assert.ok(h.includes(`<link rel="canonical" href="https://luaja.com${path}">`), `${path}: kanonik`);
    if (lang !== 'id') {
      assert.ok(h.includes(`href="/${lang}/harga"`) && h.includes(`href="/${lang}/jerman"`), `${path}: tautan publik berawalan`);
      assert.ok(h.includes('href="/masuk"') && !h.includes(`href="/${lang}/masuk"`), `${path}: tautan akun tanpa awalan`);
      // Kamus klien (window.LJ) ada di <head>; isi <body> tidak boleh memuat kunci kamus mentah.
      assert.ok(!/\b(js|auth|inv|plan|home|price)\.[a-zA-Z0-9.]+/.test(h.slice(h.indexOf('<body'))), `${path}: kunci kamus bocor`);
    }
  }
  // harga mengikuti bahasa: Rupiah, dolar AS, yen
  assert.ok((await (await req(e, '/harga')).text()).includes('Rp500.000'));
  assert.ok((await (await req(e, '/en/harga')).text()).includes('US$32.00'));
  assert.ok((await (await req(e, '/ja/harga')).text()).includes('¥4,800'));
  // halaman jalur, jenjang, pelajaran gratis, latihan, info — semuanya tersedia di /en dan /ja
  for (const p of ['/jerman', '/inggris/beginner', '/belajar/ja-n5-m01-l01', '/latihan?bahasa=de', '/latihan/de-a1-p1', '/coba', '/tentang', '/privasi', '/syarat', '/kontak', '/kredit']) {
    for (const L of ['en', 'ja']) {
      const r = await req(e, `/${L}${p}`);
      assert.equal(r.status, 200, `/${L}${p}`);
      assert.ok((await r.text()).includes(`<html lang="${L}"`), `/${L}${p}`);
    }
  }
  // /en → /en/ ; /en/portal → /portal ; header bahasa dari luar diabaikan
  assert.equal((await req(e, '/en')).headers.get('location'), 'https://luaja.com/en/');
  assert.equal((await req(e, '/ja/portal')).headers.get('location'), '/portal');
  assert.ok((await (await req(e, '/', { headers: { 'x-luaja-ui': 'ja' } })).text()).includes('<html lang="id"'));
  // sitemap: setiap halaman dalam tiga bahasa dengan alternatif
  const sm = await (await req(e, '/sitemap.xml')).text();
  assert.ok(sm.includes('<loc>https://luaja.com/ja/harga</loc>') && sm.includes('<loc>https://luaja.com/en/jerman</loc>') && sm.includes('hreflang="x-default"'));
});

test('bahasa awal dari negara (ID→id, JP→ja, lainnya→en); pilihan manual tersimpan dan selalu menang; perayap tidak dialihkan', async () => {
  const e = env();
  const go = (path: string, cc: string, extra: Record<string, string> = {}) => req(e, path, { headers: { ...BROWSER, 'cf-ipcountry': cc, ...extra } });
  let r = await go('/', 'JP');
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/ja/');
  assert.match(r.headers.get('set-cookie') ?? '', /lj_lang=ja/);
  r = await go('/harga', 'US');
  assert.equal(r.headers.get('location'), '/en/harga');
  r = await go('/', 'ID');
  assert.equal(r.status, 200);
  r = await go('/ja/', 'ID');
  assert.equal(r.headers.get('location'), '/', 'pengunjung Indonesia di /ja/ tanpa pilihan → Indonesia');
  // perayap & permintaan non-HTML tidak dialihkan
  assert.equal((await req(e, '/', { headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', accept: 'text/html', 'cf-ipcountry': 'JP' } })).status, 200);
  assert.equal((await req(e, '/', { headers: { accept: '*/*', 'cf-ipcountry': 'JP' } })).status, 200);
  // pilihan manual menang atas negara
  r = await go('/en/harga?lang=ja', 'ID');
  assert.equal(r.headers.get('location'), '/ja/harga');
  assert.match(r.headers.get('set-cookie') ?? '', /lj_lang=ja/);
  r = await go('/harga', 'ID', { cookie: 'lj_lang=en' });
  assert.equal(r.headers.get('location'), '/en/harga');
  r = await go('/en/harga', 'ID', { cookie: 'lj_lang=en' });
  assert.equal(r.status, 200);
  // jalur dengan garis miring ganda tidak pernah dialihkan ke host lain
  for (const p of ['/en//evil.example/x', '//evil.example/x', '/ja//evil.example']) {
    for (const extra of [{}, { cookie: 'lj_lang=id' }]) {
      const loc = (await go(`${p}?lang=id`, 'ID', extra)).headers.get('location') ?? '';
      assert.ok(loc === '' || (loc.startsWith('/') && !loc.startsWith('//')) || loc.startsWith('https://luaja.com/'), `${p}: ${loc}`);
      const loc2 = (await go(p, 'ID', extra)).headers.get('location') ?? '';
      assert.ok(loc2 === '' || (loc2.startsWith('/') && !loc2.startsWith('//')) || loc2.startsWith('https://luaja.com/'), `${p}: ${loc2}`);
    }
  }
  // pilihan disimpan di akun dan dipakai portal di perangkat lain
  r = await req(e, '/daftar', { method: 'POST', headers: { cookie: 'lj_lang=ja' }, body: form({ name: 'Yuki', email: 'yuki@contoh.jp', password: 'rahasia123', setuju: 'on' }) });
  const session = cookieOf(r);
  let h = await (await req(e, '/portal', { cookie: session })).text();
  assert.ok(h.includes('<html lang="ja"') && h.includes('こんにちは'), 'portal dalam bahasa Jepang dari akun');
  await req(e, '/harga?lang=en', { cookie: session });
  h = await (await req(e, '/portal/paket', { cookie: session })).text();
  assert.ok(h.includes('<html lang="en"') && h.includes('Choose a plan') && h.includes('value="USD" checked'), 'akun berpindah ke Inggris, USD terpilih');
});

test('urutan pelajaran: member membuka pelajaran berikutnya hanya setelah lulus kuis sebelumnya; pengelola selalu terbuka', async () => {
  const e = env();
  let r = await req(e, '/daftar', { method: 'POST', body: form({ name: 'Urut', email: 'urut@contoh.id', password: 'rahasia123', setuju: 'on' }) });
  const member = cookieOf(r);
  // berlangganan Jerman lewat admin
  r = await req(e, '/admin/masuk', { method: 'POST', body: form({ email: 'owner@luaja.test', password: 'owner-pass-123' }) });
  const owner = cookieOf(r);
  let h = await (await req(e, '/portal/paket', { cookie: member })).text();
  r = await req(e, '/portal/paket', { method: 'POST', cookie: member, body: new URLSearchParams({ _csrf: csrfIn(h), kategori: 'umum', mata_uang: 'IDR', bahasa: 'de' }) });
  const invId = new URL(r.headers.get('location')!, 'https://luaja.com').pathname.split('/').pop()!;
  h = await (await req(e, `/portal/tagihan/${invId}`, { cookie: member })).text();
  const png = new File([new Uint8Array([137, 80, 78, 71])], 'bukti.png', { type: 'image/png' });
  const fd = new FormData(); fd.set('_csrf', csrfIn(h)); fd.set('bukti', png);
  await req(e, `/portal/tagihan/${invId}/bukti`, { method: 'POST', cookie: member, body: fd });
  h = await (await req(e, '/admin/pembayaran', { cookie: owner })).text();
  await req(e, `/admin/pembayaran/${invId}/setujui`, { method: 'POST', cookie: owner, body: form({ _csrf: csrfIn(h) }) });
  // l02 terbuka (sebelumnya pelajaran gratis), l03 terkunci sampai l02 lulus
  assert.ok((await (await req(e, '/belajar/de-a1-m01-l02', { cookie: member })).text()).includes('data-lesson'));
  h = await (await req(e, '/belajar/de-a1-m01-l03', { cookie: member })).text();
  assert.ok(!h.includes('data-lesson') && h.includes('Selesaikan pelajaran sebelumnya'), 'l03 terkunci urutan');
  assert.equal((await req(e, '/api/pelajaran/de-a1-m01-l03/cek', { method: 'POST', cookie: member, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ part: 'practice', i: 0, answer: 0 }) })).status, 403);
  const uid = (await new Store(e.DATA).get<{ id: string }>(`u/email/${await sha(('urut@contoh.id'))}`))?.id;
  assert.ok(uid);
  await recordQuiz(new Store(e.DATA), uid!, 'de-a1-m01-l02', 0.9);
  assert.ok((await (await req(e, '/belajar/de-a1-m01-l03', { cookie: member })).text()).includes('data-lesson'), 'l03 terbuka setelah l02 lulus');
  // pengelola: semua terbuka tanpa tagihan
  assert.ok((await (await req(e, '/belajar/de-a1-m01-l05', { cookie: owner })).text()).includes('data-lesson'));
});
async function sha(s: string) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ── pustaka interaktif ──────────────────────────────────────────────── */
import { BOOKS, PREVIEW_PAGES, getBook } from '../src/library/index.ts';
import type { BookDoc } from '../src/library/types.ts';

const OPEN_LICENCES = /^(CC BY 4\.0|CC BY 2\.0 FR|CC BY-SA [34]\.0|CC0|Public domain|Domain publik)$/;
const bookDoc = (id: string) => JSON.parse(fs.readFileSync(new URL(`../public/p/b/${id}.json`, import.meta.url), 'utf8')) as BookDoc;

test('pustaka: setiap buku punya isi, sumber, lisensi terbuka (bukan NC/ND), daftar isi sah dan kunci latihan yang benar', () => {
  assert.ok(BOOKS.length >= 40, `buku ${BOOKS.length}`);
  const ids = new Set<string>();
  for (const b of BOOKS) {
    assert.ok(!ids.has(b.id), `id ganda ${b.id}`); ids.add(b.id);
    assert.match(b.licence, OPEN_LICENCES, `${b.id}: lisensi ${b.licence}`);
    assert.ok(!/NC|ND/.test(b.licence), `${b.id}: lisensi non-komersial/tanpa turunan dilarang`);
    assert.ok(b.source && b.sourceUrl.startsWith('https://') && b.licenceUrl.startsWith('https://'), `${b.id}: sumber/lisensi kosong`);
    const d = bookDoc(b.id);
    assert.equal(d.pages.length, b.pages, `${b.id}: jumlah halaman katalog ≠ isi`);
    for (const [title, page] of b.toc) assert.ok(title && page >= 0 && page < b.pages, `${b.id}: daftar isi ${title} → ${page}`);
    for (const pg of d.pages) {
      assert.ok(pg.t && pg.b.length, `${b.id}: halaman kosong`);
      for (const x of pg.b) {
        if (x.k === 'gap') { assert.equal(x.s.length, x.a.length + 1, `${b.id}: rumpang ${JSON.stringify(x)}`); assert.ok(x.a.every((a) => a.trim()), `${b.id}: kunci rumpang kosong`); }
        if (x.k === 'mc') { assert.ok(x.a >= 0 && x.a < x.o.length && new Set(x.o).size === x.o.length, `${b.id}: pilihan ganda ${JSON.stringify(x)}`); }
        if (x.k === 'aud' || x.k === 'vid') assert.ok(x.src.startsWith('https://'), `${b.id}: media tanpa https ${x.src}`);
        if (x.k === 'voc') assert.ok(x.i.length && x.i.every((it) => it[0] && it[1]), `${b.id}: kosakata kosong`);
        if (x.k === 'sen') assert.ok(x.t && x.id, `${b.id}: kalimat tanpa terjemahan`);
      }
    }
  }
  // Tiga bahasa terwakili; latihan berkunci jawaban ada.
  for (const c of ['de', 'en', 'ja']) assert.ok(BOOKS.some((b) => b.lang === c), `tanpa buku ${c}`);
  assert.ok(BOOKS.reduce((n, b) => n + b.exercises, 0) >= 500);
});

test('pustaka: rak & halaman buku publik; isi penuh hanya untuk member bahasa itu (selain itu pratinjau)', async () => {
  const b = getBook('de-gg-a1')!;
  const asset = fs.readFileSync(new URL(`../public/p/b/${b.id}.json`, import.meta.url));
  const e = env({ ASSETS: { fetch: async (r: Request) => (new URL(r.url).pathname === `/p/b/${b.id}.json` ? new Response(asset, { headers: { 'content-type': 'application/json' } }) : new Response('nf', { status: 404 })) } as unknown as Fetcher });
  const idx = await req(e, '/pustaka?bahasa=de', { headers: { accept: 'text/html', 'cf-ipcountry': 'ID' } });
  assert.equal(idx.status, 200);
  const ih = await idx.text();
  assert.ok(ih.includes(`/pustaka/${b.id}`) && ih.includes('Grimm Grammar'));
  const page = await req(e, `/pustaka/${b.id}`, { headers: { accept: 'text/html', 'cf-ipcountry': 'ID' } });
  const ph = await page.text();
  assert.equal(page.status, 200);
  assert.ok(ph.includes('"@type":"Book"') && ph.includes(b.licence) && ph.includes(`/baca/${b.id}?h=`), 'halaman buku: JSON-LD, lisensi, daftar isi');
  const reader = await req(e, `/baca/${b.id}`, { headers: { accept: 'text/html', 'cf-ipcountry': 'ID' } });
  assert.equal(reader.status, 200);
  assert.ok((reader.headers.get('x-robots-tag') ?? '').includes('noindex') || (await reader.text()).includes('noindex'));
  const anon = (await (await req(e, `/p/b/${b.id}.json`)).json()) as BookDoc & { locked?: boolean; total?: number };
  assert.equal(anon.locked, true);
  assert.equal(anon.pages.length, PREVIEW_PAGES);
  assert.equal(anon.total, b.pages);
  assert.equal((await req(e, '/p/b/tidak-ada.json')).status, 404);
  const sm = await (await req(e, '/sitemap.xml')).text();
  assert.ok(sm.includes(`/pustaka/${b.id}`) && sm.includes('/en/pustaka'));
  const prog = await req(e, '/api/pustaka/progres', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://luaja.com' }, body: JSON.stringify({ book: b.id, page: 0 }) });
  assert.equal(prog.status, 401, 'progres membaca hanya untuk yang masuk');
});
