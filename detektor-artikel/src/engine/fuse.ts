/**
 * Fusi semua sinyal → persen, label, keyakinan (blueprint bagian I). Fungsi murni.
 * Bobot = "kalibrasi awal"; nilai ambang dibaca dari setelan mesin (Admin → Mesin).
 */
import type { Prepped } from './preprocess.ts';
import { logit, sigmoid } from './stylometry.ts';
import type { LabelKey } from '../lib/i18n.ts';

export interface Thresholds {
  aiCls: number;
  humCls: number;
  gate1Lo: number;
  gate1Hi: number;
  greyLo: number;
  greyHi: number;
  t3Lo: number;
  t3Hi: number;
  labelAi: number;
  labelHum: number;
  partlyShare: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  aiCls: 0.8,
  humCls: 0.2,
  gate1Lo: 0.05,
  gate1Hi: 0.95,
  greyLo: 0.2,
  greyHi: 0.8,
  t3Lo: 0.3,
  t3Hi: 0.7,
  labelAi: 0.9,
  labelHum: 0.1,
  partlyShare: 0.2,
};

export interface JudgeSentence {
  i: number;
  p: number;
  r: string[];
}

export interface Signals {
  stylo: { doc: number; paragraphs: Record<number, number>; sentences: Record<number, number> };
  traceBoost: number;
  traceSentences: number[];
  regen: number | null;
  a: { doc: number; sentences: Record<number, JudgeSentence> } | null;
  b: { doc: number; paragraphs: Record<number, JudgeSentence> } | null;
  sonnet: { doc: number | null; sentences: Record<number, JudgeSentence> } | null;
  opus: { doc: number | null; sentences: Record<number, JudgeSentence> } | null;
  /** Pengali bobot hakim A/B sesuai model yang menjalankannya (Haiku 1, Sonnet 1,6, Opus 2,2). */
  judgeWeight?: number;
}

export type Cls = 'ai' | 'mix' | 'hum';

export interface FusedSentence {
  i: number;
  par: number;
  p: number;
  cls: Cls;
  r: string[];
  src: string[];
}

const W = { a: 1.0, b: 0.6, st: 0.35, rg: 0.25, s2: 1.6, s3: 2.2 };

export function fuseSentence(sig: Signals, i: number, par: number): { p: number; src: string[]; r: string[] } {
  let num = 0;
  let den = 0;
  const src: string[] = [];
  const r = new Set<string>();
  const add = (p: number | undefined | null, w: number, name: string) => {
    if (p === undefined || p === null || !Number.isFinite(p)) return;
    num += w * logit(p);
    den += w;
    src.push(name);
  };
  const a = sig.a?.sentences[i];
  const b = sig.b?.paragraphs[par];
  const s2 = sig.sonnet?.sentences[i];
  const s3 = sig.opus?.sentences[i];
  const jw = sig.judgeWeight ?? 1;
  add(a?.p, W.a * jw, 'judgeA');
  add(b?.p, W.b * jw, 'judgeB');
  add(sig.stylo.sentences[i], W.st, 'stylo');
  add(sig.regen, W.rg, 'regen');
  add(s2?.p, W.s2, 'sonnet');
  add(s3?.p, W.s3, 'opus');
  for (const x of [s3, s2, a]) {
    if (x?.r?.length) {
      x.r.forEach((c) => r.add(c));
      break;
    }
  }
  let L = den > 0 ? (num / den) * 1.15 : 0;
  L += sig.traceBoost * 0.5 + (sig.traceSentences.includes(i) ? 1.5 : 0);
  return { p: Math.min(0.99, Math.max(0.01, sigmoid(L))), src, r: [...r].slice(0, 4) };
}

export function classify(p: number, t: Thresholds): Cls {
  return p >= t.aiCls ? 'ai' : p <= t.humCls ? 'hum' : 'mix';
}

export function fuseAll(pp: Prepped, sig: Signals, t: Thresholds): FusedSentence[] {
  return pp.sentences
    .filter((s) => !s.excluded)
    .map((s) => {
      const f = fuseSentence(sig, s.i, s.par);
      return { i: s.i, par: s.par, p: f.p, cls: classify(f.p, t), r: f.r, src: f.src };
    });
}

/** Pembulatan sisa terbesar: tiga persen bulat yang selalu berjumlah 100. */
export function roundTo100(parts: number[]): number[] {
  const total = parts.reduce((a, b) => a + b, 0);
  if (total <= 0) return parts.map((_, k) => (k === parts.length - 1 ? 100 : 0));
  const exact = parts.map((x) => (x / total) * 100);
  const floor = exact.map(Math.floor);
  let rest = 100 - floor.reduce((a, b) => a + b, 0);
  const order = exact.map((x, k) => [x - Math.floor(x), k] as const).sort((x, y) => y[0] - x[0]);
  for (const [, k] of order) {
    if (rest <= 0) break;
    floor[k]! += 1;
    rest -= 1;
  }
  return floor;
}

export interface Composition {
  ai: number;
  mix: number;
  hum: number;
}

export function composition(pp: Prepped, fs: FusedSentence[]): Composition {
  const w = { ai: 0, mix: 0, hum: 0 };
  for (const s of fs) w[s.cls] += pp.sentences[s.i]!.words;
  const [ai, mix, hum] = roundTo100([w.ai, w.mix, w.hum]);
  return { ai: ai!, mix: mix!, hum: hum! };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Confidence {
  level: 'high' | 'medium' | 'low';
  pm: number;
}

/** Bootstrap 200× atas kalimat (benih tetap → hasil sama setiap kali) + ketidaksepakatan model. */
export function confidence(pp: Prepped, fs: FusedSentence[], sig: Signals): Confidence {
  if (!fs.length) return { level: 'low', pm: 50 };
  const rnd = mulberry32(fs.length * 7919 + pp.words);
  const vals: number[] = [];
  for (let k = 0; k < 200; k += 1) {
    let num = 0;
    let den = 0;
    for (let j = 0; j < fs.length; j += 1) {
      const s = fs[Math.floor(rnd() * fs.length)]!;
      const w = pp.sentences[s.i]!.words;
      num += w * s.p;
      den += w;
    }
    vals.push(den ? num / den : 0);
  }
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length);
  let dis = 0;
  let n = 0;
  for (const s of fs) {
    const a = sig.a?.sentences[s.i]?.p;
    const b = sig.b?.paragraphs[s.par]?.p;
    if (a !== undefined && b !== undefined) {
      dis += Math.abs(a - b);
      n += 1;
    }
  }
  const pm = Math.max(1, Math.round(196 * sd + (n ? (dis / n) * 10 : 5)));
  let level: Confidence['level'] = pm <= 5 ? 'high' : pm <= 12 ? 'medium' : 'low';
  if (pp.analyzedWords < 300 && level === 'high') level = 'medium';
  if (pp.analyzedWords < 150) level = 'low';
  return { level, pm };
}

export function docProbability(sig: Signals, comp: Composition): number {
  let num = 0;
  let den = 0;
  const add = (p: number | null | undefined, w: number) => {
    if (p === null || p === undefined || !Number.isFinite(p)) return;
    num += w * logit(p);
    den += w;
  };
  add(sig.a?.doc, 1.0);
  add(sig.b?.doc, 0.8);
  add(sig.stylo.doc, 0.4);
  add(sig.regen, 0.4);
  add(sig.sonnet?.doc, 0.8);
  add(sig.opus?.doc, 1.0);
  add((comp.ai + comp.mix * 0.5) / 100, 1.2);
  const L = (den ? num / den : 0) * 1.1 + sig.traceBoost * 0.6;
  return Math.min(0.99, Math.max(0.01, sigmoid(L)));
}

export function decideLabel(analyzedWords: number, docP: number, comp: Composition, conf: Confidence, t: Thresholds): LabelKey {
  if (analyzedWords < 150) return 'short';
  if (docP >= t.labelAi && comp.ai >= 50) return 'ai';
  if (docP <= t.labelHum && comp.ai < 5 && comp.ai + comp.mix < t.partlyShare * 100) return 'human';
  if (comp.ai + comp.mix >= t.partlyShare * 100 && comp.ai >= 5 && conf.level !== 'low') return 'partly';
  return 'unsure';
}

export interface ParagraphStat {
  i: number;
  words: number;
  p: number;
  cls: Cls;
  reasons: string[];
}

export function paragraphStats(pp: Prepped, fs: FusedSentence[], t: Thresholds): ParagraphStat[] {
  const out: ParagraphStat[] = [];
  for (const par of pp.paragraphs) {
    if (par.kind !== 'body') continue;
    const ss = fs.filter((s) => s.par === par.i);
    if (!ss.length) continue;
    let num = 0;
    let den = 0;
    const reasons = new Map<string, number>();
    for (const s of ss) {
      const w = pp.sentences[s.i]!.words;
      num += w * s.p;
      den += w;
      for (const r of s.r) reasons.set(r, (reasons.get(r) ?? 0) + 1);
    }
    const p = den ? num / den : 0;
    out.push({
      i: par.i,
      words: den,
      p,
      cls: classify(p, t),
      reasons: [...reasons.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k]) => k),
    });
  }
  return out;
}

/** Gerbang 1: bisakah berhenti di Haiku? Bila tidak, kalimat mana yang naik ke Sonnet. */
export function tier2Targets(pp: Prepped, sig: Signals, t: Thresholds, forensic: boolean): number[] {
  const fs = fuseAll(pp, sig, t);
  if (forensic) return fs.map((s) => s.i);
  const targets: number[] = [];
  for (const s of fs) {
    const a = sig.a?.sentences[s.i]?.p;
    const b = sig.b?.paragraphs[s.par]?.p;
    const grey = s.p > t.greyLo && s.p < t.greyHi;
    const opposite = a !== undefined && b !== undefined && ((a >= t.aiCls && b <= t.humCls) || (a <= t.humCls && b >= t.aiCls));
    if (grey || opposite) targets.push(s.i);
  }
  return targets;
}

export function gate1Passes(pp: Prepped, sig: Signals, t: Thresholds): boolean {
  const fs = fuseAll(pp, sig, t);
  const comp = composition(pp, fs);
  const docP = docProbability(sig, comp);
  if (!(docP <= t.gate1Lo || docP >= t.gate1Hi)) return false;
  if (sig.a && sig.b && Math.abs(sig.a.doc - sig.b.doc) > 0.1) return false;
  if (Math.abs(sig.stylo.doc - docP) > 0.35) return false;
  if (pp.analyzedWords < 300) return false;
  let agree = 0;
  let tot = 0;
  for (const s of fs) {
    const a = sig.a?.sentences[s.i]?.p;
    const b = sig.b?.paragraphs[s.par]?.p;
    const w = pp.sentences[s.i]!.words;
    tot += w;
    if (a !== undefined && b !== undefined && classify(a, t) === classify(b, t)) agree += w;
  }
  return tot === 0 || agree / tot >= 0.9;
}

/** Gerbang 2: kalimat yang tetap diperdebatkan setelah Sonnet naik ke Opus (dibatasi). */
export function tier3Targets(pp: Prepped, sig: Signals, t: Thresholds, forensic: boolean, maxN: number): number[] {
  const fs = fuseAll(pp, sig, t);
  if (forensic) return fs.map((s) => s.i);
  const cand = fs
    .filter((s) => {
      const a = sig.a?.sentences[s.i]?.p;
      const s2 = sig.sonnet?.sentences[s.i]?.p;
      const stillGrey = s.p > t.t3Lo && s.p < t.t3Hi;
      const opposite = a !== undefined && s2 !== undefined && Math.abs(a - s2) >= 0.6;
      return stillGrey || opposite;
    })
    .sort((x, y) => Math.abs(x.p - 0.5) - Math.abs(y.p - 0.5));
  return cand.slice(0, maxN).map((s) => s.i).sort((x, y) => x - y);
}
