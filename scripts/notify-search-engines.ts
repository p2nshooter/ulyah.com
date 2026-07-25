/**
 * Tell the search engines that our pages exist — IndexNow.
 *
 * What this can and cannot do, plainly:
 *
 *  · IndexNow is a real, open protocol. Submitting a URL to one endpoint
 *    notifies Bing, Yandex, Seznam, Naver and Yep at once. No account, no API
 *    key issued by anybody: the site proves ownership by hosting a key file at
 *    its own root, which is why this can run unattended from CI.
 *
 *  · GOOGLE DOES NOT PARTICIPATE. Its old sitemap ping endpoint was retired in
 *    2023, and the Indexing API only accepts JobPosting and BroadcastEvent
 *    pages, which we do not publish. There is no way to notify Google
 *    programmatically for ordinary content, and any tool that claims otherwise
 *    is either using the deprecated endpoint or lying. Google finds our pages
 *    through robots.txt → sitemap.xml, and through the sitemap submitted once
 *    by hand in Search Console.
 *
 * Run after a deploy:  pnpm seo:notify
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Every site in the ecosystem, with the key each one hosts at its root. */
const SITES = [
  { host: "ulyah.com" },
  { host: "dawa.es" },
  { host: "1fr.fr" },
  { host: "tilawa.de" },
  { host: "xad.es" },
];

/**
 * The shared IndexNow key. It is NOT a secret — it is published at
 * https://<host>/<key>.txt on purpose; that file IS the ownership proof. A
 * fixed value keeps the key file in the repo and lets any site submit for
 * itself.
 */
const KEY = readFileSync(resolve(__dirname, "../apps/web/public/indexnow-key.txt"), "utf8").trim();

const ENDPOINT = "https://api.indexnow.org/IndexNow";
/** IndexNow accepts at most 10,000 urls per request. */
const BATCH = 5000;

async function urlsFor(host: string): Promise<string[]> {
  const res = await fetch(`https://${host}/sitemap.xml`);
  if (!res.ok) throw new Error(`${host}: sitemap ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
}

async function submit(host: string, urlList: string[]): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/${KEY}.txt`, urlList }),
  });
  // 200 accepted · 202 accepted, key still being verified · 4xx worth seeing.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`${host}: IndexNow ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

async function main() {
  let failures = 0;
  for (const { host } of SITES) {
    try {
      const urls = await urlsFor(host);
      if (urls.length === 0) {
        console.warn(`  ${host}: sitemap is empty — skipped`);
        continue;
      }
      for (let i = 0; i < urls.length; i += BATCH) {
        const chunk = urls.slice(i, i + BATCH);
        await submit(host, chunk);
        console.log(`  ${host}: submitted ${chunk.length} urls (${i + chunk.length}/${urls.length})`);
      }
    } catch (e) {
      failures++;
      console.warn(`  ${host}: ${(e as Error).message}`);
    }
  }
  // Never fail the pipeline over this — it is a notification, not a deploy step.
  console.log(failures === 0 ? "All sites notified." : `${failures} site(s) could not be notified.`);
}

main().catch((e) => {
  console.error(e);
});
