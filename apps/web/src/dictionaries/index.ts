import type { Dictionary } from "./types";
import id from "./id";
import en from "./en";
import ru from "./ru";
import de from "./de";
import fr from "./fr";
import ar from "./ar";
import zh from "./zh";
import ja from "./ja";

export type { Dictionary };

const dictionaries: Record<string, Dictionary> = { id, en, ru, de, fr, ar, zh, ja };

/** Every dictionary is fully translated (checked at build time by TS — the
 * `Dictionary` interface has no optional fields), so switching languages
 * always swaps 100% of the UI chrome consistently, never a partial mix. */
export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale] ?? dictionaries.en!;
}
