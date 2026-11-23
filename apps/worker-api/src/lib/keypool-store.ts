import type { AiKeyPoolEntry, KeyScope } from "@ulyah/shared/types";
import type { Env } from "../env.js";

/**
 * The donated AI / GPU key pool, in R2 — never D1 (owner, 20 Oct and 22 Nov 2026: „Jgn ke D1, pindah ke R2, jgn pernah
 * memakai D1 sebagai database"; docs/R2-DATA-BLUEPRINT.md §3–§5, module "Kunci AI").
 *
 *   c/ai_key_pool/<id>.json        one document per key: the encrypted key (key_ref + key_iv, AES-GCM, never plain)
 *                                  and its state. Its customMetadata carries every NON-secret field, so one LIST call
 *                                  returns the whole pool's summary without reading a single document.
 *   u/ai_key_pool/fp/<sha256>      create-once guard: the same key pasted twice is one key.
 *   l/key_validation/<day>/<...>   append-only test log, one object per test (no hot key).
 *
 * Writes are create-once (`etagDoesNotMatch: "*"`) or compare-and-swap (`etagMatches`), retried on a lost race, so
 * a health tick and an admin retest touching the same key can never overwrite each other.
 */

export interface KeyRow extends AiKeyPoolEntry {
  key_ref: string;
  key_iv: string;
  key_fingerprint: string | null;
  /** The last test's verdict — lets a wrongly-rejected key be healed without reading the log. */
  last_test_passed: boolean | null;
}
export type KeySummary = Omit<KeyRow, "key_ref" | "key_iv">;

export const KEY_PREFIX = "c/ai_key_pool/";
const docKey = (id: number) => `${KEY_PREFIX}${id}.json`;
const fpKey = (fp: string) => `u/ai_key_pool/fp/${fp}`;

/**
 * Short metadata names: they travel as `x-amz-meta-<name>` headers when a script writes through the S3 API, so they
 * stay lowercase letters only, and values are ASCII (the donor label is URI-encoded).
 */
export const META_NAMES: Record<string, string> = {
  provider: "p", scope: "s", status: "st", quota_used: "qu", quota_limit: "ql", latency_ms: "lat", priority: "pri",
  donated_by_client_id: "cid", donor_label: "dl", last_health_check: "lhc", created_at: "ca", key_fingerprint: "fp",
  last_test_passed: "ltp",
};

export function toMeta(r: KeyRow | KeySummary): Record<string, string> {
  const m: Record<string, string> = {};
  for (const [field, short] of Object.entries(META_NAMES)) {
    const v = (r as unknown as Record<string, unknown>)[field];
    const str = v === null || v === undefined ? "" : String(v);
    m[short] = field === "donor_label" ? encodeURIComponent(str) : str;
  }
  return m;
}

export function fromMeta(id: number, raw: Record<string, string>): KeySummary {
  const m: Record<string, string> = {};
  for (const [field, short] of Object.entries(META_NAMES)) m[field] = raw[short] ?? "";
  const num = (v: string | undefined) => (v === undefined || v === "" ? null : Number(v));
  let label = m.donor_label || "";
  try {
    label = decodeURIComponent(label);
  } catch {
    /* keep as stored */
  }
  return {
    id,
    provider: m.provider ?? "",
    scope: (m.scope || "text") as KeyScope,
    status: (m.status || "pending_verification") as AiKeyPoolEntry["status"],
    quota_used: Number(m.quota_used) || 0,
    quota_limit: num(m.quota_limit),
    latency_ms: num(m.latency_ms),
    priority: Number(m.priority) || 5,
    donated_by_client_id: num(m.donated_by_client_id),
    donor_label: label || null,
    last_health_check: m.last_health_check || null,
    created_at: m.created_at || "",
    key_fingerprint: m.key_fingerprint || null,
    last_test_passed: m.last_test_passed === "" ? null : m.last_test_passed === "true",
  };
}

/** SHA-256 hex fingerprint of a raw key — for dedup, never reversible. */
export async function keyFingerprint(rawKey: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawKey));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const nowIso = () => new Date().toISOString();

// A short per-isolate memo of the summary list: one LIST call serves every key choice for a few seconds.
let memo: { at: number; rows: KeySummary[] } | null = null;
const MEMO_MS = 15_000;
export function forgetPool(): void {
  memo = null;
}

/** Every key's non-secret state, from one paged LIST (customMetadata). Empty when R2 is not bound. */
export async function listKeySummaries(env: Env, opts: { fresh?: boolean } = {}): Promise<KeySummary[]> {
  if (!env.MEDIA_R2) return [];
  if (!opts.fresh && memo && Date.now() - memo.at < MEMO_MS) return memo.rows;
  const rows: KeySummary[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 50; page++) {
    const res = await env.MEDIA_R2.list({ prefix: KEY_PREFIX, cursor, limit: 1000, include: ["customMetadata"] } as R2ListOptions);
    for (const o of res.objects) {
      const id = Number(/(\d+)\.json$/.exec(o.key)?.[1]);
      if (Number.isFinite(id)) rows.push(fromMeta(id, (o.customMetadata ?? {}) as Record<string, string>));
    }
    if (!res.truncated) break;
    cursor = (res as { cursor?: string }).cursor;
    if (!cursor) break;
  }
  memo = { at: Date.now(), rows };
  return rows;
}

export async function getKeyRow(env: Env, id: number): Promise<KeyRow | null> {
  const obj = await env.MEDIA_R2?.get(docKey(id));
  if (!obj) return null;
  try {
    return (await obj.json()) as KeyRow;
  } catch {
    return null;
  }
}

/** A random integer below `n`, from the platform's cryptographic generator. */
function randomBelow(n: number): number {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0]! % n;
}

function newId(): number {
  // Milliseconds × 1000 + a random tail: unique without a counter (a counter would be a hot key).
  return Date.now() * 1000 + randomBelow(1000);
}

/**
 * Store a new key. With a fingerprint, the same key is stored once: a second paste answers `created: false` with
 * the first one's id.
 */
export async function createKey(
  env: Env,
  input: Omit<KeyRow, "id" | "created_at" | "last_test_passed"> & { last_test_passed?: boolean | null; id?: number; created_at?: string }
): Promise<{ id: number; created: boolean }> {
  if (!env.MEDIA_R2) throw new Error("R2 is not bound — keys cannot be stored.");
  const id = input.id ?? newId();
  if (input.key_fingerprint) {
    const guard = await env.MEDIA_R2.put(fpKey(input.key_fingerprint), String(id), { onlyIf: { etagDoesNotMatch: "*" } });
    if (!guard) {
      const prev = Number(await (await env.MEDIA_R2.get(fpKey(input.key_fingerprint)))?.text());
      return { id: Number.isFinite(prev) ? prev : id, created: false };
    }
  }
  const row: KeyRow = { ...input, id, created_at: input.created_at ?? nowIso(), last_test_passed: input.last_test_passed ?? null } as KeyRow;
  const put = await env.MEDIA_R2.put(docKey(id), JSON.stringify(row), {
    onlyIf: { etagDoesNotMatch: "*" },
    customMetadata: toMeta(row),
    httpMetadata: { contentType: "application/json" },
  });
  forgetPool();
  return { id, created: Boolean(put) };
}

/** Compare-and-swap update of one key. `mutate` returns the next row, or null to leave it. */
export async function updateKey(env: Env, id: number, mutate: (row: KeyRow) => KeyRow | null): Promise<KeyRow | null> {
  if (!env.MEDIA_R2) return null;
  for (let i = 0; i < 6; i++) {
    const obj = await env.MEDIA_R2.get(docKey(id));
    if (!obj) return null;
    const cur = (await obj.json()) as KeyRow;
    const next = mutate({ ...cur });
    if (!next) return cur;
    const put = await env.MEDIA_R2.put(docKey(id), JSON.stringify(next), {
      onlyIf: { etagMatches: obj.etag },
      customMetadata: toMeta(next),
      httpMetadata: { contentType: "application/json" },
    });
    if (put) {
      forgetPool();
      return next;
    }
    await new Promise((r) => setTimeout(r, 120 + randomBelow(300)));
  }
  return null;
}

/** Set status / latency after a test or a use; records the verdict on the key itself. */
export function setKeyState(
  env: Env,
  id: number,
  patch: { status?: string; latency_ms?: number | null; quota_delta?: number; passed?: boolean }
): Promise<KeyRow | null> {
  return updateKey(env, id, (r) => ({
    ...r,
    status: (patch.status ?? r.status) as KeyRow["status"],
    latency_ms: patch.latency_ms === undefined ? r.latency_ms : patch.latency_ms,
    quota_used: r.quota_used + (patch.quota_delta ?? 0),
    last_health_check: nowIso(),
    last_test_passed: patch.passed === undefined ? r.last_test_passed : patch.passed,
  }));
}

export interface ValidationEntry {
  key_id: number;
  test_type: string;
  passed: boolean;
  latency_ms: number;
  safety_score: number;
  detail: string;
}

/** Append one test result to the log (one object per entry; never rewritten). */
export async function logValidation(env: Env, e: ValidationEntry): Promise<void> {
  if (!env.MEDIA_R2) return;
  const at = nowIso();
  const objectName = `l/key_validation/${at.slice(0, 10)}/${at}-${e.key_id}-${randomBelow(1e9).toString(36)}.json`;
  await env.MEDIA_R2.put(objectName, JSON.stringify({ ...e, created_at: at }), { onlyIf: { etagDoesNotMatch: "*" } }).catch(() => null);
}

/** Group the pool like `GROUP BY provider, scope, status` did. */
export function groupPool(rows: KeySummary[]): { provider: string; scope: string; status: string; keys: number; avg_latency_ms: number | null; quota_used: number }[] {
  const by = new Map<string, { provider: string; scope: string; status: string; keys: number; lat: number; latN: number; quota_used: number }>();
  for (const r of rows) {
    const k = `${r.provider}|${r.scope}|${r.status}`;
    const g = by.get(k) ?? { provider: r.provider, scope: r.scope, status: r.status, keys: 0, lat: 0, latN: 0, quota_used: 0 };
    g.keys++;
    if (r.latency_ms !== null) (g.lat += r.latency_ms), g.latN++;
    g.quota_used += r.quota_used;
    by.set(k, g);
  }
  return [...by.values()]
    .map((g) => ({ provider: g.provider, scope: g.scope, status: g.status, keys: g.keys, avg_latency_ms: g.latN ? Math.round(g.lat / g.latN) : null, quota_used: g.quota_used }))
    .sort((a, b) => a.provider.localeCompare(b.provider) || a.scope.localeCompare(b.scope));
}
