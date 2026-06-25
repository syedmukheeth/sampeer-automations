import type { Client, ClientStatus } from "./schema";

export type HealthLabel = "Healthy" | "Steady" | "At risk" | "Critical";

export interface Health {
  score: number; // 0-100
  label: HealthLabel;
}

const STATUS_BASE: Record<ClientStatus, number> = {
  active: 70,
  lead: 50,
  paused: 35,
  churned: 10,
};

/**
 * Deterministic relationship-health score. Combines status with recency of the
 * last contact. No LLM - pure heuristic so it's explainable and testable.
 */
export function clientHealth(client: Client, now: Date = new Date()): Health {
  let score = STATUS_BASE[client.status] ?? 40;

  if (client.lastContact) {
    const days = daysSince(client.lastContact, now);
    if (days <= 14) score += 20;
    else if (days <= 30) score += 10;
    else if (days <= 60) score -= 5;
    else score -= 15;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, label: labelFor(score) };
}

function labelFor(score: number): HealthLabel {
  if (score >= 75) return "Healthy";
  if (score >= 50) return "Steady";
  if (score >= 30) return "At risk";
  return "Critical";
}

function daysSince(iso: string, now: Date): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 9999;
  return Math.max(0, Math.round((now.getTime() - t) / 86_400_000));
}
