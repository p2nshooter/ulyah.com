/**
 * Concurrency, checked for the two ways it fails silently.
 *
 * Order: a paragraph paired to the wrong translation reads perfectly on the
 * page. The workers here finish deliberately out of order, and results must
 * still land against their own batch.
 *
 * Key isolation: two workers sharing a key spend one quota twice as fast and
 * each mark it cooling for the other, so 489 keys behave like a handful. Every
 * key must belong to exactly one slice, and no slice may be stuck on a single
 * provider.
 *
 *   npx tsx scripts/check-parallel-translate.mjs
 */
import { splitPool, concurrencyFor, translateBatchesParallel } from "./ai-translate.ts";
// The REAL pool shape: rankPool() sorts by provider, so the array arrives
// grouped in contiguous runs, at the live counts.
const COUNTS = [["google-ai-studio", 242], ["groq", 202], ["openrouter", 34], ["nvidia-nim", 11]];
const pool = [];
for (const [provider, n] of COUNTS)
  for (let i = 0; i < n; i++) pool.push({ id: pool.length, provider, key: `k${pool.length}`, fails: 0 });

let bad = 0;
const ok = (n, c, x = "") => { if (!c) bad++; console.log(`  ${c ? "ok  " : "FAIL"} ${n} ${x}`); };

// 1. slices share no key, lose no key
const n = concurrencyFor(pool);
const slices = splitPool(pool, n);
const ids = slices.flat().map(k => k.id);
ok("concurrency scales with pool size", n === 16, `n=${n}`);
ok("every key lands in exactly one slice", new Set(ids).size === 489 && ids.length === 489);
ok("no slice is empty", slices.every(s => s.length > 0), `sizes ${slices[0].length}..`);
// The property that matters: no slice may be a single provider, or that
// worker inherits one provider's rate limit and the concurrency is fake.
const perSlice = slices.map(s => new Set(s.map(k => k.provider)).size);
ok("no slice is stuck on a single provider", Math.min(...perSlice) > 1, `fewest providers in a slice: ${Math.min(...perSlice)}`);
// A provider with fewer keys than there are slices cannot reach them all —
// nvidia-nim has 11 keys for 16 workers. What must hold is that the two large
// providers, which carry the run, are in every slice.
const big = ["google-ai-studio", "groq"];
ok("both large providers reach every slice",
   slices.every(s => big.every(p => s.some(k => k.provider === p))));

// 2. order is preserved even when workers finish out of order
const batches = Array.from({ length: 200 }, (_, i) => [`src-${i}-a`, `src-${i}-b`]);
const seenBy = new Map();          // key id -> concurrent uses
let inFlight = 0, peak = 0;
const out = await translateBatchesParallel(pool, batches, "es", "en", async (slice, batch) => {
  inFlight++; peak = Math.max(peak, inFlight);
  for (const k of slice) seenBy.set(k.id, (seenBy.get(k.id) ?? 0));
  // finish in a deliberately scrambled order
  await new Promise(r => setTimeout(r, (batch[0].length * 7) % 23));
  inFlight--;
  return batch.map(s => s.replace("src", "dst"));
});
ok("every batch has a result", out.length === 200 && out.every(Boolean));
const ordered = out.every((r, i) => r[0] === `dst-${i}-a` && r[1] === `dst-${i}-b`);
ok("results map back to their own batch, in order", ordered);
ok("work actually ran concurrently", peak > 1, `peak in-flight = ${peak}`);
ok("concurrency did not exceed the slice count", peak <= n, `peak=${peak} n=${n}`);

// 3. a tiny pool must not over-slice
ok("pool of 6 keys → 1 worker", concurrencyFor(pool.slice(0, 6)) === 1);
ok("pool of 40 keys → 10 workers", concurrencyFor(pool.slice(0, 40)) === 10);

console.log(bad ? `\nFAILED ${bad}` : "\nparallel translation: ok");
process.exit(bad ? 1 : 0);
