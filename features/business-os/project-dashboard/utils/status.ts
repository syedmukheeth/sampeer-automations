import type { Project } from "./schema";

export type ProjectFlag = "delivered" | "overdue" | "at_risk" | "on_track";

export const FLAG_LABEL: Record<ProjectFlag, string> = {
  delivered: "Delivered",
  overdue: "Overdue",
  at_risk: "At risk",
  on_track: "On track",
};

/**
 * Deterministic delivery-health flag. Compares actual progress against the
 * progress you'd expect given how far through the schedule the project is.
 * No LLM - explainable and testable.
 */
export function projectFlag(p: Project, now: Date = new Date()): ProjectFlag {
  if (p.status === "delivered" || p.progress >= 100) return "delivered";

  const due = p.dueDate ? new Date(p.dueDate).getTime() : NaN;
  if (!Number.isNaN(due) && now.getTime() > due) return "overdue";

  const start = p.startDate ? new Date(p.startDate).getTime() : NaN;
  if (!Number.isNaN(start) && !Number.isNaN(due) && due > start) {
    const expected = clamp(((now.getTime() - start) / (due - start)) * 100, 0, 100);
    if (p.progress < expected - 20) return "at_risk";
  }
  return "on_track";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
