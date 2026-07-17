# One Faith France — 1fr.fr

**Le Portail Islamique en Français** · Français (défaut) · English · العربية

This branch (`onefaith-1fr`) is the standalone home of https://1fr.fr — it lives beside ulyah.com only for hosting convenience and exports to its own repository unchanged at hand-over time — deliberately
separated from ulyah.com so the property can change hands cleanly:

- **Deploys only itself**: the workflow builds the web app with
  `NEXT_PUBLIC_TENANT=1fr` and deploys the `onefaith-web` Cloudflare Worker
  with the `1fr.fr` / `www.1fr.fr` custom domains. It never touches
  ulyah.com workers, databases, or DNS.
- **Content**: served read-only from the shared content API
  (`https://api.ulyah.com`) for now; the content itself can be part of an
  acquisition discussion.
- **No ads. Donation-forward. Openly for sale.**

## Acquisition

The site is offered for acquisition — **minimum offer: US$20,000**.
Contact: **salam@1fr.fr**. The buyer receives the 1fr.fr domain, the
business e-mail, full control of the 24/7 live streams, the admin portal
(every page dynamic: show/hide/edit), and the separate donor portal with
donor certificates. Read-only demo logins are available on request.

## Development

```bash
pnpm install
cd apps/web && NEXT_PUBLIC_TENANT=1fr pnpm dev
```

Required GitHub Secrets for deploy: `CLOUDFLARE_API_TOKEN` (Workers
Scripts:Edit + 1fr.fr zone), `CLOUDFLARE_ACCOUNT_ID`.
