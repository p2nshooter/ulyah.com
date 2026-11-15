/**
 * Latihan penguatan yang dibangkitkan dari tabel data yang diperiksa — deterministik (urutan opsi tetap antar deploy).
 * Jerman: artikel der/die/das, konjugasi Präsens. Inggris: kata kerja tak beraturan (V2–V3). Jepang: kana, kosakata kanji N5.
 */
import type { Course } from '../data/model.ts';
import type { PQ, PSet } from './types.ts';

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedOf(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}
function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
/** Susun opsi: benar + pengecoh unik, diacak deterministik. */
function opts(id: string, correct: string, distractors: string[], n = 4): { options: string[]; answer: number } {
  const ds = [...new Set(distractors.filter((d) => d && d !== correct))].slice(0, n - 1);
  const all = shuffle([correct, ...ds], rng(seedOf(id)));
  return { options: all, answer: all.indexOf(correct) };
}

interface Family {
  key: string;
  course: Course;
  level: string;
  examName: string;
  title: string;
  desc: string;
  items: Omit<PQ, 'id'>[];
  size?: number;
}
function toSets(f: Family): PSet[] {
  const size = f.size ?? 20;
  const sets: PSet[] = [];
  const n = Math.max(1, Math.round(f.items.length / size));
  for (let i = 0; i < n; i += 1) {
    const chunk = f.items.slice(i * size, i === n - 1 ? undefined : (i + 1) * size);
    const id = `${f.key}-${String(i + 1).padStart(2, '0')}`;
    sets.push({
      id, course: f.course, level: f.level, exam: 'drill', examName: f.examName, kind: 'drill', free: i === 0,
      title: `${f.title} · Seri ${i + 1}`, desc: f.desc, minutes: Math.max(8, Math.round(chunk.length * 0.6)),
      questions: chunk.map((it, k) => ({ id: `${id}-${String(k + 1).padStart(2, '0')}`, ...it })),
    });
  }
  return sets;
}

/* ── Jerman: artikel ─────────────────────────────────────────────────────── */
// [kata benda, gender m/f/n, arti]
const NOUNS: [string, 'm' | 'f' | 'n', string][] = [
  ['Tisch', 'm', 'meja'], ['Stuhl', 'm', 'kursi'], ['Tür', 'f', 'pintu'], ['Fenster', 'n', 'jendela'], ['Buch', 'n', 'buku'], ['Stift', 'm', 'pena'],
  ['Lampe', 'f', 'lampu'], ['Bett', 'n', 'tempat tidur'], ['Schrank', 'm', 'lemari'], ['Küche', 'f', 'dapur'], ['Bad', 'n', 'kamar mandi'], ['Zimmer', 'n', 'kamar'],
  ['Wohnung', 'f', 'apartemen'], ['Haus', 'n', 'rumah'], ['Garten', 'm', 'kebun'], ['Straße', 'f', 'jalan'], ['Stadt', 'f', 'kota'], ['Dorf', 'n', 'desa'],
  ['Bahnhof', 'm', 'stasiun'], ['Flughafen', 'm', 'bandara'], ['Schule', 'f', 'sekolah'], ['Universität', 'f', 'universitas'], ['Krankenhaus', 'n', 'rumah sakit'], ['Apotheke', 'f', 'apotek'],
  ['Supermarkt', 'm', 'supermarket'], ['Restaurant', 'n', 'restoran'], ['Café', 'n', 'kafe'], ['Bank', 'f', 'bank'], ['Post', 'f', 'kantor pos'], ['Kino', 'n', 'bioskop'],
  ['Museum', 'n', 'museum'], ['Park', 'm', 'taman'], ['Arzt', 'm', 'dokter (laki-laki)'], ['Kind', 'n', 'anak'], ['Mann', 'm', 'laki-laki'], ['Frau', 'f', 'perempuan'],
  ['Vater', 'm', 'ayah'], ['Mutter', 'f', 'ibu'], ['Bruder', 'm', 'saudara laki-laki'], ['Schwester', 'f', 'saudara perempuan'], ['Familie', 'f', 'keluarga'], ['Freund', 'm', 'teman (laki-laki)'],
  ['Hund', 'm', 'anjing'], ['Katze', 'f', 'kucing'], ['Auto', 'n', 'mobil'], ['Bus', 'm', 'bus'], ['Zug', 'm', 'kereta'], ['Fahrrad', 'n', 'sepeda'],
  ['Flugzeug', 'n', 'pesawat'], ['Wasser', 'n', 'air'], ['Kaffee', 'm', 'kopi'], ['Tee', 'm', 'teh'], ['Milch', 'f', 'susu'], ['Brot', 'n', 'roti'],
  ['Käse', 'm', 'keju'], ['Butter', 'f', 'mentega'], ['Ei', 'n', 'telur'], ['Apfel', 'm', 'apel'], ['Banane', 'f', 'pisang'], ['Kartoffel', 'f', 'kentang'],
  ['Fleisch', 'n', 'daging'], ['Fisch', 'm', 'ikan'], ['Gemüse', 'n', 'sayuran'], ['Obst', 'n', 'buah-buahan'], ['Salat', 'm', 'salad'], ['Suppe', 'f', 'sup'],
  ['Kuchen', 'm', 'kue'], ['Saft', 'm', 'jus'], ['Tasse', 'f', 'cangkir'], ['Glas', 'n', 'gelas'], ['Teller', 'm', 'piring'], ['Gabel', 'f', 'garpu'],
  ['Messer', 'n', 'pisau'], ['Löffel', 'm', 'sendok'], ['Uhr', 'f', 'jam'], ['Handy', 'n', 'ponsel'], ['Computer', 'm', 'komputer'], ['Zeitung', 'f', 'koran'],
  ['Heft', 'n', 'buku tulis'], ['Tasche', 'f', 'tas'], ['Rucksack', 'm', 'ransel'], ['Jacke', 'f', 'jaket'], ['Mantel', 'm', 'mantel'], ['Hemd', 'n', 'kemeja'],
  ['Hose', 'f', 'celana'], ['Schuh', 'm', 'sepatu'], ['Kleid', 'n', 'gaun'], ['Rock', 'm', 'rok'], ['Hut', 'm', 'topi'], ['Woche', 'f', 'minggu (7 hari)'],
  ['Monat', 'm', 'bulan'], ['Jahr', 'n', 'tahun'], ['Tag', 'm', 'hari'], ['Nacht', 'f', 'malam'], ['Morgen', 'm', 'pagi'], ['Abend', 'm', 'malam (petang)'],
  ['Stunde', 'f', 'jam (durasi)'], ['Minute', 'f', 'menit'], ['Sommer', 'm', 'musim panas'], ['Winter', 'm', 'musim dingin'], ['Frühling', 'm', 'musim semi'], ['Herbst', 'm', 'musim gugur'],
  ['Wetter', 'n', 'cuaca'], ['Sonne', 'f', 'matahari'], ['Regen', 'm', 'hujan'], ['Schnee', 'm', 'salju'], ['Wind', 'm', 'angin'], ['Meer', 'n', 'laut'],
  ['Berg', 'm', 'gunung'], ['Insel', 'f', 'pulau'], ['Fluss', 'm', 'sungai'], ['Land', 'n', 'negara'], ['Sprache', 'f', 'bahasa'], ['Wort', 'n', 'kata'],
  ['Frage', 'f', 'pertanyaan'], ['Antwort', 'f', 'jawaban'], ['Arbeit', 'f', 'pekerjaan'], ['Beruf', 'm', 'profesi'], ['Geld', 'n', 'uang'], ['Preis', 'm', 'harga'],
  ['Rechnung', 'f', 'tagihan'], ['Name', 'm', 'nama'], ['Kopf', 'm', 'kepala'], ['Hand', 'f', 'tangan'], ['Fuß', 'm', 'kaki'], ['Auge', 'n', 'mata'],
  ['Ohr', 'n', 'telinga'], ['Mund', 'm', 'mulut'], ['Nase', 'f', 'hidung'], ['Bein', 'n', 'kaki (tungkai)'], ['Herz', 'n', 'jantung'], ['Bauch', 'm', 'perut'],
];
const ART = { m: 'der', f: 'die', n: 'das' } as const;
const articleItems: Omit<PQ, 'id'>[] = NOUNS.map(([w, g, id]) => ({
  section: 'Artikel', stem: `___ ${w}`, hint: `(${id})`, options: ['der', 'die', 'das'], answer: ['der', 'die', 'das'].indexOf(ART[g]),
  why: `${ART[g]} ${w} — ${g === 'm' ? 'maskulin' : g === 'f' ? 'feminin' : 'neutrum'}. Hafalkan kata benda selalu bersama artikelnya.`,
}));

/* ── Jerman: konjugasi Präsens ───────────────────────────────────────────── */
const PERSONS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr'] as const;
const IRREG: Record<string, [string, string, string, string, string]> = {
  sein: ['bin', 'bist', 'ist', 'sind', 'seid'], haben: ['habe', 'hast', 'hat', 'haben', 'habt'], sprechen: ['spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht'],
  essen: ['esse', 'isst', 'isst', 'essen', 'esst'], lesen: ['lese', 'liest', 'liest', 'lesen', 'lest'], sehen: ['sehe', 'siehst', 'sieht', 'sehen', 'seht'],
  fahren: ['fahre', 'fährst', 'fährt', 'fahren', 'fahrt'], schlafen: ['schlafe', 'schläfst', 'schläft', 'schlafen', 'schlaft'], nehmen: ['nehme', 'nimmst', 'nimmt', 'nehmen', 'nehmt'],
  geben: ['gebe', 'gibst', 'gibt', 'geben', 'gebt'], helfen: ['helfe', 'hilfst', 'hilft', 'helfen', 'helft'], werden: ['werde', 'wirst', 'wird', 'werden', 'werdet'],
  wissen: ['weiß', 'weißt', 'weiß', 'wissen', 'wisst'], können: ['kann', 'kannst', 'kann', 'können', 'könnt'], müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst'],
  wollen: ['will', 'willst', 'will', 'wollen', 'wollt'], dürfen: ['darf', 'darfst', 'darf', 'dürfen', 'dürft'], mögen: ['mag', 'magst', 'mag', 'mögen', 'mögt'],
  arbeiten: ['arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet'], finden: ['finde', 'findest', 'findet', 'finden', 'findet'], heißen: ['heiße', 'heißt', 'heißt', 'heißen', 'heißt'],
  tanzen: ['tanze', 'tanzt', 'tanzt', 'tanzen', 'tanzt'],
};
const REGULAR = ['wohnen', 'kommen', 'lernen', 'machen', 'spielen', 'hören', 'kaufen', 'kochen', 'trinken', 'schwimmen', 'gehen', 'singen', 'schreiben', 'bleiben', 'fragen', 'sagen', 'brauchen', 'suchen', 'zeigen', 'bezahlen', 'besuchen', 'verstehen', 'studieren', 'telefonieren', 'lieben', 'leben'];
const regular = (inf: string): [string, string, string, string, string] => {
  const st = inf.slice(0, -2);
  return [`${st}e`, `${st}st`, `${st}t`, inf, `${st}t`];
};
const VERBS: [string, [string, string, string, string, string]][] = [...Object.entries(IRREG), ...REGULAR.map((v) => [v, regular(v)] as [string, [string, string, string, string, string]])];
const conjItems: Omit<PQ, 'id'>[] = [];
for (const [inf, forms] of VERBS) {
  const naive = regular(inf);
  PERSONS.forEach((p, i) => {
    const correct = forms[i]!;
    const id = `konj-${inf}-${i}`;
    const { options, answer } = opts(id, correct, [...forms.filter((f) => f !== correct), naive[i]!, `${inf.slice(0, -2)}en`]);
    conjItems.push({
      section: 'Konjugation', stem: `${p} ___ (${inf})`, options, answer,
      why: `${inf}: ${PERSONS.map((pp, k) => `${pp} ${forms[k]}`).join(' · ')}${IRREG[inf] ? ' — bentuk tidak beraturan, perlu dihafal.' : ' — beraturan: akar + -e/-st/-t/-en/-t.'}`,
    });
  });
}

/* ── Inggris: kata kerja tak beraturan ───────────────────────────────────── */
const IRR_EN: [string, string, string, string][] = [
  ['become', 'became', 'become', 'menjadi'], ['begin', 'began', 'begun', 'memulai'], ['break', 'broke', 'broken', 'memecahkan'], ['bring', 'brought', 'brought', 'membawa'],
  ['build', 'built', 'built', 'membangun'], ['buy', 'bought', 'bought', 'membeli'], ['catch', 'caught', 'caught', 'menangkap'], ['choose', 'chose', 'chosen', 'memilih'],
  ['come', 'came', 'come', 'datang'], ['cost', 'cost', 'cost', 'berharga'], ['cut', 'cut', 'cut', 'memotong'], ['do', 'did', 'done', 'melakukan'],
  ['draw', 'drew', 'drawn', 'menggambar'], ['drink', 'drank', 'drunk', 'minum'], ['drive', 'drove', 'driven', 'menyetir'], ['eat', 'ate', 'eaten', 'makan'],
  ['fall', 'fell', 'fallen', 'jatuh'], ['feel', 'felt', 'felt', 'merasa'], ['fight', 'fought', 'fought', 'berkelahi'], ['find', 'found', 'found', 'menemukan'],
  ['fly', 'flew', 'flown', 'terbang'], ['forget', 'forgot', 'forgotten', 'lupa'], ['give', 'gave', 'given', 'memberi'], ['go', 'went', 'gone', 'pergi'],
  ['grow', 'grew', 'grown', 'tumbuh'], ['have', 'had', 'had', 'punya'], ['hear', 'heard', 'heard', 'mendengar'], ['hide', 'hid', 'hidden', 'bersembunyi'],
  ['hit', 'hit', 'hit', 'memukul'], ['hold', 'held', 'held', 'memegang'], ['keep', 'kept', 'kept', 'menyimpan'], ['know', 'knew', 'known', 'tahu'],
  ['leave', 'left', 'left', 'pergi/meninggalkan'], ['lend', 'lent', 'lent', 'meminjamkan'], ['let', 'let', 'let', 'membiarkan'], ['lose', 'lost', 'lost', 'kehilangan'],
  ['make', 'made', 'made', 'membuat'], ['mean', 'meant', 'meant', 'berarti'], ['meet', 'met', 'met', 'bertemu'], ['pay', 'paid', 'paid', 'membayar'],
  ['put', 'put', 'put', 'menaruh'], ['read', 'read', 'read', 'membaca'], ['ride', 'rode', 'ridden', 'mengendarai'], ['ring', 'rang', 'rung', 'berdering'],
  ['rise', 'rose', 'risen', 'naik/terbit'], ['run', 'ran', 'run', 'berlari'], ['say', 'said', 'said', 'berkata'], ['see', 'saw', 'seen', 'melihat'],
  ['sell', 'sold', 'sold', 'menjual'], ['send', 'sent', 'sent', 'mengirim'], ['shut', 'shut', 'shut', 'menutup'], ['sing', 'sang', 'sung', 'bernyanyi'],
  ['sit', 'sat', 'sat', 'duduk'], ['sleep', 'slept', 'slept', 'tidur'], ['speak', 'spoke', 'spoken', 'berbicara'], ['spend', 'spent', 'spent', 'menghabiskan'],
  ['stand', 'stood', 'stood', 'berdiri'], ['steal', 'stole', 'stolen', 'mencuri'], ['swim', 'swam', 'swum', 'berenang'], ['take', 'took', 'taken', 'mengambil'],
  ['teach', 'taught', 'taught', 'mengajar'], ['tell', 'told', 'told', 'memberi tahu'], ['think', 'thought', 'thought', 'berpikir'], ['throw', 'threw', 'thrown', 'melempar'],
  ['understand', 'understood', 'understood', 'memahami'], ['wake', 'woke', 'woken', 'bangun'], ['wear', 'wore', 'worn', 'memakai'], ['win', 'won', 'won', 'menang'],
  ['write', 'wrote', 'written', 'menulis'],
];
const regEn = (b: string) => (b.endsWith('e') ? `${b}d` : /[^aeiou]y$/.test(b) ? `${b.slice(0, -1)}ied` : `${b}ed`);
const irrItems: Omit<PQ, 'id'>[] = IRR_EN.map(([b, p, pp, id]) => {
  const r = regEn(b);
  const correct = `${p} – ${pp}`;
  const { options, answer } = opts(`irr-${b}`, correct, [`${r} – ${r}`, p !== pp ? `${pp} – ${p}` : `${p} – ${r}`, `${b} – ${pp}`, `${r} – ${pp}`, `${p} – ${p}${p === pp ? 'ed' : ''}`]);
  return { section: 'Irregular verbs', stem: `${b} (${id}) → V2 – V3 ?`, options, answer, why: `${b} – ${p} – ${pp}. Contoh: I ${p} … yesterday. / I have ${pp} … .` };
});

/* ── Jepang: kana ────────────────────────────────────────────────────────── */
const KANA_ROWS: [string, string][] = [
  ['あいうえお', 'a i u e o'], ['かきくけこ', 'ka ki ku ke ko'], ['さしすせそ', 'sa shi su se so'], ['たちつてと', 'ta chi tsu te to'], ['なにぬねの', 'na ni nu ne no'],
  ['はひふへほ', 'ha hi fu he ho'], ['まみむめも', 'ma mi mu me mo'], ['やゆよ', 'ya yu yo'], ['らりるれろ', 'ra ri ru re ro'], ['わをん', 'wa wo n'],
  ['がぎぐげご', 'ga gi gu ge go'], ['ざじずぜぞ', 'za ji zu ze zo'], ['だでど', 'da de do'], ['ばびぶべぼ', 'ba bi bu be bo'], ['ぱぴぷぺぽ', 'pa pi pu pe po'],
];
const toKata = (s: string) => [...s].map((c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).join('');
const HIRA: [string, string][] = KANA_ROWS.flatMap(([k, r]) => [...k].map((ch, i) => [ch, r.split(' ')[i]!] as [string, string]));
const KATA: [string, string][] = HIRA.map(([k, r]) => [toKata(k), r]);
const CONFUSE: string[] = ['ぬめねれわ', 'さちき', 'はほけ', 'るろ', 'いり', 'こにた', 'あおめ', 'シツソン', 'クケタワウ', 'コユロ', 'チテナ', 'アマム', 'スヌフ', 'ノメヲ'];
function kanaItems(table: [string, string][], script: 'hiragana' | 'katakana'): Omit<PQ, 'id'>[] {
  const out: Omit<PQ, 'id'>[] = [];
  const romaji = new Map(table);
  table.forEach(([k, r], i) => {
    const near = CONFUSE.find((g) => g.includes(k))?.replace(k, '') ?? '';
    const r1 = rng(seedOf(`${script}-${k}`));
    const pool = shuffle(table.filter(([kk]) => kk !== k), r1);
    if (i % 2 === 0) {
      const ds = [...near].map((c) => romaji.get(c)!).concat(pool.map(([, rr]) => rr));
      const { options, answer } = opts(`${script}-r-${k}`, r, ds);
      out.push({ section: script === 'hiragana' ? 'Hiragana' : 'Katakana', stem: `「${k}」`, hint: 'Pilih bacaan (romaji) huruf ini.', options, answer, why: `${k} dibaca „${r}“.` });
    } else {
      const ds = [...near].concat(pool.map(([kk]) => kk));
      const { options, answer } = opts(`${script}-k-${k}`, k, ds);
      out.push({ section: script === 'hiragana' ? 'Hiragana' : 'Katakana', stem: `„${r}“`, hint: `Pilih huruf ${script} untuk bunyi ini.`, options, answer, why: `Bunyi „${r}“ ditulis ${k}.` });
    }
  });
  return out;
}

/* ── Jepang: kosakata kanji N5 ───────────────────────────────────────────── */
const KANJI: [string, string, string][] = [
  ['学校', 'がっこう', 'sekolah'], ['学生', 'がくせい', 'pelajar'], ['先生', 'せんせい', 'guru'], ['大学', 'だいがく', 'universitas'], ['会社', 'かいしゃ', 'perusahaan'],
  ['日本語', 'にほんご', 'bahasa Jepang'], ['英語', 'えいご', 'bahasa Inggris'], ['山', 'やま', 'gunung'], ['川', 'かわ', 'sungai'], ['水', 'みず', 'air'],
  ['花', 'はな', 'bunga'], ['魚', 'さかな', 'ikan'], ['雨', 'あめ', 'hujan'], ['天気', 'てんき', 'cuaca'], ['電車', 'でんしゃ', 'kereta listrik'],
  ['車', 'くるま', 'mobil'], ['駅', 'えき', 'stasiun'], ['道', 'みち', 'jalan'], ['店', 'みせ', 'toko'], ['本', 'ほん', 'buku'],
  ['名前', 'なまえ', 'nama'], ['友だち', 'ともだち', 'teman'], ['父', 'ちち', 'ayah (saya)'], ['母', 'はは', 'ibu (saya)'], ['男', 'おとこ', 'laki-laki'],
  ['女', 'おんな', 'perempuan'], ['子ども', 'こども', 'anak'], ['今', 'いま', 'sekarang'], ['毎日', 'まいにち', 'setiap hari'], ['毎朝', 'まいあさ', 'setiap pagi'],
  ['午前', 'ごぜん', 'pagi (a.m.)'], ['午後', 'ごご', 'siang/sore (p.m.)'], ['時間', 'じかん', 'waktu'], ['来週', 'らいしゅう', 'minggu depan'], ['先週', 'せんしゅう', 'minggu lalu'],
  ['今年', 'ことし', 'tahun ini'], ['上', 'うえ', 'atas'], ['下', 'した', 'bawah'], ['右', 'みぎ', 'kanan'], ['左', 'ひだり', 'kiri'],
  ['前', 'まえ', 'depan'], ['後ろ', 'うしろ', 'belakang'], ['外', 'そと', 'luar'], ['東', 'ひがし', 'timur'], ['西', 'にし', 'barat'],
  ['南', 'みなみ', 'selatan'], ['北', 'きた', 'utara'], ['大きい', 'おおきい', 'besar'], ['小さい', 'ちいさい', 'kecil'], ['高い', 'たかい', 'mahal / tinggi'],
  ['安い', 'やすい', 'murah'], ['新しい', 'あたらしい', 'baru'], ['古い', 'ふるい', 'lama (barang)'], ['長い', 'ながい', 'panjang'], ['白い', 'しろい', 'putih'],
  ['食べる', 'たべる', 'makan'], ['飲む', 'のむ', 'minum'], ['見る', 'みる', 'melihat'], ['行く', 'いく', 'pergi'], ['来る', 'くる', 'datang'],
  ['書く', 'かく', 'menulis'], ['読む', 'よむ', 'membaca'], ['話す', 'はなす', 'berbicara'], ['聞く', 'きく', 'mendengar'], ['休み', 'やすみ', 'libur'],
  ['目', 'め', 'mata'], ['耳', 'みみ', 'telinga'], ['口', 'くち', 'mulut'], ['手', 'て', 'tangan'], ['足', 'あし', 'kaki'],
  ['空', 'そら', 'langit'], ['百', 'ひゃく', 'seratus'], ['千', 'せん', 'seribu'], ['円', 'えん', 'yen'], ['国', 'くに', 'negara'],
];
const kanjiItems: Omit<PQ, 'id'>[] = KANJI.flatMap(([w, r, m], i) => {
  const r1 = rng(seedOf(`kanji-${w}`));
  const others = shuffle(KANJI.filter((_, k) => k !== i), r1);
  const read = opts(`kanji-r-${w}`, r, others.map(([, rr]) => rr));
  const mean = opts(`kanji-m-${w}`, m, others.map(([, , mm]) => mm));
  return [
    { section: '漢字読み', stem: `【${w}】`, hint: `Pilih bacaan kata ini (arti: ${m}).`, options: read.options, answer: read.answer, why: `${w} dibaca ${r} — „${m}“.` },
    { section: '語彙', stem: `【${w}】（${r}）`, hint: 'Pilih arti kata ini.', options: mean.options, answer: mean.answer, why: `${w}（${r}）= ${m}.` },
  ];
});

export const DRILLS: PSet[] = [
  ...toSets({ key: 'de-a1-artikel', course: 'de', level: 'a1', examName: 'Penguatan · Wortschatz', title: 'Artikel der · die · das', desc: 'Kenali gender kata benda A1 — fondasi semua kasus (Akkusativ, Dativ) di jenjang berikutnya.', items: articleItems }),
  ...toSets({ key: 'de-a1-konjugasi', course: 'de', level: 'a1', examName: 'Penguatan · Grammatik', title: 'Konjugasi Präsens', desc: 'Bentuk kata kerja untuk ich, du, er/sie/es, wir, ihr — beraturan, berubah vokal, dan modal.', items: conjItems }),
  ...toSets({ key: 'en-elementary-irregular', course: 'en', level: 'elementary', examName: 'Penguatan · Grammar', title: 'Irregular verbs V2 – V3', desc: 'Bentuk lampau (V2) dan partisip (V3) kata kerja tak beraturan yang paling sering muncul di ujian.', items: irrItems }),
  ...toSets({ key: 'ja-n5-hiragana', course: 'ja', level: 'n5', examName: 'Penguatan · 文字', title: 'Hiragana', desc: 'Membaca dan mengenali semua hiragana dasar dan bertitik (dakuten/handakuten).', items: kanaItems(HIRA, 'hiragana') }),
  ...toSets({ key: 'ja-n5-katakana', course: 'ja', level: 'n5', examName: 'Penguatan · 文字', title: 'Katakana', desc: 'Membaca dan mengenali semua katakana — termasuk pasangan yang mirip (シ/ツ, ソ/ン).', items: kanaItems(KATA, 'katakana') }),
  ...toSets({ key: 'ja-n5-kanji', course: 'ja', level: 'n5', examName: 'Penguatan · 漢字・語彙', title: 'Kosakata kanji N5', desc: 'Bacaan dan arti kosakata kanji N5 yang paling sering keluar di 漢字読み dan 語彙.', items: kanjiItems }),
];
