/**
 * Berkas unggahan (foto, sampul, PDF) di bucket R2 `yapida-media`. Jenis berkas ditentukan dari isi berkasnya (byte
 * awal), bukan dari nama atau Content-Type kiriman. Foto sudah dikecilkan di peramban (EXIF ikut terbuang) sebelum sampai sini.
 */
import type { Env } from '../env.ts';

const b32 = '0123456789abcdefghjkmnpqrstvwxyz';
function idBerkas(): string {
  const r = crypto.getRandomValues(new Uint8Array(20));
  let s = '';
  for (const b of r) s += b32[b % 32];
  return s;
}

export type JenisBerkas = 'jpg' | 'png' | 'webp' | 'pdf';
const TIPE: Record<JenisBerkas, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' };
export const BATAS: Record<'gambar' | 'pdf', number> = { gambar: 4 * 1024 * 1024, pdf: 25 * 1024 * 1024 };

export function kenali(buf: ArrayBuffer): JenisBerkas | null {
  const b = new Uint8Array(buf.slice(0, 16));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'pdf';
  return null;
}

export class BerkasDitolak extends Error {}

export interface Unggahan { f: string; k?: string; jenis: JenisBerkas; ukuran: number }

/** Menyimpan satu berkas (dan versi kecilnya bila ada). Mengembalikan kunci relatif, mis. "2026/11/<id>.jpg". */
export async function unggah(env: Env, berkas: ArrayBuffer, kecil: ArrayBuffer | null, info: { oleh: string; unit: string; hanya?: 'gambar' | 'pdf' }, now = Date.now()): Promise<Unggahan> {
  const jenis = kenali(berkas);
  if (!jenis) throw new BerkasDitolak('Jenis berkas tidak didukung. Gunakan foto JPG/PNG/WebP atau dokumen PDF.');
  const gambar = jenis !== 'pdf';
  if (info.hanya === 'gambar' && !gambar) throw new BerkasDitolak('Di sini hanya boleh foto (JPG, PNG, WebP).');
  if (info.hanya === 'pdf' && gambar) throw new BerkasDitolak('Di sini hanya boleh dokumen PDF.');
  if (berkas.byteLength > BATAS[gambar ? 'gambar' : 'pdf']) throw new BerkasDitolak(gambar ? 'Foto terlalu besar (maksimal 4 MB).' : 'PDF terlalu besar (maksimal 25 MB).');
  const d = new Date(now + 7 * 3600_000);
  const dasar = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${idBerkas()}`;
  const f = `${dasar}.${jenis}`;
  const meta = { oleh: info.oleh, unit: info.unit };
  await env.MEDIA.put(`f/${f}`, berkas, { httpMetadata: { contentType: TIPE[jenis], cacheControl: 'public, max-age=31536000, immutable' }, customMetadata: meta });
  const out: Unggahan = { f, jenis, ukuran: berkas.byteLength };
  if (kecil && gambar) {
    const jk = kenali(kecil);
    if (jk === 'jpg' && jenis === 'jpg' && kecil.byteLength <= 600 * 1024) {
      out.k = `${dasar}_k.jpg`;
      await env.MEDIA.put(`f/${out.k}`, kecil, { httpMetadata: { contentType: TIPE[jk], cacheControl: 'public, max-age=31536000, immutable' }, customMetadata: meta });
    }
  }
  return out;
}

/** Alamat publik berkas: domain media bila terpasang, selain itu lewat Worker di /f/. */
export const urlBerkas = (env: Pick<Env, 'MEDIA_BASE'>, f: string | undefined | null): string => (f ? `${(env.MEDIA_BASE ?? '').replace(/\/$/, '')}/f/${f}` : '');
