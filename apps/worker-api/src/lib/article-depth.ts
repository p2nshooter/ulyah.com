/**
 * How long an article is, and how long it takes to read.
 *
 * Both numbers used to be taken on trust, and both were wrong.
 *
 * LENGTH. The content bot asked for something "substantial" and accepted
 * whatever came back as long as it had two sections. Across axto.dev that
 * produced 32 articles with a median of 429 words, one of them 95, and AdSense
 * refused the site with "Low value content" while it carried 102 articles —
 * so the count was never the problem. A 400-word skim adds nothing a reader
 * could not get from the first search result, and enough of them pulls the
 * whole domain's rating down. Anything under MIN_WORDS is now discarded rather
 * than committed: a skipped tick costs nothing, a thin article costs the site.
 *
 * READING TIME. The prompt asked the model for `"minutes": integer 5-8` and
 * the model returned the middle of that range every single time — including on
 * a 288-word article, which is about ninety seconds. Meanwhile the hand-written
 * articles were worse: 66 of 70 overstated by three minutes or more, one
 * claiming nine for roughly 520 words. A reader who finishes a "7 min" article
 * in ninety seconds has been told something untrue by the page, and it is the
 * kind of untrue a quality rater notices. So it is measured, never declared.
 *
 * This lives apart from content-bot.ts so it can be tested on its own — the bot
 * module reaches for the network and the key pool the moment it is imported.
 */

/** Words a reader meets, counted the way they meet them. */
export function countWords(parts: readonly string[]): number {
  let n = 0;
  for (const part of parts) n += part.trim().match(/\S+/g)?.length ?? 0;
  return n;
}

/**
 * The length below which an article is not worth publishing. 900 words is
 * roughly where a piece has room to make a claim, show it, and say when it
 * does not apply.
 */
export const MIN_WORDS = 900;

/** Mirrored articles are written twice, so each language is held to its own bar. */
export const MIN_WORDS_PER_LANG = 550;

/** 200 words a minute — the usual figure for ordinary adult prose. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}
