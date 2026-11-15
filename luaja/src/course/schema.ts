/**
 * Skema pelajaran interaktif (docs/LUAJA-BLUEPRINT.md §6.1). Satu pelajaran = 10 langkah berurutan. Semua teks asing
 * selalu berpasangan dengan terjemahan Indonesia; audio dibuat peramban dari teks (Web Speech) dengan locale bahasa.
 *
 * Kode pelajaran: <course>-<level>-m<modul>-l<pelajaran>, mis. de-a1-m01-l02.
 */
import type { Course } from '../data/model.ts';

export interface Line {
  /** Pembicara (nama pendek). */
  who: string;
  /** Kalimat dalam bahasa yang dipelajari. */
  text: string;
  /** Terjemahan Indonesia. */
  id: string;
  /** Jepang: bacaan kana; Jerman/Inggris: kosong. */
  kana?: string;
  /** Catatan kecil (mis. „Sie = Anda, sopan“). */
  note?: string;
}

export interface VocabItem {
  /** Kata/frasa; Jerman: dengan artikel („der Tisch“). */
  term: string;
  id: string;
  /** Jerman: jamak; Jepang: kana + romaji; Inggris: lafal sederhana. */
  extra?: string;
  /** Jerman: m | f | n untuk warna gender. */
  gender?: 'm' | 'f' | 'n';
  example: string;
  exampleId: string;
}

export interface GrammarPoint {
  title: string;
  /** Penjelasan Indonesia, Markdown ringan. Boleh berisi tabel sederhana dengan | . */
  body: string;
  examples: { text: string; id: string }[];
}

/** Jenis latihan — semua dinilai di server untuk kuis, dan di peramban dengan kunci terenkripsi-ringan untuk latihan. */
export type Exercise =
  | { type: 'choice'; prompt: string; promptId?: string; options: string[]; answer: number; why: string }
  | { type: 'gap'; prompt: string; promptId?: string; before: string; after: string; answer: string[]; why: string }
  | { type: 'order'; prompt: string; promptId?: string; words: string[]; answer: string; why: string }
  | { type: 'match'; prompt: string; pairs: [string, string][] }
  | { type: 'dictation'; prompt: string; text: string; id: string }
  | { type: 'speak'; prompt: string; text: string; id: string }
  | { type: 'translate'; prompt: string; source: string; answer: string[]; why: string };

export interface Lesson {
  code: string;
  course: Course;
  level: string;
  module: number;
  index: number;
  title: string;
  /** Judul dalam bahasa yang dipelajari. */
  native: string;
  /** Tujuan (can-do), Indonesia. */
  goals: string[];
  /** Langkah 2: adegan. */
  scene: { title: string; setting: string; lines: Line[] };
  /** Langkah 3: teks bacaan pendek (opsional; kalau kosong, dipakai adegan). */
  reading?: { title: string; sentences: { text: string; id: string; kana?: string }[] };
  /** Langkah 4. */
  vocab: VocabItem[];
  /** Langkah 5. */
  grammar: GrammarPoint[];
  /** Langkah 6 (terbimbing, umpan balik langsung). */
  practice: Exercise[];
  /** Langkah 7: lafal. */
  pronunciation: { focus: string; tips: string[]; drill: { text: string; id: string; kana?: string }[] };
  /** Langkah 8 (mandiri): dengar-ketik dan tulis bebas. */
  independent: Exercise[];
  /** Langkah 9: kuis; jawaban hanya di server. ≥ 80 % membuka pelajaran berikutnya. */
  quiz: Exercise[];
  /** Langkah 10: lima poin inti. */
  recap: string[];
  /** Gratis untuk semua (pelajaran pertama setiap jenjang). */
  free?: boolean;
  /** Perkiraan menit. */
  minutes: number;
}

export interface Module {
  course: Course;
  level: string;
  n: number;
  title: string;
  native: string;
  focus: string;
  outcome: string;
  lessons: string[];
}

export const lessonCode = (course: Course, level: string, m: number, l: number) => `${course}-${level}-m${String(m).padStart(2, '0')}-l${String(l).padStart(2, '0')}`;

export function parseCode(code: string): { course: Course; level: string; module: number; index: number } | null {
  const m = /^(de|en|ja)-([a-z0-9-]+)-m(\d{2})-l(\d{2})$/.exec(code);
  if (!m) return null;
  return { course: m[1] as Course, level: m[2]!, module: Number(m[3]), index: Number(m[4]) };
}

/** Pemeriksaan mutu pelajaran (standar keberhasilan #6): dijalankan uji unit atas semua pelajaran dan admin saat menyimpan. */
export function validateLesson(l: Lesson): string[] {
  const errs: string[] = [];
  if (!parseCode(l.code)) errs.push(`kode tidak sah: ${l.code}`);
  if (!l.title || !l.native) errs.push('judul kosong');
  if (l.goals.length < 2) errs.push('tujuan < 2');
  if (l.scene.lines.length < 6) errs.push('adegan < 6 baris');
  for (const ln of l.scene.lines) if (!ln.text || !ln.id) errs.push('baris adegan tanpa teks/terjemahan');
  if (l.vocab.length < 10) errs.push(`kosakata ${l.vocab.length} < 10`);
  for (const v of l.vocab) {
    if (!v.term || !v.id || !v.example || !v.exampleId) errs.push(`kosakata tidak lengkap: ${v.term}`);
    // Jerman: kata benda yang diberi gender wajib tampil dengan artikelnya (der/die/das) agar pelajar menghafal keduanya.
    if (l.course === 'de' && v.gender && !/^(der|die|das) /.test(v.term)) errs.push(`kata benda Jerman tanpa artikel: ${v.term}`);
  }
  // Jerman: setiap pelajaran mengajarkan minimal tiga kata benda lengkap dengan artikel.
  if (l.course === 'de' && l.vocab.filter((v) => v.gender).length < 3) errs.push('kata benda Jerman berartikel < 3');
  if (l.grammar.length < 1) errs.push('tata bahasa kosong');
  const types = new Set([...l.practice, ...l.independent].map((e) => e.type));
  if (l.practice.length + l.independent.length < 10) errs.push(`latihan ${l.practice.length + l.independent.length} < 10`);
  if (types.size < 4) errs.push(`jenis latihan ${types.size} < 4`);
  if (l.quiz.length !== 8) errs.push(`kuis ${l.quiz.length} ≠ 8`);
  for (const q of l.quiz) if (q.type === 'match' || q.type === 'speak' || q.type === 'dictation') errs.push(`kuis tidak boleh berjenis ${q.type}`);
  if (l.pronunciation.drill.length < 3) errs.push('latihan lafal < 3');
  if (l.recap.length < 3) errs.push('rekap < 3 poin');
  return errs;
}

/** Teks berhuruf Jepang dibandingkan tanpa spasi (pelajar boleh mengetik dengan atau tanpa spasi). */
const JA = /[\u3040-\u30ff\u3400-\u9fff]/;
export function norm(s: string, ja = JA.test(s)): string {
  const t = s.toLowerCase().normalize('NFKC').replace(/[.,!?;:…。、！？「」『』"'’‚“”()（）]/g, '').replace(/\s+/g, ' ').trim();
  return ja ? t.replace(/\s/g, '') : t;
}

/** Nilai satu jawaban. Dipakai server untuk latihan terbimbing dan kuis (kunci tidak pernah dikirim sebelum dijawab). */
export function grade(e: Exercise, answer: unknown): boolean {
  const got = String(answer ?? '');
  switch (e.type) {
    case 'choice':
      return answer !== '' && answer !== null && Number(answer) === e.answer;
    case 'gap':
    case 'translate':
      return e.answer.some((a) => norm(a) === norm(got, JA.test(a)));
    case 'order':
      // Urutan kata yang sama ⇔ sama setelah spasi dihapus.
      return norm(e.answer).replace(/\s/g, '') === norm(got).replace(/\s/g, '');
    case 'match': {
      const m = (answer ?? null) as Record<string, string> | null;
      return Boolean(m && typeof m === 'object') && e.pairs.every(([a, b]) => m![a] === b);
    }
    case 'dictation':
      return norm(e.text) === norm(got, JA.test(e.text));
    case 'speak': {
      // Pengenal suara peramban memberi teks; cukup ≥ 70 % kata (atau huruf, untuk Jepang) cocok.
      if (JA.test(e.text)) {
        const want = [...norm(e.text, true)];
        const have = [...norm(got, true)];
        if (!want.length) return false;
        const pool = new Map<string, number>();
        for (const ch of have) pool.set(ch, (pool.get(ch) ?? 0) + 1);
        let hit = 0;
        for (const ch of want) if ((pool.get(ch) ?? 0) > 0) { hit += 1; pool.set(ch, pool.get(ch)! - 1); }
        return hit / want.length >= 0.7;
      }
      const want = norm(e.text).split(' ').filter(Boolean);
      const have = norm(got).split(' ').filter(Boolean);
      if (!want.length) return false;
      return want.filter((w) => have.includes(w)).length / want.length >= 0.7;
    }
  }
}

/** Jawaban benar yang ditampilkan setelah peserta menjawab. */
export function shownAnswer(e: Exercise): string {
  switch (e.type) {
    case 'choice': return e.options[e.answer] ?? '';
    case 'gap': case 'translate': return e.answer[0] ?? '';
    case 'order': return e.answer;
    case 'match': return e.pairs.map(([a, b]) => `${a} = ${b}`).join(' · ');
    case 'dictation': case 'speak': return e.text;
  }
}

/** Latihan untuk peramban: tanpa kunci/pembahasan; susun-kata & jodohkan diacak deterministik. */
export type ClientExercise =
  | { type: 'choice'; prompt: string; promptId?: string; options: string[] }
  | { type: 'gap'; prompt: string; promptId?: string; before: string; after: string }
  | { type: 'order'; prompt: string; promptId?: string; words: string[] }
  | { type: 'match'; prompt: string; left: string[]; right: string[] }
  | { type: 'dictation'; prompt: string; say: string }
  | { type: 'speak'; prompt: string; say: string; id: string }
  | { type: 'translate'; prompt: string; source: string };

function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 13), 1103515245) + 12345) >>> 0) / 4294967296;
}
function mix<T>(arr: T[], seed: string, notEqual?: (a: T[]) => boolean): T[] {
  const r = seeded(seed);
  let out = [...arr];
  for (let tries = 0; tries < 6; tries += 1) {
    out = [...arr];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    if (!notEqual || notEqual(out)) break;
  }
  return out;
}

export function clientExercise(e: Exercise, key: string): ClientExercise {
  switch (e.type) {
    case 'choice': return { type: 'choice', prompt: e.prompt, promptId: e.promptId, options: e.options };
    case 'gap': return { type: 'gap', prompt: e.prompt, promptId: e.promptId, before: e.before, after: e.after };
    case 'order': {
      const target = norm(e.answer).replace(/\s/g, '');
      return { type: 'order', prompt: e.prompt, promptId: e.promptId, words: mix(e.words, key, (w) => norm(w.join(' ')).replace(/\s/g, '') !== target) };
    }
    case 'match': return { type: 'match', prompt: e.prompt, left: e.pairs.map(([a]) => a), right: mix(e.pairs.map(([, b]) => b), key, (r) => r.some((x, i) => x !== e.pairs[i]![1])) };
    case 'dictation': return { type: 'dictation', prompt: e.prompt, say: e.text };
    case 'speak': return { type: 'speak', prompt: e.prompt, say: e.text, id: e.id };
    case 'translate': return { type: 'translate', prompt: e.prompt, source: e.source };
  }
}

/** Pelajaran untuk peramban: semua latihan tanpa kunci. */
export function clientLesson(l: Lesson) {
  const { practice, independent, quiz, ...rest } = l;
  return {
    ...rest,
    practice: practice.map((e, i) => clientExercise(e, `${l.code}:p:${i}`)),
    independent: independent.map((e, i) => clientExercise(e, `${l.code}:i:${i}`)),
    quiz: quiz.map((e, i) => clientExercise(e, `${l.code}:q:${i}`)),
  };
}
