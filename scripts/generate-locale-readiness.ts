/**
 * Generate packages/shared/src/locale-readiness.gen.ts — how finished each
 * language actually is, measured rather than assumed.
 *
 * Owner rule: a language must NOT be offered to visitors until it is 100%
 * clean ("kesian pengunjung kalau bahasanya berubah-ubah"). To enforce that we
 * first have to be able to MEASURE it, and the measurement has to be honest —
 * counting "Hadith" or "PayPal" as an untranslated string would keep every
 * language permanently below 100% for no reason.
 *
 * A dictionary leaf counts as MISSING for a language when all of these hold:
 *   1. it contains letters (so "114+", "6,236" and "20+" never count);
 *   2. that language's dictionary still holds the exact English string;
 *   3. the generated UI_I18N table has no translation to fill it at runtime;
 *   4. it is not language-neutral — a string that most other dictionaries also
 *      leave identical is a proper noun, a brand, or already-Arabic scripture,
 *      not an untranslated leftover.
 *
 * Re-run after changing dictionaries or UI strings:  pnpm gen:locale-readiness
 */
import { writeFileSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DICTS = resolve(__dirname, "../apps/web/src/dictionaries");
const UI_TABLE = resolve(__dirname, "../apps/web/src/lib/ui-i18n.gen.ts");
const CONTENT = resolve(__dirname, "locale-content.json");
const VERIFIED = resolve(__dirname, "locale-verified-identical.json");
const OUT = resolve(__dirname, "../packages/shared/src/locale-readiness.gen.ts");

/** Names that stay the same in every language. */
const BRAND = new Set(["ulyah.", "Ulyah", "ULYAH.COM", "ulyah.com", "PayPal", "NOWPayments"]);

/** A leaf is neutral when this many of the 27 dictionaries leave it unchanged. */
const NEUTRAL_AT = 18;

/**
 * Dictionaries written in a script that is not Latin. If one of THESE keeps an
 * English string letter-for-letter, the string is a proper noun, a brand or a
 * technical token — nobody writing Arabic or Thai leaves ordinary prose in Latin
 * script by accident. This is what stops "Hadith", "Surah", "Qur'an", "Email"
 * and "(QS. Al-Qamar: 17)" from being reported as untranslated forever, which
 * would keep every language permanently under 100% for no real reason.
 */
const NON_LATIN = ["ar", "zh", "ja", "ko", "th", "hi", "ta", "bn", "ur", "fa", "ps", "ru"];
const NON_LATIN_AT = 4;

type Dict = Record<string, unknown>;

function leaves(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const v of node) leaves(v, out);
    return out;
  }
  if (node && typeof node === "object") {
    for (const k of Object.keys(node as Dict)) leaves((node as Dict)[k], out);
    return out;
  }
  return out;
}

const hasLetters = (s: string) => /\p{L}/u.test(s);

async function main() {
  const { UI_I18N } = (await import(UI_TABLE)) as { UI_I18N: Record<string, Record<string, string>> };
  const load = async (f: string) => (await import(resolve(DICTS, f))).default as Dict;

  const en = leaves(await load("en.ts"));
  const codes = readdirSync(DICTS)
    .filter((f) => /^[a-z]{2}\.ts$/.test(f) && f !== "en.ts")
    .map((f) => f.slice(0, 2))
    .sort();

  const dicts = new Map<string, string[]>();
  for (const c of codes) dicts.set(c, leaves(await load(`${c}.ts`)));

  // Which leaves are language-neutral: most dictionaries leave them as-is.
  const neutral = new Set<number>();
  for (let i = 0; i < en.length; i++) {
    const s = en[i]!;
    if (!hasLetters(s)) {
      neutral.add(i); // "114+", "6,236", "20+"
      continue;
    }
    if (!/[A-Za-z]/.test(s)) {
      neutral.add(i); // already in another script — the Arabic du'a, for one
      continue;
    }
    if (BRAND.has(s.trim())) {
      neutral.add(i);
      continue;
    }
    if (/^\(QS\./.test(s.trim())) {
      neutral.add(i); // a Qur'an citation reads the same in every language
      continue;
    }
    let same = 0;
    for (const c of codes) if (dicts.get(c)![i] === s) same++;
    if (same >= NEUTRAL_AT) {
      neutral.add(i);
      continue;
    }
    let nonLatinSame = 0;
    for (const c of NON_LATIN) if (dicts.get(c)?.[i] === s) nonLatinSame++;
    if (nonLatinSame >= NON_LATIN_AT) neutral.add(i);
  }

  const scored = en.map((_, i) => i).filter((i) => !neutral.has(i));
  console.log(`${en.length} dictionary leaves, ${neutral.size} language-neutral, ${scored.length} scored.`);

  // Content coverage: what fraction of the site's own writing (tafsir, kisah,
  // kitab, hadits) has actually been translated into this language and cached in
  // D1. Measured, not assumed — see scripts/locale-content.json. A language can
  // have a perfect UI and still show Indonesian articles, which is exactly the
  // mixed experience this gate exists to prevent.
  const contentFile = JSON.parse(readFileSync(CONTENT, "utf8")) as {
    _sourceLanguages: string[];
    rows: Record<string, number>;
  };
  const best = Math.max(...Object.values(contentFile.rows));
  const contentPct = (code: string): number => {
    // Nothing is translated INTO a source language: Indonesian is what the site
    // is written in, Arabic is the Qur'an and hadith themselves.
    if (contentFile._sourceLanguages.includes(code)) return 100;
    const n = contentFile.rows[code];
    return n === undefined ? 0 : Math.round((n / best) * 1000) / 10;
  };

  // Words a human checked and confirmed are correct as-is in that language —
  // German really does write "Hadith", French really does write "Gratitude".
  // Without this, those languages could never reach 100% and the gate would
  // keep them locked forever over words that were never wrong.
  const verified = (
    JSON.parse(readFileSync(VERIFIED, "utf8")) as { verified: Record<string, string[]> }
  ).verified;

  const table: Record<string, { dict: number; content: number; overall: number; missing: string[] }> = {};
  // English and Indonesian are the two authoring languages: English is the
  // source every translation is made FROM, Indonesian is the site's own voice.
  table.en = { dict: 100, content: contentPct("en"), overall: contentPct("en"), missing: [] };

  for (const c of codes) {
    const dl = dicts.get(c)!;
    const tbl = UI_I18N[c] ?? {};
    const ok = new Set(verified[c] ?? []);
    const missing: string[] = [];
    for (const i of scored) {
      if (dl[i] !== en[i]) continue; // translated in the dictionary itself
      if (tbl[en[i]!.trim()]) continue; // filled at runtime by fillLabels()
      if (ok.has(en[i]!.trim())) continue; // checked by hand: correct as-is
      missing.push(en[i]!);
    }
    const pct = Math.round(((scored.length - missing.length) / scored.length) * 1000) / 10;
    const dict = c === "id" ? 100 : pct;
    const content = contentPct(c);
    // A language is only as finished as its weakest half — a perfect menu over
    // untranslated articles is still a mixed-language page to the reader.
    table[c] = { dict, content, overall: Math.min(dict, content), missing: c === "id" ? [] : missing.slice(0, 40) };
  }

  // Indonesian is authored, not translated: its "leftovers" are the English
  // words it deliberately keeps (Audiobook, Qur'an …), so it is 100% by
  // definition, exactly like English.
  const rows = Object.entries(table).sort((a, b) => a[1].overall - b[1].overall);
  for (const [c, v] of rows)
    console.log(`  ${c.padEnd(3)} overall ${String(v.overall).padStart(5)}%  (ui ${v.dict}%, content ${v.content}%)  missing=${v.missing.length}`);

  const banner =
    "// AUTO-GENERATED by scripts/generate-locale-readiness.ts — do not edit by hand.\n" +
    "// How complete each language's UI actually is, measured from the dictionaries\n" +
    "// and the generated UI_I18N table. A language is only offered to visitors once\n" +
    "// it reaches 100% (see isLocaleReady in i18n.ts) so nobody lands on a page that\n" +
    "// switches between two languages mid-scroll.\n" +
    "// Re-run after changing dictionaries or UI strings:  pnpm gen:locale-readiness\n\n" +
    "export interface LocaleReadiness {\n" +
    "  /** Percent of scored UI strings that are genuinely in this language. */\n" +
    "  dict: number;\n" +
    "  /** Percent of the site's own writing translated and cached for this language. */\n" +
    "  content: number;\n" +
    "  /** The lower of the two — a language is only as finished as its weakest half. */\n" +
    "  overall: number;\n" +
    "  /** Up to 40 English strings still showing through, for the admin portal. */\n" +
    "  missing: string[];\n" +
    "}\n\n";
  const body = `export const LOCALE_READINESS: Record<string, LocaleReadiness> = ${JSON.stringify(table, null, 0)};\n`;
  writeFileSync(OUT, banner + body);
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
