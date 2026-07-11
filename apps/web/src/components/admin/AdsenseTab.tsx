"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Config {
  slotId: string;
  enabled: boolean;
  ecpmUsd: number;
  previewMode: boolean;
  clientId: string;
}
interface Stats {
  impressions: number;
  clicks: number;
  ctr: number;
  ecpmUsd: number;
  estimatedEarningsUsd: number;
  byCountry: { country: string; impressions: number; clicks: number }[];
  byPage: { page: string; impressions: number; clicks: number }[];
  daily: { day: string; impressions: number; clicks: number }[];
}

// A tiny flag emoji from a 2-letter ISO country code (client-side only).
function flag(cc: string): string {
  if (!/^[A-Za-z]{2}$/.test(cc)) return "🌐";
  return String.fromCodePoint(...[...cc.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

/**
 * "AdSense" admin panel: type the ad-unit id ONCE (after AdSense approves the
 * account) and every ad slot across the whole site uses it — no redeploy. Also
 * shows first-party analytics: impressions, an estimated click count + CTR, an
 * earnings ESTIMATE (impressions ÷ 1000 × eCPM), and which countries see/click
 * the ads. Real revenue always lives in the Google AdSense dashboard; this is
 * the in-house approximation.
 */
export function AdsenseTab() {
  const [config, setConfig] = useState<Config | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<Config>("/admin/adsense-config").then(setConfig).catch(() => {});
    api.get<Stats>("/admin/adsense-stats").then(setStats).catch(() => {});
  }, []);

  async function save() {
    if (!config) return;
    await api.post("/admin/adsense-config", {
      slotId: config.slotId,
      enabled: config.enabled,
      ecpmUsd: config.ecpmUsd,
      previewMode: config.previewMode,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!config) return <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>;

  return (
    <div className="space-y-6">
      {/* Config */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">Setelan Iklan AdSense</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Publisher ID: <code className="rounded bg-black/10 px-1">{config.clientId}</code>. Setelah AdSense di-ACC,
          masukkan <b>satu</b> ID unit iklan di sini — semua slot iklan di seluruh situs otomatis memakainya (tanpa
          deploy ulang).
        </p>
        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            <span className="text-[var(--color-text-secondary)]">ID Unit Iklan (ad slot id — angka)</span>
            <input
              value={config.slotId}
              onChange={(e) => setConfig({ ...config, slotId: e.target.value })}
              placeholder="mis. 1234567890"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              />
              Aktifkan iklan
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-text-secondary)]">Perkiraan eCPM (USD/1000 tayang)</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={config.ecpmUsd}
                onChange={(e) => setConfig({ ...config, ecpmUsd: Number(e.target.value) })}
                className="w-24 rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              />
            </label>
          </div>
          <label className="flex items-start gap-2 rounded-lg border border-dashed border-accent/40 bg-accent/[0.04] p-3 text-sm">
            <input
              type="checkbox"
              checked={config.previewMode}
              onChange={(e) => setConfig({ ...config, previewMode: e.target.checked })}
              className="mt-0.5"
            />
            <span>
              <b>Pratinjau posisi slot iklan</b>
              <span className="mt-0.5 block text-[11px] text-[var(--color-text-secondary)]">
                Tampilkan kotak bertanda di setiap lokasi iklan (home, artikel, kitab, Qur'an, dll) agar Bapak bisa
                cek penempatannya sesuai panduan — pengunjung tidak melihatnya. Matikan lagi setelah selesai
                mengecek. (Iklan asli muncul otomatis begitu ID iklan diisi.)
              </span>
            </span>
          </label>
          <button
            onClick={save}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white dark:bg-accent dark:text-primary"
          >
            {saved ? "Tersimpan ✓" : "Simpan"}
          </button>
        </div>
      </section>

      {/* Headline stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile label="Tayang (impresi)" value={stats.impressions.toLocaleString("id")} />
            <Tile label="Klik (estimasi)" value={stats.clicks.toLocaleString("id")} />
            <Tile label="CTR (estimasi)" value={`${(stats.ctr * 100).toFixed(2)}%`} />
            <Tile label="Perk. penghasilan" value={`$${stats.estimatedEarningsUsd.toFixed(2)}`} highlight />
          </div>
          <p className="text-[11px] italic text-[var(--color-text-secondary)]/70">
            Angka klik &amp; penghasilan di sini adalah <b>estimasi internal</b> (impresi dihitung tepat; klik
            diperkirakan karena iklan berada di iframe Google). Angka resmi ada di dashboard Google AdSense.
          </p>

          {/* By country */}
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <p className="font-heading text-base">Negara yang melihat / klik iklan</p>
            {stats.byCountry.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Belum ada data.</p>
            ) : (
              <div className="mt-3 space-y-1.5">
                {stats.byCountry.map((r) => (
                  <div key={r.country} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      {flag(r.country)} {r.country}
                    </span>
                    <span className="text-[var(--color-text-secondary)]">
                      <span className="font-heading text-[var(--color-text-primary)]">
                        {r.impressions.toLocaleString("id")}
                      </span>{" "}
                      tayang · {r.clicks.toLocaleString("id")} klik
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* By page */}
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <p className="font-heading text-base">Halaman dengan iklan terbanyak</p>
            {stats.byPage.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Belum ada data.</p>
            ) : (
              <div className="mt-3 space-y-1.5">
                {stats.byPage.map((r) => (
                  <div key={r.page} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-[var(--color-text-secondary)]">{r.page}</span>
                    <span className="font-heading tabular-nums text-accent">
                      {r.impressions.toLocaleString("id")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-accent/40 bg-accent/10" : "border-[var(--color-border)] bg-[var(--color-card)]"
      }`}
    >
      <p className={`font-heading text-xl ${highlight ? "text-accent" : ""}`}>{value}</p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
