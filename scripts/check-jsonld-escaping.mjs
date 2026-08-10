// Every JSON-LD block must be serialised by jsonLdHtml(), never by a bare
// JSON.stringify().
//
// JSON.stringify produces valid JSON, and valid JSON is not automatically safe
// inside HTML. The parser does not read the script body as JSON — it scans for
// the literal `</script` and ends the element there, whatever the JSON meant.
// A title carrying that string closes the block early and everything after it
// is parsed as markup.
//
// That value is reachable here: titles and descriptions reach these blocks
// from D1, written by the content bot and rewritten by the translation pool.
// It is model output, not text a person typed and checked.
//
// This is cheap to get wrong again — the next page that wants structured data
// will copy the pattern from the page beside it — and it is invisible until
// the one bad title lands. So it is asserted rather than remembered.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["apps/web/src"];
const ALLOWED = new Set(["apps/web/src/lib/structured-data.ts"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(path, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

const offenders = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (ALLOWED.has(file.split("\\").join("/"))) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      // `__html: JSON.stringify(` — the exact shape that ships unescaped JSON
      // into a script element.
      if (/__html:\s*JSON\.stringify\s*\(/.test(line)) {
        offenders.push(`${file}:${i + 1}  ${line.trim()}`);
      }
    });
  }
}

if (offenders.length) {
  console.error("JSON-LD written into a script element without escaping `<`:\n");
  for (const o of offenders) console.error("  " + o);
  console.error("\nUse jsonLdHtml() (or jsonLdProps()) from @/lib/structured-data.");
  process.exit(1);
}

// The escaping itself, asserted rather than assumed. Reproduced here so the
// check fails if jsonLdHtml is ever weakened, without importing TypeScript.
const escape = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
const hostile = { headline: 'Kisah </script><script>alert(1)</script>' };
const out = escape(hostile);
if (out.includes("</script")) {
  console.error("escaping does not neutralise `</script`:", out);
  process.exit(1);
}
if (JSON.parse(out).headline !== hostile.headline) {
  console.error("escaping changed the data it was meant to preserve");
  process.exit(1);
}

console.log("json-ld escaping: every block goes through jsonLdHtml, and `</script` cannot survive it.");
