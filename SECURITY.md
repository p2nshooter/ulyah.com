# Security Policy

This repository runs a five-site ecosystem from one codebase:

| site | language |
|---|---|
| [ulyah.com](https://ulyah.com) | Indonesian |
| [1fr.fr](https://1fr.fr) | French |
| [tilawa.de](https://tilawa.de) | German |
| [dawa.es](https://dawa.es) | Spanish |
| [xad.es](https://xad.es) | English |

They share a Cloudflare Worker, one D1 database and one R2 bucket, so a flaw
found on one site is almost always a flaw on all five. Please treat a report as
covering the whole ecosystem.

## Reporting a vulnerability

**Please do not open a public issue for a security problem.** An issue is
visible to everyone the moment it is filed, including to whoever would exploit
it.

Two private routes:

1. **GitHub private vulnerability reporting** — the *Report a vulnerability*
   button under this repository's **Security** tab. This is preferred: it keeps
   the report, the discussion and the fix in one place.
2. **Email** — [salam@ulyah.com](mailto:salam@ulyah.com), the same address the
   sites publish for contact.

What helps most, in rough order of usefulness:

- which site and URL, and roughly when you saw it;
- what an attacker gets out of it — read someone else's data, change content,
  reach the admin, run code;
- the smallest set of steps that reproduces it;
- anything you already know about the cause.

A proof of concept is welcome. Please keep it to your own account and your own
data — see below.

## What we ask of you while you look

This is a religious-content site read by people who are not technical. So:

- **Do not touch other people's data.** Reading, changing or deleting content,
  donations records or reader data that is not yours is not testing, and we
  will treat it as an intrusion.
- **Do not alter religious content.** The Qur'an, hadith, tafsir and kitab text
  served here is read as scripture. A demonstration that edits it does harm
  that outlives the bug.
- **Do not run load or denial-of-service tests.** The whole ecosystem sits on
  Cloudflare's free tier; a load test takes all five sites down for everyone.
- **Do not use automated scanners against the live sites.** They find little
  here and cost the sites their request budget. Test against your own checkout.

Work inside those lines and we will not pursue anything against you for a
good-faith report.

## What happens next

This is a small project, not a company with a security desk — so rather than
promise a response time we cannot keep, here is what actually happens: reports
are read by the owner, and you will get an acknowledgement as soon as it is
seen. Confirmed issues are fixed on a branch, put through CI, and deployed;
we will tell you when the fix is live.

If you would like to be credited, say so in the report and give us the name or
handle you want used. If you would rather not be named, that is fine too.

## Scope

**In scope** — anything served from the five domains above, and this
repository: the Next.js apps, the Cloudflare Worker API, the D1 schema and
migrations, and the GitHub Actions workflows.

**Out of scope**, because they are not ours to fix:

- third-party services the sites read from — Cloudflare, Google AdSense, the
  hadith and Qur'an APIs, the murottal CDNs;
- findings that only say a header or hardening flag is missing, without a
  concrete way to exploit it;
- vulnerabilities in dependencies with no path to exploit them here (those are
  handled by Dependabot — see `.github/dependabot.yml`);
- reports produced entirely by a scanner, with no evidence the issue is real on
  this site.

## What is already in place

- **CodeQL** runs on every pull request into `main` and weekly
  (`.github/workflows/codeql.yml`).
- **Secret scanning** is enabled on this repository.
- **Dependabot** proposes dependency updates weekly, grouped so security fixes
  are never held up behind routine bumps.
- **No secrets in the repository.** API tokens, the AI key pool's encryption
  secret and Cloudflare credentials live in GitHub Secrets and Cloudflare's own
  secret store; the AI keys themselves are stored encrypted in D1.
