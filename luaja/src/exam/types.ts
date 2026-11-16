/** Tipe simulasi ujian penuh (lihat specs.ts untuk format resmi). */

/** Baris naskah dengar: M = laki-laki, F = perempuan, N = narator. */
export interface Line { s: 'M' | 'F' | 'N'; t: string }

/** Satu soal di bank: kunci & pembahasan HANYA di server. */
export interface MItem {
  /** mc = pilihan ganda (bawaan), gap = isian singkat, write = menulis, speak = berbicara (dinilai diri dengan rubrik). */
  kind?: 'mc' | 'gap' | 'write' | 'speak';
  stem: string;
  options: string[];
  answer: number;
  why: string;
  /** Kunci bacaan bersama (Mock.passages). */
  passage?: string;
  /** Naskah dengar (dibacakan mesin suara perangkat). */
  audio?: Line[];
  /** Pilihan juga dibacakan dan tidak ditampilkan sebagai teks (即時応答, 発話表現) — seperti ujian sebenarnya. */
  audioOptions?: boolean;
  /** Nomor kalimat Tatoeba (atribusi). */
  src?: number;
  /** gap: semua jawaban yang diterima. */
  accept?: string[];
  /** write/speak: poin maksimum dan rubrik penilaian. */
  points?: number;
  rubric?: { t: string; pts: number }[];
  /** write/speak: contoh jawaban (tampil setelah dinilai). */
  model?: string;
  /** speak: kartu isyarat (contoh lengkap disembunyikan sampai selesai). */
  cues?: string[];
}

export interface MockItem extends MItem { id: string; part: string }
export interface MockPart { id: string; name: string; about: string; plays?: 1 | 2; items: MockItem[] }
export interface MockSection { id: string; name: string; minutes: number; parts: MockPart[] }
export interface Mock {
  id: string;
  exam: string;
  n: number;
  title: string;
  free: boolean;
  sections: MockSection[];
  passages: Record<string, string>;
}

export interface ResultItem {
  id: string;
  kind: 'mc' | 'gap' | 'write' | 'speak';
  chosen: number;
  answer: number;
  ok: boolean;
  why: string;
  options?: string[];
  /** Poin yang diperoleh / maksimum soal ini. */
  earned: number;
  max: number;
  /** gap/write: teks peserta; speak/write: nilai diri. */
  text?: string;
  self?: number;
  accept?: string[];
  model?: string;
}

export interface MockResult {
  mock: string;
  total: number;
  max: number;
  pass: boolean;
  passMark: number;
  /** Predikat resmi (mis. „gut“). */
  grade?: string;
  /** Skor mentah × faktor (Goethe) — untuk rincian. */
  factor?: number;
  groups: { id: string; name: string; score: number; max: number; min?: number; ok: boolean; correct: number; items: number; attempted: boolean }[];
  parts: { id: string; name: string; correct: number; items: number; earned: number; max: number }[];
  items: ResultItem[];
  answered: number;
  count: number;
}
