"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Config {
  slotId: string;
  clientId: string;
}

/**
 * "Iklan" admin panel. The site currently runs with ZERO ads — no AdSense,
 * no Adsterra, no third-party ad script of any kind on any page. The only
 * thing kept is the AdSense account-verification meta tag (embedded in every
 * page's <head>, see layout.tsx) so the AdSense account can still be
 * reviewed. This panel just confirms that, and lets the owner jot down the
 * eventual ad-unit id for a developer to wire back up later, if the owner
 * ever decides to bring ads back — it does not turn anything on by itself.
 */
export function AdsenseTab() {
  const [config, setConfig] = useState<Config | null>(null);
  const [slotId, setSlotId] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<Config>("/admin/adsense-config").then((cfg) => {
      setConfig(cfg);
      setSlotId(cfg.slotId);
    }).catch(() => {});
  }, []);

  async function save() {
    await api.post("/admin/adsense-config", { slotId });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!config) return <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-success/30 bg-success/5 p-4">
        <p className="font-heading text-base">✓ Situs ini bebas iklan</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Tidak ada iklan yang ditampilkan di halaman manapun — bukan AdSense, bukan Adsterra, bukan jaringan iklan
          pihak ketiga lainnya. Pengunjung tidak melihat iklan apa pun.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">Verifikasi AdSense</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Publisher ID: <code className="rounded bg-black/10 px-1">{config.clientId}</code> tetap tertanam di meta
          tag setiap halaman agar proses tinjauan/ACC akun AdSense bisa berjalan. Ini tidak menampilkan iklan apa pun
          — hanya membuktikan kepemilikan domain ke Google.
        </p>
        <div className="mt-3 space-y-2">
          <label className="block text-sm">
            <span className="text-[var(--color-text-secondary)]">
              Catatan ID unit iklan (untuk nanti, jika iklan ingin diaktifkan lagi setelah ACC)
            </span>
            <input
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              placeholder="mis. 1234567890"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <p className="text-[11px] italic text-[var(--color-text-secondary)]/70">
            Mengisi ini TIDAK menampilkan iklan — hanya menyimpan catatan. Menampilkan iklan lagi butuh perubahan kode
            oleh developer.
          </p>
          <button
            onClick={save}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white dark:bg-accent dark:text-primary"
          >
            {saved ? "Tersimpan ✓" : "Simpan catatan"}
          </button>
        </div>
      </section>
    </div>
  );
}
