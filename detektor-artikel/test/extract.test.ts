import test from 'node:test';
import assert from 'node:assert/strict';
import { checkUrl, robotsAllows, htmlToArticle, parseSitemap, fetchArticle, collectSitemap, InputUrlError, isProtectedHost } from '../src/lib/extract.ts';

const code = (fn: () => unknown) => { try { fn(); return 'ok'; } catch (e) { return (e as InputUrlError).code; } };

test('URL: hanya http/https publik; SSRF ditolak', () => {
  assert.equal(checkUrl('https://contoh.id/artikel#bagian').toString(), 'https://contoh.id/artikel');
  for (const bad of ['ftp://contoh.id/a', 'file:///etc/passwd', 'javascript:alert(1)', 'https://user:pw@contoh.id/', 'nonsense']) assert.equal(code(() => checkUrl(bad)), 'bad_url', bad);
  for (const bad of ['http://127.0.0.1/', 'http://2130706433/', 'http://0x7f000001/', 'http://0177.0.0.1/', 'http://10.1.2.3/', 'http://192.168.1.1/', 'http://172.20.0.1/',
    'http://169.254.169.254/latest/meta-data', 'http://[::1]/', 'http://[fd00::1]/', 'http://[::ffff:127.0.0.1]/', 'http://localhost/', 'http://printer.local/',
    'http://metadata.google.internal/', 'http://intranet/', 'https://contoh.id:8080/', 'http://100.64.0.1/']) assert.equal(code(() => checkUrl(bad)), 'blocked_host', bad);
  assert.equal(code(() => checkUrl('https://0xabc.com/')), 'ok', 'domain yang kebetulan diawali 0x tetap boleh');
});

test('situs yang dilindungi pemilik ditolak (domain & subdomain, pengalihan, sitemap)', async () => {
  const code = (f: () => unknown) => { try { f(); return 'ok'; } catch (e) { return (e as InputUrlError).code; } };
  for (const bad of ['https://axto.io/', 'https://www.xscan.es/artikel', 'http://ascan.es', 'https://app.xaa.es/x', 'https://ulyah.com/blog/a',
    'https://1fr.fr/', 'https://TILAWA.DE/', 'https://dawa.im/a', 'https://xad.es./', 'https://a.b.ulyah.com/']) assert.equal(code(() => checkUrl(bad)), 'protected', bad);
  for (const good of ['https://notxscan.es/', 'https://xscan.es.example.com/', 'https://axto.iox.com/', 'https://kompas.com/']) assert.equal(code(() => checkUrl(good)), 'ok', good);
  const hop = fake({ 'https://pendek.id/a': { status: 301, location: 'https://www.ulyah.com/x' } });
  await assert.rejects(fetchArticle('https://pendek.id/a', hop.f), (e: InputUrlError) => e.code === 'protected', 'pengalihan ke situs dilindungi ditolak');
  assert.ok(!hop.seen.some((u) => isProtectedHost(new URL(u).hostname)), 'situs dilindungi tidak pernah dihubungi');
  const sm = fake({ 'https://berita.id/sitemap.xml': { type: 'application/xml', body: '<urlset><url><loc>https://berita.id/a</loc></url><url><loc>https://xad.es/b</loc></url></urlset>' } });
  const r = await collectSitemap('https://berita.id/sitemap.xml', 50, sm.f);
  assert.deepEqual(r.urls, ['https://berita.id/a']);
  assert.equal(r.skipped, 1);
  await assert.rejects(collectSitemap('https://xaa.es/sitemap.xml', 50, sm.f), (e: InputUrlError) => e.code === 'protected');
});

test('robots.txt: aturan terpanjang menang, grup agen khusus didahulukan', () => {
  const r = 'User-agent: *\nDisallow: /privat/\nAllow: /privat/umum\n\nUser-agent: BadBot\nDisallow: /\n';
  assert.equal(robotsAllows(r, '/artikel/a'), true);
  assert.equal(robotsAllows(r, '/privat/x'), false);
  assert.equal(robotsAllows(r, '/privat/umum/x'), true);
  assert.equal(robotsAllows('User-agent: xscanbot\nDisallow: /\n\nUser-agent: *\nAllow: /', '/a'), false, 'grup untuk agen kami');
  assert.equal(robotsAllows('User-agent: *\nDisallow:', '/a'), true, 'Disallow kosong = boleh');
  assert.equal(robotsAllows('User-agent: *\nDisallow: /*.pdf$', '/b.pdf'), false);
  assert.equal(robotsAllows('', '/a'), true);
});

const PAGE = `<!doctype html><html lang="id"><head><title>Judul &amp; Sub — Situs</title>
<meta property="og:title" content="Literasi Digital &amp; Hoaks"><meta name="author" content="Nadia Putri">
<meta property="article:published_time" content="2026-10-01T08:00:00+07:00"><style>p{color:red}</style><script>var x='<p>bukan</p>'</script></head>
<body><header><nav><a href="/">Beranda</a> Menu</nav></header>
<main><article><h1>Literasi Digital</h1><p>Paragraf pertama&nbsp;tentang hoaks di sekolah.</p>
<div class="share-buttons">Bagikan ke X</div><p>Paragraf <b>kedua</b><br>berlanjut di sini &#8220;kutipan&#8221;.</p>
<aside>Artikel terkait</aside><figure><img src="a.png"><figcaption>Gambar</figcaption></figure></article></main>
<footer>© 2026 Situs</footer></body></html>`;

test('HTML → artikel: isi utama, metadata, tanpa menu/skrip/footer', () => {
  const a = htmlToArticle(PAGE, 'https://contoh.id/a');
  assert.equal(a.title, 'Literasi Digital & Hoaks');
  assert.equal(a.author, 'Nadia Putri');
  assert.equal(a.published, '2026-10-01T08:00:00+07:00');
  assert.equal(a.lang, 'id');
  assert.equal(a.text, 'Literasi Digital\n\nParagraf pertama tentang hoaks di sekolah.\n\nParagraf kedua berlanjut di sini “kutipan”.');
  for (const junk of ['Beranda', 'Bagikan', 'terkait', '©', 'bukan', 'color', 'Gambar']) assert.ok(!a.text.includes(junk), junk);
});

test('sitemap: urlset dan index, kembar dibuang, bukan sitemap ditolak', () => {
  const s = parseSitemap('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://a.id/1</loc></url><url><loc> https://a.id/2 </loc></url><url><loc>https://a.id/1</loc></url></urlset>');
  assert.deepEqual(s, { kind: 'urlset', locs: ['https://a.id/1', 'https://a.id/2'] });
  assert.equal(parseSitemap('<sitemapindex><sitemap><loc><![CDATA[https://a.id/s1.xml]]></loc></sitemap></sitemapindex>').locs[0], 'https://a.id/s1.xml');
  assert.equal(code(() => parseSitemap('<html><body>hai</body></html>')), 'bad_sitemap');
});

/** Pengambil tiruan: peta URL → jawaban. */
function fake(map: Record<string, { status?: number; body?: string; type?: string; location?: string; size?: number }>) {
  const seen: string[] = [];
  const f = async (u: string) => {
    seen.push(u);
    const r = map[u];
    if (!r) return new Response('nf', { status: 404 });
    const h = new Headers({ 'content-type': r.type ?? 'text/html; charset=utf-8' });
    if (r.location) h.set('location', r.location);
    if (r.size) h.set('content-length', String(r.size));
    return new Response(r.body ?? '', { status: r.status ?? 200, headers: h });
  };
  return { f, seen };
}

const LONG = `<html><body><article>${Array.from({ length: 8 }, (_, i) => `<p>Kalimat nomor ${i} tentang literasi digital dan kebiasaan memeriksa sumber berita.</p>`).join('')}</article></body></html>`;

test('ambil artikel: robots.txt dihormati, pengalihan diperiksa ulang, ukuran dibatasi', async () => {
  const ok = fake({ 'https://a.id/robots.txt': { body: 'User-agent: *\nDisallow: /rahasia', type: 'text/plain' }, 'https://a.id/x': { status: 301, location: '/y' }, 'https://a.id/y': { body: LONG } });
  const art = await fetchArticle('https://a.id/x', ok.f);
  assert.equal(art.url, 'https://a.id/y');
  assert.ok(art.words > 30);
  await assert.rejects(fetchArticle('https://a.id/rahasia/1', ok.f), (e: InputUrlError) => e.code === 'robots');
  const evil = fake({ 'https://a.id/r': { status: 302, location: 'http://169.254.169.254/latest' } });
  await assert.rejects(fetchArticle('https://a.id/r', evil.f), (e: InputUrlError) => e.code === 'blocked_host', 'pengalihan ke metadata ditolak');
  assert.ok(!evil.seen.some((u) => u.includes('169.254')), 'alamat internal tidak pernah dihubungi');
  const big = fake({ 'https://a.id/b': { body: 'x', size: 6 * 1024 * 1024 } });
  await assert.rejects(fetchArticle('https://a.id/b', big.f), (e: InputUrlError) => e.code === 'too_big');
  const loop = fake(Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`https://a.id/l${i}`, { status: 302, location: `/l${i + 1}` }])));
  await assert.rejects(fetchArticle('https://a.id/l0', loop.f), (e: InputUrlError) => e.code === 'redirects');
  const pdf = fake({ 'https://a.id/f.pdf': { body: '%PDF', type: 'application/pdf' } });
  await assert.rejects(fetchArticle('https://a.id/f.pdf', pdf.f), (e: InputUrlError) => e.code === 'not_html');
  const empty = fake({ 'https://a.id/js': { body: '<html><body><div id="app"></div></body></html>' } });
  await assert.rejects(fetchArticle('https://a.id/js', empty.f), (e: InputUrlError) => e.code === 'empty');
});

test('sitemap bertingkat: maks. URL, kembar dan alamat internal dilewati', async () => {
  const sm = fake({
    'https://a.id/sitemap.xml': { type: 'application/xml', body: '<sitemapindex><sitemap><loc>https://a.id/s1.xml</loc></sitemap><sitemap><loc>https://a.id/s2.xml</loc></sitemap></sitemapindex>' },
    'https://a.id/s1.xml': { type: 'application/xml', body: '<urlset><url><loc>https://a.id/1</loc></url><url><loc>https://a.id/2</loc></url><url><loc>http://10.0.0.1/x</loc></url></urlset>' },
    'https://a.id/s2.xml': { type: 'application/xml', body: '<urlset><url><loc>https://a.id/2</loc></url><url><loc>https://a.id/3</loc></url><url><loc>https://a.id/4</loc></url></urlset>' },
  });
  const r = await collectSitemap('https://a.id/sitemap.xml', 3, sm.f);
  assert.deepEqual(r.urls, ['https://a.id/1', 'https://a.id/2', 'https://a.id/3']);
  assert.ok(r.skipped >= 2, 'alamat internal dan kelebihan batas dihitung sebagai dilewati');
});
