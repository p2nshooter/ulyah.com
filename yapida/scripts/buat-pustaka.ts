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
import { barisInsert, type Baris } from './sql-seed.ts';

const DIR = dirname(fileURLToPath(import.meta.url));
const DATA = join(DIR, '..', '..', 'scripts', 'data');
const KARYA = join(DIR, '..', 'pustaka');
const SEED = join(DIR, '..', '..', 'packages', 'db-schema', 'seed');
const OUT = join(DIR, '..', 'public', 'assets', 'pustaka');

const baca = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
const bersih = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim();
const blok = (t: Blok['t'], x: unknown): Blok[] => { const v = bersih(x); return v ? pecahPanjang({ t, x: v }) : []; };

const buku: { meta: BukuMeta; bab: Bab[] }[] = [];
function tambah(m: Omit<BukuMeta, 'bab' | 'kata' | 'menit'>, bab: Bab[]): void {
  if (!bab.length) return;
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

/* ── kisah milik ulyah.com (seed SQL dibaca sebagai teks) ─────────────────── */

const sql = (f: string) => readFileSync(join(SEED, f), 'utf8');
const berkasSeed = readdirSync(SEED).filter((f) => f.endsWith('.sql'));
const judulKata = (s: string) => s.split(/[-_]/).filter(Boolean).map((w) => (w.length > 2 || /^(al|as|an)$/.test(w) ? w[0]!.toUpperCase() + w.slice(1) : w)).join(' ');
const LISENSI_ULYAH = 'Karya ulyah.com (milik pemilik), ditulis berdasarkan Al-Qur’an dan hadits';

const NABI = new Set(['adam', 'idris', 'nuh', 'hud', 'salih', 'ibrahim', 'lut', 'ismail', 'ishaq', 'yaqub', 'yusuf', 'ayyub', 'syuaib', 'musa', 'harun', 'dzulkifli', 'dawud', 'sulaiman', 'ilyas', 'ilyasa', 'yunus', 'zakariya', 'yahya', 'isa', 'muhammad']);
// Seri kisah (tabel stories): satu buku per seri, satu bab per episode.
const episode = new Map<string, Baris[]>();
for (const f of berkasSeed.filter((x) => x.startsWith('kisah_'))) {
  for (const r of barisInsert(sql(f), 'stories')) {
    if (!r.series_key || !r.body || !r.title) continue;
    const k = `${r.series_key}|${r.lang ?? 'id'}`;
    episode.set(k, [...(episode.get(k) ?? []), r]);
  }
}
for (const [k, eps] of [...episode.entries()].sort()) {
  const [seri, lang] = k.split('|') as [string, string];
  const urut = eps.sort((a, b) => Number(a.episode_number ?? 0) - Number(b.episode_number ?? 0));
  const bab: Bab[] = urut.map((e, i) => ({ n: i + 1, judul: bersih(e.title), blok: uraiNaskah(String(e.body), bersih(e.title)).bab.flatMap((b) => b.blok).map((b) => (lang === 'en' && b.t === 'p' ? { ...b, t: 'en' as const } : b)) }));
  const inti = seri.replace(/^kisah-(nabi-)?/, '');
  const nabi = NABI.has(inti);
  const namaId = `Kisah ${nabi ? 'Nabi ' : ''}${judulKata(inti)}${inti === 'muhammad' ? ' ﷺ' : ''}`;
  const nama = lang === 'en' ? `The Story of ${nabi ? 'Prophet ' : ''}${judulKata(inti)}${inti === 'muhammad' ? ' ﷺ' : ''}` : namaId;
  tambah({
    id: `k-kisah-${inti}${lang === 'id' ? '' : `-${lang}`}`.slice(0, 70), judul: nama, penulis: 'Tim Editorial ULYAH', rak: lang === 'en' ? ['kisah', 'anak-en'] : ['kisah', 'cerita'], suara: 'anak',
    mapel: 'Sejarah & kisah Islam', bahasa: lang === 'en' ? 'en' : 'id',
    ringkasan: lang === 'en' ? `${nama}: ${urut.length} episodes grounded in the verses of the Qur’an and authentic hadith, for children and families.` : `${nama}: ${urut.length} episode yang disusun dari ayat-ayat Al-Qur’an dan hadits shahih, enak dibacakan untuk anak dan keluarga.`,
    sumber: 'Pustaka kisah ulyah.com', sumberUrl: 'https://ulyah.com', lisensi: LISENSI_ULYAH, tag: ['kisah', 'nabi'],
  }, bab);
}

// Kisah anak muslim (tabel kisah_anak): versi Indonesia dan Inggris.
const anak = berkasSeed.filter((x) => x.startsWith('kisah_anak')).flatMap((f) => barisInsert(sql(f), 'kisah_anak')).sort((a, b) => Number(a.episode_order ?? 0) - Number(b.episode_order ?? 0));
if (anak.length) {
  for (const lang of ['id', 'en'] as const) {
    const t: Blok['t'] = lang === 'en' ? 'en' : 'p';
    tambah({
      id: lang === 'id' ? 'k-kisah-anak-muslim' : 'k-muslim-kids-stories', judul: lang === 'id' ? 'Kisah Anak Muslim' : 'Muslim Kids’ Stories', penulis: 'Tim Editorial ULYAH',
      rak: lang === 'id' ? ['cerita', 'ra', 'mi'] : ['anak-en', 'ra'], suara: 'balita', mapel: 'Akhlak', bahasa: lang,
      ringkasan: lang === 'id' ? `${anak.length} cerita pendek berurutan — setiap cerita menanamkan satu akhlak: jujur, berbagi, sabar, dan lainnya.` : `${anak.length} short stories, each teaching one simple Islamic value.`,
      sumber: 'Pustaka kisah ulyah.com', sumberUrl: 'https://ulyah.com', lisensi: LISENSI_ULYAH, tag: ['cerita anak', 'akhlak'],
    }, anak.map((e, i) => ({
      n: i + 1, judul: bersih(lang === 'id' ? e.title_id : e.title_en),
      blok: [...String(lang === 'id' ? e.body_id : e.body_en).split(/\n\s*\n/).flatMap((x) => blok(t, x)), ...blok('cat', `${lang === 'id' ? 'Pesan' : 'Lesson'}: ${bersih(lang === 'id' ? e.moral_id : e.moral_en)}`)],
    })));
  }
}

// Tokoh: nabi, sahabat, tabi'in, ulama (kisah_person + kisah_person_section).
const orang = berkasSeed.filter((x) => x.startsWith('kisah_')).flatMap((f) => barisInsert(sql(f), 'kisah_person'));
const bagian = berkasSeed.filter((x) => x.startsWith('kisah_')).flatMap((f) => barisInsert(sql(f), 'kisah_person_section'));
const GOL: Record<string, string> = { 'kisah-para-nabi': 'Kisah Para Nabi & Rasul', 'kisah-sahabat': 'Kisah Para Sahabat Nabi', 'kisah-tabiin': 'Kisah Para Tabi’in', 'kisah-tabiin-tabiin': 'Kisah Para Tabi’ut Tabi’in', 'kisah-ulama-dunia': 'Kisah Para Ulama Dunia' };
const golOrang = new Map<string, Baris[]>();
for (const o of orang) if (o.slug && o.category_slug) golOrang.set(o.category_slug, [...(golOrang.get(o.category_slug) ?? []), o]);
for (const [gol, daftar] of golOrang) {
  const urut = daftar.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
  tambah({
    id: `k-tokoh-${gol.replace(/^kisah-/, '')}`, judul: GOL[gol] ?? judulKata(gol), penulis: 'Tim Editorial ULYAH', rak: ['kisah', 'mts', 'guru'], suara: 'remaja', mapel: 'Sejarah Kebudayaan Islam', bahasa: 'id',
    ringkasan: `Riwayat singkat ${urut.length} tokoh: ${urut.slice(0, 5).map((o) => bersih(o.name_id)).join(', ')}${urut.length > 5 ? ', dan lainnya' : ''}.`,
    sumber: 'Pustaka kisah ulyah.com', sumberUrl: 'https://ulyah.com', lisensi: LISENSI_ULYAH, tag: ['tokoh', 'sejarah islam'],
  }, urut.map((o, i) => ({
    n: i + 1, judul: bersih(o.name_id), ...(o.name_ar ? { judulAr: bersih(o.name_ar) } : {}),
    blok: [...blok('cat', o.title_id), ...String(o.summary_id ?? '').split(/\n\s*\n/).flatMap((x) => blok('p', x)),
      ...bagian.filter((b) => b.person_slug === o.slug).sort((a, b) => Number(a.section_order) - Number(b.section_order))
        .flatMap((b) => [...blok('h', b.heading_id), ...String(b.body_id ?? '').split(/\n\s*\n/).flatMap((x) => blok('p', x)), ...(b.quran_refs ? blok('cat', `Rujukan: ${b.quran_refs}`) : [])])],
  })));
}

/* ── kitab-kitab hadits lengkap (seed ulyah.com) ─────────────────────────── */

const KITAB_HADITS: Record<string, { judul: string; judulAr: string; penulis: string; rak: string[] }> = {
  bukhari: { judul: 'Shahih Al-Bukhari', judulAr: 'صحيح البخاري', penulis: 'Imam Muhammad bin Isma’il Al-Bukhari (w. 256 H)', rak: ['hadits', 'guru'] },
  muslim: { judul: 'Shahih Muslim', judulAr: 'صحيح مسلم', penulis: 'Imam Muslim bin Al-Hajjaj (w. 261 H)', rak: ['hadits', 'guru'] },
  abudawud: { judul: 'Sunan Abu Dawud', judulAr: 'سنن أبي داود', penulis: 'Imam Abu Dawud As-Sijistani (w. 275 H)', rak: ['hadits'] },
  tirmidhi: { judul: 'Sunan At-Tirmidzi', judulAr: 'سنن الترمذي', penulis: 'Imam Abu ‘Isa At-Tirmidzi (w. 279 H)', rak: ['hadits'] },
  nasai: { judul: 'Sunan An-Nasa’i', judulAr: 'سنن النسائي', penulis: 'Imam Ahmad bin Syu’aib An-Nasa’i (w. 303 H)', rak: ['hadits'] },
  ibnmajah: { judul: 'Sunan Ibnu Majah', judulAr: 'سنن ابن ماجه', penulis: 'Imam Muhammad bin Yazid Ibnu Majah (w. 273 H)', rak: ['hadits'] },
  malik: { judul: 'Al-Muwaththa’', judulAr: 'الموطأ', penulis: 'Imam Malik bin Anas (w. 179 H)', rak: ['hadits', 'kitab'] },
  ahmad: { judul: 'Musnad Imam Ahmad', judulAr: 'مسند الإمام أحمد', penulis: 'Imam Ahmad bin Hanbal (w. 241 H)', rak: ['hadits'] },
  darimi: { judul: 'Sunan Ad-Darimi', judulAr: 'سنن الدارمي', penulis: 'Imam Abdullah bin Abdurrahman Ad-Darimi (w. 255 H)', rak: ['hadits'] },
  nawawi: { judul: 'Hadits Arba’in An-Nawawiyah', judulAr: 'الأربعون النووية', penulis: 'Imam Yahya bin Syaraf An-Nawawi (w. 676 H)', rak: ['hadits', 'mts', 'kitab', 'guru'] },
  qudsi: { judul: '40 Hadits Qudsi', judulAr: 'الأحاديث القدسية', penulis: 'Kumpulan hadits qudsi', rak: ['hadits', 'mts', 'guru'] },
  dehlawi: { judul: '40 Hadits Syah Waliyullah Ad-Dihlawi', judulAr: 'الأربعون للدهلوي', penulis: 'Syah Waliyullah Ad-Dihlawi (w. 1176 H)', rak: ['hadits'] },
};
const PER_BAB = 40;
/* Terjemah Indonesia untuk kitab yang di sumbernya baru berbahasa Inggris (Arba’in, Qudsi, Ad-Dihlawi) —
   scripts/terjemah-hadits.ts (pemilik: „Terjemahan hadits jgn make bhs inggris, make bahasa Indonesia aja“). */
const TERJEMAH_ID = (() => { try { return JSON.parse(readFileSync(join(DIR, 'data', 'hadits-terjemah-id.json'), 'utf8')) as Record<string, Record<string, string>>; } catch { return {}; } })();
const INGGRIS = (s: string) => (s.match(/\b(the|and|of|that|he|said|to|was|his|with|from|they|which|who|is)\b/gi) ?? []).length > (s.match(/\b(dan|yang|dari|kepada|bahwa|beliau|telah|dengan|tidak|kami|mereka|itu|ini|adalah)\b/gi) ?? []).length;
for (const [kol, info] of Object.entries(KITAB_HADITS)) {
  const f = `hadith_${kol}.sql`;
  if (!berkasSeed.includes(f)) continue;
  const rows = barisInsert(sql(f), 'hadits').filter((r) => r.text_ar || r.text_id).sort((a, b) => Number(a.hadith_number ?? a.id) - Number(b.hadith_number ?? b.id));
  let diterjemahkan = 0;
  for (const r of rows) {
    const id = TERJEMAH_ID[kol]?.[String(r.hadith_number ?? r.id)];
    if (id && (!r.text_id || INGGRIS(String(r.text_id)))) { r.text_id = id; diterjemahkan += 1; }
    else if (r.text_id && INGGRIS(String(r.text_id))) r.text_id = null; // jangan pernah menampilkan terjemah Inggris
  }
  const bab: Bab[] = [];
  for (let i = 0; i < rows.length; i += PER_BAB) {
    const potong = rows.slice(i, i + PER_BAB);
    const dari = potong[0]!.hadith_number ?? String(i + 1), sampai = potong.at(-1)!.hadith_number ?? String(i + potong.length);
    bab.push({
      n: bab.length + 1, judul: `Hadits no. ${dari}–${sampai}`,
      blok: potong.flatMap((r) => [...blok('h', `Hadits no. ${r.hadith_number ?? r.id}`), ...blok('ar', r.text_ar), ...blok('tr', r.text_id),
        ...((r.narrator || r.grade) ? blok('cat', [r.narrator ? `Perawi: ${bersih(r.narrator)}` : '', r.grade ? `Derajat: ${bersih(r.grade)}` : ''].filter(Boolean).join(' · ')) : [])]),
    });
  }
  tambah({
    id: `k-hadits-${kol}`, judul: info.judul, judulAr: info.judulAr, penulis: info.penulis, rak: info.rak, suara: 'dewasa', mapel: 'Hadits', bahasa: 'ar',
    ringkasan: `${info.judul} lengkap: ${rows.length.toLocaleString('id-ID')} hadits dengan teks Arab dan terjemah Indonesia, dibagi per ${PER_BAB} hadits agar nyaman dibaca dan dibacakan.`,
    sumber: 'Pustaka hadits ulyah.com (data yang sama dengan ulyah.com)', sumberUrl: 'https://ulyah.com', lisensi: diterjemahkan ? 'Matan hadits domain publik · terjemah Indonesia disusun pustaka Yapida dari terjemah Inggris hadith-api (domain publik) dengan glosarium istilah syariat' : 'Matan hadits domain publik · terjemah dari pustaka ulyah.com', tag: ['hadits', kol],
  }, bab);
}

/* ── buku pelajaran formal MI & MTs: BSE 2008–2011 yang boleh dialihmediakan (scripts/bse-ambil.ts) ───────── */

const BSE = join(DIR, '..', 'pustaka', 'bse');
for (const f of readdirSync(BSE, { withFileTypes: true }).filter((x) => x.isFile() && /^s-.*\.json$/.test(x.name)).map((x) => x.name).sort()) {
  const { meta, bab } = JSON.parse(readFileSync(join(BSE, f), 'utf8')) as { meta: BukuMeta; bab: Bab[] };
  const { bab: _b, kata: _k, menit: _m, ...m } = meta;
  // Nama penulis yang salah terbaca dari halaman hak cipta (potongan kalimat, „Naskah“, „/penerbit …“) → nama umum.
  if (!/^\p{Lu}[\p{L}.' -]{2,}/u.test(m.penulis) || /penerbit|hak cipta|naskah|diterbitkan|dilindungi|undang|^ilustrasi|^tim penulis bse/i.test(m.penulis)) m.penulis = 'Tim Penulis Buku Sekolah Elektronik';
  tambah(m, bab);
}

/* ── buku cerita bergambar Book Dash (GitHub, CC BY 4.0) ─────────────────── */

const bd = JSON.parse(readFileSync(join(KARYA, 'bookdash.json'), 'utf8')) as { buku: { slug: string; title: string; subtitle?: string; creator?: string; description?: string; halaman: { img: string; alt: string; teks: string[] }[] }[] };
for (const b of bd.buku) {
  const blokBd: Blok[] = b.halaman.flatMap((h) => [
    ...(h.img && /^[\w.-]{1,120}$/.test(h.img) ? [{ t: 'img' as const, x: `/pustaka/m/bd-${b.slug}/${h.img}`, a: bersih(h.alt).slice(0, 200) }] : []),
    ...h.teks.flatMap((x) => blok('en', x)),
  ]);
  const meta = { id: `k-bd-${b.slug}`.slice(0, 70), judul: b.title + (b.subtitle ? `: ${b.subtitle}` : ''), penulis: b.creator || 'Book Dash', rak: ['anak-en', 'ra'], suara: 'anak' as Suara, bahasa: 'en', mapel: 'Bahasa Inggris',
    ringkasan: b.description || 'Buku cerita bergambar berbahasa Inggris dari Book Dash.', sumber: 'Book Dash (bookdash.org) — github.com/bookdash/bookdash-books', sumberUrl: `https://github.com/bookdash/bookdash-books/tree/gh-pages/${b.slug}`,
    lisensi: 'CC BY 4.0 — ditampilkan ulang dalam format web tanpa mengubah teks', lisensiUrl: 'https://creativecommons.org/licenses/by/4.0/deed.id', sampulLuar: `/pustaka/m/bd-${b.slug}/cover.jpg`, bergambar: true, tag: ['cerita bergambar', 'english'] };
  tambah(meta, [{ n: 1, judul: b.title, blok: blokBd }]);
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
