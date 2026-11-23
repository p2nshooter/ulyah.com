/**
 * Trusted Qur'an translations and tafsir, one per language, into R2 — never machine translation.
 *
 * Owner, 22 Nov 2026: „Klo Al-quran mah jgn di terjemah sembarangan, cari langsung tafsir2 dari setiap negara dari
 * sumber manapun termasuk github yg tafsirnya sholeh agar tidak salah menerjemahkan" — "berlaku jg untuk axto.io";
 * and „Jgn ke D1, pindah ke R2".
 *
 * SOURCE. QuranEnc.com — the Encyclopedia of Translations of the Meanings of the Noble Qur'an (Rowwad Translation
 * Center with the Tafsir Center for Quranic Studies): translations by named scholars and institutions (Indonesian
 * Ministry of Religious Affairs, King Fahd Complex, Rowwad's reviewed editions), and "Al-Mukhtasar fi Tafsir
 * al-Qur'an", a concise tafsir on the method of Ahl as-Sunnah wal-Jama'ah, translated into many languages. Its terms
 * of republication are followed to the letter:
 *   1. no modification, addition or deletion — the text and its footnotes are stored exactly as delivered;
 *   2. the publisher and source (QuranEnc.com) are named wherever it is shown;
 *   3. the version is shown with it;
 *   4. the credit stays with the text (stored in every file);
 *   6. it is kept at the latest version — this job re-checks the version every week and re-imports on a change.
 *
 * CHOICE PER LANGUAGE. A named preference where the owner's countries have an official translation (Indonesia's
 * Ministry of Religious Affairs, Saheeh International for English); otherwise the reviewed edition QuranEnc lists for
 * that language, preferring Rowwad / King Fahd Complex / ministry editions, then the most recently updated. A tafsir
 * key is never taken as a translation. The choice and its version are written next to the text (meta.json) and
 * printed, so a person can see — and override with --prefer=lang:key — exactly what each site shows.
 *
 * CHECKS before anything is written: 114 surahs, every surah with exactly its ayah count (6,236 in all), every ayah
 * numbered in order and non-empty. A language that fails a check is not written at all (the old text stays).
 *
 * R2 (bucket of the Worker, MEDIA_R2):
 *   quran/tr/<lang>/<surah>.json        { key, version, ayat: [{ a, t, f? }] }
 *   quran/tr/<lang>/meta.json           { key, title, version, last_update, source, url, fetchedAt, ayat }
 *   quran/mukhtasar/<lang>/<surah>.json  the same, for Al-Mukhtasar
 *   quran/tr/_index.json                { <lang>: { key, title, version } }   (and quran/mukhtasar/_index.json)
 *
 * Usage: npx tsx scripts/import-quran-translations.ts [--langs=id,en] [--prefer=tr:turkish_rwwad] [--force] [--dry]
 */
import { appendFileSync } from "node:fs";
import { R2S3, mapLimit } from "./lib/r2-s3";

const API = "https://quranenc.com/api/v1";

/** Ayah count of every surah (Hafs, 6,236 in all). */
export const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77,
  227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36,
  25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

/** The site languages (packages/shared i18n) — Arabic is the Qur'an itself. */
export const SITE_LANGS = [
  "id", "en", "fr", "de", "es", "ru", "zh", "ja", "ur", "hi", "bn", "tr", "fa", "ms", "sw", "pt", "nl", "it", "ta",
  "ha", "ps", "th", "ko", "vi", "uz", "so", "pl",
];

/** Named preferences: the official or best-established reviewed translation of that country. First found wins. */
export const PREFERRED: Record<string, string[]> = {
  id: ["indonesian_affairs", "indonesian_complex"], // Kementerian Agama RI
  en: ["english_saheeh", "english_rwwad"], // Saheeh International
  tr: ["turkish_rwwad", "turkish_shaban"],
  ur: ["urdu_junagarhi"],
  bn: ["bengali_zakaria"],
};

export interface Entry {
  key: string;
  language_iso_code: string;
  version: string;
  last_update: number | string;
  title: string;
  description?: string;
}

const TAFSIR_KEY = /mokhtasar|mukhtasar|muyassar|saadi|tafsir|tafseer|katheer|kathir|tabari/i;
const TRUSTED_TITLE = /rowwad|rwwad|ruwwad|complex|king fahd|ministry|affairs|saheeh|sahih/i;

/** Pick the translation for a language: named preference, then reviewed editions, then the most recent. */
export function pickTranslation(lang: string, entries: Entry[], override?: string): Entry | null {
  const list = entries.filter((e) => e.language_iso_code === lang && !TAFSIR_KEY.test(e.key) && !TAFSIR_KEY.test(e.title));
  if (override) return list.find((e) => e.key === override) ?? null;
  for (const k of PREFERRED[lang] ?? []) {
    const hit = list.find((e) => e.key === k);
    if (hit) return hit;
  }
  const ts = (e: Entry) => Number(e.last_update) || 0;
  const ranked = [...list].sort(
    (a, b) => Number(TRUSTED_TITLE.test(b.title)) - Number(TRUSTED_TITLE.test(a.title)) || ts(b) - ts(a) || a.key.localeCompare(b.key)
  );
  return ranked[0] ?? null;
}

/** Al-Mukhtasar fi Tafsir al-Qur'an for a language, when QuranEnc has it. */
export function pickMukhtasar(lang: string, entries: Entry[]): Entry | null {
  return entries.find((e) => e.language_iso_code === lang && /mokhtasar|mukhtasar/i.test(e.key)) ?? null;
}

export interface Ayah {
  a: number;
  t: string;
  f?: string;
}

/** Normalise one surah's API answer and check it completely. Throws with the reason on any doubt. */
export function checkSurah(n: number, raw: unknown): Ayah[] {
  const arr = Array.isArray(raw) ? raw : Array.isArray((raw as { result?: unknown })?.result) ? (raw as { result: unknown[] }).result : null;
  if (!arr) throw new Error(`surah ${n}: unexpected answer`);
  const want = AYAH_COUNTS[n - 1]!;
  if (arr.length !== want) throw new Error(`surah ${n}: ${arr.length} ayat, expected ${want}`);
  return arr.map((x, i) => {
    const r = x as { sura?: unknown; aya?: unknown; translation?: unknown; footnotes?: unknown };
    const a = Number(r.aya);
    if (Number(r.sura) !== n || a !== i + 1) throw new Error(`surah ${n}: ayah ${i + 1} is numbered ${r.sura}:${r.aya}`);
    const t = typeof r.translation === "string" ? r.translation : "";
    if (!t.trim()) throw new Error(`surah ${n}: ayah ${a} has no text`);
    const f = typeof r.footnotes === "string" && r.footnotes.trim() ? r.footnotes : undefined;
    return f ? { a, t, f } : { a, t };
  });
}

async function getJson(url: string): Promise<unknown> {
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json", "user-agent": "quran-import/1.0 (+QuranEnc republication)" } });
      if (res.ok) return await res.json();
      if (res.status === 404) throw new Error(`404 ${url}`);
    } catch (err) {
      if (String(err).includes("404")) throw err;
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
  }
  throw new Error(`gave up on ${url}`);
}

async function listAll(): Promise<Entry[]> {
  const raw = await getJson(`${API}/translations/list`);
  const arr = Array.isArray(raw) ? raw : (raw as { translations?: unknown[] }).translations ?? [];
  // A key becomes part of a URL path and of an R2 object name: only QuranEnc's own key shape is accepted.
  return (arr as Entry[]).filter(
    (e) => e && typeof e.key === "string" && /^[a-z0-9_]{2,64}$/.test(e.key) && typeof e.language_iso_code === "string" && /^[a-z]{2,3}$/.test(e.language_iso_code)
  );
}

interface Meta {
  key: string;
  title: string;
  version: string;
  last_update: number | string;
  source: string;
  url: string;
  fetchedAt: string;
  ayat: number;
}

async function importOne(r2: R2S3 | null, kind: "tr" | "mukhtasar", lang: string, e: Entry, force: boolean): Promise<"same" | "written" | "dry"> {
  const base = `quran/${kind}/${lang}`;
  if (r2 && !force) {
    const cur = (await r2.getJson<Meta>(`${base}/meta.json`))?.value;
    if (cur && cur.key === e.key && String(cur.version) === String(e.version)) return "same";
  }
  // Fetch and check all 114 surahs BEFORE writing any of them.
  const surahs: Ayah[][] = new Array(114);
  await mapLimit(
    Array.from({ length: 114 }, (_, i) => i + 1),
    6,
    async (n) => {
      surahs[n - 1] = checkSurah(n, await getJson(`${API}/translation/sura/${e.key}/${n}`));
    }
  );
  const total = surahs.reduce((s, x) => s + x.length, 0);
  if (total !== 6236) throw new Error(`${e.key}: ${total} ayat, expected 6236`);
  if (!r2) return "dry";
  await mapLimit(surahs, 16, async (ayat, i) => {
    await r2.put(`${base}/${i + 1}.json`, JSON.stringify({ key: e.key, version: e.version, source: "QuranEnc.com", ayat }));
  });
  const meta: Meta = {
    key: e.key,
    title: e.title,
    version: String(e.version),
    last_update: e.last_update,
    source: "QuranEnc.com",
    url: `https://quranenc.com/en/browse/${e.key}`,
    fetchedAt: new Date().toISOString(),
    ayat: total,
  };
  await r2.put(`${base}/meta.json`, JSON.stringify(meta)); // written last: a reader trusts a language once its meta is there
  return "written";
}

function args() {
  const a = Object.fromEntries(
    process.argv.slice(2).map((x) => {
      const [k, v] = x.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  const prefer: Record<string, string> = {};
  for (const p of String(a.prefer ?? "").split(",").filter(Boolean)) {
    const [l, k] = p.split(":");
    if (l && k) prefer[l] = k;
  }
  return {
    langs: String(a.langs ?? "").split(",").map((s) => s.trim()).filter((l) => SITE_LANGS.includes(l)),
    prefer,
    force: a.force === "true",
    dry: a.dry === "true",
  };
}

async function main() {
  const opt = args();
  const r2 = opt.dry ? null : R2S3.fromEnv();
  if (!opt.dry && !r2) {
    console.error("CLOUDFLARE_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY are required (or --dry).");
    process.exit(1);
  }
  const entries = await listAll();
  console.log(`QuranEnc lists ${entries.length} translation(s).`);
  const langs = opt.langs.length ? opt.langs : SITE_LANGS;
  const index: Record<"tr" | "mukhtasar", Record<string, { key: string; title: string; version: string }>> = { tr: {}, mukhtasar: {} };
  const report: string[] = [];
  let failed = 0;
  for (const lang of langs) {
    for (const kind of ["tr", "mukhtasar"] as const) {
      const e = kind === "tr" ? pickTranslation(lang, entries, opt.prefer[lang]) : pickMukhtasar(lang, entries);
      if (!e) {
        report.push(`${lang} ${kind}: none on QuranEnc — the site keeps its current text (never a machine translation)`);
        continue;
      }
      try {
        const r = await importOne(r2, kind, lang, e, opt.force);
        index[kind][lang] = { key: e.key, title: e.title, version: String(e.version) };
        report.push(`${lang} ${kind}: ${e.key} v${e.version} — ${r} (${e.title})`);
      } catch (err) {
        failed++;
        report.push(`${lang} ${kind}: ${e.key} REFUSED — ${(err as Error).message}`);
      }
    }
  }
  if (r2) {
    for (const kind of ["tr", "mukhtasar"] as const) {
      await r2.updateJson<Record<string, unknown>>(`quran/${kind}/_index.json`, (cur) => ({ ...(cur ?? {}), ...index[kind] }));
    }
  }
  for (const l of report) console.log(l);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Terjemah & tafsir Al-Qur'an (QuranEnc)\n\n${report.map((l) => `- ${l}`).join("\n")}\n`);
  }
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && /(^|[\\/])import-quran-translations\.ts$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
