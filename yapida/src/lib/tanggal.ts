/**
 * Pembaca tanggal & angka tanpa ketergantungan (dipakai server, pembaca file master di peramban, dan simulasi masuk di
 * panduan siswa — kode yang sama persis, jadi simulasi tidak pernah berbeda dari halaman masuk yang asli).
 */

export const digit = (s: unknown) => String(s ?? '').replace(/\D/g, '');

const BULAN: [RegExp, number][] = [
  [/^jan/, 1], [/^(feb|peb)/, 2], [/^mar/, 3], [/^apr/, 4], [/^(mei|may)/, 5], [/^jun/, 6], [/^jul/, 7], [/^(agu|agt|ags|aug)/, 8],
  [/^sep/, 9], [/^(okt|oct)/, 10], [/^(nov|nop)/, 11], [/^(des|dec)/, 12],
];
/** „feb“, „Februari“, „Pebruari“, „Agt“ … → 2, 8; null bila bukan nama bulan. */
export const bulanDari = (s: string): number | null => { const t = s.toLowerCase().replace(/[^a-z]/g, ''); return t.length >= 3 ? BULAN.find(([re]) => re.test(t))?.[1] ?? null : null; };

/**
 * Tanggal dalam bentuk apa pun → YYYY-MM-DD (pemilik: „300400 / 30/04/2000 … jika singkatan bulan misal feb atau
 * februari otomatis jadi 02“): 30/04/2000, 30-4-00, 30.04.2000, 30042000, 300400, 30 April 2000, 30 feb 2000,
 * 30-Apr-00, April 30, 2000, 2000-04-30, „Bekasi, 30 April 2000“, atau nomor seri tanggal Excel. Tahun dua angka:
 * 00 … tahun ini = 20xx, selebihnya 19xx. Urutan Indonesia (hari dulu); bila bulan > 12, dianggap format Amerika.
 */
export function normalTanggal(input: unknown, now = Date.now()): string | null {
  let s = String(input ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s.includes(',')) { const bag = s.split(',').map((x) => x.trim()).filter((x) => /\d/.test(x)); if (bag.length) s = bag.length > 1 && /^[a-z]+\s+\d{1,2}$/.test(bag[bag.length - 2]!) ? `${bag[bag.length - 2]} ${bag[bag.length - 1]}` : bag[bag.length - 1]!; }
  s = s.replace(/(\d)(st|nd|rd|th)\b/g, '$1').replace(/\s+/g, ' ').trim();
  const kini = new Date(now).getUTCFullYear() % 100;
  const th = (y: string) => (y.length === 4 ? Number(y) : Number(y) <= kini ? 2000 + Number(y) : 1900 + Number(y));
  let y = 0, m = 0, d = 0;
  let r: RegExpExecArray | null;
  if ((r = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[t ].*)?$/.exec(s))) [y, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = /^(\d{1,2})[-/. ]+([a-z]{3,})\.?[-/. ]+(\d{2}|\d{4})$/.exec(s)) && bulanDari(r[2]!)) [d, m, y] = [Number(r[1]), bulanDari(r[2]!)!, th(r[3]!)];
  else if ((r = /^([a-z]{3,})\.?[ -]+(\d{1,2})[ -]+(\d{4})$/.exec(s)) && bulanDari(r[1]!)) [m, d, y] = [bulanDari(r[1]!)!, Number(r[2]), Number(r[3])];
  else if ((r = /^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{2}|\d{4})$/.exec(s))) {
    [d, m, y] = [Number(r[1]), Number(r[2]), th(r[3]!)];
    if (m > 12 && d <= 12) [d, m] = [m, d];
  } else if ((r = /^(\d{2})(\d{2})(\d{4})$/.exec(s))) {
    const yy = Number(s.slice(0, 4)), mm = Number(s.slice(4, 6)), dd = Number(s.slice(6, 8));
    if (yy >= 1950 && yy <= 2100 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && !(Number(r[2]) >= 1 && Number(r[2]) <= 12 && Number(r[1]) <= 31 && Number(r[3]) >= 1950)) [y, m, d] = [yy, mm, dd];
    else [d, m, y] = [Number(r[1]), Number(r[2]), Number(r[3])];
  } else if ((r = /^(\d{2})(\d{2})(\d{2})$/.exec(s))) [d, m, y] = [Number(r[1]), Number(r[2]), th(r[3]!)];
  else if (/^\d{4,5}(\.\d+)?$/.test(s) && Number(s) > 3000 && Number(s) < 80_000) {
    const t = new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(s)) * 86_400_000);
    [y, m, d] = [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
  } else return null;
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d || y < 1950 || y > 2100) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
