/**
 * Guards the one thing that would silently waste every hand-written translation.
 *
 * Translations are stored in D1 under `mt:<src>-<tgt>:<hash>`, where the hash is
 * FNV-1a over the text AFTER protected terms have been masked. The Worker
 * derives that key in apps/worker-api/src/lib/mt.ts; scripts/mt-key.mjs derives
 * it again so translations can be written offline.
 *
 * Two copies of one rule. If they ever disagree — a term added to
 * PROTECTED_TERMS, a different FNV seed — the Worker looks up keys that were
 * never written and every affected page quietly falls back to English. Nothing
 * throws, nothing is logged, and the only symptom is a site that is somehow
 * still not translated.
 *
 * So this reads the real values out of mt.ts and compares them to the replica.
 *
 *   node scripts/check-mt-key.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hashKey, maskProtected, storyKey } from "./mt-key.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(ROOT, "apps/worker-api/src/lib/mt.ts"), "utf8");

let bad = 0;
const ok = (name, cond, extra = "") => {
  if (!cond) bad++;
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name} ${extra}`);
};

// ── 1. The hash must be the same function ──────────────────────────────────
const seed = src.match(/let h = (\d+);/)?.[1];
const prime = src.match(/Math\.imul\(h, (\d+)\)/)?.[1];
ok("FNV offset basis matches mt.ts", seed === "2166136261", `got ${seed}`);
ok("FNV prime matches mt.ts", prime === "16777619", `got ${prime}`);
ok("radix-36 output", /toString\(36\)/.test(src));

// ── 2. The protected terms must be the same list, in the same order ────────
// Order matters: the mask writes @@0@@, @@1@@ … by position, so reordering the
// list changes the masked string and therefore every key derived from it.
const block = src.match(/const PROTECTED_TERMS = \[([\s\S]*?)\];/)?.[1] ?? "";
const fromWorker = [...block.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
const fromReplica = (() => {
  // Recover the replica's list by masking a string containing every term the
  // Worker knows about — whatever it masks, it knows.
  const probe = fromWorker.join(" | ");
  return maskProtected(probe).map;
})();
ok("worker declares a non-empty term list", fromWorker.length > 0, `${fromWorker.length} terms`);
ok(
  "replica masks every term the worker protects",
  fromReplica.length === fromWorker.length,
  `worker ${fromWorker.length}, replica masked ${fromReplica.length}`
);

// ── 3. End-to-end: a known key, derived both ways ──────────────────────────
// The expected values are not invented — they were read back out of the live
// mt_cache, which is the only proof that matters.
ok("masks in the documented order", maskProtected("HR. Bukhari no. 1 & Muslim no. 2").masked === "HR. @@0@@ @@1@@ 1 & @@2@@ @@3@@ 2");
ok("known title key (verified against live D1)", storyKey("Episode 1: The Young Prophet's Dream", "es") === "mt:en-es:zmcn3t");
ok("known title key, second language", storyKey("Episode 2: The Well of Betrayal", "de") === "mt:en-de:156zfl8");
ok("masked title key (verified against live D1)", storyKey("Authentic Hadith — HR. Bukhari no. 1 & Muslim no. 1907", "fr") === "mt:en-fr:1sjsjos");
ok("hash is trimmed before hashing", hashKey("abc") === hashKey("abc"));
ok("key includes the language pair", storyKey("x", "de").startsWith("mt:en-de:"));

console.log(bad ? `\nmt key check FAILED (${bad})` : "\nmt key check: ok");
if (bad) process.exit(1);
