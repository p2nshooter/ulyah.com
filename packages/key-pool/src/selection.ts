import type { AiKeyPoolEntry, KeyScope } from "@ulyah/shared/types";

/**
 * Smart-scaling key selection — arsitektur doc §13.2.
 * Score = weighted blend of remaining quota, inverse latency, and admin
 * priority. Higher is better. Used by KeyPoolCoordinator (Durable Object)
 * on every job submission, and by the admin dashboard to preview ranking.
 */
export function scoreKey(entry: AiKeyPoolEntry): number {
  if (entry.status !== "active" && entry.status !== "slow") return -Infinity;

  const quotaRemainingRatio =
    entry.quota_limit && entry.quota_limit > 0
      ? Math.max(0, 1 - entry.quota_used / entry.quota_limit)
      : 0.5; // unknown-quota providers (e.g. flat free tier) default to neutral

  const latency = entry.latency_ms ?? 2000;
  const latencyScore = Math.max(0, 1 - latency / 5000); // 0ms=1.0, >=5s=0

  const priorityScore = 1 - (entry.priority - 1) / 9; // priority 1 (highest) -> 1.0, 10 -> ~0

  const statusPenalty = entry.status === "slow" ? 0.5 : 1;

  return (quotaRemainingRatio * 0.5 + latencyScore * 0.3 + priorityScore * 0.2) * statusPenalty;
}

export function pickBestKey(
  candidates: AiKeyPoolEntry[],
  scope: KeyScope,
  provider?: string
): AiKeyPoolEntry | null {
  const eligible = candidates.filter(
    (k) => k.scope === scope && (!provider || k.provider === provider)
  );
  if (eligible.length === 0) return null;

  let best: AiKeyPoolEntry | null = null;
  let bestScore = -Infinity;
  for (const k of eligible) {
    const s = scoreKey(k);
    if (s > bestScore) {
      bestScore = s;
      best = k;
    }
  }
  return bestScore === -Infinity ? null : best;
}

/** Ranks a whole pool for a scope, descending — used by the admin Key Pool table. */
export function rankPool(candidates: AiKeyPoolEntry[], scope: KeyScope): AiKeyPoolEntry[] {
  return candidates
    .filter((k) => k.scope === scope)
    .slice()
    .sort((a, b) => scoreKey(b) - scoreKey(a));
}
