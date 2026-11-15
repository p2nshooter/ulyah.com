/** Registri bank latihan: paket simulasi tulisan tim + latihan penguatan yang dibangkitkan. */
import type { Course } from '../data/model.ts';
import { COURSE_META } from '../data/model.ts';
import type { PSet } from './types.ts';
import { DE_SETS } from './sets-de.ts';
import { EN_SETS } from './sets-en.ts';
import { JA_SETS } from './sets-ja.ts';
import { DRILLS } from './drills.ts';

export const SETS: PSet[] = [...DE_SETS, ...EN_SETS, ...JA_SETS, ...DRILLS];
const BY_ID = new Map(SETS.map((s) => [s.id, s]));
export const getSet = (id: string): PSet | undefined => BY_ID.get(id);

/** Jenjang latihan per jalur, berurutan (Inggris menambah TOEFL & IELTS). */
export function practiceLevels(course: Course): { id: string; name: string }[] {
  const base = COURSE_META[course].levels.map((l) => ({ id: l.id, name: l.name }));
  return course === 'en' ? [...base, { id: 'toefl', name: 'TOEFL ITP' }, { id: 'ielts', name: 'IELTS Academic' }] : base;
}
export const levelName = (course: Course, level: string): string => practiceLevels(course).find((l) => l.id === level)?.name ?? level.toUpperCase();

export const setsOf = (course: Course, level?: string): PSet[] => SETS.filter((s) => s.course === course && (!level || s.level === level));

/** Paket berikutnya: simulasi dulu, lalu penguatan, di jenjang yang sama; lalu jenjang berikutnya yang punya paket. */
export function nextSet(id: string): PSet | undefined {
  const s = BY_ID.get(id);
  if (!s) return undefined;
  const levels = practiceLevels(s.course).map((l) => l.id);
  const ordered = SETS.filter((x) => x.course === s.course).sort((a, b) => levels.indexOf(a.level) - levels.indexOf(b.level) || (a.kind === b.kind ? 0 : a.kind === 'simulasi' ? -1 : 1));
  const i = ordered.findIndex((x) => x.id === id);
  return ordered[i + 1];
}

export const totalQuestions = (): number => SETS.reduce((n, s) => n + s.questions.length, 0);
