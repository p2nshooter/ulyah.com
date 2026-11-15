/** Rute Al-Qur'an mushaf Utsmani (docs/YAPIDA-BLUEPRINT.md §5a). Teks dari aset; tafsir Kemenag disimpan di R2. */
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { origin, render, tidakAda } from '../lib/render.ts';
import { crumbs } from '../pages/layout.ts';
import { halamanMushaf, quranIndex, surahIndexJudul, surahPage, type HalamanData, type QuranMeta, type SurahData } from '../pages/quran.ts';
import { limit } from '../lib/ratelimit.ts';

export const quran = new Hono<HonoEnv>();

const aset = async <T>(c: Ctx, path: string): Promise<T | null> => {
  const r = await c.env.ASSETS.fetch(new Request(`https://aset.local/assets/quran/${path}`));
  return r.ok ? ((await r.json()) as T) : null;
};
let metaMemo: Promise<QuranMeta | null> | null = null;
const meta = (c: Ctx) => {
  if (!metaMemo) { metaMemo = aset<QuranMeta>(c, 'meta.json'); metaMemo.then((m) => { if (!m) metaMemo = null; }).catch(() => { metaMemo = null; }); }
  return metaMemo;
};
const CSS = ['quran.css'];
const JS = ['quran.js'];

quran.get('/quran', async (c) => {
  const m = await meta(c);
  if (!m) return tidakAda(c);
  const o = origin(c);
  return render(c, {
    path: '/quran', aktif: 'ibadah', css: CSS, js: JS,
    title: 'Al-Qur’an Mushaf Utsmani Online — 604 Halaman, Terjemah, Tafsir & Murottal | Yapida',
    desc: 'Baca Al-Qur’an rasm Utsmani riwayat Hafs persis mushaf Madinah 604 halaman, lengkap dengan terjemah Indonesia, tafsir Kemenag, latin, dan murottal per ayat — gratis dari Yayasan Al-Huda Yapida.',
    body: quranIndex(m),
    jsonLd: [crumbs(o, [['Al-Qur’an', '/quran']]), {
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Al-Qur’an Mushaf Utsmani', url: `${o}/quran`, inLanguage: ['ar', 'id'],
      mainEntity: { '@type': 'ItemList', numberOfItems: 114, itemListElement: m.surah.map((s) => ({ '@type': 'ListItem', position: s.n, url: `${o}/quran/${s.n}`, name: `Surat ${s.lt}` })) },
    }],
  });
});

quran.get('/quran/halaman/:p', async (c) => {
  const p = Number(c.req.param('p'));
  if (!Number.isInteger(p) || p < 1 || p > 604) return tidakAda(c);
  const [m, h] = await Promise.all([meta(c), aset<HalamanData>(c, `h/${p}.json`)]);
  if (!m || !h) return tidakAda(c);
  const nama = h.surat.map((n) => m.surah[n - 1]!.lt).join(', ');
  return render(c, {
    path: `/quran/halaman/${p}`, aktif: 'ibadah', css: CSS, js: JS, kelas: 'hal-mushaf', noAds: true,
    title: `Mushaf Al-Qur’an Halaman ${p} — ${nama} (Juz ${h.juz}) | Yapida`,
    desc: `Al-Qur’an rasm Utsmani halaman ${p} dari 604 (juz ${h.juz}): ${nama}. Ketuk ayat untuk terjemah, tafsir Kemenag, dan murottal.`,
    body: halamanMushaf(m, h),
    jsonLd: [crumbs(origin(c), [['Al-Qur’an', '/quran'], [`Halaman ${p}`, `/quran/halaman/${p}`]])],
  });
});

quran.get('/quran/juz/:j', async (c) => {
  const m = await meta(c);
  const j = m?.juz.find((x) => x.n === Number(c.req.param('j')));
  return j ? c.redirect(`/quran/halaman/${j.hal}`, 301) : tidakAda(c);
});

quran.get('/quran/:n', async (c) => {
  const n = Number(c.req.param('n'));
  if (!Number.isInteger(n) || n < 1 || n > 114) return tidakAda(c);
  const [m, d] = await Promise.all([meta(c), aset<SurahData>(c, `s/${n}.json`)]);
  if (!m || !d) return tidakAda(c);
  const s = m.surah[n - 1]!;
  const o = origin(c);
  const { title, desc } = surahIndexJudul(s);
  return render(c, {
    path: `/quran/${n}`, aktif: 'ibadah', css: CSS, js: JS, title, desc, body: surahPage(m, d),
    jsonLd: [crumbs(o, [['Al-Qur’an', '/quran'], [`Surat ${s.lt}`, `/quran/${n}`]]), {
      '@context': 'https://schema.org', '@type': 'Chapter', name: `Surat ${s.lt} (${s.ar})`, alternateName: s.id, position: n, url: `${o}/quran/${n}`, inLanguage: ['ar', 'id'],
      isPartOf: { '@type': 'Book', name: 'Al-Qur’an Al-Karim', url: `${o}/quran` },
    }],
  });
});

quran.get('/quran/:n/:a', (c) => {
  const n = Number(c.req.param('n'));
  const a = Number(c.req.param('a'));
  if (!Number.isInteger(n) || n < 1 || n > 114 || !Number.isInteger(a) || a < 1 || a > 286) return tidakAda(c);
  return c.redirect(`/quran/${n}#ayat-${a}`, 301);
});

/**
 * Tafsir Kemenag RI per surah (sumber yang sama dengan ulyah.com: equran.id). Diambil sekali lalu disimpan di R2
 * selamanya (teks klasik yang tidak berubah) — tidak di KV, tidak di D1.
 */
quran.get('/quran/api/tafsir/:n', async (c) => {
  const n = Number(c.req.param('n'));
  if (!Number.isInteger(n) || n < 1 || n > 114) return c.json({ galat: 'surah' }, 404);
  const store = c.get('store');
  const key = `k/tafsir/kemenag/${n}.json`;
  const ada = await store.get<{ sumber: string; ayat: Record<string, string> }>(key);
  if (ada) return c.json(ada, 200, { 'cache-control': 'public, max-age=86400' });
  if (!(await limit(c.env, `tafsir:${c.req.header('cf-connecting-ip') ?? 'lokal'}`, 60, 3600))) return c.json({ galat: 'batas' }, 429);
  try {
    const r = await fetch(`${c.env.EQURAN_BASE ?? 'https://equran.id'}/api/v2/tafsir/${n}`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as { data?: { tafsir?: { ayat: number; teks: string }[] } };
    const ayat: Record<string, string> = {};
    for (const t of j.data?.tafsir ?? []) if (Number.isInteger(t.ayat) && typeof t.teks === 'string') ayat[String(t.ayat)] = t.teks.replace(/\r\n?/g, '\n').trim();
    if (!Object.keys(ayat).length) throw new Error('kosong');
    const isi = { sumber: 'Tafsir Kemenag RI (equran.id)', ayat };
    await store.put(key, isi);
    return c.json(isi, 200, { 'cache-control': 'public, max-age=86400' });
  } catch {
    return c.json({ galat: 'Tafsir belum bisa dimuat. Coba lagi sebentar.' }, 503, { 'cache-control': 'no-store' });
  }
});
