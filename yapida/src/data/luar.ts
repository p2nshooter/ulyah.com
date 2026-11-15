/**
 * Katalog dunia (perintah pemilik: „cari puluhan ribu-ratusan ribu buku … dari sumber manapun yg mengizinkan“).
 *
 *  - jenius.es — situs buku bersuara milik pemilik di repositori yang sama (Standard Ebooks CC0, BSE berizin, OpenStax
 *    CC BY, …). Dipanggil lewat service binding `JENIUS` (Worker ke Worker dalam satu akun tidak bisa lewat workers.dev).
 *  - Project Gutenberg lewat Gutendex (±75.000 judul). Hanya judul yang domain publik di Indonesia — penulis dan
 *    penerjemah wafat lebih dari 70 tahun (UU 28/2014) — yang ditampilkan dan disalin.
 *
 * Buku luar disalin ke R2 saat pertama dibuka (c/luar/<id>/meta.json + satu objek per bab), jadi bacaan berikutnya
 * tidak lagi bergantung pada sumbernya. Lisensi dan sumber tampil di setiap buku.
 */
import type { Env } from '../env.ts';
import { invTs, type Store } from '../lib/store.ts';
import { batasDomainPublik, hitungKata, menitBaca, pecahPanjang, ringkasBab, type Bab, type Blok, type BukuMeta } from './buku.ts';
import type { Suara } from './model.ts';

export interface KartuLuar {
  id: string;
  judul: string;
  penulis: string;
  bahasa: string;
  rak: string[];
  suara: Suara;
  menit?: number;
  kelas?: string;
  mapel?: string;
  sumber: 'jenius' | 'gutenberg';
}

const metaKey = (id: string) => `c/luar/${id}/meta.json`;
const babKey = (id: string, n: number) => `c/luar/${id}/${n}.json`;
const UA = { 'user-agent': 'yapida.sch.id-pustaka (+https://yapida.sch.id/pustaka)' };
const JAM = 3600_000;

async function simpanSalinan(store: Store, meta: BukuMeta, bab: Bab[]): Promise<void> {
  for (const b of bab) await store.put(babKey(meta.id, b.n), b);
  await store.put(metaKey(meta.id), meta);
  await store.put(`i/luar/${invTs()}~${meta.id}`, {}, { j: meta.judul.slice(0, 120), p: meta.penulis.slice(0, 80), b: meta.bahasa, r: meta.rak.join('|'), s: meta.suara, m: meta.menit });
}

/** Buku luar yang sudah disalin (untuk daftar dan sitemap). */
export async function salinanLuar(store: Store, limit = 500): Promise<KartuLuar[]> {
  const out: KartuLuar[] = [];
  const r = await store.list<{ j: string; p: string; b: string; r: string; s: Suara; m?: number }>('i/luar/', { limit: Math.min(1000, limit) });
  for (const it of r.items) {
    if (!it.meta?.j) continue;
    out.push({ id: it.id, judul: it.meta.j, penulis: it.meta.p, bahasa: it.meta.b, rak: (it.meta.r || 'umum').split('|'), suara: it.meta.s || 'dewasa', menit: it.meta.m, sumber: it.id.startsWith('j-') ? 'jenius' : 'gutenberg' });
  }
  return out;
}

/* ── jenius.es ──────────────────────────────────────────────────────────── */

interface JeniusEntri { id: string; title: string; author: string; minutes: number; shelf: string; lang: string; picture: boolean; level?: string; grade?: number; subject?: string; lanes: string[] }
interface JeniusMeta { id: string; title: string; author: string; translator?: string; lanes: string[]; lang: string; source: string; sourceUrl: string; license: string; licenseUrl: string; attribution: string; description: string; subjects: string[]; chapters: { n: number; title: string; words: number }[]; words: number; minutes: number; picture: boolean; level?: string; grade?: number; subject?: string }
type JeniusBlok = { t: 'p' | 'h' | 'verse'; text: string } | { t: 'img'; src: string; alt: string; text?: string };

/** Jalur jenius.es → rak dan suara Yapida. */
function rakJenius(e: { lanes: string[]; level?: string; grade?: number }): { rak: string[]; suara: Suara } {
  const rak = new Set<string>();
  let suara: Suara = 'dewasa';
  const urut: Suara[] = ['balita', 'anak', 'remaja', 'dewasa'];
  const muda = (s: Suara) => { if (urut.indexOf(s) < urut.indexOf(suara)) suara = s; };
  for (const l of e.lanes) {
    if (l === 'tunas') { rak.add('ra'); rak.add('cerita'); muda('balita'); }
    else if (l === 'tumbuh') { rak.add('mi'); rak.add('cerita'); muda('anak'); }
    else if (l === 'jelajah') { rak.add('mts'); rak.add('cerita'); muda('remaja'); }
    else if (l === 'pelajaran') {
      if (e.level === 'sd') { rak.add('mi'); muda('anak'); }
      else if (e.level === 'smp') { rak.add('mts'); muda('remaja'); }
      else rak.add('umum');
    } else if (l === 'profesi') { rak.add('umum'); rak.add('guru'); }
    else if (l === 'lintas') rak.add('bahasa');
    else rak.add(l === 'santai' ? 'cerita' : 'umum');
  }
  if (!rak.size) rak.add('umum');
  return { rak: [...rak], suara };
}

async function jenius(env: Env, path: string): Promise<Response | null> {
  if (!env.JENIUS) return null;
  try {
    const r = await env.JENIUS.fetch(new Request(`https://jenius.es${path}`, { headers: UA }));
    return r.ok ? r : null;
  } catch {
    return null;
  }
}

/** Katalog jenius.es (tanpa buku bergambar), disimpan 6 jam di R2. */
export async function katalogJenius(env: Env, store: Store, now = Date.now()): Promise<KartuLuar[]> {
  const key = 'k/luar/jenius-katalog.json';
  const lama = await store.get<{ at: number; buku: KartuLuar[] }>(key);
  if (lama && now - lama.at < 6 * JAM) return lama.buku;
  const r = await jenius(env, '/api/katalog');
  if (!r) return lama?.buku ?? [];
  try {
    const j = (await r.json()) as { buku?: JeniusEntri[] };
    const buku = (j.buku ?? []).filter((e) => !e.picture && /^[a-z0-9-]{1,90}$/.test(e.id)).map((e): KartuLuar => {
      const { rak, suara } = rakJenius(e);
      return {
        id: `j-${e.id}`, judul: String(e.title).slice(0, 160), penulis: String(e.author ?? '').slice(0, 120), bahasa: e.lang === 'id' ? 'id' : 'en', rak, suara,
        menit: e.minutes, ...(e.grade ? { kelas: `Kelas ${e.grade}` } : {}), ...(e.subject ? { mapel: e.subject } : {}), sumber: 'jenius',
      };
    });
    await store.put(key, { at: now, buku });
    return buku;
  } catch {
    return lama?.buku ?? [];
  }
}

async function salinJenius(env: Env, store: Store, jid: string): Promise<BukuMeta | null> {
  const r = await jenius(env, `/api/book/${jid}`);
  if (!r) return null;
  const m = (await r.json()) as JeniusMeta;
  if (m.picture || !Array.isArray(m.chapters) || !m.chapters.length) return null;
  const en = m.lang !== 'id';
  const bab: Bab[] = [];
  for (const ch of m.chapters.slice(0, 400)) {
    const rc = await jenius(env, `/api/book/${jid}/ch/${ch.n}`);
    if (!rc) return null;
    const j = (await rc.json()) as { title: string; pages: JeniusBlok[][] };
    const blok: Blok[] = [];
    for (const b of j.pages.flat()) {
      if (b.t === 'img') { if (b.text) blok.push(...pecahPanjang({ t: en ? 'en' : 'p', x: b.text })); continue; }
      const x = b.text.replace(/\s+/g, ' ').trim();
      if (x) blok.push(...pecahPanjang({ t: b.t === 'h' ? 'h' : en ? 'en' : 'p', x }));
    }
    bab.push({ n: bab.length + 1, judul: j.title || ch.title || `Bab ${ch.n}`, blok });
  }
  const { rak, suara } = rakJenius(m);
  const kata = bab.reduce((a, b) => a + hitungKata(b.blok), 0);
  const meta: BukuMeta = {
    id: `j-${jid}`, judul: m.title, penulis: m.author, ...(m.translator ? { penerjemah: m.translator } : {}), rak, suara, bahasa: en ? 'en' : 'id',
    ...(m.grade ? { kelas: `Kelas ${m.grade}` } : {}), ...(m.subject ? { mapel: m.subject } : {}),
    ringkasan: m.description || m.attribution || '', sumber: `jenius.es · ${m.attribution || m.source}`, sumberUrl: m.sourceUrl, lisensi: m.license, lisensiUrl: m.licenseUrl,
    bab: ringkasBab(bab), kata, menit: menitBaca(kata), tag: (m.subjects ?? []).slice(0, 6),
  };
  await simpanSalinan(store, meta, bab);
  return meta;
}

/* ── Project Gutenberg (Gutendex) ───────────────────────────────────────── */

interface GOrang { name: string; birth_year: number | null; death_year: number | null }
interface GBuku { id: number; title: string; authors: GOrang[]; translators?: GOrang[]; subjects: string[]; bookshelves: string[]; languages: string[]; copyright: boolean | null; media_type: string; formats: Record<string, string>; download_count: number }

const gutendex = (env: Env) => (env.GUTENDEX_BASE ?? 'https://gutendex.com').replace(/\/$/, '');

/** Domain publik di Indonesia: semua penulis dan penerjemah diketahui tahun wafatnya dan wafat > 70 tahun lalu. */
export function domainPublikId(b: Pick<GBuku, 'authors' | 'translators' | 'copyright' | 'media_type'>, tahun = new Date().getUTCFullYear()): boolean {
  if (b.copyright === true || b.media_type !== 'Text') return false;
  const orang = [...(b.authors ?? []), ...(b.translators ?? [])];
  if (!orang.length) return false;
  return orang.every((o) => typeof o.death_year === 'number' && o.death_year <= batasDomainPublik(tahun));
}

const namaOrang = (n: string) => { const [b, d] = n.split(/,\s*/); return d ? `${d} ${b}` : n; };

function rakGutenberg(b: GBuku): { rak: string[]; suara: Suara } {
  const s = [...b.subjects, ...b.bookshelves].join(' ').toLowerCase();
  if (/juvenile|children|fairy tales|nursery/.test(s)) return { rak: ['cerita', 'mi'], suara: 'anak' };
  if (/islam|koran|qur|muhammad|arab/.test(s)) return { rak: ['hadits', 'umum'], suara: 'dewasa' };
  if (/education|teaching|pedagog/.test(s)) return { rak: ['guru', 'umum'], suara: 'dewasa' };
  if (/fiction|stories|poetry|drama|adventure/.test(s)) return { rak: ['cerita'], suara: 'remaja' };
  return { rak: ['umum'], suara: 'dewasa' };
}

function kartuG(b: GBuku): KartuLuar {
  const { rak, suara } = rakGutenberg(b);
  return { id: `g-${b.id}`, judul: b.title.slice(0, 160), penulis: b.authors.map((a) => namaOrang(a.name)).join(', ').slice(0, 120), bahasa: b.languages[0] === 'id' ? 'id' : b.languages[0] ?? 'en', rak, suara, sumber: 'gutenberg' };
}

export interface HasilDunia { jumlah: number; buku: KartuLuar[]; berikut: boolean }

/** Mencari di Project Gutenberg (bahasa Inggris & Indonesia), hasil disimpan sehari di R2. */
export async function cariGutenberg(env: Env, store: Store, q: string, hal = 1, now = Date.now()): Promise<HasilDunia> {
  const kueri = q.trim().slice(0, 80);
  const h = Math.max(1, Math.min(50, Math.floor(hal) || 1));
  const kunci = `k/luar/cari/${encodeURIComponent(kueri.toLowerCase()).slice(0, 120) || '_populer'}~${h}.json`;
  const lama = await store.get<{ at: number; hasil: HasilDunia }>(kunci);
  if (lama && now - lama.at < 24 * JAM) return lama.hasil;
  const u = new URL(`${gutendex(env)}/books/`);
  if (kueri) u.searchParams.set('search', kueri);
  u.searchParams.set('languages', 'en,id');
  u.searchParams.set('mime_type', 'text/plain');
  if (h > 1) u.searchParams.set('page', String(h));
  try {
    const r = await fetch(u.toString(), { headers: UA, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as { count: number; next: string | null; results: GBuku[] };
    const hasil: HasilDunia = { jumlah: j.count, buku: j.results.filter((b) => domainPublikId(b)).map(kartuG), berikut: Boolean(j.next) };
    await store.put(kunci, { at: now, hasil });
    return hasil;
  } catch {
    return lama?.hasil ?? { jumlah: 0, buku: [], berikut: false };
  }
}

/** Teks polos Gutenberg → bab: kepala & kaki lisensi PG dibuang, bab dikenali dari judul CHAPTER/BOOK/PART/BAB. */
export function uraiTeksGutenberg(teks: string, bahasa: string): Bab[] {
  let t = teks.replace(/\r\n?/g, '\n');
  const awal = t.search(/^\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG.*$/m);
  if (awal >= 0) t = t.slice(t.indexOf('\n', awal) + 1);
  const akhir = t.search(/^\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG/m);
  if (akhir >= 0) t = t.slice(0, akhir);
  const jenis: Blok['t'] = bahasa === 'id' ? 'p' : 'en';
  const paragraf = t.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter((p) => p && !/^(produced by|end of (the )?project gutenberg|transcriber'?s note)/i.test(p));
  const JUDUL = /^(chapter|book|part|bab|letter|stave|canto)\s+([0-9]+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten|[a-z]+teen|twenty[a-z-]*|thirty[a-z-]*)\b[.:—-]?.{0,80}$/i;
  const bab: Bab[] = [];
  let cur: Bab = { n: 1, judul: 'Awal', blok: [] };
  for (const p of paragraf) {
    if (p.length < 100 && JUDUL.test(p)) {
      if (cur.blok.length || bab.length) { if (cur.blok.length) bab.push(cur); }
      cur = { n: bab.length + 1, judul: p.replace(/\s+/g, ' '), blok: [] };
      continue;
    }
    cur.blok.push(...pecahPanjang({ t: jenis, x: p }));
  }
  if (cur.blok.length) bab.push(cur);
  // Tanpa judul bab yang dikenali: dipotong per ±2.500 kata di batas paragraf.
  if (bab.length < 2) {
    const semua = bab.flatMap((b) => b.blok);
    const out: Bab[] = [];
    let buf: Blok[] = [];
    let kata = 0;
    for (const b of semua) {
      buf.push(b);
      kata += b.x.split(/\s+/).length;
      if (kata >= 2500) { out.push({ n: out.length + 1, judul: `Bagian ${out.length + 1}`, blok: buf }); buf = []; kata = 0; }
    }
    if (buf.length) out.push({ n: out.length + 1, judul: `Bagian ${out.length + 1}`, blok: buf });
    return out.slice(0, 400);
  }
  return bab.slice(0, 400).map((b, i) => ({ ...b, n: i + 1 }));
}

async function salinGutenberg(env: Env, store: Store, gid: number): Promise<BukuMeta | null> {
  const r = await fetch(`${gutendex(env)}/books/${gid}/`, { headers: UA, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null;
  const b = (await r.json()) as GBuku;
  if (!domainPublikId(b)) return null;
  const url = b.formats['text/plain; charset=utf-8'] ?? b.formats['text/plain; charset=us-ascii'] ?? b.formats['text/plain'] ?? Object.entries(b.formats).find(([k]) => k.startsWith('text/plain'))?.[1];
  if (!url) return null;
  const asal = new URL(url);
  if (asal.protocol !== 'https:' && asal.protocol !== 'http:') return null;
  if (!/(^|\.)gutenberg\.org$/.test(asal.hostname) && !(env.GUTENBERG_BASE && url.startsWith(env.GUTENBERG_BASE))) return null;
  const rt = await fetch(asal.toString().replace(/^http:/, 'https:'), { headers: UA, signal: AbortSignal.timeout(15000) });
  if (!rt.ok) return null;
  const teks = (await rt.text()).slice(0, 6_000_000);
  const bahasa = b.languages[0] === 'id' ? 'id' : b.languages[0] ?? 'en';
  const bab = uraiTeksGutenberg(teks, bahasa);
  if (!bab.length) return null;
  const { rak, suara } = rakGutenberg(b);
  const kata = bab.reduce((a, x) => a + hitungKata(x.blok), 0);
  const penulis = b.authors.map((a) => `${namaOrang(a.name)}${a.death_year ? ` (w. ${a.death_year})` : ''}`).join(', ');
  const meta: BukuMeta = {
    id: `g-${gid}`, judul: b.title, penulis, ...(b.translators?.length ? { penerjemah: b.translators.map((a) => namaOrang(a.name)).join(', ') } : {}), rak, suara, bahasa,
    ringkasan: `${b.subjects.slice(0, 4).join(' · ') || 'Karya klasik domain publik'}.`, sumber: 'Project Gutenberg (gutenberg.org) — teks domain publik', sumberUrl: `https://www.gutenberg.org/ebooks/${gid}`,
    lisensi: 'Domain publik di Indonesia (penulis & penerjemah wafat > 70 tahun)', bab: ringkasBab(bab), kata, menit: menitBaca(kata), tag: b.subjects.slice(0, 6),
  };
  await simpanSalinan(store, meta, bab);
  return meta;
}

/* ── akses bersama ──────────────────────────────────────────────────────── */

const sedang = new Map<string, Promise<BukuMeta | null>>();

/** Metadata buku luar; disalin dari sumbernya bila belum ada di R2. */
export async function bukuLuar(env: Env, store: Store, id: string): Promise<BukuMeta | null> {
  const ada = await store.get<BukuMeta>(metaKey(id));
  if (ada) return ada;
  let p = sedang.get(id);
  if (!p) {
    const jm = /^j-([a-z0-9-]{1,90})$/.exec(id);
    const gm = /^g-(\d{1,7})$/.exec(id);
    p = (jm ? salinJenius(env, store, jm[1]!) : gm ? salinGutenberg(env, store, Number(gm[1])) : Promise.resolve(null)).catch(() => null);
    sedang.set(id, p);
    p.finally(() => sedang.delete(id)).catch(() => undefined);
  }
  return p;
}

export async function babLuar(store: Store, id: string, n: number): Promise<Bab | null> {
  if (!Number.isInteger(n) || n < 1 || n > 400) return null;
  return store.get<Bab>(babKey(id, n));
}
