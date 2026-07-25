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
import { loadPool, aiTranslateBatch, rotate, rankPool, poolSummary, PREFER_GTX, type PoolKey } from "./ai-translate";

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
  const url = `${GTX_BASE}?client=gtx&sl=${toGoogleLang(sl)}&tl=${toGoogleLang(tl)}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ulyah.com/1.0)" } });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const out = (data[0] as unknown[]).map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : "")).join("");
    return out.trim() || null;
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
    const ai = await aiTranslateBatch(pool, texts, tl, sl);
    rotate(pool);
    if (ai) return ai;
  }
  return gtxBatch(texts, tl, sl);
}

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
    // 'rate_limited' is included on purpose. That status is a note left by
    // whatever last touched the key, possibly weeks ago, and a daily quota has
    // long since reset. The translator has its own live cooldown, so a key that
    // is genuinely still limited costs one call and steps aside — whereas
    // excluding it on a stale label costs the key for the whole run.
    const rows = d1Json<{ id: number; provider: string; key_ref: string; key_iv: string }>(
      `SELECT id, provider, key_ref, key_iv FROM ai_key_pool
        WHERE scope = 'text' AND status IN ('active','slow','rate_limited') ORDER BY quota_used, id;`
    );
    pool = rankPool(await loadPool(rows, process.env.KEY_ENCRYPTION_SECRET));
    // Say what was found AND what was found but cannot be used, because the
    // difference between those two numbers is where a wrong belief about the
    // pool's size lives. A count that is only ever reported as a total invites
    // exactly the mistake this line exists to prevent.
    const unusable = rows.length - pool.length;
    console.log(
      pool.length
        ? `AI pool: ${pool.length} usable text key(s) — ${poolSummary(pool)}` +
            (unusable > 0 ? ` (${unusable} more are text-scoped but on providers this script cannot call)` : "") +
            `. gtx is the fallback.`
        : `AI pool: ${rows.length} text-scoped key(s) found, none usable — falling back to gtx for the whole run.`
    );
    // Keys registered under another scope are NOT quietly borrowed. A key
    // donated for TTS is doing a job (owner: "TTS jgn campur2, masing2 aja
    // tugasnya"), and spending its quota here would break that job somewhere
    // this script never looks. Reported so the size of the pool is visible, and
    // left alone.
    const otherScope = d1Json<{ scope: string; n: number }>(
      `SELECT scope, COUNT(*) AS n FROM ai_key_pool
        WHERE scope <> 'text' AND status IN ('active','slow') GROUP BY scope ORDER BY n DESC;`
    );
    if (otherScope.length) {
      const desc = otherScope.map((r) => `${r.n} ${r.scope}`).join(", ");
      console.log(`  (not used for translation: ${desc} — those keys are registered for another job.)`);
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
  const cachedPerLang = new Map<string, number>();
  let queue = langs;
  if (!dry) {
    for (const lang of langs) {
      const n = d1Json<{ n: number }>(`SELECT COUNT(*) AS n FROM mt_cache WHERE k LIKE 'mt:id-${lang}:%';`)[0]?.n ?? 0;
      cachedPerLang.set(lang, Number(n));
    }
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
      const best = Math.max(0, ...cachedPerLang.values());
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
    for (let i = 0; i < todo.length; ) {
      if (outOfTime()) break;
      const batch: string[] = [];
      let bytes = 0;
      while (i < todo.length && batch.length < 40 && bytes < 4000) {
        batch.push(todo[i]!);
        bytes += todo[i]!.length + 1;
        i++;
      }
      const outs = await translateBatch(pool, batch, lang, "id");
      batch.forEach((src, k) => {
        const v = outs[k];
        if (v && v !== src) {
          pairs.push({ key: `mt:id-${lang}:${hashKey(src)}`, value: v });
          translated++;
        } else {
          failed++;
        }
      });
      // Bank the work as it is earned, not at the end of the run.
      if (pairs.length >= CHECKPOINT_EVERY) writePairs(pairs, dry);
    }
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
        for (let i = 0; i < todo.length; ) {
          if (outOfTime()) break;
          const batch: string[] = [];
          let bytes = 0;
          while (i < todo.length && batch.length < 40 && bytes < 4000) {
            batch.push(todo[i]!);
            bytes += todo[i]!.length + 1;
            i++;
          }
          const outs = await translateBatch(pool, batch, lang, "ar");
          batch.forEach((src, k) => {
            const v = outs[k];
            if (v && v !== src) {
              pairs.push({ key: `mt:ar-${lang}:${hashKey(src)}`, value: v });
              translated++;
              hadDone++;
            } else {
              failed++;
            }
          });
          if (pairs.length >= CHECKPOINT_EVERY) writePairs(pairs, dry);
        }
        // Without this the pager keeps fetching pages it will never translate.
        if (outOfTime()) break;
      }
      writePairs(pairs, dry);
      console.log(`  hadith ar→${lang}: ${hadDone} new, ${hadCached} already cached`);
      if (outOfTime()) break;
    }
  }

  // Anything still staged after the loops (the last partial checkpoint).
  writePairs(pairs, dry);

  console.log(
    `Translated ${translated}, failed/unchanged ${failed}. ` +
      `${totals.wrote} row(s) written to D1 across ${totals.checkpoints} checkpoint(s).`
  );
  if (totals.oversize > 0) {
    console.warn(
      `  ${totals.oversize} translation(s) were too large for a single D1 statement and were not stored. ` +
        `They need chunked translation with a matching Worker lookup, not a bigger batch.`
    );
  }
  if (totals.failedFiles > 0) console.warn(`  ${totals.failedFiles} batch(es) failed; the rest were written.`);
  console.log("Done — sibling sites now serve these from D1 with no runtime translate call, no KV write cap.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
