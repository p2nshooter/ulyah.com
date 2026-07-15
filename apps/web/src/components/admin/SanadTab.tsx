"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Link {
  link_id: number;
  sanad_chain_id: number;
  position: number;
  perawi_id: number;
  name_ar: string;
}
interface QueueItem {
  chain_id: number;
  hadits_id: number;
  extraction_method: string;
  text_ar: string;
  text_id: string | null;
  source: string;
  collection: string | null;
  links: Link[];
}
interface Stats {
  pending: number;
  published: number;
  rejected: number;
  perawi: number;
}

/**
 * Review queue for the Pohon Sanad (isnad chain tree) feature. Every chain
 * lands here first — a heuristic Arabic-text parser extracted it from the
 * hadith's own isnad text (never fabricated, see
 * scripts/extract-sanad-chains.ts), but a parser can mis-segment a name, and
 * misrepresenting a hadith's authentication chain is a real scholarly-
 * accuracy concern. Nothing reaches the public tree until approved here.
 */
export function SanadTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  function load() {
    api.get<Stats>("/admin/sanad/stats").then(setStats).catch(() => {});
    api
      .get<{ queue: QueueItem[] }>("/admin/sanad/queue")
      .then((d) => setQueue(d.queue))
      .catch(() => setQueue([]));
  }
  useEffect(load, []);

  async function fixLink(linkId: number, name: string) {
    await api.put(`/admin/sanad/link/${linkId}`, { name });
  }

  async function approve(chainId: number) {
    setBusy(chainId);
    try {
      await api.post(`/admin/sanad/${chainId}/approve`, {});
      load();
    } finally {
      setBusy(null);
    }
  }

  async function reject(chainId: number) {
    setBusy(chainId);
    try {
      await api.post(`/admin/sanad/${chainId}/reject`, {});
      load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/40 bg-[var(--color-card)] p-4">
        <p className="font-heading text-lg">🌳 Pohon Sanad — Review Queue</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Setiap rantai sanad diekstrak dari teks isnad hadits itu sendiri (bukan karangan — lihat
          scripts/extract-sanad-chains.ts), tapi parser teks Arab bisa saja salah memisahkan nama. Periksa tiap
          rantai di bawah, perbaiki nama yang keliru, baru Setujui. Tidak akan tampil di halaman publik sebelum
          disetujui.
        </p>
        {stats && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Menunggu review" value={stats.pending} highlight />
            <StatTile label="Tayang publik" value={stats.published} />
            <StatTile label="Ditolak" value={stats.rejected} />
            <StatTile label="Total perawi" value={stats.perawi} />
          </div>
        )}
      </div>

      {queue === null && <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>}
      {queue && queue.length === 0 && (
        <p className="text-sm text-[var(--color-text-secondary)]">Tidak ada rantai sanad menunggu review 🎉</p>
      )}

      <div className="space-y-4">
        {queue?.map((item) => (
          <div key={item.chain_id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Hadits #{item.hadits_id} · {item.source} {item.collection ? `(${item.collection})` : ""}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => reject(item.chain_id)}
                  disabled={busy === item.chain_id}
                  className="rounded-full border border-danger/40 px-3 py-1.5 text-xs text-danger disabled:opacity-50"
                >
                  ✕ Tolak
                </button>
                <button
                  onClick={() => approve(item.chain_id)}
                  disabled={busy === item.chain_id}
                  className="rounded-full bg-success px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  ✓ Setujui
                </button>
              </div>
            </div>

            <p dir="rtl" className="font-arabic mt-3 text-lg leading-relaxed text-[var(--color-text-primary)]">
              {item.text_ar}
            </p>
            {item.text_id && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.text_id}</p>}

            <div className="mt-3">
              <p className="text-xs font-semibold text-accent">Rantai perawi terdeteksi (perbaiki jika keliru):</p>
              <ol className="mt-2 space-y-1.5">
                {item.links.map((l, i) => (
                  <li key={l.link_id} className="flex items-center gap-2 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-accent/30 text-[10px] text-accent">
                      {i + 1}
                    </span>
                    <input
                      defaultValue={l.name_ar}
                      onChange={(e) => setEditing((prev) => ({ ...prev, [l.link_id]: e.target.value }))}
                      className="flex-1 rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                      dir="rtl"
                    />
                    {editing[l.link_id] !== undefined && editing[l.link_id] !== l.name_ar && (
                      <button
                        onClick={async () => {
                          await fixLink(l.link_id, editing[l.link_id]!);
                          load();
                        }}
                        className="shrink-0 rounded-full border border-accent/40 px-2 py-1 text-[10px] text-accent"
                      >
                        Simpan
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${highlight ? "border-accent/40 bg-accent/10" : "border-[var(--color-border)]"}`}>
      <p className={`font-heading text-xl ${highlight ? "text-accent" : ""}`}>{value.toLocaleString("id")}</p>
      <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
