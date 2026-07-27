/**
 * The gtx fallback must actually run when the key pool is empty.
 *
 * This exists because it silently did not. A warm pass reported
 *
 *   AI pool: KEY_ENCRYPTION_SECRET not set — falling back to gtx.
 *   Translated 0, failed/unchanged 32190.
 *   Upstream: the pool answered 0 of 0 batch(es), gtx answered 0 of 0.
 *
 * Zero of zero: thirty-two thousand strings counted as failures without one
 * upstream call. splitPool dropped every empty slice, the caller turns slices
 * into workers, and no workers means Promise.all([]) resolves at once leaving
 * every result undefined — which the caller reads as failure. The pass looked
 * like a translator refusing us. Nothing had been asked.
 *
 * The two assertions below are the two halves of that bug, so a future change
 * that reintroduces either one fails here instead of in production.
 */
import assert from "node:assert/strict";
import { splitPool, translateBatchesParallel } from "./ai-translate.ts";

// 1. An empty pool still yields workers.
const none = splitPool([], 16);
assert.ok(none.length > 0, "an empty pool must still yield at least one worker slice");
assert.ok(
  none.every((s) => s.length === 0),
  "slices from an empty pool carry no keys"
);

// 2. A non-empty pool is unchanged: no empty slices, every key kept exactly once.
const keys = Array.from({ length: 9 }, (_, i) => ({ id: i, provider: "groq", key: `k${i}`, fails: 0 }));
const some = splitPool(keys, 4);
assert.ok(some.every((s) => s.length > 0), "no empty slice when the pool has keys");
assert.equal(
  some.reduce((n, s) => n + s.length, 0),
  keys.length,
  "every key is handed to exactly one worker"
);
const seen = new Set(some.flat().map((k) => k.key));
assert.equal(seen.size, keys.length, "no key is handed to two workers");

// 3. The whole point: with NO pool, every batch is still attempted, and the
//    attempt is handed an empty slice so translateBatch goes straight to gtx.
const batches = [["satu", "dua"], ["tiga"], ["empat", "lima", "enam"]];
const asked = [];
const out = await translateBatchesParallel([], batches, "es", "id", async (slice, batch) => {
  assert.equal(slice.length, 0, "a keyless worker is handed an empty slice, not a key");
  asked.push(batch);
  return batch.map((t) => `<${t}>`);
});
assert.equal(asked.length, batches.length, `every batch must be attempted (got ${asked.length})`);
assert.deepEqual(
  out,
  [["<satu>", "<dua>"], ["<tiga>"], ["<empat>", "<lima>", "<enam>"]],
  "results stay paired to their own batch, in order"
);
assert.ok(
  out.every((r) => r !== undefined),
  "no result hole is left for the caller to misread as a failure"
);

console.log("check-empty-pool: ok — the gtx fallback runs even with no keys");
