"use client";

/** Tiny inline trend line for stat cards. */
export function Sparkline({
  data,
  stroke = "#6366F1",
  width = 96,
  height = 28,
}: {
  data: number[];
  stroke?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const stepX = width / Math.max(data.length - 1, 1);
  const d = data
    .map((v, i) => {
      const x = i * stepX;
      const y = (1 - (v - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
