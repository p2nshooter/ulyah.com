/* Ecosystem page copy for 1fr.fr — French — written for this site only (lib/ecosystem.ts). */
import type { EcoCopy } from "./types";

export const ONEFAITH: Record<string, EcoCopy> = {
  fr: {
    menu: "✦ AXTO & XAA",
    eyebrow: "Notre propre promotion",
    title: "Des outils numériques pour les associations, les écoles et les entreprises — AXTO & XAA",
    description:
      "Découvrez AXTO, un espace d'IA respectueux de vos données pour les conférences et documents, et XAA, qui crée les sites de mosquées, d'écoles et de commerces halal.",
    intro:
      "One Faith France est un portail islamique en français. Sur cette page, nous présentons exceptionnellement deux projets qui appartiennent au même éditeur que 1fr.fr. Par honnêteté envers nos lecteurs, nous l'indiquons dès la première ligne : il s'agit d'une promotion de nos propres services.",
    axto: {
      title: "AXTO — un espace de travail d'IA qui protège vos données",
      lead: "AXTO réunit plusieurs applications d'intelligence artificielle dans un seul compte, avec une interface disponible en français.",
      points: [
        "Clipper transforme l'enregistrement d'une conférence ou d'un prêche en courts extraits sous-titrés, directement sur votre appareil, sans envoyer la vidéo sur un serveur.",
        "AI Studio résume des notes de cours, prépare le bulletin d'une association ou explique un courrier administratif, et permet de comparer les réponses de plusieurs modèles d'IA.",
        "Privacy Vault masque, sur votre appareil, les noms, adresses et coordonnées bancaires des adhérents avant qu'une IA ne lise un document.",
        "Vous utilisez votre propre clé d'IA ; AXTO ne fait que relayer les demandes, et le mode local fait tourner l'IA sur votre ordinateur.",
      ],
      cta: "Découvrir axto.io",
    },
    xaa: {
      title: "XAA — des sites et des plateformes sur mesure",
      lead: "XAA est un studio européen de développement web ; son site est en anglais, en espagnol et en indonésien, et les demandes en français sont bienvenues.",
      points: [
        "Sites d'associations cultuelles et de mosquées : horaires, activités, annonces et adhésions.",
        "Portails d'écoles et de cours du week-end : inscriptions, paiements et espace parents.",
        "Boutiques en ligne pour les commerces halal, les librairies ou la mode pudique, et plateformes de réservation pour les agences de Hajj et d'Omra.",
        "Chaque projet avance par étapes validées et payées séparément, par PayPal, virement ou USDT ; des modèles prêts à l'emploi permettent de démarrer rapidement.",
      ],
      cta: "Découvrir xaa.es",
    },
    rule: "Un principe nous guide : un outil d'IA peut classer, résumer et traduire, mais les questions de pratique religieuse se posent à des savants qualifiés, jamais à un logiciel.",
    closing:
      "Le contenu de One Faith France — Coran, hadiths, livres et histoires — reste indépendant : rien n'y a été écrit ni modifié en raison d'AXTO ou de XAA. Si ces outils servent votre association ou votre activité, tant mieux.",
  },
};
