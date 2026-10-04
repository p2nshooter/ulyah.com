import { fillLabels } from "./fill-labels";
import { rebrandDeep } from "./rebrand";
import type { PrivacyLabels } from "./privacy-labels";

/**
 * Terms, cookie policy, disclaimer and editorial policy — the four pages an
 * AdSense reviewer looks for next to the about, contact and privacy pages
 * (owner, 2026-10-04: "semua situs punya about, contact, privacy, cookies,
 * terms, disclaimer, editorial policy").
 *
 * Same pattern as privacy-labels.ts: a legal text is hand-written in every
 * sibling language (id/en/fr/de/es), never machine-translated on the fly;
 * other locales fall back through fillLabels. Brand tokens are rewritten per
 * tenant (rebrandDeep), so 1fr.fr, tilawa.de, dawa.es and xad.es show their
 * own name. The folder of each page is Indonesian like every route here;
 * packages/shared/src/routes.ts gives each one a slug per language.
 */

export type LegalKey = "terms" | "cookies" | "disclaimer" | "editorial";

export const LEGAL_ROUTES: Record<LegalKey, string> = {
  terms: "/syarat-ketentuan",
  cookies: "/kebijakan-cookie",
  disclaimer: "/penafian",
  editorial: "/kebijakan-editorial",
};

export interface LegalLabels extends PrivacyLabels {
  /** Short label for the footer link. */
  nav: string;
}

type Doc = Record<LegalKey, LegalLabels>;

const EN: Doc = {
  terms: {
    nav: "Terms of Use",
    title: "Terms of Use",
    lastUpdated: "Last updated: October 4, 2026",
    intro: "These terms apply to everyone who uses ULYAH.COM. By using the site you agree to them; if you do not, please do not use it.",
    sections: [
      { heading: "A free service for learning", body: ["ULYAH.COM offers Qur'an recitation, translations, hadith, classical books, prayer times and other Islamic resources free of charge, funded by donations and advertising. You may use the site for personal study, teaching and worship."] },
      { heading: "Using our content", body: ["You may read, listen to and share links to any page. Short quotations with a link to the source are welcome. Do not republish whole pages, translations or recordings, or use them commercially, without permission. Sacred texts belong to everyone; the presentation, translations and recordings on this site are protected."] },
      { heading: "Accounts and contributions", body: ["If you create an account, keep your login details private and give accurate information. Questions and other contributions you send must be respectful and lawful; we may edit or remove anything abusive, false or off-topic."] },
      { heading: "Donations", body: ["Donations are voluntary and support the running costs of the site. They do not buy services or influence content. Contact us if you believe a payment was made by mistake."] },
      { heading: "Information, not a fatwa", body: ["Explanations, calculators and answers on the site are general information. For a ruling that applies to your own situation, consult a qualified scholar. See our disclaimer."] },
      { heading: "Advertising and links", body: ["The site shows ads served by Google AdSense, separated from our content; an ad is not an endorsement. We link to other sites for reference but are not responsible for their content."] },
      { heading: "Changes", body: ["We may update the site and these terms; the date above shows the current version. Questions: salam@ulyah.com."] },
    ],
  },
  cookies: {
    nav: "Cookie Policy",
    title: "Cookie Policy",
    lastUpdated: "Last updated: October 4, 2026",
    intro: "Cookies are small text files stored in your browser. This page explains which cookies ULYAH.COM uses and how to control them.",
    sections: [
      { heading: "Cookies we set", body: ["A language cookie remembers the language you chose. If you sign in, a session cookie keeps you signed in. Your display preferences, such as light or dark mode, may be kept in your browser's local storage. None of these are used for advertising."] },
      { heading: "Statistics without cookies", body: ["We count page views anonymously, with the page, country and interface language only. This counting does not set a cookie and does not identify you."] },
      { heading: "Advertising cookies from Google", body: ["The site shows ads served by Google AdSense. Google and its partners may set or read cookies to show ads, limit repetition, measure performance, personalize ads where you have allowed it and prevent fraud. Visitors in the EEA, the UK and Switzerland are asked for consent first.", "You can turn off personalized ads in Google's Ads Settings (adssettings.google.com) and read how Google uses cookies at policies.google.com/technologies/ads."] },
      { heading: "Controlling cookies", body: ["You can view, block or delete cookies in your browser settings. Blocking cookies does not stop you from reading or listening; you may need to choose your language again and you will not stay signed in."] },
    ],
  },
  disclaimer: {
    nav: "Disclaimer",
    title: "Disclaimer",
    lastUpdated: "Last updated: October 4, 2026",
    intro: "ULYAH.COM publishes Islamic texts, translations, explanations and tools for general learning. Please keep the following limits in mind.",
    sections: [
      { heading: "Not a fatwa or personal ruling", body: ["Explanations, articles and answers on the site are general information drawn from recognized sources. They are not a fatwa for your particular circumstances. For questions of worship, family, inheritance or finance that affect you personally, consult a qualified scholar or your local religious authority."] },
      { heading: "Prayer times and the qibla", body: ["Prayer times, imsakiyah schedules and the qibla direction are calculated with standard astronomical methods and the location you provide. Different calculation methods and local conventions can give slightly different results; follow your local mosque when in doubt."] },
      { heading: "Calculators", body: ["The zakat and inheritance calculators help you understand the rules and check your arithmetic. Real cases can involve details a calculator cannot see; confirm important results with a scholar."] },
      { heading: "Translations and recordings", body: ["Translations convey meaning and are not the Qur'an itself. We take care with every text and recording, but errors can occur; please report them so we can correct them."] },
      { heading: "Advertising", body: ["Ads are served by Google AdSense. We do not choose individual advertisers and are not responsible for their offers."] },
    ],
  },
  editorial: {
    nav: "Editorial Policy",
    title: "Editorial Policy",
    lastUpdated: "Last updated: October 4, 2026",
    intro: "Readers trust ULYAH.COM with sacred texts and religious knowledge. This page explains how we try to deserve that trust.",
    sections: [
      { heading: "Our standards", body: ["Faithful to the sources: Qur'an text, hadith and classical works are presented with their references, and we say which collection, edition or translation a text comes from.", "Clear about certainty: where scholars differ, we say so rather than presenting one view as the only one.", "Respectful: content is written for Muslims of every background and for anyone who wants to learn."] },
      { heading: "Sources", body: ["The Qur'an in the standard Uthmani script with established recitations; the major hadith collections with their numbering and grading where available; recognized classical works of tafsir, fiqh and history; and published research by qualified scholars."] },
      { heading: "Review and corrections", body: ["Texts, translations and explanations are checked against their sources before publication. When an error is reported, we verify it and correct it promptly. Write to salam@ulyah.com with the page and, if possible, the source."] },
      { heading: "Independence", body: ["The site is funded by donations and by advertising served by Google AdSense, which is kept separate from our content. Donors and advertisers have no influence on what we publish."] },
    ],
  },
};

const ID: Doc = {
  terms: {
    nav: "Syarat & Ketentuan",
    title: "Syarat & Ketentuan",
    lastUpdated: "Terakhir diperbarui: 4 Oktober 2026",
    intro: "Ketentuan ini berlaku bagi setiap pengguna ULYAH.COM. Dengan menggunakan situs ini Anda menyetujuinya; jika tidak, mohon tidak menggunakan situs ini.",
    sections: [
      { heading: "Layanan gratis untuk belajar", body: ["ULYAH.COM menyediakan murattal Al-Qur'an, terjemahan, hadits, kitab, jadwal sholat dan sumber keislaman lain secara gratis, dibiayai donasi dan iklan. Anda boleh memakainya untuk belajar, mengajar dan beribadah."] },
      { heading: "Penggunaan konten", body: ["Anda boleh membaca, mendengarkan dan membagikan tautan halaman mana pun. Kutipan singkat dengan tautan ke sumbernya dipersilakan. Jangan menerbitkan ulang halaman, terjemahan atau rekaman secara utuh, atau memakainya untuk tujuan komersial, tanpa izin."] },
      { heading: "Akun dan kiriman", body: ["Jika membuat akun, jaga kerahasiaan data masuk Anda dan berikan informasi yang benar. Pertanyaan dan kiriman lain harus sopan dan sesuai hukum; kami dapat menyunting atau menghapus kiriman yang kasar, keliru atau di luar topik."] },
      { heading: "Donasi", body: ["Donasi bersifat sukarela untuk biaya operasional situs. Donasi tidak membeli layanan dan tidak memengaruhi isi. Hubungi kami jika ada pembayaran yang keliru."] },
      { heading: "Informasi, bukan fatwa", body: ["Penjelasan, kalkulator dan jawaban di situs ini adalah informasi umum. Untuk hukum yang berlaku pada keadaan Anda sendiri, tanyakan kepada ulama yang berkompeten. Lihat halaman penafian."] },
      { heading: "Iklan dan tautan", body: ["Situs ini menampilkan iklan Google AdSense yang terpisah dari konten; iklan bukan dukungan dari kami. Kami menautkan situs lain sebagai rujukan tetapi tidak bertanggung jawab atas isinya."] },
      { heading: "Perubahan", body: ["Kami dapat memperbarui situs dan ketentuan ini; tanggal di atas menunjukkan versi terbaru. Pertanyaan: salam@ulyah.com."] },
    ],
  },
  cookies: {
    nav: "Kebijakan Cookie",
    title: "Kebijakan Cookie",
    lastUpdated: "Terakhir diperbarui: 4 Oktober 2026",
    intro: "Cookie adalah berkas teks kecil yang disimpan di peramban Anda. Halaman ini menjelaskan cookie yang dipakai ULYAH.COM dan cara mengaturnya.",
    sections: [
      { heading: "Cookie dari kami", body: ["Cookie bahasa mengingat bahasa yang Anda pilih. Jika Anda masuk, cookie sesi menjaga Anda tetap masuk. Preferensi tampilan, seperti mode terang atau gelap, dapat disimpan di penyimpanan lokal peramban. Tidak satu pun dipakai untuk iklan."] },
      { heading: "Statistik tanpa cookie", body: ["Kami menghitung kunjungan secara anonim, hanya halaman, negara dan bahasa antarmuka. Penghitungan ini tidak memasang cookie dan tidak mengenali Anda."] },
      { heading: "Cookie iklan dari Google", body: ["Situs ini menampilkan iklan Google AdSense. Google dan mitranya dapat memasang atau membaca cookie untuk menampilkan iklan, membatasi pengulangan, mengukur kinerja, mempersonalisasi iklan bila Anda izinkan, dan mencegah penipuan. Pengunjung dari EEA, Inggris dan Swiss dimintai persetujuan lebih dulu.", "Anda dapat mematikan iklan yang dipersonalisasi di Setelan Iklan Google (adssettings.google.com) dan membaca cara Google memakai cookie di policies.google.com/technologies/ads."] },
      { heading: "Mengatur cookie", body: ["Anda dapat melihat, memblokir atau menghapus cookie di pengaturan peramban. Memblokir cookie tidak menghalangi Anda membaca atau mendengarkan; Anda mungkin perlu memilih bahasa lagi dan tidak tetap masuk."] },
    ],
  },
  disclaimer: {
    nav: "Penafian",
    title: "Penafian",
    lastUpdated: "Terakhir diperbarui: 4 Oktober 2026",
    intro: "ULYAH.COM menerbitkan teks keislaman, terjemahan, penjelasan dan alat bantu untuk pembelajaran umum. Mohon perhatikan batasan berikut.",
    sections: [
      { heading: "Bukan fatwa pribadi", body: ["Penjelasan, artikel dan jawaban di situs ini adalah informasi umum dari sumber yang diakui, bukan fatwa untuk keadaan khusus Anda. Untuk masalah ibadah, keluarga, waris atau keuangan yang menyangkut diri Anda, tanyakan kepada ulama yang berkompeten atau otoritas keagamaan setempat."] },
      { heading: "Jadwal sholat dan kiblat", body: ["Jadwal sholat, imsakiyah dan arah kiblat dihitung dengan metode astronomi standar dan lokasi yang Anda berikan. Metode dan kebiasaan setempat dapat memberi hasil yang sedikit berbeda; jika ragu, ikuti masjid setempat."] },
      { heading: "Kalkulator", body: ["Kalkulator zakat dan waris membantu memahami aturan dan memeriksa hitungan. Kasus nyata bisa mengandung rincian yang tidak terbaca kalkulator; pastikan hasil penting kepada ulama."] },
      { heading: "Terjemahan dan rekaman", body: ["Terjemahan menyampaikan makna dan bukan Al-Qur'an itu sendiri. Kami berhati-hati dengan setiap teks dan rekaman, tetapi kesalahan bisa terjadi; mohon laporkan agar kami perbaiki."] },
      { heading: "Iklan", body: ["Iklan ditayangkan oleh Google AdSense. Kami tidak memilih pengiklan tertentu dan tidak bertanggung jawab atas penawaran mereka."] },
    ],
  },
  editorial: {
    nav: "Kebijakan Editorial",
    title: "Kebijakan Editorial",
    lastUpdated: "Terakhir diperbarui: 4 Oktober 2026",
    intro: "Pembaca mempercayakan teks suci dan ilmu agama kepada ULYAH.COM. Halaman ini menjelaskan cara kami menjaga amanah itu.",
    sections: [
      { heading: "Standar kami", body: ["Setia pada sumber: teks Al-Qur'an, hadits dan kitab disajikan beserta rujukannya, termasuk kitab, cetakan atau terjemahan asalnya.", "Jujur soal perbedaan: bila ulama berbeda pendapat, kami menyebutkannya, tidak menyajikan satu pendapat seolah-olah satu-satunya.", "Santun: konten ditulis untuk umat Islam dari berbagai latar belakang dan siapa pun yang ingin belajar."] },
      { heading: "Sumber", body: ["Al-Qur'an dengan rasm Utsmani standar dan qiraat yang mapan; kitab-kitab hadits utama dengan penomoran dan derajatnya bila tersedia; karya klasik tafsir, fikih dan sejarah yang diakui; serta kajian para ulama dan peneliti yang berkompeten."] },
      { heading: "Pemeriksaan dan koreksi", body: ["Teks, terjemahan dan penjelasan diperiksa terhadap sumbernya sebelum terbit. Bila ada laporan kesalahan, kami memeriksanya dan memperbaikinya segera. Kirimkan ke salam@ulyah.com beserta halaman dan, bila bisa, sumbernya."] },
      { heading: "Independensi", body: ["Situs ini dibiayai donasi dan iklan Google AdSense yang terpisah dari konten. Donatur dan pengiklan tidak memengaruhi apa yang kami terbitkan."] },
    ],
  },
};

const FR: Doc = {
  terms: {
    nav: "Conditions d'utilisation",
    title: "Conditions d'utilisation",
    lastUpdated: "Dernière mise à jour : 4 octobre 2026",
    intro: "Ces conditions s'appliquent à toute personne qui utilise ULYAH.COM. En utilisant le site, vous les acceptez ; sinon, merci de ne pas l'utiliser.",
    sections: [
      { heading: "Un service gratuit pour apprendre", body: ["ULYAH.COM propose gratuitement la récitation du Coran, des traductions, des hadiths, des livres classiques, les horaires de prière et d'autres ressources islamiques, financés par les dons et la publicité. Vous pouvez l'utiliser pour l'étude, l'enseignement et l'adoration."] },
      { heading: "Utilisation des contenus", body: ["Vous pouvez lire, écouter et partager le lien de n'importe quelle page. Les courtes citations avec un lien vers la source sont bienvenues. Ne republiez pas de pages, traductions ou enregistrements entiers, et ne les utilisez pas à des fins commerciales, sans autorisation."] },
      { heading: "Comptes et contributions", body: ["Si vous créez un compte, gardez vos identifiants confidentiels et donnez des informations exactes. Les questions et contributions doivent être respectueuses et licites ; nous pouvons modifier ou supprimer ce qui est injurieux, faux ou hors sujet."] },
      { heading: "Dons", body: ["Les dons sont volontaires et couvrent les frais de fonctionnement du site. Ils n'achètent aucun service et n'influencent pas les contenus. Contactez-nous en cas de paiement effectué par erreur."] },
      { heading: "Information, pas une fatwa", body: ["Les explications, calculateurs et réponses du site sont des informations générales. Pour un avis qui concerne votre situation, consultez un savant qualifié. Voir notre avertissement."] },
      { heading: "Publicité et liens", body: ["Le site affiche des annonces Google AdSense, séparées de nos contenus ; une annonce n'est pas une recommandation. Nous renvoyons vers d'autres sites à titre de référence sans être responsables de leur contenu."] },
      { heading: "Modifications", body: ["Nous pouvons mettre à jour le site et ces conditions ; la date ci-dessus indique la version en vigueur. Questions : salam@ulyah.com."] },
    ],
  },
  cookies: {
    nav: "Politique relative aux cookies",
    title: "Politique relative aux cookies",
    lastUpdated: "Dernière mise à jour : 4 octobre 2026",
    intro: "Les cookies sont de petits fichiers texte enregistrés dans votre navigateur. Cette page explique quels cookies ULYAH.COM utilise et comment les gérer.",
    sections: [
      { heading: "Nos cookies", body: ["Un cookie de langue mémorise la langue choisie. Si vous vous connectez, un cookie de session vous garde connecté. Vos préférences d'affichage, comme le mode clair ou sombre, peuvent être conservées dans le stockage local du navigateur. Aucun n'est utilisé pour la publicité."] },
      { heading: "Statistiques sans cookies", body: ["Nous comptons les visites de façon anonyme : page, pays et langue de l'interface seulement. Ce comptage ne dépose aucun cookie et ne vous identifie pas."] },
      { heading: "Cookies publicitaires de Google", body: ["Le site affiche des annonces Google AdSense. Google et ses partenaires peuvent déposer ou lire des cookies pour diffuser des annonces, limiter les répétitions, mesurer les performances, personnaliser les annonces si vous l'avez accepté et prévenir la fraude. Les visiteurs de l'EEE, du Royaume-Uni et de Suisse sont d'abord invités à donner leur consentement.", "Vous pouvez désactiver les annonces personnalisées dans les Paramètres des annonces Google (adssettings.google.com) et consulter policies.google.com/technologies/ads."] },
      { heading: "Gérer les cookies", body: ["Vous pouvez consulter, bloquer ou supprimer les cookies dans les réglages de votre navigateur. Les bloquer ne vous empêche pas de lire ou d'écouter ; il faudra peut-être choisir de nouveau la langue et vous ne resterez pas connecté."] },
    ],
  },
  disclaimer: {
    nav: "Avertissement",
    title: "Avertissement",
    lastUpdated: "Dernière mise à jour : 4 octobre 2026",
    intro: "ULYAH.COM publie des textes islamiques, des traductions, des explications et des outils destinés à l'apprentissage général. Merci de garder à l'esprit les limites suivantes.",
    sections: [
      { heading: "Pas une fatwa personnelle", body: ["Les explications, articles et réponses du site sont des informations générales issues de sources reconnues, et non une fatwa adaptée à votre situation. Pour les questions d'adoration, de famille, d'héritage ou de finances qui vous concernent, consultez un savant qualifié ou l'autorité religieuse locale."] },
      { heading: "Horaires de prière et qibla", body: ["Les horaires de prière et la direction de la qibla sont calculés selon des méthodes astronomiques standard et la position indiquée. Les méthodes et usages locaux peuvent donner des résultats légèrement différents ; en cas de doute, suivez votre mosquée."] },
      { heading: "Calculateurs", body: ["Les calculateurs de zakat et d'héritage aident à comprendre les règles et à vérifier les calculs. Un cas réel peut comporter des détails qu'un calculateur ne voit pas ; faites confirmer les résultats importants par un savant."] },
      { heading: "Traductions et enregistrements", body: ["Une traduction transmet un sens et n'est pas le Coran lui-même. Nous apportons le plus grand soin aux textes et enregistrements, mais des erreurs restent possibles ; signalez-les pour que nous les corrigions."] },
      { heading: "Publicité", body: ["Les annonces sont diffusées par Google AdSense. Nous ne choisissons pas les annonceurs et ne sommes pas responsables de leurs offres."] },
    ],
  },
  editorial: {
    nav: "Politique éditoriale",
    title: "Politique éditoriale",
    lastUpdated: "Dernière mise à jour : 4 octobre 2026",
    intro: "Les lecteurs confient à ULYAH.COM des textes sacrés et un savoir religieux. Voici comment nous nous efforçons d'être dignes de cette confiance.",
    sections: [
      { heading: "Nos principes", body: ["Fidélité aux sources : le texte coranique, les hadiths et les ouvrages classiques sont présentés avec leurs références, en précisant le recueil, l'édition ou la traduction.", "Clarté sur les divergences : lorsque les savants divergent, nous le disons au lieu de présenter un avis comme le seul.", "Respect : les contenus s'adressent aux musulmans de tous horizons et à toute personne désireuse d'apprendre."] },
      { heading: "Sources", body: ["Le Coran selon l'écriture uthmanie standard et des récitations établies ; les grands recueils de hadiths avec leur numérotation et leur degré lorsqu'il est connu ; des ouvrages classiques reconnus de tafsir, de fiqh et d'histoire ; des travaux publiés par des savants qualifiés."] },
      { heading: "Relecture et corrections", body: ["Textes, traductions et explications sont vérifiés par rapport à leurs sources avant publication. Lorsqu'une erreur est signalée, nous la vérifions et la corrigeons rapidement. Écrivez à salam@ulyah.com en indiquant la page et, si possible, la source."] },
      { heading: "Indépendance", body: ["Le site est financé par les dons et par la publicité Google AdSense, séparée des contenus. Ni les donateurs ni les annonceurs n'influencent ce que nous publions."] },
    ],
  },
};

const DE: Doc = {
  terms: {
    nav: "Nutzungsbedingungen",
    title: "Nutzungsbedingungen",
    lastUpdated: "Zuletzt aktualisiert: 4. Oktober 2026",
    intro: "Diese Bedingungen gelten für alle, die ULYAH.COM nutzen. Mit der Nutzung der Website stimmen Sie ihnen zu; andernfalls nutzen Sie die Website bitte nicht.",
    sections: [
      { heading: "Ein kostenloses Lernangebot", body: ["ULYAH.COM bietet kostenlos Koranrezitationen, Übersetzungen, Hadithe, klassische Bücher, Gebetszeiten und weitere islamische Inhalte an, finanziert durch Spenden und Werbung. Sie können das Angebot zum Lernen, Lehren und für den Gottesdienst nutzen."] },
      { heading: "Nutzung der Inhalte", body: ["Sie dürfen jede Seite lesen, anhören und verlinken. Kurze Zitate mit Link zur Quelle sind willkommen. Ganze Seiten, Übersetzungen oder Aufnahmen dürfen ohne Erlaubnis nicht neu veröffentlicht oder kommerziell genutzt werden."] },
      { heading: "Konten und Beiträge", body: ["Wenn Sie ein Konto anlegen, halten Sie Ihre Zugangsdaten geheim und machen Sie wahrheitsgemäße Angaben. Fragen und Beiträge müssen respektvoll und rechtmäßig sein; beleidigende, falsche oder themenfremde Inhalte können wir bearbeiten oder entfernen."] },
      { heading: "Spenden", body: ["Spenden sind freiwillig und decken die Betriebskosten. Sie erwerben damit keine Leistung und keinen Einfluss auf Inhalte. Melden Sie sich bei uns, wenn eine Zahlung irrtümlich erfolgt ist."] },
      { heading: "Information, keine Fatwa", body: ["Erklärungen, Rechner und Antworten auf der Website sind allgemeine Informationen. Für eine Beurteilung Ihrer eigenen Situation wenden Sie sich an einen qualifizierten Gelehrten. Siehe unseren Haftungsausschluss."] },
      { heading: "Werbung und Links", body: ["Die Website zeigt Anzeigen von Google AdSense, getrennt von unseren Inhalten; eine Anzeige ist keine Empfehlung. Für Inhalte verlinkter Websites übernehmen wir keine Verantwortung."] },
      { heading: "Änderungen", body: ["Wir können die Website und diese Bedingungen ändern; das Datum oben zeigt die gültige Fassung. Fragen: salam@ulyah.com."] },
    ],
  },
  cookies: {
    nav: "Cookie-Richtlinie",
    title: "Cookie-Richtlinie",
    lastUpdated: "Zuletzt aktualisiert: 4. Oktober 2026",
    intro: "Cookies sind kleine Textdateien, die in Ihrem Browser gespeichert werden. Diese Seite erklärt, welche Cookies ULYAH.COM verwendet und wie Sie sie steuern können.",
    sections: [
      { heading: "Unsere Cookies", body: ["Ein Sprach-Cookie merkt sich die gewählte Sprache. Wenn Sie sich anmelden, hält ein Sitzungs-Cookie Sie angemeldet. Anzeigeeinstellungen wie heller oder dunkler Modus können im lokalen Speicher des Browsers liegen. Keines davon dient der Werbung."] },
      { heading: "Statistik ohne Cookies", body: ["Wir zählen Seitenaufrufe anonym, nur mit Seite, Land und Sprache der Oberfläche. Dabei wird kein Cookie gesetzt und Sie werden nicht identifiziert."] },
      { heading: "Werbe-Cookies von Google", body: ["Die Website zeigt Anzeigen von Google AdSense. Google und seine Partner können Cookies setzen oder lesen, um Anzeigen auszuliefern, Wiederholungen zu begrenzen, die Leistung zu messen, Anzeigen mit Ihrer Einwilligung zu personalisieren und Betrug zu verhindern. Besucher aus dem EWR, dem Vereinigten Königreich und der Schweiz werden vorher um Einwilligung gebeten.", "Personalisierte Werbung können Sie in den Google-Anzeigeneinstellungen (adssettings.google.com) abschalten; Informationen unter policies.google.com/technologies/ads."] },
      { heading: "Cookies verwalten", body: ["In den Browser-Einstellungen können Sie Cookies ansehen, blockieren oder löschen. Ohne Cookies können Sie weiterhin lesen und zuhören; eventuell müssen Sie die Sprache erneut wählen und bleiben nicht angemeldet."] },
    ],
  },
  disclaimer: {
    nav: "Haftungsausschluss",
    title: "Haftungsausschluss",
    lastUpdated: "Zuletzt aktualisiert: 4. Oktober 2026",
    intro: "ULYAH.COM veröffentlicht islamische Texte, Übersetzungen, Erklärungen und Werkzeuge für das allgemeine Lernen. Bitte beachten Sie folgende Grenzen.",
    sections: [
      { heading: "Keine persönliche Fatwa", body: ["Erklärungen, Artikel und Antworten auf der Website sind allgemeine Informationen aus anerkannten Quellen und keine Fatwa für Ihre persönliche Lage. Bei Fragen zu Gottesdienst, Familie, Erbe oder Finanzen, die Sie selbst betreffen, wenden Sie sich an einen qualifizierten Gelehrten oder Ihre örtliche Gemeinde."] },
      { heading: "Gebetszeiten und Qibla", body: ["Gebetszeiten und Qibla-Richtung werden mit üblichen astronomischen Verfahren und dem angegebenen Standort berechnet. Unterschiedliche Methoden und örtliche Gepflogenheiten können leicht abweichende Ergebnisse liefern; im Zweifel richten Sie sich nach Ihrer Moschee."] },
      { heading: "Rechner", body: ["Zakat- und Erbschaftsrechner helfen, die Regeln zu verstehen und Rechnungen zu prüfen. Reale Fälle können Einzelheiten enthalten, die ein Rechner nicht erfasst; lassen Sie wichtige Ergebnisse von einem Gelehrten bestätigen."] },
      { heading: "Übersetzungen und Aufnahmen", body: ["Eine Übersetzung gibt die Bedeutung wieder und ist nicht der Koran selbst. Wir arbeiten sorgfältig, doch Fehler sind möglich; bitte melden Sie sie, damit wir sie korrigieren."] },
      { heading: "Werbung", body: ["Anzeigen werden von Google AdSense ausgeliefert. Wir wählen keine einzelnen Werbetreibenden aus und haften nicht für deren Angebote."] },
    ],
  },
  editorial: {
    nav: "Redaktionelle Richtlinien",
    title: "Redaktionelle Richtlinien",
    lastUpdated: "Zuletzt aktualisiert: 4. Oktober 2026",
    intro: "Leserinnen und Leser vertrauen ULYAH.COM heilige Texte und religiöses Wissen an. So versuchen wir, diesem Vertrauen gerecht zu werden.",
    sections: [
      { heading: "Unsere Grundsätze", body: ["Treue zu den Quellen: Korantext, Hadithe und klassische Werke werden mit ihren Belegen dargestellt, einschließlich Sammlung, Ausgabe oder Übersetzung.", "Offenheit bei Meinungsverschiedenheiten: Wo Gelehrte unterschiedlicher Ansicht sind, sagen wir es, statt eine Meinung als die einzige darzustellen.", "Respekt: Die Inhalte richten sich an Musliminnen und Muslime jeder Herkunft und an alle, die lernen möchten."] },
      { heading: "Quellen", body: ["Der Koran in der üblichen uthmanischen Schrift mit anerkannten Rezitationen; die großen Hadithsammlungen mit Nummerierung und Einstufung, soweit verfügbar; anerkannte klassische Werke zu Tafsir, Fiqh und Geschichte; veröffentlichte Arbeiten qualifizierter Gelehrter."] },
      { heading: "Prüfung und Korrekturen", body: ["Texte, Übersetzungen und Erklärungen werden vor der Veröffentlichung an den Quellen geprüft. Gemeldete Fehler prüfen und korrigieren wir umgehend. Schreiben Sie an salam@ulyah.com mit der Seite und nach Möglichkeit der Quelle."] },
      { heading: "Unabhängigkeit", body: ["Die Website wird durch Spenden und Google-AdSense-Werbung finanziert, die von den Inhalten getrennt ist. Spender und Werbetreibende haben keinen Einfluss auf unsere Veröffentlichungen."] },
    ],
  },
};

const ES: Doc = {
  terms: {
    nav: "Términos y condiciones",
    title: "Términos y condiciones",
    lastUpdated: "Última actualización: 4 de octubre de 2026",
    intro: "Estas condiciones se aplican a todas las personas que usan ULYAH.COM. Al usar el sitio las aceptas; si no estás de acuerdo, te pedimos que no lo uses.",
    sections: [
      { heading: "Un servicio gratuito para aprender", body: ["ULYAH.COM ofrece gratis recitación del Corán, traducciones, hadices, libros clásicos, horarios de oración y otros recursos islámicos, financiados con donaciones y publicidad. Puedes usarlo para estudiar, enseñar y para tu práctica religiosa."] },
      { heading: "Uso de los contenidos", body: ["Puedes leer, escuchar y compartir el enlace de cualquier página. Las citas breves con un enlace a la fuente son bienvenidas. No republiques páginas, traducciones o grabaciones completas ni las uses con fines comerciales sin permiso."] },
      { heading: "Cuentas y aportaciones", body: ["Si creas una cuenta, guarda en secreto tus datos de acceso y facilita información veraz. Las preguntas y aportaciones deben ser respetuosas y lícitas; podemos editar o retirar lo que sea ofensivo, falso o ajeno al tema."] },
      { heading: "Donaciones", body: ["Las donaciones son voluntarias y cubren los costes del sitio. No compran servicios ni influyen en los contenidos. Escríbenos si se ha realizado un pago por error."] },
      { heading: "Información, no una fatua", body: ["Las explicaciones, calculadoras y respuestas del sitio son información general. Para un dictamen sobre tu situación concreta, consulta a un sabio cualificado. Consulta nuestro aviso de responsabilidad."] },
      { heading: "Publicidad y enlaces", body: ["El sitio muestra anuncios de Google AdSense, separados de nuestros contenidos; un anuncio no es una recomendación. Enlazamos otros sitios como referencia, pero no respondemos de su contenido."] },
      { heading: "Cambios", body: ["Podemos actualizar el sitio y estas condiciones; la fecha de arriba indica la versión vigente. Preguntas: salam@ulyah.com."] },
    ],
  },
  cookies: {
    nav: "Política de cookies",
    title: "Política de cookies",
    lastUpdated: "Última actualización: 4 de octubre de 2026",
    intro: "Las cookies son pequeños archivos de texto que se guardan en tu navegador. Esta página explica qué cookies usa ULYAH.COM y cómo gestionarlas.",
    sections: [
      { heading: "Nuestras cookies", body: ["Una cookie de idioma recuerda el idioma elegido. Si inicias sesión, una cookie de sesión te mantiene conectado. Tus preferencias de visualización, como el modo claro u oscuro, pueden guardarse en el almacenamiento local del navegador. Ninguna se usa para publicidad."] },
      { heading: "Estadísticas sin cookies", body: ["Contamos las visitas de forma anónima: solo la página, el país y el idioma de la interfaz. Este recuento no instala cookies ni te identifica."] },
      { heading: "Cookies publicitarias de Google", body: ["El sitio muestra anuncios de Google AdSense. Google y sus socios pueden instalar o leer cookies para mostrar anuncios, limitar repeticiones, medir el rendimiento, personalizar anuncios si lo has permitido y prevenir el fraude. A los visitantes del EEE, el Reino Unido y Suiza se les pide antes su consentimiento.", "Puedes desactivar los anuncios personalizados en la Configuración de anuncios de Google (adssettings.google.com) y leer cómo usa Google las cookies en policies.google.com/technologies/ads."] },
      { heading: "Gestionar las cookies", body: ["Puedes ver, bloquear o borrar las cookies en los ajustes del navegador. Bloquearlas no te impide leer ni escuchar; quizá tengas que elegir de nuevo el idioma y no permanecerás conectado."] },
    ],
  },
  disclaimer: {
    nav: "Aviso de responsabilidad",
    title: "Aviso de responsabilidad",
    lastUpdated: "Última actualización: 4 de octubre de 2026",
    intro: "ULYAH.COM publica textos islámicos, traducciones, explicaciones y herramientas para el aprendizaje general. Ten en cuenta estos límites.",
    sections: [
      { heading: "No es una fatua personal", body: ["Las explicaciones, artículos y respuestas del sitio son información general basada en fuentes reconocidas, no una fatua para tu caso particular. Para cuestiones de culto, familia, herencia o finanzas que te afecten, consulta a un sabio cualificado o a la autoridad religiosa local."] },
      { heading: "Horarios de oración y alquibla", body: ["Los horarios de oración y la dirección de la alquibla se calculan con métodos astronómicos estándar y la ubicación que indicas. Distintos métodos y costumbres locales pueden dar resultados algo diferentes; ante la duda, sigue a tu mezquita."] },
      { heading: "Calculadoras", body: ["Las calculadoras de zakat y de herencia ayudan a entender las normas y a comprobar las cuentas. Un caso real puede tener detalles que una calculadora no ve; confirma los resultados importantes con un sabio."] },
      { heading: "Traducciones y grabaciones", body: ["Una traducción transmite el sentido y no es el Corán en sí. Cuidamos cada texto y grabación, pero pueden existir errores; avísanos para corregirlos."] },
      { heading: "Publicidad", body: ["Los anuncios los sirve Google AdSense. No elegimos a los anunciantes y no respondemos de sus ofertas."] },
    ],
  },
  editorial: {
    nav: "Política editorial",
    title: "Política editorial",
    lastUpdated: "Última actualización: 4 de octubre de 2026",
    intro: "Los lectores confían a ULYAH.COM textos sagrados y conocimiento religioso. Así intentamos estar a la altura de esa confianza.",
    sections: [
      { heading: "Nuestros criterios", body: ["Fidelidad a las fuentes: el texto coránico, los hadices y las obras clásicas se presentan con sus referencias, indicando la colección, la edición o la traducción.", "Claridad ante las discrepancias: cuando los sabios difieren, lo decimos en lugar de presentar una opinión como la única.", "Respeto: los contenidos se dirigen a musulmanes de todo origen y a cualquier persona que quiera aprender."] },
      { heading: "Fuentes", body: ["El Corán en la escritura uzmaní estándar y con recitaciones reconocidas; las grandes colecciones de hadices con su numeración y su grado cuando se conoce; obras clásicas reconocidas de tafsir, fiqh e historia; y trabajos publicados por sabios cualificados."] },
      { heading: "Revisión y correcciones", body: ["Los textos, traducciones y explicaciones se cotejan con sus fuentes antes de publicarse. Cuando se comunica un error, lo comprobamos y lo corregimos con rapidez. Escribe a salam@ulyah.com indicando la página y, si es posible, la fuente."] },
      { heading: "Independencia", body: ["El sitio se financia con donaciones y con publicidad de Google AdSense, separada de los contenidos. Ni donantes ni anunciantes influyen en lo que publicamos."] },
    ],
  },
};

const MAP: Record<string, Doc> = { en: EN, id: ID, fr: FR, de: DE, es: ES };

export function legalLabels(key: LegalKey, locale: string): LegalLabels {
  const doc = MAP[locale];
  return rebrandDeep(doc ? doc[key] : fillLabels(locale, EN[key]));
}

/** Footer entries: route and label for each page, in this locale. */
export function legalNav(locale: string): { key: LegalKey; route: string; label: string }[] {
  return (Object.keys(LEGAL_ROUTES) as LegalKey[]).map((key) => ({ key, route: LEGAL_ROUTES[key], label: legalLabels(key, locale).nav }));
}
