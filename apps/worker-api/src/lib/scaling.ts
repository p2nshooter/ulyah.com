import { generateStoryDraft } from "@ulyah/ai-engine";
import type { Env } from "./../env.js";
import { selectKeyForScope, recordKeyUsage } from "./keypool-db.js";
import { runDeterministicCompile, runHadithCompile } from "./compile.js";
import { safeKvGet } from "./kv-safe.js";

interface ScalingSettings {
  autoThrottleEnabled: boolean;
  monthlyBudgetUsd: number;
  preferFreeProviders: boolean;
  targetJobsPerTick: number;
  engineEnabled: boolean; // master switch — the ONLY way to stop auto-production (admin portal)
  compileLangs: string[]; // languages the AI-free compiler produces
}

const DEFAULT_SETTINGS: ScalingSettings = {
  autoThrottleEnabled: true,
  monthlyBudgetUsd: 0,
  preferFreeProviders: true,
  targetJobsPerTick: 5,
  engineEnabled: true,
  compileLangs: ["id", "en"],
};

const MAX_JOBS_EXECUTED_PER_TICK = 3; // bounded so one cron tick can't run away with CPU/wall time

async function getSettings(env: Env): Promise<ScalingSettings> {
  const raw = await safeKvGet(env, "scaling:settings");
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

/**
 * Zero-hand content-gap scheduler (arsitektur doc §14, user requirement:
 * "agar selalu database terisi terus" — the database should keep filling
 * itself). Runs on every cron tick alongside the key-pool health checker:
 *   1. Measure content coverage (ayah without a kisah/hikmah yet).
 *   2. If queue depth is below target and donations can afford it, queue
 *      more generation jobs against the gaps.
 *   3. Execute a small, bounded batch of queued jobs right now using the
 *      best-ranked active key, so content actually grows autonomously
 *      instead of just accumulating an ever-larger backlog.
 *   4. Record scaling_metrics for the admin dashboard's smart-scaling view.
 */

/**
 * The mushaf's ayah count, as a constant.
 *
 * `SELECT COUNT(*) FROM ayah` reads all 6,236 rows to return a number that has
 * not changed since the seventh century and cannot change without a migration.
 * At ninety-six heartbeats a day that was six hundred thousand row reads for a
 * fact that is safe to write down.
 */
const TOTAL_AYAH = 6236;

/** Six hours — the coverage figure moves one story at a time. */
const COVERAGE_TTL_SECONDS = 21_600;
const COVERAGE_KEY = "scaling:coverage:v1";

interface Coverage {
  total_ayah: number;
  ayah_with_story: number;
}

/**
 * How much of the Qur'an already has a story attached.
 *
 * Read through KV, because the query behind it is expensive and the answer is
 * not urgent: it is written to scaling_metrics for a chart, and used nowhere
 * that a six-hour-old number would mislead. A KV miss pays for the scan once.
 */
async function cachedCoverage(env: Env): Promise<Coverage | null> {
  try {
    const hit = await env.CACHE_KV.get(COVERAGE_KEY, "json");
    if (hit && typeof hit === "object") return hit as Coverage;
  } catch {
    /* KV unavailable — fall through and measure */
  }
  const row = await env.DB.prepare(
    `SELECT ? AS total_ayah,
            (SELECT COUNT(DISTINCT related_ayah_id) FROM stories WHERE related_ayah_id IS NOT NULL) AS ayah_with_story`
  )
    .bind(TOTAL_AYAH)
    .first<Coverage>();
  if (row) {
    await env.CACHE_KV.put(COVERAGE_KEY, JSON.stringify(row), { expirationTtl: COVERAGE_TTL_SECONDS }).catch(() => {});
  }
  return row;
}

export async function runScalingTick(env: Env): Promise<{
  queued: number;
  executed: number;
  failed: number;
  compiled: number;
  coverage: { total_ayah: number; ayah_with_story: number };
}> {
  const settings = await getSettings(env);

  // Master switch: the admin portal can stop ALL auto-production here.
  if (!settings.engineEnabled) {
    await env.DB.prepare(
      "INSERT INTO scaling_metrics (metric_type, value, detail) VALUES ('engine_paused', 1, NULL)"
    ).run();
    return { queued: 0, executed: 0, failed: 0, compiled: 0, coverage: { total_ayah: 0, ayah_with_story: 0 } };
  }

  // AI-free heartbeat: compile sourced articles from the DB every tick, so
  // content keeps growing with or without any donated AI key. Alternate
  // between hadith articles and Qur'an tadabbur so both libraries fill.
  let compiled = 0;
  try {
    compiled = await runHadithCompile(env, settings.compileLangs);
    if (compiled === 0) compiled = await runDeterministicCompile(env, settings.compileLangs);
  } catch (e) {
    console.error("deterministic-compile failed", e);
  }

  // Coverage is a STATISTIC, and it moves one story at a time. Asked fresh it
  // costs a full count of `ayah` (6,236 rows) plus a full scan of `stories`,
  // and the heartbeat asks ninety-six times a day — around a million row reads
  // daily to redraw a number that barely changes, out of a free-plan allowance
  // of five million. Cached for six hours it costs four.
  const coverage = await cachedCoverage(env);

  const queueDepthRow = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM generation_jobs WHERE status IN ('queued','running')"
  ).first<{ n: number }>();
  const queueDepth = queueDepthRow?.n ?? 0;

  let queued = 0;
  if (settings.autoThrottleEnabled ? true : true) {
    const deficit = Math.max(0, settings.targetJobsPerTick - queueDepth);
    if (deficit > 0) {
      // Which ayah still has no story?
      //
      // This used to be a LEFT JOIN over both tables with ORDER BY RANDOM().
      // Every part of that is unbounded: `stories.related_ayah_id` had no
      // index, so the join probed the whole table for each of the 6,236 ayah,
      // and ORDER BY RANDOM() cannot stop early — it materialises every
      // matching row before picking a few, so the LIMIT bounds the RESULT and
      // not the work. Ninety-six times a day, that was the single largest
      // consumer of the free plan's five million daily row reads, and the
      // reason three deploys in a row were refused with code 7500.
      //
      // Now: start at a random ayah id and walk FORWARD, checking each
      // candidate against the new index (0055) and stopping at `deficit`
      // hits. The scan is bounded by what it finds rather than by the size of
      // the tables. Randomising the start still spreads the work across the
      // mushaf — and wrapping once at the end means the tail is not starved
      // when the only gaps left are below the starting point.
      const from = 1 + Math.floor(Math.random() * TOTAL_AYAH);
      const gapQuery = (lo: number, hi: number, n: number) =>
        env.DB.prepare(
          `SELECT a.id FROM ayah a
            WHERE a.id >= ? AND a.id <= ?
              AND NOT EXISTS (SELECT 1 FROM stories s WHERE s.related_ayah_id = a.id)
            ORDER BY a.id LIMIT ?`
        )
          .bind(lo, hi, n)
          .all<{ id: number }>();

      const { results: first } = await gapQuery(from, TOTAL_AYAH, deficit);
      const gaps = [...first];
      if (gaps.length < deficit && from > 1) {
        const { results: wrapped } = await gapQuery(1, from - 1, deficit - gaps.length);
        gaps.push(...wrapped);
      }

      if (gaps.length) {
        const stmts = gaps.map((g) =>
          env.DB.prepare(
            "INSERT INTO generation_jobs (job_type, target_table, target_id, status, priority) VALUES ('story', 'stories', ?, 'queued', 5)"
          ).bind(g.id)
        );
        await env.DB.batch(stmts);
        queued = gaps.length;
      }
    }
  }

  const { executed, failed } = await executeQueuedJobs(env, settings);

  await env.DB.batch([
    env.DB.prepare("INSERT INTO scaling_metrics (metric_type, value, detail) VALUES ('content_coverage', ?, ?)").bind(
      coverage ? coverage.ayah_with_story / Math.max(1, coverage.total_ayah) : 0,
      JSON.stringify(coverage)
    ),
    env.DB.prepare("INSERT INTO scaling_metrics (metric_type, value, detail) VALUES ('queue_depth', ?, NULL)").bind(
      queueDepth + queued
    ),
  ]);

  return { queued, executed, failed, compiled, coverage: coverage ?? { total_ayah: 0, ayah_with_story: 0 } };
}

async function executeQueuedJobs(
  env: Env,
  settings: ScalingSettings
): Promise<{ executed: number; failed: number }> {
  const { results: jobs } = await env.DB.prepare(
    "SELECT * FROM generation_jobs WHERE status = 'queued' AND job_type = 'story' ORDER BY priority, created_at LIMIT ?"
  )
    .bind(MAX_JOBS_EXECUTED_PER_TICK)
    .all<{ id: number; target_id: number }>();

  if (jobs.length === 0) return { executed: 0, failed: 0 };

  const key = await selectKeyForScope(env, "text");
  if (!key) return { executed: 0, failed: 0 }; // no active AI key donated yet — jobs stay queued, not failed

  let executed = 0;
  let failed = 0;

  for (const job of jobs) {
    await env.DB.prepare("UPDATE generation_jobs SET status = 'running' WHERE id = ?").bind(job.id).run();
    const started = Date.now();
    try {
      const ayah = await env.DB.prepare(
        `SELECT a.number, s.name_transliteration AS surah_name, t.text AS translation
         FROM ayah a JOIN surah s ON s.id = a.surah_id
         LEFT JOIN translation t ON t.ayah_id = a.id AND t.lang = 'id'
         WHERE a.id = ?`
      )
        .bind(job.target_id)
        .first<{ number: number; surah_name: string; translation: string }>();
      const tafsirRow = await env.DB.prepare("SELECT text FROM tafsir WHERE ayah_id = ? LIMIT 1")
        .bind(job.target_id)
        .first<{ text: string }>();
      const haditsRows = await env.DB.prepare(
        "SELECT h.text_id FROM hadits h JOIN ayah_hadits_map m ON m.hadits_id = h.id WHERE m.ayah_id = ?"
      )
        .bind(job.target_id)
        .all<{ text_id: string }>();
      const categories = await env.DB.prepare("SELECT id, name FROM categories").all<{ id: number; name: string }>();

      if (!ayah) throw new Error("Ayah not found for job target");

      const draft = await generateStoryDraft(key.entry.provider, key.rawKey, {
        surah: ayah.surah_name,
        ayah: ayah.number,
        ayahText: ayah.translation ?? "",
        tafsirSummary: tafsirRow?.text ?? "(belum ada tafsir tersimpan)",
        relatedHadits: haditsRows.results.map((h) => h.text_id).join(" | "),
        existingCategories: categories.results,
      });

      let categoryId: number | null = draft.categoryExistingId;
      if (!categoryId && draft.categoryNewName) {
        // Reuse an existing category with essentially the same name before
        // creating a new one — the model doesn't always pick the matching id
        // out of `existingCategories` even when one already exists (e.g. it
        // proposes "Tadabbur Al-Qur'an" again when that category is already
        // there under a different slug). That used to leave a duplicate
        // filter chip on the site with zero stories in it forever.
        const wanted = normalizeCategoryName(draft.categoryNewName);
        const dupe = categories.results.find((c) => normalizeCategoryName(c.name) === wanted);
        if (dupe) {
          categoryId = dupe.id;
        } else {
          const slug = slugify(draft.categoryNewName);
          const newCat = await env.DB.prepare(
            "INSERT INTO categories (name, slug, auto_created) VALUES (?, ?, 1) ON CONFLICT(slug) DO NOTHING RETURNING id"
          )
            .bind(draft.categoryNewName, slug)
            .first<{ id: number }>();
          categoryId =
            newCat?.id ??
            (await env.DB.prepare("SELECT id FROM categories WHERE slug = ?").bind(slug).first<{ id: number }>())?.id ??
            null;
        }
      }

      // Zero-hand platform: nobody works a manual moderation queue, so
      // "pending_review" used to mean "invisible on the site forever" for a
      // draft that had already passed fact-checking — exactly what produced
      // audiobook category chips with nothing behind them. The fact-check +
      // confidence gate below IS the review; publish immediately when it
      // passes instead of parking the story in a queue no one empties.
      const status = draft.factCheckVerdict === "pass" && draft.confidence >= 0.6 ? "published" : "draft";
      const publishedAt = status === "published" ? new Date().toISOString() : null;

      await env.DB.prepare(
        `INSERT INTO stories (title, slug, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
         VALUES (?, ?, ?, ?, 1, 'draft_audio', 'ai_original', ?, ?, ?, ?)`
      )
        .bind(draft.title, uniqueSlug(draft.slug, job.id), categoryId, draft.body, status, draft.confidence, job.target_id, publishedAt)
        .run();

      await env.DB.prepare(
        "UPDATE generation_jobs SET status = 'pending_review', output_ref = ?, completed_at = datetime('now'), key_id = ? WHERE id = ?"
      )
        .bind(JSON.stringify({ title: draft.title, confidence: draft.confidence, verdict: draft.factCheckVerdict }), key.entry.id, job.id)
        .run();

      await recordKeyUsage(env, key.entry.id, Date.now() - started, true);
      executed++;
    } catch (err) {
      await env.DB.prepare("UPDATE generation_jobs SET status = 'failed', error = ? WHERE id = ?")
        .bind(String(err instanceof Error ? err.message : err), job.id)
        .run();
      await recordKeyUsage(env, key.entry.id, Date.now() - started, false);
      failed++;
    }
  }

  return { executed, failed };
}

function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function uniqueSlug(base: string, jobId: number): string {
  return `${base}-${jobId}`.slice(0, 95);
}
