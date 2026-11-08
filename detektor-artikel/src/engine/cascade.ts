/**
 * Pengendali kaskade (blueprint H). Satu panggilan advance() = tepat satu tahap, di bawah sewa
 * (lease) 150 detik yang diambil lewat compare-and-swap, jadi panggilan ganda dari peramban dan
 * cron tidak pernah memanggil Claude dua kali. Setiap keluaran tahap ditulis create-once.
 */
import type { Env } from '../env.ts';
import { Store, invTs } from '../lib/store.ts';
import { seal, unseal, sha256Hex, newId, verifyCode, type Sealed } from '../lib/crypto.ts';
import type { Lang, LabelKey } from '../lib/i18n.ts';
import { REASON_KEYS } from '../lib/i18n.ts';
import { preprocess, type Prepped } from './preprocess.ts';
import { stylometry, traces, type StyleResult, type TraceResult, type TraceItem } from './stylometry.ts';
import { PURGE_DAYS } from '../data/policy.ts';
import { minhash, jaccardEstimate, regenOverlap, regenProbability } from './similarity.ts';
import {
  composition, confidence, decideLabel, docProbability, fuseAll, gate1Passes, paragraphStats, tier2Targets, tier3Targets,
  type Composition, type Confidence, type JudgeSentence, type ParagraphStat, type Signals, type Cls,
} from './fuse.ts';
import {
  callModel, context, JUDGE_SYSTEM, PARAGRAPH_SCHEMA, REGEN_SYSTEM, rubricSchema, rubricSystem, SENTENCE_SCHEMA, StageError, type CallCtx,
} from './claude.ts';
import { getEngine, getBilling, addSpend, addFreeSpend, type EngineSettings } from '../data/settings.ts';
import { releaseFreePages, trimFreePages } from '../data/free.ts';
import type { Purpose } from '../lib/purpose.ts';
import { getControls } from '../data/controls.ts';
import { applyRouter } from './router.ts';
import { rateCard, lineTokens, tokenCostIdr, minRevenueMultiple, freeModel, FABLE_MODEL, type Rate, type Mode } from './pricing.ts';
import { audit } from '../data/audit.ts';
import { aspectValue, categoryOf, getRubric, languageBand, ruleErrors, type LangError, type Rubric } from './rubrics.ts';
import { refund, type Reservation } from '../data/wallet.ts';
import { bump } from '../lib/ratelimit.ts';
import { getUser } from '../data/users.ts';
import { addStats } from '../data/stats.ts';
import {
  planReuse, engineKey, cachedSentences, cachedParagraphs, mergedDoc, hasCached, reuseLines, buildEntries, saveReuse, parWords, bodyParagraphs, paraHash,
  type ReusePlan, type RawLine,
} from './reuse.ts';

export type Stage = 'prep' | 't1' | 't2' | 't3' | 'fuse' | 'rubric2' | 'done' | 'failed';
export const STAGE_ORDER: Stage[] = ['prep', 't1', 't2', 't3', 'fuse', 'rubric2', 'done'];

export interface CheckDoc {
  id: string;
  uid: string;
  batchId?: string;
  bench?: { set: string; n: number; label: string; run: string };
  /**
   * Cek Gratis (docs/MASTER-BLUEPRINT.md §20): halaman normal yang dipakai dari kuota periode `periodKey`; `partialOf` =
   * jumlah halaman naskah aslinya bila hanya halaman awal yang diperiksa.
   */
  free?: { pages: number; periodKey: string; partialOf?: number };
  createdAt: number;
  updatedAt: number;
  title: string;
  author: string;
  genre: string;
  level: string;
  reportLang: Lang;
  rubricId: string | null;
  mode: Mode;
  /** Keperluan laporan (pemilik, 8 Nov 2026): umum, pendidikan, lomba, media, organisasi. */
  purpose?: Purpose;
  stage: Stage;
  attempts: number;
  lease: number;
  error?: { code: string; msg: string };
  lang?: string;
  words?: number;
  analyzedWords?: number;
  /** Token yang dipesan di muka (perkiraan biaya maksimum). */
  reserved: number;
  reserve?: Reservation | { batch: true } | { none: true };
  /** Harga token pemeriksaan ini (biaya nyata × markup, dibatasi pesanan). */
  tokens?: number;
  /** Token yang benar-benar dipotong dari dompet member. */
  charged?: number;
  t2n?: number;
  t3n?: number;
  skipped?: string[];
  cost: number;
  reportId?: string;
  /** Tanpa hasil tersimpan (uji mesin, „Ajukan tinjauan“): selalu dinilai AI dari awal. */
  noReuse?: boolean;
  /** Hasil tersimpan (MASTER-BLUEPRINT §26): kata milik sendiri / member lain yang tidak dikirim ke AI, US$ yang dihemat. */
  reuse?: { own: number; other: number; savedUsd: number; pct: number };
  /** Kunci hasil tersimpan pemeriksaan ini (mesin + daftar „pernah mengunggah“ member). */
  rx?: { ek: string; list: string };
}

export const checkKey = (id: string) => `c/checks/${id}.json`;
const subKey = (id: string, name: string) => `c/checks/${id}/${name}.json`;
export const textKey = (id: string) => `c/texts/${id}.json`;

export interface TextDoc {
  raw: string;
}

/* ── laporan ─────────────────────────────────────────────────────────── */

export interface RubricAspectResult {
  key: string;
  level: number;
  value: number;
  weight: number;
}

export interface ReportSummary {
  id: string;
  checkId: string;
  uid: string;
  batchId?: string;
  /** Laporan Cek Gratis: bertanda air, tanpa JSON bertanda tangan; `partialOf` bila naskah hanya diperiksa sebagian. */
  free?: { pages: number; partialOf?: number };
  createdAt: number;
  title: string;
  author: string;
  genre: string;
  level: string;
  lang: string;
  reportLang: Lang;
  mode: Mode;
  purpose?: Purpose;
  words: number;
  analyzedWords: number;
  excludedWords: number;
  hash: string;
  comp: Composition;
  docP: number;
  conf: Confidence;
  label: LabelKey;
  signals: { stylo: number; regen: number | null; haikuA: number | null; haikuB: number | null; sonnet: number | null; opus: number | null; traces: TraceItem[] };
  path: { t2Pct: number; t3Pct: number; tiers: string[] };
  paragraphs: ParagraphStat[];
  flags: { injection: boolean; paraphrasePct: number; invisible: number };
  similarity: { max: number; withTitle?: string; withId?: string } | null;
  rubric: { id: string; total: number; category: string; aspects: RubricAspectResult[]; langErrors: number; per1k: number; verifiedBy: string[] } | null;
  verifyCode: string;
  engine: { version: string; calibration: string; prompt: string };
  cost: number;
  /** Token yang ditagihkan untuk laporan ini. */
  tokens: number;
  /** Rincian pemakaian token AI → token platform (transparansi untuk klien). */
  usage?: {
    lines: { tier: string; model: string; in: number; out: number; cache: number; tokens: number }[];
    rates: Record<string, Rate>;
    exact: number;
    reserved: number;
    charged: number;
    refunded: number;
  };
  /** Berapa kali teks yang sama persis pernah diperiksa akun ini sebelumnya (anti "memancing" hasil). */
  samePrior: number;
  /** Bagian naskah yang pernah diperiksa member ini sendiri dengan mesin yang sama (ditagih `pct` %). */
  reuseOwn?: { words: number; pct: number };
  purged?: boolean;
  /** Kapan naskah & rincian kalimatnya dihapus otomatis (riwayat dan angka tetap — MASTER-BLUEPRINT §27). */
  purgedAt?: number;
  revoked?: boolean;
  enc?: Sealed;
}

export interface ReportDetail {
  paragraphs: { i: number; kind: string; text: string }[];
  sentences: { i: number; par: number; text: string; p: number | null; cls: Cls | null; r: string[]; excluded: boolean }[];
  rubric?: {
    aspects: { key: string; level: number; reason: string; evidence: string; evidenceOk: boolean; tip: string; by: string }[];
    errors: LangError[];
  };
  styleNote?: string;
}

export const reportKey = (id: string) => `c/reports/${id}.json`;

/* ── keluaran tahap ──────────────────────────────────────────────────── */

interface PrepOut {
  pp: Prepped;
  stylo: StyleResult;
  traces: TraceResult;
  hash: string;
  similarity: ReportSummary['similarity'];
}

interface JudgeAOut {
  doc: number;
  sentences: Record<number, JudgeSentence>;
  injection: boolean;
  refused?: boolean;
}

interface JudgeBOut {
  doc: number;
  paragraphs: Record<number, JudgeSentence>;
  styleNote: string;
  injection: boolean;
  refused?: boolean;
}

interface RubricRaw {
  aspects: { key: string; level: number; reason: string; evidence: string; tip: string; sure: boolean }[];
  errors: LangError[];
}

interface EscalationOut {
  doc: number | null;
  sentences: Record<number, JudgeSentence>;
  targets: number[];
}

const clamp01 = (x: unknown): number => {
  const n = typeof x === 'number' && Number.isFinite(x) ? x : 0.5;
  return Math.min(1, Math.max(0, n));
};
const cleanReasons = (r: unknown): string[] => (Array.isArray(r) ? r.filter((x): x is string => typeof x === 'string' && REASON_KEYS.includes(x)).slice(0, 4) : []);

function master(env: Env): string {
  if (!env.MASTER_KEY) throw new StageError('no_key', 'MASTER_KEY belum dipasang di Worker.');
  return env.MASTER_KEY;
}

async function sub<T>(store: Store, env: Env, id: string, name: string, produce: () => Promise<T>): Promise<T> {
  const k = subKey(id, name);
  const have = await store.get<Sealed>(k);
  if (have) return unseal<T>(master(env), have);
  const value = await produce();
  const won = await store.createOnce(k, await seal(master(env), value));
  if (won) return value;
  const again = await store.get<Sealed>(k);
  return again ? unseal<T>(master(env), again) : value;
}

async function readSub<T>(store: Store, env: Env, id: string, name: string): Promise<T | null> {
  const have = await store.get<Sealed>(subKey(id, name));
  return have ? unseal<T>(master(env), have) : null;
}

/* ── pembantu teks prompt ─────────────────────────────────────────────── */

const body = (pp: Prepped) => pp.sentences.filter((s) => !s.excluded);
const numberedSentences = (pp: Prepped, idx?: number[]) =>
  (idx ? idx.map((i) => pp.sentences[i]!) : body(pp)).map((s) => `[${s.i}] ${s.text}`).join('\n');
const numberedParagraphs = (pp: Prepped, only?: Set<number>) =>
  pp.paragraphs.filter((p) => p.kind === 'body' && (!only || only.has(p.i))).map((p) => `¶${p.i} ${p.text}`).join('\n\n');
const plainText = (pp: Prepped) => pp.paragraphs.filter((p) => p.kind !== 'references').map((p) => p.text).join('\n\n');

function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}

/* ── tahap ───────────────────────────────────────────────────────────── */

async function stagePrep(env: Env, store: Store, doc: CheckDoc): Promise<Partial<CheckDoc>> {
  const out = await sub<PrepOut>(store, env, doc.id, 'prep', async () => {
    const sealed = await store.get<Sealed>(textKey(doc.id));
    if (!sealed) throw new StageError('empty', 'Teks tidak ditemukan (mungkin sudah dihapus).');
    const { raw } = await unseal<TextDoc>(master(env), sealed);
    const pp = preprocess(raw);
    if (pp.analyzedWords === 0) throw new StageError('empty', 'Tidak ada kalimat yang bisa dianalisis.');
    if (pp.lang === 'other') throw new StageError('lang_unsupported', 'Bahasa naskah belum didukung (hanya Indonesia dan English).');
    let similarity: ReportSummary['similarity'] = null;
    if (doc.batchId) {
      const sig = minhash(body(pp).map((s) => s.text).join(' '));
      await store.put(`c/fp/${doc.batchId}/${doc.id}.json`, { sig, title: doc.title });
      const { items } = await store.list(`c/fp/${doc.batchId}/`, { limit: 1000 });
      let best = { max: 0, withTitle: undefined as string | undefined, withId: undefined as string | undefined };
      for (const it of items) {
        if (it.id === doc.id) continue;
        const other = await store.get<{ sig: number[]; title: string }>(it.key);
        if (!other) continue;
        const j = jaccardEstimate(sig, other.sig);
        if (j > best.max) best = { max: j, withTitle: other.title, withId: it.id };
      }
      similarity = { max: Math.round(best.max * 100), withTitle: best.withTitle, withId: best.withId };
    }
    return { pp, stylo: stylometry(pp), traces: traces(raw, pp), hash: await sha256Hex(pp.normalized), similarity };
  });
  return { stage: 't1', lang: out.pp.lang, words: out.pp.words, analyzedWords: out.pp.analyzedWords };
}

/** Model & effort hakim tingkat 1 menurut mesin yang dipilih klien. */
export function judgeModel(settings: EngineSettings, mode: Mode): { model: string; effort: EngineSettings['effort']['t1']; weight: number } {
  if (mode === 'sonnet') return { model: settings.models.t2, effort: settings.effort.t2, weight: 1.6 };
  if (mode === 'opus') return { model: settings.models.t3, effort: settings.effort.t3, weight: 2.2 };
  if (mode === 'fable') return { model: FABLE_MODEL, effort: settings.effort.t3, weight: 2.4 };
  return { model: settings.models.t1, effort: settings.effort.t1, weight: 1 };
}

async function judgeA(ctx: CallCtx, settings: EngineSettings, doc: CheckDoc, pp: Prepped, only?: Set<number>): Promise<JudgeAOut> {
  const jm = judgeModel(settings, doc.mode);
  const parts = chunk(body(pp).filter((s) => !only || only.has(s.par)), 120);
  const results = await Promise.all(
    parts.map(async (part) => {
      try {
        const r = await callModel<{ sentences: { i: number; p: number; r: string[] }[]; doc_p: number; injection: boolean }>(ctx, {
          tier: 't1-a',
          model: jm.model,
          effort: jm.effort,
          system: JUDGE_SYSTEM,
          user: `${context(pp.lang, doc.genre, doc.level)}\n<naskah>\n${part.map((s) => `[${s.i}] ${s.text}`).join('\n')}\n</naskah>\nScore every numbered sentence (${part.length} sentences) individually, keeping its number as i. Also give doc_p: the probability that this text as a whole is mostly AI-written.`,
          schema: SENTENCE_SCHEMA,
          maxTokens: 16000,
        });
        return { r, words: part.reduce((a, s) => a + s.words, 0) };
      } catch (err) {
        if (err instanceof StageError && err.code === 'refusal') return null;
        throw err;
      }
    }),
  );
  const out: JudgeAOut = { doc: 0.5, sentences: {}, injection: false };
  let num = 0;
  let den = 0;
  for (const res of results) {
    if (!res) {
      out.refused = true;
      continue;
    }
    for (const s of res.r.data.sentences ?? []) {
      if (pp.sentences[s.i] && !pp.sentences[s.i]!.excluded) out.sentences[s.i] = { i: s.i, p: clamp01(s.p), r: cleanReasons(s.r) };
    }
    num += clamp01(res.r.data.doc_p) * res.words;
    den += res.words;
    out.injection ||= Boolean(res.r.data.injection);
    ctx.cost += res.r.cost;
  }
  if (den) out.doc = num / den;
  return out;
}

async function judgeB(
  ctx: CallCtx,
  settings: EngineSettings,
  doc: CheckDoc,
  pp: Prepped,
  ov?: { model: string; effort: EngineSettings['effort']['t1']; maxTokens: number },
  only?: Set<number>,
): Promise<JudgeBOut> {
  const jm = ov ?? judgeModel(settings, doc.mode);
  const L = doc.reportLang === 'en' ? 'English' : 'Indonesian';
  try {
    const r = await callModel<{ paragraphs: { i: number; p: number; r: string[] }[]; doc_p: number; style_note: string; injection: boolean }>(ctx, {
      tier: 't1-b',
      model: jm.model,
      effort: jm.effort,
      system: JUDGE_SYSTEM,
      user: `${context(pp.lang, doc.genre, doc.level)}\n<naskah>\n${numberedParagraphs(pp, only)}\n</naskah>\nJudge each numbered paragraph (¶) as a whole: rhythm across its sentences, structure and how its ideas develop. Use the paragraph number as i. Also give doc_p for the whole text, and style_note: at most 40 words in ${L} on what makes the writing feel human or AI-written.`,
      schema: PARAGRAPH_SCHEMA,
      maxTokens: ov?.maxTokens ?? 12000,
    });
    ctx.cost += r.cost;
    const paragraphs: Record<number, JudgeSentence> = {};
    for (const p of r.data.paragraphs ?? []) {
      if (pp.paragraphs[p.i]?.kind === 'body') paragraphs[p.i] = { i: p.i, p: clamp01(p.p), r: cleanReasons(p.r) };
    }
    return { doc: clamp01(r.data.doc_p), paragraphs, styleNote: String(r.data.style_note ?? '').slice(0, 400), injection: Boolean(r.data.injection) };
  } catch (err) {
    if (err instanceof StageError && err.code === 'refusal') return { doc: 0.5, paragraphs: {}, styleNote: '', injection: false, refused: true };
    throw err;
  }
}

async function regenTest(ctx: CallCtx, settings: EngineSettings, pp: Prepped): Promise<{ p: number | null; overlaps: number[] }> {
  const ss = body(pp);
  if (!settings.regen || pp.analyzedWords < 300 || ss.length < 8) return { p: null, overlaps: [] };
  const cuts: { prefix: string; real: string }[] = [];
  for (const f of [0.3, 0.5, 0.7]) {
    const k = Math.max(2, Math.floor(ss.length * f));
    const realParts: string[] = [];
    let w = 0;
    for (let j = k; j < ss.length && w < 110; j += 1) {
      realParts.push(ss[j]!.text);
      w += ss[j]!.words;
    }
    if (w < 60) continue;
    const prefixWords = ss.slice(0, k).map((s) => s.text).join(' ').split(/\s+/);
    cuts.push({ prefix: prefixWords.slice(-350).join(' '), real: realParts.join(' ') });
  }
  if (!cuts.length) return { p: null, overlaps: [] };
  try {
    const r = await callModel<{ continuations: { k: number; text: string }[] }>(ctx, {
      tier: 't1-regen',
      model: settings.models.t1,
      effort: settings.effort.regen,
      system: REGEN_SYSTEM,
      user: `${cuts.map((c, k) => `<naskah k="${k}">\n${c.prefix}\n</naskah>`).join('\n')}\nFor each <naskah> above, write how the text most likely continues: about 120 words, same language and voice. Return one continuation per k.`,
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['continuations'],
        properties: {
          continuations: {
            type: 'array',
            items: { type: 'object', additionalProperties: false, required: ['k', 'text'], properties: { k: { type: 'integer' }, text: { type: 'string' } } },
          },
        },
      },
      maxTokens: 4000,
    });
    ctx.cost += r.cost;
    const overlaps = (r.data.continuations ?? []).filter((c) => cuts[c.k]).map((c) => regenOverlap(c.text, cuts[c.k]!.real));
    return { p: regenProbability(overlaps), overlaps };
  } catch (err) {
    if (err instanceof StageError && (err.code === 'refusal' || err.code === 'truncated')) return { p: null, overlaps: [] };
    throw err;
  }
}

function rubricPrompt(rubric: Rubric, lang: string, doc: CheckDoc, pp: Prepped): string {
  const L: Lang = lang === 'en' ? 'en' : 'id';
  const lines = rubric.aspects.map((a) => {
    const lv = a.levels.map((d, k) => `  ${4 - k}: ${L === 'en' ? d.en : d.id}`).join('\n');
    return `- key: ${a.key} | ${L === 'en' ? a.name.en : a.name.id} | weight ${a.weight}%\n${lv}`;
  });
  return `<rubrik name="${L === 'en' ? rubric.name.en : rubric.name.id}">\n${lines.join('\n')}\n</rubrik>\n<naskah>\nTitle: ${doc.title}\n\n${plainText(pp)}\n</naskah>\nGrade every aspect of the rubric (keys: ${rubric.aspects.map((a) => a.key).join(', ')}) and list the language errors.`;
}

async function gradeWith(ctx: CallCtx, tier: string, model: string, effort: EngineSettings['effort']['t1'], rubric: Rubric, doc: CheckDoc, pp: Prepped): Promise<RubricRaw> {
  const r = await callModel<RubricRaw>(ctx, {
    tier,
    model,
    effort,
    system: rubricSystem(doc.reportLang),
    user: rubricPrompt(rubric, pp.lang, doc, pp),
    schema: rubricSchema(rubric.aspects.map((a) => a.key)),
    maxTokens: 16000,
  });
  ctx.cost += r.cost;
  return {
    aspects: (r.data.aspects ?? []).map((a) => ({ ...a, level: Math.min(4, Math.max(1, Math.round(Number(a.level) || 1))) })),
    errors: (r.data.errors ?? []).slice(0, 60),
  };
}

async function escalate(ctx: CallCtx, tier: 't2' | 't3', model: string, effort: EngineSettings['effort']['t2'], doc: CheckDoc, pp: Prepped, targets: number[]): Promise<EscalationOut> {
  const out: EscalationOut = { doc: null, sentences: {}, targets };
  let num = 0;
  let den = 0;
  for (const part of chunk(targets, 120)) {
    const r = await callModel<{ sentences: { i: number; p: number; r: string[] }[]; doc_p: number; injection: boolean }>(ctx, {
      tier,
      model,
      effort,
      system: JUDGE_SYSTEM,
      user: `${context(pp.lang, doc.genre, doc.level)}\n<naskah>\n${numberedSentences(pp)}\n</naskah>\n<target>${part.join(', ')}</target>\nRead the whole text for context, but score ONLY the sentences whose numbers are listed in <target> (${part.length} sentences), keeping each number as i. Also give doc_p for the whole text.`,
      schema: SENTENCE_SCHEMA,
      maxTokens: 16000,
    });
    ctx.cost += r.cost;
    for (const s of r.data.sentences ?? []) {
      if (part.includes(s.i)) out.sentences[s.i] = { i: s.i, p: clamp01(s.p), r: cleanReasons(s.r) };
    }
    num += clamp01(r.data.doc_p);
    den += 1;
  }
  if (den) out.doc = num / den;
  return out;
}

interface T1Out {
  a: JudgeAOut;
  b: JudgeBOut;
  regen: { p: number | null; overlaps: number[] };
}

function signalsOf(prep: PrepOut, t1: T1Out | null, t2: EscalationOut | null, t3: EscalationOut | null, mode: Mode = 'auto'): Signals {
  return {
    judgeWeight: mode === 'sonnet' ? 1.6 : mode === 'opus' ? 2.2 : 1,
    stylo: prep.stylo,
    traceBoost: prep.traces.boost,
    traceSentences: prep.traces.sentenceHits,
    regen: t1?.regen.p ?? null,
    a: t1 && Object.keys(t1.a.sentences).length ? { doc: t1.a.doc, sentences: t1.a.sentences } : null,
    b: t1 && !t1.b.refused ? { doc: t1.b.doc, paragraphs: t1.b.paragraphs } : null,
    sonnet: t2 ? { doc: t2.doc, sentences: t2.sentences } : null,
    opus: t3 ? { doc: t3.doc, sentences: t3.sentences } : null,
  };
}

/**
 * Hasil tersimpan (MASTER-BLUEPRINT §26): dicari sekali per pemeriksaan dan disimpan sebagai tahap `reuse`, sehingga
 * tahap yang diulang memakai rencana yang sama. Uji mesin dan „Ajukan tinjauan“ selalu dinilai AI dari awal.
 */
async function reusePlanOf(env: Env, store: Store, settings: EngineSettings, doc: CheckDoc, prep: PrepOut): Promise<ReusePlan | null> {
  if (doc.bench || doc.noReuse) return null;
  return sub(store, env, doc.id, 'reuse', async () => planReuse(store, doc.uid, await engineKey(settings, doc.mode, Boolean(doc.free)), prep.pp, prep.hash));
}

const freshPars = (plan: ReusePlan | null, pp: Prepped) => new Set(pp.paragraphs.filter((p) => p.kind === 'body' && !plan?.pars[p.i]).map((p) => p.i));

/** Tingkat 1 kalimat: AI hanya untuk paragraf baru, lalu digabung dengan skor tersimpan. */
async function judgeAWithReuse(ctx: CallCtx, settings: EngineSettings, doc: CheckDoc, pp: Prepped, plan: ReusePlan | null): Promise<JudgeAOut> {
  const only = freshPars(plan, pp);
  const freshSentences = body(pp).filter((s) => only.has(s.par));
  const fresh = freshSentences.length ? await judgeA(ctx, settings, doc, pp, plan ? only : undefined) : null;
  if (!plan) return fresh!;
  const freshWords = freshSentences.reduce((a, s) => a + s.words, 0);
  return {
    doc: mergedDoc(plan, pp, 'a', fresh && Object.keys(fresh.sentences).length ? fresh.doc : null, freshWords) ?? 0.5,
    sentences: { ...cachedSentences(plan, pp, 'a'), ...(fresh?.sentences ?? {}) },
    injection: fresh?.injection ?? false,
    refused: fresh?.refused,
  };
}

/** Tingkat 1 paragraf: sama — AI hanya untuk paragraf baru; catatan gaya dipakai ulang bila naskah identik. */
async function judgeBWithReuse(
  ctx: CallCtx,
  settings: EngineSettings,
  doc: CheckDoc,
  pp: Prepped,
  plan: ReusePlan | null,
  ov?: { model: string; effort: EngineSettings['effort']['t1']; maxTokens: number },
): Promise<JudgeBOut> {
  const only = freshPars(plan, pp);
  const freshList = pp.paragraphs.filter((p) => only.has(p.i) && p.sentences.some((i) => !pp.sentences[i]!.excluded));
  const fresh = freshList.length ? await judgeB(ctx, settings, doc, pp, ov, plan ? only : undefined) : null;
  if (!plan) return fresh!;
  const freshWords = freshList.reduce((a, p) => a + parWords(pp, p.i), 0);
  return {
    doc: mergedDoc(plan, pp, 'b', fresh && !fresh.refused ? fresh.doc : null, freshWords) ?? 0.5,
    paragraphs: { ...cachedParagraphs(plan), ...(fresh?.paragraphs ?? {}) },
    styleNote: fresh?.styleNote || (plan.doc?.style[doc.reportLang] ?? ''),
    injection: fresh?.injection ?? false,
    refused: fresh?.refused,
  };
}

/** Eskalasi (tingkat 2/3): AI hanya untuk kalimat baru; skor tersimpan bagian lama ikut digabung. */
async function escalateWithReuse(ctx: CallCtx, tier: 't2' | 't3', model: string, effort: EngineSettings['effort']['t2'], doc: CheckDoc, pp: Prepped, targets: number[], plan: ReusePlan | null): Promise<EscalationOut> {
  const fresh = targets.length ? await escalate(ctx, tier, model, effort, doc, pp, targets) : null;
  if (!plan) return fresh ?? { doc: null, sentences: {}, targets };
  const cached = cachedSentences(plan, pp, tier);
  const freshWords = targets.reduce((a, i) => a + (pp.sentences[i]?.words ?? 0), 0);
  return {
    doc: mergedDoc(plan, pp, tier, fresh?.doc ?? null, freshWords),
    sentences: { ...cached, ...(fresh?.sentences ?? {}) },
    targets: [...targets, ...Object.keys(cached).map(Number)],
  };
}

/** Uji tebak-lanjutan menilai naskah utuh: dipakai ulang bila identik, dilewati bila sebagian tersimpan (bagian lama 0 biaya). */
async function regenWithReuse(ctx: CallCtx, settings: EngineSettings, pp: Prepped, plan: ReusePlan | null): Promise<T1Out['regen']> {
  if (plan && (plan.words.own + plan.words.other) > 0) return { p: plan.full && plan.doc ? plan.doc.regen : null, overlaps: [] };
  return regenTest(ctx, settings, pp);
}

/** Rubrik: dipakai ulang hanya dari pemeriksaan member ini sendiri dengan naskah, rubrik, dan bahasa laporan yang sama. */
async function ownRubric(env: Env, store: Store, doc: CheckDoc, plan: ReusePlan | null): Promise<boolean> {
  if (!plan?.ownSrc || !doc.rubricId) return false;
  const src = await store.get<CheckDoc>(checkKey(plan.ownSrc));
  if (!src || src.uid !== doc.uid || src.stage !== 'done' || src.rubricId !== doc.rubricId || src.reportLang !== doc.reportLang) return false;
  const h = await readSub<RubricRaw>(store, env, src.id, 'rubric');
  if (!h) return false;
  await sub(store, env, doc.id, 'rubric', async () => h);
  for (const name of ['rubric2', 'rubric3']) {
    const v = await readSub<RubricRaw>(store, env, src.id, name);
    if (v) await sub(store, env, doc.id, name, async () => v);
  }
  await store.put(subKey(doc.id, 'rubric-src'), { id: src.id, report: src.reportId });
  return true;
}

/**
 * Cek Gratis: SATU lintasan Haiku termurah (pemilik: „hanya menggunakan haiku yg paling murah“), penilaian per paragraf,
 * effort rendah, keluaran dibatasi 900 token per halaman normal; tanpa uji regenerasi, rubrik, atau eskalasi. Label per
 * kalimat diambil dari paragrafnya, jadi fusi dan laporan memakai kode yang sama dengan pemeriksaan berbayar.
 */
async function stageT1Free(ctx: CallCtx, env: Env, store: Store, settings: EngineSettings, doc: CheckDoc): Promise<Partial<CheckDoc>> {
  const prep = (await readSub<PrepOut>(store, env, doc.id, 'prep'))!;
  const pp = prep.pp;
  const plan = await reusePlanOf(env, store, settings, doc, prep);
  const maxTokens = Math.max(1200, 900 * Math.max(1, doc.free?.pages ?? 1));
  const b = await sub(store, env, doc.id, 't1-b', () => judgeBWithReuse(ctx, settings, doc, pp, plan, { model: freeModel(settings), effort: 'low', maxTokens }));
  await sub(store, env, doc.id, 't1-a', async (): Promise<JudgeAOut> => {
    const sentences: Record<number, JudgeSentence> = {};
    for (const s of body(pp)) {
      const par = b.paragraphs[s.par];
      if (par) sentences[s.i] = { i: s.i, p: par.p, r: par.r };
    }
    return { doc: b.doc, sentences, injection: b.injection, refused: b.refused };
  });
  await sub(store, env, doc.id, 't1-regen', async () => ({ p: null, overlaps: [] as number[] }));
  await store.put(subKey(doc.id, 't2-targets'), { targets: [] });
  return { stage: 'fuse', t2n: 0, skipped: ['t2', 't3'] };
}

async function stageT1(ctx: CallCtx, env: Env, store: Store, settings: EngineSettings, doc: CheckDoc): Promise<Partial<CheckDoc>> {
  if (doc.free) return stageT1Free(ctx, env, store, settings, doc);
  const prep = (await readSub<PrepOut>(store, env, doc.id, 'prep'))!;
  const pp = prep.pp;
  const plan = await reusePlanOf(env, store, settings, doc, prep);
  const rubric = getRubric(doc.rubricId);
  const rubricReused = rubric ? await ownRubric(env, store, doc, plan) : false;
  const [a, b, regen] = await Promise.all([
    sub(store, env, doc.id, 't1-a', () => judgeAWithReuse(ctx, settings, doc, pp, plan)),
    sub(store, env, doc.id, 't1-b', () => judgeBWithReuse(ctx, settings, doc, pp, plan)),
    sub(store, env, doc.id, 't1-regen', () => regenWithReuse(ctx, settings, pp, plan)),
    rubric && !rubricReused ? sub(store, env, doc.id, 'rubric', () => { const jm = judgeModel(settings, doc.mode); return gradeWith(ctx, 'rubric', jm.model, jm.effort, rubric, doc, pp); }) : Promise.resolve(null),
  ]);
  const t1: T1Out = { a, b, regen };
  const sig = signalsOf(prep, t1, null, null, doc.mode);
  const forensic = doc.mode === 'forensic';
  const refused = a.refused || b.refused;
  const t = settings.thresholds;
  let targets: number[];
  // Mesin satu model (Haiku/Sonnet/Opus): tidak ada eskalasi — klien memilih modelnya sendiri.
  const single = doc.mode === 'haiku' || doc.mode === 'sonnet' || doc.mode === 'opus' || doc.mode === 'fable';
  if (single && !refused) targets = [];
  else if (forensic || refused) targets = body(pp).map((s) => s.i);
  else if (gate1Passes(pp, sig, t)) targets = [];
  else targets = tier2Targets(pp, sig, t, false);
  // Kalimat di paragraf tersimpan tidak pernah dikirim lagi ke AI (biaya perusahaan 0 untuk bagian lama).
  if (plan) targets = targets.filter((i) => !plan.pars[pp.sentences[i]!.par]);
  await store.put(subKey(doc.id, 't2-targets'), { targets });
  const next = targets.length > 0 || hasCached(plan, 't2');
  return { stage: next ? 't2' : 'fuse', t2n: targets.length, skipped: next ? [] : ['t2', 't3'] };
}

async function stageT2(ctx: CallCtx, env: Env, store: Store, settings: EngineSettings, doc: CheckDoc): Promise<Partial<CheckDoc>> {
  const prep = (await readSub<PrepOut>(store, env, doc.id, 'prep'))!;
  const plan = await reusePlanOf(env, store, settings, doc, prep);
  const { targets } = (await store.get<{ targets: number[] }>(subKey(doc.id, 't2-targets'))) ?? { targets: [] };
  const t2 = await sub(store, env, doc.id, 't2', () => escalateWithReuse(ctx, 't2', settings.models.t2, settings.effort.t2, doc, prep.pp, targets, plan));
  const t1: T1Out = {
    a: (await readSub<JudgeAOut>(store, env, doc.id, 't1-a'))!,
    b: (await readSub<JudgeBOut>(store, env, doc.id, 't1-b'))!,
    regen: (await readSub<T1Out['regen']>(store, env, doc.id, 't1-regen')) ?? { p: null, overlaps: [] },
  };
  const sig = signalsOf(prep, t1, t2, null, doc.mode);
  let t3 = tier3Targets(prep.pp, sig, settings.thresholds, doc.mode === 'forensic', doc.mode === 'forensic' ? 100_000 : settings.maxOpusSentences);
  if (plan) t3 = t3.filter((i) => !plan.pars[prep.pp.sentences[i]!.par]);
  await store.put(subKey(doc.id, 't3-targets'), { targets: t3 });
  const next = t3.length > 0 || hasCached(plan, 't3');
  return { stage: next ? 't3' : 'fuse', t3n: t3.length, skipped: next ? [] : ['t3'] };
}

async function stageT3(ctx: CallCtx, env: Env, store: Store, settings: EngineSettings, doc: CheckDoc): Promise<Partial<CheckDoc>> {
  const prep = (await readSub<PrepOut>(store, env, doc.id, 'prep'))!;
  const plan = await reusePlanOf(env, store, settings, doc, prep);
  const { targets } = (await store.get<{ targets: number[] }>(subKey(doc.id, 't3-targets'))) ?? { targets: [] };
  await sub(store, env, doc.id, 't3', () => escalateWithReuse(ctx, 't3', settings.models.t3, settings.effort.t3, doc, prep.pp, targets, plan));
  return { stage: 'fuse' };
}

/* ── penilaian rubrik ─────────────────────────────────────────────────── */

const normQuote = (s: string) => s.toLowerCase().replace(/[“”"'‘’]/g, '').replace(/\s+/g, ' ').trim();

function evidenceOk(text: string, ev: string): boolean {
  const q = normQuote(ev);
  if (q.length < 8) return false;
  const t = normQuote(text);
  if (t.includes(q)) return true;
  const head = q.slice(0, Math.max(12, Math.floor(q.length * 0.6)));
  return t.includes(head);
}

interface Graded {
  summary: NonNullable<ReportSummary['rubric']>;
  detail: NonNullable<ReportDetail['rubric']>;
  needsVerify: boolean;
}

function grade(rubric: Rubric, pp: Prepped, rawText: string, h: RubricRaw, s2: RubricRaw | null, s3: RubricRaw | null): Graded {
  const text = plainText(pp);
  const rules = pp.lang === 'en' ? [] : ruleErrors(text);
  const ruleSet = new Set(rules.map((e) => e.wrong.toLowerCase()));
  const modelErrors = [...(s2?.errors ?? h.errors)].filter((e) => e.wrong && text.toLowerCase().includes(e.wrong.toLowerCase()) && !ruleSet.has(e.wrong.toLowerCase()));
  const errors = [...rules, ...modelErrors].slice(0, 80);
  const band = languageBand(errors.length, pp.analyzedWords || pp.words);
  const by: string[] = ['haiku'];
  if (s2) by.push('sonnet');
  if (s3) by.push('opus');
  let needsVerify = false;
  const aspects = rubric.aspects.map((a) => {
    const hx = h.aspects.find((x) => x.key === a.key);
    const sx = s2?.aspects.find((x) => x.key === a.key);
    const ox = s3?.aspects.find((x) => x.key === a.key);
    const useOpus = ox && sx && hx && Math.abs(sx.level - hx.level) >= 2;
    const src = (useOpus ? ox : sx) ?? hx ?? { key: a.key, level: 2, reason: '', evidence: '', tip: '', sure: false };
    let level = src.level;
    const ok = evidenceOk(rawText, src.evidence);
    if (!hx?.sure || !evidenceOk(rawText, hx?.evidence ?? '')) needsVerify = true;
    if (a.language) level = Math.min(level, band.level);
    return {
      key: a.key,
      level,
      reason: src.reason,
      evidence: src.evidence,
      evidenceOk: ok,
      tip: src.tip,
      by: useOpus ? 'opus' : sx ? 'sonnet' : 'haiku',
      weight: a.weight,
    };
  });
  const total = Math.round(aspects.reduce((acc, a) => acc + aspectValue(a.level, a.weight), 0) * 100) / 100;
  for (const edge of [85, 70, 55]) if (Math.abs(total - edge) <= 2) needsVerify = true;
  return {
    summary: {
      id: rubric.id,
      total,
      category: categoryOf(total),
      aspects: aspects.map((a) => ({ key: a.key, level: a.level, value: aspectValue(a.level, a.weight), weight: a.weight })),
      langErrors: errors.length,
      per1k: band.per1k,
      verifiedBy: by,
    },
    detail: { aspects: aspects.map(({ weight: _w, ...rest }) => rest), errors },
    needsVerify,
  };
}

/* ── fusi & laporan ───────────────────────────────────────────────────── */

async function loadAll(env: Env, store: Store, id: string) {
  const prep = (await readSub<PrepOut>(store, env, id, 'prep'))!;
  const a = await readSub<JudgeAOut>(store, env, id, 't1-a');
  const b = await readSub<JudgeBOut>(store, env, id, 't1-b');
  const regen = await readSub<T1Out['regen']>(store, env, id, 't1-regen');
  const t1: T1Out | null = a && b ? { a, b, regen: regen ?? { p: null, overlaps: [] } } : null;
  const t2 = await readSub<EscalationOut>(store, env, id, 't2');
  const t3 = await readSub<EscalationOut>(store, env, id, 't3');
  const rubric = await readSub<RubricRaw>(store, env, id, 'rubric');
  const rubric2 = await readSub<RubricRaw>(store, env, id, 'rubric2');
  const rubric3 = await readSub<RubricRaw>(store, env, id, 'rubric3');
  return { prep, t1, t2, t3, rubric, rubric2, rubric3 };
}

async function stageFuse(env: Env, store: Store, settings: EngineSettings, doc: CheckDoc): Promise<Partial<CheckDoc>> {
  const rubric = getRubric(doc.rubricId);
  if (rubric && settings.rubricVerify && (doc.mode === 'auto' || doc.mode === 'forensic')) {
    const all = await loadAll(env, store, doc.id);
    if (all.rubric) {
      const sealed = await store.get<Sealed>(textKey(doc.id));
      const raw = sealed ? (await unseal<TextDoc>(master(env), sealed)).raw : plainText(all.prep.pp);
      const g = grade(rubric, all.prep.pp, raw, all.rubric, null, null);
      if (g.needsVerify || doc.mode === 'forensic') return { stage: 'rubric2' };
    }
  }
  return finalize(env, store, settings, doc);
}

async function stageRubric2(ctx: CallCtx, env: Env, store: Store, settings: EngineSettings, doc: CheckDoc): Promise<Partial<CheckDoc>> {
  const rubric = getRubric(doc.rubricId)!;
  const prep = (await readSub<PrepOut>(store, env, doc.id, 'prep'))!;
  const h = (await readSub<RubricRaw>(store, env, doc.id, 'rubric'))!;
  const s2 = await sub(store, env, doc.id, 'rubric2', () => gradeWith(ctx, 'rubric2', settings.models.t2, settings.effort.t2, rubric, doc, prep.pp));
  const far = rubric.aspects.some((a) => {
    const x = h.aspects.find((y) => y.key === a.key);
    const y = s2.aspects.find((z) => z.key === a.key);
    return x && y && Math.abs(x.level - y.level) >= 2;
  });
  if (far) await sub(store, env, doc.id, 'rubric3', () => gradeWith(ctx, 'rubric3', settings.models.t3, settings.effort.t3, rubric, doc, prep.pp));
  return finalize(env, store, settings, { ...doc, cost: doc.cost + ctx.cost });
}

export function retentionDays(settings: EngineSettings, userDays?: number): number {
  // Tidak pernah melebihi pembersihan otomatis 90 hari.
  return Math.min(PURGE_DAYS, typeof userDays === 'number' ? userDays : settings.retentionDays);
}

async function finalize(env: Env, store: Store, settings: EngineSettings, docIn: CheckDoc): Promise<Partial<CheckDoc>> {
  let doc = docIn;
  const all = await loadAll(env, store, doc.id);
  const { prep } = all;
  const pp = prep.pp;
  const t = settings.thresholds;
  const sig = signalsOf(prep, all.t1, all.t2, all.t3, doc.mode);
  const fs = fuseAll(pp, sig, t);
  const comp = composition(pp, fs);
  const conf = confidence(pp, fs, sig);
  const docP = docProbability(sig, comp);
  const label = decideLabel(pp.analyzedWords, docP, comp, conf, t);
  const pars = paragraphStats(pp, fs, t);
  const bodyWords = Math.max(1, pp.analyzedWords);
  const wordsOf = (ids: number[]) => ids.reduce((acc, i) => acc + (pp.sentences[i]?.words ?? 0), 0);
  const t2Pct = all.t2 ? Math.round((wordsOf(all.t2.targets) * 100) / bodyWords) : 0;
  const t3Pct = all.t3 ? Math.round((wordsOf(all.t3.targets) * 100) / bodyWords) : 0;
  const paraWords = fs.filter((s) => s.r.some((r) => r === 'tortured_phrase' || r === 'odd_synonym' || r === 'inserted_typos')).reduce((acc, s) => acc + pp.sentences[s.i]!.words, 0);
  const rubric = getRubric(doc.rubricId);
  let graded: Graded | null = null;
  if (rubric && all.rubric) {
    const sealed = await store.get<Sealed>(textKey(doc.id));
    const raw = sealed ? (await unseal<TextDoc>(master(env), sealed)).raw : plainText(pp);
    graded = grade(rubric, pp, raw, all.rubric, all.rubric2, all.rubric3);
  }
  const fsMap = new Map(fs.map((s) => [s.i, s]));
  const detail: ReportDetail = {
    paragraphs: pp.paragraphs.map((p) => ({ i: p.i, kind: p.kind, text: p.text })),
    sentences: pp.sentences.map((s) => {
      const f = fsMap.get(s.i);
      return { i: s.i, par: s.par, text: s.text, p: f ? Math.round(f.p * 1000) / 1000 : null, cls: f?.cls ?? null, r: f?.r ?? [], excluded: s.excluded };
    }),
    rubric: graded?.detail,
    styleNote: all.t1?.b.styleNote,
  };
  const billing = await getBilling(store);
  const rates = rateCard(billing, settings);
  const lines: NonNullable<ReportSummary['usage']>['lines'] = [];
  // Sumber kebenaran biaya = log per panggilan (termasuk panggilan yang terulang karena koneksi putus).
  let realCost = 0;
  const raw: RawLine[] = [];
  for await (const k of store.keys(`l/cu/${doc.id}/`)) {
    const u = await store.get<{ tier: string; model: string; in: number; out: number; cacheRead: number; cost: number }>(k.key);
    if (!u) continue;
    raw.push(u);
    realCost += u.cost || 0;
    const rate = rates[u.model.replace(/-\d{8}$/, '')];
    // Model fallback di luar tarif standar: token dihitung langsung dari biaya nyatanya (rumus yang sama).
    const t = rate ? lineTokens(rate, u.in, u.out, u.cacheRead) : Math.round((u.cost / billing.tokenUnitUsd) * 100) / 100;
    lines.push({ tier: u.tier, model: u.model, in: u.in, out: u.out, cache: u.cacheRead, tokens: t });
  }
  lines.reverse();
  doc = { ...doc, cost: Math.max(doc.cost, realCost) };
  // Hasil tersimpan (MASTER-BLUEPRINT §26): tidak ada panggilan AI untuk bagian lama (biaya perusahaan 0). Member yang sama
  // membayar `reusePct` % dari harga normalnya; member lain membayar harga normal.
  const plan = doc.bench || doc.noReuse ? null : await readSub<ReusePlan>(store, env, doc.id, 'reuse');
  const reused = reuseLines(plan, rates, billing, billing.reusePct);
  const freshCount = lines.length;
  lines.push(...reused.lines);
  const rubricSrc = await store.get<{ report?: string }>(subKey(doc.id, 'rubric-src'));
  if (rubricSrc?.report) {
    const src = await store.get<ReportSummary>(reportKey(rubricSrc.report));
    for (const l of src?.usage?.lines ?? []) {
      if (!l.tier.startsWith('rubric')) continue;
      const rate = rates[l.model.replace(/-\d{8}$/, '')];
      const full = rate ? lineTokens(rate, l.in, l.out, l.cache) : l.tokens;
      lines.push({ tier: 'reuse-own', model: l.model, in: l.in, out: l.out, cache: l.cache, tokens: Math.round(full * billing.reusePct) / 100 });
      reused.savedUsd += full * billing.tokenUnitUsd;
    }
  }
  const exact = Math.round(lines.reduce((a, l) => a + l.tokens, 0) * 100) / 100;
  const priced = Math.max(freshCount ? 1 : 0, Math.ceil(exact - 1e-9));
  // Tidak pernah melebihi pesanan; pesanan sudah ≥ batas biaya mutlak sehingga perusahaan tetap untung.
  const tokens = doc.reserved > 0 ? Math.min(doc.reserved, priced) : priced;
  // Cek Gratis: halaman yang pernah diperiksa member ini sendiri dihitung `reusePct` % (sisa kuota kembali).
  let freePages = doc.free?.pages;
  if (doc.free && plan && plan.words.own > 0 && plan.words.total > 0) {
    const ratio = (plan.words.total - plan.words.own + (plan.words.own * billing.reusePct) / 100) / plan.words.total;
    const pages = Math.max(0, Math.ceil(doc.free.pages * ratio - 1e-9));
    if (pages < doc.free.pages) {
      await trimFreePages(store, doc.uid, doc.free.periodKey, doc.id, pages);
      freePages = pages;
    }
  }
  const { items: prior } = await store.list(`i/hash/${doc.uid}/${prep.hash.slice(0, 32)}/`, { limit: 50 });
  const reportId = doc.reportId ?? newId('rpt');
  const code = verifyCode();
  const summary: ReportSummary = {
    id: reportId,
    checkId: doc.id,
    uid: doc.uid,
    batchId: doc.batchId,
    free: doc.free ? { pages: freePages ?? doc.free.pages, partialOf: doc.free.partialOf } : undefined,
    createdAt: Date.now(),
    title: doc.title,
    author: doc.author,
    genre: doc.genre,
    level: doc.level,
    lang: pp.lang,
    reportLang: doc.reportLang,
    mode: doc.mode,
    purpose: doc.purpose ?? 'umum',
    words: pp.words,
    analyzedWords: pp.analyzedWords,
    excludedWords: pp.excludedWords,
    hash: prep.hash,
    comp,
    docP: Math.round(docP * 1000) / 1000,
    conf,
    label,
    signals: {
      stylo: prep.stylo.doc,
      regen: all.t1?.regen.p ?? null,
      haikuA: all.t1 && !all.t1.a.refused ? all.t1.a.doc : null,
      haikuB: all.t1 && !all.t1.b.refused ? all.t1.b.doc : null,
      sonnet: all.t2?.doc ?? null,
      opus: all.t3?.doc ?? null,
      traces: prep.traces.items,
    },
    path: { t2Pct, t3Pct, tiers: [doc.mode === 'sonnet' ? 'sonnet' : doc.mode === 'opus' ? 'opus' : doc.mode === 'fable' ? 'fable' : 'haiku', ...(all.t2 ? ['sonnet'] : []), ...(all.t3 ? ['opus'] : [])] },
    paragraphs: pars,
    flags: {
      injection: Boolean(all.t1?.a.injection || all.t1?.b.injection),
      paraphrasePct: Math.round((paraWords * 100) / bodyWords),
      invisible: pp.invisible,
    },
    similarity: prep.similarity,
    rubric: graded?.summary ?? null,
    verifyCode: code,
    engine: { version: '1.0', calibration: 'awal-1', prompt: 'v1' },
    cost: Math.round(doc.cost * 1e6) / 1e6,
    // Cek Gratis memakai kuota halaman, bukan token: member tidak pernah melihat atau membayar token untuknya.
    tokens: doc.free ? 0 : tokens,
    usage: { lines, rates, exact, reserved: doc.reserved, charged: doc.reserve && 'tokens' in doc.reserve ? tokens : 0, refunded: doc.reserve && 'tokens' in doc.reserve ? Math.max(0, doc.reserved - tokens) : 0 },
    samePrior: prior.filter((x) => x.id !== reportId).length,
    reuseOwn: plan && plan.words.own > 0 ? { words: plan.words.own, pct: billing.reusePct } : undefined,
    enc: await seal(master(env), detail),
  };
  const created = await store.createOnce(reportKey(reportId), summary);
  const final = created ? summary : (await store.get<ReportSummary>(reportKey(reportId)))!;
  if (created) {
    const meta = { title: final.title, author: final.author, ai: comp.ai, mix: comp.mix, hum: comp.hum, label, total: final.rubric?.total ?? null, lang: pp.lang, at: final.createdAt, batch: doc.batchId ?? null, tokens: final.tokens };
    await store.createOnce(`i/hash/${doc.uid}/${prep.hash.slice(0, 32)}/${reportId}`, {});
    if (!doc.bench) await store.createOnce(`i/user-reports/${doc.uid}/${invTs(final.createdAt)}~${reportId}`, {}, meta);
    await store.createOnce(`i/reports/${invTs(final.createdAt)}~${reportId}`, {}, { ...meta, uid: doc.uid });
    await store.createOnce(`c/verify/${code}.json`, { code, reportId, createdAt: final.createdAt, title: final.title, comp, label, total: final.rubric?.total ?? null, hash: final.hash, words: final.analyzedWords });
    const user = await getUser(store, doc.uid);
    const days = retentionDays(settings, user?.retentionDays);
    if (days >= 0 && !doc.bench) {
      const when = new Date(final.createdAt + days * 86_400_000 + 7 * 3600_000).toISOString().slice(0, 10);
      await store.createOnce(`i/expiry/${when}/${doc.id}~${reportId}`, {});
    }
    if (doc.bench) {
      await store.createOnce(`c/bench-results/${doc.bench.set}/${doc.bench.run}/${String(doc.bench.n).padStart(5, '0')}.json`, {
        n: doc.bench.n, truth: doc.bench.label, label, docP: final.docP, comp, lang: pp.lang, words: pp.analyzedWords, cost: final.cost, tiers: final.path.tiers,
      });
    }
  }
  // Simpan hasil per paragraf untuk dipakai ulang (bukan uji mesin; tidak bila AI menolak atau ada upaya menyisipkan perintah).
  let rx = doc.rx;
  if (!doc.bench && all.t1 && !all.t1.a.refused && !all.t1.b.refused && !all.t1.a.injection && !all.t1.b.injection) {
    try {
      const ek = plan?.ek ?? (await engineKey(settings, doc.mode, Boolean(doc.free)));
      const hashes: Record<number, string> = plan?.hashes ?? Object.fromEntries(await Promise.all(bodyParagraphs(pp).map(async (p) => [p.i, await paraHash(p.text)] as const)));
      const t2t = (await store.get<{ targets: number[] }>(subKey(doc.id, 't2-targets')))?.targets ?? [];
      const t3t = (await store.get<{ targets: number[] }>(subKey(doc.id, 't3-targets')))?.targets ?? [];
      const entries = buildEntries(pp, plan, hashes, {
        a: all.t1.a.sentences, b: all.t1.b.paragraphs, t2: all.t2?.sentences ?? null, t3: all.t3?.sentences ?? null,
        d: { a: all.t1.a.doc, b: all.t1.b.doc, t2: all.t2?.doc ?? null, t3: all.t3?.doc ?? null }, t2Targets: t2t, t3Targets: t3t,
      }, raw, doc.id);
      const now = Date.now();
      const whole = !plan || plan.words.own + plan.words.other === 0;
      const docEntry = whole ? { v: 1 as const, src: doc.id, at: now, regen: all.t1.regen.p, style: all.t1.b.styleNote ? { [doc.reportLang]: all.t1.b.styleNote } : {} } : null;
      const list = await saveReuse(store, { ek, uid: doc.uid, checkId: doc.id, createdAt: doc.createdAt, docHash: prep.hash, hashes, entries, doc: docEntry, rubric: doc.rubricId, reportLang: doc.reportLang });
      rx = { ek, list };
    } catch (err) {
      console.error('reuse save', err); // laporan tetap selesai; hanya kesempatan menghemat yang hilang
    }
  }
  const charged = doc.reserve && 'tokens' in doc.reserve ? final.tokens : 0;
  return {
    stage: 'done', reportId: final.id, tokens: final.tokens, charged, cost: doc.cost, analyzedWords: pp.analyzedWords, rx,
    free: doc.free ? { ...doc.free, pages: freePages ?? doc.free.pages } : undefined,
    reuse: plan ? { own: plan.words.own, other: plan.words.other, savedUsd: Math.round(reused.savedUsd * 1e6) / 1e6, pct: billing.reusePct } : undefined,
  };
}

/**
 * Penyelesaian uang satu pemeriksaan — idempoten (kunci per pemeriksaan), dipanggil oleh /advance
 * dan diulang oleh cron sampai berhasil:
 *  - selesai: kembalikan (pesanan − yang ditagih);
 *  - gagal: kembalikan seluruh pesanan (pemeriksaan gagal tidak ditagih).
 * Setelah itu catat biaya harian sekali dan periksa penjaga rugi.
 */
export async function settleCheck(env: Env, store: Store, doc: CheckDoc): Promise<void> {
  if (doc.stage !== 'done' && doc.stage !== 'failed') return;
  if (doc.reserve && 'tokens' in doc.reserve) {
    const back = doc.stage === 'done' ? Math.max(0, doc.reserved - (doc.charged ?? doc.tokens ?? 0)) : doc.reserved;
    await refund(store, doc.uid, back, doc.stage === 'done' ? `Sisa pesanan ${doc.id} (ditagih ${doc.charged ?? 0} token)` : `Pemeriksaan gagal ${doc.id} — tidak ditagih`, `settle:${doc.id}`);
  }
  // Cek Gratis yang gagal: halaman kuotanya kembali (idempoten).
  if (doc.free && doc.stage === 'failed') await releaseFreePages(store, doc.uid, doc.free.periodKey, doc.id);
  if (await store.createOnce(`u/spend/${doc.id}`, { at: Date.now() })) {
    const done = doc.stage === 'done';
    await addSpend(store, doc.cost, done ? doc.analyzedWords ?? 0 : 0, done ? doc.reuse?.savedUsd ?? 0 : 0, done && doc.reuse ? doc.reuse.own + doc.reuse.other : 0);
    // Rekap member, tidak pernah dihapus (MASTER-BLUEPRINT §27): token terpakai, biaya AI, penghematan.
    if (!doc.bench) {
      await addStats(store, doc.uid, `chk:${doc.id}`, {
        checks: done ? 1 : 0,
        freeChecks: done && doc.free ? 1 : 0,
        tokensUsed: done && doc.reserve && 'tokens' in doc.reserve ? doc.charged ?? 0 : 0,
        costUsd: doc.cost,
        freeCostUsd: doc.free ? doc.cost : 0,
        savedUsd: done ? doc.reuse?.savedUsd ?? 0 : 0,
      });
    }
    if (doc.free) await addFreeSpend(store, doc.cost);
    // Gagal setelah biaya AI terpakai: tidak ditagih ke member, tetapi dihitung — lebih dari 3 dalam 24 jam membuat
    // pemeriksaan baru member itu dijeda (checks.ts), dan admin melihatnya di audit log.
    if (doc.stage === 'failed' && doc.cost > 0 && !doc.bench) {
      const n = await bump(env, `costly-fail:${doc.uid}`, 86_400);
      if (n >= 3) await audit(store, 'system', 'costly_failures', { uid: doc.uid, checkId: doc.id, count: n, code: doc.error?.code, cost: doc.cost });
    }
    if (doc.stage === 'done' && doc.reserve && 'tokens' in doc.reserve) {
      const billing = await getBilling(store);
      const settings = await getEngine(store);
      // Pendapatan minimum (diskon paket terbesar) dibandingkan biaya API nyata.
      const revenueIdr = (doc.charged ?? 0) * tokenCostIdr(billing, settings) * minRevenueMultiple(billing);
      if (revenueIdr < doc.cost * settings.fx) {
        await store.createOnce(`i/loss/${doc.id}`, {}, { at: Date.now(), costIdr: Math.round(doc.cost * settings.fx), revenueIdr: Math.round(revenueIdr) });
        await audit(store, 'system', 'loss_alert', { checkId: doc.id, cost: doc.cost, tokens: doc.charged });
      }
    }
  }
  await store.del([`i/active/${doc.id}`, `i/user-active/${doc.uid}/${doc.id}`]);
}

/* ── pengendali ───────────────────────────────────────────────────────── */

export async function advance(env: Env, checkId: string): Promise<CheckDoc | null> {
  const store = new Store(env.DATA);
  const now = Date.now();
  let got = false;
  const doc = await store.cas<CheckDoc>(checkKey(checkId), (cur) => {
    got = false;
    if (!cur || cur.stage === 'done' || cur.stage === 'failed') return null;
    if (cur.lease > now) return null;
    got = true;
    // Sewa 10 menit: cukup untuk panggilan Opus terpanjang, sehingga tahap yang sama tidak pernah berjalan ganda.
    return { ...cur, lease: now + 600_000, updatedAt: now };
  });
  if (!doc || !got) return doc;
  // Router (MASTER-BLUEPRINT §8): model termurah yang mampu per tingkat, model yang dimatikan admin tidak pernah dipanggil.
  const controls = await getControls(store);
  const routed = applyRouter(await getEngine(store), controls);
  const settings = routed.eng;
  const ctx: CallCtx = { env, store, settings, checkId, uid: doc.uid, cost: 0 };
  try {
    // Tombol darurat: tidak ada panggilan AI baru; pemeriksaan berhenti dan seluruh pesanannya kembali (settleCheck).
    if (controls.emergencyStop && doc.stage !== 'fuse') throw new StageError('stopped', 'Layanan AI dihentikan sementara oleh admin. Token Anda dikembalikan utuh.');
    if (routed.blocked.length && doc.stage !== 'fuse' && doc.stage !== 'prep') throw new StageError('no_model', 'Tidak ada mesin AI aktif yang mampu untuk tahap ini. Token Anda dikembalikan utuh.');
    let patch: Partial<CheckDoc>;
    switch (doc.stage) {
      case 'prep':
        patch = await stagePrep(env, store, doc);
        break;
      case 't1':
        patch = await stageT1(ctx, env, store, settings, doc);
        break;
      case 't2':
        patch = await stageT2(ctx, env, store, settings, doc);
        break;
      case 't3':
        patch = await stageT3(ctx, env, store, settings, doc);
        break;
      case 'fuse':
        patch = await stageFuse(env, store, settings, doc);
        break;
      case 'rubric2':
        patch = await stageRubric2(ctx, env, store, settings, doc);
        break;
      default:
        return doc;
    }
    const after = await store.cas<CheckDoc>(checkKey(checkId), (cur) =>
      cur ? { ...cur, ...patch, skipped: [...(cur.skipped ?? []), ...(patch.skipped ?? [])], cost: Math.max(cur.cost + ctx.cost, patch.cost ?? 0), lease: 0, attempts: 0, error: undefined, updatedAt: Date.now() } : null,
    );
    if (after && (after.stage === 'done' || after.stage === 'failed')) await settleCheck(env, store, after);
    return after;
  } catch (err) {
    const se = err instanceof StageError ? err : new StageError('retry', err instanceof Error ? err.message : String(err));
    const fatal = !se.retryable || doc.attempts >= 4;
    const after = await store.cas<CheckDoc>(checkKey(checkId), (cur) =>
      cur
        ? {
            ...cur,
            stage: fatal ? 'failed' : cur.stage,
            attempts: cur.attempts + 1,
            lease: fatal ? 0 : Date.now() + Math.min(60_000, 5_000 * 2 ** cur.attempts),
            error: { code: se.code, msg: se.message },
            cost: cur.cost + ctx.cost,
            updatedAt: Date.now(),
          }
        : null,
    );
    // Gagal = tidak ditagih: seluruh pesanan kembali (biaya API yang terlanjur ditanggung platform).
    if (fatal && after) await settleCheck(env, store, after);
    return after;
  }
}
