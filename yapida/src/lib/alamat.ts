/**
 * Penulisan alamat yang rapi dan pantas (pemilik, 15 Nov 2026: „Bikin penulisan alamatnya lebih elegan, lebih pantes
 * baik di sertifikat maupun form lembaga“). Alamat disimpan per bagian (jalan, kampung, RT/RW, desa, kecamatan,
 * kabupaten/kota, provinsi, kode pos), lalu ditulis dengan ejaan baku: huruf kapital di awal kata, singkatan resmi
 * (Jl., Kp., RT 003/RW 002, Kec., Kab.), tanpa pengulangan dan tanpa koma ganda. Teks bebas lama diurai ke bagian-bagiannya.
 */

export interface AlamatRinci {
  jalan?: string;
  kampung?: string;
  rt?: string;
  rw?: string;
  desa?: string;
  /** „Kelurahan“ bila wilayahnya kelurahan (kota), selain itu „Desa“. */
  kelurahan?: boolean;
  kecamatan?: string;
  kabupaten?: string;
  /** Kota (bukan kabupaten), mis. Kota Bekasi. */
  kota?: boolean;
  provinsi?: string;
  kodepos?: string;
}

const KECIL = new Set(['dan', 'di', 'ke', 'dari', 'bin', 'binti', 'van', 'der', 'de', 'la', 'no.', 'gg.']);
const SINGKATAN_TETAP = new Set(['RT', 'RW', 'NO', 'KM', 'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII', 'DKI', 'DIY', 'NTB', 'NTT', 'PT', 'CV', 'SD', 'SMP', 'SMA', 'MI', 'MTS', 'MA', 'RA', 'TK', 'BLKK', 'BMT', 'UPZ', 'LKSA', 'TPQ']);

/**
 * Huruf kapital di awal kata — hanya bila teksnya seluruhnya kapital atau seluruhnya kecil (ketikan yang sudah rapi
 * dibiarkan). `nama: true` untuk nama orang: tanpa singkatan lembaga, „bin/binti“ kecil, sesudah apostrof tetap kecil (Ma'ruf).
 */
export function judulKata(s: string, o: { nama?: boolean } = {}): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const huruf = t.replace(/[^A-Za-z]/g, '');
  if (huruf && huruf !== huruf.toUpperCase() && huruf !== huruf.toLowerCase()) return t;
  let gelar = false; // sesudah koma pertama pada nama orang: gelar akademik (S.Pd., M.Ag., KH., MA)
  return t.split(' ').map((w, i) => {
    const up = w.toUpperCase().replace(/[.,]/g, '');
    if (o.nama && (gelar || /\./.test(w.replace(/[.,]$/, '')) || GELAR_DEPAN.has(up))) {
      if (w.endsWith(',')) gelar = true;
      if (GELAR_KAPITAL.has(up)) return w.toUpperCase();
      if (/\./.test(w) || gelar) return w.toLowerCase().replace(/(^|\.)([a-z])/g, (_m, a: string, b: string) => a + b.toUpperCase());
    }
    if (o.nama && w.endsWith(',')) gelar = true;
    if (!o.nama && SINGKATAN_TETAP.has(up) && up !== 'NO') return w.toUpperCase().replace('MTS', 'MTs');
    if (i > 0 && KECIL.has(w.toLowerCase())) return w.toLowerCase();
    return w.toLowerCase().replace(/(^|[-(/])([a-zà-ÿ])/g, (_m, a: string, b: string) => a + b.toUpperCase())
      // kata ulang ditulis „Kuda-kuda“, bukan „Kuda-Kuda“
      .replace(/^([A-Z][a-z]+)-([A-Z])([a-z]*)$/, (m, a: string, b: string, c: string) => ((b + c).toLowerCase() === a.toLowerCase() ? `${a}-${b.toLowerCase()}${c}` : m));
  }).join(' ');
}

/** Gelar yang ditulis kapital semua (KH., MA, MM …) dan gelar depan (H., Hj., Dr., Drs.). */
const GELAR_KAPITAL = new Set(['KH', 'MA', 'MM', 'MH', 'MSI', 'MPD', 'SE', 'ST', 'SH', 'SKM', 'MT']);
const GELAR_DEPAN = new Set(['H', 'HJ', 'DR', 'DRS', 'DRA', 'IR', 'KH', 'USTADZ', 'UST', 'USTADZAH', 'USTH', 'PROF']);

const nol3 = (s: string) => { const d = s.replace(/\D/g, ''); return d ? d.padStart(3, '0').slice(-3) : ''; };

export const PROVINSI = ['Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Bengkulu', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Lampung', 'Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Barat Daya', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan'];

/** Merapikan awalan bagian jalan/kampung: „JL“, „jln.“ → „Jl.“, „kp“, „kampung“ → „Kp.“, „gg“ → „Gg.“, „no“ → „No.“. */
function rapikanJalan(s: string): string {
  return judulKata(s)
    .replace(/\b(?:jl|jln|jalan)\b\.?\s*/gi, 'Jl. ')
    .replace(/\b(?:kp|kmp|kampung)\b\.?\s*/gi, 'Kp. ')
    .replace(/\b(?:gg|gang)\b\.?\s*/gi, 'Gg. ')
    .replace(/\b(?:dsn|dusun)\b\.?\s*/gi, 'Dusun ')
    .replace(/\b(?:perum|perumahan)\b\.?\s*/gi, 'Perum ')
    .replace(/\bno\b\.?\s*/gi, 'No. ')
    .replace(/\bblok\b\.?\s*/gi, 'Blok ')
    .replace(/\s+([,.])/g, '$1').replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '');
}

/** Membuang awalan wilayah yang ditulis pengguna („Desa“, „Kec.“, „Kabupaten“ …) supaya tidak tertulis dua kali. */
const tanpaAwalan = (s: string, re: RegExp) => judulKata(s.replace(re, '').replace(/^[\s.,:]+/, '').trim());

export function rapikanRinci(a: AlamatRinci): AlamatRinci {
  const kab = a.kabupaten ?? '';
  const kota = a.kota ?? /^\s*kota\b/i.test(kab);
  const des = a.desa ?? '';
  return {
    jalan: a.jalan ? rapikanJalan(a.jalan) : undefined,
    kampung: a.kampung ? rapikanJalan(/^\s*(kp|kampung|dusun|dsn|perum)/i.test(a.kampung) ? a.kampung : `Kp. ${a.kampung}`) : undefined,
    rt: a.rt ? nol3(a.rt) : undefined,
    rw: a.rw ? nol3(a.rw) : undefined,
    desa: des ? tanpaAwalan(des, /^\s*(desa|ds\.?|kelurahan|kel\.?)\s*/i) : undefined,
    kelurahan: a.kelurahan ?? /^\s*(kelurahan|kel\.?)\s/i.test(des),
    kecamatan: a.kecamatan ? tanpaAwalan(a.kecamatan, /^\s*(kecamatan|kec\.?)\s*/i) : undefined,
    kabupaten: kab ? tanpaAwalan(kab, /^\s*(kabupaten|kab\.?|kota)\s*/i) : undefined,
    kota,
    provinsi: a.provinsi ? (PROVINSI.find((p) => p.toLowerCase() === tanpaAwalan(a.provinsi!, /^\s*(provinsi|prov\.?|propinsi)\s*/i).toLowerCase()) ?? tanpaAwalan(a.provinsi, /^\s*(provinsi|prov\.?|propinsi)\s*/i)) : undefined,
    kodepos: a.kodepos ? a.kodepos.replace(/\D/g, '').slice(0, 5) || undefined : undefined,
  };
}

export interface GayaAlamat {
  /** „Kec.“/„Kab.“ (kop, sertifikat, tabel) atau „Kecamatan“/„Kabupaten“ (halaman profil). */
  singkat?: boolean;
  /** Pemisah antarbagian. */
  pisah?: string;
}

/** Bagian-bagian alamat yang sudah dieja baku, berurutan dari yang terkecil. */
export function bagianAlamat(a0: AlamatRinci, g: GayaAlamat = {}): { lokal: string; wilayah: string[] } {
  const a = rapikanRinci(a0);
  const rtrw = a.rt || a.rw ? [a.rt && `RT ${a.rt}`, a.rw && `RW ${a.rw}`].filter(Boolean).join('/') : '';
  const lokal = [a.jalan, [a.kampung, rtrw].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const s = g.singkat;
  const wilayah = [
    a.desa && `${a.kelurahan ? (s ? 'Kel.' : 'Kelurahan') : 'Desa'} ${a.desa}`,
    a.kecamatan && `${s ? 'Kec.' : 'Kecamatan'} ${a.kecamatan}`,
    a.kabupaten && (a.kota ? `Kota ${a.kabupaten}` : `${s ? 'Kab.' : 'Kabupaten'} ${a.kabupaten}`),
    a.provinsi,
  ].filter((x): x is string => Boolean(x));
  // Kode pos menempel pada bagian terakhir: „… Jawa Barat 17641“ atau „… Kab. Bekasi 17641“.
  if (a.kodepos) { if (wilayah.length) wilayah[wilayah.length - 1] += ` ${a.kodepos}`; else wilayah.push(a.kodepos); }
  return { lokal, wilayah };
}

/** Satu baris: „Jl. Yapida No. 3, Kp. Kuda-kuda RT 003/RW 002, Desa Sukakarya, Kec. Sukakarya, Kab. Bekasi, Jawa Barat 17641“. */
export function tulisAlamat(a: AlamatRinci, g: GayaAlamat = {}): string {
  const { lokal, wilayah } = bagianAlamat(a, g);
  return [lokal, ...wilayah].filter(Boolean).join(g.pisah ?? ', ');
}

/** Dua baris untuk kop: jalan sampai desa | kecamatan sampai kode pos. */
export function duaBaris(a: AlamatRinci, g: GayaAlamat = { singkat: false }): [string, string] {
  const { lokal, wilayah } = bagianAlamat(a, g);
  const desa = lokal && wilayah.length >= 3 ? wilayah[0]! : '';
  const sisa = desa ? wilayah.slice(1) : wilayah;
  const satu = [lokal, desa].filter(Boolean).join(', ');
  return satu ? [satu, sisa.join(', ')] : [sisa.slice(0, 2).join(', '), sisa.slice(2).join(', ')];
}

/** Mengurai alamat yang diketik bebas menjadi bagian-bagiannya (sebaik mungkin). */
export function uraiAlamat(teks: string): AlamatRinci {
  let s = ` ${String(teks ?? '').replace(/\s+/g, ' ').trim()} `;
  const a: AlamatRinci = {};
  const ambil = (re: RegExp, k: keyof AlamatRinci) => {
    const m = re.exec(s);
    if (m) { (a as Record<string, unknown>)[k] = m[1]!.trim(); s = s.replace(m[0], ', '); }
  };
  const kp = /\b(\d{5})\b(?!.*\b\d{5}\b)/.exec(s);
  if (kp) { a.kodepos = kp[1]; s = s.replace(kp[0], ' '); }
  const rtrw = /\bRT\.?\s*[:.]?\s*(\d{1,3})\s*[/,.-]?\s*(?:RW\.?\s*[:.]?\s*)?(\d{1,3})?/i.exec(s) ?? /\bRT\s*\/\s*RW\.?\s*[:.]?\s*(\d{1,3})\s*\/\s*(\d{1,3})/i.exec(s);
  if (rtrw) { a.rt = rtrw[1]; if (rtrw[2]) a.rw = rtrw[2]; s = s.replace(rtrw[0], ' '); }
  const rw = /\bRW\.?\s*[:.]?\s*(\d{1,3})/i.exec(s);
  if (rw && !a.rw) { a.rw = rw[1]; s = s.replace(rw[0], ' '); }
  const prov = PROVINSI.find((p) => new RegExp(`\\b(?:prov(?:insi)?\\.?\\s*)?${p.replace(/ /g, '\\s+')}\\b`, 'i').test(s));
  if (prov) { a.provinsi = prov; s = s.replace(new RegExp(`\\b(?:prov(?:insi)?\\.?\\s*)?${prov.replace(/ /g, '\\s+')}\\b`, 'i'), ', '); }
  ambil(/\b(?:kabupaten|kab\.?)\s+([^,]+?)(?=,|$|\s(?:kec|kel|desa|ds)\b)/i, 'kabupaten');
  if (!a.kabupaten) { const k = /\bkota\s+([^,]+?)(?=,|$)/i.exec(s); if (k) { a.kabupaten = k[1]!.trim(); a.kota = true; s = s.replace(k[0], ', '); } }
  ambil(/\b(?:kecamatan|kec\.?)\s+([^,]+?)(?=,|$|\s(?:kab|kota|desa|ds|kel)\b)/i, 'kecamatan');
  const kel = /\b(?:kelurahan|kel\.)\s*([^,]+?)(?=,|$)/i.exec(s);
  if (kel) { a.desa = kel[1]!.trim(); a.kelurahan = true; s = s.replace(kel[0], ', '); } else ambil(/\b(?:desa|ds\.?)\s+([^,]+?)(?=,|$)/i, 'desa');
  const kamp = /\b((?:kp|kampung|kmp|dusun|dsn|perum|perumahan)\b\.?\s*[^,]+?)(?=,|$)/i.exec(s);
  if (kamp) { a.kampung = kamp[1]!.trim(); s = s.replace(kamp[0], ', '); }
  const sisa = s.split(',').map((x) => x.trim()).filter((x) => x && !/^(rt|rw|no)\.?$/i.test(x));
  if (sisa.length) a.jalan = sisa.join(', ');
  // Tanpa penanda sama sekali (mis. „Sukakarya, Sukakarya, Bekasi“): bagian sesudah jalan dianggap desa, kecamatan, kabupaten.
  if (!a.desa && !a.kecamatan && !a.kabupaten && sisa.length >= 3 && !/\b(jl|jalan|gg|no)\b/i.test(sisa[0]!)) {
    const [d, k, kb, ...lain] = sisa;
    a.jalan = lain.length ? lain.join(', ') : undefined;
    a.desa = d; a.kecamatan = k; a.kabupaten = kb;
  }
  return a;
}

/** Alamat yayasan (pengaturan situs) sebagai rincian: jalan & kampung/RT dari isian jalan, sisanya dari isiannya. */
export function rinciSitus(a: { jalan: string; desa: string; kecamatan: string; kabupaten: string; provinsi: string; kodepos: string }): AlamatRinci {
  const j = uraiAlamat(a.jalan);
  return { jalan: j.jalan, kampung: j.kampung, rt: j.rt, rw: j.rw, desa: a.desa || j.desa, kecamatan: a.kecamatan || j.kecamatan, kabupaten: a.kabupaten || j.kabupaten, kota: /^\s*kota\b/i.test(a.kabupaten), provinsi: a.provinsi || j.provinsi, kodepos: a.kodepos || j.kodepos };
}

/** Teks alamat bebas → ejaan baku. Bila tidak ada bagian wilayah yang dikenali, teksnya hanya dirapikan. */
export function rapikanAlamat(teks: string, g: GayaAlamat = { singkat: true }): string {
  const t = String(teks ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const a = uraiAlamat(t);
  const hasil = tulisAlamat(a, g);
  return hasil || rapikanJalan(t);
}
