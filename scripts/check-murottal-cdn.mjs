/**
 * Ask the murottal CDNs which files they actually publish, for every reciter
 * the sites play — instead of assuming every alquran.cloud edition exists at
 * 128 kbps.
 *
 * Why it exists: the live probe (scripts/live-probe.mjs) saw the radio's
 * requests for `cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais/…`
 * and `…/128/ar.hanirifai/…` blocked by the browser (ERR_BLOCKED_BY_ORB — the
 * answer was not audio, i.e. there is no such file). The players force every
 * alquran.cloud URL to the 128 kbps path, and some editions are published at
 * 192 and 64 only, so "upgrading" them asked for a file that was never there.
 *
 * Read-only: one ranged GET (2 bytes) per candidate. Runs on a GitHub runner
 * (live-probe.yml), because the development sandbox cannot reach these hosts.
 *
 * Prints, per reciter, every bitrate that answers with audio, then the table
 * apps/web/src/lib/qori-cdn.ts and apps/worker-api/src/lib/murottal-sources.ts
 * should carry.
 *
 * Usage: node scripts/check-murottal-cdn.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// The rosters, read from the source files so this can never check a list that
// has drifted from what the players use.
const webSrc = read("apps/web/src/lib/qori-cdn.ts");
const workerSrc = read("apps/worker-api/src/lib/murottal-sources.ts");
const aqc = new Set([
  ...[...webSrc.matchAll(/aqcEdition:\s*"([^"]+)"/g)].map((m) => m[1]),
  ...[...workerSrc.matchAll(/kind:\s*"aqc",\s*edition:\s*"([^"]+)"/g)].map((m) => m[1]),
]);
const ey = new Set([
  ...[...webSrc.matchAll(/eyId:\s*"([^"]+)"/g)].map((m) => m[1]),
  ...[...workerSrc.matchAll(/kind:\s*"ey",\s*folder:\s*"([^"]+)"/g)].map((m) => m[1]),
]);

const BITRATES = [192, 128, 64, 48, 40, 32];

async function probe(url) {
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-1" }, redirect: "follow", signal: AbortSignal.timeout(15_000) });
    const type = res.headers.get("content-type") ?? "";
    await res.body?.cancel().catch(() => {});
    return { ok: (res.status === 200 || res.status === 206) && /audio|mpeg|octet-stream/i.test(type), status: res.status, type };
  } catch (e) {
    return { ok: false, status: "ERR", type: String(e?.cause?.code ?? e?.name ?? e) };
  }
}

const table = {};
const surahTable = {};
let missing = 0;

console.log(`alquran.cloud editions (${aqc.size}) — per-ayah (Al-Fatihah 1) and whole-surah (Al-Fatihah):`);
for (const ed of [...aqc].sort()) {
  const ayah = [];
  const surah = [];
  for (const b of BITRATES) {
    const [a, s] = await Promise.all([
      probe(`https://cdn.islamic.network/quran/audio/${b}/${ed}/1.mp3`),
      probe(`https://cdn.islamic.network/quran/audio-surah/${b}/${ed}/1.mp3`),
    ]);
    if (a.ok) ayah.push(b);
    if (s.ok) surah.push(b);
  }
  // The best published encode: 128 when it exists (the rotation's standard and
  // the size the players were tuned for), else the highest there is.
  const pick = (list) => (list.includes(128) ? 128 : list[0] ?? null);
  table[ed] = pick(ayah);
  surahTable[ed] = pick(surah);
  if (!ayah.length) missing++;
  console.log(`  ${ed.padEnd(28)} ayah: ${ayah.join("/") || "NONE"}   surah: ${surah.join("/") || "none"}`);
}

console.log(`\neveryayah.com folders (${ey.size}) — 001001.mp3:`);
const broken = [];
for (const folder of [...ey].sort()) {
  const r = await probe(`https://everyayah.com/data/${folder}/001001.mp3`);
  if (!r.ok) {
    missing++;
    broken.push(folder);
  }
  console.log(`  ${r.ok ? "✓" : "✗"} ${folder.padEnd(40)} ${r.status} ${r.type}`);
}

// A folder that answers 404 was renamed or never existed under that name:
// list everyayah's own folders that look like it, so the fix is a lookup, not
// a guess.
if (broken.length) {
  let index = "";
  for (const u of ["https://everyayah.com/data/", "https://everyayah.com/data/recitations.js"]) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(20_000) });
      if (r.ok) index += await r.text();
    } catch {
      /* try the next listing */
    }
  }
  const folders = [...new Set([...index.matchAll(/([A-Za-z0-9_.-]+_\d+kbps)/g)].map((m) => m[1]))];
  console.log(`\neveryayah folder index: ${folders.length} folders`);
  for (const b of broken) {
    const stem = b.replace(/_\d+kbps$/, "").split(/[_-]/).filter((w) => w.length > 3).map((w) => w.toLowerCase().slice(0, 5));
    const like = folders.filter((f) => stem.some((w) => f.toLowerCase().includes(w)));
    console.log(`  ${b} -> candidates:`);
    for (const c of like.slice(0, 12)) {
      const r = await probe(`https://everyayah.com/data/${c}/001001.mp3`);
      console.log(`      ${r.ok ? "✓" : "✗"} ${c}`);
    }
  }
}

console.log("\nAQC_AYAH_KBPS =", JSON.stringify(table, null, 2));
console.log("AQC_SURAH_KBPS =", JSON.stringify(surahTable, null, 2));
console.log(`\n${missing} reciter source(s) with no audio at all.`);
