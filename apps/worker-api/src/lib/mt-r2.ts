import type { Env } from "../env.js";

/**
 * Translations, read from R2.
 *
 * Owner: "berapapun hasil translate langsung oper ke r2 … banyak translate
 * pada ilang".
 *
 * They were not lost. D1 hit its 500 MB ceiling and stopped accepting writes,
 * so every translation the warm job produced was discarded on the way in — the
 * run reported success having stored nothing — and pages fell back to their
 * source language. The cache could not be filled, so it looked emptied.
 *
 * The durable answer is to stop putting the bulk of it in D1 at all. The warm
 * job writes its output to R2 and the Worker reads it from there, so a full D1
 * can no longer cost a single translation.
 *
 * ONE WRITER, MANY READERS — and that is the whole reason this file only
 * reads. A shard is a JSON object, so adding one entry means read-modify-write;
 * if Workers did that concurrently they would overwrite each other and lose
 * translations, which is the exact thing this is meant to prevent. The warm
 * job is a single process and is the only writer. Workers read.
 *
 * SHARDING. One object per language pair would be ~25 MB — too much to parse
 * per lookup. Keys are `mt:<src>-<tgt>:<hash>` where the hash is base36, so
 * the first two characters split a pair into ~1,296 shards of a few dozen KB.
 * A page needs only the shards its own strings fall in, each fetched once per
 * isolate and then held in memory.
 */

/** Where a translation lives in R2, derived from its existing cache key. */
export function mtShardKey(cacheKey: string): string | null {
  // mt:<src>-<tgt>:<hash>
  const m = /^mt:([a-z]{2})-([a-z]{2}):([0-9a-z]+)$/.exec(cacheKey);
  if (!m) return null;
  const [, src, tgt, hash] = m;
  const prefix = hash!.slice(0, 2).padEnd(2, "0");
  return `mt/${src}-${tgt}/${prefix}.json`;
}

/**
 * Shards already fetched by this isolate.
 *
 * A miss is remembered as an empty map on purpose: a language pair the warm
 * job has not reached yet would otherwise be re-fetched on every string of
 * every page, turning one missing shard into hundreds of R2 round trips.
 */
const shards = new Map<string, Promise<Record<string, string>>>();

function loadShard(env: Env, shardKey: string): Promise<Record<string, string>> {
  const held = shards.get(shardKey);
  if (held) return held;
  const p = (async () => {
    try {
      const obj = await env.MEDIA_R2.get(shardKey);
      if (!obj) return {};
      const parsed = JSON.parse(await obj.text()) as unknown;
      // A shard that is not a flat object is a shard we do not understand;
      // treating it as empty falls back to D1 rather than serving rubbish as
      // scripture.
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return parsed as Record<string, string>;
    } catch {
      return {};
    }
  })();
  shards.set(shardKey, p);
  return p;
}

/** One translation from R2, or null. Never throws. */
export async function mtR2Get(env: Env, cacheKey: string): Promise<string | null> {
  const shardKey = mtShardKey(cacheKey);
  if (!shardKey) return null;
  const shard = await loadShard(env, shardKey);
  const v = shard[cacheKey];
  return typeof v === "string" && v.length > 0 ? v : null;
}

/**
 * Many at once, grouped so each shard is fetched once however many keys fall
 * in it — the batch path exists precisely because a page asks for dozens of
 * strings at a time.
 */
export async function mtR2GetMany(env: Env, cacheKeys: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const byShard = new Map<string, string[]>();
  for (const k of new Set(cacheKeys)) {
    const shardKey = mtShardKey(k);
    if (!shardKey) continue;
    const list = byShard.get(shardKey);
    if (list) list.push(k);
    else byShard.set(shardKey, [k]);
  }
  await Promise.all(
    [...byShard.entries()].map(async ([shardKey, keys]) => {
      const shard = await loadShard(env, shardKey);
      for (const k of keys) {
        const v = shard[k];
        if (typeof v === "string" && v.length > 0) out.set(k, v);
      }
    })
  );
  return out;
}
