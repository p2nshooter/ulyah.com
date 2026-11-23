/**
 * The English edition of every German and Spanish article site in sites/ — written by the translation engine.
 *
 * Owner, 22 Nov 2026: "Bikinin jg engine penerjemah seluruh website artikel yg berbahasa Spanyol dan Jerman, agar di
 * tambahkan translate bahasa inggris nya, dawa.im tidak termasuk ya karena bukan web artikel". The English edition
 * already has its place in the engine (docs/ADSENSE-BLUEPRINT.md §29: content/en/, /en/ pages, hreflang both ways,
 * theme/en.json, the gates in sites/_engine/check.mjs); this fills it, site by site.
 *
 * What it does, per site:
 *   1. every article and page without an English version is translated — Markdown-aware: headings, lists, tables,
 *      quotes and paragraphs are translated line by line; link targets, inline code, HTML and URLs never leave this
 *      process (masked as @@n@@ and put back); the frontmatter gets an English slug, title and description;
 *   2. a document is written only when it passes the same gates check.mjs holds: ≥ 90 % (German) / 78 % (Spanish) of
 *      the original's words, no placeholder lost, almost no words of the original language left — a document that
 *      fails waits for the next pass rather than going live half-translated;
 *   3. once every article and page exists, the site.json "en" block (tagline, categories, menus, paths) and
 *      theme/en.json (the theme's own words) are written, check.mjs runs, and the English edition is switched on only
 *      when it passes. Otherwise the block is parked in content/en/site-en.json for the next pass.
 *
 * Translators: the donated AI key pool (read from R2, never D1 — scripts/mesin-terjemah.ts loadKeyPool) with the
 * Islamic-library prompt's general rules, gtx as the fallback. Runs on GitHub Actions (workflow
 * translate-sites-en.yml); the sites are static, so their content lives in the repository like the originals.
 *
 *   npx tsx scripts/translate-sites-en.ts --site=nexvilo.de [--minutes=200] [--dry]
 *   npx tsx scripts/translate-sites-en.ts --all [--minutes=330]
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { countWords, parseFrontmatter, slugify } from "../sites/_engine/lib/markdown.mjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { FOREIGN, themeText } from "../sites/_engine/lib/i18n.mjs";
import { translateBatchesParallel, type PoolKey } from "./ai-translate";
import { loadKeyPool, translateBatch } from "./mesin-terjemah";
import { R2S3 } from "./lib/r2-s3";

const ROOT = join(import.meta.dirname, "..");
const SITES = join(ROOT, "sites");
/** Not article sites (owner: "dawa.im tidak termasuk ya karena bukan web artikel"). */
const EXCLUDED = new Set(["dawa.im", "_engine"]);

/** Required pages get the English slugs check.mjs looks for. */
const PAGE_SLUGS: Record<string, string> = {
  "sobre-nosotros": "about", contacto: "contact", "politica-de-privacidad": "privacy-policy", "politica-de-cookies": "cookie-policy",
  "aviso-legal": "legal-notice", "terminos-y-condiciones": "terms", "descargo-de-responsabilidad": "disclaimer",
  "ueber-uns": "about", kontakt: "contact", impressum: "imprint", datenschutz: "privacy-policy", "cookie-richtlinie": "cookie-policy",
  nutzungsbedingungen: "terms", haftungsausschluss: "disclaimer",
};

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Markdown, line by line
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

export interface Masked {
  text: string;
  map: string[];
}

/** Hide what must come back byte for byte: inline code, link/image targets, HTML tags, bare URLs. */
export function maskMd(s: string): Masked {
  const map: string[] = [];
  const keep = (m: string) => {
    map.push(m);
    return `@@${map.length - 1}@@`;
  };
  let t = s.replace(/`[^`]+`/g, keep);
  t = t.replace(/\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (m) => `](${keep(m.slice(2, -1))})`);
  t = t.replace(/<[^>]+>/g, keep);
  t = t.replace(/https?:\/\/[^\s)]+/g, keep);
  return { text: t, map };
}

export function unmaskMd(s: string, map: string[]): string {
  return s.replace(/@@\s*(\d+)\s*@@/g, (_, d) => map[Number(d)] ?? "");
}

const placeholders = (s: string) => (s.match(/@@\s*\d+\s*@@/g) ?? []).map((p) => p.replace(/\s+/g, "")).sort().join(",");

export interface Piece {
  /** Line index in the body. */
  line: number;
  /** Text before the translatable part ("## ", "- ", "> "), kept as is. */
  prefix: string;
  /** For a table row: which cell. */
  cell?: number;
  masked: Masked;
}

/** Split a Markdown body into the pieces a translator receives; everything else stays as it is. */
export function piecesOf(body: string): { lines: string[]; pieces: Piece[]; cells: Map<number, string[]> } {
  const lines = body.split("\n");
  const pieces: Piece[] = [];
  const cells = new Map<number, string[]>();
  let fence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      fence = !fence;
      return;
    }
    if (fence || !/\p{L}/u.test(line)) return;
    if (/^\s*\|.*\|\s*$/.test(line)) {
      if (/^\s*\|?\s*:?-{3,}/.test(line)) return;
      const parts = line.split("|");
      cells.set(i, parts);
      parts.forEach((c, k) => {
        if (/\p{L}/u.test(c)) pieces.push({ line: i, prefix: "", cell: k, masked: maskMd(c.trim()) });
      });
      return;
    }
    if (/^\s*<\/?[a-z][^>]*>\s*$/i.test(line)) return;
    const m = /^(\s*(?:#{1,6}\s+|(?:[-*+]|\d+[.)])\s+|>\s?)*)(.*)$/.exec(line)!;
    pieces.push({ line: i, prefix: m[1] ?? "", masked: maskMd(m[2] ?? "") });
  });
  return { lines, pieces, cells };
}

/** Put the translated pieces back into the body. */
export function assemble(src: { lines: string[]; pieces: Piece[]; cells: Map<number, string[]> }, outs: string[]): string {
  const lines = [...src.lines];
  const cells = new Map([...src.cells].map(([k, v]) => [k, [...v]]));
  src.pieces.forEach((p, i) => {
    const text = unmaskMd(outs[i]!, p.masked.map);
    if (p.cell !== undefined) {
      const row = cells.get(p.line)!;
      const pad = /^\s/.test(row[p.cell]!) ? " " : "";
      row[p.cell] = `${pad}${text}${pad}`;
    } else {
      lines[p.line] = `${p.prefix}${text}`;
    }
  });
  for (const [k, row] of cells) lines[k] = row.join("|");
  return lines.join("\n");
}

/** Share of the original language's common words left in a text (0–1). */
export function foreignShare(text: string, lang: string): number {
  const words = (text.toLowerCase().match(/\p{L}+/gu) ?? []) as string[];
  if (words.length === 0) return 0;
  const set = new Set<string>(FOREIGN[lang] ?? []);
  return words.filter((w) => set.has(w)).length / words.length;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Translating
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

type Translate = (texts: string[], from: string) => Promise<(string | null)[]>;

function poolTranslator(pool: PoolKey[]): Translate {
  return async (texts, from) => {
    const batches: string[][] = [];
    const index: number[][] = [];
    let cur: string[] = [];
    let ci: number[] = [];
    let bytes = 0;
    texts.forEach((t, i) => {
      if (cur.length && (cur.length >= 30 || bytes + t.length > 3500)) {
        batches.push(cur);
        index.push(ci);
        cur = [];
        ci = [];
        bytes = 0;
      }
      cur.push(t);
      ci.push(i);
      bytes += t.length + 1;
    });
    if (cur.length) batches.push(cur), index.push(ci);
    const res = await translateBatchesParallel(pool, batches, "en", from, (slice, b) => translateBatch(slice, b, "en", from));
    const out: (string | null)[] = new Array(texts.length).fill(null);
    res.forEach((r, bi) => index[bi]!.forEach((ti, k) => (out[ti] = r?.[k] ?? null)));
    return out;
  };
}

/** One answer acceptable for one piece? */
function goodPiece(src: string, out: string | null | undefined): boolean {
  if (!out || !out.trim()) return false;
  if (placeholders(src) !== placeholders(out)) return false;
  const a = src.replace(/@@\d+@@/g, "").length;
  const b = out.replace(/@@\s*\d+\s*@@/g, "").length;
  if (a >= 40 && (b < a * 0.4 || b > a * 3)) return false;
  return true;
}

/** Translate pieces with one retry pass for the refused ones. Returns null when any piece still fails. */
async function translatePieces(tr: Translate, texts: string[], from: string): Promise<string[] | null> {
  const out = await tr(texts, from);
  const bad = texts.map((t, i) => (goodPiece(t, out[i]) ? -1 : i)).filter((i) => i >= 0);
  if (bad.length) {
    const again = await tr(bad.map((i) => texts[i]!), from);
    bad.forEach((i, k) => {
      if (goodPiece(texts[i]!, again[k])) out[i] = again[k]!;
    });
  }
  return texts.every((t, i) => goodPiece(t, out[i])) ? (out as string[]) : null;
}

const yaml = (s: string) => (/[:#"'\n]|^\s|\s$/.test(s) ? JSON.stringify(s) : s);

/** Title for a slug and a description in check.mjs's 70–200 character window. */
function fitDescription(d: string): string {
  const s = d.replace(/\s+/g, " ").trim();
  if (s.length <= 200) return s;
  const cut = s.slice(0, 197);
  return `${cut.slice(0, Math.max(120, cut.lastIndexOf(" ")))}…`;
}

export interface DocResult {
  file: string;
  ok: boolean;
  reason?: string;
}

/** Translate one Markdown document (article or page) into its English file. */
export async function translateDoc(
  tr: Translate,
  lang: "de" | "es",
  srcPath: string,
  outPath: string,
  usedSlugs: Set<string>,
  fixedSlug?: string
): Promise<DocResult> {
  const file = srcPath.split("/").pop()!;
  const { data, body } = parseFrontmatter(readFileSync(srcPath, "utf8")) as { data: Record<string, unknown>; body: string };
  const title = String(data.title ?? "");
  const description = String(data.description ?? "");
  const parts = piecesOf(body);
  // Title (and description, when there is one) travel with the body's pieces; an empty field is not sent.
  const head = [maskMd(title || file.replace(/\.md$/, "").replace(/-/g, " ")), ...(description ? [maskMd(description)] : [])];
  const texts = [...head.map((m) => m.text), ...parts.pieces.map((p) => p.masked.text)];
  const outs = await translatePieces(tr, texts, lang);
  if (!outs) return { file, ok: false, reason: "a piece was refused twice (placeholder lost / empty / cut)" };
  const enTitle = unmaskMd(outs[0]!, head[0]!.map).trim();
  const enDesc = description ? fitDescription(unmaskMd(outs[1]!, head[1]!.map)) : "";
  const enBody = assemble(parts, outs.slice(head.length));
  const floor = lang === "de" ? 0.9 : 0.78;
  const orig = countWords(body) as number;
  const got = countWords(enBody) as number;
  if (orig > 0 && got < orig * floor) return { file, ok: false, reason: `too short: ${got}/${orig} words` };
  if (foreignShare(enBody, lang) > 0.03) return { file, ok: false, reason: `original-language words left (${Math.round(foreignShare(enBody, lang) * 100)} %)` };
  const base = String(slugify(enTitle));
  let slug = fixedSlug ?? (base.length > 70 ? base.slice(0, 70).replace(/-[^-]*$/, "") : base);
  if (!slug) slug = slugify(file.replace(/\.md$/, ""));
  for (let n = 2; usedSlugs.has(slug); n++) slug = `${slug.replace(/-\d+$/, "")}-${n}`;
  usedSlugs.add(slug);
  const front = [`slug: ${slug}`, `title: ${yaml(enTitle)}`, ...(description ? [`description: ${yaml(enDesc)}`] : [])];
  writeFileSync(outPath, `---\n${front.join("\n")}\n---\n${enBody}`);
  return { file, ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A site
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

function readJson<T>(p: string): T {
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

interface SiteJson {
  name: string;
  lang: string;
  expansion?: string;
  tagline?: string;
  description?: string;
  author?: string;
  domain?: string;
  categories?: { slug: string; name: string; description?: string }[];
  menu?: { label: string; href: string }[];
  legal?: { label: string; href: string }[];
  promo?: { label?: string };
  en?: Record<string, unknown>;
}

async function englishBlock(tr: Translate, site: SiteJson, domain: string): Promise<Record<string, unknown> | null> {
  const lang = site.lang;
  const cats = site.categories ?? [];
  const items: string[] = [
    site.expansion ?? "", site.tagline ?? "", site.description ?? "", site.author ?? "", site.promo?.label ?? "",
    ...cats.flatMap((c) => [c.name, c.description ?? ""]),
    ...(site.menu ?? []).map((m) => m.label),
    ...(site.legal ?? []).map((m) => m.label),
  ];
  const masked = items.map((s) => maskMd(s));
  const outs = await translatePieces(tr, masked.map((m) => m.text || "-"), lang);
  if (!outs) return null;
  const t = (i: number) => (items[i] ? unmaskMd(outs[i]!, masked[i]!.map).trim() : "");
  let k = 5;
  const categories: Record<string, { slug: string; name: string; description: string }> = {};
  const used = new Set<string>();
  for (const c of cats) {
    const name = t(k++);
    const description = t(k++);
    let slug = slugify(name) || c.slug;
    while (used.has(slug)) slug += "-x";
    used.add(slug);
    categories[c.slug] = { slug, name, description };
  }
  const menu = (site.menu ?? []).map((m) => ({ label: t(k++), href: m.href }));
  const legal = (site.legal ?? []).map((m) => ({ label: t(k++), href: m.href }));
  const americas = domain.endsWith(".lat");
  return {
    since: new Date().toISOString().slice(0, 10),
    locale: americas ? "en-US" : "en-GB",
    ogLocale: americas ? "en_US" : "en_GB",
    ...(t(0) ? { expansion: t(0) } : {}),
    ...(t(1) ? { tagline: t(1) } : {}),
    description: t(2) || site.description,
    ...(t(3) ? { author: t(3) } : { author: `${site.name} editorial team` }),
    paths: { article: "/en/guides/", category: "/en/topics/" },
    categories,
    ...(site.promo?.label ? { promo: { label: t(4) } } : {}),
    ...(menu.length ? { menu } : {}),
    ...(legal.length ? { legal } : {}),
  };
}

/** The theme's own words still in the original language on the English pages → theme/en.json. */
async function themeStrings(tr: Translate, domain: string, lang: string): Promise<number> {
  const { build } = (await import("../sites/_engine/build.mjs")) as { build: (d: string, o: { quiet: boolean }) => Promise<{ out: string }> };
  const { out } = await build(domain, { quiet: true });
  const files: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) files.push(p);
    }
  };
  walk(join(out, "en"));
  const set = new Set<string>(FOREIGN[lang] ?? []);
  const pieces = new Set<string>();
  for (const f of files) {
    for (const raw of themeText(readFileSync(f, "utf8")).split(/\s{2,}|\n/)) {
      const p = raw.trim();
      if (p.length < 2 || p.length > 200 || !/\p{L}{2}/u.test(p)) continue;
      if ((p.toLowerCase().match(/\p{L}+/gu) ?? []).some((w: string) => set.has(w))) pieces.add(p);
    }
  }
  if (pieces.size === 0) return 0;
  const list = [...pieces];
  const outs = await translatePieces(tr, list.map((p) => maskMd(p).text), lang);
  if (!outs) return -1;
  const file = join(SITES, domain, "theme", "en.json");
  const cur = existsSync(file) ? readJson<{ strings?: Record<string, string>; patterns?: [string, string][]; keep?: string[] }>(file) : {};
  const strings = { ...(cur.strings ?? {}) };
  list.forEach((p, i) => (strings[p] = unmaskMd(outs[i]!, maskMd(p).map)));
  // Counts ("12 Artikel", "3 guías") become patterns so every number reads in English.
  const patterns = [...(cur.patterns ?? [])];
  for (const [p, e] of Object.entries(strings)) {
    const m = /^(\d+)\s+(\p{L}+)$/u.exec(p);
    const n = /^(\d+)\s+(.+)$/.exec(e);
    if (m && n && !patterns.some(([re]) => re.includes(m[2]!))) patterns.push([`(\\d+) ${m[2]}`, `$1 ${n[2]}`]);
  }
  writeFileSync(file, `${JSON.stringify({ strings, patterns, keep: cur.keep ?? [] }, null, 2)}\n`);
  return list.length;
}

export async function translateSite(tr: Translate, domain: string, outOfTime: () => boolean, dry: boolean): Promise<string[]> {
  const report: string[] = [];
  const dir = join(SITES, domain);
  const siteFile = join(dir, "site.json");
  const site = readJson<SiteJson>(siteFile);
  if (site.lang !== "de" && site.lang !== "es") return [`${domain}: ${site.lang} — not a German or Spanish site`];
  const lang = site.lang;
  let done = 0;
  let waiting = 0;
  for (const kind of ["articles", "pages"] as const) {
    const src = join(dir, "content", kind);
    const dst = join(dir, "content", "en", kind);
    if (!existsSync(src)) continue;
    mkdirSync(dst, { recursive: true });
    const used = new Set<string>(
      readdirSync(dst)
        .filter((f) => f.endsWith(".md"))
        .map((f) => String((parseFrontmatter(readFileSync(join(dst, f), "utf8")) as { data: { slug?: string } }).data.slug ?? ""))
    );
    for (const f of readdirSync(src).filter((x) => x.endsWith(".md")).sort()) {
      if (existsSync(join(dst, f))) continue;
      if (outOfTime()) break;
      if (dry) {
        waiting++;
        continue;
      }
      const fixed = kind === "pages" ? PAGE_SLUGS[f.replace(/\.md$/, "")] : undefined;
      const r = await translateDoc(tr, lang, join(src, f), join(dst, f), used, fixed);
      if (r.ok) done++;
      else {
        waiting++;
        report.push(`${domain}/${kind}/${f}: waits — ${r.reason}`);
      }
    }
  }
  const total = (k: string) => (existsSync(join(dir, "content", k)) ? readdirSync(join(dir, "content", k)).filter((f) => f.endsWith(".md")).length : 0);
  const have = (k: string) => (existsSync(join(dir, "content", "en", k)) ? readdirSync(join(dir, "content", "en", k)).filter((f) => f.endsWith(".md")).length : 0);
  const complete = have("articles") >= total("articles") && have("pages") >= total("pages");
  report.unshift(`${domain}: +${done} translated, articles ${have("articles")}/${total("articles")}, pages ${have("pages")}/${total("pages")}${waiting ? `, ${waiting} waiting` : ""}`);
  if (!complete || dry || site.en) return report;

  // Every document exists: switch the English edition on — only if the site's own gate passes.
  const pending = join(dir, "content", "en", "site-en.json");
  const block = existsSync(pending) ? readJson<Record<string, unknown>>(pending) : await englishBlock(tr, site, domain);
  if (!block) return [...report, `${domain}: site texts could not be translated yet`];
  const raw = readFileSync(siteFile, "utf8");
  writeFileSync(siteFile, `${JSON.stringify({ ...site, en: block }, null, 2)}\n`);
  try {
    const n = await themeStrings(tr, domain, lang);
    if (n < 0) throw new Error("theme words could not be translated yet");
    const { check } = (await import("../sites/_engine/check.mjs")) as { check: (d: string) => Promise<number> };
    const failed = await check(domain);
    if (failed) throw new Error(`check.mjs: ${failed} gate(s) failed`);
    if (existsSync(pending)) rmSync(pending);
    return [...report, `${domain}: ENGLISH EDITION ON (/en/), check.mjs passed`];
  } catch (err) {
    writeFileSync(siteFile, raw); // back off: the site stays as it was
    writeFileSync(pending, `${JSON.stringify(block, null, 2)}\n`);
    return [...report, `${domain}: English edition not switched on — ${(err as Error).message}`];
  }
}

function args() {
  const a = Object.fromEntries(
    process.argv.slice(2).map((x) => {
      const [k, v] = x.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return { site: String(a.site ?? ""), all: a.all === "true", dry: a.dry === "true", minutes: Number(a.minutes) > 0 ? Number(a.minutes) : 200 };
}

async function main() {
  const opt = args();
  const started = Date.now();
  const outOfTime = () => Date.now() - started > opt.minutes * 60_000;
  const r2 = R2S3.fromEnv();
  const pool = r2 && !opt.dry ? await loadKeyPool(r2) : [];
  const tr = poolTranslator(pool);
  const domains = opt.all
    ? readdirSync(SITES, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !EXCLUDED.has(e.name) && existsSync(join(SITES, e.name, "site.json")))
        .map((e) => e.name)
        .filter((d) => ["de", "es"].includes(readJson<SiteJson>(join(SITES, d, "site.json")).lang))
    : [opt.site].filter((d) => d && !EXCLUDED.has(d));
  if (domains.length === 0) {
    console.error("--site=<domain> or --all");
    process.exit(2);
  }
  for (const d of domains) {
    if (outOfTime()) break;
    for (const line of await translateSite(tr, d, outOfTime, opt.dry)) console.log(line);
  }
}

if (process.argv[1] && /(^|[\\/])translate-sites-en\.ts$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
