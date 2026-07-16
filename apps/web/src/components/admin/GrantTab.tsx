"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

/**
 * Grant & Fundraising Worker admin UI: donor directory, AI-generated proposals
 * from live Ulyah stats (downloadable as a branded .doc / print-to-PDF), and a
 * Gmail-style composer that drafts bilingual outreach, carries the proposal as
 * a real attachment (plus any manual upload), previews the exact outgoing mail,
 * and can send a review copy to the admin first or the real email to the donor
 * — all from salam@ulyah.com. The AI writes the prose via Orchestra Core; the
 * admin reviews everything before it goes out.
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
  /** Owner's curated proposal PDF for this org in Google Drive (see
   * migration 0029) — one click from the composer. */
  drive_proposal_url?: string | null;
}
interface Dashboard {
  totals: { donors: number; proposals: number; emailsSent: number; emailsDraft: number };
  donorsByStatus: { status: string; n: number }[];
  emailConfigured: boolean;
}
interface Attachment {
  filename: string;
  contentB64: string;
  size: number;
}
interface EmailState {
  to: string;
  subject: string;
  bodyTarget: string;
  bodyId: string;
  language: string;
}

/** UTF-8 safe base64 (btoa alone mangles non-Latin1 characters). */
function utf8ToB64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

/** The branded proposal document (opens in Word, print-to-PDF ready). */
function buildDocHtml(title: string, body: string): string {
  const paras = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px;line-height:1.6;text-align:justify">${p.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="font-family:Georgia,serif;max-width:720px;margin:40px auto">
    <div style="text-align:center;border-bottom:2px solid #0B3D2E;padding-bottom:16px;margin-bottom:24px">
      <img src="https://ulyah.com/brand/ulyah-logo-dark.webp" style="width:96px;height:96px;border-radius:50%">
      <h1 style="color:#0B3D2E;font-size:22px;margin:12px 0 4px">${title}</h1>
      <p style="color:#666;font-size:13px;margin:0">https://ulyah.com · salam@ulyah.com · +6285691234561</p>
    </div>${paras}
    <div style="border-top:1px solid #ccc;margin-top:32px;padding-top:12px;color:#666;font-size:12px;text-align:center">Yusron Efendi · salam@ulyah.com · https://ulyah.com</div>
  </body></html>`;
}

function downloadDoc(title: string, body: string) {
  const blob = new Blob([buildDocHtml(title, body)], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "proposal-ulyah.doc";
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadAttachment(att: Attachment) {
  const bin = atob(att.contentB64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = att.filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function humanSize(n: number): string {
  return n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;
}

export function GrantTab() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [newDonor, setNewDonor] = useState({ org_name: "", country: "", email: "", contact_person: "", language: "en", org_type: "" });
  const [selDonor, setSelDonor] = useState<number | "">("");
  const [propLang, setPropLang] = useState("id");
  const [proposal, setProposal] = useState<{ id?: number; title: string; body: string } | null>(null);
  const [email, setEmail] = useState<EmailState>({ to: "", subject: "", bodyTarget: "", bodyId: "", language: "en" });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [reviewTo, setReviewTo] = useState("");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<{ country: string; category: string }>({ country: "", category: "" });
  const [suggestOut, setSuggestOut] = useState<string | null>(null);

  function refresh() {
    api.get<Dashboard>("/grant/dashboard").then(setDash).catch(() => {});
    api.get<{ donors: Donor[] }>("/grant/donors").then((d) => setDonors(d.donors)).catch(() => {});
  }
  useEffect(refresh, []);

  const selectedDonor = donors.find((d) => d.id === selDonor) ?? null;

  // Auto-fill the composer's recipient/subject from the chosen donor & proposal
  // (Gmail-like: pick a donor, the "To" fills itself; generate a proposal, the
  // subject fills itself) — without clobbering anything the admin already typed.
  useEffect(() => {
    setEmail((e) => ({
      ...e,
      to: e.to || selectedDonor?.email || "",
      language: selectedDonor?.language || e.language,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selDonor]);
  useEffect(() => {
    if (proposal?.title) setEmail((e) => ({ ...e, subject: e.subject || proposal.title }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.title]);

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

  /** Attach the current proposal as a branded .doc (real email attachment). */
  function attachProposal() {
    if (!proposal) return;
    const html = buildDocHtml(proposal.title, proposal.body);
    const contentB64 = utf8ToB64(html);
    const filename = "proposal-ulyah.doc";
    setAttachments((a) => [...a.filter((x) => x.filename !== filename), { filename, contentB64, size: html.length }]);
    setMsg("📎 Proposal dilampirkan ke email.");
  }

  function onUpload(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        const contentB64 = dataUrl.split(",")[1] ?? "";
        setAttachments((a) => [...a.filter((x) => x.filename !== file.name), { filename: file.name, contentB64, size: file.size }]);
      };
      reader.readAsDataURL(file);
    });
  }

  async function draftEmail() {
    if (!selDonor) {
      setMsg("Pilih donatur dulu untuk draft email otomatis.");
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
      setEmail({
        to: r.to ?? selectedDonor?.email ?? "",
        subject: t.subject || proposal?.title || "",
        bodyTarget: t.body,
        bodyId: idv.body,
        language: r.language,
      });
      // Auto-attach the proposal so a drafted email is send-ready in one step.
      if (proposal) attachProposal();
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0;
      if (status === 401) setMsg("❌ Sesi admin sudah berakhir — muat ulang halaman dan masuk kembali.");
      else setMsg(`❌ Gagal draft email: ${e instanceof Error ? e.message : "jaringan bermasalah"}.`);
    } finally {
      setBusy("");
    }
  }

  async function sendEmail(reviewMode: boolean) {
    if (!email.bodyTarget.trim() || !email.subject.trim()) {
      setMsg("Subjek dan isi email belum lengkap.");
      return;
    }
    if (!reviewMode && !email.to.trim()) {
      setMsg("Alamat donatur (Kepada) belum diisi.");
      return;
    }
    setBusy(reviewMode ? "review" : "send");
    setMsg(null);
    try {
      const r = await api.post<{ status: string; providerDetail: string; sentTo: string }>("/grant/email/send", {
        donorId: selDonor || undefined,
        proposalId: proposal?.id,
        to: email.to,
        subject: email.subject,
        bodyTarget: email.bodyTarget,
        bodyId: email.bodyId,
        language: email.language,
        attachments,
        reviewMode,
        reviewTo: reviewMode ? reviewTo || undefined : undefined,
      });
      if (r.status === "sent") setMsg(`✅ Email terkirim ke ${r.sentTo} dari salam@ulyah.com.`);
      else if (r.status === "review") setMsg(`📋 Tinjauan terkirim ke ${r.sentTo}. Periksa inbox Anda sebelum kirim ke donatur.`);
      else if (r.status === "failed" && /403|domain|verify|not.?verified|testing emails/i.test(r.providerDetail))
        setMsg(
          `❌ Ditolak provider email: ${r.providerDetail} — kemungkinan besar domain ulyah.com belum diverifikasi di dashboard Resend (resend.com/domains). Sebelum diverifikasi, Resend hanya mengizinkan kirim ke email pemilik akun sendiri.`
        );
      else setMsg(`ℹ️ ${r.providerDetail}`);
      refresh();
    } catch (e) {
      // Never swallow the real reason — "Gagal mengirim email" without a
      // cause is exactly what made this bug unreportable.
      const status = e instanceof ApiError ? e.status : 0;
      if (status === 401)
        setMsg("❌ Sesi admin sudah berakhir — muat ulang halaman ini dan masuk kembali, lalu kirim ulang.");
      else setMsg(`❌ Gagal mengirim email: ${e instanceof Error ? e.message : "jaringan bermasalah"}.`);
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
          Cari donatur, buat proposal dari data live ULYAH.COM (unduh DOC berlogo / cetak PDF), lalu susun email di komposer
          ala Gmail — lampirkan proposal, tinjau isi persisnya, kirim tinjauan ke diri sendiri dulu, baru kirim ke donatur
          dari <b>salam@ulyah.com</b>. AI menulis, Anda meninjau sebelum kirim.
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
              {d.drive_proposal_url && <span title="Proposal tersedia di Drive">📁</span>}
              {!d.email && <span className="rounded bg-warning/15 px-1 text-[9px] text-warning" title="Email kontak belum diisi">email?</span>}
            </label>
          ))}
          {donors.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">Belum ada donatur.</p>}
        </div>
        {selectedDonor && (
          <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs">
            <p className="font-medium">{selectedDonor.org_name}</p>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              {selectedDonor.org_type ?? "—"} · {selectedDonor.country ?? "—"} · bahasa: {selectedDonor.language ?? "en"} ·
              email: {selectedDonor.email || "BELUM DIISI — lengkapi dulu sebelum kirim"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedDonor.drive_proposal_url && (
                <a
                  href={selectedDonor.drive_proposal_url}
                  target="_blank"
                  rel="noopener"
                  className="rounded-full border border-accent/50 px-3 py-1 font-medium text-accent hover:bg-accent/10"
                >
                  📁 Buka proposal di Drive ↗
                </a>
              )}
              <span className="text-[var(--color-text-secondary)]">
                Alur 1-klik: pilih donatur → ✨ Isi otomatis (AI menulis dalam bahasa Inggris + bahasa negaranya) →
                proposal terlampir otomatis → Kirim. PDF Drive bisa diunduh lalu dilampirkan lewat “+ Unggah lampiran”.
              </span>
            </div>
          </div>
        )}
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
            <>
              <button onClick={() => downloadDoc(proposal.title, proposal.body)} className="rounded-full border border-accent/50 px-4 py-1.5 text-xs font-medium text-accent">
                ⬇️ Unduh DOC (berlogo)
              </button>
              <button onClick={attachProposal} className="rounded-full border border-accent/50 px-4 py-1.5 text-xs font-medium text-accent">
                📎 Lampirkan ke email
              </button>
            </>
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

      {/* ── Gmail-style composer ─────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div className="flex items-center justify-between bg-[#0B3D2E] px-4 py-2.5 text-[#f4efe3]">
          <span className="flex items-center gap-2 text-sm font-medium">✉️ Pesan Baru</span>
          <div className="flex items-center gap-2">
            <button onClick={draftEmail} disabled={busy === "email"} className="rounded-full border border-accent/40 bg-white/10 px-3 py-1 text-xs font-medium disabled:opacity-50">
              {busy === "email" ? "Menulis…" : "✨ Isi otomatis (AI)"}
            </button>
            <button onClick={() => setPreview((v) => !v)} className="rounded-full border border-white/25 px-3 py-1 text-xs">
              {preview ? "✎ Edit" : "👁 Pratinjau"}
            </button>
          </div>
        </div>

        {preview ? (
          <div className="space-y-3 p-5">
            <div className="text-xs text-[var(--color-text-secondary)]">
              <p><b>Dari:</b> ULYAH.COM &lt;salam@ulyah.com&gt;</p>
              <p><b>Kepada:</b> {email.to || "—"}</p>
              <p><b>Subjek:</b> {email.subject || "—"}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-4 text-sm leading-relaxed dark:bg-white/[0.02]">
              <p className="whitespace-pre-wrap">{email.bodyTarget || "(isi email kosong)"}</p>
              <div className="mt-4 border-t border-[var(--color-border)] pt-2 text-[11px] text-[var(--color-text-secondary)]">
                Yusron Efendi · https://ulyah.com · salam@ulyah.com
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <span key={a.filename} className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-2 py-1 text-[11px]">
                    📎 {a.filename} <span className="text-[var(--color-text-secondary)]">({humanSize(a.size)})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            <div className="flex items-center gap-2 px-4 py-2 text-sm">
              <span className="w-16 shrink-0 text-xs text-[var(--color-text-secondary)]">Dari</span>
              <span className="text-[var(--color-text-secondary)]">ULYAH.COM &lt;salam@ulyah.com&gt;</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5">
              <span className="w-16 shrink-0 text-xs text-[var(--color-text-secondary)]">Kepada</span>
              <input className="flex-1 bg-transparent py-1 text-sm outline-none" placeholder="email donatur" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5">
              <span className="w-16 shrink-0 text-xs text-[var(--color-text-secondary)]">Subjek</span>
              <input className="flex-1 bg-transparent py-1 text-sm outline-none" placeholder="judul email" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} />
            </div>
            <textarea
              className="min-h-[180px] w-full resize-y bg-transparent px-4 py-3 text-sm leading-relaxed outline-none"
              placeholder="Tulis pesan… (atau tekan ✨ Isi otomatis)"
              value={email.bodyTarget}
              onChange={(e) => setEmail({ ...email, bodyTarget: e.target.value })}
            />
          </div>
        )}

        {/* Attachments row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] px-4 py-2.5">
          {attachments.map((a) => (
            <span key={a.filename} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-2 py-1 text-[11px] dark:bg-white/[0.02]">
              📎 {a.filename}
              <span className="text-[var(--color-text-secondary)]">{humanSize(a.size)}</span>
              <button onClick={() => downloadAttachment(a)} title="Unduh" className="text-accent hover:underline">⬇</button>
              <button onClick={() => setAttachments((x) => x.filter((y) => y.filename !== a.filename))} title="Hapus" className="text-danger">✕</button>
            </span>
          ))}
          <label className="cursor-pointer rounded-lg border border-dashed border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-secondary)] hover:border-accent">
            + Unggah lampiran
            <input type="file" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] px-4 py-3">
          <button onClick={() => sendEmail(false)} disabled={busy === "send"} className="rounded-full bg-accent px-5 py-2 text-xs font-medium text-white disabled:opacity-50">
            {busy === "send" ? "Mengirim…" : "➤ Kirim ke Donatur"}
          </button>
          <button onClick={() => sendEmail(true)} disabled={busy === "review"} className="rounded-full border border-accent/50 bg-accent/10 px-5 py-2 text-xs font-medium text-accent disabled:opacity-50">
            {busy === "review" ? "Mengirim…" : "📋 Kirim Tinjauan ke saya"}
          </button>
          <input
            className="w-52 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs"
            placeholder="email tinjauan (opsional)"
            value={reviewTo}
            onChange={(e) => setReviewTo(e.target.value)}
          />
        </div>

        {email.bodyId && (
          <div className="border-t border-[var(--color-border)] p-4">
            <p className="mb-1 text-[11px] font-medium text-[var(--color-text-secondary)]">Versi Bahasa Indonesia (untuk ditinjau — tidak dikirim):</p>
            <textarea className="h-24 w-full rounded-lg border border-[var(--color-border)] bg-black/5 p-2 text-xs" value={email.bodyId} readOnly />
          </div>
        )}
      </div>
    </div>
  );
}
