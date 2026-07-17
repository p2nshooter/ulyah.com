import { Hono } from "hono";
import type { Env } from "../env.js";
import { requireAdmin } from "../lib/auth-middleware.js";
import { orchestrate } from "../lib/orchestra.js";

/**
 * Grant & Fundraising Worker (Arsitektur_baru.txt): find donors, generate
 * polite multi-language proposals from LIVE Ulyah.com stats, produce a
 * downloadable branded DOC/print-to-PDF, draft bilingual outreach emails, and
 * send them from salam@ulyah.com — all human-reviewable before send. The AI
 * (Orchestra Core content worker) writes the prose; the numbers come from the
 * real database, never invented.
 */
export const grantRoute = new Hono<{ Bindings: Env }>();
grantRoute.use("*", requireAdmin);

const DEV = {
  name: "Yusron Efendi",
  email: "salam@ulyah.com",
  phone: "+6285691234561",
  site: "https://ulyah.com",
};

async function count(env: Env, sql: string): Promise<number> {
  try {
    const r = await env.DB.prepare(sql).first<{ n: number }>();
    return r?.n ?? 0;
  } catch {
    return 0;
  }
}

interface LiveStats {
  ayah: number;
  hadits: number;
  haditsCollections: number;
  tafsir: number;
  kitab: number;
  stories: number;
  languages: number;
}

async function collectLiveStats(env: Env): Promise<LiveStats> {
  const [ayah, hadits, haditsCollections, tafsir, kitab, stories, languages] = await Promise.all([
    count(env, "SELECT COUNT(*) n FROM ayah"),
    count(env, "SELECT COUNT(*) n FROM hadits"),
    count(env, "SELECT COUNT(*) n FROM hadits_collection"),
    count(env, "SELECT COUNT(*) n FROM tafsir"),
    count(env, "SELECT COUNT(*) n FROM kitab_book"),
    count(env, "SELECT COUNT(*) n FROM stories WHERE status = 'published'"),
    count(env, "SELECT COUNT(DISTINCT lang) n FROM translation"),
  ]);
  return { ayah, hadits, haditsCollections, tafsir, kitab, stories, languages };
}

// ── Donor directory CRUD ─────────────────────────────────────────────────────
grantRoute.get("/donors", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM donor ORDER BY updated_at DESC LIMIT 200").all();
  return c.json({ donors: results });
});

grantRoute.post("/donors", async (c) => {
  const b = await c.req.json<Record<string, string>>();
  if (!b.org_name) return c.json({ error: "org_name required" }, 400);
  const row = await c.env.DB.prepare(
    `INSERT INTO donor (org_name, org_type, country, city, website, email, contact_person, language, funding_field, funding_value, deadline, requirements, how_to_apply, status, source, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, 'lead'), COALESCE(?, 'manual'), ?) RETURNING id`
  )
    .bind(
      b.org_name, b.org_type ?? null, b.country ?? null, b.city ?? null, b.website ?? null, b.email ?? null,
      b.contact_person ?? null, b.language ?? "en", b.funding_field ?? null, b.funding_value ?? null,
      b.deadline ?? null, b.requirements ?? null, b.how_to_apply ?? null, b.status ?? null, b.source ?? null, b.notes ?? null
    )
    .first<{ id: number }>();
  return c.json({ id: row?.id });
});

grantRoute.put("/donors/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json<Record<string, string>>();
  await c.env.DB.prepare(
    `UPDATE donor SET org_name=COALESCE(?,org_name), org_type=?, country=?, email=?, contact_person=?, language=COALESCE(?,language), status=COALESCE(?,status), notes=?, updated_at=datetime('now') WHERE id=?`
  )
    .bind(b.org_name ?? null, b.org_type ?? null, b.country ?? null, b.email ?? null, b.contact_person ?? null, b.language ?? null, b.status ?? null, b.notes ?? null, id)
    .run();
  return c.json({ ok: true });
});

grantRoute.delete("/donors/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM donor WHERE id = ?").bind(Number(c.req.param("id"))).run();
  return c.json({ ok: true });
});

// AI donor discovery — the reasoning worker proposes candidate organizations
// by country/category. Marked ai_suggested so the admin verifies each one
// (the AI can't crawl the live web; these are leads to check, not facts).
grantRoute.post("/donors/suggest", async (c) => {
  const { country, category } = await c.req.json<{ country?: string; category?: string }>();
  const prompt = `Sebutkan hingga 8 organisasi/yayasan/lembaga yang BERPOTENSI mendanai proyek dakwah digital Islami (perpustakaan Al-Qur'an, hadits, kitab, audio) ${country ? `di/berbasis ${country}` : "internasional"}${category ? ` bidang ${category}` : ""}. Untuk tiap organisasi berikan nama resmi, jenis (foundation/ngo/ministry/corporate-csr/university/philanthropy), negara, dan website jika kamu tahu. JANGAN mengarang email atau kontak pribadi. OUTPUT JSON: { "donors": [ { "org_name": "...", "org_type": "...", "country": "...", "website": "..." } ] }`;
  const r = await orchestrate(c.env, { capability: "reasoning", prompt });
  if (!r.ok || !r.text) return c.json({ error: "AI belum aktif (isi key di Key Pool).", attempts: r.attempts }, 503);
  return c.json({ raw: r.text, servedBy: r.servedBy });
});

// ── Proposal generation (live stats + AI prose) ──────────────────────────────
grantRoute.post("/proposal/generate", async (c) => {
  const { donorId, language, title } = await c.req.json<{ donorId?: number; language?: string; title?: string }>();
  const lang = language ?? "id";
  const stats = await collectLiveStats(c.env);
  let donor: Record<string, unknown> | null = null;
  if (donorId) {
    donor = await c.env.DB.prepare("SELECT * FROM donor WHERE id = ?").bind(donorId).first();
  }

  const statsLine = `Ayat Al-Qur'an: ${stats.ayah}, Hadits: ${stats.hadits} (dari ${stats.haditsCollections} kitab), entri tafsir: ${stats.tafsir}, kitab: ${stats.kitab}, artikel/kisah terbit: ${stats.stories}, bahasa terjemahan: ${stats.languages}+`;
  const prompt = `Tulis proposal pendanaan (grant) yang SOPAN, ELEGAN, dan profesional dalam bahasa dengan kode "${lang}" untuk platform dakwah digital ULYAH.COM.

Fakta ULYAH.COM (gunakan HANYA data ini, jangan mengarang angka):
- Platform Islam digital serverless (Cloudflare) — gratis diakses, multi-bahasa (${stats.languages}+ bahasa), tanpa iklan mengganggu.
- Konten live: ${statsLine}.
- Fitur: Al-Qur'an digital + tafsir + audio murottal, perpustakaan hadits & kitab, radio qori dunia, jadwal sholat, kiblat, kalkulator zakat & waris, kalender hijriyah, AI tanya-jawab berdalil.
- Misi: menyediakan ilmu Islam autentik, bersanad, dan dapat dipertanggungjawabkan untuk umat sedunia, gratis dan berkelanjutan.
- Pengembang: ${DEV.name} (${DEV.email}, ${DEV.site}).
${donor ? `- Ditujukan kepada: ${donor.org_name} (${donor.country ?? ""}).` : ""}

Struktur proposal: Ringkasan Eksekutif, Tentang ULYAH.COM, Dampak Sosial & Dakwah, Statistik, Rencana Pengembangan (roadmap singkat), Kebutuhan Dukungan/Pendanaan, Penutup. Nada santun & penuh hormat sesuai budaya penerima. Panjang wajar (600-900 kata). Jangan menyertakan tabel markdown rumit. Output HANYA teks proposal.`;

  const r = await orchestrate(c.env, { capability: "content", prompt, timeoutMs: 45_000 });
  if (!r.ok || !r.text) return c.json({ error: "AI belum aktif (isi key di Key Pool).", attempts: r.attempts }, 503);

  const propTitle = title ?? `Proposal Dukungan ULYAH.COM${donor ? ` — ${donor.org_name}` : ""}`;
  const row = await c.env.DB.prepare(
    "INSERT INTO proposal (donor_id, title, language, body, stats_snapshot, served_by, status) VALUES (?, ?, ?, ?, ?, ?, 'draft') RETURNING id"
  )
    .bind(donorId ?? null, propTitle, lang, r.text, JSON.stringify(stats), r.servedBy)
    .first<{ id: number }>();
  return c.json({ id: row?.id, title: propTitle, language: lang, body: r.text, servedBy: r.servedBy, stats });
});

grantRoute.get("/proposals", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, donor_id, title, language, status, created_at FROM proposal ORDER BY created_at DESC LIMIT 100"
  ).all();
  return c.json({ proposals: results });
});

// Download a proposal as a branded .doc (opens in Word, print-to-PDF ready).
// ?format=html returns the same page as text/html for in-browser preview/print.
grantRoute.get("/proposal/:id/download", async (c) => {
  const id = Number(c.req.param("id"));
  const format = c.req.query("format") ?? "doc";
  const p = await c.env.DB.prepare("SELECT * FROM proposal WHERE id = ?").bind(id).first<{
    title: string;
    language: string;
    body: string;
  }>();
  if (!p) return c.json({ error: "not found" }, 404);

  const paragraphs = p.body
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 12px;line-height:1.6;text-align:justify">${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(p.title)}</title></head>
<body style="font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;max-width:720px;margin:40px auto;padding:0 24px">
  <div style="text-align:center;border-bottom:2px solid #0B3D2E;padding-bottom:16px;margin-bottom:24px">
    <img src="https://ulyah.com/brand/ulyah-logo-dark.webp" alt="ULYAH.COM" style="width:96px;height:96px;border-radius:50%">
    <h1 style="color:#0B3D2E;margin:12px 0 4px;font-size:22px">${escapeHtml(p.title)}</h1>
    <p style="color:#666;margin:0;font-size:13px">${DEV.site} · ${DEV.email} · ${DEV.phone}</p>
  </div>
  ${paragraphs}
  <div style="border-top:1px solid #ccc;margin-top:32px;padding-top:12px;color:#666;font-size:12px;text-align:center">
    ${DEV.name} · ${DEV.email} · ${DEV.site}
  </div>
</body></html>`;

  const headers: Record<string, string> =
    format === "html"
      ? { "Content-Type": "text/html; charset=utf-8" }
      : {
          "Content-Type": "application/msword; charset=utf-8",
          "Content-Disposition": `attachment; filename="proposal-ulyah-${id}.doc"`,
        };
  return new Response(html, { headers });
});

// ── Outreach email: bilingual draft + send via salam@ulyah.com ───────────────
grantRoute.post("/email/draft", async (c) => {
  const { donorId, proposalId } = await c.req.json<{ donorId: number; proposalId?: number }>();
  const donor = await c.env.DB.prepare("SELECT * FROM donor WHERE id = ?").bind(donorId).first<{
    org_name: string;
    email: string | null;
    contact_person: string | null;
    language: string | null;
    country: string | null;
  }>();
  if (!donor) return c.json({ error: "donor not found" }, 404);
  const lang = donor.language ?? "en";

  const base = `Buat email pengantar proposal yang SANGAT SOPAN dan sesuai etika budaya, dari ${DEV.name} (ULYAH.COM, ${DEV.email}) kepada ${donor.contact_person ?? "Tim"} di ${donor.org_name}${donor.country ? `, ${donor.country}` : ""}. Perkenalkan ULYAH.COM sebagai platform dakwah digital Islami gratis & multi-bahasa, sampaikan maksud mengajukan dukungan/kerja sama, dan sebutkan proposal terlampir. Singkat (120-180 kata), hangat, penuh hormat. Sertakan subject.`;

  const [target, idv] = await Promise.all([
    orchestrate(c.env, { capability: "content", prompt: `${base} Tulis dalam bahasa kode "${lang}". OUTPUT JSON: { "subject": "...", "body": "..." }` }),
    orchestrate(c.env, { capability: "content", prompt: `${base} Tulis dalam Bahasa Indonesia (untuk ditinjau admin). OUTPUT JSON: { "subject": "...", "body": "..." }` }),
  ]);
  if (!target.ok || !target.text) return c.json({ error: "AI belum aktif (isi key di Key Pool).", attempts: target.attempts }, 503);

  return c.json({
    to: donor.email,
    language: lang,
    target: target.text,
    indonesian: idv.ok ? idv.text : null,
    donorId,
    proposalId: proposalId ?? null,
  });
});

grantRoute.post("/email/send", async (c) => {
  const { donorId, proposalId, to, subject, bodyTarget, bodyId, language, attachments, reviewMode, reviewTo } =
    await c.req.json<{
      donorId?: number;
      proposalId?: number;
      to: string;
      subject: string;
      bodyTarget: string;
      bodyId?: string;
      language?: string;
      // Base64 file payloads (proposal DOC + any manual upload) forwarded to
      // Resend as real attachments — "upload & download" in the composer.
      attachments?: { filename: string; contentB64: string }[];
      // "Kirim Tinjauan": send the exact outgoing email to the admin's own
      // inbox first (never the donor) so it can be viewed before real send.
      reviewMode?: boolean;
      reviewTo?: string;
    }>();
  if (!subject || !bodyTarget) return c.json({ error: "subject, bodyTarget required" }, 400);

  const from = c.env.EMAIL_FROM ?? DEV.email;
  const recipient = reviewMode ? reviewTo || from : to;
  if (!recipient) return c.json({ error: "recipient required" }, 400);
  const finalSubject = reviewMode ? `[TINJAUAN] ${subject}` : subject;

  let status = reviewMode ? "review" : "draft";
  let providerDetail = "";

  if (c.env.RESEND_API_KEY) {
    try {
      const reviewBanner = reviewMode
        ? `<div style="background:#fff7e0;border:1px solid #e6c65c;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#7a5c00">📋 <b>PRATINJAU</b> — beginilah email yang akan diterima donatur. Belum dikirim ke donatur.</div>`
        : "";
      const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a">${reviewBanner}${escapeHtml(bodyTarget).replace(/\n/g, "<br>")}
        <div style="border-top:1px solid #e5e5e5;margin-top:24px;padding-top:12px;color:#888;font-size:12px">${DEV.name} · <a href="${DEV.site}" style="color:#0B3D2E">${DEV.site}</a> · ${DEV.email}</div>
      </div>`;
      const payload: Record<string, unknown> = { from: `ULYAH.COM <${from}>`, to: [recipient], subject: finalSubject, html };
      const cleanAtt = (attachments ?? []).filter((a) => a.filename && a.contentB64).slice(0, 8);
      if (cleanAtt.length) payload.attachments = cleanAtt.map((a) => ({ filename: a.filename, content: a.contentB64 }));
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${c.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        status = reviewMode ? "review" : "sent";
        providerDetail = reviewMode ? "tinjauan terkirim ke admin" : "resend ok";
      } else {
        status = "failed";
        providerDetail = `resend ${res.status}: ${(await res.text()).slice(0, 160)}`;
      }
    } catch (err) {
      status = "failed";
      providerDetail = `resend error: ${String(err).slice(0, 160)}`;
    }
  } else {
    providerDetail = "RESEND_API_KEY belum di-set — email disimpan sebagai draft, belum terkirim.";
  }

  await c.env.DB.prepare(
    `INSERT INTO outreach_email (donor_id, proposal_id, to_email, from_email, language, subject, body_id, body_target, status, provider_detail, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${status === "sent" ? "datetime('now')" : "NULL"})`
  )
    .bind(donorId ?? null, proposalId ?? null, recipient, from, language ?? "en", finalSubject, bodyId ?? null, bodyTarget, status, providerDetail)
    .run();

  // Only a real (non-review) send advances the donor's pipeline status.
  if (donorId && status === "sent") {
    await c.env.DB.prepare("UPDATE donor SET status = 'proposal_sent', updated_at = datetime('now') WHERE id = ?").bind(donorId).run();
  }
  return c.json({ status, providerDetail, from, sentTo: recipient });
});

// ── Grant dashboard ──────────────────────────────────────────────────────────
grantRoute.get("/dashboard", async (c) => {
  const donorsByStatus = await c.env.DB.prepare("SELECT status, COUNT(*) n FROM donor GROUP BY status").all();
  const totals = {
    donors: await count(c.env, "SELECT COUNT(*) n FROM donor"),
    proposals: await count(c.env, "SELECT COUNT(*) n FROM proposal"),
    emailsSent: await count(c.env, "SELECT COUNT(*) n FROM outreach_email WHERE status = 'sent'"),
    emailsDraft: await count(c.env, "SELECT COUNT(*) n FROM outreach_email WHERE status = 'draft'"),
  };
  return c.json({ totals, donorsByStatus: donorsByStatus.results, emailConfigured: !!c.env.RESEND_API_KEY });
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
