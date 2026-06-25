import { test } from "node:test";
import assert from "node:assert/strict";
import {
  channelMetrics,
  blended,
  bestChannel,
  type ChannelRow,
} from "../features/growth-os/analytics/utils/calc.ts";

const row = (over: Partial<ChannelRow>): ChannelRow => ({
  id: "x",
  channel: "C",
  spend: 0,
  leads: 0,
  customers: 0,
  revenue: 0,
  ...over,
});

test("per-channel metrics compute correctly", () => {
  const m = channelMetrics(row({ spend: 1000, leads: 100, customers: 20, revenue: 4000 }));
  assert.equal(m.cpl, 10);
  assert.equal(m.cac, 50);
  assert.equal(m.conversion, 20);
  assert.equal(m.roas, 4);
  assert.equal(m.profit, 3000);
});

test("guarded division never yields NaN/Infinity", () => {
  const m = channelMetrics(row({ spend: 0, leads: 0, customers: 0, revenue: 0 }));
  assert.equal(m.cac, 0);
  assert.equal(m.roas, 0);
  assert.equal(m.conversion, 0);
  assert.ok(Number.isFinite(m.cac) && Number.isFinite(m.roas));
});

test("blended sums first then divides", () => {
  const b = blended([
    row({ spend: 1000, leads: 100, customers: 20, revenue: 4000 }),
    row({ spend: 1000, leads: 50, customers: 5, revenue: 1000 }),
  ]);
  assert.equal(b.spend, 2000);
  assert.equal(b.customers, 25);
  assert.equal(b.cac, 80); // 2000 / 25, not avg of 50 & 200
  assert.equal(b.revenue, 5000);
  assert.equal(b.roas, 2.5);
  assert.equal(b.roi, 150); // (5000-2000)/2000
});

test("best channel ranks by ROAS", () => {
  const best = bestChannel([
    row({ channel: "A", spend: 1000, revenue: 2000 }),
    row({ channel: "B", spend: 1000, revenue: 5000 }),
  ]);
  assert.equal(best?.channel, "B");
});

test("best channel is null when no spend", () => {
  assert.equal(bestChannel([row({ spend: 0 }), row({ spend: 0 })]), null);
});
