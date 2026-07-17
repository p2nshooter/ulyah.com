"use client";

/** A genuine scrolling news-ticker of short reminders — content is
 * duplicated once so the loop point is invisible (see .marquee-track /
 * @keyframes marquee-scroll in globals.css). */
export function NasehatTicker({ items }: { items: string[] }) {
  const joined = items.join("   ✦   ") + "   ✦   ";
  const durationSeconds = Math.max(24, items.join(" ").length / 6);

  return (
    <div className="overflow-hidden whitespace-nowrap border-t border-white/10 py-2">
      <div
        className="marquee-track inline-flex w-max text-xs text-[#f4efe3]/80"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        <span className="pr-0">{joined}</span>
        <span aria-hidden>{joined}</span>
      </div>
    </div>
  );
}
