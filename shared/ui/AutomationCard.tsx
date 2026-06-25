"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { StatusBadge } from "./StatusBadge";

/**
 * Presentational automation card. Receives only serializable props + a
 * pre-rendered `icon` element, so it stays usable from Server Components
 * (registry icon components are functions and cannot cross the RSC boundary).
 */
export function AutomationCard({
  name,
  description,
  href,
  status,
  tags,
  accent,
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={live ? { y: -4 } : undefined}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-line bg-panel p-6 shadow-soft transition-shadow",
        live ? "hover:shadow-lift" : "opacity-75",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
            accent,
          )}
        >
          {icon}
        </div>
        <StatusBadge tone={live ? "live" : "soon"} dot />
      </div>

      <h3 className="mt-4 text-base font-bold text-ink">{name}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
          >
            {t}
          </span>
        ))}
      </div>

      {(live || action) && (
        <div className="mt-5 flex items-center justify-between gap-2">
          {live ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
              Open automation
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
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    <div className="cursor-not-allowed">{inner}</div>
  );
}
