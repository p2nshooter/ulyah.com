/** S6 · Kemiripan internal: MinHash atas shingle 5 kata (gratis, di Worker). S3 · overlap uji regenerasi. */
import { words } from './preprocess.ts';

const PERM = 64;
const PRIME = 4294967311; // > 2^32
const SEEDS: [number, number][] = Array.from({ length: PERM }, (_, i) => [
  ((i + 1) * 2654435761) % 4294967291 || 1,
  ((i + 7) * 40503 + 2166136261) % 4294967291,
]);

function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulmod(a: number, b: number, m: number): number {
  // (a*b) mod m tanpa kehilangan presisi (a, b < 2^32)
  return Number((BigInt(a) * BigInt(b)) % BigInt(m));
}

export function shingles(text: string, n = 5): Set<number> {
  const ws = words(text);
  const out = new Set<number>();
  for (let i = 0; i + n <= ws.length; i += 1) out.add(fnv1a(ws.slice(i, i + n).join(' ')));
  return out;
}

export function minhash(text: string): number[] {
  const sh = shingles(text);
  const sig = new Array<number>(PERM).fill(Number.MAX_SAFE_INTEGER);
  for (const x of sh) {
    for (let k = 0; k < PERM; k += 1) {
      const [a, b] = SEEDS[k]!;
      const v = (mulmod(a, x, PRIME) + b) % PRIME;
      if (v < sig[k]!) sig[k] = v;
    }
  }
  return sig;
}

export function jaccardEstimate(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let same = 0;
  for (let k = 0; k < a.length; k += 1) if (a[k] === b[k] && a[k] !== Number.MAX_SAFE_INTEGER) same += 1;
  return same / a.length;
}

function ngrams(ws: string[], n: number): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i + n <= ws.length; i += 1) out.add(ws.slice(i, i + n).join(' '));
  return out;
}

/** Porsi trigram lanjutan asli yang juga muncul di lanjutan buatan model. */
export function regenOverlap(generated: string, real: string): number {
  const r = ngrams(words(real), 3);
  if (r.size === 0) return 0;
  const g = ngrams(words(generated), 3);
  let hit = 0;
  for (const x of r) if (g.has(x)) hit += 1;
  return hit / r.size;
}

/** Peluang AI dari rata-rata overlap (kalibrasi awal: manusia ± 0,01–0,03, AI sama-model ± 0,05+). */
export function regenProbability(overlaps: number[]): number | null {
  if (!overlaps.length) return null;
  const m = overlaps.reduce((a, b) => a + b, 0) / overlaps.length;
  const p = 1 / (1 + Math.exp(-(m - 0.045) / 0.015));
  return Math.min(0.95, Math.max(0.05, p));
}
