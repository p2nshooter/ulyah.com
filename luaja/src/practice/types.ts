/**
 * Bank latihan soal LUAJA (pemilik, 15 Nov 2026): setiap paket soal mengikuti format ujian nyata jenjangnya; kunci jawaban
 * hanya ada di server dan baru dikirim setelah SEMUA soal dijawab; hasil memuat prediksi nilai sementara pada skala ujian
 * sebenarnya dan kata penyemangat; yang bisa diunduh hanya laporan latihan peserta.
 *
 * Soal ditulis tim LUAJA mengikuti deskripsi format resmi (bukan salinan soal ujian berhak cipta) atau dibangkitkan dari
 * tabel data yang diperiksa (artikel Jerman, konjugasi, kata kerja tak beraturan, kana, kanji).
 */
import type { Course } from '../data/model.ts';

export interface PQ {
  id: string;
  /** Bagian ujian, mis. „Lesen Teil 1“, „Structure“, „漢字読み“. */
  section: string;
  /** Soal (bahasa sasaran; boleh berisi ___ untuk rumpang dan 【】 untuk kata yang ditanyakan). */
  stem: string;
  /** Petunjuk Indonesia singkat (opsional). */
  hint?: string;
  /** Kunci bacaan bersama (paket.passages). */
  passage?: string;
  options: string[];
  /** Indeks jawaban benar — HANYA di server. */
  answer: number;
  /** Pembahasan berbahasa Indonesia — dikirim setelah selesai. */
  why: string;
}

export type ExamKey = 'goethe' | 'cefr-en' | 'toefl-itp' | 'ielts' | 'jlpt' | 'drill';

export interface PSet {
  id: string;
  course: Course;
  level: string;
  exam: ExamKey;
  /** Nama format ujian yang ditiru, untuk ditampilkan. */
  examName: string;
  title: string;
  desc: string;
  minutes: number;
  kind: 'simulasi' | 'drill';
  /** Terbuka untuk semua tanpa langganan. */
  free?: boolean;
  passages?: Record<string, { title?: string; text: string }>;
  questions: PQ[];
}

/** Pembangun soal ringkas: id diberi otomatis per paket. */
export function q(section: string, stem: string, options: string[], answer: number, why: string, extra: { hint?: string; passage?: string } = {}): Omit<PQ, 'id'> {
  return { section, stem, options, answer, why, ...extra };
}
export function pack(base: Omit<PSet, 'questions'>, items: Omit<PQ, 'id'>[]): PSet {
  return { ...base, questions: items.map((it, i) => ({ id: `${base.id}-${String(i + 1).padStart(2, '0')}`, ...it })) };
}

/** Versi untuk peramban: tanpa kunci dan pembahasan. */
export function publicSet(s: PSet) {
  return {
    id: s.id, course: s.course, level: s.level, examName: s.examName, title: s.title, desc: s.desc, minutes: s.minutes, kind: s.kind,
    passages: s.passages ?? {},
    questions: s.questions.map((x) => ({ id: x.id, section: x.section, stem: x.stem, hint: x.hint, passage: x.passage, options: x.options })),
  };
}

export interface Graded {
  setId: string;
  total: number;
  correct: number;
  pct: number;
  /** Per soal: pilihan peserta, kunci, benar/salah, pembahasan. */
  items: { id: string; chosen: number; answer: number; ok: boolean; why: string }[];
  /** Per bagian ujian. */
  sections: { section: string; correct: number; total: number }[];
  prediction: Prediction;
  message: { title: string; text: string };
}

export interface Prediction {
  /** Teks utama, mis. „72 / 100“. */
  score: string;
  /** Skala dan batas lulus. */
  scale: string;
  /** Lulus / belum menurut batas jenjang (bila ada). */
  pass?: boolean;
  /** Catatan kejujuran: perkiraan dari latihan, bukan skor resmi. */
  note: string;
}

/** Konversi Reading IELTS Academic (40 soal) → band. Tabel umum yang dipakai lembaga persiapan; perkiraan. */
const IELTS_ACADEMIC_READING: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];

export function predict(s: PSet, pct: number): Prediction {
  const note = 'Perkiraan dari latihan ini — bukan skor resmi. Makin banyak paket dikerjakan, makin akurat.';
  switch (s.exam) {
    case 'goethe': {
      const pts = Math.round(pct * 100);
      return { score: `${pts} / 100`, scale: `Goethe-Zertifikat ${s.level.toUpperCase()} · lulus ≥ 60`, pass: pts >= 60, note };
    }
    case 'toefl-itp': {
      // Skala bagian Structure & Written Expression 31–68; total ITP ≈ rata-rata tiga bagian × 10.
      const sec = Math.round(31 + pct * 37);
      return { score: `${sec} (bagian) · ≈ ${sec * 10} total`, scale: 'TOEFL ITP Level 1 · total 310–677 · banyak kampus meminta ≥ 450–550', pass: sec * 10 >= 450, note: `${note} Total diperkirakan bila bagian lain setara.` };
    }
    case 'ielts': {
      const raw = Math.round(pct * 40);
      const band = IELTS_ACADEMIC_READING.find(([min]) => raw >= min)?.[1] ?? 0;
      return { score: `Band ${band.toFixed(1)}`, scale: `IELTS Academic Reading · setara ${raw}/40 benar · banyak beasiswa meminta band ≥ 6.5`, pass: band >= 6.5, note };
    }
    case 'jlpt': {
      const sec = Math.round(pct * 120);
      const totalPass = s.level === 'n5' ? 80 : s.level === 'n4' ? 90 : 95;
      return { score: `${sec} / 120`, scale: `JLPT ${s.level.toUpperCase()} · Pengetahuan Bahasa & Membaca (min. 38) · lulus total ≥ ${totalPass}/180`, pass: sec >= 38 && sec >= Math.round(totalPass * (120 / 180)), note };
    }
    case 'cefr-en': {
      const pts = Math.round(pct * 100);
      return { score: `${pts} / 100`, scale: `Bahasa Inggris ${s.level.replace('-', ' ')} · target ≥ 70 sebelum naik jenjang`, pass: pts >= 70, note };
    }
    default: {
      const pts = Math.round(pct * 100);
      return { score: `${pts} / 100`, scale: 'Latihan penguatan · target ≥ 80 untuk penguasaan', pass: pts >= 80, note: 'Latihan penguatan dasar; ulangi sampai ≥ 80 secara konsisten.' };
    }
  }
}

const MESSAGES: Record<'top' | 'good' | 'mid' | 'low' | 'start', { title: string; text: string }[]> = {
  top: [
    { title: 'Luar biasa — Anda siap melangkah lebih jauh.', text: 'Hasil ini menunjukkan penguasaan yang matang. Pertahankan ritme dengan satu paket setiap hari agar kemampuan tetap tajam di hari ujian.' },
    { title: 'Prestasi gemilang!', text: 'Ketelitian Anda terlihat jelas. Tantang diri dengan paket berikutnya — konsistensi inilah yang membedakan peserta terbaik.' },
    { title: 'Sempurna hampir di setiap bagian.', text: 'Anda berada di jalur yang sangat baik. Lanjutkan ke paket berikutnya dan jaga kebiasaan berlatih ini.' },
  ],
  good: [
    { title: 'Hasil yang sangat baik.', text: 'Fondasi Anda kuat. Pelajari pembahasan soal yang terlewat — beberapa koreksi kecil akan membawa Anda ke nilai tertinggi.' },
    { title: 'Bagus sekali — sedikit lagi menuju puncak.', text: 'Fokuskan latihan pada bagian dengan skor terendah di laporan ini, lalu kerjakan paket berikutnya.' },
    { title: 'Kemajuan Anda nyata.', text: 'Anda sudah melewati ambang yang dibutuhkan. Satu atau dua paket lagi akan menjadikan hasil ini stabil.' },
  ],
  mid: [
    { title: 'Anda sudah di jalur yang benar.', text: 'Setiap kesalahan hari ini adalah pelajaran untuk ujian sesungguhnya. Baca pembahasannya dengan tenang, lalu coba kembali.' },
    { title: 'Langkah yang baik — terus berlatih.', text: 'Nilai ini adalah titik awal yang kokoh. Ulangi materi pada bagian yang paling banyak terlewat dan kerjakan paket berikutnya.' },
    { title: 'Konsistensi adalah kuncinya.', text: 'Lima belas menit latihan setiap hari lebih efektif daripada belajar semalaman. Lanjutkan, hasil Anda akan naik.' },
  ],
  low: [
    { title: 'Setiap ahli pernah memulai dari sini.', text: 'Jangan berkecil hati. Pelajari pembahasan setiap soal, ulangi pelajaran terkait, lalu kerjakan paket ini sekali lagi.' },
    { title: 'Ini bagian dari proses.', text: 'Kesalahan adalah peta menuju perbaikan. Tandai pola yang sering keliru dan coba lagi besok — Anda pasti meningkat.' },
    { title: 'Tetap semangat!', text: 'Mulailah dari pelajaran jenjang ini, kemudian kembali ke latihan. Kemajuan kecil setiap hari akan terasa besar dalam sebulan.' },
  ],
  start: [
    { title: 'Langkah pertama sudah diambil.', text: 'Yang terpenting adalah memulai. Ikuti pelajaran jenjang ini secara berurutan, lalu ulangi latihan — Anda akan terkejut melihat kemajuannya.' },
    { title: 'Mari bangun fondasinya bersama.', text: 'Pelajari pembahasan satu per satu, ikuti pelajaran gratis jenjang ini, dan coba kembali. Setiap usaha dihitung.' },
  ],
};

export function motivation(setId: string, pct: number): { title: string; text: string } {
  const band = pct >= 0.9 ? 'top' : pct >= 0.75 ? 'good' : pct >= 0.55 ? 'mid' : pct >= 0.3 ? 'low' : 'start';
  const list = MESSAGES[band];
  let h = 0;
  for (const ch of `${setId}:${Math.round(pct * 100)}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length]!;
}

export class IncompleteError extends Error {
  constructor(readonly missing: number) {
    super(`${missing} soal belum dijawab.`);
  }
}

/** Nilai satu paket. Semua soal wajib terjawab (kunci tidak dibuka sebelum selesai). */
export function gradeSet(s: PSet, answers: Record<string, unknown>): Graded {
  const missing = s.questions.filter((x) => !Number.isInteger(Number(answers[x.id])) || answers[x.id] === null || answers[x.id] === '' || Number(answers[x.id]) < 0 || Number(answers[x.id]) >= x.options.length).length;
  if (missing) throw new IncompleteError(missing);
  const items = s.questions.map((x) => {
    const chosen = Number(answers[x.id]);
    return { id: x.id, chosen, answer: x.answer, ok: chosen === x.answer, why: x.why };
  });
  const correct = items.filter((i) => i.ok).length;
  const pct = correct / s.questions.length;
  const bySec = new Map<string, { correct: number; total: number }>();
  s.questions.forEach((x, i) => {
    const cur = bySec.get(x.section) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (items[i]!.ok) cur.correct += 1;
    bySec.set(x.section, cur);
  });
  return {
    setId: s.id, total: s.questions.length, correct, pct, items,
    sections: [...bySec.entries()].map(([section, v]) => ({ section, ...v })),
    prediction: predict(s, pct),
    message: motivation(s.id, pct),
  };
}

/** Pemeriksaan mutu paket (uji unit): id unik, jawaban dalam rentang, opsi unik & tidak kosong, bacaan ada. */
export function validateSet(s: PSet): string[] {
  const errs: string[] = [];
  if (s.questions.length < 10) errs.push(`${s.id}: soal < 10`);
  const ids = new Set<string>();
  for (const x of s.questions) {
    if (ids.has(x.id)) errs.push(`${x.id}: id ganda`);
    ids.add(x.id);
    if (x.options.length < 2) errs.push(`${x.id}: opsi < 2`);
    if (new Set(x.options.map((o) => o.trim())).size !== x.options.length) errs.push(`${x.id}: opsi kembar ${JSON.stringify(x.options)}`);
    if (x.options.some((o) => !o.trim())) errs.push(`${x.id}: opsi kosong`);
    if (!Number.isInteger(x.answer) || x.answer < 0 || x.answer >= x.options.length) errs.push(`${x.id}: kunci di luar rentang`);
    if (!x.why.trim()) errs.push(`${x.id}: pembahasan kosong`);
    if (x.passage && !s.passages?.[x.passage]) errs.push(`${x.id}: bacaan ${x.passage} tidak ada`);
  }
  return errs;
}
