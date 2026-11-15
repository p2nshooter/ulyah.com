/**
 * Upload data guru & pegawai dari Excel (+ foto) — src/data/guru.ts. Templat resmi untuk semua lembaga, pratinjau kartu
 * guru berfoto sebelum disimpan, penyimpanan bertahap (/portal/kerja), dan unduhan data guru lengkap (privat, portal saja).
 */
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { html } from '../lib/html.ts';
import { limit } from '../lib/ratelimit.ts';
import { hariIni, tahunPelajaran } from '../lib/text.ts';
import { bacaCsv, bacaXlsx, BukanXlsx, gambarXlsx, tulisXlsx, type GambarSel } from '../lib/xlsx.ts';
import { PERAN, bolehTayang, bolehUnit, lingkupSemua, tingkat, type User } from '../data/users.ts';
import { listUnits, type UnitItem } from '../data/site.ts';
import { ambil, BERKAS_RE, type Dok } from '../data/koleksi.ts';
import { NAMA_GOLONGAN } from '../data/defs.ts';
import { unggah, urlBerkas, BerkasDitolak } from '../data/media.ts';
import { buatKerja, semuaIndeks } from '../data/kesiswaan.ts';
import { bacaGuru, cocokFoto, KOLOM_GURU, LABEL_GURU, LEBAR_GURU, periksaGuru, type BarisGuruSimpan } from '../data/guru.ts';
import { ubin, angka } from '../pages/grafik.ts';
import { catat, jaga, tampil, tanpaCache, tolak, unitsBoleh } from './portal.ts';

export const guru = new Hono<HonoEnv>();
const pastikan = async (c: Ctx, next: () => Promise<void>) => (c.get('user') ? next() : jaga(c, next));
guru.use('/portal/guru/*', pastikan);
const bolehGuru = (u: User) => tingkat(u) >= PERAN.lembaga.tingkat;
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function formImpor(galat?: string) {
  return html`${galat ? html`<p class="p-kilat p-kilat-galat" role="alert">${galat}</p>` : ''}
  <form method="post" action="/portal/guru/impor" enctype="multipart/form-data" class="p-kartu ks-impor" data-impor data-impor-guru>
    <div class="ks-jatuh" data-jatuh>
      <span class="ks-jatuh-ikon" aria-hidden="true">⇪</span>
      <strong>1. File data guru (Excel/CSV)</strong>
      <span>Foto boleh langsung ditempel di kolom „Foto“ pada Excel — otomatis dipasang ke guru di baris itu.</span>
      <input type="file" name="berkas" accept=".xlsx,.csv" required>
      <em data-jatuh-nama></em>
    </div>
    <div class="ks-jatuh ks-jatuh-foto" data-jatuh>
      <span class="ks-jatuh-ikon" aria-hidden="true">📷</span>
      <strong>2. Foto guru (boleh banyak sekaligus, opsional)</strong>
      <span>Nama file = isi kolom „Nama File Foto“, atau NUPTK/NIP, atau nama guru (mis. <i>Hilda Fauziyah Laily.jpg</i>). Dikecilkan otomatis sebelum dikirim.</span>
      <input type="file" name="foto" accept="image/jpeg,image/png,image/webp" multiple data-foto-banyak>
      <em data-jatuh-nama></em>
    </div>
    <input type="hidden" name="peta_foto" value="">
    <fieldset class="p-bagian"><legend>Guru yang sudah ada (NUPTK/NIP/PegID atau nama sama di lembaga yang sama)</legend>
      <label class="p-centang"><input type="radio" name="mode" value="perbarui" checked><span><b>Perbarui datanya</b> — isian kosong tidak menghapus data lama; foto lama tetap bila tidak ada foto baru.</span></label>
      <label class="p-centang"><input type="radio" name="mode" value="lewati"><span><b>Lewati</b> — hanya menambah guru baru.</span></label>
    </fieldset>
    <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">Baca &amp; periksa</button><span class="p-kecil" data-foto-status>Belum ada yang disimpan sebelum Anda menyetujui pratinjaunya.</span></div>
  </form>
  <section class="p-kartu ks-pintar"><h2>Format data guru — sama untuk semua lembaga</h2>
    <ol>
      <li><a href="/portal/guru/templat.xlsx"><b>Unduh templat data guru</b></a> — kolom <b>Foto</b> ada di kolom B dengan baris yang tinggi: klik sel foto guru → <i>Sisipkan → Gambar</i> (Excel 365: <i>Tempatkan di Sel</i>), atau tempel lalu geser fotonya ke dalam sel di baris guru itu.</li>
      <li>Isi <b>Nama lengkap (dengan gelar)</b>, <b>Lembaga</b>, <b>Jabatan / Tugas</b> (mis. Guru Kelas 3, Wali Kelas 2, Kepala Madrasah), dan <b>Fokus Mengajar</b> (mis. Tahfidz Al-Qur’an, Matematika, Komputer &amp; Pemrograman).</li>
      <li>Kolom NUPTK, PegID, NPK, NIP, NIK, tempat/tanggal lahir, pendidikan, status kepegawaian, TMT, HP, e-mail, dan alamat <b>bersifat privat</b>: tersimpan untuk administrasi, <b>tidak pernah tampil di situs</b>.</li>
      <li>Judul kolom boleh berbeda dan urutannya bebas — sistem mengenalinya (mis. „Nama PTK“, „Mapel“, „Tugas Tambahan“, „No HP“).</li>
    </ol>
    <p class="p-kecil">Di situs hanya tampil <b>foto, nama, jabatan, dan fokus mengajar</b> — di halaman <a href="/struktur" target="_blank" rel="noopener">Struktur &amp; Guru</a> yayasan dan di halaman lembaganya masing-masing.</p>
  </section>`;
}

guru.get('/portal/guru/impor', (c) => {
  const u = c.get('user')!;
  if (!bolehGuru(u)) return tolak(c);
  return tampil(c, { judul: 'Impor data guru & pegawai', aktif: '/portal/guru/impor', body: formImpor() });
});

guru.get('/portal/guru/templat.xlsx', (c) => {
  const u = c.get('user')!;
  if (!bolehGuru(u)) return tolak(c);
  const petunjuk = [
    ['1', 'Satu baris = satu guru/pegawai. Judul kolom boleh diganti dan urutannya bebas.'],
    ['2', 'FOTO: klik sel di kolom „Foto“ pada baris guru → Sisipkan → Gambar (Excel 365: Tempatkan di Sel). Atau tempel foto lalu letakkan di dalam sel baris guru itu. Bisa juga diunggah terpisah: beri nama file = isi kolom „Nama File Foto“, NUPTK/NIP, atau nama guru.'],
    ['3', 'Lembaga: tulis nama lembaga, mis. MI Al Huda, MTs Al Huda, RA Al Huda, TPQ Al Huda, Ponpes Al Huda.'],
    ['4', 'Jabatan / Tugas: mis. Kepala Madrasah, Wali Kelas 3, Guru Kelas 3, Guru Mapel, Bendahara, Operator.'],
    ['5', 'Fokus Mengajar: mis. Tahfidz Al-Qur’an, Matematika, Bahasa Arab, Komputer & Pemrograman — tampil di kartu guru.'],
    ['6', 'Kelompok: Pimpinan, Guru, atau Staf (kosong = ditebak dari jabatan).'],
    ['7', 'PRIVAT (tidak pernah tampil di situs): NUPTK, PegID, NPK, NIP, NIK, tempat & tanggal lahir, pendidikan, status kepegawaian, TMT, HP, e-mail, alamat.'],
    ['8', 'NUPTK/NIK 16 angka dan NIP 18 angka: format kolomnya sebagai Teks supaya digit tidak berubah.'],
  ];
  const x = tulisXlsx([
    { nama: 'Data Guru', judul: 'DATA GURU & PEGAWAI — YAYASAN AL-HUDA YAPIDA', kepala: KOLOM_GURU, baris: [], lebar: LEBAR_GURU, kosong: 40, tinggiBaris: 66 },
    { nama: 'Petunjuk', judul: 'PETUNJUK PENGISIAN', kepala: ['No', 'Petunjuk'], baris: petunjuk, lebar: [5, 140], tegak: true },
  ]);
  return c.body(x, 200, { 'content-type': XLSX_TYPE, 'content-disposition': 'attachment; filename="templat-data-guru.xlsx"', ...tanpaCache });
});

/** Simpan foto ke media. JPEG tanpa versi kecil: berkas yang sama juga dipakai sebagai versi kecil kartu (_k). */
async function simpanFoto(c: Ctx, data: Uint8Array, unit: string): Promise<string | null> {
  const u = c.get('user')!;
  const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  try {
    const h = await unggah(c.env, buf, buf.byteLength <= 600 * 1024 ? buf : null, { oleh: u.id, unit, hanya: 'gambar' });
    if (h.jenis === 'jpg' && !h.k) await c.env.MEDIA.put(`f/${h.f.replace(/\.jpg$/, '_k.jpg')}`, buf, { httpMetadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' } });
    return h.f;
  } catch (err) {
    if (err instanceof BerkasDitolak) return null;
    throw err;
  }
}

guru.post('/portal/guru/impor', async (c) => {
  const u = c.get('user')!;
  if (!bolehGuru(u)) return tolak(c);
  const ulang = (g: string, status: 400 | 429 = 400) => tampil(c, { judul: 'Impor data guru & pegawai', aktif: '/portal/guru/impor', body: formImpor(g), status });
  if (!(await limit(c.env, `impor-guru:${u.id}`, 30, 3600))) return ulang('Terlalu banyak unggahan dalam satu jam. Coba lagi nanti.', 429);
  const f = await c.req.parseBody({ all: true });
  const berkas = f.berkas;
  if (!(berkas instanceof File) || !berkas.size) return ulang('Pilih file data guru (.xlsx atau .csv) dulu.');
  if (berkas.size > 25 * 1024 * 1024) return ulang('File lebih dari 25 MB — perkecil foto di dalam Excel atau unggah foto terpisah.');
  const buf = new Uint8Array(await berkas.arrayBuffer());
  let lembar, gambar: GambarSel[] = [];
  try {
    const csv = /\.csv$/i.test(berkas.name) || buf[0] !== 0x50;
    lembar = csv ? [{ nama: berkas.name.replace(/\.[^.]+$/, '') || 'CSV', baris: bacaCsv(new TextDecoder().decode(buf)) }] : await bacaXlsx(buf);
    if (!csv) gambar = await gambarXlsx(buf);
  } catch (err) {
    if (err instanceof BukanXlsx) return ulang('File tidak terbaca sebagai Excel (.xlsx). Simpan ulang sebagai .xlsx atau CSV.');
    throw err;
  }
  const store = c.get('store');
  const units = await listUnits(store, true);
  const dikelola = lingkupSemua(u) ? null : u.units;
  const baca = bacaGuru(lembar, gambar);
  const rows = periksaGuru(baca.guru, units, dikelola, (slug) => bolehUnit(u, slug));
  // Foto: (1) ditempel di Excel, (2) sudah diunggah peramban (peta nama file → kunci media), (3) dikirim mentah tanpa JS.
  let peta: Record<string, string> = {};
  try { const p = JSON.parse(String(f.peta_foto ?? '') || '{}') as Record<string, unknown>; peta = Object.fromEntries(Object.entries(p).filter(([k, v]) => typeof v === 'string' && BERKAS_RE.test(v) && k.length < 200)) as Record<string, string>; } catch { peta = {}; }
  const mentah = (Array.isArray(f.foto) ? f.foto : f.foto ? [f.foto] : []).filter((x): x is File => x instanceof File && x.size > 0).slice(0, 300);
  const namaMentah = mentah.map((x) => x.name);
  let foto = 0;
  for (const r of rows) {
    if (r.galat.length) continue;
    if (r.gambar !== undefined && gambar[r.gambar] && gambar[r.gambar]!.jenis !== 'lain') {
      const k = await simpanFoto(c, gambar[r.gambar]!.data, r.unit!);
      if (k) { r.foto = k; foto += 1; continue; }
    }
    const cocokPeta = cocokFoto(r, Object.keys(peta));
    if (cocokPeta) { r.foto = peta[cocokPeta]; foto += 1; continue; }
    const cocokMentah = cocokFoto(r, namaMentah);
    if (cocokMentah) {
      const file = mentah.find((x) => x.name === cocokMentah)!;
      const k = await simpanFoto(c, new Uint8Array(await file.arrayBuffer()), r.unit!);
      if (k) { r.foto = k; foto += 1; }
    }
  }
  const sah = rows.filter((r) => !r.galat.length);
  const status = bolehTayang(u) ? 'tayang' : 'tinjau';
  const baris: BarisGuruSimpan[] = sah.map(({ galat: _g, peringatan: _p, ...r }) => ({ r, unit: r.unit!, status }));
  const kerja = sah.length ? await buatKerja(store, { jenis: 'guru', judul: `Menyimpan ${sah.length} guru & pegawai dari ${berkas.name}`.slice(0, 160), oleh: u.id, olehNama: u.nama, lingkup: dikelola, kembali: '/portal/k/sdm', opsi: { mode: f.mode === 'lewati' ? 'lewati' : 'perbarui' } }, baris) : null;
  await catat(c, 'guru.impor.periksa', `${berkas.name}: ${rows.length} baris, ${sah.length} sah, ${foto} foto`);
  const nama = (slug?: string) => units.find((x) => x.slug === slug)?.singkat ?? slug ?? '—';
  const salah = rows.filter((r) => r.galat.length);
  const tanpaFoto = sah.filter((r) => !r.foto).length;
  return tampil(c, {
    judul: 'Pratinjau data guru', aktif: '/portal/guru/impor', body: html`
    <section class="p-kartu"><div class="ks-ubin-baris">${ubin('Guru & pegawai terbaca', angka(rows.length))}${ubin('Siap disimpan', angka(sah.length), status === 'tayang' ? 'langsung tampil di situs' : 'menunggu tinjauan admin')}${ubin('Dengan foto', angka(foto), tanpaFoto ? `${angka(tanpaFoto)} belum berfoto` : 'lengkap')}${ubin('Perlu diperbaiki', angka(salah.length))}</div>
      <div class="p-form-kaki">${kerja ? html`<a class="tbl tbl-emas" href="/portal/kerja/${kerja.id}">Simpan ${angka(sah.length)} guru sekarang</a>` : ''}<a class="tbl tbl-garis" href="/portal/guru/impor">Pilih file lain</a></div></section>
    ${sah.length ? html`<section class="p-kartu"><h2>Tampilan di situs</h2><p class="p-kecil">Hanya foto, nama, jabatan, dan fokus mengajar yang tampil. Data kepegawaian tetap privat.</p>
      <div class="gr-kisi">${sah.slice(0, 120).map((r) => html`<figure class="gr-kartu"><span class="gr-foto">${r.foto ? html`<img src="${urlBerkas(c.env, r.foto)}" alt="" loading="lazy">` : html`<span aria-hidden="true">${r.nama.charAt(0)}</span>`}</span><figcaption><b>${r.nama}</b><span>${r.jabatan || 'Guru'}</span>${r.fokus ? html`<small>${r.fokus}</small>` : ''}<em>${nama(r.unit)} · ${NAMA_GOLONGAN[['pimpinan', 'guru', 'staf'].includes(r.golongan.toLowerCase()) ? r.golongan.toLowerCase() : 'guru'] ?? 'Guru'}</em>${r.peringatan.length ? html`<small class="gr-awas">${r.peringatan.join(' ')}</small>` : ''}</figcaption></figure>`)}</div></section>` : ''}
    <section class="p-kartu"><h2>Cara file Anda dibaca</h2>${baca.laporan.map((l) => html`<details class="ks-lembar" open><summary><b>Lembar „${l.nama}“</b> — ${l.guru ? html`${angka(l.guru)} guru, judul kolom di baris ${l.barisJudul}` : 'tidak ada tabel guru'}</summary>${l.kolom.length ? html`<ul class="ks-peta">${l.kolom.map((k) => html`<li><b>${LABEL_GURU[k.kunci]}</b><span>← ${k.dari}</span></li>`)}</ul>` : ''}</details>`)}
      ${gambar.length ? html`<p class="p-kecil">${angka(gambar.length)} foto ditemukan di dalam file Excel.</p>` : ''}</section>
    ${salah.length ? html`<section class="p-kartu"><h2>Perlu diperbaiki (${angka(salah.length)})</h2><div class="p-tabel"><table><thead><tr><th>Lembar · baris</th><th>Nama</th><th>Masalah</th></tr></thead><tbody>${salah.map((r) => html`<tr><td>${r.sumber} · ${r.baris}</td><td>${r.nama}</td><td>${r.galat.join(' ')}</td></tr>`)}</tbody></table></div></section>` : ''}`,
  });
});

/** Unduh data guru lengkap (termasuk data privat) — hanya pengelola, untuk administrasi lembaga. */
guru.get('/portal/guru/unduh.xlsx', async (c) => {
  const u = c.get('user')!;
  if (!bolehGuru(u)) return tolak(c);
  const store = c.get('store');
  const unit = (c.req.query('unit') ?? '').slice(0, 60);
  if (unit && !bolehUnit(u, unit)) return tolak(c, 'Anda tidak mengelola lembaga ini.');
  const ix = await semuaIndeks(store, 'sdm', unit ? [unit] : lingkupSemua(u) ? undefined : u.units);
  const units: UnitItem[] = await unitsBoleh(c);
  const nama = (slug: string) => (slug === 'yayasan' ? 'Yayasan' : units.find((x) => x.slug === slug)?.singkat ?? slug);
  const doks: Dok[] = [];
  for (let i = 0; i < Math.min(ix.length, 900); i += 25) doks.push(...(await Promise.all(ix.slice(i, i + 25).map((x) => ambil(store, 'sdm', x.id)))).filter((d): d is Dok => Boolean(d)));
  const t = (d: Dok, k: string) => String(d.d[k] ?? '');
  const baris = doks.map((d, i) => [i + 1, t(d, 'foto') ? 'ada' : '', d.judul, t(d, 'jk'), nama(d.unit), t(d, 'jabatan'), t(d, 'bidang'), NAMA_GOLONGAN[t(d, 'golongan')] ?? '', t(d, 'nuptk'), t(d, 'pegId'), t(d, 'npk'), t(d, 'nip'), t(d, 'nik'), t(d, 'tempatLahir'), t(d, 'tanggalLahir'), t(d, 'pendidikan'), t(d, 'statusPegawai'), t(d, 'tmt'), t(d, 'hp'), t(d, 'email'), t(d, 'alamat'), '', t(d, 'urut')]);
  const x = tulisXlsx([{ nama: 'Data Guru', judul: `DATA GURU & PEGAWAI — ${unit ? nama(unit).toUpperCase() : 'YAYASAN AL-HUDA YAPIDA'} · TP ${tahunPelajaran()} · ${hariIni()} (PRIVAT)`, kepala: KOLOM_GURU, baris, lebar: LEBAR_GURU }]);
  await catat(c, 'guru.unduh', `${baris.length} guru`);
  return c.body(x, 200, { 'content-type': XLSX_TYPE, 'content-disposition': `attachment; filename="data-guru-${unit || 'semua'}-${hariIni()}.xlsx"`, ...tanpaCache });
});
