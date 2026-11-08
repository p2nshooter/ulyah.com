/**
 * Masukan URL dan sitemap (docs/MASTER-BLUEPRINT.md §7; file pemilik „Master_xscan“ bagian masukan URL/sitemap).
 *
 * - Hanya http/https, tanpa kredensial di URL, port 80/443 saja; host IP privat/loopback/link-local/metadata dan nama
 *   internal ditolak (SSRF). Setiap pengalihan diperiksa ulang (maks. 5), batas waktu 15 detik, maks. 5 MB.
 * - robots.txt situs tujuan dihormati untuk agen kami („xscanbot“) dan „*“.
 * - Isi utama diambil dari <article>/<main> bila ada; menu, header, footer, aside, formulir, skrip dan gaya dibuang.
 * - Sitemap: urlset atau sitemapindex (bertingkat maks. 3), URL kembar dibuang, jumlah dibatasi admin.
 * Modul ini murni (tanpa R2), jadi bisa diuji unit; pemanggil yang memotong kredit dan menyimpan hasilnya.
 */

export const FETCH_LIMITS = { maxBytes: 5 * 1024 * 1024, timeoutMs: 15_000, maxRedirects: 5, sitemapDepth: 3, sitemapUrls: 500 } as const;
export const BOT_UA = 'Mozilla/5.0 (compatible; xscanbot/1.0; +https://xscan.es/en/how-it-works)';

export class InputUrlError extends Error {
  constructor(public code: 'bad_url' | 'blocked_host' | 'protected' | 'robots' | 'too_big' | 'timeout' | 'not_html' | 'http' | 'redirects' | 'empty' | 'bad_sitemap', message: string) {
    super(message);
  }
}

/* ── alamat ─────────────────────────────────────────────────────────────── */

function ipv4Private(h: string): boolean {
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if ([a, b, Number(m[3]), Number(m[4])].some((n) => n > 255)) return true; // bukan IP sah → tolak
  return (
    a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224
  );
}

function ipv6Private(h: string): boolean {
  const x = h.replace(/^\[|\]$/g, '').toLowerCase();
  if (!x.includes(':')) return false;
  if (x === '::' || x === '::1') return true;
  if (/^(fc|fd|fe8|fe9|fea|feb|ff)/.test(x)) return true;
  const mapped = x.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return ipv4Private(mapped[1]!);
  return /^::ffff:/.test(x) || /^64:ff9b:/.test(x);
}

/** Parser URL sudah mengubah 2130706433 / 0x7f000001 / 0177.0.0.1 menjadi 127.0.0.1; ini penjaga terakhir saja. */
const numericHost = (h: string) => /^\d+$/.test(h);

const INTERNAL_NAMES = /(^|\.)(localhost|local|internal|intranet|lan|home|corp|localdomain|home\.arpa)$/i;
const METADATA_HOSTS = new Set(['metadata.google.internal', 'metadata', 'instance-data', 'metadata.azure.com']);

/**
 * Situs yang tidak pernah dipindai (pemilik, 8 Nov 2026: „Tolak seluruh scanning website2 yg sy sebutkan“ —
 * MASTER-BLUEPRINT §29). Berlaku untuk domain itu sendiri dan semua subdomainnya, untuk URL langsung, setiap
 * pengalihan, dan setiap entri sitemap. Daftar ini hanya ada di server; pesan ke member tidak menyebut daftarnya.
 */
export const PROTECTED_DOMAINS = ['axto.io', 'xscan.es', 'ascan.es', 'xaa.es', 'ulyah.com', '1fr.fr', 'tilawa.de', 'dawa.im', 'xad.es'] as const;
export function isProtectedHost(host: string): boolean {
  let h = host.toLowerCase();
  while (h.endsWith('.')) h = h.slice(0, -1);
  return PROTECTED_DOMAINS.some((d) => h === d || h.endsWith('.' + d));
}

/** Memeriksa URL masukan member. Mengembalikan URL yang sudah dinormalisasi (tanpa #fragmen) atau melempar galat. */
export function checkUrl(raw: string, base?: URL): URL {
  let u: URL;
  try {
    u = new URL(String(raw).trim(), base);
  } catch {
    throw new InputUrlError('bad_url', 'URL tidak valid.');
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new InputUrlError('bad_url', 'Hanya alamat http/https.');
  if (u.username || u.password) throw new InputUrlError('bad_url', 'URL tidak boleh berisi nama pengguna atau sandi.');
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (!host || !host.includes('.') && !host.includes(':')) throw new InputUrlError('blocked_host', 'Nama host tidak diizinkan.');
  if (ipv4Private(host) || ipv6Private(host) || numericHost(host) || INTERNAL_NAMES.test(host) || METADATA_HOSTS.has(host)) {
    throw new InputUrlError('blocked_host', 'Alamat jaringan internal tidak boleh dipindai.');
  }
  if (u.port && u.port !== '80' && u.port !== '443') throw new InputUrlError('blocked_host', 'Port ini tidak diizinkan (hanya 80/443).');
  if (isProtectedHost(host)) throw new InputUrlError('protected', 'Situs ini tidak dapat dipindai di xscan.es.');
  u.hash = '';
  return u;
}

/* ── robots.txt ─────────────────────────────────────────────────────────── */

/** true bila `path` boleh diambil oleh agen kami menurut robots.txt (aturan terpanjang menang; Allow menang bila seri). */
export function robotsAllows(robots: string, path: string, agent = 'xscanbot'): boolean {
  const groups: { agents: string[]; rules: { allow: boolean; p: string }[] }[] = [];
  let cur: (typeof groups)[number] | null = null;
  let lastWasAgent = false;
  for (const line of robots.split(/\r?\n/)) {
    const l = line.replace(/#.*/, '').trim();
    const m = l.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1]!.toLowerCase();
    const v = m[2]!.trim();
    if (k === 'user-agent') {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(v.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!cur) continue;
    if (k === 'allow' || k === 'disallow') cur.rules.push({ allow: k === 'allow', p: v });
  }
  const mine = groups.filter((g) => g.agents.some((a) => a !== '*' && agent.toLowerCase().includes(a)));
  const use = mine.length ? mine : groups.filter((g) => g.agents.includes('*'));
  let best: { allow: boolean; len: number } | null = null;
  for (const g of use) {
    for (const r of g.rules) {
      if (!r.p) continue; // „Disallow:“ kosong = semua boleh
      const re = new RegExp('^' + r.p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
      if (!re.test(path)) continue;
      const len = r.p.length;
      if (!best || len > best.len || (len === best.len && r.allow)) best = { allow: r.allow, len };
    }
  }
  return best ? best.allow : true;
}

/* ── HTML → teks ────────────────────────────────────────────────────────── */

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', copy: '©', reg: '®', deg: '°', middot: '·', bull: '•' };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : '';
    }
    return ENTITIES[e.toLowerCase()] ?? all;
  });
}

const attr = (tag: string, name: string) => decodeEntities(tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))?.slice(2).find((x) => x !== undefined) ?? '').trim();

function metaContent(html: string, keys: string[]): string {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const key = (attr(tag, 'property') || attr(tag, 'name') || attr(tag, 'itemprop')).toLowerCase();
    if (keys.includes(key)) {
      const v = attr(tag, 'content');
      if (v) return v;
    }
  }
  return '';
}

export interface Extracted {
  url: string;
  title: string;
  author: string;
  published: string;
  lang: string;
  text: string;
  words: number;
}

/** Mengambil isi utama halaman sebagai paragraf teks biasa (dipisah baris kosong). */
export function htmlToArticle(html: string, url = ''): Extracted {
  const title = metaContent(html, ['og:title', 'twitter:title']) || decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
  const author = metaContent(html, ['author', 'article:author', 'og:article:author', 'twitter:creator']);
  const published = metaContent(html, ['article:published_time', 'datepublished', 'date', 'dc.date']);
  const lang = (html.match(/<html\b[^>]*\blang\s*=\s*["']?([A-Za-z-]+)/i)?.[1] ?? '').toLowerCase();
  let body = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template|svg|canvas|iframe|object|embed|form|select|button)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(script|style|link|meta|input|img|source|br\s*\/?)\b[^>]*>/gi, (t) => (/^<br/i.test(t) ? '\n' : ' '));
  const pick = (tag: string) => {
    const all = [...body.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map((m) => m[1]!);
    return all.sort((a, b) => b.length - a.length)[0];
  };
  const main = pick('article') ?? pick('main') ?? body.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? body;
  body = main
    .replace(/<(nav|header|footer|aside|figure|figcaption)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(div|section)\b[^>]*(class|id)\s*=\s*["'][^"']*\b(share|social|related|comment|newsletter|subscribe|cookie|breadcrumb|advert|ads?|sidebar|menu|footer|header)\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/?(p|div|section|h[1-6]|li|ul|ol|blockquote|pre|tr|table|dd|dt|dl)\b[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ');
  const text = decodeEntities(body)
    .split(/\n{2,}/)
    .map((p) => p.replace(/[ \t\f\v\u00a0]+/g, ' ').replace(/\s*\n\s*/g, ' ').trim())
    .filter((p) => p.length > 1)
    .join('\n\n');
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return { url, title, author, published, lang, text, words };
}

/* ── sitemap ────────────────────────────────────────────────────────────── */

export interface SitemapDoc {
  kind: 'urlset' | 'index';
  locs: string[];
}

export function parseSitemap(xml: string): SitemapDoc {
  const head = xml.slice(0, 4000);
  const kind = /<(?:\w+:)?sitemapindex\b/i.test(head) ? 'index' : /<(?:\w+:)?urlset\b/i.test(head) ? 'urlset' : null;
  if (!kind) throw new InputUrlError('bad_sitemap', 'Bukan sitemap XML (urlset/sitemapindex).');
  const seen = new Set<string>();
  const locs: string[] = [];
  for (const m of xml.matchAll(/<(?:\w+:)?loc>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/(?:\w+:)?loc>/gi)) {
    const v = decodeEntities(m[1]!.trim());
    if (v && !seen.has(v)) { seen.add(v); locs.push(v); }
  }
  return { kind, locs };
}

/* ── pengambilan ────────────────────────────────────────────────────────── */

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const len = Number(res.headers.get('content-length') ?? 0);
  if (len > maxBytes) throw new InputUrlError('too_big', `Halaman lebih dari ${Math.round(maxBytes / 1048576)} MB.`);
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { await reader.cancel(); throw new InputUrlError('too_big', `Halaman lebih dari ${Math.round(maxBytes / 1048576)} MB.`); }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.byteLength; }
  const charset = (res.headers.get('content-type') ?? '').match(/charset=([\w-]+)/i)?.[1] ?? 'utf-8';
  try {
    return new TextDecoder(charset).decode(all);
  } catch {
    return new TextDecoder('utf-8').decode(all);
  }
}

/** GET dengan pengalihan manual: setiap lompatan diperiksa ulang oleh `checkUrl`. */
export async function safeGet(raw: string, opts: { accept: string; fetcher?: Fetcher; maxBytes?: number; timeoutMs?: number } ): Promise<{ url: URL; body: string; type: string }> {
  const fetcher = opts.fetcher ?? ((i, init) => fetch(i, init));
  let url = checkUrl(raw);
  const deadline = Date.now() + (opts.timeoutMs ?? FETCH_LIMITS.timeoutMs);
  for (let hop = 0; hop <= FETCH_LIMITS.maxRedirects; hop += 1) {
    const left = deadline - Date.now();
    if (left <= 0) throw new InputUrlError('timeout', 'Situs tujuan terlalu lama menjawab.');
    let res: Response;
    try {
      res = await fetcher(url.toString(), { redirect: 'manual', headers: { 'user-agent': BOT_UA, accept: opts.accept, 'accept-language': 'id,en;q=0.8,*;q=0.5' }, signal: AbortSignal.timeout(left) });
    } catch (e) {
      throw new InputUrlError((e as Error).name === 'TimeoutError' ? 'timeout' : 'http', (e as Error).name === 'TimeoutError' ? 'Situs tujuan terlalu lama menjawab.' : 'Situs tujuan tidak bisa dihubungi.');
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      url = checkUrl(res.headers.get('location')!, url);
      continue;
    }
    if (!res.ok) throw new InputUrlError('http', `Situs tujuan menjawab ${res.status}.`);
    return { url, body: await readCapped(res, opts.maxBytes ?? FETCH_LIMITS.maxBytes), type: (res.headers.get('content-type') ?? '').toLowerCase() };
  }
  throw new InputUrlError('redirects', 'Terlalu banyak pengalihan.');
}

/** Mengambil satu artikel dari URL, menghormati robots.txt situsnya. */
export async function fetchArticle(raw: string, fetcher?: Fetcher): Promise<Extracted> {
  const first = checkUrl(raw);
  let robots = '';
  try {
    robots = (await safeGet(`${first.origin}/robots.txt`, { accept: 'text/plain', fetcher, maxBytes: 512 * 1024, timeoutMs: 5_000 })).body;
  } catch {
    robots = ''; // tanpa robots.txt = boleh
  }
  if (!robotsAllows(robots, first.pathname + first.search)) throw new InputUrlError('robots', 'robots.txt situs ini melarang halaman tersebut diambil.');
  const got = await safeGet(first.toString(), { accept: 'text/html,application/xhtml+xml,text/plain;q=0.8', fetcher });
  if (!/text\/html|application\/xhtml|text\/plain/.test(got.type)) throw new InputUrlError('not_html', 'Alamat ini bukan halaman artikel (HTML/teks).');
  const art = /text\/plain/.test(got.type)
    ? { url: got.url.toString(), title: '', author: '', published: '', lang: '', text: got.body.trim(), words: got.body.trim().split(/\s+/).filter(Boolean).length }
    : htmlToArticle(got.body, got.url.toString());
  if (art.words < 30) throw new InputUrlError('empty', 'Isi artikel tidak ditemukan (kurang dari 30 kata) — halaman mungkin butuh JavaScript atau login.');
  return art;
}

/** Mengumpulkan URL artikel dari sitemap (bertingkat maks. 3), dibatasi `max`. */
export async function collectSitemap(raw: string, max: number = FETCH_LIMITS.sitemapUrls, fetcher?: Fetcher): Promise<{ urls: string[]; skipped: number }> {
  const out: string[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  const walk = async (u: string, depth: number): Promise<void> => {
    if (out.length >= max || depth > FETCH_LIMITS.sitemapDepth) return;
    const doc = parseSitemap((await safeGet(u, { accept: 'application/xml,text/xml;q=0.9,*/*;q=0.5', fetcher })).body);
    for (const loc of doc.locs) {
      if (out.length >= max) { skipped += 1; continue; }
      let ok: URL;
      try { ok = checkUrl(loc); } catch { skipped += 1; continue; }
      const key = ok.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      if (doc.kind === 'index') await walk(key, depth + 1);
      else out.push(key);
    }
  };
  await walk(checkUrl(raw).toString(), 1);
  return { urls: out, skipped };
}
