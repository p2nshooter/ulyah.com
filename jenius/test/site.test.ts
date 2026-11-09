/* Situs jenius.es di dalam proses (R2 tiruan + sumber buku tiruan): AdSense, SEO, halaman ID/EN, pembaca, API bab,
 * artikel, alat, cadangan. Run: npm test */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import { ADSENSE_CLIENT, ADSENSE_STACK, ADSENSE_ACCOUNTS, ADS_TXT } from '../src/lib/adsense.ts';
import { renderMarkdown } from '../src/lib/markdown.ts';
import { P, PAGES, bookPath, readPath, articlePath, toolPath, lanePath } from '../src/lib/i18n.ts';
import { ARTICLES, CLUSTERS } from '../src/content/articles.ts';
import { TOOLS } from '../src/pages/tools.ts';
import { LANES } from '../src/catalog/lanes.ts';
import { coverSvg } from '../src/pages/catalog.ts';
import { SE_SOURCES, BOOKDASH_SOURCES, sourceId } from '../src/catalog/sources.ts';
import { runImport } from '../src/catalog/importer.ts';
import { runBackup } from '../src/backup.ts';
import { app, refreshSummary } from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import type { Env } from '../src/env.ts';

const fx = (f: string) => fs.readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8');
const stackFile = JSON.parse(fs.readFileSync(new URL('../../adsense-stack.json', import.meta.url), 'utf8')) as { primary: Record<string, string>; stack: string[] };

const data = new FakeR2();
const backups = new FakeR2();
const env = { DATA: data, BACKUPS: backups, CANONICAL_HOST: 'jenius.es', SOURCE_BASE: 'https://src.test' } as unknown as Env;
const get = (path: string, headers: Record<string, string> = {}) => app.fetch(new Request(`https://jenius.es${path}`, { headers }), env);
const page = async (path: string, headers: Record<string, string> = {}) => {
  const r = await get(path, headers);
  return { status: r.status, body: await r.text(), r };
};

const ALICE = SE_SOURCES.find((s) => s.repo.startsWith('lewis-carroll_alices'))!;
const SLOTH = BOOKDASH_SOURCES.find((s) => s.slug === 'sleepy-mr-sloth')!;

before(async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const u = String(input instanceof Request ? input.url : input);
    if (!u.startsWith('https://src.test/')) return realFetch(input);
    if (u.endsWith('/_data/meta.yml')) return new Response(fx('bookdash-meta.yml'));
    if (u.endsWith('/sleepy-mr-sloth/en/index.md')) return new Response(fx('sloth.md'));
    if (/\/images\/[\w.-]+$/.test(u)) return new Response(new Uint8Array([0xff, 0xd8, 0xff]), { headers: { 'content-type': 'image/jpeg' } });
    if (u.endsWith('/content.opf')) return new Response(fx('alice.opf'));
    if (u.endsWith('/toc.xhtml')) return new Response(fx('alice-toc.xhtml'));
    if (/\/text\/chapter-\d+\.xhtml$/.test(u)) return new Response(fx('alice-ch1.xhtml'));
    return new Response('not found', { status: 404 });
  }) as typeof fetch;
  // Book Dash: satu langkah; Standard Ebooks: bab demi bab sampai selesai.
  await runImport(env, { sources: [SLOTH] });
  for (let i = 0; i < 5; i += 1) await runImport(env, { sources: [ALICE] });
  await refreshSummary(new Store(env.DATA as never));
});

test('AdSense: akun utama + tumpukan sama dengan adsense-stack.json; ads.txt satu baris per akun', () => {
  assert.equal(ADSENSE_CLIENT, stackFile.primary['jenius.es']);
  assert.deepEqual(ADSENSE_STACK, stackFile.stack);
  assert.equal(ADSENSE_ACCOUNTS[0], ADSENSE_CLIENT);
  assert.equal(ADS_TXT.trim().split('\n').length, ADSENSE_ACCOUNTS.length);
  assert.ok(ADS_TXT.startsWith(`google.com, ${ADSENSE_CLIENT.slice(3)}, DIRECT, f08c47fec0942fa0`));
});

test('ads.txt, robots.txt (tidak memblokir crawler Google), sitemap dengan hreflang', async () => {
  assert.equal((await page('/ads.txt')).body, ADS_TXT);
  const robots = (await page('/robots.txt')).body;
  assert.ok(!/^Disallow: \/$/m.test(robots), 'robots tidak menutup situs');
  for (const g of ['Mediapartners-Google', 'Googlebot', 'Google-Extended', 'GoogleOther', 'Google-CloudVertexBot', 'Google-Agent', 'Google-GeminiNotebook', 'Google-NotebookLM', 'AdsBot-Google']) {
    assert.ok(robots.includes(`User-agent: ${g}\nAllow: /\n`), `${g} dibuka penuh`);
  }
  assert.match(robots, /Sitemap: https:\/\/jenius\.es\/sitemap\.xml/);
  const sm = (await page('/sitemap.xml')).body;
  for (const k of Object.keys(PAGES) as (keyof typeof PAGES)[]) assert.ok(sm.includes(`<loc>https://jenius.es${PAGES[k][0]}</loc>`) && sm.includes(`<loc>https://jenius.es${PAGES[k][1]}</loc>`));
  assert.ok(sm.includes(`https://jenius.es${bookPath('id', sourceId(ALICE))}`));
  assert.ok(sm.includes(`https://jenius.es${articlePath('en', ARTICLES[0]!.slug)}`));
  assert.ok(sm.includes('hreflang="en"'));
});

const metasOk = (body: string) => ADSENSE_ACCOUNTS.every((a) => body.includes(`<meta name="google-adsense-account" content="${a}">`));
const loaders = (body: string) => (body.match(/adsbygoogle\.js\?client=/g) ?? []).length;

test('beranda ID & EN: tag meta semua akun, tepat satu loader, kanonik & hreflang, JSON-LD', async () => {
  for (const [path, lang] of [['/', 'id'], ['/en', 'en']] as const) {
    const { status, body } = await page(path, { 'user-agent': 'Googlebot' });
    assert.equal(status, 200);
    assert.ok(body.includes(`<html lang="${lang}"`));
    assert.ok(metasOk(body), `meta ${path}`);
    assert.equal(loaders(body), 1, `loader ${path}`);
    assert.ok(body.includes(`adsbygoogle.js?client=${ADSENSE_CLIENT}`));
    assert.ok(body.includes(`<link rel="canonical" href="https://jenius.es${path}">`));
    assert.ok(body.includes('hreflang="en"') && body.includes('hreflang="id"'));
    assert.ok(body.includes('application/ld+json'));
    assert.ok(!/noindex/.test(body), 'halaman publik diindeks');
  }
});

test('beranda: pengunjung luar negeri ke /en, crawler & cookie bahasa tidak dialihkan', async () => {
  const r = await get('/', { 'cf-ipcountry': 'DE', 'user-agent': 'Mozilla/5.0' });
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/en');
  assert.equal((await get('/', { 'cf-ipcountry': 'DE', 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' })).status, 200);
  assert.equal((await get('/', { 'cf-ipcountry': 'DE', cookie: 'jl=id' })).status, 200);
  assert.equal((await get('/', { 'cf-ipcountry': 'ID' })).status, 200);
});

test('jalur: 8 jalur ID/EN; jalur anak tanpa loader iklan tetapi tetap ada tag meta', async () => {
  assert.equal(LANES.length, 8);
  for (const l of LANES) {
    for (const L of ['id', 'en'] as const) {
      const { status, body } = await page(lanePath(L, l.slug));
      assert.equal(status, 200, lanePath(L, l.slug));
      assert.ok(metasOk(body));
      assert.equal(loaders(body), l.kids ? 0 : 1, `${l.id} kids=${l.kids}`);
    }
  }
  const tunas = (await page(lanePath('id', LANES.find((l) => l.id === 'tunas')!.slug))).body;
  assert.ok(tunas.includes(bookPath('id', sourceId(SLOTH))), 'buku bergambar tampil di Tunas');
});

test('buku: halaman buku + atribusi lisensi; pembaca tanpa iklan; API bab dibagi per halaman', async () => {
  const id = sourceId(ALICE);
  const b = await page(bookPath('id', id));
  assert.equal(b.status, 200);
  assert.ok(b.body.includes('Alice’s Adventures in Wonderland'));
  assert.ok(b.body.includes('data-resume-link'));
  assert.ok(/CC0|domain publik/i.test(b.body));
  const r = await page(readPath('en', id, 1));
  assert.equal(r.status, 200);
  assert.equal(loaders(r.body), 0, 'pembaca tanpa loader iklan');
  assert.ok(r.body.includes('data-reader') && r.body.includes('/assets/reader.js?v='));
  assert.ok(r.body.includes('id="reader-data"'));
  const api = await get(`/api/book/${id}/ch/1`);
  assert.equal(api.status, 200);
  const j = (await api.json()) as { pages: { t: string; text?: string }[][] };
  assert.ok(j.pages.length >= 2, 'bab dibagi menjadi beberapa halaman');
  assert.ok(j.pages.every((p) => p.length > 0));
  assert.equal((await get(`/api/book/${id}/ch/999`)).status, 404);
  assert.equal((await page(bookPath('id', 'tidak-ada'))).status, 404);
});

test('buku bergambar: gambar disajikan dari R2 lewat /m/, halaman anak tanpa iklan, mode slide', async () => {
  const id = sourceId(SLOTH);
  const b = await page(bookPath('en', id));
  assert.equal(b.status, 200);
  assert.equal(loaders(b.body), 0);
  assert.ok(/CC BY 4\.0/.test(b.body));
  const j = (await (await get(`/api/book/${id}/ch/1`)).json()) as { pages: { t: string; src?: string }[][] };
  const img = j.pages.flat().find((x) => x.t === 'img');
  assert.ok(img?.src?.startsWith(`/m/${id}/`));
  assert.equal((await get(img!.src!)).status, 200);
  const r = await page(readPath('id', id, 1));
  assert.ok(r.body.includes('is-picture'));
  const svg = await get(`/cover/${id}.svg`);
  assert.equal(svg.headers.get('content-type'), 'image/svg+xml; charset=utf-8');
});

test('artikel: dua bahasa lengkap, slug unik, daftar isi, JSON-LD, loader iklan', async () => {
  const slugs = new Set<string>();
  for (const a of ARTICLES) {
    assert.ok(CLUSTERS[a.cluster], a.key);
    for (const L of ['id', 'en'] as const) {
      const s = a.slug[L === 'id' ? 0 : 1];
      assert.ok(!slugs.has(`${L}:${s}`), `slug ganda ${s}`);
      slugs.add(`${L}:${s}`);
      const md = renderMarkdown(L === 'id' ? a.body.id : a.body.en);
      assert.ok(md.words >= 550, `${a.key} ${L}: ${md.words} kata`);
      assert.ok(md.toc.length >= 3, `${a.key} ${L}: daftar isi`);
    }
    const { status, body } = await page(articlePath('en', a.slug));
    assert.equal(status, 200);
    assert.equal(loaders(body), 1);
    assert.ok(body.includes('"@type":"Article"'));
    assert.ok(body.includes('data-listen-article'));
  }
  const idx = await page(`${P('id', 'articles')}?topik=belajar`);
  assert.equal(idx.status, 200);
});

test('alat & halaman wajib: semua ID/EN berstatus 200 dengan judul dan deskripsi', async () => {
  const paths = [...TOOLS.flatMap((t) => [toolPath('id', t.slug), toolPath('en', t.slug)]), ...(Object.keys(PAGES) as (keyof typeof PAGES)[]).flatMap((k) => PAGES[k])];
  for (const p of paths) {
    const { status, body } = await page(p);
    assert.equal(status, 200, p);
    assert.match(body, /<title>[^<]{8,}<\/title>/, p);
    assert.match(body, /<meta name="description" content="[^"]{30,}">/, p);
    assert.ok(metasOk(body), p);
  }
  const pick = await page(toolPath('id', TOOLS.find((t) => t.key === 'plan')!.slug));
  assert.ok(pick.body.includes('id="plan-books"'));
});

test('teks kontak & halaman guru tidak menautkan ke pendaftaran yang belum ada; tidak ada nama mesin AI', async () => {
  const g = (await page(P('id', 'teachers'))).body;
  assert.ok(!g.includes('/daftar?sebagai=guru'));
  for (const p of ['/', '/en', P('id', 'about'), P('en', 'privacy'), P('id', 'guide')]) {
    const body = (await page(p, { 'user-agent': 'Googlebot' })).body;
    assert.ok(!/\b(Haiku|Sonnet|Opus|Fable|Claude|Anthropic)\b/.test(body), `nama mesin bocor di ${p}`);
  }
});

test('PWA: manifest & service worker', async () => {
  const m = (await (await get('/manifest.webmanifest')).json()) as { icons: unknown[]; display: string };
  assert.equal(m.display, 'standalone');
  assert.ok(m.icons.length >= 2);
  const sw = await page('/sw.js');
  assert.match(sw.body, /caches\.open/);
});

test('halaman tidak ada → 404 noindex; workers.dev dialihkan ke domain kanonik', async () => {
  const nf = await page('/tidak-ada-halaman');
  assert.equal(nf.status, 404);
  assert.ok(nf.body.includes('noindex'));
  const r = await app.fetch(new Request('https://jenius-es.axto.workers.dev/en/articles'), env);
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), 'https://jenius.es/en/articles');
});

test('sampul SVG: judul di-escape', () => {
  const svg = coverSvg({ id: 'x', title: 'A <b> & "c"', author: 'Z', lanes: ['santai'] } as never);
  assert.ok(svg.startsWith('<svg') && !svg.includes('<b>') && svg.includes('&amp;'));
});

test('cadangan harian: akun & dokumen sistem disalin, isi buku tidak; bertahap', async () => {
  await new Store(env.DATA as never).put('u/contoh.json', { a: 1 });
  const r1 = await runBackup(env, Date.now() + 1000);
  assert.ok(r1.ok, r1.error);
  const keys = [...backups.m.keys()];
  assert.ok(keys.some((k) => k.endsWith('/u/contoh.json')));
  assert.ok(keys.some((k) => k.endsWith('/k/lanes.json')));
  assert.ok(!keys.some((k) => /\/(b|m|q)\//.test(k)), 'isi buku tidak dicadangkan');
  const r2 = await runBackup(env, Date.now() + 2000);
  assert.equal(r2.copied, 0, 'tidak ada yang berubah');
});

test('perayap: setiap tautan internal dari beranda ID & EN bisa dibuka (tanpa 404)', async () => {
  const seen = new Set<string>();
  const queue = ['/', '/en'];
  const broken: string[] = [];
  while (queue.length && seen.size < 600) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    seen.add(path);
    const r = await get(path, { 'user-agent': 'Googlebot' });
    if (r.status >= 400) { broken.push(`${path} → ${r.status}`); continue; }
    if (!(r.headers.get('content-type') ?? '').includes('text/html')) continue;
    const body = await r.text();
    for (const m of body.matchAll(/href="(\/[^"#]*)"/g)) {
      const href = m[1]!.replace(/&amp;/g, '&');
      if (/^\/(assets|api|m|cover)\//.test(href) || href === '/manifest.webmanifest') continue;
      if (!seen.has(href)) queue.push(href);
    }
  }
  assert.deepEqual(broken, []);
  assert.ok(seen.size > 60, `${seen.size} halaman dirayapi`);
});

test('ops tick: kunci sekali pakai (hash di R2), salah/kedaluwarsa ditolak; langkah latar sekali per menit', async () => {
  const { sha256Hex } = await import('../src/lib/crypto.ts');
  const { lazyTick } = await import('../src/ops.ts');
  const store = new Store(env.DATA as never);
  const key = 'k'.repeat(10) + crypto.randomUUID().replace(/-/g, '');
  const post = (k: string) => app.fetch(new Request('https://jenius.es/api/ops/tick', { method: 'POST', headers: { 'x-ops-key': k } }), env);
  assert.equal((await post(key)).status, 403, 'tanpa hash di R2');
  await store.put('k/ops.json', { hash: await sha256Hex(key), at: Date.now() });
  assert.equal((await post('salah'.repeat(10))).status, 403, 'kunci salah');
  const ok = await post(key);
  assert.equal(ok.status, 200);
  const j = (await ok.json()) as { import: { total: number } };
  assert.ok(j.import.total > 0);
  assert.ok(await store.get('k/tick.json'), 'langkah latar ditahan selama workflow bekerja');
  await store.put('k/ops.json', { hash: await sha256Hex(key), at: Date.now() - 7 * 3600_000 });
  assert.equal((await post(key)).status, 403, 'kunci kedaluwarsa');
  // Langkah latar: klaim CAS, tidak dua kali dalam satu menit.
  const t0 = Date.now() + 120_000;
  const first = await lazyTick(env, async () => null, t0);
  assert.ok(first, 'langkah pertama berjalan');
  assert.equal(await lazyTick(env, async () => null, t0 + 70_000 - 69_000), null, 'kurang dari semenit: dilewati');
});
