/**
 * No two domains play the same voice at the same moment.
 *
 * Owner: "masing-masing situs narik CDN-nya terpisah agar tidak ada duplikat"
 * — and, later, "maximalin aja … bukan cuma dawa.es tp seluruhnya", which is
 * what makes this worth checking rather than assuming. Every site now rotates
 * the SAME seventeen voices; before, most ran six and the pools differed by
 * accident as much as by design.
 *
 * What keeps them apart now is stated in three places — the reciter order
 * (TENANT_RADIO_CDN), where each site starts in the roster
 * (TENANT_RADIO_START) and each site's own broadcast epoch (radio-clock) —
 * and the property they are meant to produce is not visible in any of them.
 * It is also the kind of thing that breaks silently: edit a launch date, or
 * add a reciter, and two stations quietly converge. Nobody would notice,
 * because noticing means listening to two domains at once.
 *
 * So this runs the REAL broadcast clock, once per tenant, over a year of
 * moments, and compares what each site is reciting.
 *
 *   npx tsx scripts/check-radio-separation.ts
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const TENANTS = ["ulyah", "1fr", "tilawa", "dawa", "xad"] as const;
/** Sampled across a year — a collision that only happens in March still counts. */
const SAMPLES = 365;
const START_MS = Date.UTC(2026, 8, 21); // the day after this check was written
const STEP_MS = 86_400_000;

let failed = 0;
function check(what: string, ok: boolean, detail = "") {
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}`);
  if (!ok && detail) console.log(`        ${detail}`);
}

/**
 * One tenant, in its own process: the tenant is read from the environment at
 * module load (it is inlined at build time in production), so it cannot be
 * varied inside a single run. `Date.now` is stubbed rather than waited for.
 */
const PROBE = `
import { computeLiveBroadcast } from "./apps/web/src/lib/radio-clock";
import { RADIO_ROTATION_KEYS } from "./apps/web/src/lib/radio-store";
import { SURAH_AYAH_COUNTS } from "./apps/worker-api/src/lib/murottal-sources";

const surahs = SURAH_AYAH_COUNTS.map((n, i) => ({ id: i + 1, ayah_count: n }));
const start = Number(process.env.PROBE_START), step = Number(process.env.PROBE_STEP), n = Number(process.env.PROBE_N);
const real = Date.now;
const out: string[] = [];
for (let i = 0; i < n; i += 1) {
  Date.now = () => start + i * step;
  const b = computeLiveBroadcast(surahs, [...RADIO_ROTATION_KEYS]);
  out.push(b.reciterKey + "@" + b.surahId + ":" + b.ayahNumber);
}
Date.now = real;
console.log(JSON.stringify({ pool: [...RADIO_ROTATION_KEYS], at: out }));
`;

function probe(tenant: string): { pool: string[]; at: string[] } {
  const raw = execFileSync("npx", ["tsx", "-e", PROBE], {
    cwd: join(import.meta.dirname, ".."),
    env: {
      ...process.env,
      NEXT_PUBLIC_TENANT: tenant,
      PROBE_START: String(START_MS),
      PROBE_STEP: String(STEP_MS),
      PROBE_N: String(SAMPLES),
    },
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  const line = raw.trim().split("\n").filter((l) => l.startsWith("{")).pop();
  if (!line) throw new Error(`no output from ${tenant}: ${raw.slice(-400)}`);
  return JSON.parse(line);
}

function main() {
  const seen: Record<string, { pool: string[]; at: string[] }> = {};
  for (const t of TENANTS) seen[t] = probe(t);

  console.log("=== every site runs the whole CDN roster ===");
  const size = seen.ulyah!.pool.length;
  check("the roster is the full alquran.cloud set", size >= 17, `got ${size} voices`);
  for (const t of TENANTS) {
    const pool = seen[t]!.pool;
    check(
      `${t} rotates all ${size} of them`,
      pool.length === size && new Set(pool).size === size,
      `got ${pool.length} (${new Set(pool).size} distinct)`
    );
    // Only the 128 kbps alquran.cloud voices belong on the always-on station:
    // some everyayah "128kbps" archives are digitised from cassette masters and
    // hiss at any bitrate, which is what "mendem, kaya kaset kusut" was.
    check(`${t} rotates no everyayah voice`, pool.every((k) => k.startsWith("ar.")), pool.join(", "));
  }

  console.log("\n=== and starts it somewhere of its own ===");
  const heads = TENANTS.map((t) => seen[t]!.pool[0]!);
  check("no two sites open on the same reciter", new Set(heads).size === TENANTS.length, heads.join(", "));

  console.log("\n=== no two sites play the same voice at the same moment ===");
  const clashes: string[] = [];
  for (let i = 0; i < SAMPLES; i += 1) {
    for (let a = 0; a < TENANTS.length; a += 1) {
      for (let b = a + 1; b < TENANTS.length; b += 1) {
        const x = seen[TENANTS[a]!]!.at[i]!;
        const y = seen[TENANTS[b]!]!.at[i]!;
        // The reciter is what must differ. Two sites on the same ayah of the
        // same surah in DIFFERENT voices is not a duplicate — it is two
        // stations, which is the point.
        if (x.split("@")[0] === y.split("@")[0]) {
          clashes.push(`day ${i}: ${TENANTS[a]} and ${TENANTS[b]} both on ${x.split("@")[0]}`);
        }
      }
    }
  }
  check(
    `across ${SAMPLES} days, every pair of sites differs`,
    clashes.length === 0,
    `${clashes.length} clash(es); first: ${clashes[0] ?? ""}`
  );

  console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
