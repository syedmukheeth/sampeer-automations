"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export function AutomationCard({
  name,
  description,
  href,
  status,
  tags,
  icon,
  action,
  index = 0,
}: {
  name: string;
  description: string;
  href: string;
  status: "live" | "soon";
  tags: string[];
  accent: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  index?: number;
}) {
  const live = status === "live";

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={live ? { y: -3 } : undefined}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-panel/92 p-5 shadow-soft backdrop-blur-sm transition duration-200 hover:border-brand-500/40 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-stone-50 text-brand">
          {icon}
        </div>
        <StatusBadge tone={live ? "live" : "soon"} dot />
      </div>

      <h3 className="mt-5 text-base font-semibold tracking-tight text-ink">{name}</h3>
      <p className="mt-1 flex-1 text-sm leading-6 text-muted">{description}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-line bg-stone-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            {t}
          </span>
        ))}
      </div>

      {(live || action) && (
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line/70 pt-4">
          {live ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Open
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
    </motion.div>
  );

  return live ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    <div className="h-full cursor-not-allowed opacity-70">{inner}</div>
  );
}
