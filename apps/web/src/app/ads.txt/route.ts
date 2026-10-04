import { AD_CLIENT_ID } from "@/lib/ad-config";

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
 */
export function GET() {
  const publisher = AD_CLIENT_ID.replace(/^ca-/, "");
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
