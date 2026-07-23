import { fillLabels } from "./fill-labels";
/**
 * Localized strings for the AI advisor (AiChat + FloatingAiChat). Each sibling
 * site renders its OWN native language (owner rule: .fr full French, .de full
 * German — never an Indonesian/English fallback), and the brand name is the
 * tenant's own (`{site}`), never a hardcoded "ULYAH.COM". Missing locales fall
 * back to English, never Indonesian.
 */
export interface AiChatLabels {
  title: string; // "Ask the Islamic AI"
  bubble: string; // short label on the floating bubble
  openBubble: string; // aria-label to open
  closeBubble: string; // aria-label to close
  intro: (site: string) => string;
  placeholder: string;
  send: string;
  answering: string;
  sourcesFrom: (site: string) => string;
  disclaimer: (site: string) => string;
  rateLimited: string;
  error: string;
  specialists: { master: string; quran: string; hadits: string; fiqih: string; sirah: string; akhlak: string };
}

const L: Record<string, AiChatLabels> = {
  id: {
    title: "Tanya AI Islami",
    bubble: "Tanya AI",
    openBubble: "Buka Tanya AI",
    closeBubble: "Tutup Tanya AI",
    intro: (site) =>
      `Tanyakan apa saja tentang Al-Qur'an, tafsir, hadits, fiqih, kisah, atau kitab. Jawaban diambil dari seluruh database ${site}, lengkap dengan rujukan yang bisa Anda buka langsung.`,
    placeholder: "Tulis pertanyaan…",
    send: "Kirim",
    answering: "AI sedang menjawab…",
    sourcesFrom: (site) => `Rujukan dari ${site}:`,
    disclaimer: (site) =>
      `Jawaban berbasis database ${site} & bersitasi, gratis tanpa batas wajar. Untuk keputusan hukum penting, tetap rujuk ke ustadz terpercaya.`,
    rateLimited: "Anda telah bertanya cukup banyak untuk saat ini 🌷. Daftar sebagai donatur agar batasnya lebih longgar.",
    error: "Mohon maaf, layanan ini sedang kami siapkan dengan sebaik-baiknya. Silakan mencoba kembali sesaat lagi, insyaAllah.",
    specialists: { master: "✦ Penasihat Utama", quran: "Al-Qur'an", hadits: "Hadits", fiqih: "Fiqih", sirah: "Sirah", akhlak: "Akhlak" },
  },
  en: {
    title: "Ask the Islamic AI",
    bubble: "Ask AI",
    openBubble: "Open the AI chat",
    closeBubble: "Close the AI chat",
    intro: (site) =>
      `Ask anything about the Qur'an, tafsir, hadith, fiqh, stories, or the classical books. Answers are drawn from the entire ${site} database, complete with references you can open directly.`,
    placeholder: "Type your question…",
    send: "Send",
    answering: "The AI is answering…",
    sourcesFrom: (site) => `References from ${site}:`,
    disclaimer: (site) =>
      `Answers are grounded in the ${site} database and cited, free within fair use. For important legal rulings, still consult a trusted scholar.`,
    rateLimited: "You've asked quite a lot for now 🌷. Register as a donor to raise the limit.",
    error: "We're sorry — this service is being prepared with the greatest care. Please try again in a moment, insha'Allah.",
    specialists: { master: "✦ Chief Advisor", quran: "Qur'an", hadits: "Hadith", fiqih: "Fiqh", sirah: "Sirah", akhlak: "Character" },
  },
  fr: {
    title: "Interroger l'IA islamique",
    bubble: "Demander à l'IA",
    openBubble: "Ouvrir le chat IA",
    closeBubble: "Fermer le chat IA",
    intro: (site) =>
      `Posez n'importe quelle question sur le Coran, le tafsir, le hadith, le fiqh, les récits ou les ouvrages classiques. Les réponses proviennent de toute la base de données ${site}, avec des références que vous pouvez ouvrir directement.`,
    placeholder: "Écrivez votre question…",
    send: "Envoyer",
    answering: "L'IA répond…",
    sourcesFrom: (site) => `Références de ${site} :`,
    disclaimer: (site) =>
      `Les réponses s'appuient sur la base de données ${site} et sont sourcées, gratuites dans la limite d'un usage raisonnable. Pour les décisions juridiques importantes, consultez toujours un savant de confiance.`,
    rateLimited: "Vous avez déjà beaucoup demandé pour l'instant 🌷. Inscrivez-vous comme donateur pour augmenter la limite.",
    error: "Nous sommes désolés — ce service est préparé avec le plus grand soin. Veuillez réessayer dans un instant, in shâ'a Llâh.",
    specialists: { master: "✦ Conseiller principal", quran: "Coran", hadits: "Hadith", fiqih: "Fiqh", sirah: "Sîra", akhlak: "Comportement" },
  },
  de: {
    title: "Die islamische KI fragen",
    bubble: "KI fragen",
    openBubble: "KI-Chat öffnen",
    closeBubble: "KI-Chat schließen",
    intro: (site) =>
      `Fragen Sie alles über den Koran, Tafsir, Hadith, Fiqh, Geschichten oder die klassischen Werke. Die Antworten stammen aus der gesamten ${site}-Datenbank, samt Quellen, die Sie direkt öffnen können.`,
    placeholder: "Ihre Frage eingeben…",
    send: "Senden",
    answering: "Die KI antwortet…",
    sourcesFrom: (site) => `Quellen aus ${site}:`,
    disclaimer: (site) =>
      `Die Antworten stützen sich auf die ${site}-Datenbank und sind belegt, kostenlos im Rahmen fairer Nutzung. Für wichtige rechtliche Entscheidungen wenden Sie sich weiterhin an einen vertrauenswürdigen Gelehrten.`,
    rateLimited: "Sie haben für den Moment recht viel gefragt 🌷. Registrieren Sie sich als Spender, um das Limit zu erhöhen.",
    error: "Es tut uns leid — dieser Dienst wird mit größter Sorgfalt vorbereitet. Bitte versuchen Sie es gleich noch einmal, in schā' Allāh.",
    specialists: { master: "✦ Hauptberater", quran: "Koran", hadits: "Hadith", fiqih: "Fiqh", sirah: "Sīra", akhlak: "Charakter" },
  },
  es: {
    title: "Pregunta a la IA islámica",
    bubble: "Preguntar a la IA",
    openBubble: "Abrir el chat de IA",
    closeBubble: "Cerrar el chat de IA",
    intro: (site) =>
      `Pregunta lo que quieras sobre el Corán, el tafsir, los hadices, el fiqh, los relatos o los libros clásicos. Las respuestas provienen de toda la base de datos de ${site}, con referencias que puedes abrir directamente.`,
    placeholder: "Escribe tu pregunta…",
    send: "Enviar",
    answering: "La IA está respondiendo…",
    sourcesFrom: (site) => `Referencias de ${site}:`,
    disclaimer: (site) =>
      `Las respuestas se basan en la base de datos de ${site} y están citadas, gratis dentro de un uso razonable. Para decisiones jurídicas importantes, consulta siempre a un sabio de confianza.`,
    rateLimited: "Ya has preguntado bastante por ahora 🌷. Regístrate como donante para ampliar el límite.",
    error: "Lo sentimos — este servicio se está preparando con el mayor cuidado. Inténtalo de nuevo en un momento, in sha' Allah.",
    specialists: { master: "✦ Consejero principal", quran: "Corán", hadits: "Hadices", fiqih: "Fiqh", sirah: "Sira", akhlak: "Carácter" },
  },
  ar: {
    title: "اسأل الذكاء الاصطناعي الإسلامي",
    bubble: "اسأل",
    openBubble: "افتح المحادثة",
    closeBubble: "أغلق المحادثة",
    intro: (site) =>
      `اسأل عن أي شيء يخص القرآن والتفسير والحديث والفقه والقصص والكتب. تُستقى الإجابات من كامل قاعدة بيانات ${site}، مع مراجع يمكنك فتحها مباشرةً.`,
    placeholder: "اكتب سؤالك…",
    send: "إرسال",
    answering: "الذكاء الاصطناعي يجيب…",
    sourcesFrom: (site) => `مراجع من ${site}:`,
    disclaimer: (site) =>
      `الإجابات مستندة إلى قاعدة بيانات ${site} وموثّقة، مجانية ضمن الاستخدام المعقول. وللأحكام الشرعية المهمة، ارجع دائمًا إلى عالم موثوق.`,
    rateLimited: "لقد سألت كثيرًا في الوقت الحالي 🌷. سجّل كمتبرّع لرفع الحد.",
    error: "نعتذر — هذه الخدمة قيد الإعداد بأفضل صورة. يرجى المحاولة بعد لحظات، إن شاء الله.",
    specialists: { master: "✦ المستشار الرئيسي", quran: "القرآن", hadits: "الحديث", fiqih: "الفقه", sirah: "السيرة", akhlak: "الأخلاق" },
  },
};

export function aiChatLabels(locale: string): AiChatLabels {
  return L[locale] ?? fillLabels(locale, L.en!);
}
