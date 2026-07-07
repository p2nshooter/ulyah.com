"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ReviewItem {
  id: number;
  title: string;
  body: string;
  confidence_score: number | null;
  ai_generated: number;
  created_at: string;
}

export function ContentTab() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [scheduleCount, setScheduleCount] = useState(5);

  function load() {
    api.get<{ queue: ReviewItem[] }>("/admin/content/review-queue").then((r) => setQueue(r.queue));
  }
  useEffect(load, []);

  async function approve(id: number) {
    await api.post(`/admin/content/approve/${id}`);
    load();
  }
  async function reject(id: number) {
    await api.post(`/admin/content/reject/${id}`);
    load();
  }
  async function scheduleBatch() {
    await api.post("/admin/content/schedule-batch", { count: scheduleCount });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <input
          type="number"
          min={1}
          max={50}
          value={scheduleCount}
          onChange={(e) => setScheduleCount(Number(e.target.value))}
          className="w-20 rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs"
        />
        <button onClick={scheduleBatch} className="rounded bg-primary px-3 py-1.5 text-xs text-white dark:bg-accent dark:text-primary">
          Schedule new kisah drafts
        </button>
        <span className="text-xs text-[var(--color-text-secondary)]">Zero-hand pipeline picks ayat without a story yet, queues generation_jobs.</span>
      </div>

      {queue.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">No content pending review.</p>}
      {queue.map((item) => (
        <div key={item.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-base">{item.title}</p>
            <span className="text-xs text-[var(--color-text-secondary)]">confidence: {item.confidence_score ?? "—"}</span>
          </div>
          <p className="mt-2 max-h-32 overflow-y-auto text-xs text-[var(--color-text-secondary)]">{item.body}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => approve(item.id)} className="rounded bg-success px-3 py-1 text-xs text-white">Approve</button>
            <button onClick={() => reject(item.id)} className="rounded bg-danger px-3 py-1 text-xs text-white">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
