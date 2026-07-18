import { TENANT } from "./tenant";

/**
 * Brand-token rewriting for the self-contained label modules (thanks,
 * privacy, radio, mushaf, …) — the same rule the dictionaries apply in
 * dictionaries/index.ts. The labels are authored once with the ULYAH brand
 * baked into their prose; on a sibling site (1fr.fr / tilawa.de / dawa.es)
 * every brand token must read as THAT site's brand instead (owner: "pastikan
 * tidak ada lagi tulisan Ulyah pada 1fr.fr / tilawa.de / dawa.es").
 * TENANT is a build-time constant, so this is free on ulyah itself.
 */
export function rebrand(s: string): string {
  if (TENANT.id === "ulyah") return s;
  const brand = TENANT.siteName;
  const domain = TENANT.siteUrl.replace(/^https?:\/\//, "");
  return s
    .replace(/salam@ulyah\.com/g, TENANT.acquisitionEmail ?? `salam@${domain}`)
    .replace(/ULYAH\.COM/g, brand.toUpperCase())
    .replace(/ulyah\.com/g, domain)
    .replace(/Ulyah/g, brand)
    .replace(/ulyah/g, brand);
}

/** Deep variant for whole label objects (strings, arrays, nested records). */
export function rebrandDeep<T>(value: T): T {
  if (TENANT.id === "ulyah") return value;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return rebrand(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(v as Record<string, unknown>)) {
        out[k] = walk((v as Record<string, unknown>)[k]);
      }
      return out;
    }
    return v;
  };
  return walk(value) as T;
}
