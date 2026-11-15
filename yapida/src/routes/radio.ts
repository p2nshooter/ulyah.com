/** API Radio Qur'an LIVE (§5c): posisi siaran saat ini untuk semua pendengar. */
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { alamatBerkas, daftarQari, pilihQari, siaran } from '../data/radio.ts';

export const radio = new Hono<HonoEnv>();

let namaSurah: Promise<{ n: number; ar: string; lt: string; id: string }[]> | null = null;
const surahMeta = (c: Ctx) => {
  if (!namaSurah) {
    namaSurah = c.env.ASSETS.fetch(new Request('https://aset.local/assets/quran/meta.json'))
      .then(async (r) => (r.ok ? ((await r.json()) as { surah: { n: number; ar: string; lt: string; id: string }[] }).surah : []))
      .catch(() => []);
    namaSurah.then((x) => { if (!x.length) namaSurah = null; }).catch(() => { namaSurah = null; });
  }
  return namaSurah;
};

radio.get('/api/radio', async (c) => {
  const store = c.get('store');
  const now = Date.now();
  const [r, meta] = await Promise.all([siaran(c.env, store, now), surahMeta(c)]);
  if (!r) return c.json({ live: false }, 503, { 'cache-control': 'no-store' });
  const { s, q } = r;
  const sn = (n: number) => { const m = meta[n - 1]; return m ? { n, lt: m.lt, ar: m.ar, arti: m.id } : { n, lt: `Surah ${n}`, ar: '', arti: '' }; };
  const daftar = await daftarQari(c.env, store, now);
  const berikutN = s.surah >= 114 ? 1 : s.surah + 1;
  const berikutQ = pilihQari(daftar, s.surah >= 114 ? s.putaran + 1 : s.putaran, berikutN, s.qari);
  return c.json({
    live: true, sekarang: now, mulai: s.mulai, durasi: s.durasi, url: alamatBerkas(q, s.surah),
    qari: { nama: q.nama, namaAr: q.namaAr ?? '' }, surah: sn(s.surah), putaran: s.putaran, khatam: s.khatam, mulaiRadio: s.mulaiRadio,
    berikut: { surah: sn(berikutN), qari: berikutQ.nama }, jumlahQari: daftar.length,
  }, 200, { 'cache-control': 'no-store' });
});
