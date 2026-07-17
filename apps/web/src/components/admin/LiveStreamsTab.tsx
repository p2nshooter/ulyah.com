"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface StreamRow {
  id: number;
  platform: "youtube";
  slot: number;
  kind: "auto" | "manual";
  region: string | null;
  title: string | null;
  url: string | null;
  is_live: number;
  updated_at: string;
}

/**
 * Admin for the /live hub v2: six manual YouTube slots (owner's own
 * broadcasts/recordings) + the always-on AUTO world channels (Makkah,
 * Madinah, and any 24h Islamic channel/campus/mosque the owner adds by
 * channel URL). TikTok/Facebook were removed by owner request.
 */
export function LiveStreamsTab() {
  const [rows, setRows] = useState<StreamRow[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { title: string; url: string; region: string; is_live: boolean }>>({});
  const [newAuto, setNewAuto] = useState({ title: "", url: "", region: "" });
  const [saving, setSaving] = useState<number | "new" | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    try {
      const r = await api.get<{ streams: StreamRow[] }>("/admin/live-streams");
      setRows(r.streams);
      const d: typeof drafts = {};
      for (const s of r.streams)
        d[s.id] = { title: s.title ?? "", url: s.url ?? "", region: s.region ?? "", is_live: !!s.is_live };
      setDrafts(d);
    } catch {
      setNote("Gagal memuat data.");
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(id: number) {
    const d = drafts[id];
    if (!d) return;
    setSaving(id);
    setNote(null);
    try {
      await api.put(`/admin/live-streams/${id}`, d);
      setNote("✓ Tersimpan — halaman /live langsung terbarui.");
      load();
    } catch {
      setNote("Gagal menyimpan — coba lagi.");
    } finally {
      setSaving(null);
    }
  }

  async function addAuto() {
    if (!newAuto.title.trim() || !newAuto.url.trim()) {
      setNote("Judul dan link channel wajib diisi.");
      return;
    }
    setSaving("new");
    setNote(null);
    try {
      await api.post("/admin/live-streams", newAuto);
      setNewAuto({ title: "", url: "", region: "" });
      setNote("✓ Channel dunia ditambahkan.");
      load();
    } catch {
      setNote("Gagal menambahkan channel.");
    } finally {
      setSaving(null);
    }
  }

  // For AUTO rows is_live doubles as show/hide on the public /live page
  // (the public route only lists autos WHERE is_live = 1). The PUT endpoint
  // overwrites title/url too, so resend the row's current values.
  async function toggleAuto(s: StreamRow) {
    setSaving(s.id);
    setNote(null);
    try {
      await api.put(`/admin/live-streams/${s.id}`, { title: s.title ?? "", url: s.url ?? "", is_live: !s.is_live });
      setNote(s.is_live ? "✓ Channel disembunyikan dari /live." : "✓ Channel ditampilkan di /live.");
      load();
    } catch {
      setNote("Gagal menyimpan — coba lagi.");
    } finally {
      setSaving(null);
    }
  }

  async function removeAuto(id: number) {
    setSaving(id);
    try {
      await api.del(`/admin/live-streams/${id}`);
      setNote("✓ Channel dihapus.");
      load();
    } catch {
      setNote("Gagal menghapus.");
    } finally {
      setSaving(null);
    }
  }

  const autos = rows.filter((r) => r.kind === "auto");
  const manuals = rows.filter((r) => r.kind === "manual");
  const input = "rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        <p className="font-heading text-base text-[var(--color-text-primary)]">📡 Live Streaming — halaman publik /live</p>
        <p className="mt-2">
          <b>Live Otomatis 24 Jam:</b> daftar channel dunia (Makkah, Madinah, Rodja TV, Madani, ARY Qtv — bisa ditambah
          sendiri di bawah dengan link channel YouTube apa pun: negara lain, kampus, masjid). Embed mengikuti siaran
          live channel-nya otomatis. <b>Siaran ULYAH (6 slot):</b> untuk link YouTube live/rekaman yang Anda isi
          manual — nyalakan LIVE saat aktif; slot offline menampilkan kartu ULYAH.COM + kontak Yusron Efendi
          (+62 856-9123-4561). TikTok &amp; Facebook sudah dihapus sesuai permintaan.
        </p>
      </div>

      {note && <p className="text-sm text-accent">{note}</p>}

      {/* Auto world channels */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">🕋 Live Otomatis 24 Jam ({autos.length})</p>
        <div className="mt-3 space-y-2">
          {autos.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] p-2 text-xs">
              <span className="min-w-0 flex-1 truncate">
                <b>{s.title}</b> {s.region && <span className="text-[var(--color-text-secondary)]">· {s.region}</span>}
                <span className="ml-2 break-all text-[var(--color-text-secondary)]">{s.url}</span>
              </span>
              <button
                onClick={() => toggleAuto(s)}
                disabled={saving === s.id}
                className={`rounded-full border px-3 py-1 disabled:opacity-50 ${
                  s.is_live
                    ? "border-accent/50 text-accent"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                {s.is_live ? "👁 Tampil" : "🙈 Sembunyi"}
              </button>
              {s.slot > 102 ? (
                <button
                  onClick={() => removeAuto(s.id)}
                  disabled={saving === s.id}
                  className="rounded-full border border-danger/40 px-3 py-1 text-danger disabled:opacity-50"
                >
                  Hapus
                </button>
              ) : (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent">tetap</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_140px_auto]">
          <input className={input} placeholder="Judul (mis. Al-Azhar Kairo)" value={newAuto.title} onChange={(e) => setNewAuto((p) => ({ ...p, title: e.target.value }))} />
          <input className={input} placeholder="Link channel YouTube (https://www.youtube.com/channel/UC…)" value={newAuto.url} onChange={(e) => setNewAuto((p) => ({ ...p, url: e.target.value }))} />
          <input className={input} placeholder="Negara/kota" value={newAuto.region} onChange={(e) => setNewAuto((p) => ({ ...p, region: e.target.value }))} />
          <button onClick={addAuto} disabled={saving === "new"} className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-primary disabled:opacity-50">
            {saving === "new" ? "…" : "+ Tambah"}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[var(--color-text-secondary)]">
          Tip: pakai link CHANNEL (bukan link video) agar slot selalu mengikuti live terbaru channel itu. Makkah &amp;
          Madinah dikunci sebagai fondasi.
        </p>
      </div>

      {/* Manual slots */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">🎥 Siaran ULYAH — 6 slot manual</p>
        <div className="mt-3 space-y-3">
          {manuals.map((s) => {
            const d = drafts[s.id] ?? { title: "", url: "", region: "", is_live: false };
            return (
              <div key={s.id} className="rounded-lg border border-[var(--color-border)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium">Slot {s.slot}</p>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={d.is_live}
                      onChange={(e) => setDrafts((p) => ({ ...p, [s.id]: { ...d, is_live: e.target.checked } }))}
                    />
                    <span className={d.is_live ? "font-semibold text-red-500" : "text-[var(--color-text-secondary)]"}>
                      {d.is_live ? "🔴 LIVE" : "Offline"}
                    </span>
                  </label>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input className={input} placeholder="Judul siaran" value={d.title} onChange={(e) => setDrafts((p) => ({ ...p, [s.id]: { ...d, title: e.target.value } }))} />
                  <input className={input} placeholder="Link YouTube (live atau rekaman)" value={d.url} onChange={(e) => setDrafts((p) => ({ ...p, [s.id]: { ...d, url: e.target.value } }))} />
                </div>
                <button
                  onClick={() => save(s.id)}
                  disabled={saving === s.id}
                  className="mt-2 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-primary disabled:opacity-50"
                >
                  {saving === s.id ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
