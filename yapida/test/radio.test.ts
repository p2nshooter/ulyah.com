/* Radio Qur'an LIVE: durasi dari kepala MP3, daftar qari sedunia (sumber tiruan), garis waktu siaran yang terus maju, dan
 * hitungan khatam. Jalankan: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FakeR2 } from './fake-r2.ts';
import { Store } from '../src/lib/store.ts';
import { daftarQari, durasiMp3, pilihQari, siaran, QARI_CADANGAN, type Siaran } from '../src/data/radio.ts';
import { detak } from '../src/detak.ts';
import type { Env } from '../src/env.ts';

/** Kepala bingkai MPEG-1 Layer III 128 kbps 44,1 kHz stereo (+ opsional tag Xing dengan jumlah bingkai). */
function bingkai(xingFrames?: number): Uint8Array {
  const b = new Uint8Array(1200);
  b.set([0xff, 0xfb, 0x90, 0x00], 0);
  if (xingFrames !== undefined) {
    const x = 4 + 32;
    b.set([0x58, 0x69, 0x6e, 0x67, 0, 0, 0, 1], x); // "Xing", flag frames
    b.set([(xingFrames >>> 24) & 255, (xingFrames >>> 16) & 255, (xingFrames >>> 8) & 255, xingFrames & 255], x + 8);
  }
  return b;
}

test('durasi MP3: CBR dari ukuran berkas, VBR dari tag Xing, tag ID3 dilewati', () => {
  // 128 kbps = 16.000 byte/detik → 1.600.000 byte ≈ 100 detik.
  assert.ok(Math.abs(durasiMp3(bingkai(), 1_600_000)! - 100) < 0.1);
  // Xing 3.828 bingkai × 1.152 sampel / 44.100 Hz ≈ 100 detik.
  assert.ok(Math.abs(durasiMp3(bingkai(3828), 999_999)! - 100) < 0.1);
  const id3 = new Uint8Array(10 + 20 + 1200);
  id3.set([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 20], 0);
  id3.set(bingkai(), 30);
  assert.ok(Math.abs(durasiMp3(id3, 1_600_030)! - 100) < 0.1);
  assert.equal(durasiMp3(new Uint8Array(500), 1000), null);
});

function tiruan(): { env: Env; store: Store; panggilan: string[] } {
  const DATA = new FakeR2() as unknown as R2Bucket;
  const panggilan: string[] = [];
  const asli = globalThis.fetch;
  globalThis.fetch = (async (u: string | URL | Request, init?: RequestInit) => {
    const url = String(u instanceof Request ? u.url : u);
    panggilan.push(url);
    if (url.startsWith('https://mp3quran.uji/api/v3/reciters')) {
      const ar = url.includes('language=ar');
      const reciters = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1, name: ar ? `قارئ ${i + 1}` : `Qari ${i + 1}`,
        moshaf: [{ id: 10 + i, name: i === 7 ? 'Rewayat Warsh A\'n Nafi\' - Murattal' : 'Rewayat Hafs A\'n Assem - Murattal', server: `https://server${i + 6}.mp3quran.net/q${i}/`, surah_total: i === 6 ? 100 : 114 }],
      }));
      return Response.json({ reciters });
    }
    if (/mp3quran\.net\/q\d\/\d{3}\.mp3$/.test(url)) {
      const surah = Number(url.slice(-7, -4));
      const ukuran = 16_000 * (30 + surah); // 30 + nomor surah detik
      const h = new Headers(init?.headers);
      assert.ok(h.get('range'), 'durasi dibaca dengan permintaan Range');
      return new Response(bingkai(), { status: 206, headers: { 'content-range': `bytes 0-1199/${ukuran}` } });
    }
    return asli(u as RequestInfo, init);
  }) as typeof fetch;
  return { env: { DATA, MP3QURAN_BASE: 'https://mp3quran.uji' } as unknown as Env, store: new Store(DATA), panggilan };
}

test('daftar qari: hanya Hafs dengan 114 surah dari server mp3quran, disimpan sehari', async () => {
  const asli = globalThis.fetch;
  try {
    const { env, store, panggilan } = tiruan();
    const q = await daftarQari(env, store, 1_000);
    assert.equal(q.length, 6, 'Warsh dan mushaf tidak lengkap tidak ikut');
    assert.equal(q[0]!.namaAr, 'قارئ 1');
    const n = panggilan.length;
    await daftarQari(env, store, 2_000);
    assert.equal(panggilan.length, n, 'dibaca dari R2, bukan diminta lagi');
    assert.equal(pilihQari(q, 3, 18).id, pilihQari(q, 3, 18).id, 'pilihan qari tetap untuk putaran & surah yang sama');
  } finally { globalThis.fetch = asli; }
});

test('siaran: maju sendiri mengikuti waktu, surah 114 → 1 menambah khatam, semua pendengar mendapat posisi yang sama', async () => {
  const asli = globalThis.fetch;
  try {
    const { env, store } = tiruan();
    const t0 = 1_700_000_000_000;
    const a = await siaran(env, store, t0);
    assert.equal(a!.s.surah, 1);
    assert.equal(a!.s.durasi, 31);
    assert.equal(a!.s.khatam, 0);
    // 10 detik kemudian masih surah yang sama, posisi sama untuk semua.
    const b = await siaran(env, store, t0 + 10_000);
    assert.deepEqual([b!.s.surah, b!.s.mulai], [1, t0]);
    // Setelah surah 1 selesai (31 dtk + jeda), surah 2 mulai tepat saat surah 1 berakhir.
    const c = await siaran(env, store, t0 + 40_000);
    assert.equal(c!.s.surah, 2);
    assert.equal(c!.s.mulai, t0 + 31_000 + 2_500);
    // Lompat ke akhir putaran: tulis keadaan surah 114 yang sudah selesai.
    const akhir: Siaran = { ...c!.s, surah: 114, mulai: t0, durasi: 30, qari: c!.s.qari };
    await store.put('k/radio/siaran.json', akhir);
    const d = await siaran(env, store, t0 + 40_000);
    assert.equal(d!.s.surah, 1);
    assert.equal(d!.s.putaran, akhir.putaran + 1);
    assert.equal(d!.s.khatam, akhir.khatam + 1, 'satu putaran = satu khatam');
    // Detak tiap menit (RPC) memajukan siaran walau tidak ada pendengar.
    const h = await detak(env, t0 + 3_600_000);
    assert.match(h.radio!, /putaran \d+ surah \d+ khatam \d+/);
  } finally { globalThis.fetch = asli; }
});

test('siaran: sumber qari tidak terjangkau → cadangan bawaan tetap mengudara', async () => {
  const asli = globalThis.fetch;
  globalThis.fetch = (async () => { throw new Error('jaringan putus'); }) as typeof fetch;
  try {
    const DATA = new FakeR2() as unknown as R2Bucket;
    const r = await siaran({ DATA } as unknown as Env, new Store(DATA), 5_000);
    assert.ok(QARI_CADANGAN.some((q) => q.id === r!.q.id));
    assert.equal(r!.s.surah, 1);
    assert.equal(r!.s.durasi, 60, 'durasi cadangan bila berkas tak terbaca');
  } finally { globalThis.fetch = asli; }
});
