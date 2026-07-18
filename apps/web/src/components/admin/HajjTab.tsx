"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";

interface PackageRow {
  id: number;
  kind: "hajj" | "umrah";
  title: string;
  provider: string | null;
  description: string | null;
  price: string | null;
  duration: string | null;
  departure: string | null;
  image_url: string | null;
  badge: string | null;
  features: string | null; // JSON string from the DB
  contact_url: string | null;
  sort_order: number;
  visible: number;
}

interface Draft {
  id?: number;
  kind: "hajj" | "umrah";
  title: string;
  provider: string;
  description: string;
  price: string;
  duration: string;
  departure: string;
  image_url: string;
  badge: string;
  featuresText: string; // one bullet per line
  contact_url: string;
  sort_order: number;
}

const EMPTY: Draft = {
  kind: "umrah", title: "", provider: "", description: "", price: "", duration: "",
  departure: "", image_url: "", badge: "", featuresText: "", contact_url: "", sort_order: 99,
};

function toDraft(r: PackageRow): Draft {
  let features: string[] = [];
  try {
    const p = r.features ? JSON.parse(r.features) : [];
    if (Array.isArray(p)) features = p.filter((x): x is string => typeof x === "string");
  } catch {
    /* ignore */
  }
  return {
    id: r.id, kind: r.kind, title: r.title, provider: r.provider ?? "", description: r.description ?? "",
    price: r.price ?? "", duration: r.duration ?? "", departure: r.departure ?? "", image_url: r.image_url ?? "",
    badge: r.badge ?? "", featuresText: features.join("\n"), contact_url: r.contact_url ?? "", sort_order: r.sort_order,
  };
}

/**
 * Admin for the Hajj & Umrah products shown on /haji-umroh (migration 0038).
 * Tenant-scoped: a sibling admin manages only its own site; the ulyah owner
 * picks the site with the selector. The acquisition page advertises this as a
 * dynamic, admin-managed page — this is where the owner adds/edits/hides the
 * packages. Nothing about the public page is hardcoded.
 */
export function HajjTab() {
  const isUlyah = TENANT.id === "ulyah";
  const [tenant, setTenant] = useState<string>(isUlyah ? "ulyah" : TENANT.id);
  const [rows, setRows] = useState<PackageRow[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get<{ packages: PackageRow[] }>(`/admin/hajj-packages?tenant=${tenant}`);
      setRows(Array.isArray(r?.packages) ? r.packages : []);
    } catch {
      setNote("Gagal memuat data.");
    }
  }, [tenant]);
  useEffect(() => {
    load();
  }, [load]);

  function payload(d: Draft) {
    return {
      tenant,
      kind: d.kind,
      title: d.title.trim(),
      provider: d.provider.trim() || null,
      description: d.description.trim() || null,
      price: d.price.trim() || null,
      duration: d.duration.trim() || null,
      departure: d.departure.trim() || null,
      image_url: d.image_url.trim() || null,
      badge: d.badge.trim() || null,
      features: d.featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
      contact_url: d.contact_url.trim() || null,
      sort_order: Number.isFinite(d.sort_order) ? d.sort_order : 99,
    };
  }

  async function save() {
    if (!draft.title.trim()) {
      setNote("Judul paket wajib diisi.");
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      if (draft.id) await api.put(`/admin/hajj-packages/${draft.id}`, payload(draft));
      else await api.post("/admin/hajj-packages", payload(draft));
      setNote(draft.id ? "✓ Paket diperbarui." : "✓ Paket ditambahkan (langsung tampil di halaman publik).");
      setDraft(EMPTY);
      load();
    } catch (e) {
      setNote(e instanceof Error && e.message ? e.message : "Gagal menyimpan — coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(r: PackageRow) {
    try {
      await api.put(`/admin/hajj-packages/${r.id}`, { visible: !r.visible });
      load();
    } catch {
      setNote("Gagal menyimpan.");
    }
  }

  async function remove(r: PackageRow) {
    if (!window.confirm(`Hapus paket "${r.title}"? Untuk sekadar menyembunyikan, pakai tombol mata.`)) return;
    try {
      await api.del(`/admin/hajj-packages/${r.id}?tenant=${tenant}`);
      setNote("✓ Paket dihapus.");
      if (draft.id === r.id) setDraft(EMPTY);
      load();
    } catch {
      setNote("Gagal menghapus.");
    }
  }

  const input = "w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm";
  const visibleCount = rows.filter((r) => r.visible).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        <p className="font-heading text-base text-[var(--color-text-primary)]">🕋 Haji &amp; Umroh — halaman publik /haji-umroh</p>
        <p className="mt-2">
          Kelola paket haji &amp; umroh yang tampil di halaman promosi. Tulis dalam bahasa situs terkait. <b>👁 Tampil</b>{" "}
          = muncul di halaman publik, <b>🙈 Sembunyi</b> = tersimpan tapi tidak tampil. Isi <b>Poin fitur</b> satu baris
          per poin. Halaman publik ini yang dijanjikan di halaman acquisition — sekarang benar-benar ada &amp; dinamis.
        </p>
      </div>

      {isUlyah && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-text-secondary)]">Situs:</span>
          {["ulyah", "1fr", "tilawa", "dawa"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTenant(t);
                setDraft(EMPTY);
              }}
              className={`rounded-full px-3 py-1 text-xs ${tenant === t ? "bg-accent text-white" : "border border-[var(--color-border)]"}`}
            >
              {t === "1fr" ? "1fr.fr" : t === "tilawa" ? "tilawa.de" : t === "dawa" ? "dawa.es" : "ulyah.com"}
            </button>
          ))}
        </div>
      )}

      {note && <p className="text-sm text-accent">{note}</p>}

      {/* Add / edit form */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">{draft.id ? `✎ Edit paket #${draft.id}` : "+ Tambah paket"}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select
            className={input}
            value={draft.kind}
            onChange={(e) => setDraft((p) => ({ ...p, kind: e.target.value as "hajj" | "umrah" }))}
          >
            <option value="umrah">Umroh</option>
            <option value="hajj">Haji</option>
          </select>
          <input className={input} placeholder="Judul paket *" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
          <input className={input} placeholder="Penyelenggara / travel" value={draft.provider} onChange={(e) => setDraft((p) => ({ ...p, provider: e.target.value }))} />
          <input className={input} placeholder="Badge (mis. Terlaris)" value={draft.badge} onChange={(e) => setDraft((p) => ({ ...p, badge: e.target.value }))} />
          <textarea className={`${input} sm:col-span-2`} rows={2} placeholder="Deskripsi singkat" value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} />
          <input className={input} placeholder="Harga (mis. Rp 28.500.000 / €1.890)" value={draft.price} onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))} />
          <input className={input} placeholder="Durasi (mis. 9 hari / 9 Tage)" value={draft.duration} onChange={(e) => setDraft((p) => ({ ...p, duration: e.target.value }))} />
          <input className={input} placeholder="Keberangkatan (mis. Jakarta · 2026)" value={draft.departure} onChange={(e) => setDraft((p) => ({ ...p, departure: e.target.value }))} />
          <input className={input} placeholder="Sort (kecil = di atas)" type="number" value={draft.sort_order} onChange={(e) => setDraft((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
          <input className={`${input} sm:col-span-2`} placeholder="URL kontak (wa.me/… atau mailto:…)" value={draft.contact_url} onChange={(e) => setDraft((p) => ({ ...p, contact_url: e.target.value }))} />
          <input className={`${input} sm:col-span-2`} placeholder="URL gambar (opsional)" value={draft.image_url} onChange={(e) => setDraft((p) => ({ ...p, image_url: e.target.value }))} />
          <textarea className={`${input} sm:col-span-2`} rows={4} placeholder={"Poin fitur — satu baris per poin\nHotel ⭐⭐⭐⭐ dekat Haram\nTiket pesawat PP + visa"} value={draft.featuresText} onChange={(e) => setDraft((p) => ({ ...p, featuresText: e.target.value }))} />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} disabled={busy} className="rounded-full bg-accent px-5 py-2 text-xs font-medium text-primary disabled:opacity-50">
            {busy ? "…" : draft.id ? "Simpan perubahan" : "+ Tambah paket"}
          </button>
          {draft.id && (
            <button onClick={() => setDraft(EMPTY)} className="rounded-full border border-[var(--color-border)] px-5 py-2 text-xs">
              Batal
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">
          🗂️ Paket ({rows.length}) — tampil {visibleCount}, tersembunyi {rows.length - visibleCount}
        </p>
        <div className="mt-3 space-y-1.5">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] p-2 text-xs ${r.visible ? "" : "opacity-55"}`}
            >
              <span className="rounded-full border border-accent/40 px-2 py-0.5 text-accent">{r.kind === "hajj" ? "Haji" : "Umroh"}</span>
              <span className="min-w-0 flex-1 truncate">
                <b>{r.title}</b>
                {r.price && <span className="ml-2 text-[var(--color-text-secondary)]">{r.price}</span>}
                {r.provider && <span className="ml-2 text-[var(--color-text-secondary)]">· {r.provider}</span>}
              </span>
              <button onClick={() => setDraft(toDraft(r))} className="rounded-full border border-[var(--color-border)] px-3 py-1">
                ✎ Edit
              </button>
              <button
                onClick={() => toggle(r)}
                className={`rounded-full border px-3 py-1 ${r.visible ? "border-accent/50 text-accent" : "border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}
              >
                {r.visible ? "👁 Tampil" : "🙈 Sembunyi"}
              </button>
              <button onClick={() => remove(r)} className="rounded-full border border-danger/40 px-3 py-1 text-danger">
                Hapus
              </button>
            </div>
          ))}
          {rows.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">Belum ada paket untuk situs ini.</p>}
        </div>
      </div>
    </div>
  );
}
