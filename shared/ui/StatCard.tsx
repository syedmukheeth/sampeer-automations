"use client";

import { motion } from "framer-motion";
import { cn } from "@shared/lib/cn";

export type StatCardProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  delta?: { value: string; positive?: boolean };
  accent?: string; // gradient classes for the icon tile
  hint?: string;
  index?: number; // for staggered entrance
};

/** KPI / MetricCard — the building block of the dashboard hero grid. */
export function StatCard({
  label,
  value,
  icon,
  delta,
  accent = "from-indigo-500 to-violet-600",
  hint,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl border border-line bg-panel p-5 shadow-soft transition-shadow hover:shadow-lift"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft",
              accent,
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-ink">{value}</span>
        {delta && (
          <span
            className={cn(
              "text-xs font-semibold",
              delta.positive === false ? "text-rose-600" : "text-emerald-600",
            )}
          >
            {delta.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </motion.div>
  );
}
