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

const FR: WarisLabels = {
  title: "Calculateur d'héritage (Farâ'id)",
  subtitle: "Les parts d'héritage islamique pour la configuration familiale courante — calculées entièrement sur votre appareil.",
  deceasedGenderLabel: "Le défunt est",
  male: "Un homme",
  female: "Une femme",
  wivesCountLabel: "Nombre d'épouses survivantes",
  hasHusbandLabel: "Époux survivant",
  yes: "Oui",
  no: "Non",
  sonsLabel: "Fils",
  daughtersLabel: "Filles",
  fatherAliveLabel: "Père vivant",
  motherAliveLabel: "Mère vivante",
  kalalahHint: "Ni enfant ni père survivant — les frères et sœurs ci-dessous deviennent pertinents (cas de kalâla).",
  fullBrothersLabel: "Frères germains (même père et mère)",
  fullSistersLabel: "Sœurs germaines (même père et mère)",
  uterineSiblingsLabel: "Frères/sœurs utérins — même mère uniquement",
  estateLabel: "Patrimoine total (brut)",
  debtLabel: "Dettes du défunt",
  funeralCostLabel: "Frais funéraires",
  willLabel: "Legs (wasiyya, non-héritier)",
  willCapNote: "Un legs à un non-héritier ne peut dépasser 1/3 du patrimoine net — l'excédent est plafonné automatiquement.",
  netEstateLabel: "Patrimoine net à partager",
  resultsTitle: "Parts",
  heirLabel: "Héritier",
  shareLabel: "Part",
  amountLabel: "Montant",
  noRecognizedHeir: "Aucun héritier reconnu à partir de ces données — consultez un savant des farâ'id ou un tribunal religieux ; le patrimoine peut revenir à des parents plus éloignés ou au trésor public (bayt al-mâl).",
  aulNote: "'Awl appliqué : les parts fixes dépassent la totalité du patrimoine, chaque part a donc été réduite proportionnellement — la solution classique issue de la décision de Umar ibn al-Khattâb.",
  raddNote: "Radd appliqué : les parts fixes laissent un reliquat sans héritier résiduaire ('asaba) pour l'absorber ; il a donc été redistribué proportionnellement aux héritiers éligibles (le conjoint ne reçoit jamais de radd).",
  umariyyatainNote: "Cas Gharrâwayn/'Umariyyatayn : avec seulement un conjoint et les deux parents, la part de la mère est 1/3 du reste après la part du conjoint, non 1/3 de tout le patrimoine.",
  heirNames: {
    suami: "Époux",
    istri: "Épouse(s) (cumulées)",
    ayah: "Père",
    ibu: "Mère",
    anak_laki: "Fils (cumulés)",
    anak_perempuan: "Filles (cumulées)",
    saudara_seibu: "Frères/sœurs utérins (cumulés)",
    saudara_laki_kandung: "Frères germains (cumulés)",
    saudari_kandung: "Sœurs germaines (cumulées)",
  },
  disclaimer:
    "Ne couvre que la configuration familiale courante : conjoint, enfants, parents et — uniquement en l'absence d'enfant et de père — frères et sœurs germains et utérins. Ne modélise PAS les grands-parents, les frères consanguins ni les petits-enfants par représentation ; ces cas comportent des règles supplémentaires et, pour le grand-père avec des frères et sœurs, de réelles divergences entre écoles classiques. Pour ces situations, ou un patrimoine important, consultez un savant qualifié des farâ'id ou un tribunal religieux avant tout partage.",
};

const DE: WarisLabels = {
  title: "Erbrechner (Farāʾid)",
  subtitle: "Islamische Erbanteile für die übliche Familienkonstellation — vollständig auf deinem Gerät berechnet.",
  deceasedGenderLabel: "Die verstorbene Person ist",
  male: "Männlich",
  female: "Weiblich",
  wivesCountLabel: "Anzahl hinterbliebener Ehefrauen",
  hasHusbandLabel: "Hinterbliebener Ehemann",
  yes: "Ja",
  no: "Nein",
  sonsLabel: "Söhne",
  daughtersLabel: "Töchter",
  fatherAliveLabel: "Vater lebt",
  motherAliveLabel: "Mutter lebt",
  kalalahHint: "Keine Kinder und kein Vater — die Geschwister unten werden relevant (Kalāla-Fall).",
  fullBrothersLabel: "Vollbrüder (gleicher Vater & gleiche Mutter)",
  fullSistersLabel: "Vollschwestern (gleicher Vater & gleiche Mutter)",
  uterineSiblingsLabel: "Halbgeschwister mütterlicherseits — nur gleiche Mutter",
  estateLabel: "Gesamtnachlass (brutto)",
  debtLabel: "Schulden der verstorbenen Person",
  funeralCostLabel: "Bestattungskosten",
  willLabel: "Vermächtnis (Wasiyya, Nicht-Erbe)",
  willCapNote: "Ein Vermächtnis an einen Nicht-Erben darf 1/3 des Nettonachlasses nicht überschreiten — darüber liegende Beträge werden automatisch begrenzt.",
  netEstateLabel: "Zu verteilender Nettonachlass",
  resultsTitle: "Anteile",
  heirLabel: "Erbe",
  shareLabel: "Anteil",
  amountLabel: "Betrag",
  noRecognizedHeir: "Aus diesen Angaben wurde kein Erbe erkannt — wende dich an einen Farāʾid-Gelehrten oder ein religiöses Gericht; der Nachlass kann an entferntere Verwandte oder die Staatskasse (Bait al-Māl) fallen.",
  aulNote: "'Awl angewendet: Die festen Anteile übersteigen den gesamten Nachlass, daher wurde jeder Anteil proportional gekürzt — die klassische Lösung nach dem Urteil von Umar ibn al-Chattāb.",
  raddNote: "Radd angewendet: Die festen Anteile lassen einen Rest ohne Resterben ('Asaba); er wurde proportional an die berechtigten Erben zurückgegeben (Ehepartner erhalten nie Radd).",
  umariyyatainNote: "Gharrāwain/'Umariyyatain-Fall: Bei nur Ehepartner und beiden Eltern beträgt der Anteil der Mutter 1/3 des Restes nach dem Ehepartner-Anteil, nicht 1/3 des gesamten Nachlasses.",
  heirNames: {
    suami: "Ehemann",
    istri: "Ehefrau(en) (zusammen)",
    ayah: "Vater",
    ibu: "Mutter",
    anak_laki: "Söhne (zusammen)",
    anak_perempuan: "Töchter (zusammen)",
    saudara_seibu: "Halbgeschwister mütterlicherseits (zusammen)",
    saudara_laki_kandung: "Vollbrüder (zusammen)",
    saudari_kandung: "Vollschwestern (zusammen)",
  },
  disclaimer:
    "Deckt nur die übliche Familienkonstellation ab: Ehepartner, Kinder, Eltern und — nur wenn weder Kinder noch Vater vorhanden sind — Voll- und mütterliche Halbgeschwister. Großeltern, väterliche Halbgeschwister oder Enkel in Stellvertretung werden NICHT modelliert; diese Fälle haben zusätzliche Regeln und beim Großvater neben Geschwistern echte Unterschiede zwischen den klassischen Rechtsschulen. Wende dich in solchen Fällen oder bei großem Nachlass vor jeder Teilung an einen qualifizierten Farāʾid-Gelehrten oder ein religiöses Gericht.",
};

const ES: WarisLabels = {
  title: "Calculadora de herencia (Faráid)",
  subtitle: "Las partes de la herencia islámica para la estructura familiar habitual — calculadas por completo en tu dispositivo.",
  deceasedGenderLabel: "La persona fallecida es",
  male: "Hombre",
  female: "Mujer",
  wivesCountLabel: "Número de esposas supervivientes",
  hasHusbandLabel: "Esposo superviviente",
  yes: "Sí",
  no: "No",
  sonsLabel: "Hijos varones",
  daughtersLabel: "Hijas",
  fatherAliveLabel: "Padre vivo",
  motherAliveLabel: "Madre viva",
  kalalahHint: "Sin hijos y sin padre supervivientes — los hermanos de abajo pasan a ser relevantes (caso de kalala).",
  fullBrothersLabel: "Hermanos carnales (mismo padre y madre)",
  fullSistersLabel: "Hermanas carnales (mismo padre y madre)",
  uterineSiblingsLabel: "Hermanos uterinos — solo la misma madre",
  estateLabel: "Patrimonio total (bruto)",
  debtLabel: "Deudas de la persona fallecida",
  funeralCostLabel: "Gastos funerarios",
  willLabel: "Legado (wasiyya, a un no heredero)",
  willCapNote: "Un legado a un no heredero no puede superar 1/3 del patrimonio neto — el exceso se limita automáticamente.",
  netEstateLabel: "Patrimonio neto a repartir",
  resultsTitle: "Partes",
  heirLabel: "Heredero",
  shareLabel: "Parte",
  amountLabel: "Importe",
  noRecognizedHeir: "No se reconoció ningún heredero con estos datos — consulta a un sabio de faráid o a un tribunal religioso; el patrimonio puede pasar a parientes más lejanos o al tesoro público (bait al-mal).",
  aulNote: "Se aplicó el 'awl: las partes fijas suman más que todo el patrimonio, así que cada parte se redujo proporcionalmente — la solución clásica del dictamen de Úmar ibn al-Jattab.",
  raddNote: "Se aplicó el radd: las partes fijas dejan un resto sin heredero residual ('asaba) que lo absorba, así que se devolvió proporcionalmente a los herederos con derecho (el cónyuge nunca recibe radd).",
  umariyyatainNote: "Caso Gharrawain/'Umariyyatain: con solo el cónyuge y ambos padres, la parte de la madre es 1/3 del resto tras la parte del cónyuge, no 1/3 de todo el patrimonio.",
  heirNames: {
    suami: "Esposo",
    istri: "Esposa(s) (en conjunto)",
    ayah: "Padre",
    ibu: "Madre",
    anak_laki: "Hijos varones (en conjunto)",
    anak_perempuan: "Hijas (en conjunto)",
    saudara_seibu: "Hermanos uterinos (en conjunto)",
    saudara_laki_kandung: "Hermanos carnales (en conjunto)",
    saudari_kandung: "Hermanas carnales (en conjunto)",
  },
  disclaimer:
    "Cubre solo la estructura familiar habitual: cónyuge, hijos, padres y — únicamente cuando no hay hijos ni padre — hermanos carnales y uterinos. NO modela abuelos, hermanos consanguíneos (solo de padre) ni nietos por representación; esos casos tienen reglas adicionales y, para el abuelo junto a hermanos, diferencias reales entre las escuelas clásicas. Para esas situaciones, o un patrimonio de gran valor, consulta a un sabio cualificado de faráid o a un tribunal religioso antes de repartir nada.",
};

const MAP: Record<string, WarisLabels> = { en: EN, id: ID, fr: FR, de: DE, es: ES };

export function warisLabels(locale: string): WarisLabels {
  return MAP[locale] ?? EN;
}
