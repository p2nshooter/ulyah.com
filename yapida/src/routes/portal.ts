/**
 * Portal pengelola: masuk (daftar akun + PIN 5 angka di papan acak bergambar, pemilik 15 Nov 2026), pemasangan pertama,
 * dasbor, profil lembaga, pengaturan situs, halaman, isi (koleksi), akun & PIN, log, unggah berkas.
 * Super admin mengelola semuanya; peran lembaga hanya lembaganya (src/data/users.ts).
 */
import { Hono } from 'hono';
import { html, raw, type Raw } from '../lib/html.ts';
import { hmac, verifyPassword } from '../lib/crypto.ts';
import { limit } from '../lib/ratelimit.ts';
import { renderMarkdown } from '../lib/markdown.ts';
import { hariIni, jamWib, slugify, tahunPelajaran, tanggal } from '../lib/text.ts';
import { asalSama, endSession, readSession, startSession, type Ctx, type HonoEnv } from '../lib/session.ts';
import { bacaTantangan, dariPosisi, papanPin, pasangTantangan } from '../lib/pinpad.ts';
import {
  PERAN, URUTAN_PERAN, bolehKelolaAkun, bolehTayang, bolehUnit, createUser, getUser, isPeran, lingkupSemua, listUsers, masuk, NamaTerpakai,
  peranYangBolehDiberi, pinAcak, pinLemah, tingkat, updateUser, hashPin, type Peran, type User, type UserItem,
} from '../data/users.ts';
import { getHalaman, getSitus, getUnit, listHalaman, listUnits, lupakan, putHalaman, putSitus, putUnit, unitKey, type UnitItem } from '../data/site.ts';
import { KELOMPOK, URUTAN_KELOMPOK, type Halaman, type Kelompok, type Situs, type Suara, type Unit, unitRingkas } from '../data/model.ts';
import { ambil, bacaBidang, daftar, hapus, simpan, STATUS, type Dok, type Koleksi, type Status } from '../data/koleksi.ts';
import { KOLEKSI, koleksi } from '../data/defs.ts';
import { BerkasDitolak, unggah, urlBerkas } from '../data/media.ts';
import {
  bagian, centang, daftarDok, formDok, isian, kartuPin, masukPage, pasangPage, pilihan, portalPage, tabelAkun, unggahTunggal, type Kilat,
} from '../pages/portal.ts';
import { publikDok } from './konten.ts';
import { JENIS_PENGHARGAAN, PILIHAN_DESAIN, nomorBerikut } from '../data/dokumen.ts';

/** Hash PBKDF2 kode pemasangan pertama. Kodenya sendiri diserahkan kepada pemilik di luar repo; berlaku sampai akun pertama ada. */
const KODE_PASANG = 'pbkdf2$100000$B7x_sC9Sre2rAXgNJK1ZsQ$cZwWLl0YbxuvtZijAscs20iSaGZ8ToBV1ym1v16bj_8';
const AKUN_PERTAMA = 'u/akun-pertama';

export const portal = new Hono<HonoEnv>();

function rahasia(c: Ctx): string {
  const s = c.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET belum dipasang.');
  return s;
}
const pepper = (c: Ctx) => hmac(rahasia(c), 'yapida-pin-pepper-v1');
const ipDari = (c: Ctx) => c.req.header('cf-connecting-ip') ?? 'lokal';
const mediaUrl = (c: Ctx) => (f: string) => urlBerkas(c.env, f);
const tanpaCache = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' };

async function catat(c: Ctx, aksi: string, rinci: string): Promise<void> {
  const u = c.get('user');
  await c.get('store').append('audit', { at: Date.now(), u: u?.id ?? '-', n: u?.nama ?? '-', aksi, rinci }, { n: u?.nama ?? '-', a: aksi, r: rinci.slice(0, 160) });
}

const PESAN: Record<string, string> = {
  simpan: 'Tersimpan.', hapus: 'Dihapus.', pin: 'PIN baru tersimpan.', buka: 'Kunci akun dibuka.', dibuat: 'Akun dibuat.', keluar: 'Anda sudah keluar.',
};
const kilatDari = (c: Ctx): Kilat => {
  const ok = c.req.query('ok');
  return ok && PESAN[ok] ? { ok: PESAN[ok] } : {};
};

function tampil(c: Ctx, o: { judul: string; aktif: string; body: Raw; kilat?: Kilat; aksi?: Raw; status?: 200 | 400 | 403 | 404 | 429 }, hitung?: Record<string, number>) {
  return c.html(portalPage({ user: c.get('user')!, judul: o.judul, aktif: o.aktif, body: o.body, kilat: o.kilat ?? kilatDari(c), aksi: o.aksi, hitung }), o.status ?? 200, tanpaCache);
}
const tolak = (c: Ctx, pesan = 'Anda tidak berhak membuka halaman ini.') => tampil(c, { judul: 'Tidak diizinkan', aktif: '', body: html`<div class="p-kartu"><p>${pesan}</p><a class="tbl tbl-garis" href="/portal">Ke dasbor</a></div>`, status: 403 });

/* ── masuk & pemasangan pertama ─────────────────────────────────────────── */

async function halamanMasuk(c: Ctx, o: { galat?: string; pesan?: string; pilih?: string; status?: 200 | 400 | 401 | 403 | 429 } = {}) {
  const store = c.get('store');
  if (!(await store.get(AKUN_PERTAMA))) {
    const perm = await pasangTantangan(c, rahasia(c));
    return c.html(pasangPage({ papan: papanPin(perm, { mode: 'buat', judul: 'Buat PIN Super Admin', ket: 'Ketuk 5 angka, lalu ulangi.' }), galat: o.galat }), o.status ?? 200, tanpaCache);
  }
  const [akun, units] = await Promise.all([listUsers(store), listUnits(store, true)]);
  const perm = await pasangTantangan(c, rahasia(c));
  return c.html(masukPage({ akun: akun.filter((a) => a.aktif), units, papan: papanPin(perm, { mode: 'masuk', judul: 'Ketuk PIN', ket: 'Pilih akun dulu, lalu ketuk 5 angka.' }), pilih: o.pilih, galat: o.galat, pesan: o.pesan }), o.status ?? 200, tanpaCache);
}

portal.get('/masuk', async (c) => {
  if (await readSession(c, c.get('store'))) return c.redirect('/portal');
  return halamanMasuk(c, { pesan: c.req.query('ok') === 'keluar' ? PESAN.keluar : undefined });
});

portal.post('/masuk', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const store = c.get('store');
  const f = await c.req.parseBody();
  const id = String(f.u ?? '');
  if (!(await limit(c.env, `masuk:${ipDari(c)}`, 30, 900))) return halamanMasuk(c, { galat: 'Terlalu banyak percobaan dari jaringan ini. Coba lagi 15 menit lagi.', pilih: id, status: 429 });
  const perm = await bacaTantangan(c, rahasia(c));
  const pin = perm ? dariPosisi(perm, String(f.k ?? '')) : null;
  if (!pin) return halamanMasuk(c, { galat: 'Papan angka sudah kedaluwarsa. Ketuk PIN sekali lagi.', pilih: id, status: 401 });
  const h = await masuk(store, id, pin, await pepper(c));
  if (!h.ok) {
    const galat = h.alasan === 'terkunci' ? `Akun dikunci karena PIN salah berulang. Coba lagi pukul ${jamWib(h.sampai ?? Date.now())} WIB, atau minta admin membukanya.`
      : h.alasan === 'salah' ? `PIN salah. Sisa ${h.sisa} kali sebelum akun dikunci sementara.` : 'Akun tidak ditemukan atau tidak aktif.';
    return halamanMasuk(c, { galat, pilih: id, status: h.alasan === 'terkunci' ? 429 : 401 });
  }
  await startSession(c, h.user);
  c.set('user', h.user);
  await catat(c, 'masuk', h.user.nama);
  return c.redirect(h.user.wajibGanti ? '/portal/akun' : '/portal');
});

portal.post('/masuk/pasang', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const store = c.get('store');
  if (await store.get(AKUN_PERTAMA)) return c.redirect('/masuk');
  if (!(await limit(c.env, `pasang:${ipDari(c)}`, 10, 3600))) return halamanMasuk(c, { galat: 'Terlalu banyak percobaan. Coba lagi satu jam lagi.', status: 429 });
  const f = await c.req.parseBody();
  const kode = String(f.kode ?? '').toUpperCase().replace(/\s+/g, '');
  const perm = await bacaTantangan(c, rahasia(c));
  const pin = perm ? dariPosisi(perm, String(f.k ?? '')) : null;
  const pin2 = perm ? dariPosisi(perm, String(f.k2 ?? '')) : null;
  if (!(await verifyPassword(kode, c.env.SETUP_CODE_HASH || KODE_PASANG))) return halamanMasuk(c, { galat: 'Kode pemasangan salah.', status: 401 });
  if (!pin || pin !== pin2) return halamanMasuk(c, { galat: 'Kedua PIN tidak sama. Ulangi.', status: 400 });
  if (pinLemah(pin)) return halamanMasuk(c, { galat: 'PIN terlalu mudah ditebak (angka sama atau berurutan). Pilih PIN lain.', status: 400 });
  if (!(await store.createOnce(AKUN_PERTAMA, { at: Date.now() }))) return c.redirect('/masuk');
  const user = await createUser(store, { nama: 'Super Admin', peran: 'super', pin, pepper: await pepper(c), wajibGanti: false });
  await startSession(c, user);
  c.set('user', user);
  await catat(c, 'pasang', `Super admin pertama: ${user.nama}`);
  // Pemilik: „Username nya make dropdown, misal ketua yayasan dan seterusnya, jd g perlu ngisi“ — semua akun jabatan
  // dibuat sekarang juga, PIN acaknya tampil sekali di halaman berikut untuk dicetak dan dibagikan.
  const dibuat = await buatAkunJabatan(c, user);
  await catat(c, 'akun.massal', `${dibuat.length} akun`);
  return tampil(c, {
    judul: 'Semua akun siap', aktif: '/portal/pengguna',
    body: html`<div class="p-kartu"><p><strong>Alhamdulillah, portal siap.</strong> Akun berikut sudah dibuat dan muncul di daftar pilihan halaman masuk — tidak ada nama yang perlu diketik. Cetak atau catat PIN-nya sekarang, lalu serahkan kepada masing-masing pengelola.</p></div>${kartuPin(dibuat)}<p><a class="tbl tbl-emas" href="/portal">Lanjut ke dasbor</a> <a class="tbl tbl-garis" href="/portal/pengguna">Daftar akun</a></p>`,
  });
});

/** Akun bernama jabatan yang belum ada: Ketua Yayasan, Admin Yayasan, dan „Admin <lembaga>“ untuk setiap lembaga. */
async function buatAkunJabatan(c: Ctx, u: User): Promise<{ nama: string; peran: string; pin: string }[]> {
  const store = c.get('store');
  const [akun, units] = await Promise.all([listUsers(store), listUnits(store, true)]);
  const pep = await pepper(c);
  const dibuat: { nama: string; peran: string; pin: string }[] = [];
  const buat = async (nama: string, peran: Peran, unitsX: string[]) => {
    if (!peranYangBolehDiberi(u).includes(peran)) return;
    const pin = pinAcak();
    try { await createUser(store, { nama, peran, units: unitsX, pin, pepper: pep, wajibGanti: true }); dibuat.push({ nama, peran: PERAN[peran].nama, pin }); } catch (err) { if (!(err instanceof NamaTerpakai)) throw err; }
  };
  if (!akun.some((a) => a.peran === 'ketua')) await buat('Ketua Yayasan', 'ketua', []);
  if (!akun.some((a) => a.peran === 'yayasan')) await buat('Admin Yayasan', 'yayasan', []);
  for (const x of units) if (!akun.some((a) => a.units.includes(x.slug) && (a.peran === 'lembaga' || a.peran === 'kepala'))) await buat(`Admin ${x.singkat}`, 'lembaga', [x.slug]);
  return dibuat;
}

portal.post('/keluar', async (c) => {
  endSession(c);
  return c.redirect('/masuk?ok=keluar');
});

/* ── penjaga portal ─────────────────────────────────────────────────────── */

export const jaga = async (c: Ctx, next: () => Promise<void>) => {
  const user = await readSession(c, c.get('store'));
  if (!user) return c.redirect('/masuk');
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD' && !asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  c.set('user', user);
  if (user.wajibGanti && c.req.path !== '/portal/akun') return c.redirect('/portal/akun');
  await next();
};
portal.use('/portal', jaga);
portal.use('/portal/*', jaga);

const unitsBoleh = async (c: Ctx): Promise<UnitItem[]> => {
  const u = c.get('user')!;
  const semua = await listUnits(c.get('store'), true);
  return lingkupSemua(u) ? semua : semua.filter((x) => u.units.includes(x.slug));
};
const bolehDef = (u: User, def: Koleksi) => tingkat(u) >= (def.tingkat ?? 0);

/* ── dasbor ─────────────────────────────────────────────────────────────── */

async function hitungMasuk(c: Ctx): Promise<Record<string, number>> {
  const u = c.get('user')!;
  if (tingkat(u) < PERAN.lembaga.tingkat) return {};
  const store = c.get('store');
  const scope = lingkupSemua(u) ? undefined : u.units;
  const [daf, pesan] = await Promise.all([
    daftar(store, 'pendaftar', { unit: scope, limit: 999, saring: (it) => (it.x?.tahap ?? 'baru') === 'baru' }),
    daftar(store, 'pesan', { unit: scope, limit: 999, status: 'tinjau' }),
  ]);
  return { pendaftar: daf.length, pesan: pesan.length };
}

portal.get('/portal', async (c) => {
  const u = c.get('user')!;
  const store = c.get('store');
  const units = await unitsBoleh(c);
  const scope = lingkupSemua(u) ? undefined : u.units;
  const defs = Object.values(KOLEKSI).filter((d) => bolehDef(u, d));
  const isi = await Promise.all(defs.map(async (d) => ({ d, items: await daftar(store, d.id, { unit: scope, limit: 999 }) })));
  const tinjau = isi.flatMap(({ d, items }) => (d.privat ? [] : items.filter((it) => it.s === 'tinjau').map((it) => ({ d, it }))));
  const hitung = await hitungMasuk(c);
  const nama = (s: string) => (s === 'yayasan' ? 'Yayasan' : units.find((x) => x.slug === s)?.singkat ?? s);
  const body = html`
  <section class="p-sambut p-kartu"><div><p class="kicker">Assalamu’alaikum</p><h2>${u.nama}</h2><p>${PERAN[u.peran].ket}</p></div>
    <div class="p-sambut-aksi"><a class="tbl tbl-emas" href="/portal/k/kabar/baru">Tulis kabar</a><a class="tbl tbl-garis" href="/portal/k/galeri/baru">Unggah foto kegiatan</a>${tingkat(u) >= PERAN.lembaga.tingkat ? html`<a class="tbl tbl-garis" href="/portal/k/penghargaan/baru">Buat sertifikat</a><a class="tbl tbl-garis" href="/portal/k/kwitansi/baru">Buat kwitansi</a>` : ''}</div></section>
  ${hitung.pendaftar ? html`<a class="p-sorot" href="/portal/k/pendaftar">${hitung.pendaftar} pendaftar PPDB baru menunggu diperiksa →</a>` : ''}
  ${hitung.pesan ? html`<a class="p-sorot" href="/portal/k/pesan">${hitung.pesan} pesan masuk belum dibaca →</a>` : ''}
  ${tinjau.length && bolehTayang(u) ? html`<div class="p-kartu"><h2>Menunggu tinjauan</h2><ul class="p-daftar">${tinjau.slice(0, 12).map(({ d, it }) => html`<li><a href="/portal/k/${d.id}/${it.id}"><strong>${it.j}</strong><span>${d.satu} · ${nama(it.u)}</span></a></li>`)}</ul></div>` : ''}
  <div class="p-kisi-angka">${isi.map(({ d, items }) => html`<a class="p-angka" href="/portal/k/${d.id}"><strong>${items.length}</strong><span>${d.nama}</span></a>`)}</div>
  ${tingkat(u) >= PERAN.lembaga.tingkat ? html`<div class="p-kartu"><h2>Lembaga ${lingkupSemua(u) ? 'di bawah yayasan' : 'Anda'}</h2><div class="p-lembaga">${units.map((x) => html`<a href="/portal/lembaga/${x.slug}"><strong>${x.singkat}</strong><span>${KELOMPOK[x.kelompok].nama}${x.aktif ? '' : ' · nonaktif'}</span></a>`)}</div></div>` : ''}`;
  return tampil(c, { judul: 'Dasbor', aktif: '/portal', body }, hitung);
});

/* ── profil lembaga ─────────────────────────────────────────────────────── */

const baris = (s: unknown) => String(s ?? '').replace(/\r\n?/g, '\n').split('\n').map((x) => x.trim()).filter(Boolean);
const pipa = (s: unknown, n: number) => baris(s).map((l) => l.split('|').map((x) => x.trim())).filter((p) => p.length >= n && p.slice(0, n).every(Boolean));
const teks = (f: Record<string, unknown>, k: string, maks = 300) => String(f[k] ?? '').replace(/\r\n?/g, '\n').trim().slice(0, maks);
const opsional = (s: string) => (s ? s : undefined);

portal.get('/portal/lembaga', async (c) => {
  const u = c.get('user')!;
  if (tingkat(u) < PERAN.lembaga.tingkat) return tolak(c);
  const units = await unitsBoleh(c);
  if (units.length === 1 && !lingkupSemua(u)) return c.redirect(`/portal/lembaga/${units[0]!.slug}`);
  const body = html`${lingkupSemua(u) ? html`<p><a class="tbl tbl-emas" href="/portal/lembaga/baru">Tambah lembaga</a></p>` : ''}
  ${URUTAN_KELOMPOK.map((k) => {
    const isi = units.filter((x) => x.kelompok === k);
    return isi.length ? html`<div class="p-kartu"><h2>${KELOMPOK[k].nama}</h2><div class="p-lembaga">${isi.map((x) => html`<a href="/portal/lembaga/${x.slug}"><strong>${x.nama}</strong><span>${x.jenis}${x.aktif ? '' : ' · nonaktif'}</span></a>`)}</div></div>` : '';
  })}`;
  return tampil(c, { judul: 'Profil lembaga', aktif: '/portal/lembaga', body });
});

function formLembaga(c: Ctx, x: Partial<Unit>, baru: boolean): Raw {
  const u = c.get('user')!;
  const semua = lingkupSemua(u);
  const m = mediaUrl(c);
  return html`<form method="post" class="p-form p-kartu" data-form-jaga>
  ${bagian('Identitas', html`<div class="p-baris">${isian('Nama lengkap', 'nama', x.nama, { wajib: true, maks: 100 })}${isian('Nama singkat (menu & kartu)', 'singkat', x.singkat, { wajib: true, maks: 40 })}</div>
    <div class="p-baris">${isian('Jenis lembaga', 'jenis', x.jenis, { wajib: true, maks: 80, bantuan: 'Mis. Madrasah Ibtidaiyah Swasta' })}${semua ? pilihan('Bidang', 'kelompok', x.kelompok ?? 'formal', URUTAN_KELOMPOK.map((k) => [k, KELOMPOK[k].nama])) : ''}${semua ? isian('Urutan tampil', 'urut', x.urut, { jenis: 'number' }) : ''}</div>
    ${baru ? isian('Alamat halaman (slug)', 'slug', '', { bantuan: 'Huruf kecil dan tanda hubung, mis. sma-al-huda. Kosongkan untuk dibuat dari nama.' }) : ''}
    ${isian('Ringkasan (≤ 180 huruf)', 'ringkas', x.ringkas, { baris: 2, maks: 180, wajib: true })}
    ${unggahTunggal('Foto sampul', 'sampul', x.sampul ?? '', m, 'Foto gedung atau kegiatan, mendatar.')}
    ${pilihan('Suara pembaca bersuara', 'suara', x.suara ?? 'dewasa', [['balita', 'Balita (RA/TK) — lambat, nada tinggi'], ['anak', 'Anak (MI/TPQ)'], ['remaja', 'Remaja (MTs/pesantren)'], ['dewasa', 'Dewasa']])}
    ${semua ? centang('Tampilkan lembaga ini di situs', 'aktif', x.aktif !== false) : ''}`)}
  ${bagian('Profil & sejarah', html`${isian('Profil', 'profil', x.profil, { baris: 10, md: true })}${isian('Sejarah', 'sejarah', x.sejarah, { baris: 8, md: true })}
    ${isian('Visi', 'visi', x.visi, { baris: 2, maks: 500 })}${isian('Misi (satu per baris)', 'misi', (x.misi ?? []).join('\n'), { baris: 5 })}`)}
  ${bagian('Data singkat', html`<div class="p-baris">${isian('Nama kepala / pimpinan', 'kepalaNama', x.kepala?.nama, { maks: 100 })}${isian('Sebutan jabatan', 'kepalaJabatan', x.kepala?.jabatan ?? 'Kepala', { maks: 60 })}</div>
    <div class="p-baris">${isian('Tahun berdiri', 'berdiri', x.berdiri, { maks: 20 })}${isian('Pendiri', 'pendiri', x.pendiri, { maks: 120 })}</div>
    ${isian('Angka (satu per baris: label | nilai)', 'angka', (x.angka ?? []).map((a) => `${a.label} | ${a.nilai}`).join('\n'), { baris: 4, bantuan: 'Mis. Santri | 153' })}
    ${isian('Program unggulan (satu per baris)', 'program', (x.program ?? []).join('\n'), { baris: 4 })}
    ${isian('Kelas / tingkat (satu per baris)', 'kelas', (x.kelas ?? []).join('\n'), { baris: 4, bantuan: 'Dipakai rak perpustakaan dan bank soal lembaga ini.' })}
    ${isian('Sarana (satu per baris)', 'fasilitas', (x.fasilitas ?? []).join('\n'), { baris: 4 })}
    <div class="p-baris">${isian('Waktu belajar / layanan', 'jadwal', x.jadwal, { maks: 120 })}${isian('Kurikulum', 'kurikulum', x.kurikulum, { maks: 160 })}</div>
    ${isian('Alamat', 'alamat', x.alamat, { baris: 2, maks: 300 })}`)}
  ${bagian('Kontak & media sosial', html`<div class="p-baris">${isian('Telepon', 'telepon', x.kontak?.telepon, { maks: 30 })}${isian('WhatsApp', 'wa', x.kontak?.wa, { maks: 30 })}${isian('E-mail', 'email', x.kontak?.email, { jenis: 'email', maks: 100 })}</div>
    <div class="p-baris">${isian('YouTube', 'youtube', x.sosmed?.youtube, { jenis: 'url' })}${isian('Facebook', 'facebook', x.sosmed?.facebook, { jenis: 'url' })}</div>
    <div class="p-baris">${isian('Instagram', 'instagram', x.sosmed?.instagram, { jenis: 'url' })}${isian('TikTok', 'tiktok', x.sosmed?.tiktok, { jenis: 'url' })}${isian('Situs web', 'situs', x.sosmed?.situs, { jenis: 'url' })}</div>
    ${isian('ID kanal YouTube (UC…)', 'ytKanal', x.ytKanal, { maks: 40, bantuan: 'Video terbaru kanal ini tampil otomatis di halaman lembaga dan halaman Video.' })}`)}
  <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">${baru ? 'Buat lembaga' : 'Simpan profil'}</button>${baru ? '' : html`<a class="tbl-teks" href="/lembaga/${x.slug}" target="_blank" rel="noopener">Lihat di situs ↗</a>`}</div>
</form>`;
}

const urlAman = (s: string) => (/^https?:\/\/\S+$/i.test(s) && s.length <= 300 ? s : undefined);

function bacaLembaga(f: Record<string, unknown>, lama: Partial<Unit>, semua: boolean): Partial<Unit> {
  const angka = pipa(f.angka, 2).map(([label, nilai]) => ({ label: label!.slice(0, 40), nilai: nilai!.slice(0, 20) })).slice(0, 8);
  const suara = (['balita', 'anak', 'remaja', 'dewasa'] as Suara[]).includes(f.suara as Suara) ? (f.suara as Suara) : lama.suara ?? 'dewasa';
  const kelompok = semua && (URUTAN_KELOMPOK as string[]).includes(String(f.kelompok)) ? (f.kelompok as Kelompok) : lama.kelompok;
  const sampul = teks(f, 'sampul', 80);
  return {
    nama: teks(f, 'nama', 100), singkat: teks(f, 'singkat', 40), jenis: teks(f, 'jenis', 80), ringkas: teks(f, 'ringkas', 180),
    kelompok, urut: semua && f.urut !== undefined && String(f.urut) !== '' ? Number(f.urut) || 0 : lama.urut,
    aktif: semua ? f.aktif === '1' : lama.aktif, suara,
    sampul: /^\d{4}\/\d{2}\/[0-9a-z]{16,40}(_k)?\.(jpg|png|webp)$/.test(sampul) ? sampul : undefined,
    profil: teks(f, 'profil', 60_000), sejarah: opsional(teks(f, 'sejarah', 60_000)), visi: opsional(teks(f, 'visi', 500)), misi: baris(f.misi).slice(0, 20),
    kepala: teks(f, 'kepalaNama', 100) ? { nama: teks(f, 'kepalaNama', 100), jabatan: teks(f, 'kepalaJabatan', 60) || 'Kepala' } : undefined,
    berdiri: opsional(teks(f, 'berdiri', 20)), pendiri: opsional(teks(f, 'pendiri', 120)), angka,
    program: baris(f.program).slice(0, 20), kelas: baris(f.kelas).slice(0, 40), fasilitas: baris(f.fasilitas).slice(0, 30),
    jadwal: opsional(teks(f, 'jadwal', 120)), kurikulum: opsional(teks(f, 'kurikulum', 160)), alamat: opsional(teks(f, 'alamat', 300)),
    kontak: { telepon: opsional(teks(f, 'telepon', 30)), wa: opsional(teks(f, 'wa', 30)), email: opsional(teks(f, 'email', 100)) },
    sosmed: { youtube: urlAman(teks(f, 'youtube')), facebook: urlAman(teks(f, 'facebook')), instagram: urlAman(teks(f, 'instagram')), tiktok: urlAman(teks(f, 'tiktok')), situs: urlAman(teks(f, 'situs')) },
    ytKanal: /^UC[\w-]{22}$/.test(teks(f, 'ytKanal', 40)) ? teks(f, 'ytKanal', 40) : undefined,
  };
}

portal.get('/portal/lembaga/baru', async (c) => {
  if (!lingkupSemua(c.get('user')!)) return tolak(c);
  return tampil(c, { judul: 'Tambah lembaga', aktif: '/portal/lembaga', body: formLembaga(c, { suara: 'dewasa', aktif: true, urut: 99 }, true) });
});

portal.post('/portal/lembaga/baru', async (c) => {
  if (!lingkupSemua(c.get('user')!)) return tolak(c);
  const f = await c.req.parseBody();
  const x = bacaLembaga(f, {}, true);
  const slug = slugify(teks(f, 'slug', 60) || x.nama || '', 60);
  if (!x.nama || !x.singkat || !x.jenis || !x.ringkas || !slug) return tampil(c, { judul: 'Tambah lembaga', aktif: '/portal/lembaga', body: formLembaga(c, x, true), kilat: { galat: 'Nama, nama singkat, jenis, dan ringkasan wajib diisi.' }, status: 400 });
  const unit: Unit = { ...(x as Unit), slug, profil: x.profil ?? '', profilHtml: renderMarkdown(x.profil ?? ''), sejarahHtml: x.sejarah ? renderMarkdown(x.sejarah) : undefined, kelompok: x.kelompok ?? 'formal', urut: x.urut ?? 99, aktif: x.aktif ?? true, suara: x.suara ?? 'dewasa', ubah: Date.now() };
  const store = c.get('store');
  if (!(await store.createOnce(unitKey(slug), unit, unitRingkas(unit) as unknown as Record<string, unknown>))) {
    return tampil(c, { judul: 'Tambah lembaga', aktif: '/portal/lembaga', body: formLembaga(c, x, true), kilat: { galat: `Alamat /lembaga/${slug} sudah dipakai lembaga lain.` }, status: 400 });
  }
  lupakan(store);
  await catat(c, 'lembaga.buat', unit.nama);
  return c.redirect(`/portal/lembaga/${slug}?ok=simpan`);
});

portal.get('/portal/lembaga/:slug', async (c) => {
  const u = c.get('user')!;
  const x = await getUnit(c.get('store'), c.req.param('slug'));
  if (!x) return c.notFound();
  if (tingkat(u) < PERAN.lembaga.tingkat || !bolehUnit(u, x.slug)) return tolak(c);
  return tampil(c, { judul: x.nama, aktif: '/portal/lembaga', body: formLembaga(c, x, false) });
});

portal.post('/portal/lembaga/:slug', async (c) => {
  const u = c.get('user')!;
  const store = c.get('store');
  const lama = await getUnit(store, c.req.param('slug'));
  if (!lama) return c.notFound();
  if (tingkat(u) < PERAN.lembaga.tingkat || !bolehUnit(u, lama.slug)) return tolak(c);
  const f = await c.req.parseBody();
  const x = bacaLembaga(f, lama, lingkupSemua(u));
  if (!x.nama || !x.singkat || !x.jenis || !x.ringkas) return tampil(c, { judul: lama.nama, aktif: '/portal/lembaga', body: formLembaga(c, { ...lama, ...x }, false), kilat: { galat: 'Nama, nama singkat, jenis, dan ringkasan wajib diisi.' }, status: 400 });
  const unit: Unit = { ...lama, ...(x as Unit), slug: lama.slug, profilHtml: renderMarkdown(x.profil ?? ''), sejarahHtml: x.sejarah ? renderMarkdown(x.sejarah) : undefined, ubah: Date.now() };
  await putUnit(store, unit);
  await catat(c, 'lembaga.ubah', unit.nama);
  return c.redirect(`/portal/lembaga/${lama.slug}?ok=simpan`);
});

/* ── pengaturan situs ───────────────────────────────────────────────────── */

function formSitus(c: Ctx, s: Situs): Raw {
  const superAdmin = c.get('user')!.peran === 'super';
  return html`<form method="post" class="p-form p-kartu" data-form-jaga>
  ${bagian('Identitas', html`<div class="p-baris">${isian('Nama yayasan', 'nama', s.nama, { wajib: true, maks: 100 })}${isian('Singkatan', 'singkatan', s.singkatan, { wajib: true, maks: 20 })}</div>
    ${isian('Kalimat pembuka beranda', 'slogan', s.slogan, { baris: 2, maks: 240 })}${isian('Deskripsi (mesin pencari)', 'deskripsi', s.deskripsi, { baris: 3, maks: 300 })}`)}
  ${bagian('Alamat & lokasi', html`${isian('Jalan', 'jalan', s.alamat.jalan, { maks: 160 })}<div class="p-baris">${isian('Desa', 'desa', s.alamat.desa, { maks: 60 })}${isian('Kecamatan', 'kecamatan', s.alamat.kecamatan, { maks: 60 })}</div>
    <div class="p-baris">${isian('Kabupaten', 'kabupaten', s.alamat.kabupaten, { maks: 60 })}${isian('Provinsi', 'provinsi', s.alamat.provinsi, { maks: 60 })}${isian('Kode pos', 'kodepos', s.alamat.kodepos, { maks: 10 })}</div>
    <div class="p-baris">${isian('Lintang (lat)', 'lat', s.lokasi?.lat ?? -6.13, { jenis: 'number' })}${isian('Bujur (lng)', 'lng', s.lokasi?.lng ?? 107.17, { jenis: 'number' })}${isian('Nama titik', 'tempat', s.lokasi?.nama ?? 'Sukakarya, Kabupaten Bekasi', { maks: 80 })}</div>
    <p class="p-kecil">Titik ini dipakai jadwal sholat dan arah kiblat. Salin angka dari Google Maps (ketuk lama pada peta).</p>`)}
  ${bagian('Kontak & media sosial', html`<div class="p-baris">${isian('Telepon', 'telepon', s.kontak.telepon, { maks: 30 })}${isian('WhatsApp', 'wa', s.kontak.wa, { maks: 30 })}${isian('E-mail', 'email', s.kontak.email, { jenis: 'email', maks: 100 })}</div>
    <div class="p-baris">${isian('YouTube', 'youtube', s.sosmed.youtube, { jenis: 'url' })}${isian('Facebook', 'facebook', s.sosmed.facebook, { jenis: 'url' })}</div>
    <div class="p-baris">${isian('Instagram', 'instagram', s.sosmed.instagram, { jenis: 'url' })}${isian('TikTok', 'tiktok', s.sosmed.tiktok, { jenis: 'url' })}</div>`)}
  ${bagian('Siaran langsung', html`${centang('Sedang siaran langsung — tampilkan pita LIVE di seluruh situs', 'liveAktif', Boolean(s.live?.aktif))}
    <div class="p-baris">${isian('Tautan siaran', 'liveUrl', s.live?.url, { jenis: 'url', bantuan: 'YouTube, Facebook, atau TikTok.' })}${isian('Judul siaran', 'liveJudul', s.live?.judul, { maks: 120 })}</div>`)}
  ${bagian('Sejarah, visi & misi', html`${isian('Sejarah', 'sejarah', s.sejarah, { baris: 12, md: true })}
    ${isian('Linimasa (satu per baris: tahun | judul | isi)', 'linimasa', s.linimasa.map((t) => `${t.tahun} | ${t.judul} | ${t.isi}`).join('\n'), { baris: 5 })}
    ${isian('Visi', 'visi', s.visi, { baris: 2, maks: 500 })}${isian('Misi (satu per baris)', 'misi', (s.misi ?? []).join('\n'), { baris: 5 })}`)}
  ${bagian('Sambutan ketua', html`<div class="p-baris">${isian('Nama', 'sambutanNama', s.sambutan?.nama, { maks: 100 })}${isian('Jabatan', 'sambutanJabatan', s.sambutan?.jabatan ?? 'Ketua Yayasan', { maks: 60 })}</div>${isian('Isi sambutan', 'sambutanIsi', s.sambutan?.isi, { baris: 8, md: true })}`)}
  ${bagian('Donasi', html`${centang('Tampilkan halaman Donasi', 'donasiTampil', s.donasi.tampil)}
    ${isian('Rekening (satu per baris: bank | nomor | atas nama)', 'rekening', s.donasi.rekening.map((r) => `${r.bank} | ${r.nomor} | ${r.atasNama}`).join('\n'), { baris: 3 })}
    ${isian('Catatan', 'donasiCatatan', s.donasi.catatan, { baris: 2, maks: 300 })}`)}
  ${superAdmin ? bagian('Legalitas (super admin)', html`<div class="p-baris">${isian('No. akta', 'aktaNomor', s.legal.akta.nomor, { maks: 20 })}${isian('Tanggal akta', 'aktaTanggal', s.legal.akta.tanggal, { jenis: 'date' })}</div>${isian('Notaris', 'aktaNotaris', s.legal.akta.notaris, { maks: 160 })}
    <div class="p-baris">${isian('No. SK Menkumham', 'skNomor', s.legal.sk.nomor, { maks: 60 })}${isian('Tanggal SK', 'skTanggal', s.legal.sk.tanggal, { jenis: 'date' })}</div>
    <div class="p-baris">${isian('No. daftar yayasan', 'daftar', s.legal.daftar, { maks: 60 })}${isian('NPWP', 'npwp', s.legal.npwp, { maks: 30 })}${isian('KPP', 'kpp', s.legal.kpp, { maks: 60 })}</div>`, 'Struktur pembina, pengurus, pengawas, dan pendiri dikelola di menu Struktur & SDM (unit: Yayasan) — lengkap dengan foto.') : ''}
  <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">Simpan pengaturan</button><a class="tbl-teks" href="/profil" target="_blank" rel="noopener">Lihat profil ↗</a></div>
</form>`;
}

portal.get('/portal/situs', async (c) => {
  if (tingkat(c.get('user')!) < PERAN.yayasan.tingkat) return tolak(c);
  return tampil(c, { judul: 'Pengaturan situs', aktif: '/portal/situs', body: formSitus(c, await getSitus(c.get('store'))) });
});

portal.post('/portal/situs', async (c) => {
  const u = c.get('user')!;
  if (tingkat(u) < PERAN.yayasan.tingkat) return tolak(c);
  const f = await c.req.parseBody();
  const lat = Number(f.lat), lng = Number(f.lng);
  await putSitus(c.get('store'), (s) => ({
    ...s,
    nama: teks(f, 'nama', 100) || s.nama, singkatan: teks(f, 'singkatan', 20) || s.singkatan, slogan: teks(f, 'slogan', 240), deskripsi: teks(f, 'deskripsi', 300) || s.deskripsi,
    alamat: { jalan: teks(f, 'jalan', 160), desa: teks(f, 'desa', 60), kecamatan: teks(f, 'kecamatan', 60), kabupaten: teks(f, 'kabupaten', 60), provinsi: teks(f, 'provinsi', 60), kodepos: teks(f, 'kodepos', 10) },
    lokasi: Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat: Math.round(lat * 1e4) / 1e4, lng: Math.round(lng * 1e4) / 1e4, nama: teks(f, 'tempat', 80) || 'Lokasi yayasan' } : s.lokasi,
    kontak: { telepon: opsional(teks(f, 'telepon', 30)), wa: opsional(teks(f, 'wa', 30)), email: opsional(teks(f, 'email', 100)) },
    sosmed: { youtube: urlAman(teks(f, 'youtube')), facebook: urlAman(teks(f, 'facebook')), instagram: urlAman(teks(f, 'instagram')), tiktok: urlAman(teks(f, 'tiktok')) },
    live: { aktif: f.liveAktif === '1' && Boolean(urlAman(teks(f, 'liveUrl'))), url: urlAman(teks(f, 'liveUrl')) ?? '', judul: teks(f, 'liveJudul', 120) },
    sejarah: teks(f, 'sejarah', 60_000), sejarahHtml: renderMarkdown(teks(f, 'sejarah', 60_000)),
    linimasa: pipa(f.linimasa, 3).map(([tahun, judul, ...isi]) => ({ tahun: tahun!.slice(0, 12), judul: judul!.slice(0, 120), isi: isi.join(' | ').slice(0, 400) })).slice(0, 12),
    visi: opsional(teks(f, 'visi', 500)), misi: baris(f.misi).slice(0, 20),
    sambutan: teks(f, 'sambutanIsi', 20_000) ? { nama: teks(f, 'sambutanNama', 100), jabatan: teks(f, 'sambutanJabatan', 60) || 'Ketua Yayasan', isi: teks(f, 'sambutanIsi', 20_000), isiHtml: renderMarkdown(teks(f, 'sambutanIsi', 20_000)) } : undefined,
    donasi: { tampil: f.donasiTampil === '1', rekening: pipa(f.rekening, 3).map(([bank, nomor, atasNama]) => ({ bank: bank!.slice(0, 80), nomor: nomor!.slice(0, 40), atasNama: atasNama!.slice(0, 100) })).slice(0, 6), catatan: opsional(teks(f, 'donasiCatatan', 300)) },
    legal: u.peran === 'super' ? {
      akta: { nomor: teks(f, 'aktaNomor', 20), tanggal: teks(f, 'aktaTanggal', 10), notaris: teks(f, 'aktaNotaris', 160) },
      sk: { ...s.legal.sk, nomor: teks(f, 'skNomor', 60), tanggal: teks(f, 'skTanggal', 10) },
      daftar: opsional(teks(f, 'daftar', 60)), npwp: opsional(teks(f, 'npwp', 30)), kpp: opsional(teks(f, 'kpp', 60)),
    } : s.legal,
  }));
  await catat(c, 'situs.ubah', 'Pengaturan situs');
  return c.redirect('/portal/situs?ok=simpan');
});

/* ── halaman bebas ──────────────────────────────────────────────────────── */

portal.get('/portal/halaman', async (c) => {
  if (tingkat(c.get('user')!) < PERAN.yayasan.tingkat) return tolak(c);
  const hs = await listHalaman(c.get('store'));
  return tampil(c, { judul: 'Halaman', aktif: '/portal/halaman', aksi: html`<a class="tbl tbl-emas tbl-kecil" href="/portal/halaman/baru">Halaman baru</a>`, body: html`<div class="p-kartu"><ul class="p-daftar">${hs.map((h) => html`<li><a href="/portal/halaman/${h.slug}"><strong>${h.judul}</strong><span>/h/${h.slug}${h.kaki ? ' · di kaki situs' : ''}</span></a></li>`)}</ul></div>` });
});

function formHalaman(h: Partial<Halaman>, baru: boolean): Raw {
  return html`<form method="post" class="p-form p-kartu" data-form-jaga>${isian('Judul', 'judul', h.judul, { wajib: true, maks: 120 })}
  ${baru ? isian('Alamat (slug)', 'slug', '', { bantuan: 'Kosongkan untuk dibuat dari judul.' }) : ''}
  ${isian('Ringkasan (mesin pencari)', 'ringkas', h.ringkas, { baris: 2, maks: 220, wajib: true })}${isian('Isi', 'isi', h.isi, { baris: 18, md: true })}${centang('Tautkan di kaki situs', 'kaki', h.kaki !== false)}
  <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">Simpan</button><a class="tbl tbl-garis" href="/portal/halaman">Kembali</a>${baru ? '' : html`<a class="tbl-teks" href="/h/${h.slug}" target="_blank" rel="noopener">Lihat ↗</a>`}</div></form>`;
}

portal.get('/portal/halaman/baru', (c) => (tingkat(c.get('user')!) < PERAN.yayasan.tingkat ? tolak(c) : tampil(c, { judul: 'Halaman baru', aktif: '/portal/halaman', body: formHalaman({ kaki: true }, true) })));
portal.get('/portal/halaman/:slug', async (c) => {
  if (tingkat(c.get('user')!) < PERAN.yayasan.tingkat) return tolak(c);
  const h = await getHalaman(c.get('store'), c.req.param('slug'));
  return h ? tampil(c, { judul: h.judul, aktif: '/portal/halaman', body: formHalaman(h, false) }) : c.notFound();
});
portal.post('/portal/halaman/:slug', async (c) => {
  if (tingkat(c.get('user')!) < PERAN.yayasan.tingkat) return tolak(c);
  const f = await c.req.parseBody();
  const store = c.get('store');
  const baru = c.req.param('slug') === 'baru';
  const slug = baru ? slugify(teks(f, 'slug', 60) || teks(f, 'judul', 120), 60) : c.req.param('slug');
  if (!slug || !teks(f, 'judul', 120) || !teks(f, 'ringkas', 220)) return tampil(c, { judul: 'Halaman', aktif: '/portal/halaman', body: formHalaman({ judul: teks(f, 'judul', 120), ringkas: teks(f, 'ringkas', 220), isi: teks(f, 'isi', 60_000) }, baru), kilat: { galat: 'Judul dan ringkasan wajib diisi.' }, status: 400 });
  if (baru && (await getHalaman(store, slug))) return tampil(c, { judul: 'Halaman baru', aktif: '/portal/halaman', body: formHalaman({ judul: teks(f, 'judul', 120), ringkas: teks(f, 'ringkas', 220), isi: teks(f, 'isi', 60_000) }, true), kilat: { galat: `Alamat /h/${slug} sudah dipakai.` }, status: 400 });
  const isi = teks(f, 'isi', 60_000);
  await putHalaman(store, { slug, judul: teks(f, 'judul', 120), ringkas: teks(f, 'ringkas', 220), isi, isiHtml: renderMarkdown(isi), kaki: f.kaki === '1', ubah: Date.now() });
  await catat(c, 'halaman.simpan', slug);
  return c.redirect(`/portal/halaman/${slug}?ok=simpan`);
});

/* ── isi (koleksi) ──────────────────────────────────────────────────────── */

const statusBoleh = (u: User): Status[] => (bolehTayang(u) ? ['tayang', 'draf', 'tinjau', 'arsip'] : ['draf', 'tinjau']);

async function bolehDok(c: Ctx, def: Koleksi, d: Pick<Dok, 'unit' | 'penulis' | 'status'>): Promise<boolean> {
  const u = c.get('user')!;
  if (!bolehDef(u, def) || !bolehUnit(u, d.unit)) return false;
  if (bolehTayang(u)) return true;
  return d.penulis === u.id && d.status !== 'tayang';
}

portal.get('/portal/k/:kol', async (c) => {
  const u = c.get('user')!;
  const def = koleksi(c.req.param('kol'));
  if (!def) return c.notFound();
  if (!bolehDef(u, def)) return tolak(c);
  const units = await unitsBoleh(c);
  const pilihUnit = c.req.query('unit') ?? '';
  const st = c.req.query('status') ?? '';
  const scope = pilihUnit ? (bolehUnit(u, pilihUnit) ? [pilihUnit] : ['-']) : lingkupSemua(u) ? undefined : u.units;
  const items = await daftar(c.get('store'), def.id, { unit: scope, status: (Object.keys(STATUS) as string[]).includes(st) ? (st as Status) : undefined, limit: 500 });
  return tampil(c, {
    judul: def.nama, aktif: `/portal/k/${def.id}`,
    aksi: def.privat ? undefined : html`<a class="tbl tbl-emas tbl-kecil" href="/portal/k/${def.id}/baru${pilihUnit ? `?unit=${pilihUnit}` : ''}">Tambah ${def.satu}</a>`,
    body: daftarDok({ def, items, units, unit: pilihUnit, status: st, mediaUrl: mediaUrl(c), bolehYayasan: lingkupSemua(u), boleh: () => true }),
  }, await hitungMasuk(c));
});

portal.get('/portal/k/pendaftar/csv', async (c) => {
  const u = c.get('user')!;
  if (!bolehDef(u, KOLEKSI.pendaftar!)) return tolak(c);
  const store = c.get('store');
  const pilihUnit = c.req.query('unit') ?? '';
  const items = await daftar(store, 'pendaftar', { unit: pilihUnit ? (bolehUnit(u, pilihUnit) ? [pilihUnit] : ['-']) : lingkupSemua(u) ? undefined : u.units, limit: 900 });
  const kolom = ['tanggal', 'lembaga', 'gelombang', 'tahap', 'nama', 'kelamin', 'tempatLahir', 'tanggalLahir', 'asal', 'wali', 'telepon', 'alamat', 'catatan'];
  const sel = (v: unknown) => { const s = String(v ?? '').replace(/"/g, '""'); return /^[=+\-@]/.test(s) ? `"'${s}"` : `"${s}"`; };
  const out = [kolom.join(',')];
  for (const it of items) {
    const d = await ambil(store, 'pendaftar', it.id);
    if (!d) continue;
    out.push([d.tanggal, d.unit, d.d.ppdb, d.d.tahap, d.judul, d.d.kelamin, d.d.tempatLahir, d.d.tanggalLahir, d.d.asal, d.d.wali, d.d.telepon, d.d.alamat, d.d.catatan].map(sel).join(','));
  }
  await catat(c, 'pendaftar.unduh', `${items.length} baris`);
  return c.body(`﻿${out.join('\r\n')}\r\n`, 200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="pendaftar-${pilihUnit || 'semua'}.csv"`, ...tanpaCache });
});

function halamanForm(c: Ctx, def: Koleksi, dok: Partial<Dok> & { d: Record<string, unknown> }, units: UnitItem[], galat: Record<string, string> = {}, status: 200 | 400 = 200) {
  const u = c.get('user')!;
  return tampil(c, {
    judul: dok.id ? dok.judul ?? def.satu : `Tambah ${def.satu}`, aktif: `/portal/k/${def.id}`, status,
    kilat: Object.keys(galat).length ? { galat: 'Periksa kembali isian yang ditandai.' } : undefined,
    body: formDok({ def, dok, galat, units, bolehYayasan: lingkupSemua(u), statusBoleh: statusBoleh(u), mediaUrl: mediaUrl(c), kelasUnit: [], tautPublik: dok.id && dok.status === 'tayang' && !def.privat ? publikDok(def.id, dok.slug ?? '') : undefined }),
  });
}

portal.get('/portal/k/:kol/baru', async (c) => {
  const u = c.get('user')!;
  const def = koleksi(c.req.param('kol'));
  if (!def || def.privat) return c.notFound();
  if (!bolehDef(u, def)) return tolak(c);
  const units = await unitsBoleh(c);
  const minta = c.req.query('unit') ?? '';
  const unit = minta && bolehUnit(u, minta) ? minta : lingkupSemua(u) ? 'yayasan' : units[0]?.slug ?? '';
  const d: Record<string, unknown> = def.id === 'video' ? { jenis: 'video' } : def.id === 'kabar' ? { kategori: 'kegiatan' } : def.id === 'ppdb' ? { formulir: true } : await awalDokumen(c, def.id, unit);
  const judulAwal = def.id === 'kop' ? await judulKop(c, unit) : undefined;
  return halamanForm(c, def, { unit, status: bolehTayang(u) ? 'tayang' : 'tinjau', d, ...(judulAwal ? { judul: judulAwal } : {}) }, units);
});

portal.get('/portal/k/:kol/:id', async (c) => {
  const def = koleksi(c.req.param('kol'));
  if (!def) return c.notFound();
  const d = await ambil(c.get('store'), def.id, c.req.param('id'));
  if (!d) return c.notFound();
  if (!(await bolehDok(c, def, d))) return tolak(c);
  return halamanForm(c, def, d, await unitsBoleh(c));
});

/** Nilai awal dokumen cetak: penanda tangan dari profil lembaga, tahun pelajaran berjalan, penerima kwitansi = pengguna. */
async function awalDokumen(c: Ctx, kol: string, unit: string): Promise<Record<string, unknown>> {
  const u = c.get('user')!;
  const store = c.get('store');
  const lembaga = unit && unit !== 'yayasan' ? await getUnit(store, unit) : null;
  const s = await getSitus(store);
  const ketua = s.organ.find((o) => /ketua/i.test(o.jabatan));
  const ttd = lembaga?.kepala ? { ttd1Nama: lembaga.kepala.nama, ttd1Jabatan: lembaga.kepala.jabatan } : ketua ? { ttd1Nama: ketua.nama, ttd1Jabatan: ketua.jabatan } : {};
  switch (kol) {
    case 'penghargaan': return { jenis: 'tahfidz', desain: 'zamrud', tahun: tahunPelajaran(), tampil: true, ...ttd };
    case 'kwitansi': return { untuk: 'spp', metode: 'tunai', lunas: true, penerima: u.nama, jabatanPenerima: 'Bendahara' };
    case 'surat': return { ttdNama: ttd.ttd1Nama ?? '', ttdJabatan: ttd.ttd1Jabatan ?? '' };
    case 'kop': return {
      gaya: 'tengah', warna: 'zamrud', utama: true, induk: lembaga ? s.nama.toUpperCase() : '', ket: lembaga?.jenis ?? '',
      alamat: lembaga?.alamat || [s.alamat.jalan, s.alamat.desa, s.alamat.kecamatan, s.alamat.kabupaten, s.alamat.provinsi, s.alamat.kodepos].filter(Boolean).join(', '),
      kontak: [s.kontak.telepon && `Telp. ${s.kontak.telepon}`, s.kontak.email, 'yapida.sch.id'].filter(Boolean).join(' · '), kota: s.alamat.kecamatan || 'Sukakarya',
    };
    default: return {};
  }
}
async function judulKop(c: Ctx, unit: string): Promise<string> {
  if (unit && unit !== 'yayasan') return ((await getUnit(c.get('store'), unit))?.nama ?? '').toUpperCase();
  return (await getSitus(c.get('store'))).nama.toUpperCase();
}

async function simpanDok(c: Ctx) {
  const u = c.get('user')!;
  const def = koleksi(c.req.param('kol') ?? '');
  if (!def) return c.notFound();
  if (!bolehDef(u, def)) return tolak(c);
  const store = c.get('store');
  const idParam = c.req.param('id');
  const lama = idParam ? await ambil(store, def.id, idParam) : null;
  if (idParam && !lama) return c.notFound();
  if (lama && !(await bolehDok(c, def, lama))) return tolak(c);
  if (!lama && def.privat) return tolak(c);
  const f = await c.req.parseBody({ all: true }) as Record<string, unknown>;
  const form: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) if (k.startsWith('d_')) form[k.slice(2)] = Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v : '';
  const units = await unitsBoleh(c);
  const unit = def.privat ? lama!.unit : String(f.unit ?? '');
  const judul = String(f.judul ?? '').trim();
  const stMinta = String(f.status ?? '') as Status;
  const status: Status = def.privat ? (lama?.status ?? 'tinjau') : def.tanpaPublik ? 'tayang' : statusBoleh(u).includes(stMinta) ? stMinta : statusBoleh(u)[0]!;
  const { d, galat } = bacaBidang(def, form);
  if (!judul) galat.judul = 'Wajib diisi.';
  if (!def.privat && !bolehUnit(u, unit)) galat.unit = 'Anda tidak mengelola lembaga ini.';
  if (unit !== 'yayasan' && !units.some((x) => x.slug === unit) && !def.privat) galat.unit = 'Lembaga tidak dikenal.';
  if (Object.keys(galat).length) return halamanForm(c, def, { id: lama?.id, slug: lama?.slug, unit, status, judul, tanggal: String(f.tanggal ?? ''), d: { ...form, ...d } }, units, galat, 400);
  // Nomor otomatis (sertifikat, kwitansi, surat): dibuat sekali saat pertama disimpan bila dikosongkan; nomor lama dipertahankan.
  if (def.nomorOtomatis && typeof d[def.nomorOtomatis] !== 'string') {
    const lamaNo = lama?.d[def.nomorOtomatis];
    d[def.nomorOtomatis] = typeof lamaNo === 'string' && lamaNo ? lamaNo : await nomorBerikut(store, def.id, unit, d);
  }
  const dok = await simpan(store, def, { id: lama?.id, unit, status, judul, tanggal: String(f.tanggal ?? '') || undefined, d, penulis: u.id, penulisNama: u.nama });
  await catat(c, `${def.id}.${lama ? 'ubah' : 'buat'}`, `${dok.judul} (${dok.unit}, ${STATUS[dok.status]})`);
  return c.redirect(`/portal/k/${def.id}/${dok.id}?ok=simpan`);
}
portal.post('/portal/k/:kol/baru', simpanDok);
portal.post('/portal/k/:kol/:id', simpanDok);

portal.post('/portal/k/:kol/:id/hapus', async (c) => {
  const def = koleksi(c.req.param('kol'));
  if (!def) return c.notFound();
  const store = c.get('store');
  const d = await ambil(store, def.id, c.req.param('id'));
  if (!d) return c.notFound();
  if (!(await bolehDok(c, def, d))) return tolak(c);
  await hapus(store, def, d.id);
  await catat(c, `${def.id}.hapus`, d.judul);
  return c.redirect(`/portal/k/${def.id}?ok=hapus`);
});

/* ── unggah berkas ──────────────────────────────────────────────────────── */

portal.post('/portal/unggah', async (c) => {
  const u = c.get('user')!;
  if (!(await limit(c.env, `unggah:${u.id}`, 300, 3600))) return c.json({ error: 'Terlalu banyak unggahan dalam satu jam.' }, 429);
  const f = await c.req.parseBody();
  const berkas = f.berkas;
  if (!(berkas instanceof File)) return c.json({ error: 'Tidak ada berkas.' }, 400);
  const kecil = f.kecil instanceof File ? await f.kecil.arrayBuffer() : null;
  try {
    const hasil = await unggah(c.env, await berkas.arrayBuffer(), kecil, { oleh: u.id, unit: String(f.unit ?? ''), hanya: f.jenis === 'pdf' ? 'pdf' : 'gambar' });
    return c.json({ ...hasil, url: urlBerkas(c.env, hasil.f), urlKecil: hasil.k ? urlBerkas(c.env, hasil.k) : undefined });
  } catch (err) {
    if (err instanceof BerkasDitolak) return c.json({ error: err.message }, 400);
    throw err;
  }
});

/* ── sertifikat massal: ketik daftar penerima sekali, semua sertifikat terisi dan siap cetak ── */

const PENERIMA_CONTOH = 'Ahmad Fauzan ; Juz 30 ; Mumtaz ; Kelas 5A\nSiti Aisyah ; Juz 29 dan 30 ; Jayyid Jiddan ; Kelas 6B';

function formMassal(o: { units: UnitItem[]; bolehYayasan: boolean; nilai: Record<string, string>; galat?: string }): Raw {
  const v = (k: string) => o.nilai[k] ?? '';
  return html`<form method="post" class="p-form p-kartu" data-form-jaga>
  <p class="p-kecil">Untuk wisuda tahfidz, juara lomba, atau peringkat kelas: isi bagian yang sama untuk semua sekali saja, lalu tulis satu penerima per baris. Setiap baris menjadi satu sertifikat bernomor otomatis — lalu semuanya bisa dicetak sekaligus.</p>
  ${o.galat ? html`<p class="p-kilat p-kilat-galat" role="alert">${o.galat}</p>` : ''}
  <div class="p-baris">
    <label class="p-bidang"><span>Lembaga *</span><select name="unit" required>${o.bolehYayasan ? html`<option value="yayasan">Yayasan Al-Huda Yapida</option>` : ''}${o.units.map((u) => html`<option value="${u.slug}"${raw(v('unit') === u.slug ? ' selected' : '')}>${u.singkat}</option>`)}</select></label>
    <label class="p-bidang"><span>Jenis *</span><select name="jenis">${JENIS_PENGHARGAAN.map(([k, l]) => html`<option value="${k}"${raw((v('jenis') || 'tahfidz') === k ? ' selected' : '')}>${l}</option>`)}</select></label>
    <label class="p-bidang"><span>Tanggal</span><input type="date" name="tanggal" value="${v('tanggal') || hariIni()}"></label>
  </div>
  <div class="p-bidang"><span>Desain</span><div class="p-desain" role="radiogroup" aria-label="Desain">${PILIHAN_DESAIN.map(([k, l]) => html`<label class="p-desain-butir d-${k}"><input type="radio" name="desain" value="${k}"${raw((v('desain') || 'zamrud') === k ? ' checked' : '')}><span class="p-desain-contoh" aria-hidden="true"><i></i><b></b><em></em></span><span class="p-desain-nama">${l}</span></label>`)}</div></div>
  <div class="p-baris">
    ${isian('Kegiatan / acara', 'kegiatan', v('kegiatan'), { bantuan: 'Mis. „Wisuda Tahfidz ke-5“ atau „Semester Ganjil“.', maks: 140 })}
    ${isian('Tahun pelajaran', 'tahun', v('tahun') || tahunPelajaran(), { maks: 20 })}
  </div>
  <div class="p-baris">
    ${isian('Penanda tangan kanan — nama', 'ttd1Nama', v('ttd1Nama'), { maks: 80 })}${isian('Jabatan', 'ttd1Jabatan', v('ttd1Jabatan'), { maks: 80 })}
  </div>
  <div class="p-baris">
    ${isian('Penanda tangan kiri — nama (opsional)', 'ttd2Nama', v('ttd2Nama'), { maks: 80 })}${isian('Jabatan', 'ttd2Jabatan', v('ttd2Jabatan'), { maks: 80 })}
  </div>
  ${isian('Daftar penerima', 'daftar', v('daftar'), { baris: 10, wajib: true, bantuan: `Satu penerima per baris: Nama ; capaian ; predikat ; kelas (predikat dan kelas boleh dikosongkan). Contoh:\n${PENERIMA_CONTOH}` })}
  ${centang('Tampilkan semuanya di menu Prestasi (publik)', 'tampil', v('tampil') !== '0')}
  <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">Buat semua sertifikat</button><a class="tbl tbl-garis" href="/portal/k/penghargaan">Kembali</a></div>
</form>`;
}

portal.get('/portal/penghargaan/massal', async (c) => {
  const u = c.get('user')!;
  if (!bolehDef(u, KOLEKSI.penghargaan!)) return tolak(c);
  const units = await unitsBoleh(c);
  const unit = lingkupSemua(u) ? 'yayasan' : units[0]?.slug ?? '';
  const awal = await awalDokumen(c, 'penghargaan', unit);
  return tampil(c, { judul: 'Sertifikat massal', aktif: '/portal/penghargaan/massal', body: formMassal({ units, bolehYayasan: lingkupSemua(u), nilai: { unit, ttd1Nama: String(awal.ttd1Nama ?? ''), ttd1Jabatan: String(awal.ttd1Jabatan ?? '') } }) });
});

portal.post('/portal/penghargaan/massal', async (c) => {
  const u = c.get('user')!;
  const def = KOLEKSI.penghargaan!;
  if (!bolehDef(u, def)) return tolak(c);
  const units = await unitsBoleh(c);
  const f = (await c.req.parseBody()) as Record<string, unknown>;
  const nilai = Object.fromEntries(['unit', 'jenis', 'tanggal', 'desain', 'kegiatan', 'tahun', 'ttd1Nama', 'ttd1Jabatan', 'ttd2Nama', 'ttd2Jabatan', 'daftar'].map((k) => [k, teks(f, k, k === 'daftar' ? 20_000 : 300)]));
  nilai.tampil = f.tampil === '1' ? '1' : '0';
  const unit = nilai.unit!;
  const ulang = (galat: string) => tampil(c, { judul: 'Sertifikat massal', aktif: '/portal/penghargaan/massal', status: 400, body: formMassal({ units, bolehYayasan: lingkupSemua(u), nilai, galat }) });
  if (!bolehUnit(u, unit) || (unit !== 'yayasan' && !units.some((x) => x.slug === unit))) return ulang('Pilih lembaga yang Anda kelola.');
  const penerima = baris(nilai.daftar).map((l) => l.split(/\s*[;|]\s*/)).filter((p) => p[0]);
  if (!penerima.length) return ulang('Tulis minimal satu penerima.');
  if (penerima.length > 120) return ulang('Paling banyak 120 penerima sekali buat.');
  const tanpaCapaian = penerima.filter((p) => !p[1]).map((p) => p[0]);
  if (tanpaCapaian.length) return ulang(`Capaian belum diisi untuk: ${tanpaCapaian.slice(0, 5).join(', ')}. Format: Nama ; capaian ; predikat ; kelas.`);
  const store = c.get('store');
  const ids: string[] = [];
  for (const [nama, capaian, predikat, kelas] of penerima) {
    const form: Record<string, unknown> = { jenis: nilai.jenis, desain: nilai.desain, kegiatan: nilai.kegiatan, tahun: nilai.tahun, ttd1Nama: nilai.ttd1Nama, ttd1Jabatan: nilai.ttd1Jabatan, ttd2Nama: nilai.ttd2Nama, ttd2Jabatan: nilai.ttd2Jabatan, capaian: capaian ?? '', predikat: predikat ?? '', kelas: kelas ?? '', tampil: nilai.tampil };
    const { d, galat } = bacaBidang(def, form);
    if (Object.keys(galat).length) return ulang(`Baris „${nama}“: ${Object.entries(galat).map(([k, g]) => `${def.bidang.find((b) => b.k === k)?.label ?? k} — ${g}`).join('; ')}`);
    d.nomor = await nomorBerikut(store, def.id, unit, d);
    const dok = await simpan(store, def, { unit, status: 'tayang', judul: nama!.slice(0, 160), tanggal: nilai.tanggal || undefined, d, penulis: u.id, penulisNama: u.nama });
    ids.push(dok.id);
  }
  await catat(c, 'penghargaan.massal', `${ids.length} sertifikat (${unit}, ${nilai.jenis})`);
  return c.redirect(`/portal/cetak-banyak/penghargaan?${ids.map((id) => `id=${id}`).join('&')}`);
});

/* ── akun & PIN ─────────────────────────────────────────────────────────── */

portal.get('/portal/akun', async (c) => {
  const u = c.get('user')!;
  const perm = await pasangTantangan(c, rahasia(c));
  const body = html`<div class="p-kartu p-akun">
    ${u.wajibGanti ? html`<p class="p-kilat p-kilat-galat">Ini PIN sementara. Buat PIN Anda sendiri sebelum melanjutkan.</p>` : ''}
    <p><strong>${u.nama}</strong> · ${PERAN[u.peran].nama}</p>
    <form method="post" action="/portal/akun" data-pin-form>${papanPin(perm, { mode: 'buat', judul: 'PIN baru', ket: 'Ketuk 5 angka, lalu ulangi.' })}</form>
    <p class="p-kecil">Hindari angka yang sama semua atau berurutan. Mengganti PIN mengeluarkan akun ini dari perangkat lain.</p>
  </div>`;
  const g = c.req.query('g');
  const kilat = g === 'sama' ? { galat: 'Kedua PIN tidak sama, atau papan angka sudah kedaluwarsa. Ulangi.' } : g === 'lemah' ? { galat: 'PIN terlalu mudah ditebak (angka sama atau berurutan). Pilih PIN lain.' } : undefined;
  return tampil(c, { judul: 'Ganti PIN', aktif: '/portal/akun', body, kilat });
});

portal.post('/portal/akun', async (c) => {
  const u = c.get('user')!;
  const f = await c.req.parseBody();
  const perm = await bacaTantangan(c, rahasia(c));
  const pin = perm ? dariPosisi(perm, String(f.k ?? '')) : null;
  const pin2 = perm ? dariPosisi(perm, String(f.k2 ?? '')) : null;
  const ulang = (galat: string) => c.redirect(`/portal/akun?g=${encodeURIComponent(galat)}`);
  if (!pin || pin !== pin2) return ulang('sama');
  if (pinLemah(pin)) return ulang('lemah');
  const hash = await hashPin(pin, await pepper(c));
  const next = await updateUser(c.get('store'), u.id, (cur) => ({ ...cur, pin: hash, sv: cur.sv + 1, wajibGanti: false }));
  if (next) await startSession(c, next);
  await catat(c, 'pin.ganti', u.nama);
  return c.redirect('/portal?ok=pin');
});

portal.get('/portal/pengguna', async (c) => {
  const u = c.get('user')!;
  if (tingkat(u) < PERAN.kepala.tingkat) return tolak(c);
  const store = c.get('store');
  const [akun, units] = await Promise.all([listUsers(store), listUnits(store, true)]);
  const terlihat = lingkupSemua(u) ? akun : akun.filter((a) => a.units.some((x) => u.units.includes(x)));
  const aksi = html`<a class="tbl tbl-emas tbl-kecil" href="/portal/pengguna/baru">Akun baru</a>${lingkupSemua(u) ? html`<form method="post" action="/portal/pengguna/semua" class="p-sebaris" data-yakin="Buat satu akun admin untuk setiap lembaga yang belum punya, dengan PIN acak?"><button class="tbl tbl-garis tbl-kecil" type="submit">Buat akun semua lembaga</button></form>` : ''}`;
  return tampil(c, { judul: 'Akun & PIN', aktif: '/portal/pengguna', aksi, body: tabelAkun({ akun: terlihat, units, aktor: u, boleh: (a) => bolehKelolaAkun(u, a) }) });
});

function formAkun(c: Ctx, a: Partial<UserItem> & { id?: string }, units: UnitItem[], peranBoleh: Peran[]): Raw {
  const u = c.get('user')!;
  const unitPilihan = lingkupSemua(u) ? units : units.filter((x) => u.units.includes(x.slug));
  return html`<form method="post" class="p-form p-kartu" data-form-jaga>
    ${isian('Nama akun (tampil di daftar masuk)', 'nama', a.nama, { wajib: true, maks: 60, bantuan: 'Mis. Admin MI Al Huda, Kepala RA Al Huda, Ustadzah Siti (TPQ).' })}
    ${pilihan('Peran', 'peran', a.peran ?? peranBoleh[peranBoleh.length - 1] ?? 'kontributor', peranBoleh.map((p) => [p, `${PERAN[p].nama} — ${PERAN[p].ket}`]))}
    <div class="p-bidang"><span>Lembaga (untuk peran lembaga)</span><div class="p-pilihan">${unitPilihan.map((x) => html`<label class="p-centang"><input type="checkbox" name="units" value="${x.slug}"${raw((a.units ?? []).includes(x.slug) ? ' checked' : '')}><span>${x.singkat}</span></label>`)}</div></div>
    ${a.id ? centang('Akun aktif', 'aktif', a.aktif !== false) : ''}
    <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">${a.id ? 'Simpan' : 'Buat akun + PIN acak'}</button><a class="tbl tbl-garis" href="/portal/pengguna">Kembali</a></div>
  </form>`;
}

portal.get('/portal/pengguna/baru', async (c) => {
  const u = c.get('user')!;
  const boleh = peranYangBolehDiberi(u);
  if (!boleh.length) return tolak(c);
  return tampil(c, { judul: 'Akun baru', aktif: '/portal/pengguna', body: formAkun(c, {}, await listUnits(c.get('store'), true), boleh) });
});

function bacaAkun(f: Record<string, unknown>, aktor: User): { nama: string; peran: Peran; units: string[] } | string {
  const nama = String(f.nama ?? '').replace(/\s+/g, ' ').trim();
  const peran = String(f.peran ?? '');
  const units = (Array.isArray(f.units) ? f.units : f.units ? [f.units] : []).map(String);
  if (nama.length < 3) return 'Nama akun minimal 3 huruf.';
  if (!isPeran(peran) || !peranYangBolehDiberi(aktor).includes(peran)) return 'Peran tidak boleh diberikan.';
  if (PERAN[peran].lingkup === 'lembaga' && !units.length) return 'Pilih minimal satu lembaga untuk peran ini.';
  if (PERAN[peran].lingkup === 'lembaga' && !units.every((x) => bolehUnit(aktor, x))) return 'Anda tidak mengelola salah satu lembaga yang dipilih.';
  return { nama, peran, units };
}

portal.post('/portal/pengguna/baru', async (c) => {
  const u = c.get('user')!;
  const f = await c.req.parseBody({ all: true });
  const store = c.get('store');
  const units = await listUnits(store, true);
  const v = bacaAkun(f, u);
  if (typeof v === 'string') return tampil(c, { judul: 'Akun baru', aktif: '/portal/pengguna', body: formAkun(c, { nama: String(f.nama ?? '') }, units, peranYangBolehDiberi(u)), kilat: { galat: v }, status: 400 });
  const pin = pinAcak();
  try {
    const a = await createUser(store, { ...v, pin, pepper: await pepper(c), wajibGanti: true });
    await catat(c, 'akun.buat', `${a.nama} (${PERAN[a.peran].nama})`);
    return tampil(c, { judul: 'Akun dibuat', aktif: '/portal/pengguna', body: html`${kartuPin([{ nama: a.nama, peran: PERAN[a.peran].nama, pin }])}<p><a class="tbl tbl-garis" href="/portal/pengguna">Ke daftar akun</a></p>` });
  } catch (err) {
    if (err instanceof NamaTerpakai) return tampil(c, { judul: 'Akun baru', aktif: '/portal/pengguna', body: formAkun(c, v, units, peranYangBolehDiberi(u)), kilat: { galat: err.message }, status: 400 });
    throw err;
  }
});

portal.post('/portal/pengguna/semua', async (c) => {
  const u = c.get('user')!;
  if (!lingkupSemua(u)) return tolak(c);
  const dibuat = await buatAkunJabatan(c, u);
  await catat(c, 'akun.massal', `${dibuat.length} akun`);
  return tampil(c, { judul: 'Akun lembaga', aktif: '/portal/pengguna', body: dibuat.length ? html`${kartuPin(dibuat)}<p><a class="tbl tbl-garis" href="/portal/pengguna">Ke daftar akun</a></p>` : html`<div class="p-kartu"><p>Setiap lembaga sudah punya akun.</p><a class="tbl tbl-garis" href="/portal/pengguna">Kembali</a></div>` });
});

portal.get('/portal/pengguna/:id', async (c) => {
  const u = c.get('user')!;
  const a = await getUser(c.get('store'), c.req.param('id'));
  if (!a) return c.notFound();
  if (!bolehKelolaAkun(u, a)) return tolak(c);
  const terkunci = a.kunciSampai > Date.now();
  const body = html`${formAkun(c, a, await listUnits(c.get('store'), true), [...new Set([a.peran, ...peranYangBolehDiberi(u)])].filter((p) => URUTAN_PERAN.includes(p)))}
    <div class="p-kartu p-akun-aksi">
      <form method="post" action="/portal/pengguna/${a.id}/pin" data-yakin="Buat PIN acak baru untuk ${a.nama}? PIN lama langsung tidak berlaku."><button class="tbl tbl-garis" type="submit">Atur ulang PIN</button></form>
      ${terkunci ? html`<form method="post" action="/portal/pengguna/${a.id}/buka"><button class="tbl tbl-garis" type="submit">Buka kunci (terkunci sampai ${jamWib(a.kunciSampai)} WIB)</button></form>` : ''}
      <p class="p-kecil">Dibuat ${tanggal(a.buat)}${a.masukTerakhir ? ` · terakhir masuk ${tanggal(a.masukTerakhir)} ${jamWib(a.masukTerakhir)} WIB` : ' · belum pernah masuk'}</p>
    </div>`;
  return tampil(c, { judul: a.nama, aktif: '/portal/pengguna', body });
});

portal.post('/portal/pengguna/:id', async (c) => {
  const u = c.get('user')!;
  const store = c.get('store');
  const a = await getUser(store, c.req.param('id'));
  if (!a) return c.notFound();
  if (!bolehKelolaAkun(u, a)) return tolak(c);
  const f = await c.req.parseBody({ all: true });
  const v = bacaAkun({ ...f, peran: f.peran ?? a.peran }, u);
  if (typeof v === 'string') return tampil(c, { judul: a.nama, aktif: '/portal/pengguna', body: formAkun(c, a, await listUnits(store, true), peranYangBolehDiberi(u)), kilat: { galat: v }, status: 400 });
  const aktif = f.aktif === '1';
  try {
    await updateUser(store, a.id, (cur) => ({ ...cur, nama: v.nama, peran: v.peran, units: PERAN[v.peran].lingkup === 'lembaga' ? v.units : [], aktif, sv: aktif === cur.aktif && v.peran === cur.peran ? cur.sv : cur.sv + 1 }));
  } catch (err) {
    if (err instanceof NamaTerpakai) return tampil(c, { judul: a.nama, aktif: '/portal/pengguna', body: formAkun(c, a, await listUnits(store, true), peranYangBolehDiberi(u)), kilat: { galat: err.message }, status: 400 });
    throw err;
  }
  await catat(c, 'akun.ubah', `${v.nama} (${PERAN[v.peran].nama}${aktif ? '' : ', nonaktif'})`);
  return c.redirect(`/portal/pengguna/${a.id}?ok=simpan`);
});

portal.post('/portal/pengguna/:id/pin', async (c) => {
  const u = c.get('user')!;
  const store = c.get('store');
  const a = await getUser(store, c.req.param('id'));
  if (!a) return c.notFound();
  if (!bolehKelolaAkun(u, a)) return tolak(c);
  const pin = pinAcak();
  const hash = await hashPin(pin, await pepper(c));
  await updateUser(store, a.id, (cur) => ({ ...cur, pin: hash, sv: cur.sv + 1, wajibGanti: true, gagal: 0, kunciSampai: 0 }));
  await catat(c, 'akun.pin', a.nama);
  return tampil(c, { judul: a.nama, aktif: '/portal/pengguna', body: html`${kartuPin([{ nama: a.nama, peran: PERAN[a.peran].nama, pin }])}<p><a class="tbl tbl-garis" href="/portal/pengguna/${a.id}">Kembali ke akun</a></p>` });
});

portal.post('/portal/pengguna/:id/buka', async (c) => {
  const u = c.get('user')!;
  const store = c.get('store');
  const a = await getUser(store, c.req.param('id'));
  if (!a) return c.notFound();
  if (!bolehKelolaAkun(u, a)) return tolak(c);
  await updateUser(store, a.id, (cur) => ({ ...cur, gagal: 0, kunciSampai: 0 }));
  await catat(c, 'akun.buka', a.nama);
  return c.redirect(`/portal/pengguna/${a.id}?ok=buka`);
});

/* ── log ────────────────────────────────────────────────────────────────── */

portal.get('/portal/log', async (c) => {
  if (tingkat(c.get('user')!) < PERAN.ketua.tingkat) return tolak(c);
  const r = await c.get('store').list<{ n: string; a: string; r: string }>('l/audit/', { limit: 300 });
  const body = html`<div class="p-tabel"><table><thead><tr><th>Waktu</th><th>Akun</th><th>Aksi</th><th>Rincian</th></tr></thead><tbody>
    ${r.items.map((x) => { const ms = 9_999_999_999_999 - Number(x.key.slice('l/audit/'.length, 'l/audit/'.length + 13)); return html`<tr><td>${tanggal(ms)} ${jamWib(ms)}</td><td>${x.meta.n}</td><td><code>${x.meta.a}</code></td><td>${x.meta.r}</td></tr>`; })}
  </tbody></table></div>`;
  return tampil(c, { judul: 'Log aktivitas', aktif: '/portal/log', body });
});

export { KODE_PASANG, AKUN_PERTAMA };
export type { Situs };
