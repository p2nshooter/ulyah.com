/**
 * Daftar buku peluncuran (docs/JENIUS-SOURCES.md; pemilik: „Inget ini project gratis jd ambil sumber yg gratis jg“).
 *
 * Hanya sumber yang mengizinkan salin, suarakan, dan pakai di situs beriklan:
 *  - Standard Ebooks (CC0 untuk karya penyuntingannya; teksnya domain publik) — repositori GitHub per judul;
 *  - Book Dash (CC BY 4.0) — buku bergambar anak, atribusi penulis/ilustrator/penerjemah tampil di setiap buku.
 * Domain publik Indonesia: hak cipta berlaku seumur hidup + 70 tahun, jadi penulis DAN penerjemah harus wafat ≥ 71 tahun
 * sebelum tahun berjalan (`pdIndonesia`). Judul yang tidak lolos tidak pernah diimpor.
 */
import type { LaneId, ShelfId } from './lanes.ts';

export interface SeSource {
  kind: 'se';
  /** Nama repositori di github.com/standardebooks */
  repo: string;
  lanes: LaneId[];
  shelf: ShelfId;
  /** Tahun wafat penulis dan (bila terjemahan) penerjemah. */
  died: number;
  tDied?: number;
}

export interface BookDashSource {
  kind: 'bookdash';
  /** Folder di github.com/bookdash/bookdash-books (cabang gh-pages), edisi bahasa Inggris. */
  slug: string;
  lanes: LaneId[];
  shelf: ShelfId;
}

export type Source = SeSource | BookDashSource;

/** Domain publik di Indonesia (UU 28/2014: seumur hidup + 70 tahun sejak 1 Januari tahun berikutnya). */
export function pdIndonesia(s: SeSource, year = new Date().getUTCFullYear()): boolean {
  return s.died + 70 < year && (s.tDied === undefined || s.tDied + 70 < year);
}

const se = (repo: string, lanes: LaneId[], shelf: ShelfId, died: number, tDied?: number): SeSource => ({ kind: 'se', repo, lanes, shelf, died, tDied });

export const SE_SOURCES: SeSource[] = [
  // 🌿 Tumbuh — SD kelas 3–6
  se('lewis-carroll_alices-adventures-in-wonderland_john-tenniel', ['tumbuh', 'lintas'], 'petualangan', 1898),
  se('lewis-carroll_through-the-looking-glass_john-tenniel', ['tumbuh'], 'petualangan', 1898),
  se('l-frank-baum_the-wonderful-wizard-of-oz', ['tumbuh', 'lintas'], 'petualangan', 1919),
  se('l-frank-baum_ozma-of-oz', ['tumbuh'], 'petualangan', 1919),
  se('frances-hodgson-burnett_the-secret-garden', ['tumbuh'], 'keluarga', 1924),
  se('frances-hodgson-burnett_a-little-princess', ['tumbuh'], 'keluarga', 1924),
  se('frances-hodgson-burnett_little-lord-fauntleroy', ['tumbuh'], 'keluarga', 1924),
  se('kenneth-grahame_the-wind-in-the-willows', ['tumbuh'], 'keluarga', 1932),
  se('anna-sewell_black-beauty', ['tumbuh'], 'sains', 1878),
  se('rudyard-kipling_just-so-stories', ['tumbuh', 'lintas'], 'budaya', 1936),
  se('rudyard-kipling_the-jungle-book', ['tumbuh', 'jelajah'], 'petualangan', 1936),
  se('e-nesbit_five-children-and-it', ['tumbuh'], 'petualangan', 1924),
  se('e-nesbit_the-railway-children', ['tumbuh'], 'keluarga', 1924),
  se('e-nesbit_the-phoenix-and-the-carpet', ['tumbuh'], 'petualangan', 1924),
  se('e-nesbit_the-story-of-the-treasure-seekers', ['tumbuh'], 'keluarga', 1924),
  se('e-nesbit_the-story-of-the-amulet', ['tumbuh'], 'sejarah', 1924),
  se('e-nesbit_wet-magic', ['tumbuh'], 'petualangan', 1924),
  se('e-nesbit_beautiful-stories-from-shakespeare', ['tumbuh', 'jelajah'], 'seni', 1924),
  se('george-macdonald_the-princess-and-curdie', ['tumbuh'], 'budaya', 1905),
  se('george-macdonald_at-the-back-of-the-north-wind', ['tumbuh'], 'budaya', 1905),
  se('eleanor-h-porter_pollyanna', ['tumbuh'], 'keluarga', 1920),
  se('j-m-barrie_the-little-white-bird', ['tumbuh'], 'keluarga', 1937),
  se('edward-lear_nonsense-books', ['tumbuh', 'lintas'], 'seni', 1888),
  se('beatrix-potter_short-fiction', ['tumbuh', 'lintas'], 'sains', 1943),
  se('aesop_fables_v-s-vernon-jones', ['tumbuh', 'lintas'], 'budaya', -500, 1916),
  se('ernest-thompson-seton_wild-animals-i-have-known', ['tumbuh', 'jelajah'], 'sains', 1946),
  se('l-m-montgomery_anne-of-green-gables', ['tumbuh', 'jelajah'], 'keluarga', 1942),
  se('l-m-montgomery_anne-of-avonlea', ['jelajah'], 'keluarga', 1942),
  se('louisa-may-alcott_little-women', ['jelajah', 'santai'], 'keluarga', 1888),
  // 🔥 Jelajah — SMP · SMA
  se('mark-twain_the-adventures-of-tom-sawyer', ['jelajah', 'lintas'], 'petualangan', 1910),
  se('mark-twain_the-adventures-of-huckleberry-finn', ['jelajah'], 'petualangan', 1910),
  se('mark-twain_the-prince-and-the-pauper', ['jelajah'], 'sejarah', 1910),
  se('robert-louis-stevenson_treasure-island', ['jelajah'], 'petualangan', 1894),
  se('robert-louis-stevenson_kidnapped', ['jelajah'], 'petualangan', 1894),
  se('robert-louis-stevenson_the-strange-case-of-dr-jekyll-and-mr-hyde', ['jelajah', 'kampus'], 'misteri', 1894),
  se('jules-verne_around-the-world-in-eighty-days_george-makepeace-towle', ['jelajah'], 'petualangan', 1905, 1893),
  se('jules-verne_journey-to-the-center-of-the-earth_f-a-malleson', ['jelajah'], 'sains', 1905, 1919),
  se('jules-verne_michael-strogoff_w-h-g-kingston', ['jelajah'], 'petualangan', 1905, 1880),
  se('arthur-conan-doyle_a-study-in-scarlet', ['jelajah', 'santai'], 'misteri', 1930),
  se('arthur-conan-doyle_the-adventures-of-sherlock-holmes', ['jelajah', 'santai'], 'misteri', 1930),
  se('arthur-conan-doyle_the-memoirs-of-sherlock-holmes', ['jelajah', 'santai'], 'misteri', 1930),
  se('arthur-conan-doyle_the-hound-of-the-baskervilles', ['jelajah', 'santai'], 'misteri', 1930),
  se('arthur-conan-doyle_the-lost-world', ['jelajah'], 'sains', 1930),
  se('h-g-wells_the-time-machine', ['jelajah', 'kampus'], 'sains', 1946),
  se('h-g-wells_the-war-of-the-worlds', ['jelajah'], 'sains', 1946),
  se('h-g-wells_the-invisible-man', ['jelajah'], 'sains', 1946),
  se('jack-london_the-call-of-the-wild', ['jelajah'], 'petualangan', 1916),
  se('jack-london_white-fang', ['jelajah'], 'petualangan', 1916),
  se('h-rider-haggard_king-solomons-mines', ['jelajah'], 'petualangan', 1925),
  se('rafael-sabatini_captain-blood', ['jelajah', 'santai'], 'petualangan', 1950),
  se('baroness-orczy_the-scarlet-pimpernel', ['jelajah', 'santai'], 'sejarah', 1947),
  se('daniel-defoe_the-life-and-adventures-of-robinson-crusoe', ['jelajah'], 'petualangan', 1731),
  se('jonathan-swift_gullivers-travels', ['jelajah', 'kampus'], 'petualangan', 1745),
  se('edgar-rice-burroughs_tarzan-of-the-apes', ['jelajah'], 'petualangan', 1950),
  se('g-k-chesterton_the-innocence-of-father-brown', ['jelajah', 'santai'], 'misteri', 1936),
  se('walter-scott_ivanhoe', ['jelajah', 'kampus'], 'sejarah', 1832),
  se('james-fenimore-cooper_the-last-of-the-mohicans', ['jelajah'], 'sejarah', 1851),
  // 🎓 Kampus — mahasiswa · S1
  se('jane-austen_pride-and-prejudice', ['kampus', 'santai'], 'keluarga', 1817),
  se('jane-austen_emma', ['kampus'], 'keluarga', 1817),
  se('jane-austen_sense-and-sensibility', ['kampus'], 'keluarga', 1817),
  se('charles-dickens_a-christmas-carol', ['kampus', 'jelajah', 'lintas'], 'keluarga', 1870),
  se('charles-dickens_great-expectations', ['kampus'], 'keluarga', 1870),
  se('charles-dickens_a-tale-of-two-cities', ['kampus'], 'sejarah', 1870),
  se('charles-dickens_oliver-twist', ['kampus', 'jelajah'], 'keluarga', 1870),
  se('charlotte-bronte_jane-eyre', ['kampus'], 'keluarga', 1855),
  se('emily-bronte_wuthering-heights', ['kampus'], 'keluarga', 1848),
  se('mary-shelley_frankenstein', ['kampus'], 'sains', 1851),
  se('bram-stoker_dracula', ['kampus', 'santai'], 'misteri', 1912),
  se('oscar-wilde_the-picture-of-dorian-gray', ['kampus'], 'seni', 1900),
  se('herman-melville_moby-dick', ['kampus'], 'petualangan', 1891),
  se('nathaniel-hawthorne_the-scarlet-letter', ['kampus'], 'sejarah', 1864),
  se('george-eliot_middlemarch', ['kampus'], 'keluarga', 1880),
  se('thomas-hardy_far-from-the-madding-crowd', ['kampus'], 'keluarga', 1928),
  se('leo-tolstoy_anna-karenina_constance-garnett', ['kampus'], 'keluarga', 1910, 1946),
  se('leo-tolstoy_war-and-peace_louise-maude_aylmer-maude', ['kampus', 'cendekia'], 'sejarah', 1910, 1939),
  se('fyodor-dostoevsky_crime-and-punishment_constance-garnett', ['kampus'], 'filsafat', 1881, 1946),
  se('fyodor-dostoevsky_the-brothers-karamazov_constance-garnett', ['kampus', 'cendekia'], 'filsafat', 1881, 1946),
  se('fyodor-dostoevsky_notes-from-underground_constance-garnett', ['kampus', 'cendekia'], 'filsafat', 1881, 1946),
  se('miguel-de-cervantes-saavedra_don-quixote_john-ormsby', ['kampus'], 'petualangan', 1616, 1895),
  se('victor-hugo_les-miserables_isabel-f-hapgood', ['kampus'], 'sejarah', 1885, 1928),
  // 🔬 Cendekia — S2 · S3 · profesor
  se('plato_dialogues_benjamin-jowett', ['cendekia'], 'filsafat', -348, 1893),
  se('marcus-aurelius_meditations_george-long', ['cendekia', 'profesi'], 'filsafat', 180, 1879),
  se('epictetus_discourses_george-long', ['cendekia'], 'filsafat', 135, 1879),
  se('seneca_dialogues_aubrey-stewart', ['cendekia'], 'filsafat', 65, 1918),
  se('confucius_analects_james-legge', ['cendekia'], 'filsafat', -479, 1897),
  se('laozi_tao-te-ching_james-legge', ['cendekia'], 'filsafat', -500, 1897),
  se('niccolo-machiavelli_the-prince_w-k-marriott', ['cendekia', 'profesi'], 'sejarah', 1527, 1927),
  se('charles-darwin_the-origin-of-species', ['cendekia'], 'sains', 1882),
  se('charles-darwin_the-voyage-of-the-beagle', ['cendekia', 'jelajah'], 'sains', 1882),
  se('john-stuart-mill_on-liberty', ['cendekia'], 'filsafat', 1873),
  se('john-stuart-mill_the-subjection-of-women', ['cendekia'], 'filsafat', 1873),
  se('adam-smith_the-wealth-of-nations', ['cendekia', 'profesi'], 'diri', 1790),
  se('rene-descartes_philosophical-works_john-veitch', ['cendekia'], 'filsafat', 1650, 1894),
  se('david-hume_a-treatise-of-human-nature', ['cendekia'], 'filsafat', 1776),
  se('john-locke_two-treatises-of-government', ['cendekia'], 'filsafat', 1704),
  se('john-locke_some-thoughts-concerning-education', ['cendekia'], 'filsafat', 1704),
  se('thucydides_history-of-the-peloponnesian-war_richard-crawley', ['cendekia'], 'sejarah', -400, 1893),
  se('boethius_the-consolation-of-philosophy_h-r-james', ['cendekia'], 'filsafat', 524, 1931),
  se('henry-david-thoreau_walden', ['cendekia', 'santai'], 'sains', 1862),
  se('ralph-waldo-emerson_essays', ['cendekia', 'profesi'], 'filsafat', 1882),
  se('john-dewey_democracy-and-education', ['cendekia'], 'filsafat', 1952),
  se('william-james_pragmatism', ['cendekia'], 'filsafat', 1910),
  se('friedrich-nietzsche_beyond-good-and-evil_helen-zimmern', ['cendekia'], 'filsafat', 1900, 1934),
  // 💼 Profesi
  se('benjamin-franklin_the-autobiography-of-benjamin-franklin', ['profesi', 'cendekia'], 'diri', 1790),
  se('p-t-barnum_the-art-of-money-getting', ['profesi'], 'diri', 1891),
  // ☕ Santai — umum
  se('o-henry_short-fiction', ['santai', 'lintas'], 'keluarga', 1910),
  se('anton-chekhov_short-fiction_constance-garnett', ['santai', 'kampus'], 'keluarga', 1904, 1946),
  se('edgar-allan-poe_short-fiction', ['santai', 'kampus'], 'misteri', 1849),
  se('jerome-k-jerome_three-men-in-a-boat', ['santai'], 'petualangan', 1927),
  se('washington-irving_the-sketchbook-of-geoffrey-crayon-gent', ['santai'], 'budaya', 1859),
  se('walt-whitman_leaves-of-grass', ['santai', 'kampus'], 'seni', 1892),
  se('john-keats_poetry', ['santai'], 'seni', 1821),
  se('william-shakespeare_poetry', ['santai', 'kampus'], 'seni', 1616),
  se('w-b-yeats_poetry', ['santai'], 'seni', 1939),
  se('edgar-allan-poe_poetry', ['santai'], 'seni', 1849),
  se('elizabeth-barrett-browning_sonnets-from-the-portuguese', ['santai'], 'seni', 1861),
  se('wilfred-owen_poetry', ['santai'], 'seni', 1918),
  se('homer_the-odyssey_william-cullen-bryant', ['santai', 'cendekia'], 'budaya', -700, 1878),
];

/** 55 buku bergambar Book Dash (CC BY 4.0), edisi bahasa Inggris — jalur Tunas (dan Lintas Bahasa). */
export const BOOKDASH_SLUGS = [
  'a-beautiful-day', 'a-dancers-tale', 'a-fish-and-a-gift', 'a-house-for-mouse', 'a-tiny-seed', 'amazing-daisy', 'bathtub-safari', 'come-back-cat',
  'gracas-dream', 'grandpas-gold', 'hippo-wants-to-dance', 'how-about-you', 'hugs-in-the-city', 'i-can-dress-myself', 'i-will-help-you',
  'is-there-anyone-like-me', 'it-wasnt-me', 'karabos-question', 'katiitis-song', 'lara-the-yellow-ladybird', 'little-ants-big-plan', 'little-sock',
  'londi-the-dreaming-girl', 'lory-dory', 'maddy-moona', 'miss-helens-magical-world', 'mrs-penguins-palace', 'queen-of-soweto', 'rafikis-style',
  'sbus-special-shoes', 'searching-for-the-spirit-of-spring', 'shongololos-shoes', 'sima-and-siza', 'sindi-and-the-moon', 'sindiwe-and-the-fireflies',
  'singing-the-truth', 'sizwes-smile', 'sleepy-mr-sloth', 'springloaded', 'thatos-birthday-surprise', 'the-best-thing-ever', 'the-elephant-in-the-room',
  'the-lion-who-wouldnt-try', 'there-must-be-a-rainbow', 'together-were-strong', 'tortoise-finds-his-home', 'walking-together', 'what-if', 'what-is-it',
  'when-i-grow-up', 'who-is-our-friend', 'whose-button-is-this', 'why-is-nita-upside-down', 'zanele-situ-my-story',
];

export const BOOKDASH_SOURCES: BookDashSource[] = BOOKDASH_SLUGS.map((slug) => ({ kind: 'bookdash', slug, lanes: ['tunas', 'lintas'], shelf: 'keluarga' }));

/** Urutan impor: buku bergambar dulu (paling kecil, untuk anak), lalu Standard Ebooks yang lolos domain publik Indonesia. */
export function allSources(year = new Date().getUTCFullYear()): Source[] {
  return [...BOOKDASH_SOURCES, ...SE_SOURCES.filter((s) => pdIndonesia(s, year))];
}

const tailOf = (repo: string) => (repo.split('_')[1] ?? repo).replace(/[^a-z0-9-]/g, '');
/** Judul umum yang dipakai beberapa penulis (poetry, short-fiction, essays…): ID-nya diberi nama belakang penulis. */
const SHARED_TAILS = new Set(SE_SOURCES.map((s) => tailOf(s.repo)).filter((t, i, all) => all.indexOf(t) !== i));

/** ID buku di situs (pendek, stabil, unik). */
export function sourceId(s: Source): string {
  if (s.kind === 'bookdash') return `bd-${s.slug}`;
  const tail = tailOf(s.repo);
  if (!SHARED_TAILS.has(tail)) return tail.slice(0, 80);
  const author = s.repo.split('_')[0]!.split('-').pop()!;
  return `${author}-${tail}`.slice(0, 80);
}
