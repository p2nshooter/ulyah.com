/**
 * Portal Siswa (perintah pemilik 22, 24): siswa tidak mendaftar — masuk dengan NISN (atau NIS lokal) + tanggal lahir
 * dalam bentuk apa pun (30/04/2015, 300415, 30 April 2015 …). Langsung di kelasnya (naik otomatis setiap Juli), yang
 * lulus/pindah/keluar tidak bisa masuk. Melihat tagihan & kwitansi (bisa dicetak), penghargaan, bank soal kelasnya, dan
 * biodata (NIK & KK disamarkan). Sesi: cookie __Host-ysw bertanda tangan HMAC, 12 jam, gugur bila NISN/NIS/tanggal
 * lahir diubah admin. Salah sandi dikunci bertahap per nomor + batas laju per IP (KV).
 */
import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { asalSama } from '../lib/session.ts';
import { b64url, fromB64url, hmac, sha256Hex, timingSafeEqual } from '../lib/crypto.ts';
import { limit } from '../lib/ratelimit.ts';
import { hariIni } from '../lib/text.ts';
import { media, render } from '../lib/render.ts';

import { ambil, type Dok } from '../data/koleksi.ts';
import { listUnits } from '../data/site.ts';
import { masukSiswa, posisi, jenjangUnit } from '../data/siswa.ts';
import { milikSiswa } from '../data/kait.ts';
import { kopUntuk } from '../data/dokumen.ts';
import { getSitus, getUnit } from '../data/site.ts';
import { RAK } from '../data/buku.ts';
import { riwayatKelas } from '../data/kesiswaan.ts';
import { halamanCetak, kwitansiHtml } from '../pages/cetak.ts';
import { berandaSiswa, masukSiswaPage } from '../pages/siswa.ts';
import { biodataSiswa, kopLembaga } from './kesiswaan.ts';

export const siswa = new Hono<HonoEnv>();

const KUE = '__Host-ysw';
const JAM = 12;
interface Muatan { s: string; h: string; x: number }

function rahasia(c: Ctx): string {
  const s = c.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET belum dipasang.');
  return `${s}:portal-siswa`;
}
/** Sidik data masuk: berubah bila admin mengganti NISN/NIS/tanggal lahir → sesi lama gugur. */
const sidik = async (d: Dok) => (await sha256Hex(`${d.d.nisn ?? ''}|${d.d.nis ?? ''}|${d.d.tanggalLahir ?? ''}`)).slice(0, 16);

async function mulaiSesi(c: Ctx, d: Dok): Promise<void> {
  const body = b64url(new TextEncoder().encode(JSON.stringify({ s: d.id, h: await sidik(d), x: Date.now() + JAM * 3_600_000 } satisfies Muatan)));
  setCookie(c, KUE, `${body}.${await hmac(rahasia(c), body)}`, { path: '/', secure: true, httpOnly: true, sameSite: 'Lax', maxAge: JAM * 3600 });
}

async function sesiSiswa(c: Ctx): Promise<Dok | null> {
  const token = getCookie(c, KUE);
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  try { if (!timingSafeEqual(await hmac(rahasia(c), body), mac)) return null; } catch { return null; }
  let p: Muatan;
  try { p = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Muatan; } catch { return null; }
  if (!p || typeof p.x !== 'number' || p.x < Date.now() || typeof p.s !== 'string') return null;
  const d = await ambil(c.get('store'), 'siswa', p.s);
  if (!d || (await sidik(d)) !== p.h) return null;
  return posisi(d.d, d.unit).status === 'aktif' ? d : null; // lulus/pindah/keluar → keluar otomatis
}

const ipDari = (c: Ctx) => c.req.header('cf-connecting-ip') ?? 'lokal';
const halamanMasuk = (c: Ctx, o: { galat?: string; nomor?: string; pesan?: string } = {}, status: 200 | 400 | 429 = 200) =>
  render(c, { path: '/siswa', title: 'Portal Siswa — Yayasan Al-Huda Yapida', desc: 'Masuk Portal Siswa Yayasan Al-Huda Yapida dengan NISN atau NIS dan tanggal lahir.', body: masukSiswaPage(o), noindex: true, noAds: true, noStore: true, kelas: 'hal-siswa', css: ['siswa.css'] }, status);

siswa.get('/siswa', async (c) => {
  const d = await sesiSiswa(c);
  if (!d) return halamanMasuk(c, { pesan: c.req.query('ok') === 'keluar' ? 'Anda sudah keluar. Sampai jumpa!' : undefined });
  const store = c.get('store');
  const nomor = [String(d.d.nisn ?? ''), String(d.d.nis ?? '')].filter(Boolean);
  const [tagihan, kwitansi, penghargaan, units] = await Promise.all([milikSiswa(store, nomor, 'tagihan'), milikSiswa(store, nomor, 'kwitansi'), milikSiswa(store, nomor, 'penghargaan'), listUnits(store, true)]);
  const p = posisi(d.d, d.unit);
  const j = jenjangUnit(d.unit);
  const rak = RAK.find((r) => r.id === (j === 'RA' ? 'ra' : j === 'MI' ? 'mi' : j === 'MTs' ? 'mts' : ''));
  const res = await render(c, {
    path: '/siswa', title: `${d.judul} — Portal Siswa Yapida`, desc: 'Portal Siswa Yayasan Al-Huda Yapida.', noindex: true, noAds: true, noStore: true, kelas: 'hal-siswa', css: ['siswa.css'],
    body: berandaSiswa({ nama: d.judul, foto: typeof d.d.foto === 'string' ? d.d.foto : undefined, lembaga: units.find((u) => u.slug === d.unit)?.singkat ?? d.unit, p, d: d.d, riwayat: riwayatKelas(d.d, d.unit), tagihan, kwitansi, penghargaan: penghargaan.filter((x) => x.s !== 'arsip'), hari: hariIni(), rak: rak ? { href: `/pustaka/rak/${rak.id}`, nama: `Rak ${rak.nama}` } : undefined, mediaUrl: (f) => media(c)(f) }),
  });
  res.headers.set('x-robots-tag', 'noindex, nofollow');
  return res;
});

siswa.post('/siswa/masuk', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const f = await c.req.parseBody();
  const nomor = String(f.nomor ?? '').replace(/\D/g, '').slice(0, 20);
  const sandi = String(f.sandi ?? '').slice(0, 40);
  if (!(await limit(c.env, `siswa-masuk:${ipDari(c)}`, 40, 900))) return halamanMasuk(c, { galat: 'Terlalu banyak percobaan dari jaringan ini. Coba lagi 15 menit lagi.', nomor }, 429);
  if (nomor.length < 3 || !sandi.trim()) return halamanMasuk(c, { galat: 'Isi NISN/NIS dan tanggal lahir.', nomor }, 400);
  const h = await masukSiswa(c.get('store'), nomor, sandi);
  if (!h.ok || !h.d) return halamanMasuk(c, { galat: h.pesan ?? 'Tidak bisa masuk.', nomor }, 400);
  await mulaiSesi(c, h.d);
  return c.redirect('/siswa');
});

siswa.post('/siswa/keluar', (c) => {
  deleteCookie(c, KUE, { path: '/', secure: true });
  return c.redirect('/siswa?ok=keluar');
});

/** Kwitansi milik siswa (NISN/NIS di kwitansi = NISN/NIS siswa), satu rangkap. */
siswa.get('/siswa/kwitansi/:id', async (c) => {
  const d = await sesiSiswa(c);
  if (!d) return c.redirect('/siswa');
  const store = c.get('store');
  const kw = await ambil(store, 'kwitansi', c.req.param('id'));
  const milik = new Set([String(d.d.nisn ?? ''), String(d.d.nis ?? '')].filter(Boolean));
  if (!kw || !milik.has(String(kw.d.nisn ?? ''))) return c.notFound();
  const [s, u] = await Promise.all([getSitus(store), kw.unit === 'yayasan' ? null : getUnit(store, kw.unit)]);
  const k = await kopUntuk(store, kw.unit, s, u);
  return c.html(halamanCetak({ judul: `Kwitansi ${String(kw.d.nomor ?? '')}`, isi: kwitansiHtml(kw, k, media(c), { rangkap: 1 }), ukuran: 'a4p', kembali: '/siswa' }), 200, { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' });
});

siswa.get('/siswa/biodata', async (c) => {
  const d = await sesiSiswa(c);
  if (!d) return c.redirect('/siswa');
  const kl = await kopLembaga(c, d.unit);
  return c.html(halamanCetak({ judul: `Biodata ${d.judul}`, isi: biodataSiswa(d, kl, media(c), true), ukuran: 'a4p', kembali: '/siswa' }), 200, { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' });
});


