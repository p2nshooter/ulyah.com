/**
 * Excel (.xlsx) tanpa pustaka luar — cukup untuk file master siswa dan unduhan data:
 *   bacaXlsx: ZIP (stored/deflate lewat DecompressionStream) → workbook, sharedStrings, sheet → baris teks.
 *   tulisXlsx: lembar dengan judul, kepala kolom berwarna, kolom teks (NISN/NIK tidak berubah jadi angka), panel beku.
 *   bacaCsv: koma atau titik koma, tanda kutip ganda.
 * Berjalan sama di Workers dan Node (uji).
 */

export interface Lembar { nama: string; baris: string[][] }

const dec = new TextDecoder();
const enc = new TextEncoder();

/* ── ZIP ──────────────────────────────────────────────────────────────── */

const u16 = (b: Uint8Array, i: number) => b[i]! | (b[i + 1]! << 8);
const u32 = (b: Uint8Array, i: number) => (b[i]! | (b[i + 1]! << 8) | (b[i + 2]! << 16) | (b[i + 3]! << 24)) >>> 0;

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const keluar = new Blob([data as BlobPart]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(keluar).arrayBuffer());
}

export class BukanXlsx extends Error {}

/** Isi berkas-berkas di dalam ZIP (hanya yang namanya diminta, agar hemat). */
async function bukaZip(buf: Uint8Array, mau: (nama: string) => boolean): Promise<Map<string, Uint8Array>> {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i -= 1) if (u32(buf, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new BukanXlsx('Berkas ini bukan Excel .xlsx yang sah.');
  const jumlah = u16(buf, eocd + 10);
  let p = u32(buf, eocd + 16);
  const out = new Map<string, Uint8Array>();
  for (let n = 0; n < jumlah; n += 1) {
    if (u32(buf, p) !== 0x02014b50) throw new BukanXlsx('Struktur ZIP rusak.');
    const metode = u16(buf, p + 10), ukuran = u32(buf, p + 20), panjangNama = u16(buf, p + 28), panjangEkstra = u16(buf, p + 30), panjangKomentar = u16(buf, p + 32), lokal = u32(buf, p + 42);
    const nama = dec.decode(buf.subarray(p + 46, p + 46 + panjangNama));
    p += 46 + panjangNama + panjangEkstra + panjangKomentar;
    if (!mau(nama)) continue;
    if (u32(buf, lokal) !== 0x04034b50) throw new BukanXlsx('Struktur ZIP rusak.');
    const awal = lokal + 30 + u16(buf, lokal + 26) + u16(buf, lokal + 28);
    const data = buf.subarray(awal, awal + ukuran);
    if (metode === 0) out.set(nama, data);
    else if (metode === 8) out.set(nama, await inflate(data));
    else throw new BukanXlsx(`Kompresi ZIP ${metode} tidak didukung.`);
  }
  return out;
}

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b: Uint8Array): number { let c = 0xffffffff; for (let i = 0; i < b.length; i += 1) c = CRC[(c ^ b[i]!) & 0xff]! ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

/** ZIP tanpa kompresi (stored) — xlsx kecil-menengah, dibaca semua aplikasi lembar kerja. */
function buatZip(berkas: [string, Uint8Array][]): Uint8Array<ArrayBuffer> {
  const bagian: Uint8Array[] = [];
  const pusat: Uint8Array[] = [];
  let posisi = 0;
  const tulis16 = (v: DataView, o: number, x: number) => v.setUint16(o, x, true);
  const tulis32 = (v: DataView, o: number, x: number) => v.setUint32(o, x >>> 0, true);
  for (const [nama, data] of berkas) {
    const n = enc.encode(nama), crc = crc32(data);
    const lok = new Uint8Array(30 + n.length), lv = new DataView(lok.buffer);
    tulis32(lv, 0, 0x04034b50); tulis16(lv, 4, 20); tulis16(lv, 6, 0x0800); tulis16(lv, 8, 0); tulis32(lv, 14, crc); tulis32(lv, 18, data.length); tulis32(lv, 22, data.length); tulis16(lv, 26, n.length);
    lok.set(n, 30);
    const cd = new Uint8Array(46 + n.length), cv = new DataView(cd.buffer);
    tulis32(cv, 0, 0x02014b50); tulis16(cv, 4, 20); tulis16(cv, 6, 20); tulis16(cv, 8, 0x0800); tulis16(cv, 10, 0); tulis32(cv, 16, crc); tulis32(cv, 20, data.length); tulis32(cv, 24, data.length); tulis16(cv, 28, n.length); tulis32(cv, 42, posisi);
    cd.set(n, 46);
    bagian.push(lok, data); pusat.push(cd);
    posisi += lok.length + data.length;
  }
  const ukuranPusat = pusat.reduce((s, x) => s + x.length, 0);
  const akhir = new Uint8Array(22), av = new DataView(akhir.buffer);
  tulis32(av, 0, 0x06054b50); tulis16(av, 8, berkas.length); tulis16(av, 10, berkas.length); tulis32(av, 12, ukuranPusat); tulis32(av, 16, posisi);
  const semua = [...bagian, ...pusat, akhir];
  const out = new Uint8Array(semua.reduce((s, x) => s + x.length, 0));
  let o = 0;
  for (const x of semua) { out.set(x, o); o += x.length; }
  return out;
}

/* ── XML kecil ────────────────────────────────────────────────────────── */

const ENTITAS: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
export const urai = (s: string) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITAS[e] ?? m));
const xmlEsc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const atribut = (s: string, nama: string) => new RegExp(`(?:^|\\s)${nama}="([^"]*)"`).exec(s)?.[1];
const teksT = (s: string) => [...s.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '').matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((m) => urai(m[1]!)).join('');

export const kolomKe = (huruf: string) => [...huruf.toUpperCase()].reduce((n, h) => n * 26 + h.charCodeAt(0) - 64, 0) - 1;
export const hurufKolom = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : hurufKolom(Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)));

/** Semua lembar sebuah .xlsx sebagai baris teks (sel kosong = ''). */
export async function bacaXlsx(data: ArrayBuffer | Uint8Array): Promise<Lembar[]> {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  const zip = await bukaZip(buf, (n) => n === 'xl/workbook.xml' || n === 'xl/_rels/workbook.xml.rels' || n === 'xl/sharedStrings.xml' || n.startsWith('xl/worksheets/sheet'));
  const wb = zip.get('xl/workbook.xml');
  if (!wb) throw new BukanXlsx('Berkas ini bukan Excel .xlsx (workbook tidak ada).');
  const rels = dec.decode(zip.get('xl/_rels/workbook.xml.rels') ?? new Uint8Array());
  const target = new Map([...rels.matchAll(/<Relationship\b([^>]*)\/?>/g)].map((m) => [atribut(m[1]!, 'Id') ?? '', (atribut(m[1]!, 'Target') ?? '').replace(/^\/?xl\//, '').replace(/^\//, '')]));
  const ss = dec.decode(zip.get('xl/sharedStrings.xml') ?? new Uint8Array());
  const kata = [...ss.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((m) => teksT(m[1]!));
  const out: Lembar[] = [];
  for (const m of dec.decode(wb).matchAll(/<sheet\b([^>]*)\/?>/g)) {
    const nama = urai(atribut(m[1]!, 'name') ?? `Sheet${out.length + 1}`);
    const rid = atribut(m[1]!, 'r:id') ?? '';
    const isi = zip.get(`xl/${target.get(rid) ?? `worksheets/sheet${out.length + 1}.xml`}`);
    if (!isi) continue;
    const baris: string[][] = [];
    for (const r of dec.decode(isi).matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
      const nomor = Number(atribut(r[1]!, 'r') ?? baris.length + 1) - 1;
      const sel: string[] = [];
      let k = 0;
      for (const c of (r[2] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const ref = atribut(c[1]!, 'r');
        if (ref) k = kolomKe(/^[A-Z]+/i.exec(ref)?.[0] ?? 'A');
        const t = atribut(c[1]!, 't');
        const v = /<v>([\s\S]*?)<\/v>/.exec(c[2] ?? '')?.[1];
        let nilai = '';
        if (t === 's') nilai = kata[Number(v)] ?? '';
        else if (t === 'inlineStr') nilai = teksT(c[2] ?? '');
        else if (v !== undefined) nilai = urai(v);
        sel[k] = nilai.replace(/\r\n?/g, '\n').trim();
        k += 1;
      }
      baris[nomor] = Array.from(sel, (x) => x ?? '');
    }
    out.push({ nama, baris: Array.from(baris, (x) => x ?? []) });
  }
  return out;
}

/** CSV (koma atau titik koma — dipilih dari baris pertama), tanda kutip ganda, BOM dibuang. */
export function bacaCsv(teks: string): string[][] {
  const t = teks.replace(/^﻿/, '');
  const pertama = t.split('\n', 1)[0] ?? '';
  const pisah = (pertama.match(/;/g)?.length ?? 0) > (pertama.match(/,/g)?.length ?? 0) ? ';' : ',';
  const out: string[][] = [];
  let baris: string[] = [], sel = '', kutip = false;
  for (let i = 0; i < t.length; i += 1) {
    const ch = t[i]!;
    if (kutip) {
      if (ch === '"' && t[i + 1] === '"') { sel += '"'; i += 1; } else if (ch === '"') kutip = false; else sel += ch;
    } else if (ch === '"') kutip = true;
    else if (ch === pisah) { baris.push(sel.trim()); sel = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i += 1; baris.push(sel.trim()); out.push(baris); baris = []; sel = ''; }
    else sel += ch;
  }
  if (sel || baris.length) { baris.push(sel.trim()); out.push(baris); }
  return out.filter((b) => b.some((x) => x !== ''));
}

/* ── menulis .xlsx ────────────────────────────────────────────────────── */

export interface LembarTulis {
  nama: string;
  /** Baris judul di atas tabel (opsional), mis. „DATABASE MASTER SISWA“. */
  judul?: string;
  kepala: string[];
  baris: (string | number | null | undefined)[][];
  lebar?: number[];
  /**
   * Kop resmi di atas tabel (dokumen lembaga): baris teks rata tengah selebar tabel — baris pertama nama induk, kedua
   * nama lembaga (besar), sisanya keterangan/alamat — dengan garis ganda di bawahnya dan logo di kiri.
   */
  kop?: { baris: string[]; logo?: { data: Uint8Array; jenis: 'png' | 'jpeg'; lebarPx?: number; tinggiPx?: number } };
  /** Judul & keterangan tabel di bawah kop, mis. „DAFTAR PESERTA DIDIK“ lalu „Tahun Pelajaran 2026/2027“. */
  subjudul?: string[];
  /** Blok tanda tangan di kanan bawah tabel: baris-baris teks; baris yang diawali „**“ ditulis tebal bergaris bawah. */
  kaki?: string[];
  /** Cetak mendatar (bawaan) atau tegak. */
  tegak?: boolean;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="0"/><fonts count="8"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="14"/><color rgb="FF0B5A3C"/><name val="Calibri"/></font><font><b/><sz val="12"/><color rgb="FF1F2A24"/><name val="Calibri"/></font><font><sz val="9"/><color rgb="FF52514E"/><name val="Calibri"/></font><font><b/><u/><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="17"/><color rgb="FF0B5A3C"/><name val="Cambria"/></font><font><b/><sz val="11"/><color rgb="FF8A6A16"/><name val="Cambria"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B5A3C"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFBF6E6"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="3"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9CFA8"/></left><right style="thin"><color rgb="FFD9CFA8"/></right><top style="thin"><color rgb="FFD9CFA8"/></top><bottom style="thin"><color rgb="FFD9CFA8"/></bottom><diagonal/></border><border><left/><right/><top/><bottom style="double"><color rgb="FF0B5A3C"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="14"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="49" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="6" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="7" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="4" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="3" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

/** Baris tempat judul kolom berada (untuk cetak: judul kolom diulang di setiap halaman). */
export function barisKepala(l: LembarTulis): number {
  const kop = l.kop ? l.kop.baris.length + 1 : 0;
  const sub = l.subjudul?.length ? l.subjudul.length + 1 : 0;
  return kop + sub + (l.judul ? 2 : 0) + 1;
}

function lembarXml(l: LembarTulis, adaGambar: boolean): string {
  const akhirKol = hurufKolom(Math.max(0, l.kepala.length - 1));
  const sel = (r: number, k: number, v: string | number | null | undefined, s: number) => {
    const ref = `${hurufKolom(k)}${r}`;
    if (v === null || v === undefined || v === '') return `<c r="${ref}" s="${s}"/>`;
    if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}" s="${s === 2 ? 12 : s === 4 ? 13 : s}"><v>${v}</v></c>`;
    return `<c r="${ref}" t="inlineStr" s="${s}"><is><t xml:space="preserve">${xmlEsc(String(v))}</t></is></c>`;
  };
  const rows: string[] = [];
  const gabung: string[] = [];
  let r = 1;
  if (l.kop) {
    l.kop.baris.forEach((t, i) => {
      const gaya = i === 1 || (l.kop!.baris.length === 1) ? 5 : i === 0 ? 6 : 7;
      rows.push(`<row r="${r}" ht="${gaya === 5 ? 26 : gaya === 6 ? 18 : 14}" customHeight="1">${sel(r, 0, t, gaya)}</row>`);
      gabung.push(`A${r}:${akhirKol}${r}`);
      r += 1;
    });
    rows.push(`<row r="${r}" ht="6" customHeight="1">${l.kepala.map((_, k) => sel(r, k, '', 8)).join('')}</row>`);
    r += 1;
  }
  if (l.subjudul?.length) {
    r += 0;
    l.subjudul.forEach((t, i) => { rows.push(`<row r="${r}" ht="${i === 0 ? 22 : 16}" customHeight="1">${sel(r, 0, t, i === 0 ? 9 : 7)}</row>`); gabung.push(`A${r}:${akhirKol}${r}`); r += 1; });
    r += 1;
  }
  if (l.judul) { rows.push(`<row r="${r}" ht="22" customHeight="1">${sel(r, 0, l.judul, 3)}</row>`); r += 2; }
  const awal = r;
  rows.push(`<row r="${awal}" ht="32" customHeight="1">${l.kepala.map((h, k) => sel(awal, k, h, 1)).join('')}</row>`);
  l.baris.forEach((b, i) => { const rr = awal + 1 + i; rows.push(`<row r="${rr}">${l.kepala.map((_, k) => sel(rr, k, b[k], i % 2 ? 4 : 2)).join('')}</row>`); });
  let akhir = awal + l.baris.length;
  if (l.kaki?.length) {
    const kol = Math.max(0, l.kepala.length - 3);
    akhir += 2;
    l.kaki.forEach((t, i) => {
      const rr = akhir + i;
      const tebal = t.startsWith('**');
      rows.push(`<row r="${rr}">${sel(rr, kol, tebal ? t.slice(2) : t, tebal ? 11 : 10)}</row>`);
      gabung.push(`${hurufKolom(kol)}${rr}:${akhirKol}${rr}`);
    });
  }
  const cols = l.kepala.map((h, k) => `<col min="${k + 1}" max="${k + 1}" width="${l.lebar?.[k] ?? Math.min(48, Math.max(8, h.length + 4))}" customWidth="1"/>`).join('');
  const filter = l.baris.length ? `<autoFilter ref="A${awal}:${akhirKol}${awal + l.baris.length}"/>` : '';
  const merge = gabung.length ? `<mergeCells count="${gabung.length}">${gabung.map((g) => `<mergeCell ref="${g}"/>`).join('')}</mergeCells>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="${l.kop ? 0 : 1}"><pane ySplit="${awal}" topLeftCell="A${awal + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${rows.join('')}</sheetData>${filter}${merge}<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="${l.tegak ? 'portrait' : 'landscape'}" fitToWidth="1" fitToHeight="0"/><headerFooter><oddFooter>&amp;L&amp;8${xmlEsc(l.nama)}&amp;R&amp;8Halaman &amp;P dari &amp;N</oddFooter></headerFooter>${adaGambar ? '<drawing r:id="rId1"/>' : ''}</worksheet>`;
}

const EMU = 9525; // 1 piksel = 9525 EMU

function gambarXml(g: NonNullable<NonNullable<LembarTulis['kop']>['logo']>): string {
  const tinggi = (g.tinggiPx ?? 74) * EMU, lebar = (g.lebarPx ?? 58) * EMU;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>${6 * EMU}</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>${4 * EMU}</xdr:rowOff></xdr:from><xdr:ext cx="${lebar}" cy="${tinggi}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="Logo"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${lebar}" cy="${tinggi}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>`;
}

export function tulisXlsx(lembar: LembarTulis[]): Uint8Array<ArrayBuffer> {
  const nama = lembar.map((l, i) => xmlEsc(l.nama.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || `Sheet${i + 1}`));
  const rel = (isi: string) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${isi}</Relationships>`;
  const gambar = lembar.map((l) => l.kop?.logo);
  const judulCetak = lembar.map((l, i) => `<definedName name="_xlnm.Print_Titles" localSheetId="${i}">'${nama[i]!.replace(/'/g, "''")}'!$${barisKepala(l)}:$${barisKepala(l)}</definedName>`).join('');
  const berkas: [string, Uint8Array][] = [
    ['[Content_Types].xml', enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${lembar.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>${gambar[i] ? `<Override PartName="/xl/drawings/drawing${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>` : ''}`).join('')}</Types>`)],
    ['_rels/.rels', enc.encode(rel('<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'))],
    ['xl/workbook.xml', enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${nama.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><definedNames>${judulCetak}</definedNames></workbook>`)],
    ['xl/_rels/workbook.xml.rels', enc.encode(rel(`${lembar.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${lembar.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`))],
    ['xl/styles.xml', enc.encode(STYLES)],
  ];
  lembar.forEach((l, i) => {
    const g = gambar[i];
    berkas.push([`xl/worksheets/sheet${i + 1}.xml`, enc.encode(lembarXml(l, Boolean(g)))]);
    if (!g) return;
    const ext = g.jenis === 'png' ? 'png' : 'jpeg';
    berkas.push([`xl/worksheets/_rels/sheet${i + 1}.xml.rels`, enc.encode(rel(`<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${i + 1}.xml"/>`))]);
    berkas.push([`xl/drawings/drawing${i + 1}.xml`, enc.encode(gambarXml(g))]);
    berkas.push([`xl/drawings/_rels/drawing${i + 1}.xml.rels`, enc.encode(rel(`<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo${i + 1}.${ext}"/>`))]);
    berkas.push([`xl/media/logo${i + 1}.${ext}`, g.data]);
  });
  return buatZip(berkas);
}

/** CSV dengan BOM (Excel membaca UTF-8), sel berawalan = + - @ diberi tanda kutip tunggal (anti formula). */
export function tulisCsv(kepala: string[], baris: (string | number | null | undefined)[][]): string {
  const sel = (v: unknown) => { const s = String(v ?? '').replace(/"/g, '""'); return /^[=+\-@]/.test(s) ? `"'${s}"` : `"${s}"`; };
  return `﻿${[kepala, ...baris].map((b) => b.map(sel).join(',')).join('\r\n')}\r\n`;
}
