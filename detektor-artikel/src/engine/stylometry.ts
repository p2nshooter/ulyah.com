/**
 * S1 · Stilometri dan S2 · Jejak salin-tempel — dihitung Worker, gratis, tidak bisa "dibujuk" prompt.
 * Bobot di sini adalah "kalibrasi awal" (ditetapkan tangan); benchmark di Admin menggantinya.
 */
import type { Prepped } from './preprocess.ts';
import { countWords, words } from './preprocess.ts';

export const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
export const logit = (p: number): number => {
  const q = Math.min(0.98, Math.max(0.02, p));
  return Math.log(q / (1 - q));
};
const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

const AI_PHRASES_ID = [
  'di era digital', 'era modern ini', 'di era globalisasi', 'terus berkembang', 'secara keseluruhan', 'penting untuk dicatat', 'perlu dicatat bahwa',
  'memainkan peran penting', 'memegang peranan penting', 'peran yang sangat penting', 'peran krusial', 'kesimpulannya', 'sebagai kesimpulan',
  'mari kita', 'dalam konteks ini', 'berbagai aspek', 'aspek kehidupan', 'menavigasi', 'lanskap', 'seiring dengan perkembangan', 'secara signifikan',
  'dampak yang signifikan', 'berkontribusi pada', 'holistik', 'komprehensif', 'fondasi yang kuat', 'kunci utama', 'tidak dapat dipungkiri',
  'tak dapat dipungkiri', 'dengan kata lain', 'lebih dari sekadar', 'menjadi semakin penting', 'membuka peluang', 'tantangan dan peluang',
];
const AI_PHRASES_EN = [
  'delve', 'tapestry', "it's important to note", 'it is important to note', "in today's", 'fast-paced', 'plays a crucial role', 'plays a pivotal role',
  'pivotal', 'navigate the', 'landscape of', 'a testament to', 'in conclusion', 'not only', 'seamless', 'robust', 'foster', 'leverage', 'multifaceted',
  'realm', 'underscore', 'vibrant', 'intricate', 'embark', 'ever-evolving', 'holistic', 'paramount', 'showcase', 'nuanced', 'in the ever',
];
const TRANS_ID = [
  'selain itu', 'namun', 'oleh karena itu', 'dengan demikian', 'lebih lanjut', 'di sisi lain', 'secara keseluruhan', 'pada akhirnya', 'hal ini',
  'dalam hal ini', 'sebagai kesimpulan', 'kesimpulannya', 'selanjutnya', 'maka dari itu', 'oleh sebab itu', 'tidak hanya itu', 'pertama', 'kedua', 'ketiga',
];
const TRANS_EN = [
  'moreover', 'furthermore', 'additionally', 'however', 'in conclusion', 'overall', 'ultimately', 'in addition', 'consequently', 'notably',
  'importantly', 'firstly', 'secondly', 'finally', 'therefore', 'thus', 'as a result',
];
const FIRST_PERSON = new Set(['saya', 'aku', 'gue', 'gw', 'ku', 'kami', 'i', 'my', 'me', "i'm", "i've", 'mine']);
const INFORMAL = new Set(['gak', 'nggak', 'ga', 'enggak', 'banget', 'sih', 'dong', 'kok', 'deh', 'kayak', 'udah', 'aja', 'lho', 'nih', 'gonna', 'wanna', 'kinda', 'lol', 'yeah', 'stuff']);

function countPhrases(lower: string, list: string[]): number {
  let n = 0;
  for (const p of list) {
    let from = 0;
    for (;;) {
      const at = lower.indexOf(p, from);
      if (at < 0) break;
      n += 1;
      from = at + p.length;
    }
  }
  return n;
}

function cv(xs: number[]): number {
  if (xs.length < 2) return 0.5;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  if (m === 0) return 0.5;
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v) / m;
}

export interface StyleFeatures {
  sentLenCv: number;
  transitionRate: number;
  aiPhrasesPer1k: number;
  firstPersonPer1k: number;
  informalPer1k: number;
  digitsPer1k: number;
  parLenCv: number | null;
}

export function features(sentTexts: string[], parLens: number[]): StyleFeatures {
  const all = sentTexts.join(' ');
  const lower = all.toLowerCase();
  const wc = Math.max(1, countWords(all));
  const ws = words(all);
  const starts = sentTexts.map((s) => s.toLowerCase().replace(/^["“'(]+/, ''));
  const trans = starts.filter((s) => TRANS_ID.some((t) => s.startsWith(t)) || TRANS_EN.some((t) => s.startsWith(t))).length;
  return {
    sentLenCv: cv(sentTexts.map(countWords)),
    transitionRate: sentTexts.length ? trans / sentTexts.length : 0,
    aiPhrasesPer1k: ((countPhrases(lower, AI_PHRASES_ID) + countPhrases(lower, AI_PHRASES_EN)) * 1000) / wc,
    firstPersonPer1k: (ws.filter((w) => FIRST_PERSON.has(w)).length * 1000) / wc,
    informalPer1k: (ws.filter((w) => INFORMAL.has(w)).length * 1000) / wc,
    digitsPer1k: ((all.match(/\d+([.,]\d+)?/g) ?? []).length * 1000) / wc,
    parLenCv: parLens.length >= 3 ? cv(parLens) : null,
  };
}

export function styleLogit(f: StyleFeatures): number {
  const f1 = clamp((0.55 - f.sentLenCv) / 0.2, -1.5, 1.5);
  const f2 = clamp((f.transitionRate - 0.12) / 0.12, -1, 2);
  const f3 = clamp((f.aiPhrasesPer1k - 3) / 3, -1, 2.5);
  const f4 = -clamp(f.firstPersonPer1k / 8, 0, 2);
  const f5 = -clamp(f.informalPer1k / 4, 0, 2);
  const f6 = -clamp(f.digitsPer1k / 15, 0, 1.5);
  const f7 = f.parLenCv === null ? 0 : clamp((0.35 - f.parLenCv) / 0.2, -1, 1);
  return -0.3 + 0.9 * f1 + 0.6 * f2 + 0.8 * f3 + 0.7 * f4 + 0.6 * f5 + 0.4 * f6 + 0.4 * f7;
}

export interface StyleResult {
  doc: number;
  features: StyleFeatures;
  paragraphs: Record<number, number>;
  sentences: Record<number, number>;
}

export function stylometry(pp: Prepped): StyleResult {
  const body = pp.sentences.filter((s) => !s.excluded);
  const bodyPars = pp.paragraphs.filter((p) => p.kind === 'body');
  const f = features(body.map((s) => s.text), bodyPars.map((p) => p.words));
  const docL = styleLogit(f);
  const doc = clamp(sigmoid(docL), 0.03, 0.97);
  const paragraphs: Record<number, number> = {};
  for (const p of bodyPars) {
    const ss = p.sentences.map((i) => pp.sentences[i]!).filter((s) => !s.excluded);
    if (!ss.length) continue;
    const pl = styleLogit(features(ss.map((s) => s.text), []));
    const w = Math.min(1, ss.length / 6);
    paragraphs[p.i] = clamp(sigmoid(w * pl + (1 - w) * docL), 0.03, 0.97);
  }
  const sentences: Record<number, number> = {};
  for (const s of body) {
    const lower = s.text.toLowerCase();
    const ws = words(s.text);
    let adj = 0;
    if (countPhrases(lower, AI_PHRASES_ID) + countPhrases(lower, AI_PHRASES_EN) > 0) adj += 0.6;
    if (ws.some((w) => FIRST_PERSON.has(w) || INFORMAL.has(w))) adj -= 0.8;
    if (/\d/.test(s.text)) adj -= 0.3;
    sentences[s.i] = clamp(sigmoid(logit(paragraphs[s.par] ?? doc) + adj), 0.03, 0.97);
  }
  return { doc, features: f, paragraphs, sentences };
}

/* ── S2 · jejak salin-tempel ─────────────────────────────────────────── */

export interface TraceItem {
  code: string;
  count: number;
  weight: number;
}

export interface TraceResult {
  /** Tambahan logit untuk fusi (0 = tidak ada jejak). */
  boost: number;
  items: TraceItem[];
  sentenceHits: number[];
}

const ASSISTANT = [
  ['tentu! berikut', 3], ['tentu, berikut', 3], ['semoga membantu', 2.5], ['sebagai model bahasa', 3], ['sebagai ai', 2.5], ['saya adalah ai', 3],
  ['as an ai', 3], ['as a language model', 3], ['certainly! here', 3], ['sure! here', 3], ['i hope this helps', 2.5], ['absolutely! here', 3],
  ['berikut adalah', 0.6], ['here is a', 0.5], ["here's a", 0.5],
] as const;

export function traces(raw: string, pp: Prepped): TraceResult {
  const items: TraceItem[] = [];
  const lower = raw.toLowerCase();
  const wc = Math.max(1, pp.words);
  const add = (code: string, count: number, weight: number) => {
    if (count > 0) items.push({ code, count, weight });
  };
  add('markdown_bold', (raw.match(/\*\*[^*\n]{2,80}\*\*/g) ?? []).length, 2);
  add('markdown_heading', (raw.match(/^#{1,6}\s+\S/gm) ?? []).length, 1.5);
  for (const [p, w] of ASSISTANT) add(`assistant:${p}`, countPhrases(lower, [p]), w);
  const dashes = (raw.match(/—/g) ?? []).length;
  if ((dashes * 1000) / wc > 4) add('em_dash_density', dashes, 0.6);
  add('invisible_chars', pp.invisible, 1.2);
  const curly = /[“”‘’]/.test(raw);
  const straight = /"/.test(raw);
  if (curly && straight) add('mixed_quotes', 1, 0.3);
  const bullets = (raw.match(/^\s*([-•*]|\d+\.)\s+\S/gm) ?? []).length;
  if (bullets >= 3) add('bullet_lists', bullets, 0.4);
  const boost = Math.min(3, items.reduce((a, it) => a + it.weight * Math.min(2, it.count > 1 ? 1.3 : 1), 0));
  const sentenceHits = pp.sentences
    .filter((s) => /\*\*[^*]+\*\*/.test(s.text) || ASSISTANT.some(([p, w]) => w >= 2 && s.text.toLowerCase().includes(p)))
    .map((s) => s.i);
  return { boost, items, sentenceHits };
}
