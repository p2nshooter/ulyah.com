/**
 * R2 through its S3 API, for jobs that run outside a Worker (GitHub Actions).
 *
 * Owner, 20 Oct 2026 and again 22 Nov 2026: „Jgn ke D1, pindah ke R2, jgn pernah memakai D1 sebagai database".
 * Every durable write from a script goes through here, and every write that can race is conditional
 * (docs/R2-DATA-BLUEPRINT.md §3):
 *   · create-once    → `If-None-Match: *`   (R2 answers 412 when the key already exists)
 *   · compare-and-swap → `If-Match: <etag>` (R2 answers 412 when somebody wrote in between)
 * R2 takes about one write per second per key and answers 429 beyond it; 429 and 5xx are retried with
 * backoff, everything else is returned to the caller.
 *
 * Needs CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY (the same secrets the R2 report and
 * the murottal jobs use) and optionally R2_BUCKET (default ulyah-media, the bucket the Worker binds as
 * MEDIA_R2).
 */
import { AwsClient } from "aws4fetch";

export interface R2Object {
  body: string;
  etag: string;
}

export interface PutResult {
  ok: boolean;
  /** 412 = the condition failed (key exists / changed). */
  status: number;
  etag?: string;
}

/** Anything that can do an S3 request — the real signer, or a fake in the checks. */
export type S3Fetch = (url: string, init?: RequestInit) => Promise<Response>;

export class R2S3 {
  constructor(
    private readonly fetcher: S3Fetch,
    private readonly base: string,
    private readonly sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))
  ) {}

  /** The real bucket, from the environment; null when the secrets are absent. */
  static fromEnv(): R2S3 | null {
    const account = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
    const id = process.env.R2_ACCESS_KEY_ID ?? "";
    const secret = process.env.R2_SECRET_ACCESS_KEY ?? "";
    if (!account || !id || !secret) return null;
    const bucket = process.env.R2_BUCKET || "ulyah-media";
    const aws = new AwsClient({ accessKeyId: id, secretAccessKey: secret, region: "auto", service: "s3" });
    return new R2S3((url, init) => aws.fetch(url, init), `https://${account}.r2.cloudflarestorage.com/${bucket}`);
  }

  private url(key: string): string {
    return `${this.base}/${key.split("/").map(encodeURIComponent).join("/")}`;
  }

  /** One request with retries on 429 / 5xx / network errors. */
  private async send(url: string, init?: RequestInit): Promise<Response> {
    let last: unknown;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        const res = await this.fetcher(url, init);
        if (res.status !== 429 && res.status < 500) return res;
        last = new Error(`R2 ${init?.method ?? "GET"} ${res.status}`);
        await res.body?.cancel().catch(() => undefined);
      } catch (err) {
        last = err;
      }
      await this.sleep(Math.min(8000, 400 * 2 ** attempt) + Math.floor(Math.random() * 250));
    }
    throw last instanceof Error ? last : new Error(String(last));
  }

  /** Every key under a prefix (paged by 1,000). */
  async list(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    let token: string | undefined;
    for (let page = 0; page < 100_000; page += 1) {
      const u = new URL(this.base);
      u.searchParams.set("list-type", "2");
      u.searchParams.set("max-keys", "1000");
      u.searchParams.set("prefix", prefix);
      if (token) u.searchParams.set("continuation-token", token);
      const res = await this.send(u.toString());
      if (!res.ok) throw new Error(`R2 LIST ${prefix} → ${res.status} ${await res.text().catch(() => "")}`);
      const xml = await res.text();
      for (const m of xml.matchAll(/<Key>([\s\S]*?)<\/Key>/g)) keys.push(decodeXml(m[1]!));
      const next = /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml)?.[1];
      if (!next || !/<IsTruncated>true<\/IsTruncated>/.test(xml)) break;
      token = decodeXml(next);
    }
    return keys;
  }

  async get(key: string): Promise<R2Object | null> {
    const res = await this.send(this.url(key));
    if (res.status === 404) {
      await res.body?.cancel().catch(() => undefined);
      return null;
    }
    if (!res.ok) throw new Error(`R2 GET ${key} → ${res.status}`);
    return { body: await res.text(), etag: res.headers.get("etag") ?? "" };
  }

  async getJson<T>(key: string): Promise<{ value: T; etag: string } | null> {
    const o = await this.get(key);
    if (!o) return null;
    return { value: JSON.parse(o.body) as T, etag: o.etag };
  }

  /**
   * PUT, optionally conditional. `ifMatch` = compare-and-swap on that etag, `ifNoneMatch: true` = create-once.
   * Returns status 412 (ok=false) when the condition failed — never throws for that.
   */
  async put(
    key: string,
    body: string,
    opts: { ifMatch?: string; ifNoneMatch?: boolean; contentType?: string } = {}
  ): Promise<PutResult> {
    const headers: Record<string, string> = { "content-type": opts.contentType ?? "application/json; charset=utf-8" };
    if (opts.ifMatch) headers["if-match"] = opts.ifMatch;
    if (opts.ifNoneMatch) headers["if-none-match"] = "*";
    const res = await this.send(this.url(key), { method: "PUT", body, headers });
    await res.body?.cancel().catch(() => undefined);
    if (res.status === 412) return { ok: false, status: 412 };
    if (!res.ok) throw new Error(`R2 PUT ${key} → ${res.status}`);
    return { ok: true, status: res.status, etag: res.headers.get("etag") ?? undefined };
  }

  async delete(key: string): Promise<void> {
    const res = await this.send(this.url(key), { method: "DELETE" });
    await res.body?.cancel().catch(() => undefined);
    if (!res.ok && res.status !== 404) throw new Error(`R2 DELETE ${key} → ${res.status}`);
  }

  /**
   * Read-modify-write a JSON document with compare-and-swap: `mutate` gets the current value (or null)
   * and returns the next one (or null to leave it alone). Retried from a fresh read when another writer
   * got there first, so no update is ever lost.
   */
  async updateJson<T>(key: string, mutate: (cur: T | null) => T | null, tries = 8): Promise<T | null> {
    for (let i = 0; i < tries; i += 1) {
      const cur = await this.getJson<T>(key);
      const next = mutate(cur ? cur.value : null);
      if (next === null) return cur ? cur.value : null;
      const r = await this.put(key, JSON.stringify(next), cur ? { ifMatch: cur.etag } : { ifNoneMatch: true });
      if (r.ok) return next;
      await this.sleep(250 + Math.floor(Math.random() * 500) * (i + 1));
    }
    throw new Error(`R2 ${key}: gave up after ${tries} conflicting writes`);
  }
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Run `fn` over `items` with at most `n` in flight; results keep their order. */
export async function mapLimit<T, R>(items: readonly T[], n: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(n, items.length)) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!, i);
    }
  });
  await Promise.all(workers);
  return out;
}
