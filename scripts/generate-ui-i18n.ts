/**
 * Generate apps/web/src/lib/ui-i18n.gen.ts — the machine-translated table the
 * runtime `fillLabels()` helper consults so every one of the ~22 hand-authored
 * `*-labels.ts` UI-chrome helpers covers ALL ecosystem languages instead of
 * falling back to English for the ones without a hand-written map (ru, zh, ja,
 * ar on several, and the whole India/Turkey/Persia/… set added later).
 *
 * How it works: import each label getter, call it with "en" to obtain the
 * English chrome object, deep-collect every human-facing string leaf (skipping
 * paths / icons / emoji-only tokens), then translate that unique set into every
 * target language with Google Translate (the same engine used to warm the D1
 * content cache — high, human-like quality). The result is written as a static
 * TS module so the site build and runtime do ZERO translation work.
 *
 * Re-run whenever UI strings change:  pnpm gen:ui-i18n
 * (idempotent — translations are cached in scripts/.ui-i18n-cache.json).
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(__dirname, "../apps/web/src/lib");
const WEB = resolve(__dirname, "../apps/web/src");
const OUT = resolve(LIB, "ui-i18n.gen.ts");
const CACHE = resolve(__dirname, ".ui-i18n-cache.json");

// Every language that is NOT the English source and NOT our Indonesian authoring
// base gets a generated table. Locales hand-authored inside a given label file
// still win (fillLabels only runs on the `?? EN` fallback), so generating a few
// unused entries (de/fr/es where already authored) is harmless and future-proofs
// any new label file that forgets one of them.
const TARGET_LOCALES = [
  "ru", "de", "fr", "es", "ar", "zh", "ja",
  "ur", "hi", "bn", "tr", "fa", "ms", "sw", "pt", "nl", "it", "ta", "ha", "ps", "th", "ko", "vi", "uz", "so", "pl",
];

// [module file, exported getter]. Getters are called with ("en") — the ones that
// take an extra site argument (liveLabels) get a placeholder brand.
const GETTERS: Array<{ file: string; fn: string; args?: unknown[] }> = [
  { file: "nav-labels", fn: "navLabels" },
  { file: "hadits-labels", fn: "haditsLabels" },
  { file: "kitab-labels", fn: "kitabLabels" },
  { file: "mushaf-labels", fn: "mushafLabels" },
  { file: "prayer-labels", fn: "prayerLabels" },
  { file: "radio-labels", fn: "radioLabels" },
  { file: "sanad-labels", fn: "sanadLabels" },
  { file: "contact-labels", fn: "contactLabels" },
  { file: "imsakiyah-labels", fn: "imsakiyahLabels" },
  { file: "portal-labels", fn: "portalLabels" },
  { file: "zakat-labels", fn: "zakatLabels" },
  { file: "flipbook-labels", fn: "flipbookLabels" },
  { file: "qibla-labels", fn: "qiblaLabels" },
  { file: "waris-labels", fn: "warisLabels" },
  { file: "pwa-labels", fn: "pwaLabels" },
  { file: "hijri-calendar-labels", fn: "hijriCalendarLabels" },
  { file: "amalan-labels", fn: "amalanLabels" },
  { file: "thanks-labels", fn: "thanksLabels" },
  { file: "privacy-labels", fn: "privacyLabels" },
  { file: "narrate-labels", fn: "narrateLabels" },
  { file: "ai-chat-labels", fn: "aiChatLabels" },
  { file: "kids-labels", fn: "kidsLabels" },
  { file: "live-labels", fn: "liveLabels", args: ["en", "ULYAH.COM"] },
  { file: "nasehat", fn: "nasehatList" },
  { file: "home-labels", fn: "homeLabels" },
  { file: "tajwid-labels", fn: "tajwidUiLabels" },
  { file: "tajwid-labels", fn: "tajwidRuleTexts" },
  { file: "tajwid-labels", fn: "tajwidPageLabels" },
  { file: "nahwu-labels", fn: "nahwuLabels" },
  { file: "kids-games-labels", fn: "kidsGamesLabels" },
  { file: "iqro-labels", fn: "iqroFocusLabels" },
];

// The page dictionaries (apps/web/src/dictionaries) are the site's MAIN copy —
// hero, nav, footer, section headings, every page's prose. 19 of the 28 were
// still carrying untranslated English in places (owner screenshot: a Thai
// homepage with an English hero paragraph). They are plain data modules with a
// single type-only import, so harvesting the English one here — and filling the
// gaps through the same fillLabels() path at runtime — closes the largest
// remaining source of mixed-language pages in one move.
const DICTIONARY_EN = resolve(WEB, "dictionaries/en.ts");

// Label maps written INLINE inside components (rather than in a *-labels.ts
// getter) can't be imported here — they live in "use client" modules that pull
// in React. Their English block is harvested from source instead: find the
// English object literal, brace-match it, and take the string literals inside.
const INLINE_SOURCES: string[] = [
  "components/GlobalReadAll.tsx",
  "components/AdhanReminder.tsx",
  "components/ContinuousStoryReader.tsx",
  "components/KisahAnakList.tsx",
  "components/QuranReaderWidget.tsx",
  "components/HajjUmrahHub.tsx",
  "components/CryptoDonationSection.tsx",
  "components/PesantrenKitabReader.tsx",
  "components/kids/VideoAnakGrid.tsx",
  "app/[locale]/anak/page.tsx",
  "app/[locale]/audiobook/page.tsx",
  "app/[locale]/haji-umroh/page.tsx",
  "app/[locale]/kisah/page.tsx",
  "app/[locale]/kitab-pesantren/page.tsx",
  "app/[locale]/live/page.tsx",
  "app/[locale]/tanya/page.tsx",
  "app/[locale]/widget/page.tsx",
  "lib/ui-strings.ts",
];

// Brand tokens must never be machine-translated — a transliterated "Ulyah" in
// Thai script would be a different name, and brandize() rewrites these per
// tenant afterwards anyway.
const BRAND_TOKENS = new Set(["Ulyah", "ULYAH", "ULYAH.COM", "ulyah", "ulyah.com", "ulyah."]);

/** Harvest the string literals inside a file's English label block(s). */
function collectInline(src: string, into: Set<string>): void {
  const starts = [...src.matchAll(/(?:^|[\s,{])(?:const\s+EN\w*\s*(?::[^=]*)?=|en\s*:)\s*\{/gm)];
  for (const m of starts) {
    let i = src.indexOf("{", m.index! + m[0].length - 1);
    let depth = 0;
    let end = i;
    for (; end < src.length; end++) {
      if (src[end] === "{") depth++;
      else if (src[end] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const block = src.slice(i, end + 1);
    for (const s of block.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
      const v = s[1]!.replace(/\\"/g, '"').replace(/\\n/g, "\n").trim();
      if (isTranslatable("", v)) into.add(v);
    }
  }
}

// Keys whose string value is never human prose (routing / iconography).
const DENY_KEYS = new Set(["path", "icon", "key", "code", "href", "src", "url", "dir", "slug"]);

function isTranslatable(key: string, val: unknown): val is string {
  if (typeof val !== "string") return false;
  const s = val.trim();
  if (!s) return false;
  if (DENY_KEYS.has(key)) return false;
  if (/^https?:\/\//.test(s)) return false;
  if (s.startsWith("/")) return false; // path
  if (!/\p{L}/u.test(s)) return false; // pure emoji / punctuation / digits
  if (BRAND_TOKENS.has(s)) return false; // the brand keeps its name in every language
  // Tailwind class lists and other machine tokens sneak in when harvesting from
  // component source; they are never shown to a reader.
  if (/(?:^|\s)(?:dark:|hover:|sm:|md:|lg:)?(?:bg|text|rounded|border|px|py|pt|pb|mt|mb|ml|mr|flex|grid|gap|shadow|font|leading|w|h|min|max|opacity|z|inset|absolute|relative)-/.test(s)) return false;
  return true;
}

function collect(node: unknown, key: string, into: Set<string>): void {
  if (isTranslatable(key, node)) {
    into.add((node as string).trim());
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) collect(item, key, into);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) collect(v, k, into);
  }
}

// ---- Google Translate (gtx) ---------------------------------------------
async function gtxOne(text: string, tl: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`gtx ${r.status}`);
  const j = (await r.json()) as [Array<[string]>];
  return j[0].map((seg) => seg[0]).join("");
}

/**
 * Returns one entry per input: the translation, or null when the request
 * genuinely failed. Null matters — a failure must NOT be written to the cache.
 * The previous version pushed the English text on failure, the caller cached
 * it, and from then on that string was permanently "translated" to itself:
 * a handful of Thai strings were stuck in English for exactly this reason.
 * Leaving it uncached means the next run simply retries it.
 */
async function gtxBatch(texts: string[], tl: string): Promise<(string | null)[]> {
  // Newline-batch for throughput; if Google's segment count doesn't line up
  // (rare), fall back to translating each string on its own.
  const joined = texts.join("\n");
  try {
    const out = await gtxOne(joined, tl);
    const parts = out.split("\n");
    if (parts.length === texts.length) return parts.map((p) => p.trim());
  } catch {
    /* fall through to per-item */
  }
  const solo: (string | null)[] = [];
  for (const t of texts) {
    try {
      solo.push((await gtxOne(t, tl)).trim());
    } catch {
      solo.push(null); // retried on the next run instead of poisoning the cache
    }
    await new Promise((r) => setTimeout(r, 40));
  }
  return solo;
}

async function main() {
  // 1) Harvest the English chrome strings from every label getter.
  const strings = new Set<string>();
  for (const g of GETTERS) {
    try {
      const mod = await import(resolve(LIB, `${g.file}.ts`));
      const getter = mod[g.fn];
      if (typeof getter !== "function") {
        console.warn(`  skip ${g.file}: no export ${g.fn}`);
        continue;
      }
      const en = getter(...(g.args ?? ["en"]));
      collect(en, "", strings);
    } catch (e) {
      console.warn(`  skip ${g.file}: ${(e as Error).message}`);
    }
  }
  // 1b) The page dictionaries — the site's main copy.
  try {
    const dict = (await import(DICTIONARY_EN)).default;
    collect(dict, "", strings);
  } catch (e) {
    console.warn(`  skip dictionaries/en: ${(e as Error).message}`);
  }

  // 1c) English label blocks written inline inside components.
  for (const rel of INLINE_SOURCES) {
    try {
      collectInline(readFileSync(resolve(WEB, rel), "utf8"), strings);
    } catch (e) {
      console.warn(`  skip ${rel}: ${(e as Error).message}`);
    }
  }

  const unique = [...strings].sort();
  console.log(`Harvested ${unique.length} unique English UI strings.`);

  // 2) Cache of already-translated pairs: { "<tl> <en>": "<translated>" }.
  const cache: Record<string, string> = existsSync(CACHE)
    ? JSON.parse(readFileSync(CACHE, "utf8"))
    : {};

  const table: Record<string, Record<string, string>> = {};
  for (const tl of TARGET_LOCALES) {
    const need = unique.filter((s) => cache[`${tl} ${s}`] === undefined);
    if (need.length) {
      console.log(`  ${tl}: translating ${need.length} new strings…`);
      for (let i = 0; i < need.length; i += 30) {
        const chunk = need.slice(i, i + 30);
        const solo = chunk.filter((s) => s.includes("\n"));
        const batchable = chunk.filter((s) => !s.includes("\n"));
        const translated = batchable.length ? await gtxBatch(batchable, tl) : [];
        batchable.forEach((s, idx) => {
          const t = translated[idx];
          if (t) cache[`${tl} ${s}`] = t; // a failure stays uncached and is retried
        });
        for (const s of solo) {
          const t = await gtxOne(s, tl).catch(() => null);
          if (t) cache[`${tl} ${s}`] = t;
        }
        writeFileSync(CACHE, JSON.stringify(cache));
      }
    }
    // Only keep entries that actually differ from English (a translation that
    // came back identical adds no value and just bloats the file).
    const map: Record<string, string> = {};
    for (const s of unique) {
      const t = cache[`${tl} ${s}`];
      if (t && t !== s) map[s] = t;
    }
    table[tl] = map;
  }

  // 3) Emit the generated module.
  const banner =
    "// AUTO-GENERATED by scripts/generate-ui-i18n.ts — do not edit by hand.\n" +
    "// English UI-chrome strings machine-translated into every ecosystem language\n" +
    "// that isn't hand-authored in the *-labels.ts helpers, so switching to any of\n" +
    "// the 28 languages localizes 100% of the menus/buttons, never an English mix.\n" +
    "// Re-run after changing UI strings:  pnpm gen:ui-i18n\n\n";
  const body = `export const UI_I18N: Record<string, Record<string, string>> = ${JSON.stringify(table, null, 0)};\n`;
  writeFileSync(OUT, banner + body);
  const total = Object.values(table).reduce((n, m) => n + Object.keys(m).length, 0);
  console.log(`Wrote ${OUT} — ${TARGET_LOCALES.length} locales, ${total} translated entries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
