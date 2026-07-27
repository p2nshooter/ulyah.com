/**
 * The admin credential panel keeps its promises.
 *
 * Three of them, each easy to break by editing one word in a long line:
 *
 *  1. AliExpress is PREPARED BUT NOT OFFERED. The owner asked for the fields
 *     to be positioned correctly and then hidden until the app clears review
 *     ("siapin dulu posisinya biar tepat, tp di hide dulu semua"). A stray
 *     `hidden: false` would put three unusable boxes in front of them.
 *  2. All three AliExpress values are masked, the tracking id included
 *     ("di encrypt, termasuk id nya").
 *  3. Every setting names a group. The panel renders group by group, so one
 *     without a group would silently vanish from the page rather than fail —
 *     the worst way for a credential field to break.
 */
import assert from "node:assert/strict";
import { MANAGED_SETTINGS, ALIEXPRESS_READY } from "../apps/worker-api/src/lib/settings.ts";

const KNOWN_GROUPS = new Set(["payment", "affiliate"]);
const ALI = MANAGED_SETTINGS.filter((d) => d.key.startsWith("ALIEXPRESS_"));

assert.equal(ALI.length, 3, "app key, app secret and tracking id are all present");
assert.deepEqual(
  ALI.map((d) => d.key).sort(),
  ["ALIEXPRESS_APP_KEY", "ALIEXPRESS_APP_SECRET", "ALIEXPRESS_TRACKING_ID"],
  "the three AliExpress credentials are exactly these"
);

for (const d of ALI) {
  assert.equal(d.secret, true, `${d.key} must be masked in the admin`);
  assert.equal(d.group, "affiliate", `${d.key} belongs under the affiliate heading`);
  // The switch and the rows have to agree: hidden while not ready, offered once
  // ready. Flipping ALIEXPRESS_READY alone must be enough to reveal them.
  assert.equal(
    Boolean(d.hidden),
    !ALIEXPRESS_READY,
    `${d.key} visibility must follow ALIEXPRESS_READY (currently ${ALIEXPRESS_READY})`
  );
}

for (const d of MANAGED_SETTINGS) {
  assert.ok(d.key && d.label, "every setting has a key and a label");
  assert.ok(KNOWN_GROUPS.has(d.group), `${d.key} has an unknown group: ${d.group}`);
  assert.equal(typeof d.envFallback, "function", `${d.key} needs an env fallback`);
}

// Nothing outside AliExpress is hidden — a payment credential quietly dropped
// from the panel would look like the panel was broken.
const hiddenOthers = MANAGED_SETTINGS.filter((d) => d.hidden && !d.key.startsWith("ALIEXPRESS_"));
assert.deepEqual(hiddenOthers.map((d) => d.key), [], "only the AliExpress rows are withheld");

// Keys are unique — a duplicate would overwrite the other's stored value.
const keys = MANAGED_SETTINGS.map((d) => d.key);
assert.equal(new Set(keys).size, keys.length, "no duplicate setting keys");

console.log(
  `check-managed-settings: ok — ${MANAGED_SETTINGS.length} settings, ` +
    `AliExpress ${ALIEXPRESS_READY ? "OFFERED" : "prepared and hidden"}`
);
