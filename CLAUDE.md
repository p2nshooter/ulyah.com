# ulyah.com and its sites — standing rules

This repository serves ulyah.com, xad.es, 1fr.fr, tilawa.de, dawa.im (`apps/web`, API in `apps/worker-api`) and the partner
sites in `sites/`. The rules below come from the owner and apply to every change.

## Storage: R2 only — never D1

Owner, 20 Oct 2026: „Catat ya baik di axto.io maupun di xaa.es, ulyah.com  xad.es 1fr.fr tilawa.de dan semua yg
membutuhkan penyimpanan, wajib ke R2, jgn pernah ke D1".

- Every record and every file of every site here is stored in **Cloudflare R2**. Never create a D1 database, never add
  a `d1_databases` binding, never add a new table, migration or query to D1, never "temporarily" use D1.
- New features store in R2 from the first commit, with the R2 Store design in `docs/R2-DATA-BLUEPRINT.md` §3 (one JSON
  object per document, create-once writes for uniqueness, compare-and-swap updates, index entries with metadata,
  append-only logs, no hot keys — R2 takes one write per second per key — and daily backups kept 35 days).
- What is still in `ulyah-db` moves out module by module (`docs/R2-DATA-BLUEPRINT.md` §5): copy with the same ids,
  check every row arrived, keep D1 read-only for 7 days, then drop the tables and finally the binding.
- Workers KV is not D1: it may hold short-lived caches and rate-limit counters only. Durable data never lives there.

## AdSense changes go first, all the way to live

Owner, 28 Oct 2026: „Ingat, selalu dahulukan sampe live dulu kode adsense, ads.txt, cuplikan adsense dan tag meta".

- An AdSense code change (any site, any repository: `sites/<domain>/site.json` + `ADSENSE.txt` here, `site.ts`/layout +
  `public/ads.txt` in the partner repositories) comes before every other task, and it is not done at the PR: merge once CI
  is green, wait for the deploy, then run `site-audit.yml` until the domain reports **OK** with the new code. Keep
  `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md` and `docs/ADSENSE-SEMUA-DOMAIN.txt` in step.
- Every report to the owner about it includes the three snippets: the loader script, the `google-adsense-account` meta tag
  and the ads.txt line (`docs/ADSENSE-BLUEPRINT.md` §1 no. 14).
