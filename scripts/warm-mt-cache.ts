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
 * Usage: npx tsx scripts/warm-mt-cache.ts [--langs=en,fr,de,es] [--dry]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
  };
}

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
  const { langs, dry } = parseArgs();

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

  const strings = collectStrings();
  console.log(`Collected ${strings.length} distinct id strings to warm into [${langs.join(", ")}].`);

  let translated = 0;
  let failed = 0;
  let cached = 0;
  const pairs: { key: string; value: string }[] = [];

  for (const lang of langs) {
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
      const batch: string[] = [];
      let bytes = 0;
      while (i < todo.length && batch.length < 40 && bytes < 4000) {
        batch.push(todo[i]!);
        bytes += todo[i]!.length + 1;
        i++;
      }
      const outs = await gtxBatch(batch, lang, "id");
      batch.forEach((src, k) => {
        const v = outs[k];
        if (v && v !== src) {
          pairs.push({ key: `mt:id-${lang}:${hashKey(src)}`, value: v });
          translated++;
        } else {
          failed++;
        }
      });
    }
    console.log(`  id→${lang}: ${pairs.length} new staged (${cached} already cached)`);
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
  const hadithLangs = langs.filter((l) => HADITH_WARM_LANGS.includes(l));
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
          const batch: string[] = [];
          let bytes = 0;
          while (i < todo.length && batch.length < 40 && bytes < 4000) {
            batch.push(todo[i]!);
            bytes += todo[i]!.length + 1;
            i++;
          }
          const outs = await gtxBatch(batch, lang, "ar");
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
        }
      }
      console.log(`  hadith ar→${lang}: ${hadDone} new, ${hadCached} already cached`);
    }
  }

  console.log(`Translated ${translated}, failed/unchanged ${failed}, ${pairs.length} rows to write to D1.`);
  if (dry || pairs.length === 0) {
    console.log(dry ? "--dry: not writing." : "nothing to write.");
    return;
  }

  // Write into the D1 `mt_cache` table the Worker reads (migration 0046), NOT
  // KV. KV's free plan caps writes at 1,000/day — that cap silently dropped
  // EVERY translation and is exactly why the sibling sites stayed Indonesian
  // for days. D1 has no such daily write cap. INSERT ... ON CONFLICT keeps it
  // idempotent (the table was already ensured at the top of main()).

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
      wrangler(["d1", "execute", "ulyah-db", "--remote", `--file=${file}`]);
      statements = [];
      console.log(`  wrote ${wrote}/${pairs.length}`);
    };
    for (const p of pairs) {
      const tuple = `('${esc(p.key)}','${esc(p.value)}')`;
      if (curBytes + tuple.length > STMT_BUDGET) flushStmt();
      curRows.push(tuple);
      curBytes += tuple.length + 1;
      wrote++;
      if (statements.length >= 40) flushFile();
    }
    flushFile();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log("Done — sibling sites now serve these from D1 with no runtime translate call, no KV write cap.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
