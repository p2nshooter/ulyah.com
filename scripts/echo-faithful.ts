/**
 * When is "the translator gave the text back unchanged" the RIGHT answer?
 *
 * Almost never — and this file is deliberately strict about the almost.
 *
 * A Spanish pass leaves the same 894 strings failing every time, always the
 * same number, because gtx returns them identical to their source and the
 * caller counts that as a failure and retries forever. Spanish therefore never
 * fills up, the queue picks it again next pass, and the twenty-two languages
 * still at 1% are never reached. Those 894 are overwhelmingly proper nouns —
 * a name is the same word in Spanish as in Indonesian, and returning it
 * unchanged is a correct translation, not a refusal.
 *
 * But accepting an echo means STORING Indonesian under a Spanish key. Get it
 * wrong and dawa.es shows Indonesian prose forever, and the reader has no way
 * to tell. Owner: "yg terbaik, dan yg paling shoheh, karena ini agama". So the
 * rules below are the conservative side of every judgement:
 *
 *  · ARABIC IS NEVER AN ECHO. Scripture that comes back unchanged has not been
 *    translated, it has been skipped — the exact failure the @@n@@ masking
 *    exists to prevent. This is the rule that matters most and it has no
 *    exceptions: any Arabic letter anywhere disqualifies the string.
 *  · NEITHER IS ANYTHING CARRYING A SENTINEL. A sentinel means scripture is
 *    embedded; if the words around it did not change, the sentence was not
 *    translated either.
 *  · ONLY A NAME OR A LABEL. Three words at most and forty characters at most.
 *    A proper noun echoes legitimately; a sentence never does.
 *  · NOTHING THAT LOOKS LIKE A SENTENCE. Terminal punctuation means prose,
 *    whatever its length.
 *
 * Everything else keeps failing and keeps being retried, which is the safe
 * direction: a string retried forever costs a little work, a wrong translation
 * stored under a religious text costs the reader their trust.
 */

/** Any Arabic letter at all — the same ranges maskProtected uses. */
const ARABIC =
  /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
/** A masked run of scripture or a protected name. */
const SENTINEL = /@@\d+@@/;
/** Full stop, question, exclamation — Latin and Arabic. */
const TERMINAL = /[.!?؟。！？]/;

const MAX_WORDS = 3;
const MAX_CHARS = 40;

/**
 * True when a translator returning `src` unchanged is a faithful answer, and
 * the value may be stored rather than retried forever.
 *
 * Deliberately answers false for anything it is not sure about.
 */
export function echoIsFaithful(src: string): boolean {
  const s = src.trim();
  if (s.length === 0 || s.length > MAX_CHARS) return false;
  // Scripture is never "the same in Spanish". Nor is a name we masked.
  if (ARABIC.test(s) || SENTINEL.test(s)) return false;
  if (TERMINAL.test(s)) return false;
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length > MAX_WORDS) return false;
  // A label made only of digits or punctuation is not a translation at all.
  if (!/\p{L}/u.test(s)) return false;
  return true;
}
