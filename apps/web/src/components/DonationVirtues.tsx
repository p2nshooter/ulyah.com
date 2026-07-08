"use client";

import { useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { NarrateButton } from "@/components/NarrateButton";

/**
 * A premium, voice-narrated reflection on the rewards of supporting the syiar,
 * grounded in the Qur'an (2:261, 2:274) and authentic hadith (Muslim). The
 * narration reads the passages in the current UI language and highlights the
 * one being spoken — the StoryReader treatment applied to the donation page.
 */
export function DonationVirtues({ dict, locale }: { dict: Dictionary; locale: string }) {
  const [active, setActive] = useState<number | null>(null);
  const virtues = [dict.donation.virtue1, dict.donation.virtue2, dict.donation.virtue3];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#06251b] px-6 py-12 text-[#f4efe3] sm:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(184,137,43,0.7), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="font-arabic text-3xl text-accent">﴾ وَمَا تُنْفِقُوا مِنْ خَيْرٍ يُوَفَّ إِلَيْكُمْ ﴿</p>
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl">{dict.donation.virtuesTitle}</h2>
        <p className="mt-2 text-sm text-[#f4efe3]/75">{dict.donation.virtuesSubtitle}</p>

        <div className="mt-8 space-y-3 text-left">
          {virtues.map((v, i) => (
            <blockquote
              key={i}
              className={`rounded-2xl border p-5 text-[15px] leading-relaxed transition ${
                active === i
                  ? "border-accent bg-accent/15 shadow-[inset_0_-2px_0_#B8892B]"
                  : "border-[#f4efe3]/12 bg-white/[0.03]"
              }`}
            >
              {v}
            </blockquote>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <NarrateButton
            paragraphs={virtues}
            listenLabel={dict.donation.virtuesListen}
            stopLabel={dict.syukur.stop}
            lang={locale}
            onSentence={(idx) => {
              // Map the flat sentence index back to a paragraph for highlighting.
              if (idx === null) {
                setActive(null);
                return;
              }
              let count = 0;
              for (let p = 0; p < virtues.length; p++) {
                const sentences = virtues[p]!.split(/(?<=[.!?؟。！])\s+|\n+/).filter((s) => s.trim().length > 1).length || 1;
                if (idx < count + sentences) {
                  setActive(p);
                  return;
                }
                count += sentences;
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
