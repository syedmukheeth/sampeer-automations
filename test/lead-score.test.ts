import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pipelineSummary,
  weightedValue,
  STAGE_PROBABILITY,
} from "../features/sales-os/lead-pipeline/utils/score.ts";
import type { Lead } from "../features/sales-os/lead-pipeline/utils/schema.ts";

const lead = (over: Partial<Lead>): Lead => ({
  id: "x",
  name: "Lead",
  company: "",
  email: "",
  source: "",
  owner: "",
  stage: "new",
  value: 0,
  nextStep: "",
  lastActivity: "",
  notes: "",
  createdAt: "2026-01-01",
  ...over,
});

test("weighted value applies stage probability", () => {
  assert.equal(weightedValue(lead({ stage: "qualified", value: 1000 })), 500);
  assert.equal(weightedValue(lead({ stage: "proposal", value: 1000 })), 700);
  assert.equal(weightedValue(lead({ stage: "new", value: 1000 })), 100);
});

test("summary separates open, won, lost", () => {
  const s = pipelineSummary([
    lead({ stage: "new", value: 1000 }),
    lead({ stage: "proposal", value: 2000 }),
    lead({ stage: "won", value: 5000 }),
    lead({ stage: "lost", value: 3000 }),
  ]);
  assert.equal(s.open, 2);
  assert.equal(s.openValue, 3000);
  assert.equal(s.weighted, 100 + 1400); // new 10% + proposal 70%
  assert.equal(s.won, 1);
  assert.equal(s.wonValue, 5000);
  assert.equal(s.lost, 1);
});

test("win rate is closed outcomes only", () => {
  const s = pipelineSummary([
    lead({ stage: "won" }),
    lead({ stage: "won" }),
    lead({ stage: "lost" }),
    lead({ stage: "new" }), // open, ignored in win rate
  ]);
  assert.equal(s.winRate, 67); // 2 / 3
});

test("no closed deals yields zero win rate", () => {
  const s = pipelineSummary([lead({ stage: "new" }), lead({ stage: "contacted" })]);
  assert.equal(s.winRate, 0);
  assert.equal(s.won, 0);
});

test("probabilities are bounded 0..1", () => {
  for (const p of Object.values(STAGE_PROBABILITY)) {
    assert.ok(p >= 0 && p <= 1);
  }
});
