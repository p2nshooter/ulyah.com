import { fillLabels } from "./fill-labels";

// Labels for the Al-Qur'an Kids games. English is the source of truth: every
// locale that isn't hand-authored here is filled from the generated UI_I18N
// table (scripts/generate-ui-i18n.ts, `pnpm gen:ui-i18n`), so a new language
// never silently falls back to English — that fallback is exactly what left
// the ecosystem inconsistent when strings were written inline in components.

export interface KidsGamesLabels {
  title: string;
  subtitle: string;
  guessName: string;
  guessDesc: string;
  findName: string;
  findDesc: string;
  matchName: string;
  matchDesc: string;
  orderName: string;
  orderDesc: string;
  score: string;
  streak: string;
  best: string;
  correct: string;
  wrong: string;
  play: string;
  again: string;
  back: string;
  listen: string;
  done: string;
  moves: string;
  hint: string;
  orderHint: string;
  memoryName: string;
  memoryDesc: string;
  speedName: string;
  speedDesc: string;
  harakatName: string;
  harakatDesc: string;
  level: string;
  levelUp: string;
  watch: string;
  yourTurn: string;
  timeLeft: string;
  start: string;
  finalScore: string;
  whichHarakat: string;
  fathah: string;
  kasrah: string;
  dhammah: string;
  sukun: string;
  tasydid: string;
  tanwinFathah: string;
  tanwinKasrah: string;
  tanwinDhammah: string;
  growName: string;
  growDesc: string;
  flyName: string;
  flyDesc: string;
  chooseLevel: string;
  goal: string;
  catchThis: string;
  missed: string;
  tier0: string;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  locked: string;
  cleared: string;
  lives: string;
  round: string;
  tapInOrder: string;
  meaning: string;
  passed: string;
  failed: string;
  retry: string;
  nextTier: string;
  stars: string;
  yourName: string;
  yourAge: string;
  years: string;
  certificate: string;
  certTitle: string;
  certBody: string;
  certLocked: string;
  print: string;
  progress: string;
}

const EN: KidsGamesLabels = {
  title: "Qur'an Learning Games",
  subtitle: "Learn the Arabic hijaiyah letters by playing",
  guessName: "Guess the Arabic Letter",
  guessDesc: "See the Arabic letter, pick its name",
  findName: "Find the Arabic Letter",
  findDesc: "Hear the name, pick the Arabic letter",
  matchName: "Matching Cards",
  matchDesc: "Match each Arabic letter to its name",
  orderName: "Put in Order",
  orderDesc: "Arrange them in hijaiyah order",
  score: "Score",
  streak: "Streak",
  best: "Best",
  correct: "Correct!",
  wrong: "Try again",
  play: "Play",
  again: "Play again",
  back: "Choose another game",
  listen: "Listen",
  done: "Great! Finished",
  moves: "Moves",
  hint: "Tap a card to flip it",
  orderHint: "Tap the Arabic letters in order",
  memoryName: "Remember the Arabic Letters",
  memoryDesc: "Watch the sequence, then repeat it — it grows each level",
  speedName: "Quick & Correct",
  speedDesc: "How many can you get before the time runs out?",
  harakatName: "Guess the Harakat",
  harakatDesc: "Which vowel mark is on the Arabic letter?",
  level: "Level",
  levelUp: "Level up!",
  watch: "Watch carefully…",
  yourTurn: "Your turn!",
  timeLeft: "Time",
  start: "Start",
  finalScore: "Final score",
  whichHarakat: "Which harakat?",
  fathah: "Fathah (a)",
  kasrah: "Kasrah (i)",
  dhammah: "Dhammah (u)",
  sukun: "Sukun",
  tasydid: "Tasydid (doubled)",
  tanwinFathah: "Tanwin fathah (an)",
  tanwinKasrah: "Tanwin kasrah (in)",
  tanwinDhammah: "Tanwin dhammah (un)",
  growName: "Grow the Arabic Letters",
  growDesc: "One Arabic letter becomes a syllable, a word, then a whole phrase",
  flyName: "Catch the Arabic Letters in the Air",
  flyDesc: "Arabic letters float past — tap the correct one before it escapes",
  chooseLevel: "Choose a level",
  goal: "Target",
  catchThis: "Find these Arabic letters in the air",
  missed: "It got away!",
  tier0: "Very easy",
  tier1: "Easy",
  tier2: "Medium",
  tier3: "Hard",
  tier4: "Very hard",
  locked: "Clear the level before this one first",
  cleared: "Cleared",
  lives: "Lives",
  round: "Round",
  tapInOrder: "Tap the pieces in order",
  meaning: "Meaning",
  passed: "Level cleared!",
  failed: "Out of lives — try again",
  retry: "Try again",
  nextTier: "Next level",
  stars: "Stars",
  yourName: "Child's name",
  yourAge: "Age",
  years: "years",
  certificate: "Certificate",
  certTitle: "Certificate of Hijaiyah Mastery",
  certBody: "has completed every hijaiyah level, from the first Arabic letter to a full phrase.",
  certLocked: "Clear the top level of every core game to earn the certificate.",
  print: "Print / save",
  progress: "Progress",
};

const ID: KidsGamesLabels = {
  title: "Game Belajar Qur'an",
  subtitle: "Belajar huruf hijaiyah sambil bermain",
  guessName: "Tebak Huruf",
  guessDesc: "Lihat hurufnya, pilih namanya",
  findName: "Cari Huruf",
  findDesc: "Dengar namanya, pilih hurufnya",
  matchName: "Kartu Pasangan",
  matchDesc: "Cocokkan huruf dengan namanya",
  orderName: "Urutkan Huruf",
  orderDesc: "Susun sesuai urutan hijaiyah",
  score: "Skor",
  streak: "Beruntun",
  best: "Terbaik",
  correct: "Benar!",
  wrong: "Coba lagi ya",
  play: "Main",
  again: "Main lagi",
  back: "Pilih game lain",
  listen: "Dengarkan",
  done: "Hebat! Selesai",
  moves: "Langkah",
  hint: "Ketuk kartu untuk membukanya",
  orderHint: "Ketuk huruf sesuai urutan",
  memoryName: "Ingat Huruf",
  memoryDesc: "Lihat urutannya, lalu ulangi — makin naik makin panjang",
  speedName: "Cepat & Tepat",
  speedDesc: "Berapa banyak yang bisa kamu jawab sebelum waktu habis?",
  harakatName: "Tebak Harakat",
  harakatDesc: "Harakat apa yang ada di huruf itu?",
  level: "Tingkat",
  levelUp: "Naik tingkat!",
  watch: "Perhatikan baik-baik…",
  yourTurn: "Giliranmu!",
  timeLeft: "Waktu",
  start: "Mulai",
  finalScore: "Skor akhir",
  whichHarakat: "Harakat apa ini?",
  fathah: "Fathah (a)",
  kasrah: "Kasrah (i)",
  dhammah: "Dhammah (u)",
  sukun: "Sukun",
  tasydid: "Tasydid (dobel)",
  tanwinFathah: "Tanwin fathah (an)",
  tanwinKasrah: "Tanwin kasrah (in)",
  tanwinDhammah: "Tanwin dhammah (un)",
  growName: "Tumbuh Huruf",
  growDesc: "Satu huruf tumbuh jadi suku kata, kata, lalu satu kalimat",
  flyName: "Tangkap Huruf Terbang",
  flyDesc: "Huruf berterbangan — ketuk yang benar sebelum kabur",
  chooseLevel: "Pilih tingkat",
  goal: "Target",
  catchThis: "Tangkap huruf ini",
  missed: "Kabur!",
  tier0: "Sangat mudah",
  tier1: "Mudah",
  tier2: "Sedang",
  tier3: "Sulit",
  tier4: "Sangat sulit",
  locked: "Selesaikan tingkat sebelumnya dulu",
  cleared: "Selesai",
  lives: "Nyawa",
  round: "Ronde",
  tapInOrder: "Ketuk potongannya sesuai urutan",
  meaning: "Artinya",
  passed: "Tingkat selesai!",
  failed: "Nyawa habis — coba lagi",
  retry: "Coba lagi",
  nextTier: "Tingkat berikutnya",
  stars: "Bintang",
  yourName: "Nama anak",
  yourAge: "Umur",
  years: "tahun",
  certificate: "Sertifikat",
  certTitle: "Sertifikat Menguasai Huruf Hijaiyah",
  certBody: "telah menyelesaikan seluruh tingkat hijaiyah, dari huruf pertama sampai satu kalimat penuh.",
  certLocked: "Selesaikan tingkat tertinggi di semua game inti untuk mendapat sertifikat.",
  print: "Cetak / simpan",
  progress: "Kemajuan",
};

const AR: KidsGamesLabels = {
  title: "ألعاب تعلّم القرآن",
  subtitle: "تعلّم الحروف الهجائية باللعب",
  guessName: "خمّن الحرف",
  guessDesc: "انظر إلى الحرف واختر اسمه",
  findName: "ابحث عن الحرف",
  findDesc: "استمع للاسم واختر الحرف",
  matchName: "بطاقات متطابقة",
  matchDesc: "طابق كل حرف مع اسمه",
  orderName: "رتّب الحروف",
  orderDesc: "رتّبها حسب ترتيب الحروف الهجائية",
  score: "النقاط",
  streak: "متتالية",
  best: "الأفضل",
  correct: "أحسنت!",
  wrong: "حاول مرة أخرى",
  play: "العب",
  again: "العب مرة أخرى",
  back: "اختر لعبة أخرى",
  listen: "استمع",
  done: "رائع! انتهيت",
  moves: "الحركات",
  hint: "انقر البطاقة لقلبها",
  orderHint: "انقر الحروف بالترتيب",
  memoryName: "تذكّر الحروف",
  memoryDesc: "شاهد التسلسل ثم كرّره — يزداد طولًا كل مستوى",
  speedName: "سريع ودقيق",
  speedDesc: "كم إجابة صحيحة قبل انتهاء الوقت؟",
  harakatName: "خمّن الحركة",
  harakatDesc: "ما الحركة الموجودة على الحرف؟",
  level: "المستوى",
  levelUp: "مستوى أعلى!",
  watch: "انتبه جيدًا…",
  yourTurn: "دورك!",
  timeLeft: "الوقت",
  start: "ابدأ",
  finalScore: "النتيجة النهائية",
  whichHarakat: "ما هذه الحركة؟",
  fathah: "فتحة (a)",
  kasrah: "كسرة (i)",
  dhammah: "ضمة (u)",
  sukun: "سكون",
  tasydid: "شدّة",
  tanwinFathah: "تنوين فتح (an)",
  tanwinKasrah: "تنوين كسر (in)",
  tanwinDhammah: "تنوين ضم (un)",
  growName: "نمو الحروف",
  growDesc: "حرف واحد يصير مقطعًا ثم كلمة ثم جملة كاملة",
  flyName: "امسك الحرف الطائر",
  flyDesc: "الحروف تطير — انقر الحرف الصحيح قبل أن يهرب",
  chooseLevel: "اختر المستوى",
  goal: "الهدف",
  catchThis: "امسك هذا الحرف",
  missed: "هرب!",
  tier0: "سهل جدًا",
  tier1: "سهل",
  tier2: "متوسط",
  tier3: "صعب",
  tier4: "صعب جدًا",
  locked: "أكمل المستوى السابق أولًا",
  cleared: "مكتمل",
  lives: "المحاولات",
  round: "جولة",
  tapInOrder: "انقر الأجزاء بالترتيب",
  meaning: "المعنى",
  passed: "اجتزت المستوى!",
  failed: "انتهت المحاولات — أعد الكرّة",
  retry: "حاول مرة أخرى",
  nextTier: "المستوى التالي",
  stars: "النجوم",
  yourName: "اسم الطفل",
  yourAge: "العمر",
  years: "سنة",
  certificate: "الشهادة",
  certTitle: "شهادة إتقان الحروف الهجائية",
  certBody: "أكمل جميع مستويات الحروف الهجائية، من أول حرف إلى جملة كاملة.",
  certLocked: "أكمل أعلى مستوى في كل الألعاب الأساسية للحصول على الشهادة.",
  print: "طباعة / حفظ",
  progress: "التقدم",
};

const MAP: Record<string, KidsGamesLabels> = { en: EN, id: ID, ar: AR };

export function kidsGamesLabels(locale: string): KidsGamesLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
