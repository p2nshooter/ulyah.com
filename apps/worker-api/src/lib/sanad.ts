/**
 * Sanad (isnad) chain extraction — parses the chain of narrators embedded at
 * the start of a hadith's own Arabic text (`hadits.text_ar`). This is NOT a
 * curated ʻilm ar-rijāl (narrator biography) database — no open, worthy
 * source for that exists yet (checked against the project's own source
 * survey) — it is a pattern-based extraction of names ALREADY PRESENT in the
 * hadith text this project already has licensed (fawazahmed0/hadith-api,
 * Unlicense). Every chain shown is read straight out of that same Arabic
 * text, never invented, and the UI labels it plainly as an automatic
 * extraction so nobody mistakes it for a scholarly critical edition.
 *
 * Classical hadith isnad follows a small, closed set of transmission verbs
 * ("haddathanā", "akhbaranā", "ʻan", …) that mark where one narrator's name
 * ends and the next link begins — splitting on those verbs recovers the
 * chain reliably for the vast majority of hadith, which is exactly the
 * pattern every printed hadith index (e.g. Fuad Abdul Baqi's) relies on too.
 */

// Transmission-chain markers, in rough frequency order. Each one signals
// "the name just spoken narrated FROM/TO the next name".
const SANAD_MARKERS = [
  "حدثنا", "حدثني", "أخبرنا", "أخبرني", "حدث", "أنبأنا",
  "سمعت", "سمع", "عن", "قال", "قالت",
];

const MARKER_RE = new RegExp(`(${SANAD_MARKERS.join("|")})`, "g");

// Isnads sit at the very start of the hadith; the matn (content) usually
// begins once a Prophet-reference phrase appears. Scanning only the first
// slice keeps the extraction honest — trying to keep splitting the whole
// hadith would eventually chew into the matn and misreport ordinary prose
// as "narrators".
const MATN_BOUNDARY_RE = /(أن رسول الله|أن النبي|قال رسول الله|قال النبي|عن النبي|صلى الله عليه)/;
const MAX_SCAN_CHARS = 500;
const MAX_CHAIN_LENGTH = 8;
const MIN_NAME_CHARS = 3;
const MAX_NAME_CHARS = 40;

export interface SanadLink {
  order: number;
  name: string;
  marker: string; // the transmission verb that introduced this name
}

/** Extract the narrator chain from one hadith's raw Arabic text. Returns an
 * empty array (never throws) when the text doesn't start with a recognisable
 * isnad — plenty of hadith excerpts / partial narrations don't. */
export function extractSanadChain(textAr: string | null): SanadLink[] {
  if (!textAr) return [];
  const boundary = textAr.search(MATN_BOUNDARY_RE);
  const scanText = (boundary > 0 ? textAr.slice(0, boundary) : textAr).slice(0, MAX_SCAN_CHARS);

  const parts = scanText.split(MARKER_RE);
  const chain: SanadLink[] = [];
  let pendingMarker: string | null = null;

  for (const part of parts) {
    if (SANAD_MARKERS.includes(part)) {
      pendingMarker = part;
      continue;
    }
    if (!pendingMarker) continue;
    const name = part
      .replace(/[،,.:؛]/g, " ")
      .trim()
      .split(/\s+/)
      .slice(0, 5) // a narrator's name/kunya rarely runs past 4-5 words
      .join(" ")
      .trim();
    if (name.length >= MIN_NAME_CHARS && name.length <= MAX_NAME_CHARS) {
      chain.push({ order: chain.length + 1, name, marker: pendingMarker });
    }
    pendingMarker = null;
    if (chain.length >= MAX_CHAIN_LENGTH) break;
  }

  return chain;
}
