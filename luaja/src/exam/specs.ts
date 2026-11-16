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
  /** Predikat menurut skor total (opsional). */
  grades?: [number, string][];
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

export const examTotalItems = (e: ExamSpec) => e.sections.reduce((n, s) => n + s.parts.reduce((m, p) => m + p.items, 0), 0);
export const examMinutes = (e: ExamSpec) => e.sections.reduce((n, s) => n + s.minutes, 0);
export const examsOf = (course: Course, level?: string) => EXAMS.filter((e) => e.course === course && (!level || e.level === level));
export const getExam = (id: string) => EXAMS.find((e) => e.id === id);
export { JR as JLPT_RESULTS };
