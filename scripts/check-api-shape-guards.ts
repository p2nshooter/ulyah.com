/**
 * A 200 is not a promise about the SHAPE of the body.
 *
 * This is the failure that keeps coming back, in two flavours, and neither one
 * errors where it happens:
 *
 *   const r = await api.get<{ items: Row[] }>(…);   // answers {}
 *   setItems(r.items);                              // undefined — no throw
 *   …
 *   items.length                                    // and HERE it dies
 *
 * The type annotation is a claim about what the endpoint returns, not a check.
 * `undefined` goes into the state happily, the `.catch` never runs because the
 * promise resolved, and the page dies later at a line that looks innocent. On a
 * server component the result is a 500; in a client component the whole route
 * renders React's error boundary — a blank page with no <html lang>, which is
 * how it was found: /anak, /films-enfants, /kinderfilme, /peliculas-infantiles
 * and /kids-films were all dead at once, on every site, because
 * `/content/video-anak` answered a body with no `videos` key.
 *
 * The server-side half of this was swept once already (twenty call sites). This
 * is the client-side half, and the check exists so there is no third time.
 *
 * WHAT IT ALLOWS. `?? []`, `?? null`, `?? {}`, `?? 0` — any fallback at all —
 * and anything that is not a bare property read (a call, a ternary, a variable).
 * The rule is only: do not put an unchecked field of a response straight into
 * state.
 *
 *   npx tsx scripts/check-api-shape-guards.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "apps/web/src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

/**
 * `set<Something>(<var>.<field>)` with nothing after it — no `??`, no `?.`,
 * no call. The variable name is not restricted to `r`/`d`/`res`: what matters
 * is that a bare property read reaches a setter.
 */
const UNGUARDED = /\bset[A-Z]\w*\(\s*([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\s*\)/g;

const offenders: string[] = [];
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  // Only inside a promise continuation — that is where a response lands.
  // Elsewhere `setX(props.value)` is ordinary and correct.
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    const context = lines.slice(Math.max(0, i - 3), i + 1).join("\n");
    if (!/\.then\s*\(|await\s+api\./.test(context)) return;
    for (const m of line.matchAll(UNGUARDED)) {
      const [, obj, field] = m;
      // `setX(state.foo)` where the object is a component prop or a ref is not
      // a response read; responses are the argument of the .then callback.
      if (!new RegExp(`\\(\\s*${obj}\\s*\\)\\s*=>`).test(context) && !/await\s+api\./.test(context)) continue;
      // Already guarded on the same line — `if (d.url) setUrl(d.url)` is the
      // check, written the other way round. Asking for a second one would be
      // asking for dead code, and for the wrong type as often as not.
      if (new RegExp(`if\\s*\\(\\s*${obj}\\.${field}\\b`).test(line)) continue;
      offenders.push(`${file.slice(file.indexOf("apps/"))}:${i + 1}  ${obj}.${field}`);
    }
  });
}

console.log("=== a response field never reaches state unchecked ===");
const ok = offenders.length === 0;
console.log(`  ${ok ? "ok  " : "FAIL"}  ${ok ? "every setter has a fallback" : `${offenders.length} unguarded read(s)`}`);
for (const o of offenders) console.log(`        ${o}`);
if (!ok) {
  console.log("\n        Add a fallback that matches the state's own type:");
  console.log("        setItems(r.items ?? []), setThing(r.thing ?? null), setMap(r.map ?? {}).");
}
console.log(ok ? "\nALL OK" : "\n1 FAILED");
process.exit(ok ? 0 : 1);
