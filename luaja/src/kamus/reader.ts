/**
 * Kamus LUAJA — pembaca paket kamus di R2 (bucket MEDIA). Paket dibangun scripts/kamus/build.py dan diunggah workflow
 * kamus-luaja.yml ke `kamus/<versi>/…`; penunjuk versi aktif ada di `kamus/current.json` (ditulis paling akhir, jadi
 * pergantian versi bersifat atomik). Setiap pencarian membaca satu blok ±48 KB lewat range read, bukan seluruh berkas.
 *
 *   <bhs>/e.idx.json  {parts, blocks: [[kunci pertama, bagian, offset, panjang], …]}
 *   <bhs>/e-<n>.txt   „kunci<TAB>[entri,…]“ terurut menurut titik kode (sama dengan urutan byte UTF-8 di `sort`)
 *   <bhs>/f.idx.json, f-<n>.txt   „bentuk<TAB>[lema,…]“
 */
export type KLang = 'de' | 'en' | 'ja' | 'id';
export type UiLang = 'id' | 'en' | 'ja';
export const KLANGS: readonly KLang[] = ['de', 'en', 'ja', 'id'];
export const isKLang = (x: unknown): x is KLang => typeof x === 'string' && (KLANGS as readonly string[]).includes(x);

export interface Sense { g: string; t?: string[]; x?: [string, string] }
export interface PosBlock { p: string; s: Sense[]; f?: [string, string][] }
export interface Entry {
  w: string;
  ipa?: string;
  g?: 'm' | 'f' | 'n';
  pl?: string;
  r?: string[];
  ro?: string[];
  b: PosBlock[];
  syn?: string[];
  m?: Partial<Record<UiLang, string[]>>;
  d?: string[];
  jd?: string[];
  idd?: string[];
  lv?: string;
  to?: Partial<Record<KLang, string[]>>;
}
export interface LangStats { entries: number; id: number; ja: number; en: number; forms: number; bytes: number }
export interface Meta { ver: string; built: string; langs: Partial<Record<KLang, LangStats>>; sources: { name: string; licence: string; url: string }[] }
type Block = [string, number, number, number];
interface Idx { parts: number; blocks: Block[] }

/** Bagian R2 yang dipakai pembaca (cukup `get` dengan range) — memudahkan uji tanpa Cloudflare. */
export interface KBucket {
  get(key: string, opts?: { range?: { offset: number; length: number } }): Promise<{ text(): Promise<string> } | null>;
}

const POINTER = 'kamus/current.json';
const META_TTL = 5 * 60_000;
let metaCache: { at: number; meta: Meta | null; bucket: KBucket } | null = null;
const idxCache = new Map<string, Promise<Idx | null>>();
const blockCache = new Map<string, string>();
const BLOCK_CACHE = 160;

/** Bandingkan menurut titik kode (bukan unit UTF-16) agar cocok dengan urutan `sort` LC_ALL=C pada UTF-8. */
export function cmp(a: string, b: string): number {
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    const x = a.codePointAt(i)!, y = b.codePointAt(j)!;
    if (x !== y) return x < y ? -1 : 1;
    i += x > 0xffff ? 2 : 1;
    j += y > 0xffff ? 2 : 1;
  }
  const restA = i < a.length, restB = j < b.length;
  return restA === restB ? 0 : restA ? 1 : -1;
}

/** Kunci pencarian: NFC, huruf kecil, spasi dirapikan, tanda baca di ujung dibuang. */
export function keyOf(q: string): string {
  return q.normalize('NFC').replace(/[\t\n\r]/g, ' ').replace(/^[\s"'“”„‚‘’«»()[\]{}.,;:!?¡¿…–—-]+|[\s"'“”„‚‘’«»()[\]{}.,;:!?¡¿…–—-]+$/gu, '').replace(/\s+/g, ' ').toLowerCase().slice(0, 80);
}

export function resetKamusCache(): void {
  metaCache = null;
  idxCache.clear();
  blockCache.clear();
}

export async function getMeta(bucket: KBucket): Promise<Meta | null> {
  if (metaCache && metaCache.bucket === bucket && Date.now() - metaCache.at < META_TTL) return metaCache.meta;
  let meta: Meta | null = null;
  try {
    const o = await bucket.get(POINTER);
    meta = o ? (JSON.parse(await o.text()) as Meta) : null;
  } catch {
    meta = metaCache?.meta ?? null;
  }
  metaCache = { at: Date.now(), meta, bucket };
  return meta;
}

const base = (meta: Meta, lang: KLang) => `kamus/${meta.ver}/${lang}`;

function index(bucket: KBucket, meta: Meta, lang: KLang, kind: 'e' | 'f'): Promise<Idx | null> {
  const key = `${base(meta, lang)}/${kind}.idx.json`;
  let p = idxCache.get(key);
  if (!p) {
    p = bucket.get(key).then(async (o) => (o ? (JSON.parse(await o.text()) as Idx) : null)).catch(() => null);
    idxCache.set(key, p);
    p.then((v) => { if (!v) idxCache.delete(key); });
  }
  return p;
}

/** Indeks blok terakhir yang kunci pertamanya ≤ k (−1 bila k sebelum blok pertama). */
export function locate(blocks: Block[], k: string): number {
  let lo = 0, hi = blocks.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cmp(blocks[mid][0], k) <= 0) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
}

const inflight = new Map<string, Promise<string>>();
async function readBlock(bucket: KBucket, meta: Meta, lang: KLang, kind: 'e' | 'f', b: Block): Promise<string> {
  const key = `${base(meta, lang)}/${kind}-${b[1]}.txt@${b[2]}`;
  const hit = blockCache.get(key);
  if (hit !== undefined) {
    blockCache.delete(key);
    blockCache.set(key, hit);
    return hit;
  }
  let p = inflight.get(key);
  if (!p) {
    p = bucket.get(`${base(meta, lang)}/${kind}-${b[1]}.txt`, { range: { offset: b[2], length: b[3] } })
      .then((o) => (o ? o.text() : ''))
      .then((txt) => {
        blockCache.set(key, txt);
        if (blockCache.size > BLOCK_CACHE) blockCache.delete(blockCache.keys().next().value!);
        return txt;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  return p;
}

function lineValue(txt: string, k: string): string | null {
  const needle = `${k}\t`;
  let at = txt.startsWith(needle) ? 0 : txt.indexOf(`\n${needle}`);
  if (at < 0) return null;
  if (at > 0) at += 1;
  const end = txt.indexOf('\n', at);
  return txt.slice(at + needle.length, end < 0 ? undefined : end);
}

const WEAK = new Set(['obsolete', 'archaic', 'dated', 'rare']);
/** Entri yang seluruh maknanya usang/langka, atau hanya „bentuk lampau dari …“ — kalah dari lema yang umum. */
export function weak(e: Entry): boolean {
  const senses = e.b.flatMap((b) => b.s);
  if (!senses.length) return false;
  return senses.every((s) => s.t?.some((x) => WEAK.has(x)) || /\b(form|tense|participle|spelling|romanization|inflection) of\b/i.test(s.g));
}

export class Kamus {
  constructor(private bucket: KBucket, private meta: Meta) {}

  static async open(bucket: KBucket | undefined): Promise<Kamus | null> {
    if (!bucket) return null;
    const meta = await getMeta(bucket);
    return meta ? new Kamus(bucket, meta) : null;
  }

  get info(): Meta { return this.meta; }

  private async find(lang: KLang, kind: 'e' | 'f', k: string): Promise<string | null> {
    if (!k) return null;
    const idx = await index(this.bucket, this.meta, lang, kind);
    if (!idx) return null;
    const i = locate(idx.blocks, k);
    if (i < 0) return null;
    return lineValue(await readBlock(this.bucket, this.meta, lang, kind, idx.blocks[i]), k);
  }

  /** Entri untuk kunci persis (semua kata yang huruf kecilnya sama, mis. „Bank“ dan „bank“). */
  async exact(lang: KLang, k: string): Promise<Entry[]> {
    const v = await this.find(lang, 'e', k);
    if (!v) return [];
    try { return JSON.parse(v) as Entry[]; } catch { return []; }
  }

  /** Lema dari bentuk berubah, cara baca kana atau romaji. */
  async lemmas(lang: KLang, k: string): Promise<string[]> {
    const v = await this.find(lang, 'f', k);
    if (!v) return [];
    try { return JSON.parse(v) as string[]; } catch { return []; }
  }

  /**
   * Cari kata sebagaimana diketik/diketuk: entri persis dan lema dari bentuknya („ging“ → gehen, „行った“ → 行く), lalu
   * diurutkan: huruf persis sama, punya arti dalam bahasa antarmuka, dan bukan kata usang/langka didahulukan.
   */
  async lookup(lang: KLang, q: string, max = 4, ui?: UiLang): Promise<{ entries: Entry[]; from?: string }> {
    const k = keyOf(q);
    if (!k) return { entries: [] };
    const raw = q.normalize('NFC').trim();
    let entries = await this.exact(lang, k);
    const exactSet = new Set(entries.map((e) => e.w));
    const lem = await this.lemmas(lang, k);
    const seen = new Set(entries.map((e) => e.w));
    for (const l of lem.slice(0, 3)) {
      if (seen.has(l)) continue;
      for (const e of await this.exact(lang, keyOf(l))) if (e.w === l && !seen.has(e.w)) { entries.push(e); seen.add(e.w); }
    }
    if (!entries.length && lang === 'de' && k.includes('ss')) entries = await this.exact(lang, k.replace(/ss/g, 'ß'));
    if (!entries.length && lang === 'en' && /'s$/.test(k)) entries = await this.exact(lang, k.slice(0, -2));
    // Huruf besar bermakna di bahasa Jerman (Essen ≠ essen); di bahasa lain huruf besar di awal kalimat tidak boleh
    // membuat „Go“ (permainan) mengalahkan „go“. Entri yang lebih kaya makna sedikit didahulukan.
    const rich = (e: Entry) => Math.min(2, e.b.reduce((n, b) => n + b.s.length, 0) / 5);
    const caps = (x: string) => x.length > 1 && x === x.toUpperCase() && x !== x.toLowerCase();
    const casing = (e: Entry) => (e.w === raw ? (lang === 'de' ? 2 : 0.6) : 0) + (lang !== 'de' && e.w === raw.toLowerCase() ? 0.5 : 0) - (caps(e.w) && !caps(raw) ? 1.5 : 0);
    const score = (e: Entry) => casing(e) + (exactSet.has(e.w) ? 1 : 0) + (ui && e.m?.[ui]?.length ? 2 : 0) + rich(e) - (weak(e) ? 4 : 0);
    entries = entries.map((e, i) => ({ e, i, s: score(e) })).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.e);
    // ejaan usang / „bentuk dari …“ tidak ditampilkan bila ada entri yang sungguhan
    if (entries.some((e) => !weak(e))) entries = entries.filter((e) => !weak(e));
    return { entries: entries.slice(0, max), from: lem.length && !exactSet.has(entries[0]?.w ?? '') ? raw : undefined };
  }

  /** Kata yang berawalan q (isian otomatis), urut abjad. */
  async prefix(lang: KLang, q: string, max = 10): Promise<Entry[]> {
    const k = keyOf(q);
    if (!k) return [];
    const idx = await index(this.bucket, this.meta, lang, 'e');
    if (!idx) return [];
    const out: Entry[] = [];
    for (let i = Math.max(0, locate(idx.blocks, k)); i < idx.blocks.length && out.length < max; i += 1) {
      const txt = await readBlock(this.bucket, this.meta, lang, 'e', idx.blocks[i]);
      let passed = false;
      for (const line of txt.split('\n')) {
        const tab = line.indexOf('\t');
        if (tab < 0) continue;
        const key = line.slice(0, tab);
        if (key.startsWith(k)) {
          try { for (const e of JSON.parse(line.slice(tab + 1)) as Entry[]) if (out.length < max) out.push(e); } catch { /* baris rusak dilewati */ }
        } else if (cmp(key, k) > 0) { passed = true; break; }
        if (out.length >= max) break;
      }
      if (passed) break;
    }
    return out;
  }

  /**
   * Pecah kalimat Jepang menjadi kata dengan pencocokan terpanjang ke kamus (entri dan bentuk berubah).
   * Blok yang dibutuhkan untuk satu posisi diambil sekaligus; blok yang sama dipakai ulang dari tembolok.
   */
  async segment(text: string, maxLen = 8): Promise<{ t: string; w?: string; e?: Entry }[]> {
    const chars = Array.from(text.normalize('NFC')).slice(0, 100);
    const out: { t: string; w?: string; e?: Entry }[] = [];
    const isWordChar = (c: string) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々〆0-9A-Za-zＡ-Ｚａ-ｚ０-９]/u.test(c);
    let i = 0;
    while (i < chars.length) {
      if (!isWordChar(chars[i])) {
        let j = i;
        while (j < chars.length && !isWordChar(chars[j])) j += 1;
        out.push({ t: chars.slice(i, j).join('') });
        i = j;
        continue;
      }
      let found: { t: string; w?: string; e?: Entry } | null = null;
      const lens: number[] = [];
      for (let len = Math.min(maxLen, chars.length - i); len >= 1; len -= 1) if (len === 1 || chars.slice(i, i + len).every(isWordChar)) lens.push(len);
      const tries = await Promise.all(lens.map(async (len) => {
        const piece = chars.slice(i, i + len).join('');
        const ex = await this.exact('ja', keyOf(piece));
        if (ex.length) return { t: piece, w: ex[0].w, e: ex[0] };
        if (len > 1) {
          const lem = await this.lemmas('ja', keyOf(piece));
          if (lem.length) {
            const e = (await this.exact('ja', keyOf(lem[0])))[0];
            if (e) return { t: piece, w: e.w, e };
          }
        }
        return null;
      }));
      found = tries.find((x) => x) ?? null;
      if (!found) found = { t: chars[i] };
      out.push(found);
      i += Array.from(found.t).length;
    }
    return out;
  }
}

/** Arti singkat dalam bahasa antarmuka; bila belum ada, arti bahasa Inggris (ml = bahasa arti yang dipakai). */
export function meaningOf(e: Entry, ui: UiLang, max = 4): { m: string[]; ml: UiLang } {
  const m = e.m ?? {};
  if (m[ui]?.length) return { m: m[ui]!.slice(0, max), ml: ui };
  if (ui === 'id' && e.idd?.length) return { m: e.idd.slice(0, max), ml: 'id' };
  if (ui === 'ja' && e.jd?.length) return { m: e.jd.slice(0, max), ml: 'ja' };
  if (m.en?.length) return { m: m.en.slice(0, max), ml: 'en' };
  const g = e.b.flatMap((b) => b.s.map((s) => s.g)).slice(0, max);
  return { m: g, ml: 'en' };
}

/** Artikel Jerman untuk kata benda. */
export const ARTICLE: Record<string, string> = { m: 'der', f: 'die', n: 'das' };

/** Jalur halaman kamus sebuah kata. */
export const entryPath = (lang: KLang, w: string) => `/kamus/${lang}/${encodeURIComponent(w)}`;
