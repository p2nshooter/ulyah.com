// Byte-exact replica of the Worker's cache-key derivation.
// Source of truth: apps/worker-api/src/lib/mt.ts (hashKey, maskProtected,
// localizeBatch). If any of this drifts, translations are written under keys
// nobody looks up and the work is silently wasted.

export function hashKey(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

const PROTECTED_TERMS = [
  "Abu Dawud", "Ibnu Majah", "Ibn Majah", "An-Nasa'i", "Ad-Darimi",
  "Bukhari", "Muslim", "Tirmidzi", "Tirmidhi", "Nasa'i", "Nasai",
  "Ahmad", "Malik", "Darimi", "Baihaqi", "Hakim", "Thabrani", "no.", "No.",
];
const PROTECT_RE = new RegExp(
  `(${PROTECTED_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "gi"
);

/**
 * Any run of Arabic script. Masked first, and never translated — see the note
 * on ARABIC_RUN in apps/worker-api/src/lib/mt.ts for the 232 rows where the
 * matn of a hadith had been replaced with a Spanish pious phrase.
 */
const ARABIC_RUN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:[\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])?/g;

export function maskProtected(text) {
  const map = [];
  // Arabic first, exactly as the Worker does: a run may contain a word the
  // term list also matches, and the script must win.
  const withArabic = text.replace(ARABIC_RUN, (m) => {
    const i = map.length;
    map.push(m);
    return `@@${i}@@`;
  });
  const masked = withArabic.replace(PROTECT_RE, (m) => {
    const i = map.length;
    map.push(m);
    return `@@${i}@@`;
  });
  return { masked, map };
}

/**
 * The key the Worker will look up for one piece of story text.
 *
 * Order matters and is not obvious: localizeBatchProtected masks FIRST, then
 * hands the masked string to localizeBatch, which trims and hashes. So the key
 * is hash(mask(text).trim()) — hashing the raw text would miss every entry
 * containing "Bukhari", "Muslim" or "no.".
 */
export function storyKey(text, target, source = "en") {
  const { masked } = maskProtected(text);
  return `mt:${source}-${target}:${hashKey(masked.trim())}`;
}

/** How the API splits a story body before translating it. */
export function paragraphsOf(body) {
  return body.split(/\n\s*\n/);
}

/** The Worker file this replicates. The check script diffs against it. */
export const SOURCE_OF_TRUTH = "apps/worker-api/src/lib/mt.ts";
