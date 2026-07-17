"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MiniBarChart, countryName, countryFlag } from "./MiniBarChart";
import { TenantAnalyticsPanel } from "./TenantAnalyticsPanel";

interface Bucket {
  bucket: string;
  n: number;
}
interface CountryRow {
  country: string;
  n: number;
}
interface CertRow {
  cert_no: string;
  sender_name: string;
  country: string | null;
  amount: number | null;
  currency: string | null;
  reviewed_at: string;
}
interface Analytics {
  visitors: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    allTime: number;
    daily: Bucket[];
    weekly: Bucket[];
    monthly: Bucket[];
    yearly: Bucket[];
    countries: CountryRow[];
  };
  members: { total: number; countries: CountryRow[] };
  certificates: { total: number; countries: CountryRow[]; recent: CertRow[] };
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
      <p className="font-heading text-2xl text-accent">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}

function CountryList({ rows, total }: { rows: CountryRow[]; total: number }) {
  return (
    <div className="space-y-1.5">
      {rows.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">—</p>}
      {rows.map((r) => (
        <div key={r.country} className="flex items-center gap-2 text-xs">
          <span className="w-6">{countryFlag(r.country)}</span>
          <span className="w-28 truncate">{countryName(r.country)}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${total ? Math.round((r.n / total) * 100) : 0}%` }}
            />
          </div>
          <span className="w-10 text-right tabular-nums text-[var(--color-text-secondary)]">{r.n}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [tf, setTf] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");

  useEffect(() => {
    api.get<Analytics>("/admin/analytics").then(setData).catch(() => {});
  }, []);

  if (!data) return <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>;

  const chart = data.visitors[tf].map((b) => ({ label: b.bucket.slice(5) || b.bucket, value: b.n }));

  return (
    <div className="space-y-6">
      {/* Per-site (tenant) visitor + install analytics — all sites on ulyah's
          admin, own-site only on a sibling admin. */}
      <TenantAnalyticsPanel />

      {/* Visitor overview (combined across all sites) */}
      <section>
        <p className="mb-2 font-heading text-base">Pengunjung</p>
        <div className="grid grid-cols-2 gap-3 desktop:grid-cols-5">
          <Stat label="Hari ini" value={data.visitors.today} />
          <Stat label="Minggu ini" value={data.visitors.thisWeek} />
          <Stat label="Bulan ini" value={data.visitors.thisMonth} />
          <Stat label="Tahun ini" value={data.visitors.thisYear} />
          <Stat label="Sepanjang waktu" value={data.visitors.allTime} />
        </div>

        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="mb-2 flex gap-1.5">
            {(["daily", "weekly", "monthly", "yearly"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTf(k)}
                className={`rounded-full px-2.5 py-1 text-[11px] ${tf === k ? "bg-accent text-white" : "border border-[var(--color-border)]"}`}
              >
                {k === "daily" ? "Harian" : k === "weekly" ? "Mingguan" : k === "monthly" ? "Bulanan" : "Tahunan"}
              </button>
            ))}
          </div>
          <MiniBarChart data={chart} />
        </div>
      </section>

      {/* Visitor countries */}
      <section>
        <p className="mb-2 font-heading text-base">Negara Pengunjung</p>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <CountryList rows={data.visitors.countries} total={data.visitors.allTime} />
        </div>
      </section>

      {/* Members */}
      <section>
        <p className="mb-2 font-heading text-base">Member Terdaftar</p>
        <div className="grid gap-3 desktop:grid-cols-[160px_1fr]">
          <Stat label="Total member" value={data.members.total} />
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <CountryList rows={data.members.countries} total={data.members.total} />
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section>
        <p className="mb-2 font-heading text-base">Sertifikat Sedekah Diterbitkan</p>
        <div className="grid gap-3 desktop:grid-cols-[160px_1fr]">
          <Stat label="Total sertifikat" value={data.certificates.total} />
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <CountryList rows={data.certificates.countries} total={data.certificates.total} />
          </div>
        </div>
        <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[var(--color-card)] text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-3 py-2">No. Sertifikat</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Negara</th>
                <th className="px-3 py-2">Jumlah</th>
                <th className="px-3 py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {data.certificates.recent.map((r) => (
                <tr key={r.cert_no} className="border-t border-[var(--color-border)]">
                  <td className="px-3 py-2 font-medium text-accent">{r.cert_no}</td>
                  <td className="px-3 py-2">{r.sender_name}</td>
                  <td className="px-3 py-2">
                    {countryFlag(r.country ?? "")} {countryName(r.country ?? "")}
                  </td>
                  <td className="px-3 py-2">{r.amount ? `${r.amount} ${r.currency ?? ""}` : "—"}</td>
                  <td className="px-3 py-2">{new Date(r.reviewed_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.certificates.recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-[var(--color-text-secondary)]">
                    Belum ada sertifikat diterbitkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
