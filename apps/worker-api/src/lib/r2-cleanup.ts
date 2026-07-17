import type { Env } from "../env.js";
import { safeKvGet, safeKvPut } from "./kv-safe.js";

// Murottal audio used to be re-hosted under this prefix in R2 before the
// architecture switched to streaming directly from each reciter's public CDN
// (see qori-cdn.ts on the web side). Those objects are now dead weight — this
// deletes them once, in the background, guarded by a KV flag so it never runs
// twice. R2's list()/delete() live only inside a Worker (wrangler's r2 CLI has
// no `list`), so the cleanup runs here in scheduled(), not in the deploy job.
const OBSOLETE_PREFIX = "audio/qori/";
const DONE_FLAG = "cleanup:r2-murottal-objects-done";

export async function cleanupObsoleteMurottalR2(env: Env): Promise<void> {
  const done = await safeKvGet(env, DONE_FLAG);
  if (done) return;

  let cursor: string | undefined;
  let deleted = 0;
  // One scheduled tick handles a bounded slice; if there's ever a huge backlog
  // the flag stays unset and the next tick continues where the cursor left off.
  for (let page = 0; page < 20; page++) {
    const listing = await env.MEDIA_R2.list({ prefix: OBSOLETE_PREFIX, cursor, limit: 1000 });
    const keys = listing.objects.map((o) => o.key);
    if (keys.length > 0) {
      await env.MEDIA_R2.delete(keys);
      deleted += keys.length;
    }
    if (listing.truncated) {
      cursor = listing.cursor;
    } else {
      await safeKvPut(env, DONE_FLAG, `1:${deleted}`);
      console.log(`R2 murottal cleanup complete — removed ${deleted} obsolete objects.`);
      return;
    }
  }
  console.log(`R2 murottal cleanup: removed ${deleted} objects this tick, more remain — continuing next tick.`);
}
