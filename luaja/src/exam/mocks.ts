/**
 * Perakit simulasi ujian penuh: setiap simulasi = format resmi (specs.ts) dengan jumlah soal per bagian PERSIS, diisi dari
 * bank soal LUAJA + soal kosakata yang dibangkitkan dari data terbuka + soal dengar dari templat. Deterministik per nomor
 * simulasi (kunci sama di server setiap saat), soal tidak berulang di dalam satu simulasi.
 */
import { EXAMS, getExam, type ExamSpec, type PartSpec } from './specs.ts';
import type { MItem, Mock, MockItem, MockResult, MockSection } from './types.ts';
import VOCAB from './gen/jlpt-vocab.json';
import * as N5 from './banks/jlpt-n5.ts';

type Pool = { items?: MItem[]; passages?: { passage: string; items: MItem[] }[]; gen?: (r: () => number, i: number) => MItem };

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const seedOf = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
/** Ambil n butir mulai dari offset (berputar) — simulasi berikutnya memakai butir berikutnya dari bank. */
const take = <T,>(arr: T[], start: number, n: number): T[] => Array.from({ length: Math.min(n, arr.length) }, (_, i) => arr[(start + i) % arr.length]!);

const V = VOCAB as unknown as Record<string, Record<string, MItem[]>>;

/** Bank per ujian & bagian. Bagian tanpa bank → ujian itu belum diterbitkan sebagai simulasi penuh. */
const BANKS: Record<string, Record<string, Pool>> = {
  'jlpt-n5': {
    kanjiyomi: { items: V.n5!.kanjiyomi }, hyoki: { items: V.n5!.hyoki }, bunmyaku: { items: V.n5!.bunmyaku }, iikae: { items: N5.N5_IIKAE },
    bun1: { items: N5.N5_BUN1 }, bun2: { items: N5.N5_BUN2 }, bunsho: { passages: N5.N5_BUNSHO },
    tanbun: { passages: N5.N5_TANBUN }, chubun: { passages: N5.N5_CHUBUN }, joho: { passages: N5.N5_JOHO },
    kadai: { gen: N5.n5Kadai }, point: { gen: N5.n5Point }, hatsuwa: { items: N5.N5_HATSUWA }, sokuji: { items: N5.N5_SOKUJI },
  },
};

/** Berapa simulasi diterbitkan per ujian (dibatasi agar bank soal tulisan tangan tidak berulang terlalu sering). */
export const MOCK_COUNT: Record<string, number> = { 'jlpt-n5': 20 };

export const readyExams = (): ExamSpec[] => EXAMS.filter((e) => MOCK_COUNT[e.id] && e.sections.every((s) => s.parts.every((p) => BANKS[e.id]?.[p.id])));

function fillPart(examId: string, p: PartSpec, n: number, passages: Record<string, string>, salt: number): MockItem[] {
  const pool = BANKS[examId]![p.id]!;
  const out: MItem[] = [];
  if (pool.gen) {
    const r = rng(seedOf(`${examId}:${p.id}:${n}`));
    const seen = new Set<string>();
    for (let i = 0; i < p.items; i++) {
      // Soal templat tidak boleh kembar dalam satu simulasi: ulangi undian bila sama.
      let x = pool.gen(r, i + n), tries = 0;
      while (seen.has(JSON.stringify(x.audio ?? x.stem)) && tries++ < 20) x = pool.gen(r, i + n);
      seen.add(JSON.stringify(x.audio ?? x.stem));
      out.push(x);
    }
  } else if (pool.items) {
    // Bagian yang memakai kata yang sama (漢字読み & 表記) digeser agar satu simulasi tidak menanyakan kata yang sama dua kali.
    out.push(...take(pool.items, (n - 1) * p.items + salt, p.items));
  } else if (pool.passages) {
    const list = pool.passages;
    let k = (n - 1) * Math.max(1, Math.round(p.items / Math.max(1, list[0]!.items.length)));
    while (out.length < p.items) {
      const ps = list[k % list.length]!;
      const key = `${examId}-${p.id}-${k % list.length}`;
      passages[key] = ps.passage;
      for (const it of ps.items) if (out.length < p.items) out.push({ ...it, passage: key });
      k++;
    }
  }
  return out.map((it, i) => ({ ...it, id: `${p.id}-${i + 1}`, part: p.id }));
}

const CACHE = new Map<string, Mock>();
export function getMock(id: string): Mock | undefined {
  if (CACHE.has(id)) return CACHE.get(id);
  const m = /^(.+)-s(\d+)$/.exec(id);
  if (!m) return undefined;
  const exam = getExam(m[1]!), n = Number(m[2]);
  if (!exam || !MOCK_COUNT[exam.id] || n < 1 || n > MOCK_COUNT[exam.id]! || !readyExams().includes(exam)) return undefined;
  const passages: Record<string, string> = {};
  const sections: MockSection[] = exam.sections.map((s) => ({
    id: s.id, name: s.name, minutes: s.minutes,
    parts: s.parts.map((p) => ({ id: p.id, name: p.name, about: p.about, plays: p.plays, items: fillPart(exam.id, p, n, passages, p.id === 'hyoki' ? 79 : 0) })),
  }));
  const mock: Mock = { id, exam: exam.id, n, title: `${exam.name} · Simulasi ${n}`, free: n === 1, sections, passages };
  CACHE.set(id, mock);
  return mock;
}
export const mocksOf = (examId: string): string[] => Array.from({ length: MOCK_COUNT[examId] ?? 0 }, (_, i) => `${examId}-s${i + 1}`);

/** Versi untuk peramban: tanpa kunci & pembahasan; pilihan yang dibacakan disembunyikan teksnya. */
export function publicMock(m: Mock) {
  return {
    id: m.id, exam: m.exam, title: m.title, passages: m.passages,
    sections: m.sections.map((s) => ({ id: s.id, name: s.name, minutes: s.minutes, parts: s.parts.map((p) => ({ id: p.id, name: p.name, about: p.about, plays: p.plays ?? null, items: p.items.map((it) => ({
      id: it.id, stem: it.stem, passage: it.passage ?? null, audio: it.audio ?? null,
      options: it.audioOptions ? it.options.map((_, i) => String(i + 1)) : it.options, spoken: it.audioOptions ? it.options : null,
    })) })) })),
  };
}

/** Penilaian sesuai aturan resmi ujian (JLPT: skor kelompok dari proporsi benar, lulus = total ≥ batas DAN setiap kelompok ≥ minimum). */
export function gradeMock(m: Mock, answers: Record<string, unknown>): MockResult {
  const exam = getExam(m.exam)!;
  const all = m.sections.flatMap((s) => s.parts.flatMap((p) => p.items));
  const items = all.map((it) => {
    const v = Number(answers[it.id]);
    const chosen = Number.isInteger(v) && v >= 0 && v < it.options.length ? v : -1;
    return { id: it.id, chosen, answer: it.answer, ok: chosen === it.answer, why: it.why, options: it.audioOptions ? it.options : undefined };
  });
  const okOf = new Map(items.map((x) => [x.id, x.ok]));
  const parts = m.sections.flatMap((s) => s.parts.map((p) => ({ id: p.id, name: p.name, correct: p.items.filter((it) => okOf.get(it.id)).length, items: p.items.length })));
  const groups = exam.groups.map((g) => {
    const ps = parts.filter((p) => g.parts.includes(p.id));
    const correct = ps.reduce((n, p) => n + p.correct, 0), count = ps.reduce((n, p) => n + p.items, 0);
    const score = count ? Math.round((correct / count) * g.max) : 0;
    return { id: g.id, name: g.name, score, max: g.max, min: g.min, ok: g.min === undefined || score >= g.min, correct, items: count };
  });
  const total = groups.reduce((n, g) => n + g.score, 0);
  return {
    mock: m.id, total, max: exam.total.max, passMark: exam.total.pass, pass: total >= exam.total.pass && groups.every((g) => g.ok),
    groups, parts, items, answered: items.filter((x) => x.chosen >= 0).length, count: items.length,
  };
}

/** Pemeriksaan mutu (uji unit): jumlah soal per bagian = spesifikasi, id unik, kunci dalam rentang, pilihan unik. */
export function validateMock(m: Mock): string[] {
  const exam = getExam(m.exam)!, errs: string[] = [];
  const ids = new Set<string>();
  exam.sections.forEach((s, si) => s.parts.forEach((p, pi) => {
    const mp = m.sections[si]!.parts[pi]!;
    if (mp.items.length !== p.items) errs.push(`${m.id}/${p.id}: ${mp.items.length} ≠ ${p.items}`);
    const stems = new Set<string>();
    for (const it of mp.items) {
      if (ids.has(`${it.id}`)) errs.push(`${m.id}: id ganda ${it.id}`);
      ids.add(it.id);
      if (it.answer < 0 || it.answer >= it.options.length) errs.push(`${m.id}/${it.id}: kunci di luar rentang`);
      if (new Set(it.options).size !== it.options.length) errs.push(`${m.id}/${it.id}: pilihan kembar ${it.options.join('|')}`);
      if (!it.why.trim()) errs.push(`${m.id}/${it.id}: pembahasan kosong`);
      const k = `${it.stem}|${it.passage ?? ''}|${(it.audio ?? []).map((l) => l.t).join('')}`;
      if (stems.has(k)) errs.push(`${m.id}/${it.id}: soal kembar dalam satu bagian`);
      stems.add(k);
    }
  }));
  return errs;
}
