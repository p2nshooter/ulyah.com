/**
 * Ecosystem language-consistency auditor — the "penjelajah" that walks every
 * UI string source and flags anything that would render in the WRONG language
 * on one of the sibling sites (ulyah.com id · xad.es en · 1fr.fr fr ·
 * tilawa.de de · dawa.es es). It is the deterministic half of the owner's
 * "worker AI" idea: it finds the inconsistencies; the translate-content
 * pipeline + cover-art generator (already automatic) fix incoming content.
 *
 * What it checks (all high-signal, low-false-positive):
 *   1. Inline per-locale copy maps (`{ id: {...}, en: {...}, … }`) in pages &
 *      components must cover every sibling-served locale, or a sibling falls
 *      back to another language. This is exactly the gap that left dawa.es
 *      showing English on /haji-umroh, /live, /tanya, etc.
 *   2. UI dictionaries (src/dictionaries/*.ts) must be at full key parity —
 *      a missing key means that locale silently borrows another's string.
 *   3. Kisah content files must have matching id/en block counts, so xad.es
 *      (English) never renders an untranslated story.
 *
 * Usage:
 *   npx tsx scripts/audit-i18n-consistency.ts            # report, exit 1 on findings
 *   npx tsx scripts/audit-i18n-consistency.ts --json     # machine-readable
 *
 * Exit code is non-zero when anything is inconsistent, so CI (and the
 * scheduled workflow) can gate on it. When it is clean the ecosystem is in the
 * "standby" state the owner described — nothing to fix until new content lands.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const WEB = join(ROOT, "apps", "web", "src");

// Every sibling site serves exactly one of these natively, so any inline
// locale map MUST cover all five or that site falls back to another language.
const CORE_LOCALES = ["id", "en", "fr", "de", "es"] as const;
const ALL_LOCALES = ["id", "en", "fr", "de", "es", "ru", "ar", "zh", "ja"] as const;

interface Finding {
  kind: string;
  file: string;
  detail: string;
}
const findings: Finding[] = [];
const add = (kind: string, file: string, detail: string) =>
  findings.push({ kind, file: relative(ROOT, file), detail });

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(p, out);
    } else if (/\.(tsx?|ts)$/.test(name)) out.push(p);
  }
  return out;
}

// ── Check 1: inline per-locale maps cover every sibling locale ──────────────
// A file "declares" a locale map when it has 2+ sibling-locale object keys at
// the same indentation (e.g. `  id: {` and `  en: {`). We collect which of the
// nine locales appear as map keys and require the five core ones. `en:` may be
// a reference (`en: EN_LABELS`) rather than an inline object, so we accept both.
function auditInlineMaps() {
  for (const file of walk(WEB)) {
    // Admin is owner-only Indonesian by design; acquisition is per-tenant sale
    // copy that 404s on ulyah.com — neither is a public multi-locale surface.
    if (file.includes(join("src", "components", "admin"))) continue;
    if (file.includes(join("acquisition"))) continue;
    const src = readFileSync(file, "utf8");
    // A locale-map "opener": a locale code as an object/reference key.
    const opener = /^[ \t]+(id|en|fr|de|es|ru|ar|zh|ja):\s*(\{|[A-Z_][A-Za-z0-9_]*\b)/gm;
    const present = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = opener.exec(src))) present.add(m[1]!);
    // Only treat it as a locale map when at least id+en (or 3+ locales) appear,
    // to avoid matching unrelated objects that happen to have an `en` field.
    const localeCount = ALL_LOCALES.filter((l) => present.has(l)).length;
    if (localeCount < 3) continue;
    const missing = CORE_LOCALES.filter((l) => !present.has(l));
    if (missing.length) {
      add(
        "inline-map-missing-locale",
        file,
        `locale map is missing sibling locale(s): ${missing.join(", ")} (has: ${[...present].sort().join(", ")})`
      );
    }
  }
}

// ── Check 2: dictionary key parity ──────────────────────────────────────────
function dictKeys(file: string): Set<string> {
  const src = readFileSync(file, "utf8");
  const keys = new Set<string>();
  for (const m of src.matchAll(/^[ \t]{2,}([a-zA-Z0-9_]+):/gm)) keys.add(m[1]!);
  return keys;
}
function auditDictionaries() {
  const dir = join(WEB, "dictionaries");
  const base = dictKeys(join(dir, "id.ts"));
  for (const loc of ALL_LOCALES) {
    const f = join(dir, `${loc}.ts`);
    const k = dictKeys(f);
    const missing = [...base].filter((x) => !k.has(x));
    const extra = [...k].filter((x) => !base.has(x));
    if (missing.length) add("dictionary-missing-keys", f, `${missing.length} key(s) missing vs id: ${missing.slice(0, 12).join(", ")}`);
    if (extra.length) add("dictionary-extra-keys", f, `${extra.length} key(s) not in id: ${extra.slice(0, 12).join(", ")}`);
  }
}

// ── Check 3: kisah content id/en balance ────────────────────────────────────
function auditContentBalance() {
  const dir = join(ROOT, "scripts", "content");
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".ts")) continue;
    const src = readFileSync(join(dir, name), "utf8");
    const id = (src.match(/^[ \t]+id:\s*\{/gm) ?? []).length;
    const en = (src.match(/^[ \t]+en:\s*\{/gm) ?? []).length;
    if (id !== en) add("content-id-en-imbalance", join(dir, name), `id blocks=${id} but en blocks=${en} — English site would show gaps`);
  }
}

auditInlineMaps();
auditDictionaries();
auditContentBalance();

const asJson = process.argv.includes("--json");
if (asJson) {
  console.log(JSON.stringify({ ok: findings.length === 0, findings }, null, 2));
} else if (findings.length === 0) {
  console.log("✅ i18n consistency: clean — every sibling locale covered, dictionaries at parity, content balanced. (standby)");
} else {
  console.log(`❌ i18n consistency: ${findings.length} finding(s)\n`);
  for (const f of findings) console.log(`  [${f.kind}] ${f.file}\n     ${f.detail}`);
}
process.exit(findings.length === 0 ? 0 : 1);
