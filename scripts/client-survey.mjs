// One-off survey of the nine partner sites from the owner's AdSense list:
// what each site is about, its language, menu, headings and ads.txt.
// Read-only. Prints plain text so the job log is the report.
import { chromium } from 'playwright';

const domains = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', locale: 'id-ID' });

async function text(url) {
  try {
    const r = await ctx.request.get(url, { timeout: 20000, maxRedirects: 5 });
    return `${r.status()} ${(await r.text()).slice(0, 600).replace(/\s+/g, ' ')}`;
  } catch (e) { return `ERR ${String(e.message).split('\n')[0]}`; }
}

for (const d of domains) {
  console.log(`\n==================== ${d} ====================`);
  const page = await ctx.newPage();
  let ok = false;
  for (const base of [`https://${d}/`, `http://${d}/`, `https://www.${d}/`]) {
    try {
      const resp = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2500);
      console.log(`URL      ${base} -> ${page.url()} [${resp ? resp.status() : '?'}]`);
      ok = true; break;
    } catch (e) { console.log(`URL      ${base} -> ERR ${String(e.message).split('\n')[0]}`); }
  }
  if (ok) {
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);
    const grab = () => page.evaluate(() => {
      const q = (s) => [...document.querySelectorAll(s)];
      const t = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      const meta = (n) => (document.querySelector(`meta[name="${n}"]`) || document.querySelector(`meta[property="${n}"]`))?.content || '';
      const links = q('a[href]').map(a => ({ t: t(a), h: a.getAttribute('href') })).filter(l => l.t && l.t.length < 120);
      const nav = q('header a, nav a, .menu a, #menu a').map(t).filter(Boolean);
      const body = t(document.body);
      return {
        title: document.title, lang: document.documentElement.lang, desc: meta('description'),
        gen: meta('generator'), ogsite: meta('og:site_name'),
        h1: q('h1').map(t).slice(0, 5), h2: q('h2').map(t).slice(0, 20), h3: q('h3').map(t).slice(0, 20),
        nav: [...new Set(nav)].slice(0, 40), links: links.slice(0, 80),
        words: body.split(/\s+/).length, start: body.slice(0, 1500),
        pubs: [...new Set((document.documentElement.outerHTML.match(/ca-pub-\d+/g) || []))],
        fonts: [...new Set(q('link[href*="fonts"]').map(l => l.href))].slice(0, 5),
      };
    });
    let info;
    try { info = await grab(); } catch { await page.waitForTimeout(4000); try { info = await grab(); } catch (e) { info = { error: String(e.message).split('\n')[0] }; } }
    console.log(`FINAL    ${page.url()}`);
    for (const [k, v] of Object.entries(info)) {
      if (k === 'links') { console.log('LINKS'); v.forEach(l => console.log(`   ${l.t}  ->  ${l.h}`)); }
      else console.log(`${k.toUpperCase().padEnd(8)} ${Array.isArray(v) ? v.join(' | ') : v}`);
    }
  }
  console.log(`ADS.TXT  ${await text(`https://${d}/ads.txt`)}`);
  console.log(`ROBOTS   ${await text(`https://${d}/robots.txt`)}`);
  await page.close();
}
await browser.close();
