/**
 * Carry the @@n@@ sentinels through Google Translate intact.
 *
 * The sentinels are what keep Arabic — and a collector's name — from being
 * paraphrased: maskProtected replaces each run with @@0@@, @@1@@ …, and a
 * translation is only accepted if every marker comes back. gtx does not
 * respect them. A pass warming Spanish reported:
 *
 *   Of the 2527 that failed: … 1619 lost a @@n@@ sentinel and were rejected
 *   Upstream: … gtx answered 394 of 401
 *
 * So gtx was answering nearly every batch, and two thirds of its answers were
 * being thrown away. It reads a run of "@" as punctuation and drops, spaces or
 * reorders it.
 *
 * THE FORMAT CANNOT CHANGE. The cache key is hash(mask(text).trim()) — see
 * storyKey in mt-key.mjs — so renaming the sentinel would orphan all 400,000+
 * rows already stored under it. Instead the marker is swapped for a token gtx
 * treats as an ordinary word, only for the journey, and swapped back on
 * return. What gets hashed and stored is unchanged.
 *
 * These live in their own module because warm-mt-cache.ts runs main() on
 * import; a test cannot pull one function out of it without starting a warm
 * pass against the live database.
 */

/** Outbound: @@3@@ → XQZ3ZQX. Letters only, so MT treats it as a word. */
export function toGtxTokens(text: string): string {
  return text.replace(/@@(\d+)@@/g, (_m, n: string) => `XQZ${n}ZQX`);
}

/**
 * Inbound: XQZ3ZQX → @@3@@.
 *
 * Forgiving of the two things MT actually does to a token like this —
 * inserting spaces between the letters, and changing their case. NOT forgiving
 * about the digits: those decide which Arabic run goes back where, so a token
 * whose number was altered stays altered and is caught by the caller's count
 * check. Guessing there would put the wrong verse in the wrong sentence.
 */
export function fromGtxTokens(text: string): string {
  return text.replace(/X\s*Q\s*Z\s*(\d+)\s*Z\s*Q\s*X/gi, (_m, n: string) => `@@${n}@@`);
}
