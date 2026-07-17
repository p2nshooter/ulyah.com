"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ClientRow {
  id: number;
  email: string;
  name: string | null;
  donation_count: number;
  keys_donated: number;
  created_at: string;
}

export function ClientsTab() {
  const [clients, setClients] = useState<ClientRow[]>([]);

  useEffect(() => {
    api.get<{ clients: ClientRow[] }>("/admin/clients").then((r) => setClients(r.clients));
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
      <table className="w-full text-left text-xs">
        <thead className="bg-black/5 text-[var(--color-text-secondary)]">
          <tr>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Donations</th>
            <th className="px-3 py-2">Keys donated</th>
            <th className="px-3 py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-t border-[var(--color-border)]">
              <td className="px-3 py-2">{c.email}</td>
              <td className="px-3 py-2">{c.name ?? "—"}</td>
              <td className="px-3 py-2">{c.donation_count}</td>
              <td className="px-3 py-2">{c.keys_donated}</td>
              <td className="px-3 py-2">{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
