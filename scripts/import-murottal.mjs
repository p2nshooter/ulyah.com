#!/usr/bin/env node
/**
 * Complete the self-hosted murottal library in R2 to 100% for every qori.
 *
 * Why: the radio + Qur'an reader used to stream from the reciters' own public
 * CDNs (alquran.cloud / everyayah). Those are outside our control and can go
 * silent (the "radio bisu" report). The owner's decision: self-host every
 * ayah of every reciter in Cloudflare R2 (free egress, edge-cached, can't be
 * blocked) and serve the radio from R2, CDN only as a per-ayah fallback.
 *
 * This job fills the gaps: for each qori × each of the 6236 ayat, if the file
 * isn't already in R2 (tracked by the audio_cache row), it downloads the
 * 128 kbps MP3 from the source and uploads it to
 *   audio/qori2/<folder>/<SSS><AAA>.mp3   (qori2 = HiFi-only library; the
 *   legacy audio/qori/ prefix held pre-128kbps muffled files and is purged)
 * then records an audio_cache (ayah_id, qori_id, r2_key, duration) row.
 *
 * Idempotent + resumable: existing (ayah_id, qori_id) pairs are skipped, so
 * re-running only fetches what's missing. Runs per-reciter batches so a whole
 * run never has to finish in one go.
 *
 * Requires (GitHub Actions secrets):
 *   CLOUDFLARE_ACCOUNT_ID          — for the R2 S3 endpoint + wrangler
 *   CLOUDFLARE_API_TOKEN           — for wrangler d1 (read ayah list, write audio_cache)
 *   R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY — R2 S3 API token (Cloudflare → R2 → Manage API Tokens)
 *
 * Usage: node scripts/import-murottal.mjs --qori=alafasy,sudais [--limit=6236] [--concurrency=12]
 *        node scripts/import-murottal.mjs --qori=all
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AwsClient } from "aws4fetch";

const R2_BUCKET = "ulyah-media";
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const AQC_API = "https://api.alquran.cloud/v1"; // /surah/<n>/<edition> -> real per-ayah audio URLs
const EY_CDN = "https://everyayah.com/data"; // /<folder>/<SSS><AAA>.mp3

// Each R2 folder (as already used in audio_cache.r2_key) → its 128 kbps source.
// `aqc` uses the alquran.cloud islamic.network CDN by GLOBAL ayah number;
// `ey` uses everyayah.com by surah+ayah. Editions/folders verified against the
// reciter list in apps/web/src/lib/qori-cdn.ts.
// Keep in sync with apps/worker-api/src/lib/murottal-sources.ts (the worker's
// on-demand cache-fill uses the same mapping) and the r2Folder values in
// apps/web/src/lib/qori-cdn.ts. `name` lets this importer CREATE the qori row
// when it doesn't exist yet — previously a folder with no pre-existing
// audio_cache rows could never be imported at all.
const SOURCES = {
  alafasy: { kind: "aqc", edition: "ar.alafasy", name: "Mishary Rashid Alafasy" },
  sudais: { kind: "aqc", edition: "ar.abdurrahmaansudais", name: "Abdul Rahman Al-Sudais" },
  muaiqly: { kind: "aqc", edition: "ar.mahermuaiqly", name: "Maher Al Muaiqly" },
  shuraym: { kind: "aqc", edition: "ar.saoodshuraym", name: "Saud Al-Shuraim" },
  hudhaify: { kind: "aqc", edition: "ar.hudhaify", name: "Ali Al-Hudhaify" },
  ayyoub: { kind: "aqc", edition: "ar.muhammadayyoub", name: "Muhammad Ayyub" },
  basfar: { kind: "aqc", edition: "ar.abdullahbasfar", name: "Abdullah Basfar" },
  minshawi: { kind: "aqc", edition: "ar.minshawi", name: "Muhammad Siddiq Al-Minshawi" },
  "minshawi-mujawwad": { kind: "aqc", edition: "ar.minshawimujawwad", name: "Al-Minshawi (Mujawwad)" },
  husary: { kind: "aqc", edition: "ar.husary", name: "Mahmoud Khalil Al-Husary" },
  "husary-mujawwad": { kind: "aqc", edition: "ar.husarymujawwad", name: "Al-Husary (Mujawwad)" },
  "abdulbasit-murattal": { kind: "aqc", edition: "ar.abdulbasitmurattal", name: "Abdul Basit Abdul Samad (Murattal)" },
  "abdulbasit-mujawwad": { kind: "aqc", edition: "ar.abdulbasitmurattal", name: "Abdul Basit Abdul Samad (Mujawwad)" },
  ajmy: { kind: "aqc", edition: "ar.ahmedajamy", name: "Ahmed Al-Ajmy" },
  akhdar: { kind: "ey", folder: "Ibrahim_Akhdar_32kbps", name: "Ibrahim Al-Akhdar" },
  jibreel: { kind: "aqc", edition: "ar.muhammadjibreel", name: "Muhammad Jibreel" },
  sowaid: { kind: "aqc", edition: "ar.aymanswoaid", name: "Ayman Sowaid" },
  rifai: { kind: "aqc", edition: "ar.hanirifai", name: "Hani Ar-Rifai" },
  qasim: { kind: "aqc", edition: "ar.muhammadalmuhaisany", name: "Muhsin Al-Qasim" },
  shatri: { kind: "aqc", edition: "ar.shaatree", name: "Abu Bakr Al-Shatri" },
  ghamdi: { kind: "ey", folder: "Ghamadi_40kbps", name: "Saad Al-Ghamdi" },
  bukhatir: { kind: "ey", folder: "Salaah_AbdulRahman_Bukhatir_128kbps", name: "Salah Bukhatir" },
  fares: { kind: "ey", folder: "Fares_Abbad_64kbps", name: "Fares Abbad" },
  tablawi: { kind: "ey", folder: "Mohammad_al_Tablawi_128kbps", name: "Mohammad Al-Tablawi" },
  dosari: { kind: "ey", folder: "Yasser_Ad-Dussary_128kbps", name: "Yasser Al-Dosari" },
  qatami: { kind: "ey", folder: "Nasser_Alqatami_128kbps", name: "Nasser Al Qatami" },
  tunaiji: { kind: "ey", folder: "khalefa_al_tunaiji_128kbps", name: "Khalifa Al-Tunaiji" },
  matroud: { kind: "ey", folder: "Abdullah_Matroud_128kbps", name: "Abdullah Al-Matroud" },
  juhany: { kind: "ey", folder: "Abdullaah_3awwaad_Al-Juhaynee_128kbps", name: "Abdullah Awad Al-Juhany" },
  alijaber: { kind: "ey", folder: "Ali_Jaber_64kbps", name: "Ali Jaber" },
  banna: { kind: "ey", folder: "mahmoud_ali_al_banna_32kbps", name: "Mahmoud Ali Al-Banna" },
  // 128 kbps folder (the old Karim_Mansoori_40kbps was the muffled source).
  mansoori: { kind: "ey", folder: "Karim_Mansouri_128kbps", name: "Karim Mansouri" },
};

function args() {
  const a = Object.fromEntries(
    process.argv.slice(2).map((s) => {
      const [k, v] = s.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    qori: (a.qori || "all").split(",").map((s) => s.trim()).filter(Boolean),
    limit: a.limit ? Number(a.limit) : 6236,
    concurrency: a.concurrency ? Number(a.concurrency) : 12,
  };
}

// wrangler d1 execute --remote occasionally dies with "fetch failed" /
// connectivity errors mid-run. Because the import is idempotent+resumable,
// a blip must NOT abort the whole job — retry a few times with backoff so a
// single transient network error doesn't throw away an hour of downloads.
function wranglerOnce(argv, capture) {
  return execFileSync("npx", ["wrangler", ...argv], {
    cwd: join(import.meta.dirname, "..", "apps", "worker-api"),
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  });
}
function wrangler(argv, capture = false, tries = 5) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return wranglerOnce(argv, capture);
    } catch (e) {
      lastErr = e;
      const msg = String(e?.stderr || e?.message || e);
      const transient = /fetch failed|ECONN|ETIMEDOUT|EAI_AGAIN|connectivity|network|5\d\d|too many requests|429/i.test(msg);
      if (!transient || i === tries - 1) break;
      const backoff = 2000 * 2 ** i; // 2s, 4s, 8s, 16s
      console.error(`  ↻ wrangler transient error (attempt ${i + 1}/${tries}), retry in ${backoff / 1000}s: ${msg.split("\n")[0].slice(0, 120)}`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoff); // sync sleep
    }
  }
  throw lastErr;
}
function d1(sql, capture = true) {
  const out = wrangler(["d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`], capture);
  try {
    const p = JSON.parse(out);
    return (Array.isArray(p) ? p[0]?.results : p?.results) ?? [];
  } catch {
    return [];
  }
}
function d1File(sql, tmp) {
  const p = join(tmp, `m-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  writeFileSync(p, sql);
  wrangler(["d1", "execute", "ulyah-db", "--remote", `--file=${p}`]);
  rmSync(p, { force: true });
}

const aws = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  region: "auto",
  service: "s3",
});
const R2_BASE = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}`;
async function r2Has(key) {
  try {
    const res = await aws.fetch(`${R2_BASE}/${key}`, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}
async function r2Put(key, bytes) {
  const res = await aws.fetch(`${R2_BASE}/${key}`, {
    method: "PUT",
    body: bytes,
    headers: { "content-type": "audio/mpeg" },
  });
  if (!res.ok) throw new Error(`R2 PUT ${res.status}`);
}

const pad3 = (n) => String(n).padStart(3, "0");
async function fetchMp3(url) {
  const res = await fetch(url, { headers: { "User-Agent": "ulyah.com murottal importer" } });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length > 2000 ? buf : null; // guard against tiny error pages
}

// Resolve the REAL per-ayah audio URL for an alquran.cloud edition via its API
// (returns the correct CDN URL + bitrate for that reciter — guessing the CDN
// path directly 404'd because not every edition is published at 128 kbps).
// Cached per (edition, surah): one API call yields every ayah of the surah.
const surahUrlCache = new Map();
async function aqcAyahUrl(edition, surah, ayahNum) {
  const ck = `${edition}:${surah}`;
  let m = surahUrlCache.get(ck);
  if (!m) {
    m = new Map();
    try {
      const r = await fetch(`${AQC_API}/surah/${surah}/${edition}`, { headers: { Accept: "application/json" } });
      if (r.ok) {
        const j = await r.json();
        for (const ay of j?.data?.ayahs ?? []) {
          if (ay?.numberInSurah && ay?.audio) m.set(ay.numberInSurah, ay.audio);
        }
      }
    } catch {
      /* leave empty — caller counts a miss */
    }
    surahUrlCache.set(ck, m);
  }
  return m.get(ayahNum) ?? null;
}

async function main() {
  const { qori, limit, concurrency } = args();
  if (!ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.error("Missing CLOUDFLARE_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY. Add the R2 S3 API token to repo secrets.");
    process.exit(1);
  }

  // Ayah list with global (mushaf) number for the aqc CDN, plus surah/ayah for keys.
  const ayat = d1(
    "SELECT a.id, a.surah_id AS s, a.number AS n FROM ayah a ORDER BY a.surah_id, a.number"
  ).map((r) => ({ id: Number(r.id), s: Number(r.s), n: Number(r.n) }));
  ayat.forEach((a, i) => (a.global = i + 1)); // 1..6236 in mushaf order
  const qoriRows = d1("SELECT id, name FROM qori").map((r) => ({ id: Number(r.id), name: r.name }));

  const targets = qori.includes("all") ? Object.keys(SOURCES) : qori;
  const tmp = mkdtempSync(join(tmpdir(), "murottal-"));

  for (const folder of targets) {
   try {
    const src = SOURCES[folder];
    if (!src) {
      console.warn(`No source mapping for "${folder}" — skipping.`);
      continue;
    }
    // Resolve qori_id from the qori registry (audio_base_path is the R2
    // folder), falling back to audio_cache inference for legacy rows, and
    // finally CREATING the row — a fresh folder must never be unimportable.
    const byPath = d1(`SELECT id FROM qori WHERE audio_base_path = 'audio/qori/${folder}' LIMIT 1`);
    let qoriId = byPath[0] ? Number(byPath[0].id) : null;
    if (!qoriId) {
      const known = d1(`SELECT qori_id FROM audio_cache WHERE r2_key LIKE 'audio/qori/${folder}/%' LIMIT 1`);
      qoriId = known[0] ? Number(known[0].qori_id) : null;
    }
    if (!qoriId) {
      const safeName = String(src.name || folder).replace(/'/g, "''");
      d1(`INSERT INTO qori (name, audio_base_path) VALUES ('${safeName}', 'audio/qori/${folder}')`, false);
      const created = d1(`SELECT id FROM qori WHERE audio_base_path = 'audio/qori/${folder}' LIMIT 1`);
      qoriId = created[0] ? Number(created[0].id) : null;
    }
    if (!qoriId) {
      console.warn(`Folder "${folder}" — could not resolve or create a qori row, skipping.`);
      continue;
    }
    const have = new Set(
      d1(`SELECT ayah_id FROM audio_cache WHERE qori_id = ${qoriId} AND r2_key LIKE 'audio/qori2/%'`).map((r) => Number(r.ayah_id))
    );
    const todo = ayat.filter((a) => !have.has(a.id)).slice(0, limit);
    console.log(`\n▶ ${folder} (qori_id=${qoriId}, ${src.kind}): ${have.size} sudah ada, ${todo.length} akan diunduh.`);

    let ok = 0,
      fail = 0;
    const inserts = [];
    for (let i = 0; i < todo.length; i += concurrency) {
      const batch = todo.slice(i, i + concurrency);
      await Promise.all(
        batch.map(async (a) => {
          const key = `audio/qori2/${folder}/${pad3(a.s)}${pad3(a.n)}.mp3`; // qori2 = the clean HiFi library
          if (await r2Has(key)) {
            inserts.push(`(${a.id}, ${qoriId}, '${key}', NULL)`);
            ok++;
            return;
          }
          const url =
            src.kind === "aqc"
              ? await aqcAyahUrl(src.edition, a.s, a.n)
              : `${EY_CDN}/${src.folder}/${pad3(a.s)}${pad3(a.n)}.mp3`;
          if (!url) {
            fail++;
            return;
          }
          // Prefer 128 kbps (the API default is sometimes a muffled 48/64 kbps
          // file), falling back to the native-bitrate URL if 128 isn't served.
          const hifi = url.replace(/\/quran\/audio\/\d+\//, "/quran/audio/128/");
          let buf = await fetchMp3(hifi);
          if (!buf && hifi !== url) buf = await fetchMp3(url);
          if (!buf) {
            fail++;
            return;
          }
          try {
            await r2Put(key, buf);
            inserts.push(`(${a.id}, ${qoriId}, '${key}', NULL)`);
            ok++;
          } catch (e) {
            fail++;
          }
        })
      );
      // Flush audio_cache rows in chunks so progress persists mid-run.
      if (inserts.length >= 400) {
        d1File(
          `INSERT INTO audio_cache (ayah_id, qori_id, r2_key, duration) VALUES ${inserts.splice(0).join(",")} ON CONFLICT(ayah_id, qori_id) DO UPDATE SET r2_key = excluded.r2_key;`,
          tmp
        );
      }
      if (i % (concurrency * 20) === 0) console.log(`  ${folder}: ${ok} ok, ${fail} gagal (…${i + batch.length}/${todo.length})`);
    }
    if (inserts.length > 0) {
      d1File(`INSERT INTO audio_cache (ayah_id, qori_id, r2_key, duration) VALUES ${inserts.join(",")} ON CONFLICT(ayah_id, qori_id) DO UPDATE SET r2_key = excluded.r2_key;`, tmp);
    }
    console.log(`✓ ${folder}: +${ok} tersimpan, ${fail} gagal (sumber tidak punya ayat itu).`);
   } catch (e) {
    // One reciter failing (persistent wrangler/network error after retries)
    // must not abort the whole `qori=all` run — log and move to the next.
    console.error(`✘ ${folder}: dilewati karena error — ${String(e?.message || e).split("\n")[0].slice(0, 160)}`);
   }
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log("\nSelesai. Cek: SELECT qori_id, COUNT(*) FROM audio_cache GROUP BY qori_id;");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
