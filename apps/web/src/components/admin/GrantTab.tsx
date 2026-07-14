"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Grant & Fundraising Worker admin UI: donor directory, AI-generated proposals
 * from live Ulyah stats (downloadable as a branded .doc / print-to-PDF), and
 * bilingual outreach emails sent from salam@ulyah.com. The AI writes the prose
 * via Orchestra Core; the admin reviews everything before it goes out.
 */

interface Donor {
  id: number;
  org_name: string;
  org_type: string | null;
  country: string | null;
  email: string | null;
  contact_person: string | null;
  language: string | null;
  status: string;
}
interface Dashboard {
  totals: { donors: number; proposals: number; emailsSent: number; emailsDraft: number };
  donorsByStatus: { status: string; n: number }[];
  emailConfigured: boolean;
}

function downloadDoc(title: string, body: string) {
  const paras = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px;line-height:1.6;text-align:justify">${p.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="font-family:Georgia,serif;max-width:720px;margin:40px auto">
    <div style="text-align:center;border-bottom:2px solid #0B3D2E;padding-bottom:16px;margin-bottom:24px">
      <img src="https://ulyah.com/brand/ulyah-logo-dark.webp" style="width:96px;height:96px;border-radius:50%">
      <h1 style="color:#0B3D2E;font-size:22px;margin:12px 0 4px">${title}</h1>
      <p style="color:#666;font-size:13px;margin:0">https://ulyah.com · salam@ulyah.com · +6285691234561</p>
    </div>${paras}
    <div style="border-top:1px solid #ccc;margin-top:32px;padding-top:12px;color:#666;font-size:12px;text-align:center">Yusron Efendi · salam@ulyah.com · https://ulyah.com</div>
  </body></html>`;
  const blob = new Blob([html], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `proposal-ulyah.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function GrantTab() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [newDonor, setNewDonor] = useState({ org_name: "", country: "", email: "", contact_person: "", language: "en", org_type: "" });
  const [selDonor, setSelDonor] = useState<number | "">("");
  const [propLang, setPropLang] = useState("id");
  const [proposal, setProposal] = useState<{ id?: number; title: string; body: string } | null>(null);
  const [email, setEmail] = useState<{ to: string; subject: string; bodyTarget: string; bodyId: string; language: string } | null>(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<{ country: string; category: string }>({ country: "", category: "" });
  const [suggestOut, setSuggestOut] = useState<string | null>(null);

  function refresh() {
    api.get<Dashboard>("/grant/dashboard").then(setDash).catch(() => {});
    api.get<{ donors: Donor[] }>("/grant/donors").then((d) => setDonors(d.donors)).catch(() => {});
  }
  useEffect(refresh, []);

  async function addDonor() {
    if (!newDonor.org_name) return;
    await api.post("/grant/donors", newDonor);
    setNewDonor({ org_name: "", country: "", email: "", contact_person: "", language: "en", org_type: "" });
    refresh();
  }

  async function runSuggest() {
    setBusy("suggest");
    setSuggestOut(null);
    try {
      const r = await api.post<{ raw: string }>("/grant/donors/suggest", suggest);
      setSuggestOut(r.raw);
    } catch {
      setSuggestOut("AI belum aktif — isi key di Key Pool.");
    } finally {
      setBusy("");
    }
  }

  async function genProposal() {
    setBusy("proposal");
    setMsg(null);
    try {
      const r = await api.post<{ id: number; title: string; body: string }>("/grant/proposal/generate", {
        donorId: selDonor || undefined,
        language: propLang,
      });
      setProposal(r);
    } catch {
      setMsg("Gagal membuat proposal — pastikan ada key AI aktif di Key Pool.");
    } finally {
      setBusy("");
    }
  }

  async function draftEmail() {
    if (!selDonor) {
      setMsg("Pilih donatur dulu untuk draft email.");
      return;
    }
    setBusy("email");
    setMsg(null);
    try {
      const r = await api.post<{ to: string; target: string; indonesian: string | null; language: string }>("/grant/email/draft", {
        donorId: selDonor,
        proposalId: proposal?.id,
      });
      const parse = (s: string | null) => {
        if (!s) return { subject: "", body: "" };
        try {
          const j = JSON.parse(s.replace(/```json|```/g, "").trim());
          return { subject: j.subject ?? "", body: j.body ?? "" };
        } catch {
          return { subject: "", body: s };
        }
      };
      const t = parse(r.target);
      const idv = parse(r.indonesian);
      setEmail({ to: r.to ?? "", subject: t.subject, bodyTarget: t.body, bodyId: idv.body, language: r.language });
    } catch {
      setMsg("Gagal draft email — pastikan ada key AI aktif.");
    } finally {
      setBusy("");
    }
  }

  async function sendEmail() {
    if (!email) return;
    setBusy("send");
    setMsg(null);
    try {
      const r = await api.post<{ status: string; providerDetail: string }>("/grant/email/send", {
        donorId: selDonor || undefined,
        proposalId: proposal?.id,
        to: email.to,
        subject: email.subject,
        bodyTarget: email.bodyTarget,
        bodyId: email.bodyId,
        language: email.language,
      });
      setMsg(r.status === "sent" ? "✅ Email terkirim dari salam@ulyah.com." : `ℹ️ ${r.providerDetail}`);
      refresh();
    } catch {
      setMsg("Gagal mengirim email.");
    } finally {
      setBusy("");
    }
  }

  const field = "w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-lg">🤝 Grant &amp; Fundraising</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Cari donatur, buat proposal dari data live ULYAH.COM (unduh DOC berlogo / cetak PDF), dan kirim email pengantar
          dwibahasa dari <b>salam@ulyah.com</b>. AI menulis, Anda meninjau sebelum kirim.
        </p>
        {dash && (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">Donatur: {dash.totals.donors}</span>
            <span className="rounded-full border border-[var(--color-border)] px-3 py-1">Proposal: {dash.totals.proposals}</span>
            <span className="rounded-full border border-[var(--color-border)] px-3 py-1">Email terkirim: {dash.totals.emailsSent}</span>
            <span className={`rounded-full border px-3 py-1 ${dash.emailConfigured ? "border-success/40 bg-success/10 text-success" : "border-warning/40 bg-warning/10 text-warning"}`}>
              {dash.emailConfigured ? "Email siap kirim (Resend aktif)" : "Email BELUM aktif — set RESEND_API_KEY"}
            </span>
          </div>
        )}
      </div>

      {msg && <p className="rounded-lg bg-black/5 p-2 text-xs">{msg}</p>}

      {/* Add donor + AI suggest */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-sm font-medium">➕ Tambah donatur</p>
          <div className="mt-2 grid gap-2">
            <input className={field} placeholder="Nama organisasi *" value={newDonor.org_name} onChange={(e) => setNewDonor({ ...newDonor, org_name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className={field} placeholder="Negara" value={newDonor.country} onChange={(e) => setNewDonor({ ...newDonor, country: e.target.value })} />
              <input className={field} placeholder="Bahasa (en/ar/…)" value={newDonor.language} onChange={(e) => setNewDonor({ ...newDonor, language: e.target.value })} />
            </div>
            <input className={field} placeholder="Email" value={newDonor.email} onChange={(e) => setNewDonor({ ...newDonor, email: e.target.value })} />
            <input className={field} placeholder="Kontak person" value={newDonor.contact_person} onChange={(e) => setNewDonor({ ...newDonor, contact_person: e.target.value })} />
            <button onClick={addDonor} className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-white">Simpan donatur</button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-sm font-medium">🔎 Cari donatur (AI)</p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">AI mengusulkan kandidat organisasi — WAJIB diverifikasi (bukan fakta live).</p>
          <div className="mt-2 grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <input className={field} placeholder="Negara (mis. Qatar)" value={suggest.country} onChange={(e) => setSuggest({ ...suggest, country: e.target.value })} />
              <input className={field} placeholder="Bidang (mis. digital dakwah)" value={suggest.category} onChange={(e) => setSuggest({ ...suggest, category: e.target.value })} />
            </div>
            <button onClick={runSuggest} disabled={busy === "suggest"} className="rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-xs font-medium text-accent disabled:opacity-50">
              {busy === "suggest" ? "Mencari…" : "Usulkan kandidat"}
            </button>
            {suggestOut && <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-black/5 p-2 text-[10px]">{suggestOut}</pre>}
          </div>
        </div>
      </div>

      {/* Donor list */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">📇 Daftar donatur ({donors.length})</p>
        <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
          {donors.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs hover:bg-black/5">
              <input type="radio" name="donor" checked={selDonor === d.id} onChange={() => setSelDonor(d.id)} />
              <span className="font-medium">{d.org_name}</span>
              <span className="text-[var(--color-text-secondary)]">{d.country ?? ""} · {d.language ?? "en"} · {d.status}</span>
            </label>
          ))}
          {donors.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">Belum ada donatur.</p>}
        </div>
      </div>

      {/* Proposal */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">📄 Proposal (data live + AI)</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input className="w-28 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs" placeholder="Bahasa" value={propLang} onChange={(e) => setPropLang(e.target.value)} />
          <button onClick={genProposal} disabled={busy === "proposal"} className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50">
            {busy === "proposal" ? "Menulis proposal…" : selDonor ? "Buat proposal untuk donatur terpilih" : "Buat proposal umum"}
          </button>
          {proposal && (
            <button onClick={() => downloadDoc(proposal.title, proposal.body)} className="rounded-full border border-accent/50 px-4 py-1.5 text-xs font-medium text-accent">
              ⬇️ Unduh DOC (berlogo)
            </button>
          )}
        </div>
        {proposal && (
          <textarea
            className="mt-3 h-56 w-full rounded-lg border border-[var(--color-border)] bg-transparent p-3 text-xs leading-relaxed"
            value={proposal.body}
            onChange={(e) => setProposal({ ...proposal, body: e.target.value })}
          />
        )}
      </div>

      {/* Email */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">✉️ Email pengantar (dwibahasa)</p>
          <button onClick={draftEmail} disabled={busy === "email"} className="rounded-full border border-accent/50 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent disabled:opacity-50">
            {busy === "email" ? "Menulis…" : "Draft email (AI)"}
          </button>
        </div>
        {email && (
          <div className="mt-3 grid gap-2">
            <input className={field} placeholder="Kepada (email)" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} />
            <input className={field} placeholder="Subject" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} />
            <label className="text-[11px] text-[var(--color-text-secondary)]">Isi ({email.language}) — yang dikirim:</label>
            <textarea className="h-32 w-full rounded-lg border border-[var(--color-border)] bg-transparent p-2 text-xs" value={email.bodyTarget} onChange={(e) => setEmail({ ...email, bodyTarget: e.target.value })} />
            {email.bodyId && (
              <>
                <label className="text-[11px] text-[var(--color-text-secondary)]">Versi Indonesia (untuk ditinjau saja):</label>
                <textarea className="h-24 w-full rounded-lg border border-[var(--color-border)] bg-black/5 p-2 text-xs" value={email.bodyId} readOnly />
              </>
            )}
            <button onClick={sendEmail} disabled={busy === "send" || !email.to} className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
              {busy === "send" ? "Mengirim…" : "Kirim dari salam@ulyah.com"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
