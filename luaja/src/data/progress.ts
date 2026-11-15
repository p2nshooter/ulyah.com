/**
 * Progres belajar dan riwayat latihan member (R2). Progres = satu dokumen per member (ditulis hanya saat kuis dikumpulkan);
 * percobaan latihan = satu dokumen per percobaan + indeks per member (tanpa kunci panas).
 */
import type { Store } from '../lib/store.ts';
import { invTs } from '../lib/store.ts';
import { newId } from '../lib/crypto.ts';
import type { Graded } from '../practice/types.ts';

export interface Progress {
  lessons: Record<string, { best: number; passed: boolean; at: number; tries: number }>;
  last?: string;
}
export const progressKey = (uid: string) => `c/progress/${uid}.json`;
export const getProgress = async (store: Store, uid: string): Promise<Progress> => (await store.get<Progress>(progressKey(uid))) ?? { lessons: {} };

export async function recordQuiz(store: Store, uid: string, code: string, pct: number): Promise<Progress> {
  const r = await store.cas<Progress>(progressKey(uid), (cur) => {
    const p: Progress = cur ?? { lessons: {} };
    const prev = p.lessons[code];
    p.lessons[code] = { best: Math.max(prev?.best ?? 0, pct), passed: Boolean(prev?.passed) || pct >= 0.8, at: Date.now(), tries: (prev?.tries ?? 0) + 1 };
    p.last = code;
    return p;
  }, 'Progres');
  return r ?? { lessons: {} };
}

export interface Attempt {
  id: string;
  uid: string;
  setId: string;
  at: number;
  correct: number;
  total: number;
  pct: number;
  prediction: string;
  sections: Graded['sections'];
  answers: Record<string, number>;
}
export const attemptKey = (id: string) => `c/attempts/${id}.json`;

export async function saveAttempt(store: Store, uid: string, g: Graded, answers: Record<string, number>): Promise<Attempt> {
  const a: Attempt = { id: newId('att'), uid, setId: g.setId, at: Date.now(), correct: g.correct, total: g.total, pct: g.pct, prediction: g.prediction.score, sections: g.sections, answers };
  await store.put(attemptKey(a.id), a);
  await store.createOnce(`i/att/${uid}/${invTs(a.at)}~${a.id}`, {}, { set: a.setId, pct: Math.round(a.pct * 100), score: a.prediction });
  return a;
}

export async function listAttempts(store: Store, uid: string, limit = 50): Promise<{ id: string; set: string; pct: number; score: string; at: number }[]> {
  const { items } = await store.list<{ set: string; pct: number; score: string }>(`i/att/${uid}/`, { limit });
  return items.map((i) => ({ id: i.id, set: i.meta?.set ?? '', pct: Number(i.meta?.pct ?? 0), score: String(i.meta?.score ?? ''), at: i.uploaded.getTime() }));
}
