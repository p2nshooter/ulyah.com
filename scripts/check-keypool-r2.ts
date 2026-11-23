/**
 * The AI / GPU key pool lives in R2, never D1 (owner, 22 Nov 2026: "Jgn ke D1, pindah ke R2"). Checked against an
 * in-memory R2 binding with R2's conditional-write semantics: the same key pasted twice is one key, two writers on
 * one key never lose an update, the whole pool is summarised from one LIST (customMetadata) with no secret in it,
 * and no Worker code touches ai_key_pool in D1 any more.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  createKey, getKeyRow, listKeySummaries, setKeyState, updateKey, forgetPool, toMeta, fromMeta, keyFingerprint,
} from "../apps/worker-api/src/lib/keypool-store";
import { isGpuKey } from "../apps/worker-api/src/lib/gpu-check";

class FakeR2 {
  objects = new Map<string, { body: string; etag: string; meta: Record<string, string> }>();
  n = 0;
  async put(key: string, value: string | ArrayBuffer, opts: { onlyIf?: { etagMatches?: string; etagDoesNotMatch?: string }; customMetadata?: Record<string, string> } = {}) {
    const cur = this.objects.get(key);
    if (opts.onlyIf?.etagDoesNotMatch === "*" && cur) return null;
    if (opts.onlyIf?.etagMatches && (!cur || cur.etag !== opts.onlyIf.etagMatches)) return null;
    const etag = `e${++this.n}`;
    this.objects.set(key, { body: typeof value === "string" ? value : "", etag, meta: opts.customMetadata ?? {} });
    return { key, etag };
  }
  async get(key: string) {
    const o = this.objects.get(key);
    if (!o) return null;
    return { etag: o.etag, json: async () => JSON.parse(o.body), text: async () => o.body, body: o.body, httpMetadata: {} };
  }
  async list(opts: { prefix?: string; cursor?: string; limit?: number }) {
    const all = [...this.objects.entries()].filter(([k]) => k.startsWith(opts.prefix ?? "")).sort(([a], [b]) => a.localeCompare(b));
    const start = Number(opts.cursor ?? 0);
    const lim = opts.limit ?? 1000;
    const page = all.slice(start, start + lim);
    return { objects: page.map(([key, o]) => ({ key, customMetadata: o.meta })), truncated: start + lim < all.length, cursor: String(start + lim) };
  }
}

let n = 0;
const ok = (s: string) => console.log(`  ok  ${s} (${++n})`);

async function main() {
  const r2 = new FakeR2();
  const env = { MEDIA_R2: r2, KEY_ENCRYPTION_SECRET: "x" } as never;
  const base = {
    provider: "hf-zerogpu", scope: "gpu" as const, key_ref: "CIPHERTEXT", key_iv: "IV", status: "active" as const, priority: 5,
    donor_label: "Hamba Allah ✨", donated_by_client_id: 7, quota_limit: null, quota_used: 0, latency_ms: 90, last_health_check: null,
  };
  const fp = await keyFingerprint("hf_secret_token");
  const a = await createKey(env, { ...base, key_fingerprint: fp });
  const b = await createKey(env, { ...base, key_fingerprint: fp });
  assert.equal(a.created, true);
  assert.deepEqual(b, { id: a.id, created: false }, "the same key pasted twice is one key");
  ok("create-once: a duplicate key answers with the first one's id");

  forgetPool();
  const pool = await listKeySummaries(env);
  assert.equal(pool.length, 1);
  assert.equal(pool[0]!.donor_label, "Hamba Allah ✨", "non-ASCII labels survive the metadata");
  assert.ok(!("key_ref" in pool[0]!) && !("key_iv" in pool[0]!), "no secret in the summary");
  assert.ok(!JSON.stringify(r2.objects.get(`c/ai_key_pool/${a.id}.json`)!.meta).includes("CIPHERTEXT"), "no secret in the metadata");
  ok("the pool is summarised from one LIST, without a secret");

  await Promise.all([
    setKeyState(env, a.id, { quota_delta: 1 }),
    setKeyState(env, a.id, { quota_delta: 1 }),
    updateKey(env, a.id, (r) => ({ ...r, priority: 2 })),
  ]);
  const row = await getKeyRow(env, a.id);
  assert.equal(row!.quota_used, 2, "two concurrent uses both counted");
  assert.equal(row!.priority, 2);
  assert.equal(row!.key_ref, "CIPHERTEXT", "the encrypted key is never touched by a state change");
  ok("compare-and-swap: concurrent updates are all kept");

  const m = toMeta(row!);
  assert.deepEqual(fromMeta(row!.id, m).quota_used, 2);
  assert.ok(Object.keys(m).every((k) => /^[a-z]+$/.test(k)), "metadata names are lowercase letters (safe as S3 headers)");
  assert.ok(Object.values(m).every((v) => /^[\x20-\x7e]*$/.test(v)), "metadata values are ASCII");
  ok("metadata round-trips and is header-safe");

  assert.equal(isGpuKey({ provider: "replicate", scope: "text" }), true);
  assert.equal(isGpuKey({ provider: "groq", scope: "text" }), false);
  assert.equal(isGpuKey({ provider: "groq", scope: "image" }), true);
  ok("GPU keys are recognised by provider or scope");

  // No Worker code reads or writes the key pool in D1 any more.
  const root = join(import.meta.dirname, "../apps/worker-api/src");
  const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  const offenders = walk(root).filter((f) => f.endsWith(".ts") && /(FROM|INTO|UPDATE)\s+(ai_key_pool|key_validation_log)\b/.test(readFileSync(f, "utf8")));
  assert.deepEqual(offenders, [], "no SQL on ai_key_pool / key_validation_log in the Worker");
  ok("no D1 query on the key pool anywhere in the Worker");

  console.log(`\ncheck-keypool-r2: ALL OK (${n})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
