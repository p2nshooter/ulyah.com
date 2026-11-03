import type { R2Like } from '../src/lib/store.ts';

/** R2 tiruan di memori: create-once (etagDoesNotMatch '*'), CAS (etagMatches), daftar berurutan. */
export class FakeR2 implements R2Like {
  m = new Map<string, { v: string; etag: string; meta?: Record<string, string>; up: Date }>();
  n = 0;
  async get(k: string) {
    const o = this.m.get(k);
    return o ? { etag: o.etag, text: async () => o.v, body: o.v } : null;
  }
  async head(k: string) {
    const o = this.m.get(k);
    return o ? { etag: o.etag, uploaded: o.up, customMetadata: o.meta } : null;
  }
  async put(k: string, v: string | ArrayBuffer | ReadableStream | Uint8Array, opts?: { onlyIf?: { etagMatches?: string; etagDoesNotMatch?: string }; customMetadata?: Record<string, string> }) {
    const cur = this.m.get(k);
    if (opts?.onlyIf?.etagDoesNotMatch === '*' && cur) return null;
    if (opts?.onlyIf?.etagMatches && cur?.etag !== opts.onlyIf.etagMatches) return null;
    const etag = `e${++this.n}`;
    this.m.set(k, { v: typeof v === 'string' ? v : '[binary]', etag, meta: opts?.customMetadata, up: new Date() });
    return { etag };
  }
  async delete(keys: string | string[]) {
    for (const k of Array.isArray(keys) ? keys : [keys]) this.m.delete(k);
  }
  async list(o?: { prefix?: string; limit?: number }) {
    const objects = [...this.m.entries()].filter(([k]) => k.startsWith(o?.prefix ?? '')).sort(([a], [b]) => a.localeCompare(b)).slice(0, o?.limit ?? 1000)
      .map(([key, x]) => ({ key, uploaded: x.up, size: x.v.length, etag: x.etag, customMetadata: x.meta }));
    return { objects, truncated: false };
  }
}
