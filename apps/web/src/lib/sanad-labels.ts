// Self-contained UI strings for the public Sanad Hadits page, same pattern
// as radio-labels.ts / hadits-labels.ts. Siblings render their own native
// language (fr/de); English is the fallback, never Indonesian.

export interface SanadLabels {
  title: string;
  subtitle: string;
  chooseCollection: string;
  chainLabel: string;
  disclaimer: string;
  noChain: string;
  hadithNo: string;
  viewFull: string;
  narrators: string; // unit after the chain length, e.g. "5 narrators"
  listenChain: string;
  stopChain: string;
}

const EN: SanadLabels = {
  title: "Sanad Explorer",
  subtitle: "See the chain of narrators (isnad) carried in each hadith's own Arabic text.",
  chooseCollection: "Choose a collection",
  chainLabel: "Narrator chain",
  disclaimer:
    "This chain is extracted automatically from the hadith's own Arabic wording (classical transmission markers such as ḥaddathanā, akhbaranā, ʻan). It is a reading aid, not a substitute for a scholarly rijāl reference.",
  noChain: "No chain could be detected for this hadith — some narrations are excerpts without a full isnad.",
  hadithNo: "Hadith No.",
  viewFull: "Read the full hadith →",
  narrators: "narrators",
  listenChain: "🔊 Listen to the chain",
  stopChain: "⏹ Stop",
};

const ID: SanadLabels = {
  title: "Sanad Explorer",
  subtitle: "Lihat rantai perawi (isnad) yang termuat dalam teks Arab asli setiap hadits.",
  chooseCollection: "Pilih koleksi",
  chainLabel: "Rantai perawi",
  disclaimer:
    "Rantai ini diekstrak otomatis dari teks Arab asli hadits (penanda periwayatan klasik seperti حدثنا، أخبرنا، عن). Ini alat bantu baca, bukan pengganti kitab ilmu rijal.",
  noChain: "Tidak ada rantai terdeteksi untuk hadits ini — sebagian riwayat berupa kutipan tanpa isnad lengkap.",
  hadithNo: "Hadits No.",
  viewFull: "Baca hadits lengkap →",
  narrators: "perawi",
  listenChain: "🔊 Dengarkan rantai",
  stopChain: "⏹ Berhenti",
};

const FR: SanadLabels = {
  title: "Explorateur de sanad",
  subtitle: "Découvrez la chaîne de transmetteurs (isnâd) contenue dans le texte arabe de chaque hadith.",
  chooseCollection: "Choisir un recueil",
  chainLabel: "Chaîne de transmetteurs",
  disclaimer:
    "Cette chaîne est extraite automatiquement du texte arabe du hadith (formules de transmission classiques comme ḥaddathanā, akhbaranā, ʻan). C'est une aide à la lecture, non un substitut à un ouvrage savant de rijāl.",
  noChain: "Aucune chaîne n'a pu être détectée pour ce hadith — certaines narrations sont des extraits sans isnâd complet.",
  hadithNo: "Hadith n°",
  viewFull: "Lire le hadith complet →",
  narrators: "transmetteurs",
  listenChain: "🔊 Écouter la chaîne",
  stopChain: "⏹ Arrêter",
};

const DE: SanadLabels = {
  title: "Sanad-Explorer",
  subtitle: "Sehen Sie die Überliefererkette (Isnâd), die im arabischen Text jedes Hadith enthalten ist.",
  chooseCollection: "Sammlung auswählen",
  chainLabel: "Überliefererkette",
  disclaimer:
    "Diese Kette wird automatisch aus dem arabischen Wortlaut des Hadith gewonnen (klassische Überlieferungsformeln wie ḥaddathanā, akhbaranā, ʿan). Sie ist eine Lesehilfe, kein Ersatz für ein gelehrtes Ridschāl-Werk.",
  noChain: "Für diesen Hadith konnte keine Kette erkannt werden — manche Überlieferungen sind Auszüge ohne vollständigen Isnâd.",
  hadithNo: "Hadith Nr.",
  viewFull: "Vollständigen Hadith lesen →",
  narrators: "Überlieferer",
  listenChain: "🔊 Kette anhören",
  stopChain: "⏹ Stopp",
};

const AR: SanadLabels = {
  title: "مستكشف السند",
  subtitle: "اطّلع على سلسلة الرواة (الإسناد) الواردة في نص كل حديث بالعربية.",
  chooseCollection: "اختر مجموعة",
  chainLabel: "سلسلة الرواة",
  disclaimer:
    "تُستخرج هذه السلسلة تلقائيًا من نص الحديث العربي (ألفاظ الرواية الكلاسيكية مثل حدثنا، أخبرنا، عن). وهي أداة مساعدة للقراءة، لا بديلاً عن كتب علم الرجال.",
  noChain: "لم يُكتشف سند لهذا الحديث — بعض الروايات مقتطفات دون إسناد كامل.",
  hadithNo: "حديث رقم",
  viewFull: "اقرأ الحديث كاملاً ←",
  narrators: "راوٍ",
  listenChain: "🔊 استمع إلى السلسلة",
  stopChain: "⏹ إيقاف",
};

const MAP: Record<string, SanadLabels> = { en: EN, id: ID, fr: FR, de: DE, ar: AR };

export function sanadLabels(locale: string): SanadLabels {
  return MAP[locale] ?? EN;
}
