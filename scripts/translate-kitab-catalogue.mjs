/**
 * Translates the kitab catalogue — 4,969 works from the Shamela dataset — into
 * the language of every ecosystem site, ONCE, into static JSON in this repo.
 *
 * Owner, 12 Oct 2026: "turunin database web islami ekosistem … tp kitab2 tetep
 * maximal sesuai bahasanya translate sesuai bahasanya dan ulyah.com hanya
 * berbahasa indonesia".
 *
 * WHY STATIC. Until now a kitab page asked the API to translate its Arabic
 * title, description and table of contents on first view. Each answer became a
 * row in D1's mt_cache (`mt:ar-<lang>:…`), and the nightly maintenance deleted
 * every `mt:ar-*` row again, because that prune was written for hadith matn —
 * where a machine reading the Arabic is wrong. Catalogue metadata was always
 * meant to be translated (scripts/check-no-arabic-mt.mjs says so), so the two
 * rules fought: ~3,300 rows written and deleted every day, the D1 read and
 * write quota spent on the churn, and a kitab page that was translated
 * yesterday back in Arabic today. Here the translation is done once, kept in
 * git, and served as the web Worker's own static files: 0 D1 rows, 0 D1 reads,
 * and every work translated on every site from its first visit.
 *
 * WHAT. Per language (id → ulyah.com, en → xad.es, fr → 1fr.fr, de → tilawa.de):
 *   titles        { "<work id>": "…" }
 *   descriptions  { "<work id>": "…" }
 *   topics        { "<hashKey(arabic heading)>": "…" }  (55k distinct headings,
 *                 shared between works, so each is translated once)
 * Written to scripts/data/kitab-i18n/<lang>.json and folded into each tenant's
 * static kitab files by scripts/build-kitab-static.ts.
 *
 * HOW. The keyless Google endpoint the Worker already uses (gtx), in batches of
 * up to 90 strings / ~4,500 characters per request, with backoff on 429/5xx.
 * Resumable: the output file is rewritten after every batch, and a rerun only
 * asks for what is still missing — so a rate limit costs time, never work.
 *
 * Two corrections the translator cannot be trusted with:
 *   • Honorifics are fixed phrases, not prose. "صلى الله عليه وسلم" came out as
 *     "semoga Allah sholawat dan saw"; they are masked before translation and
 *     put back in each language's own established form (ﷺ, radhiyallahu 'anhu…).
 *   • "عن" in a chain of narration is "dari", not "atas wewenang" — the error
 *     scripts/prune-mt-arabic.ts documents. Fixed after translation, per language.
 *
 * Usage:
 *   node scripts/translate-kitab-catalogue.mjs [--lang=id,en,fr,de]
 *        [--only=titles,descriptions,topics] [--max-requests=N] [--delay-ms=600]
 */
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { hashKey } from "./mt-key.mjs";

const ROOT = join(import.meta.dirname, "..");
const SCHEMA = join(ROOT, "packages", "db-schema");
export const KITAB_I18N_DIR = join(ROOT, "scripts", "data", "kitab-i18n");

/** Site language for each ecosystem tenant that builds kitab pages. */
export const KITAB_LANGS = ["id", "en", "fr", "de"];

const GTX = "https://translate.googleapis.com/translate_a/t?client=gtx&sl=ar&format=text&tl=";
const MAX_ITEMS = 90;
const MAX_CHARS = 4500;

/**
 * Fixed Islamic phrases, longest first. Each is masked as @@n@@ before the
 * text goes to the translator and restored in the target language's own form.
 */
const HONORIFICS = [
  {
    ar: "صلى الله عليه وآله وسلم",
    id: "ﷺ", en: "ﷺ", fr: "ﷺ", de: "ﷺ",
  },
  { ar: "صلى الله عليه وسلم", id: "ﷺ", en: "ﷺ", fr: "ﷺ", de: "ﷺ" },
  {
    ar: "رضي الله عنهما",
    id: "radhiyallahu 'anhuma",
    en: "(may Allah be pleased with them both)",
    fr: "(qu'Allah les agrée)",
    de: "(möge Allah mit beiden zufrieden sein)",
  },
  {
    ar: "رضي الله عنهم",
    id: "radhiyallahu 'anhum",
    en: "(may Allah be pleased with them)",
    fr: "(qu'Allah les agrée)",
    de: "(möge Allah mit ihnen zufrieden sein)",
  },
  {
    ar: "رضي الله عنها",
    id: "radhiyallahu 'anha",
    en: "(may Allah be pleased with her)",
    fr: "(qu'Allah l'agrée)",
    de: "(möge Allah mit ihr zufrieden sein)",
  },
  {
    ar: "رضي الله عنه",
    id: "radhiyallahu 'anhu",
    en: "(may Allah be pleased with him)",
    fr: "(qu'Allah l'agrée)",
    de: "(möge Allah mit ihm zufrieden sein)",
  },
  {
    ar: "رضوان الله عليهم",
    id: "radhiyallahu 'anhum",
    en: "(may Allah be pleased with them)",
    fr: "(qu'Allah les agrée)",
    de: "(möge Allah mit ihnen zufrieden sein)",
  },
  {
    ar: "عليهم السلام",
    id: "'alaihimussalam",
    en: "(peace be upon them)",
    fr: "(paix sur eux)",
    de: "(Friede sei mit ihnen)",
  },
  {
    ar: "عليه السلام",
    id: "'alaihissalam",
    en: "(peace be upon him)",
    fr: "(paix sur lui)",
    de: "(Friede sei mit ihm)",
  },
  {
    ar: "رحمهم الله",
    id: "rahimahumullah",
    en: "(may Allah have mercy on them)",
    fr: "(qu'Allah leur fasse miséricorde)",
    de: "(möge Allah sich ihrer erbarmen)",
  },
  {
    ar: "رحمه الله",
    id: "rahimahullah",
    en: "(may Allah have mercy on him)",
    fr: "(qu'Allah lui fasse miséricorde)",
    de: "(möge Allah sich seiner erbarmen)",
  },
  { ar: "سيدنا", id: "Sayyidina", en: "our master", fr: "notre maître", de: "unser Meister" },
];

/**
 * Whole headings with an established name in each language. A table of
 * contents is full of them, and the translator renders مقدمة as "perkenalan"
 * (an introduction between people) rather than the Muqaddimah of a book.
 * Matched on the whole heading; used instead of the translator, here and in
 * scripts/build-kitab-static.ts (which also corrects older output).
 */
export const EXACT_HEADINGS = {
  "مقدمة": { id: "Muqaddimah", en: "Introduction", fr: "Introduction", de: "Einleitung" },
  "المقدمة": { id: "Muqaddimah", en: "Introduction", fr: "Introduction", de: "Einleitung" },
  "مقدمة المؤلف": { id: "Muqaddimah Penulis", en: "Author's introduction", fr: "Introduction de l'auteur", de: "Einleitung des Verfassers" },
  "مقدمة المحقق": { id: "Muqaddimah Muhaqqiq", en: "Editor's introduction", fr: "Introduction de l'éditeur", de: "Einleitung des Herausgebers" },
  "مقدمة التحقيق": { id: "Muqaddimah Tahqiq", en: "Editor's introduction", fr: "Introduction de l'édition critique", de: "Einleitung zur Edition" },
  "تمهيد": { id: "Pendahuluan", en: "Preface", fr: "Préambule", de: "Vorbemerkung" },
  "التمهيد": { id: "Pendahuluan", en: "Preface", fr: "Préambule", de: "Vorbemerkung" },
  "خاتمة": { id: "Penutup", en: "Conclusion", fr: "Conclusion", de: "Schluss" },
  "الخاتمة": { id: "Penutup", en: "Conclusion", fr: "Conclusion", de: "Schluss" },
  "فهرس": { id: "Daftar isi", en: "Contents", fr: "Table des matières", de: "Inhaltsverzeichnis" },
  "الفهرس": { id: "Daftar isi", en: "Contents", fr: "Table des matières", de: "Inhaltsverzeichnis" },
  "فهرس الموضوعات": { id: "Daftar isi", en: "Contents", fr: "Table des matières", de: "Inhaltsverzeichnis" },
  "المصادر والمراجع": { id: "Sumber dan rujukan", en: "Sources and references", fr: "Sources et références", de: "Quellen und Literatur" },
  "ترجمة المؤلف": { id: "Biografi penulis", en: "Biography of the author", fr: "Biographie de l'auteur", de: "Biographie des Verfassers" },
};

/** The fixed rendering of a whole heading, when it has one. */
export function exactHeading(arabic, lang) {
  const key = arabic.replace(/\s+/g, " ").trim().replace(/[.:،]+$/, "");
  return EXACT_HEADINGS[key]?.[lang] ?? null;
}

/**
 * Known mistranslations, corrected after the fact. Indonesian readers know
 * فقه as "fikih" and أصول الفقه as "ushul fikih"; the translator's legal
 * "yurisprudensi" is a different discipline.
 */
const POST_EDITS = {
  id: [
    [/\batas wewenang\b/gi, "dari"],
    [/\bsemoga Allah memberkatinya dan memberinya kedamaian\b/gi, "ﷺ"],
    [/\b(prinsip-prinsip|asas-asas|dasar-dasar) yurisprudensi( Islam)?\b/gi, "ushul fikih"],
    [/\byurisprudensi\b/gi, "fikih"],
    // عتاب is a gentle admonition. "Celaan" (abuse, insult) is what the
    // translator chose for آيات عتاب المصطفى ﷺ — wrong, and not a word to put
    // next to the Prophet's name.
    [/\bcelaan\b/gi, "teguran"],
  ],
  en: [],
  fr: [[/\bsous l'autorité d(e|')\s?/gi, "d'après "]],
  de: [[/\bauf (die )?Autorität (von|des|der)\b/gi, "nach"]],
};

function mask(text, lang) {
  const restore = [];
  let out = text;
  for (const h of HONORIFICS) {
    if (!out.includes(h.ar)) continue;
    out = out.split(h.ar).join(`@@${restore.length}@@`);
    restore.push(h[lang]);
  }
  return { masked: out, restore };
}

function unmask(text, restore) {
  return text.replace(/@@\s*(\d+)\s*@@/g, (_, d) => restore[Number(d)] ?? "");
}

/** Keeps a capital where the translator put one ("Yurisprudensi" → "Fikih"). */
function sameCase(found, to) {
  return found[0] && found[0] === found[0].toUpperCase() && found[0] !== found[0].toLowerCase()
    ? to[0].toUpperCase() + to.slice(1)
    : to;
}

/** The corrections above, for text translated before they existed (build time). */
export function postEditText(text, lang) {
  return text ? postEdit(text, lang) : text;
}

function postEdit(text, lang) {
  let out = text;
  for (const [re, to] of POST_EDITS[lang] ?? []) out = out.replace(re, (m) => sameCase(m, to));
  return out.replace(/\s+([,.;:!?)])/g, "$1").replace(/\s{2,}/g, " ").trim();
}

function args() {
  const a = Object.fromEntries(
    process.argv.slice(2).map((s) => {
      const [k, v] = s.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    langs: (a.lang ?? KITAB_LANGS.join(",")).split(",").filter((l) => KITAB_LANGS.includes(l)),
    only: (a.only ?? "titles,descriptions,topics").split(","),
    maxRequests: Number(a["max-requests"] ?? Infinity),
    delayMs: Number(a["delay-ms"] ?? 600),
  };
}

/** The catalogue exactly as D1 and the static build hold it. */
export function loadCatalogue() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(join(SCHEMA, "migrations", "0008_kitab_library.sql"), "utf8"));
  db.exec(readFileSync(join(SCHEMA, "seed", "kitab_library.sql"), "utf8"));
  const works = db
    .prepare("SELECT id, title_ar, description_ar, topics_json FROM kitab_book ORDER BY id")
    .all()
    .map((r) => {
      let topics = [];
      try {
        topics = r.topics_json ? JSON.parse(r.topics_json) : [];
      } catch {
        topics = [];
      }
      return { id: r.id, title: r.title_ar, description: r.description_ar ?? "", topics };
    });
  db.close();
  return works;
}

export function topicKey(arabic) {
  return hashKey(arabic.replace(/\s+/g, " ").trim());
}

function readOut(lang) {
  const file = join(KITAB_I18N_DIR, `${lang}.json`);
  if (!existsSync(file)) return { lang, titles: {}, descriptions: {}, topics: {} };
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeOut(lang, data) {
  mkdirSync(KITAB_I18N_DIR, { recursive: true });
  const file = join(KITAB_I18N_DIR, `${lang}.json`);
  const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  const body = {
    lang,
    source: "Machine translation (Google, gtx) of the Arabic Shamela catalogue; honorifics and narration terms corrected — scripts/translate-kitab-catalogue.mjs",
    titles: sorted(data.titles),
    descriptions: sorted(data.descriptions),
    topics: sorted(data.topics),
  };
  writeFileSync(`${file}.tmp`, JSON.stringify(body, null, 0) + "\n");
  renameSync(`${file}.tmp`, file);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translateBatch(texts, lang) {
  const body = new URLSearchParams();
  const masks = texts.map((t) => mask(t, lang));
  for (const m of masks) body.append("q", m.masked);
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(GTX + lang, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} (not retried)`);
      const json = await res.json();
      // One string back for one string in; a single input comes back bare.
      const arr = texts.length === 1 && typeof json === "string" ? [json] : json;
      if (!Array.isArray(arr) || arr.length !== texts.length) throw new Error("segment count mismatch");
      return arr.map((v, i) => {
        const s = Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
        return postEdit(unmask(s, masks[i].restore), lang);
      });
    } catch (err) {
      if (String(err).includes("not retried")) throw err;
      const wait = Math.min(120_000, 4000 * 2 ** attempt);
      console.error(`  ${lang}: ${err.message ?? err}; retry in ${Math.round(wait / 1000)}s`);
      await sleep(wait);
    }
  }
  throw new Error(`${lang}: translator unavailable after 6 attempts`);
}

function batches(items) {
  const out = [];
  let cur = [];
  let chars = 0;
  for (const it of items) {
    const n = it.text.length;
    if (cur.length && (cur.length >= MAX_ITEMS || chars + n > MAX_CHARS)) {
      out.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(it);
    chars += n;
  }
  if (cur.length) out.push(cur);
  return out;
}

async function main() {
  const { langs, only, maxRequests, delayMs } = args();
  const works = loadCatalogue();
  const topicText = new Map();
  for (const w of works) for (const t of w.topics) topicText.set(topicKey(t), t.replace(/\s+/g, " ").trim());
  console.log(`Catalogue: ${works.length} works, ${topicText.size} distinct headings.`);

  let requests = 0;
  for (const lang of langs) {
    const data = readOut(lang);
    const todo = [];
    if (only.includes("titles"))
      for (const w of works) if (!data.titles[w.id] && w.title.trim()) todo.push({ kind: "titles", key: String(w.id), text: w.title.replace(/\s+/g, " ").trim() });
    if (only.includes("descriptions"))
      for (const w of works)
        if (!data.descriptions[w.id] && w.description.trim())
          todo.push({ kind: "descriptions", key: String(w.id), text: w.description.replace(/\s+/g, " ").trim() });
    if (only.includes("topics"))
      for (const [k, t] of topicText) {
        if (data.topics[k] || !t) continue;
        const fixed = exactHeading(t, lang);
        if (fixed) data.topics[k] = fixed;
        else todo.push({ kind: "topics", key: k, text: t });
      }

    const plan = batches(todo);
    console.log(`${lang}: ${todo.length} strings left in ${plan.length} request(s).`);
    let done = 0;
    for (const batch of plan) {
      if (requests >= maxRequests) {
        writeOut(lang, data);
        console.log(`Stopped at --max-requests=${maxRequests}; rerun to continue.`);
        return;
      }
      const out = await translateBatch(batch.map((b) => b.text), lang);
      requests++;
      batch.forEach((b, i) => {
        if (out[i]) data[b.kind][b.key] = out[i];
      });
      done += batch.length;
      if (requests % 10 === 0) {
        writeOut(lang, data);
        console.log(`  ${lang}: ${done}/${todo.length}`);
      }
      await sleep(delayMs);
    }
    writeOut(lang, data);
    console.log(
      `${lang}: complete — ${Object.keys(data.titles).length} titles, ${Object.keys(data.descriptions).length} descriptions, ${Object.keys(data.topics).length} headings.`
    );
  }
}

if (process.argv[1]?.includes("translate-kitab-catalogue")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
