/** Writes apps/web/src/lib/surah-names.ts from the Qur'an seed. Usage: node scripts/generate-surah-names.mjs */
import { DatabaseSync } from "node:sqlite";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root = join(import.meta.dirname, "..");
const db = new DatabaseSync(":memory:");
db.exec(readFileSync(root + "/packages/db-schema/migrations/0001_init.sql", "utf8"));
const sql = readFileSync(root + "/packages/db-schema/seed/quran_seed.sql", "utf8");
const start = sql.indexOf("INSERT INTO surah");
const end = sql.indexOf(";\n", start);
db.exec(sql.slice(start, end + 1));
const rows = db.prepare("SELECT id, name_ar, name_transliteration FROM surah ORDER BY id").all();
if (rows.length !== 114) throw new Error("expected 114 surah, got " + rows.length);
const body = `/**
 * The 114 surah names (Arabic + transliteration), bundled, for places that must
 * never wait on the API — the header's turning book above all. When the API
 * had a bad day the book read "1. Surah 1" on every page.
 *
 * Generated from packages/db-schema/seed/quran_seed.sql (the same rows D1
 * holds); regenerate with: node scripts/generate-surah-names.mjs
 */
export const SURAH_NAMES: readonly { id: number; ar: string; latin: string }[] = [
${rows.map((r) => `  { id: ${r.id}, ar: ${JSON.stringify(r.name_ar)}, latin: ${JSON.stringify(r.name_transliteration)} },`).join("\n")}
];
`;
writeFileSync(root + "/apps/web/src/lib/surah-names.ts", body);
console.log("ok", rows.length, rows[0], rows[113]);
