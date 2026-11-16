/**
 * Terjemah Indonesia untuk hadits yang di pustaka ulyah.com baru punya terjemah Inggris (Arba’in An-Nawawi, Hadits
 * Qudsi, 40 Hadits Ad-Dihlawi — „Indonesian translated on demand“ di seed). Pemilik, 15 Nov 2026: „Terjemahan hadits
 * jgn make bhs inggris, make bahasa Indonesia aja … hati2 dengan kitab2 agama islam untuk translate nya“.
 *
 * Mesin: Google Translate gratis tanpa kunci (gtx) — dijalankan di runner GitHub Actions atau mesin pengembang, tidak
 * memakai kuota Claude. Supaya bukan „terjemah sampah“:
 *  - istilah syariat dilindungi sebelum diterjemahkan dan dipasang kembali dengan ejaan baku Indonesia
 *    (Rasulullah ﷺ, radhiyallahu ‘anhu, shalat, zakat, haji, surga, neraka, hari Kiamat, Subhanahu wa Ta‘ala …);
 *  - kalimat diterjemahkan per kalimat (konteks utuh), hasilnya dirapikan (spasi, tanda baca, kutipan);
 *  - teks Arab (matan) tetap teks utama di buku; terjemah ditandai sumbernya di halaman buku.
 * Hasil disimpan di scripts/data/hadits-terjemah-id.json (dibaca scripts/buat-pustaka.ts) — idempoten: hadits yang
 * sudah diterjemahkan tidak diterjemahkan ulang kecuali `--ulang`.
 *
 * Pakai: npx tsx scripts/terjemah-hadits.ts [--ulang]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { barisInsert } from './sql-seed.ts';

const DIR = dirname(fileURLToPath(import.meta.url));
const SEED = join(DIR, '..', '..', 'packages', 'db-schema', 'seed');
const KELUAR = join(DIR, 'data', 'hadits-terjemah-id.json');
const KITAB = ['nawawi', 'qudsi', 'dehlawi'];
const ULANG = process.argv.includes('--ulang');

/** Istilah yang dilindungi: pola Inggris → token → ejaan Indonesia. Urutan penting (frasa panjang dulu). */
const ISTILAH: [RegExp, string][] = [
  [/\bOn the authority of\b/g, 'Dari'],
  [/\bon the authority of\b/g, 'dari'],
  [/\(\s*r\.?\s*a\.?\s*\)/gi, 'radhiyallahu ‘anhu'],
  [/\(?\s*may Allah be pleased with (?:both of )?them\s*\)?/gi, 'radhiyallahu ‘anhuma'],
  [/\(?\s*may Allah be pleased with (?:him|her)\s*\)?/gi, 'radhiyallahu ‘anhu'],
  [/\(?\s*may Allah have mercy (?:up)?on (?:him|her)\s*\)?/gi, 'rahimahullah'],
  [/\(?\s*(?:may )?(?:the )?peace and blessings of Allah be upon him\s*\)?|\(\s*ﷺ\s*\)|ﷺ|\(\s*pbuh\s*\)|\(\s*saw\s*\)/gi, 'ﷺ'],
  [/\(?\s*(?:Glorified and Exalted (?:be|is) He|Mighty and Majestic (?:be|is) He|the Mighty and Majestic|Blessed and Exalted (?:be|is) He|Exalted (?:be|is) He)\s*\)?/gi, 'Subhanahu wa Ta‘ala'],
  [/\b(?:the )?Messenger of Allah\b|\bAllah's Messenger\b|\bAllah’s Messenger\b/g, 'Rasulullah'],
  [/\bO Messenger of Allah\b/g, 'Wahai Rasulullah'],
  [/\bthe Prophet\b/g, 'Nabi'],
  [/\bProphets\b/g, 'para nabi'],
  [/\bAllah the Almighty\b/gi, 'Allah Ta‘ala'],
  [/\b(?:the )?Day of (?:Resurrection|Judgement|Judgment)\b/gi, 'hari Kiamat'],
  [/\bthe Hour\b/g, 'hari Kiamat'],
  [/\bParadise\b/gi, 'surga'],
  [/\bHell-?fire\b|\bthe Fire\b|\bHell\b/gi, 'neraka'],
  [/\b(?:the )?prayers?\b|\bsalah\b|\bsalat\b/gi, 'shalat'],
  [/\b(?:the )?obligatory charity\b|\bzakah\b|\bzakat\b/gi, 'zakat'],
  [/\b(?:the )?pilgrimage\b|\bHajj\b/gi, 'haji'],
  [/\bfast(?:ing)? (?:in|of|during) Ramadan\b/gi, 'puasa Ramadhan'],
  [/\bRamadan\b/gi, 'Ramadhan'],
  [/\bJinn\b/gi, 'jin'],
  [/\bQur['’]an\b/gi, 'Al-Qur’an'],
  [/\bIslam\b/g, 'Islam'],
  [/\bIman\b|\bfaith\b/g, 'iman'],
  [/\bIhsan\b/gi, 'ihsan'],
  [/\bExcellence\b/g, 'ihsan'],
  [/\b(?:intentions?|motives?)\b/gi, 'niat'],
  [/\b(?:deeds|actions)\b/gi, 'amal'],
  [/\bthe Last Day\b/gi, 'hari akhir'],
  [/\bGabriel\b|\bJibreel\b|\bJibril\b/g, 'Jibril'],
  [/\bsupplications?\b/gi, 'doa'],
  [/\bthe Sunnah\b/gi, 'sunnah'],
  [/\bthe Ka['`’‘]?bah\b|\bKa['`’‘]bah\b/gi, 'Ka‘bah'],
  [/\bthe House\b/g, 'Baitullah'],
  [/\b(?:Glory be to Allah|How perfect is Allah|Subhan ?Allah)\b/gi, 'Subhanallah'],
  [/\b(?:Praise be to Allah|All praise is due to Allah|Alhamdulillah)\b/gi, 'Alhamdulillah'],
  [/\bAllah is the Greatest\b|\bAllahu Akbar\b/gi, 'Allahu Akbar'],
  [/\bthere is no god but Allah\b|\bthere is none worthy of worship except Allah\b/gi, 'tidak ada ilah yang berhak disembah selain Allah'],
  [/\bGod\b/g, 'Allah'],
  [/\bLord\b/g, 'Rabb'],
];

/** Lindungi istilah: ganti dengan penanda angka yang tidak diubah mesin, lalu kembalikan. */
function lindungi(teks: string): { t: string; peta: string[] } {
  const peta: string[] = [];
  let t = teks;
  for (const [re, id] of ISTILAH) t = t.replace(re, () => { peta.push(id); return ` [[${peta.length - 1}]] `; });
  return { t: t.replace(/\s+/g, ' ').trim(), peta };
}
const pulihkan = (t: string, peta: string[]) => t.replace(/\[\s*\[\s*(\d+)\s*\]\s*\]/g, (_m, i: string) => peta[Number(i)] ?? '');

/** Tanda kutip lurus dipasangkan: pembuka „…“ diberi spasi sebelum dan huruf kapital sesudahnya, penutup sebaliknya. */
function kutip(t: string): string {
  let buka = true, out = '';
  for (let i = 0; i < t.length; i += 1) {
    const c = t[i]!;
    if (c === '"' || c === '“' || c === '”') {
      if (buka) { out = out.replace(/\s*$/, out && !/[(\[]$/.test(out) ? ' ' : ''); out += '“'; while (t[i + 1] === ' ') i += 1; }
      else { out = out.replace(/\s+$/, ''); out += '”'; if (t[i + 1] && /[A-Za-z0-9(]/.test(t[i + 1]!)) out += ' '; }
      buka = !buka;
      continue;
    }
    out += c;
  }
  return out.replace(/“([a-z])/g, (_m, a: string) => `“${a.toUpperCase()}`);
}

function rapikan(t: string): string {
  return kutip(t)
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
    .replace(/“\s+/g, '“').replace(/\s+”/g, '”').replace(/"\s+([^"]*?)\s+"/g, '"$1"')
    .replace(/\b(Rasulullah)\s+ﷺ\s+ﷺ/g, '$1 ﷺ')
    .replace(/\bNabi Muhammad\s+ﷺ\s+ﷺ/g, 'Nabi Muhammad ﷺ')
    // glosa ganda bawaan terjemah Inggris: „hijrahnya (hijrahnya)“, „haji (haji)“, „shalat (ritual shalat)“
    .replace(/(\S+)\s*\((?:[^()]{0,20}\s)?\1\)/gi, '$1')
    .replace(/\b(?:Atas|Berdasarkan) wewenang\b/g, 'Dari').replace(/\b(?:atas|berdasarkan) wewenang\b/g, 'dari')
    .replace(/\bSang (Rasulullah|Nabi)\b/g, '$1').replace(/\bsang (Rasulullah|Nabi)\b/g, '$1')
    .replace(/\s*\((?:niyyah|niyya|hijrah|hijra|iman|ihsan|islam|shalat|zakat|haji|hajj|salah)\)/gi, '')
    .replace(/\btidak ada (?:tuhan|Tuhan|ilah) (?:yang (?:berhak )?(?:disembah|patut disembah) )?(?:selain|kecuali) Allah\b/g, 'tidak ada ilah yang berhak disembah selain Allah')
    .replace(/\bYang (Rasulullah|Nabi)\b/g, '$1')
    .replace(/\butusan Allah\b/gi, 'Rasulullah')
    .replace(/\bRasul Allah\b/g, 'Rasulullah')
    .replace(/\bsholat\b|\bsalat\b/gi, 'shalat')
    .replace(/\bHari Kiamat\b/g, 'hari Kiamat')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*(.)/, (_m, a: string) => a.toUpperCase())
    .trim();
}

const tidur = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function gtx(teks: string, coba = 0): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(teks)}`;
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (pustaka yapida)' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = (await r.json()) as [[string, string][]];
    return j[0].map((x) => x[0]).join('');
  } catch (err) {
    if (coba >= 4) throw err;
    await tidur(1500 * (coba + 1));
    return gtx(teks, coba + 1);
  }
}

/** Terjemah per potongan ≤ 1.500 huruf (batas kalimat) agar konteks kalimat utuh. */
async function terjemah(teks: string): Promise<string> {
  const { t, peta } = lindungi(teks);
  const kalimat = t.split(/(?<=[.!?])\s+(?=[A-Z“"'(\[])/);
  const potong: string[] = [];
  let kini = '';
  for (const k of kalimat) { if ((kini + ' ' + k).length > 1500 && kini) { potong.push(kini); kini = k; } else kini = kini ? `${kini} ${k}` : k; }
  if (kini) potong.push(kini);
  const hasil: string[] = [];
  for (const p of potong) { hasil.push(await gtx(p)); await tidur(350); }
  return rapikan(pulihkan(hasil.join(' '), peta));
}

const EN = /\b(the|and|of|that|he|said|to|was|his|with|from|they|which|who|is)\b/gi;
const ID = /\b(dan|yang|dari|kepada|bahwa|beliau|telah|dengan|tidak|kami|mereka|itu|ini|adalah)\b/gi;
export const berbahasaInggris = (s: string) => (s.match(EN) ?? []).length > (s.match(ID) ?? []).length;

async function utama(): Promise<void> {
  const lama: Record<string, Record<string, string>> = existsSync(KELUAR) ? JSON.parse(readFileSync(KELUAR, 'utf8')) : {};
  if (process.argv.includes('--rapikan')) { // hanya merapikan ulang hasil tersimpan (aturan rapikan berubah), tanpa menerjemahkan
    for (const k of Object.keys(lama)) for (const n of Object.keys(lama[k]!)) lama[k]![n] = rapikan(lama[k]![n]!);
    writeFileSync(KELUAR, `${JSON.stringify(lama, null, 1)}\n`);
    console.log('dirapikan');
    return;
  }
  let baru = 0;
  for (const k of KITAB) {
    const f = join(SEED, `hadith_${k}.sql`);
    if (!existsSync(f)) continue;
    const rows = barisInsert(readFileSync(f, 'utf8'), 'hadits');
    lama[k] ??= {};
    for (const r of rows) {
      const no = String(r.hadith_number ?? r.id);
      const sumber = String(r.text_en || r.text_id || '').trim();
      if (!sumber || (!ULANG && lama[k]![no])) continue;
      if (r.text_id && !berbahasaInggris(String(r.text_id))) continue; // sudah Indonesia di sumber
      lama[k]![no] = await terjemah(sumber);
      baru += 1;
      if (baru % 10 === 0) { writeFileSync(KELUAR, `${JSON.stringify(lama, null, 1)}\n`); console.log(`… ${baru} hadits`); }
    }
  }
  writeFileSync(KELUAR, `${JSON.stringify(lama, null, 1)}\n`);
  console.log(`selesai: ${baru} hadits baru diterjemahkan → ${KELUAR}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await utama();
