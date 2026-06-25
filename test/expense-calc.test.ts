import { test } from "node:test";
import assert from "node:assert/strict";
import { computeExpense, round2, periodDays } from "../features/business-os/expense-tracker/utils/calc.ts";
import type { Category, ExpenseInput } from "../features/business-os/expense-tracker/utils/schema.ts";

function base(): ExpenseInput {
  return {
    report: { name: "June", periodStart: "2026-06-01", periodEnd: "2026-06-30", currency: "USD" },
    transactions: [
      { date: "2026-06-01", description: "Figma", amount: -15 },
      { date: "2026-06-03", description: "AWS", amount: -85 },
      { date: "2026-06-10", description: "Client payment", amount: 2500 },
      { date: "2026-06-15", description: "Figma", amount: -15 },
    ],
  } as ExpenseInput;
}

const cats: Category[] = ["Software & SaaS", "Software & SaaS", "Income", "Software & SaaS"];

test("round2 avoids float drift", () => {
  assert.equal(round2(0.1 + 0.2), 0.3);
});

test("periodDays is inclusive", () => {
  assert.equal(periodDays("2026-06-01", "2026-06-30"), 30);
  assert.equal(periodDays("2026-06-01", "2026-06-01"), 1);
});

test("spend, income, and net", () => {
  const r = computeExpense(base(), cats);
  assert.equal(r.summary.totalSpend, 115); // 15 + 85 + 15
  assert.equal(r.summary.totalIncome, 2500);
  assert.equal(r.summary.net, 2385); // 2500 - 115
  assert.equal(r.summary.txnCount, 4);
});

test("category sums equal total spend (income excluded from spend)", () => {
  const r = computeExpense(base(), cats);
  const sum = r.byCategory.reduce((a, c) => a + c.total, 0);
  assert.equal(round2(sum), r.summary.totalSpend);
  const software = r.byCategory.find((c) => c.category === "Software & SaaS");
  assert.equal(software?.total, 115);
});

test("burn rate uses inclusive period days", () => {
  const r = computeExpense(base(), cats);
  assert.equal(r.summary.periodDays, 30);
  assert.equal(r.summary.dailyBurn, round2(115 / 30));
  assert.equal(r.summary.monthlyBurn, round2(r.summary.dailyBurn * 30));
});

test("top merchants aggregate by name, outflows only", () => {
  const r = computeExpense(base(), cats);
  const figma = r.topMerchants.find((m) => m.merchant === "Figma");
  assert.equal(figma?.total, 30); // two 15s
  assert.equal(figma?.count, 2);
  // Income row never appears as a merchant spend.
  assert.equal(r.topMerchants.some((m) => m.merchant === "Client payment"), false);
});

test("missing category falls back to Other", () => {
  const r = computeExpense(base(), ["Software & SaaS"] as Category[]);
  const other = r.byCategory.find((c) => c.category === "Other");
  assert.ok(other && other.count >= 1);
});
