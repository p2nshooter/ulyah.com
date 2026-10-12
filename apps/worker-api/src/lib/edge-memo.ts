import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../env.js";

/**
 * Compute a JSON-serialisable value at most once per `ttlSeconds` per colo,
 * keeping it in Cloudflare's edge cache (Cache API — free, no quota).
 *
 * WHY. The admin's Analytics tab polled four endpoints every 2–30 seconds, and
 * three of them answer with full-table aggregates over analytics_pageviews and
 * site_pageviews: about twenty-five scans per refresh. On the Workers Free plan
 * the whole account shares five million D1 row reads a day, and from
 * 1 Sep 2026 every D1 query fails once they are spent (code 7500) — every site,
 * the admin login included — until midnight UTC. An hour with that tab open was
 * enough to do it. A count of last month's visitors does not change in ten
 * seconds; computing it once every few minutes costs a thousandth of the reads
 * and shows the same numbers.
 *
 * The key lives under this Worker's own origin at a path no route serves
 * (`/__memo/…`): Cache API entries are only ever returned to code that asks for
 * them by key, never to a visitor. Only call this AFTER the request has been
 * authorised — the value is whatever the caller computed for an admin.
 *
 * Failure of the cache is never failure of the request: a miss, a broken
 * cache or a missing execution context all fall through to `compute()`.
 */
export async function edgeMemo<T>(
  c: Context<{ Bindings: Env }>,
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  let cache: Cache | null = null;
  let req: Request | null = null;
  try {
    cache = (caches as unknown as { default: Cache }).default;
    req = new Request(`${new URL(c.req.url).origin}/__memo/${encodeURIComponent(key)}`, { method: "GET" });
    const hit = await cache.match(req);
    if (hit) return (await hit.json()) as T;
  } catch {
    /* no cache here (tests, local dev) — compute below */
  }

  const value = await compute();

  if (cache && req) {
    const res = new Response(JSON.stringify(value), {
      headers: { "content-type": "application/json", "cache-control": `public, s-maxage=${ttlSeconds}` },
    });
    const put = cache.put(req, res).catch(() => undefined);
    try {
      c.executionCtx.waitUntil(put);
    } catch {
      await put;
    }
  }
  return value;
}

/**
 * The same, as route middleware, for a handler whose whole JSON answer can be
 * kept: `adminRoute.get("/x", memoResponse("x", 600), handler)`. Keyed by the
 * name plus the query string. Mount it after the auth middleware, as above.
 */
export function memoResponse(name: string, ttlSeconds: number): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    let cache: Cache | null = null;
    let req: Request | null = null;
    try {
      const url = new URL(c.req.url);
      cache = (caches as unknown as { default: Cache }).default;
      req = new Request(`${url.origin}/__memo/${encodeURIComponent(name)}${url.search}`, { method: "GET" });
      const hit = await cache.match(req);
      if (hit) {
        const out = new Response(hit.body, hit);
        // The entry's s-maxage is for this cache only, not for a browser.
        out.headers.set("cache-control", "private, no-store");
        return out;
      }
    } catch {
      cache = null;
    }
    await next();
    const res = c.res;
    if (!cache || !req || !res.ok || !(res.headers.get("content-type") ?? "").includes("json")) return;
    const copy = new Response(res.clone().body, res);
    copy.headers.set("cache-control", `public, s-maxage=${ttlSeconds}`);
    // Never keep one origin's CORS grant in the entry; cors() re-applies it.
    copy.headers.delete("Access-Control-Allow-Origin");
    copy.headers.delete("Access-Control-Allow-Credentials");
    const put = cache.put(req, copy).catch(() => undefined);
    try {
      c.executionCtx.waitUntil(put);
    } catch {
      await put;
    }
    c.res.headers.set("cache-control", "private, no-store");
  };
}
