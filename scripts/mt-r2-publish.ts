/**
 * Publish the translation cache to R2, and read back what is already there.
 *
 * Owner: "berapapun hasil translate langsung oper ke r2 … pada saat mulai awal
 * baca R2 nya dulu udah sampe mana … banyak translate pada ilang".
 *
 * The translations were never lost. D1 filled up and stopped accepting writes,
 * so the warm job's output was discarded on the way in — it reported success
 * having stored nothing. Putting the output in R2 instead means a full D1 can
 * never cost a translation again, and it is R2 that answers "how far did we
 * get" when the next pass starts.
 *
 * SHARDING matches the Worker's reader exactly (see mt-r2.ts): keys are
 * `mt:<src>-<tgt>:<hash>` with a base36 hash, so the first two characters of
 * the hash split a language pair into ~1,296 shards of a few dozen KB. A page
 * fetches only the shards its own strings land in.
 *
 * THIS IS THE ONLY WRITER. A shard is a JSON object, so adding an entry is
 * read-modify-write; two writers would silently overwrite each other's work,
 * which is the very failure being fixed. Workers only read.
 *
 * Merging, never replacing: a shard is loaded, new entries are folded in, and
 * the result written back. A pass that only translated ten strings does not
 * erase the ten thousand already published.
 *
 * Usage: npx tsx scripts/mt-r2-publish.ts [--pairs=id-es,en-es] [--dry]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mtShardKey } from "../apps/worker-api/src/lib/mt-r2.js";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const BUCKET = "ulyah-media";

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    dry: args.dry === "true",
    // Blank = every pair present in mt_cache.
    pairs: ((args.pairs as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^[a-z]{2}-[a-z]{2}$/.test(s)),
  };
}

function wrangler(args: string[], capture = false): string {
  return (
    execFileSync("npx", ["wrangler", ...args], {
      cwd: WORKER_CWD,
      encoding: "utf8",
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
      maxBuffer: 256 * 1024 * 1024,
    }) ?? ""
  );
}

function d1Json<T>(sql: string): T[] {
  const out = wrangler(["d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`], true);
  try {
    const parsed = JSON.parse(out);
    return ((Array.isArray(parsed) ? parsed[0]?.results : parsed?.results) ?? []) as T[];
  } catch {
    return [];
  }
}

/** A pair name is only ever built from this, so it can never carry SQL. */
const safePair = (p: string) => /^[a-z]{2}-[a-z]{2}$/.test(p);

async function main() {
  const { dry, pairs } = parseArgs();

  const found = d1Json<{ pair: string; n: number }>(
    `SELECT substr(k,4,5) AS pair, COUNT(*) AS n FROM mt_cache
      WHERE k LIKE 'mt:__-__:%' GROUP BY pair ORDER BY n DESC;`
  ).filter((r) => safePair(r.pair));
  const todo = pairs.length ? found.filter((r) => pairs.includes(r.pair)) : found;
  if (todo.length === 0) {
    console.log("No language pairs found in mt_cache.");
    return;
  }
  console.log(`Publishing ${todo.length} pair(s): ${todo.map((r) => `${r.pair} (${r.n})`).join(", ")}`);

  const dir = mkdtempSync(join(tmpdir(), "mtr2-"));
  let published = 0;
  let alreadyThere = 0;
  let shardsWritten = 0;
  try {
    for (const { pair } of todo) {
      if (!safePair(pair)) continue;
      // Everything D1 holds for this pair. Read in pages so a large pair does
      // not have to fit in one wrangler response.
      const rows: { k: string; v: string }[] = [];
      for (let off = 0; ; off += 5000) {
        const page = d1Json<{ k: string; v: string }>(
          `SELECT k, v FROM mt_cache WHERE k LIKE 'mt:${pair}:%' ORDER BY k LIMIT 5000 OFFSET ${off};`
        );
        rows.push(...page);
        if (page.length < 5000) break;
      }
      // Group by the shard the Worker will look in.
      const byShard = new Map<string, Record<string, string>>();
      for (const r of rows) {
        const shardKey = mtShardKey(r.k);
        if (!shardKey) continue;
        const bucketed = byShard.get(shardKey) ?? {};
        bucketed[r.k] = r.v;
        byShard.set(shardKey, bucketed);
      }

      for (const [shardKey, entries] of byShard) {
        // READ WHAT IS ALREADY THERE FIRST — this is the "udah sampe mana".
        // Merge rather than replace, so a pass that added ten strings does not
        // erase what earlier passes published.
        const local = join(dir, shardKey.replace(/\//g, "_"));
        let existing: Record<string, string> = {};
        try {
          wrangler(["r2", "object", "get", `${BUCKET}/${shardKey}`, `--file=${local}`, "--remote"], true);
          const parsed = JSON.parse(readFileSync(local, "utf8")) as unknown;
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            existing = parsed as Record<string, string>;
          }
        } catch {
          /* no shard yet — this pair has not been published before */
        }

        const before = Object.keys(existing).length;
        const merged = { ...existing, ...entries };
        const after = Object.keys(merged).length;
        alreadyThere += before;
        if (after === before) continue; // nothing new for this shard

        if (dry) {
          console.log(`  --dry: ${shardKey} ${before} → ${after}`);
          published += after - before;
          continue;
        }
        writeFileSync(local, JSON.stringify(merged), "utf8");
        wrangler(["r2", "object", "put", `${BUCKET}/${shardKey}`, `--file=${local}`, "--remote"], true);
        published += after - before;
        shardsWritten++;
        if (shardsWritten % 50 === 0) console.log(`  … ${shardsWritten} shards, ${published} new entries`);
      }
      console.log(`  ${pair}: ${rows.length} row(s) in D1 → R2`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  console.log(
    `Published ${published} new translation(s) across ${shardsWritten} shard(s). ` +
      `${alreadyThere} were already in R2 and were left alone.`
  );
}

await main();
