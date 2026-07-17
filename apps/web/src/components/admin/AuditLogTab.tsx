"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface LogRow {
  id: number;
  action: string;
  actor: string;
  detail: string | null;
  created_at: string;
}

export function AuditLogTab() {
  const [log, setLog] = useState<LogRow[]>([]);

  useEffect(() => {
    api.get<{ log: LogRow[] }>("/admin/audit-log").then((r) => setLog(r.log));
  }, []);

  return (
    <div className="space-y-2">
      {log.map((entry) => (
        <div key={entry.id} className="rounded-lg border border-[var(--color-border)] p-3 text-xs">
          <div className="flex justify-between">
            <span className="font-medium">{entry.action}</span>
            <span className="text-[var(--color-text-secondary)]">{new Date(entry.created_at).toLocaleString()}</span>
          </div>
          <p className="mt-1 text-[var(--color-text-secondary)]">{entry.actor}</p>
        </div>
      ))}
    </div>
  );
}
