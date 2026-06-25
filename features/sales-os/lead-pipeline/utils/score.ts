import type { Lead, LeadStage } from "./schema";

/**
 * Pipeline math - pure, deterministic TypeScript. No LLM. Each open stage has a
 * win probability; weighted value = deal value x probability. Win rate is closed
 * outcomes only. Everything here is explainable and unit-tested.
 */

export const STAGE_PROBABILITY: Record<LeadStage, number> = {
  new: 0.1,
  contacted: 0.25,
  qualified: 0.5,
  proposal: 0.7,
  won: 1,
  lost: 0,
};

export const STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

const OPEN_STAGES: LeadStage[] = ["new", "contacted", "qualified", "proposal"];
export const isOpen = (stage: LeadStage) => OPEN_STAGES.includes(stage);

export function weightedValue(lead: Lead): number {
  return Math.round(lead.value * STAGE_PROBABILITY[lead.stage]);
}

export interface PipelineSummary {
  total: number;
  open: number;
  openValue: number; // raw value of open deals
  weighted: number; // probability-weighted open value (forecast)
  won: number;
  wonValue: number;
  lost: number;
  winRate: number; // won / (won + lost), 0-100
}

export function pipelineSummary(leads: Lead[]): PipelineSummary {
  let open = 0;
  let openValue = 0;
  let weighted = 0;
  let won = 0;
  let wonValue = 0;
  let lost = 0;

  for (const l of leads) {
    if (l.stage === "won") {
      won += 1;
      wonValue += l.value;
    } else if (l.stage === "lost") {
      lost += 1;
    } else {
      open += 1;
      openValue += l.value;
      weighted += weightedValue(l);
    }
  }

  const closed = won + lost;
  const winRate = closed > 0 ? Math.round((won / closed) * 100) : 0;

  return {
    total: leads.length,
    open,
    openValue: Math.round(openValue),
    weighted: Math.round(weighted),
    won,
    wonValue: Math.round(wonValue),
    lost,
    winRate,
  };
}
