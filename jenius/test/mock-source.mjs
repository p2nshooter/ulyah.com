// Sumber buku tiruan untuk uji e2e (menggantikan raw.githubusercontent.com): Book Dash + Standard Ebooks dari fixtures.
import http from 'node:http';
import fs from 'node:fs';
const fx = (f) => fs.readFileSync(new URL(`./fixtures/${f}`, import.meta.url));
// JPEG 1×1 yang sah agar <img> benar-benar termuat di peramban.
const JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=', 'base64');
const port = Number(process.argv[2] || 8789);
http.createServer((req, res) => {
  const u = req.url || '';
  const send = (body, type = 'text/plain; charset=utf-8') => { res.writeHead(200, { 'content-type': type }); res.end(body); };
  if (u.endsWith('/_data/meta.yml')) return send(fx('bookdash-meta.yml'));
  if (u.endsWith('/sleepy-mr-sloth/en/index.md')) return send(fx('sloth.md'));
  if (/\/images\/[\w.-]+$/.test(u)) return send(JPG, 'image/jpeg');
  if (u.endsWith('/content.opf')) return send(fx('alice.opf'), 'application/xml');
  if (u.endsWith('/toc.xhtml')) return send(fx('alice-toc.xhtml'), 'application/xhtml+xml');
  if (/\/text\/chapter-\d+\.xhtml$/.test(u)) return send(fx('alice-ch1.xhtml'), 'application/xhtml+xml');
  res.writeHead(404); res.end('not found');
}).listen(port, '127.0.0.1', () => console.log(`mock source on ${port}`));
