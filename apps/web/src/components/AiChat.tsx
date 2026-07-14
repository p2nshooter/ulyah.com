"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { AdSlot } from "@/components/AdSlot";

interface Source {
  kind: "ayah" | "hadits";
  ref: string;
  text: string;
}
interface Msg {
  role: "user" | "ai";
  text: string;
  sources?: Source[];
  servedBy?: string | null;
}

const SPECIALISTS: { key: string; label: string }[] = [
  { key: "", label: "Umum" },
  { key: "quran", label: "Al-Qur'an" },
  { key: "hadits", label: "Hadits" },
  { key: "fiqih", label: "Fiqih" },
  { key: "sirah", label: "Sirah" },
  { key: "akhlak", label: "Akhlak" },
];

/**
 * Landing / member AI chat — every answer is produced by Orchestra Core's
 * RAG "answer worker" (POST /ai/ask): it retrieves ayat + hadith from Ulyah's
 * own database and answers ONLY from those, with citations. The specialist
 * chips just pick a focused persona for the same grounded worker. Guests are
 * capped (15/hour) server-side and nudged to register when the limit hits —
 * the paid/premium specialist chats build on this exact pipeline.
 */
export function AiChat({ locale }: { locale: string }) {
  const [specialist, setSpecialist] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setNotice(null);
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const r = await api.post<{ answer: string; sources: Source[]; servedBy: string | null }>("/ai/ask", {
        question: q,
        locale,
        specialist: specialist || undefined,
      });
      setMsgs((m) => [...m, { role: "ai", text: r.answer, sources: r.sources, servedBy: r.servedBy }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("429") || /limit/i.test(msg)) {
        setNotice("Batas 15 pertanyaan/jam untuk tamu tercapai. Silakan daftar sebagai member untuk lanjut.");
      } else if (msg.includes("503")) {
        setNotice("AI belum aktif — belum ada API key di pool. (Admin: isi key di Key Pool.)");
      } else {
        setNotice("Maaf, terjadi kendala. Coba lagi sesaat lagi.");
      }
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SPECIALISTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSpecialist(s.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              specialist === s.key
                ? "border-accent bg-accent/15 text-accent"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="max-h-[50vh] min-h-[160px] space-y-3 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
      >
        {msgs.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Tanyakan tentang Al-Qur'an, hadits, fiqih, atau adab. Jawaban diambil dari database ULYAH.COM beserta
            rujukannya.
          </p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user" ? "bg-accent/15 text-[var(--color-text-primary)]" : "bg-black/5"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-[var(--color-border)] pt-2 text-[11px] text-[var(--color-text-secondary)]">
                  {m.sources.map((s, j) => (
                    <p key={j}>
                      <span className="font-medium text-accent">[{j + 1}] {s.ref}</span> — {s.text.slice(0, 120)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <p className="text-left text-xs text-[var(--color-text-secondary)]">AI sedang menjawab…</p>}
      </div>

      {notice && <p className="rounded-lg bg-warning/10 p-2 text-center text-xs text-warning">{notice}</p>}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Tulis pertanyaan…"
          className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Kirim
        </button>
      </div>

      <p className="text-center text-[11px] text-[var(--color-text-secondary)]">
        Jawaban berbasis database ULYAH.COM &amp; bersitasi. Untuk keputusan hukum penting, tetap rujuk ke ustadz
        terpercaya.
      </p>

      <AdSlot position="tanya-bottom" />
    </div>
  );
}
