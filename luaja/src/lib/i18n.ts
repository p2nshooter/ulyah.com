/** Bahasa antarmuka: Indonesia (bawaan) dan Inggris. Setiap teks UI ditulis berpasangan, jadi tidak ada yang terlewat. */

export type Lang = 'id' | 'en';

export const tr = (L: Lang, id: string, en: string): string => (L === 'en' ? en : id);

export function fmtNum(L: Lang, n: number, dec = 0): string {
  return n.toLocaleString(L === 'en' ? 'en-US' : 'id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/** Rupiah tanpa desimal: Rp500.000 */
export const rp = (n: number): string => `Rp${Math.round(n).toLocaleString('id-ID')}`;

export function fmtDate(L: Lang, ms: number, withTime = false): string {
  const d = new Date(ms);
  const opts: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' };
  if (withTime) Object.assign(opts, { hour: '2-digit', minute: '2-digit' });
  const s = d.toLocaleString(L === 'en' ? 'en-GB' : 'id-ID', opts);
  return withTime ? `${s} WIB` : s;
}

/** Tanggal WIB "YYYY-MM-DD" untuk kunci log harian. */
export const wibDate = (ms = Date.now()): string => new Date(ms + 7 * 3600_000).toISOString().slice(0, 10);
