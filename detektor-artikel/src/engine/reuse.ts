/**
 * Hasil tersimpan per paragraf (docs/MASTER-BLUEPRINT.md §26; pemilik, 8 Nov 2026): naskah — seluruhnya atau sebagian —
 * yang pernah diperiksa dengan MESIN YANG SAMA tidak dikirim lagi ke AI. Biaya AI perusahaan untuk bagian itu 0.
 *  - member yang sama (pernah mengunggah paragraf itu dengan mesin itu) membayar `reusePct` % (bawaan 50 %);
 *  - member lain membayar normal, tanpa tanda bahwa naskah pernah diunggah orang lain;
 *  - mesin berbeda/baru (mode, model, effort, versi prompt) = kunci lain = diperiksa ulang dengan biaya normal.
 *
 * Penyimpanan R2 (tanpa teks naskah):
 *  - `x/p/{mesin}/{hash paragraf}`   skor per kalimat/paragraf + bagian token AI (dibuat sekali, penulis pertama menang);
 *  - `x/d/{mesin}/{hash naskah}`     catatan gaya & uji tebak-lanjutan untuk naskah yang identik seluruhnya;
 *  - `x/mh/{uid}/{mesin}/{invTs}~{id}` daftar hash paragraf satu pemeriksaan member (penanda „pernah mengunggah“).
 * Tidak pernah dihapus (pemilik, 8 Nov 2026: „Chache perusahaan jgn di hapus walaupun sudah 90 hari“): isinya bukan teks
 * naskah; mesin baru otomatis memakai kunci lain.
 */
import { invTs, type Store } from '../lib/store.ts';
import { sha256Hex } from '../lib/crypto.ts';
import type { Lang } from '../lib/i18n.ts';
import type { Prepped } from './preprocess.ts';
import type { JudgeSentence } from './fuse.ts';
import type { BillingSettings, EngineSettings } from '../data/settings.ts';
import { FABLE_MODEL, freeModel, lineTokens, type Mode, type Rate } from './pricing.ts';

/** Naikkan bila prompt/skema penilai berubah: hasil lama tidak lagi dihitung „mesin yang sama“. */
export const ENGINE_REV = 'e1';

export type Score = [number, string[]];
/** Bagian pemakaian AI: token masuk, keluar, baca-cache, biaya US$. */
export type Use = [number, number, number, number];

export interface ParaEntry {
  v: 1;
  src: string;
  at: number;
  /** Kata dan status „dikecualikan“ per kalimat — memastikan pemecahan kalimat sama persis sebelum dipakai ulang. */
  w: number[];
  x: boolean[];
  a: (Score | null)[] | null;
  b: Score | null;
  t2: (Score | null)[] | null;
  t3: (Score | null)[] | null;
  d: { a: number | null; b: number | null; t2: number | null; t3: number | null };
  /** `${tahap}|${model}` → bagian pemakaian AI paragraf ini saat diperiksa pertama kali. */
  use: Record<string, Use>;
}

export interface DocEntry {
  v: 1;
  src: string;
  at: number;
  regen: number | null;
  style: Partial<Record<Lang, string>>;
}

export interface OwnList {
  at: number;
  dh: string;
  h: string[];
  rubric: string | null;
  rl: Lang;
}

export interface ReusePlan {
  ek: string;
  /** indeks paragraf isi → hash */
  hashes: Record<number, string>;
  pars: Record<number, { e: ParaEntry; own: boolean }>;
  words: { own: number; other: number; total: number };
  /** Semua paragraf isi tersimpan. */
  full: boolean;
  /** Naskah identik seluruhnya dengan mesin sama (siapa pun pengunggahnya). */
  doc: DocEntry | null;
  /** Pemeriksaan member ini sendiri dengan naskah identik (untuk rubrik). */
  ownSrc: string | null;
}

export const paraKey = (ek: string, h: string) => `x/p/${ek}/${h}.json`;
export const docKey = (ek: string, h: string) => `x/d/${ek}/${h.slice(0, 40)}.json`;
export const ownListKey = (uid: string, ek: string, createdAt: number, checkId: string) => `x/mh/${uid}/${ek}/${invTs(createdAt)}~${checkId}`;

export async function paraHash(text: string): Promise<string> {
  return (await sha256Hex(text.normalize('NFC').replace(/\s+/g, ' ').trim())).slice(0, 40);
}

/** Kunci mesin: mode + model + effort yang benar-benar dipakai + versi mesin. Berbeda satu saja = mesin baru. */
export async function engineKey(s: EngineSettings, mode: Mode, free: boolean, ceiling: 1 | 2 | 3 = 3): Promise<string> {
  const spec = free
    ? { m: 'free', j: freeModel(s), e: 'low' }
    : mode === 'haiku'
      ? { m: mode, j: s.models.t1, e: s.effort.t1 }
      : mode === 'sonnet'
        ? { m: mode, j: s.models.t2, e: s.effort.t2 }
        : mode === 'opus'
          ? { m: mode, j: s.models.t3, e: s.effort.t3 }
          : mode === 'fable'
            ? { m: mode, j: FABLE_MODEL, e: s.effort.t3 }
            : { m: mode, models: s.models, effort: s.effort, ...(mode === 'auto' && ceiling < 3 ? { c: ceiling } : {}) };
  return (await sha256Hex(`${ENGINE_REV}|${JSON.stringify(spec)}`)).slice(0, 20);
}

/** Paragraf isi yang punya kalimat dinilai. */
export function bodyParagraphs(pp: Prepped) {
  return pp.paragraphs.filter((p) => p.kind === 'body' && p.sentences.some((i) => !pp.sentences[i]!.excluded));
}

export function parWords(pp: Prepped, pi: number): number {
  return pp.paragraphs[pi]!.sentences.reduce((a, i) => a + (pp.sentences[i]!.excluded ? 0 : pp.sentences[i]!.words), 0);
}

async function inBatches<T>(xs: T[], n: number, fn: (x: T) => Promise<void>): Promise<void> {
  for (let k = 0; k < xs.length; k += n) await Promise.all(xs.slice(k, k + n).map(fn));
}

/** Mencari hasil tersimpan untuk naskah ini (dipanggil sekali per pemeriksaan, hasilnya disimpan sebagai tahap). */
export async function planReuse(store: Store, uid: string, ek: string, pp: Prepped, docHash: string): Promise<ReusePlan> {
  const hashes: Record<number, string> = {};
  const body = bodyParagraphs(pp);
  await Promise.all(body.map(async (p) => { hashes[p.i] = await paraHash(p.text); }));
  // „Pernah mengunggah“: daftar pemeriksaan member ini dengan mesin yang sama, terbaru dulu.
  const own = new Set<string>();
  let ownSrc: string | null = null;
  const { items } = await store.list(`x/mh/${uid}/${ek}/`, { limit: 200 });
  const lists: { id: string; l: OwnList | null }[] = [];
  await inBatches(items, 32, async (it) => { lists.push({ id: it.id, l: await store.get<OwnList>(it.key) }); });
  lists.sort((x, y) => (x.l?.at ?? 0) > (y.l?.at ?? 0) ? -1 : 1);
  for (const { id, l } of lists) {
    if (!l) continue;
    for (const h of l.h) own.add(h);
    if (!ownSrc && l.dh === docHash) ownSrc = id;
  }
  const pars: ReusePlan['pars'] = {};
  await inBatches(body, 64, async (par) => {
    const e = await store.get<ParaEntry>(paraKey(ek, hashes[par.i]!));
    if (!e || e.v !== 1) return;
    const ss = par.sentences.map((i) => pp.sentences[i]!);
    if (ss.length !== e.w.length || ss.some((s, k) => s.words !== e.w[k] || s.excluded !== e.x[k])) return;
    pars[par.i] = { e, own: own.has(hashes[par.i]!) };
  });
  const words = { own: 0, other: 0, total: 0 };
  for (const p of body) {
    const w = parWords(pp, p.i);
    words.total += w;
    if (pars[p.i]) words[pars[p.i]!.own ? 'own' : 'other'] += w;
  }
  const full = body.length > 0 && body.every((p) => pars[p.i]);
  let doc: DocEntry | null = null;
  if (full) {
    const d = await store.get<DocEntry>(docKey(ek, docHash));
    if (d && d.v === 1) doc = d;
  }
  return { ek, hashes, pars, words, full, doc, ownSrc: full ? ownSrc : null };
}

/* ── penggabungan hasil tersimpan dengan hasil baru ───────────────────── */

/** Skor per kalimat tersimpan (tingkat 1 `a`, 2 `t2`, 3 `t3`) dengan nomor kalimat naskah ini. */
export function cachedSentences(plan: ReusePlan | null, pp: Prepped, field: 'a' | 't2' | 't3'): Record<number, JudgeSentence> {
  const out: Record<number, JudgeSentence> = {};
  if (!plan) return out;
  for (const [pi, { e }] of Object.entries(plan.pars)) {
    const arr = e[field];
    if (!arr) continue;
    pp.paragraphs[Number(pi)]!.sentences.forEach((si, k) => {
      const v = arr[k];
      if (v) out[si] = { i: si, p: v[0], r: v[1] };
    });
  }
  return out;
}

export function cachedParagraphs(plan: ReusePlan | null): Record<number, JudgeSentence> {
  const out: Record<number, JudgeSentence> = {};
  if (!plan) return out;
  for (const [pi, { e }] of Object.entries(plan.pars)) if (e.b) out[Number(pi)] = { i: Number(pi), p: e.b[0], r: e.b[1] };
  return out;
}

/** Nilai dokumen gabungan: rata-rata berbobot kata dari lintasan baru dan lintasan tersimpan. */
export function mergedDoc(plan: ReusePlan | null, pp: Prepped, field: keyof ParaEntry['d'], fresh: number | null, freshWords: number): number | null {
  let num = fresh !== null && freshWords > 0 ? fresh * freshWords : 0;
  let den = fresh !== null && freshWords > 0 ? freshWords : 0;
  if (plan) {
    for (const [pi, { e }] of Object.entries(plan.pars)) {
      const v = e.d[field];
      if (v === null || v === undefined) continue;
      const w = parWords(pp, Number(pi));
      num += v * w;
      den += w;
    }
  }
  if (den > 0) return num / den;
  return fresh;
}

export function hasCached(plan: ReusePlan | null, field: 't2' | 't3'): boolean {
  return Boolean(plan && Object.values(plan.pars).some(({ e }) => e[field]?.some(Boolean)));
}

/* ── harga bagian tersimpan ───────────────────────────────────────────── */

export interface UsageLine { tier: string; model: string; in: number; out: number; cache: number; tokens: number }

/**
 * Baris rincian token untuk bagian tersimpan. Harga normal = token AI tersimpan × tarif terbuka saat ini (rumus yang sama
 * dengan panggilan baru). Bagian milik member sendiri: satu baris „reuse-own“ per model dengan `pct` %; bagian lain: baris
 * per tahap seperti biasa (tidak menyingkap bahwa naskah pernah diunggah orang lain).
 */
export function reuseLines(plan: ReusePlan | null, rates: Record<string, Rate>, b: BillingSettings, pct: number): { lines: UsageLine[]; savedUsd: number } {
  if (!plan) return { lines: [], savedUsd: 0 };
  const other = new Map<string, Use>();
  const own = new Map<string, Use>();
  let savedUsd = 0;
  for (const { e, own: mine } of Object.values(plan.pars)) {
    for (const [k, u] of Object.entries(e.use)) {
      const key = mine ? `reuse-own|${k.split('|')[1]}` : k;
      const m = mine ? own : other;
      const cur = m.get(key) ?? [0, 0, 0, 0];
      m.set(key, [cur[0] + u[0], cur[1] + u[1], cur[2] + u[2], cur[3] + u[3]]);
      savedUsd += u[3];
    }
  }
  const tok = (model: string, u: Use) => {
    const rate = rates[model.replace(/-\d{8}$/, '')];
    return rate ? lineTokens(rate, u[0], u[1], u[2]) : Math.round((u[3] / b.tokenUnitUsd) * 100) / 100;
  };
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const lines: UsageLine[] = [];
  for (const [k, u] of other) {
    const [tier, model] = k.split('|') as [string, string];
    lines.push({ tier, model, in: Math.round(u[0]), out: Math.round(u[1]), cache: Math.round(u[2]), tokens: r2(tok(model, u)) });
  }
  for (const [k, u] of own) {
    const model = k.split('|')[1]!;
    lines.push({ tier: 'reuse-own', model, in: Math.round(u[0]), out: Math.round(u[1]), cache: Math.round(u[2]), tokens: r2((tok(model, u) * Math.min(100, Math.max(0, pct))) / 100) });
  }
  return { lines, savedUsd };
}

/* ── menyimpan hasil pemeriksaan yang selesai ─────────────────────────── */

export interface RawLine { tier: string; model: string; in: number; out: number; cacheRead: number; cost: number }

export interface FreshResult {
  a: Record<number, JudgeSentence>;
  b: Record<number, JudgeSentence>;
  t2: Record<number, JudgeSentence> | null;
  t3: Record<number, JudgeSentence> | null;
  d: ParaEntry['d'];
  /** Kalimat yang benar-benar dikirim ke tingkat 2/3 dalam pemeriksaan ini (bagian baru saja). */
  t2Targets: number[];
  t3Targets: number[];
}

/** Entri baru untuk paragraf yang diperiksa AI dalam pemeriksaan ini; biaya AI dibagi menurut kata yang dikerjakan. */
export function buildEntries(pp: Prepped, plan: ReusePlan | null, hashes: Record<number, string>, res: FreshResult, lines: RawLine[], src: string, now = Date.now()): Record<number, ParaEntry> {
  const fresh = Object.keys(hashes).map(Number).filter((pi) => !plan?.pars[pi]);
  if (!fresh.length) return {};
  const pw = new Map(fresh.map((pi) => [pi, parWords(pp, pi)]));
  const targetWords = (targets: number[]) => {
    const m = new Map<number, number>();
    for (const si of targets) {
      const s = pp.sentences[si];
      if (s && pw.has(s.par)) m.set(s.par, (m.get(s.par) ?? 0) + s.words);
    }
    return m;
  };
  const tw = { t2: targetWords(res.t2Targets), t3: targetWords(res.t3Targets) };
  const use = new Map<number, Record<string, Use>>(fresh.map((pi) => [pi, {}]));
  for (const l of lines) {
    if (l.tier.startsWith('rubric')) continue; // rubrik menilai naskah utuh, bukan per paragraf
    const weights = l.tier === 't2' ? tw.t2 : l.tier === 't3' ? tw.t3 : pw;
    const total = [...weights.values()].reduce((a, b) => a + b, 0);
    if (!(total > 0)) continue;
    const key = `${l.tier}|${l.model.replace(/-\d{8}$/, '')}`;
    for (const [pi, w] of weights) {
      const f = w / total;
      const u = use.get(pi)!;
      const cur = u[key] ?? [0, 0, 0, 0];
      u[key] = [cur[0] + l.in * f, cur[1] + l.out * f, cur[2] + l.cacheRead * f, cur[3] + l.cost * f];
    }
  }
  const pick = (m: Record<number, JudgeSentence> | null, si: number): Score | null => (m && m[si] ? [Math.round(m[si]!.p * 1000) / 1000, m[si]!.r] : null);
  const out: Record<number, ParaEntry> = {};
  for (const pi of fresh) {
    const par = pp.paragraphs[pi]!;
    const ss = par.sentences;
    out[pi] = {
      v: 1,
      src,
      at: now,
      w: ss.map((si) => pp.sentences[si]!.words),
      x: ss.map((si) => pp.sentences[si]!.excluded),
      a: Object.keys(res.a).length ? ss.map((si) => pick(res.a, si)) : null,
      b: res.b[pi] ? [Math.round(res.b[pi]!.p * 1000) / 1000, res.b[pi]!.r] : null,
      t2: res.t2 && ss.some((si) => res.t2![si]) ? ss.map((si) => pick(res.t2, si)) : null,
      t3: res.t3 && ss.some((si) => res.t3![si]) ? ss.map((si) => pick(res.t3, si)) : null,
      d: res.d,
      use: Object.fromEntries(Object.entries(use.get(pi)!).map(([k, u]) => [k, u.map((n, j) => (j === 3 ? Math.round(n * 1e8) / 1e8 : Math.round(n * 10) / 10)) as Use])),
    };
  }
  return out;
}

/** Menulis entri baru, catatan naskah utuh, dan daftar „pernah mengunggah“ milik member. Mengembalikan kunci daftar. */
export async function saveReuse(
  store: Store,
  a: { ek: string; uid: string; checkId: string; createdAt: number; docHash: string; hashes: Record<number, string>; entries: Record<number, ParaEntry>; doc: DocEntry | null; rubric: string | null; reportLang: Lang },
): Promise<string> {
  // Penulis pertama menang: hasil tersimpan tidak pernah ditimpa.
  await inBatches(Object.entries(a.entries), 32, async ([pi, e]) => {
    await store.createOnce(paraKey(a.ek, a.hashes[Number(pi)]!), e);
  });
  if (a.doc) {
    const key = docKey(a.ek, a.docHash);
    await store.cas<DocEntry>(key, (cur) => {
      if (!cur) return a.doc;
      const lang = Object.keys(a.doc!.style)[0] as Lang | undefined;
      if (lang && !cur.style[lang]) return { ...cur, style: { ...cur.style, [lang]: a.doc!.style[lang] } };
      return null;
    }, 'Hasil tersimpan');
  }
  const listKey = ownListKey(a.uid, a.ek, a.createdAt, a.checkId);
  const list: OwnList = { at: a.createdAt, dh: a.docHash, h: [...new Set(Object.values(a.hashes))], rubric: a.rubric, rl: a.reportLang };
  await store.put(listKey, list);
  return listKey;
}
