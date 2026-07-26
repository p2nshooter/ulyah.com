/**
 * No script may import by absolute path.
 *
 * Two checks were written in a scratch directory and copied into the repo with
 * their imports still pointing at "/home/user/ulyah.com/scripts/…". They passed
 * every time locally — the path existed — and failed CI twice in a row, because
 * on a runner it does not. A check that only runs on the machine it was written
 * on is worse than no check: it turns every commit red for a reason unrelated
 * to the commit.
 *
 * The build is the only place this can be caught, so it is caught here.
 *
 *   node scripts/check-no-absolute-imports.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["scripts", "apps", "packages"];
const SKIP = new Set(["node_modules", ".next", ".open-next", "dist", ".git"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(mjs|cjs|js|ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

// A from-clause, dynamic import, or require whose specifier starts with a
// slash. Written without a quoted example so this file does not match itself.
const ABS = /(?:from\s*|import\s*\(\s*|require\s*\(\s*)["'](\/[^"']+)["']/g;
const offenders = [];
for (const dir of DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(ABS)) offenders.push(`${relative(ROOT, file)} → ${m[1]}`);
  }
}

for (const o of offenders) console.log(`  FAIL absolute import: ${o}`);
console.log(offenders.length ? `\nabsolute imports: ${offenders.length} found` : "\nabsolute imports: none");
if (offenders.length) process.exit(1);
