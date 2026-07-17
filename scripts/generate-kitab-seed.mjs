// Generate the Kitab (Islamic library) seed from the public Shamela-Library
// dataset (github.com/…/Shamela-Library), which ships a catalogue of classical
// works grouped by the traditional Islamic sciences. We take only the SAFE,
// useful subset — category, title, author, a prose description and the list of
// topics each work covers — NOT full book text. Every description is Arabic
// prose that the site narrates aloud, which is the whole point ("maktabah
// syameela tp bisa di dengarkan").
//
// Run once locally against the unzipped dataset; the resulting SQL is committed
// (like the hadith seeds) so CI never needs the source archive:
//   node scripts/generate-kitab-seed.mjs /path/to/Shamela-Library-master
//
// Output: packages/db-schema/seed/kitab_library.sql
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = process.argv[2];
if (!ROOT) {
  console.error("usage: node scripts/generate-kitab-seed.mjs <Shamela-Library-master dir>");
  process.exit(1);
}
const ASSETS = join(ROOT, "app/src/main/assets");
const BOOK_DIR = join(ASSETS, "book-details");

// #Uxxxx (hex) unicode escapes used in the dataset's filenames.
const decode = (s) => s.replace(/#U([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
// Some categories appear twice, once suffixed "- مرقم آليا" (auto-numbered).
const normCat = (s) => decode(s).replace(/\s*-\s*مرقم آليا\s*$/u, "").trim();

// Full bilingual taxonomy for the 38 classical categories in the dataset.
// order groups them the way a student would browse: Qur'an → Hadith → creed →
// the four madzhab → fatwa/politics → sirah/history/biography → language → misc.
const CATS = {
  "التفاسير": { slug: "tafsir", id: "Tafsir Al-Qur'an", icon: "📖", order: 1 },
  "علوم القرآن": { slug: "ulumul-quran", id: "Ulumul Qur'an", icon: "📖", order: 2 },
  "متون الحديث": { slug: "matan-hadits", id: "Matan Hadits", icon: "🕌", order: 3 },
  "شروح الحديث": { slug: "syarah-hadits", id: "Syarah Hadits", icon: "🕌", order: 4 },
  "علوم الحديث": { slug: "ulumul-hadits", id: "Ulumul Hadits", icon: "🕌", order: 5 },
  "الأجزاء الحديثية": { slug: "ajza-haditsiyah", id: "Ajza' Haditsiyyah", icon: "🕌", order: 6 },
  "كتب التخريج والزوائد": { slug: "takhrij-zawaid", id: "Takhrij & Zawa'id", icon: "🕌", order: 7 },
  "العلل والسؤالات": { slug: "ilal-sualat", id: "'Ilal & Su'alat", icon: "🕌", order: 8 },
  "مخطوطات حديثية": { slug: "makhtutat-haditsiyah", id: "Manuskrip Hadits", icon: "🕌", order: 9 },
  "العقيدة": { slug: "aqidah", id: "Aqidah", icon: "☪️", order: 10 },
  "أصول الفقه والقواعد الفقهية": { slug: "ushul-fiqh", id: "Ushul Fiqih & Qawa'id", icon: "⚖️", order: 11 },
  "فقه حنفي": { slug: "fiqh-hanafi", id: "Fiqih Hanafi", icon: "⚖️", order: 12 },
  "فقه مالكي": { slug: "fiqh-maliki", id: "Fiqih Maliki", icon: "⚖️", order: 13 },
  "فقه شافعي": { slug: "fiqh-syafii", id: "Fiqih Syafi'i", icon: "⚖️", order: 14 },
  "فقه حنبلي": { slug: "fiqh-hanbali", id: "Fiqih Hanbali", icon: "⚖️", order: 15 },
  "فقه عام": { slug: "fiqh-umum", id: "Fiqih Umum", icon: "⚖️", order: 16 },
  "الفتاوى": { slug: "fatawa", id: "Fatwa", icon: "⚖️", order: 17 },
  "السياسة الشرعية والقضاء": { slug: "siyasah-syariyah", id: "Siyasah Syar'iyyah & Peradilan", icon: "⚖️", order: 18 },
  "السيرة والشمائل": { slug: "sirah-syamail", id: "Sirah & Syama'il", icon: "🌙", order: 19 },
  "التاريخ": { slug: "tarikh", id: "Sejarah (Tarikh)", icon: "📜", order: 20 },
  "التراجم والطبقات": { slug: "tarajim-thabaqat", id: "Biografi Ulama (Tarajim)", icon: "📜", order: 21 },
  "الأنساب": { slug: "ansab", id: "Nasab", icon: "📜", order: 22 },
  "البلدان والجغرافيا والرحلات": { slug: "buldan-jughrafiya", id: "Geografi & Perjalanan", icon: "📜", order: 23 },
  "الرقاق والآداب والأذكار": { slug: "raqaiq-adab", id: "Raqa'iq, Adab & Dzikir", icon: "🤲", order: 24 },
  "الدعوة وأحوال المسلمين": { slug: "dakwah", id: "Dakwah & Keadaan Umat", icon: "🤲", order: 25 },
  "كتب ابن تيمية": { slug: "kutub-ibnu-taimiyah", id: "Kitab Ibnu Taimiyah", icon: "✍️", order: 26 },
  "كتب ابن القيم": { slug: "kutub-ibnu-qayyim", id: "Kitab Ibnul Qayyim", icon: "✍️", order: 27 },
  "كتب ابن أبي الدنيا": { slug: "kutub-ibnu-abi-dunya", id: "Kitab Ibnu Abid-Dunya", icon: "✍️", order: 28 },
  "كتب الألباني": { slug: "kutub-albani", id: "Kitab Al-Albani", icon: "✍️", order: 29 },
  "النحو والصرف": { slug: "nahwu-sharaf", id: "Nahwu & Sharaf", icon: "🔤", order: 30 },
  "الأدب والبلاغة": { slug: "adab-balaghah", id: "Adab & Balaghah", icon: "🔤", order: 31 },
  "كتب اللغة": { slug: "kutub-lughah", id: "Kitab Bahasa", icon: "🔤", order: 32 },
  "الغريب والمعاجم ولغة الفقه": { slug: "gharib-majim", id: "Gharib & Kamus", icon: "🔤", order: 33 },
  "بحوث ومسائل": { slug: "buhuts-masail", id: "Riset & Masalah", icon: "🔍", order: 34 },
  "الجوامع والمجلات ونحوها": { slug: "jawami-majallat", id: "Kumpulan & Jurnal", icon: "🔍", order: 35 },
  "فهارس الكتب والأدلة": { slug: "faharis", id: "Indeks Kitab", icon: "🔍", order: 36 },
  "علوم أخرى": { slug: "ulum-ukhra", id: "Ilmu Lainnya", icon: "🔍", order: 37 },
  "كتب إسلامية عامة": { slug: "islamiyah-ammah", id: "Kitab Islam Umum", icon: "🔍", order: 38 },
};

const sql = (s) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const clip = (s, n) => (s && s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

const catRows = [];
for (const [ar, meta] of Object.entries(CATS)) {
  catRows.push({ ar, ...meta, count: 0 });
}
const catBySlug = Object.fromEntries(catRows.map((c) => [c.slug, c]));
const arToSlug = Object.fromEntries(catRows.map((c) => [c.ar, c.slug]));

const books = [];
const seen = new Set(); // dedupe by category+title across the "مرقم آليا" twin files

for (const file of readdirSync(BOOK_DIR)) {
  if (!file.endsWith(".json")) continue;
  const catAr = normCat(basename(file, ".json"));
  const slug = arToSlug[catAr];
  if (!slug) {
    console.warn("unmapped category:", catAr);
    continue;
  }
  let entries;
  try {
    entries = JSON.parse(readFileSync(join(BOOK_DIR, file), "utf-8"));
  } catch {
    continue;
  }
  if (!Array.isArray(entries)) continue;

  for (const e of entries) {
    const title = (e.title || "").trim();
    if (!title) continue;
    const key = slug + "|" + title;
    if (seen.has(key)) continue;
    seen.add(key);

    const author =
      (e.about || []).find((a) => a.label === "المؤلف")?.value?.trim() ||
      (e.author && e.author !== "-" ? e.author : null) ||
      null;
    const source =
      (e.about || []).find((a) => a.label === "مصدر الكتاب")?.value?.trim() || null;
    const description = clip((e.description || "").trim(), 4000) || null;
    const topics = Array.isArray(e.topics) ? e.topics.filter(Boolean).slice(0, 40) : [];

    catBySlug[slug].count++;
    books.push({
      slug,
      title,
      author,
      death: e.authorDeathYear ?? null,
      description,
      topics: topics.length ? JSON.stringify(topics) : null,
      source,
    });
  }
}

let out = `-- Kitab library (classical Islamic works) — sourced from the public
-- Shamela-Library dataset. Catalogue + prose descriptions + topics only.
-- Generated by scripts/generate-kitab-seed.mjs — DO NOT edit by hand.
PRAGMA foreign_keys = OFF;
`;

for (const c of catRows.sort((a, b) => a.order - b.order)) {
  out += `INSERT OR IGNORE INTO kitab_category (slug, name_ar, name_id, icon, sort_order) VALUES (${sql(c.slug)}, ${sql(c.ar)}, ${sql(c.id)}, ${sql(c.icon)}, ${c.order});\n`;
}
out += "\n";
for (const b of books) {
  out += `INSERT OR IGNORE INTO kitab_book (category_slug, title_ar, author, author_death_year, description_ar, topics_json, source) VALUES (${sql(b.slug)}, ${sql(b.title)}, ${sql(b.author)}, ${sql(b.death)}, ${sql(b.description)}, ${sql(b.topics)}, ${sql(b.source)});\n`;
}

const OUT = "packages/db-schema/seed/kitab_library.sql";
writeFileSync(OUT, out);
console.log(`Wrote ${OUT}: ${catRows.length} categories, ${books.length} books`);
for (const c of catRows.sort((a, b) => a.order - b.order)) {
  console.log(`  ${String(c.count).padStart(4)}  ${c.id}`);
}
