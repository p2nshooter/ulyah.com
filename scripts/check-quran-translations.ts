/**
 * The Qur'an is never machine-translated, and a trusted translation is taken only whole and exactly as published
 * (owner, 22 Nov 2026: "Klo Al-quran mah jgn di terjemah sembarangan … yg tafsirnya sholeh"). Checked without
 * network: the choice per language, the completeness check, and that no Qur'an path reaches a machine translator.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AYAH_COUNTS, pickTranslation, pickMukhtasar, checkSurah, type Entry } from "./import-quran-translations";

const ROOT = join(import.meta.dirname, "..");
let n = 0;
const ok = (s: string) => console.log(`  ok  ${s} (${++n})`);

assert.equal(AYAH_COUNTS.length, 114);
assert.equal(AYAH_COUNTS.reduce((a, b) => a + b, 0), 6236);
ok("114 surahs, 6,236 ayat");

const E: Entry[] = [
  { key: "indonesian_complex", language_iso_code: "id", version: "1.0", last_update: 9, title: "Indonesian Translation - The Complex" },
  { key: "indonesian_affairs", language_iso_code: "id", version: "1.2", last_update: 1, title: "Indonesian Translation - Ministry of Religious Affairs" },
  { key: "indonesian_mokhtasar", language_iso_code: "id", version: "1.0", last_update: 5, title: "Indonesian translation of Al-Mukhtasar" },
  { key: "russian_abuadel", language_iso_code: "ru", version: "1", last_update: 9, title: "Russian - Abu Adel" },
  { key: "russian_rwwad", language_iso_code: "ru", version: "1", last_update: 5, title: "Russian Translation - Rowwad Translation Center" },
];
assert.equal(pickTranslation("id", E)?.key, "indonesian_affairs", "Indonesia: the Ministry of Religious Affairs");
assert.equal(pickTranslation("ru", E)?.key, "russian_rwwad", "a reviewed (Rowwad) edition before a more recent unreviewed one");
assert.equal(pickTranslation("id", E, "indonesian_complex")?.key, "indonesian_complex", "an explicit choice wins");
assert.equal(pickTranslation("fr", E), null, "no translation listed: none (never a machine one)");
assert.equal(pickMukhtasar("id", E)?.key, "indonesian_mokhtasar");
assert.ok(!E.filter((e) => /mokhtasar/.test(e.key)).some((e) => pickTranslation(e.language_iso_code, E)?.key === e.key), "a tafsir is never taken as the translation");
ok("one trusted translation per language; the tafsir is kept apart");

assert.throws(() => checkSurah(1, { result: [{ sura: 1, aya: 1, translation: "x" }] }), /expected 7/);
assert.throws(() => checkSurah(108, { result: [1, 3, 2].map((a) => ({ sura: 108, aya: a, translation: "t" })) }), /numbered/);
assert.throws(() => checkSurah(108, { result: [1, 2, 3].map((a) => ({ sura: 108, aya: a, translation: a === 2 ? " " : "t" })) }), /no text/);
const good = checkSurah(108, [1, 2, 3].map((a) => ({ sura: 108, aya: a, translation: `t${a}`, footnotes: a === 2 ? "fn" : "" })));
assert.deepEqual(good, [{ a: 1, t: "t1" }, { a: 2, t: "t2", f: "fn" }, { a: 3, t: "t3" }], "text and footnotes kept exactly");
ok("a surah is taken whole, numbered, non-empty — or refused");

const quran = readFileSync(join(ROOT, "apps/worker-api/src/routes/quran.ts"), "utf8");
const r2 = readFileSync(join(ROOT, "apps/worker-api/src/lib/quran-r2.ts"), "utf8");
assert.ok(!/translateText\([^)]*text_ar/.test(quran), "the Arabic of an ayah never reaches a translator");
assert.ok(!/translateText|localizeBatch|env\.AI/.test(r2), "trusted translations are read, never generated");
assert.ok(/creditLine/.test(quran), "the credit travels with the trusted text");
ok("no Qur'an path machine-translates; the credit is always attached");

console.log(`\ncheck-quran-translations: ALL OK (${n})`);
