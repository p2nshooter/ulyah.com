import { BANK, BANK_ACCOUNTS, WALLETS } from "@/lib/donation-accounts";
import { TENANT } from "@/lib/tenant";

/**
 * The /donasi receiving details as JSON — the same public information the page shows, for the owner's other
 * sites to import (axto.io Admin → Payments → "Import company accounts"). Nothing here is a secret: these are
 * the accounts and addresses people send donations to. Served by the ulyah.com build only.
 */
export const dynamic = "force-static";

export function GET() {
  if (TENANT.id !== "ulyah") return new Response("Not found", { status: 404 });
  return Response.json(
    { source: "https://ulyah.com/donasi", bank: BANK, accounts: BANK_ACCOUNTS.map((a) => ({ currency: a.ccy, number: a.number })), wallets: WALLETS.map((w) => ({ id: w.id, symbol: w.symbol, network: w.network, address: w.address })) },
    { headers: { "cache-control": "public, max-age=3600", "x-robots-tag": "noindex" } },
  );
}
