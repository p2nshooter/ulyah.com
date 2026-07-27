/**
 * Every input the warm workflow declares must actually reach the script.
 *
 * This exists because one did not. A `skip` input was added to the workflow,
 * the chain was taught to set it, the script was taught to read it — and the
 * line that passes it on the command line was written at the wrong
 * indentation, so the patch silently matched nothing. The workflow accepted
 * `skip=es`, reported success, and warmed Spanish anyway. Nothing failed;
 * the flag simply evaporated between the form and the process.
 *
 * A declared input that never reaches the program is invisible from both ends:
 * the UI offers it, the script defaults it away, and the run looks fine.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const yml = readFileSync(join(here, "..", ".github", "workflows", "warm-mt-cache.yml"), "utf8");

// The inputs block, taken as text — the names declared under workflow_dispatch.
const dispatch = yml.slice(yml.indexOf("workflow_dispatch:"), yml.indexOf("schedule:"));
const declared = [...dispatch.matchAll(/^ {6}([a-z_]+):$/gm)].map((m) => m[1]);
assert.ok(declared.length >= 3, `expected several declared inputs, found ${declared.join(", ") || "none"}`);

// The step that actually runs the script.
const runBlock = yml.slice(yml.indexOf("npx tsx scripts/warm-mt-cache.ts"), yml.indexOf("| tee /tmp/warm.log"));

// How each input is meant to reach the script. `one` and `chain` are booleans
// that gate rather than carry a value, so they are checked where they are used.
const CARRIED = { langs: "--langs=", skip: "--skip=" };
const GATES = { one: "inputs.one", chain: "inputs.chain" };

for (const name of declared) {
  if (name in CARRIED) {
    const flag = `${CARRIED[name]}\${{ inputs.${name} }}`;
    assert.ok(
      runBlock.includes(flag),
      `the workflow declares "${name}" but never passes it: expected ${flag} in the run step`
    );
  } else if (name in GATES) {
    assert.ok(yml.includes(GATES[name]), `the workflow declares "${name}" but never reads inputs.${name}`);
  } else {
    assert.fail(`input "${name}" is declared but this check does not know how it reaches the script`);
  }
}

// And the reverse: a flag the script is given must be a real declared input,
// or the workflow is passing something nobody offers.
for (const [, prefix] of Object.entries(CARRIED)) {
  const used = runBlock.includes(prefix);
  if (used) {
    const m = runBlock.match(new RegExp(`${prefix.replace(/[-]/g, "\\$&")}\\$\\{\\{ inputs\\.([a-z_]+) \\}\\}`));
    assert.ok(m, `${prefix} is passed but not from a workflow input`);
    assert.ok(declared.includes(m[1]), `${prefix} passes inputs.${m[1]}, which is not declared`);
  }
}

console.log(`check-warm-inputs: ok — ${declared.length} inputs (${declared.join(", ")}) all reach the script`);
