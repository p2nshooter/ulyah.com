// Self-contained UI strings for the Waris (Faraid) calculator, same pattern
// as zakat-labels.ts. English is the fallback for locales not listed.

export interface WarisLabels {
  title: string;
  subtitle: string;
  deceasedGenderLabel: string;
  male: string;
  female: string;
  wivesCountLabel: string;
  hasHusbandLabel: string;
  yes: string;
  no: string;
  sonsLabel: string;
  daughtersLabel: string;
  fatherAliveLabel: string;
  motherAliveLabel: string;
  kalalahHint: string;
  fullBrothersLabel: string;
  fullSistersLabel: string;
  uterineSiblingsLabel: string;
  estateLabel: string;
  debtLabel: string;
  funeralCostLabel: string;
  willLabel: string;
  willCapNote: string;
  netEstateLabel: string;
  resultsTitle: string;
  heirLabel: string;
  shareLabel: string;
  amountLabel: string;
  noRecognizedHeir: string;
  aulNote: string;
  raddNote: string;
  umariyyatainNote: string;
  heirNames: Record<string, string>;
  disclaimer: string;
}

const EN: WarisLabels = {
  title: "Waris (Faraid) Calculator",
  subtitle: "Islamic inheritance shares for the common family case — calculated entirely on your device.",
  deceasedGenderLabel: "The deceased is",
  male: "Male",
  female: "Female",
  wivesCountLabel: "Number of surviving wives",
  hasHusbandLabel: "Surviving husband",
  yes: "Yes",
  no: "No",
  sonsLabel: "Sons",
  daughtersLabel: "Daughters",
  fatherAliveLabel: "Father surviving",
  motherAliveLabel: "Mother surviving",
  kalalahHint: "No children and no father survive — siblings below become relevant (kalalah case).",
  fullBrothersLabel: "Full brothers (same father & mother)",
  fullSistersLabel: "Full sisters (same father & mother)",
  uterineSiblingsLabel: "Maternal (uterine) siblings — same mother only",
  estateLabel: "Total estate (gross)",
  debtLabel: "Debts of the deceased",
  funeralCostLabel: "Funeral costs",
  willLabel: "Bequest (wasiat, non-heir)",
  willCapNote: "A bequest to a non-heir may not exceed 1/3 of the net estate — amounts above that are capped automatically.",
  netEstateLabel: "Net estate to divide",
  resultsTitle: "Shares",
  heirLabel: "Heir",
  shareLabel: "Share",
  amountLabel: "Amount",
  noRecognizedHeir: "No heir was recognized from this input — consult a faraid scholar or religious court; the estate may pass to more distant relatives or the state treasury (baitul mal).",
  aulNote: "'Aul applied: the fixed shares add up to more than the whole estate, so every share was reduced proportionally — the classical solution from Umar ibn al-Khattab's ruling.",
  raddNote: "Radd applied: the fixed shares leave a remainder with no residuary (asobah) heir to absorb it, so it was returned proportionally to the eligible heirs (a spouse never receives radd).",
  umariyyatainNote: "Gharrawain/Umariyyatain case: with a spouse and both parents only, the mother's share is 1/3 of the remainder after the spouse's share, not 1/3 of the whole estate.",
  heirNames: {
    suami: "Husband",
    istri: "Wife/wives (combined)",
    ayah: "Father",
    ibu: "Mother",
    anak_laki: "Sons (combined)",
    anak_perempuan: "Daughters (combined)",
    saudara_seibu: "Maternal siblings (combined)",
    saudara_laki_kandung: "Full brothers (combined)",
    saudari_kandung: "Full sisters (combined)",
  },
  disclaimer:
    "Covers the common family structure only: spouse, children, parents, and — solely when there are no children and no father — full and maternal siblings. It does NOT model grandparents, paternal (consanguine) siblings, or grandchildren inheriting by representation; those cases carry extra rules and, for a grandfather alongside siblings, genuine differences between the classical schools. For any of those situations, or a high-value estate, consult a qualified faraid scholar or religious court before dividing anything.",
};

const ID: WarisLabels = {
  title: "Kalkulator Waris (Faraid)",
  subtitle: "Pembagian warisan Islam untuk susunan keluarga umum — dihitung sepenuhnya di perangkat Anda.",
  deceasedGenderLabel: "Pewaris (yang meninggal) berjenis kelamin",
  male: "Laki-laki",
  female: "Perempuan",
  wivesCountLabel: "Jumlah istri yang ditinggalkan",
  hasHusbandLabel: "Suami yang ditinggalkan",
  yes: "Ada",
  no: "Tidak ada",
  sonsLabel: "Anak laki-laki",
  daughtersLabel: "Anak perempuan",
  fatherAliveLabel: "Ayah masih hidup",
  motherAliveLabel: "Ibu masih hidup",
  kalalahHint: "Tidak ada anak dan ayah tidak ada — saudara di bawah ini menjadi relevan (kasus kalalah).",
  fullBrothersLabel: "Saudara laki-laki kandung (seayah-seibu)",
  fullSistersLabel: "Saudara perempuan kandung (seayah-seibu)",
  uterineSiblingsLabel: "Saudara/i seibu (hanya seibu, beda ayah)",
  estateLabel: "Total harta warisan (kotor)",
  debtLabel: "Hutang almarhum/almarhumah",
  funeralCostLabel: "Biaya pengurusan jenazah",
  willLabel: "Wasiat (untuk bukan ahli waris)",
  willCapNote: "Wasiat untuk yang bukan ahli waris tidak boleh melebihi 1/3 dari sisa harta bersih — kelebihannya otomatis dibatasi.",
  netEstateLabel: "Harta bersih yang dibagi waris",
  resultsTitle: "Pembagian",
  heirLabel: "Ahli waris",
  shareLabel: "Bagian",
  amountLabel: "Nominal",
  noRecognizedHeir: "Tidak ada ahli waris yang terdeteksi dari data ini — konsultasikan ke ahli faraid atau Pengadilan Agama; harta bisa jatuh ke kerabat lain yang lebih jauh atau baitul mal.",
  aulNote: "Terjadi 'Aul: total bagian tetap melebihi seluruh harta, sehingga semua bagian dikurangi secara proporsional — solusi klasik dari ijtihad Umar bin Khattab.",
  raddNote: "Terjadi Radd: bagian tetap tidak mencapai seluruh harta dan tidak ada ahli waris asobah yang menghabiskan sisanya, sehingga sisa dikembalikan secara proporsional ke ahli waris yang berhak (suami/istri tidak menerima radd).",
  umariyyatainNote: "Kasus Gharrawain/Umariyyatain: bila hanya ada suami/istri dan kedua orang tua, bagian ibu adalah 1/3 dari SISA setelah bagian pasangan, bukan 1/3 dari seluruh harta.",
  heirNames: {
    suami: "Suami",
    istri: "Istri (gabungan)",
    ayah: "Ayah",
    ibu: "Ibu",
    anak_laki: "Anak laki-laki (gabungan)",
    anak_perempuan: "Anak perempuan (gabungan)",
    saudara_seibu: "Saudara/i seibu (gabungan)",
    saudara_laki_kandung: "Saudara laki-laki kandung (gabungan)",
    saudari_kandung: "Saudara perempuan kandung (gabungan)",
  },
  disclaimer:
    "Hanya mencakup susunan keluarga umum: pasangan, anak, orang tua, dan — hanya saat tidak ada anak dan tidak ada ayah — saudara kandung dan saudara seibu. TIDAK memodelkan kakek/nenek, saudara seayah (bukan seibu), atau cucu sebagai ahli waris pengganti — kasus-kasus itu punya aturan hijab tambahan, dan khusus kakek bersama saudara ada perbedaan pendapat nyata antar mazhab klasik. Untuk situasi tersebut, atau harta warisan bernilai besar, konsultasikan ke ahli faraid atau Pengadilan Agama sebelum membagi apa pun.",
};

const MAP: Record<string, WarisLabels> = { en: EN, id: ID };

export function warisLabels(locale: string): WarisLabels {
  return MAP[locale] ?? EN;
}
