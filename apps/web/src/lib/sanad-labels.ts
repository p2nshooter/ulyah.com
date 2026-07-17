// Self-contained UI strings for the public Sanad Hadits page, same pattern
// as radio-labels.ts / hadits-labels.ts. English is the fallback.

export interface SanadLabels {
  title: string;
  subtitle: string;
  chooseCollection: string;
  chainLabel: string;
  disclaimer: string;
  noChain: string;
  hadithNo: string;
  viewFull: string;
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
};

const MAP: Record<string, SanadLabels> = { en: EN, id: ID, ar: AR };

export function sanadLabels(locale: string): SanadLabels {
  return MAP[locale] ?? EN;
}
