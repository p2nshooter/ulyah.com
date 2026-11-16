/**
 * Pembaca file master pintar (pemilik, 15 Nov 2026: „walaupun urutan file master yg di upload tidak berurut … tata
 * letak file master yg d upload jika ga rapih, tetap di kenalin dengan smart upload“).
 *
 * Yang dikenali, apa pun tata letaknya:
 *  - judul kolom dalam urutan dan ejaan apa pun („NAMA PESERTA DIDIK“, „JK“, „TTL“, „No Induk“, „Kls“ …), di baris mana
 *    pun, termasuk judul dua tingkat („Data Ayah“ → „Nama“, „NIK“; „Tanggal Lahir“ → „Tgl“, „Bln“, „Thn“);
 *  - kolom tanpa judul (atau judul asing) dari isinya: 10 angka = NISN, 16 angka = NIK lalu No. KK, L/P, tanggal, kelas,
 *    nama; kolom nomor urut dilewati;
 *  - kolom gabungan dipecah (TTL → tempat + tanggal; „Kelas 3A“ → tingkat + rombel) dan kolom terpecah digabung
 *    (tgl/bln/thn → tanggal; RT, RW, dusun, desa, kecamatan … → alamat);
 *  - beberapa lembar, beberapa tabel dalam satu lembar, baris judul/keterangan di atas tabel („DAFTAR SISWA MI AL HUDA
 *    TP 2026/2027“), baris pemisah di tengah tabel („KELAS 1-A“, „MTs Al Huda“), baris kosong, baris jumlah dan tanda
 *    tangan — semuanya menjadi petunjuk lembaga, kelas, dan tahun pelajaran, bukan data;
 *  - siswa yang sama di beberapa lembar digabung (isian kosong dilengkapi).
 * Penulisan dirapikan: nama huruf kapital semua → huruf awal kapital, alamat dengan ejaan baku (src/lib/alamat.ts).
 */
import type { Lembar } from '../lib/xlsx.ts';
import { judulKata, rapikanAlamat, tulisAlamat } from '../lib/alamat.ts';
import { digit, jenjangDari, levelTingkat, normalTanggal, rombelDariKelas } from './siswa.ts';

export type KunciKolom =
  | 'no' | 'abaikan' | 'nsm' | 'jenjang' | 'lembaga' | 'tingkat' | 'rombel' | 'kelas' | 'nis' | 'nisn' | 'nik' | 'nama' | 'jk'
  | 'tempatLahir' | 'tanggalLahir' | 'ttl' | 'tglHari' | 'tglBulan' | 'tglTahun' | 'ayah' | 'ibu' | 'kk' | 'alamat'
  | 'kampung' | 'rt' | 'rw' | 'rtrw' | 'desa' | 'kecamatan' | 'kabupaten' | 'provinsi' | 'kodepos' | 'statusSiswa';

export const LABEL_KOLOM: Record<KunciKolom, string> = {
  no: 'Nomor urut', abaikan: 'Tidak dipakai', nsm: 'NSM lembaga', jenjang: 'Jenjang', lembaga: 'Nama lembaga', tingkat: 'Tingkat/kelompok', rombel: 'Rombel',
  kelas: 'Kelas (tingkat + rombel)', nis: 'NIS lokal', nisn: 'NISN', nik: 'NIK siswa', nama: 'Nama lengkap', jk: 'L/P', tempatLahir: 'Tempat lahir',
  tanggalLahir: 'Tanggal lahir', ttl: 'Tempat, tanggal lahir', tglHari: 'Tanggal (hari) lahir', tglBulan: 'Bulan lahir', tglTahun: 'Tahun lahir',
  ayah: 'Nama ayah', ibu: 'Nama ibu', kk: 'No. KK', alamat: 'Alamat', kampung: 'Kampung/dusun', rt: 'RT', rw: 'RW', rtrw: 'RT/RW', desa: 'Desa/kelurahan',
  kecamatan: 'Kecamatan', kabupaten: 'Kabupaten/kota', provinsi: 'Provinsi', kodepos: 'Kode pos', statusSiswa: 'Status siswa',
};

const normal = (h: string) => h.toLowerCase().replace(/[_\n\r]+/g, ' ').replace(/[^a-z0-9/ ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Mengenali satu judul kolom. null = tidak dikenal (lalu dicoba dari isinya). */
export function kenaliJudul(asli: string): KunciKolom | null {
  const h = normal(asli);
  if (!h) return null;
  const pribadiLain = /\b(nik|pekerjaan|penghasilan|pendidikan|tahun|lahir|hp|telp|telepon|status|agama|nomor|no|alamat|kebutuhan|email)\b/;
  if (/\b(ayah|bapak)\b/.test(h)) return pribadiLain.test(h.replace(/\bnama\b/, '')) && !/^nama ayah/.test(h) ? 'abaikan' : 'ayah';
  if (/\bibu\b/.test(h)) return pribadiLain.test(h.replace(/\bnama\b/, '')) && !/^nama ibu/.test(h) ? 'abaikan' : 'ibu';
  if (/\bwali\b|\basal\b|\bsebelum/.test(h)) return 'abaikan';
  if (/\bnisn\b/.test(h)) return 'nisn';
  if (/\bnsm\b/.test(h)) return 'nsm';
  if (/\bnpsn\b/.test(h)) return 'abaikan';
  if (/(^|\s)(no|nomor) ?kk\b|kartu keluarga|^kk$|\bno kk\b/.test(h)) return 'kk';
  if (/\bnik\b|induk kependudukan/.test(h)) return 'nik';
  if (/\bnis\b|nis lokal|nomor induk|no induk|^nipd\b|^induk$|^no reg/.test(h)) return 'nis';
  if (/tempat.*(tanggal|tgl)|^ttl$|^t t l$|tempat dan tanggal/.test(h)) return 'ttl';
  if (/tempat lahir|^tempat$|tmp lahir|tmpt lahir|kota lahir|tempat lhr/.test(h)) return 'tempatLahir';
  if (/\b(bln|bulan)\b/.test(h) && !/pelajaran|ajaran|masuk|bayar|spp/.test(h)) return 'tglBulan';
  if (/\b(thn|tahun)\b/.test(h) && /lahir|^thn$|^tahun$/.test(h) && !/pelajaran|ajaran|masuk|lulus/.test(h)) return 'tglTahun';
  if (/tanggal lahir|tgl lahir|tgl lhr|^lahir$|tanggal lhr|^tgl$|^tanggal$|date of birth|^dob$|birth/.test(h)) return 'tanggalLahir';
  if (/^(jenis kelamin|kelamin|jk|j k|l ?\/ ?p|lp|gender|sex|l p)$|jenis kelamin/.test(h)) return 'jk';
  if (/nama lembaga|nama madrasah|nama sekolah|satuan pendidikan|^lembaga$|^madrasah$|^sekolah$|^unit$/.test(h)) return 'lembaga';
  if (/jenjang|tingkat pendidikan|^bentuk pendidikan/.test(h)) return 'jenjang';
  if (/rombel|rombongan|nama kelas|kelas paralel|^ruang/.test(h)) return 'rombel';
  if (/^(kelas|kls|kelas \/ rombel|kelas rombel|kelas\/rombel)$/.test(h)) return 'kelas';
  if (/tingkat|kelompok|^kelas\b|grade/.test(h)) return 'tingkat';
  if (/^rt ?\/ ?rw$|^rt rw$/.test(h)) return 'rtrw';
  if (/^rt$/.test(h)) return 'rt';
  if (/^rw$/.test(h)) return 'rw';
  if (/\bdusun\b|^kampung|^kp$|^blok$/.test(h)) return 'kampung';
  if (/kode ?pos/.test(h)) return 'kodepos';
  if (/kelurahan|\bdesa\b/.test(h)) return 'desa';
  if (/kecamatan/.test(h)) return 'kecamatan';
  if (/kabupaten|\bkota\b/.test(h)) return 'kabupaten';
  if (/provinsi|propinsi/.test(h)) return 'provinsi';
  if (/alamat|domisili|tempat tinggal/.test(h)) return 'alamat';
  if (/^status|keaktifan|status siswa|status peserta|mutasi/.test(h)) return 'statusSiswa';
  if (/nama lengkap|nama siswa|nama peserta|nama murid|nama santri|nama anak|^nama$|^name$|full name|^nama pd$/.test(h)) return 'nama';
  if (/^(no|no urut|nomor|nomor urut|urut|#)$/.test(h)) return 'no';
  if (/agama|telp|\bhp\b|email|hobi|cita|berat|tinggi|darah|anak ke|saudara|transport|jarak|\bkip\b|\bkps\b|\bpkh\b|bank|rekening|\bpip\b|^ket|keterangan|catatan|foto|ttd|paraf|kebutuhan|penghasilan|pekerjaan/.test(h)) return 'abaikan';
  return null;
}

/** Baris yang isinya judul kolom semua (sub-judul „Tgl | Bln | Thn | Nama | NIK“), bukan data. */
const barisJudulSaja = (b: string[]) => { const isi = b.filter(Boolean); return isi.length >= 2 && isi.filter((x) => kenaliJudul(x) !== null).length / isi.length >= 0.6; };

const KUNCI_DATA: KunciKolom[] = ['nisn', 'nis', 'nama', 'jk', 'tanggalLahir', 'ttl', 'tempatLahir', 'tingkat', 'kelas', 'rombel', 'nik', 'kk', 'ayah', 'ibu', 'alamat', 'tglBulan'];

interface Peta { kolom: Map<number, KunciKolom>; asal: Map<number, string>; skor: number }

function petaDari(judul: string[]): Peta {
  const kolom = new Map<number, KunciKolom>(), asal = new Map<number, string>();
  const dipakai = new Set<KunciKolom>();
  judul.forEach((t, c) => {
    const k = kenaliJudul(t);
    if (!k) return;
    // Kunci yang sama dua kali: yang pertama menang, kecuali kolom alamat terpecah (desa dua kali, dsb.) → abaikan
    const akhir: KunciKolom = dipakai.has(k) && k !== 'abaikan' && k !== 'no' ? (k === 'nik' && !dipakai.has('kk') ? 'kk' : 'abaikan') : k;
    kolom.set(c, akhir); asal.set(c, t.replace(/\s+/g, ' ').trim()); dipakai.add(akhir);
  });
  // „Tanggal lahir“ bersama „Bln“ dan „Thn“: kolom tanggalnya berarti hari.
  if (dipakai.has('tglBulan') && dipakai.has('tglTahun')) for (const [c, k] of kolom) if (k === 'tanggalLahir') kolom.set(c, 'tglHari');
  const kunci = new Set([...kolom.values()]);
  const skor = KUNCI_DATA.filter((k) => kunci.has(k)).length + (kunci.has('nama') ? 2 : 0);
  return { kolom, asal, skor };
}

/** Judul dua tingkat: sel induk yang digabung (kosong di kanannya) diteruskan ke anak-anaknya. */
function judulDuaTingkat(atas: string[], bawah: string[]): string[] {
  const n = Math.max(atas.length, bawah.length);
  const out: string[] = [];
  let induk = '';
  for (let c = 0; c < n; c += 1) {
    const a = (atas[c] ?? '').trim(), b = (bawah[c] ?? '').trim();
    if (a) induk = a; else if (!b) induk = '';
    out.push(b ? `${a || induk} ${b}`.trim() : a);
  }
  return out;
}

const huruf = (v: string) => /[a-z]/i.test(v);
const porsi = (vals: string[], f: (v: string) => boolean) => (vals.length ? vals.filter(f).length / vals.length : 0);
const angkaSaja = (v: string) => {
  const t = v.trim();
  if (/^\d+(\.\d+)?e\+?\d+$/i.test(t)) { const n = Number(t); return Number.isFinite(n) ? BigInt(Math.round(n)).toString() : ''; }
  return /^[\d\s.'`-]+$/.test(t) ? t.replace(/\D/g, '') : '';
};
const RE_JK = /^(l|p|lk|pr|laki|laki-laki|laki laki|perempuan|pria|wanita)$/i;

/** Menebak kolom yang judulnya tidak dikenal dari isinya. */
function tebakDariIsi(peta: Peta, data: string[][], lebar: number): void {
  const sudah = () => new Set([...peta.kolom.values()]);
  const kosong: number[] = [];
  for (let c = 0; c < lebar; c += 1) if (!peta.kolom.has(c)) kosong.push(c);
  const nilai = (c: number) => data.slice(0, 80).map((b) => (b[c] ?? '').trim()).filter(Boolean);
  const tetapkan = (c: number, k: KunciKolom) => { peta.kolom.set(c, k); peta.asal.set(c, `(dikenali dari isi kolom ${String.fromCharCode(65 + (c % 26))}${c >= 26 ? '+' : ''})`); };
  for (const c of kosong) {
    const v = nilai(c);
    if (v.length < 2) continue;
    // nomor urut 1, 2, 3 …
    if (porsi(v, (x, ) => /^\d{1,4}\.?$/.test(x)) > 0.9 && v.slice(0, 5).every((x, i) => Number(x.replace('.', '')) === Number(v[0]!.replace('.', '')) + i)) { tetapkan(c, 'no'); continue; }
    const s = sudah();
    if (!s.has('nisn') && porsi(v, (x) => { const d = angkaSaja(x); return d.length >= 9 && d.length <= 10; }) >= 0.7) { tetapkan(c, 'nisn'); continue; }
    if (porsi(v, (x) => angkaSaja(x).length === 16) >= 0.7) { tetapkan(c, !s.has('nik') ? 'nik' : !s.has('kk') ? 'kk' : 'abaikan'); continue; }
    if (!s.has('jk') && porsi(v, (x) => RE_JK.test(x)) >= 0.8) { tetapkan(c, 'jk'); continue; }
    if (!s.has('tanggalLahir') && !s.has('ttl') && porsi(v, (x) => /[a-z]{3}|[-/.]/i.test(x) && normalTanggal(x) !== null) >= 0.7) {
      tetapkan(c, porsi(v, (x) => /^[a-z .'-]+,/i.test(x)) >= 0.5 ? 'ttl' : 'tanggalLahir'); continue;
    }
    if (!s.has('tingkat') && !s.has('kelas') && porsi(v, (x) => /^(kelas|kls|kelompok)\b/i.test(x) || rombelDariKelas(x) !== null || /^[IVX]{1,4}$/.test(x)) >= 0.8) { tetapkan(c, 'kelas'); continue; }
    if (!s.has('nis') && porsi(v, (x) => { const d = angkaSaja(x); return d.length >= 3 && d.length <= 8; }) >= 0.8 && new Set(v).size === v.length) { tetapkan(c, 'nis'); continue; }
  }
  // Nama: kolom huruf yang paling panjang dan paling banyak kata (bukan alamat).
  if (!sudah().has('nama')) {
    let terbaik = -1, skor = 0;
    for (const c of kosong) {
      if (peta.kolom.has(c)) continue;
      const v = nilai(c);
      if (v.length < 2 || porsi(v, (x) => huruf(x) && !/\d/.test(x)) < 0.8 || porsi(v, (x) => /\b(jl|jln|rt|rw|desa|kp|kec|kab)\b/i.test(x)) > 0.2) continue;
      const kata = v.reduce((n, x) => n + x.split(/\s+/).length, 0) / v.length;
      const sk = kata * (new Set(v).size / v.length);
      if (sk > skor) { skor = sk; terbaik = c; }
    }
    if (terbaik >= 0 && skor >= 1.5) tetapkan(terbaik, 'nama');
  }
  if (!sudah().has('tempatLahir') && !sudah().has('ttl')) {
    const tgl = [...peta.kolom].find(([, k]) => k === 'tanggalLahir')?.[0];
    if (tgl !== undefined && !peta.kolom.has(tgl - 1)) {
      const v = nilai(tgl - 1);
      if (v.length >= 2 && porsi(v, (x) => huruf(x) && !/\d/.test(x) && x.split(/\s+/).length <= 3) >= 0.8) tetapkan(tgl - 1, 'tempatLahir');
    }
  }
}

export interface Petunjuk { jenjang?: string; tp?: string; lembaga?: string; tingkat?: string; rombel?: string }

/** Petunjuk dari teks judul lembar, baris keterangan di atas tabel, atau baris pemisah di tengah tabel. */
export function petunjukDari(teks: string): Petunjuk {
  const p: Petunjuk = {};
  const t = teks.replace(/\s+/g, ' ').trim();
  const tp = /(20\d{2})\s*[/-]\s*(20\d{2})/.exec(t);
  if (tp && Number(tp[2]) === Number(tp[1]) + 1) p.tp = `${tp[1]}/${tp[2]}`;
  const tanpaTp = t.replace(/(20\d{2})\s*[/-]\s*(20\d{2})/, ' ');
  const j = jenjangDari(tanpaTp.replace(/\bkelompok\b/gi, ''));
  if (j) { p.jenjang = j; p.lembaga = t; }
  const k = /\b(?:kelas|kls|kelompok)\s*[:.]?\s*([0-9]{1,2}|[ivx]{1,4}|[ab])(?:\s*[-./]?\s*([a-z]{1,2}|\d{1,2}))?\b/i.exec(tanpaTp);
  if (k) {
    const lv = /^[ab]$/i.test(k[1]!) ? (k[1]!.toUpperCase() === 'A' ? 0 : 1) : levelTingkat(k[1]!);
    if (lv !== null) {
      p.tingkat = /kelompok/i.test(k[0]) || /^[ab]$/i.test(k[1]!) ? `Kelompok ${lv === 0 ? 'A' : 'B'}` : `Kelas ${lv}`;
      if (k[2]) p.rombel = /kelompok/i.test(k[0]) ? `${lv === 0 ? 'A' : 'B'}-${k[2].toUpperCase()}` : `${lv}-${k[2].toUpperCase()}`;
    }
  }
  return p;
}

export interface BarisSiswa {
  baris: number; sumber: string; nsm: string; jenjang: string; tingkat: string; rombel: string; nis: string; nisn: string; nik: string; nama: string; jk: string;
  tempatLahir: string; tanggalLahir: string; ayah: string; ibu: string; kk: string; alamat: string; statusSiswa: string; lembagaTeks: string;
  petunjuk: Petunjuk; unit?: string; tahunAcuan?: string; galat: string[]; peringatan: string[];
}
export interface BarisLembaga { jenjang: string; nsm: string; npsn: string; nama: string; kepala: string; nipKepala: string; tp: string }
export interface LaporanLembar { nama: string; jenis: 'siswa' | 'lembaga' | 'lewat'; barisJudul?: number; tabel?: number; siswa: number; kolom: { kunci: KunciKolom; dari: string }[]; alasan?: string }

/** Nama orang: spasi rapi, huruf awal kapital bila ditulis kapital semua / kecil semua, nomor urut di depan dibuang. */
export const rapikanNama = (s: string) => judulKata(s.replace(/^\s*\d{1,4}[.)]\s+/, '').replace(/\s+/g, ' ').replace(/\s*,\s*$/, '').trim(), { nama: true });

const BUKAN_SISWA = /^(jumlah|total|sub ?total|laki|perempuan|mengetahui|kepala|ttd|tanda tangan|catatan|keterangan|nb|n\.b|dicetak|sumber|operator|wali kelas|bendahara|guru|nip|petunjuk|contoh)\b/i;

function barisKeSiswa(b: string[], peta: Peta, petunjuk: Petunjuk, sumber: string, nomor: number): BarisSiswa | null {
  const ambil = (k: KunciKolom) => { for (const [c, kk] of peta.kolom) if (kk === k) { const v = (b[c] ?? '').trim(); if (v) return v; } return ''; };
  const namaMentah = ambil('nama');
  if (!namaMentah || !huruf(namaMentah) || BUKAN_SISWA.test(namaMentah) || /^\d+$/.test(namaMentah)) return null;
  const nisn = ambil('nisn'), nis = ambil('nis'), tglM = ambil('tanggalLahir'), ttl = ambil('ttl'), jk = ambil('jk');
  const tglPisah = ambil('tglTahun') ? `${ambil('tglHari')} ${ambil('tglBulan')} ${ambil('tglTahun')}`.trim() : '';
  if (!nisn && !nis && !tglM && !ttl && !tglPisah && !jk && !ambil('tingkat') && !ambil('kelas')) return null; // keterangan, bukan siswa
  let tempat = ambil('tempatLahir'), tanggal = tglM || tglPisah.replace(/\s+/g, ' ');
  if (ttl) {
    const m = /^(.*?)[,;]\s*(.+)$/.exec(ttl) ?? /^(\D+?)\s+(\d.*)$/.exec(ttl);
    if (m) { if (!tempat) tempat = m[1]!.trim(); if (!tanggal) tanggal = m[2]!.trim(); } else if (!tanggal) tanggal = ttl;
  }
  // Kelas gabungan („3A“, „VII-B“) → tingkat + rombel; tingkat kosong → petunjuk baris pemisah / judul lembar.
  let tingkat = ambil('tingkat'), rombel = ambil('rombel');
  const kelas = ambil('kelas');
  if (kelas) { const r = rombelDariKelas(kelas); if (!tingkat) tingkat = kelas; if (!rombel && r) rombel = r; }
  if (tingkat && !rombel) { const r = rombelDariKelas(tingkat); if (r) rombel = r; }
  if (!tingkat && petunjuk.tingkat) tingkat = petunjuk.tingkat;
  if (!rombel && petunjuk.rombel) rombel = petunjuk.rombel;
  // Alamat: kolom tunggal, atau bagian-bagian yang terpecah.
  const rtrw = ambil('rtrw').split(/[/\s-]+/);
  const pecahan = { kampung: ambil('kampung'), rt: ambil('rt') || rtrw[0] || '', rw: ambil('rw') || rtrw[1] || '', desa: ambil('desa'), kecamatan: ambil('kecamatan'), kabupaten: ambil('kabupaten'), provinsi: ambil('provinsi'), kodepos: ambil('kodepos') };
  const alamatM = ambil('alamat');
  const alamat = Object.values(pecahan).some(Boolean) ? tulisAlamat({ jalan: alamatM || undefined, ...Object.fromEntries(Object.entries(pecahan).filter(([, v]) => v)) }, { singkat: true }) : rapikanAlamat(alamatM);
  const lembagaTeks = ambil('lembaga');
  return {
    baris: nomor, sumber, nsm: digit(ambil('nsm')), jenjang: ambil('jenjang'), tingkat, rombel: rombel.replace(/\s+/g, ' ').toUpperCase().replace(/^KELAS\s*/, ''), nis: angkaSaja(nis) || digit(nis), nisn: angkaSaja(nisn) || nisn,
    nik: angkaSaja(ambil('nik')) || digit(ambil('nik')), nama: rapikanNama(namaMentah), jk, tempatLahir: judulKata(tempat), tanggalLahir: tanggal,
    ayah: rapikanNama(ambil('ayah')), ibu: rapikanNama(ambil('ibu')), kk: angkaSaja(ambil('kk')) || digit(ambil('kk')), alamat, statusSiswa: ambil('statusSiswa'),
    lembagaTeks, petunjuk: { ...petunjuk }, galat: [], peringatan: [],
  };
}

const kenalLembaga = (judul: string[]) => {
  const h = judul.map(normal);
  return h.some((x) => /nama lembaga|nama madrasah|nama sekolah/.test(x)) && h.some((x) => /\bnsm\b|\bnpsn\b|kepala/.test(x)) && !h.some((x) => /nisn|nama siswa|nama lengkap siswa|peserta didik/.test(x));
};

function bacaLembagaLembar(l: Lembar, i: number): BarisLembaga[] {
  const judul = l.baris[i]!.map(normal);
  const kol = (re: RegExp) => judul.findIndex((x) => re.test(x));
  const k = { jenjang: kol(/jenjang/), nsm: kol(/\bnsm\b/), npsn: kol(/npsn/), nama: kol(/nama lembaga|nama madrasah|nama sekolah/), kepala: kol(/nama kepala|^kepala/), nip: kol(/nip|nuptk/), tp: kol(/tahun pelajaran|tahun ajaran|^tp$/) };
  const out: BarisLembaga[] = [];
  for (const b of l.baris.slice(i + 1)) {
    const v = (j: number) => (j >= 0 ? (b[j] ?? '').trim() : '');
    if (!v(k.nsm) && !v(k.nama)) continue;
    out.push({ jenjang: v(k.jenjang), nsm: digit(v(k.nsm)), npsn: digit(v(k.npsn)), nama: v(k.nama), kepala: v(k.kepala), nipKepala: v(k.nip), tp: petunjukDari(v(k.tp)).tp ?? '' });
  }
  return out;
}

const str = (v: unknown, n = 300) => (typeof v === 'string' ? v.slice(0, n) : typeof v === 'number' ? String(v).slice(0, n) : '');
const KUNCI_TEKS = ['nsm', 'jenjang', 'tingkat', 'rombel', 'nis', 'nisn', 'nik', 'nama', 'jk', 'tempatLahir', 'tanggalLahir', 'ayah', 'ibu', 'kk', 'alamat', 'statusSiswa', 'lembagaTeks', 'sumber'] as const;

/**
 * Hasil baca dari peramban (src/klien/impor.ts) — data tidak tepercaya: hanya bidang yang dikenal, bertipe teks,
 * dipotong panjangnya; pemeriksaan sesungguhnya tetap periksaBaris di server.
 */
export function masterDariJson(x: unknown): ReturnType<typeof bacaMaster> {
  const o = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>;
  const siswa = (Array.isArray(o.siswa) ? o.siswa : []).slice(0, 6000).map((r0, i): BarisSiswa => {
    const r = (r0 && typeof r0 === 'object' ? r0 : {}) as Record<string, unknown>;
    const p = (r.petunjuk && typeof r.petunjuk === 'object' ? r.petunjuk : {}) as Record<string, unknown>;
    const out = { baris: Number(r.baris) > 0 ? Math.floor(Number(r.baris)) : i + 1, petunjuk: { jenjang: str(p.jenjang, 10) || undefined, tp: /^\d{4}\/\d{4}$/.test(str(p.tp, 9)) ? str(p.tp, 9) : undefined, lembaga: str(p.lembaga, 120) || undefined, tingkat: str(p.tingkat, 20) || undefined, rombel: str(p.rombel, 20) || undefined }, galat: [], peringatan: [] } as unknown as BarisSiswa;
    for (const k of KUNCI_TEKS) (out as unknown as Record<string, string>)[k] = str(r[k], k === 'alamat' ? 300 : 120);
    return out;
  }).filter((r) => r.nama);
  const lembaga = (Array.isArray(o.lembaga) ? o.lembaga : []).slice(0, 50).map((l0): BarisLembaga => {
    const l = (l0 && typeof l0 === 'object' ? l0 : {}) as Record<string, unknown>;
    return { jenjang: str(l.jenjang, 30), nsm: digit(str(l.nsm, 20)), npsn: digit(str(l.npsn, 20)), nama: str(l.nama, 120), kepala: str(l.kepala, 120), nipKepala: str(l.nipKepala, 30), tp: /^\d{4}\/\d{4}$/.test(str(l.tp, 9)) ? str(l.tp, 9) : '' };
  });
  const laporan = (Array.isArray(o.laporan) ? o.laporan : []).slice(0, 40).map((l0): LaporanLembar => {
    const l = (l0 && typeof l0 === 'object' ? l0 : {}) as Record<string, unknown>;
    const jenis = l.jenis === 'lembaga' || l.jenis === 'lewat' ? l.jenis : 'siswa';
    const kolom = (Array.isArray(l.kolom) ? l.kolom : []).slice(0, 40).map((k0) => { const k = (k0 && typeof k0 === 'object' ? k0 : {}) as Record<string, unknown>; return { kunci: (str(k.kunci, 20) in LABEL_KOLOM ? str(k.kunci, 20) : 'abaikan') as KunciKolom, dari: str(k.dari, 120) }; });
    return { nama: str(l.nama, 60), jenis, barisJudul: Number(l.barisJudul) || undefined, tabel: Number(l.tabel) || undefined, siswa: Number(l.siswa) || 0, kolom, alasan: str(l.alasan, 200) || undefined };
  });
  const pesan = siswa.length ? [] : ['Tidak ada data siswa yang terbaca. Pastikan file memuat kolom nama siswa beserta NISN, NIS, atau tanggal lahir.'];
  return { siswa, lembaga, laporan, pesan };
}

/** Membaca seluruh lembar file master: siswa, master lembaga, dan laporan pengenalan kolom per lembar. */
export function bacaMaster(lembar: Lembar[]): { siswa: BarisSiswa[]; lembaga: BarisLembaga[]; laporan: LaporanLembar[]; pesan: string[] } {
  const siswa: BarisSiswa[] = [], lembaga: BarisLembaga[] = [], laporan: LaporanLembar[] = [];
  for (const l of lembar) {
    const rows = l.baris.map((b) => b.map((x) => String(x ?? '').replace(/ /g, ' ').trim()));
    const lebar = Math.max(0, ...rows.map((b) => b.length));
    // Lembar master lembaga
    const iL = rows.slice(0, 40).findIndex((b) => kenalLembaga(b));
    if (iL >= 0) { const isi = bacaLembagaLembar({ nama: l.nama, baris: rows }, iL); lembaga.push(...isi); laporan.push({ nama: l.nama, jenis: 'lembaga', barisJudul: iL + 1, siswa: 0, kolom: [] }); continue; }
    const awalLembar = petunjukDari(l.nama);
    let petunjuk: Petunjuk = { ...awalLembar };
    let peta: Peta | null = null;
    let tabel = 0, jumlah = 0, barisJudul: number | undefined;
    const kolomLaporan = new Map<string, { kunci: KunciKolom; dari: string }>();
    const ringkasPeta = (p: Peta) => { for (const [c, k] of p.kolom) if (k !== 'abaikan' && k !== 'no') kolomLaporan.set(`${k}`, { kunci: k, dari: p.asal.get(c) ?? '' }); };
    let i = 0;
    const cariJudul = (dari: number): { i: number; p: Peta; dua: boolean } | null => {
      let best: { i: number; p: Peta; dua: boolean } | null = null;
      for (let r = dari; r < Math.min(rows.length, dari + 40); r += 1) {
        if (rows[r]!.filter(Boolean).length < 2) continue;
        const tunggal = petaDari(rows[r]!);
        // Judul dua tingkat hanya bila baris di bawahnya juga berisi judul (bukan data siswa).
        const dua = r + 1 < rows.length && barisJudulSaja(rows[r + 1]!) ? petaDari(judulDuaTingkat(rows[r]!, rows[r + 1]!)) : null;
        const pilih = dua && dua.skor >= tunggal.skor && [...dua.kolom.values()].includes('nama') ? { p: dua, d: true } : { p: tunggal, d: false };
        if (pilih.p.skor >= 4 && [...pilih.p.kolom.values()].includes('nama') && (!best || pilih.p.skor > best.p.skor)) best = { i: r, p: pilih.p, dua: pilih.d };
        if (best && r > best.i + 1) break; // judul pertama yang kuat dipakai; tabel berikutnya dicari lagi nanti
      }
      return best;
    };
    let ketemu = cariJudul(0);
    if (!ketemu) {
      // Tanpa baris judul sama sekali: seluruh lembar ditebak dari isinya.
      const p: Peta = { kolom: new Map(), asal: new Map(), skor: 0 };
      tebakDariIsi(p, rows, lebar);
      if ([...p.kolom.values()].includes('nama') && ([...p.kolom.values()].some((k) => k === 'nisn' || k === 'nis' || k === 'tanggalLahir'))) ketemu = { i: -1, p, dua: false };
    }
    if (!ketemu) { laporan.push({ nama: l.nama, jenis: 'lewat', siswa: 0, kolom: [], alasan: rows.some((b) => b.some(Boolean)) ? 'Tidak ada tabel siswa (kolom nama dan NISN/NIS/tanggal lahir tidak ditemukan).' : 'Lembar kosong.' }); continue; }
    // Teks di atas tabel pertama = petunjuk (judul laporan, nama lembaga, kelas, tahun pelajaran).
    for (const b of rows.slice(0, Math.max(0, ketemu.i))) { const t = b.filter(Boolean).join(' '); if (t) petunjuk = { ...petunjuk, ...Object.fromEntries(Object.entries(petunjukDari(t)).filter(([, v]) => v)) }; }
    const pakai = (k: { i: number; p: Peta; dua: boolean }) => {
      peta = k.p; tabel += 1; barisJudul ??= k.i + 1;
      tebakDariIsi(peta, rows.slice(k.i + (k.dua ? 2 : 1)), lebar);
      ringkasPeta(peta);
      i = k.i + (k.dua ? 2 : 1);
    };
    pakai(ketemu);
    for (; i < rows.length; i += 1) {
      const b = rows[i]!;
      const isi = b.filter(Boolean);
      if (!isi.length) continue;
      // Tabel baru (judul kolom diulang, mis. satu tabel per kelas)
      const pBaru = petaDari(b);
      if (pBaru.skor >= 4 && [...pBaru.kolom.values()].includes('nama')) { const lanjut = cariJudul(i); if (lanjut && lanjut.i === i) { pakai(lanjut); i -= 1; continue; } }
      const s = barisKeSiswa(b, peta!, petunjuk, l.nama, i + 1);
      if (s) { siswa.push(s); jumlah += 1; continue; }
      // Baris pemisah („KELAS 1-A“, „MTs Al Huda“, „Tahun Pelajaran 2026/2027“) → petunjuk baris-baris berikutnya.
      if (isi.length <= 3) {
        const t = isi.join(' ');
        const p = petunjukDari(t);
        if (p.tingkat) { petunjuk = { ...petunjuk, tingkat: p.tingkat, rombel: p.rombel }; }
        if (p.jenjang) petunjuk = { ...petunjuk, jenjang: p.jenjang, lembaga: p.lembaga, ...(p.tingkat ? {} : { tingkat: undefined, rombel: undefined }) };
        if (p.tp) petunjuk = { ...petunjuk, tp: p.tp };
      }
    }
    laporan.push({ nama: l.nama, jenis: 'siswa', barisJudul, tabel, siswa: jumlah, kolom: [...kolomLaporan.values()] });
  }
  // Siswa yang sama di beberapa lembar/tabel: digabung, isian kosong dilengkapi.
  const gabung: BarisSiswa[] = [];
  const indeks = new Map<string, BarisSiswa>();
  for (const s of siswa) {
    const kunci = s.nisn ? `n:${digit(s.nisn).padStart(10, '0')}` : s.nis ? `s:${s.nis}` : `x:${s.nama.toLowerCase()}|${s.tanggalLahir}`;
    const ada = indeks.get(kunci);
    if (ada && ada.nama.toLowerCase() === s.nama.toLowerCase()) {
      for (const k of Object.keys(s) as (keyof BarisSiswa)[]) if (typeof s[k] === 'string' && !ada[k] && s[k]) (ada as unknown as Record<string, unknown>)[k] = s[k];
      continue;
    }
    if (!ada) indeks.set(kunci, s);
    gabung.push(s);
  }
  const pesan: string[] = [];
  if (!gabung.length) pesan.push('Tidak ada data siswa yang terbaca. Pastikan file memuat kolom nama siswa beserta NISN, NIS, atau tanggal lahir.');
  return { siswa: gabung, lembaga, laporan, pesan };
}
