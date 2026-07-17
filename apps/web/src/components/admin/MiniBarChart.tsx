"use client";

/** Dependency-free SVG bar chart — keeps the admin bundle small. */
export function MiniBarChart({
  data,
  height = 90,
  barColor = "#B8892B",
}: {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
}) {
  if (data.length === 0) return <p className="text-xs text-[var(--color-text-secondary)]">—</p>;
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 100 / data.length;

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-24 w-full">
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 4);
          return (
            <rect
              key={i}
              x={i * barWidth + barWidth * 0.15}
              y={height - h}
              width={barWidth * 0.7}
              height={h}
              fill={barColor}
              rx={0.5}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-[var(--color-text-secondary)]">
        <span>{data[0]?.label}</span>
        {data.length > 1 && <span>{data[data.length - 1]?.label}</span>}
      </div>
    </div>
  );
}

/** ISO 3166-1 alpha-2 -> display name, using the browser's built-in Intl API
 * (zero dependency, always up to date). Falls back to the raw code. */
export function countryName(code: string): string {
  if (!code || code === "??") return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  const A = 0x1f1e6;
  const chars = code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(A + (c.charCodeAt(0) - 65)));
  return chars.join("");
}
