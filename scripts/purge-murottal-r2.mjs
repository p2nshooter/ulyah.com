/**
 * Delete the murottal that was downloaded.
 *
 * Owner: "hilangin audio2 alquran murottal ganti dengan cdn" — and then, when
 * nothing had actually gone yet, "delete aja audio yg d download".
 *
 * Nothing had gone because the deletion was written as a Worker job: the
 * scheduled tick drains the prefixes a page at a time. That is the right shape
 * for a system that is running, and useless while every deploy is being refused
 * by an unrelated D1 quota. The objects sit there either way, and they are the
 * single largest thing the account stores.
 *
 * So this deletes them directly, over R2's S3 API. It needs no Worker, no
 * deploy and no D1 — which is the point: the one resource that is exhausted is
 * the one it does not touch.
 *
 * WHAT IT DELETES. Only the two murottal prefixes, both of which now resolve to
 * a redirect (apps/worker-api/src/routes/audio.ts) rather than to bytes of
 * ours:
 *
 *   audio/qori/    the original library, pre-128 kbps, the muffled "mendem" one
 *   audio/qori2/   the HiFi library that replaced it
 *
 * Nothing else in the bucket is touched: story narration, PDFs, artwork, the
 * Next.js cache and every other prefix are addressed by their own keys and are
 * not matched here. The prefixes are checked against that list before a single
 * delete is issued.
 *
 * NOTHING IS LOST. Every file is a copy of a recording the reciter's own CDN
 * serves, and the players already read from there. This removes our duplicate.
 *
 * Usage:
 *   node scripts/purge-murottal-r2.mjs --dry     measure, delete nothing
 *   node scripts/purge-murottal-r2.mjs           delete
 *
 * Needs CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and
 * optionally R2_BUCKET (default ulyah-media).
 */
import { AwsClient } from "aws4fetch";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const BUCKET = process.env.R2_BUCKET || "ulyah-media";
const DRY = process.argv.includes("--dry");

/** The only prefixes this script may ever touch. */
const PREFIXES = ["audio/qori/", "audio/qori2/"];

if (!ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error("Missing CLOUDFLARE_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY.");
  console.error("The R2 S3 API token is made at Cloudflare → R2 → Manage API Tokens.");
  process.exit(1);
}

const aws = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto",
  service: "s3",
});
const BASE = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const mib = (b) => (b / 1048576).toFixed(1);

/** One page of keys under a prefix, with their sizes. */
async function listPage(prefix, token) {
  const u = new URL(BASE);
  u.searchParams.set("list-type", "2");
  u.searchParams.set("prefix", prefix);
  u.searchParams.set("max-keys", "1000");
  if (token) u.searchParams.set("continuation-token", token);
  const res = await aws.fetch(u.toString());
  if (!res.ok) throw new Error(`LIST ${res.status} ${await res.text().catch(() => "")}`);
  const xml = await res.text();
  const objects = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map((m) => ({
    key: /<Key>([\s\S]*?)<\/Key>/.exec(m[1])?.[1] ?? "",
    size: Number(/<Size>(\d+)<\/Size>/.exec(m[1])?.[1] ?? 0),
  }));
  const next = /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml)?.[1];
  return { objects: objects.filter((o) => o.key), next };
}

/** Up to 1000 keys in one request — the whole reason this is not a wrangler loop. */
async function deleteBatch(keys) {
  const body =
    `<?xml version="1.0" encoding="UTF-8"?><Delete><Quiet>true</Quiet>` +
    keys.map((k) => `<Object><Key>${esc(k)}</Key></Object>`).join("") +
    `</Delete>`;
  const res = await aws.fetch(`${BASE}?delete`, {
    method: "POST",
    body,
    headers: { "content-type": "application/xml" },
  });
  if (!res.ok) throw new Error(`DELETE ${res.status} ${await res.text().catch(() => "")}`);
}

async function purge(prefix) {
  // Belt and braces: a typo in a prefix would delete somebody else's data.
  if (!PREFIXES.includes(prefix)) throw new Error(`refusing to touch ${prefix}`);
  let token;
  let objects = 0;
  let bytes = 0;
  for (let page = 0; page < 10_000; page += 1) {
    const { objects: batch, next } = await listPage(prefix, token);
    if (batch.length === 0) break;
    objects += batch.length;
    bytes += batch.reduce((n, o) => n + o.size, 0);
    if (!DRY) await deleteBatch(batch.map((o) => o.key));
    process.stdout.write(`\r  ${prefix} — ${objects.toLocaleString()} objects, ${mib(bytes)} MiB${DRY ? " (dry)" : " deleted"}   `);
    if (!next) break;
    token = next;
  }
  process.stdout.write("\n");
  return { objects, bytes };
}

async function main() {
  console.log(DRY ? "=== measuring (nothing will be deleted) ===" : "=== deleting the stored murottal ===");
  let objects = 0;
  let bytes = 0;
  for (const p of PREFIXES) {
    const r = await purge(p);
    objects += r.objects;
    bytes += r.bytes;
  }
  console.log(
    `\n${DRY ? "Would remove" : "Removed"} ${objects.toLocaleString()} object(s), ` +
      `${mib(bytes)} MiB (${(bytes / 1073741824).toFixed(2)} GiB).`
  );
  if (objects === 0) console.log("Nothing stored under those prefixes — the library is already gone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
