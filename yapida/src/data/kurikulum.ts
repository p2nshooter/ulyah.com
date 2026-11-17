/**
 * Struktur mata pelajaran madrasah (Kurikulum Merdeka pada madrasah, KMA 347/2022 dan pembaruannya KMA 450/2024;
 * mata pelajaran PAI & Bahasa Arab menurut KMA 183/2019) — dipakai Peta Pelajaran Madrasah di perpustakaan
 * (pemilik: „Perpustakaan digital pelajaran formal untuk madrasah … cari berapa pelajaran setiap kelas untuk madrasah“).
 *
 * Setiap mata pelajaran ditautkan ke buku perpustakaan: buku pelajaran per kelas (`bse`: mapel buku BSE di katalog) dan
 * bacaan pendukung lintas kelas (`dukung`: mapel/rak buku bawaan — kitab, hadits, kisah, bahasa).
 */
import type { KartuBuku } from './pustaka.ts';

export type JenjangPel = 'ra' | 'mi' | 'mts';
export interface Mapel {
  slug: string;
  nama: string;
  ket: string;
  ikon: string;
  /** Kelas yang mempelajarinya (RA: 0 = kelompok A–B). */
  kelas: number[];
  /** Nama Arab mata pelajaran (sampul Buku Pelajaran Yapida). */
  ar?: string;
  /** Mapel buku pelajaran per kelas di katalog (BSE) — buku utama mapel umum. */
  bse?: string[];
  /** Buku BSE kelas itu yang hanya menjadi bacaan pendukung (PAI umum SD/SMP untuk mapel PAI madrasah). */
  bseDukung?: string[];
  /** Bacaan pendukung: mapel buku bawaan atau rak. */
  dukung?: { mapel?: string[]; rak?: string[]; id?: string[] };
  /** Tautan khusus (mis. Al-Qur’an digital). */
  taut?: [string, string][];
}

const MI = [1, 2, 3, 4, 5, 6];
const MTS = [7, 8, 9];
const PAI = ['Pendidikan Agama Islam'];

export const KURIKULUM: Record<JenjangPel, { nama: string; ringkas: string; kelas: number[]; mapel: Mapel[] }> = {
  ra: {
    nama: 'RA (Raudhatul Athfal)', ringkas: 'Pembelajaran anak usia dini lewat bermain: tiga elemen capaian pembelajaran.', kelas: [0],
    mapel: [
      { slug: 'nilai-agama', nama: 'Nilai Agama & Budi Pekerti', ket: 'Mengenal Allah, doa harian, adab, huruf hijaiyah, kisah nabi.', ikon: '🕌', kelas: [0], dukung: { rak: ['doa', 'anak-ar', 'tpq'], mapel: ['Doa harian', 'Akidah'] }, taut: [['Al-Qur’an digital', '/quran']] },
      { slug: 'jati-diri', nama: 'Jati Diri', ket: 'Mengenal diri, keluarga, perasaan, kemandirian, dan kebiasaan baik.', ikon: '🌱', kelas: [0], dukung: { rak: ['ra', 'cerita'] } },
      { slug: 'literasi-steam', nama: 'Dasar Literasi, Matematika, Sains, Teknologi, Rekayasa & Seni', ket: 'Huruf, angka, warna, alam sekitar, dan berkarya.', ikon: '🎨', kelas: [0], dukung: { rak: ['ra', 'anak-en', 'cerita'] } },
    ],
  },
  mi: {
    nama: 'MI (Madrasah Ibtidaiyah)', ringkas: 'Kelas 1–6: mata pelajaran PAI & Bahasa Arab khas madrasah ditambah mata pelajaran umum.', kelas: MI,
    mapel: [
      { slug: 'quran-hadis', nama: 'Al-Qur’an Hadis', ar: 'الْقُرْآنُ وَالْحَدِيثُ', ket: 'Membaca, menghafal, dan memahami surat pendek serta hadits pilihan.', ikon: '📖', kelas: MI, bseDukung: PAI, dukung: { rak: ['hadits'], mapel: ['Hadits', 'Hadits & akhlak'] }, taut: [['Al-Qur’an digital & murottal', '/quran']] },
      { slug: 'akidah-akhlak', nama: 'Akidah Akhlak', ar: 'الْعَقِيدَةُ وَالْأَخْلَاقُ', ket: 'Rukun iman, asmaul husna, akhlak terpuji, dan adab sehari-hari.', ikon: '🤲', kelas: MI, bseDukung: PAI, dukung: { mapel: ['Akidah', 'Akhlak'], rak: ['kisah'] } },
      { slug: 'fikih', nama: 'Fikih', ar: 'الْفِقْهُ', ket: 'Thaharah, shalat, puasa, zakat, dan ibadah sehari-hari.', ikon: '🧎', kelas: MI, bseDukung: PAI, dukung: { mapel: ['Fikih'], rak: ['doa'] }, taut: [['Jadwal sholat & arah kiblat', '/jadwal-sholat']] },
      { slug: 'ski', nama: 'Sejarah Kebudayaan Islam', ar: 'تَارِيخُ الثَّقَافَةِ الْإِسْلَامِيَّةِ', ket: 'Kisah para nabi, Rasulullah ﷺ, sahabat, dan peradaban Islam.', ikon: '🏛️', kelas: [3, 4, 5, 6], bseDukung: PAI, dukung: { rak: ['kisah'] } },
      { slug: 'bahasa-arab', nama: 'Bahasa Arab', ar: 'اللُّغَةُ الْعَرَبِيَّةُ', ket: 'Kosakata, percakapan, dan kaidah dasar — dilafalkan dengan logat Arab.', ikon: 'ع', kelas: MI, bse: ['Bahasa Arab'], dukung: { rak: ['anak-ar', 'bahasa'] } },
      { slug: 'pendidikan-pancasila', nama: 'Pendidikan Pancasila', ket: 'Nilai Pancasila, norma, keberagaman, dan cinta tanah air.', ikon: '🇮🇩', kelas: MI, bse: ['PPKn'] },
      { slug: 'bahasa-indonesia', nama: 'Bahasa Indonesia', ket: 'Membaca, menulis, menyimak, dan berbicara.', ikon: '✍️', kelas: MI, bse: ['Bahasa Indonesia', 'Tematik'], dukung: { rak: ['cerita'] } },
      { slug: 'matematika', nama: 'Matematika', ket: 'Bilangan, pengukuran, geometri, dan data.', ikon: '➗', kelas: MI, bse: ['Matematika'] },
      { slug: 'ipas', nama: 'IPAS (Ilmu Pengetahuan Alam & Sosial)', ket: 'Makhluk hidup, energi, bumi, serta masyarakat dan lingkungan.', ikon: '🔬', kelas: [3, 4, 5, 6], bse: ['IPA', 'IPS'] },
      { slug: 'seni-budaya', nama: 'Seni Budaya', ket: 'Seni rupa, musik, tari, dan kerajinan.', ikon: '🎵', kelas: MI, bse: ['Seni Budaya & Prakarya'] },
      { slug: 'pjok', nama: 'PJOK', ket: 'Pendidikan jasmani, olahraga, dan kesehatan.', ikon: '⚽', kelas: MI, bse: ['PJOK'] },
      { slug: 'bahasa-inggris', nama: 'Bahasa Inggris', ket: 'Kosakata dan percakapan sederhana — dilafalkan dengan logat Inggris.', ikon: '🔤', kelas: MI, bse: ['Bahasa Inggris'], dukung: { rak: ['anak-en'] } },
      // muatan lokal MI Al Huda (pemilik, 17 Nov 2026: „kelas 1-6 tahfidz dan BTQ (BTQ di kelas 6 g ada) dan kelas 4,5,6 Nahwu Shorof“)
      { slug: 'tahfidz', nama: 'Tahfidz', ar: 'تَحْفِيظُ الْقُرْآنِ', ket: 'Hafalan Al-Qur’an juz 30 bertahap tiap kelas — dengan murajaah, sambung ayat, dan murottal.', ikon: '📿', kelas: MI, taut: [['Al-Qur’an digital & murottal', '/quran']] },
      { slug: 'btq', nama: 'BTQ (Baca Tulis Al-Qur’an)', ar: 'قِرَاءَةُ الْقُرْآنِ وَكِتَابَتُهُ', ket: 'Huruf hijaiyah, harakat, menulis huruf Arab, dan tajwid dasar sampai lancar membaca mushaf.', ikon: '✍🏽', kelas: [1, 2, 3, 4, 5], dukung: { id: ['k-hijaiyah'], rak: ['tpq'] } },
      { slug: 'nahwu-sharaf', nama: 'Nahwu Sharaf', ar: 'النَّحْوُ وَالصَّرْفُ', ket: 'Tata bahasa Arab dasar: kalimah, i’rab, jumlah, dan tashrif fi’il.', ikon: '🧩', kelas: [4, 5, 6], dukung: { id: ['k-jurumiyah', 'k-imrithi'] } },
    ],
  },
  mts: {
    nama: 'MTs (Madrasah Tsanawiyah)', ringkas: 'Kelas 7–9: PAI & Bahasa Arab khas madrasah, IPA, IPS, Informatika, Prakarya, dan lainnya.', kelas: MTS,
    mapel: [
      { slug: 'quran-hadis', nama: 'Al-Qur’an Hadis', ar: 'الْقُرْآنُ وَالْحَدِيثُ', ket: 'Tajwid, hafalan, dan pemahaman ayat serta hadits.', ikon: '📖', kelas: MTS, bseDukung: PAI, dukung: { rak: ['hadits'], mapel: ['Hadits', 'Hadits & akhlak'] }, taut: [['Al-Qur’an digital, tafsir & murottal', '/quran']] },
      { slug: 'akidah-akhlak', nama: 'Akidah Akhlak', ar: 'الْعَقِيدَةُ وَالْأَخْلَاقُ', ket: 'Ilmu tauhid, akhlak kepada Allah, Rasul, diri, dan sesama.', ikon: '🤲', kelas: MTS, bseDukung: PAI, dukung: { mapel: ['Akidah', 'Akhlak', 'Adab menuntut ilmu'] } },
      { slug: 'fikih', nama: 'Fikih', ar: 'الْفِقْهُ', ket: 'Ibadah, muamalah, makanan-minuman, dan hukum Islam dasar.', ikon: '🧎', kelas: MTS, bseDukung: PAI, dukung: { mapel: ['Fikih', 'Fikih & Tasawuf'] } },
      { slug: 'ski', nama: 'Sejarah Kebudayaan Islam', ar: 'تَارِيخُ الثَّقَافَةِ الْإِسْلَامِيَّةِ', ket: 'Dinasti Islam, tokoh, dan Islam di Nusantara.', ikon: '🏛️', kelas: MTS, bseDukung: PAI, dukung: { rak: ['kisah'] } },
      { slug: 'bahasa-arab', nama: 'Bahasa Arab', ar: 'اللُّغَةُ الْعَرَبِيَّةُ', ket: 'Qira’ah, kitabah, hiwar, dan qawa’id (nahwu-sharaf dasar).', ikon: 'ع', kelas: MTS, bse: ['Bahasa Arab'], dukung: { rak: ['bahasa'], mapel: ['Nahwu', 'Nahwu & Sharaf'] } },
      { slug: 'pendidikan-pancasila', nama: 'Pendidikan Pancasila', ket: 'Pancasila, UUD 1945, Bhinneka Tunggal Ika, dan NKRI.', ikon: '🇮🇩', kelas: MTS, bse: ['PPKn'] },
      { slug: 'bahasa-indonesia', nama: 'Bahasa Indonesia', ket: 'Teks, sastra, dan keterampilan berbahasa.', ikon: '✍️', kelas: MTS, bse: ['Bahasa Indonesia'] },
      { slug: 'matematika', nama: 'Matematika', ket: 'Aljabar, geometri, statistika, dan peluang.', ikon: '➗', kelas: MTS, bse: ['Matematika'] },
      { slug: 'ipa', nama: 'IPA', ket: 'Fisika, kimia, dan biologi dasar.', ikon: '🔬', kelas: MTS, bse: ['IPA'] },
      { slug: 'ips', nama: 'IPS', ket: 'Geografi, sejarah, ekonomi, dan sosiologi dasar.', ikon: '🌏', kelas: MTS, bse: ['IPS'] },
      { slug: 'bahasa-inggris', nama: 'Bahasa Inggris', ket: 'Reading, writing, listening, speaking — logat Inggris.', ikon: '🔤', kelas: MTS, bse: ['Bahasa Inggris'], dukung: { rak: ['anak-en'] } },
      { slug: 'informatika', nama: 'Informatika', ket: 'Berpikir komputasional, TIK, dan dasar pemrograman.', ikon: '💻', kelas: MTS, bse: ['TIK'] },
      { slug: 'seni-prakarya', nama: 'Seni Budaya & Prakarya', ket: 'Seni rupa, musik, kerajinan, rekayasa, dan pengolahan.', ikon: '🎨', kelas: MTS, bse: ['Seni Budaya & Prakarya'] },
      { slug: 'pjok', nama: 'PJOK', ket: 'Pendidikan jasmani, olahraga, dan kesehatan.', ikon: '⚽', kelas: MTS, bse: ['PJOK'] },
      // muatan lokal MTs Al Huda (pemilik, 17 Nov 2026: „Buatin jg nahwu shorof, tahfidz btq kelas 7,8,9“)
      { slug: 'tahfidz', nama: 'Tahfidz', ar: 'تَحْفِيظُ الْقُرْآنِ', ket: 'Menuntaskan juz 30 lalu menghafal juz 29 — murajaah, sambung ayat, dan tasmi’.', ikon: '📿', kelas: MTS, taut: [['Al-Qur’an digital & murottal', '/quran']] },
      { slug: 'btq', nama: 'BTQ (Baca Tulis Al-Qur’an)', ar: 'قِرَاءَةُ الْقُرْآنِ وَكِتَابَتُهُ', ket: 'Tahsin: makharijul huruf, sifat huruf, mad, waqaf, bacaan gharib, rasm utsmani, dan kitabah.', ikon: '✍🏽', kelas: MTS, dukung: { rak: ['tpq'] } },
      { slug: 'nahwu-sharaf', nama: 'Nahwu Sharaf', ar: 'النَّحْوُ وَالصَّرْفُ', ket: 'Kalam, i’rab, marfu’at–manshubat–makhfudhat, dan tashrif — menurut Al-Jurumiyyah dan Al-Amtsilah At-Tashrifiyyah.', ikon: '🧩', kelas: MTS, dukung: { id: ['k-jurumiyah', 'k-imrithi', 'k-alfiyah'] } },
    ],
  },
};

export const namaKelas = (j: JenjangPel, k: number) => (j === 'ra' ? 'Kelompok A & B' : `Kelas ${k}`);
const rakJenjang = (j: JenjangPel) => (j === 'mts' ? 'mts' : 'mi');

/** Bacaan pendukung sesuai usia: RA & MI hanya buku anak; MTs buku anak–remaja; buku yang memang ditaruh di rak jenjang itu selalu boleh. */
const SUARA_JENJANG: Record<JenjangPel, string[]> = { ra: ['balita', 'anak'], mi: ['balita', 'anak'], mts: ['anak', 'remaja'] };

/**
 * Buku pelajaran kelas itu dan bacaan pendukungnya — sumber yang sama untuk peta Pelajaran Madrasah dan rak MI/MTs:
 *   1. Buku Pelajaran Yapida mapel & kelas itu (kur = <jenjang>-<kelas>-<slug>, pelajaran/…/*.md);
 *   2. buku BSE mapel umum kelas itu (Matematika, Bahasa Indonesia, IPA/IPS, PPKn, PJOK, …);
 *   3. pendukung: BSE PAI umum (untuk mapel PAI madrasah), lalu buku bawaan yang sesuai usia jenjangnya.
 */
export function bukuMapel(semua: KartuBuku[], j: JenjangPel, kelas: number, m: Mapel): { pelajaran: KartuBuku[]; dukung: KartuBuku[] } {
  const kur = `${j}-${kelas}-${m.slug}`;
  const bseKelas = (daftar?: string[]) => (j === 'ra' || !daftar ? [] : semua.filter((b) => b.id.startsWith('s-') && b.rak.includes(rakJenjang(j)) && b.kelas === `Kelas ${kelas}` && daftar.includes(b.mapel ?? '')));
  const pelajaran = [...semua.filter((b) => b.kur === kur), ...bseKelas(m.bse)];
  const sudah = new Set(pelajaran.map((b) => b.id));
  const usia = (b: KartuBuku) => b.rak.includes(rakJenjang(j)) || (j === 'ra' && b.rak.includes('ra')) || SUARA_JENJANG[j].includes(b.suara);
  const pilihan = new Set(m.dukung?.id ?? []);
  const dukung = [
    ...bseKelas(m.bseDukung),
    ...semua.filter((b) => pilihan.has(b.id)),
    ...semua.filter((b) => !b.id.startsWith('s-') && !b.kur && !pilihan.has(b.id) && usia(b) && ((m.dukung?.mapel ?? []).includes(b.mapel ?? '') || (m.dukung?.rak ?? []).some((r) => b.rak.includes(r)))),
  ].filter((b) => !sudah.has(b.id) && (sudah.add(b.id), true));
  return { pelajaran, dukung: dukung.slice(0, 24) };
}
