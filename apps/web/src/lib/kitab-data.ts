/**
 * The kitab library, read from this site's own static files.
 *
 * The data under public/kitab-data is generated at build time from the seed
 * files the deploy imported into D1 (scripts/build-kitab-static.ts), so the
 * library never depends on D1 being reachable — or on its daily read quota,
 * shared by every site on the account, still having rows left. That quota
 * running out is what emptied every kitab page: the API answered 500, the
 * pages rendered "Tidak ada hasil", and the page cache kept that for a day.
 *
 * On Cloudflare the files are read through the Worker's ASSETS binding: no
 * subrequest leaves the Worker, nothing is billed as a request, nothing is read
 * from D1 or R2. Under `next dev` / `next build` (Node) they are read from
 * public/ on disk.
 *
 * Server-only: the JSON is far too large to ship to a browser. Import this
 * from server components only.
 */

export interface LibraryCategory {
  slug: string;
  name_ar: string;
  name_id: string;
  name_en: string | null;
  /** Hand-written es/de/fr names (packages/db-schema/seed/translations). */
  names: Partial<Record<string, string>>;
  icon: string | null;
  sort_order: number;
  book_count: number;
}

export interface LibraryShelfBook {
  id: number;
  title_ar: string;
  author: string | null;
  author_death_year: string | null;
  source: string | null;
  excerpt: string | null;
}

export interface LibraryBook {
  id: number;
  category_slug: string;
  title_ar: string;
  author: string | null;
  author_death_year: string | null;
  description_ar: string | null;
  topics: string[];
  source: string | null;
  next: { id: number; title_ar: string } | null;
}

export interface PesantrenCategory {
  slug: string;
  name_id: string;
  name_ar: string | null;
  icon: string | null;
  sort_order: number;
  kitab_count: number;
}

export interface PesantrenKitabRow {
  slug: string;
  category_slug: string;
  title_ar: string;
  title_id: string;
  author: string | null;
  author_death_year: string | null;
  description_id: string | null;
  sort_order: number;
  bab_count: number;
}

const ROOT = "kitab-data";

interface AssetsFetcher {
  fetch(input: string | URL | Request): Promise<Response>;
}

async function assetsBinding(): Promise<AssetsFetcher | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as { ASSETS?: AssetsFetcher };
    return env.ASSETS ?? null;
  } catch {
    // Not inside a Worker request (next dev, next build).
    return null;
  }
}

/** One JSON file under public/kitab-data, or null when it does not exist. */
async function readData<T>(rel: string): Promise<T | null> {
  // Path segments come from urls; refuse anything that could leave the folder.
  if (!/^[a-z0-9/_.-]+\.json$/i.test(rel) || rel.includes("..")) return null;

  const assets = await assetsBinding();
  if (assets) {
    const res = await assets.fetch(new URL(`/${ROOT}/${rel}`, "https://assets.local"));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`kitab-data ${rel}: HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  try {
    const [{ readFile }, { join }] = await Promise.all([import("node:fs/promises"), import("node:path")]);
    return JSON.parse(await readFile(join(process.cwd(), "public", ROOT, rel), "utf8")) as T;
  } catch (err) {
    if ((err as { code?: string } | null)?.code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Missing data is a BUILD fault, never "no kitab": throwing makes Next keep
 * serving the last good page instead of caching an empty one for a day.
 */
async function required<T>(rel: string): Promise<T> {
  const data = await readData<T>(rel);
  if (!data) throw new Error(`kitab-data/${rel} is missing — run scripts/build-kitab-static.ts before next build`);
  return data;
}

export function libraryIndex() {
  return required<{ categories: LibraryCategory[]; total: number }>("library/index.json");
}

/** One shelf, or null when the category does not exist. */
export async function libraryShelf(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return readData<{ slug: string; books: LibraryShelfBook[] }>(`library/cat/${slug}.json`);
}

export async function libraryBook(id: number): Promise<LibraryBook | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const bucket = await readData<Record<string, LibraryBook>>(`library/book/${Math.floor(id / 100)}.json`);
  return bucket?.[String(id)] ?? null;
}

export function pesantrenIndex() {
  return required<{ categories: PesantrenCategory[]; kitab: PesantrenKitabRow[] }>("pesantren/index.json");
}

/** One kitab pesantren in full — the same shape /content/pesantren/kitab/:slug answers. */
export async function pesantrenKitab<T>(slug: string): Promise<T | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return readData<T>(`pesantren/kitab/${slug}.json`);
}

/** A category's name in the site's language, from the static data alone. */
export function categoryName(c: LibraryCategory, locale: string): string {
  if (locale === "id") return c.name_id;
  return c.names[locale] ?? c.name_en ?? c.name_id;
}
