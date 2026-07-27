/**
 * Pre-warms the machine-translation KV cache for the short taxonomy strings the
 * sibling sites render — category names and the kisah "tokoh" person index
 * (name + honorific). Runs in GitHub Actions, NOT in the Worker.
 *
 * Why this exists: the Worker translates on demand via Google's free gtx
 * endpoint, but Google routinely blocks Cloudflare's datacenter IPs, so those
 * runtime calls return null and the code falls back to the Indonesian source —
 * which is why dawa.es/kisah showed "Kisah Para Nabi", "Nabi Adam", "Manusia &
 * Nabi Pertama" untranslated. A GitHub Actions runner is NOT blocked, so it can
 * translate every string once and write the result into the SAME cache the
 * Worker reads — the D1 `mt_cache` table (migration 0046), keyed
 * `mt:<src>-<tgt>:<hashKey(text)>`. (It used to write KV, whose 1,000/day free
 * write cap silently dropped everything — the real reason the sibling sites
 * stayed Indonesian.) After a run, the Worker serves the cached translation
 * with no upstream call. Idempotent INSERT ... ON CONFLICT, safe to run daily.
 *
 * Usage: npx tsx scripts/warm-mt-cache.ts [--langs=en,fr,de,es] [--behind] [--dry]
 *
 *   --behind  spend the whole run on the languages that are switched off.
 *   --one     warm exactly ONE language this run, the neediest in priority
 *             order, and print which. The workflow chains to the next.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LOCALE_SITE } from "../packages/shared/src/i18n";
import {
  loadPool, aiTranslateBatch, rotate, rankPool, poolSummary, PREFER_GTX,
  translateBatchesParallel, concurrencyFor, type PoolKey,
} from "./ai-translate";
// The Worker's own masking, replicated. Hides Arabic script and protected names
// behind @@n@@ before anything is translated, so a hadith's matn is never sent
// to a translator and comes back exactly as it went in.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { maskProtected } from "./mt-key.mjs";
// Sentinel transport for gtx — see gtx-tokens.ts for why the @@n@@ format
// itself cannot change.
import { toGtxTokens, fromGtxTokens } from "./gtx-tokens.js";
// When an unchanged answer is a faithful translation rather than a refusal.
// Strict on purpose — see echo-faithful.ts. Never used on the Arabic phase.
import { echoIsFaithful } from "./echo-faithful.js";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const GTX_BASE = "https://translate.googleapis.com/translate_a/single";

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    // Every non-Indonesian ecosystem language: the four domain sibling sites
    // (en/de/es/fr) plus every language served on ulyah.com itself. Content is
    // translated + cached in D1 per language ("D1 kumplit dulu perbahasa").
    langs: (
      (args.langs as string) ||
      "en,de,es,fr,ru,ar,zh,ja,ur,hi,bn,tr,fa,ms,sw,pt,nl,it,ta,ha,ps,th,ko,vi,uz,so,pl"
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    dry: args.dry === "true",
    behind: args.behind === "true",
    one: args.one === "true",
    // Minutes of translating before the run stops and writes what it has.
    // Written the long way because `Number(x) || 240` turns an explicit 0 into
    // 240 — and 0 is the value that makes the budget testable at all.
    minutes:
      args.minutes !== undefined && Number.isFinite(Number(args.minutes)) && Number(args.minutes) >= 0
        ? Number(args.minutes)
        : 240,
  };
}

/**
 * Everything translated is held in memory and written to D1 in one phase at the
 * END of the run. That is fine until the run does not reach the end: GitHub
 * kills a job at six hours, and a killed job takes every translation still in
 * memory with it — the same "hours of work, discarded at the last step" this
 * script was already fixed for once, arriving by a different road.
 *
 * gtx answered fast enough that six hours was mostly theoretical. A model round
 * trip is seconds, so it stopped being theoretical the moment the pool went in
 * front of gtx. The deadline stops translating at four hours and proceeds to the
 * write, so a long pass banks its work; the chain then starts the next pass and
 * the skip-cached filter means it resumes exactly where this one stopped.
 *
 * Four hours, not five and a half: the write itself, the readiness re-measure
 * and the commit all happen after this, and they need room.
 */
/**
 * How many translations may sit in memory before they are written to D1.
 *
 * Owner: "save kerjaan ke d1 biar ga mulai dari awal". Before this, the run
 * translated for hours and wrote once, at the very end — so anything that
 * stopped the run early (a kill at GitHub's six-hour cap, a crash, a cancelled
 * workflow) threw away everything it had earned, and the next pass began at
 * zero. Now the run banks its work every 2,000 translations, and because the
 * skip-cached filter reads what is already in D1, the next pass starts from the
 * last checkpoint rather than from the beginning.
 *
 * 2,000 rows is roughly one wrangler invocation's worth of statements — small
 * enough that little is ever at risk, large enough that the write does not
 * become the thing the run spends its time on.
 */
const CHECKPOINT_EVERY = 2000;

/** Running totals across every checkpoint, reported once at the end. */
const totals = { wrote: 0, oversize: 0, failedFiles: 0, checkpoints: 0 };

/**
 * Write staged translations into the D1 `mt_cache` table the Worker reads
 * (migration 0046), NOT KV. KV's free plan caps writes at 1,000/day — that cap
 * silently dropped EVERY translation and is exactly why the sibling sites
 * stayed Indonesian for days. D1 has no such daily write cap.
 * INSERT … ON CONFLICT keeps it idempotent, which is what makes calling this
 * repeatedly mid-run safe.
 *
 * EMPTIES `pairs` in place: the caller keeps translating into the same array,
 * and nothing already written should be written twice.
 */
function writePairs(pairs: { key: string; value: string }[], dry: boolean): void {
  if (pairs.length === 0) return;
  if (dry) {
    console.log(`  --dry: ${pairs.length} row(s) would be written.`);
    pairs.length = 0;
    return;
  }
  const esc = (s: string) => s.replace(/'/g, "''");
  const dir = mkdtempSync(join(tmpdir(), "mtwarm-"));
  // D1 caps a SINGLE statement at ~100KB (SQLITE_TOOBIG), and story bodies /
  // summaries are long — so pack value tuples into an INSERT by BYTE budget
  // (~40KB), not by a fixed row count, then start a fresh statement. Many
  // statements go into one file (wrangler runs them all sequentially); the
  // file is flushed every 40 statements (~1.6MB) to keep each execute modest.
  const STMT_BUDGET = 40000;
  const stmtOf = (rows: string[]) =>
    `INSERT INTO mt_cache (k, v) VALUES ${rows.join(",")} ON CONFLICT(k) DO UPDATE SET v = excluded.v;`;
  try {
    let wrote = 0;
    let fileIdx = 0;
    let statements: string[] = [];
    let curRows: string[] = [];
    let curBytes = 0;
    const flushStmt = () => {
      if (curRows.length) {
        statements.push(stmtOf(curRows));
        curRows = [];
        curBytes = 0;
      }
    };
    const flushFile = () => {
      flushStmt();
      if (!statements.length) return;
      const file = join(dir, `mt-${fileIdx++}.sql`);
      writeFileSync(file, statements.join("\n"), "utf8");
      try {
        wrangler(["d1", "execute", "ulyah-db", "--remote", `--file=${file}`]);
      } catch (err) {
        // One bad batch must not throw away a whole run. This is what turned a
        // single oversized row into hours of lost work: the execute threw, main
        // rejected, and every translation still in flight went with it. Now the
        // batch is reported and the rest of the run continues.
        totals.failedFiles++;
        console.warn(`  batch failed to write: ${(err as Error).message.split("\n")[0]}`);
      }
      statements = [];
    };
    for (const p of pairs) {
      const tuple = `('${esc(p.key)}','${esc(p.value)}')`;
      // A tuple that cannot fit in ANY statement is dropped here rather than
      // being emitted alone and blowing past D1's ~100 KB statement cap. The
      // old code flushed and then pushed it anyway, which is exactly how
      // SQLITE_TOOBIG got in. Escaping can double the length, so the check is
      // on the escaped tuple, after escaping.
      if (tuple.length > STMT_BUDGET) {
        totals.oversize++;
        continue;
      }
      if (curBytes + tuple.length > STMT_BUDGET) flushStmt();
      curRows.push(tuple);
      curBytes += tuple.length + 1;
      wrote++;
      if (statements.length >= 40) flushFile();
    }
    flushFile();
    totals.wrote += wrote;
    totals.checkpoints++;
    console.log(`  ✓ saved to D1: ${wrote} row(s) this checkpoint, ${totals.wrote} total this run.`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    // Cleared even if the write failed. A checkpoint that could not be written
    // is reported and dropped rather than carried forward — retrying it every
    // checkpoint for the rest of the run would grow without bound, and the next
    // PASS will pick the same strings up again anyway, because they never
    // reached D1 and so never entered the skip-cached set.
    pairs.length = 0;
  }
}

const startedAt = Date.now();
let deadlineMs = 240 * 60_000;
let ranOutOfTime = false;
function outOfTime(): boolean {
  if (ranOutOfTime) return true;
  if (Date.now() - startedAt < deadlineMs) return false;
  ranOutOfTime = true;
  console.warn(
    `  time budget reached (${Math.round(deadlineMs / 60_000)} min) — stopping translation and writing what is done. ` +
      `The next pass resumes here; nothing is lost and nothing is re-translated.`
  );
  return true;
}

/**
 * The longest source string worth sending to the translator, and the reason the
 * warm job kept dying.
 *
 * Story bodies run to 625,896 characters. Two independent walls stand in front
 * of a string that size:
 *
 *   · Google's endpoint takes a few kilobytes per call. A 600 KB string was
 *     being sent as ONE call and simply failing.
 *   · D1 caps a single SQL statement at about 100 KB. An oversized value became
 *     its own oversized INSERT, which failed with SQLITE_TOOBIG — and because
 *     wrangler executes a whole file at once, that one row killed the entire
 *     batch and the run threw. Hours of successful translation, discarded at
 *     the last step. That is the "tidak selesai-selesai".
 *
 * 20,000 is drawn from evidence, not taste: the largest value that has EVER
 * landed in mt_cache is 17,868 characters. Everything above that has always
 * failed, so excluding it costs nothing that was ever working, and the counts
 * are printed rather than hidden — 1,210 story bodies sit above 40 KB and are
 * simply not warmable this way. Making them warmable needs chunked translation
 * with a matching lookup in the Worker, which is a different change.
 */
const MAX_SOURCE_CHARS = 20000;

/**
 * The languages --behind gives the whole run to: the ones that are switched
 * OFF, and still short of the corpus (owner: "khususnya bahasa-bahasa yang
 * sengaja dimatikan kerjain dulu sampai 100%").
 *
 * "Switched off" is not a guess from a percentage. A language is served on
 * ulyah.com only if it is finished; the four that have their OWN site —
 * en/fr/de/es — are never switched off, because choosing them leaves for that
 * domain. So the locked set is exactly: every target language that does not own
 * a domain. Twenty-two of them, and today they hold between 673 and 3,546
 * strings against French's 18,355 — around 4 to 19%.
 *
 * A picked-out ratio would have been wrong here: at 90% of the leader the set
 * would have swept in en (15,232), es (13,234) and de (9,057), which are the
 * sibling sites and are not what the owner asked for.
 *
 * PARITY is what "100%" means for a language: it holds as much of the corpus as
 * the best-covered language does. A locked language that reaches it drops out
 * of the priority set on the next run, and when they all have, the run goes
 * back to warming everything. Nothing to maintain by hand.
 */
const PARITY_RATIO = 0.99;

// EXACT copy of the Worker's cache-key hash (apps/worker-api/src/lib/mt.ts) —
// must stay byte-identical or the Worker won't find what we write.
function hashKey(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
const toGoogleLang = (code: string): string => (code === "zh" ? "zh-CN" : code);

function wrangler(argv: string[], capture = false): string {
  for (let i = 0; i < 5; i++) {
    try {
      return execFileSync("npx", ["wrangler", ...argv], {
        cwd: WORKER_CWD,
        stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
        encoding: "utf8",
        maxBuffer: 256 * 1024 * 1024,
      });
    } catch (err) {
      if (i === 4) throw err;
      execFileSync("sleep", [String(3 * 2 ** i)]);
    }
  }
  return "";
}

function d1Json<T>(sql: string): T[] {
  const out = wrangler(["d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`], true);
  try {
    const parsed = JSON.parse(out);
    const results = Array.isArray(parsed) ? parsed[0]?.results : parsed?.results;
    return (results ?? []) as T[];
  } catch {
    console.error("Could not parse d1 --json output");
    return [];
  }
}

async function gtx(text: string, tl: string, sl = "id"): Promise<string | null> {
  const url = `${GTX_BASE}?client=gtx&sl=${toGoogleLang(sl)}&tl=${toGoogleLang(tl)}&dt=t&q=${encodeURIComponent(toGtxTokens(text))}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ulyah.com/1.0)" } });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const out = (data[0] as unknown[]).map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : "")).join("");
    // Put our own markers back before anyone else sees the string: the caller's
    // sentinel count, the unmask and the stored value all speak @@n@@.
    return fromGtxTokens(out).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Translate one batch: the AI pool first, gtx if the pool cannot answer.
 *
 * The pool is tried first because it has 595 quotas instead of one and because
 * it has been told what the text is. gtx remains behind it so a run never stops
 * for want of a key — the worst case is the behaviour this job always had.
 */
async function translateBatch(
  pool: PoolKey[],
  texts: string[],
  tl: string,
  sl: string
): Promise<(string | null)[]> {
  // A language the pool is worse at goes straight to gtx — see PREFER_GTX.
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

/**
 * Which upstream actually answered, counted per batch.
 *
 * The three-way failure breakdown said "32191 came back empty (both the pool
 * and gtx refused)" for every single string — no echoes, no lost sentinels.
 * That is one fault, not three, but "both refused" still covers two very
 * different worlds: a key pool that cannot be used from this runner, and a
 * Google endpoint that has started refusing GitHub's IP ranges. The fix is not
 * the same in each case, so count them apart.
 */
const upstream = { poolTried: 0, poolAnswered: 0, gtxTried: 0, gtxAnswered: 0 };

/** Translate MANY short-ish texts in one gtx call via newline batching (gtx
 * preserves line breaks). Returns an array aligned to `texts`; on a segment
 * mismatch (MT occasionally eats a break) that whole batch is retried per-item
 * so a translation is never mis-paired to the wrong hadith. Used for the 30k+
 * hadith corpus, where one-call-per-string would take hours. */
async function gtxBatch(texts: string[], tl: string, sl: string): Promise<(string | null)[]> {
  // Newlines inside a source string would corrupt the split — flatten first.
  const flat = texts.map((t) => t.replace(/\s*\n\s*/g, " "));
  const joined = flat.join("\n");
  const out = await gtx(joined, tl, sl);
  if (out) {
    const parts = out.split("\n");
    if (parts.length === texts.length) return parts.map((s) => s.trim() || null);
  }
  // Fallback: translate each on its own (rare) so we never mis-assign.
  const res: (string | null)[] = [];
  for (const t of flat) res.push(await gtx(t, tl, sl));
  return res;
}

// Tables that must NOT be auto-scanned for Indonesian text: the Qur'an and
// tafsir already carry proper per-language rows (machine-translating scripture
// is both wrong and wasteful), and system/analytics/auth tables hold no
// visitor-facing prose. hadits is handled by the dedicated Arabic-source phase.
// Everything else is fair game, so a NEW content table added later is picked up
// automatically with no edit to this script.
const TABLE_DENY = new Set([
  "translation", "tafsir", "asbabun_nuzul", "ayah", "surah", "hadits", "hadith_collections",
  "qori", "voice_persona", "license_sources", "mt_cache", "pes_i18n", "pes_i18n_meta",
  "generation_jobs", "scaling_metrics", "audio_transcript_sync", "ayah_hadits_map",
  "site_media", "app_installs", "ad_events", "ad_config", "donors", "certificates",
  "grants", "admin_audit_log", "d1_migrations",
]);
const TABLE_DENY_RE = /^(sqlite_|_cf_|d1_|analytics_|admin_|session|auth_|live_|device_|pageview|site_pageviews|world_|channel|video_)/i;

// A TEXT column is visitor-facing content if it ends in the project's language
// suffix (_id = Indonesian, our authoring language) or is a well-known bare
// content column. Foreign-key "_id" columns are INTEGER, so the TEXT filter
// already excludes them. These names are never content even when TEXT.
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

/**
 * Schema-driven collector: every distinct Indonesian string across every
 * content table, discovered from the DB schema — so any new menu/feature whose
 * table follows the project's naming convention (`*_id` / name / title / body …)
 * is translated automatically, with no per-type edit here ("jangan dipisah-pisah
 * … apapun yang masuk langsung ditranslate"). Arabic-source hadith is warmed by
 * the dedicated phase in main(); English-source strings are handled on demand.
 */
function collectStrings(): string[] {
  const set = new Set<string>();
  const tables = d1Json<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table';"
  ).map((r) => r.name);

  for (const table of tables) {
    if (TABLE_DENY.has(table) || TABLE_DENY_RE.test(table)) continue;
    const allCols = d1Json<{ name: string; type: string }>(`PRAGMA table_info("${table}");`);
    const hasLang = allCols.some((c) => c.name.toLowerCase() === "lang");
    const cols = allCols
      .filter((c) => {
        const isText = /char|clob|text/i.test(c.type) || c.type === "";
        if (!isText) return false;
        const nm = c.name.toLowerCase();
        if (COL_DENY.has(nm)) return false;
        return nm.endsWith("_id") || BARE_CONTENT.has(nm);
      })
      .map((c) => c.name);
    if (!cols.length) continue;

    // If the table carries a per-row `lang`, only the Indonesian rows are
    // id-source (e.g. `stories` also holds en episodes) — translating an
    // English body as if it were Indonesian would just cache noise.
    const where = hasLang ? " WHERE lang = 'id'" : "";
    const colList = cols.map((c) => `"${c}"`).join(",");
    for (let off = 0; ; off += 2000) {
      let rows: Record<string, unknown>[];
      try {
        rows = d1Json<Record<string, unknown>>(`SELECT ${colList} FROM "${table}"${where} LIMIT 2000 OFFSET ${off};`);
      } catch {
        break; // table vanished / unreadable — skip rather than fail the whole run
      }
      if (rows.length === 0) break;
      for (const row of rows) {
        for (const c of cols) {
          const v = row[c];
          if (typeof v === "string") {
            const t = v.trim();
            if (t.length > 1) set.add(t);
          }
        }
      }
      if (rows.length < 2000) break;
    }
  }
  return [...set];
}

async function main() {
  const { langs, dry, behind, one, minutes } = parseArgs();
  deadlineMs = minutes * 60_000;

  // Ensure the cache table exists up front so the "already cached?" query below
  // works even on the very first run (before migration 0046 has been applied).
  if (!dry) {
    wrangler([
      "d1",
      "execute",
      "ulyah-db",
      "--remote",
      "--command=CREATE TABLE IF NOT EXISTS mt_cache (k TEXT PRIMARY KEY, v TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));",
    ]);
  }

  // The donated AI key pool — 595 active keys, taking turns (owner: "aktifkan
  // seluruh ai untuk menerjemahkan, seluruh AI saling menyambut klo limit").
  //
  // gtx is one anonymous bucket: when it rate-limits, the whole run waits and
  // there is nothing to hand the work to. The pool is 595 separate quotas, so a
  // spent key only moves the work along. It also knows what it is reading —
  // "sanad" and "radhiyallahu 'anhu" survive a model that has been told this is
  // Islamic scholarship, and do not survive a generic sentence translator.
  //
  // gtx stays as the fallback, so an empty or unreachable pool degrades to
  // exactly the old behaviour rather than to nothing.
  let pool: PoolKey[] = [];
  if (!dry && process.env.KEY_ENCRYPTION_SECRET) {
    // NO SCOPE FILTER, and that is the point.
    //
    // `scope` was filtering out almost the entire pool. The table holds 478
    // keys marked 'tts' — 241 google-ai-studio, 202 groq, 21 hf-inference, 12
    // openrouter — against 29 marked 'text'. Asking for scope='text' therefore
    // loaded 28 usable keys while the owner was told there were hundreds.
    //
    // Those 478 are not busy. Nothing in this repo consumes a tts-scoped key:
    // selectKeyForScope() is called in exactly two places (orchestra.ts and
    // scaling.ts) and both ask for 'text'. There is no tts chain in
    // CAPABILITY_CHAINS. And the bulk ingest script classifies a gsk_ key as
    // groq/text and an AIza key as google-ai-studio/text — so 'tts' is not even
    // what this project's own tooling would have written. The label is wrong,
    // and it has kept 443 perfectly good chat keys idle.
    //
    // The scope column is left alone rather than rewritten: a label is cheap to
    // ignore and expensive to lose, and a future server-side TTS feature may
    // want to know which keys were donated with that in mind. What decides
    // usability here is the provider — loadPool() keeps only providers this
    // translator can actually call, so a GPU runner or a Kaggle token is
    // dropped whatever its scope says.
    //
    // 'rate_limited' is included for the same reason: that status is a note
    // left by whatever last touched the key, and a daily quota has long since
    // reset. The translator has a live cooldown, so a key still limited costs
    // one call and steps aside — while excluding it on a stale label costs the
    // key for the whole run.
    const rows = d1Json<{ id: number; provider: string; scope: string; key_ref: string; key_iv: string }>(
      `SELECT id, provider, scope, key_ref, key_iv FROM ai_key_pool
        WHERE status IN ('active','slow','rate_limited') ORDER BY quota_used, id;`
    );
    pool = rankPool(await loadPool(rows, process.env.KEY_ENCRYPTION_SECRET));
    const usableIds = new Set(pool.map((k) => k.id));
    const byScope = new Map<string, number>();
    for (const r of rows) {
      if (!usableIds.has(r.id)) continue;
      byScope.set(r.scope, (byScope.get(r.scope) ?? 0) + 1);
    }
    // Report the total AND its shape. A number reported only as a total is
    // exactly how "595 keys" survived as long as it did.
    console.log(
      pool.length
        ? `AI pool: ${pool.length} usable key(s) of ${rows.length} in the table — ${poolSummary(pool)}. gtx is the fallback.`
        : `AI pool: ${rows.length} key(s) in the table, none this script can call — falling back to gtx for the whole run.`
    );
    if (pool.length) {
      const shape = [...byScope.entries()].map(([s, n]) => `${n} scope=${s}`).join(", ");
      console.log(`  by registered scope: ${shape} (scope is not used to decide; the provider is).`);
    }
  } else if (!dry) {
    console.log("AI pool: KEY_ENCRYPTION_SECRET not set — falling back to gtx.");
  }

  const collected = collectStrings();
  const strings = collected.filter((t) => t.length <= MAX_SOURCE_CHARS);
  const skipped = collected.length - strings.length;
  if (skipped > 0) {
    const biggest = Math.max(...collected.map((t) => t.length));
    console.log(
      `Skipping ${skipped} of ${collected.length} strings over ${MAX_SOURCE_CHARS} chars ` +
        `(largest ${biggest}). They exceed what the translator takes in one call AND what D1 ` +
        `accepts in one statement — sending them is what made this job fail rather than finish.`
    );
  }

  // Warm the FURTHEST-BEHIND language first.
  //
  // The list is otherwise processed in its declared order (en, de, es, fr, …),
  // and the languages at the front carry by far the largest corpora. They ate
  // the whole run every time, so the ones near the end never got past their
  // first small phase: fr/en/es/de sat at 11k/11k/7k/4k cached strings while
  // ur, hi, tr and the rest were all stuck on exactly 532 — for days, no matter
  // how often the job ran. Sorting by how much each language already has makes
  // every run top up whoever is behind, so coverage evens out on its own
  // instead of depending on where a language happens to sit in the list.
  //
  // Counted for EVERY language, not just the ones this run was asked to warm.
  // "Parity" means "level with the best-covered language in the ecosystem", and
  // measuring only the requested subset silently redefines it: `--langs=de
  // --one` made de both the queue and the benchmark, so de was trivially at
  // 100%, the run announced "every language is at parity", translated nothing,
  // and exited successfully. A run that does nothing while reporting success is
  // the worst possible failure here, because it looks exactly like a corpus
  // that was already finished.
  //
  // One grouped query instead of one COUNT per language — fewer scans than the
  // loop it replaces, and it sees languages outside the queue.
  const cachedPerLang = new Map<string, number>();
  let queue = langs;
  if (!dry) {
    const counts = d1Json<{ lang: string; n: number }>(
      `SELECT substr(k, 7, instr(substr(k,7),':')-1) AS lang, COUNT(*) AS n
         FROM mt_cache WHERE k LIKE 'mt:id-%' GROUP BY lang;`
    );
    for (const r of counts) if (/^[a-z]{2}$/.test(r.lang)) cachedPerLang.set(r.lang, Number(r.n));
    for (const lang of langs) if (!cachedPerLang.has(lang)) cachedPerLang.set(lang, 0);
    queue = [...langs].sort((a, b) => (cachedPerLang.get(a) ?? 0) - (cachedPerLang.get(b) ?? 0));

    // --behind: hand the WHOLE run to the switched-off languages.
    //
    // Sorting alone was not enough. A run has a wall clock, and the finished
    // languages still sat in the queue behind the others — so when a pass ran
    // long, the tail never got reached at all. Dropping them outright means
    // every minute of every run goes where the owner asked it to go.
    // --one: warm exactly ONE language this run (owner: "bikin per bahasa dulu
    // jgn langsung, per bahasa bisa saling nyambung").
    //
    // A pass that tries all 26 spreads a fixed wall clock across all of them and
    // finishes none. One language per run finishes that language, and the
    // workflow chains straight into the next — same total work, but the progress
    // is real and visible instead of everything creeping.
    //
    // Order, per the owner: "utamain yg saat ini di pakai dulu". A language with
    // a live site has readers today and comes first, neediest of them leading;
    // the switched-off ones follow. Inside each group, least covered first.
    if (one) {
      // Parity is capped at what this script can actually warm.
      //
      // Without the cap the chain deadlocks, and it had. The benchmark was the
      // best-covered language — id→en at 18,805 rows — but only 5,204 distinct
      // Indonesian strings still EXIST to collect. The extra rows are history:
      // keys written for text that has since been edited or removed, plus the
      // Worker's own runtime translations. So no language could ever reach the
      // benchmark, every language stayed "short" forever, and the queue handed
      // every single pass to the same one — Spanish, the neediest live site.
      // Spanish is the most complete language in the ecosystem by content
      // (87,916 strings, ahead of English) and the chain still would not move
      // past it. The twenty-two languages at 1% were never going to be reached.
      //
      // A language holding as many rows as there are strings to warm is done,
      // whatever some other language's historical total happens to be.
      //
      // The cap is slightly generous: a language could hold 5,204 rows and
      // still miss a few CURRENT strings, having cached older ones. That costs
      // a delayed top-up on its next turn — the id phase always re-checks what
      // is missing — where the old behaviour cost every other language its turn
      // permanently.
      const collectable = strings.length;
      const best = Math.min(Math.max(0, ...cachedPerLang.values()), collectable || Number.POSITIVE_INFINITY);
      const short = queue.filter((l) => (cachedPerLang.get(l) ?? 0) < best * PARITY_RATIO);
      const inUse = short.filter((l) => LOCALE_SITE[l]);
      const locked = short.filter((l) => !LOCALE_SITE[l]);
      const order = [...inUse, ...locked];
      const pct = (l: string) => (best ? Math.round(((cachedPerLang.get(l) ?? 0) / best) * 100) : 0);
      if (order.length === 0) {
        console.log("--one: every language is at parity. Nothing to warm.");
        console.log("WARM_NEXT=");
        return;
      }
      const pick = order[0]!;
      console.log(
        `--one: warming ${pick} (${pct(pick)}%), ${LOCALE_SITE[pick] ? "a live site" : "switched off"}. ` +
          `Queue after this: ${order.slice(1, 6).map((l) => `${l} ${pct(l)}%`).join(", ")}` +
          (order.length > 6 ? ` … +${order.length - 6}` : "")
      );
      // The workflow reads this line to decide whether to chain again.
      console.log(`WARM_NEXT=${order.slice(1).join(",")}`);
      queue = [pick];
    } else if (behind) {
      const best = Math.max(0, ...cachedPerLang.values());
      const locked = queue.filter((l) => !LOCALE_SITE[l] && (cachedPerLang.get(l) ?? 0) < best * PARITY_RATIO);
      if (locked.length > 0) {
        const pct = (l: string) => (best ? Math.round(((cachedPerLang.get(l) ?? 0) / best) * 100) : 0);
        console.log(
          `--behind: ${locked.length} switched-off languages are short of the ${best}-string corpus. ` +
            `Spending the whole run on them: ${locked.map((l) => `${l} ${pct(l)}%`).join(", ")}`
        );
        queue = locked;
      } else {
        console.log("--behind: every switched-off language is at parity — warming all of them.");
      }
    }
  }
  console.log(`Collected ${strings.length} distinct id strings to warm into [${queue.join(", ")}].`);
  if (cachedPerLang.size) {
    console.log(
      "Cached per language (least first): " +
        queue.map((l) => `${l}=${cachedPerLang.get(l) ?? 0}`).join(", ")
    );
  }

  let translated = 0;
  let failed = 0;
  // Why a string failed, split three ways.
  //
  // One combined counter is why Spanish took a day to diagnose: a pass
  // reported "failed/unchanged 31654" with 595 healthy keys in the pool, and
  // that single number cannot tell apart three completely different faults —
  // both translators returning nothing (upstream is refusing us), an answer
  // identical to its source (the model echoed instead of translating), and a
  // lost @@n@@ sentinel (the guard that protects scripture rejecting the
  // result). Each one has a different fix, and the number said nothing about
  // which.
  const why = { noResult: 0, echoed: 0, sentinel: 0 };
  /** Count one rejection under the reason it actually happened for. */
  function reject(src: string, v: string | null | undefined, sentinelOk = true): void {
    failed++;
    if (!v) why.noResult++;
    else if (v === src) why.echoed++;
    else if (!sentinelOk) why.sentinel++;
    else why.noResult++;
  }
  let cached = 0;
  const pairs: { key: string; value: string }[] = [];

  for (const lang of queue) {
    if (lang === "id") continue;
    // Skip strings already translated in a previous run — this is what makes
    // the post-deploy trigger cheap: an unchanged corpus costs ZERO upstream
    // calls, and only genuinely new content is sent to the translator. Loaded
    // paginated because the generic collector can gather a large corpus.
    const already = new Set<string>();
    if (!dry) {
      for (let ko = 0; ; ko += 10000) {
        const kr = d1Json<{ k: string }>(
          `SELECT k FROM mt_cache WHERE k LIKE 'mt:id-${lang}:%' ORDER BY k LIMIT 10000 OFFSET ${ko};`
        );
        for (const r of kr) already.add(r.k);
        if (kr.length < 10000) break;
      }
    }
    const todo = strings.filter((t) => {
      if (already.has(`mt:id-${lang}:${hashKey(t)}`)) {
        cached++;
        return false;
      }
      return true;
    });
    // Batched (gtxBatch), byte-budgeted (~4KB source per call) — a big corpus
    // is a few thousand calls, not one-per-string.
    // Batched, then run concurrently — the same sixteen-worker split the body
    // phase uses. This phase runs FIRST, so leaving it serial meant it spent
    // the whole four-hour budget and the article bodies were never reached.
    const idBatches: string[][] = [];
    for (let i = 0; i < todo.length; ) {
      const batch: string[] = [];
      let bytes = 0;
      while (i < todo.length && batch.length < 40 && bytes < 4000) {
        batch.push(todo[i]!);
        bytes += todo[i]!.length + 1;
        i++;
      }
      idBatches.push(batch);
    }
    const idResults = await translateBatchesParallel(pool, idBatches, lang, "id", (slice, batch) =>
      translateBatch(slice, batch, lang, "id")
    );
    idBatches.forEach((batch, bi) => {
      const outs = idResults[bi] ?? [];
      batch.forEach((src, k) => {
        const v = outs[k];
        // An unchanged answer is usually a refusal, but for a proper noun it
        // is the correct translation — "Nabi Adam" is "Nabi Adam" in Spanish.
        // Rejecting those meant the same ~894 strings failed every pass, so
        // this language never filled and the queue never moved past it.
        // echoIsFaithful is deliberately narrow and refuses anything with
        // Arabic or a sentinel in it.
        if (v && (v !== src || echoIsFaithful(src))) {
          pairs.push({ key: `mt:id-${lang}:${hashKey(src)}`, value: v });
          translated++;
        } else {
          reject(src, v);
        }
      });
    });
    // Bank the work as it is earned, not at the end of the run.
    if (pairs.length >= CHECKPOINT_EVERY) writePairs(pairs, dry);
    // Bank whatever this language produced before moving to the next one.
    writePairs(pairs, dry);
    console.log(`  id→${lang}: ${translated} translated so far (${cached} already cached)`);
    if (outOfTime()) break;
  }

  // ── Hadith (Arabic-source) ──────────────────────────────────────────────
  // The hadith reader translates `text_ar` on demand into the site language
  // (key `mt:ar-<lang>:<hash>`); when the Worker's runtime translate is blocked
  // it falls back to the stored English `text_en`, which is why 1fr.fr/
  // tilawa.de/dawa.es showed English hadith. Warm ar→{fr,de,es,…} here (en
  // uses text_en directly, id has a native column, ar IS the source, so those
  // are skipped). Batched (gtxBatch) + paginated so 30k+ rows finish in one
  // run, and skip-cached so re-runs are cheap.
  // The 30k-hadith corpus is enormous per language, so pre-warm it only for
  // the established domain sites; every other language still translates hadith
  // ON DEMAND (cached to D1 on first view). Widen this set to pre-warm more.
  const HADITH_WARM_LANGS = ["fr", "de", "es"];
  // `queue`, not `langs` — under --behind the finished languages are not in
  // this run at all, and the whole point is that nothing spends its budget on
  // them. This phase then does nothing, which is correct.
  const hadithLangs = queue.filter((l) => HADITH_WARM_LANGS.includes(l));
  if (hadithLangs.length && !dry) {
    const hadithCount =
      d1Json<{ n: number }>("SELECT COUNT(*) AS n FROM hadits WHERE text_ar IS NOT NULL AND text_ar <> '';")[0]?.n ?? 0;
    for (const lang of hadithLangs) {
      const cachedCount =
        d1Json<{ n: number }>(`SELECT COUNT(*) AS n FROM mt_cache WHERE k LIKE 'mt:ar-${lang}:%';`)[0]?.n ?? 0;
      // Already fully warmed (hadith text is static once imported) → skip the
      // whole phase; no 30k-key load, no re-translation on the post-deploy run.
      if (cachedCount >= hadithCount && hadithCount > 0) {
        console.log(`  hadith ar→${lang}: already warmed (${cachedCount}) — skipping`);
        continue;
      }
      // Resuming a partial warm: load existing keys to skip, paginated so the
      // result set never gets too big to return.
      const already = new Set<string>();
      for (let ko = 0; ; ko += 10000) {
        const kr = d1Json<{ k: string }>(
          `SELECT k FROM mt_cache WHERE k LIKE 'mt:ar-${lang}:%' ORDER BY k LIMIT 10000 OFFSET ${ko};`
        );
        for (const r of kr) already.add(r.k);
        if (kr.length < 10000) break;
      }
      let offset = 0;
      let hadCached = 0;
      let hadDone = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const rows = d1Json<{ text_ar: string }>(
          `SELECT text_ar FROM hadits WHERE text_ar IS NOT NULL AND text_ar <> '' ORDER BY id LIMIT 1500 OFFSET ${offset};`
        );
        if (rows.length === 0) break;
        offset += rows.length;
        // Only the not-yet-cached ones, de-duplicated within this page.
        const todo: string[] = [];
        const seen = new Set<string>();
        for (const r of rows) {
          const t = r.text_ar.trim();
          if (!t) continue;
          const key = `mt:ar-${lang}:${hashKey(t)}`;
          if (already.has(key) || seen.has(t)) {
            hadCached++;
            continue;
          }
          seen.add(t);
          todo.push(t);
        }
        // Translate in newline batches, byte-budgeted (~4KB source per call).
        // Concurrent, like the other two phases. 30,000 hadith serially is the
        // rest of the budget on its own.
        const arBatches: string[][] = [];
        for (let i = 0; i < todo.length; ) {
          const batch: string[] = [];
          let bytes = 0;
          while (i < todo.length && batch.length < 40 && bytes < 4000) {
            batch.push(todo[i]!);
            bytes += todo[i]!.length + 1;
            i++;
          }
          arBatches.push(batch);
        }
        const arResults = await translateBatchesParallel(pool, arBatches, lang, "ar", (slice, batch) =>
          translateBatch(slice, batch, lang, "ar")
        );
        arBatches.forEach((batch, bi) => {
          const outs = arResults[bi] ?? [];
          batch.forEach((src, k) => {
            const v = outs[k];
            if (v && v !== src) {
              pairs.push({ key: `mt:ar-${lang}:${hashKey(src)}`, value: v });
              translated++;
              hadDone++;
            } else {
              reject(src, v);
            }
          });
        });
        if (pairs.length >= CHECKPOINT_EVERY) writePairs(pairs, dry);
        // Without this the pager keeps fetching pages it will never translate.
        if (outOfTime()) break;
      }
      writePairs(pairs, dry);
      console.log(`  hadith ar→${lang}: ${hadDone} new, ${hadCached} already cached`);
      if (outOfTime()) break;
    }
  }

  // ── Story bodies, English-source (the sibling sites' actual reading path) ──
  //
  // This is the phase that was missing, and its absence is why the articles on
  // dawa.es, tilawa.de and 1fr.fr never became translated no matter how often
  // the job ran.
  //
  // For es/de/fr the API serves the ENGLISH row of a story and translates from
  // that (content.ts, /content/stories/:slug), so it asks for `mt:en-es:…`.
  // Every phase above caches `mt:id-…`. The work was real, and for these
  // articles nothing ever read it.
  //
  // Three details have to match the Worker exactly or the rows are unreachable:
  //   · the body is split on a blank line, the same split the API makes;
  //   · each paragraph is MASKED before hashing — and the mask now hides Arabic
  //     script, so a hadith's matn is never sent to a translator at all;
  //   · the value stored keeps the @@n@@ sentinels, which the Worker restores.
  //
  // Splitting into paragraphs also reaches the 1,210 bodies that were too long
  // to translate whole: a paragraph is comfortably inside every limit.
  const BODY_LANGS = ["es", "de", "fr"];
  const bodyLangs = queue.filter((l) => BODY_LANGS.includes(l));
  if (bodyLangs.length && !dry) {
    for (const lang of bodyLangs) {
      const already = new Set<string>();
      for (let ko = 0; ; ko += 10000) {
        const kr = d1Json<{ k: string }>(
          `SELECT k FROM mt_cache WHERE k LIKE 'mt:en-${lang}:%' ORDER BY k LIMIT 10000 OFFSET ${ko};`
        );
        for (const r of kr) already.add(r.k);
        if (kr.length < 10000) break;
      }
      let done = 0;
      let skipped = 0;
      let offset = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (outOfTime()) break;
        const rows = d1Json<{ title: string; body: string }>(
          `SELECT title, body FROM stories WHERE lang = 'en' AND status = 'published'
             AND body IS NOT NULL AND body <> '' ORDER BY id LIMIT 40 OFFSET ${offset};`
        );
        if (rows.length === 0) break;
        offset += rows.length;

        const todo: string[] = [];
        const seen = new Set<string>();
        for (const r of rows) {
          // Title first, then paragraphs — the same list the API localizes.
          for (const raw of [r.title, ...r.body.split(/\n\s*\n/)]) {
            const masked = maskProtected(String(raw ?? "")).masked.trim();
            if (masked.length < 2) continue;
            // A paragraph that is nothing but Arabic masks to "@@0@@": there is
            // no text to translate, and the Worker restores it verbatim.
            if (/^(@@\d+@@\s*)+$/.test(masked)) continue;
            if (masked.length > MAX_SOURCE_CHARS) {
              skipped++;
              continue;
            }
            const key = `mt:en-${lang}:${hashKey(masked)}`;
            if (already.has(key) || seen.has(masked)) continue;
            seen.add(masked);
            todo.push(masked);
          }
        }

        // Pack the page into batches, then translate them CONCURRENTLY.
        //
        // Serially this corpus is ~30 hours: 88,000 translations, four
        // paragraphs a call, five seconds a call. The pool is 489 keys, so the
        // wait was never quota — the calls were simply queueing behind each
        // other. Each worker owns its own slice of keys (see splitPool), so
        // running sixteen at once spends sixteen separate quotas rather than
        // hammering one.
        const batches: string[][] = [];
        for (let i = 0; i < todo.length; ) {
          const batch: string[] = [];
          let bytes = 0;
          while (i < todo.length && batch.length < 25 && bytes < 4000) {
            batch.push(todo[i]!);
            bytes += todo[i]!.length + 1;
            i++;
          }
          batches.push(batch);
        }

        const results = await translateBatchesParallel(pool, batches, lang, "en", (slice, batch) =>
          translateBatch(slice, batch, lang, "en")
        );

        batches.forEach((batch, bi) => {
          const outs = results[bi] ?? [];
          batch.forEach((src, k) => {
            const v = outs[k];
            // A translation that lost a sentinel would drop the Arabic — or a
            // collector's name — out of the text entirely. Reject it; the next
            // pass retries the paragraph.
            const want = (src.match(/@@\d+@@/g) ?? []).length;
            const got = v ? (v.match(/@@\d+@@/g) ?? []).length : 0;
            if (v && got === want && (v !== src || echoIsFaithful(src))) {
              pairs.push({ key: `mt:en-${lang}:${hashKey(src)}`, value: v });
              translated++;
              done++;
            } else {
              reject(src, v, got === want);
            }
          });
        });
        if (pairs.length >= CHECKPOINT_EVERY) writePairs(pairs, dry);
      }
      writePairs(pairs, dry);
      console.log(
        `  stories en→${lang}: ${done} new` + (skipped ? `, ${skipped} paragraph(s) over ${MAX_SOURCE_CHARS} chars` : "")
      );
      if (outOfTime()) break;
    }
  }

  // Anything still staged after the loops (the last partial checkpoint).
  writePairs(pairs, dry);

  console.log(
    `Translated ${translated}, failed/unchanged ${failed}. ` +
      `${totals.wrote} row(s) written to D1 across ${totals.checkpoints} checkpoint(s).`
  );
  if (failed > 0) {
    console.log(
      `Of the ${failed} that failed: ${why.noResult} came back empty (both the pool ` +
        `and gtx refused), ${why.echoed} came back identical to the source, ` +
        `${why.sentinel} lost a @@n@@ sentinel and were rejected to protect the scripture.`
    );
    console.log(
      `Upstream: the pool answered ${upstream.poolAnswered} of ${upstream.poolTried} batch(es), ` +
        `gtx answered ${upstream.gtxAnswered} of ${upstream.gtxTried}.`
    );
  }
  if (totals.oversize > 0) {
    console.warn(
      `  ${totals.oversize} translation(s) were too large for a single D1 statement and were not stored. ` +
        `They need chunked translation with a matching Worker lookup, not a bigger batch.`
    );
  }
  if (totals.failedFiles > 0) console.warn(`  ${totals.failedFiles} batch(es) failed; the rest were written.`);
  // What this pass actually achieved, for the chaining step to decide on.
  //
  // It used to decide from the corpus measurement taken before and after the
  // run, and that number answers a different question. A pass that warmed
  // Spanish and translated NOTHING still reported "gained 1287 strings",
  // because the measurement counts content rows across all twenty-eight
  // languages and those move for their own reasons. Chaining on it meant
  // chaining on noise — a new pass every four minutes, each one hammering the
  // upstream that had just refused the last. This is the run's own count of
  // strings it translated, which is the thing the decision is actually about.
  console.log(`WARM_TRANSLATED=${translated}`);
  console.log("Done — sibling sites now serve these from D1 with no runtime translate call, no KV write cap.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
