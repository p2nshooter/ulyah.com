/**
 * ONE-TIME move of the donated AI / GPU key pool out of D1 into R2 (owner, 22 Nov 2026: „Jgn ke D1, pindah ke R2,
 * jgn pernah memakai D1 sebagai database"; docs/R2-DATA-BLUEPRINT.md §5 — "copy with the same ids, check every row
 * arrived").
 *
 * Every `ai_key_pool` row becomes `c/ai_key_pool/<id>.json` — the SAME id, the key still encrypted exactly as it was
 * (key_ref + key_iv are copied, never decrypted) — with its non-secret state as customMetadata (the names the Worker
 * reads: apps/worker-api/src/lib/keypool-store.ts), plus the fingerprint guard `u/ai_key_pool/fp/<sha256>`.
 * Create-once: a document already in R2 is never overwritten. Then every row is read back and compared; the move is
 * recorded in `c/_moves/keypool.json` only when all of them arrived. D1 is only ever READ here, and only by this
 * script; after a verified move nothing reads `ai_key_pool` again.
 *
 * Usage (GitHub Actions, workflow move-to-r2.yml): npx tsx scripts/move-keypool-to-r2.ts [--dry]
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { R2S3, mapLimit } from "./lib/r2-s3";
import { META_NAMES, toMeta, KEY_PREFIX, type KeyRow } from "../apps/worker-api/src/lib/keypool-store";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");

function legacyRead<T>(sql: string): T[] {
  const out = execFileSync("npx", ["wrangler", "d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`], {
    cwd: WORKER_CWD,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 256 * 1024 * 1024,
  });
  const parsed = JSON.parse(out) as unknown;
  const results = Array.isArray(parsed) ? (parsed[0] as { results?: T[] })?.results : (parsed as { results?: T[] })?.results;
  return results ?? [];
}

const iso = (v: unknown): string | null => {
  if (typeof v !== "string" || !v) return null;
  // SQLite datetime('now') is "YYYY-MM-DD HH:MM:SS" in UTC.
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v) ? `${v.replace(" ", "T")}Z` : v;
};

async function main() {
  const dry = process.argv.includes("--dry");
  const r2 = R2S3.fromEnv();
  if (!r2) {
    console.error("CLOUDFLARE_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY are required.");
    process.exit(1);
  }
  const done = await r2.getJson<{ verified?: boolean; at?: string; count?: number }>("c/_moves/keypool.json");
  if (done?.value.verified && !process.argv.includes("--force")) {
    console.log(`Key pool already moved on ${done.value.at} (${done.value.count} keys). D1 is not read again.`);
    return;
  }

  const rows: Record<string, unknown>[] = [];
  for (let off = 0; ; off += 500) {
    const page = legacyRead<Record<string, unknown>>(`SELECT * FROM ai_key_pool ORDER BY id LIMIT 500 OFFSET ${off};`);
    rows.push(...page);
    if (page.length < 500) break;
  }
  // The last verdict per key, so a key's health travels with it (keypool-store.ts last_test_passed).
  const lastPass = new Map<number, boolean>();
  try {
    for (const r of legacyRead<{ key_id: number; passed: number }>(
      "SELECT key_id, passed FROM key_validation_log v WHERE v.id = (SELECT MAX(id) FROM key_validation_log WHERE key_id = v.key_id);"
    )) {
      lastPass.set(Number(r.key_id), Number(r.passed) === 1);
    }
  } catch {
    /* the log is history; a key without it simply has no verdict yet */
  }
  console.log(`D1 holds ${rows.length} key(s).`);

  const docs: KeyRow[] = rows.map((r) => ({
    id: Number(r.id),
    provider: String(r.provider ?? ""),
    scope: String(r.scope ?? "text") as KeyRow["scope"],
    key_ref: String(r.key_ref ?? ""),
    key_iv: String(r.key_iv ?? ""),
    status: String(r.status ?? "pending_verification") as KeyRow["status"],
    priority: Number(r.priority ?? 5),
    donor_label: (r.donor_label as string | null) ?? null,
    donated_by_client_id: r.donated_by_client_id == null ? null : Number(r.donated_by_client_id),
    quota_limit: r.quota_limit == null ? null : Number(r.quota_limit),
    quota_used: Number(r.quota_used ?? 0),
    latency_ms: r.latency_ms == null ? null : Number(r.latency_ms),
    last_health_check: iso(r.last_health_check),
    created_at: iso(r.created_at) ?? new Date().toISOString(),
    key_fingerprint: (r.key_fingerprint as string | null) ?? null,
    last_test_passed: lastPass.has(Number(r.id)) ? lastPass.get(Number(r.id))! : null,
  }));
  if (docs.some((d) => !Number.isFinite(d.id) || !d.key_ref || !d.key_iv)) throw new Error("a row without id or encrypted key — refusing to move");
  if (dry) {
    console.log(`--dry: ${docs.length} document(s) would be written. Metadata names: ${Object.values(META_NAMES).join(",")}`);
    return;
  }

  let written = 0;
  let existed = 0;
  await mapLimit(docs, 16, async (d) => {
    const r = await r2.put(`${KEY_PREFIX}${d.id}.json`, JSON.stringify(d), { ifNoneMatch: true, meta: toMeta(d) });
    if (r.ok) written++;
    else existed++;
    if (d.key_fingerprint) await r2.put(`u/ai_key_pool/fp/${d.key_fingerprint}`, String(d.id), { ifNoneMatch: true, contentType: "text/plain" });
  });

  // Read every one back.
  let missing = 0;
  await mapLimit(docs, 16, async (d) => {
    const back = await r2.getJson<KeyRow>(`${KEY_PREFIX}${d.id}.json`);
    if (!back || back.value.id !== d.id || back.value.key_ref !== d.key_ref || back.value.key_iv !== d.key_iv) missing++;
  });
  const verified = missing === 0;
  await r2.updateJson("c/_moves/keypool.json", () => ({ at: new Date().toISOString(), count: docs.length, written, existed, missing, verified }));
  console.log(`Written ${written}, already in R2 ${existed}, missing after read-back ${missing}. ${verified ? "MOVE_VERIFIED=1" : "MOVE_VERIFIED=0"}`);
  if (!verified) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
