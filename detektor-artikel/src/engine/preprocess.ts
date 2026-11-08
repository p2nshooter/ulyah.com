/**
 * G1 · Pra-proses (tanpa biaya AI): normalisasi, bahasa, paragraf, kalimat, pengecualian.
 * Fungsi murni — dipakai Worker dan tes unit.
 */

export type TextLang = 'id' | 'en' | 'mixed' | 'other';

export interface Sentence {
  i: number;
  par: number;
  text: string;
  words: number;
  /** true = tidak dihitung dalam persen (kutipan panjang, judul, daftar pustaka). */
  excluded: boolean;
}

export interface Paragraph {
  i: number;
  kind: 'body' | 'heading' | 'references';
  text: string;
  words: number;
  sentences: number[];
}

export interface Prepped {
  lang: TextLang;
  paragraphs: Paragraph[];
  sentences: Sentence[];
  words: number;
  analyzedWords: number;
  excludedWords: number;
  invisible: number;
  normalized: string;
}

const INVISIBLE = /[​-‍⁠﻿­‪-‮]/g;
const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

export function countWords(s: string): number {
  return (s.match(WORD) ?? []).length;
}

export function words(s: string): string[] {
  return (s.toLowerCase().match(WORD) ?? []).map((w) => w.replace(/[’']/g, "'"));
}

const ID_FUNC = new Set(
  'yang dan di ke dari ini itu untuk dengan pada adalah dalam tidak akan juga atau karena oleh sebagai bahwa dapat lebih telah sudah ada saya kami kita mereka ia dia secara serta namun tetapi jika maka agar seperti antara bagi para hal tersebut masih sangat bisa harus'.split(' '),
);
const EN_FUNC = new Set(
  'the of and to in is that it for on with as was are be by this from at or an not have has but which they their were been can will would there what all if its more one about into than also these when who'.split(' '),
);

export function detectLang(text: string): TextLang {
  const ws = words(text);
  if (ws.length === 0) return 'other';
  let id = 0;
  let en = 0;
  for (const w of ws) {
    if (ID_FUNC.has(w)) id += 1;
    if (EN_FUNC.has(w)) en += 1;
  }
  if ((id + en) / ws.length < 0.08) return 'other';
  if (id >= 2 * en) return 'id';
  if (en >= 2 * id) return 'en';
  return 'mixed';
}

const ABBREV = new Set(
  [
    'dll', 'dsb', 'dst', 'yth', 'no', 'hlm', 'dr', 'drs', 'dra', 'ir', 'prof', 's.pd', 'm.pd', 's.h', 'm.h', 's.e', 's.kom', 'm.si', 's.si', 'm.kom',
    'ph.d', 'tbk', 'pt', 'cv', 'jl', 'kab', 'kec', 'kel', 'bpk', 'sdr', 'sdri', 'h', 'hj', 'kh', 'st', 'vs', 'etc', 'e.g', 'i.e', 'mr', 'mrs', 'ms',
    'fig', 'vol', 'pp', 'ed', 'eds', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'agu', 'aug', 'sep', 'okt', 'oct', 'nov', 'des', 'dec', 'u.s', 'a.m', 'p.m',
    'inc', 'ltd', 'co', 'tel', 'telp', 'hal', 'ttd', 'a.n', 'u.p', 'dkk', 'al',
  ].map((s) => s.toLowerCase()),
);

/** Pecah satu paragraf menjadi kalimat; paham singkatan Indonesia dan Inggris. */
export function splitSentences(par: string): string[] {
  const tokens = par.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur: string[] = [];
  for (let k = 0; k < tokens.length; k += 1) {
    const tok = tokens[k]!;
    cur.push(tok);
    const next = tokens[k + 1];
    const stripped = tok.replace(/["”’')\]]+$/, '');
    if (!/[.!?…]$/.test(stripped)) continue;
    if (!next) break;
    const base = stripped.replace(/[.!?…]+$/, '').replace(/^["“‘'(\[]+/, '').toLowerCase();
    if (stripped.endsWith('.') && (ABBREV.has(base) || /^[a-z]$/i.test(base) || /^\d+$/.test(base) || /\.[a-z]$/i.test(base))) continue;
    if (!/^["“‘'(\[]?[\p{Lu}\p{N}]/u.test(next)) continue;
    out.push(cur.join(' '));
    cur = [];
  }
  if (cur.length) out.push(cur.join(' '));
  return out;
}

const REF_HEAD = /^(daftar\s+pustaka|daftar\s+rujukan|referensi|rujukan|references|bibliography|works\s+cited|sumber\s+bacaan)\s*:?\s*$/i;

function isHeading(p: string): boolean {
  const w = countWords(p);
  return w > 0 && w <= 12 && !/[.!?…:;,"”]$/.test(p.trim()) && !/\n/.test(p);
}

export function preprocess(raw: string): Prepped {
  let text = raw.normalize('NFC').replace(/\r\n?/g, '\n');
  const invisible = (text.match(INVISIBLE) ?? []).length;
  text = text.replace(INVISIBLE, '').replace(/[   ]/g, ' ').replace(/[ \t]+/g, ' ');

  // Naskah tidak boleh membuka atau menutup blok prompt sendiri (<naskah>, <rubrik>, <target>): tanda „<“ di depan nama
  // tag itu diganti „‹“, jadi teks member tetap utuh terbaca tetapi tidak pernah keluar dari blok data (pemilik, 7 Nov 2026:
  // „Perketat logika engine agar tidak bocor dan tidak melebar kemana2“).
  text = text.replace(/<(\s*\/?\s*)(naskah|rubrik|target|konteks)\b/gi, '‹$1$2');

  let blocks = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (blocks.length === 1 && (blocks[0]!.match(/\n/g) ?? []).length >= 2) {
    blocks = blocks[0]!.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  const paragraphs: Paragraph[] = [];
  const sentences: Sentence[] = [];
  let inRefs = false;
  for (const block of blocks) {
    const flat = block.replace(/\s*\n\s*/g, ' ').trim();
    const pi = paragraphs.length;
    if (REF_HEAD.test(flat) || REF_HEAD.test(block.split('\n')[0]!.trim())) inRefs = true;
    const kind: Paragraph['kind'] = inRefs ? 'references' : isHeading(flat) ? 'heading' : 'body';
    const parts = kind === 'body' ? splitSentences(flat) : [flat];
    const idx: number[] = [];
    for (const s of parts) {
      const w = countWords(s);
      if (w === 0) continue;
      const quoted = /^["“].*["”][.!?]?$/.test(s) && w > 20;
      idx.push(sentences.length);
      sentences.push({ i: sentences.length, par: pi, text: s, words: w, excluded: kind !== 'body' || quoted });
    }
    paragraphs.push({ i: pi, kind, text: flat, words: countWords(flat), sentences: idx });
  }

  const total = sentences.reduce((a, s) => a + s.words, 0);
  const analyzed = sentences.filter((s) => !s.excluded).reduce((a, s) => a + s.words, 0);
  const bodyText = sentences.filter((s) => !s.excluded).map((s) => s.text).join(' ');
  return {
    lang: detectLang(bodyText || text),
    paragraphs,
    sentences,
    words: total,
    analyzedWords: analyzed,
    excludedWords: total - analyzed,
    invisible,
    normalized: text.trim(),
  };
}
