/**
 * MESIN PENERJEMAH ulyah.com — every language to 100%, stored in R2 only.
 *
 * Owner, 22 Nov 2026: „Bikinin engine penerjemah bahasa, cek di portal admin ulyah.com, bahasa apa aja yg blm
 * di kerjakan, tolong bikin engine penerjemah nya, biar semuanya 100% setiap bahasa, tolong hati2 saat
 * menerjemahkan alquran, kitab2 dan hadits2" — and, the same day: „Jgn ke D1, pindah ke R2, jgn pernah memakai
 * D1 sebagai database". Design and rules: docs/TRANSLATION-ENGINE.md.
 *
 * WHAT IT TRANSLATES. The corpus — every piece of the site's own writing a page asks to have translated — lives
 * in R2 (`mt/_corpus/<src>.json`, { hash: text }). It grows two ways: the one-time move out of D1 (`--move`), and
 * the Worker, which records any source text a page asked for and the store did not have (`mt-want/<src>/<hash>`,
 * create-once). Each pass folds the wants into the corpus, then translates whatever is missing for each language.
 *
 * WHERE IT WRITES. `mt/<src>-<tgt>/<shard>.json` — the exact shards the Worker reads (lib/mt-r2.ts) — with
 * compare-and-swap (scripts/lib/mt-store.ts). Progress (`mt/_state.json`): how much of the corpus exists in each
 * language, measured by counting, never estimated. Nothing is written anywhere else; D1 is not touched at all
 * except by `--move`, which copies the old rows out once and verifies every one arrived.
 *
 * SCRIPTURE (the owner's „hati-hati"). Four guards, each enforced per item:
 *   1. Arabic script is never translated. Every Arabic run — an ayah, a hadith matn, a du'a, a kitab quotation —
 *      is cut out before the text leaves this process, replaced by @@n@@, and put back byte for byte afterwards.
 *      Names of the hadith collections and imams are masked the same way.
 *   2. A result whose placeholders do not match the source exactly (one lost, one invented, one renumbered) is
 *      rejected: that is the signature of a translator that touched the masked text.
 *   3. Arabic-SOURCE text is never machine-translated here. The Qur'an's translations are licensed human
 *      translations (docs/CONTENT-POLICY.md); hadith are translated from their curated Indonesian/English
 *      renderings, never from the Arabic matn. Wants with an Arabic source are dropped and counted.
 *   4. An answer identical to its source is only accepted for a short label that is genuinely the same in both
 *      languages (echo-faithful.ts); an answer wildly shorter or longer than its source is rejected as a
 *      truncation or a hallucination.
 * The AI models are told all of this too (ai-translate.ts promptFor), but the guards do not rely on them obeying.
 *
 * Usage:
 *   npx tsx scripts/mesin-terjemah.ts [--langs=fr,de] [--minutes=240] [--dry]
 *   npx tsx scripts/mesin-terjemah.ts --move        one-time move of the old D1 rows into R2 (then never again)
 *
 * Needs CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY; KEY_ENCRYPTION_SECRET unlocks the donated
 * AI key pool (read from R2, c/ai_key_pool/); without it the engine translates with gtx alone.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_LOCALES, ENGINE_TARGET_LANGS, LOCALE_SITE } from "../packages/shared/src/i18n";
import {
  loadPool,
  aiTranslateBatch,
  rotate,
  rankPool,
  poolSummary,
  PREFER_GTX,
  translateBatchesParallel,
  type PoolKey,
} from "./ai-translate";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { maskProtected, hashKey } from "./mt-key.mjs";
import { toGtxTokens, fromGtxTokens } from "./gtx-tokens";
import { echoIsFaithful } from "./echo-faithful";
import { R2S3, mapLimit } from "./lib/r2-s3";
import { MtStore } from "./lib/mt-store";

const ROOT = join(import.meta.dirname, "..");
const WORKER_CWD = join(ROOT, "apps", "worker-api");
const GTX_BASE = "https://translate.googleapis.com/translate_a/single";

/** Source languages of the corpus. Arabic is deliberately not one of them (guard 3). */
export const CORPUS_SOURCES = ["id", "en"] as const;
type Src = (typeof CORPUS_SOURCES)[number];

const MAX_SOURCE_CHARS = 20000;
/** One segment sent to a translator at most this long; longer paragraphs are split at sentence ends. */
const SEGMENT_CHARS = 3500;
const CHECKPOINT_EVERY = 2000;

export const STATE_KEY = "mt/_state.json";
export const corpusKey = (src: string) => `mt/_corpus/${src}.json`;

export interface Coverage {
  done: number;
  total: number;
  rev: number;
  at: string;
}
export interface EngineState {
  v: 1;
  /** Bumped whenever the corpus grows, so a language measured at an older revision is measured again. */
  corpusRev: number;
  corpusSize: Record<string, number>;
  coverage: Record<string, Coverage>;
  moved?: {
    mtCache?: { at: string; pairs: Record<string, number>; verified: boolean };
    corpus?: { at: string; id: number; en: number };
  };
  lastRun?: { at: string; translated: number; rejected: Record<string, number>; langs: string[]; engine: string };
}

const emptyState = (): EngineState => ({ v: 1, corpusRev: 0, corpusSize: {}, coverage: {}, moved: {} });

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The guards (pure, exercised by scripts/check-mesin-terjemah.ts)
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

const ARABIC_CHAR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const PLACEHOLDER = /@@\s*\d+\s*@@/g;

/** The sorted placeholder list of a text — two texts carry the same masked material iff these are equal. */
export function placeholders(s: string): string {
  return (s.match(PLACEHOLDER) ?? []).map((p) => p.replace(/\s+/g, "")).sort().join(",");
}

export interface Prepared {
  /** What is sent to the translator. */
  masked: string;
  /** What to put back (empty when the text arrived already masked by the Worker). */
  map: string[];
  /** The text arrived with @@n@@ already in it (a Worker-masked story paragraph): store it masked. */
  premasked: boolean;
}

export function prepare(text: string): Prepared {
  if (/@@\d+@@/.test(text)) return { masked: text, map: [], premasked: true };
  const { masked, map } = maskProtected(text) as { masked: string; map: string[] };
  return { masked, map, premasked: false };
}

export function restore(text: string, p: Prepared): string {
  if (p.premasked) return text;
  return text.replace(/@@\s*(\d+)\s*@@/g, (_, d) => p.map[Number(d)] ?? "");
}

/** Why an answer is refused, or null when it may be stored. */
export function rejectReason(srcMasked: string, out: string | null | undefined): string | null {
  if (!out || !out.trim()) return "empty";
  if (placeholders(srcMasked) !== placeholders(out)) return "placeholder";
  // Arabic left in the answer that was not in the (masked) source = the model wrote scripture of its own.
  if (ARABIC_CHAR.test(out.replace(PLACEHOLDER, "")) && !ARABIC_CHAR.test(srcMasked.replace(PLACEHOLDER, ""))) return "arabic-invented";
  if (out.trim() === srcMasked.trim() && !echoIsFaithful(srcMasked)) return "echo";
  const a = srcMasked.replace(PLACEHOLDER, "").length;
  const b = out.replace(PLACEHOLDER, "").length;
  if (a >= 60 && (b < a * 0.12 || b > a * 5)) return "length";
  return null;
}

/**
 * Split a text into the pieces a translator receives, keeping every separator so the answer can be put back
 * together with the same line breaks. Lines are never merged (a translator flattens a newline inside an item),
 * and a line longer than SEGMENT_CHARS is cut at sentence ends.
 */
export function segment(text: string): { parts: string[]; seps: string[] } {
  const pieces = text.split(/(\n+)/);
  const parts: string[] = [];
  const seps: string[] = [];
  for (let i = 0; i < pieces.length; i += 2) {
    const line = pieces[i] ?? "";
    const sep = pieces[i + 1] ?? "";
    if (line.length <= SEGMENT_CHARS) {
      parts.push(line);
      seps.push(sep);
      continue;
    }
    const sentences = line.split(/(?<=[.!?؟。！？])\s+/);
    let cur = "";
    const chunks: string[] = [];
    for (const s of sentences) {
      if (cur && cur.length + 1 + s.length > SEGMENT_CHARS) {
        chunks.push(cur);
        cur = s;
      } else cur = cur ? `${cur} ${s}` : s;
    }
    if (cur) chunks.push(cur);
    chunks.forEach((c, j) => {
      parts.push(c);
      seps.push(j === chunks.length - 1 ? sep : " ");
    });
  }
  return { parts, seps };
}

export function joinSegments(parts: string[], seps: string[]): string {
  return parts.map((p, i) => p + (seps[i] ?? "")).join("");
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Translators
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

const toGoogleLang = (code: string): string => (code === "zh" ? "zh-CN" : code);
const upstream = { poolTried: 0, poolAnswered: 0, gtxTried: 0, gtxAnswered: 0 };

async function gtx(text: string, tl: string, sl: string): Promise<string | null> {
  const url = `${GTX_BASE}?client=gtx&sl=${toGoogleLang(sl)}&tl=${toGoogleLang(tl)}&dt=t&q=${encodeURIComponent(toGtxTokens(text))}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; translation-engine/2.0)" } });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const out = (data[0] as unknown[]).map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : "")).join("");
    return fromGtxTokens(out).trim() || null;
  } catch {
    return null;
  }
}

async function gtxBatch(texts: string[], tl: string, sl: string): Promise<(string | null)[]> {
  const joined = texts.join("\n");
  if (joined.length <= 4500) {
    const out = await gtx(joined, tl, sl);
    if (out) {
      const parts = out.split("\n");
      if (parts.length === texts.length) return parts.map((s) => s.trim() || null);
    }
  }
  const res: (string | null)[] = [];
  for (const t of texts) res.push(await gtx(t, tl, sl));
  return res;
}

async function translateBatch(pool: PoolKey[], texts: string[], tl: string, sl: string): Promise<(string | null)[]> {
  if (pool.length > 0 && !PREFER_GTX.has(tl)) {
    upstream.poolTried++;
    const ai = await aiTranslateBatch(pool, texts, tl, sl);
    rotate(pool);
    if (ai) {
      upstream.poolAnswered++;
      return ai;
    }
  }
  upstream.gtxTried++;
  const out = await gtxBatch(texts, tl, sl);
  if (out.some((v) => v)) upstream.gtxAnswered++;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Corpus, wants, key pool
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

async function loadCorpus(r2: R2S3): Promise<Record<Src, Record<string, string>>> {
  const out = {} as Record<Src, Record<string, string>>;
  for (const src of CORPUS_SOURCES) out[src] = (await r2.getJson<Record<string, string>>(corpusKey(src)))?.value ?? {};
  return out;
}

/** Fold the Worker's wants into the corpus. Returns how many new texts arrived. */
export async function foldWants(r2: R2S3, dry: boolean): Promise<{ added: number; droppedArabic: number }> {
  const keys = await r2.list("mt-want/");
  const bySrc = new Map<string, { key: string; hash: string }[]>();
  let droppedArabic = 0;
  for (const k of keys) {
    const m = /^mt-want\/([a-z]{2})\/([0-9a-z]+)\.txt$/.exec(k);
    if (!m) continue;
    if (!(CORPUS_SOURCES as readonly string[]).includes(m[1]!)) {
      droppedArabic++; // guard 3: Arabic-source text is not machine-translated
      if (!dry) await r2.delete(k);
      continue;
    }
    const list = bySrc.get(m[1]!) ?? [];
    list.push({ key: k, hash: m[2]! });
    bySrc.set(m[1]!, list);
  }
  let added = 0;
  for (const [src, list] of bySrc) {
    const texts = new Map<string, string>();
    await mapLimit(list, 32, async ({ key, hash }) => {
      const o = await r2.get(key);
      const t = o?.body.trim();
      // The Worker names the object by the hash of the exact text — refuse anything that does not match.
      if (t && t.length <= MAX_SOURCE_CHARS && hashKey(t) === hash) texts.set(hash, t);
    });
    if (!dry && texts.size) {
      await r2.updateJson<Record<string, string>>(corpusKey(src), (cur) => {
        const next = { ...(cur ?? {}) };
        let n = 0;
        for (const [h, t] of texts) if (!next[h]) (next[h] = t), n++;
        added += n;
        return n ? next : null;
      });
    }
    if (!dry) await mapLimit(list, 32, ({ key }) => r2.delete(key));
  }
  return { added, droppedArabic };
}

async function loadKeyPool(r2: R2S3): Promise<PoolKey[]> {
  const secret = process.env.KEY_ENCRYPTION_SECRET;
  if (!secret) {
    console.log("AI pool: KEY_ENCRYPTION_SECRET not set — translating with gtx alone.");
    return [];
  }
  const keys = (await r2.list("c/ai_key_pool/")).filter((k) => k.endsWith(".json"));
  const rows: { id: number; provider: string; key_ref: string; key_iv: string; status: string }[] = [];
  await mapLimit(keys, 32, async (k) => {
    const doc = (await r2.getJson<{ id: number; provider: string; key_ref: string; key_iv: string; status: string }>(k))?.value;
    if (doc && ["active", "slow", "rate_limited"].includes(doc.status)) rows.push(doc);
  });
  rows.sort((a, b) => a.id - b.id);
  const pool = rankPool(await loadPool(rows, secret));
  console.log(
    pool.length
      ? `AI pool: ${pool.length} usable key(s) of ${keys.length} in R2 — ${poolSummary(pool)}. gtx is the fallback.`
      : `AI pool: ${keys.length} key(s) in R2, none callable by the translator — gtx for the whole run.`
  );
  return pool;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// One language
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

const rejected: Record<string, number> = { empty: 0, placeholder: 0, "arabic-invented": 0, echo: 0, length: 0 };

interface Item {
  key: string;
  prep: Prepared;
  parts: string[];
  seps: string[];
  outs: (string | null)[];
}

function measure(store: MtStore, corpus: Record<Src, Record<string, string>>, lang: string): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const src of CORPUS_SOURCES) {
    if (src === lang) continue;
    for (const h of Object.keys(corpus[src])) {
      total++;
      if (store.has(`mt:${src}-${lang}:${h}`)) done++;
    }
  }
  return { done, total };
}

async function warmLanguage(
  store: MtStore,
  pool: PoolKey[],
  corpus: Record<Src, Record<string, string>>,
  lang: string,
  outOfTime: () => boolean,
  dry: boolean
): Promise<number> {
  let translated = 0;
  for (const src of CORPUS_SOURCES) {
    if (src === lang) continue;
    await store.loadPair(`${src}-${lang}`);
    const todo: Item[] = [];
    for (const [h, text] of Object.entries(corpus[src])) {
      const key = `mt:${src}-${lang}:${h}`;
      if (store.has(key)) continue;
      const prep = prepare(text);
      // Text that is nothing but masked material (an ayah on its own, a bare name) is already "translated":
      // it is reproduced as it is, which is exactly what the reader must see.
      if (/^(\s*@@\d+@@\s*)+$/.test(prep.masked)) {
        if (!dry) store.stage(key, prep.premasked ? prep.masked : text);
        translated++;
        continue;
      }
      const { parts, seps } = segment(prep.masked);
      todo.push({ key, prep, parts, seps, outs: new Array(parts.length).fill(null) });
    }
    if (todo.length === 0) continue;
    console.log(`  ${src}→${lang}: ${todo.length} text(s) to translate`);

    // Process in slices so a long language banks its work as it goes.
    for (let s = 0; s < todo.length; s += 400) {
      if (outOfTime()) break;
      const slice = todo.slice(s, s + 400);
      // Flatten segments into batches of ≤40 items / ≤4,000 chars; empty segments are kept as they are.
      const refs: { item: Item; part: number }[] = [];
      for (const it of slice) it.parts.forEach((p, i) => (p.trim() ? refs.push({ item: it, part: i }) : (it.outs[i] = p)));
      const batches: { item: Item; part: number }[][] = [];
      let cur: { item: Item; part: number }[] = [];
      let bytes = 0;
      for (const r of refs) {
        const len = r.item.parts[r.part]!.length;
        if (cur.length && (cur.length >= 40 || bytes + len > 4000)) {
          batches.push(cur);
          cur = [];
          bytes = 0;
        }
        cur.push(r);
        bytes += len + 1;
      }
      if (cur.length) batches.push(cur);
      const texts = batches.map((b) => b.map((r) => r.item.parts[r.part]!));
      const results = await translateBatchesParallel(pool, texts, lang, src, (sl, batch) => translateBatch(sl, batch, lang, src));
      batches.forEach((b, bi) =>
        b.forEach((r, k) => {
          const out = results[bi]?.[k] ?? null;
          const why = rejectReason(r.item.parts[r.part]!, out);
          if (why) rejected[why] = (rejected[why] ?? 0) + 1;
          else r.item.outs[r.part] = out!.trim();
        })
      );
      for (const it of slice) {
        if (it.outs.some((o) => o === null)) continue; // one refused piece = the whole text waits for the next pass
        const whole = restore(joinSegments(it.outs as string[], it.seps), it.prep);
        if (!dry) store.stage(it.key, whole);
        translated++;
      }
      if (!dry && store.stagedCount >= CHECKPOINT_EVERY) await store.flush();
    }
    if (!dry) await store.flush();
    if (outOfTime()) break;
  }
  return translated;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Hand-written translations (packages/db-schema/seed/translations/*.sql)
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Translations a person wrote, replacing machine output that was wrong in ways that matter ("HR." came back as
 * "recursos humanos" on Spanish hadith titles). They used to be written into D1 on every deploy; now every pass
 * puts them into R2 with `replace`, so a person's translation always wins over the machine's — and, being
 * conditional writes of identical values, costs nothing once they are there.
 */
export function handWritten(dir = join(ROOT, "packages", "db-schema", "seed", "translations")): Map<string, string> {
  const out = new Map<string, string>();
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    return out;
  }
  const row = /\('((?:[^']|'')*)','((?:[^']|'')*)'\)/g;
  for (const f of files) {
    const sql = readFileSync(join(dir, f), "utf8");
    for (const m of sql.matchAll(row)) {
      const k = m[1]!.replace(/''/g, "'");
      const v = m[2]!.replace(/''/g, "'");
      if (/^mt:[a-z]{2}-[a-z]{2}:[0-9a-z]+$/.test(k) && v.trim()) out.set(k, v);
    }
  }
  return out;
}

async function applyHandWritten(store: MtStore, dry: boolean): Promise<number> {
  const rows = handWritten();
  const pairs = new Set([...rows.keys()].map((k) => k.slice(3, 8)));
  for (const pair of pairs) await store.loadPair(pair);
  let changed = 0;
  for (const [k, v] of rows) {
    if (store.get(k) === v) continue;
    changed++;
    if (!dry) store.stage(k, v, true);
  }
  if (!dry) await store.flush();
  for (const pair of pairs) store.forget(pair);
  return changed;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The one-time move out of D1
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

function wrangler(argv: string[]): string {
  for (let i = 0; i < 5; i++) {
    try {
      return execFileSync("npx", ["wrangler", ...argv], {
        cwd: WORKER_CWD,
        stdio: ["ignore", "pipe", "inherit"],
        encoding: "utf8",
        maxBuffer: 512 * 1024 * 1024,
      });
    } catch (err) {
      if (i === 4) throw err;
      execFileSync("sleep", [String(3 * 2 ** i)]);
    }
  }
  return "";
}

/** Read-only query against the legacy database — used by `--move` and nowhere else. */
function legacyRead<T>(sql: string): T[] {
  const out = wrangler(["d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`]);
  const parsed = JSON.parse(out) as unknown;
  const results = Array.isArray(parsed) ? (parsed[0] as { results?: T[] })?.results : (parsed as { results?: T[] })?.results;
  return results ?? [];
}

// Which legacy text columns are the site's own writing (the same selection the old warm job used).
const TABLE_DENY = new Set([
  "translation", "tafsir", "asbabun_nuzul", "ayah", "surah", "hadits", "hadith_collections",
  "qori", "voice_persona", "license_sources", "mt_cache", "pes_i18n", "pes_i18n_meta",
  "generation_jobs", "scaling_metrics", "audio_transcript_sync", "ayah_hadits_map",
  "site_media", "app_installs", "ad_events", "ad_config", "donors", "certificates",
  "grants", "admin_audit_log", "d1_migrations", "ai_key_pool", "key_validation_log",
]);
const TABLE_DENY_RE = /^(sqlite_|_cf_|d1_|analytics_|admin_|session|auth_|live_|device_|pageview|site_pageviews|world_|channel|video_)/i;
const BARE_CONTENT = new Set([
  "name", "title", "body", "summary", "description", "desc", "translation", "note", "moral",
  "matn", "caption", "subtitle", "excerpt", "content", "question", "answer", "headline", "tagline",
  "label", "intro", "outro", "verse", "meaning", "wisdom", "lesson",
]);
const COL_DENY = new Set([
  "slug", "source", "grade", "motif", "age_range", "status", "gender", "tts_engine", "provider",
  "kind", "type", "category_slug", "full_story_slug", "series_key", "collection", "icon", "color",
  "narrator", "author", "email", "url", "path", "lang", "code", "key", "hash", "token",
]);

function legacyCorpus(): { id: Record<string, string>; en: Record<string, string> } {
  const id: Record<string, string> = {};
  const en: Record<string, string> = {};
  const tables = legacyRead<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table';").map((r) => r.name);
  for (const table of tables) {
    if (TABLE_DENY.has(table) || TABLE_DENY_RE.test(table)) continue;
    const allCols = legacyRead<{ name: string; type: string }>(`PRAGMA table_info("${table}");`);
    const hasLang = allCols.some((c) => c.name.toLowerCase() === "lang");
    const cols = allCols
      .filter((c) => {
        if (!(/char|clob|text/i.test(c.type) || c.type === "")) return false;
        const nm = c.name.toLowerCase();
        return !COL_DENY.has(nm) && (nm.endsWith("_id") || BARE_CONTENT.has(nm));
      })
      .map((c) => c.name);
    if (!cols.length) continue;
    const where = hasLang ? " WHERE lang = 'id'" : "";
    for (let off = 0; ; off += 2000) {
      const rows = legacyRead<Record<string, unknown>>(`SELECT ${cols.map((c) => `"${c}"`).join(",")} FROM "${table}"${where} LIMIT 2000 OFFSET ${off};`);
      for (const row of rows)
        for (const c of cols) {
          const t = typeof row[c] === "string" ? (row[c] as string).trim() : "";
          if (t.length > 1 && t.length <= MAX_SOURCE_CHARS) id[hashKey(t)] = t;
        }
      if (rows.length < 2000) break;
    }
  }
  // English story paragraphs, keyed the way the Worker keys them (masked — mt-key.mjs storyKey).
  for (let off = 0; ; off += 200) {
    const rows = legacyRead<{ title: string; body: string }>(
      `SELECT title, body FROM stories WHERE lang = 'en' AND status = 'published' AND body IS NOT NULL AND body <> '' ORDER BY id LIMIT 200 OFFSET ${off};`
    );
    for (const r of rows)
      for (const raw of [r.title, ...String(r.body).split(/\n\s*\n/)]) {
        const masked = (maskProtected(String(raw ?? "")) as { masked: string }).masked.trim();
        if (masked.length < 2 || /^(@@\d+@@\s*)+$/.test(masked) || masked.length > MAX_SOURCE_CHARS) continue;
        en[hashKey(masked)] = masked;
      }
    if (rows.length < 200) break;
  }
  return { id, en };
}

async function moveOutOfD1(r2: R2S3, store: MtStore, dry: boolean): Promise<void> {
  const state = (await r2.getJson<EngineState>(STATE_KEY))?.value ?? emptyState();
  if (state.moved?.mtCache?.verified && state.moved?.corpus && !process.argv.includes("--force")) {
    console.log(`Already moved on ${state.moved.mtCache.at}; D1 is not read again. (--force to repeat)`);
    return;
  }

  // 1. The corpus.
  const { id, en } = legacyCorpus();
  console.log(`Corpus from the legacy tables: ${Object.keys(id).length} id text(s), ${Object.keys(en).length} en paragraph(s).`);
  if (!dry) {
    for (const [src, texts] of [["id", id], ["en", en]] as const) {
      await r2.updateJson<Record<string, string>>(corpusKey(src), (cur) => {
        const next = { ...(cur ?? {}) };
        let n = 0;
        for (const [h, t] of Object.entries(texts)) if (!next[h]) (next[h] = t), n++;
        return n ? next : null;
      });
    }
  }

  // 2. Every translation row, pair by pair, then read back from R2 and compared one by one.
  const pairs = legacyRead<{ pair: string; n: number }>(
    "SELECT substr(k,4,5) AS pair, COUNT(*) AS n FROM mt_cache WHERE k LIKE 'mt:__-__:%' GROUP BY pair ORDER BY n DESC;"
  ).filter((r) => /^[a-z]{2}-[a-z]{2}$/.test(r.pair));
  const moved: Record<string, number> = {};
  let allVerified = true;
  for (const { pair, n } of pairs) {
    const rows: { k: string; v: string }[] = [];
    for (let off = 0; ; off += 5000) {
      const page = legacyRead<{ k: string; v: string }>(
        `SELECT k, v FROM mt_cache WHERE k LIKE 'mt:${pair}:%' ORDER BY k LIMIT 5000 OFFSET ${off};`
      );
      rows.push(...page);
      if (page.length < 5000) break;
    }
    const good = rows.filter((r) => typeof r.v === "string" && r.v.trim() && /^mt:[a-z]{2}-[a-z]{2}:[0-9a-z]+$/.test(r.k));
    await store.loadPair(pair);
    for (const r of good) store.stage(r.k, r.v, true); // same key, the legacy value
    if (dry) {
      console.log(`  --dry ${pair}: ${good.length} row(s) would be copied`);
      continue;
    }
    await store.flush();
    store.forget(pair);
    await store.loadPair(pair);
    const missing = good.filter((r) => store.get(r.k) !== r.v).length;
    console.log(`  ${pair}: ${good.length}/${n} row(s) copied, ${missing ? `${missing} DID NOT ARRIVE` : "every row verified"}`);
    if (missing) allVerified = false;
    moved[pair] = good.length;
  }
  if (dry) return;
  await r2.updateJson<EngineState>(STATE_KEY, (cur) => {
    const s = cur ?? emptyState();
    s.moved = {
      ...(s.moved ?? {}),
      mtCache: { at: new Date().toISOString(), pairs: moved, verified: allVerified },
      corpus: { at: new Date().toISOString(), id: Object.keys(id).length, en: Object.keys(en).length },
    };
    s.corpusRev = (s.corpusRev ?? 0) + 1;
    return s;
  });
  console.log(allVerified ? "MOVE_VERIFIED=1" : "MOVE_VERIFIED=0");
  if (!allVerified) process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

/** The order the languages are worked in: the sites with readers today first, then the least complete. */
export function order(langs: string[], coverage: Record<string, Coverage>): string[] {
  const pct = (l: string) => {
    const c = coverage[l];
    return c && c.total ? c.done / c.total : 0;
  };
  const live = (l: string) => l === "id" || Boolean(LOCALE_SITE[l]);
  return [...langs].sort((a, b) => Number(live(b)) - Number(live(a)) || pct(a) - pct(b) || a.localeCompare(b));
}

/** scripts/locale-content.json — what the readiness table and the admin portal read. */
function writeContentFile(state: EngineState): void {
  const file = join(ROOT, "scripts", "locale-content.json");
  const langs: Record<string, { done: number; total: number }> = {};
  for (const l of ENGINE_TARGET_LANGS) {
    const c = state.coverage[l];
    langs[l] = { done: c?.done ?? 0, total: c?.total ?? 0 };
  }
  const prev = (() => {
    try {
      return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    } catch {
      return {};
    }
  })();
  const out = {
    _comment:
      "Content coverage per language, MEASURED by the translation engine (scripts/mesin-terjemah.ts): of every text in the R2 corpus (mt/_corpus/<src>.json) whose source language differs from the target, how many have a stored translation in R2. done/total, never an estimate and never relative to another language. Indonesian is the language the site is written in and Arabic is the Qur'an and hadith themselves, so neither is a target.",
    _measuredAt: new Date().toISOString().slice(0, 10),
    _sourceLanguages: ["id", "ar"],
    corpus: state.corpusSize,
    langs,
  };
  if (JSON.stringify({ ...prev, _measuredAt: "" }) !== JSON.stringify({ ...out, _measuredAt: "" })) {
    writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  }
}

function args() {
  const a = Object.fromEntries(
    process.argv.slice(2).map((x) => {
      const [k, v] = x.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  const minutes = a.minutes !== undefined && Number.isFinite(Number(a.minutes)) ? Number(a.minutes) : 240;
  return {
    move: a.move === "true",
    dry: a.dry === "true",
    minutes,
    langs: String(a.langs ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((l) => ENGINE_TARGET_LANGS.includes(l)),
  };
}

async function main() {
  const opt = args();
  const r2 = R2S3.fromEnv();
  if (!r2) {
    console.error("CLOUDFLARE_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY are required — the engine stores in R2 only.");
    process.exit(1);
  }
  const store = new MtStore(r2);
  if (opt.move) return moveOutOfD1(r2, store, opt.dry);

  const started = Date.now();
  let stopped = false;
  const outOfTime = () => {
    if (!stopped && Date.now() - started > opt.minutes * 60_000) {
      stopped = true;
      console.log(`Time budget (${opt.minutes} min) reached — banking what is done; the next pass resumes here.`);
    }
    return stopped;
  };

  const hand = await applyHandWritten(store, opt.dry);
  console.log(`Hand-written translations: ${handWritten().size} on file, ${hand} (re)applied to R2.`);
  const wants = await foldWants(r2, opt.dry);
  if (wants.added || wants.droppedArabic) console.log(`Wants: ${wants.added} new text(s) joined the corpus, ${wants.droppedArabic} Arabic-source refused.`);
  const corpus = await loadCorpus(r2);
  const sizes = Object.fromEntries(CORPUS_SOURCES.map((s) => [s, Object.keys(corpus[s]).length]));
  console.log(`Corpus: ${CORPUS_SOURCES.map((s) => `${s} ${sizes[s]}`).join(", ")}.`);

  let state = (await r2.getJson<EngineState>(STATE_KEY))?.value ?? emptyState();
  const grew = CORPUS_SOURCES.some((s) => (state.corpusSize[s] ?? 0) !== sizes[s]);
  const rev = grew ? (state.corpusRev ?? 0) + 1 : state.corpusRev ?? 0;

  const pool = opt.dry ? [] : await loadKeyPool(r2);
  const queue = order(opt.langs.length ? opt.langs : [...ENGINE_TARGET_LANGS], state.coverage);
  const measured: Record<string, Coverage> = {};
  let translated = 0;
  const worked: string[] = [];
  for (const lang of queue) {
    const prev = state.coverage[lang];
    if (prev && prev.rev === rev && prev.total > 0 && prev.done >= prev.total) continue; // finished, corpus unchanged
    if (outOfTime()) break;
    worked.push(lang);
    const n = await warmLanguage(store, pool, corpus, lang, outOfTime, opt.dry);
    translated += n;
    const m = measure(store, corpus, lang);
    measured[lang] = { ...m, rev, at: new Date().toISOString() };
    console.log(`  ${lang}: +${n} → ${m.done}/${m.total} (${m.total ? ((m.done / m.total) * 100).toFixed(1) : "0"}%)`);
    // Free the pair from memory: the next language reads its own shards.
    for (const src of CORPUS_SOURCES) store.forget(`${src}-${lang}`);
  }

  if (!opt.dry) {
    state = (await r2.updateJson<EngineState>(STATE_KEY, (cur) => {
      const s = cur ?? emptyState();
      s.corpusRev = Math.max(s.corpusRev ?? 0, rev);
      s.corpusSize = sizes;
      s.coverage = { ...s.coverage, ...measured };
      s.lastRun = {
        at: new Date().toISOString(),
        translated,
        rejected: { ...rejected },
        langs: worked,
        engine: pool.length ? `AI pool (${pool.length}) + gtx` : "gtx",
      };
      return s;
    }))!;
    writeContentFile(state);
  }

  const remaining = order(
    [...ENGINE_TARGET_LANGS].filter((l) => {
      const c = state.coverage[l];
      return !(c && c.rev === rev && c.total > 0 && c.done >= c.total);
    }),
    state.coverage
  );
  const summary = [
    `Translated ${translated} text(s) into ${worked.join(", ") || "—"}; written ${store.written} across ${store.shardsWritten} shard(s) (${store.conflicts} CAS retries).`,
    `Refused: ${Object.entries(rejected).map(([k, v]) => `${k} ${v}`).join(", ")}.`,
    `Upstream: pool ${upstream.poolAnswered}/${upstream.poolTried}, gtx ${upstream.gtxAnswered}/${upstream.gtxTried}.`,
    `Not yet 100%: ${remaining.map((l) => { const c = state.coverage[l]; return `${l} ${c && c.total ? ((c.done / c.total) * 100).toFixed(1) : "0"}%`; }).join(", ") || "none — every language is complete"}.`,
  ];
  for (const line of summary) console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Mesin penerjemah\n\n${summary.map((s) => `- ${s}`).join("\n")}\n`);
  console.log(`WARM_TRANSLATED=${translated}`);
  console.log(`WARM_NEXT=${remaining.join(",")}`);
}

// Not `await main()`: tsx compiles scripts to CommonJS, which has no top-level await (check-script-entrypoints).
if (process.argv[1] && /(^|[\\/])mesin-terjemah\.ts$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
// Locale labels, kept here so the summary can name a language; also keeps ALL_LOCALES referenced for the check.
export const LANG_LABEL = Object.fromEntries(ALL_LOCALES.map((l) => [l.code, l.label]));
