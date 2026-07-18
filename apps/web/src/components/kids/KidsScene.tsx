"use client";

import { useMemo } from "react";
import { KidsCharacter, type KidsAction, type KidsVariant } from "@/components/kids/KidsCharacter";

function PalmTree({ style, delay }: { style: React.CSSProperties; delay: string }) {
  return (
    <svg className="kids-palm absolute bottom-[100px]" style={{ ...style, animationDelay: delay }} viewBox="0 0 90 260" width="90" height="260">
      <rect x="40" y="120" width="10" height="140" fill="#3a2c1a" />
      <g fill="#2f8558">
        <path d="M45 120 Q10 90 5 50 Q40 70 45 120 Z" />
        <path d="M45 120 Q80 90 85 50 Q50 70 45 120 Z" />
        <path d="M45 120 Q20 100 0 90 Q35 95 45 120 Z" />
        <path d="M45 120 Q70 100 90 90 Q55 95 45 120 Z" />
        <path d="M45 120 Q45 70 30 30 Q55 60 45 120 Z" />
        <path d="M45 120 Q45 70 60 30 Q35 60 45 120 Z" />
      </g>
    </svg>
  );
}

/**
 * The scene backdrop for one Kisah Anak story beat — night sky with a moon
 * and twinkling stars, or a bright day with sun and drifting clouds, framing
 * the animated character. Pure CSS/SVG, no images.
 */
export function KidsScene({
  timeOfDay,
  variant,
  action,
}: {
  timeOfDay: "day" | "night";
  variant: KidsVariant;
  action: KidsAction;
}) {
  const stars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 55}%`,
        size: `${2 + Math.random() * 3}px`,
        delay: `${Math.random() * 3}s`,
        key: i,
      })),
    []
  );

  const isNight = timeOfDay === "night";

  return (
    <div
      className={`relative aspect-[3/2] w-full overflow-hidden rounded-[2rem] shadow-2xl ${
        isNight
          ? "bg-gradient-to-b from-[#1a5f45] via-[var(--color-primary)] to-[var(--color-primary-dark)]"
          : "bg-gradient-to-b from-[#7ec8e3] via-[#a9dfc7] to-[#e8f5df]"
      }`}
    >
      {isNight ? (
        <>
          {stars.map((s) => (
            <span
              key={s.key}
              className="kids-star absolute"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
            />
          ))}
          <div
            className="kids-moon absolute right-[8%] top-[8%] h-[14%] w-[14%] rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 35%, #FFF6DE, #F4D97B 60%, #d8b453 100%)",
              boxShadow: "0 0 40px 10px rgba(244,217,123,0.35)",
            }}
          />
        </>
      ) : (
        <>
          <div
            className="kids-sun absolute right-[8%] top-[8%] h-[16%] w-[16%] rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 35%, #FFFDE7, #FFD65C 60%, #F4A93B 100%)",
              boxShadow: "0 0 50px 14px rgba(255,214,92,0.4)",
            }}
          />
          <svg className="kids-cloud absolute left-[10%] top-[15%] opacity-90" width="120" height="50" viewBox="0 0 120 50">
            <ellipse cx="30" cy="30" rx="28" ry="18" fill="#fff" />
            <ellipse cx="60" cy="22" rx="34" ry="22" fill="#fff" />
            <ellipse cx="90" cy="30" rx="26" ry="16" fill="#fff" />
          </svg>
          <svg
            className="kids-cloud absolute left-[55%] top-[8%] opacity-80"
            style={{ animationDelay: "-9s", animationDuration: "22s" }}
            width="90"
            height="40"
            viewBox="0 0 120 50"
          >
            <ellipse cx="30" cy="30" rx="28" ry="18" fill="#fff" />
            <ellipse cx="60" cy="22" rx="34" ry="22" fill="#fff" />
            <ellipse cx="90" cy="30" rx="26" ry="16" fill="#fff" />
          </svg>
        </>
      )}

      <PalmTree style={{ left: "6%" }} delay="0s" />
      <PalmTree style={{ right: "6%" }} delay="-2s" />

      <div
        className={`absolute inset-x-0 bottom-0 h-[18%] ${
          isNight
            ? "bg-gradient-to-b from-[#2c6b4d] to-[#123d2b]"
            : "bg-gradient-to-b from-[#8fcf7a] to-[#5aa855]"
        }`}
      />

      <div className="absolute bottom-[15%] left-1/2 w-[45%] -translate-x-1/2 sm:w-[38%]">
        <KidsCharacter variant={variant} action={action} />
      </div>
    </div>
  );
}
