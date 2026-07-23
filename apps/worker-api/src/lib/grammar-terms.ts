/**
 * Turns raw Quranic Arabic Corpus (QAC) morphology codes into human-readable
 * nahwu-shorof, in Indonesian + Arabic (id primary; en fallback handled by the
 * warm pipeline downstream). This is a faithful RE-LABELLING of the QAC
 * annotation — the grammatical facts come from the corpus (corpus.quran.com,
 * Kais Dukes, Univ. of Leeds), we only translate its codes. Unknown codes fall
 * back to the raw code so nothing is silently invented.
 */

export interface Trilingual {
  id: string;
  ar: string;
  en: string;
}

// Fine part-of-speech (POS) codes → labels. Covers the QAC tag set; the ones a
// reader meets most often are first.
const POS: Record<string, Trilingual> = {
  N: { id: "Isim (kata benda)", ar: "اسم", en: "Noun" },
  PN: { id: "Isim 'alam (nama diri)", ar: "اسم علم", en: "Proper noun" },
  ADJ: { id: "Sifat (na'at)", ar: "صفة", en: "Adjective" },
  IMPN: { id: "Isim fi'il amar", ar: "اسم فعل أمر", en: "Imperative verbal noun" },
  ACT_PCPL: { id: "Isim fa'il (pelaku)", ar: "اسم فاعل", en: "Active participle" },
  PASS_PCPL: { id: "Isim maf'ul (objek)", ar: "اسم مفعول", en: "Passive participle" },
  VN: { id: "Masdar (kata dasar)", ar: "مصدر", en: "Verbal noun" },
  PRON: { id: "Dhamir (kata ganti)", ar: "ضمير", en: "Pronoun" },
  DEM: { id: "Isim isyarah (kata tunjuk)", ar: "اسم إشارة", en: "Demonstrative" },
  REL: { id: "Isim maushul (kata sambung)", ar: "اسم موصول", en: "Relative pronoun" },
  T: { id: "Zaraf zaman (keterangan waktu)", ar: "ظرف زمان", en: "Time adverb" },
  LOC: { id: "Zaraf makan (keterangan tempat)", ar: "ظرف مكان", en: "Location adverb" },
  V: { id: "Fi'il (kata kerja)", ar: "فعل", en: "Verb" },
  P: { id: "Harf jar (kata depan)", ar: "حرف جر", en: "Preposition" },
  DET: { id: "Al ta'rif (kata sandang)", ar: "أل التعريف", en: "Determiner" },
  CONJ: { id: "Harf 'athaf (kata hubung)", ar: "حرف عطف", en: "Conjunction" },
  SUB: { id: "Harf mashdari", ar: "حرف مصدري", en: "Subordinating conjunction" },
  ACC: { id: "Harf nashab (menashabkan)", ar: "حرف نصب", en: "Accusative particle" },
  COND: { id: "Harf syarat", ar: "حرف شرط", en: "Conditional particle" },
  NEG: { id: "Harf nafi (peniadaan)", ar: "حرف نفي", en: "Negative particle" },
  PRO: { id: "Harf nahi (larangan)", ar: "حرف نهي", en: "Prohibition particle" },
  EMPH: { id: "Harf taukid (penegas)", ar: "حرف توكيد", en: "Emphatic particle" },
  INTG: { id: "Harf istifham (tanya)", ar: "حرف استفهام", en: "Interrogative particle" },
  VOC: { id: "Harf nida (panggilan)", ar: "حرف نداء", en: "Vocative particle" },
  FUT: { id: "Harf istiqbal (akan)", ar: "حرف استقبال", en: "Future particle" },
  CERT: { id: "Harf tahqiq (kepastian)", ar: "حرف تحقيق", en: "Particle of certainty" },
  RES: { id: "Harf hashr (pembatasan)", ar: "حرف حصر", en: "Restriction particle" },
  EXP: { id: "Harf istitsna (pengecualian)", ar: "حرف استثناء", en: "Exceptive particle" },
  AVR: { id: "Harf rad'i (bantahan)", ar: "حرف ردع", en: "Aversion particle" },
  ANS: { id: "Harf jawab", ar: "حرف جواب", en: "Answer particle" },
  INC: { id: "Harf ibtida", ar: "حرف ابتداء", en: "Inceptive particle" },
  SUR: { id: "Harf fuja'ah", ar: "حرف فجاءة", en: "Surprise particle" },
  INL: { id: "Huruf muqatta'ah", ar: "حروف مقطعة", en: "Quranic initials" },
  INTG_PART: { id: "Harf istifham", ar: "حرف استفهام", en: "Interrogative" },
  PREV: { id: "Harf kaff (penahan)", ar: "حرف كاف", en: "Preventive particle" },
  IMPV: { id: "Fi'il amar (perintah)", ar: "فعل أمر", en: "Imperative verb" },
};

// Verb aspect.
const ASPECT: Record<string, Trilingual> = {
  PERF: { id: "fi'il madhi (lampau)", ar: "فعل ماضٍ", en: "perfect verb" },
  IMPF: { id: "fi'il mudhari' (kini/nanti)", ar: "فعل مضارع", en: "imperfect verb" },
  IMPV: { id: "fi'il amar (perintah)", ar: "فعل أمر", en: "imperative verb" },
};

// I'rab of nouns (case).
const CASE: Record<string, Trilingual> = {
  NOM: { id: "marfu' (keadaan rafa')", ar: "مرفوع", en: "nominative" },
  ACC: { id: "manshub (keadaan nashab)", ar: "منصوب", en: "accusative" },
  GEN: { id: "majrur (keadaan jar)", ar: "مجرور", en: "genitive" },
};

// I'rab of verbs (mood).
const MOOD: Record<string, Trilingual> = {
  IND: { id: "marfu'", ar: "مرفوع", en: "indicative" },
  SUBJ: { id: "manshub", ar: "منصوب", en: "subjunctive" },
  JUS: { id: "majzum", ar: "مجزوم", en: "jussive" },
};

const GENDER: Record<string, Trilingual> = {
  M: { id: "mudzakkar (laki-laki)", ar: "مذكر", en: "masculine" },
  F: { id: "muannats (perempuan)", ar: "مؤنث", en: "feminine" },
};
const NUMBER: Record<string, Trilingual> = {
  S: { id: "mufrad (tunggal)", ar: "مفرد", en: "singular" },
  D: { id: "mutsanna (ganda)", ar: "مثنى", en: "dual" },
  P: { id: "jamak", ar: "جمع", en: "plural" },
};

export interface SegmentGrammar {
  form: string;
  pos: string; // raw code
  posLabel: Trilingual;
  root: string | null;
  lemma: string | null;
  aspect?: Trilingual;
  gcase?: Trilingual; // i'rab (noun)
  mood?: Trilingual; // i'rab (verb)
  gender?: Trilingual;
  number?: Trilingual;
  person?: string; // "1"/"2"/"3"
  isPrefix: boolean;
  isSuffix: boolean;
  explanation: Trilingual; // ready-made sentence
}

/** Parse one QAC segment (its broad tag + raw features) into grammar. */
export function parseSegment(form: string, tag: string, features: string): SegmentGrammar {
  const parts = features.split("|");
  const has = (p: string) => parts.includes(p);
  const val = (k: string) => {
    const hit = parts.find((p) => p.startsWith(k + ":"));
    return hit ? hit.slice(k.length + 1) : null;
  };

  // Fine POS: prefer an explicit POS code in features, else the broad tag.
  let posCode = tag;
  const featPos = parts.find((p) => POS[p]);
  if (featPos) posCode = featPos;
  // Verb aspect refines a V into madhi/mudhari'/amar.
  const aspectCode = ["PERF", "IMPF", "IMPV"].find((a) => has(a));
  const posLabel = POS[posCode] ?? { id: posCode, ar: posCode, en: posCode };

  const root = val("ROOT");
  const lemma = val("LEM");
  const gcaseCode = (["NOM", "ACC", "GEN"] as const).find((c) => has(c));
  const moodRaw = val("MOOD");
  const genderCode = has("M") ? "M" : has("F") ? "F" : null;
  const numberCode = has("D") ? "D" : has("P") ? "P" : has("S") ? "S" : null;
  const personMatch = parts.find((p) => /^[123][MF]?[SDP]?$/.test(p));
  const person = personMatch ? personMatch[0] : undefined;

  const aspect = aspectCode ? ASPECT[aspectCode] : undefined;
  const gcase = gcaseCode ? CASE[gcaseCode] : undefined;
  const mood = moodRaw ? MOOD[moodRaw] : undefined;
  const gender = genderCode ? GENDER[genderCode] : undefined;
  const number = numberCode ? NUMBER[numberCode] : undefined;

  // Build a natural one-line explanation in each language.
  const build = (lang: keyof Trilingual): string => {
    const bits: string[] = [];
    bits.push(aspect ? aspect[lang] : posLabel[lang]);
    if (root && lang === "id") bits.push(`akar ${root}`);
    else if (root && lang === "en") bits.push(`root ${root}`);
    else if (root) bits.push(`جذر ${root}`);
    if (gender) bits.push(gender[lang]);
    if (number) bits.push(number[lang]);
    if (gcase) bits.push(gcase[lang]);
    if (mood) bits.push(lang === "id" ? `i'rab ${mood[lang]}` : mood[lang]);
    return bits.join(" · ");
  };

  return {
    form,
    pos: posCode,
    posLabel,
    root,
    lemma,
    aspect,
    gcase,
    mood,
    gender,
    number,
    person,
    isPrefix: has("PREF"),
    isSuffix: has("SUFF"),
    explanation: { id: build("id"), ar: build("ar"), en: build("en") },
  };
}
