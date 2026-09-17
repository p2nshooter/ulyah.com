/**
 * An occasion of revelation that EXISTS is always shown.
 *
 * Owner: "jgn sampe hilang panel asbabun nuzul."
 *
 * The failure this pins down is quiet and confident. fetchAsbabunNuzul used to
 * return null whenever its on-demand translation failed, and the reader renders
 * null as "no specific occasion of revelation is narrated for this ayah" — a
 * sentence about scholarship, not about our infrastructure. It is also false:
 * the occasion is narrated, and Al-Wahidi recorded it. A rate-limited
 * translator for one second produced a claim that then sat in the ayah bundle's
 * KV cache for thirty days.
 *
 * So the rule is: a translation that fails downgrades the LANGUAGE, never the
 * content. The panel keeps the text and says which language it is in.
 *
 * The check runs the real function with a translator that cannot work (no
 * network, a DB stub that throws), which is exactly the production failure, and
 * asserts it still answers.
 *
 *   npx tsx scripts/check-asbabun-never-empty.ts
 */
import { fetchAsbabunNuzul } from "../apps/worker-api/src/lib/tafsir-source";
import { ASBAB_DATA } from "../apps/worker-api/src/lib/asbabun-nuzul-data";

/**
 * A Worker env in which nothing works: no KV, no D1, no Workers AI. Every
 * translation path therefore fails, which is the point — this is the bad
 * second we are checking the behaviour of, not the happy path.
 */
const brokenEnv = {
  CACHE_KV: {
    get: async () => null,
    put: async () => undefined,
  },
  DB: {
    prepare() {
      throw new Error("D1 unavailable");
    },
  },
  AI: {
    run: async () => {
      throw new Error("Workers AI unavailable");
    },
  },
  MEDIA_R2: { get: async () => null },
} as never;

let failed = 0;
function check(what: string, ok: boolean, detail: string) {
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}`);
  if (!ok) console.log(`        ${detail}`);
}

// An ayah the curated dataset really covers, and one it explicitly marks as
// having no specific occasion. Both are read from the dataset itself, so this
// check cannot drift away from it.
const CURATED = "2_115";
const EXPLICIT_NONE = "2_1";

async function main() {
  console.log("=== the dataset the check is built on ===");
  check(
    "a curated occasion exists for 2:115",
    typeof ASBAB_DATA[CURATED] === "string" && (ASBAB_DATA[CURATED] as string).length > 40,
    "ASBAB_DATA has no text for 2_115 — pick another curated ayah for this check"
  );
  check(
    "2:1 is an explicit 'no specific occasion'",
    ASBAB_DATA[EXPLICIT_NONE] === null,
    "ASBAB_DATA[2_1] is no longer null — pick another ayah for the null case"
  );

  console.log("\n=== the reader's own language ===");
  const id = await fetchAsbabunNuzul(brokenEnv, 2, 115, "id");
  check("2:115 in Indonesian is answered", Boolean(id?.text), "returned null for the language the dataset is written in");
  check("…and is tagged as Indonesian", id?.lang === "id", `lang was ${JSON.stringify(id?.lang)}`);

  console.log("\n=== a language whose translation cannot be produced ===");
  // French, with every translator broken. Before the fix this returned null and
  // 1fr.fr told the reader no occasion was narrated.
  const fr = await fetchAsbabunNuzul(brokenEnv, 2, 115, "fr");
  check(
    "2:115 still returns the occasion when translation fails",
    Boolean(fr?.text),
    "returned null — the panel would claim no occasion is narrated, which is false"
  );
  check(
    "…and says which language the text is actually in",
    Boolean(fr?.lang) && fr?.lang !== "fr",
    `lang was ${JSON.stringify(fr?.lang)} — an untranslated text must not claim to be the display language`
  );
  check(
    "…and the source label carries the language too",
    Boolean(fr?.source && /indonesia/i.test(fr.source)),
    `source was ${JSON.stringify(fr?.source)}`
  );

  console.log("\n=== an explicit 'no occasion' is still respected ===");
  // This is the one null that must survive: it is a scholarly fact, not a
  // failure, and turning it into a panel would invent content.
  const none = await fetchAsbabunNuzul(brokenEnv, 2, 1, "id");
  check(
    "2:1 answers null, as the dataset says",
    none === null,
    "the curated 'no specific occasion' entry must not be replaced by a fallback"
  );

  console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
