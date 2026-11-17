/* Panduan (perintah pemilik 40; 17 Nov 2026 „kurang interaktif“): panduan portal per menu (langkah satu per satu, tur langsung,
   kemajuan), tombol ? dan Tur di setiap halaman portal, panduan siswa publik dengan simulasi masuk dan soal contoh. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import { b64url, hmac } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';
import { createUser, type Peran } from '../src/data/users.ts';
import { ensureSeed } from '../src/data/site.ts';
import { jangkarPanduan, PANDUAN_PORTAL } from '../src/pages/panduan.ts';
import { turPortal, TUR_SISWA_BERANDA, TUR_SISWA_MASUK, type Tur } from '../src/pages/tur.ts';
import { normalTanggal } from '../src/lib/tanggal.ts';
import { normalTanggal as normalTanggalSiswa } from '../src/data/siswa.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = { fetch: async (req: Request) => { try { return new Response(fs.readFileSync(PUB + new URL(req.url).pathname.replace(/^\/+/, ''))); } catch { return new Response('tidak ada', { status: 404 }); } } } as unknown as Fetcher;
const RAHASIA = 'rahasia-uji-0123456789abcdef';
const env = (): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: RAHASIA });
const minta = (e: Env, path: string, init: RequestInit = {}) => worker.fetch(new Request(`https://yapida.sch.id${path}`, { redirect: 'manual', ...init }) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
async function akun(e: Env, nama: string, peran: Peran, units: string[] = []) {
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const u = await createUser(store, { nama, peran, units, pin: '40917', pepper: 'p', wajibGanti: false });
  const body = b64url(new TextEncoder().encode(JSON.stringify({ u: u.id, v: u.sv, x: Date.now() + 3_600_000 })));
  return `__Host-yp=${body}.${await hmac(RAHASIA, body)}`;
}

test('panduan siswa publik: cara masuk dan mengerjakan latihan; ditautkan dari halaman masuk', async () => {
  const e = env();
  const h = await (await minta(e, '/siswa/panduan')).text();
  assert.match(h, /Cara masuk Portal Siswa/);
  assert.match(h, /NISN/);
  assert.match(h, /Serahkan/);
  assert.match(h, /pembahasan/);
  assert.match(h, /data-sim-masuk/, 'simulasi masuk');
  assert.match(h, /data-contoh-form/, 'soal contoh yang bisa diserahkan');
  assert.match(h, /\/assets\/panduan-siswa\.js\?v=/);
  const masuk = await (await minta(e, '/siswa')).text();
  assert.match(masuk, /href="\/siswa\/panduan"/);
  assert.match(masuk, /data-tur-mulai/, 'tombol tur cara masuk');
  assert.deepEqual(turDari(masuk)?.id, TUR_SISWA_MASUK.id);
  assert.match(masuk, /\/assets\/tur\.js\?v=/);
  for (const l of TUR_SISWA_MASUK.langkah) if (l.el) assert.ok(adaDi(masuk, l.el), `elemen tur siswa ada: ${l.el}`);
  assert.ok(TUR_SISWA_BERANDA.otomatis, 'tur beranda siswa diputar sekali saat pertama masuk');
  // simulasi memakai pembaca tanggal yang sama dengan halaman masuk asli
  assert.equal(normalTanggal, normalTanggalSiswa);
  for (const t of ['30/04/2015', '30-04-2015', '300415', '30 April 2015']) assert.equal(normalTanggal(t), '2015-04-30', t);
});

/** Data tur di halaman (script#tur-data). */
function turDari(h: string): Tur | null {
  const m = /<script type="application\/json" id="tur-data">([\s\S]*?)<\/script>/.exec(h);
  return m ? (JSON.parse(m[1]!) as Tur) : null;
}
/** Pemilih CSS sederhana ada di HTML: salah satu alternatif (a, b) yang semua kelas/atribut/id-nya muncul. */
function adaDi(h: string, sel: string): boolean {
  const kelas = new Set<string>();
  for (const m of h.matchAll(/class="([^"]*)"/g)) for (const k of m[1]!.split(/\s+/)) kelas.add(k);
  return sel.split(',').some((alt) => {
    const t = alt.trim();
    const cls = [...t.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map((m) => m[1]!);
    const atr = [...t.matchAll(/\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/g)].map((m) => [m[1]!, m[2]] as const);
    const id = [...t.matchAll(/#([a-zA-Z0-9_-]+)/g)].map((m) => m[1]!);
    const tag = [...t.matchAll(/(?:^|[\s>])([a-z][a-z0-9]*)(?=[.[#:\s]|$)/g)].map((m) => m[1]!);
    return cls.every((k) => kelas.has(k)) && atr.every(([a, v]) => (v === undefined ? new RegExp(`\\s${a}[\\s=>]`).test(h) : h.includes(`${a}="${v}"`))) && id.every((x) => h.includes(`id="${x}"`)) && tag.every((x) => h.includes(`<${x}`));
  });
}

test('panduan portal: menurut peran, bisa lihat semua, tombol ? membuka bagian menu yang sedang dibuka', async () => {
  const e = env();
  const kGuru = await akun(e, 'Uji Guru Panduan', 'kontributor', ['mi-al-huda']);
  assert.equal((await minta(e, '/portal/panduan')).status, 302, 'harus masuk dulu');
  const h = await (await minta(e, '/portal/panduan', { headers: { cookie: kGuru } })).text();
  assert.match(h, /id="bank-soal"/);
  assert.doesNotMatch(h, /id="akun"/, 'menu Akun & PIN tidak untuk kontributor');
  assert.match(h, /panduan\?semua=1/);
  assert.match(await (await minta(e, '/portal/panduan?semua=1', { headers: { cookie: kGuru } })).text(), /id="akun"/);
  const bs = await (await minta(e, '/portal/bank-soal', { headers: { cookie: kGuru } })).text();
  assert.match(bs, /href="\/portal\/panduan#bank-soal"/);
  assert.equal(jangkarPanduan('/portal/k/kabar'), 'isi');
  assert.equal(jangkarPanduan('/portal/k/ppdb'), 'ppdb');
  assert.equal(jangkarPanduan('/portal/bank-soal/baru'), 'bank-soal');
  assert.ok(PANDUAN_PORTAL.every((b) => b.langkah.length > 0));
  // kartu interaktif: langkah satu per satu, tur langsung, kemajuan
  assert.match(h, /data-pd-kartu/);
  assert.match(h, /data-pd-cincin/);
  assert.match(h, /href="\/portal\/bank-soal\?tur=1"/, 'tur langsung ke menu');
  assert.match(h, /\/assets\/panduan\.js\?v=/);
  assert.match(await (await minta(e, '/portal/panduan?semua=1', { headers: { cookie: kGuru } })).text(), /Tidak tersedia untuk peran Anda/);
});

test('tur interaktif di setiap halaman portal: tombol Tur + data tur yang menunjuk elemen asli', async () => {
  const e = env();
  const k = await akun(e, 'Uji Super Tur', 'super');
  const h = { headers: { cookie: k } };
  // halaman bertur khusus: setiap elemen yang disorot ada di halamannya (kecuali yang hanya muncul bila ada data)
  const BERSYARAT = new Set(['.ks-aksi-sel', '.sr-p-daftar, .p-kartu', '#massal', '.p-tabel, .ks-tabel', '.bs-p-daftar, .bs-peta-gulir', '.p-tabel']);
  for (const path of ['/portal', '/portal/panduan', '/portal/bank-soal', '/portal/saran', '/portal/akun', '/portal/pengguna', '/portal/tagihan', '/portal/siswa']) {
    const html = await (await minta(e, path, h)).text();
    const tur = turDari(html);
    assert.ok(tur, `tur ada di ${path}`);
    assert.match(html, /data-tur-mulai/, `tombol Tur di ${path}`);
    assert.match(html, /\/assets\/tur\.css\?v=/);
    for (const l of tur!.langkah) if (l.el && !BERSYARAT.has(l.el)) assert.ok(adaDi(html, l.el), `${path}: elemen tur „${l.judul}“ (${l.el}) ada di halaman`);
  }
  assert.equal(turDari(await (await minta(e, '/portal', h)).text())?.otomatis, true, 'tur dasbor diputar sekali otomatis');
  // halaman lain: tur umum dari panduan menunya
  const kabar = turPortal('/portal/k/kabar', '/portal/k/kabar');
  assert.equal(kabar?.bagian, 'isi');
  assert.ok(kabar?.langkah.some((l) => l.el === '.p-tabel'));
  const tulis = turPortal('/portal/k/kabar/baru', '/portal/k/kabar');
  assert.ok(tulis?.langkah.some((l) => l.el === '[name="judul"]'), 'tur formulir menulis isi');
  assert.equal(tulis?.id, 'portal-k-kabar-isi');
  assert.equal(turPortal('/portal/k/kabar/abcdef0123456789', '/portal/k/kabar')?.id, 'portal-k-kabar-isi');
  const lap = turPortal('/portal/laporan', '/portal/laporan');
  assert.equal(lap?.bagian, 'laporan');
  // data tur tidak bisa menutup tag script
  assert.doesNotMatch(JSON.stringify(turPortal('/portal', '/portal')).replace(/</g, '\\u003c'), /<\/script/i);
});
