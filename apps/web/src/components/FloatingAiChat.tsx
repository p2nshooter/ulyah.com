"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";

interface Source {
  kind: "ayah" | "hadits";
  ref: string;
  text: string;
  url?: string;
}
interface Msg {
  role: "user" | "ai";
  text: string;
  sources?: Source[];
}

// The Master (Penasihat Utama) knows every field & routes; the rest are
// focused specialists that refer to one another when out of their field.
const SPECIALISTS: { key: string; label: string }[] = [
  { key: "master", label: "✦ Penasihat" },
  { key: "quran", label: "Qur'an" },
  { key: "hadits", label: "Hadits" },
  { key: "fiqih", label: "Fiqih" },
  { key: "sirah", label: "Sirah" },
  { key: "akhlak", label: "Akhlak" },
];

/**
 * Floating AI chat — a small bubble on the bottom-right of EVERY page (mounted
 * once in the locale layout, like the radio toggle on the bottom-left). Tap to
 * open a compact chat panel; every answer comes from Orchestra Core's grounded
 * answer worker (/ai/ask). Deliberately language-neutral chrome + gentle,
 * elegant fallbacks — never a blunt "not available".
 */
export function FloatingAiChat({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [specialist, setSpecialist] = useState("master");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const r = await api.post<{ answer: string; sources: Source[] }>("/ai/ask", {
        question: q,
        locale,
        specialist: specialist || undefined,
      });
      setMsgs((m) => [...m, { role: "ai", text: r.answer, sources: r.sources }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const gentle =
        msg.includes("429") || /limit/i.test(msg)
          ? "Anda telah bertanya cukup banyak untuk saat ini 🌷. Silakan bergabung sebagai anggota untuk melanjutkan tanpa batas."
          : "Mohon maaf, layanan ini sedang kami siapkan dengan sebaik-baiknya. Silakan mencoba kembali sesaat lagi, insyaAllah.";
      setMsgs((m) => [...m, { role: "ai", text: gentle }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }
  }

  return (
    <>
      {/* Bubble toggle — bottom-right, opposite the radio on/off */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup Tanya AI" : "Buka Tanya AI"}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-accent/40 bg-[#0B3D2E] px-4 py-3 text-sm font-medium text-[#f4efe3] shadow-lg backdrop-blur transition hover:bg-[#0d4d3a]"
      >
        <span aria-hidden className="text-lg">{open ? "✕" : "💬"}</span>
        {!open && <span className="hidden sm:inline">Tanya AI</span>}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-40 flex max-h-[70vh] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[#0B3D2E] px-3 py-2 text-[#f4efe3]">
            <span aria-hidden>💬</span>
            <span className="text-sm font-medium">Tanya AI Islami</span>
          </div>

          <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] p-2">
            {SPECIALISTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSpecialist(s.key)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  specialist === s.key ? "border-accent bg-accent/15 text-accent" : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {msgs.length === 0 && (
              <p className="text-center text-xs text-[var(--color-text-secondary)]">
                Silakan bertanya tentang Al-Qur'an, hadits, fiqih, atau adab. Jawaban dirangkai dari khazanah ULYAH.COM
                dengan penuh adab. 🌙
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={`inline-block max-w-[92%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-accent/15" : "bg-black/5"}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-[var(--color-border)] pt-1.5 text-[10px] text-[var(--color-text-secondary)]">
                      <p className="font-medium">Rujukan:</p>
                      {m.sources.slice(0, 3).map((s, j) =>
                        s.url ? (
                          <a
                            key={j}
                            href={`/${locale}${s.url}`}
                            className="block truncate text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                          >
                            [{j + 1}] {s.ref} ↗
                          </a>
                        ) : (
                          <p key={j} className="text-accent">[{j + 1}] {s.ref}</p>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <p className="text-xs text-[var(--color-text-secondary)]">Sedang merangkai jawaban…</p>}
          </div>

          <div className="flex gap-2 border-t border-[var(--color-border)] p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Tulis pertanyaan…"
              className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
            <button onClick={send} disabled={busy || !input.trim()} className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
