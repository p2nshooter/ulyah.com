// Mengubah teks hasil `pdftotext` sebuah buku BSE menjadi bab-bab untuk pembaca jenius.es (docs/JENIUS-BLUEPRINT.md §0.26).
//  - hasPermission: hanya buku yang halaman hak ciptanya mengizinkan buku diunduh, digandakan, dicetak, dialihmediakan.
//  - segment: buang kepala/kaki halaman yang berulang dan nomor halaman, lewati halaman depan (kata pengantar, daftar isi),
//    potong per „BAB …“, susun ulang paragraf (baris terputus, kata berpenggal), tandai subjudul, berhenti di daftar pustaka.
// Dipakai oleh scripts/bse/run.mjs (GitHub Actions) dan diuji di test/bse.test.ts.

/** Kalimat izin BSE di halaman hak cipta (2008–2011). */
export function hasPermission(text) {
  const head = String(text).split('\f').slice(0, 14).join('\n').replace(/\s+/g, ' ').toLowerCase();
  if (/dialihmediakan|dialih\s*mediakan/.test(head)) return true;
  return /hak cipta/.test(head) && /dibeli/.test(head) && /(departemen|kementerian) pendidikan/.test(head) && /(diunduh|digandakan|difotokopi)/.test(head);
}

/** Penulis dari halaman hak cipta: baris setelah „Penulis/Penyusun/Pengarang“. */
export function findAuthors(text) {
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
    const clean = names.map((n) => n.replace(/^[:\-–\s]+|[,;\s]+$/g, '')).filter((n) => /[A-Za-z]{2,}/.test(n) && !/buku|kelas|untuk|pendidikan/i.test(n));
    if (clean.length) return clean.join(', ');
  }
  return '';
}

const CHAPTER = /^(BAB|Bab)\s+([IVXLCDM]+|\d{1,2})\b\.?\s*[:.\-–]?\s*(.*)$/;
const BACK = /^(DAFTAR PUSTAKA|Daftar Pustaka|GLOSARIUM|Glosarium|INDEKS|Indeks|DAFTAR ISTILAH|Daftar Istilah|LAMPIRAN|Lampiran)\s*$/;
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
  const clean = pages.map((p) => p.map((l) => (running.has(key(l)) || isNoise(l) ? '' : l)));
  // Awal bab: baris „BAB …“ di bagian atas halaman, bukan di halaman daftar isi (banyak „BAB“ atau titik-titik).
  const starts = [];
  clean.forEach((p, i) => {
    const all = p.filter((l) => CHAPTER.test(l));
    if (all.length !== 1 || p.some((l) => LEADER.test(l) && /\.{4,}/.test(l))) return;
    const top = p.filter(Boolean).slice(0, 6);
    const at = top.findIndex((l) => CHAPTER.test(l));
    if (at < 0) return;
    const line = top[at];
    if (/\.{4,}/.test(line)) return;
    const m = CHAPTER.exec(line);
    let title = (m[3] ?? '').trim();
    if (title.length < 3) {
      // Judul = baris setelah „BAB …“ sampai baris kosong atau subjudul pertama (A. …, 1.1 …), paling banyak dua baris.
      const rest = [];
      for (let j = p.indexOf(line) + 1; j < p.length && rest.length < 2; j += 1) {
        const l = p[j];
        if (!l) { if (rest.length) break; continue; }
        if (/^([A-H]|[1-9]\d?(\.\d{1,2}){0,2})\.?\s+\p{Lu}/u.test(l) || l.length > 90) break;
        rest.push(l);
      }
      title = rest.join(' ').trim();
    }
    starts.push({ page: i, label: `${m[1].toUpperCase() === 'BAB' ? 'Bab' : m[1]} ${m[2]}`, title });
  });
  // Bab yang sama tidak boleh muncul dua kali berturut-turut (judul bab di kepala halaman).
  const uniq = starts.filter((s, k) => k === 0 || s.label !== starts[k - 1].label);
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
        const body = p === s.page ? pl.filter((l) => !CHAPTER.test(l) && l !== s.title && !s.title.includes(l)) : pl;
        lines.push(...body, '');
      }
      const blocks = toBlocks(lines);
      const title = `${s.label}${s.title ? ` · ${titleCase(s.title)}` : ''}`.slice(0, 120);
      if (blocks.length) chapters.push({ title, blocks });
    });
  } else {
    // Tanpa penanda bab: bagian per ±10 halaman, mulai setelah daftar isi bila ada.
    let from = 0;
    clean.forEach((p, i) => { if (i < 20 && p.some((l) => /^(daftar isi|DAFTAR ISI)$/.test(l))) from = i + 1; });
    for (let p = from, n = 1; p < endPage; p += 10, n += 1) {
      const lines = [];
      for (let q = p; q < Math.min(endPage, p + 10); q += 1) lines.push(...clean[q], '');
      const blocks = toBlocks(lines);
      if (blocks.length) chapters.push({ title: `Bagian ${n}`, blocks });
    }
  }
  const words = chapters.reduce((a, c) => a + c.blocks.reduce((b, x) => b + (x.text.match(/\S+/g) ?? []).length, 0), 0);
  return { chapters, words };
}

function titleCase(s) {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t !== t.toUpperCase()) return t;
  const small = new Set(['dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'pada', 'dengan', 'dalam', 'atau', 'serta']);
  return t.toLowerCase().split(' ').map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}
