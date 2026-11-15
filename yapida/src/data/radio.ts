/**
 * Radio Qur'an LIVE 24 jam (docs/YAPIDA-BLUEPRINT.md §5c, perintah pemilik 10).
 *
 * Mesinnya di server dan tidak pernah berhenti: siaran adalah garis waktu. Satu putaran = surah 1 sampai 114 berurutan
 * = satu khatam; setiap surah dibacakan qari yang dipilih acak (deterministik dari nomor putaran + surah) dari daftar qari
 * seluruh dunia (mp3quran.net, riwayat Hafs, 114 surah lengkap). Durasi berkas dibaca dari kepala MP3 dan disimpan di R2,
 * jadi semua pendengar mendengar posisi yang sama. Keadaan siaran maju setiap menit (detak cron lewat RPC) dan setiap kali
 * ada pendengar bertanya — ditulis compare-and-swap, satu kunci, paling sering sekali per surah.
 *
 *   k/radio/qari.json                 daftar qari (diperbarui sehari sekali; cadangan bawaan bila sumber tidak terjangkau)
 *   k/radio/durasi/<qari>/<surah>.json durasi berkas (detik), tetap
 *   k/radio/siaran.json               keadaan siaran: putaran, surah, qari, mulai, durasi, khatam
 */
import type { Env } from '../env.ts';
import type { Store } from '../lib/store.ts';

export interface Qari { id: string; nama: string; namaAr?: string; server: string; riwayat: string }
export interface Siaran { v: 1; mulaiRadio: number; putaran: number; surah: number; qari: string; mulai: number; durasi: number; khatam: number; ubah: number }

const JEDA_MS = 2500; // jeda antar surah
const UA = { 'user-agent': 'yapida.sch.id-radio (+https://yapida.sch.id/radio-quran)' };

/** Cadangan bila mp3quran.net tidak terjangkau: berkas per surah di cdn.islamic.network (128 kbps). */
export const QARI_CADANGAN: Qari[] = [
  { id: 'in-alafasy', nama: 'Mishary Rasyid Al-Afasy', namaAr: 'مشاري راشد العفاسي', server: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/', riwayat: 'Hafs' },
  { id: 'in-abdulbasit', nama: 'Abdul Basit Abdus Samad', namaAr: 'عبد الباسط عبد الصمد', server: 'https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/', riwayat: 'Hafs' },
  { id: 'in-basfar', nama: 'Abdullah Basfar', namaAr: 'عبد الله بصفر', server: 'https://cdn.islamic.network/quran/audio-surah/128/ar.abdullahbasfar/', riwayat: 'Hafs' },
];
const berkasCadangan = (q: Qari, s: number) => `${q.server}${s}.mp3`;
const berkasMp3quran = (q: Qari, s: number) => `${q.server}${String(s).padStart(3, '0')}.mp3`;
export const alamatBerkas = (q: Qari, s: number) => (q.id.startsWith('in-') ? berkasCadangan(q, s) : berkasMp3quran(q, s));

interface Mp3QuranReciter { id: number; name: string; moshaf: { id: number; name: string; server: string; surah_total: number; moshaf_type?: number }[] }

/** Daftar qari seluruh dunia (mp3quran.net API v3): hanya mushaf Hafs ‘an ‘Ashim murattal dengan 114 surah lengkap. */
export async function daftarQari(env: Env, store: Store, now = Date.now()): Promise<Qari[]> {
  const key = 'k/radio/qari.json';
  const lama = await store.get<{ at: number; qari: Qari[] }>(key);
  if (lama && lama.qari.length && now - lama.at < 24 * 3600_000) return lama.qari;
  const base = (env.MP3QURAN_BASE ?? 'https://mp3quran.net').replace(/\/$/, '');
  try {
    const [en, ar] = await Promise.all(['eng', 'ar'].map(async (l) => {
      const r = await fetch(`${base}/api/v3/reciters?language=${l}`, { headers: UA, signal: AbortSignal.timeout(8000) });
      if (!r.ok) throw new Error(String(r.status));
      return ((await r.json()) as { reciters?: Mp3QuranReciter[] }).reciters ?? [];
    }));
    const namaAr = new Map(ar!.map((x) => [x.id, x.name]));
    const qari: Qari[] = [];
    for (const r of en!) {
      const m = r.moshaf.find((x) => x.surah_total === 114 && /hafs/i.test(x.name) && !/mujawwad|warsh|qalon|qaloon|duri|susi|buzzi|qunbul|teacher|ta.?lim/i.test(x.name));
      if (!m) continue;
      let server: URL;
      try { server = new URL(m.server); } catch { continue; }
      if (server.protocol !== 'https:' || !/(^|\.)mp3quran\.net$/.test(server.hostname)) continue;
      qari.push({ id: `mq-${r.id}-${m.id}`, nama: r.name.trim(), namaAr: namaAr.get(r.id)?.trim(), server: server.href.endsWith('/') ? server.href : `${server.href}/`, riwayat: 'Hafs' });
    }
    if (qari.length < 5) throw new Error('daftar qari terlalu sedikit');
    await store.put(key, { at: now, qari });
    return qari;
  } catch {
    return lama?.qari.length ? lama.qari : QARI_CADANGAN;
  }
}

/* ── durasi dari kepala MP3 ─────────────────────────────────────────────── */

const BITRATE: Record<string, number[]> = {
  '1-1': [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
  '1-2': [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  '1-3': [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  '2-1': [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
  '2-2': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const SAMPLE: Record<number, number[]> = { 1: [44100, 48000, 32000], 2: [22050, 24000, 16000], 25: [11025, 12000, 8000] };

/** Durasi (detik) dari potongan awal berkas MP3 dan ukuran totalnya: Xing/Info atau VBRI bila ada, selain itu CBR. */
export function durasiMp3(b: Uint8Array, total: number): number | null {
  let i = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6]! & 0x7f) << 21 | (b[7]! & 0x7f) << 14 | (b[8]! & 0x7f) << 7 | (b[9]! & 0x7f)) + ((b[5]! & 0x10) ? 10 : 0);
  for (; i + 4 < b.length; i += 1) {
    if (b[i] !== 0xff || (b[i + 1]! & 0xe0) !== 0xe0) continue;
    const verBits = (b[i + 1]! >> 3) & 3, layerBits = (b[i + 1]! >> 1) & 3;
    const ver = verBits === 3 ? 1 : verBits === 2 ? 2 : verBits === 0 ? 25 : 0;
    const layer = layerBits === 1 ? 3 : layerBits === 2 ? 2 : layerBits === 3 ? 1 : 0;
    const brIdx = (b[i + 2]! >> 4) & 15, srIdx = (b[i + 2]! >> 2) & 3;
    if (!ver || !layer || brIdx === 0 || brIdx === 15 || srIdx === 3) continue;
    const tabel = ver === 1 ? BITRATE[`1-${layer}`] : BITRATE[layer === 1 ? '2-1' : '2-2'];
    const kbps = tabel![brIdx]!, sr = SAMPLE[ver]![srIdx]!;
    const mono = ((b[i + 3]! >> 6) & 3) === 3;
    const sampel = layer === 1 ? 384 : layer === 2 ? 1152 : ver === 1 ? 1152 : 576;
    const side = ver === 1 ? (mono ? 17 : 32) : (mono ? 9 : 17);
    const x = i + 4 + side;
    const tag = String.fromCharCode(b[x] ?? 0, b[x + 1] ?? 0, b[x + 2] ?? 0, b[x + 3] ?? 0);
    if ((tag === 'Xing' || tag === 'Info') && (b[x + 7]! & 1)) {
      const frames = (b[x + 8]! << 24 | b[x + 9]! << 16 | b[x + 10]! << 8 | b[x + 11]!) >>> 0;
      if (frames > 0) return (frames * sampel) / sr;
    }
    const v = i + 4 + 32;
    if (String.fromCharCode(b[v] ?? 0, b[v + 1] ?? 0, b[v + 2] ?? 0, b[v + 3] ?? 0) === 'VBRI') {
      const frames = (b[v + 14]! << 24 | b[v + 15]! << 16 | b[v + 16]! << 8 | b[v + 17]!) >>> 0;
      if (frames > 0) return (frames * sampel) / sr;
    }
    return total > i ? ((total - i) * 8) / (kbps * 1000) : null;
  }
  return null;
}

async function ambilAwal(url: string, dari: number, panjang: number): Promise<{ b: Uint8Array; total: number } | null> {
  const r = await fetch(url, { headers: { ...UA, range: `bytes=${dari}-${dari + panjang - 1}` }, signal: AbortSignal.timeout(10000) });
  if (!r.ok || !r.body) return null;
  const total = Number(/\/(\d+)$/.exec(r.headers.get('content-range') ?? '')?.[1] ?? r.headers.get('content-length') ?? 0);
  const rd = r.body.getReader();
  const potong: Uint8Array[] = [];
  let n = 0;
  while (n < panjang) {
    const { value, done } = await rd.read();
    if (done || !value) break;
    potong.push(value); n += value.length;
  }
  await rd.cancel().catch(() => undefined);
  const b = new Uint8Array(Math.min(n, panjang));
  let o = 0;
  for (const p of potong) { const s = p.subarray(0, Math.min(p.length, b.length - o)); b.set(s, o); o += s.length; if (o >= b.length) break; }
  return { b, total };
}

/** Durasi satu surah seorang qari (detik), dibaca sekali lalu disimpan di R2. */
export async function durasi(store: Store, q: Qari, s: number): Promise<number | null> {
  const key = `k/radio/durasi/${q.id}/${s}.json`;
  const ada = await store.get<{ d: number }>(key);
  if (ada) return ada.d;
  try {
    const url = alamatBerkas(q, s);
    let awal = await ambilAwal(url, 0, 16384);
    if (!awal) return null;
    // Tag ID3 besar (gambar sampul): baca lagi tepat setelah tag.
    if (awal.b[0] === 0x49 && awal.b[1] === 0x44 && awal.b[2] === 0x33) {
      const id3 = 10 + ((awal.b[6]! & 0x7f) << 21 | (awal.b[7]! & 0x7f) << 14 | (awal.b[8]! & 0x7f) << 7 | (awal.b[9]! & 0x7f));
      if (id3 > awal.b.length - 64) {
        const lanjut = await ambilAwal(url, id3, 8192);
        if (lanjut) { const d = durasiMp3(lanjut.b, awal.total - id3); if (d && d > 3) { await store.put(key, { d: Math.round(d * 10) / 10 }); return d; } }
        return null;
      }
    }
    const d = durasiMp3(awal.b, awal.total);
    if (!d || d < 3 || d > 4 * 3600) return null;
    await store.put(key, { d: Math.round(d * 10) / 10 });
    return d;
  } catch {
    return null;
  }
}

/* ── garis waktu siaran ─────────────────────────────────────────────────── */

function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** Qari untuk surah tertentu di putaran tertentu: acak tapi tetap (semua Worker memilih qari yang sama). */
export const pilihQari = (daftar: Qari[], putaran: number, surah: number, kecuali?: string): Qari => {
  let q = daftar[fnv(`${putaran}:${surah}`) % daftar.length]!;
  if (kecuali && q.id === kecuali && daftar.length > 1) q = daftar[(daftar.indexOf(q) + 1) % daftar.length]!;
  return q;
};

const KEY = 'k/radio/siaran.json';

/** Keadaan siaran saat ini, dimajukan sampai `now` (paling banyak 8 surah sekali jalan; selebihnya oleh detak berikutnya). */
export async function siaran(env: Env, store: Store, now = Date.now()): Promise<{ s: Siaran; q: Qari } | null> {
  const daftar = await daftarQari(env, store, now);
  const cari = (id: string) => daftar.find((x) => x.id === id) ?? QARI_CADANGAN.find((x) => x.id === id);
  let cur = await store.get<Siaran>(KEY);
  if (cur && cur.mulai + cur.durasi * 1000 + JEDA_MS > now && cari(cur.qari)) return { s: cur, q: cari(cur.qari)! };
  // Perlu maju: hitung item-item berikutnya di luar CAS (pengambilan durasi lambat), lalu tulis sekali.
  let next: Siaran = cur ?? { v: 1, mulaiRadio: now, putaran: 1, surah: 0, qari: '', mulai: now, durasi: 0, khatam: 0, ubah: now };
  for (let langkah = 0; langkah < 8; langkah += 1) {
    if (next.surah > 0 && next.mulai + next.durasi * 1000 + JEDA_MS > now && cari(next.qari)) break;
    const selesaiPutaran = next.surah >= 114;
    const putaran = selesaiPutaran ? next.putaran + 1 : next.putaran;
    const surah = selesaiPutaran ? 1 : next.surah + 1;
    // Mulai surah berikutnya tepat setelah surah sebelumnya selesai (garis waktu terus berjalan walau tak ada pendengar).
    const mulai = next.surah === 0 ? now : Math.min(now, next.mulai + next.durasi * 1000 + JEDA_MS);
    let q = pilihQari(daftar, putaran, surah, next.qari);
    let d = await durasi(store, q, surah);
    for (let coba = 0; !d && coba < 3; coba += 1) { q = pilihQari(daftar, putaran * 7 + coba + 1, surah, q.id); d = await durasi(store, q, surah); }
    if (!d) { q = QARI_CADANGAN[surah % QARI_CADANGAN.length]!; d = (await durasi(store, q, surah)) ?? 60; }
    next = { v: 1, mulaiRadio: next.mulaiRadio, putaran, surah, qari: q.id, mulai, durasi: d, khatam: next.khatam + (selesaiPutaran ? 1 : 0), ubah: now };
  }
  const tetap = next;
  const hasil = await store.cas<Siaran>(KEY, (ada) => {
    // Pekerja lain sudah memajukan lebih dulu: pakai miliknya.
    if (ada && (ada.putaran > tetap.putaran || (ada.putaran === tetap.putaran && ada.surah >= tetap.surah))) return null;
    return tetap;
  }, 'Siaran radio');
  cur = hasil ?? tetap;
  const q = cari(cur.qari) ?? QARI_CADANGAN[0]!;
  // Durasi surah berikutnya disiapkan lebih dulu agar pergantian surah tidak menunggu.
  return { s: cur, q };
}

/** Siapkan durasi item berikutnya (dipanggil detak tiap menit). */
export async function siapkanBerikut(env: Env, store: Store, s: Siaran): Promise<void> {
  const daftar = await daftarQari(env, store);
  const selesai = s.surah >= 114;
  const q = pilihQari(daftar, selesai ? s.putaran + 1 : s.putaran, selesai ? 1 : s.surah + 1, s.qari);
  await durasi(store, q, selesai ? 1 : s.surah + 1);
}
