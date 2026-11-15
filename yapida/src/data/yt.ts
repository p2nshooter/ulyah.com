/**
 * Video terbaru kanal YouTube lembaga, ditarik dari umpan RSS publik kanal itu (tanpa kunci API) dan disimpan di R2
 * paling lama 3 jam (`k/yt/<kanal>.json`), jadi satu kanal dibaca dari YouTube paling banyak delapan kali sehari.
 * Gagal mengambil tidak pernah merusak halaman: yang tersimpan terakhir tetap tampil.
 */
import type { Env } from '../env.ts';
import type { Store } from '../lib/store.ts';

export interface VideoKanal { id: string; judul: string; terbit: string }
interface Simpanan { at: number; video: VideoKanal[] }

const UMUR = 3 * 3600_000;

const unescape = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

export function uraiUmpan(xml: string): VideoKanal[] {
  const out: VideoKanal[] = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1]!;
    const id = e.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
    const judul = e.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const terbit = e.match(/<published>([^<]+)<\/published>/)?.[1];
    if (id && judul) out.push({ id, judul: unescape(judul).trim().slice(0, 160), terbit: (terbit ?? '').slice(0, 10) });
    if (out.length >= 12) break;
  }
  return out;
}

export async function videoKanal(env: Env, store: Store, kanal: string | undefined, now = Date.now()): Promise<VideoKanal[]> {
  if (!kanal || !/^UC[\w-]{22}$/.test(kanal)) return [];
  const key = `k/yt/${kanal}.json`;
  const lama = await store.get<Simpanan>(key);
  if (lama && now - lama.at < UMUR) return lama.video;
  try {
    const r = await fetch(`${env.YT_BASE ?? 'https://www.youtube.com'}/feeds/videos.xml?channel_id=${kanal}`, { signal: AbortSignal.timeout(5000), cf: { cacheTtl: 1800 } } as RequestInit);
    if (!r.ok) throw new Error(`umpan ${r.status}`);
    const video = uraiUmpan(await r.text());
    await store.put(key, { at: now, video });
    return video;
  } catch {
    if (lama) await store.put(key, { ...lama, at: now - UMUR + 1800_000 });
    return lama?.video ?? [];
  }
}
