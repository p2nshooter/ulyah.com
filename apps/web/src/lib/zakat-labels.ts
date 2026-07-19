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

const FR: ZakatLabels = {
  title: "Calculateur de Zakât",
  subtitle: "Zakât al-Maal (biens) et Zakât al-Fitr — calculées entièrement sur votre appareil, rien n'est envoyé nulle part.",
  maalTitle: "💰 Zakât al-Maal",
  maalIntro:
    "Les biens atteignant le nisâb (seuil minimal) et détenus pendant une année lunaire (hawl) sont soumis à une zakât de 2,5 %.",
  nisabBasisLabel: "Référence du nisâb",
  nisabGold: "Or (85 g)",
  nisabSilver: "Argent (595 g)",
  wealthLabel: "Total de vos biens soumis à la zakât",
  pricePerGramLabel: "Prix actuel du gramme",
  nisabValueLabel: "Seuil du nisâb",
  belowNisab: "En dessous du nisâb — la zakât al-maal n'est pas encore obligatoire pour ce montant.",
  zakatDueLabel: "Zakât due (2,5 %)",
  fitrahTitle: "🌾 Zakât al-Fitr",
  fitrahIntro: "Versée par chaque musulman avant la prière de l'Aïd — une quantité de nourriture de base (≈2,5 kg) par personne, ou son équivalent en argent.",
  peopleLabel: "Nombre de personnes",
  staplePriceLabel: "Prix de la nourriture de base par kg",
  fitrahTotalLabel: "Total de la zakât al-fitr",
  disclaimer:
    "Estimation éducative fondée sur des références de fiqh couramment citées (nisâb : 85 g d'or / 595 g d'argent, 2,5 kg par personne pour la fitr). Consultez un savant de confiance ou votre organisme local pour votre situation particulière.",
};

const DE: ZakatLabels = {
  title: "Zakāt-Rechner",
  subtitle: "Zakāt al-Māl (Vermögen) und Zakāt al-Fitr — vollständig auf deinem Gerät berechnet, nichts wird gesendet.",
  maalTitle: "💰 Zakāt al-Māl",
  maalIntro:
    "Vermögen, das den Nisāb (Mindestgrenze) erreicht und ein Mondjahr (Hawl) gehalten wird, unterliegt 2,5 % Zakāt.",
  nisabBasisLabel: "Nisāb-Referenz",
  nisabGold: "Gold (85 g)",
  nisabSilver: "Silber (595 g)",
  wealthLabel: "Dein gesamtes zakātpflichtiges Vermögen",
  pricePerGramLabel: "Aktueller Preis pro Gramm",
  nisabValueLabel: "Nisāb-Grenze",
  belowNisab: "Unter dem Nisāb — Zakāt al-Māl ist für diesen Betrag noch nicht verpflichtend.",
  zakatDueLabel: "Fällige Zakāt (2,5 %)",
  fitrahTitle: "🌾 Zakāt al-Fitr",
  fitrahIntro: "Von jedem Muslim vor dem Id-Gebet zu entrichten — eine Grundnahrungsmenge (≈2,5 kg) pro Person oder ihr Geldwert.",
  peopleLabel: "Anzahl der Personen",
  staplePriceLabel: "Preis des Grundnahrungsmittels pro kg",
  fitrahTotalLabel: "Gesamte Zakāt al-Fitr",
  disclaimer:
    "Eine edukative Schätzung auf Basis gängiger Fiqh-Referenzen (Nisāb: 85 g Gold / 595 g Silber, 2,5 kg pro Person für die Fitr). Wende dich für deine konkrete Situation an einen vertrauenswürdigen Gelehrten oder deine örtliche Zakāt-Stelle.",
};

const ES: ZakatLabels = {
  title: "Calculadora de Zakat",
  subtitle: "Zakat al-Mal (bienes) y Zakat al-Fitr — calculados por completo en tu dispositivo, no se envía nada a ninguna parte.",
  maalTitle: "💰 Zakat al-Mal",
  maalIntro:
    "Los bienes que alcanzan el nisab (umbral mínimo) y se poseen durante un año lunar (hawl) están sujetos a un zakat del 2,5 %.",
  nisabBasisLabel: "Referencia del nisab",
  nisabGold: "Oro (85 g)",
  nisabSilver: "Plata (595 g)",
  wealthLabel: "Total de tus bienes sujetos al zakat",
  pricePerGramLabel: "Precio actual por gramo",
  nisabValueLabel: "Umbral del nisab",
  belowNisab: "Por debajo del nisab — el zakat al-mal aún no es obligatorio para esta cantidad.",
  zakatDueLabel: "Zakat a pagar (2,5 %)",
  fitrahTitle: "🌾 Zakat al-Fitr",
  fitrahIntro: "Lo paga cada musulmán antes de la oración del Eid — una cantidad de alimento básico (≈2,5 kg) por persona, o su equivalente en dinero.",
  peopleLabel: "Número de personas",
  staplePriceLabel: "Precio del alimento básico por kg",
  fitrahTotalLabel: "Total del zakat al-fitr",
  disclaimer:
    "Una estimación educativa basada en referencias de fiqh comúnmente citadas (nisab: 85 g de oro / 595 g de plata, 2,5 kg por persona para el fitr). Consulta a un sabio de confianza o a tu organismo local de zakat para tu situación concreta.",
};

const MAP: Record<string, ZakatLabels> = { en: EN, id: ID, fr: FR, de: DE, es: ES };

export function zakatLabels(locale: string): ZakatLabels {
  return MAP[locale] ?? EN;
}
