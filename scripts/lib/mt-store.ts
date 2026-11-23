/**
 * The translation store, in R2 only (owner 22 Nov 2026: „Jgn ke D1, pindah ke R2, jgn pernah memakai D1
 * sebagai database").
 *
 * Layout — exactly what the Worker reads (apps/worker-api/src/lib/mt-r2.ts):
 *   mt/<src>-<tgt>/<2-char hash prefix>.json   { "mt:<src>-<tgt>:<hash>": "<translation>", … }
 *
 * A shard is a JSON object, so adding an entry is read-modify-write. Every write is a compare-and-swap on
 * the shard's etag (`If-Match`, or `If-None-Match: *` for a new shard); when another writer got there first
 * the shard is read again, our entries are folded into what is there now, and the write is retried — so two
 * engine passes running side by side can never erase each other's work. Existing entries are never
 * overwritten unless the caller asks (`replace`), which is what makes re-running a pass harmless.
 */
import { mtShardKey } from "../../apps/worker-api/src/lib/mt-r2";
import { mapLimit, type R2S3 } from "./r2-s3";

type Shard = { etag: string | null; data: Record<string, string> };

export class MtStore {
  private readonly shards = new Map<string, Shard>();
  private readonly loaded = new Set<string>();
  private readonly staged = new Map<string, Map<string, { v: string; replace: boolean }>>();
  stagedCount = 0;
  written = 0;
  shardsWritten = 0;
  conflicts = 0;

  constructor(
    private readonly r2: R2S3,
    private readonly concurrency = 32
  ) {}

  /** Read every shard of a language pair (e.g. "id-fr") once. */
  async loadPair(pair: string): Promise<void> {
    if (this.loaded.has(pair)) return;
    const keys = (await this.r2.list(`mt/${pair}/`)).filter((k) => /^mt\/[a-z]{2}-[a-z]{2}\/[0-9a-z]{2}\.json$/.test(k));
    await mapLimit(keys, this.concurrency, async (k) => {
      const o = await this.r2.get(k);
      if (!o) return;
      let data: Record<string, string> = {};
      try {
        const parsed = JSON.parse(o.body) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) data = parsed as Record<string, string>;
      } catch {
        /* an unreadable shard is treated as empty; our CAS write will replace it with a readable one */
      }
      this.shards.set(k, { etag: o.etag, data });
    });
    this.loaded.add(pair);
  }

  /** Forget a pair so the next loadPair reads R2 afresh (used to verify a move). */
  forget(pair: string): void {
    this.loaded.delete(pair);
    for (const k of [...this.shards.keys()]) if (k.startsWith(`mt/${pair}/`)) this.shards.delete(k);
  }

  get(key: string): string | undefined {
    const sk = mtShardKey(key);
    if (!sk) return undefined;
    const v = this.shards.get(sk)?.data[key];
    if (typeof v === "string" && v) return v;
    return this.staged.get(sk)?.get(key)?.v;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /** Number of stored entries for a pair (loaded shards only). */
  countPair(pair: string): number {
    let n = 0;
    for (const [k, s] of this.shards) if (k.startsWith(`mt/${pair}/`)) n += Object.keys(s.data).length;
    return n;
  }

  stage(key: string, value: string, replace = false): void {
    const sk = mtShardKey(key);
    if (!sk || !value) return;
    let m = this.staged.get(sk);
    if (!m) this.staged.set(sk, (m = new Map()));
    if (!m.has(key)) this.stagedCount += 1;
    m.set(key, { v: value, replace });
  }

  /** Write every staged entry, shard by shard, with compare-and-swap. */
  async flush(): Promise<number> {
    const work = [...this.staged.entries()];
    this.staged.clear();
    this.stagedCount = 0;
    let added = 0;
    await mapLimit(work, this.concurrency, async ([sk, entries]) => {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        let cur = this.shards.get(sk);
        if (!cur || attempt > 0) {
          const o = await this.r2.get(sk);
          let data: Record<string, string> = {};
          if (o) {
            try {
              data = JSON.parse(o.body) as Record<string, string>;
            } catch {
              data = {};
            }
          }
          cur = { etag: o ? o.etag : null, data };
        }
        const next = { ...cur.data };
        let changed = 0;
        for (const [k, { v, replace }] of entries) {
          if (next[k] === v) continue;
          if (next[k] && !replace) continue;
          next[k] = v;
          changed += 1;
        }
        if (changed === 0) {
          this.shards.set(sk, cur);
          return;
        }
        const r = await this.r2.put(sk, JSON.stringify(next), cur.etag ? { ifMatch: cur.etag } : { ifNoneMatch: true });
        if (r.ok) {
          this.shards.set(sk, { etag: r.etag ?? null, data: next });
          added += changed;
          this.shardsWritten += 1;
          return;
        }
        this.conflicts += 1; // somebody wrote this shard in between — read it again and fold ours in
        this.shards.delete(sk);
      }
      throw new Error(`${sk}: still conflicting after 10 attempts`);
    });
    this.written += added;
    return added;
  }
}
