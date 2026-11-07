import { AD_ACCOUNTS } from "@/lib/ad-config";

/**
 * https://<site>/ads.txt — built from the same constant as the loader script,
 * the meta tag and the units, so each site authorises exactly the account it
 * serves.
 *
 * It used to be one static file in public/, and public/ is shared by every
 * tenant build: one publisher line on all five sites. xad.es moving to its own
 * AdSense account (lib/ad-config.ts) made that wrong — its ads.txt has to name
 * ITS account, and AdSense checks exactly this file during verification.
 *
 * f08c47fec0942fa0 is Google's certification authority id, the same for every
 * AdSense publisher.
 *
 * Since 7 Nov 2026 one line per stacked account (AD_ACCOUNTS), the primary first.
 */
export function GET() {
  const lines = AD_ACCOUNTS.map((account) => `google.com, ${account.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0`);
  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
