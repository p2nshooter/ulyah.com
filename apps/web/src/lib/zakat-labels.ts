// Self-contained UI strings for the Zakat calculator, same pattern as
// contact-labels.ts. English is the fallback for locales not listed.

export interface ZakatLabels {
  title: string;
  subtitle: string;
  maalTitle: string;
  maalIntro: string;
  nisabBasisLabel: string;
  nisabGold: string;
  nisabSilver: string;
  wealthLabel: string;
  pricePerGramLabel: string;
  nisabValueLabel: string;
  belowNisab: string;
  zakatDueLabel: string;
  fitrahTitle: string;
  fitrahIntro: string;
  peopleLabel: string;
  staplePriceLabel: string;
  fitrahTotalLabel: string;
  disclaimer: string;
}

const EN: ZakatLabels = {
  title: "Zakat Calculator",
  subtitle: "Zakat Maal (wealth) and Zakat Fitrah — calculated entirely on your device, nothing sent anywhere.",
  maalTitle: "💰 Zakat Maal",
  maalIntro:
    "Wealth reaching the nisab (minimum threshold) and held for one lunar year (haul) is subject to 2.5% zakat.",
  nisabBasisLabel: "Nisab reference",
  nisabGold: "Gold (85 g)",
  nisabSilver: "Silver (595 g)",
  wealthLabel: "Your total zakatable wealth",
  pricePerGramLabel: "Current price per gram",
  nisabValueLabel: "Nisab threshold",
  belowNisab: "Below nisab — zakat maal is not yet obligatory on this amount.",
  zakatDueLabel: "Zakat due (2.5%)",
  fitrahTitle: "🌾 Zakat Fitrah",
  fitrahIntro: "Paid by every Muslim before Eid prayer — a staple-food amount (≈2.5 kg) per person, or its cash equivalent.",
  peopleLabel: "Number of people",
  staplePriceLabel: "Staple food price per kg",
  fitrahTotalLabel: "Total zakat fitrah",
  disclaimer:
    "An educational estimate based on commonly cited fiqh references (85 g gold / 595 g silver nisab, 2.5 kg per person for fitrah). Consult a trusted scholar or your local amil zakat for your specific situation.",
};

const ID: ZakatLabels = {
  title: "Kalkulator Zakat",
  subtitle: "Zakat Maal (harta) dan Zakat Fitrah — dihitung sepenuhnya di perangkat Anda, tidak dikirim ke mana pun.",
  maalTitle: "💰 Zakat Maal",
  maalIntro: "Harta yang mencapai nisab (batas minimal) dan dimiliki selama satu tahun hijriah (haul) wajib dizakati 2,5%.",
  nisabBasisLabel: "Acuan nisab",
  nisabGold: "Emas (85 gram)",
  nisabSilver: "Perak (595 gram)",
  wealthLabel: "Total harta yang wajib dizakati",
  pricePerGramLabel: "Harga saat ini per gram",
  nisabValueLabel: "Batas nisab",
  belowNisab: "Di bawah nisab — zakat maal belum wajib untuk jumlah ini.",
  zakatDueLabel: "Zakat yang wajib dikeluarkan (2,5%)",
  fitrahTitle: "🌾 Zakat Fitrah",
  fitrahIntro: "Dikeluarkan setiap muslim sebelum shalat Id — sejumlah makanan pokok (±2,5 kg) per jiwa, atau senilai uangnya.",
  peopleLabel: "Jumlah jiwa",
  staplePriceLabel: "Harga makanan pokok per kg",
  fitrahTotalLabel: "Total zakat fitrah",
  disclaimer:
    "Perkiraan edukatif berdasarkan rujukan fikih yang umum dipakai (nisab emas 85 gram / perak 595 gram, fitrah 2,5 kg per jiwa). Untuk situasi khusus, tanyakan kepada ustadz terpercaya atau amil zakat setempat.",
};

const MAP: Record<string, ZakatLabels> = { en: EN, id: ID };

export function zakatLabels(locale: string): ZakatLabels {
  return MAP[locale] ?? EN;
}
