/**
 * No top-level await in scripts/.
 *
 * The workspace root is not `"type": "module"`, so tsx compiles these to
 * CommonJS, and CommonJS has no top-level await. `await main()` therefore does
 * not fail at runtime where you would see a useful error — it fails at
 * TRANSFORM time, before one line runs:
 *
 *   ERROR: Top-level await is currently not supported with the "cjs" output format
 *
 * That is what killed D1 Maintenance run 30382603040, and it would have killed
 * every other script in the D1-to-R2 chain the same way, because all four ended
 * `await main();`. The failure is silent in review and total at runtime, which
 * is exactly the kind worth spending a check on.
 *
 * Entry points end `main().catch(...)` instead, so a rejection still exits
 * non-zero and the workflow still goes red.
 *
 *   node scripts/check-script-entrypoints.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname);
const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));

const offenders = [];
const unguarded = [];

for (const f of files) {
  const src = readFileSync(join(dir, f), "utf8");
  // Strip block comments and strings before looking, so prose about top-level
  // await (this file's own subject matter, and the notes in the scripts it
  // guards) does not read as the thing itself.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/`(?:\\[\s\S]|[^\\`])*`/g, "``")
    .replace(/"(?:\\.|[^\\"])*"/g, '""')
    .replace(/'(?:\\.|[^\\'])*'/g, "''");

  // A top-level await is one at column zero — anything indented is inside a
  // function, where await is fine.
  const bad = code.split("\n").filter((l) => /^await\b/.test(l));
  if (bad.length) offenders.push(`${f}: ${bad[0].trim()}`);

  // A script that defines `main` has to call it. Not requiring `.catch`:
  // Node has treated an unhandled rejection as fatal since v15, so a bare
  // `main();` still exits non-zero and still turns the workflow red. The
  // thing worth asserting is that the entry point exists at all.
  if (/\n(?:async )?function main\b/.test(code) && !/\bmain\(\)/.test(code)) {
    unguarded.push(f);
  }
}

let failed = 0;
if (offenders.length === 0) {
  console.log(`ok   no top-level await in ${files.length} script(s)`);
} else {
  failed++;
  console.log("FAIL top-level await found — tsx compiles these to CJS and will refuse to run them:");
  for (const o of offenders) console.log(`       ${o}`);
  console.log("       use: main().catch((err) => { console.error(err); process.exit(1); });");
}

if (unguarded.length === 0) {
  console.log("ok   every script that defines main() calls it");
} else {
  failed++;
  console.log(`FAIL main() defined but never called in: ${unguarded.join(", ")}`);
}

process.exit(failed === 0 ? 0 : 1);
