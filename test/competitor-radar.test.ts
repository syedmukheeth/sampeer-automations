import { test } from "node:test";
import assert from "node:assert/strict";
import { radarSummary, sortByThreat, THREAT_WEIGHT } from "../features/growth-os/competitor-radar/utils/score.ts";
import type { Competitor } from "../features/growth-os/competitor-radar/utils/schema.ts";

const comp = (over: Partial<Competitor>): Competitor => ({
  id: "x",
  name: "Rival",
  url: "",
  pricing: "",
  positioning: "",
  strengths: "",
  weaknesses: "",
  threat: "medium",
  notes: "",
  createdAt: "2026-01-01",
  ...over,
});

test("summary counts each threat level", () => {
  const s = radarSummary([
    comp({ threat: "high" }),
    comp({ threat: "high" }),
    comp({ threat: "medium" }),
    comp({ threat: "low" }),
  ]);
  assert.equal(s.total, 4);
  assert.equal(s.high, 2);
  assert.equal(s.medium, 1);
  assert.equal(s.low, 1);
});

test("threat index normalizes 1..3 weight to 0..100", () => {
  assert.equal(radarSummary([comp({ threat: "low" })]).threatIndex, 0);
  assert.equal(radarSummary([comp({ threat: "high" })]).threatIndex, 100);
  assert.equal(radarSummary([comp({ threat: "medium" })]).threatIndex, 50);
});

test("empty list yields zero index", () => {
  const s = radarSummary([]);
  assert.equal(s.total, 0);
  assert.equal(s.threatIndex, 0);
});

test("sortByThreat puts high first", () => {
  const sorted = sortByThreat([comp({ threat: "low", name: "L" }), comp({ threat: "high", name: "H" })]);
  assert.equal(sorted[0].name, "H");
});

test("threat weights are ordered", () => {
  assert.ok(THREAT_WEIGHT.high > THREAT_WEIGHT.medium);
  assert.ok(THREAT_WEIGHT.medium > THREAT_WEIGHT.low);
});
