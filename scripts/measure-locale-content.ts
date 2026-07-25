/**
 * Refresh scripts/locale-content.json from the live database — how much of the
 * site's own writing has actually been translated into each language.
 *
 * This is the half of "is this language ready?" that changes on its own: the
 * warm job keeps translating, so a language that is 4% today is 40% next month
 * without anybody editing code. Running this after a warm pass (and then
 * `pnpm gen:locale-readiness`) is what lets a finished language unlock itself
 * instead of waiting for someone to remember it.
 *
 *   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… pnpm gen:locale-content
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "locale-content.json");
const DB_ID = "28800662-2034-456d-a91d-a6532c2a9abd"; // ulyah-db

// mt_cache keys look like `mt:<src>-<tgt>:<hash>`, so the target language is the
// slice between the dash and the second colon.
const SQL = `
  SELECT tgt, SUM(n) AS total FROM (
    SELECT substr(substr(k,4), instr(substr(k,4),'-')+1, instr(substr(k,4),':')-instr(substr(k,4),'-')-1) AS tgt,
           COUNT(*) AS n
    FROM mt_cache GROUP BY substr(k,4, instr(substr(k,4),':')-1)
  ) GROUP BY tgt`;

async function main() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) {
    console.error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required.");
    process.exit(1);
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${DB_ID}/query`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ sql: SQL }),
    }
  );
  const json = (await res.json()) as {
    success: boolean;
    errors?: unknown;
    result?: { results: { tgt: string; total: number }[] }[];
  };
  if (!json.success) {
    console.error("D1 query failed:", JSON.stringify(json.errors));
    process.exit(1);
  }

  const current = JSON.parse(readFileSync(OUT, "utf8")) as Record<string, unknown> & {
    _sourceLanguages: string[];
    rows: Record<string, number>;
  };
  const rows: Record<string, number> = {};
  for (const r of json.result?.[0]?.results ?? []) {
    // Source languages carry no rows worth counting — nothing is translated INTO
    // the language the site is written in.
    if (current._sourceLanguages.includes(r.tgt)) continue;
    if (!/^[a-z]{2}$/.test(r.tgt)) continue;
    rows[r.tgt] = r.total;
  }
  if (Object.keys(rows).length === 0) {
    console.error("No rows returned — refusing to overwrite the measurement with nothing.");
    process.exit(1);
  }

  current.rows = Object.fromEntries(Object.entries(rows).sort((a, b) => b[1] - a[1]));
  current._measuredAt = new Date().toISOString().slice(0, 10);
  writeFileSync(OUT, JSON.stringify(current, null, 2) + "\n");

  const best = Math.max(...Object.values(rows));
  console.log(`Measured ${Object.keys(rows).length} languages (best: ${best} rows).`);
  for (const [c, n] of Object.entries(current.rows)) {
    console.log(`  ${c}  ${String(Math.round((n / best) * 1000) / 10).padStart(5)}%  ${n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
