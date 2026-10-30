/**
 * The owner's 45 kids videos in the languages of the sibling sites.
 *
 * The titles are a fixed seed (packages/db-schema/migrations/0030_video_anak.sql, keyed by
 * series and order), written in Indonesian, and every site showed them so: "Berkelahi Dengan
 * Setan", "Do'a Untuk Orang Tua" on 1fr.fr, tilawa.de, dawa.im and xad.es (docs/ADSENSE-
 * BLUEPRINT.md §19). The videos themselves are spoken in Indonesian, so a sibling site gives
 * the title in its own language AND says the video is in Indonesian (INDONESIAN_AUDIO).
 * The Indonesian lists are the seed's own wording. A title missing here (a video added later)
 * is shown as the database has it.
 */
type Lang = "id" | "en" | "fr" | "de" | "es";

const DOA_KISAH: Record<Lang, string[]> = {
  id: [
    "Surga Di Bawah Telapak Kaki Ibu", "Kelembutan Hati Sang Khalifah", "Do'a Untuk Orang Tua", "Do'a Tidur",
    "Do'a Saat Turun Hujan", "Do'a Naik Kendaraan", "Do'a Memakai Baju", "Do'a Melihat Pemandangan Indah",
    "Do'a Masuk Pasar", "Do'a Mandi", "Do'a Makan", "Do'a Keluar Rumah",
    "Berkelahi Dengan Setan", "Nabi Daud AS Melawan Jalut",
  ],
  en: [
    "Paradise Lies at the Feet of Mothers", "The Caliph's Gentle Heart", "Du'a for Parents", "Du'a Before Sleeping",
    "Du'a When It Rains", "Du'a When Setting Off in a Vehicle", "Du'a When Getting Dressed", "Du'a on Seeing a Beautiful View",
    "Du'a on Entering the Market", "Du'a for Bathing", "Du'a Before Eating", "Du'a on Leaving the House",
    "Fighting with Satan", "Prophet Dawud (AS) Against Goliath",
  ],
  fr: [
    "Le paradis est sous les pieds des mères", "La douceur du calife", "Invocation pour les parents", "Invocation avant de dormir",
    "Invocation quand il pleut", "Invocation en montant dans un véhicule", "Invocation en s'habillant", "Invocation devant un beau paysage",
    "Invocation en entrant au marché", "Invocation pour le bain", "Invocation avant de manger", "Invocation en sortant de la maison",
    "Se battre contre Satan", "Le prophète Dâwûd (AS) contre Goliath",
  ],
  de: [
    "Das Paradies liegt unter den Füßen der Mütter", "Das sanfte Herz des Kalifen", "Bittgebet für die Eltern", "Bittgebet vor dem Schlafen",
    "Bittgebet, wenn es regnet", "Bittgebet beim Losfahren", "Bittgebet beim Anziehen", "Bittgebet beim Anblick einer schönen Landschaft",
    "Bittgebet beim Betreten des Marktes", "Bittgebet beim Baden", "Bittgebet vor dem Essen", "Bittgebet beim Verlassen des Hauses",
    "Kampf mit dem Satan", "Prophet Dawud (AS) gegen Goliath",
  ],
  es: [
    "El paraíso está a los pies de las madres", "La ternura del califa", "Súplica por los padres", "Súplica antes de dormir",
    "Súplica cuando llueve", "Súplica al subir a un vehículo", "Súplica al vestirse", "Súplica al ver un hermoso paisaje",
    "Súplica al entrar al mercado", "Súplica al bañarse", "Súplica antes de comer", "Súplica al salir de casa",
    "Peleando con Satanás", "El profeta Daud (AS) contra Goliat",
  ],
};

const SYAMIL_DODO: Record<Lang, string[]> = {
  id: [
    "Shalat 5 Waktu", "Rukyat dan Hisab", "Pengertian Dua Kalimat", "Nabi & Rasul",
    "Mubah", "Mengapa Waktu Shalat Berbeda", "Makruh", "Lailatul Qadar", "Kitab-Kitab Allah",
    "Kisah Orang-Orang Terdahulu", "Kiamat", "Isra' Mi'raj", "Halal Haram",
    "Dodo Disayang Allah", "Tarawih", "Wajib", "Syirik dan Bentuk-Bentuknya", "Takdir",
    "Syahadat Risalah", "Sunnah", "Siapa Allah",
  ],
  en: [
    "The Five Daily Prayers", "Moon Sighting and Calculation", "The Meaning of the Two Testimonies", "Prophets & Messengers",
    "Permissible (Mubah)", "Why Prayer Times Differ", "Disliked (Makruh)", "Laylat al-Qadr", "The Books of Allah",
    "Stories of the People of the Past", "The Day of Judgement", "The Night Journey (Isra' Mi'raj)", "Halal and Haram",
    "Allah Loves Dodo", "Tarawih", "Obligatory (Wajib)", "Shirk and Its Forms", "Divine Decree (Qadar)",
    "Testimony of the Message", "Sunnah", "Who Is Allah?",
  ],
  fr: [
    "Les cinq prières quotidiennes", "Observation de la lune et calcul", "Le sens des deux attestations", "Prophètes et messagers",
    "Le permis (mubah)", "Pourquoi les heures de prière diffèrent", "Le déconseillé (makruh)", "Laylat al-Qadr", "Les Livres d'Allah",
    "Récits des peuples d'autrefois", "Le Jour du Jugement", "Le Voyage nocturne (Isra' Mi'raj)", "Halal et haram",
    "Allah aime Dodo", "Tarawih", "L'obligatoire (wajib)", "Le shirk et ses formes", "Le destin (qadar)",
    "L'attestation du message", "La Sunna", "Qui est Allah ?",
  ],
  de: [
    "Die fünf täglichen Gebete", "Mondsichtung und Berechnung", "Die Bedeutung der zwei Glaubensbekenntnisse", "Propheten und Gesandte",
    "Das Erlaubte (mubah)", "Warum die Gebetszeiten verschieden sind", "Das Verpönte (makruh)", "Laylat al-Qadr", "Die Bücher Allahs",
    "Geschichten früherer Völker", "Der Jüngste Tag", "Die Nachtreise (Isra' Mi'raj)", "Halal und haram",
    "Allah liebt Dodo", "Tarawih", "Das Pflichtgemäße (wajib)", "Schirk und seine Formen", "Die Vorherbestimmung (Qadar)",
    "Das Bekenntnis zur Gesandtschaft", "Die Sunna", "Wer ist Allah?",
  ],
  es: [
    "Las cinco oraciones diarias", "Avistamiento de la luna y cálculo", "El significado de los dos testimonios", "Profetas y mensajeros",
    "Lo permitido (mubah)", "Por qué cambian las horas de oración", "Lo desaconsejado (makruh)", "Laylat al-Qadr", "Los Libros de Allah",
    "Historias de los pueblos antiguos", "El Día del Juicio", "El Viaje Nocturno (Isra' Mi'raj)", "Halal y haram",
    "Allah ama a Dodo", "Tarawih", "Lo obligatorio (wajib)", "El shirk y sus formas", "El destino (qadar)",
    "El testimonio del mensaje", "La Sunna", "¿Quién es Allah?",
  ],
};

// Episodes 1–10; null where the Indonesian title carries no subtitle.
const BIOGRAFI: Record<Lang, { prefix: string; ep: string; subs: (string | null)[] }> = {
  id: { prefix: "Biografi Rasulullah SAW", ep: "Eps", subs: ["Tahun Gajah", null, "Hijrahnya", null, "Pesan", "Jawaban", "Jujur", "Kejayaan", "Ibadah", "Ibadah"] },
  en: { prefix: "Biography of the Prophet ﷺ", ep: "Ep.", subs: ["The Year of the Elephant", null, "His Hijra", null, "The Message", "The Answer", "Honesty", "Glory", "Worship", "Worship"] },
  fr: { prefix: "Biographie du Prophète ﷺ", ep: "Ép.", subs: ["L'Année de l'Éléphant", null, "Son Hégire", null, "Le message", "La réponse", "L'honnêteté", "La gloire", "L'adoration", "L'adoration"] },
  de: { prefix: "Biografie des Propheten ﷺ", ep: "Folge", subs: ["Das Jahr des Elefanten", null, "Seine Hidschra", null, "Die Botschaft", "Die Antwort", "Ehrlichkeit", "Ruhm", "Gottesdienst", "Gottesdienst"] },
  es: { prefix: "Biografía del Profeta ﷺ", ep: "Ep.", subs: ["El Año del Elefante", null, "Su Hégira", null, "El mensaje", "La respuesta", "La honestidad", "La gloria", "La adoración", "La adoración"] },
};

const isLang = (l: string): l is Lang => l === "id" || l === "en" || l === "fr" || l === "de" || l === "es";

export function videoTitle(locale: string, series: string, order: number, fallback: string): string {
  if (!isLang(locale)) return fallback;
  const i = order - 1;
  if (series === "doa-kisah") return DOA_KISAH[locale][i] ?? fallback;
  if (series === "syamil-dodo") {
    const t = SYAMIL_DODO[locale][i];
    return t ? `Syamil & Dodo — ${t}` : fallback;
  }
  if (series === "biografi-rasul") {
    const b = BIOGRAFI[locale];
    if (i < 0 || i >= b.subs.length) return fallback;
    const sub = b.subs[i];
    const colon = locale === "fr" ? " : " : ": "; // French sets a space before the colon
    return `${b.prefix} — ${b.ep} ${String(order).padStart(2, "0")}${sub ? `${colon}${sub}` : ""}`;
  }
  return fallback;
}

/** Said beside each series on a sibling site: the videos are spoken in Indonesian. */
export const INDONESIAN_AUDIO: Record<string, string> = {
  en: "🇮🇩 In Indonesian",
  fr: "🇮🇩 En indonésien",
  de: "🇮🇩 Auf Indonesisch",
  es: "🇮🇩 En indonesio",
};

// The world channels' country is free text typed in the admin, in Indonesian.
const COUNTRY: Record<string, Record<Lang, string>> = {
  "Indonesia": { id: "Indonesia", en: "Indonesia", fr: "Indonésie", de: "Indonesien", es: "Indonesia" },
  "Malaysia": { id: "Malaysia", en: "Malaysia", fr: "Malaisie", de: "Malaysia", es: "Malasia" },
  "Dunia Arab": { id: "Dunia Arab", en: "Arab world", fr: "Monde arabe", de: "Arabische Welt", es: "Mundo árabe" },
  "Global (English)": { id: "Global (English)", en: "Global (English)", fr: "Monde (anglais)", de: "Weltweit (Englisch)", es: "Global (inglés)" },
  "Pakistan (Urdu)": { id: "Pakistan (Urdu)", en: "Pakistan (Urdu)", fr: "Pakistan (ourdou)", de: "Pakistan (Urdu)", es: "Pakistán (urdu)" },
  "Mesir": { id: "Mesir", en: "Egypt", fr: "Égypte", de: "Ägypten", es: "Egipto" },
  "Arab Saudi": { id: "Arab Saudi", en: "Saudi Arabia", fr: "Arabie saoudite", de: "Saudi-Arabien", es: "Arabia Saudí" },
  "Turki": { id: "Turki", en: "Turkey", fr: "Turquie", de: "Türkei", es: "Turquía" },
  "Inggris": { id: "Inggris", en: "United Kingdom", fr: "Royaume-Uni", de: "Vereinigtes Königreich", es: "Reino Unido" },
  "Amerika Serikat": { id: "Amerika Serikat", en: "United States", fr: "États-Unis", de: "Vereinigte Staaten", es: "Estados Unidos" },
  "Prancis": { id: "Prancis", en: "France", fr: "France", de: "Frankreich", es: "Francia" },
  "Jerman": { id: "Jerman", en: "Germany", fr: "Allemagne", de: "Deutschland", es: "Alemania" },
  "Spanyol": { id: "Spanyol", en: "Spain", fr: "Espagne", de: "Spanien", es: "España" },
  "Maroko": { id: "Maroko", en: "Morocco", fr: "Maroc", de: "Marokko", es: "Marruecos" },
  "Kuwait": { id: "Kuwait", en: "Kuwait", fr: "Koweït", de: "Kuwait", es: "Kuwait" },
  "Uni Emirat Arab": { id: "Uni Emirat Arab", en: "United Arab Emirates", fr: "Émirats arabes unis", de: "Vereinigte Arabische Emirate", es: "Emiratos Árabes Unidos" },
};

export function channelCountry(locale: string, country: string): string {
  return isLang(locale) ? COUNTRY[country.trim()]?.[locale] ?? country : country;
}
