import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * WITHOUT THIS, `export const revalidate` DOES NOTHING.
 *
 * OpenNext needs somewhere to keep a rendered page. With no incremental cache
 * configured — which is what `defineCloudflareConfig()` with no arguments
 * meant — every request re-ran the full render and every API call it made, no
 * matter what a route declared as its revalidate period.
 *
 * That is how the ecosystem went down. 4,967 library pages, 1,191 stories and
 * the rest were each rebuilt from scratch on every hit, at two API calls a
 * page: one Worker request for the page and two more for the API, so three
 * billable requests per crawled url. The Workers free plan allows 100,000 a
 * day across the whole account, and once the sites became indexable a single
 * crawl of the catalogue could spend it. Every site answered Error 1027 until
 * the quota reset at midnight UTC.
 *
 * R2 rather than KV, deliberately. KV's free plan caps writes at 1,000 a day —
 * this project has already lost days of translations to that exact limit — and
 * a first crawl writes one cache entry per page, thousands of them. R2's free
 * tier is a million writes a month and ten million reads, which is the right
 * shape for this.
 *
 * The bucket arrives as the NEXT_INC_CACHE_R2_BUCKET binding, added to every
 * tenant's wrangler config. If that binding is ever missing the cache is
 * skipped and pages render live — the old behaviour: degraded, not broken.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
