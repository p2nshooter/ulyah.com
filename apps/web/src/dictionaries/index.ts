import type { Dictionary } from "./types";
import id from "./id";
import en from "./en";
import ru from "./ru";
import de from "./de";
import fr from "./fr";
import ar from "./ar";
import zh from "./zh";
import ja from "./ja";
import { TENANT } from "@/lib/tenant";

export type { Dictionary };

const dictionaries: Record<string, Dictionary> = { id, en, ru, de, fr, ar, zh, ja };

// The dictionaries are authored with the ULYAH brand baked into their prose
// (hero copy, footer, donation/certificate text, "the family behind Ulyah", …).
// On a sibling site that leaked a stray "Ulyah" everywhere (owner: "masih ada
// kata ulyah"). Rather than fork every dictionary per tenant, rewrite the brand
// tokens once, at the single point every page reads a dictionary from. TENANT is
// a build-time constant, so the result is memoised per locale.
const brandCache = new Map<string, Dictionary>();

function brandize(dict: Dictionary, locale: string): Dictionary {
  if (TENANT.id === "ulyah") return dict;
  const cached = brandCache.get(locale);
  if (cached) return cached;

  const brand = TENANT.siteName; // e.g. "Tilawa", "One Faith France"
  const domain = TENANT.siteUrl.replace(/^https?:\/\//, ""); // e.g. "tilawa.de"
  const rewrite = (s: string): string =>
    s
      .replace(/ULYAH\.COM/g, brand.toUpperCase())
      .replace(/ulyah\.com/g, domain)
      .replace(/Ulyah/g, brand)
      .replace(/ulyah/g, brand);

  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return rewrite(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(v as Record<string, unknown>)) out[k] = walk((v as Record<string, unknown>)[k]);
      return out;
    }
    return v;
  };

  const out = walk(dict) as Dictionary;
  brandCache.set(locale, out);
  return out;
}

/** Every dictionary is fully translated (checked at build time by TS — the
 * `Dictionary` interface has no optional fields), so switching languages
 * always swaps 100% of the UI chrome consistently, never a partial mix. On a
 * sibling tenant the ULYAH brand tokens are rewritten to that site's brand. */
export function getDictionary(locale: string): Dictionary {
  return brandize(dictionaries[locale] ?? dictionaries.en!, locale);
}
