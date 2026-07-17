"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";
import { aiChatLabels } from "@/lib/ai-chat-labels";

interface Source {
  kind: "ayah" | "hadits" | "tafsir" | "kisah" | "kitab" | "amalan";
  ref: string;
  text: string;
  url?: string;
}
interface Msg {
  role: "user" | "ai";
  text: string;
  sources?: Source[];
}

/**
 * Floating AI chat — a small bubble on the bottom-right of EVERY page (mounted
 * once in the locale layout, like the radio toggle on the bottom-left). One
 * unified advisor (not split into tabs) that answers from Orchestra Core's
 * grounded worker (/ai/ask), free for every visitor — no paid tier, no member
 * account. Every reference is a real clickable link straight into the source
 * page on ulyah.com (Qur'an/tafsir, hadits, kisah, kitab, amalan) so a
 * curious visitor can open the source and read it in full.
 */
export function FloatingAiChat({ locale }: { locale: string }) {
  const t = aiChatLabels(locale);
  const site = TENANT.siteName;
  const [open, setOpen] = useState(false);
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
        specialist: "master",
        site,
      });
      setMsgs((m) => [...m, { role: "ai", text: r.answer, sources: r.sources }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const gentle = msg.includes("429") || /limit/i.test(msg) ? t.rateLimited : t.error;
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
        aria-label={open ? t.closeBubble : t.openBubble}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-accent/40 bg-[var(--panel-bg)] px-4 py-3 text-sm font-medium text-[var(--panel-fg)] shadow-lg backdrop-blur transition hover:brightness-125"
      >
        <span aria-hidden className="text-lg">{open ? "✕" : "💬"}</span>
        {!open && <span className="hidden sm:inline">{t.bubble}</span>}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-40 flex max-h-[70vh] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--panel-bg)] px-3 py-2 text-[var(--panel-fg)]">
            <span aria-hidden>💬</span>
            <span className="text-sm font-medium">{t.title}</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {msgs.length === 0 && (
              <p className="text-center text-xs text-[var(--color-text-secondary)]">{t.intro(site)} 🌙</p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={`inline-block max-w-[92%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-accent/15" : "bg-black/5"}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-[var(--color-border)] pt-1.5 text-[10px] text-[var(--color-text-secondary)]">
                      <p className="font-medium">{t.sourcesFrom(site)}</p>
                      {m.sources.map((s, j) =>
                        s.url ? (
                          <Link key={j} href={`/${locale}${s.url}`} className="block text-accent hover:underline">
                            [{j + 1}] {s.ref} →
                          </Link>
                        ) : (
                          <p key={j} className="text-accent">
                            [{j + 1}] {s.ref}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <p className="text-xs text-[var(--color-text-secondary)]">{t.answering}</p>}
          </div>

          <div className="flex gap-2 border-t border-[var(--color-border)] p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t.placeholder}
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
