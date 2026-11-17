/**
 * Rute Pesan & Saran (src/data/saran.ts): /saran (formulir + pesan yang ditampilkan), /saran/lacak/:id/:kode (halaman
 * pribadi pengunjung), dan /portal/saran (kotak masuk pengelola: balas atas nama lembaga, status, teruskan, tampil/sembunyi,
 * hapus). Halaman pribadi & portal tidak pernah di-cache dan tidak diindeks.
 */
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { asalSama } from '../lib/session.ts';
import { limit } from '../lib/ratelimit.ts';
import { origin, render, tidakAda } from '../lib/render.ts';
import { crumbs } from '../pages/layout.ts';
import { html } from '../lib/html.ts';
import { listUnits } from '../data/site.ts';
import { lingkupSemua, PERAN, tingkat } from '../data/users.ts';
import {
  ambilSaran, balas, bersihTeks, bolehLihat, bolehTampilkan, bolehTeruskan, daftarSaran, daftarTampil, hapusSaran, kirimSaran, kodeCocok, KODE_RE, MAKS_ISI,
  pindahkanPesanLama, SEBAGAI, setStatus, setTampil, tandaiDibaca, tanggapi, teruskan, URUT_KATEGORI, type KategoriSaran, type StatusSaran,
} from '../data/saran.ts';
import { detailSaranPage, formSaran, kotakSaranPage, lacakPage, namaUnitSaran, saranPage, type KartuTampil } from '../pages/saran.ts';
import { jaga, tampil, tolak } from './portal.ts';

export const saran = new Hono<HonoEnv>();
const PER_HAL = 10;
const ip = (c: Ctx) => c.req.header('cf-connecting-ip') ?? 'lokal';
const STATUS_OK = ['baru', 'dibaca', 'dibalas', 'selesai'];

/* ── publik ──────────────────────────────────────────────────────────────────────────────────────────────────── */

saran.get('/saran', async (c) => {
  const store = c.get('store');
  const units = await listUnits(store);
  const semua = await daftarTampil(store, { limit: 1000 });
  const jumlahPer: Record<string, number> = {};
  for (const x of semua) jumlahPer[x.u] = (jumlahPer[x.u] ?? 0) + 1;
  const lembaga = jumlahPer[c.req.query('lembaga') ?? ''] ? c.req.query('lembaga')! : '';
  const pilih = lembaga ? semua.filter((x) => x.u === lembaga) : semua;
  const hal = Math.max(1, Math.min(200, Number(c.req.query('hal')) || 1));
  const halIni = pilih.slice((hal - 1) * PER_HAL, hal * PER_HAL);
  const kartu: KartuTampil[] = await Promise.all(halIni.map(async (meta) => ({ meta, doc: await ambilSaran(store, meta.id) })));
  const untuk = c.req.query('untuk') ?? '';
  const form = formSaran(units, { untuk: untuk === 'yayasan' || units.some((u) => u.slug === untuk) ? untuk : undefined, pesan: c.req.query('pesan'), jenis: c.req.query('jenis') });
  return render(c, {
    path: lembaga || hal > 1 ? `/saran?${lembaga ? `lembaga=${lembaga}` : ''}${hal > 1 ? `${lembaga ? '&' : ''}hal=${hal}` : ''}` : '/saran',
    aktif: 'kontak', noStore: Boolean(c.req.query('pesan')),
    title: 'Pesan & Saran — Yayasan Al-Huda Yapida',
    desc: 'Kirim saran, pertanyaan, kesan, atau keluhan langsung ke lembaga Yayasan Al-Huda Yapida (RA, MI, MTs, pondok pesantren, TPQ, masjid dan unit lainnya) dan baca balasannya.',
    body: saranPage({ units, form, kartu: kartu.filter((k) => k.doc?.tampil), lembaga, jumlahPer, hal, lanjut: pilih.length > hal * PER_HAL }),
    jsonLd: [crumbs(origin(c), [['Pesan & Saran', '/saran']])],
  });
});

saran.post('/saran', async (c) => {
  const kembali = (k: string, untuk = '') => c.redirect(`/saran?pesan=${k}${untuk ? `&untuk=${encodeURIComponent(untuk)}` : ''}#tulis`, 303);
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const f = await c.req.parseBody();
  if (String(f.situsweb ?? '')) return c.redirect('/saran', 303);
  const store = c.get('store');
  const units = await listUnits(store);
  const unit = String(f.unit ?? 'yayasan');
  if (unit !== 'yayasan' && !units.some((u) => u.slug === unit)) return kembali('tujuan');
  const nama = bersihTeks(f.nama, 80).replace(/\s+/g, ' ');
  const isi = bersihTeks(f.isi, MAKS_ISI);
  const kategori = String(f.kategori ?? '') as KategoriSaran;
  if (nama.length < 2 || isi.length < 10 || !URUT_KATEGORI.includes(kategori)) return kembali('kurang', unit);
  if (!(await limit(c.env, `saran:${ip(c)}`, 5, 3600))) return kembali('batas', unit);
  const sebagai = SEBAGAI.some(([v]) => v === f.sebagai) ? String(f.sebagai) : 'lainnya';
  const s = await kirimSaran(store, { unit, kategori, nama, anonim: f.anonim === '1', kontak: bersihTeks(f.kontak, 120).replace(/\s+/g, ' '), sebagai, isi });
  return c.redirect(`/saran/lacak/${s.id}/${s.kode}?baru=1`, 303);
});

async function halamanLacak(c: Ctx, kilat?: string) {
  const s = await ambilSaran(c.get('store'), c.req.param('id') ?? '');
  const kode = c.req.param('kode') ?? '';
  if (!s || !KODE_RE.test(kode) || !kodeCocok(s, kode)) return tidakAda(c);
  const units = await listUnits(c.get('store'));
  const url = `${origin(c)}/saran/lacak/${s.id}/${s.kode}`;
  return render(c, { path: '/saran', aktif: 'kontak', noindex: true, noStore: true, noAds: true, title: 'Pesan Anda — Yayasan Al-Huda Yapida', desc: 'Halaman pribadi pesan & saran.', body: lacakPage({ s, units, url, baru: c.req.query('baru') === '1', kilat }) });
}
saran.get('/saran/lacak/:id/:kode', (c) => halamanLacak(c, c.req.query('ok') === '1' ? 'Tanggapan Anda terkirim ke lembaga.' : undefined));

saran.post('/saran/lacak/:id/:kode', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const store = c.get('store');
  const s = await ambilSaran(store, c.req.param('id'));
  const kode = c.req.param('kode');
  if (!s || !kodeCocok(s, kode)) return tidakAda(c);
  const f = await c.req.parseBody();
  const kembali = `/saran/lacak/${s.id}/${s.kode}`;
  if (String(f.situsweb ?? '')) return c.redirect(kembali, 303);
  const isi = bersihTeks(f.isi, MAKS_ISI);
  if (isi.length < 2) return c.redirect(kembali, 303);
  if (!(await limit(c.env, `saran-t:${ip(c)}`, 10, 3600))) return c.redirect(kembali, 303);
  await tanggapi(store, s.id, isi);
  return c.redirect(`${kembali}?ok=1`, 303);
});

/* ── portal ──────────────────────────────────────────────────────────────────────────────────────────────────── */

const pastikan = async (c: Ctx, next: () => Promise<void>) => (c.get('user') ? next() : jaga(c, next));
saran.use('/portal/saran', pastikan);
saran.use('/portal/saran/*', pastikan);

const KILAT: Record<string, string> = { balas: 'Balasan terkirim atas nama lembaga.', status: 'Status diperbarui.', teruskan: 'Pesan diteruskan ke lembaga lain.', tampil: 'Pengaturan tampil di situs disimpan.', hapus: 'Pesan dihapus.' };

saran.get('/portal/saran', async (c) => {
  const u = c.get('user')!;
  if (tingkat(u) < PERAN.lembaga.tingkat) return tolak(c);
  const store = c.get('store');
  await pindahkanPesanLama(store);
  const units = await listUnits(store, true);
  const semuaLembaga = lingkupSemua(u);
  const unit = semuaLembaga && (c.req.query('unit') === 'yayasan' || units.some((x) => x.slug === c.req.query('unit'))) ? c.req.query('unit')! : '';
  const st = c.req.query('status') ?? '';
  const status = st === 'tampil' || STATUS_OK.includes(st) ? st : '';
  const semua = await daftarSaran(store, u, { unit: unit || undefined, limit: 1000 });
  const items = status === 'tampil' ? semua.filter((x) => x.tp) : status ? semua.filter((x) => x.s === status) : semua;
  const ok = KILAT[c.req.query('ok') ?? ''];
  return tampil(c, {
    judul: 'Pesan & Saran', aktif: '/portal/saran', ...(ok ? { kilat: { ok } } : {}),
    body: kotakSaranPage({ items: items.slice(0, 300), units, status, unit, semuaLembaga, hitung: { baru: semua.filter((x) => x.s === 'baru').length, tampil: semua.filter((x) => x.tp).length } }),
  });
});

async function muat(c: Ctx) {
  const u = c.get('user')!;
  const s = await ambilSaran(c.get('store'), c.req.param('id') ?? '');
  if (!s || !bolehLihat(u, s)) return null;
  return s;
}

saran.get('/portal/saran/:id', async (c) => {
  const u = c.get('user')!;
  const store = c.get('store');
  let s = await muat(c);
  if (!s) return tolak(c);
  if (s.status === 'baru') s = (await tandaiDibaca(store, s.id, u)) ?? s;
  const units = await listUnits(store, true);
  const lacak = `${origin(c)}/saran/lacak/${s.id}/${s.kode}`;
  const tujuan = namaUnitSaran(units, s.unit);
  const salam = `Assalamu'alaikum ${s.nama}. Pesan Anda untuk ${tujuan} sudah kami tanggapi. Silakan baca balasannya di: ${lacak}`;
  const digit = s.kontak.replace(/\D/g, '');
  const wa = !s.kontak.includes('@') && digit.length >= 9 && digit.length <= 15 ? `https://wa.me/${digit.replace(/^0/, '62')}?text=${encodeURIComponent(salam)}` : null;
  const mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.kontak) ? `mailto:${s.kontak}?subject=${encodeURIComponent(`Balasan pesan untuk ${tujuan}`)}&body=${encodeURIComponent(salam)}` : null;
  const ok = KILAT[c.req.query('ok') ?? ''];
  return tampil(c, {
    judul: `Pesan dari ${s.nama}`, aktif: '/portal/saran', ...(ok ? { kilat: { ok } } : {}),
    aksi: html`<a class="tbl tbl-garis tbl-kecil" href="/portal/saran">← Kotak pesan</a>`,
    body: detailSaranPage({ s, units, lacak, wa, mail, bolehTampil: bolehTampilkan(u), bolehTeruskan: bolehTeruskan(u) }),
  });
});

saran.post('/portal/saran/:id/balas', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const s = await muat(c);
  if (!s) return tolak(c);
  const isi = bersihTeks((await c.req.parseBody()).isi, MAKS_ISI);
  if (isi.length >= 2) await balas(c.get('store'), s.id, c.get('user')!, isi);
  return c.redirect(`/portal/saran/${s.id}?ok=balas`, 303);
});

saran.post('/portal/saran/:id/status', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const s = await muat(c);
  if (!s) return tolak(c);
  const st = String((await c.req.parseBody()).status ?? '');
  if (STATUS_OK.includes(st)) await setStatus(c.get('store'), s.id, st as StatusSaran, c.get('user')!);
  return c.redirect(`/portal/saran/${s.id}?ok=status`, 303);
});

saran.post('/portal/saran/:id/teruskan', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const u = c.get('user')!;
  const s = await muat(c);
  if (!s || !bolehTeruskan(u)) return tolak(c);
  const ke = String((await c.req.parseBody()).unit ?? '');
  const units = await listUnits(c.get('store'), true);
  if (ke === 'yayasan' || units.some((x) => x.slug === ke)) await teruskan(c.get('store'), s.id, ke, u);
  return c.redirect(`/portal/saran/${s.id}?ok=teruskan`, 303);
});

saran.post('/portal/saran/:id/tampil', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const u = c.get('user')!;
  const s = await muat(c);
  if (!s || !bolehTampilkan(u)) return tolak(c);
  const f = await c.req.parseBody();
  await setTampil(c.get('store'), s.id, f.tampil === '1', f.anonim === '1', u);
  return c.redirect(`/portal/saran/${s.id}?ok=tampil`, 303);
});

saran.post('/portal/saran/:id/hapus', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const u = c.get('user')!;
  const s = await muat(c);
  if (!s || !bolehTampilkan(u)) return tolak(c);
  await hapusSaran(c.get('store'), s);
  return c.redirect('/portal/saran?ok=hapus', 303);
});
