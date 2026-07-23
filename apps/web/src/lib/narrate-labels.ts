import { fillLabels } from "./fill-labels";
/**
 * Native listen/stop labels for the browser narration ("suara") buttons, so a
 * sibling site never shows an Indonesian "Dengarkan" on a French or German
 * page. English is the fallback, never Indonesian.
 */
export interface NarrateLabels {
  listen: string;
  stop: string;
}

const L: Record<string, NarrateLabels> = {
  id: { listen: "🔊 Dengarkan", stop: "⏹ Berhenti" },
  en: { listen: "🔊 Listen", stop: "⏹ Stop" },
  fr: { listen: "🔊 Écouter", stop: "⏹ Arrêter" },
  de: { listen: "🔊 Anhören", stop: "⏹ Stopp" },
  es: { listen: "🔊 Escuchar", stop: "⏹ Detener" },
  ar: { listen: "🔊 استماع", stop: "⏹ إيقاف" },
};

export function narrateLabels(locale: string): NarrateLabels {
  return L[locale] ?? fillLabels(locale, L.en!);
}
