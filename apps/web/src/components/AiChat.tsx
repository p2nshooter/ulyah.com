"use client";

import { useEffect, useRef, useState } from "react";
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
  servedBy?: string | null;
}

const SPECIALIST_KEYS = ["master", "quran", "hadits", "fiqih", "sirah", "akhlak"] as const;

/**
 * Landing / Tanya AI chat — free for everyone, no paid tier, no member
 * account required. Every answer comes from Orchestra Core's RAG "answer
 * worker" (POST /ai/ask): it retrieves relevant ayat, tafsir, hadits, kisah
 * profiles, kitab, and amalan from Ulyah's own database and answers from
 * that context, citing each source with a real link into the matching page
 * on ulyah.com — clicking a reference takes the visitor straight there.
 * Guests get a generous rate limit (15/hour, anti-abuse only, not a paywall)
 * and are nudged toward donor registration when it's hit, purely as a way to
 * lift the limit — never a gate on the chat itself.
 */
// Chat history survives refreshes and link-outs (clicking a cited source and
// coming back previously wiped the whole conversation — the #1 complaint
// about this chat). Session-scoped on purpose: closing the browser ends the
// conversation, which is the honest lifetime for an anonymous chat.
const CHAT_STORE_KEY = "ulyah:ai-chat:v1";

export function AiChat({ locale }: { locale: string }) {
  const t = aiChatLabels(locale);
  const site = TENANT.siteName;
  const [specialist, setSpecialist] = useState("master");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore the conversation once on mount, then persist on every change.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHAT_STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { msgs: Msg[]; specialist: string };
        if (Array.isArray(saved.msgs) && saved.msgs.length) {
          setMsgs(saved.msgs);
          if (saved.specialist) setSpecialist(saved.specialist);
          requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
        }
      }
    } catch {
      /* corrupt/unavailable storage — start fresh */
    }
  }, []);
  useEffect(() => {
    try {
      if (msgs.length) sessionStorage.setItem(CHAT_STORE_KEY, JSON.stringify({ msgs, specialist }));
    } catch {
      /* storage full/unavailable — chat still works, just won't survive refresh */
    }
  }, [msgs, specialist]);

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
        site,
      });
      setMsgs((m) => [...m, { role: "ai", text: r.answer, sources: r.sources, servedBy: r.servedBy }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("429") || /limit/i.test(msg)) {
        setNotice(t.rateLimited);
      } else {
        setNotice(t.error);
      }
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SPECIALIST_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setSpecialist(key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              specialist === key
                ? "border-accent bg-accent/15 text-accent"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
            }`}
          >
            {t.specialists[key]}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="max-h-[50vh] min-h-[160px] space-y-3 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
      >
        {msgs.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-secondary)]">{t.intro(site)}</p>
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
                  <p className="font-medium">{t.sourcesFrom(site)}</p>
                  {m.sources.map((s, j) =>
                    s.url ? (
                      // New tab, so following a citation never leaves (or
                      // used to: wiped) the running conversation.
                      <Link
                        key={j}
                        href={`/${locale}${s.url}`}
                        target="_blank"
                        rel="noopener"
                        className="block text-accent hover:underline"
                      >
                        [{j + 1}] {s.ref} ↗
                      </Link>
                    ) : (
                      <p key={j}>
                        <span className="font-medium text-accent">[{j + 1}] {s.ref}</span> — {s.text.slice(0, 120)}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <p className="text-left text-xs text-[var(--color-text-secondary)]">{t.answering}</p>}
      </div>

      {notice && <p className="rounded-lg bg-warning/10 p-2 text-center text-xs text-warning">{notice}</p>}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t.placeholder}
          className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {t.send}
        </button>
      </div>

      <p className="text-center text-[11px] text-[var(--color-text-secondary)]">{t.disclaimer(site)}</p>

    </div>
  );
}
