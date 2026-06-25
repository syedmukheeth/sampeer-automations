import type { Competitor, ThreatLevel } from "./schema";

/**
 * Competitor radar math - pure, deterministic TypeScript. No LLM. Threat levels
 * map to weights; the radar summary rolls them into counts and an average threat
 * index. Explainable and unit-tested.
 */

export const THREAT_WEIGHT: Record<ThreatLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export const THREAT_LABEL: Record<ThreatLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface RadarSummary {
  total: number;
  high: number;
  medium: number;
  low: number;
  threatIndex: number; // 0-100, average threat normalized
}

export function radarSummary(competitors: Competitor[]): RadarSummary {
  const total = competitors.length;
  const high = competitors.filter((c) => c.threat === "high").length;
  const medium = competitors.filter((c) => c.threat === "medium").length;
  const low = competitors.filter((c) => c.threat === "low").length;

  const avg = total > 0
    ? competitors.reduce((a, c) => a + THREAT_WEIGHT[c.threat], 0) / total
    : 0;
  // normalize 1..3 -> 0..100
  const threatIndex = Math.round(((avg - 1) / 2) * 100);

  return { total, high, medium, low, threatIndex: Math.max(0, threatIndex) };
}

/** Sort by threat (high first), preserving input order within a level. */
export function sortByThreat(competitors: Competitor[]): Competitor[] {
  return competitors
    .slice()
    .sort((a, b) => THREAT_WEIGHT[b.threat] - THREAT_WEIGHT[a.threat]);
}
