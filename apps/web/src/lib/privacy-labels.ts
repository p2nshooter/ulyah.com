import { fillLabels } from "./fill-labels";
// Self-contained privacy policy content, same pattern as prayer-labels.ts —
// a real legal document should not be run through on-demand machine
// translation. Every sibling language (id/en/fr/de/es) is hand-written in
// full; anything else falls back to English. Brand tokens are rewritten per
// tenant (rebrandDeep), so 1fr.fr/tilawa.de/dawa.es never show "ULYAH".

import { rebrandDeep } from "./rebrand";

export interface PrivacySection {
  heading: string;
  body: string[];
}

export interface PrivacyLabels {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
}

const EN: PrivacyLabels = {
  title: "Privacy Policy",
  lastUpdated: "Last updated: July 18, 2026",
  intro:
    "ULYAH.COM (\"we\", \"the site\") is a free, donation-funded Islamic audio and knowledge platform. This page explains what information we collect and how it is used.",
  sections: [
    {
      heading: "Advertising (Google AdSense)",
      body: [
        "This site shows ads served by Google AdSense to help cover its running costs. Google and its partners may use cookies (including, where applicable, personalised-advertising cookies) to serve ads based on your visits to this and other websites.",
        "You can opt out of personalised advertising at any time via Google's Ads Settings (adssettings.google.com). Visitors in the EEA/UK are shown a consent message where required, and you can learn how Google uses data at policies.google.com/technologies/partner-sites.",
      ],
    },
    {
      heading: "Information we collect",
      body: [
        "A locale preference cookie (which language you're browsing in), plus the advertising cookies described above.",
        "Donating itself requires no account and no registration — we take no data from you at all to accept a donation. Only if you want a personalised keepsake certificate for your donation do we ask for the name/email to put on it, purely to generate and send that certificate.",
        "Anonymous pageview analytics: the page path, your two-letter country (from Cloudflare's edge network), and your UI language. No IP address, name, or other identifier is stored alongside this.",
        "If you install one of our apps to your home screen, we record that an install happened and which app, plus your country — no device identifier is stored.",
      ],
    },
    {
      heading: "Payments",
      body: [
        "Donations are processed directly by PayPal and NOWPayments. We never see or store your card number, bank details, or wallet private keys — only the donation amount and, only if you asked for a keepsake certificate, the name you chose to submit for it.",
      ],
    },
    {
      heading: "How we share data",
      body: [
        "We do not sell personal data. Beyond the advertising partner above (Google AdSense) and the payment processors, data is shared with no one, and only ever to complete something you initiated yourself.",
      ],
    },
    {
      heading: "Children's privacy",
      body: [
        "This site is intended for a general audience and does not knowingly collect personal data from children beyond the anonymous analytics described above.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        "We may update this page as the site evolves. The \"Last updated\" date at the top will always reflect the latest version.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Questions about this policy or your data can be sent to salam@ulyah.com.",
      ],
    },
  ],
};

const ID: PrivacyLabels = {
  title: "Kebijakan Privasi",
  lastUpdated: "Terakhir diperbarui: 18 Juli 2026",
  intro:
    "ULYAH.COM (\"kami\", \"situs ini\") adalah platform audio dan ilmu Islam yang gratis dan didanai donasi. Halaman ini menjelaskan data yang kami kumpulkan dan bagaimana data itu digunakan.",
  sections: [
    {
      heading: "Iklan (Google AdSense)",
      body: [
        "Situs ini menampilkan iklan dari Google AdSense untuk membantu menutup biaya operasional. Google dan mitranya dapat menggunakan cookie (termasuk, bila berlaku, cookie iklan terpersonalisasi) untuk menayangkan iklan berdasarkan kunjungan Anda ke situs ini dan situs lain.",
        "Anda dapat menonaktifkan iklan terpersonalisasi kapan saja melalui Setelan Iklan Google (adssettings.google.com). Pengunjung di EEA/Inggris akan melihat pesan persetujuan bila diwajibkan; cara Google menggunakan data dapat dibaca di policies.google.com/technologies/partner-sites.",
      ],
    },
    {
      heading: "Data yang kami kumpulkan",
      body: [
        "Cookie preferensi bahasa (bahasa tampilan yang Anda pilih), ditambah cookie iklan yang dijelaskan di atas.",
        "Berdonasi sendiri tidak memerlukan akun atau pendaftaran apa pun — kami tidak mengambil data apa pun dari Anda untuk menerima donasi. Hanya jika Anda ingin sertifikat kenang-kenangan yang dipersonalisasi, kami meminta nama/email untuk dicantumkan di sertifikat itu, semata untuk membuat dan mengirimkannya.",
        "Analitik kunjungan anonim: jalur halaman, kode negara dua-huruf (dari jaringan edge Cloudflare), dan bahasa tampilan Anda. Tidak ada alamat IP, nama, atau identitas lain yang disimpan bersamanya.",
        "Jika Anda memasang salah satu aplikasi kami ke layar utama HP, kami mencatat bahwa pemasangan terjadi dan aplikasi mana, beserta negara Anda — tanpa menyimpan identitas perangkat.",
      ],
    },
    {
      heading: "Pembayaran",
      body: [
        "Donasi diproses langsung oleh PayPal dan NOWPayments. Kami tidak pernah melihat atau menyimpan nomor kartu, data rekening bank, atau kunci privat dompet kripto Anda — hanya jumlah donasi dan, hanya jika Anda meminta sertifikat kenang-kenangan, nama yang Anda pilih untuk dicantumkan.",
      ],
    },
    {
      heading: "Bagaimana kami membagikan data",
      body: [
        "Kami tidak menjual data pribadi. Di luar mitra iklan di atas (Google AdSense) dan prosesor pembayaran, data tidak dibagikan ke siapa pun, dan hanya untuk menyelesaikan sesuatu yang Anda mulai sendiri.",
      ],
    },
    {
      heading: "Privasi anak",
      body: [
        "Situs ini ditujukan untuk khalayak umum dan tidak secara sengaja mengumpulkan data pribadi dari anak-anak di luar analitik anonim yang dijelaskan di atas.",
      ],
    },
    {
      heading: "Perubahan kebijakan",
      body: [
        "Kami dapat memperbarui halaman ini seiring perkembangan situs. Tanggal \"Terakhir diperbarui\" di bagian atas akan selalu mencerminkan versi terbaru.",
      ],
    },
    {
      heading: "Kontak",
      body: [
        "Pertanyaan tentang kebijakan ini atau data Anda dapat dikirim ke salam@ulyah.com.",
      ],
    },
  ],
};

const FR: PrivacyLabels = {
  title: "Politique de confidentialité",
  lastUpdated: "Dernière mise à jour : 18 juillet 2026",
  intro:
    "ULYAH.COM (« nous », « le site ») est une plateforme islamique d'audio et de savoir, gratuite et financée par les dons. Cette page explique quelles informations nous collectons et comment elles sont utilisées.",
  sections: [
    {
      heading: "Publicité (Google AdSense)",
      body: [
        "Ce site affiche des annonces diffusées par Google AdSense afin de couvrir ses coûts de fonctionnement. Google et ses partenaires peuvent utiliser des cookies (y compris, le cas échéant, des cookies de publicité personnalisée) pour diffuser des annonces en fonction de vos visites sur ce site et d'autres sites.",
        "Vous pouvez désactiver la publicité personnalisée à tout moment via les Paramètres des annonces de Google (adssettings.google.com). Les visiteurs de l'EEE/du Royaume-Uni voient un message de consentement lorsque c'est requis ; l'utilisation des données par Google est expliquée sur policies.google.com/technologies/partner-sites.",
      ],
    },
    {
      heading: "Informations que nous collectons",
      body: [
        "Un cookie de préférence de langue (la langue dans laquelle vous naviguez), plus les cookies publicitaires décrits ci-dessus.",
        "Faire un don ne nécessite ni compte ni inscription — nous ne collectons aucune donnée pour accepter un don. Ce n'est que si vous souhaitez un certificat souvenir personnalisé que nous demandons le nom/l'e-mail à y inscrire, uniquement pour générer et envoyer ce certificat.",
        "Statistiques de visite anonymes : le chemin de la page, votre pays en deux lettres (via le réseau edge de Cloudflare) et votre langue d'interface. Aucune adresse IP, aucun nom ni autre identifiant n'est stocké avec cela.",
        "Si vous installez l'une de nos applications sur votre écran d'accueil, nous enregistrons qu'une installation a eu lieu et quelle application, plus votre pays — aucun identifiant d'appareil n'est stocké.",
      ],
    },
    {
      heading: "Paiements",
      body: [
        "Les dons sont traités directement par PayPal et NOWPayments. Nous ne voyons ni ne stockons jamais votre numéro de carte, vos coordonnées bancaires ou vos clés privées de portefeuille — uniquement le montant du don et, seulement si vous avez demandé un certificat souvenir, le nom que vous avez choisi d'y faire figurer.",
      ],
    },
    {
      heading: "Partage des données",
      body: [
        "Nous ne vendons pas de données personnelles. En dehors du partenaire publicitaire ci-dessus (Google AdSense) et des prestataires de paiement, les données ne sont partagées avec personne, et uniquement pour mener à bien une action que vous avez vous-même initiée.",
      ],
    },
    {
      heading: "Vie privée des enfants",
      body: [
        "Ce site s'adresse à un public général et ne collecte pas sciemment de données personnelles d'enfants au-delà des statistiques anonymes décrites ci-dessus.",
      ],
    },
    {
      heading: "Modifications de cette politique",
      body: [
        "Nous pouvons mettre à jour cette page au fil de l'évolution du site. La date de « Dernière mise à jour » en haut reflétera toujours la version la plus récente.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Toute question sur cette politique ou vos données peut être envoyée à salam@ulyah.com.",
      ],
    },
  ],
};

const DE: PrivacyLabels = {
  title: "Datenschutzerklärung",
  lastUpdated: "Zuletzt aktualisiert: 18. Juli 2026",
  intro:
    "ULYAH.COM („wir“, „die Seite“) ist eine kostenlose, spendenfinanzierte islamische Audio- und Wissensplattform. Diese Seite erklärt, welche Informationen wir erheben und wie sie verwendet werden.",
  sections: [
    {
      heading: "Werbung (Google AdSense)",
      body: [
        "Diese Seite zeigt Anzeigen über Google AdSense, um ihre Betriebskosten zu decken. Google und seine Partner können Cookies verwenden (einschließlich, wo zutreffend, Cookies für personalisierte Werbung), um Anzeigen auf Grundlage deiner Besuche dieser und anderer Websites auszuliefern.",
        "Du kannst personalisierte Werbung jederzeit über die Google-Anzeigeneinstellungen (adssettings.google.com) deaktivieren. Besuchern im EWR/Vereinigten Königreich wird, wo erforderlich, eine Einwilligungsabfrage angezeigt; wie Google Daten verwendet, erfährst du unter policies.google.com/technologies/partner-sites.",
      ],
    },
    {
      heading: "Welche Daten wir erheben",
      body: [
        "Ein Sprachpräferenz-Cookie (in welcher Sprache du die Seite nutzt) sowie die oben beschriebenen Werbe-Cookies.",
        "Für eine Spende ist weder ein Konto noch eine Registrierung nötig — wir erheben dafür keinerlei Daten. Nur wenn du ein personalisiertes Erinnerungszertifikat möchtest, fragen wir nach Name/E-Mail, ausschließlich um dieses Zertifikat zu erstellen und zu versenden.",
        "Anonyme Seitenaufruf-Statistiken: der Seitenpfad, dein Zwei-Buchstaben-Land (aus dem Cloudflare-Edge-Netz) und deine Oberflächensprache. Keine IP-Adresse, kein Name und keine andere Kennung wird dazu gespeichert.",
        "Wenn du eine unserer Apps auf dem Startbildschirm installierst, erfassen wir, dass eine Installation stattfand, welche App und dein Land — keine Gerätekennung wird gespeichert.",
      ],
    },
    {
      heading: "Zahlungen",
      body: [
        "Spenden werden direkt von PayPal und NOWPayments abgewickelt. Wir sehen oder speichern niemals deine Kartennummer, Bankdaten oder privaten Wallet-Schlüssel — nur den Spendenbetrag und, nur falls du ein Erinnerungszertifikat wolltest, den dafür angegebenen Namen.",
      ],
    },
    {
      heading: "Weitergabe von Daten",
      body: [
        "Wir verkaufen keine personenbezogenen Daten. Außer an den oben genannten Werbepartner (Google AdSense) und die Zahlungsdienstleister werden Daten an niemanden weitergegeben — und nur, um etwas abzuschließen, das du selbst angestoßen hast.",
      ],
    },
    {
      heading: "Privatsphäre von Kindern",
      body: [
        "Diese Seite richtet sich an ein allgemeines Publikum und erhebt wissentlich keine personenbezogenen Daten von Kindern über die oben beschriebenen anonymen Statistiken hinaus.",
      ],
    },
    {
      heading: "Änderungen dieser Erklärung",
      body: [
        "Wir können diese Seite mit der Weiterentwicklung der Plattform aktualisieren. Das Datum „Zuletzt aktualisiert“ oben spiegelt stets die neueste Fassung wider.",
      ],
    },
    {
      heading: "Kontakt",
      body: [
        "Fragen zu dieser Erklärung oder deinen Daten kannst du an salam@ulyah.com senden.",
      ],
    },
  ],
};

const ES: PrivacyLabels = {
  title: "Política de privacidad",
  lastUpdated: "Última actualización: 18 de julio de 2026",
  intro:
    "ULYAH.COM («nosotros», «el sitio») es una plataforma islámica de audio y conocimiento, gratuita y financiada con donaciones. Esta página explica qué información recogemos y cómo se utiliza.",
  sections: [
    {
      heading: "Publicidad (Google AdSense)",
      body: [
        "Este sitio muestra anuncios servidos por Google AdSense para ayudar a cubrir sus costes de funcionamiento. Google y sus socios pueden usar cookies (incluidas, cuando proceda, cookies de publicidad personalizada) para mostrar anuncios según tus visitas a este y otros sitios web.",
        "Puedes desactivar la publicidad personalizada en cualquier momento en la Configuración de anuncios de Google (adssettings.google.com). A los visitantes del EEE/Reino Unido se les muestra un mensaje de consentimiento cuando es obligatorio; puedes saber cómo usa Google los datos en policies.google.com/technologies/partner-sites.",
      ],
    },
    {
      heading: "Información que recogemos",
      body: [
        "Una cookie de preferencia de idioma (en qué idioma navegas), además de las cookies publicitarias descritas arriba.",
        "Donar no requiere cuenta ni registro — no tomamos ningún dato tuyo para aceptar una donación. Solo si quieres un certificado de recuerdo personalizado te pedimos el nombre/correo que aparecerá en él, únicamente para generarlo y enviártelo.",
        "Analítica anónima de visitas: la ruta de la página, tu país en dos letras (de la red edge de Cloudflare) y tu idioma de interfaz. No se guarda ninguna dirección IP, nombre ni otro identificador junto a esto.",
        "Si instalas una de nuestras aplicaciones en tu pantalla de inicio, registramos que hubo una instalación y qué aplicación, más tu país — no se guarda ningún identificador del dispositivo.",
      ],
    },
    {
      heading: "Pagos",
      body: [
        "Las donaciones las procesan directamente PayPal y NOWPayments. Nunca vemos ni guardamos tu número de tarjeta, datos bancarios ni claves privadas de tu cartera — solo el importe de la donación y, únicamente si pediste un certificado de recuerdo, el nombre que elegiste para él.",
      ],
    },
    {
      heading: "Cómo compartimos los datos",
      body: [
        "No vendemos datos personales. Aparte del socio publicitario mencionado (Google AdSense) y los procesadores de pago, no compartimos datos con nadie, y solo para completar algo que tú mismo iniciaste.",
      ],
    },
    {
      heading: "Privacidad de los menores",
      body: [
        "Este sitio está dirigido a un público general y no recoge a sabiendas datos personales de menores más allá de la analítica anónima descrita arriba.",
      ],
    },
    {
      heading: "Cambios en esta política",
      body: [
        "Podemos actualizar esta página a medida que el sitio evolucione. La fecha de «Última actualización» de arriba reflejará siempre la versión más reciente.",
      ],
    },
    {
      heading: "Contacto",
      body: [
        "Las preguntas sobre esta política o tus datos pueden enviarse a salam@ulyah.com.",
      ],
    },
  ],
};

const MAP: Record<string, PrivacyLabels> = { en: EN, id: ID, fr: FR, de: DE, es: ES };

export function privacyLabels(locale: string): PrivacyLabels {
  return rebrandDeep(MAP[locale] ?? fillLabels(locale, EN));
}
