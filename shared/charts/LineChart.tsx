"use client";

import { useId } from "react";
import { motion } from "framer-motion";

/**
 * Lightweight inline-SVG area/line chart — no chart dependency.
 * Pass an array of numbers; renders a smooth animated gradient area.
 */
export function LineChart({
  data,
  labels,
  height = 200,
  stroke = "#6366F1",
}: {
  data: number[];
  labels?: string[];
  height?: number;
  stroke?: string;
}) {
  const gid = useId();
  const w = 600;
  const h = height;
  const pad = 16;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const stepX = (w - pad * 2) / Math.max(data.length - 1, 1);

  const pts = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={pad}
            x2={w - pad}
            y1={pad + g * (h - pad * 2)}
            y2={pad + g * (h - pad * 2)}
            stroke="#E2E8F0"
            strokeDasharray="3 4"
          />
        ))}
        <path d={area} fill={`url(#fill-${gid})`} />
        <motion.path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill="#fff" stroke={stroke} strokeWidth={2} />
        ))}
      </svg>
      {labels && (
        <div className="mt-2 flex justify-between px-2 text-[11px] text-muted">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
