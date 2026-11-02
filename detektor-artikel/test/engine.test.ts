import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preprocess, splitSentences, detectLang } from '../src/engine/preprocess.ts';
import { stylometry, traces } from '../src/engine/stylometry.ts';
import { roundTo100, composition, decideLabel, DEFAULT_THRESHOLDS, fuseAll, type Signals } from '../src/engine/fuse.ts';
import { aspectValue, languageBand, ruleErrors, LOMBA_ESAI, categoryOf, RUBRICS } from '../src/engine/rubrics.ts';
import { minhash, jaccardEstimate, regenOverlap } from '../src/engine/similarity.ts';
import { estimateTokens, tokensFor, predictPages, predictByMode, packagePrice, tokenPriceIdr, tokenCostIdr, minRevenueMultiple, AFFILIATE_MAX_SHARE } from '../src/engine/pricing.ts';
import { DEFAULT_ENGINE, DEFAULT_BILLING } from '../src/data/settings.ts';
import { seal, unseal, hashPassword, verifyPassword, totpAt, base32Encode } from '../src/lib/crypto.ts';
import { Store, type R2Like } from '../src/lib/store.ts';
import { qrSvg } from '../src/lib/qr.ts';

const ID_TEXT = `Literasi Digital

Minggu lalu adik saya menunjukkan pesan berantai tentang beras plastik. Ia percaya karena pesannya diteruskan tiga grup keluarga. Dr. Ani dari puskesmas dll. ikut membantahnya.

Di era digital yang terus berkembang ini, literasi digital memainkan peran yang sangat penting. Selain itu, kemampuan memilah informasi tidak hanya membantu individu, tetapi juga masyarakat.

Daftar Pustaka
Kominfo. 2024. Laporan Hoaks Tahunan. Jakarta.`;

test('pra-proses: kalimat, singkatan, daftar pustaka, bahasa', () => {
  const pp = preprocess(ID_TEXT);
  assert.equal(pp.lang, 'id');
  assert.ok(pp.paragraphs.some((p) => p.kind === 'heading'));
  assert.ok(pp.paragraphs.some((p) => p.kind === 'references'));
  const body = pp.sentences.filter((s) => !s.excluded);
  assert.ok(body.some((s) => s.text.includes('Dr. Ani dari puskesmas dll. ikut membantahnya.')), 'singkatan tidak memecah kalimat');
  assert.ok(pp.excludedWords > 0);
  assert.equal(splitSentences('Saya pergi. Dia datang! Apa kabar?').length, 3);
  assert.equal(detectLang('The quick brown fox jumps over the lazy dog and it was fine with the result of this.'), 'en');
});

test('stilometri & jejak salin-tempel dalam rentang', () => {
  const pp = preprocess(ID_TEXT);
  const s = stylometry(pp);
  assert.ok(s.doc >= 0.03 && s.doc <= 0.97);
  const tr = traces('**Kesimpulan:** Tentu! Berikut adalah esai Anda.', preprocess('**Kesimpulan:** Tentu! Berikut adalah esai Anda.'));
  assert.ok(tr.boost > 2, 'jejak chatbot menaikkan sinyal');
});

test('persen selalu berjumlah 100', () => {
  for (const parts of [[1, 1, 1], [3, 0, 7], [0.2, 0.33, 0.47], [0, 0, 0]]) {
    const r = roundTo100(parts);
    assert.equal(r.reduce((a, b) => a + b, 0), 100);
  }
  const pp = preprocess(ID_TEXT);
  const sig: Signals = { stylo: stylometry(pp), traceBoost: 0, traceSentences: [], regen: null, a: null, b: null, sonnet: null, opus: null };
  const comp = composition(pp, fuseAll(pp, sig, DEFAULT_THRESHOLDS));
  assert.equal(comp.ai + comp.mix + comp.hum, 100);
});

test('label jujur: teks pendek tidak diberi vonis', () => {
  assert.equal(decideLabel(100, 0.99, { ai: 90, mix: 5, hum: 5 }, { level: 'high', pm: 3 }, DEFAULT_THRESHOLDS), 'short');
  assert.equal(decideLabel(800, 0.95, { ai: 80, mix: 10, hum: 10 }, { level: 'high', pm: 3 }, DEFAULT_THRESHOLDS), 'ai');
  assert.equal(decideLabel(800, 0.05, { ai: 2, mix: 5, hum: 93 }, { level: 'high', pm: 3 }, DEFAULT_THRESHOLDS), 'human');
  assert.equal(decideLabel(800, 0.5, { ai: 10, mix: 30, hum: 60 }, { level: 'low', pm: 20 }, DEFAULT_THRESHOLDS), 'unsure');
});

test('rubrik form lomba: contoh form = 86,25', () => {
  const levels = { tema: 4, sistematika: 3, gagasan: 4, kejelasan: 3, bahasa: 3 } as Record<string, number>;
  const total = LOMBA_ESAI.aspects.reduce((a, x) => a + aspectValue(levels[x.key]!, x.weight), 0);
  assert.equal(total, 86.25);
  assert.equal(categoryOf(total), 'excellent');
  for (const r of RUBRICS) assert.equal(r.aspects.reduce((a, x) => a + x.weight, 0), 100, `bobot ${r.id} = 100`);
});

test('kesalahan bahasa per 1.000 kata mengikuti ambang form', () => {
  assert.equal(languageBand(2, 1000).level, 4);
  assert.equal(languageBand(5, 1248).level, 3);
  assert.equal(languageBand(8, 1000).level, 2);
  assert.equal(languageBand(11, 1000).level, 1);
  const errs = ruleErrors('Hal ini di jelaskan dalam praktek sehari-hari dll lalu hoax menyebar.');
  const wrong = errs.map((e) => e.wrong.toLowerCase());
  assert.ok(wrong.includes('di jelaskan') && wrong.includes('praktek') && wrong.includes('hoax') && wrong.includes('dll'));
  assert.equal(ruleErrors('Kami bertemu di pekan depan.').length, 0, 'kata depan "di pekan" bukan kesalahan');
});

test('kemiripan & overlap regenerasi', () => {
  const a = 'Literasi digital adalah kemampuan memeriksa sumber sebelum membagikan informasi kepada orang lain di grup keluarga.';
  assert.equal(jaccardEstimate(minhash(a), minhash(a)), 1);
  assert.ok(jaccardEstimate(minhash(a), minhash('Kucing tidur di atas sofa sepanjang siang karena hujan turun deras sekali.')) < 0.2);
  assert.ok(regenOverlap(a, a) > 0.9);
});

test('token: satuan tetap, harga ikut markup 10–500×', () => {
  const b20 = { ...DEFAULT_BILLING, markup: 20 };
  const b200 = { ...DEFAULT_BILLING, markup: 200 };
  const e20 = estimateTokens(1000, 'auto', true, b20, DEFAULT_ENGINE);
  const e200 = estimateTokens(1000, 'auto', true, b200, DEFAULT_ENGINE);
  assert.ok(e20.reserve >= e20.typical && e20.typical >= e20.min && e20.min >= 1);
  // Token = satuan kerja AI: jumlah token khas tidak berubah ketika markup diubah.
  assert.equal(e200.typical, e20.typical, 'token khas tidak tergantung markup');
  assert.equal(tokensFor(0.0105, b20), 11);
  assert.equal(tokensFor(0, b20), 0);
  // Harga jual ikut markup: 10× markup = 10× harga per token dan per paket (± pembulatan).
  assert.ok(Math.abs(tokenPriceIdr(b200, DEFAULT_ENGINE) / tokenPriceIdr(b20, DEFAULT_ENGINE) - 10) < 1e-9);
  const pkg = DEFAULT_BILLING.packages[1];
  const p20 = packagePrice(pkg, b20, DEFAULT_ENGINE);
  const p200 = packagePrice(pkg, b200, DEFAULT_ENGINE);
  assert.ok(p200.idr / p20.idr > 9.9 && p200.idr / p20.idr < 10.1, `paket ${p20.idr} → ${p200.idr}`);
  assert.equal(p20.costIdr, p200.costIdr, 'modal paket tidak ikut markup');
  assert.ok(p20.idr > p20.costIdr * 10, 'harga paket > modal');
  // Prediksi per halaman: token sama, Rupiah per halaman ikut markup.
  const m20 = predictByMode(1000, b20, DEFAULT_ENGINE);
  const m200 = predictByMode(1000, b200, DEFAULT_ENGINE);
  for (let i = 0; i < m20.length; i++) {
    assert.deepEqual(m20[i].perPage, m200[i].perPage);
    assert.ok(m200[i].idrPerPage.high >= m20[i].idrPerPage.high * 9.5);
  }
  const f = estimateTokens(1000, 'forensic', true, b20, DEFAULT_ENGINE);
  assert.ok(f.typical > e20.typical);
  const pr = predictPages(1000, b20, DEFAULT_ENGINE, null);
  assert.ok(pr.pages.low <= pr.pages.high && pr.perPage.low <= pr.perPage.high);
  assert.equal(tokenCostIdr(b20, DEFAULT_ENGINE), DEFAULT_BILLING.tokenUnitUsd * DEFAULT_ENGINE.fx);
});

test('kripto: enkripsi, sandi, TOTP RFC 6238', async () => {
  const s = await seal('kunci-uji-yang-panjang', { a: 1 });
  assert.deepEqual(await unseal('kunci-uji-yang-panjang', s), { a: 1 });
  const h = await hashPassword('rahasia-123');
  assert.ok(await verifyPassword('rahasia-123', h));
  assert.ok(!(await verifyPassword('salah', h)));
  const secret = base32Encode(new TextEncoder().encode('12345678901234567890'));
  assert.equal(await totpAt(secret, Math.floor(59 / 30)), '287082');
});

class FakeR2 implements R2Like {
  m = new Map<string, { v: string; etag: string; meta?: Record<string, string>; up: Date }>();
  n = 0;
  async get(k: string) {
    const o = this.m.get(k);
    return o ? { etag: o.etag, text: async () => o.v } : null;
  }
  async head(k: string) {
    const o = this.m.get(k);
    return o ? { etag: o.etag, uploaded: o.up, customMetadata: o.meta } : null;
  }
  async put(k: string, v: string | ArrayBuffer | ReadableStream, opts?: { onlyIf?: { etagMatches?: string; etagDoesNotMatch?: string }; customMetadata?: Record<string, string> }) {
    const cur = this.m.get(k);
    if (opts?.onlyIf?.etagDoesNotMatch === '*' && cur) return null;
    if (opts?.onlyIf?.etagMatches && cur?.etag !== opts.onlyIf.etagMatches) return null;
    const etag = `e${++this.n}`;
    this.m.set(k, { v: String(v), etag, meta: opts?.customMetadata, up: new Date() });
    return { etag };
  }
  async delete(keys: string | string[]) {
    for (const k of Array.isArray(keys) ? keys : [keys]) this.m.delete(k);
  }
  async list(o?: { prefix?: string; limit?: number }) {
    const objects = [...this.m.entries()].filter(([k]) => k.startsWith(o?.prefix ?? '')).sort(([a], [b]) => a.localeCompare(b)).slice(0, o?.limit ?? 1000)
      .map(([key, x]) => ({ key, uploaded: x.up, size: x.v.length, etag: x.etag, customMetadata: x.meta }));
    return { objects, truncated: false };
  }
}

test('R2 Store: create-once & compare-and-swap tanpa kehilangan tulisan', async () => {
  const st = new Store(new FakeR2());
  assert.equal(await st.createOnce('u/x', { a: 1 }), true);
  assert.equal(await st.createOnce('u/x', { a: 2 }), false);
  await Promise.all(Array.from({ length: 20 }, () => st.cas<{ n: number }>('c/ctr.json', (c) => ({ n: (c?.n ?? 0) + 1 }))));
  assert.equal((await st.get<{ n: number }>('c/ctr.json'))!.n, 20);
  await st.createOnce('i/a/2~id2', {}, { t: 'b' });
  const { items } = await st.list<{ t: string }>('i/a/');
  assert.equal(items[0]!.id, 'id2');
  assert.equal(items[0]!.meta.t, 'b');
});

test('QR verifikasi berupa SVG', () => {
  const svg = qrSvg('https://detektor-artikel.axto.workers.dev/v/7Q4K-92XD');
  assert.ok(svg.startsWith('<svg') && svg.includes('<path'));
});

test('dompet token: bayar dulu, idempoten, tidak bisa minus', async () => {
  const { credit, reserve, refund, balanceOf, InsufficientError } = await import('../src/data/wallet.ts');
  const st = new Store(new FakeR2());
  await assert.rejects(reserve(st, 'u1', 10, 'cek', 'chk1'), InsufficientError);
  assert.equal(await credit(st, 'u1', 100, 'purchase', 'pesanan', 'order:o1'), true);
  assert.equal(await credit(st, 'u1', 100, 'purchase', 'pesanan', 'order:o1'), false, 'pesanan yang sama tidak menambah dua kali');
  assert.equal(await balanceOf(st, 'u1'), 100);
  await reserve(st, 'u1', 60, 'cek', 'chk1');
  await reserve(st, 'u1', 60, 'cek', 'chk1');
  assert.equal(await balanceOf(st, 'u1'), 40, 'pesanan ganda untuk pemeriksaan yang sama tidak memotong dua kali');
  await refund(st, 'u1', 25, 'sisa', 'settle:chk1');
  await refund(st, 'u1', 25, 'sisa', 'settle:chk1');
  assert.equal(await balanceOf(st, 'u1'), 65, 'pengembalian diulang tidak ganda');
  await Promise.all(Array.from({ length: 10 }, (_, i) => credit(st, 'u1', 1, 'admin', 'x', `adj${i}`)));
  assert.equal(await balanceOf(st, 'u1'), 75, 'kredit bersamaan tidak hilang');
});

test('afiliasi: komisi 15% tepat sekali per pesanan', async () => {
  const { ensureAffiliate, payCommission, getAffiliate } = await import('../src/data/affiliate.ts');
  const st = new Store(new FakeR2());
  await ensureAffiliate(st, 'ref');
  assert.equal(await payCommission(st, 'ref', 'ord1', 'b@x.id', 500_000, 15), 75_000);
  assert.equal(await payCommission(st, 'ref', 'ord1', 'b@x.id', 500_000, 15), 0);
  assert.equal((await getAffiliate(st, 'ref'))!.balanceIdr, 75_000);
});

test('pengaman tidak-rugi: pesanan ≥ biaya terburuk pada markup minimum, diskon & komisi terbesar', async () => {
  const { hardBoundUsd } = await import('../src/engine/pricing.ts');
  for (const markup of [10, 20, 500]) {
    const b = { ...DEFAULT_BILLING, markup, packages: DEFAULT_BILLING.packages.map((p) => ({ ...p, discountPct: 50 })) };
    assert.equal(minRevenueMultiple(b), markup * 0.5);
    for (const mode of ['auto', 'haiku', 'sonnet', 'opus', 'forensic'] as const) {
      for (const w of [150, 600, 3000, 12000]) {
        const e = estimateTokens(w, mode, true, b, DEFAULT_ENGINE);
        const worstIdr = hardBoundUsd(w, mode, true, DEFAULT_ENGINE) * DEFAULT_ENGINE.fx;
        // Pendapatan terkecil dari token yang disisihkan: harga × (1 − diskon 50 %) × (1 − komisi terbesar).
        const minRevenue = e.reserve * tokenPriceIdr(b, DEFAULT_ENGINE) * 0.5 * (1 - AFFILIATE_MAX_SHARE);
        assert.ok(minRevenue >= worstIdr, `${markup}× ${mode} ${w} kata: pendapatan Rp ${Math.round(minRevenue)} ≥ terburuk Rp ${Math.round(worstIdr)}`);
      }
    }
  }
});
