"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface StreamRow {
  id: number;
  platform: "youtube" | "tiktok" | "facebook";
  slot: number;
  title: string | null;
  url: string | null;
  is_live: number;
  updated_at: string;
}

const PLATFORM_LABEL: Record<StreamRow["platform"], string> = {
  youtube: "▶️ YouTube",
  tiktok: "🎵 TikTok",
  facebook: "📘 Facebook",
};

/**
 * Admin manager for the /live streaming hub: 5 YouTube slots + TikTok +
 * Facebook. Paste the stream link, set LIVE when broadcasting, save. Offline
 * slots show the branded contact card publicly (Yusron Efendi's number), so
 * "everything offline" still looks intentional, never broken.
 */
export function LiveStreamsTab() {
  const [rows, setRows] = useState<StreamRow[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { title: string; url: string; is_live: boolean }>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    try {
      const r = await api.get<{ streams: StreamRow[] }>("/admin/live-streams");
      setRows(r.streams);
      const d: typeof drafts = {};
      for (const s of r.streams) d[s.id] = { title: s.title ?? "", url: s.url ?? "", is_live: !!s.is_live };
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

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        <p className="font-heading text-base text-[var(--color-text-primary)]">📡 Live Streaming — halaman publik /live</p>
        <p className="mt-2">
          Tempel link siaran (YouTube: link video/live/channel; Facebook: link video live; TikTok: link live), nyalakan
          <b> LIVE</b> saat siaran berlangsung, lalu simpan. Slot yang offline otomatis menampilkan kartu ULYAH.COM +
          kontak Yusron Efendi (+62 856-9123-4561) untuk yang ingin siaran lewat ulyah.com. Catatan jujur: TikTok tidak
          mengizinkan live diputar di situs lain — slot TikTok tampil sebagai kartu elegan dengan tombol menuju live.
        </p>
      </div>

      {note && <p className="text-sm text-accent">{note}</p>}

      <div className="space-y-3">
        {rows.map((s) => {
          const d = drafts[s.id] ?? { title: "", url: "", is_live: false };
          return (
            <div key={s.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {PLATFORM_LABEL[s.platform]}
                  {s.platform === "youtube" ? ` — Slot ${s.slot}` : ""}
                </p>
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
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input
                  value={d.title}
                  onChange={(e) => setDrafts((p) => ({ ...p, [s.id]: { ...d, title: e.target.value } }))}
                  placeholder="Judul siaran (mis. Kajian Subuh)"
                  className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                />
                <input
                  value={d.url}
                  onChange={(e) => setDrafts((p) => ({ ...p, [s.id]: { ...d, url: e.target.value } }))}
                  placeholder="Link siaran (https://…)"
                  className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => save(s.id)}
                disabled={saving === s.id}
                className="mt-3 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-primary disabled:opacity-50"
              >
                {saving === s.id ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
