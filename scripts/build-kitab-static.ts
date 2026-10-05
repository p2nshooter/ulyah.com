/**
 * Builds the kitab library as static JSON, served by the web Worker's own
 * static assets instead of read from D1 on every page.
 *
 * WHY. Every kitab page asked api.ulyah.com, which asked D1, on every render —
 * and the shared D1 daily read quota (5M rows on the free plan, shared by
 * every site on the account) runs out (code 7500, see docs/ADSENSE-BLUEPRINT.md
 * §8 and the deploy log of 2026-10-04). From that moment the API answers 500,
 * the pages caught the error and rendered "Tidak ada hasil", and the R2 page
 * cache kept that empty render for a whole day (revalidate = 86400). That is
 * the owner's report, 5 Oct 2026: "Seluruh kitab di ulyah.com hilang".
 * The index alone read ~5,000 rows per render (a COUNT over kitab_book for
 * each of the 38 categories), and the home page asked for it on every visit.
 *
 * Blueprint §11, rule 2: static data (kitab text) is served as static files,
 * not read from D1 per request.
 *
 * SOURCE. Nothing here is written by hand and nothing is fetched: the JSON is
 * produced by replaying the very seed files the deploy imported into D1
 * (packages/db-schema/seed/*.sql, in the deploy workflow's order) into an
 * in-memory SQLite, then applying the same Arabic clean-up D1 received
 * (scripts/clean-pesantren-text.ts → cleanMatn). kitab_library.sql has not
 * changed since it was imported (9287a7f), so book ids match the live urls.
 *
 * OUTPUT (apps/web/public/kitab-data, git-ignored, rebuilt by every web build):
 *   library/index.json             38 categories + counts
 *   library/cat/<slug>.json        a shelf: every work, sorted like the API
 *   library/book/<id/100>.json     full records, 100 per file
 *   pesantren/index.json           categories + kitab + bab counts
 *   pesantren/kitab/<slug>.json    one kitab in full (same shape as the API)
 *
 * Costs: 0 D1 reads, 0 R2 bytes. About 20 MB of Worker static assets, which
 * are free and do not count toward the < 10 GB D1 + R2 target.
 *
 * Usage: npx tsx scripts/build-kitab-static.ts [--out=apps/web/public/kitab-data]
 */
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cleanMatn } from "./clean-pesantren-text.ts";
import { storyKey } from "./mt-key.mjs";

const ROOT = join(import.meta.dirname, "..");
const SCHEMA = join(ROOT, "packages", "db-schema");

/** Exactly the files, and the order, the deploy workflow applies them in. */
const LIBRARY_SEEDS = ["kitab_library.sql"];
const PESANTREN_SEEDS = [
  "pesantren_kitab.sql",
  "pesantren_desc_upgrade.sql",
  "pesantren_aqidatul_full.sql",
  "pesantren_full_texts.sql",
  "pesantren_balaghah.sql",
  "pesantren_faraidh_mantiq.sql",
  "pesantren_full_texts_2.sql",
  "pesantren_full_texts_3.sql",
  "pesantren_full_texts_4.sql",
  "pesantren_sullamtaufiq.sql",
];
/**
 * Schema and data interleaved the way D1 received them: the library was
 * seeded (deploy of 9 Jul) before 0011 filled in the English category names
 * (10 Jul), so 0011 runs after the library seed, or its UPDATEs hit nothing.
 */
const STEPS: [kind: "migrations" | "seed", file: string][] = [
  ["migrations", "0008_kitab_library.sql"],
  ...LIBRARY_SEEDS.map((f) => ["seed", f] as ["seed", string]),
  ["migrations", "0011_kitab_category_en.sql"],
  ["migrations", "0017_pesantren_kitab.sql"],
  ...PESANTREN_SEEDS.map((f) => ["seed", f] as ["seed", string]),
];
/** Category names the sibling sites read, hand-translated (seed/translations). */
const SIBLING_LANGS = ["es", "de", "fr"] as const;

function arg(name: string, fallback: string): string {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function writeJson(path: string, data: unknown): number {
  const body = JSON.stringify(data);
  writeFileSync(path, body);
  return body.length;
}

/** `INSERT INTO mt_cache (k, v) VALUES ('k','v'),…` → Map(k → v). */
function readMtRows(file: string): Map<string, string> {
  const sql = readFileSync(file, "utf8");
  const out = new Map<string, string>();
  const row = /\('((?:[^']|'')*)','((?:[^']|'')*)'\)/g;
  for (const m of sql.matchAll(row)) out.set(m[1]!.replace(/''/g, "'"), m[2]!.replace(/''/g, "'"));
  return out;
}

function main(): void {
  const out = resolve(ROOT, arg("out", "apps/web/public/kitab-data"));
  const started = Date.now();
  const db = new DatabaseSync(":memory:");
  for (const [dir, file] of STEPS) db.exec(readFileSync(join(SCHEMA, dir, file), "utf8"));

  // The same clean-up D1 received (clean-pesantren-text workflow): markup out,
  // and a row with no letter or digit left was only ever markup — dropped.
  const dirty = db
    .prepare("SELECT id, text_ar FROM pesantren_matn WHERE text_ar GLOB '*[A-Za-z]*'")
    .all() as { id: number; text_ar: string }[];
  const upd = db.prepare("UPDATE pesantren_matn SET text_ar = ? WHERE id = ?");
  const del = db.prepare("DELETE FROM pesantren_matn WHERE id = ?");
  let cleaned = 0;
  let dropped = 0;
  for (const r of dirty) {
    const c = cleanMatn(r.text_ar);
    if (c === r.text_ar) continue;
    if (!/[\p{L}\p{N}]/u.test(c)) {
      del.run(r.id);
      dropped++;
    } else {
      upd.run(c, r.id);
      cleaned++;
    }
  }

  rmSync(out, { recursive: true, force: true });
  for (const d of ["library/cat", "library/book", "pesantren/kitab"]) mkdirSync(join(out, d), { recursive: true });
  let bytes = 0;
  let files = 0;
  const put = (rel: string, data: unknown) => {
    bytes += writeJson(join(out, rel), data);
    files++;
  };

  // ── Shamela catalogue ─────────────────────────────────────────────────────
  const mt = readMtRows(join(SCHEMA, "seed", "translations", "kitab-categories.sql"));
  const cats = db
    .prepare(
      `SELECT c.slug, c.name_ar, c.name_id, c.name_en, c.icon, c.sort_order,
              (SELECT COUNT(*) FROM kitab_book b WHERE b.category_slug = c.slug) AS book_count
       FROM kitab_category c ORDER BY c.sort_order`
    )
    .all() as { slug: string; name_en: string | null; book_count: number }[];
  const categories = cats.map((c) => {
    const names: Record<string, string> = {};
    for (const lang of SIBLING_LANGS) {
      const v = c.name_en ? mt.get(storyKey(c.name_en, lang)) : undefined;
      if (v) names[lang] = v;
    }
    return { ...c, names };
  });
  const total = categories.reduce((n, c) => n + c.book_count, 0);
  put("library/index.json", { categories, total });

  const shelf = db.prepare(
    `SELECT id, title_ar, author, author_death_year, source, substr(description_ar, 1, 240) AS excerpt
     FROM kitab_book WHERE category_slug = ? ORDER BY title_ar`
  );
  const next = new Map<number, { id: number; title_ar: string } | null>();
  for (const c of categories) {
    const books = shelf.all(c.slug) as { id: number; title_ar: string }[];
    books.forEach((b, i) => next.set(b.id, books[i + 1] ? { id: books[i + 1]!.id, title_ar: books[i + 1]!.title_ar } : null));
    put(`library/cat/${c.slug}.json`, { slug: c.slug, books });
  }

  const all = db
    .prepare(
      `SELECT id, category_slug, title_ar, author, author_death_year, description_ar, topics_json, source
       FROM kitab_book ORDER BY id`
    )
    .all() as { id: number; topics_json: string | null }[];
  const buckets = new Map<number, Record<number, unknown>>();
  for (const { topics_json, ...b } of all) {
    let topics: string[] = [];
    try {
      topics = topics_json ? JSON.parse(topics_json) : [];
    } catch {
      topics = [];
    }
    const key = Math.floor(b.id / 100);
    const bucket = buckets.get(key) ?? {};
    bucket[b.id] = { ...b, topics, next: next.get(b.id) ?? null };
    buckets.set(key, bucket);
  }
  for (const [key, bucket] of buckets) put(`library/book/${key}.json`, bucket);

  // ── Kitab pesantren ───────────────────────────────────────────────────────
  const pCats = db
    .prepare(
      `SELECT c.slug, c.name_id, c.name_ar, c.icon, c.sort_order,
              (SELECT COUNT(*) FROM pesantren_kitab k WHERE k.category_slug = c.slug) AS kitab_count
       FROM pesantren_category c ORDER BY c.sort_order`
    )
    .all();
  const pKitab = db
    .prepare(
      `SELECT k.slug, k.category_slug, k.title_ar, k.title_id, k.author, k.author_death_year,
              k.description_id, k.sort_order,
              (SELECT COUNT(*) FROM pesantren_bab b WHERE b.kitab_slug = k.slug) AS bab_count
       FROM pesantren_kitab k ORDER BY k.sort_order`
    )
    .all() as { slug: string }[];
  put("pesantren/index.json", { categories: pCats, kitab: pKitab });

  const kitabRow = db.prepare(
    `SELECT k.*, c.name_id AS category_name, c.icon AS category_icon
     FROM pesantren_kitab k LEFT JOIN pesantren_category c ON c.slug = k.category_slug WHERE k.slug = ?`
  );
  const babRows = db.prepare(
    "SELECT id, bab_order, name_id, name_ar FROM pesantren_bab WHERE kitab_slug = ? ORDER BY bab_order"
  );
  const matnRows = db.prepare(
    `SELECT m.id, m.bab_id, m.matn_order, m.title_id, m.title_ar, m.text_ar,
            m.translation_id, m.explanation_id, m.quran_refs_json, m.hadits_refs_json
     FROM pesantren_matn m JOIN pesantren_bab b ON b.id = m.bab_id
     WHERE b.kitab_slug = ? ORDER BY b.bab_order, m.matn_order`
  );
  const parse = (s: unknown) => {
    try {
      return s ? JSON.parse(String(s)) : [];
    } catch {
      return [];
    }
  };
  let matnCount = 0;
  for (const k of pKitab) {
    const byBab = new Map<number, unknown[]>();
    for (const m of matnRows.all(k.slug) as Record<string, unknown>[]) {
      const list = byBab.get(m.bab_id as number) ?? [];
      list.push({
        id: m.id,
        order: m.matn_order,
        title_id: m.title_id,
        title_ar: m.title_ar,
        text_ar: m.text_ar,
        translation_id: m.translation_id,
        explanation_id: m.explanation_id,
        quran_refs: parse(m.quran_refs_json),
        hadits_refs: parse(m.hadits_refs_json),
      });
      byBab.set(m.bab_id as number, list);
      matnCount++;
    }
    const chapters = (babRows.all(k.slug) as Record<string, unknown>[]).map((b) => ({
      id: b.id,
      order: b.bab_order,
      name_id: b.name_id,
      name_ar: b.name_ar,
      matn: byBab.get(b.id as number) ?? [],
    }));
    put(`pesantren/kitab/${k.slug}.json`, { kitab: kitabRow.get(k.slug), chapters });
  }

  console.log(
    `kitab-data: ${categories.length} categories, ${total} works; ` +
      `${pKitab.length} kitab pesantren, ${matnCount} matn (${cleaned} cleaned, ${dropped} empty dropped); ` +
      `${files} files, ${(bytes / 1e6).toFixed(1)} MB → ${out} in ${Date.now() - started} ms`
  );
}

if (process.argv[1]?.includes("build-kitab-static")) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
