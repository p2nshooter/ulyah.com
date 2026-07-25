import type { Dictionary } from "./types";
import id from "./id";
import en from "./en";
import ru from "./ru";
import de from "./de";
import fr from "./fr";
import es from "./es";
import ar from "./ar";
import zh from "./zh";
import ja from "./ja";
import ur from "./ur";
import hi from "./hi";
import bn from "./bn";
import tr from "./tr";
import fa from "./fa";
import ms from "./ms";
import sw from "./sw";
import pt from "./pt";
import nl from "./nl";
import it from "./it";
import ta from "./ta";
import ha from "./ha";
import ps from "./ps";
import th from "./th";
import ko from "./ko";
import vi from "./vi";
import uz from "./uz";
import so from "./so";
import pl from "./pl";
import { TENANT } from "@/lib/tenant";
import { fillLabels } from "@/lib/fill-labels";

export type { Dictionary };

const dictionaries: Record<string, Dictionary> = {
  id, en, ru, de, fr, es, ar, zh, ja,
  ur, hi, bn, tr, fa, ms, sw, pt, nl, it, ta, ha, ps, th, ko, vi, uz, so, pl,
};

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

/**
 * Every dictionary has every KEY (the `Dictionary` interface has no optional
 * fields, so TypeScript enforces that at build time) — but a key being present
 * never proved its VALUE had actually been translated. Nineteen of the 28 still
 * carried English prose in places, which is what produced a Thai homepage with
 * an English hero paragraph.
 *
 * So the dictionary now goes through the same `fillLabels()` path as the rest
 * of the UI chrome: any string that is still the English original is swapped
 * for its entry in the generated UI_I18N table, while strings that were really
 * translated aren't in that table at all and pass through untouched. Brand
 * tokens are excluded at generation time, so `brandize()` still finds them.
 */
export function getDictionary(locale: string): Dictionary {
  const base = dictionaries[locale] ?? dictionaries.en!;
  return brandize(locale === "en" ? base : fillLabels(locale, base), locale);
}
