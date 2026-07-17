"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface MediaStatus {
  key: string;
  label: string;
  set: boolean;
  updatedAt: string | null;
}

export function MediaTab() {
  const [media, setMedia] = useState<MediaStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<{ media: MediaStatus[] }>("/admin/media")
      .then((r) => setMedia(r.media))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function upload(key: string, file: File) {
    setBusyKey(key);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("file", file);
      await api.upload(`/admin/media/${key}`, form);
      setMessage(`${key} diperbarui.`);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal mengunggah");
    } finally {
      setBusyKey(null);
    }
  }

  async function remove(key: string) {
    setBusyKey(key);
    setMessage(null);
    try {
      await api.del(`/admin/media/${key}`);
      setMessage(`${key} dihapus.`);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal");
    } finally {
      setBusyKey(null);
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--color-text-secondary)]">
        Gambar di sini disimpan di R2 dan tampil langsung di halaman publik (mis. /syukur) — tanpa perlu deploy ulang.
      </p>
      {message && <p className="text-xs text-accent">{message}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {media.map((m) => (
          <div key={m.key} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <p className="text-sm font-medium">{m.label}</p>
            <p className="text-[11px] text-[var(--color-text-secondary)]">{m.key}</p>

            {m.set ? (
              <img
                src={`${api.base}/content/media/${m.key}?t=${m.updatedAt}`}
                alt={m.label}
                className="mt-3 h-32 w-32 rounded-lg object-cover"
              />
            ) : (
              <p className="mt-3 text-xs italic text-[var(--color-text-secondary)]">Belum diunggah.</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busyKey === m.key}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(m.key, file);
                  e.target.value = "";
                }}
                className="min-w-0 flex-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-accent/10 file:px-2 file:py-1 file:text-accent"
              />
              {m.set && (
                <button
                  disabled={busyKey === m.key}
                  onClick={() => remove(m.key)}
                  className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
