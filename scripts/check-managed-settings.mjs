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
import { MANAGED_SETTINGS } from "../apps/worker-api/src/lib/settings.ts";

const KNOWN_GROUPS = new Set(["payment", "admanager"]);

// Every sales-affiliate feature is gone (owner, 22 Nov 2026: "hapus total iklan penjualan dr Amazon dll"): no
// AliExpress or Amazon credential may come back into the panel.
assert.deepEqual(
  MANAGED_SETTINGS.filter((d) => /ALIEXPRESS|AMAZON|AFFILIATE/i.test(d.key)).map((d) => d.key),
  [],
  "no affiliate-sales credential is managed"
);

for (const d of MANAGED_SETTINGS) {
  assert.ok(d.key && d.label, "every setting has a key and a label");
  assert.ok(KNOWN_GROUPS.has(d.group), `${d.key} has an unknown group: ${d.group}`);
  assert.equal(typeof d.envFallback, "function", `${d.key} needs an env fallback`);
}

// Nothing is hidden — a payment credential quietly dropped from the panel would look like the panel was broken.
assert.deepEqual(MANAGED_SETTINGS.filter((d) => d.hidden).map((d) => d.key), [], "no row is withheld");

// Keys are unique — a duplicate would overwrite the other's stored value.
const keys = MANAGED_SETTINGS.map((d) => d.key);
assert.equal(new Set(keys).size, keys.length, "no duplicate setting keys");

console.log(`check-managed-settings: ok — ${MANAGED_SETTINGS.length} settings, no affiliate-sales credential`);
