/* Ecosystem page copy for xad.es — English — written for this site only (lib/ecosystem.ts). */
import type { EcoCopy } from "./types";

export const XAD: Record<string, EcoCopy> = {
  en: {
    menu: "✦ AXTO & XAA",
    eyebrow: "Our own promotion",
    title: "Tools for teachers, mosques and Muslim-run businesses — AXTO & XAA",
    description:
      "Meet AXTO, a private AI workspace for khutbah recordings, class notes and paperwork, and XAA, which builds websites for mosques, Islamic schools and halal businesses.",
    intro:
      "XAD exists to help you explore the Qur'an, Hadith and Tafsir in English, one ayah a day. This page steps aside from that for a moment to introduce two projects run by the same publisher as XAD — so, in fairness to you, it is our own promotion.",
    axto: {
      title: "AXTO — an AI workspace that keeps your data yours",
      lead: "AXTO brings several artificial-intelligence tools together under one account.",
      points: [
        "Clipper turns a long Friday khutbah or study-circle recording into short, captioned clips — on your own device, without uploading the video anywhere.",
        "AI Studio summarises class notes, drafts a newsletter for your community or explains a long letter, and lets you compare answers from several AI models side by side.",
        "Privacy Vault removes names, addresses and account numbers from documents on your device before any AI reads them — useful for school registers and donor lists.",
        "You use your own AI key and AXTO only relays requests; Local Mode runs the AI entirely on your computer.",
      ],
      cta: "Visit axto.io",
    },
    xaa: {
      title: "XAA — websites and platforms built to order",
      lead: "XAA is a European web development studio working with clients worldwide.",
      points: [
        "Mosque websites with prayer and event information, volunteer sign-ups and clear announcements.",
        "Islamic school and weekend-madrasa portals with enrolment, fees and a parents' area.",
        "Online shops for halal food, modest fashion or books, and booking platforms for Hajj and Umrah operators.",
        "Every project runs in milestones, each agreed, delivered and paid for separately by PayPal, bank transfer or USDT; ready-made templates help small budgets start quickly.",
      ],
      cta: "Visit xaa.es",
    },
    rule: "One principle we hold to: an AI tool may organise, summarise and translate, but questions of religious practice belong with qualified scholars you trust, never with software.",
    closing:
      "XAD's Qur'an, Hadith and Tafsir content remains independent, and nothing on it was written or changed because of AXTO or XAA. If either tool serves your teaching, your community or your livelihood, we are glad.",
  },
};
