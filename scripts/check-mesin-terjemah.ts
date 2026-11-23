/**
 * The translation engine, checked without network or keys (docs/TRANSLATION-ENGINE.md).
 *
 * Owner, 22 Nov 2026: every language to 100%, „tolong hati2 saat menerjemahkan alquran, kitab2 dan hadits2",
 * and „Jgn ke D1, pindah ke R2, jgn pernah memakai D1 sebagai database". So this proves, against an in-memory
 * R2 that honours If-Match / If-None-Match exactly like the real one:
 *   · two writers on the same shard lose nothing (compare-and-swap), a re-run overwrites nothing, and a
 *     person's translation replaces the machine's;
 *   · Arabic scripture comes back byte for byte, and any answer that lost, renumbered or invented a placeholder,
 *     wrote Arabic of its own, echoed its source or was cut short is refused;
 *   · the Worker's wants and the engine agree on the key, Arabic-source wants are refused, a want whose name
 *     does not match its text is refused;
 *   · neither the Worker's translation code nor the engine's pass touches D1.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { R2S3, type S3Fetch } from "./lib/r2-s3";
import { MtStore } from "./lib/mt-store";
import {
  prepare,
  restore,
  rejectReason,
  segment,
  joinSegments,
  handWritten,
  foldWants,
  order,
  corpusKey,
} from "./mesin-terjemah";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { hashKey } from "./mt-key.mjs";
import { ENGINE_TARGET_LANGS, ALL_LOCALES, MT_TARGET_LANGS } from "../packages/shared/src/i18n";

const ROOT = join(import.meta.dirname, "..");
let passed = 0;
async function t(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed += 1;
  console.log(`  ok  ${name}`);
}

/** An in-memory bucket speaking the S3 subset R2S3 uses, with R2's conditional-write semantics. */
function fakeBucket() {
  const objects = new Map<string, { body: string; etag: string }>();
  let n = 0;
  const base = "https://acct.r2.cloudflarestorage.com/ulyah-media";
  const fetcher: S3Fetch = async (url, init) => {
    const u = new URL(url);
    const method = (init?.method ?? "GET").toUpperCase();
    const key = decodeURIComponent(u.pathname.replace("/ulyah-media", "").replace(/^\//, ""));
    const h = new Headers(init?.headers as HeadersInit);
    if (method === "GET" && u.searchParams.get("list-type") === "2") {
      const prefix = u.searchParams.get("prefix") ?? "";
      const max = Number(u.searchParams.get("max-keys") ?? 1000);
      const start = Number(u.searchParams.get("continuation-token") ?? 0);
      const all = [...objects.keys()].filter((k) => k.startsWith(prefix)).sort();
      const page = all.slice(start, start + max);
      const more = start + max < all.length;
      const xml = `<ListBucketResult>${page.map((k) => `<Contents><Key>${k}</Key></Contents>`).join("")}<IsTruncated>${more}</IsTruncated>${more ? `<NextContinuationToken>${start + max}</NextContinuationToken>` : ""}</ListBucketResult>`;
      return new Response(xml, { status: 200 });
    }
    const cur = objects.get(key);
    if (method === "GET") return cur ? new Response(cur.body, { status: 200, headers: { etag: cur.etag } }) : new Response("", { status: 404 });
    if (method === "DELETE") {
      objects.delete(key);
      return new Response(null, { status: 204 });
    }
    if (method === "PUT") {
      if (h.get("if-none-match") === "*" && cur) return new Response("", { status: 412 });
      const im = h.get("if-match");
      if (im && (!cur || cur.etag !== im)) return new Response("", { status: 412 });
      const etag = `"e${++n}"`;
      objects.set(key, { body: String(init?.body ?? ""), etag });
      return new Response(null, { status: 200, headers: { etag } });
    }
    return new Response("", { status: 405 });
  };
  return { objects, r2: new R2S3(fetcher, base, async () => undefined) };
}

async function main() {
  console.log("=== R2 store: compare-and-swap ===");
  await t("two writers on one shard both land (no lost update)", async () => {
    const { r2 } = fakeBucket();
    const a = new MtStore(r2);
    const b = new MtStore(r2);
    // Same shard: keys sharing the first two hash characters.
    await a.loadPair("id-fr");
    await b.loadPair("id-fr");
    a.stage("mt:id-fr:aa1", "un");
    b.stage("mt:id-fr:aa2", "deux");
    await Promise.all([a.flush(), b.flush()]);
    const c = new MtStore(r2);
    await c.loadPair("id-fr");
    assert.equal(c.get("mt:id-fr:aa1"), "un");
    assert.equal(c.get("mt:id-fr:aa2"), "deux");
  });
  await t("a re-run never overwrites; a person's translation does", async () => {
    const { r2 } = fakeBucket();
    const s = new MtStore(r2);
    s.stage("mt:id-es:bb1", "máquina");
    await s.flush();
    s.stage("mt:id-es:bb1", "otra máquina");
    await s.flush();
    const r = new MtStore(r2);
    await r.loadPair("id-es");
    assert.equal(r.get("mt:id-es:bb1"), "máquina");
    r.stage("mt:id-es:bb1", "persona", true);
    await r.flush();
    const v = new MtStore(r2);
    await v.loadPair("id-es");
    assert.equal(v.get("mt:id-es:bb1"), "persona");
  });
  await t("shards live exactly where the Worker reads them", async () => {
    const { r2, objects } = fakeBucket();
    const s = new MtStore(r2);
    s.stage("mt:id-de:xyz12", "x");
    await s.flush();
    assert.deepEqual([...objects.keys()], ["mt/id-de/xy.json"]);
  });
  await t("updateJson: concurrent read-modify-writes both apply", async () => {
    const { r2 } = fakeBucket();
    await Promise.all([
      r2.updateJson<Record<string, number>>("mt/_state.json", (c) => ({ ...(c ?? {}), a: 1 })),
      r2.updateJson<Record<string, number>>("mt/_state.json", (c) => ({ ...(c ?? {}), b: 2 })),
    ]);
    assert.deepEqual((await r2.getJson<Record<string, number>>("mt/_state.json"))!.value, { a: 1, b: 2 });
  });

  console.log("\n=== scripture guards ===");
  const ayah = "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ";
  const src = `Rasulullah ﷺ bersabda: ${ayah} (HR. Bukhari no. 1).`;
  await t("Arabic and collection names are masked, then restored byte for byte", () => {
    const p = prepare(src);
    assert.ok(!/[؀-ۿ]/.test(p.masked.replace(/ﷺ/g, "")), "no Arabic leaves the process");
    const back = restore(p.masked.replace("Rasulullah", "The Messenger").replace("bersabda", "said"), p);
    assert.ok(back.includes(ayah), "the ayah is back untouched");
    assert.ok(back.includes("Bukhari") && back.includes("no."));
  });
  await t("a lost placeholder is refused", () => {
    const p = prepare(src);
    assert.equal(rejectReason(p.masked, "The Messenger said: (Bukhari 1)."), "placeholder");
  });
  await t("a renumbered placeholder is refused", () => {
    const p = prepare(src);
    assert.equal(rejectReason(p.masked, p.masked.replace("@@0@@", "@@7@@")), "placeholder");
  });
  await t("Arabic the model wrote itself is refused", () => {
    const p = prepare("Doa sebelum makan adalah sunnah.");
    assert.equal(rejectReason(p.masked, "La invocación بسم الله es sunnah."), "arabic-invented");
  });
  await t("an echo is refused unless it is a short label that really is the same", () => {
    assert.equal(rejectReason("Kisah para nabi dan rasul yang mulia.", "Kisah para nabi dan rasul yang mulia."), "echo");
    assert.equal(rejectReason("Hadith", "Hadith"), null);
  });
  await t("a truncated answer is refused", () => {
    const long = "Nabi Yusuf adalah putra Nabi Yaqub yang dikisahkan panjang lebar dalam surah Yusuf, kisah terbaik.";
    assert.equal(rejectReason(long, "Yusuf."), "length");
  });
  await t("a Worker-masked paragraph is kept masked (its key is hash of the masked text)", () => {
    const p = prepare("He said @@0@@ then left.");
    assert.equal(p.premasked, true);
    assert.equal(restore("Il a dit @@0@@ puis est parti.", p), "Il a dit @@0@@ puis est parti.");
  });
  await t("segments put back the exact line breaks; long lines split at sentence ends", () => {
    const text = `Baris satu.\n\nBaris dua.\n${"Kalimat panjang sekali. ".repeat(300).trim()}\nAkhir`;
    const { parts, seps } = segment(text);
    assert.equal(joinSegments(parts, seps), text);
    assert.ok(parts.every((x) => x.length <= 3500));
  });

  console.log("\n=== corpus and wants ===");
  await t("wants join the corpus, Arabic-source and mismatched ones are refused, all are cleared", async () => {
    const { r2, objects } = fakeBucket();
    const a = "Kisah Nabi Musa";
    const b = "The story of Prophet Musa";
    await r2.put(`mt-want/id/${hashKey(a)}.txt`, a);
    await r2.put(`mt-want/en/${hashKey(b)}.txt`, b);
    await r2.put(`mt-want/ar/${hashKey(ayah)}.txt`, ayah);
    await r2.put(`mt-want/id/zzzz.txt`, "nama tidak cocok");
    const r = await foldWants(r2, false);
    assert.equal(r.added, 2);
    assert.equal(r.droppedArabic, 1);
    assert.deepEqual((await r2.getJson<Record<string, string>>(corpusKey("id")))!.value, { [hashKey(a)]: a });
    assert.deepEqual((await r2.getJson<Record<string, string>>(corpusKey("en")))!.value, { [hashKey(b)]: b });
    assert.equal([...objects.keys()].filter((k) => k.startsWith("mt-want/")).length, 0);
  });
  await t("the Worker names a want the way the engine reads it", () => {
    const mt = readFileSync(join(ROOT, "apps/worker-api/src/lib/mt.ts"), "utf8");
    assert.ok(/`mt-want\/\$\{sourceLang\}\/\$\{hashKey\(text\)\}\.txt`/.test(mt), "want key template");
    assert.ok(mt.includes('etagDoesNotMatch: "*"'), "wants are create-once");
  });
  await t("hand-written translations are read from the repo", () => {
    const h = handWritten();
    assert.ok(h.size > 100);
    for (const k of h.keys()) assert.match(k, /^mt:[a-z]{2}-[a-z]{2}:[0-9a-z]+$/);
  });

  console.log("\n=== languages ===");
  await t("the engine works every language but Arabic; the runtime gate is unchanged", () => {
    assert.deepEqual([...ENGINE_TARGET_LANGS].sort(), ALL_LOCALES.map((l) => l.code).filter((c) => c !== "ar").sort());
    assert.deepEqual([...MT_TARGET_LANGS].sort(), ["de", "en", "es", "fr", "id"]);
  });
  await t("live sites come first, then the least complete", () => {
    const o = order(["pl", "fr", "ja", "en"], {
      fr: { done: 99, total: 100, rev: 1, at: "" },
      en: { done: 10, total: 100, rev: 1, at: "" },
      ja: { done: 50, total: 100, rev: 1, at: "" },
    });
    assert.deepEqual(o, ["en", "fr", "pl", "ja"]);
  });

  console.log("\n=== R2 only ===");
  await t("no D1 in the Worker's translation code or in the engine's pass", () => {
    const mt = readFileSync(join(ROOT, "apps/worker-api/src/lib/mt.ts"), "utf8");
    assert.ok(!/env\.DB\b/.test(mt), "lib/mt.ts must not touch env.DB");
    const engine = readFileSync(join(ROOT, "scripts/mesin-terjemah.ts"), "utf8");
    const pass = engine.slice(engine.indexOf("async function main()"));
    assert.ok(!/legacyRead|d1 execute/.test(pass.replace(/if \(opt\.move\) return moveOutOfD1\(r2, store, opt\.dry\);/, "")), "a pass reads R2 only");
  });

  console.log(`\n${passed} check(s) passed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
