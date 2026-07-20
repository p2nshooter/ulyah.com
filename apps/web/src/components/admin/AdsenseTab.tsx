"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Config {
  clientId: string;
  slots: Record<string, string>;
  sites: Record<string, boolean>;
}

const PLACEMENTS = ["in_article", "list", "footer", "sidebar"];

const SITE_LABELS: { key: string; label: string; group: "ulyah" | "axto" }[] = [
  { key: "ulyah", label: "ulyah.com", group: "ulyah" },
  { key: "1fr", label: "1fr.fr", group: "ulyah" },
  { key: "tilawa", label: "tilawa.de", group: "ulyah" },
  { key: "dawa", label: "dawa.es", group: "ulyah" },
  { key: "axto-io", label: "axto.io", group: "axto" },
  { key: "axto-dev", label: "axto.dev", group: "axto" },
  { key: "axto-us", label: "axto.us", group: "axto" },
];

/**
 * Central ad control for the WHOLE network (4 ulyah tenants + 3 AXTO sites).
 * Every site reads /content/ad-config from api.ulyah.com, so what is set here
 * governs all of them. Default: every site OFF (no ad anywhere). Turn a site
 * ON to preview positions (dashed boxes) even before approval; paste the real
 * ad-unit id and every ON site instantly serves live ads. Ads never appear in
 * any admin portal.
 */
export function AdsenseTab() {
  const [config, setConfig] = useState<Config | null>(null);
  const [masterId, setMasterId] = useState("");
  const [sites, setSites] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<Config>("/admin/adsense-config")
      .then((cfg) => {
        setConfig(cfg);
        // The master id = whatever the placements currently share (in_article
        // is the canonical one).
        setMasterId(cfg.slots?.in_article ?? "");
        setSites(cfg.sites ?? {});
      })
      .catch(() => {});
  }, []);

  async function save() {
    setBusy(true);
    const id = masterId.replace(/[^0-9]/g, "").slice(0, 20);
    const slots: Record<string, string> = {};
    for (const p of PLACEMENTS) slots[p] = id; // one responsive unit drives all
    try {
      const next = await api.post<Config>("/admin/adsense-config", { slots, sites });
      setConfig(next);
      setSites(next.sites);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setBusy(false);
    }
  }

  function toggle(key: string) {
    setSites((s) => ({ ...s, [key]: !s[key] }));
  }
  function setAll(v: boolean) {
    setSites((s) => {
      const n = { ...s };
      for (const { key } of SITE_LABELS) n[key] = v;
      return n;
    });
  }

  if (!config) return <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>;

  const hasRealId = !!masterId.replace(/[^0-9]/g, "");
  const onCount = SITE_LABELS.filter(({ key }) => sites[key]).length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">Kontrol Iklan Jaringan</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Satu tempat mengatur iklan untuk <b>seluruh situs</b> (ulyah.com, 1fr.fr, tilawa.de, dawa.es, axto.io,
          axto.dev, axto.us). Bawaan: semua <b>mati</b>. Nyalakan situs untuk melihat posisi (kotak putus-putus)
          walau belum ada ID; isi ID unit iklan asli, lalu semua situs yang aktif langsung menayangkan iklan asli.
          Iklan tidak pernah muncul di portal admin.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">1 · ID Unit Iklan AdSense</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Publisher: <code className="rounded bg-black/10 px-1">{config.clientId}</code>. Tempel ID unit iklan
          responsif (angka saja) — satu ID ini otomatis dipakai semua posisi (in-article, daftar, footer, sidebar).
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={masterId}
            onChange={(e) => setMasterId(e.target.value)}
            placeholder="mis. 1234567890"
            inputMode="numeric"
            className="w-52 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          />
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${hasRealId ? "bg-success/15 text-success" : "bg-black/10 text-[var(--color-text-secondary)]"}`}
          >
            {hasRealId ? "● Iklan asli aktif di situs yang ON" : "○ Belum ada ID — situs ON tampil pratinjau posisi"}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-heading text-base">2 · Tampilkan / Sembunyikan per Situs</p>
          <div className="flex gap-2 text-xs">
            <button onClick={() => setAll(true)} className="rounded-full border border-[var(--color-border)] px-3 py-1 hover:border-accent">
              Semua ON
            </button>
            <button onClick={() => setAll(false)} className="rounded-full border border-[var(--color-border)] px-3 py-1 hover:border-accent">
              Semua OFF
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SITE_LABELS.map(({ key, label, group }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                sites[key] ? "border-accent bg-accent/10" : "border-[var(--color-border)]"
              }`}
            >
              <span>
                {group === "axto" ? "🛰️" : "🕌"} {label}
              </span>
              <span className={sites[key] ? "font-medium text-accent" : "text-[var(--color-text-secondary)]"}>
                {sites[key] ? "ON" : "OFF"}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]/70">{onCount} situs aktif.</p>
      </section>

      <button
        onClick={save}
        disabled={busy}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm text-white disabled:opacity-60 dark:bg-accent dark:text-primary"
      >
        {saved ? "Tersimpan ✓ — berlaku ≤1 menit di semua situs" : busy ? "Menyimpan…" : "Simpan & terapkan ke semua situs"}
      </button>
    </div>
  );
}
