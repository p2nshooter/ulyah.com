# R2 lifecycle rules — how R2 stays under 10 GB

Owner, 12 Oct 2026: "turunkan R2-nya hingga di bawah 10 GB" (it stood at
121.63 GB: ulyah-media 91.06 GB, ulyah-next-cache 30.57 GB). Cloudflare's free
R2 tier is 10 GB-month; everything above it is billed.

The deploy (`.github/workflows/deploy.yml`, step "R2 lifecycle rules") sets each
file here as the COMPLETE rule set of the bucket it is named after
(`wrangler r2 bucket lifecycle set`). R2 then deletes matching objects by
itself, asynchronously (usually within a day), at no cost and with no Worker,
list or D1 involved. The nightly D1 maintenance prints `r2 bucket info` and the
active rules, so the effect is visible in its log.

| Bucket | Prefix | After | What it is, and why it may go |
|---|---|---|---|
| ulyah-media | `audio/story/` | 1 day | Text-to-speech audiobooks (eSpeak/Piper, ~26 MB each) generated daily for thousands of machine-compiled sessions — ~91 GB. Derived data: regenerable from the text, and the reader already narrates every article in the visitor's browser (`StoryReader`, Web Speech), in every language, for 0 bytes. |
| ulyah-media | `audio/qori/`, `audio/qori2/` | 1 day | Murottal copies. Recitation is played from the reciters' own CDNs (`apps/web/src/lib/qori-cdn.ts`); `/audio/qori2/…` only redirects there. |
| ulyah-media | (all) | 1 day | Incomplete multipart uploads only — never a finished object. |
| ulyah-next-cache | (all) | 1 day (was 2 days until 7 Nov 2026) | OpenNext's rendered-page cache. Keys are `inc-<site>/<buildId>/…`, and every deploy starts a new buildId, so entries of old builds were never read again and never deleted (509 deploys). A page still in use is re-written on each revalidation and never reaches 2 days; a cold one is simply rendered again. |

| axto-us-opennext-cache | (all) | 1 day | The old OpenNext page cache of axto.us. axto.us has been a static site (Workers Static Assets, `sites/_engine` in the axto.us repository) since its rebuild (#26), so nothing reads or writes this bucket any more; the rule empties it and keeps it empty. |

**7 Nov 2026 (owner):** „Tolong di cek juga, chache apa yg situs islami yg menjadikan R2 lebih dr 10Gb...jika di
bersihkan tidak berpengaruh sama sekali, bersihkan saja, agar R2 di bawah 5gb“. Measured that morning by the nightly
maintenance: ulyah-next-cache 6.28 GB (33,526 objects) — rendered pages of the last two days of builds, each deploy
starting a fresh `inc-<site>/<buildId>/` set that crawlers fill again — and ulyah-media 264 MB. The page cache is the
part that can go without any effect: a deleted entry is rendered again on the next visit, and a page that is visited is
re-written on revalidation, so it never ages out while it is in use. The rule therefore drops to 1 day, the shortest R2
allows, and the orphaned axto.us cache is emptied. `.github/workflows/r2-report.yml` reports every bucket of the account
(size, objects, rules, top prefixes) so the remaining buckets (ulyah-build, axto-build, …) are decided from numbers.

Everything else in ulyah-media — kitab files, story PDFs, kids' audio recorded
in the admin, uploaded media, story bodies and translations spilled from D1 —
matches no rule and is never touched.
