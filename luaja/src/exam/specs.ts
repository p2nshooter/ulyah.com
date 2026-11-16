/**
 * Format ujian sertifikat resmi (pemilik, 16 Nov 2026: „satu simulasi wajib sesuai dengan total soal yg bakal di hadapi setiap
 * siswa untuk mendapatkan sertifikat jenjang resminya … mulai dari total soal dll sampai penilaian dan kebijakannya“).
 *
 * Fakta format (bagian, waktu, skala, batas lulus) diambil dari halaman resmi penyelenggara dan dicantumkan sumbernya.
 * JLPT menyebut jumlah soal per 大問 sebagai „目安“ (perkiraan); setiap simulasi LUAJA memakai jumlah itu persis.
 * Soal simulasi ditulis/dibangkitkan LUAJA — bukan salinan soal ujian berhak cipta.
 */
import type { Course } from '../data/model.ts';

export type Skill = 'vocab' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

export interface PartSpec {
  id: string;
  /** Nama resmi bagian (mis. 漢字読み, Lesen Teil 1). */
  name: string;
  /** Penjelasan Indonesia singkat. */
  about: string;
  skill: Skill;
  /** Jumlah soal objektif (0 untuk tugas menulis/berbicara). */
  items: number;
  /** Tugas produktif: poin maksimum (dinilai dengan rubrik). */
  points?: number;
  /** Audio diputar berapa kali (ujian dengar). */
  plays?: 1 | 2;
}

export interface SectionSpec {
  id: string;
  name: string;
  minutes: number;
  parts: PartSpec[];
}

/** Kelompok skor yang dilaporkan (mis. JLPT 得点区分, modul Goethe). */
export interface ScoreGroup {
  id: string;
  name: string;
  /** Bagian (PartSpec.id) yang masuk kelompok ini. */
  parts: string[];
  max: number;
  /** Nilai minimum kelompok (JLPT 基準点, modul Goethe 60 %). */
  min?: number;
}

export interface ExamSpec {
  id: string;
  course: Course;
  level: string;
  family: 'jlpt' | 'goethe' | 'toefl-itp' | 'ielts' | 'cambridge';
  name: string;
  /** Halaman resmi format ujian. */
  source: string;
  sections: SectionSpec[];
  groups: ScoreGroup[];
  /** Skor total maksimum dan batas lulus total. */
  total: { max: number; pass: number };
  /** Kebijakan penilaian & kelulusan (Indonesia). */
  policy: string[];
  /** Predikat menurut skor total (opsional), dari tertinggi. */
  grades?: [number, string][];
  /** proportional (JLPT): skor kelompok = proporsi benar × maks. raw (Goethe): skor kelompok = poin mentah, total = Σ × faktor. */
  scoring?: 'proportional' | 'raw';
  factor?: number;
  /** Lulus hanya bila setiap kelompok dikerjakan (Goethe: keempat bagian). */
  requireAll?: boolean;
}

const J = 'https://www.jlpt.jp/guideline/testsections.html';
const JR = 'https://www.jlpt.jp/guideline/results.html';
const jlptPolicy = (pass: number, groups: string) => [
  `Lulus bila skor total ≥ ${pass} dari 180 DAN setiap kelompok skor mencapai nilai minimumnya (${groups}). Satu kelompok di bawah minimum = tidak lulus, setinggi apa pun skor totalnya (jlpt.jp, „合否の判定“).`,
  'JLPT memakai skala skor setara (equating), bukan sekadar persentase; simulasi LUAJA memperkirakan skor skala dari jawaban benar per kelompok.',
  'Jumlah soal per bagian mengikuti 目安 (perkiraan resmi) JLPT; pada ujian sebenarnya jumlah dapat sedikit berbeda.',
  'Semua soal pilihan ganda (4 pilihan, kadang 3 pada 聴解). Tidak ada pengurangan nilai untuk jawaban salah — jawab semua soal.',
  'Ujian dengar (聴解) diputar SATU kali; simulasi ini mengikuti aturan itu.',
];

/* ── JLPT (jlpt.jp: 試験科目と試験時間, 問題の構成, 得点区分, 合否の判定) ─────────────────────── */
export const EXAMS: ExamSpec[] = [
  {
    id: 'jlpt-n5', course: 'ja', level: 'n5', family: 'jlpt', name: 'JLPT N5', source: J,
    sections: [
      { id: 'moji', name: '言語知識（文字・語彙）', minutes: 20, parts: [
        { id: 'kanjiyomi', name: '漢字読み', about: 'Bacaan kata berhuruf kanji', skill: 'vocab', items: 7 },
        { id: 'hyoki', name: '表記', about: 'Penulisan kanji/katakana dari kata berhiragana', skill: 'vocab', items: 5 },
        { id: 'bunmyaku', name: '文脈規定', about: 'Kata yang cocok dengan konteks', skill: 'vocab', items: 6 },
        { id: 'iikae', name: '言い換え類義', about: 'Ungkapan yang paling dekat artinya', skill: 'vocab', items: 3 },
      ] },
      { id: 'bunpo', name: '言語知識（文法）・読解', minutes: 40, parts: [
        { id: 'bun1', name: '文の文法１（文法形式の判断）', about: 'Bentuk tata bahasa yang tepat', skill: 'grammar', items: 9 },
        { id: 'bun2', name: '文の文法２（文の組み立て）', about: 'Menyusun kalimat (★)', skill: 'grammar', items: 4 },
        { id: 'bunsho', name: '文章の文法', about: 'Tata bahasa dalam wacana', skill: 'grammar', items: 4 },
        { id: 'tanbun', name: '内容理解（短文）', about: 'Teks pendek ±80 karakter', skill: 'reading', items: 2 },
        { id: 'chubun', name: '内容理解（中文）', about: 'Teks sedang ±250 karakter', skill: 'reading', items: 2 },
        { id: 'joho', name: '情報検索', about: 'Mencari informasi dari pengumuman/brosur', skill: 'reading', items: 1 },
      ] },
      { id: 'chokai', name: '聴解', minutes: 30, parts: [
        { id: 'kadai', name: '課題理解', about: 'Apa yang harus dilakukan berikutnya', skill: 'listening', items: 7, plays: 1 },
        { id: 'point', name: 'ポイント理解', about: 'Menangkap poin yang ditanyakan', skill: 'listening', items: 6, plays: 1 },
        { id: 'hatsuwa', name: '発話表現', about: 'Ungkapan yang tepat untuk situasi', skill: 'listening', items: 5, plays: 1 },
        { id: 'sokuji', name: '即時応答', about: 'Tanggapan langsung', skill: 'listening', items: 6, plays: 1 },
      ] },
    ],
    groups: [
      { id: 'gk', name: '言語知識（文字・語彙・文法）・読解', parts: ['kanjiyomi', 'hyoki', 'bunmyaku', 'iikae', 'bun1', 'bun2', 'bunsho', 'tanbun', 'chubun', 'joho'], max: 120, min: 38 },
      { id: 'ck', name: '聴解', parts: ['kadai', 'point', 'hatsuwa', 'sokuji'], max: 60, min: 19 },
    ],
    total: { max: 180, pass: 80 }, policy: jlptPolicy(80, '言語知識・読解 ≥ 38/120, 聴解 ≥ 19/60'),
  },
  {
    id: 'jlpt-n4', course: 'ja', level: 'n4', family: 'jlpt', name: 'JLPT N4', source: J,
    sections: [
      { id: 'moji', name: '言語知識（文字・語彙）', minutes: 25, parts: [
        { id: 'kanjiyomi', name: '漢字読み', about: 'Bacaan kata berhuruf kanji', skill: 'vocab', items: 7 },
        { id: 'hyoki', name: '表記', about: 'Penulisan kanji dari kata berhiragana', skill: 'vocab', items: 5 },
        { id: 'bunmyaku', name: '文脈規定', about: 'Kata yang cocok dengan konteks', skill: 'vocab', items: 8 },
        { id: 'iikae', name: '言い換え類義', about: 'Ungkapan yang paling dekat artinya', skill: 'vocab', items: 4 },
        { id: 'yoho', name: '用法', about: 'Pemakaian kata yang benar dalam kalimat', skill: 'vocab', items: 4 },
      ] },
      { id: 'bunpo', name: '言語知識（文法）・読解', minutes: 55, parts: [
        { id: 'bun1', name: '文の文法１（文法形式の判断）', about: 'Bentuk tata bahasa yang tepat', skill: 'grammar', items: 13 },
        { id: 'bun2', name: '文の文法２（文の組み立て）', about: 'Menyusun kalimat (★)', skill: 'grammar', items: 4 },
        { id: 'bunsho', name: '文章の文法', about: 'Tata bahasa dalam wacana', skill: 'grammar', items: 4 },
        { id: 'tanbun', name: '内容理解（短文）', about: 'Teks pendek ±100–200 karakter', skill: 'reading', items: 3 },
        { id: 'chubun', name: '内容理解（中文）', about: 'Teks sedang ±450 karakter', skill: 'reading', items: 3 },
        { id: 'joho', name: '情報検索', about: 'Mencari informasi dari brosur/pengumuman', skill: 'reading', items: 2 },
      ] },
      { id: 'chokai', name: '聴解', minutes: 35, parts: [
        { id: 'kadai', name: '課題理解', about: 'Apa yang harus dilakukan berikutnya', skill: 'listening', items: 8, plays: 1 },
        { id: 'point', name: 'ポイント理解', about: 'Menangkap poin yang ditanyakan', skill: 'listening', items: 7, plays: 1 },
        { id: 'hatsuwa', name: '発話表現', about: 'Ungkapan yang tepat untuk situasi', skill: 'listening', items: 5, plays: 1 },
        { id: 'sokuji', name: '即時応答', about: 'Tanggapan langsung', skill: 'listening', items: 8, plays: 1 },
      ] },
    ],
    groups: [
      { id: 'gk', name: '言語知識（文字・語彙・文法）・読解', parts: ['kanjiyomi', 'hyoki', 'bunmyaku', 'iikae', 'yoho', 'bun1', 'bun2', 'bunsho', 'tanbun', 'chubun', 'joho'], max: 120, min: 38 },
      { id: 'ck', name: '聴解', parts: ['kadai', 'point', 'hatsuwa', 'sokuji'], max: 60, min: 19 },
    ],
    total: { max: 180, pass: 90 }, policy: jlptPolicy(90, '言語知識・読解 ≥ 38/120, 聴解 ≥ 19/60'),
  },
  {
    id: 'jlpt-n3', course: 'ja', level: 'n3', family: 'jlpt', name: 'JLPT N3', source: J,
    sections: [
      { id: 'moji', name: '言語知識（文字・語彙）', minutes: 30, parts: [
        { id: 'kanjiyomi', name: '漢字読み', about: 'Bacaan kata berhuruf kanji', skill: 'vocab', items: 8 },
        { id: 'hyoki', name: '表記', about: 'Penulisan kanji', skill: 'vocab', items: 6 },
        { id: 'bunmyaku', name: '文脈規定', about: 'Kata yang cocok dengan konteks', skill: 'vocab', items: 11 },
        { id: 'iikae', name: '言い換え類義', about: 'Ungkapan yang paling dekat artinya', skill: 'vocab', items: 5 },
        { id: 'yoho', name: '用法', about: 'Pemakaian kata yang benar', skill: 'vocab', items: 5 },
      ] },
      { id: 'bunpo', name: '言語知識（文法）・読解', minutes: 70, parts: [
        { id: 'bun1', name: '文の文法１（文法形式の判断）', about: 'Bentuk tata bahasa yang tepat', skill: 'grammar', items: 13 },
        { id: 'bun2', name: '文の文法２（文の組み立て）', about: 'Menyusun kalimat (★)', skill: 'grammar', items: 5 },
        { id: 'bunsho', name: '文章の文法', about: 'Tata bahasa dalam wacana', skill: 'grammar', items: 5 },
        { id: 'tanbun', name: '内容理解（短文）', about: 'Teks pendek ±150–200 karakter', skill: 'reading', items: 4 },
        { id: 'chubun', name: '内容理解（中文）', about: 'Teks sedang ±350 karakter', skill: 'reading', items: 6 },
        { id: 'chobun', name: '内容理解（長文）', about: 'Teks panjang ±550 karakter', skill: 'reading', items: 4 },
        { id: 'joho', name: '情報検索', about: 'Mencari informasi', skill: 'reading', items: 2 },
      ] },
      { id: 'chokai', name: '聴解', minutes: 40, parts: [
        { id: 'kadai', name: '課題理解', about: 'Apa yang harus dilakukan berikutnya', skill: 'listening', items: 6, plays: 1 },
        { id: 'point', name: 'ポイント理解', about: 'Menangkap poin yang ditanyakan', skill: 'listening', items: 6, plays: 1 },
        { id: 'gaiyo', name: '概要理解', about: 'Menangkap maksud/pendapat pembicara', skill: 'listening', items: 3, plays: 1 },
        { id: 'hatsuwa', name: '発話表現', about: 'Ungkapan yang tepat untuk situasi', skill: 'listening', items: 4, plays: 1 },
        { id: 'sokuji', name: '即時応答', about: 'Tanggapan langsung', skill: 'listening', items: 9, plays: 1 },
      ] },
    ],
    groups: [
      { id: 'gk', name: '言語知識（文字・語彙・文法）', parts: ['kanjiyomi', 'hyoki', 'bunmyaku', 'iikae', 'yoho', 'bun1', 'bun2', 'bunsho'], max: 60, min: 19 },
      { id: 'dk', name: '読解', parts: ['tanbun', 'chubun', 'chobun', 'joho'], max: 60, min: 19 },
      { id: 'ck', name: '聴解', parts: ['kadai', 'point', 'gaiyo', 'hatsuwa', 'sokuji'], max: 60, min: 19 },
    ],
    total: { max: 180, pass: 95 }, policy: jlptPolicy(95, 'setiap kelompok ≥ 19/60'),
  },
  {
    id: 'jlpt-n2', course: 'ja', level: 'n2', family: 'jlpt', name: 'JLPT N2', source: J,
    sections: [
      { id: 'gengo', name: '言語知識（文字・語彙・文法）・読解', minutes: 105, parts: [
        { id: 'kanjiyomi', name: '漢字読み', about: 'Bacaan kata berhuruf kanji', skill: 'vocab', items: 5 },
        { id: 'hyoki', name: '表記', about: 'Penulisan kanji', skill: 'vocab', items: 5 },
        { id: 'gokeisei', name: '語形成', about: 'Pembentukan kata (awalan/akhiran)', skill: 'vocab', items: 5 },
        { id: 'bunmyaku', name: '文脈規定', about: 'Kata yang cocok dengan konteks', skill: 'vocab', items: 7 },
        { id: 'iikae', name: '言い換え類義', about: 'Ungkapan yang paling dekat artinya', skill: 'vocab', items: 5 },
        { id: 'yoho', name: '用法', about: 'Pemakaian kata yang benar', skill: 'vocab', items: 5 },
        { id: 'bun1', name: '文の文法１', about: 'Bentuk tata bahasa yang tepat', skill: 'grammar', items: 12 },
        { id: 'bun2', name: '文の文法２', about: 'Menyusun kalimat (★)', skill: 'grammar', items: 5 },
        { id: 'bunsho', name: '文章の文法', about: 'Tata bahasa dalam wacana', skill: 'grammar', items: 5 },
        { id: 'tanbun', name: '内容理解（短文）', about: 'Teks pendek ±200 karakter', skill: 'reading', items: 5 },
        { id: 'chubun', name: '内容理解（中文）', about: 'Teks sedang ±500 karakter', skill: 'reading', items: 9 },
        { id: 'togo', name: '統合理解', about: 'Membandingkan dua teks', skill: 'reading', items: 2 },
        { id: 'shucho', name: '主張理解（長文）', about: 'Gagasan penulis dalam teks panjang', skill: 'reading', items: 3 },
        { id: 'joho', name: '情報検索', about: 'Mencari informasi', skill: 'reading', items: 2 },
      ] },
      { id: 'chokai', name: '聴解', minutes: 50, parts: [
        { id: 'kadai', name: '課題理解', about: 'Apa yang harus dilakukan berikutnya', skill: 'listening', items: 5, plays: 1 },
        { id: 'point', name: 'ポイント理解', about: 'Menangkap poin yang ditanyakan', skill: 'listening', items: 6, plays: 1 },
        { id: 'gaiyo', name: '概要理解', about: 'Menangkap maksud pembicara', skill: 'listening', items: 5, plays: 1 },
        { id: 'sokuji', name: '即時応答', about: 'Tanggapan langsung', skill: 'listening', items: 12, plays: 1 },
        { id: 'togoc', name: '統合理解', about: 'Memadukan beberapa informasi', skill: 'listening', items: 4, plays: 1 },
      ] },
    ],
    groups: [
      { id: 'gk', name: '言語知識（文字・語彙・文法）', parts: ['kanjiyomi', 'hyoki', 'gokeisei', 'bunmyaku', 'iikae', 'yoho', 'bun1', 'bun2', 'bunsho'], max: 60, min: 19 },
      { id: 'dk', name: '読解', parts: ['tanbun', 'chubun', 'togo', 'shucho', 'joho'], max: 60, min: 19 },
      { id: 'ck', name: '聴解', parts: ['kadai', 'point', 'gaiyo', 'sokuji', 'togoc'], max: 60, min: 19 },
    ],
    total: { max: 180, pass: 90 }, policy: jlptPolicy(90, 'setiap kelompok ≥ 19/60'),
  },
  {
    id: 'jlpt-n1', course: 'ja', level: 'n1', family: 'jlpt', name: 'JLPT N1', source: J,
    sections: [
      { id: 'gengo', name: '言語知識（文字・語彙・文法）・読解', minutes: 110, parts: [
        { id: 'kanjiyomi', name: '漢字読み', about: 'Bacaan kata berhuruf kanji', skill: 'vocab', items: 6 },
        { id: 'bunmyaku', name: '文脈規定', about: 'Kata yang cocok dengan konteks', skill: 'vocab', items: 7 },
        { id: 'iikae', name: '言い換え類義', about: 'Ungkapan yang paling dekat artinya', skill: 'vocab', items: 6 },
        { id: 'yoho', name: '用法', about: 'Pemakaian kata yang benar', skill: 'vocab', items: 6 },
        { id: 'bun1', name: '文の文法１', about: 'Bentuk tata bahasa yang tepat', skill: 'grammar', items: 10 },
        { id: 'bun2', name: '文の文法２', about: 'Menyusun kalimat (★)', skill: 'grammar', items: 5 },
        { id: 'bunsho', name: '文章の文法', about: 'Tata bahasa dalam wacana', skill: 'grammar', items: 5 },
        { id: 'tanbun', name: '内容理解（短文）', about: 'Teks pendek ±200 karakter', skill: 'reading', items: 4 },
        { id: 'chubun', name: '内容理解（中文）', about: 'Teks sedang ±500 karakter', skill: 'reading', items: 9 },
        { id: 'chobun', name: '内容理解（長文）', about: 'Teks panjang ±1.000 karakter', skill: 'reading', items: 4 },
        { id: 'togo', name: '統合理解', about: 'Membandingkan beberapa teks', skill: 'reading', items: 2 },
        { id: 'shucho', name: '主張理解（長文）', about: 'Gagasan penulis dalam teks panjang', skill: 'reading', items: 4 },
        { id: 'joho', name: '情報検索', about: 'Mencari informasi', skill: 'reading', items: 2 },
      ] },
      { id: 'chokai', name: '聴解', minutes: 55, parts: [
        { id: 'kadai', name: '課題理解', about: 'Apa yang harus dilakukan berikutnya', skill: 'listening', items: 5, plays: 1 },
        { id: 'point', name: 'ポイント理解', about: 'Menangkap poin yang ditanyakan', skill: 'listening', items: 6, plays: 1 },
        { id: 'gaiyo', name: '概要理解', about: 'Menangkap maksud pembicara', skill: 'listening', items: 5, plays: 1 },
        { id: 'sokuji', name: '即時応答', about: 'Tanggapan langsung', skill: 'listening', items: 11, plays: 1 },
        { id: 'togoc', name: '統合理解', about: 'Memadukan beberapa informasi', skill: 'listening', items: 3, plays: 1 },
      ] },
    ],
    groups: [
      { id: 'gk', name: '言語知識（文字・語彙・文法）', parts: ['kanjiyomi', 'bunmyaku', 'iikae', 'yoho', 'bun1', 'bun2', 'bunsho'], max: 60, min: 19 },
      { id: 'dk', name: '読解', parts: ['tanbun', 'chubun', 'chobun', 'togo', 'shucho', 'joho'], max: 60, min: 19 },
      { id: 'ck', name: '聴解', parts: ['kadai', 'point', 'gaiyo', 'sokuji', 'togoc'], max: 60, min: 19 },
    ],
    total: { max: 180, pass: 100 }, policy: jlptPolicy(100, 'setiap kelompok ≥ 19/60'),
  },
];

const G1 = 'https://www.goethe.de/de/spr/kup/prf/prf/gzsd1.html';
/* ── Goethe-Zertifikat A1: Start Deutsch 1 (format & penilaian resmi Goethe-Institut) ─────────────────────── */
EXAMS.push({
  id: 'goethe-a1', course: 'de', level: 'a1', family: 'goethe', name: 'Goethe-Zertifikat A1 · Start Deutsch 1', source: G1,
  scoring: 'raw', factor: 1.66, requireAll: true,
  sections: [
    { id: 'hoeren', name: 'Hören', minutes: 20, parts: [
      { id: 'h1', name: 'Hören · Teil 1', about: 'Enam percakapan singkat sehari-hari — pilih a, b atau c (diputar 2×)', skill: 'listening', items: 6, plays: 2 },
      { id: 'h2', name: 'Hören · Teil 2', about: 'Empat pengumuman di tempat umum — richtig atau falsch (diputar 1×)', skill: 'listening', items: 4, plays: 1 },
      { id: 'h3', name: 'Hören · Teil 3', about: 'Lima pesan telepon — pilih a, b atau c (diputar 2×)', skill: 'listening', items: 5, plays: 2 },
    ] },
    { id: 'lesen', name: 'Lesen', minutes: 25, parts: [
      { id: 'l1', name: 'Lesen · Teil 1', about: 'Dua pesan/e-mail pendek — richtig atau falsch', skill: 'reading', items: 5 },
      { id: 'l2', name: 'Lesen · Teil 2', about: 'Iklan kecil berpasangan — pilih iklan a atau b', skill: 'reading', items: 5 },
      { id: 'l3', name: 'Lesen · Teil 3', about: 'Papan & pengumuman — richtig atau falsch', skill: 'reading', items: 5 },
    ] },
    { id: 'schreiben', name: 'Schreiben', minutes: 20, parts: [
      { id: 's1', name: 'Schreiben · Teil 1', about: 'Mengisi formulir: 5 isian dari teks pendek (1 poin per isian)', skill: 'writing', items: 5 },
      { id: 's2', name: 'Schreiben · Teil 2', about: 'Menulis pesan ±30 kata mencakup 3 poin (10 poin)', skill: 'writing', items: 1, points: 10 },
    ] },
    { id: 'sprechen', name: 'Sprechen', minutes: 15, parts: [
      { id: 'sp1', name: 'Sprechen · Teil 1', about: 'Memperkenalkan diri, mengeja, menyebut angka (3 poin)', skill: 'speaking', items: 1, points: 3 },
      { id: 'sp2', name: 'Sprechen · Teil 2', about: 'Bertanya & menjawab dengan kartu kata (6 poin)', skill: 'speaking', items: 1, points: 6 },
      { id: 'sp3', name: 'Sprechen · Teil 3', about: 'Membuat & menanggapi permintaan dengan kartu gambar (6 poin)', skill: 'speaking', items: 1, points: 6 },
    ] },
  ],
  groups: [
    { id: 'hoeren', name: 'Hören', parts: ['h1', 'h2', 'h3'], max: 15 },
    { id: 'lesen', name: 'Lesen', parts: ['l1', 'l2', 'l3'], max: 15 },
    { id: 'schreiben', name: 'Schreiben', parts: ['s1', 's2'], max: 15 },
    { id: 'sprechen', name: 'Sprechen', parts: ['sp1', 'sp2', 'sp3'], max: 15 },
  ],
  total: { max: 100, pass: 60 },
  grades: [[90, 'sehr gut'], [80, 'gut'], [70, 'befriedigend'], [60, 'ausreichend'], [0, 'nicht bestanden']],
  policy: [
    'Empat bagian: Hören ±20 menit (15 soal), Lesen 25 menit (15 soal), Schreiben 20 menit (formulir 5 isian + pesan ±30 kata), Sprechen ±15 menit dalam kelompok. Bagian tertulis 65 menit tanpa jeda; tanpa kamus.',
    'Setiap bagian bernilai 15 poin mentah; poin mentah × 1,66 lalu dibulatkan → skor resmi 0–100 (75 tertulis + 25 lisan).',
    'Lulus bila skor ≥ 60 dari 100 DAN keempat bagian dikerjakan. Predikat: 90–100 sehr gut · 80–89 gut · 70–79 befriedigend · 60–69 ausreichend · < 60 nicht bestanden.',
    'Hören Teil 1 dan 3 diputar dua kali, Teil 2 satu kali — simulasi ini mengikuti aturan itu.',
    'Schreiben Teil 2 & Sprechen dinilai penguji; di simulasi Anda menilai diri dengan rubrik resmi lalu membandingkan dengan contoh jawaban.',
  ],
});

export const examTotalItems = (e: ExamSpec) => e.sections.reduce((n, s) => n + s.parts.reduce((m, p) => m + p.items, 0), 0);
export const examMinutes = (e: ExamSpec) => e.sections.reduce((n, s) => n + s.minutes, 0);
export const examsOf = (course: Course, level?: string) => EXAMS.filter((e) => e.course === course && (!level || e.level === level));
export const getExam = (id: string) => EXAMS.find((e) => e.id === id);
export { JR as JLPT_RESULTS };
