/**
 * Rute Pesan antarlembaga (src/data/pesan.ts): /portal/pesan (kotak), /grup, /japri/:akun, /tiket/…, API JSON untuk
 * obrolan langsung (tanya tiap beberapa detik), dan /portal/pesan/hitung untuk notifikasi. Semua respons no-store —
 * tidak ada isi pesan di cache peramban, CDN, atau service worker (/portal tidak pernah di-cache sw.js).
 */
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { limit } from '../lib/ratelimit.ts';
import { hariIni, tanggal } from '../lib/text.ts';
import { getUser, lingkupSemua, listUsers, tingkat, PERAN } from '../data/users.ts';
import { daftar } from '../data/koleksi.ts';
import { listUnits } from '../data/site.ts';
import {
  ambilTiket, anggotaTujuan, balasTiket, percakapanDm, bacaDm, bacaGrup, bacaPenanda, bacaTiketPesan, bersihkanGrup, bolehTiket, buatTiket, hariGrup, hitungBelum, kirimDm,
  kirimGrup, kotakMasuk, labelAkun, MAKS_PESAN, namaTujuan, PILIHAN_TUJUAN, tandaiDibaca, tiketMasuk, TGL_RE, TUJUAN_RE, ubahStatusTiket, type StatusTiket,
} from '../data/pesan.ts';
import { berandaPesan, formTiket, ruangObrolan } from '../pages/pesan.ts';
import { jaga, tampil, tanpaCache, tolak } from './portal.ts';

export const pesan = new Hono<HonoEnv>();
const pastikan = async (c: Ctx, next: () => Promise<void>) => (c.get('user') ? next() : jaga(c, next));
pesan.use('/portal/pesan', pastikan);
pesan.use('/portal/pesan/*', pastikan);

async function saya(c: Ctx) {
  const u = c.get('user')!;
  const units = await listUnits(c.get('store'), true);
  const nama = (s: string) => units.find((x) => x.slug === s)?.singkat ?? s;
  return { u, units, ringkas: { id: u.id, nama: u.nama, label: labelAkun(u, nama) } };
}
const teksDari = async (c: Ctx): Promise<string> => {
  const jenis = c.req.header('content-type') ?? '';
  const isi = jenis.includes('application/json') ? ((await c.req.json().catch(() => ({}))) as Record<string, unknown>) : await c.req.parseBody();
  return String(isi.teks ?? '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAKS_PESAN);
};
const json = (c: Ctx, data: unknown, status: 200 | 201 | 400 | 403 | 404 | 429 = 200) => c.json(data, status, tanpaCache);
const mauJson = (c: Ctx) => (c.req.header('accept') ?? '').includes('application/json');

/* ── kotak pesan ──────────────────────────────────────────────────────── */

pesan.get('/portal/pesan', async (c) => {
  const { u, units } = await saya(c);
  const store = c.get('store');
  await bersihkanGrup(store);
  const [baca, grupHariIni, kotak, masuk, akun] = await Promise.all([bacaPenanda(store, u.id), bacaGrup(store, hariIni()), kotakMasuk(store, u.id), tiketMasuk(store, u), listUsers(store)]);
  // Satu pintu „Pesan“: pesan pengunjung (formulir kontak) ikut tampil di sini untuk pengelola lembaga ke atas.
  const tamu = tingkat(u) >= PERAN.lembaga.tingkat ? await daftar(store, 'pesan', { unit: lingkupSemua(u) ? undefined : u.units, limit: 200 }) : null;
  return tampil(c, {
    judul: 'Pesan', aktif: '/portal/pesan',
    body: berandaPesan({
      grup: { belum: grupHariIni.filter((p) => p.t > baca.grup && p.d !== u.id).length, terakhir: grupHariIni.slice(-3) },
      japri: kotak.filter((k) => k.j === 'dm').map((k) => ({ ...k, belum: k.d !== u.id && k.t > (baca.dm[k.id] ?? 0) })),
      tiketMasuk: masuk.filter((k) => !kotak.some((x) => x.id === k.id && x.j === 'tiket')).map((k) => ({ ...k, belum: k.d !== u.id && k.t > (baca.tiket[k.id] ?? 0) })),
      tiketSaya: kotak.filter((k) => k.j === 'tiket').map((k) => ({ ...k, belum: k.d !== u.id && k.t > (baca.tiket[k.id] ?? 0) })),
      akun, namaTujuan: (t) => namaTujuan(t, units), tujuan: PILIHAN_TUJUAN(units), saya: u.id,
      ...(tamu ? { pengunjung: { baru: tamu.filter((x) => x.s === 'tinjau').length, terakhir: tamu.slice(0, 5).map((x) => ({ id: x.id, nama: x.j, cuplikan: String(x.r ?? '').slice(0, 90), kapan: Number.isFinite(Date.parse(x.t)) ? tanggal(Date.parse(x.t)).replace(/ \d{4}$/, '') : '', baru: x.s === 'tinjau' })) } } : {}),
    }),
  });
});

pesan.get('/portal/pesan/hitung', async (c) => json(c, await hitungBelum(c.get('store'), c.get('user')!)));

/* ── grup seluruh lembaga ─────────────────────────────────────────────── */

pesan.get('/portal/pesan/grup', async (c) => {
  const { u } = await saya(c);
  const store = c.get('store');
  await bersihkanGrup(store);
  const hari = hariGrup();
  const tgl = TGL_RE.test(c.req.query('tgl') ?? '') && hari.includes(c.req.query('tgl')!) ? c.req.query('tgl')! : hari[0]!;
  const isi = await bacaGrup(store, tgl);
  const kini = tgl === hari[0];
  if (kini && isi.length) await tandaiDibaca(store, u.id, 'grup', '', isi[isi.length - 1]!.t);
  return tampil(c, {
    judul: 'Grup seluruh lembaga', aktif: '/portal/pesan',
    body: ruangObrolan({
      judul: 'Grup seluruh lembaga', sub: kini ? 'Obrolan hari ini · bersih setiap pergantian hari · riwayat 14 hari lalu terhapus otomatis tanpa jejak' : `Riwayat ${tanggal(tgl)}`,
      api: `/portal/pesan/api/grup?tgl=${tgl}`, kirim: kini ? '/portal/pesan/api/grup' : undefined, pesan: isi, saya: u.id, kosong: kini ? 'Belum ada obrolan hari ini — mulai dengan salam 👋' : 'Tidak ada obrolan pada tanggal ini.',
      hari: hari.map((h, i) => ({ tgl: h, aktif: h === tgl, label: i === 0 ? 'Hari ini' : i === 1 ? 'Kemarin' : tanggal(h).replace(/ \d{4}$/, '') })), kembali: '/portal/pesan', arsip: !kini,
    }),
  });
});

pesan.get('/portal/pesan/api/grup', async (c) => {
  const u = c.get('user')!;
  const tgl = TGL_RE.test(c.req.query('tgl') ?? '') ? c.req.query('tgl')! : hariIni();
  if (!hariGrup().includes(tgl)) return json(c, { pesan: [] });
  const isi = await bacaGrup(c.get('store'), tgl, Number(c.req.query('setelah')) || 0);
  if (isi.length && tgl === hariIni()) await tandaiDibaca(c.get('store'), u.id, 'grup', '', isi[isi.length - 1]!.t);
  return json(c, { pesan: isi });
});

pesan.post('/portal/pesan/api/grup', async (c) => {
  const { u, ringkas } = await saya(c);
  if (!(await limit(c.env, `pesan:${u.id}`, 40, 60))) return mauJson(c) ? json(c, { galat: 'Terlalu cepat — tunggu sebentar.' }, 429) : c.redirect('/portal/pesan/grup');
  const teks = await teksDari(c);
  if (!teks) return mauJson(c) ? json(c, { galat: 'Pesan kosong.' }, 400) : c.redirect('/portal/pesan/grup');
  const p = await kirimGrup(c.get('store'), ringkas, teks);
  await tandaiDibaca(c.get('store'), u.id, 'grup', '', p.t);
  return mauJson(c) ? json(c, { pesan: p }, 201) : c.redirect('/portal/pesan/grup');
});

/* ── japri ────────────────────────────────────────────────────────────── */

pesan.get('/portal/pesan/japri', (c) => { const ke = c.req.query('ke') ?? ''; return /^usr_[0-9A-Z]{20}$/.test(ke) ? c.redirect(`/portal/pesan/japri/${ke}`) : c.redirect('/portal/pesan'); });

async function lawan(c: Ctx) {
  const id = c.req.param('akun') ?? '';
  if (!/^usr_[0-9A-Z]{20}$/.test(id) || id === c.get('user')!.id) return null;
  const l = await getUser(c.get('store'), id);
  return l && l.aktif ? l : null;
}

pesan.get('/portal/pesan/japri/:akun', async (c) => {
  const { u, units } = await saya(c);
  const l = await lawan(c);
  if (!l) return c.notFound();
  const store = c.get('store');
  const isi = await bacaDm(store, u.id, l.id);
  if (isi.length) await tandaiDibaca(store, u.id, 'dm', await percakapanDm(u.id, l.id), isi[isi.length - 1]!.t);
  return tampil(c, { judul: `Japri · ${l.nama}`, aktif: '/portal/pesan', body: ruangObrolan({ judul: l.nama, sub: `${labelAkun(l, (s) => units.find((x) => x.slug === s)?.singkat ?? s)} · japri pribadi, hanya Anda berdua yang bisa membaca`, api: `/portal/pesan/api/japri/${l.id}`, kirim: `/portal/pesan/api/japri/${l.id}`, pesan: isi, saya: u.id, kosong: 'Belum ada pesan. Tulis pesan pertama Anda.', kembali: '/portal/pesan' }) });
});

pesan.get('/portal/pesan/api/japri/:akun', async (c) => {
  const u = c.get('user')!;
  const l = await lawan(c);
  if (!l) return json(c, { galat: 'Akun tidak ditemukan.' }, 404);
  const store = c.get('store');
  const isi = await bacaDm(store, u.id, l.id, Number(c.req.query('setelah')) || 0);
  if (isi.length) await tandaiDibaca(store, u.id, 'dm', await percakapanDm(u.id, l.id), isi[isi.length - 1]!.t);
  return json(c, { pesan: isi });
});

pesan.post('/portal/pesan/api/japri/:akun', async (c) => {
  const { u, ringkas } = await saya(c);
  const l = await lawan(c);
  if (!l) return mauJson(c) ? json(c, { galat: 'Akun tidak ditemukan.' }, 404) : c.notFound();
  if (!(await limit(c.env, `pesan:${u.id}`, 40, 60))) return mauJson(c) ? json(c, { galat: 'Terlalu cepat — tunggu sebentar.' }, 429) : c.redirect(`/portal/pesan/japri/${l.id}`);
  const teks = await teksDari(c);
  if (!teks) return mauJson(c) ? json(c, { galat: 'Pesan kosong.' }, 400) : c.redirect(`/portal/pesan/japri/${l.id}`);
  const store = c.get('store');
  const p = await kirimDm(store, ringkas, { id: l.id, nama: l.nama }, teks);
  await tandaiDibaca(store, u.id, 'dm', await percakapanDm(u.id, l.id), p.t);
  return mauJson(c) ? json(c, { pesan: p }, 201) : c.redirect(`/portal/pesan/japri/${l.id}`);
});

/* ── tiket ────────────────────────────────────────────────────────────── */

pesan.get('/portal/pesan/tiket/baru', async (c) => {
  const { units } = await saya(c);
  const ke = c.req.query('ke') ?? '';
  return tampil(c, { judul: 'Buat tiket permintaan', aktif: '/portal/pesan', body: formTiket({ tujuan: PILIHAN_TUJUAN(units), nilai: { tujuan: TUJUAN_RE.test(ke) ? ke : 'yayasan' } }) });
});

pesan.post('/portal/pesan/tiket', async (c) => {
  const { u, units, ringkas } = await saya(c);
  const f = await c.req.parseBody();
  const tujuan = String(f.tujuan ?? ''), perihal = String(f.perihal ?? '').replace(/\s+/g, ' ').trim().slice(0, 140), teks = String(f.teks ?? '').trim().slice(0, MAKS_PESAN);
  const ulang = (galat: string) => tampil(c, { judul: 'Buat tiket permintaan', aktif: '/portal/pesan', body: formTiket({ tujuan: PILIHAN_TUJUAN(units), galat, nilai: { tujuan, perihal, teks } }), status: 400 });
  if (!TUJUAN_RE.test(tujuan) || !PILIHAN_TUJUAN(units).some(([k]) => k === tujuan)) return ulang('Pilih tujuan tiket.');
  if (perihal.length < 3 || !teks) return ulang('Isi perihal dan isi permintaan.');
  if (!(await limit(c.env, `tiket:${u.id}`, 20, 3600))) return ulang('Terlalu banyak tiket dalam satu jam.');
  const t = await buatTiket(c.get('store'), ringkas, tujuan, perihal, teks);
  return c.redirect(`/portal/pesan/tiket/${t.id}`);
});

async function tiketBoleh(c: Ctx) {
  const t = await ambilTiket(c.get('store'), c.req.param('id') ?? '');
  return t && bolehTiket(c.get('user')!, t) ? t : null;
}

pesan.get('/portal/pesan/tiket/:id', async (c) => {
  const { u, units } = await saya(c);
  const t = await tiketBoleh(c);
  if (!t) return c.notFound();
  const store = c.get('store');
  const isi = await bacaTiketPesan(store, t.id);
  if (isi.length) await tandaiDibaca(store, u.id, 'tiket', t.id, Math.max(isi[isi.length - 1]!.t, t.ubah));
  return tampil(c, { judul: `Tiket · ${t.perihal}`, aktif: '/portal/pesan', body: ruangObrolan({ judul: t.perihal, sub: `Tiket ${t.status === 'selesai' ? 'selesai' : 'terbuka'} · hanya pembuat, penerima yang dituju, dan Super Admin yang bisa membaca`, api: `/portal/pesan/api/tiket/${t.id}`, kirim: `/portal/pesan/api/tiket/${t.id}`, pesan: isi, saya: u.id, kosong: '', kembali: '/portal/pesan', tiket: { ...t, bolehStatus: anggotaTujuan(u, t.tujuan) || tingkat(u) >= PERAN.super.tingkat, namaTujuan: namaTujuan(t.tujuan, units) } }) });
});

pesan.get('/portal/pesan/api/tiket/:id', async (c) => {
  const t = await tiketBoleh(c);
  if (!t) return json(c, { galat: 'Tiket tidak ditemukan.' }, 404);
  const isi = await bacaTiketPesan(c.get('store'), t.id, Number(c.req.query('setelah')) || 0);
  if (isi.length) await tandaiDibaca(c.get('store'), c.get('user')!.id, 'tiket', t.id, isi[isi.length - 1]!.t);
  return json(c, { pesan: isi, status: t.status });
});

pesan.post('/portal/pesan/api/tiket/:id', async (c) => {
  const { u, ringkas } = await saya(c);
  const t = await tiketBoleh(c);
  if (!t) return mauJson(c) ? json(c, { galat: 'Tiket tidak ditemukan.' }, 404) : c.notFound();
  if (!(await limit(c.env, `pesan:${u.id}`, 40, 60))) return mauJson(c) ? json(c, { galat: 'Terlalu cepat — tunggu sebentar.' }, 429) : c.redirect(`/portal/pesan/tiket/${t.id}`);
  const teks = await teksDari(c);
  if (!teks) return mauJson(c) ? json(c, { galat: 'Pesan kosong.' }, 400) : c.redirect(`/portal/pesan/tiket/${t.id}`);
  const p = await balasTiket(c.get('store'), t, ringkas, teks);
  await tandaiDibaca(c.get('store'), u.id, 'tiket', t.id, p.t);
  return mauJson(c) ? json(c, { pesan: p }, 201) : c.redirect(`/portal/pesan/tiket/${t.id}`);
});

pesan.post('/portal/pesan/tiket/:id/status', async (c) => {
  const { u, ringkas } = await saya(c);
  const t = await tiketBoleh(c);
  if (!t) return c.notFound();
  if (!anggotaTujuan(u, t.tujuan)) return tolak(c, 'Hanya penerima tiket yang bisa mengubah statusnya.');
  const s = String((await c.req.parseBody()).status ?? '') as StatusTiket;
  if (!['baru', 'diproses', 'selesai'].includes(s)) return c.redirect(`/portal/pesan/tiket/${t.id}`);
  await ubahStatusTiket(c.get('store'), t, s, ringkas);
  return c.redirect(`/portal/pesan/tiket/${t.id}`);
});
