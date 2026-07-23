import { UI_I18N } from "./ui-i18n.gen";

// Runtime companion to scripts/generate-ui-i18n.ts. The hand-authored
// `*-labels.ts` helpers cover a handful of languages (en/id + the four sibling
// domains, sometimes ar) and fall back to English for everything else. That
// English fallback is what left ru/zh/ja and the whole later India/Turkey/
// Persia/… set showing English menus and buttons. `fillLabels` closes the gap:
// given the English label object and a target locale, it deep-copies the object
// with every human-facing string swapped for its machine translation from the
// generated UI_I18N table. Strings with no translation (or the locale itself)
// pass through unchanged, and non-strings (numbers, functions used for
// interpolation, null) are preserved as-is.
//
// It only ever runs on the `?? EN` fallback path, so a locale that IS
// hand-authored in a given helper always keeps its human wording — this never
// overrides curated translations, it only fills the holes.

const cache = new WeakMap<object, Map<string, unknown>>();

function walk(node: unknown, table: Record<string, string>): unknown {
  if (typeof node === "string") {
    return table[node.trim()] ?? node;
  }
  if (Array.isArray(node)) return node.map((v) => walk(v, table));
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(node as Record<string, unknown>)) {
      out[k] = walk((node as Record<string, unknown>)[k], table);
    }
    return out;
  }
  return node; // numbers, booleans, functions, null, undefined
}

export function fillLabels<T>(locale: string, en: T): T {
  const table = UI_I18N[locale];
  if (!table) return en; // hand-authored locale, or nothing generated → English

  if (en && typeof en === "object") {
    let perObj = cache.get(en as object);
    if (!perObj) {
      perObj = new Map();
      cache.set(en as object, perObj);
    }
    const hit = perObj.get(locale);
    if (hit !== undefined) return hit as T;
    const out = walk(en, table) as T;
    perObj.set(locale, out);
    return out;
  }
  return walk(en, table) as T;
}
