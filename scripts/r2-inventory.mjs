/**
 * What is actually in R2, and how big is each part of it?
 *
 * Owner: "wajib di bawah 5gb, cari cara tp tetep optimal di kitab2nya" — about
 * R2, not D1. You cannot get a bucket under a line without knowing what is on
 * the wrong side of it, and Cloudflare's dashboard gives a single total.
 *
 * So this walks the bucket and groups every object by its key prefix, two
 * levels deep, reporting count and bytes for each. Nothing is written or
 * deleted; it only lists.
 *
 * Reading the output: the depth-1 rows are the budget, the depth-2 rows say
 * which reciter, which series, which kitab is responsible. A prefix that is
 * large AND re-downloadable (murottal, which the reciters' own CDNs serve) is
 * a candidate for deletion; a prefix that is large and IRREPLACEABLE (the
 * kitab scans, the story narration we generated) is not — it is a candidate
 * for staying exactly where it is.
 *
 * Usage:
 *   node scripts/r2-inventory.mjs            the whole bucket
 *   node scripts/r2-inventory.mjs --prefix=audio/
 *
 * Needs CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and
 * optionally R2_BUCKET (default ulyah-media).
 */
import { AwsClient } from "aws4fetch";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const BUCKET = process.env.R2_BUCKET || "ulyah-media";
const PREFIX = (process.argv.find((a) => a.startsWith("--prefix=")) ?? "").split("=")[1] ?? "";

if (!ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error("Missing CLOUDFLARE_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY.");
  process.exit(1);
}

const aws = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto",
  service: "s3",
});
const BASE = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}`;

const size = (b) =>
  b >= 1073741824 ? `${(b / 1073741824).toFixed(2)} GiB` : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MiB` : `${(b / 1024).toFixed(0)} KiB`;

async function listPage(token) {
  const u = new URL(BASE);
  u.searchParams.set("list-type", "2");
  u.searchParams.set("max-keys", "1000");
  if (PREFIX) u.searchParams.set("prefix", PREFIX);
  if (token) u.searchParams.set("continuation-token", token);
  const res = await aws.fetch(u.toString());
  if (!res.ok) throw new Error(`LIST ${res.status} ${await res.text().catch(() => "")}`);
  const xml = await res.text();
  const objects = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map((m) => ({
    key: /<Key>([\s\S]*?)<\/Key>/.exec(m[1])?.[1] ?? "",
    size: Number(/<Size>(\d+)<\/Size>/.exec(m[1])?.[1] ?? 0),
  }));
  return {
    objects: objects.filter((o) => o.key),
    next: /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml)?.[1],
  };
}

function bucketOf(key, depth) {
  const parts = key.split("/");
  return parts.length <= depth ? key : parts.slice(0, depth).join("/") + "/";
}

async function main() {
  const one = new Map();
  const two = new Map();
  let total = 0;
  let count = 0;
  let token;
  for (let page = 0; page < 20_000; page += 1) {
    const { objects, next } = await listPage(token);
    for (const o of objects) {
      count += 1;
      total += o.size;
      for (const [map, depth] of [
        [one, 1],
        [two, 2],
      ]) {
        const k = bucketOf(o.key, depth);
        const cur = map.get(k) ?? { n: 0, bytes: 0 };
        cur.n += 1;
        cur.bytes += o.size;
        map.set(k, cur);
      }
    }
    process.stdout.write(`\r  scanned ${count.toLocaleString()} objects…   `);
    if (!next) break;
    token = next;
  }
  process.stdout.write("\n\n");

  const rows = (map, limit) =>
    [...map.entries()].sort((a, b) => b[1].bytes - a[1].bytes).slice(0, limit);

  console.log(`=== ${BUCKET}: ${count.toLocaleString()} objects, ${size(total)} ===\n`);
  console.log("by top-level prefix");
  for (const [k, v] of rows(one, 40)) {
    const pct = total ? ((v.bytes / total) * 100).toFixed(1) : "0";
    console.log(`  ${size(v.bytes).padStart(11)}  ${String(pct).padStart(5)}%  ${v.n.toLocaleString().padStart(9)} obj  ${k}`);
  }
  console.log("\nlargest second-level prefixes");
  for (const [k, v] of rows(two, 25)) {
    console.log(`  ${size(v.bytes).padStart(11)}  ${v.n.toLocaleString().padStart(9)} obj  ${k}`);
  }
  const overBy = total - 5 * 1073741824;
  console.log(
    `\n5 GiB line: ${overBy > 0 ? `OVER by ${size(overBy)}` : `under, with ${size(-overBy)} to spare`}.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
