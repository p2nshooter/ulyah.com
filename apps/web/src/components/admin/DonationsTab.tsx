"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DonationRow {
  id: number;
  provider: string;
  type: string;
  amount: number | null;
  currency: string | null;
  status: string;
  donor_name: string | null;
  created_at: string;
}

export function DonationsTab() {
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [stats, setStats] = useState<{ total_fiat: number; total_crypto: number; total_api_key_donations: number } | null>(null);

  useEffect(() => {
    api
      .get<{ donations: DonationRow[]; stats: typeof stats }>("/admin/donations")
      .then((r) => {
        setDonations(r.donations);
        setStats(r.stats);
      });
  }, []);

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-center">
            <p className="font-heading text-lg">${stats.total_fiat}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Fiat</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-center">
            <p className="font-heading text-lg">${stats.total_crypto}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Crypto</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-center">
            <p className="font-heading text-lg">{stats.total_api_key_donations}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">API Keys</p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/5 text-[var(--color-text-secondary)]">
            <tr>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-2">{d.provider}</td>
                <td className="px-3 py-2">{d.type}</td>
                <td className="px-3 py-2">{d.amount ? `${d.amount} ${d.currency ?? ""}` : "—"}</td>
                <td className="px-3 py-2">{d.status}</td>
                <td className="px-3 py-2">{new Date(d.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
