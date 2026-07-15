import type { Env } from "../env.js";
import { safeKvPut } from "./kv-safe.js";

/**
 * Per-worker "I'm alive" record so the admin portal can show a genuinely
 * live status bar for each background job separately, rather than one
 * combined "engine on/off" toggle. Every sub-task inside scheduled() reports
 * in after it runs (success or failure) — the admin UI colors each job
 * green/stale purely from how recently its own heartbeat landed.
 *
 * Cloudflare's free KV tier caps writes at 1000/day. The cron now runs every
 * minute (1440 ticks/day) across 4 workers — stamping KV on every single
 * tick would be 5760 writes/day from heartbeats ALONE, starving out every
 * other KV write the app does (translation cache, config, etc: safeKvPut
 * silently drops writes once the daily quota is spent, so a heartbeat spam
 * problem would quietly break unrelated features). So a heartbeat is only
 * actually written to KV when the worker's ok/fail status just changed, or
 * at most every MIN_WRITE_INTERVAL_MS — ticks in between just skip the
 * write. The UI still reads as "live" for a worker whose last real write is
 * within LIVE_WINDOW_MS, which is comfortably wider than the throttle
 * window, so a worker that's genuinely still ticking every minute never
 * flickers to "stale" between throttled writes.
 */
export interface WorkerHeartbeat {
  key: string;
  label: string;
  lastRunAt: string;
  ok: boolean;
  detail: string;
  durationMs: number;
}

const MIN_WRITE_INTERVAL_MS = 10 * 60 * 1000; // 10 min -> well under the 1000/day KV write budget
export const LIVE_WINDOW_MS = 20 * 60 * 1000; // UI treats a heartbeat within this window as "running"

// Every worker the scheduled() cron drives, in the order they run — kept as
// a fixed list (not derived from KV) so a worker that has NEVER run yet
// still shows up in the panel as "belum pernah jalan" instead of silently
// missing from the list.
export const KNOWN_WORKERS: { key: string; label: string }[] = [
  { key: "keypool-health", label: "Key Pool Health Check" },
  { key: "scaling-tick", label: "Content-Gap Scheduler (Scaling)" },
  { key: "r2-cleanup", label: "R2 Cleanup" },
  { key: "orchestra-maintenance", label: "Orchestra Maintenance (key wake-up)" },
];

async function readHeartbeat(env: Env, key: string): Promise<WorkerHeartbeat | null> {
  const raw = await env.CACHE_KV.get(`heartbeat:${key}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WorkerHeartbeat;
  } catch {
    return null;
  }
}

/** Wraps a scheduled sub-task so its outcome (success/failure + duration) is
 * recorded — throttled per the module doc above — even if it throws (a
 * crash still counts as "it ran", and always writes immediately since a
 * fresh failure is exactly what the admin panel most needs to surface). */
export async function withHeartbeat(env: Env, key: string, label: string, task: () => Promise<unknown>): Promise<void> {
  const started = Date.now();
  try {
    const result = await task();
    await maybeRecord(env, key, label, true, summarize(result), Date.now() - started);
  } catch (e) {
    // Failures always write immediately (a state change), never throttled.
    await recordHeartbeat(env, key, label, false, e instanceof Error ? e.message.slice(0, 200) : String(e), Date.now() - started);
    throw e; // let the caller's own .catch(console.error) still log it
  }
}

async function maybeRecord(env: Env, key: string, label: string, ok: boolean, detail: string, durationMs: number): Promise<void> {
  const prev = await readHeartbeat(env, key);
  const statusChanged = !prev || prev.ok !== ok;
  const dueForRefresh = !prev || Date.now() - new Date(prev.lastRunAt).getTime() >= MIN_WRITE_INTERVAL_MS;
  if (!statusChanged && !dueForRefresh) return; // still alive and recently stamped — skip the KV write
  await recordHeartbeat(env, key, label, ok, detail, durationMs);
}

async function recordHeartbeat(env: Env, key: string, label: string, ok: boolean, detail: string, durationMs: number): Promise<void> {
  const hb: WorkerHeartbeat = { key, label, lastRunAt: new Date().toISOString(), ok, detail, durationMs };
  await safeKvPut(env, `heartbeat:${key}`, JSON.stringify(hb), { expirationTtl: 60 * 60 * 24 * 7 });
}

function summarize(result: unknown): string {
  if (result == null) return "ok";
  if (typeof result === "string") return result.slice(0, 200);
  try {
    return JSON.stringify(result).slice(0, 200);
  } catch {
    return "ok";
  }
}

export async function getAllHeartbeats(env: Env): Promise<WorkerHeartbeat[]> {
  return Promise.all(
    KNOWN_WORKERS.map(async ({ key, label }) => {
      const hb = await readHeartbeat(env, key);
      return hb ?? { key, label, lastRunAt: "", ok: false, detail: "belum pernah jalan", durationMs: 0 };
    })
  );
}
