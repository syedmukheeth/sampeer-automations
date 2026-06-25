"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@shared/lib/cn";

export type AutomationTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export type AutomationStat = { label: string; value: string };

export function AutomationPageLayout({
  name,
  description,
  icon: Icon,
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
      <div className="overflow-hidden rounded-3xl border border-line/80 bg-panel/90 shadow-soft backdrop-blur-sm">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand">
              <Icon className="h-7 w-7" strokeWidth={1.9} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {eyebrow}
              </p>
              <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">{name}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
            </div>
          </div>
          <div className="flex items-start justify-start lg:justify-end">
            <StatusBadge tone={status} dot />
          </div>
        </div>

        {stats.length > 0 && (
          <div className="grid border-t border-line/80 bg-stone-50/55 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-b border-line/70 px-6 py-4 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
                <div className="tabular text-xl font-semibold tracking-tight text-ink">{s.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-panel/70 p-1 shadow-soft">
        {tabs.map((t) => {
          const on = t.id === current?.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200",
                on ? "text-white" : "text-muted hover:bg-stone-100 hover:text-ink",
              )}
            >
              {on && (
                <motion.span
                  layoutId="automation-tab-pill"
                  className="absolute inset-0 rounded-xl bg-brand"
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="mt-6"
        >
          {current?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
