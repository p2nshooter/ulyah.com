/** Rute perpustakaan digital (docs/YAPIDA-BLUEPRINT.md §5). */
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { asalSama } from '../lib/session.ts';
import { kecil, media, origin, render, tidakAda } from '../lib/render.ts';
import { crumbs } from '../pages/layout.ts';
import { listUnits } from '../data/site.ts';
import { RAK, RAK_ID, type BukuMeta } from '../data/buku.ts';
import { hidupkanBab } from '../data/aktif.ts';
import { ambilBab, ambilBuku, cocok, katalog, urutkan, type KartuBuku } from '../data/pustaka.ts';
import { cariGutenberg, katalogJenius } from '../data/luar.ts';
import { catatBaca, peringkat, sepuluh, setelSuka, sudahSuka } from '../data/statistik.ts';
import { limit } from '../lib/ratelimit.ts';
import { b64url } from '../lib/crypto.ts';
import { bukuDetail, duniaPage, lembagaPustaka, pembacaPage, pustakaBeranda, rakPage, rakUntukUnit, type PCtx } from '../pages/pustaka.ts';

export const pustaka = new Hono<HonoEnv>();

const ID_RE = /^[a-z]-[A-Za-z0-9_-]{1,80}$/;
const PENGUNJUNG = '__Host-ypv';

async function pctx(c: Ctx): Promise<PCtx> {
  return { media: media(c), kecil, units: await listUnits(c.get('store')) };
}
const tunda = (c: Ctx) => (p: Promise<unknown>) => { try { c.executionCtx.waitUntil(p); } catch { /* uji: tanpa ExecutionContext */ } };
const ip = (c: Ctx) => c.req.header('cf-connecting-ip') ?? 'lokal';

const ldBuku = (o: string, b: BukuMeta) => ({
  '@context': 'https://schema.org', '@type': 'Book', '@id': `${o}/pustaka/b/${b.id}`, name: b.judul, author: { '@type': 'Person', name: b.penulis },
  inLanguage: b.bahasa, numberOfPages: b.bab.length, description: b.ringkasan.slice(0, 300), isAccessibleForFree: true, license: b.lisensiUrl ?? b.lisensi,
  publisher: { '@id': `${o}/#yayasan` }, ...(b.sumberUrl ? { isBasedOn: b.sumberUrl } : {}),
  potentialAction: { '@type': 'ReadAction', target: `${o}/pustaka/b/${b.id}/1` },
});

/* ── beranda pustaka ────────────────────────────────────────────────────── */

pustaka.get('/pustaka', async (c) => {
  const store = c.get('store');
  const [x, kat, pk] = await Promise.all([pctx(c), katalog(c.env, store), peringkat(store, Date.now(), tunda(c))]);
  const ada = (id: string) => kat.peta.has(id);
  const top = (peta: Record<string, number>) => sepuluh(peta, ada).map(({ id, n }) => ({ b: kat.peta.get(id)!, n }));
  const dunia = await cariGutenberg(c.env, store, '', 1).catch(() => ({ jumlah: 0, buku: [], berikut: false }));
  const rak = RAK.map((r) => ({ r, buku: urutkan(kat.semua.filter((b) => b.rak.includes(r.id)), kat.atur) }));
  const unggulan = [...kat.atur.unggulan.map((id) => kat.peta.get(id)).filter((b): b is KartuBuku => Boolean(b)), ...kat.semua.filter((b) => b.asal === 'bawaan')].slice(0, 5);
  const o = origin(c);
  return render(c, {
    path: '/pustaka', title: 'Perpustakaan Digital Bersuara — Pustaka Yapida | Yayasan Al-Huda Yapida',
    desc: `Perpustakaan digital Yayasan Al-Huda Yapida Sukakarya: ${kat.semua.length} buku untuk RA, MI, MTs, pesantren, TPQ, dan guru — kitab, doa, cerita, dan buku pelajaran yang bisa dibacakan dalam bahasa Arab, Inggris, dan Indonesia.`,
    body: pustakaBeranda({ jumlah: kat.semua.length, jumlahBab: kat.jumlahBab, dunia: dunia.jumlah, baca: top(pk.baca), suka: top(pk.suka), rak, unggulan }, x),
    aktif: 'belajar', css: ['pustaka.css'], js: ['suara.js', 'pustaka.js'],
    jsonLd: [crumbs(o, [['Perpustakaan', '/pustaka']]), {
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Pustaka Yapida', url: `${o}/pustaka`, inLanguage: 'id', isPartOf: { '@id': `${o}/#situs` },
      mainEntity: { '@type': 'ItemList', numberOfItems: Math.min(30, kat.semua.length), itemListElement: kat.semua.filter((b) => b.asal !== 'gutenberg').slice(0, 30).map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${o}/pustaka/b/${b.id}`, name: b.judul })) },
    }],
  });
});

pustaka.get('/pustaka/rak/:rak', async (c) => {
  const r = RAK_ID[c.req.param('rak')];
  if (!r) return tidakAda(c);
  const [x, kat] = await Promise.all([pctx(c), katalog(c.env, c.get('store'))]);
  let buku = urutkan(kat.semua.filter((b) => b.rak.includes(r.id)), kat.atur);
  const kelas = [...new Set(buku.flatMap((b) => (b.kelas ? b.kelas.split(/,\s*/) : [])))].sort((a, b) => a.localeCompare(b, 'id', { numeric: true }));
  const pilih = c.req.query('kelas') ?? '';
  if (pilih && kelas.includes(pilih)) buku = buku.filter((b) => b.kelas?.split(/,\s*/).includes(pilih));
  const mapel = [...new Set(buku.map((b) => b.mapel).filter((m): m is string => Boolean(m)))].sort((a, b) => a.localeCompare(b, 'id'));
  const pilihMapel = c.req.query('mapel') ?? '';
  if (pilihMapel && mapel.includes(pilihMapel)) buku = buku.filter((b) => b.mapel === pilihMapel);
  const PER = 48;
  const total = buku.length;
  const hal = Math.max(1, Math.min(Math.ceil(total / PER) || 1, Number(c.req.query('hal') ?? 1) || 1));
  buku = buku.slice((hal - 1) * PER, hal * PER);
  const o = origin(c);
  return render(c, {
    path: `/pustaka/rak/${r.id}`, title: `${r.nama} — Pustaka Yapida`, desc: `${r.ringkas} ${buku.length} buku di rak ${r.nama} Perpustakaan Yayasan Al-Huda Yapida, semuanya bisa dibacakan.`,
    body: rakPage(`${r.ikon} ${r.nama}`, r.ringkas, [['Perpustakaan', '/pustaka'], [r.nama, `/pustaka/rak/${r.id}`]], buku, x, { kelas, pilihKelas: kelas.includes(pilih) ? pilih : '', mapel, pilihMapel: mapel.includes(pilihMapel) ? pilihMapel : '', dasar: `/pustaka/rak/${r.id}`, hal, total, perHal: PER }),
    noindex: hal > 1 || Boolean(pilihMapel),
    aktif: 'belajar', css: ['pustaka.css'], js: ['pustaka.js'], jsonLd: [crumbs(o, [['Perpustakaan', '/pustaka'], [r.nama, `/pustaka/rak/${r.id}`]])],
  });
});

pustaka.get('/pustaka/lembaga/:slug', async (c) => {
  const [x, kat] = await Promise.all([pctx(c), katalog(c.env, c.get('store'))]);
  const u = x.units.find((y) => y.slug === c.req.param('slug'));
  if (!u) return tidakAda(c);
  const milik = urutkan(kat.semua.filter((b) => b.unit === u.slug), kat.atur);
  const rak = rakUntukUnit(u.slug).map((r) => ({ r, buku: urutkan(kat.semua.filter((b) => b.rak.includes(r.id) && b.unit !== u.slug), kat.atur, u.slug) }));
  return render(c, {
    path: `/pustaka/lembaga/${u.slug}`, title: `Rak ${u.singkat} — Pustaka Yapida`, desc: `Buku bacaan dan tulisan ${u.nama} di perpustakaan digital Yayasan Al-Huda Yapida, bisa dibacakan.`,
    body: lembagaPustaka(u, rak, milik, x), aktif: 'belajar', css: ['pustaka.css'], js: ['pustaka.js'],
    jsonLd: [crumbs(origin(c), [['Perpustakaan', '/pustaka'], [u.singkat, `/pustaka/lembaga/${u.slug}`]])],
  });
});

pustaka.get('/pustaka/cari', async (c) => {
  const q = (c.req.query('q') ?? '').trim().slice(0, 80);
  const [x, kat] = await Promise.all([pctx(c), katalog(c.env, c.get('store'))]);
  const buku = q ? urutkan(kat.semua.filter((b) => cocok(b, q)), kat.atur).slice(0, 120) : [];
  return render(c, {
    path: '/pustaka/cari', title: q ? `Cari “${q}” — Pustaka Yapida` : 'Cari buku — Pustaka Yapida', desc: 'Cari buku di Perpustakaan Digital Yayasan Al-Huda Yapida.',
    body: rakPage(q ? `Hasil “${q}”` : 'Cari buku', q ? `${buku.length} buku cocok. Tidak menemukan? Coba Katalog Dunia.` : 'Ketik judul, penulis, mata pelajaran, atau kelas.', [['Perpustakaan', '/pustaka'], ['Cari', '/pustaka/cari']], buku, x, { q }),
    aktif: 'belajar', css: ['pustaka.css'], js: ['pustaka.js'], noindex: true,
  });
});

pustaka.get('/pustaka/dunia', async (c) => {
  const q = (c.req.query('q') ?? '').trim().slice(0, 80);
  const hal = Math.max(1, Math.min(50, Number(c.req.query('hal') ?? 1) || 1));
  const store = c.get('store');
  const [x, hasil, jen] = await Promise.all([pctx(c), cariGutenberg(c.env, store, q, hal), katalogJenius(c.env, store)]);
  const jenSaring = (q ? jen.filter((b) => cocok({ ...b, asal: 'jenius' } as KartuBuku, q)) : jen).slice(0, 18).map((b) => ({ ...b, asal: 'jenius' as const }));
  return render(c, {
    path: '/pustaka/dunia', title: q ? `“${q}” di Katalog Dunia — Pustaka Yapida` : 'Katalog Dunia: buku domain publik — Pustaka Yapida',
    desc: 'Puluhan ribu karya domain publik dari Project Gutenberg dan buku bersuara jenius.es, dibaca dan dibacakan langsung di Perpustakaan Yayasan Al-Huda Yapida.',
    body: duniaPage(q, { ...hasil, buku: hasil.buku.map((b) => ({ ...b, asal: 'gutenberg' as const })), hal }, jenSaring, x),
    aktif: 'belajar', css: ['pustaka.css'], js: ['pustaka.js'], noindex: Boolean(q) || hal > 1,
  });
});

/* ── buku & pembaca ─────────────────────────────────────────────────────── */

pustaka.get('/pustaka/b/:id', async (c) => {
  const id = c.req.param('id');
  if (!ID_RE.test(id)) return tidakAda(c);
  const store = c.get('store');
  const [x, m, kat, pk] = await Promise.all([pctx(c), ambilBuku(c.env, store, id), katalog(c.env, store), peringkat(store, Date.now(), tunda(c))]);
  if (!m) return tidakAda(c);
  // Halaman boleh disimpan cache publik: keadaan „suka“ pengunjung diambil skrip lewat /pustaka/api/suka/:id.
  const asal = kat.peta.get(id)?.asal ?? (id.startsWith('g-') ? 'gutenberg' : id.startsWith('j-') ? 'jenius' : id.startsWith('p-') ? 'lembaga' : 'bawaan');
  const serak = urutkan(kat.semua.filter((b) => b.id !== id && b.rak.some((r) => m.rak[0] === r)), kat.atur).slice(0, 14);
  const o = origin(c);
  return render(c, {
    path: `/pustaka/b/${id}`, title: `${m.judul}${m.judulAr ? ` (${m.judulAr})` : ''} — ${m.penulis.slice(0, 40)} | Pustaka Yapida`,
    desc: `${m.ringkasan.slice(0, 120)} ${m.bab.length} bab, ±${m.menit} menit — baca dan dengarkan gratis di Pustaka Yapida.`.trim(),
    body: bukuDetail(m, asal, x, { baca: pk.baca[id] ?? 0, suka: pk.suka[id] ?? 0, disukai: false, serak, unitNama: m.unit ? x.units.find((u) => u.slug === m.unit)?.singkat : undefined }),
    aktif: 'belajar', css: ['pustaka.css'], js: ['pustaka.js'], ogType: 'book',
    jsonLd: [crumbs(o, [['Perpustakaan', '/pustaka'], [m.judul.slice(0, 60), `/pustaka/b/${id}`]]), ldBuku(o, m)],
  });
});

pustaka.get('/pustaka/b/:id/:n', async (c) => {
  const id = c.req.param('id');
  const n = Number(c.req.param('n'));
  if (!ID_RE.test(id) || !Number.isInteger(n) || n < 1) return tidakAda(c);
  const store = c.get('store');
  const [x, m] = await Promise.all([pctx(c), ambilBuku(c.env, store, id)]);
  if (!m) return tidakAda(c);
  const bab = await ambilBab(c.env, store, id, n);
  if (!bab) return tidakAda(c);
  const o = origin(c);
  return render(c, {
    path: `/pustaka/b/${id}/${n}`, title: `${bab.judul} — ${m.judul} (bab ${n}) | Pustaka Yapida`,
    desc: `Baca dan dengarkan bab ${n} “${bab.judul}” dari ${m.judul} karya ${m.penulis.slice(0, 60)} di Perpustakaan Digital Yayasan Al-Huda Yapida.`,
    body: pembacaPage(m, bab, x), aktif: 'belajar', noAds: true, kelas: 'hal-baca', css: ['pustaka.css'], js: ['suara.js', 'adegan.js', 'pustaka.js'],
    jsonLd: [crumbs(o, [['Perpustakaan', '/pustaka'], [m.judul.slice(0, 60), `/pustaka/b/${id}`], [`Bab ${n}`, `/pustaka/b/${id}/${n}`]])],
  });
});

/** Bab berikutnya untuk pembaca (lanjut otomatis tanpa memuat ulang halaman, agar suara tidak terputus). */
pustaka.get('/pustaka/api/b/:id/:n', async (c) => {
  const id = c.req.param('id');
  const n = Number(c.req.param('n'));
  if (!ID_RE.test(id) || !Number.isInteger(n) || n < 1) return c.json({ error: 'tidak ada' }, 404);
  const [bab, meta] = await Promise.all([ambilBab(c.env, c.get('store'), id, n), ambilBuku(c.env, c.get('store'), id)]);
  if (!bab || !meta) return c.json({ error: 'tidak ada' }, 404);
  return c.json(hidupkanBab(bab, meta), 200, { 'cache-control': id.startsWith('p-') ? 'no-store' : 'public, max-age=3600' });
});

async function bacaJson(c: Ctx): Promise<{ id?: unknown; suka?: unknown }> {
  try { return (await c.req.json()) as { id?: unknown; suka?: unknown }; } catch { return {}; }
}

pustaka.post('/pustaka/api/baca', async (c) => {
  if (!asalSama(c)) return c.json({ error: 'asal' }, 403);
  const { id } = await bacaJson(c);
  if (typeof id !== 'string' || !ID_RE.test(id)) return c.json({ error: 'id' }, 400);
  if (!(await limit(c.env, `baca:${ip(c)}`, 120, 3600))) return c.json({ ok: true, dibatasi: true }, 200);
  const store = c.get('store');
  if (!(await ambilBuku(c.env, store, id))) return c.json({ error: 'tidak ada' }, 404);
  await catatBaca(store, id);
  return c.json({ ok: true });
});

pustaka.post('/pustaka/api/suka', async (c) => {
  if (!asalSama(c)) return c.json({ error: 'asal' }, 403);
  const { id, suka } = await bacaJson(c);
  if (typeof id !== 'string' || !ID_RE.test(id) || typeof suka !== 'boolean') return c.json({ error: 'isian' }, 400);
  if (!(await limit(c.env, `suka:${ip(c)}`, 60, 3600))) return c.json({ error: 'batas' }, 429);
  const store = c.get('store');
  if (!(await ambilBuku(c.env, store, id))) return c.json({ error: 'tidak ada' }, 404);
  let v = getCookie(c, PENGUNJUNG) ?? '';
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(v)) {
    v = b64url(crypto.getRandomValues(new Uint8Array(18)));
    setCookie(c, PENGUNJUNG, v, { path: '/', secure: true, httpOnly: true, sameSite: 'Lax', maxAge: 400 * 86_400 });
  }
  const akhir = await setelSuka(store, id, v, suka);
  const pk = await peringkat(store, Date.now(), tunda(c));
  return c.json({ ok: true, suka: akhir, n: pk.suka[id] ?? 0 });
});

/** Keadaan suka pengunjung untuk satu buku (halaman pembaca memakainya). */
pustaka.get('/pustaka/api/suka/:id', async (c) => {
  const id = c.req.param('id');
  if (!ID_RE.test(id)) return c.json({ suka: false });
  const v = getCookie(c, PENGUNJUNG) ?? '';
  return c.json({ suka: v ? await sudahSuka(c.get('store'), id, v) : false }, 200, { 'cache-control': 'no-store' });
});

/**
 * Gambar buku cerita bergambar Book Dash (github.com/bookdash/bookdash-books, CC BY 4.0): diambil sekali dari GitHub lalu
 * disimpan di bucket media R2 Yapida; sesudahnya dilayani dari R2. Hanya gambar raster (tanpa SVG).
 */
pustaka.get('/pustaka/m/:id/:file', async (c) => {
  const id = c.req.param('id');
  const file = c.req.param('file');
  if (!/^bd-[a-z0-9-]{1,90}$/.test(id) || !/^[\w-]{1,100}\.(jpg|jpeg|png|webp|gif)$/i.test(file)) return c.notFound();
  const key = `pustaka/${id}/${file}`;
  const kepala = (tipe: string) => ({ 'content-type': tipe, 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' });
  const ada = await c.env.MEDIA.get(key);
  if (ada) return new Response(ada.body, { headers: kepala(ada.httpMetadata?.contentType ?? 'image/jpeg') });
  try {
    const r = await fetch(`https://raw.githubusercontent.com/bookdash/bookdash-books/gh-pages/${id.slice(3)}/en/images/${file}`, { headers: { 'user-agent': 'yapida.sch.id-pustaka' }, signal: AbortSignal.timeout(10000) });
    const tipe = (r.headers.get('content-type') ?? '').split(';')[0]!.trim();
    if (!r.ok || !/^image\/(jpeg|png|webp|gif)$/.test(tipe)) return c.notFound();
    const isi = await r.arrayBuffer();
    if (isi.byteLength > 6 * 1024 * 1024) return c.notFound();
    await c.env.MEDIA.put(key, isi, { httpMetadata: { contentType: tipe } });
    return new Response(isi, { headers: kepala(tipe) });
  } catch {
    return c.notFound();
  }
});
