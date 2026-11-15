/**
 * Upload data guru & pegawai (pemilik, 15 Nov 2026: „Termasuk upload data guru, buatkan form formatnya + letak fotonya,
 * agar setiap lembaga bisa mengikuti format itu untuk upload data guru cepat, dan langsung tampil di tampilan guru2
 * yayasan al-huda yapida dan tetep tampil di masing2 lembaga, NUPTK, PEG ID, NPK dan seluruh yg privasi jgn di
 * tampilkan, cukup nama foto, nama guru dan focus mengajar nya“).
 *
 * Satu guru = satu dokumen koleksi `sdm` (tayang di /struktur dan halaman lembaganya). Data kepegawaian (NUPTK, PegID,
 * NPK, NIP, NIK, lahir, HP, e-mail, alamat, pendidikan) disimpan sebagai bidang `rahasia` — tidak pernah di indeks atau
 * halaman publik. Foto: ditempel di sel kolom Foto pada Excel (dibaca per baris), atau diunggah bersama (dicocokkan dengan
 * kolom Nama File Foto, NUPTK/NIP/PegID, atau nama guru). Penjaga create-once `u/gtk/<jenis>/<nomor>` mencegah ganda.
 */
import type { Store } from '../lib/store.ts';
import { judulKata, rapikanAlamat } from '../lib/alamat.ts';
import { slugify } from '../lib/text.ts';
import type { Lembar } from '../lib/xlsx.ts';
import { ambil, type Koleksi } from './koleksi.ts';
import { simpanTerkait } from './kait.ts';
import { digit, jenjangDari, jenjangUnit, normalJk, normalTanggal } from './siswa.ts';
import type { UnitItem } from './site.ts';
import { semuaIndeks, type Kerja, type Pemroses } from './kesiswaan.ts';

export type KunciGuru = 'no' | 'abaikan' | 'foto' | 'namaFoto' | 'nama' | 'jk' | 'lembaga' | 'jabatan' | 'fokus' | 'golongan' | 'nuptk' | 'pegId' | 'npk' | 'nip' | 'nik'
  | 'tempatLahir' | 'tanggalLahir' | 'ttl' | 'pendidikan' | 'statusPegawai' | 'tmt' | 'hp' | 'email' | 'alamat' | 'urut';

export const LABEL_GURU: Record<KunciGuru, string> = {
  no: 'Nomor', abaikan: 'Tidak dipakai', foto: 'Foto (tempel di sel)', namaFoto: 'Nama file foto', nama: 'Nama lengkap', jk: 'L/P', lembaga: 'Lembaga', jabatan: 'Jabatan / tugas',
  fokus: 'Fokus mengajar', golongan: 'Kelompok', nuptk: 'NUPTK', pegId: 'PegID', npk: 'NPK', nip: 'NIP', nik: 'NIK', tempatLahir: 'Tempat lahir', tanggalLahir: 'Tanggal lahir',
  ttl: 'Tempat, tanggal lahir', pendidikan: 'Pendidikan terakhir', statusPegawai: 'Status kepegawaian', tmt: 'TMT', hp: 'No. HP', email: 'E-mail', alamat: 'Alamat', urut: 'Urutan tampil',
};

/** Kolom templat (urutan resmi untuk semua lembaga). „Foto“ di kolom B supaya mudah ditempel. */
export const KOLOM_GURU = ['No', 'Foto (tempel di sel ini)', 'Nama Lengkap (dengan gelar)', 'L/P', 'Lembaga', 'Jabatan / Tugas', 'Fokus Mengajar / Mata Pelajaran', 'Kelompok (Pimpinan/Guru/Staf)', 'NUPTK', 'PegID', 'NPK', 'NIP', 'NIK', 'Tempat Lahir', 'Tanggal Lahir', 'Pendidikan Terakhir', 'Status Kepegawaian', 'TMT', 'No. HP / WA', 'E-mail', 'Alamat', 'Nama File Foto', 'Urutan Tampil'];
export const LEBAR_GURU = [5, 16, 32, 5, 18, 24, 30, 16, 19, 14, 12, 21, 19, 16, 14, 22, 16, 12, 16, 24, 40, 20, 8];

const normal = (h: string) => h.toLowerCase().replace(/[_\n\r]+/g, ' ').replace(/[^a-z0-9/ ]+/g, ' ').replace(/\s+/g, ' ').trim();

export function kenaliJudulGuru(asli: string): KunciGuru | null {
  const h = normal(asli);
  if (!h) return null;
  if (/nama file|file foto|nama foto|berkas foto/.test(h)) return 'namaFoto';
  if (/^foto|pas foto|^photo|^gambar/.test(h)) return 'foto';
  if (/nuptk/.test(h)) return 'nuptk';
  if (/peg ?id|pegid/.test(h)) return 'pegId';
  if (/\bnpk\b/.test(h)) return 'npk';
  if (/\bnip\b/.test(h)) return 'nip';
  if (/\bnik\b|induk kependudukan/.test(h)) return 'nik';
  if (/tempat.*(tanggal|tgl)|^ttl$/.test(h)) return 'ttl';
  if (/tempat lahir|^tempat$/.test(h)) return 'tempatLahir';
  if (/tanggal lahir|tgl lahir|^lahir$/.test(h)) return 'tanggalLahir';
  if (/^(jenis kelamin|kelamin|jk|l ?\/ ?p|lp|gender)$|jenis kelamin/.test(h)) return 'jk';
  if (/nama lembaga|nama madrasah|nama sekolah|satuan|unit kerja|tempat tugas|^lembaga$|^madrasah$|^unit$|^sekolah$/.test(h)) return 'lembaga';
  if (/mapel|mata pelajaran|fokus|bidang studi|^bidang|mengajar|keahlian|spesiali|kompetensi/.test(h)) return 'fokus';
  if (/jabatan|tugas tambahan|^tugas|^posisi|^peran/.test(h)) return 'jabatan';
  if (/jenis ptk|jenis gtk|kelompok|golongan ptk|kategori|^jenis$/.test(h)) return 'golongan';
  if (/pendidikan|ijazah|lulusan|jurusan|gelar akademik/.test(h)) return 'pendidikan';
  if (/status (kepegawaian|pegawai)|^status$|status ptk/.test(h)) return 'statusPegawai';
  if (/\btmt\b|mulai tugas|mulai bertugas|tahun masuk|mulai mengajar/.test(h)) return 'tmt';
  if (/\bhp\b|telp|telepon|whatsapp|\bwa\b|ponsel/.test(h)) return 'hp';
  if (/e ?mail|surel/.test(h)) return 'email';
  if (/alamat|domisili/.test(h)) return 'alamat';
  if (/urutan|no urut tampil|urut tampil/.test(h)) return 'urut';
  if (/nama lengkap|nama guru|nama ptk|nama gtk|nama pegawai|nama pendidik|^nama$|^name$/.test(h)) return 'nama';
  if (/^(no|no urut|nomor|#)$/.test(h)) return 'no';
  if (/agama|golongan darah|npwp|rekening|bank|sertifikasi|ibu kandung|suami|istri|anak|kartu|bpjs|jam|beban/.test(h)) return 'abaikan';
  return null;
}

export interface BarisGuru {
  baris: number; sumber: string; nama: string; jk: string; lembagaTeks: string; jabatan: string; fokus: string; golongan: string;
  nuptk: string; pegId: string; npk: string; nip: string; nik: string; tempatLahir: string; tanggalLahir: string; pendidikan: string;
  statusPegawai: string; tmt: string; hp: string; email: string; alamat: string; namaFoto: string; urut: number | null;
  /** Indeks gambar yang ditempel di baris ini (dari gambarXlsx). */
  gambar?: number;
  petunjukLembaga: string;
  unit?: string; foto?: string; galat: string[]; peringatan: string[];
}

const angkaSaja = (v: string) => { const t = v.trim(); if (/^\d+(\.\d+)?e\+?\d+$/i.test(t)) { const n = Number(t); return Number.isFinite(n) ? BigInt(Math.round(n)).toString() : ''; } return t.replace(/\D/g, ''); };
const BUKAN_GURU = /^(jumlah|total|mengetahui|kepala\s+(madrasah|sekolah)\s*$|ttd|catatan|keterangan|petunjuk|contoh)\b/i;

/** Golongan tampilan dari jabatan bila kolom kelompok kosong. */
export function golonganDari(teks: string, jabatan: string): string {
  const t = `${teks} ${jabatan}`.toLowerCase();
  if (/pimpinan|kepala|mudir|direktur|ketua|wakil kepala|wakasek|waka\b/.test(t)) return 'pimpinan';
  if (/staf|staff|tata usaha|\btu\b|operator|bendahara|admin|satpam|penjaga|kebersihan|pustakawan|laboran|caraka|tendik|tenaga kependidikan/.test(t)) return 'staf';
  return 'guru';
}

export function bacaGuru(lembar: Lembar[], gambar: { lembar: string; baris: number; kolom: number }[] = []): { guru: BarisGuru[]; laporan: { nama: string; barisJudul?: number; guru: number; kolom: { kunci: KunciGuru; dari: string }[] }[] } {
  const guru: BarisGuru[] = [];
  const laporan: { nama: string; barisJudul?: number; guru: number; kolom: { kunci: KunciGuru; dari: string }[] }[] = [];
  for (const l of lembar) {
    const rows = l.baris.map((b) => b.map((x) => String(x ?? '').replace(/ /g, ' ').trim()));
    let iJudul = -1, peta = new Map<number, KunciGuru>(), skor = 0;
    for (let r = 0; r < Math.min(rows.length, 30); r += 1) {
      const p = new Map<number, KunciGuru>();
      rows[r]!.forEach((t, c) => { const k = kenaliJudulGuru(t); if (k && ![...p.values()].includes(k)) p.set(c, k); });
      const sk = [...p.values()].filter((k) => k !== 'abaikan' && k !== 'no').length;
      if ([...p.values()].includes('nama') && sk > skor && sk >= 2) { iJudul = r; peta = p; skor = sk; }
    }
    if (iJudul < 0) { laporan.push({ nama: l.nama, guru: 0, kolom: [] }); continue; }
    const kolFoto = [...peta].find(([, k]) => k === 'foto')?.[0];
    const asal = new Map([...peta].map(([c]) => [c, rows[iJudul]![c]!]));
    const judulAtas = rows.slice(0, iJudul).map((b) => b.filter(Boolean).join(' ')).join(' ');
    let petunjuk = `${l.nama} ${judulAtas}`.trim();
    let n = 0;
    for (let i = iJudul + 1; i < rows.length; i += 1) {
      const b = rows[i]!;
      const isi = b.filter(Boolean);
      if (!isi.length) continue;
      const ambil = (k: KunciGuru) => { for (const [c, kk] of peta) if (kk === k) return (b[c] ?? '').trim(); return ''; };
      const nama = ambil('nama').replace(/^\s*\d{1,4}[.)]\s+/, '').replace(/\s+/g, ' ');
      if (!nama || !/[a-z]/i.test(nama) || BUKAN_GURU.test(nama)) {
        if (isi.length <= 2 && /[a-z]/i.test(isi.join(' '))) petunjuk = `${l.nama} ${isi.join(' ')}`; // baris pemisah: „MI Al Huda“, „Guru MTs“
        continue;
      }
      let tempat = ambil('tempatLahir'), tgl = ambil('tanggalLahir');
      const ttl = ambil('ttl');
      if (ttl) { const m = /^(.*?)[,;]\s*(.+)$/.exec(ttl) ?? /^(\D+?)\s+(\d.*)$/.exec(ttl); if (m) { tempat ||= m[1]!.trim(); tgl ||= m[2]!.trim(); } }
      const urut = Number(ambil('urut'));
      const g = gambar.findIndex((x) => x.lembar === l.nama && x.baris === i && (kolFoto === undefined || Math.abs(x.kolom - kolFoto) <= 1));
      guru.push({
        baris: i + 1, sumber: l.nama, nama: judulKata(nama, { nama: true }), jk: normalJk(ambil('jk')), lembagaTeks: ambil('lembaga'), jabatan: judulKata(ambil('jabatan')), fokus: ambil('fokus'), golongan: ambil('golongan'),
        nuptk: angkaSaja(ambil('nuptk')), pegId: angkaSaja(ambil('pegId')), npk: ambil('npk').replace(/\s+/g, ''), nip: angkaSaja(ambil('nip')), nik: angkaSaja(ambil('nik')),
        tempatLahir: judulKata(tempat), tanggalLahir: normalTanggal(tgl) ?? '', pendidikan: ambil('pendidikan'), statusPegawai: ambil('statusPegawai'), tmt: ambil('tmt'),
        hp: ambil('hp').replace(/[^\d+]/g, ''), email: ambil('email').toLowerCase(), alamat: rapikanAlamat(ambil('alamat')), namaFoto: ambil('namaFoto'), urut: Number.isFinite(urut) && urut > 0 ? urut : null,
        ...(g >= 0 ? { gambar: g } : {}), petunjukLembaga: petunjuk, galat: [], peringatan: [],
      });
      n += 1;
    }
    laporan.push({ nama: l.nama, barisJudul: iJudul + 1, guru: n, kolom: [...peta].filter(([, k]) => k !== 'abaikan' && k !== 'no').map(([c, k]) => ({ kunci: k, dari: asal.get(c) ?? '' })) });
  }
  return { guru, laporan };
}

/** Lembaga baris guru: nama/singkatan lembaga → jenjang di teks → petunjuk lembar → satu-satunya lembaga pengimpor. */
export function lembagaGuru(r: BarisGuru, units: UnitItem[], dikelola: string[] | null): string | undefined {
  const cari = (teks: string) => {
    const t = teks.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!t) return undefined;
    const persis = units.find((u) => u.nama.toLowerCase() === t || u.singkat.toLowerCase() === t || u.slug === t);
    if (persis) return persis.slug;
    const kata = units.find((u) => t.includes(u.singkat.toLowerCase()) || t.includes(u.nama.toLowerCase()));
    if (kata) return kata.slug;
    const j = jenjangDari(t);
    if (j) return units.find((u) => jenjangUnit(u.slug) === j)?.slug;
    const jenis = units.find((u) => { const s = u.slug.split('-')[0]!; return s.length >= 3 && new RegExp(`\\b${s}\\b`).test(t); });
    return jenis?.slug;
  };
  return cari(r.lembagaTeks) ?? cari(r.petunjukLembaga) ?? (dikelola && dikelola.length === 1 ? dikelola[0] : undefined);
}

const kunciGtk = (jenis: string, nomor: string) => `u/gtk/${jenis}/${nomor}`;

export function periksaGuru(rows: BarisGuru[], units: UnitItem[], dikelola: string[] | null, boleh: (slug: string) => boolean): BarisGuru[] {
  const lihat = new Map<string, number>();
  return rows.map((r) => {
    const g: string[] = [], w: string[] = [];
    const unit = lembagaGuru(r, units, dikelola);
    if (!unit) g.push('Lembaga tidak dikenali — isi kolom Lembaga (mis. MI Al Huda, MTs, TPQ).');
    else if (!boleh(unit)) g.push('Bukan lembaga yang Anda kelola.');
    if (!r.jabatan && !r.fokus) w.push('Jabatan & fokus mengajar kosong — tampil sebagai „Guru“.');
    if (r.nuptk && r.nuptk.length !== 16) w.push(`NUPTK ${r.nuptk.length} angka (biasanya 16).`);
    if (r.nik && r.nik.length !== 16) w.push(`NIK ${r.nik.length} angka (seharusnya 16).`);
    if (r.nip && r.nip.length !== 18) w.push(`NIP ${r.nip.length} angka (biasanya 18).`);
    for (const [k, v] of [['NUPTK', r.nuptk], ['NIP', r.nip], ['PegID', r.pegId]] as const) {
      if (!v) continue;
      const kunci = `${k}:${v}`;
      if (lihat.has(kunci)) g.push(`${k} sama dengan baris ${lihat.get(kunci)}.`); else lihat.set(kunci, r.baris);
    }
    return { ...r, unit, galat: g, peringatan: w };
  });
}

/** Mencocokkan berkas foto yang diunggah bersama ke baris guru: nama file → NUPTK/NIP/PegID → nama guru. */
export function cocokFoto(r: BarisGuru, berkas: string[]): string | undefined {
  const dasar = (n: string) => n.toLowerCase().replace(/\.[a-z0-9]+$/, '').trim();
  const peta = new Map(berkas.map((n) => [dasar(n), n]));
  if (r.namaFoto && peta.has(dasar(r.namaFoto))) return peta.get(dasar(r.namaFoto));
  for (const nomor of [r.nuptk, r.nip, r.pegId, r.npk].filter(Boolean)) for (const [k, v] of peta) if (digit(k) === nomor) return v;
  const s = slugify(r.nama.replace(/,.*$/, ''), 60);
  for (const [k, v] of peta) if (slugify(k, 60) === s || slugify(k.replace(/,.*$/, ''), 60) === s) return v;
  return undefined;
}

export interface BarisGuruSimpan { r: Omit<BarisGuru, 'galat' | 'peringatan'>; unit: string; status: 'tayang' | 'tinjau' }

/**
 * Simpan/ubah satu guru. Dicari lewat NUPTK → NIP → PegID (penjaga create-once), lalu nama yang sama di lembaga yang sama.
 * Isian kosong di file tidak menghapus data lama; foto lama tetap bila baris tidak membawa foto.
 */
export async function simpanBarisGuru(store: Store, def: Koleksi, koleksi: Record<string, Koleksi>, b: BarisGuruSimpan, k: Kerja, now = Date.now()): ReturnType<Pemroses> {
  const { r, unit } = b;
  let lamaId: string | undefined;
  for (const [jenis, v] of [['nuptk', r.nuptk], ['nip', r.nip], ['pegid', r.pegId]] as const) {
    if (!v || lamaId) continue;
    const g = await store.get<{ id: string }>(kunciGtk(jenis, v));
    if (g && (await ambil(store, 'sdm', g.id))) lamaId = g.id;
  }
  if (!lamaId) {
    const sama = (await semuaIndeks(store, 'sdm', [unit])).find((it) => slugify(it.j, 80) === slugify(r.nama, 80));
    if (sama) lamaId = sama.id;
  }
  const lama = lamaId ? await ambil(store, 'sdm', lamaId) : null;
  if (lama && k.lingkup && !k.lingkup.includes(lama.unit)) return { gagal: 'Guru ini tercatat di lembaga lain yang tidak Anda kelola.', nama: r.nama, baris: r.baris };
  if (lama && k.opsi.mode === 'lewati') return { hasil: 'lewat' };
  const d: Record<string, unknown> = {};
  const isi: Record<string, unknown> = {
    golongan: ['pimpinan', 'guru', 'staf'].includes(r.golongan.toLowerCase()) ? r.golongan.toLowerCase() : golonganDari(r.golongan, r.jabatan),
    jabatan: r.jabatan || (r.fokus ? 'Guru' : ''), bidang: r.fokus, foto: r.foto, urut: r.urut ?? undefined, pendidikan: r.pendidikan, jk: r.jk, nuptk: r.nuptk, pegId: r.pegId, npk: r.npk, nip: r.nip, nik: r.nik,
    tempatLahir: r.tempatLahir, tanggalLahir: r.tanggalLahir, statusPegawai: r.statusPegawai, tmt: r.tmt, hp: r.hp, email: r.email, alamat: r.alamat,
  };
  for (const [kunci, v] of Object.entries(isi)) if (v !== undefined && v !== '' && v !== null) d[kunci] = v;
  if (!d.jabatan) d.jabatan = lama?.d.jabatan ?? 'Guru';
  const gabung = lama ? { ...lama.d, ...d } : d;
  const h = await simpanTerkait(store, def, { id: lama?.id, lama, unit, status: lama?.status === 'tayang' ? 'tayang' : b.status, judul: r.nama, d: gabung, penulis: k.oleh, penulisNama: k.olehNama }, koleksi, now);
  if (h.galat || !h.dok) return { gagal: Object.values(h.galat ?? {}).join(' ') || 'Tidak tersimpan.', nama: r.nama, baris: r.baris };
  for (const [jenis, v] of [['nuptk', r.nuptk], ['nip', r.nip], ['pegid', r.pegId]] as const) if (v && !(await store.createOnce(kunciGtk(jenis, v), { id: h.dok.id }))) await store.put(kunciGtk(jenis, v), { id: h.dok.id });
  return { hasil: lama ? 'ubah' : 'baru' };
}
