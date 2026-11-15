/**
 * Membangkitkan katalog buku bawaan perpustakaan yapida.sch.id ke public/assets/pustaka/ (dijalankan ulang bila sumber
 * berubah: `node --import tsx scripts/buat-pustaka.ts`).
 *
 * Sumber — semuanya boleh disalin dan dibacakan:
 *  - kitab pesantren dan doa harian dari pustaka ulyah.com (matan domain publik; terjemah & penjelasan milik ulyah.com);
 *  - Aqidatul Awam lengkap (teks & terjemah: wahyu9kdl/islami, GPL-3.0);
 *  - Riyadhus Shalihin (Imam An-Nawawi, w. 676 H) Arab + terjemah Indonesia (carihadis.com lewat
 *    irsyadulibad/hadits-database) — data yang sama dengan ulyah.com;
 *  - karya Tim Pustaka Yayasan di yapida/pustaka/*.md (CC BY-SA 4.0).
 * Tidak ada teks yang diingat-ingat: semua diambil apa adanya dari berkas sumber di repositori ini.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hitungKata, menitBaca, pecahPanjang, ringkasBab, uraiNaskah, type Bab, type Blok, type BukuMeta } from '../src/data/buku.ts';
import type { Suara } from '../src/data/model.ts';

const DIR = dirname(fileURLToPath(import.meta.url));
const DATA = join(DIR, '..', '..', 'scripts', 'data');
const KARYA = join(DIR, '..', 'pustaka');
const OUT = join(DIR, '..', 'public', 'assets', 'pustaka');

const baca = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
const bersih = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim();
const blok = (t: Blok['t'], x: unknown): Blok[] => { const v = bersih(x); return v ? pecahPanjang({ t, x: v }) : []; };

const buku: { meta: BukuMeta; bab: Bab[] }[] = [];
function tambah(m: Omit<BukuMeta, 'bab' | 'kata' | 'menit'>, bab: Bab[]): void {
  const isi = bab.filter((b) => b.blok.length).map((b, i) => ({ ...b, n: i + 1 }));
  const kata = isi.reduce((a, b) => a + hitungKata(b.blok), 0);
  buku.push({ meta: { ...m, bab: ringkasBab(isi), kata, menit: menitBaca(kata) }, bab: isi });
}

/* ── kitab pesantren (ulyah.com) ─────────────────────────────────────────── */

interface Matn { id: string; t: string; tAr?: string; ar: string; tr: string; tf?: string; quran?: { s: number; v: number; label?: string }[]; hadits?: string[] }
interface Kitab { ar: string; id: string; auth: string; desc: string; babs: { id: string; name: string; ar?: string; matn: Matn[] }[] }
const KITAB_RAK: Record<string, { rak: string[]; suara: Suara; mapel: string }> = {
  safinah: { rak: ['kitab', 'mts'], suara: 'remaja', mapel: 'Fikih' },
  sullamtaufiq: { rak: ['kitab'], suara: 'remaja', mapel: 'Fikih & Tasawuf' },
  fathulqarib: { rak: ['kitab'], suara: 'dewasa', mapel: 'Fikih' },
  minhajultalibin: { rak: ['kitab'], suara: 'dewasa', mapel: 'Fikih' },
  ummulmabrahim: { rak: ['kitab'], suara: 'remaja', mapel: 'Akidah' },
  tijandaruri: { rak: ['kitab', 'mts'], suara: 'remaja', mapel: 'Akidah' },
  talimutaliam: { rak: ['kitab', 'guru'], suara: 'dewasa', mapel: 'Adab menuntut ilmu' },
  bidayatulhidayah: { rak: ['kitab', 'hadits', 'guru'], suara: 'dewasa', mapel: 'Akhlak' },
  nashaihuddiniyyah: { rak: ['kitab', 'hadits'], suara: 'dewasa', mapel: 'Akhlak' },
  jurumiyah: { rak: ['kitab', 'bahasa'], suara: 'remaja', mapel: 'Nahwu' },
  imrithi: { rak: ['kitab', 'bahasa'], suara: 'remaja', mapel: 'Nahwu' },
  alfiyah: { rak: ['kitab', 'bahasa'], suara: 'dewasa', mapel: 'Nahwu & Sharaf' },
};
const NAMA_HADITS: Record<string, string> = { bukhari: 'Bukhari', muslim: 'Muslim', abudawud: 'Abu Dawud', tirmidzi: 'Tirmidzi', tirmidhi: 'Tirmidzi', nasai: 'An-Nasa’i', ibnumajah: 'Ibnu Majah', ahmad: 'Ahmad', malik: 'Malik', darimi: 'Ad-Darimi' };
const pk = baca<{ cats: { name: string; ids: string[] }[]; data: Record<string, Kitab> }>('pesantren-kitabs.json');
for (const [slug, k] of Object.entries(pk.data)) {
  const r = KITAB_RAK[slug];
  if (!r) continue; // aqidatulawam diambil dari versi lengkapnya di bawah
  const bab: Bab[] = k.babs.map((b, i) => ({
    n: i + 1, judul: bersih(b.name), ...(b.ar ? { judulAr: bersih(b.ar) } : {}),
    blok: b.matn.flatMap((m) => {
      const dalil = [
        ...(m.quran ?? []).map((q) => `QS. ${q.s}:${q.v}${q.label ? ` (${q.label})` : ''}`),
        ...(m.hadits ?? []).map((h) => { const [kol, no] = h.split(':'); return `HR. ${NAMA_HADITS[kol!] ?? kol} no. ${no}`; }),
      ];
      return [...blok('h', m.t), ...blok('ar', m.ar), ...blok('tr', m.tr), ...blok('p', m.tf), ...(dalil.length ? blok('cat', `Dalil: ${dalil.join(' · ')}`) : [])];
    }),
  }));
  tambah({
    id: `k-${slug}`, judul: bersih(k.id), judulAr: bersih(k.ar), penulis: bersih(k.auth), rak: r.rak, suara: r.suara, mapel: r.mapel, bahasa: 'ar',
    ringkasan: bersih(k.desc), sumber: 'Pustaka kitab ulyah.com', sumberUrl: 'https://ulyah.com',
    lisensi: 'Matan domain publik · terjemah & penjelasan ulyah.com (dipakai atas izin pemilik)', tag: ['kitab kuning', r.mapel.toLowerCase()],
  }, bab);
}

/* ── Aqidatul Awam lengkap ───────────────────────────────────────────────── */

const aq = baca<{ title_ar: string; title_id: string; author: string; author_death_year: string; desc: string; source: string; babs: { name: string; ar?: string; matn: { n: number; ar: string; tr: string }[] }[] }>('aqidatul-awam-full.json');
tambah({
  id: 'k-aqidatul-awam', judul: aq.title_id, judulAr: aq.title_ar, penulis: `${aq.author} (w. ${aq.author_death_year})`, rak: ['kitab', 'tpq', 'mi'], suara: 'anak', mapel: 'Akidah',
  bahasa: 'ar', ringkasan: bersih(aq.desc), sumber: 'wahyu9kdl/islami', sumberUrl: 'https://github.com/wahyu9kdl/islami', lisensi: 'GPL-3.0', lisensiUrl: 'https://www.gnu.org/licenses/gpl-3.0.html',
  tag: ['nadhom', 'hafalan', 'akidah'],
}, aq.babs.map((b, i) => ({ n: i + 1, judul: bersih(b.name), ...(b.ar ? { judulAr: bersih(b.ar) } : {}), blok: b.matn.flatMap((m) => [...blok('h', `Bait ${m.n}`), ...blok('ar', m.ar), ...blok('tr', m.tr)]) })));

/* ── Doa & dzikir harian (ulyah.com) ─────────────────────────────────────── */

interface Amalan { title: string; ar?: string; latin?: string; tr?: string; note?: string; source?: string }
const am = baca<{ categories: { slug: string; grp: string; name_id: string; name_ar?: string; sort: number }[]; items: Record<string, Amalan[]> }>('amalan-harian.json');
const babDoa = (grp: string[]) => am.categories.filter((c) => grp.includes(c.grp)).sort((a, b) => a.sort - b.sort).map((c, i) => ({
  n: i + 1, judul: bersih(c.name_id), ...(c.name_ar ? { judulAr: bersih(c.name_ar) } : {}),
  blok: (am.items[c.slug] ?? []).flatMap((it) => [...blok('h', it.title), ...blok('ar', it.ar), ...blok('lt', it.latin), ...blok('tr', it.tr), ...blok('cat', [it.note, it.source].filter(Boolean).join(' — '))]),
}));
tambah({
  id: 'k-doa-harian', judul: 'Doa & Dzikir Harian', judulAr: 'الأدعية والأذكار اليومية', penulis: 'Pustaka ulyah.com', rak: ['doa', 'tpq', 'ra', 'mi'], suara: 'anak', mapel: 'Doa harian',
  bahasa: 'ar', ringkasan: 'Doa bangun tidur sampai tidur lagi, doa masuk masjid, makan, bepergian, serta dzikir pagi-petang dan setelah shalat — teks Arab, latin, arti, dan sumber haditsnya.',
  sumber: 'Pustaka amalan ulyah.com', sumberUrl: 'https://ulyah.com', lisensi: 'Doa dari hadits (domain publik) · susunan & terjemah ulyah.com (atas izin pemilik)', tag: ['doa', 'dzikir', 'hafalan'],
}, babDoa(['doa', 'dzikir']));
const lain = babDoa(['thibb', 'kecantikan']);
if (lain.length) tambah({
  id: 'k-adab-sunnah', judul: 'Sunnah Kesehatan & Fitrah', judulAr: 'الطب النبوي وسنن الفطرة', penulis: 'Pustaka ulyah.com', rak: ['doa', 'hadits'], suara: 'dewasa', mapel: 'Sunnah',
  bahasa: 'id', ringkasan: 'Thibbun nabawi, ruqyah syar’iyyah, dan sunnah-sunnah fitrah dengan dalilnya.', sumber: 'Pustaka amalan ulyah.com', sumberUrl: 'https://ulyah.com',
  lisensi: 'Dalil dari hadits (domain publik) · susunan & terjemah ulyah.com (atas izin pemilik)', tag: ['sunnah', 'kesehatan'],
}, lain);

/* ── Riyadhus Shalihin ───────────────────────────────────────────────────── */

const rs = baca<{ src_id: number; ar: string; tr: string | null }[]>('riyadhus-shalihin.json');
const PENANDA = /\s+(?=Allah\s+Ta'?ala|Allah\s+berfirman|Para\s+|Dari\s|Diriwayatkan|Rasulullah|Imam\s|Telah\s|Ketahuilah|Sabda|Sesungguhnya|Firman|Dan\s+dari\s|Abu\s|["“])/;
function judulRs(tr: string, n: number): string {
  const m = /^Bab\s*\d+\s*[.:]?\s*(.*)$/s.exec(tr);
  if (!m) return n === 1 ? 'Pendahuluan' : `Bab ${n}`;
  let t = m[1]!.split(PENANDA)[0]!.trim();
  if (t.length > 110) t = `${t.slice(0, 110).replace(/\s+\S*$/, '')}…`;
  return t.replace(/[.,;:]+$/, '') || `Bab ${n}`;
}
function judulRsAr(ar: string): string | undefined {
  const m = /^\d+\s*-\s*(باب[^:{«]*?)(?=\s+(?:قَالَ|قال|وقال|عن|وعن)\s|[:{«]|$)/.exec(ar);
  return m ? m[1]!.trim().slice(0, 140) : undefined;
}
// Nomor hadits "69 - فالأول"; rentang ayat "[الطلاق: 2 - 3]" (diikuti angka) bukan pemisah.
const segAr = (s: string) => s.split(/\s(?=\d{1,4}\s*-\s+[^\d\s])/).map((x) => x.trim()).filter(Boolean);
const segId = (s: string) => s.split(/\s(?=\d{1,4}\.\s)/).map((x) => x.trim()).filter(Boolean);
const noAr = (s: string) => /^(\d{1,4})\s*-\s/.exec(s)?.[1];
const noId = (s: string) => /^(\d{1,4})\.\s/.exec(s)?.[1];
tambah({
  id: 'k-riyadhus-shalihin', judul: 'Riyadhus Shalihin', judulAr: 'رياض الصالحين', penulis: 'Imam Yahya bin Syaraf An-Nawawi (w. 676 H)', rak: ['hadits', 'guru'], suara: 'dewasa', mapel: 'Hadits & akhlak',
  bahasa: 'ar', ringkasan: 'Kitab hadits akhlak paling banyak dikaji di majelis taklim dan pesantren: 372 bab, setiap bab dibuka dengan ayat Al-Qur’an lalu hadits-hadits pilihan — Arab lengkap dengan terjemah Indonesia.',
  sumber: 'carihadis.com (lewat irsyadulibad/hadits-database), sama dengan ulyah.com', sumberUrl: 'https://github.com/irsyadulibad/hadits-database', lisensi: 'Matan domain publik · terjemah dari sumber terbuka', tag: ['hadits', 'akhlak', 'majelis taklim'],
}, rs.sort((a, b) => a.src_id - b.src_id).map((e, i) => {
  const tr = bersih(e.tr).replace(/Silah?kan kunjungi\s+\S+/gi, '').trim();
  const ar = bersih(e.ar);
  // "Bab 6. Ketaqwaan …": kepala bab dilepas dulu agar tidak terbaca sebagai nomor hadits.
  const kepala = /^Bab\s*\d+\s*[.:]?\s*/.exec(tr)?.[0] ?? '';
  const sa = segAr(ar), si = segId(tr.slice(kepala.length));
  if (si.length) si[0] = `${kepala}${si[0]}`;
  const out: Blok[] = [];
  // Pembuka bab (ayat-ayat) berpasangan; hadits berikutnya dipasangkan menurut nomornya.
  const sisaId = new Map<string, string>();
  si.slice(1).forEach((s) => { const n = noId(s); if (n && !sisaId.has(n)) sisaId.set(n, s); });
  const dipakai = new Set<string>();
  sa.forEach((s, k) => {
    out.push(...blok('ar', s));
    const pas = k === 0 ? si[0] : (() => { const n = noAr(s); const t = n ? sisaId.get(n) : undefined; if (n && t) dipakai.add(n); return t; })();
    if (pas) out.push(...blok('tr', pas));
  });
  si.slice(1).forEach((s) => { const n = noId(s); if (!n || !dipakai.has(n)) out.push(...blok('tr', s)); });
  const judulAr = judulRsAr(ar);
  return { n: i + 1, judul: judulRs(tr, e.src_id), ...(judulAr ? { judulAr } : {}), blok: out };
}));

/* ── karya Tim Pustaka Yayasan ───────────────────────────────────────────── */

for (const f of readdirSync(KARYA).filter((x) => x.endsWith('.md')).sort()) {
  const { meta, bab } = uraiNaskah(readFileSync(join(KARYA, f), 'utf8'));
  const wajib = ['id', 'judul', 'rak', 'suara', 'ringkasan'];
  for (const k of wajib) if (!meta[k]) throw new Error(`${f}: front matter "${k}" kosong`);
  tambah({
    id: `k-${meta.id}`, judul: meta.judul!, ...(meta.judulAr ? { judulAr: meta.judulAr } : {}), penulis: meta.penulis ?? 'Tim Pustaka Yayasan Al-Huda Yapida',
    rak: meta.rak!.split(',').map((s) => s.trim()), suara: meta.suara as Suara, ...(meta.kelas ? { kelas: meta.kelas } : {}), ...(meta.mapel ? { mapel: meta.mapel } : {}),
    bahasa: meta.bahasa ?? 'id', ringkasan: meta.ringkasan!, sumber: meta.sumber ?? 'Karya Tim Pustaka Yayasan Al-Huda Yapida',
    lisensi: meta.lisensi ?? 'CC BY-SA 4.0', lisensiUrl: meta.lisensiUrl ?? 'https://creativecommons.org/licenses/by-sa/4.0/deed.id',
    tag: (meta.tag ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  }, bab);
}

/* ── tulis ───────────────────────────────────────────────────────────────── */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'b'), { recursive: true });
const ids = new Set<string>();
for (const b of buku) {
  if (ids.has(b.meta.id)) throw new Error(`id ganda: ${b.meta.id}`);
  ids.add(b.meta.id);
  mkdirSync(join(OUT, 'b', b.meta.id), { recursive: true });
  for (const bab of b.bab) writeFileSync(join(OUT, 'b', b.meta.id, `${bab.n}.json`), JSON.stringify(bab));
}
writeFileSync(join(OUT, 'katalog.json'), JSON.stringify({ v: 1, buku: buku.map((b) => b.meta) }));
const totalBab = buku.reduce((a, b) => a + b.bab.length, 0);
const totalKata = buku.reduce((a, b) => a + b.meta.kata, 0);
console.log(`${buku.length} buku, ${totalBab} bab, ${totalKata.toLocaleString('id-ID')} kata → ${OUT}`);
