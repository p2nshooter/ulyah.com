"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

interface ChannelRow {
  id: number;
  country: string;
  title: string;
  channel_id: string;
  language: string | null;
  sort_order: number;
  visible: number;
}

/**
 * Admin for the world kids-film channels shown on /video-anak. Owner rule:
 * show as many Islamic-nuance channels per country as possible, then curate
 * visibility manually here — hide = gone from the public page instantly,
 * show = back. Add form takes a YouTube CHANNEL link so the public page can
 * always play the channel's uploads playlist.
 */
export function KidsChannelsTab() {
  const [rows, setRows] = useState<ChannelRow[]>([]);
  const [draft, setDraft] = useState({ country: "", title: "", url: "", language: "" });
  const [busy, setBusy] = useState<number | "new" | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    try {
      const r = await api.get<{ channels: ChannelRow[] }>("/admin/kids-channels");
      setRows(r.channels);
    } catch {
      setNote("Gagal memuat data.");
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(ch: ChannelRow) {
    setBusy(ch.id);
    setNote(null);
    try {
      await api.put(`/admin/kids-channels/${ch.id}`, { visible: !ch.visible });
      setNote(ch.visible ? "✓ Disembunyikan dari halaman publik." : "✓ Ditampilkan di halaman publik.");
      load();
    } catch {
      setNote("Gagal menyimpan — coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function add() {
    if (!draft.country.trim() || !draft.title.trim() || !draft.url.trim()) {
      setNote("Negara, nama channel, dan link channel wajib diisi.");
      return;
    }
    setBusy("new");
    setNote(null);
    try {
      await api.post("/admin/kids-channels", draft);
      setDraft({ country: "", title: "", url: "", language: "" });
      setNote("✓ Channel ditambahkan (langsung tampil di halaman publik).");
      load();
    } catch (e) {
      setNote(e instanceof Error && e.message ? e.message : "Gagal menambahkan — pastikan link berbentuk …/channel/UC…");
    } finally {
      setBusy(null);
    }
  }

  async function remove(ch: ChannelRow) {
    if (!window.confirm(`Hapus channel "${ch.title}" (${ch.country})? Untuk sekadar menyembunyikan, pakai tombol mata.`)) return;
    setBusy(ch.id);
    try {
      await api.del(`/admin/kids-channels/${ch.id}`);
      setNote("✓ Channel dihapus.");
      load();
    } catch {
      setNote("Gagal menghapus.");
    } finally {
      setBusy(null);
    }
  }

  const byCountry = useMemo(() => {
    const m = new Map<string, ChannelRow[]>();
    for (const r of rows) {
      const list = m.get(r.country) ?? [];
      list.push(r);
      m.set(r.country, list);
    }
    return [...m.entries()];
  }, [rows]);

  const visibleCount = rows.filter((r) => r.visible).length;
  const input = "rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        <p className="font-heading text-base text-[var(--color-text-primary)]">🎬 Film Anak Muslim Dunia — halaman publik /video-anak</p>
        <p className="mt-2">
          Channel dikelompokkan per negara. <b>👁 Tampil</b> berarti muncul di halaman publik, <b>🙈 Sembunyi</b>{" "}
          berarti tidak muncul (data tetap tersimpan, bisa ditampilkan lagi kapan saja). Tambahkan channel baru dengan
          link CHANNEL YouTube (bentuk …/channel/UC…) supaya kartunya selalu memutar playlist upload channel itu.
        </p>
      </div>

      {note && <p className="text-sm text-accent">{note}</p>}

      {/* Add form */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">+ Tambah channel</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr_1fr_110px_auto]">
          <input className={input} placeholder="Negara (mis. Mesir)" value={draft.country} onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value }))} />
          <input className={input} placeholder="Nama channel" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
          <input className={input} placeholder="Link channel (https://www.youtube.com/channel/UC…)" value={draft.url} onChange={(e) => setDraft((p) => ({ ...p, url: e.target.value }))} />
          <input className={input} placeholder="Bahasa (ar/en/…)" value={draft.language} onChange={(e) => setDraft((p) => ({ ...p, language: e.target.value }))} />
          <button onClick={add} disabled={busy === "new"} className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-primary disabled:opacity-50">
            {busy === "new" ? "…" : "+ Tambah"}
          </button>
        </div>
      </div>

      {/* Per-country lists */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">
          🌍 Semua channel ({rows.length}) — tampil {visibleCount}, tersembunyi {rows.length - visibleCount}
        </p>
        <div className="mt-3 space-y-4">
          {byCountry.map(([country, list]) => (
            <div key={country}>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">{country}</p>
              <div className="mt-1.5 space-y-1.5">
                {list.map((ch) => (
                  <div
                    key={ch.id}
                    className={`flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] p-2 text-xs ${
                      ch.visible ? "" : "opacity-55"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      <b>{ch.title}</b>
                      {ch.language && <span className="ml-1 text-[var(--color-text-secondary)]">({ch.language})</span>}
                      <span className="ml-2 break-all text-[var(--color-text-secondary)]">{ch.channel_id}</span>
                    </span>
                    <button
                      onClick={() => toggle(ch)}
                      disabled={busy === ch.id}
                      className={`rounded-full border px-3 py-1 disabled:opacity-50 ${
                        ch.visible
                          ? "border-accent/50 text-accent"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {ch.visible ? "👁 Tampil" : "🙈 Sembunyi"}
                    </button>
                    <button
                      onClick={() => remove(ch)}
                      disabled={busy === ch.id}
                      className="rounded-full border border-danger/40 px-3 py-1 text-danger disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">Belum ada data.</p>}
        </div>
      </div>
    </div>
  );
}
