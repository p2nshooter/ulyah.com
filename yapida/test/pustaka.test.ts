/* Perpustakaan digital Yapida: naskah → bab + aktivitas ala Wordwall, adegan suasana, seed SQL, peringkat, rute.
 * Tanpa PDF dan tanpa unduhan (perintah pemilik). Jalankan: npm test (katalog dibuat lebih dulu oleh `pretest`). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import type { Env } from '../src/env.ts';
import { AKTIVITAS, RAK, RAK_ID, denganSuasana, suasanaBab, uraiNaskah, type Bab, type BukuMeta } from '../src/data/buku.ts';
import { catatBaca, lupakanPeringkat, peringkat, rekapkan, sepuluh, setelSuka, sudahSuka } from '../src/data/statistik.ts';
import { jeniusAktif } from '../src/data/luar.ts';
import { barisInsert } from '../scripts/sql-seed.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = {
  fetch: async (req: Request) => {
    const f = PUB + new URL(req.url).pathname.replace(/^\/+/, '');
    if (f.includes('..')) return new Response('tidak ada', { status: 404 });
    try { return new Response(fs.readFileSync(f)); } catch { return new Response('tidak ada', { status: 404 }); }
  },
} as unknown as Fetcher;
const env = (extra: Partial<Env> = {}): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: 'rahasia-uji-0123456789abcdef', ...extra });
const get = (e: Env, path: string, init?: RequestInit) => worker.fetch(new Request(`https://yapida.sch.id${path}`, init) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
const katalog = JSON.parse(fs.readFileSync(PUB + 'assets/pustaka/katalog.json', 'utf8')) as { buku: BukuMeta[] };

test('naskah: bab, judul Arab, blok bahasa, dan aktivitas ::kuis ::kartu ::cocok ::adegan', () => {
  const { meta, bab } = uraiNaskah([
    '---', 'id: uji', 'judul: Buku Uji', 'rak: ra, cerita', '---', '',
    '## Menanam | الزِّرَاعَةُ', '', '::adegan padi | Siram sawahnya!', '', 'Pak Tani menanam padi.', '',
    '::ar بِسْمِ اللّٰهِ', '::en In the name of Allah', '',
    '## Ayo Bermain!', '', '::kuis Padi tumbuh di … | gurun | *sawah | laut', '::kartu أَرُزٌّ | Padi / Rice',
    '::cocok 1 = Satu ; 2 = Dua', '- butir', '> kutipan',
  ].join('\n'));
  assert.equal(meta.judul, 'Buku Uji');
  assert.equal(meta.rak, 'ra, cerita');
  assert.equal(bab.length, 2);
  assert.equal(bab[0]!.judulAr, 'الزِّرَاعَةُ');
  assert.deepEqual(bab[0]!.blok.map((b) => b.t), ['adegan', 'p', 'ar', 'en']);
  assert.equal(bab[0]!.blok[0]!.x, 'padi | Siram sawahnya!');
  assert.deepEqual(bab[1]!.blok.map((b) => b.t), ['kuis', 'kartu', 'cocok', 'li', 'q']);
  assert.ok(bab[1]!.blok[0]!.x.includes('*sawah'));
  for (const t of ['kuis', 'kartu', 'cocok', 'adegan'] as const) assert.ok(AKTIVITAS.includes(t));
});

test('adegan suasana: sesuai tema bab, hanya buku anak, tidak menimpa adegan yang sudah ada', () => {
  const bab = (judul: string, x: string): Bab => ({ n: 1, judul, blok: [{ t: 'p', x }] });
  assert.equal(suasanaBab(bab('Pak Tani', 'Pak tani pergi ke sawah menanam padi.')), 'padi');
  assert.equal(suasanaBab(bab('Nabi Nuh', 'Nabi Nuh membuat kapal besar di tengah daratan.')), 'laut');
  assert.equal(suasanaBab(bab('Waktu Sholat', 'Sholat subuh sebelum matahari terbit.')), 'sholat');
  assert.equal(suasanaBab(bab('Bab 1', 'Bilangan pecahan dan desimal.')), null);
  const anak = denganSuasana(bab('Kebun', 'Pohon mangga berbuah lebat.'), 'anak');
  assert.equal(anak.blok[0]!.t, 'adegan');
  assert.ok(anak.blok[0]!.x.startsWith('kebun |'));
  assert.equal(denganSuasana(bab('Kebun', 'Pohon mangga berbuah lebat.'), 'dewasa').blok.length, 1, 'buku dewasa tanpa adegan otomatis');
  const sudah: Bab = { n: 1, judul: 'Padi', blok: [{ t: 'adegan', x: 'hujan | x' }, { t: 'p', x: 'sawah' }] };
  assert.equal(denganSuasana(sudah, 'anak'), sudah);
});

test('seed SQL ulyah.com: VALUES bertingkat, kutip ganda, sambungan ||, NULL, dan bentuk SELECT', () => {
  const sql = [
    "INSERT OR IGNORE INTO kisah (id, judul, isi, urut) VALUES (1, 'Nabi Adam', 'Kisah ''pertama''', 1), (2, 'Nabi Nuh', 'Bahtera ' || 'besar', NULL);",
    "INSERT INTO lain (a) VALUES ('abaikan');",
    "INSERT INTO kisah (id, judul, isi, urut) SELECT 3, 'Nabi Hud', (SELECT x FROM y), 3;",
  ].join('\n');
  const r = barisInsert(sql, 'kisah');
  assert.equal(r.length, 3);
  assert.deepEqual(r[0], { id: '1', judul: 'Nabi Adam', isi: "Kisah 'pertama'", urut: '1' });
  assert.equal(r[1]!.isi, 'Bahtera besar');
  assert.equal(r[1]!.urut, null);
  assert.equal(r[2]!.judul, 'Nabi Hud');
  assert.equal(r[2]!.isi, null, 'subkueri menjadi null');
});

test('katalog bawaan: tanpa PDF/unduhan, rak buku anak per bahasa, jenius dimatikan', () => {
  assert.equal(jeniusAktif(env()), false);
  assert.equal(jeniusAktif({ JENIUS_AKTIF: '1' }), true);
  assert.ok(katalog.buku.length >= 150, `jumlah buku ${katalog.buku.length}`);
  assert.ok(!RAK.some((r) => r.id === 'sma'));
  for (const id of ['ra', 'cerita', 'anak-en', 'anak-ar', 'mi', 'mts', 'kitab', 'kisah', 'hadits']) assert.ok(RAK_ID[id], id);
  const ids = new Set<string>();
  for (const b of katalog.buku) {
    assert.ok(!ids.has(b.id), `id ganda ${b.id}`); ids.add(b.id);
    assert.ok(!/pdf/i.test(JSON.stringify(b)), `${b.id}: tanpa PDF`);
    for (const r of b.rak) assert.ok(RAK_ID[r], `${b.id}: rak ${r}`);
    if (b.bahasa === 'en' && (b.suara === 'anak' || b.suara === 'balita')) assert.ok(b.rak.includes('anak-en') || b.rak.includes('bahasa'), `${b.id}: buku anak berbahasa Inggris`);
    assert.ok(fs.existsSync(`${PUB}assets/pustaka/b/${b.id}/1.json`), `${b.id}: bab 1`);
  }
  const padi = katalog.buku.find((b) => b.id === 'k-menanam-padi');
  assert.ok(padi);
  const bab1 = JSON.parse(fs.readFileSync(`${PUB}assets/pustaka/b/k-menanam-padi/1.json`, 'utf8')) as Bab;
  assert.equal(bab1.blok[0]!.t, 'adegan');
  assert.ok(bab1.blok[0]!.x.startsWith('padi'));
});

test('peringkat: baca dicatat, suka sekali per pengunjung, batal suka mengurangi, rekap aman', async () => {
  lupakanPeringkat();
  const store = new Store(new FakeR2() as unknown as R2Bucket);
  const t0 = Date.UTC(2026, 10, 15, 8, 10);
  await catatBaca(store, 'k-hijaiyah', t0);
  await catatBaca(store, 'k-hijaiyah', t0 + 1000);
  await catatBaca(store, 'k-menanam-padi', t0);
  await catatBaca(store, '../jahat', t0);
  assert.equal(await setelSuka(store, 'k-hijaiyah', 'pengunjung-a', true, t0), true);
  assert.equal(await setelSuka(store, 'k-hijaiyah', 'pengunjung-a', true, t0), true, 'suka ganda tidak dihitung lagi');
  await setelSuka(store, 'k-hijaiyah', 'pengunjung-b', true, t0);
  await setelSuka(store, 'k-hijaiyah', 'pengunjung-b', false, t0);
  assert.equal(await sudahSuka(store, 'k-hijaiyah', 'pengunjung-a'), true);
  assert.equal(await sudahSuka(store, 'k-hijaiyah', 'pengunjung-b'), false);
  const p = await peringkat(store, t0 + 5000);
  assert.deepEqual(p.baca, { 'k-hijaiyah': 2, 'k-menanam-padi': 1 });
  assert.deepEqual(p.suka, { 'k-hijaiyah': 1 });
  // Dua jam kemudian: jam tadi masuk rekap; dua rekap bersamaan hanya satu yang menulis.
  lupakanPeringkat();
  const t1 = t0 + 2 * 3600_000;
  await Promise.all([rekapkan(store, t1), rekapkan(store, t1)]);
  lupakanPeringkat();
  const q = await peringkat(store, t1);
  assert.deepEqual(q.baca, { 'k-hijaiyah': 2, 'k-menanam-padi': 1 });
  assert.deepEqual(sepuluh(q.baca, (id) => id !== 'k-menanam-padi'), [{ id: 'k-hijaiyah', n: 2 }]);
});

test('rute perpustakaan: beranda, rak, detail, pembaca, API bab dengan adegan, tanpa PDF', async () => {
  const e = env();
  for (const p of ['/pustaka', '/pustaka/rak/ra', '/pustaka/rak/anak-en', '/pustaka/rak/anak-ar', '/pustaka/rak/hadits?hal=1', '/pustaka/b/k-menanam-padi', '/pustaka/b/k-menanam-padi/1', '/pustaka/cari?q=padi']) {
    const r = await get(e, p);
    assert.equal(r.status, 200, p);
    const h = await r.text();
    assert.ok(!/\.pdf\b|unduh pdf|download/i.test(h), `${p}: tanpa PDF/unduhan`);
    assert.ok(!h.includes('undefined') && !h.includes('[object Object]'), `${p}: tidak ada nilai bocor`);
  }
  const baca = await (await get(e, '/pustaka/b/k-menanam-padi/1')).text();
  assert.ok(baca.includes('/assets/adegan.js') && baca.includes('/assets/pustaka.js'), 'pembaca memuat mesin adegan');
  assert.ok(baca.includes('data-akt="adegan"') && baca.includes('data-adegan="padi"'));
  assert.ok(baca.includes('data-adegan-reset'), 'tombol ↺ Kembalikan');
  assert.equal((await get(e, '/pustaka/rak/tidak-ada')).status, 404);
  assert.equal((await get(e, '/pustaka/b/k-tidak-ada')).status, 404);
  const api = await get(e, '/pustaka/api/b/k-menanam-padi/2');
  assert.equal(api.status, 200);
  const bab = (await api.json()) as Bab;
  assert.ok(bab.blok.length > 0);
  // Bab buku anak bertema sholat dibuka dengan adegan waktu sholat.
  const sholat = (await (await get(e, '/pustaka/api/b/k-waktu-sholat/1')).json()) as Bab;
  assert.equal(sholat.blok[0]!.t, 'adegan');
});

test('API baca & suka: hanya dari situs sendiri, id diperiksa, suka sekali per pengunjung', async () => {
  const e = env();
  const kirim = (path: string, body: unknown, asal = 'same-origin', cookie = '') => get(e, path, { method: 'POST', headers: { 'content-type': 'application/json', 'sec-fetch-site': asal, ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });
  assert.equal((await kirim('/pustaka/api/baca', { id: 'k-hijaiyah' }, 'cross-site')).status, 403);
  assert.equal((await kirim('/pustaka/api/baca', { id: '../x' })).status, 400);
  assert.equal((await kirim('/pustaka/api/baca', { id: 'k-tidak-ada' })).status, 404);
  assert.equal((await kirim('/pustaka/api/baca', { id: 'k-hijaiyah' })).status, 200);
  const r1 = await kirim('/pustaka/api/suka', { id: 'k-hijaiyah', suka: true });
  assert.equal(r1.status, 200);
  const kue = (r1.headers.get('set-cookie') ?? '').split(';')[0]!;
  assert.ok(kue.includes('='), 'kuki pengunjung dibuat');
  lupakanPeringkat();
  const r2 = await kirim('/pustaka/api/suka', { id: 'k-hijaiyah', suka: true }, 'same-origin', kue);
  assert.deepEqual(await r2.json(), { ok: true, suka: true, n: 1 });
  const status = await get(e, '/pustaka/api/suka/k-hijaiyah', { headers: { cookie: kue } });
  assert.deepEqual(await status.json(), { suka: true });
});

test('gambar Book Dash: hanya id bd- dan berkas gambar; selebihnya 404 tanpa mengambil dari luar', async () => {
  const e = env();
  for (const p of ['/pustaka/m/k-hijaiyah/cover.jpg', '/pustaka/m/bd-a-tiny-seed/cover.svg', '/pustaka/m/bd-a-tiny-seed/..%2Fx.jpg', '/pustaka/m/bd-A/cover.jpg']) {
    assert.equal((await get(e, p)).status, 404, p);
  }
  // Sudah tersimpan di R2 media: dilayani langsung dari sana.
  await e.MEDIA.put('pustaka/bd-a-tiny-seed/cover.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), { httpMetadata: { contentType: 'image/jpeg' } });
  const r = await get(e, '/pustaka/m/bd-a-tiny-seed/cover.jpg');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'image/jpeg');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('semua buku anak interaktif: adegan + „Ayo Bermain!“ (kuis isian, urutkan, kartu) dari isi bab, tetap dan sopan', async () => {
  const { hidupkanBab } = await import('../src/data/aktif.ts');
  const { blokHtml } = await import('../src/pages/pustaka.ts');
  const meta = { id: 'k-uji-anak', suara: 'anak' as const, bahasa: 'id', rak: ['cerita'] };
  const bab: Bab = { n: 1, judul: 'Zahra Bersepeda', blok: [
    { t: 'p', x: 'Sore itu Zahra sudah tidak sabar ingin bersepeda di halaman rumah. Ia menunggu giliran dengan hati yang sabar dan gembira.' },
    { t: 'p', x: 'Zahra membantu ibunya menyiram bunga di taman sambil menunggu sepeda. Kakaknya pulang membawa sepeda baru berwarna merah.' },
    { t: 'p', x: 'Zahra pun bersepeda dengan riang mengelilingi halaman rumah. Allah menyayangi anak yang sabar dan suka menolong ibunya.' },
    { t: 'ar', x: 'بِسْمِ اللّٰهِ' }, { t: 'tr', x: 'Dengan nama Allah.' },
  ] };
  const h = hidupkanBab(bab, meta);
  assert.equal(h.blok[0]!.t, 'adegan', 'adegan di awal bab');
  assert.ok(['rumah', 'kebun', 'langit', 'gunung'].includes(h.blok[0]!.x.split('|')[0]!.trim()));
  assert.ok(h.blok.some((b) => b.t === 'h' && b.x.includes('Ayo Bermain')));
  const kuis = h.blok.filter((b) => b.t === 'kuis');
  assert.ok(kuis.length >= 1);
  for (const k of kuis) {
    const [tanya, ...pil] = k.x.split('|').map((s) => s.trim());
    const benar = pil.filter((p) => p.startsWith('*'));
    assert.equal(benar.length, 1, 'tepat satu jawaban benar');
    assert.equal(pil.length, 3);
    const jawab = benar[0]!.slice(1);
    assert.ok(tanya!.includes('……'));
    assert.ok(bab.blok.some((b) => b.x.includes(tanya!.replace('……', jawab))), 'kalimat asli utuh setelah diisi');
    for (const p of pil) assert.ok(!/^\*?(allah|nabi|rasul)/i.test(p), 'sebutan mulia tidak jadi pilihan');
  }
  const urut = h.blok.find((b) => b.t === 'urut');
  assert.ok(urut, 'urutkan cerita');
  const butir = urut!.x.split('|')[1]!.split(';;').map((s) => s.trim());
  assert.equal(butir.length, 4);
  const teks = bab.blok.map((b) => b.x).join(' ');
  for (let i = 1; i < butir.length; i += 1) assert.ok(teks.indexOf(butir[i - 1]!) < teks.indexOf(butir[i]!), 'urutan sesuai cerita');
  assert.ok(h.blok.some((b) => b.t === 'kartu' && b.x === 'بِسْمِ اللّٰهِ | Dengan nama Allah.'), 'kartu Arab ↔ arti');
  assert.deepEqual(hidupkanBab(bab, meta), h, 'hasil tetap untuk buku dan bab yang sama');
  // Buku dewasa tidak diubah; bab yang sudah punya permainan tidak ditambah permainan otomatis.
  assert.equal(hidupkanBab(bab, { ...meta, suara: 'dewasa' as const }), bab);
  const punya: Bab = { ...bab, blok: [...bab.blok, { t: 'kuis', x: 'Tanya? | *ya | tidak' }] };
  assert.equal(hidupkanBab(punya, meta).blok.filter((b) => b.t === 'kuis').length, 1);
  // Naskah portal bisa menulis ::urut; HTML-nya membawa butir sebagai data (di-escape).
  const naskah = uraiNaskah('## Bab\n\n::urut Urutkan! | Bangun tidur ;; Wudhu ;; Sholat <b>Subuh</b>');
  assert.equal(naskah.bab[0]!.blok[0]!.t, 'urut');
  const html = blokHtml(naskah.bab[0]!.blok[0]!);
  assert.ok(html.includes('data-akt="urut"') && html.includes('&lt;b&gt;') && !html.includes('<b>Subuh'));
});

test('semua bab buku anak bawaan mendapat adegan, dan hampir semua mendapat permainan', async () => {
  const { hidupkanBab } = await import('../src/data/aktif.ts');
  let bab = 0, adegan = 0, main = 0;
  // Buku cerita bawaan (k-…). Buku pelajaran BSE (s-…) mendapat adegan hanya bila tema babnya cocok — diuji terpisah.
  for (const m of katalog.buku.filter((b) => b.id.startsWith('k-') && (b.suara === 'anak' || b.suara === 'balita'))) {
    for (const r of m.bab) {
      const asli = JSON.parse(fs.readFileSync(`${PUB}assets/pustaka/b/${m.id}/${r.n}.json`, 'utf8')) as Bab;
      const h = hidupkanBab(asli, m);
      // Buku berbahasa asing atau bergambar sendiri: adegan hanya bila temanya cocok (tidak dihitung di sini).
      if (m.bahasa !== 'id' || asli.blok.some((b) => b.t === 'img')) { if (h.blok.some((b) => b.t === 'kuis' || b.t === 'urut' || b.t === 'kartu' || b.t === 'cocok')) main += 0; continue; }
      bab += 1;
      if (h.blok.some((b) => b.t === 'adegan')) adegan += 1;
      if (h.blok.some((b) => b.t === 'kuis' || b.t === 'urut' || b.t === 'kartu' || b.t === 'cocok')) main += 1;
    }
  }
  assert.ok(bab > 150, `bab anak ${bab}`);
  assert.equal(adegan, bab, 'setiap bab anak punya adegan');
  assert.ok(main / bab >= 0.9, `bab dengan permainan ${main}/${bab}`);
});

test('buku pelajaran BSE: tiap kelas MI & MTs punya buku, bab terbuka, dan setiap bab punya latihan', async () => {
  const { hidupkanBab } = await import('../src/data/aktif.ts');
  const bse = katalog.buku.filter((b) => b.id.startsWith('s-'));
  assert.ok(bse.length >= 40, `buku BSE ${bse.length}`);
  for (let k = 1; k <= 9; k += 1) assert.ok(bse.some((b) => b.kelas === `Kelas ${k}`), `kelas ${k}`);
  let bab = 0, latihan = 0;
  for (const m of bse) {
    assert.ok(m.rak.includes(Number(m.kelas?.replace(/\D/g, '')) <= 6 ? 'mi' : 'mts'), m.id);
    for (const r of m.bab) {
      const h = hidupkanBab(JSON.parse(fs.readFileSync(`${PUB}assets/pustaka/b/${m.id}/${r.n}.json`, 'utf8')) as Bab, m);
      bab += 1;
      if (h.blok.some((b) => b.t === 'kuis' || b.t === 'urut' || b.t === 'kartu' || b.t === 'cocok')) latihan += 1;
    }
  }
  assert.ok(latihan / bab >= 0.9, `bab BSE dengan latihan ${latihan}/${bab}`);
});

test('BSE pembaca pemula: baris huruf kecil tanpa tanda baca menjadi kalimat berkapital dan bertitik', async () => {
  const { kalimatPemula, keBlok } = await import('../scripts/bse-ubah.ts');
  assert.deepEqual(kalimatPemula(['mulailah melompat dengan kaki kanan', 'kemudian ganti dengan kaki kiri', 'apakah kamu bisa']), ['Mulailah melompat dengan kaki kanan.', 'Kemudian ganti dengan kaki kiri.', 'Apakah kamu bisa?']);
  // Baris sambungan (kata sambung di ujung/awal) digabung, pilihan jawaban menjadi butir.
  assert.deepEqual(kalimatPemula(['binatang yang memiliki kuku tajam kambing', 'atau harimau']), ['Binatang yang memiliki kuku tajam kambing atau harimau?'.replace('?', '.')]);
  assert.deepEqual(kalimatPemula(['yang termasuk bagian pohon adalah …', 'a daun', 'b kertas']), ['Yang termasuk bagian pohon adalah …', 'a. daun', 'b. kertas']);
  const blok = keBlok(['latihan melompat', '', 'mari bermain di luar kelas', 'ambil sebuah kardus', '', 'sumber dokumentasi penerbit', '', 'gambar 1.8', 'latihan melompat dapat', 'memperkuat otot kaki'], { pemula: true });
  assert.deepEqual(blok.map((b) => b.t), ['h', 'p', 'cat']);
  assert.equal(blok[1]!.x, 'Mari bermain di luar kelas. Ambil sebuah kardus.');
});
