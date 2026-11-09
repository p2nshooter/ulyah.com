// Membaca robots.txt seperti Google (grup dengan nama yang sama digabung; „Allow: /“ menang bila seri dengan
// „Disallow: /“) dan gagal bila ada crawler Google, Bingbot atau „*“ yang tertutup dari seluruh situs.
// Robots.txt terkelola Cloudflare boleh menutup bot AI lain (GPTBot dsb.) — itu bukan urusan pemeriksaan ini.
//   node scripts/robots-check.mjs https://jenius.es/robots.txt
const MUST = ['*', 'Googlebot', 'Googlebot-Image', 'Mediapartners-Google', 'AdsBot-Google', 'Google-InspectionTool', 'GoogleOther', 'Google-Extended', 'Google-CloudVertexBot', 'Google-Agent', 'Google-GeminiNotebook', 'Google-NotebookLM', 'Bingbot'];
export function blocked(body) {
  const groups = new Map(); // agent (lower) → { dis, allow }
  let agents = [], inRules = false;
  for (const raw of String(body).split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === 'user-agent') {
      if (inRules) { agents = []; inRules = false; }
      agents.push(v.toLowerCase());
      if (!groups.has(v.toLowerCase())) groups.set(v.toLowerCase(), { dis: false, allow: false });
    } else if (k === 'allow' || k === 'disallow') {
      inRules = true;
      for (const a of agents) {
        const g = groups.get(a);
        if (k === 'disallow' && v === '/') g.dis = true;
        if (k === 'allow' && v === '/') g.allow = true;
      }
    }
  }
  return MUST.filter((a) => {
    const g = groups.get(a.toLowerCase()) ?? groups.get('*');
    return g ? g.dis && !g.allow : false;
  });
}
if (process.argv[2]) {
  const r = await fetch(process.argv[2]);
  if (!r.ok) { console.error(`robots.txt: HTTP ${r.status}`); process.exit(1); }
  const b = blocked(await r.text());
  if (b.length) { console.error(`robots.txt menutup seluruh situs untuk: ${b.join(', ')}`); process.exit(1); }
  console.log('robots.txt: semua crawler Google, Bingbot dan * boleh masuk');
}
