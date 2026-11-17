/* Pesan & Saran pengunjung (pemilik 17 Nov 2026): pesan ke lembaga tujuan, super admin & yayasan ikut melihat dan membalas
 * atas nama lembaga, hanya super admin yang menampilkan/menyembunyikan, kontak tidak pernah tampil, tautan pribadi. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import { b64url, hmac } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';
import { createUser, type Peran } from '../src/data/users.ts';
import { ensureSeed, listUnits } from '../src/data/site.ts';
import { simpan } from '../src/data/koleksi.ts';
import { PESAN } from '../src/data/defs.ts';
import { ambilSaran } from '../src/data/saran.ts';

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
const form = (e: Env, path: string, data: Record<string, string>, kue = '') => minta(e, path, { method: 'POST', headers: { ...(kue ? { cookie: kue } : {}), 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() });
const teks = async (e: Env, path: string, kue = '') => { const r = await minta(e, path, kue ? { headers: { cookie: kue } } : {}); return { status: r.status, h: await r.text(), loc: r.headers.get('location') ?? '' }; };

test('pesan & saran: pengunjung → lembaga tujuan; yayasan membalas atas nama lembaga; super admin menampilkan', async () => {
  const e = env();
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const units = await listUnits(store);
  const mi = units.find((u) => u.slug.includes('mi'))!;
  const lain = units.find((u) => u.slug !== mi.slug)!;
  const kSuper = await akun(e, 'Uji Super', 'super');
  const kYay = await akun(e, 'Uji Yayasan', 'yayasan');
  const kMi = await akun(e, 'Uji Admin MI', 'lembaga', [mi.slug]);
  const kLain = await akun(e, 'Uji Admin Lain', 'lembaga', [lain.slug]);

  // formulir publik
  const pub = await teks(e, `/saran?untuk=${mi.slug}`);
  assert.equal(pub.status, 200);
  assert.match(pub.h, new RegExp(`<option value="${mi.slug}" selected>`));
  const kirim = await form(e, '/saran', { kategori: 'saran', unit: mi.slug, nama: 'Ibu Uji', sebagai: 'wali', kontak: '0812-3456-7890', isi: 'Mohon jadwal ekstrakurikuler diumumkan lebih awal.', anonim: '1' });
  assert.equal(kirim.status, 303);
  const lacak = kirim.headers.get('location')!;
  assert.match(lacak, /^\/saran\/lacak\/srn_[0-9A-Z]{20}\/[0-9A-Z]{16}\?baru=1$/);
  const id = lacak.split('/')[3]!;
  const halLacak = await teks(e, lacak);
  assert.equal(halLacak.status, 200);
  assert.match(halLacak.h, /Pesan terkirim/);
  assert.match(halLacak.h, /noindex/);
  assert.equal((await teks(e, `/saran/lacak/${id}/AAAAAAAAAAAAAAAA`)).status, 404, 'kode salah ditolak');
  // tanpa isi / nama → ditolak
  assert.match((await form(e, '/saran', { kategori: 'saran', unit: mi.slug, nama: 'X', isi: 'pendek' })).headers.get('location') ?? '', /pesan=kurang/);

  // hak lihat: lembaga tujuan & yayasan ya, lembaga lain tidak
  assert.match((await teks(e, '/portal/saran', kMi)).h, /Ibu Uji/);
  assert.match((await teks(e, '/portal/saran', kYay)).h, /Ibu Uji/);
  assert.doesNotMatch((await teks(e, '/portal/saran', kLain)).h, /Ibu Uji/);
  assert.notEqual((await teks(e, `/portal/saran/${id}`, kLain)).status, 200);
  const detail = await teks(e, `/portal/saran/${id}`, kMi);
  assert.equal(detail.status, 200);
  assert.match(detail.h, /0812-3456-7890/, 'kontak terlihat pengelola');
  assert.match(detail.h, /wa\.me\/6281234567890/);
  assert.equal((await ambilSaran(store, id))!.status, 'dibaca');

  // yayasan membalas — tanda tangan lembaga tujuan, bukan nama penulis
  assert.equal((await form(e, `/portal/saran/${id}/balas`, { isi: 'Terima kasih, jadwal akan diumumkan setiap awal bulan.' }, kYay)).status, 303);
  const s1 = (await ambilSaran(store, id))!;
  assert.equal(s1.status, 'dibalas');
  assert.equal(s1.percakapan[0]!.unit, mi.slug);
  const halBalas = await teks(e, lacak.replace('?baru=1', ''));
  assert.match(halBalas.h, new RegExp(mi.nama.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(halBalas.h, /Uji Yayasan/, 'nama penulis balasan tidak tampil ke pengunjung');

  // tampil/sembunyi hanya super admin
  assert.notEqual((await form(e, `/portal/saran/${id}/tampil`, { tampil: '1' }, kYay)).status, 303);
  assert.doesNotMatch((await teks(e, '/saran')).h, /jadwal ekstrakurikuler/);
  assert.equal((await form(e, `/portal/saran/${id}/tampil`, { tampil: '1', anonim: '1' }, kSuper)).status, 303);
  const dinding = (await teks(e, '/saran')).h;
  assert.match(dinding, /jadwal ekstrakurikuler/);
  assert.match(dinding, /Hamba Allah/, 'nama disamarkan');
  assert.match(dinding, /Terima kasih, jadwal akan diumumkan/, 'balasan lembaga ikut tampil');
  assert.doesNotMatch(dinding, /0812-3456-7890|Ibu Uji/, 'kontak & nama asli tidak pernah tampil');
  assert.equal((await form(e, `/portal/saran/${id}/tampil`, { tampil: '0' }, kSuper)).status, 303);
  assert.doesNotMatch((await teks(e, '/saran')).h, /jadwal ekstrakurikuler/);

  // tanggapan pengunjung → kembali „baru“, lencana menghitungnya
  assert.equal((await form(e, lacak.replace('?baru=1', ''), { isi: 'Baik, terima kasih.' })).status, 303);
  assert.equal((await ambilSaran(store, id))!.status, 'baru');
  const hit = (await (await minta(e, '/portal/pesan/hitung', { headers: { cookie: kMi, accept: 'application/json' } })).json()) as { saran: number };
  assert.equal(hit.saran, 1);

  // teruskan (yayasan) & hapus (super)
  assert.equal((await form(e, `/portal/saran/${id}/teruskan`, { unit: lain.slug }, kYay)).status, 303);
  assert.match((await teks(e, '/portal/saran', kLain)).h, /Ibu Uji/);
  assert.notEqual((await form(e, `/portal/saran/${id}/hapus`, {}, kYay)).status, 303);
  assert.equal((await form(e, `/portal/saran/${id}/hapus`, {}, kSuper)).status, 303);
  assert.equal(await ambilSaran(store, id), null);
});

test('pesan & saran: pesan formulir kontak lama dipindah sekali dengan id yang sama; /portal/k/pesan dialihkan', async () => {
  const e = env();
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const lama = await simpan(store, PESAN, { unit: 'yayasan', status: 'tinjau', judul: 'Bapak Lama', d: { kontak: 'lama@contoh.id', isi: 'Pesan dari formulir kontak lama.' }, penulis: 'publik', penulisNama: 'Formulir kontak' });
  const kYay = await akun(e, 'Uji Yayasan', 'yayasan');
  const kotak = await teks(e, '/portal/saran', kYay);
  assert.match(kotak.h, /Bapak Lama/);
  const s = await ambilSaran(store, lama.id);
  assert.ok(s && s.status === 'baru' && s.kontak === 'lama@contoh.id');
  assert.ok(await store.get('k/saran-pindah.json'));
  assert.equal((await teks(e, '/portal/k/pesan', kYay)).loc, '/portal/saran');
  assert.equal((await teks(e, `/portal/k/pesan/${lama.id}`, kYay)).loc, `/portal/saran/${lama.id}`);
  // kontak lama di formulir /kontak kini masuk Pesan & Saran
  const r = await form(e, '/kontak', { nama: 'Pengunjung Kontak', kontak: 'a@b.id', unit: 'yayasan', isi: 'Bagaimana cara mendaftar MI tahun depan?' });
  assert.match(r.headers.get('location') ?? '', /^\/saran\/lacak\//);
});
