/**
 * R2 Store — satu-satunya basis data yapida.sch.id (aturan tetap pemilik: R2 saja, tidak pernah D1).
 *
 * Kunci (docs/R2-DATA-BLUEPRINT.md §3 di repo ulyah.com):
 *   c/<koleksi>/<id>.json       dokumen (sumber kebenaran)
 *   u/<nama>/<nilai>            penjaga keunikan, ditulis create-once (If-None-Match: *)
 *   i/<indeks>/<…>/<urut>~<id>  entri indeks, ringkasan di customMetadata.m
 *   k/<nama>.json               pengaturan & rahasia terenkripsi
 *   l/<aliran>/<…>              log hanya-tambah
 *
 * Tidak ada kunci panas: R2 menerima satu tulis per detik per kunci, jadi penghitung tidak pernah
 * ditulis per kejadian — statistik dihitung dari log.
 */

export interface R2Like {
  get(key: string): Promise<{ text(): Promise<string>; etag: string } | null>;
  head(key: string): Promise<{ etag: string; uploaded: Date; customMetadata?: Record<string, string> } | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ReadableStream,
    options?: { onlyIf?: { etagMatches?: string; etagDoesNotMatch?: string }; customMetadata?: Record<string, string>; httpMetadata?: { contentType?: string } },
  ): Promise<{ etag: string } | null>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: { prefix?: string; cursor?: string; startAfter?: string; limit?: number; include?: ('customMetadata' | 'httpMetadata')[] }): Promise<{
    objects: { key: string; uploaded: Date; size: number; etag: string; customMetadata?: Record<string, string> }[];
    truncated: boolean;
    cursor?: string;
  }>;
}

export class BusyError extends Error {
  constructor(what: string) {
    super(`${what} sedang diubah proses lain. Coba lagi.`);
    this.name = 'BusyError';
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function transient(err: unknown): boolean {
  const m = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  return /\b(429|500|502|503|504)\b|10058|too many|rate limit|temporar|internal error|network|reset|timed? ?out/i.test(m);
}

export function backoff(attempt: number): number {
  const base = Math.min(4000, 250 * 2 ** attempt);
  return Math.round(base / 2 + Math.random() * (base / 2));
}

async function retry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
  for (let i = 0; ; i += 1) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts - 1 || !transient(err)) throw err;
      await sleep(backoff(i));
    }
  }
}

const JSON_TYPE = { contentType: 'application/json' };

/** Ringkasan untuk customMetadata: JSON ASCII murni (huruf non-ASCII di-escape) karena metadata berjalan sebagai header. */
export function metaStr(meta: Record<string, unknown>): string {
  return JSON.stringify(meta).replace(/[\u0080-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

/** Urutan terbaru-dulu untuk kunci indeks. */
export function invTs(ms = Date.now()): string {
  return String(9_999_999_999_999 - ms).padStart(13, '0');
}

export interface Listed<M> {
  key: string;
  id: string;
  meta: M;
  uploaded: Date;
}

export class Store {
  constructor(readonly b: R2Like) {}

  async get<T>(key: string): Promise<T | null> {
    const o = await retry(() => this.b.get(key));
    return o ? (JSON.parse(await o.text()) as T) : null;
  }

  async put(key: string, value: unknown, meta?: Record<string, unknown>): Promise<void> {
    await retry(() =>
      this.b.put(key, JSON.stringify(value), { httpMetadata: JSON_TYPE, customMetadata: meta ? { m: metaStr(meta) } : undefined }),
    );
  }

  /** Tulis hanya bila kunci belum ada. true = tulisan ini yang menang. */
  async createOnce(key: string, value: unknown, meta?: Record<string, unknown>): Promise<boolean> {
    const res = await retry(() =>
      this.b.put(key, JSON.stringify(value), {
        onlyIf: { etagDoesNotMatch: '*' },
        httpMetadata: JSON_TYPE,
        customMetadata: meta ? { m: metaStr(meta) } : undefined,
      }),
    );
    return Boolean(res);
  }

  /**
   * Compare-and-swap. `fn` menerima dokumen sekarang (atau null) dan mengembalikan dokumen baru,
   * atau null untuk tidak mengubah apa pun. Ditulis sebagai transisi keadaan karena bisa diulang.
   */
  async cas<T>(key: string, fn: (cur: T | null) => T | null, what = 'Data'): Promise<T | null> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const o = await retry(() => this.b.get(key));
      const cur = o ? (JSON.parse(await o.text()) as T) : null;
      const next = fn(cur === null ? null : structuredClone(cur));
      if (next === null || next === undefined) return cur;
      try {
        const res = await this.b.put(key, JSON.stringify(next), {
          onlyIf: o ? { etagMatches: o.etag } : { etagDoesNotMatch: '*' },
          httpMetadata: JSON_TYPE,
        });
        if (res) return next;
      } catch (err) {
        if (!transient(err)) throw err;
      }
      await sleep(backoff(attempt));
    }
    throw new BusyError(what);
  }

  async del(keys: string | string[]): Promise<void> {
    const arr = Array.isArray(keys) ? keys : [keys];
    for (let i = 0; i < arr.length; i += 1000) {
      const part = arr.slice(i, i + 1000);
      if (part.length) await retry(() => this.b.delete(part));
    }
  }

  async list<M = Record<string, unknown>>(prefix: string, opts: { limit?: number; cursor?: string } = {}): Promise<{ items: Listed<M>[]; cursor?: string }> {
    const res = await retry(() => this.b.list({ prefix, limit: opts.limit ?? 100, cursor: opts.cursor, include: ['customMetadata'] }));
    const items = res.objects.map((o) => {
      const tail = o.key.slice(prefix.length);
      const id = tail.includes('~') ? tail.slice(tail.lastIndexOf('~') + 1) : tail.replace(/\.json$/, '');
      let meta = {} as M;
      try {
        if (o.customMetadata?.m) meta = JSON.parse(o.customMetadata.m) as M;
      } catch {
        /* ringkasan rusak: biarkan kosong */
      }
      return { key: o.key, id, meta, uploaded: o.uploaded };
    });
    return { items, cursor: res.truncated ? res.cursor : undefined };
  }

  /** Semua kunci di bawah awalan (untuk cron: backup, retensi). */
  async *keys(prefix: string): AsyncGenerator<{ key: string; uploaded: Date; size: number }> {
    let cursor: string | undefined;
    do {
      const res = await retry(() => this.b.list({ prefix, cursor, limit: 1000 }));
      for (const o of res.objects) yield { key: o.key, uploaded: o.uploaded, size: o.size };
      cursor = res.truncated ? res.cursor : undefined;
    } while (cursor);
  }

  /** Log hanya-tambah; kunci berurutan waktu. */
  async append(stream: string, value: unknown, meta?: Record<string, unknown>): Promise<void> {
    const id = `${invTs()}~${crypto.randomUUID().slice(0, 8)}`;
    await this.createOnce(`l/${stream}/${id}.json`, value, meta);
  }
}
