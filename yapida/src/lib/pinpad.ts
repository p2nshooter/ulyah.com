/**
 * Papan PIN bergambar yang posisinya diacak (pemilik, 15 Nov 2026: „Pasword nya di bulak balik aja dari angka 0-9 cukup
 * 5 angka, tolong bikinin dalam bentuk gambar“).
 *
 * Setiap kali papan ditampilkan, server mengacak urutan angka 0–9 dan menyimpannya di cookie HttpOnly bertanda tangan
 * (berlaku 10 menit). Tombol hanya membawa nomor POSISI, dan angkanya digambar sebagai vektor — jadi halaman, isian
 * formulir, dan permintaan yang terkirim tidak pernah memuat angka PIN; orang yang melihat dari samping juga tidak bisa
 * menebak PIN dari letak jari, karena letaknya berubah setiap kali.
 */
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { b64url, fromB64url, hmac, timingSafeEqual } from './crypto.ts';
import { html, raw, type Raw } from './html.ts';
import { svgAngka } from './angka.ts';

const COOKIE = '__Host-ypk';
const UMUR = 10 * 60_000;

export function acak(): string[] {
  const a = '0123456789'.split('');
  const buf = new Uint8Array(1);
  /** Bilangan acak seragam 0..maks: 4 bit acak, ditolak bila di luar rentang (tanpa modulo, tanpa bias). */
  const seragam = (maks: number): number => {
    for (;;) {
      crypto.getRandomValues(buf);
      const x = buf[0]! & 15;
      if (x <= maks) return x;
    }
  };
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = seragam(i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export async function pasangTantangan(c: Context, secret: string, perm = acak()): Promise<string[]> {
  const body = b64url(new TextEncoder().encode(JSON.stringify({ p: perm.join(''), x: Date.now() + UMUR, n: b64url(crypto.getRandomValues(new Uint8Array(6))) })));
  setCookie(c, COOKIE, `${body}.${await hmac(secret, `pinpad:${body}`)}`, { path: '/', secure: true, httpOnly: true, sameSite: 'Strict', maxAge: UMUR / 1000 });
  return perm;
}

export async function bacaTantangan(c: Context, secret: string): Promise<string[] | null> {
  const t = getCookie(c, COOKIE);
  deleteCookie(c, COOKIE, { path: '/', secure: true });
  if (!t || !t.includes('.')) return null;
  const [body, mac] = t.split('.');
  if (!body || !mac || !timingSafeEqual(await hmac(secret, `pinpad:${body}`), mac)) return null;
  try {
    const o = JSON.parse(new TextDecoder().decode(fromB64url(body))) as { p: string; x: number };
    if (!/^\d{10}$/.test(o.p) || new Set(o.p).size !== 10 || o.x < Date.now()) return null;
    return o.p.split('');
  } catch {
    return null;
  }
}

/** "30917" (posisi tombol) → PIN 5 angka menurut urutan acak; null bila tidak sah. */
export function dariPosisi(perm: string[], posisi: string): string | null {
  if (!/^\d{5}$/.test(posisi)) return null;
  return posisi.split('').map((p) => perm[Number(p)]!).join('');
}

/**
 * Papan angka: 3 × 3 + baris bawah (hapus · posisi 9 · acak ulang). `mode` "masuk" mengirim setelah 5 ketukan;
 * "buat" meminta 5 angka, lalu mengulanginya untuk konfirmasi, baru mengirim.
 */
export function papanPin(perm: string[], o: { mode: 'masuk' | 'buat'; judul: string; ket?: string; mati?: boolean }): Raw {
  const tombol = (i: number) => raw(`<button class="pin-tbl" type="button" data-pos="${i}" aria-label="Tombol ${i + 1}">${svgAngka(perm[i]!)}</button>`);
  return html`<div class="pin" data-pinpad="${o.mode}"${raw(o.mati ? ' data-mati' : '')}>
  <p class="pin-judul" data-pin-judul>${o.judul}</p>
  ${o.ket ? html`<p class="pin-ket" data-pin-ket>${o.ket}</p>` : html`<p class="pin-ket" data-pin-ket></p>`}
  <div class="pin-titik" aria-live="polite" data-pin-titik><i></i><i></i><i></i><i></i><i></i></div>
  <div class="pin-kisi">
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(tombol)}
    <button class="pin-tbl pin-aksi" type="button" data-pin-hapus aria-label="Hapus satu">⌫</button>
    ${tombol(9)}
    <button class="pin-tbl pin-aksi" type="button" data-pin-ulang aria-label="Kosongkan">✕</button>
  </div>
  <input type="hidden" name="k" value="" data-pin-k><input type="hidden" name="k2" value="" data-pin-k2>
</div>`;
}
