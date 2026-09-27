/**
 * What an upload answers while R2 is not enabled on the account.
 *
 * A 503, not a 500, and said in words: nothing is wrong with the request, the
 * storage behind it is switched off at the Cloudflare account (R2 needs a
 * payment method on file even inside its free tier). The check runs BEFORE the
 * D1 row is written, so no row ever points at a file that was never stored.
 */
export const R2_OFF_MESSAGE =
  "File storage (R2) is not enabled on the Cloudflare account — uploads cannot be saved until it is switched back on.";
