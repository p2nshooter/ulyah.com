// A build-time variable must be read in the one form the bundler inlines.
//
// Next.js replaces `process.env.NEXT_PUBLIC_X` with its value at build time —
// that exact member expression and nothing else. Written as
// `process?.env?.NEXT_PUBLIC_X` (or `process.env?.NEXT_PUBLIC_X`) it survives
// into the bundle and is read at runtime instead, where a Worker has no such
// variable. That is how 1fr.fr, tilawa.de and xad.es came to render the
// Indonesian site after the Next 16 upgrade on 26 Oct 2026: the tenant fell back
// to "ulyah" in packages/shared/src/i18n.ts while everything else still knew
// which site it was. Nothing in the build, the typecheck or the tests noticed.
//
//   node scripts/check-env-inlining.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const ROOTS = ["apps/web/src", "packages/shared/src"];
const BAD = /process\s*\?\.\s*env|process\s*\.\s*env\s*\?\.\s*NEXT_PUBLIC_|process\s*\[\s*["']env["']\s*\]/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

/** Code only: comments may describe the forbidden form. */
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const hits = [];
for (const r of ROOTS) {
  for (const f of walk(join(ROOT, r))) {
    const lines = code(readFileSync(f, "utf8")).split("\n");
    lines.forEach((l, i) => {
      if (BAD.test(l)) hits.push(`${relative(ROOT, f)}:${i + 1}  ${l.trim().slice(0, 120)}`);
    });
  }
}

if (hits.length) {
  console.log("FAIL  build-time env read in a form the bundler does not inline:");
  for (const h of hits) console.log(`        ${h}`);
  console.log("      Use the plain `process.env.NEXT_PUBLIC_X` (guard it with try/catch if the code also runs without process).");
  process.exit(1);
}
console.log("ok    every NEXT_PUBLIC_ read is the plain, inlinable form");
