"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { StatusBadge } from "./StatusBadge";

export type AutomationTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export type AutomationStat = { label: string; value: string };

/**
 * Consistent scaffold every automation page composes: branded header with
 * status + at-a-glance stats, then tabbed sections (Overview · Configuration ·
 * Execution History · Logs · Documentation). New automations reuse this so the
 * whole platform feels like one product.
 */
export function AutomationPageLayout({
  name,
  description,
  icon: Icon,
  accent = "from-indigo-500 to-violet-600",
  status = "live",
  stats = [],
  tabs,
  eyebrow = "Automation",
}: {
  name: string;
  description: string;
  icon: LucideIcon;
  accent?: string;
  status?: "live" | "soon";
  stats?: AutomationStat[];
  tabs: AutomationTab[];
  eyebrow?: string;
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      {/* Header */}
      <div className="rounded-3xl border border-line bg-panel p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
                accent,
              )}
            >
              <Icon className="h-7 w-7" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {eyebrow}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-ink">{name}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
            </div>
          </div>
          <StatusBadge tone={status} dot />
        </div>

        {stats.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-canvas px-4 py-3">
                <div className="text-lg font-bold text-ink">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => {
          const on = t.id === current?.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
                on ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {t.label}
              {on && (
                <motion.span
                  layoutId="automation-tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          {current?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
