"use client";

import { motion } from "framer-motion";
import { cn } from "@shared/lib/cn";
import { fadeUp } from "@shared/lib/motion";

export type StatCardProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  delta?: { value: string; positive?: boolean };
  accent?: string;
  hint?: string;
  index?: number;
};

export function StatCard({
  label,
  value,
  icon,
  delta,
  hint,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={index}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-line/80 bg-panel/92 p-5 shadow-soft transition duration-200 hover:border-brand-500/40 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {label}
        </span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-5 flex items-end gap-2">
        <span className="tabular text-3xl font-semibold tracking-tight text-ink">{value}</span>
        {delta && (
          <span
            className={cn(
              "pb-1 text-xs font-semibold",
              delta.positive === false ? "text-danger" : "text-success",
            )}
          >
            {delta.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </motion.div>
  );
}
