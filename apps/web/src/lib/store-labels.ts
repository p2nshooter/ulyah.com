import { fillLabels } from "./fill-labels";

/**
 * Wording for the Amazon store page.
 *
 * The four sites that have a store each speak one language, and those four are
 * hand-written here rather than machine-filled — this page carries a LEGAL
 * disclosure, and a disclosure has to be right, not approximately right. The
 * `fillLabels` fallback still exists so nothing can ever render in English on a
 * site that is not English, but on the four that matter it never fires.
 */
export interface StoreLabels {
  title: string;
  intro: string;
  /** Amazon requires this sentence, or one very like it, on any page with
   *  affiliate links. It is not decoration and must not be dropped. */
  disclosure: string;
  /** Said plainly, because it is true and readers can tell. */
  noExtraCost: string;
  /** The button on every category card. */
  browseOnAmazon: string;
  /** Shown instead, on a category that has a buying guide of its own. */
  readGuide: string;
  empty: string;
}

const EN: StoreLabels = {
  title: "Recommended reading and equipment",
  intro:
    "Categories we have put together ourselves, each opening a ready-made Amazon search so you can choose from everything on offer there. Nothing is bought or sold on this site.",
  disclosure: "As an Amazon Associate we earn from qualifying purchases.",
  noExtraCost:
    "Buying through these links costs you nothing extra, and the commission helps keep this site free to read and listen to.",
  browseOnAmazon: "Browse on Amazon",
  readGuide: "What to look for",
  empty: "No categories yet.",
};

const L: Record<string, StoreLabels> = {
  en: EN,
  id: {
    title: "Bacaan & perlengkapan pilihan",
    intro:
      "Kategori yang kami susun sendiri, masing-masing membuka pencarian Amazon yang sudah tersaring supaya Anda bisa memilih dari seluruh pilihan di sana. Tidak ada jual beli di situs ini.",
    disclosure: "Sebagai Amazon Associate, kami memperoleh komisi dari pembelian yang memenuhi syarat.",
    noExtraCost:
      "Membeli lewat tautan ini tidak menambah biaya sedikit pun bagi Anda, dan komisinya membantu situs ini tetap gratis dibaca dan didengarkan.",
    browseOnAmazon: "Telusuri di Amazon",
    readGuide: "Yang perlu diperhatikan",
    empty: "Belum ada kategori.",
  },
  fr: {
    title: "Lectures et équipements recommandés",
    intro:
      "Des catégories que nous avons composées nous-mêmes, chacune ouvrant une recherche Amazon déjà filtrée pour que vous choisissiez parmi tout ce qui s'y trouve. Rien n'est acheté ni vendu sur ce site.",
    disclosure:
      "En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.",
    noExtraCost:
      "Acheter via ces liens ne vous coûte pas un centime de plus, et la commission aide ce site à rester gratuit à lire et à écouter.",
    browseOnAmazon: "Parcourir sur Amazon",
    readGuide: "Ce qu'il faut regarder",
    empty: "Aucune catégorie pour le moment.",
  },
  de: {
    title: "Empfohlene Bücher und Ausstattung",
    intro:
      "Kategorien, die wir selbst zusammengestellt haben — jede öffnet eine fertig gefilterte Amazon-Suche, damit Sie aus dem gesamten Angebot dort wählen können. Auf dieser Seite wird nichts gekauft oder verkauft.",
    disclosure: "Als Amazon-Partner verdienen wir an qualifizierten Verkäufen.",
    noExtraCost:
      "Ein Kauf über diese Links kostet Sie keinen Cent mehr, und die Provision hilft, diese Seite zum Lesen und Hören kostenlos zu halten.",
    browseOnAmazon: "Bei Amazon stöbern",
    readGuide: "Worauf zu achten ist",
    empty: "Noch keine Kategorien.",
  },
  es: {
    title: "Lecturas y artículos recomendados",
    intro:
      "Categorías que hemos preparado nosotros mismos; cada una abre una búsqueda de Amazon ya filtrada para que elija entre todo lo que hay allí. En este sitio no se compra ni se vende nada.",
    disclosure: "Como Afiliado de Amazon, obtenemos ingresos por las compras adscritas que cumplen los requisitos aplicables.",
    noExtraCost:
      "Comprar a través de estos enlaces no le cuesta ni un céntimo más, y la comisión ayuda a que este sitio siga siendo gratuito para leer y escuchar.",
    browseOnAmazon: "Explorar en Amazon",
    readGuide: "En qué fijarse",
    empty: "Todavía no hay categorías.",
  },
};

export function storeLabels(locale: string): StoreLabels {
  return L[locale] ?? fillLabels(locale, EN);
}
