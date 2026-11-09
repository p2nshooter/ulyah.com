// Mengubah teks hasil `pdftotext` sebuah buku BSE menjadi bab-bab untuk pembaca jenius.es (docs/JENIUS-BLUEPRINT.md §0.26).
//  - hasPermission: hanya buku yang halaman hak ciptanya mengizinkan buku diunduh, digandakan, dicetak, dialihmediakan.
//  - segment: buang kepala/kaki halaman yang berulang dan nomor halaman, lewati halaman depan (kata pengantar, daftar isi),
//    potong per „BAB …“, susun ulang paragraf (baris terputus, kata berpenggal), tandai subjudul, berhenti di daftar pustaka.
// Dipakai oleh scripts/bse/run.mjs (GitHub Actions) dan diuji di test/bse.test.ts.

/** Versi pengonversi: buku hasil versi lama dikonversi ulang otomatis oleh run.mjs. */
export const VERSION = 5;

/** Kalimat izin BSE di halaman hak cipta (2008–2011). */
export function hasPermission(text) {
  const head = String(text).split('\f').slice(0, 14).join('\n').replace(/\s+/g, ' ').toLowerCase();
  if (/dialihmediakan|dialih\s*mediakan/.test(head)) return true;
  return /hak cipta/.test(head) && /dibeli/.test(head) && /(departemen|kementerian) pendidikan/.test(head) && /(diunduh|digandakan|difotokopi)/.test(head);
}

/**
 * Penulis dari baris katalog (KDT) di halaman hak cipta, mis. „Fisika 1 : Untuk SMA/MA Kelas X / Setya Nurachmandani ;
 * Editor … — Jakarta : Pusat Perbukuan“; bila tidak ada, dari baris setelah „Penulis/Penyusun“.
 */
export function findAuthors(text) {
  const flat = String(text).split('\f').slice(0, 12).join(' ').replace(/\s+/g, ' ');
  const at = flat.search(/[—–-]{1,2}\s*Jakarta\s*:?\s*Pusat Perbukuan/i);
  if (at > 0) {
    const before = flat.slice(Math.max(0, at - 260), at);
    const slash = before.lastIndexOf('/');
    if (slash >= 0) {
      let a = before.slice(slash + 1).split(';')[0];
      a = a.split(/\s*[—–]\s*|\s*\.\s*-{1,2}\s*|\s+Cet\.?\s*\d|[,.;]?\s*\beditor\b|[,.;]?\s*\bpenyunting\b|[,.;]?\s*\bilustra/i)[0];
      a = a.replace(/^\s*(penulis|penyusun|pengarang|oleh)\s*,?\s*/i, '').replace(/(…|\.{3})?\s*\[?\s*et\.?\s*al\.?\s*\]?/gi, ' dkk.').replace(/…|\.{3}/g, ' dkk.').replace(/(\s*dkk\.?)+/g, ' dkk.').replace(/[\s.,—–-]+$/g, '').replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim();
      if (/dkk\.?$/.test(a)) a = a.replace(/,?\s*dkk\.?$/, ', dkk.');
      a = a.replace(/,(?=\S)/g, ', ').replace(/^Bahasa\s+(?=\p{Lu})/u, '');
      if (a.length >= 3 && a.length <= 140 && /\p{Lu}/u.test(a) && !/jakarta|pusat|departemen|untuk|kelas/i.test(a) && !/^(naskah|penulis|tim|pengantar|editor)$/i.test(a)) return a;
    }
  }
  return authorsFromLabels(text);
}

const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };
const num = (v) => (/^\d+$/.test(v) ? Number(v) : ROMAN[String(v).toUpperCase()] ?? 0);

/**
 * Jenjang & kelas dari halaman hak cipta/sampul PDF („Untuk SD/MI Kelas IV“, „untuk SMA / MA Kelas X“, „Sekolah Menengah
 * Kejuruan“) — lebih tepat daripada indeks sumber, yang kadang menaruh buku SMK „Jilid 3“ di folder Kelas 1.
 */
export function findLevel(text, title = '') {
  const head = String(text).split('\f').slice(0, 12).join(' ').replace(/\s+/g, ' ');
  const jilid = Number((title.match(/Jilid\s+(\d)/i) || [])[1] || 0);
  if (/Sekolah Menengah Kejuruan|untuk\s+SMK|\bSMK\s*\/\s*MAK\b/i.test(head)) {
    const k = head.match(/(?:SMK|Kejuruan)[^.]{0,40}?Kelas\s+([IVX]{1,4}|\d{1,2})\b/i);
    const g = k ? num(k[1]) : 0;
    return { level: 'smk', grade: g >= 10 && g <= 12 ? g : jilid >= 1 && jilid <= 3 ? 9 + jilid : 10 };
  }
  const m = head.match(/untuk\s+(?:siswa\s+)?(SD|SMP|SMA|MI|MTs|MA|Sekolah Dasar|Sekolah Menengah Pertama|Sekolah Menengah Atas)\b[^.]{0,40}?kelas\s+([IVX]{1,4}|\d{1,2})\b/i)
    || head.match(/\b(SD|SMP|SMA)\s*\/\s*(?:MI|MTs|MA)\s*,?\s*Kelas\s+([IVX]{1,4}|\d{1,2})\b/i);
  if (!m) return null;
  const g = num(m[2]);
  const k = m[1].toLowerCase();
  const level = /^(sd|mi|sekolah dasar)$/.test(k) ? 'sd' : /^(smp|mts|sekolah menengah pertama)$/.test(k) ? 'smp' : 'sma';
  const ok = { sd: [1, 6], smp: [7, 9], sma: [10, 12] }[level];
  // SMP/SMA kadang menulis kelas 1–3 (urutan lama): ubah ke 7–9 / 10–12.
  const grade = g >= ok[0] && g <= ok[1] ? g : level !== 'sd' && g >= 1 && g <= 3 ? ok[0] + g - 1 : 0;
  return grade ? { level, grade } : null;
}

function authorsFromLabels(text) {
  const lines = String(text).split('\f').slice(0, 10).join('\n').split('\n').map((l) => l.trim());
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^(penulis|penyusun|pengarang|disusun oleh|ditulis oleh)\s*:?\s*(.*)$/i.exec(lines[i]);
    if (!m) continue;
    const names = [];
    if (m[2] && m[2].length > 2) names.push(m[2]);
    for (let j = i + 1; j < Math.min(lines.length, i + 8) && names.length < 6; j += 1) {
      const l = lines[j];
      if (!l) { if (names.length) break; continue; }
      if (/^(editor|penyunting|ilustrator|ilustrasi|desain|perancang|layout|tata letak|ukuran|isbn|\d)/i.test(l) || l.length > 60) break;
      names.push(l);
    }
    const clean = names.map((n) => n.replace(/^[:\-–\s]+|[,;\s]+$/g, '')).filter((n) => /^\p{Lu}/u.test(n) && /[A-Za-z]{2,}/.test(n) && !/\d|buku|kelas|untuk|pendidikan|pengantar|penerbit|editor|ilustra|desain|ukuran/i.test(n) && !/^(naskah|penulis|tim|penyusun)$/i.test(n));
    if (clean.length) return clean.join(', ');
  }
  return '';
}

const CHAPTER = /^(BAB|Bab)\s+([IVXLCDM]+|\d{1,2})\b\.?\s*[:.\-–]?\s*(.*)$/;
const BACK = /^(DAFTAR PUSTAKA|Daftar Pustaka|GLOSARIUM|Glosarium|INDEKS|Indeks|DAFTAR ISTILAH|Daftar Istilah|LAMPIRAN|Lampiran|KUNCI JAWABAN|Kunci Jawaban)\s*$/i;
const LEADER = /\.{4,}|…{2,}|\s\d{1,3}$/;

const norm = (l) => l.replace(/\s+/g, ' ').trim();
const key = (l) => norm(l).toLowerCase().replace(/\d+/g, '#');

/** Kepala/kaki halaman: baris yang berulang di bagian atas/bawah banyak halaman. */
function runningLines(pages) {
  const count = new Map();
  for (const p of pages) {
    const ls = p.filter(Boolean);
    const edge = new Set([...ls.slice(0, 3), ...ls.slice(-3)].map(key));
    for (const k of edge) count.set(k, (count.get(k) ?? 0) + 1);
  }
  const min = Math.max(4, Math.floor(pages.length * 0.12));
  return new Set([...count].filter(([k, n]) => n >= min && k.length < 90).map(([k]) => k));
}

function isNoise(l) {
  if (/^[\divxlcdm]{1,6}$/i.test(l)) return true; // nomor halaman
  // Potongan tanda air/alamat situs („da li.c om“, „ka rta .go .id“): semua token sangat pendek atau berupa domain.
  const tok = l.split(/\s+/).filter(Boolean);
  if (tok.length >= 2 && !/^bab\b/i.test(l) && tok.every((t) => t.replace(/[^\p{L}]/gu, '').length <= 3)) return true;
  if (/^\S*\.(com|co|id|net|org|go)(\.\S*)?$/i.test(l.replace(/\s+/g, ''))) return true;
  const letters = (l.match(/\p{L}/gu) ?? []).length;
  if (l.length > 3 && letters / l.length < 0.4) return true; // tabel angka, rumus rusak
  return false;
}

/** Baris pendek tanpa titik akhir yang tampak sebagai subjudul (A. …, 1.2 …, HURUF KAPITAL). */
function isHeading(l) {
  if (l.length > 80 || l.length < 3 || /[.,;:]$/.test(l)) return false;
  if (/^([A-H]|[1-9]\d?(\.\d{1,2}){0,2})\.?\s+\p{Lu}/u.test(l)) return true;
  const letters = l.replace(/[^\p{L}]/gu, '');
  return letters.length >= 4 && letters === letters.toUpperCase() && !/^(BAB)\b/.test(l);
}

function dehyphen(prev, next) {
  // „kata-\nlanjutan“: imbuhan terpenggal digabung; pengulangan („anak-\nanak“) tetap memakai tanda hubung.
  const m = /([\p{L}]+)-$/u.exec(prev);
  const n = /^([\p{Ll}][\p{L}]*)/u.exec(next);
  if (!m || !n) return null;
  if (m[1].toLowerCase() === n[1].toLowerCase()) return `${prev}${next}`;
  return `${prev.slice(0, -1)}${next}`;
}

/** Teks satu bab → blok paragraf dan subjudul. */
function toBlocks(lines) {
  const lens = lines.filter((l) => l.length > 20).map((l) => l.length).sort((a, b) => a - b);
  const median = lens[Math.floor(lens.length / 2)] ?? 70;
  const blocks = [];
  let cur = '';
  const flush = () => {
    const t = cur.replace(/\s+/g, ' ').trim();
    if (t && (t.match(/\p{L}/gu) ?? []).length >= 3) {
      // Paragraf sangat panjang dipecah di batas kalimat (halaman pembaca tetap rapi).
      if (t.length <= 1600) blocks.push({ t: 'p', text: t });
      else {
        let part = '';
        for (const s of t.split(/(?<=[.!?])\s+(?=\p{Lu})/u)) {
          if ((part + ' ' + s).length > 1200 && part) { blocks.push({ t: 'p', text: part.trim() }); part = ''; }
          part += ` ${s}`;
        }
        if (part.trim()) blocks.push({ t: 'p', text: part.trim() });
      }
    }
    cur = '';
  };
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    if (!l) { flush(); continue; }
    if (isHeading(l) && !cur) { blocks.push({ t: 'h', text: l.replace(/\s+/g, ' ') }); continue; }
    if (cur) {
      const joined = /-$/.test(cur) ? dehyphen(cur, l) : null;
      cur = joined ?? `${cur} ${l}`;
    } else cur = l;
    // Baris pendek yang berakhir dengan titik: akhir paragraf.
    if (/[.!?:"”]$/.test(l) && l.length < median * 0.72) flush();
  }
  flush();
  return blocks;
}

/**
 * Teks pdftotext (halaman dipisah \f) → { chapters: [{ title, blocks }], words }.
 * Halaman sebelum bab pertama (sampul, hak cipta, kata pengantar, daftar isi) dan setelah daftar pustaka dilewati.
 */
export function segment(raw) {
  const pages = String(raw).replace(/\r/g, '').split('\f').map((p) => p.split('\n').map(norm));
  const running = runningLines(pages);
  // Nomor bab di baris sendiri sesudah „Bab“ tetap disimpan (bukan nomor halaman).
  const clean = pages.map((p) => {
    let prev = '';
    return p.map((l) => {
      const keep = /^bab$/i.test(prev) && /^([IVXLCDM]+|\d{1,2})$/i.test(l);
      if (l) prev = l;
      return keep ? l : running.has(key(l)) || isNoise(l) ? '' : l;
    });
  });
  // Awal bab (pola buku BSE): „Bab …“ di baris paling atas halaman (nomor/judul kadang di baris berikutnya), atau halaman
  // pembuka dengan „Tujuan Pembelajaran“ di bagian atasnya. Halaman daftar isi/indeks (banyak „Bab“, titik-titik) dilewati.
  // Buku tanpa „Bab“ (mis. Bahasa Indonesia) memakai „Pelajaran 1“, „Unit 1“, atau „Tema 1“ sebagai pembuka bab.
  const anyBab = clean.some((p) => p.filter(Boolean).slice(0, 4).some((l) => /^bab\b/i.test(l)));
  const MARK = anyBab ? /^bab\b/i : /^(bab|pelajaran\s+\d{1,2}|unit\s+\d{1,2}|tema\s+\d{1,2})\b/i;
  const starts = [];
  clean.forEach((p, i) => {
    const lines = p.filter(Boolean);
    const babLines = lines.filter((l) => MARK.test(l));
    if (babLines.length > 1 || lines.some((l) => /\.{6,}|…{3,}/.test(l) || /^daftar isi$/i.test(l))) return;
    const top = lines.slice(0, 4);
    const byBab = top.findIndex((l) => MARK.test(l) && l.length < 90);
    const tujuan = lines.slice(0, 14).findIndex((l) => /^tujuan pembelajaran\b/i.test(l));
    if (byBab < 0 && tujuan < 0) return;
    // Judul: baris atas halaman tanpa kata „Bab“, nomor tunggal, dan bagian sesudah „Tujuan Pembelajaran“.
    let num = '';
    const titleLines = [];
    let seen = 0;
    for (const l of p) {
      if (!l) { if (titleLines.length) break; continue; }
      if (++seen > 9) break;
      if (/^tujuan pembelajaran\b/i.test(l)) break;
      const m = /^(?:bab|pelajaran|unit|tema)\b\.?\s*([IVXLCDM]+|\d{1,2})?\b\.?\s*[:.\-–]?\s*(.*)$/i.exec(l);
      if (m) { if (m[1]) num = m[1]; if (m[2] && m[2].length > 2 && !/^\d+$/.test(m[2])) titleLines.push(m[2]); continue; }
      if (/^([IVXLCDM]+|\d{1,2})$/.test(l)) { if (!num) num = l; continue; }
      if (l.length > 70 || /[.,;]$/.test(l) || !titleish(l) || /^([A-H]|[1-9]\d?(\.\d{1,2}){0,2})\.?\s+\p{Lu}/u.test(l) || /^(peta konsep|kata kunci|manfaat pembelajaran|standar kompetensi|kompetensi dasar)/i.test(l)) break;
      if (titleLines.length < 3) titleLines.push(l);
    }
    starts.push({ page: i, num, title: titleLines.join(' ').replace(/\s+/g, ' ').trim() });
  });
  // Pembuka bab di halaman bersebelahan (sampul bab lalu halaman „Tujuan Pembelajaran“) dihitung satu.
  const merged = starts.filter((s, k) => k === 0 || s.page - starts[k - 1].page > 1);
  merged.forEach((s, k) => {
    s.label = `Bab ${s.num || k + 1}`;
    s.title = s.title.replace(/\s\d{1,2}(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
    if (!/\p{L}{3,}/u.test(s.title)) s.title = '';
  });
  const uniq = merged;
  let endPage = clean.length;
  const lastStart = uniq.length ? uniq[uniq.length - 1].page : 0;
  for (let i = lastStart + 1; i < clean.length; i += 1) {
    if (clean[i].filter(Boolean).slice(0, 3).some((l) => BACK.test(l))) { endPage = i; break; }
  }
  const chapters = [];
  if (uniq.length >= 2) {
    uniq.forEach((s, k) => {
      const to = k + 1 < uniq.length ? uniq[k + 1].page : endPage;
      const lines = [];
      for (let p = s.page; p < to; p += 1) {
        const pl = clean[p];
        // Baris judul bab di halaman pertama bab tidak diulang sebagai paragraf.
        const tl = s.title.toLowerCase();
        const body = p === s.page ? pl.filter((l, j) => !(j < 14 && l && (/^bab\b/i.test(l) || /^([IVXLCDM]+|\d{1,2})$/.test(l) || tl.includes(l.toLowerCase())))) : pl;
        lines.push(...body, '');
      }
      const blocks = toBlocks(lines);
      const title = `${s.label}${s.title ? ` · ${titleCase(s.title)}` : ''}`.slice(0, 140);
      if (blocks.length) chapters.push({ title, blocks });
    });
  } else {
    // Tanpa penanda bab: bagian per ±10 halaman, mulai setelah daftar isi bila ada.
    let from = 0;
    clean.forEach((p, i) => { if (i < 24 && p.some((l) => /^daftar isi$/i.test(l))) from = i + 1; });
    for (let p = from, n = 1; p < endPage; p += 10, n += 1) {
      const lines = [];
      for (let q = p; q < Math.min(endPage, p + 10); q += 1) lines.push(...clean[q], '');
      const blocks = toBlocks(lines);
      if (blocks.length) chapters.push({ title: `Bagian ${n}`, blocks });
    }
  }
  const words = chapters.reduce((a, c) => a + c.blocks.reduce((b, x) => b + (x.text.match(/\S+/g) ?? []).length, 0), 0);
  // Mutu teks: bagian kata yang tampak seperti kata sungguhan (≥ 3 huruf). PDF dengan teks rusak/tanda air dilewati.
  const toks = chapters.flatMap((c) => c.blocks.flatMap((x) => x.text.split(/\s+/))).filter(Boolean);
  const real = toks.filter((t) => /^[\p{L}'’-]{3,}[.,;:!?)"”]*$/u.test(t.replace(/^[("“]/, ''))).length;
  const quality = toks.length ? real / toks.length : 0;
  return { chapters, words, quality };
}

/** Baris berbentuk judul: huruf kapital semua, sebagian besar kata berhuruf awal kapital, atau sangat pendek. */
function titleish(l) {
  const w = l.split(/\s+/).filter(Boolean);
  const caps = w.filter((x) => /^\p{Lu}/u.test(x)).length;
  return l === l.toUpperCase() || w.length <= 3 || caps / w.length >= 0.5;
}

function titleCase(s) {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t !== t.toUpperCase()) return t;
  const small = new Set(['dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'pada', 'dengan', 'dalam', 'atau', 'serta']);
  return t.toLowerCase().split(' ').map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}
