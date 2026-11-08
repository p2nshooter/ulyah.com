// Server Anthropic tiruan untuk uji lokal: /v1/models dan /v1/messages (SSE), jawaban JSON sesuai skema.
import http from 'node:http';
import { randomUUID } from 'node:crypto';
const port = Number(process.argv[2] || 8788);
let calls = [];
function reply(body) {
  const user = typeof body.messages?.[0]?.content === 'string' ? body.messages[0].content : '';
  const sys = (body.system?.[0]?.text) || '';
  const nums = (re) => [...user.matchAll(re)].map((m) => Number(m[1]));
  if (/Grade strictly with the rubric/.test(sys)) {
    const keys = (user.match(/keys: ([^)]+)\)/) || [,''])[1].split(',').map((s) => s.trim()).filter(Boolean);
    const quote = (user.split('\n').find((l) => l.split(' ').length > 12) || 'Literasi digital').split(' ').slice(0, 10).join(' ');
    return { aspects: keys.map((k, i) => ({ key: k, level: i % 2 ? 3 : 4, reason: 'Alasan uji.', evidence: quote, tip: 'Saran uji.', sure: true })), errors: [{ wrong: 'di jelaskan', right: 'dijelaskan', type: 'spelling' }] };
  }
  if (/continue texts naturally/.test(sys)) {
    const ks = nums(/<naskah k="(\d+)">/g);
    return { continuations: ks.map((k) => ({ k, text: 'Lanjutan teks uji yang wajar tentang literasi digital dan kebiasaan memeriksa sumber.' })) };
  }
  if (/score ONLY/.test(user)) {
    const t = (user.match(/<target>([^<]*)<\/target>/) || [,''])[1].split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
    return { sentences: t.map((i) => ({ i, p: 0.85, r: ['generic_claim'] })), doc_p: 0.4, injection: false };
  }
  if (/Judge each numbered paragraph/.test(user)) {
    const ps = nums(/¶(\d+) /g);
    return { paragraphs: ps.map((i) => ({ i, p: i === 2 ? 0.7 : 0.1, r: i === 2 ? ['generic_claim'] : ['personal_detail'] })), doc_p: 0.2, style_note: 'Catatan gaya uji.', injection: false };
  }
  const lines = [...user.matchAll(/^\[(\d+)\] (.*)$/gm)];
  return { sentences: lines.map((m) => ({ i: Number(m[1]), p: /era digital|Selain itu|Secara keseluruhan/.test(m[2]) ? 0.9 : 0.08, r: /era digital/.test(m[2]) ? ['ai_phrase'] : ['personal_detail'] })), doc_p: 0.25, injection: false };
}
http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    if (req.url.startsWith('/v1/models')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ data: ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5'].map((id) => ({ id, type: 'model', display_name: id, created_at: '2026-01-01T00:00:00Z' })), has_more: false, first_id: 'a', last_id: 'b' }));
    }
    if (req.url === '/__calls') { res.writeHead(200); return res.end(JSON.stringify(calls)); }
    // ── PayPal tiruan (Orders v2 + webhook) dan sumber kurs tiruan (MASTER-BLUEPRINT §28.4) ──
    const json = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    if (req.url.startsWith('/fx/er')) return json(200, { result: 'success', rates: { IDR: 16234.5, USD: 1 } });
    if (req.url === '/v1/oauth2/token') {
      const auth = Buffer.from(String(req.headers.authorization || '').replace(/^Basic /, ''), 'base64').toString();
      if (!auth.startsWith('SANDBOX_TEST_CLIENT_ID_0123456789')) return json(401, { error: 'invalid_client', error_description: 'Client Authentication failed' });
      return json(200, { access_token: 'A21_TEST_TOKEN', token_type: 'Bearer', expires_in: 32400 });
    }
    if (req.url.startsWith('/v1/notifications/') || req.url.startsWith('/v2/checkout/')) {
      if (req.headers.authorization !== 'Bearer A21_TEST_TOKEN') return json(401, { name: 'AUTHENTICATION_FAILURE' });
      const b = JSON.parse(raw || '{}');
      globalThis.ppOrders ??= new Map();
      if (req.method === 'POST' && req.url === '/v2/checkout/orders') {
        const pu = b.purchase_units[0];
        const id = 'PPORDER' + randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
        globalThis.ppOrders.set(id, { pu, ctx: b.payment_source.paypal.experience_context, captured: false });
        // Persetujuan tiruan: tautan payer-action langsung kembali ke return_url seperti PayPal setelah pembeli menyetujui.
        const back = b.payment_source.paypal.experience_context.return_url + '&token=' + id + '&PayerID=TESTPAYER';
        return json(200, { id, status: 'PAYER_ACTION_REQUIRED', links: [{ rel: 'payer-action', href: back, method: 'GET' }] });
      }
      const cap = /^\/v2\/checkout\/orders\/([A-Z0-9]+)(\/capture)?$/.exec(req.url);
      if (cap) {
        const o = globalThis.ppOrders.get(cap[1]);
        if (!o) return json(404, { name: 'RESOURCE_NOT_FOUND' });
        if (cap[2] && o.captured) return json(422, { name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] });
        if (cap[2]) o.captured = true;
        const capture = { id: 'CAP' + cap[1].slice(7), status: 'COMPLETED', custom_id: o.pu.custom_id, amount: o.pu.amount };
        return json(cap[2] ? 201 : 200, { id: cap[1], status: o.captured ? 'COMPLETED' : 'APPROVED', payer: { email_address: 'buyer@example.com' }, purchase_units: [{ reference_id: o.pu.reference_id, custom_id: o.pu.custom_id, payments: o.captured ? { captures: [capture] } : {} }] });
      }
      if (req.method === 'POST' && req.url === '/v1/notifications/webhooks') return json(201, { id: 'WH-TEST-12345', url: b.url });
      if (req.method === 'POST' && req.url === '/v1/notifications/verify-webhook-signature') return json(200, { verification_status: b.transmission_sig === 'valid-signature' && b.webhook_id === 'WH-TEST-12345' ? 'SUCCESS' : 'FAILURE' });
      return json(404, { name: 'NOT_FOUND' });
    }
    const body = JSON.parse(raw || '{}');
    calls.push({ model: body.model, effort: body.output_config?.effort, betas: req.headers['anthropic-beta'] || null, fallbacks: body.fallbacks || null });
    const text = JSON.stringify(reply(body));
    const usage = { input_tokens: 1500, output_tokens: 900, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    const ev = (t, d) => res.write(`event: ${t}\ndata: ${JSON.stringify(d)}\n\n`);
    ev('message_start', { type: 'message_start', message: { id: 'msg_1', type: 'message', role: 'assistant', model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { ...usage, output_tokens: 1 } } });
    ev('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
    ev('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } });
    ev('content_block_stop', { type: 'content_block_stop', index: 0 });
    ev('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 900 } });
    ev('message_stop', { type: 'message_stop' });
    res.end();
  });
}).listen(port, () => console.log('mock on', port));
