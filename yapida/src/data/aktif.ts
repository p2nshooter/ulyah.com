/**
 * Semua buku anak dibuat interaktif (pemilik, 15 Nov 2026: „Semua buku anak bikin lebih interaktif bukan hanya padi").
 *
 * Setiap bab buku anak (suara balita/anak: RA, cerita, kisah, buku anak berbahasa Inggris/Arab, TPQ) yang belum punya
 * permainan tertulis diberi, dari isi bab itu sendiri:
 *   1. adegan interaktif di awal bab — sesuai tema kata-katanya, atau adegan cadangan yang tetap untuk bab itu;
 *   2. „Ayo Bermain!" di akhir bab:
 *      - kuis isian: satu kata penting dari kalimat bab dihilangkan, pilih kata yang tepat (pengecoh dari bab yang sama);
 *      - urutkan cerita: empat kalimat bab diacak, anak menyusunnya kembali sesuai urutan cerita;
 *      - kartu balik: teks Arab ↔ artinya (doa, kosakata, ayat pendek).
 * Hasilnya tetap untuk setiap (buku, bab) — dibangkitkan dengan bilangan acak berbenih, bukan Math.random.
 * Nama Allah, nabi, dan sebutan mulia tidak pernah dijadikan jawaban atau pengecoh.
 */
import { AKTIVITAS, suasanaBab, type Bab, type Blok, type BukuMeta } from './buku.ts';

const ANAK = new Set(['balita', 'anak']);
const CADANGAN = ['rumah', 'kebun', 'langit', 'gunung'];
const CADANGAN_KISAH = ['gurun', 'gunung', 'langit', 'rumah'];

const STOP_ID = new Set(`yang dan di ke dari itu ini dengan untuk pada adalah dalam tidak akan juga atau karena sudah telah ada
  mereka kami kita kamu dia ia saya aku engkau beliau oleh sebagai seperti para lalu kemudian maka agar supaya bagi tetapi
  namun jika kalau saat ketika setelah sebelum hingga sampai sangat lebih masih pun hanya semua setiap banyak sedikit bisa
  dapat harus ingin mau begitu sehingga tersebut berkata bertanya menjawab bahwa wahai tanpa antara atas bawah sendiri
  kepada daripada sambil serta yaitu yakni lagi pula selalu sedang belum pernah segera lantas akhirnya ternyata bersama
  dirinya mereka kalian beliau orang sesuatu sesudah seorang sebuah begitulah demikian berikut mengapa bagaimana
  siapa apakah kapan dimana manakah adalah merupakan menjadi terhadap tentang sudah sangatlah bukan melainkan adapun
  ialah maupun terutama hanyalah justru seluruh pertama kedua ketiga sebab tetap pernah inilah itulah sesungguhnya`.split(/\s+/));
const STOP_EN = new Set(`the and for with that this from they them their there then than what when where which while who whom
  whose will would could should shall have has had having were was are been being into onto over under about after before
  again also just very only even much many more most some such other others another every each your yours ours his hers
  its itself himself herself myself yourself said says asked because until since though through these those here
  little great going gonna wanted wants want looked looks thing things something nothing everyone everything always
  never still really maybe around across along among between behind beside without within upon please thank thanks`.split(/\s+/));
/** Sebutan mulia: tidak pernah menjadi jawaban kuis atau pengecoh. */
const MULIA = /^(allah|tuhan|rabb|rasul|rasulullah|nabi|muhammad|malaikat|jibril|god|lord|prophet|angel|saw|swt|alaihissalam|subhanahu|ta'?ala|al-qur'?an|quran|qur'an|kakbah|ka'bah|surga|neraka)$/i;

/** Bilangan acak berbenih (mulberry32) dari teks. */
function benih(teks: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < teks.length; i += 1) h = Math.imul(h ^ teks.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bersih = (s: string) => s.replace(/[|;]+/g, ',').replace(/\s+/g, ' ').trim();

/** Singkatan yang titiknya bukan akhir kalimat. */
const SINGKAT = /(?:^|\s)(?:QS|Q\.S|HR|SAW|SWT|AS|RA|a\.s|r\.a|dll|dsb|dkk|No|hlm|Dr|Prof|H|St|Mr|Mrs|Ms)\.$/;
const jumlah = (s: string, c: string) => s.split(c).length - 1;
/** Tanda kutip dan kurung seimbang — kalimat utuh, bukan potongan. */
const seimbang = (s: string) => jumlah(s, '"') % 2 === 0 && jumlah(s, '“') === jumlah(s, '”') && jumlah(s, '(') === jumlah(s, ')');

/** Kalimat utuh dari paragraf bab (blok p/en/q/li), berurutan; `cerita` = hanya kalimat kisah (tanpa hikmah, dalil, sumber). */
function kalimatBab(bab: Bab, inggris: boolean): { semua: string[]; cerita: string[] } {
  const semua: string[] = [];
  const cerita: string[] = [];
  for (const b of bab.blok) {
    // Kutipan (blok q) biasanya ayat atau hadits: tidak dijadikan soal isian atau diacak urutannya.
    if (!(b.t === 'p' || (inggris && b.t === 'en') || (!inggris && b.t === 'li'))) continue;
    const potong: string[] = [];
    let buf = '';
    for (const bagian of b.x.split(/(?<=[.!?]["”’)]?)\s+/)) {
      buf = buf ? `${buf} ${bagian}` : bagian;
      if (!SINGKAT.test(buf)) { potong.push(buf); buf = ''; }
    }
    if (buf) potong.push(buf);
    for (const k of potong) {
      const s = bersih(k);
      const n = s.split(' ').length;
      if (n < 5 || n > 24 || s.length > 170 || !/^["“‘(]?[A-Z]/.test(s) || !/[.!?]["”’)]?$/.test(s) || !seimbang(s)) continue;
      // Terjemah ayat (firman: „Kami“, „-Ku“, „We/Our“ di tengah kalimat) atau kalimat berkutip tidak dijadikan permainan.
      if (/(^|\s)(Kami|We|Our|Us)\b|-(Ku|Mu)\b|["“”]/.test(s)) continue;
      semua.push(s);
      if (!/^[\p{L}& ]{2,30}:/u.test(s) && !/\b(QS|HR)\b|\d+:\d+/.test(s)) cerita.push(s);
    }
  }
  return { semua, cerita };
}

const awalan = (w: string) => (/^(mem|men|meng|meny|me)/.test(w) ? 'me' : /^(ber|be)/.test(w) ? 'ber' : /^di/.test(w) ? 'di' : /^ter/.test(w) ? 'ter' : /(ing|ed)$/.test(w) ? w.slice(-3) : '');

/** Kata penting: huruf kecil di teks asli (bukan nama), cukup panjang, bukan kata tugas, bukan sebutan mulia. */
function kataPenting(kalimat: string[], inggris: boolean): string[] {
  const stop = inggris ? STOP_EN : STOP_ID;
  const hitung = new Map<string, number>();
  for (const s of kalimat) {
    for (const w of s.match(/[\p{L}'’-]+/gu) ?? []) {
      if (!/^[a-z]+(-[a-z]+)?$/.test(w) || w.length < (inggris ? 4 : 5) || stop.has(w) || MULIA.test(w) || w.includes("'") || /-.*-/.test(w)) continue;
      hitung.set(w, (hitung.get(w) ?? 0) + 1);
    }
  }
  return [...hitung.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([w]) => w);
}

function kuisIsian(kalimat: string[], kata: string[], acak: () => number, maks: number): Blok[] {
  const hasil: Blok[] = [];
  const dipakai = new Set<string>();
  const urutan = kalimat.map((s, i) => ({ s, i, r: acak() })).sort((a, b) => a.r - b.r);
  for (const { s } of urutan) {
    if (hasil.length >= maks) break;
    const ada = kata.filter((w) => !dipakai.has(w) && new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, 'u').test(s));
    if (!ada.length) continue;
    const jawab = ada[Math.floor(acak() * Math.min(3, ada.length))]!;
    const lain = kata.filter((w) => w !== jawab && !new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, 'u').test(s));
    const serupa = lain.filter((w) => awalan(w) === awalan(jawab));
    const pengecoh = [...(serupa.length >= 2 ? serupa : lain)].sort(() => acak() - 0.5).slice(0, 2);
    if (pengecoh.length < 2) continue;
    dipakai.add(jawab);
    const tanya = s.replace(new RegExp(`(^|[^\\p{L}])${jawab}(?=[^\\p{L}]|$)`, 'u'), '$1……');
    hasil.push({ t: 'kuis', x: `${tanya} | *${jawab} | ${pengecoh[0]} | ${pengecoh[1]}` });
  }
  return hasil;
}

function urutCerita(kalimat: string[], inggris: boolean): Blok | null {
  const pendek = kalimat.filter((s) => s.length <= 140);
  if (pendek.length < 5) return null;
  const pilih = [0, 1, 2, 3].map((i) => pendek[Math.round((i * (pendek.length - 1)) / 3)]!);
  if (new Set(pilih).size < 4) return null;
  return { t: 'urut', x: `${inggris ? 'Put the story in order!' : 'Urutkan ceritanya sesuai kejadian!'} | ${pilih.join(' ;; ')}` };
}

function kartuArab(bab: Bab, maks: number): Blok[] {
  const hasil: Blok[] = [];
  bab.blok.forEach((b, i) => {
    if (hasil.length >= maks || b.t !== 'ar' || b.x.length > 90) return;
    // Artinya harus blok tepat sesudahnya (atau sesudah transliterasi), bukan teks Arab lain.
    const arti = bab.blok[i + 1]?.t === 'lt' ? bab.blok[i + 2] : bab.blok[i + 1];
    if (arti && (arti.t === 'tr' || arti.t === 'en' || arti.t === 'p') && arti.x.length <= 120) hasil.push({ t: 'kartu', x: `${bersih(b.x)} | ${bersih(arti.x)}` });
  });
  return hasil;
}

/** Adegan suasana untuk bab buku anak: sesuai tema, atau cadangan yang tetap untuk (buku, bab). */
export function adeganBab(bab: Bab, m: Pick<BukuMeta, 'id' | 'rak'>): string {
  const tema = suasanaBab(bab);
  if (tema) return tema;
  const daftar = m.rak.includes('kisah') ? CADANGAN_KISAH : CADANGAN;
  return daftar[Math.floor(benih(`${m.id}#${bab.n}#adegan`)() * daftar.length)]!;
}

/** Bab yang sudah dihidupkan (lihat keterangan berkas). Buku untuk remaja dan dewasa tidak diubah. */
export function hidupkanBab(bab: Bab, m: Pick<BukuMeta, 'id' | 'suara' | 'bahasa' | 'rak'>): Bab {
  if (!ANAK.has(m.suara)) return bab;
  const blok = [...bab.blok];
  if (!blok.some((b) => b.t === 'adegan')) {
    // Buku pelajaran (BSE, s-…): adegan hanya bila tema babnya cocok; buku cerita: selalu (dengan adegan cadangan).
    // Adegan cadangan (acak-tetap) hanya untuk buku cerita berbahasa Indonesia tanpa gambar sendiri. Buku berbahasa
    // Inggris/Arab dan buku bergambar (Book Dash) hanya mendapat adegan bila temanya benar-benar cocok — pemilik, 17 Nov
    // 2026: „buku ra jg animasinya banyak yg ga nyambung antar text, bahasa dan animasinya“.
    const sendiri = m.bahasa !== 'id' || bab.blok.some((b) => b.t === 'img');
    const nama = m.id.startsWith('s-') || sendiri ? suasanaBab(bab) : adeganBab(bab, m);
    if (nama) blok.unshift({ t: 'adegan', x: `${nama} | Mainkan gambarnya: seret, ketuk dua kali untuk memutar, lalu tekan ↺ Kembalikan` });
  }
  if (!blok.some((b) => b.t !== 'adegan' && AKTIVITAS.includes(b.t))) {
    const inggris = m.bahasa === 'en';
    const acak = benih(`${m.id}#${bab.n}`);
    const { semua, cerita } = kalimatBab(bab, inggris);
    const main: Blok[] = [
      ...kuisIsian(semua, kataPenting(semua, inggris), acak, 2),
      ...[urutCerita(cerita, inggris)].filter((b): b is Blok => Boolean(b)),
      ...kartuArab(bab, 3),
    ];
    if (main.length) blok.push({ t: 'h', x: inggris ? '🎮 Ayo Bermain! · Let’s Play!' : '🎮 Ayo Bermain!' }, ...main);
  }
  return { ...bab, blok };
}

/**
 * „Uji Pemahaman“ untuk bab buku pelajaran (BSE): kuis isian dari kalimat bab dan kartu istilah dari glosarium buku.
 * Dipanggil sekali saat buku dibuat (scripts/bse-ubah.ts), jadi hasilnya tersimpan bersama babnya.
 */
export function permainanPelajaran(bab: Bab, m: Pick<BukuMeta, 'id' | 'bahasa'>, istilah: [string, string][] = []): Blok[] {
  const inggris = m.bahasa === 'en';
  const acak = benih(`${m.id}#${bab.n}#pelajaran`);
  const { semua } = kalimatBab(bab, inggris);
  const main: Blok[] = [
    ...kuisIsian(semua, kataPenting(semua, inggris), acak, 3),
    ...istilah.slice(0, 4).map(([t, arti]): Blok => ({ t: 'kartu', x: `${bersih(t)} | ${bersih(arti).slice(0, 160)}` })),
  ];
  return main.length ? [{ t: 'h', x: inggris ? '🧠 Uji Pemahaman · Check Your Understanding' : '🧠 Uji Pemahaman' }, ...main] : [];
}
