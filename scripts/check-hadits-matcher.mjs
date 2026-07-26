/**
 * The matcher that fills kitab pesantren terjemah must be timid: a hadith shown
 * with the wrong translation is worse than a hadith shown in Arabic only.
 *
 * These cases use real text — the same hadith as printed in Arba'in Nawawi and
 * as narrated in Bukhari (different harakat, different isnad length), plus two
 * hadith that share a famous opening but say different things, which is exactly
 * the pair a careless matcher gets wrong.
 */
import { normalizeArabic, shingles, buildMatcher, looksIndonesian } from "./link-pesantren-hadits.ts";

let failed = 0;
function ok(cond, label) {
  if (cond) return;
  failed++;
  console.error(`FAIL  ${label}`);
}

// Bukhari 1 — with full isnad and harakat, as the corpus stores it.
const BUKHARI_1 =
  "حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ قَالَ حَدَّثَنَا سُفْيَانُ قَالَ حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الْأَنْصَارِيُّ قَالَ " +
  "أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ أَنَّهُ سَمِعَ عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ يَقُولُ سَمِعْتُ عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ " +
  "عَلَى الْمِنْبَرِ قَالَ سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى " +
  "فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ";

// Muslim 1599 — a different hadith that opens with the same famous formula.
const HALAL_HARAM =
  "عَنْ أَبِي عَبْدِ اللَّهِ النُّعْمَانِ بْنِ بَشِيرٍ رَضِيَ اللَّهُ عَنْهُمَا قَالَ سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ " +
  "إِنَّ الْحَلَالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنْ النَّاسِ " +
  "فَمَنْ اتَّقَى الشُّبُهَاتِ فَقَدْ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ";

// A third, unrelated hadith so the corpus is not a two-horse race.
const UNRELATED =
  "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ " +
  "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ";

// The same hadith as Arba'in Nawawi no. 1 prints it: bare of harakat, wrapped
// in the guillemets the OpenITI text uses, shorter isnad.
const ARBAIN_1 =
  "«عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله تعالى عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول: " +
  "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى دنيا يصيبها أو إلى امرأة ينكحها فهجرته إلى ما هاجر إليه»";

// Arba'in Nawawi no. 6, likewise.
const ARBAIN_6 =
  "«عن أبي عبد الله النعمان بن بشير رضي الله عنهما قال: سمعت رسول الله صلى الله عليه وآله وسلم يقول: " +
  "إن الحلال بين وإن الحرام بين وبينهما أمور مشتبهات لا يعلمهن كثير من الناس، فمن اتقى الشبهات فقد استبرأ لدينه وعرضه»";

// --- normalisation ------------------------------------------------------
const a = normalizeArabic("إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ");
const b = normalizeArabic("«إنما الأعمال بالنيات»");
ok(a === b, `harakat and guillemets fold away: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
ok(!/[ًٌٍَُِّْـ]/.test(a), "no harakat survives normalisation");
ok(normalizeArabic("آمن أمن إمن") === "امن امن امن", "alif family folds to one letter");
ok(normalizeArabic("صلاة") === normalizeArabic("صلاه"), "ta marbuta folds to ha");

// --- shingles -----------------------------------------------------------
const w = ["a", "b", "c", "d", "e", "f"];
ok(shingles(w, 1).length === 3, `stride 1 yields every window, got ${shingles(w, 1).length}`);
ok(shingles(w, 2).length === 2, `stride 2 halves the index, got ${shingles(w, 2).length}`);
ok(shingles(["a", "b"], 1).length === 0, "a passage shorter than one window yields nothing");

// --- matching -----------------------------------------------------------
// The real corpus is 38k hadith in which the isnad formulas repeat endlessly.
// A three-entry corpus would make that boilerplate look distinctive, so the
// filler reproduces the shape that matters: the same opening formula over and
// over, each time followed by different words.
const FILLER_WORDS = "الصدقه الصلاه الزكاه الصيام الحج الجهاد العلم الصبر الشكر التوبه الوضوء المسجد الجمعه العيد الوتر".split(" ");
const filler = [];
for (let i = 0; i < 400; i++) {
  const w = FILLER_WORDS[i % FILLER_WORDS.length];
  filler.push(
    `عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ` +
      `${w} رقم ${i} باب ${i} فصل ${i} حديث ${i} وهذا لفظ يختص بهذا الحديث وحده دون غيره من الأحاديث`
  );
}
const corpus = [BUKHARI_1, HALAL_HARAM, UNRELATED, ...filler];
const m = buildMatcher(corpus);

const hit1 = m.match(ARBAIN_1, 0.55, 0.1);
ok(hit1 !== null, "Arba'in no. 1 finds its hadith in the corpus");
ok(hit1?.index === 0, `Arba'in no. 1 matches Bukhari 1, got index ${hit1?.index}`);

const hit6 = m.match(ARBAIN_6, 0.55, 0.1);
ok(hit6 !== null, "Arba'in no. 6 finds its hadith in the corpus");
ok(hit6?.index === 1, `Arba'in no. 6 matches the halal/haram hadith, got index ${hit6?.index}`);

// A passage that is not in the corpus must come back empty, not "closest".
const NOT_IN_CORPUS =
  "«عن أبي ذر الغفاري رضي الله عنه عن النبي صلى الله عليه وسلم فيما يرويه عن ربه عز وجل قال: " +
  "يا عبادي إني حرمت الظلم على نفسي وجعلته بينكم محرما فلا تظالموا»";
ok(m.match(NOT_IN_CORPUS, 0.55, 0.1) === null, "an absent hadith matches nothing rather than the nearest");

// The shared opening formula alone must never be enough.
const FORMULA_ONLY = "عن أبي هريرة رضي الله عنه قال قال رسول الله صلى الله عليه وسلم";
const formulaHit = m.match(FORMULA_ONLY, 0.55, 0.1);
ok(formulaHit === null, `the isnad formula alone matches nothing, got ${JSON.stringify(formulaHit)}`);

// Raising the bar must never invent matches that the lower bar missed.
ok(m.match(NOT_IN_CORPUS, 0.9, 0.1) === null, "a stricter threshold stays empty too");

// --- the corpus is not all Indonesian ------------------------------------
// Arba'in An-Nawawi and Hadits Qudsi were imported Arabic + English, and the
// English sits in the text_id column — 82 rows. They are the rows the matcher
// most wants, being the same hadith word for word, so the language screen is
// the only thing standing between a reader and an English kitab. These are the
// real strings from both sides of that line.
const REAL_ENGLISH_ARBAIN =
  "It is narrated on the authority of Amirul Mu'minin, Abu Hafs 'Umar bin al-Khattab (ra) who said: " +
  "I heard the Messenger of Allah (ﷺ) say: \"Actions are according to intentions, and everyone will get what was intended.\"";
const REAL_ENGLISH_QUDSI =
  "On the authority of Abu Hurayrah (may Allah be pleased with him), who said that the Messenger of Allah (ﷺ) said: " +
  "Allah the Almighty said: The son of Adam denies Me and he has no right to do so.";
const REAL_INDONESIAN_BUKHARI =
  "Telah menceritakan kepada kami Abdullah bin Yusuf, dia berkata; telah mengabarkan kepada kami Malik, " +
  "bahwa Rasulullah shallallahu 'alaihi wasallam bersabda: sesungguhnya amal itu tergantung niatnya.";
const REAL_INDONESIAN_RIYADHUS =
  "Pendahuluan Dengan nama Allah yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah Yang Maha Esa, " +
  "dan tidak ada yang berhak disembah selain Dia.";

ok(!looksIndonesian(REAL_ENGLISH_ARBAIN), "the English Arba'in text is not mistaken for Indonesian");
ok(!looksIndonesian(REAL_ENGLISH_QUDSI), "the English Hadits Qudsi text is not mistaken for Indonesian");
ok(looksIndonesian(REAL_INDONESIAN_BUKHARI), "the Indonesian Bukhari text is recognised");
ok(looksIndonesian(REAL_INDONESIAN_RIYADHUS), "the Indonesian Riyadhus text is recognised");
ok(!looksIndonesian(""), "an empty terjemah is never usable");
ok(!looksIndonesian("Allah"), "a single neutral word is not enough to call it Indonesian");

if (failed) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log("hadits matcher: normalisation, shingles and confident matching all behave.");
